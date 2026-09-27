/**
 * Bay World (shared/bayworld.js), checked.
 *
 * Bay World is a large stylised open world shared by two teams working in
 * parallel: BAY2 (a free-roam driving-and-exploration game) plays it, BAY3
 * (a quest/objective layer) writes quests against the same sites and
 * landmarks (see shared/bayworld-data.js's own header). This holds the data
 * and the pure zone/height/road functions both depend on, deterministically,
 * with no renderer:
 *
 *   - the zones (at least sixteen since the expansion) tile the whole of
 *     BAY_BOUNDS (every sampled point gets a real zone back, and every zone
 *     is reachable — nothing is walled off by the nearest-centre assignment);
 *   - every landmark's position is nearer its own zone's centre than any
 *     other zone's (bayZoneAt() reads back that zone), and likewise for
 *     every training site;
 *   - every programme id in smartcity/js/curricula.js's CURRICULA is
 *     anchored by at least one BAY_SITES entry's own `programmes`;
 *   - BAY_ROADS forms one connected network (every road shares an exact
 *     endpoint with another, directly or transitively);
 *   - bayHeight() stays inside BAY_HEIGHT_RANGE everywhere sampled, and never
 *     jumps (continuity, sampled rather than proved); the hills read higher
 *     than downtown and the port, the upper hills higher than the hills, and
 *     the island, both shorelines and the outer bay read flat;
 *   - bayRoadAt() reads back onRoad on a road's own centreline and null well
 *     off every road;
 *   - buildBayWorld() builds headlessly at both detail levels, at every
 *     named zone, and at every hour, without throwing, and stays inside
 *     BAY_MESH_BUDGET's authored count for each detail level.
 *
 *     node tools/check_bayworld.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSuite, WEBXR } from "./lib/headless.mjs";

const MODULES = [
  "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/props.js",
  "smartcity/js/citykit.js", "shared/bayworld-data.js", "shared/bayworld.js",
];
const HARNESS = `export {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, BAY_MESH_BUDGET, BAY_HEIGHT_RANGE,
  bayHeight, bayZoneAt, bayRoadAt, buildBayWorld, THREE,
};`;
const S = await buildSuite(MODULES, HARNESS, "bayworld");

let failures = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };

const {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, BAY_MESH_BUDGET, BAY_HEIGHT_RANGE,
  bayHeight, bayZoneAt, bayRoadAt, buildBayWorld, THREE,
} = S;

const inBounds = (x, z) => x >= BAY_BOUNDS.minX && x <= BAY_BOUNDS.maxX && z >= BAY_BOUNDS.minZ && z <= BAY_BOUNDS.maxZ;
const ZONE_IDS = new Set(BAY_ZONES.map((z) => z.id));

// -------------------------------------------------------------------- zones
if (BAY_ZONES.length < 16) fail("zones", `BAY_ZONES has ${BAY_ZONES.length} zones, expected at least 16`);
for (const zone of BAY_ZONES) {
  const id = `zone ${zone.id}`;
  if (!inBounds(zone.centre[0], zone.centre[1])) fail(id, "centre is outside BAY_BOUNDS");
  if (!(zone.radius > 0)) fail(id, "radius must be positive");
  for (const k of ["accent", "ground", "structure", "trim"]) {
    if (typeof zone.palette?.[k] !== "number") fail(id, `palette.${k} is not a colour number`);
  }
}
// Zones cover BAY_BOUNDS: every sampled point, including every corner and
// the field's own centre, resolves to a real zone id — bayZoneAt() assigns
// by nearest centre, so this can never come up empty, but a broken
// implementation (e.g. an empty BAY_ZONES, or a stray NaN centre) would fail
// it, which is the point.
{
  let uncovered = 0;
  const seen = new Set();
  const corners = [[BAY_BOUNDS.minX, BAY_BOUNDS.minZ], [BAY_BOUNDS.maxX, BAY_BOUNDS.minZ], [BAY_BOUNDS.minX, BAY_BOUNDS.maxZ], [BAY_BOUNDS.maxX, BAY_BOUNDS.maxZ], [0, 0]];
  for (const [x, z] of corners) { const zone = bayZoneAt(x, z); if (!zone || !ZONE_IDS.has(zone.id)) uncovered += 1; }
  for (let x = BAY_BOUNDS.minX; x <= BAY_BOUNDS.maxX; x += 47) {
    for (let z = BAY_BOUNDS.minZ; z <= BAY_BOUNDS.maxZ; z += 53) {
      const zone = bayZoneAt(x, z);
      if (!zone || !ZONE_IDS.has(zone.id)) uncovered += 1;
      else seen.add(zone.id);
    }
  }
  if (uncovered) fail("zones", `${uncovered} sampled point(s) inside BAY_BOUNDS resolved to no real zone`);
  const unreached = BAY_ZONES.filter((z) => !seen.has(z.id));
  if (unreached.length) fail("zones", `${unreached.map((z) => z.id).join(", ")} covered no sampled point at all — check its centre against its neighbours`);
}

// --------------------------------------------------------------- landmarks
if (BAY_LANDMARKS.length < 28) fail("landmarks", `BAY_LANDMARKS has ${BAY_LANDMARKS.length}, expected at least 28`);
const NO_HISTORY = /\b(19|20)\d{2}\b|\bfeet\b|\bmiles?\b|\bmeters?\b|\bmetres?\b|\btons?\b/i;
for (const l of BAY_LANDMARKS) {
  const id = `landmark ${l.id}`;
  if (!ZONE_IDS.has(l.zone)) fail(id, `names an unknown zone "${l.zone}"`);
  if (!inBounds(l.position[0], l.position[1])) fail(id, "position is outside BAY_BOUNDS");
  const found = bayZoneAt(l.position[0], l.position[1]);
  if (found?.id !== l.zone) fail(id, `sits nearer "${found?.id}" than its own declared zone "${l.zone}"`);
  if (!l.name || typeof l.name !== "string") fail(id, "has no public name");
  if (!l.blurb || typeof l.blurb !== "string") fail(id, "has no one-line description");
  if (NO_HISTORY.test(l.blurb)) fail(id, `blurb "${l.blurb}" states a date, dimension or count`);
}
{
  const dupes = BAY_LANDMARKS.map((l) => l.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (dupes.length) fail("landmarks", `duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
}

// -------------------------------------------------------------------- sites
if (BAY_SITES.length < 50) fail("sites", `BAY_SITES has ${BAY_SITES.length}, expected at least 50`);
for (const s of BAY_SITES) {
  const id = `site ${s.id}`;
  if (!ZONE_IDS.has(s.zone)) fail(id, `names an unknown zone "${s.zone}"`);
  if (!inBounds(s.position[0], s.position[1])) fail(id, "position is outside BAY_BOUNDS");
  const found = bayZoneAt(s.position[0], s.position[1]);
  if (found?.id !== s.zone) fail(id, `sits nearer "${found?.id}" than its own declared zone "${s.zone}"`);
  if (!Array.isArray(s.programmes)) fail(id, "programmes must be an array");
  if (!Array.isArray(s.stations)) fail(id, "stations must be an array");
}
{
  const dupes = BAY_SITES.map((s) => s.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (dupes.length) fail("sites", `duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
}

// Every curriculum programme is anchored somewhere.
{
  const curriculaSrc = readFileSync(join(WEBXR, "smartcity/js/curricula.js"), "utf8");
  const programmeIds = [...curriculaSrc.matchAll(/^ {4}id: "([a-z0-9-]+)",/gm)].map((m) => m[1]);
  if (programmeIds.length < 10) fail("programmes", "found suspiciously few programme ids in curricula.js — did its shape change?");
  const anchored = new Set(BAY_SITES.flatMap((s) => s.programmes));
  const missing = programmeIds.filter((p) => !anchored.has(p));
  if (missing.length) fail("programmes", `${missing.length} programme(s) anchored nowhere in BAY_SITES: ${missing.join(", ")}`);
}

// -------------------------------------------------------------------- roads
for (const road of BAY_ROADS) {
  const id = `road ${road.id}`;
  if (!(road.lanes > 0)) fail(id, "lanes must be positive");
  if (!Array.isArray(road.points) || road.points.length < 2) fail(id, "needs at least two points");
  for (const [x, z] of road.points) if (!inBounds(x, z)) fail(id, `point (${x}, ${z}) is outside BAY_BOUNDS`);
}
// Connected: union-find over exact shared endpoints. A road network that
// only touches at rounded-but-not-exact coordinates would fail this, which
// is the point — bayworld-data.js's own roads are built to share points.
{
  const key = (p) => `${p[0]},${p[1]}`;
  const parent = new Map();
  const find = (a) => { while (parent.get(a) !== a) a = parent.get(a); return a; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  for (const road of BAY_ROADS) for (const p of road.points) { const k = key(p); if (!parent.has(k)) parent.set(k, k); }
  for (const road of BAY_ROADS) for (let i = 1; i < road.points.length; i++) union(key(road.points[i - 1]), key(road.points[i]));
  const roots = new Set([...parent.keys()].map(find));
  if (roots.size !== 1) fail("roads", `BAY_ROADS forms ${roots.size} disconnected pieces, not one connected network`);
}

// ------------------------------------------------------------- road lookup
for (const road of BAY_ROADS) {
  // The midpoint of the road's OWN FIRST SEGMENT, not a vertex — a vertex a
  // road shares with another (a junction, by design: see BAY_ROADS' own
  // header) can read back the other road's own lane count instead, which is
  // correct behaviour for bayRoadAt() (nearest road wins a tie) and not what
  // this is checking.
  const [ax, az] = road.points[0], [bx, bz] = road.points[1];
  const mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const hit = bayRoadAt(mx, mz);
  if (!hit?.onRoad) fail(`roadAt ${road.id}`, "reads null on the road's own centreline");
  else if (hit.lane !== road.lanes) fail(`roadAt ${road.id}`, `lane ${hit.lane}, expected ${road.lanes}`);
  else if (!Number.isFinite(hit.heading)) fail(`roadAt ${road.id}`, "heading is not a finite number");
}
if (bayRoadAt(BAY_BOUNDS.maxX - 5, BAY_BOUNDS.maxZ - 5) !== null) fail("roadAt", "a far corner of the field reads onRoad — no road runs there");

// ------------------------------------------------------------------ height
let minH = Infinity, maxH = -Infinity, maxJump = 0, nonFinite = 0;
const STEP = 41, EPS = 0.1;
for (let x = BAY_BOUNDS.minX; x <= BAY_BOUNDS.maxX; x += STEP) {
  for (let z = BAY_BOUNDS.minZ; z <= BAY_BOUNDS.maxZ; z += STEP) {
    const h0 = bayHeight(x, z);
    if (!Number.isFinite(h0)) { nonFinite += 1; continue; }
    minH = Math.min(minH, h0); maxH = Math.max(maxH, h0);
    const hx = bayHeight(x + EPS, z), hz = bayHeight(x, z + EPS);
    maxJump = Math.max(maxJump, Math.abs(hx - h0), Math.abs(hz - h0));
  }
}
if (nonFinite) fail("height", `bayHeight returned a non-finite value at ${nonFinite} sample(s)`);
if (minH < BAY_HEIGHT_RANGE[0] - 1e-9 || maxH > BAY_HEIGHT_RANGE[1] + 1e-9) {
  fail("height", `bayHeight ranged [${minH.toFixed(2)}, ${maxH.toFixed(2)}], outside its declared BAY_HEIGHT_RANGE [${BAY_HEIGHT_RANGE[0]}, ${BAY_HEIGHT_RANGE[1]}]`);
}
const JUMP_CEILING = (BAY_HEIGHT_RANGE[1] - BAY_HEIGHT_RANGE[0]) * 0.2;
if (maxJump > JUMP_CEILING) fail("height", `bayHeight jumped ${maxJump.toFixed(3)}m over a ${EPS}m step, over the ${JUMP_CEILING.toFixed(3)}m ceiling for "gentle" relief`);
// Hills rise to the east, flat downtown and the port: the hills zone's own
// centre reads much higher than downtown's and the port's.
{
  const hills = BAY_ZONES.find((z) => z.id === "hills");
  const downtown = BAY_ZONES.find((z) => z.id === "downtown");
  const port = BAY_ZONES.find((z) => z.id === "port");
  const hHills = bayHeight(hills.centre[0], hills.centre[1]);
  const hDowntown = bayHeight(downtown.centre[0], downtown.centre[1]);
  const hPort = bayHeight(port.centre[0], port.centre[1]);
  if (!(hHills > hDowntown + 20)) fail("height", `the hills (${hHills.toFixed(1)}m) do not read meaningfully higher than downtown (${hDowntown.toFixed(1)}m)`);
  if (!(hHills > hPort + 20)) fail("height", `the hills (${hHills.toFixed(1)}m) do not read meaningfully higher than the port (${hPort.toFixed(1)}m)`);
  if (hPort > 10) fail("height", `the port reads ${hPort.toFixed(1)}m — expected close to flat`);
  // The expansion: the upper hills climb on above the hills; the island, both
  // shorelines and the outer bay all read flat.
  const upper = BAY_ZONES.find((z) => z.id === "upper-hills");
  if (!upper) fail("height", "no upper-hills zone to read the ridge from");
  else {
    const hUpper = bayHeight(upper.centre[0], upper.centre[1]);
    if (!(hUpper > hHills + 15)) fail("height", `the upper hills (${hUpper.toFixed(1)}m) do not read meaningfully higher than the hills (${hHills.toFixed(1)}m)`);
  }
  for (const id of ["island-harbour", "north-shoreline", "south-shoreline", "outer-bay"]) {
    const zone = BAY_ZONES.find((z) => z.id === id);
    if (!zone) { fail("height", `no ${id} zone`); continue; }
    const h = bayHeight(zone.centre[0], zone.centre[1]);
    if (h > 10) fail("height", `${id} reads ${h.toFixed(1)}m — expected close to flat`);
  }
}

// ------------------------------------------------------------------- build
function countMeshes(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; });
  return n;
}
for (const detail of ["low", "high"]) {
  const root = new THREE.Group();
  let result;
  try { result = buildBayWorld(root, { detail, time: "day", weather: "clear" }); }
  catch (e) { fail(`build:${detail}`, `threw — ${e.message}`); continue; }
  const budget = BAY_MESH_BUDGET[detail];
  const meshes = countMeshes(root);
  if (meshes === 0) fail(`build:${detail}`, "built no meshes at all");
  if (meshes > budget) fail(`build:${detail}`, `${meshes} authored meshes, over the documented ${budget}-mesh budget`);
  if (result?.meshCount !== meshes) fail(`build:${detail}`, `buildBayWorld() reported meshCount ${result?.meshCount}, but the tree holds ${meshes}`);
  for (const time of ["night", "dusk", "day"]) {
    const r2 = new THREE.Group();
    try {
      const built = buildBayWorld(r2, { detail, time });
      for (let i = 0; i < 10; i++) built.animate?.(i * 0.3, 0.3);
    } catch (e) { fail(`build:${detail}`, `threw at time=${time} — ${e.message}`); }
  }
}
// A single named zone builds on its own, under the whole world's budget.
for (const zone of BAY_ZONES) {
  const root = new THREE.Group();
  try {
    buildBayWorld(root, { detail: "high", zone: zone.id });
    const meshes = countMeshes(root);
    if (meshes === 0) fail(`build:zone:${zone.id}`, "built no meshes at all");
    if (meshes > BAY_MESH_BUDGET.high) fail(`build:zone:${zone.id}`, `${meshes} meshes — over the whole world's own high budget`);
  } catch (e) { fail(`build:zone:${zone.id}`, `threw — ${e.message}`); }
}
// Deterministic: two "high" builds author exactly the same mesh count.
{
  const a = new THREE.Group(), b = new THREE.Group();
  buildBayWorld(a, { detail: "high" });
  buildBayWorld(b, { detail: "high" });
  const ca = countMeshes(a), cb = countMeshes(b);
  if (ca !== cb) fail("build:determinism", `two "high" builds authored ${ca} and ${cb} meshes — buildBayWorld() must be deterministic`);
}

console.log(failures
  ? `\n${failures} Bay World problem(s) found.`
  : `\nBay World: ${BAY_ZONES.length} zones tile ${BAY_BOUNDS.maxX - BAY_BOUNDS.minX}×${BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ}m, ${BAY_LANDMARKS.length} landmarks and ${BAY_SITES.length} sites each inside their own zone, every curriculum programme anchored, ${BAY_ROADS.length} roads in one connected network, bayHeight bounded to [${BAY_HEIGHT_RANGE[0]}, ${BAY_HEIGHT_RANGE[1]}]m and continuous, both detail levels and every zone build under budget (low ≤ ${BAY_MESH_BUDGET.low}, high ≤ ${BAY_MESH_BUDGET.high} meshes) and deterministically.`);
process.exit(failures ? 1 : 0);
