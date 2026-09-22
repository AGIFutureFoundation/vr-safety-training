// Drive one station through every step in the real browser build, the way the
// promo recorder does. A step-kind change is exactly the sort of edit that
// checks clean headless and then does not work under a mouse.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { makePage } from "./pro/helpers.mjs";
const sim = process.argv[2];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const { context, page } = await makePage(browser, { viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await context.addInitScript((sid) => { try {
  const k = "vr-training-profile-v1"; const p = JSON.parse(localStorage.getItem(k) || "{}");
  p.briefed = p.briefed || {}; p.briefed[sid] = "2026-01-01T00:00:00.000Z";
  localStorage.setItem(k, JSON.stringify(p));
} catch (e) {} }, sim);
await page.goto(`http://localhost:8970/smartcity/dist/smartcity-x.html?sim=${sim}&time=day`, { waitUntil: "load" });
await page.waitForSelector("#enter-flat", { timeout: 20000 });
await page.evaluate(() => document.querySelector("#enter-flat").click());
await page.waitForTimeout(2200);
const seen = [];
for (let i = 0; i < 40; i++) {
  const info = await page.evaluate(() => {
    const t = window.__smartcityTest; const s = t?.session();
    if (!s) return { error: "no session" };
    if (s.finished) return { finished: true };
    if (s.activeInterrupt) { s.select(s.activeInterrupt.target); return { kind: "interrupt" }; }
    const step = s.step; if (!step) return { error: "no step" };
    const id = step.id, kind = step.kind;
    if (kind === "turn") s.rotate(step.target, (step.turn?.turns ?? 1) + 0.05);
    else if (kind === "gauge") { const [lo, hi] = step.gauge?.green ?? [0.44, 0.62]; s.gauge.t = (lo + hi) / 2; s.select(step.target); }
    else if (kind === "hold") t.press(step.target);
    else if (kind === "track") { const [lo, hi] = step.track?.green ?? [0.42, 0.62]; s.track = { ...s.track, v: (lo + hi) / 2, rise: 0, fall: 0, drift: 0 }; t.press(step.target); }
    else if (kind === "drag") s.dropAt(step.target, 0);
    else if (kind === "sequence" || kind === "find") { for (const x of step.targets) s.select(x); }
    else s.select(step.target);
    return { id, kind, seconds: step.seconds ?? 1 };
  });
  if (info.error) { console.log("ERROR:", info.error); break; }
  if (info.finished) { console.log("FINISHED"); break; }
  if (info.id) seen.push(`${info.id}:${info.kind}`);
  if (info.kind === "hold" || info.kind === "track") {
    // Break on the step ID changing, not on the kind changing and not on
    // holdFor: a track step's progress lives in track.inBand rather than
    // holdFor, so the old condition never fired for one, and when the next
    // step was also a hold it kept ticking 1.5s at a time into it — which
    // fast-forwarded the session clock far enough to time out any
    // interruption armed on that step. Also answer anything that fires while
    // we are holding, the same way the outer loop does.
    for (let h = 0; h < 20; h++) {
      const st = await page.evaluate((want) => {
        const s = window.__smartcityTest.session();
        if (!s || s.finished) return { done: true };
        if (s.activeInterrupt) { s.select(s.activeInterrupt.target); return { done: false, fired: true }; }
        if (s.step?.id !== want) return { done: true };
        if (s.track) s.track = { ...s.track, rise: 0, fall: 0, drift: 0 };
        s.tick(1.5);
        return { done: false };
      }, info.id);
      if (st.done) break;
      if (st.fired) seen.push("!interrupt");
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.__smartcityTest.release());
  }
  await page.waitForTimeout(160);
}
const sum = await page.evaluate(() => { const s = window.__smartcityTest.session(); return { finished: s?.finished, score: s?.score, hazards: s?.hazardHits }; });
console.log(`${sim}: ${seen.length} steps — ${seen.join(" ")}`);
console.log("result:", JSON.stringify(sum));
await context.close(); await browser.close();
