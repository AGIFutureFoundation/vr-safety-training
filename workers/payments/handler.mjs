/**
 * The payments webhook handler a Cloudflare Worker imports (console TILL,
 * docs/payments.md §5; console EDGE wires it under /api/*):
 *
 *     import handle, { ROUTES } from "./workers/payments/handler.mjs";
 *     export default { fetch: (request, env) => handle(request, env) };
 *
 * Self-contained on purpose: no browser module, no provider SDK, nothing
 * from WebXR/. It does three narrow things and states each in full:
 *
 *   1. Signature check. Every webhook carries `x-pm-signature`, an HMAC-SHA256
 *      of the raw body (hex) under a secret. The secret is read from the
 *      environment only — `env.PAYMENTS_WEBHOOK_SECRET` — never from a file
 *      in this repository. With no secret bound the handler answers 503 and
 *      processes nothing; a bad or missing signature is 401.
 *   2. Idempotent receipts. An event id is applied once: a replay answers
 *      200 with `duplicate: true` and changes nothing. Receipts live in the
 *      KV namespace the deployment binds as `env.PAYMENTS_KV` (get/put), else
 *      in this isolate's memory (fine for a dry run, honest about being
 *      per-isolate).
 *   3. Status. `GET /api/payments/status?receipt=<id>` returns what this
 *      store holds about a receipt or a session, never a claim beyond it.
 *
 * Nothing here names a provider, an amount, a currency or an account; the
 * event shape is the one WebXR/shared/payments.js's mock produces and
 * `pmValidateEvent` accepts (kept in step by tools/check_payments.mjs).
 */

export const ROUTES = ["/api/payments/webhook", "/api/payments/status", "/api/payments/health"];
export const SIGNATURE_HEADER = "x-pm-signature";
export const EVENT_TYPES = ["checkout.completed", "checkout.failed", "payment.refunded"];
const MAX_BODY = 64 * 1024;

const memory = new Map();

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
}
function refuse(reason, status = 400) { return json({ ok: false, reason }, status); }

/** The store: the bound KV namespace, else this isolate's memory. */
function storeOf(env) {
  const kv = env?.PAYMENTS_KV;
  if (kv && typeof kv.get === "function" && typeof kv.put === "function") {
    return { kind: "kv", get: async (k) => { const v = await kv.get(k); return v == null ? null : JSON.parse(v); }, put: async (k, v) => kv.put(k, JSON.stringify(v)) };
  }
  return { kind: "memory", get: async (k) => (memory.has(k) ? memory.get(k) : null), put: async (k, v) => { memory.set(k, v); } };
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

/** HMAC-SHA256 of `text` under `secret`, as lower-case hex (WebCrypto, so it runs in a Worker and in Node). */
export async function sign(secret, text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

/** Constant-time equality of two hex strings. */
function sameHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length || !a.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** What is wrong with an event (the same rules as payments.js's pmValidateEvent). */
export function validateEvent(ev) {
  const errors = [];
  if (!ev || typeof ev !== "object") return ["not an object"];
  if (!/^evt-[A-Za-z0-9._-]{4,80}$/.test(String(ev.id ?? ""))) errors.push("id must read evt-…");
  if (!EVENT_TYPES.includes(ev.type)) errors.push(`type must be one of ${EVENT_TYPES.join(", ")}`);
  if (!/^(cs|sess)-[A-Za-z0-9._-]{4,80}$/.test(String(ev.sessionId ?? ""))) errors.push("sessionId must name a checkout session");
  if (ev.amountMinor != null && !(Number.isInteger(ev.amountMinor) && ev.amountMinor >= 0)) errors.push("amountMinor must be a non-negative integer or null");
  if (ev.seats != null && !(Number.isInteger(ev.seats) && ev.seats >= 1 && ev.seats <= 1000)) errors.push("seats must be 1–1000");
  if (ev.currency != null && !/^[A-Z]{3}$/.test(String(ev.currency))) errors.push("currency must be a three-letter code");
  if (typeof ev.at !== "string" || Number.isNaN(new Date(ev.at).getTime())) errors.push("at must be an ISO date");
  return errors;
}

/** Apply one verified event to the store; a seen id is a duplicate and changes nothing. */
export async function applyEvent(ev, store) {
  const seen = await store.get(`event:${ev.id}`);
  if (seen) return { ok: true, duplicate: true, receipt: seen.receiptId ? await store.get(`receipt:${seen.receiptId}`) : null };
  let receipt = null;
  if (ev.type === "checkout.completed") {
    receipt = {
      id: `r-${ev.id.slice(4)}`, eventId: ev.id, sessionId: ev.sessionId, state: "paid", at: ev.at,
      seats: ev.seats ?? null, amountMinor: Number.isInteger(ev.amountMinor) ? ev.amountMinor : null, currency: ev.currency ?? null,
      planId: typeof ev.planId === "string" ? ev.planId.slice(0, 40) : null, cohortId: typeof ev.cohortId === "string" ? ev.cohortId.slice(0, 60) : null, orgId: typeof ev.orgId === "string" ? ev.orgId.slice(0, 60) : null,
    };
    await store.put(`receipt:${receipt.id}`, receipt);
    await store.put(`session:${ev.sessionId}`, { id: ev.sessionId, state: "completed", receiptId: receipt.id, at: ev.at });
  } else if (ev.type === "checkout.failed") {
    await store.put(`session:${ev.sessionId}`, { id: ev.sessionId, state: "failed", at: ev.at, reason: typeof ev.reason === "string" ? ev.reason.slice(0, 120) : "declined by the provider" });
  } else {
    const sess = await store.get(`session:${ev.sessionId}`);
    receipt = sess?.receiptId ? await store.get(`receipt:${sess.receiptId}`) : null;
    if (!receipt) return { ok: false, reason: "no receipt for that session" };
    receipt.state = "refunded"; receipt.refundedAt = ev.at;
    await store.put(`receipt:${receipt.id}`, receipt);
  }
  await store.put(`event:${ev.id}`, { id: ev.id, type: ev.type, at: ev.at, receiptId: receipt?.id ?? null });
  return { ok: true, duplicate: false, receipt };
}

/** The Worker's fetch handler for the payments routes; anything else is 404. */
export default async function handle(request, env = {}) {
  let url;
  try { url = new URL(request.url); } catch (_) { return refuse("bad url", 400); }
  const store = storeOf(env);
  if (url.pathname === "/api/payments/health") {
    return json({ ok: true, routes: ROUTES, secret: env?.PAYMENTS_WEBHOOK_SECRET ? "bound" : "not bound", store: store.kind });
  }
  if (url.pathname === "/api/payments/status") {
    if (request.method !== "GET") return refuse("GET only", 405);
    const id = url.searchParams.get("receipt") ?? url.searchParams.get("session") ?? "";
    if (!/^(r|cs|sess)-[A-Za-z0-9._-]{4,90}$/.test(id)) return refuse("name a receipt (r-…) or a session (cs-…)", 400);
    const receipt = id.startsWith("r-") ? await store.get(`receipt:${id}`) : null;
    const session = id.startsWith("r-") ? null : await store.get(`session:${id}`);
    if (!receipt && !session) return refuse("unknown receipt or session", 404);
    return json({ ok: true, kind: receipt ? "receipt" : "session", state: (receipt ?? session).state, receipt: receipt ?? (session.receiptId ? await store.get(`receipt:${session.receiptId}`) : null), session });
  }
  if (url.pathname === "/api/payments/webhook") {
    if (request.method !== "POST") return refuse("POST only", 405);
    const secret = env?.PAYMENTS_WEBHOOK_SECRET;
    if (typeof secret !== "string" || secret.length < 16) return refuse("the webhook secret is not bound in this environment; nothing is processed", 503);
    const body = await request.text();
    if (body.length > MAX_BODY) return refuse("body too large", 413);
    const given = request.headers.get(SIGNATURE_HEADER) ?? "";
    const expected = await sign(secret, body);
    if (!sameHex(given.toLowerCase().replace(/^sha256=/, ""), expected)) return refuse("bad signature", 401);
    let ev = null;
    try { ev = JSON.parse(body); } catch (_) { return refuse("body is not JSON", 400); }
    const errors = validateEvent(ev);
    if (errors.length) return refuse(errors[0], 422);
    const r = await applyEvent(ev, store);
    if (!r.ok) return refuse(r.reason, 409);
    return json({ ok: true, duplicate: r.duplicate, receiptId: r.receipt?.id ?? null, state: r.receipt?.state ?? null });
  }
  return refuse("no such route", 404);
}
