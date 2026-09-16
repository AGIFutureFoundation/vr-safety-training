#!/usr/bin/env node
/**
 * LTI 1.3 launch relay — the one server this network needs, and the smallest
 * one that does the job. A static page cannot verify a signed launch; this
 * relay does, then hands the learner to the app as the launch context the
 * apps already understand (learner / learner_id / learner_home).
 *
 * Flow (IMS LTI 1.3 / OIDC third-party-initiated login):
 *   1. GET  /lti/login   platform → relay: iss, login_hint, target_link_uri,
 *                        lti_message_hint. The relay answers with a redirect to
 *                        the platform's auth endpoint carrying state + nonce.
 *   2. POST /lti/launch  platform → relay: id_token (JWT, RS256), state. The
 *                        relay verifies signature (platform JWKS), iss, aud,
 *                        exp/iat, nonce (single use), the LTI message type and
 *                        version, then 302s the browser into the app:
 *                        <APP_URL>?sim=<custom.sim>&learner=<name>&learner_id=<sub>&learner_home=<RELAY_ORIGIN>
 *   3. GET  /.well-known/jwks.json  an (empty) JWKS so a platform that insists
 *                        on registering a tool public key has an endpoint;
 *                        this relay never signs anything, it only verifies.
 *
 * Configure with environment variables (or pass a config object to
 * createRelay() from tests):
 *   LTI_ISSUER        platform issuer, e.g. https://lms.example.org
 *   LTI_CLIENT_ID     the client id the platform assigned this tool
 *   LTI_AUTH_URL      platform OIDC auth endpoint
 *   LTI_JWKS_URL      platform JWKS endpoint
 *   APP_URL           the app to launch into, e.g. https://sims.example.org/smartcity/index.html
 *   RELAY_ORIGIN      this relay's public https origin (becomes learner_home)
 *   PORT              default 8787
 *
 *     LTI_ISSUER=... LTI_CLIENT_ID=... LTI_AUTH_URL=... LTI_JWKS_URL=... \
 *     APP_URL=... RELAY_ORIGIN=https://relay.example.org node tools/lti_relay.mjs
 *
 * Deploy it behind TLS. The app side is unchanged: identity.js reads the
 * launch params, scrubs them, and everything downstream (records, LRS,
 * credentials, the platform channel) is attributable to `sub` at `iss`.
 */
import http from "node:http";
import crypto from "node:crypto";

const LTI_CLAIM = "https://purl.imsglobal.org/spec/lti/claim/";
const b64url = (buf) => Buffer.from(buf).toString("base64url");
const fromB64url = (s) => Buffer.from(s, "base64url");

/** Decode and verify an RS256 JWT against a set of JWKs. Returns the payload. */
export function verifyJwt(token, jwks, { issuer, audience, now = Date.now() / 1000, skew = 60 } = {}) {
  const parts = String(token).split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const header = JSON.parse(fromB64url(parts[0]).toString("utf8"));
  const payload = JSON.parse(fromB64url(parts[1]).toString("utf8"));
  if (header.alg !== "RS256") throw new Error(`unsupported alg ${header.alg}`);
  const jwk = (jwks.keys ?? []).find((k) => k.kid === header.kid && (k.alg ?? "RS256") === "RS256") ?? (jwks.keys ?? [])[0];
  if (!jwk) throw new Error("no key for kid");
  const key = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const ok = crypto.verify("sha256", Buffer.from(`${parts[0]}.${parts[1]}`), { key, padding: crypto.constants.RSA_PKCS1_PADDING }, fromB64url(parts[2]));
  if (!ok) throw new Error("bad signature");
  if (issuer && payload.iss !== issuer) throw new Error("wrong issuer");
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (audience && !aud.includes(audience)) throw new Error("wrong audience");
  if (typeof payload.exp !== "number" || payload.exp + skew < now) throw new Error("token expired");
  if (typeof payload.iat === "number" && payload.iat - skew > now) throw new Error("token from the future");
  return payload;
}

/** Sign an RS256 JWT — used by the self-test to stand in for a platform. */
export function signJwt(payload, privateKey, kid) {
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid }));
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.sign("sha256", Buffer.from(`${head}.${body}`), { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING });
  return `${head}.${body}.${b64url(sig)}`;
}

/** The launch context an LTI payload maps to, or a thrown reason. */
export function launchContext(payload, { relayOrigin, appUrl }) {
  if (payload[`${LTI_CLAIM}message_type`] !== "LtiResourceLinkRequest") throw new Error("not a resource link launch");
  if (payload[`${LTI_CLAIM}version`] !== "1.3.0") throw new Error("not LTI 1.3");
  if (!payload.sub) throw new Error("no subject");
  const custom = payload[`${LTI_CLAIM}custom`] ?? {};
  const name = payload.name ?? [payload.given_name, payload.family_name].filter(Boolean).join(" ") ?? payload.sub;
  const url = new URL(appUrl);
  const sim = custom.sim ?? custom.room ?? custom.station;
  if (sim && /^[a-z0-9:-]{1,60}$/i.test(String(sim))) url.searchParams.set(url.pathname.includes("/trades/") ? "room" : "sim", String(sim));
  url.searchParams.set("learner", String(name).slice(0, 60));
  url.searchParams.set("learner_id", String(payload.sub).slice(0, 120));
  url.searchParams.set("learner_home", relayOrigin);
  if (custom.lrs_endpoint) url.searchParams.set("lrs_endpoint", String(custom.lrs_endpoint));
  return { url: url.href, sub: payload.sub, name, iss: payload.iss, deployment: payload[`${LTI_CLAIM}deployment_id`] ?? null, sim: sim ?? null };
}

export function createRelay(cfg) {
  const config = {
    issuer: cfg.issuer ?? process.env.LTI_ISSUER, clientId: cfg.clientId ?? process.env.LTI_CLIENT_ID,
    authUrl: cfg.authUrl ?? process.env.LTI_AUTH_URL, jwksUrl: cfg.jwksUrl ?? process.env.LTI_JWKS_URL,
    appUrl: cfg.appUrl ?? process.env.APP_URL, relayOrigin: cfg.relayOrigin ?? process.env.RELAY_ORIGIN,
    fetchJwks: cfg.fetchJwks ?? (async () => (await fetch(config.jwksUrl)).json()),
    now: cfg.now ?? (() => Date.now() / 1000),
    log: cfg.log ?? ((line) => console.log(line)),
  };
  for (const k of ["issuer", "clientId", "authUrl", "appUrl", "relayOrigin"]) if (!config[k]) throw new Error(`lti relay: missing ${k}`);
  // state → { nonce, at }: single use, ten minutes.
  const pending = new Map();
  const usedNonces = new Set();
  const sweep = () => { const cutoff = config.now() - 600; for (const [s, v] of pending) if (v.at < cutoff) pending.delete(s); };

  async function readBody(req) {
    return new Promise((resolve) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 65536) req.destroy(); }); req.on("end", () => resolve(b)); });
  }
  const html = (res, status, text) => { res.writeHead(status, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }); res.end(`<!doctype html><meta charset="utf-8"><title>SmartCiti.X launch</title><p>${text}</p>`); };

  async function handle(req, res) {
    const url = new URL(req.url, config.relayOrigin);
    if (req.method === "GET" && url.pathname === "/.well-known/jwks.json") {
      res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ keys: [] })); return;
    }
    if (url.pathname === "/lti/login" && (req.method === "GET" || req.method === "POST")) {
      const params = req.method === "GET" ? url.searchParams : new URLSearchParams(await readBody(req));
      if (params.get("iss") !== config.issuer) return html(res, 400, "Unknown platform.");
      const loginHint = params.get("login_hint"); if (!loginHint) return html(res, 400, "Missing login_hint.");
      sweep();
      const state = b64url(crypto.randomBytes(24)), nonce = b64url(crypto.randomBytes(24));
      pending.set(state, { nonce, at: config.now() });
      const auth = new URL(config.authUrl);
      const q = { scope: "openid", response_type: "id_token", response_mode: "form_post", prompt: "none",
        client_id: config.clientId, redirect_uri: `${config.relayOrigin}/lti/launch`, login_hint: loginHint, state, nonce };
      if (params.get("lti_message_hint")) q.lti_message_hint = params.get("lti_message_hint");
      for (const [k, v] of Object.entries(q)) auth.searchParams.set(k, v);
      res.writeHead(302, { Location: auth.href, "Cache-Control": "no-store" }); res.end(); return;
    }
    if (url.pathname === "/lti/launch" && req.method === "POST") {
      const form = new URLSearchParams(await readBody(req));
      const state = form.get("state"), token = form.get("id_token");
      const entry = state && pending.get(state);
      if (!entry) return html(res, 400, "Unknown or expired launch state.");
      pending.delete(state);
      try {
        const jwks = await config.fetchJwks();
        const payload = verifyJwt(token, jwks, { issuer: config.issuer, audience: config.clientId, now: config.now() });
        if (payload.nonce !== entry.nonce) throw new Error("nonce mismatch");
        if (usedNonces.has(payload.nonce)) throw new Error("nonce replayed");
        usedNonces.add(payload.nonce);
        const ctx = launchContext(payload, { relayOrigin: config.relayOrigin, appUrl: config.appUrl });
        config.log(`launch ok: sub=${ctx.sub} iss=${ctx.iss} sim=${ctx.sim ?? "-"}`);
        res.writeHead(302, { Location: ctx.url, "Cache-Control": "no-store" }); res.end(); return;
      } catch (err) {
        config.log(`launch rejected: ${err.message}`);
        return html(res, 401, `Launch rejected: ${String(err.message).replace(/[<>&]/g, "")}.`);
      }
    }
    html(res, 404, "Not found.");
  }
  const server = http.createServer((req, res) => { handle(req, res).catch((err) => { config.log(`error: ${err.message}`); html(res, 500, "Relay error."); }); });
  return { server, config, pending };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { server, config } = createRelay({});
  const port = +(process.env.PORT ?? 8787);
  server.listen(port, () => console.log(`LTI 1.3 relay for ${config.issuer} → ${config.appUrl} on :${port} (learner_home ${config.relayOrigin})`));
}
