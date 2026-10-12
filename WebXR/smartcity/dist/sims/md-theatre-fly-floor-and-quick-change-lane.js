import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, woodGrainFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Theatre Fly Floor & Quick-Change Lane VR — Screen & Media
// Crafts.
//
// A backstage crossover under the fly floor: a stage manager's cue sheet, a
// quick-change lane in the wings, and a batten about to fly over the very
// path an actor crosses on the same cue. The learner is the Actors' Equity
// stage manager running the calling desk and the quick change together —
// reading the cue sheet, dressing the quick-rig costume in the order its own
// snaps demand, sweeping the crossover for a blocking props table, a missing
// spike mark and a missing personal prop, checking the fly plot's batten
// timing against the actor's cross, proving the fly system's brake tension,
// dialling the headset to the calling channel, holding standby, calling go,
// watching the batten fly at a safe speed, handing the costume piece to the
// dresser, confirming the cross under the landed batten is clear, and
// logging the change and the cue — with a crew member starting the wrong
// batten on standby and an actor stepping into the crossover under a
// landing batten both needing an answer that is not the control already in
// the learner's hand. The production and the theatre are generic.

const TFQ_ACCENT = 0xec407a;
const TFQ_CSS = "#ec407a";

export const SIM_MD_THEATRE_FLY_FLOOR_AND_QUICK_CHANGE_LANE = {
  id: "md-theatre-fly-floor-and-quick-change-lane",
  index: "713",
  domain: "Screen & Media Crafts",
  trade: "Actors' Equity stage manager, calling a fly cue and a quick change over the same backstage crossover",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "Actors' Equity Association safety standards for stage actors and stage managers; IATSE fly crew and stagehand practice; ANSI E1.4 counterweight rigging systems for the fly floor; OSHA 29 CFR 1910.22 walking-working surfaces for the backstage crossover; NFPA 101 Life Safety Code requirements for keeping the crossover clear as an egress path",
  name: "Theatre Fly Floor & Quick-Change Lane",
  title: simTitle("Theatre Fly Floor & Quick-Change Lane"),
  tagline: "A backstage crossover under the fly floor: the cue sheet read, the quick-rig costume dressed in its own snap order, the crossover swept for a blocking props table and a missing spike mark, the fly plot checked against the actor's cross, the brake tension proven, the headset dialled to the calling channel, standby held, go called, the batten watched in at a safe speed, the costume piece handed off, the cross under the landed batten confirmed clear, and the change and the cue logged — a crew member starting the wrong batten and an actor stepping into a landing batten's path both answered off a control that isn't the one already in the learner's hand",
  accent: TFQ_ACCENT,
  accentCss: TFQ_CSS,
  parSeconds: 340,
  footprint: 2.9,
  badge: { id: "clean-change-clean-cue", name: "Clean Change, Clean Cue", note: "The crossover swept clean, the brake tension proven before the batten flew, the wrong-batten start caught on the headset, and the crossover confirmed clear before anyone crossed under the landed batten" },

  supportLine: "your Actors' Equity or IATSE local's member assistance contact, or the production's own employee assistance programme",

  game: system({
    name: "Calling Desk",
    currency: "CUE",
    ranks: ["Deck Hand", "Assistant Stage Manager", "Stage Manager", "Production Stage Manager", "Equity Steward Certified"],
    badges: [
      { id: "tension-proven-first", name: "Tension Proven First", note: "Never called go before the brake tension read proven", test: AWARD.stepClean("brake-tension-check") },
      { id: "wrong-batten-caught", name: "Wrong Batten Caught", note: "The wrong-batten start was called off on the headset, not let run", test: AWARD.unbroken },
      { id: "never-under-the-batten", name: "Never Under the Batten", note: "Never reached under a flying batten, never crossed the blind corner unchecked, never reached into the rig while it was being pinned, never blocked the crossover with the cart", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-call", name: "Clean Call", note: "No corrections from the cue sheet to the closing log", test: AWARD.clean },
      { id: "steady-fly", name: "Steady Fly", note: "The batten held its speed band the whole way in, first time", test: AWARD.precise(0.7) },
      { id: "curtain-on-time", name: "Curtain On Time", note: "Change made and cue called inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-under-flying-batten": "You reached up toward the batten while it was still in motion. A flying batten carries whatever scenery or electrics are hung on it, and the gap between where a hand is safe and where it isn't closes the instant the batten is actually moving — it gets reached for only once it's landed and dead-hung, never while it's still flying.",
    "cross-blind-corner-backstage": "You crossed the backstage blind corner without checking it first. A crossover in the dark, under a working fly floor, has exactly one blind spot where an actor coming the other way and a moving batten both converge, and checking it before stepping through is the only thing that catches either one in time.",
    "reach-into-quick-rig-while-pinning": "You reached into the quick-rig costume's snap mechanism while the dresser still had a hand inside pinning it closed. A quick-change rig is built to close fast under one dresser's practiced hands, and a second hand in the same mechanism is how a pin meant for fabric finds a finger instead.",
    "block-crossover-with-wardrobe-cart": "You left the wardrobe cart parked in the middle of the backstage crossover. That crossover is the only way an actor gets from one side of the stage to the other during the show, and a cart parked in it is an actor's cue-to-cue cross turned into an obstacle course in the dark.",
  },

  lateNotes: {
    "sm-headset": "The go call only means anything once the brake tension has already read proven — calling go on an unproven fly system just times a guess.",
    "batten-fly": "The batten only flies once the crossover is swept and the headset is on the calling channel — flying it before either of those is flying blind.",
    "sm-log": "The log is written last, after the cross under the landed batten is confirmed clear.",
  },

  steps: [
    {
      id: "read-cue-sheet", kind: "select", target: "cue-sheet-panel",
      title: "Read the cue sheet's fly and change timing",
      cue: "Read today's cue sheet: which batten flies on which cue, and how much time the quick change actually has in the wings.",
      why: "The cue sheet is where today's show is actually specified before the calling desk does anything — which batten is cue 3, how many bars the quick change has before the next entrance, and which of those two clocks is tighter tonight.",
    },
    {
      id: "quick-rig-dress", kind: "sequence",
      targets: ["quick-rig-jacket", "quick-rig-hat"],
      itemNames: { "quick-rig-jacket": "quick-rig jacket", "quick-rig-hat": "quick-rig hat" },
      title: "Dress the quick-rig costume in its own snap order",
      cue: "Dress the quick-rig jacket first, then the hat — the rig's snaps are sewn to close in that order and no other.",
      why: "A quick-rig costume is built around one specific order of snaps and velcro so a dresser can close the whole thing in seconds without looking — dressed out of order, a snap that expects the jacket already closed catches on fabric that isn't there yet, and the two extra seconds spent freeing it is exactly the two seconds the change doesn't have.",
      outOfOrderNote: "Jacket, then hat — not the other way around. The rig's own snaps are sewn to close in that order, and out of order they catch rather than close.",
    },
    {
      id: "crossover-sweep", kind: "find", noHint: true,
      targets: ["props-table-blocking-crossover", "missing-spike-mark", "missing-personal-prop"],
      itemNames: { "props-table-blocking-crossover": "props table blocking the crossover", "missing-spike-mark": "missing spike mark", "missing-personal-prop": "missing personal prop" },
      itemNotes: {
        "props-table-blocking-crossover": "The personal props table has been rolled out into the crossover itself instead of against the wall. An actor crossing in blackout finds the corner of that table with a hip long before they see it.",
        "missing-spike-mark": "The glow tape spike mark for tonight's furniture reset has come up off the floor. A stagehand resetting a piece by feel in the dark needs that mark to be exactly where it always is, not wherever the piece happens to land without it.",
        "missing-personal-prop": "One actor's personal prop isn't on the table where the pre-show check says it should be. A prop that isn't where an actor expects it in the dark, seconds before an entrance, is a prop that either gets found late or doesn't make it onstage at all.",
      },
      title: "Sweep the crossover before places is called",
      cue: "Walk the crossover in the dark and click the three things wrong with how it was set.",
      why: "A crossover reads the same whether it's actually clear or almost clear, and these three — a table in the path, a mark that's gone missing and a prop that isn't where it should be — are exactly what turns a routine cross into a stumble or a missed entrance.",
    },
    {
      id: "personal-props-check", kind: "select", target: "personal-props-table",
      title: "Restock the personal props table",
      cue: "Confirm the personal props table is fully restocked and squared against the wall, clear of the crossover.",
      why: "The table only does its job if every prop on it is exactly where the actor expects to find it without looking — restocking it here, right after the sweep found it short, is what keeps tonight's near miss from becoming tomorrow's missed entrance.",
    },
    {
      id: "fly-plot-check", kind: "select", target: "fly-plot-panel",
      title: "Check the fly plot against the actor's cross",
      cue: "Check the fly plot's timing for cue 3 against exactly when the actor's cross happens underneath it.",
      why: "The fly plot and the actor's cross are two separate documents that happen to share the same few seconds of stage, and the calling desk is the one place both get checked against each other before either one actually runs.",
    },
    {
      id: "brake-tension-check", kind: "gauge", target: "brake-tension-gauge",
      title: "Prove the fly system's brake tension before flying over the crossover",
      cue: "Read the fly system's brake tension gauge and commit inside the band before cue 3 flies over a live crossover.",
      why: "A batten flying directly over a crossover actors are still using has no margin for a brake that reads close but not proven — the gauge is what turns 'it's held every other night' into an actual reading, checked again, for the one cue where the ground underneath it is a path someone else is about to walk.",
      gauge: { label: "BRAKE TENSION", speed: 0.6, green: [0.45, 0.62], readout: (t) => (t < 0.45 ? "under" : t > 0.62 ? "over" : "proven"), missNote: "Not proven — a brake reading outside the band gets checked again before this batten flies over anyone." },
    },
    {
      id: "headset-channel", kind: "turn", target: "headset-dial",
      title: "Dial the headset to the calling channel",
      cue: "Turn the headset dial to the calling channel before any cue goes out over it.",
      why: "A calling desk with several channels running is only as good as everyone actually being on the one the call is going out on — dialling to the right channel before the first cue is what keeps a call from going out to a channel nobody flying tonight's battens is listening to.",
      turn: { turns: 1.0, label: "HEADSET", readout: (t) => (t < 0.5 ? "off channel" : t < 0.95 ? "tuning" : "on channel") },
    },
    {
      id: "standby-hold", kind: "hold", target: "standby-light", seconds: 4,
      title: "Hold standby for cue 3",
      cue: "Hold the standby light on cue 3 until the fly crew, the crossover and the actor's mark are all confirmed ready.",
      why: "Standby is held, not flashed, because the moment it turns into 'go' has to be a real decision made with all three things confirmed — releasing it the instant it feels close is how a batten flies a beat before the crossover is actually clear.",
      holdBreakNote: "You released standby before everything was actually confirmed. A cue called on 'probably ready' is a cue called early.",
    },
    {
      id: "go-call", kind: "select", target: "sm-headset",
      title: "Call go for cue 3",
      cue: "Call 'go' on cue 3 once the brake tension is proven and the crossover reads clear.",
      why: "'Go' is the one word on this headset that actually moves a batten, and it only gets said once both the mechanical proof and the human check underneath it agree — not because the beat in the music says it's time.",
    },
    {
      id: "batten-fly", kind: "track", target: "batten-fly", seconds: 5,
      title: "Watch the batten fly in at a safe speed",
      cue: "Watch the batten's speed as it flies in, staying inside the safe band the whole way — too fast overshoots the trim, too slow drifts the timing off the music.",
      why: "A batten that comes in too fast overshoots its trim and has to be corrected in front of the audience, and one that drifts too slow lands off the music's own cue — holding it inside the band the whole way in is what makes the cue read as deliberate rather than lucky.",
      track: { start: 0.5, green: [0.42, 0.6], rise: 0.5, fall: 0.5, drift: 0.12, label: "FLY SPEED", readout: (v) => (v < 0.42 ? "too slow" : v > 0.6 ? "too fast" : "held") },
      holdBreakNote: "The batten's speed left the band — ease it back toward the held speed rather than snatching the line.",
    },
    {
      id: "costume-handoff", kind: "drag", target: "costume-piece",
      title: "Hand the costume piece off to the dresser's hook",
      cue: "Carry the just-worn costume piece from the quick-change lane onto the dresser's waiting hook.",
      why: "The hook is where tonight's costume actually gets tracked between changes — a piece dropped anywhere else in the dark is a piece the wardrobe department is hunting for at intermission instead of already knowing exactly where it is.",
      drag: { to: "costume-hook", radius: 0.5, missNote: "Not on the hook — a costume piece set down nearby is a costume piece wardrobe has to go looking for." },
    },
    {
      id: "cross-under-clear", kind: "select", target: "cross-mark",
      title: "Confirm the cross under the landed batten is clear",
      cue: "Confirm the actor's cross under the now-landed batten is clear before calling places for the next scene.",
      why: "A batten reading landed on the fly rail is not the same fact as the actual floor underneath it being clear to walk — confirming the cross itself, not just the batten's position, is what the calling desk actually owes the next actor walking through it.",
    },
    {
      id: "sm-log", kind: "select", target: "sm-log",
      title: "Log the change, the cue and the crossover finds",
      cue: "Log tonight's quick-change time, the fly cue's brake reading, and the props table and spike mark found and fixed.",
      why: "The log is what the next stage manager calling this show reads before their own first cue — a spike mark that came up and a props table that drifted into the crossover are exactly what the next call needs to watch for, not facts they should have to rediscover mid-show.",
    },
  ],

  interrupts: [
    {
      id: "wrong-batten-starts",
      kind: "Crew member starts the wrong batten",
      after: "standby-hold", delay: 2, seconds: 12,
      alert: "A crew member has started flying a different batten from the wrong lineset, right while you're holding standby for cue 3.",
      cue: "Call HOLD on the headset before the wrong batten moves any further.",
      target: "sm-headset",
      why: "The standby light you're holding only communicates one cue to the crew already watching it — it says nothing to someone flying a different lineset who was never looking at cue 3's light in the first place. The headset reaches every channel the call is actually going out on, which is what stops the wrong batten before it moves any further.",
      missNote: "The wrong batten kept flying. Cue 3's own crew had to scramble to confirm it wasn't theirs before anyone caught the real mistake.",
      wrongNote: "Not the standby light — it only speaks to cue 3's own crew. The headset is what reaches whoever started the wrong batten.",
    },
    {
      id: "actor-steps-into-landing-path",
      kind: "Actor steps into the landing batten's path",
      after: "batten-fly", delay: 2, seconds: 12,
      alert: "An actor has stepped into the crossover from the wrong wing, right under the batten's landing path, just as it settles in.",
      cue: "Flash the crossover warning light and call them clear before the batten fully lands.",
      target: "crossover-warning-light",
      why: "An actor crossing in the dark on their own cue has no way to see a batten settling in above them, and a shout competes with the show's own sound cues running at the same moment. The warning light is built to be seen in peripheral vision even mid-cross, which a voice in a noisy backstage is not.",
      missNote: "The actor crossed directly under the batten as it landed. Nothing in the dark backstage gave them any warning it was even moving.",
      wrongNote: "Not the headset call alone — the actor isn't wearing one. The crossover warning light is built to be seen mid-cross in the dark.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, TFQ_ACCENT);

    // ------------------------------------------------------------ the stage floor
    const floor = box(g, 7.2, 0.05, 6.0, 0, 0.025, 0, 0xffffff, { rough: 0.85 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { planks: 9, tones: [0x2a221c, 0x241d18, 0x2e2620] }), { repeat: 4, px: 512 }), { rough: 0.7, metal: 0.02, color: 0x8a7c6a });

    // -------------------------------------------------------------- crossover
    const crossMark = box(g, 1.4, 0.02, 1.0, 0.6, 0.011, -0.6, TFQ_ACCENT, { rough: 0.7, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "the crossover", 0.6, 0.2, -0.6, { css: TFQ_CSS, w: 0.28 });
    reg(hits, crossMark, "cross-mark");
    const blindCornerHit = box(g, 0.5, 0.05, 0.5, -2.3, 0.03, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "blind corner — check it?", -2.3, 0.2, -1.6, { css: "#d2312b", w: 0.42 });
    reg(hits, blindCornerHit, "cross-blind-corner-backstage");

    // ------------------------------------------------------------------ fly floor
    const flyRail = group(g, 0.6, 0, -2.2, 0);
    for (const sx of [-1, 1]) cyl(flyRail, 0.02, 0.02, 2.4, sx * 1.4, 3.4, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8 });
    const batten = group(flyRail, 0, 3.4, 0);
    box(batten, 3.0, 0.06, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    reg(hits, batten, "batten-fly");
    const reachBattenHit = box(batten, 3.0, 0.15, 0.3, 0, -0.12, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(batten, "reach the batten?", 0, -0.3, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, reachBattenHit, "reach-under-flying-batten");
    const crossoverWarnLamp = box(flyRail, 0.05, 0.05, 0.02, 1.2, 0.9, 0.3, 0xd2312b, { rough: 0.4, emissive: 0xd2312b, ei: 0, cast: false });
    holoTag(flyRail, "crossover warning light", 1.2, 1.1, 0.3, { css: TFQ_CSS, w: 0.36 });
    reg(hits, crossoverWarnLamp, "crossover-warning-light");

    // ------------------------------------------------------------------ calling desk
    const desk = group(g, -2.6, 0, -2.0, 0.5);
    box(desk, 0.9, 0.05, 0.5, 0, 0.75, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    for (const sx of [-1, 1]) box(desk, 0.05, 0.75, 0.05, sx * 0.4, 0.38, 0.2, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const headsetDial = cyl(desk, 0.03, 0.03, 0.02, -0.2, 0.79, 0.1, 0xe8b02e, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(desk, "headset dial", -0.2, 0.95, 0.1, { css: TFQ_CSS, w: 0.28 });
    reg(hits, headsetDial, "headset-dial");
    const standbyLamp = box(desk, 0.06, 0.06, 0.03, 0.05, 0.79, 0.15, 0xd2312b, { rough: 0.5 });
    holoTag(desk, "standby light — hold", 0.05, 0.95, 0.15, { css: TFQ_CSS, w: 0.36 });
    reg(hits, standbyLamp, "standby-light");
    const smHeadsetProp = instrument(desk, 0.3, 0.79, 0.05, { idle: "CALLING — CH", color: TFQ_ACCENT, w: 0.12, d: 0.14 });
    holoTag(smHeadsetProp, "SM headset", 0, 0.16, 0, { css: TFQ_CSS, w: 0.3 });
    reg(hits, smHeadsetProp, "sm-headset");
    const brakeGaugeProp = instrument(desk, -0.35, 0.79, -0.1, { idle: "-- lb", color: TFQ_ACCENT, w: 0.12, d: 0.14 });
    holoTag(brakeGaugeProp, "brake tension", 0, 0.16, 0, { css: TFQ_CSS, w: 0.32 });
    reg(hits, brakeGaugeProp, "brake-tension-gauge");

    // ------------------------------------------------------------- quick-change lane
    const lane = group(g, 2.4, 0, 1.6, -0.4);
    box(lane, 1.4, 0.02, 1.2, 0, 1.4, 0, 0xdfe4e8, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(lane, 0.02, 0.02, 1.4, sx * 0.65, 0.7, sz * 0.55, 0xdfe4e8, { rough: 0.5, seg: 8 });
    const rigJacket = box(lane, 0.3, 0.4, 0.06, -0.2, 0.5, 0, 0x8a2b4a, { rough: 0.7 });
    holoTag(lane, "quick-rig jacket", -0.2, 0.75, 0, { css: TFQ_CSS, w: 0.32 });
    reg(hits, rigJacket, "quick-rig-jacket");
    const rigHat = box(lane, 0.2, 0.14, 0.2, 0.2, 0.9, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(lane, "quick-rig hat", 0.2, 1.05, 0, { css: TFQ_CSS, w: 0.3 });
    reg(hits, rigHat, "quick-rig-hat");
    const rigPinHit = box(lane, 0.15, 0.15, 0.06, -0.2, 0.5, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(lane, "reach the rig while pinning?", -0.2, 0.75, 0.08, { css: "#d2312b", w: 0.5 });
    reg(hits, rigPinHit, "reach-into-quick-rig-while-pinning");
    const costumePiece = group(g, 1.7, 0, 1.9, 0.2);
    box(costumePiece, 0.24, 0.3, 0.06, 0, 0.15, 0, 0x8a2b4a, { rough: 0.7 });
    holoTag(costumePiece, "costume piece", 0, 0.34, 0, { css: TFQ_CSS, w: 0.3 });
    reg(hits, costumePiece, "costume-piece");
    const costumeHook = box(g, 0.1, 0.1, 0.05, 2.6, 0.9, 2.1, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    holoTag(g, "dresser's hook", 2.6, 1.1, 2.1, { css: TFQ_CSS, w: 0.3 });
    reg(hits, costumeHook, "costume-hook");
    const dresser = standingFigure(g, 3.3, 1.9, { ry: -2.2, cloth: 0x4a3a2b });
    void dresser;

    // ------------------------------------------------------------- crossover dressing
    const propsTable = group(g, 0.6, 0, -0.6, 0.3);
    box(propsTable, 0.9, 0.05, 0.5, 0, 0.7, 0, 0x8b6a45, { rough: 0.6 });
    for (const [sx, sz] of [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]]) cyl(propsTable, 0.02, 0.02, 0.7, sx, 0.35, sz, 0x4a3a28, { rough: 0.6, seg: 8 });
    holoTag(propsTable, "props table — blocking?", 0, 0.9, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, propsTable, "props-table-blocking-crossover");
    const spikeGap = box(g, 0.2, 0.01, 0.2, -1.0, 0.011, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "spike mark — missing?", -1.0, 0.2, -1.4, { css: "#d2312b", w: 0.4 });
    reg(hits, spikeGap, "missing-spike-mark");
    const emptyPropSlot = box(g, 0.2, 0.02, 0.15, 0.85, 0.72, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "prop — missing from table?", 0.85, 0.9, -0.5, { css: "#d2312b", w: 0.46 });
    reg(hits, emptyPropSlot, "missing-personal-prop");

    const restockedTable = group(g, -0.6, 0, 1.6, 0.4);
    box(restockedTable, 0.7, 0.05, 0.4, 0, 0.7, 0, 0x8b6a45, { rough: 0.6 });
    for (const [sx, sz] of [[-0.28, -0.15], [0.28, -0.15], [-0.28, 0.15], [0.28, 0.15]]) cyl(restockedTable, 0.018, 0.018, 0.7, sx, 0.35, sz, 0x4a3a28, { rough: 0.6, seg: 8 });
    const propBadge = cyl(restockedTable, 0.03, 0.03, 0.06, 0, 0.73, 0, 0xd8a63a, { rough: 0.5, seg: 10 });
    holoTag(restockedTable, "personal props table", 0, 0.9, 0, { css: TFQ_CSS, w: 0.36 });
    reg(hits, propBadge, "personal-props-table");

    // ---------------------------------------------------------- wardrobe cart
    const cart = group(g, -0.5, 0, -2.2, 0.4);
    box(cart, 0.5, 0.6, 0.4, 0, 0.32, 0, 0xdfe4e8, { rough: 0.6, metal: 0.2 });
    for (const sx of [-1, 1]) cyl(cart, 0.05, 0.05, 0.04, sx * 0.2, 0.05, 0, 0x14171a, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(cart, "wardrobe cart — in the way?", 0, 0.7, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, cart, "block-crossover-with-wardrobe-cart");
    const toolChestProp = toolChest(g, -2.9, 1.6, { ry: 0.3, color: 0x2b2b30 });
    void toolChestProp;

    const stageManager = standingFigure(g, -2.0, -2.6, { ry: 2.0, cloth: 0x2b2f34 });
    holoTag(stageManager, "stage manager", 0, 2.0, 0, { css: TFQ_CSS, w: 0.36 });
    void stageManager;

    // Hidden decoy actor for the second interruption.
    const wanderingActor = standingFigure(g, 1.5, -1.0, { ry: -1.6, cloth: 0x6b4a3f });
    wanderingActor.visible = false;

    // -------------------------------------------------------------- paperwork
    const cueSheet = holoPanel(g, 0.95, 0.66, -3.3, 1.35, -0.4, (cx, w, h) => {
      cx.fillStyle = "#22081a"; cx.fillRect(0, 0, w, h); cx.fillStyle = TFQ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe3ee"; cx.fillText("CUE SHEET — SM DESK", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#f8e8f0";
      ["Cue 3: batten flies over the crossover", "Quick change: jacket, then hat, in order", "Crossover swept clear before places",
       "Brake tension proven before go", "Cross confirmed clear after landing"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.125)));
    }, { ry: 0.5, accent: TFQ_ACCENT });
    reg(hits, cueSheet, "cue-sheet-panel");

    const flyPlot = holoPanel(g, 0.8, 0.58, 2.6, 1.3, -1.6, (cx, w, h) => {
      cx.fillStyle = "#22081a"; cx.fillRect(0, 0, w, h); cx.fillStyle = TFQ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe3ee"; cx.fillText("FLY PLOT — CUE 3", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#f8e8f0";
      ["Batten in: on the music's own bar", "Actor's cross: same window", "Both checked against each other here"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.6, accent: TFQ_ACCENT });
    reg(hits, flyPlot, "fly-plot-panel");

    const log = holoPanel(g, 0.6, 0.42, -3.3, 1.3, 1.2, (cx, w, h) => {
      cx.fillStyle = "#22081a"; cx.fillRect(0, 0, w, h); cx.fillStyle = TFQ_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe3ee"; cx.fillText("SM LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f8e8f0";
      ["Change: —", "Cue 3: —", "Crossover: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.0, accent: TFQ_ACCENT });
    reg(hits, log, "sm-log");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "quick-rig-dress") { rigJacket.visible = false; rigHat.visible = false; }
        if (step.id === "personal-props-check") propBadge.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "headset-channel") headsetDial.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "costume-handoff") costumePiece.visible = false;
        if (step.id === "cross-under-clear") crossMark.material = mat(0x59c97b, { rough: 0.7, opacity: 0.5, transparent: true });
        if (step.id === "sm-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#22081a"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbe3ee"; cx.fillText("SM LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Change: on time, in order", "Cue 3: brake proven, flown clean", "Crossover: table and mark fixed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wrong-batten-starts") { batten.material = mat(0xd2312b, { rough: 0.5, metal: 0.5 }); }
        if (it.id === "actor-steps-into-landing-path") { wanderingActor.visible = true; crossoverWarnLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wrong-batten-starts") { batten.material = mat(0x2b2f34, { rough: 0.5, metal: 0.5 }); }
        if (it.id === "actor-steps-into-landing-path") { wanderingActor.visible = false; crossoverWarnLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0, rough: 0.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "headset-channel") headsetDial.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "brake-tension-check") repaint(brakeGaugeProp.userData.screen, signFace(gg.t < 0.45 ? "UNDER" : gg.t > 0.62 ? "OVER" : "GOOD", { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#f8e8f0", scale: 0.5 }));
        if (step?.id === "batten-fly" && session.holding) batten.position.y = 3.4 - (session.track.v ?? 0.5) * 2.6;
        void dt; void t; void CITY;
      },
    };
  },
};
