import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, waterFace, mudflatFace,
} from "../citykit.js";
import { woodGrainFace, gratingFace } from "../../../shared/textures.js";
import { skiff } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Scientific Scuba: Buddy Check & Lost-Buddy Drill — commercial
// diving and scientific scuba pack, DIVE1.
//
// A timber research float on the Bay with the survey skiff (the fleet kit's
// skiff) alongside, the descent line and its buoy, the dive slate with the
// plan, two scientific divers kitting up on the bench — the learner and their
// buddy — the surface tender at the skiff's console, the transect reel, the
// surface marker buoy, the fin bin and the dive log. The learner is a
// scientific diver on an agency or university programme: the BWRAF-style
// buddy check, the descent on the line, a buddy's ear problem, the transect
// start, and the lost-buddy procedure worked as the plan says — look, ascend,
// signal, reunite. No depth, time, gas or search limit is a number; the
// programme's diving safety manual and the dive plan hold them.

const CDSB_ACCENT = 0x62c6b8;
const CDSB_CSS = "#62c6b8";

export const SIM_CD_SCIENTIFIC_SCUBA_BUDDY_CHECK_AND_LOST_BUDDY_DRILL = {
  id: "cd-scientific-scuba-buddy-check-and-lost-buddy-drill",
  index: "720",
  domain: "Maritime & Ports",
  trade: "Scientific scuba diver on an agency survey programme, with a dive buddy, the surface tender in the skiff and the programme's dive safety officer as the supervisor of the day",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "The programme's diving safety manual and its diving control board, as the scientific diving community's own standard; OSHA 29 CFR 1910 Subpart T where the dive falls under it — 29 CFR 1910.424 SCUBA diving (the buddy system, the standby diver and the tended or line-guided dive), 29 CFR 1910.421 pre-dive planning and briefing, 29 CFR 1910.422 procedures during the dive (water entry and exit, the termination of the dive) and 29 CFR 1910.423 post-dive procedures; ADCI consensus standards where a contractor's crew supports the survey; USCG 33 CFR 83 for the skiff's lights and the dive flag on the water; every depth, time and gas limit per the dive plan",
  name: "Scientific Scuba: Buddy Check & Lost-Buddy Drill",
  title: simTitle("Scientific Scuba: Buddy Check & Lost-Buddy Drill"),
  tagline: "Two divers, one plan: the slate read for the task and the lost-buddy rule, the buddy check run in order from buoyancy to the final OK, the loose tank band and the missing cutter found, the descent line clipped to its buoy, the OK given to the tender, the descent held to the buddy's pace through an ear problem, the transect start held while the buddy lays tape, the buddy lost from view and the drill worked — look for the plan's time, ascend on the line, deploy the marker, signal the skiff, reunite — then fins in the bin and the log written",
  accent: CDSB_ACCENT,
  accentCss: CDSB_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "never-lost-twice", name: "Never Lost Twice", note: "The buddy check run in order and the lost-buddy drill worked exactly as the plan wrote it, without a search past its time" },

  supportLine: "your programme's dive safety officer and your union's member assistance programme, with the employer's employee assistance line behind them",

  game: system({
    name: "Buddy Line",
    currency: "SLATE MARKS",
    ranks: ["Diver in Training", "Scientific Diver", "Lead Diver", "Divemaster of the Day", "Buddy Drill Certified"],
    badges: [
      { id: "bwraf-in-order", name: "In Order", note: "The buddy check run from buoyancy to the final OK without a skip", test: AWARD.stepClean("buddy-check") },
      { id: "plan-time", name: "The Plan's Time", note: "The lost-buddy look committed inside the plan's band first time", test: AWARD.precise(0.7) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No hazard reached for from the slate to the log", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-dive", name: "Clean Dive", note: "No corrections from the slate to the check-in", test: AWARD.clean },
      { id: "buddys-pace", name: "Buddy's Pace", note: "The descent held to the buddy the whole way", test: AWARD.unbroken },
      { id: "logged-quick", name: "Logged Quick", note: "Dive log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-buddy-check": "You went to roll off the float with your buddy because you have dived together all season and the check felt like a formality. The check finds the tank band that is loose today and the air that was not turned on this morning, and it finds them on the float where they are fixed in a minute rather than in the water where they end the dive. Every dive, in the same order, out loud, with hands on the other diver's gear.",
    "swim-up-fast": "You started straight up for the surface, fast, as soon as you realised your buddy was gone. A fast ascent with a held breath or without the line is how a diver who has lost a buddy becomes a diver with an injury of their own, and it puts you on the surface far from where the buddy will come up. The lost-buddy procedure has a controlled ascent on the line for a reason: two problems are worse than one.",
    "search-longer": "You kept looking for your buddy past the time the plan gives because it felt wrong to leave. The plan's search time is short by design: two divers looking for each other underwater move away from each other, and the longer both look the further apart they get. The plan says look for its time, then ascend, because the surface is the one place both of you will certainly go.",
    "ditch-weights": "You reached for your weight release to get to the surface quicker during the drill. Dropping weights turns a controlled ascent into an uncontrolled one, and weights on the bottom are a dive that cannot be resumed and a recovery job for someone. The weight release is for an emergency where you cannot otherwise reach the surface; a lost buddy is a procedure, not that emergency.",
  },

  lateNotes: {
    "descent-line-hands": "The descent begins once both divers have checked each other and given the OK.",
    "transect-start": "The transect starts once both divers are down on the line together.",
    "dive-log": "The log is written once both divers are out of the water.",
  },

  steps: [
    {
      id: "dive-brief", kind: "select", target: "dive-slate",
      title: "Read the dive plan on the slate with your buddy",
      cue: "On the float with your buddy: the survey task and the transect, the limits per the plan, the descent and ascent on the line, the hand signals, and the lost-buddy rule — look for the plan's time, then ascend and meet at the surface.",
      why: "A scientific dive is planned by the programme's diving safety manual and briefed on the float so both divers carry the same plan, because a buddy pair with two ideas of the lost-buddy rule is a pair that will not find each other. 29 CFR 1910.421 has the dive planned and the team briefed; the slate makes the plan a thing both divers can point at underwater when memory and the cold disagree.",
    },
    {
      id: "buddy-check", kind: "sequence",
      targets: ["bcd-inflate", "weight-release", "releases-clips", "air-check", "final-ok"],
      itemNames: { "bcd-inflate": "buoyancy — the BCD inflates and dumps", "weight-release": "weights — where they are and how they release", "releases-clips": "releases — every buckle and clip found", "air-check": "air — valve open, breathe the regulator, read the gauge", "final-ok": "final OK — mask, fins, slate, nothing dangling" },
      title: "Run the buddy check in order on your buddy",
      cue: "On your buddy, out loud and in order: buoyancy, weights, releases, air, final OK — hands on each item, then swap and let them do the same to you.",
      why: "The check runs in the same order every time so nothing is skipped when the boat is rolling and the tender is waiting: buoyancy that inflates and dumps, weights you can find and release on the other diver, every buckle, the air on and breathed with the gauge read, and a last look for the dangling hose. 29 CFR 1910.424 has scuba divers work in pairs for exactly the moments this check prepares for.",
      outOfOrderNote: "Out of order — the check runs buoyancy, weights, releases, air, final OK, so nothing is skipped.",
    },
    {
      id: "gear-faults", kind: "find", noHint: true,
      targets: ["loose-tank-band", "no-cutter"],
      itemNames: { "loose-tank-band": "buddy's tank band loose on the cylinder", "no-cutter": "buddy's cutting tool missing from its sheath" },
      itemNotes: {
        "loose-tank-band": "The cam band round your buddy's cylinder has not been cinched — the tank slides in the band with a push. In the water it drops down their back and pulls the regulator out of their mouth.",
        "no-cutter": "Your buddy's cutter sheath is empty. A survey line, a transect tape or a piece of derelict gear on the bottom can hold a diver, and the tool that frees them is on the bench.",
      },
      title: "Find what the check turned up",
      cue: "Go over your buddy's rig once more with the check in mind: the tank band, the cutter, the hoses routed and clipped, nothing left on the bench.",
      why: "The buddy check is a procedure and this is what it is for: the things that are wrong today on a rig that was right yesterday. A tank band that slides drops the cylinder down a diver's back at the first roll and takes the regulator with it; a diver without a cutter on a survey with tapes and lines has no way out of the entanglement the survey itself creates. Both are fixed on the bench before either diver's feet leave it.",
    },
    {
      id: "rig-descent-line", kind: "drag", target: "line-weight",
      title: "Clip the descent line to its buoy",
      cue: "Take the weighted descent line and clip it to the marker buoy's ring, then set the buoy off the float where the plan puts the transect start.",
      why: "The line is the pair's road down and back up: descend on it and both divers arrive at the same place at the same pace; lose a buddy and it is where both ascend to. 29 CFR 1910.424 has a scuba diver line-tended or accompanied, and the descent line is the accompaniment made solid. It is clipped to the buoy so the tender in the skiff can see the top of it and the divers can find the bottom of it.",
      drag: { to: "buoy-ring", radius: 0.5, missNote: "Not on the buoy — the descent line clips to the marker buoy's ring so both ends can be found." },
    },
    {
      id: "entry-ok", kind: "select", target: "ok-signal",
      title: "Enter and give the OK to the tender",
      cue: "Enter the water together as the plan says, surface, and give the tender in the skiff the OK signal — arm on the head — before either of you descends.",
      why: "The tender at the surface knows the divers are in and all right only from the signal, and a pair that descends without giving it leaves the tender counting bubbles and wondering. The OK is given at the surface by both divers and returned by the tender, so the three people on the dive agree on the moment it began; 29 CFR 1910.422 has entry and exit procedures for exactly this hand-off.",
    },
    {
      id: "descent", kind: "track", target: "descent-line-hands", seconds: 6,
      title: "Descend on the line at your buddy's pace",
      cue: "Hand on the line, face to face with your buddy, descend together — equalising as you go, stopping when they stop, never dropping below them.",
      why: "The descent is done at the slower diver's pace, because a diver who cannot clear an ear or who is fighting buoyancy cannot also chase a buddy who has gone ahead. Face to face on the line each sees the other's signals and eyes; a buddy below and looking down is a buddy who cannot be told anything. The line keeps the pair together and puts them both at the transect start rather than somewhere near it.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "DESCENT", readout: (v) => (v < 0.42 ? "holding back above them" : v > 0.62 ? "dropping below your buddy" : "with your buddy on the line") },
      holdBreakNote: "You lost your buddy's pace — above them or below them. Back face to face on the line.",
    },
    {
      id: "transect-start", kind: "hold", target: "transect-start", seconds: 5,
      title: "Hold the transect start while your buddy lays the tape",
      cue: "At the bottom of the line, hold your position at the transect's start pin while your buddy swims out laying the tape — watching them, keeping the line's bottom in reach.",
      why: "The survey needs one diver at the start and one laying the tape, and the diver at the start is the anchor: they hold the position, watch the buddy's light and bubbles, and are the point the buddy returns to. Holding still is the skill — a diver who drifts off the start to help lays a crooked tape and loses the reference both need; a diver who stops watching is the one who looks up to find the buddy gone.",
      holdBreakNote: "You drifted off the start pin — the transect's reference is gone. Hold your position and watch your buddy.",
    },
    {
      id: "lost-buddy-look", kind: "gauge", target: "look-around",
      title: "Look for your buddy for the time the plan gives — no longer",
      cue: "Turn slowly through a full circle looking for bubbles, a light and the tape, and commit when you have looked for the time the plan gives — then stop looking.",
      why: "The lost-buddy procedure begins with a short look because most lost buddies are a few metres away behind a pile or a kelp frond, and it ends the look on the plan's time because two divers searching move apart. The gauge is the plan's time and nothing else: shorter and a buddy in reach is left; longer and both divers are now lost from each other and from the line. The plan's time is the whole discipline.",
      gauge: { label: "LOOK — PLAN'S TIME", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "not yet the plan's time" : t <= 0.62 ? "the plan's time — ascend" : "past the plan's time"), missNote: "Outside the band — look for the time the plan gives, then stop and ascend." },
    },
    {
      id: "deploy-smb", kind: "turn", target: "smb-reel",
      title: "Ascend on the line and send up the surface marker",
      cue: "Back to the line, ascend at the plan's rate with your hand on it, and unspool the surface marker buoy's reel ahead of you so the tender sees where you are coming up.",
      why: "The ascent after a lost buddy is a controlled one on the line — the line is the one place both divers know — and the marker goes up ahead so the tender in the skiff sees a diver coming before they see a head. A marker at the surface tells the tender which diver this is and where, and it keeps the skiff and any passing craft off the spot; the reel is unspooled steadily so the line does not tangle the diver sending it.",
      turn: { turns: 1.2, label: "SMB REEL", readout: (t) => (t < 0.35 ? "reel closed" : t < 0.85 ? "unspooling — marker rising" : "marker at the surface") },
    },
    {
      id: "surface-signal", kind: "select", target: "surface-assist",
      title: "Signal the skiff from the surface",
      cue: "At the surface by the line, signal the tender: OK if you are, then 'one diver up — buddy separated' by the plan's signal, and hold at the buoy.",
      why: "The tender cannot see who is up and who is not until the divers tell them, and a diver at the surface without a signal is a diver the tender has to assume is in trouble. The plan's signal for a separated pair starts the surface's part of the procedure — the skiff comes to the buoy, the standby is readied, the time is noted — while the diver holds at the buoy where the buddy will surface too.",
    },
    {
      id: "reunite", kind: "select", target: "buddy-reunite",
      title: "Reunite with your buddy at the surface and decide the dive",
      cue: "Your buddy surfaces at the marker. Swap OKs, check each other, tell the tender both are up, and decide with the tender whether the plan allows a second descent or the dive is over.",
      why: "The procedure ends when both divers are at the surface and have checked each other, not when one of them is. Whether they go back down is the plan's decision and the tender's, made on the gas and time left and on why they were separated; a pair that drops straight back in to finish the tape has skipped the part of the procedure that keeps it from happening again. 29 CFR 1910.422 has the dive terminated when the plan says so.",
    },
    {
      id: "exit-fins", kind: "drag", target: "fins",
      title: "Exit the water and hand your fins to the tender",
      cue: "At the skiff's ladder, hand your fins up to the tender for the bin before you climb, then come up the ladder with a hand on each rail.",
      why: "Fins on a ladder are the commonest way a diver ends a dive with an injury: a fin catches a rung and the diver goes back into the water on top of the buddy behind them. They come off in the water and go up to the tender first, and the diver climbs with hands free; the tender takes the fins to the bin so they are not on the deck for the next person to stand on.",
      drag: { to: "fin-bin", radius: 0.5, missNote: "Not in the bin — fins go up to the tender first, then the ladder with both hands free." },
    },
    {
      id: "dive-log", kind: "select", target: "dive-log",
      title: "Write the dive log with your buddy",
      cue: "On the float: both divers' entries — the plan's limits, the times, the buddy check faults found, the ear problem, the separation and how the drill went, and the decision to end the dive.",
      why: "The programme's diving safety manual keeps a log of every dive, and 29 CFR 1910.423 has the record kept; the separation and the drill go in because the dive safety officer reads the logs for exactly those, and a drill that went well is as worth recording as one that did not. Both divers write it together so the two accounts agree before either forgets what the plan's time felt like.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with your buddy and the tender",
      cue: "At the team board: how the drill went from each side, the tank band and the cutter for the gear locker, the ear, and how everyone is.",
      why: "Losing a buddy underwater, even for the plan's short time, is frightening, and the check-in is where the pair say so and say what each did while apart; that is how a drill becomes a habit. The gear faults go to the locker so the next pair does not find them, and the programme's dive safety officer hears the whole thing before the log closes. The member assistance line is there for what the float does not settle.",
    },
  ],

  interrupts: [
    {
      id: "buddy-ear",
      kind: "Buddy signals an ear problem on the descent",
      after: "descent", delay: 2, seconds: 14,
      alert: "Your buddy has stopped on the line and is pointing at their ear — the signal for a problem clearing it.",
      cue: "Signal 'stop — hold', ascend a little on the line with them so they can try again, and go no deeper until they signal OK.",
      target: "buddy-hold-signal",
      why: "An ear that will not clear is a descent that stops for both divers: the buddy goes up a little on the line to take the pressure off and tries again, and their partner goes with them, because a diver left alone on the line while the other continues down is the separation the plan is trying to prevent. If it will not clear, the dive ends for both; nobody descends alone.",
      missNote: "The learner kept descending while the buddy hung on the line with an ear that would not clear; the pair were separated on the line before the transect had started.",
      wrongNote: "Signal 'stop — hold' and go up a little with them — the descent is at the slower diver's pace.",
    },
    {
      id: "buddy-lost",
      kind: "Buddy gone from view at the transect",
      after: "transect-start", delay: 2, seconds: 14,
      alert: "You look up from the start pin and your buddy is not on the tape — no light, no bubbles you can see.",
      cue: "Begin the lost-buddy procedure the plan wrote: stay at the start, start the plan's look, and do not swim off after them.",
      target: "start-procedure",
      why: "The first thing a diver does on losing a buddy decides whether they find each other: a diver who swims off after a guess is a second lost diver, and the pair's one fixed point — the start pin and the line — is abandoned. The procedure starts where the diver is, with the plan's short look, and the plan's ascent follows; it is a drill so that it is done without deciding anything.",
      missNote: "The learner swam out along the tape after the buddy and lost the line; both divers surfaced apart, out of sight of the skiff, and the tender had two markers to choose between.",
      wrongNote: "Start the procedure where you are — stay at the pin, begin the plan's look. Do not swim after them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CDSB_ACCENT);

    // ------------------------------------------------------- water, float, skiff
    const water = box(g, 12, 0.02, 12, 0, 0.012, -1.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0f3038", mid: "#164650" }), { repeat: 4, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8ab6c0 });
    const deck = box(g, 5.6, 0.12, 4.0, 0, 0.42, 0.8, 0xffffff, { rough: 0.85 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h), { repeat: 3, px: 512 }), { rough: 0.85, color: 0xb59a72 });
    box(g, 5.6, 0.36, 4.0, 0, 0.18, 0.8, 0x8a8f93, { rough: 0.7, cast: false });
    for (const [x, z] of [[-2.6, -1.0], [2.6, -1.0], [-2.6, 2.6], [2.6, 2.6]]) cyl(g, 0.16, 0.16, 1.6, x, 0.8, z, 0x4a3a28, { rough: 0.95, seg: 12 });
    for (const x of [-2.4, -1.2, 1.2, 2.4]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, 2.75, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(g, 5.2, 0.04, 0.04, 0, 1.45, 2.75, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    const boat = skiff(g, -3.6, -0.3, -0.4, { ry: Math.PI / 2, livery: { colour: 0xc8ced4, fleetName: "BAY SURVEY", unitNumber: "SK-3" } });
    void boat;
    const tender = standingFigure(g, -2.4, 0.9, { ry: -2.2, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    tender.position.y = 0.48;
    holoTag(tender, "surface tender", 0, 1.95, 0, { css: CDSB_CSS, w: 0.3 });
    const flag = group(g, -3.6, 1.6, 0.6);
    cyl(flag, 0.012, 0.012, 1.2, 0, 0, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 6 });
    box(flag, 0.3, 0.22, 0.01, 0.16, 0.5, 0, 0xd2312b, { rough: 0.7 });
    box(flag, 0.3, 0.05, 0.012, 0.16, 0.5, 0, 0xf4f8fb, { rough: 0.7 }).rotation.z = -0.6;
    holoTag(flag, "dive flag", 0.16, 0.75, 0, { css: CDSB_CSS, w: 0.2 });
    // Ladder off the float's edge.
    const ladder = group(g, 1.4, 0.48, -1.25);
    for (const x of [-0.22, 0.22]) box(ladder, 0.04, 1.6, 0.04, x, -0.2, 0, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    for (let i = 0; i < 5; i++) box(ladder, 0.44, 0.03, 0.04, 0, -0.8 + i * 0.3, 0, 0xc8ced4, { rough: 0.35, metal: 0.55 });
    const finBin = group(g, 2.3, 0.48, -0.6);
    const fbTop = box(finBin, 0.6, 0.04, 0.5, 0, 0.02, 0, 0xffffff, { rough: 0.7 });
    fbTop.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h), { px: 256 }), { rough: 0.7, metal: 0.5, color: 0x9aa2aa });
    for (const [x, z, w, d] of [[0, -0.24, 0.6, 0.03], [0, 0.24, 0.6, 0.03], [-0.29, 0, 0.03, 0.5], [0.29, 0, 0.03, 0.5]]) box(finBin, w, 0.3, d, x, 0.15, z, 0x2f4f6f, { rough: 0.6 });
    torus(finBin, 0.22, 0.01, 0, 0.32, 0, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(finBin, "fin bin", 0, 0.55, 0, { css: CDSB_CSS, w: 0.2 });
    reg(hits, finBin, "fin-bin");
    const fins = group(g, 1.4, 0.6, -0.5);
    for (const sx of [-0.08, 0.08]) box(fins, 0.12, 0.02, 0.5, sx, 0, 0, 0x1b1e22, { rough: 0.7 });
    holoTag(fins, "fins — off before the ladder", 0, 0.2, 0, { css: CDSB_CSS, w: 0.5 });
    reg(hits, fins, "fins");

    // ------------------------------------------------------- the bench, the buddy, the check
    const bench = group(g, 0.2, 0.48, 1.9);
    box(bench, 2.4, 0.08, 0.45, 0, 0.42, 0, 0x5b4a3a, { rough: 0.85 });
    for (const x of [-1.0, 1.0]) box(bench, 0.08, 0.4, 0.4, x, 0.2, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 3; i++) { const t = cyl(bench, 0.09, 0.09, 0.6, -0.8 + i * 0.4, 0.78, 0, i % 2 ? 0xf2c14b : 0xc8ccd0, { rough: 0.4, metal: 0.5, seg: 14 }); void t; }
    holoTag(bench, "kit bench — spare cylinders", 0, 1.3, 0, { css: CDSB_CSS, w: 0.5 });
    const buddy = standingFigure(g, -0.9, 0.6, { ry: 0.6, atStation: true, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    buddy.position.y = 0.48;
    holoTag(buddy, "your buddy", 0, 2.0, 0, { css: CDSB_CSS, w: 0.24 });
    const buddyHome = buddy.position.clone();
    const tank = cyl(buddy, 0.1, 0.1, 0.6, 0, 1.15, -0.2, 0xc8ccd0, { rough: 0.4, metal: 0.6, seg: 14 });
    void tank;
    const bcd = group(buddy, 0.22, 1.2, 0.1);
    box(bcd, 0.08, 0.14, 0.08, 0, 0, 0, 0x1f5fb8, { rough: 0.7 });
    holoTag(bcd, "B — buoyancy", 0, 0.2, 0, { css: CDSB_CSS, w: 0.26 });
    reg(hits, bcd, "bcd-inflate");
    const weights = group(buddy, 0, 0.85, 0.16);
    box(weights, 0.3, 0.06, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.8 });
    box(weights, 0.06, 0.06, 0.04, 0.1, 0, 0.04, 0xd2312b, { rough: 0.5 });
    holoTag(weights, "W — weights", 0.3, 0.1, 0, { css: CDSB_CSS, w: 0.24 });
    reg(hits, weights, "weight-release");
    const releases = group(buddy, -0.2, 1.1, 0.14);
    for (let i = 0; i < 3; i++) box(releases, 0.05, 0.03, 0.02, 0, i * 0.12, 0, 0x8a949d, { rough: 0.4, metal: 0.6 });
    holoTag(releases, "R — releases", -0.3, 0.3, 0, { css: CDSB_CSS, w: 0.26 });
    reg(hits, releases, "releases-clips");
    const air = group(buddy, 0, 1.55, -0.2);
    cyl(air, 0.03, 0.03, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.7, seg: 10 });
    hose(air, [[0, 0, 0], [0.2, -0.1, 0.15], [0.25, -0.3, 0.3]], 0.012, 0x1b1e22, { steps: 6, rough: 0.7 });
    const spg = cyl(air, 0.04, 0.04, 0.02, 0.25, -0.32, 0.3, 0xf1f3f4, { rough: 0.4, seg: 14 });
    void spg;
    holoTag(air, "A — air", 0, 0.2, 0, { css: CDSB_CSS, w: 0.18 });
    reg(hits, air, "air-check");
    const finalOk = group(buddy, 0, 1.7, 0.22);
    torus(finalOk, 0.1, 0.008, 0, 0, 0, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(finalOk, "F — final OK", 0, 0.18, 0, { css: CDSB_CSS, w: 0.26 });
    reg(hits, finalOk, "final-ok");
    const band = torus(buddy, 0.12, 0.015, 0, 1.0, -0.2, 0x1b1e22, { rough: 0.7, emissive: 0x3a1a0a, ei: 0.4, seg: 6, seg2: 18 });
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.9;
    reg(hits, band, "loose-tank-band");
    const sheath = box(buddy, 0.05, 0.14, 0.03, 0.14, 0.7, 0.12, 0x1b1e22, { rough: 0.7, emissive: 0x3a1a0a, ei: 0.4 });
    reg(hits, sheath, "no-cutter");
    const skipHit = box(g, 0.4, 0.4, 0.4, 0.4, 1.0, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just roll in — skip the check?", 0.4, 1.35, -1.1, { css: "#d2312b", w: 0.56 });
    reg(hits, skipHit, "skip-buddy-check");
    const slate = decal(g, 0.28, 0.22, 1.2, 1.05, 1.9, paperFace("DIVE PLAN", ["Transect · per plan", "Limits: per the plan", "Lost buddy: look · up · meet"], { bg: "#f3efe4", band: CDSB_CSS }), { px: 128 });
    slate.rotation.y = -0.4;
    holoTag(g, "dive slate", 1.2, 1.28, 1.9, { css: CDSB_CSS, w: 0.22 });
    reg(hits, slate, "dive-slate");

    // ------------------------------------------------------- descent line, buoy, transect, SMB
    const buoy = group(g, 0.6, 0.15, -3.0);
    ball(buoy, 0.3, 0, 0, 0, 0xf06a2b, { rough: 0.5, seg: 14, seg2: 10 });
    cyl(buoy, 0.02, 0.02, 0.6, 0, 0.4, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 6 });
    box(buoy, 0.2, 0.14, 0.01, 0.1, 0.65, 0, 0xd2312b, { rough: 0.7 });
    const buoyRing = torus(buoy, 0.08, 0.012, 0, -0.3, 0, 0x8a949d, { rough: 0.35, metal: 0.8, seg: 6, seg2: 14 });
    holoTag(buoy, "marker buoy — ring", 0, 0.9, 0, { css: CDSB_CSS, w: 0.36 });
    reg(hits, buoyRing, "buoy-ring");
    const lineWeight = group(g, -1.6, 0.6, -0.6);
    cyl(lineWeight, 0.08, 0.1, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.8, seg: 12 });
    for (let i = 0; i < 4; i++) torus(lineWeight, 0.12, 0.012, 0, 0.1 + i * 0.03, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(lineWeight, "descent line — weighted", 0, 0.4, 0, { css: CDSB_CSS, w: 0.44 });
    reg(hits, lineWeight, "line-weight");
    const lineDown = cyl(g, 0.012, 0.012, 3.0, 0.6, -1.5, -3.0, 0xf2c14b, { rough: 0.8, seg: 6 });
    lineDown.visible = false;
    const okRing = group(g, 0.2, 0.3, -2.2);
    torus(okRing, 0.14, 0.01, 0, 0, 0, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(okRing, "OK to the tender — arm on head", 0, 0.5, 0, { css: CDSB_CSS, w: 0.56 });
    reg(hits, okRing, "ok-signal");
    const lineHands = group(g, 0.6, 0.2, -2.6);
    for (let i = 0; i < 3; i++) { const chev = box(lineHands, 0.1, 0.012, 0.03, 0, -i * 0.08, 0, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.4, rough: 0.4, cast: false }); chev.rotation.x = 0.4; }
    holoTag(lineHands, "hand on the line — descend", 0, 0.3, 0, { css: CDSB_CSS, w: 0.5 });
    reg(hits, lineHands, "descent-line-hands");
    const holdSig = group(g, 1.2, 0.5, -2.4);
    box(holdSig, 0.06, 0.16, 0.04, 0, 0, 0, 0xf4f8fb, { rough: 0.6 });
    holoTag(holdSig, "signal stop — hold", 0, 0.24, 0, { css: CDSB_CSS, w: 0.36 });
    reg(hits, holdSig, "buddy-hold-signal");
    const startPin = group(g, -0.6, 0.06, -3.4);
    cyl(startPin, 0.02, 0.02, 0.4, 0, 0.2, 0, 0xf2c14b, { rough: 0.6, seg: 6 });
    torus(startPin, 0.3, 0.012, 0, 0.02, 0, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    holoTag(startPin, "transect start — hold here", 0, 0.7, 0, { css: CDSB_CSS, w: 0.5 });
    reg(hits, startPin, "transect-start");
    const tape = hose(g, [[-0.6, 0.06, -3.4], [-1.6, 0.06, -3.8], [-2.8, 0.06, -4.2]], 0.01, 0xf2c14b, { steps: 6, rough: 0.7 });
    tape.visible = false;
    const startProc = group(g, -0.2, 0.5, -3.2);
    torus(startProc, 0.1, 0.008, 0, 0, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    holoTag(startProc, "begin the procedure — stay", 0, 0.18, 0, { css: CDSB_CSS, w: 0.5 });
    reg(hits, startProc, "start-procedure");
    const lookRing = group(g, -0.6, 0.9, -3.4);
    const lookArrow = box(lookRing, 0.02, 0.02, 0.3, 0, 0, 0.15, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.4, rough: 0.4, cast: false });
    void lookArrow;
    holoTag(lookRing, "look — the plan's time", 0, 0.24, 0, { css: CDSB_CSS, w: 0.42 });
    reg(hits, lookRing, "look-around");
    const swimUpHit = box(g, 0.4, 0.4, 0.4, 0.2, 1.3, -3.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "straight up, fast?", 0.2, 1.65, -3.6, { css: "#d2312b", w: 0.36 });
    reg(hits, swimUpHit, "swim-up-fast");
    const longerHit = box(g, 0.4, 0.4, 0.4, -1.4, 0.9, -3.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep looking a bit longer?", -1.4, 1.25, -3.0, { css: "#d2312b", w: 0.5 });
    reg(hits, longerHit, "search-longer");
    const ditchHit = box(g, 0.3, 0.3, 0.3, 1.0, 0.9, -3.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drop your weights to get up?", 1.0, 1.2, -3.4, { css: "#d2312b", w: 0.5 });
    reg(hits, ditchHit, "ditch-weights");
    const smbReel = group(g, 1.0, 0.7, -1.5);
    const reelWheel = valveWheel(smbReel, 0, 0, 0, { r: 0.06, color: 0xf06a2b, body: 0x2f4f6f });
    reelWheel.rotation.x = Math.PI / 2;
    reelWheel.scale.set(0.7, 0.7, 0.7);
    holoTag(smbReel, "SMB reel", 0, 0.3, 0, { css: CDSB_CSS, w: 0.2 });
    reg(hits, smbReel, "smb-reel");
    const smb = cyl(g, 0.08, 0.08, 1.2, 1.6, 0.5, -3.2, 0xf06a2b, { rough: 0.6, seg: 12 });
    smb.visible = false;
    const assist = group(g, 1.6, 0.4, -2.4);
    box(assist, 0.06, 0.3, 0.04, 0, 0, 0, 0xf4f8fb, { rough: 0.6 });
    holoTag(assist, "signal: one up — separated", 0, 0.35, 0, { css: CDSB_CSS, w: 0.5 });
    reg(hits, assist, "surface-assist");
    const reunite = group(g, 0.9, 0.3, -3.0);
    torus(reunite, 0.16, 0.01, 0, 0, 0, CDSB_ACCENT, { emissive: CDSB_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(reunite, "buddy up — swap OKs, decide", 0, 0.5, 0, { css: CDSB_CSS, w: 0.52 });
    reg(hits, reunite, "buddy-reunite");
    const bubbles = group(g, -0.9, 0.05, -3.8);
    for (let i = 0; i < 5; i++) ball(bubbles, 0.03 + i * 0.008, (i % 2) * 0.08, 0.02 * i, i * 0.06, 0xdff4f6, { rough: 0.1, opacity: 0.6, transparent: true, cast: false, seg: 6, seg2: 4 });
    bubbles.visible = false;

    // ------------------------------------------------------- log, team board, dressing
    const table = group(g, -2.0, 0.48, 1.9);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const log = decal(table, 0.34, 0.24, 0, 0.84, 0, paperFace("DIVE LOG", ["Diver · buddy ____", "Faults · ear ____", "Separation · drill ____"], { bg: "#f3efe4", band: CDSB_CSS }), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    holoTag(table, "dive log", 0, 1.1, 0, { css: CDSB_CSS, w: 0.2 });
    reg(hits, log, "dive-log");
    const team = decal(g, 0.6, 0.4, 2.2, 1.35, 2.75, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("SURVEY DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Diver · Buddy", "Tender · DSO", "Lost buddy: look · up · meet"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, 2.2, 1.35, 2.78, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");
    for (const x of [-2.2, 2.2]) { const c = box(g, 0.4, 0.3, 0.4, x, 0.63, 0.2, 0x2f4f6f, { rough: 0.6 }); void c; }
    for (let i = 0; i < 4; i++) box(g, 0.5, 0.12, 0.3, -2.2 + i * 0.05, 0.85 + i * 0.12, 0.2, 0x1f5fb8, { rough: 0.7 });
    for (let i = 0; i < 5; i++) { const cl = cyl(g, 0.02, 0.02, 0.1, 2.0 + i * 0.1, 0.83, 0.2, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6 }); cl.rotation.z = Math.PI / 2; }
    const reef = group(g, 0, -0.4, -3.6);
    for (let i = 0; i < 7; i++) ball(reef, 0.14 + (i % 3) * 0.05, -3.0 + i, 0, Math.sin(i) * 0.6, 0x3f5a3a, { rough: 1, seg: 8, seg2: 6 });
    reef.visible = false;

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "buddy-check") finalOk.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 });
        if (step.id === "gear-faults") { band.material = mat(0x59c97b, { rough: 0.7 }); sheath.material = mat(0x59c97b, { rough: 0.7 }); }
        if (step.id === "rig-descent-line") { lineWeight.position.set(0.6, -1.4, -3.0); lineDown.visible = true; }
        if (step.id === "entry-ok") { buddy.position.set(0.9, -0.3, -2.7); okRing.children[0].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "descent") { buddy.position.set(-0.3, -1.6, -3.4); reef.visible = true; tape.visible = true; }
        if (step.id === "transect-start") buddy.position.set(-2.0, -1.6, -4.0);
        if (step.id === "lost-buddy-look") lookRing.rotation.y = Math.PI * 2;
        if (step.id === "deploy-smb") { smb.visible = true; buddy.visible = false; }
        if (step.id === "surface-signal") assist.children[0].material = mat(0x59c97b, { rough: 0.6 });
        if (step.id === "reunite") { buddy.visible = true; buddy.position.set(1.4, -0.3, -3.0); bubbles.visible = false; }
        if (step.id === "exit-fins") { fins.position.set(2.3, 0.6, -0.6); buddy.position.copy(buddyHome); }
        if (step.id === "dive-log") repaint(log, paperFace("DIVE LOG", ["Band · cutter: fixed", "Ear: held, cleared", "Separation: drill worked"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "buddy-ear") buddy.position.set(0.3, -0.9, -3.0);
        if (it.id === "buddy-lost") { buddy.visible = false; bubbles.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "buddy-ear" && it.resolved === "answered") buddy.position.set(-0.3, -1.6, -3.4);
        if (it.id === "buddy-lost") { if (it.resolved !== "answered") buddy.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "deploy-smb") { reelWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2; smb.position.y = -0.6 + session.turn.amount * 1.1; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "lost-buddy-look") lookRing.rotation.y = gg.t * Math.PI * 2;
        if (bubbles.visible) bubbles.position.y = 0.05 + ((t * 0.4) % 0.4);
        void dt;
      },
    };
  },
};
