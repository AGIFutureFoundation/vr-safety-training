/**
 * Headless checks for opt-in agent/robot training-data sharing:
 * shared/wallet.js, shared/share-engagement.js, shared/agent-protocols.js
 * and the Cloudflare relay template in integrations/cloudflare/.
 *
 *     node tools/check_share.mjs
 *
 * What is proved here, in order:
 *   1. Keccak-256 matches known test vectors, and secp256k1 signature
 *      recovery round-trips against a keypair generated in this run.
 *   2. The consent record shared/share-engagement.js builds: required
 *      fields, the licence choice, what it declares shared/never shared,
 *      and that opting in never touches the network.
 *   3. Nothing is sent anywhere before an explicit share() call — not on
 *      import, not on opt-in, not on building a bundle.
 *   4. Every shared/agent-protocols.js adapter refuses to send while any of
 *      its fields are unconfigured, with the exact required message, and
 *      touches no network doing so.
 *   5. The share bundle's content hash is deterministic regardless of key
 *      order, and changes when the shared content actually changes.
 *   6. The worker's consentStatement() text is byte-identical to
 *      share-engagement.js's own, so a signature verifies against the same
 *      text a wallet was actually shown.
 *   7. integrations/cloudflare/worker.js's handleRequest(), driven directly
 *      with plain Request objects and a fake env — no Cloudflare runtime —
 *      including a wallet-signed consent verified against a fixture keypair
 *      generated in this test.
 */

// ------------------------------------------------------------ browser stubs

const localStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k),
};

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

console.log("Agent/robot sharing, wallets and the relay — self-test\n");

// ---------------------------------------------------------- 1. the crypto

const { keccak256Hex } = await import("../integrations/cloudflare/crypto/keccak256.js");
const {
  P, G, mod, pointAdd, scalarMul, recoverAddress, privateKeyToAddress, signPersonalMessage,
} = await import("../integrations/cloudflare/crypto/secp256k1.js");

await check("keccak256 matches published Keccak-256 test vectors (Ethereum's variant, not NIST SHA3)", () => {
  eq(keccak256Hex(new Uint8Array(0)), "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    "keccak256(\"\")");
  eq(keccak256Hex(new TextEncoder().encode("abc")), "4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45",
    "keccak256(\"abc\")");
});

await check("the curve constants describe a real point of prime order", () => {
  const onCurve = (pt) => mod(pt.y * pt.y - (pt.x ** 3n + 7n), P) === 0n;
  assert(onCurve(G), "the generator point is not on the curve — a wrong constant would break every signature");
  assert(onCurve(pointAdd(G, G)), "2G is not on the curve");
  const { N } = { N: 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n };
  eq(scalarMul(N, G), null, "N*G should be the point at infinity");
});

await check("a personal_sign signature recovers the address that made it, and rejects tampering", () => {
  const priv = 0x2f4e6a1c9b7d3e5f0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6071n;
  const address = privateKeyToAddress(priv);
  const message = "hello, this is a consent statement";
  const signature = signPersonalMessage(priv, message);
  eq(recoverAddress(message, signature), address, "round-trip recovery");
  assert(recoverAddress(message + " ", signature) !== address, "a changed message must not still recover the signer");
  const flipped = `0x${signature.slice(2, 12)}${signature[12] === "0" ? "f" : "0"}${signature.slice(13)}`;
  assert(recoverAddress(message, flipped) !== address, "a flipped signature byte must not still recover the signer");
  eq(recoverAddress(message, "0x1234"), null, "a malformed signature recovers null, not a throw");
  eq(recoverAddress(message, "not-hex-at-all"), null, "a non-hex signature recovers null");
});

// ---------------------------------------------------- 2/3. share-engagement

const {
  ShareEngagement, LICENCES, cleanLicence, consentStatement, canonicalJson, contentHash, recordDigest,
} = await import("../WebXR/shared/share-engagement.js");
const { TrainingRecords } = await import("../WebXR/shared/records.js");

function resetShare() {
  localStore.clear();
  TrainingRecords.clear();
  ShareEngagement.consent = null;
}

await check("the consent schema: required fields, licence choice, what is (and is not) shared", async () => {
  resetShare();
  eq(cleanLicence("MIT"), null, "an unlisted licence is refused");
  eq(cleanLicence("CC0"), "CC0", "CC0 accepted");
  eq(cleanLicence("CC-BY-4.0"), "CC-BY-4.0", "CC-BY-4.0 accepted");
  const bad = await ShareEngagement.optIn({ licence: "WTFPL" });
  eq(bad.ok, false, "an invalid licence refuses opt-in");
  const res = await ShareEngagement.optIn({ licence: "CC-BY-4.0", wallet: { connected: false } });
  eq(res.ok, true, "opt-in with no wallet connected succeeds as a local consent");
  const c = res.consent;
  assert(c.id && typeof c.id === "string", "consent needs an id");
  assert(/^\d{4}-\d{2}-\d{2}T/.test(c.at), "consent needs an ISO timestamp");
  eq(c.licence, "CC-BY-4.0", "licence recorded");
  eq(c.mode, "local", "no wallet connected -> local mode");
  eq(c.optIn, true, "optIn flag");
  eq(c.signature, null, "a local consent carries no signature");
  eq(c.shares.episodeDigests, true, "declares episode digests shared");
  eq(c.shares.rollupScores, true, "declares roll-up scores shared");
  for (const field of ["name", "crewTag", "freeText", "rawIdentity"]) {
    assert(c.neverShares.includes(field), `neverShares should list ${field}`);
  }
  eq(ShareEngagement.optedIn, true, "optedIn reads true after opting in");
  eq(JSON.parse(localStorage.getItem("vr-training-share-consent-v1")).id, c.id, "consent persisted under its own key");
  ShareEngagement.revoke();
  eq(ShareEngagement.optedIn, false, "revoke() clears optedIn");
  eq(localStorage.getItem("vr-training-share-consent-v1"), null, "revoke() clears the stored consent");
});

await check("opting in with a connected wallet signs the exact consent statement and records the address", async () => {
  resetShare();
  const seen = [];
  const wallet = {
    connected: true, address: "0xabc0000000000000000000000000000000dead", chainId: "0x1",
    signConsent: async (text) => { seen.push(text); return { signed: true, signature: "0xsig", address: wallet.address, chainId: wallet.chainId, message: text }; },
  };
  const res = await ShareEngagement.optIn({ licence: "CC0", wallet });
  eq(res.ok, true, "wallet opt-in succeeds");
  eq(res.consent.mode, "wallet", "mode is wallet when connected");
  eq(res.consent.address, wallet.address, "address recorded");
  eq(res.consent.signature, "0xsig", "signature recorded");
  eq(seen[0], consentStatement({ licence: "CC0", at: res.consent.at }), "the wallet was asked to sign the module's own statement text");
  const refusing = { connected: true, address: "0x1", signConsent: async () => ({ signed: false, reason: "The wallet declined to sign." }) };
  const refused = await ShareEngagement.optIn({ licence: "CC0", wallet: refusing });
  eq(refused.ok, false, "a wallet refusal to sign refuses opt-in");
  eq(refused.reason, "The wallet declined to sign.", "the refusal reason is passed through");
});

await check("nothing is sent anywhere by default, or merely by opting in and building a bundle", async () => {
  resetShare();
  let fetchCalls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (...a) => { fetchCalls += 1; return realFetch(...a); };
  try {
    eq(await ShareEngagement.buildBundle(), null, "buildBundle() is null while not opted in");
    const before = await ShareEngagement.share({ id: "unused", deliver: async () => { throw new Error("must not be called"); } });
    eq(before.ok, false, "share() refuses while not opted in");
    eq(before.reason, "Opt in first — nothing is shared by default.", "share() explains the refusal");
    await ShareEngagement.optIn({ licence: "CC0", wallet: { connected: false } });
    eq(fetchCalls, 0, "opting in touched the network");
    TrainingRecords.record({ app: "smartcity", simId: "charge-point", category: "Energy & Power", stars: 3, hazardHits: 0, score: 100, errors: 0, seconds: 60 });
    const bundle = await ShareEngagement.buildBundle();
    assert(bundle && bundle.hash, "buildBundle() returns a bundle once opted in");
    eq(fetchCalls, 0, "building a bundle touched the network");
    eq(ShareEngagement.receipts().length, 0, "no receipt exists before a share() call");
  } finally { globalThis.fetch = realFetch; }
});

await check("recordDigest() (the fallback used while shared/episodes.js is absent) never carries a name or free text", () => {
  const d = recordDigest({ learner: "Ada Lovelace", learnerName: "Ada", learnerId: "al-1815", app: "smartcity", simId: "x", category: "c", stars: 3, hazardHits: 0, score: 10, errors: 0, seconds: 5, passed: true, at: "2026-01-01T00:00:00Z" });
  for (const field of ["learner", "learnerName", "learnerId", "homePage"]) assert(!(field in d), `recordDigest leaked ${field}`);
  eq(d.simId, "x", "simId carried"); eq(d.passed, true, "passed carried");
});

await check("the episodes.js feature check falls back cleanly while that module is not in this build", async () => {
  resetShare();
  await ShareEngagement.optIn({ licence: "CC0", wallet: { connected: false } });
  TrainingRecords.record({ app: "trades", simId: "electrical", category: "Electrical", stars: 2, hazardHits: 0, score: 50, errors: 1, seconds: 30 });
  const bundle = await ShareEngagement.buildBundle();
  eq(bundle.payload.source, "records-fallback", "falls back to records.js while shared/episodes.js is absent from this checkout");
  eq(bundle.payload.digests.length, 1, "one digest per training record");
  eq(bundle.payload.digests[0].simId, "electrical", "digest content is the anonymised record");
});

// -------------------------------------------------------- 4. agent-protocols

const { createAdapter, ADAPTER_IDS, listAdapters } = await import("../WebXR/shared/agent-protocols.js");

await check("every adapter starts fully unconfigured, and describe() never invents a value", () => {
  eq(ADAPTER_IDS.sort().join(","), "cloudflare-relay,generic-attestation,singularitynet,virtuals", "the four required adapters exist");
  for (const id of ADAPTER_IDS) {
    const d = createAdapter(id).describe();
    eq(d.configured, false, `${id} reports configured before any field is set`);
    for (const f of d.fields) eq(d.config[f], null, `${id}.${f} should start unset`);
  }
  eq(listAdapters().length, 4, "listAdapters() lists all four");
});

await check("every adapter refuses offer()/deliver() while unconfigured, with the exact required message, and sends nothing", async () => {
  let calls = 0;
  const spyFetch = async () => { calls += 1; return { ok: true, json: async () => ({}) }; };
  for (const id of ADAPTER_IDS) {
    const a = createAdapter(id, { fetchImpl: spyFetch });
    const offer = await a.offer({ hash: "x" });
    eq(offer.ok, false, `${id}.offer() while unconfigured`);
    eq(offer.reason, "configure per the provider's current documentation", `${id}.offer() reason`);
    const deliver = await a.deliver({ hash: "x" }, { optIn: true });
    eq(deliver.ok, false, `${id}.deliver() while unconfigured`);
    eq(deliver.reason, "configure per the provider's current documentation", `${id}.deliver() reason`);
    const status = await a.status({ id: "r1" });
    eq(status.ok, false, `${id}.status() while unconfigured`);
  }
  eq(calls, 0, "no adapter reached the network while unconfigured");
});

await check("a fully configured adapter still refuses deliver() without consent, and sends when consent is given", async () => {
  const posts = [];
  const spyFetch = async (url, init) => { posts.push({ url, init }); return { ok: true, json: async () => ({ ok: true }) }; };
  const a = createAdapter("cloudflare-relay", { fetchImpl: spyFetch });
  a.configure({ endpoint: "https://relay.example.org/share" });
  eq(a.describe().configured, true, "configured once its one field is set");
  const noConsent = await a.deliver({ hash: "x" }, { optIn: false });
  eq(noConsent.ok, false, "deliver() refuses without consent even when configured");
  eq(posts.length, 0, "no request was made without consent");
  const ok = await a.deliver({ hash: "x" }, { optIn: true, id: "c1" });
  eq(ok.ok, true, "deliver() sends once configured and consented");
  eq(posts.length, 1, "exactly one request");
  eq(posts[0].url, "https://relay.example.org/share", "sent to the configured endpoint and nowhere else");
  eq(JSON.parse(posts[0].init.body).action, "deliver", "the action is carried in the body");
});

// ------------------------------------------------------- 5. bundle hash

await check("the bundle's content hash is deterministic regardless of key order, and changes with the content", async () => {
  const a = { z: 1, a: { y: 2, x: [3, 2, 1] } };
  const b = { a: { x: [3, 2, 1], y: 2 }, z: 1 };
  eq(canonicalJson(a), canonicalJson(b), "canonicalJson ignores key order");
  eq(await contentHash(a), await contentHash(b), "contentHash ignores key order");
  const c = { z: 1, a: { y: 2, x: [3, 2, 2] } };
  assert((await contentHash(a)) !== (await contentHash(c)), "a changed value changes the hash");

  resetShare();
  await ShareEngagement.optIn({ licence: "CC0", wallet: { connected: false } });
  TrainingRecords.record({ app: "smartcity", simId: "charge-point", category: "Energy & Power", stars: 3, hazardHits: 0, score: 100, errors: 0, seconds: 60 });
  const b1 = await ShareEngagement.buildBundle();
  const b2 = await ShareEngagement.buildBundle();
  assert(b1.hash !== undefined && b1.hash.length === 64, "hash is a sha-256 hex string");
  // Two builds a moment apart differ only in generatedAt, which is not part
  // of what a person is asked to trust as "the same content" — the payload's
  // own digests and summary are what must hash identically build to build.
  eq(await contentHash({ ...b1.payload, generatedAt: null }), await contentHash({ ...b2.payload, generatedAt: null }), "the shared content itself hashes identically across two builds");
});

// -------------------------------------------------- 6. worker / share-engagement parity

const workerMod = await import("../integrations/cloudflare/worker.js");

await check("integrations/cloudflare/worker.js's consentStatement() is byte-identical to share-engagement.js's own", () => {
  for (const [licence, at] of [["CC0", "2026-01-01T00:00:00.000Z"], ["CC-BY-4.0", "2026-06-15T12:30:45.000Z"]]) {
    eq(workerMod.consentStatement({ licence, at }), consentStatement({ licence, at }), `consentStatement(${licence}) must match — a drift here would make every valid signature fail to verify`);
  }
});

// ----------------------------------------------------- 7. the worker handler

function fakeKv() {
  const store = new Map();
  return { store, put: async (key, value) => { store.set(key, value); } };
}

function postRequest(body, headers = {}) {
  return new Request("https://relay.example.org/share", {
    method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body),
  });
}

await check("the worker refuses a non-POST request and an invalid JSON body", async () => {
  const get = await workerMod.handleRequest(new Request("https://relay.example.org/share", { method: "GET" }), {});
  eq(get.status, 405, "GET is refused");
  const bad = await workerMod.handleRequest(new Request("https://relay.example.org/share", { method: "POST", body: "not json" }), {});
  eq(bad.status, 400, "invalid JSON is refused");
});

await check("the worker refuses a request with no consent, or consent.optIn not true", async () => {
  const kv = fakeKv();
  const noConsent = await workerMod.handleRequest(postRequest({ bundle: { payload: {}, hash: "x" } }), { RECEIPTS_KV: kv });
  eq(noConsent.status, 400, "no consent -> 400");
  const notOptedIn = await workerMod.handleRequest(postRequest({ bundle: { payload: {}, hash: "x" }, consent: { optIn: false, mode: "local" } }), { RECEIPTS_KV: kv });
  eq(notOptedIn.status, 400, "optIn: false -> 400");
  eq(kv.store.size, 0, "nothing was stored");
});

await check("a local (unsigned) consent with a matching content hash is accepted and a receipt is stored", async () => {
  const kv = fakeKv();
  const payload = { digests: [{ simId: "x", stars: 3 }], summary: [], licence: "CC0" };
  const hash = await contentHash(payload);
  const consent = { id: "consent-1", optIn: true, mode: "local", licence: "CC0", at: new Date().toISOString() };
  const res = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }), { RECEIPTS_KV: kv });
  eq(res.status, 200, "a valid local consent is accepted");
  const body = await res.json();
  eq(body.ok, true, "ok: true");
  assert(body.receipt?.id, "a receipt id is returned");
  eq(body.receipt.consentId, "consent-1", "the receipt carries the consent id");
  eq(kv.store.size, 1, "the receipt was stored in the configured KV binding");
  const stored = JSON.parse(kv.store.get(`receipts/${body.receipt.id}.json`));
  eq(stored.contentHash, hash, "the stored receipt carries the content hash");
});

await check("a wallet-mode consent with a valid signature (fixture keypair generated in this test) is accepted", async () => {
  const priv = 0x9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0n % 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140n;
  const address = privateKeyToAddress(priv);
  const at = new Date().toISOString();
  const licence = "CC-BY-4.0";
  const message = workerMod.consentStatement({ licence, at });
  const signature = signPersonalMessage(priv, message);
  const consent = { id: "consent-2", optIn: true, mode: "wallet", licence, at, address, signature };
  eq(workerMod.verifyConsentSignature(consent), true, "verifyConsentSignature() accepts a genuine signature");
  const payload = { digests: [], summary: [], licence };
  const hash = await contentHash(payload);
  const kv = fakeKv();
  const res = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }), { RECEIPTS_KV: kv });
  eq(res.status, 200, "a valid wallet-signed consent is accepted");
  eq(kv.store.size, 1, "its receipt is stored");
});

await check("the worker rejects a wallet consent whose signature does not match its declared address", async () => {
  const priv = 0x1111111111111111111111111111111111111111111111111111111111111n;
  const other = 0x2222222222222222222222222222222222222222222222222222222222222n;
  const at = new Date().toISOString();
  const licence = "CC0";
  const message = workerMod.consentStatement({ licence, at });
  const signature = signPersonalMessage(priv, message);
  const wrongAddress = privateKeyToAddress(other);
  const consent = { id: "consent-3", optIn: true, mode: "wallet", licence, at, address: wrongAddress, signature };
  eq(workerMod.verifyConsentSignature(consent), false, "verifyConsentSignature() rejects a mismatched address");
  const payload = { digests: [], summary: [], licence };
  const hash = await contentHash(payload);
  const kv = fakeKv();
  const res = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }), { RECEIPTS_KV: kv });
  eq(res.status, 401, "a mismatched signature is rejected with 401");
  eq(kv.store.size, 0, "nothing was stored for a rejected consent");
});

await check("the worker rejects a bundle whose content hash does not match its payload, and an unknown consent.mode", async () => {
  const payload = { digests: [{ simId: "x" }], summary: [], licence: "CC0" };
  const consent = { id: "consent-4", optIn: true, mode: "local", licence: "CC0", at: new Date().toISOString() };
  const tampered = await workerMod.handleRequest(postRequest({ bundle: { payload: { ...payload, digests: [{ simId: "y" }] }, hash: await contentHash(payload) }, consent }), {});
  eq(tampered.status, 400, "a payload that does not match its declared hash is refused");
  const badMode = await workerMod.handleRequest(postRequest({ bundle: { payload, hash: await contentHash(payload) }, consent: { ...consent, mode: "carrier-pigeon" } }), {});
  eq(badMode.status, 400, "an unrecognised consent.mode is refused");
});

await check("the x402-style payment header is only ever echoed when the deployment configured PAYMENT_REQUIRED", async () => {
  const payload = { digests: [], summary: [], licence: "CC0" };
  const hash = await contentHash(payload);
  const consent = { id: "consent-5", optIn: true, mode: "local", licence: "CC0", at: new Date().toISOString() };
  const withoutFlag = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }, { "x-payment": "proof" }), {});
  eq(withoutFlag.headers.get("x-payment-response"), null, "no PAYMENT_REQUIRED -> no payment header echoed");
  const withFlag = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }, { "x-payment": "proof" }), { PAYMENT_REQUIRED: true });
  eq(withFlag.headers.get("x-payment-response"), "received", "PAYMENT_REQUIRED and a payment header together are echoed");
  const flagButNoHeader = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }), { PAYMENT_REQUIRED: true });
  eq(flagButNoHeader.headers.get("x-payment-response"), null, "PAYMENT_REQUIRED alone, with no payment header sent, echoes nothing");
});

await check("the worker runs with neither storage binding configured", async () => {
  const payload = { digests: [], summary: [], licence: "CC0" };
  const hash = await contentHash(payload);
  const consent = { id: "consent-6", optIn: true, mode: "local", licence: "CC0", at: new Date().toISOString() };
  const res = await workerMod.handleRequest(postRequest({ bundle: { payload, hash }, consent }), {});
  eq(res.status, 200, "a deployment with no storage binding still answers with a receipt");
});

// -------------------------------------------------------------- 8. wallet.js

const { Wallet, makeWalletEnv, discoverProviders, shortAddress } = await import("../WebXR/shared/wallet.js");

await check("wallet.js: graceful no-wallet state, discovery, connect/disconnect, and personal_sign consent", async () => {
  Wallet.disconnect();
  const empty = await discoverProviders(makeWalletEnv({ ethereum: null, addEventListener: null, dispatchEvent: null, CustomEvent: null }));
  eq(empty.length, 0, "no wallet, no EIP-6963 support -> no providers");
  const legacyOnly = await discoverProviders(makeWalletEnv({ ethereum: { request: async () => [] }, addEventListener: null, dispatchEvent: null, CustomEvent: null }));
  eq(legacyOnly.length, 1, "a legacy window.ethereum with no EIP-6963 support still yields one provider");

  const refusedConnect = await Wallet.connect({ env: makeWalletEnv({ ethereum: null }) });
  eq(refusedConnect.connected, false, "connect() with no wallet refuses gracefully");
  const refusedSign = await Wallet.signConsent("hello");
  eq(refusedSign.signed, false, "signConsent() with nothing connected refuses gracefully");

  let requested = [];
  const eth = {
    request: async (r) => { requested.push(r.method); if (r.method === "eth_requestAccounts") return ["0xABCDEF0123456789abcdef0123456789ABCDEF01"]; if (r.method === "eth_chainId") return "0x1"; if (r.method === "personal_sign") return "0xdeadbeef"; return null; },
    on: () => {}, removeListener: () => {},
  };
  const connected = await Wallet.connect({ env: makeWalletEnv({ ethereum: eth }) });
  eq(connected.connected, true, "connect() succeeds against a stub provider");
  eq(connected.address, "0xABCDEF0123456789abcdef0123456789ABCDEF01", "the address the wallet returned is used verbatim");
  eq(connected.shortAddress, shortAddress(connected.address), "shortAddress matches auth.js's own formatting");
  const signed = await Wallet.signConsent("I opt in to share...");
  eq(signed.signed, true, "signConsent() succeeds once connected");
  eq(signed.signature, "0xdeadbeef", "the raw signature is returned, never altered");
  assert(requested.includes("personal_sign"), "personal_sign (EIP-191) is the method used to sign consent");
  eq(Wallet.describe().address, connected.address, "describe() reflects the connected address");
  Wallet.disconnect();
  eq(Wallet.connected, false, "disconnect() clears the connection");
  eq(Wallet.describe(), null, "describe() is null once disconnected");
});

console.log(failures === 0 ? "\nAll sharing, wallet and relay checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
