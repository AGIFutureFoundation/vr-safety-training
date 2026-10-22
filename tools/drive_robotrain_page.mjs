#!/usr/bin/env node
/**
 * ROBOTRAIN-5 (docs/consoles/ROBOTRAIN-5.md): the page-level proof, driven headlessly in the BUILT parishes page.
 * A signed-out visitor sees "synthetic demonstrations" on the agent-jobs provider card. Then an adult test profile signs in,
 * opts in on the Me tab and makes three cell takes on the pad (the skill-1 scripted stand-in's poses through the pad's XR seam,
 * labelled synthetic wherever they are written). The drive awaits __parishTest.dxFlush(). The provider card must read
 * "your 3 takes". After a revoke the card must read "synthetic demonstrations" and the store must hold 0 episodes, with
 * 0 page errors and 0 external requests (three.js is served from the vendored copy by tools/lib/pv_browser.mjs).
 *
 * Not in the gate (it boots the full page, about a minute). Build first, then run:
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_robotrain_page.mjs [port]
 * Prints one line per step and exits 1 when the proof does not hold.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const { pvServe, pvLaunch, pvContext } = await imp("tools/lib/pv_browser.mjs");
const rt = await imp("WebXR/shared/rt-teleop.js"), rb = await imp("WebXR/shared/rb-env.js");

function cellPoses(seed) {
  const env = rb.rbEnv("rb-cell-entry", { seed }), human = rt.rtScriptedHumanCell(env, { seed, skill: 1 });
  let obs = env.reset(); const poses = [];
  for (let i = 0; i < 300; i++) { const p = human(obs); poses.push(p); const r = env.step(rt.rtPoseToActionCell(p, obs)); obs = r.observation; if (r.done) break; }
  return { poses, summary: env.summary() };
}
const O = rt.RT_XR_FRAME.origin;
const toGrip = (p) => ({ x: p[0] + O[0], y: p[1], z: p[2] + O[2] });

const { base, close } = await pvServe(Number(process.argv[2]) || 9081);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], routedThree: 0, crashed: false };
const context = await pvContext(browser, { reducedMotion: "reduce" });
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("crash", () => { out.crashed = true; console.log("PAGE CRASHED"); });
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) { out.routedThree++; return; } out.offHost.push(u); });
const URL = `${base}/parishes/dist/parishes.html?parish=sf-downtown`;
const boot = async () => { await page.goto(URL, { waitUntil: "load", timeout: 90000 }); await page.waitForFunction(() => !!window.__parishTest?.teleop && !!window.__parishTest?.dxFlush, null, { timeout: 90000 }); };
const log = (k, v) => console.log(k, typeof v === "string" ? v : JSON.stringify(v));
// the provider card: step the panel's queue to the job that names the COLEARN policy (the queue cycles), read its Provider line
const card = (run = false) => page.evaluate((run) => {
  const t = window.__parishTest.vbridge; let j = null;
  for (let i = 0; i < 40; i++) { j = t.next(); if (j?.request?.policyId === "vb-colearn-bc-knn" && j.request.taskType === "rb-cell-entry") break; }
  const c = document.querySelector("#vb-dispatch .vb-card"); const lines = (c?.textContent ?? "").split("\n");
  const r = { job: j?.id ?? null, task: j?.request?.taskType ?? null, provider: lines.find((l) => l.startsWith("Provider:")) ?? null };
  if (run) { t.approve(); for (let i = 0; i < 120; i++) { const k = t.step(); if (!k || k.phase !== "TRANSACTION") break; } const st = t.state(); const eps = st.job.deliverable?.episode?.steps ?? []; Object.assign(r, { phase: st.job.phase, steps: eps.length, governorOnEvery: eps.length > 0 && eps.every((s) => !!s.info.governor), audit: st.verify }); }
  return r;
}, run);
const t0 = Date.now();

// A — signed out
await boot();
log("A.signedOut.local", await page.evaluate(async () => window.__parishTest.vbLocal.refresh()));
log("A.signedOut.card", await card());

// B — adult test profile, opt in on the Me tab, three takes
await page.evaluate(() => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check" })));
await boot();
log("B.tabs", await page.evaluate(() => { const u = window.__parishTest.ux; u.open(); const me = u.tabs.find((t) => /^me$|you|profile/i.test(t)); if (me) u.select(me); return { tabs: u.tabs, current: u.current(), consentVisible: !!document.querySelector("#menu-dataworks")?.offsetParent }; }));
log("B.consent.before", await page.evaluate(() => document.querySelector("#menu-dataworks [data-dx-state]")?.getAttribute("data-dx-state")));
await page.evaluate(() => { document.querySelector("#dx-adult").checked = true; document.querySelector("#dx-optin").click(); });
await page.waitForFunction(() => document.querySelector("#menu-dataworks [data-dx-state]")?.getAttribute("data-dx-state") === "on", null, { timeout: 10000 });
log("B.optedIn", await page.evaluate(() => document.querySelector("#menu-dataworks [data-dx-state]")?.textContent));
const takes = [];
for (const seed of [11, 12, 13]) {
  const { poses, summary } = cellPoses(seed);
  const r = await page.evaluate(async ({ seed, grips }) => {
    const t = window.__parishTest.teleop; t.task("rb-cell-entry"); const active = t.start(seed);
    const src = { handedness: "right", gripSpace: {}, gamepad: { buttons: [] } };
    let i = 0;
    for (const g of grips) {
      src.gamepad.buttons = [{ value: g.trigger, pressed: g.trigger >= 0.5 }, { value: g.squeeze, pressed: g.squeeze >= 0.5 }, {}, { pressed: false }, { pressed: false }];
      t.xr({ session: { inputSources: [src] }, getPose: () => ({ transform: { position: g.q } }) }, {}); t.step(); i++;
    }
    const status = t.status(); t.stop();
    return { active, fed: i, status, take: t.lastTake(), pending: window.__parishTest.dx.pending() };
  }, { seed, grips: poses.map((p) => ({ q: toGrip(p.p), trigger: p.trigger, squeeze: p.squeeze })) });
  takes.push({ seed, node: { passed: summary.passed, steps: summary.steps }, page: r });
}
log("B.takes", takes);
// the proof: await the page's own flush (no explicit re-read by the drive), then read the card the app renders
log("B.dxFlush", await page.evaluate(async () => { const pendingBefore = window.__parishTest.dx.pending(); const written = await window.__parishTest.dxFlush(); return { pendingBefore, written, pendingAfter: window.__parishTest.dx.pending(), stored: await window.__parishTest.dx.stored() }; }));
await page.waitForTimeout(50);
const cardOwn = await card(true); log("B.card", cardOwn);
log("B.local", await page.evaluate(async () => window.__parishTest.vbLocal.refresh()));
log("B.consentCount", await page.evaluate(() => document.querySelector("#menu-dataworks .row .note")?.textContent ?? null));

// C — revoke
await page.evaluate(() => document.querySelector("#dx-revoke").click());
await page.waitForFunction(() => document.querySelector("#menu-dataworks [data-dx-state]")?.getAttribute("data-dx-state") === "off", null, { timeout: 20000 });
const revoked = await page.evaluate(async () => ({ flush: await window.__parishTest.dxFlush(), stored: await window.__parishTest.dx.stored(), local: await window.__parishTest.vbLocal.refresh(), panel: document.querySelector("#menu-dataworks [data-dx-state]")?.textContent }));
log("C.revoked", revoked);
const cardRev = await card(true); log("C.card", cardRev);
log("errors", { pageErrors: out.pageErrors.length, pageErrorText: out.pageErrors.slice(0, 3), externalRequests: out.offHost.length, offHost: out.offHost.slice(0, 5), threeRoutedToVendoredCopy: out.routedThree, crashed: out.crashed, seconds: Math.round((Date.now() - t0) / 1000) });
await browser.close(); close();
const proof = /your 3 takes/.test(cardOwn.provider ?? "") && cardOwn.phase === "COMPLETED" && cardOwn.governorOnEvery && revoked.stored === 0 && /synthetic demonstrations/.test(cardRev.provider ?? "") && cardRev.job === cardOwn.job && out.pageErrors.length === 0 && out.offHost.length === 0 && !out.crashed;
console.log(proof ? "drive_robotrain_page: ok — opted in, 3 takes → the card says \"your 3 takes\" (job completed, the governor on every step); revoke → \"synthetic demonstrations\", store 0; page errors 0, external requests 0" : "drive_robotrain_page: FAILED — the page-level proof did not hold (see the lines above)");
process.exit(proof ? 0 : 1);
