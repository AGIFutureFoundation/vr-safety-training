import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hazmat Container Inspection VR — Maritime & Ports, a
// dangerous-goods box on the open apron rather than a ship's hold: the
// paperwork and the physical box checked against each other before anyone
// gets close, a leak found from outside a sealed container through the one
// evidence a clerk on the apron actually has — the door seam — and the box
// isolated and reported rather than opened. Nothing here is any one
// terminal's own dangerous-goods desk; the standard is the one every marine
// terminal in the country is held to.

const HCI_ACCENT = 0xd88a3a;

export const SIM_HAZMAT_CONTAINER_INSPECTION = {
  id: "hazmat-container-inspection",
  index: "184",
  domain: "Maritime",
  trade: "Marine clerk — ILWU, with the Coast Guard's inspection standard",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "ILWU marine clerks — U.S. Coast Guard regulations for waterfront facilities handling dangerous cargo (33 CFR Part 126); IMO's International Maritime Dangerous Goods (IMDG) Code placarding and segregation rules; OSHA HAZWOPER 29 CFR 1910.120 hazard recognition",
  name: "Hazmat Container Inspection",
  title: simTitle("Hazmat Container Inspection"),
  tagline: "A dangerous-goods box on the apron: placards checked against the declaration, IMDG segregation confirmed, the seal verified, a leak found through the door seam from a safe standoff, the box isolated, and the terminal and the Coast Guard notified",
  accent: HCI_ACCENT,
  accentCss: "#d88a3a",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "apron-cleared", name: "Apron Cleared", note: "Declaration matched, segregation held, a leak found from a safe standoff and isolated before anyone got closer — first time" },

  game: system({
    name: "Dangerous Goods Desk",
    currency: "MANIFEST",
    ranks: ["Checker", "Marine Clerk", "Senior Clerk", "Lead Clerk", "Dangerous Goods Certified"],
    badges: [
      { id: "declaration-matched", name: "Declaration Matched", note: "Every placard checked against the DGD before anything else", test: AWARD.stepClean("placard-check") },
      { id: "standoff-held", name: "Standoff Held", note: "Never closer than the safe distance, never through the seal", test: AWARD.safe },
      { id: "reading-true-hz", name: "Reading True", note: "Standoff scan and vent reading both held inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections anywhere on the apron", test: AWARD.clean },
      { id: "scan-steady", name: "Scan Steady", note: "Held the perimeter scan without a break", test: AWARD.unbroken },
      { id: "closed-out-fast", name: "Closed Out Fast", note: "Inspection complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "sniff-close": "You leaned in over the vent to smell for yourself instead of reading the meter from arm's length. Whatever concentration is venting off this box is exactly what a nose right at the source gets the full dose of, and a meter held at a safe standoff exists precisely so nobody has to find out that way.",
    "open-early": "You reached for the door handle before the inspection closed out. A sealed dangerous-goods container is evidence of what is inside it right up until the seal is broken — breaking it before the class, the segregation and the leak check are all done throws away the one thing that told you what you were about to open.",
    "skip-uscg": "You closed the record without ever calling the Coast Guard. Notifying the terminal tells the people working around this box; notifying the Coast Guard is the separate, required call that a dangerous-goods incident on a waterfront facility does not get to stay a purely internal matter.",
    "wave-mismatch": "You clicked past a placard that doesn't match the declaration instead of stopping on it. A placard is the only warning anyone approaching this box from a distance actually gets, and one that doesn't match the class actually inside it is worse than no placard at all — it tells the wrong emergency response to whatever happens next.",
  },

  lateNotes: {
    "vent-meter": "Nothing to read at the vent until the perimeter scan is done and the meter has already proven itself steady at a safe distance.",
    "exclusion-tape": "The exclusion goes up once the leak is confirmed at the door seam, not before there's anything to isolate.",
  },

  steps: [
    {
      id: "brief", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-clerk", "radio-checkin-hz"],
      itemNames: { "hi-vis-clerk": "high-vis vest", "radio-checkin-hz": "radio check-in with terminal control" },
      title: "Suit up and check in with terminal control",
      cue: "Put on the high-vis vest and radio terminal control before approaching the box.",
      why: "A dangerous-goods box sitting alone on the apron is still parked in an active traffic lane worked by tractors and other clerks, and the radio call is what tells terminal control a clerk is standing next to a box on the manifest before anyone hooks up to move it out from under that inspection.",
    },
    {
      id: "hold-flag", kind: "select", target: "chassis-hold-flag",
      title: "Flag the chassis on hold",
      cue: "Set the hold flag on the chassis before starting the inspection so nobody hooks up to pull it.",
      why: "A chassis sitting on the apron looks exactly like every other chassis waiting for a tractor unless something on it says otherwise — the hold flag is the one signal a driver walking the row actually sees, and it goes on before the inspection starts, not after somebody has already backed under it.",
    },
    {
      id: "dgd", kind: "select", target: "dgd-form",
      title: "Read the dangerous goods declaration",
      cue: "Check the DGD for the UN number, class, packing group and quantity declared for this box.",
      why: "The declaration is the one document that says what a shipper claims is actually inside a sealed box, and every check that follows — the placards, the segregation, even what a leak might mean — is measured against what this piece of paper says before anyone assumes they already know.",
    },
    {
      id: "placard-check", kind: "find", noHint: true,
      targets: ["placard-mismatch"],
      itemNames: { "placard-mismatch": "placard not matching the declared class" },
      itemNotes: { "placard-mismatch": "That side's placard shows a different class diamond than the one on the DGD — it does not match what this box is declared to be carrying." },
      title: "Check every placard against the declaration",
      cue: "Walk all four sides and click the placard that doesn't match the DGD.",
      why: "A placard is read by everyone who is not standing here with the declaration in hand — the driver in the next lane, the fire crew that gets called if something goes wrong — and a box placarded for a different class than it is declared to hold sends every one of them the wrong information at the moment it matters most.",
    },
    {
      id: "segregation", kind: "select", target: "segregation-board",
      title: "Check IMDG segregation from the boxes alongside",
      cue: "Confirm the classes stowed on either side of this box are compatible under the segregation table.",
      why: "The IMDG Code's segregation rules exist because some classes react with each other given nothing more than proximity and a warm afternoon, and a box correctly placarded and properly sealed can still be sitting somewhere it should never have been parked if the boxes on either side of it were never checked against it.",
    },
    {
      id: "seal-check", kind: "sequence", anyOrder: true,
      targets: ["seal-number", "seal-intact"],
      itemNames: { "seal-number": "seal number matched to the manifest", "seal-intact": "seal checked unbroken" },
      title: "Verify the seal",
      cue: "Match the seal number to the manifest and confirm it is unbroken.",
      why: "The seal is the only proof that nothing has been added, removed or swapped since this box left the shipper, and it is worth exactly nothing if the number is never actually checked against the manifest — a broken seal with a number that still matches is a different finding than a broken seal on a box that was never supposed to be sealed with this one to begin with.",
    },
    {
      id: "meter-zero", kind: "hold", target: "meter-cal", seconds: 3,
      title: "Zero the gas meter in clean air",
      cue: "Hold the meter in clean air away from the box until it zeroes before using it near a suspect leak.",
      why: "A meter that has not been zeroed in air nobody doubts carries whatever bias it drifted to sitting in the truck, and a meter reading wrong low is the one thing that turns a real all-clear over a venting box into a false one — it is zeroed here, away from the box, specifically so the reading it gives later can actually be trusted.",
      holdBreakNote: "Pulled away before it zeroed — hold it in clean air a moment longer.",
    },
    {
      id: "standoff-scan", kind: "track", target: "gas-meter-track", seconds: 6,
      title: "Scan the box from a safe standoff",
      cue: "Walk the perimeter at a safe distance, keeping the meter's reading in view the whole way round.",
      track: { start: 0.05, green: [0.0, 0.3], rise: 0.5, fall: 0.45, drift: 0.14, label: "PERIMETER READING", readout: (v) => (v > 0.3 ? "climbing — hold your distance" : "clear at this distance") },
      why: "A dangerous-goods box that is venting does not always vent from the one seam anybody happens to be standing closest to, and a standoff scan of the whole perimeter is what catches a leak on the far side before anyone has walked around to that side without a meter running at all.",
      holdBreakNote: "Reading climbed and the scan broke off early — hold your distance and keep the meter running the rest of the way round.",
    },
    {
      id: "vent-read", kind: "gauge", target: "vent-meter",
      title: "Read the vent for leaks and odours",
      cue: "Hold the meter to the vent from arm's length and commit the reading.",
      gauge: { label: "VENT READING", speed: 0.6, green: [0.0, 0.28], readout: (t) => `${Math.round(t * 100)} % LEL`, missNote: "That reading is over the working limit for this class — stop here and treat the box as leaking, not clear." },
      why: "The vent is the one opening on a sealed container that a clerk on the apron is actually allowed to read, and doing it from arm's length with a meter rather than up close with a nose is what keeps 'checking for leaks and odours' from meaning the same thing as being the first exposure to whatever is escaping.",
    },
    {
      id: "door-seam", kind: "hold", target: "seam-light", seconds: 4,
      title: "Light the door seam",
      cue: "Hold the light steady along the seam and check the whole length for staining.",
      why: "A drum that has started leaking inside a closed container shows up outside it, if at all, as nothing more than a stain tracking down the one seam it can reach — a light run slowly and steadily along that seam, not swept past it, is what turns a box that reads clean on the meter into one a clerk still knows to isolate rather than wave through.",
      holdBreakNote: "Light moved off the seam before the sweep finished — hold it steady along the full length, not partway.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["exclusion-tape", "exclusion-cones-hz"],
      itemNames: { "exclusion-tape": "approach taped off", "exclusion-cones-hz": "exclusion cones set" },
      title: "Set the exclusion around the box",
      cue: "Tape off the approach and ring the box with cones before anyone gets closer.",
      why: "A box that has just been found leaking is the one thing on this apron everybody else needs to be kept a known distance from, and the tape and the cones are what make that distance visible to a driver or another clerk who was not standing here for the door-seam check and has no other way of knowing this box is no longer just another box on the manifest.",
    },
    {
      id: "notify", kind: "sequence",
      targets: ["notify-terminal", "notify-uscg"],
      itemNames: { "notify-terminal": "terminal operations notified", "notify-uscg": "Coast Guard notified" },
      title: "Notify the terminal, then the Coast Guard",
      cue: "Call the terminal operations desk first, then make the required notification to the Coast Guard.",
      why: "The terminal call is what gets the apron around this box cleared and worked around; the Coast Guard notification is the separate, required report that a dangerous-goods release at a waterfront facility does not stay an internal matter simply because the terminal has already handled its own side of it.",
      outOfOrderNote: "Terminal first, then the Coast Guard — the people working this apron right now are cleared before the report that follows the incident up the chain.",
    },
    {
      id: "record", kind: "select", target: "record-board",
      title: "Complete the inspection record",
      cue: "Log the class, the finding, the isolation and both notifications on the record.",
      why: "The record is what the terminal, the shipper and the Coast Guard all eventually read back against each other, and an inspection with nothing written down leaves nobody afterward able to say what this clerk actually found, when, or what was done about it before the box ever left the apron.",
    },
  ],

  interrupts: [
    {
      id: "driver-hookup",
      kind: "Tractor hooking up mid-inspection",
      after: "standoff-scan", delay: 3, seconds: 11,
      alert: "A yard tractor has backed under the chassis and the driver is reaching for the fifth-wheel release, about to pull this box before the inspection is closed.",
      cue: "That box is still under inspection. Stop the driver before the wheels move.",
      target: "chassis-hold-flag",
      why: "A hold flag only works if somebody actually sees it before they hook up, and a driver working fast down a row of chassis does not always look — waving them off at the flag, in person, the moment they back under this one is the difference between an inspection that finishes where the box is sitting and one that has to be repeated wherever it ends up next.",
      missNote: "The tractor pulled out with the box still mid-inspection. Whatever the standoff scan had or had not yet found was now somewhere else on the terminal, hooked to a machine that had no idea it was carrying an open dangerous-goods hold.",
      wrongNote: "It's the hold flag. A driver hooking up mid-inspection is answered by getting their attention on it, not by anything back at the meter.",
    },
    {
      id: "second-clerk-door",
      kind: "Second clerk reaching for the door",
      after: "door-seam", delay: 2, seconds: 11,
      alert: "A second clerk has walked up from the row and put a hand on the door handle, about to break the seal to look inside.",
      cue: "That seam is already staining. Stop them before that door comes open.",
      target: "exclusion-tape",
      why: "The second clerk was not standing here for the door-seam check and has no reason yet to know this box is any different from the one they inspected an hour ago — getting the tape up between them and that handle is what tells them, faster than an explanation would, that this door does not open until the isolation is set and reported.",
      missNote: "The door came open before the tape went up. Whatever had been weeping against that seal now had a second person standing directly in front of it with no meter and no warning.",
      wrongNote: "It's the exclusion tape. A second clerk reaching for the door is stopped by getting the line up between them and it, not by anything at the vent.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, HCI_ACCENT);

    // ------------------------------------------------------------- apron deck
    const pavingTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#20242a", base2: "#191c21" }), { repeat: 6, px: 256 });
    const deckMesh = box(g, 6.0, 0.1, 5.6, 0, 0.05, -0.2, 0xffffff, { rough: 0.85, metal: 0.1 });
    deckMesh.material = texturedMat(pavingTex, { rough: 0.85, metal: 0.08, color: 0x8f979d });
    for (const sz of [-1.7, 1.1]) box(g, 6.0, 0.008, 0.03, 0, 0.101, sz, 0xf2c14b, { rough: 0.6, cast: false });

    // -------------------------------------------------------- the subject box
    const chassis = group(g, 0, 0, -0.6);
    box(chassis, 2.6, 0.14, 0.7, 0, 0.09, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const wx of [-1.0, 1.0]) for (const wz of [-0.25, 0.25]) cyl(chassis, 0.11, 0.11, 0.1, wx, 0.05, wz, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    const boxBody = box(chassis, 2.4, 1.0, 0.6, 0, 0.66, 0, 0xd88a3a, { rough: 0.55, metal: 0.15 });
    void boxBody;
    const doorFace = box(chassis, 0.04, 0.98, 0.58, 1.2, 0.66, 0, 0x2b3138, { rough: 0.55, metal: 0.2 });
    const seamStain = decal(chassis, 0.05, 0.5, 1.221, 0.5, 0,
      (cx, w, h) => { cx.clearRect(0, 0, w, h); cx.fillStyle = "rgba(20,14,6,0.55)"; cx.fillRect(w * 0.35, 0, w * 0.3, h * 0.9); cx.fillStyle = "rgba(20,14,6,0.3)"; cx.fillRect(w * 0.2, h * 0.7, w * 0.6, h * 0.25); },
      { px: 96, transparent: true });
    seamStain.rotation.y = Math.PI / 2;
    seamStain.visible = false;
    const seamLight = instrument(g, -1.5, 0.5, 0.35, { ry: 0.4, idle: "SEAM", color: HCI_ACCENT, w: 0.11, d: 0.17 });
    holoTag(seamLight, "light — hold along the seam", 0, 0.16, 0, { css: "#d88a3a", w: 0.5 });
    reg(hits, seamLight, "seam-light");
    const doorHandle = box(chassis, 0.03, 0.1, 0.03, 1.22, 0.5, 0.1, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    holoTag(doorHandle, "door handle", 0, 0.14, 0, { css: "#d88a3a", w: 0.24 });
    const openEarlyHit = box(chassis, 0.16, 0.2, 0.14, 1.24, 0.5, 0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(chassis, "open it now?", 1.24, 0.72, 0.12, { css: "#d2312b", w: 0.24 });
    reg(hits, openEarlyHit, "open-early");
    void doorFace;

    // Placards on all four sides; the +x side shows the mismatch.
    const placardSpecs = [
      { x: -1.201, y: 0.9, z: 0, ry: -Math.PI / 2, id: "placard-good-front" },
      { x: 1.201, y: 0.9, z: 0, ry: Math.PI / 2, id: "placard-mismatch" },
      { x: 0, y: 0.9, z: 0.301, ry: 0, id: "placard-good-side" },
    ];
    for (const p of placardSpecs) {
      const cls = p.id === "placard-mismatch" ? "4" : "3";
      const placard = decal(chassis, 0.28, 0.28, p.x, p.y, p.z,
        (cx, w, h) => {
          cx.fillStyle = "#e8622a"; cx.save(); cx.translate(w / 2, h / 2); cx.rotate(Math.PI / 4); cx.fillRect(-w * 0.35, -h * 0.35, w * 0.7, h * 0.7); cx.restore();
          cx.strokeStyle = "#1b1e23"; cx.lineWidth = 4; cx.save(); cx.translate(w / 2, h / 2); cx.rotate(Math.PI / 4); cx.strokeRect(-w * 0.35, -h * 0.35, w * 0.7, h * 0.7); cx.restore();
          cx.fillStyle = "#1b1e23"; cx.font = `700 ${Math.round(h * 0.32)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(cls, w / 2, h * 0.68);
        }, { px: 128 });
      placard.rotation.y = p.ry;
      if (p.id === "placard-mismatch") reg(hits, placard, "placard-mismatch");
    }
    const waveHit = box(chassis, 0.16, 0.16, 0.16, 1.24, 1.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(chassis, "close enough?", 1.24, 1.3, 0, { css: "#d2312b", w: 0.26 });
    reg(hits, waveHit, "wave-mismatch");

    const holdFlag = group(chassis, -1.15, 0.3, 0.4);
    cyl(holdFlag, 0.014, 0.014, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(holdFlag, 0.14, 0.09, 0.01, 0.08, 0.44, 0, 0xd2312b, { rough: 0.6 });
    holoTag(holdFlag, "chassis hold flag", 0, 0.6, 0, { css: "#d88a3a", w: 0.36 });
    reg(hits, holdFlag, "chassis-hold-flag");

    const sealGroup = group(chassis, 1.05, 0.4, 0.31);
    cyl(sealGroup, 0.012, 0.012, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 10 });
    holoTag(sealGroup, "seal — match the manifest", 0, 0.1, 0, { css: "#d88a3a", w: 0.4 });
    reg(hits, sealGroup, "seal-number");
    const sealIntactHit = box(chassis, 0.08, 0.08, 0.06, 1.05, 0.28, 0.31, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sealIntactHit, "seal-intact");

    // ---------------------------------------------------------- adjacent boxes
    for (const [bx, colour] of [[-2.0, 0x6f7a83], [2.0, 0x3a7ca5]]) {
      box(g, 0.9, 0.9, 0.55, bx, 0.55, -0.6, colour, { rough: 0.6, metal: 0.15 });
    }
    const segBoard = holoPanel(g, 0.9, 0.6, 0, 1.6, -1.7, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a3a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe6cf"; cx.fillText("IMDG SEGREGATION — THIS BOX vs NEIGHBOURS", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fff2e2";
      ["This box: Class 3, flammable liquid", "Port side: Class 8 — segregation OK", "Stbd side: Class 5.1 — check table", "Away from Class 1 explosives, ignition sources"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.14)));
    }, { accent: HCI_ACCENT });
    reg(hits, segBoard, "segregation-board");

    // -------------------------------------------------------------- paperwork
    const chest = toolChest(g, 2.3, 1.2, { ry: -0.6, color: 0x6f5426 });
    const dgd = decal(chest, 0.3, 0.42, -0.08, 0.815, 0.05, paperFace("DANGEROUS GOODS DECLARATION", ["UN 1203 — Gasoline", "Class 3, PG II", "Qty: 18 drums, 3400 L", "Emergency contact: ______"], { scale: 0.85 }));
    dgd.rotation.x = -Math.PI / 2;
    holoTag(chest, "DGD", -0.08, 1.0, 0.05, { css: "#d88a3a", w: 0.2 });
    reg(hits, dgd, "dgd-form");
    const hiVis = box(chest, 0.22, 0.1, 0.1, 0.15, 0.9, -0.1, 0xf2c14b, { rough: 0.85 });
    holoTag(hiVis, "high-vis vest", 0, 0.12, 0, { css: "#d88a3a", w: 0.24 });
    reg(hits, hiVis, "hi-vis-clerk");
    const radio = box(chest, 0.07, 0.16, 0.04, 0.3, 0.85, -0.05, 0x1b1e23, { rough: 0.6 });
    holoTag(radio, "radio — check in with terminal control", 0.3, 1.0, -0.05, { css: "#d88a3a", w: 0.5 });
    reg(hits, radio, "radio-checkin-hz");

    // -------------------------------------------------------- meter and vent
    const meterCal = instrument(g, -2.3, 0.55, 0.9, { ry: 0.5, idle: "-- % LEL", color: HCI_ACCENT, w: 0.12, d: 0.19 });
    holoTag(meterCal, "meter — zero in clean air", 0, 0.16, 0, { css: "#d88a3a", w: 0.48 });
    reg(hits, meterCal, "meter-cal");
    const vent = cyl(chassis, 0.03, 0.03, 0.04, -0.9, 1.0, 0.31, 0xb9bec4, { rough: 0.4, metal: 0.6, seg: 12 });
    const ventMeter = instrument(g, -0.9, 1.3, -0.15, { ry: 0.2, idle: "-- % LEL", color: HCI_ACCENT, w: 0.12, d: 0.19 });
    holoTag(ventMeter, "vent — read from arm's length", 0, 0.16, 0, { css: "#d88a3a", w: 0.5 });
    reg(hits, ventMeter, "vent-meter");
    const sniffHit = box(g, 0.16, 0.16, 0.16, -0.9, 1.0, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean in and smell it?", -0.9, 1.2, -0.05, { css: "#d2312b", w: 0.36 });
    reg(hits, sniffHit, "sniff-close");
    const vapour = particles(chassis, 8, 0x9fd6ee, { size: 0.014, life: 0.5, additive: false, opacity: 0.4 });
    vapour.position.set(-0.9, 1.03, 0.34);
    void vent;

    const perimeterMeter = instrument(g, 0, 0.7, 1.5, { ry: Math.PI, idle: "-- % LEL", color: HCI_ACCENT, w: 0.12, d: 0.19 });
    holoTag(perimeterMeter, "perimeter scan — hold the standoff", 0, 0.16, 0, { css: "#d88a3a", w: 0.5 });
    reg(hits, perimeterMeter, "gas-meter-track");

    // -------------------------------------------------------------- isolation
    const tapeGroup = group(g, 0, 0, 1.7);
    cyl(tapeGroup, 0.012, 0.012, 0.6, -0.7, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(tapeGroup, 0.012, 0.012, 0.6, 0.7, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const tape = box(tapeGroup, 1.5, 0.05, 0.006, 0, 0.7, 0, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(tapeGroup, "exclusion line", 0, 0.9, 0, { css: "#d88a3a", w: 0.32 });
    reg(hits, tape, "exclusion-tape");
    const excCones = group(g, 0, 0, -1.5);
    cone(excCones, -0.9, 0); cone(excCones, 0.9, 0); cone(excCones, 0, -0.4);
    reg(hits, excCones, "exclusion-cones-hz");

    const notifyBoard = group(g, -2.3, 0, -1.7, 0.4);
    const terminalRadio = box(notifyBoard, 0.07, 0.16, 0.04, -0.1, 0.7, 0, 0x1b1e23, { rough: 0.6 });
    holoTag(terminalRadio, "call terminal operations", 0, 0.14, 0, { css: "#d88a3a", w: 0.44 });
    reg(hits, terminalRadio, "notify-terminal");
    const uscgRadio = box(notifyBoard, 0.07, 0.16, 0.04, 0.15, 0.7, 0, 0xd2312b, { rough: 0.6 });
    holoTag(uscgRadio, "notify the Coast Guard", 0, 0.14, 0, { css: "#d88a3a", w: 0.4 });
    reg(hits, uscgRadio, "notify-uscg");
    const skipUscgHit = box(notifyBoard, 0.14, 0.14, 0.14, 0.3, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(notifyBoard, "log it and skip the call?", 0.3, 1.1, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, skipUscgHit, "skip-uscg");

    const recordBoard = holoPanel(g, 0.8, 0.5, 2.3, 1.5, -1.3, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a3a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe6cf"; cx.fillText("INSPECTION RECORD", w / 2, h * 0.22);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fff2e2";
      cx.fillText("Class / finding / isolation", w / 2, h * 0.55);
      cx.fillText("Clerk: ______", w / 2, h * 0.78);
    }, { ry: 0.6, accent: HCI_ACCENT });
    reg(hits, recordBoard, "record-board");

    standingFigure(g, 2.7, -2.0, { ry: 2.0, cloth: 0x1f3a52 });

    // The second clerk who reaches for the door once the seam is found, and
    // the tractor that hooks up mid-inspection — both hidden until their
    // interrupt fires, both a real mesh moving into the scene when it does.
    const secondClerkHome = new THREE.Vector3(2.6, 0, 1.9);
    const secondClerk = standingFigure(g, secondClerkHome.x, secondClerkHome.z, { ry: -2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0x1b1e22 });
    const tractorHome = new THREE.Vector3(-3.6, 0, -0.6);
    const tractor = group(g, tractorHome.x, tractorHome.z, 0, Math.PI / 2);
    box(tractor, 0.9, 0.7, 0.6, 0, 0.45, 0, 0xd8232a, { rough: 0.5, metal: 0.3 });
    box(tractor, 0.4, 0.4, 0.5, 0.5, 0.7, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    for (const wx of [-0.3, 0.3]) for (const wz of [-0.32, 0.32]) cyl(tractor, 0.14, 0.14, 0.1, wx, 0.14, wz, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;

    const tapeHomeMat = tape.material;
    void tapeHomeMat;
    const trackHomeMat = mat(HCI_ACCENT, { emissive: HCI_ACCENT, ei: 1.2, seg: 10 });
    void trackHomeMat;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "door-seam") { vapour.visible = false; seamStain.visible = true; repaint(seamLight.userData.screen, signFace("STAINED", { bg: "#2a1c0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.5 })); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "driver-hookup") tractor.position.set(-0.4, 0, -0.9);
        if (it.id === "second-clerk-door") { secondClerk.position.set(1.6, 0, 0.3); secondClerk.rotation.y = -2.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "driver-hookup") tractor.position.set(tractorHome.x, 0, tractorHome.z);
        if (it.id === "second-clerk-door") { secondClerk.position.set(secondClerkHome.x, 0, secondClerkHome.z); secondClerk.rotation.y = -2.0; }
      },
      animate(t, dt, session) {
        vapour.visible && vapour.userData.step(dt, new THREE.Vector3(0, 0.02, 0.01), 0.02, 0.2, -0.5);
        const step = session?.step;
        if (session?.holding && step?.id === "meter-zero") repaint(meterCal.userData.screen, signFace("ZEROING", { bg: "#08161e", accent: "#f2ae14", fg: "#fff2e2", scale: 0.5 }));
        if (session?.holding && step?.id === "door-seam") repaint(seamLight.userData.screen, signFace("SWEEPING", { bg: "#08161e", accent: "#f2ae14", fg: "#fff2e2", scale: 0.48 }));
        if (step?.id === "standoff-scan" && session.track) repaint(perimeterMeter.userData.screen, signFace(`${Math.round(session.track.v * 100)} % LEL`, { bg: "#08161e", accent: session.track.v <= 0.3 ? "#59c97b" : "#f0645b", fg: "#fff2e2", scale: 0.55 }));
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "vent-read") repaint(ventMeter.userData.screen, signFace(`${Math.round(gg.t * 100)} % LEL`, { bg: "#08161e", accent: gg.t <= 0.28 ? "#59c97b" : "#f0645b", fg: "#fff2e2", scale: 0.55 }));
      },
    };
  },
};
