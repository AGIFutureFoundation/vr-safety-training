#!/usr/bin/env node
/**
 * ENV-HD-6 (docs/consoles/ENV-HD-6.md): buildings that read as their kind. Headless (no browser):
 *   1. the kind cues — the busiest park, fire station, hospital and school (HD3_SCENE_SITES' "kind" entries) each take a cue
 *      on high and balanced, inside HD6_KIND_BUDGET per site; nothing on the phone tier or in a headset browser;
 *      ENV-HD-7: every site of the four kinds on all 46 maps takes a cue (fitted group by group, a group that cannot fit is
 *      skipped), the presets keep ENV-HD-6's placements (the school's yard faces its street camera);
 *   2. where the cues stand — every part off the carriageways, out of the water, clear of the other buildings (massing and
 *      catalog sites), of the other sites' cues and of the site's job board — at every cued site;
 *   3. the chunk budgets — FACADES' details in each cued chunk plus the cue mesh (every site's cue parts and lamps in that
 *      chunk, summed) inside FC_BUDGET on every tier, on every map;
 *   3b. ENV-HD-7: the H sign at night — the sign's parts drawn unlit (a second material on the same mesh), 0 lights, 0 textures;
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
const hdr = (id) => { const p = R.npParish(id); return { p, sites: K.hd6KindSites(p) }; };
// ENV-HD-7: every site of the four kinds on every map (fitted in the build's order, sharing the map's `taken` list)
const ALL = R.npParishIds();
const tally = Object.fromEntries(K.HD6_CUED_KINDS.map((k) => [k, { sites: 0, cued: 0, full: 0 }]));
const fitted = new Map(); // parish id -> [{ site, balanced: {parts, skipped}, high: {parts, skipped} }]
let faults = { road: 0, water: 0, building: 0, board: 0, cue: 0, buried: 0, over: 0 }, partsSeen = 0, catalog = 0;
for (const id of ALL) {
  const { p, sites } = hdr(id);
  catalog += p.sites.filter((s) => K.HD6_CUED_KINDS.includes(s.kind)).length;
  const rows = [], taken = { balanced: [], high: [] };
  for (const site of sites) {
    const row = { site };
    for (const tier of ["balanced", "high"]) row[tier] = K.hd6FitCue(p, site, tier, taken[tier]);
    rows.push(row);
    const t = tally[site.kind]; t.sites++;
    if (row.high.parts.length && row.balanced.parts.length) t.cued++;
    if (!row.high.skipped.length) t.full++;
    for (const tier of ["balanced", "high"]) if (row[tier].parts.length * 12 > B.trianglesPerSite[tier]) faults.over++;
    // 2. where the cues stand (re-tested here against everything placed before it on the map, as the build places them)
    const board = boardsOf(p)[site.index], b = site.b;
    const before = rows.slice(0, -1).flatMap((r) => r.high.parts.map(footprint));
    const ctx = { obstacles: K.hd6Obstacles(p, site), board: [board.x, board.z], taken: before };
    for (const q of row.high.parts) {
      partsSeen++;
      const f = K.hd6PartFault(p, q, ctx);
      // a group on the building itself (within 0.5 m of its walls) may stand over water or at a carriageway's edge where the
      // engine's own building does (HD6_ON_BUILDING); every free-standing group (yard, pavilion, lane, canopy ...) may not
      if (f && !((f === "water" || f === "road") && K.HD6_ON_BUILDING.includes(q.group))) faults[f]++;
      const fp = footprint(q);
      if (fp[0] > b.cx - b.w / 2 + 0.2 && fp[2] < b.cx + b.w / 2 - 0.2 && fp[1] > b.cz - b.d / 2 + 0.2 && fp[3] < b.cz + b.d / 2 - 0.2 && q.at[1] - q.size[1] / 2 < b.y + b.h - 0.1) faults.buried++;
    }
  }
  fitted.set(id, rows);
}
check(K.HD6_MORE_KINDS.length >= 2 && K.HD6_MORE_KINDS.every((k) => !K.HD6_KINDS.includes(k)), `the next kinds take a cue too: ${K.HD6_MORE_KINDS.join(", ")} (kinds with a cue: 4 -> ${K.HD6_CUED_KINDS.length})`);
for (const k of K.HD6_CUED_KINDS) {
  const t = tally[k];
  check(t.sites > 0 && t.cued === t.sites, `${k}: every site on every map takes a cue (${t.cued} of ${t.sites}; ${t.full} with every part group, the rest skip a group that cannot fit)`);
}
check(Object.values(tally).reduce((a, t) => a + t.sites, 0) === catalog, `every catalog site of the cued kinds is considered (${catalog} on ${ALL.length} maps)`);
check(faults.over === 0, `every cued site inside HD6_KIND_BUDGET's triangles per site (${faults.over} over)`);
check(faults.road === 0, `no cue part on a carriageway at any site (${faults.road} of ${partsSeen})`);
check(faults.water === 0, `no cue part in the water (${faults.water})`);
check(faults.building === 0, `no cue part runs into another building, massing or catalog site (${faults.building})`);
check(faults.cue === 0, `no cue part runs into another site's cue (${faults.cue})`);
check(faults.board === 0, `every cue part >= 1.5 m from its job board (${faults.board})`);
check(faults.buried === 0, `nothing buried inside a building's walls (${faults.buried})`);
// the independent re-test of §2 (ENV-HD-6's own road / water / building / board test, not the module's) at every site
{
  let bad = 0, n = 0;
  for (const id of ALL) {
    const p = R.npParish(id), boards = boardsOf(p);
    for (const { site, high } of fitted.get(id)) {
      const others = [];
      for (let i = 0; i < p.sites.length; i++) if (i !== site.index) { try { const o = CW.cwSiteBuilding(p, i); others.push([o.cx - o.w / 2, o.cz - o.d / 2, o.cx + o.w / 2, o.cz + o.d / 2]); } catch { /* none */ } }
      const { cx, cz } = E.npChunkOf(site.b.cx, site.b.cz), keep = CW.cwMassFilter(p);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const m of E.npMassingForChunk(p, cx + dx, cz + dz)) if (keep(m)) for (const bx of CW.cwSpotBoxes(m)) others.push([bx.min[0], bx.min[2], bx.max[0], bx.max[2]]);
      const board = boards[site.index];
      for (const q of high.parts) {
        n++;
        const f = footprint(q);
        let road = false;
        for (const [x, z] of [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]], [(f[0] + f[2]) / 2, (f[1] + f[3]) / 2]]) { const nl = CW.cwNearestLine(p, x, z, 60, (l) => l.cls !== "ferry"); if (nl && nl.d < (nl.line.width ?? 10) / 2) road = true; }
        const wet = E.npWaterAt(p, (f[0] + f[2]) / 2, (f[1] + f[3]) / 2) && !K.HD6_ON_BUILDING.includes(q.group);
        if ((road && !K.HD6_ON_BUILDING.includes(q.group)) || wet || others.some((o) => hit(f, o)) || hit(f, [board.x - 2.8, board.z - 1.6, board.x + 2.8, board.z + 1.6])) bad++;
      }
    }
  }
  check(bad === 0, `ENV-HD-6's own placement test at every cued site: ${bad} of ${n} parts on a road, in water, in a building or by a board`);
}
// the presets: each is still cued, inside budget, balanced lighter; the three that are not the school keep ENV-HD-6's parts
for (const spec of specs) {
  const rows = fitted.get(spec.parish) ?? [], row = rows.find((r) => r.site.id === spec.id);
  if (!check(!!row && row.site.kind === spec.kind && row.site.hero, `${spec.id}: the ${spec.kind} site on ${spec.parish} is cued (a preset)`)) continue;
  check(rows[0].site.hero, `${spec.parish}: the presets are fitted first (they keep their ground)`);
  const r = { id: spec.id, kind: spec.kind, balanced: row.balanced.parts.length * 12, high: row.high.parts.length * 12 };
  check(row.high.skipped.length === 0 && row.balanced.skipped.length === 0, `${spec.id}: every part group fits (${row.high.skipped.join(", ") || "none skipped"})`);
  check(r.balanced < r.high, `${spec.id}: balanced takes the lighter build (${r.balanced} < ${r.high} triangles)`);
  {
    const p = R.npParish(spec.parish), key = (q) => q.at.map((v) => v.toFixed(3)).join(",");
    const same = JSON.stringify(row.high.parts.map(key).sort()) === JSON.stringify(K.hd6CueParts(p, row.site, "high").filter((q) => !["wallsign", "entry"].includes(q.group)).map(key).sort());
    check(same, `${spec.id}: ENV-HD-6's placement kept (every part where it was; the fallbacks unused)`);
  }
  cued++;
  perSite.push(r);
}
check(cued === 4, `presets with a cue: ${cued} of 4`);
// ENV-HD-7: the school's street shot — NEWTON's parked site cars stood between the camera and the entrance canopy
{
  const p = R.npParish("sf-mission"), cam = H3.hd3Scene(p, "mission-school-campus", "street"), rects = H3.hd3PropRects(p);
  const [px, , pz] = cam.position, [tx, , tz] = cam.target;
  let blocked = 0;
  for (let k = 0; k <= 20; k++) { const t = 0.8 * k / 20, x = px + (tx - px) * t, z = pz + (tz - pz) * t; if (rects.some((r) => hit([x - 0.8, z - 0.8, x + 0.8, z + 0.8], r))) blocked++; }
  check(blocked === 0, `mission-school-campus: the street camera's sight line clears NEWTON's parked site cars (${blocked} of 21 samples blocked; camera ${px.toFixed(1)}, ${pz.toFixed(1)})`);
  let all = 0, clear = 0;
  for (const spec of H3.HD3_SCENE_SITES) {
    const q = R.npParish(spec.parish), c = H3.hd3Scene(q, spec.id, "street"), rr = H3.hd3PropRects(q);
    all++;
    if (![0, 0.2, 0.35, 0.5, 0.65, 0.8].some((t) => { const x = c.position[0] + (c.target[0] - c.position[0]) * t, z = c.position[2] + (c.target[2] - c.position[2]) * t; return rr.some((r) => hit([x - 0.8, z - 0.8, x + 0.8, z + 0.8], r)); })) clear++;
  }
  check(clear === all, `street cameras with a sight line clear of the site cars: ${clear} of ${all}`);
}
// ENV-HD-8: MOTORWORKS' parked vehicles (the app passes the ones it drew). Fixture: mvPlacements on NEWTON's headless world with
// DETAIL's lots, as the app's mount places them. A vehicle nearer the camera than the subject whose bearing span overlaps the
// building's and board's span hides part of it (hd3Occluders); the test here is the module's, re-done independently below.
{
  const N = await imp("shared/nw-physics.js"), MW = await imp("shared/mv-world.js"), DT = await imp("shared/dt-detail.js");
  // ENV-HD-7's seven street cameras (x, z), which must not move when no vehicles are passed
  const HD7_CAMS = { "bridge-yard": [-1093.0, -218.4], "port-terminal": [-966.2, 1318.5], "mission-bay-construction-site": [675.3, -284.9], "presidio-crew-yard": [-525.8, -67.3], "no-sw-mid-city-fire-station": [-1784.4, 714.6], "hospital-district": [-724.9, 582.7], "mission-school-campus": [-605.8, 73.8] };
  const occludes = (vs, px, pz, subj) => { // independent: sample the subject's outline and test each ray against each vehicle's box
    const out = new Set();
    const pts = [];
    for (let k = 0; k < subj.length; k++) { const [ax, az] = subj[k], [bx, bz] = subj[(k + 1) % subj.length]; for (let t = 0; t < 1; t += 0.05) pts.push([ax + (bx - ax) * t, az + (bz - az) * t]); }
    for (const v of vs) {
      const [w, , l] = v.dims, h = v.heading, fx = Math.sin(h), fz = Math.cos(h);
      for (const [qx, qz] of pts) {
        const L = Math.hypot(qx - px, qz - pz);
        for (let s = 0.5; s < L; s += 0.25) {
          const x = px + ((qx - px) * s) / L, z = pz + ((qz - pz) * s) / L, dx = x - v.x, dz = z - v.z;
          if (Math.abs(dx * fx + dz * fz) < l / 2 && Math.abs(dx * fz - dz * fx) < w / 2) { out.add(v.drivable ?? v.id); break; }
        }
        if (out.has(v.drivable ?? v.id)) break;
      }
    }
    return [...out];
  };
  for (const tier of ["balanced", "high"]) {
    let before = 0, after = 0, n = 0, unchanged = 0, moved = [];
    for (const spec of H3.HD3_SCENE_SITES) {
      const p = R.npParish(spec.parish), i = p.sites.findIndex((s) => s.id === spec.id), s = p.sites[i], b = CW.cwSiteBuilding(p, i);
      const vehicles = MW.mvPlacements(p, N.nwParishWorld(p), { tier, lots: DT.dtLotRects(p) });
      // the subject's outline: the building's footprint with the board (6 m south of the site point) on it
      const subj = [[b.cx - b.w / 2, b.cz - b.d / 2], [b.cx + b.w / 2, b.cz - b.d / 2], [b.cx + b.w / 2, b.cz + b.d / 2], [b.cx - b.w / 2, b.cz + b.d / 2]];
      const board = [s.position[0], s.position[1] + 6];
      const c0 = H3.hd3Scene(p, spec.id, "street"), c1 = H3.hd3Scene(p, spec.id, "street", { vehicles });
      const hd7 = HD7_CAMS[spec.id];
      if (hd7 && Math.abs(c0.position[0] - hd7[0]) < 0.06 && Math.abs(c0.position[2] - hd7[1]) < 0.06 && JSON.stringify(H3.hd3Scene(p, spec.id, "street", { vehicles: [] })) === JSON.stringify(c0)) unchanged++;
      const o0 = [...new Set([...occludes(vehicles, c0.position[0], c0.position[2], subj), ...occludes(vehicles, c0.position[0], c0.position[2], [board, [board[0] + 0.01, board[1]]])])];
      const o1 = [...new Set([...occludes(vehicles, c1.position[0], c1.position[2], subj), ...occludes(vehicles, c1.position[0], c1.position[2], [board, [board[0] + 0.01, board[1]]])])];
      const inside = H3.hd3VehicleHit(vehicles, c1.position[0], c1.position[2], 0);
      n++; if (o0.length) before++; if (o1.length || inside) after++;
      if (c1.position.some((v, k) => Math.abs(v - c0.position[k]) > 1e-6)) moved.push(`${spec.id} ${c0.position[0].toFixed(1)}, ${c0.position[2].toFixed(1)} -> ${c1.position[0].toFixed(1)}, ${c1.position[2].toFixed(1)} (was hidden by: ${o0.join(", ") || "none"})`);
      if (spec.id === "mission-school-campus" && tier === "high") check(o0.length > 0 && o1.length === 0, `mission-school-campus: the parked vehicles hid part of the school from ENV-HD-7's camera (${o0.join(", ")}); with the app's placements passed, none do`);
    }
    check(after === 0, `${tier}: street cameras with no parked vehicle hiding the building or its board, with the placements fixture: ${n - after} of ${n} (without the vehicles: ${n - before} of ${n}); camera inside a vehicle 0`);
    check(unchanged === n, `${tier}: with no vehicles passed (or an empty list), the seven street cameras are ENV-HD-7's (${unchanged} of ${n})`);
    note(`${tier}: street cameras clear of parked vehicles (building and board unhidden): ${n - before} of ${n} -> ${n - after} of ${n}`);
    if (tier === "high") note(`street cameras moved by the parked vehicles: ${moved.join("; ") || "none"}`);
  }
  const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
  check(/hd3Scene\(parish, siteId, shot, \{ vehicles: \(mvPark\?\.parked \?\? \[\]\)\.filter\(\(v\) => !v\.hidden\) \}\)/.test(app), "the parishes app passes the vehicles MOTORWORKS parked (shown ones) to the street solver");
}
note(`cue triangles per preset (balanced / high): ${perSite.map((r) => `${r.kind} ${r.balanced} / ${r.high}`).join(", ")} (budget ${B.trianglesPerSite.balanced} / ${B.trianglesPerSite.high})`);
note(`sites cued by kind (ENV-HD-6: 1 each of four): ${K.HD6_CUED_KINDS.map((k) => `${k} ${tally[k].cued} of ${tally[k].sites}`).join(", ")}`);

// 1b, 3, 4. the built mesh per map and tier, the chunk budgets, the lamps
const maps = [...new Set(specs.map((s) => s.parish))];
let signMaps = 0;
for (const id of ALL) {
  const full = maps.includes(id); // the three preset maps get every line; the other 43 are summarised per check

  const p = R.npParish(id), boards = boardsOf(p), sites = K.hd6KindSites(p);
  for (const tier of TIERS) {
    const m = K.hd6Build({ THREE, parish: p, boards, tier, ua: "Mozilla/5.0 (X11; Linux x86_64) Chrome/126.0" });
    if (tier === "low") { check(m === null, `${id}/low: the phone tier builds nothing here`); continue; }
    if (!m && !sites.length && !boards.length) continue;
    if (!check(!!m && m.isMesh && !m.isInstancedMesh, `${id}/${tier}: one merged mesh`)) continue;
    const tris = m.geometry.attributes.position.count / 3, model = m.userData.hd6.triangles;
    check(tris === model, `${id}/${tier}: triangles measured ${tris} = model ${model}`);
    const lampTris = boards.length * 4 * 12;
    check(lampTris / boards.length <= B.lampTriangles[tier], `${id}/${tier}: ${boards.length} board lamps, ${lampTris / boards.length} triangles each <= ${B.lampTriangles[tier]}`);
    const mats = [].concat(m.material);
    check(mats.every((x) => !x.map && x.vertexColors), `${id}/${tier}: vertex colours, no texture (${mats.length} material${mats.length > 1 ? "s" : ""})`);
    // 3b. the H sign at night: the sign's parts are group 1, drawn by an unlit material; nothing else is
    const signs = sites.filter((s) => s.kind === "hospital").length, glow = m.userData.hd6.signTriangles;
    if (signs) {
      const hasSign = fitted.get(id).some((r) => r.site.kind === "hospital" && r[tier].parts.some((q) => q.glow));
      check(!hasSign || (mats.length === 2 && mats[1].isMeshBasicMaterial && m.geometry.groups.length === 2 && m.geometry.groups[1].count === glow * 3 && glow > 0), `${id}/${tier}: the H signs (${glow} triangles) are drawn unlit as group 1, the rest Lambert as group 0`);
      if (hasSign && tier === "high") signMaps++;
    } else check(mats.length === 1 && glow === 0, `${id}/${tier}: no hospital, one material`);
    check(m.userData.hd6.drawCalls === mats.length && m.userData.hd6.drawCalls <= 2, `${id}/${tier}: ${m.userData.hd6.drawCalls} draw call(s) for the cue mesh (lit + sign), 0 lights`);
    check(K.hd6Build({ THREE, parish: p, boards, tier, ua: QUEST }) === null, `${id}/${tier}: a headset browser builds nothing here`);
    // the chunk budgets: the cue mesh is charged to each cued site's chunks (building, cue footprint), on top of FACADES there
    // ENV-HD-7: a chunk may hold parts of several sites' cues: each site's whole cue is charged to every chunk it touches,
    // summed over the sites touching it, plus the lamps there
    const perChunk = new Map();
    for (const { site, [tier]: fit } of fitted.get(id)) {
      const keys = new Set();
      for (const q of fit.parts) { const f = footprint(q); for (const [x, z] of [[f[0], f[1]], [f[2], f[3]], [f[0], f[3]], [f[2], f[1]]]) keys.add(E.npChunkOf(x, z).key); }
      for (const key of keys) { const c = perChunk.get(key) ?? { tris: 0, ids: [] }; c.tris += fit.parts.length * 12; c.ids.push(site.id); perChunk.set(key, c); }
    }
    let worst = null, bad = 0;
    for (const [key, c] of perChunk) {
      const [cx, cz] = key.split(",").map(Number);
      const spots = E.npMassingForChunk(p, cx, cz).filter(CW.cwMassFilter(p));
      const det = spots.length ? F.fcDetails({ THREE, parish: p, chunk: { cx, cz, key, ring: 0, lod: 0 }, spots, tier }) : null;
      const dm = det?.userData.fc.meshes ?? 0, dt = det?.userData.fc.triangles ?? 0;
      const lamps = boards.filter((bd) => E.npChunkOf(bd.x, bd.z).key === key).length * 48, ct = c.tris + lamps;
      const ok = dm + 1 <= F.FC_BUDGET.meshesPerChunk[tier] && dt + ct <= F.FC_BUDGET.trianglesPerChunk[tier];
      if (!ok) bad++;
      if (!worst || dt + ct > worst.t) worst = { key, t: dt + ct, dm, ids: c.ids };
      if (full) check(ok, `${id}/${tier}: chunk ${key} (${c.ids.length} site${c.ids.length > 1 ? "s" : ""}) FACADES ${dm} + cue 1 meshes <= ${F.FC_BUDGET.meshesPerChunk[tier]}, ${dt} + ${ct} triangles <= ${F.FC_BUDGET.trianglesPerChunk[tier]}`);
      det?.dispose?.();
    }
    if (!full) check(bad === 0, `${id}/${tier}: ${perChunk.size} cued chunks inside FC_BUDGET (worst ${worst ? `${worst.key}: ${worst.t} triangles, ${worst.dm} + 1 meshes` : "none"})`);
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
  if (full || lit !== boards.length) check(lit === boards.length, `${id}: every board lamp has a post from the ground, an arm and a housing over its lit face (${lit} of ${boards.length}); night lamp bars floating: ${boards.length - lit}`);
}
check(signMaps > 0, `the H sign at night: lit on ${signMaps} maps with a hospital (0 lights, 0 texture bytes; ENV-HD-6: by the street lamps only)`);
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
    const u = m.userData.hd6, sites = K.hd6HeroSites(p).length;
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
