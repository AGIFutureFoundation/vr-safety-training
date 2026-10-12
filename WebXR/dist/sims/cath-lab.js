import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cath Lab VR — Building Systems & Facilities, station seventy-two.
// A hospital facilities crew taking a planned outage on the branch panel that
// feeds a cardiac catheterisation laboratory.
//
// Everything else in this catalogue that opens a breaker treats the outage as
// the easy part and the proving as the hard part. Here it is the other way
// round. A patient care space does not have "the power"; it has an essential
// electrical system divided into life safety, critical and equipment branches
// that are wired separately, fed separately and — this is the part that gets
// people into trouble — sit in the same cupboard as each other with three
// nearly identical panelboards on the wall. Only one of them is yours.
//
// And you cannot simply take it out of service. The room belongs to the
// clinical team until they say otherwise: the isolation is agreed in writing,
// timed to a window with nobody on the table and no case to follow, and given
// back the same way. In between, the room's isolated power system and its line
// isolation monitor mean that the usual reflexes — silence the buzzer, assume
// the green wire is a ground because it is green — are the two things most
// likely to end the shift badly.

const CTH_ACCENT = 0x2dd4bf;

export const SIM_CATH_LAB = {
  id: "cath-lab",
  index: "72",
  domain: "Facilities",
  trade: "Hospital facilities electrician / health care building engineer",
  category: "Building Systems & Facilities",
  weather: "clear",
  certification: "IBEW and IUOE hospital locals — health care facility maintenance; NFPA 99 health care facilities code for patient care space categories and the essential electrical system; NFPA 70 Article 517 for health care facility wiring, isolated power systems and the reference grounding point; NFPA 70E for the risk assessment at the panel; OSHA 29 CFR 1910.147 control of hazardous energy; the hospital's own interim life safety measures and its written clinical authorisation to take the room down",
  name: "Cath Lab",
  title: simTitle("Cath Lab"),
  tagline: "Planned outage on a cath lab branch panel: clinical authorisation and a window with nobody on the table, the life-safety branch left alone, isolated power read rather than silenced, grounding tested rather than assumed, room confirmed by the clinical team before hand-back",
  accent: CTH_ACCENT,
  accentCss: "#2dd4bf",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "room-returned", name: "Room Returned", note: "A patient care space taken down inside an agreed window and handed back by the people who own it" },

  game: system({
    name: "Health Care Facility Authority",
    currency: "mA",
    ranks: ["Building Mechanic", "Hospital Electrician", "Lead Electrician", "Facilities Engineer", "Health Care Facility Authority Certified"],
    badges: [
      { id: "window-kept", name: "Window Kept", note: "Nothing started until the room was released in writing by the people using it", test: AWARD.stepClean("authorisation") },
      { id: "branch-discipline", name: "Branch Discipline", note: "Only the branch on the permit was touched, and the monitor was never silenced", test: AWARD.safe },
      { id: "grounding-proven", name: "Grounding Proven", note: "The equipment grounding and the reference point measured rather than assumed", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-outage", name: "Clean Outage", note: "Whole outage run with no corrections", test: AWARD.clean },
      { id: "held-the-test", name: "Held The Test", note: "Every timed test carried to its full count first time", test: AWARD.unbroken },
      { id: "back-early", name: "Back Early", note: "Room handed back inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "life-safety-breaker": "You opened a breaker in the life safety branch. It is in the same cupboard, on the same wall, in a panelboard that looks like the one you were sent to, and it feeds none of your work: it feeds the egress lighting, the exit signs, the fire alarm and the things that have to keep working precisely on the day everything else does not. The essential electrical system is divided into separate branches so that a fault or an outage on one of them cannot take the other two with it — and an electrician who opens the wrong one by hand has done in a second exactly what all that separation exists to prevent.",
    "no-clinical-ok": "You started on the strength of the schedule. A planned date in a maintenance system is a request, not a release: the only thing that can hand you a procedure room is the clinical team who are using it, on the day, when they have looked at the board and confirmed there is nobody on the table and no case queued behind. Rooms run late, cases get added, and a patient arrives in the one you have just locked out. The paperwork exists so that this is somebody's explicit decision rather than an assumption made by whoever turned up first.",
    "silence-lim": "You silenced the line isolation monitor. That alarm does not mean the isolated power system has failed and it does not mean the room has to stop — that is the whole design intent, and it is why silencing it feels harmless. What it means is that the total hazard current has climbed to where a first fault to ground is no longer the harmless event the system exists to make it, and the next fault will be a live path through whatever is between it and earth. The alarm is information about a condition you are supposed to go and find, and a silenced monitor is a room that has quietly stopped being an isolated power system.",
    "assume-ground": "You signed the grounding off the panel schedule. A schedule is a record of what somebody intended when the room was built and of every change they remembered to write down since. It is not a measurement. Equipment grounding conductors get lifted for a repair and left off, reference grounding point terminations get loosened by vibration, and a green wire landed on a screw that is no longer tight is indistinguishable from a good one until it is tested. In a room where the patient is connected to mains-powered equipment through catheters, the grounding is the protection, and protection is measured.",
  },

  lateNotes: {
    "branch-breaker": "The breaker comes open after the room has been released and the interim measures are in place. Opening it first means the clinical team find out the room is down by watching the lights change.",
    "hosp-receptacle": "The receptacle goes in after the circuit has been proved dead and the grounding has been measured — not while the panel is still an unknown.",
    "clinical-signoff": "The signature is the last thing that happens, after everything it is signing for has been put back and proved.",
  },

  steps: [
    {
      id: "authorisation", kind: "select", target: "clinical-auth",
      title: "Take the written clinical authorisation",
      cue: "Read what has been released, by whom, for how long, and what has to be back first.",
      why: "This is the document that turns a work order into permission. It names the room, the branch, the agreed start and the agreed return, and it carries the signature of somebody clinical who is accountable for there being nobody on the table when it starts. Without it you have a maintenance system telling you a date, which is a plan, and plans in a procedure suite lose to whatever came through the door at four in the morning.",
    },
    {
      id: "branches", kind: "find", noHint: true,
      targets: ["life-safety-panel", "critical-panel", "equipment-panel"],
      itemNames: { "life-safety-panel": "life safety branch", "critical-panel": "critical branch", "equipment-panel": "equipment branch" },
      itemNotes: {
        "life-safety-panel": "Egress lighting, exit signs, alarm and communications. It is deliberately the smallest and most jealously guarded of the three, and nothing on this work order is behind it.",
        "critical-panel": "Patient care receptacles and the fixed equipment the clinical team need to keep somebody alive in this room. It stays up while you work, which is exactly why the two panels have to be told apart before a hand goes near either.",
        "equipment-panel": "The branch on the permit. Motors, imaging support and the isolated power panel that feeds the room's outlets — the one you are here to take down.",
      },
      title: "Find the three branches and the one that is yours",
      cue: "Identify which panelboard is which before anything is touched.",
      why: "An essential electrical system is not one supply with a label on it. Life safety, critical and equipment are wired, fed and transferred separately so that losing one cannot take the others, and in a plant room they sit side by side in near-identical enclosures with the schedules behind the doors. Reading all three and saying out loud which one is on the permit is the last cheap moment in this job; everything after it costs a room.",
    },
    {
      id: "release", kind: "select", target: "charge-nurse",
      title: "Get the room released at the board",
      cue: "Ask the charge nurse: table empty, no case to follow, room theirs to give.",
      why: "The authorisation says the room can be released; only the person running the list can say it is released now. The question is answered off the day's board and out loud: nobody on the table, nothing queued into this room, and the on-call room identified in case a case arrives while you are inside the panel. It is also how the clinical team learn who you are and where you will be, which is what makes the next hour's interruptions land on the right person.",
    },
    {
      id: "ilsm", kind: "sequence",
      targets: ["impairment-notice", "alarm-desk-call", "door-sign"],
      itemNames: { "impairment-notice": "impairment logged", "alarm-desk-call": "alarm desk and clinical engineering told", "door-sign": "room signed out of service" },
      title: "Put the interim life safety measures in",
      cue: "Log the impairment, tell the desk, and sign the door before the room goes down.",
      why: "Taking part of a hospital's systems out of service starts a clock that somebody else is responsible for, so it is logged rather than mentioned. The alarm desk needs to know which devices in this room will be silent and for how long, clinical engineering needs to know their equipment is about to lose its supply rather than fail, and the sign on the door is what stops the room being used by a team who had no way of knowing. All three before the breaker, because after it they are explanations rather than measures.",
      outOfOrderNote: "Wrong order — log the impairment, then tell the desk, then sign the door. A door signed out of service before anyone has been told is a room that has simply gone missing from the suite.",
    },
    {
      id: "lim-read", kind: "gauge", target: "lim-panel",
      title: "Read the line isolation monitor before you start",
      cue: "Take the monitor's standing indication and commit on what the room reads today.",
      why: "The monitor is continuously measuring how much current would flow if a first fault to ground appeared anywhere on this isolated system, and that figure rises quietly as every long cord, every damp connection and every extra piece of equipment in the room adds its own leakage. Reading it now gives you the baseline you will compare against afterwards. Skip it and any alarm later in the shift is unattributable — you will not be able to say whether your work caused it or found it.",
      gauge: {
        label: "LIM · HAZARD CURRENT", speed: 0.7, green: [0.08, 0.32],
        readout: (t) => (t < 0.32 ? "below the monitor's alarm point" : t < 0.6 ? "climbing toward the alarm point" : "at the alarm point — monitor in alarm"),
        missNote: "That is not a baseline, it is a finding. A system already sitting at its monitor's alarm point has something on it that wants investigating before anybody adds a receptacle to it.",
      },
    },
    {
      id: "breaker", kind: "turn", target: "branch-breaker",
      title: "Open the equipment branch breaker",
      cue: "The breaker named on the permit, and only that one, fully to off.",
      why: "The one on the permit, in the panelboard you identified, verified against the schedule on the door and against the circuit you are about to work — three separate confirmations for one handle, because the two panelboards either side of it feed things that must not go off. Taken fully to off rather than tripped part way, so there is no argument later about whether the mechanism actually opened or merely moved.",
      turn: { turns: 0.25, axis: "z", label: "EQUIPMENT BRANCH — ROOM 4" },
    },
    {
      id: "lock", kind: "select", target: "lock-hasp",
      title: "Lock and tag it in your own name",
      cue: "Your padlock, your tag, your name on the hasp.",
      why: "A hospital's electrical distribution is watched by a building management system, switched by automatic transfer and attended by people whose entire job is to put supplies back on when they notice one missing. None of them know your hands are inside an outlet box. Your own lock with your own name on it is the only device in the building that outranks the instinct to restore a supply, and the name matters because it tells the person who finds it who to phone instead of cutting it off.",
    },
    {
      id: "prove-dead", kind: "gauge", target: "test-meter",
      title: "Prove the circuit dead — and prove the meter",
      cue: "Prove the tester on a known source, test the circuit, prove the tester again, then commit.",
      why: "The test is only worth what the instrument is worth, and the way an instrument fails is by reading zero on everything. Proving unit, then circuit, then proving unit again catches the meter that died between the first reading and the second, which is the one failure mode that turns a careful electrician into a casualty. Every conductor, every combination, including the ones the schedule says are not there — an isolated system has no grounded conductor to reason from.",
      gauge: {
        label: "PROVE · CIRCUIT", speed: 0.72, green: [0.04, 0.22],
        readout: (t) => (t < 0.22 ? "dead — nothing on any leg" : t < 0.55 ? "a few volts — induced, or something shared" : "live"),
        missNote: "Something is still there. A few volts on a supposedly dead isolated circuit is a shared raceway, a capacitively coupled run or the wrong breaker — and each of those is a reason to go back to the panel, not a reason to carry on.",
      },
    },
    {
      id: "bond-hold", kind: "hold", target: "ground-tester", seconds: 5,
      title: "Hold the bond test on the reference grounding point",
      cue: "Clamp on and hold the full count while the test current settles.",
      why: "The reference grounding point is where every equipment grounding conductor in this patient care space is brought together, and the test asks whether the receptacle in your hand is genuinely connected to it. Held for the full count because the reading walks while the test current is establishing itself through whatever oxide and paint is in the path — and a short test reads whatever it happened to be doing while it was still deciding.",
      holdBreakNote: "Released before the test settled. A bond test cut short reads the transient, not the path — clamp on and hold it through.",
    },
    {
      id: "bond-read", kind: "gauge", target: "ground-meter",
      title: "Read the equipment grounding path",
      cue: "Commit on the settled continuity against the figure on the room's own test record.",
      why: "The number means nothing on its own; it means something against the last one recorded for this room. A path that has drifted since the previous test has a termination going loose somewhere between the outlet box and the reference point, and finding it now — with the branch already locked out — costs an hour. Finding it later means opening the room again. Measure it, write it beside the previous figure, and let the two numbers argue.",
      gauge: {
        label: "BOND · CONTINUITY", speed: 0.7, green: [0.34, 0.58],
        readout: (t) => (t < 0.34 ? "open — no path to the reference point" : t > 0.58 ? "high and drifting — a loose termination" : "continuous and steady against the record"),
        missNote: "That is not a path you would put a patient behind. An open or a drifting reading is a termination to go and find, and it is found before the receptacle goes back in rather than after.",
      },
    },
    {
      id: "receptacle", kind: "drag", target: "hosp-receptacle",
      title: "Fit the hospital-grade receptacle",
      cue: "Carry the replacement to the boom outlet box and seat it home.",
      why: "The green dot on the face is not decoration: a hospital-grade receptacle is built and tested for retention and for the integrity of its grounding contact, because in this room the thing plugged into it is attached to a patient and the cord gets dragged by a moving boom all day. A general-purpose device fitted here looks identical from a metre away, passes every functional test, and quietly removes the one property it was chosen for.",
      drag: { to: "recept-socket", radius: 0.5, missNote: "Not seated in the box. A device hanging on its conductors has no retention at all, which is the property this one was specified for in the first place." },
    },
    {
      id: "lim-test", kind: "track", target: "lim-test-switch", seconds: 6,
      title: "Prove the monitor by its own test function",
      cue: "Hold the test and keep it steady at the test point while the alarm is proved.",
      why: "A line isolation monitor that no longer alarms is worse than none at all, because the room is being told it is protected by something that has stopped watching. Its own test function simulates the fault condition, and holding it steady is what lets you confirm that both the local indication and the remote annunciation actually operate — the lamp in this room and the point at the desk are two separate things, and only one of them is in front of you.",
      track: {
        start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.5, drift: 0.12, label: "TEST CURRENT",
        readout: (v) => (v < 0.36 ? "below the point that proves anything" : v > 0.58 ? "past the test point — back it off" : "holding at the test point"),
      },
      holdBreakNote: "Test current out of band — below it the monitor never sees a fault to respond to, above it you are exercising the system rather than testing it. Bring it back and hold.",
    },
    {
      id: "restore", kind: "sequence",
      targets: ["lock-hasp", "branch-breaker", "lim-panel"],
      itemNames: { "lock-hasp": "your lock off the hasp", "branch-breaker": "equipment branch breaker closed", "lim-panel": "monitor back to its normal indication" },
      title: "Put it back in order",
      cue: "Lock off, breaker closed, then watch the monitor come back to normal.",
      why: "Your own lock comes off first, by you, because a lock removed by anybody else is the beginning of an investigation. The breaker closes next, and then the monitor is watched rather than glanced at: an isolated power system that has had work done on it will show you in the first few seconds whether what you did added leakage, and that indication is the only feedback the room gives you on your own work.",
      outOfOrderNote: "Wrong order — your lock off, then the breaker, then read the monitor. Closing a breaker with a lock still on the hasp is the sentence nobody wants to read out afterwards.",
    },
    {
      id: "handback", kind: "find",
      targets: ["lim-lamp", "boom-receptacle", "clinical-signoff"],
      itemNames: { "lim-lamp": "monitor green, local and remote", "boom-receptacle": "the boom outlet proved under load", "clinical-signoff": "the clinical team's signature" },
      itemNotes: {
        "lim-lamp": "Green here and green at the desk. Two indications, because a local lamp that works and a remote point that does not is a room nobody outside it can see the state of.",
        "boom-receptacle": "Proved with something actually drawing current, on the boom, with the boom moved through its travel. A receptacle that tests good stationary and drops out at full extension is a fault that will be found mid-case.",
        "clinical-signoff": "The room goes back to the people who released it, and they say so. Until that signature exists the room is still yours, whatever the lights are doing.",
      },
      title: "Hand the room back with the clinical team",
      cue: "Walk the three things they need to see before they take it back.",
      why: "A hand-back is not an announcement, it is a demonstration. The monitor is shown green locally and at the desk, the receptacle is shown working under real load through the boom's full travel, and only then does somebody clinical sign for the room. Done this way the first case of the day is not the test, which is the whole difference between a maintenance department a suite trusts and one it schedules around.",
    },
  ],

  interrupts: [
    {
      id: "add-on-case",
      kind: "Case booked into your room",
      after: "lock", delay: 3, seconds: 12,
      alert: "The control room is calling through the glass: an add-on case has just been booked into this room and the team is asking how long you need.",
      cue: "Somebody is putting a patient into a room you have locked out.",
      target: "control-window",
      why: "The window you agreed is the only thing protecting a half-dismantled patient care space from a case being wheeled into it, and it is protecting nothing if the people booking rooms do not know it still applies. Answering at the glass now — while the panel is locked and before anything is open — is what gets the case sent to the room that is actually available.",
      missNote: "The booking stood. The team prepped a room whose equipment branch was locked out with your name on it, found out when the boom would not power up, and moved the patient in the corridor — which is the part that gets written down. An agreed window that nobody defends when it is challenged was never an agreement, it was a diary entry.",
      wrongNote: "That is not what is happening. There is a face at the control room glass waiting for an answer about a patient.",
    },
    {
      id: "monitor-alarm",
      kind: "Isolated power alarm",
      after: "receptacle", delay: 3, seconds: 12,
      alert: "The line isolation monitor has gone into alarm — the red lamp is lit and the buzzer is sounding while your hands are still in the outlet box.",
      cue: "The room is telling you its isolated supply is no longer isolated the way it was.",
      target: "lim-panel",
      why: "A monitor in alarm is a measurement, not a malfunction, and the first thing it deserves is to be read. What it is saying is that the total hazard current on this isolated system has climbed to where a first fault would stop being harmless — and since the only thing that has changed on that system in the last two minutes is your work, reading the monitor is also the fastest way to find out what you just did.",
      missNote: "The alarm ran unattended until somebody clinical silenced it to get on with their day. The condition it was reporting is still there and now has nobody's name against it, which means the next person to find it will be finding it as a second fault rather than as a first — and the whole point of an isolated power system is that there is supposed to be time between those two.",
      wrongNote: "Not that. The monitor is in alarm and it is telling you something about the circuit you have your hands in — read it before you touch anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, CTH_ACCENT);

    // -------------------------------------------------------- the room shell
    // A procedure room built as a three-sided set: back wall and two returns,
    // open toward +z so the walk in from the gate looks into the room rather
    // than at the back of a wall. The floor is a raised vinyl pad with a
    // coved skirting, which is what tells the eye this is a room at all.
    const FLOOR = 0.07;
    box(g, 6.0, FLOOR, 5.0, 0, FLOOR / 2, -0.4, 0xd7dfdd, { rough: 0.35, finish: "painted", tile: [4, 3] });
    box(g, 6.0, 0.02, 5.0, 0, FLOOR + 0.012, -0.4, 0xc3d0cd, { rough: 0.22, cast: false });
    const back = group(g, 0, FLOOR, -2.85);
    box(back, 6.0, 2.95, 0.16, 0, 1.48, 0, 0xe4e9e6, { rough: 0.5, finish: "painted", tile: [6, 3] });
    box(back, 6.0, 0.1, 0.24, 0, 0.05, 0.02, 0xa9b6b3, { rough: 0.4, finish: "painted", tile: [6, 1] });
    box(back, 6.0, 0.14, 0.3, 0, 2.98, 0.04, 0xcfd8d5, { rough: 0.5, finish: "painted", tile: [6, 1] });
    for (const sx of [-1, 1]) {
      const wall = group(g, sx * 2.92, FLOOR, -1.2);
      box(wall, 0.16, 2.95, 3.2, 0, 1.48, 0, 0xe4e9e6, { rough: 0.5, finish: "painted", tile: [3, 3] });
      box(wall, 0.24, 0.1, 3.2, 0.02, 0.05, 0, 0xa9b6b3, { rough: 0.4, finish: "painted", tile: [3, 1] });
    }
    // Ceiling grid over the work, hung on four drops — the thing that makes a
    // set read as a room from outside it.
    const ceil = group(g, 0, 2.95, -0.9);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(ceil, 0.03, 0.03, 0.4, sx * 2.5, 0.2, sz * 1.5, 0x9aa4a2, { rough: 0.5, metal: 0.5, seg: 8 });
    }
    for (let i = -2; i <= 2; i++) box(ceil, 5.4, 0.04, 0.05, 0, 0, i * 0.75, 0xb6c0be, { rough: 0.6, metal: 0.3, cast: false });
    for (const sx of [-1, 1]) box(ceil, 0.05, 0.04, 3.2, sx * 2.5, 0, 0, 0xb6c0be, { rough: 0.6, metal: 0.3, cast: false });
    // Own materials on the fittings, because the life-safety hazard dims them
    // and mat() hands out a shared cached material to everything else too.
    const ceilLamps = [];
    for (const [lx, lz] of [[-1.4, -0.7], [1.4, -0.7], [0, 0.6]]) {
      const lamp = box(ceil, 1.0, 0.05, 0.5, lx, -0.03, lz, 0xf4fbf9, { emissive: 0xdff4f0, ei: 0.7, rough: 0.4, cast: false });
      lamp.material = lamp.material.clone();
      lamp.material.userData.ownMaterial = true;
      ceilLamps.push(lamp);
    }
    const egress = [];
    for (const ex of [-2.2, 2.2]) {
      const sign = decal(back, 0.34, 0.14, ex, 2.5, 0.1,
        signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.6 }), { px: 256, glow: true, ei: 1.2 });
      egress.push(sign);
    }

    // ------------------------------------------------ the table and the C-arm
    const table = group(g, -0.55, FLOOR, -0.9, 0.12);
    cyl(table, 0.36, 0.42, 0.1, 0, 0.05, 0, 0x707c7a, { rough: 0.5, metal: 0.5, seg: 20 });
    box(table, 0.5, 0.7, 0.6, 0, 0.42, -0.1, 0x8c9896, { rough: 0.45, metal: 0.4 });
    box(table, 0.46, 0.09, 2.1, 0, 0.86, 0.15, 0x2b3a44, { rough: 0.5, finish: "rubber" });
    box(table, 0.42, 0.06, 2.0, 0, 0.93, 0.15, 0x3d5f6e, { rough: 0.7, finish: "rubber" });
    holoTag(table, "Procedure table — empty", 0, 1.4, 0.7, { css: "#2dd4bf", w: 0.5 });
    const carm = group(g, -0.55, FLOOR, -1.85, 0.12);
    cyl(carm, 0.3, 0.34, 0.12, 0, 0.06, 0, 0x6e7a78, { rough: 0.5, metal: 0.5, seg: 18 });
    box(carm, 0.5, 1.5, 0.5, 0, 0.82, 0, 0xd9e2e0, { rough: 0.4, metal: 0.3, finish: "painted" });
    for (let i = 0; i < 9; i++) {
      const a = -1.05 + i * 0.26;
      box(carm, 0.22, 0.2, 0.12, Math.sin(a) * 0.82, 1.5 + Math.cos(a) * 0.82, 0.42, 0xe8eeec,
        { rough: 0.4, metal: 0.25, finish: "painted" }).rotation.z = -a;
    }
    box(carm, 0.34, 0.3, 0.3, 0.0, 0.72, 0.9, 0x39474a, { rough: 0.5, metal: 0.4 });
    holoTag(carm, "Imaging gantry", 0, 2.6, 0.2, { css: "#8fa9c4", w: 0.34 });

    // Ceiling boom with the monitors and the outlet box on it.
    const boom = group(g, 1.05, 0, -1.3);
    cyl(boom, 0.05, 0.05, 0.5, 0, 2.72, 0, 0x9aa4a2, { rough: 0.5, metal: 0.5, seg: 12 });
    box(boom, 1.5, 0.09, 0.14, -0.6, 2.44, 0, 0xc6d0ce, { rough: 0.45, metal: 0.4 });
    cyl(boom, 0.055, 0.055, 0.6, -1.3, 2.15, 0, 0xc6d0ce, { rough: 0.45, metal: 0.4, seg: 12 });
    const monitors = [];
    for (let i = 0; i < 3; i++) {
      box(boom, 0.4, 0.28, 0.03, -1.6 + i * 0.42, 1.78, 0, 0x14181c, { rough: 0.25, metal: 0.2 });
      monitors.push(decal(boom, 0.36, 0.24, -1.6 + i * 0.42, 1.78, 0.02,
        signFace(["ECG", "PRESSURE", "FLUORO"][i], { bg: "#06161c", accent: "#2dd4bf", fg: "#bff4ec", scale: 0.3 }), { px: 256, glow: true, ei: 0.8 }));
    }
    // The isolated-power outlet box the receptacle goes into.
    const outletBox = group(boom, -0.05, 1.95, 0.0);
    box(outletBox, 0.26, 0.3, 0.1, 0, 0, 0, 0xbcc6c4, { rough: 0.45, metal: 0.4 });
    box(outletBox, 0.2, 0.24, 0.02, 0, 0, 0.06, 0x2b3a44, { rough: 0.6 });
    holoTag(boom, "Boom outlet box", -0.05, 1.62, 0.1, { css: "#2dd4bf", w: 0.38 });
    hits["recept-socket"] = outletBox;
    const boomRecept = box(boom, 0.09, 0.14, 0.03, 0.22, 1.95, 0.06, 0xe8eeec, { rough: 0.4 });
    ball(boom, 0.012, 0.22, 2.02, 0.08, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(boom, "Boom receptacle — under load", 0.22, 2.2, 0.08, { css: "#59c97b", w: 0.56 });
    reg(hits, boomRecept, "boom-receptacle");

    // The replacement device, waiting on the trolley.
    const trolley = group(g, 2.0, FLOOR, 0.55, -0.5);
    box(trolley, 0.6, 0.04, 0.44, 0, 0.82, 0, 0xc6d0ce, { rough: 0.4, metal: 0.4 });
    box(trolley, 0.6, 0.04, 0.44, 0, 0.5, 0, 0xc6d0ce, { rough: 0.4, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(trolley, 0.016, 0.016, 0.82, sx * 0.26, 0.41, sz * 0.18, 0x8c9896, { rough: 0.4, metal: 0.6, seg: 8 });
      cyl(trolley, 0.035, 0.035, 0.02, sx * 0.26, 0.02, sz * 0.18, 0x22262b, { rough: 0.9, seg: 10 }).rotation.z = Math.PI / 2;
    }
    const newRecept = box(trolley, 0.1, 0.15, 0.04, -0.14, 0.87, 0, 0xe8eeec, { rough: 0.4 });
    ball(trolley, 0.014, -0.14, 0.945, 0.02, 0x2f9e5c, { emissive: 0x2f9e5c, ei: 1.6 });
    holoTag(trolley, "Hospital-grade receptacle", -0.14, 1.16, 0, { css: "#59c97b", w: 0.52 });
    reg(hits, newRecept, "hosp-receptacle");
    const schedule = decal(trolley, 0.26, 0.34, 0.16, 0.845, 0,
      paperFace("PANEL SCHEDULE", ["RM4 EQUIPMENT BRANCH", "CKT 11 — BOOM IPS",
        "EGC — PER RECORD", "RGP — PER RECORD", "LAST TESTED 04/19"], { worn: true }), { px: 256 });
    schedule.rotation.x = -Math.PI / 2;
    holoTag(trolley, "Sign the grounding off the schedule?", 0.16, 0.66, 0.24, { css: "#d2312b", w: 0.72 });
    reg(hits, schedule, "assume-ground");

    // ----------------------------------------- the essential electrical system
    // Three panelboards, side by side, near enough identical. That is the whole
    // point of the second step.
    const boards = group(g, -2.62, FLOOR, -1.6, Math.PI / 2);
    const BRANCH = [
      ["life-safety-panel", -1.0, 0xd8232a, "LIFE SAFETY", "EGRESS · EXIT · ALARM"],
      ["critical-panel", 0.0, 0xf2c14b, "CRITICAL", "PATIENT RECEPTACLES"],
      ["equipment-panel", 1.0, 0x2dd4bf, "EQUIPMENT", "ROOM 4 — ON PERMIT"],
    ];
    const panelBodies = {};
    for (const [id, dz, colour, label, sub] of BRANCH) {
      const p = group(boards, dz, 0, 0);
      box(p, 0.8, 1.35, 0.22, 0, 1.15, 0, 0xcdd6d4, { rough: 0.45, metal: 0.45, finish: "painted" });
      box(p, 0.72, 1.24, 0.03, 0, 1.15, 0.13, 0xdde5e3, { rough: 0.4, metal: 0.4, finish: "painted" });
      box(p, 0.8, 0.1, 0.24, 0, 0.42, 0, colour, { rough: 0.5, finish: "painted" });
      decal(p, 0.6, 0.16, 0, 1.68, 0.02, signFace(label, {
        bg: "#101c22", accent: `#${colour.toString(16).padStart(6, "0")}`, fg: "#e6f2f0", scale: 0.5,
      }), { px: 320, glow: true, ei: 0.7 });
      decal(p, 0.5, 0.08, 0, 1.56, 0.02, signFace(sub, { bg: "#0b1418", accent: "#5d6f74", fg: "#9fb3b6", scale: 0.5 }), { px: 320 });
      for (let r = 0; r < 4; r++) for (const sx of [-1, 1]) {
        box(p, 0.06, 0.09, 0.05, sx * 0.14, 1.5 - r * 0.2, 0.15, 0x22282c, { rough: 0.6 });
      }
      panelBodies[id] = p;
      reg(hits, p, id);
    }
    // The handle on the equipment branch, and the one on life safety that is
    // right beside it and is not yours.
    const eqPanel = panelBodies["equipment-panel"];
    const breaker = group(eqPanel, 0.14, 1.1, 0.19);
    box(breaker, 0.05, 0.14, 0.05, 0, 0, 0, 0x2dd4bf, { rough: 0.5 });
    holoTag(eqPanel, "Equipment branch — Room 4", 0.14, 0.86, 0.22, { css: "#2dd4bf", w: 0.58 });
    reg(hits, breaker, "branch-breaker");
    const hasp = lockTag(eqPanel, -0.16, 1.12, 0.2, {});
    reg(hits, hasp, "lock-hasp");
    const lsPanel = panelBodies["life-safety-panel"];
    const lsBreaker = box(lsPanel, 0.05, 0.14, 0.05, 0.14, 1.1, 0.19, 0xd8232a, { rough: 0.5 });
    holoTag(lsPanel, "Same room — open this one too?", 0.14, 0.86, 0.22, { css: "#d2312b", w: 0.64 });
    reg(hits, lsBreaker, "life-safety-breaker");

    // ------------------------------------------- isolated power and the monitor
    const ips = equipmentCabinet(g, 0.66, 1.15, 0.26, 2.6, -1.9, { ry: -Math.PI / 2, color: 0xdde5e3, metal: 0.35 });
    const limPanel = holoPanel(ips, 0.48, 0.3, 0, 1.46, 0.16, (cx, w, h) => {
      cx.fillStyle = "#07171a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#2dd4bf"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#bff4ec";
      cx.fillText("LINE ISOLATION MONITOR", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#d7f4ef";
      ["ISOLATED POWER — ROOM 4", "HAZARD CURRENT — STANDING", "LOCAL + REMOTE ANNUNCIATION", "TEST FUNCTION ON PANEL"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.16)));
    }, { accent: CTH_ACCENT });
    reg(hits, limPanel, "lim-panel");
    const limLamp = ball(ips, 0.035, -0.17, 1.2, 0.17, 0x59c97b, { emissive: 0x59c97b, ei: 2.2, rough: 0.35 });
    limLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.2, rough: 0.35 }).clone();
    limLamp.material.userData.ownMaterial = true;
    holoTag(ips, "Monitor lamp — local + remote", -0.17, 1.0, 0.2, { css: "#59c97b", w: 0.6 });
    reg(hits, limLamp, "lim-lamp");
    const limTest = group(ips, 0.05, 1.2, 0.17);
    box(limTest, 0.06, 0.06, 0.04, 0, 0, 0, 0x1f7ae0, { rough: 0.5 });
    holoTag(ips, "Monitor test function", 0.05, 0.84, 0.2, { css: "#4fa3ff", w: 0.46 });
    reg(hits, limTest, "lim-test-switch");
    const silence = box(ips, 0.055, 0.055, 0.04, 0.24, 1.2, 0.17, 0xf2c14b, { rough: 0.5 });
    holoTag(ips, "Nuisance buzzer — silence it?", 0.24, 1.44, 0.2, { css: "#d2312b", w: 0.6 });
    reg(hits, silence, "silence-lim");

    // The reference grounding point: a bus bar with every equipment grounding
    // conductor in the room landed on it, and the tester clipped to it.
    const rgp = group(g, 2.6, FLOOR, -0.65, -Math.PI / 2);
    box(rgp, 0.44, 0.08, 0.05, 0, 0.72, 0, 0xc08a3e, { rough: 0.35, metal: 0.85 });
    for (let i = 0; i < 7; i++) {
      box(rgp, 0.02, 0.05, 0.04, -0.18 + i * 0.06, 0.72, 0.035, 0x8f9aa0, { rough: 0.4, metal: 0.7 });
      cyl(rgp, 0.008, 0.008, 0.28, -0.18 + i * 0.06, 0.58, 0.05, 0x2f9e5c, { rough: 0.7, seg: 6, cast: false });
    }
    decal(rgp, 0.34, 0.07, 0, 0.88, 0.02, signFace("REFERENCE GROUNDING POINT", {
      bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5,
    }), { px: 320, glow: true, ei: 0.6 });
    const tester = group(g, 2.15, FLOOR, -0.15, -0.6);
    slab(tester, 0.26, 0.14, 0.2, 0, 0.72, 0, 0xf2a23b, { radius: 0.02, rough: 0.5 });
    cyl(tester, 0.016, 0.016, 0.72, 0, 0.36, 0, 0x6e7a78, { rough: 0.5, metal: 0.5, seg: 8 });
    box(tester, 0.05, 0.06, 0.03, 0.0, 0.82, 0.06, 0xd8232a, { rough: 0.5 });
    holoTag(tester, "Bond tester — clamp and hold", 0, 1.02, 0, { css: "#f2a23b", w: 0.58 });
    reg(hits, tester, "ground-tester");
    const groundMeter = instrument(tester, 0, 0.84, -0.02, { idle: "----", color: 0x2b3138, w: 0.17, d: 0.16 });
    holoTag(tester, "Continuity readout", 0.02, 1.16, -0.02, { css: "#8fa9c4", w: 0.4 });
    reg(hits, groundMeter, "ground-meter");

    const testMeter = instrument(g, 1.7, 0.95, -2.35, { ry: 0.4, idle: "----", color: 0xf2c14b, w: 0.15, d: 0.2 });
    cyl(g, 0.012, 0.012, 0.92, 1.7, 0.49, -2.3, 0x6e7a78, { rough: 0.5, metal: 0.5, seg: 8, cast: false });
    holoTag(g, "Two-pole tester + proving unit", 1.7, 1.2, -2.35, { css: "#f2c14b", w: 0.64 });
    reg(hits, testMeter, "test-meter");

    // ------------------------------------------------- control room and doors
    // Leaded glass into the control room, with the clinical team behind it.
    const glass = group(back, 1.75, 0, 0.1);
    box(glass, 1.5, 0.95, 0.04, 0, 1.55, 0, 0x8fd8e8, { rough: 0.12, metal: 0.1, opacity: 0.4, transparent: true, cast: false });
    for (const sy of [-1, 1]) box(glass, 1.6, 0.06, 0.1, 0, 1.55 + sy * 0.5, 0, 0xb6c0be, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(glass, 0.06, 1.05, 0.1, sx * 0.8, 1.55, 0, 0xb6c0be, { rough: 0.5, metal: 0.4 });
    const intercom = box(glass, 0.12, 0.18, 0.06, 0.95, 1.3, 0.08, 0x39474a, { rough: 0.6 });
    const intercomLamp = ball(glass, 0.02, 0.95, 1.42, 0.1, 0x2dd4bf, { emissive: 0x2dd4bf, ei: 1.2, rough: 0.4 });
    intercomLamp.material = mat(0x2dd4bf, { emissive: 0x2dd4bf, ei: 1.2, rough: 0.4 }).clone();
    intercomLamp.material.userData.ownMaterial = true;
    holoTag(glass, "Control room intercom", 0.95, 1.08, 0.12, { css: "#2dd4bf", w: 0.5 });
    reg(hits, intercom, "control-window");

    // The door out to the corridor, and the sign that goes on it.
    const doorway = group(g, -2.84, FLOOR, 0.3);
    box(doorway, 0.12, 2.25, 1.3, 0, 1.12, 0, 0xb6c0be, { rough: 0.45, metal: 0.3, finish: "painted" });
    box(doorway, 0.05, 2.15, 1.18, 0.07, 1.08, 0, 0xdde5e3, { rough: 0.4, finish: "painted" });
    const doorSign = decal(doorway, 0.36, 0.26, 0.11, 1.5, 0,
      signFace("ROOM 4\nOUT OF SERVICE", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd7d2", scale: 0.24 }), { px: 320, glow: true, ei: 0.7 });
    doorSign.rotation.y = Math.PI / 2;
    holoTag(doorway, "Sign the room out of service", 0.14, 1.88, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, doorSign, "door-sign");

    // Wall phone to the alarm desk, and the impairment log beside it — both on
    // the back wall, clear of the panelboard run down the left-hand side.
    const phone = group(g, -1.25, FLOOR, -2.7);
    box(phone, 0.16, 0.26, 0.1, 0, 1.28, 0, 0xe8eeec, { rough: 0.5 });
    box(phone, 0.2, 0.07, 0.07, 0, 1.4, 0.05, 0x39474a, { rough: 0.6 });
    cyl(phone, 0.006, 0.006, 0.3, 0.05, 1.12, 0.03, 0x39474a, { rough: 0.7, seg: 6, cast: false });
    holoTag(phone, "Alarm desk + clinical engineering", 0, 1.62, 0.06, { css: "#4fa3ff", w: 0.68 });
    reg(hits, phone, "alarm-desk-call");
    const impair = group(g, -2.02, FLOOR, -2.7);
    box(impair, 0.34, 0.44, 0.03, 0, 1.32, 0, 0x8c9896, { rough: 0.55, metal: 0.3 });
    const impairFace = decal(impair, 0.3, 0.4, 0, 1.32, 0.02,
      paperFace("IMPAIRMENT LOG", ["ROOM 4 — EQUIP BRANCH", "START ____", "EXPECTED BACK ____",
        "DEVICES AFFECTED ____", "LOGGED BY ____"], { worn: true }), { px: 256 });
    holoTag(impair, "Impairment log", 0, 1.66, 0.04, { css: "#f2c14b", w: 0.36 });
    reg(hits, impair, "impairment-notice");

    // ----------------------------------------------- paperwork and the schedule
    const auth = holoPanel(g, 0.56, 0.4, -1.55, 1.55, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(6,20,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#2dd4bf"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#7fc9bf";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CLINICAL AUTHORISATION · ROOM 4", w * 0.06, h * 0.13);
      cx.fillStyle = "#e3fbf6";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("EQUIPMENT BRANCH ONLY", w * 0.06, h * 0.31);
      cx.fillStyle = "#b8ded8";
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Window 06:00 — 08:30, no case listed", "Life safety + critical branches stay up",
       "Boom circuit 11 — receptacle change", "Room released by charge nurse on the day",
       "ILSM logged before the breaker", "Hand-back signed in this room"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.45, accent: CTH_ACCENT });
    reg(hits, auth, "clinical-auth");

    const board = group(g, 1.95, FLOOR, 1.55, -0.7);
    cyl(board, 0.03, 0.035, 1.05, 0, 0.52, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    const boardFace = decal(board, 0.5, 0.36, 0, 1.28, 0, (cx, w, h) => {
      cx.fillStyle = "#101c22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe3ac";
      cx.fillText("PLANNED MAINTENANCE SCHEDULE", w * 0.05, h * 0.15);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecd9";
      ["RM4 EQUIP BRANCH — TODAY 06:00", "STATUS: DUE", "NOT A RELEASE"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.42 + i * 0.17)));
    }, { px: 384, glow: true, ei: 0.6 });
    holoTag(board, "Schedule says now — start?", 0, 1.58, 0, { css: "#d2312b", w: 0.56 });
    reg(hits, boardFace, "no-clinical-ok");

    const signoff = group(g, 2.35, FLOOR, 1.05, -0.8);
    cyl(signoff, 0.028, 0.032, 0.95, 0, 0.47, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    slab(signoff, 0.3, 0.02, 0.4, 0, 1.0, 0, 0x22282c, { radius: 0.01, rough: 0.4, metal: 0.3 });
    const signFaceDecal = decal(signoff, 0.26, 0.34, 0, 1.012, 0,
      paperFace("HAND-BACK", ["MONITOR GREEN — LOCAL", "MONITOR GREEN — REMOTE",
        "BOOM OUTLET UNDER LOAD", "EGC + RGP RECORDED", "CLINICAL SIGNATURE ____"], { worn: false }), { px: 256 });
    signFaceDecal.rotation.x = -Math.PI / 2;
    holoTag(signoff, "Clinical hand-back", 0, 1.3, 0, { css: "#2dd4bf", w: 0.42 });
    reg(hits, signoff, "clinical-signoff");

    toolChest(g, -1.95, 1.5, { ry: 0.5, color: 0x2f6f8c });

    // The charge nurse, in the room at the board, and a colleague at the glass.
    const nurse = standingFigure(g, 0.25, 1.55, { ry: 3.0, cloth: 0x2f7d7a, trousers: 0x2a4f52 });
    holoTag(g, "Charge nurse — releases the room", 0.25, 2.05, 1.55, { css: "#2dd4bf", w: 0.68 });
    reg(hits, nurse, "charge-nurse");
    const inControl = standingFigure(g, 1.75, -3.35, { ry: 0.1, cloth: 0x4a5f8c, trousers: 0x2a3244 });
    void inControl;

    let alarm = false, locked = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.3, -1.4),

      onStepComplete(step) {
        if (step.id === "ilsm") {
          repaint(doorSign, signFace("ROOM 4\nOUT OF SERVICE\nWORK IN PROGRESS", {
            bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd7d2", scale: 0.2,
          }));
          repaint(impairFace, paperFace("IMPAIRMENT LOG", ["ROOM 4 — EQUIP BRANCH", "START 06:04",
            "EXPECTED BACK 08:00", "DESK + CE NOTIFIED", "LOGGED BY YOU"], { worn: true }));
        }
        if (step.id === "breaker") {
          // The room really loses the branch: the boom monitors go dark.
          for (const m of monitors) m.material.emissiveIntensity = 0.05;
          limLamp.material.emissiveIntensity = 0.3;
        }
        if (step.id === "lock") locked = true;
        if (step.id === "receptacle") {
          newRecept.parent.remove(newRecept);
          boom.add(newRecept);
          newRecept.position.set(-0.05, 1.95, 0.06);
        }
        if (step.id === "restore") {
          for (const m of monitors) m.material.emissiveIntensity = 0.8;
          limLamp.material.emissiveIntensity = 2.2;
          repaint(limPanel.userData.face, signFace("ISOLATED POWER\nNORMAL", {
            bg: "#07171a", accent: "#2dd4bf", fg: "#bff4ec", scale: 0.24,
          }));
          locked = false;
        }
        if (step.id === "handback") {
          repaint(signFaceDecal, paperFace("HAND-BACK", ["MONITOR GREEN — LOCAL ✓",
            "MONITOR GREEN — REMOTE ✓", "BOOM OUTLET UNDER LOAD ✓", "EGC + RGP RECORDED ✓",
            "SIGNED — CHARGE NURSE"], { worn: false }));
        }
      },

      // Both interruptions change the room itself: a light comes up at the
      // control room glass, and the monitor's lamp actually goes red with its
      // face repainted. See tools/interrupt_react.mjs.
      onInterrupt(it) {
        if (it.id === "add-on-case") {
          intercomLamp.material.emissiveIntensity = 3.2;
          intercom.rotation.z = 0.12;
        }
        if (it.id === "monitor-alarm") {
          alarm = true;
          limLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 3.0, rough: 0.35 }).clone();
          limLamp.material.userData.ownMaterial = true;
          repaint(limPanel.userData.face, signFace("HAZARD CURRENT\nAT ALARM POINT", {
            bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd7d2", scale: 0.22,
          }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "add-on-case") {
          intercomLamp.material.emissiveIntensity = 1.2;
          intercom.rotation.z = 0;
        }
        if (it.id === "monitor-alarm") {
          alarm = false;
          limLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.2, rough: 0.35 }).clone();
          limLamp.material.userData.ownMaterial = true;
          repaint(limPanel.userData.face, signFace("HAZARD CURRENT\nREAD AND LOGGED", {
            bg: "#07171a", accent: "#2dd4bf", fg: "#bff4ec", scale: 0.22,
          }));
        }
      },

      onHazard(hitId) {
        if (hitId === "life-safety-breaker") {
          // The egress lighting is the thing you just took away. Show it.
          for (const lamp of ceilLamps) lamp.material.emissiveIntensity = 0.08;
          for (const sign of egress) sign.material.emissiveIntensity = 0.05;
        }
        if (hitId === "silence-lim") {
          limLamp.material = mat(0x6b7280, { emissive: 0x6b7280, ei: 0.4, rough: 0.35 }).clone();
          limLamp.material.userData.ownMaterial = true;
        }
      },

      animate(t, dt, session) {
        const step = session?.step;
        if (alarm) limLamp.material.emissiveIntensity = 1.6 + Math.max(0, Math.sin(t * 7)) * 2.2;
        if (locked) hasp.rotation.z = Math.sin(t * 1.4) * 0.02;
        void dt;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "lim-read") {
          const ok = gg.t > 0.08 && gg.t < 0.32;
          repaint(limPanel.userData.face, signFace(ok ? "BELOW ALARM POINT" : "TOWARD ALARM POINT", {
            bg: ok ? "#07171a" : "#2a1408", accent: ok ? "#2dd4bf" : "#f0645b", fg: "#bff4ec", scale: 0.2,
          }));
        }
        if (gg && !gg.committed && step?.id === "prove-dead") {
          const ok = gg.t < 0.22;
          repaint(testMeter.userData.screen, signFace(ok ? "DEAD" : "LIVE", {
            bg: "#1c1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && step?.id === "bond-read") {
          const ok = gg.t > 0.34 && gg.t < 0.58;
          repaint(groundMeter.userData.screen, signFace(ok ? "BONDED" : gg.t < 0.34 ? "OPEN" : "HIGH", {
            bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
        if (step?.id === "lim-test" && session.track) {
          const v = session.track.v;
          const ok = v > 0.36 && v < 0.58;
          repaint(groundMeter.userData.screen, signFace(ok ? "AT TEST" : "ADJUST", {
            bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
