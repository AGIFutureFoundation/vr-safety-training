// Bay Regatta — the three courses: pure data plus the water and course
// lookups a race engine, a map or a headless checker reads without three.js.
//
// Every course is original to this platform — an invented name, marks laid
// on the Bay World water shared/bayworld.js already builds — and no real
// race, club, sponsor or course is named or implied.
//
// Bay World has no water lookup of its own (bayRoadAt() answers for roads;
// on the water it is irrelevant), so RG_WATER mirrors the four bay-water
// slabs shared/bayworld.js's buildWorld() lays with buildWater(cx, cz, w, d)
// — the port/estuary shore, the outer bay, the north channel and the south
// shore — as plain rectangles, and rgOnWater() is the one place that asks
// "is this point afloat". tools/check_regatta.mjs holds every mark, line and
// dock to it, and holds every leg to it by sampling.
import { BAY_BOUNDS } from "../../shared/bayworld-data.js";

/** `[cx, cz, w, d]` — the same arguments buildWater() takes in shared/bayworld.js. */
export const RG_WATER = [
  [-180, 460, 900, 260],   // the port and estuary shore
  [-1000, 380, 400, 840],  // the outer bay and its shipping channel
  [-1060, -420, 280, 760], // the north channel the north shoreline's pier faces
  [0, 765, 2400, 70],      // the open water the island and the south shore look out on
];

/** Whether (x, z) is inside BAY_BOUNDS and on one of the water slabs. */
export function rgOnWater(x, z) {
  if (x < BAY_BOUNDS.minX || x > BAY_BOUNDS.maxX || z < BAY_BOUNDS.minZ || z > BAY_BOUNDS.maxZ) return false;
  return RG_WATER.some(([cx, cz, w, d]) => Math.abs(x - cx) <= w / 2 && Math.abs(z - cz) <= d / 2);
}

/**
 * The courses. Each is `{ id, name, zone, blurb, start: { a, b }, marks:
 * [{ id, x, z, side }], noWake: { x, z, r, cap }, dock: { x, z, heading },
 * laps }`. `start.a`/`start.b` are the two ends of the start/finish line;
 * `side` is the side of the yacht the mark must be kept on when rounded
 * ("port" — the mark passes down the left side; "starboard" — the right);
 * `noWake` is the harbour-mouth zone whose speed cap (m/s) is held on the
 * way out and the way home; `dock` is where the race ends with a clean
 * docking, heading in radians about Y (bow +Z at 0).
 */
export const RG_COURSES = [
  {
    id: "rg-estuary-sprint", name: "Estuary Sprint", zone: "estuary-waterfront",
    blurb: "A short four-mark sprint off the estuary shore: out through the harbour mouth at no-wake speed, four port roundings, and home to the berth.",
    start: { a: [40, 540], b: [90, 540] },
    marks: [
      { id: "es-1", x: -120, z: 420, side: "port" },
      { id: "es-2", x: -350, z: 380, side: "port" },
      { id: "es-3", x: -500, z: 480, side: "port" },
      { id: "es-4", x: -200, z: 550, side: "port" },
    ],
    noWake: { x: 65, z: 565, r: 70, cap: 2.6 },
    dock: { x: 40, z: 575, heading: 0 },
    laps: 1,
  },
  {
    id: "rg-outer-bay-loop", name: "Outer Bay Loop", zone: "outer-bay",
    blurb: "A loop around the outer bay with a starboard rounding in the middle, where wind and fog do the most to the helm.",
    start: { a: [-880, 300], b: [-930, 300] },
    marks: [
      { id: "ob-1", x: -1000, z: 120, side: "port" },
      { id: "ob-2", x: -1120, z: 400, side: "starboard" },
      { id: "ob-3", x: -950, z: 650, side: "port" },
      { id: "ob-4", x: -850, z: 500, side: "port" },
    ],
    noWake: { x: -840, z: 330, r: 70, cap: 2.6 },
    dock: { x: -830, z: 300, heading: Math.PI / 2 },
    laps: 1,
  },
  {
    id: "rg-north-channel-passage", name: "North Channel Passage", zone: "north-shoreline",
    blurb: "The long one: down the north channel and back, five marks, mixed roundings, with the pier's no-wake zone at both ends of the day.",
    start: { a: [-960, -560], b: [-1010, -560] },
    marks: [
      { id: "nc-1", x: -1100, z: -400, side: "starboard" },
      { id: "nc-2", x: -1050, z: -200, side: "port" },
      { id: "nc-3", x: -1000, z: 100, side: "port" },
      { id: "nc-4", x: -1130, z: -100, side: "starboard" },
      { id: "nc-5", x: -1000, z: -450, side: "port" },
    ],
    noWake: { x: -960, z: -600, r: 70, cap: 2.6 },
    dock: { x: -950, z: -600, heading: Math.PI / 2 },
    laps: 1,
  },
];

/** The course with this id, or null. */
export function rgCourseById(id) { return RG_COURSES.find((c) => c.id === id) ?? null; }

/** Every point a course touches, in order: start centre, marks, dock. */
export function rgCourseWaypoints(course) {
  const sx = (course.start.a[0] + course.start.b[0]) / 2, sz = (course.start.a[1] + course.start.b[1]) / 2;
  const legs = [[sx, sz]];
  for (let lap = 0; lap < (course.laps ?? 1); lap++) for (const m of course.marks) legs.push([m.x, m.z]);
  legs.push([sx, sz], [course.dock.x, course.dock.z]);
  return legs;
}

/**
 * What a course has at (x, z): `{ kind: "mark", mark }` within `r` metres of
 * a turning mark, `{ kind: "line" }` within `r` of the start/finish line,
 * `{ kind: "no-wake", cap }` inside the harbour-mouth zone, `{ kind: "dock" }`
 * within `r` of the dock, `{ kind: "water" }` afloat anywhere else and
 * `{ kind: "shore" }` off the water — the water-side counterpart of Bay
 * World's bayRoadAt(), which has nothing to say afloat.
 */
export function regattaCourseAt(course, x, z, r = 25) {
  if (!rgOnWater(x, z)) return { kind: "shore" };
  for (const mark of course.marks) if (Math.hypot(x - mark.x, z - mark.z) <= r) return { kind: "mark", mark };
  if (Math.hypot(x - course.dock.x, z - course.dock.z) <= r) return { kind: "dock" };
  const [ax, az] = course.start.a, [bx, bz] = course.start.b;
  const abx = bx - ax, abz = bz - az, l2 = abx * abx + abz * abz;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * abx + (z - az) * abz) / l2)) : 0;
  if (Math.hypot(x - (ax + abx * t), z - (az + abz * t)) <= r) return { kind: "line" };
  if (Math.hypot(x - course.noWake.x, z - course.noWake.z) <= course.noWake.r) return { kind: "no-wake", cap: course.noWake.cap };
  return { kind: "water" };
}

/** Whether a straight leg from (ax, az) to (bx, bz) stays afloat, sampled every `step` metres. */
export function rgLegOnWater(ax, az, bx, bz, step = 10) {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
  for (let i = 0; i <= n; i++) { const t = i / n; if (!rgOnWater(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
  return true;
}

/** Uniform world-to-canvas transform over BAY_BOUNDS (Bay World's map keeps
 *  the same rule; this is the regatta's own copy so the two apps never share
 *  a top-level name in the bundle). */
export function rgWorldToMap(x, z, size = 512, pad = 18) {
  const w = BAY_BOUNDS.maxX - BAY_BOUNDS.minX, h = BAY_BOUNDS.maxZ - BAY_BOUNDS.minZ;
  const scale = (size - pad * 2) / Math.max(w, h);
  return { x: (size - w * scale) / 2 + (x - BAY_BOUNDS.minX) * scale, y: (size - h * scale) / 2 + (z - BAY_BOUNDS.minZ) * scale, scale };
}

/** A course-local transform: the course's own extent (plus a margin) fitted
 *  into a `size`-pixel square, for the race HUD's course card. */
export function rgCourseToMap(course, size = 240, pad = 16) {
  const pts = [...rgCourseWaypoints(course), course.start.a, course.start.b];
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60, minZ = Math.min(...zs) - 60, maxZ = Math.max(...zs) + 60;
  const scale = (size - pad * 2) / Math.max(maxX - minX, maxZ - minZ);
  const offX = (size - (maxX - minX) * scale) / 2, offY = (size - (maxZ - minZ) * scale) / 2;
  return (x, z) => ({ x: offX + (x - minX) * scale, y: offY + (z - minZ) * scale, scale });
}
