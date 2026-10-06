#!/usr/bin/env node
/**
 * PALETTE (docs/consoles/PALETTE.md): the parish engine's massing material hook (shared/pa-palette.js), its colour
 * categories (shared/pa-palette-data.js, plain data TQ-BRIDGE exports) and the pixel painters it packs into one atlas per
 * region (shared/textures.js TX_PX_PAINTERS).
 *
 *   - every region x character, and every building kind on every map, resolves to a category; trees and cranes stay put
 *   - every category names real painters, four or more wall colours, and a sign pair whose ink is a design token at 4.5:1
 *   - every pixel painter tiles (edge-pixel test: the wrap seam is no rougher than 1.1x the roughest seam inside the tile:
 *     a course or board boundary lands on the wrap, so a tone step there is one more sample of the same boundaries),
 *     is deterministic, and sits near the gain's mid-grey
 *   - one atlas per region per tier, inside its size; none on the phone tier
 *   - the shader patch finds every include it rewrites (three.js's own Lambert source)
 *   - a headless build on the vendored three.js: the same meshes and triangles with and without the hook, per-chunk
 *     material counts (at most one textured material per kind), per-instance colour set and deterministic, and the
 *     engine without the hook sets no instance colour
 *   - wiring: both modules in every bundle list that carries np-world.js (after it and textures.js), the parishes app mounts it
 *
 *     node tools/check_palette.mjs
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

// The pure data module imports on its own, as TQ-BRIDGE reads it.
const D = await imp("shared/pa-palette-data.js");
check(typeof D.PA_CATEGORIES === "object" && Object.keys(D.PA_CATEGORIES).length >= 12, `pa-palette-data.js imports alone with ${Object.keys(D.PA_CATEGORIES).length} categories`);
check(JSON.parse(JSON.stringify(D.PA_CATEGORIES))["mission-stucco"]?.walls?.length > 0, "PA_CATEGORIES round-trips through JSON (plain data)");

const S = await buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/pa-palette-data.js", "shared/pa-palette.js"],
  "export { TX_PX_PAINTERS, TX_PX_PAINTER_IDS, TX_PX_GAIN, txPxTile, txPxAtlas, txClapboardFace, txShingleFace, txStuccoFace, txSpanishTileFace, paMount, paMaterialFor, paAtlasFor, paStats, paReset, paPatchShader, paRegionPainters };",
  "palette");
const R = await imp("shared/np-parishes.js");
const E = await imp("shared/np-parish.js");
const W = await imp("shared/np-world.js");
const THREE = await imp("vendor/three/dist/three.module.min.js");

// 1. categories cover every region x character and every building kind on every map
for (const reg of R.NP_REGIONS) for (const ch of D.PA_CHARACTERS) {
  const id = D.PA_REGION_CHARACTERS[reg.id]?.[ch];
  check(!!D.PA_CATEGORIES[id], `${reg.id} · ${ch} -> a category (${id})`);
}
for (const [pid, over] of Object.entries(D.PA_PARISH_CHARACTERS)) {
  check(R.NP_PARISHES.some((p) => p.id === pid), `override ${pid} is a registered map`);
  for (const [ch, id] of Object.entries(over)) check(D.PA_CHARACTERS.includes(ch) && !!D.PA_CATEGORIES[id], `override ${pid} · ${ch} -> ${id}`);
}
const kindsSeen = new Set();
let mapped = 0;
for (const p of R.NP_PARISHES) {
  const kinds = new Set();
  for (let cx = 0; cx < E.NP_SIZE / E.NP_CHUNK; cx += 3) for (let cz = 0; cz < E.NP_SIZE / E.NP_CHUNK; cz += 3) for (const s of E.npMassingForChunk(p, cx, cz)) kinds.add(s.kind);
  for (const k of kinds) {
    kindsSeen.add(k);
    const cat = D.paCategoryFor(k, p);
    if (D.PA_KIND_CHARACTER[k]) { check(!!cat, `${p.id} · ${k} has a category`); mapped++; }
    else check(cat === null, `${p.id} · ${k} is left to the engine (tree, reed or crane)`);
  }
}
note(`${R.NP_PARISHES.length} maps, ${kindsSeen.size} massing kinds seen, ${mapped} map x kind pairs painted`);

// 2. each category: painters, colours, signs against the design tokens
const css = readFileSync(join(WEBXR, "shared", "design.css"), "utf8");
const tokens = new Set([...css.matchAll(/--at-on-surface:\s*#([0-9a-f]{6})/gi)].map((m) => parseInt(m[1], 16)));
const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (h) => 0.2126 * lin((h >> 16) & 255) + 0.7152 * lin((h >> 8) & 255) + 0.0722 * lin(h & 255);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
let worst = Infinity;
for (const c of Object.values(D.PA_CATEGORIES)) {
  check(Array.isArray(c.walls) && c.walls.length >= 4 && c.walls.every((h) => Number.isInteger(h) && h >= 0 && h <= 0xffffff), `${c.id}: four or more wall colours`);
  check(!!S.TX_PX_PAINTERS[c.wall] && !!S.TX_PX_PAINTERS[c.roof] && !!D.PA_TEXTURES[c.wall] && !!D.PA_TEXTURES[c.roof], `${c.id}: wall ${c.wall} and roof ${c.roof} are pixel painters with a tile size`);
  check(/procedural/i.test(c.note ?? ""), `${c.id}: says it is procedural`);
  check(!/\d/.test(`${c.name} ${c.note}`), `${c.id}: no figures in its name or note`);
  check(tokens.has(c.sign?.ink), `${c.id}: sign ink #${(c.sign?.ink ?? 0).toString(16).padStart(6, "0")} is a design token (--at-on-surface)`);
  const cr = contrast(c.sign.ground, c.sign.ink); worst = Math.min(worst, cr);
  check(cr >= 4.5, `${c.id}: sign contrast ${cr.toFixed(2)}:1 >= 4.5`);
}
note(`${tokens.size} design ink tokens; worst sign contrast ${worst.toFixed(2)}:1`);

// 3. pixel painters: tile, determinism, mean
const seam = (buf, w, h, axis) => {
  const px = (x, y) => buf[(y * w + x) * 4];
  const n = axis === "x" ? w : h, m = axis === "x" ? h : w;
  const diff = (a, b) => { let s = 0; for (let k = 0; k < m; k++) s += Math.abs(axis === "x" ? px(a, k) - px(b, k) : px(k, a) - px(k, b)); return s / m; };
  let inner = 0; for (let i = 0; i < n - 1; i++) inner = Math.max(inner, diff(i, i + 1));
  return { wrap: diff(n - 1, 0), inner };
};
for (const id of S.TX_PX_PAINTER_IDS) {
  for (const px of [56, 120]) {
    const a = S.txPxTile(id, px), b = S.txPxTile(id, px);
    const sx = seam(a, px, px, "x"), sy = seam(a, px, px, "y");
    check(sx.wrap <= sx.inner * 1.1 + 1 && sy.wrap <= sy.inner * 1.1 + 1, `${id} @${px}: tiles (wrap seam ${sx.wrap.toFixed(1)}/${sy.wrap.toFixed(1)} <= 1.1 x roughest inner ${sx.inner.toFixed(1)}/${sy.inner.toFixed(1)})`);
    check(a.every((v, i) => v === b[i]), `${id} @${px}: deterministic`);
    let sum = 0; for (let i = 0; i < a.length; i += 4) sum += a[i];
    const mean = sum / (px * px);
    check(mean * S.TX_PX_GAIN > 200 && mean * S.TX_PX_GAIN < 290, `${id} @${px}: mean ${mean.toFixed(0)} x gain ${S.TX_PX_GAIN} ≈ 1 (${(mean * S.TX_PX_GAIN / 255).toFixed(2)})`);
  }
}
{ // the edge-pixel test bites: a ramp that does not wrap fails it
  const px = 64, ramp = new Uint8ClampedArray(px * px * 4);
  for (let y = 0; y < px; y++) for (let x = 0; x < px; x++) ramp[(y * px + x) * 4] = 120 + x * 2;
  const s = seam(ramp, px, px, "x");
  check(s.wrap > s.inner * 1.1 + 1, `the edge-pixel test rejects a non-tiling ramp (wrap ${s.wrap.toFixed(1)} vs inner ${s.inner.toFixed(1)})`);
}
for (const f of ["txClapboardFace", "txShingleFace", "txStuccoFace", "txSpanishTileFace"]) {
  try { const c = globalThis.document.createElement("canvas"); c.width = c.height = 64; S[f](c.getContext("2d"), 64, 64, {}); check(true, ""); }
  catch (e) { check(false, `${f} survives a stubbed 2D context (${e.message})`); }
}
note(`${S.TX_PX_PAINTER_IDS.length} pixel painters (${S.TX_PX_PAINTER_IDS.join(", ")})`);

// 4. atlases: one per region per tier, inside the size, none on the phone
const ATLAS_MAX = { high: 512 * 512, balanced: 256 * 256 };
for (const reg of R.NP_REGIONS) {
  const painters = S.paRegionPainters(reg.id);
  for (const tier of ["high", "balanced", "low"]) {
    const a = S.paAtlasFor(reg.id, tier, THREE);
    if (tier === "low") { check(a === null, `${reg.id} · low: no atlas (vertex colour only)`); continue; }
    check(!!a && a.width * a.height <= ATLAS_MAX[tier], `${reg.id} · ${tier}: atlas ${a?.width}x${a?.height} (${painters.length} painters) <= ${Math.sqrt(ATLAS_MAX[tier])}²`);
    check(painters.every((id) => a.cells[id]?.every((v) => v >= 0 && v <= 1)), `${reg.id} · ${tier}: every painter has a cell`);
    check(S.paAtlasFor(reg.id, tier, THREE) === a, `${reg.id} · ${tier}: atlas cached`);
  }
}
const st0 = S.paStats();
note(`atlases ${st0.atlases} (${(st0.atlasPixels / 1e6).toFixed(3)} Mpx over every region and tier)`);

// 5. the shader patch finds every include (three.js's own Lambert source)
{
  const lam = THREE.ShaderLib.lambert;
  const sh = S.paPatchShader({ vertexShader: lam.vertexShader, fragmentShader: lam.fragmentShader, uniforms: {} }, { atlas: {}, wall: [0, 0, 0.5, 0.5], roof: [0.5, 0, 0.5, 0.5], metres: [3, 4] });
  check(!/#include <color_vertex>\n(?!#if defined\( USE_COLOR \) && defined\( USE_INSTANCING_COLOR \))/.test(sh.vertexShader) && sh.vertexShader.includes("instanceColor.xyz : color"), "shader: the wall tint follows color_vertex");
  check(sh.vertexShader.includes("varying vec2 vPaUv") && sh.vertexShader.includes("vPaUv = "), "shader: the vertex box projection is in");
  check(sh.fragmentShader.includes("uniform sampler2D uPaAtlas") && sh.fragmentShader.includes("diffuseColor.rgb *= paD"), "shader: the atlas detail is in");
  check(!!sh.uniforms.uPaAtlas && !!sh.uniforms.uPaWall && !!sh.uniforms.uPaRoof && !!sh.uniforms.uPaMetres, "shader: its uniforms are set");
  const tint = S.paPatchShader({ vertexShader: lam.vertexShader, fragmentShader: lam.fragmentShader, uniforms: {} }, {});
  check(tint.vertexShader.includes("instanceColor.xyz : color") && !tint.fragmentShader.includes("uPaAtlas"), "shader (phone): the tint alone, no atlas");
}

// 6. headless builds: meshes and triangles unchanged, per-chunk materials, instance colour, determinism
const matsOf = (world) => {
  const perChunk = new Map(); let tinted = 0, untinted = 0;
  world.loaded.forEach((c, key) => {
    const ms = new Set();
    for (const m of c.mass) if (m.isInstancedMesh) { ms.add(m.material); if (m.instanceColor) tinted++; else untinted++; }
    perChunk.set(key, ms);
  });
  return { perChunk, tinted, untinted };
};
const colours = (world) => { const out = []; world.loaded.forEach((c) => { for (const m of c.mass) if (m.instanceColor) out.push(...m.instanceColor.array.slice(0, 12)); }); return out; };
const MAPS = ["orleans", "sf-mission", "oak-west-oakland", "bay-san-pablo", "bay-san-jose", "bp-strip-marsh-east"];
for (const pid of MAPS) {
  const parish = R.npParish(pid);
  const start = E.npStartSite(parish).position;
  for (const tier of ["high", "low"]) {
    W.NP_MASSING_HOOKS.material = null;
    const base = W.npBuildParish(new THREE.Group(), THREE, parish, { tier, start: [start[0], start[1] + 16] });
    const b = base.stats(), bm = matsOf(base);
    check(bm.tinted === 0, `${pid} · ${tier}: without the hook no instance colour (${bm.untinted} mass meshes)`);
    const pal = S.paMount({ tier, hooks: W.NP_MASSING_HOOKS });
    const w1 = W.npBuildParish(new THREE.Group(), THREE, parish, { tier, start: [start[0], start[1] + 16] });
    const w2 = W.npBuildParish(new THREE.Group(), THREE, parish, { tier, start: [start[0], start[1] + 16] });
    const a = w1.stats(), am = matsOf(w1);
    check(a.meshes === b.meshes && a.triangles === b.triangles && a.instances === b.instances, `${pid} · ${tier}: no new meshes (${a.meshes} meshes, ${a.triangles} tris, ${a.instances} instances, same as without)`);
    let worstChunk = 0, worstTextured = 0, okKinds = true;
    for (const ms of am.perChunk.values()) {
      worstChunk = Math.max(worstChunk, ms.size);
      const textured = [...ms].filter((m) => m.userData?.paTextured);
      worstTextured = Math.max(worstTextured, textured.length);
      const kinds = textured.map((m) => m.name.split("-").slice(-2, -1)[0]);
      if (new Set(kinds).size !== kinds.length) okKinds = false;
    }
    check(okKinds, `${pid} · ${tier}: at most one textured material per kind per chunk`);
    check(tier !== "low" || worstTextured === 0, `${pid} · ${tier}: ${tier === "low" ? "no textured material on the phone" : "textured"} (worst chunk ${worstTextured} textured of ${worstChunk} materials)`);
    check(am.tinted > 0, `${pid} · ${tier}: ${am.tinted} mass meshes carry per-building colour`);
    const c1 = colours(w1), c2 = colours(w2);
    check(c1.length > 0 && c1.every((v, i) => v === c2[i]), `${pid} · ${tier}: instance colours deterministic (${c1.length / 3} sampled)`);
    note(`${pid} · ${tier}: meshes ${b.meshes} -> ${a.meshes}, worst chunk ${worstChunk} materials (${worstTextured} textured), palette cache ${pal.stats().materials} materials / ${pal.stats().programs} programs`);
  }
}
W.NP_MASSING_HOOKS.material = null;
const st = S.paStats();
check(st.programs <= 2, `every PALETTE material shares one of two shader programs (${st.programs})`);
note(`palette cache after ${MAPS.length} maps x 2 tiers: ${st.materials} materials (${st.textured} textured), ${st.atlases} atlases`);

// 7. wiring
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
const lists = bundler.split(/\n    "[a-z0-9-]+": \{/).filter((b) => b.includes('SHARED / "np-world.js"'));
check(lists.length >= 1, `${lists.length} bundle list(s) carry np-world.js`);
for (const l of lists) {
  const at = (f) => l.indexOf(`SHARED / "${f}"`);
  check(at("pa-palette-data.js") > at("np-world.js") && at("pa-palette.js") > at("pa-palette-data.js") && at("textures.js") >= 0 && at("textures.js") < at("pa-palette.js"), "a bundle with np-world.js carries pa-palette-data.js then pa-palette.js after np-world.js and textures.js");
}
const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
check(/import \{[^}]*paMount[^}]*\} from "\.\.\/\.\.\/shared\/pa-palette\.js"/.test(app), "the parishes app imports paMount");
check(app.indexOf("paMount(") > 0 && app.indexOf("paMount(") < app.indexOf("npBuildParish(root"), "the parishes app mounts PALETTE before it builds the world");
const worldSrc = readFileSync(join(WEBXR, "shared", "np-world.js"), "utf8");
// DETAIL (docs/consoles/DETAIL.md) added the streaming hooks; material and details must still start unset.
check(/export const NP_MASSING_HOOKS = \{ material: null, details: null(, [a-zA-Z]+: null)* \};/.test(worldSrc), "the hook definition keeps material and details unset");

console.log(`check_palette: ${passes} passed, ${failures} failed (${Date.now() - t0} ms)`);
process.exit(failures ? 1 : 0);
