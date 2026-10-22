import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, torus, group, hose, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { boxTruck } from "../../../shared/fleet.js";

// SmartCiti.X~ Newsroom Storm Scene & Live Truck Mast VR — Screen & Media
// Crafts.
//
// A flooded street corner during a live storm standup: a NewsGuild-CWA field
// crew raising a live truck's telescoping mast under a power line the truck
// was never meant to get close to. The learner is the field engineer who
// reads the assignment sheet, dresses rain gear and rubber boots, sweeps the
// scene for a branch resting on the guy line, a frayed spare line and an
// open storm drain, checks the mast's clearance chart against the power
// line's height, drives the truck's ground rod before touching a single
// mast control, reads the wind gauge before raising, locks the outriggers,
// raises the mast watching its clearance, confirms the producer before
// going live, watches the mast's sway stay inside its safe band, anchors
// the guy line, confirms the IFB, and logs the shot — with a gust pushing
// the mast toward the line and rising floodwater around the stabilizer legs
// both needing an answer that is not the control already in the learner's
// hand. The station, the storm and the street are generic.

const NSM_ACCENT = 0x26c6da;
const NSM_CSS = "#26c6da";

export const SIM_MD_NEWSROOM_STORM_SCENE_AND_LIVE_TRUCK_MAST = {
  id: "md-newsroom-storm-scene-and-live-truck-mast",
  index: "714",
  domain: "Screen & Media Crafts",
  trade: "NewsGuild-CWA field engineer, raising a live truck's telescoping mast at a flooded storm standup under an overhead power line",
  category: "Entertainment & Live Events",
  weather: "storm",
  certification: "NewsGuild-CWA member safety guidance for broadcast and news field crews; FCC RF exposure limits for the mast's transmission antenna; OSHA 29 CFR 1910.268 telecommunications work practices for the telescoping mast; NEC/NFPA 70 clearance practice for work near overhead power lines; NFPA 101 Life Safety Code requirements for the crew's escape route off the flooded scene",
  name: "Newsroom Storm Scene & Live Truck Mast",
  title: simTitle("Newsroom Storm Scene & Live Truck Mast"),
  tagline: "A flooded corner before a live storm standup: the assignment sheet read, rain gear and boots on, the scene swept for a branch on the guy line and an open storm drain, the clearance chart checked against the power line, the ground rod driven before a single mast control is touched, the wind gauge read, the outriggers locked, the mast raised watching its clearance, the producer confirmed, the mast's sway watched inside its band, the guy line anchored, the IFB confirmed, and the shot logged — a gust pushing the mast toward the line and rising floodwater around the stabilizer legs both answered off a control that isn't the one already in the learner's hand",
  accent: NSM_ACCENT,
  accentCss: NSM_CSS,
  parSeconds: 340,
  footprint: 3.0,
  badge: { id: "mast-up-crew-dry", name: "Mast Up, Crew Dry", note: "The ground rod driven before any mast control was touched, the clearance held the whole raise, and the gust and the rising water both answered before either one became the story" },

  supportLine: "your NewsGuild-CWA local's member assistance contact, or the station's own employee assistance programme",

  game: system({
    name: "Live Truck",
    currency: "SIGNAL",
    ranks: ["Desk Assistant", "Field Producer", "ENG Photographer", "Field Engineer", "Chief Engineer Certified"],
    badges: [
      { id: "grounded-first", name: "Grounded First", note: "Never touched a mast control before the ground rod was driven", test: AWARD.stepClean("ground-rod-check") },
      { id: "gust-answered", name: "Gust Answered", note: "The gust toward the power line was stowed off the emergency switch, not ridden out", test: AWARD.unbroken },
      { id: "never-under-the-mast", name: "Never Under the Mast", note: "Never raised the mast before the ground rod, never stepped into floodwater near a cable, never released a loaded outrigger, never blocked the escape route", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-standup", name: "Clean Standup", note: "No corrections from the assignment to the closing log", test: AWARD.clean },
      { id: "steady-sway", name: "Steady Sway", note: "The mast's sway held its band the whole live shot, first time", test: AWARD.precise(0.7) },
      { id: "live-on-time", name: "Live On Time", note: "Mast up and confirmed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "raise-mast-without-ground-check": "You reached for the mast's raise control before the truck's ground rod was driven. A telescoping mast is the tallest metal object on the block the moment it goes up, and the ground rod is what gives a stray charge somewhere to go besides through the truck's own frame and whoever is standing on the running board.",
    "step-in-floodwater-near-cable": "You stepped into standing floodwater near a downed line without checking it first. Water does not announce which puddle has a live conductor sitting in it and which one is just rain, and the only safe assumption in a flooded scene is that any water near a line could be carrying a charge until somebody who knows says otherwise.",
    "release-outrigger-while-raised": "You released an outrigger's lock while the mast was still up. The outriggers are what keeps the truck stable against the mast's own leverage once it's extended, and releasing one while the mast is loaded turns a stable platform into one leaning on three legs instead of four.",
    "block-escape-route-with-gear": "You set a gear case down in the crew's marked escape route off the flooded scene. That route is the one path back to dry, stable ground if the water rises faster than the forecast said it would, and a case sitting in it is a case somebody has to clear before the route does what it's there for.",
  },

  lateNotes: {
    "mast-raise-control": "The mast only comes up once the ground rod is driven and the outriggers are locked — raising it before either of those is raising it on hope.",
    "producer-radio": "The producer confirms only once the mast is up and the clearance is proven — confirming a shot that isn't ready yet just sets a countdown for nobody.",
    "field-log": "The log is written last, after the guy line is anchored and the IFB is confirmed.",
  },

  steps: [
    {
      id: "read-assignment", kind: "select", target: "assignment-sheet",
      title: "Read the storm assignment sheet",
      cue: "Read today's assignment: the standup location, the live shot time, and the power line clearance chart for this truck's mast.",
      why: "The assignment is where today's shot is actually specified before the truck is even parked — where the standup goes, when it airs, and which of this truck's own clearance charts applies to the specific line running over this particular corner.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["rain-gear", "rubber-boots"],
      itemNames: { "rain-gear": "rain gear", "rubber-boots": "rubber boots" },
      title: "Rain gear and rubber boots on before stepping into the scene",
      cue: "Put on rain gear and rubber boots before stepping off the truck into standing water.",
      why: "A flooded storm scene is worked in gear rated for it, not whatever kept the rain off on the drive over — rubber boots are what keeps floodwater's own unknowns off bare skin, and both go on before the first step off the truck, not once a boot is already wet.",
    },
    {
      id: "scene-sweep", kind: "find", noHint: true,
      targets: ["downed-branch-on-guy-line", "frayed-spare-guy-line", "open-storm-drain-near-mark"],
      itemNames: { "downed-branch-on-guy-line": "branch resting on the guy line", "frayed-spare-guy-line": "frayed spare guy line", "open-storm-drain-near-mark": "open storm drain near the standup mark" },
      itemNotes: {
        "downed-branch-on-guy-line": "A storm-broken branch is resting across the mast's guy line, adding weight and tension the line was never rigged to carry. It gets cleared before the mast is trusted to hold anything else against it.",
        "frayed-spare-guy-line": "The spare guy line coiled on the truck has a frayed section near its clip — easy to grab in a hurry if the good line isn't obviously the one in reach. A frayed line holds fine right up until the mast's own load actually tests it.",
        "open-storm-drain-near-mark": "The storm drain beside the standup mark has lost its cover in the flooding. A reporter backing up a step mid-live-shot has no way to see an open drain under floodwater, and it's marked and barricaded before anyone stands anywhere near it.",
      },
      title: "Sweep the scene before the mast goes up",
      cue: "Walk the scene and click the three things wrong with how it was set.",
      why: "A storm scene reads the same whether it's actually safe or almost safe, and these three — a branch loading the guy line, a spare line nobody would trust and a drain hidden under floodwater — are exactly what turns a routine live shot into the story instead of the one covering it.",
    },
    {
      id: "clearance-chart-check", kind: "select", target: "clearance-chart",
      title: "Check the mast's clearance chart against the power line",
      cue: "Check the mast's clearance chart against the height of the power line running over this corner before raising anything.",
      why: "The chart is what turns 'looks far enough' into an actual number — the mast's rated extension against the line's own height and the utility's own minimum approach distance, not how far away the line happens to look from the truck.",
    },
    {
      id: "ground-rod-check", kind: "select", target: "ground-rod",
      title: "Drive the truck's ground rod before touching a mast control",
      cue: "Drive the truck's ground rod and confirm the bond before any mast control is touched.",
      why: "The mast is the tallest metal object on this corner the moment it starts up, and the ground rod is what gives a stray charge a path to earth instead of through the truck's own frame — it goes in before the first mast control is touched, every time, storm or clear sky.",
    },
    {
      id: "wind-check", kind: "gauge", target: "wind-gauge",
      title: "Read the wind gauge before raising the mast",
      cue: "Read the wind gauge and commit inside the mast manufacturer's own safe operating band before raising it.",
      why: "A telescoping mast is rated for a specific wind range, and a gust that would barely move a reporter's rain hood can put real leverage on a mast fully extended near a power line. Reading the gauge here is what keeps 'feels calm enough' from being the only check before a very tall, very exposed object goes up.",
      gauge: { label: "WIND", speed: 0.6, green: [0.1, 0.5], readout: (t) => `${Math.round(t * 40)} mph`, missNote: "Outside the mast's own safe wind band — wait it out rather than raising into a gust." },
    },
    {
      id: "outrigger-lock", kind: "turn", target: "outrigger-lock",
      title: "Lock the outriggers before the mast goes up",
      cue: "Turn each outrigger's lock to SET before the mast is raised.",
      why: "The outriggers are what keep the truck stable against the mast's own leverage once it's extended — locking them before the mast goes up is what makes 'stable platform' a fact rather than a hope for the whole time the mast is exposed to the wind.",
      turn: { turns: 1.0, label: "OUTRIGGERS", readout: (t) => (t < 0.5 ? "free" : t < 0.95 ? "locking" : "set") },
    },
    {
      id: "mast-raise", kind: "hold", target: "mast-raise-control", seconds: 5,
      title: "Raise the mast, watching its clearance from the line",
      cue: "Hold the raise control, watching the mast's clearance from the power line the whole way up — stop the instant it closes rather than the instant it looks close.",
      why: "A mast raised on a timer or a habit rather than a watched clearance is a mast raised on the assumption that today's line height and today's parking spot are exactly like every other day's — holding the control while actually watching the gap is what catches the one day they aren't.",
      holdBreakNote: "You let go before the clearance was actually confirmed the whole way up. A mast stopped partway is safer than one raised on assumption.",
    },
    {
      id: "producer-check", kind: "select", target: "producer-radio",
      title: "Confirm the producer before going live",
      cue: "Confirm with the producer on the radio that the mast is up, the clearance is proven, and the shot is ready before the countdown starts.",
      why: "The producer in the control room has no way to see this corner's power line or this mast's own clearance — the radio call is what turns 'should be ready' into an actual confirmation from the field engineer who was standing right there watching it go up.",
    },
    {
      id: "mast-sway-watch", kind: "track", target: "mast-sway", seconds: 6,
      title: "Watch the mast's sway through the live shot",
      cue: "Watch the mast's sway stay inside its safe band through the whole live shot — a mast that sways too far starts closing the clearance it was raised with.",
      why: "Wind doesn't stop being a factor once the mast is up — a gust partway through a live shot can sway a fully extended mast several feet, and the clearance it was raised with is only as good as it staying inside the band the whole time it's up, not just at the moment it stopped rising.",
      track: { start: 0.3, green: [0.2, 0.45], rise: 0.5, fall: 0.5, drift: 0.14, label: "MAST SWAY", readout: (v) => (v > 0.45 ? "closing the line" : "held") },
      holdBreakNote: "The sway pushed past the band — that's the mast closing the clearance it was raised with, not just wind noise.",
    },
    {
      id: "guy-line-anchor", kind: "drag", target: "guy-anchor-bag",
      title: "Anchor the guy line",
      cue: "Carry the anchor bag from the truck to the guy line's marked anchor point and set it.",
      why: "A guy line without a proper anchor is a guy line held by whatever it's tied to at the moment, which in a storm is exactly the kind of thing that comes loose when it matters most. The marked anchor point is rated for the load; a nearby fence post or a parked cone is not.",
      drag: { to: "anchor-mark", radius: 0.5, missNote: "Not on the marked anchor point — a guy line tied off nearby instead of on the rated anchor holds for exactly as long as nothing tests it." },
    },
    {
      id: "ifb-check", kind: "select", target: "ifb-radio",
      title: "Confirm the reporter's IFB",
      cue: "Confirm the reporter's earpiece IFB is live with the control room before the countdown.",
      why: "A reporter standing up live with a dead earpiece is a reporter who can't hear the anchor's toss or the producer's count — confirming the IFB here is what keeps a clean signal chain from failing at the one link nobody can see from the truck.",
    },
    {
      id: "field-log", kind: "select", target: "field-log",
      title: "Log the mast, the clearance and the scene finds",
      cue: "Log the mast height used, the clearance proven, the wind reading, and the branch and drain found and fixed.",
      why: "The log is what the next crew sent to this same corner reads before they raise anything — a line's real height and a drain that loses its cover in a flood are exactly what the next truck needs to know before they find it out themselves in the next storm.",
    },
  ],

  interrupts: [
    {
      id: "gust-toward-power-line",
      kind: "Gust pushes the mast toward the line",
      after: "mast-raise", delay: 2, seconds: 12,
      alert: "A gust has pushed the mast toward the power line's minimum approach distance, right while you're holding the raise control.",
      cue: "Hit the mast's emergency stow switch before it gets any closer.",
      target: "emergency-stow-switch",
      why: "The raise control only ever moves the mast up — it has nothing built in to pull it back down fast, and a gust closing the clearance needs an answer that acts now, not one that stops the raise and waits. The emergency stow switch is the one control built to bring the mast down immediately, separate from the normal raise and lower controls.",
      missNote: "The mast swayed into the reduced clearance zone before anyone hit the stow switch. It settled back on its own once the gust passed — this time.",
      wrongNote: "Not the raise control — letting go of it only stops the mast going up. The emergency stow switch is what actually brings it back down now.",
    },
    {
      id: "floodwater-rising-at-stabilizers",
      kind: "Floodwater rises around the stabilizer legs",
      after: "mast-sway-watch", delay: 2, seconds: 12,
      alert: "Floodwater is rising fast around the truck's stabilizer legs, right while you're watching the mast's sway.",
      cue: "Call the crew to move the truck to higher ground over the radio.",
      target: "producer-radio",
      why: "A stabilizer leg standing in rising water is a stabilizer leg whose footing nobody can actually see anymore, and the mast stays trustworthy only as long as the truck under it does. The radio call is what gets the decision to relocate made and acted on before the water decides it for everyone.",
      missNote: "The water kept rising around the stabilizers. The truck stayed put on legs nobody could confirm were still on solid ground.",
      wrongNote: "Not the mast controls — the mast isn't the problem here. The radio is what reaches the crew who need to move the truck.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, NSM_ACCENT);

    // ------------------------------------------------------------ the flooded street
    const floor = box(g, 8.0, 0.05, 6.6, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#20262a", base2: "#181d20", tarLines: 3 }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.05, color: 0x8a969c });
    const floodPool = box(g, 3.0, 0.02, 2.4, -0.5, 0.036, 1.4, 0x3a6a7c, { rough: 0.1, opacity: 0.55, transparent: true, cast: false });
    void floodPool;

    // ------------------------------------------------------------------ the truck
    const truck = boxTruck(g, -2.4, 0, -1.6, { ry: 0.3, livery: { colour: 0xdfe4e8, fleetName: "NEWS 4", unitNumber: "SNG 2" } });
    void truck;

    // ------------------------------------------------------------------- mast
    const mastBase = group(g, -2.2, 0, -1.2, 0.3);
    box(mastBase, 0.3, 0.15, 0.3, 0, 0.6, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const mastTele = group(mastBase, 0, 0.7, 0);
    const mastPole = cyl(mastTele, 0.04, 0.05, 3.0, 0, 1.5, 0, 0x9aa0a6, { rough: 0.4, metal: 0.6, seg: 12 });
    const dish = torus(mastTele, 0.16, 0.02, 0, 3.05, 0, 0xd7dce1, { rough: 0.45, seg: 8, seg2: 18 });
    dish.rotation.x = -0.4;
    for (const [ax, az] of [[0.5, 0.5], [-0.5, 0.5], [0, -0.6]]) {
      const anchorPost = cyl(g, 0.02, 0.02, 0.06, -2.2 + ax, 0.03, -1.2 + az, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
      void anchorPost;
    }
    const guyLine = hose(g, [[-2.2, 3.2, -1.2], [-1.7, 0.3, -0.7]], 0.012, 0x1b1e22, { steps: 12 });
    holoTag(g, "guy line — branch on it?", -1.9, 1.6, -0.9, { css: "#d2312b", w: 0.4 });
    reg(hits, guyLine, "downed-branch-on-guy-line");
    const raiseControl = box(mastBase, 0.08, 0.05, 0.06, 0.2, 0.65, 0.16, 0xe8b02e, { rough: 0.5 });
    holoTag(mastBase, "mast raise — hold", 0.2, 0.85, 0.16, { css: NSM_CSS, w: 0.36 });
    reg(hits, raiseControl, "mast-raise-control");
    reg(hits, mastTele, "mast-sway");
    const stowSwitch = box(mastBase, 0.08, 0.05, 0.06, -0.2, 0.65, 0.16, 0xd2312b, { rough: 0.5 });
    holoTag(mastBase, "emergency stow", -0.2, 0.85, 0.16, { css: NSM_CSS, w: 0.36 });
    reg(hits, stowSwitch, "emergency-stow-switch");
    const noGroundHit = box(mastBase, 0.3, 0.5, 0.3, 0, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mastBase, "raise without ground check?", 0, 1.2, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, noGroundHit, "raise-mast-without-ground-check");

    // ---------------------------------------------------------------- outriggers
    const outriggerKnobs = [];
    for (const [ox, oz] of [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]]) {
      const leg = group(g, -2.4 + ox, 0, -1.6 + oz, 0.3);
      box(leg, 0.1, 0.3, 0.1, 0, 0.15, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
      const knob = cyl(leg, 0.03, 0.03, 0.03, 0, 0.32, 0, 0xe8b02e, { rough: 0.4, metal: 0.5, seg: 10 });
      outriggerKnobs.push(knob);
    }
    reg(hits, outriggerKnobs[0], "outrigger-lock");
    holoTag(outriggerKnobs[0], "outrigger lock", 0, 0.15, 0, { css: NSM_CSS, w: 0.32 });
    const releaseHit = box(g, 0.15, 0.3, 0.15, -2.4 + 1.1, 0.15, -1.6 + 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "release outrigger — loaded?", -1.3, 0.5, -0.7, { css: "#d2312b", w: 0.46 });
    reg(hits, releaseHit, "release-outrigger-while-raised");

    // -------------------------------------------------------------- ground rod
    const groundRod = group(g, -3.0, 0, -0.6, 0.4);
    cyl(groundRod, 0.014, 0.014, 0.4, 0, 0.2, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(groundRod, "ground rod", 0, 0.5, 0, { css: NSM_CSS, w: 0.28 });
    reg(hits, groundRod, "ground-rod");

    // ----------------------------------------------------------------- scene finds
    const spareGuyLine = group(g, -3.1, 0, -1.9, 0.4);
    torus(spareGuyLine, 0.09, 0.012, 0, 0.05, 0, 0x8a7a52, { rough: 0.6, seg: 6, seg2: 14 });
    holoTag(spareGuyLine, "spare line — frayed?", 0, 0.2, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, spareGuyLine, "frayed-spare-guy-line");
    const drainGap = box(g, 0.4, 0.03, 0.4, 1.6, 0.02, 1.6, 0x14171a, { rough: 0.8, opacity: 0.7, transparent: true, cast: false });
    holoTag(g, "storm drain — open?", 1.6, 0.2, 1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, drainGap, "open-storm-drain-near-mark");
    const cableInWater = hose(g, [[0.5, 0.03, 1.9], [0.9, 0.03, 2.1], [1.3, 0.03, 1.95]], 0.02, 0x1b1e22, { steps: 10 });
    holoTag(g, "cable in the water?", 0.9, 0.2, 2.1, { css: "#d2312b", w: 0.4 });
    reg(hits, cableInWater, "step-in-floodwater-near-cable");

    // -------------------------------------------------------------- reporter setup
    const reporter = standingFigure(g, 1.6, 0.8, { ry: -1.9, cloth: 0xdfe4e8 });
    holoTag(reporter, "field reporter", 0, 2.0, 0, { css: NSM_CSS, w: 0.32 });
    void reporter;
    const photographer = standingFigure(g, 0.9, -0.3, { ry: 1.4, cloth: 0x2b3a4a });
    holoTag(photographer, "field engineer", 0, 2.0, 0, { css: NSM_CSS, w: 0.36 });
    void photographer;

    // -------------------------------------------------------------------- gear
    const rack = group(g, -3.4, 0, 1.4, 0.3);
    cyl(rack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.18, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const rainGear = box(rack, 0.24, 0.3, 0.06, -0.14, 1.0, 0, 0xf2c14b, { rough: 0.7 });
    holoTag(rack, "rain gear", -0.14, 1.2, 0, { css: NSM_CSS, w: 0.28 });
    reg(hits, rainGear, "rain-gear");
    const boots = box(rack, 0.16, 0.16, 0.1, 0.14, 0.95, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(rack, "rubber boots", 0.14, 1.1, 0, { css: NSM_CSS, w: 0.3 });
    reg(hits, boots, "rubber-boots");
    const chest = toolChest(g, -3.5, -1.0, { ry: 0.3, color: 0x2b2b30 });
    void chest;
    const escapeRouteGear = box(g, 0.4, 0.2, 0.3, -3.2, 0.1, 0.4, 0x2b2f34, { rough: 0.6 });
    holoTag(g, "escape route — clear it?", -3.2, 0.4, 0.4, { css: "#d2312b", w: 0.44 });
    reg(hits, escapeRouteGear, "block-escape-route-with-gear");

    const anchorMark = box(g, 0.3, 0.01, 0.3, -1.6, 0.011, -0.4, 0xffe9b0, { rough: 0.8, opacity: 0.85, transparent: true, cast: false });
    holoTag(g, "anchor mark", -1.6, 0.2, -0.4, { css: NSM_CSS, w: 0.24 });
    reg(hits, anchorMark, "anchor-mark");
    const anchorBag = group(g, -3.2, 0, -2.4, 0.3);
    box(anchorBag, 0.3, 0.14, 0.2, 0, 0.07, 0, 0x6b5a44, { rough: 0.9 });
    holoTag(anchorBag, "anchor bag", 0, 0.24, 0, { css: NSM_CSS, w: 0.24 });
    reg(hits, anchorBag, "guy-anchor-bag");

    const windGaugeProp = instrument(g, -0.8, 0.9, -2.0, { ry: 0.4, idle: "-- mph", color: NSM_ACCENT, w: 0.13, d: 0.15 });
    holoTag(windGaugeProp, "wind gauge", 0, 0.16, 0, { css: NSM_CSS, w: 0.3 });
    reg(hits, windGaugeProp, "wind-gauge");
    const producerRadioProp = instrument(g, 2.6, 0.9, -1.0, { ry: -0.8, idle: "PRODUCER — CH 1", color: NSM_ACCENT, w: 0.13, d: 0.16 });
    holoTag(producerRadioProp, "producer radio", 0, 0.16, 0, { css: NSM_CSS, w: 0.38 });
    reg(hits, producerRadioProp, "producer-radio");
    const ifbProp = instrument(g, 2.4, 0.9, 0.6, { ry: -1.4, idle: "IFB — LIVE?", color: NSM_ACCENT, w: 0.13, d: 0.16 });
    holoTag(ifbProp, "reporter IFB", 0, 0.16, 0, { css: NSM_CSS, w: 0.3 });
    reg(hits, ifbProp, "ifb-radio");

    // -------------------------------------------------------------- paperwork
    const sheet = holoPanel(g, 0.95, 0.66, -3.6, 1.35, -0.2, (cx, w, h) => {
      cx.fillStyle = "#062226"; cx.fillRect(0, 0, w, h); cx.fillStyle = NSM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dffafd"; cx.fillText("STORM ASSIGNMENT", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#e6fbfd";
      ["Standup: this corner, live at the top", "Mast clearance: per the chart, this line", "Ground rod before any mast control",
       "Wind band: per the mast's own manual", "Escape route stays clear the whole shot"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.125)));
    }, { ry: 0.5, accent: NSM_ACCENT });
    reg(hits, sheet, "assignment-sheet");

    const chart = holoPanel(g, 0.8, 0.58, 3.0, 1.3, -2.4, (cx, w, h) => {
      cx.fillStyle = "#062226"; cx.fillRect(0, 0, w, h); cx.fillStyle = NSM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dffafd"; cx.fillText("MAST CLEARANCE CHART", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e6fbfd";
      ["Line height: per today's survey", "Mast max: per the manufacturer", "Minimum approach: per the utility"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.6, accent: NSM_ACCENT });
    reg(hits, chart, "clearance-chart");

    const log = holoPanel(g, 0.6, 0.42, -3.6, 1.3, 1.4, (cx, w, h) => {
      cx.fillStyle = "#062226"; cx.fillRect(0, 0, w, h); cx.fillStyle = NSM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dffafd"; cx.fillText("FIELD LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e6fbfd";
      ["Mast: —", "Clearance: —", "Scene: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.0, accent: NSM_ACCENT });
    reg(hits, log, "field-log");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-donning") { rainGear.visible = false; boots.visible = false; }
        if (step.id === "ground-rod-check") groundRod.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 });
        if (step.id === "outrigger-lock") for (const k of outriggerKnobs) k.material = mat(0x59c97b, { rough: 0.4, metal: 0.5 });
        if (step.id === "guy-line-anchor") { anchorBag.position.set(-1.6, 0, -0.4); anchorMark.visible = false; }
        if (step.id === "field-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#062226"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dffafd"; cx.fillText("FIELD LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Mast: up, clearance held", "Clearance: proven against chart", "Scene: branch and drain fixed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-toward-power-line") { mastPole.material = mat(0xd2312b, { rough: 0.4, metal: 0.6 }); }
        if (it.id === "floodwater-rising-at-stabilizers") { floodPool.material = mat(0x3a6a7c, { rough: 0.1, opacity: 0.85, transparent: true }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-toward-power-line") { mastPole.material = mat(0x9aa0a6, { rough: 0.4, metal: 0.6 }); }
        if (it.id === "floodwater-rising-at-stabilizers") { floodPool.material = mat(0x3a6a7c, { rough: 0.1, opacity: 0.55, transparent: true }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "outrigger-lock") for (const k of outriggerKnobs) k.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-check") repaint(windGaugeProp.userData.screen, signFace(`${Math.round(gg.t * 40)}`, { bg: "#0d1c24", accent: gg.t >= 0.1 && gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#e6fbfd", scale: 0.6 }));
        if (step?.id === "mast-raise" && session.holding) mastTele.position.y = 0.7 * Math.min(1, session.holdFor / 5);
        if (step?.id === "mast-sway-watch" && session.holding) mastTele.rotation.z = ((session.track?.v ?? 0.3) - 0.3) * 0.3;
        void dt; void t; void CITY;
      },
    };
  },
};
