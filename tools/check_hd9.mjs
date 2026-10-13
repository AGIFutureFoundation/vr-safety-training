#!/usr/bin/env node
/**
 * ENV-HD-9 (docs/consoles/ENV-HD-9.md): the port control room's window is a real opening in INTERIORS' shell. Headless:
 *   1. the opening (IX_OPENINGS, room.openings) is the geometry posted for ROBOTS-HD-4: north wall, x -6.5..6.5, y 1.0..3.0,
 *      through z -6.0..-6.3, the same span as ROBO-INTERIORS' picture plane and its nine mullions;
 *   2. the hole is real on every tier: a ray from inside the room through every sample point of the opening meets no shell wall,
 *      while rays at the sill, the lintel and the piers do; the four wall colliders stand and the walk clamp still holds;
 *   3. the combined room — the shell with ROBO-INTERIORS', ROBOTS-HD's, ENV-HD-4's and ENV-HD-2's dressers — stays inside
 *      IX_BUDGET on every tier (the seam this change meets), and nothing the learner can see through the hole is the void:
 *      every ray through the opening meets something (today the yard picture; later the yard ROBOTS-HD-4 builds beyond);
 *   4. no other style's shell changed (one solid wall mesh per side, no openings), and the wall material stays shared so the
 *      skins retexture every piece.
 *     node tools/check_hd9.mjs
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
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const RHD = await imp("shared/rhd-robots-hd.js");
const H4 = await imp("shared/hd4-rooms.js");
const HD2 = await imp("shared/hd2-room-skins.js");
const RB = await imp("shared/rb-robotics-data.js");
const TIERS = ["low", "balanced", "high"];
const PORT = "ixr-port-control";
const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const tris = (group) => { let n = 0; group.traverse((o) => { if (o.isMesh) { const g = o.geometry, k = g.index ? g.index.count / 3 : g.attributes.position.count / 3; n += k * (o.isInstancedMesh ? o.count : 1); } }); return n; };
const meshesOf = (group, test) => { const out = []; group.traverse((o) => { if (o.isMesh && test(o)) out.push(o); }); return out; };
// A fresh dresser registry with every room dresser that touches the port room (the combined case).
const reg = () => { const d = {}; const r = { ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn), IX_STYLES: IX.IX_STYLES, IX_FEATURES: IX.IX_FEATURES, d }; return r; };
const dressed = (ua = DESK) => { const r = reg(); IXR.ixrRegisterDressers(r); RHD.rhdRegisterDressers(r, { ua }); H4.hd4RegisterDressers(r, { ultra: false, ua }); HD2.hd2RegisterSkins(r); return r.d; };
const rbSite = RB.RB_SITES.find((x) => IXR.IXR_SITE_STYLE[x.id] === PORT) ?? null;
const build = (tier, dressers = undefined) => IX.ixBuild(PORT, { three: THREE, tier, site: IXR.ixrSiteFor(rbSite, null), ...(dressers ? { dressers } : {}) });

// ------------------------------------------------------------------------------------------------- 1. the posted geometry
console.log("1. the opening's geometry (what ROBOTS-HD-4 was given)");
const spec = IX.IX_OPENINGS[PORT];
check(Array.isArray(spec) && spec.length === 1 && spec[0].wall === 0 && spec[0].x0 === -6.5 && spec[0].x1 === 6.5 && spec[0].y0 === 1.0 && spec[0].y1 === 3.0,
  `IX_OPENINGS["${PORT}"] is one opening in the north wall, x -6.5..6.5, y 1.0..3.0 (${JSON.stringify(spec)})`);
const r0 = build("high");
const op = r0.openings?.[0];
check(!!op && op.side === "n" && op.w === 13 && op.h === 2 && op.zIn === -6.0 && op.zOut === -6.3, `room.openings reports it: side n, 13 x 2 m, inner face z -6.0, outer face z -6.3 (${JSON.stringify(op)})`);
// The picture plane and the mullions in front of it share the span (ROBOTS-HD-3's measured positions).
check(r0.d === 12 && r0.w === 16 && r0.h === 3.8, `the port room is 16 x 12 x 3.8 m, so the north wall's inner face is z -6 (${r0.w} x ${r0.d} x ${r0.h})`);

// -------------------------------------------------------------------------------------------- 2. the hole on every tier
console.log("2. a real hole on every tier: rays through the opening meet no shell wall, rays beside it do");
const ray = new THREE.Raycaster();
const hits = (group, x, y, test) => { ray.set(new THREE.Vector3(x, y, -3), new THREE.Vector3(0, 0, -1)); ray.far = 10; return ray.intersectObjects(meshesOf(group, test), false); };
const isWall = (o) => /^ix-wall-/.test(o.name);
const samples = []; for (let x = -6.4; x <= 6.4; x += 0.8) for (let y = 1.05; y <= 2.95; y += 0.475) samples.push([+x.toFixed(2), +y.toFixed(3)]);
const beside = [[0, 0.5], [0, 3.4], [-7.4, 2.0], [7.4, 2.0], [-6.6, 2.0], [6.6, 2.0], [0, 0.95], [0, 3.05]];
for (const tier of TIERS) {
  const r = build(tier); r.group.updateMatrixWorld(true);
  const through = samples.filter(([x, y]) => hits(r.group, x, y, isWall).length === 0).length;
  const blocked = beside.filter(([x, y]) => hits(r.group, x, y, isWall).length > 0).length;
  check(through === samples.length, `${tier}: ${through} of ${samples.length} rays through the opening meet no shell wall`);
  check(blocked === beside.length, `${tier}: ${blocked} of ${beside.length} rays at the sill, lintel and piers meet the wall`);
  const wallMeshes = meshesOf(r.group, isWall);
  check(wallMeshes.length === 7 && wallMeshes.every((m) => m.material === wallMeshes[0].material), `${tier}: the shell has 7 wall meshes (3 solid, the north wall as sill, lintel and two piers) on one shared material`);
  check(r.colliders.filter((c) => c.kind === "ix-wall").length === 4, `${tier}: four wall colliders, the north wall's whole`);
  // The walk: from the console desks straight at the window, the pose never passes the shell's inner clamp.
  let pose = { x: 0, z: -3, yaw: 0, pitch: 0 };
  for (let i = 0; i < 90; i++) pose = IX.ixWalk(r, pose, { vx: 0, vz: -1 }, 1 / 30);
  check(pose.z >= -r.d / 2 + 0.4 - 1e-6, `${tier}: a walk at the window stops at the clamp (z ${pose.z.toFixed(2)} >= ${(-r.d / 2 + 0.4).toFixed(2)})`);
  note(`${tier}: shell ${r.shellMeshes} meshes, ${tris(r.group)} triangles bare`);
}

// ------------------------------------------------------------------- 3. the combined room, and no void through the hole
console.log("3. the combined room (shell + ROBO-INTERIORS + ROBOTS-HD + ENV-HD-4 + skins) inside IX_BUDGET, nothing void through the hole");
for (const tier of TIERS) {
  const r = build(tier, dressed()); r.group.updateMatrixWorld(true);
  const lt = tier === "low" ? "low" : "high";
  const m = r.meshes(), t = tris(r.group);
  check(m <= IX.IX_BUDGET.meshes && t <= IX.IX_BUDGET.triangles[lt], `${tier}: the dressed port room ${m} meshes <= ${IX.IX_BUDGET.meshes}, ${t} triangles <= ${IX.IX_BUDGET.triangles[lt]}`);
  const anyMesh = (o) => o.isMesh && !/^ix-wall-/.test(o.name) && !/^ix-(floor|ceiling|trim)$/.test(o.name);
  const covered = samples.filter(([x, y]) => hits(r.group, x, y, anyMesh).some((h) => h.object.name !== "ix-trim")).length;
  check(covered === samples.length, `${tier}: ${covered} of ${samples.length} rays through the opening meet something beyond the room's air (the yard picture or the yard), none the void`);
  const win = r.group.getObjectByName("ixr-window-wall");
  check(!!win, `${tier}: ROBO-INTERIORS' window picture is still in the room (${win ? `z ${win.position.z.toFixed(2)}` : "missing"})`);
}
// ROBOTS-HD-3's carrier (a relief in the pane) still fits with the cut wall: its stated budget is ROBOTS-HD's; here only the room total.
{ const r = build("high", dressed()); const rhd = meshesOf(r.group, (o) => /^rhd-/.test(o.name)); note(`high: ${rhd.length} ROBOTS-HD meshes in the dressed port room, room total ${r.meshes()} meshes / ${tris(r.group)} triangles`); }

// ---------------------------------------------------------------------------------------------- 4. no other shell changed
console.log("4. every other style's shell unchanged");
let plain = 0, styles = 0;
for (const st of Object.keys(IX.IX_STYLES)) {
  if (st === PORT) continue; styles++;
  const r = IX.ixBuild(st, { three: THREE, tier: "high" });
  const walls = meshesOf(r.group, isWall);
  if (walls.length === 4 && walls.every((w, i) => w.name === `ix-wall-${i}`) && r.openings.length === 0) plain++;
}
check(plain === styles, `${plain} of ${styles} other styles keep four solid walls and no opening`);
check(Object.keys(IX.IX_OPENINGS).length === 1, "IX_OPENINGS names the port control room only");
const src = readFileSync(join(WEBXR, "shared/ix-interiors.js"), "utf8");
check(/openings,/.test(src) && /room\.openings|openings: \[\.\.\.\]/.test(src) && /IX_OPENINGS/.test(src), "ix-interiors exports IX_OPENINGS and the room reports openings");
check(!/import\s*\{[^}]*\bas\b/.test(src), "no import aliases in the shell module");

console.log(`${failures ? "FAIL" : "PASS"} check_hd9: ${passes} passed, ${failures} failed (${((performance.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(failures ? 1 : 0);
