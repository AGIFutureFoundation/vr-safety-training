// ROBOPROG — the Holodeck Robotics & Human–Robot Collaboration Programme, data (console ROBOPROG, docs/consoles/ROBOPROG.md,
// docs/robotics-programme.md). SmartCiti.X Powered by AGI Corp.
//
// Pure data, no imports. The LA-PROGRAMME pattern (lp-programme-data.js) for robotics:
//   track    — six kinds of robotics work (industrial cells, cobots, mobile robots and AMRs, construction robotics, maintenance and
//              lockout, data and AI-training roles), each with the real catalog stations that teach it.
//   → ladder — five role levels per track: awareness / K-12 → robot operator → technician → integrator / safety lead →
//              AI-training specialist. Each level lists its stations explicitly and ends in a competency on the competency layer.
//   → robot stations — RP_ROBOT_STATIONS is the honest list of catalog stations where a robot (a fenced cell, a cobot, an AMR,
//              a construction robot, a robot's training data or its policy) is the subject of the practice. The programme's eval
//              is the robot-station coverage of every level (tools/check_robotics_programme.mjs prints it before and after).
//   → the loop — every AI-training level uses COLEARN's demonstration → behaviour-cloning policy → held-out evaluation loop
//              (shared/col-learn.js: colSyntheticDemos / colDemosFromEpisodes, colTrain, colEvalScenario) under DATAWORKS'
//              consent (shared/dx-data.js: dxOptIn, dxCollecting — adults only, never K-12, demo or signed-out, local only,
//              revoking deletes). The references are by name and GUARDED: rp-programme.js never imports col-learn.js.
// Standards are cited by name only (ISO 10218-1 and -2, ISO/TS 15066, ANSI/A3 R15.06, OSHA 29 CFR 1910.147); no clause text is
// quoted. The programme has no partnership with any robot maker, integrator, platform, investor or union.
// Every top-level name is prefixed rp/RP_ (the bundler shares one scope).

export const RP_NAME = "Holodeck Robotics & Human–Robot Collaboration Programme";
export const RP_BRAND = "SmartCiti.X Holodeck · Powered by AGI Corp";
export const RP_NO_PARTNERSHIP = "The Holodeck Robotics & Human–Robot Collaboration Programme is the platform's own training programme. It has no partnership with any robot maker, integrator, software platform, investor or union, and it does not deliver or describe any employer's or union's programme. Robot cells, cobots, AMRs and construction robots in the stations are generic and procedural. Standards are named so learners can find them; their text is not quoted, and each station teaches the practice in general terms from its own cited sources.";

/** The public standards the programme names (by name only — no clause text is quoted anywhere in the programme). */
export const RP_STANDARDS = [
  { id: "iso-10218-1", label: "ISO 10218-1 — robots and robotic devices: safety requirements for industrial robots (the robot)" },
  { id: "iso-10218-2", label: "ISO 10218-2 — safety requirements for industrial robot systems and their integration (the cell)" },
  { id: "iso-ts-15066", label: "ISO/TS 15066 — collaborative robots (speed and separation monitoring, power and force limiting)" },
  { id: "ansi-a3-r15-06", label: "ANSI/A3 R15.06 — the US adoption of the industrial robot safety standards" },
  { id: "osha-1910-147", label: "OSHA 29 CFR 1910.147 — the control of hazardous energy (lockout/tagout)" },
];

/** The ladder. Level ids are fixed; `who` names the learners, never an employer. */
export const RP_LEVELS = [
  { id: "aware", title: "Awareness / K-12", who: "school classes, career centres and community members (no data is ever collected at this level)", requiredScore: 60, dueDays: 14 },
  { id: "operator", title: "Robot operator", who: "operators who run, load and stop a robot system from outside its safeguarded space", requiredScore: 75, dueDays: 21 },
  { id: "technician", title: "Robot technician", who: "maintenance and service technicians who enter the safeguarded space under lockout", requiredScore: 80, dueDays: 35 },
  { id: "integrator", title: "Integrator / safety lead", who: "integrators, controls engineers and site safety leads who set up and sign off a cell", requiredScore: 85, dueDays: 35 },
  { id: "ai-training", title: "AI-training specialist", who: "adults who collect teleoperation demonstrations, label them and evaluate robot policies — with consent, locally", requiredScore: 85, dueDays: 28 },
];

/**
 * Catalog stations where a robot is the subject of the practice. `kind` says which. The six `rp-*` stations are this
 * console's gap stations (WebXR/smartcity/js/sims/rp-*.js); the others were authored by earlier consoles.
 */
export const RP_ROBOT_STATIONS = {
  "robot-cell": "industrial robot cell",
  "ad-robot-cell-lockout-and-safe-reentry": "industrial robot cell",
  "ad-cobot-risk-assessment-and-speed-separation": "collaborative robot",
  "ad-amr-fleet-traffic-and-estop-drill": "mobile robots (AMR)",
  "tw-amr-traffic-zone-entry-and-lockout": "mobile robots (AMR)",
  "tw-palletizer-cell-fenced-access-permit": "industrial robot cell (palletizer)",
  "rp-teleop-demonstration-collection": "robot learning data (teleoperation demonstrations)",
  "rp-robot-policy-evaluation-review": "robot policy evaluation",
  "rp-construction-drilling-robot-setup": "construction robot",
  "k12-rp-how-a-robot-knows-to-stop": "robot sensing (K-12 awareness)",
  "rt-teach-pendant-safe-jogging": "industrial robot cell (teach pendant, enabling device, reduced speed)",
  "rt-cobot-power-force-limit-check": "collaborative robot (power and force limiting)",
  "rt-robot-estop-recovery-and-restart": "industrial robot cell (e-stop recovery and restart)",
  "rt-speed-separation-monitoring-setup": "collaborative robot (speed and separation monitoring)",
  "vb-supervising-agent-dispatched-robots": "robots dispatched by software agents (VBRIDGE governor, simulated robots only)",
};
/** The station ids this console authored (kept so the checker can hold them to the station brief). */
export const RP_NEW_STATIONS = ["rp-teleop-demonstration-collection", "rp-robot-policy-evaluation-review", "rp-construction-drilling-robot-setup", "k12-rp-how-a-robot-knows-to-stop"];
/**
 * ROBOTRAIN's four gap stations (console ROBOTRAIN, docs/consoles/ROBOTRAIN.md; WebXR/smartcity/js/sims/rt-*.js) — the gaps
 * ROBOPROG left open: safe teach-pendant use, a cobot power-and-force-limiting check, recovering a robot after an e-stop, and
 * speed-and-separation monitoring set-up. `gap` names the gap each one closes; tools/check_robotrain.mjs measures the coverage.
 */
export const RP_GAP_STATIONS = [
  { id: "rt-teach-pendant-safe-jogging", gap: "teach-pendant", title: "safe teach-pendant use (enabling device, reduced speed)" },
  { id: "rt-cobot-power-force-limit-check", gap: "power-force-limiting", title: "cobot power-and-force-limiting check (ISO/TS 15066 named)" },
  { id: "rt-robot-estop-recovery-and-restart", gap: "estop-recovery", title: "recovering a robot after an e-stop" },
  { id: "rt-speed-separation-monitoring-setup", gap: "speed-separation", title: "speed-and-separation monitoring set-up" },
];
/**
 * ROBOTRAIN's teleoperation demonstration recorder (shared/rt-teleop.js): the learner's controller or mouse pose drives the sim
 * arm and each take is recorded through DATAWORKS' recorder (inert unless opted in). Referenced by name, GUARDED like RP_LOOP.
 */
export const RP_TELEOP_RECORDER = { module: "rt-teleop.js", fn: "rtRecorder", station: "rp-teleop-demonstration-collection",
  what: "A controller (or mouse) pose drives the Teleop Pick-and-Place arm; each take is recorded as a demonstration through DATAWORKS' recorder, so nothing is kept unless an adult, signed-in learner has opted in, and revoking deletes it. Tests use a scripted human stand-in, labelled synthetic." };

// The awareness level's classroom stations (shared by every track) — K-12 science, reading and careers.
const RP_K12 = ["k12-rp-how-a-robot-knows-to-stop", "k12-simple-machines-at-a-crane", "k12-circuits-at-the-electrical-bench", "k12-reading-instructions-and-safety-labels", "k12-es-who-does-this-work"];
// The AI-training level's loop stations (the two ROBOPROG loop stations and VBRIDGE's agent-dispatch supervision), appended to each track's own robot stations.
const RP_AI = ["rp-teleop-demonstration-collection", "rp-robot-policy-evaluation-review", "vb-supervising-agent-dispatched-robots"];

/**
 * Tracks. `levels[level]` lists stations in ladder order; `credentials[level]` lists competency candidates (the best overlap
 * wins; a capstone of the competency's own stations fills the rest — the LA programme's rule). `scenario` is the ROBOTICS gym
 * scenario (rb-robotics-data.js RB_SCENARIOS) and COLEARN scenario the AI-training level demonstrates, trains and evaluates on.
 */
export const RP_TRACKS = [
  { id: "industrial-cells", title: "Industrial robot cells", kinds: "fenced robot cells, palletizers, press and machine tending",
    standards: ["iso-10218-1", "iso-10218-2", "ansi-a3-r15-06", "osha-1910-147"], scenario: "rb-cell-entry", rbSites: ["rb-site-soma-robot-cell"],
    levels: {
      aware: RP_K12,
      operator: ["robot-cell", "rt-robot-estop-recovery-and-restart", "tw-palletizer-cell-fenced-access-permit", "conveyor-guard", "press-brake"],
      technician: ["ad-robot-cell-lockout-and-safe-reentry", "rt-teach-pendant-safe-jogging", "robot-cell", "cnc-cell", "conveyor-guard", "electrical"],
      integrator: ["ad-robot-cell-lockout-and-safe-reentry", "rt-teach-pendant-safe-jogging", "tw-palletizer-cell-fenced-access-permit", "ad-cobot-risk-assessment-and-speed-separation", "robot-cell"],
      "ai-training": ["robot-cell", ...RP_AI],
    },
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], operator: ["core-lockout-tagout", "aerospace-defense-and-robotics"], technician: ["core-lockout-tagout"], integrator: ["aerospace-defense-and-robotics", "situational-awareness"], "ai-training": ["aerospace-defense-and-robotics"] } },
  { id: "cobots", title: "Collaborative robots (cobots)", kinds: "cobot workcells shared with people: speed and separation, power and force limiting",
    standards: ["iso-ts-15066", "iso-10218-1", "iso-10218-2", "ansi-a3-r15-06"], scenario: "rb-cobot-zone-setup", rbSites: ["rb-site-san-jose-robotics-lab"],
    levels: {
      aware: RP_K12,
      operator: ["ad-cobot-risk-assessment-and-speed-separation", "ad-cleanroom-gowning-and-esd-discipline", "robot-cell"],
      technician: ["ad-cobot-risk-assessment-and-speed-separation", "rt-cobot-power-force-limit-check", "ad-robot-cell-lockout-and-safe-reentry", "electrical", "robot-cell"],
      integrator: ["ad-cobot-risk-assessment-and-speed-separation", "rt-speed-separation-monitoring-setup", "rt-cobot-power-force-limit-check", "ad-robot-cell-lockout-and-safe-reentry", "ad-test-stand-exclusion-zone-and-holds", "robot-cell"],
      "ai-training": ["ad-cobot-risk-assessment-and-speed-separation", ...RP_AI],
    },
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], operator: ["aerospace-defense-and-robotics"], technician: ["aerospace-defense-and-robotics", "core-lockout-tagout"], integrator: ["aerospace-defense-and-robotics"], "ai-training": ["aerospace-defense-and-robotics"] } },
  { id: "mobile-amr", title: "Mobile robots and AMRs (warehouses and ports)", kinds: "autonomous mobile robots in aisles and yards, charging, mixed traffic with people and forklifts",
    standards: ["iso-10218-2", "ansi-a3-r15-06", "osha-1910-147"], scenario: "rb-amr-fleet-routing", rbSites: ["rb-site-west-oakland-warehouse", "rb-site-orleans-warehouse", "rb-site-west-oakland-port-automation"],
    levels: {
      aware: RP_K12,
      operator: ["ad-amr-fleet-traffic-and-estop-drill", "tw-amr-traffic-zone-entry-and-lockout", "forklift-dock", "tdl-pick-pack-and-scan"],
      technician: ["tw-amr-traffic-zone-entry-and-lockout", "tw-battery-change-and-charging-bay-safety", "cp-charging-yard-connectors-and-e-stops", "cp-high-voltage-lockout-on-electric-cargo-equipment"],
      integrator: ["ad-amr-fleet-traffic-and-estop-drill", "tw-amr-traffic-zone-entry-and-lockout", "tw-conveyor-jam-clearing-and-loto", "tw-dock-leveler-and-trailer-restraint-check"],
      "ai-training": ["ad-amr-fleet-traffic-and-estop-drill", ...RP_AI],
    },
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], operator: ["warehouse-and-logistics-automation", "aerospace-defense-and-robotics"], technician: ["warehouse-and-logistics-automation"], integrator: ["warehouse-and-logistics-automation"], "ai-training": ["aerospace-defense-and-robotics", "warehouse-and-logistics-automation"] } },
  { id: "construction-robotics", title: "Construction robotics (drilling, layout, demolition)", kinds: "ceiling-drilling and layout robots, remote demolition machines, survey drones on a live site",
    standards: ["iso-10218-2", "osha-1910-147"], scenario: "rb-cobot-zone-setup", rbSites: [],
    levels: {
      aware: RP_K12,
      operator: ["rp-construction-drilling-robot-setup", "bt-masonry-wall-layout-and-mortar", "concrete-pour", "br-drone-shoreline-survey"],
      technician: ["rp-construction-drilling-robot-setup", "electrical", "scaffold-erection", "concrete-pour"],
      integrator: ["rp-construction-drilling-robot-setup", "trench-box", "crane-yard", "steel-erector"],
      "ai-training": ["rp-construction-drilling-robot-setup", ...RP_AI],
    },
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], operator: ["builders-trades", "core-lockout-tagout"], technician: ["core-lockout-tagout", "builders-trades"], integrator: ["situational-awareness", "builders-trades"], "ai-training": ["aerospace-defense-and-robotics"] } },
  { id: "maintenance-lockout", title: "Robot maintenance and lockout", kinds: "service under lockout, jams, e-stop recovery and restart from outside",
    standards: ["osha-1910-147", "iso-10218-2", "ansi-a3-r15-06"], scenario: "rb-cell-entry", rbSites: ["rb-site-soma-robot-cell"],
    levels: {
      aware: RP_K12,
      operator: ["robot-cell", "rt-robot-estop-recovery-and-restart", "conveyor-guard", "tw-conveyor-jam-clearing-and-loto", "ml-parcel-sorter-conveyor-jam-and-loto"],
      technician: ["ad-robot-cell-lockout-and-safe-reentry", "rt-robot-estop-recovery-and-restart", "rt-teach-pendant-safe-jogging", "robot-cell", "motor-control-center", "electrical", "tw-amr-traffic-zone-entry-and-lockout"],
      integrator: ["ad-robot-cell-lockout-and-safe-reentry", "tw-palletizer-cell-fenced-access-permit", "arc-flash-label-study", "robot-cell"],
      "ai-training": ["ad-robot-cell-lockout-and-safe-reentry", ...RP_AI],
    },
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], operator: ["core-lockout-tagout"], technician: ["core-lockout-tagout"], integrator: ["aerospace-defense-and-robotics", "core-lockout-tagout"], "ai-training": ["aerospace-defense-and-robotics"] } },
  { id: "data-ai-training", title: "Data and AI-training roles", kinds: "teleoperation demonstrations, labelling, consent and dataset cards, evaluating robot policies",
    standards: ["iso-10218-2", "iso-ts-15066"], scenario: "rb-teleop-pick-place", rbSites: ["rb-site-san-jose-robotics-lab"],
    levels: {
      aware: RP_K12,
      operator: ["ad-cobot-risk-assessment-and-speed-separation", "rp-teleop-demonstration-collection", "robot-cell"],
      technician: ["rp-teleop-demonstration-collection", "ad-robot-cell-lockout-and-safe-reentry", "ad-amr-fleet-traffic-and-estop-drill"],
      integrator: ["rp-robot-policy-evaluation-review", "rt-speed-separation-monitoring-setup", "ad-cobot-risk-assessment-and-speed-separation", "ad-robot-cell-lockout-and-safe-reentry", "ad-amr-fleet-traffic-and-estop-drill"],
      "ai-training": ["ad-cobot-risk-assessment-and-speed-separation", ...RP_AI],
    },
    credentials: { aware: ["k12-science", "k12-literacy-and-life-skills"], operator: ["aerospace-defense-and-robotics"], technician: ["aerospace-defense-and-robotics"], integrator: ["aerospace-defense-and-robotics"], "ai-training": ["aerospace-defense-and-robotics"] } },
];

/**
 * The loop inside every AI-training level — named mechanisms only. Each step names the module and function that does it
 * (guarded: the programme resolves a step as live only when that function exists in the tree) and the station that teaches
 * the human side of it.
 */
export const RP_LOOP = [
  { id: "consent", title: "Consent first", module: "dx-data.js", fn: "dxOptIn", station: "rp-teleop-demonstration-collection",
    what: "An adult, signed-in learner opts in on DATAWORKS' consent screen; K-12, demo and signed-out sessions never collect. The data stays on the device and revoking deletes it." },
  { id: "demonstrate", title: "Demonstrate", module: "col-learn.js", fn: "colDemosFromEpisodes", station: "rp-teleop-demonstration-collection",
    what: "Consented teleoperation episodes become demonstrations; an episode without a consent receipt is refused. Tests use synthetic demonstrations from the scripted expert with noise (colSyntheticDemos), labelled synthetic." },
  { id: "train", title: "Train a policy (behaviour cloning)", module: "col-learn.js", fn: "colTrain", station: "rp-robot-policy-evaluation-review",
    what: "A k-nearest-neighbour behaviour-cloning policy copies what the demonstrations did in similar moments. It does not plan and does not generalise beyond its demonstrations." },
  { id: "evaluate", title: "Evaluate on held-out seeds", module: "col-learn.js", fn: "colEvalScenario", station: "rp-robot-policy-evaluation-review",
    what: "The policy runs on seeds it never saw, against the scripted expert and a random baseline; the success rate and the gap to the expert are reported as measured." },
  { id: "demonstrates-back", title: "The robot demonstrates back", module: "col-learn.js", fn: "colGhost", station: "rp-robot-policy-evaluation-review",
    what: "The trained policy replays a task as a ghost, with a plain-language explanation of each choice from its features (colExplain, a heuristic, no language model), so the learner can watch it and then try it." },
];
