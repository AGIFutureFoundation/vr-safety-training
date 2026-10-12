// Scratch probe (console PROJECTLANDS): is a candidate site position dry, flat, clear of levees, roads, hills and other pads?
//   node tools/pj_probe.mjs <map-id> x,z [x,z ...]      (a map id, or a module path under WebXR/shared for a new map)
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const E = await import(pathToFileURL(join(ROOT, "WebXR/shared/np-parish.js")).href);
const R = await import(pathToFileURL(join(ROOT, "WebXR/shared/np-parishes.js")).href);
const [id, ...pts] = process.argv.slice(2);
let p = R.npParish(id);
if (!p) { const m = await import(pathToFileURL(join(ROOT, "WebXR/shared", id)).href); p = Object.values(m).find((v) => v && v.id); }
for (const s of pts) {
  const [x, z] = s.split(",").map(Number);
  const w = E.npWaterAt(p, x, z), lv = E.npLeveeRise(p, x, z), hill = E.npHillAt(p, x, z);
  const flat = Math.abs(E.npHeightAt(p, x + 20, z) - E.npHeightAt(p, x, z));
  const near = E.npNearestRoad(p, x, z);
  const site = p.sites.map((o) => [o.id, Math.round(Math.hypot(o.position[0] - x, o.position[1] - z))]).sort((a, b) => a[1] - b[1])[0];
  const ribbons = (p.water ?? []).filter((v) => v.width).map((v) => v.id);
  const ok = (!w || w.kind === "wetland") && flat < 0.6 && lv === 0 && site[1] > 60;
  console.log(`${ok ? "OK " : "BAD"} [${x},${z}] water=${w?.id ?? "-"} levee=${lv.toFixed(2)} hill=${hill?.name ?? "-"} flat=${flat.toFixed(2)} road=${near.road?.id}@${Math.round(near.d)} site=${site[0]}@${site[1]}`);
}
