#!/usr/bin/env node
/**
 * check_terraform.mjs — TERRAFORM's water, wind and ground cover (console TERRAFORM, docs/consoles/TERRAFORM.md).
 * Pure Node, no browser. For every map in np-parishes.js:
 *   - channels are lower than their banks: every river/canal/bayou ribbon's centre below its bank a few metres outside
 *     the water, every stream and ditch's centre below its bank, and a levee's crest untouched by the cut;
 *   - every river has flow downstream: tfFlowAt along each ribbon's centreline points along its polyline, and along
 *     each stream's points source → mouth;
 *   - culverts keep roads level: no channel cut on a road where a stream crosses it;
 *   - wind is deterministic by seed (same seed, same wind; another seed, another wind; tfWindAt within 0..1);
 *   - grass, bushes and litter never on a road, water or a pad (the engine's own npCoverAt / npWaterAt), sampled over
 *     the chunks around every site and a seeded spread of others;
 *   - counts inside TF_BUDGET per chunk, the phone tier (`low`) fewer and without bushes;
 *   - reduced motion is still (tfMotion zeroes time, sway and flow; no rain); determinism of streams, cover and litter;
 *   - a headless build (vendored three.js) of the engine with TERRAFORM at every site inside the parish budget.
 * Prints one line per claim and "check_terraform: N checks, M failed".
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const S = (p) => import(pathToFileURL(join(ROOT, "WebXR/shared", p)).href);
const t0 = Date.now();
const { NP_PARISHES } = await S("np-parishes.js");
const np = await S("np-parish.js");
const tfw = await S("tf-water.js");
const tf = await S("tf-terraform.js");

let checks = 0, failed = 0;
const fails = [];
function ok(cond, msg) { checks++; if (!cond) { failed++; if (fails.length < 40) fails.push(msg); } return cond; }

// ---------------------------------------------------------------- wind
{
  const a = [], b = [], c = [];
  for (let i = 0; i < 200; i++) { const t = i * 1.7; a.push(tfw.tfWind(t, 7)); b.push(tfw.tfWind(t, 7)); c.push(tfw.tfWind(t, 8)); }
  ok(JSON.stringify(a) === JSON.stringify(b), "wind: the same seed gives a different wind");
  ok(JSON.stringify(a) !== JSON.stringify(c), "wind: another seed gives the same wind");
  let inRange = true, unit = true, gusty = 0;
  for (let i = 0; i < 400; i++) {
    const t = i * 0.9, w = tfw.tfWind(t), s = tfw.tfWindAt((i * 37) % 3000 - 1500, (i * 53) % 3000 - 1500, t);
    if (!(s >= 0 && s <= 1) || !(w.gust >= 0 && w.gust <= 1) || !(w.speed > 0)) inRange = false;
    if (Math.abs(Math.hypot(...w.dir) - 1) > 1e-9) unit = false;
    if (w.gust > 0.6) gusty++;
  }
  ok(inRange, "wind: tfWindAt, gust or speed outside its range");
  ok(unit, "wind: dir is not a unit vector");
  ok(gusty > 0, "wind: no gusts over 400 samples");
  ok(tfw.tfWindAt(10, 20, 5, 3) === tfw.tfWindAt(10, 20, 5, 3), "wind: tfWindAt not deterministic");
  console.log(`wind: deterministic by seed over 200 samples, tfWindAt in 0..1, ${gusty} gusts of 400 samples`);
}

// ---------------------------------------------------------------- reduced motion
{
  const m = tfw.tfMotion(true, 123.4), n = tfw.tfMotion(false, 123.4);
  ok(m.t === 0 && m.sway === 0 && m.flow === 0, "reduced motion: tfMotion still moves");
  ok(n.t === 123.4 && n.sway === 1 && n.flow === 1, "motion: tfMotion does not pass time through");
  console.log("reduced motion: still (time, sway and flow held at zero)");
}

// ---------------------------------------------------------------- per map
const tiers = ["high", "balanced", "low"];
let totalStreams = 0, totalCulverts = 0, totalRibbons = 0, totalChunks = 0, worstTri = 0, worstTufts = 0, totalLitter = 0, totalTufts = 0;
for (const parish of NP_PARISHES) {
  const prep = np.npPrepare(parish);
  // Channels lower than banks: ribbons.
  const ribbons = prep.water.filter((w) => w.centre && tf.TF_FLOW_SPEED[w.kind] !== undefined);
  totalRibbons += ribbons.length;
  let chan = 0, chanBad = 0, flowN = 0, flowBad = 0;
  for (const w of ribbons) {
    const pts = np.npPointsAlong(w.centre, 40);
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, z] = pts[i];
      if (np.npWaterAt(parish, x, z) !== w) continue;
      // The engine's own features override a channel: a site pad flattens over it, a levee's batter rises into it.
      const engineHere = (px, pz) => np.npLeveeRise(parish, px, pz) > 0 || prep.sites.some((st) => Math.hypot(px - st.position[0], pz - st.position[1]) < np.NP_PAD * 1.8);
      if (engineHere(x, z)) continue;
      const dx = pts[i + 1][0] - pts[i - 1][0], dz = pts[i + 1][1] - pts[i - 1][1], L = Math.hypot(dx, dz) || 1;
      const nx = -dz / L, nz = dx / L, off = w.width / 2 + tf.TF_BANK * 0.6;
      const hc = np.npHeightAt(parish, x, z);
      for (const sgn of [1, -1]) {
        const bx = x + nx * off * sgn, bz = z + nz * off * sgn;
        if (np.npWaterAt(parish, bx, bz) || engineHere(bx, bz)) continue; // more water beyond (a lake, a confluence), or a pad or levee
        chan++; if (!ok(hc < np.npHeightAt(parish, bx, bz), `${parish.id}: ${w.id} centre not below its bank at (${x.toFixed(0)}, ${z.toFixed(0)})`)) chanBad++;
      }
      const f = tf.tfFlowAt(parish, x, z);
      flowN++; if (!ok(f[0] * dx + f[1] * dz > 0, `${parish.id}: ${w.id} flows upstream at (${x.toFixed(0)}, ${z.toFixed(0)})`)) flowBad++;
    }
  }
  // Streams and ditches: centre below bank, flow downstream, culverts keep the road level, determinism.
  const streams = tf.tfStreams(parish), culverts = tf.tfCulverts(parish);
  totalStreams += streams.length; totalCulverts += culverts.length;
  ok(streams.length <= tf.TF_BUDGET.streamsPerMap, `${parish.id}: ${streams.length} streams over the budget`);
  for (const s of streams) {
    for (let i = 1; i < s.pts.length - 1; i++) {
      const [x, z] = s.pts[i];
      if (np.npWaterAt(parish, x, z)) continue;
      const cut = tf.tfStreamCut(parish, x, z).cut;
      if (cut < s.depth * 0.5) continue; // beside a road: the culvert keeps the ground level
      const dx = s.pts[i + 1][0] - s.pts[i - 1][0], dz = s.pts[i + 1][1] - s.pts[i - 1][1], L = Math.hypot(dx, dz) || 1;
      // Both banks: on a slope one bank is downhill, so the centre is held below the banks' mean (the uncut ground).
      const off = s.width / 2 + s.bank + 1, b1 = np.npHeightAt(parish, x - (dz / L) * off, z + (dx / L) * off), b2 = np.npHeightAt(parish, x + (dz / L) * off, z - (dx / L) * off);
      if (np.npWaterAt(parish, x - (dz / L) * off, z + (dx / L) * off) || np.npWaterAt(parish, x + (dz / L) * off, z - (dx / L) * off)) continue;
      chan++; if (!ok(np.npHeightAt(parish, x, z) < (b1 + b2) / 2 - 0.2, `${parish.id}: ${s.id} centre not below its banks at point ${i}`)) chanBad++;
      const f = tf.tfFlowAt(parish, x, z);
      flowN++; if (!ok(f[0] * dx + f[1] * dz > 0, `${parish.id}: ${s.id} flows upstream at point ${i}`)) flowBad++;
      ok(tf.tfWaterDepthAt(parish, x, z) > 0, `${parish.id}: ${s.id} holds no water at point ${i}`);
    }
    ok(s.pts.length >= 5, `${parish.id}: ${s.id} shorter than five points`);
  }
  for (const c of culverts) {
    ok(tf.tfStreamCut(parish, c.x, c.z).cut < 1e-6, `${parish.id}: ${c.id} cuts the road at the culvert`);
    ok(tf.tfWaterDepthAt(parish, c.x, c.z) === 0 && Math.hypot(...tf.tfFlowAt(parish, c.x, c.z)) === 0, `${parish.id}: ${c.id} shows water on the road`);
  }
  // Levees respected: no cut where a levee rises.
  let leveeN = 0;
  for (const l of prep.levees) for (const [x, z] of np.npPointsAlong(l.pts, 60)) {
    if (np.npLeveeRise(parish, x, z) < 0.3) continue;
    leveeN++;
    const h = np.npHeightAt(parish, x, z);
    const saved = np.NP_TERRAIN_HOOKS.cut; np.NP_TERRAIN_HOOKS.cut = null;
    const h0 = np.npHeightAt(parish, x, z); np.NP_TERRAIN_HOOKS.cut = saved;
    ok(Math.abs(h - h0) < 1e-9, `${parish.id}: levee ${l.id} lowered by the channel cut`);
  }
  ok(JSON.stringify(streams.map((s) => s.pts)) === JSON.stringify(tf.tfStreams({ ...parish }).map((s) => s.pts)), `${parish.id}: streams not deterministic`);
  // Cover: the chunks around every site plus a seeded spread.
  const keys = new Set();
  for (const s of parish.sites) { const { cx, cz } = tf.tfChunkIndex(s.position[0], s.position[1]); for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [-1, -1]]) keys.add(`${Math.min(15, Math.max(0, cx + dx))},${Math.min(15, Math.max(0, cz + dz))}`); }
  const rng = np.npRng(99);
  for (let i = 0; i < 6; i++) keys.add(`${Math.floor(rng() * 16)},${Math.floor(rng() * 16)}`);
  for (const s of streams) { const { cx, cz } = tf.tfChunkIndex(...s.pts[Math.floor(s.pts.length / 2)]); keys.add(`${cx},${cz}`); }
  let placed = 0, offBad = 0, litterN = 0, tyres = 0;
  for (const key of keys) {
    const [cx, cz] = key.split(",").map(Number);
    const per = {};
    for (const tier of tiers) {
      const cov = tf.tfCoverForChunk(parish, cx, cz, tier);
      per[tier] = cov;
      const tri = tf.tfCoverTriangles(cov);
      ok(cov.tufts.length <= tf.TF_BUDGET.tuftsPerChunk && cov.bushes.length <= tf.TF_BUDGET.bushesPerChunk && cov.litter.length <= tf.TF_BUDGET.litterPerChunk && tri <= tf.TF_BUDGET.trianglesPerChunk, `${parish.id} ${key} ${tier}: over the chunk budget (${cov.tufts.length} tufts, ${cov.bushes.length} bushes, ${cov.litter.length} litter, ${tri} tri)`);
      if (tier === "high") { worstTri = Math.max(worstTri, tri); worstTufts = Math.max(worstTufts, cov.tufts.length); totalTufts += cov.tufts.length; }
    }
    ok(per.low.tufts.length <= per.high.tufts.length && per.low.bushes.length === 0, `${parish.id} ${key}: the phone tier is not lighter`);
    const cov = per.high;
    for (const it of [...cov.tufts, ...cov.bushes, ...cov.litter]) {
      placed++;
      const cover = np.npWaterAt(parish, it.x, it.z) ? "water" : np.npCoverAt(parish, it.x, it.z);
      if (!ok(!["road", "water", "pad", "levee"].includes(cover), `${parish.id} ${key}: cover on ${cover} at (${it.x.toFixed(1)}, ${it.z.toFixed(1)})`)) offBad++;
    }
    for (const l of cov.litter) { litterN++; if (l.kind === "tyre") tyres++; ok(["can", "bag", "paper", "tyre"].includes(l.kind), `${parish.id}: litter kind ${l.kind}`); }
    ok(JSON.stringify(tf.tfLitterAt(parish, key)) === JSON.stringify(cov.litter), `${parish.id} ${key}: litter not deterministic`);
  }
  totalChunks += keys.size; totalLitter += litterN;
  console.log(`${parish.id}: ${ribbons.length} ribbons, ${streams.length} streams/ditches, ${culverts.length} culverts; channel below bank ${chan - chanBad}/${chan}, downstream ${flowN - flowBad}/${flowN}, levee points untouched ${leveeN}; ${keys.size} chunks, ${placed} cover items off road/water/pad ${placed - offBad}/${placed}, litter ${litterN} (${tyres} tyres)`);
}
ok(totalRibbons > 0 && totalStreams > 0, "no rivers or streams at all");

// ---------------------------------------------------------------- headless build (the vendored three.js, no browser)
// The engine and TERRAFORM on one root, walked to every site: the whole scene inside the parish budget on both tiers;
// the phone tier carries fewer cover triangles; reduced motion holds the sway and the water still.
{
  const THREE = await import(pathToFileURL(join(ROOT, "WebXR/vendor/three/dist/three.module.min.js")).href);
  const W = await S("np-world.js");
  const TW = await S("tf-world.js");
  let worstMesh = 0, worstTri = 0, worstMap = "";
  const tfMeshes = {};
  for (const parish of NP_PARISHES) {
    const coverTri = {}, rainN = {};
    for (const tier of ["low", "high"]) {
      const root = new THREE.Group();
      const start = np.npStartSite(parish);
      const world = W.npBuildParish(root, THREE, parish, { tier, start: start.position });
      const land = TW.tfMountTerraform({ THREE, root, parish, tier, reduced: false, waters: world.waters, trees: world.treeMaterial });
      const rain = TW.tfMountRain({ THREE, root, tier, reduced: false });
      rain.set(true); rain.animate(3, 0.016, 0, 2, 0);
      ok(rain.count() === TW.TF_RAIN[tier] && rain.mesh.visible, `${parish.id}/${tier}: the storm's rain does not show`);
      rainN[tier] = rain.count();
      let wm = 0, wt = 0, ct = 0;
      for (const s of [start, ...parish.sites]) {
        world.update(s.position[0], s.position[1], 999); land.update(s.position[0], s.position[1], 99);
        const st = world.stats(), c = land.counts();
        wm = Math.max(wm, st.meshes); wt = Math.max(wt, st.triangles); ct = Math.max(ct, c.triangles);
        ok(c.chunks <= (2 * tf.TF_BUDGET.radius[tier] + 1) ** 2, `${parish.id}/${tier}: ${c.chunks} cover chunks loaded`);
      }
      coverTri[tier] = ct;
      tfMeshes[tier] = Math.max(tfMeshes[tier] ?? 0, land.counts().meshes + 1); // + the rain
      ok(wm <= np.NP_BUDGET.drawCalls, `${parish.id}/${tier}: ${wm} meshes with TERRAFORM over ${np.NP_BUDGET.drawCalls}`);
      ok(wt <= np.NP_BUDGET.triangles, `${parish.id}/${tier}: ${wt} triangles with TERRAFORM over ${np.NP_BUDGET.triangles}`);
      if (wm > worstMesh) { worstMesh = wm; worstMap = `${parish.id}/${tier}`; }
      worstTri = Math.max(worstTri, wt);
      land.animate(42.5);
      const u = land.swayMaterial.userData.tf;
      ok(u.uTfTime.value === 42.5 && u.uTfSway.value === 1, `${parish.id}/${tier}: the grass does not sway`);
      ok(land.treeUniforms && land.treeUniforms.uTfTime.value === 42.5 && land.treeUniforms.uTfSway.value === 1, `${parish.id}/${tier}: the trees do not sway`);
      ok(land.waterUniforms.length >= world.waters.length && land.waterUniforms.every((wu) => wu.uTfTime.value === 42.5), `${parish.id}/${tier}: a water surface is not animated`);
      // Reduced motion: the same mount holds still.
      const still = TW.tfMountTerraform({ THREE, root: new THREE.Group(), parish, tier, reduced: true, waters: [] });
      still.update(start.position[0], start.position[1], 99); still.animate(42.5);
      const su = still.swayMaterial.userData.tf;
      ok(su.uTfTime.value === 0 && su.uTfSway.value === 0 && still.waterUniforms.every((wu) => wu.uTfTime.value === 0), `${parish.id}/${tier}: reduced motion still moves`);
      const dry = TW.tfMountRain({ THREE, root: new THREE.Group(), tier, reduced: true });
      dry.set(true);
      ok(dry.count() === 0 && !dry.mesh.visible, `${parish.id}/${tier}: rain falls under reduced motion`);
    }
    ok(coverTri.low < coverTri.high || coverTri.high === 0, `${parish.id}: the phone tier's cover is not lighter (${coverTri.low} vs ${coverTri.high})`);
    ok(rainN.low < rainN.high, `${parish.id}: the phone tier's rain is not lighter`);
    ok(tfMeshes.low <= 4 && tfMeshes.low < tfMeshes.high && tfMeshes.high <= 12, `${parish.id}: TERRAFORM's meshes ${tfMeshes.low} (phone) / ${tfMeshes.high} (desktop) over 4 / 12`);
  }
  console.log(`headless build: engine + TERRAFORM at every site of ${NP_PARISHES.length} maps, worst ${worstMesh} meshes (${worstMap}) / ${worstTri} triangles of ${np.NP_BUDGET.drawCalls} / ${np.NP_BUDGET.triangles}; TERRAFORM's own meshes at most ${tfMeshes.low} on the phone tier, ${tfMeshes.high} on desktop; the phone tier's cover and rain lighter on every map; grass and trees sway, the storm rains; reduced motion holds sway and water at zero and shows no rain`);
}
console.log(`budget: worst chunk ${worstTufts} tufts / ${worstTri} triangles of ${tf.TF_BUDGET.tuftsPerChunk} / ${tf.TF_BUDGET.trianglesPerChunk}; one merged cover mesh per chunk, radius ${JSON.stringify(tf.TF_BUDGET.radius)}; phone tier without bushes`);
console.log(`totals: ${NP_PARISHES.length} maps, ${totalRibbons} ribbons, ${totalStreams} streams/ditches, ${totalCulverts} culverts, ${totalChunks} chunks sampled, ${totalTufts} tufts, ${totalLitter} litter`);
for (const f of fails) console.log(`  FAIL ${f}`);
console.log(`check_terraform: ${checks} checks, ${failed} failed (${Date.now() - t0} ms)`);
process.exit(failed ? 1 : 0);
