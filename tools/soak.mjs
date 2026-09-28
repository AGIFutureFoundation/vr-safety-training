/**
 * The soak (console PROVING, docs/consoles/PROVING.md, docs/perf/soak.md).
 *
 * Bay World and Redwood Reach each run for SOAK_MINUTES (10 by default) in
 * headless Chromium under SwiftShader while a scripted loop repeats: walk
 * ten seconds with a turn, open and close the map board, open and close the
 * help overlay, leave for the station runner's page in the same tab and
 * come back (the world reloads from its own state). The JS heap
 * (Performance.getMetrics JSHeapUsedSize) and the renderer's geometry and
 * texture counts are sampled every 30 s. The run FAILS when the heap grows by
 * more than SOAK_GROWTH_PCT (25 by default) between the settled first sample
 * (taken after one loop) and the median of the last three samples, or when a
 * page error occurs. Writes docs/perf/soak.json and docs/perf/soak.md.
 *
 *     node tools/soak.mjs
 *     SOAK_MINUTES=2 SOAK_ONLY=bayworld node tools/soak.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pvServe, pvLaunch, pvContext, pvOpen, pvWaitReady, pvSceneStats, pvLoad, pvCommit, PV_PAGES, PV_ROOT } from "./lib/pv_browser.mjs";

const MINUTES = Number(process.env.SOAK_MINUTES) || 10;
const GROWTH_PCT = Number(process.env.SOAK_GROWTH_PCT) || 25;
const SAMPLE_MS = Number(process.env.SOAK_SAMPLE_MS) || 30000;
const WORLDS = (process.env.SOAK_ONLY ? [process.env.SOAK_ONLY] : ["bayworld", "redwood"]).map((id) => PV_PAGES.find((p) => p.id === id));
const OUT_DIR = join(PV_ROOT, "docs", "perf");

const server = await pvServe();
let browser;
try { browser = await pvLaunch(); } catch (e) { server.close(); console.log(`✗ ${e.message}`); process.exit(1); }

async function heap(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const { metrics } = await cdp.send("Performance.getMetrics");
  await cdp.detach();
  const get = (n) => metrics.find((m) => m.name === n)?.value ?? null;
  return { heapMB: +(get("JSHeapUsedSize") / 1048576).toFixed(1), nodes: get("Nodes"), listeners: get("JSEventListeners") };
}

/** One loop of the script: walk, board, help, away and back. */
async function loop(page, spec, base) {
  await page.keyboard.down("w"); await page.waitForTimeout(4000);
  await page.keyboard.down("d"); await page.waitForTimeout(700); await page.keyboard.up("d");
  await page.waitForTimeout(4000); await page.keyboard.up("w");
  const mapBtn = await page.$("#hud-map-btn");
  if (mapBtn) { await page.evaluate(() => document.getElementById("hud-map-btn").click()); await page.waitForTimeout(800); await page.evaluate(() => document.getElementById("map-close")?.click()); await page.waitForTimeout(400); }
  await page.keyboard.press("h"); await page.waitForTimeout(600); await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  // Leave for the station runner and come back: the world page reloads.
  await page.goto(`${base}/dist/trade-skills-simulator.html`, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.goto(`${base}/dist/${spec.page}`, { waitUntil: "load", timeout: 60000 });
  for (const sel of spec.start) { await page.waitForSelector(sel, { state: "visible", timeout: 30000 }); await page.evaluate((s) => document.querySelector(s).click(), sel); await page.waitForTimeout(400); }
  await pvWaitReady(page, spec);
}

const runs = [];
for (const spec of WORLDS) {
  const context = await pvContext(browser);
  const samples = [];
  const errors = [];
  const t0 = Date.now();
  let failed = null;
  try {
    const { page, errors: errs } = await pvOpen(context, server.base, spec);
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    errors.push(...errs);
    await pvWaitReady(page, spec);
    await loop(page, spec, server.base); // settle: the first sample follows one full loop
    let nextSample = Date.now();
    const until = t0 + MINUTES * 60000;
    while (Date.now() < until) {
      if (Date.now() >= nextSample) {
        const h = await heap(page);
        const s = await pvSceneStats(page, spec).catch(() => ({}));
        samples.push({ atS: Math.round((Date.now() - t0) / 1000), ...h, geometries: s.geometries ?? null, textures: s.textures ?? null, meshes: s.meshes ?? null, load: pvLoad() });
        console.log(`  ${spec.name} ${samples.at(-1).atS}s heap ${h.heapMB} MB geometries ${s.geometries} textures ${s.textures} meshes ${s.meshes} load ${samples.at(-1).load}`);
        nextSample += SAMPLE_MS;
      }
      await loop(page, spec, server.base);
    }
    if (samples.length < 2) { const h = await heap(page); samples.push({ atS: Math.round((Date.now() - t0) / 1000), ...h, load: pvLoad() }); }
  } catch (e) { failed = String(e.message).split("\n")[0]; }
  await context.close();
  const first = samples[0]?.heapMB ?? null;
  const tail = samples.slice(-3).map((s) => s.heapMB).sort((a, b) => a - b);
  const settled = tail.length ? tail[Math.floor(tail.length / 2)] : null;
  const growthPct = first && settled ? +(((settled - first) / first) * 100).toFixed(1) : null;
  const pass = !failed && errors.length === 0 && growthPct !== null && growthPct <= GROWTH_PCT;
  runs.push({ id: spec.id, name: spec.name, minutes: +((Date.now() - t0) / 60000).toFixed(1), samples, firstHeapMB: first, settledHeapMB: settled, growthPct, errors: errors.slice(0, 3), failed, pass });
  console.log(`${pass ? "✓" : "✗"} ${spec.name}: ${samples.length} samples over ${runs.at(-1).minutes} min, heap ${first} → ${settled} MB (${growthPct}%), threshold ${GROWTH_PCT}%${errors.length ? `, page error: ${errors[0]}` : ""}${failed ? `, failed: ${failed}` : ""}`);
}
await browser.close();
server.close();

const record = { at: new Date().toISOString(), commit: pvCommit(), minutesRequested: MINUTES, sampleEveryS: SAMPLE_MS / 1000, growthThresholdPct: GROWTH_PCT,
  note: "JS heap from Chromium's Performance.getMetrics under SwiftShader on a shared machine; growth is compared within a run, so the absolute size is relative to this box.", runs };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "soak.json"), JSON.stringify(record, null, 2) + "\n");
const md = [
  "# Soak",
  "",
  `Measured ${record.at} at commit ${record.commit}. Each world runs the loop — walk ten seconds with a turn, open and close the map, open and close the help overlay, leave for the station runner and come back — for ${MINUTES} minute(s) in headless Chromium under SwiftShader; the JS heap and the renderer's geometry and texture counts are sampled every ${SAMPLE_MS / 1000} s after one settling loop. **Threshold:** the median of the last three heap samples may not exceed the first by more than ${GROWTH_PCT}%; any page error fails. Tool: \`node tools/soak.mjs\` (\`SOAK_MINUTES\`, \`SOAK_ONLY\`).`,
  "",
  "| World | minutes | samples | first heap MB | settled heap MB | growth | verdict |",
  "|---|---:|---:|---:|---:|---:|---|",
  ...runs.map((r) => `| ${r.name} | ${r.minutes} | ${r.samples.length} | ${r.firstHeapMB} | ${r.settledHeapMB} | ${r.growthPct}% | ${r.pass ? "pass" : `FAIL${r.failed ? ` (${r.failed})` : ""}${r.errors.length ? ` page error: ${r.errors[0]}` : ""}`} |`),
  "",
  "## Samples",
  "",
  ...runs.flatMap((r) => [`### ${r.name}`, "", "| t (s) | heap MB | DOM nodes | listeners | geometries | textures | meshes | load |", "|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...r.samples.map((s) => `| ${s.atS} | ${s.heapMB} | ${s.nodes} | ${s.listeners} | ${s.geometries} | ${s.textures} | ${s.meshes} | ${s.load} |`), ""]),
].join("\n");
writeFileSync(join(OUT_DIR, "soak.md"), md);
console.log(`wrote docs/perf/soak.json and docs/perf/soak.md`);
process.exit(runs.every((r) => r.pass) ? 0 : 1);
