import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel,
  standingFigure, surfaceTexture, texturedMat, palette, gratingFace, concreteFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pressure Vessel Confined Entry and Hot Work VR — Building
// Systems & Facilities, the fifth of the Insulators and Boilermakers pack.
// A patch weld on the inside wall of a process vessel: the joint permit and
// hot-work permit read together, the atmosphere tested, the vessel blanked
// and bled to zero energy, the fire watch posted and combustibles cleared,
// the crew harnessed in through the manway, the patch ground and welded
// with the atmosphere rechecked mid-job, and the crew out and counted
// before the manway closes on a clean foreign-object walk.
//
// Sited generically: no plant name, no vessel manufacturer, no real permit
// number the registry is not sure of — the atmosphere and pressure figures
// are "per the permit".

const IBPV_ACCENT = 0xf2c14b;
const IBPV_PAL = palette("utility");

export const SIM_IB_PRESSURE_VESSEL_CONFINED_ENTRY_AND_HOT_WORK = {
  id: "ib-pressure-vessel-confined-entry-and-hot-work",
  index: "356",
  domain: "Facilities",
  trade: "Boilermaker, pressure vessel confined entry and hot work — Boilermakers Local 549",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Boilermakers Local 549 apprenticeship and training; OSHA 29 CFR 1910.146 permit-required confined spaces; 29 CFR 1910.252 welding, cutting and brazing general requirements; NFPA 51B fire prevention during welding, cutting and other hot work; ASME Section IX welding qualification for the patch",
  name: "Pressure Vessel Confined Entry and Hot Work",
  title: simTitle("Pressure Vessel Confined Entry and Hot Work"),
  tagline: "A patch weld inside a process vessel, entered on a proven atmosphere and welded behind a posted fire watch with the combustibles already cleared",
  accent: IBPV_ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "vessel-entered-safe", name: "Vessel Entered Safe", note: "Isolated, tested, fire-watched and walked clear before the manway closed" },

  game: system({
    name: "Confined Entry Certified",
    currency: "ENTRY",
    ranks: ["Hole Watch", "Entrant", "Lead Entrant", "Entry Supervisor", "Confined Entry Certified"],
    badges: [
      { id: "zero-energy-proven", name: "Zero Energy Proven", note: "Never entered before isolation and atmosphere were both confirmed", test: AWARD.safe },
      { id: "weld-steady", name: "Weld Steady", note: "Held every gauge and track reading near band centre", test: AWARD.precise(0.72) },
      { id: "entry-disciplined", name: "Entry Disciplined", note: "Completed the entry sequence with no correction", test: AWARD.stepClean("entry-sequence") },
    ],
    challenges: [
      { id: "clean-entry", name: "Clean Entry", note: "No corrections from the permit to the headcount", test: AWARD.clean },
      { id: "steady-bead", name: "Steady Bead", note: "Held the patch weld through the whole pass", test: AWARD.unbroken },
      { id: "fast-patch", name: "Fast Patch", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unblanked-line": "That inlet line into the vessel reads closed but was never actually blanked. A closed valve is a single point of failure that can be reopened by someone who does not know you are inside — a blank flange bolted in behind it is what makes the isolation something nobody can accidentally undo while you are welding on the other side of it.",
    "solvent-rag-near-weld": "There is a solvent-soaked rag sitting inside the vessel a few feet from where the torch is about to run. Solvent vapour has no respect for how far away the rag looks from the arc — it travels, it pools in the low points of a vessel exactly like this one, and it needs one spark to turn a patch weld into a flash fire with the crew still inside.",
    "torch-before-fire-watch": "You are reaching for the torch before the fire watch has actually been posted at the vessel opening. Hot work without someone stationed outside watching for what the welder cannot see — a smoulder starting behind them, a spark that landed somewhere out of sight — is exactly the gap NFPA 51B's fire watch requirement exists to close.",
    "unclipped-entry": "You are stepping through the manway without your retrieval line clipped to the harness. Inside this vessel there is no second way out if something goes wrong, and a line clipped before entry is what lets the attendant outside actually pull you clear — a line clipped after entry is a line that was never really there when it mattered.",
  },

  lateNotes: {
    "grind-target": "The grinding starts once the vessel is confirmed isolated and the atmosphere has tested safe — not while either is still unconfirmed.",
    "weld-target": "The weld goes on once the surface is ground and prepped and the fire watch is actually posted, not before either one is true.",
  },

  steps: [
    {
      id: "permit", kind: "select", target: "dual-permit",
      title: "Read the confined-space and hot-work permits together",
      cue: "Confirm the vessel, the isolation points and the hot-work conditions named on both permits.",
      why: "These two permits govern the same few feet of space at the same time, and reading them separately is how a crew ends up isolated for confined entry but not actually cleared for hot work, or fire-watched for welding but never proven zero-energy for entry. Read together, they are one job; read apart, each one only covers half of what is about to happen.",
    },
    {
      id: "atmosphere-test", kind: "gauge", target: "gas-meter",
      title: "Test the vessel atmosphere",
      cue: "Sample the vessel interior and commit only inside the safe oxygen range.",
      why: "A vessel that has been closed up holds whatever atmosphere was last inside it, and that does not announce itself to anyone standing at the manway — the meter is the only thing that actually tells oxygen-deficient or oxygen-enriched apart from ordinary air, and both kill for different reasons.",
      gauge: {
        label: "VESSEL ATMOSPHERE — OXYGEN", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)} % O₂`,
        missNote: "Outside the safe range. Ventilate the vessel and re-test before anyone's head goes through that manway.",
      },
    },
    {
      id: "isolate-vessel", kind: "sequence",
      targets: ["inlet-blank", "outlet-blank", "bleed-valve"],
      itemNames: { "inlet-blank": "inlet blanked", "outlet-blank": "outlet blanked", "bleed-valve": "bleed valve opened" },
      title: "Isolate the vessel to zero energy",
      cue: "Blank the inlet, blank the outlet, then open the bleed valve to prove zero pressure.",
      why: "Blanks on both the inlet and outlet are what actually separate this vessel from the rest of the process — a valve alone can be reopened by someone who does not know you are inside it, but a bolted blank cannot be undone by a mistake at a control panel three rooms away. The bleed valve open afterward is what proves the isolation rather than assuming it.",
      outOfOrderNote: "Wrong order — both blanks go in before the bleed valve opens, so the bleed is confirming zero energy rather than releasing line pressure into an unisolated vessel.",
    },
    {
      id: "combustibles-clear", kind: "find", noHint: true,
      targets: ["solvent-rag", "cardboard-scrap", "oil-can"],
      itemNames: { "solvent-rag": "the solvent-soaked rag", "cardboard-scrap": "the cardboard scrap", "oil-can": "the open oil can" },
      itemNotes: {
        "solvent-rag": "A solvent-soaked rag inside a vessel about to see a welding arc is fuel sitting exactly where the spark is going — it comes out of the vessel entirely, not just moved to the far side of it.",
        "cardboard-scrap": "Packing cardboard left inside the vessel catches a stray spark as easily as anything designed to burn — hot work does not start until everything combustible is actually removed, not tucked out of the direct line of the torch.",
        "oil-can": "An open oil can inside the work area is both a fire hazard and a spill waiting for someone's boot — it gets capped and removed before the torch ever gets lit.",
      },
      title: "Clear combustibles from the work area",
      cue: "Three things in this vessel will burn if the weld throws a spark their way. Find them before hot work starts.",
      why: "NFPA 51B's combustibles clearance is not a formality around the actual weld — it is the reason a patch job stays a patch job instead of becoming a fire with the crew still inside the vessel it started in. All three of these are easy to spot with the manway open and impossible to see once the torch is running.",
    },
    {
      id: "fire-watch-post", kind: "select", target: "fire-watch-station",
      title: "Post the fire watch",
      cue: "Station the fire watch at the manway with an extinguisher before hot work begins.",
      why: "The welder's own view is limited to what is directly in front of the hood, and a spark that lands somewhere else in the vessel or drifts out through the manway is exactly what the fire watch is positioned to see and act on — hot work does not start until that second set of eyes is actually in place.",
    },
    {
      id: "entry-sequence", kind: "sequence",
      targets: ["harness-on", "line-clipped", "manway-through"],
      itemNames: { "harness-on": "harness donned", "line-clipped": "retrieval line clipped", "manway-through": "through the manway" },
      title: "Enter through the manway",
      cue: "Don the harness, clip the retrieval line, then go through the manway.",
      why: "The line clips to the harness before anyone's shoulders go through the opening, because a harness without a line attached yet is a harness that does nothing for the first ten feet of an emergency retrieval — and the manway itself comes last, once the attendant outside already has hold of the other end.",
      outOfOrderNote: "Wrong order — harness on, line clipped, then through the manway with the attendant already holding the other end.",
    },
    {
      id: "grind-prep", kind: "hold", target: "grind-target", seconds: 5,
      title: "Grind and prep the patch area",
      cue: "Grind the patch area to bright metal and hold the pass steady until it is fully prepped.",
      why: "A weld only fuses to clean base metal, and scale, paint or old coating left under a patch shows up later as porosity and a joint that never actually bonded — the grind is held long enough to reach bright metal across the whole patch, not just where it is easiest to reach.",
      holdBreakNote: "Released before the area was fully bright. A patch welded over anything less than clean metal is a patch that looks finished and was never actually sound.",
    },
    {
      id: "weld-patch", kind: "track", target: "weld-target", seconds: 7,
      title: "Run the patch weld",
      cue: "Hold the torch travel speed steady across the patch.",
      why: "An even travel speed gives this patch consistent penetration across the whole repair — inside a vessel this size with limited ventilation, an unsteady pass that lingers too long in one spot also means more fume built up in the same air the crew is breathing.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "WELD TRAVEL SPEED",
        readout: (v) => (v < 0.36 ? "too slow — fume building up" : v > 0.6 ? "too fast — incomplete fusion" : "even penetration"),
      },
      holdBreakNote: "Travel speed slipped out of band. Bring it back even before this patch has a thin spot the vessel's next pressure test will find.",
    },
    {
      id: "recheck-atmosphere", kind: "gauge", target: "gas-meter",
      title: "Recheck the atmosphere mid-job",
      cue: "Sample the atmosphere again and commit only inside the safe range.",
      why: "Welding fume and shielding gas both change the air inside a confined vessel while the work is happening, not just before it starts — periodic monitoring is what catches an atmosphere drifting out of the safe range while the crew is still inside breathing it, rather than finding out only when someone starts to feel it.",
      gauge: {
        label: "VESSEL ATMOSPHERE — MID-JOB", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)} % O₂`,
        missNote: "Drifted outside the safe range. Ventilate before the weld continues — the atmosphere does not wait for a convenient stopping point.",
      },
    },
    {
      id: "weld-inspect", kind: "select", target: "inspection-mirror",
      title: "Visually inspect the finished patch",
      cue: "Check the weld bead with the inspection mirror for undercut, porosity or missed spots.",
      why: "A patch inside a vessel is welded once and inspected before anyone leaves, because a defect found now is a defect fixed with the crew and the equipment still in place — the same defect found during the vessel's next pressure test means reopening a job that was supposed to be finished.",
    },
    {
      id: "exit-sequence", kind: "sequence",
      targets: ["line-unclip", "manway-exit", "headcount"],
      itemNames: { "line-unclip": "retrieval line unclipped", "manway-exit": "exit through the manway", "headcount": "headcount confirmed" },
      title: "Exit and confirm headcount",
      cue: "Unclip the retrieval line, exit through the manway, then confirm the headcount with the attendant.",
      why: "The headcount at the end is what actually proves everyone who went in has come out — a count that never happens is how a second entrant, forgotten in the paperwork rush, ends up locked inside a vessel about to be closed up and returned to service.",
      outOfOrderNote: "Wrong order — unclip, exit through the manway, then the headcount confirms everyone is actually out.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["dropped-rod", "loose-grinding-disc", "smoldering-scrap"],
      itemNames: { "dropped-rod": "the dropped welding rod stub", "loose-grinding-disc": "the loose grinding disc", "smoldering-scrap": "the smouldering scrap" },
      itemNotes: {
        "dropped-rod": "A welding rod stub left inside the vessel is foreign-object debris the moment the manway closes — it gets picked up now, while the crew that dropped it is still standing right there.",
        "loose-grinding-disc": "A grinding disc left loose inside the vessel is exactly the kind of debris a foreign-object check exists to catch before it becomes something rattling around inside a pressurised vessel.",
        "smoldering-scrap": "A scrap of packing still smouldering from a stray spark does not go out on its own inside a closed vessel — it gets found and fully extinguished before the fire watch's post-work watch period even starts, not assumed dead because the flame is not visible.",
      },
      title: "Walk the vessel before closing the manway",
      cue: "Three things inside this vessel should not be there. Find them before anyone closes the manway.",
      why: "The manway makes the inside of this vessel invisible again the moment it closes, and a dropped rod, a loose disc or a scrap still smouldering are the three things nobody wants to discover only after that happens — all three are still in plain sight right now, with the crew and their tools still on hand.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibpv-crew-checkin",
      title: "Check in with the entry supervisor",
      cue: "Report the atmosphere readings, the fire watch's post-work observation period, and how the entry felt.",
      why: "The entry supervisor is the one who closes out the confined-space permit, and that closeout depends on both atmosphere readings and confirmation that the fire watch actually held its post-work observation period — none of that happens unless the crew reports it directly rather than assuming the paperwork will catch up on its own.",
    },
    {
      id: "closing-log", kind: "select", target: "ibpv-closing-log",
      title: "Sign the entry and hot-work closeout log",
      cue: "Record the atmosphere readings, the weld inspection result and the headcount, then sign.",
      why: "The closeout log ties the atmosphere readings, the finished weld and the confirmed headcount to this specific permit, so an inspector or the next crew into this vessel has an actual record of what was tested and found rather than a patch that simply looks finished from the outside.",
    },
  ],

  interrupts: [
    {
      id: "atmosphere-drift",
      kind: "Atmosphere alarm",
      after: "weld-patch", delay: 4, seconds: 12,
      alert: "The continuous atmosphere monitor has alarmed — oxygen is dropping fast inside the vessel while the weld continues.",
      cue: "Get the ventilation blower running before anyone takes another breath of that air.",
      target: "ventilation-blower",
      why: "Welding and purge gas can both displace oxygen inside a confined vessel faster than anyone inside will notice on their own, and an alarming monitor is not a reading to keep working through — the blower is what actually restores breathable air, and it starts the moment the alarm sounds, not once the current pass is finished.",
      missNote: "The weld continued while the monitor kept alarming. Oxygen displaced by welding fume inside a closed vessel does not announce itself to the person breathing it until it already has them.",
      wrongNote: "It is the ventilation blower. Nothing else in this vessel matters until the air is moving again.",
    },
    {
      id: "attendant-distraction",
      kind: "Attendant distracted",
      after: "grind-prep", delay: 4, seconds: 12,
      alert: "The outside attendant has been pulled into a radio call and has turned away from the manway.",
      cue: "Hail the attendant back before continuing — the buddy system just lapsed.",
      target: "attendant-radio",
      why: "An attendant who is not actually watching the manway is not an attendant for the minutes their attention is somewhere else, and a confined space entry with nobody watching the door is running without the one safeguard the whole permit depends on — hailing them back is what closes that gap the moment it opens rather than after something goes wrong inside it.",
      missNote: "Work inside the vessel continued while the attendant stayed turned away. The buddy system exists precisely for the minutes it was not being kept.",
      wrongNote: "That is not it. The attendant radio is what actually brings their eyes back to this manway.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Boilermakers Local 549 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, IBPV_ACCENT);

    // ------------------------------------------------------------- floor and plant backdrop
    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "broom", tone: "#706b62", tone2: "#615c52",
    }), { repeat: 6 });
    const floor = box(g, 6.4, 0.1, 5.8, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9 });

    const wallTex = surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 3 });
    const backWall = box(g, 5.4, 2.6, 0.12, 0, 1.3, -2.8, 0xffffff, { rough: 0.7, metal: 0.3 });
    backWall.material = texturedMat(wallTex, { rough: 0.65, metal: 0.35 });

    // ------------------------------------------------------------- the vessel
    const vessel = group(g, -0.3, 0, -1.3, 0.15);
    cyl(vessel, 0.85, 0.85, 2.0, 0, 1.15, 0, IBPV_PAL.structure, { rough: 0.55, metal: 0.4, seg: 24, finish: "painted" });
    holoTag(vessel, "Process vessel V-204", 0, 2.35, 0, { css: "#f2c14b", w: 0.5 });

    const manway = group(vessel, 0.86, 0.9, 0.2, 0.4);
    torus(manway, 0.28, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8, seg2: 22 });
    holoTag(manway, "Manway", 0, 0.4, 0.06, { css: "#f2c14b", w: 0.3 });
    hits["manway-through"] = manway;
    hits["manway-exit"] = manway;

    const inletValve = valveWheel(vessel, -0.5, 1.8, 0.5, { r: 0.08, color: 0xf2c14b, body: IBPV_PAL.structure });
    holoTag(inletValve, "Inlet", 0, 0.24, 0, { css: "#f2c14b", w: 0.3 });
    const inletBlank = torus(inletValve, 0.09, 0.02, 0, -0.14, 0, 0x8b929a, { rough: 0.5, metal: 0.6 });
    inletBlank.rotation.y = Math.PI / 2;
    reg2(inletBlank, "inlet-blank");
    const unblankedLine = valveWheel(vessel, -0.7, 1.5, 0.3, { r: 0.07, color: 0xd8232a, body: IBPV_PAL.structure });
    holoTag(unblankedLine, "Line — closed, not blanked", 0, 0.22, 0, { css: "#f0645b", w: 0.6 });
    reg2(unblankedLine, "unblanked-line");
    const outletValve = valveWheel(vessel, 0.5, 0.5, 0.5, { r: 0.08, color: 0xf2c14b, body: IBPV_PAL.structure });
    holoTag(outletValve, "Outlet", 0, 0.22, 0, { css: "#f2c14b", w: 0.32 });
    const outletBlank = torus(outletValve, 0.09, 0.02, 0, -0.14, 0, 0x8b929a, { rough: 0.5, metal: 0.6 });
    outletBlank.rotation.y = Math.PI / 2;
    reg2(outletBlank, "outlet-blank");
    const bleedValve = valveWheel(vessel, 0, 2.15, 0, { r: 0.05, color: 0x4fd1ff, body: IBPV_PAL.structure });
    holoTag(bleedValve, "Bleed valve", 0, 0.16, 0, { css: "#f2c14b", w: 0.3 });
    reg2(bleedValve, "bleed-valve");

    // Interior work targets, positioned near the manway opening.
    const interior = group(vessel, 0, 0.85, 0.7);
    const patch = box(interior, 0.3, 0.3, 0.02, 0, 0, 0.03, 0xb8402f, { rough: 0.75 });
    holoTag(interior, "Patch area", 0, 0.24, 0.05, { css: "#f2c14b", w: 0.32 });
    reg2(patch, "grind-target");
    const weldSeam = box(interior, 0.3, 0.02, 0.02, 0, 0.14, 0.04, 0x8b929a, { rough: 0.5, metal: 0.5 });
    reg2(weldSeam, "weld-target");
    weldSeam.visible = false;

    const rag = ball(interior, 0.05, -0.3, -0.2, 0.05, 0x3a3a3a, { rough: 0.85 });
    holoTag(interior, "Solvent rag", 0, 0.1, 0, { css: "#f0645b", w: 0.32 });
    reg2(rag, "solvent-rag");
    reg2(rag, "solvent-rag-near-weld");
    const cardboard = box(interior, 0.2, 0.02, 0.15, 0.3, -0.3, -0.1, 0xb8a878, { rough: 0.85 });
    holoTag(interior, "Cardboard scrap", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg2(cardboard, "cardboard-scrap");
    const oilCan = cyl(interior, 0.04, 0.04, 0.09, -0.25, -0.25, 0.1, 0xd8b23a, { rough: 0.5, metal: 0.4, seg: 12 });
    holoTag(interior, "Open oil can", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg2(oilCan, "oil-can");

    const droppedRod = cyl(interior, 0.006, 0.006, 0.1, 0.2, -0.35, 0.15, 0xf2c14b, { rough: 0.5, metal: 0.3, seg: 8 });
    holoTag(interior, "Welding rod stub", 0, 0.06, 0, { css: "#f0645b", w: 0.42 });
    reg2(droppedRod, "dropped-rod");
    const looseDisc = cyl(interior, 0.06, 0.06, 0.006, -0.1, -0.36, -0.1, 0x8b929a, { rough: 0.6, metal: 0.4, seg: 16 });
    holoTag(interior, "Grinding disc", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg2(looseDisc, "loose-grinding-disc");
    const scrapGlow = ball(interior, 0.03, 0.1, -0.35, -0.2, 0xff8a3c, { emissive: 0xff8a3c, ei: 1.6 });
    holoTag(interior, "Smouldering scrap", 0, 0.08, 0, { css: "#f0645b", w: 0.42 });
    reg2(scrapGlow, "smoldering-scrap");

    const unclippedSpot = group(vessel, 0.86, 0.9, 0.35);
    box(unclippedSpot, 0.16, 0.16, 0.16, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(unclippedSpot, "Step through unclipped?", 0, 0.2, 0, { css: "#f0645b", w: 0.5 });
    reg2(unclippedSpot, "unclipped-entry");

    // ------------------------------------------------------------- fire watch, gear, bench
    const fireWatchStation = group(g, 1.4, 0, -0.6, -0.3);
    box(fireWatchStation, 0.3, 0.5, 0.3, 0, 0.25, 0, 0xd8232a, { rough: 0.5 });
    cyl(fireWatchStation, 0.09, 0.09, 0.4, 0, 0.4, 0.2, 0xd8232a, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(fireWatchStation, "Fire watch station", 0, 0.62, 0, { css: "#f2c14b", w: 0.4 });
    reg2(fireWatchStation, "fire-watch-station");

    const torchBad = group(g, 1.9, 0, -0.2, 0.3);
    box(torchBad, 0.04, 0.16, 0.04, 0, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    holoTag(torchBad, "Torch — before fire watch?", 0, 0.32, 0, { css: "#f0645b", w: 0.56 });
    reg2(torchBad, "torch-before-fire-watch");

    const harnessRack = group(g, -2.0, 0, -0.3, 0.5);
    slab(harnessRack, 0.1, 1.3, 0.5, 0, 0.65, 0, 0x4a525a, { radius: 0.02, rough: 0.6, metal: 0.4 });
    const harness = box(harnessRack, 0.18, 0.4, 0.1, 0.08, 0.8, 0.1, 0xf2c14b, { rough: 0.65 });
    holoTag(harness, "Harness", 0, 0.24, 0, { css: "#f2c14b", w: 0.28 });
    reg2(harness, "harness-on");
    const retrievalLine = cyl(harnessRack, 0.008, 0.008, 0.6, 0.08, 1.05, 0.1, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(retrievalLine, "Retrieval line", 0, 0.34, 0, { css: "#f2c14b", w: 0.34 });
    reg2(retrievalLine, "line-clipped");
    reg2(retrievalLine, "line-unclip");

    const bench = group(g, -2.0, 0, 1.0, 0.3);
    slab(bench, 0.9, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const gasMeter = instrument(bench, -0.2, 0.75, -0.1, { idle: "-- % O₂", color: IBPV_ACCENT });
    holoTag(gasMeter, "4-gas meter", 0, 0.16, 0, { css: "#f2c14b", w: 0.34 });
    reg2(gasMeter, "gas-meter");
    const atmoAlarmLamp = ball(gasMeter, 0.016, 0.05, 0.03, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
    const mirror = instrument(bench, 0.2, 0.75, 0.1, { idle: "--", color: IBPV_ACCENT });
    holoTag(mirror, "Inspection mirror", 0, 0.16, 0, { css: "#f2c14b", w: 0.4 });
    reg2(mirror, "inspection-mirror");

    const blower = group(g, 1.6, 0, 1.2, -0.4);
    box(blower, 0.4, 0.4, 0.3, 0, 0.2, 0, 0x4a525a, { rough: 0.6, metal: 0.4 });
    const blowerBlades = group(blower, 0, 0.2, 0.16);
    for (let i = 0; i < 4; i++) box(blowerBlades, 0.24, 0.05, 0.008, 0, 0, 0, 0x9aa4ad, { rough: 0.6 }).rotation.z = (i * Math.PI) / 4;
    holoTag(blower, "Ventilation blower", 0, 0.46, 0, { css: "#f2c14b", w: 0.4 });
    reg2(blower, "ventilation-blower");

    const attendantRadio = group(g, 2.0, 0, -1.4, -0.3);
    box(attendantRadio, 0.06, 0.14, 0.04, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    holoTag(attendantRadio, "Attendant radio", 0, 1.02, 0, { css: "#f2c14b", w: 0.36 });
    reg2(attendantRadio, "attendant-radio");

    // ------------------------------------------------------------------- paperwork + crew
    const permit = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9c19a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONFINED SPACE + HOT WORK PERMIT", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4ecdc";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("VESSEL V-204 — PATCH WELD", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9c19a";
      ["Isolation: blank + bleed, per the permit", "O₂ safe range: 19.5–23.5%",
        "Fire watch: posted before hot work", "Combustibles: cleared from the vessel",
        "Weld: ASME Section IX qualified"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBPV_ACCENT });
    reg2(permit, "dual-permit");

    const chest = toolChest(g, 2.1, 1.9, { ry: -0.6, color: IBPV_ACCENT });
    void chest;

    const attendant = standingFigure(g, 1.9, -2.05, { ry: -2.6, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xe4622a });
    void attendant;

    const foreman = standingFigure(g, -2.7, 0.5, { ry: -0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.5, 1.6, 2.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2c14b"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ecdc";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — SUPERVISOR", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("atmosphere · fire watch · headcount", w / 2, h * 0.68);
    }, { accent: IBPV_ACCENT });
    reg2(checkin, "ibpv-crew-checkin");

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.5, 0.93, 2.7, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Entry and hot-work closeout log", -2.5, 1.12, 2.7, { css: "#8fa9c4", w: 0.56 });
    reg2(closingLog, "ibpv-closing-log");

    const headcountBoard = group(vessel, 0.86, 0.6, 0.35);
    box(headcountBoard, 0.14, 0.1, 0.02, 0, 0, 0, 0x1b232b, { rough: 0.6 });
    holoTag(headcountBoard, "Headcount board", 0, 0.12, 0, { css: "#f2c14b", w: 0.36 });
    reg2(headcountBoard, "headcount");

    // ----------------------------------------------------------------- state
    let ventRunning = false, atmoAlarm = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.3, 1.3, -0.8),

      onStepComplete(step) {
        if (step.id === "grind-prep") patch.material = mat(0xc0c6cc, { rough: 0.4, metal: 0.5 });
        if (step.id === "weld-patch") weldSeam.visible = true;
        if (step.id === "combustibles-clear") {
          rag.visible = false; cardboard.visible = false; oilCan.visible = false;
        }
        if (step.id === "final-walk") {
          droppedRod.visible = false; looseDisc.visible = false; scrapGlow.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "atmosphere-drift") {
          atmoAlarm = true;
          atmoAlarmLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.8, rough: 0.4 });
          repaint(gasMeter.userData.screen, signFace("LOW O2", { bg: "#2a1010", accent: "#f0645b", fg: "#ffd2ce", scale: 0.5 }));
        }
        if (it.id === "attendant-distraction") attendant.rotation.y = -1.0;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "atmosphere-drift") {
          atmoAlarm = false; ventRunning = true;
          atmoAlarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
          repaint(gasMeter.userData.screen, signFace("CLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        }
        if (it.id === "attendant-distraction") attendant.rotation.y = -2.6;
      },

      onHazard() {},

      animate(t, dt, session) {
        if (ventRunning) blowerBlades.rotation.z += dt * 10;
        void atmoAlarm;
        if (scrapGlow.visible) scrapGlow.material.emissiveIntensity = 1.2 + Math.sin(t * 8) * 0.5;

        const gg = session?.gauge;
        if (gg && !gg.committed && (session.step?.id === "atmosphere-test" || session.step?.id === "recheck-atmosphere")) {
          const o2 = (15 + gg.t * 12).toFixed(1);
          repaint(gasMeter.userData.screen, signFace(`${o2}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
