import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, surfaceTexture, texturedMat, palette, gratingFace, rustFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Boiler Tube Replacement and Rolling VR — Building Systems &
// Facilities, the fourth of the Insulators and Boilermakers pack. A failed
// firetube pulled from the tube sheet and a new stub rolled in behind it:
// the drum confirmed cold and the entry permit signed, the failed tube cut
// free and drawn out, the new stub bevelled, driven home and expanded to
// the tube sheet with a roller expander, seal-welded and checked, and the
// drum walked for the wrench and the rag a foreign-object check exists to
// catch before the manway ever closes again.
//
// Sited generically: no boiler manufacturer, no real repair authorization
// number — the expansion percentage and weld numbers are "per the code".

const IBBT_ACCENT = 0xd8232a;
const IBBT_PAL = palette("utility");

export const SIM_IB_BOILER_TUBE_REPLACEMENT_AND_ROLLING = {
  id: "ib-boiler-tube-replacement-and-rolling",
  index: "355",
  domain: "Facilities",
  trade: "Boilermaker, tube replacement and rolling — Boilermakers Local 549",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Boilermakers Local 549 apprenticeship and training; ASME Section I rules for the construction and repair of power boilers; ASME Section IX welding qualification for the seal weld; National Board Inspection Code (NBIC) repair and alteration practice; OSHA 29 CFR 1910.147 the control of hazardous energy",
  name: "Boiler Tube Replacement and Rolling",
  title: simTitle("Boiler Tube Replacement and Rolling"),
  tagline: "A failed firetube cut out and a new stub bevelled, rolled to the tube sheet and seal-welded, closed out on a foreign-object check before the manway shuts",
  accent: IBBT_ACCENT,
  accentCss: "#d8232a",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "tube-rolled-true", name: "Tube Rolled True", note: "Cut, bevelled, rolled to the specified expansion and seal-welded, with nothing left behind in the drum" },

  game: system({
    name: "Boilermaker Certified",
    currency: "RIVET",
    ranks: ["Helper", "Boilermaker", "Lead Mechanic", "Repair Foreman", "Boilermaker Certified"],
    badges: [
      { id: "nothing-left-inside", name: "Nothing Left Inside", note: "Never closed the manway with anything unaccounted for", test: AWARD.safe },
      { id: "expansion-precise", name: "Expansion Precise", note: "Held the roll expander near band centre", test: AWARD.precise(0.72) },
      { id: "seal-clean", name: "Seal Clean", note: "Ran the seal weld with no correction", test: AWARD.stepClean("seal-weld") },
    ],
    challenges: [
      { id: "clean-repair", name: "Clean Repair", note: "No corrections from the work order to the stamp", test: AWARD.clean },
      { id: "steady-weld", name: "Steady Weld", note: "Held the seal weld travel speed through the whole pass", test: AWARD.unbroken },
      { id: "fast-tube", name: "Fast Tube", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cheater-bar": "You reached for the length of pipe slipped over the expander wrench handle. A cheater bar puts more torque into the roller than the tool or the tube sheet was ever designed to take, and a tube rolled past its specified expansion does not fail today — it work-hardens, cracks at the tube sheet and fails on a later shift, at pressure, with nobody standing where they were when it was overtightened.",
    "dropped-wrench-in-drum": "There is a wrench lying inside the drum and the manway is about to close. A tool left inside a boiler drum rattles loose the moment steam starts moving through it, and it does not stay wherever it landed — it travels until it jams a valve, scores a tube, or turns into shrapnel the next time this vessel is opened. Nothing goes back together until every tool that went in is accounted for coming out.",
    "guard-off-grinder": "That angle grinder is sitting there with its guard removed for a tighter fit against the tube sheet. The guard is what stands between a disc that grabs or shatters and the hand holding the tool — taking it off to reach an awkward angle trades a few seconds of convenience for exactly the injury the guard exists to stop.",
    "live-adjacent-tube": "The header valve for the tube bank next to this one reads closed, but it was never actually proven — it is residual pressure sitting behind a valve nobody double-checked, one row over from where you are about to cut. Isolation on a multi-tube boiler is proven bank by bank, not assumed because the gauge on the bank you are working looks quiet.",
  },

  lateNotes: {
    "expander-wrench": "The expander only turns once the new stub is actually seated in the tube sheet — not dry-run on an empty hole to see how it feels.",
    "weld-torch": "The seal weld goes on once the tube is rolled to the specified expansion and inspected, not before the roll is confirmed.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the repair work order",
      cue: "Confirm the failed tube's location, the tube sheet row and the repair authorization.",
      why: "A boiler with dozens of tubes in close rows makes the wrong tube look identical to the right one from arm's length, and the work order is what actually ties this repair to the National Board authorization covering it — pulling a tube that was not the one scoped is a second failure created while fixing the first.",
    },
    {
      id: "cooldown-check", kind: "gauge", target: "drum-gauge",
      title: "Confirm the drum has cooled and depressurized",
      cue: "Watch the drum pressure and temperature fall, and commit once it reads inside the safe entry band.",
      why: "A boiler drum this size holds stored heat in thick steel long after the last firing, and the tube sheet stays hot enough to burn through a glove well after the gauge shows zero pressure. The safe band on this gauge is what actually makes the manway approachable, not how long it has been since the burner stopped.",
      gauge: {
        label: "DRUM PRESSURE / TEMPERATURE", speed: 0.5, green: [0.0, 0.16],
        readout: (t) => `${Math.round(t * 200)} psig · ${Math.round(90 + t * 300)}°F`,
        missNote: "Still hot and pressurised. The manway stays shut until this reads inside the safe entry band.",
      },
    },
    {
      id: "entry-permit", kind: "select", target: "csp-permit",
      title: "Sign the confined-space entry permit",
      cue: "Sign the permit for drum entry: attendant posted, retrieval plan named.",
      why: "The inside of this drum is a permit-required confined space independent of whether the boiler itself is isolated — limited entry, no ventilation of its own, and not built for anyone to work inside for long. An attendant who never enters and a named retrieval plan go on the permit before anyone's shoulders go through the manway.",
    },
    {
      id: "tube-sheet-survey", kind: "find", noHint: true,
      targets: ["wall-loss-tube", "overheat-discolour", "loose-ferrule"],
      itemNames: { "wall-loss-tube": "the adjacent tube with visible wall loss", "overheat-discolour": "the overheat discolouration on the sheet", "loose-ferrule": "the loose ferrule on a neighbouring tube" },
      itemNotes: {
        "wall-loss-tube": "A neighbouring tube already showing wall loss did not fail today, and it will not wait for its own separately scheduled outage if it is left alone now — it goes on the list before this manway closes.",
        "overheat-discolour": "Discolouration on the tube sheet around the failure is evidence of a hot spot that did more than break one tube — the extent of that overheating gets checked before the assumption is 'just the one tube.'",
        "loose-ferrule": "A ferrule rocking loose on a nearby tube is a joint already working its way toward the same kind of failure sitting in front of you right now — it gets caught here, while the crew and the tools are already on this drum.",
      },
      title: "Survey the tube sheet before cutting",
      cue: "Three things about this tube sheet are not right yet. Find them before the failed tube comes out.",
      why: "A repair scoped to exactly one tube and a tube sheet that is actually failing in one place only are not automatically the same thing — the wall loss, the discolouration and the loose ferrule are the three signs that this failure had company, and all three are easiest to find with the drum already open and the crew already here.",
    },
    {
      id: "cut-out-tube", kind: "sequence",
      targets: ["near-end-cut", "far-end-cut", "tube-extraction"],
      itemNames: { "near-end-cut": "near end cut free", "far-end-cut": "far end cut free", "tube-extraction": "tube drawn out" },
      title: "Cut and draw out the failed tube",
      cue: "Cut the near end free, then the far end, then draw the tube out of the sheet.",
      why: "Both ends are cut free of the sheet before any pulling starts, because a tube still welded at one end and forced at the other bends inside the sheet and scores the hole it is supposed to leave clean — a hole that then has to be re-machined before a new stub can seat in it at all.",
      outOfOrderNote: "Wrong order — both ends cut free first, then the tube draws straight out instead of binding partway.",
    },
    {
      id: "bevel-prep", kind: "hold", target: "grinder", seconds: 5,
      title: "Bevel the new tube stub",
      cue: "Grind the weld bevel on the new stub's end and hold the pass steady until it is fully prepped.",
      why: "A clean, consistent bevel is what gives the seal weld full penetration all the way around the joint — a bevel ground unevenly leaves a thin spot in the weld exactly where a boiler tube joint is least able to tolerate one.",
      holdBreakNote: "Let go before the bevel was even. An uneven bevel becomes an uneven weld the moment the torch reaches that spot.",
    },
    {
      id: "insert-new-tube", kind: "drag", target: "new-tube-stub",
      title: "Insert the new tube stub",
      cue: "Carry the new tube stub to the tube sheet and drive it into the cleaned hole.",
      why: "The stub goes in only once the hole itself has been checked clean of the old tube's scale and scoring — a stub driven into a hole that was not actually cleaned out seats on debris instead of bare steel, and the roll expander that comes next is rolling against a surface that was never really ready for it.",
      drag: { to: "tube-sheet-hole", radius: 0.5, missNote: "Not seated in the hole yet. The stub has to actually be in place before the expander does anything useful to it." },
    },
    {
      id: "roll-expander", kind: "turn", target: "expander-wrench",
      title: "Roll the tube to the tube sheet",
      cue: "Turn the expander wrench steadily and commit once the expansion reads inside the specified range.",
      why: "The roller expands the tube wall out against the sheet until it grips by friction, tight enough to seal and hold under pressure — under-rolled and it can work loose and weep; over-rolled and the tube wall thins and work-hardens right where it is already under the most stress, which is exactly the failure this repair exists to fix, not repeat.",
      turn: { turns: 1.4, axis: "z", label: "TUBE EXPANSION", readout: (t) => `${Math.round(t * 12)}% OVER NOMINAL` },
    },
    {
      id: "seal-weld", kind: "track", target: "weld-torch", seconds: 7,
      title: "Run the seal weld",
      cue: "Hold the torch travel speed steady around the tube-to-tube-sheet joint.",
      why: "A steady travel speed is what gives this joint even penetration all the way around — too fast and the weld never fully fuses to the sheet; too slow and heat builds enough to warp the thin tube wall right where it was just rolled to a precise fit.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "WELD TRAVEL SPEED",
        readout: (v) => (v < 0.36 ? "too slow — overheating the joint" : v > 0.6 ? "too fast — incomplete fusion" : "even penetration"),
      },
      holdBreakNote: "Travel speed slipped out of band. An uneven pass here is a joint that looks welded and was never actually fused all the way round.",
    },
    {
      id: "weld-inspect", kind: "gauge", target: "dye-pen-kit",
      title: "Inspect the seal weld",
      cue: "Run the dye-penetrant check on the finished weld and commit once it reads clear.",
      why: "A finished weld that looks sound and a weld actually free of surface cracking are told apart by the dye penetrant, not by eye — a hairline crack in a seal weld on a boiler tube is exactly the kind of defect that hides completely until the drum is back at pressure.",
      gauge: {
        label: "DYE PENETRANT — INDICATIONS", speed: 0.6, green: [0.0, 0.12],
        readout: (t) => `${Math.round(t * 10)} found`,
        missNote: "Indications found. Grind out and reweld before this joint goes anywhere near pressure.",
      },
    },
    {
      id: "stamp-repair", kind: "select", target: "nb-stamp-form",
      title: "Complete the National Board repair form",
      cue: "Fill out the repair record and confirm the inspector's witness signature line.",
      why: "The repair form under the National Board Inspection Code is the record that ties this specific tube, this weld and this inspection back to the authorization covering the work — a boiler repaired without that paperwork is a boiler an inspector years from now has no way to trust, however sound the weld actually is.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["wrench-in-drum", "loose-bolt", "weld-spatter-loose"],
      itemNames: { "wrench-in-drum": "the wrench left in the drum", "loose-bolt": "the loose bolt on the tube sheet", "weld-spatter-loose": "the loose weld spatter" },
      itemNotes: {
        "wrench-in-drum": "A wrench left inside the drum is a foreign object that will move the moment this boiler is back in service — it comes out before the manway closes, not after someone hears it rattling weeks later.",
        "loose-bolt": "A bolt sitting loose on the tube sheet instead of torqued into place is a bolt that becomes debris the first time this drum sees flow — it gets found and seated now, while the crew is still standing right next to it.",
        "weld-spatter-loose": "Loose spatter from the seal weld that never got brushed off can flake free once this drum is back in service, and a boiler drum is exactly the wrong place for anything to be moving around loose.",
      },
      title: "Walk the drum before closing the manway",
      cue: "Three things inside this drum should not be there. Find them before anyone closes the manway.",
      why: "Everything found now costs a minute to pick up; anything missed becomes debris moving through a pressurised boiler the next time it fires. The final walk is the last chance to catch a dropped tool, a loose bolt or spatter before the manway makes the inside of this drum invisible again.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibbt-crew-checkin",
      title: "Check in with the repair foreman",
      cue: "Report the adjacent wall loss, the loose ferrule and how the roll expander felt going in.",
      why: "The adjacent tube's wall loss and the loose ferrule both need to go on the next outage's scope before anyone assumes this repair covered everything this tube sheet needed. The check-in is also where an expander that felt like it was fighting the sheet gets flagged before it is issued to the next crew.",
    },
    {
      id: "closing-log", kind: "select", target: "ibbt-closing-log",
      title: "Sign the repair closeout log",
      cue: "Record the tube location, the expansion reading and the weld inspection result, then sign.",
      why: "The closeout log is what lets an inspector years from now find exactly which tube was replaced, what expansion it was rolled to and what the dye-penetrant check found — the paperwork that turns a repair into something the next person can actually trust rather than take on faith.",
    },
  ],

  interrupts: [
    {
      id: "adjacent-startup-call",
      kind: "Isolation reverify",
      after: "roll-expander", delay: 4, seconds: 12,
      alert: "The control room is asking to bring a different boiler on this header online, and wants your isolation reconfirmed first.",
      cue: "Reverify the lockout at the isolation station before anyone answers that call.",
      target: "lockout-station",
      why: "Another boiler on the same header coming online is exactly the moment an isolation that has held quietly for an hour gets tested for real — reverifying the lock now, before anyone answers that call, is what confirms the tag is still where it was left rather than finding out from a sudden pressure change with your hands still on the tube sheet.",
      missNote: "The roll continued while the isolation went unverified. A lock nobody rechecked at the moment another unit wanted to start up is a lock that was only ever assumed to still be there.",
      wrongNote: "It is the lockout station. Nothing about this drum is provably isolated until that lock is looked at again.",
    },
    {
      id: "early-close-call",
      kind: "Manway pressure",
      after: "seal-weld", delay: 4, seconds: 12,
      alert: "Someone outside is starting to swing the manway door shut on a schedule push, before the foreign-object check is done.",
      cue: "Prop the manway open until the drum has actually been walked clear.",
      target: "manway-prop",
      why: "A manway closing on a schedule rather than on a finished foreign-object check is how a dropped wrench ends up sealed inside a boiler drum — the prop is what buys the time this last check actually needs, regardless of what the schedule outside the drum is asking for.",
      missNote: "The door swung most of the way shut while the drum still had not been walked for tools. Whatever this crew forgot to look for stayed inside a drum that then became difficult to reopen without another permit.",
      wrongNote: "That is not it. The manway prop is what actually keeps this door from closing before the drum is checked clear.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Boilermakers Local 549 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, IBBT_ACCENT);

    // ------------------------------------------------------------- floor and plant backdrop
    const floorTex = surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 6 });
    const floor = box(g, 6.4, 0.1, 5.8, 0, 0.05, -0.1, 0xffffff, { rough: 0.85, metal: 0.3 });
    floor.material = texturedMat(floorTex, { rough: 0.75, metal: 0.4 });

    const wallTex = surfaceTexture((cx, w, h) => rustFace(cx, w, h, {}), { repeat: 3 });
    const backWall = box(g, 5.6, 2.8, 0.14, 0, 1.4, -2.7, 0xffffff, { rough: 0.75, metal: 0.3 });
    backWall.material = texturedMat(wallTex, { rough: 0.75, metal: 0.35 });

    // ------------------------------------------------------------- the boiler drum
    const boiler = group(g, -0.3, 0, -1.3, 0.15);
    cyl(boiler, 0.75, 0.75, 1.9, 0, 1.0, 0, 0x6b747c, { rough: 0.5, metal: 0.5, seg: 24 });
    holoTag(boiler, "Boiler drum — Tube Bank A", 0, 2.1, 0, { css: "#d8232a", w: 0.6 });

    const gaugeFace = decal(boiler, 0.3, 0.18, -0.76, 1.3, 0.2,
      signFace("180 psig\n420°F", { bg: "#0d1c24", accent: "#d8232a", fg: "#ffc9bf", scale: 0.28 }), { glow: true, ei: 0.85, px: 256 });
    gaugeFace.rotation.y = -Math.PI / 2;
    reg2(gaugeFace, "drum-gauge");

    // Manway, propped open, tube sheet visible inside.
    const manway = group(boiler, 0.76, 0.7, 0.2, 0.4);
    torus(manway, 0.28, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8, seg2: 22 });
    const manwayDoor = box(manway, 0.5, 0.5, 0.05, 0.35, 0, 0, 0x3c444c, { rough: 0.5, metal: 0.5 });
    holoTag(manway, "Manway", 0, 0.4, 0.06, { css: "#d8232a", w: 0.3 });
    const propRod = cyl(manway, 0.02, 0.02, 0.4, 0.18, -0.15, 0.1, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    holoTag(propRod, "Manway prop", 0, 0.24, 0, { css: "#d8232a", w: 0.34 });
    reg2(propRod, "manway-prop");

    // Tube sheet inside the drum: a grid of tube ends, one failed.
    const tubeSheet = group(boiler, 0, 0.9, 0.7);
    box(tubeSheet, 1.3, 1.3, 0.06, 0, 0, 0, 0x545c63, { rough: 0.6, metal: 0.5 });
    const tubeEnds = [];
    for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
      const t = cyl(tubeSheet, 0.045, 0.045, 0.08, c * 0.2, r * 0.2, 0.05, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 12, open: true });
      tubeEnds.push(t);
    }
    const failedTube = tubeEnds[12];
    failedTube.material = mat(0x2b3138, { rough: 0.7 });
    holoTag(tubeSheet, "Failed tube", 0, -0.4, 0.05, { css: "#f0645b", w: 0.34 });
    reg2(failedTube, "tube-sheet-hole");
    const nearCut = torus(tubeSheet, 0.05, 0.008, 0, 0, 0.09, 0x8b929a, { rough: 0.5, metal: 0.6 });
    reg2(nearCut, "near-end-cut");
    const farCut = torus(tubeSheet, 0.05, 0.008, 0, 0, 0.02, 0x8b929a, { rough: 0.5, metal: 0.6 });
    reg2(farCut, "far-end-cut");
    hits["tube-extraction"] = failedTube;

    const wallLossTube = tubeEnds[7];
    wallLossTube.material = mat(0xb15a2c, { rough: 0.85 });
    holoTag(tubeSheet, "Wall loss", 0.2, 0.5, 0.05, { css: "#f0645b", w: 0.3 });
    reg2(wallLossTube, "wall-loss-tube");
    const discolour = box(tubeSheet, 0.35, 0.35, 0.01, -0.3, -0.1, 0.031, 0x8a5a3a, { rough: 0.8, cast: false });
    holoTag(tubeSheet, "Overheat discolouration", 0, 0.24, 0, { css: "#f0645b", w: 0.44 });
    reg2(discolour, "overheat-discolour");
    const looseFerrule = torus(tubeSheet, 0.05, 0.012, 0.4, 0.4, 0.06, 0xd8b23a, { rough: 0.5, metal: 0.5 });
    holoTag(tubeSheet, "Loose ferrule", 0, 0.14, 0, { css: "#f0645b", w: 0.32 });
    reg2(looseFerrule, "loose-ferrule");

    const liveAdjacent = torus(tubeSheet, 0.06, 0.014, -0.5, -0.4, 0.06, 0xd8232a, { rough: 0.5, metal: 0.5 });
    holoTag(tubeSheet, "Header valve — unproven", 0, 0.16, 0, { css: "#f0645b", w: 0.48 });
    reg2(liveAdjacent, "live-adjacent-tube");

    // ------------------------------------------------------------- lockout station
    const lockCab = group(g, -1.9, 0, -1.9, 0.4);
    box(lockCab, 0.4, 0.6, 0.16, 0, 0.4, 0, 0x545e67, { rough: 0.5, metal: 0.5 });
    const hasp = torus(lockCab, 0.02, 0.006, 0, 0.5, 0.09, CITY.steel, { rough: 0.3, metal: 0.9 });
    reg2(hasp, "lockout-station");
    const lock1 = lockTag(lockCab, -0.06, 0.5, 0.1, { color: 0xd8232a });
    void lock1;

    // ------------------------------------------------------------- tool bench + hazards
    const bench = group(g, -2.0, 0, 0.4);
    slab(bench, 1.0, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const expanderWrench = group(bench, -0.2, 0.72, -0.1, 0.3);
    box(expanderWrench, 0.06, 0.2, 0.06, 0, 0.1, 0, 0x3a78c9, { rough: 0.4, metal: 0.3 });
    holoTag(expanderWrench, "Tube expander wrench", 0, 0.26, 0, { css: "#d8232a", w: 0.44 });
    reg2(expanderWrench, "expander-wrench");
    const cheaterBar = group(bench, 0.05, 0.72, -0.15, 0.1);
    cyl(cheaterBar, 0.018, 0.018, 0.35, 0, 0.18, 0, 0x2b2f33, { rough: 0.6, metal: 0.3, seg: 10 });
    holoTag(cheaterBar, "Cheater bar", 0, 0.4, 0, { css: "#f0645b", w: 0.32 });
    reg2(cheaterBar, "cheater-bar");

    const grinder = group(bench, 0.25, 0.72, -0.1, -0.2);
    box(grinder, 0.08, 0.06, 0.2, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    cyl(grinder, 0.05, 0.05, 0.015, 0, 0.05, 0.13, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    holoTag(grinder, "Bevel grinder", 0, 0.2, 0, { css: "#d8232a", w: 0.32 });
    reg2(grinder, "grinder");

    const grinderNoGuard = group(g, 1.9, 0, 0.5, 0.2);
    box(grinderNoGuard, 0.08, 0.06, 0.22, 0, 0.4, 0, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    cyl(grinderNoGuard, 0.055, 0.055, 0.012, 0, 0.4, 0.14, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    holoTag(grinderNoGuard, "Guard off — tighter fit?", 0, 0.56, 0, { css: "#f0645b", w: 0.5 });
    reg2(grinderNoGuard, "guard-off-grinder");

    const newTubeStub = group(g, -1.5, 0, 1.0, -0.3);
    cyl(newTubeStub, 0.045, 0.045, 0.9, 0, 0.45, 0, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 14 });
    holoTag(newTubeStub, "New tube stub", 0, 0.95, 0, { css: "#d8232a", w: 0.36 });
    reg2(newTubeStub, "new-tube-stub");

    const weldTorch = group(g, -1.2, 0, 1.5, 0.3);
    box(weldTorch, 0.04, 0.16, 0.04, 0, 0.18, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    holoTag(weldTorch, "Weld torch", 0, 0.3, 0, { css: "#d8232a", w: 0.32 });
    reg2(weldTorch, "weld-torch");
    const weldSpark = particles(weldTorch, 16, 0xffb347, { size: 0.02, life: 0.3, additive: true, opacity: 0.6 });
    weldSpark.visible = false;

    const dyePenKit = instrument(bench, 0.2, 0.75, 0.1, { idle: "-- found", color: IBBT_ACCENT });
    holoTag(dyePenKit, "Dye-penetrant kit", 0, 0.16, 0, { css: "#d8232a", w: 0.42 });
    reg2(dyePenKit, "dye-pen-kit");

    // -------------------------------------------------------------- FOD hazards
    const droppedWrench = box(boiler, 0.16, 0.03, 0.03, 0.2, 0.65, 0.6, 0x3a78c9, { rough: 0.5, metal: 0.4 });
    holoTag(boiler, "Wrench in the drum", 0, 0.14, 0.05, { css: "#f0645b", w: 0.4 });
    reg2(droppedWrench, "wrench-in-drum");
    reg2(droppedWrench, "dropped-wrench-in-drum");
    const looseBolt = cyl(tubeSheet, 0.012, 0.012, 0.03, 0.5, -0.5, 0.05, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(tubeSheet, "Loose bolt", 0, 0.1, 0, { css: "#f0645b", w: 0.32 });
    reg2(looseBolt, "loose-bolt");
    const spatterBits = group(tubeSheet, 0.1, -0.35, 0.05);
    for (let i = 0; i < 4; i++) ball(spatterBits, 0.008, i * 0.02 - 0.03, 0, 0, 0x2b2f33, { rough: 0.7 });
    holoTag(spatterBits, "Loose spatter", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg2(spatterBits, "weld-spatter-loose");

    // ------------------------------------------------------------------- paperwork + crew
    const order = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,4,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9a89a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("REPAIR WORK ORDER RA-118", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4ecec";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("TUBE BANK A — ROW 3, TUBE 12", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9a89a";
      ["Safe entry: per the permit", "Expansion: per the code",
        "Weld: ASME Section IX qualified", "Inspection: dye penetrant, clear",
        "Repair form: NBIC, inspector witness"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBBT_ACCENT });
    reg2(order, "work-order");

    const permitBoard = group(g, -2.2, 0, -0.9, 0.3);
    slab(permitBoard, 0.2, 0.16, 0.02, 0, 1.0, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    decal(permitBoard, 0.18, 0.14, 0, 1.0, 0.011, signFace("CSP\nPENDING", { bg: "#11181f", accent: "#d8232a", scale: 0.3 }), { px: 220 });
    holoTag(permitBoard, "Confined-space permit", 0, 1.14, 0, { css: "#d8232a", w: 0.4 });
    reg2(permitBoard, "csp-permit");

    const stampForm = holoPanel(g, 0.42, 0.3, -0.4, 1.55, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ecec";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("NB REPAIR FORM", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("inspector witness line", w / 2, h * 0.68);
    }, { accent: IBBT_ACCENT });
    reg2(stampForm, "nb-stamp-form");

    const chest = toolChest(g, 2.1, 1.6, { ry: -0.6, color: IBBT_ACCENT });
    void chest;

    const foreman = standingFigure(g, -2.5, 1.25, { ry: -0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.6, 1.6, 2.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,4,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ecec";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("wall loss · ferrule · expander feel", w / 2, h * 0.68);
    }, { accent: IBBT_ACCENT });
    reg2(checkin, "ibbt-crew-checkin");

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.6, 0.93, 2.1, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Repair closeout log", -2.6, 1.12, 2.1, { css: "#8fa9c4", w: 0.44 });
    reg2(closingLog, "ibbt-closing-log");

    // ----------------------------------------------------------------- state
    let doorClosing = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.3, 1.3, -0.8),

      onStepComplete(step) {
        if (step.id === "cut-out-tube") { failedTube.visible = false; }
        if (step.id === "insert-new-tube") newTubeStub.position.set(0, 0.9, 1.02);
        if (step.id === "weld-inspect") {
          repaint(dyePenKit.userData.screen, signFace("CLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (step.id === "final-walk") {
          droppedWrench.visible = false;
          looseBolt.visible = false;
          spatterBits.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "adjacent-startup-call") hasp.material = mat(0xf0645b, { rough: 0.5, metal: 0.5, emissive: 0xf0645b, ei: 1.0 });
        if (it.id === "early-close-call") { doorClosing = true; manwayDoor.rotation.y = 0.35; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "adjacent-startup-call") hasp.material = mat(0xb8b8b8, { rough: 0.3, metal: 0.9 });
        if (it.id === "early-close-call") { doorClosing = false; manwayDoor.rotation.y = 0; }
      },

      onHazard() {},

      animate(t, dt) {
        if (weldSpark.visible) weldSpark.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.5, -0.4);
        if (doorClosing) manwayDoor.rotation.y = Math.min(0.8, manwayDoor.rotation.y + dt * 0.3);
        void t;
      },
    };
  },
};
