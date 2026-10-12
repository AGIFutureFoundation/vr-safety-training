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

console.log(`check_rz: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
