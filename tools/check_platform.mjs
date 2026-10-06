/**
 * Headless checks for the platform channel (WebXR/shared/platform.js):
 * ready is announced when embedded, commands are accepted only from the
 * learner's home origin, replies go only there, and the generated catalog
 * agrees with the live roster.
 *
 *     node tools/check_platform.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, WEBXR, loadSmartCity, loadTrades } from "./lib/headless.mjs";

const session = new Map();
globalThis.sessionStorage = { getItem: (k) => (session.has(k) ? session.get(k) : null), setItem: (k, v) => session.set(k, String(v)), removeItem: (k) => session.delete(k) };
globalThis.location = { search: "", pathname: "/smartcity/index.html", hash: "" };
globalThis.history = { replaceState() {} };
const listeners = [];
globalThis.addEventListener = (type, fn) => { if (type === "message") listeners.push(fn); };
globalThis.removeEventListener = (type, fn) => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
const posted = [];
globalThis.window = { parent: { postMessage: (msg, target) => posted.push({ msg, target }) } };
globalThis.window.parent.parent = globalThis.window.parent; // parent !== window → embedded

const { Identity } = await import("../WebXR/shared/identity.js");
const { Platform, PROTOCOL } = await import("../WebXR/shared/platform.js");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const send = (origin, data) => listeners.forEach((fn) => fn({ origin, data }));

console.log("Platform channel — self-test\n");

const received = [];
Platform.init({ app: "smartcity", onCommand: (type, data, reply) => { received.push({ type, data }); if (type === "smartcitix:status") reply("smartcitix:state", { room: "hub" }); } });

check("announces smartcitix:ready upward when embedded, carrying only app and protocol", () => {
  const ready = posted.find((p) => p.msg.type === "smartcitix:ready");
  if (!ready) throw new Error("no ready message");
  eq(ready.msg.app, "smartcity", "app"); eq(ready.msg.protocol, PROTOCOL, "protocol");
  eq(Object.keys(ready.msg).sort().join(","), "app,protocol,type", "nothing else in the announcement");
});

check("commands are ignored until the host has established identity from its own origin", () => {
  send("https://lms.example.org", { type: "smartcitix:open", sim: "charge-point" });
  eq(received.length, 0, "no trust yet");
  // The app wires Identity.listen() itself; here trust is established directly.
  Identity.set({ name: "Ada", id: "al-1", homePage: "https://lms.example.org", source: "message" });
  send("https://evil.example", { type: "smartcitix:open", sim: "charge-point" });
  eq(received.length, 0, "foreign origin ignored");
  send("https://lms.example.org", { type: "smartcitix:open", sim: "charge-point" });
  eq(received.length, 1, "trusted origin accepted"); eq(received[0].data.sim, "charge-point", "payload passed through");
});

check("replies and progress go only to the home origin, stamped with app and protocol", () => {
  posted.length = 0;
  send("https://lms.example.org", { type: "smartcitix:status" });
  const state = posted.find((p) => p.msg.type === "smartcitix:state");
  if (!state) throw new Error("no state reply");
  eq(state.target, "https://lms.example.org", "target origin"); eq(state.msg.app, "smartcity", "app"); eq(state.msg.protocol, PROTOCOL, "protocol"); eq(state.msg.room, "hub", "payload");
  Platform.progress({ sim: "charge-point", index: 2, count: 11 });
  eq(posted.at(-1).msg.type, "smartcitix:progress", "progress event"); eq(posted.at(-1).target, "https://lms.example.org", "progress target");
  Identity.clear();
  eq(Platform.emit("smartcitix:state", {}), false, "nothing is sent without a home origin");
});

const city = await loadSmartCity();
const trades = await loadTrades();
check("catalog.json matches the live roster (ids, categories, certifications, step counts)", () => {
  const cat = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
  const live = [...city.ROOMS.map((r) => ({ app: "smartcity", r })), ...trades.ROOMS.map((r) => ({ app: "trades", r }))];
  eq(cat.stations.length, live.length, "station count");
  for (const { app, r } of live) {
    const c = cat.stations.find((s) => s.id === r.id && s.app === app);
    if (!c) throw new Error(`${app}/${r.id} missing from catalog`);
    eq(c.steps, r.steps.length, `${r.id} steps`); eq(c.certification, r.certification ?? null, `${r.id} certification`);
    eq(c.category, r.category ?? (app === "trades" ? "Trade Skills Simulator" : null), `${r.id} category`);
    if (!c.deepLink.includes(r.id)) throw new Error(`${r.id} deep link`);
  }
  eq(cat.protocol, PROTOCOL, "catalog protocol");
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll platform checks pass.");
process.exit(failures ? 1 : 0);
