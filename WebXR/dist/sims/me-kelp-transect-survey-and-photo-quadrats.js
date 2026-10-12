import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace, instrument, standingFigure } from "../citykit.js";
import { quadratFrame } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Kelp Transect Survey & Photo Quadrats VR — Marine Ecology &
// Restoration, station one of the ECO1 pack, on the bay-underwater district.
//
// A scientific diver on the bottom of a generic subtidal kelp bed, running a
// fixed transect for a restoration monitoring programme: the survey plan
// read against the dive plan, the tape run out on its bearing, the canopy
// swum at a pace that does not tear it, three photo quadrats shot to the
// same frame every season, the tagged holdfast from the last survey found
// again, the slate written and the tape bagged for the downline. The
// learner is the diver; the buddy is beside them and the boat is overhead.
// This teaches the METHOD of a repeatable transect — what is fixed, what is
// photographed, what is written down — and asserts nothing about what any
// real bed holds. Depth, gas and current limits are per the dive plan.

const MEKT_ACCENT = 0x4fb98a;
const MEKT_CSS = "#4fb98a";
const MEKT_WARN = "#e8622a";

/** A kelp plant: a holdfast, a stipe and a few blades, one group. */
function mektKelp(parent, x, z, h, seed) {
  const g = group(parent, x, 0, z, seed * 1.7);
  ball(g, 0.09, 0, 0.04, 0, 0x2f4a30, { rough: 1, seg: 6, seg2: 5 }).scale.set(1.3, 0.5, 1.3);
  const stipe = cyl(g, 0.012, 0.02, h, 0, h / 2, 0, 0x6a6a2a, { rough: 0.9, seg: 5, cast: false });
  stipe.rotation.z = 0.08 * ((seed % 3) - 1);
  for (let i = 0; i < 3; i++) {
    const blade = box(g, 0.05, 0.42, 0.006, 0.05 * (i - 1), h * (0.45 + i * 0.22), 0.02 * i, [0x7a8a2c, 0x8b9433, 0x6f7f26][i], { rough: 0.85, cast: false, side: 2 });
    blade.rotation.set(0.25 * (i - 1), 0.6 * i, 0.15);
  }
  return g;
}

export const SIM_ME_KELP_TRANSECT_SURVEY_AND_PHOTO_QUADRATS = {
  id: "me-kelp-transect-survey-and-photo-quadrats",
  index: "601",
  domain: "Environmental",
  trade: "Scientific diver on a restoration monitoring crew, running a fixed kelp transect with a buddy beside them and the boat crew overhead",
  category: "Water & Environmental",
  district: "bay-underwater",
  weather: "clear",
  underwater: { depthLabel: "Per dive plan", bottomTimeSeconds: 600 },
  certification: "AFSCME and LIUNA monitoring and restoration crews as training bodies; OSHA 29 CFR 1910.424 SCUBA diving as the rule the buddy and standby practice answers to; the programme's own diving safety manual and dive plan for every limit; Regional Water Quality Control Board Section 401 and Section 404 monitoring conditions for the restoration the transect reports on; BCDC permit conditions; NOAA Fisheries and the U.S. Fish and Wildlife Service consultation measures for in-water work; CDFW oversight of the survey's collecting and handling",
  name: "Kelp Transect Survey & Photo Quadrats",
  title: simTitle("Kelp Transect Survey & Photo Quadrats"),
  tagline: "The survey plan read against the dive plan, the kit checked, the current read, the tape run out on its bearing, the canopy swum steady, three quadrats shot to the same frame, the tagged holdfast found again, the camera held for the scale shot while a boat passes overhead, the slate written, the tape bagged, the buddy checked and the dive logged",
  accent: MEKT_ACCENT,
  accentCss: MEKT_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "same-frame", name: "Same Frame", note: "Every quadrat shot on its pin at the same frame as last season, and the canopy never torn to get there" },

  supportLine: "your union hall's member assistance programme — AFSCME or LIUNA, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Transect Crew",
    currency: "FRAME",
    ranks: ["Diver Trainee", "Survey Diver", "Transect Lead", "Monitoring Lead", "Transect Certified"],
    badges: [
      { id: "on-the-pin", name: "On The Pin", note: "Every quadrat set on its own pin first time", test: AWARD.stepClean("photo-quadrats") },
      { id: "canopy-kept", name: "Canopy Kept", note: "Never a hazard, never a stipe pulled", test: AWARD.safe },
      { id: "steady-swim", name: "Steady Swim", note: "The current and the pace both read inside the band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-transect", name: "Clean Transect", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "unbroken-line", name: "Unbroken Line", note: "Pace and the scale shot held the whole way", test: AWARD.unbroken },
      { id: "logged-early", name: "Logged Early", note: "Transect logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "grab-the-stipe": "You took hold of a kelp stipe to steady yourself against the current. A stipe tears at the holdfast under a diver's weight, and the plant you pulled loose is one of the plants the transect exists to count next season — a survey that damages the bed it measures has spoiled its own data. Position is held with the tape, a rock or fin work, never with the canopy.",
    "leave-the-buddy": "You swam off the transect to follow something moving in the canopy and left your buddy on the tape. The plan's buddy pair is the standby that 29 CFR 1910.424 practice rests on: two divers who can see each other. A diver alone in a kelp bed with a tangled lanyard has nobody to cut it, and the buddy left behind has to choose between the tape and a search.",
    "slack-tape-in-canopy": "You let the transect tape go slack and drift into the canopy. A slack tape wraps stipes as the surge moves it, reads long when it is pulled straight again, and puts every quadrat pin at the wrong chainage; the tape is run taut and low, just off the substrate, and the reel is never let go of until it is clipped.",
    "flash-into-the-hole": "You fired the camera's strobe straight into the crevice under the ledge to see what was in it. Anything sheltering there is part of what the plan may protect, and the survey's photo method is the fixed quadrat frame, not a hunt: a diver chasing pictures off the tape is a diver off the buddy and off the plan.",
  },

  lateNotes: {
    "transect-reel": "The tape goes out once the bearing is set on the bezel — a tape run before the heading is a line to nowhere the next survey can find.",
    "quadrat-1": "Quadrats are photographed once the transect has been swum end to end — the swim is what finds the pins and the damage before the camera comes out.",
    "photo-slate": "The slate is written after the scale shot is held — the frame number and the tag go on the slate together, not from memory.",
    "survey-bag": "The bag goes up once the slate is written; nothing leaves the bottom before the record of it does.",
  },

  steps: [
    {
      id: "survey-plan", kind: "select", target: "survey-plan-board",
      title: "Read the survey plan against the dive plan",
      cue: "Check the transect number, its bearing and pin count, the quadrat frame and camera settings, and the dive plan's limits as the supervisor briefed them.",
      why: "A monitoring transect is worth having only if it is the same transect every season: the same start pin, the same bearing, the same frame at the same pins with the same camera settings. The survey plan fixes all of that, and the dive plan fixes the limits the survey has to fit inside — how long the pair may work the tape is a number the supervisor holds, not a number the diver improvises when the light is good. Reading both before the reel comes out is what keeps the science and the safety inside one plan.",
    },
    {
      id: "kit-check", kind: "sequence", anyOrder: true,
      targets: ["camera-housing", "slate-check", "transect-reel-check"],
      itemNames: { "camera-housing": "camera housing and strobe", "slate-check": "slate and pencil", "transect-reel-check": "transect reel and clip" },
      title: "Check the survey kit before leaving the downline",
      cue: "Housing latched and strobe firing, slate and pencil on their lanyard, reel free-running with its clip.",
      why: "Everything the survey needs went down clipped to the diver, and a housing that fogs, a slate with no pencil or a reel that jams at the first pin turns a dive the plan allotted into a wasted one. The kit is checked at the downline because that is where an aborted survey costs the least: a diver who discovers the strobe is dead at the third quadrat has used the bottom time the plan gave for three quadrats on none.",
    },
    {
      id: "read-current", kind: "gauge", target: "current-meter",
      title: "Read the current against the plan's working window",
      cue: "Watch the drift on the current meter's streamer and commit the reading against the working window the dive plan gives.",
      why: "The plan's working window is the current a buddy pair can hold a taut tape and a steady frame in; past it the tape bows, the quadrat frame lifts and the divers burn gas fighting to stay on the pin. The number that ends the survey lives in the dive plan the supervisor holds, not in the diver's judgement of how it feels — the meter is read and committed so the decision is the plan's, made before the tape goes out.",
      gauge: { label: "CURRENT", speed: 0.7, green: [0.36, 0.56], readout: (t) => (t < 0.36 ? "slack — streamer hanging" : t <= 0.56 ? "inside the plan's window" : "over the window — tape will bow"), missNote: "Outside the plan's working window — the tape would bow and the frame would lift. Read the meter again and hold the survey if it stays over." },
    },
    {
      id: "set-bearing", kind: "turn", target: "compass-bezel",
      title: "Set the transect bearing on your compass",
      cue: "Turn the bezel to the bearing the survey plan gives for this transect, so the needle sits in the lubber line when you face the far pin.",
      why: "The transect's bearing is what makes this season's tape lie along last season's pins, and in the shade of a canopy the compass is the only thing that keeps the line straight between one pin and the next. It is set before the reel is touched, because a tape run out even a few degrees off puts the quadrat pins off the line and the next crew swims past them without knowing.",
      turn: { turns: 0.75, label: "COMPASS BEZEL", readout: (t) => (t < 0.3 ? "off the transect" : t < 0.9 ? "coming round" : "on the plan's bearing") },
    },
    {
      id: "run-tape", kind: "drag", target: "transect-reel",
      title: "Run the transect tape out to the far pin",
      cue: "Pay the tape out from the start pin along the bearing, taut and just off the substrate, and clip the reel to the far pin.",
      why: "The tape is the survey's ruler, and the far pin is what turns it from a line a diver happens to be holding into a fixed transect the plan can quote. It is run low and taut so the surge cannot drift it into the canopy, and it is clipped rather than laid down, because a tape that pulls free mid-survey means every quadrat after it is at a chainage nobody can repeat.",
      drag: { to: "far-pin", radius: 0.5, missNote: "Not clipped to the far pin — the tape is a fixed line only once it is made fast at both ends." },
    },
    {
      id: "swim-transect", kind: "track", target: "tape-swim", seconds: 6,
      title: "Swim the transect steadily, reading the canopy both sides",
      cue: "Swim along the tape at a pace your buddy holds beside you, fins clear of the holdfasts, scanning a metre either side for the pins and for damage.",
      why: "The first pass finds the quadrat pins, the tagged plants and anything the plan wants noted — and it is swum slowly and level so the fins do not tear blades or stir the bottom into the frame the camera is about to shoot. Faster costs gas the plan did not count and misses pins under the canopy; slower spends bottom time on a stretch with nothing to record. The pace is set by the buddy pair and the visibility, not by the tape's length.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PACE ALONG THE TAPE", readout: (v) => (v < 0.42 ? "stalled — losing the buddy's pace" : v > 0.6 ? "too fast — fins in the canopy" : "steady, level, buddy alongside") },
      holdBreakNote: "The pace broke out of band — either racing into the canopy or stalled behind the buddy. Settle on the tape and take it up again.",
    },
    {
      id: "photo-quadrats", kind: "sequence",
      targets: ["quadrat-1", "quadrat-2", "quadrat-3"],
      itemNames: { "quadrat-1": "quadrat frame on pin 1", "quadrat-2": "quadrat frame on pin 2", "quadrat-3": "quadrat frame on pin 3" },
      title: "Set and photograph the quadrats pin by pin",
      cue: "Set the frame on pin 1, shoot it square from above at the plan's height, then pin 2, then pin 3 — the same frame, the same angle, every time.",
      why: "The quadrat photographs are the survey's data: the same half-metre of bed shot from the same height at the same three pins every season is what lets the programme say whether the bed is changing, and a frame set beside the pin because the pin was under a blade is a photograph of somewhere else. They are taken in pin order so the frame numbers on the camera match the pins on the slate without anyone reconstructing the sequence on the boat.",
      outOfOrderNote: "Out of order — pin 1, then 2, then 3, so the camera's frame numbers and the slate's pins agree without reconstruction.",
    },
    {
      id: "find-tags", kind: "find", noHint: true,
      targets: ["tagged-holdfast", "canopy-gap"],
      itemNames: { "tagged-holdfast": "the numbered tag on a holdfast from the last survey", "canopy-gap": "the stretch of transect where the canopy thins to bare rock" },
      itemNotes: {
        "tagged-holdfast": "A numbered cattle tag zip-tied to a holdfast by the last crew. It is the fixed point that lets this season's frame be compared to last season's — its number goes on the slate beside the quadrat it sits in.",
        "canopy-gap": "A length of the tape where the canopy stops and bare rock begins. The survey records where the edge falls on the tape as a chainage, not a story about why — the reason is for the programme's scientists to argue from the data.",
      },
      title: "Find the tagged holdfast and the canopy edge",
      cue: "Along the tape, pick out the tag left by the last survey and note the chainage where the canopy thins to bare rock.",
      why: "A fixed transect earns its keep by what can be found again: a tagged plant is the anchor that ties this season's frames to last season's, and the chainage where the canopy stops is the one number that shows whether an edge is moving. Both are recorded as what and where — a tag number and a tape reading — because the survey's job is to make an observation the next crew can repeat, not to explain it on the bottom.",
    },
    {
      id: "scale-shot", kind: "hold", target: "scale-bar-hold", seconds: 5,
      title: "Hold the camera steady for the scale shot",
      cue: "Hold the housing square over the frame with the scale bar in shot and keep it there for the full count — no drift, no tilt.",
      why: "The scale bar in the frame is what lets anyone measure from the photograph later, and a shot taken while the camera drifts or tilts has a scale bar that reads a different length at one edge than the other. Holding square for the full count is the diver's own proof that the frame was shot as the plan says; a rushed shot cannot be told from a careful one on the boat, only in the analysis months later when it is too late to return.",
      holdBreakNote: "The housing drifted off square before the count was done — the scale bar would read wrong across the frame. Settle over the frame and hold again.",
    },
    {
      id: "write-slate", kind: "select", target: "photo-slate",
      title: "Write the frame numbers, the tag and the chainages on the slate",
      cue: "Write pin by pin: the frame numbers the camera gave, the tag number at its pin, the canopy edge's chainage and the visibility and current as you found them.",
      why: "The camera knows its frame numbers and the tape knows its chainages, but only the slate ties one to the other, and a slate written on the boat from memory is where quadrat two's frames end up filed under pin three. It is written on the bottom, beside the tape, while anything unclear can still be looked at again, so the record that reaches the programme's database is the record that was true where it was made.",
    },
    {
      id: "bag-up", kind: "drag", target: "survey-bag",
      title: "Clip the survey bag to the downline",
      cue: "Unclip the reel, wind the tape in taut, and clip the bag with the reel and the frame to the downline's travelling clip to go up with you.",
      why: "The tape and the frame go up on the downline rather than in a diver's hands, so nothing is left in the bed to wrap the canopy and nothing changes a diver's buoyancy on the ascent the plan was written for. The pins stay; everything the crew brought goes home the way it came, and the next survey finds the bed as this one left it.",
      drag: { to: "downline-clip", radius: 0.5, missNote: "Not on the downline clip — the bag rides the downline up, not the diver's hand." },
    },
    {
      id: "buddy-checkin", kind: "select", target: "buddy-signal",
      title: "Check in with your buddy before the ascent",
      cue: "Face your buddy at the downline: exchange the okay, confirm you both have what the plan says you need for the ascent, and agree the ascent on the supervisor's line.",
      why: "The ascent is made as a pair on the plan the supervisor holds, and the check-in is where a buddy who has been quiet on the tape says whether that quiet was concentration or trouble. A survey dive puts two people head-down in a canopy for the whole bottom time, and the moment at the downline is the crew's own — with the AFSCME or LIUNA member assistance line there afterwards for whatever the debrief on the boat does not settle.",
    },
    {
      id: "dive-log", kind: "select", target: "dive-log-slate",
      title: "Log the transect for the programme and the dive record",
      cue: "On the boat's log slate: transect number, pins photographed, frames, tags found, the canopy edge chainage, the boat overhead and the turn signal, and the visibility and current as read.",
      why: "The dive record and the survey record are two documents that have to agree: the supervisor's log is what 29 CFR 1910.424 practice and the programme's diving safety manual ask for, and the survey log is what the restoration's Section 401 monitoring conditions are answered from. Writing both while the pair is still on deck is how the boat overhead and the early turn become part of the record instead of a story told later.",
    },
  ],

  interrupts: [
    {
      id: "buddy-turn-signal",
      kind: "Buddy signals the turn point",
      after: "swim-transect", delay: 2, seconds: 14,
      alert: "Your buddy has stopped on the tape and is signalling the turn point the dive plan set — they are showing you the gauge and the thumb.",
      cue: "Answer the signal: acknowledge, signal the turn to the dive, and start back along the tape together.",
      target: "turn-signal",
      why: "The turn point is a limit the dive plan set before anyone got wet, and a buddy who signals it is not asking for an opinion — the pair turns, the pins not yet shot wait for the next dive the supervisor plans. A diver who waves the signal off to finish one more quadrat has left the plan and left the buddy holding a decision that was never theirs to make alone.",
      missNote: "You kept swimming to the next pin while your buddy hung on the tape signalling; the pair separated in the canopy and the turn was made late, on gas the plan had reserved for the ascent.",
      wrongNote: "Not that. Your buddy's turn signal is answered with the turn signal — acknowledge it and turn the dive together.",
    },
    {
      id: "vessel-overhead",
      kind: "Engine noise overhead",
      after: "scale-shot", delay: 2, seconds: 14,
      alert: "An engine has come up loud directly overhead — a vessel is passing over the transect, well inside where the dive flag should have kept it.",
      cue: "Stay down on the tape and send up the surface marker so the boat crew and the vessel can see where the pair is.",
      target: "smb-reel",
      why: "A diver cannot see a hull from under a canopy and cannot outswim one; the safe response to engine noise overhead is to stay on the bottom, hold the tape and send the marker up so the surface knows exactly where the pair is. Surfacing to look is how a diver meets the propeller. The marker goes up from the reel, not the diver, and the ascent waits for the supervisor's line once the noise has passed.",
      missNote: "The pair held the frame and did nothing while the vessel crossed; the boat crew could not tell the surface where the divers were, and the ascent that followed was made under a hull nobody had warned off.",
      wrongNote: "Not that. The surface marker is what tells the surface where you are — send it up from the reel and stay on the tape.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const floor = cyl(g, 3.0, 3.4, 0.1, 0, 0.03, -0.5, 0xffffff, { seg: 28, cast: false });
    floor.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0x8f9a86 });
    // Rock ledge along the back, the reef the kelp holds to.
    for (const [x, z, r, sy] of [[-2.3, -2.2, 0.45, 0.5], [-1.4, -2.5, 0.38, 0.45], [0.4, -2.6, 0.5, 0.4], [1.6, -2.4, 0.42, 0.55], [2.6, -1.9, 0.36, 0.45], [2.8, 0.6, 0.3, 0.4], [-2.9, 0.2, 0.33, 0.4]]) {
      ball(g, r, x, r * sy * 0.6, z, [0x4a5048, 0x555b52, 0x3f463f][Math.round(x + 3) % 3], { rough: 1, seg: 9, seg2: 7 }).scale.set(1.2, sy, 0.9);
    }
    // The ledge's crevice — the strobe hazard.
    const ledge = group(g, 2.2, 0, -1.6);
    box(ledge, 0.9, 0.3, 0.5, 0, 0.15, 0, 0x454b45, { rough: 1 });
    box(ledge, 0.5, 0.12, 0.3, 0, 0.06, 0.3, 0x1c201c, { rough: 1 });
    const flashHit = box(ledge, 0.5, 0.3, 0.4, 0, 0.2, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(ledge, "strobe into the crevice?", 0, 0.55, 0.4, { css: MEKT_WARN, w: 0.44 });
    reg(hits, flashHit, "flash-into-the-hole");

    // ------------------------------------------------------- the kelp
    const bed = group(g);
    let n = 0;
    for (let i = 0; i < 26; i++) {
      const a = i * 0.83, r = 1.0 + (i % 5) * 0.42;
      const x = Math.cos(a) * r, z = -0.5 + Math.sin(a) * r * 0.8;
      if (x > 0.9 && z > -0.9 && z < 0.4) continue; // the canopy gap
      mektKelp(bed, x, z, 1.1 + (i % 4) * 0.25, i); n++;
    }
    void n;
    const stipeHit = box(g, 0.4, 0.8, 0.4, -1.1, 0.7, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab a stipe to steady up?", -1.1, 1.25, -1.3, { css: MEKT_WARN, w: 0.48 });
    reg(hits, stipeHit, "grab-the-stipe");
    // The canopy gap: bare rock, urchin-sized balls kept generic, and the edge marker.
    const gap = group(g, 1.5, 0, -0.3);
    for (let i = 0; i < 7; i++) ball(gap, 0.05, -0.4 + (i % 4) * 0.25, 0.05, -0.2 + Math.floor(i / 4) * 0.3, 0x2a2430, { rough: 0.9, seg: 6, seg2: 5 });
    const gapHit = box(gap, 0.9, 0.3, 0.7, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(gap, "canopy edge — chainage", 0, 0.5, 0, { css: MEKT_CSS, w: 0.42 });
    reg(hits, gapHit, "canopy-gap");

    // ------------------------------------------------------- the transect
    const startPin = group(g, -2.2, 0, 1.0);
    cyl(startPin, 0.015, 0.015, 0.6, 0, 0.3, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    box(startPin, 0.06, 0.08, 0.008, 0.03, 0.56, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(startPin, "start pin", 0, 0.78, 0, { css: MEKT_CSS, w: 0.2 });
    const farPin = group(g, 2.3, 0, -1.2);
    cyl(farPin, 0.015, 0.015, 0.6, 0, 0.3, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    torus(farPin, 0.16, 0.01, 0, 0.45, 0, MEKT_ACCENT, { emissive: MEKT_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holoTag(farPin, "far pin", 0, 0.78, 0, { css: MEKT_CSS, w: 0.18 });
    reg(hits, farPin, "far-pin");
    const reel = group(g, -1.9, 0.45, 0.85);
    cyl(reel, 0.09, 0.09, 0.05, 0, 0, 0, 0xf06a2b, { rough: 0.55, seg: 16 }).rotation.x = Math.PI / 2;
    box(reel, 0.03, 0.14, 0.02, 0, -0.1, 0, 0x2b3138, { rough: 0.6 });
    holoTag(reel, "transect reel", 0, 0.18, 0, { css: MEKT_CSS, w: 0.26 });
    reg(hits, reel, "transect-reel");
    const reelCheck = torus(g, 0.13, 0.008, -1.9, 0.45, 0.85, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    reelCheck.rotation.x = Math.PI / 2;
    reg(hits, reelCheck, "transect-reel-check");
    const tapeLen = Math.hypot(4.5, 2.2);
    const tape = box(g, tapeLen, 0.004, 0.02, 0.05, 0.3, -0.1, 0xf2e6b8, { rough: 0.6 });
    tape.rotation.y = Math.atan2(2.2, 4.5);
    tape.scale.x = 0.15;
    tape.position.set(-2.2 + 4.5 * 0.075, 0.3, 1.0 - 2.2 * 0.075);
    const slackHit = box(g, 0.6, 0.3, 0.4, -0.6, 0.35, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let the tape drift into the canopy?", -0.6, 0.62, 0.3, { css: MEKT_WARN, w: 0.6 });
    reg(hits, slackHit, "slack-tape-in-canopy");
    const swim = group(g, -0.9, 0.7, 0.25);
    for (let i = 0; i < 3; i++) { const chev = box(swim, 0.12, 0.012, 0.03, i * 0.22, 0, -i * 0.11, MEKT_ACCENT, { emissive: MEKT_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.y = 0.45; }
    holoTag(swim, "swim the transect", 0.2, 0.18, -0.1, { css: MEKT_CSS, w: 0.32 });
    reg(hits, swim, "tape-swim");

    // ------------------------------------------------------- the quadrat pins and frames
    const frames = [];
    for (const [id, x, z] of [["quadrat-1", -1.2, 0.5], ["quadrat-2", 0.0, -0.1], ["quadrat-3", 1.2, -0.7]]) {
      const pin = cyl(g, 0.01, 0.01, 0.3, x - 0.28, 0.15, z - 0.28, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
      void pin;
      const frame = quadratFrame(g, x, 0.01, z, { ry: Math.atan2(2.2, 4.5) });
      holoTag(g, id.replace("quadrat-", "pin "), x, 0.4, z, { css: MEKT_CSS, w: 0.16 });
      reg(hits, frame, id);
      frames.push(frame);
    }
    const tag = group(g, -0.55, 0, 0.35);
    ball(tag, 0.1, 0, 0.05, 0, 0x2f4a30, { rough: 1, seg: 6, seg2: 5 }).scale.set(1.3, 0.5, 1.3);
    const tagPlate = box(tag, 0.05, 0.04, 0.006, 0.08, 0.12, 0, 0xf2c14b, { rough: 0.6 });
    decal(tag, 0.04, 0.03, 0.08, 0.12, 0.004, signFace("T-14", { bg: "#f2c14b", accent: "#1b1e22", fg: "#1b1e22", scale: 0.5 }));
    void tagPlate;
    holoTag(tag, "holdfast tag", 0, 0.3, 0, { css: MEKT_CSS, w: 0.26 });
    reg(hits, tag, "tagged-holdfast");

    // ------------------------------------------------------- the diver's kit
    const camera = group(g, -0.2, 1.0, 1.4, 0.2);
    box(camera, 0.22, 0.14, 0.12, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.3 });
    cyl(camera, 0.05, 0.05, 0.06, 0, 0, 0.09, 0x2b3138, { rough: 0.3, metal: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const strobe = ball(camera, 0.04, 0.2, 0.12, 0.02, 0xdfe8ee, { rough: 0.3, emissive: 0x8aa0a8, ei: 0.4, seg: 10, seg2: 8 });
    box(camera, 0.02, 0.16, 0.02, 0.2, 0.02, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    holoTag(camera, "camera housing", 0, 0.2, 0, { css: MEKT_CSS, w: 0.3 });
    reg(hits, camera, "camera-housing");
    const scaleHold = group(g, 0.0, 0.75, -0.1);
    const holdRing = torus(scaleHold, 0.2, 0.01, 0, 0, 0, MEKT_ACCENT, { emissive: MEKT_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holdRing.rotation.x = Math.PI / 2;
    box(scaleHold, 0.2, 0.01, 0.02, 0, -0.7, 0.2, 0xffffff, { rough: 0.5 });
    holoTag(scaleHold, "hold square — scale shot", 0, 0.18, 0, { css: MEKT_CSS, w: 0.44 });
    reg(hits, scaleHold, "scale-bar-hold");
    const slate = decal(g, 0.26, 0.2, -0.75, 1.05, 1.35, paperFace("SLATE", ["Pin 1 · frames", "Pin 2 · tag T-14", "Edge · chainage"], { bg: "#e8eef0", band: MEKT_CSS }), { px: 192 });
    slate.rotation.y = 0.3;
    holoTag(g, "slate — write it up", -0.75, 1.24, 1.35, { css: MEKT_CSS, w: 0.36 });
    reg(hits, slate, "photo-slate");
    const slateCheck = box(g, 0.05, 0.12, 0.012, -0.58, 0.95, 1.36, 0xf2c14b, { rough: 0.6 });
    reg(hits, slateCheck, "slate-check");
    const compass = group(g, -1.2, 1.05, 1.45, 0.3);
    cyl(compass, 0.07, 0.07, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const bezel = group(compass, 0, 0, 0.02);
    torus(bezel, 0.065, 0.008, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 20 });
    box(bezel, 0.008, 0.05, 0.004, 0, 0.03, 0.01, 0xf06a2b, { rough: 0.5 });
    holoTag(compass, "compass bezel", 0, 0.14, 0, { css: MEKT_CSS, w: 0.28 });
    reg(hits, compass, "compass-bezel");
    const currentMeter = group(g, 1.4, 0, 1.3);
    cyl(currentMeter, 0.02, 0.025, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 });
    const streamer = box(currentMeter, 0.02, 0.01, 0.4, 0, 0.72, 0.2, 0xf06a2b, { rough: 0.7, cast: false });
    const meterHead = instrument(currentMeter, 0.14, 0.62, 0, { idle: "-- drift", color: MEKT_ACCENT, w: 0.13, d: 0.19 });
    holoTag(currentMeter, "current meter", 0, 0.95, 0, { css: MEKT_CSS, w: 0.3 });
    reg(hits, meterHead, "current-meter");

    // ------------------------------------------------------- signals, marker, downline
    const turnSig = group(g, 0.5, 1.15, 1.3);
    const turnRing = torus(turnSig, 0.12, 0.012, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    void turnRing;
    holoTag(turnSig, "signal — turn the dive", 0, 0.2, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, turnSig, "turn-signal");
    const buddySig = group(g, 1.0, 1.15, 1.6);
    torus(buddySig, 0.12, 0.012, 0, 0, 0, MEKT_ACCENT, { emissive: MEKT_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(buddySig, "buddy — okay?", 0, 0.2, 0, { css: MEKT_CSS, w: 0.28 });
    reg(hits, buddySig, "buddy-signal");
    const smb = group(g, 0.9, 0.5, 1.9);
    cyl(smb, 0.06, 0.06, 0.04, 0, 0, 0, 0xf06a2b, { rough: 0.55, seg: 14 }).rotation.x = Math.PI / 2;
    const smbBag = cyl(smb, 0.05, 0.05, 0.5, 0, 0.35, 0, 0xf06a2b, { rough: 0.6, seg: 10 });
    smbBag.visible = false;
    const smbLine = cyl(smb, 0.004, 0.004, 3.0, 0, 1.6, 0, 0xe8dcb8, { rough: 0.8, seg: 4 });
    smbLine.visible = false;
    holoTag(smb, "surface marker reel", 0, 0.18, 0, { css: "#f06a2b", w: 0.36 });
    reg(hits, smb, "smb-reel");
    const downline = group(g, -2.4, 0, 2.0);
    box(downline, 0.4, 0.2, 0.4, 0, 0.1, 0, 0x3a3f45, { rough: 0.8, metal: 0.3 });
    cyl(downline, 0.012, 0.012, 8, 0, 4.1, 0, 0xe8dcb8, { rough: 0.8, seg: 6 });
    const clip = group(downline, 0, 1.1, 0);
    torus(clip, 0.14, 0.01, 0, 0, 0, MEKT_ACCENT, { emissive: MEKT_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(clip, "downline clip", 0, 0.2, 0, { css: MEKT_CSS, w: 0.26 });
    reg(hits, clip, "downline-clip");
    const bag = group(g, -1.7, 0.1, 1.5);
    box(bag, 0.3, 0.2, 0.18, 0, 0.1, 0, 0x2f6f4f, { rough: 0.85 });
    ball(bag, 0.06, 0.08, 0.25, 0, 0xf06a2b, { rough: 0.5, seg: 10, seg2: 8 });
    holoTag(bag, "survey bag", 0, 0.42, 0, { css: MEKT_CSS, w: 0.22 });
    reg(hits, bag, "survey-bag");
    const logSlate = decal(g, 0.3, 0.22, -2.0, 1.5, 2.2, paperFace("DIVE + SURVEY LOG", ["Transect · pins · frames", "Tags · edge chainage", "Turn · vessel · viz · current"], { bg: "#e8f0ec", band: "#2b8a5a" }), { px: 192 });
    logSlate.rotation.y = 0.4;
    holoTag(g, "log slate — boat", -2.0, 1.72, 2.2, { css: MEKT_CSS, w: 0.32 });
    reg(hits, logSlate, "dive-log-slate");

    // ------------------------------------------------------- the buddy, the leave-the-buddy hazard
    const buddy = standingFigure(g, 0.6, 1.1, { ry: -0.4, cloth: 0x1a2a3a, vest: 0x2f6f5f, helmet: 0x1a2a3a, atStation: true });
    const buddyHome = buddy.position.clone();
    const leaveHit = box(g, 0.5, 0.6, 0.5, 2.6, 0.9, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "chase it off the tape?", 2.6, 1.35, 1.6, { css: MEKT_WARN, w: 0.42 });
    reg(hits, leaveHit, "leave-the-buddy");

    // ------------------------------------------------------- the plan board, the fish, the boat
    const planBoard = holoPanel(g, 0.92, 0.6, -2.2, 1.5, 0.2, (cx, w, h) => {
      cx.fillStyle = "#0b1c1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = MEKT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5ee"; cx.fillText("SURVEY PLAN — KELP TRANSECT", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e6faf3";
      ["Transect: bearing per plan, three pins", "Frame: quadrat, shot square, scale bar in", "Limits: per the dive plan and the DSO",
       "Section 401 / BCDC monitoring conditions", "NOAA Fisheries · USFWS · CDFW measures"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.6, accent: MEKT_ACCENT });
    reg(hits, planBoard, "survey-plan-board");
    const school = group(g, 0.5, 2.0, -1.5);
    for (let i = 0; i < 7; i++) {
      const f = group(school, (i % 3) * 0.35 - 0.35, Math.floor(i / 3) * 0.25, (i % 2) * 0.2);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    }
    const hull = group(g, 1.0, 3.6, 0.0);
    const hullBody = ball(hull, 0.6, 0, 0, 0, 0x1f2b30, { rough: 0.7, metal: 0.2, seg: 12, seg2: 6, cast: false });
    hullBody.scale.set(1.0, 0.3, 2.6);
    hull.visible = false;
    const hullHome = hull.position.clone();
    const shafts = group(g, 0, 2.8, -0.5);
    for (let i = 0; i < 5; i++) cyl(shafts, 0.06, 0.16, 2.6, -1.6 + i * 0.8, 0, (i % 2) * 0.5, 0xbfe9df, { opacity: 0.08, transparent: true, rough: 0.2, cast: false, seg: 6 });
    for (let i = 0; i < 9; i++) ball(g, 0.05 + (i % 3) * 0.02, Math.cos(i * 0.8) * 2.7, 0.05, -0.5 + Math.sin(i * 0.8) * 2.4, 0x3d3a48, { rough: 0.9, seg: 6, seg2: 5 });

    const siltMap = floor.material.map;
    let swimming = false, turned = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.8, -0.4),
      onStep(step) { if (step?.id === "swim-transect") swimming = true; },
      onStepComplete(step) {
        if (step.id === "kit-check") strobe.material = mat(0xffffff, { emissive: 0xffffff, ei: 1.4, rough: 0.3 });
        if (step.id === "run-tape") { tape.scale.x = 1; reel.position.set(2.3, 0.45, -1.2); }
        if (step.id === "swim-transect") swimming = false;
        if (step.id === "photo-quadrats") for (const f of frames) f.position.y = 0.01;
        if (step.id === "write-slate") repaint(slate, paperFace("SLATE", ["Pin 1 · 041–043", "Pin 2 · T-14 · 044–046", "Pin 3 · 047–049 · edge ch. read"], { bg: "#e8eef0", band: MEKT_CSS }));
        if (step.id === "bag-up") { bag.position.set(-2.4, 1.1, 2.0); reel.visible = false; }
        if (step.id === "buddy-checkin") buddy.position.set(-2.0, 0, 1.7);
        if (step.id === "dive-log") repaint(logSlate, paperFace("DIVE + SURVEY LOG", ["Transect · 3 pins · 9 frames", "T-14 found · edge chainage read", "Turned on signal · vessel · SMB sent"], { bg: "#e8f0ec", band: "#2b8a5a" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "buddy-turn-signal") { buddy.position.set(0.2, 0, 0.6); buddy.rotation.y = 1.2; }
        if (it.id === "vessel-overhead") { hull.visible = true; hull.position.set(-2.5, 3.6, 0.5); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") { if (it.id === "vessel-overhead") hull.visible = false; return; }
        if (it.id === "buddy-turn-signal") { turned = true; buddy.position.copy(buddyHome); }
        if (it.id === "vessel-overhead") { smbBag.visible = true; smbLine.visible = true; }
      },
      animate(t, dt, session) {
        if (siltMap?.offset) { siltMap.offset.x = Math.sin(t * 0.2) * 0.004; }
        bed.children.forEach((k, i) => { k.rotation.z = Math.sin(t * 0.9 + i) * 0.06; });
        streamer.rotation.y = Math.sin(t * 1.3) * 0.3;
        school.position.x = 0.5 + Math.sin(t * 0.4) * 0.8;
        if (hull.visible) { hull.position.x += dt * 1.2; if (hull.position.x > 3.5) hull.position.copy(hullHome); }
        if (swimming) buddy.position.x = Math.min(2.0, buddy.position.x + dt * 0.1);
        const step = session?.step;
        if (session?.turn && step?.id === "set-bearing") bezel.rotation.z = -session.turn.amount * 4.7;
        if (session?.gauge && !session.gauge.committed && step?.id === "read-current") {
          const gt = session.gauge.t ?? 0;
          repaint(meterHead.userData.screen, signFace(gt < 0.36 ? "slack" : gt <= 0.56 ? "in window" : "over", { bg: "#0d1c24", accent: gt >= 0.36 && gt <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
        void turned;
      },
    };
  },
};
