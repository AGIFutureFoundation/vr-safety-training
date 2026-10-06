import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg, barrierPanel,
  surfaceTexture, texturedMat, grassFace, sandFace, woodGrainFace, concreteFace,
} from "../citykit.js";
import { fencePanelGate } from "../../../shared/props.js";
import { wrenchSet } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Playground Equipment Inspection VR — Building Systems &
// Facilities, the education-support-staff programme.
//
// The fenced play yard before the gate opens for the day: the perimeter
// walked before the structure is, the loose-fill surfacing probed for depth
// because compacted fill stops cushioning a fall the moment it looks fine
// from a standing height, the climbing structure's hardware checked close
// up, a worn S-hook re-closed with the proper tool rather than bare fingers,
// and a piece nobody can vouch for tagged out and blocked off rather than
// left for the first class of the day to find. The learner is the AFT- or
// CSEA-represented grounds and facilities worker who signs this checklist
// every morning it runs. The school, the equipment manufacturer and every
// exact measurement are generic; the checklist calls out the district's own
// procedure and the industry's playground-safety guidance by name only,
// never by a clause number nobody here is certain of.

const PG_ACCENT = 0x5fb87a;
const PG_CSS = "#5fb87a";

export const SIM_ED_PLAYGROUND_EQUIPMENT_INSPECTION = {
  id: "ed-playground-equipment-inspection",
  index: "621",
  domain: "Building Systems & Facilities",
  trade: "AFT- or CSEA-represented school grounds and facilities worker conducting the daily playground equipment safety inspection",
  category: "Building Systems & Facilities",
  weather: "clear",
  certification: "AFT and CSEA facilities training; OSHA's walking-working surfaces standard (29 CFR 1910.22) for the fall-zone surfacing and the ground around the equipment; the district's Injury and Illness Prevention Program (8 CCR 3203) for the daily inspection itself; the equipment manufacturer's own maintenance manual for torque values, hardware and replacement parts; the industry's public playground-safety guidance and its voluntary equipment standard, named here as bodies rather than by a clause number; the district's grounds and facilities procedure for tagging equipment out of service",
  name: "Playground Equipment Inspection",
  title: simTitle("Playground Equipment Inspection"),
  tagline: "Before the gate opens: the fence walked, the fall-zone surfacing probed for depth, the structure checked close up, a bolt torqued, an S-hook closed with the tool instead of a thumb, a handrail shake-tested, glass bagged rather than palmed, a broken swing tagged and roped off, and the drain that was clogged left clear",
  accent: PG_ACCENT,
  accentCss: PG_CSS,
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "walked-before-opened", name: "Walked Before It Opened", note: "The fence, the surfacing and the structure all checked close up, nothing forced with bare hands, and the one thing that failed today tagged out and roped off before the first student arrived" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Morning Walk",
    currency: "FT",
    ranks: ["Grounds Aide", "Facilities Tech", "Lead Groundskeeper", "Building Engineer", "Facilities Certified"],
    badges: [
      { id: "tool-not-thumb", name: "Tool, Not Thumb", note: "Never forced a hook or picked up glass bare-handed", test: AWARD.safe },
      { id: "clean-walk", name: "Clean Walk", note: "No corrections across the whole yard", test: AWARD.clean },
      { id: "steady-shake-test", name: "Steady Shake Test", note: "The handrail test held in band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "gate-open-on-time", name: "Gate Open on Time", note: "Whole walk finished inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-structure", name: "One-Pass Structure Check", note: "Close inspection clean on the first pass", test: AWARD.stepClean("structure-close-inspection") },
      { id: "nine-in-a-row", name: "Nine in a Row", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "test-ride-tagged-swing": "That swing already has a defect and it hasn't been repaired yet. Getting on it to see how bad it is puts a body weight on hardware nobody has cleared — the only test a suspect swing gets is a hand on the chain from the ground, never a rider.",
    "bare-hand-broken-glass": "That's broken glass in the fall-zone fill, and a bare hand is about to close on it. Glass in loose fill hides in the next handful just as easily as this one — the litter grabber and the bag are what go into the fill, not fingers.",
    "prop-gate-open-with-rock": "That gate is propped open with a rock instead of latched. A perimeter fence only does its job shut — propping it open for convenience during the walk is the same as not having a fence at all for as long as it stays that way.",
    "force-hook-bare-fingers": "That S-hook is sprung open and a bare thumb is about to muscle it shut. An S-hook closes to a specific gap with the crimping tool so the chain can't work its way back out under a swinging load — pinched shut by hand, it either doesn't close far enough or closes on the finger doing the pinching.",
  },

  lateNotes: {
    "depth-probe": "Not yet — the fall zone gets probed once the perimeter and the gate are already secured, not before.",
    "s-hook-crimper": "The hook gets crimped once the close inspection has actually found it open, not before.",
  },

  steps: [
    {
      id: "read-checklist", kind: "select", target: "checklist-board",
      title: "Read this morning's checklist",
      cue: "Read the posted checklist for anything flagged from yesterday's walk before starting today's.",
      why: "A defect logged yesterday and not yet fixed is the first thing today's walk needs to know about — reading the board before the gate opens means a known problem gets checked first instead of rediscovered from scratch alongside everything new.",
    },
    {
      id: "perimeter-walk", kind: "find", noHint: true,
      targets: ["fence-gap", "faded-signage", "drainage-clog"],
      itemNames: { "fence-gap": "the gap cut in the chain-link", "faded-signage": "the sun-faded age-range sign", "drainage-clog": "the clogged drain in the low corner" },
      itemNotes: {
        "fence-gap": "Someone has cut a gap in the chain-link at the back corner. A fence that doesn't fully enclose the yard doesn't do the one job it has — keeping the play area separate from the parking lot and the street.",
        "faded-signage": "The sign naming the equipment's age range has faded past reading. A sign nobody can read is a rule nobody outside the district office can be expected to know.",
        "drainage-clog": "The area drain in the low corner is packed with leaves and silt. A yard that can't drain after rain turns its lowest corner into standing water the next class walks straight into.",
      },
      title: "Walk the perimeter fence before the gate opens",
      cue: "Three things about the fence and yard are not right. Find them before opening for the day.",
      why: "The fence line is walked first because it decides whether the yard is a closed space at all — a gap, an unreadable sign or a drain nobody has looked at all fail quietly, and none of them show up on the equipment itself, only on the ground around it.",
    },
    {
      id: "gate-latch-secure", kind: "select", target: "gate-latch",
      title: "Latch the gate properly",
      cue: "Swing the gate shut and confirm the latch actually engages.",
      why: "A gate that swings shut but doesn't latch is a gate that the next gust of wind, or the next kid leaning on it, opens right back up — the latch is checked by hand, not assumed from the sound of the gate closing.",
    },
    {
      id: "surfacing-probe", kind: "gauge", target: "depth-probe",
      title: "Probe the fall-zone surfacing depth",
      cue: "Push the depth probe into the loose fill under the climbing structure and commit the reading.",
      why: "Loose-fill surfacing compacts under weather and foot traffic long before it looks thin from standing height, and a compacted fill stops cushioning a fall the same way concrete does — the probe is the only way to know the depth is still what the manufacturer's manual calls for, rather than what it happened to look like walking past.",
      gauge: { label: "SURFACING DEPTH", speed: 0.55, green: [0.42, 0.68], readout: (t) => (t < 0.42 ? "compacted — top it up" : t > 0.68 ? "reading past the probe's marked line" : "at depth"), missNote: "Not at depth. Compacted fill reads shallow on the probe — it gets topped up before the equipment above it is cleared." },
    },
    {
      id: "structure-close-inspection", kind: "find", noHint: true,
      targets: ["exposed-anchor-bolt", "splintered-rail", "entrapment-gap"],
      itemNames: { "exposed-anchor-bolt": "the anchor bolt standing proud of its footing", "splintered-rail": "the splintered handrail", "entrapment-gap": "the widened gap in the guardrail" },
      itemNotes: {
        "exposed-anchor-bolt": "This footing's anchor bolt is standing up out of the fill instead of sitting flush. A protrusion at ankle height in a fall zone is exactly the kind of thing a running foot catches on, or a fall lands on.",
        "splintered-rail": "This handrail has split along the grain, and the splinter is standing proud of the surface. A rail like that catches a bare hand sliding down it the same way a fence post catches a sleeve.",
        "entrapment-gap": "This guardrail's gap has widened past the others on the same run. A gap wide enough to admit a small body but not let it back out again is exactly the shape the industry's equipment standard designs every rail spacing around.",
      },
      title: "Inspect the climbing structure close up",
      cue: "Three things about the structure itself are not right. Find them from arm's reach, not from across the yard.",
      why: "A structure that reads fine from ten feet away can hide a raised bolt, a split rail or a stretched gap that only shows up standing next to it — the close inspection is the point in the whole walk where hands actually go on the hardware instead of eyes staying on the whole yard at once.",
    },
    {
      id: "select-replacement-hardware", kind: "select", target: "correct-bolt",
      title: "Pick the matching replacement bolt",
      cue: "Read the footing's hardware tag and take the matching bolt from the parts bin.",
      why: "The manufacturer's manual matches every footing to a specific bolt grade and length, not a generic one from the shelf — a bolt that merely fits the hole but isn't rated the same as the one it replaces is a repair that looks finished and isn't.",
    },
    {
      id: "tighten-anchor-bolt", kind: "turn", target: "anchor-bolt",
      title: "Torque the loose anchor bolt",
      cue: "Turn the wrench on the anchor bolt until it seats to the manufacturer's mark.",
      why: "An anchor bolt that is snug by feel and one that is actually torqued to the manual's mark are not the same repair — the structure's whole footing depends on every bolt holding the same clamping force, and a hand that stops at 'snug' leaves that judgment to whoever checks it next.",
      turn: { turns: 0.6, label: "ANCHOR BOLT", readout: (t) => (t < 0.85 ? "seating" : "torqued") },
    },
    {
      id: "crimp-s-hook", kind: "hold", target: "s-hook-crimper", seconds: 6,
      title: "Crimp the open S-hook shut",
      cue: "Set the crimping tool on the sprung S-hook and hold it closed to the tool's own gap.",
      why: "The crimping tool closes the hook to a gap a chain link cannot work back out of under a swinging load, which is exactly the failure a hand alone cannot judge or apply enough force to prevent — the tool is held closed for the full squeeze, not eyeballed halfway there.",
      holdBreakNote: "You let go before the tool finished closing the gap. A hook part-crimped by hand is still a hook a chain can work its way back out of.",
    },
    {
      id: "handrail-shake-test", kind: "track", target: "handrail", seconds: 6,
      title: "Shake-test the handrail",
      cue: "Apply steady test force to the handrail and keep it in the band that shows a sound mount.",
      why: "A handrail mounted correctly resists a firm, steady push without any give at the base; one working loose flexes more the harder and longer it's tested — reading that difference needs a test force held steady long enough to feel the difference, not a quick tap that could mean either.",
      track: {
        start: 0.15, green: [0.36, 0.6], rise: 0.4, fall: 0.38, drift: 0.1, label: "TEST FORCE",
        readout: (v) => (v < 0.36 ? "too light to tell" : v > 0.6 ? "overloading the mount" : "steady test"),
      },
      holdBreakNote: "Force out of band — too light tells you nothing, too hard risks the mount you're trying to test. Bring it back to steady.",
    },
    {
      id: "collect-broken-glass", kind: "drag", target: "litter-grabber",
      title: "Bag the broken glass with the grabber",
      cue: "Carry the litter grabber to the glass in the fill and bag it.",
      why: "Broken glass in loose fill spreads every time a hand or a rake goes through it looking for the pieces — the grabber and the bag are what go in first, so the next hand into that fill is a student's, not another custodian's checking for what got missed.",
      drag: { to: "glass-pile-spot", radius: 0.5, missNote: "Not at the glass. Carry the grabber all the way to the fill before bagging anything." },
    },
    {
      id: "tag-out-broken-swing", kind: "sequence", anyOrder: false,
      targets: ["clear-the-area", "out-of-service-tag", "tie-up-seat"],
      itemNames: { "clear-the-area": "area cleared", "out-of-service-tag": "out-of-service tag hung", "tie-up-seat": "broken seat tied out of reach" },
      title: "Tag the broken swing out of service",
      cue: "Clear anyone nearby, hang the out-of-service tag, then tie the broken seat up out of reach, in that order.",
      why: "A tag on a swing nobody can still reach is a formality; the seat itself has to come up out of reach before the tag means anything to the first class through the gate, and clearing the area first means nobody is standing under the seat while it's being tied off.",
      outOfOrderNote: "Clear the area first, then the tag, then tie the seat up — the tag protects nobody while the seat is still swinging at head height.",
    },
    {
      id: "drainage-clear", kind: "select", target: "drain-grate",
      title: "Clear the drain you found on the walk",
      cue: "Lift the grate and clear the leaves and silt from the drain in the low corner.",
      why: "The drain flagged on the perimeter walk doesn't fix itself between finding it and closing out the checklist — clearing it now is what keeps the next rain from turning that corner into the standing water the walk was supposed to catch before a class ever saw it.",
    },
    {
      id: "log-inspection", kind: "select", target: "inspection-log",
      title: "Sign the daily inspection log",
      cue: "Record every finding — fixed and tagged — on the daily inspection log.",
      why: "The signed log is the district's own record that the yard was actually walked today, not just that it looked fine from the office window — it is also the only place the tagged swing's repair gets tracked until someone closes it out.",
    },
  ],

  interrupts: [
    {
      id: "cyclist-through-gate",
      kind: "Cyclist cuts through the open gate",
      after: "handrail-shake-test", delay: 3, seconds: 10,
      alert: "A student on a bike has ridden in through the gate you just latched, heading straight for the equipment you're testing.",
      cue: "Call them off the equipment before they reach it.",
      target: "checklist-board",
      why: "A bike moving through a play yard mid-inspection is a collision waiting for whichever piece of equipment it reaches first, and the fastest way to stop it is the loudest voice and the nearest whistle at hand — the board is where the whistle hangs, and reaching for it is the same motion as reaching for attention.",
      missNote: "The bike reached the structure before anyone called out — a yard mid-inspection has tools and open panels lying around that a bike moving fast has no business meeting.",
      wrongNote: "The whistle by the checklist board — that's the fastest way to get their attention before they reach the structure.",
    },
    {
      id: "wasp-nest-found",
      kind: "Wasp nest under the platform roof",
      after: "crimp-s-hook", delay: 2, seconds: 11,
      alert: "Working the hook, you notice a wasp nest built into the underside of the platform roof, right next to where your hand is.",
      cue: "Back off and flag the area for pest control — don't disturb the nest.",
      target: "pest-tag",
      why: "A nest disturbed by a tool an arm's length away stings whoever is holding it first, and a paraprofessional's job here is to flag the hazard for the people equipped to remove it, not to test how calm the nest is — the tag marks the spot so the next person near it knows before they get close enough to find out themselves.",
      missNote: "The work continued a hand's width from an active nest — the sting that follows is the nest answering the vibration of the tool, not bad luck.",
      wrongNote: "The pest-control tag — that's what flags the nest for removal without anyone testing how calm it is.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, PG_ACCENT);

    // ------------------------------------------------------------- ground: grass and the fall zone
    const lawn = box(g, 7.4, 0.05, 6.0, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    lawn.material = texturedMat(surfaceTexture((cx, w, h) => grassFace(cx, w, h), { repeat: 8, px: 384 }), { rough: 0.95, color: 0x9fc79f });
    const fallZone = cyl(g, 2.0, 2.0, 0.08, 0.6, 0.03, 0.2, 0xffffff, { rough: 0.9, seg: 24 });
    fallZone.material = texturedMat(surfaceTexture((cx, w, h) => sandFace(cx, w, h, { base: "#8a6a45", base2: "#7a5b3a" }), { repeat: 4, px: 384 }), { rough: 0.95, color: 0xa8865a });
    const walkway = box(g, 1.2, 0.06, 5.6, -2.6, 0.033, 0, 0xffffff, { rough: 0.85 });
    walkway.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom" }), { repeat: 3, px: 384 }), { rough: 0.85, color: 0xc7c8c0 });

    // ------------------------------------------------------------- perimeter fence and gate
    const fenceAssembly = fencePanelGate(g, -3.1, 0, -1.9, { ry: Math.PI / 2 });
    const gateLeaf = fenceAssembly.userData.parts?.gate;
    holoTag(fenceAssembly, "yard gate", 0, 2.1, 0, { css: PG_CSS, w: 0.24 });
    reg(hits, fenceAssembly, "gate-latch");
    const gapMesh = box(g, 0.6, 1.7, 0.05, -3.15, 0.85, 2.3, 0x14171a, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "gap cut in the fence", -3.15, 1.9, 2.3, { css: "#f0645b", w: 0.4 });
    reg(hits, gapMesh, "fence-gap");
    const propRock = ball(g, 0.09, -2.75, 0.09, -1.75, 0x7a7568, { rough: 0.9 });
    holoTag(g, "gate propped with a rock?", -2.75, 0.4, -1.75, { css: "#f0645b", w: 0.5 });
    reg(hits, propRock, "prop-gate-open-with-rock");

    // Signage post near the gate.
    const signPost = group(g, -2.6, 0, -2.6);
    cyl(signPost, 0.03, 0.03, 1.5, 0, 0.75, 0, CITY.steel, { rough: 0.4, metal: 0.6, seg: 10 });
    const ageSign = decal(signPost, 0.4, 0.28, 0, 1.4, 0.02, paperFace("AGES 5-12", ["PLAY AREA"], { bg: "#e8e2c8", worn: true }));
    holoTag(signPost, "age-range sign", 0, 1.6, 0, { css: PG_CSS, w: 0.3 });
    reg(hits, ageSign, "faded-signage");
    const checklistBoard = holoPanel(g, 0.6, 0.4, -1.6, 1.4, -2.9, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = PG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf7ee"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("MORNING CHECKLIST", w / 2, h * 0.24);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#c8e8d0";
      ["Yesterday: swing chain flagged", "Perimeter · surfacing · structure", "Whistle hangs here"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.46 + i * 0.16)));
    }, { ry: 0.5, accent: PG_ACCENT });
    reg(hits, checklistBoard, "checklist-board");

    // Drain in the low corner.
    const drain = group(g, 2.9, 0, -2.4);
    cyl(drain, 0.22, 0.22, 0.03, 0, 0.015, 0, 0x3a3f44, { rough: 0.6, metal: 0.4, seg: 16 });
    const clog = torus(drain, 0.16, 0.03, 0, 0.02, 0, 0x4a3a24, { rough: 0.9, seg: 8, seg2: 14 });
    holoTag(drain, "drain clogged with leaves", 0, 0.3, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, clog, "drainage-clog");
    const drainGrate = cyl(drain, 0.2, 0.2, 0.02, 0, 0.025, 0, 0x5b6470, { rough: 0.5, metal: 0.6, seg: 16 });
    drainGrate.visible = false;
    reg(hits, drainGrate, "drain-grate");

    // ------------------------------------------------------------- climbing structure
    const structure = group(g, 0.8, 0, 0.2);
    const postMat = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { tones: [0x9a7448, 0x8a6640] }), { repeat: 2, px: 256 }), { rough: 0.8, color: 0xa9865a });
    const posts = [];
    for (const [px, pz] of [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]]) {
      const post = cyl(structure, 0.06, 0.065, 2.4, px, 1.2, pz, 0xffffff, { rough: 0.8, seg: 10 });
      post.material = postMat;
      posts.push(post);
    }
    void posts;
    const platform = box(structure, 2.4, 0.08, 2.0, 0, 2.1, 0, 0xffffff, { rough: 0.75 });
    platform.material = postMat;
    const roof = box(structure, 2.6, 0.06, 2.2, 0, 2.55, 0, 0xc0392b, { rough: 0.6 });
    void roof;

    // Guardrail with the entrapment gap.
    const guard = group(structure, 0, 2.14, 1.0);
    for (let i = 0; i < 6; i++) {
      const gx = -1.1 + i * 0.44;
      cyl(guard, 0.012, 0.012, 0.34, gx, 0.17, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    }
    box(guard, 2.2, 0.02, 0.02, 0, 0.34, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    const entrapGap = box(guard, 0.16, 0.34, 0.02, 0.55, 0.17, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(guard, "gap wider than the rest", 0.55, 0.42, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, entrapGap, "entrapment-gap");

    // Handrail on the ramp side, for the shake test.
    const handrail = box(structure, 0.04, 0.04, 1.6, -1.16, 0.9, -1.6, CITY.steel, { rough: 0.4, metal: 0.6 });
    holoTag(structure, "handrail", -1.16, 1.05, -1.6, { css: PG_CSS, w: 0.24 });
    reg(hits, handrail, "handrail");

    // Splintered rail near the slide entry.
    const splinterRail = box(structure, 0.05, 0.05, 0.9, 1.16, 1.7, -0.3, 0xffffff, { rough: 0.85 });
    splinterRail.material = postMat;
    const splinterBit = box(structure, 0.02, 0.01, 0.06, 1.16, 1.73, -0.5, 0xc9a86a, { rough: 0.9 });
    holoTag(structure, "splintered rail", 1.16, 1.85, -0.5, { css: "#f0645b", w: 0.36 });
    reg(hits, splinterBit, "splintered-rail");

    // Anchor bolt at the footing, standing proud.
    const footing = cyl(structure, 0.14, 0.14, 0.1, -1.1, 0.05, -0.9, 0xffffff, { rough: 0.9, seg: 12 });
    footing.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h)), { repeat: 1, px: 192, color: 0xb8b8b0 });
    const boltHead = cyl(structure, 0.014, 0.014, 0.05, -1.1, 0.12, -0.9, 0xc0c6cc, { rough: 0.35, metal: 0.8, seg: 8 });
    holoTag(structure, "anchor bolt standing proud", -1.1, 0.3, -0.9, { css: "#f0645b", w: 0.5 });
    reg(hits, boltHead, "exposed-anchor-bolt");
    const boltSpot = torus(structure, 0.05, 0.006, -1.1, 0.03, -0.9, PG_ACCENT, { emissive: PG_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    boltSpot.rotation.x = Math.PI / 2;
    reg(hits, boltSpot, "anchor-bolt");

    // Swing set with the sprung S-hook and the already-tagged broken swing.
    const swingSet = group(g, -0.7, 0, 2.3);
    for (const sx of [-1.4, 1.4]) cyl(swingSet, 0.05, 0.05, 2.4, sx, 1.2, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 10 });
    box(swingSet, 2.9, 0.08, 0.08, 0, 2.35, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const chainGood = cyl(swingSet, 0.012, 0.012, 1.4, -0.6, 1.6, 0, 0x6b7278, { rough: 0.5, metal: 0.6, seg: 8 });
    void chainGood;
    box(swingSet, 0.4, 0.04, 0.14, -0.6, 0.85, 0, 0xd8532a, { rough: 0.6 });
    const brokenChain = cyl(swingSet, 0.012, 0.012, 0.7, 0.6, 1.95, 0, 0x6b7278, { rough: 0.5, metal: 0.6, seg: 8 });
    void brokenChain;
    const hook = torus(swingSet, 0.03, 0.006, 0.6, 1.58, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8, seg2: 14 });
    hook.rotation.z = 1.0;
    holoTag(swingSet, "sprung S-hook", 0.6, 1.78, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, hook, "s-hook-crimper");
    const fingerPinchSpot = ball(swingSet, 0.02, 0.66, 1.6, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(swingSet, "force it shut with a thumb?", 0.66, 1.9, 0.02, { css: "#f0645b", w: 0.56 });
    reg(hits, fingerPinchSpot, "force-hook-bare-fingers");
    const brokenSeat = box(swingSet, 0.4, 0.04, 0.14, 0.6, 1.55, 0, 0xd8532a, { rough: 0.6 });
    holoTag(swingSet, "already tagged — do not ride", 0.6, 1.4, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, brokenSeat, "test-ride-tagged-swing");
    const clearArea = box(g, 1.4, 0.05, 1.4, -0.7, 0.03, 2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clearArea, "clear-the-area");
    const oosTag = decal(swingSet, 0.14, 0.2, 0.6, 1.2, 0.08, paperFace("OUT OF", ["SERVICE"], { bg: "#f2c14b", band: "#d2312b" }));
    oosTag.visible = false;
    reg(hits, oosTag, "out-of-service-tag");
    const tiedSeatSpot = box(swingSet, 0.1, 0.1, 0.1, 0.6, 2.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tiedSeatSpot, "tie-up-seat");

    // Broken glass scattered in the fall zone.
    const glassPile = group(g, 1.1, 0, 0.9);
    for (let i = 0; i < 5; i++) {
      const shard = box(glassPile, 0.03, 0.006, 0.02, (i % 3) * 0.05 - 0.05, 0.084, Math.floor(i / 3) * 0.05, 0xbfe8f0, { rough: 0.15, metal: 0.1, opacity: 0.7, transparent: true, cast: false });
      if (i === 0) reg(hits, shard, "bare-hand-broken-glass");
    }
    const grabberTool = group(g, 2.2, 0, 1.6);
    cyl(grabberTool, 0.012, 0.012, 0.55, 0, 0.275, 0, 0xd8532a, { rough: 0.5, seg: 10 });
    box(grabberTool, 0.1, 0.04, 0.03, 0, 0.03, 0, 0x3a3f44, { rough: 0.6 });
    holoTag(grabberTool, "litter grabber", 0, 0.6, 0, { css: PG_CSS, w: 0.3 });
    reg(hits, grabberTool, "litter-grabber");
    const glassPileSpot = torus(g, 0.16, 0.01, 1.1, 0.06, 0.9, PG_ACCENT, { emissive: PG_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    glassPileSpot.rotation.x = Math.PI / 2;
    reg(hits, glassPileSpot, "glass-pile-spot");

    // Depth probe for the fall zone.
    const probe = group(g, 0.6, 0, 1.4);
    cyl(probe, 0.01, 0.01, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    const probeScreen = instrument(probe, 0, 0.55, 0, { idle: "-- in", color: PG_ACCENT, w: 0.1, d: 0.14 });
    holoTag(probe, "depth probe", 0, 0.75, 0, { css: PG_CSS, w: 0.28 });
    reg(hits, probeScreen, "depth-probe");

    // Parts bin and wrench for the anchor bolt.
    const partsBin = group(g, -1.6, 0, 1.5);
    box(partsBin, 0.4, 0.2, 0.3, 0, 0.1, 0, 0xd8dde2, { rough: 0.6 });
    const boltBin = cyl(partsBin, 0.02, 0.02, 0.06, 0, 0.24, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(partsBin, "matching bolt", 0, 0.4, 0, { css: PG_CSS, w: 0.32 });
    reg(hits, boltBin, "correct-jug-hardware");
    const wrench = wrenchSet(g, -1.4, 0, 1.0, { ry: 0.3 });
    void wrench;
    const boltPick = ball(partsBin, 0.04, 0, 0.24, 0, 0x59c97b, { rough: 0.4 });
    reg(hits, boltPick, "correct-bolt");

    // Pest tag hook, hidden until the wasp interrupt.
    const pestTag = group(structure, 0.9, 2.5, 0.9);
    box(pestTag, 0.1, 0.14, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    pestTag.visible = false;
    reg(hits, pestTag, "pest-tag");
    const wasps = ball(structure, 0.08, 0.9, 2.48, 0.85, 0x8a6a3c, { rough: 0.85 });
    wasps.visible = false;

    // Inspection log clipboard.
    const inspectionLog = holoPanel(g, 0.46, 0.3, 2.8, 1.3, 2.4, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = PG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf7ee"; cx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("DAILY LOG", w / 2, h * 0.35);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#c8e8d0";
      cx.fillText("Findings · fixed · tagged", w / 2, h * 0.68);
    }, { ry: -0.6, accent: PG_ACCENT });
    reg(hits, inspectionLog, "inspection-log");

    // A folded barrier panel kept ready near the tagged swing.
    const barrier = barrierPanel(g, -1.6, 2.9, { ry: 0.4 });
    void barrier;

    // Crew: a supervising groundskeeper, clear of every control.
    const supervisor = standingFigure(g, 3.3, 1.0, { ry: -2.3, cloth: 0x2b3138, vest: 0xd8f23a, cap: 0x2f6f4a });
    holoTag(supervisor, "lead groundskeeper", 0, 1.95, 0, { css: PG_CSS, w: 0.34 });

    // A student, hidden until an interrupt calls for them.
    const student = standingFigure(g, 0, -3.4, { ry: 0, cloth: 0x3f7a9e, trousers: 0x2b3138, atStation: true });
    student.scale.set(0.86, 0.86, 0.86);
    student.visible = false;

    return {
      hits,
      footprint: 2.9,

      onStepComplete(step) {
        if (step.id === "gate-latch-secure") { gateLeaf ? (gateLeaf.rotation.y = 0) : null; propRock.visible = false; }
        if (step.id === "surfacing-probe") repaint(probeScreen.userData.screen, signFace("3.5 in", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "tighten-anchor-bolt") boltSpot.visible = false;
        if (step.id === "crimp-s-hook") hook.rotation.z = 0.1;
        if (step.id === "collect-broken-glass") glassPileSpot.visible = false;
        if (step.id === "out-of-service-tag" || step.id === "tag-out-broken-swing") { oosTag.visible = true; }
        if (step.id === "drainage-clear") { drainGrate.visible = true; clog.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "cyclist-through-gate") { student.visible = true; student.position.set(-2.6, 0, -1.8); }
        if (it.id === "wasp-nest-found") { wasps.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cyclist-through-gate") student.visible = false;
        if (it.id === "wasp-nest-found") { wasps.visible = false; pestTag.visible = true; }
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "surfacing-probe") {
          repaint(probeScreen.userData.screen, signFace(`${(2 + gg.t * 3).toFixed(1)} in`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (session?.step?.id === "tighten-anchor-bolt" && session.turn) boltHead.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.step?.id === "crimp-s-hook" && session.holding) hook.scale.setScalar(1 - 0.3 * Math.min(1, (session.holdFor ?? 0) / 6));
        supervisor.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        void dt;
      },
    };
  },
};
