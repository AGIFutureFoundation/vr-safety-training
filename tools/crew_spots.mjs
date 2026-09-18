// Where can a person actually stand in each bay? Prints the clearest spots,
// so crew are placed against the room rather than guessed into a bench.
import { loadTrades } from "./lib/headless.mjs";
const trades = await loadTrades();
function worldPos(obj) {
  let x = 0, y = 0, z = 0;
  for (let n = obj; n; n = n.parent) {
    const ry = n.rotation?.y ?? 0;
    if (ry) { const c = Math.cos(ry), s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; }
    x += n.position?.x ?? 0; y += n.position?.y ?? 0; z += n.position?.z ?? 0;
  }
  return { x, y, z };
}
for (const r of trades.ROOMS) {
  const root = new trades.THREE.Group();
  r.build(root);
  const crewRoots = new Set((root.children ?? []).filter((c) => c.userData?.crew));
  const solid = [];
  const collect = (n) => {
    if (crewRoots.has(n)) return;
    if (n.isMesh) { const p = worldPos(n); if (p.y > 0.3 && p.y < 2.0 && Math.hypot(p.x, p.z) > 0.15) solid.push(p); }
    for (const c of n.children ?? []) collect(c);
  };
  collect(root);
  const hw = r.size.w / 2 - 1.2, hd = r.size.d / 2 - 1.2;
  const spots = [];
  for (let x = -hw; x <= hw; x += 0.4) {
    for (let z = -hd; z <= hd; z += 0.4) {
      // Not on the spawn, not in the middle where the learner works.
      if (Math.hypot(x - r.spawn.x, z - r.spawn.z) < 2.0) continue;
      let clear = Infinity;
      for (const p of solid) clear = Math.min(clear, Math.hypot(p.x - x, p.z - z));
      if (clear < 1.15 || clear > 4) continue;   // near the work, not marooned
      spots.push({ x, z, clear });
    }
  }
  // Prefer spots that are clear but close to something — beside the bench,
  // not in the middle of the floor.
  spots.sort((a, b) => a.clear - b.clear);
  const picked = [];
  for (const s of spots) {
    if (picked.some((p) => Math.hypot(p.x - s.x, p.z - s.z) < 3.2)) continue;
    picked.push(s);
    if (picked.length === 3) break;
  }
  const fmt = picked.map((p) => `{ x: ${p.x.toFixed(1)}, z: ${p.z.toFixed(1)}, ry: ${(Math.atan2(-p.x, -p.z)).toFixed(2)} } clear ${p.clear.toFixed(1)}`).join("  |  ");
  console.log(`${r.id.padEnd(17)} ${fmt}`);
}
