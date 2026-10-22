#!/usr/bin/env node
/**
 * REALISM (docs/consoles/REALISM.md): surfaces that read as their material, and light calibrated by time of day.
 *
 *   1. surface classes (shared/rz-surfaces.js): brick, concrete, asphalt, metal cladding and wood among them, roughness
 *      and metalness in range and varied, every PALETTE pixel painter mapped to a class of its own (no fallback)
 *   2. the detail map: deterministic by seed, tiles on both axes, channel means near mid-grey; bytes per tier inside the
 *      stated budget (high 256 KiB, balanced 0, low 0)
 *   3. the grime/contact term: darker where the wall meets the ground, clean up the wall, no streaks on a roof
 *   4. the shader patch against three.js's own Lambert and Standard sources: every include it rewrites is found
 *      (high: detail, roughness, metalness; balanced: grime only); the phone patch carries no REALISM code
 *   5. headless builds on the vendored three.js, three maps x three tiers: meshes and triangles unchanged by REALISM,
 *      materials with roughness and detail on high, grime-only on balanced, none on the phone (Lambert, "pa-tint-1"),
 *      a headset browser gets no REALISM at all
 *   6. the exposure table (shared/rz-light.js): day, dawn, dusk and night inside their stated ranges at full light and
 *      at the weather dim floor, ordered day > dawn, dusk > night, warmer sun at dusk than at noon, fog never thinner
 *      than ATMOS's on any weather
 *   7. wiring: rz-surfaces.js before pa-palette.js in the bundle, the app applies the light table behind rzLevel()
 *
 *   8. REALISM-2 street details (shared/rz-street.js): every chunk of every map on high and balanced inside the stated
 *      budget (1 mesh; 1,500 / 600 triangles), 0 parts on a running lane, in water or in a building (re-tested here, not
 *      trusted from the generator), the phone tier 0 parts, deterministic; one chunk's geometry on the vendored three.js;
 *      the mount inert on the phone and in a headset browser; the app updates it beside the streets; the bundle order
 *   9. REALISM-2 rooms and props: the pattern set's txSharedMat / paintedMat take the class on desktop high only through
 *      the hook rzInstallSurfaces installs; off, they are byte for byte textures.js's defaults; explicit factors win;
 *      the INTERIORS rooms' texture bytes are the same with the hook on and off
 *
 *     node tools/check_rz.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSuite, ROOT, WEBXR } from "./lib/headless.mjs";

let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.log(`  ✗ ${msg}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
const t0 = Date.now();

const Z = await imp("shared/rz-surfaces.js");
const L = await imp("shared/rz-light.js");
const D = await imp("shared/pa-palette-data.js");

// 1. classes
for (const k of ["brick", "concrete", "asphalt", "metal", "wood"]) check(!!Z.RZ_SURFACES[k], `class ${k} exists`);
for (const [k, s] of Object.entries(Z.RZ_SURFACES)) {
  check(s.rough >= 0.04 && s.rough <= 1 && s.metal >= 0 && s.metal <= 1 && s.detail >= 0 && s.detail <= 0.5 && s.grime >= 0 && s.grime <= 1, `${k}: factors in range (rough ${s.rough}, metal ${s.metal}, detail ${s.detail}, grime ${s.grime})`);
  check(/procedural/.test(s.note) && !/\d/.test(s.note), `${k}: note says procedural, no figures`);
}
const roughs = new Set(Object.values(Z.RZ_SURFACES).map((s) => s.rough));
check(roughs.size === Z.RZ_SURFACE_IDS.length, `roughness varies per class (${roughs.size} distinct of ${Z.RZ_SURFACE_IDS.length})`);
check(Object.values(Z.RZ_SURFACES).some((s) => s.metal > 0.3) && Object.values(Z.RZ_SURFACES).some((s) => s.metal === 0), "metalness varies (metal cladding is metallic, masonry is not)");
for (const id of Object.keys(D.PA_TEXTURES)) check(!!Z.RZ_PAINTER_SURFACE[id], `PALETTE painter ${id} -> ${Z.rzSurfaceOf(id)} (mapped, not a fallback)`);

// 2. the detail map
const BUDGET = { high: 256 * 1024, balanced: 0, low: 0 };
for (const t of ["high", "balanced", "low"]) {
  const px = Z.RZ_DETAIL_TIERS[t];
  check(px * px * 4 <= BUDGET[t], `detail map ${t}: ${px}x${px} = ${px * px * 4} bytes <= ${BUDGET[t]}`);
}
{
  const px = 128, a = Z.rzDetailPixels(px, 7), b = Z.rzDetailPixels(px, 7), c = Z.rzDetailPixels(px, 8);
  check(a.every((v, i) => v === b[i]), "detail map deterministic by seed");
  check(a.some((v, i) => v !== c[i]), "another seed paints other pixels");
  for (const ch of [0, 1, 2]) {
    let sum = 0, wrapX = 0, innerX = 0, wrapY = 0, innerY = 0;
    for (let i = ch; i < a.length; i += 4) sum += a[i];
    const P = (x, y) => a[(y * px + x) * 4 + ch];
    // PALETTE's edge test: the wrap seam is no rougher than the roughest seam inside the tile (x1.1, +1 per sample).
    for (let y = 0; y < px; y++) wrapX += Math.abs(P(px - 1, y) - P(0, y));
    for (let x = 0; x < px; x++) wrapY += Math.abs(P(x, px - 1) - P(x, 0));
    for (let k = 0; k < px - 1; k++) {
      let sx = 0, sy = 0;
      for (let j = 0; j < px; j++) { sx += Math.abs(P(k + 1, j) - P(k, j)); sy += Math.abs(P(j, k + 1) - P(j, k)); }
      innerX = Math.max(innerX, sx); innerY = Math.max(innerY, sy);
    }
    const mean = sum / (px * px);
    check(mean > 90 && mean < 165, `detail channel ${"RGB"[ch]}: mean ${mean.toFixed(0)} near mid-grey`);
    check(wrapX <= innerX * 1.1 + px && wrapY <= innerY * 1.1 + px, `detail channel ${"RGB"[ch]}: tiles (wrap ${(wrapX / px).toFixed(1)}/${(wrapY / px).toFixed(1)} vs inner ${(innerX / px).toFixed(1)}/${(innerY / px).toFixed(1)})`);
  }
}

// 3. the grime / contact term
check(Z.rzShade(0, 0.5, 0.5, "brick") < 0.7, `contact: wall foot ${Z.rzShade(0, 0.5, 0.5, "brick").toFixed(2)} < 0.70`);
check(Z.rzShade(0, 0.5, 0.5, "brick") < Z.rzShade(1, 0.5, 0.5, "brick") && Z.rzShade(1, 0.5, 0.5, "brick") < Z.rzShade(2.6, 0.5, 0.5, "brick"), "grime fades up the wall");
check(Z.rzShade(2.6, 0.5, 0, "brick") > 0.99, `clean above the grime band (${Z.rzShade(2.6, 0.5, 0, "brick").toFixed(3)})`);
check(Z.rzShade(3.2 * 1.6, 0.5, 1, "stucco") < Z.rzShade(3.2 * 1.95, 0.5, 1, "stucco"), "a streak under the sill (upper floors)");
check(Z.rzShade(3.2 * 1.6, 0.5, 1, "stucco", true) > 0.99, "no streaks on a roof");
check(Z.rzShade(0.3, 1, 0.5, "glass") > Z.rzShade(0.3, 1, 0.5, "brick"), "glass sheds grime more than brick");
check(Z.RZ_SHADE_GLSL.includes("float rzShadeF(") && Z.RZ_SHADE_GLSL.includes(Z.RZ_SHADE.contactH.toFixed(3)), "the GLSL term carries the same constants");

// 4. the shader patch
const S = await buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/pa-palette-data.js", "shared/rz-surfaces.js", "shared/pa-palette.js"],
  "export { paMount, paMaterialFor, paStats, paReset, paPatchShader, paDetailTexture };", "rz");
const W = await imp("shared/np-world.js");
const R = await imp("shared/np-parishes.js");
const E = await imp("shared/np-parish.js");
const THREE = await imp("vendor/three/dist/three.module.min.js");
{
  const std = THREE.ShaderLib.standard, lam = THREE.ShaderLib.lambert;
  const rz = { wall: [0.88, 0, 0.22, 1], roof: [0.7, 0, 0.18, 0.7] };
  const hi = S.paPatchShader({ vertexShader: std.vertexShader, fragmentShader: std.fragmentShader, uniforms: {} }, { atlas: {}, rz: { ...rz, detail: {} } });
  check(hi.vertexShader.includes("vRzH = paP.y - ") && hi.vertexShader.includes("vPaUv = "), "high: the vertex height above the base and the box projection are in");
  check(hi.fragmentShader.includes("uniform sampler2D uRzDetail") && hi.fragmentShader.includes("rzShadeF( max( vRzH, 0.0 ), rzG.g"), "high: detail map and grime are in");
  check(hi.fragmentShader.includes("roughnessFactor = clamp(") && hi.fragmentShader.includes("metalnessFactor = vPaRoof"), "high: roughness and metalness per class are in (Standard's includes found)");
  check(hi.fragmentShader.includes("diffuseColor.rgb *= paD") && !!hi.uniforms.uRzWall && !!hi.uniforms.uRzDetail, "high: the atlas detail and uniforms stay");
  const bal = S.paPatchShader({ vertexShader: lam.vertexShader, fragmentShader: lam.fragmentShader, uniforms: {} }, { atlas: {}, rz });
  check(bal.fragmentShader.includes("rzShadeF( max( vRzH, 0.0 ), 0.5, 0.0") && !bal.fragmentShader.includes("uRzDetail") && !bal.fragmentShader.includes("roughnessFactor ="), "balanced: grime and contact only, no texture, no PBR");
  const low = S.paPatchShader({ vertexShader: lam.vertexShader, fragmentShader: lam.fragmentShader, uniforms: {} }, {});
  check(!/rz/i.test(low.vertexShader + low.fragmentShader), "phone: the tint patch carries no REALISM code");
  const old = S.paPatchShader({ vertexShader: lam.vertexShader, fragmentShader: lam.fragmentShader, uniforms: {} }, { atlas: {} });
  check(!/rzShade|uRz/.test(old.vertexShader + old.fragmentShader), "a headset's atlas path (rz null) carries no REALISM code");
}

// 5. headless builds
const MAPS = ["orleans", "sf-mission", "oak-west-oakland"];
const tally = { high: { pbr: 0, detail: 0, grime: 0, mats: 0 }, balanced: { pbr: 0, detail: 0, grime: 0, mats: 0 }, low: { pbr: 0, detail: 0, grime: 0, mats: 0 } };
for (const pid of MAPS) {
  const parish = R.npParish(pid);
  const start = E.npStartSite(parish).position;
  for (const tier of ["high", "balanced", "low"]) {
    S.paReset();
    W.NP_MASSING_HOOKS.material = null;
    const base = W.npBuildParish(new THREE.Group(), THREE, parish, { tier, start: [start[0], start[1] + 16] }).stats();
    S.paMount({ tier, hooks: W.NP_MASSING_HOOKS });
    const w = W.npBuildParish(new THREE.Group(), THREE, parish, { tier, start: [start[0], start[1] + 16] });
    const a = w.stats();
    check(a.meshes === base.meshes && a.triangles === base.triangles, `${pid} · ${tier}: meshes ${a.meshes} and triangles ${a.triangles} unchanged`);
    const mats = new Set();
    w.loaded.forEach((c) => { for (const m of c.mass) if (m.isInstancedMesh && m.material?.userData?.paCategory) mats.add(m.material); });
    let pbr = 0, det = 0, grime = 0, lambertLow = true;
    for (const m of mats) {
      const r = m.userData.rzSurface;
      if (r?.pbr) pbr++; if (r?.detail) det++; if (r) grime++;
      if (tier === "low" && (!m.isMeshLambertMaterial || m.customProgramCacheKey() !== "pa-tint-1" || r)) lambertLow = false;
      if (r?.pbr) check(m.isMeshStandardMaterial && m.roughness === Z.RZ_SURFACES[r.wall].rough && m.metalness === Z.RZ_SURFACES[r.wall].metal, `${pid} · ${m.name}: Standard with ${r.wall}'s roughness ${m.roughness} / metalness ${m.metalness}`);
    }
    Object.assign(tally[tier], { pbr: tally[tier].pbr + pbr, detail: tally[tier].detail + det, grime: tally[tier].grime + grime, mats: tally[tier].mats + mats.size });
    const st = S.paStats();
    if (tier === "high") check(pbr === mats.size && det === mats.size && mats.size > 0, `${pid} · high: ${pbr} of ${mats.size} facade materials with roughness and detail`);
    if (tier === "balanced") check(pbr === 0 && det === 0 && grime === mats.size, `${pid} · balanced: ${grime} of ${mats.size} with grime and contact, 0 PBR, 0 detail map`);
    if (tier === "low") check(lambertLow && grime === 0, `${pid} · low: every facade material Lambert "pa-tint-1", no REALISM (${mats.size})`);
    check(st.rzDetailBytes <= BUDGET[tier], `${pid} · ${tier}: REALISM texture bytes ${st.rzDetailBytes} <= ${BUDGET[tier]}`);
    check(st.programs <= 1, `${pid} · ${tier}: one facade shader program (${st.programs})`);
  }
}
W.NP_MASSING_HOOKS.material = null;
check(Z.rzLevel("high", "Mozilla/5.0 (X11; Linux x86_64) OculusBrowser/30.0") === null && Z.rzLevel("high", "Mozilla/5.0 (Windows NT 10.0)") === "high" && Z.rzLevel("low", "") === null, "rzLevel: headset and phone get none, desktop high gets high");
{
  S.paReset();
  const m = S.paMaterialFor("quarterBlock", R.npParish("orleans"), THREE, "high");
  // the hook reads rzLevel(tier) with this agent's user agent (Node's is not a headset, so high REALISM applies)
  check(!!m && !!m.userData?.rzSurface?.pbr === (Z.rzLevel("high") === "high"), `the hook follows rzLevel on this agent (${Z.rzLevel("high")})`);
}
for (const t of ["high", "balanced", "low"]) note(`${t}: ${tally[t].mats} facade materials over ${MAPS.length} maps — ${tally[t].pbr} with roughness/metalness, ${tally[t].detail} with the detail map, ${tally[t].grime} with grime/contact`);

// 6. the exposure table
for (const band of ["day", "dawn", "dusk", "night"]) {
  const [lo, hi] = L.RZ_RANGE[band];
  const e1 = L.rzExposure(band, 1), e2 = L.rzExposure(band, L.RZ_DIM_FLOOR[band]);
  check(e1 >= lo && e1 <= hi, `${band}: exposure ${e1.toFixed(3)} in [${lo}, ${hi}] at full light`);
  check(e2 >= lo && e2 <= hi, `${band}: exposure ${e2.toFixed(3)} in [${lo}, ${hi}] at dim ${L.RZ_DIM_FLOOR[band]}`);
  note(`${band}: sun ${L.RZ_EXPOSURE[band].sun} at ${L.RZ_EXPOSURE[band].sunK} K (#${L.RZ_EXPOSURE[band].sunHex.toString(16).padStart(6, "0")}), sky ${L.RZ_EXPOSURE[band].hemi}, exposure ${e1.toFixed(3)} (dim ${e2.toFixed(3)})`);
}
check(L.rzExposure("day") > L.rzExposure("dawn") && L.rzExposure("day") > L.rzExposure("dusk") && L.rzExposure("dusk") > L.rzExposure("night") && L.rzExposure("dawn") > L.rzExposure("night"), "ordered: day > dawn, dusk > night");
const rb = (hex) => ((hex >> 16) & 255) / Math.max(1, hex & 255);
check(rb(L.RZ_EXPOSURE.dusk.sunHex) > rb(L.RZ_EXPOSURE.day.sunHex) * 1.3 && rb(L.RZ_EXPOSURE.night.sunHex) < 1, "the sun is warmer at dusk than at noon; the moon is cool");
check(L.RZ_FOG_WEATHER.clear === 1 && Object.values(L.RZ_FOG_WEATHER).every((v) => v > 0 && v <= 1), "fog multipliers never thin ATMOS's fog (clear 1, every weather <= 1)");
check(L.RZ_FOG_WEATHER.fog < L.RZ_FOG_WEATHER.rain && L.RZ_FOG_WEATHER.rain < L.RZ_FOG_WEATHER.overcast, "fog density by weather: fog > rain > overcast > clear");
for (const k of ["clear", "overcast", "fog", "rain", "storm"]) { const l = L.rzLightFor("day", k, 0.8); check(Math.abs(l.sun - L.RZ_EXPOSURE.day.sun * 0.8) < 1e-9 && l.fogFar === L.RZ_FOG_WEATHER[k], `rzLightFor(day, ${k}) applies the dim and the fog multiplier`); }

// 7. wiring
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
const iZ = bundler.indexOf('SHARED / "rz-surfaces.js"'), iL = bundler.indexOf('SHARED / "rz-light.js"'), iP = bundler.indexOf('SHARED / "pa-palette.js"');
check(iZ > 0 && iL > 0 && iZ < iP, "bundle: rz-surfaces.js (and rz-light.js) before pa-palette.js");
const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
check(/if \(rzLevel\(npTierName\)\) \{\s*\n\s*const rzL = rzLightFor\(/.test(app), "the app applies the exposure table behind rzLevel() (phone and headset keep their lights)");
check(app.includes('sun.intensity = (night ? 0.12 : NP_TIMES[np.timeIdx] === "day" ? 1.1 : 0.6) * atDim;') && app.includes("hemi.intensity = (night ? 0.25 : 0.95) * atDim;"), "the phone's fixed lights are kept as they were");

// 8. REALISM-2: street details
const ST = await imp("shared/rz-street.js");
{
  const t8 = Date.now();
  const BUD = ST.RZ_STREET_BUDGET.triangles;
  let chunks = 0, withParts = 0, parts = { high: 0, balanced: 0, low: 0 }, worst = { high: 0, balanced: 0 }, badLane = 0, badWater = 0, badBuilding = 0, over = 0, notPrefix = 0, kinds = {};
  const perMap = [];
  for (const p of R.NP_PARISHES) {
    let n = 0, w = 0;
    for (let cz = 0; cz < E.NP_CHUNKS_PER_SIDE; cz++) for (let cx = 0; cx < E.NP_CHUNKS_PER_SIDE; cx++) {
      chunks++;
      const hi = ST.rzStreetForChunk(p, cx, cz, "high"), ba = ST.rzStreetForChunk(p, cx, cz, "balanced"), lo = ST.rzStreetForChunk(p, cx, cz, "low");
      parts.high += hi.parts.length; parts.balanced += ba.parts.length; parts.low += lo.parts.length;
      if (hi.parts.length) withParts++;
      worst.high = Math.max(worst.high, hi.triangles); worst.balanced = Math.max(worst.balanced, ba.triangles);
      if (hi.triangles > BUD.high || ba.triangles > BUD.balanced) over++;
      for (const q of hi.parts) {
        kinds[q.kind] = (kinds[q.kind] ?? 0) + 1;
        if (E.npWaterAt(p, q.x, q.z)) badWater++;
        if (ST.rzStreetOnLane(p, q.x, q.z, 0)) badLane++;
        if (ST.rzStreetInBuilding(p, q.x, q.z, 0)) badBuilding++;
      }
      // balanced takes only the kinds its tier lists, each of them a part high also has
      const hiKeys = new Set(hi.parts.map((q) => `${q.kind}|${q.x.toFixed(2)}|${q.z.toFixed(2)}`));
      for (const q of ba.parts) if (!hiKeys.has(`${q.kind}|${q.x.toFixed(2)}|${q.z.toFixed(2)}`)) notPrefix++;
      n += hi.parts.length; w = Math.max(w, hi.triangles);
    }
    perMap.push([p.id, n, w]);
  }
  check(over === 0, `street details: ${chunks} chunks over ${R.NP_PARISHES.length} maps, worst chunk high ${worst.high} <= ${BUD.high}, balanced ${worst.balanced} <= ${BUD.balanced} triangles (${over} over)`);
  check(badLane === 0 && badWater === 0 && badBuilding === 0, `street details: ${parts.high} parts on high, 0 on a running lane (${badLane}), in water (${badWater}) or in a building (${badBuilding})`);
  check(parts.low === 0 && BUD.low === 0 && ST.RZ_STREET_TIER_KINDS.low.length === 0, `street details: the phone tier places nothing (${parts.low})`);
  check(notPrefix === 0 && parts.balanced <= parts.high, `street details: every balanced part is one of high's (${parts.balanced} of ${parts.high})`);
  check(ST.RZ_STREET_BUDGET.meshes === 1, "street details: one mesh per chunk");
  const empty = perMap.filter(([, n]) => n === 0).map(([id]) => id);
  check(empty.length === 0, `street details: every map has parts (${perMap.length - empty.length} of ${perMap.length}${empty.length ? `; none on ${empty.join(", ")}` : ""})`);
  const sorted = [...perMap].sort((a, b) => a[1] - b[1]);
  note(`street details: ${withParts} of ${chunks} chunks carry parts; kinds ${JSON.stringify(kinds)}; fewest ${sorted[0][0]} ${sorted[0][1]}, most ${sorted[sorted.length - 1][0]} ${sorted[sorted.length - 1][1]}; ${Date.now() - t8} ms`);
  for (const [id, n, w] of perMap.filter(([id]) => ["orleans", "sf-mission", "sf-marina"].includes(id))) note(`street details: ${id} ${n} parts, worst chunk ${w} triangles`);
  // determinism and the geometry on the vendored three.js
  const p0 = R.npParish("orleans"), a = ST.rzStreetForChunk(p0, 8, 8, "high"), b = ST.rzStreetForChunk(p0, 8, 8, "high");
  check(JSON.stringify(a.parts) === JSON.stringify(b.parts), `street details: deterministic (orleans chunk 8,8: ${a.parts.length} parts, ${a.triangles} triangles)`);
  let built = null, tri = 0;
  for (const p of R.NP_PARISHES) { for (let cz = 0; cz < E.NP_CHUNKS_PER_SIDE && !built; cz++) for (let cx = 0; cx < E.NP_CHUNKS_PER_SIDE && !built; cx++) { const r = ST.rzStreetForChunk(p, cx, cz, "high"); if (r.parts.length >= 20) built = { p, cx, cz, r }; } if (built) break; }
  if (built) {
    const g = ST.rzStreetGeometry(THREE, built.r.parts);
    tri = g.attributes.position.count / 3;
    check(tri === built.r.triangles && !!g.attributes.color && !!g.attributes.normal, `street details: geometry of ${built.p.id} chunk ${built.cx},${built.cz} has ${tri} triangles = the declared ${built.r.triangles}, with colours and normals`);
  } else check(false, "street details: a chunk with 20+ parts exists for the geometry test");
  {
    // contact AO: a bollard's and a drop kerb's ground vertices are darker than their top vertices
    const g = ST.rzStreetGeometry(THREE, [{ kind: "bollard", x: 0, y: 0, z: 0, yaw: 0 }, { kind: "dropKerb", x: 5, y: 0, z: 0, yaw: 0, side: 1, top: 0.14 }]);
    const P = g.attributes.position.array, C = g.attributes.color.array; let lo = 0, nLo = 0, hi = 0, nHi = 0;
    for (let i = 0; i < P.length / 3; i++) { const y = P[i * 3 + 1], l = C[i * 3] + C[i * 3 + 1] + C[i * 3 + 2]; if (y < 0.02) { lo += l; nLo++; } else { hi += l; nHi++; } }
    check(P.length / 9 === ST.RZ_STREET_PARTS.bollard.tris + ST.RZ_STREET_PARTS.dropKerb.tris && nLo > 0 && nHi > 0 && lo / nLo < (hi / nHi) * 0.9, `street details: contact AO baked (ground vertices ${(lo / nLo).toFixed(2)} vs upper ${(hi / nHi).toFixed(2)} summed RGB; ${P.length / 9} triangles)`);
  }
  // the mount
  const root = new THREE.Group();
  const mHi = ST.rzMountStreet({ THREE, root, parish: p0, tier: "high", ua: "Mozilla/5.0 (Windows NT 10.0)" });
  mHi.update(E.npStartSite(p0).position[0], E.npStartSite(p0).position[1], 999);
  const sHi = mHi.stats();
  check(mHi.level === "high" && sHi.chunks === 25 && sHi.meshes <= sHi.chunks && sHi.parts > 0 && mHi.group.children.length === sHi.meshes, `street details mount (high, orleans start): ${sHi.chunks} chunks streamed, ${sHi.meshes} meshes, ${sHi.triangles} triangles, ${sHi.parts} parts`);
  check(mHi.chunkStats().every((c) => c.meshes <= 1 && c.triangles <= BUD.high), "street details mount: every streamed chunk 1 mesh inside the budget");
  check(mHi.group.children.every((m) => m.material.isMeshStandardMaterial && m.material.vertexColors && m.material.roughness === Z.RZ_SURFACES.concrete.rough), "street details mount: one Standard vertex-coloured material with concrete's roughness");
  const mBa = ST.rzMountStreet({ THREE, root: new THREE.Group(), parish: p0, tier: "balanced", ua: "Mozilla/5.0 (Windows NT 10.0)" });
  mBa.update(E.npStartSite(p0).position[0], E.npStartSite(p0).position[1], 999);
  check(mBa.level === "balanced" && mBa.group.children.every((m) => m.material.isMeshLambertMaterial) && mBa.stats().triangles <= mHi.stats().triangles, `street details mount (balanced): Lambert, ${mBa.stats().triangles} triangles <= high's ${sHi.triangles}`);
  const rLow = new THREE.Group(), mLo = ST.rzMountStreet({ THREE, root: rLow, parish: p0, tier: "low", ua: "Mozilla/5.0 (Windows NT 10.0)" });
  mLo.update(0, 0, 999);
  const rHs = new THREE.Group(), mHs = ST.rzMountStreet({ THREE, root: rHs, parish: p0, tier: "high", ua: "Mozilla/5.0 (X11; Linux x86_64) OculusBrowser/30.0" });
  mHs.update(0, 0, 999);
  check(mLo.level === null && rLow.children.length === 0 && mLo.stats().meshes === 0 && mHs.level === null && rHs.children.length === 0, "street details mount: inert on the phone and in a headset browser (no group added, no mesh)");
  mHi.dispose(); check(mHi.group.children.length === 0 && root.children.length === 0, "street details mount: dispose removes everything");
  // wiring
  check(/const rzStreet = rzMountStreet\(\{ THREE, root, parish, tier: npTierName \}\);/.test(app) && (app.match(/rzStreet\.update\(/g) ?? []).length >= 5 && app.includes("rzStreet, // REALISM-2"), `the app mounts the street details beside the streets and updates them where the streets update (${(app.match(/rzStreet\.update\(/g) ?? []).length} calls)`);
  const iS = bundler.indexOf('SHARED / "rz-street.js"'), iC = bundler.indexOf('SHARED / "cw-cityworks.js"'), iN = bundler.indexOf('SHARED / "np-parish.js"');
  check(iS > iC && iS > iZ && iS > iN && iC > 0, "bundle: rz-street.js after cw-cityworks.js, rz-surfaces.js and np-parish.js");
}

// 9. REALISM-2: rooms and props through the pattern set
{
  const TX = await buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js"], "export { txSharedMat, txMaterial, TX_SURFACE_HOOK, txResetTextures, textureStats, QUALITY, TX_PAINTERS, TX_PAINTER_IDS, PAINTER_IDS };", "rz-tx");
  const H = TX.TX_SURFACE_HOOK;
  const IX = await imp("shared/ix-interiors.js");
  check(Z.rzInstallSurfaces("low", "", H) === null && H.classFor === null, "rooms/props: the hook is off on the phone tier");
  check(Z.rzInstallSurfaces("balanced", "", H) === null && H.classFor === null, "rooms/props: the hook is off on balanced");
  check(Z.rzInstallSurfaces("high", "Mozilla/5.0 (X11; Linux x86_64) OculusBrowser/30.0", H) === null && H.classFor === null, "rooms/props: the hook is off in a headset browser at high");
  TX.txResetTextures();
  const off = TX.txSharedMat("brickPaver", { seed: 3 }), offP = TX.txMaterial("teakDeck", { seed: 2 });
  check(off.roughness === 0.9 && off.metalness === 0 && !off.userData.txSurface && offP.roughness === 0.8 && offP.metalness === 0.05 && !offP.userData.txSurface, `rooms/props: hook off, txSharedMat ${off.roughness}/${off.metalness} and txMaterial ${offP.roughness}/${offP.metalness} are textures.js's defaults`);
  const statsOff = TX.textureStats();
  const lvl = Z.rzInstallSurfaces("high", "Mozilla/5.0 (Windows NT 10.0)", H);
  check(lvl === "high" && H.classFor === Z.rzSurfaceClass, "rooms/props: the hook is on for desktop high");
  if (TX.QUALITY === "high") {
    TX.txResetTextures();
    const on = TX.txSharedMat("brickPaver", { seed: 3 }), onP = TX.txMaterial("teakDeck", { seed: 2 });
    const statsOn = TX.textureStats(); // the same two materials as the off case, before anything else paints
    const onM = TX.txSharedMat("rustPatina", { seed: 1 }), own = TX.txSharedMat("brickPaver", { seed: 3 }, { rough: 0.33, metal: 0.1 });
    check(on.roughness === Z.RZ_SURFACES.brick.rough && on.metalness === Z.RZ_SURFACES.brick.metal && on.userData.txSurface === "brick", `rooms/props: txSharedMat("brickPaver") takes brick's ${on.roughness}/${on.metalness}`);
    check(onP.roughness === Z.RZ_SURFACES.wood.rough && onP.metalness === Z.RZ_SURFACES.wood.metal && onP.userData.txSurface === "wood", `rooms/props: txMaterial("teakDeck") takes wood's ${onP.roughness}/${onP.metalness}`);
    check(onM.roughness === Z.RZ_SURFACES.metal.rough && onM.metalness === Z.RZ_SURFACES.metal.metal, `rooms/props: txSharedMat("rustPatina") takes metal cladding's ${onM.roughness}/${onM.metalness}`);
    check(own.roughness === 0.33 && own.metalness === 0.1 && !own.userData.txSurface, "rooms/props: a caller's own rough/metal win over the class");
    const un = TX.txSharedMat("kelpBlade", { seed: 1 }); check(un.roughness === 0.9 && un.metalness === 0 && !un.userData.txSurface, "rooms/props: an unmapped painter (kelpBlade) keeps the defaults");
    const idsMapped = TX.TX_PAINTER_IDS.filter((id) => !!Z.RZ_PAINTER_SURFACE[id]);
    check(idsMapped.length >= 10 && idsMapped.every((id) => !!Z.RZ_SURFACES[Z.RZ_PAINTER_SURFACE[id]]), `rooms/props: ${idsMapped.length} of ${TX.TX_PAINTER_IDS.length} pattern-set painters map to a class, every class real`);
    check(statsOn.pixels === statsOff.pixels && statsOn.canvases === statsOff.canvases, `rooms/props: the same materials paint the same texture bytes with the hook on and off (${statsOn.canvases} canvases, ${statsOn.pixels} pixels): the class changes factors, never a texture`);
    const mapped = Object.keys(Z.RZ_PAINTER_SURFACE).filter((id) => !!TX.TX_PAINTERS?.[id] || Object.values(TX.PAINTER_IDS ?? {}).includes(id));
    note(`rooms/props: ${mapped.length} pattern-set painters mapped to a class (${mapped.join(", ")})`);
  } else note(`rooms/props: QUALITY is "${TX.QUALITY}" in this process; the on-case needs high (the app runs it at high)`);
  // the INTERIORS rooms (ACCESS's shell, called not edited): their materials are their own, not the pattern set's, so the
  // hook changes nothing in them — the same meshes, triangles and materials with it on and off, 0 materials classed
  const roomsOf = () => { const site = { id: "t", name: "Test site", kind: "x", stations: ["s-a", "s-b"] }; const out = []; for (const id of Object.keys(IX.IX_STYLES)) { const room = IX.ixBuild(id, { three: THREE, tier: "high", site }); let mats = 0, classed = 0, tris = 0; room.group.traverse((o) => { if (o.isMesh && o.material) { mats++; if (o.material.userData?.txSurface) classed++; const g = o.geometry; tris += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (o.isInstancedMesh ? o.count : 1); } }); out.push([id, room.meshes(), tris, mats, classed]); } return out; };
  const rOn = roomsOf(); Z.rzInstallSurfaces("low", "", H); const rOff = roomsOf();
  const sameRooms = JSON.stringify(rOn) === JSON.stringify(rOff), roomMats = rOn.reduce((a, r) => a + r[3], 0), roomClassed = rOn.reduce((a, r) => a + r[4], 0);
  check(sameRooms, `rooms/props: the ${rOn.length} INTERIORS room styles build the same meshes, triangles and materials with the hook on and off (${roomMats} materials, ${roomClassed} through the pattern set; their factors are set by their own modules)`);
  // the callers: how many pattern-set material calls take the class (no explicit rough and metal)
  let calls = 0, take = 0;
  for (const f of ["bayworld.js", "underwater.js", "fairway.js"]) {
    const src = readFileSync(join(WEBXR, "shared", f), "utf8");
    for (const m of src.matchAll(/tx(?:SharedMat|Material)\(\s*"([a-zA-Z]+)"/g)) { calls++; if (Z.RZ_PAINTER_SURFACE[m[1]]) take++; }
  }
  note(`rooms/props: ${take} of ${calls} pattern-set material calls with a literal painter (bayworld, underwater, fairway) name a mapped painter and take its class on desktop high unless they set their own factors`);
  check(/rzInstallSurfaces\(npTierName, undefined, TX_SURFACE_HOOK\)/.test(app), "the app installs the class hook behind rzLevel (desktop high only)");
}

console.log(`check_rz: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
