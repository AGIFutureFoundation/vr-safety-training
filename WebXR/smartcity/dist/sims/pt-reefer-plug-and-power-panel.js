import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Reefer Plug & Power Panel VR — Maritime & Ports, the port
// maintenance pack.
//
// A reefer row in the terminal: refrigerated containers on chassis, each
// plugged into a receptacle on a power pedestal fed from the row's panel. One
// receptacle has been arcing. The learner is the ILWU maintenance and repair
// electrician; the panel is worked to NFPA 70E, the plug comes out dead, and
// the reefer unit itself is shut down at its own controller before anything
// upstream of it is opened — a plug pulled under load is an arc in the hand.

const PTR_ACCENT = 0x4fc3d6;

export const SIM_PT_REEFER_PLUG_AND_POWER_PANEL = {
  id: "pt-reefer-plug-and-power-panel",
  index: "220",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair electrician — reefer power, PMA training programme, with IUOE stationary engineers on the row's distribution",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "fog",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE stationary engineers for the row's distribution; NFPA 70E electrical safety in the workplace; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy; 29 CFR 1910.132 for the arc-rated face shield and gloves",
  name: "Reefer Plug & Power Panel",
  title: simTitle("Reefer Plug & Power Panel"),
  tagline: "An arcing reefer receptacle: the circuit identified at the panel, arc-rated PPE on, the unit shut down at its own controller before the breaker opens and locks, the plug collar turned and withdrawn dead, absence of voltage proven while a neighbouring reefer throws a fault, the burned contact found, a new receptacle fitted and its terminals torqued, ground proven, the breaker restored and the load current watched settle beside a live lane",
  accent: PTR_ACCENT,
  accentCss: "#4fc3d6",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "dead-before-open", name: "Dead Before Open", note: "The unit off, the breaker locked, the plug out dead and absence of voltage proven before a contact was touched" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Reefer Row",
    currency: "AMP",
    ranks: ["Reefer Hand", "M&R Electrician", "Row Electrician", "Lead Electrician", "Reefer Power Certified"],
    badges: [
      { id: "unit-off-first", name: "Unit Off First", note: "The reefer shut down at its own controller before the breaker was opened", test: AWARD.stepClean("shutdown-and-lock") },
      { id: "proven-dead", name: "Proven Dead", note: "Absence of voltage held for the full test on every contact", test: AWARD.stepClean("absence-of-voltage") },
      { id: "row-discipline", name: "Row Discipline", note: "Never a plug pulled live, never a bare hand in the panel, never a lock removed that was not yours", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-replacement", name: "Clean Replacement", note: "No corrections anywhere in the replacement", test: AWARD.clean },
      { id: "settled-load", name: "Settled Load", note: "Held the load current in band as the unit came up", test: AWARD.unbroken },
      { id: "row-back-cold", name: "Row Back Cold", note: "Reefer back on power inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "pull-plug-live": "You pulled the reefer plug with the unit running and the breaker closed. A reefer's compressor draws a heavy current, and a plug drawn under that load draws an arc across the contacts as it comes out — into the hand holding it. NFPA 70E treats the plug as a disconnecting means only when the load is off, which is why the unit goes down at its controller and the breaker opens first.",
    "bare-hand-panel": "You opened the pedestal panel door with no arc-rated face shield and no rated gloves. The panel is live until proven otherwise, and an arc flash at a reefer pedestal is a fault current from the row's transformer with your face a forearm away — NFPA 70E puts the arc-rated PPE on before the door, not after the first spark.",
    "remove-others-lock": "You cut another electrician's lock off the panel breaker to get the row back sooner. That lock says a person is somewhere on that circuit; 29 CFR 1910.147 lets a lock come off only by the hand that put it on, or by a supervisor who has physically found that person — a bolt cutter has never once found anybody.",
    "wet-receptacle-plugin": "You plugged the reefer back in with standing water in the receptacle. Fog and wash-down leave water in a row's receptacles, and water across a receptacle's contacts is a fault path the moment the plug lands — the receptacle is dried and checked before a plug goes near it, every time.",
  },

  lateNotes: {
    "plug-collar": "The plug comes out only once the unit is shut down and the branch breaker is open and locked — not while it carries load.",
    "restore-breaker": "The breaker is restored only once the new receptacle is fitted, torqued and its ground proven — not before.",
    "reefer-start-panel": "Nothing is plugged in and started until the breaker is restored and the receptacle is dry and proven.",
  },

  steps: [
    {
      id: "identify-circuit", kind: "select", target: "panel-schedule",
      title: "Identify the circuit at the row panel",
      cue: "Match the arcing pedestal's position to its branch circuit on the row panel schedule before anything is opened.",
      why: "A reefer row panel feeds a dozen pedestals that look identical, and the breaker that is opened has to be the one that feeds the receptacle being worked on, not its neighbour: opening the wrong one leaves the fault live and drops a working reefer's cargo instead. NFPA 70E starts every job by establishing which circuit is which from the schedule and then verifying it at the equipment, because a label on a pedestal and a breaker in a panel have drifted apart on more rows than anyone admits.",
    },
    {
      id: "arc-ppe", kind: "sequence", anyOrder: true,
      targets: ["arc-face-shield", "rated-gloves"],
      itemNames: { "arc-face-shield": "arc-rated face shield and hood", "rated-gloves": "rated insulating gloves with leather protectors" },
      title: "Put on the arc-rated face shield and the rated gloves",
      cue: "Face shield and hood, rated gloves under their leather protectors — before a panel door or a plug is touched.",
      why: "The pedestal and the row panel are both live equipment until proven dead, and NFPA 70E sets the arc-rated PPE by the incident energy the row's transformer can deliver at the pedestal — which is more than a face can take at the distance a hand reaches. 29 CFR 1910.132 has it on before exposure, and the gloves are rated and tested rather than merely leather because the plug and the panel bus are the two things this job puts a hand near.",
    },
    {
      id: "shutdown-and-lock", kind: "sequence",
      targets: ["unit-controller-off", "pedestal-breaker", "breaker-lock"],
      itemNames: { "unit-controller-off": "reefer unit shut down at its controller", "pedestal-breaker": "branch breaker open", "breaker-lock": "your lock on the breaker" },
      title: "Shut the unit down, open the branch breaker, and lock it",
      cue: "Shut the reefer down at its own controller so the load is off, then open the pedestal's branch breaker, then lock it.",
      why: "The order takes the load off before the circuit is broken: a breaker opened under a running compressor's current is a breaker asked to interrupt the load, and a plug pulled under it is an arc in the hand, so the unit goes down at its controller first and the breaker opens onto nothing. The lock is yours and stays on until you take it off, because a reefer clerk restoring a row does not know a receptacle is open unless the lock tells them so.",
      outOfOrderNote: "Unit off at its controller first, then the breaker, then your lock — the breaker opens onto no load, and the plug never carries current when it moves.",
    },
    {
      id: "withdraw-plug", kind: "turn", target: "plug-collar",
      title: "Turn the plug's retaining collar and withdraw the plug",
      cue: "Turn the locking collar back through its half turn and draw the plug out of the receptacle, dead.",
      why: "The plug's collar is what holds it home against a chassis being bumped and a row being washed down, and it comes off with the circuit dead because the moment the plug starts to move is the moment an arc would start if it were live. Drawing it out dead and looking at its pins is also the first inspection of the job: burned pins on the plug say the arc has been on both sides of the connection, and the plug goes back to the shop with the receptacle.",
      turn: { turns: 0.5, label: "PLUG COLLAR", readout: (t) => (t < 0.2 ? "locked" : t < 0.45 ? "turning" : "free — withdraw") },
    },
    {
      id: "absence-of-voltage", kind: "hold", target: "voltage-tester", seconds: 5,
      title: "Test for absence of voltage on every contact",
      cue: "Prove the tester on a known live source, then hold it on each receptacle contact in turn — phase to phase, phase to ground — and prove the tester again.",
      why: "NFPA 70E's live-dead-live test is the only thing that turns an open breaker and a lock into a proven dead receptacle: the tester is proven working on a known live source, every contact is tested against every other and against ground, and the tester is proven again afterwards, because a tester with a dead battery reads zero on a live bus. The hold is the whole sequence, every contact — a receptacle proven dead on one phase is a receptacle with two unproven ones.",
      holdBreakNote: "Released before every contact was proven — a receptacle is dead on all of its contacts or it is not dead. Start the test again from the live proof.",
    },
    {
      id: "inspect-receptacle", kind: "find", noHint: true,
      targets: ["burned-contact"],
      itemNames: { "burned-contact": "burned and pitted contact inside the receptacle" },
      itemNotes: { "burned-contact": "The second phase contact is pitted black and its spring has lost its set — the arc has been striking there every time a plug landed on it half-seated. The insulation around it has melted back." },
      title: "Inspect the receptacle for the arc damage",
      cue: "With the receptacle proven dead, inspect each contact for pitting, melted insulation and a spring that has lost its grip.",
      why: "Arcing at a reefer receptacle is almost always one contact: a spring that has lost its set lets the plug's pin sit loose, the loose pin arcs under load, and the arc pits the contact so the next plug sits looser still. Finding which contact tells you whether the receptacle alone goes, or whether the pedestal wiring behind it has been cooked too — and it is done now, dead, because a pitted contact looks exactly like a clean one from behind a closed door.",
    },
    {
      id: "fit-receptacle", kind: "drag", target: "new-receptacle",
      title: "Fit the replacement receptacle to the pedestal",
      cue: "Carry the new receptacle from the chest and seat it in the pedestal's opening, gasket to the face.",
      why: "The receptacle seats against the pedestal face on its gasket, and the gasket is what keeps the next fog and the next wash-down out of the contacts; a receptacle fitted proud or cocked leaves a gap the water finds inside a week. It goes in dead, with the conductors dressed to reach its terminals without strain, because a conductor pulled tight to a terminal is a terminal that works loose as the pedestal heats and cools through a day of compressor load.",
      drag: { to: "pedestal-opening", radius: 0.5, missNote: "Not seated — the receptacle has to sit flat on its gasket in the opening before a conductor is landed." },
    },
    {
      id: "torque-terminals", kind: "gauge", target: "torque-driver",
      title: "Torque the receptacle terminals to the listed value",
      cue: "Land each conductor and torque its terminal to the value on the receptacle's label, committing inside the band.",
      why: "A receptacle's terminals carry a compressor's current for weeks at a time, and a terminal torqued by feel is the next arcing receptacle: too loose and it heats and works looser, too tight and the conductor strands are crushed and the same thing happens more slowly. The torque value is on the label because the manufacturer measured it, and the driver's click is the only evidence that the terminal is at that value rather than at whatever a wrist decided.",
      gauge: { label: "TERMINAL TORQUE", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${(t * 10).toFixed(1)} N·m`, missNote: "Outside the band — back the terminal off and come up to the labelled value again, slowly." },
    },
    {
      id: "ground-continuity", kind: "select", target: "ground-tester",
      title: "Prove the grounding conductor's continuity",
      cue: "Test from the receptacle's ground contact to the pedestal's ground bar and back to the panel — a low reading, not just a tone.",
      why: "The ground path is what carries a fault away from the plug and the person holding it, and it is the one conductor whose failure nobody notices until a fault: a reefer runs perfectly well with no ground until the day a phase touches the frame. Proving continuity with a low reading, rather than a continuity tone that says only that something is connected, is what tells you the path can actually carry a fault current and clear the breaker.",
    },
    {
      id: "restore-breaker", kind: "select", target: "restore-breaker",
      title: "Dry and check the receptacle, remove your lock and restore the breaker",
      cue: "Receptacle dry and clear, door closed, your lock off, the branch breaker closed — verify voltage at the receptacle before the plug goes near it.",
      why: "The lock comes off by the hand that put it on, after the receptacle is closed up and dry, and the breaker closes with the plug still out so the receptacle can be verified live at the right voltage on every phase before anything is connected to it. That verification is the mirror of the absence test earlier — the same tester, the same contacts — and it is what catches a receptacle wired with two phases swapped before a compressor tries to run backwards on it.",
    },
    {
      id: "start-and-watch-load", kind: "track", target: "reefer-start-panel", seconds: 6,
      title: "Plug in, start the unit and watch the load current settle",
      cue: "Land the plug, lock its collar, start the unit at its controller and hold the current in band as the compressor comes up — no surge held, no drop.",
      why: "The compressor's starting current is several times its running current, and how it settles is the first real test of the new receptacle and its terminals under load: a current that hunts or a phase that reads low is a terminal or a contact that is not carrying its share, and it shows here in the first minute rather than as an arc in a week. The row's clerk needs the unit back at temperature, but the unit goes back only once the current has settled where the plate says it should.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "LOAD CURRENT", readout: (v) => (v < 0.4 ? "low — a phase not carrying?" : v > 0.6 ? "surge held — hunting" : "settled at plate") },
      holdBreakNote: "The current broke out of band — a phase dropping or a surge that would not settle is the fault this watch exists to find. Hold it steady and watch it settle.",
    },
    {
      id: "reefer-log", kind: "select", target: "row-log-board",
      title: "Log the receptacle replacement and clear the row with the clerk",
      cue: "Record the pedestal, the contact that failed, the receptacle replaced, the torque and ground readings, and clear the unit back to the reefer clerk.",
      why: "The row log is what turns one arcing receptacle into information: the same pedestal failing twice is a wiring fault behind it, and the same contact failing across the row is a plug problem on the chassis fleet rather than a receptacle problem on the pedestals. The reefer clerk needs the unit's off-power time and the restart logged against the box, because the cargo's temperature record is what the shipper will ask for, and the electrician is the only person who knows when the plug was actually out.",
    },
    {
      id: "crew-checkin", kind: "select", target: "row-radio",
      title: "Check in with the reefer mechanics and the row crew",
      cue: "Call the reefer mechanic and the row lead: what failed, what was replaced, and how the crew is after a shift in the fog beside the lane.",
      why: "The reefer mechanics work the same row from the other side of the plug, and they deserve to know which contact failed rather than to learn it from the next unit that trips; telling them is what stops the same plug being landed half-seated on the next receptacle. The call is also the crew's own check-in — a shift in fog beside a hustler lane with a fault code going off two boxes over is a shift with a moment or two in it, and the ILWU practice is to say them out loud, and name the support that exists, before the next call.",
    },
  ],

  interrupts: [
    {
      id: "neighbour-fault-code",
      kind: "Fault code on the neighbouring reefer",
      after: "absence-of-voltage", delay: 2, seconds: 14,
      alert: "The reefer two pedestals down has thrown a high-pressure fault on its controller — its alarm lamp is flashing and the compressor has cut out.",
      cue: "Break off and read the fault at that unit's controller before it is silenced or restarted by anyone else.",
      target: "unit-b-controller",
      why: "A reefer that trips on high pressure with its neighbour's receptacle open is either a coincidence or a row with a supply problem — a phase gone soft across the row, a panel breaker heating — and the fault code is the only evidence of which it is, until somebody silences it. Reading it at the controller before it is reset is what keeps a row-wide fault from being handled as one unit's bad day, and the cargo in that box has a temperature clock running while the compressor is out.",
      missNote: "The fault code sat unread until a reefer clerk reset it to stop the alarm — the code was gone, the compressor restarted, and nobody knew whether it was one unit's pressure switch or the row's supply until the next box tripped.",
      wrongNote: "That unit's controller — the fault code is the only evidence of what tripped, and it is read at the controller before anyone resets it.",
    },
    {
      id: "hustler-reefer-lane",
      kind: "Hustler entering the reefer row lane",
      after: "start-and-watch-load", delay: 2, seconds: 12,
      alert: "A hustler has swung into the reefer row lane to pull a chassis three slots down, and the pedestal door and the tool chest are out in the lane.",
      cue: "Set the row lane flag to stop now — the driver is looking for his chassis, not for you.",
      target: "row-lane-flag",
      why: "The reefer lane is where hustlers pull and drop chassis all shift, and a driver hunting for a box number reads the lane flag and the cones, not the electrician kneeling at a pedestal in the fog. 29 CFR 1917 puts the traffic control on the terminal, and at a pedestal that control is the row lane flag, set the moment a vehicle turns in rather than once it is plainly not slowing.",
      missNote: "The hustler came down the lane past the open pedestal with nothing telling the driver to stop; the chassis behind it caught the tool chest and the load watch carried on as if the lane were empty.",
      wrongNote: "The row lane flag — the driver answers to the flag, and nothing else here is in his eyeline from the cab.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTR_ACCENT);

    // ------------------------------------------------------------- row deck
    const deck = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#20272e", base2: "#1a2026", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xb9c2ca },
    );
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.5, 1.7, 0.111, -2.4 + i * 1.1, 0xf2c14b, { rough: 0.7, cast: false });
    for (let i = 0; i < 2; i++) box(g, 0.5, 0.012, 0.08, -1.0 + i * 2.0, 0.111, -2.55, 0xe8eef2, { rough: 0.7, cast: false });

    // ------------------------------------------------ reefers on chassis (3)
    const units = [];
    const reeferAt = [[-2.1, "A"], [0.0, "B"], [2.1, "C"]];
    for (const [rx, tag] of reeferAt) {
      const r = group(g, rx, 0.1, -2.3);
      box(r, 1.9, 0.14, 1.0, 0, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
      for (const wx of [-0.7, 0.7]) cyl(r, 0.22, 0.22, 0.22, wx, 0.28, 0.35, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
      box(r, 1.9, 1.9, 1.0, 0, 1.52, 0, tag === "B" ? 0xdfe6ec : 0xd8dde2, { rough: 0.55, metal: 0.25 });
      for (let i = -2; i <= 2; i++) box(r, 0.05, 1.7, 0.02, i * 0.36, 1.52, 0.51, 0xb8c0c7, { rough: 0.6, cast: false });
      // The refrigeration unit face toward the learner, with its controller.
      box(r, 1.7, 1.2, 0.12, 0, 1.3, 0.56, 0x3a4148, { rough: 0.5, metal: 0.5 });
      for (let i = 0; i < 2; i++) box(r, 1.4, 0.03, 0.02, 0, 0.95 + i * 0.4, 0.63, 0x22262b, { rough: 0.6, cast: false });
      const ctrl = group(r, 0.5, 1.75, 0.63);
      box(ctrl, 0.34, 0.24, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
      const lamp = ball(ctrl, 0.025, 0.12, 0.08, 0.03, 0x59c97b, { rough: 0.4, emissive: 0x59c97b, ei: 1.4, seg: 8 });
      const screen = instrument(ctrl, -0.04, 0.02, 0.05, { idle: `${tag} · RUN · −18°`, color: 0x4fc3d6, w: 0.18, d: 0.08 });
      screen.rotation.x = Math.PI / 2;
      units.push({ r, ctrl, lamp, screen, tag });
      // The plug lead from the unit down to the pedestal.
      hose(r, [[-0.6, 0.85, 0.6], [-0.7, 0.55, 0.9], [-0.8, 0.45, 1.25]], 0.02, 0x1b1e23, { steps: 10, rough: 0.75 });
    }
    holoTag(units[0].r, "unit A — controller", 0.5, 2.05, 0.63, { css: "#4fc3d6", w: 0.4 });
    reg(hits, units[0].ctrl, "unit-controller-off");
    holoTag(units[1].r, "unit B — controller", 0.5, 2.05, 0.63, { css: "#4fc3d6", w: 0.4 });
    reg(hits, units[1].ctrl, "unit-b-controller");
    const startPanel = units[0].screen;
    reg(hits, startPanel, "reefer-start-panel");

    // ---------------------------------------------- pedestals (A is the fault)
    const peds = [];
    for (const [px, tag] of [[-2.9, "A"], [-0.8, "B"], [1.3, "C"]]) {
      const p = group(g, px, 0.1, -1.0);
      box(p, 0.44, 1.0, 0.36, 0, 0.5, 0, 0x2f6f4a, { rough: 0.55, metal: 0.35 });
      box(p, 0.4, 0.04, 0.32, 0, 1.02, 0, 0x22262b, { rough: 0.5 });
      // Receptacle on the face toward the learner.
      const rec = group(p, 0, 0.6, 0.19);
      const recBody = box(rec, 0.16, 0.16, 0.06, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
      const pins = [];
      for (const [dx, dy] of [[-0.04, 0.03], [0.04, 0.03], [0, -0.04], [0, 0.05]]) pins.push(cyl(rec, 0.008, 0.008, 0.03, dx, dy, 0.03, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }));
      for (const pin of pins) pin.rotation.x = Math.PI / 2;
      peds.push({ p, rec, recBody, pins, tag });
    }
    const pedA = peds[0];
    holoTag(pedA.p, "pedestal A", 0, 1.2, 0, { css: "#4fc3d6", w: 0.26 });
    // Plug seated in A, with its collar.
    const plug = group(pedA.p, 0, 0.6, 0.32);
    cyl(plug, 0.06, 0.06, 0.2, 0, 0, 0, 0x2b3138, { rough: 0.55, metal: 0.3, seg: 14 }).rotation.x = Math.PI / 2;
    const collar = torus(plug, 0.07, 0.015, 0, 0, -0.06, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8, seg2: 20 });
    hose(pedA.p, [[0, 0.6, 0.42], [0.1, 0.45, 0.8], [0.2, 0.45, 1.3]], 0.02, 0x1b1e23, { steps: 10, rough: 0.75 });
    holoTag(pedA.p, "plug collar — turn", 0, 0.32, 0.4, { css: "#4fc3d6", w: 0.36 });
    reg(hits, plug, "plug-collar");
    const livePull = box(pedA.p, 0.16, 0.16, 0.1, 0, 0.82, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pedA.p, "pull it running?", 0, 0.98, 0.4, { css: "#d2312b", w: 0.36 });
    reg(hits, livePull, "pull-plug-live");
    const burned = pedA.pins[1];
    burned.material = mat(0x1a1410, { rough: 0.9 });
    reg(hits, burned, "burned-contact");
    const opening = torus(pedA.rec, 0.1, 0.008, 0, 0, 0.04, PTR_ACCENT, { emissive: PTR_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    reg(hits, opening, "pedestal-opening");
    // Standing water at C's receptacle — the wet plug-in hazard.
    const puddle = box(peds[2].p, 0.14, 0.02, 0.05, 0, 0.5, 0.2, 0x3a5a70, { rough: 0.1, metal: 0.3, emissive: 0x1a2a38, ei: 0.3 });
    holoTag(peds[2].p, "plug into that?", 0, 1.2, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, puddle, "wet-receptacle-plugin");

    // ------------------------------------------------------------- row panel
    const panel = group(g, -2.6, 0.1, 1.4, 0.6);
    box(panel, 0.8, 1.5, 0.36, 0, 0.75, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    box(panel, 0.7, 0.05, 0.3, 0, 1.52, 0, 0xb8402f, { rough: 0.5 });
    const door = box(panel, 0.7, 1.2, 0.03, 0, 0.8, 0.19, 0xc8d0d6, { rough: 0.5, metal: 0.3 });
    holoTag(panel, "door — bare hands?", 0, 1.62, 0.2, { css: "#d2312b", w: 0.38 });
    reg(hits, door, "bare-hand-panel");
    const breakers = [];
    for (let i = 0; i < 6; i++) {
      const b = box(panel, 0.1, 0.14, 0.05, -0.25 + (i % 3) * 0.25, 1.05 - Math.floor(i / 3) * 0.3, 0.22, 0x2b2f34, { rough: 0.5, metal: 0.5 });
      breakers.push(b);
    }
    const brkHandle = box(panel, 0.03, 0.08, 0.03, -0.25, 1.05, 0.26, 0xd2312b, { rough: 0.5 });
    holoTag(panel, "branch — pedestal A", -0.25, 1.24, 0.24, { css: "#4fc3d6", w: 0.36 });
    reg(hits, breakers[0], "pedestal-breaker");
    const lockHasp = group(panel, -0.25, 0.9, 0.24);
    box(lockHasp, 0.08, 0.03, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    const lock = lockTag(lockHasp, 0, -0.05, 0.02, { lines: ["M&R — DO", "NOT CLOSE"] });
    lock.visible = false;
    reg(hits, lockHasp, "breaker-lock");
    // Another electrician's lock on breaker 2, and the bolt cutters beside it.
    const otherLock = lockTag(panel, 0.0, 0.6, 0.26, { color: 0x2e8fd6, lines: ["J. — ROW", "PANEL 2"] });
    void otherLock;
    const cutters = group(panel, 0.3, 0.45, 0.3);
    box(cutters, 0.03, 0.3, 0.03, -0.03, 0, 0, 0xd2312b, { rough: 0.6 });
    box(cutters, 0.03, 0.3, 0.03, 0.03, 0, 0, 0xd2312b, { rough: 0.6 });
    holoTag(panel, "cut their lock?", 0.15, 0.3, 0.3, { css: "#d2312b", w: 0.34 });
    reg(hits, cutters, "remove-others-lock");
    const restore = cyl(panel, 0.03, 0.03, 0.02, 0.3, 1.2, 0.21, 0x59c97b, { rough: 0.4, seg: 12 });
    restore.rotation.x = Math.PI / 2;
    holoTag(panel, "restore", 0.3, 1.36, 0.22, { css: "#4fc3d6", w: 0.2 });
    reg(hits, restore, "restore-breaker");
    const schedule = holoPanel(g, 0.6, 0.42, -1.5, 1.3, 1.9, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#4fc3d6"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d6f4fa"; cx.fillText("ROW 7 — PANEL SCHEDULE", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Ckt 1: pedestal A — reported arcing", "Ckt 2: pedestal B — J.'s lock, open", "Ckt 3: pedestal C — in service"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 2.4, accent: PTR_ACCENT });
    reg(hits, schedule, "panel-schedule");

    // ------------------------------------------------------- chest and tools
    const chest = toolChest(g, 0.9, 1.6, { ry: -0.4, color: 0x2f4f6f });
    const tester = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "-- V", color: 0x4fc3d6, w: 0.1, d: 0.16 });
    holoTag(tester, "voltage tester — hold", 0, 0.15, 0, { css: "#4fc3d6", w: 0.42 });
    reg(hits, tester, "voltage-tester");
    const torque = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.1, idle: "-- N·m", color: 0x4fc3d6, w: 0.1, d: 0.16 });
    holoTag(torque, "torque driver", 0, 0.15, 0, { css: "#4fc3d6", w: 0.3 });
    reg(hits, torque, "torque-driver");
    const groundT = instrument(chest, 0.02, 0.79, -0.12, { ry: 0.0, idle: "-- Ω", color: 0x4fc3d6, w: 0.1, d: 0.12 });
    holoTag(groundT, "ground tester", 0, 0.15, 0, { css: "#4fc3d6", w: 0.3 });
    reg(hits, groundT, "ground-tester");
    const radio = instrument(chest, -0.2, 0.79, -0.14, { ry: 0.3, idle: "CH 7 · ROW", color: 0x4fc3d6, w: 0.08, d: 0.12 });
    holoTag(radio, "row radio", 0, 0.15, 0, { css: "#4fc3d6", w: 0.24 });
    reg(hits, radio, "row-radio");
    const newRec = group(g, 1.4, 0.1, 0.9);
    box(newRec, 0.3, 0.04, 0.3, 0, 0.02, 0, 0x2b3138, { rough: 0.6 });
    box(newRec, 0.16, 0.16, 0.08, 0, 0.12, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    torus(newRec, 0.1, 0.01, 0, 0.12, 0.05, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6, seg2: 20 });
    holoTag(newRec, "new receptacle", 0, 0.36, 0, { css: "#4fc3d6", w: 0.32 });
    reg(hits, newRec, "new-receptacle");
    const shield = group(g, 0.2, 0.1, 1.9);
    box(shield, 0.26, 0.04, 0.2, 0, 0.02, 0, 0x2b2f34, { rough: 0.7 });
    box(shield, 0.22, 0.14, 0.02, 0, 0.11, 0, 0x6a8a3a, { rough: 0.3, metal: 0.1, opacity: 0.7, transparent: true });
    holoTag(shield, "arc face shield", 0, 0.34, 0, { css: "#4fc3d6", w: 0.32 });
    reg(hits, shield, "arc-face-shield");
    const gloves = group(g, -0.4, 0.1, 1.9);
    box(gloves, 0.18, 0.05, 0.12, 0, 0.025, 0, 0xe07a3f, { rough: 0.8 });
    box(gloves, 0.18, 0.03, 0.12, 0, 0.065, 0, 0x8a6a3a, { rough: 0.9 });
    holoTag(gloves, "rated gloves", 0, 0.3, 0, { css: "#4fc3d6", w: 0.28 });
    reg(hits, gloves, "rated-gloves");

    // ------------------------------------------------ lane flag and hustler
    const flagPost = group(g, 1.9, 0.1, 2.3);
    cyl(flagPost, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flag = box(flagPost, 0.3, 0.2, 0.02, 0.17, 1.3, 0, 0x59c97b, { rough: 0.7 });
    holoTag(flagPost, "row lane flag", 0, 1.62, 0, { css: "#4fc3d6", w: 0.3 });
    reg(hits, flagPost, "row-lane-flag");
    const hustler = group(g, 2.3, 0.1, 4.8);
    box(hustler, 0.9, 0.5, 1.4, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hustler, 0.86, 0.6, 0.7, 0, 1.0, -0.3, 0xd2312b, { rough: 0.5, metal: 0.3 });
    box(hustler, 0.7, 0.3, 0.02, 0, 1.1, -0.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.45], [0.45, 0.45]]) cyl(hustler, 0.22, 0.22, 0.2, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    hustler.visible = false;
    const hustlerHome = hustler.position.clone();

    // ------------------------------------------------------------ paperwork
    const logBoard = holoPanel(g, 0.6, 0.42, 2.6, 1.25, 0.2, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#4fc3d6"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d6f4fa"; cx.fillText("ROW LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Pedestal A: OFF POWER", "Contact: —", "Restart: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -1.2, accent: PTR_ACCENT });
    reg(hits, logBoard, "row-log-board");

    // ---------------------------------------------------------------- crew
    const electrician = standingFigure(g, -1.7, 0.4, { ry: 1.0, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e, gloves: true });
    holoTag(electrician, "M&R electrician", 0, 1.9, 0, { css: "#4fc3d6", w: 0.34 });
    const reeferMech = standingFigure(g, 2.6, -0.95, { ry: -2.4, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(reeferMech, "reefer mechanic", 0, 1.9, 0, { css: "#4fc3d6", w: 0.34 });
    cone(g, 0.9, 2.5); cone(g, 2.6, 1.6);
    barrierPanel(g, -1.2, 2.5, { color: 0xf2c14b, ry: 0 });

    const okMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
    const alarmMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
    const offMat = mat(0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6 });
    const flagStop = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.7 });
    let unitBFault = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.2, 0.9, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "shutdown-and-lock") { units[0].lamp.material = offMat; repaint(units[0].screen.userData.screen, signFace("A · OFF", { bg: "#0d1c24", accent: "#f2ae14", fg: "#ffe9b0", scale: 0.6 })); brkHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "withdraw-plug") plug.position.z = 0.62;
        if (step.id === "absence-of-voltage") repaint(tester.userData.screen, signFace("0 V · DEAD", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "inspect-receptacle") burned.visible = false;
        if (step.id === "fit-receptacle") { newRec.visible = false; pedA.recBody.material = mat(0x2f3a44, { rough: 0.5, metal: 0.5 }); burned.visible = true; burned.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.9 }); }
        if (step.id === "ground-continuity") repaint(groundT.userData.screen, signFace("0.2 Ω", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "restore-breaker") { brkHandle.rotation.z = 0; lock.visible = false; repaint(tester.userData.screen, signFace("LIVE · OK", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.5 })); }
        if (step.id === "start-and-watch-load") { plug.position.z = 0.32; units[0].lamp.material = okMat; repaint(units[0].screen.userData.screen, signFace("A · RUN · −18°", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 })); }
        if (step.id === "reefer-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d6f4fa"; cx.fillText("ROW LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Pedestal A: BACK ON POWER", "Contact: phase 2 pitted — receptacle replaced", "Restart: logged with the clerk"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ROW CLEARED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "neighbour-fault-code") { unitBFault = true; units[1].lamp.material = alarmMat; repaint(units[1].screen.userData.screen, signFace("B · HP FAULT", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd0c8", scale: 0.5 })); }
        if (it.id === "hustler-reefer-lane") { hustler.visible = true; hustler.position.set(1.7, 0.1, 1.2); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "neighbour-fault-code") { unitBFault = false; units[1].lamp.material = mat(0xe8b02e, { emissive: 0xe8b02e, ei: 1.4, rough: 0.4 }); repaint(units[1].screen.userData.screen, signFace("B · CODE READ", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.5 })); }
        if (it.id === "hustler-reefer-lane") { hustler.position.copy(hustlerHome); hustler.visible = false; flag.material = flagStop; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "withdraw-plug") collar.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "torque-terminals") repaint(torque.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} N·m`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "absence-of-voltage" && session.holding) {
          const frac = Math.min(1, session.holdFor / (step.seconds ?? 5));
          repaint(tester.userData.screen, signFace(frac < 0.2 ? "LIVE PROOF" : frac < 0.8 ? `L${1 + Math.floor((frac - 0.2) * 5)} · 0 V` : "RE-PROVE", { bg: "#0d1c24", accent: "#f2ae14", fg: "#ffe9b0", scale: 0.5 }));
        }
        if (step?.id === "start-and-watch-load" && session.holding) {
          const v = session.track.v;
          repaint(units[0].screen.userData.screen, signFace(`${Math.round(v * 40)} A`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (unitBFault) units[1].lamp.visible = Math.sin(t * 8) > 0;
        else units[1].lamp.visible = true;
        void dt; void CITY;
      },
    };
  },
};
