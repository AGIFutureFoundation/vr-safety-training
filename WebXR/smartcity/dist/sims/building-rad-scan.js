import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles,
  gradientFill, noiseTexture, grimeOverlay,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, barrierPanel, cone, instrument,
  standingFigure, valveWheel, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Building Rad Scan VR — Environmental Monitoring, station
// ninety-seven.
//
// A radiation control technician's structure-surface survey of a derelict
// building on a former naval parcel, ahead of its demolition — a generic
// shipyard-era structure under a federal cleanup order, not any one named
// building. No real site is claimed here and nothing on this floor
// dramatises any one demolition's history. MARSSIM classifies a structure
// survey unit the same way it classifies open ground, and a building adds
// two things a shoreline parcel does not: walls that have to be scanned to
// a height, and drains and low points where loose contamination collects
// whether or not they sit on the grid. The discipline is the same one taught
// on the shoreline parcel — an instrument bracketed by a check source before
// and after, a background read off the unit rather than assumed, and a
// removable-contamination swipe under chain of custody — because a
// demolition crew that pulls a roll-up door before this floor is released
// does not get a second chance at any of it.

const BRS_ACCENT = 0xd83fb0;
const BRS_STAIN = 0x39342d;

/** The derelict floor: cast concrete gone dark with age, water and old oil,
 *  not a flat grey slab. Reuses pavingFace's tiling and adds its own
 *  streak-and-blotch weathering pass so the survey unit reads as a floor
 *  worth surveying rather than a diagram of one. */
function derelictFloorFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#3a352c"], [1, "#2c2820"]], { radial: true });
  const tiles = 5, t = w / tiles;
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      const v = ((i * 7 + j * 13) % 5) - 2;
      g.fillStyle = `rgba(${v > 0 ? "255,255,255" : "0,0,0"},${(Math.abs(v) * 0.03).toFixed(3)})`;
      g.fillRect(i * t, j * t, t, t);
    }
  }
  noiseTexture(g, w, h, { density: 2600, alpha: 0.1, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "150,140,110" });
  g.fillStyle = "rgba(0,0,0,0.5)";
  for (let i = 0; i <= tiles; i++) { g.fillRect(i * t - 1.5, 0, 3, h); g.fillRect(0, i * t - 1.5, w, 3); }
  grimeOverlay(g, w, h, { blotches: 6, streaks: 5, tone: "20,16,8", alpha: 0.3 });
  grimeOverlay(g, w, h, { blotches: 3, streaks: 2, tone: "60,40,10", alpha: 0.16 });
}

export const SIM_BUILDING_RAD_SCAN = {
  id: "building-rad-scan",
  index: "97",
  domain: "Environmental",
  trade: "Radiation control technician — building structure-surface survey",
  category: "Environmental Monitoring",
  indoor: "plant",
  certification: "LIUNA hazmat and environmental laborers assisting the survey; IUOE Local 3 operating engineers on the aerial lift that reaches the upper wall lanes; OSHA HAZWOPER 40-hour (29 CFR 1910.120); NRC 10 CFR 20 occupational dose limits; EPA MARSSIM structure-surface survey methodology; the site's radiological work plan and QAPP chain of custody; California Department of Public Health (CDPH) Radiologic Health Branch oversight",
  name: "Building Rad Scan",
  title: simTitle("Building Rad Scan"),
  tagline: "A derelict building's structure-surface survey ahead of demolition: instrument bracketed by a check source, floor and walls scanned to the plan's coverage, drains scanned as collection points, and a swipe bagged under chain of custody",
  accent: BRS_ACCENT,
  accentCss: "#d83fb0",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "building-released", name: "Building Released", note: "Instrument bracketed at both ends of the day, the reclassification flagged the moment the drain called for it, and no shortcut on the mark, the photo or the swipe" },

  game: system({
    name: "Structure Survey Integrity",
    currency: "DPM",
    ranks: ["Grid Walker", "Wall Scanner", "Drain Checker", "Release Reviewer", "Structure Survey Certified"],
    badges: [
      { id: "both-brackets", name: "Both Brackets", note: "Probe source-checked clean at the start of the day and again at the end", test: AWARD.all(AWARD.stepClean("source-check-am"), AWARD.stepClean("source-check-pm")) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "Never skipped the check source, crossed into unsurveyed ground, reused a swipe or skipped a photo", test: AWARD.safe },
      { id: "true-lanes", name: "True Lanes", note: "Held probe height and scan speed inside the band on both the floor and the walls", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections anywhere in the survey", test: AWARD.clean },
      { id: "steady-sweep", name: "Steady Sweep", note: "Never broke a scan speed or a hold", test: AWARD.unbroken },
      { id: "envelope-early", name: "Envelope Early", note: "Swipe bagged and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-source-check": "You powered up and started scanning without checking the probe against the source first. Every reading this instrument takes in this building today is unverifiable — there is no way to tell a genuinely elevated wall reading from a probe that was already reading high before it ever crossed the threshold.",
    "cross-barrier": "You stepped past the barrier tape into the next room, which has not been gridded or classified yet. MARSSIM's coverage claim is a claim about the survey unit that was actually walked — ground on the far side of that tape is not part of it yet, whatever the floor plan says it will eventually be.",
    "reuse-swipe": "You picked up a swipe that already wiped a different point on the grid instead of a fresh one. A swipe carries whatever it last touched, so a reused one cannot tell an inspector whether this point is contaminated or whether the last point was — it is a result that answers a question about the wrong square of floor.",
    "skip-photo": "You placed the flag and moved on without photographing it. The photograph is what ties a specific numbered flag to a specific patch of stained concrete for anyone reviewing this survey after the crew has left the building — a flag with no photograph is a location that exists only in one person's memory of where they thought it was.",
  },

  lateNotes: {
    "check-source": "The source doesn't get touched until the coveralls are on and the range is set — checking a probe you aren't ready to survey with yet just spends the source's certified count for nothing.",
    "floor-drain": "Nothing to hold a count over yet — the floor lanes have to actually reach this corner of the room before the drain gets its own dedicated count on top of the grid.",
    "flag-marker": "Nothing confirmed to flag yet — the static count has to actually finish and read over the investigation level before there is a location worth marking.",
    "camera": "Nothing to photograph until the flag is actually down on the point — a photograph of an empty patch of floor proves where nothing is.",
    "swipe-kit": "Nothing to swipe until the point is flagged and photographed — a removable-contamination result with no confirmed, marked location isn't tied to anything the next crew can find again.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a hold step, on purpose — a gauge, turn or sequence step resolves in
  // one click, too fast for the fuse to ever find the learner mid-task.
  interrupts: [
    {
      id: "drain-reclass",
      kind: "Reclassification",
      after: "drain-scan", delay: 4, seconds: 13,
      alert: "The floor drain's reading just topped the investigation level — that one number is enough to move this whole survey unit up a classification.",
      cue: "Flag the reclassification on the unit placard now, before the scan moves anywhere else.",
      target: "reclass-placard",
      why: "MARSSIM's classification sets how much of a survey unit actually has to be scanned, and a single confirmed reading over the investigation level means this unit no longer qualifies for the class it was posted under when the crew walked in — leave the old placard up and the next person through the door reads the wrong coverage requirement off a sign that no longer describes this room.",
      missNote: "The scan carried on for two more lanes under the old classification before anyone updated the placard, and every reading taken in those minutes now has to be re-evaluated against a coverage standard the unit no longer actually meets.",
      wrongNote: "Not that — the placard. The classification that's posted on it stopped being true the moment that drain reading came in.",
    },
    {
      id: "door-breach",
      kind: "Early entry",
      after: "source-check-pm", delay: 3, seconds: 12,
      alert: "A demolition crew is already hauling the roll-up door open into the survey unit — nobody told them the release hasn't been signed off yet.",
      cue: "Stop them at the door before anyone off this survey crew is standing on ground that hasn't been released.",
      target: "door-stop",
      why: "Release depends on the day's full data actually being reviewed, not on the scan simply being finished — a crew walking equipment across a floor that hasn't been signed off can scuff a marked point, kick debris into a drain that's still under evaluation, or simply be standing somewhere nobody has yet said is safe to stand.",
      missNote: "Two demolition workers and a pallet jack crossed the unswiped half of the floor before anyone reached the door, and the survey now has to note that the room's condition can no longer be guaranteed unchanged since the last reading.",
      wrongNote: "Not that — the door. Whoever is coming through it has to be stopped before this floor is signed as released.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "rwp-board",
      title: "Read the survey unit's classification and release criteria",
      cue: "Check the posted classification, the grid spacing and the investigation level the plan sets for this building before the probe comes off the cart.",
      why: "MARSSIM classifies a survey unit before anyone scans it — a Class 1 unit gets scanned at full coverage, a lower class does not — and the release criteria on the plan are the number every reading in this building gets judged against. Walking in and scanning without reading it first means guessing at both the coverage this room needs and the number that decides whether it gets released.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["dosimeter", "tyvek"],
      itemNames: { dosimeter: "dosimeter", tyvek: "disposable coveralls" },
      title: "Put on dosimetry and coveralls",
      cue: "Clip on the dosimeter and step into coveralls before crossing the threshold into the survey unit.",
      why: "The dosimeter is this technician's own exposure record for the day, and it only means something if it went on before the first reading rather than clipped on somewhere mid-survey. A derelict floor carries decades of loose debris the coveralls keep off skin and out of the truck at shift's end.",
    },
    {
      id: "source-check-am", kind: "hold", target: "check-source", seconds: 5,
      title: "Source-check the probe — morning",
      cue: "Hold the probe against the sealed check source until the reading settles and confirm it falls inside the tagged tolerance.",
      why: "This is the first end of the bracket: proof the probe itself reads true before it crosses the threshold. A survey run on an unchecked instrument is not evidence of anything about this building, no matter how carefully the floor gets walked afterward — it is a number nobody can stand behind.",
      holdBreakNote: "Lifted off the source before the reading settled — that is not a check, it's a glance. Hold it on until it settles and reads back inside tolerance.",
    },
    {
      id: "efficiency", kind: "gauge", target: "efficiency-panel",
      title: "Record the probe's counting efficiency",
      cue: "Read the counting efficiency off the source-check response and commit once it lands inside the plan's tagged band.",
      why: "Efficiency is what converts this probe's raw count rate into the disintegrations-per-minute figure the investigation level is actually written in — record it wrong, or skip it, and every reading the probe takes today gets compared against the plan's number using the wrong conversion, which can hide a real exceedance or manufacture one that was never there.",
      gauge: {
        label: "COUNTING EFFICIENCY", speed: 0.62, green: [0.4, 0.58],
        readout: (t) => `${(18 + t * 14).toFixed(1)} %`,
        missNote: "Not a settled efficiency figure — read the source-check response again and commit only once it's inside the plan's tagged band.",
      },
    },
    {
      id: "background", kind: "gauge", target: "reference-surface",
      title: "Establish background on the reference surface",
      cue: "Read the probe on the reference coupon outside the survey unit and commit once the reading settles inside the expected range.",
      why: "Every reading taken inside this survey unit is judged against this number, not against zero — and it has to come from a surface known to be clean, mounted outside the unit, not from an assumption about what a derelict building's background ought to read. Skip it and there is no way to tell a genuinely elevated wall reading from ordinary background on old concrete.",
      gauge: {
        label: "BACKGROUND", speed: 0.6, green: [0.4, 0.56],
        readout: (t) => `${(4 + t * 8).toFixed(1)} µR/h`,
        missNote: "That is not a settled background reading — read the reference coupon again and commit only once it's inside the expected range.",
      },
    },
    {
      id: "floor-scan", kind: "track", target: "probe", seconds: 9,
      title: "Scan the floor in overlapping lanes",
      cue: "Hold the probe at the method's height and keep your pace inside the band, overlapping each lane into the last.",
      why: "MARSSIM's coverage claim only holds at this speed and probe height, with each lane overlapping the one before it — faster or higher, and a hot spot the size the plan is looking for can pass under the probe between lanes; slower or lower, and the crew never clears the floor before the day's access window closes.",
      track: {
        start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "SCAN SPEED",
        readout: (v) => (v < 0.4 ? "too fast — under-scanned" : v > 0.6 ? "too slow — behind schedule" : "scanning at spec"),
      },
      holdBreakNote: "Speed drifted out of the band — at that pace the probe is either skating over floor it never really surveyed or falling behind the plan's schedule. Bring it back and hold the lane.",
    },
    {
      id: "lift-raise", kind: "turn", target: "lift-control",
      title: "Raise the aerial lift to wall-scan height",
      cue: "Have the platform raised to the height the plan calls for before the wall lanes start.",
      why: "The plan sets a wall height for a reason — most of what a demolition drops from overhead lands within that band — and a platform stopped short of it leaves the top of every wall lane unscanned no matter how carefully the rest gets swept. IUOE runs the lift itself; the technician's job is confirming it stops at the height the plan actually asked for.",
      turn: { turns: 0.6, axis: "y", label: "LIFT HEIGHT" },
    },
    {
      id: "wall-scan", kind: "track", target: "probe", seconds: 8,
      title: "Scan the walls to survey height",
      cue: "Sweep the wall lanes side to side at the platform's set height, keeping pace inside the band.",
      why: "A wall scanned too fast from a lift that is already costing the crew time on the clock is the same coverage failure as a floor lane walked too fast — the difference is that nobody re-checks a wall lane on the way out the way a boot might catch a missed floor square, so this pass has to be right the first time.",
      track: {
        start: 0.1, green: [0.38, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "WALL SWEEP",
        readout: (v) => (v < 0.38 ? "too fast — under-scanned" : v > 0.6 ? "too slow — behind schedule" : "scanning at spec"),
      },
      holdBreakNote: "Sweep speed drifted out of the band — bring it back before the lift moves to the next wall lane.",
    },
    {
      id: "drain-scan", kind: "hold", target: "floor-drain", seconds: 6,
      title: "Scan the floor drain and low points",
      cue: "Hold the probe over the drain grate for the full count — drains and low points collect loose contamination whether or not they sit on the grid.",
      why: "Loose material on a derelict floor migrates downhill under its own weight and years of foot traffic, and a drain or a low point is exactly where it settles — the general grid pattern can pass within a metre of that concentration and never actually read over it, which is why drains get their own dedicated count on top of the lanes rather than trusting the grid to happen to cross them.",
      holdBreakNote: "Lifted the probe before the count finished — an incomplete count over a drain proves nothing about what's actually collected in it.",
    },
    {
      id: "static-count", kind: "hold", target: "floor-drain", seconds: 6,
      title: "Take the confirmatory static count",
      cue: "Hold the probe steady over the same point for the full static count now that the drain has read elevated.",
      why: "A held reading during a walk-round is what finds a hot spot; a static count taken afterward, with the probe still and the clock running the full duration, is what actually confirms a point sits over the investigation level rather than a spike in the noise. Nothing gets flagged, photographed or swiped off a walk-round number alone.",
      holdBreakNote: "Lifted the detector before the count finished — an incomplete static count is not confirmation of anything, it's a reading that got interrupted.",
    },
    {
      id: "flag-photo", kind: "sequence",
      targets: ["flag-marker", "camera"],
      itemNames: { "flag-marker": "numbered flag", camera: "camera" },
      title: "Mark and photograph the location",
      cue: "Set the numbered flag on the point first, then photograph it for the survey record.",
      why: "The flag is what makes this an actual location and not just a number in a logbook, and the photograph is what ties that specific flag to this specific patch of stained concrete for anyone reviewing the survey after the crew has left — flag it and walk away without the photo, and the record depends on nobody ever needing to prove where the flag actually stood.",
      outOfOrderNote: "The flag goes down first, on the point the count confirmed — photographing an unflagged patch of floor documents nothing anyone can find again.",
    },
    {
      id: "swipe", kind: "select", target: "swipe-kit",
      title: "Take a swipe for removable contamination",
      cue: "Wipe the flagged point with a fresh swipe filter from the rack — never one already used somewhere else on the grid.",
      why: "The probe reading tells you the point is elevated; the swipe is the only thing that tells you how much of that activity is loose enough to move on a boot or a glove versus fixed to the concrete, and that distinction is what the waste route and the respiratory protection for the demolition crew actually get decided on.",
    },
    {
      id: "bag-swipe", kind: "drag", target: "swipe-envelope",
      title: "Seal, label and log the swipe under chain of custody",
      cue: "Seal the swipe in its numbered envelope, write the point ID, date, time and surveyor on it, and carry it to the custody log before it leaves your hand.",
      why: "From here the swipe is evidence, and the label plus the custody log are what prove it came off this exact point at this exact time — a swipe that sits unsealed or unlogged for even a few minutes is a sample nobody downstream can vouch for, whatever the number on it eventually reads.",
      drag: { to: "coc-socket", radius: 0.4, missNote: "Not carried to the custody log — a sealed envelope set down anywhere else in the room is a sample with no custody record yet." },
    },
    {
      id: "source-check-pm", kind: "hold", target: "check-source", seconds: 5,
      title: "Source-check the probe — end of day",
      cue: "Hold the probe against the same check source again before the day's data gets signed off.",
      why: "This closes the bracket the morning check opened. A day's readings verified only at the start are one drifted battery or one bumped calibration away from unverifiable by the time anyone questions them — the closing check is what lets every reading taken in this building today stand on its own.",
      holdBreakNote: "Lifted off the source again before it settled — the closing check has to actually complete, or the day's data is only bracketed on one end.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["unlabeled-envelope"],
      itemNames: { "unlabeled-envelope": "unlabeled envelope" },
      itemNotes: { "unlabeled-envelope": "That envelope has no point ID, no date and no surveyor's initials on it — it is not traceable to any square on the grid, and a lab cannot certify a swipe it cannot place." },
      title: "Walk the sample tray before it leaves the building",
      cue: "Check every envelope on the tray against the custody log and click the one with no label.",
      why: "The lab trusts whatever the label says an envelope is. One unlabeled swipe among labeled ones in the same tray is a sample that either gets thrown out or gets guessed at, and neither of those is what a removable-contamination result under chain of custody is supposed to survive to become.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.15, BRS_ACCENT);

    // -------------------------------------------------------------- floor
    const patch = box(g, 5.2, 0.02, 4.6, 0, 0.01, 0, 0xffffff, { rough: 0.95, cast: false });
    patch.material = texturedMat(
      surfaceTexture((cx, w, h) => derelictFloorFace(cx, w, h), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xa89c86 },
    );
    // A caution stripe at the edge of the surveyed footprint, the same
    // finish an outdoor exclusion boundary uses.
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      box(g, 0.22, 0.006, 0.05, Math.sin(a) * 2.3, 0.021, Math.cos(a) * 2.3, i % 2 ? BRS_ACCENT : 0x1b1e22, { rough: 0.7, cast: false });
    }

    // -------------------------------------------------------- adjoining room
    // Barrier tape across the doorway to the room that has not been gridded
    // yet — the "cross-barrier" hazard on the far side of it.
    const doorway = group(g, 0, 0, -2.15);
    box(doorway, 1.1, 2.0, 0.1, 0, 1.0, 0, 0x3a3c3e, { rough: 0.85, cast: false });
    box(doorway, 1.3, 2.2, 0.06, 0, 1.1, -0.08, 0x2a2c2e, { rough: 0.85, cast: false });
    const barrierGap = box(doorway, 0.9, 1.6, 0.04, 0, 0.9, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    barrierPanel(g, -0.55, -1.95, { ry: -0.5, w: 0.9, color: BRS_ACCENT });
    barrierPanel(g, 0.55, -1.95, { ry: 0.5, w: 0.9, color: BRS_ACCENT });
    holoTag(doorway, "unsurveyed room — stay behind the tape", 0, 2.15, 0.1, { css: "#f0645b", w: 0.9 });
    reg(hits, barrierGap, "cross-barrier");
    // A hint of the ungridded room beyond: darker floor, no lane marks.
    box(g, 1.0, 0.01, 0.6, 0, 0.008, -2.5, 0x22201b, { rough: 0.97, cast: false });

    // ------------------------------------------------------------- RWP board
    const rwpPost = group(g, -2.0, 0, 1.6, 0.4);
    const rwpBoard = holoPanel(rwpPost, 0.92, 0.62, 0, 1.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1c0a1a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d83fb0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RADIOLOGICAL WORK PLAN — BLDG 4", w * 0.06, h * 0.12);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f2dcee";
      ["Survey unit: Class 3, interior", "Investigation level: 12,000 cpm gamma",
       "Wall scan height: to 2 m", "Check source: Cs-137, tagged ±5%",
       "Static count: 60 s minimum over IL", "Swipe: fresh medium per point, logged"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.26 + i * 0.115));
      });
    }, { accent: BRS_ACCENT });
    reg(hits, rwpBoard, "rwp-board");

    // The reclassification placard, right beside the plan — flips when the
    // drain interrupt is answered.
    const placard = group(rwpPost, 0.75, 1.05, 0.1, -0.2);
    slab(placard, 0.34, 0.24, 0.02, 0, 0, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    const placardFace = decal(placard, 0.3, 0.2, 0, 0, 0.011, signFace("SURVEY UNIT — CLASS 3", { bg: "#1c0a1a", accent: "#d83fb0", scale: 0.34 }), { px: 220 });
    holoTag(placard, "unit classification", 0, 0.16, 0, { css: "#d83fb0", w: 0.4 });
    reg(hits, placard, "reclass-placard");
    // A warning beacon beside the placard, dark until the drain reading
    // actually calls the classification into question.
    const reclassBeacon = ball(placard, 0.03, 0.22, 0.14, 0.02, 0x2b0f18, { emissive: 0xd2312b, ei: 0.05, rough: 0.4 });
    reclassBeacon.visible = false;

    // ----------------------------------------------------------- PPE + tools
    const chest = toolChest(g, -1.9, -1.4, { ry: 0.7, color: 0x8a3f8f });
    const dosim = group(chest, -0.15, 0.78, 0.05);
    box(dosim, 0.05, 0.07, 0.015, 0, 0, 0, 0x22262b, { rough: 0.6 });
    decal(dosim, 0.045, 0.03, 0, 0, 0.009, signFace("DOSE", { bg: "#22262b", accent: "#d83fb0", scale: 0.5 }));
    holoTag(dosim, "dosimeter", 0, 0.1, 0, { css: "#d83fb0", w: 0.26 });
    reg(hits, dosim, "dosimeter");
    const coveralls = group(chest, 0.18, 0.76, -0.05);
    box(coveralls, 0.2, 0.05, 0.15, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    holoTag(coveralls, "coveralls", 0, 0.08, 0, { css: "#d83fb0", w: 0.28 });
    reg(hits, coveralls, "tyvek");

    // --------------------------------------------------------- check source
    const sourceStand = group(g, -1.55, 0, 1.0, 0.3);
    cyl(sourceStand, 0.02, 0.02, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const sourcePig = group(sourceStand, 0, 0.92, 0);
    cyl(sourcePig, 0.09, 0.1, 0.16, 0, 0, 0, 0xb8b0a0, { rough: 0.5, metal: 0.3, seg: 16 });
    cyl(sourcePig, 0.06, 0.06, 0.02, 0, 0.09, 0, 0x1b1e22, { rough: 0.6, seg: 14 });
    decal(sourcePig, 0.14, 0.06, 0, 0, 0.081, signFace("Cs-137 CHK", { bg: "#2a0c30", accent: "#d83fb0", scale: 0.5 }));
    holoTag(sourceStand, "check source", 0, 1.1, 0, { css: "#d83fb0", w: 0.32 });
    reg(hits, sourcePig, "check-source");
    // The bypass button that skips the source check entirely.
    const skipBtn = box(sourceStand, 0.09, 0.03, 0.05, 0.12, 0.5, 0.1, 0xd2312b, { rough: 0.5 });
    decal(skipBtn, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP CHECK", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }));
    holoTag(sourceStand, "skip the check?", 0.12, 0.6, 0.1, { css: "#d2312b", w: 0.4 });
    reg(hits, skipBtn, "skip-source-check");

    // Efficiency panel beside the source stand.
    const effPanel = instrument(sourceStand, 0.3, 0.55, 0.25, { ry: -0.3, idle: "-- %", color: BRS_ACCENT, w: 0.13, d: 0.19 });
    holoTag(effPanel, "counting efficiency", 0, 0.16, 0, { css: "#d83fb0", w: 0.42 });
    reg(hits, effPanel, "efficiency-panel");

    // ------------------------------------------------------- reference surface
    // A calibration coupon mounted just outside the survey unit's own
    // doorway, off to the side of the entry.
    const refPost = group(g, 2.15, 0, 1.75, -0.3);
    cyl(refPost, 0.02, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const refCoupon = box(refPost, 0.16, 0.16, 0.01, 0, 1.02, 0.006, 0xdfe4e8, { rough: 0.4, metal: 0.3 });
    void refCoupon;
    const refInst = instrument(refPost, 0, 1.02, 0.03, { ry: 0.4, idle: "-- µR/h", color: BRS_ACCENT, w: 0.13, d: 0.2 });
    holoTag(refPost, "reference surface — off unit", 0, 1.22, 0, { css: "#d83fb0", w: 0.56 });
    reg(hits, refInst, "reference-surface");

    // ------------------------------------------------------------------ probe
    const probeGrp = group(g, -0.2, 0, 0.6, -0.3);
    cyl(probeGrp, 0.014, 0.014, 0.75, 0, 0.37, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 8 });
    const probe = instrument(probeGrp, 0, 0.78, 0, { ry: 0.5, idle: "-- cpm", color: BRS_ACCENT, w: 0.14, d: 0.22 });
    holoTag(probeGrp, "surface probe", 0, 0.98, 0, { css: "#d83fb0", w: 0.32 });
    reg(hits, probeGrp, "probe");

    // --------------------------------------------------------------- aerial lift
    const lift = group(g, 1.4, 0, 0.3, -0.4);
    box(lift, 0.9, 0.16, 0.7, 0, 0.08, 0, 0x8a939b, { rough: 0.55, metal: 0.35 });
    for (const sx of [-0.34, 0.34]) for (const sz of [-0.24, 0.24]) {
      cyl(lift, 0.05, 0.05, 0.14, sx, 0.16, sz, 0x2b2f34, { rough: 0.7, seg: 12 });
    }
    const scissorGrp = group(lift, 0, 0.16, 0);
    for (let i = 0; i < 3; i++) {
      const a = box(scissorGrp, 0.05, 0.9, 0.05, -0.2, 0.45 + i * 0.02, -0.15 + i * 0.15, 0x8a939b, { rough: 0.5, metal: 0.5, cast: false });
      a.rotation.z = 0.5;
      const b = box(scissorGrp, 0.05, 0.9, 0.05, 0.2, 0.45 + i * 0.02, -0.15 + i * 0.15, 0x8a939b, { rough: 0.5, metal: 0.5, cast: false });
      b.rotation.z = -0.5;
    }
    const platform = group(lift, 0, 1.2, 0);
    box(platform, 0.86, 0.05, 0.66, 0, 0, 0, 0x6f7a83, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.4, 0.4]) box(platform, 0.03, 0.9, 0.62, sx, 0.47, 0, 0x8a939b, { rough: 0.6, metal: 0.4, cast: false });
    holoTag(lift, "IUOE aerial lift", 0, 1.5, 0, { css: "#d83fb0", w: 0.34 });
    // The lift-height control lever, at the base.
    const liftControl = valveWheel(lift, 0.55, 0.16, 0.3, { r: 0.05, color: BRS_ACCENT, body: 0x2b2f34 });
    reg(hits, liftControl.userData.wheel, "lift-control");

    // ---------------------------------------------------------------- drain
    const drain = group(g, 0.4, 0, -0.9);
    cyl(drain, 0.15, 0.15, 0.015, 0, 0.008, 0, 0x2b2f34, { rough: 0.7, seg: 16, cast: false });
    for (let i = -3; i <= 3; i++) box(drain, 0.24, 0.006, 0.014, 0, 0.015, i * 0.035, 0x1b1e22, { rough: 0.6, cast: false });
    holoTag(drain, "floor drain", 0, 0.24, 0.18, { css: "#d83fb0", w: 0.3 });
    reg(hits, drain, "floor-drain");
    // A dark stain radiating from the drain — the collection point made visible.
    box(drain, 0.5, 0.004, 0.5, 0, 0.006, 0, 0x1c1a14, { rough: 0.9, opacity: 0.4, transparent: true, cast: false });

    // -------------------------------------------------------------- flag rack
    const flagRack = group(g, 1.1, 0, -0.7, -0.4);
    cyl(flagRack, 0.02, 0.02, 0.4, 0, 0.2, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const flagMarker = group(flagRack, 0, 0.42, 0);
    box(flagMarker, 0.11, 0.07, 0.006, 0.055, 0, 0, BRS_ACCENT, { rough: 0.55, emissive: BRS_ACCENT, ei: 0.6 });
    holoTag(flagRack, "numbered flag", 0, 0.6, 0, { css: "#d83fb0", w: 0.3 });
    reg(hits, flagMarker, "flag-marker");
    for (const dz of [-0.08, 0.08]) {
      const spare = group(flagRack, 0, 0.34, dz);
      cyl(spare, 0.008, 0.008, 0.28, 0, 0.14, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 6 });
    }
    const drainSocket = group(drain, 0, 0.02, 0);
    hits["drain-flag-socket"] = drainSocket;

    // ---------------------------------------------------------------- camera
    const cameraTable = group(g, 1.5, 0, -1.15, 0.3);
    box(cameraTable, 0.34, 0.5, 0.3, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const camera = group(cameraTable, 0, 0.54, 0.05);
    box(camera, 0.12, 0.08, 0.09, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.4 });
    cyl(camera, 0.03, 0.035, 0.06, 0, 0, 0.07, 0x2b2f34, { rough: 0.35, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(camera, "camera", 0, 0.14, 0, { css: "#d83fb0", w: 0.26 });
    reg(hits, camera, "camera");
    // The "SKIP PHOTO" shortcut button beside it.
    const skipPhoto = box(cameraTable, 0.09, 0.03, 0.05, 0.12, 0.5, -0.06, 0xd2312b, { rough: 0.5 });
    decal(skipPhoto, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP PHOTO", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.45 }));
    holoTag(cameraTable, "skip the photo?", 0.12, 0.6, -0.06, { css: "#d2312b", w: 0.44 });
    reg(hits, skipPhoto, "skip-photo");

    // --------------------------------------------------------------- swipe rack
    const swipeBench = group(g, 1.9, 0, -0.5, -0.3);
    box(swipeBench, 0.6, 0.5, 0.32, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const swipeRack = group(swipeBench, -0.1, 0.53, 0);
    for (let i = 0; i < 4; i++) {
      const pad = ball(swipeRack, 0.028, -0.15 + i * 0.1, 0.01, 0, 0xe8e2d2, { rough: 0.8, seg: 10 });
      if (i === 0) reg(hits, pad, "swipe-kit");
    }
    holoTag(swipeRack, "swipe filters", 0, 0.14, 0, { css: "#d83fb0", w: 0.32 });
    // The used, greyed swipe already sitting on the bench — the reuse trap.
    const usedSwipe = ball(swipeBench, 0.03, 0.18, 0.53, 0.06, 0x6a6255, { rough: 0.85, seg: 10 });
    holoTag(usedSwipe, "used — already wiped", 0, 0.1, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, usedSwipe, "reuse-swipe");

    // The envelope, draggable to the custody log.
    const envelope = group(swipeBench, 0.15, 0.53, -0.05);
    box(envelope, 0.14, 0.008, 0.1, 0, 0, 0, 0xf3efe4, { rough: 0.85 });
    holoTag(envelope, "swipe envelope", 0, 0.1, 0, { css: "#d83fb0", w: 0.32 });
    reg(hits, envelope, "swipe-envelope");

    // ------------------------------------------------------------ custody log
    const cocTable = group(g, 2.2, 0, 0.6, -0.3);
    box(cocTable, 0.5, 0.5, 0.34, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    box(cocTable, 0.4, 0.006, 0.28, 0, 0.53, 0, 0xf3efe4, { rough: 0.9 });
    decal(cocTable, 0.36, 0.24, 0, 0.534, 0, signFace("CHAIN OF CUSTODY", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(cocTable, "custody log", 0, 0.62, 0, { css: "#d83fb0", w: 0.32 });
    const cocSocket = group(cocTable, 0, 0.54, 0);
    hits["coc-socket"] = cocSocket;

    // A tray of sealed envelopes for the final walk, one unlabeled.
    const tray = group(cocTable, 0, 0.55, 0.12);
    const trayLabels = [];
    for (let i = 0; i < 4; i++) {
      const e = box(tray, 0.1, 0.006, 0.07, -0.15 + i * 0.1, 0, 0, 0xf3efe4, { rough: 0.85 });
      trayLabels.push(e);
      if (i < 3) decal(e, 0.08, 0.05, 0, 0.004, 0, signFace(`PT-${i + 1}`, { bg: "#f3efe4", accent: "#1b1e22", scale: 0.55 }), { px: 96 }).rotation.x = -Math.PI / 2;
    }
    reg(hits, trayLabels[3], "unlabeled-envelope");

    // ------------------------------------------------------------- rubble & flavour
    for (const [x, z, s] of [[-0.7, 1.9, 0.3], [-1.4, 0.4, 0.22], [0.9, 1.7, 0.26]]) {
      const rock = box(g, s, s * 0.6, s * 0.8, x, s * 0.3, z, 0x4a463d, { rough: 0.95, cast: false });
      rock.rotation.y = x + z;
    }
    cyl(g, 0.05, 0.06, 1.5, -1.9, 0.75, -1.6, 0x3a4048, { rough: 0.85, metal: 0.3, seg: 10 }).rotation.z = 1.4;

    cone(g, -1.4, 1.7, { color: BRS_ACCENT }); cone(g, 0.2, 1.9, { color: BRS_ACCENT });
    const fog = particles(g, 26, 0xbfc6cc, { size: 0.05, life: 1.8, additive: false, opacity: 0.12 });

    // The roll-up door the demolition crew opens for the "door-breach"
    // interrupt — the survey unit's own way out to the yard.
    const rollDoor = group(g, 2.4, 0, -0.4, -1.0);
    box(rollDoor, 1.4, 2.1, 0.08, 0, 1.05, 0, 0x5a626a, { rough: 0.6, metal: 0.4, cast: false });
    for (let i = 0; i < 8; i++) box(rollDoor, 1.3, 0.24, 0.1, 0, 0.14 + i * 0.26, 0.02, 0x98a2aa, { rough: 0.7, metal: 0.35, cast: false });
    decal(rollDoor, 0.7, 0.16, 0, 2.0, 0.06, signFace("SURVEY UNIT — NOT RELEASED", { bg: "#2a0c30", accent: "#d83fb0", scale: 0.32 }), { px: 200 });
    holoTag(rollDoor, "roll-up door", 0, 2.3, 0.06, { css: "#d83fb0", w: 0.36 });
    reg(hits, rollDoor, "door-stop");

    // A rigger and a laborer clear of every control.
    standingFigure(g, 2.2, -1.4, { ry: -0.6, cloth: 0x5a3f6f, helmet: 0xe4dc3a, vest: 0xf2c14b });
    standingFigure(g, 2.0, -1.7, { ry: 2.4, cloth: 0x2b3138, vest: BRS_ACCENT, helmet: 0xf2f2f2 });

    // -------------------------------------------------------------- live state
    let reclassified = false, doorOpening = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.3),
      footprint: 2.15,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "source-check-am") repaint(probe.userData.screen, signFace("READY", { bg: "#1c0a1a", accent: "#59c97b", fg: "#f2dcee", scale: 0.55 }));
        if (step.id === "static-count") repaint(probe.userData.screen, signFace("IL EXCEEDED", { bg: "#2a0c30", accent: "#d2312b", fg: "#f2dcee", scale: 0.42 }));
        if (step.id === "flag-photo") { flagMarker.parent.remove(flagMarker); drainSocket.add(flagMarker); flagMarker.position.set(0, 0.24, 0.14); flagMarker.rotation.set(0, 0, 0); }
        if (step.id === "bag-swipe") repaint(effPanel.userData.screen, signFace("LOGGED", { bg: "#1c0a1a", accent: "#59c97b", fg: "#f2dcee", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "drain-reclass") {
          repaint(placardFace, signFace("SURVEY UNIT — RECLASSIFYING", { bg: "#2a0c30", accent: "#d2312b", scale: 0.28 }));
          reclassBeacon.visible = true;
          reclassBeacon.material.emissiveIntensity = 2.4;
          placard.rotation.z = 0.12;
        }
        if (it.id === "door-breach") {
          doorOpening = true;
          rollDoor.rotation.y = -1.0 - 0.4;
          rollDoor.position.z = -0.55;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drain-reclass") {
          reclassified = true;
          repaint(placardFace, signFace("SURVEY UNIT — CLASS 2", { bg: "#1c0a1a", accent: "#59c97b", scale: 0.32 }));
          reclassBeacon.material.emissiveIntensity = 0.05;
          placard.rotation.z = 0;
        }
        if (it.id === "door-breach") {
          doorOpening = false;
          rollDoor.rotation.y = -1.0;
          rollDoor.position.z = -0.4;
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        void reclassified; void doorOpening;
        fog.visible = true; fog.userData.step(dt, new THREE.Vector3(0, 1.2, 0), 0.02, 1.0, 0.05);
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "efficiency") {
            repaint(effPanel.userData.screen, signFace(`${(18 + gg.t * 14).toFixed(1)} %`, {
              bg: "#1c0a1a", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f2dcee", scale: 0.55,
            }));
          }
          if (session.step?.id === "background") {
            repaint(refInst.userData.screen, signFace(`${(4 + gg.t * 8).toFixed(1)} µR/h`, {
              bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
        if (session?.track && (session.step?.id === "floor-scan" || session.step?.id === "wall-scan")) {
          const v = session.track.v;
          repaint(probe.userData.screen, signFace(v < 0.4 ? "TOO FAST" : v > 0.6 ? "TOO SLOW" : "ON SPEED", {
            bg: "#1c0a1a", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f2dcee", scale: 0.48,
          }));
        }
        if (session?.step?.id === "lift-raise" && session.turn) {
          platform.position.y = 1.2 + session.turn.amount * 0.6;
          scissorGrp.scale.y = 1 + session.turn.amount * 0.4;
        }
      },
    };
  },
};
