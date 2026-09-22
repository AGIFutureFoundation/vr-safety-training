// Quick review clips: for each station id, a title card over the spawn view,
// then the first steps of a real run — about ten seconds each, one webm per
// station under review/<series>/raw/<id>/. build_review.py assembles them.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { mkdirSync, existsSync, rmSync, readdirSync, renameSync } from "node:fs";
import { makePage, makeOverlay, LANDSCAPE } from "../pro/helpers.mjs";
const [series, ...ids] = process.argv.slice(2);
const BASE = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
const META = JSON.parse(await (await import("node:fs/promises")).readFile("/home/user/vr-safety-training/WebXR/smartcity/catalog.json", "utf8"));
const byId = new Map(META.stations.map((s) => [s.id, s]));
const SC_URL = "http://localhost:8970/smartcity/dist/smartcity-x.html";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
async function stepOnce(page) {
  return page.evaluate(() => {
    const t = window.__smartcityTest; const s = t?.session(); if (!s || s.finished) return false;
    if (s.activeInterrupt) { s.select(s.activeInterrupt.target); return true; }
    const step = s.step; if (!step) return false;
    if (step.kind === "turn") s.rotate(step.target, (step.turn?.turns ?? 1) + 0.05);
    else if (step.kind === "gauge") { const [lo, hi] = step.gauge?.green ?? [0.44, 0.62]; s.gauge.t = (lo + hi) / 2; s.select(step.target); }
    else if (step.kind === "hold" || step.kind === "track") { if (step.kind === "track") s.track = { ...s.track, v: 0.52, rise: 0, fall: 0, drift: 0 }; t.press(step.target); for (let i = 0; i < 8; i++) { if (s.track) s.track = { ...s.track, rise: 0, fall: 0, drift: 0 }; s.tick(1.5); } t.release(); }
    else if (step.kind === "drag") s.dropAt(step.target, 0);
    else if (step.kind === "sequence" || step.kind === "find") { for (const id of step.targets) s.select(id); }
    else s.select(step.target);
    return true;
  });
}
for (const id of ids) {
  const st = byId.get(id); if (!st) { console.error("unknown", id); continue; }
  const dir = `${BASE}/review/${series}/raw/${id}`;
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const { context, page } = await makePage(browser, { record: dir, viewport: LANDSCAPE });
  await context.addInitScript((sid) => { try { const k = "vr-training-profile-v1"; const p = JSON.parse(localStorage.getItem(k) || "{}"); p.briefed = p.briefed || {}; p.briefed[sid] = "2026-01-01T00:00:00.000Z"; localStorage.setItem(k, JSON.stringify(p)); } catch (e) {} }, id);
  try {
    await page.goto(`${SC_URL}?sim=${id}&time=day`, { waitUntil: "load" });
    const ov = makeOverlay(page); await ov.injectOverlayStyles();
    await page.waitForSelector("#enter-flat", { timeout: 30000 });
    await page.evaluate(() => document.querySelector("#enter-flat").click());
    // The station builds for several seconds under swiftshader: wait for the
    // session and a rendered frame before the title goes up.
    await page.waitForFunction(() => !!window.__smartcityTest?.session()?.step, null, { timeout: 60000 });
    await page.waitForTimeout(1200);
    await ov.showTitle("SmartCiti.X", `${st.index} · ${st.name}`, st.tagline);
    await page.waitForTimeout(3200);
    await ov.hideTitle();
    await page.waitForTimeout(800);
    for (let i = 0; i < 8; i++) { if (!(await stepOnce(page))) break; await page.waitForTimeout(650); }
    await page.waitForTimeout(600);
    console.log(`${id}: ok`);
  } catch (e) { console.log(`${id}: FAIL ${e.message.split("\n")[0]}`); }
  await context.close();
  const f = readdirSync(dir).find((x) => x.endsWith(".webm")); if (f) renameSync(`${dir}/${f}`, `${dir}/take.webm`);
}
await browser.close();
