/**
 * Headless checks for the live LRS connection (WebXR/shared/lrs.js):
 * endpoint/credential cleaning, the queue's no-send-while-unconfigured and
 * no-duplicate rules, batched POSTs with xAPI headers, retry after a failed
 * send, and origin-bound postMessage configuration.
 *
 *     node tools/check_lrs.mjs
 */

const mem = (store) => ({
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
});
globalThis.sessionStorage = mem(new Map());
globalThis.localStorage = mem(new Map());
let search = "";
globalThis.location = { get search() { return search; }, pathname: "/smartcity/index.html", hash: "" };
const replaced = [];
globalThis.history = { replaceState: (_s, _t, url) => replaced.push(url) };
const listeners = [];
globalThis.addEventListener = (type, fn) => { if (type === "message") listeners.push(fn); };
globalThis.removeEventListener = (type, fn) => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };

const { Lrs, cleanEndpoint, cleanAuth } = await import("../WebXR/shared/lrs.js");

let failures = 0;
function check(name, fn) {
  return Promise.resolve().then(fn).then(() => console.log(`  ✓ ${name}`),
    (err) => { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); });
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const stmt = (id) => ({ id, actor: { name: "x" }, verb: { id: "v" }, object: { id: "o" } });

console.log("Live LRS connection — self-test\n");

await check("cleanEndpoint keeps https/localhost, trims slashes and query, rejects the rest", () => {
  eq(cleanEndpoint("https://lrs.example.org/xapi/"), "https://lrs.example.org/xapi", "https trailing slash");
  eq(cleanEndpoint("http://localhost:8971/lrs?x=1"), "http://localhost:8971/lrs", "localhost query dropped");
  eq(cleanEndpoint("http://lrs.example.org/xapi"), null, "plain http");
  eq(cleanEndpoint("ftp://x"), null, "other scheme");
  eq(cleanEndpoint(""), null, "blank");
});

await check("cleanAuth builds Basic from user:secret, keeps schemes, Bearer for bare tokens", () => {
  eq(cleanAuth("kiosk:s3cret"), `Basic ${Buffer.from("kiosk:s3cret").toString("base64")}`, "basic pair");
  eq(cleanAuth("Basic abc="), "Basic abc=", "kept basic");
  eq(cleanAuth("bearer tok"), "bearer tok", "kept bearer");
  eq(cleanAuth("tok123"), "Bearer tok123", "bare token");
  eq(cleanAuth("  \n "), null, "blank");
});

await check("nothing is queued while unconfigured; duplicates are dropped once configured", () => {
  eq(Lrs.enqueue([stmt("a")]), 0, "unconfigured enqueue");
  eq(Lrs.pending(), 0, "queue empty");
  eq(Lrs.configure({ endpoint: "http://localhost:8971/lrs/", auth: "kiosk:s3cret" }).endpoint, "http://localhost:8971/lrs", "configured");
  eq(Lrs.enqueue([stmt("a"), stmt("b")]), 2, "two added");
  eq(Lrs.enqueue([stmt("a"), stmt("c")]), 1, "duplicate skipped");
  eq(Lrs.pending(), 3, "three pending");
});

await check("flush POSTs batches with xAPI headers and clears them; a failure keeps the rest", async () => {
  const calls = [];
  let fail = false;
  const fetch = async (url, init) => { calls.push({ url, init }); return { ok: !fail, status: fail ? 503 : 200 }; };
  const r = await Lrs.flush({ fetch });
  eq(r.sent, 3, "sent"); eq(r.pending, 0, "pending"); eq(r.error, null, "no error");
  eq(calls.length, 1, "one batch"); eq(calls[0].url, "http://localhost:8971/lrs/statements", "url");
  eq(calls[0].init.headers["X-Experience-API-Version"], "1.0.3", "version header");
  eq(calls[0].init.headers.Authorization.startsWith("Basic "), true, "auth header");
  eq(JSON.parse(calls[0].init.body).length, 3, "body is the batch");
  Lrs.enqueue([stmt("d")]);
  fail = true;
  const r2 = await Lrs.flush({ fetch });
  eq(r2.sent, 0, "nothing sent on 503"); eq(r2.pending, 1, "kept"); eq(r2.error, "LRS answered 503", "error text");
  eq(Lrs.status().last.error, "LRS answered 503", "status carries last error");
  fail = false;
  eq((await Lrs.flush({ fetch })).sent, 1, "retried later");
});

await check("load() takes lrs_endpoint from the URL, scrubs it, never a credential; disconnect clears", () => {
  Lrs.disconnect();
  eq(Lrs.configured, false, "disconnected");
  search = "?sim=x&lrs_endpoint=https%3A%2F%2Flrs.example.org%2Fxapi";
  eq(Lrs.load().endpoint, "https://lrs.example.org/xapi", "from url");
  eq(Lrs.config.auth, null, "no credential from url");
  eq(replaced[replaced.length - 1], "/smartcity/index.html?sim=x", "scrubbed");
  search = ""; Lrs.config = null;
  eq(Lrs.load().endpoint, "https://lrs.example.org/xapi", "restored per tab");
  Lrs.disconnect();
  eq(Lrs.load(), null, "gone after disconnect");
});

await check("listen() accepts a config only from the trusted origin", () => {
  let trusted = "https://lms.example.org", changes = 0;
  const off = Lrs.listen(() => trusted, () => { changes += 1; });
  const send = (origin, data) => listeners.forEach((fn) => fn({ origin, data }));
  send("https://evil.example", { type: "smartcitix:lrs", endpoint: "https://evil.example/lrs" });
  eq(Lrs.configured, false, "rejected foreign origin");
  send("https://lms.example.org", { type: "smartcitix:lrs", endpoint: "https://lrs.example.org/xapi", auth: "Bearer t" });
  eq(Lrs.config?.endpoint, "https://lrs.example.org/xapi", "accepted trusted origin"); eq(changes, 1, "onChange");
  trusted = null;
  send("https://lms.example.org", { type: "smartcitix:lrs", endpoint: "https://other.example/x" });
  eq(Lrs.config.endpoint, "https://lrs.example.org/xapi", "no trusted origin → ignored");
  off();
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll LRS checks pass.");
process.exit(failures ? 1 : 0);
