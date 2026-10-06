import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, paintedSteelFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pit Work and Buffer Inspection VR — IUEC elevator
// constructors, periodic maintenance. The pit is the one part of a hoistway
// most passengers will never see and most mechanics visit constantly: a
// confined, low-ceiling space with a counterweight running down one wall of
// it, and the two devices — spring and oil buffers — that are only ever
// asked to do their job on the single worst day this car ever has. This
// station tests both buffers on their own terms rather than assuming a buffer
// that looks intact still performs to its rating.

const EWPWB_ACCENT = 0x27ae60;

/** Wet pit floor: dark concrete with damp patches and a faint sheen. */
function ewpwbPitFloorFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#22282b"], [1, o.base2 ?? "#1a2023"]], { radial: true });
  noiseTexture(g, w, h, { density: 2600, alpha: 0.09, tone: "0,0,0" });
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 30 + Math.random() * 60;
    g.fillStyle = "rgba(60,90,100,0.12)";
    try { g.beginPath(); g.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2); g.fill(); } catch { g.fillRect(x - r, y - r * 0.6, r * 2, r * 1.2); }
  }
  grimeOverlay(g, w, h, { blotches: 3, streaks: 3, tone: "10,16,10", alpha: 0.16 });
}

/** Hazard-stripe marking for the refuge space wall: black/yellow chevrons. */
function ewpwbStripeFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, "#f2c14b"], [1, "#e0a93a"]]);
  const n = o.stripes ?? 8;
  for (let i = 0; i < n; i++) { if (i % 2 === 0) { g.fillStyle = "#181a1c"; g.fillRect(i * w / n, 0, w / n, h); } }
  noiseTexture(g, w, h, { density: 800, alpha: 0.05, tone: "0,0,0" });
}

export const SIM_EW_PIT_WORK_AND_BUFFER_INSPECTION = {
  id: "ew-pit-work-and-buffer-inspection",
  index: "354",
  domain: "Facilities",
  trade: "Elevator constructor / mechanic — IUEC",
  category: "Building Systems & Facilities",
  indoor: "service",
  weather: "wind",
  certification: "IUEC elevator constructors; NEIEP apprenticeship curriculum for pit and buffer maintenance; ASME A17.1 the safety code for elevators and escalators, whose buffer provisions this test is run against; OSHA 29 CFR 1910.147 control of hazardous energy for the sump pump circuit; OSHA 29 CFR 1910.23 ladders, for the fixed pit access ladder",
  name: "Pit Work and Buffer Inspection",
  title: simTitle("Pit Work and Buffer Inspection"),
  tagline: "A full pit service: refuge space, ladder, sump pump, spring and oil buffer testing, and counterweight runby, logged before anyone climbs back out",
  accent: EWPWB_ACCENT,
  accentCss: "#27ae60",
  parSeconds: 250,
  footprint: 2.2,
  badge: { id: "pit-cleared", name: "Pit Cleared", note: "Both buffers proven, runby measured and the refuge space kept clear the whole visit" },

  game: system({
    name: "Pit Authority",
    currency: "RUNBY",
    ranks: ["Pit Hand", "Pit Mechanic", "Adjuster", "Lead Mechanic", "Pit Authority Certified"],
    badges: [
      { id: "switch-first", name: "Switch First", note: "Never entered the pit before the stop switch was confirmed", test: AWARD.stepClean("pit-switch") },
      { id: "both-buffers", name: "Both Buffers", note: "Held both buffer readings and the runby reading near band centre", test: AWARD.precise(0.7) },
      { id: "clean-exit", name: "Clean Exit", note: "Restored in the correct order, no correction", test: AWARD.stepClean("exit-restore") },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ladder-held", name: "Ladder Held", note: "Never let the ladder latch slip while deploying it", test: AWARD.unbroken },
      { id: "pit-fast", name: "Pit Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "buffer-pinch-point": "You reached into the gap between the oil buffer's plunger and its striker plate while the compression test was running. That gap is exactly wide enough for a hand and exactly where a buffer under test closes to, which is the one place on this device a mechanic's fingers do not belong while it is being tested.",
    "blocked-refuge-space": "You are looking at a refuge space with material stacked in it. That recess exists so a mechanic caught in the pit when a car or counterweight starts moving has one specific place to stand that both stay clear of — stacking parts in it removes the only shelter this pit has.",
    "energized-sump-pump": "You opened the sump pump's junction box without confirming its circuit was isolated. A pit sump sits in standing water by design, and a live junction box in a wet pit is a shock hazard in the one place on this job site where a mechanic is most likely to be standing in that water.",
    "unconfirmed-runby-zone": "You put the tape measure into the counterweight's runby without reconfirming the pit stop switch was still holding. A switch confirmed on the way in can still be knocked off its detent by a tool bag or a shoulder brushing past it, and the runby is exactly where that failure would first show up.",
  },

  lateNotes: {
    "spring-buffer": "Buffer readings are only taken once the pit stop switch is confirmed and the refuge space is clear.",
    "oil-can": "The buffer is only topped up after its stroke has already been measured, not before.",
  },

  supportLine: "your IUEC local's member assistance programme, or the NEIEP training coordinator for anything about the certification record",

  steps: [
    {
      id: "checkin", kind: "select", target: "job-ticket",
      title: "Check in at the pit access door",
      cue: "Read the job ticket and confirm which shaft's pit this door actually opens onto.",
      why: "Some buildings put two or three pit access doors within a few steps of each other, one per shaft, and the ticket is read here rather than assumed because a mechanic who climbs down the wrong ladder has just put themselves in a hoistway nobody isolated for them.",
    },
    {
      id: "permit", kind: "select", target: "landing-permit",
      title: "Post the pit-entry permit",
      cue: "Read the permit and confirm the landing above is barricaded before the ladder comes down.",
      why: "The permit is what tells the next person at that landing, before they ever press a call button, that somebody is working underneath them. A pit entered without that signage posted is a pit entered on the assumption that nobody upstairs will do anything unexpected, which is not an assumption this job is built to need.",
    },
    {
      id: "ladder-release", kind: "turn", target: "ladder-latch",
      title: "Deploy the pit ladder",
      cue: "Turn the release wheel to lower the fixed pit ladder to its working position.",
      why: "A stowed pit ladder is folded up against the wall specifically so it is out of the counterweight's path when nobody is using it, and the release wheel is turned all the way rather than partway so the ladder locks fully into its working position before any weight goes on it.",
      turn: { turns: 0.3, axis: "z", label: "LADDER RELEASE" },
    },
    {
      id: "pit-switch", kind: "select", target: "pit-stop-switch",
      title: "Engage the pit stop switch",
      cue: "Confirm the pit stop switch is ON before committing any weight to the ladder.",
      why: "This switch is reached from the landing, before the ladder is trusted, because it is the one control a mechanic can watch with their own eyes while they climb down underneath a counterweight that a machine room two floors away is not the thing keeping still today.",
    },
    {
      id: "pit-entry", kind: "select", target: "pit-ladder",
      title: "Descend into the pit",
      cue: "Climb down the ladder facing it, now that the switch is confirmed.",
      why: "Down the ladder, facing it, with the pit light already on — never stepped down onto a buffer or dropped the last part of the way. A pit is a low, cluttered space with a counterweight running down one side of it, and the way in is the way the ladder provides, not the fast way.",
    },
    {
      id: "pit-inspect", kind: "find", noHint: true,
      targets: ["corroded-rung", "pit-debris", "dim-pit-light"],
      itemNames: { "corroded-rung": "a corroded ladder rung", "pit-debris": "debris left on the pit floor", "dim-pit-light": "a pit light that is failing" },
      itemNotes: {
        "corroded-rung": "A corroded rung fails exactly when someone puts their full weight on it climbing out in a hurry, which is the one moment nobody wants to discover it.",
        "pit-debris": "Anything loose on the pit floor is a trip hazard in a space with almost no room to fall safely and a counterweight running down one wall of it.",
        "dim-pit-light": "A failing pit light is how a mechanic ends up reading a buffer gauge, or the runby tape, by phone flashlight — which is how small mistakes in a pit stay unnoticed.",
      },
      title: "Walk the pit before touching the buffers",
      cue: "Look over the ladder, the floor and the lighting. Three things need fixing before this pit is signed off.",
      why: "A pit inspection is a search for what has quietly changed since the last visit, not a checklist read from the ladder. Everything down here matters most on the day something else has already gone wrong, so it gets looked at properly on every ordinary day in between.",
    },
    {
      id: "spring-buffer", kind: "gauge", target: "spring-buffer",
      title: "Measure the spring buffer compression",
      cue: "Load the spring buffer and commit the compression reading inside the manufacturer's rated band.",
      why: "A spring buffer that looks fine sitting still can still be weak, corroded internally or simply the wrong spring for this car's rated speed — none of which shows until it is loaded and measured against the number on the manufacturer's own chart.",
      gauge: {
        label: "SPRING COMPRESSION", speed: 0.6, green: [0.4, 0.6],
        readout: (t) => `${Math.round(t * 180)} mm`,
        missNote: "Outside the rated band. Flag the buffer for replacement before this car goes back in service on it.",
      },
    },
    {
      id: "sump-pump", kind: "select", target: "sump-pump",
      title: "Test the sump pump",
      cue: "Trip the sump pump's test switch and confirm it starts, runs and shuts off correctly.",
      why: "A sump pump that has not moved water in months can seize, and the only way to know before the pit actually floods is to run it under controlled conditions today, on a circuit already confirmed protected, rather than wait for the day water is actually rising in it.",
    },
    {
      id: "oil-buffer", kind: "gauge", target: "oil-buffer",
      title: "Measure the oil buffer stroke",
      cue: "Run the plunger through its stroke and commit the reading inside the rated band.",
      why: "An oil buffer's whole job is metering fluid through an orifice at a controlled rate as the plunger compresses, and a stroke that is too short or too long usually means the oil level or the orifice itself is wrong — a fault that a buffer sitting still, looking full, gives no sign of at all.",
      gauge: {
        label: "BUFFER STROKE", speed: 0.55, green: [0.45, 0.65],
        readout: (t) => `${Math.round(t * 220)} mm`,
        missNote: "Outside the rated stroke. Check the oil level and the orifice before this buffer is trusted again.",
      },
    },
    {
      id: "runby-measure", kind: "gauge", target: "runby-tape",
      title: "Measure the counterweight runby",
      cue: "Reconfirm the pit stop switch, then run the tape and commit the runby reading inside the code minimum.",
      why: "Runby is the clearance the counterweight still has to travel before it would strike the buffer beneath it, and a car that has stretched its ropes over time, or been releveled without the runby being rechecked, can quietly lose that margin. It is measured on this visit rather than trusted from the last one.",
      gauge: {
        label: "COUNTERWEIGHT RUNBY", speed: 0.6, green: [0.38, 0.58],
        readout: (t) => `${Math.round(150 + t * 250)} mm`,
        missNote: "Below the code minimum. This gets written up and escalated before the car runs again, not adjusted on the spot.",
      },
    },
    {
      id: "oil-top-up", kind: "drag", target: "oil-can",
      title: "Top up the oil buffer",
      cue: "Carry the buffer oil can to the reservoir fill point and top it up to the mark.",
      why: "The buffer's stroke is only correct at the oil level the manufacturer rated it for, and topping it up now, with the stroke already measured and written down, means the next reading anyone takes off this buffer is a true one rather than one skewed by a top-up nobody logged.",
      drag: { to: "oil-buffer-fill", radius: 0.4, missNote: "Not at the fill point. Oil poured anywhere else on the buffer body does nothing for the reservoir and leaves a slip hazard on the pit floor." },
    },
    {
      id: "exit-restore", kind: "sequence",
      targets: ["sump-pump", "pit-stop-switch", "ladder-latch"],
      itemNames: { "sump-pump": "sump pump test switch", "pit-stop-switch": "pit stop switch", "ladder-latch": "ladder release latch" },
      title: "Close out the pit in the correct order",
      cue: "Confirm the sump pump is back in automatic, release the pit stop switch once you are clear of the ladder, then stow the ladder.",
      why: "Automatic mode on the pump is restored before anything else because a pit left in test mode is a pit a rising sump has no pump answering it. The pit switch is released only once every mechanic is actually up the ladder and clear, and the ladder is stowed last because it is the one thing confirming nobody is still down there.",
      outOfOrderNote: "Wrong order — pump back to automatic first, then the pit switch once you are clear, and the ladder stowed last.",
    },
    {
      id: "log", kind: "select", target: "pit-log",
      title: "Log the pit service",
      cue: "Write the buffer readings, the runby measurement and today's findings on the pit log.",
      why: "The next mechanic to open this pit door reads this log before they read the buffers themselves, and a runby number that goes unwritten today is a number somebody else has to remeasure from zero the next time this pit is due.",
    },
  ],

  interrupts: [
    {
      id: "sump-alarm",
      kind: "High-water alarm",
      after: "spring-buffer", delay: 4, seconds: 12,
      alert: "The sump's high-water alarm has just tripped while you are still at the buffers, and the pit floor is starting to take on water.",
      cue: "Get to the pump before the water reaches the buffers.",
      target: "sump-pump",
      why: "A tripped high-water alarm means the pump has already fallen behind whatever is coming into this pit, and the buffers, the ladder base and anything left on the floor are all at the same low point the water is heading for. The pump gets attention before the buffer test resumes, not after.",
      missNote: "The water kept rising with nobody at the pump. A flooded pit does not just risk the equipment in it — it turns the pit floor into a shock hazard around anything still carrying power.",
      wrongNote: "It is the sump pump. Whatever the buffer reading was about to show, the rising water is the more urgent problem.",
    },
    {
      id: "ladder-closing",
      kind: "Ladder being stowed",
      after: "oil-buffer", delay: 4, seconds: 11,
      alert: "Somebody at the landing above has started turning the release wheel to stow the pit ladder, with you still down here.",
      cue: "Stop them — that is your only way out.",
      target: "ladder-latch",
      why: "The pit ladder is the one exit this space has, and whoever is turning that wheel from the landing has no way of seeing that anyone is still standing at the bottom of it. It gets stopped before the ladder folds any further, not after it is already halfway up.",
      missNote: "The ladder kept folding with a mechanic still in the pit. A pit with no ladder down is a pit with no way out short of somebody upstairs noticing and reversing it.",
      wrongNote: "It is the ladder release latch. Whatever else is happening, your way out of this pit is the emergency.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, EWPWB_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => ewpwbPitFloorFace(cx, w, h, {}), { repeat: 3, px: 320 });
    const floor = box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x22282b, { rough: 0.8, metal: 0.1 });
    floor.material = texturedMat(floorTex, { rough: 0.75, metal: 0.1, color: 0x22282b });

    // ---------------------------------------------------------- the pit shaft
    const shaft = group(g, 0, 0, -1.2);
    const pitR = 0.75;
    cyl(shaft, pitR, pitR, 1.9, 0, -0.95, 0, 0x14181e, { rough: 0.95, seg: 26, open: true, side: 2, cast: false });
    const pitFloor = cyl(shaft, pitR, pitR, 0.03, 0, -1.88, 0, 0x101318, { rough: 0.9, seg: 24, cast: false });
    void pitFloor;

    // Steel frame for the guide rail and buffer mounts, painted structural steel.
    const frameTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#2d5a45", base2: "#264c3a" }), { repeat: 1, px: 320 });
    const frame = box(shaft, 0.16, 1.7, 0.16, 0.5, -1.0, -0.4, 0x2d5a45, { rough: 0.55, metal: 0.4 });
    frame.material = frameTex ? texturedMat(frameTex, { rough: 0.5, metal: 0.4, color: 0x2d5a45 }) : frame.material;

    // Fixed pit ladder with a release wheel at the top.
    const ladder = group(shaft, 0, 0, -pitR + 0.06);
    ladder.rotation.x = -0.4;
    for (const sx of [-1, 1]) cyl(ladder, 0.015, 0.015, 1.8, sx * 0.15, -0.95, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
    const rungs = [];
    for (let i = 0; i < 6; i++) {
      const r = cyl(ladder, 0.011, 0.011, 0.3, 0, -0.15 - i * 0.29, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
      r.rotation.z = Math.PI / 2;
      rungs.push(r);
    }
    reg(hits, ladder, "pit-ladder");
    rungs[2].material = mat(0x7a5a3a, { rough: 0.85, metal: 0.3 });
    reg(hits, rungs[2], "corroded-rung");
    const latchWheel = group(shaft, 0.2, 0.75, -pitR + 0.08, 0.3);
    torus(latchWheel, 0.07, 0.014, 0, 0, 0, 0xd8b23a, { rough: 0.5, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(latchWheel, "Ladder release", 0, 0.12, 0, { css: "#27ae60", w: 0.32 });
    reg(hits, latchWheel, "ladder-latch");

    // Refuge space: a marked recess in the wall, kept clear.
    const stripeTex = surfaceTexture((cx, w, h) => ewpwbStripeFace(cx, w, h, {}), { repeat: 2, px: 128 });
    const refuge = group(shaft, -0.5, 0, 0.5, 0.4);
    const refugeBack = box(refuge, 0.4, 0.6, 0.06, 0, -1.55, 0, 0xf2c14b, { rough: 0.55 });
    refugeBack.material = texturedMat(stripeTex, { rough: 0.6, metal: 0.02, color: 0xf2c14b });
    holoTag(refuge, "Refuge space — keep clear", 0, -1.2, 0, { css: "#27ae60", w: 0.5 });
    reg(hits, refuge, "refuge-space");
    const refugeClutter = box(refuge, 0.2, 0.15, 0.1, 0.05, -1.75, 0.05, 0x8a5a34, { rough: 0.7 });
    reg(hits, refugeClutter, "blocked-refuge-space");

    // Debris and pit light.
    const debris = box(shaft, 0.12, 0.03, 0.09, 0.3, -1.83, 0.3, 0x6a5a3a, { rough: 0.8 });
    reg(hits, debris, "pit-debris");
    const pitLight = group(shaft, -0.4, 0.8, 0.3);
    ball(pitLight, 0.05, 0, 0, 0, 0xf2e6b8, { emissive: 0xf2e6b8, ei: 0.9 });
    holoTag(pitLight, "Pit light", 0, 0.1, 0, { css: "#27ae60", w: 0.26 });
    reg(hits, pitLight, "dim-pit-light");

    // Sump pit with pump and a junction box hazard marker.
    const sump = group(shaft, -0.45, -1.85, -0.35);
    cyl(sump, 0.16, 0.16, 0.06, 0, 0.03, 0, 0x1b2126, { rough: 0.6, metal: 0.3, seg: 16 });
    const sumpWater = particles(sump, 20, 0x4fa3ff, { size: 0.014, life: 0.5, additive: false, opacity: 0.5 });
    const pumpBody = cyl(sump, 0.05, 0.05, 0.14, 0, 0.1, 0, 0x53585e, { rough: 0.5, metal: 0.5, seg: 12 });
    const pumpLamp = ball(sump, 0.014, 0.06, 0.17, 0, 0xd8232a, { emissive: 0xd8232a, ei: 1.4 });
    holoTag(sump, "Sump pump", 0, 0.24, 0, { css: "#27ae60", w: 0.3 });
    reg(hits, pumpBody, "sump-pump");
    const junctionBox = box(sump, 0.06, 0.08, 0.04, 0.14, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    reg(hits, junctionBox, "energized-sump-pump");

    // Counterweight, parked low, with the runby zone marked at its base.
    const cwt = group(shaft, 0.35, 0, -0.15);
    for (const sx of [-1, 1]) cyl(cwt, 0.01, 0.01, 1.7, sx * 0.09, -1.0, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    for (let i = 0; i < 5; i++) box(cwt, 0.2, 0.09, 0.14, 0, -1.8 + i * 0.1, 0, 0x545e67, { rough: 0.55, metal: 0.4 });
    const runbyMarker = box(shaft, 0.3, 0.2, 0.3, 0.35, -1.7, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(runbyMarker, "Runby — confirm switch first", 0, 0.16, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, runbyMarker, "unconfirmed-runby-zone");
    const runbyTape = instrument(shaft, 0.6, -1.4, -0.3, { ry: 0.4, idle: "-- mm", color: 0x27ae60 });
    holoTag(runbyTape, "Runby tape", 0, 0.16, 0, { css: "#27ae60", w: 0.3 });
    reg(hits, runbyTape, "runby-tape");

    // Spring buffer and oil buffer, side by side on the pit floor.
    const springBuf = group(shaft, -0.1, -1.86, 0.1);
    cyl(springBuf, 0.05, 0.05, 0.02, 0, 0.01, 0, 0x53585e, { rough: 0.5, metal: 0.5, seg: 14 });
    for (let i = 0; i < 6; i++) torus(springBuf, 0.03, 0.008, 0, 0.02 + i * 0.03, 0, 0xd8232a, { rough: 0.5, seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
    holoTag(springBuf, "Spring buffer", 0, 0.28, 0, { css: "#27ae60", w: 0.32 });
    reg(hits, springBuf, "spring-buffer");

    const oilBuf = group(shaft, 0.2, -1.86, 0.3);
    cyl(oilBuf, 0.07, 0.07, 0.32, 0, 0.16, 0, 0x8b929a, { rough: 0.45, metal: 0.6, seg: 16 });
    const plunger = cyl(oilBuf, 0.025, 0.025, 0.14, 0, 0.4, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 });
    void plunger;
    const striker = box(oilBuf, 0.14, 0.02, 0.14, 0, 0.47, 0, 0x53585e, { rough: 0.5, metal: 0.5 });
    void striker;
    const pinchGap = box(oilBuf, 0.06, 0.04, 0.06, 0, 0.43, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(oilBuf, "Oil buffer", 0, 0.55, 0, { css: "#27ae60", w: 0.28 });
    reg(hits, oilBuf, "oil-buffer");
    reg(hits, pinchGap, "buffer-pinch-point");
    const fillCap = cyl(oilBuf, 0.02, 0.02, 0.03, 0.05, 0.33, 0, 0xd8b23a, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, fillCap, "oil-buffer-fill");

    // Oil can staged on a small wood-grain pallet.
    const oilCan = group(g, 1.6, 0.1, 1.1);
    cyl(oilCan, 0.045, 0.05, 0.16, 0, 0.08, 0, 0xe0a93a, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(oilCan, "Buffer oil", 0, 0.2, 0, { css: "#27ae60", w: 0.26 });
    reg(hits, oilCan, "oil-can");

    // ------------------------------------------------------------ pit switch
    const pitSwitch = group(g, -0.9, 0, 0.9, 0.2);
    box(pitSwitch, 0.14, 0.18, 0.08, 0, 0.65, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const pitLever = box(pitSwitch, 0.035, 0.09, 0.035, 0, 0.73, 0.03, 0xd8232a, { rough: 0.5 });
    const pitLamp = ball(pitSwitch, 0.016, 0, 0.79, 0.05, 0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
    decal(pitSwitch, 0.11, 0.04, 0, 0.55, 0.041, signFace("PIT STOP", { accent: "#27ae60", scale: 0.5 }), { px: 128 });
    holoTag(pitSwitch, "Pit stop switch", 0, 0.85, 0, { css: "#27ae60", w: 0.32 });
    reg(hits, pitSwitch, "pit-stop-switch");

    // -------------------------------------------------------------- docs + tools
    const chest = toolChest(g, 1.6, -0.6, { ry: -0.6, color: 0x27ae60 });
    const gaugeTool = instrument(chest, -0.06, 0.79, 0.02, { ry: 0.3, idle: "-- mm", color: 0x27ae60 });
    holoTag(gaugeTool, "Buffer gauge", 0, 0.16, 0, { css: "#27ae60", w: 0.28 });
    reg(hits, gaugeTool, "spring-buffer-gauge-tool");

    const ticket = holoPanel(g, 0.5, 0.36, -1.9, 1.4, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#27ae60"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9f2d8"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB TICKET — SHAFT 2 PIT", w * 0.06, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#bfe8cf";
      ["Buffer test + runby", "Sump pump function test", "Refuge space kept clear"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.4 + i * 0.16)));
    }, { ry: 0.5, accent: 0x27ae60 });
    reg(hits, ticket, "job-ticket");

    const permitPanel = holoPanel(g, 0.56, 0.4, -0.7, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#27ae60"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c9f2d8"; ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PIT ENTRY PERMIT EW-19", w * 0.06, h * 0.14);
      ctx.fillStyle = "#dff7e6"; ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SHAFT 2 — PIT SERVICE", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#cdeed9";
      ["Landing above: barricaded", "Buffers: spring + oil, both tested", "Runby: code minimum or better", "Log before sign-off"].forEach((line, i) =>
        ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.3, accent: 0x27ae60 });
    reg(hits, permitPanel, "landing-permit");

    const logPanel = holoPanel(g, 0.5, 0.34, 1.9, 1.4, -0.8, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#27ae60"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#dff7e6"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("PIT LOG — SHAFT 2", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cdeed9";
      cx.fillText("Buffer readings, runby,", w * 0.06, h * 0.48);
      cx.fillText("findings this visit", w * 0.06, h * 0.68);
    }, { ry: -0.6, accent: 0x27ae60 });
    reg(hits, logPanel, "pit-log");

    // A second mechanic at the landing above, who eventually reaches for the
    // ladder release without checking the pit first.
    const topHand = standingFigure(g, 2.2, 1.6, { ry: 2.6, cloth: 0x37505f, helmet: 0x27ae60, vest: 0xe4dc3a });
    holoTag(topHand, "landing mechanic", 0, 1.95, 0, { css: "#27ae60", w: 0.38 });

    let ladderDeployed = false, pitSwitchOn = false, pumpAuto = true;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "ladder-release") { ladderDeployed = true; ladder.rotation.x = 0; }
        if (step.id === "pit-switch") { pitSwitchOn = true; pitLever.rotation.x = -1.0; pitLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 }); }
        if (step.id === "sump-pump") { pumpAuto = false; pumpLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "exit-restore") {
          pumpAuto = true; pumpLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.4 });
          pitSwitchOn = false; pitLever.rotation.x = 0; pitLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
          ladderDeployed = false; latchWheel.rotation.x = 0;
        }
      },

      onInterrupt(it) {
        if (it.id === "sump-alarm") { pumpLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.2 }); sumpWater.visible = true; }
        if (it.id === "ladder-closing") { ladder.rotation.x = 0.35; latchWheel.rotation.z += 0.8; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sump-alarm") pumpLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
        if (it.id === "ladder-closing") { ladder.rotation.x = 0; latchWheel.rotation.z -= 0.8; }
      },

      animate(t, dt, session) {
        void ladderDeployed; void pumpAuto;
        sumpWater.visible = true;
        sumpWater.userData.step(dt, new THREE.Vector3(-0.45, 0.04, -1.83), 0.1, 0.08, -0.6);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "spring-buffer") {
            const mm = Math.round(gg.t * 180);
            repaint(gaugeTool.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
          if (session.step?.id === "oil-buffer") {
            const mm = Math.round(gg.t * 220);
            repaint(gaugeTool.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.45 && gg.t < 0.65 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          }
          if (session.step?.id === "runby-measure") {
            const mm = Math.round(150 + gg.t * 250);
            repaint(runbyTape.userData.screen, signFace(`${mm} mm`, { bg: "#0d1c24", accent: gg.t > 0.38 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
          }
        }
        if (session?.turn && session.step?.id === "ladder-release") {
          ladder.rotation.x = (1 - session.turn.amount / session.turn.required) * -0.5;
        }
      },
    };
  },
};
