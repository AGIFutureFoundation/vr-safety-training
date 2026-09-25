import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { workboat, deckCrane } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Workboat Crane Lift From Water VR — SF Bay Restoration &
// Cleanup, Pack B (vessel and marine operations).
//
// A waterlogged drift log is floating low in a channel edge of the Bay, a
// hazard to every small boat that crosses it, and a workboat with a
// knuckle-boom deck crane has come alongside to lift it aboard. The learner
// is the Inlandboatmen's Union deckhand qualified on the boat's crane; a
// second deckhand works the tag line at the rail, the master keeps the boat
// on station from the wheelhouse, and the MEBA engineer is on watch below.
// The log's weight is "the plan's estimate", the crane's capacity is "the
// chart's for this boat", and the sea-state limit is "the crane manual's" —
// no figure is invented. The workboat and the crane are fleet.js builders.

const BRCL_ACCENT = 0x3fa9c9;
const BRCL_CSS = "#3fa9c9";

export const SIM_BR_WORKBOAT_CRANE_LIFT_FROM_WATER = {
  id: "br-workboat-crane-lift-from-water",
  index: "326",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union (IBU) deckhand qualified on a workboat's knuckle-boom crane, with a second IBU deckhand on the tag line, the master at the helm and a MEBA engineer on watch",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "wind",
  certification: "Inlandboatmen's Union (IBU) deck and crane practice; MEBA engineering watch; ASME B30.22 articulating boom cranes and ASME B30.9 slings; OSHA 29 CFR 1926.1437 cranes afloat and 29 CFR 1926.106 work over water; USCG 46 CFR 25 lifesaving equipment on the workboat; NOAA marine forecast for the sea state; debris removal under the BCDC permit and the vessel's crane manual",
  name: "Workboat Crane Lift From Water",
  title: simTitle("Workboat Crane Lift From Water"),
  tagline: "A waterlogged drift log lifted aboard a workboat: PFD and gloves on at the wheelhouse door, the lift plan read, the crane walked, hydraulics opened, the chart read for this boat, the choker passed, tag line and dunnage set, the swing path cleared, the log hoisted through the surface as a swell slackens the hook, swung inboard on the tag line through a roll that sends it at the rail, landed, lashed and logged",
  accent: BRCL_ACCENT,
  accentCss: BRCL_CSS,
  parSeconds: 290,
  footprint: 3.0,
  badge: { id: "heavier-out-of-the-water", name: "Heavier Out Of The Water", note: "The chart read for the boat, the limiter never bypassed, nobody under the log, and both the slack hook and the roll answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union or MEBA — with the employer's employee assistance line behind it",

  game: system({
    name: "Crane Deck",
    currency: "PICK",
    ranks: ["Ordinary", "Deckhand", "Crane Deckhand", "Lead Deckhand", "Deck Crane Certified"],
    badges: [
      { id: "walked-the-crane", name: "Walked The Crane", note: "The crane walked before the hydraulics were opened", test: AWARD.stepClean("crane-walk") },
      { id: "chart-true", name: "Chart True", note: "Capacity read inside the band first time", test: AWARD.precise(0.7) },
      { id: "hands-off-the-log", name: "Hands Off The Log", note: "Never under the load, never a hand on the log, never out through the gate, never the limiter bypassed", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-pick", name: "Clean Pick", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "smooth-hoist", name: "Smooth Hoist", note: "Hoist held in band all the way through the surface", test: AWARD.unbroken },
      { id: "on-station", name: "On Station", note: "Lift logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-load-at-rail": "You stood inboard of the rail under the log's swing path as it came aboard. A waterlogged log is dense, slick and unpredictable in a choker; if it slips, or the boat rolls as it swings, it comes down on whoever is under it — the swing path is cleared before the lift and nobody stands in it until the load is landed.",
    "hand-on-log": "You reached out to fend the swinging log off with your hands. A suspended log has momentum the arms cannot stop, and fending it pins the hand between log and rail or knocks the person off balance at an open gate — the tag line controls the log, from a distance, and a log that is swinging wrong is stopped with the crane.",
    "lean-through-gate": "You leaned out through the open rail gate to reach the log with a boat hook. An open gate on a rolling workboat is a gap straight into the water, and reaching out through it puts the body's weight past the edge — the work vest keeps a person afloat, but the log and the hull are right there; the log is reached with the hook from inside the rail or not at all.",
    "overload-bypass": "You turned the crane's overload limiter bypass key to get the lift moving. The limiter is what stops the crane lifting past its chart; a log that trips it is heavier than planned — full of water or snagged — and bypassing it is how a knuckle crane tears its pedestal out of the deck or rolls a small boat. The answer to a trip is to stop, not to override.",
  },

  lateNotes: {
    "crane-lever": "The hoist comes up once the choker is on the pick point, the tag line is set and the swing path is clear — not before.",
    "crane-chart": "The chart is read once the crane has been walked and its hydraulics opened, before anything is rigged to the hook.",
    "crane-log": "The lift is logged once the log is landed and lashed — last, not first.",
  },

  steps: [
    {
      id: "pfd-and-gloves", kind: "sequence", anyOrder: true,
      targets: ["crane-vest", "rigging-gloves"],
      itemNames: { "crane-vest": "work vest (PFD) on and fastened", "rigging-gloves": "rigging gloves" },
      title: "PFD and gloves on at the wheelhouse door",
      cue: "At the wheelhouse door, before stepping out onto the afterdeck: work vest on and fastened, rigging gloves on.",
      why: "The afterdeck of a small workboat is low to the water and wet, and a lift over the side means an open gate in the rail for most of the job. The work vest goes on before the deck, not at the rail, because the moment someone needs it is not one they choose; the gloves go on because a wet choker and a hydraulic hose fitting both take skin off a bare hand.",
    },
    {
      id: "lift-plan", kind: "select", target: "lift-plan",
      title: "Read the lift plan with the master",
      cue: "Read the plan: the log's estimated weight, the pick point, the crane's chart for this boat, the sea-state limit in the crane manual, where it lands, and who does what.",
      why: "A log that has been in the Bay for months is heavier than it looks and heavier again once it is out of the water, where it loses the lift the water was giving it. The plan puts the estimate beside the chart for this crane on this boat, and it names the sea-state limit, because a knuckle crane on a small hull is rated for a boat that is not rolling — the master and the deck agree the limits before the crane moves.",
    },
    {
      id: "crane-walk", kind: "find", noHint: true,
      targets: ["hose-leak", "hook-latch"],
      itemNames: { "hose-leak": "hydraulic fitting weeping at the boom cylinder", "hook-latch": "hook safety latch bent open" },
      itemNotes: {
        "hose-leak": "The hose fitting at the main boom cylinder is weeping oil down the pedestal — a weeping fitting under load is one that lets go, and the oil it drips makes the deck under the operator slick.",
        "hook-latch": "The hook's safety latch is bent and does not close — a choker eye can jump the hook when the load goes slack in a swell and comes taut again.",
      },
      title: "Walk the crane before it moves",
      cue: "Walk the crane from the pedestal to the hook: hydraulic hoses and fittings, pins, the wire, the hook and its latch.",
      why: "A deck crane lives in salt spray and works in short bursts, so it fails at its hoses, its pins and its hook latch, and it fails under load. ASME B30.22 puts a frequent inspection on the operator for exactly this reason: the few minutes spent walking the crane on deck are the only time anyone gets close enough to see a weeping fitting before it is holding a log over the side.",
    },
    {
      id: "open-hydraulics", kind: "turn", target: "crane-valve",
      title: "Open the crane's hydraulic supply",
      cue: "Turn the crane's hydraulic supply valve open on the manifold and watch the pressure lamp come up before touching the controls.",
      why: "The crane runs off the boat's hydraulic system, and opening its supply slowly lets the lines fill and the pressure come up without a surge through the fitting you have just flagged. The operator watches the pressure come up before the controls are touched, because a crane that moves on half pressure moves unpredictably — and the engineer below needs to know the crane is now drawing on the system.",
      turn: { turns: 1.25, label: "HYDRAULIC SUPPLY", readout: (t) => (t < 0.35 ? "valve shut" : t < 0.9 ? "lines filling" : "supply open · pressure up") },
    },
    {
      id: "read-chart", kind: "gauge", target: "crane-chart",
      title: "Read the crane's capacity for this boat",
      cue: "Read the chart's capacity at the outreach the log is at, for the boat's condition today, and commit it against the plan's estimate plus the choker.",
      why: "A knuckle crane's capacity falls away as it reaches out, and on a small boat the chart is set as much by how far the hull can heel as by the crane's own strength. The outreach to a log alongside is near the end of the boom, so the capacity there — not the figure on the pedestal plate — is the one set against the estimate, before anything is rigged.",
      gauge: { label: "CAPACITY AT OUTREACH", speed: 0.72, green: [0.42, 0.58], readout: (t) => (t < 0.42 ? "under the estimate — no lift" : t <= 0.58 ? "inside the chart for this boat" : "past the chart — bring the boat closer"), missNote: "Outside the band — read the capacity at the outreach the log is really at, for this boat, not the pedestal plate." },
    },
    {
      id: "rig-choker", kind: "drag", target: "choker",
      title: "Pass the choker round the log at the pick point",
      cue: "Send the choker down on the hook and see it passed round the log at the painted pick point, the eye choked up tight, from inside the rail with the boat hook.",
      why: "A log picked off its middle hangs level and comes aboard under control; picked off one end it stands up, swings and slides out of the choker. The choker goes round at the pick point and is choked tight before any strain, and it is worked from inside the rail with the boat hook so nobody has to reach out over the water to seat it.",
      drag: { to: "log-pick-point", radius: 0.6, missNote: "Not at the pick point — the choker has to go round the log at the painted mark, or the log will stand on end when it lifts." },
    },
    {
      id: "tag-and-dunnage", kind: "sequence", anyOrder: true,
      targets: ["tagline-log", "landing-dunnage"],
      itemNames: { "tagline-log": "tag line made fast to the log's end", "landing-dunnage": "dunnage laid across the landing area" },
      title: "Set the tag line and lay the landing dunnage",
      cue: "Make the tag line fast to the log's inboard end and lead it back inside the rail, and lay the dunnage across the landing area so the log lands on timber, not on the deck.",
      why: "The tag line is how the deck steadies the log without touching it, and it goes on before the lift because nobody can reach the log once it is in the air. The dunnage gives the log something to land on that will not let it roll and leaves room to pull the choker out from under it — a log landed flat on a wet deck pins the choker and invites someone to reach under it.",
    },
    {
      id: "swing-path", kind: "find", noHint: true,
      targets: ["loose-bag", "open-hatch"],
      itemNames: { "loose-bag": "gear bag left in the swing path", "open-hatch": "deck hatch open in the landing area" },
      itemNotes: {
        "loose-bag": "A gear bag has been left on deck right where the log will swing in — something to trip over while watching a load, and something the log will land on.",
        "open-hatch": "The lazarette hatch is open beside the landing area — a hole to step into while tending the tag line, and one the log's end could drop into if the boat rolls.",
      },
      title: "Clear the swing path and the landing area",
      cue: "Walk the path the log will swing through and the landing area: anything left on deck, anything open, anyone who would be under it.",
      why: "Everyone on deck will be watching the log once it is in the air, not their feet, so the deck has to be clear before the lift. A bag in the swing path and an open hatch in the landing area are how a deckhand ends up stumbling backward toward an open gate with a tag line in their hands — clearing them is quicker than any lift.",
    },
    {
      id: "hoist-through", kind: "track", target: "crane-lever", seconds: 6,
      title: "Hoist the log slowly through the surface",
      cue: "Feather the hoist lever to bring the log up through the surface slowly, keeping the load steady in band as the water runs out of it.",
      why: "The load on the hook climbs as the log comes out of the water and loses the water's support, and climbs again with every roll of the boat. Hoisting slowly and steadily lets the operator see the load build against the chart and stop before the limiter does it for them; a fast hoist in a seaway is how a small crane is shock-loaded and a small boat is heeled hard.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.44, drift: 0.13, label: "HOOK LOAD", readout: (v) => (v < 0.42 ? "slack — choker not biting" : v > 0.6 ? "snatching — ease the hoist" : "steady — draining") },
      holdBreakNote: "The load broke out of band — the hoist snatched or went slack. Feather it back to a slow steady lift and hold it.",
    },
    {
      id: "tag-hold", kind: "hold", target: "tagline-log", seconds: 5,
      title: "Steady the log inboard on the tag line",
      cue: "As the crane slews the log inboard, keep a steady pull on the tag line from inside the rail, feeding it through open hands.",
      why: "A log swinging in over a rolling deck wants to keep swinging, and a steady pull on the tag line takes the swing out before it reaches the rail or a person. The line runs through open hands and never round a wrist, because if the log drops or the boat rolls hard the line goes with it — and whoever has it wrapped goes too.",
      holdBreakNote: "Let go of the tag line mid-swing — the log swung toward the rail. Take it up again and hold a steady pull.",
    },
    {
      id: "land-log", kind: "drag", target: "hook-load",
      title: "Land the log on the dunnage",
      cue: "Bring the log down onto the dunnage in the landing area, level, and let the crane take the weight off only once it is sitting.",
      why: "The log is landed on the dunnage so it cannot roll and the choker can be freed without anyone reaching under it. It comes down slowly and level, and the operator keeps a little weight on the hook until it is sitting, because a log dropped the last few centimetres bounces and rolls on a wet deck.",
      drag: { to: "landing-dunnage", radius: 0.6, missNote: "Not on the dunnage — land the log across the timbers, not on the bare deck beside them." },
    },
    {
      id: "lash-log", kind: "turn", target: "lash-ratchet",
      title: "Lash the log to the deck pad-eyes",
      cue: "Pass the strap over the log to the pad-eyes and ratchet it taut before the choker comes off.",
      why: "A log on deck is a heavy round object on a boat that rolls, and until it is lashed it can move — onto a foot, against the rail, through the open gate. It is lashed before the choker is freed, so there is never a moment when it is sitting loose, and the gate is closed only once the lashing is on.",
      turn: { turns: 1.25, label: "LASHING RATCHET", readout: (t) => (t < 0.4 ? "strap loose" : t < 0.95 ? "strap taking up" : "strap taut · locked") },
    },
    {
      id: "crane-log", kind: "select", target: "crane-log",
      title: "Log the lift and the crane's defects",
      cue: "Log the lift: the load read against the estimate, the weeping fitting and the bent latch, the slack hook in the swell, and the roll that sent the log at the rail.",
      why: "The crane log is where a weeping fitting becomes a repair before the next lift and a bent latch becomes a new hook, and the load actually read against the estimate tells the next crew how far a waterlogged log can be from a guess. The swell and the roll go in too, because they are the conditions the crane manual's limits are about.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the master, the deckhand and the engineer",
      cue: "On the radio: the log is aboard and lashed, what the crane needs, and how everyone is after a hook that went slack and a log that swung at the rail.",
      why: "The master held the boat on station through a swell and a roll without seeing the deck, and the engineer has a hydraulic fitting to look at — both need the deck's report now. It is also the crew's own check-in: a log swinging at a deckhand on an open rail is the kind of moment that deserves to be talked through, and the union's member assistance line is there for what does not get said on the radio.",
    },
  ],

  interrupts: [
    {
      id: "swell-slack-hook",
      kind: "Swell slackens the hook",
      after: "hoist-through", delay: 2, seconds: 14,
      alert: "A ferry's wake is rolling in: the boat lifts on the swell, the hook goes slack over the log, and the next trough will snatch it taut.",
      cue: "Hold the hoist in neutral and call the master on the wheelhouse intercom to put the bow into the swell.",
      target: "wheelhouse-intercom",
      why: "A hook that goes slack and then snatches taut in a swell puts a shock load on the crane far above the log's weight, and the crane cannot fix that on its own — the boat has to meet the swell. Holding the hoist and telling the master is the answer, because the master can turn the boat into the wake and the operator cannot.",
      missNote: "The hoist kept coming as the boat dropped off the swell; the choker snatched taut, the limiter tripped mid-air, and the log swung out and back against the hull with the hook latch already bent.",
      wrongNote: "The wheelhouse intercom — the master needs to put the bow into the swell before the hook snatches.",
    },
    {
      id: "roll-swings-log",
      kind: "Roll swings the log at the rail",
      after: "tag-hold", delay: 2, seconds: 14,
      alert: "The boat takes a hard roll and the log swings in toward the second deckhand standing by the open gate.",
      cue: "Hit the crane's emergency stop on the operator's console so every crane motion stops, and shout the deckhand clear.",
      target: "crane-estop",
      why: "A swinging load moving toward a person is stopped by stopping the crane, not by anyone trying to catch it. The emergency stop freezes every motion so the operator is not adding slew or hoist to the swing, and the shout moves the deckhand back from the gate — the tag line then damps what is left.",
      missNote: "The crane kept slewing as the boat rolled; the log swung into the deckhand by the open gate and knocked them against the rail.",
      wrongNote: "The emergency stop on the console — freeze the crane first, then let the tag line take the swing out.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRCL_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 22, 0.02, 20, 0, 0.04, -2, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0e2b36", mid: "#143a48" }), { repeat: 5, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x7fa8b8 });
    const wave = box(g, 6, 0.02, 0.6, 3.0, 0.05, -2.0, 0xd9f0f4, { rough: 0.3, emissive: 0x9fd8e8, ei: 0.4, cast: false });
    wave.visible = false;

    // --------------------- the workboat, stern to the learner, deck at 0.41
    const boat = group(g, 0, 0, 0);
    const wb = workboat(boat, 0, -0.79, 0.3, { ry: Math.PI, livery: { fleetName: "HARBOR WORKS", unitNumber: "WB-5" } });
    const DECK = 0.41;
    void wb;
    const crane = deckCrane(boat, 1.7, DECK, 2.4, { ry: Math.PI / 2, boomAngle: 0.85, jibAngle: 1.9 });
    const { controls, hook } = crane.userData.parts;
    holoTag(boat, "crane controls — hoist", -0.27, DECK + 1.05, 1.95, { css: BRCL_CSS, w: 0.4 });
    reg(hits, controls, "crane-lever");

    // ------------------------------------------------------------- the log
    const log = group(g, 3.1, 0.1, 2.3);
    const logBody = cyl(log, 0.28, 0.3, 2.2, 0, 0, 0, 0x4a3a2a, { rough: 0.95, seg: 14 });
    logBody.rotation.x = Math.PI / 2;
    box(log, 0.58, 0.08, 1.6, 0, -0.18, 0, 0x3f5a3a, { rough: 0.95 });
    const pick = box(log, 0.08, 0.62, 0.12, 0, 0.02, 0, 0xf2c14b, { rough: 0.6, emissive: 0x6a5010, ei: 0.4 });
    reg(hits, pick, "log-pick-point");
    holoTag(log, "drift log — pick mark", 0, 0.55, 0, { css: BRCL_CSS, w: 0.36 });
    reg(hits, log, "hook-load");
    const logHome = log.position.clone();
    const chokerRing = torus(log, 0.33, 0.03, 0, 0, 0, 0x7b4fc8, { rough: 0.8, seg: 6, seg2: 18 });
    chokerRing.visible = false;
    const leg = hose(g, [[3.09, 1.2, 2.46], [3.1, 0.8, 2.4], [3.1, 0.4, 2.3]], 0.025, 0x7b4fc8, { steps: 8, rough: 0.8 });
    leg.visible = false;
    const choker = group(boat, 1.0, DECK, 2.25);
    for (let i = 0; i < 2; i++) torus(choker, 0.12 - i * 0.03, 0.02, 0, 0.03 + i * 0.03, 0, 0x7b4fc8, { rough: 0.8, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(choker, "choker", 0, 0.3, 0, { css: BRCL_CSS, w: 0.18 });
    reg(hits, choker, "choker");
    const latch = box(g, 0.05, 0.08, 0.03, 3.14, 1.34, 2.46, 0xd2312b, { rough: 0.4, emissive: 0x4a0808, ei: 0.4 });
    reg(hits, latch, "hook-latch");
    void hook;

    // ----------------------------------------- deck: rack, valve, crane walk
    const rack = group(boat, -0.9, DECK, 1.3);
    cyl(rack, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const vest = group(rack, 0, 1.0, 0.07);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.08, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest — PFD", 0, 1.45, 0, { css: BRCL_CSS, w: 0.3 });
    reg(hits, vest, "crane-vest");
    const gloves = box(boat, 0.18, 0.05, 0.12, -0.55, DECK + 0.02, 1.0, 0xd8a63a, { rough: 0.9 });
    holoTag(boat, "rigging gloves", -0.55, DECK + 0.25, 1.0, { css: BRCL_CSS, w: 0.26 });
    reg(hits, gloves, "rigging-gloves");
    const leak = box(boat, 0.06, 0.12, 0.06, 0.55, DECK + 1.5, 2.52, 0x2a2410, { rough: 0.2, metal: 0.6, emissive: 0x3a2a08, ei: 0.3 });
    reg(hits, leak, "hose-leak");
    const valve = group(boat, 0.75, DECK, 1.25);
    box(valve, 0.3, 0.5, 0.2, 0, 0.25, 0, 0x2f4f6f, { rough: 0.55, metal: 0.4 });
    const wheel = group(valve, 0, 0.6, 0.12);
    torus(wheel, 0.1, 0.014, 0, 0, 0, 0xd2312b, { rough: 0.55, seg: 8, seg2: 20 });
    box(wheel, 0.2, 0.014, 0.014, 0, 0, 0, 0xd2312b, { rough: 0.55 });
    const pressLamp = box(valve, 0.06, 0.06, 0.02, 0.1, 0.42, 0.11, 0x5a1a14, { rough: 0.4, emissive: 0x3a0a08, ei: 0.4 });
    holoTag(valve, "crane hydraulic supply", 0, 0.85, 0, { css: BRCL_CSS, w: 0.4 });
    reg(hits, valve, "crane-valve");

    // --------------------------------------------- the chart and the boards
    const chart = group(boat, -0.95, DECK, 2.0);
    cyl(chart, 0.03, 0.04, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const dial = box(chart, 0.3, 0.22, 0.05, 0, 1.0, 0, 0x101820, { rough: 0.4, emissive: 0x0d1c24, ei: 0.4 });
    dial.rotation.x = -0.35;
    const needle = box(chart, 0.01, 0.09, 0.012, 0, 1.0, 0.035, 0xd2312b, { rough: 0.4 });
    holoTag(chart, "crane chart — this boat", 0, 1.28, 0, { css: BRCL_CSS, w: 0.4 });
    reg(hits, chart, "crane-chart");
    const drawPlan = (cx, w, h, done) => {
      cx.fillStyle = "#08141a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRCL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8eef6"; cx.fillText("LIFT PLAN — DRIFT LOG", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Load: waterlogged log, plan's estimate", "Pick: painted mark, choker at centre", "Capacity: crane chart for this boat",
        "Sea state: crane manual's limit", "Landing: dunnage aft, lash to pad-eyes", "Tag line: second deckhand, inside rail",
        "Master holds station, bow to the swell"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const plan = holoPanel(boat, 0.74, 0.5, -1.05, 1.65, 0.75, (cx, w, h) => drawPlan(cx, w, h, false), { ry: 0.5, accent: BRCL_ACCENT });
    reg(hits, plan, "lift-plan");
    const drawLog = (cx, w, h, rows, done) => {
      cx.fillStyle = "#08141a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRCL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8eef6"; cx.fillText("CRANE LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#eaf6fb";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.38 + i * 0.17)));
    };
    const clog = holoPanel(boat, 0.62, 0.44, 1.1, 1.65, 0.8, (cx, w, h) => drawLog(cx, w, h, ["Lift: —", "Defects: —", "Remarks: —"], false), { ry: -0.5, accent: BRCL_ACCENT });
    reg(hits, clog, "crane-log");

    // ---------------------------------------- operator's console and radios
    const console_ = group(boat, -0.95, DECK, 2.75);
    cyl(console_, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(console_, 0.26, 0.12, 0.22, 0, 1.04, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    const estop = group(console_, -0.06, 1.12, 0);
    cyl(estop, 0.045, 0.045, 0.04, 0, 0.02, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    const estopLamp = box(console_, 0.04, 0.03, 0.02, 0.07, 1.08, 0.115, 0x2a3a2a, { rough: 0.4, emissive: 0x0a1a0a, ei: 0.3 });
    holoTag(console_, "crane emergency stop", -0.06, 1.35, 0, { css: BRCL_CSS, w: 0.38 });
    reg(hits, estop, "crane-estop");
    const keyHit = box(console_, 0.1, 0.1, 0.1, 0.08, 1.14, -0.05, 0xe8b02e, { rough: 0.4, metal: 0.6 });
    holoTag(console_, "limiter bypass key?", 0.14, 1.52, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, keyHit, "overload-bypass");
    const icom = group(boat, 0.3, DECK, 1.55);
    cyl(icom, 0.022, 0.022, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(icom, 0.14, 0.2, 0.08, 0, 1.08, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const whLamp = box(icom, 0.04, 0.04, 0.02, 0, 1.15, 0.045, 0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
    holoTag(icom, "wheelhouse intercom", 0, 1.32, 0, { css: BRCL_CSS, w: 0.36 });
    reg(hits, icom, "wheelhouse-intercom");
    const radio = group(boat, -0.35, DECK + 0.95, 0.58);
    box(radio, 0.08, 0.2, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const radioLamp = box(radio, 0.05, 0.03, 0.005, 0, 0.05, 0.028, 0x0d1c24, { rough: 0.3, emissive: 0x2a6f8f, ei: 0.6 });
    holoTag(radio, "crew radio", 0, 0.2, 0.03, { css: BRCL_CSS, w: 0.22 });
    reg(hits, radio, "crew-radio");

    // ------------------------------------ tag line, dunnage, swing path, lash
    const tagCoil = group(boat, 1.0, DECK, 1.75);
    for (let i = 0; i < 2; i++) torus(tagCoil, 0.13 - i * 0.03, 0.014, 0, 0.02 + i * 0.03, 0, 0x2f8f5a, { rough: 0.85, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(tagCoil, "tag line", 0, 0.3, 0, { css: BRCL_CSS, w: 0.18 });
    reg(hits, tagCoil, "tagline-log");
    const tagLine = hose(g, [[1.0, DECK + 0.05, 1.75], [2.0, 0.6, 1.5], [3.1, 0.3, 1.25]], 0.012, 0x2f8f5a, { steps: 8, rough: 0.85 });
    tagLine.visible = false;
    const dunnage = group(boat, -0.85, DECK, 3.45);
    for (const dx of [-0.1, 0.1]) box(dunnage, 0.12, 0.1, 0.9, dx, 0.05 + (dx > 0 ? 0.1 : 0), 0, 0x9a7a52, { rough: 0.9 });
    holoTag(dunnage, "dunnage", 0, 0.4, 0, { css: BRCL_CSS, w: 0.18 });
    reg(hits, dunnage, "landing-dunnage");
    const bag = box(boat, 0.4, 0.24, 0.26, 0.75, DECK + 0.12, 2.9, 0x2b4a6a, { rough: 0.85 });
    reg(hits, bag, "loose-bag");
    const hatch = group(boat, 0.35, DECK, 3.35);
    box(hatch, 0.6, 0.02, 0.5, 0, 0.01, 0, 0x15181c, { rough: 0.8 });
    const lid = box(hatch, 0.6, 0.04, 0.5, 0, 0.26, -0.25, 0x8d949b, { rough: 0.5, metal: 0.6 });
    lid.rotation.x = -1.3;
    reg(hits, hatch, "open-hatch");
    const lash = group(boat, 1.05, DECK, 3.5);
    torus(lash, 0.05, 0.015, 0, 0.06, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6, seg2: 12 });
    const ratchet = box(lash, 0.1, 0.06, 0.16, -0.12, 0.05, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    holoTag(lash, "lashing ratchet", 0, 0.3, 0, { css: BRCL_CSS, w: 0.28 });
    reg(hits, lash, "lash-ratchet");
    const strap = hose(boat, [[1.05, DECK + 0.06, 3.5], [0.2, DECK + 0.62, 3.3], [-1.05, DECK + 0.06, 3.1]], 0.02, 0xe8b02e, { steps: 10, rough: 0.7 });
    strap.visible = false;

    // --------------------------------------- the rail gate and the hazards
    const gate = group(boat, 1.22, DECK, 2.1);
    const gateArm = group(gate, 0, 0, 0);
    for (const y of [0.45, 0.8]) box(gateArm, 0.04, 0.04, 0.6, 0, y, 0.3, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    gateArm.rotation.y = -1.5;
    const gateHit = box(boat, 0.5, 0.9, 0.6, 1.45, DECK + 0.5, 2.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(boat, "lean out the gate with the hook?", 1.5, DECK + 1.15, 2.7, { css: "#d2312b", w: 0.56 });
    reg(hits, gateHit, "lean-through-gate");
    const underHit = box(boat, 0.8, 1.0, 0.6, 0.45, DECK + 0.5, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(boat, "stand in the swing path?", 0.45, DECK + 1.2, 2.0, { css: "#d2312b", w: 0.44 });
    reg(hits, underHit, "under-load-at-rail");
    const fendHit = box(g, 0.6, 0.6, 0.8, 2.2, 1.0, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fend the log by hand?", 2.2, 1.5, 2.4, { css: "#d2312b", w: 0.4 });
    reg(hits, fendHit, "hand-on-log");

    // ------------------------------------------------------------- crew
    const deckhand = standingFigure(boat, -0.35, 3.65, { ry: Math.PI / 2 + 0.4, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    deckhand.position.y = DECK;
    holoTag(deckhand, "second deckhand — tag line", 0, 1.95, 0, { css: BRCL_CSS, w: 0.44 });
    const deckhandHome = deckhand.position.clone();
    const engineer = standingFigure(boat, 0.5, 0.72, { ry: 0.3, vest: 0xf06a2b, cloth: 0x3f4a55, gloves: true, atStation: true });
    engineer.position.y = DECK;
    holoTag(engineer, "MEBA engineer", 0, 1.95, 0, { css: BRCL_CSS, w: 0.28 });

    const waterTex = water.material.map;
    return {
      hits,
      spawnLook: new THREE.Vector3(1.2, 0.9, 1.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "crane-walk") { leak.material = mat(0x2b3138, { rough: 0.5 }); latch.material = mat(0xb9bfc5, { rough: 0.3, metal: 0.85 }); }
        if (step.id === "open-hydraulics") pressLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "rig-choker") { chokerRing.visible = true; leg.visible = true; choker.visible = false; }
        if (step.id === "tag-and-dunnage") { tagLine.visible = true; dunnage.position.set(0.1, DECK, 3.25); dunnage.rotation.y = Math.PI / 2; }
        if (step.id === "swing-path") { bag.visible = false; lid.rotation.x = 0; lid.position.set(0, 0.03, 0); }
        if (step.id === "hoist-through") { log.position.set(logHome.x, 0.85, logHome.z); leg.visible = false; }
        if (step.id === "tag-hold") { log.position.set(1.9, 1.05, 2.4); tagLine.visible = false; }
        if (step.id === "land-log") { log.position.set(0.1, DECK + 0.45, 3.25); log.rotation.y = Math.PI / 2; }
        if (step.id === "lash-log") strap.visible = true;
        if (step.id === "crane-log") repaint(clog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Lift: log aboard · load vs estimate", "Defects: boom fitting, hook latch", "Remarks: wake slack · roll at the rail"], true));
        if (step.id === "crew-checkin") { radioLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 }); repaint(plan.userData.face, (cx, w, h) => drawPlan(cx, w, h, true)); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "swell-slack-hook") { wave.visible = true; boat.rotation.z = -0.06; whLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.3 }); }
        if (it.id === "roll-swings-log") { boat.rotation.z = 0.07; log.position.set(1.5, 1.05, 2.9); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "swell-slack-hook") { boat.rotation.z = 0; wave.position.z = -4.5; whLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
        if (it.id === "roll-swings-log") { boat.rotation.z = 0; estopLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.3 }); deckhand.position.set(deckhandHome.x - 0.45, deckhandHome.y, deckhandHome.z + 0.1); log.position.set(1.9, 1.05, 2.4); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.005; waterTex.offset.y = t * 0.006; }
        if (session?.turn && step?.id === "open-hydraulics") wheel.rotation.z = session.turn.amount * Math.PI * 2;
        if (session?.turn && step?.id === "lash-log") ratchet.rotation.x = session.turn.amount * 3;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-chart") needle.rotation.z = -1.2 + gg.t * 2.4;
        if (step?.id === "hoist-through" && session.holding) log.position.y = 0.1 + (session.track?.v ?? 0) * 0.9;
        if (wave.visible) wave.position.x = 3.0 - ((t * 0.8) % 6);
      },
    };
  },
};
