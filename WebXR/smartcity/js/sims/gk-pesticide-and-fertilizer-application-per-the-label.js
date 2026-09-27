import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, texturedMat, grassFace, concreteFace, palette, reg,
} from "../citykit.js";
import { shrubBed } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pesticide & Fertilizer Application VR — Grounds &
// Landscaping.
//
// A grounds crew member mixing and applying a labelled turf product: the
// label and the safety data sheet read before the container is opened, the
// PPE the label calls for actually on, the mixing done over containment and
// away from the drain, the treatment area walked for a pollinator bed, a
// play area and an uncovered pond before the first pass, the area posted,
// the buffer to water marked, and the rate held steady and the wind checked
// the whole time the sprayer runs. No mix ratio, re-entry interval or
// buffer distance is stated as a number here — every one of them is "per
// the label" or "per the SDS", because that is the only place this platform
// is willing to say it is certain of one.

const GKP_ACCENT = 0xc9a13a;
const GKP_PAL = palette("grounds");

export const SIM_GK_PESTICIDE_AND_FERTILIZER_APPLICATION_PER_THE_LABEL = {
  id: "gk-pesticide-and-fertilizer-application-per-the-label",
  index: "gk-04",
  domain: "Grounds & Landscaping",
  trade: "Grounds pesticide and fertilizer applicator — AFSCME parks and grounds crew",
  category: "Grounds & Landscaping",
  district: "open-range",
  weather: "clear",
  certification: "Federal Insecticide, Fungicide, and Rodenticide Act (FIFRA) — the product label as a legal document and EPA's pesticide applicator and worker-protection requirements; OSHA 29 CFR 1910.132 personal protective equipment, 29 CFR 1910.133 eye and face protection, 29 CFR 1910.134 respiratory protection, 29 CFR 1910.138 hand protection and 29 CFR 1910.1200 hazard communication; AFSCME parks and grounds member training",
  name: "Pesticide & Fertilizer Application",
  title: simTitle("Pesticide & Fertilizer Application"),
  tagline: "A labelled turf product mixed and applied the way its own label sets out: PPE the label calls for, mixing over containment away from the drain, the treatment area walked for a pollinator bed and a play area, the buffer to water marked, and the rate and the wind held the whole pass",
  accent: GKP_ACCENT,
  accentCss: "#c9a13a",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "label-followed", name: "Label Followed", note: "Label and SDS read, PPE on, mixing contained, the area walked and posted, and the whole application held to the label's own rate and buffer" },

  supportLine: "your union steward or the parks department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Applicator Trainee", "Label Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "label-read", name: "Label Read First", note: "Never mixed before reading the label and the SDS", test: AWARD.stepClean("read-label") },
      { id: "contained-mix", name: "Contained Mix", note: "Mixed over containment, clear of the drain", test: AWARD.stepClean("mix-setup") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-rate", name: "Steady Rate", note: "Held the mix gauge and the application rate near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-app", name: "Quick Application", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "mix-near-drain": "You mixed the concentrate right beside the storm drain. A spill or a splash at that spot does not need to be large to reach the drain, and once it is in the drain it is no longer this crew's spill to contain — it is whatever the drain feeds, with nobody downstream given any say in it.",
    "spray-toward-pollinator-bed": "You aimed the spray straight at the bed with bees actively working the blooms. A label's restriction on spraying during pollinator activity exists because a direct application is the one exposure a foraging bee cannot avoid, and aiming away from an active bed while it is still blooming is what the label is actually asking for.",
    "remove-respirator-during-mix": "You pulled the respirator off while the concentrate was still open. The respirator the label calls for during mixing is doing its job precisely while the container is open and the vapour or dust concentration is highest — taking it off mid-mix defeats the one control that was actually protecting the airway at the moment it mattered most.",
    "smoke-near-mixing": "That ignition source is right next to open concentrate and mixed product. Several labelled formulations carry a flammability warning for exactly this reason, and an open flame anywhere near an active mixing station is a risk the label does not need a specific incident to have already warned about.",
  },

  lateNotes: {
    "pollinator-activity": "A bed this active with foraging bees is exactly what a label's pollinator-protection language is written to keep an application away from while it is blooming.",
    "buffer-marker": "The buffer to water is marked before the sprayer starts, not estimated by eye once the tank is already open and running.",
  },

  interrupts: [
    {
      id: "wind-picks-up",
      kind: "Drift risk",
      after: "calibrate-spray-wand", delay: 3, seconds: 10,
      alert: "A gust has picked up mid-calibration and the label's own wind limit is now in question for the pass toward the sidewalk.",
      cue: "Shut the sprayer off at the tank valve until the gust passes and the wind is rechecked.",
      target: "tank-shutoff-valve",
      why: "A label's wind limit exists because drift carries product exactly where nobody planned for it to go — a sidewalk, a neighbour's yard, an open window — and shutting off at the tank the moment a gust exceeds what was checked is what keeps a calibration pass from becoming an off-target application nobody can call back.",
      missNote: "The sprayer kept running through the gust. Product carried on wind like that does not stay inside the treatment area the label assumed it would.",
      wrongNote: "Not that — the tank shutoff is what this gust needs, before the calibration pass continues.",
    },
    {
      id: "stroller-into-buffer",
      kind: "Bystander incursion",
      after: "apply-under-rate-signal", delay: 4, seconds: 11,
      alert: "A resident has pushed a stroller past the posted sign and into the buffer zone ahead of the application row.",
      cue: "Stop the spray at the wand's own stop lever before the row reaches the buffer.",
      target: "stop-spray-lever",
      why: "A posted sign only protects someone who has already read it, and a stroller already past the sign is already inside the zone the label's re-entry interval exists to keep clear — stopping the spray immediately is what keeps this from becoming the exposure the posting was meant to prevent.",
      missNote: "The application kept running while the stroller was still in the buffer. A posted zone nobody stops for protects nobody standing in it.",
      wrongNote: "Not that — stop the spray at the wand before anything else about this row matters.",
    },
  ],

  steps: [
    {
      id: "read-label", kind: "select", target: "label-panel",
      title: "Read the product label",
      cue: "Read the label's own rate, PPE, buffer and re-entry instructions before opening the container.",
      why: "The label is a legal document under federal pesticide law, not a suggestion — every rate, every PPE requirement and every buffer distance this application follows comes from that label, read before the container is ever opened, not recalled from memory of the last job.",
    },
    {
      id: "read-sds", kind: "select", target: "sds-binder",
      title: "Check the safety data sheet",
      cue: "Confirm the SDS's first-aid and spill instructions before mixing.",
      why: "The label tells the crew how to apply the product correctly; the SDS is what tells them what to do if something goes wrong — reading both before mixing is what makes sure a spill or an exposure has an answer ready instead of one improvised on the spot.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["chemical-gloves", "respirator", "eye-protection", "coveralls"],
      itemNames: { "chemical-gloves": "chemical-resistant gloves", respirator: "respirator", "eye-protection": "eye protection", coveralls: "coveralls" },
      title: "Put on the PPE the label calls for",
      cue: "Chemical-resistant gloves, respirator, eye protection and coveralls before the container is opened.",
      why: "The label sets out exactly which PPE this product's own handling instructions call for, and putting all of it on before the container is opened is what makes the protection actually cover the moment of highest exposure — pouring and mixing the concentrate — instead of arriving after it.",
    },
    {
      id: "mix-setup", kind: "sequence", anyOrder: true,
      targets: ["containment-tray", "eyewash-station-check", "mixing-area-clear"],
      itemNames: { "containment-tray": "secondary containment tray", "eyewash-station-check": "eyewash station check", "mixing-area-clear": "mixing area cleared of bystanders" },
      title: "Set up the mixing area",
      cue: "Set the containment tray under the mixing station, confirm the eyewash is reachable, and clear the area of anyone not mixing.",
      why: "A containment tray catches a drip or a spill before it reaches the ground, a reachable eyewash is what actually matters in the fifteen seconds after a splash, and clearing the area of anyone not mixing keeps the exposure to the one person trained and suited for it.",
    },
    {
      id: "stage-measuring-cup", kind: "drag", target: "measuring-cup",
      title: "Stage the correct measuring cup",
      cue: "Carry the measuring cup marked for this product to the mixing station.",
      why: "Using the cup marked and dedicated to this product, carried to the mixing station rather than grabbed from a shared shelf, is what keeps a residue from a different chemical out of today's tank mix before the first drop is even measured.",
      drag: { to: "mixing-station-socket", radius: 0.4, missNote: "Not at the mixing station — carry the cup to where the mixing station actually is." },
    },
    {
      id: "meter-concentrate", kind: "turn", target: "metering-valve",
      title: "Meter the concentrate to the label's rate",
      cue: "Turn the metering valve to draw the concentrate at the rate the label sets, watching the cup fill.",
      why: "The metering valve is what turns the label's own rate from a number on a page into an actual measured amount in the cup — turning it slowly while watching the fill is what keeps this measurement accurate instead of a guess stopped early or run over.",
      turn: { turns: 0.4, axis: "z", label: "METERING VALVE" },
    },
    {
      id: "check-mix-gauge", kind: "gauge", target: "mix-gauge",
      title: "Confirm the tank mix concentration",
      cue: "Read the mix gauge and commit only inside the band the label calls for.",
      why: "A tank mixed too weak under-treats and wastes a trip; mixed too strong risks turf damage and uses more product than the label allows — the gauge is what confirms the actual mix is inside the label's own band before a single pass is sprayed.",
      gauge: {
        label: "TANK MIX CONCENTRATION", speed: 0.58, green: [0.42, 0.66],
        readout: (t) => `${Math.round(40 + t * 60)}% of label rate`,
        missNote: "Outside the label's band. Adjust the mix and let the reading settle before committing it.",
      },
    },
    {
      id: "walk-treatment-area", kind: "find", noHint: true,
      targets: ["pollinator-activity", "play-equipment", "uncovered-pond"],
      itemNames: { "pollinator-activity": "the bed with active pollinator activity", "play-equipment": "the play equipment inside the treatment area", "uncovered-pond": "the uncovered ornamental pond" },
      itemNotes: {
        "pollinator-activity": "A bed this active with foraging bees is exactly the kind of pollinator activity a label's own restriction language exists to route an application around.",
        "play-equipment": "Play equipment sitting inside the planned treatment area means the label's re-entry interval has to be posted and enforced right at the spot children actually use.",
        "uncovered-pond": "An uncovered pond inside drift range is exactly the surface water a label's aquatic-toxicity warning is written to keep an application away from.",
      },
      decoyNotes: { "clear-lawn-area": "That stretch of lawn is open turf with nothing nearby that changes the plan. Nothing to flag there." },
      title: "Walk the treatment area before mixing anything",
      cue: "Three things in this area change what the label allows here — find them before the sprayer is even filled.",
      why: "A treatment area that looks like open turf from the truck is not the same thing as an area someone has actually walked, and a pollinator bed, a play structure or an uncovered pond are exactly what a walk-down catches before the label's own restrictions get violated by accident.",
    },
    {
      id: "post-treated-area", kind: "sequence", anyOrder: true,
      targets: ["post-sign-a", "post-sign-b"],
      itemNames: { "post-sign-a": "sign at the near entrance", "post-sign-b": "sign at the far entrance" },
      title: "Post the treated area",
      cue: "Set a re-entry sign at both entrances before the sprayer starts.",
      why: "The label's re-entry interval only protects anyone if it is actually posted where people enter the area — a sign at both entrances is what turns that interval from a line on the label into something a resident or a coworker can actually see and respect.",
    },
    {
      id: "mark-water-buffer", kind: "select", target: "buffer-marker",
      title: "Mark the buffer to water",
      cue: "Set the buffer marker at the distance the label sets from the pond and the storm drain before spraying.",
      why: "The label's buffer distance to water is the one number on it written specifically to keep this product out of a pond or a drain — marking it before the sprayer starts is what turns that distance into a line the applicator can actually see rather than a guess made mid-pass.",
    },
    {
      id: "calibrate-spray-wand", kind: "hold", target: "spray-wand", seconds: 4,
      title: "Calibrate the spray wand",
      cue: "Hold the wand steady over the calibration pad for the full check before applying to the turf.",
      why: "A wand calibrated over a pad rather than the first few feet of actual turf is what confirms the nozzle is delivering the label's rate evenly before any of it lands somewhere that cannot be recalibrated after the fact.",
      holdBreakNote: "Released the wand before the calibration finished. Hold it steady over the pad for the full check, every time.",
    },
    {
      id: "apply-under-rate-signal", kind: "track", target: "rate-indicator", seconds: 8,
      title: "Apply the rows under the rate indicator",
      cue: "Keep the rate indicator steady in band while walking each marked row at an even pace.",
      why: "The label's rate assumes an even walking pace and a steady overlap between passes — a rate indicator that drifts out of band is the sprayer's own way of saying the pace changed, which is exactly what turns a uniform application into stripes of over- and under-treated turf.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "APPLICATION RATE",
        readout: (v) => (v < 0.4 ? "under rate — slow the pace" : v > 0.62 ? "over rate — speed up the pace" : "on the label's rate"),
      },
      holdBreakNote: "The application rate drifted out of band. Adjust the walking pace back to the label's rate before continuing the row.",
    },
    {
      id: "check-wind", kind: "select", target: "wind-flag",
      title: "Check the wind before continuing",
      cue: "Confirm the wind is inside the label's own limit before starting the next row.",
      why: "A label's wind limit is what keeps drift from carrying product off the treatment area, and checking it before every row — not just once at the start of the shift — is what actually catches a gust that picked up since the last check.",
    },
    {
      id: "rinse-and-cleanup", kind: "select", target: "rinse-station",
      title: "Triple-rinse the equipment",
      cue: "Rinse the tank and the measuring cup at the rinse station before storing anything.",
      why: "A tank or a measuring cup put away with residue still in it is the next application's contamination waiting to happen — the rinse station is what actually gets this equipment clean before it is trusted with a different product next time.",
    },
    {
      id: "log-application", kind: "select", target: "closing-log",
      title: "Log the application record",
      cue: "Log the product, the area treated and the date before leaving the site.",
      why: "The application record is what the site's own compliance file and the next crew both read — an application handled cleanly but never logged leaves nothing behind to prove the label was actually followed rather than just intended.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKP_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3f7a3f", b: "#457f45" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const mixPad = box(g, 1.4, 0.02, 1.2, -1.9, 0.15, 1.6, 0xffffff, { rough: 0.9, cast: false });
    mixPad.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth" }), { repeat: 3, px: 384 }),
      { rough: 0.9, metal: 0.02, color: 0xc7cac6 },
    );

    // ------------------------------------------------------------------ label + SDS + paperwork
    const labelStand = holoPanel(g, 0.55, 0.42, -2.4, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9a13a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PRODUCT LABEL", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Rate: per the label", "PPE: per the label", "Buffer: per the label", "Re-entry: per the label"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.36 + i * 0.15)));
    }, { ry: 0.7, accent: GKP_ACCENT });
    reg(hits, labelStand, "label-panel");

    const sdsBinder = group(g, -1.6, 0, 2.1, 0.4);
    box(sdsBinder, 0.24, 0.32, 0.05, 0, 0.16, 0, 0x2b3138, { rough: 0.6 });
    const sdsFace = decal(sdsBinder, 0.2, 0.14, 0, 0.24, 0.026, signFace("SDS", { bg: "#0d1c24", accent: "#c9a13a", scale: 0.5 }), { px: 160 });
    reg(hits, sdsFace, "sds-binder");

    // ------------------------------------------------------------------ mixing station
    const mixStation = group(g, -1.9, 0.14, 1.6, -0.3);
    const containment = box(mixStation, 0.6, 0.05, 0.5, 0, 0.025, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    reg(hits, containment, "containment-tray");
    const jug = cyl(mixStation, 0.1, 0.11, 0.28, -0.1, 0.19, 0, GKP_ACCENT, { rough: 0.5, metal: 0.2, seg: 16 });
    const meteringValve = cyl(mixStation, 0.02, 0.02, 0.06, -0.1, 0.34, 0.05, 0x9aa1a8, { rough: 0.4, metal: 0.7, seg: 10 });
    reg(hits, meteringValve, "metering-valve");
    const cupSocket = group(g, -1.6, 0.14, 1.4);
    hits["mixing-station-socket"] = cupSocket;
    const drainZone = box(g, 0.5, 0.02, 0.4, -2.6, 0.16, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, drainZone, "mix-near-drain");
    const drainMarker = box(g, 0.4, 0.02, 0.4, -2.6, 0.15, 2.0, 0x4a4a44, { rough: 0.7, cast: false });

    const measuringCup = group(g, -2.5, 0, 1.2, 0.4);
    cyl(measuringCup, 0.05, 0.06, 0.12, 0, 0.06, 0, 0xbfeaf7, { rough: 0.3, transparent: true, opacity: 0.7, seg: 14 });
    reg(hits, measuringCup, "measuring-cup");

    const eyewash = group(g, -2.6, 0, 1.9, 0.5);
    cyl(eyewash, 0.03, 0.03, 0.5, 0, 0.25, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6, seg: 10 });
    ball(eyewash, 0.06, 0, 0.52, 0, 0xbfeaf7, { rough: 0.3, transparent: true, opacity: 0.7, seg: 12 });
    reg(hits, eyewash, "eyewash-station-check");
    const mixClearZone = box(g, 0.8, 0.02, 0.8, -1.9, 0.16, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, mixClearZone, "mixing-area-clear");

    // Ignition-source hazard near mixing.
    const cigarette = group(g, -1.5, 0, 1.0, 0.3);
    cyl(cigarette, 0.006, 0.006, 0.08, 0, 0.04, 0, 0xd8c14b, { rough: 0.6, seg: 8 });
    ball(cigarette, 0.006, 0, 0.09, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4, seg: 8 });
    reg(hits, cigarette, "smoke-near-mixing");
    const respiratorHazard = box(g, 0.12, 0.08, 0.06, -1.9, 0.35, 1.7, 0x2b3138, { rough: 0.5 });
    reg(hits, respiratorHazard, "remove-respirator-during-mix");

    // ------------------------------------------------------------------ pollinator bed / play / pond
    const bed = shrubBed(g, 1.8, 0, -1.6, { ry: 0.4 });
    const pollinator = group(g, 1.7, 0.4, -1.6);
    for (let i = 0; i < 4; i++) ball(pollinator, 0.015, (i - 1.5) * 0.15, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, seg: 8 });
    reg(hits, pollinator, "pollinator-activity");
    const sprayHazardZone = box(g, 1.0, 0.5, 0.5, 1.7, 0.4, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sprayHazardZone, "spray-toward-pollinator-bed");

    const swingSet = group(g, 2.3, 0, 0.3, -0.3);
    for (const sx of [-0.4, 0.4]) box(swingSet, 0.05, 1.1, 0.05, sx, 0.55, 0, 0x9a6a3a, { rough: 0.7 });
    box(swingSet, 0.9, 0.05, 0.05, 0, 1.1, 0, 0x9a6a3a, { rough: 0.7 });
    reg(hits, swingSet, "play-equipment");

    const pond = cyl(g, 0.5, 0.5, 0.05, 2.6, 0.16, -0.6, 0x2a5560, { rough: 0.2, metal: 0.1, seg: 20 });
    reg(hits, pond, "uncovered-pond");

    const clearLawn = group(g, 0.3, 0.15, 0.5);
    box(clearLawn, 0.5, 0.008, 0.3, 0, 0, 0, 0x3f7a3f, { rough: 0.85, cast: false });
    reg(hits, clearLawn, "clear-lawn-area");

    // ------------------------------------------------------------------ posting + buffer
    reg(hits, cone(g, 2.5, 1.8, { color: GKP_ACCENT }), "post-sign-a");
    reg(hits, cone(g, -0.6, -2.2, { color: GKP_ACCENT }), "post-sign-b");
    const bufferMarker = box(g, 0.6, 0.02, 0.06, 2.2, 0.16, -0.9, 0xd2312b, { rough: 0.6, cast: false });
    reg(hits, bufferMarker, "buffer-marker");

    // ------------------------------------------------------------------ sprayer
    const sprayer = group(g, 0.4, 0.14, -0.3, -1.2);
    box(sprayer, 0.3, 0.5, 0.28, 0, 0.35, 0, GKP_ACCENT, { rough: 0.5, metal: 0.2 });
    const tankValve = cyl(sprayer, 0.02, 0.02, 0.05, 0, 0.62, 0.1, 0x9aa1a8, { rough: 0.4, metal: 0.7, seg: 10 });
    reg(hits, tankValve, "tank-shutoff-valve");
    const gaugeInst = instrument(sprayer, 0.16, 0.5, 0.06, { ry: -0.4, idle: "-- %", color: GKP_ACCENT });
    reg(hits, gaugeInst, "mix-gauge");
    const wand = group(sprayer, 0.2, 0.2, 0.3, -0.5);
    cyl(wand, 0.012, 0.012, 0.5, 0, 0.25, 0, 0x2b2f34, { rough: 0.4, metal: 0.5, seg: 10 });
    reg(hits, wand, "spray-wand");
    const stopLever = box(wand, 0.03, 0.05, 0.02, 0, 0.05, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, stopLever, "stop-spray-lever");
    holoTag(sprayer, "sprayer", 0, 0.9, 0, { css: "#c9a13a", w: 0.28 });

    const calibrationPad = box(g, 0.4, 0.01, 0.4, 0.4, 0.15, 0.4, 0x2b3138, { rough: 0.6 });

    const rateFlag = group(g, 0.4, 0.14, -0.9, -0.3);
    cyl(rateFlag, 0.01, 0.01, 0.6, 0, 0.3, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(rateFlag, 0.14, 0.09, 0.01, 0, 0.55, 0.02, 0x59c97b, { rough: 0.55 });
    reg(hits, rateFlag, "rate-indicator");

    const windFlag = group(g, 2.4, 0, -2.2, 0);
    cyl(windFlag, 0.01, 0.01, 1.2, 0, 0.6, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    const sock = cyl(windFlag, 0.03, 0.06, 0.4, 0, 1.1, 0.2, 0xf2c14b, { rough: 0.6, seg: 10 });
    sock.rotation.z = Math.PI / 2;
    reg(hits, windFlag, "wind-flag");

    const rinseStation = group(g, 2.6, 0, 1.4, -0.4);
    cyl(rinseStation, 0.15, 0.16, 0.4, 0, 0.2, 0, 0x9aa1a8, { rough: 0.5, metal: 0.5, seg: 16 });
    reg(hits, rinseStation, "rinse-station");

    // ------------------------------------------------------------------ PPE rack
    const ppeRack = group(g, -2.6, 0, -0.6, 0.4);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const gloveProp = box(ppeRack, 0.1, 0.05, 0.02, -0.1, 0.5, 0, 0x59c97b, { rough: 0.7 });
    reg(hits, gloveProp, "chemical-gloves");
    const respiratorProp = group(ppeRack, 0.06, 0.55, 0);
    box(respiratorProp, 0.08, 0.06, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    reg(hits, respiratorProp, "respirator");
    const eyeProp = box(ppeRack, 0.1, 0.04, 0.02, -0.06, 0.58, 0, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");
    const coverallProp = box(ppeRack, 0.16, 0.3, 0.02, 0.1, 0.35, 0, 0xd8c14b, { rough: 0.75 });
    reg(hits, coverallProp, "coveralls");

    const closingLog = group(g, 2.7, 0, -1.9, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("APPLICATION LOG\nOPEN", { bg: "#11181f", accent: "#c9a13a", scale: 0.22 }), { px: 320 });
    holoTag(closingLog, "application log", 0, 1.34, 0, { css: "#c9a13a", w: 0.36 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const applicator = standingFigure(g, 0.9, -0.4, { ry: -2.0, cloth: 0xd8c14b, vest: GKP_ACCENT, helmet: 0xf2f2f2 });
    holoTag(applicator, "applicator", 0, 1.95, 0.15, { css: "#c9a13a", w: 0.3 });

    // Stroller figure, hidden until the bystander-incursion interrupt fires.
    const stroller = standingFigure(g, -1.3, -2.6, { ry: 1.6, cloth: 0x4a5a6a });
    stroller.visible = false;

    const drift = particles(sprayer, 16, 0xe8d99a, { size: 0.02, life: 0.5, additive: false, opacity: 0.2 });
    drift.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "wind-picks-up") { sock.rotation.y = Math.PI / 2; drift.visible = true; }
        if (it.id === "stroller-into-buffer") { stroller.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-picks-up") { sock.rotation.y = 0; drift.visible = false; }
        if (it.id === "stroller-into-buffer") { stroller.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-treatment-area") {
          pollinator.children.forEach((c) => { c.material = mat(0x59c97b, { emissive: 0x2f8f4a, ei: 0.4, rough: 0.4 }); });
        }
        if (step.id === "log-application") {
          repaint(closingLogFace, signFace("APPLICATION LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.22 }));
        }
      },
      onHazard(hitId) { if (hitId === "spray-toward-pollinator-bed") { drift.visible = true; } },

      animate(t, dt, session) {
        applicator.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        sock.rotation.z = Math.PI / 2 + Math.sin(t * 0.5) * 0.15;
        if (stroller.visible) stroller.position.x = -1.3 + (t % 2) * 0.3;
        if (drift.visible) drift.userData.step(dt, new THREE.Vector3(0.3, 0.1, 0), 0.12, 0.12, 0.05);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-mix-gauge") {
          const pct = Math.round(40 + gg.t * 60);
          repaint(gaugeInst.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
