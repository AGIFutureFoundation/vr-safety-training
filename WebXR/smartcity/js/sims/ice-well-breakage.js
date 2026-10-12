import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat, seatedFigure,
  counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, toolChest, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ice Well Breakage VR — Bartending course, station two: Barback.
// A glass breaks into the ice well mid-service. The well comes out of
// service the instant it's known, the ice is burned down with hot water
// rather than fished through by hand, the empty bin is inspected and
// sanitised before it goes back on line, and the cut a shard leaves behind
// gets the same bloodborne-pathogens response the bar's own exposure
// control plan calls for — glove, direct pressure, the bar top cleaned down,
// the incident logged, and the glass itself in the sharps box, never the
// trash.

const IW_ACCENT = 0x5fb0c9;

export const SIM_ICE_WELL_BREAKAGE = {
  id: "ice-well-breakage",
  index: "138",
  domain: "Culinary & Hospitality",
  trade: "Barback — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "UNITE HERE Local 2 barbacks; the California Retail Food Code (the ANSI-accredited FDA Food Code as adopted) on ice as a food and the equipment that touches it; OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, for the cut and the clean-up; Cal/OSHA's Injury and Illness Prevention Program (8 CCR §3203) requiring the incident to be logged; NSF-listed ice bins and scoops",
  name: "Ice Well Breakage",
  title: simTitle("Ice Well Breakage"),
  tagline: "A glass breaks into the well: stop the well, mark it, burn the ice, sanitise and refill — and the cut it leaves you treated the same way the exposure plan requires",
  accent: IW_ACCENT,
  accentCss: "#5fb0c9",
  parSeconds: 260,
  footprint: 2.5,
  badge: { id: "well-cleared", name: "Well Cleared", note: "A contaminated well stopped, burned, sanitised and back on line — and a cut treated clean, first time" },

  game: system({
    name: "Service Recovery",
    currency: "POUR",
    ranks: ["New Barback", "Well Runner", "Lead Barback", "Service Captain", "Service Recovery Certified"],
    badges: [
      { id: "stopped-first", name: "Stopped It First", note: "Took the well out of service before touching anything else", test: AWARD.stepClean("stop-well") },
      { id: "no-bare-hands", name: "No Bare Hands", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "reads-clean", name: "Reads Clean", note: "Sanitiser strip and the whole run inside band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-recovery", name: "Clean Recovery", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-pressure", name: "Steady Pressure", note: "Held bleed control the full count without a break", test: AWARD.unbroken },
      { id: "well-back-fast", name: "Well Back Fast", note: "Well back in service inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "scoop-buried": "The ice scoop is sitting buried in the ice instead of resting in its own holder outside the bin. The Retail Food Code treats a scoop left in the ice the same way it treats a hand in the ice — it's a contact surface that doesn't belong touching what people are about to drink, glass or no glass.",
    "reuse-chipped-glass": "That rocks glass has a chip out of the rim and it's still sitting in the clean rack. A chip is a broken edge whether or not a piece has come off yet, and the next thing that happens to a chipped glass in service is somebody's lip against it.",
    "trash-glass": "You dropped the broken glass in the regular trash. Glass in a bag of ordinary trash is a cut waiting for whoever ties that bag off and swings it into a truck — it goes in the dedicated sharps and broken-glass container, sealed, every time.",
    "bare-hand-pressure": "You pressed on the cut with a bare hand instead of gloving up first. OSHA's bloodborne pathogens standard exists because you can't tell by looking whether blood — yours or anyone else's — carries something; a barrier goes on before contact, not after the bleeding's already started.",
  },

  lateNotes: {
    "gauze-pad": "Glove up before you touch the cut at all — direct pressure comes after the barrier, not before it.",
    "disinfect-bartop": "The bar top gets disinfected after the cut is under control, not while you're still bleeding on it.",
    "sharps-box": "The glass goes in the box once the well's been sanitised and the cut's dealt with — it's the last thing on the list, not the first.",
  },

  steps: [
    {
      id: "find-glass", kind: "find", noHint: true,
      targets: ["shard-1", "shard-2"],
      itemNames: { "shard-1": "glass fragment", "shard-2": "glass fragment" },
      itemNotes: {
        "shard-1": "One piece caught in the light doesn't mean it's the only one — glass shatters into more fragments than the eye catches on the first look.",
        "shard-2": "A second piece, further down in the ice. Confirming there's more than one is exactly why the whole well gets burned rather than picked through.",
      },
      title: "Spot the glass in the well",
      cue: "Look before you reach. Find what actually broke in there.",
      why: "What you can see is never the whole count — a shattered glass leaves fragments that settle unevenly through the ice, and confirming there's more than one piece is what turns this from 'fish it out' into 'the whole well is contaminated and comes out of service.'",
    },
    {
      id: "stop-well", kind: "select", target: "well-shutoff",
      title: "Take the well out of service",
      cue: "Flip the well to closed before you touch anything else.",
      why: "Every scoop that goes into that ice after the break carries the same risk the first one did — a shard nobody saw. The well comes out of service the instant it's known, before the mark goes up and before anyone reaches for a cure, because the alternative is somebody's drink two minutes from now.",
    },
    {
      id: "mark-well", kind: "sequence", anyOrder: true,
      targets: ["caution-tape", "broken-tag"],
      itemNames: { "caution-tape": "caution tape", "broken-tag": "contaminated tag" },
      title: "Mark the well as contaminated",
      cue: "Tape the well off and tag it so nobody else on the line scoops from it.",
      why: "A well that's simply switched off in your head is still open to the next bartender who doesn't know what you know — the tape and the tag are what carry the information to whoever gets to it before you're back.",
    },
    {
      id: "glove", kind: "select", target: "gloves",
      title: "Glove up before reaching in",
      cue: "Gloves on before anything goes into that ice by hand.",
      why: "Broken glass in ice is invisible the moment your hand is in the bin, and a bare hand finds it by cutting on it. The glove is the barrier between you and both the glass and, if it comes to that, anyone else's blood in the bin.",
    },
    {
      id: "burn-ice", kind: "hold", target: "hot-water-hose", seconds: 6,
      title: "Burn the ice down with hot water",
      cue: "Run hot water into the well until the whole batch of ice is melted out — never scoop around the glass.",
      why: "Fishing through ice by feel for glass you can't fully see is how a barback gets cut a second time; hot water melts the entire batch down so every fragment drains out with the water instead of staying hidden in what's left, which is the whole reason the trade calls this 'burning' the well rather than clearing it.",
      holdBreakNote: "You stopped before the ice was fully melted. Any ice left behind can still be hiding glass — run it the full count.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["residual-shard"],
      itemNames: { "residual-shard": "fragment in the drain" },
      itemNotes: { "residual-shard": "Caught in the drain strainer — proof the melt did its job, and the last piece you'd never have found by scooping." },
      title: "Inspect the drained well",
      cue: "Check the empty bin and the drain strainer before anything goes back in it.",
      why: "The melt only works if somebody actually looks at what it caught — an empty-looking well is not the same thing as a well somebody has confirmed is clear, and the strainer is where the last fragment always turns up.",
    },
    {
      id: "sanitize", kind: "gauge", target: "sanitizer-strip",
      title: "Sanitise the empty well",
      cue: "Spray the sanitiser and read the test strip — commit while it's inside the labelled concentration band.",
      why: "The Retail Food Code treats the ice bin as food-contact equipment, which means it gets sanitised to a measured concentration before it goes back into service — reading the strip is what turns 'I sprayed it' into a number an inspector, or the next shift, can trust.",
      gauge: { label: "SANITISER PPM", speed: 0.75, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 400)} ppm`, missNote: "Off the labelled band — too little doesn't sanitise, too much is its own hazard. Mix it again to spec." },
    },
    {
      id: "refill", kind: "drag", target: "ice-scoop-bin",
      title: "Refill the well from the machine",
      cue: "Scoop fresh ice from the machine and carry it to the well.",
      why: "The well only goes back on line once it's carrying ice that was never anywhere near the break — refilling from the machine, not from whatever's left in a bus tub, is what keeps this a closed loop instead of just moving the same risk somewhere else.",
      drag: { to: "well-socket", radius: 0.4, missNote: "Not into the well — line the scoop up over the bin before you tip it." },
    },
    {
      id: "first-aid-kit", kind: "select", target: "first-aid-kit",
      title: "Open the first-aid kit",
      cue: "The cut on your hand needs dealing with before you do anything else behind this bar.",
      why: "A cut from the same glass that just came out of the well is bloodborne-pathogens territory the moment it breaks skin — the kit comes out now, not at the end of the shift when it's convenient.",
    },
    {
      id: "bleed-control", kind: "hold", target: "gauze-pad", seconds: 6,
      title: "Apply direct pressure",
      cue: "Gauze on the cut, firm and steady, until the bleeding's controlled.",
      why: "Direct pressure held steady is what actually stops bleeding — dabbing at it and checking every few seconds just reopens whatever clot is trying to form. This is the same first-aid fundamental behind every cut this bar has ever logged.",
      holdBreakNote: "You let up before it was controlled. Checking too early is how a cut that was almost stopped starts bleeding again — hold it the full count.",
    },
    {
      id: "bbp-cleanup", kind: "sequence", anyOrder: true,
      targets: ["disinfect-bartop", "biohazard-bag"],
      itemNames: { "disinfect-bartop": "disinfect the bar top", "biohazard-bag": "bag the contaminated wipes" },
      title: "Clean up the bar top",
      cue: "Disinfect anywhere blood touched the bar, then bag the wipes and gauze separately.",
      why: "OSHA's bloodborne pathogens standard treats any blood spill as potentially infectious regardless of whose it is — the surface gets disinfected and everything that touched the blood goes into its own bag, not into the regular bar rags or the trash behind the well.",
    },
    {
      id: "first-aid-log", kind: "select", target: "incident-log",
      title: "Log the incident",
      cue: "Record what happened, when, and what was done about it.",
      why: "An unlogged cut is a cut that never happened as far as the bar's own safety record and the union's own accident reporting are concerned — the log is what lets the next injury prevention review actually catch the pattern instead of guessing at it.",
    },
    {
      id: "sharps-box", kind: "select", target: "sharps-box",
      title: "Dispose of the glass",
      cue: "The broken glass goes in the sharps and broken-glass container, sealed.",
      why: "Broken glass behaves like any other sharp for whoever handles the bag next — it goes into its own rigid, sealed container from the start rather than riding out in a bag of bar trash where the first sign of it is somebody's hand.",
    },
  ],

  interrupts: [
    {
      id: "colleague-reaches",
      kind: "Coworker error",
      after: "burn-ice", delay: 3, seconds: 11,
      alert: "Another bartender reaches straight into the marked well for a scoop of ice — there's a customer waiting on a drink.",
      cue: "Stop them. Point at the tag — your hands are full with the hose.",
      target: "broken-tag",
      why: "The tape and the tag only work if everyone actually reads them; a colleague reaching in because a customer's waiting puts a scoop that's been in contaminated ice straight into someone's glass, and the fastest fix is pointing at exactly what should have stopped them in the first place.",
      missNote: "The other bartender scooped ice out of the well you'd just marked contaminated, and it went straight into a drink. The tag does nothing if the person reaching past it never gets told to look at it.",
      wrongNote: "It's the tag on the well, not the hose in your hands. Point at what's already marked instead of trying to explain it from across the bar.",
    },
    {
      id: "chipped-glass-customer",
      kind: "Customer at the rail",
      after: "bleed-control", delay: 3, seconds: 11,
      alert: "A customer at the rail hands back the rocks glass they were drinking from — there's a chip out of the rim.",
      cue: "That glass goes straight in the box, not back in the rack.",
      target: "sharps-box",
      why: "A chip that's already been noticed and handed across the bar is not a glass anyone quietly slides back into the rack for the next round — it goes straight into the same container the well's own glass just went into, because a chip is a broken edge whether or not a piece is missing yet.",
      missNote: "The chipped glass went back toward the clean rack instead of the sharps box. The next person to pour into it, or drink from it, meets the same broken edge the customer just handed you.",
      wrongNote: "It's the sharps box. A chipped glass doesn't go back into rotation no matter how busy the rail is.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, IW_ACCENT);

    // -------------------------------------------------------------- bar floor
    box(g, 5.6, 0.06, 5.0, 0, 0.03, 0.4, 0x2a221c, { rough: 0.85, finish: "concrete", tile: [7, 6] });

    // ----------------------------------------------------------- guest side
    const railTop = counter(g, 3.8, 0.7, 0, 1.35, 0x33261c, { height: 1.05, undershelf: false });
    void railTop;
    const stoolTones = [0x6b7f8c, 0x8c6b56, 0x556b5a];
    const customerCloth = [0x4a5f6e, 0x6e4a3a, 0x3a5a4a];
    const customers = [];
    for (let i = 0; i < 3; i++) {
      const sx = -1.1 + i * 1.1;
      const stool = group(g, sx, 0, 1.95);
      cyl(stool, 0.03, 0.03, 0.72, 0, 0.36, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 10 });
      cyl(stool, 0.16, 0.16, 0.05, 0, 0.74, 0, stoolTones[i], { rough: 0.6, seg: 16 });
      const cust = seatedFigure(g, sx, 0.74, 1.95, { skin: 0xc99878, cloth: customerCloth[i], ry: (i - 1) * 0.12 });
      customers.push(cust);
    }
    // The rail customer's chipped glass, hidden until the interrupt.
    const chippedGlass = group(g, -1.1, 0, 1.55, 0.3);
    cyl(chippedGlass, 0.045, 0.045, 0.1, 0, 0.95, 0, 0xdfe9ec, { rough: 0.15, metal: 0.05, opacity: 0.55, transparent: true, seg: 16 });
    box(chippedGlass, 0.02, 0.02, 0.015, 0.045, 1.0, 0, 0xdfe9ec, { opacity: 0.55, transparent: true, cast: false });
    holoTag(chippedGlass, "Chipped glass", 0, 1.12, 0, { css: "#f0645b", w: 0.34 });
    chippedGlass.visible = false;

    // -------------------------------------------------------------- work alley
    const backCounter = counter(g, 3.6, 0.55, 0, -0.75, 0x2b3138, { height: 0.95, undershelf: false });
    void backCounter;

    // The ice well itself, recessed into the back counter.
    const wellGroup = group(g, -0.9, 0, -0.75);
    box(wellGroup, 0.9, 0.5, 0.5, 0, 0.4, 0, 0x8b929a, { rough: 0.4, metal: 0.5, finish: "brushed", tile: 2 });
    const iceBed = box(wellGroup, 0.78, 0.3, 0.4, 0, 0.55, 0, 0xdfeef2, { rough: 0.3, opacity: 0.85, transparent: true });
    holoTag(wellGroup, "Ice well", 0, 0.85, 0, { css: "#5fb0c9", w: 0.28 });
    const shard1 = box(wellGroup, 0.03, 0.006, 0.02, -0.15, 0.62, 0.05, 0xeaf6fb, { rough: 0.1, metal: 0.1, emissive: 0xeaf6fb, ei: 0.4 });
    reg(hits, shard1, "shard-1");
    const shard2 = box(wellGroup, 0.025, 0.006, 0.018, 0.12, 0.58, -0.08, 0xeaf6fb, { rough: 0.1, metal: 0.1, emissive: 0xeaf6fb, ei: 0.4 });
    reg(hits, shard2, "shard-2");
    const drainShard = box(wellGroup, 0.02, 0.005, 0.015, 0.02, 0.41, 0, 0xeaf6fb, { rough: 0.1, emissive: 0xeaf6fb, ei: 0.4 });
    drainShard.visible = false;
    reg(hits, drainShard, "residual-shard");
    const scoopHolder = box(wellGroup, 0.06, 0.2, 0.06, 0.4, 0.55, 0.2, 0x2b3138, { rough: 0.6, cast: false });
    void scoopHolder;
    const scoopBuried = group(wellGroup, -0.05, 0.6, -0.1, 0.3);
    box(scoopBuried, 0.05, 0.03, 0.2, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(scoopBuried, "Scoop buried in ice?", 0, 0.14, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, scoopBuried, "scoop-buried");

    const shutoff = group(wellGroup, 0.5, 0.85, 0);
    box(shutoff, 0.16, 0.1, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    decal(shutoff, 0.13, 0.07, 0, 0, 0.011, signFace("OPEN", { bg: "#0d1c14", accent: "#59c97b", scale: 0.6 }), { px: 128 });
    holoTag(shutoff, "Well status", 0, 0.12, 0, { css: "#5fb0c9", w: 0.3 });
    reg(hits, shutoff, "well-shutoff");
    const wellSocket = box(wellGroup, 0.78, 0.02, 0.4, 0, 0.42, 0, 0xffffff, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    hits["well-socket"] = wellSocket;

    // Caution tape and the contamination tag.
    const tapeGroup = group(wellGroup, 0, 0.75, 0.26);
    for (let i = -1; i <= 1; i += 2) box(tapeGroup, 0.02, 0.4, 0.02, i * 0.42, 0, 0, 0xf2c14b, { rough: 0.6, cast: false });
    box(tapeGroup, 0.86, 0.06, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.6, cast: false });
    tapeGroup.visible = false;
    const tapePick = group(g, -1.7, 0, -0.35);
    box(tapePick, 0.12, 0.12, 0.06, 0, 0.4, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(tapePick, "Caution tape", 0, 0.5, 0, { css: "#5fb0c9", w: 0.3 });
    reg(hits, tapePick, "caution-tape");
    const tag = decal(wellGroup, 0.2, 0.16, -0.3, 0.72, 0.26, paperFace("CONTAMINATED", ["DO NOT SCOOP"], { bg: "#f4e9d8", band: "#b81410", worn: true }), { px: 192 });
    tag.visible = false;
    const tagPick = box(g, 0.1, 0.1, 0.05, -1.4, 0.5, -0.35, 0xf4e9d8, { rough: 0.7 });
    holoTag(tagPick, "Contamination tag", 0, 0.14, 0, { css: "#5fb0c9", w: 0.32 });
    reg(hits, tagPick, "broken-tag");

    const hotHose = group(g, -0.9, 0, -1.35, 0.5);
    cyl(hotHose, 0.02, 0.02, 0.6, 0, 0.95, 0, 0xd8232a, { rough: 0.6, seg: 10 });
    cyl(hotHose, 0.03, 0.03, 0.08, 0, 0.65, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 12 });
    holoTag(hotHose, "Hot water", 0, 1.15, 0, { css: "#5fb0c9", w: 0.3 });
    reg(hits, hotHose, "hot-water-hose");
    const steam = particles(wellGroup, 30, 0xffffff, { size: 0.02, life: 0.7, additive: false, opacity: 0.35 });

    // Sanitiser bottle and the test strip.
    const sanBottle = group(g, -1.6, 0, -1.1, -0.3);
    box(sanBottle, 0.12, 0.28, 0.1, 0, 0.5, 0, 0x2f6f8c, { rough: 0.5 });
    holoTag(sanBottle, "Sanitiser", 0, 0.66, 0, { css: "#5fb0c9", w: 0.28 });
    const strip = instrument(g, -1.6, 0.9, -0.8, { idle: "-- ppm", color: 0x5fb0c9, w: 0.11, d: 0.15, ry: 0.4 });
    reg(hits, strip, "sanitizer-strip");

    // Ice machine and the scoop bin.
    const iceMachine = group(g, 1.9, 0, -1.2, -0.5);
    box(iceMachine, 0.7, 1.1, 0.55, 0, 0.55, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, finish: "brushed", tile: 2 });
    box(iceMachine, 0.55, 0.2, 0.4, 0, 1.05, 0, 0xc7d0d6, { rough: 0.4, metal: 0.3 });
    holoTag(iceMachine, "Ice machine", 0, 1.3, 0, { css: "#5fb0c9", w: 0.3 });
    const scoopBin = group(iceMachine, 0.42, 0, 0.1);
    cyl(scoopBin, 0.14, 0.14, 0.05, 0, 0.42, 0, 0xdfe4e8, { rough: 0.5, metal: 0.3, seg: 16 });
    box(scoopBin, 0.05, 0.02, 0.18, 0, 0.46, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    holoTag(scoopBin, "Scoop of ice", 0, 0.58, 0, { css: "#5fb0c9", w: 0.32 });
    reg(hits, scoopBin, "ice-scoop-bin");

    // Glass rack — clean glasses, one of them chipped.
    const rack = cabinet(g, 0.9, 0.5, 0.4, 1.5, 1.55, -1.9, 0xe6ecf1, { doorColor: 0xd7dce1 });
    void rack;
    for (let i = 0; i < 3; i++) {
      cyl(g, 0.045, 0.045, 0.11, 1.3 + i * 0.2, 1.85, -1.9, 0xeaf5f8, { rough: 0.15, opacity: 0.55, transparent: true, seg: 14 });
    }
    const chippedInRack = group(g, 1.9, 0, -1.9, 0.4);
    cyl(chippedInRack, 0.045, 0.045, 0.11, 0, 1.85, 0, 0xeaf5f8, { rough: 0.15, opacity: 0.55, transparent: true, seg: 14 });
    holoTag(chippedInRack, "Chipped — reuse this?", 0, 1.98, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, chippedInRack, "reuse-chipped-glass");

    // POS and trash bin (the wrong destination for the broken glass).
    const pos = instrument(g, 0.6, 1.05, -0.75, { idle: "$--.--", color: 0x5fb0c9, w: 0.16, d: 0.2, ry: 0 });
    void pos;
    const trash = group(g, 2.3, 0, -0.4, -0.4);
    cyl(trash, 0.16, 0.18, 0.35, 0, 0.18, 0, 0x4a545a, { rough: 0.7, seg: 14 });
    const trashGlass = box(trash, 0.02, 0.06, 0.02, 0.05, 0.34, 0, 0xdfe9ec, { rough: 0.2, opacity: 0.6, transparent: true });
    holoTag(trash, "Broken glass — trash?", 0, 0.46, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, trashGlass, "trash-glass");

    // First-aid kit, gauze, gloves, log, sharps box.
    const kit = toolChest(g, -2.2, 0.7, { ry: 0.6, color: 0xd8342a });
    decal(kit, 0.5, 0.16, 0, 0.76, 0.201, signFace("FIRST AID", { bg: "#2a1008", accent: "#f2c14b", scale: 0.5 }));
    reg(hits, kit, "first-aid-kit");
    const gloveBox = group(g, -2.5, 0, 0.2, 0.4);
    box(gloveBox, 0.16, 0.08, 0.1, 0, 0.5, 0, 0x2b3138, { rough: 0.6 });
    holoTag(gloveBox, "Gloves", 0, 0.6, 0, { css: "#5fb0c9", w: 0.24 });
    reg(hits, gloveBox, "gloves");
    const gauze = group(kit, -0.05, 0.9, -0.08);
    box(gauze, 0.08, 0.02, 0.08, 0, 0, 0, 0xf4ece0, { rough: 0.7 });
    holoTag(gauze, "Gauze pad", 0, 0.08, 0, { css: "#5fb0c9", w: 0.28 });
    reg(hits, gauze, "gauze-pad");

    const bareHandTrap = group(g, -0.4, 0, -0.4, 0.3);
    ball(bareHandTrap, 0.03, 0, 0.55, 0, 0xc99878, { rough: 0.75 });
    holoTag(bareHandTrap, "Bare hand on the cut?", 0, 0.66, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, bareHandTrap, "bare-hand-pressure");

    const disinfectSpray = group(g, -1.9, 0, 0.35, -0.2);
    box(disinfectSpray, 0.09, 0.22, 0.09, 0, 0.45, 0, 0x59c97b, { rough: 0.5 });
    holoTag(disinfectSpray, "Disinfect bar top", 0, 0.6, 0, { css: "#5fb0c9", w: 0.34 });
    reg(hits, disinfectSpray, "disinfect-bartop");
    const bioBag = group(g, -1.6, 0, 0.6, -0.3);
    box(bioBag, 0.14, 0.18, 0.05, 0, 0.42, 0, 0xd8232a, { rough: 0.5 });
    decal(bioBag, 0.11, 0.06, 0, 0.48, 0.026, signFace("BIOHAZARD", { bg: "#2a0d0d", accent: "#f2c14b", scale: 0.6 }), { px: 128 });
    holoTag(bioBag, "Biohazard bag", 0, 0.55, 0, { css: "#5fb0c9", w: 0.32 });
    reg(hits, bioBag, "biohazard-bag");

    const logBoard = holoPanel(g, 0.5, 0.36, -2.4, 1.5, -0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,20,24,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5fb0c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e2f3f7";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Time · cause · treatment given", w / 2, h * 0.62);
      ctx.fillText("Sign once the bar top is clean", w / 2, h * 0.8);
    }, { ry: 0.4, accent: IW_ACCENT });
    reg(hits, logBoard, "incident-log");

    const sharps = group(g, -2.6, 0, -1.4, 0.5);
    box(sharps, 0.22, 0.3, 0.2, 0, 0.15, 0, 0xf2c14b, { rough: 0.5 });
    decal(sharps, 0.17, 0.1, 0, 0.22, 0.101, signFace("SHARPS", { bg: "#1b1608", accent: "#d8232a", scale: 0.55 }), { px: 128 });
    holoTag(sharps, "Sharps / broken glass", 0, 0.36, 0, { css: "#5fb0c9", w: 0.4 });
    reg(hits, sharps, "sharps-box");

    // The coworker who reaches into the marked well mid-procedure.
    const coworker = standingFigure(g, 0.65, -1.7, { ry: -2.3, cloth: 0x3a4550, vest: 0x5fb0c9 });

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(-0.6, 1.0, -0.75),

      onStepComplete(step) {
        if (step.id === "stop-well") {
          repaint(shutoff.children[1], signFace("CLOSED", { bg: "#2a1416", accent: "#f0645b", scale: 0.6 }));
        }
        if (step.id === "mark-well") { tapeGroup.visible = true; tag.visible = true; }
        if (step.id === "burn-ice") { iceBed.visible = false; drainShard.visible = true; }
        if (step.id === "inspect") { drainShard.visible = false; }
        if (step.id === "refill") { iceBed.visible = true; iceBed.material = mat(0xeef8fb, { rough: 0.3, opacity: 0.85, transparent: true }); }
      },

      onInterrupt(it) {
        if (it.id === "colleague-reaches") { coworker.position.x = -0.35; coworker.position.z = -0.95; }
        if (it.id === "chipped-glass-customer") { chippedGlass.visible = true; customers[0].torso.position.z += 0.06; }
      },
      onInterruptEnd(it) {
        if (it.id === "colleague-reaches") { coworker.position.x = 0.65; coworker.position.z = -1.7; }
        if (it.id === "chipped-glass-customer") {
          customers[0].torso.position.z -= 0.06;
          if (it.resolved === "answered") chippedGlass.visible = false;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "sanitize") {
          repaint(strip.userData.screen, signFace(`${Math.round(gg.t * 400)}`, { bg: "#0d1c14", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.6 }));
        }
        if (session?.step?.id === "burn-ice" && session.holding) {
          steam.visible = true;
          steam.userData.step(dt, new THREE.Vector3(0, 0.55, 0), 0.16, 0.12, 0.02);
          iceBed.scale.y = Math.max(0.15, 1 - session.holdFor / (session.step.seconds || 6));
        } else if (steam.visible) { steam.visible = false; iceBed.scale.y = 1; }
      },
    };
  },
};
