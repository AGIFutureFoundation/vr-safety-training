#!/usr/bin/env node
/**
 * ROBOTRAIN-7 (docs/consoles/ROBOTRAIN-7.md): the page-level proof for rating robot runs, driven headlessly in the BUILT parishes
 * page. On the teleop pad, "Rate two robot runs" shows two runs of the trained policy (simulated) with a thumbs up and down on each,
 * stored through AGENTGYM's agRate. Signed out, the thumbs are disabled and a rating is refused. An adult test profile signs in,
 * opts in on the Me tab and rates run A up and run B down: the page stores 2 rating episodes, and rt6LocalPairs (run here in
 * node over exactly those episodes) returns 1 pair while collecting and none for K-12, demo or signed-out signals. On the page,
 * a K-12 session (?k12) and the demo refuse to store more. Revoke empties the store. Page errors 0, external requests 0.
 *
 * Not in the gate (it boots the full page several times). Build first, then run:
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_rt7_ratings.mjs [port]
 * Prints one line per step and exits 1 when the proof does not hold.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
// node-side DATAWORKS state for rt6LocalPairs (as check_colearn does): a memory localStorage before dx-data.js is imported.
class Mem { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
globalThis.localStorage = new Mem(); globalThis.sessionStorage = new Mem();
const { pvServe, pvLaunch, pvContext } = await imp("tools/lib/pv_browser.mjs");
const dx = await imp("WebXR/shared/dx-data.js"), R6 = await imp("WebXR/shared/rt6-learn.js");

const { base, close } = await pvServe(Number(process.argv[2]) || 9113);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], routedThree: 0, crashed: false };
const context = await pvContext(browser, { reducedMotion: "reduce" });
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("crash", () => { out.crashed = true; console.log("PAGE CRASHED"); });
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) { out.routedThree++; return; } out.offHost.push(u); });
const URL0 = `${base}/parishes/dist/parishes.html?parish=sf-downtown`;
const boot = async (extra = "") => { await page.goto(URL0 + extra, { waitUntil: "load", timeout: 120000 }); await page.waitForFunction(() => !!window.__parishTest?.teleop?.rateRuns && !!window.__parishTest?.dxFlush, null, { timeout: 120000 }); };
const log = (k, v) => console.log(k, typeof v === "string" ? v : JSON.stringify(v));
// show two runs, try both thumbs through the pad's own buttons, and read what the device holds
const rateOnPage = () => page.evaluate(async () => {
  const t = window.__parishTest.teleop, shown = t.rateRuns(7001);
  const btn = (k, r) => document.querySelector(`#rt-teleop [data-run="${k}"] .rt-rate-${r}`);
  const disabled = [btn(0, "up"), btn(0, "down"), btn(1, "up"), btn(1, "down")].filter((b) => b?.disabled).length;
  const results = [await t.rate(0, "up"), await t.rate(1, "down")];
  await window.__parishTest.dxFlush();
  return { shown, disabled, results: results.map((r) => (r.ok ? "kept" : r.reason)), status: t.status(), stored: await window.__parishTest.dx.stored(), ratings: await t.ratings() };
});
const clickRate = () => page.evaluate(async () => {
  const t = window.__parishTest.teleop, shown = t.rateRuns(7001);
  const btn = (k, r) => document.querySelector(`#rt-teleop [data-run="${k}"] .rt-rate-${r}`);
  const enabled = [btn(0, "up"), btn(0, "down"), btn(1, "up"), btn(1, "down")].filter((b) => b && !b.disabled).length;
  // each click's agRate write is awaited by the pad, which then marks the card: wait for both marks (the store is serialised)
  const labels = () => [...document.querySelectorAll("#rt-teleop .rt-rate-label")];
  const settled = async () => { for (let i = 0; i < 300 && !labels().every((l) => l.dataset.rated); i++) await new Promise((r) => setTimeout(r, 100)); };
  btn(0, "up").click(); btn(1, "down").click();
  await settled();
  await window.__parishTest.dxFlush();
  const rated = labels().map((l) => l.dataset.rated ?? null);
  return { shown, enabled, rated, status: t.status(), stored: await window.__parishTest.dx.stored(), ratings: await t.ratings() };
});
const ADULT = { demo: false, signedIn: true, k12: false, adult: true };
const pairsFor = async (episodes) => {
  const store = dx.dxMakeStore(dx.dxMemBackend());
  for (const e of episodes) await store.put(e);
  return { adult: (await R6.rt6LocalPairs({ store, signals: ADULT })), k12: (await R6.rt6LocalPairs({ store, signals: { ...ADULT, k12: true } })).length, demo: (await R6.rt6LocalPairs({ store, signals: { ...ADULT, demo: true } })).length, signedOut: (await R6.rt6LocalPairs({ store, signals: { ...ADULT, signedIn: false } })).length };
};
dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: { demo: false, signedIn: true, k12: false } });
const t0 = Date.now();

// A — signed out: the thumbs are disabled and a rating is refused
await boot();
const A = await rateOnPage();
log("A.signedOut", { collecting: A.shown.collecting, runs: A.shown.runs, disabled: A.disabled, results: A.results, stored: A.stored, ratings: A.ratings.length });

// B — adult test profile, opt in on the Me tab, rate run A up and run B down with the pad's buttons
await page.evaluate(() => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check" })));
await boot();
await page.evaluate(() => { const u = window.__parishTest.ux; u.open(); const me = u.tabs.find((t) => /^me$|you|profile/i.test(t)); if (me) u.select(me); });
await page.evaluate(() => { document.querySelector("#dx-adult").checked = true; document.querySelector("#dx-optin").click(); });
await page.waitForFunction(() => document.querySelector("#menu-dataworks [data-dx-state]")?.getAttribute("data-dx-state") === "on", null, { timeout: 20000 });
const B = await clickRate();
const PB = await pairsFor(B.ratings);
log("B.adult", { collecting: B.shown.collecting, enabled: B.enabled, rated: B.rated, status: B.status, stored: B.stored, ratings: B.ratings.length, scenarios: B.ratings.map((e) => e.scenario), consent: B.ratings.every((e) => e.consent?.adult === true && !!e.consent?.consentId) });
log("B.rt6LocalPairs", { adult: PB.adult.length, source: PB.adult[0]?.source ?? null, station: PB.adult[0]?.station ?? null, x: PB.adult[0]?.x ?? null, k12: PB.k12, demo: PB.demo, signedOut: PB.signedOut });

// C — the same profile in a K-12 session (?k12), then in the demo: nothing more is stored
await boot("&k12");
const CK = await rateOnPage();
log("C.k12", { collecting: CK.shown.collecting, disabled: CK.disabled, results: CK.results, ratings: CK.ratings.length });
await page.evaluate(() => sessionStorage.setItem("vr-training-demo-v1", "1"));
await boot();
const CD = await rateOnPage();
log("C.demo", { collecting: CD.shown.collecting, disabled: CD.disabled, results: CD.results });
await page.evaluate(() => sessionStorage.removeItem("vr-training-demo-v1"));
await boot();
const back = await page.evaluate(async () => (await window.__parishTest.teleop.ratings()).length);
log("C.backToAdult", { ratings: back });

// D — revoke on the Me tab: the ratings are deleted
await page.evaluate(() => { const u = window.__parishTest.ux; u.open(); const me = u.tabs.find((t) => /^me$|you|profile/i.test(t)); if (me) u.select(me); });
await page.evaluate(() => document.querySelector("#dx-revoke").click());
await page.waitForFunction(() => document.querySelector("#menu-dataworks [data-dx-state]")?.getAttribute("data-dx-state") === "off", null, { timeout: 20000 });
const D = await page.evaluate(async () => ({ flush: await window.__parishTest.dxFlush(), stored: await window.__parishTest.dx.stored(), ratings: await window.__parishTest.teleop.ratings() }));
const PD = await pairsFor(D.ratings);
log("D.revoked", { stored: D.stored, ratings: D.ratings.length, rt6LocalPairs: PD.adult.length });

log("errors", { pageErrors: out.pageErrors.length, pageErrorText: out.pageErrors.slice(0, 3), externalRequests: out.offHost.length, offHost: out.offHost.slice(0, 5), threeRoutedToVendoredCopy: out.routedThree, crashed: out.crashed, seconds: Math.round((Date.now() - t0) / 1000) });
await browser.close(); close();
const proof = A.shown.collecting === false && A.disabled === 4 && A.results.every((r) => r !== "kept") && A.ratings.length === 0
  && B.shown.collecting === true && B.enabled === 4 && B.ratings.length === 2 && B.rated.join() === "up,down" && PB.adult.length === 1 && PB.adult[0].source === "human" && PB.k12 + PB.demo + PB.signedOut === 0
  && CK.shown.collecting === false && CK.results.every((r) => r !== "kept") && CK.ratings.length === 2 && CD.shown.collecting === false && CD.results.every((r) => r !== "kept") && back === 2
  && D.stored === 0 && D.ratings.length === 0 && PD.adult.length === 0
  && out.pageErrors.length === 0 && out.offHost.length === 0 && !out.crashed;
console.log(proof ? "drive_rt7_ratings: ok — signed out the thumbs are off and nothing is kept; an opted-in adult rates two robot runs → 2 ratings → rt6LocalPairs 1 pair (K-12, demo, signed-out 0); K-12 and demo sessions keep nothing; revoke → 0; page errors 0, external requests 0" : "drive_rt7_ratings: FAILED — the page-level proof did not hold (see the lines above)");
process.exit(proof ? 0 : 1);
