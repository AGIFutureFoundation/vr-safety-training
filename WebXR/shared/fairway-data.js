// Fairway Park — the pure ground truth: layout data and the lie/height
// functions a game, a scoring rubric or a headless checker can call without
// touching three.js. shared/fairway.js imports this and adds the builder.


// =============================================================================
// Fairway Park: a large open-world outdoor district — a nine-hole golf course
// plus an outdoor sports facility — shared by two teams working in parallel:
// GOLF1 (a golf/sports mini-game) plays it, LAND1 (a grounds-and-landscaping
// training programme) works on it. Neither team's own app lives here; this
// module is only the shared ground truth both build against: the layout data
// (FAIRWAY_HOLES, FAIRWAY_FACILITY), the pure lie/height functions a game or a
// scoring rubric can call without touching three.js, and the one builder that
// turns all of it into a scene (buildFairwayPark).
//
// Everything here is original: no real course, club, brand or player is
// named or modelled, and no fact about a real organisation is asserted.
//
// ----------------------------------------------------------------- geometry
//
// The course sits on a single field, x:[-300,300] z:[-50,350] — 600 m by
// 400 m in scene units, the scale the rest of the platform already builds in
// (metres). Nine fairway corridors run roughly north from a "clubhouse row"
// near z ≈ -20..-30 up the property, side by side across the width; the
// sports facility (running track, courts, pitch, bleachers, maintenance
// yard) takes the western strip the fairways leave clear. Hole numbers run
// low-x to high-x, which is a layout choice, not a play-order requirement —
// nothing here assumes a learner or a player visits them in order.
//
// `buildFairwayPark(parent, opts)` has two `opts.detail` levels:
//   "high" (default) — the whole 600×400 m course and facility, built for a
//     standalone golf/sports app or a landscaping-training scene with its own
//     camera and its own mesh budget. Documented budget: FAIRWAY_MESH_BUDGET
//     .high (900 meshes, authored — see the note on that constant).
//   "low" — a compact clubhouse-and-first-tee vignette near the world
//     origin, self-contained and independent of the FAIRWAY_HOLES data. This
//     is what smartcity/js/districts.js's "fairway-park" entry asks for: a
//     SmartCiti.X scenic district is dropped into the shared stage, which
//     caps a district's own scenery at SCENIC_BUDGET (120 meshes, see
//     districts.js) and expects nothing beyond what a camera with the
//     district's own far plane can see. Rendering the full course there
//     would blow both, for no benefit — the stage's walkable preview was
//     never going to let a learner walk 600 m anyway. "low" is the same
//     kind of thing every other scenic district does (open-range does not
//     model a real ranch's acreage either): a representative slice, not a
//     scaled-down copy of the whole thing.

// --------------------------------------------------------------------- data

/** The course's outer field, in scene units (metres): 600 m × 400 m. */
export const FAIRWAY_BOUNDS = { minX: -300, maxX: 300, minZ: -50, maxZ: 350 };

/** Bounded, continuous range fairwayHeight() returns, in metres. */
export const FAIRWAY_HEIGHT_RANGE = [0, 3.5];

/** Sum of the segment lengths of a centreline, in yards (1 m = 1.09361 yd),
 *  rounded — so a hole's `yards` is always the distance its own `fairway`
 *  polyline actually describes, never a hand-typed number that could drift
 *  out of sync with it. */
function polylineYards(pts) {
  let metres = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, z0] = pts[i - 1], [x1, z1] = pts[i];
    metres += Math.hypot(x1 - x0, z1 - z0);
  }
  return Math.round(metres * 1.09361);
}

// Raw per-hole design: par, the fairway centreline tee-to-green (2 points
// for a par 3, 3-4 for a dogleg par 4/5), the green's radius, and its
// hazards as [x, z, radius] triples. tee, pin, green.centre and yards are
// all DERIVED below, never authored twice — tee is the centreline's first
// point, pin and the green's centre are its last, so "every pin sits on its
// green" and "every hole's own tee starts its own fairway" are true by
// construction rather than by two numbers happening to agree.
const HOLE_DEFS = [
  { number: 1, par: 4, pts: [[-140, -25], [-150, 110], [-125, 300]], greenR: 10,
    bunkers: [[-108, 305, 8]], water: [] },
  { number: 2, par: 3, pts: [[-86, -20], [-70, 140]], greenR: 9,
    bunkers: [[-55, 145, 6]], water: [] },
  { number: 3, par: 5, pts: [[-32, -30], [-56, 120], [-16, 260], [4, 345]], greenR: 11,
    bunkers: [[-62, 118, 9], [20, 350, 7]], water: [[-8, 230, 13]] },
  { number: 4, par: 4, pts: [[21, -25], [33, 120], [13, 290]], greenR: 10,
    bunkers: [[28, 296, 7]], water: [] },
  { number: 5, par: 3, pts: [[75, -20], [97, 155]], greenR: 9,
    bunkers: [[112, 158, 6]], water: [[65, 95, 10]] },
  { number: 6, par: 4, pts: [[129, -30], [157, 110], [122, 300]], greenR: 10,
    bunkers: [[163, 108, 8], [107, 305, 7]], water: [] },
  { number: 7, par: 5, pts: [[183, -25], [212, 130], [177, 270], [207, 340]], greenR: 11,
    bunkers: [[224, 346, 8]], water: [[195, 255, 12]] },
  { number: 8, par: 4, pts: [[236, -20], [255, 120], [225, 280]], greenR: 10,
    bunkers: [[242, 285, 7]], water: [] },
  { number: 9, par: 4, pts: [[280, -30], [258, 120], [283, 290]], greenR: 10,
    bunkers: [[296, 292, 6]], water: [] },
];

/** Nine holes, par 36 (4+3+5+4+3+4+5+4+4), laid out on FAIRWAY_BOUNDS. Each
 *  is `{ number, par, tee:[x,z], pin:[x,z], fairway:[[x,z]...], green:
 *  {centre,radius}, bunkers:[{centre,radius}], water:[{centre,radius}],
 *  cartPath:[[x,z]...], yards }`. */
export const FAIRWAY_HOLES = HOLE_DEFS.map((d) => {
  const fairway = d.pts;
  const tee = fairway[0];
  const green = { centre: fairway[fairway.length - 1], radius: d.greenR };
  // The cart path runs a fixed 13 m to the +x side of the tee-to-green line,
  // clear of the fairway itself — a straight service line rather than
  // literally following every dogleg, the way a real path often does not.
  const cartPath = [
    [tee[0] + 13, tee[1] - 4],
    [green.centre[0] + 13, green.centre[1] + 4],
  ];
  return {
    number: d.number,
    par: d.par,
    tee,
    pin: green.centre,
    fairway,
    green,
    bunkers: d.bunkers.map(([x, z, radius]) => ({ centre: [x, z], radius })),
    water: d.water.map(([x, z, radius]) => ({ centre: [x, z], radius })),
    cartPath,
    yards: polylineYards(fairway),
  };
});

/** The outdoor sports facility: a 400 m running track around an infield
 *  (doubled as the soccer/football pitch), a basketball court, two tennis
 *  courts, bleachers and a maintenance yard — all inside the western strip
 *  the nine fairways leave clear (x ≤ -150). */
export const FAIRWAY_FACILITY = {
  zone: { minX: -300, maxX: -150, minZ: -45, maxZ: 175 },
  // Semi-axes chosen so the ellipse's own perimeter is close to 400 m
  // (Ramanujan's approximation): a stylised oval, not a regulation drawing.
  track: { centre: [-225, 55], rx: 75, rz: 45, laneWidth: 8, lengthMetres: 391 },
  // The infield IS the soccer/football pitch — the common real-world way an
  // outdoor track and a field share one another's middle.
  pitch: { centre: [-225, 55], w: 90, d: 50 },
  basketballCourt: { centre: [-270, -25], w: 28, d: 15 },
  tennisCourts: [
    { centre: [-272, 140], w: 24, d: 11 },
    { centre: [-240, 140], w: 24, d: 11 },
  ],
  bleachers: { centre: [-225, 110], w: 60, rows: 5 },
  maintenanceYard: {
    zone: { minX: -298, maxX: -258, minZ: -44, maxZ: -8 },
    equipmentShed: { centre: [-288, -36], w: 10, d: 7 },
    pumpHouse: { centre: [-270, -36], w: 5, d: 5 },
    fuelCabinet: { centre: [-262, -30], w: 2, d: 1.2 },
  },
  weatherMast: { centre: [-278, -18] },
};

/** Documented mesh budget, authored (before mergeStatic — see kit.js's
 *  mergeStatic doc: it bakes static scenery into fewer draw calls at
 *  runtime but is a browser-only optimisation, a no-op with no effect on
 *  what a headless build asked for, so this is measured the same way
 *  check_budget.mjs measures a station). "high" is LOD 0, the whole course
 *  and facility; "low" is the compact preview districts.js registers. */
export const FAIRWAY_MESH_BUDGET = { low: 130, high: 900 };

// ---------------------------------------------------------------- geometry
//
// A small deterministic PRNG (mulberry-32-ish LCG) so tree scatter and other
// incidental placement is reproducible run to run — no Math.random() in a
// district's own layout, the same discipline the rest of the platform's
// seeded content already keeps.
export function seededRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function flatDist(x0, z0, x1, z1) { return Math.hypot(x1 - x0, z1 - z0); }

/** Shortest distance from a point to a line segment, in the XZ plane. */
function distToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq)) : 0;
  return flatDist(px, pz, ax + abx * t, az + abz * t);
}

/** Shortest distance from a point to a polyline (a hole's fairway or cart
 *  path centreline), in the XZ plane. */
function distToPolyline(px, pz, pts) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    best = Math.min(best, distToSegment(px, pz, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  }
  return best;
}

export const TEE_RADIUS = 4.5;
export const FAIRWAY_HALF_WIDTH = 11;
export const CART_HALF_WIDTH = 2.2;

/**
 * Deterministic terrain height at (x, z), in metres, bounded to
 * FAIRWAY_HEIGHT_RANGE and continuous everywhere (a sum of smooth sine/
 * cosine terms, clamped — clamping a continuous function stays continuous).
 * Used both to give the built terrain its gentle relief and, by a golf or
 * landscaping app, to place a ball or a mower blade at the right elevation
 * without touching three.js.
 */
export function fairwayHeight(x, z) {
  const s = 0.012;
  const raw = 1.7
    + 1.1 * Math.sin(x * s * 0.8 + 0.6) * Math.cos(z * s * 0.65 - 0.4)
    + 0.55 * Math.sin((x + z) * s * 1.3 + 1.1)
    + 0.35 * Math.cos((x - z) * s * 1.9 - 0.7);
  return Math.max(FAIRWAY_HEIGHT_RANGE[0], Math.min(FAIRWAY_HEIGHT_RANGE[1], raw));
}

/** The hole whose green contains (x, z), or null. A putt/scoring rubric
 *  uses this to know which green a ball or a mower is standing on. */
export function fairwayGreenAt(x, z) {
  for (const hole of FAIRWAY_HOLES) {
    if (flatDist(x, z, hole.green.centre[0], hole.green.centre[1]) <= hole.green.radius) return hole;
  }
  return null;
}

/**
 * The ground class at (x, z): "tee" | "fairway" | "rough" | "green" |
 * "bunker" | "water" | "path" | "out". Pure and synchronous — a golf game's
 * lie logic and a landscaping rubric's scoring both call this directly,
 * with no three.js dependency. Checked in that priority order: a green,
 * bunker or water hazard always wins over the fairway or rough it sits
 * inside, a cart path cuts across whatever it crosses, and anything outside
 * FAIRWAY_BOUNDS is "out" before anything else is asked.
 */
export function fairwayLieAt(x, z) {
  if (x < FAIRWAY_BOUNDS.minX || x > FAIRWAY_BOUNDS.maxX || z < FAIRWAY_BOUNDS.minZ || z > FAIRWAY_BOUNDS.maxZ) return "out";
  for (const hole of FAIRWAY_HOLES) {
    if (flatDist(x, z, hole.green.centre[0], hole.green.centre[1]) <= hole.green.radius) return "green";
  }
  for (const hole of FAIRWAY_HOLES) {
    for (const b of hole.bunkers) if (flatDist(x, z, b.centre[0], b.centre[1]) <= b.radius) return "bunker";
    for (const w of hole.water) if (flatDist(x, z, w.centre[0], w.centre[1]) <= w.radius) return "water";
  }
  for (const hole of FAIRWAY_HOLES) {
    if (flatDist(x, z, hole.tee[0], hole.tee[1]) <= TEE_RADIUS) return "tee";
  }
  for (const hole of FAIRWAY_HOLES) {
    if (distToPolyline(x, z, hole.cartPath) <= CART_HALF_WIDTH) return "path";
  }
  for (const hole of FAIRWAY_HOLES) {
    if (distToPolyline(x, z, hole.fairway) <= FAIRWAY_HALF_WIDTH) return "fairway";
  }
  return "rough";
}
