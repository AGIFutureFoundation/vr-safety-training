// BAYQUEST — the Bay Program's four mini-games (docs/consoles/BAYQUEST.md). SmartCiti.X Powered by AGI Corp.
//
//   BQ_GAMES   four side games in the shared contract (docs/skill-gates.md, KREWE's kiosk pattern):
//              each behind union stations (the gate contract), scored on safe practice (a mechanic
//              from side-game-mechanics.js, the safe-practice calls from side-games-data.js and the
//              game's own calls), rewarding a cosmetic and a stamp. BQ_GATED is the same list for
//              tools/check_gates.mjs's discovery.
//   bqGameRun(game)          -> the whole run: [{ board, prompt, options: [{ text, safe }] }]
//   bqGameScore(game, picks) -> { safe, total, score 0..100, clean } — safe practice only, never speed.
//
// Shape of a game: { id, world, kind: "side-game", site, siteName, anchors: [{ world, parish?, site }],
//   title, task, mechanic, gate: { stations, note }, pendingStations, practices, calls, reward: { cosmetic,
//   stamp }, summary, physics?, drivables?, credits: { clean, pass } }.
// `anchors` after the first are guarded second anchors (BAYMAP's Oakland districts, the San Francisco
// districts): resolve them with `npParish(parish)?.sites.find((s) => s.id === site)` and skip a miss.
// `pendingStations` are BAYKEEPER / CLEANPORTS station ids merging in parallel; the coordinator folds them
// into the gate once they resolve in the catalog. The game plays from the Bay World site today.
//
// Facts rule: no digits in any text, limits read "per the plan"; nothing here states a program figure.
// Names prefixed bq/BQ_ (one bundle scope).

import { qmPlaySteps } from "./side-game-mechanics.js";
import { qmRounds } from "./side-games-data.js";

export const BQ_WORLD = "bayworld";

const bqCall = (prompt, safe, unsafe) => ({ prompt, safe, unsafe });

const bqMake = (id, site, siteName, o) => ({
  id: `bq-${id}`, world: BQ_WORLD, kind: "side-game", site, siteName,
  anchors: [{ world: BQ_WORLD, site }, ...(o.anchors ?? [])],
  title: o.title, task: o.task, mechanic: o.mechanic, gate: o.gate, pendingStations: o.pendingStations ?? [],
  practices: o.practices, calls: o.calls, reward: { cosmetic: o.cosmetic, stamp: `bq-stamp-${id}` },
  summary: o.summary, ...(o.physics ? { physics: o.physics } : {}), ...(o.drivables ? { drivables: o.drivables } : {}),
  credits: { clean: 40, pass: 20 },
});

export const BQ_GAMES = [
  bqMake("trash-capture-cleanout", "port-maintenance-shop", "Port Maintenance Shop", {
    title: "Trash Capture Cleanout", task: "trash capture cleanout", mechanic: "lockout-steps",
    gate: { stations: ["br-trash-capture-device-service", "cs-non-entry-retrieval-and-tripod"],
      note: "The trash capture device service and non-entry retrieval stations first: the device sits in a storm drain." },
    pendingStations: ["bk-street-drain-trash-capture-cleanout"],
    anchors: [{ world: "parishes", parish: "oak-west-oakland", site: "outer-harbor-container-terminal" }],
    practices: ["traffic", "lockout", "ppe", "lift"],
    calls: [
      bqCall("The device sits in a drain at the kerb of a working street.", "Cone and sign the lane per the traffic plan before the lid comes up.", "Pull the lid first and put the cones out once you are in."),
      bqCall("The screen is packed with bottles, bags and leaves.", "Gloves and eye protection on, and use the grab tool, not your hands, for anything sharp.", "Reach in bare-handed to clear it faster."),
      bqCall("The chamber below is an enclosed space.", "Stay out and work from the surface unless the entry permit and the attendant are in place.", "Climb down for a quick look without telling anyone."),
    ],
    cosmetic: "trash capture crew patch",
    summary: "Cone the lane, lock out, glove up and clear a trash capture screen from the surface, then log what came out.",
  }),
  bqMake("rain-garden-build", "west-oakland-utility-yard", "West Oakland Utility Yard", {
    title: "Rain Garden Build", task: "rain garden build", mechanic: "survey-transect",
    gate: { stations: ["op-excavator-trench-and-utility-locate", "br-native-planting-and-erosion-mats"],
      note: "Trenching over a located utility and native planting first: a rain garden is a dig and a planting." },
    pendingStations: ["bk-bioretention-rain-garden-excavation"],
    anchors: [{ world: "parishes", parish: "sf-mission", site: null }],
    practices: ["plan", "inspect", "zone", "lift"],
    calls: [
      bqCall("The sidewalk strip is marked for a rain garden.", "Check the locate ticket against the paint and hand-dig near every marked line.", "Start the digger where the paint is faint; it is probably clear."),
      bqCall("The hole is getting deep beside the sidewalk.", "Slope or shore the sides per the plan and keep the spoil back from the edge.", "Pile the soil right on the edge so it is handy."),
      bqCall("Bags of soil mix and trays of plants arrive.", "Use the cart and lift with your legs, one bag at a time.", "Carry two bags on your shoulder to save a trip."),
    ],
    cosmetic: "rain garden trowel pin",
    summary: "Read the locate marks, dig safely beside the sidewalk, lay the soil layers and plant a rain garden that soaks up the rain.",
  }),
  bqMake("tidal-channel-dig", "estuary-shoreline-park-trailhead", "Estuary Shoreline Park Trailhead", {
    title: "Tidal Channel Dig", task: "tidal channel dig", mechanic: "line-follow",
    gate: { stations: ["br-tidal-marsh-grading-amphibious-excavator", "me-tidal-marsh-channel-restoration-day"],
      note: "Tidal marsh grading and the channel restoration day first: soft ground, tides and a buffer to keep." },
    anchors: [{ world: "parishes", parish: "oak-fruitvale-estuary", site: null }],
    practices: ["weather", "spill", "zone", "buddy"],
    calls: [
      bqCall("The marsh ground is soft and wet ahead of the machine.", "Lay the mats ahead of the tracks and drive only on them.", "Drive straight across the mud; the tracks will grip."),
      bqCall("The tide is turning sooner than the plan said.", "Stop, read the tide board and walk the crew out on the flagged path.", "Keep digging until the water reaches the tracks."),
      bqCall("A bucket of spoil is ready to swing.", "Swing it to the spoil bin on a short arc, clear of the water and the nesting buffer.", "Drop it in the channel edge; the tide will carry it off."),
    ],
    physics: { newton: "nwWorld", terraform: ["tfWaterDepthAt", "tfFlowAt"], rule: "spoil lands in the bins, never in the water" },
    cosmetic: "marsh mat badge",
    summary: "Lay mats on soft ground, dig a tidal channel to the stakes, keep spoil in the bins and walk out before the tide.",
  }),
  bqMake("zero-emission-yard-shuffle", "west-oakland-truck-yard", "West Oakland Truck Yard", {
    title: "Zero-Emission Yard Shuffle", task: "zero-emission yard shuffle", mechanic: "delivery-run",
    gate: { stations: ["et-ev-fleet-depot-charging-and-arc-flash", "po-yard-hostler-and-pedestrian-separation"],
      note: "Fleet charging safety and yard hostler moves first: the yard runs on electric equipment and walkways." },
    pendingStations: ["cp-charging-yard-safety", "cp-ze-yard-tractor-pre-use"],
    anchors: [{ world: "parishes", parish: "oak-west-oakland", site: "outer-harbor-container-terminal" }],
    practices: ["inspect", "traffic", "lockout", "comms"],
    calls: [
      bqCall("An electric yard tractor sits on its charger at the start of the shift.", "Walk round it, stop the charge at the dispenser and stow the cable before you move.", "Drive off and let the cable pull free."),
      bqCall("A charging cable lies across the lane.", "Stop, report it and route round until it is hung back on its hook.", "Drive over it slowly; the cover will hold."),
      bqCall("A worker steps into the marked crossing.", "Stop at the crossing and wait until they are clear and wave you on.", "Sound the horn and keep rolling."),
    ],
    drivables: { prefer: ["cp-ze-yard-tractor", "cp-ze-drayage-truck"], fallback: "day-cab-bobtail", rule: "drives only after its pre-use station" },
    cosmetic: "charging yard lanyard",
    summary: "Unplug and walk round an electric yard tractor, route round a cable in the lane, stop for walkers and park it back on charge.",
  }),
];

/** The same list for tools/check_gates.mjs's discovery (an export named …GATED… in a -data.js module). */
export const BQ_GATED = BQ_GAMES;
export const BQ_GAME_IDS = BQ_GAMES.map((g) => g.id);
export function bqGame(id) { return BQ_GAMES.find((g) => g.id === id) ?? null; }

/** The game's own calls as side-game rounds (same `{ prompt, options: [{ text, safe }] }` shape as qmRounds). */
export function bqCallRounds(game) {
  let h = 13;
  for (const ch of game.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (game.calls ?? []).map((c, i) => {
    const a = { text: c.safe, safe: true }, b = { text: c.unsafe, safe: false };
    return { key: `call-${i}`, prompt: c.prompt, options: ((h >> (i + 3)) & 1) ? [b, a] : [a, b] };
  });
}

/** The whole run: the mechanic's steps, the safe-practice calls, the game's calls — one score. */
export function bqGameRun(game) {
  return qmPlaySteps(game, [...qmRounds(game), ...bqCallRounds(game)]);
}

/** Score a run by safe practice only: `picks` is the option index chosen at each step. */
export function bqGameScore(game, picks = []) {
  const steps = bqGameRun(game);
  let safe = 0;
  steps.forEach((s, i) => { if (s.options[picks[i]]?.safe) safe += 1; });
  const total = steps.length;
  const score = total ? Math.round((safe / total) * 100) : 0;
  return { safe, total, score, clean: safe === total };
}

/** The safe pick at every step (for the checker and the demo run). */
export function bqSafePicks(game) { return bqGameRun(game).map((s) => s.options.findIndex((o) => o.safe)); }
