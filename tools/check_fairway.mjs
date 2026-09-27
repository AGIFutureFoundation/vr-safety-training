/**
 * Fairway Park (shared/fairway.js), checked.
 *
 * Fairway Park is a nine-hole golf course plus an outdoor sports facility,
 * shared by a future golf/sports game and a grounds-and-landscaping training
 * programme (see the module's own header for the split between its "low"
 * scenic-district preview and its "high" — LOD 0 — full course). This holds
 * the data and the pure lie/height functions to what a game or a scoring
 * rubric depends on, deterministically, with no renderer:
 *
 *   - exactly nine holes, par 36 altogether;
 *   - every hole's pin sits on its own green (within the green's radius);
 *   - every fairway centreline waypoint lies inside FAIRWAY_BOUNDS;
 *   - fairwayLieAt() reads back "tee" at a hole's own tee, "green" at its
 *     pin, "bunker" at a bunker's centre and "water" at a water hazard's
 *     centre, and "out" past the field's edge;
 *   - fairwayHeight() stays inside FAIRWAY_HEIGHT_RANGE everywhere sampled,
 *     and never jumps: a small step in x or z moves it by only a small
 *     amount (continuity, sampled rather than proved);
 *   - buildFairwayPark() builds headlessly at both detail levels without
 *     throwing, and stays inside FAIRWAY_MESH_BUDGET's authored count for
 *     each.
 *
 *     node tools/check_fairway.mjs
 */
import { buildSuite } from "./lib/headless.mjs";

const MODULES = ["shared/kit.js", "shared/textures.js", "shared/fairway.js"];
const HARNESS = `export {
  FAIRWAY_HOLES, FAIRWAY_FACILITY, FAIRWAY_BOUNDS, FAIRWAY_HEIGHT_RANGE, FAIRWAY_MESH_BUDGET,
  fairwayHeight, fairwayGreenAt, fairwayLieAt, buildFairwayPark, THREE,
};`;
const S = await buildSuite(MODULES, HARNESS, "fairway");

let failures = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };

const { FAIRWAY_HOLES, FAIRWAY_FACILITY, FAIRWAY_BOUNDS, FAIRWAY_HEIGHT_RANGE, FAIRWAY_MESH_BUDGET,
  fairwayHeight, fairwayGreenAt, fairwayLieAt, buildFairwayPark, THREE } = S;

// ------------------------------------------------------------------ holes
if (FAIRWAY_HOLES.length !== 9) fail("holes", `FAIRWAY_HOLES has ${FAIRWAY_HOLES.length} holes, expected 9`);

const parTotal = FAIRWAY_HOLES.reduce((sum, h) => sum + h.par, 0);
if (parTotal !== 36) fail("par", `the nine holes total par ${parTotal}, expected 36`);

const inBounds = (x, z) => x >= FAIRWAY_BOUNDS.minX && x <= FAIRWAY_BOUNDS.maxX && z >= FAIRWAY_BOUNDS.minZ && z <= FAIRWAY_BOUNDS.maxZ;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const seenNumbers = new Set();
for (const hole of FAIRWAY_HOLES) {
  const id = `hole ${hole.number}`;
  if (seenNumbers.has(hole.number)) fail(id, "hole number repeated");
  seenNumbers.add(hole.number);
  if (![3, 4, 5].includes(hole.par)) fail(id, `par ${hole.par} is not 3, 4 or 5`);
  if (!Array.isArray(hole.fairway) || hole.fairway.length < 2) fail(id, "fairway centreline needs at least a tee and a green point");
  for (const p of hole.fairway) {
    if (!inBounds(p[0], p[1])) fail(id, `fairway centreline point (${p[0]}, ${p[1]}) is outside FAIRWAY_BOUNDS`);
  }
  if (hole.tee[0] !== hole.fairway[0][0] || hole.tee[1] !== hole.fairway[0][1]) fail(id, "tee is not the fairway centreline's first point");
  if (hole.pin[0] !== hole.green.centre[0] || hole.pin[1] !== hole.green.centre[1]) fail(id, "pin is not the green's centre");
  // Every pin on its own green: since pin === green.centre by construction
  // above, this is really "the green has a positive radius" — but it is
  // checked the way the brief asks for, by distance, so a future edit that
  // decouples pin from green.centre is still held to it.
  if (dist(hole.pin, hole.green.centre) > hole.green.radius + 1e-9) fail(id, `pin is ${dist(hole.pin, hole.green.centre).toFixed(2)}m from the green centre, outside its ${hole.green.radius}m radius`);
  if (!(hole.green.radius > 0)) fail(id, "green radius must be positive");
  if (!(hole.yards > 0)) fail(id, "yards must be positive");
  for (const b of hole.bunkers) if (!(b.radius > 0)) fail(id, "a bunker has a non-positive radius");
  for (const w of hole.water) if (!(w.radius > 0)) fail(id, "a water hazard has a non-positive radius");
}

if (!FAIRWAY_FACILITY?.track || !FAIRWAY_FACILITY?.pitch || !Array.isArray(FAIRWAY_FACILITY?.tennisCourts) || FAIRWAY_FACILITY.tennisCourts.length !== 2) {
  fail("facility", "FAIRWAY_FACILITY is missing its track, pitch or two tennis courts");
}
if (!FAIRWAY_FACILITY?.maintenanceYard?.equipmentShed || !FAIRWAY_FACILITY?.maintenanceYard?.pumpHouse || !FAIRWAY_FACILITY?.maintenanceYard?.fuelCabinet) {
  fail("facility", "FAIRWAY_FACILITY's maintenance yard is missing its equipment shed, pump house or fuel/oil cabinet");
}

// -------------------------------------------------------------------- lie
for (const hole of FAIRWAY_HOLES) {
  const id = `hole ${hole.number}`;
  if (fairwayLieAt(hole.tee[0], hole.tee[1]) !== "tee") fail(id, `fairwayLieAt at its own tee reads "${fairwayLieAt(hole.tee[0], hole.tee[1])}", expected "tee"`);
  if (fairwayLieAt(hole.pin[0], hole.pin[1]) !== "green") fail(id, `fairwayLieAt at its own pin reads "${fairwayLieAt(hole.pin[0], hole.pin[1])}", expected "green"`);
  for (const b of hole.bunkers) {
    if (fairwayLieAt(b.centre[0], b.centre[1]) !== "bunker") fail(id, `fairwayLieAt at a bunker centre reads "${fairwayLieAt(b.centre[0], b.centre[1])}", expected "bunker"`);
  }
  for (const w of hole.water) {
    if (fairwayLieAt(w.centre[0], w.centre[1]) !== "water") fail(id, `fairwayLieAt at a water hazard centre reads "${fairwayLieAt(w.centre[0], w.centre[1])}", expected "water"`);
  }
  const midIdx = Math.floor(hole.fairway.length / 2);
  const midOf = (i) => hole.fairway[i];
  const mx = midOf(midIdx)[0], mz = midOf(midIdx)[1];
  const midLie = fairwayLieAt(mx, mz);
  if (!["fairway", "tee", "green", "bunker", "water"].includes(midLie)) fail(id, `fairwayLieAt along its own centreline reads "${midLie}", expected a playable surface`);
}
if (fairwayLieAt(FAIRWAY_BOUNDS.minX - 50, 0) !== "out") fail("lie", "fairwayLieAt west of the field does not read \"out\"");
if (fairwayLieAt(0, FAIRWAY_BOUNDS.maxZ + 50) !== "out") fail("lie", "fairwayLieAt north of the field does not read \"out\"");
if (fairwayLieAt(0, 0) === undefined) fail("lie", "fairwayLieAt returned undefined inside the field");
const knownLies = new Set(["tee", "fairway", "rough", "green", "bunker", "water", "path", "out"]);
for (let x = FAIRWAY_BOUNDS.minX; x <= FAIRWAY_BOUNDS.maxX; x += 37) {
  for (let z = FAIRWAY_BOUNDS.minZ; z <= FAIRWAY_BOUNDS.maxZ; z += 41) {
    const lie = fairwayLieAt(x, z);
    if (!knownLies.has(lie)) fail("lie", `fairwayLieAt(${x}, ${z}) returned "${lie}", not one of the documented classes`);
  }
}
{
  const cartPathPoint = FAIRWAY_HOLES[0].cartPath[0];
  if (fairwayLieAt(cartPathPoint[0], cartPathPoint[1]) !== "path") fail("lie", "fairwayLieAt on a hole's own cart path does not read \"path\"");
}

// ---------------------------------------------------------------- greenAt
{
  const hole = FAIRWAY_HOLES[3];
  const found = fairwayGreenAt(hole.green.centre[0], hole.green.centre[1]);
  if (found?.number !== hole.number) fail("greenAt", `fairwayGreenAt at hole ${hole.number}'s own green returned ${JSON.stringify(found?.number)}`);
  if (fairwayGreenAt(0, FAIRWAY_BOUNDS.maxZ + 40) !== null) fail("greenAt", "fairwayGreenAt off the field must return null");
}

// ------------------------------------------------------------------ height
let minH = Infinity, maxH = -Infinity, maxJump = 0, nonFinite = 0;
const STEP = 23, EPS = 0.1;
for (let x = FAIRWAY_BOUNDS.minX; x <= FAIRWAY_BOUNDS.maxX; x += STEP) {
  for (let z = FAIRWAY_BOUNDS.minZ; z <= FAIRWAY_BOUNDS.maxZ; z += STEP) {
    const h0 = fairwayHeight(x, z);
    if (!Number.isFinite(h0)) { nonFinite += 1; continue; }
    minH = Math.min(minH, h0); maxH = Math.max(maxH, h0);
    const hx = fairwayHeight(x + EPS, z), hz = fairwayHeight(x, z + EPS);
    maxJump = Math.max(maxJump, Math.abs(hx - h0), Math.abs(hz - h0));
  }
}
if (nonFinite) fail("height", `fairwayHeight returned a non-finite value at ${nonFinite} sample(s)`);
if (minH < FAIRWAY_HEIGHT_RANGE[0] - 1e-9 || maxH > FAIRWAY_HEIGHT_RANGE[1] + 1e-9) {
  fail("height", `fairwayHeight ranged [${minH.toFixed(2)}, ${maxH.toFixed(2)}], outside its declared FAIRWAY_HEIGHT_RANGE [${FAIRWAY_HEIGHT_RANGE[0]}, ${FAIRWAY_HEIGHT_RANGE[1]}]`);
}
// Continuity is sampled, not proved: a ${EPS} m step should never move the
// height by more than a generous fraction of its whole declared range —
// anything close to that range in a tenth of a metre would be a seam, not
// "gentle" relief.
const JUMP_CEILING = (FAIRWAY_HEIGHT_RANGE[1] - FAIRWAY_HEIGHT_RANGE[0]) * 0.2;
if (maxJump > JUMP_CEILING) fail("height", `fairwayHeight jumped ${maxJump.toFixed(3)}m over a ${EPS}m step, over the ${JUMP_CEILING.toFixed(3)}m ceiling for "gentle" relief`);

// ------------------------------------------------------------------- build
function countMeshes(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; });
  return n;
}
for (const detail of ["low", "high"]) {
  const root = new THREE.Group();
  let result;
  try { result = buildFairwayPark(root, { detail, time: "day", weather: "clear" }); }
  catch (e) { fail(`build:${detail}`, `threw — ${e.message}`); continue; }
  const budget = FAIRWAY_MESH_BUDGET[detail];
  const meshes = countMeshes(root);
  if (meshes === 0) fail(`build:${detail}`, "built no meshes at all");
  if (meshes > budget) fail(`build:${detail}`, `${meshes} authored meshes, over the documented ${budget}-mesh budget`);
  if (result?.meshCount !== meshes) fail(`build:${detail}`, `buildFairwayPark() reported meshCount ${result?.meshCount}, but the tree holds ${meshes}`);
  // Every detail level, at every hour, animates without throwing.
  for (const time of ["night", "dusk", "day"]) {
    const r2 = new THREE.Group();
    try {
      const built = buildFairwayPark(r2, { detail, time });
      for (let i = 0; i < 10; i++) built.animate?.(i * 0.3, 0.3);
    } catch (e) { fail(`build:${detail}`, `threw at time=${time} — ${e.message}`); }
  }
}
// A second build is exactly as deterministic as the first — same authored
// mesh count both times, since nothing here is meant to read Math.random().
{
  const a = new THREE.Group(), b = new THREE.Group();
  buildFairwayPark(a, { detail: "high" });
  buildFairwayPark(b, { detail: "high" });
  const ca = countMeshes(a), cb = countMeshes(b);
  if (ca !== cb) fail("build:determinism", `two "high" builds authored ${ca} and ${cb} meshes — buildFairwayPark() must be deterministic`);
}

console.log(failures
  ? `\n${failures} Fairway Park problem(s) found.`
  : `\nFairway Park: 9 holes, par 36, every pin on its green, every fairway centreline inside the terrain; fairwayLieAt/fairwayGreenAt read back correctly; fairwayHeight bounded to [${FAIRWAY_HEIGHT_RANGE[0]}, ${FAIRWAY_HEIGHT_RANGE[1]}]m and continuous; both detail levels build under budget (low ≤ ${FAIRWAY_MESH_BUDGET.low}, high ≤ ${FAIRWAY_MESH_BUDGET.high} meshes) and deterministically.`);
process.exit(failures ? 1 : 0);
