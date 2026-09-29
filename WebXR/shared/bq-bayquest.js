// BAYQUEST — the play layer around the Bay Program (docs/consoles/BAYQUEST.md). SmartCiti.X Powered by AGI Corp.
//
// SEAMS (documented shapes):
//
//   bqGames() -> BQ_GAMES (bq-games-data.js);  bqGame(id)
//   bqTrail() -> { set: BQ_TRAIL, treasures: BQ_TREASURES, found: [id], count }   the Bay Keeper's Trail
//   bqFind(treasureId) -> { ok, first, lesson, source }   records a find (per-viewer localStorage, guarded)
//   bqEarnStation(stationId, { level }) -> tyEarn's { paid, amount, duplicate }   a Bay Program station pass
//   bqEarnGame(gameId, score) -> { paid, amount, duplicate }   a game run: clean (100) pays tyPayFor(3), a pass
//        (60+) pays tyPayFor(1), less pays nothing; once per game (record `bq-game:<id>`). Crew Credits only —
//        TYCOON's play currency; nothing here reaches billing or payments.
//   BQ_BUSINESSES -> two TYCOON businesses (native plant nursery, charging-yard service stand), registered through
//        TYCOON's tyAddBusinesses; each checklist item is verbatim from its station's sims-meta tagline.
//   bqStories(pathId) -> BQ_STORIES on that path (STORYLINE's stQuestsFor shape; `roam: true` for Just Roam),
//        registered through STORYLINE's stAddStories (parish "bayworld").
//   bqDeanTemplate() -> the DEAN module template "Bay Program week"; bqApplyDean(dn) hands it to DEAN's
//        dnAddTemplate / dnModules shape when DEAN is present (guarded).
//   bqTidalDig({ swings, parish }) -> { landed: [{ x, z, inWater, inBin }], safe, total }   the tidal channel dig
//        on NEWTON bodies over TERRAFORM water (tfWaterDepthAt when a parish is given, else a schematic channel).
//   bqYardDrivable(dvById) -> the drivable the yard shuffle uses (CLEANPORTS' electric variants first, guarded).
//   bqMount({ el, world, toast, completed }) -> { refresh() }   the Bay Program board: games with their lock
//        state, the trail count, the credit ledger line.
//
// Names prefixed bq/BQ_ (one bundle scope).

import { BQ_GAMES, bqGame, bqGameScore } from "./bq-games-data.js";
import { BQ_TRAIL, BQ_TREASURES } from "./bq-trail-data.js";
import { BQ_FACTS, BQ_UNNAMED } from "./bq-facts.js";
import { tyEarn, tyPayFor, tyAddBusinesses, tyLedger, TY_CURRENCY } from "./ty-economy.js";
import { stAddStories } from "./st-stories.js";
import { qmSnapshot, qmIsOpen } from "./skill-gates.js";
import { nwWorld } from "./nw-physics.js";
import { tfWaterDepthAt } from "./tf-terraform.js";

export { BQ_GAMES, bqGame, BQ_TRAIL, BQ_TREASURES, BQ_FACTS, BQ_UNNAMED };
export function bqGames() { return BQ_GAMES; }

// ------------------------------------------------------------------ the trail

function bqStore() { try { return globalThis.localStorage ?? null; } catch (_) { return null; } }
function bqLoadFound() { try { return JSON.parse(bqStore()?.getItem(BQ_TRAIL.storageKey) ?? "[]"); } catch (_) { return []; } }
export function bqTrail() { const found = bqLoadFound(); return { set: BQ_TRAIL, treasures: BQ_TREASURES, found, count: found.length }; }
export function bqFind(treasureId) {
  const t = BQ_TREASURES.find((x) => x.id === treasureId);
  if (!t) return { ok: false };
  const found = bqLoadFound();
  const first = !found.includes(t.id);
  if (first) { found.push(t.id); try { bqStore()?.setItem(BQ_TRAIL.storageKey, JSON.stringify(found)); } catch (_) { /* per-viewer only */ } }
  return { ok: true, first, lesson: t.lesson, source: t.source };
}

// ------------------------------------------------------------------ Crew Credits

/** The Bay Program stations that pay (the games' gate stations; BAYKEEPER / CLEANPORTS ids join as they land). */
export const BQ_PAID_STATIONS = [...new Set(BQ_GAMES.flatMap((g) => [...g.gate.stations, ...g.pendingStations]))];
export const BQ_PASS_SCORE = 60;

export function bqEarnStation(stationId, { level = 1 } = {}) {
  if (!BQ_PAID_STATIONS.includes(stationId)) return { paid: false, amount: 0, duplicate: false };
  return tyEarn(stationId, { level });
}
export function bqGamePay(score) { return score >= 100 ? tyPayFor(3) : score >= BQ_PASS_SCORE ? tyPayFor(1) : 0; }
export function bqEarnGame(gameId, score) {
  if (!bqGame(gameId)) return { paid: false, amount: 0, duplicate: false };
  const pay = bqGamePay(score);
  if (!pay) return { paid: false, amount: 0, duplicate: false };
  return tyEarn(gameId, { recordId: `bq-game:${gameId}`, level: score >= 100 ? 3 : 1 });
}
/** Play a whole run: score it by safe practice and pay it once. */
export function bqPlayGame(gameId, picks) {
  const g = bqGame(gameId);
  if (!g) return null;
  const result = bqGameScore(g, picks);
  return { ...result, pay: bqEarnGame(gameId, result.score) };
}

/** Two TYCOON businesses tied to real stations (checklists verbatim from each station's sims-meta tagline). */
export const BQ_BUSINESSES = [
  {
    id: "native-plant-nursery", name: "Native plant nursery", trade: "Restoration", station: "br-native-planting-and-erosion-mats", water: false,
    open: 130, upkeep: 20, perVisit: 6,
    blurb: "Trays of marsh and bank plants grown for the restoration crews; the bank is matted before a plug goes in.",
    checklist: ["plan and nesting closure checked", "coir matting pinned top to bottom before a single plug goes in", "holes bored and moisture read at the design depth", "the drip line opened"],
  },
  {
    id: "charging-yard-stand", name: "Charging-yard service stand", trade: "Electrical", station: "et-ev-fleet-depot-charging-and-arc-flash", water: false,
    open: 170, upkeep: 28, perVisit: 8,
    blurb: "A service stand at the edge of the charging yard; nothing plugs in until the row has been walked.",
    checklist: ["the depot's energised work permit read", "the arc-rated suit and face shield on", "a cut charging cable found before anyone plugs into it", "zero energy proven on the meter", "the panel locked and tagged"],
  },
];
tyAddBusinesses?.(BQ_BUSINESSES);

// ------------------------------------------------------------------ STORYLINE side stories

const bqEnd = (kind, id, title) => ({ kind, id, title });
const bqStory = (id, path, site, siteName, character, characterName, line, prompt, branches, chain, extra = {}) => ({
  id: `bq-story-${id}`, path, parish: "bayworld", site, siteName, character, characterName, role: "Bay Program crew",
  line, handoff: { kind: "site", parish: "bayworld", site, siteName, from: character }, prompt,
  branches: branches.map((b, i) => ({ id: `${id}-${i ? "b" : "a"}`, label: b.label, end: b.end, title: b.end.title, practice: b.practice, src: { [b.end.kind]: b.end.id } })),
  kiosk: null, chain, ...extra,
});
const bqFactLine = (id) => { const f = BQ_FACTS.find((x) => x.id === id); return { text: f.text, src: { file: "WebXR/shared/bq-facts.js", fact: id, page: f.source } }; };
const bqWhyLine = (station, text) => ({ text, src: { file: "WebXR/smartcity/js/curricula.js", station } });

export const BQ_STORIES = [
  bqStory("port-drains", "union-trades", "port-container-terminal", "Port Container Terminal", "gr-bw-longshore-foreman", "Kofi",
    bqFactLine("port-trash-capture"),
    "The port's storm drains feed the Bay. Which crew do you join first?",
    [
      { label: "Service the trash capture device", end: bqEnd("station", "br-trash-capture-device-service", "Trash capture device service"), practice: "Read the service order and set the outrigger on its pad before the net comes up." },
      { label: "Walk the yard lanes with the hostler crew", end: bqEnd("station", "po-yard-hostler-and-pedestrian-separation", "Yard hostler and pedestrian separation"), practice: "Read the yard traffic plan for its walkways and blind corners before the first move." },
    ],
    [{ kind: "station", id: "br-trash-capture-device-service" }, { kind: "game", id: "bq-trash-capture-cleanout" }, { kind: "station", id: "bk-street-drain-trash-capture-cleanout", guarded: true }]),
  bqStory("charging-row", "union-trades", "west-oakland-substation-yard", "West Oakland Substation Yard", "gr-bw-journey-lineworker", "Tomas",
    bqFactLine("cleanports-equipment"),
    "Electric trucks and yard equipment all need a safe place to charge. Where do you start?",
    [
      { label: "The fleet charging row", end: bqEnd("station", "et-ev-fleet-depot-charging-and-arc-flash", "Fleet depot charging and arc flash"), practice: "Read the energised work permit and prove zero energy before the panel is touched." },
      { label: "The battery storage container", end: bqEnd("station", "battery-storage-container-commissioning", "Battery storage container commissioning"), practice: "Prove the gas detection before the doors are trusted." },
    ],
    [{ kind: "station", id: "et-ev-fleet-depot-charging-and-arc-flash" }, { kind: "game", id: "bq-zero-emission-yard-shuffle" }, { kind: "station", id: "cp-charging-yard-safety", guarded: true }]),
  bqStory("sponge-street", "k12", "fruitvale-elementary-school", "Fruitvale Elementary School", "gr-bw-teacher", "Hana",
    bqWhyLine("k12-by-what-a-pump-station-does-in-the-rain", "Rain followed from a roof to the pump station, the reason low ground needs a lift, and a model pump started in order with its screen kept clear."),
    "Where does the rain go after it hits the street? Pick a way to find out.",
    [
      { label: "Follow the rain to the pump station", end: bqEnd("station", "k12-by-what-a-pump-station-does-in-the-rain", "What a pump station does in the rain"), practice: "Start the model pump in order and keep its screen clear." },
      { label: "Test how a marsh slows a wave", end: bqEnd("station", "k12-by-wetlands-as-a-storms-speed-bump", "Wetlands as a storm's speed bump"), practice: "Run a fair test, with and without the marsh plants." },
    ],
    [{ kind: "lesson", id: "k12-es-where-the-storm-drain-goes", guarded: true }, { kind: "lesson", id: "k12-es-rain-gardens-a-sponge-in-the-sidewalk", guarded: true }, { kind: "game", id: "bq-rain-garden-build" }]),
  bqStory("marsh-nursery", "k12", "estuary-shoreline-park-trailhead", "Estuary Shoreline Park Trailhead", "gr-bw-teacher", "Hana",
    bqWhyLine("k12-by-wetlands-as-a-storms-speed-bump", "A fair wave-tank test with and without marsh plants, the wave's energy followed as it shrinks, and the restoration crew's replanting seen from the boat."),
    "The marsh is a nursery for young fish and birds. What do you want to look at?",
    [
      { label: "The wave tank test", end: bqEnd("station", "k12-by-wetlands-as-a-storms-speed-bump", "Wetlands as a storm's speed bump"), practice: "Change one thing at a time so the test is fair." },
      { label: "How mud moves with the tide", end: bqEnd("station", "k12-by-what-a-pump-station-does-in-the-rain", "What a pump station does in the rain"), practice: "Follow the water step by step and keep the screen clear." },
    ],
    [{ kind: "lesson", id: "k12-es-the-tidal-marsh-nursery", guarded: true }, { kind: "lesson", id: "k12-es-mud-on-the-move", guarded: true }, { kind: "game", id: "bq-tidal-channel-dig" }]),
  bqStory("after-the-storm", "disaster-relief", "coliseum-area-hospital", "Coliseum Area Hospital", "gr-bw-nurse", "Adaeze",
    bqWhyLine("ut-night-storm-response-crew-and-portable-generator", "A flooded access road is driven slowly and deliberately at night, and the lift station's utility feed is locked out and proven dead before the generator's cable ever touches the transfer switch."),
    "A storm has passed and the drains are choked. Which job comes first?",
    [
      { label: "Clear the street drains and debris", end: bqEnd("station", "gk-storm-cleanup-chipper-and-traffic-control", "Storm cleanup, chipper and traffic control"), practice: "Put the taper and the signs up to the traffic-control plan before the shoulder is worked." },
      { label: "Restore power to the lift station", end: bqEnd("station", "ut-night-storm-response-crew-and-portable-generator", "Night storm response and portable generator"), practice: "Lock out the utility feed and prove it dead before the generator is connected." },
    ],
    [{ kind: "station", id: "stormwater-outfall" }, { kind: "game", id: "bq-trash-capture-cleanout" }]),
  bqStory("shoreline-walk", "roam", "estuary-marina-boatyard", "Estuary Marina Boatyard", "gr-bw-pilot", "Jerome",
    bqFactLine("program"),
    "No rush. Two crews are working the shoreline today if you want to look in.",
    [
      { label: "Watch the marsh grading crew", end: bqEnd("station", "br-tidal-marsh-grading-amphibious-excavator", "Tidal marsh grading from an amphibious excavator"), practice: "Mats go down ahead of the machine and spoil goes in the bins, not the water." },
      { label: "Help the planting crew", end: bqEnd("station", "br-native-planting-and-erosion-mats", "Native planting and erosion mats"), practice: "Pin the coir matting top to bottom before a single plug goes in." },
    ],
    [{ kind: "game", id: "bq-tidal-channel-dig" }], { roam: true, prompt: null }),
];
// the Just Roam story asks nothing: its prompt is folded into a quiet sign line
BQ_STORIES[BQ_STORIES.length - 1].sign = "Two crews are working the shoreline today.";
stAddStories?.(BQ_STORIES);
export function bqStories(pathId) { return BQ_STORIES.filter((s) => s.path === pathId); }

// ------------------------------------------------------------------ DEAN "Bay Program week"

export function bqDeanTemplate() {
  return {
    id: "bq-bay-program-week", kind: "template", title: "Bay Program week", audience: ["teacher", "admin"],
    blurb: "Five days on the Bay Program's work: storm drains and trash capture, green streets, the tidal marsh, the zero-emission port, and a day to roam the trail.",
    sources: [...new Set(BQ_FACTS.map((f) => f.source))],
    days: [
      { day: 1, title: "Storm drains and trash capture", items: [{ kind: "lesson", id: "k12-es-where-the-storm-drain-goes", guarded: true }, { kind: "station", id: "br-trash-capture-device-service" }, { kind: "game", id: "bq-trash-capture-cleanout" }] },
      { day: 2, title: "Green streets", items: [{ kind: "lesson", id: "k12-es-rain-gardens-a-sponge-in-the-sidewalk", guarded: true }, { kind: "station", id: "op-excavator-trench-and-utility-locate" }, { kind: "game", id: "bq-rain-garden-build" }] },
      { day: 3, title: "The tidal marsh", items: [{ kind: "lesson", id: "k12-es-mud-on-the-move", guarded: true }, { kind: "station", id: "br-tidal-marsh-grading-amphibious-excavator" }, { kind: "game", id: "bq-tidal-channel-dig" }] },
      { day: 4, title: "The zero-emission port", items: [{ kind: "lesson", id: "k12-es-clean-air-at-the-port", guarded: true }, { kind: "station", id: "et-ev-fleet-depot-charging-and-arc-flash" }, { kind: "game", id: "bq-zero-emission-yard-shuffle" }] },
      { day: 5, title: "The Bay Keeper's Trail", items: [{ kind: "trail", id: BQ_TRAIL.id }, { kind: "story", id: "bq-story-shoreline-walk" }] },
    ],
  };
}
export function bqApplyDean(dn = globalThis) {
  const tpl = bqDeanTemplate();
  try { if (typeof dn?.dnAddTemplate === "function") return dn.dnAddTemplate(tpl); } catch (_) { /* DEAN absent or refused */ }
  return tpl;
}

// ------------------------------------------------------------------ the tidal channel dig (NEWTON + TERRAFORM)

/**
 * Swing spoil buckets and drop them. `swings`: [[x, z]] drop points in the dig's local metres. The channel is
 * water where x < 0 (schematic), or TERRAFORM's tfWaterDepthAt when `parish` is given; the spoil bins stand at
 * x in [4, 8]. A drop scores safe only when the spoil lands in a bin and not in the water.
 */
export const BQ_BINS = [{ min: [4, 0, -2], max: [8, 1.2, 2] }];
export function bqTidalDig({ swings = [[6, 0]], parish = null, origin = [0, 0] } = {}) {
  const depth = parish ? (x, z) => tfWaterDepthAt(parish, origin[0] + x, origin[1] + z) : (x) => (x < 0 ? 1.2 : 0);
  const world = nwWorld({ groundAt: () => 0, colliders: [], waterDepthAt: depth });
  const bodies = swings.map(([x, z]) => world.addBody({ pos: [x, 3, z], half: [0.3, 0.3, 0.3], mass: 40 }));
  for (let i = 0; i < 180; i++) world.step(1 / 60);
  const landed = bodies.map((b) => {
    const [x, , z] = b.pos;
    const inWater = depth(x, z) > 0;
    const inBin = BQ_BINS.some((bin) => x >= bin.min[0] && x <= bin.max[0] && z >= bin.min[2] && z <= bin.max[2]);
    return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, inWater, inBin };
  });
  return { landed, safe: landed.filter((l) => l.inBin && !l.inWater).length, total: landed.length };
}

// ------------------------------------------------------------------ the yard shuffle's drivable

export function bqYardDrivable(dvById = () => null) {
  const g = bqGame("bq-zero-emission-yard-shuffle");
  for (const id of g.drivables.prefer) { const d = dvById?.(id); if (d) return d; }
  return dvById?.(g.drivables.fallback) ?? null;
}

// ------------------------------------------------------------------ the board

export function bqMount({ el = null, world = "bayworld", toast = () => {}, completed = null } = {}) {
  function refresh() {
    if (!el) return;
    const snap = qmSnapshot();
    const trail = bqTrail();
    const bal = tyLedger().balance;
    const rows = BQ_GAMES.filter((g) => g.world === world).map((g) => {
      const open = qmIsOpen(g.gate, snap);
      return `<li data-bq-game="${g.id}">${open ? "Open" : "Locked"} · <b>${g.title}</b> at ${g.siteName} — ${g.summary}${open ? "" : ` <i>${g.gate.note}</i>`}</li>`;
    }).join("");
    el.innerHTML = `<section class="bq-board" aria-label="Bay Program play"><h3>Bay Program play</h3><ul>${rows}</ul>`
      + `<p>${BQ_TRAIL.name}: ${trail.count} of ${BQ_TRAIL.total} found.</p><p>${TY_CURRENCY}: ${bal} (a play currency).</p></section>`;
  }
  refresh();
  return { refresh, toast, completed };
}
