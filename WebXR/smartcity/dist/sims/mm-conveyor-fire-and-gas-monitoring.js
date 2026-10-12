import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, rackFrame, rackUnit,
  cone, barrierPanel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Conveyor Belt Fire & Gas Monitoring VR — Manufacturing &
// Automation, mill and mine pack, station eight.
//
// A pre-shift examination of an underground belt entry. A belt fire almost
// always starts the same way — friction heat from something that should be
// turning and is not, sitting next to coal dust that never got cleaned up —
// so the exam is built to find exactly that before the belt runs another
// shift on it: a stuck roller freed under lockout, the dust it was grinding
// into swept up, the fire suppression proven armed, and the carbon monoxide
// and methane monitors read and trusted rather than covered or guessed at.
// Per the mine's examination and ventilation plan throughout — no gas
// reading here is ever given as a number, no clause is cited that this
// platform is not certain of, and the mine safety regulations are named
// only generically.

const CFG_ACCENT = 0x8a6a9e;

export const SIM_MM_CONVEYOR_FIRE_AND_GAS_MONITORING = {
  id: "mm-conveyor-fire-and-gas-monitoring",
  index: "715",
  domain: "Mining",
  trade: "Underground belt examiner / conveyor attendant",
  category: "Manufacturing & Automation",
  weather: "clear",
  certification: "UMWA health and safety training; per the mine's examination and ventilation plan and the mine safety regulations, named generically; NFPA 69 explosion prevention systems; OSHA 29 CFR 1910.147 control of hazardous energy (lockout/tagout)",
  name: "Conveyor Belt Fire & Gas Monitoring",
  title: simTitle("Conveyor Belt Fire & Gas Monitoring"),
  tagline: "A belt-entry exam: a stuck roller freed under lockout, the dust swept up, suppression proven armed, and the CO and methane monitors read and trusted",
  accent: CFG_ACCENT,
  accentCss: "#8a6a9e",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "belt-entry-examined", name: "Belt Entry Examined", note: "A belt examined to the plan: the friction source found and freed under lockout, the dust cleared, suppression armed, both monitors read and trusted" },

  game: system({
    name: "Belt Examiner Authority",
    currency: "ROLLER",
    ranks: ["Beltman Helper", "Belt Attendant", "Mine Examiner", "Fire Boss", "Belt Examiner Authority Certified"],
    badges: [
      { id: "locked-before-freed", name: "Locked Before Freed", note: "The belt drive locked out before the stuck roller was ever touched, first time", test: AWARD.stepClean("lockout-belt") },
      { id: "never-trusted-a-guess", name: "Never Trusted A Guess", note: "Never covered a monitor, reached the pulley nip, brought an ignition source in, or bypassed suppression", test: AWARD.safe },
      { id: "both-monitors-read", name: "Both Monitors Read", note: "CO and methane both read clear before the belt ran the shift", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-exam", name: "Clean Exam", note: "No corrections through the whole examination", test: AWARD.clean },
      { id: "run-unbroken", name: "Run Unbroken", note: "The observed belt run never broke its watched rate", test: AWARD.unbroken },
      { id: "exam-fast", name: "Exam Fast", note: "Examination completed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "monitor-covered": "You covered the gas monitor's sensor. A monitor that has been taped or bagged over to stop a nuisance alarm is a belt entry with no early warning at all — the sensor cannot read an atmosphere it has been blocked from, and it fails exactly the way that matters most: silently, with everyone assuming it is still watching.",
    "pinch-point-pulley": "You reached toward the pulley while the belt was running. A conveyor pulley's nip pulls in whatever reaches it at the belt's own running speed and does not release it — the nip is treated as live any time the belt can move, guard or no guard, hand or sleeve.",
    "ignition-source": "You brought an open flame source into the belt entry. Coal dust in the air or settled along the structure is exactly the fuel a belt fire needs, and an ignition source brought in around it removes the one thing standing between routine dust and a fire — nothing that can spark or flame comes into a belt entry, full stop.",
    "suppression-bypass": "You opened the suppression system's bypass instead of leaving it armed. The bypass exists for maintenance under a written procedure, not as a way to stop nuisance discharges — a belt fire that starts while the suppression is bypassed has nothing standing between it and however far it can spread before anyone reaches it by hand.",
  },

  lateNotes: {
    "roller-tool": "Not yet. The drive is locked out before the stuck roller is touched.",
    "belt-run-lever": "Not yet. The guard is back, the monitors read clear and suppression is armed before the belt runs.",
  },

  steps: [
    {
      id: "shift-exam", kind: "select", target: "exam-book",
      title: "Read the pre-shift examination book",
      cue: "Check what the last examiner logged for this belt entry before starting your own exam.",
      why: "The examination book is a record of exactly this entry over time, and reading it first is what tells you whether today's exam is starting clean or picking up a condition that was already being watched — an exam that skips the book is an exam blind to its own belt's history.",
    },
    {
      id: "walk-belt", kind: "find", noHint: true,
      targets: ["stuck-roller", "dust-accumulation"],
      itemNames: { "stuck-roller": "a frozen idler roller grinding against the belt", "dust-accumulation": "a build-up of dust along the structure" },
      itemNotes: {
        "stuck-roller": "This idler roller is not turning with the belt any more — it is grinding a flat against a moving belt, and friction heat from exactly this kind of fault is how most belt fires actually start.",
        "dust-accumulation": "There is a build-up of dust along the belt structure here — fine fuel sitting right next to the one part of the belt line that generates friction heat when something goes wrong with it.",
      },
      title: "Walk the belt entry",
      cue: "Check the rollers and the structure and click what you find.",
      why: "A stuck roller and a dust build-up are each ordinary on their own and dangerous together, which is exactly why the exam looks for both — a fire needs a heat source and a fuel source in the same place, and this walk is what finds them before a shift runs on top of them.",
    },
    {
      id: "clean-dust", kind: "drag", target: "cleanup-shovel",
      title: "Clean up the dust accumulation",
      cue: "Carry the shovel to the dust pile and clear it from the structure.",
      why: "Dust cleared off the structure is fuel that is no longer sitting next to the belt line's own heat sources — cleaning it up during the exam, rather than logging it for later, is what actually changes the entry's risk before the shift starts.",
      drag: { to: "dust-pile", radius: 0.4, missNote: "Not on the pile — the dust has to actually be cleared from the structure, not just carried past it." },
    },
    {
      id: "lockout-belt", kind: "turn", target: "belt-drive-disconnect",
      title: "Lock out the belt drive",
      cue: "Lock the belt drive before touching the stuck roller.",
      why: "A roller that is stuck against a moving belt is still part of a machine that can move the instant the drive is live — locking it out first is what makes it safe to actually put hands and a tool on the roller rather than working next to a belt that could start moving under them.",
      turn: { turns: 0.5, axis: "y", label: "BELT DRIVE" },
    },
    {
      id: "free-roller", kind: "hold", target: "roller-tool", seconds: 5,
      title: "Free the stuck roller",
      cue: "Hold the tool steady on the roller until it turns free again.",
      why: "A roller freed properly turns smoothly again on its own bearing — one freed halfway and left can seize again under the first load the belt puts back on it, which is the same friction-heat problem the exam just found, now hidden again inside a roller that looks fixed.",
      holdBreakNote: "You stopped before the roller was fully free. A roller that still catches is a roller that will grind again under load.",
    },
    {
      id: "guard-check", kind: "select", target: "belt-guard",
      title: "Confirm the guard is back",
      cue: "Check the guard is back over the roller before the drive is restored.",
      why: "The guard is what keeps the nip at this roller from being a reach-in hazard once the belt is moving again — it goes back before power does, in that order, every time.",
    },
    {
      id: "restart-belt", kind: "turn", target: "belt-drive-disconnect",
      title: "Remove your lock and restore the drive",
      cue: "Confirm the area is clear, take your lock off, then restore the belt drive.",
      why: "Your lock, your call — restoring the drive is the one action that only the person who applied the lock gets to take, because only that person actually watched the roller and the guard the whole time they were being worked on.",
      turn: { turns: 0.5, axis: "y", label: "BELT DRIVE" },
    },
    {
      id: "co-monitor-check", kind: "gauge", target: "co-monitor",
      title: "Read the carbon monoxide monitor",
      cue: "Check the CO monitor and confirm it reads clear before continuing the exam.",
      why: "A rising carbon monoxide reading is the earliest warning a belt fire gives, often before anything is visible at all, and the monitor is read on its own display — never assumed clear because nothing looks or smells wrong yet, which is exactly the stage a CO monitor exists to catch instead of a person's own senses.",
      gauge: { label: "CO MONITOR", speed: 0.7, green: [0.55, 1.0], readout: (t) => (t >= 0.55 ? "reads clear" : "alarm — investigate"), missNote: "Not reading clear — investigate before treating this entry as normal." },
    },
    {
      id: "methane-check", kind: "gauge", target: "methane-monitor",
      title: "Read the methane monitor",
      cue: "Check the methane monitor and confirm it is clear to work before the belt runs the shift.",
      why: "The methane monitor is read the same way the CO monitor is — off its own display, against the plan's clear-to-work reading, never estimated from how the air in the entry seems. Methane gives no reliable warning to the senses at all, which is the entire reason the monitor exists in the first place.",
      gauge: { label: "METHANE MONITOR", speed: 0.7, green: [0.55, 1.0], readout: (t) => (t >= 0.55 ? "clear to work" : "withdraw — recheck"), missNote: "Not reading clear — withdraw from the entry and recheck before anyone works in it." },
    },
    {
      id: "suppression-check", kind: "sequence", anyOrder: true,
      targets: ["suppression-valve", "nozzle-check", "control-panel-armed"],
      itemNames: { "suppression-valve": "suppression supply valve open", "nozzle-check": "nozzles checked clear", "control-panel-armed": "control panel armed" },
      title: "Verify the fire suppression system",
      cue: "Confirm the supply valve is open, the nozzles are clear, and the panel shows armed.",
      why: "A fire suppression system is only as good as its weakest link on the day it is actually needed — a valve left shut, a nozzle blocked by the same dust the walk just found, or a panel left in bypass all produce the same result: a system that looks installed but does nothing when a fire actually starts.",
    },
    {
      id: "belt-run-observe", kind: "track", target: "belt-run-lever", seconds: 6,
      title: "Run the belt and observe it",
      cue: "Hold the run lever and watch the belt track true at a steady, watched pace.",
      why: "A belt observed at a steady pace right after an exam is what catches a roller that is not quite right or a belt that has started to wander before the shift is run at full load on top of it — the exam is not finished until the belt has actually been watched running.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "OBSERVED RATE", readout: (v) => (v < 0.4 ? "too slow to judge" : v > 0.6 ? "too fast to watch" : "watching it track") },
      holdBreakNote: "Rate out of band — this is an observed run, not full production; bring it back so the belt can actually be watched.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["belt-misalignment"],
      itemNames: { "belt-misalignment": "the belt running off-centre on the return" },
      itemNotes: { "belt-misalignment": "The belt is running slightly off-centre on the return side — worth a training adjustment before it rubs a structure member the way the roller you just fixed was doing." },
      title: "Walk the belt one more time after the restart",
      cue: "Check the belt is tracking true and click what you see.",
      why: "The exam's whole point was to stop a friction problem before it started a fire, and the surest way to know it worked is to watch the belt after the restart rather than trusting that fixing one roller fixed everything about how the belt tracks.",
    },
    {
      id: "log-exam", kind: "select", target: "exam-board",
      title: "Log the examination",
      cue: "Record the roller, the dust, the monitor readings and the suppression check in the exam book.",
      why: "The examination book is what the next examiner and the mine's records both depend on — a belt entry examined thoroughly but never logged is, to everyone who was not standing there, an entry nobody has checked.",
    },
  ],

  interrupts: [
    {
      id: "co-alarm-trips",
      kind: "CO alarm trips",
      after: "belt-run-observe", delay: 4, seconds: 13,
      alert: "The CO monitor's alarm trips while the belt is running the observed pass.",
      cue: "The monitor you already checked is now alarming.",
      target: "belt-stop-button",
      why: "A monitor that was clear ten minutes ago and is alarming now is telling you the entry's condition has changed since the last reading, not that the earlier check was wrong. The belt stop is what takes the heat source out of the equation immediately, before anyone tries to reason out whether the alarm is real from where they are standing.",
      missNote: "The belt kept running after the CO alarm tripped. A carbon monoxide alarm on a belt line is the earliest warning a fire gives, and treating it as background noise while the belt keeps running is choosing to find out the hard way whether it was real.",
      wrongNote: "It is the belt stop. Nothing else takes the heat source out of the loop this fast.",
    },
    {
      id: "roller-smokes",
      kind: "Roller smoking",
      after: "lockout-belt", delay: 3, seconds: 12,
      alert: "The roller you just locked out to work on starts visibly smoking from heat that built up before the lockout took effect.",
      cue: "There is visible smoke coming off the roller right in front of you.",
      target: "manual-suppression-pull",
      why: "Heat that built up before the lockout does not stop being heat just because the drive is now dead — a smoking roller next to dust is a fire starting, not a fire that lockout already prevented. The manual suppression pull is the answer that is actually in reach, right now, rather than waiting to see whether it goes out on its own.",
      missNote: "The smoking roller was left to sit while the work continued. Heat already in a stuck roller does not care that the drive is locked out, and a fire that starts next to dust the exam already found does not wait for the roller to be freed on schedule.",
      wrongNote: "It is the manual suppression pull. Nothing else reaches this fire from right here, right now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CFG_ACCENT);
    box(g, 6.6, 0.12, 6.0, 0, 0.06, 0, 0x2b2620, { rough: 0.95, finish: "concrete" });

    const rockColour = 0x39332b;
    const roofHeight = 2.3;
    box(g, 6.6, 0.5, 6.0, 0, roofHeight + 0.25, 0, rockColour, { rough: 0.98, cast: false });
    for (const sx of [-3.3, 3.3]) box(g, 0.5, roofHeight, 6.0, sx, roofHeight / 2, 0, rockColour, { rough: 0.95, cast: false });
    holoTag(g, "belt entry — 3 conveyor", 0, roofHeight - 0.2, -2.7, { css: "#8a6a9e", w: 0.5 });

    // ------------------------------------------------------------ the belt
    const beltStructure = group(g, 0, 0, 0);
    for (const bx of [-1.4, 1.4]) box(beltStructure, 0.1, 0.7, 5.4, bx, 0.75, 0, 0x4a5057, { rough: 0.6, metal: 0.45, finish: "galvanised" });
    const beltTop = box(beltStructure, 2.9, 0.04, 5.4, 0, 1.05, 0, 0x1b1e22, { rough: 0.7, finish: "rubber" });
    void beltTop;
    const headPulley = cyl(beltStructure, 0.24, 0.24, 3.0, 0, 1.0, 2.6, 0x8a929a, { rough: 0.35, metal: 0.6, seg: 18 });
    headPulley.rotation.x = Math.PI / 2;
    reg(hits, headPulley, "pinch-point-pulley");
    const tailPulley = cyl(beltStructure, 0.22, 0.22, 3.0, 0, 1.0, -2.6, 0x8a929a, { rough: 0.35, metal: 0.6, seg: 18 });
    tailPulley.rotation.x = Math.PI / 2;

    // Rollers along the belt, with one stuck/smoking.
    const rollers = [];
    for (let i = -2; i <= 2; i++) {
      const r = cyl(beltStructure, 0.09, 0.09, 2.8, 0, 0.72, i * 0.9, 0x6a747c, { rough: 0.4, metal: 0.55, seg: 14 });
      r.rotation.x = Math.PI / 2;
      rollers.push(r);
    }
    const stuckRoller = rollers[1];
    reg(hits, stuckRoller, "stuck-roller");
    const smokeParticles = particles(beltStructure, 18, 0x555a52, { size: 0.05, life: 0.6, additive: false, opacity: 0.4 });
    smokeParticles.position.set(0, 0.9, 0.9);
    smokeParticles.visible = false;

    // Dust accumulation and cleanup.
    const dustPile = box(g, 0.7, 0.14, 0.6, -1.9, 0.14, 0.4, 0x5a4a32, { rough: 0.95 });
    reg(hits, dustPile, "dust-accumulation");
    hits["dust-pile"] = dustPile;
    const shovelRack = toolChest(g, -2.7, 1.4, { ry: 0.6, color: 0x8a6a9e });
    const shovel = box(shovelRack, 0.06, 0.5, 0.06, 0, 0.78, 0, 0x8a929a, { rough: 0.4, metal: 0.5 });
    holoTag(shovelRack, "cleanup shovel", 0, 1.06, 0, { css: "#8a6a9e", w: 0.32 });
    reg(hits, shovel, "cleanup-shovel");

    // Belt drive disconnect and lockout, guard, run lever, stop button.
    const pendant = group(g, -2.4, 0, -1.8);
    box(pendant, 0.5, 1.3, 0.14, 0, 0.65, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const disc = group(pendant, 0, 0.95, 0.08);
    cyl(disc, 0.04, 0.04, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const discHandle = box(disc, 0.02, 0.09, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, disc, "belt-drive-disconnect");
    const lock = lockTag(pendant, 0, 0.75, 0.08, { color: 0x8a6a9e }); lock.visible = false;
    const runLever = group(pendant, 0, 0.5, 0.08);
    cyl(runLever, 0.022, 0.022, 0.3, 0, 0, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, runLever, "belt-run-lever");
    const guard = box(beltStructure, 0.5, 0.4, 0.4, 0, 0.9, 0.9, 0xf0b323, { rough: 0.6, opacity: 0.55, transparent: true });
    reg(hits, guard, "belt-guard");
    const rollerTool = cyl(g, 0.02, 0.02, 0.5, -1.0, 0.9, 1.0, 0x8a929a, { rough: 0.5, metal: 0.5, seg: 8 });
    reg(hits, rollerTool, "roller-tool");
    const stopPost = group(g, 2.3, 0, -1.4);
    box(stopPost, 0.16, 0.9, 0.12, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const stopBtn = ball(stopPost, 0.07, 0, 0.85, 0.08, 0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(stopPost, "belt stop", 0, 1.1, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, stopPost, "belt-stop-button");

    // CO and methane monitors, with the covered-sensor hazard nearby.
    const monitorStand = group(g, 1.9, 0, -1.0);
    cyl(monitorStand, 0.03, 0.035, 0.8, 0, 0.4, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const coFace = instrument(monitorStand, 0, 0.85, 0, { ry: -0.6, idle: "-- --", color: CFG_ACCENT });
    reg(hits, coFace, "co-monitor");
    const monitorStand2 = group(g, 1.9, 0, -0.3);
    cyl(monitorStand2, 0.03, 0.035, 0.8, 0, 0.4, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const methFace = instrument(monitorStand2, 0, 0.85, 0, { ry: -0.6, idle: "-- --", color: CFG_ACCENT });
    reg(hits, methFace, "methane-monitor");
    const coveredSensor = box(g, 0.12, 0.1, 0.1, 1.6, 0.9, -1.6, 0x2b2f34, { rough: 0.6, opacity: 0.7, transparent: true });
    reg(hits, coveredSensor, "monitor-covered");

    // Fire suppression: supply valve, nozzles, control panel, manual pull, bypass.
    const suppressionLine = group(g, -1.6, 0, 0.2);
    cyl(suppressionLine, 0.05, 0.05, 3.0, 0, 1.4, 0, 0xd8232a, { rough: 0.5, metal: 0.4, seg: 12 }).rotation.z = Math.PI / 2;
    const valve = group(suppressionLine, -1.3, 1.4, 0);
    cyl(valve, 0.07, 0.07, 0.06, 0, 0, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    reg(hits, valve, "suppression-valve");
    const nozzle = group(suppressionLine, 0.6, 1.4, 0);
    cyl(nozzle, 0.03, 0.045, 0.1, 0, -0.1, 0, 0xb9bec4, { rough: 0.4, metal: 0.6, seg: 12 });
    reg(hits, nozzle, "nozzle-check");
    const panel = group(g, -1.9, 0, 0.9);
    box(panel, 0.4, 0.5, 0.1, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    reg(hits, panel, "control-panel-armed");
    const bypassValve = group(suppressionLine, 1.3, 1.4, 0);
    cyl(bypassValve, 0.06, 0.06, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.4, metal: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    decal(bypassValve, 0.12, 0.03, 0, 0.05, 0.01, signFace("BYPASS", { bg: "#22262b", accent: "#d2312b", scale: 0.4 }));
    reg(hits, bypassValve, "suppression-bypass");
    const manualPullPost = group(g, -1.0, 0, -0.9);
    box(manualPullPost, 0.14, 0.9, 0.12, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const manualPullHandle = box(manualPullPost, 0.1, 0.14, 0.05, 0, 0.85, 0.05, 0xd2312b, { rough: 0.5 });
    holoTag(manualPullPost, "manual suppression pull", 0, 1.1, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, manualPullPost, "manual-suppression-pull");

    // Ignition source hazard, off to the side.
    const lighterProp = box(g, 0.05, 0.09, 0.03, -2.2, 0.85, 1.9, 0xd2312b, { rough: 0.5 });
    holoTag(g, "open flame — not allowed here", -2.2, 1.0, 1.9, { css: "#f0645b", w: 0.5 });
    reg(hits, lighterProp, "ignition-source");

    // Off-centre belt marker for the final walk.
    const misalign = box(beltStructure, 0.4, 0.02, 0.15, 0.6, 0.5, -1.6, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.5, rough: 0.5, cast: false });
    reg(hits, misalign, "belt-misalignment");

    // Exam book, exam board.
    const examStand = group(g, -2.6, 0, -2.1);
    cyl(examStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const examBook = decal(examStand, 0.32, 0.4, 0, 0.95, 0.02, paperFace("EXAMINATION BOOK", ["Entry: belt 3", "Last exam: per record", "Condition: per record"], { bg: "#e6dcf0", band: "#5a4470" }), { px: 256 });
    reg(hits, examBook, "exam-book");
    const examBoard = holoPanel(g, 0.6, 0.42, 2.6, 1.5, 1.6, (cx, w, h) => {
      cx.fillStyle = "#150f1a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8a6a9e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("BELT 3 — EXAM LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#efe6f4";
      ["Roller: ____", "Dust: ____", "CO / methane: ____", "Suppression: ____"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { accent: CFG_ACCENT, ry: -0.4 });
    reg(hits, examBoard, "exam-board");

    for (const [x, z] of [[-2.9, 2.4], [2.9, 2.2]]) cone(g, x, z);
    barrierPanel(g, 0, 2.7, { ry: 1.57, color: 0xf0b323 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "clean-dust") { dustPile.visible = false; }
        if (step.id === "lockout-belt") { discHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "free-roller") { stuckRoller.material = mat(0x6a747c, { rough: 0.4, metal: 0.55 }); smokeParticles.visible = false; }
        if (step.id === "guard-check") { guard.material = mat(0x59c97b, { opacity: 0.5, transparent: true, rough: 0.6 }); }
        if (step.id === "restart-belt") { discHandle.rotation.z = 0; lock.visible = false; }
        if (step.id === "final-walk") { misalign.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 0.5, rough: 0.5 }); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "co-alarm-trips") { stopBtn.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.4, rough: 0.4 }); }
        if (it.id === "roller-smokes") { smokeParticles.visible = true; manualPullHandle.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.0, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "co-alarm-trips") { stopBtn.material = mat(0xd2312b, { rough: 0.4 }); }
        if (it.id === "roller-smokes") { smokeParticles.visible = false; manualPullHandle.material = mat(0xd2312b, { rough: 0.5 }); }
      },
      animate(t, dt, session) {
        void dt;
        if (smokeParticles.visible) smokeParticles.userData.step?.(0.016, new THREE.Vector3(0, 0.9, 0.9), 0.1, 0.2, 0.4);
        for (const r of rollers) r.rotation.z += 0.03;
        headPulley.rotation.z += 0.03;
        tailPulley.rotation.z += 0.03;
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "co-monitor-check") repaint(coFace.userData.screen, signFace(gg.t >= 0.55 ? "CLEAR" : "ALARM", { bg: "#1a1208", accent: gg.t >= 0.55 ? "#59c97b" : "#f0645b", fg: "#f6ead6", scale: 0.5 }));
          if (step?.id === "methane-check") repaint(methFace.userData.screen, signFace(gg.t >= 0.55 ? "CLEAR" : "WITHDRAW", { bg: "#1a1208", accent: gg.t >= 0.55 ? "#59c97b" : "#f0645b", fg: "#f6ead6", scale: 0.45 }));
        }
        void t;
      },
    };
  },
};
