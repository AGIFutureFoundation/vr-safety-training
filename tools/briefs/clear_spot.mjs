// Where can a crew figure actually stand in this station?
//
// check_layout's crew rule rejects a figure whose horizontal distance to any
// mesh centre between y=0.3 and y=2.0 is under 0.45m (1.05m in a trades bay).
// Guessing at that costs a round trip per guess, so this asks the built scene
// directly, using the checker's own band and threshold.
//
//     node clear_spot.mjs <station-id> [nearX] [nearZ]
import { loadSmartCity, loadTrades } from "/home/user/vr-safety-training/tools/lib/headless.mjs";

const id = process.argv[2];
const nearX = Number(process.argv[3] ?? 0), nearZ = Number(process.argv[4] ?? 0);
const city = await loadSmartCity(), trades = await loadTrades();
let suite = city, room = city.ROOMS.find((r) => r.id === id);
if (!room) { suite = trades; room = trades.ROOMS.find((r) => r.id === id); }
if (!room) { console.log(`no such station: ${id}`); process.exit(1); }
const CLEAR = suite === trades ? 1.05 : 0.45;

// Same transform check_layout uses: scale, then rotate z/y/x, then translate.
const wp = (o) => {
  let x = 0, y = 0, z = 0;
  for (let n = o; n; n = n.parent) {
    const sc = n.scale; if (sc) { x *= sc.x ?? 1; y *= sc.y ?? 1; z *= sc.z ?? 1; }
    const r = n.rotation;
    if (r) {
      if (r.z) { const c = Math.cos(r.z), s = Math.sin(r.z); [x, y] = [x * c - y * s, x * s + y * c]; }
      if (r.y) { const c = Math.cos(r.y), s = Math.sin(r.y); [x, z] = [x * c + z * s, -x * s + z * c]; }
      if (r.x) { const c = Math.cos(r.x), s = Math.sin(r.x); [y, z] = [y * c - z * s, y * s + z * c]; }
    }
    x += n.position?.x ?? 0; y += n.position?.y ?? 0; z += n.position?.z ?? 0;
  }
  return { x, y, z };
};

const root = new suite.THREE.Group();
room.build(root);
const crewRoots = new Set();
(function findCrew(n) { if (n.userData?.crew) { crewRoots.add(n); return; } for (const c of n.children ?? []) findCrew(c); })(root);
const solid = [];
(function collect(n) {
  if (crewRoots.has(n)) return;
  if (n.isMesh) { const p = wp(n); if (p.y > 0.3 && p.y < 2.0 && Math.hypot(p.x, p.z) > 0.15) solid.push(p); }
  for (const c of n.children ?? []) collect(c);
}(root));

const margin = CLEAR + 0.17;   // a little over the threshold, so it is not marginal
const hits = [];
for (let x = -2.8; x <= 2.8; x += 0.05) for (let z = -2.8; z <= 2.8; z += 0.05) {
  if (Math.hypot(x, z) > 2.8) continue;
  let d = Infinity;
  for (const p of solid) { const t = Math.hypot(p.x - x, p.z - z); if (t < d) d = t; }
  if (d < margin) continue;
  hits.push({ x: +x.toFixed(2), z: +z.toFixed(2), clear: +d.toFixed(2), near: Math.hypot(x - nearX, z - nearZ) });
}
hits.sort((a, b) => a.near - b.near);
console.log(`${room.id}: ${solid.length} solid meshes, crew clearance ${CLEAR}m, ${hits.length} spots with >= ${margin.toFixed(2)}m`);
for (const s of hits.slice(0, 6)) console.log(`  (${s.x}, ${s.z})  clear ${s.clear}m  ${s.near.toFixed(2)}m from the spot you asked for`);
