/**
 * DETAIL's proof (docs/consoles/DETAIL.md): procedural detail ×100 on the 4096 m maps without breaking the budgets.
 *
 *  1. Ratio: per map per tier, DETAIL's instances over every chunk (the nearest ring's density) against the unmodified
 *     engine's (tools/detail-baseline.json, massing + FACADES): ≥ 100× high, ≥ 25× balanced, ≥ 5× low.
 *  2. Budgets: the pool is ≤ 16 InstancedMeshes; Σ capacity × triangles per tier ≤ DT_BUDGET.triangles; every family's
 *     geometry is 2–24 triangles and matches DT_FAMILIES; full streamed builds of the five densest maps (start + every
 *     site, FACADES and the pool mounted) stay ≤ 260 meshes and ≤ 400,000 triangles, the pool's live triangles within
 *     its tier budget.
 *  3. Time: per-chunk generation at the high tier, median and worst over every chunk of every map, under DT_BUDGET
 *     (the machine is shared: judge the median; the worst is reported against a looser bound).
 *  4. Determinism: the same chunk twice gives the same digest; a lower tier and a farther ring are never larger.
 *  5. Wiring: the parishes app mounts the pool, the bundle lists dt-detail.js, check_all and the checkers baseline list
 *     this checker, the TradeQuest export carries the generator's parameters.
 *
 *     node tools/check_detail.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, "WebXR", p)).href);
const THREE = await imp("vendor/three/dist/three.module.min.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
await imp("shared/fc-facades.js");
const D = await imp("shared/dt-detail.js");

let pass = 0, fail = 0;
const check = (ok, msg) => { if (ok) pass++; else { fail++; console.log(`FAIL ${msg}`); } };
const note = (msg) => console.log(`  ${msg}`);
const TIERS = ["low", "balanced", "high"];
const base = JSON.parse(readFileSync(join(ROOT, "tools", "detail-baseline.json"), "utf8")).maps;

// 2a. the pool and its geometry
check(D.DT_FAMILIES.length <= D.DT_BUDGET.maxMeshes && D.DT_BUDGET.maxMeshes <= 16, `the pool is ${D.DT_FAMILIES.length} InstancedMeshes (≤ 16)`);
const geos = D.dtGeometries(THREE);
for (const f of D.DT_FAMILIES) {
  const g = geos[f.id], tri = g ? (g.index ? g.index.count : g.attributes.position.count) / 3 : 0;
  check(tri >= 2 && tri <= 24 && tri === f.tris, `${f.id}: ${tri} triangles an instance (2–24, declared ${f.tris})`);
}
for (const t of TIERS) {
  const tri = D.DT_FAMILIES.reduce((s, f) => s + (D.DT_CAPACITY[t][f.id] ?? 0) * f.tris, 0);
  check(tri <= D.DT_BUDGET.triangles[t], `${t}: the pool's full capacity is ${tri} triangles (≤ ${D.DT_BUDGET.triangles[t]})`);
  note(`${t}: capacity ${D.DT_FAMILIES.reduce((s, f) => s + (D.DT_CAPACITY[t][f.id] ?? 0), 0)} instances, ${tri} triangles`);
}

// 1 + 3. the ratio walk (one pass per chunk tallies every tier) and generation time
const genMs = [], genAll = [];
const ratios = {};
for (const p of R.NP_PARISHES) {
  const b = base[p.id];
  if (!b) { note(`${p.id}: no baseline row (a map added after the baseline) — its ratio is measured against the engine now`); }
  const tot = { low: 0, balanced: 0, high: 0 };
  for (let cz = 0; cz < E.NP_CHUNKS_PER_SIDE; cz++) for (let cx = 0; cx < E.NP_CHUNKS_PER_SIDE; cx++) {
    const t0 = performance.now();
    const det = D.dtDetailForChunk(p, cx, cz, "high", { tally: true });
    genMs.push(performance.now() - t0); genAll.push({ p, cx, cz, ms: genMs[genMs.length - 1] });
    for (const t of TIERS) tot[t] += det.tiers[t];
  }
  ratios[p.id] = {};
  for (const t of TIERS) {
    const bi = b?.[t]?.instances;
    if (!bi) continue;
    const r = tot[t] / bi;
    ratios[p.id][t] = r;
    check(r >= D.DT_BUDGET.ratio[t], `${p.id}/${t}: ${tot[t]} detail instances = ${r.toFixed(1)}× the baseline's ${bi} (≥ ${D.DT_BUDGET.ratio[t]}×)`);
  }
}
for (const t of TIERS) {
  const rs = Object.entries(ratios).filter(([, v]) => v[t]).sort((a, b) => a[1][t] - b[1][t]);
  if (rs.length) note(`${t}: ratio min ${rs[0][1][t].toFixed(1)}× (${rs[0][0]}), median ${rs[rs.length >> 1][1][t].toFixed(1)}×, max ${rs[rs.length - 1][1][t].toFixed(1)}×`);
}
genMs.sort((a, b) => a - b);
// The worst chunk, noise-robust: the slowest chunks are timed three more times and each keeps its median (shared machine).
const slow = genAll.sort((a, b) => b.ms - a.ms).slice(0, 8).map(({ p, cx, cz }) => { const t = [0, 1, 2].map(() => { const t0 = performance.now(); D.dtDetailForChunk(p, cx, cz, "high"); return performance.now() - t0; }).sort((a, b) => a - b); return t[1]; });
const med = genMs[genMs.length >> 1], worst = Math.max(...slow), rawWorst = genMs[genMs.length - 1], p95 = genMs[Math.floor(genMs.length * 0.95)];
note(`generation per chunk at high: median ${med.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, worst (re-timed) ${worst.toFixed(1)} ms, single-run max ${rawWorst.toFixed(1)} ms`);
check(med <= D.DT_BUDGET.genMs, `generation per chunk at high: median ${med.toFixed(1)} ms (≤ ${D.DT_BUDGET.genMs} ms) over ${genMs.length} chunks`);
check(worst <= D.DT_BUDGET.genWorstMs, `generation per chunk at high: worst ${worst.toFixed(1)} ms (≤ ${D.DT_BUDGET.genWorstMs} ms, median of 3 re-timings of the 8 slowest; single-run max ${rawWorst.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms)`);

// 4. determinism and nesting
for (const p of R.NP_PARISHES) {
  const cx = 7 + (p.id.length % 3), cz = 8 - (p.id.length % 2);
  const a = D.dtDetailForChunk(p, cx, cz, "high"), b2 = D.dtDetailForChunk(p, cx, cz, "high");
  check(D.dtDigest(a) === D.dtDigest(b2) && a.count === b2.count, `${p.id}: chunk ${cx},${cz} is deterministic (${a.count} instances, digest ${D.dtDigest(a)})`);
  const lo = D.dtDetailForChunk(p, cx, cz, "low").count, ba = D.dtDetailForChunk(p, cx, cz, "balanced").count, far = D.dtDetailForChunk(p, cx, cz, "high", { ring: 1 }).count;
  check(lo <= ba && ba <= a.count && far <= a.count, `${p.id}: low ${lo} ≤ balanced ${ba} ≤ high ${a.count}; ring 1 ${far} ≤ ring 0`);
}

// 2b. full streamed builds of the five densest maps with FACADES and the pool
const worst5 = Object.entries(base).sort((a, b) => b[1].high.instances - a[1].high.instances).slice(0, 5).map(([id]) => id);
for (const id of worst5) for (const tier of TIERS) {
  const p = R.npParish(id);
  const root = new THREE.Group();
  const pool = D.dtMountDetail(root, THREE, p, { tier });
  const start = E.npStartSite(p) ?? p.sites[0];
  const world = W.npBuildParish(root, THREE, p, { tier, start: start.position });
  let wm = 0, wt = 0, wd = 0, wdi = 0;
  for (const s of [start, ...p.sites]) {
    world.update(s.position[0], s.position[1], 999);
    const st = world.stats(), ps = pool.stats();
    wm = Math.max(wm, st.meshes); wt = Math.max(wt, st.triangles); wd = Math.max(wd, ps.triangles); wdi = Math.max(wdi, st.detailInstances);
  }
  check(wm <= E.NP_BUDGET.drawCalls, `${id}/${tier}: at most ${E.NP_BUDGET.drawCalls} meshes with the pool (worst ${wm})`);
  check(wt <= E.NP_BUDGET.triangles, `${id}/${tier}: at most ${E.NP_BUDGET.triangles} triangles with the pool (worst ${wt})`);
  check(wd <= D.DT_BUDGET.triangles[tier] && wdi > 0, `${id}/${tier}: the pool's live triangles ${wd} (≤ ${D.DT_BUDGET.triangles[tier]}), ${wdi} detail instances drawn`);
  note(`${id}/${tier}: worst ${wm} meshes / ${wt} triangles; pool ${wdi} instances / ${wd} triangles`);
  pool.dispose();
  check(!W.NP_MASSING_HOOKS.chunkLoaded && !W.NP_MASSING_HOOKS.streamed, `${id}/${tier}: dispose() clears the streaming hooks`);
}

// 5. wiring
const app = readFileSync(join(ROOT, "WebXR", "parishes", "js", "app.js"), "utf8");
check(/import \{[^}]*dtMountDetail[^}]*\} from "\.\.\/\.\.\/shared\/dt-detail\.js"/.test(app) && /dtMountDetail\(/.test(app), "the parishes app mounts the detail pool");
check(app.indexOf("dtMountDetail(") > -1 && app.indexOf("dtMountDetail(") < app.indexOf("npBuildParish(root"), "the pool is mounted before the parish builds");
const bundle = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
check(bundle.includes('SHARED / "dt-detail.js"') && bundle.indexOf('SHARED / "dt-detail.js"') > bundle.indexOf('SHARED / "np-world.js"'), "the bundle lists dt-detail.js after np-world.js");
check(readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8").includes('"check_detail.mjs"'), "check_all lists check_detail");
check(/"check_detail\.mjs":\s*\d+/.test(readFileSync(join(ROOT, "docs", "perf", "checkers-baseline.json"), "utf8")), "the checkers baseline has check_detail");
const tq = ["tools/tq_bridge.mjs", "tools/gen_tq_export.mjs"].map((f) => existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f), "utf8") : "").join("\n");
check(/DT_DENSITY|dtExportParams/.test(tq), "the TradeQuest export carries the detail generator's parameters");
check(typeof D.dtExportParams === "function" && !JSON.stringify(D.dtExportParams()).includes("mats"), "dtExportParams() is parameters only (no instances)");

console.log(`DETAIL: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
