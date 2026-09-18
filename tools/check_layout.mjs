/**
 * Layout audit: is every control the procedure asks for actually reachable,
 * and is anything in the scene somewhere impossible?
 *
 * The content checkers prove a step's target exists and the run scores. They
 * say nothing about where the thing *is* — a control can exist, register, and
 * still sit outside the circle the learner is allowed to walk in, under the
 * floor, or on top of the spawn point. Those only show up when someone loads
 * the station and tries to reach it.
 *
 * This builds every station and room against the headless harness, resolves a
 * real world position for each interactable through the group transforms, and
 * fails on anything a learner could not get to.
 *
 *     node tools/check_layout.mjs
 */
import { loadSmartCity, loadTrades } from "./lib/headless.mjs";

// SmartCiti.X clamps the learner to a circle; Trade Skills walks a room. Both
// numbers come from the apps and must stay in step with them.
const CITY_ROAM = (footprint) => (footprint ?? 2) + 2.4;
const REACH = 1.6;        // how far a learner can reach past where they stand
// A valve vault, a trench, an elevator pit and a wet well all legitimately put
// work below deck level. Past this is not a deep space, it is a mistake.
const FLOOR_SLACK = -2.4;

const city = await loadSmartCity();
const trades = await loadTrades();

// The stub's getWorldPosition only reports local position. Groups in this
// codebase translate and rotate about y, so accumulate that up the parents.
function worldPos(obj) {
  let x = 0, y = 0, z = 0;
  for (let n = obj; n; n = n.parent) {
    const ry = n.rotation?.y ?? 0;
    if (ry) {
      const c = Math.cos(ry), s = Math.sin(ry);
      [x, z] = [x * c + z * s, -x * s + z * c];
    }
    x += n.position?.x ?? 0; y += n.position?.y ?? 0; z += n.position?.z ?? 0;
  }
  return { x, y, z };
}

let failures = 0;
const note = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };
const rows = [];

function audit(app, r, reachFrom) {
  const root = new (app === "trades" ? trades : city).THREE.Group();
  let api;
  try { api = r.build(root); } catch (e) { note(`${app}/${r.id}`, `build threw — ${e.message}`); return; }
  const hits = api?.hits ?? {};
  // Every id a step or a hazard actually names. Scenery is not audited.
  const named = new Set();
  for (const s of r.steps ?? []) {
    if (s.target) named.add(s.target);
    for (const t of s.targets ?? []) named.add(t);
    if (s.drag?.to) named.add(s.drag.to);
  }
  for (const h of Object.keys(r.hazards ?? {})) named.add(h);

  let far = 0;
  for (const id of named) {
    const obj = hits[id];
    if (!obj) continue; // the content checkers own missing ids
    const p = worldPos(obj);
    const d = Math.hypot(p.x, p.z);
    if (p.y < FLOOR_SLACK) note(`${app}/${r.id}`, `"${id}" sits at y=${p.y.toFixed(2)}, below anywhere a learner can reach`);
    if (d > reachFrom + REACH) {
      note(`${app}/${r.id}`, `"${id}" is ${d.toFixed(1)}m out, past the ${reachFrom.toFixed(1)}m the learner may walk (+${REACH}m reach)`);
    }
    far = Math.max(far, d);
  }
  // Sweep the whole scene for coordinates no hand would type. A dropped
  // argument slides a colour into a position slot (0xb9bec4 reads as
  // 12,172,996 metres), which renders nothing and moves the object out of the
  // world. Nothing else in these scenes is past 60m.
  const WILD = 60;
  root.traverse?.((o) => {
    const p = worldPos(o);
    for (const [axis, v] of [["x", p.x], ["y", p.y], ["z", p.z]]) {
      if (!Number.isFinite(v)) note(`${app}/${r.id}`, `an object has a non-finite ${axis}`);
      else if (Math.abs(v) > WILD) {
        note(`${app}/${r.id}`, `an object sits at ${axis}=${Math.round(v)} — looks like a colour in a position argument`);
      }
    }
  });
  rows.push({ app, id: r.id, named: named.size, far: Math.round(far * 10) / 10, roam: reachFrom });
}

for (const r of city.ROOMS) audit("smartcity", r, CITY_ROAM(r.footprint));
for (const r of trades.ROOMS) {
  // A room's walkable area is its shell; take the larger half-span as the
  // distance a learner can stand from the middle of it.
  audit("trades", r, (r.roam ?? 4.6));
}

rows.sort((a, b) => (b.far - b.roam) - (a.far - a.roam));
const tight = rows.slice(0, 3).map((r) => `${r.id} ${r.far}m/${r.roam.toFixed(1)}m`).join(", ");
console.log(failures
  ? `\n${failures} layout problem(s) found.`
  : `\nAll ${rows.length} stations reachable. Tightest: ${tight}.`);
process.exit(failures ? 1 : 0);
