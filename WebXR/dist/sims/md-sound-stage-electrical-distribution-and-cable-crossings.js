import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, hose, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, deckPlateFace, gratingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sound Stage Electrical Distribution & Cable Crossings VR —
// Screen & Media Crafts.
//
// A soundstage's temporary electrical distribution before the day's rig: a
// distro panel feeding the dimmer rack, cable runs crossing two walkways,
// and a practical lamp patched into today's cue. The learner is the IATSE
// set electrician who reads the power plot's circuit loads, gloves and
// glasses on, sweeps the floor for a taped-over splice, a second bare
// crossing and a cable snagged on a walkway rail, checks the load
// calculation against the breaker's own rating, locks the breaker out,
// proves the circuit dead before landing a lug, patches the new circuit,
// re-energises, clamp-meters the load under the rating, confirms the
// gaffer's radio before the board runs anything, fades the practical's
// dimmer smoothly to the cue's plotted level, ramps the first cable
// crossing, closes the panel's dead-front cover, and logs the rig — with a
// second electrician reaching for a lug before it reads dead and a grip
// cart wheeled across the unramped crossing both needing an answer that is
// not the control already in the learner's hand. The production and the
// stage are generic.

const SSE_ACCENT = 0xffb300;
const SSE_CSS = "#ffb300";

export const SIM_MD_SOUND_STAGE_ELECTRICAL_DISTRIBUTION_AND_CABLE_CROSSINGS = {
  id: "md-sound-stage-electrical-distribution-and-cable-crossings",
  index: "711",
  domain: "Screen & Media Crafts",
  trade: "IATSE set electrician, running a soundstage's temporary distribution to the dimmer rack and today's practical",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE set lighting and electrical department training; NFPA 70E electrical safety in the workplace for the lockout and prove-dead steps; NEC/NFPA 70 wiring practice for the distribution and the cable crossings; OSHA 29 CFR 1910.147 lockout/tagout on the distro breaker; OSHA 29 CFR 1910.305 wiring methods for temporary stage cable runs",
  name: "Sound Stage Electrical Distribution & Cable Crossings",
  title: simTitle("Sound Stage Electrical Distribution & Cable Crossings"),
  tagline: "A soundstage rig before the day's first cue: the power plot's circuit loads read, gloves and glasses on, the floor swept for a taped-over splice and a bare second crossing, the load calc checked against the breaker, the breaker locked out and proven dead before a lug is touched, the new circuit patched, re-energised, clamp-metered under the rating, the gaffer's radio confirmed, the practical's dimmer faded smooth to the cue, the first crossing ramped, the panel's cover closed, and the rig logged — a second electrician reaching for a live lug and a cart crossing the unramped run both answered off a control that isn't the one already in the learner's hand",
  accent: SSE_ACCENT,
  accentCss: SSE_CSS,
  parSeconds: 340,
  footprint: 2.9,
  badge: { id: "proven-dead-and-patched", name: "Proven Dead and Patched", note: "The breaker locked and proven dead before any lug was touched, the load checked under the breaker's rating, and both crossings ramped before anyone wheeled a cart across them" },

  supportLine: "your IATSE local's member assistance contact, or the production's own employee assistance programme",

  game: system({
    name: "Distro Bench",
    currency: "AMP",
    ranks: ["Loader", "Set Lighting Trainee", "Board Operator", "Set Electrician", "Gaffer Certified"],
    badges: [
      { id: "dead-before-lug", name: "Dead Before Lug", note: "Never landed a lug before the tester proved the circuit dead", test: AWARD.stepClean("prove-dead-check") },
      { id: "second-electrician-answered", name: "Second Electrician Answered", note: "The second electrician's reach was stopped off the radio, not ignored", test: AWARD.unbroken },
      { id: "never-past-the-cover", name: "Never Past the Cover", note: "Never reached a lug before it was proven dead, never crossed an unramped run, never added a fixture past the breaker's rating, never opened the panel live", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-patch", name: "Clean Patch", note: "No corrections from the plot to the closing log", test: AWARD.clean },
      { id: "smooth-fade", name: "Smooth Fade", note: "The dimmer fade held its band the whole way up, first time", test: AWARD.precise(0.7) },
      { id: "rig-on-time", name: "Rig On Time", note: "Proven, patched and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-live-lug-before-proven-dead": "You reached for the circuit's lug before the tester actually proved it dead. A breaker locked open is a breaker that is very probably dead, and 'very probably' is exactly the gap the prove-dead step exists to close — a lockout can be on the wrong breaker, and the only way to know is to test the conductor you're about to touch, every time, before your hand goes anywhere near it.",
    "cross-cable-without-ramp": "You stepped across the walkway's bare cable crossing before the ramp was down. A cable underfoot on a busy soundstage floor is a trip for the first person not watching it and a crush hazard for the cable itself the moment a loaded cart rolls over the same spot — the ramp is what turns a crossing into something safe to cross rather than something to step over carefully every single time.",
    "overload-circuit-add-fixture": "You added another fixture to a circuit the clamp meter had already read close to the breaker's rating. A breaker trips because the circuit behind it is asked to carry more than it was built for, and 'it worked fine a minute ago' is not the same fact once one more fixture's draw gets added on top of a load that was already close.",
    "open-panel-cover-live": "You opened the distro panel's dead-front cover while the panel was still energised. That cover exists specifically to keep hands away from live bus bars during normal work, and taking it off with the panel hot turns routine access into a hand's reach from exposed conductors carrying the whole rig's load.",
  },

  lateNotes: {
    "prove-dead-tester": "The tester only proves anything once the breaker is actually locked out — testing a live circuit just tells you it's live.",
    "dimmer-fader": "The fade happens once the circuit is back on and clamp-metered under the rating — fading a channel with no proven, safe circuit behind it fades nothing real.",
    "electrical-log": "The log is written last, after both crossings are ramped and the panel cover is back on.",
  },

  steps: [
    {
      id: "read-power-plot", kind: "select", target: "power-plot-panel",
      title: "Read the power plot's circuit loads",
      cue: "Read today's power plot: which circuits feed which departments, and the load each one is planned to carry.",
      why: "The plot is where today's rig is actually specified before a single lug is touched — which circuit the practical patches into, what else is already on it, and what the whole rig is meant to draw against a distro that has a real, finite rating.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["insulated-gloves", "safety-glasses"],
      itemNames: { "insulated-gloves": "insulated gloves", "safety-glasses": "safety glasses" },
      title: "Glove up and glasses on before opening any panel",
      cue: "Put on insulated gloves and safety glasses before the distro panel's cover ever comes off.",
      why: "Both go on before the cover comes off, not after — an insulated glove is only doing its job if it's already on the hand that reaches for the cover, and glasses are what keep an arc's first warning sign out of an eye rather than off a lens that was still sitting in the truck.",
    },
    {
      id: "cable-sweep", kind: "find", noHint: true,
      targets: ["bare-splice-under-tape", "second-crossing-no-ramp", "cable-snagged-on-walkway-rail"],
      itemNames: { "bare-splice-under-tape": "exposed splice under a strip of tape", "second-crossing-no-ramp": "second cable crossing with no ramp at all", "cable-snagged-on-walkway-rail": "cable snagged on the walkway rail" },
      itemNotes: {
        "bare-splice-under-tape": "A splice has been taped over instead of properly joined and insulated — tape looks like a fix from a glance but does nothing for a conductor that flexes every time the cable is walked on. It gets re-terminated properly, not re-taped.",
        "second-crossing-no-ramp": "A second walkway crossing, away from the main one, has no ramp over it at all — easy to miss because it isn't the crossing anyone's attention is on. Every crossing gets the same ramp, not just the one in the middle of the floor.",
        "cable-snagged-on-walkway-rail": "A cable is snagged tight against the walkway's rail where a cart caught it earlier in the day. A cable under that kind of tension pulls at its own connectors with every step someone takes near it, long before anyone notices the strain.",
      },
      title: "Sweep the floor before the rig goes live",
      cue: "Walk the cable runs and click the three things wrong with how they were laid.",
      why: "A cable run reads the same whether it's actually safe or almost safe, and these three — a taped splice, a second crossing nobody ramped, and a snagged run under tension — are exactly the kind of thing that looks fine in a walkthrough and fails the moment the day's actual foot and cart traffic finds it.",
    },
    {
      id: "load-calc-check", kind: "select", target: "load-calc-sheet",
      title: "Check the load calculation against the breaker's rating",
      cue: "Check today's load calculation sheet against the distro breaker's own rated capacity before patching anything new.",
      why: "The calculation is what turns 'should be fine' into an actual number — every fixture on this circuit has a rated draw, and the sheet is where those numbers get added up against a breaker that trips at a specific point, not at however close it happens to feel.",
    },
    {
      id: "breaker-lockout", kind: "turn", target: "breaker-lockout",
      title: "Lock out the distro breaker before opening the panel",
      cue: "Turn the distro breaker to OFF and hang your lock before the panel's cover comes off.",
      why: "The breaker is locked before the cover comes off, every time, because your lock is the only thing that stops someone else closing it while your hands are inside the panel — the same rule that governs every electrical panel on this circuit, soundstage or otherwise.",
      turn: { turns: 0.6, axis: "z", label: "DISTRO BREAKER" },
    },
    {
      id: "prove-dead-check", kind: "hold", target: "prove-dead-tester", seconds: 4,
      title: "Prove the circuit dead before touching a lug",
      cue: "Hold the tester on the circuit's own conductor until it confirms zero — a locked breaker is not the same fact as a proven-dead conductor.",
      why: "A lockout tells you which breaker you turned off; it does not tell you the conductor in front of you is actually the one that breaker feeds. Testing it directly, every time, is what catches a mislabeled panel before a hand does.",
      holdBreakNote: "You let go before the tester actually confirmed zero. A lockout is not a substitute for a conductor you tested yourself.",
    },
    {
      id: "patch-new-circuit", kind: "select", target: "patch-panel",
      title: "Patch the new circuit into the dimmer rack",
      cue: "Patch today's practical into the dimmer channel the power plot calls for.",
      why: "The patch is where the plot's plan actually becomes a live connection — patching the wrong channel means the board operator's fader is moving a light nobody's watching, while the one the camera sees never comes up at all.",
    },
    {
      id: "breaker-energize", kind: "turn", target: "breaker-lockout",
      title: "Remove the lock and re-energise",
      cue: "Take your lock off, confirm the panel's clear, and close the distro breaker.",
      why: "Your lock, your key, your call to re-energise — the same as any lockout, closed only once you're certain nobody else's hands are still inside the panel you locked.",
      turn: { turns: 0.6, axis: "z", label: "DISTRO BREAKER" },
    },
    {
      id: "clamp-meter-check", kind: "gauge", target: "clamp-meter",
      title: "Clamp-meter the circuit under the breaker's rating",
      cue: "Clamp the meter on the patched circuit and confirm the reading sits under the breaker's rated capacity.",
      why: "The calculation on paper is only a prediction until the clamp meter reads the circuit actually carrying today's load — a number that reads right on the sheet and wrong on the meter means something on this circuit is drawing more than the plot accounted for.",
      gauge: { label: "LOAD", speed: 0.65, green: [0.2, 0.62], readout: (t) => `${Math.round(t * 30)} A`, missNote: "Too close to the breaker's rating — pull a fixture off this circuit before trusting it with today's full rig." },
    },
    {
      id: "gaffer-radio-check", kind: "select", target: "gaffer-radio",
      title: "Confirm with the gaffer before the board runs anything",
      cue: "Call the gaffer on the radio to confirm the circuit is patched, proven and clear before the board touches any fader.",
      why: "The board operator has no way to see the panel from the lighting console, and a fader pushed on a circuit nobody confirmed is a fader pushed on a guess. The radio call is what turns 'should be ready' into an actual answer from the person who was standing at the panel.",
    },
    {
      id: "dimmer-fade", kind: "track", target: "dimmer-fader", seconds: 5,
      title: "Fade the practical smoothly to the cue's level",
      cue: "Bring the practical's dimmer up smoothly to the level the cue sheet plots — a snap to level reads on camera as much as a flicker would.",
      why: "A practical lamp in shot is lit the way the scene calls for, not just turned on — a smooth fade to the cue's own plotted level is the difference between a lamp that looks like it was always burning at that level and one that visibly just came up.",
      track: { start: 0.1, green: [0.55, 0.72], rise: 0.4, fall: 0.4, drift: 0.1, label: "DIMMER", readout: (v) => (v < 0.55 ? "under cue" : v > 0.72 ? "over cue" : "on cue") },
      holdBreakNote: "The fade overshot or undershot the cue's level — ease it back rather than snapping to the mark.",
    },
    {
      id: "ramp-crossing", kind: "drag", target: "cable-ramp",
      title: "Ramp the first cable crossing",
      cue: "Carry the cable ramp from the gear line and lay it over the main walkway crossing.",
      why: "The main crossing carries the most foot and cart traffic all day, and it is the one no rig is considered finished without ramping — a cable run without a ramp over the busiest crossing on the floor is a run that hasn't actually been finished yet.",
      drag: { to: "crossing-mark", radius: 0.5, missNote: "Not over the crossing mark — the ramp has to sit square over the cable, not beside it." },
    },
    {
      id: "panel-cover-close", kind: "select", target: "panel-cover",
      title: "Close the distro panel's dead-front cover",
      cue: "Close and latch the distro panel's dead-front cover once the patch is proven good.",
      why: "The cover is what keeps the panel routine to walk past for the rest of the day — an open dead-front on an energised panel is an invitation for anyone's hand or cart to find the one thing on this floor that isn't supposed to be touched.",
    },
    {
      id: "electrical-log", kind: "select", target: "electrical-log",
      title: "Log the circuit, the load and both crossings",
      cue: "Log the circuit patched, the clamp-meter reading, the splice re-terminated, and both crossings ramped.",
      why: "The log is what the next electrician on this panel reads before they touch it — a circuit already carrying a load close to its rating is a fact the next person needs before they add one more fixture to it, not something they should have to find out from the breaker tripping.",
    },
  ],

  interrupts: [
    {
      id: "second-electrician-reaches-lug",
      kind: "Second electrician reaches for the lug",
      after: "prove-dead-check", delay: 2, seconds: 12,
      alert: "A second electrician has walked up and is reaching for the same lug, assuming the circuit is already proven dead.",
      cue: "Call them off on the radio before they touch it — the tester hasn't confirmed zero yet.",
      target: "gaffer-radio",
      why: "A shout across a soundstage floor competes with every other department's own noise, and a radio call reaches a specific person the way a general shout does not. The lockout is yours; the moment somebody else's hand is heading for the same conductor, the radio is what actually stops them before your own test is even finished.",
      missNote: "The second electrician touched the lug before the test confirmed zero. The circuit happened to already be dead — this time.",
      wrongNote: "Not the tester in your other hand — it can't stop someone else's hand. The radio is what reaches them in time.",
    },
    {
      id: "cart-crosses-unramped-run",
      kind: "Grip cart crosses the unramped run",
      after: "dimmer-fade", delay: 2, seconds: 12,
      alert: "A grip crew member has started wheeling a heavy cart straight across the still-unramped cable crossing.",
      cue: "Call them to hold at the crossing over the gaffer's channel before the cart rolls over the bare cable.",
      target: "gaffer-radio",
      why: "A cart's wheel finds a bare cable exactly where the cable is at its most exposed — mid-crossing, under full weight — and a call over the radio reaches a crew member already walking toward it faster than closing the distance to shout does. The ramp fixes the crossing for good; the radio is what buys the seconds before it's down.",
      missNote: "The cart rolled across anyway. The cable jacket showed a fresh scrape where the wheel caught it mid-crossing.",
      wrongNote: "Not the ramp step itself — it isn't down yet. The radio is what reaches a crew member already walking toward the crossing.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, SSE_ACCENT);

    // ------------------------------------------------------------ the stage floor
    const floor = box(g, 7.2, 0.05, 6.0, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#1c1e21", base2: "#17191c", step: 30 }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.1, color: 0x9aa0a6 });

    // -------------------------------------------------------------- distro panel
    const panel = group(g, -1.6, 0, -1.6, 0.4);
    box(panel, 0.7, 1.2, 0.26, 0, 0.6, 0, 0x3c454e, { rough: 0.5, metal: 0.5 });
    const cover = group(panel, 0, 0.6, 0.13);
    box(cover, 0.62, 1.06, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    reg(hits, cover, "panel-cover");
    holoTag(panel, "distro panel cover", 0, 1.3, 0.13, { css: SSE_CSS, w: 0.36 });
    const breaker = group(panel, 0.2, 0.85, 0.14);
    box(breaker, 0.06, 0.24, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, breaker, "breaker-lockout");
    const lock = lockTag(breaker, 0.06, 0.06, 0.03, { color: SSE_ACCENT });
    lock.visible = false;
    const openPanelHit = box(panel, 0.6, 1.0, 0.05, 0, 0.6, 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "open cover live?", 0, 1.5, 0.16, { css: "#d2312b", w: 0.42 });
    reg(hits, openPanelHit, "open-panel-cover-live");
    const lugArea = box(panel, 0.5, 0.3, 0.1, 0, 0.2, 0.14, 0x8b949d, { rough: 0.4, metal: 0.6 });
    holoTag(panel, "reach the lug?", 0, 0.5, 0.2, { css: "#d2312b", w: 0.36 });
    reg(hits, lugArea, "reach-live-lug-before-proven-dead");
    const testerLead = instrument(panel, -0.35, 0.7, 0.14, { idle: "-- V", color: SSE_ACCENT, w: 0.1, d: 0.14 });
    holoTag(testerLead, "prove-dead tester", 0, 0.15, 0, { css: SSE_CSS, w: 0.34 });
    reg(hits, testerLead, "prove-dead-tester");

    // ---------------------------------------------------------------- dimmer rack
    const rack = group(g, -1.0, 0, -2.4, 0.2);
    box(rack, 0.6, 1.3, 0.5, 0, 0.65, 0, 0x22282e, { rough: 0.55, metal: 0.35 });
    const patchPoints = [];
    for (let i = 0; i < 6; i++) {
      const p = ball(rack, 0.02, -0.22 + (i % 3) * 0.22, 1.05 - Math.floor(i / 3) * 0.2, 0.26, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 10 });
      patchPoints.push(p);
    }
    reg(hits, patchPoints[2], "patch-panel");
    holoTag(rack, "patch panel", 0, 1.4, 0, { css: SSE_CSS, w: 0.3 });
    const dimmerHandle = box(rack, 0.16, 0.03, 0.03, 0, 0.5, 0.27, 0xe8b02e, { rough: 0.5 });
    holoTag(rack, "dimmer fader", 0, 0.65, 0.27, { css: SSE_CSS, w: 0.3 });
    reg(hits, dimmerHandle, "dimmer-fader");

    // ------------------------------------------------------------------ practical
    const practical = group(g, 0.4, 0, -2.6, -0.3);
    cyl(practical, 0.05, 0.06, 1.0, 0, 0.5, 0, 0x8b7355, { rough: 0.6, metal: 0.1, seg: 10 });
    const lampHead = ball(practical, 0.14, 0, 1.05, 0, 0xfff2cc, { emissive: 0xfff2cc, ei: 0.1, rough: 0.4 });
    holoTag(practical, "practical lamp", 0, 1.3, 0, { css: SSE_CSS, w: 0.3 });

    // ------------------------------------------------------------------ walkways
    const walkway1 = box(g, 3.4, 0.06, 0.9, 1.0, 0.03, 1.2, 0xffffff, { rough: 0.6 });
    walkway1.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, { base: "#33383c", base2: "#2a2e32" }), { repeat: 3, px: 256 }), { rough: 0.5, metal: 0.5, color: 0xb0b6bc });
    const crossingMark = box(g, 0.5, 0.02, 1.0, 0.4, 0.061, 1.2, 0xe8b02e, { rough: 0.6, opacity: 0.85, transparent: true, cast: false });
    holoTag(g, "main crossing", 0.4, 0.3, 1.2, { css: SSE_CSS, w: 0.3 });
    reg(hits, crossingMark, "crossing-mark");
    const crossCable = hose(g, [[0.0, 0.07, 1.0], [0.4, 0.07, 1.2], [0.9, 0.07, 1.35]], 0.02, 0x1b1e22, { steps: 10 });
    void crossCable;
    const unrampedHit = box(g, 0.5, 0.08, 0.4, 0.4, 0.04, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross without ramp?", 0.4, 0.24, 1.2, { css: "#d2312b", w: 0.4 });
    reg(hits, unrampedHit, "cross-cable-without-ramp");

    const walkway2 = box(g, 2.2, 0.06, 0.8, -0.6, 0.03, 2.2, 0xffffff, { rough: 0.6 });
    walkway2.material = walkway1.material;
    const secondCrossingHit = box(g, 0.4, 0.05, 0.3, -0.6, 0.03, 2.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "second crossing — ramped?", -0.6, 0.2, 2.2, { css: "#d2312b", w: 0.44 });
    reg(hits, secondCrossingHit, "second-crossing-no-ramp");
    const walkRail = box(g, 2.2, 0.03, 0.03, -0.6, 0.85, 2.6, 0x9aa0a6, { rough: 0.4, metal: 0.6 });
    void walkRail;
    const snaggedCable = hose(g, [[-1.5, 0.05, 2.4], [-1.0, 0.05, 2.55], [-0.4, 0.05, 2.45]], 0.02, 0x1b1e22, { steps: 10 });
    holoTag(g, "cable — snagged on rail?", -1.0, 0.3, 2.55, { css: "#d2312b", w: 0.42 });
    reg(hits, snaggedCable, "cable-snagged-on-walkway-rail");

    const spliceHit = box(g, 0.15, 0.04, 0.1, 1.6, 0.05, 0.4, 0x8a7a52, { rough: 0.7 });
    holoTag(g, "splice — taped over?", 1.6, 0.2, 0.4, { css: "#d2312b", w: 0.42 });
    reg(hits, spliceHit, "bare-splice-under-tape");

    // -------------------------------------------------------------------- ramp prop
    const rampProp = group(g, -2.0, 0, 0.6, 0.3);
    box(rampProp, 0.6, 0.06, 1.0, 0, 0.03, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(rampProp, "cable ramp", 0, 0.2, 0, { css: SSE_CSS, w: 0.3 });
    reg(hits, rampProp, "cable-ramp");

    // -------------------------------------------------------------------- meters
    const clampMeterProp = instrument(g, 1.9, 0.9, -1.0, { ry: -0.5, idle: "-- A", color: SSE_ACCENT, w: 0.13, d: 0.15 });
    holoTag(clampMeterProp, "clamp meter", 0, 0.16, 0, { css: SSE_CSS, w: 0.3 });
    reg(hits, clampMeterProp, "clamp-meter");
    const overloadFixture = group(g, 2.3, 0, -1.6, 0.4);
    box(overloadFixture, 0.2, 0.2, 0.16, 0, 0.1, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(overloadFixture, "add fixture — over limit?", 0, 0.32, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, overloadFixture, "overload-circuit-add-fixture");

    // ---------------------------------------------------------------------- radio
    const gafferRadioProp = instrument(g, -2.4, 0.9, -0.6, { ry: 0.5, idle: "GAFFER — CH 6", color: SSE_ACCENT, w: 0.1, d: 0.16 });
    holoTag(gafferRadioProp, "gaffer radio", 0, 0.16, 0, { css: SSE_CSS, w: 0.34 });
    reg(hits, gafferRadioProp, "gaffer-radio");

    // ------------------------------------------------------------------------ ppe
    const ppeRack = group(g, -2.7, 0, 1.6, 0.3);
    cyl(ppeRack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(ppeRack, 0.5, 0.03, 0.03, 0, 1.18, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const gloves = box(ppeRack, 0.14, 0.05, 0.1, -0.14, 1.0, 0, 0xd8a63a, { rough: 0.8 });
    holoTag(ppeRack, "insulated gloves", -0.14, 1.2, 0, { css: SSE_CSS, w: 0.32 });
    reg(hits, gloves, "insulated-gloves");
    const glasses = box(ppeRack, 0.14, 0.04, 0.05, 0.14, 1.0, 0, 0xdfe4e8, { rough: 0.4, transparent: true, opacity: 0.6 });
    holoTag(ppeRack, "safety glasses", 0.14, 1.15, 0, { css: SSE_CSS, w: 0.32 });
    reg(hits, glasses, "safety-glasses");
    const chest = toolChest(g, -2.9, -1.0, { ry: 0.3, color: 0x2b2b30 });
    void chest;

    const electrician = standingFigure(g, 0.0, -0.9, { ry: 2.6, vest: SSE_ACCENT, cloth: 0x2b2f34 });
    holoTag(electrician, "set electrician", 0, 2.0, 0, { css: SSE_CSS, w: 0.36 });
    void electrician;

    // Hidden second-electrician decoy for the interruption.
    const secondElectrician = standingFigure(g, -1.1, -0.3, { ry: -1.0, cloth: 0x4a5568, cap: 0x2b2b30 });
    secondElectrician.visible = false;

    // -------------------------------------------------------------------- paperwork
    const plot = holoPanel(g, 0.95, 0.66, -3.3, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#241a04"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fdecc4"; cx.fillText("POWER PLOT — TODAY'S RIG", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.064)}px Arial, sans-serif`; cx.fillStyle = "#f7edd0";
      ["Circuit 3: practical, dimmer channel 12", "Breaker rating: per the panel label", "Both crossings ramped before wrap",
       "Prove dead before any lug is touched", "Gaffer confirms before the board runs it"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: SSE_ACCENT });
    reg(hits, plot, "power-plot-panel");

    const calc = holoPanel(g, 0.8, 0.58, -0.6, 1.3, -3.0, (cx, w, h) => {
      cx.fillStyle = "#241a04"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fdecc4"; cx.fillText("LOAD CALCULATION", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#f7edd0";
      ["Circuit 3 planned load: under rating", "Breaker: per the panel's own label", "Add nothing past this line"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.5, accent: SSE_ACCENT });
    reg(hits, calc, "load-calc-sheet");

    const log = holoPanel(g, 0.6, 0.42, -3.3, 1.3, 0.6, (cx, w, h) => {
      cx.fillStyle = "#241a04"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fdecc4"; cx.fillText("ELECTRICAL LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f7edd0";
      ["Circuit: —", "Load: —", "Crossings: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: SSE_ACCENT });
    reg(hits, log, "electrical-log");

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-donning") { gloves.visible = false; glasses.visible = false; }
        if (step.id === "breaker-lockout") { breaker.rotation.z = -1.1; lock.visible = true; }
        if (step.id === "breaker-energize") { breaker.rotation.z = 0; lock.visible = false; }
        if (step.id === "ramp-crossing") { rampProp.position.set(0.4, 0, 1.2); crossingMark.visible = false; }
        if (step.id === "panel-cover-close") cover.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
        if (step.id === "electrical-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#241a04"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fdecc4"; cx.fillText("ELECTRICAL LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Circuit 3: patched, dimmer 12", "Load: under rating, clamp-metered", "Crossings: both ramped"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "second-electrician-reaches-lug") { secondElectrician.visible = true; }
        if (it.id === "cart-crosses-unramped-run") { lampHead.material = mat(0xfff2cc, { emissive: 0xd2312b, ei: 1.4, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-electrician-reaches-lug") { secondElectrician.visible = false; }
        if (it.id === "cart-crosses-unramped-run") { lampHead.material = mat(0xfff2cc, { emissive: 0xfff2cc, ei: 0.1, rough: 0.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && (step?.id === "breaker-lockout" || step?.id === "breaker-energize")) {
          breaker.rotation.z = step.id === "breaker-lockout" ? -session.turn.amount / session.turn.required * 1.1 : -1.1 + session.turn.amount / session.turn.required * 1.1;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "clamp-meter-check") repaint(clampMeterProp.userData.screen, signFace(`${Math.round(gg.t * 30)}`, { bg: "#0d1c24", accent: gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#f7edd0", scale: 0.6 }));
        if (step?.id === "dimmer-fade" && session.holding) lampHead.material.emissiveIntensity = 0.1 + Math.max(0, session.track?.v ?? 0.1) * 1.6;
        void dt; void t; void CITY;
      },
    };
  },
};
