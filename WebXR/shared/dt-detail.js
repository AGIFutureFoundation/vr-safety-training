/**
 * DETAIL (the Louisiana wave, prefix `dt`, docs/consoles/DETAIL.md): procedural small detail on every 4096 m parish map,
 * as seeded instanced scatter — never data. Street kit, yards, roofs, vegetation, marsh and water edge, farm, industry and
 * site clutter, keyed by district character, cover, roads, water and sites (never by map id), so a new map gets it too.
 *
 * Seams:
 *
 *     dtDetailForChunk(parish, cx, cz, tier, { ring = 0, spots = null }) -> { families: { [id]: { n, mats, cols } }, count }
 *       Pure and deterministic (same map, chunk, tier and ring -> the same instances). `mats` is n column-major 4x4
 *       matrices (Float32Array n*16), `cols` n linear RGB colours (Float32Array n*3). A lower tier or a farther ring is a
 *       subset of the higher one: every candidate draws its random numbers first and is kept by one threshold.
 *
 *     dtDetailSteps(parish, cx, cz, tier, { ring, spots, slice: { deadline } }) -> generator returning the same value
 *       dtDetailForChunk's one chunk, resumable (SMOOTH): it yields once performance.now() passes slice.deadline.
 *
 *     dtMountDetail(root, THREE, parish, { tier, hooks?, frameMs? }) -> { frame(), drain(), flush(), stats(), capacityOk(), dispose(), meshes }
 *       A pool, not per-chunk meshes: DT_FAMILIES.length (≤ 16) InstancedMeshes under `root`, one per family, capacity
 *       per tier (DT_CAPACITY). Sets hooks.chunkLoaded / chunkUnloaded / streamed (NP_MASSING_HOOKS by default): each
 *       streamed chunk inside DT_FADE's rings is queued; every engine update (`streamed` -> frame()) refills the pool (a
 *       copy of the finished chunks' arrays, nearest ring first) and generates queued chunks, time-sliced, until
 *       DT_BUDGET.frameMs[tier] is spent (SMOOTH). drain() finishes the queue at once. Call it before npBuildParish.
 *
 * Budget: tiny geometry (2–20 triangles an instance), no textures, two shared materials; the visible set's triangles are
 * capped by the capacities (DT_BUDGET.triangles per tier, tools/check_detail.mjs proves Σ capacity × triangles ≤ it).
 * Colours: vegetation and street kit from a fixed natural range; fences, mailboxes, roof kit, containers and site
 * clutter from the region's PALETTE categories. Everything is procedural and generic: nothing records a real object.
 * Nothing moves, so reduced motion needs nothing.
 */
import { NP_SIZE, NP_CHUNK, NP_ROAD_KINDS, NP_MASSING, npPrepare, npHeightAt, npCoverAt, npDistrictAt, npRng, npMassingForChunk, npPolyLength, npPolyPointAt, npRoadSurfaceAt } from "./np-parish.js";
import { NP_MASSING_HOOKS } from "./np-world.js";
import { PA_CATEGORIES, paRegionCategories, paRegionOf } from "./pa-palette-data.js";

/** The detail families, one InstancedMesh each in the pool (triangles an instance; `flat` = double-sided). */
export const DT_FAMILIES = [
  { id: "tuft", tris: 4, flat: true, note: "grass tufts, weeds, crop rows, cane and rice rows, hanging moss" },
  { id: "flower", tris: 4, note: "flowers in yards and verges" },
  { id: "reed", tris: 6, flat: true, note: "reeds and rushes at the water's edge and in the marsh" },
  { id: "shrub", tris: 8, note: "shrubs and hedges" },
  { id: "fence", tris: 2, flat: true, note: "fence panels, rails, overhead wires and gallery ironwork" },
  { id: "lamp", tris: 20, note: "street lamps" },
  { id: "post", tris: 12, note: "hydrants, bollards, meters, sign posts, mailboxes, pilings, roof vents and tanks, pipe-rack posts, taxiway lights, gallery posts, gas lamps" },
  { id: "box", tris: 12, note: "benches, bins, AC units, drums, pallets, containers, barriers, hay bales, stacks, crab traps, rack beams, ground-support carts, tugs, chocks, keel blocks, steel plate" },
  { id: "pole", tris: 20, note: "power poles with a cross-arm" },
  { id: "decal", tris: 2, flat: true, note: "road dashes, crosswalk stripes, solar panels, rice-check water, apron slabs, taxi lines, slip rails, gallery floors" },
  { id: "cone", tris: 8, note: "traffic cones, cypress knees, saplings" },
  { id: "palm", tris: 12, flat: true, note: "palms" },
  { id: "tree", tris: 14, note: "small trees and cypress" },
  { id: "disc", tris: 4, flat: true, note: "lily pads and crab-trap floats" },
  { id: "pipe", tris: 12, note: "pipe runs on racks" },
];
const DT_IDX = Object.fromEntries(DT_FAMILIES.map((f, i) => [f.id, i]));

/** The density scale per tier against the high tier's table (the targets: high 100×, balanced 25×, low 5× the baseline). */
export const DT_DENSITY = { high: 1, balanced: 0.25, low: 0.05 };
/** The fade by ring: the nearest ring full, then thinner; rings past the table get none. */
export const DT_FADE = { high: [1, 0.12, 0.03], balanced: [1, 0.12, 0.03], low: [1, 0.1] };
/** The pool's capacity per family per tier (instances). */
export const DT_CAPACITY = {
  high: { tuft: 12000, flower: 2400, reed: 4000, shrub: 1600, fence: 3000, lamp: 300, post: 1400, box: 1400, pole: 160, decal: 3000, cone: 600, palm: 120, tree: 500, disc: 1000, pipe: 200 },
  balanced: { tuft: 6000, flower: 1200, reed: 2000, shrub: 800, fence: 1500, lamp: 150, post: 700, box: 700, pole: 80, decal: 1500, cone: 300, palm: 60, tree: 250, disc: 500, pipe: 100 },
  low: { tuft: 1600, flower: 400, reed: 600, shrub: 260, fence: 450, lamp: 50, post: 200, box: 200, pole: 24, decal: 450, cone: 120, palm: 20, tree: 70, disc: 150, pipe: 30 },
};
/**
 * The visible set's triangle budget per tier. Why these: the worst full build at the start and every site (the five
 * densest maps, FACADES mounted) is 179,475 triangles at high and 49,000 at low against the engine's 400,000, so high
 * takes at most 170k (≈ 50k headroom left for streets, life and weather), balanced half of that, and the phone 26k.
 * Per-chunk generation must stay inside `genMs` (median) and `genWorstMs` so the engine's two-chunks-a-frame stream never
 * stalls a frame.
 */
export const DT_BUDGET = {
  triangles: { high: 170000, balanced: 85000, low: 26000 },
  // genMs 12 → 14 (coordinator, 29 Sep): DETAIL-2's Louisiana rows (cane, rice, cypress, crab traps, pipe racks, hangars,
  // slipways, galleries) measured 13.3 ms CPU median on a quiet gate; the worst-case bound (90 ms) is unchanged. Next step is
  // generation in a worker or spread across frames (docs/consoles/DETAIL-2.md, Left).
  maxMeshes: 16, genMs: 14, genWorstMs: 90, ratio: { high: 100, balanced: 25, low: 5 },
  // SMOOTH: the detail work one frame may spend (ms): the pool's refill plus sliced generation. A chunk (~13 ms) is made
  // across several frames instead of inside one; 3 ms is a fifth of a 60 Hz frame and a quarter of a 72 Hz headset's.
  frameMs: { high: 3, balanced: 3, low: 2 },
};
/** How far inside the frame budget the generation deadline sits (the overshoot is one checkpoint, tens of µs). */
const DT_SLICE_MARGIN_MS = 0.25;

/** Map a district character (or cover) to a scatter table row; unknown characters fall back by name, then to "grass". */
export function dtCharacterRow(ch) {
  if (DT_TABLE[ch]) return ch;
  if (/farm|field|rice|cane|crop|pasture|agri/.test(ch ?? "")) return "farm";
  if (/marsh|swamp|bayou|wet/.test(ch ?? "")) return "wetland";
  if (/industr|yard|plant|site|energy|data|rail/.test(ch ?? "")) return "industrial";
  if (/town|main|civic|commerc|city/.test(ch ?? "")) return "downtown";
  if (/house|resid|neigh/.test(ch ?? "")) return "suburb";
  return "grass";
}

/**
 * The high tier's scatter per 8 m cell (64 m²), by cover or district character: [family, count, kind]. A count below 1
 * is a chance. `kind` names what it is (for colour and scale).
 */
export const DT_TABLE = {
  grass: [["tuft", 34, "grass"], ["flower", 3, "wild"], ["shrub", 0.4, "shrub"], ["tree", 0.05, "tree"]],
  park: [["tuft", 36, "grass"], ["flower", 5, "wild"], ["shrub", 0.8, "shrub"], ["box", 0.05, "bench"], ["tree", 0.12, "tree"], ["tuft", 1.2, "moss"]],
  garden: [["tuft", 22, "grass"], ["flower", 7, "garden"], ["shrub", 1.6, "hedge"], ["box", 0.3, "clutter"], ["palm", 0.03, "palm"], ["tuft", 1, "moss"]],
  suburb: [["tuft", 24, "grass"], ["flower", 6, "garden"], ["shrub", 1.4, "hedge"], ["box", 0.35, "clutter"], ["palm", 0.03, "palm"], ["cone", 0.08, "sapling"]],
  quarter: [["tuft", 12, "weed"], ["flower", 4, "planter"], ["shrub", 0.6, "planter"], ["box", 0.5, "bin"], ["post", 0.6, "bollard"]],
  downtown: [["tuft", 8, "weed"], ["flower", 2, "planter"], ["shrub", 0.5, "planter"], ["box", 0.5, "bin"], ["post", 0.8, "bollard"], ["tree", 0.06, "tree"]],
  campus: [["tuft", 28, "grass"], ["flower", 4, "garden"], ["shrub", 1, "hedge"], ["box", 0.12, "bench"], ["tree", 0.1, "tree"]],
  industrial: [["tuft", 14, "weed"], ["box", 1.2, "pallet"], ["box", 0.8, "drum"], ["box", 0.12, "container"], ["pipe", 0.12, "pipe"], ["post", 0.3, "bollard"]],
  port: [["tuft", 8, "weed"], ["box", 0.8, "container"], ["box", 0.6, "pallet"], ["post", 0.5, "bollard"], ["pipe", 0.06, "pipe"]],
  refinery: [["tuft", 12, "weed"], ["pipe", 0.9, "pipe"], ["box", 0.6, "drum"], ["post", 0.4, "valve"], ["box", 0.2, "pallet"]],
  wetland: [["reed", 44, "reed"], ["tuft", 10, "marsh"], ["disc", 1.2, "lily"], ["cone", 0.6, "knee"], ["flower", 0.6, "marsh"]],
  farm: [["tuft", 40, "crop"], ["decal", 0.3, "check"], ["box", 0.04, "bale"], ["fence", 0.4, "farm"]],
  pad: [["cone", 1.6, "cone"], ["box", 1.2, "barrier"], ["box", 1, "stack"], ["box", 0.6, "drum"], ["tuft", 6, "weed"], ["decal", 0.3, "mark"]],
  levee: [["tuft", 40, "grass"], ["flower", 1, "wild"]],
  shore: [["reed", 26, "reed"], ["tuft", 6, "marsh"], ["post", 0.4, "piling"]],
  edgewater: [["reed", 12, "reed"], ["disc", 2, "lily"], ["post", 0.25, "piling"], ["disc", 0.2, "float"]],
  water: [["disc", 0.01, "float"]],
  // DETAIL-2: the Louisiana rows (DT_VARIANTS picks them). A 4th entry is a row spacing in metres: the thing is set in
  // straight rows (the x coordinate snapped, the yaw along the row), so cane, rice, pipe racks and slip rails line up.
  cane: [["tuft", 38, "cane", 1.5], ["tuft", 4, "weed"], ["decal", 0.05, "headland"], ["fence", 0.12, "farm"], ["box", 0.02, "bale"]],
  rice: [["tuft", 32, "rice", 1], ["decal", 0.9, "check"], ["tuft", 3, "marsh"], ["fence", 0.1, "farm"]],
  cypress: [["reed", 34, "reed"], ["tuft", 8, "marsh"], ["tree", 0.16, "cypress"], ["cone", 1.4, "knee"], ["disc", 1, "lily"], ["flower", 0.4, "marsh"]],
  bayouedge: [["reed", 12, "reed"], ["disc", 1.6, "lily"], ["post", 0.5, "piling"], ["disc", 0.7, "float"], ["cone", 0.5, "knee"]],
  bayoushore: [["reed", 22, "reed"], ["tuft", 6, "marsh"], ["post", 0.5, "piling"], ["cone", 0.4, "knee"], ["box", 0.12, "crabtrap"]],
  crabwater: [["disc", 0.03, "float"]],
  piperack: [["tuft", 10, "weed"], ["post", 0.5, "rackpost", 8], ["box", 0.35, "rackbeam", 8], ["pipe", 0.9, "rackpipe", 8], ["pipe", 0.6, "rackpipe2", 8], ["box", 0.5, "drum"], ["post", 0.35, "valve"], ["box", 0.15, "pallet"]],
  apron: [["tuft", 16, "grass"], ["decal", 1.4, "apron"], ["decal", 0.25, "taxiline", 8], ["post", 0.12, "taxilight"], ["box", 0.03, "gse"], ["box", 0.06, "chock"]],
  hangar: [["tuft", 8, "weed"], ["decal", 0.8, "apron"], ["box", 0.6, "pallet"], ["box", 0.06, "gse"], ["box", 0.02, "tug"], ["post", 0.1, "taxilight"], ["box", 0.1, "chock"]],
  slipway: [["tuft", 6, "weed"], ["decal", 0.5, "sliprail", 4], ["box", 0.4, "keelblock", 4], ["post", 0.4, "piling"], ["box", 0.35, "plate"], ["box", 0.1, "container"], ["post", 0.3, "bollard"], ["pipe", 0.05, "pipe"]],
  gallery: [["tuft", 10, "weed"], ["flower", 5, "planter"], ["shrub", 0.5, "planter"], ["box", 0.4, "bin"], ["post", 0.5, "bollard"], ["post", 0.12, "gaslamp"]],
};

/**
 * DETAIL-2: the Louisiana maps use the shared characters (garden, park, industrial, port, refinery, quarter, wetland), so
 * their own look comes from the region and the district's name — never the map id. Inside a region matching
 * DT_LA_REGIONS: water, water's edge and shore take the bayou rows (crab-trap floats, pilings, cypress knees), wetland
 * districts the cypress row, and a district whose character and name match a rule below takes that rule's row. The
 * `gallery` row also hangs galleries and ironwork on the district's quarter blocks.
 */
export const DT_LA_REGIONS = /louisiana|new-orleans/;
export const DT_VARIANTS = [
  // [character, name pattern (null: every district of that character in the region), row]
  ["garden", /rice/i, "rice"],
  ["garden", /cane|field/i, "cane"],
  ["park", /runway|taxiway|apron/i, "apron"],
  ["industrial", /hangar|airport|aviation/i, "hangar"],
  ["port", /shipyard|boatyard|slipway/i, "slipway"],
  ["refinery", null, "piperack"],
  ["industrial", /plant|process|propellant|compressor|blending/i, "piperack"],
  ["quarter", /french quarter|marigny|trem[eé]|faubourg|seventh ward/i, "gallery"],
];
/** Lift above the ground per kind (metres): the pipes and beams ride on the rack posts. */
const DT_LIFT = { rackpipe: 5.4, rackpipe2: 4.6, rackbeam: 5.1 };
/** The yaw of a thing set in rows (the rows run along z): pipes (long in x) turn along the row, beams across it. */
const DT_ROW_YAW = { rackpipe: Math.PI / 2, rackpipe2: Math.PI / 2, rackbeam: Math.PI / 2 };
const dtVarCache = new WeakMap();
/** A map's Louisiana variants (cached): { la, rows: Map(district key -> row), chars: Set of characters with a variant }. */
export function dtVariants(parish) {
  let v = dtVarCache.get(parish);
  if (v) return v;
  const la = DT_LA_REGIONS.test(paRegionOf(parish));
  const rows = new Map(), chars = new Set();
  if (la) for (const d of npPrepare(parish).districts) {
    const hit = DT_VARIANTS.find(([ch, re]) => ch === d.character && (!re || re.test(d.name ?? "")));
    if (hit) { rows.set(dtDistrictKey(d), hit[2]); chars.add(d.character); }
  }
  v = { la, rows, chars };
  dtVarCache.set(parish, v);
  return v;
}
const dtDistrictKey = (d) => `${d.id}|${d.name}`;

/** Colours by what a thing is (linear-ish RGB 0..1, jittered per instance). `null` = from the region's PALETTE walls. */
const DT_COLOUR = {
  grass: [0.33, 0.5, 0.2], weed: [0.4, 0.46, 0.24], marsh: [0.5, 0.52, 0.28], crop: [0.55, 0.6, 0.25], moss: [0.5, 0.55, 0.45],
  wild: [0.85, 0.8, 0.35], garden: [0.85, 0.35, 0.45], planter: [0.8, 0.45, 0.3], shrub: [0.22, 0.4, 0.18], hedge: [0.2, 0.38, 0.17],
  reed: [0.6, 0.62, 0.34], lily: [0.25, 0.5, 0.25], knee: [0.42, 0.33, 0.25], sapling: [0.25, 0.45, 0.2], tree: [0.25, 0.44, 0.2],
  palm: [0.35, 0.5, 0.22], bench: [0.45, 0.32, 0.2], bin: [0.2, 0.28, 0.24], bollard: [0.3, 0.3, 0.32], clutter: null, pallet: [0.6, 0.48, 0.3],
  drum: [0.2, 0.35, 0.6], container: null, pipe: [0.7, 0.7, 0.68], valve: [0.8, 0.6, 0.1], check: [0.3, 0.42, 0.45], bale: [0.8, 0.7, 0.4],
  farm: [0.55, 0.45, 0.32], cone: [0.95, 0.45, 0.1], barrier: [0.95, 0.9, 0.85], stack: [0.62, 0.6, 0.55], mark: [0.95, 0.85, 0.2],
  piling: [0.4, 0.33, 0.25], float: [0.95, 0.5, 0.15], dash: [0.92, 0.92, 0.85], stripe: [0.95, 0.95, 0.95], lamp: [0.3, 0.32, 0.34],
  hydrant: [0.8, 0.15, 0.1], meter: [0.5, 0.5, 0.52], sign: [0.6, 0.6, 0.62], mailbox: null, pole: [0.42, 0.33, 0.24], wire: [0.1, 0.1, 0.1],
  fence: null, ac: [0.78, 0.78, 0.76], vent: [0.5, 0.5, 0.5], rooftank: [0.55, 0.45, 0.35], solar: [0.1, 0.15, 0.3],
  // DETAIL-2 (Louisiana rows)
  cane: [0.45, 0.58, 0.22], rice: [0.55, 0.62, 0.25], headland: [0.5, 0.42, 0.3], cypress: [0.32, 0.42, 0.22], crabtrap: [0.5, 0.52, 0.46],
  rackpost: [0.55, 0.5, 0.4], rackbeam: [0.5, 0.46, 0.4], rackpipe: [0.7, 0.7, 0.68], rackpipe2: [0.75, 0.72, 0.55],
  apron: [0.6, 0.6, 0.58], taxiline: [0.95, 0.8, 0.15], taxilight: [0.2, 0.35, 0.95], gse: [0.9, 0.9, 0.85], tug: [0.95, 0.7, 0.1], chock: [0.95, 0.8, 0.1],
  sliprail: [0.3, 0.28, 0.26], keelblock: [0.45, 0.33, 0.2], plate: [0.4, 0.4, 0.42], gaslamp: [0.1, 0.11, 0.12],
  gallerypost: [0.08, 0.09, 0.1], ironwork: [0.06, 0.07, 0.08], gallerydeck: [0.45, 0.38, 0.3], fern: [0.25, 0.5, 0.2],
};
/** Base scale [sx, sy, sz] per kind (the family's unit geometry is scaled by it and ±25%). */
const DT_SCALE = {
  grass: [1, 1, 1], weed: [0.8, 0.7, 0.8], marsh: [1, 1.4, 1], crop: [0.7, 3, 0.7], moss: [0.8, -2.2, 0.8], wild: [1, 1, 1], garden: [1.2, 1.2, 1.2],
  planter: [1.4, 1.4, 1.4], shrub: [1, 1, 1], hedge: [1.4, 1, 1.4], reed: [1, 1.6, 1], lily: [0.7, 1, 0.7], knee: [0.3, 0.5, 0.3], sapling: [1.2, 3, 1.2],
  tree: [1, 1, 1], palm: [1, 1, 1], bench: [1.6, 0.45, 0.5], bin: [0.6, 1, 0.6], bollard: [0.2, 0.9, 0.2], clutter: [0.8, 0.6, 0.8],
  pallet: [1.2, 0.3, 1], drum: [0.6, 0.9, 0.6], container: [6, 2.6, 2.4], pipe: [8, 1, 1], valve: [0.3, 1.2, 0.3], check: [8, 1, 8],
  bale: [1.6, 1.2, 1.2], farm: [3, 1.1, 1], cone: [0.4, 0.7, 0.4], barrier: [2, 0.8, 0.4], stack: [1.4, 1, 1.2], mark: [2, 1, 0.3],
  piling: [0.3, 2.4, 0.3], float: [0.25, 1, 0.25], dash: [0.25, 1, 3], stripe: [0.6, 1, 4], lamp: [1, 1, 1], hydrant: [0.35, 0.8, 0.35],
  meter: [0.15, 1.3, 0.15], sign: [0.1, 2.6, 0.1], mailbox: [0.4, 1.1, 0.3], pole: [1, 1, 1], wire: [1, 0.03, 1], fence: [1, 1.2, 1],
  ac: [1.4, 1, 1.2], vent: [0.4, 0.8, 0.4], rooftank: [1.6, 2.4, 1.6], solar: [3, 1, 2],
  // DETAIL-2 (Louisiana rows)
  cane: [0.6, 6, 0.6], rice: [0.6, 1.8, 0.6], headland: [1.2, 1, 8], cypress: [0.7, 2.4, 0.7], crabtrap: [0.6, 0.4, 0.6],
  rackpost: [0.35, 5.4, 0.35], rackbeam: [0.3, 0.3, 4], rackpipe: [8, 1.2, 1.2], rackpipe2: [8, 0.8, 0.8],
  apron: [8, 1, 8], taxiline: [0.3, 1, 6], taxilight: [0.15, 0.35, 0.15], gse: [2.2, 1.4, 1.4], tug: [3, 1.2, 1.8], chock: [0.4, 0.25, 0.3],
  sliprail: [0.3, 1, 8], keelblock: [1.2, 0.8, 0.6], plate: [2.4, 0.25, 1.2], gaslamp: [0.12, 3, 0.12],
  gallerypost: [0.12, 4, 0.12], ironwork: [1, 0.9, 1], gallerydeck: [1, 1, 1.2], fern: [1.3, 1.3, 1.3],
};

const DT_CELL = 8;
/** The table's counts are scaled by this (tuned so the thinnest map still clears 100× at high; see DETAIL.md Cycles). */
export const DT_CELL_SCALE = 0.55;
const DT_CELLS = NP_CHUNK / DT_CELL; // 32
const DT_HGRID = 16;                 // the height grid (16 m, the nearest ring's terrain step)

/** The region's PALETTE wall colours (cached), for fences, mailboxes, containers and clutter. */
const dtRegionCols = new Map();
function dtRegionColours(parish) {
  const region = paRegionOf(parish);
  let c = dtRegionCols.get(region);
  if (!c) {
    c = [];
    for (const id of paRegionCategories(region)) for (const w of PA_CATEGORIES[id]?.walls ?? []) c.push([((w >> 16) & 255) / 255, ((w >> 8) & 255) / 255, (w & 255) / 255]);
    if (!c.length) c.push([0.8, 0.8, 0.8]);
    dtRegionCols.set(region, c);
  }
  return c;
}

/** A growable per-family buffer. */
class DtBuf {
  constructor() { this.n = 0; this.mats = new Float32Array(1024 * 16); this.cols = new Float32Array(1024 * 3); }
  push(x, y, z, yaw, sx, sy, sz, r, g, b) {
    if (this.n * 16 >= this.mats.length) { const m = new Float32Array(this.mats.length * 2); m.set(this.mats); this.mats = m; const c = new Float32Array(this.cols.length * 2); c.set(this.cols); this.cols = c; }
    const c = Math.cos(yaw), s = Math.sin(yaw), o = this.n * 16, m = this.mats;
    m[o] = c * sx; m[o + 1] = 0; m[o + 2] = -s * sx; m[o + 3] = 0;
    m[o + 4] = 0; m[o + 5] = sy; m[o + 6] = 0; m[o + 7] = 0;
    m[o + 8] = s * sz; m[o + 9] = 0; m[o + 10] = c * sz; m[o + 11] = 0;
    m[o + 12] = x; m[o + 13] = y; m[o + 14] = z; m[o + 15] = 1;
    const k = this.n * 3; this.cols[k] = r; this.cols[k + 1] = g; this.cols[k + 2] = b;
    this.n++;
  }
  // An exact-size copy: the scratch buffers are reused by the next chunk (SMOOTH: ~1.2 MB of fresh buffers a chunk was
  // ~12 % of generation in the garbage collector).
  trim() { return { n: this.n, mats: this.mats.slice(0, this.n * 16), cols: this.cols.slice(0, this.n * 3) }; }
}
/** Scratch buffer sets, one per generation in flight (a sliced chunk holds its set until it finishes or is dropped). */
const dtFree = [];
function dtAcquire() { const b = dtFree.pop() ?? DT_FAMILIES.map(() => new DtBuf()); for (const x of b) x.n = 0; return b; }
function dtRelease(b) { if (dtFree.length < 4) dtFree.push(b); }
/** Work units between clock reads in a sliced generation (a unit is one candidate or one road sample; the height and cover grids read the clock every sample). */
const DT_CHECK_EVERY = 16;

/** One chunk's detail, in one go. See the header for the shape. */
export function dtDetailForChunk(parish, cx, cz, tier = "high", opts = {}) {
  const g = dtDetailSteps(parish, cx, cz, tier, { ...opts, slice: null });
  let r = g.next();
  while (!r.done) r = g.next();
  return r.value;
}

/**
 * The same chunk's detail as a resumable generation (SMOOTH): `slice = { deadline }` (performance.now() ms); the
 * generator yields at its next checkpoint once the clock passes `slice.deadline` and resumes where it stopped; its return
 * value is exactly dtDetailForChunk's (the same code, the same random draws in the same order — yielding draws nothing).
 * With no slice it never reads the clock and never yields. Drop an unfinished one with `.return()` (frees its buffers).
 */
export function* dtDetailSteps(parish, cx, cz, tier = "high", opts = {}) {
  const bufs = dtAcquire();
  try { return yield* dtSteps(bufs, parish, cx, cz, tier, opts); } finally { dtRelease(bufs); }
}

function* dtSteps(bufs, parish, cx, cz, tier, { ring = 0, spots = null, tally = false, slice = null } = {}) {
  const prep = npPrepare(parish);
  // Checkpoints: every DT_CHECK_EVERY work units, a sliced generation reads the clock and yields past its deadline.
  let work = 0;
  const clock = slice?.clock ?? (typeof performance !== "undefined" ? performance : Date);
  const keepP = (DT_DENSITY[tier] ?? 1) * ((DT_FADE[tier] ?? DT_FADE.high)[ring] ?? 0);
  // tally: also count what every tier would keep at this ring, in the same pass (the checker's ratio walk).
  // (Flat arrays, not [tier, p] pairs: this runs once per candidate — DETAIL-2 cut its allocations.)
  const tierIds = tally ? Object.keys(DT_DENSITY) : [], nT = tierIds.length;
  const tierP = new Float64Array(tierIds.map((t) => DT_DENSITY[t] * ((DT_FADE[t] ?? DT_FADE.high)[ring] ?? 0))), tierN = new Float64Array(nT);
  const out = () => { const families = {}; let count = 0; DT_FAMILIES.forEach((f, i) => { families[f.id] = bufs[i].trim(); count += bufs[i].n; }); const counts = {}; tierIds.forEach((t, i) => { counts[t] = tierN[i]; }); return { families, count, tiers: counts }; };
  if (keepP <= 0) return out();
  const x0 = -NP_SIZE / 2 + cx * NP_CHUNK, z0 = -NP_SIZE / 2 + cz * NP_CHUNK;
  const rng = npRng((prep.seed ^ Math.imul(cx + 101, 0x9e3779b1) ^ Math.imul(cz + 211, 0x85ebca77) ^ 0xd7a11) >>> 0);
  const region = dtRegionColours(parish);
  // Heights on a 16 m grid, bilinear between (the nearest ring's terrain uses the same step).
  const hn = NP_CHUNK / DT_HGRID + 1, H = new Float32Array(hn * hn);
  for (let j = 0; j < hn; j++) {
    for (let i = 0; i < hn; i++) {
      H[j * hn + i] = npHeightAt(parish, x0 + i * DT_HGRID, z0 + j * DT_HGRID);
      // (a clock read per sample: a height inside a large water polygon measures its whole shoreline)
      if (slice && clock.now() >= slice.deadline) yield;
    }
  }
  const hAt = (x, z) => {
    const fx = Math.min(hn - 1.0001, Math.max(0, (x - x0) / DT_HGRID)), fz = Math.min(hn - 1.0001, Math.max(0, (z - z0) / DT_HGRID));
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, a = H[j * hn + i], b = H[j * hn + i + 1], c = H[(j + 1) * hn + i], d = H[(j + 1) * hn + i + 1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  // Cover per 8 m cell (the centre's), then the water-edge rows by the neighbours.
  const cover = new Array(DT_CELLS * DT_CELLS);
  for (let j = 0; j < DT_CELLS; j++) {
    for (let i = 0; i < DT_CELLS; i++) {
      cover[j * DT_CELLS + i] = npCoverAt(parish, x0 + (i + 0.5) * DT_CELL, z0 + (j + 0.5) * DT_CELL);
      if (slice && clock.now() >= slice.deadline) yield;
    }
  }
  const isWet = (c) => c === "water";
  // Is a 4-neighbour inside the chunk wet (want = true) or dry (want = false)? (No per-cell arrays or closures.)
  const nbWet = (i, j, want) => (i + 1 < DT_CELLS && isWet(cover[j * DT_CELLS + i + 1]) === want) || (i > 0 && isWet(cover[j * DT_CELLS + i - 1]) === want)
    || (j + 1 < DT_CELLS && isWet(cover[(j + 1) * DT_CELLS + i]) === want) || (j > 0 && isWet(cover[(j - 1) * DT_CELLS + i]) === want);
  const put = (fam, kind, x, y, z, yaw, jit = 0.25, extra = null) => {
    // Every candidate draws its numbers first, then one threshold keeps it: lower tiers and farther rings are subsets.
    const u = rng(), a = rng(), b = rng(), e = rng();
    work++;
    for (let q = 0; q < nT; q++) if (u < tierP[q]) tierN[q]++;
    if (u >= keepP) return;
    const sc = extra ?? DT_SCALE[kind] ?? [1, 1, 1], k = 1 - jit + a * jit * 2;
    let col = DT_COLOUR[kind];
    if (col === null || col === undefined) col = region[Math.floor(b * region.length) % region.length];
    const l = 0.88 + e * 0.24;
    bufs[DT_IDX[fam]].push(x, y, z, yaw, sc[0] * k, sc[1] * k, sc[2] * k, col[0] * l, col[1] * l, col[2] * l);
  };
  const halfEdge = prep.half - 2;
  const V = dtVariants(parish);
  // The Louisiana variant row at a point (a district lookup only for characters that have a variant on this map).
  const variantAt = (c, x, z) => { if (!V.chars.has(c)) return null; const d = npDistrictAt(parish, x, z); return d ? V.rows.get(dtDistrictKey(d)) ?? null : null; };
  for (let j = 0; j < DT_CELLS; j++) for (let i = 0; i < DT_CELLS; i++) {
    if (slice && work >= DT_CHECK_EVERY) { work = 0; if (clock.now() >= slice.deadline) yield; }
    const c = cover[j * DT_CELLS + i];
    if (c === "road") continue;
    let row = c;
    if (isWet(c)) {
      const nb = nbWet(i, j, false);
      row = nb ? (V.la ? "bayouedge" : "edgewater") : (V.la ? "crabwater" : "water");
    } else if (c !== "wetland") {
      const nb = nbWet(i, j, true);
      row = nb ? (V.la ? "bayoushore" : "shore") : (variantAt(c, x0 + (i + 0.5) * DT_CELL, z0 + (j + 0.5) * DT_CELL) ?? dtCharacterRow(c));
    } else if (V.la) row = "cypress";
    const tab = DT_TABLE[row] ?? DT_TABLE.grass;
    const cx0 = x0 + i * DT_CELL, cz0 = z0 + j * DT_CELL;
    const onWater = row === "edgewater" || row === "water" || row === "bayouedge" || row === "crabwater";
    for (let e = 0; e < tab.length; e++) {
      const te = tab[e], fam = te[0], count0 = te[1], kind = te[2], sp = te[3];
      const count = count0 * DT_CELL_SCALE, whole = Math.floor(count), n = whole + (rng() < count - whole ? 1 : 0);
      for (let q = 0; q < n; q++) {
        // In rows (sp): x snapped to the row lines, the yaw along the row (the same random draws either way).
        const ux = rng(), x = sp ? cx0 + (Math.floor(ux * DT_CELL / sp) + 0.5) * sp : cx0 + ux * DT_CELL, z = cz0 + rng() * DT_CELL;
        if (Math.abs(x) > halfEdge || Math.abs(z) > halfEdge) { rng(); rng(); rng(); rng(); continue; }
        const y = onWater ? (fam === "post" ? -1.2 : fam === "reed" ? -0.4 : 0.03) : hAt(x, z) + (DT_LIFT[kind] ?? 0);
        const yaw = rng() * Math.PI * 2;
        put(fam, kind, x, y + (fam === "decal" ? 0.04 : 0), z, sp ? (DT_ROW_YAW[kind] ?? 0) : yaw);
      }
    }
  }
  // Streets: lamps, power poles and wires, curb kit, lane dashes and crosswalk stripes along every road through the chunk.
  for (const r of prep.roads) {
    const style = NP_ROAD_KINDS[r.kind];
    if (!style || !style.width) continue;
    let inside = false;
    for (const p of r.pts) if (p[0] > x0 - 40 && p[0] < x0 + NP_CHUNK + 40 && p[1] > z0 - 40 && p[1] < z0 + NP_CHUNK + 40) { inside = true; break; }
    if (!inside && r.pts.length > 1) {
      // A long segment may cross the chunk with no vertex inside it: test the segments' boxes.
      for (let k = 1; k < r.pts.length && !inside; k++) { const a = r.pts[k - 1], b = r.pts[k]; if (Math.max(a[0], b[0]) > x0 && Math.min(a[0], b[0]) < x0 + NP_CHUNK && Math.max(a[1], b[1]) > z0 && Math.min(a[1], b[1]) < z0 + NP_CHUNK) inside = true; }
    }
    if (!inside) continue;
    const L = npPolyLength(r.pts);
    if (L < 1) continue;
    const deck = !!style.clearance, w = style.width / 2;
    for (let d = 0; d < L; d += 4) {
      if (slice && ++work >= DT_CHECK_EVERY) { work = 0; if (clock.now() >= slice.deadline) yield; }
      const t = d / L, p = npPolyPointAt(r.pts, t);
      if (p.x < x0 || p.x >= x0 + NP_CHUNK || p.z < z0 || p.z >= z0 + NP_CHUNK) continue;
      const nx = Math.cos(p.yaw), nz = -Math.sin(p.yaw), ys = npRoadSurfaceAt(parish, r, t);
      const step = Math.round(d / 4);
      // lane dashes (every 12 m, a 3 m dash) on roads wide enough for lanes; a dash each side of the centre on the big ones
      if (style.width >= 9 && step % 3 === 0) {
        put("decal", "dash", p.x, ys + 0.05, p.z, p.yaw, 0);
        if (style.width >= 16) { put("decal", "dash", p.x + nx * w * 0.5, ys + 0.05, p.z + nz * w * 0.5, p.yaw, 0); put("decal", "dash", p.x - nx * w * 0.5, ys + 0.05, p.z - nz * w * 0.5, p.yaw, 0); }
      }
      // edge lines as short stripes
      put("decal", "dash", p.x + nx * (w - 0.4), ys + 0.05, p.z + nz * (w - 0.4), p.yaw, 0, [0.15, 1, 4]);
      put("decal", "dash", p.x - nx * (w - 0.4), ys + 0.05, p.z - nz * (w - 0.4), p.yaw, 0, [0.15, 1, 4]);
      // a crosswalk every 120 m on streets and avenues
      if (!deck && style.width <= 16 && step % 30 === 0) for (let s = -w + 1; s < w - 0.5; s += 1.2) put("decal", "stripe", p.x + nx * s, ys + 0.05, p.z + nz * s, p.yaw, 0);
      if (deck) { if (step % 8 === 0) { put("lamp", "lamp", p.x + nx * (w - 0.5), ys, p.z + nz * (w - 0.5), p.yaw + Math.PI); } continue; }
      const side = step % 2 ? 1 : -1, off = w + 1.6, sx = p.x + nx * off * side, sz = p.z + nz * off * side;
      if (npCoverAt(parish, sx, sz) === "water") continue;
      const gy = hAt(sx, sz);
      if (step % 8 === 0) put("lamp", "lamp", sx, gy, sz, p.yaw + (side > 0 ? Math.PI : 0), 0.05);
      if (step % 10 === 5) {
        // a power pole on the far side, and the wire to the next one (10 steps = 40 m on)
        const px = p.x - nx * off * side * 1.2, pz = p.z - nz * off * side * 1.2;
        put("pole", "pole", px, hAt(px, pz), pz, p.yaw, 0.05);
        put("fence", "wire", px, hAt(px, pz) + 8.6, pz, p.yaw + Math.PI / 2, 0, [40, 0.04, 1]);
      }
      const kit = ["hydrant", "meter", "sign", "mailbox", "bin", "bench", "bollard"][step % 7];
      if (kit === "bin" || kit === "bench") put("box", kit, sx, gy, sz, p.yaw); else put("post", kit, sx, gy, sz, p.yaw);
      put("tuft", "weed", sx + nx * side * 0.8, gy, sz + nz * side * 0.8, p.yaw);
      put("shrub", "planter", sx + nx * side * 1.8, gy, sz + nz * side * 1.8, p.yaw);
    }
  }
  // Buildings (the chunk's massing spots): roof kit on flat roofs, yards round houses, moss on live oaks, rails by tanks.
  const list = spots ?? npMassingForChunk(parish, cx, cz);
  for (const s of list) {
    if (slice && work >= DT_CHECK_EVERY) { work = 0; if (clock.now() >= slice.deadline) yield; }
    const c = Math.cos(s.rot), sn = Math.sin(s.rot);
    const at = (lx, lz) => [s.x + c * lx + sn * lz, s.z - sn * lx + c * lz];
    if (s.kind === "tower" || s.kind === "shed" || s.kind === "campusBlock" || s.kind === "quarterBlock") {
      const [hx, hz] = s.kind === "tower" ? [11 * s.s, 11 * s.s] : s.kind === "shed" ? [20 * s.s, 11 * s.s] : s.kind === "campusBlock" ? [14 * s.s, 9 * s.s] : [8 * s.s, 6 * s.s];
      const roof = s.y - 0.15 + (s.kind === "quarterBlock" ? 8 * s.s : s.h);
      const nRoof = s.kind === "shed" ? 10 : s.kind === "quarterBlock" ? 4 : 8;
      for (let k = 0; k < nRoof; k++) {
        const [px, pz] = at((rng() - 0.5) * hx * 1.6, (rng() - 0.5) * hz * 1.6);
        const pick = rng();
        if (pick < 0.45) put("box", "ac", px, roof, pz, s.rot);
        else if (pick < 0.75) put("post", "vent", px, roof, pz, s.rot);
        else if (pick < 0.9) put("decal", "solar", px, roof + 0.4, pz, s.rot);
        else put("post", "rooftank", px, roof, pz, s.rot);
      }
      // ground clutter at the back door
      for (let k = 0; k < 3; k++) { const [px, pz] = at((rng() - 0.5) * hx * 2, -hz - 1.5); put("box", s.kind === "shed" ? "pallet" : "bin", px, hAt(px, pz), pz, s.rot); }
      // DETAIL-2: a gallery on the street front of a quarter block in a `gallery` district (the French Quarter and its
      // neighbours): iron posts to the ground, the gallery floor, an iron railing along it and hanging ferns.
      if (s.kind === "quarterBlock" && V.chars.has("quarter") && variantAt("quarter", s.x, s.z) === "gallery") {
        const lift = Math.min(3.8, 4.4 * s.s), gy = s.y + lift, depth = 1.3, fz = hz + depth, nPost = Math.max(2, Math.round((2 * hx) / 2.6));
        for (let k = 0; k < nPost; k++) { const [px, pz] = at(-hx + (k + 0.5) * (2 * hx) / nPost, fz); put("post", "gallerypost", px, s.y, pz, s.rot, 0, [0.12, lift + 1, 0.12]); }
        const [dx, dz] = at(0, hz + depth / 2); put("decal", "gallerydeck", dx, gy, dz, s.rot, 0, [2 * hx, 1, depth]);
        const [rx, rz] = at(0, fz); put("fence", "ironwork", rx, gy, rz, s.rot, 0, [2 * hx, 0.95, 1]);
        for (const side of [-1, 1]) { const [sx2, sz2] = at(side * hx, hz + depth / 2); put("fence", "ironwork", sx2, gy, sz2, s.rot + Math.PI / 2, 0, [depth, 0.95, 1]); }
        for (let k = 0; k < nPost - 1; k++) { const [px, pz] = at(-hx + (k + 1) * (2 * hx) / nPost, fz - 0.1); put("flower", "fern", px, gy - 0.9, pz, rng() * 6.28); }
      }
    } else if (s.kind === "gardenHouse" || s.kind === "suburbHouse") {
      const lot = (NP_MASSING.garden.spacing + NP_MASSING.suburb.spacing) / 4 - 1; // half a lot, metres
      for (let k = -3; k <= 3; k++) {
        for (const [lx, lz, yaw] of [[k * lot / 3, -lot, 0], [k * lot / 3, lot, 0], [-lot, k * lot / 3, Math.PI / 2], [lot, k * lot / 3, Math.PI / 2]]) {
          const [px, pz] = at(lx, lz); put("fence", "fence", px, hAt(px, pz), pz, s.rot + yaw, 0, [lot / 3, 1.2, 1]);
        }
      }
      for (let k = 0; k < 8; k++) { const [px, pz] = at((rng() - 0.5) * lot * 1.8, lot * (0.6 + rng() * 0.35)); put(k % 2 ? "shrub" : "flower", k % 2 ? "hedge" : "garden", px, hAt(px, pz), pz, rng() * 6.28); }
      const [mx, mz] = at(lot * 0.3, lot - 0.4); put("post", "mailbox", mx, hAt(mx, mz), mz, s.rot);
      const [ax, az] = at(-6 * s.s, 0); put("box", "ac", ax, hAt(ax, az), az, s.rot, 0.1, [1, 0.9, 0.9]);
      for (let k = 0; k < 3; k++) { const [px, pz] = at((rng() - 0.5) * lot, -lot * (0.5 + rng() * 0.4)); put("box", "clutter", px, hAt(px, pz), pz, rng() * 6.28); }
    } else if (s.kind === "liveOak" || s.kind === "cypress") {
      const n = s.kind === "liveOak" ? 10 : 4, top = s.y + s.h * (s.kind === "liveOak" ? 0.62 : 0.5);
      for (let k = 0; k < n; k++) { const a = rng() * 6.28, rr = 1.5 + rng() * s.h * 0.4; put("tuft", "moss", s.x + Math.cos(a) * rr, top, s.z + Math.sin(a) * rr, a); }
      if (s.kind === "cypress") for (let k = 0; k < 6; k++) { const a = rng() * 6.28, rr = 1.5 + rng() * 3; put("cone", "knee", s.x + Math.cos(a) * rr, s.y - 0.2, s.z + Math.sin(a) * rr, a); }
    } else if (s.kind === "tank" || s.kind === "stack") {
      for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.28, rr = 11 * s.s; put("pipe", "pipe", s.x + Math.cos(a) * rr, s.y + 1 + (k % 2) * 3, s.z + Math.sin(a) * rr, a + Math.PI / 2); }
      for (let k = 0; k < 4; k++) { const a = rng() * 6.28, rr = 12 * s.s; put("post", "valve", s.x + Math.cos(a) * rr, s.y, s.z + Math.sin(a) * rr, a); }
    } else if (s.kind === "crane") {
      for (let k = 0; k < 6; k++) { const [px, pz] = at((rng() - 0.5) * 30, 14 + rng() * 10); put("box", "container", px, hAt(px, pz) + (k % 3) * 2.6, pz, s.rot); }
    }
  }
  return out();
}

/** A stable digest of a chunk's detail (determinism checks). */
export function dtDigest(det) {
  let h = 2166136261 >>> 0;
  for (const f of DT_FAMILIES) { const d = det.families[f.id]; h = Math.imul(h ^ d.n, 16777619) >>> 0; for (let i = 0; i < d.mats.length; i += 7) h = Math.imul(h ^ Math.round(d.mats[i] * 1000), 16777619) >>> 0; }
  return h.toString(16);
}

/** The families' unit geometries (built per three.js instance). */
export function dtGeometries(THREE) {
  const cat = (parts) => {
    const polys = parts.map(([g, col, m]) => { const n = g.index ? g.toNonIndexed() : g.clone(); if (m) n.applyMatrix4(m); const cnt = n.attributes.position.count, cc = new Float32Array(cnt * 3); for (let i = 0; i < cnt; i++) cc.set(col ?? [1, 1, 1], i * 3); return [n.attributes.position.array, cc]; });
    const total = polys.reduce((s, [p]) => s + p.length, 0), pos = new Float32Array(total), col = new Float32Array(total);
    let o = 0; for (const [p, c] of polys) { pos.set(p, o); col.set(c, o); o += p.length; }
    const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("color", new THREE.BufferAttribute(col, 3)); out.computeVertexNormals(); return out;
  };
  const M = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
  const RX = (a, x = 0, y = 0, z = 0) => new THREE.Matrix4().makeRotationX(a).setPosition(x, y, z);
  const RY = (a) => new THREE.Matrix4().makeRotationY(a);
  const dark = [0.45, 0.36, 0.28];
  return {
    tuft: cat([[new THREE.PlaneGeometry(0.35, 0.45), null, M(0, 0.22, 0)], [new THREE.PlaneGeometry(0.35, 0.45).applyMatrix4(RY(Math.PI / 2)), null, M(0, 0.22, 0)]]),
    flower: cat([[new THREE.TetrahedronGeometry(0.12), null, M(0, 0.3, 0)]]),
    reed: cat([[new THREE.ConeGeometry(0.08, 1.4, 3, 1, true), null, M(0, 0.7, 0)]]),
    shrub: cat([[new THREE.OctahedronGeometry(0.6), null, M(0, 0.45, 0)]]),
    fence: cat([[new THREE.PlaneGeometry(1, 1), null, M(0, 0.5, 0)]]),
    lamp: cat([[new THREE.CylinderGeometry(0.08, 0.11, 6, 4, 1, true), dark, M(0, 3, 0)], [new THREE.BoxGeometry(0.9, 0.18, 0.3), [1.4, 1.4, 1.2], M(0.35, 6, 0)]]),
    post: cat([[new THREE.BoxGeometry(1, 1, 1), null, M(0, 0.5, 0)]]),
    box: cat([[new THREE.BoxGeometry(1, 1, 1), null, M(0, 0.5, 0)]]),
    pole: cat([[new THREE.CylinderGeometry(0.12, 0.16, 9, 4, 1, true), null, M(0, 4.5, 0)], [new THREE.BoxGeometry(0.12, 0.12, 2), [0.8, 0.8, 0.8], M(0, 8.6, 0)]]),
    decal: cat([[new THREE.PlaneGeometry(1, 1), null, RX(-Math.PI / 2)]]),
    cone: cat([[new THREE.ConeGeometry(0.5, 1, 4, 1, true), null, M(0, 0.5, 0)]]),
    palm: cat([[new THREE.CylinderGeometry(0.15, 0.22, 7, 3, 1, true), dark, M(0, 3.5, 0)], ...[0, 1, 2].map((k) => [new THREE.PlaneGeometry(0.8, 3.2).applyMatrix4(RX(-1.1)).applyMatrix4(RY(k * 2.09)), null, M(0, 7, 0)])]),
    tree: cat([[new THREE.CylinderGeometry(0.12, 0.18, 2.2, 3, 1, true), dark, M(0, 1.1, 0)], [new THREE.OctahedronGeometry(1.5), null, M(0, 3.2, 0)]]),
    disc: cat([[new THREE.CircleGeometry(0.5, 4), null, RX(-Math.PI / 2, 0, 0.02, 0)]]),
    pipe: cat([[new THREE.CylinderGeometry(0.2, 0.2, 1, 6, 1, true), null, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(0, 0.2, 0)]]),
  };
}

/** Mount the pool. See the header. */
export function dtMountDetail(root, THREE, parish, { tier = "high", hooks = null, frameMs = DT_BUDGET.frameMs[tier] ?? DT_BUDGET.frameMs.high, clock: clockOpt = null } = {}) {
  const h = hooks ?? NP_MASSING_HOOKS;
  const cap = DT_CAPACITY[tier] ?? DT_CAPACITY.high;
  const geos = dtGeometries(THREE);
  const solid = new THREE.MeshLambertMaterial({ vertexColors: true });
  const flat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  solid.name = "dt-solid"; flat.name = "dt-flat";
  const group = new THREE.Group(); group.name = "parish-detail"; root.add(group);
  const meshes = DT_FAMILIES.map((f) => {
    const im = new THREE.InstancedMesh(geos[f.id], f.flat ? flat : solid, Math.max(1, cap[f.id] ?? 0));
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, cap[f.id] ?? 0) * 3), 3);
    im.count = 0; im.frustumCulled = false; im.name = `detail-${f.id}`;
    group.add(im); return im;
  });
  // SMOOTH: generation is off the frame. chunkLoaded only queues the chunk; every engine update (the `streamed` hook,
  // once a frame in the app) refills the pool if a chunk finished, then runs the queued generations (dtDetailSteps)
  // until the frame's detail budget (DT_BUDGET.frameMs[tier], or `frameMs`) is spent, resuming a half-made chunk on
  // the next frame. The map keeps load order (a finished chunk fills the slot it was queued in), so once the queue is
  // empty the pool holds exactly what the one-shot fill held. frameMs: Infinity is the one-shot fill (every queued chunk
  // generated in the update that streamed it).
  // `clock` ({ now() } in ms, performance by default) is injectable: tools/check_detail.mjs drives the pool with a
  // virtual clock to prove the scheduler never overruns its budget, independent of the machine's load.
  const clock = clockOpt ?? (typeof performance !== "undefined" ? performance : Date);
  const chunks = new Map(); // key -> { key, ring, cx, cz, spots, det (null while queued) }
  const queue = [];         // keys waiting, in load order
  const slice = { deadline: Infinity, clock };
  let job = null;           // { c, gen, ms } the generation in flight
  let dirty = false, genMs = [], overflow = 0, frames = [], flushMs = [], slices = 0, stepWorst = 0;
  const fade = DT_FADE[tier] ?? DT_FADE.high;
  function cancel(key) {
    if (job?.c.key === key) { job.gen.return(); job = null; }
    const i = queue.indexOf(key); if (i >= 0) queue.splice(i, 1);
  }
  function chunkLoaded({ parish: p, chunk, spots }) {
    if (p !== parish) return;
    cancel(chunk.key);
    const old = chunks.get(chunk.key);
    if ((fade[chunk.ring] ?? 0) <= 0) { if (chunks.delete(chunk.key) && old.det) dirty = true; return; }
    if (old?.det) dirty = true; // its old instances leave the pool until the new ones are made
    chunks.set(chunk.key, { key: chunk.key, ring: chunk.ring, cx: chunk.cx, cz: chunk.cz, spots: spots ?? null, det: null });
    queue.push(chunk.key);
  }
  function chunkUnloaded({ parish: p, key }) {
    if (p !== parish) return;
    cancel(key);
    const old = chunks.get(key);
    if (chunks.delete(key) && old.det) dirty = true;
  }
  /** Run one step of the generation in flight (starting the next queued chunk if none); true when there was work. */
  function step() {
    if (!job) {
      const key = queue.shift(); if (key === undefined) return false;
      const c = chunks.get(key);
      job = { c, gen: dtDetailSteps(parish, c.cx, c.cz, tier, { ring: c.ring, spots: c.spots, slice }), ms: 0 };
    }
    const t0 = clock.now(), r = job.gen.next();
    const dt = clock.now() - t0; job.ms += dt; slices++; if (dt > stepWorst) stepWorst = dt;
    if (r.done) {
      job.c.det = r.value; job.c.spots = null; dirty = true;
      genMs.push(job.ms); if (genMs.length > 256) genMs.shift();
      job = null;
    }
    return true;
  }
  // The refill, sliced by family: a pass snapshots the finished chunks (nearest ring first) and copies one family after
  // another into its InstancedMesh until the frame's deadline; the next frame carries on with the next family. Each
  // family is replaced whole, so a frame shows every family either before or after the pass, never half of one.
  let fill = null; // { order, i, overflow } a refill pass in progress
  function fillFamily(i, order) {
    const f = DT_FAMILIES[i], im = meshes[i], max = cap[f.id] ?? 0; let n = 0, over = 0;
    for (const c of order) {
      const d = c.det.families[f.id]; if (!d.n) continue;
      const take = Math.min(d.n, max - n); if (take <= 0) { over += d.n; continue; }
      im.instanceMatrix.array.set(d.mats.subarray(0, take * 16), n * 16);
      im.instanceColor.array.set(d.cols.subarray(0, take * 3), n * 3);
      n += take; over += d.n - take;
    }
    im.count = n; im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
    return over;
  }
  /** Refill until `deadline`; true when no refill is pending. */
  function fillUntil(deadline) {
    if (!fill) {
      if (!dirty) return true;
      dirty = false;
      fill = { order: [...chunks.values()].filter((c) => c.det).sort((a, b) => a.ring - b.ring), i: 0, overflow: 0, t: 0 };
    }
    const t0 = clock.now();
    while (fill.i < DT_FAMILIES.length) { fill.overflow += fillFamily(fill.i++, fill.order); if (clock.now() >= deadline) break; }
    fill.t += clock.now() - t0;
    if (fill.i < DT_FAMILIES.length) return false;
    overflow = fill.overflow; flushMs.push(fill.t); if (flushMs.length > 256) flushMs.shift();
    fill = null;
    return true;
  }
  /** Refill the whole pool now (a pass in progress is finished first, then a fresh one if anything changed since). */
  function flush() {
    const had = dirty || !!fill;
    while (!fillUntil(Infinity));
    if (dirty) while (!fillUntil(Infinity));
    return had;
  }
  /** One frame's detail work: carry on refilling, then generate until the budget is spent. Returns its ms. */
  function frame() {
    const t0 = clock.now();
    if (frameMs === Infinity) { slice.deadline = Infinity; while (step()); flush(); }
    else {
      // The generator yields at its first checkpoint past the deadline (≤ DT_CHECK_EVERY work units, tens of µs), so
      // the deadline sits a margin inside the budget.
      slice.deadline = t0 + frameMs - DT_SLICE_MARGIN_MS;
      if (fillUntil(slice.deadline)) while (clock.now() < slice.deadline && step());
    }
    const ms = clock.now() - t0;
    frames.push(ms); if (frames.length > 512) frames.shift();
    return ms;
  }
  /** Finish every queued chunk now and refill (fast travel, tests): the one-shot fill's result. */
  function drain() { slice.deadline = Infinity; while (step()); return flush(); }
  h.chunkLoaded = chunkLoaded; h.chunkUnloaded = chunkUnloaded; h.streamed = frame;
  function stats() {
    let instances = 0, triangles = 0;
    DT_FAMILIES.forEach((f, i) => { instances += meshes[i].count; triangles += meshes[i].count * f.tris; });
    const s = [...genMs].sort((a, b) => a - b), fr = [...frames].sort((a, b) => a - b), fl = [...flushMs].sort((a, b) => a - b);
    return {
      meshes: meshes.length, instances, triangles, chunks: chunks.size, overflow, pending: queue.length + (job ? 1 : 0),
      genMedianMs: s.length ? s[s.length >> 1] : 0, genWorstMs: s.length ? s[s.length - 1] : 0,
      frameMs, frames: fr.length, frameMedianMs: fr.length ? fr[fr.length >> 1] : 0, frameWorstMs: fr.length ? fr[fr.length - 1] : 0,
      flushWorstMs: fl.length ? fl[fl.length - 1] : 0, slices, stepWorstMs: stepWorst,
    };
  }
  function capacityOk() { return DT_FAMILIES.every((f, i) => meshes[i].count <= (cap[f.id] ?? 0) && meshes[i].count <= meshes[i].instanceMatrix.count); }
  function dispose() {
    if (job) { job.gen.return(); job = null; }
    queue.length = 0;
    if (h.chunkLoaded === chunkLoaded) { h.chunkLoaded = null; h.chunkUnloaded = null; h.streamed = null; }
    root.remove(group); for (const m of meshes) m.dispose?.(); for (const g of Object.values(geos)) g.dispose(); solid.dispose(); flat.dispose();
  }
  return { flush, frame, drain, stats, capacityOk, dispose, meshes, group };
}

/**
 * The generator's parameters for the TradeQuest shared export (tools/tq_bridge.mjs, facades section `detail`): the seed
 * rule, the tiers' density and fade, the families, the per-cell table and the budgets — parameters only, never instances.
 */
export function dtExportParams() {
  return {
    owner: "DETAIL", seed: "npPrepare(parish).seed ^ chunk (cx, cz) hash, mulberry32 per chunk; one threshold per candidate (tiers and rings nest)",
    cell: DT_CELL, cellScale: DT_CELL_SCALE, density: DT_DENSITY, fade: DT_FADE, capacity: DT_CAPACITY, budget: DT_BUDGET,
    families: DT_FAMILIES.map((f) => ({ id: f.id, tris: f.tris, note: f.note })), table: DT_TABLE,
    variants: { regions: DT_LA_REGIONS.source, rules: DT_VARIANTS.map(([character, re, row]) => ({ character, name: re ? re.source : null, row })) },
    note: "Procedural and generic: seeded scatter by district character, cover, roads, water and sites; nothing records a real object.",
  };
}
