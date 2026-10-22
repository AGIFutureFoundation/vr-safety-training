// KREWE — kiosks, mini-games and side quests at the parish sites (docs/consoles/KREWE.md).
//
//   KW_KIOSKS     five mini-games at real parish sites, in the shared side-game contract
//                 (docs/skill-gates.md): each behind union stations (the gate contract),
//                 scored on safe practice (a mechanic from side-game-mechanics.js, the
//                 safe-practice calls and the kiosk's own calls), each rewarding a cosmetic
//                 and a stamp. KW_GATED is the same list for check_gates's discovery.
//   KW_QUESTS     ten side quests, each a chain: a K-12 lesson → a union station → a mini-game.
//                 The lesson slot holds BAYOU's K-12 station id (`k12-by-<topic>`, reconciled by the
//                 coordinator from BAYOU's hand-back; the stations land when BAYOU's branch merges).
//   kwKioskSpots(parishData)   where each kiosk stands in a parish data module (bound through
//                 SECONDLINE's slResolveSite), for the world, the HUD and GRIOT.
//   kwGriotSites(parishData)   site records in grMount's documented shape so a GRIOT parish
//                 character (keyed by site kind) stands at each kiosk.
//
// Facts rule: places by public name only, no figures, no dates; every call is a plain safe
// practice read "per the plan". No three.js here. Names prefixed kw/KW_ (one bundle scope).

import { slSiteName, slResolveSite, slGameById } from "./sl-parish-play.js";
import { lkStationLink } from "./links.js";
import { qmSnapshot, qmIsOpen } from "./skill-gates.js";

export const KW_WORLD = "parishes";
export const KW_PAGE = "parishes.html";

// ------------------------------------------------------------------ kiosks

const kwCall = (prompt, safe, unsafe) => ({ prompt, safe, unsafe });

/**
 * A kiosk: `{ id, world, kind: "side-game", parish, site, siteName, title, task, mechanic, gate,
 * practices, calls, reward: { cosmetic, stamp }, summary, character, kit, drivable? }`.
 * `character` is the GRIOT site kind whose character stands at it; `kit` the KREWE kit beside it.
 */
const kwMakeKiosk = (id, parish, site, o) => ({
  id: `kw-${id}`, world: KW_WORLD, kind: "side-game", parish, site, siteName: slSiteName(parish, site),
  title: o.title, task: o.task, mechanic: o.mechanic, gate: o.gate, practices: o.practices, calls: o.calls,
  reward: { cosmetic: o.cosmetic, stamp: `kw-stamp-${id}` }, summary: o.summary, character: o.character, kit: o.kit,
  ...(o.drivable ? { drivable: o.drivable } : {}),
});

export const KW_KIOSKS = [
  kwMakeKiosk("sandbag-relay", "orleans", "levee-crew", {
    title: "Sandbag Relay", task: "sandbag relay", mechanic: "delivery-run", character: "levee", kit: "kwLeveeWall",
    drivable: "flatbed-truck",
    gate: { stations: ["br-levee-inspection-and-seepage", "tdl-trailer-loading-and-dock-plate"],
      note: "Levee inspection first, then load securement: the flatbed brings the bags, the crew builds the line." },
    practices: ["plan", "lift", "traffic"],
    calls: [
      kwCall("The flatbed from the Motor Pool backs up to the levee toe with the bags.", "Use a spotter, stop it clear of the crew and chock it before anyone unloads.", "Wave it in close so the bags land right beside the line."),
      kwCall("A bag is heavy and the line is long.", "Pass it hand to hand, lift with your legs and keep your back straight.", "Carry two at a time to finish sooner."),
      kwCall("The bags go down on the wet spot the inspector flagged.", "Lay them in rows with the seams staggered, the way the inspector shows you.", "Pile them in a heap as high as you can reach."),
    ],
    cosmetic: "sandbag crew armband",
    summary: "A Motor Pool flatbed delivers the bags; the crew passes them hand to hand and lays a staggered row where the inspector flagged.",
  }),
  kwMakeKiosk("pump-startup", "jefferson", "drainage-canal-pumps", {
    title: "Pump Start-Up Order", task: "pump start-up", mechanic: "lockout-steps", character: "pump-station", kit: "kwPumpHouse",
    gate: { stations: ["stormwater-outfall", "cs-non-entry-retrieval-and-tripod"],
      note: "The stormwater outfall and the non-entry retrieval stations before you start a pump." },
    practices: ["plan", "lockout", "comms"],
    calls: [
      kwCall("Rain is coming and the operator says the pumps start soon.", "Check the intake screen is clear and the locks are off only when the whole crew is out.", "Start the pump and look at the screen afterwards."),
      kwCall("The pump is ready to prime.", "Follow the start-up order on the card: vent, prime, then start.", "Skip the prime; it will catch once it spins."),
      kwCall("The pump is running.", "Watch the gauge and the discharge, and call the operator if either looks wrong.", "Walk away; a running pump looks after itself."),
    ],
    cosmetic: "pump watch lanyard",
    summary: "Start the canal pumps in the card's order: clear the screen, remove locks with the crew out, vent, prime, start, watch the gauge.",
  }),
  kwMakeKiosk("floodgate-closeout", "st-bernard", "floodgate-station", {
    title: "Floodgate Close-Out", task: "floodgate close-out", mechanic: "switching-order", character: "levee", kit: "kwFloodgate",
    gate: { stations: ["tide-gate", "valve-vault"],
      note: "The tide gate and valve vault stations before you work the close-out checklist." },
    practices: ["plan", "zone", "comms"],
    calls: [
      kwCall("The gate is about to swing shut across the road.", "Clear the gate's path, set the barriers and call it clear before it moves.", "Close it while a car is still passing; it moves slowly."),
      kwCall("The gate is shut.", "Check the seal along its whole edge and tick each line of the checklist.", "Glance at it from the truck and call it done."),
      kwCall("The checklist has one line you cannot tick.", "Stop, tell the gate operator and fix it before signing the close-out.", "Sign it anyway; the rest looks fine."),
    ],
    cosmetic: "gate crew patch",
    summary: "Close the floodgate by the checklist: clear the path, swing it with a read-back, check the seal, sign every line.",
  }),
  kwMakeKiosk("container-sort", "orleans", "port-terminal", {
    title: "Container Sort", task: "container sort", mechanic: "lift-sequencer", character: "port", kit: "kwShrimpBoat",
    gate: { stations: ["container-lashing", "dock-crane"],
      note: "Container lashing and the dock crane before you sort the stacks." },
    practices: ["lift", "zone", "inspect"],
    calls: [
      kwCall("Boxes arrive for three different ships.", "Read each box's label and sort it into its ship's row.", "Stack them wherever there is room and sort them later."),
      kwCall("A heavy box and a light box go on the same stack.", "Put the heavy box low and the light box on top, per the stow plan.", "Put the light box under the heavy one; it fits better."),
      kwCall("A lashing rod on a stack looks bent.", "Tag it out and ask for a new one before the stack is locked.", "Leave it; the others will hold."),
    ],
    cosmetic: "wharf sorter's cap",
    summary: "Sort the wharf's boxes by ship and weight: read the label, heavy low, light high, every lashing checked.",
  }),
  kwMakeKiosk("ferry-lineup", "plaquemines", "ferry-landing", {
    title: "Ferry Line-Up", task: "ferry line-up", mechanic: "traffic-zone", character: "port", kit: "kwFerryLanding",
    gate: { stations: ["mw-ferry-deckhand-and-passenger-safety"],
      note: "The ferry deckhand and passenger safety station before you line up the deck." },
    practices: ["traffic", "comms", "weather"],
    calls: [
      kwCall("Cars and walkers wait at the landing.", "Walkers board on their own path, cars wait in their lanes until you wave them on.", "Let everyone on at once to save time."),
      kwCall("A car rolls toward the ramp before the deck is ready.", "Hold up the stop sign and keep it back until the ramp is down and chained.", "Wave it on; the ramp is nearly down."),
      kwCall("The deck is full.", "Count against the plan and close the gate when the count says full.", "Squeeze one more car on; there is a gap."),
    ],
    cosmetic: "ferry deckhand's whistle",
    summary: "Line up the ferry deck: walkers apart, cars in lanes, nothing on before the ramp is chained, count to the plan and close the gate.",
  }),
];

/** The same list for tools/check_gates.mjs's discovery (an export named …GATED… in a -data.js module). */
export const KW_GATED = KW_KIOSKS;
export const KW_KIOSK_IDS = KW_KIOSKS.map((k) => k.id);
export function kwKiosk(id) { return KW_KIOSKS.find((k) => k.id === id) ?? null; }
export function kwKiosksFor(parishId, siteId = null) { return KW_KIOSKS.filter((k) => k.parish === parishId && (!siteId || k.site === siteId)); }

/** The kiosk's own calls as side-game rounds (same `{ prompt, options: [{ text, safe }] }` shape as qmRounds). */
export function kwCallRounds(kiosk) {
  let h = 11;
  for (const ch of kiosk.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (kiosk.calls ?? []).map((c, i) => {
    const a = { text: c.safe, safe: true }, b = { text: c.unsafe, safe: false };
    return { key: `call-${i}`, prompt: c.prompt, options: ((h >> (i + 3)) & 1) ? [b, a] : [a, b] };
  });
}

/** The stamps earned so far: a kiosk's stamp is earned by its first clean run (a gate snapshot's questsDone). */
export function kwStampsEarned(snap) {
  const done = snap?.questsDone ?? new Set();
  return KW_KIOSKS.filter((k) => done.has(k.id)).map((k) => k.reward.stamp);
}

// ------------------------------------------------------------------ side quests: lesson → station → game

/** BAYOU's K-12 lesson stations (ids from BAYOU's hand-back, reconciled by the coordinator). */
export const KW_BAYOU_LESSONS = [
  "k12-by-how-a-levee-holds-water-back", "k12-by-what-a-pump-station-does-in-the-rain", "k12-by-wetlands-as-a-storms-speed-bump", "k12-by-the-rivers-current-and-a-pilots-job", "k12-by-a-family-readiness-plan", "k12-by-the-water-cycle-from-lake-to-tap",
  "k12-by-a-streetcar-timetable", "k12-by-a-ferry-timetable-and-the-tide", "k12-by-a-shrimp-boats-fair-count", "k12-by-reading-a-flood-maps-colours", "k12-by-sorting-containers-at-the-port", "k12-by-measuring-a-floodwall-in-steps",
];

const kwMakeQuest = (id, title, parish, site, giver, lesson, station, game, text) => ({
  id: `kw-q-${id}`, kind: "side-quest", world: KW_WORLD, title, parish, site, giver,
  steps: [
    { type: "goto", parish, site, text: `Meet ${giver} at ${slSiteName(parish, site)}.` },
    { type: "lesson", lesson, text: text[0] },
    { type: "station", station, text: text[1] },
    { type: "game", game, text: text[2] },
  ],
  reward: { stamp: `kw-stamp-q-${id}` },
});

export const KW_QUESTS = [
  kwMakeQuest("sandbag-line", "Hold the Line", "orleans", "levee-crew", "the levee inspector", "k12-by-how-a-levee-holds-water-back", "br-levee-inspection-and-seepage", "kw-sandbag-relay",
    ["Learn how a levee holds the water back.", "Walk the levee with the inspection station.", "Build the sandbag line where the inspector flags."]),
  kwMakeQuest("rain-night-pumps", "Rain Night Pumps", "jefferson", "drainage-canal-pumps", "the drainage operator", "k12-by-what-a-pump-station-does-in-the-rain", "stormwater-outfall", "kw-pump-startup",
    ["Learn what a pump station does when it rains.", "Do the stormwater outfall station.", "Start the pumps in the right order."]),
  kwMakeQuest("close-the-gate", "Close the Gate", "st-bernard", "floodgate-station", "the gate operator", "k12-by-measuring-a-floodwall-in-steps", "tide-gate", "kw-floodgate-closeout",
    ["Measure a floodwall in steps.", "Do the tide gate station.", "Work the floodgate close-out checklist."]),
  kwMakeQuest("box-by-box", "Box by Box", "orleans", "port-terminal", "the terminal superintendent", "k12-by-sorting-containers-at-the-port", "container-lashing", "kw-container-sort",
    ["Learn how the port sorts its boxes.", "Do the container lashing station.", "Sort the wharf's boxes by ship and weight."]),
  kwMakeQuest("ferry-morning", "Ferry Morning", "plaquemines", "ferry-landing", "the ferry mate", "k12-by-a-ferry-timetable-and-the-tide", "mw-ferry-deckhand-and-passenger-safety", "kw-ferry-lineup",
    ["Read the ferry's timetable and the tide.", "Do the ferry deckhand station.", "Line up the deck for the crossing."]),
  kwMakeQuest("marsh-speed-bump", "The Marsh Speed Bump", "orleans", "wetlands-restoration", "the restoration crew lead", "k12-by-wetlands-as-a-storms-speed-bump", "marsh-transect-survey", "sl-orleans-marsh-count",
    ["Learn how wetlands slow a storm down.", "Do the marsh transect survey station.", "Count the marsh along the line."]),
  kwMakeQuest("pilot-ladder", "Up the Pilot Ladder", "plaquemines", "pilot-station", "the pilot boat operator", "k12-by-the-rivers-current-and-a-pilots-job", "pilot-transfer", "sl-plaquemines-pilot-transfer-watch",
    ["Learn about the river's current and a pilot's job.", "Do the pilot transfer station.", "Keep the pilot transfer watch."]),
  kwMakeQuest("family-plan", "The Family Plan", "st-tammany", "staging-yard", "the staging yard boss", "k12-by-a-family-readiness-plan", "shelter-intake-operations", "sl-st-tammany-staging-yard-roll-out",
    ["Make a readiness plan together: who helps, what to pack, where to go.", "Do the shelter intake station.", "Roll the staging yard out on the plan."]),
  kwMakeQuest("barn-timetable", "Barn Timetable", "orleans", "streetcar-barn", "the barn foreman", "k12-by-a-streetcar-timetable", "bus-depot-lift", "sl-orleans-barn-power-switching",
    ["Read a streetcar schedule as a timetable.", "Do the depot lift station.", "Work the barn's switching order."]),
  kwMakeQuest("fair-catch", "A Fair Catch", "st-bernard", "fishing-harbour", "the harbour master", "k12-by-a-shrimp-boats-fair-count", "oyster-reef-monitoring", "sl-st-bernard-harbour-recovery",
    ["Count a shrimp boat's catch fairly.", "Do the oyster reef monitoring station.", "Run the harbour recovery drill."]),
];

export function kwQuest(id) { return KW_QUESTS.find((q) => q.id === id) ?? null; }
/** A quest's game: a KREWE kiosk or a SECONDLINE side game. */
export function kwGameFor(id) { return kwKiosk(id) ?? slGameById(id); }
/** The quests a parish offers (for the path board or a GRIOT hand-off). */
export function kwQuestsFor(parishId) { return KW_QUESTS.filter((q) => q.parish === parishId); }

// ------------------------------------------------------------------ positions in a parish data module

/** Offset from the bound site's centre where a kiosk stands (inside the pad, clear of the site board). */
export const KW_KIOSK_OFFSET = [-14, 10];

/**
 * Where each kiosk of this parish stands: `[{ kiosk, site, x, z }]`, bound through slResolveSite
 * (by id, then by the SL site's `match`). A kiosk whose site the data lacks is left out.
 */
export function kwKioskSpots(parishData) {
  const out = [];
  for (const k of kwKiosksFor(parishData?.id)) {
    const site = slResolveSite(parishData, k.site);
    if (!site || !Array.isArray(site.position)) continue;
    out.push({ kiosk: k, site, x: site.position[0] + KW_KIOSK_OFFSET[0], z: site.position[1] + KW_KIOSK_OFFSET[1] });
  }
  return out;
}

/**
 * Site records in grMount's documented shape (`{ id, name, kind, position }`, npc.js) so the parish
 * character whose `siteKind` matches stands at each kiosk. Pass them first in `sites` so a
 * character keyed by kind finds the kiosk before any other site of that kind:
 *   grMount(`parish:${parish.id}`, { three, root, sites: [...kwGriotSites(parish), ...parish.sites], groundAt, pos })
 */
export function kwGriotSites(parishData) {
  return kwKioskSpots(parishData).map(({ kiosk, x, z }) => ({ id: kiosk.id, name: kiosk.title, kind: kiosk.character, position: [x, z], kiosk: kiosk.id }));
}

/** Counts for the console log and the hand-back. */
export function kwPlayCounts() {
  return { kiosks: KW_KIOSKS.length, quests: KW_QUESTS.length, parishes: new Set(KW_KIOSKS.map((k) => k.parish)).size, lessons: new Set(KW_QUESTS.map((q) => q.steps[1].lesson)).size };
}

// ------------------------------------------------------------------ the side-quest board (menu, DOM only)

/**
 * The quest board's model for one parish (pure): each quest with its three links in order and
 * what is done. `snap` is a gate snapshot (qmSnapshot()); `completed(stationId)` says whether a
 * station has a record (the passport's ppCompleted); the lesson slot is BAYOU's K-12 station and
 * links through links.js like any station.
 */
export function kwQuestBoard(parishId, { snap = null, completed = () => false, page = KW_PAGE } = {}) {
  const s = snap ?? qmSnapshot();
  return kwQuestsFor(parishId).map((q) => {
    const lesson = q.steps[1], station = q.steps[2], game = kwGameFor(q.steps[3].game);
    return {
      id: q.id, title: q.title, siteName: slSiteName(q.parish, q.site), giver: q.giver,
      lesson: { id: lesson.lesson, text: lesson.text, href: lkStationLink(lesson.lesson, { from: KW_WORLD, page, siteId: `${q.parish}/${q.site}` }) },
      station: { id: station.station, text: station.text, done: !!completed(station.station), href: lkStationLink(station.station, { from: KW_WORLD, page, siteId: `${q.parish}/${q.site}` }) },
      game: { id: game?.id ?? q.steps[3].game, title: game?.title ?? q.steps[3].game, text: q.steps[3].text, open: game ? qmIsOpen(game.gate, s) : false, done: !!s.questsDone?.has(game?.id) },
      stamp: q.reward.stamp,
    };
  });
}

const kwEsc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Render the parish's side quests into `el`; `onGame(id)` opens the side-game panel. Returns the model. */
export function kwMountQuestBoard(el, parishId, opts = {}) {
  const rows = kwQuestBoard(parishId, opts);
  if (!el) return rows;
  if (!rows.length) { el.innerHTML = ""; return rows; }
  el.innerHTML = `<section class="kw-quests" aria-label="Side quests"><p class="eyebrow" style="margin-top:16px">Side quests</p><p class="note">Each quest is a lesson, a union station and a mini-game at one site.</p><ol>${rows.map((r) =>
    `<li><strong>${kwEsc(r.title)}</strong> <span class="note">at ${kwEsc(r.siteName)}, with ${kwEsc(r.giver)}</span><br>` +
    `<a data-kw-lesson="${kwEsc(r.lesson.id)}" href="${kwEsc(r.lesson.href)}">Lesson: ${kwEsc(r.lesson.text)}</a> · ` +
    `<a href="${kwEsc(r.station.href)}">${r.station.done ? "✓ " : ""}Station: ${kwEsc(r.station.text)}</a> · ` +
    `<button type="button" class="btn" data-kw-game="${kwEsc(r.game.id)}">${r.game.done ? "✓ " : r.game.open ? "" : "Locked: "}${kwEsc(r.game.title)}</button></li>`).join("")}</ol></section>`;
  if (typeof opts.onGame === "function") for (const b of el.querySelectorAll("[data-kw-game]")) b.addEventListener("click", () => opts.onGame(b.getAttribute("data-kw-game")));
  return rows;
}


