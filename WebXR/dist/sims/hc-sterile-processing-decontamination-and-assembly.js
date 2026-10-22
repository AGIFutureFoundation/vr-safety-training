import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sterile Processing Decontamination and Assembly VR —
// Healthcare Support, station two. A hospital's central sterile processing
// department rather than a single dental operatory: a case cart's whole load
// of surgical trays, taken apart and manually pre-treated before a
// washer-disinfector ever runs, counted back against the tray's own count
// sheet on the clean side, checked instrument by instrument for what a
// washer cannot fix, assembled and latched into a rigid container, run
// through a sterilizer cycle read off its own printout, and logged with the
// biological indicator that is the only proof the load actually worked.

const SPD_ACCENT = 0x4f9fd6;

export const SIM_HC_STERILE_PROCESSING_DECONTAMINATION_AND_ASSEMBLY = {
  id: "hc-sterile-processing-decontamination-and-assembly",
  index: "353",
  domain: "Healthcare Support",
  trade: "Central sterile processing technician",
  category: "Healthcare Support",
  indoor: "clinic",
  certification: "OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication for the decontamination area's enzymatic chemicals; the CDC's guideline for disinfection and sterilization in healthcare facilities; ANSI/AAMI ST79 for steam sterilization and sterility assurance; every washer-disinfector and sterilizer's own manufacturer instructions for use; SEIU-UHW and NUHW as the training bodies for central sterile processing staff",
  name: "Sterile Processing Decon & Assembly",
  title: simTitle("Sterile Processing Decon & Assembly"),
  tagline: "A case cart taken apart and pre-treated, washed to its cycle parameters, counted back against its own count sheet, assembled and latched, and sterilized with the biological indicator that proves it",
  accent: SPD_ACCENT,
  accentCss: "#4f9fd6",
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "tray-verified", name: "Tray Verified", note: "A surgical tray decontaminated, counted, assembled and sterilized with nothing skipped and nothing crossed over" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or SEIU-UHW's member resources if a load like this one has you second-guessing the count",

  game: system({
    name: "Central Sterile",
    currency: "TRAY",
    ranks: ["New Tech", "Decon Certified", "Assembly Lead", "SPD Supervisor", "Central Sterile Certified"],
    badges: [
      { id: "never-crossed-over", name: "Never Crossed Over", note: "The dirty and clean sides of the department never touched", test: AWARD.stepClean("case-cart") },
      { id: "count-matched", name: "Count Matched", note: "Every instrument verified against its own count sheet", test: AWARD.stepClean("count-verify") },
      { id: "bio-verified", name: "Bio Verified", note: "The load's biological indicator run with its control and logged", test: AWARD.stepClean("bio-log") },
    ],
    challenges: [
      { id: "clean-load", name: "Clean Load", note: "No corrections anywhere in the load", test: AWARD.clean },
      { id: "steady-cycle", name: "Steady Cycle", note: "Held the washer and the sterilizer the whole cycle, first try", test: AWARD.unbroken },
      { id: "fast-load", name: "Fast Load", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "flash-sterilize-shortcut": "That control skips straight to an immediate-use cycle on a tray that hasn't even been counted yet. Immediate-use steam sterilization is an exception for a specific, unplanned need, not a shortcut around decontamination and assembly whenever someone's in a hurry — and it is never a call this bench makes alone.",
    "dirty-clean-crossover": "That case cart is parked touching the clean assembly bench. The whole point of a decontamination area and a clean assembly area is that nothing contaminated ever touches a surface on the clean side — park it back on the dirty side before anything else moves.",
    "unlabeled-tray-decoy": "That tray on the clean side has no count sheet and no tracking label on it. An unlabeled tray can't be matched to the case it's going to or the cycle that's supposed to sterilize it — it's untraceable the moment it leaves this bench.",
    "wrong-size-pouch": "That pouch is stuffed and bulging around the tray inside it. A wrap or pouch has to fit the load without crushing the pack — steam needs room to reach every surface, and a pack this crushed hasn't got it.",
  },

  lateNotes: {
    "sterilizer-printout": "No cycle is running yet to read a printout from.",
    "record-load": "Hold that. The log isn't ready until the sterilizer cycle and the biological indicator are both read.",
  },

  steps: [
    {
      id: "ppe-decon", kind: "select", target: "ppe-decon",
      title: "Don decontamination PPE",
      cue: "Fluid-resistant gown, gloves to the elbow, mask and full face or eye protection before the case cart is opened.",
      why: "OSHA's bloodborne pathogens standard treats the decontamination area as a splash zone — a washer's spray arms and a manual pre-soak both throw contaminated fluid, and PPE rated for that is what stands between this job and a mucous-membrane exposure nobody saw coming.",
    },
    {
      id: "case-cart", kind: "select", target: "case-cart",
      title: "Receive the case cart on the dirty side only",
      cue: "Log the case cart in at the decontamination intake, never past the line into the clean assembly area.",
      why: "The dirty side and the clean side of this department exist because nothing contaminated is allowed to cross back over a clean surface — every tray in this cart is treated as contaminated until it has been all the way through the line.",
    },
    {
      id: "disassemble-open", kind: "sequence", anyOrder: true,
      targets: ["disassemble-scissors", "open-box-locks"],
      itemNames: { "disassemble-scissors": "disassemble multi-part instruments", "open-box-locks": "open every box lock and hinge" },
      title: "Disassemble and open before cleaning",
      cue: "Take multi-part instruments apart and open every hinge and box lock fully.",
      why: "A hinge closed during cleaning is a hinge the washer's spray never actually reaches — CDC guidance is explicit that instruments are cleaned open and disassembled, because a closed box lock hides exactly the debris a closed inspection would miss too.",
    },
    {
      id: "bioburden-find", kind: "find", noHint: true,
      targets: ["retained-tissue", "clogged-lumen"],
      itemNames: { "retained-tissue": "retained tissue in a hinge", "clogged-lumen": "a clogged lumened instrument" },
      itemNotes: {
        "retained-tissue": "Dried tissue sitting in an opened hinge — organic material like this can shield anything underneath it from a washer's spray the same way it shields a load from steam later on.",
        "clogged-lumen": "A lumen this blocked never gets an actual wash through its channel — it needs a manual flush before the washer, not a cycle that assumes the channel is already clear.",
      },
      title: "Check for bioburden a washer alone won't clear",
      cue: "Two instruments on this tray need attention before they go anywhere near the washer. Find them.",
      why: "A washer-disinfector cleans what water and enzymatic detergent can reach — gross bioburden in a hinge or a blocked lumen needs a hand and a brush first, because a machine cycle run over debris this size does not remove it, it just wets it.",
    },
    {
      id: "manual-presoak", kind: "select", target: "manual-presoak",
      title: "Pre-soak lumened and hinged instruments",
      cue: "Soak and manually brush lumened and hinged instruments in enzymatic solution mixed to the label's dilution, for the label's soak time.",
      why: "Enzymatic detergent breaks down protein bioburden before it dries any harder onto the instrument, and its dilution and soak time are set by its own label — too weak or too short and it's done nothing; the point is contact, per the label, not a quick dip.",
    },
    {
      id: "washer-load", kind: "hold", target: "washer-disinfector", seconds: 6,
      title: "Load and run the washer-disinfector",
      cue: "Rack the trays open-side down and hold the load through the full washer cycle.",
      why: "A washer-disinfector cycle is validated as a whole — spray pattern, detergent, temperature and time together — and opening the door partway through means none of it ran for as long as this load needed.",
      holdBreakNote: "The cycle was interrupted before it finished. A partial wash cycle leaves debris the spray arms never got the time to reach.",
    },
    {
      id: "washer-verify", kind: "gauge", target: "washer-printout",
      title: "Verify the washer-disinfector's cycle parameters",
      cue: "Read the cycle's printed temperature and commit once it's within the machine's own validated range.",
      why: "The washer's manufacturer instructions for use set the temperature and time the cycle has to actually reach for the mechanical wash to count — a cycle that finished without ever reaching that reading washed nothing, whatever the door light says.",
      gauge: { label: "WASH TEMP", speed: 0.65, green: [0.4, 0.68], readout: (t) => `${Math.round(140 + t * 40)}°F`, missNote: "That reading is outside the validated range — the load did not see what the cycle needed. Hold it for rewashing, not release." },
    },
    {
      id: "pass-through", kind: "drag", target: "clean-instrument-tray",
      title: "Pass the clean tray to the assembly side",
      cue: "Move the washed, dried tray through the pass-through window onto the assembly bench.",
      why: "The pass-through window is the one controlled crossing between the dirty and clean sides — a tray only moves through it once it's actually washed and dried, never carried around the line by hand.",
      drag: { to: "assembly-bench", radius: 0.4, missNote: "Not on the assembly bench — the clean side is the only place a washed tray belongs." },
    },
    {
      id: "count-verify", kind: "select", target: "count-sheet",
      title: "Count the tray against its count sheet",
      cue: "Verify every instrument's type and quantity against the tray's own count sheet.",
      why: "A missing instrument found in this room is a missing instrument; a missing instrument found in a patient later is a retained surgical item — the count sheet is what catches the gap here, on the bench, instead of in the OR.",
    },
    {
      id: "integrity-find", kind: "find", noHint: true,
      targets: ["broken-tip", "stained-instrument"],
      itemNames: { "broken-tip": "an instrument with a broken tip", "stained-instrument": "a stained, pitted instrument" },
      itemNotes: {
        "broken-tip": "A broken tip is a functional failure, not a cleanliness problem — sterilizing it does not fix it, and it goes to repair, not back in the tray.",
        "stained-instrument": "Staining and pitting like this usually means the instrument's surface is already compromised — it gets pulled for evaluation rather than packaged and sent out to fail on the next case.",
      },
      title: "Function-test every instrument before it's packaged",
      cue: "Two instruments on this tray are damaged, not dirty. Find them before assembly.",
      why: "A washer and a sterilizer both act on whatever instrument is in front of them — neither one checks whether the instrument still works, which is why every piece gets looked at and tested by hand before it goes back into a tray.",
    },
    {
      id: "assemble-tray", kind: "sequence",
      targets: ["tray-liner", "arrange-tray", "internal-indicator-place"],
      itemNames: { "tray-liner": "place the tray liner", "arrange-tray": "arrange instruments to the count sheet", "internal-indicator-place": "place the internal chemical indicator" },
      title: "Assemble the tray to its count sheet",
      cue: "Line the tray, arrange every instrument in the layout the count sheet shows, then place the internal indicator.",
      why: "The layout on the count sheet exists so the surgical team can see at a glance that everything is present and undamaged the moment the tray opens — a tray assembled any other way makes the OR do the counting work all over again under time pressure.",
      outOfOrderNote: "Liner, then the instruments arranged to the sheet, then the indicator on top — the indicator only proves anything if it's actually inside the finished layout.",
    },
    {
      id: "container-latch", kind: "turn", target: "rigid-container-latch",
      title: "Latch the rigid sterilization container",
      cue: "Rotate the latch fully closed and confirm the seal.",
      turn: { turns: 0.5, axis: "y", label: "CONTAINER LATCH" },
      why: "A rigid container only keeps its contents sterile if its filter and gasket seal is actually engaged — a latch left half-turned looks closed but leaves a gap steam can get through on the way in and contamination can get through on the way out.",
    },
    {
      id: "sterilizer-run", kind: "hold", target: "sterilizer-panel", seconds: 7,
      title: "Run the sterilizer cycle",
      cue: "Start the cycle and stay with it until the chamber cycles through on its own.",
      why: "Steam sterilization works by combining three numbers over the same span of minutes, not any one of them alone — a door popped open early trims all three at once, so the exposure this tray gets is whatever the shortened run happened to reach, not what the cycle was built to deliver.",
      holdBreakNote: "You broke off before the chamber finished its own cycle. Counting a shortened run as done is guessing that the missing minutes wouldn't have mattered.",
    },
    {
      id: "sterilizer-read", kind: "gauge", target: "sterilizer-printout",
      title: "Read the sterilizer's printout",
      cue: "Match the printed numbers against the sterilizer's posted spec before you sign off on this load.",
      why: "AAMI ST79 makes the paper strip, not the indicator light, the record a load's release rests on — a chamber can flash \"cycle complete\" after a run that stalled below temperature the whole way through, and only the printed trace would ever show that.",
      gauge: { label: "CHAMBER TEMP", speed: 0.7, green: [0.5, 0.72], readout: (t) => `${Math.round(250 + t * 20)}°F`, missNote: "You signed off on a printout that never actually sat inside spec. Send the load back through rather than release it on a reading like that." },
    },
    {
      id: "bio-log", kind: "sequence",
      targets: ["bio-indicator-spd", "control-indicator-spd", "record-load"],
      itemNames: { "bio-indicator-spd": "run the biological indicator", "control-indicator-spd": "run the matched control", "record-load": "record the load" },
      title: "Run the biological indicator and log the load",
      cue: "Run the biological indicator with its matched control, then close out the load record.",
      why: "A chemical indicator only shows the chamber reached conditions; the spore strip is what actually gets exposed to those conditions and either dies or doesn't, and its matched control is the reason a clean result means the spores were alive to begin with rather than dead in the vial before the cycle ever ran. None of that protects a soul, though, until it's written down against a tray someone can find again.",
      outOfOrderNote: "Run the spore strip and its control before you touch the log — a record with no result behind it is just a blank line with a timestamp.",
    },
  ],

  interrupts: [
    {
      id: "iuss-request",
      kind: "Immediate-use request",
      after: "manual-presoak", delay: 3, seconds: 12,
      alert: "The OR calls down: a case is starting and someone's asking if this tray can be rushed through on immediate-use sterilization instead of the normal line.",
      cue: "That is not a call to make alone at this bench.",
      target: "notify-supervisor",
      why: "Immediate-use sterilization exists for the case nobody could have planned around, decided under the department's own written policy — not a favor this bench hands out because a room upstairs is waiting, and skipping the decontamination and assembly already underway is not this tech's decision to make solo.",
      missNote: "A rushed tray went up without anyone with the authority to approve it actually signing off. Every step it skipped between here and the OR is now riding on a case already in progress.",
      wrongNote: "Put the call through to the supervisor first — a request like this doesn't get answered from the bench.",
    },
    {
      id: "sterilizer-fault",
      kind: "Equipment fault",
      after: "sterilizer-run", delay: 3, seconds: 11,
      alert: "The sterilizer throws a fault code and stops mid-cycle. The door stays locked.",
      cue: "Nothing inside that chamber right now counts as sterile.",
      target: "sterilizer-restart",
      why: "A chamber that faults out partway through never delivered the full exposure this tray was loaded for — clearing the fault and sending the whole load through again from the start is the only way to know what actually reached it, rather than trusting however far a broken run happened to get.",
      missNote: "The faulted load sat behind a locked door with nobody logging what happened. Whoever opens that chamber next has no way to tell a stopped cycle from a finished one just by looking.",
      wrongNote: "Clear the fault and requeue the whole tray — a chamber that stopped partway doesn't get trusted for however far it got.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, SPD_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 6, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.4, metal: 0.55, color: 0xc7cdd2 });

    // A painted demarcation stripe across the floor between dirty and clean.
    const stripeTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#2b3138"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e8c33b";
      for (let i = 0; i < 8; i++) cx.fillRect((i * w) / 8, 0, w / 16, h);
    }, { repeat: 1, px: 128 });
    const stripe = slab(g, 5.0, 0.008, 0.2, 0, 0.002, -0.9, 0xe8c33b, { radius: 0.0, cast: false });
    stripe.material = texturedMat(stripeTex, { rough: 0.7, color: 0xe8c33b });

    // ---------------------------------------------------------------- decon side
    const decon = group(g, -1.6, 0, -2.0);
    box(decon, 1.3, 0.86, 0.6, 0, 0.43, 0, 0xb03a2f, { rough: 0.55, metal: 0.1 });
    const deconTop = slab(decon, 1.3, 0.04, 0.6, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    deconTop.material = steelMat();
    const ppeStub = box(decon, 0.16, 0.1, 0.06, -0.4, 0.93, 0.15, 0xf2c14b, { rough: 0.75 });
    holoTag(decon, "Decon PPE", -0.4, 1.05, 0.15, { css: SPD_ACCENT, w: 0.36 });
    reg(hits, ppeStub, "ppe-decon");

    const caseCart = group(g, -2.6, 0, -2.2);
    box(caseCart, 0.7, 0.8, 0.5, 0, 0.4, 0, 0x8b929a, { rough: 0.5, metal: 0.45 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(caseCart, 0.05, 0.05, 0.04, sx * 0.3, 0.02, sz * 0.2, 0x2b3138, { rough: 0.6, seg: 10 });
    holoTag(caseCart, "Case cart", 0, 0.86, 0, { css: SPD_ACCENT, w: 0.36 });
    reg(hits, caseCart, "case-cart");

    // Dirty tray on the decon bench: instruments to disassemble/open.
    const dirtyTray = group(decon, 0, 0.9, 0.15);
    box(dirtyTray, 0.5, 0.02, 0.32, 0, 0, 0, 0xdfe4e5, { rough: 0.5, metal: 0.2 });
    const scissors = group(dirtyTray, -0.14, 0.02, -0.05);
    box(scissors, 0.14, 0.008, 0.02, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    box(scissors, 0.03, 0.03, 0.02, 0.06, 0.01, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    holoTag(scissors, "Multi-part clamp", 0, 0.06, 0, { css: SPD_ACCENT, w: 0.36 });
    reg(hits, scissors, "disassemble-scissors");
    const hinged = group(dirtyTray, 0.12, 0.02, 0.02);
    torus(hinged, 0.03, 0.006, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
    holoTag(hinged, "Box lock", 0, 0.05, 0, { css: SPD_ACCENT, w: 0.32 });
    reg(hits, hinged, "open-box-locks");
    const tissueSpot = ball(dirtyTray, 0.009, -0.05, 0.012, 0.08, 0x8e1c1c, { rough: 0.7, seg: 8 });
    holoTag(tissueSpot, "Retained tissue", 0, 0.05, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, tissueSpot, "retained-tissue");
    const lumenTool = cyl(dirtyTray, 0.006, 0.006, 0.14, 0.1, 0.02, 0.1, 0xdfe4e5, { rough: 0.35, metal: 0.5, seg: 8 });
    lumenTool.rotation.z = Math.PI / 2;
    holoTag(lumenTool, "Clogged lumen", 0, 0.05, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, lumenTool, "clogged-lumen");

    // Pre-soak sink with enzymatic solution.
    const soakSink = group(g, -2.7, 0, -0.8);
    box(soakSink, 0.6, 0.5, 0.4, 0, 0.25, 0, 0xdfe4e5, { rough: 0.5, metal: 0.2 });
    const soakTank = box(soakSink, 0.5, 0.14, 0.32, 0, 0.5, 0, 0x8fb3c4, { rough: 0.2, metal: 0.2, opacity: 0.5, transparent: true });
    void soakTank;
    holoTag(soakSink, "Enzymatic pre-soak", 0, 0.62, 0, { css: SPD_ACCENT, w: 0.44 });
    reg(hits, soakSink, "manual-presoak");

    // ------------------------------------------------------------------ washer
    const washer = group(g, -0.4, 0, -2.2);
    box(washer, 0.9, 1.0, 0.7, 0, 0.5, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
    const washerDoor = box(washer, 0.6, 0.6, 0.03, 0, 0.55, 0.36, 0xb9c4c9, { rough: 0.3, metal: 0.5, opacity: 0.55, transparent: true });
    void washerDoor;
    const washerLamp = ball(washer, 0.014, 0.32, 0.85, 0.36, 0xd8232a, { emissive: 0xd8232a, ei: 1.4, cast: false, seg: 8, seg2: 6 });
    reg(hits, washerLamp, "washer-disinfector");
    holoTag(washer, "Washer-disinfector", 0, 1.06, 0, { css: SPD_ACCENT, w: 0.5 });
    const washerBubbles = particles(washer, 22, 0xbfe4f2, { size: 0.012, life: 0.45, additive: false, opacity: 0.5 });

    const washerPrinter = holoPanel(g, 0.42, 0.28, -0.4, 1.4, -2.75, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcefff";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("-- °F", w * 0.08, h * 0.4);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("wash cycle", w * 0.08, h * 0.72);
    }, { accent: SPD_ACCENT });
    reg(hits, washerPrinter, "washer-printout");

    // The passed-through clean tray.
    const cleanTray = group(g, -0.4, 0.9, -1.6);
    box(cleanTray, 0.42, 0.03, 0.28, 0, 0, 0, 0xf4f8fa, { rough: 0.4, metal: 0.15 });
    holoTag(cleanTray, "Clean tray", 0, 0.07, 0, { css: SPD_ACCENT, w: 0.4 });
    reg(hits, cleanTray, "clean-instrument-tray");

    // ------------------------------------------------------------- clean crossover decoy
    const crossoverCart = group(g, 1.0, 0, -1.0);
    box(crossoverCart, 0.6, 0.7, 0.4, 0, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    holoTag(crossoverCart, "Case cart — parked here?", 0, 0.78, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, crossoverCart, "dirty-clean-crossover");

    // ---------------------------------------------------------------- assembly side
    const assembly = group(g, 1.4, 0, 0.4);
    box(assembly, 1.3, 0.86, 0.6, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const assemblyTop = slab(assembly, 1.3, 0.04, 0.6, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    assemblyTop.material = steelMat();
    const benchMarker = box(assembly, 1.2, 0.3, 0.5, 0, 1.02, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["assembly-bench"] = benchMarker;

    const countPanel = holoPanel(g, 0.5, 0.36, 0.9, 1.5, -0.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcefff";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("COUNT SHEET", w * 0.06, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Clamp x4 · Scissors x2 · Retractor x1", w * 0.06, h * 0.55);
    }, { accent: SPD_ACCENT, ry: -0.4 });
    reg(hits, countPanel, "count-sheet");

    const readyTray = group(assembly, 0.1, 0.9, -0.05);
    box(readyTray, 0.5, 0.02, 0.32, 0, 0, 0, 0xdfe4e5, { rough: 0.4, metal: 0.2 });
    const brokenTip = cyl(readyTray, 0.005, 0.005, 0.1, -0.12, 0.03, 0.06, CITY.steel, { rough: 0.3, metal: 0.8, seg: 6 });
    brokenTip.rotation.set(0, 0, 1.1);
    holoTag(brokenTip, "Broken tip", 0, 0.06, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, brokenTip, "broken-tip");
    const stainedTool = box(readyTray, 0.12, 0.01, 0.03, 0.1, 0.02, -0.08, 0x8a6f4a, { rough: 0.7 });
    holoTag(stainedTool, "Stained instrument", 0, 0.05, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, stainedTool, "stained-instrument");

    const liner = box(assembly, 0.9, 0.005, 0.45, 0, 0.892, 0, 0x8fd6c0, { rough: 0.7, opacity: 0.7, transparent: true });
    reg(hits, liner, "tray-liner");
    const arrangeMarker = box(assembly, 0.9, 0.04, 0.45, 0, 0.92, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, arrangeMarker, "arrange-tray");
    const indicatorStrip = box(assembly, 0.06, 0.01, 0.03, 0.3, 0.92, 0.15, 0xf2c14b, { rough: 0.5 });
    holoTag(indicatorStrip, "Internal indicator", 0, 0.05, 0, { css: SPD_ACCENT, w: 0.4 });
    reg(hits, indicatorStrip, "internal-indicator-place");

    // Unlabeled tray decoy sitting apart from the count panel.
    const unlabeledTray = group(g, 2.2, 0, 0.2);
    box(unlabeledTray, 0.4, 0.9, 0.02, 0, 0.45, 0, 0x000000, { opacity: 0, transparent: true, cast: false });
    box(unlabeledTray, 0.42, 0.02, 0.28, 0, 0.9, 0, 0xeef2f4, { rough: 0.5 });
    holoTag(unlabeledTray, "No count sheet", 0, 0.96, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, unlabeledTray, "unlabeled-tray-decoy");

    // Oversized/crushed pouch decoy near the wrap area.
    const badPouch = group(g, 2.5, 0, -0.6);
    box(badPouch, 0.3, 0.16, 0.2, 0, 0.9, 0, 0xf4f8fa, { rough: 0.5, opacity: 0.7, transparent: true });
    holoTag(badPouch, "Bulging pouch", 0, 1.0, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, badPouch, "wrong-size-pouch");

    // Rigid sterilization container.
    const container = group(g, 1.9, 0, 1.3);
    box(container, 0.5, 0.24, 0.34, 0, 0.6, 0, 0x8b929a, { rough: 0.4, metal: 0.55 });
    const lid = box(container, 0.52, 0.03, 0.36, 0, 0.735, 0, 0xb9c4c9, { rough: 0.4, metal: 0.5 });
    void lid;
    const latch = group(container, 0.22, 0.6, 0.17);
    box(latch, 0.06, 0.1, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    reg(hits, latch, "rigid-container-latch");

    // ---------------------------------------------------------------- sterilizer
    const ster = group(g, 0.2, 0, 1.9, -0.4);
    box(ster, 0.62, 0.9, 0.55, 0, 0.5, 0, 0xc7cdd2, { rough: 0.4, metal: 0.4 });
    const sterDoor = box(ster, 0.4, 0.4, 0.03, 0, 0.55, 0.28, 0x8b929a, { rough: 0.3, metal: 0.6 });
    void sterDoor;
    const sterLamp = ball(ster, 0.012, 0.24, 0.75, 0.29, 0xd8232a, { emissive: 0xd8232a, ei: 1.4, cast: false, seg: 8, seg2: 6 });
    const sterPanel = instrument(ster, 0.26, 0.75, 0.3, { ry: 0, idle: "READY", color: SPD_ACCENT });
    reg(hits, sterPanel, "sterilizer-panel");
    const sterRestart = box(ster, 0.06, 0.04, 0.02, 0.26, 0.62, 0.3, 0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.4 });
    holoTag(ster, "Restart", 0.26, 0.68, 0.3, { css: SPD_ACCENT, w: 0.24 });
    reg(hits, sterRestart, "sterilizer-restart");

    const sterPrinter = holoPanel(g, 0.42, 0.28, 0.9, 1.4, 2.35, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcefff";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("-- °F", w * 0.08, h * 0.4);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("-- min  •  -- psi", w * 0.08, h * 0.72);
    }, { accent: SPD_ACCENT });
    reg(hits, sterPrinter, "sterilizer-printout");

    // -------------------------------------------------------------- bio + log
    const bio = group(g, -0.9, 0, 2.3);
    box(bio, 0.7, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const bioTop = slab(bio, 0.7, 0.04, 0.5, 0, 0.87, 0, 0xc7cdd2, { radius: 0.01 });
    bioTop.material = steelMat();
    const bioVial = cyl(bio, 0.018, 0.018, 0.06, -0.18, 0.92, 0, 0xf2c14b, { rough: 0.4, seg: 10 });
    reg(hits, bioVial, "bio-indicator-spd");
    const controlVial = cyl(bio, 0.018, 0.018, 0.06, -0.05, 0.92, 0, 0x8fb3c4, { rough: 0.4, seg: 10 });
    reg(hits, controlVial, "control-indicator-spd");
    const incu = box(bio, 0.22, 0.2, 0.16, 0.18, 0.99, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const incuLamp = ball(incu, 0.01, 0, 0.11, 0.081, 0x59c97b, { emissive: 0x59c97b, ei: 0.001, cast: false, seg: 8, seg2: 6 });

    const logPanel = holoPanel(g, 0.5, 0.36, -2.7, 1.4, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcefff";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOAD RECORD", w * 0.06, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Tray: — · BI: —", w * 0.06, h * 0.55);
    }, { accent: SPD_ACCENT, ry: 0.4 });
    reg(hits, logPanel, "record-load");

    // Supervisor call-back panel for the IUSS interrupt.
    const supervisorPanel = group(g, -2.7, 0, 1.3);
    box(supervisorPanel, 0.1, 0.02, 0.16, 0, 0.9, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    box(supervisorPanel, 0.08, 0.03, 0.02, 0, 0.92, -0.06, 0x2b3138, { rough: 0.4, metal: 0.3 });
    holoTag(supervisorPanel, "Notify supervisor", 0, 1.0, 0, { css: SPD_ACCENT, w: 0.4 });
    reg(hits, supervisorPanel, "notify-supervisor");

    // The IUSS shortcut control on the sterilizer's own console.
    const iussBtn = box(ster, 0.06, 0.03, 0.02, -0.24, 0.62, 0.3, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.5 });
    holoTag(ster, "Immediate-use?", -0.24, 0.7, 0.3, { css: "#f0645b", w: 0.4 });
    reg(hits, iussBtn, "flash-sterilize-shortcut");

    const tech = standingFigure(g, -1.0, 1.0, { ry: 2.0, cloth: 0x3f6fa0, skin: 0xb98a63 });
    void tech;

    // Supply shelving for depth.
    const shelf = group(g, -3.7, 0, 1.5);
    box(shelf, 0.06, 1.4, 0.6, -0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelf, 0.06, 1.4, 0.6, 0.38, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "WRAP", 0xdfe4e5], [0.7, "PEEL PACK", 0xf4f8fa], [1.1, "CI STRIPS", 0xf2c14b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelf, 0.74, 0.02, 0.58, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelf, 0.2, 0.14, 0.18, i * 0.24, y + 0.08, 0, c, { rough: 0.7 });
        decal(shelf, 0.16, 0.05, i * 0.24, y + 0.08, 0.091, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#dcefff"; cx.font = `600 ${Math.round(h * 0.5)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelf, "Wrap & indicators", 0, 1.45, 0, { css: SPD_ACCENT, w: 0.5 });

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-0.4, 1.1, -1.6),

      onStepComplete(step) {
        if (step.id === "case-cart") caseCart.visible = false;
        if (step.id === "bioburden-find") { tissueSpot.visible = false; lumenTool.visible = false; }
        if (step.id === "washer-load") { washerLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "washer-verify") {
          repaint(washerPrinter.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcefff";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("165°F", w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("wash cycle — passed", w * 0.08, h * 0.72);
          });
        }
        if (step.id === "pass-through") {
          cleanTray.parent.remove(cleanTray);
          assembly.add(cleanTray);
          cleanTray.position.set(-0.2, 0.9, 0.1);
        }
        if (step.id === "integrity-find") { brokenTip.visible = false; stainedTool.visible = false; }
        if (step.id === "sterilizer-run") { sterLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "sterilizer-read") {
          repaint(sterPrinter.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcefff";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("270°F", w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("4 min  •  30 psi", w * 0.08, h * 0.72);
          });
        }
        if (step.id === "bio-log") {
          incuLamp.material.emissiveIntensity = 1.6;
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#4f9fd6"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcefff";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("LOAD RECORD", w * 0.06, h * 0.2);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Tray: logged · BI: pending", w * 0.06, h * 0.55);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "iuss-request") { iussBtn.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 }); }
        if (it.id === "sterilizer-fault") { sterLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "iuss-request") { iussBtn.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.5 }); }
        if (it.id === "sterilizer-fault") sterLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4 });
      },

      onHazard() {},

      animate(t, dt, session) {
        washerBubbles.visible = session?.step?.id === "washer-load" && !!session.holding;
        if (washerBubbles.visible) washerBubbles.userData.step(dt, new THREE.Vector3(-0.4, 0.72, -2.2), 0.14, 0.3, 0.4);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "washer-verify") {
          repaint(washerPrinter.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t >= 0.4 && gg.t <= 0.68 ? "#59c97b" : "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcefff";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(`${Math.round(140 + gg.t * 40)}°F`, w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("wash cycle", w * 0.08, h * 0.72);
          });
        }
        if (gg && !gg.committed && session.step?.id === "sterilizer-read") {
          repaint(sterPrinter.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,26,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t >= 0.5 && gg.t <= 0.72 ? "#59c97b" : "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcefff";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(`${Math.round(250 + gg.t * 20)}°F`, w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("4 min  •  30 psi", w * 0.08, h * 0.72);
          });
        }
        void t;
      },
    };
  },
};
