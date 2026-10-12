import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pipeline Crossing Inspection Dive VR — Bay Area Union Edition,
// marine and water pack, on the bay-underwater district.
//
// A submerged pipeline crossing the channel on its concrete cradles: the
// marker buoy's chain down to the crossing sign, a coating holiday exposing
// bare steel, a cradle undermined into a free span with a scour pocket under
// it, a cathodic-protection anode with a loose strap billowing off it, and an
// air-release riser standing up off the line. The learner is the diver, a
// Pile Drivers Local 34 commercial diver on a pipeline integrity survey;
// the supervisor is on the comms, the tender has the umbilical and the
// standby is dressed at the ladder. Depth, gas, bottom time and
// decompression are never written as numbers: they are per the dive plan
// and the tables the supervisor holds.

const UPCI_ACCENT = 0xe8a13c;
const UPCI_CSS = "#e8a13c";

/** The HUD's comms face, repainted when the supervisor reads back. */
function upciCommsFace(lines, band = UPCI_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(20,16,6,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f8ecd8"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#fbf4e6";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_UW_PIPELINE_CROSSING_INSPECTION_DIVE = {
  id: "uw-pipeline-crossing-inspection-dive",
  index: "353",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver on a submerged pipeline crossing integrity survey, with the dive supervisor on the comms, the tender on the umbilical and the standby diver dressed at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 660,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (planning and assessment, hazardous activities nearby) and 29 CFR 1910.422 procedures during the dive (communications, termination of the dive); ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds; pipeline defects handled per the work plan",
  name: "Pipeline Crossing Inspection Dive",
  title: simTitle("Pipeline Crossing Inspection Dive"),
  tagline: "The crossing surveyed cradle to cradle: on the bottom at the marker chain, the crossing sign and buoy chain found, the locator's gain set, the route swum steady while the current pushes off the pipe, the reference cell read for cathodic protection, the coating holiday and the undermined cradle found, a mat rigged under the free span, the defect held for a photo, the marker floated and logged in order, the loose anode strap and the vent riser found and left alone, position held while the umbilical catches the cradle, the hazards reported for the work plan, the survey bag sent up and the crew checked in",
  accent: UPCI_ACCENT,
  accentCss: UPCI_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "span-marked-not-touched", name: "Span Marked, Not Touched", note: "Every defect floated and logged, the free span supported, and never the strap, the riser or the span itself taken as a way through" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Crossing Survey",
    currency: "STATIONING",
    ranks: ["Diver Trainee", "Diver", "Survey Diver", "Lead Survey Diver", "Pipeline Survey Certified"],
    badges: [
      { id: "on-route", name: "On Route", note: "The locator gain set first time before the route was swum", test: AWARD.stepClean("set-locator-gain") },
      { id: "true-potential", name: "True Potential", note: "The reference cell read inside the band first time", test: AWARD.precise(0.7) },
      { id: "clear-of-the-line", name: "Clear Of The Line", note: "Never through the strap, never a hand in the riser, never under the span, never fanning the scour pocket", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-crossing", name: "Clean Crossing", note: "No corrections from the on-bottom report to the check-in", test: AWARD.clean },
      { id: "steady-route", name: "Steady Route", note: "The crossing swum in band the whole way", test: AWARD.unbroken },
      { id: "surveyed-in-time", name: "Surveyed In Time", note: "Survey bag sent up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "swim-thru-strap": "You swam straight through the loose anode strap instead of going round it. The strap is a foot of stainless band that has worked loose from its clamp and billows with the current, and a diver who swims through it instead of round it gives it a whole body — an ankle, a fin, the umbilical — to catch on. It gets logged for the work plan to re-band; it does not get swum through to save a few kicks.",
    "reach-vent-riser": "You put your hand into the open end of the air-release riser to feel whether it was still venting. A riser open to a pressurised line moves air or water hard enough to hold a hand, a glove or loose gear against whatever is downstream of it, and you cannot see from outside whether it is live. The riser is looked at and logged, never reached into, and whether it is live is a question for the line's operator, not a hand at the opening.",
    "duck-under-span": "You swam under the sagging free span instead of going round the cradle. The scour has taken the support out from under this stretch of pipe, and what is holding it up is whatever strength is left in the pipe wall itself between two cradles that no longer both carry it; a diver under that is under an overhead that could settle at any time, with the umbilical trailing out behind into the same gap. The span is surveyed from outside its overhead, never passed beneath.",
    "fan-the-pocket": "You fanned the scour pocket under the span with your fin to see how deep it undercut. Fanning it stirs the loose sediment straight up into the water column right where you are working, and the cloud that comes off a pocket like this does not settle for a long time — it hides the span, the strap and your own tether from you for the rest of the check. The pocket is measured with the probe, not stirred up to be looked at.",
  },

  lateNotes: {
    "ref-cell-probe": "The reference cell is read once the locator's gain is set and the route is being swum — not on a signal still full of noise.",
    "support-mat": "The mat goes under the span once both defects have been found and logged — the cradle's undermining is what is being supported.",
    "survey-bag": "The survey bag goes up once the hazards along the route have been reported — not before the work plan has heard about them.",
  },

  steps: [
    {
      id: "report-on-bottom", kind: "select", target: "pci-comms",
      title: "Report on the bottom at the marker chain",
      cue: "Call the supervisor: on the bottom at the crossing's marker chain, off the stage, feeling good, and starting the survey at the crossing sign.",
      why: "The supervisor at the panel can see your gas and your depth but not the crossing, and the on-bottom report is how the surface learns the dive has really started where the plan says it should. It is also the comms check that proves the voice circuit works before you leave the marker chain, so a lost signal on the far cradle is a real fault and not an unproven line.",
    },
    {
      id: "find-crossing", kind: "find", noHint: true,
      targets: ["crossing-sign", "marker-chain"],
      itemNames: { "crossing-sign": "crossing sign plate on its post", "marker-chain": "marker buoy's chain down to the pipe" },
      itemNotes: {
        "crossing-sign": "A weighted sign plate reading the crossing's name and a no-anchor warning, planted where the pipe first comes under the marker.",
        "marker-chain": "The chain running down from the surface buoy to a shackle on the pipe itself, the crossing's one fixed reference point.",
      },
      title: "Find the crossing sign and the marker chain",
      cue: "At the downline, look for the sign plate and the chain that ties the surface buoy to the pipe — the survey's zero point.",
      why: "Every defect on this survey is going to be reported by its distance and direction from this one fixed point, so finding the sign and the chain before anything else is what lets the whole survey be found again by the next diver. A crossing with no confirmed zero point is a crossing where two divers' reports cannot be lined up against each other.",
    },
    {
      id: "set-locator-gain", kind: "turn", target: "locator-gain-knob",
      title: "Set the pipe locator's gain",
      cue: "Turn the locator's gain knob until the signal off the pipe reads clean and steady, not buried in noise and not pinned at full scale.",
      why: "The locator is what lets you follow the pipe through the murk when the crown is buried or the visibility closes in, and it is only useful set correctly: too little gain and the signal disappears the moment you swing off the crown, too much and every stray bit of steel on the bottom reads the same as the line. Set once at the marker chain, it is what keeps the whole route swum on the pipe instead of on a guess.",
      turn: { turns: 0.7, label: "LOCATOR GAIN", readout: (t) => (t < 0.3 ? "too low — signal lost" : t < 0.85 ? "coming onto a clean signal" : "clean and steady on the line") },
    },
    {
      id: "swim-crossing", kind: "track", target: "pipe-route", seconds: 6,
      title: "Swim the crossing along the pipe",
      cue: "Follow the pipe's crown out from the marker chain at a steady pace, close enough to read the coating, far enough not to kick silt onto it.",
      why: "The whole crossing has to be swum at one steady pace for the survey to mean anything, because a diver who speeds up past the boring stretches and slows down only at defects has decided in advance what counts as worth seeing. A pace that stays close to the crown without fanning it keeps the coating readable the whole way, which a diver who swims too high or too low loses on one side or the other.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "PACE ON THE CROWN", readout: (v) => (v < 0.42 ? "stalled — behind the plan" : v > 0.6 ? "too fast — reading nothing" : "steady on the crown") },
      holdBreakNote: "The pace broke out of band — racing past the pipe or stalled on it. Settle back onto the crown and take it up steadily again.",
    },
    {
      id: "ref-cell-reading", kind: "gauge", target: "ref-cell-probe",
      title: "Read the reference cell against the pipe",
      cue: "Hold the reference cell's tip against clean pipe steel or the test lead and commit the reading once it settles in the protection band.",
      why: "Cathodic protection is what keeps this steel from corroding out from under its coating for the decades the crossing has left in service, and the reference cell is the one instrument that tells you, right now, whether it is actually working here rather than just at the test station on the bank. A reading outside the band is worth more to the pipeline's operator than a coating holiday, because it says the whole stretch is at risk, not just one patch.",
      gauge: { label: "PIPE-TO-SOIL POTENTIAL", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "under-protected" : t <= 0.58 ? "in the protection band" : "over-protected — check the anode") },
    },
    {
      id: "span-defects", kind: "find", noHint: true,
      targets: ["coating-holiday", "undermined-cradle"],
      itemNames: { "coating-holiday": "bare steel patch where the coating has failed", "undermined-cradle": "cradle undermined into a free span" },
      itemNotes: {
        "coating-holiday": "A hand-sized patch where the coating has lifted clean off, leaving bright bare steel with no protection of its own.",
        "undermined-cradle": "A concrete cradle with the sediment scoured out from underneath it, leaving the pipe spanning free between it and the next support.",
      },
      title: "Find the coating holiday and the undermined cradle",
      cue: "Working out from the marker chain: look for bare steel where the coating has failed, and for any cradle the pipe is no longer resting on.",
      why: "A coating holiday is where corrosion starts even with cathodic protection running, because the protection current has to fight harder at bare steel than anywhere else on the line, and a cradle scoured out from under the pipe is what turns a supported line into a free span carrying its own weight. Both change what the pipeline's operator has to plan for, and both are found by eye before anything is measured or marked.",
    },
    {
      id: "support-span", kind: "drag", target: "support-mat",
      title: "Rig a mat under the free span",
      cue: "Bring the support mat from the cradle rack and set it into the scour pocket under the sagging span, snug against the pipe.",
      why: "A free span left unsupported keeps sagging as the current works the scour pocket wider, and a temporary mat set under it now takes some of that load off the pipe wall until a proper repair can be engineered. It goes in snug against the pipe, not jammed under with a shove, because a mat that rocks under the span does less good than no mat at all.",
      drag: { to: "span-support-point", radius: 0.5, missNote: "Not under the span — the mat has to sit snug in the scour pocket, against the pipe, to take any of the load." },
    },
    {
      id: "defect-photo", kind: "hold", target: "photo-scale", seconds: 4,
      title: "Hold the scale bar steady for the defect photo",
      cue: "Lay the scale bar against the coating holiday and hold it still while the camera records the frame the report will use.",
      why: "A defect photo with nothing in it to measure against is a photo of a patch of pipe that could be any size, and the scale bar is what turns it into a measurement the pipeline's engineers can actually use to plan the repair. It has to hold still for the frame, because a scale bar that drifts mid-exposure blurs the one number the photo was for.",
      holdBreakNote: "The scale bar moved before the frame was recorded — hold it flat against the holiday until the camera confirms.",
    },
    {
      id: "tag-then-log", kind: "sequence",
      targets: ["marker-float", "slate-entry"],
      itemNames: { "marker-float": "numbered marker float tied to the cradle", "slate-entry": "defect written on the slate with its distance from the chain" },
      title: "Float the defect, then write it up",
      cue: "Tie a numbered marker float to the cradle beside the defects — not to the pipe itself — then write the number, the distance from the marker chain and what was found on your slate.",
      why: "The float gives the defect a number the next diver or the ROV can find without swimming the whole crossing again, tied to the cradle rather than the pipe so nothing about mounting it touches the coating. The slate entry comes after, in the same order, so the number on the float and the line on the report are never a step out of sync with each other.",
      outOfOrderNote: "Out of order — float the defect first so the slate records the number that is really tied there.",
    },
    {
      id: "route-hazards", kind: "find", noHint: true,
      targets: ["cp-anode-strap", "vent-riser"],
      itemNames: { "cp-anode-strap": "loose strap billowing off the anode", "vent-riser": "air-release riser standing off the line" },
      itemNotes: {
        "cp-anode-strap": "A stainless strap that has worked loose from the anode's clamp, standing out from the pipe and moving with every surge of current.",
        "vent-riser": "A short vertical pipe standing up off the crossing with a loose-fitting cap, plumbed back to the line's air-release valve.",
      },
      title: "Find the hazards along the route before passing them",
      cue: "Ahead on the route: anything that could catch a diver or a tether, and anything with an opening you cannot confirm is safe to be near.",
      why: "The strap and the riser are exactly the kind of hazard a survey exists to report before the next diver, or an ROV with its own tether, comes down this same route — spotted here, with room to go round, they are a note on the slate; missed until the tether is already alongside them, they are the reason the next dive gets fouled.",
    },
    {
      id: "hold-for-readback", kind: "hold", target: "hold-for-readback", seconds: 5,
      title: "Hold position at the cradle for the read-back",
      cue: "Stay still at the undermined cradle with a hand on the pipe while the supervisor reads your position and the defect list back — do not drift off the mark.",
      why: "The supervisor is plotting the survey at the surface from what you read up, and a read-back only means something if you are still at the point it describes when it comes back to you. Holding still here also gives the tender a steady umbilical to feel, which matters more than usual this close to a cradle whose scour pocket is exactly the kind of place a slack loop of umbilical likes to settle into.",
      holdBreakNote: "You drifted off the cradle before the read-back was done — the position would be plotted wrong. Come back to the pipe and hold still again.",
    },
    {
      id: "report-hazards", kind: "select", target: "pci-comms",
      title: "Report the route hazards for the work plan",
      cue: "Tell the supervisor: the loose strap and the vent riser, their positions off the marker chain, left untouched, and that fixing them is for the work plan.",
      why: "The strap and the riser both need a decision only the pipeline's operator and the work plan can make — reband, re-cap, isolate — and that decision only gets made if the report from the bottom is specific enough to plan against. Reporting it now, at the cradle, while you can still describe exactly how the strap moves and how the riser is fitted, is worth more than a line added to the slate after the dive.",
    },
    {
      id: "bag-up", kind: "drag", target: "survey-bag",
      title: "Send the survey bag up on the downline clip",
      cue: "Clip the survey bag with the scale bar and the spare floats onto the downline's travelling clip so it goes up with the stage.",
      why: "Everything that came down for the survey goes back up the same way it came, clipped to the downline, so nothing is left loose at the crossing to fool the next dive into thinking it is a new piece of debris. The floats that stay are the ones marking real defects; everything else goes home clipped, not carried.",
      drag: { to: "downline-clip", radius: 0.5, missNote: "Not on the downline clip — the bag goes up on the downline, not in your hand." },
    },
    {
      id: "check-in", kind: "select", target: "stage-checkin",
      title: "Check in at the stage and leave on the supervisor's call",
      cue: "Back at the stage, clipped on: tell the supervisor how you feel after the survey, the current on the route and the umbilical catching the cradle, and wait for the call to leave the bottom.",
      why: "The ascent is the supervisor's call, run to the tables they hold, and the check-in is how they know you are on the stage, clipped on and well before that call is made. A current that pushed you off the pipe and an umbilical that hung up on a cradle are both worth a real answer here, with the Pile Drivers Local 34 member assistance line behind whatever the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "current-shift-crossing",
      kind: "Current shift pushes off the pipe",
      after: "swim-crossing", delay: 2, seconds: 14,
      alert: "The current has picked up across the crossing and is pushing you off the pipe's crown toward open water.",
      cue: "Grab the pipe-crown handhold and ride the current out rather than fighting to swim back onto the line.",
      target: "pipe-crown-handhold",
      why: "A diver who fights a current head-on over a pipe crown burns gas and loses the fine control the survey needs, while a diver who grabs a fixed handhold on the pipe itself rides the surge out without losing the line entirely. The handhold is there for exactly this, and finding it under pressure is easier when the current has not already carried you past it.",
      missNote: "You kept swimming against the current instead of grabbing on; it carried you off the crown and past the cradle before you found anything to hold.",
      wrongNote: "The pipe-crown handhold — grab it and ride the current out rather than fighting to swim back.",
    },
    {
      id: "umbilical-catches-cradle",
      kind: "Umbilical catches on the cradle",
      after: "hold-for-readback", delay: 2, seconds: 14,
      alert: "Your umbilical has draped over the undermined cradle's edge behind you and the tender is calling that it will not pay out.",
      cue: "Reach back and lift the umbilical clear at the cradle's edge before it draws down tight into the scour pocket.",
      target: "umbilical-clear-point",
      why: "A cradle with a scour pocket under it is exactly the shape that collects a slack loop of umbilical, and once it draws down into the pocket every movement you make afterward pulls it tighter around the cradle's edge. Freeing it now, by hand, from where you already are takes a few seconds; left until the tender cannot pay out any further, it is the standby's dive instead of yours.",
      missNote: "You stayed still and let the tender work it from the surface; the umbilical drew down tight around the cradle's edge and the standby had to be sent down to clear it.",
      wrongNote: "The umbilical, draped over the cradle's edge — lift it clear yourself before it draws down tight.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.4, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb4beac });
    for (const [x, z, r] of [[-2.4, -1.9, 0.2], [2.3, 1.5, 0.16], [0.9, 2.1, 0.12], [-1.3, 2.2, 0.17], [2.6, -2.0, 0.19]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);

    // ------------------------------------------------------- the pipeline and cradles
    const pipeMat = mat(0x6a5a3a, { rough: 0.7, metal: 0.35 });
    const pipe1 = cyl(g, 0.24, 0.24, 2.0, -1.6, 0.5, -0.4, 0xffffff, { seg: 16 });
    pipe1.material = pipeMat; pipe1.rotation.z = Math.PI / 2;
    const pipe2 = cyl(g, 0.24, 0.24, 2.2, 0.5, 0.4, -0.4, 0xffffff, { seg: 16 });
    pipe2.material = pipeMat; pipe2.rotation.z = Math.PI / 2;
    const pipe3 = cyl(g, 0.24, 0.24, 1.6, 2.3, 0.5, -0.4, 0xffffff, { seg: 16 });
    pipe3.material = pipeMat; pipe3.rotation.z = Math.PI / 2;
    const cradleA = group(g, -1.6, 0, -0.4);
    box(cradleA, 0.5, 0.4, 0.6, 0, 0.2, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1 });
    const cradleB = group(g, 1.4, 0, -0.4);
    box(cradleB, 0.5, 0.28, 0.6, 0, 0.14, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1 });
    const cradleC = group(g, 3.1, 0, -0.4);
    box(cradleC, 0.5, 0.4, 0.6, 0, 0.2, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1 });
    reg(hits, cradleB, "undermined-cradle");
    const scourPocket = cyl(g, 0.4, 0.5, 0.06, 1.4, 0.02, -0.4, 0x3a4238, { seg: 20, cast: false });
    const fanHit = box(g, 0.6, 0.3, 0.6, 1.4, 0.15, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fan it to see the depth?", 1.4, 0.55, -0.4, { css: "#d2312b", w: 0.44 });
    reg(hits, fanHit, "fan-the-pocket");
    const underSpanHit = box(g, 1.4, 0.5, 0.6, 0.5, 0.35, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swim under the span?", 0.5, 0.7, -0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, underSpanHit, "duck-under-span");

    // ------------------------------------------------------- marker chain, sign, route
    const buoyChain = group(g, -2.4, 0, -0.9);
    cyl(buoyChain, 0.012, 0.012, 3.4, 0, 1.9, 0, 0xc0c6cc, { rough: 0.5, metal: 0.7, seg: 6 });
    box(buoyChain, 0.4, 0.3, 0.05, 0, 0.1, 0, 0xf06a2b, { rough: 0.6 });
    holoTag(buoyChain, "crossing sign", 0, 0.5, 0, { css: UPCI_CSS, w: 0.3 });
    reg(hits, buoyChain, "crossing-sign");
    const chainHit = box(g, 0.3, 3.2, 0.3, -2.4, 1.6, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "marker chain", -2.4, 3.3, -0.9, { css: UPCI_CSS, w: 0.26 });
    reg(hits, chainHit, "marker-chain");
    const knob = group(g, -2.0, 0.8, -0.9, 0.3);
    cyl(knob, 0.07, 0.07, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    const knobPin = box(knob, 0.008, 0.05, 0.006, 0.02, 0.03, 0.02, UPCI_ACCENT, { rough: 0.5 });
    holoTag(knob, "locator gain", 0, 0.14, 0, { css: UPCI_CSS, w: 0.28 });
    reg(hits, knob, "locator-gain-knob");
    const routeHit = box(g, 5.0, 0.4, 0.5, 0.7, 0.5, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, routeHit, "pipe-route");
    const handhold = group(g, 3.0, 0.75, -0.4);
    torus(handhold, 0.1, 0.014, 0, 0, 0, UPCI_ACCENT, { emissive: UPCI_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(handhold, "pipe crown handhold", 0, 0.16, 0, { css: UPCI_CSS, w: 0.4 });
    reg(hits, handhold, "pipe-crown-handhold");
    const streamers = group(g, 0, 0.6, 0.4);
    for (let i = 0; i < 6; i++) { const s = box(streamers, 1.0, 0.01, 0.03, -1.5 + (i % 3) * 1.4, (i % 3) * 0.4, -0.2 + i * 0.15, 0xb8e0d8, { rough: 0.4, emissive: 0x6aa8a0, ei: 0.5, cast: false }); s.rotation.y = 0.2; }
    streamers.visible = false;

    // ------------------------------------------------------- CP survey: cell, holiday, anode, riser
    const refCell = group(g, -0.6, 0.6, -0.7);
    cyl(refCell, 0.03, 0.03, 0.3, 0, 0, 0, 0x2b8a5a, { rough: 0.6, seg: 10 }).rotation.z = 1.2;
    holoTag(refCell, "reference cell", 0, 0.16, 0, { css: UPCI_CSS, w: 0.32 });
    reg(hits, refCell, "ref-cell-probe");
    const holiday = box(g, 0.12, 0.02, 0.1, -0.9, 0.68, -0.45, 0xd8d0c0, { rough: 0.4, metal: 0.5, emissive: 0x3a3020, ei: 0.3 });
    reg(hits, holiday, "coating-holiday");
    const anode = group(g, 2.1, 0.5, -0.55);
    box(anode, 0.14, 0.1, 0.1, 0, 0, 0, 0x9aa2a8, { rough: 0.6, metal: 0.5 });
    const strap = group(anode, 0.1, 0, 0);
    for (let i = 0; i < 3; i++) torus(strap, 0.06 + i * 0.02, 0.006, 0, i * 0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, cast: false, seg: 4, seg2: 14 }).rotation.set(0.4 * i, 0.5, 0);
    reg(hits, strap, "cp-anode-strap");
    const strapHazardHit = box(g, 0.4, 0.4, 0.4, 2.2, 0.5, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swim through the strap?", 2.2, 0.8, -0.55, { css: "#d2312b", w: 0.4 });
    reg(hits, strapHazardHit, "swim-thru-strap");
    const riser = group(g, 1.9, 0, 0.4);
    cyl(riser, 0.05, 0.06, 0.6, 0, 0.3, 0, 0x4a5048, { rough: 0.7, metal: 0.4, seg: 12 });
    const riserCap = cyl(riser, 0.07, 0.07, 0.06, 0, 0.6, 0, 0x2b3138, { rough: 0.6, seg: 12 });
    void riserCap;
    holoTag(riser, "vent riser", 0, 0.72, 0, { css: UPCI_CSS, w: 0.26 });
    reg(hits, riser, "vent-riser");
    const riserHazardHit = box(g, 0.24, 0.3, 0.24, 1.9, 0.5, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach into the riser?", 1.9, 0.85, 0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, riserHazardHit, "reach-vent-riser");

    // ------------------------------------------------------- support mat, photo scale, float, slate
    const matRack = group(g, -0.7, 0.06, -1.7);
    box(matRack, 0.5, 0.06, 0.4, 0, 0, 0, 0x3a4a3a, { rough: 0.9 });
    holoTag(matRack, "support mat", 0, 0.16, 0, { css: UPCI_CSS, w: 0.26 });
    reg(hits, matRack, "support-mat");
    const spanSupportRing = group(g, 1.4, 0.08, -0.4);
    torus(spanSupportRing, 0.24, 0.012, 0, 0, 0, UPCI_ACCENT, { emissive: UPCI_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    reg(hits, spanSupportRing, "span-support-point");
    const scaleBar = group(g, -1.0, 0.6, -0.6);
    box(scaleBar, 0.24, 0.02, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(scaleBar, "photo scale bar", 0, 0.12, 0, { css: UPCI_CSS, w: 0.3 });
    reg(hits, scaleBar, "photo-scale");
    const float = group(g, 1.3, 0, -0.9);
    cyl(float, 0.006, 0.006, 0.9, 0, 0.45, 0, 0xe8dcb8, { rough: 0.8, seg: 4 });
    ball(float, 0.09, 0, 0.95, 0, 0xf06a2b, { rough: 0.5, seg: 12, seg2: 8 });
    holoTag(float, "marker float 04", 0, 1.15, 0, { css: UPCI_CSS, w: 0.28 });
    reg(hits, float, "marker-float");
    const slate = decal(g, 0.26, 0.2, -0.5, 1.0, -1.1, paperFace("SLATE", ["04 holiday — dist", "Cradle undermined", "Strap · riser noted"], { bg: "#e8eef0", band: UPCI_CSS }), { px: 192 });
    slate.rotation.y = 0.3;
    holoTag(g, "slate — write it up", -0.5, 1.24, -1.1, { css: UPCI_CSS, w: 0.36 });
    reg(hits, slate, "slate-entry");

    // ------------------------------------------------------- hold marker, umbilical, comms, downline, stage
    const holdMark = group(g, 1.4, 0.55, -0.65);
    torus(holdMark, 0.16, 0.01, 0, 0, 0, UPCI_ACCENT, { emissive: UPCI_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(holdMark, "hold here — read-back", 0, 0.2, 0, { css: UPCI_CSS, w: 0.42 });
    reg(hits, holdMark, "hold-for-readback");
    const umbilical = hose(g, [[-3.4, 1.2, 2.2], [-2.4, 0.5, 0.6], [-1.2, 0.2, -0.6], [0.6, 0.3, -0.6], [1.4, 0.55, -0.65]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const umbilicalSnag = hose(g, [[-3.4, 1.2, 2.2], [-2.4, 0.5, 0.6], [-1.2, 0.2, -0.6], [1.4, 0.14, -0.42], [1.4, 0.55, -0.65]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    umbilicalSnag.visible = false;
    const clearPoint = group(g, 1.4, 0.16, -0.42);
    box(clearPoint, 0.08, 0.08, 0.08, 0, 0, 0, UPCI_ACCENT, { rough: 0.5 });
    holoTag(clearPoint, "umbilical clear point", 0, 0.14, 0, { css: UPCI_CSS, w: 0.4 });
    reg(hits, clearPoint, "umbilical-clear-point");
    const comms = holoPanel(g, 0.5, 0.3, -2.6, 1.1, -1.2, upciCommsFace(["Supervisor · topside", "Press to talk"]), { ry: 0.5, accent: UPCI_ACCENT });
    reg(hits, comms, "pci-comms");
    const downline = group(g, -2.6, 0, -1.4);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const dclip = group(downline, 0, 1.1, 0);
    torus(dclip, 0.14, 0.01, 0, 0, 0, UPCI_ACCENT, { emissive: UPCI_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(dclip, "downline clip", 0, 0.2, 0, { css: UPCI_CSS, w: 0.26 });
    reg(hits, dclip, "downline-clip");
    const bag = group(g, -1.9, 0.1, -1.2);
    box(bag, 0.3, 0.2, 0.18, 0, 0.1, 0, 0x2f6f4f, { rough: 0.85 });
    ball(bag, 0.06, 0.08, 0.25, 0, 0xf06a2b, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(bag, "survey bag", 0, 0.42, 0, { css: UPCI_CSS, w: 0.22 });
    reg(hits, bag, "survey-bag");
    const stage = group(g, -3.3, 0, -1.9);
    box(stage, 1.5, 0.05, 1.5, 0, 0.25, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stage, 0.06, 1.6, 0.06, sx * 0.65, 0.8, sz * 0.65, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    torus(stage, 0.3, 0.01, 0, 0.26, 0, UPCI_ACCENT, { emissive: UPCI_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    holoTag(stage, "stage — check in", 0, 0.5, 0, { css: UPCI_CSS, w: 0.3 });
    reg(hits, stage, "stage-checkin");

    // ------------------------------------------------------- silt cloud, fish, scenery
    const cloud = group(g, 1.4, 0.3, -0.4);
    for (let i = 0; i < 6; i++) ball(cloud, 0.6 + (i % 3) * 0.18, -1.2 + i * 0.5, (i % 2) * 0.25, (i % 3) * 0.3 - 0.3, 0x7a806a, { rough: 1, opacity: 0.55, transparent: true, cast: false, seg: 10, seg2: 8 });
    cloud.visible = false;
    const school = group(g, -0.6, 1.8, -2.6);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.3 - 0.45, Math.floor(i / 4) * 0.22, (i % 3) * 0.18);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(g, 0.06 + (i % 3) * 0.02, Math.cos(a) * 2.6, 0.06, -0.4 + Math.sin(a) * 2.6, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    const tyre = torus(g, 0.28, 0.09, -2.6, 0.07, 1.2, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.2;
    for (let i = 0; i < 9; i++) {
      const a = i * 0.71 + 0.3, r = 1.2 + (i % 4) * 0.45;
      const bottle = cyl(g, 0.035, 0.035, 0.2, Math.cos(a) * r, 0.04, -0.4 + Math.sin(a) * r, [0x2f6f4a, 0x6a4a2a, 0xa8c8c0][i % 3], { rough: 0.15, metal: 0.1, opacity: 0.8, transparent: true, seg: 8 });
      bottle.rotation.z = Math.PI / 2; bottle.rotation.y = a;
    }
    for (let i = 0; i < 6; i++) {
      const link = torus(g, 0.05, 0.016, -2.2 + i * 0.12, 0.03, 1.6 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 6; i++) cyl(g, 0.045, 0.03, 0.08, 2.6 + Math.cos(i * 1.1) * 0.4, 0.04, -0.5 + Math.sin(i * 1.1) * 0.4, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });
    const bubbles = group(g, 1.9, 0.5, 0.4);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.02 + (i % 3) * 0.008, (i % 3) * 0.04 - 0.04, i * 0.14, (i % 2) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    for (const [x, z] of [[-1.7, -2.5], [2.9, 1.6], [0.2, -2.4]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.16, 0.18, 0.4, 0, 0.2, 0, 0x4a4234, { rough: 0.95, seg: 12 });
      for (let i = 0; i < 4; i++) { const a = i * 1.6 + x; ball(stub, 0.07, Math.cos(a) * 0.2, 0.12 + (i % 2) * 0.14, Math.sin(a) * 0.2, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    const kelp = group(g, -2.9, 0, 0.6);
    for (let i = 0; i < 7; i++) {
      const frond = box(kelp, 0.03, 0.6 + (i % 3) * 0.22, 0.1, i * 0.1, 0.4, (i % 2) * 0.1, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.63 + 1.2;
      ball(g, 0.05 + (i % 3) * 0.018, 1.6 + Math.cos(a) * 1.0, 0.05, -1.0 + Math.sin(a) * 1.0, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.3, 0.6, 1);
    }
    for (let i = 0; i < 3; i++) box(g, 0.9, 0.03, 0.12, -0.8 - i * 0.05, 0.03, -1.9 + i * 0.2, 0x5a4a34, { rough: 0.95 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.7, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "report-on-bottom") repaint(comms.userData.face, upciCommsFace(["On the bottom — reported", "Survey starting at the chain"]));
        if (step.id === "span-defects") holiday.material = mat(0x8a2a1a, { rough: 0.95, metal: 0.3, emissive: 0x3a1206, ei: 0.4 });
        if (step.id === "support-span") { matRack.position.set(1.4, 0.06, -0.4); }
        if (step.id === "tag-then-log") repaint(slate, paperFace("SLATE", ["04 holiday — dist written", "Cradle undermined", "Strap · riser noted"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "report-hazards") repaint(comms.userData.face, upciCommsFace(["Strap + riser reported", "For the work plan"]));
        if (step.id === "bag-up") bag.position.set(-2.6, 1.0, -1.4);
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "current-shift-crossing") streamers.visible = true;
        if (it.id === "umbilical-catches-cradle") { umbilical.visible = false; umbilicalSnag.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "current-shift-crossing" && it.resolved === "answered") { streamers.visible = false; }
        if (it.id === "umbilical-catches-cradle" && it.resolved === "answered") { umbilical.visible = true; umbilicalSnag.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "set-locator-gain") knobPin.rotation.z = session.turn.amount * Math.PI * 2 - 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "ref-cell-reading") refCell.scale.y = 0.7 + gg.t * 0.6;
        if (step?.id === "swim-crossing" && session.holding) handhold.position.z = -0.4 + Math.sin(t * 2) * 0.02;
        if (cloud.visible) cloud.rotation.y = t * 0.1;
        if (streamers.visible) streamers.position.x = ((t * 0.5) % 1.4) - 0.7;
        school.position.x = -0.6 + Math.sin(t * 0.3) * 0.3;
        void dt; void CITY; void signFace;
      },
    };
  },
};
