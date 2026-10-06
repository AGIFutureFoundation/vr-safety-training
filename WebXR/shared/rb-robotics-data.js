// ROBOTICS (docs/consoles/ROBOTICS.md, docs/robot-training.md "Robotics
// scenarios and the gym API"): the robotics scenarios, games and world sites
// as plain, dependency-free data. TQ-BRIDGE exports this file's RB_* values
// once to exports/shared/ for SmartCiti.X TradeQuest; nothing here imports
// anything, so a Node script, a browser page and the bridge all read it as is.
//
// Facts rule: the sites name real places only by the map site they sit
// beside (an existing catalog site id) and describe nothing about them; every
// robot, cell and zone here is procedural, and every number is a simulation
// parameter labelled procedural — not a figure from any standard, maker or
// real site. Kids rule: the text is plain and calm — the robots here always
// slow and stop for people; nothing is framed as a danger to be afraid of.
// Names prefixed `rb`/`RB_` (the bundler shares one scope).

/** The schema ids an rbEnv episode carries. `dataset` is the version of the
 * dataset layer's episode format (tools/export_dataset.mjs SCHEMA_VERSION /
 * shared/episodes.js EPISODE_SCHEMA_VERSION) this env writes; `env` versions
 * the observation and action shapes below. tools/check_robotics.mjs fails if
 * `dataset` drifts from export_dataset.mjs, so a bump there is seen here. */
export const RB_SCHEMA = { env: "rb-env/1", dataset: 1, frame: "scenario metres, +y up, origin at the work cell's floor centre", units: { distance: "m", speed: "m/s", force: "N (procedural)", time: "s" } };

/** Simulated force ceilings per shared/robot-embodiment.js FORCE_CLASSES, in
 * newtons — procedural simulation parameters, not a rating of any gripper. */
export const RB_FORCE_N = { none: 0, light: 12, firm: 40 };

/** Speed-and-separation defaults for the world sites and the cell-entry
 * scenario (procedural): inside `warn` metres the robot runs at reduced
 * speed; inside `stop` it holds a protective stop until the person steps back. */
export const RB_SSM = { warn: 6, stop: 2.5, reducedSpeed: 0.3, fullSpeed: 1 };

/** Safe-practice rule ids and their reward weights. Every penalty is a missed
 * practice, never harm: the robot always stops for a person, so "entered a
 * live cell" means the learner skipped the lockout, not that anything happened. */
export const RB_RULES = {
  "enter-live-cell": { weight: -3, text: "Entered the cell before it was stopped and locked out." },
  "skip-estop-test": { weight: -2, text: "Finished without testing the e-stop first." },
  "skip-scanner-test": { weight: -1, text: "Committed the zones without testing the area scanner." },
  "lockout-order": { weight: -1, text: "Tried to lock out before the robot was stopped." },
  "no-verify": { weight: -1, text: "Entered without a try-start check for zero energy." },
  "over-force": { weight: -1, text: "Gripped harder than the part's force limit." },
  "keep-out": { weight: -2, text: "Moved the gripper into a person's keep-out space; the robot held a protective stop." },
  "conflict": { weight: -1, text: "Two robots were sent to the same spot; both held and waited." },
  "yield-missed": { weight: -1, text: "Sent a robot into the walkway while a person was crossing; it held and waited." },
  "zone-too-small": { weight: -2, text: "Stop zone smaller than the robot needs to come to rest at that speed." },
  "warn-inside-stop": { weight: -1, text: "Warning zone set inside the stop zone." },
  "restart-with-lock": { weight: -1, text: "Tried to restart while a lock was still on." },
  "left-locked": { weight: -1, text: "Left without removing your own lock and restarting the cell." },
  "hazard": { weight: -1, text: "Chose an unsafe option at the station (station scenarios)." },
  "person-in-barricade": { weight: -3, text: "Ran the drill while a person was inside the barricade; the robot held until they stepped out." },
  "drill-unscanned": { weight: -2, text: "Drilled before the deck was scanned for embedded services." },
  "no-barricade": { weight: -2, text: "Drilled before the barricade around the robot's reach was set." },
  "dust-off": { weight: -1, text: "Drilled with the dust collection switched off." },
  "bit-change-live": { weight: -2, text: "Changed the drill bit without isolating the battery first." },
  "crossing-stop-zone": { weight: -3, text: "Drove toward the pedestrian crossing while a person was on it; the gantry held in the stop zone." },
  "pinned-keep-out": { weight: -2, text: "Drove into the keep-out around a pinned container where a lashing crew works; the gantry held." },
};

/**
 * Scenarios. `kind: "game"` runs on rb-env.js's own simulation; `kind:
 * "station"` wraps a catalog station's Session through shared/robot.js
 * observe()/applyAction() and shared/robot-embodiment.js observeEmbodied()
 * (the caller hands in the built room, see rbEnv). `maxSteps` bounds every
 * episode; `station` names the catalog station the scenario teaches beside.
 */
export const RB_SCENARIOS = [
  {
    id: "rb-teleop-pick-place", kind: "game", name: "Teleop Pick-and-Place",
    blurb: "Guide a robot gripper to move parts from the bin to the fixture, gripping each part within its force limit and keeping clear of your teammate's space.",
    station: "ad-cobot-risk-assessment-and-speed-separation", maxSteps: 400, dt: 0.1,
    params: { parts: 3, speed: 0.12, tolerance: 0.04, teammateRadius: 0.45 },
    actions: ["move {dx,dy,dz} (m, capped at params.speed per step)", "grip {force} (N)", "release", "estop", "reset", "wait"],
    safePractice: ["over-force", "keep-out"],
  },
  {
    id: "rb-amr-fleet-routing", kind: "game", name: "AMR Fleet Routing",
    blurb: "Route a small fleet of warehouse robots to their drop-offs without two robots claiming the same spot, and hold them at the walkway while a person crosses.",
    station: "ad-amr-fleet-traffic-and-estop-drill", maxSteps: 120, dt: 1,
    params: { width: 9, height: 7, robots: 3, walkwayColumn: 4 },
    actions: ["route {moves: [N|S|E|W|wait per robot]}", "estop", "wait"],
    safePractice: ["conflict", "yield-missed"],
  },
  {
    id: "rb-cobot-zone-setup", kind: "game", name: "Cobot Safety-Zone Setup",
    blurb: "Set a cobot's warning and stop zones for its speed, test the area scanner and the e-stop, then commit the setup.",
    station: "ad-cobot-risk-assessment-and-speed-separation", maxSteps: 40, dt: 1,
    params: { intrusion: 0.2 },
    actions: ["set {param: warn|stop|speed, value}", "test {what: scanner|estop|zone-walk}", "commit", "wait"],
    safePractice: ["zone-too-small", "warn-inside-stop", "skip-scanner-test", "skip-estop-test"],
  },
  {
    id: "rb-cell-entry", kind: "game", name: "Robot Cell Entry",
    blurb: "Walk up to a working robot cell, watch it slow and stop as you near, test the e-stop, lock out, check for zero energy, clear the jam and restart safely.",
    station: "ad-robot-cell-lockout-and-safe-reentry", maxSteps: 160, dt: 0.5,
    params: { start: 14, cellEdge: 1.2, walk: 1 },
    actions: ["walk {d} (m, + toward the cell)", "test-estop", "press-estop", "lockout", "verify", "enter", "clear-jam", "exit", "remove-lock", "restart", "wait"],
    safePractice: ["enter-live-cell", "skip-estop-test", "lockout-order", "no-verify", "restart-with-lock", "left-locked"],
  },
  {
    id: "rb-construction-drilling", kind: "game", name: "Ceiling-Drilling Robot Set-Up",
    blurb: "Set a ceiling-drilling robot to work on a concrete deck: scan the deck, set the barricade, switch the dust collection on, drill the layout and change a worn bit with the battery isolated. Hold the robot whenever a person steps inside the barricade.",
    station: "rp-construction-drilling-robot-setup", maxSteps: 80, dt: 1,
    params: { holes: 6, bitLife: 3, personPeriod: 9, personStay: 2 },
    actions: ["scan", "barricade", "dust-on", "drill", "hold", "isolate", "change-bit", "restore", "estop", "wait"],
    safePractice: ["person-in-barricade", "drill-unscanned", "no-barricade", "dust-off", "bit-change-live"],
  },
  {
    id: "rb-port-gantry", kind: "game", name: "Port Automation Lane",
    blurb: "Drive an automated stacking gantry along a container-yard lane: carry each container to its bay, slow and hold in the stop zone while a person is on the crossing, and keep out of the lane around a pinned container.",
    station: "ad-amr-fleet-traffic-and-estop-drill", maxSteps: 160, dt: 1,
    params: { width: 12, lanes: 2, crossingColumn: 6, stopZone: 2, jobs: 2, keepOutSpan: 2 },
    actions: ["move {dir: N|S|E|W}", "hold", "lift", "set", "estop", "wait"],
    safePractice: ["crossing-stop-zone", "pinned-keep-out"],
  },
  { id: "rb-station-robot-cell", kind: "station", name: "Robot Cell Lockout & Safe Re-entry (station)", station: "ad-robot-cell-lockout-and-safe-reentry", maxSteps: 20000, dt: 0.05, safePractice: ["hazard"] },
  { id: "rb-station-amr-fleet", kind: "station", name: "AMR Fleet Traffic & E-stop Drill (station)", station: "ad-amr-fleet-traffic-and-estop-drill", maxSteps: 20000, dt: 0.05, safePractice: ["hazard"] },
  { id: "rb-station-cobot", kind: "station", name: "Cobot Risk Assessment & Speed-and-Separation (station)", station: "ad-cobot-risk-assessment-and-speed-separation", maxSteps: 20000, dt: 0.05, safePractice: ["hazard"] },
];

/**
 * Robotics sites in the parish-engine maps. Each sits beside an existing map
 * site (`anchor`, a catalog site id) at a small procedural offset, runs one
 * procedural rig (an AMR on a loop, a cobot arm cycling, a gantry traversing)
 * with speed-and-separation zones, an e-stop post and a lockout point at the
 * cell gate, and links the scenario and station it teaches.
 */
export const RB_SITES = [
  { id: "rb-site-west-oakland-port-automation", parish: "oak-west-oakland", anchor: "outer-harbor-container-terminal", offset: [34, 26], rig: "gantry", name: "Port Automation Yard (procedural)", scenario: "rb-port-gantry", station: "ad-amr-fleet-traffic-and-estop-drill" },
  { id: "rb-site-west-oakland-warehouse", parish: "oak-west-oakland", anchor: "mandela-parkway-warehouse-row", offset: [-30, 24], rig: "amr", name: "Automated Warehouse Aisle (procedural)", scenario: "rb-amr-fleet-routing", station: "ad-amr-fleet-traffic-and-estop-drill" },
  { id: "rb-site-san-jose-robotics-lab", parish: "bay-san-jose", anchor: "university-campus-plant-sj", offset: [30, -26], rig: "cobot", name: "Campus Robotics Lab (procedural)", scenario: "rb-cobot-zone-setup", station: "ad-cobot-risk-assessment-and-speed-separation" },
  { id: "rb-site-orleans-warehouse", parish: "orleans", anchor: "no-sw-almonaster-corridor-distribution-warehouse", offset: [32, 28], rig: "amr", name: "Distribution Robot Aisle (procedural)", scenario: "rb-amr-fleet-routing", station: "ad-amr-fleet-traffic-and-estop-drill" },
  { id: "rb-site-richland-drilling-robot", parish: "la-meta-richland", anchor: "lmr-data-hall-fitout", offset: [30, 28], rig: "cobot", name: "Ceiling-Drilling Robot Deck (procedural)", scenario: "rb-construction-drilling", station: "rp-construction-drilling-robot-setup" },
  { id: "rb-site-soma-robot-cell", parish: "sf-downtown", anchor: "dt-sw-south-of-market-fabrication-shop", offset: [-28, 26], rig: "cell", name: "Fabrication Robot Cell (procedural)", scenario: "rb-cell-entry", station: "ad-robot-cell-lockout-and-safe-reentry" },
];

/** In-world safe-practice scoring for a site visit (rb-world.js): each
 * practice observed earns its points; out of 100. */
export const RB_SITE_PRACTICES = [
  { id: "slowed", points: 20, text: "Watched the robot slow as you entered the warning zone." },
  { id: "estop-test", points: 25, text: "Pressed and reset the e-stop to test it." },
  { id: "lockout", points: 30, text: "Locked out at the gate before entering the cell." },
  { id: "restart", points: 25, text: "Removed your lock and restarted from outside." },
];

/** Plain accessor for bridges: everything above as one object. */
export function rbSharedData() {
  return { schema: RB_SCHEMA, forceN: RB_FORCE_N, ssm: RB_SSM, rules: RB_RULES, scenarios: RB_SCENARIOS, sites: RB_SITES, sitePractices: RB_SITE_PRACTICES };
}
