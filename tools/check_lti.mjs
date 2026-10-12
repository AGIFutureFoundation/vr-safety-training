/**
 * Self-test for the LTI 1.3 launch relay (tools/lti_relay.mjs): a stand-in
 * platform with its own RSA key signs id_tokens; the relay must accept a
 * good launch and redirect into the app with the learner's launch context,
 * and reject a bad signature, a wrong audience, an expired token, a replayed
 * nonce, and an unknown state.
 *
 *     node tools/check_lti.mjs
 */
import crypto from "node:crypto";
import { createRelay, signJwt, verifyJwt, launchContext } from "./lti_relay.mjs";

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (v, what) => { if (!v) throw new Error(what); };
const throwsWith = async (fn, re, what) => { try { await fn(); } catch (err) { if (re.test(err.message)) return; throw new Error(`${what}: wrong error "${err.message}"`); } throw new Error(`${what}: did not throw`); };

console.log("LTI 1.3 launch relay — self-test\n");

// A stand-in platform.
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "platform-key-1", alg: "RS256", use: "sig" };
const jwks = { keys: [jwk] };
const ISS = "https://lms.example.org", CLIENT = "smartcitix-tool-42", RELAY = "https://relay.example.org", APP = "https://sims.example.org/smartcity/index.html";
let now = 1_800_000_000;
const relay = createRelay({ issuer: ISS, clientId: CLIENT, authUrl: `${ISS}/auth`, jwksUrl: `${ISS}/jwks`, appUrl: APP, relayOrigin: RELAY, fetchJwks: async () => jwks, now: () => now, log: () => {} });
await new Promise((r) => relay.server.listen(0, r));
const base = `http://127.0.0.1:${relay.server.address().port}`;
const LTI = "https://purl.imsglobal.org/spec/lti/claim/";
const claims = (over = {}) => ({
  iss: ISS, aud: CLIENT, sub: "user-7f3a", name: "Ada Lovelace", iat: now, exp: now + 300, nonce: "n",
  [`${LTI}message_type`]: "LtiResourceLinkRequest", [`${LTI}version`]: "1.3.0", [`${LTI}deployment_id`]: "dep-1",
  [`${LTI}custom`]: { sim: "charge-point" }, ...over,
});
const post = (path, form) => fetch(`${base}${path}`, { method: "POST", body: new URLSearchParams(form), redirect: "manual" });
async function login() {
  const r = await fetch(`${base}/lti/login?iss=${encodeURIComponent(ISS)}&login_hint=abc&target_link_uri=${encodeURIComponent(APP)}`, { redirect: "manual" });
  eq(r.status, 302, "login redirects");
  const u = new URL(r.headers.get("location"));
  return { state: u.searchParams.get("state"), nonce: u.searchParams.get("nonce"), auth: u };
}

await check("verifyJwt accepts a good RS256 token and rejects a tampered one", async () => {
  const tok = signJwt(claims(), privateKey, "platform-key-1");
  eq(verifyJwt(tok, jwks, { issuer: ISS, audience: CLIENT, now }).sub, "user-7f3a", "payload");
  const [h, p, s] = tok.split(".");
  const evil = Buffer.from(JSON.stringify({ ...claims(), sub: "someone-else" })).toString("base64url");
  await throwsWith(() => verifyJwt(`${h}.${evil}.${s}`, jwks, { now }), /signature/, "tampered");
});

await check("login step redirects to the platform auth endpoint with state, nonce and redirect_uri", async () => {
  const { auth, state, nonce } = await login();
  eq(auth.origin + auth.pathname, `${ISS}/auth`, "auth url");
  eq(auth.searchParams.get("client_id"), CLIENT, "client_id"); eq(auth.searchParams.get("redirect_uri"), `${RELAY}/lti/launch`, "redirect_uri");
  eq(auth.searchParams.get("response_mode"), "form_post", "form_post"); ok(state && nonce, "state/nonce");
  const bad = await fetch(`${base}/lti/login?iss=https://evil.example&login_hint=x`, { redirect: "manual" });
  eq(bad.status, 400, "unknown issuer refused");
});

await check("a valid launch redirects into the app with learner, learner_id, learner_home and the custom station", async () => {
  const { state, nonce } = await login();
  const r = await post("/lti/launch", { state, id_token: signJwt(claims({ nonce }), privateKey, "platform-key-1") });
  eq(r.status, 302, "launch redirects");
  const u = new URL(r.headers.get("location"));
  eq(u.origin + u.pathname, APP, "app url"); eq(u.searchParams.get("sim"), "charge-point", "sim");
  eq(u.searchParams.get("learner"), "Ada Lovelace", "learner"); eq(u.searchParams.get("learner_id"), "user-7f3a", "learner_id");
  eq(u.searchParams.get("learner_home"), RELAY, "learner_home");
  const again = await post("/lti/launch", { state, id_token: signJwt(claims({ nonce }), privateKey, "platform-key-1") });
  eq(again.status, 400, "state is single use");
});

await check("bad signature, wrong audience, expired token, nonce mismatch and unknown state are rejected", async () => {
  const other = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
  let { state, nonce } = await login();
  eq((await post("/lti/launch", { state, id_token: signJwt(claims({ nonce }), other, "platform-key-1") })).status, 401, "bad signature");
  ({ state, nonce } = await login());
  eq((await post("/lti/launch", { state, id_token: signJwt(claims({ nonce, aud: "someone-else" }), privateKey, "platform-key-1") })).status, 401, "wrong audience");
  ({ state, nonce } = await login());
  eq((await post("/lti/launch", { state, id_token: signJwt(claims({ nonce, exp: now - 3600 }), privateKey, "platform-key-1") })).status, 401, "expired");
  ({ state, nonce } = await login());
  eq((await post("/lti/launch", { state, id_token: signJwt(claims({ nonce: "wrong" }), privateKey, "platform-key-1") })).status, 401, "nonce mismatch");
  eq((await post("/lti/launch", { state: "nope", id_token: "x" })).status, 400, "unknown state");
});

await check("launchContext maps trades launches to ?room=, ignores unsafe custom ids, and requires a resource-link message", () => {
  const t = launchContext(claims({ [`${LTI}custom`]: { room: "welding" } }), { relayOrigin: RELAY, appUrl: "https://sims.example.org/trades/index.html" });
  eq(new URL(t.url).searchParams.get("room"), "welding", "room param");
  const u = launchContext(claims({ [`${LTI}custom`]: { sim: "../evil?x" } }), { relayOrigin: RELAY, appUrl: APP });
  eq(new URL(u.url).searchParams.get("sim"), null, "unsafe id dropped");
  let threw = false; try { launchContext(claims({ [`${LTI}message_type`]: "LtiDeepLinkingRequest" }), { relayOrigin: RELAY, appUrl: APP }); } catch (_) { threw = true; }
  ok(threw, "deep-linking request refused");
});

relay.server.close();
console.log(failures ? `\n${failures} check(s) failed.` : "\nAll LTI relay checks pass.");
process.exit(failures ? 1 : 0);
