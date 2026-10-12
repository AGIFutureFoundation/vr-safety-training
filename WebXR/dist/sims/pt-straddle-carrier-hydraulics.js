import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, signFace, mat, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Straddle Carrier Hydraulics VR — Maritime & Ports, the port
// maintenance pack.
//
// A straddle carrier in the terminal's heavy-equipment shop with an
// operator's defect report on it: the spreader hoist creeps down when parked.
// The learner is the ILWU maintenance and repair mechanic; the IUOE heavy
// equipment training is the same discipline on the same machine. Stored
// hydraulic energy is the whole subject — an accumulator does not care that
// the engine is off — and the shop lane beside the bay and the bridge crane
// above it are what the rest of the shop is doing while the work goes on.

const PTH_ACCENT = 0x6fb35a;

export const SIM_PT_STRADDLE_CARRIER_HYDRAULICS = {
  id: "pt-straddle-carrier-hydraulics",
  index: "219",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair mechanic — heavy equipment shop, PMA training programme, with IUOE heavy equipment maintenance",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE heavy equipment and crane maintenance; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy, including stored hydraulic energy; ASME B30.2 for the shop's bridge crane; 29 CFR 1910.132 for the face shield and gloves at an open line",
  name: "Straddle Carrier Hydraulics",
  title: simTitle("Straddle Carrier Hydraulics"),
  tagline: "A straddle carrier with a creeping hoist: chocked, isolated and locked, the accumulators bled to zero and proven, the weeping fitting found with dye and not a hand, a new hose fitted and torqued, the carriage pinned on its locks, the system pressure held under test beside a live lane and under a live bridge crane, the relief set by the number, and the machine logged back to its operator",
  accent: PTH_ACCENT,
  accentCss: "#6fb35a",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "zero-then-open", name: "Zero, Then Open", note: "Every line opened at zero pressure, every leak found with dye, and the lane and the bridge crane both answered" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Heavy Equipment Shop",
    currency: "BAR",
    ranks: ["Shop Hand", "Hydraulics Mechanic", "Straddle Tech", "Lead Mechanic", "Straddle Certified"],
    badges: [
      { id: "bled-to-zero", name: "Bled To Zero", note: "The accumulators held at zero before any fitting was cracked", test: AWARD.stepClean("bleed-down") },
      { id: "dye-not-hand", name: "Dye, Not Hand", note: "The leak found with the dye and the lamp, never a bare hand", test: AWARD.stepClean("find-leak") },
      { id: "shop-discipline", name: "Shop Discipline", note: "Chocked, locked, never under the carriage, never a hand on a live line", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-repair", name: "Clean Repair", note: "No corrections anywhere in the repair", test: AWARD.clean },
      { id: "held-the-test", name: "Held The Test", note: "System pressure held in band for the whole test", test: AWARD.unbroken },
      { id: "back-to-the-yard", name: "Back To The Yard", note: "Machine logged back inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "crack-fitting-live": "You cracked a fitting with the accumulators still charged. A straddle carrier's accumulators hold the hoist circuit at working pressure for hours after the engine stops, and a fitting opened against that pressure puts a jet of hot oil through a glove and into a hand — 29 CFR 1910.147 counts stored hydraulic energy as energy to be isolated, and the bleed-down to zero is that isolation.",
    "under-carriage-unlocked": "You went under the spreader carriage with it hanging on the hoist cylinders and no maintenance locks in. The defect report says this hoist creeps; a carriage that creeps with nobody under it is the same carriage that comes down on whoever is, and the locks are the only thing in the machine that does not depend on the circuit you are about to open.",
    "no-chocks-work": "You started on the machine without the wheel chocks set. A straddle carrier on a shop floor is tonnes of machine on tyres with a hydrostatic drive that holds it still only while the circuit holds pressure — and you are about to open that circuit. Chocks first, because the machine you are under has to be a machine that cannot move.",
    "hand-leak-check": "You ran a bare hand along the line to feel for the leak. A pinhole leak in a hydraulic line under pressure is an injection injury — oil under the skin from a jet too fine to see — and it is why the leak is found with dye and a lamp on a bled-down system, never with a hand on a live one.",
  },

  lateNotes: {
    "restore-master": "The master switch goes back on for the test only once the hose is fitted, torqued and the carriage is on its locks.",
    "system-test-lever": "There is no system to test until the master is restored and the carriage is pinned — the machine is still locked out.",
    "shop-log-board": "The machine is logged back once the relief is set and the test is complete, not before.",
  },

  steps: [
    {
      id: "defect-report", kind: "select", target: "defect-tag-board",
      title: "Read the operator's defect report",
      cue: "Read what the operator wrote up: the hoist creeps down when parked, and steering has been heavy since the morning.",
      why: "A defect report is the operator telling the shop what the machine did with a box on it, and it points at the circuit before a panel is opened: a hoist that creeps is a cylinder seal, a holding valve or a leak on the pressure side, and heavy steering is a different circuit with a shared pump. Reading it first is what decides which lines are going to be opened, which is what decides what has to be bled to zero, and ILWU maintenance and repair practice starts every job on the report rather than on the machine.",
    },
    {
      id: "chock-and-lock", kind: "sequence",
      targets: ["wheel-chocks", "master-switch", "key-lock"],
      itemNames: { "wheel-chocks": "wheel chocks set", "master-switch": "master switch off", "key-lock": "your lock on the master" },
      title: "Chock the machine, isolate the master switch, and lock it",
      cue: "Chocks under the wheels first, then the master switch off, then your lock through the switch guard.",
      why: "The order is the order the energy is taken out: the chocks take away the machine's ability to move on a floor it is about to lose hydraulic hold on, the master switch takes away the electrical supply that starts the engine and powers the valves, and the lock keeps the switch off against anyone else in the shop with a key. 29 CFR 1910.147 has each one done and then the next — a lock hung on a machine that can still roll is a lock on the wrong thing first.",
      outOfOrderNote: "Chocks first, then the master, then your lock — the machine has to be one that cannot move before it is one that cannot start.",
    },
    {
      id: "bleed-down", kind: "hold", target: "bleed-valve", seconds: 5,
      title: "Bleed the accumulators to zero and hold the reading",
      cue: "Open the accumulator bleed and hold it: watch the pressure gauge come down and stay at zero before any line is touched.",
      why: "The accumulators are the stored energy in this machine, and they hold the hoist circuit at working pressure with the engine off and the master locked — the two isolations already made take away nothing they hold. The bleed is held rather than opened and walked away from because a gauge that reads zero for a second and then climbs is a pilot-operated valve reseating, and the only proof the circuit is dead is a gauge that stays at zero for as long as you watch it.",
      holdBreakNote: "Released before the gauge had held at zero — a reading that drops and is not watched is not a bled-down circuit. Open the bleed and hold it again.",
    },
    {
      id: "find-leak", kind: "find", noHint: true,
      targets: ["weeping-fitting"],
      itemNames: { "weeping-fitting": "weeping fitting on the hoist pressure line at the manifold" },
      itemNotes: { "weeping-fitting": "The dye fluoresces at the hoist pressure line's fitting on the manifold — a wet ring under the nut and a trail down the block. That is the creep: the holding valve is fine, the line ahead of it is not." },
      title: "Find the leak with the dye and the lamp",
      cue: "Sweep the lamp along the hoist circuit: pump, manifold, lines and cylinders, and find where the dye has been weeping.",
      why: "A hydraulic leak that causes a creep is often too fine to see as a drip and always too dangerous to feel for, and the dye in the system shows up under the lamp on a fitting that looks dry to the eye. The sweep covers the whole circuit rather than stopping at the first wet spot because the creep may have two causes, and it is done on a bled-down system because the alternative is finding the leak with a hand — which is how hydraulic injection injuries happen in shops that know better.",
    },
    {
      id: "fit-hose", kind: "drag", target: "new-hose-assembly",
      title: "Fit the replacement hose assembly to the manifold port",
      cue: "Cap the open port, carry the new hose assembly from the bench and seat its fitting on the manifold port.",
      why: "The hose comes off the bench as a made-up assembly with the right fittings and the right rating, and it goes onto a manifold port that has been capped since the old one came off, because an open port on a shop floor collects the grit that scores a pump. The fitting is seated by hand first, square on the port, so the torque that follows is torque on a properly started thread rather than a cross-threaded one pulled up until it stopped leaking.",
      drag: { to: "manifold-port", radius: 0.5, missNote: "Not on the port — the fitting has to seat square on the manifold before any torque goes on it." },
    },
    {
      id: "torque-fitting", kind: "turn", target: "fitting-nut",
      title: "Torque the fitting to the manufacturer's figure",
      cue: "Pull the fitting nut up to the figure on the sheet with the wrench, and mark it.",
      why: "A hydraulic fitting has a torque figure because both directions are failures: under-torqued, the seal face does not seat and the same weep comes back under the same dye a week later; over-torqued, the flare or the o-ring face is crushed and the fitting leaks the first time the line goes cold. The mark across the nut and the port is what tells the next mechanic the fitting was torqued and has not moved, which is more than a fitting ever says on its own.",
      turn: { turns: 0.75, label: "FITTING", readout: (t) => (t < 0.3 ? "snug" : t < 0.7 ? "pulling up" : "at figure") },
    },
    {
      id: "carriage-locks", kind: "select", target: "carriage-lock-pins",
      title: "Pin the spreader carriage on its maintenance locks",
      cue: "Set the maintenance lock pins under the spreader carriage before the hoist circuit is put back under pressure.",
      why: "The test that follows puts the hoist circuit back to working pressure, and a creeping carriage is exactly what the test may reproduce — with a mechanic standing beside the machine watching a gauge. The maintenance locks carry the carriage on steel rather than on the circuit being tested, so a repair that has not fixed the creep shows up as a gauge reading and not as a carriage on its way down.",
    },
    {
      id: "fluid-and-filter", kind: "sequence", anyOrder: true,
      targets: ["reservoir-sight", "filter-indicator"],
      itemNames: { "reservoir-sight": "reservoir level at the sight glass", "filter-indicator": "return filter bypass indicator" },
      title: "Check the reservoir level and the return filter",
      cue: "Read the reservoir sight glass and the return filter's bypass indicator before the pump is asked to work.",
      why: "The line change has taken fluid out of the system and let air in, and a pump started on a low reservoir cavitates and eats itself inside a shift; the return filter's bypass indicator says whether the old leak has been sending debris around the circuit that the filter has stopped holding. Both are read now, before the master goes back on, because they are the two faults a pressure test would otherwise find by destroying something.",
    },
    {
      id: "restore-master", kind: "select", target: "restore-master",
      title: "Clear the machine and restore the master for the test",
      cue: "Everyone clear of the carriage and the lines, your lock off, the master switch on — the machine is live for the test only.",
      why: "From this moment the machine can start and the valves can shift, and a straddle carrier's hoist circuit going to pressure is the loudest thing in the shop and the least forgiving. 29 CFR 1910.147 puts a head count before the lock comes off, because the person most likely to be at an open line when the pump starts is the mechanic who just fitted it — and the chocks stay in through the test, because a machine that is live is a machine that can roll.",
    },
    {
      id: "pressure-test", kind: "track", target: "system-test-lever", seconds: 6,
      title: "Hold the hoist circuit at test pressure and watch for drop",
      cue: "Bring the hoist circuit up to the test figure on the lever and hold it there — a steady needle, no drop, no surge.",
      why: "The pressure test is what proves the new hose, the fitting and the holding valve under the load they actually carry: a slow drop is the leak still there or a new one at the fitting, a surge is the relief or the compensator hunting. It is held for the full interval rather than peaked because a fitting that seals at pressure for a second and weeps over ten is the same defect the operator reported, and the whole repair is measured by whether the needle stays where it was put.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "SYSTEM PRESSURE", readout: (v) => (v < 0.4 ? "dropping — leak?" : v > 0.6 ? "over test — relief hunting" : "holding at test") },
      holdBreakNote: "The pressure fell out of band — that is the drop or the surge the test exists to find. Bring it back to the test figure and hold.",
    },
    {
      id: "relief-setting", kind: "gauge", target: "relief-gauge",
      title: "Set the main relief valve at the specified pressure",
      cue: "Adjust the relief and commit the reading inside the manufacturer's band on the test gauge.",
      why: "The main relief is the ceiling on the whole hoist circuit: set low it stalls the hoist under a heavy box and the operator drives the machine to the shop again; set high it puts the hoses, the cylinders and the new fitting above their working rating on every lift and one of them finds out first. The manufacturer's figure is a number, the test gauge is how the mechanic reads it, and the setting is committed only inside the band because a relief set by ear is set wrong in one of two directions.",
      gauge: { label: "RELIEF", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 400)} bar`, missNote: "Outside the band — back the relief off and come up to the figure again slowly, reading the test gauge and not the machine's." },
    },
    {
      id: "shop-log", kind: "select", target: "shop-log-board",
      title: "Log the repair and release the machine to the yard",
      cue: "Record the leak found, the hose replaced, the test pressure held and the relief setting, and clear the defect with the yard.",
      why: "The log is where this repair becomes something the next mechanic can use: the hose that was changed is the one that will need changing again first, the relief setting is the number the next test is measured against, and the defect cleared with the yard is what stops a dispatcher sending the machine out on the strength of it looking parked in a bay. The PMA training programme teaches the write-up as part of the repair, not the paperwork after it, for exactly that reason.",
    },
    {
      id: "operator-checkin", kind: "select", target: "shop-radio",
      title: "Check in with the operator and the shop crew",
      cue: "Call the operator whose report started this and the shop lead: what was found, what was changed, and how the crew is after a shift beside the lane.",
      why: "The operator wrote up a creeping hoist and deserves to hear what it was rather than to find out from whether the machine still does it, and telling them closes the loop that makes the next defect report worth writing. The call is also the crew's own check-in — a shift with a hustler in the lane and a load over the bay is a shift with a moment or two in it, and the ILWU practice is to name them out loud, and the support that exists, before the next machine comes in.",
    },
  ],

  interrupts: [
    {
      id: "hustler-shop-lane",
      kind: "Hustler entering the shop lane",
      after: "bleed-down", delay: 2, seconds: 12,
      alert: "A hustler has turned into the shop lane beside the bay with a bare chassis behind it, and the bay's drip trays and hose run are out across the lane line.",
      cue: "Drop the lane stop light to red now — the driver cannot see what is on the floor from the cab.",
      target: "lane-stop-light",
      why: "The shop lane is a live yard lane that happens to run past an open bay, and a hustler driver reads the lane light and the paddle, not the floor: a hose run or a drip tray across the line is under the chassis before he knows it is there. 29 CFR 1917 puts the traffic control on the terminal, and in a shop that control is the lane light, set to red the moment a vehicle turns in rather than once it is plainly not going to stop.",
      missNote: "The hustler came down the lane and over the hose run with the light still green; the chassis dragged the drip tray twenty feet, and the bleed-down went on as if the lane were empty.",
      wrongNote: "The lane stop light — the driver answers to the light, and nothing else in the bay is in his eyeline from the cab.",
    },
    {
      id: "bridge-crane-overhead",
      kind: "Shop bridge crane travelling a load over the bay",
      after: "pressure-test", delay: 2, seconds: 12,
      alert: "The shop's bridge crane is bringing a slung engine block down the bay toward this machine — the load is passing over the bay line.",
      cue: "Hit the bridge crane's hold button on the bay pendant — nothing travels over a manned bay.",
      target: "crane-hold-button",
      why: "ASME B30.2 puts the load's path in the crane operator's hands and keeps people out from under it, and a bay with a mechanic at a live pressure test is a bay the load does not cross: the bay pendant's hold is the one control in reach that stops the travel, and it is used by the person under the load because the operator at the far pendant cannot see the bay is manned. The test can be held again; a load cannot be un-dropped.",
      missNote: "The engine block passed over the bay and the mechanic at the test gauge with nothing stopping it, and the pressure test carried on underneath as if the hook were empty.",
      wrongNote: "The bridge crane's hold button on the bay pendant — the load is the crane's to stop, and the pendant is the only thing here that reaches it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTH_ACCENT);

    // ------------------------------------------------------------ shop floor
    const floor = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2c3136", base2: "#242a2f", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 }),
      { rough: 0.9, metal: 0.04, color: 0xaeb6be },
    );
    const lane = box(g, 1.2, 0.02, 5.6, -2.6, 0.111, 0, 0xffffff, { rough: 0.6, metal: 0.3, cast: false });
    lane.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 7, px: 256 }),
      { rough: 0.55, metal: 0.35, color: 0x9aa3ab },
    );
    for (let i = 0; i < 6; i++) box(g, 0.08, 0.012, 0.5, -2.0, 0.122, -2.4 + i * 0.95, 0xf2c14b, { rough: 0.7, cast: false });
    // Drip tray and the hose run out toward the lane line.
    box(g, 0.8, 0.04, 0.5, -1.5, 0.13, 0.9, 0x3a4148, { rough: 0.6, metal: 0.4 });
    hose(g, [[-0.6, 0.14, 0.4], [-1.2, 0.14, 0.8], [-1.9, 0.14, 1.1]], 0.02, 0x1b1e23, { steps: 10, rough: 0.75 });

    // ------------------------------------------------------ straddle carrier
    // Four legs, two side beams, the top frame, and the spreader carriage
    // hanging inside on its hoist cylinders — scaled to the bay.
    const sc = group(g, 0.5, 0.1, -0.6);
    const legs = [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]];
    for (const [lx, lz] of legs) {
      box(sc, 0.22, 2.6, 0.22, lx, 1.3, lz, 0xe0b52a, { rough: 0.55, metal: 0.35 });
      const wheel = cyl(sc, 0.32, 0.32, 0.26, lx, 0.32, lz, 0x14171a, { rough: 0.85, seg: 16 });
      wheel.rotation.z = Math.PI / 2;
      cyl(sc, 0.14, 0.14, 0.28, lx, 0.32, lz, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    }
    for (const lz of [-0.9, 0.9]) box(sc, 2.6, 0.3, 0.3, 0, 2.6, lz, 0xe0b52a, { rough: 0.55, metal: 0.35 });
    for (const lx of [-1.1, 1.1]) box(sc, 0.3, 0.3, 2.1, lx, 2.6, 0, 0xe0b52a, { rough: 0.55, metal: 0.35 });
    box(sc, 0.9, 0.7, 0.7, -0.8, 2.15, 1.3, 0x2b3138, { rough: 0.5, metal: 0.4 });
    box(sc, 0.7, 0.4, 0.02, -0.8, 2.25, 1.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    // Hoist cylinders and the carriage.
    for (const lx of [-0.7, 0.7]) {
      cyl(sc, 0.07, 0.07, 1.2, lx, 1.9, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 12 });
      cyl(sc, 0.04, 0.04, 0.6, lx, 1.05, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 10 });
    }
    const carriage = group(sc, 0, 0.75, 0);
    box(carriage, 2.0, 0.22, 0.4, 0, 0, 0, 0xd2312b, { rough: 0.55, metal: 0.4 });
    for (const cx of [-0.95, 0.95]) box(carriage, 0.1, 0.3, 0.5, cx, -0.1, 0, 0x3a4148, { rough: 0.55, metal: 0.5 });
    const underCarriage = box(sc, 1.6, 0.05, 0.6, 0, 0.14, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sc, "under the carriage?", 0, 0.5, 0.45, { css: "#d2312b", w: 0.42 });
    reg(hits, underCarriage, "under-carriage-unlocked");
    const lockPins = group(sc, 0, 0.95, -0.35);
    for (const px of [-0.9, 0.9]) cyl(lockPins, 0.03, 0.03, 0.3, px, 0, 0, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(sc, "carriage locks", 0, 1.25, -0.5, { css: "#6fb35a", w: 0.3 });
    reg(hits, lockPins, "carriage-lock-pins");
    // Hydraulic power pack on the top frame: pump, manifold, accumulators.
    const hpu = group(sc, 0.4, 2.75, -0.9);
    box(hpu, 1.0, 0.36, 0.36, 0, 0.18, 0, 0x2f3a44, { rough: 0.5, metal: 0.5 });
    const manifold = box(hpu, 0.4, 0.2, 0.2, -0.25, 0.46, 0.06, 0x3a4148, { rough: 0.5, metal: 0.6 });
    void manifold;
    for (const ax of [0.2, 0.42]) cyl(hpu, 0.08, 0.08, 0.5, ax, 0.6, 0, 0x2f6f4a, { rough: 0.5, metal: 0.5, seg: 12 });
    // The manifold this job works is brought down to the bay's own reach: a
    // service manifold on the leg at working height.
    const svc = group(sc, 1.28, 1.2, -0.3);
    box(svc, 0.14, 0.5, 0.36, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 3; i++) cyl(svc, 0.03, 0.03, 0.08, 0.1, 0.15 - i * 0.15, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    const weeping = torus(svc, 0.04, 0.012, 0.12, 0.15, 0, 0x7a6a2a, { rough: 0.3, metal: 0.2, emissive: 0x5a4a10, ei: 0.5, seg: 6, seg2: 16 });
    weeping.rotation.y = Math.PI / 2;
    reg(hits, weeping, "weeping-fitting");
    const portSocket = torus(svc, 0.07, 0.008, 0.14, 0.15, 0, PTH_ACCENT, { emissive: PTH_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    portSocket.rotation.y = Math.PI / 2;
    reg(hits, portSocket, "manifold-port");
    const fittingNut = group(svc, 0.16, 0.15, 0);
    cyl(fittingNut, 0.035, 0.035, 0.05, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    fittingNut.visible = false;
    holoTag(svc, "fitting — torque", 0.1, 0.42, 0, { css: "#6fb35a", w: 0.32 });
    reg(hits, fittingNut, "fitting-nut");
    const crackHit = box(svc, 0.1, 0.1, 0.1, 0.12, -0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(svc, "crack it charged?", 0.1, -0.36, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, crackHit, "crack-fitting-live");
    const handHit = hose(svc, [[0.12, 0.0, 0.18], [0.3, 0.1, 0.4], [0.5, 0.2, 0.6]], 0.018, 0x1b1e23, { steps: 10, rough: 0.75 });
    holoTag(svc, "feel for it?", 0.4, 0.42, 0.5, { css: "#d2312b", w: 0.3 });
    reg(hits, handHit, "hand-leak-check");
    // Lines from the service manifold up to the power pack.
    hose(sc, [[1.28, 1.35, -0.3], [1.3, 2.2, -0.5], [0.9, 2.9, -0.9]], 0.02, 0x1b1e23, { steps: 12, rough: 0.75 });
    hose(sc, [[1.28, 1.05, -0.3], [1.35, 1.6, 0.1], [0.75, 1.6, 0.05]], 0.02, 0x1b1e23, { steps: 12, rough: 0.75 });
    // Reservoir sight glass and return filter on the leg.
    const sight = group(sc, -1.28, 1.4, 0.4);
    box(sight, 0.08, 0.4, 0.2, 0, 0, 0, 0x2f3a44, { rough: 0.5, metal: 0.5 });
    box(sight, 0.02, 0.28, 0.06, -0.05, 0, 0, 0x8fb8d0, { rough: 0.2, metal: 0.1, emissive: 0x3a5a70, ei: 0.4 });
    holoTag(sc, "reservoir sight glass", -1.28, 1.72, 0.4, { css: "#6fb35a", w: 0.42 });
    reg(hits, sight, "reservoir-sight");
    const filter = group(sc, -1.28, 0.9, 0.4);
    cyl(filter, 0.07, 0.07, 0.3, 0, 0, 0, 0x2f6f4a, { rough: 0.5, metal: 0.5, seg: 12 });
    const filterLamp = ball(filter, 0.025, -0.08, 0.1, 0, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 8 });
    holoTag(sc, "return filter", -1.28, 0.62, 0.4, { css: "#6fb35a", w: 0.28 });
    reg(hits, filter, "filter-indicator");
    // Ladder up the leg.
    for (let i = 0; i < 7; i++) box(sc, 0.3, 0.02, 0.03, -1.1, 0.4 + i * 0.32, 1.05, 0x8a949d, { rough: 0.5, metal: 0.6, cast: false });
    // Wheel chocks (at the front-left wheel) and the no-chocks hazard.
    const chocks = group(sc, -1.1, 0, -1.25);
    box(chocks, 0.2, 0.12, 0.14, -0.14, 0.06, 0, 0xe8b02e, { rough: 0.8 });
    box(chocks, 0.2, 0.12, 0.14, 0.14, 0.06, 0, 0xe8b02e, { rough: 0.8 });
    holoTag(sc, "wheel chocks", -1.1, 0.35, -1.45, { css: "#6fb35a", w: 0.28 });
    reg(hits, chocks, "wheel-chocks");
    const noChocks = box(sc, 0.4, 0.05, 0.3, 1.1, 0.14, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sc, "start with no chocks?", 1.1, 0.5, -1.45, { css: "#d2312b", w: 0.44 });
    reg(hits, noChocks, "no-chocks-work");

    // ---------------------------------------- master switch, lock, restore, bleed
    const mpanel = group(sc, 1.28, 1.9, 0.5);
    box(mpanel, 0.1, 0.4, 0.3, 0, 0, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    const master = box(mpanel, 0.06, 0.12, 0.12, 0.07, 0.08, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const masterHandle = box(mpanel, 0.04, 0.04, 0.16, 0.1, 0.08, 0, 0xd2312b, { rough: 0.5 });
    holoTag(sc, "master switch", 1.28, 2.2, 0.5, { css: "#6fb35a", w: 0.3 });
    reg(hits, master, "master-switch");
    const keyLock = group(mpanel, 0.08, -0.1, 0.04);
    box(keyLock, 0.03, 0.04, 0.1, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    const lock = lockTag(keyLock, 0.03, -0.05, 0, { lines: ["M&R — DO", "NOT START"], ry: Math.PI / 2 });
    lock.visible = false;
    holoTag(sc, "lock the master", 1.28, 1.6, 0.5, { css: "#6fb35a", w: 0.32 });
    reg(hits, keyLock, "key-lock");
    const restore = cyl(mpanel, 0.025, 0.025, 0.02, 0.06, -0.1, -0.1, 0x59c97b, { rough: 0.4, seg: 10 });
    restore.rotation.z = Math.PI / 2;
    holoTag(sc, "restore for test", 1.28, 1.42, 0.3, { css: "#6fb35a", w: 0.34 });
    reg(hits, restore, "restore-master");
    const bleed = group(sc, 1.28, 0.6, -0.3);
    cyl(bleed, 0.03, 0.03, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    const bleedHandle = box(bleed, 0.03, 0.12, 0.02, 0.06, 0.06, 0, 0xd2312b, { rough: 0.5 });
    holoTag(sc, "accumulator bleed — hold", 1.28, 0.36, -0.3, { css: "#6fb35a", w: 0.48 });
    reg(hits, bleed, "bleed-valve");
    const bleedGauge = instrument(sc, 1.34, 0.72, -0.62, { ry: -Math.PI / 2, idle: "180 bar", color: 0x6fb35a, w: 0.1, d: 0.1 });
    void bleedHandle;

    // ------------------------------------------------------- test station
    const tstation = group(g, 2.5, 0.1, 0.9, -0.4);
    cyl(tstation, 0.04, 0.05, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 10 });
    box(tstation, 0.4, 0.26, 0.2, 0, 1.1, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const testLever = group(tstation, -0.1, 1.25, 0.06);
    cyl(testLever, 0.012, 0.012, 0.16, 0, 0.08, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 });
    ball(testLever, 0.03, 0, 0.17, 0, 0x2b2f34, { rough: 0.5, seg: 10 });
    holoTag(tstation, "system test — hold", 0, 1.55, 0, { css: "#6fb35a", w: 0.38 });
    reg(hits, testLever, "system-test-lever");
    const testGauge = instrument(tstation, 0.12, 1.24, 0, { idle: "-- bar", color: 0x6fb35a, w: 0.1, d: 0.1 });
    const reliefGauge = instrument(tstation, 0.12, 1.24, -0.14, { idle: "RELIEF", color: 0x6fb35a, w: 0.1, d: 0.1 });
    holoTag(tstation, "relief — set", 0.3, 1.4, -0.14, { css: "#6fb35a", w: 0.26 });
    reg(hits, reliefGauge, "relief-gauge");

    // --------------------------------------------------------- bench and tools
    const chest = toolChest(g, 1.9, 2.0, { ry: -0.5, color: 0x2f4f6f });
    const lamp = instrument(chest, -0.1, 0.79, 0.02, { ry: 0.2, idle: "UV LAMP", color: 0x6fb35a, w: 0.1, d: 0.16 });
    void lamp;
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 5 · SHOP", color: 0x6fb35a, w: 0.1, d: 0.16 });
    holoTag(radio, "shop radio", 0, 0.15, 0, { css: "#6fb35a", w: 0.26 });
    reg(hits, radio, "shop-radio");
    const newHose = group(chest, 0.0, 0.82, -0.15);
    const hoseCoil = torus(newHose, 0.1, 0.02, 0, 0, 0, 0x1b1e23, { rough: 0.75, seg: 8, seg2: 18 });
    hoseCoil.rotation.x = Math.PI / 2;
    cyl(newHose, 0.03, 0.03, 0.06, 0.1, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(chest, "new hose assembly", 0, 1.08, -0.15, { css: "#6fb35a", w: 0.38 });
    reg(hits, newHose, "new-hose-assembly");

    // ----------------------------------------------- lane light and hustler
    const lightPost = group(g, -1.9, 0.1, -2.3);
    cyl(lightPost, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(lightPost, 0.14, 0.3, 0.12, 0, 1.5, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const laneLamp = ball(lightPost, 0.045, 0, 1.58, 0.07, 0x59c97b, { rough: 0.4, emissive: 0x59c97b, ei: 1.6, seg: 10 });
    ball(lightPost, 0.045, 0, 1.44, 0.07, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10 });
    holoTag(lightPost, "lane stop light", 0, 1.8, 0, { css: "#6fb35a", w: 0.32 });
    reg(hits, lightPost, "lane-stop-light");
    const hustler = group(g, -2.6, 0.1, 4.6);
    box(hustler, 0.9, 0.5, 1.4, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hustler, 0.86, 0.6, 0.7, 0, 1.0, -0.3, 0x3f7ab8, { rough: 0.5, metal: 0.3 });
    box(hustler, 0.7, 0.3, 0.02, 0, 1.1, -0.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.45], [0.45, 0.45]]) cyl(hustler, 0.22, 0.22, 0.2, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    box(hustler, 0.9, 0.12, 2.2, 0, 0.55, 1.8, 0x8b98a5, { rough: 0.6, metal: 0.4 });
    hustler.visible = false;
    const hustlerHome = hustler.position.clone();

    // ----------------------------------------------- bridge crane overhead
    const rail = box(g, 6.4, 0.2, 0.2, 0, 3.6, -2.7, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    void rail;
    box(g, 6.4, 0.2, 0.2, 0, 3.6, 2.7, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    const bridge = group(g, -5.5, 3.7, 0);
    box(bridge, 0.4, 0.3, 5.6, 0, 0, 0, 0xe0b52a, { rough: 0.55, metal: 0.4, cast: false });
    box(bridge, 0.5, 0.4, 0.5, 0, -0.3, 0.3, 0x2f3a44, { rough: 0.55, metal: 0.5, cast: false });
    cyl(bridge, 0.012, 0.012, 1.6, 0, -1.3, 0.3, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    box(bridge, 0.7, 0.5, 0.5, 0, -2.3, 0.3, 0x2f6f4a, { rough: 0.5, metal: 0.5 });
    const pendant = group(g, 2.6, 0.1, -1.6);
    cyl(pendant, 0.015, 0.015, 1.6, 0, 0.8, 0, 0x1b1e23, { rough: 0.7, seg: 6 });
    box(pendant, 0.1, 0.24, 0.06, 0, 1.2, 0, 0xe8b02e, { rough: 0.6 });
    const holdBtn = cyl(pendant, 0.03, 0.03, 0.02, 0, 1.28, 0.04, 0xd2312b, { rough: 0.4, seg: 10 });
    holdBtn.rotation.x = Math.PI / 2;
    holoTag(pendant, "bridge crane hold", 0, 1.5, 0, { css: "#6fb35a", w: 0.36 });
    reg(hits, pendant, "crane-hold-button");
    const bridgeHome = bridge.position.clone();

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, -1.3, 1.2, 1.9, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#6fb35a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2cf"; cx.fillText("DEFECT REPORT — STRADDLE 22", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Operator: hoist creeps down when parked with a box", "Steering heavy since first move of the shift", "Accumulators charged — bleed to zero before any line",
       "Chocks · master off · lock before anything else", "Carriage on its locks before the circuit is tested", "Relief figure and torque figures on the sheet"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 2.7, accent: PTH_ACCENT });
    reg(hits, board, "defect-tag-board");
    const logBoard = holoPanel(g, 0.6, 0.42, 0.4, 1.25, 2.3, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#6fb35a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2cf"; cx.fillText("SHOP LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Status: IN SHOP", "Leak: —", "Test / relief: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 3.1, accent: PTH_ACCENT });
    reg(hits, logBoard, "shop-log-board");

    // ---------------------------------------------------------------- crew
    const mechanic = standingFigure(g, -1.4, -2.2, { ry: 0.6, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e, gloves: true, glasses: true });
    holoTag(mechanic, "M&R mechanic", 0, 1.9, 0, { css: "#6fb35a", w: 0.3 });
    const operator = standingFigure(g, -0.4, 2.2, { ry: 3.0, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(operator, "straddle operator", 0, 1.9, 0, { css: "#6fb35a", w: 0.34 });
    cone(g, 2.4, -2.4); cone(g, 1.0, -2.4);
    barrierPanel(g, 1.7, -2.5, { color: 0xf2c14b, ry: 0 });
    const drips = particles(g, 10, 0x7a6a2a, { size: 0.02, life: 1.0, additive: false, opacity: 0.6 });

    const okMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
    const redMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
    const dimMat = mat(0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6 });
    let bled = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 1.1, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "chock-and-lock") { masterHandle.rotation.x = Math.PI / 2; lock.visible = true; }
        if (step.id === "bleed-down") { bled = true; repaint(bleedGauge.userData.screen, signFace("0 bar", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 })); }
        if (step.id === "find-leak") weeping.material = mat(0x2b2f34, { rough: 0.5, metal: 0.6 });
        if (step.id === "fit-hose") { newHose.visible = false; fittingNut.visible = true; }
        if (step.id === "carriage-locks") { lockPins.position.z = 0; }
        if (step.id === "fluid-and-filter") filterLamp.material = okMat;
        if (step.id === "restore-master") { masterHandle.rotation.x = 0; lock.visible = false; repaint(bleedGauge.userData.screen, signFace("LIVE", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.6 })); }
        if (step.id === "pressure-test") repaint(testGauge.userData.screen, signFace("HELD", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "relief-setting") repaint(reliefGauge.userData.screen, signFace("SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "shop-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d8f2cf"; cx.fillText("SHOP LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Status: RELEASED TO YARD", "Leak: hoist pressure line — hose replaced", "Test held · relief set to figure"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "operator-checkin") repaint(radio.userData.screen, signFace("CLOSED OUT", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "hustler-shop-lane") { hustler.visible = true; hustler.position.set(-2.6, 0.1, 1.4); }
        if (it.id === "bridge-crane-overhead") { bridge.position.x = 0.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hustler-shop-lane") { hustler.position.copy(hustlerHome); hustler.visible = false; laneLamp.material = redMat; }
        if (it.id === "bridge-crane-overhead") { bridge.position.copy(bridgeHome); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "torque-fitting") fittingNut.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "relief-setting") repaint(reliefGauge.userData.screen, signFace(`${Math.round(gg.t * 400)} bar`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "bleed-down" && session.holding) {
          const frac = Math.min(1, session.holdFor / (step.seconds ?? 5));
          repaint(bleedGauge.userData.screen, signFace(`${Math.round(180 * (1 - frac))} bar`, { bg: "#0d1c24", accent: frac > 0.9 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (step?.id === "pressure-test" && session.holding) {
          const v = session.track.v;
          repaint(testGauge.userData.screen, signFace(`${Math.round(v * 400)} bar`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        drips.visible = !bled;
        if (!bled) drips.userData.step(dt, new THREE.Vector3(1.9, 1.3, -0.9), 0.02, 0.05, -0.8);
        void dimMat; void t; void CITY;
      },
    };
  },
};
