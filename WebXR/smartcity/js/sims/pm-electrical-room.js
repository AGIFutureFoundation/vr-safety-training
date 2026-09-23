import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, lockTag, instrument, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Electrical Room VR — Building Systems & Facilities, property
// management programme, zone ten of twenty.
//
// The building's main electrical room, where an IUOE Local 39 building
// engineer and a licensed electrician replace a failed branch breaker in a
// residential panel the way NFPA 70E expects: the arc flash label read, the
// room walked, the working space cleared, the gear scanned with an infrared
// camera before it is touched, arc-rated PPE on, the feeder opened and
// locked, absence of voltage proven with a rated tester, the new breaker's
// lug torqued to spec, the lock removed by its owner, the feeder restored
// from the side, and the job written into the building log. The panel is
// never worked live. A generic building; no real utility, manufacturer or
// resident is named.

const PMER_ACCENT = 0xf2b33a;

export const SIM_PM_ELECTRICAL_ROOM = {
  id: "pm-electrical-room",
  index: "310",
  domain: "Property Management",
  trade: "Building engineer — IUOE Local 39 stationary engineers, working with a licensed electrician",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "NFPA 70E (Standard for Electrical Safety in the Workplace) for the arc flash label, approach boundaries, arc-rated PPE, the electrically safe work condition and absence-of-voltage testing; NFPA 70 for the working space kept clear in front of electrical equipment and for panel directories and filler plates; OSHA 29 CFR 1910.147 for lockout and tagout and 29 CFR 1910.333 for de-energising before work and keeping clear of live parts; IEC 61010 for the measurement category rating of the tester; NFPA 72 for the fire alarm equipment a feeder outage can drop into trouble; the local housing code's duty to restore essential services promptly; IUOE Local 39 building engineers and the licensed electrician they work alongside.",
  supportLine: "IUOE Local 39's member services or your employer's EAP",
  name: "Electrical Room",
  title: simTitle("Electrical Room"),
  tagline: "A failed breaker replaced dead, never live: the arc flash label read, the working space cleared, the gear scanned, arc-rated PPE on, the feeder locked out, absence of voltage proven, the lug torqued, and power restored from the side",
  accent: PMER_ACCENT,
  accentCss: "#f2b33a",
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "worked-dead", name: "Worked Dead", note: "A panel repaired in an electrically safe work condition, proven dead and restored by the person whose lock it was" },

  game: system({
    name: "Switchroom",
    currency: "AMPS",
    ranks: ["Engineer Trainee", "Building Engineer", "Qualified Person", "Chief Engineer", "Switchroom Certified"],
    badges: [
      { id: "never-live", name: "Never Live", note: "No unsafe action anywhere in the job", test: AWARD.safe },
      { id: "locked-and-tagged", name: "Locked and Tagged", note: "Feeder locked out on the first try", test: AWARD.stepClean("lock-tag") },
      { id: "cool-gear", name: "Cool Gear", note: "Infrared scan committed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-job", name: "Clean Job", note: "No corrections anywhere", test: AWARD.clean },
      { id: "short-outage", name: "Short Outage", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "nine-dead", name: "Nine Clean", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "panel-worked-live": "You are taking the dead-front off panel 3A with the feeder still closed. Behind it is an energised bus with enough available fault current to throw an arc flash across the room, and NFPA 70E is written around one idea: equipment is put in an electrically safe work condition before it is worked on, not worked live because an outage is inconvenient.",
    "tape-breaker": "You are taping the tripping breaker in the ON position so the resident gets power back. A breaker trips because the circuit is overloaded or faulted; holding it on turns the wiring in the walls into the fuse, and that is how an apartment fire starts behind the drywall hours after everyone has gone home.",
    "puddle-standing": "You are stepping into the puddle under the dripping pipe to reach the panel. Water on the floor puts your body in the path of any current that finds its way to ground, and 29 CFR 1910.333 expects wet conditions to be dealt with before work near electrical equipment — the leak is fixed and the floor dried first.",
    "unrated-tester": "You are picking up the cheap meter with no category rating to prove the panel dead. IEC 61010's measurement categories exist because a building's distribution panels can deliver transients that blow an unrated meter apart in your hand. The rated tester on the bench is the one that can be trusted on this bus.",
  },

  lateNotes: {
    "feeder-lock": "Your lock goes on once the feeder switch is open — a lock on a closed switch protects nobody.",
    "torque-driver": "The lug is torqued once the panel is proven dead, not before.",
    "building-log": "The job goes into the log once the feeder is back on and the resident has power.",
  },

  steps: [
    {
      id: "arc-flash-label", kind: "select", target: "arc-flash-label",
      title: "Read the arc flash label",
      cue: "Read the label on panel 3A's feeder switch: nominal voltage, arc flash boundary, incident energy and the PPE it calls for.",
      why: "The arc flash label is the result of an engineering study of this exact piece of equipment, and NFPA 70E uses it to set how close an unprotected person may come and what PPE the task needs. Reading it first is what turns 'it's only a panel' into a decision based on the energy actually available behind that door.",
    },
    {
      id: "room-walk", kind: "find", noHint: true,
      targets: ["missing-blank", "blank-directory", "water-stain"],
      itemNames: { "missing-blank": "missing filler blank in the dead-front", "blank-directory": "panel directory blank", "water-stain": "pipe dripping over the switchboard" },
      itemNotes: {
        "missing-blank": "One breaker space on panel 3A has no filler blank. That is an open hole into a live bus, at finger height, in a room anyone with a key can enter.",
        "blank-directory": "The panel's directory card is empty. NFPA 70 wants each circuit identified; without it, the only way to find a circuit is to switch things off until the right apartment goes dark.",
        "water-stain": "A pipe above the switchboard is dripping and there is a stain spreading on the ceiling. Water and switchgear do not mix — it goes on the engineer's list before anything else.",
      },
      title: "Walk the electrical room",
      cue: "Three conditions in this room need correcting before and after today's job. Find them.",
      why: "Electrical rooms fail by neglect: a blank knocked out and never replaced, a directory nobody filled in, a leak nobody looked up at. None of them shows until the day someone is hurt or the switchboard trips. The walk is where a building engineer sees the room as an inspector — or an arc — would.",
    },
    {
      id: "clear-space", kind: "drag", target: "stored-boxes",
      title: "Clear the working space in front of the gear",
      cue: "Carry the boxes someone stacked in front of panel 3A out of the working space.",
      why: "NFPA 70 requires a clear working space in front of electrical equipment, and NFPA 70E counts on it: it is the room to stand in the right place, to step back from an arc and to leave the room fast. Boxes in front of a panel are also fuel in the one room a fire starts most violently.",
      drag: { to: "storage-socket", radius: 0.55, missNote: "Not out of the working space yet. Carry the boxes all the way to the storage spot by the door." },
    },
    {
      id: "ir-scan", kind: "gauge", target: "ir-camera",
      title: "Scan the gear with the infrared camera",
      cue: "Scan panel 3A and its feeder with the infrared camera through the closed covers and commit when the hottest spot sits in the normal band.",
      why: "A loose lug or a failing breaker gets hot long before it fails, and an infrared scan through closed covers finds it without anyone being exposed. A hot spot well above the others is a reason to stop and rethink the job — it may be the fault that tripped the breaker, and it may be a connection that will fail when disturbed.",
      gauge: {
        label: "HOTTEST SPOT — RISE OVER AMBIENT", speed: 0.5, green: [0.1, 0.3],
        readout: (t) => `+${Math.round(t * 60)} °C over ambient`,
        missNote: "That hot spot is outside the normal band. Scan again and, if it holds, treat it as a serious finding before anything is opened.",
      },
    },
    {
      id: "ppe-on", kind: "sequence", anyOrder: true,
      targets: ["arc-rated-shirt", "voltage-gloves", "face-shield"],
      itemNames: { "arc-rated-shirt": "arc-rated shirt on", "voltage-gloves": "voltage-rated gloves with leather protectors on", "face-shield": "arc-rated face shield on" },
      title: "Put on the PPE the label calls for",
      cue: "Put on the arc-rated shirt, the voltage-rated gloves with protectors and the arc-rated face shield.",
      why: "Until absence of voltage has been proven, NFPA 70E treats the equipment as energised — which means the person operating the switch and testing the bus wears PPE sized to the label's incident energy. Ordinary cotton burns and melts into skin; arc-rated clothing is what turns a potentially fatal flash into a survivable one.",
    },
    {
      id: "feeder-off", kind: "turn", target: "feeder-switch-handle",
      title: "Open panel 3A's feeder switch",
      cue: "Standing to the side of the switch, turn the handle to OFF.",
      why: "The feeder switch is the disconnecting means for the whole panel, and opening it is the first physical step towards an electrically safe work condition. Standing to the side — handle-side, face turned away — is the habit NFPA 70E training teaches because if a switch is going to fail violently, it does so at the moment it is operated.",
      turn: { turns: 0.25, axis: "z", label: "FEEDER — PANEL 3A", readout: (t) => (t < 0.95 ? "ON" : "OFF") },
    },
    {
      id: "lock-tag", kind: "select", target: "feeder-lock",
      title: "Lock and tag the feeder",
      cue: "Hang your own lock and tag on the feeder switch handle.",
      why: "An open switch can be closed by the next person who wonders why the fourth floor is dark. 29 CFR 1910.147 requires the lock of each person working on the equipment, with a tag that says who and why — so that nobody can restore the power while your hands are inside the panel.",
    },
    {
      id: "verify-dead", kind: "hold", target: "voltage-tester", seconds: 5,
      title: "Prove absence of voltage",
      cue: "With the rated tester, test it on a known source, test every phase to phase and phase to ground in the panel, then test the known source again — hold until the sequence completes.",
      why: "An open switch is a belief; a test is proof. Testing the tester on a known live source before and after is what shows the meter did not fail silently in between, and 29 CFR 1910.333 and NFPA 70E both treat the equipment as live until this sequence has been completed. It is the step people skip the day they get hurt.",
      holdBreakNote: "You stopped partway through the test sequence. Start it again — known source, every point in the panel, known source again.",
    },
    {
      id: "torque-lug", kind: "track", target: "torque-driver", seconds: 6,
      title: "Torque the new breaker's lug to spec",
      cue: "Seat the new breaker and bring its lug screw up to the torque on the label — steady, not a snap.",
      why: "The breaker failed because a connection was loose and ran hot; a new breaker on a loose lug will go the same way, and an over-torqued one strips the terminal or cracks the breaker. The torque value on the label is what the manufacturer tested, and a calibrated torque screwdriver is how you actually reach it rather than guessing by feel.",
      track: {
        start: 0.2, green: [0.44, 0.62], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "LUG TORQUE",
        readout: (v) => (v < 0.44 ? "under-torqued — will run hot" : v > 0.62 ? "over-torqued — stripping the lug" : "at the label value"),
      },
      holdBreakNote: "The torque went out of the band. Back off and bring it up again steadily to the label value.",
    },
    {
      id: "remove-lock", kind: "select", target: "feeder-lock",
      title: "Replace the dead-front and remove your lock",
      cue: "Refit the dead-front and the filler blank, confirm everyone is clear, then take your own lock off.",
      why: "Only the person who applied a lock removes it, and only once the equipment is closed up, tools are counted and everyone is clear. The dead-front and the filler blank go back on first because the moment the feeder closes, anything left open is live again.",
    },
    {
      id: "feeder-on", kind: "turn", target: "feeder-switch-handle",
      title: "Restore the feeder from the side",
      cue: "Standing to the side, face turned away, turn the feeder handle back to ON.",
      why: "Closing a switch onto a panel is the moment a fault you did not find shows itself, which is why it is done in PPE, from the side, with nobody in front of the gear. The resident's lights coming back is the end of the job — the way it is done is what makes it safe.",
      turn: { turns: 0.25, axis: "z", label: "FEEDER — PANEL 3A", reverse: true, readout: (t) => (t < 0.95 ? "OFF" : "ON") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the job into the building log",
      cue: "Log the scan result, the breaker replaced and torque applied, the blank and directory, the leak, the fire alarm trouble and the outage.",
      why: "The building log is where the electrical history of the building accumulates: which breaker failed, what the scan showed, what was torqued to what, and when power was off and for how long. That record is what the next electrician, the insurer and the housing inspector will all ask for.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the electrician",
      cue: "Ask the electrician how the job went — the resident's call, the pressure to hurry — and name the member services line.",
      why: "Electrical work under pressure — a resident without power, a medical device on a battery — is exactly when people are tempted to cut the corner that NFPA 70E is there to stop. Talking about that pressure afterwards, with the support line named, is how a crew keeps saying no to working live the next time it comes.",
    },
  ],

  interrupts: [
    {
      id: "fa-trouble",
      kind: "Alarm trouble signal",
      after: "verify-dead", delay: 2, seconds: 12,
      alert: "The fire alarm repeater on the wall starts beeping and its amber lamp lights: AC POWER LOSS — NAC PANEL 4. The booster for the fourth floor's horns runs off panel 3A.",
      cue: "Radio the front desk and the fire alarm company that the trouble is from your planned outage.",
      target: "desk-radio",
      why: "A trouble signal from a planned outage is expected — but only by you. The desk, the monitoring company and anyone else who sees it will treat it as a fault unless they are told, and a booster on battery has only so many hours. Telling them now keeps a real fault from being dismissed later as 'the electrician again'.",
      missNote: "The trouble sat unexplained at the desk and the monitoring company. Either someone is now chasing a fault that is not there, or they have learned to ignore that signal — and the fourth floor's horns are running down their battery.",
      wrongNote: "Not that. Radio the desk and the fire alarm company so the trouble is logged as your planned outage.",
    },
    {
      id: "tenant-medical",
      kind: "Resident with a complaint",
      after: "torque-lug", delay: 3, seconds: 12,
      alert: "A resident from the fourth floor comes to the door: her father's oxygen concentrator is on its backup battery and she wants to know how long the power will be off.",
      cue: "Keep her out of the room and check the building's powered medical equipment list for her unit and the battery plan.",
      target: "medical-device-list",
      why: "Buildings that keep a list of residents who rely on powered medical equipment do it for exactly this moment. Checking it tells you whether this unit was notified before the outage and what the plan is, and gives her a real answer — minutes left on the job, and an outlet on another panel if the battery runs short — instead of a guess.",
      missNote: "The resident left without an answer, with her father's concentrator counting down on battery. Nobody checked whether the unit was on the list or what the plan was.",
      wrongNote: "That does not help her. Check the powered medical equipment list for her unit and the backup plan.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMER_ACCENT);

    // ------------------------------------------------------------ floor with the working-space markings
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#6f757b", base2: "#656b71", seam: "rgba(15,18,22,0.35)" }), { repeat: 3, px: 384 });
    const floor = box(g, 6.0, 0.01, 5.6, 0, 0.005, -0.3, 0x6f757b, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.05, color: 0xbcc2c8 });
    floor.receiveShadow = true;
    for (let i = 0; i < 8; i++) box(g, 0.3, 0.004, 0.08, -1.6 + i * 0.45, 0.012, -1.1, i % 2 ? 0x1b1e22 : 0xf2c14b, { rough: 0.8, cast: false });
    decal(g, 2.8, 0.52, 0, 2.62, -4.36, signFace("MAIN ELECTRICAL ROOM", { bg: "#1e1606", accent: "#f2b33a", fg: "#fbf2dc", scale: 0.44 }), { px: 512 });

    // ------------------------------------------------------------ switchboard
    const sb = group(g, -1.2, 0, -2.2);
    for (let i = 0; i < 3; i++) {
      box(sb, 0.8, 2.2, 0.6, -0.8 + i * 0.8, 1.1, 0, 0x8b949d, { rough: 0.45, metal: 0.55 });
      box(sb, 0.02, 2.0, 0.01, -0.8 + i * 0.8 + 0.38, 1.1, 0.305, 0x5a626a, { rough: 0.5, cast: false });
      box(sb, 0.6, 0.3, 0.01, -0.8 + i * 0.8, 1.6, 0.305, 0x6d7379, { rough: 0.5, cast: false });
      box(sb, 0.06, 0.12, 0.04, -0.8 + i * 0.8 + 0.25, 1.1, 0.32, 0x2b3138, { rough: 0.5 });
    }
    decal(sb, 1.2, 0.14, 0, 2.05, 0.305, signFace("MAIN SWITCHBOARD — 480Y/277V", { bg: "#1b1e22", accent: "#f2b33a", scale: 0.45 }), { px: 384 });
    // Dripping pipe above it and the stain.
    const pipe = cyl(g, 0.05, 0.05, 3.0, -1.2, 3.2, -1.9, 0xb8853a, { rough: 0.4, metal: 0.7, seg: 10 });
    pipe.rotation.z = Math.PI / 2;
    const stain = slab(g, 0.6, 0.01, 0.4, -1.4, 4.15, -1.9, 0x5a4a3a, { radius: 0.15, rough: 1.0, cast: false });
    void stain;
    const drip = group(g, -1.4, 3.1, -1.9);
    const dripBall = ball(drip, 0.03, 0, 0, 0, 0x9fc4e4, { rough: 0.1, opacity: 0.7, transparent: true, seg: 8 });
    holoTag(drip, "Dripping pipe", 0, 0.2, 0.06, { css: "#f2b33a", w: 0.28 });
    reg(hits, dripBall, "water-stain");
    const puddle = slab(g, 0.7, 0.006, 0.5, -1.4, 0.014, -1.55, 0x9fc4e4, { radius: 0.2, rough: 0.05, metal: 0.3, opacity: 0.55, transparent: true, cast: false });
    const puddleMark = box(g, 0.5, 0.04, 0.4, -1.4, 0.03, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Stand in the puddle?", -1.4, 0.22, -1.45, { css: "#f0645b", w: 0.34 });
    reg(hits, puddleMark, "puddle-standing");

    // ------------------------------------------------------------ panel 3A and its feeder switch
    const panel = group(g, 1.0, 0, -2.3);
    box(panel, 0.6, 1.2, 0.16, 0, 1.4, 0, 0x9aa2aa, { rough: 0.45, metal: 0.55 });
    const deadFront = box(panel, 0.5, 0.9, 0.02, 0, 1.4, 0.09, 0xb8c0c6, { rough: 0.45, metal: 0.5 });
    for (let r = 0; r < 8; r++) for (const sx of [-0.1, 0.1]) {
      if (r === 3 && sx > 0) continue;
      box(panel, 0.12, 0.05, 0.03, sx, 1.75 - r * 0.1, 0.1, 0x2b3138, { rough: 0.5 });
    }
    const hole = box(panel, 0.12, 0.05, 0.01, 0.1, 1.45, 0.101, 0x0a0b0d, { rough: 1.0 });
    reg(hits, hole, "missing-blank");
    const blank = box(panel, 0.12, 0.05, 0.02, 0.1, 1.45, 0.105, 0xb8c0c6, { rough: 0.45, metal: 0.5 });
    blank.visible = false;
    const tripped = box(panel, 0.12, 0.05, 0.03, -0.1, 1.35, 0.1, 0xc8201a, { rough: 0.5 });
    const tape = box(panel, 0.14, 0.02, 0.035, -0.1, 1.35, 0.1, 0x3a3a3a, { rough: 0.9 });
    holoTag(panel, "Tape the breaker on?", -0.25, 1.2, 0.12, { css: "#f0645b", w: 0.36 });
    reg(hits, tape, "tape-breaker");
    const dfZone = box(panel, 0.2, 0.2, 0.03, 0, 1.0, 0.11, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "Pull the dead-front?", 0, 0.85, 0.12, { css: "#f0645b", w: 0.36 });
    reg(hits, dfZone, "panel-worked-live");
    const directory = decal(panel, 0.14, 0.2, 0.36, 1.5, 0.09, paperFace("PANEL 3A", ["1 ____", "2 ____", "3 ____", "4 ____"], { band: "#5a4a1a" }), { px: 128 });
    directory.rotation.y = 0.3;
    reg(hits, directory, "blank-directory");
    decal(panel, 0.4, 0.08, 0, 2.05, 0.085, signFace("PANEL 3A — FLOOR 4 UNITS", { bg: "#1b1e22", accent: "#f2b33a", scale: 0.45 }), { px: 256 });
    const feeder = group(g, 0.15, 0, -2.3);
    box(feeder, 0.4, 0.6, 0.22, 0, 1.5, 0, 0x8b949d, { rough: 0.45, metal: 0.55 });
    const fHandle = group(feeder, 0.24, 1.5, 0.02);
    box(fHandle, 0.05, 0.22, 0.05, 0, 0.08, 0, 0xc8201a, { rough: 0.5 });
    feeder.userData.wheel = fHandle;
    holoTag(feeder, "Feeder switch — 3A", 0, 1.95, 0.12, { css: "#f2b33a", w: 0.34 });
    reg(hits, feeder, "feeder-switch-handle");
    const afLabel = decal(feeder, 0.3, 0.2, 0, 1.3, 0.112, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b33a"; cx.fillRect(0, 0, w, h * 0.22);
      cx.fillStyle = "#1b1e22"; cx.font = `700 ${Math.round(h * 0.15)}px Arial`; cx.textAlign = "center"; cx.fillText("⚠ WARNING — ARC FLASH", w / 2, h * 0.16);
      cx.font = `${Math.round(h * 0.1)}px Arial`; cx.textAlign = "left";
      ["208 V · 3 phase", "Arc flash boundary: 36 in", "Incident energy: 1.8 cal/cm²", "PPE: arc-rated shirt, shield, gloves"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.38 + i * 0.15)));
    }, { px: 256 });
    reg(hits, afLabel, "arc-flash-label");
    const hasp = torus(feeder, 0.02, 0.005, 0.24, 1.28, 0.08, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg(hits, hasp, "feeder-lock");
    const myLock = lockTag(feeder, 0.24, 1.28, 0.12, { color: 0xf2b33a, lines: ["DO NOT", "OPERATE", "— ENGINEER"] });
    myLock.visible = false;
    for (let i = 0; i < 2; i++) cyl(g, 0.03, 0.03, 2.2, 0.15 + i * 0.85, 3.2, -2.3, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8, cast: false });

    // ------------------------------------------------------------ bench, tools, PPE cabinet
    const bench = group(g, 1.9, 0, -0.9, -Math.PI / 2);
    box(bench, 1.3, 0.05, 0.6, 0, 0.9, 0, 0x8b6a48, { rough: 0.6 });
    for (const sx of [-0.6, 0.6]) for (const sz of [-0.25, 0.25]) box(bench, 0.04, 0.88, 0.04, sx, 0.44, sz, 0x3a4148, { rough: 0.5, metal: 0.4 });
    const tester = group(bench, -0.35, 0.95, 0.05);
    box(tester, 0.08, 0.04, 0.18, 0, 0.02, 0, 0xf2c14b, { rough: 0.5 });
    decal(tester, 0.06, 0.04, 0, 0.042, -0.03, signFace("CAT IV", { bg: "#1b1e22", accent: "#f2b33a", scale: 0.5 }), { px: 64 }).rotation.x = -Math.PI / 2;
    for (const sx of [-0.03, 0.03]) cyl(tester, 0.004, 0.004, 0.2, sx, 0.02, 0.18, sx < 0 ? 0xc8201a : 0x1b1e22, { rough: 0.5, seg: 4 }).rotation.x = Math.PI / 2;
    holoTag(tester, "Rated voltage tester", 0, 0.12, 0, { css: "#f2b33a", w: 0.36 });
    reg(hits, tester, "voltage-tester");
    const cheap = group(bench, 0.0, 0.95, 0.12);
    box(cheap, 0.07, 0.03, 0.13, 0, 0.015, 0, 0x6a8a3a, { rough: 0.6 });
    holoTag(cheap, "Unrated meter", 0, 0.1, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, cheap, "unrated-tester");
    const torqueDriver = group(bench, 0.3, 0.95, 0.0);
    cyl(torqueDriver, 0.02, 0.02, 0.2, 0, 0.02, 0, 0xc8201a, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(torqueDriver, 0.005, 0.005, 0.12, 0.16, 0.02, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(torqueDriver, "Torque screwdriver", 0, 0.12, 0, { css: "#f2b33a", w: 0.34 });
    reg(hits, torqueDriver, "torque-driver");
    const newBreaker = box(bench, 0.12, 0.05, 0.08, 0.5, 0.95, 0.15, 0x2b3138, { rough: 0.5 });
    const cartIr = group(g, -0.3, 0, 0.2);
    box(cartIr, 0.6, 0.05, 0.4, 0, 0.8, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    for (const sx of [-0.27, 0.27]) for (const sz of [-0.17, 0.17]) cyl(cartIr, 0.012, 0.012, 0.8, sx, 0.4, sz, 0x6d7379, { rough: 0.5, metal: 0.5, seg: 6 });
    const ir = instrument(cartIr, 0, 0.84, 0, { idle: "-- °C", color: 0x2b3138, w: 0.12, d: 0.2 });
    holoTag(ir, "Infrared camera", 0, 0.16, 0, { css: "#f2b33a", w: 0.3 });
    reg(hits, ir, "ir-camera");
    const ppe = group(g, 2.5, 0, 0.6, -Math.PI / 2);
    box(ppe, 0.8, 1.8, 0.4, 0, 0.9, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    const shirt = box(ppe, 0.34, 0.5, 0.04, -0.2, 1.3, 0.22, 0x2f5a8a, { rough: 0.8 });
    holoTag(ppe, "Arc-rated shirt", -0.2, 1.62, 0.22, { css: "#f2b33a", w: 0.3 });
    reg(hits, shirt, "arc-rated-shirt");
    const gloves = group(ppe, 0.2, 1.1, 0.22);
    for (const sx of [-0.05, 0.05]) box(gloves, 0.08, 0.2, 0.04, sx, 0, 0, 0xc8201a, { rough: 0.7 });
    holoTag(gloves, "Voltage-rated gloves", 0, 0.18, 0, { css: "#f2b33a", w: 0.36 });
    reg(hits, gloves, "voltage-gloves");
    const shield = group(ppe, 0.2, 1.5, 0.22);
    box(shield, 0.22, 0.2, 0.02, 0, 0, 0, 0x9ab88a, { rough: 0.1, opacity: 0.7, transparent: true });
    box(shield, 0.24, 0.04, 0.12, 0, 0.12, -0.05, 0x2b3138, { rough: 0.5 });
    holoTag(shield, "Arc-rated face shield", 0, 0.22, 0, { css: "#f2b33a", w: 0.36 });
    reg(hits, shield, "face-shield");

    // ------------------------------------------------------------ fire alarm repeater, radio, stored boxes
    const rep = group(g, -2.55, 0, -0.6, Math.PI / 2);
    box(rep, 0.3, 0.36, 0.06, 0, 1.55, 0, 0xb8261e, { rough: 0.5, metal: 0.2 });
    const repFace = decal(rep, 0.24, 0.12, 0, 1.62, 0.032, signFace("FA REPEATER\nNORMAL", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.3 }), { glow: true, ei: 0.8, px: 192 });
    const repLamp = ball(rep, 0.016, 0.08, 1.46, 0.035, 0x3a3018, { rough: 0.4, seg: 8 });
    const radio = group(g, -2.3, 0.95, 0.5);
    box(radio, 0.05, 0.14, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.08, 0.015, 0.11, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    box(g, 0.4, 0.88, 0.35, -2.3, 0.44, 0.5, 0x5a626a, { rough: 0.5, metal: 0.4 });
    holoTag(radio, "Radio to desk", 0, 0.2, 0, { css: "#f2b33a", w: 0.24 });
    reg(hits, radio, "desk-radio");
    const boxes = group(g, 0.9, 0, -1.55);
    box(boxes, 0.5, 0.4, 0.4, 0, 0.2, 0, 0xb08a5a, { rough: 0.85 });
    box(boxes, 0.44, 0.34, 0.36, 0.03, 0.57, 0, 0xa27c4e, { rough: 0.85 });
    holoTag(boxes, "Boxes in the working space", 0, 0.9, 0, { css: "#f2b33a", w: 0.44 });
    reg(hits, boxes, "stored-boxes");
    const storage = box(g, 0.4, 0.1, 0.4, 1.9, 0.3, 1.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["storage-socket"] = storage;
    // Door and a floor mat for dressing.
    const door = group(g, 2.6, 0, 1.6, -Math.PI / 2);
    for (const sx of [-0.5, 0.5]) box(door, 0.08, 2.2, 0.14, sx, 1.1, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    box(door, 0.92, 2.1, 0.05, 0, 1.05, 0.02, 0x6a6a5a, { rough: 0.5, metal: 0.3 });
    decal(door, 0.4, 0.24, 0, 1.6, -0.01, signFace("DANGER\nHIGH VOLTAGE", { bg: "#f4efe4", accent: "#b81410", fg: "#b81410", scale: 0.3 }), { px: 256 }).rotation.y = Math.PI;
    slab(g, 1.2, 0.012, 0.8, 0.6, 0.012, -1.6, 0x1b1e22, { radius: 0.03, rough: 0.95, cast: false });

    // ------------------------------------------------------------ boards
    const medList = holoPanel(g, 0.46, 0.32, 1.5, 1.7, 1.95, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b33a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbf2dc"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("POWERED MEDICAL EQUIPMENT", w / 2, h * 0.26);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e6d6b0";
      cx.fillText("Units notified · battery plan", w / 2, h * 0.55);
      cx.fillText("Spare outlet: panel 2B", w / 2, h * 0.74);
    }, { ry: -2.6, accent: PMER_ACCENT });
    reg(hits, medList, "medical-device-list");
    const logBoard = holoPanel(g, 0.52, 0.36, -2.3, 1.7, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(24,18,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b33a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbf2dc"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6d6b0";
      ["Scan · breaker · torque", "Blank · directory · leak", "FA trouble · outage"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.2, accent: PMER_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, -1.5, 1.7, 2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Engineer · electrician", w / 2, h * 0.56);
      cx.fillText("IUOE Local 39 member services", w / 2, h * 0.74);
    }, { ry: 0.6, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    const electrician = standingFigure(g, -0.8, -0.5, { ry: 0.5, cloth: 0x2f5a8a, trousers: 0x1b2230, toolBelt: true, glasses: true });
    const resident = standingFigure(g, 1.9, 1.0, { ry: -2.4, cloth: 0x7a5a4a, trousers: 0x3a4148, atStation: true });
    resident.visible = false;

    let dripT = 0;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0.2, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "clear-space") boxes.position.set(1.9, 0, 1.6);
        if (step.id === "ir-scan") repaint(ir.userData.screen, signFace("+9 °C", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.6 }));
        if (step.id === "feeder-off") repaint(repFace, signFace("FA REPEATER\nNORMAL", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.3 }));
        if (step.id === "lock-tag") myLock.visible = true;
        if (step.id === "verify-dead") deadFront.visible = false;
        if (step.id === "torque-lug") { tripped.material = mat(0x2b3138, { rough: 0.5 }); tape.visible = false; newBreaker.visible = false; }
        if (step.id === "remove-lock") { myLock.visible = false; deadFront.visible = true; blank.visible = true; }
        if (step.id === "feeder-on") repaint(directory, paperFace("PANEL 3A", ["1 4A kitchen", "2 4A bath", "3 4B kitchen", "4 4B bath"], { band: "#5a4a1a" }));
        if (step.id === "building-log") puddle.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "fa-trouble") {
          repLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.0 });
          repaint(repFace, signFace("TROUBLE\nAC LOSS NAC 4", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.28 }));
        }
        if (it.id === "tenant-medical") resident.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "fa-trouble" && it.resolved === "answered") {
          repLamp.material = mat(0x6a5a2a, { rough: 0.4 });
          repaint(repFace, signFace("TROUBLE — PLANNED\nDESK TOLD", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.24 }));
        }
        if (it.id === "tenant-medical") resident.visible = false;
      },

      animate(t, dt, session) {
        electrician.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        dripT = (dripT + dt) % 1.2;
        dripBall.position.y = -dripT * 2.4;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "ir-scan") {
          repaint(ir.userData.screen, signFace(`+${Math.round(gg.t * 60)} °C`, { bg: "#0d1c24", accent: gg.t > 0.1 && gg.t < 0.3 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
