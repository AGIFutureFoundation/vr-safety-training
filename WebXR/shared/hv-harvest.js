// HARVEST (docs/consoles/HARVEST.md): hidden, regional and seasonal activities on the parish-engine maps — fishing
// spots with a cast-and-reel game, crab lines from docks and piers, crawfish traps and a rice season on a procedural
// field at a rural New Orleans parish edge, and "gator watch" (wildlife observation, every session) with an adult-only
// licensed-hunter / wildlife-agent version. Each spot is found by walking the water's edge (a hand-painted sign),
// each activity teaches one sourced or figure-free line, a clean run logs the catch in this browser and pays Crew
// Credits once through TYCOON's tyEarn (a play currency, never real money). Nothing blocks training.
//
// Facts rule: no regulation, season, limit, size or date is stated anywhere. The play calendar below is a game cycle,
// not the real season: real seasons, licences and limits are set by the state's wildlife and fisheries agency, and
// every activity says "check the current rules". Species are real and regional, named only as species. Spot
// placement is procedural (a bank, a levee, a pier by the water) and says so; it claims nothing about the real place.
//
// Seams (exported, documented shapes):
//   hvSpotsFor(parish) -> [{ id, parish, kind: "bank"|"levee"|"pier"|"shore"|"field", water: { name, kind, cls },
//                             position: [x, z], activities: ["fish"|"crab"|"gator"|"crawfish"|"rice"], procedural: true }]
//   hvSeasonAt(ms) -> { day, season, index }   (the play calendar: pure in ms, one play season per TYCOON week)
//   hvActivityOpen(activity, season) -> bool
//   hvGameSteps(spot, activity, { adult, season, hour }) -> [{ board, prompt, options: [{ text, safe }] }]
//   hvCatch(spot, { bait, hour, attempt }) -> species | null
//   hvFinish(spot, activity, moves, { adult, season, hour, attempt }) -> { score, clean, catch, paid, amount, line }
//   hvAdultAllowed({ profileKind, path, confirmed }) -> bool
//   hvMount({ THREE, root, parish, el, pos, toast, heightAt, tier }) -> { tick(), spots, discovered(), refresh(), play(spotId, activity) }
// Names prefixed `hv`/`HV_` (the bundler shares one scope).

import { NP_SIZE, NP_ROAD_KINDS, npWaterAt, npHeightAt, npNearestRoad, npPrepare, npPointsAlong } from "./np-parish.js";
import { npRegionOf } from "./np-parishes.js";
import { tfWaterDepthAt } from "./tf-terraform.js";
import { tyEarn, TY_DAY_SECONDS, TY_CURRENCY } from "./ty-economy.js";
import { atBand } from "./at-atmos.js";
import { gtProfile } from "./profiles.js";
import { stChosenPath } from "./st-paths.js";
import { tzHarvestRun } from "./treasures.js";

export const HV_KEY = "hv-harvest-v1";
export const HV_FIND_RADIUS = 30;
export const HV_BESIDE = 18;
export const HV_SPACING = 320;
export const HV_MAX_SPOTS = 6;

/** The state agency per region family (a real agency, named; its current rules are the only rules). */
export const HV_AGENCY = {
  "new-orleans": "the Louisiana Department of Wildlife and Fisheries",
  bay: "the California Department of Fish and Wildlife",
};
export const hvFamily = (parish) => (npRegionOf(parish) === "new-orleans" ? "new-orleans" : "bay");

/** Water classes: the engine's water kind read by region (San Francisco Bay is drawn as `gulf` on the Marina map). */
export function hvWaterClass(parish, w) {
  if (!w) return null;
  const fam = hvFamily(parish), name = String(w.name ?? "");
  if (/procedural|swale|storm drain/i.test(name)) return null;
  if (fam === "new-orleans") {
    if (w.kind === "wetland") return "marsh";
    return ["river", "lake", "canal", "bayou", "gulf"].includes(w.kind) ? w.kind : null;
  }
  if (w.kind === "wetland") return "marsh";
  if (w.kind === "bay" || w.kind === "gulf") return "bay";
  if (w.kind === "ocean") return "ocean";
  if (w.kind === "canal") return /estuary|channel|slough/i.test(name) && !/merritt/i.test(name) ? "bay" : null;
  if (w.kind === "lake") return /reservoir|lily pond|alvord|spreckels|palace|mountain lake|pine lake|lagoon|merritt/i.test(name) ? null : "lake";
  return null;
}

/** Species: real and regional, named only as species, each with the water classes it is played in. */
export const HV_SPECIES = [
  // New Orleans: the river, the brackish lake, bayous, canals and the Gulf.
  { id: "blue-catfish", name: "Blue catfish", family: "new-orleans", waters: ["river", "canal"], baits: ["cut-bait", "worm"], night: true },
  { id: "channel-catfish", name: "Channel catfish", family: "new-orleans", waters: ["river", "bayou", "canal", "lake"], baits: ["cut-bait", "worm"], night: true },
  { id: "freshwater-drum", name: "Freshwater drum", family: "new-orleans", waters: ["river"], baits: ["worm", "cut-bait"] },
  { id: "spotted-gar", name: "Spotted gar", family: "new-orleans", waters: ["river", "bayou"], baits: ["cut-bait", "lure"] },
  { id: "largemouth-bass-no", name: "Largemouth bass", family: "new-orleans", waters: ["bayou", "canal"], baits: ["lure", "worm"] },
  { id: "bluegill-no", name: "Bluegill", family: "new-orleans", waters: ["bayou", "canal"], baits: ["worm"] },
  { id: "red-drum", name: "Red drum (redfish)", family: "new-orleans", waters: ["lake", "gulf"], baits: ["shrimp", "lure"] },
  { id: "spotted-seatrout", name: "Spotted seatrout (speckled trout)", family: "new-orleans", waters: ["lake", "gulf"], baits: ["shrimp", "lure"] },
  { id: "sheepshead", name: "Sheepshead", family: "new-orleans", waters: ["lake", "gulf"], baits: ["shrimp"] },
  { id: "southern-flounder", name: "Southern flounder", family: "new-orleans", waters: ["lake", "gulf"], baits: ["shrimp", "lure"] },
  { id: "black-drum", name: "Black drum", family: "new-orleans", waters: ["lake", "gulf"], baits: ["shrimp", "cut-bait"] },
  // The Bay Area: the Bay, the Pacific shore and the freshwater lakes.
  { id: "striped-bass", name: "Striped bass", family: "bay", waters: ["bay", "ocean"], baits: ["lure", "cut-bait"] },
  { id: "california-halibut", name: "California halibut", family: "bay", waters: ["bay", "ocean"], baits: ["lure", "shrimp"] },
  { id: "leopard-shark", name: "Leopard shark", family: "bay", waters: ["bay"], baits: ["cut-bait", "shrimp"], night: true },
  { id: "bat-ray", name: "Bat ray", family: "bay", waters: ["bay"], baits: ["shrimp", "cut-bait"], night: true },
  { id: "jacksmelt", name: "Jacksmelt", family: "bay", waters: ["bay"], baits: ["shrimp"] },
  { id: "shiner-perch", name: "Shiner surfperch", family: "bay", waters: ["bay"], baits: ["worm", "shrimp"] },
  { id: "barred-surfperch", name: "Barred surfperch", family: "bay", waters: ["ocean"], baits: ["shrimp", "worm"] },
  { id: "largemouth-bass-bay", name: "Largemouth bass", family: "bay", waters: ["lake"], baits: ["lure", "worm"] },
  { id: "bluegill-bay", name: "Bluegill", family: "bay", waters: ["lake"], baits: ["worm"] },
  { id: "rainbow-trout", name: "Rainbow trout", family: "bay", waters: ["lake"], baits: ["worm", "lure"] },
  { id: "channel-catfish-bay", name: "Channel catfish", family: "bay", waters: ["lake"], baits: ["cut-bait", "worm"], night: true },
];
export const HV_CRABS = [
  { id: "blue-crab", name: "Blue crab", family: "new-orleans", waters: ["lake", "gulf", "bayou"] },
  { id: "dungeness-crab", name: "Dungeness crab", family: "bay", waters: ["bay", "ocean"] },
  { id: "red-rock-crab", name: "Red rock crab", family: "bay", waters: ["bay"] },
];
export const HV_CRAWFISH = [{ id: "red-swamp-crawfish", name: "Red swamp crawfish", family: "new-orleans", waters: ["field"] }];

/** Rods and poles and baits (general gear, no sizes). */
export const HV_RODS = [
  { id: "cane-pole", name: "Cane pole", fits: ["bayou", "canal", "lake"], kinds: ["bank", "levee"] },
  { id: "spinning-rod", name: "Spinning rod", fits: ["river", "bayou", "canal", "lake", "gulf", "bay", "ocean"], kinds: ["bank", "levee", "pier", "shore"] },
  { id: "surf-rod", name: "Surf rod", fits: ["gulf", "bay", "ocean"], kinds: ["shore", "pier"] },
];
export const HV_BAITS = [
  { id: "worm", name: "Worms" }, { id: "shrimp", name: "Shrimp" }, { id: "cut-bait", name: "Cut bait" }, { id: "lure", name: "A soft-plastic lure" },
];

/** One line per activity: sourced (a named public source) or general practice stated without figures. `{agency}` is the region's agency. */
export const HV_LINES = {
  fish: { text: "Seasons, licences and limits are set by {agency}; check the current rules. Wear a life jacket on docks and boats, look behind you before every cast, and wet your hands before you release a fish.", source: "general practice" },
  crab: { text: "Keep steady footing on a dock or pier, keep fingers clear of claws, and keep your catch cool and shaded. Seasons, licences and limits are set by {agency}; check the current rules.", source: "general practice" },
  crawfish: { text: "Many Louisiana crawfish are raised in rice fields: after the rice is harvested the field is flooded again and the crawfish grow there, a rotation farmers use.", source: "LSU AgCenter, rice and crawfish production (named public source)" },
  rice: { text: "Stay clear of moving farm machinery and its blind spots, and in the heat take water, rest and shade.", source: "OSHA heat illness prevention campaign: Water. Rest. Shade. (named public source)" },
  gator: { text: "Alligator hunting is done by licensed hunters with tags, only in the season {agency} sets; a nuisance alligator is handled by the agency's licensed agents, so call the agency and never approach.", source: "general practice", adult: true },
  "gator-watch": { text: "Watch alligators from a safe distance, never feed them, and tell {agency} about an alligator where people are.", source: "general practice" },
};
/** The treasure lines (tools/gen_treasures.mjs re-reads each verbatim): one per activity, figure-free, no agency placeholder. */
export const HV_TREASURE_LINES = {
  fish: "Wear a life jacket on docks and boats, look behind you before every cast, and wet your hands before you release a fish.",
  crab: "Keep steady footing on a dock or pier, keep fingers clear of claws, and keep your catch cool and shaded.",
  crawfish: "Many Louisiana crawfish are raised in rice fields: after the rice is harvested the field is flooded again and the crawfish grow there, a rotation farmers use.",
  rice: "Stay clear of moving farm machinery and its blind spots, and in the heat take water, rest and shade.",
  "gator-watch": "Watch alligators from a safe distance and never feed them or any wild animal.",
};
export const HV_PROCEDURAL = "Spot placement is procedural: a play sign by the water, not a claim about the real place.";
export const HV_CALENDAR_NOTE = "The play calendar is a game cycle, not the real season. Real seasons are set by the state's wildlife and fisheries agency.";
export function hvLine(activity, parish) { const l = HV_LINES[activity]; return l ? l.text.replace("{agency}", HV_AGENCY[hvFamily(parish)]) : ""; }

// ------------------------------------------------------------------ the play calendar

export const HV_SEASONS = ["winter", "spring", "summer", "fall"];
/** Which play seasons bring an activity in (fishing and gator watch run most of the year). */
export const HV_OPEN = {
  fish: ["winter", "spring", "summer", "fall"],
  crab: ["spring", "summer", "fall"],
  crawfish: ["winter", "spring"],
  rice: ["spring", "summer", "fall"],
  gator: ["fall"],
  "gator-watch": ["spring", "summer", "fall"],
};
/** The rice season's stage by play season (the general order of the work: flood, plant, tend, drain, harvest). */
export const HV_RICE_STAGE = { spring: ["flood", "plant"], summer: ["tend"], fall: ["drain", "harvest"] };

/** The play calendar at a time in ms: one play day per TYCOON day, one play season per TYCOON week. Pure. */
export function hvSeasonAt(ms) {
  const day = Math.floor(Math.max(0, Number(ms) || 0) / (TY_DAY_SECONDS * 1000));
  const index = Math.floor(day / 7) % 4;
  return { day, index, season: HV_SEASONS[index] };
}
export function hvActivityOpen(activity, season) { return (HV_OPEN[activity] ?? []).includes(season); }

// ------------------------------------------------------------------ sessions

/** Adult content only for a signed-in account, off the K-12 path, with the learner's own confirmation. Default is no. */
export function hvAdultAllowed({ profileKind = "device", path = null, confirmed = false } = {}) {
  return profileKind === "account" && path !== "k12" && confirmed === true;
}
/** The gator activity a session sees: the licensed-hunter / agent version for adults, gator watch for everyone else. */
export function hvGatorActivity(adult) { return adult ? "gator" : "gator-watch"; }

// ------------------------------------------------------------------ spots

function hvHash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const hvSpotCache = new WeakMap();

/** True when (x, z) is on a road's carriageway (with a margin). */
export function hvOnRoad(parish, x, z, margin = 3) {
  const { road, d } = npNearestRoad(parish, x, z);
  if (!road) return false;
  return d < (NP_ROAD_KINDS[road.kind]?.width ?? 8) / 2 + margin;
}
/** Dry ground: no water feature, no depth. */
export function hvDry(parish, x, z) { return !npWaterAt(parish, x, z) && tfWaterDepthAt(parish, x, z) <= 0; }
/** The nearest water within `r` metres (a ring of probes), or null: { w, cls, d }. */
export function hvWaterBeside(parish, x, z, r = HV_BESIDE) {
  for (let d = 3; d <= r; d += 3) for (let a = 0; a < 16; a++) {
    const px = x + Math.cos(a * Math.PI / 8) * d, pz = z + Math.sin(a * Math.PI / 8) * d;
    const w = npWaterAt(parish, px, pz);
    if (w && (w.kind === "wetland" || tfWaterDepthAt(parish, px, pz) > 0.2)) return { w, cls: hvWaterClass(parish, w), d };
  }
  return null;
}
function hvKindFor(cls, levees, x, z, parish) {
  if (cls === "bay" || cls === "gulf") return "pier";
  if (cls === "ocean") return "shore";
  if (cls === "river") return "levee";
  return "bank";
}
function hvActivitiesFor(parish, cls, kind) {
  const fam = hvFamily(parish), a = [];
  if (cls !== "marsh") a.push("fish");
  if (HV_CRABS.some((c) => c.family === fam && c.waters.includes(cls)) && (kind === "pier" || kind === "shore" || cls === "lake" || cls === "bayou")) a.push("crab");
  if (fam === "new-orleans" && (cls === "bayou" || cls === "marsh" || cls === "canal")) a.push("gator");
  return a;
}

/** The map's hidden spots (procedural, deterministic): bank, levee, pier and shore spots by fishable water, and on the
 *  rural New Orleans maps one rice-and-crawfish field beside a bayou or marsh. */
export function hvSpotsFor(parish) {
  if (!parish) return [];
  const hit = hvSpotCache.get(parish);
  if (hit) return hit;
  const half = (parish.size ?? NP_SIZE) / 2 - 80;
  const cands = [];
  for (const w of npPrepare(parish).water) {
    const cls = hvWaterClass(parish, w);
    if (!cls || (cls === "marsh" && hvFamily(parish) !== "new-orleans")) continue;
    const ring = w.shape[0] && w.shape[w.shape.length - 1] && (w.shape[0][0] !== w.shape[w.shape.length - 1][0] || w.shape[0][1] !== w.shape[w.shape.length - 1][1]) ? [...w.shape, w.shape[0]] : w.shape;
    for (const [bx, bz] of npPointsAlong(ring, 90)) {
      if (Math.abs(bx) > half || Math.abs(bz) > half) continue;
      for (let a = 0; a < 8; a++) {
        const px = bx + Math.cos(a * Math.PI / 4) * 9, pz = bz + Math.sin(a * Math.PI / 4) * 9;
        if (Math.abs(px) > half || Math.abs(pz) > half) continue;
        if (!hvDry(parish, px, pz) || hvOnRoad(parish, px, pz)) continue;
        const b = hvWaterBeside(parish, px, pz, 12);
        if (!b || b.w !== w) continue;
        cands.push({ x: Math.round(px), z: Math.round(pz), w, cls, h: hvHash(`${parish.id}:${Math.round(px)}:${Math.round(pz)}`) });
        break;
      }
    }
  }
  cands.sort((a, b) => a.h - b.h);
  const spots = [], perWater = new Map();
  const fam = hvFamily(parish);
  const far = (x, z) => spots.every((s) => Math.hypot(s.position[0] - x, s.position[1] - z) >= HV_SPACING);
  // Round-robin by water feature so each lake, bayou and pier edge gets its turn before any gets a second spot.
  const fishCount = () => spots.filter((s) => s.kind !== "field" && s.water.cls !== "marsh").length;
  for (let pass = 0; pass < 2; pass++) for (const c of cands) {
    if (spots.length >= HV_MAX_SPOTS + 2) break;
    const n = perWater.get(c.w) ?? 0;
    if (n > pass) continue;
    if (c.cls !== "marsh" && fishCount() >= HV_MAX_SPOTS) continue;
    if (c.cls === "marsh" && spots.some((s) => s.water.cls === "marsh")) continue;
    if (!far(c.x, c.z)) continue;
    const kind = c.cls === "marsh" ? "bank" : hvKindFor(c.cls, null, c.x, c.z, parish);
    spots.push({ id: `hv-${parish.id}-${spots.length + 1}`, parish: parish.id, family: fam, kind, water: { name: c.w.name ?? `a ${c.w.kind}`, kind: c.w.kind, cls: c.cls },
      position: [c.x, c.z], activities: hvActivitiesFor(parish, c.cls, kind), procedural: true });
    perWater.set(c.w, n + 1);
  }
  // The rice-and-crawfish field (procedural) on a rural New Orleans parish: dry ground a little back from a bayou or marsh.
  if (fam === "new-orleans" && parish.id !== "orleans") {
    const fc = cands.filter((c) => c.cls === "bayou" || c.cls === "marsh" || c.cls === "canal");
    for (const c of fc) {
      let done = false;
      for (let a = 0; a < 8 && !done; a++) {
        const x = Math.round(c.x + Math.cos(a * Math.PI / 4) * 30), z = Math.round(c.z + Math.sin(a * Math.PI / 4) * 30);
        if (Math.abs(x) > half || Math.abs(z) > half || !hvDry(parish, x, z) || hvOnRoad(parish, x, z, 12)) continue;
        if (!hvWaterBeside(parish, x, z, 45) || !far(x, z)) continue;
        spots.push({ id: `hv-${parish.id}-field`, parish: parish.id, family: fam, kind: "field", water: { name: `a rice field flooded from ${c.w.name ?? "the bayou"} (procedural)`, kind: c.w.kind, cls: "field" },
          position: [x, z], activities: ["rice", "crawfish"], procedural: true });
        done = true;
      }
      if (done) break;
    }
  }
  hvSpotCache.set(parish, spots);
  return spots;
}

// ------------------------------------------------------------------ the games (steps in side-game-mechanics.js' shape)

function hvStep(key, i, board, prompt, good, bad) {
  const flip = ((hvHash(key) >> (i + 3)) & 1) === 1;
  const a = { text: good, safe: true }, b = { text: bad, safe: false };
  return { board, prompt, options: flip ? [b, a] : [a, b] };
}
const HV_KIND_WORD = { bank: "bank", levee: "levee path", pier: "pier", shore: "beach", field: "field edge" };
/** The best bait for the spot's water (the first species' first bait by the hash) and a bait that fits nothing there. */
function hvBaits(spot, fam) {
  const sp = HV_SPECIES.filter((s) => s.family === fam && s.waters.includes(spot.water.cls));
  const ok = new Set(sp.flatMap((s) => s.baits));
  const good = [...ok][hvHash(spot.id) % Math.max(1, ok.size)] ?? "worm";
  const bad = HV_BAITS.find((b) => !ok.has(b.id))?.id ?? null;
  return { good, bad, ok };
}

/** The steps of one run. Every step has one right move; the text carries no figures. */
export function hvGameSteps(spot, activity, { adult = false, season = "summer", hour = 12 } = {}) {
  const fam = spot.family ?? "bay";
  const where = `the ${HV_KIND_WORD[spot.kind] ?? "bank"} by ${spot.water.name}`;
  const k = `${spot.id}:${activity}`;
  const S = [];
  if (activity === "fish") {
    const rod = HV_RODS.find((r) => r.fits.includes(spot.water.cls) && r.kinds.includes(spot.kind)) ?? HV_RODS[1];
    const wrong = HV_RODS.find((r) => !r.fits.includes(spot.water.cls) || !r.kinds.includes(spot.kind)) ?? HV_RODS[0];
    const { good, bad } = hvBaits(spot, fam);
    S.push(hvStep(k, 0, [`You are on ${where}.`, "The rack holds a cane pole, a spinning rod and a surf rod."], "Which rod fits this water?", `${rod.name}: it suits ${where}`, `${wrong.name}: it does not suit this spot`));
    S.push(hvStep(k, 1, [spot.kind === "pier" || spot.kind === "levee" ? "The deck is wet near the edge." : "The bank slopes to the water.", "A life jacket hangs on the post."], "Before you fish:", "Put the life jacket on and check your footing", "Leave it on the post and step to the edge"));
    S.push(hvStep(k, 2, ["The bait box is open."], "Which bait?", `${HV_BAITS.find((b) => b.id === good).name}: what fish here take`, bad ? `${HV_BAITS.find((b) => b.id === bad).name}: nothing here takes it` : "No bait at all"));
    S.push(hvStep(k, 3, ["A friend stands a little behind you."], "Ready to cast:", "Look behind you, call out, then cast", "Cast straight away"));
    S.push(hvStep(k, 4, ["A bite! The line is tight and the rod bends hard."], "Reel:", "Keep the rod up, ease off and let the drag work", "Crank as hard as you can"));
    S.push(hvStep(k, 5, ["The fish is in the net."], "Release it:", "Wet your hands and use pliers to take out the hook", "Hold it tight with dry hands and pull the hook"));
  } else if (activity === "crab") {
    S.push(hvStep(k, 0, [`You are on ${where}.`, "A crab line with a basket and a cooler with ice."], "Before you start:", "Check your footing and wear the life jacket", "Lean over the rail to see better"));
    S.push(hvStep(k, 1, ["The line goes slack, then tugs."], "Bring it up:", "Pull slowly and steadily with the basket under it", "Yank it up fast"));
    S.push(hvStep(k, 2, ["A crab is in the basket, claws up."], "Handle it:", "Pick it up from behind, fingers clear of the claws", "Grab it from the front"));
    S.push(hvStep(k, 3, ["It is warm and sunny."], "Your catch:", "Measure it against the current rules and keep it cool and shaded, or let it go", "Leave it in the sun in a bucket"));
  } else if (activity === "crawfish") {
    S.push(hvStep(k, 0, [`You are at ${spot.water.name}.`, "Rows of traps stand in the shallow water."], "Getting to the traps:", "Wear boots, walk the levee path and watch your step", "Wade in anywhere in sneakers"));
    S.push(hvStep(k, 1, ["A trap is full of crawfish."], "Empty it:", "Wear gloves and shake it into the sack", "Reach in bare-handed"));
    S.push(hvStep(k, 2, ["The sack is full and the day is warm."], "Cold chain:", "Keep the sack cool, damp and shaded", "Leave it on the truck bed in the sun"));
    S.push(hvStep(k, 3, ["You are done for the day."], "Before you eat:", "Wash your hands with soap and water", "Skip it; the water was clean"));
  } else if (activity === "rice") {
    const stages = HV_RICE_STAGE[season] ?? HV_RICE_STAGE.summer;
    const lines = {
      flood: ["The field is dry and the levees are built.", "Flood the field:", "Open the gate slowly and walk the levees to check for leaks", "Open every gate at once and leave"],
      plant: ["The seed is ready and the tractor is running.", "Near the tractor:", "Stay where the driver can see you until it stops", "Walk behind it to pick up seed"],
      tend: ["It is hot and the field is green.", "Working in the heat:", "Drink water, rest in the shade and check on your crew", "Keep going until the job is done"],
      drain: ["The rice is heading out and turning gold.", "Drain the field:", "Open the gates and let the field dry for the harvester", "Leave it flooded"],
      harvest: ["The combine is cutting the rice.", "Near the combine:", "Stay clear; it stops and shuts down before anyone clears a jam", "Pull the jam out while it runs"],
    };
    stages.forEach((st, i) => { const [b, p, g, x] = lines[st]; S.push(hvStep(k, i, [`${st[0].toUpperCase()}${st.slice(1)} (play calendar: ${season}).`, b], p, g, x)); });
    S.push(hvStep(k, stages.length, ["The rice is in. The field will be flooded again for crawfish."], "The rotation:", "Rice, then crawfish in the same field", "The field is paved over"));
  } else if (activity === "gator" && adult) {
    S.push(hvStep(k, 0, [`You ride along with a licensed hunter and a wildlife agent on ${spot.water.name}.`], "Before the season opens:", "Check the licence and tags with the agency's current rules", "Go out without tags"));
    S.push(hvStep(k, 1, ["The boat is at the launch."], "Boat check:", "Life jackets, lights, fuel and the engine cut-off lanyard on", "Skip the checklist"));
    S.push(hvStep(k, 2, ["The lines are rigged."], "Hooks and lines:", "Keep hooks covered and lines coiled; no one stands in the bight", "Leave hooks loose on the deck"));
    S.push(hvStep(k, 3, ["A caller reports an alligator by a boat launch."], "A nuisance call:", "The agency's licensed agents handle it; you keep people back", "Go and move it yourself"));
  } else {
    S.push(hvStep(k, 0, [`You are on ${where}.`, "Something long rests on the far bank."], "An alligator:", "Stay far back and watch", "Walk closer for a better look"));
    S.push(hvStep(k, 1, ["Someone has a bag of bread."], "Feeding:", "Never feed alligators or any wild animal", "Toss it some bread"));
    S.push(hvStep(k, 2, ["The alligator is near a path where people walk."], "Who to tell:", "Tell a grown-up and call the wildlife agency", "Try to shoo it away"));
  }
  return S;
}

/** The catch (deterministic): a species of the spot's water and region, weighted by the bait, night-biting fish at dusk and night. */
export function hvCatch(spot, { bait = null, hour = 12, attempt = 0, activity = "fish" } = {}) {
  const fam = spot.family ?? "bay";
  const pool = activity === "crab" ? HV_CRABS : activity === "crawfish" ? HV_CRAWFISH : HV_SPECIES;
  const list = pool.filter((s) => s.family === fam && s.waters.includes(spot.water.cls));
  if (!list.length) return null;
  const band = atBand(hour);
  const nightish = band === "dusk" || band === "night";
  const weighted = list.flatMap((s) => {
    let w = 1;
    if (bait && s.baits?.includes(bait)) w += 2;
    if (s.night && nightish) w += 2;
    return Array(w).fill(s);
  });
  return weighted[hvHash(`${spot.id}:${activity}:${bait}:${band}:${attempt}`) % weighted.length];
}

// ------------------------------------------------------------------ the log, the album and pay-once

const hvMem = { v: null };
function hvStore() { try { if (typeof localStorage !== "undefined") return localStorage; } catch { /* blocked */ } return { getItem: () => hvMem.v, setItem: (_, v) => { hvMem.v = v; } }; }
let hvStoreOverride = null;
export function hvUseStore(s) { hvStoreOverride = s; }
export function hvLoad() {
  try { const s = JSON.parse((hvStoreOverride ?? hvStore()).getItem(HV_KEY) ?? "null"); if (s && s.v === 1) return s; } catch { /* fresh */ }
  return { v: 1, found: {}, log: [], album: {}, runs: {}, adult: false };
}
export function hvSave(s) { try { s.log = s.log.slice(-200); (hvStoreOverride ?? hvStore()).setItem(HV_KEY, JSON.stringify(s)); } catch { /* full or blocked */ } }
export function hvFind(spotId) { const s = hvLoad(); if (s.found[spotId]) return false; s.found[spotId] = 1; hvSave(s); return true; }

/** Finish a run: score the moves (one index per step), log the catch and pay Crew Credits once per spot and activity on a clean run. */
export function hvFinish(spot, activity, moves = [], { adult = false, season = "summer", hour = 12, attempt = 0 } = {}) {
  const steps = hvGameSteps(spot, activity, { adult, season, hour });
  let right = 0;
  steps.forEach((st, i) => { if (st.options[moves[i]]?.safe) right += 1; });
  const clean = right === steps.length;
  const score = Math.round((right / Math.max(1, steps.length)) * 100);
  const fam = spot.family ?? "bay";
  let bait = null;
  if (activity === "fish") { const i = steps[2]?.options[moves[2]]; bait = i?.safe ? hvBaits(spot, fam).good : null; }
  const caught = clean && (activity === "fish" || activity === "crab" || activity === "crawfish") ? hvCatch(spot, { bait, hour, attempt, activity }) : null;
  const s = hvLoad();
  const key = `${spot.id}:${activity}`;
  s.runs[key] = (s.runs[key] ?? 0) + 1;
  if (caught) { s.log.push({ spot: spot.id, activity, species: caught.id, name: caught.name, day: attempt }); s.album[caught.id] = (s.album[caught.id] ?? 0) + 1; }
  hvSave(s);
  let paid = false, amount = 0;
  if (clean) { const r = tyEarn(`harvest-${activity}`, { recordId: `hv:${key}`, level: 1 }); paid = r.paid; amount = r.amount; }
  let treasure = null;
  if (clean) { try { treasure = tzHarvestRun(activity === "gator" && !adult ? "gator-watch" : activity); } catch { /* no ledger headless */ } }
  const lineKey = activity === "gator" && !adult ? "gator-watch" : activity;
  return { score, clean, catch: caught, paid, amount, treasure: treasure?.added ? treasure : null, line: HV_LINES[lineKey]?.text.replace("{agency}", HV_AGENCY[fam]) ?? "" };
}
export function hvAlbum() { return hvLoad().album; }
export function hvLog() { return hvLoad().log; }

/** Every species and crab the album can hold for a region family. */
export function hvAlbumFor(fam) { return [...HV_SPECIES, ...HV_CRABS, ...HV_CRAWFISH].filter((s) => s.family === fam); }

// ------------------------------------------------------------------ the parish mount

/** Mount the hidden spots on a parish map: one InstancedMesh of sign posts, a proximity find, and the Harvest board in `el`. */
export function hvMount({ THREE = null, root = null, parish, el = null, pos = () => null, toast = () => {}, heightAt = null, now = () => Date.now(), hour = () => 12 } = {}) {
  if (!parish) return null;
  const spots = hvSpotsFor(parish);
  const fam = hvFamily(parish);
  if (THREE && root && spots.length) {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 2.6, 1.6), new THREE.MeshLambertMaterial({ color: 0x9a6b3a }), spots.length);
    const m4 = new THREE.Matrix4();
    spots.forEach((s, i) => { const [x, z] = s.position; const y = Math.max(heightAt ? heightAt(x, z) : npHeightAt(parish, x, z), 0); m4.makeTranslation(x, y + 1.3, z); mesh.setMatrixAt(i, m4); });
    mesh.instanceMatrix.needsUpdate = true; mesh.name = "hv-spots"; root.add(mesh);
  }
  let near = null, playing = null;
  const adultNow = () => {
    let kind = "device", path = null;
    try { kind = gtProfile().kind; } catch { /* no profiles */ }
    try { path = stChosenPath() ?? null; } catch { /* no path */ }
    return hvAdultAllowed({ profileKind: kind, path, confirmed: hvLoad().adult === true });
  };
  const actName = (a, adult) => ({ fish: "Fish", crab: "Crab line", crawfish: "Run the crawfish traps", rice: "Rice season", gator: adult ? "Alligator season (licensed hunters and agents)" : "Gator watch" }[a] ?? a);
  function render() {
    if (!el) return;
    const st = hvLoad(), season = hvSeasonAt(now()).season, adult = adultNow();
    el.textContent = "";
    const head = document.createElement("p"); head.className = "eyebrow"; head.style.marginTop = "16px";
    const found = spots.filter((s) => st.found[s.id]);
    head.textContent = `Harvest · hidden spots ${found.length}/${spots.length} found · play calendar: ${season}`;
    const note = document.createElement("p"); note.className = "note";
    note.textContent = spots.length ? `${found.length < spots.length ? "Walk the banks, levees and piers to find the hand-painted signs. " : ""}${HV_CALENDAR_NOTE} ${HV_PROCEDURAL} Album: ${Object.keys(st.album).filter((id) => hvAlbumFor(fam).some((s) => s.id === id)).length}/${hvAlbumFor(fam).length}.` : "No fishable water on this map.";
    el.append(head, note);
    if (playing) { el.append(renderRun()); return; }
    for (const s of found) {
      const row = document.createElement("div"); row.className = "row"; row.style.flexWrap = "wrap";
      const lab = document.createElement("span"); lab.className = "fine"; lab.textContent = `${s.kind === "field" ? "Field" : HV_KIND_WORD[s.kind]} by ${s.water.name}: `;
      row.append(lab);
      for (const a of s.activities) {
        const act = a === "gator" ? hvGatorActivity(adult) : a;
        const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = actName(a, adult);
        const open = hvActivityOpen(act, season);
        b.disabled = !open; if (!open) b.title = "Not in this play season";
        b.addEventListener("click", () => play(s.id, a));
        row.append(b);
      }
      el.append(row);
    }
    let kind = "device"; try { kind = gtProfile().kind; } catch { /* none */ }
    if (fam === "new-orleans" && kind === "account") {
      const b = document.createElement("button"); b.className = "btn"; b.type = "button";
      b.textContent = st.adult ? "Adult content: on (tap to switch off)" : "I am an adult learner: show the alligator season version";
      b.addEventListener("click", () => { const s = hvLoad(); s.adult = !s.adult; hvSave(s); render(); });
      el.append(b);
    }
  }
  function renderRun() {
    const box = document.createElement("div");
    const { spot, activity, steps, moves } = playing;
    const i = moves.length;
    if (i >= steps.length) {
      const r = hvFinish(spot, activity, moves, { adult: adultNow(), season: hvSeasonAt(now()).season, hour: hour(), attempt: hvSeasonAt(now()).day });
      const p = document.createElement("p");
      p.textContent = `${r.clean ? "Clean run" : "Run finished"} · ${r.score}%${r.catch ? ` · caught and logged: ${r.catch.name}${activity === "fish" ? " (released)" : ""}` : ""}${r.paid ? ` · +${r.amount} ${TY_CURRENCY}` : ""}. ${r.line}`;
      const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = "Back";
      b.addEventListener("click", () => { playing = null; render(); });
      box.append(p, b);
      if (r.paid) toast(`Harvest: +${r.amount} ${TY_CURRENCY}.`);
      else if (r.treasure) toast("Harvest: a treasure for the Treasure Map.");
      playing.done = true;
      return box;
    }
    const st = steps[i];
    for (const l of st.board) { const p = document.createElement("p"); p.className = "fine"; p.textContent = l; box.append(p); }
    const q = document.createElement("p"); q.textContent = st.prompt; box.append(q);
    st.options.forEach((o, j) => { const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = o.text; b.addEventListener("click", () => { moves.push(j); render(); }); box.append(b); });
    return box;
  }
  function play(spotId, activity) {
    const spot = spots.find((s) => s.id === spotId); if (!spot) return false;
    const adult = adultNow();
    const act = activity === "gator" && !adult ? "gator-watch" : activity;
    playing = { spot, activity: act, steps: hvGameSteps(spot, act, { adult, season: hvSeasonAt(now()).season, hour: hour() }), moves: [] };
    render(); return true;
  }
  function tick() {
    const p = pos(); if (!p) return;
    let best = null, bd = Infinity;
    for (const s of spots) { const d = Math.hypot(s.position[0] - p[0], s.position[1] - p[1]); if (d < bd) { bd = d; best = s; } }
    const n = bd <= HV_FIND_RADIUS ? best : null;
    if (n && n !== near) {
      const first = hvFind(n.id);
      toast(`${first ? "Found a hidden spot" : "Harvest spot"}: a hand-painted sign on the ${HV_KIND_WORD[n.kind]} by ${n.water.name}. Menu, then Play, then Harvest.`, 6000);
      if (first) render();
    }
    near = n;
  }
  const timer = typeof setInterval === "function" && el ? setInterval(tick, 1000) : null;
  render();
  return { spots, tick, refresh: render, play, discovered: () => spots.filter((s) => hvLoad().found[s.id]).map((s) => s.id), stop: () => timer && clearInterval(timer), state: () => ({ playing: playing ? { spot: playing.spot.id, activity: playing.activity, step: playing.moves.length, of: playing.steps.length } : null }) };
}
