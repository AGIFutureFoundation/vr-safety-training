/**
 * DETAIL's proof (docs/consoles/DETAIL.md): procedural detail ×100 on the 4096 m maps without breaking the budgets.
 *
 *  1. Ratio: per map per tier, DETAIL's instances over every chunk (the nearest ring's density) against the unmodified
 *     engine's (tools/detail-baseline.json, massing + FACADES): ≥ 100× high, ≥ 25× balanced, ≥ 5× low. Every map in
 *     the tree must have a baseline row. Sampled (DETAIL-2): a stratified one-in-four sample, judged on its −3σ lower
 *     bound; a map whose bound falls short is walked in full and judged exactly. `--full` walks every chunk.
 *  2. Budgets: the pool is ≤ 16 InstancedMeshes; Σ capacity × triangles per tier ≤ DT_BUDGET.triangles; every family's
 *     geometry is 2–24 triangles and matches DT_FAMILIES; full streamed builds of the five densest maps (start + every
 *     site, FACADES and the pool mounted) stay ≤ 260 meshes and ≤ 400,000 triangles, the pool's live triangles within
 *     its tier budget.
 *  3. Time: per-chunk generation at the high tier, median and worst over the walk's chunks, under DT_BUDGET, in this
 *     process's CPU time (the machine is shared: other load stretches the wall clock, which is reported beside it).
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
const CW = await imp("shared/cw-cityworks.js");

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

// 1 + 3. the ratio walk and generation time, sampled (DETAIL-2; one pass per chunk tallies every tier). One chunk in
// four: in every 2×2 block of chunks one chunk, its place in the block drawn from the map id (a stratified sample, 64 of
// 256). The map's total is estimated as 4 × the sample's sum and the proof uses its lower bound, the estimate less 3
// standard errors (the simple-random-sample formula with the finite-population correction; stratifying only narrows the
// true spread, so the bound is conservative). A map whose lower bound misses any tier's target is walked in full (every
// chunk, exact) and judged on that. `--full` walks every chunk of every map (the old, exact walk).
const FULL = process.argv.includes("--full");
const S = E.NP_CHUNKS_PER_SIDE, NCH = S * S;
const idHash = (id) => { let h = 2166136261 >>> 0; for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
function dtSample(p) {
  const out = [];
  if (FULL) { for (let cz = 0; cz < S; cz++) for (let cx = 0; cx < S; cx++) out.push([cx, cz]); return out; }
  const h0 = idHash(p.id);
  for (let bz = 0; bz < S; bz += 2) for (let bx = 0; bx < S; bx += 2) { const h = Math.imul(h0 ^ (bx * 31 + bz * 977), 2654435761) >>> 0; out.push([bx + ((h >>> 7) & 1), bz + ((h >>> 11) & 1)]); }
  return out;
}
const genMs = [], genAll = [];
const ratios = {};
let walkedFull = 0;
const tWalk = performance.now();
for (const p of R.NP_PARISHES) {
  const b = base[p.id];
  check(!!b, `${p.id}: has a baseline row in tools/detail-baseline.json (tools/dt_measure.mjs --missing adds one)`);
  const seen = new Set(), per = { low: [], balanced: [], high: [] };
  const gen = (cx, cz) => {
    const c0 = process.cpuUsage(), t0 = performance.now();
    const det = D.dtDetailForChunk(p, cx, cz, "high", { tally: true });
    const ms = performance.now() - t0, c = process.cpuUsage(c0);
    genMs.push(ms); genAll.push({ p, cx, cz, ms, cpu: (c.user + c.system) / 1000 }); seen.add(cx + cz * S);
    return det;
  };
  for (const [cx, cz] of dtSample(p)) { const det = gen(cx, cz); for (const t of TIERS) per[t].push(det.tiers[t]); }
  const n = per.high.length, est = {};
  for (const t of TIERS) {
    const mean = per[t].reduce((a, v) => a + v, 0) / n;
    const s2 = n > 1 ? per[t].reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1) : 0;
    const total = mean * NCH, se = n >= NCH ? 0 : NCH * Math.sqrt((1 - n / NCH) * s2 / n);
    est[t] = { total, lb: total - 3 * se };
  }
  ratios[p.id] = {};
  if (!b) continue;
  let exact = n >= NCH;
  if (TIERS.some((t) => b[t]?.instances && est[t].lb / b[t].instances < D.DT_BUDGET.ratio[t])) {
    // The bound is short: walk the rest of the map and judge the exact totals.
    const tot = Object.fromEntries(TIERS.map((t) => [t, per[t].reduce((a, v) => a + v, 0)]));
    for (let cz = 0; cz < S; cz++) for (let cx = 0; cx < S; cx++) { if (seen.has(cx + cz * S)) continue; const det = gen(cx, cz); for (const t of TIERS) tot[t] += det.tiers[t]; }
    for (const t of TIERS) est[t] = { total: tot[t], lb: tot[t] };
    exact = true; walkedFull++;
  }
  for (const t of TIERS) {
    const bi = b[t]?.instances;
    if (!bi) continue;
    const r = est[t].total / bi, lb = est[t].lb / bi;
    ratios[p.id][t] = r;
    check(lb >= D.DT_BUDGET.ratio[t], exact
      ? `${p.id}/${t}: ${Math.round(est[t].total)} detail instances over every chunk = ${r.toFixed(1)}× the baseline's ${bi} (≥ ${D.DT_BUDGET.ratio[t]}×)`
      : `${p.id}/${t}: ${r.toFixed(1)}× the baseline's ${bi}, estimated from ${n} of ${NCH} chunks; lower bound (−3σ) ${lb.toFixed(1)}× (≥ ${D.DT_BUDGET.ratio[t]}×)`);
  }
}
note(`ratio walk: ${genMs.length} chunks in ${((performance.now() - tWalk) / 1000).toFixed(1)} s (${FULL ? "every chunk" : `one in four; ${walkedFull} map(s) walked in full`})`);
for (const t of TIERS) {
  const rs = Object.entries(ratios).filter(([, v]) => v[t]).sort((a, b) => a[1][t] - b[1][t]);
  if (rs.length) note(`${t}: ratio min ${rs[0][1][t].toFixed(1)}× (${rs[0][0]}), median ${rs[rs.length >> 1][1][t].toFixed(1)}×, max ${rs[rs.length - 1][1][t].toFixed(1)}×`);
}
genMs.sort((a, b) => a - b);
// Generation cost is judged on this process's CPU time (process.cpuUsage), not the wall clock: the machine is shared by
// several consoles, and other processes' load stretches the wall clock but not the CPU time a chunk costs (DETAIL-2;
// the wall-clock figures are reported beside it). The worst chunk: the 8 slowest by CPU are re-timed three times and
// each keeps its median.
const cpuMs = genAll.map((g) => g.cpu).sort((a, b) => a - b);
const cpuOf = (p, cx, cz) => { const c0 = process.cpuUsage(); D.dtDetailForChunk(p, cx, cz, "high"); const c = process.cpuUsage(c0); return (c.user + c.system) / 1000; };
const slow = genAll.sort((a, b) => b.cpu - a.cpu).slice(0, 8).map(({ p, cx, cz }) => [0, 1, 2].map(() => cpuOf(p, cx, cz)).sort((a, b) => a - b)[1]);
const med = cpuMs[cpuMs.length >> 1], worst = Math.max(...slow), p95 = cpuMs[Math.floor(cpuMs.length * 0.95)];
const wMed = genMs[genMs.length >> 1], wP95 = genMs[Math.floor(genMs.length * 0.95)], wMax = genMs[genMs.length - 1];
note(`generation per chunk at high (CPU): median ${med.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, worst (re-timed) ${worst.toFixed(1)} ms; wall clock: median ${wMed.toFixed(1)} ms, p95 ${wP95.toFixed(1)} ms, single-run max ${wMax.toFixed(1)} ms`);
check(med <= D.DT_BUDGET.genMs, `generation per chunk at high: median ${med.toFixed(1)} ms CPU (≤ ${D.DT_BUDGET.genMs} ms) over ${cpuMs.length} chunks (the walk's; wall clock ${wMed.toFixed(1)} ms)`);
check(worst <= D.DT_BUDGET.genWorstMs, `generation per chunk at high: worst ${worst.toFixed(1)} ms CPU (≤ ${D.DT_BUDGET.genWorstMs} ms, median of 3 re-timings of the 8 slowest; wall-clock single-run max ${wMax.toFixed(1)} ms)`);

// 4. determinism and nesting
for (const p of R.NP_PARISHES) {
  const cx = 7 + (p.id.length % 3), cz = 8 - (p.id.length % 2);
  const a = D.dtDetailForChunk(p, cx, cz, "high"), b2 = D.dtDetailForChunk(p, cx, cz, "high");
  check(D.dtDigest(a) === D.dtDigest(b2) && a.count === b2.count, `${p.id}: chunk ${cx},${cz} is deterministic (${a.count} instances, digest ${D.dtDigest(a)})`);
  const lo = D.dtDetailForChunk(p, cx, cz, "low").count, ba = D.dtDetailForChunk(p, cx, cz, "balanced").count, far = D.dtDetailForChunk(p, cx, cz, "high", { ring: 1 }).count;
  check(lo <= ba && ba <= a.count && far <= a.count, `${p.id}: low ${lo} ≤ balanced ${ba} ≤ high ${a.count}; ring 1 ${far} ≤ ring 0`);
}

// 6. the Louisiana rows (DETAIL-2): every variant row is in the table; keyed by region and district, never by map id
for (const [, , row] of D.DT_VARIANTS) check(Array.isArray(D.DT_TABLE[row]) && D.DT_TABLE[row].length > 0, `variant row "${row}" is in DT_TABLE`);
for (const row of ["cypress", "bayouedge", "bayoushore", "crabwater"]) check(Array.isArray(D.DT_TABLE[row]), `the Louisiana water row "${row}" is in DT_TABLE`);
check(!/\b(la|laf|lc|nola|monroe)-[a-z-]+/.test(readFileSync(join(ROOT, "WebXR", "shared", "dt-detail.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")), "dt-detail.js keys nothing by a map id");
const laRows = {};
for (const p of R.NP_PARISHES) {
  const v = D.dtVariants(p);
  const la = D.DT_LA_REGIONS.test(p.region ?? "new-orleans");
  check(v.la === la, `${p.id}: Louisiana rows ${la ? "on" : "off"} by its region (${p.region ?? "new-orleans"})`);
  for (const d of p.districts ?? []) {
    const want = la ? D.DT_VARIANTS.find(([ch, re]) => ch === d.character && (!re || re.test(d.name ?? "")))?.[2] ?? null : null;
    if (want) { check(v.rows.get(`${d.id}|${d.name}`) === want, `${p.id}: "${d.name}" takes the ${want} row`); (laRows[want] ??= new Set()).add(p.id); }
  }
}
note(`Louisiana rows in use: ${Object.entries(laRows).map(([r, s]) => `${r} ${s.size}`).join(", ")}`);
for (const row of ["cane", "rice", "apron", "hangar", "slipway", "piperack", "gallery"]) check(laRows[row]?.size > 0, `the ${row} row is used by at least one map`);

// 6b. the gallery faces the street (SURVEYOR-2): on every drawn quarter block of every gallery district (after CITYWORKS'
// cwMassFilter, as the app builds), the gallery's face is
// the one the ray to the nearest street leaves the block through, its outward normal points at the street, and its deck
// stands nearer the street than the block's centre. The old rule (always the local +z face) is counted for the record.
{
  let blocks = 0, facing = 0, nearer = 0, oldOk = 0;
  for (const id of laRows.gallery ?? []) {
    const p = R.npParish(id), v = D.dtVariants(p), drawn = CW.cwMassFilter(p);
    for (const d of p.districts ?? []) {
      if (d.character !== "quarter" || v.rows.get(`${d.id}|${d.name}`) !== "gallery") continue;
      const xs = d.poly.map((q) => q[0]), zs = d.poly.map((q) => q[1]), half = E.NP_SIZE / 2;
      const c0 = Math.max(0, Math.floor((Math.min(...xs) + half) / E.NP_CHUNK)), c1 = Math.min(S - 1, Math.floor((Math.max(...xs) + half) / E.NP_CHUNK));
      const r0 = Math.max(0, Math.floor((Math.min(...zs) + half) / E.NP_CHUNK)), r1 = Math.min(S - 1, Math.floor((Math.max(...zs) + half) / E.NP_CHUNK));
      for (let cz = r0; cz <= r1; cz++) for (let cx = c0; cx <= c1; cx++) for (const s of E.npMassingForChunk(p, cx, cz)) {
        if (s.kind !== "quarterBlock" || !drawn(s) || E.npDistrictAt(p, s.x, s.z)?.id !== d.id) continue;
        const g = D.dtGalleryFace(p, s);
        if (!g.street) continue;
        blocks++;
        const dx = g.street[0] - s.x, dz = g.street[1] - s.z, c = Math.cos(s.rot), sn = Math.sin(s.rot);
        const lx = c * dx - sn * dz, lz = sn * dx + c * dz, hx = 8 * s.s, hz = 6 * s.s;
        const exit = Math.abs(lz) * hx >= Math.abs(lx) * hz ? (lz >= 0 ? 0 : 2) : (lx >= 0 ? 1 : 3);
        const nx = Math.sin(g.yaw), nz = Math.cos(g.yaw); // the chosen face's outward normal in the world
        if (g.face === exit && nx * dx + nz * dz > 0) facing++;
        const deckX = s.x + nx * (g.hd + 0.65), deckZ = s.z + nz * (g.hd + 0.65);
        if (Math.hypot(g.street[0] - deckX, g.street[1] - deckZ) < Math.hypot(dx, dz)) nearer++;
        if (exit === 0) oldOk++;
      }
    }
  }
  check(blocks > 0 && facing === blocks, `gallery: ${facing} of ${blocks} quarter blocks put the gallery on the face toward the nearest street`);
  check(blocks > 0 && nearer === blocks, `gallery: ${nearer} of ${blocks} gallery decks stand nearer the street than the block's centre`);
  note(`gallery: the old local +z rule faced the street on ${oldOk} of ${blocks} blocks`);
}

// 2b. full streamed builds of the five densest maps (start + every site, FACADES mounted), bounded (DETAIL-2): the engine is
// built without the pool and the pool's worst case is added — its DT_FAMILIES.length meshes and its whole capacity's
// triangles (2a proves Σ capacity × triangles ≤ DT_BUDGET; the pool can never draw more than its capacity). That bound
// is sound and needs no detail generation, which was ~95 % of this section's time. One live build (the densest map at
// every tier, the start and two sites, the pool mounted) proves the pool fills, stays in budget and unhooks on dispose.
const tBuild = performance.now();
const worst5 = Object.entries(base).sort((a, b) => b[1].high.instances - a[1].high.instances).slice(0, 5).map(([id]) => id);
const capTris = Object.fromEntries(TIERS.map((t) => [t, D.DT_FAMILIES.reduce((s, f) => s + (D.DT_CAPACITY[t][f.id] ?? 0) * f.tris, 0)]));
for (const id of worst5) for (const tier of TIERS) {
  const p = R.npParish(id);
  const root = new THREE.Group();
  check(!W.NP_MASSING_HOOKS.chunkLoaded, `${id}/${tier}: built without the pool (its worst case is added)`);
  const start = E.npStartSite(p) ?? p.sites[0];
  const world = W.npBuildParish(root, THREE, p, { tier, start: start.position });
  let wm = 0, wt = 0;
  for (const s of [start, ...p.sites]) {
    world.update(s.position[0], s.position[1], 999);
    const st = world.stats();
    wm = Math.max(wm, st.meshes); wt = Math.max(wt, st.triangles);
  }
  world.dispose?.();
  const bm = wm + D.DT_FAMILIES.length, bt = wt + capTris[tier];
  check(bm <= E.NP_BUDGET.drawCalls, `${id}/${tier}: at most ${E.NP_BUDGET.drawCalls} meshes with the pool (worst ${wm} + the pool's ${D.DT_FAMILIES.length} = ${bm})`);
  check(bt <= E.NP_BUDGET.triangles, `${id}/${tier}: at most ${E.NP_BUDGET.triangles} triangles with the pool full (worst ${wt} + capacity ${capTris[tier]} = ${bt})`);
  note(`${id}/${tier}: worst ${wm} meshes / ${wt} triangles without the pool; bound with it full ${bm} / ${bt}`);
}
{
  const id = worst5[0], p = R.npParish(id);
  for (const tier of TIERS) {
    const root = new THREE.Group();
    const pool = D.dtMountDetail(root, THREE, p, { tier });
    const start = E.npStartSite(p) ?? p.sites[0];
    const world = W.npBuildParish(root, THREE, p, { tier, start: start.position });
    let wm = 0, wt = 0, wd = 0, wdi = 0;
    for (const s of [start, ...p.sites.slice(0, 2)]) {
      world.update(s.position[0], s.position[1], 999);
      const st = world.stats(), ps = pool.stats();
      wm = Math.max(wm, st.meshes); wt = Math.max(wt, st.triangles); wd = Math.max(wd, ps.triangles); wdi = Math.max(wdi, st.detailInstances);
    }
    check(wm <= E.NP_BUDGET.drawCalls && wt <= E.NP_BUDGET.triangles, `${id}/${tier} live: ${wm} meshes (≤ ${E.NP_BUDGET.drawCalls}), ${wt} triangles (≤ ${E.NP_BUDGET.triangles}) with the pool`);
    check(wd <= D.DT_BUDGET.triangles[tier] && wdi > 0, `${id}/${tier} live: the pool's triangles ${wd} (≤ ${D.DT_BUDGET.triangles[tier]}), ${wdi} detail instances drawn`);
    note(`${id}/${tier} live: worst ${wm} meshes / ${wt} triangles; pool ${wdi} instances / ${wd} triangles`);
    pool.dispose(); world.dispose?.();
    check(!W.NP_MASSING_HOOKS.chunkLoaded && !W.NP_MASSING_HOOKS.streamed, `${id}/${tier}: dispose() clears the streaming hooks`);
  }
}
note(`full builds (${worst5.join(", ")}): ${((performance.now() - tBuild) / 1000).toFixed(1)} s`);

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
