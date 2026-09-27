/**
 * The Deep (shared/underwater.js), checked.
 *
 * The Deep is a large stylised dive map under a bay shared by two teams
 * working in parallel: DEEP2 (a swim-or-ROV dive game with quests and
 * field-note eggs) plays it, and shared/underwater-data.js is the ground
 * truth both build against (see that file's own header). This holds the data
 * and the pure zone/depth/line functions to their rules, deterministically,
 * with no renderer — the same rules tools/check_bayworld.mjs holds Bay World
 * to, so the two worlds stay readable by the same tools:
 *
 *   - the zones (at least twelve) tile the whole of DEEP_BOUNDS (every
 *     sampled point gets a real zone back, and every zone covers something);
 *   - every landmark's position is nearer its own zone's centre than any
 *     other zone's (deepZoneAt() reads back that zone), and likewise for
 *     every dive and survey site; blurbs state no date, dimension or count;
 *   - every programme id in smartcity/js/curricula.js's CURRICULA is
 *     anchored by at least one DEEP_SITES or BAY_SITES entry, every programme
 *     a DEEP_SITES entry names exists, and every station id it names is a
 *     real smartcity/js/sims/<id>.js;
 *   - DEEP_LINES forms one connected network (every line shares an exact
 *     endpoint with another, directly or transitively), and deepLineAt()
 *     reads back onLine on a line's own centreline and null well off every
 *     line;
 *   - deepDepthAt() stays inside DEEP_DEPTH_RANGE everywhere sampled and
 *     never jumps (continuity, sampled rather than proved); the shelf, the
 *     pilings, the meadow and the marsh mouth read shallow, the channel
 *     deeper than the shelf beside it, the trench deepest of all, and the
 *     seamount's pinnacle shallower than the floor around it;
 *   - deepLighting() gives every band a fog colour, a positive density, a
 *     caustic that fades with depth and a particulate recipe;
 *   - buildUnderwater() builds headlessly at both detail levels, at every
 *     named zone and every band, without throwing, animates, and stays inside
 *     DEEP_MESH_BUDGET's authored count for each detail level, deterministically;
 *   - no file in this world states a depth, gas, decompression or current
 *     figure as a limit (the words never sit next to a number).
 *
 *     node tools/check_underwater.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSuite, WEBXR } from "./lib/headless.mjs";

const MODULES = [
  "shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/props.js",
  "smartcity/js/citykit.js", "shared/bayworld-data.js", "shared/underwater-data.js", "shared/underwater.js",
];
const HARNESS = `export {
  DEEP_BOUNDS, DEEP_DEPTH_RANGE, DEEP_ZONES, DEEP_LANDMARKS, DEEP_LINES, DEEP_SITES, DEEP_MESH_BUDGET,
  deepDepthAt, deepZoneAt, deepLineAt, deepBandAt, deepLighting, buildUnderwater, BAY_SITES, THREE,
};`;
const S = await buildSuite(MODULES, HARNESS, "underwater");

let failures = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };

const {
  DEEP_BOUNDS, DEEP_DEPTH_RANGE, DEEP_ZONES, DEEP_LANDMARKS, DEEP_LINES, DEEP_SITES, DEEP_MESH_BUDGET,
  deepDepthAt, deepZoneAt, deepLineAt, deepBandAt, deepLighting, buildUnderwater, BAY_SITES, THREE,
} = S;

const inBounds = (x, z) => x >= DEEP_BOUNDS.minX && x <= DEEP_BOUNDS.maxX && z >= DEEP_BOUNDS.minZ && z <= DEEP_BOUNDS.maxZ;
const ZONE_IDS = new Set(DEEP_ZONES.map((z) => z.id));

// ------------------------------------------------------------------ bounds
if (!(DEEP_BOUNDS.minX < DEEP_BOUNDS.maxX && DEEP_BOUNDS.minZ < DEEP_BOUNDS.maxZ)) fail("bounds", "DEEP_BOUNDS is not a positive field");
if (DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX !== 2000 || DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ !== 700 * 2) fail("bounds", `DEEP_BOUNDS is ${DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX}×${DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ}m, the brief's contract is 2000×1400m`);

// -------------------------------------------------------------------- zones
if (DEEP_ZONES.length < 12) fail("zones", `DEEP_ZONES has ${DEEP_ZONES.length} zones, expected at least 12`);
for (const zone of DEEP_ZONES) {
  const id = `zone ${zone.id}`;
  if (!inBounds(zone.centre[0], zone.centre[1])) fail(id, "centre is outside DEEP_BOUNDS");
  if (!(zone.radius > 0)) fail(id, "radius must be positive");
  for (const k of ["water", "seabed", "accent"]) {
    if (typeof zone.palette?.[k] !== "number") fail(id, `palette.${k} is not a colour number`);
  }
  if (!zone.name || !zone.blurb) fail(id, "has no public name or blurb");
}
{
  let uncovered = 0;
  const seen = new Set();
  const corners = [[DEEP_BOUNDS.minX, DEEP_BOUNDS.minZ], [DEEP_BOUNDS.maxX, DEEP_BOUNDS.minZ], [DEEP_BOUNDS.minX, DEEP_BOUNDS.maxZ], [DEEP_BOUNDS.maxX, DEEP_BOUNDS.maxZ], [0, 0]];
  for (const [x, z] of corners) { const zone = deepZoneAt(x, z); if (!zone || !ZONE_IDS.has(zone.id)) uncovered += 1; }
  for (let x = DEEP_BOUNDS.minX; x <= DEEP_BOUNDS.maxX; x += 47) {
    for (let z = DEEP_BOUNDS.minZ; z <= DEEP_BOUNDS.maxZ; z += 53) {
      const zone = deepZoneAt(x, z);
      if (!zone || !ZONE_IDS.has(zone.id)) uncovered += 1;
      else seen.add(zone.id);
    }
  }
  if (uncovered) fail("zones", `${uncovered} sampled point(s) inside DEEP_BOUNDS resolved to no real zone`);
  const unreached = DEEP_ZONES.filter((z) => !seen.has(z.id));
  if (unreached.length) fail("zones", `${unreached.map((z) => z.id).join(", ")} covered no sampled point at all — check its centre against its neighbours`);
  const dupes = DEEP_ZONES.map((z) => z.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (dupes.length) fail("zones", `duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
}

// --------------------------------------------------------------- landmarks
// No date, no dimension, no count in a blurb — and, under water, no depth
// figure of any kind.
const NO_HISTORY = /\b(19|20)\d{2}\b|\bfeet\b|\bmiles?\b|\bmeters?\b|\bmetres?\b|\btons?\b|\d/i;
if (DEEP_LANDMARKS.length < 20) fail("landmarks", `DEEP_LANDMARKS has ${DEEP_LANDMARKS.length}, expected at least 20`);
for (const l of DEEP_LANDMARKS) {
  const id = `landmark ${l.id}`;
  if (!ZONE_IDS.has(l.zone)) fail(id, `names an unknown zone "${l.zone}"`);
  if (!inBounds(l.position[0], l.position[1])) fail(id, "position is outside DEEP_BOUNDS");
  const found = deepZoneAt(l.position[0], l.position[1]);
  if (found?.id !== l.zone) fail(id, `sits nearer "${found?.id}" than its own declared zone "${l.zone}"`);
  if (!l.name || typeof l.name !== "string") fail(id, "has no public name");
  if (!l.kind) fail(id, "has no kind");
  if (!l.blurb || typeof l.blurb !== "string") fail(id, "has no one-line description");
  else if (NO_HISTORY.test(l.blurb)) fail(id, `blurb "${l.blurb}" states a date, dimension, depth or count`);
}
{
  const dupes = DEEP_LANDMARKS.map((l) => l.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (dupes.length) fail("landmarks", `duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
}

// -------------------------------------------------------------------- sites
if (DEEP_SITES.length < 30) fail("sites", `DEEP_SITES has ${DEEP_SITES.length}, expected at least 30`);
const curriculaSrc = readFileSync(join(WEBXR, "smartcity/js/curricula.js"), "utf8");
const programmeIds = [...curriculaSrc.matchAll(/^ {4}id: "([a-z0-9-]+)",/gm)].map((m) => m[1]);
if (programmeIds.length < 10) fail("programmes", "found suspiciously few programme ids in curricula.js — did its shape change?");
const PROGRAMMES = new Set(programmeIds);
for (const s of DEEP_SITES) {
  const id = `site ${s.id}`;
  if (!ZONE_IDS.has(s.zone)) fail(id, `names an unknown zone "${s.zone}"`);
  if (!inBounds(s.position[0], s.position[1])) fail(id, "position is outside DEEP_BOUNDS");
  const found = deepZoneAt(s.position[0], s.position[1]);
  if (found?.id !== s.zone) fail(id, `sits nearer "${found?.id}" than its own declared zone "${s.zone}"`);
  if (!Array.isArray(s.programmes)) fail(id, "programmes must be an array");
  else for (const p of s.programmes) if (!PROGRAMMES.has(p)) fail(id, `names a programme "${p}" that is not in curricula.js`);
  if (!Array.isArray(s.stations)) fail(id, "stations must be an array");
  else for (const st of s.stations) if (!existsSync(join(WEBXR, "smartcity/js/sims", `${st}.js`))) fail(id, `names a station "${st}" with no smartcity/js/sims/${st}.js`);
  if (!s.programmes?.length) fail(id, "anchors no programme — a dive site without a job board is scenery, not a site");
}
{
  const dupes = DEEP_SITES.map((s) => s.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (dupes.length) fail("sites", `duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
}
// Every curriculum programme is anchored somewhere — in the Deep or in Bay World.
{
  const anchored = new Set([...DEEP_SITES, ...BAY_SITES].flatMap((s) => s.programmes));
  const missing = programmeIds.filter((p) => !anchored.has(p));
  if (missing.length) fail("programmes", `${missing.length} programme(s) anchored nowhere in DEEP_SITES or BAY_SITES: ${missing.join(", ")}`);
  const deepAnchored = new Set(DEEP_SITES.flatMap((s) => s.programmes));
  for (const must of ["bay-restoration-maritime-underwater", "hunters-point-bay-restoration", "ports-maritime-ecology", "port-operations", "bay-area-union-edition"]) {
    if (!deepAnchored.has(must)) fail("programmes", `the marine programme "${must}" is anchored at no DEEP_SITES entry`);
  }
}

// -------------------------------------------------------------------- lines
const LINE_KINDS = new Set(["transect", "anchor-line", "guideline", "channel"]);
for (const line of DEEP_LINES) {
  const id = `line ${line.id}`;
  if (!LINE_KINDS.has(line.kind)) fail(id, `kind "${line.kind}" is not transect, anchor-line, guideline or channel`);
  if (!Array.isArray(line.points) || line.points.length < 2) fail(id, "needs at least two points");
  for (const [x, z] of line.points ?? []) if (!inBounds(x, z)) fail(id, `point (${x}, ${z}) is outside DEEP_BOUNDS`);
  if (!line.name) fail(id, "has no public name");
}
{
  const key = (p) => `${p[0]},${p[1]}`;
  const parent = new Map();
  const find = (a) => { while (parent.get(a) !== a) a = parent.get(a); return a; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  for (const line of DEEP_LINES) for (const p of line.points) { const k = key(p); if (!parent.has(k)) parent.set(k, k); }
  for (const line of DEEP_LINES) for (let i = 1; i < line.points.length; i++) union(key(line.points[i - 1]), key(line.points[i]));
  const roots = new Set([...parent.keys()].map(find));
  if (roots.size !== 1) fail("lines", `DEEP_LINES forms ${roots.size} disconnected pieces, not one connected network`);
  for (const kind of ["guideline", "transect", "anchor-line", "channel"]) {
    if (!DEEP_LINES.some((l) => l.kind === kind)) fail("lines", `no line of kind "${kind}"`);
  }
}
for (const line of DEEP_LINES) {
  // The midpoint of the line's OWN FIRST SEGMENT, not a vertex — a shared
  // vertex (a junction, by design) can read back the other line, which is
  // correct behaviour for deepLineAt() and not what this is checking.
  const [ax, az] = line.points[0], [bx, bz] = line.points[1];
  const mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const hit = deepLineAt(mx, mz);
  if (!hit?.onLine) fail(`lineAt ${line.id}`, "reads null on the line's own centreline");
  else if (hit.id !== line.id) fail(`lineAt ${line.id}`, `read back "${hit.id}" at its own first segment's midpoint — two lines overlap there`);
  else if (!Number.isFinite(hit.heading)) fail(`lineAt ${line.id}`, "heading is not a finite number");
}
if (deepLineAt(DEEP_BOUNDS.maxX - 5, DEEP_BOUNDS.minZ + 5) !== null) fail("lineAt", "a far corner of the field reads onLine — no line runs there");

// ------------------------------------------------------------------- depth
let minD = Infinity, maxD = -Infinity, maxJump = 0, nonFinite = 0;
const STEP = 41, EPS = 0.1;
for (let x = DEEP_BOUNDS.minX; x <= DEEP_BOUNDS.maxX; x += STEP) {
  for (let z = DEEP_BOUNDS.minZ; z <= DEEP_BOUNDS.maxZ; z += STEP) {
    const d0 = deepDepthAt(x, z);
    if (!Number.isFinite(d0)) { nonFinite += 1; continue; }
    minD = Math.min(minD, d0); maxD = Math.max(maxD, d0);
    const dx = deepDepthAt(x + EPS, z), dz = deepDepthAt(x, z + EPS);
    maxJump = Math.max(maxJump, Math.abs(dx - d0), Math.abs(dz - d0));
  }
}
if (nonFinite) fail("depth", `deepDepthAt returned a non-finite value at ${nonFinite} sample(s)`);
if (minD < DEEP_DEPTH_RANGE[0] - 1e-9 || maxD > DEEP_DEPTH_RANGE[1] + 1e-9) {
  fail("depth", `deepDepthAt ranged [${minD.toFixed(2)}, ${maxD.toFixed(2)}], outside its declared DEEP_DEPTH_RANGE [${DEEP_DEPTH_RANGE[0]}, ${DEEP_DEPTH_RANGE[1]}]`);
}
if (minD <= 0) fail("depth", "the seabed reaches the surface — depth must stay positive everywhere");
const JUMP_CEILING = (DEEP_DEPTH_RANGE[1] - DEEP_DEPTH_RANGE[0]) * 0.05;
if (maxJump > JUMP_CEILING) fail("depth", `deepDepthAt jumped ${maxJump.toFixed(3)}m over a ${EPS}m step, over the ${JUMP_CEILING.toFixed(3)}m ceiling for a continuous seabed`);
{
  const at = (id) => { const z = DEEP_ZONES.find((q) => q.id === id); if (!z) fail("depth", `no ${id} zone`); return z ? deepDepthAt(z.centre[0], z.centre[1]) : NaN; };
  const shelf = at("shallow-shelf"), pilings = at("pier-pilings"), meadow = at("eelgrass-meadow"), marsh = at("marsh-mouth");
  const channel = at("shipping-channel"), trench = at("deep-trench"), seamount = at("seamount"), mud = at("mud-plain"), wreck = at("wreck-hollow");
  for (const [id, d] of [["shallow-shelf", shelf], ["pier-pilings", pilings], ["eelgrass-meadow", meadow], ["marsh-mouth", marsh]]) {
    if (!(deepBandAt(...DEEP_ZONES.find((q) => q.id === id).centre) === "shallow")) fail("depth", `${id} reads ${d.toFixed(1)}m at its centre — expected the shallow band`);
  }
  // The channel is a trough: deeper than the shelf beside it, on both sides.
  const cz = DEEP_ZONES.find((q) => q.id === "shipping-channel");
  if (cz) {
    const beside = Math.min(deepDepthAt(cz.centre[0], cz.centre[1] - 220), deepDepthAt(cz.centre[0], cz.centre[1] + 220));
    if (!(channel > beside + 5)) fail("depth", `the channel (${channel.toFixed(1)}m) does not read meaningfully deeper than the floor beside it (${beside.toFixed(1)}m)`);
  }
  if (!(trench > channel + 20 && trench > mud + 20 && trench >= maxD - 1e-6)) fail("depth", `the trench (${trench.toFixed(1)}m) is not the deepest point of the world (max sampled ${maxD.toFixed(1)}m)`);
  if (deepBandAt(...DEEP_ZONES.find((q) => q.id === "deep-trench").centre) !== "deep") fail("depth", "the trench's centre does not read the deep band");
  const sz = DEEP_ZONES.find((q) => q.id === "seamount");
  if (sz) {
    const around = deepDepthAt(sz.centre[0] - 240, sz.centre[1]);
    if (!(seamount < around - 10)) fail("depth", `the seamount's pinnacle (${seamount.toFixed(1)}m) does not rise meaningfully above the floor around it (${around.toFixed(1)}m)`);
  }
  if (!(wreck > shelf + 10)) fail("depth", `the wreck hollow (${wreck.toFixed(1)}m) does not read deeper than the shelf (${shelf.toFixed(1)}m)`);
}

// ---------------------------------------------------------------- lighting
{
  let prevCaustic = Infinity, prevDensity = 0;
  for (const band of ["shallow", "mid", "deep"]) {
    const l = deepLighting(band);
    const id = `lighting ${band}`;
    if (typeof l.fog !== "number" || typeof l.water !== "number") fail(id, "has no fog and water colour");
    if (!(l.fogDensity > 0)) fail(id, "fogDensity must be positive");
    if (!(l.fogDensity >= prevDensity)) fail(id, "the water must get murkier with depth, never clearer");
    if (!Array.isArray(l.hemi) || l.hemi.length !== 2 || !(l.hemiI > 0)) fail(id, "has no hemisphere light recipe");
    if (!Array.isArray(l.key) || !(l.key[1] >= 0)) fail(id, "has no key light recipe");
    if (!(l.caustic?.intensity >= 0) || !(l.caustic.intensity <= prevCaustic)) fail(id, "caustic light must fade with depth");
    if (!(l.particulate?.count > 0) || !(l.particulate.size > 0)) fail(id, "has no particulate recipe");
    prevCaustic = l.caustic?.intensity ?? 0; prevDensity = l.fogDensity ?? 0;
  }
  if (deepLighting("deep").caustic.intensity !== 0) fail("lighting deep", "no surface light reaches the deep band's bottom — caustic intensity must be zero");
  if (deepLighting("nonsense") !== deepLighting("mid")) fail("lighting", "an unknown band must fall back to mid");
}

// ------------------------------------------------------------------- build
function countMeshes(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; });
  return n;
}
const counts = {};
for (const detail of ["low", "high"]) {
  const root = new THREE.Group();
  let result;
  try { result = buildUnderwater(root, { detail, time: "day", weather: "clear" }); }
  catch (e) { fail(`build:${detail}`, `threw — ${e.message}`); continue; }
  const budget = DEEP_MESH_BUDGET[detail];
  const meshes = countMeshes(root);
  counts[detail] = meshes;
  if (meshes === 0) fail(`build:${detail}`, "built no meshes at all");
  if (meshes > budget) fail(`build:${detail}`, `${meshes} authored meshes, over the documented ${budget}-mesh budget`);
  if (result?.meshCount !== meshes) fail(`build:${detail}`, `buildUnderwater() reported meshCount ${result?.meshCount}, but the tree holds ${meshes}`);
  if (!result?.lighting || !result.band) fail(`build:${detail}`, "did not hand back its band and lighting recipe");
  let lights = 0;
  root.traverse((o) => { if (o.intensity !== undefined) lights += 1; });
  if (lights > 4) fail(`build:${detail}`, `${lights} lights of its own — a build lights itself with at most four`);
  for (const band of ["shallow", "mid", "deep"]) {
    const r2 = new THREE.Group();
    try {
      const built = buildUnderwater(r2, { detail, band });
      if (built.band !== band) fail(`build:${detail}`, `asked for band ${band}, got ${built.band}`);
      for (let i = 0; i < 10; i++) built.animate?.(i * 0.3, 0.3);
    } catch (e) { fail(`build:${detail}`, `threw at band=${band} — ${e.message}`); }
  }
}
for (const zone of DEEP_ZONES) {
  const root = new THREE.Group();
  try {
    const built = buildUnderwater(root, { detail: "high", zone: zone.id });
    const meshes = countMeshes(root);
    if (meshes === 0) fail(`build:zone:${zone.id}`, "built no meshes at all");
    if (meshes > DEEP_MESH_BUDGET.high) fail(`build:zone:${zone.id}`, `${meshes} meshes — over the whole world's own high budget`);
    if (!["shallow", "mid", "deep"].includes(built.band)) fail(`build:zone:${zone.id}`, `band "${built.band}" is not a depth band`);
    built.animate?.(1, 0.3, { x: zone.centre[0], y: -5, z: zone.centre[1] });
  } catch (e) { fail(`build:zone:${zone.id}`, `threw — ${e.message}`); }
}
{
  const a = new THREE.Group(), b = new THREE.Group();
  buildUnderwater(a, { detail: "high" });
  buildUnderwater(b, { detail: "high" });
  const ca = countMeshes(a), cb = countMeshes(b);
  if (ca !== cb) fail("build:determinism", `two "high" builds authored ${ca} and ${cb} meshes — buildUnderwater() must be deterministic`);
}

// -------------------------------------------------------------- the words
// No depth, gas, decompression or current figure anywhere in the world's
// files: the words may appear, but never beside a number with a unit.
{
  const LIMIT_WORDS = /\b(depth|deco|decompression|bottom time|gas|current|no-stop|ndl)\b[^.\n]{0,40}\b\d+\s*(m|metres?|meters?|ft|feet|fsw|msw|min|minutes?|bar|psi|knots?)\b/i;
  for (const rel of ["shared/underwater-data.js", "shared/underwater.js"]) {
    const src = readFileSync(join(WEBXR, rel), "utf8");
    const m = src.match(LIMIT_WORDS);
    if (m) fail(rel, `states a figure as a limit: "${m[0]}"`);
  }
}

console.log(failures
  ? `\n${failures} Deep problem(s) found.`
  : `\nThe Deep: ${DEEP_ZONES.length} zones tile ${DEEP_BOUNDS.maxX - DEEP_BOUNDS.minX}×${DEEP_BOUNDS.maxZ - DEEP_BOUNDS.minZ}m of seabed, ${DEEP_LANDMARKS.length} landmarks and ${DEEP_SITES.length} sites each inside their own zone with real programmes and stations, every curriculum programme anchored in the Deep or Bay World, ${DEEP_LINES.length} dive lines in one connected network, deepDepthAt bounded to [${DEEP_DEPTH_RANGE[0]}, ${DEEP_DEPTH_RANGE[1]}]m and continuous, three lighting bands, both detail levels and every zone build under budget (low ${counts.low} ≤ ${DEEP_MESH_BUDGET.low}, high ${counts.high} ≤ ${DEEP_MESH_BUDGET.high} meshes) and deterministically.`);
process.exit(failures ? 1 : 0);
