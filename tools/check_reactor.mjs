#!/usr/bin/env node
/**
 * REACTOR's profile of the parish engine (console REACTOR, docs/consoles/REACTOR.md). Pure Node on the vendored three.js,
 * no browser.
 *
 *  1. Exactness (always judged): the hot-path shortcuts return what the long way returns — npPolyDist equals
 *     npPolyDistance's `d` bit for bit on seeded samples against every river, levee and road of every map; the one-entry
 *     memos of npWaterAt and npLeveeRise answer the same after an interleaved query; a chunk's terrain rebuilt twice is
 *     identical.
 *  2. Profile per map (recorded to docs/perf/reactor.json): boot ms (npBuildParish at the start site, high tier), ms per
 *     streamed chunk (walking every site), µs per call of npHeightAt, npWaterAt, tfWaterDepthAt and cwColliders, meshes
 *     and triangles at the start.
 *  3. Frame budget (judged only on a quiet run — load average at or under the core count at start and end, as
 *     check_proving judges timings): one streaming step (the page's update budget, three chunks) fits a 50 ms frame on
 *     every map, and boot stays under 3 s per map. A run under contention is reported, not judged.
 *
 *     node tools/check_reactor.mjs            # check and record
 *     node tools/check_reactor.mjs --no-write # check only
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { availableParallelism, loadavg } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, "WebXR", p)).href);
const t0 = performance.now();
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const T = await imp("shared/tf-terraform.js");
const C = await imp("shared/cw-cityworks.js");
const W = await imp("shared/np-world.js");
const THREE = await imp("vendor/three/dist/three.module.min.js");

export const RX_FRAME_MS = 50;   // one streaming step (three chunks) must fit a 20 fps frame on SwiftShader-class hardware
export const RX_BOOT_MS = 3000;  // a map's first build at its start site
const CORES = availableParallelism();
const loadStart = loadavg()[0];
let passed = 0, failed = 0;
const check = (ok, msg) => { if (ok) passed++; else { failed++; console.log(`✗ ${msg}`); } return ok; };
const rxRng = (seed) => () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
const rxMedian = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

// 1. exactness
for (const p of R.NP_PARISHES) {
  const prep = E.npPrepare(p), rnd = rxRng(7 + p.id.length);
  const lines = [...prep.rivers.map((r) => r.centre), ...prep.levees.map((l) => l.pts), ...prep.roads.map((r) => r.pts)].filter((pts) => pts?.length > 1);
  let same = 0, n = 0;
  for (const pts of lines) for (let i = 0; i < 40; i++) {
    const x = (rnd() - 0.5) * 4096, z = (rnd() - 0.5) * 4096;
    n++; if (E.npPolyDist(x, z, pts) === E.npPolyDistance(x, z, pts).d) same++;
  }
  check(same === n, `${p.id}: npPolyDist equals npPolyDistance's d on ${n} samples (${n - same} differ)`);
  let memoOk = true;
  for (let i = 0; i < 200; i++) {
    const x = (rnd() - 0.5) * 4096, z = (rnd() - 0.5) * 4096, ox = (rnd() - 0.5) * 4096;
    const w1 = E.npWaterAt(p, x, z), l1 = E.npLeveeRise(p, x, z);
    E.npWaterAt(p, ox, z); E.npLeveeRise(p, ox, z);
    if (E.npWaterAt(p, x, z) !== w1 || E.npLeveeRise(p, x, z) !== l1 || E.npWaterAt(p, x, z) !== E.npWaterAt(p, x, z)) memoOk = false;
  }
  check(memoOk, `${p.id}: the npWaterAt and npLeveeRise memos answer the same after an interleaved query`);
}

// 2. profile
const rows = {};
for (const p of R.NP_PARISHES) {
  const start = E.npStartSite(p)?.position ?? [0, 0];
  W.npBuildParish(new THREE.Group(), THREE, p, { tier: "low", start }); // warm the prep and the JIT
  const tb = performance.now();
  const world = W.npBuildParish(new THREE.Group(), THREE, p, { tier: "high", start });
  const bootMs = performance.now() - tb;
  const st = world.stats();
  const ck = [...world.loaded.keys()][0], y1 = Array.from(world.loaded.get(ck).mesh.geometry.attributes.position.array);
  let chunks = 0; const steps = [];
  for (const s of p.sites) { const ts = performance.now(); const b = world.update(s.position[0], s.position[1], 3); if (b) { steps.push(performance.now() - ts); chunks += b; } }
  const w2 = W.npBuildParish(new THREE.Group(), THREE, p, { tier: "high", start });
  const y2 = w2.loaded.get(ck)?.mesh.geometry.attributes.position.array;
  check(!!y2 && y1.length === y2.length && y1.every((v, i) => v === y2[i]), `${p.id}: chunk ${ck} rebuilds identically`);
  const rnd = rxRng(99), pts = Array.from({ length: 4000 }, () => [(rnd() - 0.5) * 4000, (rnd() - 0.5) * 4000]);
  const per = (f, list = pts) => { const r = []; for (let k = 0; k < 3; k++) { const t = performance.now(); for (const [x, z] of list) f(x, z); r.push(((performance.now() - t) / list.length) * 1000); } return +rxMedian(r).toFixed(2); };
  const keys = []; for (let cx = 0; cx < 16; cx++) for (let cz = 0; cz < 16; cz++) keys.push([cx, cz]);
  rows[p.id] = {
    bootMs: Math.round(bootMs), stepMs: +(steps.length ? Math.max(...steps) : 0).toFixed(1), msPerChunk: +(steps.reduce((a, b) => a + b, 0) / Math.max(1, chunks)).toFixed(2),
    heightUs: per((x, z) => E.npHeightAt(p, x, z)), waterUs: per((x, z) => E.npWaterAt(p, x, z)),
    depthUs: per((x, z) => T.tfWaterDepthAt(p, x, z), pts.slice(0, 1000)), collidersUs: per((cx, cz) => C.cwColliders(p, `${cx},${cz}`), keys),
    meshes: st.meshes, triangles: st.triangles,
  };
}
const loadEnd = loadavg()[0];
const quiet = loadStart <= CORES && loadEnd <= CORES;

// 3. frame budget, judged only when quiet
for (const [id, r] of Object.entries(rows)) {
  console.log(`  ${id.padEnd(22)} boot ${String(r.bootMs).padStart(5)} ms  step ${String(r.stepMs).padStart(5)} ms  chunk ${r.msPerChunk} ms  npHeightAt ${r.heightUs} µs  npWaterAt ${r.waterUs} µs  tfWaterDepthAt ${r.depthUs} µs  cwColliders ${r.collidersUs} µs  ${r.meshes} meshes ${r.triangles} tris`);
  if (quiet) {
    check(r.stepMs <= RX_FRAME_MS, `${id}: one streaming step fits a ${RX_FRAME_MS} ms frame (${r.stepMs} ms)`);
    check(r.bootMs <= RX_BOOT_MS, `${id}: boot within ${RX_BOOT_MS} ms (${r.bootMs} ms)`);
  }
}
if (!quiet) console.log(`  · load average ${loadStart.toFixed(1)} → ${loadEnd.toFixed(1)} on ${CORES} cores: timings reported, not judged`);
if (!process.argv.includes("--no-write")) {
  writeFileSync(join(ROOT, "docs", "perf", "reactor.json"), JSON.stringify({ at: new Date().toISOString(), cores: CORES, loadAvgStart: +loadStart.toFixed(2), loadAvgEnd: +loadEnd.toFixed(2), judged: quiet, frameMs: RX_FRAME_MS, bootMs: RX_BOOT_MS, maps: rows }, null, 2) + "\n");
}
console.log(`check_reactor: ${passed} passed, ${failed} failed (${Object.keys(rows).length} maps profiled, ${quiet ? "judged" : "not judged: contended"}, ${Math.round(performance.now() - t0)} ms)`);
process.exit(failed ? 1 : 0);
