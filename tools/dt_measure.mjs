/**
 * DETAIL's measure (docs/consoles/DETAIL.md): how much procedural detail the parish engine places, per map and tier.
 *
 *   node tools/dt_measure.mjs --baseline   # count the unmodified engine's detail and write tools/detail-baseline.json
 *   node tools/dt_measure.mjs --table      # the worst five maps' full builds (instances, meshes, triangles per tier)
 *   node tools/dt_measure.mjs --table --detail   # the same with DETAIL's pool mounted
 *
 * "Detail instances" of a chunk = the massing instances the engine draws there (the phone tier's 4-in-5 filter applied)
 * plus FACADES' detail instances (every InstancedMesh in its details group), counted as if the chunk were the nearest
 * ring, over every one of a map's 256 chunks. No browser: the vendored three.js, headless.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, "WebXR", p)).href);
const THREE = await imp("vendor/three/dist/three.module.min.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
const FC = await imp("shared/fc-facades.js");
export const DT_TIERS = ["low", "balanced", "high"];

/** The unmodified engine's detail instances of one chunk at the nearest ring. */
export function dtBaselineChunk(parish, cx, cz, tier) {
  const spots = E.npMassingForChunk(parish, cx, cz);
  const groups = {};
  for (const s of spots) (groups[s.kind] ??= []).push(s);
  let n = 0;
  for (const list of Object.values(groups)) n += tier === "low" ? list.filter((_, i) => i % 5 !== 4).length : list.length;
  const g = FC.fcDetails({ THREE, parish, chunk: { cx, cz, key: `${cx},${cz}`, ring: 0, lod: 0 }, spots, tier });
  if (g) { g.traverse((o) => { if (o.isInstancedMesh) n += o.count; }); g.dispose?.(); }
  return n;
}

export function dtBaselineMap(parish) {
  const out = {};
  for (const tier of DT_TIERS) {
    let total = 0, chunks = 0;
    for (let cz = 0; cz < E.NP_CHUNKS_PER_SIDE; cz++) for (let cx = 0; cx < E.NP_CHUNKS_PER_SIDE; cx++) { const n = dtBaselineChunk(parish, cx, cz, tier); total += n; if (n) chunks++; }
    out[tier] = { instances: total, chunksWithDetail: chunks };
  }
  return out;
}

/** A full build at the start and at every site (check_parishes' walk), FACADES mounted as in the app (PALETTE adds materials, no meshes or triangles, and loads three from a CDN, so it is left out). */
export async function dtFullBuild(parish, tier, { detail = false } = {}) {
  let DT = null;
  if (detail) { DT = await imp("shared/dt-detail.js"); }
  const root = new THREE.Group();
  const start = E.npStartSite(parish) ?? parish.sites[0];
  const world = W.npBuildParish(root, THREE, parish, { tier, start: start.position });
  let worst = { meshes: 0, triangles: 0, instances: 0, detail: 0 };
  for (const s of [start, ...parish.sites]) {
    world.update(s.position[0], s.position[1], 999);
    world.detail?.flush?.();
    const st = world.stats();
    worst = { meshes: Math.max(worst.meshes, st.meshes), triangles: Math.max(worst.triangles, st.triangles), instances: Math.max(worst.instances, st.instances), detail: Math.max(worst.detail, st.detailInstances ?? 0) };
  }
  world.dispose?.();
  return worst;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = new Set(process.argv.slice(2));
  if (args.has("--baseline")) {
    const maps = {};
    for (const p of R.NP_PARISHES) { maps[p.id] = dtBaselineMap(p); console.log(`${p.id}: ${DT_TIERS.map((t) => `${t} ${maps[p.id][t].instances}`).join(", ")}`); }
    const out = { note: "DETAIL baseline: the unmodified engine's procedural detail instances per map and tier (massing + FACADES), every chunk counted at the nearest ring. tools/dt_measure.mjs --baseline wrote it; tools/check_detail.mjs reads it.", engine: "c0883a3", maps };
    writeFileSync(join(ROOT, "tools", "detail-baseline.json"), JSON.stringify(out, null, 1) + "\n");
    console.log(`wrote tools/detail-baseline.json (${Object.keys(maps).length} maps)`);
  }
  if (args.has("--missing")) {
    // DETAIL-2: measure only the maps with no row yet (maps merged after the baseline) on the same unmodified path
    // (massing + FACADES, no DETAIL hooks set) and merge them in; existing rows are left as they were measured.
    // --engine=<hash> records the tree the new rows were measured on (per row, so the old rows keep theirs).
    const file = join(ROOT, "tools", "detail-baseline.json");
    const out = JSON.parse(readFileSync(file, "utf8"));
    const engine = [...args].find((a) => a.startsWith("--engine="))?.slice(9) ?? "unknown";
    if (W.NP_MASSING_HOOKS.chunkLoaded || W.NP_MASSING_HOOKS.streamed) throw new Error("the engine hooks are set: not the unmodified path");
    let added = 0;
    for (const p of R.NP_PARISHES) {
      if (out.maps[p.id]) continue;
      out.maps[p.id] = { ...dtBaselineMap(p), engine };
      added++;
      console.log(`${p.id}: ${DT_TIERS.map((t) => `${t} ${out.maps[p.id][t].instances}`).join(", ")}`);
      writeFileSync(file, JSON.stringify(out, null, 1) + "\n");
    }
    console.log(`added ${added} rows; tools/detail-baseline.json has ${Object.keys(out.maps).length} maps`);
  }
  if (args.has("--table")) {
    const base = JSON.parse(readFileSync(join(ROOT, "tools", "detail-baseline.json"), "utf8")).maps;
    const worst5 = Object.entries(base).sort((a, b) => b[1].high.instances - a[1].high.instances).slice(0, 5).map(([id]) => id);
    for (const id of worst5) for (const tier of DT_TIERS) {
      const w = await dtFullBuild(R.npParish(id), tier, { detail: args.has("--detail") });
      console.log(`| ${id} | ${tier} | ${w.instances} | ${w.detail} | ${w.meshes} | ${w.triangles} |`);
    }
  }
}
