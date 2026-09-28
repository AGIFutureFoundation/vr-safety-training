/**
 * The wallet-pass routes a Cloudflare Worker imports (console TILL,
 * docs/payments.md §9), in the same contract as workers/payments/handler.mjs:
 *
 *     import passes, { ROUTES as PASS_ROUTES } from "./workers/passes/handler.mjs";
 *
 * POST /api/passes/apple   { level: { id, name }, memberName, membershipId }
 *     → the pass.json + manifest.json bundle, signed when the environment
 *       names the Pass Type certificate, key and WWDR certificate, else
 *       `signed: false` with the note (apple-pass.mjs).
 * POST /api/passes/google  the same body → the Generic class and object, and
 *     the Save to Google Wallet JWT when the environment names a
 *     service-account key file, else `jwt: null` with the note.
 * GET  /api/passes/health  which issuers the environment has configured.
 *
 * No identifier, certificate or key lives here; every one is read from
 * `env`. The membership id in the body is the person's local handle, never
 * an e-mail address or a wallet address (the handler refuses either shape).
 */
import { buildApplePass, signApplePass, validateApplePass } from "./apple-pass.mjs";
import { buildGooglePass, buildGoogleSaveJwt, validateGooglePass } from "./google-pass.mjs";

export const ROUTES = ["/api/passes/apple", "/api/passes/google", "/api/passes/health"];
const MAX_BODY = 8 * 1024;

function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
function refuse(reason, status = 400) { return json({ ok: false, reason }, status); }

/** Which issuers this environment has configured (paths named, not their contents). */
export function issuers(env = {}) {
  return {
    apple: !!(env?.APPLE_PASS_CERT_PATH && env?.APPLE_PASS_KEY_PATH && env?.APPLE_WWDR_CERT_PATH && env?.APPLE_PASS_TYPE_ID && env?.APPLE_TEAM_ID),
    google: !!(env?.GOOGLE_WALLET_SA_KEY_PATH && env?.GOOGLE_WALLET_ISSUER_ID),
  };
}

async function readBody(request) {
  const t = await request.text();
  if (t.length > MAX_BODY) return { error: "body too large" };
  try { return { body: JSON.parse(t) }; } catch (_) { return { error: "body is not JSON" }; }
}

function cleanRequest(b) {
  const level = b?.level && typeof b.level === "object" ? { id: String(b.level.id ?? ""), name: String(b.level.name ?? "") } : null;
  const memberName = String(b?.memberName ?? "").trim();
  const membershipId = String(b?.membershipId ?? "").trim();
  if (!level || !/^[a-z0-9-]{1,40}$/.test(level.id)) return { error: "level.id must be a configured level id" };
  if (!memberName || memberName.length > 40) return { error: "memberName must be 1–40 characters" };
  if (!/^[A-Za-z0-9._-]{4,60}$/.test(membershipId) || membershipId.includes("@") || /^0x[0-9a-fA-F]{40}$/.test(membershipId)) return { error: "membershipId must be the local membership handle" };
  return { level, memberName, membershipId };
}

export default async function handle(request, env = {}) {
  let url;
  try { url = new URL(request.url); } catch (_) { return refuse("bad url", 400); }
  if (url.pathname === "/api/passes/health") return json({ ok: true, routes: ROUTES, issuers: issuers(env) });
  if (url.pathname !== "/api/passes/apple" && url.pathname !== "/api/passes/google") return refuse("no such route", 404);
  if (request.method !== "POST") return refuse("POST only", 405);
  const { body, error } = await readBody(request);
  if (error) return refuse(error, 400);
  const req = cleanRequest(body);
  if (req.error) return refuse(req.error, 422);
  if (url.pathname === "/api/passes/apple") {
    const bundle = await signApplePass(await buildApplePass({ ...req, env }), env);
    if (!bundle.ok) return refuse(bundle.reason, 422);
    const errors = validateApplePass(bundle.pass);
    if (errors.length) return refuse(errors[0], 500);
    return json({ ok: true, kind: "apple", signed: bundle.signed, placeholders: bundle.placeholders, note: bundle.note, files: { "pass.json": bundle.passJson, "manifest.json": bundle.manifestJson, signature: bundle.signature } });
  }
  const bundle = await buildGoogleSaveJwt(buildGooglePass({ ...req, env }), env);
  if (!bundle.ok) return refuse(bundle.reason, 422);
  const errors = validateGooglePass(bundle.genericObject);
  if (errors.length) return refuse(errors[0], 500);
  return json({ ok: true, kind: "google", signed: !!bundle.jwt, placeholders: bundle.placeholders, note: bundle.note, genericClass: bundle.genericClass, genericObject: bundle.genericObject, jwt: bundle.jwt, saveUrl: bundle.saveUrl ?? null });
}
