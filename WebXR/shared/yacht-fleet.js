import { motorYacht, flCanvasMat, flPanel, flHex, flCss } from "./fleet.js";
import { box, cyl } from "./kit.js";
import { signFace } from "./kit.js";
import { BAY_SITES } from "./bayworld-data.js";

// The yacht fleet — twelve individual motor yachts, each a variant of
// shared/fleet.js's one motorYacht builder (never a new builder: FLEET_BUDGET
// does not change). A variant is livery (hull gelcoat, trim stripe), a
// flybridge style (open — a folded canvas bimini frame aft; hardtop — the
// arch's hardtop carried further aft), a length scale in a safe range, the
// yacht's own name on the transom (a signFace canvas, the same way a station
// paints a sign) and a burgee — a small pennant in the yacht's own colour at
// the masthead. Every name is invented for this platform; no real boat, club,
// builder or person is named or implied, and no real emblem is drawn.
//
// Each yacht has a home berth: a site id from shared/bayworld-data.js — the
// island yacht harbour, the estuary marina boatyard, the north marina pier or
// the south shoreline marina — plus the water slot the yacht floats in beside
// that site (RG_BERTHS; the site itself sits on the quay), a crew role list
// and the hosted events (WebXR/regatta/js/events.js) it is rostered for.
//
// Pure data plus one small builder wrapper: YACHT_FLEET and the lookups have
// no three.js in them, so tools/check_regatta.mjs reads them in plain Node;
// buildYacht() is the only thing here that touches the scene.

/** Length scale a variant may take: a 24 m hull between about 20 and 28 m. */
export const RG_YACHT_LENGTH_RANGE = [0.85, 1.15];

/**
 * Where each home berth's yachts float: the water point beside the quay site
 * (`water: [x, z]`), the heading the row of slots faces and the spacing along
 * the row, on the same shoreline shared/bayworld.js's buildWater() lays. The
 * checker holds every slot to water inside BAY_BOUNDS.
 */
export const RG_BERTHS = {
  "island-yacht-harbor": { water: [40, 575], heading: 0, spacing: 14, along: [1, 0] },
  "estuary-marina-boatyard": { water: [60, 350], heading: Math.PI, spacing: 14, along: [1, 0] },
  "north-marina-pier": { water: [-950, -600], heading: Math.PI / 2, spacing: 14, along: [0, 1] },
  "south-shoreline-marina": { water: [740, 750], heading: Math.PI, spacing: 14, along: [1, 0] },
};

/** The twelve yachts. `hull`/`trim`/`burgee` are hex colours; `length` is a
 *  scale inside RG_YACHT_LENGTH_RANGE; `flybridge` is "open" or "hardtop". */
export const YACHT_FLEET = [
  { id: "rg-saltmarsh-heron", name: "Saltmarsh Heron", unit: "RG-01", hull: 0xf4f5f2, trim: 0x2b6f9e, burgee: 0x2b6f9e, flybridge: "hardtop", length: 1.0,
    berth: "island-yacht-harbor", slot: 0, crew: ["skipper", "mate", "deckhand", "steward"], events: ["rg-family-day-cruise", "rg-regatta-day"] },
  { id: "rg-quiet-fathom", name: "Quiet Fathom", unit: "RG-02", hull: 0x1f3a5a, trim: 0xd9c27a, burgee: 0xd9c27a, flybridge: "open", length: 0.92,
    berth: "island-yacht-harbor", slot: 1, crew: ["skipper", "mate", "deckhand"], events: ["rg-sunset-safety-cruise", "rg-regatta-day"] },
  { id: "rg-cinder-gull", name: "Cinder Gull", unit: "RG-03", hull: 0x2a2f36, trim: 0xf06a2b, burgee: 0xf06a2b, flybridge: "hardtop", length: 1.08,
    berth: "island-yacht-harbor", slot: 2, crew: ["skipper", "mate", "engineer", "deckhand", "steward"], events: ["rg-crew-training-day", "rg-regatta-day"] },
  { id: "rg-estuary-ember", name: "Estuary Ember", unit: "RG-04", hull: 0x8a2f2a, trim: 0xf2e6c8, burgee: 0xf2c14b, flybridge: "open", length: 0.88,
    berth: "estuary-marina-boatyard", slot: 0, crew: ["skipper", "deckhand", "steward"], events: ["rg-family-day-cruise", "rg-harbour-cleanup-flotilla"] },
  { id: "rg-kelp-lantern", name: "Kelp Lantern", unit: "RG-05", hull: 0x2f5d45, trim: 0xe9ebe6, burgee: 0x59c97b, flybridge: "hardtop", length: 1.0,
    berth: "estuary-marina-boatyard", slot: 1, crew: ["skipper", "mate", "deckhand"], events: ["rg-harbour-cleanup-flotilla", "rg-regatta-day"] },
  { id: "rg-morning-halyard", name: "Morning Halyard", unit: "RG-06", hull: 0xe9e4d6, trim: 0x8a2f2a, burgee: 0x8a2f2a, flybridge: "open", length: 1.12,
    berth: "estuary-marina-boatyard", slot: 2, crew: ["skipper", "mate", "engineer", "steward"], events: ["rg-sunset-safety-cruise", "rg-crew-training-day"] },
  { id: "rg-windrow-tern", name: "Windrow Tern", unit: "RG-07", hull: 0xdfe6ec, trim: 0x233a52, burgee: 0x3b7bbf, flybridge: "hardtop", length: 0.95,
    berth: "north-marina-pier", slot: 0, crew: ["skipper", "deckhand"], events: ["rg-regatta-day", "rg-crew-training-day"] },
  { id: "rg-blue-sounding", name: "Blue Sounding", unit: "RG-08", hull: 0x3b7bbf, trim: 0xf4f5f2, burgee: 0xf4f5f2, flybridge: "open", length: 1.04,
    berth: "north-marina-pier", slot: 1, crew: ["skipper", "mate", "deckhand", "steward"], events: ["rg-sunset-safety-cruise", "rg-harbour-cleanup-flotilla"] },
  { id: "rg-fogline-drift", name: "Fogline Drift", unit: "RG-09", hull: 0x9aa6ad, trim: 0x2a2f36, burgee: 0x59c9c9, flybridge: "hardtop", length: 0.9,
    berth: "north-marina-pier", slot: 2, crew: ["skipper", "mate", "engineer"], events: ["rg-regatta-day", "rg-family-day-cruise"] },
  { id: "rg-harbour-plover", name: "Harbour Plover", unit: "RG-10", hull: 0xf2c14b, trim: 0x2b3138, burgee: 0x2b3138, flybridge: "open", length: 0.86,
    berth: "south-shoreline-marina", slot: 0, crew: ["skipper", "deckhand", "steward"], events: ["rg-family-day-cruise", "rg-crew-training-day"] },
  { id: "rg-slack-water", name: "Slack Water", unit: "RG-11", hull: 0x4a5a4a, trim: 0xdfe6ec, burgee: 0x4fd6a5, flybridge: "hardtop", length: 1.14,
    berth: "south-shoreline-marina", slot: 1, crew: ["skipper", "mate", "engineer", "deckhand", "steward"], events: ["rg-sunset-safety-cruise", "rg-regatta-day"] },
  { id: "rg-amber-reach", name: "Amber Reach", unit: "RG-12", hull: 0xc9a06a, trim: 0x6e3328, burgee: 0xf07a1f, flybridge: "open", length: 0.98,
    berth: "south-shoreline-marina", slot: 2, crew: ["skipper", "mate", "deckhand"], events: ["rg-harbour-cleanup-flotilla", "rg-regatta-day"] },
];

/** The yacht with this id, or null. */
export function yachtById(id) { return YACHT_FLEET.find((y) => y.id === id) ?? null; }

/** The Bay World site a yacht is berthed at (its quay), or null. */
export function rgYachtBerthSite(yacht) { return BAY_SITES.find((s) => s.id === yacht?.berth) ?? null; }

/** The water position and heading a yacht floats at in its home berth. */
export function rgYachtBerthPose(yacht) {
  const b = RG_BERTHS[yacht.berth];
  if (!b) return null;
  const s = (yacht.slot ?? 0) * b.spacing;
  return { x: b.water[0] + b.along[0] * s, z: b.water[1] + b.along[1] * s, heading: b.heading };
}

/** Yachts rostered for a hosted event id. */
export function rgYachtsForEvent(eventId) { return YACHT_FLEET.filter((y) => y.events.includes(eventId)); }

function rgClampLength(k) {
  const [lo, hi] = RG_YACHT_LENGTH_RANGE;
  return Math.max(lo, Math.min(hi, Number.isFinite(k) ? k : 1));
}

/**
 * Builds one yacht of the fleet at (x, y, z) facing `heading` (radians about
 * Y; the bow faces +Z at heading 0, as every fleet builder does). Returns the
 * motorYacht group with `userData.yacht` set to the fleet entry, scaled to
 * the yacht's length, with its transom name board, its burgee and its
 * flybridge style added on top of the baked shell. `y` is normally minus the
 * hull's draft (userData.draft × length) so the boot-top sits at the water.
 */
export function buildYacht(parent, id, x, y, z, heading = 0) {
  const yacht = yachtById(id);
  if (!yacht) throw new Error(`yacht-fleet: unknown yacht "${id}"`);
  const k = rgClampLength(yacht.length);
  const root = motorYacht(parent, x, y, z, {
    ry: heading,
    livery: { colour: yacht.hull, accent: yacht.trim, fleetName: yacht.name.toUpperCase(), unitNumber: yacht.unit },
  });
  root.scale.set(k, k, k);
  root.userData.yacht = yacht;
  root.userData.lengthScale = k;
  root.userData.draft = (root.userData.draft ?? 1.2) * k;
  // The transom name board: the yacht's own name over the swim platform,
  // facing aft, in the yacht's trim colour on a pale board.
  const board = flCanvasMat(`yacht|name|${yacht.id}`, 256, 64,
    signFace(yacht.name, { bg: "#f4f2ea", fg: flCss(flHex(yacht.trim)), accent: flCss(flHex(yacht.trim)), scale: 0.5 }),
    { rough: 0.45, metal: 0.1 });
  flPanel(root, 2.6, 0.55, 0, 2.05, -12.05, board, "-z");
  // The burgee: a small pennant at the masthead in the yacht's own colour.
  box(root, 0.02, 0.5, 0.7, -0.6, 8.1, -3.05, yacht.burgee, { rough: 0.85, finish: "painted" });
  if (yacht.flybridge === "open") {
    // Open flybridge: a folded canvas bimini frame at the aft flybridge rail.
    for (const sx of [1, -1]) cyl(root, 0.03, 0.03, 1.2, sx * 2.2, 5.5, -6.0, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    cyl(root, 0.14, 0.14, 4.3, 0, 6.1, -6.0, flHex(yacht.trim), { rough: 0.85, seg: 10 }).rotation.z = Math.PI / 2;
  } else {
    // Hardtop: the arch's roof carried aft over the flybridge bench.
    box(root, 4.0, 0.1, 3.0, 0, 7.05, -4.9, 0xe9ebe6, { rough: 0.4, metal: 0.15, finish: "painted" });
    for (const sx of [1, -1]) cyl(root, 0.05, 0.05, 2.2, sx * 1.9, 5.95, -6.2, 0xe9ebe6, { rough: 0.4, metal: 0.15, seg: 8 });
  }
  return root;
}
