import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Arc-Flash Label Study VR — Energy & Power, IBEW inside wireman.
// Turning an arc-flash hazard analysis into the label that actually gets
// screwed to a panel. NFPA 70E requires the label; it does not perform the
// calculation, and the number on a label is only as good as the fault
// current, the clearing time and the working distance that went into it —
// each one pulled from a different document, none of them guessed.

const AFL_ACCENT = 0x7ee6ff;

export const SIM_ARC_FLASH_LABEL_STUDY = {
  id: "arc-flash-label-study",
  index: "189",
  domain: "Energy",
  trade: "Inside wireman — IBEW",
  category: "Energy & Power",
  indoor: "plant",
  weather: "overcast",
  certification: "IBEW inside wireman; NFPA 70E-2021 arc-flash risk assessment and hazard labeling; NFPA 70 (National Electrical Code); ANSI Z535.4 safety sign and label format; OSHA 29 CFR 1910.132/.335 for the field verification",
  name: "Arc-Flash Label Study",
  title: simTitle("Arc-Flash Label Study"),
  tagline: "One-line to label: fault current, clearing time, incident energy, boundaries, printed and posted",
  accent: AFL_ACCENT,
  accentCss: "#7ee6ff",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "label-issued", name: "Label Issued", note: "A label built from the actual study data, printed and placed on the panel it was calculated for" },

  game: system({
    name: "Study Authority",
    currency: "CAL",
    ranks: ["Apprentice Wireman", "Journeyman Wireman", "Field Data Tech", "Study Lead", "Study Authority Certified"],
    badges: [
      { id: "traced-not-guessed", name: "Traced, Not Guessed", note: "Every number on the label traced to its own source document", test: AWARD.stepClean("fault-current") },
      { id: "boundary-honest", name: "Boundary Honest", note: "Never approached inside a boundary the study had not yet set", test: AWARD.safe },
      { id: "energy-precise", name: "Energy Precise", note: "Held the incident-energy calculation inside the study's band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "no-rework", name: "No Rework", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "reading-held", name: "Reading Held", note: "Never let a live reading drop before it was recorded", test: AWARD.unbroken },
      { id: "study-closed", name: "Study Closed", note: "Label issued inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "guess-category": "You reached for a pre-printed generic warning sticker instead of running the calculation. A label is only good for the panel its numbers came from — a generic sticker tells the next electrician nothing true about this bus, this fault current or this clearing time, and NFPA 70E requires the study, not a decoration.",
    "nameplate-fault": "You copied the fault current straight off the transformer nameplate. A nameplate gives the transformer's own impedance, not the fault current available at this panel after the utility's contribution and every upstream conductor between here and the source — the number that actually belongs in the study comes from the fault-current study, not from the nearest sticker.",
    "bare-panel-approach": "You went at the open panel to read the busbar rating without the suit and the shield on. Collecting field data for a study still means standing in front of live gear with a meter, and the incident energy this panel can produce does not wait for the study that is being written about it to be finished first.",
    "wrong-panel-post": "You were about to screw this label onto the panel next to the one it was calculated for. Two panels of the same make in the same row are not the same bus, and a label on the wrong door tells the next electrician a number that has nothing to do with what they are about to open.",
  },

  lateNotes: {
    "utility-letter": "The fault current comes from the utility letter or the fault-current study, never from a nameplate.",
    "ie-calculator": "The incident energy is calculated at the panel's own working distance — it is not read off another panel's label.",
  },

  interrupts: [
    {
      id: "breaker-setting-changed",
      kind: "Stale record",
      after: "clearing-time", delay: 4, seconds: 14,
      alert: "Maintenance's change log shows the feeder breaker's long-time pickup was turned down six weeks ago — the trip curve you just pulled from the file is the old setting, not what is in the breaker now.",
      cue: "Check the breaker's own setting sheet before the clearing time goes anywhere near the calculation.",
      target: "breaker-setting-sheet",
      why: "A time-current curve on file is a record of a setting, not a fact about the breaker sitting in front of you — a protective device's pickup and time dial can be changed at any maintenance outage without the coordination study ever being told. The clearing time that goes into an incident-energy calculation has to come from what the breaker is actually set to today, and the only way to know that is the setting sheet at the breaker itself, not the drawing in the file room.",
      missNote: "The study went forward on a clearing time that maintenance had already changed six weeks earlier. Every number downstream of it — the incident energy, the boundary, the PPE category on the label — is now calculated against a breaker that no longer exists, and the label that comes out the other end will be wrong in a way nobody can see just by looking at it.",
      wrongNote: "It is the breaker's own setting sheet. The file drawing is what somebody wrote down once — the sheet at the breaker is what it is actually set to now.",
    },
    {
      id: "wrong-panel",
      kind: "Placement error",
      after: "print", delay: 4, seconds: 12,
      alert: "Across the room, a second electrician has the fresh label peeled and is lining it up on the panel one bay over from the one this study was run on.",
      cue: "Stop him before that label goes on the wrong door.",
      target: "wrong-panel",
      why: "Two panels of the same make standing in the same row are not the same bus behind different sheet metal — different feeders, different upstream breakers, different fault current, different clearing time, and none of it matches just because the enclosures look identical. A label placed on the wrong panel is worse than no label at all: it tells the next electrician a specific, confident, wrong number.",
      missNote: "The label went on the panel next to the one it was calculated for. It will sit there reading a confident, specific incident energy that has nothing to do with the bus behind that door, until somebody gets hurt trusting it or another study happens to catch the mismatch.",
      wrongNote: "It is the panel he is about to stick that label on. Stop him before it lands on the wrong door.",
    },
  ],

  steps: [
    {
      id: "one-line", kind: "select", target: "one-line-diagram",
      title: "Pull the one-line for this panel",
      cue: "Trace the panel back through its feeder to the upstream breaker and the source on the one-line diagram.",
      why: "An incident-energy calculation is only meaningful for a specific point in a specific electrical system, and the one-line is what actually defines that point — which breaker feeds this panel, what protects that breaker, and how many transformers sit between here and the utility. Skipping straight to a calculator with a number nobody traced back through the one-line is how a study gets built for a system that does not match the panel it is stuck on.",
    },
    {
      id: "nameplate", kind: "select", target: "panel-nameplate",
      title: "Read the panel's own nameplate",
      cue: "Record the bus rating, voltage and short-circuit rating stamped on the panel itself.",
      why: "The nameplate tells you what this specific piece of equipment is rated to withstand, which is the number the calculated incident energy eventually gets checked against — a study that produces a fault duty higher than the equipment's own short-circuit rating has found a problem with the panel, not just a number for the label.",
    },
    {
      id: "ppe-approach", kind: "sequence", anyOrder: true,
      targets: ["arc-suit", "face-shield"],
      itemNames: { "arc-suit": "arc-rated coverall", "face-shield": "arc-rated face shield" },
      title: "PPE before the panel comes open",
      cue: "Suit and shield on before the door opens to read the nameplate and bus configuration up close.",
      why: "Until this study is finished and its label is on the door, nobody standing in front of this panel has a documented incident-energy number to work from — which means the interim assumption has to be the worst reasonable category for equipment of this class, not bare arms because the job today is only reading a nameplate.",
    },
    {
      id: "fault-current", kind: "select", target: "utility-letter",
      title: "Get the available fault current",
      cue: "Pull the available fault current for this service from the utility letter, not from any nameplate in the building.",
      why: "Available fault current is a property of the whole path back to the source — the utility's system impedance, the service transformer, every foot of conductor between them and this panel — and the only document that actually states it for this service is the utility's letter or a calculated fault-current study built from that data. A number from anywhere else is a guess wearing a decimal point.",
    },
    {
      id: "clearing-time", kind: "select", target: "trip-curve",
      title: "Read the protective device's clearing time",
      cue: "Pull the feeder breaker's time-current curve at the calculated fault current to get how long it actually takes to clear.",
      why: "Incident energy is proportional to how long the arc is allowed to burn, which makes the protective device's clearing time as important to the final number as the fault current itself — a breaker that clears in three cycles and one that clears in thirty produce wildly different labels off the identical fault current, and the curve is the only place that time actually comes from.",
    },
    {
      id: "incident-energy", kind: "gauge", target: "ie-calculator",
      title: "Calculate the incident energy at working distance",
      cue: "Run the fault current and clearing time through the calculation at this panel's working distance and commit on the result.",
      why: "The incident energy is not a property of the panel in the abstract — it is calculated at a specific working distance because arc energy falls off sharply with distance, and the eighteen inches a hand at this panel actually works from is what the label has to protect, not some other equipment's distance copied out of habit.",
      gauge: { label: "CAL/CM²", speed: 0.7, green: [0.38, 0.52], readout: (t) => `${(2 + t * 12).toFixed(1)} cal/cm²`, missNote: "That result is outside the study's own working band for this panel — recheck the fault current and clearing time you fed into it before committing a number to the label." },
    },
    {
      id: "boundaries", kind: "sequence", anyOrder: true,
      targets: ["arc-flash-boundary", "limited-approach-boundary"],
      itemNames: { "arc-flash-boundary": "arc-flash boundary marker", "limited-approach-boundary": "limited-approach boundary marker" },
      title: "Set the arc-flash and limited-approach boundaries",
      cue: "Place both boundary markers at the distances the calculation and the voltage class actually give.",
      why: "The arc-flash boundary comes straight out of the incident-energy calculation you just ran; the limited-approach boundary comes out of the voltage class in NFPA 70E's own table and has nothing to do with the arc-flash number at all. Confusing the two, or posting only one, leaves an unqualified person with no idea how close is still too close for a hazard the calculation never covered.",
    },
    {
      id: "ppe-category", kind: "select", target: "ppe-table",
      title: "Set the PPE category from the calculated energy",
      cue: "Match the calculated incident energy to its PPE category on the posted table.",
      why: "The category on the label is not a judgment call made at the panel — it is read straight off the incident-energy number against NFPA 70E's own category table, the same table every qualified person on this site is trained to the same way. A category chosen by feel is a category the next electrician has no reason to trust.",
    },
    {
      id: "print", kind: "select", target: "label-printer",
      title: "Print the label",
      cue: "Send the fault current, clearing time, incident energy, both boundaries and the PPE category to the label printer.",
      why: "Every field on this label traces back to a document this job just opened — the one-line, the utility letter, the trip curve, the calculation — and printing it is where those separate pieces of paper become the one thing an electrician will actually be standing in front of the next time this panel is opened.",
    },
    {
      id: "place", kind: "drag", target: "printed-label",
      title: "Place the label on the panel it was calculated for",
      cue: "Carry the label to this panel and set it on the door face where it will be read before the door opens.",
      why: "A label calculated for this bus is only correct while it stays on this door — carried to the wrong panel, printed but left in a folder, or placed where the door swings over it, it stops doing the one job it exists for, which is being the first thing a hand reaches for before it reaches for the door handle.",
      drag: { to: "panel-face", radius: 0.4, missNote: "Not set on the panel face — a label sitting anywhere else is a label nobody will read before they open this door." },
    },
    {
      id: "post-category", kind: "select", target: "ppe-decal-spot",
      title: "Post the PPE category placard",
      cue: "Affix the separate PPE-category placard next to the label, where it is visible without opening the door.",
      why: "The full label carries the numbers; the category placard is what a crew glances at from three feet away before they have gathered PPE at all — posted separately, it is readable from the doorway, not only by someone already close enough to be inside the boundary reading fine print.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["faded-label", "mismatched-breaker-tag"],
      itemNames: { "faded-label": "faded, unreadable label", "mismatched-breaker-tag": "breaker tag that does not match the panel schedule" },
      itemNotes: {
        "faded-label": "The label on the panel next door has faded to the point the incident-energy figure is not legible. A label nobody can read is functionally the same as no label — it goes on this study's punch list for reprinting.",
        "mismatched-breaker-tag": "That breaker's tag names a load the panel schedule does not list. A label is only as trustworthy as the one-line it was built from, and a panel schedule that has drifted from what is actually installed is exactly the kind of error that puts a wrong fault current into somebody else's next study.",
      },
      title: "Walk the row before closing out the study",
      cue: "Check the neighbouring panels for labels and tags that no longer match what is actually installed; click what needs a follow-up study.",
      why: "This study closes out one panel, and the row it sits in does not stop existing once this label is on the door. A faded label or a drifted panel schedule found now is a mistake caught during a scheduled walk-down; found later, it is whatever the next electrician assumed instead.",
    },
    {
      id: "file", kind: "select", target: "study-file",
      title: "File the study record",
      cue: "Log the calculation inputs, the result and today's date against this panel's equipment record.",
      why: "The label on the door is the summary; the filed study is the proof — the fault current, the clearing time and the working distance that produced this number all have to be traceable later, because the next time a breaker setting changes or a transformer is upsized, this is the record that says which labels in the building are now out of date.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, AFL_ACCENT);

    // ------------------------------------------------------------- the floor
    const floorTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#39424b", base2: "#2e363e", step: 24 }), { repeat: 4, px: 320 });
    const floor = box(g, 5.0, 0.1, 4.4, 0, 0.05, 0, 0x39424b, { rough: 0.85, metal: 0.2 });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.2, color: 0x39424b });

    // --------------------------------------------------------- the two panels
    const panel = equipmentCabinet(g, 0.85, 1.9, 0.4, -0.6, -1.55, { ry: 0, color: 0x5c666f });
    holoTag(panel, "Panel LP-4", 0, 2.2, 0, { css: "#7ee6ff", w: 0.3 });
    const nameplate = decal(panel, 0.3, 0.2, 0.24, 1.35, 0.2, (cx, w, h) => {
      cx.fillStyle = "#d8d2c2"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#3a4450"; cx.lineWidth = h * 0.03; cx.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
      cx.fillStyle = "#22303c"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("LP-4 · 225 A BUS", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#3a4450";
      cx.fillText("480Y/277 V · 3PH 4W", w / 2, h * 0.55);
      cx.fillText("22 kAIC RATED", w / 2, h * 0.76);
    }, { px: 256 });
    reg(hits, nameplate, "panel-nameplate");
    const panelFace = box(panel, 0.7, 1.6, 0.02, 0, 0.95, 0.2, 0x4a5560, { rough: 0.5, metal: 0.5 });
    hits["panel-face"] = panelFace;

    // A second panel one bay over — the wrong one, in the wrong-panel interrupt.
    const wrongPanel = equipmentCabinet(g, 0.85, 1.9, 0.4, 1.0, -1.55, { ry: 0, color: 0x5c666f });
    holoTag(wrongPanel, "Panel LP-5", 0, 2.2, 0, { css: "#8a94a0", w: 0.3 });
    reg(hits, wrongPanel, "wrong-panel");
    const wrongPanelFace = box(wrongPanel, 0.7, 1.6, 0.02, 0, 0.95, 0.2, 0x4a5560, { rough: 0.5, metal: 0.5 });
    reg(hits, wrongPanelFace, "wrong-panel-post");

    // Setting sheet on the feeder breaker upstream of LP-4.
    const settingSheet = decal(panel, 0.24, 0.18, -0.24, 1.1, 0.2, (cx, w, h) => {
      cx.fillStyle = "#eee7d6"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#3a4450"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`;
      cx.fillText("BREAKER SETTING", w / 2, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("LTPU: 0.9 (was 1.0)", w / 2, h * 0.55);
      cx.fillText("Rev. 6 wks ago", w / 2, h * 0.78);
    }, { px: 220 });
    reg(hits, settingSheet, "breaker-setting-sheet");

    // ---------------------------------------------------------------- holo docs
    const oneLine = holoPanel(g, 0.6, 0.44, -2.3, 1.55, 0.4, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7ee6ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("ONE-LINE — LP-4 FEEDER", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      ["Utility → 1500 kVA XFMR", "Feeder breaker CB-22 (LSIG)", "LP-4 panel — 225 A bus", "Working distance 18 in"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.14)));
    }, { ry: 0.6, accent: AFL_ACCENT });
    reg(hits, oneLine, "one-line-diagram");

    const utilLetter = holoPanel(g, 0.5, 0.36, -2.0, 1.1, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7ee6ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("UTILITY LETTER", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      cx.fillText("Available fault current:", w * 0.06, h * 0.5);
      cx.fillText("18,400 A at the service", w * 0.06, h * 0.72);
    }, { ry: 0.9, accent: AFL_ACCENT });
    reg(hits, utilLetter, "utility-letter");

    const tripCurve = holoPanel(g, 0.5, 0.4, -1.4, 1.35, 1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7ee6ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("CB-22 TIME-CURRENT CURVE", w * 0.06, h * 0.18);
      cx.strokeStyle = "#7ee6ff"; cx.lineWidth = 3; cx.beginPath();
      cx.moveTo(w * 0.1, h * 0.3); cx.lineTo(w * 0.5, h * 0.55); cx.lineTo(w * 0.9, h * 0.85); cx.stroke();
      cx.fillStyle = "#bcd6e2"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("Clears in 4 cycles at fault", w * 0.06, h * 0.94);
    }, { ry: 1.15, accent: AFL_ACCENT });
    reg(hits, tripCurve, "trip-curve");

    // ------------------------------------------------------------ calculator
    const calc = instrument(g, 0.4, 0.9, 1.0, { ry: -0.4, idle: "-- cal/cm²", w: 0.16, d: 0.24, color: 0x7ee6ff });
    holoTag(calc, "incident-energy calculator", 0, 0.18, 0, { css: "#7ee6ff", w: 0.4 });
    reg(hits, calc, "ie-calculator");

    // ------------------------------------------------------------ boundaries
    const afBoundary = group(g, -0.6, 0, 0.3);
    for (let i = 0; i < 3; i++) cyl(afBoundary, 0.014, 0.014, 0.6, -0.5 + i * 0.5, 0.3, 0, 0xe4622a, { rough: 0.6, seg: 8 });
    box(afBoundary, 1.1, 0.02, 0.02, 0, 0.58, 0, 0xf2c14b, { rough: 0.7 });
    holoTag(afBoundary, "Arc-flash boundary", 0, 0.78, 0, { css: "#e4622a", w: 0.36 });
    reg(hits, afBoundary, "arc-flash-boundary");

    const laBoundary = group(g, -0.6, 0, 1.0);
    for (let i = 0; i < 3; i++) cyl(laBoundary, 0.014, 0.014, 0.6, -0.5 + i * 0.5, 0.3, 0, 0x59c97b, { rough: 0.6, seg: 8 });
    box(laBoundary, 1.1, 0.02, 0.02, 0, 0.58, 0, 0x59c97b, { rough: 0.7 });
    holoTag(laBoundary, "Limited-approach boundary", 0, 0.78, 0, { css: "#59c97b", w: 0.44 });
    reg(hits, laBoundary, "limited-approach-boundary");

    // --------------------------------------------------------------- PPE table
    const ppeTable = holoPanel(g, 0.5, 0.42, -1.9, 0.75, -0.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7ee6ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("PPE CATEGORY TABLE", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      ["Cat 1: ≤4 cal/cm²", "Cat 2: ≤8 cal/cm²", "Cat 3: ≤25 cal/cm²", "Cat 4: ≤40 cal/cm²"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.14)));
    }, { ry: 0.4, accent: AFL_ACCENT });
    reg(hits, ppeTable, "ppe-table");

    // ------------------------------------------------------------- PPE stand
    const ppeStand = group(g, -1.9, 0, -0.3, 0.4);
    box(ppeStand, 0.06, 1.6, 0.06, 0, 0.8, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const suit = box(ppeStand, 0.4, 0.9, 0.1, 0, 0.9, 0.2, 0x2f6f8c, { rough: 0.85 });
    holoTag(suit, "Arc-rated coverall", 0, 0.55, 0, { css: "#7ee6ff", w: 0.32 });
    reg(hits, suit, "arc-suit");
    const shield = ball(ppeStand, 0.13, 0.16, 1.3, 0.06, 0xffb26b, { rough: 0.12, opacity: 0.5, side: 2 });
    shield.scale.set(1, 0.8, 0.5);
    holoTag(shield, "Face shield", 0.16, 1.5, 0.06, { css: "#7ee6ff", w: 0.26 });
    reg(hits, shield, "face-shield");

    // ------------------------------------------------------------ generic stack
    const genericStack = group(g, 1.9, 0, 0.9);
    for (let i = 0; i < 4; i++) box(genericStack, 0.16, 0.02, 0.1, 0, 0.06 + i * 0.024, 0, 0xf2c14b, { rough: 0.7 });
    decal(genericStack, 0.15, 0.09, 0, 0.13, 0.052, signFace("DANGER", { bg: "#7d1512", accent: "#f2ae14", scale: 0.55 }));
    holoTag(genericStack, "generic stickers", 0, 0.24, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, genericStack, "guess-category");

    const nameplateSticker = decal(g, 0.14, 0.08, 1.5, 0.7, -1.35, signFace("22 kAIC", { bg: "#eee7d6", accent: "#3a4450", scale: 0.6 }));
    holoTag(g, "transformer nameplate", 1.5, 0.82, -1.35, { css: "#d2312b", w: 0.34 });
    reg(hits, nameplateSticker, "nameplate-fault");

    const barePanel = box(g, 0.4, 0.4, 0.4, -0.6, 1.0, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "read the nameplate bare?", -0.6, 1.35, -1.0, { css: "#d2312b", w: 0.42 });
    reg(hits, barePanel, "bare-panel-approach");

    // ------------------------------------------------------------ printer + label
    const printerCart = toolChest(g, 1.6, -0.4, { ry: 0.7, color: 0x2b3138 });
    const printer = box(printerCart, 0.3, 0.16, 0.2, 0, 0.82, 0, 0xd9dde2, { rough: 0.5, metal: 0.3 });
    holoTag(printer, "label printer", 0, 0.24, 0, { css: "#7ee6ff", w: 0.3 });
    reg(hits, printer, "label-printer");

    const printedLabel = group(g, 1.6, 0.1, -0.75);
    box(printedLabel, 0.16, 0.02, 0.1, 0, 0.9, 0, 0xf2c14b, { rough: 0.5 });
    decal(printedLabel, 0.15, 0.09, 0, 0.911, 0, signFace("WARNING", { bg: "#f2c14b", accent: "#1b1e22", scale: 0.55 }));
    reg(hits, printedLabel, "printed-label");

    const ppeDecalSpot = box(panel, 0.16, 0.1, 0.02, 0.24, 1.6, 0.211, 0x2b3138, { rough: 0.6 });
    reg(hits, ppeDecalSpot, "ppe-decal-spot");

    // ------------------------------------------------------------ row walk-down
    const fadedLabel = decal(wrongPanel, 0.3, 0.2, 0, 1.35, 0.2, (cx, w, h) => {
      cx.fillStyle = "#c9c2ae"; cx.fillRect(0, 0, w, h);
      cx.globalAlpha = 0.4; cx.fillStyle = "#f2c14b"; cx.fillRect(h * 0.1, h * 0.1, w - h * 0.2, h * 0.3);
      cx.globalAlpha = 1;
    }, { px: 220 });
    reg(hits, fadedLabel, "faded-label");
    const mismatchTag = decal(wrongPanel, 0.2, 0.1, 0, 0.6, 0.2, signFace("SPARE?", { bg: "#2b3138", accent: "#f0645b", scale: 0.6 }));
    reg(hits, mismatchTag, "mismatched-breaker-tag");

    const studyFile = holoPanel(g, 0.4, 0.3, 2.2, 0.7, 1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7ee6ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("STUDY FILE", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#bcd6e2";
      cx.fillText("LP-4 — logged", w / 2, h * 0.62);
    }, { ry: -0.5, accent: AFL_ACCENT });
    reg(hits, studyFile, "study-file");

    // A second electrician, off near the wrong panel, who peels a label onto
    // it if the interruption is missed.
    const sub = standingFigure(g, 1.4, 0.6, { ry: 2.1, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(sub, "second electrician", 0, 1.95, 0, { css: "#7ee6ff", w: 0.36 });

    let flash = 0;
    const arc = particles(g, 22, 0xbfe9ff, { size: 0.014, life: 0.28 });

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "place") { printedLabel.position.set(-0.6, 1.55, -1.34); }
        if (step.id === "post-category") { const p = decal(ppeDecalSpot, 0.15, 0.09, 0, 0, 0.011, signFace("CAT 2", { bg: "#f2c14b", accent: "#1b1e22", scale: 0.6 })); void p; }
        if (step.id === "walk") { fadedLabel.material.opacity = 1; }
      },

      onHazard(hitId) { if (hitId === "bare-panel-approach") flash = 0.4; },

      onInterrupt(it) {
        if (it.id === "breaker-setting-changed") { settingSheet.material.emissiveIntensity = 1.6; repaint(settingSheet, (cx, w, h) => {
          cx.fillStyle = "#7d1512"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#ffe3ac"; cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`;
          cx.fillText("SETTING CHANGED", w / 2, h * 0.35);
          cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
          cx.fillText("Check before use", w / 2, h * 0.68);
        }); }
        if (it.id === "wrong-panel") { sub.position.set(1.0, 0, -1.1); sub.rotation.y = 0.6; wrongPanel.userData.door.rotation.y = 0.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "breaker-setting-changed") { settingSheet.material.emissiveIntensity = 1; repaint(settingSheet, (cx, w, h) => {
          cx.fillStyle = "#eee7d6"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#3a4450"; cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`;
          cx.fillText("BREAKER SETTING", w / 2, h * 0.22);
          cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
          cx.fillText("LTPU: 0.9 (verified)", w / 2, h * 0.55);
          cx.fillText("Rev. checked today", w / 2, h * 0.78);
        }); }
        if (it.id === "wrong-panel") { sub.position.set(1.4, 0, 0.6); sub.rotation.y = 2.1; wrongPanel.userData.door.rotation.y = 0; }
      },

      animate(t, dt, session) {
        if (flash > 0) { flash -= dt; arc.visible = true; arc.userData.step(dt, new THREE.Vector3(-0.6, 1.0, -1.4), 0.08, 1.3, -2.6); }
        else if (arc.visible) arc.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "incident-energy") {
          repaint(calc.userData.screen, signFace(`${(2 + gg.t * 12).toFixed(1)} cal/cm²`, {
            bg: "#0d1c24", accent: gg.t > 0.36 && gg.t < 0.54 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
