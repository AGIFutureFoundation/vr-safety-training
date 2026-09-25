import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { scissorLift } from "../../../shared/equipment.js";

// SmartCiti.X~ Followspot & Truss Access at Height VR — Entertainment & Live
// Events, the live events block.
//
// An arena bowl before doors: a fixed spot tower bolted into the roof steel,
// reached by a scissor lift parked at its base, with a lighting truss run
// past the tower carrying the rest of the rig. The learner is the IATSE
// followspot operator who rides the lift to the platform, clips onto the
// tower before stepping off the gate, checks the truss coupler the walkway
// hangs its rail from, strikes the spot's xenon lamp on its own switch away
// from the lamp housing, sets the beam to the plot's field size, and follows
// the number — with a rigger working below and a second climber on the same
// fixed ladder both needing an answer mid-cue. The building and the show are
// generic.

const LFT_ACCENT = 0xc58cff;
const LFT_CSS = "#c58cff";
const LFT_PLATFORM_Y = 3.2;

export const SIM_LE_FOLLOWSPOT_AND_TRUSS_ACCESS_AT_HEIGHT = {
  id: "le-followspot-and-truss-access-at-height",
  index: "318",
  domain: "Entertainment & Live Events",
  trade: "IATSE followspot operator, working from a fixed spot tower platform reached by scissor lift, beside a lighting truss run",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE training trust with ETCP Certified Rigger; ANSI/SAIA A92 mobile elevating work platforms for the scissor lift ride; ANSI/ASSP Z359 fall protection for the tower platform; OSHA 29 CFR 1910.28 duty to have fall protection; NFPA 70E for the followspot's high-voltage igniter",
  name: "Followspot & Truss Access at Height",
  title: simTitle("Followspot & Truss Access at Height"),
  tagline: "A spot tower before doors: the plot read for which position is towered and which is trussed, hard hat and harness on, the scissor lift's guardrail pin checked, ridden up held to the platform, clipped to the tower anchor before the gate opens, a cracked truss coupler found before any weight goes on the walkway, the xenon lamp struck on its own switch clear of the housing, the beam set to the plot's field size, the cue followed across the deck, a rigger below caught in the beam answered on the douser, a second climber on the same ladder answered before anyone doubles up on it, the cable looped to its cleat, and the position logged",
  accent: LFT_ACCENT,
  accentCss: LFT_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "spot-struck-and-safe", name: "Spot Struck and Safe", note: "Clipped before the gate opened, the coupler checked, the lamp struck clear of the housing, the beam answered off a crew member's eyes, and the ladder never doubled up" },

  supportLine: "your IATSE local's member assistance contact, or the employee assistance programme your employer or the local carries",

  game: system({
    name: "Spot Tower",
    currency: "POINT",
    ranks: ["Ground Hand", "Spot Trainee", "Followspot Operator", "Lead Spot Operator", "Arena Rigging Certified"],
    badges: [
      { id: "clipped-first", name: "Clipped First", note: "Never off the lift gate before the tower anchor was clipped", test: AWARD.stepClean("positioning-lanyard") },
      { id: "beam-answered", name: "Beam Answered", note: "The douser hit before the rigger below was blinded a second longer", test: AWARD.unbroken },
      { id: "never-in-the-lamp", name: "Never in the Lamp", note: "Never reached into the lamp housing, never rode the lift ungated, never on the truss frame itself", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-climb", name: "Clean Climb", note: "No corrections anywhere in the climb or the cue", test: AWARD.clean },
      { id: "field-on-the-plot", name: "Field On The Plot", note: "Iris field size committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "doors-on-time", name: "Doors On Time", note: "Position logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "step-off-unclipped": "You stepped from the lift platform onto the tower walkway before clipping the positioning lanyard to the tower anchor. The gap between a raised platform and a fixed tower is exactly wide enough to fall through, and the lanyard is what keeps that step from being the last thing that goes wrong tonight. It gets clipped from inside the gate, before the gate opens, every time.",
    "reach-into-lamp-housing": "You reached into the followspot's lamp housing with the unit plugged in. A xenon followspot's igniter pulses tens of thousands of volts into the lamp to strike the arc, and the housing stays live at the igniter's terminals even with the lamp switch off if the unit is not unplugged. The lamp is struck and doused from its own switch, never opened with a hand near the terminals while it has power.",
    "climb-on-truss-frame": "You climbed out onto the lighting truss frame instead of using the tower's rated walkway. A truss is built to carry fixtures and cable in tension along its chords, not a person's weight applied sideways at a diagonal, and a chord that flexes under a climbing rigger can crack a weld that was never going to be inspected again before the show. The walkway is rated for a person; the truss beside it is not.",
    "unrated-carabiner": "You clipped your lanyard into the loose carabiner from the bottom of the rigging bag instead of the tower's rated positioning point. A carabiner bought for a coil of rope is not rated for a fall arrest force, and it looks exactly like the rated one until it is the thing between you and the deck. The tower's anchor point is marked and rated; nothing else at height is a substitute for it.",
  },

  lateNotes: {
    "tower-anchor": "The lanyard clips to the tower anchor once you are standing at the gate with the lift locked level — there is nothing to clip to from the lift basket floor.",
    "igniter-switch": "The lamp strikes once the housing is closed and latched — it will not fire with the door open.",
    "spot-log": "The position is logged once the cue is finished and the lift has you back on the deck — the log is last.",
  },

  steps: [
    {
      id: "spot-position-plot", kind: "select", target: "spot-position-plot",
      title: "Read the lighting plot: which positions are towered, which are trussed",
      cue: "Read the plot for tonight's spot positions: which ones are fixed towers with a rated platform, which are truss-hung, and the field size and colour each position calls for the top of the show.",
      why: "A followspot position that looks the same from the floor can be two very different climbs: a fixed tower with a platform and a rated anchor, or a truss position reached from a genie ladder with nothing to clip to until the rigger runs a temporary line. The plot is where that difference is written down, along with the field size and colour the designer wants at curtain, and a spot operator who climbs before reading it is finding out which kind of position they are on the way up rather than on the ground.",
    },
    {
      id: "spot-ppe", kind: "sequence", anyOrder: true,
      targets: ["hard-hat", "fall-harness"],
      itemNames: { "hard-hat": "hard hat", "fall-harness": "fall-arrest harness" },
      title: "Hard hat and harness on before the lift moves",
      cue: "Hard hat on for as long as anyone is working overhead, and the fall-arrest harness on and buckled before the lift leaves the deck.",
      why: "The harness has to be on and adjusted on the ground, where both hands are free and a loose strap is easy to see and fix — not at height, balanced on a lift platform with a hand needed for the rail. Hard hats stay on under a rig with people working above, because a dropped tool from a tower a few storeys up is exactly as dangerous to the crew on the floor as it is to the crew that dropped it.",
    },
    {
      id: "lift-inspect", kind: "find", noHint: true,
      targets: ["bent-guardrail-pin"],
      itemNames: { "bent-guardrail-pin": "bent guardrail pin on the scissor lift's gate" },
      itemNotes: { "bent-guardrail-pin": "The scissor lift's entry gate has a bent locking pin that will not seat home — the gate can swing open at height under a shoulder brushing it. It is tagged and a spare lift is called before anyone rides this one up." },
      title: "Inspect the scissor lift before riding it up",
      cue: "Walk the scissor lift: the guardrails and gate, the scissor pins, the platform controls, the outriggers if it has them.",
      why: "A mobile elevating work platform is inspected before the shift the same way a car is walked before a drive, because the fault that matters is the one nobody feels until the platform is thirty feet up and the gate is the only thing between the operator and the edge. ANSI/SAIA A92 has the pre-use inspection for exactly this reason, and a bent pin found on the ground is a delay; the same pin found in the air is a fall.",
    },
    {
      id: "lift-ride", kind: "hold", target: "lift-up-control", seconds: 5,
      title: "Ride the lift up to the tower platform, watching the rail clear the truss",
      cue: "Hold the platform's UP control and ride to the tower's platform height, watching the guardrail clear the truss run beside it as you rise.",
      why: "The lift's platform passes close to the truss run on its way up, and a guardrail that catches a chord on the way past can rock the platform or shift a fixture the truss is carrying. Riding it up held, with eyes on the clearance rather than on the controller, is how the operator catches a rail about to touch before it does — the same reason a crane operator watches the load and not the joystick.",
      holdBreakNote: "You let go of UP with the platform still moving — a lift that coasts on its own momentum with nobody watching the rail is how a guardrail finds the truss. Take the control again and finish the ride watching the clearance.",
    },
    {
      id: "positioning-lanyard", kind: "select", target: "tower-anchor",
      title: "Clip the positioning lanyard to the tower anchor before the gate opens",
      cue: "From inside the lift gate, clip the positioning lanyard to the tower's marked anchor point before the gate is opened to step across.",
      why: "The gap between a lift platform and a fixed tower is the one moment in the whole climb where a slip has nothing under it, and the lanyard is rigged to the tower's own rated anchor from inside the gate specifically so the connection exists before the opening does. ANSI/ASSP Z359 governs the connector and the anchor both, and the order — clip, then open the gate — is what keeps the standard from being theoretical.",
    },
    {
      id: "coupler-check", kind: "find", noHint: true,
      targets: ["cracked-coupler"],
      itemNames: { "cracked-coupler": "cracked coupler under the walkway rail" },
      itemNotes: { "cracked-coupler": "The clamp coupler holding the walkway's outboard rail to the tower has a hairline crack across its jaw — under a full step of weight it could let the rail swing loose. It is tagged out and the rail is worked from the inboard side only until it is swapped." },
      title: "Check the coupler the walkway rail hangs from before trusting it",
      cue: "Look at the coupler holding the outboard guardrail to the tower frame: the jaw, the pin, any crack or bend, before leaning on the rail.",
      why: "A followspot operator leans on the outboard rail all night, tracking a performer across the deck, and the rail is only as good as the coupler holding it to the tower. A cracked jaw carries a static lean fine and then lets go under the one sudden shift of weight that happens when someone catches their balance — which is exactly the moment the rail was there for.",
    },
    {
      id: "igniter-switch", kind: "turn", target: "igniter-switch",
      title: "Strike the xenon lamp from its own switch, housing closed",
      cue: "With the lamp housing closed and latched, turn the igniter switch to STRIKE and let the arc catch.",
      why: "A xenon followspot's igniter pulses a very high voltage into the lamp to start the arc, and that pulse is present at the lamp's terminals whenever the unit has power — closed housing or not. The switch is what a hand touches; the terminals never are. Striking it from the switch with the housing latched is the only version of turning a followspot on that keeps the igniter's voltage where it belongs.",
      turn: { turns: 1.0, label: "IGNITER", readout: (t) => (t < 0.4 ? "charging" : t < 0.9 ? "striking" : "arc struck") },
    },
    {
      id: "field-size", kind: "gauge", target: "iris-gauge",
      title: "Set the beam's field size to the plot's figure",
      cue: "Open the iris to the plot's field size for this position and commit the reading.",
      why: "The field size is drawn from the same lighting plot the whole rig is built from, and a spot that is wider or narrower than the plot calls for either washes out the surrounding fixtures or misses the performer at the edges of the number. Setting it here, before the number starts, is what makes the first cue match what the designer drew rather than whatever the last operator on this unit left it at.",
      gauge: { label: "IRIS FIELD", speed: 0.6, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not on the plot's field size — open or close the iris to the plotted figure, not to what looks right from the tower." },
    },
    {
      id: "follow-cue", kind: "track", target: "follow-cue",
      seconds: 6,
      title: "Follow the performer's mark across the deck",
      cue: "Pan and tilt to keep the beam centred on the performer's mark as they cross — a beam that drifts off the mark is a spot that just went dark on the one person the audience is watching.",
      why: "A followspot's whole job during a number is staying centred on a moving mark, and the band that counts as 'on' is narrow because an audience notices a spot drifting off a performer's face far sooner than it notices almost anything else on stage. Tracking it live, correcting toward centre rather than snapping to it, is what a trained operator does differently from someone handed the yoke for the first time.",
      track: { start: 0.5, green: [0.42, 0.58], rise: 0.5, fall: 0.5, drift: 0.14, label: "ON MARK", readout: (v) => (v < 0.42 ? "trailing" : v > 0.58 ? "leading" : "on mark") },
      holdBreakNote: "The beam drifted off the mark — ease back toward centre rather than snapping the yoke, and pick the mark back up.",
    },
    {
      id: "cable-loop", kind: "drag", target: "spot-cable",
      title: "Loop the followspot's cable to the platform's strain-relief cleat",
      cue: "Take up the slack in the followspot's power cable and loop it onto the platform's cleat so no bight hangs free at the rail.",
      why: "A followspot on a moving yoke pulls its own cable with every pan, and a loop with no strain relief eventually pulls a connector apart mid-cue or leaves a bight hanging where a foot at the rail can catch it. Cleating the slack before the number starts is the same habit as coiling a stage cable — done once, it does not become anyone's problem during the show.",
      drag: { to: "cable-cleat", radius: 0.5, missNote: "Not on the cleat — the loop has to sit over the cleat's horn, not lying loose on the platform deck." },
    },
    {
      id: "spot-checkin", kind: "select", target: "headset-radio",
      title: "Check in with the head electrician before doors",
      cue: "Call the head electrician that your position is struck, focused and clipped in, and check in with the crew after the ladder near-miss.",
      why: "The head electrician's cue-to-cue relies on knowing every spot position is live and correctly focused before the house opens, so the call has to happen before doors rather than be assumed. It is also the crew's own check-in: two people on one fixed ladder at once is the kind of near miss that stays with both of them, and IATSE's practice is to name it on the radio along with the member assistance line, rather than let it pass as a story for later.",
    },
    {
      id: "spot-log", kind: "select", target: "spot-log",
      title: "Log the position, the coupler and the lift",
      cue: "Record the field size and colour struck, the cracked coupler tagged out, the bent guardrail pin on the lift, and the ladder near miss.",
      why: "The position log is what the next operator on this tower reads before they climb, and it is what the head electrician hands the venue when the coupler needs replacing before the next load-in. A cracked coupler that is not written down is a cracked coupler the next crew finds the hard way, and a log written from the platform, right after the climb, is the tower as it actually is rather than as someone remembers it the next morning.",
    },
  ],

  interrupts: [
    {
      id: "beam-in-crew-eyes",
      kind: "Beam sweeps across a rigger's eyes below",
      after: "follow-cue", delay: 2, seconds: 12,
      alert: "A rigger working a ladder on the deck below has walked into the beam and is shielding their eyes, one hand off the ladder, starting to lose balance.",
      cue: "Hit the douser on the yoke — the beam cuts before the rigger loses the other hand.",
      target: "spot-douser",
      why: "A followspot's beam is bright enough to flash-blind anyone it crosses at close range, and a rigger on a ladder who throws a hand up to shield their eyes is a rigger with one hand left on the rails. The douser is a separate flag on the yoke from the iris used to shape the beam, built for exactly this — killing the beam in an instant without losing the pan and tilt position underneath it.",
      missNote: "The beam stayed on the rigger a second too long; they let go of the ladder to shield their eyes and caught the rail hard on the way back, dropping a wrench to the deck below.",
      wrongNote: "The douser on the yoke — the iris only changes the beam's size, and the douser is the one control that cuts it dark instantly.",
    },
    {
      id: "second-climber-on-ladder",
      kind: "Second electrician starts up the same fixed ladder",
      after: "coupler-check", delay: 2, seconds: 12,
      alert: "Another IATSE electrician has started climbing the tower's fixed ladder while you are still on the platform above — the ladder is not rated for two.",
      cue: "Call down on the headset radio for them to hold at the base until you are clipped and clear of the ladder.",
      target: "headset-radio",
      why: "A fixed ladder's rungs and rails are sized for one climber's load at a time, and two people on it at once — one above, one starting up — is a fall for whichever one loses their grip first, with the other one in the way of any rescue. The radio reaches the ground faster than a shout down a tower, and it is used the moment a second silhouette starts up rather than after they are already halfway.",
      missNote: "The second electrician kept climbing; the ladder flexed under both of them and the one below jumped clear onto the deck rather than trust the last three rungs.",
      wrongNote: "The headset radio — a shout down a tower this tall does not carry, and the radio reaches the ground crew directly.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, LFT_ACCENT);

    // ------------------------------------------------------------ the deck
    const floor = box(g, 6.2, 0.05, 5.0, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#241f1e", base2: "#1e1a19", step: 34 }), { repeat: 5, px: 512 }), { rough: 0.9, metal: 0.05, color: 0xa89f92 });

    // -------------------------------------------------------- the spot tower
    const towerX = 0.6, towerZ = -1.1;
    const tower = group(g, towerX, 0, towerZ);
    for (const [sx, sz] of [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]]) {
      cyl(tower, 0.035, 0.035, LFT_PLATFORM_Y, sx, LFT_PLATFORM_Y / 2, sz, 0x4a4f55, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    for (let i = 1; i < 6; i++) {
      const y = (i / 6) * LFT_PLATFORM_Y;
      for (const sx of [-0.32, 0.32]) box(tower, 0.02, 0.02, 0.64, sx, y, 0, 0x4a4f55, { rough: 0.5, metal: 0.6 });
      for (const sz of [-0.32, 0.32]) box(tower, 0.64, 0.02, 0.02, 0, y, sz, 0x4a4f55, { rough: 0.5, metal: 0.6 });
    }
    // Fixed ladder up one face.
    const ladder = group(tower, -0.32, 0, 0.32);
    for (const sy of [-0.15, 0.15]) cyl(ladder, 0.014, 0.014, LFT_PLATFORM_Y, sy, LFT_PLATFORM_Y / 2, 0, 0x7d858d, { rough: 0.4, metal: 0.7, seg: 6 });
    for (let i = 0; i < 14; i++) box(ladder, 0.34, 0.014, 0.02, 0, 0.2 + i * (LFT_PLATFORM_Y - 0.3) / 14, 0, 0x7d858d, { rough: 0.4, metal: 0.7 });

    // Platform.
    const platform = group(tower, 0, LFT_PLATFORM_Y, 0);
    box(platform, 0.7, 0.03, 0.7, 0, 0, 0, 0x3a3f45, { rough: 0.7, metal: 0.4 });
    const railOutboard = box(platform, 0.7, 0.04, 0.04, 0, 0.55, 0.34, 0x9aa0a6, { rough: 0.4, metal: 0.7 });
    for (const sx of [-1, 1]) cyl(platform, 0.018, 0.018, 0.55, sx * 0.34, 0.28, 0.34, 0x9aa0a6, { rough: 0.4, metal: 0.7, seg: 6 });
    box(platform, 0.7, 0.04, 0.04, 0, 0.55, -0.34, 0x9aa0a6, { rough: 0.4, metal: 0.7 });
    const couplerGroup = group(platform, 0.34, 0.4, 0.34);
    cyl(couplerGroup, 0.035, 0.035, 0.07, 0, 0, 0, 0x9aa0a6, { rough: 0.35, metal: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(couplerGroup, "coupler — check", 0, 0.18, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, couplerGroup, "cracked-coupler");
    const anchorPoint = torus(platform, 0.05, 0.012, -0.3, 0.7, 0.0, LFT_ACCENT, { emissive: LFT_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(platform, "tower anchor — clip", -0.3, 0.9, 0, { css: LFT_CSS, w: 0.34 });
    reg(hits, anchorPoint, "tower-anchor");
    void railOutboard;

    // Followspot fixture on its yoke.
    const yoke = group(platform, 0, 0.75, 0.1);
    box(yoke, 0.1, 0.16, 0.1, -0.2, 0, 0, 0x14171a, { rough: 0.5, metal: 0.4 });
    const spotHousing = group(yoke, 0, 0.02, 0);
    cyl(spotHousing, 0.09, 0.11, 0.5, 0, 0, 0, 0x1b1e22, { rough: 0.45, metal: 0.5, seg: 14 });
    spotHousing.rotation.z = Math.PI / 2;
    const igniter = box(spotHousing, 0.06, 0.06, 0.04, -0.16, 0.09, 0, 0xe8b02e, { rough: 0.4, metal: 0.5 });
    holoTag(spotHousing, "igniter switch", -0.16, 0.24, 0, { css: LFT_CSS, w: 0.3 });
    reg(hits, igniter, "igniter-switch");
    const lampReach = box(spotHousing, 0.08, 0.08, 0.08, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(spotHousing, "reach into the lamp?", 0.16, -0.16, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, lampReach, "reach-into-lamp-housing");
    const iris = instrument(yoke, 0.22, 0.26, 0, { ry: 0, idle: "-- %", color: LFT_ACCENT, w: 0.1, d: 0.14 });
    holoTag(iris, "iris field", 0, 0.16, 0, { css: LFT_CSS, w: 0.24 });
    reg(hits, iris, "iris-gauge");
    const douser = box(yoke, 0.05, 0.05, 0.02, -0.24, -0.08, 0.06, 0xd2312b, { rough: 0.5 });
    holoTag(yoke, "douser", -0.24, 0.06, 0.06, { css: LFT_CSS, w: 0.2 });
    reg(hits, douser, "spot-douser");
    const beam = cyl(yoke, 0.02, 0.5, 5.0, 0, 0.28, 2.6, LFT_ACCENT, { emissive: LFT_ACCENT, ei: 0.5, transparent: true, opacity: 0.16, rough: 1, cast: false, seg: 16 });
    beam.rotation.x = -Math.PI / 2 + 0.2;
    const trussFrame = group(tower, -1.6, LFT_PLATFORM_Y - 0.3, 0.35);
    for (const [cy, cz] of [[-0.15, -0.15], [-0.15, 0.15], [0.15, -0.15], [0.15, 0.15]]) {
      const c = cyl(trussFrame, 0.02, 0.02, 2.4, cy, 0, cz, 0xd8dde2, { rough: 0.35, metal: 0.8, seg: 8 });
      c.rotation.z = Math.PI / 2;
    }
    const trussClimbHit = box(trussFrame, 2.4, 0.15, 0.3, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trussFrame, "climb the truss frame?", 0, 0.4, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, trussClimbHit, "climb-on-truss-frame");

    // Cable and cleat.
    const spotCable = hose(platform, [[0, 0.4, 0.1], [0.2, 0.2, 0.2], [0.32, 0.1, 0.28]], 0.012, 0x14171a, { steps: 8, rough: 0.7 });
    holoTag(platform, "power cable", 0.28, 0.35, 0.24, { css: LFT_CSS, w: 0.24 });
    reg(hits, spotCable, "spot-cable");
    const cleat = box(platform, 0.06, 0.03, 0.02, 0.34, 0.06, 0.3, 0xe8b02e, { rough: 0.6 });
    holoTag(platform, "cable cleat", 0.34, 0.18, 0.3, { css: LFT_CSS, w: 0.22 });
    reg(hits, cleat, "cable-cleat");
    const followTarget = torus(g, 0.14, 0.014, 0.4, 0.03, 1.4, LFT_ACCENT, { emissive: LFT_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    followTarget.rotation.x = Math.PI / 2;
    holoTag(g, "performer's mark", 0.4, 0.4, 1.4, { css: LFT_CSS, w: 0.32 });
    reg(hits, followTarget, "follow-cue");

    // ------------------------------------------------------ scissor lift
    const lift = scissorLift(g, -2.0, 0, 0.6, { livery: { colour: 0xe8b02e, fleetName: "SMARTCITI FLEET", unitNumber: "SL-08" } });
    const { platform: liftDeck, gate } = lift.userData.parts;
    void liftDeck;
    const guardrailPin = box(gate ?? lift, 0.03, 0.03, 0.03, 0, 0.9, 0.2, 0xb87a3a, { rough: 0.6, metal: 0.5 });
    holoTag(lift, "guardrail pin", 0, 1.5, 0.2, { css: LFT_CSS, w: 0.3 });
    reg(hits, guardrailPin, "bent-guardrail-pin");
    const upControl = box(lift, 0.05, 0.02, 0.06, -0.2, 1.05, 0.3, 0x3fae6a, { rough: 0.4 });
    holoTag(lift, "UP — hold", -0.2, 1.3, 0.3, { css: LFT_CSS, w: 0.26 });
    reg(hits, upControl, "lift-up-control");
    const gateHit = box(lift, 0.4, 0.9, 0.05, 0, 0.9, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(lift, "step off unclipped?", 0, 1.6, -0.35, { css: "#d2312b", w: 0.44 });
    reg(hits, gateHit, "step-off-unclipped");

    // ------------------------------------------------------- hardware, PPE
    const rack = group(g, -2.6, 0, 2.0, 0.4);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const hat = group(rack, -0.14, 1.2, 0);
    ball(hat, 0.1, 0, 0, 0, 0xf2f2f2, { rough: 0.5 });
    box(hat, 0.24, 0.015, 0.26, 0, -0.04, 0.02, 0xf2f2f2, { rough: 0.5 });
    holoTag(rack, "hard hat", -0.14, 1.6, 0, { css: LFT_CSS, w: 0.2 });
    reg(hits, hat, "hard-hat");
    const harness = group(rack, 0.18, 1.1, 0.02);
    box(harness, 0.05, 0.22, 0.02, -0.05, 0, 0, 0xd8a63a, { rough: 0.8 });
    box(harness, 0.05, 0.22, 0.02, 0.05, 0, 0, 0xd8a63a, { rough: 0.8 });
    holoTag(rack, "fall harness", 0.2, 1.5, 0, { css: LFT_CSS, w: 0.3 });
    reg(hits, harness, "fall-harness");
    const chest = toolChest(g, 1.6, 1.8, { ry: -0.3, color: 0x2b2b30 });
    const junk = group(chest, -0.16, 0.8, 0.05);
    torus(junk, 0.03, 0.01, 0, 0.04, 0, 0x8a8f94, { rough: 0.6, metal: 0.5, seg: 6, seg2: 12 });
    holoTag(junk, "unrated carabiner?", 0, 0.22, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, junk, "unrated-carabiner");
    const radio = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.1, idle: "CH 3 · SPOTS", color: LFT_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "headset radio", 0, 0.16, 0, { css: LFT_CSS, w: 0.28 });
    reg(hits, radio, "headset-radio");

    // -------------------------------------------------------------- paperwork
    const plot = holoPanel(g, 0.95, 0.66, -2.35, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = LFT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("SPOT PLOT — POSITION A", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["Position A: fixed tower, rated platform", "Field size and colour per the plot", "Anchor: tower's marked point only", "Truss beside it carries fixtures, not people",
       "Lamp struck from the switch, housing closed", "Log the coupler and lift faults found"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.9, accent: LFT_ACCENT });
    reg(hits, plot, "spot-position-plot");
    const log = holoPanel(g, 0.6, 0.42, 2.5, 1.3, 1.6, (cx, w, h) => {
      cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = LFT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("POSITION LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecfb";
      ["Position A: —", "Coupler: —", "Lift: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: LFT_ACCENT });
    reg(hits, log, "spot-log");
    const ticket = decal(g, 0.2, 0.26, 0.5, 0.06, 0.5, paperFace("OUT OF SERVICE", ["coupler", "tagged"], { bg: "#f2e0a0", band: "#d2312b" }), { px: 128 });
    ticket.rotation.x = -Math.PI / 2;
    ticket.visible = false;

    // ------------------------------------------------------------- crew
    const rigger = standingFigure(g, 1.7, 1.15, { ry: 2.4, cloth: 0x14171a, helmet: 0xf2f2f2, gloves: true });
    holoTag(rigger, "rigger below", 0, 1.95, 0, { css: LFT_CSS, w: 0.26 });
    const riggerShield = box(rigger, 0.14, 0.16, 0.03, 0, 1.5, 0.14, 0xd8a63a, { rough: 0.7, cast: false });
    riggerShield.visible = false;
    const climber = standingFigure(g, -0.8, 0.7, { ry: 2.2, cloth: 0x1b1e22, helmet: 0xf2f2f2 });
    const climberHome = climber.position.clone();
    climber.visible = false;

    let struck = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 1.6, -1.1),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lift-inspect") { guardrailPin.material = mat(0x8fa08f, { rough: 0.6 }); }
        if (step.id === "coupler-check") { couplerGroup.children[0].material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.6 }); ticket.visible = true; }
        if (step.id === "igniter-switch") { struck = true; beam.material = mat(LFT_ACCENT, { emissive: LFT_ACCENT, ei: 1.4, transparent: true, opacity: 0.4, rough: 1 }); }
        if (step.id === "cable-loop") spotCable.visible = false;
        if (step.id === "spot-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#130a1c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#efe0ff"; cx.fillText("POSITION LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Position A: struck, on plot", "Coupler: tagged, swap called", "Lift: pin tagged, spare called"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "spot-checkin") repaint(radio.userData.screen, signFace("POSITIONS SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "beam-in-crew-eyes") { riggerShield.visible = true; }
        if (it.id === "second-climber-on-ladder") { climber.visible = true; climber.position.set(-0.5, 0, 0.5); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "beam-in-crew-eyes") { beam.material = mat(0x1a1a1a, { transparent: true, opacity: 0.05, rough: 1 }); riggerShield.visible = false; }
        if (it.id === "second-climber-on-ladder") { climber.visible = false; climber.position.copy(climberHome); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "igniter-switch") igniter.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "field-size") repaint(iris.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "follow-cue" && session.holding) beam.rotation.z = (session.track.v - 0.5) * 0.6;
        void dt; void t; void CITY; void struck;
      },
    };
  },
};
