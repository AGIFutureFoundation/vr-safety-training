#!/usr/bin/env node
/**
 * ENV-HD-6 (docs/consoles/ENV-HD-6.md): buildings that read as their kind. Headless (no browser):
 *   1. the kind cues — the busiest park, fire station, hospital and school (HD3_SCENE_SITES' "kind" entries) each take a cue
 *      on high and balanced, inside HD6_KIND_BUDGET per site; nothing on the phone tier or in a headset browser;
 *   2. where the cues stand — every part off the carriageways, out of the water, clear of the other buildings (massing and
 *      catalog sites) and of the site's job board;
 *   3. the chunk budgets — FACADES' details in each cued site's chunks plus the cue mesh inside FC_BUDGET on every tier;
 *   4. the board lamps — every site board's lit face (ATMOS's "site" lamp at y + 6.5) has a post, an arm and a housing over it;
 *   5. Ultra — the four kinds' hero buildings in one 2048 px atlas inside HD6_KIND_BUDGET.ultra (a canvas stub);
 *   6. assets and wiring — no words drawn, generic by kind, the app mounts it, the bundler lists it, every name prefixed.
 *     node tools/check_hd6.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } return ok; };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
const t0 = performance.now();

const THREE = await imp("vendor/three/dist/three.module.min.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
const CW = await imp("shared/cw-cityworks.js");
const F = await imp("shared/fc-facades.js");
const H3 = await imp("shared/hd3-scenes.js");
const K = await imp("shared/hd6-kinds.js");
const B = K.HD6_KIND_BUDGET;
const TIERS = ["low", "balanced", "high"];
const QUEST = "Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/35.0 Chrome/126.0 Safari/537.36";
const boardsOf = (p) => E.npPrepare(p).sites.map((s) => ({ site: s, x: s.position[0], z: s.position[1] + 6, y: E.npHeightAt(p, s.position[0], s.position[1]) }));
const footprint = (part) => { // the part's ground rectangle (a rotated box's corners), [x0, z0, x1, z1]
  const [w, , d] = part.size, c = Math.cos(part.ry), s = Math.sin(part.ry), xs = [], zs = [];
  for (const [u, v] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) { xs.push(part.at[0] + u * c + v * s); zs.push(part.at[2] - u * s + v * c); }
  return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
};
const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

// 1. the kind cues
const specs = H3.HD3_SCENE_SITES.filter((s) => s.by === "kind");
check(K.HD6_KINDS.length === 4 && specs.length === 4 && specs.every((s) => K.HD6_KINDS.includes(s.kind)), `four kinds take a cue: ${K.HD6_KINDS.join(", ")} (ENV-HD-5's "kind" presets: ${specs.map((s) => s.id).join(", ")})`);
check(B.meshesPerMap.low === 0 && B.trianglesPerSite.low === 0 && B.lampTriangles.low === 0 && B.lights === 0 && B.textureBytes === 0, "the stated budget: nothing on the phone tier, no light, no texture off Ultra");
let cued = 0;
const perSite = [];
for (const spec of specs) {
  const p = R.npParish(spec.parish), sites = K.hd6KindSites(p), site = sites.find((s) => s.id === spec.id);
  if (!check(!!site && site.kind === spec.kind, `${spec.id}: the ${spec.kind} site on ${spec.parish} is cued`)) continue;
  const row = { id: spec.id, kind: spec.kind };
  for (const tier of ["balanced", "high"]) {
    const parts = K.hd6CueParts(p, site, tier), tris = parts.length * 12;
    row[tier] = tris;
    check(parts.length > 0 && tris <= B.trianglesPerSite[tier], `${spec.id}/${tier}: ${parts.length} parts, ${tris} triangles <= ${B.trianglesPerSite[tier]}`);
    check(parts.every((q) => q.size.every((v) => v > 0 && v < 30) && q.at.every(Number.isFinite)), `${spec.id}/${tier}: every part has a finite place and a size under 30 m`);
  }
  check(row.balanced < row.high, `${spec.id}: balanced takes the lighter build (${row.balanced} < ${row.high} triangles)`);
  // 2. where the cues stand
  const parts = K.hd6CueParts(p, site, "high"), b = site.b, board = boardsOf(p)[site.index];
  const others = [];
  for (let i = 0; i < p.sites.length; i++) if (i !== site.index) { try { const o = CW.cwSiteBuilding(p, i); others.push([o.cx - o.w / 2, o.cz - o.d / 2, o.cx + o.w / 2, o.cz + o.d / 2]); } catch { /* none */ } }
  const { cx, cz } = E.npChunkOf(b.cx, b.cz), keep = CW.cwMassFilter(p);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const m of E.npMassingForChunk(p, cx + dx, cz + dz)) if (keep(m)) for (const bx of CW.cwSpotBoxes(m)) others.push([bx.min[0], bx.min[2], bx.max[0], bx.max[2]]);
  let onRoad = 0, wet = 0, clash = 0, nearBoard = 0;
  for (const q of parts) {
    const f = footprint(q);
    for (const [x, z] of [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]], [(f[0] + f[2]) / 2, (f[1] + f[3]) / 2]]) {
      const n = CW.cwNearestLine(p, x, z, 60, (l) => l.cls !== "ferry");
      if (n && n.d < (n.line.width ?? 10) / 2) { onRoad++; break; }
    }
    if (E.npWaterAt(p, (f[0] + f[2]) / 2, (f[1] + f[3]) / 2)) wet++;
    if (others.some((o) => hit(f, o))) clash++;
    if (hit(f, [board.x - 1.3 - 1.5, board.z - 0.1 - 1.5, board.x + 1.3 + 1.5, board.z + 0.1 + 1.5])) nearBoard++;
  }
  check(onRoad === 0, `${spec.id}: no part stands on a carriageway (${onRoad} of ${parts.length})`);
  check(wet === 0, `${spec.id}: no part stands in the water (${wet})`);
  check(clash === 0, `${spec.id}: no part runs into another building, massing or catalog site (${clash} of ${parts.length}; ${others.length} boxes near)`);
  check(nearBoard === 0, `${spec.id}: every part is >= 1.5 m from the job board (${nearBoard})`);
  const inside = parts.filter((q) => { const f = footprint(q); return f[0] > b.cx - b.w / 2 + 0.2 && f[2] < b.cx + b.w / 2 - 0.2 && f[1] > b.cz - b.d / 2 + 0.2 && f[3] < b.cz + b.d / 2 - 0.2 && q.at[1] - q.size[1] / 2 < b.y + b.h - 0.1; });
  check(inside.length === 0, `${spec.id}: nothing is buried inside the building's walls (${inside.length})`);
  cued++;
  perSite.push(row);
}
check(cued === 4, `kinds with a cue: 0 -> ${cued} of 4`);
note(`cue triangles per site (balanced / high): ${perSite.map((r) => `${r.kind} ${r.balanced} / ${r.high}`).join(", ")} (budget ${B.trianglesPerSite.balanced} / ${B.trianglesPerSite.high})`);

// 1b, 3, 4. the built mesh per map and tier, the chunk budgets, the lamps
const maps = [...new Set(specs.map((s) => s.parish))];
for (const id of maps) {
  const p = R.npParish(id), boards = boardsOf(p), sites = K.hd6KindSites(p);
  for (const tier of TIERS) {
    const m = K.hd6Build({ THREE, parish: p, boards, tier, ua: "Mozilla/5.0 (X11; Linux x86_64) Chrome/126.0" });
    if (tier === "low") { check(m === null, `${id}/low: the phone tier builds nothing here`); continue; }
    if (!check(!!m && m.isMesh && !m.isInstancedMesh, `${id}/${tier}: one merged mesh`)) continue;
    const tris = m.geometry.attributes.position.count / 3, model = m.userData.hd6.triangles;
    check(tris === model, `${id}/${tier}: triangles measured ${tris} = model ${model}`);
    const lampTris = boards.length * 4 * 12;
    check(lampTris / boards.length <= B.lampTriangles[tier], `${id}/${tier}: ${boards.length} board lamps, ${lampTris / boards.length} triangles each <= ${B.lampTriangles[tier]}`);
    check(!m.material.map && m.material.vertexColors, `${id}/${tier}: vertex colours, no texture`);
    check(K.hd6Build({ THREE, parish: p, boards, tier, ua: QUEST }) === null, `${id}/${tier}: a headset browser builds nothing here`);
    // the chunk budgets: the cue mesh is charged to each cued site's chunks (building, cue footprint), on top of FACADES there
    for (const s of sites) {
      const parts = K.hd6CueParts(p, s, tier), keys = new Set();
      for (const q of parts) { const f = footprint(q); for (const [x, z] of [[f[0], f[1]], [f[2], f[3]], [f[0], f[3]], [f[2], f[1]]]) keys.add(E.npChunkOf(x, z).key); }
      for (const key of keys) {
        const [cx, cz] = key.split(",").map(Number);
        const spots = E.npMassingForChunk(p, cx, cz).filter(CW.cwMassFilter(p));
        const det = spots.length ? F.fcDetails({ THREE, parish: p, chunk: { cx, cz, key, ring: 0, lod: 0 }, spots, tier }) : null;
        const dm = det?.userData.fc.meshes ?? 0, dt = det?.userData.fc.triangles ?? 0;
        const lamps = boards.filter((bd) => E.npChunkOf(bd.x, bd.z).key === key).length * 48, ct = parts.length * 12 + lamps;
        check(dm + 1 <= F.FC_BUDGET.meshesPerChunk[tier] && dt + ct <= F.FC_BUDGET.trianglesPerChunk[tier], `${s.id}/${tier}: chunk ${key} FACADES ${dm} + cue 1 meshes <= ${F.FC_BUDGET.meshesPerChunk[tier]}, ${dt} + ${ct} triangles <= ${F.FC_BUDGET.trianglesPerChunk[tier]}`);
        det?.dispose?.();
      }
    }
    m.geometry.dispose();
  }
  // the board lamps: a post beside every board, its housing directly over ATMOS's lit face (y + 6.5, 0.5 m tall)
  let lit = 0;
  for (const bd of boards) {
    const [pole, arm, housing] = K.hd6LampParts(bd);
    const face = { y0: bd.y + 6.5 - 0.25, y1: bd.y + 6.5 + 0.25 };
    const ok = Math.abs(pole.at[1] - pole.size[1] / 2 - bd.y) < 0.01 && pole.at[1] + pole.size[1] / 2 >= arm.at[1] && Math.abs(housing.at[0] - bd.x) < 0.01 && housing.at[1] - housing.size[1] / 2 >= face.y1 - 0.01 && housing.at[1] - housing.size[1] / 2 - face.y1 < 0.05 && Math.abs(pole.at[0] - bd.x) > 1.3 + 0.08;
    if (ok) lit++;
  }
  check(lit === boards.length, `${id}: every board lamp has a post from the ground, an arm and a housing over its lit face (${lit} of ${boards.length}); night lamp bars floating: ${boards.length - lit}`);
}
{ // the ATMOS lamp this draws a post for is where hd6LampParts assumes (at-world.js: y + 6.5, 1.4 x 0.5 m)
  const at = readFileSync(join(WEBXR, "shared/at-world.js"), "utf8");
  check(/y: s\.y \+ 6\.5, z: s\.z, yaw: 0, w: 1\.4, h: 0\.5, kind: "site"/.test(at), "ATMOS's site lamp is the 1.4 x 0.5 m face at y + 6.5 over the board (the post's assumption)");
}

// 5. Ultra
{
  const calls = { fillText: 0, rects: 0 };
  const ctx = { fillStyle: "", fillRect() { calls.rects++; }, fillText() { calls.fillText++; }, strokeText() { calls.fillText++; } };
  const doc = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
  let n = 0;
  for (const id of maps) {
    const p = R.npParish(id), m = K.hd6UltraShells({ THREE, parish: p, doc });
    if (!check(!!m, `${id}: Ultra builds the hero buildings' facade shells`)) continue;
    const u = m.userData.hd6, sites = K.hd6KindSites(p).length;
    n += sites;
    check(u.atlasPx === 2048 && m.material.map?.image?.width === 2048, `${id}: Ultra's atlas is 2048 px`);
    check(u.textureBytes <= B.ultra.textureBytes, `${id}: Ultra's atlas ${(u.textureBytes / 1048576).toFixed(2)} MiB <= ${(B.ultra.textureBytes / 1048576).toFixed(0)} MiB`);
    check(u.triangles === sites * B.ultra.trianglesPerSite, `${id}: ${u.triangles} triangles = ${sites} buildings x ${B.ultra.trianglesPerSite} (four walls, no roof)`);
    m.geometry.dispose(); m.material.map.dispose();
  }
  check(n === 4, `Ultra hero buildings: 0 -> ${n} of 4`);
  check(calls.fillText === 0 && calls.rects > 100, `the atlas draws no words (${calls.fillText} text calls, ${calls.rects} rects)`);
  check(K.hd6UltraShells({ THREE, parish: R.npParish("orleans"), doc: null }) === null, "without a canvas, Ultra's shells are skipped");
}

// determinism
{
  const p = R.npParish("orleans"), s = K.hd6KindSites(p)[0];
  check(JSON.stringify(K.hd6CueParts(p, s, "high")) === JSON.stringify(K.hd6CueParts(p, s, "high")), "the same site builds the same cue twice");
}

// 6. assets and wiring
{
  const src = readFileSync(join(WEBXR, "shared/hd6-kinds.js"), "utf8"), code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  check(!/fillText|strokeText|font\s*=/.test(code), "hd6-kinds.js draws no words");
  check(!/\b(red cross|crescent|caduceus|star of life)\b/i.test(code) && !/0xff0000|#ff0000|#f00\b/i.test(code), "no protected emblem: the hospital sign is a white H on blue");
  check(!/https?:|\.glb|\.gltf|\.png|\.jpg|TextureLoader|GLTFLoader/.test(code), "procedural only: no loaded model or texture");
  const tops = [...src.matchAll(/^(?:export\s+)?(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  check(tops.every((n) => /^(hd6|HD6_)/.test(n)) && !/import\s*\{[^}]*\bas\b/.test(src), `hd6-kinds.js: every top-level name carries the hd6 prefix (${tops.length}), no import aliases`);
  const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
  check(/import\s*\{[^}]*\bhd6Build\b[^}]*\}\s*from\s*"\.\.\/\.\.\/shared\/hd6-kinds\.js"/.test(app) && /hd6Build\(\{ THREE, parish, boards: world\.siteBoards, tier: npTierName \}\)/.test(app), "the parishes app builds the cues with the page's tier and the engine's boards");
  check(/if \(hd4Ultra\.on\) \{ hd6Ultra = hd6UltraShells\(/.test(app), "the app builds Ultra's shells only when Ultra is on");
  const bsrc = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8"), ih = bsrc.indexOf('SHARED / "hd6-kinds.js"');
  check(ih > 0 && ih > bsrc.indexOf('SHARED / "cw-cityworks.js"') && ih > bsrc.indexOf('SHARED / "hd3-scenes.js"'), "the bundler lists hd6-kinds.js after its imports");
  const npw = readFileSync(join(WEBXR, "shared/np-world.js"), "utf8");
  check(/houses\.name = "parish-site-buildings"/.test(npw) && !/hd6/.test(npw), "the engine's own site buildings are untouched (the phone tier builds what it built)");
}

console.log(`\nENV-HD-6: ${failures ? `${failures} FAILED, ` : "all "}${passes} checks pass (${((performance.now() - t0) / 1000).toFixed(1)} s).`);
process.exit(failures ? 1 : 0);
