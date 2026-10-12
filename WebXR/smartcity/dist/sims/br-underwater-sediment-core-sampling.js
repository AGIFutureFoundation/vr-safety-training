import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace, mudflatFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Underwater Sediment Core Sampling VR — SF Bay Restoration &
// Cleanup, maritime and underwater, pack A, on the bay-underwater district.
//
// On the bottom at a sampling station off an old industrial shoreline, where
// the restoration needs to know what is in the mud before it is dredged or
// capped: the station marker, a sample rack of clear push-core tubes with
// their caps, the coring handle, a submarine cable crossing the site under a
// warning post, a sheet of buried metal where the plan's spot was, the
// downline with its travelling clip and a strobe for the recall, and the
// diver's bailout valve on the harness. The learner is the diver, a Pile
// Drivers Local 34 commercial diver in a helmet sealed to a vulcanised
// drysuit; the supervisor is on the comms, the tender has the umbilical and
// the standby is dressed at the ladder. Depth, gas, bottom time and
// decompression are never written as numbers, and nothing is said about what
// the sediment contains: its handling is per the sampling and work plans.

const BRSC_ACCENT = 0xc9a86a;
const BRSC_CSS = "#c9a86a";

function brscCommsFace(lines, band = BRSC_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(20,16,8,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f6ecd8"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#fbf4e6";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

/** A clear push-core tube with a depth scale, standing or lying. */
function brscTube(parent, x, y, z, filled = 0) {
  const t = group(parent, x, y, z);
  cyl(t, 0.04, 0.04, 0.6, 0, 0.3, 0, 0xdfeef2, { rough: 0.1, metal: 0.1, opacity: 0.45, transparent: true, cast: false, seg: 12 });
  const core = cyl(t, 0.036, 0.036, 0.6, 0, 0.3, 0, 0x3a3226, { rough: 1, seg: 10 });
  core.scale.y = Math.max(0.01, filled);
  core.position.y = 0.3 * Math.max(0.01, filled);
  return { t, core };
}

export const SIM_BR_UNDERWATER_SEDIMENT_CORE_SAMPLING = {
  id: "br-underwater-sediment-core-sampling",
  index: "321",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver taking push cores of Bay sediment for a restoration's sampling plan, with the supervisor on the comms, the tender on the umbilical and the standby diver at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.422 procedures during the dive (communications, termination of the dive), 29 CFR 1910.425 surface-supplied air diving (the reserve breathing gas and the standby) and 29 CFR 1910.420 the employer's safe practices manual; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan; the sediment handled per the sampling and work plans",
  name: "Underwater Sediment Core Sampling",
  title: simTitle("Underwater Sediment Core Sampling"),
  tagline: "On the bottom at the sampling station: on-bottom report, the cable and the buried metal found, the tube carried to a clear spot, the core pushed steady while the gas supply stops, the top capped before the bottom, the core drawn out while the supervisor calls a recall, the recovery read, the core labelled and latched in the rack, yourself checked for contamination, the rack sent up the downline and the core log read up for the chain of custody",
  accent: BRSC_ACCENT,
  accentCss: BRSC_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "clean-core", name: "Clean Core", note: "A full, capped, labelled core from a clear spot, the bailout used without a pause and never a bare hand in the mud" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Core Sampling",
    currency: "CORE",
    ranks: ["Diver Trainee", "Diver", "Sampling Diver", "Lead Sampling Diver", "Core Sampling Certified"],
    badges: [
      { id: "spot-cleared", name: "Spot Cleared", note: "The cable and the buried metal found before the tube came off the rack", test: AWARD.stepClean("clear-spot") },
      { id: "recovery-read", name: "Recovery Read", note: "The core's recovery committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "sealed-and-clear", name: "Sealed And Clear", note: "Never over the cable, never a bare hand, never kneeling in the mud, never a lift bag on the rack", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-sampling", name: "Clean Sampling", note: "No corrections from the on-bottom report to the core log", test: AWARD.clean },
      { id: "steady-push", name: "Steady Push", note: "The core pushed in band the whole way", test: AWARD.unbroken },
      { id: "sampled-in-time", name: "Sampled In Time", note: "Core log read up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "core-over-cable": "You set the tube up over the line of the submarine cable because the silt was softer there. A cable crossing a sampling site can carry power, and a core tube or a probe driven into its armour is at best a damaged cable and at worst a diver in contact with it. The site walk found the warning post for a reason: the core goes where the plan and the cable's clearance allow, not where the mud is easiest.",
    "bare-hand-sediment": "You pulled a glove off to wipe the mud off the tube. The sediment at a restoration site is sampled because it may hold legacy contamination, and a bare hand in it is exposure through the skin and through every cut — the diver wears a sealed helmet and a drysuit so that none of it touches them. The glove stays on; the tube is wiped at the surface in the decon.",
    "kneel-in-sediment": "You went to kneel in the mud to get your weight over the core. Kneeling drives the suit into the sediment, lifts a plume that drifts over the next core spot and over you, and smears the contamination over the knees and the harness that the tender will handle. The push comes from the handle, standing off the bottom, with the diver's weight on the fins.",
    "lift-bag-rack": "You reached for a lift bag to float the loaded rack up faster. A lift bag filled on the bottom accelerates as it rises and its air expands, it can take the rack to the surface uncontrolled — into the hull of the dive boat or back down on the diver — and a snag on the diver's harness takes the diver with it. The rack goes up the downline on its clip, where the tender controls it.",
  },

  lateNotes: {
    "core-push": "The core is pushed once the tube is standing at a clear spot — not before the site walk has found what is under the silt.",
    "core-recovery": "The recovery is read once the core is out and capped at both ends.",
    "core-log": "The core log is read up once the rack has gone up the downline.",
  },

  steps: [
    {
      id: "on-bottom", kind: "select", target: "diver-comms",
      title: "Report on the bottom at the sampling station",
      cue: "Call the supervisor: on the bottom at the station marker, feeling good, the visibility and the current as you find them, and the station number read off the marker.",
      why: "A sediment sample is worth nothing unless it came from the station the sampling plan named, so the report includes the number off the marker as well as how you are and what the water is doing. The supervisor logs it against the plan, the clock starts on the dive, and the report doubles as the comms check on the bottom — the voice circuit proven where the work is before anything is pushed into the mud.",
    },
    {
      id: "clear-spot", kind: "find", noHint: true,
      targets: ["cable-crossing", "buried-metal"],
      itemNames: { "cable-crossing": "submarine cable crossing the site under its warning post", "buried-metal": "sheet of corrugated metal just under the silt at the plan's spot" },
      itemNotes: {
        "cable-crossing": "A warning post stands over an armoured cable half-buried across the site. Whatever it carries, nothing is driven into the bottom along its line.",
        "buried-metal": "A hand fanned lightly over the plan's spot finds the edge of a corrugated sheet just under the silt. A tube pushed there stops on it, and its edge is a cut for a glove.",
      },
      title: "Walk the core site for what is under the silt",
      cue: "Look along the bottom round the plan's spot for crossings, posts and anything buried: cables, pipes, debris.",
      why: "The sampling plan puts the station on a chart, but the chart does not show the cable that was laid since or the sheet of metal a storm dropped there. A tube or a probe driven into a cable is a damaged utility at best and a diver in contact with it at worst, and a tube pushed onto buried debris gives a short, disturbed core that is not a sample of anything. The site is walked first so the core goes where it is safe and meaningful.",
    },
    {
      id: "place-tube", kind: "drag", target: "core-tube",
      title: "Carry a tube from the rack to a clear spot",
      cue: "Take a clean tube from the sample rack, handle fitted, and stand it upright on the marked clear spot inside the station, away from the cable's line and the metal.",
      why: "The tube comes off the rack clean and capped until it is used, so nothing on it but the core reaches the laboratory. It is stood on a spot the site walk cleared and the plan still allows, because moving the station to wherever the mud is soft changes what is being sampled — and the supervisor needs to record the offset if it moves at all.",
      drag: { to: "core-spot", radius: 0.5, missNote: "Not on the clear spot — stand the tube on the marked spot, clear of the cable and the metal." },
    },
    {
      id: "push-core", kind: "track", target: "core-push", seconds: 6,
      title: "Push the core in steadily, keeping it vertical",
      cue: "Push down on the coring handle at a steady rate, the tube vertical, your weight on your fins and off the bottom — no twisting, no bouncing.",
      why: "A push core is a record of the sediment layer by layer, and it only stays a record if the tube goes in steadily and straight: twisting smears the layers into each other, bouncing compacts them and a tube pushed at an angle takes a longer, distorted core. Pushing from the handle with your weight on the fins keeps you off the contaminated bottom and keeps the plume down, and the pace is set by the mud, not by the bottom time.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "CORE PUSH", readout: (v) => (v < 0.42 ? "stalled — the tube is binding" : v > 0.6 ? "too hard — compacting the core" : "steady and vertical") },
      holdBreakNote: "The push went out of band — forcing it or stalling. Ease back and bring it down steadily again.",
    },
    {
      id: "cap-core", kind: "sequence",
      targets: ["cap-top", "cap-bottom"],
      itemNames: { "cap-top": "top cap pressed on the tube before it is moved", "cap-bottom": "bottom dug out beside the tube and capped" },
      title: "Cap the top, then dig out and cap the bottom",
      cue: "Press the top cap on the tube while it is still in the mud, then dig out beside it with a gloved hand and slide the bottom cap on as it comes free.",
      why: "The top cap goes on first because it seals the tube and the suction then holds the core in while the bottom is dug out; a tube lifted open at the top drops its core back onto the bottom on the way out. The bottom cap follows as the tube clears the mud, so the core is sealed at both ends before it has moved more than a hand's width.",
      outOfOrderNote: "Out of order — cap the top first so the suction holds the core in while you free the bottom.",
    },
    {
      id: "draw-core", kind: "hold", target: "draw-core", seconds: 5,
      title: "Draw the capped core out slowly and hold it upright",
      cue: "Rock the capped tube gently and draw it out of the mud slowly, keeping it upright and holding it steady until it is clear and the plume has settled.",
      why: "A core drawn out in a hurry breaks its seal and slumps, and a core laid on its side lets the layers slide; either way the laboratory is sent a jar of mixed mud. Drawing it out slowly and holding it upright until the plume settles keeps the layers as they were in the bottom and lets you see the caps are still seated before the core leaves your hands.",
      holdBreakNote: "You let the core tip before it was clear — the layers would slump. Bring it back upright and draw it out slowly again.",
    },
    {
      id: "read-recovery", kind: "gauge", target: "core-recovery",
      title: "Read the core's recovery against the tube's scale",
      cue: "Hold the tube against the light and commit the reading where the sediment line sits on the tube's scale, against what the sampling plan accepts.",
      why: "The sampling plan says how much of a core has to come back for it to count, because a short core may have missed the layer the restoration is worried about or lost it on the way out. Reading the recovery on the bottom means a short core can be taken again beside the first while you are still at the station, instead of the whole dive being repeated when the laboratory rejects it.",
      gauge: { label: "CORE RECOVERY", speed: 0.68, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "short — resample per the plan" : t <= 0.62 ? "recovery the plan accepts" : "line not settled"), missNote: "Outside the band — hold the tube still and read where the sediment line sits on the scale." },
    },
    {
      id: "label-core", kind: "select", target: "core-label",
      title: "Label the core with the station, number and top",
      cue: "Write the station number, the core number and an arrow to the top on the tube's label with the grease pencil.",
      why: "A core without a label is a tube of mud, and a core without a top arrow is a record read upside down. The label is written on the bottom, as the core is taken, so the station, the number and the orientation are fixed to the tube before it is racked beside others that look exactly like it; the chain of custody begins with this line.",
    },
    {
      id: "latch-rack", kind: "turn", target: "rack-latch",
      title: "Latch the core upright in the sample rack",
      cue: "Stand the core in its slot in the sample rack and turn the latch down over it until it is clamped.",
      why: "The rack keeps the cores upright and apart on the way to the surface, and the latch keeps them in it when the rack swings on the downline. A core that falls out of its slot on the ascent is a lost sample, and one that travels on its side has slumped by the time it reaches the deck — so each one is latched as it is racked, not all of them at the end.",
      turn: { turns: 0.5, label: "RACK LATCH", readout: (t) => (t < 0.3 ? "open — core loose" : t < 0.9 ? "closing over the core" : "latched upright") },
    },
    {
      id: "self-check", kind: "find", noHint: true,
      targets: ["glove-tear", "neck-dam-mud"],
      itemNames: { "glove-tear": "split in the outer glove at the thumb", "neck-dam-mud": "mud packed round the helmet's neck dam and the umbilical at the harness" },
      itemNotes: {
        "glove-tear": "The outer glove has split at the thumb where it caught the edge of the buried sheet; the inner glove is still whole, but the tear lets sediment in against it.",
        "neck-dam-mud": "Mud from the dig has packed round the neck dam and the umbilical where it clips to the harness — the first place the tender's hands and the decon brush will meet it.",
      },
      title: "Check yourself for contamination before you leave the site",
      cue: "Look over your gloves, your suit, the helmet's neck dam and the umbilical at the harness for tears and for mud carried on them.",
      why: "What comes up on the diver comes aboard, and the tender and the decon crew need to know where it is before they touch it. A torn glove is reported so the supervisor knows the diver's skin may have been exposed, and mud packed round the neck dam and the harness is where contamination reaches the hands that help the diver undress. The check is made on the bottom, while it can still be rinsed off in the water column on the way up.",
    },
    {
      id: "rack-up", kind: "drag", target: "sample-rack",
      title: "Send the rack up on the downline clip",
      cue: "Clip the latched sample rack onto the downline's travelling clip and signal the tender to take it up.",
      why: "The rack goes up the downline because the tender can control it there: steady, upright and clear of the umbilical, arriving where the decon crew is waiting for it. Carried by hand it rides with the diver on the ascent and turns every stop into a juggling act; floated on a bag it goes where the bag decides. The downline is the one road to the surface that nobody has to guess about.",
      drag: { to: "downline-clip", radius: 0.5, missNote: "Not on the downline clip — the rack goes up the downline where the tender controls it." },
    },
    {
      id: "core-log", kind: "select", target: "core-log",
      title: "Read the core log up for the chain of custody",
      cue: "Read your slate to the supervisor: station, core numbers, the recovery of each, the spot's offset from the plan, the cable and the metal, the torn glove, the bailout and the recall.",
      why: "The supervisor starts the chain of custody form from what you read up: which core came from which spot at what time, and how much of it came back. The laboratory, the regulators and the restoration's engineers will all rely on that record, so it is read from the slate on the bottom, where anything unclear can still be checked. The bailout and the recall go in the dive log beside it.",
    },
    {
      id: "stage-checkin", kind: "select", target: "stage-checkin",
      title: "Check in at the stage and leave on the supervisor's call",
      cue: "At the stage, clipped on: tell the supervisor how you feel after the bailout and the recall, and that the torn glove needs looking at in the decon, then wait for the call.",
      why: "The ascent is the supervisor's call, and the check-in tells them you are on the stage and well — and that the decon crew should look at your hand when the glove comes off. Going onto bailout is a frightening moment even when it works exactly as trained, and saying so at the stage is part of the dive; the Pile Drivers Local 34 member assistance line is there for what the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "supply-stops",
      kind: "Primary gas supply lost",
      after: "push-core", delay: 2, seconds: 12,
      alert: "Your next breath does not come — the helmet's regulator gives nothing on the inhale and the supervisor's voice says the primary has dropped.",
      cue: "Open your bailout valve on the harness, tell the supervisor you are on bailout, and leave the core.",
      target: "bailout-valve",
      why: "The bailout bottle is there for the moment the surface supply stops, and it is opened by feel, on the harness, without thinking — the diver's hand has found that valve on every pre-dive check. Once on bailout the diver tells the supervisor, leaves the work where it is and heads for the downline while the supervisor switches the panel to the secondary; 29 CFR 1910.425 puts that reserve gas and the standby at the station for exactly this.",
      missNote: "You kept pushing the core on an empty breath; by the time you reached for the bailout you were short of gas and the supervisor had already sent the standby down the downline.",
      wrongNote: "The bailout valve on your harness — gas first, then the supervisor, then the downline.",
    },
    {
      id: "recall",
      kind: "Supervisor recalls the diver",
      after: "draw-core", delay: 2, seconds: 14,
      alert: "The strobe on the downline is flashing and the supervisor is calling you back: fog has come in over the site and a vessel is inbound — leave the work and come to the downline.",
      cue: "Leave the rack where it is and get a hand on the downline, then tell the supervisor you are on it.",
      target: "downline-hand",
      why: "29 CFR 1910.422 has the dive terminated when the supervisor calls it, and a recall is not a request to finish the core first: the conditions at the surface that made the call are ones the diver cannot see. Getting a hand on the downline puts you where the surface expects you, ready to come up or to wait out the vessel, and the samples can be recovered on the next dive.",
      missNote: "You kept drawing the core out and racking it while the strobe flashed; the supervisor, with a vessel inbound in the fog, spent those minutes not knowing where on the bottom you were.",
      wrongNote: "The downline — a recall means a hand on the downline now, not after the core.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#2e2a22", base2: "#26231d" }), { px: 256, repeat: 3 });
    const pad = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.6, 0xffffff, { seg: 28, cast: false });
    pad.material = texturedMat(mudTex, { rough: 1, metal: 0, color: 0xa8a090 });
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 2 });
    const bank = cyl(g, 1.0, 1.3, 0.14, -2.3, 0.05, -1.8, 0xffffff, { seg: 20, cast: false });
    bank.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb4beac });

    // ------------------------------------------------------- station marker, cable, buried metal
    const marker = group(g, -0.4, 0, -0.4);
    cyl(marker, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    decal(marker, 0.16, 0.1, 0, 0.95, 0.02, paperFace("SS-14", ["station"], { bg: "#f6ecd8", band: "#b8702a" }), { px: 96 });
    holoTag(marker, "station marker SS-14", 0, 1.15, 0, { css: BRSC_CSS, w: 0.36 });
    const cable = group(g, 1.4, 0, -0.6, 0.9);
    const cableBody = cyl(cable, 0.05, 0.05, 4.2, 0, 0.05, 0, 0x1b1e22, { rough: 0.7, seg: 10 });
    cableBody.rotation.x = Math.PI / 2;
    const post = group(cable, 0.3, 0, 0.6);
    cyl(post, 0.03, 0.03, 0.9, 0, 0.45, 0, 0xe8b02e, { rough: 0.5, seg: 8 });
    decal(post, 0.18, 0.12, 0, 0.8, 0.035, paperFace("CABLE", ["no anchoring", "no digging"], { bg: "#ffd100", band: "#000000" }), { px: 96 });
    reg(hits, post, "cable-crossing");
    const overCable = box(cable, 0.5, 0.4, 0.6, 0, 0.3, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cable, "core here — softer silt?", 0, 0.62, -0.5, { css: "#d2312b", w: 0.46 });
    reg(hits, overCable, "core-over-cable");
    const sheet = group(g, 0.2, 0.06, 0.25, 0.4);
    for (let i = 0; i < 5; i++) box(sheet, 0.1, 0.02, 0.6, -0.2 + i * 0.1, (i % 2) * 0.02, 0, 0x8a8f92, { rough: 0.5, metal: 0.6 });
    reg(hits, sheet, "buried-metal");

    // ------------------------------------------------------- core spot, tube, handle
    const spot = group(g, -0.9, 0.05, 0.3);
    const spotRing = torus(spot, 0.18, 0.01, 0, 0, 0, BRSC_ACCENT, { emissive: BRSC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    spotRing.rotation.x = Math.PI / 2;
    holoTag(spot, "clear spot", 0, 0.2, 0, { css: BRSC_CSS, w: 0.2 });
    reg(hits, spot, "core-spot");
    const rack = group(g, -1.9, 0, 1.0, 0.3);
    box(rack, 0.6, 0.06, 0.24, 0, 0.1, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(rack, 0.6, 0.04, 0.24, 0, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const x of [-0.28, 0.28]) box(rack, 0.03, 0.5, 0.03, x, 0.3, 0.1, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const racked = [brscTube(rack, -0.15, 0.13, 0), brscTube(rack, 0.15, 0.13, 0)];
    const latch = group(rack, 0, 0.56, 0.13);
    const latchBar = box(latch, 0.5, 0.025, 0.025, 0, 0, 0, 0xe8b02e, { rough: 0.5 });
    latchBar.rotation.z = 0.8;
    holoTag(latch, "rack latch", 0, 0.14, 0, { css: BRSC_CSS, w: 0.2 });
    reg(hits, latch, "rack-latch");
    holoTag(rack, "sample rack", 0, 0.9, 0, { css: BRSC_CSS, w: 0.22 });
    reg(hits, rack, "sample-rack");
    const tubeG = group(g, -1.45, 0.13, 1.25);
    const tube = brscTube(tubeG, 0, 0, 0, 0);
    const handle = box(tubeG, 0.3, 0.03, 0.03, 0, 0.64, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(tubeG, "clean core tube", 0, 0.82, 0, { css: BRSC_CSS, w: 0.28 });
    reg(hits, tubeG, "core-tube");
    const pushMark = group(g, -0.9, 1.0, 0.55);
    for (let i = 0; i < 3; i++) box(pushMark, 0.012, 0.1, 0.012, (i - 1) * 0.06, -i * 0.06, 0, BRSC_ACCENT, { emissive: BRSC_ACCENT, ei: 1.4, rough: 0.4, cast: false });
    holoTag(pushMark, "push steady", 0, 0.12, 0, { css: BRSC_CSS, w: 0.22 });
    reg(hits, pushMark, "core-push");
    const capTop = group(g, -0.6, 0.85, 0.5);
    cyl(capTop, 0.05, 0.05, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(capTop, "top cap", 0, 0.1, 0, { css: BRSC_CSS, w: 0.16 });
    reg(hits, capTop, "cap-top");
    const capBottom = group(g, -1.2, 0.25, 0.65);
    cyl(capBottom, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b5aa8, { rough: 0.5, seg: 12 });
    holoTag(capBottom, "bottom cap", 0, 0.1, 0, { css: BRSC_CSS, w: 0.2 });
    reg(hits, capBottom, "cap-bottom");
    const drawMark = group(g, -0.9, 1.25, 0.3);
    const drawRing = torus(drawMark, 0.12, 0.008, 0, 0, 0, BRSC_ACCENT, { emissive: BRSC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    void drawRing;
    holoTag(drawMark, "draw it out — upright", 0, 0.16, 0, { css: BRSC_CSS, w: 0.38 });
    reg(hits, drawMark, "draw-core");
    const scale = group(g, -0.45, 1.1, 0.95, 0.4);
    for (let i = 0; i < 6; i++) box(scale, 0.02, 0.05, 0.01, 0, -0.125 + i * 0.05, 0, i % 2 ? 0x1b1e22 : 0xf1f3f4, { rough: 0.5 });
    const scaleMark = box(scale, 0.06, 0.008, 0.012, 0, 0, 0.01, 0xd2312b, { rough: 0.4 });
    holoTag(scale, "recovery scale", 0, 0.2, 0, { css: BRSC_CSS, w: 0.28 });
    reg(hits, scale, "core-recovery");
    const label = decal(g, 0.12, 0.1, -0.2, 1.0, 1.05, paperFace("SS-14", ["core __", "TOP ↑"], { bg: "#f6f2e6", band: BRSC_CSS }), { px: 96 });
    label.rotation.y = 0.2;
    holoTag(g, "core label", -0.2, 1.12, 1.05, { css: BRSC_CSS, w: 0.2 });
    reg(hits, label, "core-label");
    const kneelHit = box(g, 0.5, 0.3, 0.5, -1.0, 0.2, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "kneel in the mud to push?", -1.0, 0.45, -0.35, { css: "#d2312b", w: 0.46 });
    reg(hits, kneelHit, "kneel-in-sediment");

    // ------------------------------------------------------- the diver's kit: bailout, gloves, harness
    const bail = group(g, 0.55, 1.0, 1.35, -0.3);
    cyl(bail, 0.07, 0.07, 0.36, 0, 0, 0, 0xd8dde2, { rough: 0.4, metal: 0.5, seg: 14 });
    const bailKnob = group(bail, 0, 0.22, 0);
    cyl(bailKnob, 0.03, 0.03, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 12 });
    const bailPointer = box(bailKnob, 0.008, 0.012, 0.04, 0, 0.02, 0.01, 0xf2c14b, { rough: 0.5 });
    holoTag(bail, "bailout valve", 0, 0.34, 0, { css: BRSC_CSS, w: 0.26 });
    reg(hits, bail, "bailout-valve");
    const glove = group(g, 0.1, 0.9, 1.45);
    box(glove, 0.1, 0.05, 0.14, 0, 0, 0, 0x1b1e22, { rough: 0.7 });
    const tear = box(glove, 0.03, 0.055, 0.03, 0.04, 0.005, 0.04, 0xc05a2a, { rough: 0.8, emissive: 0x5a1a06, ei: 0.4 });
    holoTag(glove, "your glove", 0, 0.1, 0, { css: BRSC_CSS, w: 0.18 });
    reg(hits, tear, "glove-tear");
    const bareHit = box(g, 0.3, 0.25, 0.25, 0.1, 0.75, 1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "glove off to wipe it?", 0.1, 0.62, 1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, bareHit, "bare-hand-sediment");
    const neck = group(g, 1.0, 1.25, 1.25);
    torus(neck, 0.12, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.7, seg: 8, seg2: 18 }).rotation.x = Math.PI / 2;
    const mud = ball(neck, 0.05, 0.08, -0.02, 0.06, 0x3a3226, { rough: 1, seg: 8, seg2: 6 });
    holoTag(neck, "neck dam and harness", 0, 0.16, 0, { css: BRSC_CSS, w: 0.38 });
    reg(hits, mud, "neck-dam-mud");
    const liftBag = group(g, 1.9, 0, 0.9);
    const bagBody = ball(liftBag, 0.2, 0, 0.25, 0, 0xf2a03d, { rough: 0.6, seg: 12, seg2: 8 });
    bagBody.scale.set(1, 0.6, 1);
    holoTag(liftBag, "lift bag on the rack?", 0, 0.52, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, liftBag, "lift-bag-rack");

    // ------------------------------------------------------- HUD: comms, team, core log
    const comms = holoPanel(g, 0.5, 0.3, 1.65, 1.6, 0.9, brscCommsFace(["Supervisor · topside", "Press to talk"]), { ry: -0.6, accent: BRSC_ACCENT });
    reg(hits, comms, "diver-comms");
    holoPanel(g, 0.44, 0.26, -1.75, 1.6, 0.4, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,8,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor on comms", "Tender on umbilical", "Standby dressed at ladder"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { ry: 0.6, accent: 0x59c97b });
    const coreLog = decal(g, 0.28, 0.22, 1.35, 1.0, 1.5, paperFace("CORE LOG", ["SS-14 core 1: ____", "Offset from plan: ____", "Cable · metal · glove"], { bg: "#f3efe4", band: BRSC_CSS }), { px: 192 });
    coreLog.rotation.y = -0.35;
    holoTag(g, "core log slate", 1.35, 1.2, 1.5, { css: BRSC_CSS, w: 0.28 });
    reg(hits, coreLog, "core-log");

    // ------------------------------------------------------- downline, strobe, stage, umbilical
    const downline = group(g, -2.1, 0, 2.0);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const strobe = ball(downline, 0.05, 0.05, 1.8, 0, 0xeaf6fb, { rough: 0.3, emissive: 0x4a5a60, ei: 0.3, seg: 10, seg2: 8 });
    const clip = group(downline, 0, 1.1, 0);
    const clipRing = torus(clip, 0.14, 0.01, 0, 0, 0, BRSC_ACCENT, { emissive: BRSC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    clipRing.rotation.x = Math.PI / 2;
    holoTag(clip, "downline clip", 0, 0.2, 0, { css: BRSC_CSS, w: 0.26 });
    reg(hits, clip, "downline-clip");
    const handHold = group(downline, 0, 0.6, 0.02);
    box(handHold, 0.08, 0.08, 0.08, 0, 0, 0, 0xe8dcb8, { rough: 0.8 });
    holoTag(handHold, "hand on the downline", 0.1, 0.12, 0.05, { css: BRSC_CSS, w: 0.4 });
    reg(hits, handHold, "downline-hand");
    hose(g, [[-3.6, 1.2, 2.5], [-2.8, 0.25, 2.0], [-1.4, 0.2, 1.6], [-0.2, 0.3, 1.4], [0.3, 0.9, 1.3]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const stageCheck = group(g, -3.4, 1.4, 2.1);
    torus(stageCheck, 0.2, 0.01, 0, 0, 0, BRSC_ACCENT, { emissive: BRSC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    holoTag(stageCheck, "stage — check in", 0, 0.3, 0, { css: BRSC_CSS, w: 0.3 });
    reg(hits, stageCheck, "stage-checkin");

    // ------------------------------------------------------- scenery, bubbles
    const bubbles = group(g, 0.5, 1.5, 1.2);
    for (let i = 0; i < 5; i++) ball(bubbles, 0.02 + (i % 2) * 0.01, (i % 2) * 0.03, i * 0.18, 0, 0xdff4f6, { rough: 0.1, opacity: 0.6, transparent: true, cast: false, seg: 8, seg2: 6 });
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9;
      ball(g, 0.06 + (i % 3) * 0.02, 2.2 + Math.cos(a) * 0.5, 0.05, -1.8 + Math.sin(a) * 0.5, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    for (let i = 0; i < 4; i++) cyl(g, 0.02, 0.01, 0.35, -2.6 + i * 0.25, 0.18, -0.9 + (i % 2) * 0.2, 0x5a7a3a, { rough: 0.9, seg: 5 });
    const crab = group(g, 1.1, 0.04, -1.6);
    ball(crab, 0.07, 0, 0, 0, 0xb8502a, { rough: 0.7, seg: 8, seg2: 6 }).scale.set(1.3, 0.5, 1);

    // ------------------------------------------------------- the neighbouring stations and the bottom's life
    // The next stations on the sampling grid stand off in the murk with their
    // own markers; worm tubes, shell hash and burrows stipple the mud, and an
    // old timber and a pile stub lie where a wharf once stood.
    for (const [x, z, n] of [[2.4, -2.2, "SS-13"], [-2.9, -2.6, "SS-15"], [2.8, 1.9, "SS-16"]]) {
      const m = group(g, x, 0, z);
      cyl(m, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
      box(m, 0.14, 0.08, 0.01, 0, 0.86, 0.02, 0xf6ecd8, { rough: 0.7 });
      holoTag(m, n, 0, 1.02, 0, { css: BRSC_CSS, w: 0.16 });
    }
    for (let i = 0; i < 14; i++) {
      const a = i * 0.83, r = 0.9 + (i % 5) * 0.4;
      cyl(g, 0.008, 0.006, 0.06 + (i % 3) * 0.03, Math.cos(a) * r, 0.1, -0.6 + Math.sin(a) * r, 0xc8b89a, { rough: 0.9, seg: 5 });
    }
    for (let i = 0; i < 10; i++) {
      const a = i * 1.37 + 0.4, r = 0.7 + (i % 4) * 0.55;
      const shell = ball(g, 0.03, Math.cos(a) * r, 0.08, -0.6 + Math.sin(a) * r, [0xe8e2d0, 0x6a6a72, 0xd8c8b0][i % 3], { rough: 0.6, seg: 6, seg2: 4 });
      shell.scale.set(1.3, 0.35, 1);
    }
    for (let i = 0; i < 6; i++) torus(g, 0.03, 0.008, -1.6 + i * 0.45, 0.085, -1.2 + (i % 2) * 0.5, 0x1e1a14, { rough: 1, seg: 4, seg2: 10 }).rotation.x = Math.PI / 2;
    const timber = box(g, 1.8, 0.16, 0.22, 1.9, 0.1, -2.9, 0x4a3a28, { rough: 0.95 });
    timber.rotation.y = 0.5;
    const stub = group(g, -3.2, 0, -0.4);
    cyl(stub, 0.26, 0.28, 0.7, 0, 0.35, 0, 0x4a4234, { rough: 0.95, seg: 14 });
    cyl(stub, 0.31, 0.33, 0.2, 0, 0.25, 0, 0x56613f, { rough: 1, seg: 14 });
    for (let i = 0; i < 4; i++) { const a = i * 1.6; ball(stub, 0.07, Math.cos(a) * 0.28, 0.15 + (i % 2) * 0.18, Math.sin(a) * 0.28, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    // A crate of spare tubes and caps lowered with the rack, and the rocks of an old riprap toe.
    const crate = group(g, 1.3, 0, 1.9, -0.3);
    box(crate, 0.5, 0.04, 0.5, 0, 0.02, 0, 0x2f4f6f, { rough: 0.8 });
    for (const [x, z] of [[-0.24, 0], [0.24, 0], [0, -0.24], [0, 0.24]]) box(crate, x ? 0.02 : 0.5, 0.2, x ? 0.5 : 0.02, x, 0.12, z, 0x2f4f6f, { rough: 0.8 });
    for (let i = 0; i < 4; i++) { const sp = brscTube(crate, -0.15 + i * 0.1, 0.05, 0, 0); sp.t.rotation.z = Math.PI / 2; sp.t.position.set(-0.18, 0.08 + (i % 2) * 0.06, -0.15 + i * 0.1); }
    for (let i = 0; i < 6; i++) cyl(crate, 0.045, 0.045, 0.03, -0.15 + i * 0.06, 0.22, 0.18, i % 2 ? 0xd2312b : 0x2b5aa8, { rough: 0.5, seg: 10 });
    for (let i = 0; i < 5; i++) ball(g, 0.18 + (i % 3) * 0.06, -2.9 + i * 0.35, 0.08, -1.9 - (i % 2) * 0.3, 0x5a5a52, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.2, 0.6, 1);
    const school = group(g, 0.8, 2.0, -2.4);
    for (let i = 0; i < 6; i++) ball(school, 0.05, (i % 3) * 0.3 - 0.3, Math.floor(i / 3) * 0.22, (i % 2) * 0.2, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 0.7, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "on-bottom") repaint(comms.userData.face, brscCommsFace(["On the bottom at SS-14", "Coring when clear"]));
        if (step.id === "place-tube") tubeG.position.set(-0.9, 0.05, 0.3);
        if (step.id === "push-core") { tubeG.position.y = -0.25; tube.core.scale.y = 0.85; tube.core.position.y = 0.26; }
        if (step.id === "cap-core") { capTop.position.set(-0.9, 0.42, 0.3); capBottom.visible = false; }
        if (step.id === "draw-core") { tubeG.position.set(-0.9, 0.35, 0.3); capTop.position.set(-0.9, 1.02, 0.3); }
        if (step.id === "read-recovery") scaleMark.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "label-core") repaint(label, paperFace("SS-14", ["core 1", "TOP ↑"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "latch-rack") { tubeG.position.set(-1.9, 0.13, 1.0); capTop.visible = false; latchBar.rotation.z = 0; }
        if (step.id === "rack-up") rack.position.set(-2.1, 1.0, 2.0);
        if (step.id === "core-log") repaint(coreLog, paperFace("CORE LOG — READ UP", ["SS-14 core 1: accepted", "Offset logged", "Glove torn — decon to check"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "supply-stops") { bubbles.visible = false; repaint(comms.userData.face, brscCommsFace(["PRIMARY LOST", "Go to bailout"], "#d2312b")); }
        if (it.id === "recall") strobe.material = mat(0xffffff, { emissive: 0xffffff, ei: 2.0 });
      },
      onInterruptEnd(it) {
        if (it.id === "supply-stops" && it.resolved === "answered") { bubbles.visible = true; bailPointer.rotation.y = Math.PI / 2; repaint(comms.userData.face, brscCommsFace(["On bailout — panel on secondary", "Primary restored"], "#59c97b")); }
        if (it.id === "recall") { strobe.material = mat(0xeaf6fb, { rough: 0.3, emissive: 0x4a5a60, ei: 0.3 }); if (it.resolved === "answered") handHold.scale.set(1.5, 1.5, 1.5); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "latch-rack") latchBar.rotation.z = 0.8 - session.turn.amount * 0.8;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-recovery") scaleMark.position.y = -0.125 + gg.t * 0.25;
        if (step?.id === "push-core" && session.holding) { const k = session.track?.inBand ?? 0; tubeG.position.y = 0.05 - Math.min(0.3, k * 0.05); handle.rotation.y = Math.sin(t * 2) * 0.02; }
        school.position.x = 0.8 + Math.sin(t * 0.3) * 0.3;
        if (bubbles.visible) bubbles.position.y = 1.5 + ((t * 0.4) % 0.6);
        if (session?.activeInterrupt?.id === "recall") strobe.visible = Math.sin(t * 12) > 0; else strobe.visible = true;
        void CITY; void racked;
      },
    };
  },
};
