import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, reg, surfaceTexture, texturedMat, waterFace, instrument, valveWheel, standingFigure } from "../citykit.js";
import { sandFace } from "../../../shared/textures.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shoreline Debris & Microplastics Survey VR — Marine Ecology &
// Restoration, station seven of the ECO1 pack.
//
// A shoreline survey on a generic beach: the protocol and the tide window
// read, gloves, vest and the sharps kit on, the transect tape committed at
// the strandline, the transect walked at survey pace tallying by category,
// the unknown container and the line tangle found and left, the sand
// quadrat scooped, sieved and jarred in order, the sieve stack shaken, the
// jar held under the rinse while the wind lifts the samples, the residue
// jarred and labelled, the coordinator called and the survey logged. The
// learner is the survey lead. Taught: the METHOD that makes a beach tally
// comparable and a sand sample honest — never a claim about what any beach
// holds.

const MESD_ACCENT = 0xd9a441;
const MESD_CSS = "#d9a441";
const MESD_WARN = "#e8622a";

function mesdLog(lines, band = MESD_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "#1a160c"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f7efd8"; cx.fillText("SHORELINE SURVEY LOG", w * 0.06, h * 0.2);
    cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e8";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
  };
}

export const SIM_ME_SHORELINE_DEBRIS_AND_MICROPLASTICS_SURVEY = {
  id: "me-shoreline-debris-and-microplastics-survey",
  index: "607",
  domain: "Environmental",
  trade: "Survey lead on a shoreline monitoring crew, running a debris transect and a sand quadrat with a second surveyor and a sharps kit",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA and AFSCME monitoring and clean-up crews as training bodies; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.1030 bloodborne pathogens for sharps in the wrack; HAZWOPER awareness for an unknown container, which is reported and left; DTSC oversight of what is found; a quality assurance project plan written to EPA QA/G-5 for the sand samples; Regional Water Quality Control Board Section 401 and BCDC conditions the shoreline record informs; NOAA tide predictions for the survey window; the U.S. Fish and Wildlife Service buffer measures on the upper beach",
  name: "Shoreline Debris & Microplastics Survey",
  title: simTitle("Shoreline Debris & Microplastics Survey"),
  tagline: "The protocol and the window read, gloves, vest and the sharps kit on, the tape committed at the strandline, the transect walked at pace while a syringe turns up in the wrack, the unknown container and the line tangle found and left, the quadrat scooped, sieved and jarred in order, the stack shaken, the jar held under the rinse as the wind lifts the samples, the residue jarred, the coordinator called and the survey logged",
  accent: MESD_ACCENT,
  accentCss: MESD_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tallied-not-touched", name: "Tallied, Not Touched", note: "Every item tallied by category, every sharp in the kit by tongs, the unknown left for the call, and the sand jarred under custody" },

  supportLine: "your union hall's member assistance programme — LIUNA or AFSCME, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Shoreline Crew",
    currency: "TALLY",
    ranks: ["Volunteer Lead", "Surveyor", "Transect Lead", "Survey Lead", "Shoreline Certified"],
    badges: [
      { id: "in-order", name: "In Order", note: "Scooped, sieved and jarred in order first time", test: AWARD.stepClean("quadrat-chain") },
      { id: "hands-clean", name: "Hands Clean", note: "Never a hazard, never a bare hand in the wrack", test: AWARD.safe },
      { id: "at-the-strandline", name: "At The Strandline", note: "The tape and the shaker both read inside the band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections from the protocol to the log", test: AWARD.clean },
      { id: "steady-walk", name: "Steady Walk", note: "The transect walked and the jar held without a break", test: AWARD.unbroken },
      { id: "logged-before-flood", name: "Logged Before The Flood", note: "Survey logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-in-the-wrack": "You reached bare-handed into the wrack line to pull out a piece of debris. The wrack hides glass, hooks, needles and whatever the last tide brought, and 29 CFR 1910.1030 is written for exactly the needle you did not see; everything in the wrack is moved with the tongs or a gloved hand, and a sharp goes into the kit's container, never into a bag.",
    "kick-it-into-the-water": "You kicked a piece of debris off the transect into the surf to get it out of the tally. The survey counts what is on the beach so the record is honest, and debris kicked into the water is debris the next tide brings back to a beach the crew has just reported clean — it is tallied, bagged if the protocol says, and never moved seaward.",
    "open-jar-in-the-wind": "You left the sample jar open on the sieve table while you wrote the label. Wind on a beach carries sand, fibre from clothing and fragments from everything upwind straight into an open jar, and the laboratory has no way to tell the beach's particles from the crew's; the jar is capped between every step and opened only for what goes into it.",
    "climb-the-riprap": "You climbed the riprap at the transect's end to reach the debris caught in the rocks. Riprap moves under a boot, the gaps hold the same sharps as the wrack, and a surveyor with a foot wedged between two rocks on a flood tide is a rescue; what is caught in the rocks is photographed and tallied from the sand.",
  },

  lateNotes: {
    "quadrat-scoop": "The quadrat is scooped once the transect is tallied — the sand sample comes from the strandline the walk located, not from wherever the crew stopped.",
    "sieve-crank": "The stack is shaken once the scoop is in it — an empty stack shaken is time the tide is not giving back.",
    "residue-jar": "The residue is jarred once the rinse is held — residue jarred wet from the top sieve carries the sand the rinse was meant to take off.",
  },

  steps: [
    {
      id: "protocol", kind: "select", target: "protocol-board",
      title: "Read the survey protocol and the tide window",
      cue: "Check the transect's start and length, the debris categories on the tally card, the quadrat's position on the strandline, the sample handling, and the window the tide table gives.",
      why: "A shoreline survey is comparable with the last one only if the same length of beach is walked from the same start, tallied into the same categories and sampled at the same strandline; the protocol fixes all of that and the quality plan behind it says how a jar of sand becomes a number a laboratory will stand behind. The tide sets the window, and reading both at the truck is how the crew arrives knowing what is counted, what is bagged, and when the beach closes.",
    },
    {
      id: "survey-kit", kind: "sequence", anyOrder: true,
      targets: ["gloves-on", "vest-on", "sharps-kit"],
      itemNames: { "gloves-on": "puncture-resistant gloves", "vest-on": "high-visibility vest", "sharps-kit": "sharps container and tongs" },
      title: "Gloves, vest and the sharps kit before the sand",
      cue: "Puncture-resistant gloves on, the vest on so the second surveyor can see you down the beach, and the sharps container with its tongs clipped to the kit bag.",
      why: "The wrack line is where the tide leaves everything sharp, and 29 CFR 1910.132 asks the employer to have assessed this beach and decided: the gloves for the hands, the vest so two surveyors a transect apart can find each other, and the sharps container because a needle found with no container to hand is a needle somebody carries in a bag. They go on at the truck; nobody pulls a glove on over a cut.",
    },
    {
      id: "tape-strandline", kind: "gauge", target: "transect-tape",
      title: "Run the tape and commit it at the strandline",
      cue: "Run the transect tape from the start stake along the beach and commit the reading where the protocol's strandline crosses it.",
      why: "The strandline is where the quadrat goes and where the tally's upper zone begins, and it moves with every tide; the protocol defines it by what the last high water left, not by where the sand looks different. Reading the tape where the line crosses it and committing it is what puts this survey's quadrat where the next crew can put theirs — a strandline guessed is a sample from a different beach.",
      gauge: { label: "TRANSECT TAPE", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "short of the strandline" : t <= 0.6 ? "at the protocol's strandline" : "past it — into the upper beach"), missNote: "Not at the strandline — read the tape where the last high water's line crosses it and commit there." },
    },
    {
      id: "walk-transect", kind: "track", target: "transect-walk", seconds: 6,
      title: "Walk the transect at survey pace, tallying by category",
      cue: "Walk the tape's length at the protocol's pace with the second surveyor on the seaward side, tallying each item into its category as you pass it — no stopping to collect, no skipping ahead.",
      why: "The tally is a count made while walking, and the pace is what makes it the same count every survey: fast misses the small items that make up most of the tally, slow turns a survey into a clean-up. Two surveyors walk the transect's two zones so each item is seen once, and everything is tallied where it lies before anything is picked up — the survey records the beach before the crew changes it.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "SURVEY PACE", readout: (v) => (v < 0.4 ? "stopped — collecting, not counting" : v > 0.6 ? "hurrying — missing the small items" : "survey pace, tallying as you go") },
      holdBreakNote: "The pace broke — stopped to collect or hurrying past the small items. Find the tape and take up the protocol's pace.",
    },
    {
      id: "find-hazards", kind: "find", noHint: true,
      targets: ["unknown-container", "line-tangle"],
      itemNames: { "unknown-container": "the sealed container with no legible label", "line-tangle": "the tangle of fishing line and hooks in the wrack" },
      itemNotes: {
        "unknown-container": "A sealed plastic container, label gone, heavier than it should be. It is tallied, photographed, flagged and left where it lies: HAZWOPER awareness says an unknown is not opened or moved by a survey crew, and the coordinator's call brings the people who can test it.",
        "line-tangle": "Monofilament and hooks wound through the wrack. It is tallied as its category and lifted with the tongs into the sharps container, because a hook through a glove is the injury this beach gives most often.",
      },
      title: "Find the unknown container and the line tangle",
      cue: "Along the transect, pick out the sealed container nobody can identify and the tangle of line and hooks; the first is flagged and left, the second goes to the kit by tongs.",
      why: "The two hazards a shoreline survey meets most are the thing that cuts and the thing nobody can identify, and the method for each is fixed before the walk: sharps to the container by tongs, unknowns flagged and reported. Finding both deliberately, as a step, is what keeps a tired surveyor from doing the natural thing — picking one up to look — on the one item that would make the day an incident.",
    },
    {
      id: "quadrat-chain", kind: "sequence",
      targets: ["quadrat-scoop", "sieve-stack", "sample-jar"],
      itemNames: { "quadrat-scoop": "top layer scooped from inside the quadrat frame", "sieve-stack": "scoop tipped into the sieve stack", "sample-jar": "jar labelled and capped beside the stack" },
      title: "Scoop, sieve and jar the quadrat in order",
      cue: "Scoop the protocol's depth of sand from inside the frame at the strandline, tip it into the sieve stack, and have the labelled jar capped and ready beside the stack before anything comes off the sieves.",
      why: "The sand sample is a fixed area to a fixed depth from the strandline, and the order keeps it honest: scoop from inside the frame only, into the stack only, with the jar labelled before the residue exists so nothing waits open in the wind. A scoop taken outside the frame or a jar labelled afterwards from memory is a sample the quality plan cannot vouch for.",
      outOfOrderNote: "Out of order — scoop inside the frame, tip into the stack, jar labelled and capped beside it. The jar waits for the residue, not the other way round.",
    },
    {
      id: "shake-stack", kind: "turn", target: "sieve-crank",
      title: "Shake the sieve stack for the protocol's count",
      cue: "Turn the shaker's crank steadily for the protocol's count so the sand passes the meshes and the fragments stay on their sieves.",
      why: "The stack separates the sample by size, and it does so only if it is shaken evenly for the same time every survey: under-shaken, sand stays on the top mesh and is counted as fragment; over-shaken, fragments break and are counted twice. The count is the protocol's, kept on the crank, so a jar from this beach means the same as a jar from any other.",
      turn: { turns: 0.8, label: "SIEVE SHAKER", readout: (t) => (t < 0.3 ? "sand still on the top mesh" : t < 0.85 ? "shaking — sand passing" : "protocol's count — fragments on their meshes") },
    },
    {
      id: "rinse-hold", kind: "hold", target: "rinse-hold", seconds: 5,
      title: "Hold the jar under the rinse for the residue",
      cue: "Hold the open jar under the rinse bottle's stream below the top sieve for the full count so every fragment goes into the jar and none stays on the mesh.",
      why: "What stays on the meshes is the sample, and it goes into the jar by rinse, not by hand: a gloved finger leaves fibre and misses the small fragments that are most of the count. The jar is held still under the stream for the full count because a jar moved early leaves fragments on the mesh for the next sample to inherit — and the laboratory cannot tell whose they were.",
      holdBreakNote: "The jar moved out from under the stream before the rinse was done — fragments stayed on the mesh. Steady it and hold again.",
    },
    {
      id: "jar-residue", kind: "drag", target: "residue-jar",
      title: "Cap the jar and set it in the sample case",
      cue: "Cap the jar, check its label against the tally card, and set it in its slot in the sample case with the lid latched.",
      why: "The jar's slot in the case is the last link between this strandline and the laboratory bench: the label on the jar, the slot on the case sheet and the line in the log all say the same thing. A capped jar in a latched case cannot blow over, be opened by mistake or be mixed with another beach's; the case is what carries the quality plan off the sand.",
      drag: { to: "sample-case", radius: 0.55, missNote: "Not in the case — the capped jar goes into its slot in the sample case, lid latched." },
    },
    {
      id: "tally-card", kind: "sequence", anyOrder: true,
      targets: ["tally-count", "tally-photo", "tally-position"],
      itemNames: { "tally-count": "counts per category totalled", "tally-photo": "photographs of the flagged items referenced", "tally-position": "the transect's start and the quadrat's position recorded" },
      title: "Complete the tally card",
      cue: "Total each category's tallies, reference the photographs of the flagged container and the tangle, and record the transect's start and the quadrat's position on the tape.",
      why: "The tally card is the survey; a beach walked and not written down is a walk. The counts per category are what the programme compares survey to survey, the photographs are what the coordinator's call about the unknown container is made from, and the positions are what let the next crew put their tape and their frame where this one did.",
    },
    {
      id: "coordinator-call", kind: "select", target: "crew-radio",
      title: "Call the coordinator about the unknown and check in",
      cue: "On the radio: the transect is tallied and the quadrat jarred, the unknown container is flagged at its position on the tape and left, and how the pair is after the syringe and the wind.",
      why: "The unknown container is somebody else's job from the moment it is flagged, and the call is what starts that job; it is also the crew's check-in — a syringe in the wrack is a bad moment, and saying so on the radio is part of the survey, with the LIUNA or AFSCME member assistance line there for whatever the drive home does not settle.",
    },
    {
      id: "survey-log", kind: "select", target: "survey-log",
      title: "Write the survey log",
      cue: "Log the start and length, the strandline reading, counts by category, the sharps to the kit, the unknown's position and the call, the quadrat and the jar's slot, the wind, and the window.",
      why: "The shoreline record the Regional Water Quality Control Board's conditions and the programme's own reporting draw on is this log, and so is the chain from a jar in the case to a number on a bench. It is written at the truck with the card, the case and the kit in view, so what went home matches what the beach gave up.",
    },
  ],

  interrupts: [
    {
      id: "syringe-in-the-wrack",
      kind: "Syringe in the wrack line",
      after: "walk-transect", delay: 2, seconds: 14,
      alert: "A syringe with its needle on has turned up in the wrack a step ahead of you, half under a strand of kelp.",
      cue: "Stop, take the tongs and lift it into the sharps container — never a hand, never a bag.",
      target: "sharps-tongs",
      why: "A needle in the wrack is the injury 29 CFR 1910.1030 is written for, and the method is fixed so nobody decides it on the sand: the tongs lift it, the container takes it, the tally records it. A surveyor who steps over it to keep the pace leaves it for the second surveyor, a child or a dog, and one who picks it up gloved has bet a glove against a needle.",
      missNote: "You kept the pace and stepped past it; the second surveyor, walking the seaward zone, found it with a boot, and the survey ended at the clinic instead of the truck.",
      wrongNote: "Not that. The tongs — lift it into the sharps container and tally it.",
    },
    {
      id: "wind-lifting-samples",
      kind: "Gust lifting the sample table",
      after: "rinse-hold", delay: 2, seconds: 14,
      alert: "A gust has come down the beach — the tally card is lifting off the table and the empty jars are rolling toward the sand.",
      cue: "Latch the sample case lid over the jars and the card before the next gust takes them.",
      target: "case-lid",
      why: "Everything the survey has produced is paper and small jars on a folding table on a beach in wind, and one gust puts the tally in the surf and sand in every open jar. The case lid is the answer because it is one motion that covers all of it; the rinse can wait the seconds it takes, the tally card cannot be walked back from the water.",
      missNote: "The next gust took the tally card into the surf and rolled two labelled jars into the sand; the transect was walked again from the start with the tide already on the lower zone.",
      wrongNote: "Not that. The case lid — latch it over the jars and the card before the next gust.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MESD_ACCENT);

    // ------------------------------------------------------- beach, water, wrack, riprap
    const sandTex = surfaceTexture((cx, w, h) => sandFace(cx, w, h, {}), { repeat: 4, px: 256 });
    const beach = box(g, 6.6, 0.04, 4.4, 0, -0.02, -1.0, 0xffffff, { cast: false });
    beach.material = texturedMat(sandTex, { rough: 1, metal: 0, color: 0xc9b58c });
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#1c3a44", mid: "#254a54", base2: "#17303a" }), { repeat: 4, px: 256 });
    const water = box(g, 6.6, 0.03, 2.0, 0, 0.0, 2.4, 0x254a54, { cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x3a7a88 });
    water.material.transparent = true; water.material.opacity = 0.86;
    for (let i = 0; i < 5; i++) { const f = box(g, 1.2, 0.01, 0.08, -2.6 + i * 1.3, 0.02, 1.45, 0xeef4f6, { rough: 0.3, opacity: 0.6, transparent: true, cast: false }); f.rotation.y = 0.05; }
    // Wrack line along the beach.
    for (let i = 0; i < 22; i++) { const w = box(g, 0.2 + (i % 3) * 0.1, 0.03, 0.08, -3.0 + i * 0.29, 0.015, 0.7 + Math.sin(i) * 0.12, [0x4a3a24, 0x5a4a2c, 0x3a3020][i % 3], { rough: 0.95 }); w.rotation.y = i * 0.6; }
    // Debris along the transect: bottles, caps, a tyre, foam, a cup.
    const debris = [];
    for (let i = 0; i < 12; i++) {
      const x = -2.6 + i * 0.45, z = -0.2 + Math.sin(i * 1.7) * 0.7;
      const d = i % 4 === 0 ? cyl(g, 0.03, 0.03, 0.18, x, 0.03, z, [0x2f6f4a, 0xa8c8c0, 0x6a4a2a][i % 3], { rough: 0.15, opacity: 0.8, transparent: true, seg: 8 })
        : i % 4 === 1 ? cyl(g, 0.02, 0.02, 0.012, x, 0.006, z, [0xd2312b, 0x2b5aa8, 0xf2c14b][i % 3], { rough: 0.5, seg: 10 })
        : i % 4 === 2 ? box(g, 0.08, 0.06, 0.08, x, 0.03, z, 0xf4f6f6, { rough: 0.9 })
        : cyl(g, 0.035, 0.028, 0.09, x, 0.045, z, 0xdfe6ea, { rough: 0.6, seg: 10 });
      if (i % 4 === 0) d.rotation.z = Math.PI / 2;
      debris.push(d);
    }
    const tyre = torus(g, 0.25, 0.08, 1.8, 0.08, -1.6, 0x15181c, { rough: 0.9, seg: 8, seg2: 18 });
    tyre.rotation.x = Math.PI / 2 - 0.3;
    const riprap = group(g, 2.6, 0, -0.8);
    for (let i = 0; i < 9; i++) ball(riprap, 0.2 + (i % 3) * 0.06, (i % 3) * 0.3 - 0.3, 0.1 + Math.floor(i / 3) * 0.22, -0.4 + Math.floor(i / 3) * 0.3, [0x6a6a62, 0x7a7a70, 0x5a5a52][i % 3], { rough: 1, seg: 7, seg2: 5 });
    const climbHit = box(riprap, 0.6, 0.6, 0.6, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(riprap, "climb the rocks for it?", 0, 1.0, 0, { css: MESD_WARN, w: 0.42 });
    reg(hits, climbHit, "climb-the-riprap");
    const bareHit = box(g, 0.5, 0.3, 0.4, -1.2, 0.15, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach in bare-handed?", -1.2, 0.45, 0.7, { css: MESD_WARN, w: 0.4 });
    reg(hits, bareHit, "bare-hand-in-the-wrack");
    const kickHit = box(g, 0.5, 0.3, 0.4, 0.6, 0.15, 1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "kick it into the surf?", 0.6, 0.45, 1.1, { css: MESD_WARN, w: 0.4 });
    reg(hits, kickHit, "kick-it-into-the-water");

    // ------------------------------------------------------- the transect tape, stakes, walk
    const startStake = group(g, -2.8, 0, -0.1);
    cyl(startStake, 0.015, 0.015, 0.7, 0, 0.35, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    box(startStake, 0.1, 0.07, 0.006, 0.05, 0.62, 0, 0xf06a2b, { rough: 0.6 });
    holoTag(startStake, "start stake", 0, 0.85, 0, { css: MESD_CSS, w: 0.24 });
    const tape = box(g, 5.2, 0.004, 0.02, -0.2, 0.06, -0.1, 0xf2e6b8, { rough: 0.6 });
    const tapeHead = instrument(g, 0.3, 0.1, 0.35, { idle: "-- tape", color: MESD_ACCENT, w: 0.13, d: 0.19 });
    holoTag(g, "transect tape — strandline", 0.3, 0.35, 0.35, { css: MESD_CSS, w: 0.48 });
    reg(hits, tapeHead, "transect-tape");
    void tape;
    const walkHit = box(g, 4.4, 0.2, 0.5, -0.2, 0.1, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk the transect — tally", -0.2, 0.4, -0.5, { css: MESD_CSS, w: 0.46 });
    reg(hits, walkHit, "transect-walk");
    const second = standingFigure(g, -1.6, 1.0, { ry: 1.4, cloth: 0x4a4a3a, vest: 0xf2c14b, atStation: true });
    const secondHome = second.position.clone();
    // Flagged hazards.
    const container = group(g, 1.3, 0, -0.6, 0.4);
    cyl(container, 0.09, 0.09, 0.22, 0, 0.11, 0, 0x2b5aa8, { rough: 0.6, seg: 12 });
    box(container, 0.08, 0.06, 0.004, 0, 0.12, 0.092, 0xc9c2ac, { rough: 0.9 });
    holoTag(container, "sealed — no label", 0, 0.42, 0, { css: MESD_CSS, w: 0.32 });
    reg(hits, container, "unknown-container");
    const hazFlag = group(container, 0.2, 0, 0);
    cyl(hazFlag, 0.006, 0.006, 0.4, 0, 0.2, 0, 0x8a949d, { rough: 0.5, seg: 5 });
    box(hazFlag, 0.08, 0.06, 0.006, 0.04, 0.38, 0, 0xd2312b, { rough: 0.6 });
    hazFlag.visible = false;
    const tangle = group(g, -0.6, 0, 0.5);
    for (let i = 0; i < 4; i++) torus(tangle, 0.1 + i * 0.03, 0.003, 0.04 * i, 0.03 + i * 0.01, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.7, transparent: true, cast: false, seg: 4, seg2: 16 }).rotation.set(0.5 * i, 0.4 * i, 0);
    for (let i = 0; i < 3; i++) box(tangle, 0.02, 0.03, 0.004, 0.05 * i, 0.05, 0.05, 0x8a949d, { rough: 0.4, metal: 0.7 });
    holoTag(tangle, "line and hooks", 0, 0.3, 0, { css: MESD_CSS, w: 0.28 });
    reg(hits, tangle, "line-tangle");
    const syringe = group(g, -0.2, 0, 0.75);
    cyl(syringe, 0.008, 0.008, 0.1, 0, 0.01, 0, 0xf4f6f6, { rough: 0.3, opacity: 0.8, transparent: true, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(syringe, 0.002, 0.002, 0.04, 0.07, 0.01, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 5 }).rotation.z = Math.PI / 2;
    syringe.visible = false;

    // ------------------------------------------------------- the quadrat and the sieve table
    const frame = group(g, 0.8, 0, 0.3);
    for (const sx of [-0.25, 0.25]) { const t = cyl(frame, 0.012, 0.012, 0.5, sx, 0.03, 0, 0xf4f6f6, { rough: 0.45, seg: 8 }); t.rotation.x = Math.PI / 2; }
    for (const sz of [-0.25, 0.25]) { const t = cyl(frame, 0.012, 0.012, 0.5, 0, 0.03, sz, 0xf4f6f6, { rough: 0.45, seg: 8 }); t.rotation.z = Math.PI / 2; }
    const scoop = group(frame, 0, 0.06, 0);
    box(scoop, 0.12, 0.05, 0.1, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    cyl(scoop, 0.01, 0.01, 0.2, 0.12, 0.02, 0, 0xc9b58c, { rough: 0.8, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(frame, "quadrat — scoop", 0, 0.4, 0, { css: MESD_CSS, w: 0.32 });
    reg(hits, scoop, "quadrat-scoop");
    const table = group(g, -1.6, 0, -1.6);
    box(table, 1.2, 0.04, 0.6, 0, 0.72, 0, 0x6f6248, { rough: 0.8, finish: "brushed" });
    for (const [sx, sz] of [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]]) cyl(table, 0.015, 0.015, 0.7, sx, 0.35, sz, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const stack = group(table, -0.3, 0.74, 0);
    for (let i = 0; i < 4; i++) cyl(stack, 0.14, 0.14, 0.06, 0, 0.03 + i * 0.065, 0, [0x8a949d, 0xa0a8ae, 0x8a949d, 0xa0a8ae][i], { rough: 0.4, metal: 0.7, seg: 18 });
    holoTag(stack, "sieve stack", 0, 0.5, 0, { css: MESD_CSS, w: 0.24 });
    reg(hits, stack, "sieve-stack");
    const crank = valveWheel(table, 0.0, 0.85, -0.2, { r: 0.07, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(table, "shaker crank", 0.0, 1.1, -0.2, { css: MESD_CSS, w: 0.26 });
    reg(hits, crank.userData.wheel, "sieve-crank");
    const jar = group(table, 0.3, 0.74, 0.1);
    cyl(jar, 0.05, 0.05, 0.12, 0, 0.06, 0, 0xdfe6ea, { rough: 0.15, opacity: 0.6, transparent: true, seg: 14 });
    const jarCap = cyl(jar, 0.052, 0.052, 0.02, 0, 0.13, 0, 0x1b1e22, { rough: 0.5, seg: 14 });
    box(jar, 0.05, 0.04, 0.004, 0, 0.06, 0.052, 0xf2c14b, { rough: 0.6 });
    holoTag(jar, "sample jar", 0, 0.3, 0, { css: MESD_CSS, w: 0.22 });
    reg(hits, jar, "sample-jar");
    const rinseHold = torus(table, 0.16, 0.01, -0.3, 1.1, 0.3, MESD_ACCENT, { emissive: MESD_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    rinseHold.rotation.x = Math.PI / 2;
    const rinseBottle = cyl(table, 0.04, 0.04, 0.2, -0.3, 1.2, 0.3, 0xf4f6f6, { rough: 0.5, seg: 12 });
    void rinseBottle;
    holoTag(table, "hold under the rinse", -0.3, 1.35, 0.3, { css: MESD_CSS, w: 0.36 });
    reg(hits, rinseHold, "rinse-hold");
    const residue = group(table, 0.5, 0.74, -0.15);
    cyl(residue, 0.05, 0.05, 0.12, 0, 0.06, 0, 0xdfe6ea, { rough: 0.15, opacity: 0.6, transparent: true, seg: 14 });
    for (let i = 0; i < 5; i++) box(residue, 0.012, 0.008, 0.012, (i - 2) * 0.015, 0.01, (i % 2) * 0.015, [0xd2312b, 0x2b5aa8, 0xf4f6f6, 0x59c97b, 0xf2c14b][i], { rough: 0.5, cast: false });
    holoTag(residue, "residue jar — cap it", 0, 0.3, 0, { css: MESD_CSS, w: 0.36 });
    reg(hits, residue, "residue-jar");
    const openHit = box(table, 0.3, 0.3, 0.3, 0.3, 1.0, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "leave the jar open?", 0.3, 1.25, 0.35, { css: MESD_WARN, w: 0.36 });
    reg(hits, openHit, "open-jar-in-the-wind");
    const sampleCase = group(g, -2.6, 0, -0.9);
    box(sampleCase, 0.5, 0.3, 0.36, 0, 0.15, 0, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 4; i++) cyl(sampleCase, 0.05, 0.05, 0.04, -0.15 + i * 0.1, 0.32, 0, 0x3a3f45, { rough: 0.6, seg: 12 });
    const caseLid = box(sampleCase, 0.52, 0.04, 0.38, 0, 0.44, -0.17, 0xe8b02e, { rough: 0.55 });
    caseLid.rotation.x = -1.3;
    holoTag(sampleCase, "sample case", 0, 0.7, 0, { css: MESD_CSS, w: 0.24 });
    reg(hits, sampleCase, "sample-case");
    holoTag(sampleCase, "case lid — latch", 0.3, 0.55, -0.2, { css: "#f06a2b", w: 0.3 });
    reg(hits, caseLid, "case-lid");
    const tallyCard = decal(table, 0.2, 0.26, 0.15, 0.75, 0.2, paperFace("TALLY", ["Plastic · foam · glass", "Metal · line · other"], { bg: "#f4f6f6", band: MESD_CSS }), { px: 160 });
    tallyCard.rotation.x = -Math.PI / 2;
    const tallyHome = tallyCard.position.clone();
    const tallyCols = [];
    for (let i = 0; i < 3; i++) { const c = box(table, 0.05, 0.004, 0.2, 0.1 + i * 0.05, 0.755, 0.2, [0xd9a441, 0x59c97b, 0x6fb0d6][i], { rough: 0.5, emissive: [0xd9a441, 0x59c97b, 0x6fb0d6][i], ei: 0.5, opacity: 0.4, transparent: true, cast: false }); tallyCols.push(c); }
    reg(hits, tallyCols[0], "tally-count"); reg(hits, tallyCols[1], "tally-photo"); reg(hits, tallyCols[2], "tally-position");

    // ------------------------------------------------------- kit, sharps, boards, radio
    const kit = group(g, -2.6, 0, 0.6);
    box(kit, 0.5, 0.3, 0.4, 0, 0.15, 0, 0x4a4a3a, { rough: 0.8 });
    const gloves = box(kit, 0.12, 0.05, 0.16, -0.12, 0.33, 0, 0xd8a63a, { rough: 0.7 });
    const vest = box(kit, 0.22, 0.28, 0.08, 0.15, 0.45, 0, 0xf2c14b, { rough: 0.7 });
    const sharps = box(kit, 0.12, 0.16, 0.1, 0.3, 0.38, 0.1, 0xd2312b, { rough: 0.6 });
    decal(kit, 0.08, 0.05, 0.3, 0.4, 0.151, signFace("SHARPS", { bg: "#d2312b", accent: "#ffffff", fg: "#ffffff", scale: 0.5 }));
    const tongs = group(kit, 0.42, 0.34, 0.1, 0.3);
    for (const dx of [-0.01, 0.01]) box(tongs, 0.008, 0.26, 0.008, dx, 0.13, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    holoTag(kit, "gloves · vest · sharps kit", 0, 0.75, 0, { css: MESD_CSS, w: 0.46 });
    holoTag(kit, "tongs", 0.42, 0.65, 0.1, { css: "#d2312b", w: 0.16 });
    reg(hits, gloves, "gloves-on"); reg(hits, vest, "vest-on"); reg(hits, sharps, "sharps-kit"); reg(hits, tongs, "sharps-tongs");
    const planBoard = holoPanel(g, 0.9, 0.6, -2.4, 1.5, -2.2, (cx, w, h) => {
      cx.fillStyle = "#1a160c"; cx.fillRect(0, 0, w, h); cx.fillStyle = MESD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f7efd8"; cx.fillText("SHORELINE PROTOCOL — TRANSECT T-1", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e8";
      ["Start stake · length per protocol · two zones", "Tally by category; nothing moved seaward", "Sharps by tongs to the kit; unknowns flagged",
       "Quadrat at the strandline · QA/G-5 plan", "Window per NOAA tides · USFWS buffer upper beach"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.5, accent: MESD_ACCENT });
    reg(hits, planBoard, "protocol-board");
    const logPanel = holoPanel(g, 0.5, 0.32, 2.3, 1.3, 0.8, mesdLog(["T-1 · strandline · tallies", "Pending"]), { ry: -0.6, accent: MESD_ACCENT });
    reg(hits, logPanel, "survey-log");
    const radioGrp = group(g, 2.0, 0.55, 1.2);
    const rad = radio(radioGrp, 0, 0, 0, {});
    holoTag(radioGrp, "coordinator radio", 0, 0.28, 0, { css: MESD_CSS, w: 0.34 });
    reg(hits, rad, "crew-radio");
    const bufferFlags = group(g, 0, 0, -2.5);
    for (let i = 0; i < 5; i++) { cyl(bufferFlags, 0.008, 0.008, 0.5, -2.4 + i * 1.2, 0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 }); box(bufferFlags, 0.1, 0.07, 0.006, -2.35 + i * 1.2, 0.48, 0, 0xf4f6f6, { rough: 0.6 }); }
    holoTag(bufferFlags, "upper beach buffer — stay below", 0, 0.75, 0, { css: MESD_CSS, w: 0.56 });
    for (let i = 0; i < 6; i++) { const b = ball(g, 0.05, -2.6 + i * 0.9, 2.3 + Math.sin(i) * 0.3, -2.9, 0xdfe6ea, { rough: 0.6, seg: 6, seg2: 5 }); b.scale.set(1.6, 0.6, 0.8); }

    const wmap = water.material.map;
    let gust = false, walking = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.6, -0.4),
      onStep(step) { if (step?.id === "walk-transect") walking = true; },
      onStepComplete(step) {
        if (step.id === "walk-transect") walking = false;
        if (step.id === "find-hazards") { hazFlag.visible = true; tangle.position.set(-2.3, 0.4, 0.7); tangle.scale.set(0.5, 0.5, 0.5); }
        if (step.id === "quadrat-chain") { scoop.visible = false; jarCap.position.y = 0.13; }
        if (step.id === "rinse-hold") residue.children[0].material = mat(0xcfe0e6, { rough: 0.15, opacity: 0.7, transparent: true });
        if (step.id === "jar-residue") { residue.position.set(-2.55, 0.32, -0.9); }
        if (step.id === "tally-card") repaint(tallyCard, paperFace("TALLY", ["Categories totalled", "Photos 1–4 · start · quadrat"], { bg: "#f4f6f6", band: "#59c97b" }));
        if (step.id === "coordinator-call") rad.userData.show?.("UNKNOWN FLAGGED\nCREW OK");
        if (step.id === "survey-log") repaint(logPanel.userData.face, mesdLog(["T-1 · strandline read · tallies totalled", "Syringe to kit · unknown flagged · jar racked"], "#59c97b"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "syringe-in-the-wrack") { syringe.visible = true; second.position.set(-0.6, 0, 1.2); }
        if (it.id === "wind-lifting-samples") { gust = true; tallyCard.position.y = 1.0; tallyCard.rotation.z = 0.4; }
      },
      onInterruptEnd(it) {
        if (it.id === "syringe-in-the-wrack") { syringe.visible = false; second.position.copy(secondHome); }
        if (it.id === "wind-lifting-samples") { gust = false; tallyCard.position.copy(tallyHome); tallyCard.rotation.z = 0; if (it.resolved === "answered") { caseLid.rotation.x = 0; caseLid.position.set(0, 0.36, 0); } }
      },
      animate(t, dt, session) {
        if (wmap?.offset) { wmap.offset.x = t * 0.005; wmap.offset.y = t * 0.007; }
        if (gust) { tallyCard.position.x = 0.15 + Math.sin(t * 6) * 0.1; }
        if (walking) second.position.x = Math.min(2.0, second.position.x + dt * 0.15);
        debris.forEach((d, i) => { if (i % 4 === 2) d.position.y = 0.03 + Math.abs(Math.sin(t * 2 + i)) * (gust ? 0.06 : 0.005); });
        const step = session?.step;
        if (session?.turn && step?.id === "shake-stack") { crank.userData.wheel.rotation.y = session.turn.amount * 5; stack.position.x = -0.3 + Math.sin(session.turn.amount * 40) * 0.01; }
        if (session?.gauge && !session.gauge.committed && step?.id === "tape-strandline") {
          const gt = session.gauge.t ?? 0;
          repaint(tapeHead.userData.screen, signFace(gt < 0.42 ? "short" : gt <= 0.6 ? "strandline" : "past", { bg: "#0d1c24", accent: gt >= 0.42 && gt <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
