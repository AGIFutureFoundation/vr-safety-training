import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, lockTag, toolChest, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ CNC Cell VR — Manufacturing & Automation, station five.
// Setting up and running the first part on a vertical machining centre:
// the setup sheet, the machine stopped and the spindle locked before a hand
// goes in the envelope, workholding torqued to the fixture drawing, the tool
// measured and offset, a single-block dry run above the part, the door
// closed before cycle start, a first-article check, and chips cleared with
// a brush and a vacuum instead of an air hose and a bare hand.

const CC_ACCENT = 0x8fa9c4;

export const SIM_CNC_CELL = {
  id: "cnc-cell",
  index: "49",
  domain: "Manufacturing & Automation",
  trade: "CNC machinist — vertical machining centre",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "IAM and USW machinist locals; NIMS Machining Level I CNC Milling (setup, operation, programming); OSHA 29 CFR 1910.212 machine guarding and 1910.147 lockout/tagout; ANSI B11.22 safety requirements for turning and milling centres; OSHA 1910.242(b) limiting compressed air for cleaning",
  name: "CNC Cell",
  title: simTitle("CNC Cell"),
  tagline: "Machining centre setup and first part: setup sheet, spindle stopped and locked before the envelope, workholding torqued, tool measured and offset, single-block dry run above the part, door closed, first article measured, chips brushed not blown",
  accent: CC_ACCENT,
  accentCss: "#8fa9c4",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "first-article-good", name: "First Article Good", note: "A setup proven by a dry run and a first article inside tolerance, with nothing reaching into a live envelope — first time" },

  game: system({
    name: "Machine Shop",
    currency: "THOU",
    ranks: ["Apprentice", "Operator", "Setup Machinist", "Lead Machinist", "Machine Shop Certified"],
    badges: [
      { id: "locked-first", name: "Locked First", note: "Spindle stopped and locked before a hand went in the envelope, first time", test: AWARD.stepClean("lockout") },
      { id: "hands-clear", name: "Hands Clear", note: "Never in a live envelope, never a bare hand on chips, never air on a workpiece", test: AWARD.safe },
      { id: "on-tolerance", name: "On Tolerance", note: "Tool offset and first article both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Setup", note: "No corrections anywhere in the setup", test: AWARD.clean },
      { id: "steady-dry-run", name: "Steady Dry Run", note: "The single-block dry run held its feed the whole way", test: AWARD.unbroken },
      { id: "setup-fast", name: "Set In Time", note: "First article approved inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hand-in-envelope": "You reached into the work envelope with the spindle live. A machining centre restarts on a queued command and a tool at four thousand revolutions does not care what is in the way; the door interlock exists because hands are faster than judgement and slower than a spindle.",
    "air-hose-chips": "You blew the chips off with the air hose. Compressed air drives a chip through skin and into an eye, throws coolant mist into the air you are breathing, and packs swarf into the ways where it scores them.",
    "bare-hand-chips": "You pulled the chip nest off with a bare hand. Machining chips are a continuous razor at the temperature they came off the cut, and a stringer wrapped on a finger takes the finger with it if the spindle moves.",
    "cycle-door-open": "You pressed cycle start with the door open. The interlock is the only thing between the operator and a part that comes out of the vise at cutting speed; defeating it is the classic machine-shop fatality.",
  },

  lateNotes: {
    "cycle-start": "Cycle start comes after the dry run, the offsets and the door — a first cut on an unproven setup is the crash.",
    "tool-setter": "The tool is measured once it is in the spindle and the machine is safe to approach.",
    "micrometer": "The first article is measured after the first part is cut, not before.",
  },

  steps: [
    {
      id: "sheet", kind: "select", target: "setup-sheet",
      title: "Read the setup sheet",
      cue: "Check the part, the fixture, the tool list, the work offset and the first-article dimensions.",
      why: "The setup sheet is the contract between the programmer and the machinist. Everything measured, torqued or offset in this job is measured against a number on it.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["spindle-stop", "mode-manual", "spindle-lock"],
      itemNames: { "spindle-stop": "spindle stopped", "mode-manual": "mode to manual", "spindle-lock": "lock and tag" },
      title: "Make the machine safe to approach",
      cue: "Stop the spindle, take the machine out of auto to manual, then lock and tag.",
      why: "A stopped spindle is not a safe spindle while the control can still run a queued program. Manual mode and the lock are what make the envelope somewhere a hand can go.",
      outOfOrderNote: "Stop, then manual, then lock — the motion stops before the mode changes, and the lock goes on last.",
    },
    {
      id: "fixture", kind: "sequence",
      targets: ["fixture-seat", "fixture-bolts", "part-load"],
      itemNames: { "fixture-seat": "fixture seated on the table", "fixture-bolts": "fixture bolted and located", "part-load": "part loaded in the vise" },
      title: "Set the fixture and load the part",
      cue: "Seat the fixture on a clean table, bolt and locate it, then load the part in the vise.",
      why: "Everything downstream assumes the fixture has not moved. A chip under a fixture is a tenth of an inch of error on every part in the run.",
      outOfOrderNote: "Seat, then bolt, then load — the fixture is fixed before the part goes in it.",
    },
    {
      id: "torque", kind: "gauge", target: "torque-wrench",
      title: "Torque the workholding",
      cue: "Bring the vise to the torque on the fixture drawing and commit inside the band.",
      why: "Under-clamped, the part comes out of the vise at cutting speed. Over-clamped, thin-wall stock distorts and every dimension is wrong once the clamp is released.",
      gauge: { label: "CLAMP TORQUE", speed: 0.7, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 120)} ft·lb`, missNote: "Off the drawing's torque — a loose part is a projectile and a crushed one is scrap." },
    },
    {
      id: "tool", kind: "sequence", anyOrder: true,
      targets: ["tool-inspect", "tool-load"],
      itemNames: { "tool-inspect": "tool and holder inspected", "tool-load": "tool loaded in the spindle" },
      title: "Inspect and load the tool",
      cue: "Check the insert, the holder and the pull stud, then load the tool into the spindle.",
      why: "A cracked insert or a loose pull stud at spindle speed becomes shrapnel inside a sheet-metal enclosure that was never designed to stop it.",
    },
    {
      id: "offset", kind: "gauge", target: "tool-setter",
      title: "Measure the tool and set the offset",
      cue: "Touch the tool off on the setter and commit the length offset inside the band.",
      why: "The length offset is what tells the control where the tip of this tool is. Wrong by a tenth and the first move either cuts air or drives the tool through the fixture.",
      gauge: { label: "TOOL LENGTH", speed: 0.75, green: [0.46, 0.58], readout: (t) => `${(4 + t * 2).toFixed(4)} in`, missNote: "Offset outside the expected range — re-touch it off before anything moves under program." },
    },
    {
      id: "dryrun", kind: "track", target: "dry-run", seconds: 6,
      title: "Single-block dry run above the part",
      cue: "Run the program single-block at reduced feed with the tool held clear above the part.",
      why: "The dry run is where a wrong offset, a missed clamp or a rapid into the fixture shows up harmlessly. Every setup gets one, every time, and it is held above the part so a mistake costs nothing.",
      track: { start: 0.1, green: [0.32, 0.52], rise: 0.6, fall: 0.5, drift: 0.12, label: "FEED OVERRIDE", readout: (v) => (v < 0.32 ? "stopped" : v > 0.52 ? "too fast to react" : "single block, reduced") },
      holdBreakNote: "Feed override out of band — at that rate you cannot stop before a crash. Bring it back and hold.",
    },
    {
      id: "door", kind: "select", target: "machine-door",
      title: "Close the door",
      cue: "Close the enclosure door and confirm the interlock is made before cycle start.",
      why: "The enclosure is the guard. Closed and interlocked, it contains a part that comes loose; open, it is a window a part leaves through at the speed it was spinning.",
    },
    {
      id: "cycle", kind: "turn", target: "cycle-start",
      title: "Run the first part",
      cue: "Turn the control to auto and start the cycle, staying at the panel through the first part.",
      why: "The operator stays at the panel with a hand near the feed hold for the whole first part, because the first part is the one that finds the mistake the dry run missed.",
      turn: { turns: 0.5, axis: "z", label: "CYCLE START" },
    },
    {
      id: "firstarticle", kind: "gauge", target: "micrometer",
      title: "Measure the first article",
      cue: "Take the critical dimension with the micrometer and commit inside the drawing tolerance.",
      why: "The first article is what says the setup makes good parts. Nothing else in the run is measured until this one is signed off, because everything after it is a copy of it.",
      gauge: { label: "BORE DIA", speed: 0.75, green: [0.47, 0.57], readout: (t) => `${(1.246 + t * 0.012).toFixed(4)} in`, missNote: "Outside the drawing tolerance — adjust the offset and cut another before the run continues." },
    },
    {
      id: "chips", kind: "drag", target: "chip-brush",
      title: "Clear the chips properly",
      cue: "Take the brush and the chip vacuum to the nest on the table.",
      why: "A brush and a vacuum, never air and never a hand. That single habit is most of what separates a machinist with ten fingers from one without.",
      drag: { to: "chip-nest-socket", radius: 0.4, missNote: "Not on the nest — bring the brush down onto the chips on the table." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["coolant-low", "way-cover-torn"],
      itemNames: { "coolant-low": "coolant below the sight glass", "way-cover-torn": "torn way cover" },
      itemNotes: {
        "coolant-low": "The coolant sight glass is below minimum — the tool will burn and the chips will not clear.",
        "way-cover-torn": "The Z-axis way cover is split, which lets chips into the ways and scores them under load.",
      },
      title: "Walk the machine before the run",
      cue: "Check the coolant, the covers and the panel, and click anything that will not survive a full run.",
      why: "A production run is hours of unattended cutting. What is marginal at the first part is a failure by the hundredth.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CC_ACCENT);
    box(g, 5.6, 0.1, 4.8, 0, 0.05, 0, 0x4a4f55, { rough: 0.9 });
    for (let i = -3; i <= 3; i++) box(g, 0.04, 0.004, 4.6, i * 0.8, 0.101, 0, 0x3e434a, { rough: 0.95, cast: false });
    // The machining centre: enclosure, window, door, column, spindle, table.
    const mc = group(g, -0.5, 0.1, -1.2);
    box(mc, 3.0, 2.3, 2.0, 0, 1.15, 0, 0x6f7f90, { rough: 0.55, metal: 0.35 });
    box(mc, 3.1, 0.12, 2.1, 0, 2.32, 0, 0x5a6874, { rough: 0.6, metal: 0.4 });
    decal(mc, 1.1, 0.18, -0.6, 2.0, 1.01, signFace("VMC-4 · NIMS CELL", { bg: "#101a24", accent: "#8fa9c4", scale: 0.5 }));
    const door = group(mc, 0.7, 0, 1.0);
    const doorLeaf = box(door, 1.4, 1.7, 0.06, 0, 1.1, 0, 0x7d8d9d, { rough: 0.55, metal: 0.35 });
    const doorGlass = box(door, 1.1, 1.0, 0.03, 0, 1.25, 0.04, 0x9fd8ff, { emissive: 0x9fd8ff, ei: 0.18, rough: 0.2, cast: false });
    door.position.x = 0.7; door.rotation.y = -1.0;   // open to start
    holoTag(mc, "enclosure door and interlock", 0.7, 2.15, 1.05, { css: "#8fa9c4", w: 0.52 });
    reg(hits, door, "machine-door");
    // Inside: table, fixture, vise, part, spindle.
    const inside = group(mc, 0, 0.1, 0);
    const table = box(inside, 2.2, 0.12, 1.2, 0, 0.55, 0, 0x8b98a5, { rough: 0.45, metal: 0.6 });
    for (let i = -2; i <= 2; i++) box(inside, 0.05, 0.02, 1.15, i * 0.35, 0.62, 0, 0x5d6a76, { rough: 0.5, metal: 0.6, cast: false });
    const fixture = box(inside, 0.9, 0.16, 0.6, -0.1, 0.69, 0, 0x53606b, { rough: 0.5, metal: 0.5 });
    fixture.visible = false;
    const fixturePick = box(g, 0.9, 0.16, 0.6, 2.0, 0.6, 0.9, 0x53606b, { rough: 0.5, metal: 0.5 });
    holoTag(g, "fixture plate", 2.0, 0.82, 0.9, { css: "#8fa9c4", w: 0.26 });
    reg(hits, fixturePick, "fixture-seat");
    const bolts = [];
    for (const dx of [-0.45, 0.25]) { const b = cyl(inside, 0.03, 0.03, 0.08, dx, 0.8, 0, 0xdfe6ec, { rough: 0.4, metal: 0.8, seg: 10 }); b.visible = false; bolts.push(b); }
    const boltPick = box(g, 0.14, 0.06, 0.14, 2.0, 0.34, 0.9, 0xdfe6ec, { rough: 0.4, metal: 0.8 });
    holoTag(g, "fixture bolts", 2.0, 0.5, 0.9, { css: "#8fa9c4", w: 0.26 });
    reg(hits, boltPick, "fixture-bolts");
    const vise = group(inside, -0.1, 0.77, 0);
    box(vise, 0.7, 0.14, 0.35, 0, 0.07, 0, 0x2b6f88, { rough: 0.5, metal: 0.5 });
    const jaw = box(vise, 0.1, 0.22, 0.35, 0.28, 0.18, 0, 0x2b6f88, { rough: 0.5, metal: 0.5 });
    box(vise, 0.1, 0.22, 0.35, -0.3, 0.18, 0, 0x2b6f88, { rough: 0.5, metal: 0.5 });
    const part = box(vise, 0.4, 0.2, 0.28, 0, 0.2, 0, 0xc9a94f, { rough: 0.35, metal: 0.7 });
    part.visible = false;
    const partPick = box(g, 0.3, 0.16, 0.22, 2.0, 0.28, 0.2, 0xc9a94f, { rough: 0.35, metal: 0.7 });
    holoTag(g, "billet", 2.0, 0.46, 0.2, { css: "#8fa9c4", w: 0.16 });
    reg(hits, partPick, "part-load");
    const column = box(mc, 0.7, 2.0, 0.5, -1.0, 1.1, -0.7, 0x5a6874, { rough: 0.55, metal: 0.4 });
    const head = group(mc, -0.1, 1.72, -0.2);
    box(head, 0.55, 0.5, 0.5, 0, 0, 0, 0x5a6874, { rough: 0.55, metal: 0.45 });
    const spindle = cyl(head, 0.1, 0.1, 0.3, 0, -0.35, 0, 0xb9bec4, { rough: 0.35, metal: 0.85, seg: 16 });
    const tool = cyl(head, 0.05, 0.03, 0.34, 0, -0.62, 0, 0xdfe6ec, { rough: 0.3, metal: 0.9, seg: 12 });
    tool.visible = false;
    holoTag(head, "spindle", 0, 0.42, 0, { css: "#8fa9c4", w: 0.16 });
    void column; void spindle;
    const envelopeHit = box(mc, 1.6, 1.0, 1.0, 0, 1.2, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mc, "reach in now?", 0, 1.85, 0.4, { css: "#d2312b", w: 0.28 });
    reg(hits, envelopeHit, "hand-in-envelope");
    const chipNest = box(inside, 0.4, 0.06, 0.3, 0.6, 0.64, 0.3, 0xb9a06a, { rough: 0.9, metal: 0.5 });
    const chipSocket = box(inside, 0.4, 0.04, 0.3, 0.6, 0.7, 0.3, 0xffffff, { rough: 0.5 });
    chipSocket.visible = false; hits["chip-nest-socket"] = chipSocket;
    holoTag(inside, "chip nest", 0.6, 0.9, 0.3, { css: "#8fa9c4", w: 0.2 });
    const bareHand = box(inside, 0.3, 0.3, 0.3, 0.6, 0.85, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bareHand, "bare-hand-chips");
    // Control panel: e-stop, mode, spindle stop, lock, cycle start, feed override.
    const panel = group(g, 1.5, 0.1, -0.6, -0.7);
    box(panel, 0.65, 1.5, 0.35, 0, 0.9, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    box(panel, 0.5, 0.4, 0.04, 0, 1.35, 0.18, 0x14202a, { emissive: 0x9fd8ff, ei: 0.12, rough: 0.3, cast: false });
    const eStop = cyl(panel, 0.07, 0.07, 0.05, -0.18, 1.05, 0.18, 0xd2312b, { rough: 0.5, seg: 16 });
    holoTag(panel, "spindle stop", -0.18, 0.88, 0.22, { css: "#8fa9c4", w: 0.26 });
    reg(hits, eStop, "spindle-stop");
    const mode = cyl(panel, 0.05, 0.05, 0.04, 0.02, 1.05, 0.18, 0xf2c14b, { rough: 0.5, seg: 14 });
    holoTag(panel, "mode — manual", 0.02, 0.88, 0.22, { css: "#8fa9c4", w: 0.3 });
    reg(hits, mode, "mode-manual");
    const lock = lockTag(panel, 0.22, 1.05, 0.19, {});
    holoTag(panel, "lock and tag", 0.22, 0.88, 0.22, { css: "#8fa9c4", w: 0.26 });
    reg(hits, lock, "spindle-lock");
    const cycleBtn = cyl(panel, 0.06, 0.06, 0.05, 0.0, 0.7, 0.18, 0x2f7d4a, { rough: 0.5, seg: 16 });
    cycleBtn.rotation.x = Math.PI / 2;
    holoTag(panel, "cycle start", 0.0, 0.52, 0.22, { css: "#8fa9c4", w: 0.24 });
    reg(hits, cycleBtn, "cycle-start");
    const feed = instrument(panel, -0.2, 0.7, 0.18, { idle: "-- %", color: 0x8fa9c4, w: 0.12, d: 0.18 });
    holoTag(panel, "feed override / dry run", -0.2, 0.5, 0.22, { css: "#8fa9c4", w: 0.46 });
    reg(hits, feed, "dry-run");
    const doorOpenCycle = box(panel, 0.3, 0.3, 0.3, 0.32, 0.62, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "start with the door open?", 0.32, 0.36, 0.34, { css: "#d2312b", w: 0.5 });
    reg(hits, doorOpenCycle, "cycle-door-open");
    // Bench: setup sheet, torque wrench, tool holder, setter, micrometer, brush.
    const bench = group(g, -2.3, 0.1, 1.0, 0.5);
    box(bench, 1.5, 0.8, 0.6, 0, 0.4, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const sheet = decal(bench, 0.34, 0.44, -0.45, 0.815, 0, signFace("SETUP SHEET\nVMC-4 / OP 20", { bg: "#f2efe6", accent: "#2b6f88", fg: "#1b1e22", scale: 0.42 }));
    sheet.rotation.x = -Math.PI / 2;
    holoTag(bench, "setup sheet", -0.45, 1.02, 0, { css: "#8fa9c4", w: 0.26 });
    reg(hits, sheet, "setup-sheet");
    const torque = instrument(bench, -0.05, 0.84, 0, { idle: "-- ft·lb", color: 0x8fa9c4, w: 0.13, d: 0.2 });
    holoTag(bench, "torque wrench", -0.05, 1.04, 0, { css: "#8fa9c4", w: 0.3 });
    reg(hits, torque, "torque-wrench");
    const holder = group(bench, 0.4, 0.86, 0.1);
    cyl(holder, 0.07, 0.05, 0.18, 0, 0.09, 0, 0xb9bec4, { rough: 0.35, metal: 0.85, seg: 14 });
    cyl(holder, 0.03, 0.03, 0.12, 0, -0.04, 0, 0xdfe6ec, { rough: 0.3, metal: 0.9, seg: 10 });
    holoTag(bench, "tool and holder", 0.4, 1.08, 0.1, { css: "#8fa9c4", w: 0.32 });
    reg(hits, holder, "tool-inspect");
    const loadHit = box(bench, 0.2, 0.3, 0.2, 0.62, 0.95, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "load to spindle", 0.62, 1.16, 0.1, { css: "#8fa9c4", w: 0.32 });
    reg(hits, loadHit, "tool-load");
    const setter = group(g, -0.1, 0.1, -0.4);
    cyl(setter, 0.09, 0.11, 0.18, 0, 0.62, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 16 });
    const setterRead = instrument(setter, 0.3, 0.6, 0, { idle: "-.---- in", color: 0x8fa9c4, w: 0.13, d: 0.2, ry: -0.4 });
    holoTag(setter, "tool setter", 0, 0.9, 0, { css: "#8fa9c4", w: 0.24 });
    reg(hits, setter, "tool-setter");
    const mic = instrument(bench, 0.66, 0.84, -0.18, { idle: "-.---- in", color: 0x8fa9c4, w: 0.13, d: 0.2 });
    holoTag(bench, "micrometer", 0.66, 0.62, -0.22, { css: "#8fa9c4", w: 0.24 });
    reg(hits, mic, "micrometer");
    const brush = group(g, -1.6, 0.1, 0.0, 0.3);
    box(brush, 0.3, 0.05, 0.08, 0, 0.5, 0, 0xb8853a, { rough: 0.9 });
    box(brush, 0.22, 0.05, 0.1, -0.05, 0.45, 0, 0x2b2f34, { rough: 0.95 });
    cyl(brush, 0.11, 0.11, 0.3, 0.25, 0.25, 0, 0x2b6f88, { rough: 0.6, seg: 14 });
    holoTag(brush, "brush and chip vacuum", 0, 0.75, 0, { css: "#8fa9c4", w: 0.48 });
    reg(hits, brush, "chip-brush");
    const airHose = group(g, 2.2, 0.1, -1.6);
    cyl(airHose, 0.02, 0.02, 0.6, 0, 0.9, 0, 0x2b2f34, { rough: 0.7, seg: 8 });
    box(airHose, 0.08, 0.06, 0.16, 0, 1.25, 0, 0x8b98a5, { rough: 0.5, metal: 0.6 });
    holoTag(airHose, "blow them off?", 0, 1.5, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, airHose, "air-hose-chips");
    // Coolant tank with a sight glass, way cover, chips and mist.
    const tank = group(mc, -1.2, 0.1, 0.9);
    box(tank, 0.5, 0.6, 0.5, 0, 0.3, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    const sight = box(tank, 0.05, 0.3, 0.03, 0.26, 0.32, 0, 0x2b6f88, { rough: 0.2, opacity: 0.7, transparent: true });
    const lowMark = box(tank, 0.07, 0.02, 0.04, 0.27, 0.28, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.7, rough: 0.5, cast: false });
    holoTag(tank, "coolant sight glass", 0, 0.75, 0, { css: "#8fa9c4", w: 0.42 });
    reg(hits, sight, "coolant-low");
    void lowMark;
    const wayCover = box(mc, 0.6, 0.04, 0.8, -0.8, 0.72, 0.2, 0x8b98a5, { rough: 0.5, metal: 0.6 });
    const tear = box(mc, 0.18, 0.05, 0.1, -0.8, 0.74, 0.35, 0x14181c, { rough: 0.9 });
    holoTag(mc, "way cover", -0.8, 0.95, 0.35, { css: "#8fa9c4", w: 0.2 });
    reg(hits, tear, "way-cover-torn");
    void wayCover;
    const mist = particles(g, 40, 0xcfe0ee, { size: 0.025, life: 0.8, additive: false, opacity: 0.3 });
    // Chest, sheet board, machinist.
    toolChest(g, 2.3, 1.8, { ry: -0.6 });
    const board = group(g, -0.4, 0, 2.1, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0e1a24"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#8fa9c4"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8e6f2"; ctx.fillText("JOB 4412 — OP 20, VMC-4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eaf3fa";
      ["Fixture: F-221, bolt to T-slots 3 and 6", "Vise torque: 70 ft·lb per the drawing", "Tool 4: 1/2 in 4-flute, length offset H04", "Dry run single block, feed 25%, above part", "First article: bore 1.2500 +0.0015 / -0.0005", "Chips: brush and vacuum only, never air", "Door interlock made before every cycle start"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: CC_ACCENT });
    reg(hits, board, "job-board");
    const machinist = standingFigure(g, 1.1, 1.4, { ry: 2.7, cloth: 0x37505f });
    holoTag(machinist, "machinist", 0, 1.9, 0, { css: "#8fa9c4", w: 0.2 });

    let running = false, doorShut = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.1, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fixture") { fixture.visible = true; for (const b of bolts) b.visible = true; part.visible = true; fixturePick.visible = false; boltPick.visible = false; partPick.visible = false; }
        if (step.id === "tool") { tool.visible = true; holder.visible = false; }
        if (step.id === "door") { doorShut = true; door.rotation.y = 0; }
        if (step.id === "cycle") running = true;
        if (step.id === "chips") { brush.parent.remove(brush); inside.add(brush); brush.position.set(0.6, 0.72, 0.3); brush.rotation.set(0, 0, 0); chipNest.visible = false; }
        if (step.id === "walk") tear.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "fixture") { if (session.sequence.includes("fixture-seat")) { fixture.visible = true; fixturePick.visible = false; } if (session.sequence.includes("fixture-bolts")) { for (const b of bolts) b.visible = true; boltPick.visible = false; } }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "torque") repaint(torque.userData.screen, signFace(`${Math.round(gg.t * 120)}`, { bg: "#0e1a24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eaf3fa", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "offset") repaint(setterRead.userData.screen, signFace(`${(4 + gg.t * 2).toFixed(3)}`, { bg: "#0e1a24", accent: gg.t >= 0.46 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#eaf3fa", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "firstarticle") repaint(mic.userData.screen, signFace(`${(1.246 + gg.t * 0.012).toFixed(4)}`, { bg: "#0e1a24", accent: gg.t >= 0.47 && gg.t <= 0.57 ? "#59c97b" : "#f2ae14", fg: "#eaf3fa", scale: 0.56 }));
        if (step?.id === "dryrun" && session.holding) { head.position.y = 1.72 + Math.sin(t * 1.2) * 0.06; repaint(feed.userData.screen, signFace(`${Math.round(session.track.v * 100)} %`, { bg: "#0e1a24", accent: session.track.v >= 0.32 && session.track.v <= 0.52 ? "#59c97b" : "#f2ae14", fg: "#eaf3fa", scale: 0.62 })); }
        if (session?.turn && step?.id === "cycle") cycleBtn.rotation.z = session.turn.amount * Math.PI;
        if (running && doorShut) { tool.rotation.y = t * 30; head.position.y = 1.55 + Math.sin(t * 2.4) * 0.08; mist.visible = true; mist.userData.step(dt, new THREE.Vector3(-0.5, 1.0, -1.2), 0.25, 0.2, 0.1); }
        else if (mist.visible) mist.visible = false;
        doorGlass.material.emissiveIntensity = running ? 0.3 : 0.18;
        void doorLeaf; void jaw; void table;
      },
    };
  },
};
