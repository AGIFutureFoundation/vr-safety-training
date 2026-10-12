// MOTORWORKS (the environment & robotics wave, prefix mv): the Motor Pool's
// vehicle classes made drivable in the 22 parish-engine maps through NEWTON's
// drive mode. This module is plain, dependency-free data and arithmetic — no
// imports, no three.js, no DOM — so TQ-BRIDGE exports it once to
// exports/shared/ and tools/check_motorworks.mjs reads it headless.
//
//   MV_HANDLING[class]  -> { mass, top, accel, brake, turnRadius }
//     Per-class handling for NEWTON's drive model (drivables-data.js's
//     dvStepDrive reads `brake` and `minRadius` when present). Game values for
//     a training world — never a maker's figure, never a measurement.
//   MV_OVERRIDES[drivableId] -> a partial handling record on top of the class.
//   MV_SITE_RULES -> [{ kinds: [site kind…], drivables: [registry id…], why }]
//     Which Motor Pool entries park at which kinds of site (a box truck at a
//     warehouse, a sweeper downtown, an electric yard tractor at the port…).
//   MV_BUDGET -> parked vehicles per map by tier and the near-ring radius.
//   mvHandling(entry) -> the handling record for a registry entry.
//   mvProfile(entry) -> the drive profile NEWTON's nwVehicleStep takes:
//     { top, accel, turn, brake, minRadius, mass } (turn from the registry).
//   mvStopDistance(h, v) / mvStopTime(h, v) -> the braking arithmetic
//     dvStepDrive integrates (coast-down 1.6 × accel plus the brake).
//   mvLivery(entry, ctx, categories) -> a colour (0xRRGGBB): PALETTE's colour
//     category for the map's region / district character when PA_CATEGORIES
//     is passed (guarded; any of its plausible shapes), else the class colour.
//
// Every top-level name is mv/MV_ (tools/bundle_webxr.py concatenates modules).

/** Handling by the registry's class word. mass kg, top m/s, accel m/s², brake m/s², turnRadius m (all game values). */
export const MV_HANDLING = {
  light: { mass: 2400, top: 18, accel: 8, brake: 7.5, turnRadius: 6.5 },
  van: { mass: 3500, top: 17, accel: 7, brake: 7, turnRadius: 7 },
  truck: { mass: 11000, top: 15, accel: 5, brake: 6, turnRadius: 9.5 },
  utility: { mass: 12000, top: 15, accel: 5, brake: 6, turnRadius: 10 },
  emergency: { mass: 15000, top: 16, accel: 5.5, brake: 6.5, turnRadius: 11 },
  transit: { mass: 14000, top: 14, accel: 4.5, brake: 5.5, turnRadius: 12 },
  tractor: { mass: 9000, top: 15, accel: 5, brake: 5.5, turnRadius: 11 },
  yard: { mass: 8000, top: 8, accel: 4, brake: 5, turnRadius: 6 },
  lift: { mass: 4500, top: 4, accel: 2.5, brake: 3.5, turnRadius: 2.5 },
  plant: { mass: 15000, top: 6, accel: 3, brake: 4, turnRadius: 7 },
  grounds: { mass: 700, top: 9, accel: 5, brake: 5, turnRadius: 3.5 },
};

/** Per-drivable adjustments on top of the class (a sweeper works at a walking pace and turns tight). */
export const MV_OVERRIDES = {
  sweeper: { top: 8, accel: 4, turnRadius: 6 },
  "fuel-truck": { top: 8, accel: 4 },
  "school-bus": { turnRadius: 11 },
  "cp-electric-yard-tractor": { accel: 4.5 },
};

/**
 * Which Motor Pool entries park at which kinds of site. The first drivable in a
 * rule is the site's vehicle; a site whose station list already names a
 * drivable's gate station prefers that drivable. Only road entries NEWTON's
 * drive mode takes (no rail, no watercraft — its drive mode keeps to land).
 */
export const MV_SITE_RULES = [
  { kinds: ["warehouse", "trucking", "industrial", "market"], drivables: ["box-truck", "delivery-van"], why: "a box truck at a warehouse or a market dock" },
  { kinds: ["workshop", "yard", "shipyard", "timber-yard", "boatyard", "plant"], drivables: ["forklift", "flatbed-truck"], why: "a forklift in a shed yard" },
  { kinds: ["port", "harbour"], drivables: ["cp-electric-yard-tractor", "yard-hostler"], why: "an electric yard tractor at the port" },
  { kinds: ["transit", "transit-barn"], drivables: ["transit-bus"], why: "a transit bus at a transit site" },
  { kinds: ["construction", "bridge-yard", "staging", "remediation"], drivables: ["crew-pickup", "dump-truck"], why: "a pickup at a construction site" },
  { kinds: ["civic", "hospitality", "hotel", "theatre", "events", "stadium"], drivables: ["sweeper"], why: "a street sweeper downtown" },
  { kinds: ["stormwater", "trash-capture", "pump", "pumping-station", "levee", "floodwall", "floodgate", "seawall"], drivables: ["water-truck", "utility-van"], why: "a service truck at a stormwater or flood-control site (the registry has no vacuum truck yet)" },
  { kinds: ["hospital", "clinic"], drivables: ["ambulance"], why: "an ambulance at a hospital bay" },
  { kinds: ["fire-station", "fire", "rescue-station"], drivables: ["fire-engine"], why: "an engine at the fire station" },
  { kinds: ["substation", "utility"], drivables: ["bucket-truck"], why: "a bucket truck at a utility yard" },
  { kinds: ["school", "campus"], drivables: ["school-bus"], why: "a school bus at a school" },
  { kinds: ["park", "recreation", "nursery", "trail", "forestry"], drivables: ["utv", "ride-on-mower"], why: "a grounds vehicle in a park" },
  { kinds: ["airport"], drivables: ["pushback-tug"], why: "a pushback tug at the airport" },
  // LA-PLAY (docs/consoles/LA-PLAY.md): the Louisiana maps' own site kinds — the energy, marsh, shipyard, hangar and
  // river sites the round-one maps added. Every drivable is an existing gated Motor Pool land entry.
  { kinds: ["fuel-farm"], drivables: ["fuel-truck", "tractor-tanker"], why: "a fuel truck at the airport's fuel farm" },
  { kinds: ["tank-farm", "compressor", "wellpad", "pipeline", "chemical", "refinery", "hazmat"], drivables: ["tractor-tanker", "crew-pickup"], why: "a tanker at a tank farm or a plant's truck rack" },
  { kinds: ["hangar", "paint-shop"], drivables: ["pushback-tug", "boom-lift"], why: "a tug and a boom lift at a hangar or paint bay" },
  { kinds: ["slip", "dredge"], drivables: ["telehandler", "flatbed-truck"], why: "a telehandler at a shipyard slip or a dredge yard" },
  { kinds: ["excavation", "mat-crossing"], drivables: ["backhoe", "skid-steer"], why: "a backhoe at an excavation or a marsh mat crossing" },
  { kinds: ["energy-storage"], drivables: ["bucket-truck", "digger-derrick"], why: "a line truck at a battery yard" },
  { kinds: ["streetcar"], drivables: ["bucket-truck"], why: "a bucket truck for the streetcar wire" },
  { kinds: ["office", "union-hall"], drivables: ["pool-sedan", "crew-pickup"], why: "a pool car at a site office or hall" },
  { kinds: ["landing", "ferry", "marina", "lock", "shoreline"], drivables: ["utility-van", "crew-pickup"], why: "a crew van at a landing, ferry or lock" },
  { kinds: ["wetland", "monitoring", "survey"], drivables: ["utv", "crew-pickup"], why: "a UTV for a marsh monitoring or survey crew" },
];

/** Parked vehicles per map (phone tier fewer), the near-ring radius (m) and the drawn meshes they may add. */
export const MV_BUDGET = { perMap: { low: 4, balanced: 8, high: 10 }, perSite: 1, nearRing: 90, prompt: 7, meshes: 2 };

/** A schematic livery per class (used when PALETTE's categories are absent). */
export const MV_CLASS_COLOUR = {
  light: 0xe8ecef, van: 0xf2f2ee, truck: 0xdfe3e6, utility: 0xf4d23a, emergency: 0xd8322c, transit: 0x2f6fb0,
  tractor: 0x9aa6b0, yard: 0x3f9a5a, lift: 0xf0a81c, plant: 0xf2b21b, grounds: 0x4f8f3a,
};

/** The handling record for a registry entry (class, then the per-drivable override). */
export function mvHandling(entry) {
  const base = MV_HANDLING[entry?.class];
  if (!base) return null;
  return { ...base, ...(MV_OVERRIDES[entry.id] ?? {}) };
}

/** The drive profile NEWTON's drive model takes: the registry's turn rate, the class's top/accel/brake/radius/mass. */
export function mvProfile(entry) {
  const h = mvHandling(entry);
  if (!h) return entry?.profile ?? null;
  return { top: h.top, accel: h.accel, turn: entry.profile?.turn ?? 1.6, brake: h.brake, minRadius: h.turnRadius, mass: h.mass };
}

/** Deceleration (m/s²) with the throttle off and the brake on: dvStepDrive's coast-down (1.6 × accel) plus the brake. */
export function mvDecel(h) { return 1.6 * h.accel + h.brake; }
/** Stopping distance (m) from speed v (m/s) under full brake. */
export function mvStopDistance(h, v) { return (v * v) / (2 * mvDecel(h)); }
/** Stopping time (s) from speed v under full brake. */
export function mvStopTime(h, v) { return v / mvDecel(h); }
/** Seconds to reach top speed from rest at full throttle. */
export function mvTimeToTop(h) { return h.top / h.accel; }

function mvHexOf(c) {
  if (typeof c === "number" && Number.isFinite(c)) return c & 0xffffff;
  if (typeof c === "string") { const m = c.trim().match(/^#?([0-9a-f]{6})$/i); if (m) return parseInt(m[1], 16); }
  if (c && typeof c === "object") return mvHexOf(c.hex ?? c.colour ?? c.color ?? c.value);
  return null;
}
function mvCategoryColours(cat) {
  const list = Array.isArray(cat) ? cat : cat?.colours ?? cat?.colors ?? cat?.palette ?? cat?.swatches ?? cat?.body ?? null;
  return (Array.isArray(list) ? list : []).map(mvHexOf).filter((v) => v !== null);
}
/** A small deterministic hash (FNV-1a) for picking a swatch. */
export function mvHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * A livery colour. `ctx` = { region, character, seed }; `categories` is
 * PALETTE's PA_CATEGORIES when present (an object keyed by name or an array of
 * { id|name, region?, characters?, colours|colors|palette }). The category
 * whose id/region/characters match the map's region or district character is
 * used; anything unreadable falls back to the class colour.
 */
export function mvLivery(entry, ctx = {}, categories = null) {
  const fallback = MV_CLASS_COLOUR[entry?.class] ?? 0xd8dde2;
  if (!categories) return fallback;
  let cats = [];
  try {
    cats = Array.isArray(categories) ? categories : Object.entries(categories).map(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? { id: k, ...v } : { id: k, colours: v }));
  } catch { return fallback; }
  const want = [ctx.character, ctx.region].filter(Boolean).map((s) => String(s).toLowerCase());
  const score = (c) => {
    const words = [c.id, c.name, c.region, ...(Array.isArray(c.characters) ? c.characters : []), ...(Array.isArray(c.regions) ? c.regions : [])].filter(Boolean).map((s) => String(s).toLowerCase());
    let best = 0;
    want.forEach((w, i) => { if (words.some((x) => x === w || x.includes(w) || w.includes(x))) best = Math.max(best, want.length - i); });
    return best;
  };
  const ranked = cats.map((c) => ({ c, s: score(c), cols: mvCategoryColours(c) })).filter((r) => r.s > 0 && r.cols.length).sort((a, b) => b.s - a.s);
  if (!ranked.length) return fallback;
  const cols = ranked[0].cols;
  return cols[mvHash(`${entry.id}:${ctx.seed ?? ""}`) % cols.length];
}

/** The rule (and the drivable ids, gate-station matches first) for a site. */
export function mvRuleFor(site) {
  const rule = MV_SITE_RULES.find((r) => r.kinds.includes(site?.kind));
  return rule ?? null;
}
