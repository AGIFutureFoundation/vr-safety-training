import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { woodGrainFace, corrugatedFace, safetyStripeFace, blockFace } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Intimacy & Conduct Coordination Briefing VR — Screen & Media
// Crafts. A sound stage before a closed-set scene: the learner is the first
// assistant director running the closed-set briefing beside the intimacy
// coordinator. Nothing in this station is explicit and nothing is staged
// on camera — it is the paperwork, the room and the people: the scene
// flagged in advance, the set closed to essential crew only, a stray feed
// and a phone camera found before anyone rolls, the agreed scope confirmed
// in writing and in a private check-in, the stop signal briefed to every
// person on the set, the reporting channel named out loud, and a debrief
// held for the performers before the set is released.
//
// No clause, rule number or contract provision is stated here. The
// production's own conduct policy and SAG-AFTRA's guidance are named as the
// bodies the briefing answers to; the detail lives in those documents.

const IMC_ACCENT = 0xb05ca8;
const IMC_CSS = "#b05ca8";

function imcBoard(ctx, w, h, title, lines, band = IMC_CSS) {
  ctx.fillStyle = "rgba(22,12,24,0.92)"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = band; ctx.fillRect(0, 0, w, 5);
  ctx.fillStyle = "#f6e6f3";
  ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(title, w * 0.06, h * 0.2);
  ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
  lines.forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.44 + i * 0.16)));
}

export const SIM_MD_INTIMACY_AND_CONDUCT_COORDINATION_BRIEFING = {
  id: "md-intimacy-and-conduct-coordination-briefing",
  index: "724",
  domain: "Screen & Media Crafts",
  trade: "First assistant director with the intimacy coordinator — closed-set briefing",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "SAG-AFTRA guidance for scenes involving nudity or simulated intimacy and the intimacy coordinator's role, as the performers' training body; the production's own written conduct and anti-harassment policy and its reporting channel; IATSE crew practice for a closed set; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, as the model for a written production safety programme; Labor Code §6310 protection against retaliation for raising a concern",
  name: "Intimacy & Conduct Coordination Briefing",
  title: simTitle("Intimacy & Conduct Coordination Briefing"),
  tagline: "A sensitive scene flagged in advance, the set closed to essential crew, a stray feed and a phone camera found first, consent confirmed in writing and in private, the stop signal and the reporting channel briefed to everyone, and a debrief before the set is released",
  accent: IMC_ACCENT,
  accentCss: IMC_CSS,
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "set-held-with-care", name: "Set Held With Care", note: "A closed set run on agreed scope, a stop signal everyone knew, a named reporting channel and a debrief for the performers" },

  supportLine: "the production's own conduct contact, or SAG-AFTRA's member resources — anyone on a closed set who felt something was wrong deserves a conversation, not just a note on the call sheet",

  game: system({
    name: "Closed Set Standard",
    currency: "TRUST",
    ranks: ["Set PA", "Second AD", "First AD", "Closed-Set Lead", "Conduct Coordination Certified"],
    badges: [
      { id: "set-closed", name: "Set Closed", note: "The feed and the camera found before anyone rolled", test: AWARD.stepClean("set-sweep") },
      { id: "consent-first", name: "Consent First", note: "The written scope, the private check-in and the coordinator's word, in that order", test: AWARD.stepClean("consent-confirm") },
      { id: "debrief-held", name: "Debrief Held", note: "The performers debriefed before the set was released", test: AWARD.stepClean("debrief") },
    ],
    challenges: [
      { id: "clean-briefing", name: "Clean Briefing", note: "No corrections anywhere in the briefing", test: AWARD.clean },
      { id: "steady-hold", name: "Steady Hold", note: "Held the reset the full count, first try", test: AWARD.unbroken },
      { id: "prompt-set", name: "Prompt Set", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-door-decoy": "That stage door is wedged open for airflow. A closed set that anyone can wander into from the corridor isn't closed at all — the performers agreed to a room with a known list of people in it, and a wedged door quietly breaks that agreement.",
    "improvise-note-decoy": "That sticky note says \"let's just see what happens on the day.\" Anything added or changed on the day that wasn't agreed in advance isn't a creative choice, it's new scope nobody consented to — it goes back through the coordinator and the performers first, or it doesn't happen.",
    "visitor-badge-decoy": "A stack of visitor passes clipped to the closed-set list. Guests, press and anyone not essential to this scene have no place on this set today, however senior they are — handing out passes is how a list of six turns into a room of twenty.",
    "phone-policy-off-decoy": "A card reading \"phones OK today.\" On a closed set, personal devices are exactly how a private rehearsal ends up somewhere it was never agreed to go. The device rule for the closed set is set by the production's policy, not relaxed because the day is running late.",
  },

  lateNotes: {
    "stop-signal-board": "Not yet — the agreed scope has to be confirmed with the performers before the stop signal is briefed to the wider set.",
    "release-board": "Hold that. The set isn't released until the performers have had their debrief and the note is logged.",
  },

  steps: [
    {
      id: "call-sheet-flag", kind: "select", target: "call-sheet",
      title: "Confirm the scene is flagged on the call sheet",
      cue: "Check that today's call sheet flags the scene as a closed set and names the intimacy coordinator.",
      why: "Performers are entitled to know well before the day that a sensitive scene is scheduled and who will coordinate it. A scene that turns up unflagged on the morning's sheet takes away the time to ask questions, raise a concern or bring a representative, which is exactly the time the advance notice exists to give.",
    },
    {
      id: "headcount", kind: "gauge", target: "headcount-panel",
      title: "Match the headcount to the closed-set list",
      cue: "Read the stage headcount against the closed-set list and commit only when they match.",
      why: "The closed-set list is the room the performers agreed to work in: essential crew only, named in advance. Every extra person, however well meaning, is someone the performers never agreed would be there, so the count is matched to the list before the briefing starts rather than checked afterward.",
      gauge: { label: "HEADCOUNT vs LIST", speed: 0.55, green: [0.0, 0.42], readout: (t) => (t > 0.42 ? "more people than the list" : "matches the list"), missNote: "Committed with more people on the stage than the list allows. The performers agreed to a named room, not whoever happened to be nearby." },
    },
    {
      id: "set-sweep", kind: "find", noHint: true,
      targets: ["open-monitor", "phone-camera"],
      itemNames: { "open-monitor": "a monitor showing the feed to the corridor", "phone-camera": "a phone on a stand, camera facing the set" },
      itemNotes: {
        "open-monitor": "A monitor turned toward the corridor puts a closed set on display to anyone walking past. Closed-set feeds go only to the screens the list allows, so this one is switched off or turned away before anything rolls.",
        "phone-camera": "A personal phone pointed at the set can record something nobody agreed to share. It comes off the stand and out of the room under the production's device rule, whoever it belongs to.",
      },
      title: "Sweep the stage before the briefing",
      cue: "Two things on this stage would undo a closed set. Find them.",
      why: "A closed set depends on the room as much as on the list: a stray feed or an unattended camera can carry the scene out of the room without anyone on it knowing. Sweeping for them before the briefing is the only point at which finding them costs nothing, because nothing has been filmed yet.",
    },
    {
      id: "post-closed-sign", kind: "drag", target: "closed-sign",
      title: "Post the closed-set sign on the stage door",
      cue: "Move the CLOSED SET sign onto the stage door bracket.",
      why: "The sign tells people arriving at the door, before they open it, that the stage is closed to everyone not on the list. Without it, the only thing stopping a wrong entry is someone inside noticing too late, which puts the burden on the performers rather than on the door.",
      drag: { to: "door-bracket", radius: 0.4, missNote: "The sign isn't on the door bracket — a sign nobody at the door can see closes nothing." },
    },
    {
      id: "door-light", kind: "turn", target: "door-light-key",
      title: "Set the stage-door light to closed",
      cue: "Turn the key on the door light panel so the red closed-set lamp shows outside.",
      turn: { turns: 0.35, axis: "z", label: "DOOR LIGHT" },
      why: "The lamp outside the door is the stage's own way of saying do not enter, and crew are trained to respect it. Turning it on for the whole closed-set period, not just during takes, keeps the corridor from treating the rehearsal and the resets as moments when walking in is fine.",
    },
    {
      id: "consent-confirm", kind: "sequence", anyOrder: false,
      targets: ["written-scope", "private-checkin", "coordinator-ready"],
      itemNames: { "written-scope": "confirm the agreed scope in writing", "private-checkin": "private check-in with each performer", "coordinator-ready": "the intimacy coordinator confirms ready" },
      title: "Confirm consent: the writing, the person, then the coordinator",
      cue: "Confirm the scope agreed in advance, hold a private check-in with each performer, then take the coordinator's ready.",
      why: "Consent agreed in advance is the starting point, not the end of the conversation: a performer can change their mind on the day, and the private check-in is where that is safe to say without an audience. The coordinator's ready comes last because it rests on both — the written scope and what each performer said this morning.",
      outOfOrderNote: "The writing first, then each performer in private, then the coordinator — a ready given before the performers have been asked is a ready given on their behalf.",
    },
    {
      id: "scene-prep", kind: "sequence",
      targets: ["choreography-board", "modesty-kit", "robe-rack"],
      itemNames: { "choreography-board": "the agreed choreography, reviewed with the coordinator", "modesty-kit": "modesty garments and barriers ready", "robe-rack": "robes staged at arm's reach" },
      title: "Prepare the scene as agreed",
      cue: "Review the agreed choreography with the coordinator, confirm the modesty garments are ready and stage the robes within reach.",
      why: "Choreography that has been walked and agreed is what keeps a sensitive scene a piece of craft rather than an improvisation. The garments and robes are part of that agreement: performers should never have to ask for cover or wait for it between takes.",
    },
    {
      id: "stop-signal", kind: "select", target: "stop-signal-board",
      title: "Brief the stop signal to everyone on the set",
      cue: "Brief the whole closed set on the stop word and hand signal: anyone may use it, no reason needed.",
      why: "A stop signal only works if every person on the set knows it and trusts that using it will be respected without argument. Briefing it to the whole room — performers, camera, sound and the AD team — makes stopping the normal response to discomfort rather than a confrontation someone has to start.",
    },
    {
      id: "reporting-channel", kind: "select", target: "reporting-poster",
      title: "Name the reporting channel out loud",
      cue: "Name who to go to under the production's conduct policy, the union route and the anonymous option.",
      why: "People raise concerns when they know exactly who to tell and believe it will not cost them their job. Naming the production's own contact, the union route and the anonymous option at the briefing — with the promise of no retaliation — means nobody has to go looking for a policy document in the middle of a bad day.",
    },
    {
      id: "reset-hold", kind: "hold", target: "reset-button", seconds: 5,
      title: "Hold the set in reset for the check-in between takes",
      cue: "Press and hold the stage reset cue while the coordinator checks in with the performers.",
      why: "The pause between takes is where a performer can say that something felt different from the rehearsal. Holding the whole stage in reset for that check-in, instead of rushing the next setup, is what makes the check-in real rather than a formality squeezed between camera moves.",
      holdBreakNote: "You dropped the reset before the check-in was finished. The crew started moving again while the performers were still being asked how that take went.",
    },
    {
      id: "coverage-track", kind: "track", target: "robe-handover", seconds: 5,
      title: "Keep cover at hand through the reset",
      cue: "Keep the robe handover within reach of the performers the whole reset — not crowding, not drifting away.",
      why: "Cover that arrives the moment a take ends, without the performer having to ask, is the practical form of respect on a closed set. Too close and the handler crowds the performer; too far and the performer waits exposed while someone walks over.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.5, fall: 0.5, drift: 0.12, label: "ROBE DISTANCE", readout: (v) => (v < 0.4 ? "crowding" : v > 0.6 ? "drifting away" : "at hand") },
      holdBreakNote: "The robe drifted out of reach or crowded in — ease back toward arm's length rather than rushing in.",
    },
    {
      id: "debrief", kind: "sequence", anyOrder: false,
      targets: ["performer-debrief", "debrief-log"],
      itemNames: { "performer-debrief": "debrief the performers with the coordinator", "debrief-log": "log any concern raised, as agreed" },
      title: "Debrief the performers, then log it",
      cue: "Hold the performers' debrief with the coordinator, then log any concern exactly as the performer agreed.",
      why: "A sensitive scene can leave people unsettled even when everything went to plan, and the debrief is the moment to hear that. Logging comes after and only as the performer agrees, because the note belongs to their account of the day — not to the production's wish to close the file.",
      outOfOrderNote: "Talk to the performers first, then log — a log written before anyone was asked records the production's version, not theirs.",
    },
    {
      id: "release-set", kind: "select", target: "release-board",
      title: "Release the closed set",
      cue: "Release the closed set: sign down, lamp off, feeds restored, list filed.",
      why: "Releasing the set is a deliberate act, not the lights coming up: the sign, the lamp and the feeds go back together, so the corridor learns the stage is open from the same signals that told it the stage was closed. The list is filed so the room can be accounted for if anyone raises a concern later.",
    },
  ],

  interrupts: [
    {
      id: "walk-on-at-door",
      kind: "Walk-on at the closed door",
      after: "reset-hold", delay: 2, seconds: 12,
      alert: "A crew member from another unit opens the stage door during the reset, saying they only need to grab a cable.",
      cue: "The door is the AD team's to hold — call it on the radio.",
      target: "ad-radio",
      why: "Anyone not on the list stays outside a closed set, whatever they need, and the fastest way to stop the entry without the performers having to deal with it is the AD team's own radio to the door. The cable can be fetched after the set is released or by someone who is on the list.",
      missNote: "The crew member walked in and out during the reset. The performers had agreed to a named room, and the room changed without anyone asking them.",
      wrongNote: "Call it on the AD radio to the door — the performers shouldn't have to deal with the entry themselves.",
    },
    {
      id: "performer-signals-stop",
      kind: "Stop signal used",
      after: "coverage-track", delay: 2, seconds: 12,
      alert: "A performer gives the agreed stop signal during the reset.",
      cue: "The stop signal is honoured at once, for everyone — hold the whole set.",
      target: "all-stop-lamp",
      why: "The stop signal only means something if it works every time, instantly and without anyone asking why. Holding the whole set on the all-stop lamp lets the coordinator speak with the performer privately, and nobody resumes until the performer and coordinator say so.",
      missNote: "The stop signal went unanswered while crew kept setting up. A signal that doesn't stop anything teaches everyone on the set not to use it.",
      wrongNote: "Hit the all-stop — the signal is honoured by stopping everything, not by carrying on carefully.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, IMC_ACCENT);

    // Stage floor: painted plank.
    const floorTex = surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { base: "#3b3230", grain: "rgba(0,0,0,0.18)" }), { repeat: 4, px: 256 });
    const floor = slab(g, 7.2, 0.01, 6.6, 0, 0.002, 0, 0x4a3f3c, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.02, color: 0x6b5a55 });

    // Stage walls: corrugated steel behind, block at the door side.
    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const backWall = box(g, 7.2, 3.2, 0.12, 0, 1.6, -3.3, 0x5c6168, { rough: 0.6 });
    backWall.material = texturedMat(wallTex, { rough: 0.6, metal: 0.3, color: 0x6a6f76 });
    const blockTex = surfaceTexture((cx, w, h) => blockFace(cx, w, h, {}), { repeat: 3, px: 256 });
    const sideWall = box(g, 0.12, 3.2, 6.0, -3.6, 1.6, -0.3, 0x8b8f94, { rough: 0.7 });
    sideWall.material = texturedMat(blockTex, { rough: 0.8, metal: 0.02, color: 0x9a9ea3 });

    // ---------------------------------------------------------------- the stage door
    const door = group(g, -3.5, 0, 1.6, Math.PI / 2);
    box(door, 1.1, 2.3, 0.06, 0, 1.15, 0.05, 0x2f3338, { rough: 0.45, metal: 0.5 });
    const doorBracket = box(door, 0.36, 0.26, 0.02, 0, 1.55, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["door-bracket"] = doorBracket;
    const wedge = box(door, 0.1, 0.05, 0.08, 0.45, 0.03, 0.2, 0xdfa23b, { rough: 0.7 });
    holoTag(wedge, "Door wedged open", 0, 0.12, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, wedge, "open-door-decoy");
    const lampHousing = box(door, 0.2, 0.14, 0.08, 0, 2.5, 0.1, 0x22272c, { rough: 0.5, metal: 0.4 });
    void lampHousing;
    const redLamp = cyl(door, 0.06, 0.06, 0.04, 0, 2.5, 0.16, 0x4a1a1a, { rough: 0.4, emissive: 0x4a1a1a, ei: 0.1, seg: 16 });
    redLamp.rotation.x = Math.PI / 2;
    const lightPanel = group(g, -3.45, 1.3, 0.6, Math.PI / 2);
    box(lightPanel, 0.24, 0.3, 0.04, 0, 0, 0, 0xc9ced3, { rough: 0.5, metal: 0.3 });
    const lightKey = box(lightPanel, 0.03, 0.1, 0.03, 0, 0, 0.04, 0xd8b43a, { rough: 0.35, metal: 0.7 });
    reg(hits, lightKey, "door-light-key");
    holoTag(lightPanel, "Door light", 0, 0.24, 0, { css: IMC_ACCENT, w: 0.34 });

    const closedSign = decal(g, 0.34, 0.24, -1.6, 1.0, 2.4,
      paperFace("CLOSED SET", ["essential crew only"], { bg: "#fbe6f3", band: "#b05ca8" }), { px: 200 });
    reg(hits, closedSign, "closed-sign");
    const signTable = group(g, -1.6, 0, 2.5);
    slab(signTable, 0.7, 0.04, 0.45, 0, 0.78, 0, 0x6b5138, { radius: 0.01 });
    for (const sx of [-0.3, 0.3]) for (const sz of [-0.18, 0.18]) box(signTable, 0.04, 0.76, 0.04, sx, 0.38, sz, 0x2b3138, { rough: 0.5, metal: 0.4 });

    // ------------------------------------------------------------ AD desk
    const desk = group(g, -1.9, 0, -1.2, 0.4);
    const deskTex = surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { base: "#8b6a4a" }), { repeat: 1, px: 256 });
    const deskTop = slab(desk, 1.4, 0.05, 0.7, 0, 0.9, 0, 0x8b6a4a, { radius: 0.01 });
    deskTop.material = texturedMat(deskTex, { rough: 0.6, color: 0xa07a58 });
    for (const sx of [-0.62, 0.62]) for (const sz of [-0.3, 0.3]) box(desk, 0.05, 0.88, 0.05, sx, 0.44, sz, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const callSheet = decal(desk, 0.22, 0.3, -0.4, 0.93, 0,
      paperFace("CALL SHEET", ["Sc. 14 · CLOSED SET", "Intimacy coord. on set", "Essential crew only"], { bg: "#f7f3ea", band: "#b05ca8" }), { px: 200 });
    callSheet.rotation.x = -Math.PI / 2;
    reg(hits, callSheet, "call-sheet");
    const listSheet = decal(desk, 0.2, 0.28, -0.1, 0.93, 0.05,
      paperFace("CLOSED-SET LIST", ["Director", "Camera op", "Sound", "Coordinator", "1st AD"], { bg: "#f4f6f8" }), { px: 200 });
    listSheet.rotation.x = -Math.PI / 2;
    const passes = box(desk, 0.14, 0.03, 0.1, 0.15, 0.94, 0.12, 0xf2c14b, { rough: 0.6 });
    holoTag(passes, "Visitor passes", 0, 0.08, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, passes, "visitor-badge-decoy");
    const phoneCard = decal(desk, 0.14, 0.09, 0.4, 0.93, -0.12,
      paperFace("", ["PHONES OK", "TODAY"], { bg: "#fbe0df", band: "#c9302b" }), { px: 140 });
    phoneCard.rotation.x = -Math.PI / 2;
    reg(hits, phoneCard, "phone-policy-off-decoy");
    const adRadio = box(desk, 0.07, 0.18, 0.05, 0.55, 1.02, 0.15, 0x22272c, { rough: 0.5, metal: 0.4 });
    cyl(desk, 0.008, 0.008, 0.12, 0.57, 1.17, 0.15, 0x22272c, { seg: 8 });
    holoTag(adRadio, "AD radio", 0, 0.16, 0, { css: IMC_ACCENT, w: 0.3 });
    reg(hits, adRadio, "ad-radio");
    const headcount = instrument(desk, 0.35, 0.94, 0.2, { idle: "-- / 6", color: IMC_ACCENT, w: 0.14, d: 0.2 });
    reg(hits, headcount, "headcount-panel");

    // ------------------------------------------------------------ video village
    const village = group(g, 1.9, 0, 1.8, -0.5);
    for (let i = 0; i < 3; i++) {
      const cart = group(village, i * 0.62 - 0.62, 0, 0);
      box(cart, 0.5, 0.7, 0.4, 0, 0.35, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
      for (const sx of [-0.2, 0.2]) cyl(cart, 0.04, 0.04, 0.03, sx, 0.03, 0.15, 0x111111, { seg: 10 });
    }
    const monitorA = box(village, 0.46, 0.3, 0.04, -0.62, 0.95, 0, 0x1a1d22, { rough: 0.3, metal: 0.4 });
    void monitorA;
    const screenA = box(village, 0.42, 0.26, 0.01, -0.62, 0.95, 0.025, 0x3a6fa0, { emissive: 0x3a6fa0, ei: 0.6 });
    void screenA;
    const openMonitor = group(village, 0.62, 0, 0, Math.PI);
    box(openMonitor, 0.46, 0.3, 0.04, 0, 0.95, 0, 0x1a1d22, { rough: 0.3, metal: 0.4 });
    const openScreen = box(openMonitor, 0.42, 0.26, 0.01, 0, 0.95, 0.025, 0x6fa0d0, { emissive: 0x6fa0d0, ei: 0.8 });
    holoTag(openMonitor, "Facing the corridor", 0, 1.22, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, openMonitor, "open-monitor");
    for (let i = 0; i < 3; i++) {
      const chair = group(village, i * 0.62 - 0.62, 0, 0.7);
      box(chair, 0.42, 0.04, 0.4, 0, 0.62, 0, 0x2b2b2b, { rough: 0.8 });
      box(chair, 0.42, 0.3, 0.03, 0, 0.9, -0.18, 0x2b2b2b, { rough: 0.8 });
      for (const sx of [-0.19, 0.19]) box(chair, 0.03, 0.62, 0.03, sx, 0.31, 0, 0x8b6a4a, { rough: 0.7 });
    }

    // Phone on a stand.
    const phoneStand = group(g, 2.7, 0, -0.6, -1.2);
    cyl(phoneStand, 0.12, 0.12, 0.02, 0, 0.01, 0, 0x22272c, { seg: 14 });
    cyl(phoneStand, 0.01, 0.01, 1.3, 0, 0.65, 0, 0x8b929a, { metal: 0.6, seg: 8 });
    const phone = box(phoneStand, 0.08, 0.15, 0.01, 0, 1.35, 0, 0x111418, { rough: 0.3, metal: 0.5 });
    void phone;
    holoTag(phoneStand, "Camera facing set", 0, 1.55, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, phoneStand, "phone-camera");

    // ------------------------------------------------------------ the set: a bedroom flat, dressed but empty
    const setArea = group(g, 0.4, 0, -2.2);
    const flatTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 2, base: "#c9b8a8", base2: "#bfae9e", seam: "rgba(0,0,0,0.06)" }), { repeat: 2, px: 256 });
    const flat = box(setArea, 2.6, 2.4, 0.08, 0, 1.2, -0.7, 0xc9b8a8, { rough: 0.8 });
    flat.material = texturedMat(flatTex, { rough: 0.85, color: 0xd6c6b6 });
    for (const sx of [-1.28, 1.28]) box(setArea, 0.08, 2.4, 0.5, sx, 1.2, -0.45, 0x8b7a6a, { rough: 0.8 });
    box(setArea, 1.6, 0.35, 1.0, 0, 0.18, 0, 0x6b5a78, { rough: 0.9 });
    box(setArea, 1.6, 0.12, 1.0, 0, 0.41, 0, 0xe6dccf, { rough: 0.95 });
    box(setArea, 1.6, 0.6, 0.08, 0, 0.7, -0.5, 0x4a3a58, { rough: 0.8 });
    box(setArea, 0.4, 0.4, 0.4, 1.1, 0.2, -0.2, 0x8b6a4a, { rough: 0.7 });
    cyl(setArea, 0.08, 0.1, 0.25, 1.1, 0.53, -0.2, 0xd8c8a8, { seg: 12 });
    // Lights over the set.
    for (const sx of [-1.4, 1.4]) {
      const stand = group(setArea, sx, 0, 0.9);
      cyl(stand, 0.02, 0.02, 2.2, 0, 1.1, 0, 0x2b3138, { metal: 0.6, seg: 8 });
      for (let k = 0; k < 3; k++) {
        const leg = cyl(stand, 0.012, 0.012, 0.5, Math.sin(k * 2.1) * 0.18, 0.2, Math.cos(k * 2.1) * 0.18, 0x2b3138, { seg: 6 });
        leg.rotation.z = Math.sin(k * 2.1) * 0.7; leg.rotation.x = -Math.cos(k * 2.1) * 0.7;
      }
      const head = box(stand, 0.3, 0.24, 0.24, 0, 2.25, 0, 0x1a1d22, { rough: 0.4, metal: 0.5 });
      head.rotation.x = 0.5;
    }

    // Choreography board, modesty kit, robe rack.
    const choreo = holoPanel(g, 0.56, 0.38, 1.9, 1.5, -1.2, (ctx, w, h) => imcBoard(ctx, w, h, "AGREED SCENE PLAN", ["Beats walked in rehearsal", "Nothing added on the day", "Coordinator calls changes"]), { accent: IMC_ACCENT, ry: -0.7 });
    reg(hits, choreo, "choreography-board");
    const improvNote = decal(g, 0.12, 0.12, 2.2, 1.18, -0.9,
      paperFace("", ["let's see", "on the day"], { bg: "#fff3a8" }), { px: 120 });
    improvNote.rotation.y = -0.7;
    reg(hits, improvNote, "improvise-note-decoy");
    const kit = group(g, 1.2, 0, -0.3);
    box(kit, 0.5, 0.35, 0.35, 0, 0.18, 0, 0x6f5a88, { rough: 0.7 });
    decal(kit, 0.3, 0.1, 0, 0.3, 0.18, signFace("MODESTY KIT", { bg: "#2b2230", accent: IMC_CSS, fg: "#f6e6f3", scale: 0.5 }), { px: 160 });
    reg(hits, kit, "modesty-kit");
    const rack = group(g, -0.6, 0, -0.9);
    for (const sx of [-0.4, 0.4]) cyl(rack, 0.015, 0.015, 1.5, sx, 0.75, 0, 0x8b929a, { metal: 0.6, seg: 8 });
    cyl(rack, 0.012, 0.012, 0.8, 0, 1.5, 0, 0x8b929a, { metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    const robeColors = [0xe6dccf, 0xb05ca8, 0xe6dccf];
    robeColors.forEach((c, i) => box(rack, 0.28, 0.8, 0.1, -0.28 + i * 0.28, 1.05, 0, c, { rough: 0.95 }));
    reg(hits, rack, "robe-rack");
    const handover = box(g, 0.3, 0.5, 0.1, 0.1, 1.0, -1.0, 0xe6dccf, { rough: 0.95 });
    reg(hits, handover, "robe-handover");

    // Consent confirmation panel.
    const consentPanel = holoPanel(g, 0.6, 0.4, -0.5, 1.6, 0.4, (ctx, w, h) => imcBoard(ctx, w, h, "CONSENT", ["Written scope · on file", "Private check-in · pending", "Coordinator · pending"]), { accent: IMC_ACCENT, ry: 0.3 });
    const markW = box(consentPanel, 0.1, 0.06, 0.02, -0.18, -0.12, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markW, "written-scope");
    const markP = box(consentPanel, 0.1, 0.06, 0.02, 0, -0.12, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markP, "private-checkin");
    const markC = box(consentPanel, 0.1, 0.06, 0.02, 0.18, -0.12, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markC, "coordinator-ready");

    // Stop signal and reporting boards.
    const stopBoard = holoPanel(g, 0.56, 0.36, -2.4, 1.7, -2.6, (ctx, w, h) => imcBoard(ctx, w, h, "STOP SIGNAL", ["Word + hand signal", "Anyone may call it", "No reason needed"], "#d8342a"), { accent: IMC_ACCENT, ry: 0.4 });
    reg(hits, stopBoard, "stop-signal-board");
    const poster = decal(g, 0.42, 0.56, 1.2, 1.6, -3.22,
      paperFace("RAISE A CONCERN", ["Production conduct contact", "Union route", "Anonymous option", "No retaliation"], { bg: "#f6eef6", band: "#b05ca8" }), { px: 240 });
    reg(hits, poster, "reporting-poster");

    // Reset cue box and the all-stop lamp.
    const cueBox = group(g, 0.9, 0, 1.0);
    box(cueBox, 0.3, 1.0, 0.25, 0, 0.5, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const stripeTex = surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 1, px: 128 });
    const stripe = box(cueBox, 0.31, 0.08, 0.26, 0, 0.06, 0, 0xf2c14b, {});
    stripe.material = texturedMat(stripeTex, { rough: 0.6 });
    const resetBtn = cyl(cueBox, 0.05, 0.05, 0.03, -0.06, 1.02, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.3, seg: 16 });
    holoTag(resetBtn, "Reset", 0, 0.08, 0, { css: IMC_ACCENT, w: 0.24 });
    reg(hits, resetBtn, "reset-button");
    const allStop = cyl(cueBox, 0.05, 0.05, 0.03, 0.08, 1.02, 0, 0x8a1a1a, { emissive: 0x8a1a1a, ei: 0.2, seg: 16 });
    holoTag(allStop, "All stop", 0, 0.14, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, allStop, "all-stop-lamp");
    const stageLamp = cyl(g, 0.12, 0.12, 0.05, 0.9, 2.9, -3.2, 0x3a3a3a, { emissive: 0x3a3a3a, ei: 0.1, seg: 16 });
    stageLamp.rotation.x = Math.PI / 2;

    // Debrief panel and release board.
    const debriefPanel = holoPanel(g, 0.56, 0.36, 2.9, 1.4, 0.6, (ctx, w, h) => imcBoard(ctx, w, h, "DEBRIEF", ["Performers · pending", "Log · as agreed"]), { accent: IMC_ACCENT, ry: -1.1 });
    const markD = box(debriefPanel, 0.12, 0.08, 0.02, -0.12, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markD, "performer-debrief");
    const markL = box(debriefPanel, 0.12, 0.08, 0.02, 0.12, -0.08, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markL, "debrief-log");
    const releaseBoard = holoPanel(g, 0.5, 0.32, -2.9, 1.5, 2.9, (ctx, w, h) => imcBoard(ctx, w, h, "SET STATUS", ["CLOSED"]), { accent: IMC_ACCENT, ry: 0.9 });
    reg(hits, releaseBoard, "release-board");

    // Crew, clear of the controls.
    const coordinator = standingFigure(g, 0.45, 0.2, { ry: 2.8, cloth: 0x6f4a78, skin: 0xc99a78 });
    const ad = standingFigure(g, -1.2, -0.3, { ry: 2.4, cloth: 0x2b3f5a, skin: 0xa87a5a });
    const camOp = standingFigure(g, 2.3, -1.9, { ry: -2.2, cloth: 0x3a3a3a, skin: 0xe0b894 });
    void coordinator; void ad; void camOp;

    // Camera on a dolly facing the set.
    const cam = group(g, 1.6, 0, -0.9, -2.5);
    box(cam, 0.6, 0.2, 0.9, 0, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.25, 0.25]) for (const sz of [-0.38, 0.38]) cyl(cam, 0.06, 0.06, 0.05, sx, 0.06, sz, 0x111111, { seg: 10 }).rotation.z = Math.PI / 2;
    cyl(cam, 0.05, 0.06, 0.8, 0, 0.7, 0, 0x5a6068, { metal: 0.6, seg: 10 });
    box(cam, 0.2, 0.2, 0.36, 0, 1.2, 0, 0x1a1d22, { rough: 0.4, metal: 0.5 });
    cyl(cam, 0.06, 0.06, 0.18, 0, 1.2, 0.26, 0x111111, { seg: 12 }).rotation.x = Math.PI / 2;

    // Cable runs and sandbags for depth.
    for (let i = 0; i < 5; i++) box(g, 0.24, 0.1, 0.14, -2.6 + i * 0.35, 0.05, 2.9, 0x6b5a3a, { rough: 0.95 });
    for (let i = 0; i < 4; i++) box(g, 1.2, 0.025, 0.025, -0.4 + i * 0.1, 0.012, 1.4 + i * 0.05, 0x111111, { rough: 0.6 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.1, -1.2),

      onStepComplete(step) {
        if (step.id === "set-sweep") { openMonitor.rotation.y = 0; openScreen.material = mat(0x1a1d22, { rough: 0.3 }); phoneStand.visible = false; }
        if (step.id === "post-closed-sign") {
          closedSign.parent.remove(closedSign);
          door.add(closedSign);
          closedSign.position.set(0, 1.55, 0.11);
          closedSign.rotation.set(0, 0, 0);
          wedge.visible = false;
        }
        if (step.id === "door-light") redLamp.material = mat(0xe0302a, { emissive: 0xe0302a, ei: 1.6 });
        if (step.id === "consent-confirm") repaint(consentPanel.userData.face, (ctx, w, h) => imcBoard(ctx, w, h, "CONSENT", ["Written scope · on file", "Private check-in · done", "Coordinator · ready"], "#59c97b"));
        if (step.id === "scene-prep") improvNote.visible = false;
        if (step.id === "debrief") repaint(debriefPanel.userData.face, (ctx, w, h) => imcBoard(ctx, w, h, "DEBRIEF", ["Performers · heard", "Log · as agreed"], "#59c97b"));
        if (step.id === "release-set") {
          repaint(releaseBoard.userData.face, (ctx, w, h) => imcBoard(ctx, w, h, "SET STATUS", ["RELEASED · list filed"], "#59c97b"));
          redLamp.material = mat(0x4a1a1a, { emissive: 0x4a1a1a, ei: 0.1 });
          closedSign.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "walk-on-at-door") door.rotation.y = Math.PI / 2 - 0.5;
        if (it.id === "performer-signals-stop") stageLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "walk-on-at-door") door.rotation.y = Math.PI / 2;
        if (it.id === "performer-signals-stop") {
          stageLamp.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 1.6 });
          allStop.material = mat(0xe0302a, { emissive: 0xe0302a, ei: 1.4 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt; void t;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "headcount") {
          const n = 6 + Math.round(gg.t * 8);
          repaint(headcount.userData.screen, signFace(`${gg.t > 0.42 ? n : 6} / 6`, {
            bg: "#0d1c24", accent: gg.t > 0.42 ? "#f0645b" : "#59c97b", fg: "#f6e6f3", scale: 0.55,
          }));
        }
      },
    };
  },
};

void CITY;
