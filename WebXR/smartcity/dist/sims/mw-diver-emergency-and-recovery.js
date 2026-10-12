import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, standingFigure, reg, surfaceTexture, texturedMat, growthFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Diver Emergency & Recovery VR — Maritime & Ports, the marine
// and water pack of the Bay Area Union Edition, on the bay-underwater
// district.
//
// The standby diver's dive: the working diver has stopped answering and is
// down on the bottom beside a pile with his umbilical wrapped round a sunken
// wire rope under a fallen timber and snarled in monofilament. The learner is
// the standby, a Pile Drivers commercial diver, sent down on the working
// diver's umbilical from the district's dive stage at (−4.3, 2.8); the
// supervisor runs the surface. The working diver is a figure on the bottom,
// never named. No depth, gas or decompression figure is invented: the
// recovery's ascent and any treatment are "per the dive plan and the tables
// the supervisor holds", and the HUD chip carries the plan's own bottom time.

const MWDE_ACCENT = 0xe8665a;

export const SIM_MW_DIVER_EMERGENCY_AND_RECOVERY = {
  id: "mw-diver-emergency-and-recovery",
  index: "237",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters commercial diver as the standby diver recovering a fouled working diver, with the dive supervisor, the tenders and an Inlandboatmen's Union of the ILWU deckhand on the dive boat at the surface",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 600,
  },
  certification: "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — the standby diver, the emergency procedures in the safe practices manual and the dive record; ADCI consensus standards for commercial diving, standby and emergency response; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; Inlandboatmen's Union of the ILWU deck practice on the dive boat; ascent and treatment per the dive plan and the tables the supervisor holds",
  name: "Diver Emergency & Recovery",
  title: simTitle("Diver Emergency & Recovery"),
  tagline: "The standby goes in: on the bottom on the working diver's umbilical, followed hand over hand while a vessel's screw turns overhead, the diver checked through his faceplate, his bailout opened, the pneumo read, the wire and the monofilament found, the cutter passed down the stage, his free-flow held steady while your own comms go, his gear checked, brought to the stage, clipped on before the call up, and the emergency read up for the dive log",
  accent: MWDE_ACCENT,
  accentCss: "#e8665a",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "brought-him-home", name: "Brought Him Home", note: "His gas first, the snag cut and never his umbilical, never flown up on a bag, never his helmet off, and your own umbilical kept clear" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters or the Inlandboatmen's Union — with the employer's employee assistance line and a critical-incident debrief behind it",

  game: system({
    name: "Standby Diver",
    currency: "BREATH",
    ranks: ["Standby Trainee", "Standby Diver", "Rescue Diver", "Lead Standby", "Standby Diver Certified"],
    badges: [
      { id: "gas-first", name: "Gas First", note: "His faceplate checked and his bailout opened before anything was cut", test: AWARD.stepClean("open-bailout") },
      { id: "read-true-rescue", name: "Read True", note: "Pneumo committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "never-his-umbilical", name: "Never His Umbilical", note: "Never cut his umbilical, never flew him up, never took his helmet off, never fouled your own", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-recovery", name: "Clean Recovery", note: "No corrections from the on-bottom call to the log", test: AWARD.clean },
      { id: "steady-free-flow", name: "Steady Free-Flow", note: "His free-flow held in band the whole time he was freed", test: AWARD.unbroken },
      { id: "fast-to-the-stage", name: "Fast To The Stage", note: "Diver on the stage and the job read up inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cut-his-umbilical": "You went to cut the working diver's umbilical to free him from the wire. His umbilical is his gas, his comms, his pneumo and the line the tenders will recover him on — cut it and a diver who was fouled becomes a diver with nothing but the bailout on his back and no way to be hauled up. You cut the snag, never the umbilical, and if it cannot be freed you tell the supervisor and work it clear.",
    "fly-him-up": "You went to put air into a lift bag clipped to his harness to fly him to the surface. A lift bag expands as it rises and runs away, and a diver sent up on one ascends uncontrolled — past every decompression stop the tables the supervisor holds call for, with any gas in his lungs expanding as he goes. He goes up on the stage, clipped on, at the supervisor's call.",
    "helmet-off": "You reached to take his helmet off to see his face. On the bottom his helmet is the only thing he can breathe in; taking it off puts an unconscious diver's airway in the water. You look through the faceplate, give him gas through the free-flow and his bailout, and leave the helmet on until he is on deck.",
    "own-umbilical-under": "You started under the fallen timber after him from the far side. Your own umbilical follows you, and taking it under the timber and back round fouls the standby exactly as the working diver is fouled — two divers down on one wire and nobody left to go in for either. You go to him along his umbilical, the way he went.",
  },

  lateNotes: {
    "line-cutter": "The cutter comes off the stage once you have found exactly what he is caught on — look first, then cut, and never near his umbilical.",
    "wd-harness": "He goes to the stage once he is free, his gas is steady and his gear has been checked for anything that will catch on the way.",
    "sb-slate": "The emergency is read up for the dive log once he is on the stage and the call to come up has been made.",
  },

  steps: [
    {
      id: "standby-on-bottom", kind: "select", target: "sb-comms",
      title: "Report on the bottom on the working diver's umbilical",
      cue: "Call the supervisor: standby on the bottom, on the working diver's umbilical, starting along it — and hear it repeated back.",
      why: "The standby exists for exactly this minute, and the supervisor running the emergency from the surface needs to know where the standby is at every step: on the bottom, on the right umbilical, moving. 29 CFR 1910 Subpart T and the ADCI consensus standards put a standby at the station ready to go in precisely so this report can be made quickly, and the first report is made before anything else so the surface can plan the recovery around it.",
    },
    {
      id: "follow-umbilical", kind: "hold", target: "wd-umbilical", seconds: 5,
      title: "Follow his umbilical hand over hand to him",
      cue: "Keep a hand on the working diver's umbilical and follow it from the stage along the bottom to him — never let go, never cut across.",
      why: "In low visibility the working diver's umbilical is the only certain path to him: it goes exactly where he went, round whatever he went round. The standby follows it hand over hand without letting go, because letting go to cut a corner is how a standby ends up on the wrong side of a pile with their own umbilical fouled — the umbilical check here is on his line, and it is also the route.",
      holdBreakNote: "You let go of his umbilical — in this visibility, the line is the only way to him. Take it up again where you left it and follow it on.",
    },
    {
      id: "check-diver", kind: "select", target: "wd-helmet",
      title: "Check the diver through his faceplate",
      cue: "Get face to face with him: look through the faceplate — breathing, eyes, any response to your hand on his shoulder — and tell the supervisor what you see.",
      why: "What the standby sees through the faceplate decides what the surface does next: a diver who is breathing and responsive is freed and brought to the stage; one who is not is a medical emergency that changes how fast the surface wants him and what is waiting on deck. The standby looks and reports in plain words, because the supervisor is already reading the tables they hold for the ascent and needs facts, not impressions.",
    },
    {
      id: "open-bailout", kind: "turn", target: "wd-bailout-valve",
      title: "Open his bailout valve",
      cue: "Reach to his bailout bottle and open the valve fully, then check the gas is getting to his helmet through the side block.",
      why: "A fouled diver whose surface supply has been pinched or cut by the snag is breathing whatever is left in his helmet, and his bailout is the gas he carries for exactly that. Opening it is the first thing the standby does for him with their hands, before any cutting, because a diver freed from the wire who has run out of gas on the way has not been saved by being freed.",
      turn: { turns: 0.75, label: "HIS BAILOUT", readout: (t) => (t < 0.3 ? "closed" : t < 0.9 ? "opening — gas to the block" : "open — gas at his helmet") },
    },
    {
      id: "pneumo-at-diver", kind: "gauge", target: "sb-pneumo",
      title: "Hold your pneumo at the diver for the supervisor",
      cue: "Hold your pneumo end beside him while the supervisor bleeds and reads it, and commit the reading against the depth the dive plan gives.",
      why: "The depth the working diver is lying at is what his ascent, and any treatment after it, will be planned on from the tables the supervisor holds — and his own pneumo may be pinched in the snag or reading wrong. The standby's pneumo held beside him gives the supervisor a reading to trust while the recovery goes on, and it is committed against the dive plan so the surface knows at once if he had gone deeper than planned.",
      gauge: { label: "PNEUMO AT DIVER", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "shallower than the plan" : t <= 0.58 ? "per the dive plan" : "deeper than planned — tell topside"), missNote: "Outside the band — hold the pneumo end still beside him while it is bled, and read it against the plan." },
    },
    {
      id: "find-snag", kind: "find", noHint: true,
      targets: ["umbilical-wrap-wire", "monofilament-tangle"],
      itemNames: { "umbilical-wrap-wire": "his umbilical wrapped round a sunken wire rope", "monofilament-tangle": "monofilament snarled round his harness and fin" },
      itemNotes: {
        "umbilical-wrap-wire": "His umbilical has taken two turns round a length of sunken wire rope pinned under the fallen timber — every pull from the surface has tightened it, which is why the tenders could not bring him back.",
        "monofilament-tangle": "A snarl of fishing monofilament is wound round his harness and one leg; it is nearly invisible in the silt and it is what stopped him working himself clear.",
      },
      title: "Find exactly what he is caught on",
      cue: "Before any cutting, trace his umbilical and his harness with your hands: what is it round, what is round him, and what is safe to cut.",
      why: "Freeing a fouled diver starts with finding the snag exactly, by hand, because the wrong cut is worse than no cut: a knife that goes into a tangle blind can go into the umbilical, the harness or the diver. Two things usually hold a fouled diver — the umbilical round structure and something wound round him — and each is freed differently: the umbilical is worked back off the wire, and the monofilament is cut.",
    },
    {
      id: "cutter-down", kind: "drag", target: "line-cutter",
      title: "Take the line cutter off the stage to the snag",
      cue: "The tender has sent the line cutter down on the stage — unclip it and bring it to the monofilament at his harness, well away from his umbilical.",
      why: "The cutter comes down on the stage from the tender rather than on a loose line, so it arrives where the standby can find it and cannot tangle with either umbilical on the way. It is taken to the monofilament at his harness, well clear of his umbilical, because the cutter's job is the snag and nothing else; the umbilical round the wire is worked back off by hand.",
      drag: { to: "tangle-cut-point", radius: 0.5, missNote: "Not at the snag — the cutter goes to the monofilament at his harness, well away from his umbilical." },
    },
    {
      id: "steady-free-flow", kind: "track", target: "wd-freeflow", seconds: 6,
      title: "Hold his free-flow steady while you free him",
      cue: "Keep his helmet's free-flow cracked in the band as you work his umbilical back off the wire — enough gas to ventilate his helmet, never enough to empty his bailout.",
      why: "A diver who is not breathing well is ventilated through his helmet's free-flow, and the standby controls it with one hand while freeing him with the other. Too little and the gas in his helmet goes stale; too much and his bailout empties while he is still on the wire. The flow is held in band because his gas is the thing that decides how long the standby has.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "HIS FREE-FLOW", readout: (v) => (v < 0.42 ? "too little — helmet going stale" : v > 0.6 ? "too much — bailout emptying" : "steady — ventilating") },
      holdBreakNote: "His free-flow went out of band — his helmet went stale or his bailout was running away. Bring it back to a steady flow and hold it.",
    },
    {
      id: "gear-check", kind: "find", noHint: true,
      targets: ["weight-belt-snag", "harness-strap-loose"],
      itemNames: { "weight-belt-snag": "weight belt buckle caught on the timber", "harness-strap-loose": "harness leg strap undone" },
      itemNotes: {
        "weight-belt-snag": "His weight belt's buckle has hooked over the edge of the timber; move him now and it pulls him back or tears loose and sends him light.",
        "harness-strap-loose": "One leg strap of his harness has come undone in the struggle — the harness is what the stage clip and the tenders' pull go through, and with a strap loose it can ride up over his chest.",
      },
      title: "Check his gear before you move him",
      cue: "Before he moves: anything still catching on the timber or the wire, and his harness done up so it can take the stage clip.",
      why: "A diver who has just been freed is moved once, to the stage, and anything still catching on the way turns that move into a second fouling. His harness is what everything will pull through — the stage clip and the tenders' umbilical — so a strap that has come undone is done up now, on the bottom, not discovered when he rides up out of it on the way to the surface.",
    },
    {
      id: "to-the-stage", kind: "drag", target: "wd-harness",
      title: "Bring him to the stage",
      cue: "Take him by his harness and bring him along his umbilical to the stage, keeping his helmet upright and your own umbilical clear of his.",
      why: "The stage is the way up: it is on its lift wire with the tenders and the supervisor controlling it, and a diver on it can be brought up at the rate and with the stops the tables the supervisor holds call for. He is brought to it by his harness, helmet upright so the gas in it stays where he can breathe it, along his own umbilical so neither umbilical crosses the other.",
      drag: { to: "stage-seat", radius: 0.6, missNote: "Not on the stage — bring him by the harness to the stage and sit him in it, helmet upright." },
    },
    {
      id: "clip-and-call", kind: "sequence",
      targets: ["clip-diver-stage", "stage-up-call"],
      itemNames: { "clip-diver-stage": "his harness clipped to the stage", "stage-up-call": "call to the supervisor: diver on the stage, clipped, ready" },
      title: "Clip him to the stage, then call it up",
      cue: "Clip his harness to the stage first and check it, get on the stage beside him, then call the supervisor: diver on the stage, clipped in, ready to come up.",
      why: "The order is the whole of it: a stage called up before the diver is clipped on is a stage that leaves an unconscious diver on the bottom or drops him off halfway. He is clipped and the clip checked, the standby rides beside him, and only then does the supervisor hear 'ready' — the ascent itself, its rate and its stops, are the supervisor's from the tables they hold.",
      outOfOrderNote: "Out of order — he is clipped to the stage and the clip checked before the call goes up; never the call first.",
    },
    {
      id: "emergency-log", kind: "select", target: "sb-slate",
      title: "Read the emergency up for the dive log",
      cue: "Read your slate to the supervisor: where he was, what he was caught on, his condition, when his bailout was opened, the pneumo reading, the vessel's screw and your own comms drop.",
      why: "The dive log of an emergency is what the diver's treatment, the investigation and the next dive plan on this pier will all be built from, and the standby is the only person who saw the bottom. It is read up now, on the stage, while it is exact: the time his bailout was opened and the depth he was lying at matter to whoever treats him on deck.",
    },
    {
      id: "crew-checkin", kind: "select", target: "sb-comms",
      title: "Check in with the supervisor on the way up",
      cue: "On the stage with him: how he is now, how you are, and that you will both be looked at on deck — and tell the supervisor you want the debrief.",
      why: "A standby who has just recovered a fouled diver has been through one of the hardest things the trade asks, and the check-in on the stage is the first place it is said out loud. The supervisor needs to know how both divers are for the ascent the tables call for; the team needs the debrief afterwards, and the member assistance line and a critical-incident debrief exist because some of this does not settle on the comms.",
    },
  ],

  interrupts: [
    {
      id: "screw-overhead",
      kind: "Vessel's screw turning near the dive",
      after: "follow-umbilical", delay: 2, seconds: 14,
      alert: "You can hear a propeller turning overhead and closing — a vessel is moving near the dive while both divers are down.",
      cue: "Call the supervisor on the comms: a screw is turning overhead — get that vessel stopped before you go on.",
      target: "sb-comms",
      why: "Two divers' umbilicals rise to the surface from this spot, and a turning screw drawn over them takes both. Only the surface can stop the vessel, and the standby is the one who can hear it; the call goes to the supervisor at once, because following the umbilical on under a turning screw risks the recovery becoming two recoveries.",
      missNote: "You kept following his umbilical while the screw came closer overhead, and the tenders felt both umbilicals jerk in its wash before the supervisor knew anything was moving.",
      wrongNote: "The comms — only the surface can stop that vessel, and the supervisor has to hear it from you now.",
    },
    {
      id: "standby-comms-lost",
      kind: "Comms lost with the surface",
      after: "steady-free-flow", delay: 2, seconds: 14,
      alert: "Your own comms have gone dead while you are working him free — no voice from the surface and no answer to your call.",
      cue: "Give line-pull signals on your own umbilical to your tender, and keep his free-flow going.",
      target: "sb-umbilical-pull",
      why: "The surface is now running an emergency with no voice from either diver, and the first thing they need is to know the standby is still working. Line-pull signals on the standby's own umbilical tell the tender that, in the one language that does not need comms, while the standby keeps his gas going with the other hand.",
      missNote: "You worked on in silence; the surface, hearing nothing from either diver, started dressing a second standby and took up slack on your umbilical in the middle of the freeing.",
      wrongNote: "Your own umbilical — line-pull signals to your tender say you are all right and still working, without comms.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // --------------------------------------------- pile, timber and wire
    const growthTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 512 });
    growthTex.repeat?.set?.(2, 3);
    const pileMat = texturedMat(growthTex, { rough: 0.95, metal: 0.02, color: 0xe2e8dc });
    const pile = group(g, -0.7, 0, -1.5);
    const shaft = cyl(pile, 0.34, 0.36, 6.4, 0, 3.2, 0, 0xffffff, { seg: 18 });
    shaft.material = pileMat;
    for (const [y, h] of [[0.28, 0.4], [2.6, 0.3], [3.8, 0.24]]) cyl(pile, 0.42, 0.44, h, 0, y, 0, 0x56613f, { rough: 1, seg: 16 });
    const pile2 = group(g, 2.1, 0, -2.1);
    const shaft2 = cyl(pile2, 0.34, 0.36, 6.4, 0, 3.2, 0, 0xffffff, { seg: 18 });
    shaft2.material = pileMat;
    cyl(pile2, 0.42, 0.44, 0.4, 0, 0.3, 0, 0x4a5a32, { rough: 1, seg: 16 });
    const timber = group(g, 0.7, 0.28, -0.9, 0.5);
    box(timber, 2.4, 0.28, 0.3, 0, 0, 0, 0x4a3a28, { rough: 0.95 });
    box(timber, 0.3, 0.3, 0.32, 1.1, 0.02, 0, 0x3a2e20, { rough: 0.95 });
    const wire = hose(g, [[-0.6, 0.06, -0.3], [0.2, 0.1, -0.7], [0.9, 0.2, -1.0], [1.8, 0.08, -1.4]], 0.022, 0x6a6e70, { steps: 12, rough: 0.5, metal: 0.6 });
    void wire;
    const underHit = box(g, 0.8, 0.5, 0.6, 1.6, 0.35, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "under the timber from the far side?", 1.6, 0.8, -1.2, { css: "#d2312b", w: 0.6 });
    reg(hits, underHit, "own-umbilical-under");

    // ------------------------------------------------ the working diver
    const wd = group(g, 0.55, 0, 0.35, 2.4);
    const wdFig = standingFigure(wd, 0, 0, { lying: true, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    void wdFig;
    const helmet = group(wd, 0, 0.24, -1.5);
    ball(helmet, 0.2, 0, 0, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 16, seg2: 12 });
    const port = cyl(helmet, 0.09, 0.09, 0.04, 0, 0.17, 0, 0x274a5f, { rough: 0.1, metal: 0.5, seg: 16 });
    void port;
    const ffKnob = group(helmet, 0.2, 0.02, 0.05);
    cyl(ffKnob, 0.035, 0.035, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(ffKnob, 0.01, 0.05, 0.012, 0.018, 0, 0, 0xe8665a, { rough: 0.5 });
    holoTag(helmet, "his faceplate", 0, 0.34, 0, { css: "#e8665a", w: 0.26 });
    reg(hits, helmet, "wd-helmet");
    const ffHit = box(helmet, 0.16, 0.16, 0.16, 0.24, 0.02, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(helmet, "his free-flow", 0.32, -0.12, 0.1, { css: "#e8665a", w: 0.26 });
    reg(hits, ffHit, "wd-freeflow");
    const helmetOff = box(helmet, 0.3, 0.2, 0.3, -0.2, 0.18, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(helmet, "take his helmet off?", -0.35, 0.46, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, helmetOff, "helmet-off");
    const bailout = group(wd, 0.34, 0.16, -0.9);
    const bottle = cyl(bailout, 0.08, 0.08, 0.5, 0, 0, 0, 0xc8ccd0, { rough: 0.4, metal: 0.6, seg: 12 });
    bottle.rotation.x = Math.PI / 2;
    const bValve = group(bailout, 0, 0, -0.3);
    cyl(bValve, 0.03, 0.03, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.7, seg: 10 });
    box(bValve, 0.08, 0.012, 0.012, 0, 0.03, 0, 0xe8665a, { rough: 0.5 });
    holoTag(bailout, "his bailout valve", 0, 0.2, -0.3, { css: "#e8665a", w: 0.32 });
    reg(hits, bailout, "wd-bailout-valve");
    const harnessG = group(wd, 0, 0.3, -0.7);
    box(harnessG, 0.36, 0.04, 0.3, 0, 0, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(harnessG, "his harness — to the stage", 0, 0.3, 0, { css: "#e8665a", w: 0.46 });
    reg(hits, harnessG, "wd-harness");
    const strap = box(wd, 0.04, 0.03, 0.3, -0.14, 0.2, -0.2, 0xe8b02e, { rough: 0.7, emissive: 0x4a3206, ei: 0.4 });
    strap.rotation.y = 0.6;
    reg(hits, strap, "harness-strap-loose");
    const buckle = box(g, 0.08, 0.05, 0.06, 0.2, 0.42, -0.72, 0xc0c6cc, { rough: 0.3, metal: 0.9, emissive: 0x3a3a3a, ei: 0.4 });
    reg(hits, buckle, "weight-belt-snag");
    const mono = group(wd, -0.05, 0.22, -0.1);
    for (let i = 0; i < 5; i++) { const loop = torus(mono, 0.12 + i * 0.02, 0.003, 0, i * 0.02, 0, 0xdfe8ee, { rough: 0.3, seg: 4, seg2: 18, cast: false }); loop.rotation.x = 0.5 + i * 0.3; loop.rotation.y = i * 0.7; }
    reg(hits, mono, "monofilament-tangle");
    const cutPoint = group(wd, -0.05, 0.3, 0.05);
    const cutRing = torus(cutPoint, 0.18, 0.01, 0, 0, 0, MWDE_ACCENT, { emissive: MWDE_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    cutRing.rotation.x = Math.PI / 2;
    holoTag(cutPoint, "cut the snag here", 0, 0.3, 0, { css: "#e8665a", w: 0.32 });
    reg(hits, cutPoint, "tangle-cut-point");
    const bag = group(wd, 0.3, 0.5, -0.4);
    const bagBody = ball(bag, 0.18, 0, 0.2, 0, 0xf2c14b, { rough: 0.6, seg: 12, seg2: 10 });
    bagBody.scale.set(0.9, 1.2, 0.9);
    cyl(bag, 0.005, 0.005, 0.3, 0, -0.05, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 4 });
    const bagHit = box(bag, 0.35, 0.45, 0.35, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bag, "fly him up on the bag?", 0, 0.55, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, bagHit, "fly-him-up");

    // ------------------------------------------------ the two umbilicals
    const wdUmb = hose(g, [[-3.6, 1.1, 2.5], [-2.6, 0.2, 1.8], [-1.4, 0.15, 0.9], [-0.5, 0.12, 0.1], [-0.1, 0.1, -0.5], [0.4, 0.2, -0.8], [1.0, 0.3, -0.5], [0.9, 0.28, 0.0]], 0.03, 0xf2c14b, { steps: 22, rough: 0.8 });
    void wdUmb;
    const followG = group(g, -1.6, 0.2, 1.0);
    const followRing = torus(followG, 0.12, 0.012, 0, 0, 0, MWDE_ACCENT, { emissive: MWDE_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    followRing.rotation.x = Math.PI / 2;
    holoTag(followG, "his umbilical — follow it", 0, 0.3, 0, { css: "#e8665a", w: 0.44 });
    reg(hits, followG, "wd-umbilical");
    const wrap = group(g, 0.25, 0.14, -0.75);
    for (let i = 0; i < 2; i++) { const t = torus(wrap, 0.08, 0.03, i * 0.07, 0, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 14 }); t.rotation.y = Math.PI / 2; }
    reg(hits, wrap, "umbilical-wrap-wire");
    const cutUmb = box(g, 0.3, 0.25, 0.3, -0.35, 0.2, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut his umbilical to free him?", -0.45, 0.55, 0.15, { css: "#d2312b", w: 0.54 });
    reg(hits, cutUmb, "cut-his-umbilical");
    hose(g, [[-3.5, 1.3, 2.3], [-2.2, 0.25, 2.2], [-0.4, 0.3, 1.6], [0.6, 0.9, 1.0]], 0.03, 0x4fb3e8, { steps: 14, rough: 0.8 });
    const sbPull = group(g, -1.2, 0.3, 1.95);
    const pullSlack = hose(sbPull, [[-0.3, 0, 0], [0, 0.15, 0.05], [0.3, 0, 0]], 0.03, 0x4fb3e8, { steps: 6, rough: 0.8 });
    const pullTaut = hose(sbPull, [[-0.3, 0, 0], [0, 0.02, 0], [0.3, 0, 0]], 0.03, 0x2f8fc8, { steps: 6, rough: 0.8 });
    pullTaut.visible = false;
    holoTag(sbPull, "your umbilical — line-pull", 0, 0.3, 0, { css: "#e8665a", w: 0.44 });
    reg(hits, sbPull, "sb-umbilical-pull");
    const sbPneumo = group(g, 0.9, 0.9, 0.7);
    cyl(sbPneumo, 0.012, 0.012, 0.3, 0, 0, 0, 0x2b5aa8, { rough: 0.6, seg: 6 }).rotation.z = 1.2;
    cyl(sbPneumo, 0.02, 0.02, 0.05, 0.14, 0.05, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    holoTag(sbPneumo, "your pneumo end", 0, 0.16, 0, { css: "#e8665a", w: 0.3 });
    reg(hits, sbPneumo, "sb-pneumo");

    // ---------------------------------------------- the stage end of it
    const cutter = group(g, -3.45, 1.05, 2.45);
    box(cutter, 0.04, 0.2, 0.03, 0, 0, 0, 0xe8665a, { rough: 0.5 });
    box(cutter, 0.08, 0.06, 0.01, 0, -0.12, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    cyl(cutter, 0.005, 0.005, 0.3, 0, 0.25, 0, 0xe8b02e, { rough: 0.7, seg: 4 });
    holoTag(cutter, "line cutter — on the stage", 0, 0.3, 0.05, { css: "#e8665a", w: 0.46 });
    reg(hits, cutter, "line-cutter");
    const seat = group(g, -3.55, 0.6, 2.1);
    const seatRing = torus(seat, 0.3, 0.012, 0, 0, 0, MWDE_ACCENT, { emissive: MWDE_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    seatRing.rotation.x = Math.PI / 2;
    holoTag(seat, "stage — sit him here", 0, 0.4, 0, { css: "#e8665a", w: 0.38 });
    reg(hits, seat, "stage-seat");
    const stageClip = group(g, -3.4, 1.2, 1.85);
    torus(stageClip, 0.05, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    box(stageClip, 0.03, 0.2, 0.03, 0, -0.14, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(stageClip, "stage clip", 0, 0.16, 0, { css: "#e8665a", w: 0.22 });
    reg(hits, stageClip, "clip-diver-stage");
    const upCall = group(g, -2.9, 1.6, 1.8, 0.4);
    box(upCall, 0.34, 0.12, 0.02, 0, 0, 0, 0x2a0e0a, { rough: 0.5, emissive: 0x3a0a06, ei: 0.5 });
    holoTag(upCall, "call: ready to come up", 0, 0.14, 0.01, { css: "#e8665a", w: 0.4 });
    reg(hits, upCall, "stage-up-call");

    // ----------------------------------------------------- comms and slate
    const comms = holoPanel(g, 0.5, 0.3, 1.6, 1.6, 1.3, (cx, w, h) => {
      cx.fillStyle = "rgba(26,10,8,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8665a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbdcd6"; cx.fillText("STANDBY COMMS", w * 0.06, h * 0.24);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillStyle = "#fdeeea";
      ["Supervisor · running the emergency", "Press to talk"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.55 + i * 0.22)));
    }, { ry: -0.6, accent: MWDE_ACCENT });
    reg(hits, comms, "sb-comms");
    const commsLamp = ball(g, 0.03, 1.85, 1.72, 1.45, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    const noComms = holoTag(g, "no comms", 1.6, 1.85, 1.32, { css: "#d2312b", w: 0.24 });
    noComms.visible = false;
    const slate = decal(g, 0.26, 0.2, 2.0, 1.05, 0.6, paperFace("SLATE", ["Where, caught on", "Condition, bailout", "Pneumo, times"], { bg: "#f4ecea", band: "#e8665a" }), { px: 192 });
    slate.rotation.y = -0.8;
    holoTag(g, "your slate", 2.0, 1.24, 0.6, { css: "#e8665a", w: 0.22 });
    reg(hits, slate, "sb-slate");

    // --------------------------------------------- scenery and effects
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(pile, 0.09 + (i % 3) * 0.03, Math.cos(a) * 0.42, 0.14 + (i % 3) * 0.12, Math.sin(a) * 0.42, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1);
    }
    for (let i = 0; i < 6; i++) {
      const frond = box(g, 0.03, 0.7 + (i % 3) * 0.25, 0.12, -2.4 + i * 0.3, 0.4, -1.2 - (i % 2) * 0.4, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    for (const [x, z, r] of [[-2.2, 0.3, 0.2], [2.6, 1.4, 0.15], [-0.4, 2.5, 0.18], [2.7, -0.6, 0.2], [-2.6, -2.2, 0.24]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);
    const school = group(g, -1.0, 2.6, -2.4);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.34 - 0.5, Math.floor(i / 4) * 0.24, (i % 3) * 0.2);
      ball(f, 0.06, 0, 0, 0, 0x8ea4ac, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
      box(f, 0.05, 0.06, 0.01, -0.14, 0, 0, 0x70868c, { rough: 0.5 });
    }
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + 0.3;
      const star = group(g, 1.4 + Math.cos(a) * 1.2, 0.02, 1.6 + Math.sin(a) * 0.6);
      for (let k = 0; k < 5; k++) { const arm = box(star, 0.1, 0.02, 0.03, 0, 0, 0, [0xf2a03d, 0xe86a8a][i % 2], { rough: 0.7 }); arm.rotation.y = (k * Math.PI * 2) / 5; arm.position.set(Math.cos((k * Math.PI * 2) / 5) * 0.05, 0, -Math.sin((k * Math.PI * 2) / 5) * 0.05); }
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8 + 0.3;
      ball(pile2, 0.08 + (i % 3) * 0.03, Math.cos(a) * 0.42, 0.14 + (i % 3) * 0.12, Math.sin(a) * 0.42, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1);
    }
    for (let i = 0; i < 8; i++) {
      const link = torus(g, 0.06, 0.018, 2.0 - i * 0.12, 0.03, 0.2 + i * 0.07, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      cyl(g, 0.05, 0.03, 0.08, -0.7 + Math.cos(a) * 0.55, 0.04, -1.5 + Math.sin(a) * 0.55, [0xe86a8a, 0xf2a03d, 0xe8e2d0][i % 3], { rough: 0.7, seg: 8 });
    }
    const helmetBubbles = group(g, 0.55, 0.5, -1.0);
    for (let i = 0; i < 6; i++) ball(helmetBubbles, 0.02 + (i % 3) * 0.01, (i % 2) * 0.05, i * 0.3, (i % 3) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    helmetBubbles.visible = false;
    const wash = group(g, -2.6, 3.4, -0.6);
    for (let i = 0; i < 8; i++) ball(wash, 0.08 + (i % 3) * 0.04, (i % 4) * 0.4, (i % 3) * 0.4, Math.floor(i / 4) * 0.5, 0xdff4f0, { rough: 0.3, emissive: 0x9fd0c8, ei: 0.5, seg: 8, seg2: 6, cast: false });
    wash.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 0.6, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "follow-umbilical") followRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "open-bailout") helmetBubbles.visible = true;
        if (step.id === "cutter-down") { cutter.position.set(0.55, 0.45, 0.25); mono.visible = false; }
        if (step.id === "steady-free-flow") wrap.visible = false;
        if (step.id === "gear-check") { strap.material = mat(0xe8b02e, { rough: 0.7 }); buckle.visible = false; }
        if (step.id === "to-the-stage") { wd.position.set(-3.55, 0.35, 2.3); wd.rotation.y = 1.2; helmetBubbles.position.set(-3.5, 1.4, 1.5); cutter.visible = false; }
        if (step.id === "clip-and-call") seatRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "emergency-log") repaint(slate, paperFace("SLATE — READ UP", ["Umbilical round wire · mono cut", "Bailout opened · breathing", "Screw overhead · comms lost"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "screw-overhead") { wash.visible = true; commsLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.3 }); }
        if (it.id === "standby-comms-lost") { noComms.visible = true; commsLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "screw-overhead") { wash.position.set(-4.5, 4.4, -2.0); wash.scale.set(0.5, 0.5, 0.5); commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (it.id === "standby-comms-lost") { noComms.visible = false; pullSlack.visible = false; pullTaut.visible = true; commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "open-bailout") bValve.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "steady-free-flow" && session.holding) ffKnob.rotation.x = (session.track?.v ?? 0) * 2.4;
        if (helmetBubbles.visible) helmetBubbles.children.forEach((b, i) => { b.position.y = (t * 0.7 + i * 0.3) % 1.8; });
        if (wash.visible) wash.children.forEach((b, i) => { b.position.y = ((t * 0.6 + i * 0.3) % 1.6); });
        school.position.x = -1.0 + Math.sin(t * 0.3) * 0.4;
        void dt; void CITY; void signFace;
      },
    };
  },
};
