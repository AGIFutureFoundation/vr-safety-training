/**
 * Cloudflare Workers relay template for opted-in training-engagement shares.
 *
 * See docs/agent-protocols.md and docs/wallets-and-sharing.md for the whole
 * flow this sits at the end of: WebXR/shared/share-engagement.js builds a
 * bundle (anonymised episode digests + roll-up scores, never a name or free
 * text) and a consent record, and posts both here only when a person presses
 * Share. This worker's job is narrow and stated in full below:
 *
 *   1. Refuse anything with no consent, or a consent that was not actually
 *      opted in.
 *   2. For a wallet-signed consent, recover the address behind its EIP-191
 *      `personal_sign` signature (see ./crypto/) and check it against the
 *      address the consent claims — a plain local (unsigned) consent is
 *      accepted as what it is, an unsigned browser-side record.
 *   3. Check the bundle's declared content hash against its own payload, so
 *      a receipt is never issued for a payload that was altered in transit.
 *   4. Store a receipt — in the KV or R2 binding the deployment configured
 *      (`RECEIPTS_KV` / `RECEIPTS_R2`; storage is best-effort here, since a
 *      deployment may run with neither bound while testing the flow), and
 *      hand back a receipt id either way.
 *   5. Pass through an x402-style payment header when the deployment has
 *      actually configured a fee — this worker states no fee, no token and
 *      no address of its own; see the README for what "configured" means.
 *
 * This file holds no endpoint, chain id, contract address, fee or account of
 * any kind: everything about where and how a deployment runs this relay is
 * `wrangler.toml`'s and the environment bindings' job, read from Cloudflare's
 * own current documentation, not this repository's.
 */

import { recoverAddress } from "./crypto/secp256k1.js";

/**
 * The exact consent statement text WebXR/shared/share-engagement.js's
 * `consentStatement()` builds and a wallet signs. Kept byte-identical here
 * so this worker can rebuild the same text a signature was made over,
 * without trusting anything else the request sent — `tools/check_share.mjs`
 * asserts the two copies never drift apart, the same way
 * `tools/check_competency.mjs` guards shared/competency.js against
 * WebXR/smartcity/js/curricula.js.
 */
export function consentStatement({ licence, at }) {
  return [
    "I opt in to share my anonymised training engagement (episode digests and",
    "roll-up scores only — no name, no free text, no raw identity) with",
    "agent-protocol platforms and their relay, for training software agents",
    "and robots.",
    `Licence: ${licence}.`,
    "This consent is revocable at any time and grants nothing else.",
    `At: ${at}`,
  ].join("\n");
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}
function refuse(reason, status = 400) { return json({ ok: false, reason }, status); }

function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
  return v;
}
function canonicalJson(value) { return JSON.stringify(canonical(value)); }

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a wallet-mode consent's signature. `false` for anything malformed
 * or mismatched; never throws. A "local" consent (no wallet connected when
 * the person opted in) has nothing to verify here — it is accepted as the
 * unsigned, browser-only record it declares itself to be.
 */
export function verifyConsentSignature(consent) {
  if (!consent || consent.mode !== "wallet") return false;
  if (typeof consent.signature !== "string" || typeof consent.address !== "string") return false;
  if (typeof consent.licence !== "string" || typeof consent.at !== "string") return false;
  let recovered;
  try { recovered = recoverAddress(consentStatement({ licence: consent.licence, at: consent.at }), consent.signature); }
  catch (_) { return false; }
  return !!recovered && recovered.toLowerCase() === consent.address.toLowerCase();
}

/**
 * The handler proper, exported directly so `tools/check_share.mjs` can drive
 * it with a plain `Request` and a fake `env` — no Cloudflare runtime needed
 * to test any of the rules above.
 */
export async function handleRequest(request, env = {}) {
  if (request.method !== "POST") return refuse("this endpoint accepts POST only", 405);

  let body;
  try { body = await request.json(); } catch (_) { return refuse("the request body was not valid JSON"); }
  const { bundle, consent } = body ?? {};

  if (!consent || typeof consent !== "object" || consent.optIn !== true) {
    return refuse("no consent was given — this relay stores nothing without one");
  }
  if (consent.mode === "wallet") {
    if (!verifyConsentSignature(consent)) return refuse("the consent signature did not verify against the declared wallet address", 401);
  } else if (consent.mode !== "local") {
    return refuse('consent.mode must be "wallet" or "local"');
  }
  if (!bundle || typeof bundle !== "object" || !bundle.payload || typeof bundle.hash !== "string") {
    return refuse("the bundle is missing its payload or content hash");
  }
  const expectedHash = await sha256Hex(canonicalJson(bundle.payload));
  if (expectedHash !== bundle.hash) return refuse("the bundle's content hash does not match its payload", 400);

  const receiptId = await sha256Hex(`${consent.id ?? ""}:${bundle.hash}:${crypto.randomUUID ? crypto.randomUUID() : Math.random()}`);
  const receipt = {
    id: receiptId,
    receivedAt: new Date().toISOString(),
    consentId: consent.id ?? null,
    licence: consent.licence ?? null,
    contentHash: bundle.hash,
  };

  // Storage is whichever binding the deployment actually configured — see
  // README.md. Neither is required for this handler to answer with a
  // receipt; a deployment testing the flow can run with no binding at all.
  const store = env.RECEIPTS_KV ?? env.RECEIPTS_R2 ?? null;
  if (store && typeof store.put === "function") {
    try { await store.put(`receipts/${receiptId}.json`, JSON.stringify(receipt)); }
    catch (_) { /* storage failing here does not cost the person the receipt this response carries */ }
  }

  // x402-style payment passthrough: only ever echoed when the deployment set
  // PAYMENT_REQUIRED (its own account, fee and token — none of it named or
  // defaulted here) and the caller actually supplied a payment header. No fee
  // is charged, required or invented by this template on its own.
  const headers = {};
  const payment = request.headers.get("x-payment");
  if (payment && env.PAYMENT_REQUIRED) headers["x-payment-response"] = "received";

  return json({ ok: true, receipt }, 200, headers);
}

export default {
  /** The Workers entry point — see wrangler.toml for how a deployment binds
   * env.RECEIPTS_KV / env.RECEIPTS_R2 / env.PAYMENT_REQUIRED. */
  fetch(request, env) { return handleRequest(request, env); },
};
