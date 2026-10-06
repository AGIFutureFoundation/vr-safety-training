/**
 * The frame-time harness (console PROVING, docs/consoles/PROVING.md).
 *
 * For each world and the two station apps, headless Chromium under
 * SwiftShader opens the page at 1280 x 720 on the low tier (`?tier=low&
 * quality=low`: 0.75 pixel scale, no shadows, nearer fog, fewer agents,
 * 512 px textures) and the high tier (`?tier=high&quality=high`), starts it,
 * and over a scripted walk — W held, a turn to the right every four seconds
 * and one to the left half way — records every animation-frame delta for
 * MF_SECONDS seconds (20 by default). Beside the frame times it counts the
 * live scene's meshes, instanced meshes and instances and reads what the
 * renderer drew in its last frame (draw calls, triangles, geometries,
 * textures).
 *
 * SwiftShader is a software rasteriser on a shared four-core box: the
 * milliseconds are RELATIVE (world against world, tier against tier, run
 * against run at a similar load), never a device's frame time. The load
 * average is written beside every run for that reason.
 *
 * Writes docs/perf/frames.json and the table in docs/perf/README.md.
 *
 *     node tools/measure_frames.mjs                 # every page, both tiers
 *     MF_ONLY=summit MF_SECONDS=5 node tools/measure_frames.mjs
 *     MF_TIERS=low node tools/measure_frames.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pvServe, pvLaunch, pvContext, pvOpen, pvWaitReady, pvSceneStats, pvLoad, pvCommit, PV_PAGES, PV_ROOT, PV_DIST } from "./lib/pv_browser.mjs";

const SECONDS = Number(process.env.MF_SECONDS) || 20;
const TIERS = (process.env.MF_TIERS || "low,high").split(",").map((s) => s.trim()).filter(Boolean);
const PAGES = process.env.MF_ONLY ? PV_PAGES.filter((p) => p.id === process.env.MF_ONLY) : PV_PAGES;
const OUT_DIR = join(PV_ROOT, "docs", "perf");
const OUT_JSON = join(OUT_DIR, "frames.json");
const OUT_MD = join(OUT_DIR, "README.md");

for (const p of PAGES) if (!existsSync(join(PV_DIST, p.page))) { console.log(`✗ WebXR/dist/${p.page} is missing — run python3 tools/bundle_webxr.py`); process.exit(1); }

/** In the page: sample animation-frame deltas for `seconds`. */
function sampleFrames(seconds) {
  return new Promise((resolve) => {
    const deltas = [];
    let last = performance.now();
    const until = last + seconds * 1000;
    const tick = (now) => {
      deltas.push(now - last); last = now;
      if (now < until) requestAnimationFrame(tick); else resolve(deltas);
    };
    requestAnimationFrame(tick);
  });
}

function summarise(deltas) {
  const d = deltas.slice(1).filter((x) => x > 0).sort((a, b) => a - b);
  const n = d.length;
  if (!n) return { frames: 0, avgMs: null, p50Ms: null, p95Ms: null, worstMs: null, fps: null };
  const avg = d.reduce((a, b) => a + b, 0) / n;
  const q = (p) => d[Math.min(n - 1, Math.floor(n * p))];
  return { frames: n, avgMs: +avg.toFixed(2), p50Ms: +q(0.5).toFixed(2), p95Ms: +q(0.95).toFixed(2), worstMs: +d[n - 1].toFixed(2), fps: +(1000 / avg).toFixed(1) };
}

/** The scripted walk, driven from Node so the page's own key handling runs. */
async function walk(page, spec, seconds) {
  const sampling = page.evaluate(sampleFrames, seconds);
  if (spec.walk) {
    await page.keyboard.down("w");
    const steps = Math.floor(seconds / 4);
    for (let i = 1; i <= steps; i++) {
      await page.waitForTimeout(3400);
      const key = i === Math.ceil(steps / 2) ? "a" : "d";
      await page.keyboard.down(key); await page.waitForTimeout(600); await page.keyboard.up(key);
    }
    await page.keyboard.up("w");
  }
  return sampling;
}

const server = await pvServe();
let browser;
try { browser = await pvLaunch(); } catch (e) { server.close(); console.log(`✗ ${e.message}`); process.exit(1); }

const runs = [];
const startedAt = new Date().toISOString();
for (const spec of PAGES) {
  for (const tier of TIERS) {
    const tag = `${spec.name} · ${tier}`;
    const context = await pvContext(browser);
    const load0 = pvLoad();
    const t0 = Date.now();
    try {
      const { page, errors } = await pvOpen(context, server.base, spec, { query: `?tier=${tier}&quality=${tier}` });
      await pvWaitReady(page, spec);
      const readyMs = Date.now() - t0;
      await page.waitForTimeout(1500); // let streaming settle before the clock starts
      const deltas = await walk(page, spec, SECONDS);
      const stats = await pvSceneStats(page, spec);
      const tierSeen = await page.evaluate(() => document.documentElement.dataset.tier ?? null);
      const run = { id: spec.id, name: spec.name, page: spec.page, tier, tierSeen, seconds: SECONDS, readyMs, ...summarise(deltas), ...stats, errors: errors.slice(0, 3), loadAvg: [load0, pvLoad()] };
      runs.push(run);
      console.log(`✓ ${tag.padEnd(40)} ${String(run.avgMs).padStart(7)} ms avg ${String(run.p95Ms).padStart(7)} ms p95  ${run.fps} fps  ${run.meshes} meshes ${run.instanced} instanced (${run.instances} inst)  ${(run.triangles / 1000).toFixed(0)}k tris  ${run.calls} calls  load ${load0}→${run.loadAvg[1]}${errors.length ? `  errors: ${errors[0]}` : ""}`);
    } catch (e) {
      runs.push({ id: spec.id, name: spec.name, page: spec.page, tier, seconds: SECONDS, failed: String(e.message).split("\n")[0], loadAvg: [load0, pvLoad()] });
      console.log(`✗ ${tag}: ${String(e.message).split("\n")[0]}`);
    }
    await context.close();
  }
}
await browser.close();
server.close();

const record = {
  at: startedAt, commit: pvCommit(), seconds: SECONDS, viewport: "1280x720",
  note: "SwiftShader (software rasteriser) on a shared four-core machine: frame times are RELATIVE — compare worlds, tiers and runs at a similar load average; they are not device numbers.",
  tiers: { low: "?tier=low&quality=low — pixel scale 0.75, no shadows, fog x1.6, wildlife x0.4, traffic x0.5, 512 px textures", high: "?tier=high&quality=high — pixel scale 1, shadows, full agents, 1024 px textures" },
  runs,
};
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(record, null, 2) + "\n");

// The README table, between its markers (the rest of the file is hand-written).
const rows = runs.map((r) => r.failed
  ? `| ${r.name} | ${r.tier} | — | — | — | — | — | — | — | failed: ${r.failed} (load ${r.loadAvg.join("→")}) |`
  : `| ${r.name} | ${r.tier} | ${r.avgMs} | ${r.p95Ms} | ${r.worstMs} | ${r.fps} | ${r.meshes} + ${r.instanced}×(${r.instances}) | ${(r.triangles / 1000).toFixed(0)}k | ${r.calls} | load ${r.loadAvg.join("→")}${r.errors?.length ? `; page error: ${r.errors[0]}` : ""} |`);
const table = [
  `Measured ${startedAt} at commit ${record.commit}, ${SECONDS} s walk per row, 1280×720, SwiftShader (relative numbers, see the note above).`,
  "",
  "| Page | Tier | avg ms | p95 ms | worst ms | fps | meshes + instanced×(instances) | triangles | draw calls | conditions |",
  "|---|---|---:|---:|---:|---:|---|---:|---:|---|",
  ...rows,
].join("\n");
const START = "<!-- frames:start -->", END = "<!-- frames:end -->";
let md = existsSync(OUT_MD) ? readFileSync(OUT_MD, "utf8") : `# Performance proofs\n\n${START}\n${END}\n`;
if (!md.includes(START)) md += `\n${START}\n${END}\n`;
md = md.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${table}\n${END}`);
writeFileSync(OUT_MD, md);
console.log(`wrote docs/perf/frames.json (${runs.length} runs) and the table in docs/perf/README.md`);
process.exit(runs.some((r) => r.failed) ? 1 : 0);
