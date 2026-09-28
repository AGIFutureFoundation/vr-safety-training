// Skill-gated side games for the Deep, the Bay Regatta and Fairway Park
// (tools/briefs/frontier-brief.md, QUESTMASTER; docs/skill-gates.md).
// Bay World's gated side quests are generated with the rest of its quest
// data (tools/gen_bay_quests.mjs -> bayworld/js/quests-data.js GATED_QUESTS).
//
// Every game carries a gate in the shared contract (shared/skill-gates.js),
// is scored ONLY on safe practice — each round offers the safe call and an
// unsafe one, and a clean run is every call safe — and unlocks one cosmetic
// avatar item. No harm is scored, nothing is bought, nothing is random.
// The rounds are built from QM_SAFE_PRACTICES: generic safe habits phrased
// "per the plan / label / dive plan", never a number, limit or clause.
//
// Names prefixed `qm`/`QM_` (the bundler shares one scope).

/**
 * The safe-practice library a game's rounds are drawn from. `{task}` and
 * `{site}` are filled from the game. Each entry: the prompt, the safe call,
 * the unsafe call (shown in a seeded order so the safe one is not always first).
 */
export const QM_SAFE_PRACTICES = {
  plan: { prompt: "Before the {task} starts, what comes first?", safe: "Read the plan for the job and brief the crew on it.", unsafe: "Start now and sort the plan out as you go." },
  ppe: { prompt: "What do you wear for the {task}?", safe: "The PPE the plan and the task call for, checked before you start.", unsafe: "Whatever is closest, since it is a short job." },
  zone: { prompt: "Someone walks toward the work during the {task}.", safe: "Hold the work and keep them outside the marked exclusion zone.", unsafe: "Carry on — they can see what is happening." },
  lockout: { prompt: "The equipment at {site} needs clearing mid-task.", safe: "Stop, lock out and verify zero energy before reaching in.", unsafe: "Reach in quickly while it idles." },
  comms: { prompt: "The signal from your crew partner is unclear.", safe: "Stop and confirm with a read-back before anything moves.", unsafe: "Guess what they meant and keep moving." },
  stopwork: { prompt: "Conditions change partway through the {task}.", safe: "Call a stop, reassess with the crew and restart only when it is safe.", unsafe: "Push on to finish before it gets worse." },
  buddy: { prompt: "Your buddy drops out of sight at {site}.", safe: "Stop, signal and run the lost-buddy procedure in the dive plan.", unsafe: "Keep working; they will turn up." },
  inspect: { prompt: "The gear for the {task} is ready on the rack.", safe: "Inspect it and tag out anything damaged before use.", unsafe: "Use it — it was fine last time." },
  spill: { prompt: "A small spill shows up at {site}.", safe: "Contain it with the spill kit and report it.", unsafe: "Leave it; it will disperse on its own." },
  label: { prompt: "You are about to apply a product at {site}.", safe: "Read the label and follow it, including the PPE and re-entry it names.", unsafe: "Mix it a little stronger to save a second pass." },
  weather: { prompt: "The weather turns during the {task}.", safe: "Check it against the limits in the plan and stand down if it is outside them.", unsafe: "Keep going; the forecast said it would clear." },
  lift: { prompt: "A load is about to be lifted at {site}.", safe: "Confirm the lift plan, the rigging and a clear area under the load.", unsafe: "Lift it and warn people as it swings." },
  fatigue: { prompt: "It is late in a long shift on the {task}.", safe: "Check in on fatigue and hand over if you are not fit to continue.", unsafe: "Skip the break to finish sooner." },
  traffic: { prompt: "The {task} sits beside live traffic.", safe: "Set up the traffic control the plan calls for before starting.", unsafe: "Work fast and watch the traffic yourself." },
  overboard: { prompt: "Someone goes into the water near {site}.", safe: "Raise the alarm, point and keep eyes on them, and run the recovery drill.", unsafe: "Jump in after them without a word to the crew." },
  allergen: { prompt: "An order at {site} is flagged for an allergy in the rush.", safe: "Stop, check the recipe and use clean tools and a clean station for it.", unsafe: "Pick the allergen off the plate and send it." },
  radio: { prompt: "You need to cross a busy stretch of water at {site}.", safe: "Call on the radio as the plan sets out and wait for the clear.", unsafe: "Cross quickly and hope the others see you." },
};

const qmG = (id, world, title, site, task, gate, practices, cosmetic, summary, pin = null) =>
  ({ id, world, kind: "side-game", title, site, task, gate, practices, reward: { cosmetic }, summary, pin });

/** The Deep (underwater): harbour salvage, surveys and night lines. */
const QM_DEEP_GAMES = [
  qmG("qm-deep-harbour-salvage-hunt", "underwater", "Harbour Salvage Hunt", "wreck-salvage-rigging", "salvage lift",
    { stations: ["mw-dive-supervisor-and-dive-plan", "uw-lift-bag-rigging-and-object-recovery"], note: "Dive supervision and lift-bag rigging before you rig a salvage lift." },
    ["plan", "lift", "buddy"], "salvage diver's shoulder patch", "Find three marked pieces of lost gear at the wreck and rig each for a controlled lift."),
  qmG("qm-deep-kelp-transect-count", "underwater", "Kelp Transect Count", "kelp-transect-start", "transect count",
    { stations: ["me-kelp-transect-survey-and-photo-quadrats"], note: "The kelp transect survey station before you run the count." },
    ["plan", "buddy", "stopwork"], "kelp surveyor's slate charm", "Swim the kelp transect with your buddy and log each photo quadrat."),
  qmG("qm-deep-piling-inspection-trail", "underwater", "Piling Inspection Trail", "pier-piling-inspection-station", "piling inspection",
    { stations: ["cd-pier-piling-inspection-and-wrap-repair"], note: "Pier piling inspection and wrap repair before you walk the piling trail." },
    ["inspect", "buddy", "comms"], "piling inspector's helmet decal", "Inspect a row of pilings, flag the damaged wrap and call it up to the surface."),
  qmG("qm-deep-rov-tether-maze", "underwater", "ROV Tether Maze", "outfall-diffuser-inspection", "ROV run",
    { stations: ["uw-rov-pre-dive-and-tether-management"], note: "ROV pre-dive and tether management before you fly the tether maze." },
    ["inspect", "comms", "stopwork"], "ROV pilot's tether-knot pin", "Fly the ROV through the diffuser run without fouling the tether."),
  qmG("qm-deep-night-line-dive", "underwater", "Night Line Dive", "kelp-night-line-site", "night line dive",
    { stations: ["cd-low-visibility-and-night-dive-line-work"], programmes: [{ id: "commercial-diving-and-scientific-scuba", minStars: 4 }], note: "Low-visibility line work and some commercial diving stars before the night line." },
    ["buddy", "plan", "comms"], "night diver's glow wristband", "Follow the night line out and back, keeping contact with your buddy the whole way."),
  qmG("qm-deep-eelgrass-replant", "underwater", "Eelgrass Replant", "eelgrass-transplant-plots", "replanting",
    { stations: ["me-eelgrass-seed-collection-and-nursery"], note: "Eelgrass seed collection and nursery work before you replant the plots." },
    ["plan", "zone", "buddy"], "eelgrass gardener's fin tag", "Replant the marked plots from the nursery trays, staying off the planted rows."),
  qmG("qm-deep-debris-map", "underwater", "Debris Map Challenge", "shelf-debris-sweep", "debris survey",
    { stations: ["br-underwater-debris-survey-and-mapping", "br-dive-site-hazard-assessment-and-jsa"], note: "Debris survey and the dive-site hazard assessment before you map the shelf." },
    ["plan", "inspect", "stopwork"], "shelf mapper's compass bead", "Map every marked piece of debris on the shelf and flag the ones to leave for a crew."),
  qmG("qm-deep-buoyancy-trim-course", "underwater", "Buoyancy Trim Course", "shelf-checkout-site", "trim course",
    { k12: ["k12-buoyancy-and-pressure-in-the-deep"], note: "The K-12 buoyancy and pressure lesson before you swim the trim course." },
    ["plan", "buddy", "stopwork"], "trim-course finisher's fin ribbon", "Hover through the hoops at the checkout site using trim, not your hands."),
];

/** The Bay Regatta: boat handling, rescue and working on the water. */
const QM_REGATTA_GAMES = [
  qmG("qm-regatta-rescue-drill", "regatta", "Regatta Rescue Drill", "Estuary Sprint", "rescue drill",
    { stations: ["yc-man-overboard-recovery-drill", "br-cold-water-immersion-and-mob-recovery"], note: "Overboard recovery and cold-water immersion stations before the rescue drill." },
    ["overboard", "comms", "ppe"], "rescue-crew burgee", "Run a marked overboard drill: alarm, spotter, approach and recovery."),
  qmG("qm-regatta-crosswind-docking", "regatta", "Crosswind Docking Challenge", "the guest berth", "docking",
    { stations: ["yc-line-handling-and-docking-in-crosswind"], note: "Line handling and docking in a crosswind before the docking challenge." },
    ["comms", "plan", "stopwork"], "dockhand's rope bracelet", "Bring the yacht alongside in a crosswind with clear calls to the line handlers."),
  qmG("qm-regatta-fuel-dock-drill", "regatta", "Fuel Dock Drill", "the fuel dock", "fuel transfer",
    { stations: ["yc-fuel-dock-transfer-and-spill-kit"], note: "The fuel dock transfer and spill-kit station before the fuel dock drill." },
    ["spill", "plan", "zone"], "fuel-dock hand's cap badge", "Fuel the tender by the book and deal with a drip before it reaches the water."),
  qmG("qm-regatta-boom-tow-formation", "regatta", "Boom Tow Formation", "Outer Bay Loop", "boom tow",
    { stations: ["br-boom-towing-between-two-vessels"], note: "Boom towing between two vessels before you hold the tow formation." },
    ["comms", "radio", "weather"], "boom-tow crew pennant", "Hold a two-boat boom formation around the marks with steady radio calls."),
  qmG("qm-regatta-work-zone-passage", "regatta", "Work Zone Passage", "North Channel Passage", "work-zone passage",
    { stations: ["br-vhf-and-navigation-in-a-work-zone"], note: "VHF and navigation in a work zone before you pass the dredge line." },
    ["radio", "plan", "stopwork"], "channel navigator's sleeve stripe", "Pass a marked work zone in the channel, calling and waiting as the plan sets out."),
  qmG("qm-regatta-tender-transfer", "regatta", "Tender Transfer Run", "the guest berth", "guest transfer",
    { stations: ["yc-tender-launch-and-guest-transfer", "yc-pre-departure-safety-briefing-and-guest-count"], note: "Tender launch and the pre-departure briefing before you run guest transfers." },
    ["plan", "ppe", "weather"], "tender driver's lanyard", "Launch the tender and ferry each guest ashore with a count at both ends."),
  qmG("qm-regatta-pilot-ladder", "regatta", "Pilot Ladder Transfer", "Outer Bay Loop", "pilot transfer",
    { stations: ["pilot-transfer"], programmes: [{ id: "yacht-and-charter-crew", minStars: 6 }], note: "The pilot transfer station and some yacht crew stars before the ladder run." },
    ["weather", "comms", "ppe"], "pilot-boat crew beanie", "Hold station alongside for a pilot ladder transfer and call each stage."),
];

/** Fairway Park: grounds crew, sports-field and course care. */
const QM_FAIRWAY_GAMES = [
  qmG("qm-fairway-greens-crew-dawn", "fairway", "Greens Crew at Dawn", "the greens", "greens round",
    { stations: ["gk-greens-mowing-and-hole-changing"], note: "Greens mowing and hole changing before you run the dawn greens round." },
    ["inspect", "zone", "plan"], "greenskeeper's flag-pin badge", "Mow and change the holes on three greens before the first group tees off.", [0, 120]),
  qmG("qm-fairway-bunker-rebuild", "fairway", "Bunker Rebuild Puzzle", "the bunkers", "bunker rebuild",
    { stations: ["gk-bunker-renovation-and-drainage"], note: "Bunker renovation and drainage before you solve the rebuild puzzle." },
    ["plan", "ppe", "inspect"], "bunker rake cap", "Lay out drainage and sand for a bunker in the right order.", [40, 200]),
  qmG("qm-fairway-irrigation-leak-hunt", "fairway", "Irrigation Leak Hunt", "the pump house", "leak hunt",
    { stations: ["gk-irrigation-controller-valve-box-and-backflow-check"], note: "The irrigation controller, valve box and backflow station before the leak hunt." },
    ["lockout", "inspect", "plan"], "irrigation tech's valve-key charm", "Trace a pressure drop from the pump house to the leaking valve box.", [-270, -36]),
  qmG("qm-fairway-storm-cleanup", "fairway", "Storm Cleanup Crew", "the cart path", "storm cleanup",
    { stations: ["gk-storm-cleanup-chipper-and-traffic-control", "gk-chainsaw-start-and-limbing-on-the-ground"], note: "Storm cleanup with the chipper and chainsaw limbing on the ground first." },
    ["zone", "ppe", "traffic"], "storm crew hi-vis sash", "Clear fallen limbs from the cart path with a chipper and a coned-off work area.", [-150, 60]),
  qmG("qm-fairway-field-line-marking", "fairway", "Field Line Marking", "the pitch", "line marking",
    { stations: ["gk-sports-field-line-marking-and-goal-anchoring"], k12: ["k12-measuring-and-scaling-the-court"], note: "Field line marking and the K-12 measuring-and-scaling lesson before you mark the pitch." },
    ["plan", "inspect", "zone"], "line-marker's chalk wristband", "Mark the pitch from a scaled plan and check every goal is anchored.", [-225, 55]),
  qmG("qm-fairway-mower-slope-course", "fairway", "Mower Slope Course", "the maintenance yard", "slope mowing",
    { stations: ["gk-ride-on-mower-pre-start-and-slope-work"], programmes: [{ id: "grounds-and-landscaping", minStars: 6 }], note: "The ride-on mower pre-start and some grounds stars before the slope course." },
    ["inspect", "stopwork", "plan"], "mower operator's seat-belt buckle badge", "Run a marked mowing course that includes a slope, walking what the plan says to walk.", [-288, -36]),
];

/** Every non-Bay-World side game, in world order. */
export const QM_SIDE_GAMES = [...QM_DEEP_GAMES, ...QM_REGATTA_GAMES, ...QM_FAIRWAY_GAMES];

/** Every world's gated items for the checker: world -> items. */
export const QM_WORLD_GAMES = {
  underwater: QM_DEEP_GAMES, regatta: QM_REGATTA_GAMES, fairway: QM_FAIRWAY_GAMES,
};

function qmFill(s, game) { return s.replace(/\{task\}/g, game.task ?? "job").replace(/\{site\}/g, game.siteName ?? game.site ?? "the site"); }

/**
 * A game's rounds, ready to show: `[{ key, prompt, options: [{ text, safe }] }]`.
 * The order of the two options is fixed per game and round (a hash of the
 * id), so a run is repeatable and the safe call is not always first.
 */
export function qmRounds(game) {
  let h = 0;
  for (const ch of game.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (game.practices ?? []).map((key, i) => {
    const p = QM_SAFE_PRACTICES[key];
    const safe = { text: qmFill(p.safe, game), safe: true };
    const unsafe = { text: qmFill(p.unsafe, game), safe: false };
    const flip = ((h >> i) & 1) === 1;
    return { key, prompt: qmFill(p.prompt, game), options: flip ? [unsafe, safe] : [safe, unsafe] };
  });
}
