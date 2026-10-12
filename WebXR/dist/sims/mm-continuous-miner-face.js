import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame, rackUnit,
  cone, barrierPanel, reg,
} from "../citykit.js";
import { continuousMinerFront } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Continuous Miner Face VR — Manufacturing & Automation, mill
// and mine pack, station five.
//
// A cut-and-bolt cycle at an underground coal face. The roof over freshly
// cut coal is not supported until it has bolts in it, so the whole cycle is
// built around never being under it, or beyond the last row that is, without
// a reason the plan accounts for: cut a pass, retreat behind support, dust
// the area, drill and bolt the new roof to the section's own pattern, sound
// it, then advance. The machine itself adds its own hazard — a cutting head
// that does not know a hand from coal, and a crush zone between the machine
// and the rib that a remote control puts a person close enough to stand in.
// Per the section's roof-control plan throughout; no bolt spacing, no gas
// reading and no clearance figure here is a fact this platform is claiming
// to know — the plan and the mine safety regulations are named generically,
// never by a clause this platform is not certain of.

const CMF_ACCENT = 0xb8862e;

export const SIM_MM_CONTINUOUS_MINER_FACE = {
  id: "mm-continuous-miner-face",
  index: "712",
  domain: "Mining",
  trade: "Underground continuous miner operator / roof bolter",
  category: "Manufacturing & Automation",
  weather: "clear",
  certification: "UMWA health and safety training; per the section's roof-control plan and the mine safety regulations, named generically; NIOSH criteria documents on occupational exposure; ANSI B11 general safety requirements for machines",
  name: "Continuous Miner Face",
  title: simTitle("Continuous Miner Face"),
  tagline: "A cut-and-bolt cycle at the face: cut, retreat behind support, dust, drill and bolt to the roof-control plan, sound the roof, advance",
  accent: CMF_ACCENT,
  accentCss: "#b8862e",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "face-supported", name: "Face Supported", note: "A cut-and-bolt cycle run to the roof-control plan, never past the last row of support without a reason the plan accounts for" },

  game: system({
    name: "Face Authority",
    currency: "CUT",
    ranks: ["Roof Bolter Helper", "Continuous Miner Operator", "Section Foreman", "Mine Examiner", "Face Authority Certified"],
    badges: [
      { id: "bolted-before-advance", name: "Bolted Before Advance", note: "Every cut bolted to the plan's pattern before the next one started, first time", test: AWARD.stepClean("install-bolts") },
      { id: "never-past-the-line", name: "Never Past The Line", note: "Never went past the last row of support, into the cutting head, or into the crush zone", test: AWARD.safe },
      { id: "tension-on-plan", name: "Tension On Plan", note: "Every bolt tensioned inside the plan's band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cycle", name: "Clean Cycle", note: "No corrections through the whole cut-and-bolt cycle", test: AWARD.clean },
      { id: "cut-unbroken", name: "Cut Unbroken", note: "The cutting pass never broke its controlled rate", test: AWARD.unbroken },
      { id: "cycle-fast", name: "Cycle Fast", note: "Cycle completed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "red-zone-entry": "You went past the last row of roof support. The roof over freshly cut coal is unsupported until bolts are actually in it, and the plan's whole cut-and-bolt cycle exists so nobody has a reason to stand under it before that — going past the last row on a guess that it will hold removes the one control the plan actually provides.",
    "cutting-head-reach": "You reached toward the cutting drum. It does not know the difference between coal and a hand, and a machine that can bring down a coal face does the same thing to anything else in reach of the bits — the drum is treated as live any time the machine is energised, whether or not it is turning at that instant.",
    "pinch-point-tram": "You stood in the crush zone between the machine and the rib while it trammed. Operating from a remote control puts a person close enough to see the cut, which is also close enough to be pinned the moment the machine moves toward the rib — the zone beside the machine is watched and kept clear the whole time it can move, not just while it looks like it is moving.",
    "trailing-cable-damaged": "You dragged equipment across the machine's trailing cable where the jacket is torn. A cable with its insulation broken open underground is a shock and an arc hazard sitting on the ground the whole section walks over, and it is reported and kept clear of, not driven over on the assumption a torn jacket still means an insulated cable.",
  },

  lateNotes: {
    "roof-drill": "Not yet. The cut is made and the crew is behind support before the drill comes out.",
    "cutter-control-lever": "Not yet. The face is checked and the crew is positioned before the machine moves.",
  },

  steps: [
    {
      id: "roof-plan", kind: "select", target: "plan-board",
      title: "Read the section's roof-control plan",
      cue: "Check the bolt pattern and the support sequence this section is cut to.",
      why: "The roof-control plan is what says how this section is supported, and it is written for this section's own roof conditions rather than copied from memory of a different one. A crew that bolts from habit instead of from the plan is a crew betting that today's roof behaves like the last section they worked, which is exactly the bet the plan exists to remove.",
    },
    {
      id: "preop-walk", kind: "find", noHint: true,
      targets: ["worn-cutting-bit", "loose-rib-bolt"],
      itemNames: { "worn-cutting-bit": "a worn bit on the cutting drum", "loose-rib-bolt": "a loose bolt in the rib support" },
      itemNotes: {
        "worn-cutting-bit": "One of the bits on the cutting drum is worn down past where it is cutting cleanly — a machine cutting with a dull bit works harder for the same cut and throws more dust doing it.",
        "loose-rib-bolt": "A bolt in the rib support beside the face is backed off and no longer tight against the plate — a rib bolt found loose here is found before it is found by the rib it is supposed to be holding.",
      },
      title: "Walk the machine and the rib before cutting",
      cue: "Check the cutting bits and the rib support and click what you see.",
      why: "The machine and the rib are both easiest to check before the cycle starts, while nothing is moving and nothing is under load — a worn bit or a loose rib bolt found here is a work order, and the same thing found mid-cut is a machine or a rib doing something nobody planned for.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["cap-lamp", "self-rescuer", "dust-mask"],
      itemNames: { "cap-lamp": "cap lamp on", "self-rescuer": "self-rescuer on the belt", "dust-mask": "respirator on" },
      title: "Put on the face PPE",
      cue: "Cap lamp on, self-rescuer on your belt, respirator on — all three before going to the face.",
      why: "The cap lamp is your light and your visibility to the rest of the crew, the self-rescuer is the one thing between you and an unbreathable atmosphere if something goes wrong, and the respirator is for the dust a cutting machine puts into the air by the nature of the job. None of the three is optional because the shift looks routine — a self-rescuer left on the bench is a self-rescuer that cannot be reached from the face.",
    },
    {
      id: "gas-check", kind: "gauge", target: "gas-detector",
      title: "Check the face atmosphere",
      cue: "Read the handheld gas detector and confirm it is clear to cut before the machine starts.",
      why: "The atmosphere at a working face is checked before cutting starts, on the detector's own reading, never on the assumption that the last check still holds — conditions at a coal face change with the cut, and a reading is only good for the moment it was taken.",
      gauge: { label: "FACE ATMOSPHERE", speed: 0.7, green: [0.55, 1.0], readout: (t) => (t >= 0.55 ? "clear to cut" : "hold — recheck"), missNote: "Not reading clear — hold the cut and recheck before the machine starts." },
    },
    {
      id: "position-miner", kind: "drag", target: "miner-body",
      title: "Position the miner at the face",
      cue: "Move the continuous miner up to the marked cut line.",
      why: "The cut line is where the plan calls for this pass to start, and positioning to it before cutting is what keeps the cycle's cuts matched to the bolt pattern that follows each one — a cut started off the line is a cut the bolt pattern was not actually planned for.",
      drag: { to: "cut-position", radius: 0.5, missNote: "Not on the cut line — square the machine to the marked line before cutting." },
    },
    {
      id: "cut-pass", kind: "track", target: "cutter-control-lever", seconds: 6,
      title: "Make the cutting pass",
      cue: "Hold the tram control steady and cut the pass at a controlled rate.",
      why: "A pass cut too fast overloads the drum and the conveyor behind it; cut too slow, it holds the machine — and the crew working it by remote — at the face longer than the cut needs. The controlled rate a crew holds through the pass is what keeps the cut clean and the machine's time at the face to what the cut actually requires.",
      track: { start: 0.1, green: [0.42, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "TRAM RATE", readout: (v) => (v < 0.42 ? "too slow" : v > 0.6 ? "too fast" : "controlled") },
      holdBreakNote: "Tram rate out of band — bring it back before the cut runs ahead of what the drum can clear.",
    },
    {
      id: "retreat-support", kind: "select", target: "supported-zone-marker",
      title: "Retreat behind the last row of support",
      cue: "Step back behind the last row of roof bolts before the drill comes out.",
      why: "The newly cut roof has no bolts in it yet, and the plan's cycle is built around nobody being under it until it does. Retreating behind the last supported row before drilling starts is what keeps the crew under roof the plan has already accounted for, the whole time the new section is unsupported.",
    },
    {
      id: "rock-dust", kind: "select", target: "rock-duster",
      title: "Apply rock dust to the new area",
      cue: "Rock-dust the freshly cut area before moving on to bolting.",
      why: "Coal dust in the air and settled on surfaces is fuel for an explosion if an ignition source ever meets it, and rock dust is what keeps that fuel from being able to propagate one. It goes on the newly cut area as a normal part of the cycle, not as a job that gets caught up on later.",
    },
    {
      id: "drill-bolt-holes", kind: "hold", target: "roof-drill", seconds: 5,
      title: "Drill the bolt holes",
      cue: "Hold the roof drill steady on each mark until the hole is bored to the plan's pattern.",
      why: "A hole drilled off the plan's pattern puts the bolt somewhere the plan did not account for, which can mean less roof actually held by the row than the pattern calls for. The drill is held steady through the full hole, on the marked spacing, because a hole started and abandoned partway does not hold a bolt any better than no hole at all.",
      holdBreakNote: "You pulled the drill before the hole was through. A partial hole does not seat a bolt.",
    },
    {
      id: "install-bolts", kind: "sequence",
      targets: ["bolt-outer-left", "bolt-outer-right", "bolt-centre"],
      itemNames: { "bolt-outer-left": "outer bolt, left", "bolt-outer-right": "outer bolt, right", "bolt-centre": "centre bolt" },
      title: "Install the roof bolt row",
      cue: "Set the outer bolts first, then the centre bolt, to the plan's pattern.",
      why: "The plan's pattern names an order for a row for a reason — the outer bolts pin the row's edges first, so the centre bolt goes in against roof that is already partly held rather than against a span that is still entirely free.",
      outOfOrderNote: "Outer bolts first, then the centre — the edges of the row are pinned before the middle of it is asked to hold anything.",
    },
    {
      id: "tension-check", kind: "gauge", target: "tension-gauge",
      title: "Check the bolt tension",
      cue: "Read the torque wrench's gauge and confirm each bolt is tensioned to the plan's band.",
      why: "A bolt tensioned too little is not actually gripping the strata it was drilled into; tensioned past the plan's band, it can shear the bolt or the plate it is seated against. The plan's band is what the wrench is read against, not a feel for how tight the bolt seems to turn.",
      gauge: { label: "BOLT TENSION", speed: 0.72, green: [0.42, 0.62], readout: (t) => (t < 0.42 ? "under plan" : t > 0.62 ? "over plan" : "in band"), missNote: "Outside the plan's band — reset the wrench and tension it again." },
    },
    {
      id: "sound-roof", kind: "hold", target: "sounding-bar", seconds: 5,
      title: "Sound the newly bolted roof",
      cue: "Tap the bar along the new row and feel for a hollow response.",
      why: "A bolt can be tensioned correctly and the roof between the bolts can still be drummy — the sounding bar is what finds that, working the row from underneath rather than trusting the tension readings alone to say the whole row is sound.",
      holdBreakNote: "You stopped sounding before the row was finished. A row sounded halfway tells you about half the roof.",
    },
    {
      id: "tram-clear", kind: "track", target: "cutter-control-lever", seconds: 5,
      title: "Tram the miner back clear",
      cue: "Hold the tram control steady and bring the miner back clear of the newly bolted area.",
      why: "The miner comes back off the new area at the same controlled rate it cut with — a machine trammed back too fast through a space the crew is still working in the crush zone beside is the same hazard the cut itself was worked carefully around.",
      track: { start: 0.1, green: [0.4, 0.58], rise: 0.5, fall: 0.4, drift: 0.12, label: "TRAM RATE", readout: (v) => (v < 0.4 ? "too slow" : v > 0.58 ? "too fast" : "controlled") },
      holdBreakNote: "Tram rate out of band — this is still the crush zone; bring it back under control.",
    },
    {
      id: "log-cycle", kind: "select", target: "section-log",
      title: "Log the cut-and-bolt cycle",
      cue: "Record the cut, the bolt row and what the walk-round found in the section log.",
      why: "The section log is what tells the next crew and the mine examiner what this cycle actually did — the log is checked against the plan by people who were not standing at this face, and a cycle that runs clean but is never logged is a cycle the next shift has to take on faith.",
    },
  ],

  interrupts: [
    {
      id: "unexpected-tram",
      kind: "Machine moving",
      after: "position-miner", delay: 3, seconds: 11,
      alert: "The miner's remote control crossed with another section's signal and the machine has started to tram on its own toward the rib.",
      cue: "The machine is moving without you commanding it.",
      target: "tram-estop",
      why: "A remote control that has crossed signals is a machine doing something nobody at the controls actually asked for, and the crush zone beside it does not care why the machine is moving. The e-stop is what answers a machine in motion that the operator did not command, before the crush zone closes on whoever is standing in it.",
      missNote: "The machine kept tramming toward the rib. A crossed remote signal does not correct itself, and standing in the crush zone waiting to see if it stops is exactly the bet a proximity hazard does not forgive.",
      wrongNote: "It is the tram e-stop. Nothing else stops a machine moving on a signal nobody at the controls sent.",
    },
    {
      id: "roof-talks",
      kind: "Roof sounding off",
      after: "install-bolts", delay: 4, seconds: 13,
      alert: "A loud crack comes from the roof over the row you just bolted, and dust sifts down from a seam in the strata.",
      cue: "The roof is making noise right over freshly bolted ground.",
      target: "roof-monitor-alarm",
      why: "A roof that cracks and sheds dust is telling you something the tension readings and the sounding bar have not yet caught — the roof monitor alarm is what calls for an examiner to look at exactly this, and gets the crew back behind fully proven support while that happens, rather than treating a roof that just made noise as one that has already been checked.",
      missNote: "The crew kept working under a roof that had just cracked and shed dust. A roof does not make that kind of noise for no reason, and finishing the row before checking it is choosing the schedule over the one signal the roof itself just gave.",
      wrongNote: "It is the roof monitor alarm. Nothing else gets an examiner looking at this roof fast enough.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CMF_ACCENT);
    box(g, 6.6, 0.12, 6.2, 0, 0.06, 0, 0x2b2620, { rough: 0.95, finish: "concrete" });

    // ---------------------------------------------------------- the drift
    const rockColour = 0x3a332a;
    const roofHeight = 2.4;
    box(g, 6.6, 0.5, 6.2, 0, roofHeight + 0.25, 0, rockColour, { rough: 0.98, cast: false });
    for (const sx of [-3.3, 3.3]) box(g, 0.5, roofHeight, 6.2, sx, roofHeight / 2, 0, rockColour, { rough: 0.95, cast: false });
    box(g, 6.6, roofHeight, 0.4, 0, roofHeight / 2, -3.0, 0x2f2a22, { rough: 0.95, cast: false });
    holoTag(g, "section drift — face 7 left", 0, roofHeight - 0.2, -2.7, { css: "#b8862e", w: 0.6 });

    // ------------------------------------------------------------- the face
    const miner = continuousMinerFront(g, 0, 0, -1.2, { colour: 0xf0b323 });
    const P = miner.userData.parts;
    reg(hits, P.cuttingDrum, "cutting-head-reach");
    reg(hits, P.chassis, "miner-body");
    const wornBit = box(P.cuttingDrum, 0.1, 0.06, 0.2, -0.75, 0.3, 0.3, 0x2b2318, { rough: 0.9 });
    reg(hits, wornBit, "worn-cutting-bit");
    const ribBolt = cyl(g, 0.03, 0.03, 0.3, -3.0, 1.3, -0.4, 0x8a929a, { rough: 0.6, metal: 0.5, seg: 10 });
    ribBolt.rotation.z = Math.PI / 2;
    reg(hits, ribBolt, "loose-rib-bolt");
    const pinchZone = box(g, 1.1, 1.4, 1.2, -1.9, 0.7, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pinchZone, "pinch-point-tram");
    const cutMark = box(g, 3.0, 0.02, 0.3, 0, 0.01, -2.1, 0xf0b323, { emissive: 0xf0b323, ei: 0.5, rough: 0.5, cast: false });
    hits["cut-position"] = cutMark;
    const cutLeverPost = group(g, -2.4, 0, 0.4);
    box(cutLeverPost, 0.16, 1.0, 0.14, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const cutLeverArm = cyl(cutLeverPost, 0.022, 0.022, 0.4, 0, 1.0, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, cutLeverPost, "cutter-control-lever");
    const tramEstopPost = group(g, -2.4, 0, 0.9);
    box(tramEstopPost, 0.16, 0.9, 0.14, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const tramEstopHead = cyl(tramEstopPost, 0.08, 0.08, 0.05, 0, 0.9, 0.08, 0xd2312b, { rough: 0.45, seg: 16 });
    tramEstopHead.rotation.x = Math.PI / 2;
    holoTag(tramEstopPost, "tram e-stop", 0, 1.14, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, tramEstopPost, "tram-estop");

    // Trailing cable, damaged section.
    const cable = group(g, -1.0, 0.1, 0.6);
    for (let i = 0; i < 6; i++) cyl(cable, 0.03, 0.03, 0.5, -1.4 + i * 0.5, 0, 0, 0x1b1e22, { rough: 0.7, seg: 8, cast: false }).rotation.z = Math.PI / 2;
    const cableDamage = cyl(cable, 0.032, 0.032, 0.3, -0.4, 0, 0, 0xb9793a, { rough: 0.8, seg: 8, cast: false });
    cableDamage.rotation.z = Math.PI / 2;
    reg(hits, cableDamage, "trailing-cable-damaged");

    // Red zone — unsupported roof beyond the last row.
    const redZone = box(g, 2.0, 0.05, 1.0, 0, roofHeight - 0.05, -1.7, 0xd2312b, { emissive: 0xd2312b, ei: 0.5, rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    reg(hits, redZone, "red-zone-entry");

    // Supported zone — the last completed bolt row, marking where the crew retreats to.
    const boltRowOld = group(g, 0, 0, 0.6);
    for (const bx of [-1.0, 0, 1.0]) {
      cyl(boltRowOld, 0.03, 0.03, 0.5, bx, roofHeight - 0.25, 0, 0x8a929a, { rough: 0.35, metal: 0.7, seg: 10, cast: false });
    }
    const supportMark = box(g, 3.0, 0.02, 0.4, 0, 0.01, 1.0, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 0.5, rough: 0.5, cast: false });
    reg(hits, supportMark, "supported-zone-marker");

    // Rock duster, drill, sounding bar, torque wrench.
    const duster = group(g, 2.0, 0, 0.9);
    cyl(duster, 0.16, 0.18, 0.5, 0, 0.35, 0, 0xdfe9ee, { rough: 0.6, metal: 0.3, seg: 16 });
    holoTag(duster, "rock duster", 0, 0.68, 0, { css: "#dfe9ee", w: 0.3 });
    reg(hits, duster, "rock-duster");
    const drillStand = group(g, 1.5, 0, 0.3);
    cyl(drillStand, 0.03, 0.035, 0.8, 0, 0.4, 0, CITY.darkSteel, { rough: 0.5, metal: 0.55, seg: 10 });
    const drillHead = cyl(drillStand, 0.04, 0.04, 0.4, 0, 0.9, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(drillStand, "roof drill", 0, 1.15, 0, { css: "#b8862e", w: 0.3 });
    reg(hits, drillStand, "roof-drill");
    void drillHead;
    const soundingBar = cyl(g, 0.02, 0.02, 1.4, 2.2, 0.7, 1.6, 0xb08b4a, { rough: 0.8, seg: 10 });
    soundingBar.rotation.z = 1.1;
    holoTag(g, "sounding bar", 2.2, 1.3, 1.6, { css: "#b8862e", w: 0.28 });
    reg(hits, soundingBar, "sounding-bar");
    const wrenchStand = group(g, 2.4, 0, -0.3);
    cyl(wrenchStand, 0.03, 0.035, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const tensionFace = instrument(wrenchStand, 0, 0.72, 0, { ry: -0.5, idle: "-- tension", color: CMF_ACCENT });
    reg(hits, tensionFace, "tension-gauge");

    // New bolt row targets in front of the face, past the red zone.
    const newRow = group(g, 0, 0, -1.7);
    const boltHoles = {};
    for (const [id, bx] of [["bolt-outer-left", -1.0], ["bolt-outer-right", 1.0], ["bolt-centre", 0]]) {
      const b = ball(newRow, 0.05, bx, roofHeight - 0.28, 0, 0x2b2f34, { emissive: 0x000000, ei: 0.3, rough: 0.5, seg: 12, seg2: 10 });
      boltHoles[id] = b;
      reg(hits, b, id);
    }

    // Gas detector, plan board, section log.
    const gasStand = group(g, -1.7, 0, 0.9);
    cyl(gasStand, 0.03, 0.035, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const gasMeter = instrument(gasStand, 0, 0.72, 0, { ry: 0.6, idle: "-- --", color: CMF_ACCENT });
    reg(hits, gasMeter, "gas-detector");
    const planBoard = holoPanel(g, 0.6, 0.42, -2.6, 1.5, 1.5, (cx, w, h) => {
      cx.fillStyle = "#140f08"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b8862e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ROOF-CONTROL PLAN", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d6";
      ["Bolt pattern: per the plan", "Row spacing: per the plan", "Support: before advance", "Red zone: no entry"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: CMF_ACCENT, ry: 0.4 });
    reg(hits, planBoard, "plan-board");
    const logStand = group(g, -2.4, 0, 1.6);
    cyl(logStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const logBoard = decal(logStand, 0.32, 0.4, 0, 0.95, 0.02, paperFace("SECTION LOG", ["Cut: ____", "Bolts: ____", "Examiner: ____"], { bg: "#e6ddc4", band: "#8a6a2a" }), { px: 256 });
    reg(hits, logBoard, "section-log");

    // PPE and the roof-monitor alarm.
    const ppeRack = group(g, 2.6, 0, 1.6);
    box(ppeRack, 0.9, 1.6, 0.1, 0, 0.8, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const lamp = ball(ppeRack, 0.06, -0.26, 1.3, 0.08, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.0, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(ppeRack, "cap lamp", -0.26, 1.5, 0.08, { css: "#b8862e", w: 0.3 });
    reg(hits, lamp, "cap-lamp");
    const rescuer = box(ppeRack, 0.16, 0.2, 0.08, 0, 1.1, 0.08, 0xe4622a, { rough: 0.6, finish: "painted" });
    holoTag(ppeRack, "self-rescuer", 0, 1.32, 0.08, { css: "#b8862e", w: 0.34 });
    reg(hits, rescuer, "self-rescuer");
    const mask = box(ppeRack, 0.18, 0.14, 0.08, 0.28, 1.05, 0.08, 0xdfe9ee, { rough: 0.5 });
    holoTag(ppeRack, "respirator", 0.28, 1.28, 0.08, { css: "#b8862e", w: 0.3 });
    reg(hits, mask, "dust-mask");
    const alarmPost = group(g, 2.8, 0, -0.6);
    box(alarmPost, 0.16, 0.9, 0.12, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const alarmBtn = ball(alarmPost, 0.06, 0, 0.85, 0.08, 0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(alarmPost, "roof monitor alarm", 0, 1.1, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, alarmPost, "roof-monitor-alarm");

    // Dressing.
    const toolRack = toolChest(g, -2.8, -1.7, { ry: 0.6, color: 0xb8862e });
    const spareRack = rackFrame(g, 2.7, -1.8, { ry: -0.6, h: 1.1 });
    for (let i = 0; i < 2; i++) rackUnit(spareRack, 0.3 + i * 0.34, ["ROOF BOLTS", "RESIN"][i], { css: "#b8862e" });
    for (const [x, z] of [[-2.9, 2.2], [2.9, 2.0]]) cone(g, x, z);
    barrierPanel(g, 0, 2.7, { ry: 1.57, color: 0xf0b323 });
    const coalDust = particles(g, 20, 0x2b2620, { size: 0.05, life: 0.6, additive: false, opacity: 0.4 });
    coalDust.position.set(-1.4, 1.0, -1.4);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "position-miner") { miner.position.x = 0; miner.position.z = -2.0; }
        if (step.id === "rock-dust") { coalDust.visible = false; }
        if (step.id === "drill-bolt-holes") { for (const b of Object.values(boltHoles)) b.material = mat(0x8a929a, { rough: 0.4, metal: 0.6 }); }
        if (step.id === "install-bolts") { for (const b of Object.values(boltHoles)) b.material = mat(0x4fd1ff, { emissive: 0x1c4a5a, ei: 0.5, rough: 0.4 }); redZone.visible = false; }
        if (step.id === "tram-clear") { miner.position.z = -1.2; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "unexpected-tram") { miner.position.x -= 0.6; tramEstopHead.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.4, rough: 0.4 }); }
        if (it.id === "roof-talks") { alarmBtn.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.2, rough: 0.4 }); coalDust.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "unexpected-tram") { miner.position.x += 0.6; tramEstopHead.material = mat(0xd2312b, { rough: 0.45 }); }
        if (it.id === "roof-talks") { alarmBtn.material = mat(0xd2312b, { rough: 0.4 }); }
      },
      animate(t, dt, session) {
        void dt;
        coalDust.userData.step?.(0.016, new THREE.Vector3(-1.4, 1.0, -1.4), 0.2, 0.2, 0.3);
        const step = session?.step;
        if ((step?.id === "cut-pass" || step?.id === "tram-clear") && session.track) {
          const dir = step.id === "cut-pass" ? -1 : 1;
          miner.position.z += dir * session.track.v * 0.01;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "gas-check") repaint(gasMeter.userData.screen, signFace(gg.t >= 0.55 ? "CLEAR" : "HOLD", { bg: "#1a1208", accent: gg.t >= 0.55 ? "#59c97b" : "#f0645b", fg: "#f6ead6", scale: 0.5 }));
          if (step?.id === "tension-check") repaint(tensionFace.userData.screen, signFace(gg.t < 0.42 ? "UNDER" : gg.t > 0.62 ? "OVER" : "IN BAND", { bg: "#1a1208", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#f6ead6", scale: 0.45 }));
        }
        void t; void cutLeverArm; void P;
      },
    };
  },
};
