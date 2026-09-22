import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bridge Lead Containment VR — Construction & Structural Trades.
// A full negative-pressure containment built around one bay of a truss bridge
// over open water, so the lead paint that comes off that steel never gets a
// chance to reach the water underneath it. The manometer is the only thing
// that proves the tent is actually holding vacuum; the poly looks identical
// whether it is or isn't. Everything downstream of the blood-lead baseline
// and the fit-tested respirator answers to OSHA's lead-in-construction
// standard, 29 CFR 1926.62, and the debris is RCRA D008 hazardous waste the
// instant it leaves the containment, whatever it is carried in.

const BLC_ACCENT = 0xcf8f4a;

export const SIM_BRIDGE_LEAD_CONTAINMENT = {
  id: "bridge-lead-containment",
  index: "186",
  domain: "Construction",
  trade: "Bridge painter — IUPAT",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "IUPAT bridge painters; OSHA 29 CFR 1926.62 lead in construction, including baseline and periodic blood-lead surveillance; SSPC-QP 2 certified lead-paint removal contractor and the SSPC-SP 10 near-white blast standard; OSHA 1910.134 respiratory protection and annual fit testing; 40 CFR 261 (RCRA) characteristic hazardous waste D008 for lead-paint debris",
  name: "Bridge Lead Containment",
  title: simTitle("Bridge Lead Containment"),
  tagline: "A truss bay fully contained over open water: pressure proven, the respirator fit-tested against the blood-lead programme, blasted to standard, and the lead waste labelled and staged before the air sample comes off the line",
  accent: BLC_ACCENT,
  accentCss: "#cf8f4a",
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "truss-contained", name: "Truss Contained", note: "A lead-paint containment on a truss bay held start to finish on measured numbers — fit test, negative pressure, profile and the waste manifest — with nothing reaching the water below" },

  game: system({
    name: "Bridge Coatings Authority", currency: "COAT",
    ranks: ["Helper", "Blaster", "Competent Person", "Coatings Foreman", "Bridge Coatings Authority Certified"],
    badges: [
      { id: "fit-proven", name: "Fit Proven", note: "Reached for a respirator only after confirming its fit-test tag was current", test: AWARD.stepClean("fit-test") },
      { id: "held-negative-truss", name: "Held Negative", note: "Kept the bay's manometer reading negative for the whole run, no exceptions", test: AWARD.safe },
      { id: "near-white-truss", name: "Near-White", note: "Kept the diagonal's standoff distance inside band for the entire pass", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-truss-containment", name: "Clean Containment", note: "Ran the whole bay, plan to manifest, without a single wrong click", test: AWARD.clean },
      { id: "steady-truss-nozzle", name: "Steady Nozzle", note: "Never let the blast pattern drop out of band during the pass", test: AWARD.unbroken },
      { id: "bay-closed-inside-par", name: "Bay Closed Inside Par", note: "Opened, blasted and struck this bay in under 80% of the par time", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "expired-fit-test-tag": "That respirator's fit-test tag is a year out of date. OSHA 1910.134 requires an annual fit test on the exact make and model worn, because a face changes shape enough over a year — weight, dental work, a scar — that a seal proven twelve months ago is not a seal proven today, and a leaking seal in a lead-dust atmosphere fails silently.",
    "gap-in-poly-hazard": "There is a seam here that was never taped down, on the side of the tent facing the water. SSPC's containment classes assume a continuous barrier, not one with a gap left for later — this one has been open since the tent went up, leaking dust the whole time nobody happened to look at this corner.",
    "open-drum-over-water": "You left a lead-paint waste drum open at the edge of the walkway, over the water. The moment that debris left the containment it became RCRA D008 characteristic hazardous waste, and an open drum balanced at the edge of a bridge walkway is one nudge away from putting everything this containment was built to stop straight into the water underneath it.",
    "climb-truss-diagonal": "You climbed the diagonal bracing to reach the work bay instead of using the built access. A truss diagonal is there to carry axial load, not a boot — it is not spaced or shaped for climbing, and the fall from it is onto the chord below or straight through to the water.",
  },

  lateNotes: {
    "blast-nozzle": "Blasting starts after the respirator is fit-tested and the containment is under negative pressure — the hood is the last thing on, not the first.",
    "air-sample-pump": "The air sample doesn't come off the line until the containment has stood down and the drum is already labelled and staged — it has to cover the whole exposure, not just the easy part of it.",
  },

  interrupts: [
    {
      id: "seam-opens",
      kind: "Containment pressure",
      after: "blast", delay: 4, seconds: 13,
      alert: "The manometer at the tent wall has swung to zero — a taped seam on the water side has worked loose and let go.",
      cue: "Reseal it before the dust finds the water.",
      target: "seam-patch",
      why: "A seam taped along a diagonal member takes a little flex every time someone crosses the walkway or the wind moves the span, and tape that held fine standing still can work loose under that cycling without ever looking wrong from the work platform. The manometer is the only thing that reports it — the poly on that seam looks exactly the same open as it did closed, and the failure is a number on a gauge, not something anyone would see by eye from inside the tent.",
      missNote: "Blasting carried on with the seam open and the containment at atmospheric pressure. Lead dust rode that gap out over the water for as long as the gauge went unread.",
      wrongNote: "Not that. The open seam on the water side is where this gets fixed, and it gets fixed now.",
    },
    {
      id: "worker-in-coveralls",
      kind: "Decon breach",
      after: "waste-label", delay: 3, seconds: 11,
      alert: "Your relief has come out of the dirty room and kept walking — still in their coveralls, straight past the wash station.",
      cue: "Call them back before that dust travels any further than it already has.",
      target: "decon-recall",
      why: "Decon exists in three stages because each one strips off something the last one could not — skipping the airlock does not make the dust disappear, it just moves it from the containment onto the walkway, the plaza, and whatever that person touches next. A worker in coveralls past the wash station is lead dust now travelling on its own, and the only way to stop it is to call them back before they go any further.",
      missNote: "They kept walking. Whatever was on those coveralls is now on the plaza deck, the truck seat, and everywhere else the walk led — decon does not work retroactively.",
      wrongNote: "It is the worker still in coveralls. Nothing else matters while lead dust is walking away from the containment on its own.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "compliance-plan",
      title: "Read the lead compliance plan for this bay",
      cue: "Check what the coating tested positive for, the containment class it sets, and the surface standard named for the job.",
why: "Everything that follows traces back to one lab result and one classification: what this truss coating tested positive for, and the containment class SSPC-QP 2 assigns a bay that size over open water. Get either wrong and the respirator selected, the fan sized for the bay, and the waste stream it all ends in are each wrong in a different direction, on a job with the water right underneath it to prove it.",
    },
    {
      id: "baseline", kind: "select", target: "medical-record",
      title: "Confirm the baseline blood-lead draw",
      cue: "Check the medical record for a baseline BLL and a current medical clearance before anyone is exposed.",
      why: "OSHA's 29 CFR 1926.62 lead standard puts a baseline blood-lead level on file before exposure starts, because a rising number only means something measured against a number drawn before the job began. Skip the baseline and the first sign of overexposure on the periodic draw is a number nobody can actually compare against anything.",
    },
    {
      id: "fit-test", kind: "select", target: "respirator-good",
      title: "Don the respirator with a current fit-test tag",
      cue: "Take the respirator with the current fit-test tag — not the one hanging next to it.",
      why: "OSHA 1910.134 requires an annual fit test on the specific make, model and size worn, because the whole protection factor the respirator is rated for assumes a seal proven on this face, not a face like it. Grabbing whichever respirator is closest on the rack skips the one check that actually says this seal works on you.",
    },
    {
      id: "build-containment", kind: "drag", target: "poly-panel",
      title: "Build the containment around the bay",
      cue: "Carry the poly panel from the stack onto the truss bay frame and fit it.",
      why: "The poly is what turns an open truss bay hanging over the water into a sealed volume the negative-air unit can actually hold under vacuum. It goes up on the frame built for it — draped loose over the diagonals, it is a sheet the wind will find, not a containment.",
      drag: { to: "truss-bay-frame", radius: 0.45, missNote: "Not fitted to the bay frame — the panel has to seat on the frame the tent is built around, not hang free of it." },
    },
    {
      id: "seal-sequence", kind: "sequence",
      targets: ["skirt-seal", "penetration-seal", "flap-seal"],
      itemNames: { "skirt-seal": "bottom skirt at the walkway", "penetration-seal": "duct penetration", "flap-seal": "access flap" },
      title: "Tape the containment bottom to top",
      cue: "Seal the bottom skirt at the walkway first, then the duct penetration, then the access flap.",
      why: "Sealing bottom to top is what keeps the tent's own weight from pulling a lower seam open while somebody is still working on a higher one — the skirt at the walkway carries load from everything taped above it, so it goes on first and takes the strain the rest of the sequence depends on.",
      outOfOrderNote: "Skirt, then the penetration, then the flap — sealing the flap before the skirt leaves the seam that carries the most load for last.",
    },
    {
      id: "negair-start", kind: "turn", target: "negair-fan",
      title: "Start the negative-air unit",
      cue: "Turn the negative-air unit on and let it start drawing the bay down before anyone works inside.",
      why: "The fan has to be pulling before anyone steps past the flap, because the bay it is drawing down hangs directly over a waterway rather than a shoulder — whatever this unit fails to catch does not settle on gravel, it settles on the surface below and keeps travelling with the current. Starting it early and leaving it running for the whole shift is what makes the difference between a contained bay and a truss diagonal that happens to have a tent around it.",
      turn: { turns: 0.4, axis: "z", label: "NEGATIVE AIR" },
    },
    {
      id: "manometer", kind: "gauge", target: "manometer",
      title: "Confirm the containment is under negative pressure",
      cue: "Read the manometer on the tent wall and commit inside the band before anyone works inside.",
      why: "Nobody can tell by looking whether this bay is actually under vacuum — taped poly looks the same whether the fan is winning or losing. The gauge is the only witness, and SSPC's containment classes set a minimum reading for exactly that reason: a class is a promise about air movement, not about how the tent looks from the walkway.",
      gauge: {
        label: "CONTAINMENT ΔP", speed: 0.68, green: [0.35, 0.62],
        readout: (t) => `-${(t * 0.5).toFixed(2)}" wc`,
        missNote: "That reading won't hold anyone's trust. Find the leak or the failing fan before a single pass with the nozzle.",
      },
    },
    {
      id: "blast", kind: "track", target: "blast-nozzle", seconds: 7,
      title: "Blast the truss member to SSPC-SP 10",
      cue: "Hold the nozzle standoff steady and work the diagonal to a near-white finish.",
      why: "SSPC-SP 10 draws a hard line at ninety-five percent near-white with only light staining tolerated — it is a pass/fail surface condition, not a matter of how long the nozzle ran. The standoff distance is what actually cuts a usable profile into the steel rather than just polishing off the loose paint, and it has to be corrected continuously because the hand holding the hose drifts the moment it stops paying attention.",
      track: {
        start: 0.1, green: [0.36, 0.58], rise: 0.5, fall: 0.45, drift: 0.12, label: "NOZZLE STANDOFF",
        readout: (v) => (v < 0.36 ? "too close, shattering the abrasive" : v > 0.58 ? "too far, pattern gone soft" : "cutting a clean profile"),
      },
      holdBreakNote: "Standoff drifted out of band — whatever the coating goes onto next is only as consistent as this profile actually was.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["primer-shadow", "rust-pit-truss", "moisture-bead"],
      itemNames: { "primer-shadow": "primer shadow at a gusset bolt", "rust-pit-truss": "rust pit in the diagonal", "moisture-bead": "moisture beaded at the joint" },
      itemNotes: {
        "primer-shadow": "A ring of the old primer is still sitting in the shadow of a gusset bolt head, where the nozzle's angle never quite reached square-on. The open face around it reads near-white just fine — it is only this one recessed ring that will tell the new system it isn't actually on bare steel.",
        "rust-pit-truss": "Years of failed paint left a cluster of pits in this diagonal, each one deep enough to be holding blast grit and trapped moisture the eye can't resolve from three feet away. Coat over them now and they stay the thinnest, weakest points in an otherwise sound member.",
        "moisture-bead": "Beads of condensation have already formed at the gusset joint, drawn out by how much cooler this member runs this close to the water. Whatever gets coated over a bead like this disbonds from underneath on its own schedule, long after the crew that painted it has moved to the next bay.",
      },
      title: "Inspect the blasted truss member",
      cue: "Walk the member and click the three things that fail this blast if they're coated over.",
      why: "None of these three show up in a standoff reading or a near-white judgment made from a few feet back — a bolt-shadow of primer, a pit that trapped its own grit, and a bead of condensation all hide inside a surface that otherwise looks like it passed. Finding them here is what keeps a passed blast from becoming a coating failure by the following season.",
    },
    {
      id: "vacuum-bag", kind: "hold", target: "vacuum-wand", seconds: 5,
      title: "HEPA-vacuum the debris into the drum",
      cue: "Hold the HEPA vacuum wand on the debris pile for the full pass before it's shoveled.",
      why: "A shovel alone leaves the finest lead-bearing fraction of this debris right where the blast dropped it, light enough to lift again the moment anything disturbs the pile. Running the HEPA wand over it first is what actually gets that fraction into the drum instead of back into the bay's own air — or, on this bay, drifting toward the water the moment the containment ever comes down.",
      holdBreakNote: "That pass ended early. Whatever the wand didn't reach is still fine enough to go airborne on its own.",
    },
    {
      id: "waste-label", kind: "select", target: "waste-drum-label",
      title: "Label the drum as hazardous waste",
      cue: "Print and attach the D008 hazardous-waste label before the drum leaves the containment.",
      why: "This debris crossed the legal line into RCRA D008 hazardous waste the instant it left the truss, regardless of what it's sitting in now. An unlabeled drum tells the hauler and the transfer station nothing about what they're actually handling — the label is the only thing riding with the drum that does.",
    },
    {
      id: "waste-drum", kind: "drag", target: "waste-drum",
      title: "Move the sealed drum to the accumulation pad",
      cue: "Carry the sealed, labelled drum to the satellite accumulation area, clear of the walkway edge.",
      why: "Between the containment and the hauler, a satellite accumulation area is the only place this drum is allowed to sit — and on this job it sits well back from the walkway edge, because a drum staged at the rail is one bump away from finishing the job the tent was built to stop, straight into the water below.",
      drag: { to: "accumulation-pad", radius: 0.45, missNote: "Staged at the edge isn't staged on the pad — move it clear of the rail, not just clear of the tent." },
    },
    {
      id: "exit-decon", kind: "sequence",
      targets: ["vacuum-suit", "doff-suit", "wash-station"],
      itemNames: { "vacuum-suit": "HEPA-vacuum the suit", "doff-suit": "doff the suit", "wash-station": "wash at the clean-room sink" },
      title: "Decon out through the airlock",
      cue: "HEPA-vacuum the suit, doff it in the dirty room, then wash at the clean-room station — in that order.",
      why: "Three stages coming out undo the three stages that let anyone in, each one stripping something the next step can't. Washing up before the suit is vacuumed and off just rinses lead dust onto bare skin and down a drain, instead of catching it while it's still on the outside of the coveralls where it started.",
      outOfOrderNote: "Vacuum first, then doff, then wash — reaching the sink in a dust-laden suit defeats the two steps that were supposed to come before it.",
    },
    {
      id: "air-sample", kind: "select", target: "air-sample-pump",
      title: "Stop and log the personal air sample",
      cue: "Stop the sampling pump, remove the cassette and log it for the lab.",
      why: "The personal air sample is the number that says what this shift actually put into the air the crew breathed, not what the plan predicted — it has to run for the whole exposure and get logged the moment the shift's containment work is done, because a cassette pulled early or forgotten on the rack answers a question nobody asked.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BLC_ACCENT);

    // -------------------------------------------------------------- plaza + water
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#242a29", base2: "#1c2120" }), { repeat: 4, px: 320 });
    const floor = box(g, 5.0, 0.1, 2.4, 0, -0.05, 1.4, 0x242a29, { rough: 0.92 });
    floor.material = texturedMat(floorTex, { rough: 0.92, color: 0x242a29 });

    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#0f2e3a", base2: "#0a1f29" }), { repeat: 4, px: 256 });
    const water = box(g, 6.4, 0.04, 4.6, 0, -0.65, -1.6, 0x0f2e3a, { rough: 0.2, metal: 0.28, opacity: 0.92, transparent: true, cast: false, receive: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });

    for (let i = -2; i <= 2; i++) box(g, 0.9, 0.5, 0.12, i * 1.0, 0.25, 0.15, 0x545c63, { rough: 0.6, metal: 0.3 });
    box(g, 5.0, 0.06, 0.12, 0, 0.53, 0.15, 0x8fa9c4, { rough: 0.5, metal: 0.3 });

    // -------------------------------------------------------------------- truss
    const TX0 = -1.3, TX1 = 1.3, TZ = -1.4, chordLoY = 0.85, chordHiY = 2.3;
    const truss = group(g, 0, 0, 0);
    box(truss, TX1 - TX0 + 0.1, 0.05, 0.3, (TX0 + TX1) / 2, chordLoY, TZ, 0x8a6a3a, { rough: 0.85 }); // bottom chord, aged paint
    box(truss, TX1 - TX0 + 0.1, 0.05, 0.3, (TX0 + TX1) / 2, chordHiY, TZ, 0x8a6a3a, { rough: 0.85 }); // top chord
    const jointXs = [-1.3, -0.65, 0, 0.65, 1.3];
    for (const jx of jointXs) {
      cyl(truss, 0.025, 0.025, chordHiY - chordLoY, jx, (chordHiY + chordLoY) / 2, TZ, 0x7a5c30, { rough: 0.85, seg: 8 });
    }
    for (let i = 0; i < jointXs.length - 1; i++) {
      const xa = jointXs[i], xb = jointXs[i + 1];
      const diagLen = Math.hypot(xb - xa, chordHiY - chordLoY);
      const fromLo = i % 2 === 0;
      const d = cyl(truss, 0.022, 0.022, diagLen, (xa + xb) / 2, (chordLoY + chordHiY) / 2, TZ, 0x8a6a3a, { rough: 0.85, seg: 8 });
      d.rotation.z = Math.atan2(chordHiY - chordLoY, xb - xa) - Math.PI / 2;
      void fromLo;
    }
    // Walkway deck along the bottom chord, textured, with railings.
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2c343b", base2: "#232a30" }), { repeat: 6, px: 256 });
    const walk = box(g, TX1 - TX0 + 0.4, 0.08, 0.7, (TX0 + TX1) / 2, chordLoY - 0.04, TZ + 0.5, 0x2c343b, { rough: 0.7, metal: 0.35 });
    walk.material = texturedMat(deckTex, { rough: 0.7, metal: 0.35, color: 0x8b929a });
    box(g, TX1 - TX0 + 0.4, 0.5, 0.03, (TX0 + TX1) / 2, chordLoY + 0.25, TZ + 0.83, CITY.hiVis, { rough: 0.5, opacity: 0.9, transparent: true });
    holoTag(truss, "Truss bay, span 4 — this cycle", 0, chordHiY + 0.2, TZ, { css: "#cf8f4a", w: 0.68 });

    // Diagonal climbing hazard — a member off the containment, unrelated to
    // the built walkway access.
    const climbTarget = cyl(truss, 0.022, 0.022, 1.3, -1.0, 1.55, TZ - 0.4, 0x7a5c30, { rough: 0.85, seg: 8 });
    climbTarget.rotation.z = 0.85;
    holoTag(truss, "climb this to the bay?", -1.0, 2.1, TZ - 0.4, { css: "#d2312b", w: 0.5 });
    reg(hits, climbTarget, "climb-truss-diagonal");

    // ------------------------------------------------------------- containment
    const bayCX = 0, bayTZ = TZ;
    const tent = group(g, bayCX, 0, bayTZ);
    const TW = 1.5, TD = 0.9, TH = chordHiY - chordLoY + 0.3;
    const polyMat = { rough: 0.5, opacity: 0.32, transparent: true, cast: false, side: 2 };
    box(tent, TW, TH, 0.02, 0, chordLoY + TH / 2 - 0.1, -TD / 2, 0xe8eef2, polyMat);
    box(tent, 0.02, TH, TD, -TW / 2, chordLoY + TH / 2 - 0.1, 0, 0xe8eef2, polyMat);
    box(tent, 0.02, TH, TD, TW / 2, chordLoY + TH / 2 - 0.1, 0, 0xe8eef2, polyMat);
    box(tent, TW, 0.02, TD, 0, chordLoY + TH - 0.1, 0, 0xe8eef2, { ...polyMat, opacity: 0.24 }); // roof tarp
    // Skirt at the walkway, sealed bottom-first.
    const skirt = box(tent, TW, 0.22, 0.02, 0, chordLoY + 0.11, TD / 2, 0xd8dfe6, { ...polyMat, opacity: 0.42 });
    reg(hits, skirt, "skirt-seal");
    const ductPen = torus(tent, 0.06, 0.012, TW / 2 - 0.1, chordLoY + TH * 0.55, TD / 2, 0xd8dfe6, { rough: 0.5, opacity: 0.6, transparent: true, seg: 8, seg2: 16 });
    reg(hits, ductPen, "penetration-seal");
    const flap = group(tent, -TW / 2 + 0.02, chordLoY + TH * 0.35, TD * 0.15, 0.15);
    box(flap, 0.02, TH * 0.55, 0.55, 0, 0, 0, 0xd8dfe6, { ...polyMat, opacity: 0.4 });
    reg(hits, flap, "flap-seal");
    // The seam that opens on the water side (-x wall's far edge) — the
    // interrupt's own target, distinct from the three above.
    const seam = box(tent, 0.45, 0.02, 0.02, TW / 2 - 0.05, chordLoY + TH * 0.6, 0, 0x8fa9c4, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    const seamPatch = group(tent, TW / 2 - 0.05, chordLoY + TH * 0.6, -0.15, -0.3);
    box(seamPatch, 0.1, 0.05, 0.02, 0, 0, 0, 0xd9a441, { rough: 0.6 });
    holoTag(seamPatch, "Seam tape", 0, 0.1, 0, { css: "#cf8f4a", w: 0.3 });
    reg(hits, seamPatch, "seam-patch");
    // A separate, never-fixed gap — the static hazard.
    const gapHazard = box(tent, 0.02, 0.3, 0.02, TW / 2 - 0.02, chordLoY + TH * 0.3, -TD / 2 + 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tent, "never taped down?", TW / 2 - 0.02, chordLoY + TH * 0.45, -TD / 2 + 0.03, { css: "#d2312b", w: 0.5 });
    reg(hits, gapHazard, "gap-in-poly-hazard");

    // Panel stack + bay frame the panel drags onto.
    const panelStack = group(g, -1.9, 0, 0.9, 0.3);
    box(panelStack, 0.5, 0.6, 0.05, 0, 0.3, 0, 0xe8eef2, { rough: 0.5, opacity: 0.7, transparent: true });
    holoTag(panelStack, "Poly panel", 0, 0.7, 0, { css: "#cf8f4a", w: 0.32 });
    reg(hits, panelStack, "poly-panel");
    const bayFrame = box(tent, TW, TH, 0.02, 0, chordLoY + TH / 2 - 0.1, TD / 2 - 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["truss-bay-frame"] = bayFrame;

    // Manometer at the tent's near post.
    const manoPost = group(tent, TW / 2 - 0.04, chordLoY - 0.04, TD / 2 - 0.05, 0.3);
    const mano = instrument(manoPost, 0, 0.55, 0.02, { idle: "-- \" wc", color: 0x2b3138, w: 0.16, d: 0.14 });
    holoTag(manoPost, "Manometer", 0, 0.76, 0.02, { css: "#cf8f4a", w: 0.32 });
    reg(hits, mano, "manometer");

    // Blast pot, nozzle, grit.
    const pot = group(g, -0.9, 0.85, -0.75, -0.4);
    cyl(pot, 0.16, 0.2, 0.55, 0, 0.28, 0, 0xd8b23a, { rough: 0.6, metal: 0.35 });
    holoTag(pot, "Blast pot", 0, 0.72, 0, { css: "#cf8f4a", w: 0.26 });
    const nozzle = group(tent, 0.15, chordLoY + TH * 0.5, -0.2, -1.2);
    cyl(nozzle, 0.028, 0.04, 0.26, 0, 0, 0, 0x4a5560, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = -Math.PI / 2.3;
    holoTag(nozzle, "Blast nozzle", 0, 0.18, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, nozzle, "blast-nozzle");
    const grit = particles(tent, 20, 0xcfd3d8, { size: 0.026, life: 0.5, additive: false, opacity: 0.45 });
    grit.position.set(0.1, chordLoY + TH * 0.5, -0.1);
    grit.visible = false;

    // Defects on the blasted diagonal, inside the tent.
    const diagBlasted = group(tent, -0.15, chordLoY + TH * 0.42, -0.1);
    const primer = box(diagBlasted, 0.045, 0.045, 0.045, 0, 0.08, 0.05, 0x6a5230, { rough: 0.85 });
    reg(hits, primer, "primer-shadow");
    const pits = group(diagBlasted, 0.15, -0.05, 0.05);
    for (let i = 0; i < 3; i++) cyl(pits, 0.018, 0.014, 0.01, i * 0.05, 0, 0, 0x3d444b, { rough: 1.0, seg: 8 });
    reg(hits, pits, "rust-pit-truss");
    const moisture = slab(diagBlasted, 0.16, 0.006, 0.12, -0.2, -0.12, 0.05, 0xbfe6f5, { radius: 0.008, rough: 0.15, opacity: 0.55, transparent: true, cast: false });
    reg(hits, moisture, "moisture-bead");

    // -------------------------------------------------------- airlock vestibule
    const lock = group(g, 1.55, 0, 0.55, -0.3);
    const stageNames = [["dirty-stage", "Dirty room", 0xb8402f], ["wash-stage", "Wash room", 0xf2c14b], ["clean-stage", "Clean room", 0x59c97b]];
    const stageChambers = [];
    stageNames.forEach(([id, label, col], i) => {
      const cx = i * 0.7;
      const chamber = group(lock, cx, 0, 0);
      box(chamber, 0.02, 1.9, 0.9, -0.32, 0.95, 0, 0xe8eef2, { rough: 0.5, opacity: 0.38, transparent: true, cast: false });
      box(chamber, 0.02, 1.9, 0.9, 0.32, 0.95, 0, 0xe8eef2, { rough: 0.5, opacity: 0.38, transparent: true, cast: false });
      box(chamber, 0.64, 1.9, 0.02, 0, 0.95, -0.45, 0xe8eef2, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
      const doorFlap = box(chamber, 0.6, 1.85, 0.02, 0, 0.9, 0.44, col, { rough: 0.5, opacity: 0.42, transparent: true, cast: false });
      holoTag(chamber, label, 0, 2.0, 0.35, { css: `#${col.toString(16).padStart(6, "0")}`, w: 0.4 });
      void doorFlap;
      stageChambers.push(chamber);
    });
    const vacWand = group(stageChambers[0], -0.1, 0.5, -0.2, 0.6);
    cyl(vacWand, 0.02, 0.024, 0.55, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 10 });
    holoTag(vacWand, "HEPA wand", 0, 0.4, 0, { css: "#8fa9c4", w: 0.28 });
    reg(hits, vacWand, "vacuum-suit");
    const suitHook = group(stageChambers[0], 0.12, 1.4, -0.2);
    box(suitHook, 0.05, 0.05, 0.05, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    box(suitHook, 0.3, 0.46, 0.03, 0, -0.3, 0, 0xd8dfe6, { rough: 0.55, opacity: 0.7, transparent: true });
    holoTag(suitHook, "Suit hook", 0, 0.18, 0, { css: "#8fa9c4", w: 0.26 });
    reg(hits, suitHook, "doff-suit");
    const sink = group(stageChambers[2], 0.1, 0, -0.2);
    box(sink, 0.3, 0.26, 0.22, 0, 0.4, 0, 0xd7dce1, { rough: 0.35, metal: 0.3 });
    holoTag(sink, "Clean-room sink", 0, 0.72, 0, { css: "#59c97b", w: 0.32 });
    reg(hits, sink, "wash-station");

    // ------------------------------------------------------------- respirators
    const rack = group(g, -1.9, 0, -0.2, 0.4);
    box(rack, 0.5, 0.85, 0.24, 0, 0.42, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
    const respGood = group(rack, -0.1, 0.72, 0.15);
    ball(respGood, 0.13, 0, 0, 0, 0xe8eef2, { rough: 0.4, opacity: 0.85, transparent: true });
    const tagGood = decal(respGood, 0.1, 0.06, 0.05, -0.14, 0.02, signFace("FIT: OK", { bg: "#0f1b14", accent: "#59c97b", scale: 0.55 }), { px: 128 });
    holoTag(respGood, "Fit-tested respirator", 0, 0.2, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, respGood, "respirator-good");
    void tagGood;
    const respBad = group(rack, 0.15, 0.72, 0.15);
    ball(respBad, 0.13, 0, 0, 0, 0xe8eef2, { rough: 0.4, opacity: 0.85, transparent: true });
    decal(respBad, 0.1, 0.06, 0.05, -0.14, 0.02, signFace("FIT: EXP.", { bg: "#241010", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    holoTag(respBad, "fit tag a year old?", 0, 0.2, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, respBad, "expired-fit-test-tag");

    // ------------------------------------------------------------- waste bay
    const debris = group(tent, -0.1, chordLoY + 0.05, 0.15, -0.5);
    for (let i = 0; i < 7; i++) ball(debris, 0.018 + (i % 3) * 0.005, (i % 4) * 0.045 - 0.07, 0.01, Math.floor(i / 4) * 0.05, 0x6a5230, { rough: 0.9, seg: 8 });
    const vacHead = group(tent, -0.1, chordLoY + 0.1, 0.28, -0.3);
    box(vacHead, 0.1, 0.035, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(vacHead, "HEPA vacuum", 0, 0.12, 0, { css: "#8fa9c4", w: 0.3 });
    reg(hits, vacHead, "vacuum-wand");

    const drumBay = group(g, 1.9, 0.85, 0.75, -0.2);
    const drumA = cyl(drumBay, 0.2, 0.2, 0.55, 0, 0.28, 0, 0x2f6f4a, { rough: 0.6, metal: 0.35, seg: 18 });
    const drumLabel = decal(drumBay, 0.18, 0.08, 0.21, 0.32, 0, signFace("D008?", { bg: "#241a08", accent: "#cf8f4a", scale: 0.55 }), { px: 128 });
    holoTag(drumBay, "Waste drum, sealed", 0, 0.62, 0, { css: "#cf8f4a", w: 0.4 });
    reg(hits, drumA, "waste-drum");
    reg(hits, drumLabel, "waste-drum-label");

    const drumOpen = group(g, 1.6, 0.85, 1.05, 0.2);
    cyl(drumOpen, 0.2, 0.2, 0.5, 0, 0.25, 0, 0xb8402f, { rough: 0.65, metal: 0.3, seg: 18 });
    holoTag(drumOpen, "open, at the water's edge?", 0, 0.58, 0, { css: "#d2312b", w: 0.62 });
    reg(hits, drumOpen, "open-drum-over-water");

    const pad = group(g, -2.2, 0, 1.7);
    for (let i = -2; i <= 2; i++) box(pad, 0.2, 0.01, 0.05, i * 0.32, 0.008, 0, 0xcf8f4a, { emissive: 0xcf8f4a, ei: 0.5, cast: false });
    holoTag(pad, "Accumulation pad, clear of the walkway", 0, 0.5, 0, { css: "#cf8f4a", w: 0.72 });
    hits["accumulation-pad"] = pad;

    // ---------------------------------------------------------- negative air
    const negair = group(g, 1.7, 0, -0.4, 0.3);
    box(negair, 0.55, 0.6, 0.46, 0, 0.36, 0, 0x4a5560, { rough: 0.6, metal: 0.45 });
    const fanBlades = group(negair, 0, 0.36, 0.24);
    for (let b = 0; b < 4; b++) box(fanBlades, 0.36, 0.07, 0.014, 0, 0, 0, 0x9aa4ad, { rough: 0.6 }).rotation.z = (b * Math.PI) / 4;
    const fanSwitch = group(negair, 0.22, 0.6, 0.1);
    box(fanSwitch, 0.045, 0.15, 0.045, 0, 0, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(negair, "Negative-air unit", 0, 0.82, 0, { css: "#cf8f4a", w: 0.4 });
    reg(hits, fanSwitch, "negair-fan");

    // -------------------------------------------------------- decon-recall + relief
    const relief = standingFigure(g, 1.85, 1.75, { ry: -0.6, cloth: 0xd8dfe6, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(relief, "Relief crew", 0, 2.0, 0, { css: "#cf8f4a", w: 0.36 });
    const reliefHome = relief.position.clone();
    const horn = group(g, -1.4, 0, 1.5, 0.4);
    box(horn, 0.1, 0.05, 0.08, 0, 0.9, 0, 0xd2312b, { rough: 0.5 });
    holoTag(horn, "Decon recall", 0, 1.0, 0, { css: "#cf8f4a", w: 0.36 });
    reg(hits, horn, "decon-recall");

    // ------------------------------------------------------------ paperwork
    const plan = holoPanel(g, 0.7, 0.5, -2.3, 1.5, -0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#cf8f4a"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#f6e6c2";
      ctx.fillText("LEAD COMPLIANCE PLAN — TRUSS BAY 4", w * 0.05, h * 0.14);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; ctx.fillStyle = "#f3e6d0";
      ["COATING: POSITIVE FOR LEAD", "CONTAINMENT: SSPC-QP 2, CLASS 1C", "SURFACE STANDARD: SSPC-SP 10",
        "RESPIRATOR: FIT-TESTED, ANNUAL", "WASTE: RCRA D008 ON REMOVAL", "OSHA 1926.62 SURVEILLANCE CURRENT"]
        .forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.3 + i * 0.115)));
    }, { ry: 0.5, accent: BLC_ACCENT });
    reg(hits, plan, "compliance-plan");

    const medBoard = group(g, -2.5, 0, 0.6, 0.6);
    const medPanel = decal(medBoard, 0.4, 0.54, 0, 1.0, 0,
      paperFace("MEDICAL RECORD", ["Baseline BLL: on file", "Clearance: current", "Next draw: per schedule"], { worn: true }), { px: 256 });
    cyl(medBoard, 0.024, 0.03, 0.96, 0, 0.48, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(medBoard, "Medical record", 0, 1.32, 0, { css: "#8fa9c4", w: 0.36 });
    reg(hits, medPanel, "medical-record");

    const sampleBoard = group(g, -2.5, 0, 1.6, 0.6);
    box(sampleBoard, 0.14, 0.2, 0.08, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const sampleCassette = cyl(sampleBoard, 0.02, 0.02, 0.06, 0.02, 1.02, 0.05, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(sampleBoard, "Personal air sample pump", 0, 1.15, 0, { css: "#cf8f4a", w: 0.5 });
    reg(hits, sampleBoard, "air-sample-pump");
    void sampleCassette;

    barrierPanel(g, -1.0, 2.0, { color: BLC_ACCENT });
    cone(g, 0.5, 2.05, { color: BLC_ACCENT });
    cone(g, -0.3, 2.1, { color: BLC_ACCENT });
    toolChest(g, -1.4, 1.3, { ry: 0.4, color: 0xcf8f4a });
    const watch = standingFigure(g, -0.6, 0.6, { ry: 0.9, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(watch, "Competent person", 0, 1.9, 0, { css: "#59c97b", w: 0.4 });

    // -------------------------------------------------------------- live state
    let venting = false, blasting = false, negOk = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.2, -0.4),
      onStepComplete(step) {
        if (step.id === "build-containment") { panelStack.visible = false; }
        if (step.id === "negair-start") venting = true;
        if (step.id === "manometer") negOk = true;
        if (step.id === "blast") blasting = false;
        if (step.id === "waste-drum") { drumA.position.set(-2.2, 0.85, 1.7); }
      },
      onInterrupt(it) {
        if (it.id === "seam-opens") {
          negOk = false;
          seam.visible = true;
          seam.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, opacity: 0.6, transparent: true, cast: false });
          repaint(mano.userData.screen, signFace("0.00", { bg: "#2a1010", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
          fanBlades.scale.setScalar(0.9);
        }
        if (it.id === "worker-in-coveralls") {
          relief.position.set(reliefHome.x - 0.9, reliefHome.y, reliefHome.z + 0.5);
          relief.rotation.y = 1.4;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "seam-opens") {
          negOk = true;
          seam.visible = false;
          fanBlades.scale.setScalar(1);
        }
        if (it.id === "worker-in-coveralls") {
          relief.position.copy(reliefHome);
          relief.rotation.y = -0.6;
        }
      },
      onHazard(hitId) {
        if (hitId === "gap-in-poly-hazard") grit.visible = true;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (venting) fanBlades.rotation.z += dt * 8;
        blasting = step?.id === "blast";
        grit.visible = blasting || grit.visible;
        if (blasting) grit.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.35, 0.15);
        if (waterTex.offset) {
          waterTex.offset.x = (t * 0.012) % 1;
          waterTex.offset.y = (t * 0.008) % 1;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "manometer" && negOk !== false) {
          repaint(mano.userData.screen, signFace(`-${(gg.t * 0.5).toFixed(2)}`, {
            bg: "#0d1c24", accent: gg.t > 0.32 && gg.t < 0.65 ? "#59c97b" : "#f0645b", fg: "#f6e6c2", scale: 0.5,
          }));
        }
      },
    };
  },
};
