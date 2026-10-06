// Where should a learner arrive? The clearest standing spot near the back
// wall, facing into the room. Prints a candidate spawn per room.
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
  // Everything a standing person would walk into.
  const solid = [];
  for (const child of root.children ?? []) {
    const p = worldPos(child);
    if (Math.hypot(p.x, p.z) < 0.15) continue;
    let blocks = false;
    child.traverse?.((o) => { if (o.isMesh) { const y = worldPos(o).y; if (y > 0.35 && y < 1.95) blocks = true; } });
    if (blocks) solid.push(p);
  }
  const hw = r.size.w / 2 - 1.1, hd = r.size.d / 2 - 1.1;
  let best = null;
  for (let x = -hw; x <= hw; x += 0.2) {
    for (let z = hd - 2.2; z <= hd; z += 0.2) {
      let clear = Infinity;
      for (const p of solid) clear = Math.min(clear, Math.hypot(p.x - x, p.z - z));
      // Prefer clear, then close to the back wall, then near the middle.
      const score = Math.min(clear, 3.2) * 10 + z - Math.abs(x) * 0.35;
      if (!best || score > best.score) best = { x, z, clear, score };
    }
  }
  const dx = -best.x, dz = -best.z;
  const ry = +(Math.atan2(dx, dz) - Math.PI).toFixed(2);
  console.log(`${r.id.padEnd(17)} spawn: { x: ${best.x.toFixed(1)}, z: ${best.z.toFixed(1)}, ry: ${ry} },  clear ${best.clear.toFixed(1)}m`);
}
