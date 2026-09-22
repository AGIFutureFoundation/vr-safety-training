import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Abatement Perimeter Awareness VR — Hunters Point Edition,
// Community Environmental Justice, the trained-worker pathway's entry rung.
//
// A new hazmat and environmental laborer's first assignment on a demolition
// parcel under a federal cleanup order: standing the awareness-level watch
// along the fence line while a licensed abatement crew works asbestos and
// lead inside it. Nothing here is the real Hunters Point Naval Shipyard —
// the parcel, the crew and the postings are generic, the way every station
// in this edition is. The whole discipline of the job is negative: an
// awareness-level worker reads the postings, watches the controls that are
// already running, and calls the competent person the instant something
// looks wrong — they never cross the tape, never touch suspect material, and
// never try to fix what they find. Station abatement-chamber covers the
// full-containment side this fence line is looking in at.

const APA_ACCENT = 0xe8b64a;
const APA_STEEL = 0x8b929a;

export const SIM_ABATEMENT_PERIMETER_AWARENESS = {
  id: "abatement-perimeter-awareness",
  index: "166",
  domain: "Environmental",
  trade: "Hazmat and environmental laborer — LIUNA",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA hazmat and environmental laborer entry-level and asbestos-awareness training; OSHA 29 CFR 1926.1101 asbestos in construction (awareness-level duties and the site's competent person); 29 CFR 1910.134 respiratory protection for the entrants the standard actually covers; EPA NESHAP 40 CFR 61 Subpart M for demolition asbestos waste; the local air district's demolition and asbestos notification rules",
  name: "Abatement Perimeter Awareness",
  title: simTitle("Abatement Perimeter Awareness"),
  tagline: "A new laborer's fence-line watch on a demolition perimeter: the postings, the negative-air units, the wet method, the waste labels, and the line between watching and calling it in",
  accent: APA_ACCENT,
  accentCss: "#e8b64a",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "perimeter-held", name: "Perimeter Held", note: "The watch kept clean: nothing crossed, nothing touched, the competent person called the moment it mattered" },

  game: system({
    name: "Perimeter Watch",
    currency: "WATCH",
    ranks: ["New Hire", "Perimeter Hand", "Fence-Line Lead", "Awareness Authority", "Perimeter Watch Certified"],
    badges: [
      { id: "never-crossed", name: "Never Crossed the Line", note: "Never entered the regulated area or touched suspect material", test: AWARD.safe },
      { id: "clean-watch", name: "Clean Watch", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "steady-eye", name: "Steady Eye", note: "Held the fence-line dust reading close to band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-watch", name: "Quick Watch", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "nine-straight", name: "Nine Straight", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "cross-boundary": "You stepped past the boundary marker onto regulated ground. An awareness-level laborer's protection is distance and the training that stops at the fence line — the tape, the sign and the marker are the only things standing between you and material nobody has cleared you to be near, and crossing them for a better look is exactly the exposure this post exists to prevent.",
    "touch-debris": "You picked up the loose scrap lying against the fence instead of leaving it where it fell and flagging it. You don't know what that material is, what it has been near, or whether it is still shedding fibre — an awareness worker's job is to point at a hazard, never to handle it, and the competent person is the one trained to decide what happens to it next.",
    "self-patch-tape": "You grabbed the tape and tried to reseal the torn bag yourself. Fixing a compromised container puts your bare hands and your breathing zone closer to whatever is inside it than any part of this job calls for — a torn bag gets called in to the competent person, not repaired by whoever happens to be standing nearest when it splits.",
    "wave-through-load": "You waved the load-out truck through the gate without anyone actually checking the bags. Every bag that leaves this gate has to be double-bagged and labeled before it goes, because once it is on a public street there is no way to pull a bag back that wasn't — the gate is the last place anyone can still stop it.",
  },

  lateNotes: {
    "radio-unit": "Nothing to report yet — the radio matters once there is something to call in, not before.",
    "dust-monitor": "Read the meter once you're actually standing the watch, not before the shift has properly started.",
  },

  interrupts: [
    {
      id: "bag-tears-ramp",
      kind: "Bag failure on the ramp",
      after: "steady-watch", delay: 4, seconds: 14,
      alert: "A bag being carried up the loading ramp just split at the seam, and whatever was inside it is now sitting open on the ramp deck in the open air.",
      cue: "That bag failed right in front of you. This is not yours to patch.",
      target: "radio-unit",
      why: "A torn bag on an open ramp is exactly the kind of thing this post exists to catch, and exactly the kind of thing an awareness-level worker is not equipped or authorized to fix: touching torn material to re-bag it yourself puts your hands and your breathing zone directly against whatever that bag was holding, with none of the training, respirator or containment procedure the crew inside the fence actually has. The radio is the tool this job gives you for this exact moment — use it the instant it happens, not after you've already tried something else.",
      missNote: "You watched it happen and moved on to the next thing on your list. The material sat open on the ramp for the rest of the window, and nobody who was actually trained and equipped to handle it knew it was there until long after the moment it mattered.",
      wrongNote: "Not the bags themselves — put your hands on this one and you've done exactly what an awareness-level worker is not authorized to do. The radio is the tool for this, not another set of untrained hands.",
    },
    {
      id: "visitor-under-tape",
      kind: "Public incursion",
      after: "wet-method-watch", delay: 3, seconds: 12,
      alert: "Someone from the sidewalk has ducked under the tape a few feet down the fence line and is walking toward the building with a phone raised to shoot a photo.",
      cue: "A member of the public just crossed the line you're supposed to be holding.",
      target: "tape-gap",
      why: "The tape only works as a boundary if somebody enforces the part that says do not cross, and the right way to enforce it is not a chase into ground you are not authorized to enter either — it is calling the person back to the public side and closing the gap they came through, which actually restores the boundary instead of adding a second unauthorized person inside it.",
      missNote: "The visitor kept walking while you dealt with something else, and by the time anyone looked back they were most of the way to the building — a bystander standing that close to active demolition and abatement work with no PPE and no idea what they're breathing is a problem this post exists to prevent, not one it gets to notice after the fact.",
      wrongNote: "Not by following them across the line yourself — that only puts a second unescorted, unequipped person inside the regulated area. Call them back and close the gap in the tape.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "site-log",
      title: "Check in on the site log",
      cue: "Sign in as today's perimeter awareness assignment and note which regulated area is active.",
      why: "The site log is what tells anyone reading it later — the competent person, an inspector, the next shift — who was actually watching this fence line and when, and it is also where today's boundary gets confirmed before you rely on it: a regulated area drawn yesterday can move as the demolition works its way across the parcel, and the log is the one place that says where it actually stands right now.",
    },
    {
      id: "ppe-don", kind: "sequence", anyOrder: true,
      targets: ["hard-hat", "hi-vis-vest", "safety-glasses"],
      itemNames: { "hard-hat": "hard hat", "hi-vis-vest": "hi-vis vest", "safety-glasses": "safety glasses" },
      title: "Don the awareness-level PPE",
      cue: "Put on the hard hat, hi-vis vest and safety glasses — the PPE this post actually calls for.",
      why: "An awareness-level post outside the fence is not an entry post, and the PPE says so: a hard hat, a vest that keeps you visible to the trucks working the gate, and glasses against dust and debris are what this job requires, and reaching for a respirator or coveralls you were never fit-tested or trained on would only tell the next person who saw you that you thought you were about to go where you are not authorized to go.",
    },
    {
      id: "radio-check", kind: "select", target: "radio-unit",
      title: "Confirm the line to the competent person",
      cue: "Key the radio and get a response from the competent person before starting the watch.",
      why: "This whole post rests on one working link: the moment something crosses from noting it to stopping it, the only tool an awareness worker actually has is the ability to reach the person who is trained and authorized to act — not their own hands. Confirming that radio answers before the shift starts is the difference between calling it in the instant it matters and discovering, mid-emergency, that nobody can hear you.",
    },
    {
      id: "walk-signage", kind: "find", noHint: true,
      targets: ["danger-sign", "warning-placard", "regulated-tape"],
      itemNames: { "danger-sign": "the asbestos danger sign", "warning-placard": "the lead warning placard", "regulated-tape": "the regulated-area tape" },
      itemNotes: {
        "danger-sign": "Posted at eye height where the tape meets the gate — the asbestos danger sign that has to be legible from the public side, not only from inside the fence.",
        "warning-placard": "The lead warning placard on the demolition trailer, naming the second hazard this parcel carries alongside the asbestos.",
        "regulated-tape": "The barrier tape itself, run continuously around the work area — a gap in it is a gap in the only thing telling a stranger where not to walk.",
      },
      title: "Walk the postings that define this regulated area",
      cue: "Find the three postings that make this boundary readable to somebody who has never seen this site before.",
      why: "A regulated area only exists as a boundary if somebody who knows nothing about this job can see it and understand it without asking — the danger sign, the lead placard and the tape are what do that, and checking all three are actually up, actually legible and actually where they belong is the first thing this post does every shift, before anything else on the fence line is worth trusting.",
    },
    {
      id: "verify-boundary", kind: "select", target: "boundary-marker",
      title: "Confirm your own position at the boundary",
      cue: "Stand at the marked post and confirm you are on the public side of the line.",
      why: "An awareness-level laborer's entire scope of work is defined by which side of this marker they are standing on, and that has to be confirmed on purpose rather than assumed — the boundary can shift as the crew's work area grows, and a marker that used to sit ten feet further back is a marker somebody moved for a reason you need to know before you plant your feet next to it.",
    },
    {
      id: "negative-air-watch", kind: "find", noHint: true,
      targets: ["negative-air-unit", "exhaust-duct"],
      itemNames: { "negative-air-unit": "the negative-air unit", "exhaust-duct": "its exhaust duct" },
      itemNotes: {
        "negative-air-unit": "Running on the far side of the fence, its fan audible even from here — the machine that is supposed to be holding the containment negative for as long as anyone is working inside it.",
        "exhaust-duct": "The duct running off the unit and out through the wall, discharging away from the fence line and the public walkway rather than toward either one.",
      },
      title: "Find and confirm the negative-air unit and its discharge",
      cue: "Locate the running negative-air machine and check where its exhaust duct actually lets out.",
      why: "You cannot see fibre and you are not equipped to test for it, so what you actually watch for is the machine that is supposed to be controlling it: a negative-air unit that has stopped, or a duct discharging toward the fence instead of away from it, are both things a competent person needs to hear about immediately — not things an awareness worker fixes, but things only an awareness worker standing here all shift is positioned to notice at all.",
    },
    {
      id: "wet-method-watch", kind: "track", target: "binoculars", seconds: 6,
      title: "Hold the binoculars steady on the wet method work",
      cue: "Keep the view steady on the crew wetting the material behind the fence — don't let it drift off target.",
      why: "A glance that slides off the work after two seconds tells you nothing about whether the wet method held for the whole time that material was being disturbed, and disturbance is exactly when a dry patch shows itself — holding the view steady long enough to actually watch the spray stay on the material is the difference between an awareness worker who observed the procedure and one who only confirmed a crew was present.",
      track: {
        start: 0.15, green: [0.35, 0.6], rise: 0.45, fall: 0.4, drift: 0.13, label: "VIEW",
        readout: (v) => (v < 0.35 ? "drifted off target" : v > 0.6 ? "overcorrecting" : "steady on the work"),
      },
      holdBreakNote: "The view drifted off the work before the pass was done — bring it back and hold it there, or you've stopped actually watching.",
    },
    {
      id: "steady-watch", kind: "hold", target: "dust-monitor", seconds: 5,
      title: "Hold the monitor steady against the wind",
      cue: "Brace the handheld monitor against the gusts and hold it still for a clean reading.",
      why: "A meter waved around in a gust reads its own motion as much as it reads the air, and a fence-line reading nobody can trust is worse than no reading at all because it still gets written down and believed — holding the monitor still for the full count is what turns the number on the screen into something worth acting on.",
      holdBreakNote: "You let the monitor swing before the reading settled. Steady it again — a reading taken while it's still moving isn't a reading of the air.",
    },
    {
      id: "dust-reading", kind: "gauge", target: "dust-monitor",
      title: "Read the fence-line dust monitor",
      cue: "Read the handheld particulate monitor at the fence and commit once it holds under the site's action level.",
      why: "A properly wetted material barely dusts at all, so a fence-line reading that climbs is usually the first outside sign that the wet method has stopped working behind that fence, long before anyone outside could see or smell anything wrong — reading this meter honestly, rather than glancing at it and moving on, is how an awareness post actually does the one thing it is here to do.",
      gauge: {
        label: "FENCE-LINE PM", speed: 0.62, green: [0.15, 0.42],
        readout: (t) => `${Math.round(t * 180)} µg/m³`,
        missNote: "That reading is climbing past the action level. Note the time and call it in — do not wait to see if it comes back down on its own.",
      },
    },
    {
      id: "wheel-wash", kind: "turn", target: "wash-valve",
      title: "Run the tire wash before a load-out truck leaves",
      cue: "Open the wheel-wash valve so the truck's tires are rinsed before it rolls onto the public street.",
      why: "Whatever dust or debris is sitting on a truck's tires when it crosses this gate does not stay on the truck — it tracks straight onto the public street the moment the tires touch it, which turns a controlled site into an uncontrolled one one truck at a time. Running the wash before the gate opens, every time, is a five-second habit that is the only thing standing between this parcel's dust and the sidewalk outside it.",
      turn: { turns: 0.5, axis: "y", label: "WHEEL WASH" },
    },
    {
      id: "check-labels", kind: "find", noHint: true,
      targets: ["bag-no-label", "bag-single-bag"],
      itemNames: { "bag-no-label": "the bag with no label", "bag-single-bag": "the single-bagged section" },
      itemNotes: {
        "bag-no-label": "A sealed bag with nothing written on it. A bag that cannot be identified is a bag that cannot be tracked once it leaves this gate — it does not go on the truck until it is labeled.",
        "bag-single-bag": "One layer of poly around a section that should be wearing two. A single bag is one puncture away from being no bag at all, and it gets the second layer before it goes anywhere near the load-out.",
      },
      decoyNotes: { "bag-good": "That one is double-bagged, labeled and sitting with its manifest — let it go through." },
      title: "Check the waste bags staged for load-out",
      cue: "Find the bags at the gate that are not ready to leave — not properly double-bagged and labeled.",
      why: "The gate is the last point anyone can catch a bag before it is on a public road, so this is where the double-bag-and-label rule either holds or it does not: flagging the two that are not ready, rather than waving the whole stack through because most of it looks fine, is the entire value an awareness worker adds standing at this load-out.",
    },
    {
      id: "place-cone", kind: "drag", target: "traffic-cone",
      title: "Reroute foot traffic away from the loading ramp",
      cue: "Carry the cone to the gap in the barrier where the sidewalk runs closest to the truck ramp.",
      why: "A loading ramp with trucks backing across it and a public sidewalk running six feet from it only stays safe if somebody has actually closed the gap between them — a cone set exactly where pedestrians would otherwise cut the corner prevents the specific, ordinary way someone not on this crew ends up standing where a reversing truck cannot see them.",
      drag: { to: "cone-socket", radius: 0.45, missNote: "Not over the gap — a cone set anywhere else still leaves the actual cut-through open." },
    },
    {
      id: "gate-log", kind: "select", target: "manifest-board",
      title: "Verify the manifest is with the outbound load",
      cue: "Confirm the load-out truck has its waste manifest before it's logged through the gate.",
      why: "A truck that leaves this site without its manifest is a load nobody downstream can prove is what the paperwork says it is, and by the time that gets noticed the truck is already off-site — checking that the manifest is physically with the load, not just filed somewhere back at the office, is the last check this post can make before the load stops being this crew's problem and becomes the hauler's.",
    },
    {
      id: "secure-perimeter", kind: "sequence",
      targets: ["retie-tape", "recheck-sign", "log-closure"],
      itemNames: { "retie-tape": "retie the tape", "recheck-sign": "recheck the sign", "log-closure": "log the closing check" },
      title: "Close out the watch in order",
      cue: "Retie any loose tape, recheck the signage is still posted, then log the closing check — in that order.",
      why: "Retying the tape before rechecking the sign means the boundary is already whole by the time you're confirming what it says, and logging last means the entry in the site book actually reflects a fence line that was checked rather than one that is about to be checked after the shift is already over — reversing that order is how a closing entry ends up describing a boundary nobody actually verified.",
      outOfOrderNote: "Retie the tape first, then recheck the sign, then log it — logging before the fence is actually secure writes down a check that hasn't happened yet.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, APA_ACCENT);

    // -------------------------------------------------------------- ground
    const groundMesh = box(g, 6.0, 0.1, 5.4, 0, -0.05, -0.6, 0x5c534a, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4c463c", base2: "#403b32", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95 },
    );

    // -------------------------------------------------------------- fence line
    const FENCE_Z = -1.35;
    const fence = group(g, 0, 0, FENCE_Z);
    for (let i = -2; i <= 2; i++) cyl(fence, 0.03, 0.03, 1.5, i * 1.0, 0.75, 0, APA_STEEL, { rough: 0.5, metal: 0.6, seg: 8 });
    const mesh = box(fence, 4.1, 1.4, 0.02, 0, 0.75, 0, 0x9aa3aa, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    void mesh;

    // Regulated-area tape run continuously along the fence, in three segments
    // so one of them can sag open for the visitor interruption.
    const tapeSeg1 = box(fence, 1.5, 0.06, 0.01, -1.35, 0.95, 0.05, APA_ACCENT, { emissive: APA_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    const tapeSeg2 = box(fence, 1.5, 0.06, 0.01, 0.35, 0.95, 0.05, APA_ACCENT, { emissive: APA_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    const tapeGapMarker = box(fence, 0.35, 0.35, 0.2, -1.65, 0.7, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(fence, "regulated area — asbestos", 0, 1.55, 0.05, { css: "#e8b64a", w: 0.6 });
    reg(hits, tapeSeg1, "regulated-tape");
    void tapeSeg2;
    reg(hits, tapeGapMarker, "tape-gap");

    const boundaryPost = group(fence, 0, 0, 0.12);
    cyl(boundaryPost, 0.035, 0.035, 1.1, 0, 0.55, 0, 0xd8232a, { rough: 0.5, metal: 0.3, seg: 10 });
    torus(boundaryPost, 0.05, 0.012, 0, 1.05, 0, 0xf2f2f2, { rough: 0.4, seg: 6, seg2: 16 });
    holoTag(boundaryPost, "boundary marker", 0, 1.2, 0, { css: "#e8b64a", w: 0.34 });
    reg(hits, boundaryPost, "boundary-marker");

    // Ground just past the boundary — the trap for crossing the line.
    const beyondLine = box(g, 0.9, 0.02, 0.6, 0, 0.011, -1.75, 0xd8232a, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk in for a better look?", 0, 0.3, -1.75, { css: "#f0645b", w: 0.5 });
    reg(hits, beyondLine, "cross-boundary");

    const dangerSign = group(fence, -1.35, 0, -0.05, 0.05);
    cyl(dangerSign, 0.02, 0.02, 1.4, 0, 0.7, 0, APA_STEEL, { rough: 0.5, metal: 0.6, seg: 8 });
    const signBoard = decal(dangerSign, 0.34, 0.24, 0, 1.25, 0.02, signFace("DANGER — ASBESTOS", { bg: "#e8e2d4", accent: "#d8232a", scale: 0.4 }), { px: 200 });
    void signBoard;
    holoTag(dangerSign, "danger sign", 0, 1.5, 0.02, { css: "#d8232a", w: 0.32 });
    reg(hits, dangerSign, "danger-sign");

    // -------------------------------------------------------------- gate / load-out
    const gateX = 1.35;
    const trailer = group(fence, gateX + 0.55, 0, -0.15, -0.2);
    box(trailer, 0.9, 0.7, 0.55, 0, 0.65, 0, 0x8a8f96, { rough: 0.7, metal: 0.2, finish: "painted", tile: [2, 1] });
    const placard = decal(trailer, 0.3, 0.22, 0.46, 0.7, 0, signFace("LEAD — DEMOLITION", { bg: "#f3efe4", accent: "#3a3a3a", scale: 0.4 }), { px: 180 });
    void placard;
    holoTag(trailer, "warning placard", 0.46, 0.98, 0, { css: "#3a3a3a", w: 0.42 });
    reg(hits, trailer, "warning-placard");

    const ramp = group(g, gateX, 0, -0.7);
    box(ramp, 1.4, 0.06, 1.2, 0, 0.03, 0, 0x53585e, { rough: 0.85, finish: "concrete", tile: [2, 2] });
    holoTag(ramp, "loading ramp", 0, 0.32, 0, { css: "#e8b64a", w: 0.32 });

    const negAir = group(fence, gateX - 0.6, 0, -0.55, 0.3);
    slab(negAir, 0.36, 0.4, 0.3, 0, 0.22, 0, 0x53585e, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const fanGrille = cyl(negAir, 0.13, 0.13, 0.03, 0, 0.24, 0.16, 0x22272c, { rough: 0.6, seg: 18 });
    fanGrille.rotation.x = Math.PI / 2;
    const fanBlades = group(negAir, 0, 0.24, 0.145);
    for (let i = 0; i < 5; i++) {
      const b = box(fanBlades, 0.1, 0.022, 0.008, 0, 0, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, cast: false });
      b.rotation.z = (i * Math.PI * 2) / 5;
    }
    const lamp = ball(negAir, 0.012, 0.14, 0.4, 0.14, 0x59c97b, { emissive: 0x59c97b, ei: 1.5 });
    holoTag(negAir, "negative-air unit", 0, 0.5, 0.2, { css: "#e8b64a", w: 0.4 });
    reg(hits, negAir, "negative-air-unit");

    hose(fence, [[gateX - 0.6, 0.4, -0.72], [gateX - 0.6, 0.55, -0.9], [gateX - 0.2, 0.55, -0.95]], 0.05, 0xdfe4e8, { steps: 14, rough: 0.7 });
    const ductOutlet = box(fence, 0.12, 0.1, 0.12, gateX - 0.2, 0.55, -0.95, 0xdfe4e8, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    holoTag(fence, "exhaust duct — discharges outdoors", gateX - 0.2, 0.75, -0.95, { css: "#59c97b", w: 0.5 });
    reg(hits, ductOutlet, "exhaust-duct");

    // Background crew, posed behind the fence — content, not the learner's
    // own avatar, so it is exempt from the crew-clearance rule.
    standingFigure(fence, gateX - 0.9, -0.6, { ry: 2.2, cloth: 0xe8e2d4, vest: 0xe8b64a, helmet: 0xf2f2f2, atStation: true });

    const dustMonitor = group(g, -0.55, 0, -0.95, 0.2);
    cyl(dustMonitor, 0.025, 0.025, 1.1, 0, 0.55, 0, APA_STEEL, { rough: 0.5, metal: 0.5, seg: 10 });
    const monitorHead = instrument(dustMonitor, 0, 1.05, 0.02, { ry: 0, idle: "-- µg/m³", color: APA_ACCENT });
    holoTag(dustMonitor, "fence-line dust monitor", 0, 0.22, 0, { css: "#e8b64a", w: 0.5 });
    reg(hits, monitorHead, "dust-monitor");

    const washValve = group(g, gateX + 0.1, 0, 0.05);
    cyl(washValve, 0.06, 0.06, 0.5, 0, 0.25, 0, APA_STEEL, { rough: 0.5, metal: 0.5, seg: 12 });
    const vw = valveWheel(washValve, 0, 0.55, 0, { color: 0x4fb8c9, body: 0x2b5a63, r: 0.08 });
    hose(g, [[gateX + 0.1, 0.5, 0.05], [gateX + 0.05, 0.15, -0.35], [gateX, 0.1, -0.6]], 0.02, 0x4fb8c9, { steps: 12 });
    holoTag(washValve, "wheel-wash valve", 0, 0.75, 0, { css: "#4fb8c9", w: 0.38 });
    reg(hits, vw, "wash-valve");
    const washSpray = particles(g, 24, 0x9fd0e8, { size: 0.02, life: 0.4, additive: false, opacity: 0.5 });
    washSpray.position.set(gateX, 0.15, -0.6);

    // Loose debris scrap by the fence — the touch trap.
    const debris = group(g, -0.9, 0, -1.15);
    box(debris, 0.14, 0.03, 0.1, 0, 0.02, 0, 0x9a917c, { rough: 0.9 });
    for (let i = 0; i < 3; i++) box(debris, 0.02, 0.01, 0.012, -0.04 + i * 0.04, 0.045, 0, 0x2b2418, { rough: 0.6, cast: false });
    holoTag(debris, "loose scrap — pick it up?", 0, 0.2, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, debris, "touch-debris");

    // Waste bags staged for load-out: one compliant (decoy), one unlabeled,
    // one single-bagged.
    const bagBench = group(g, gateX - 0.1, 0, -1.05);
    box(bagBench, 1.1, 0.02, 0.36, 0, 0.02, 0, 0x2b3138, { rough: 0.7 });
    const bagGood = group(bagBench, -0.35, 0, 0);
    box(bagGood, 0.22, 0.18, 0.18, 0, 0.1, 0, 0xdfe6a8, { rough: 0.55 });
    box(bagGood, 0.25, 0.21, 0.21, 0, 0.11, 0, 0xf2c14b, { rough: 0.55, opacity: 0.55, transparent: true });
    decal(bagGood, 0.18, 0.05, 0, 0.201, 0, signFace("ACM WASTE", { bg: "#7d1512", accent: "#f2ae14", scale: 0.5 }), { px: 100 });
    reg(hits, bagGood, "bag-good");

    const bagNoLabel = group(bagBench, 0, 0, 0);
    box(bagNoLabel, 0.22, 0.18, 0.18, 0, 0.1, 0, 0xdfe6a8, { rough: 0.55 });
    box(bagNoLabel, 0.25, 0.21, 0.21, 0, 0.11, 0, 0xd8d8d0, { rough: 0.55, opacity: 0.55, transparent: true });
    holoTag(bagNoLabel, "no label", 0, 0.3, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, bagNoLabel, "bag-no-label");

    const bagSingle = group(bagBench, 0.35, 0, 0);
    box(bagSingle, 0.22, 0.18, 0.18, 0, 0.1, 0, 0xdfe6a8, { rough: 0.55 });
    holoTag(bagSingle, "single-bagged", 0, 0.3, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, bagSingle, "bag-single-bag");

    // Gate release the wrong response would press to wave the load through.
    const gateRelease = group(g, gateX + 0.5, 0, -0.35);
    box(gateRelease, 0.1, 0.05, 0.06, 0, 0.85, 0, 0x2b3138, { rough: 0.5 });
    ball(gateRelease, 0.022, 0, 0.85, 0.035, 0xd8232a, { emissive: 0xd8232a, ei: 1.6, rough: 0.4 });
    holoTag(gateRelease, "release the gate?", 0, 1.02, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, gateRelease, "wave-through-load");

    // End-of-shift closing markers — distinct invisible points near the tape
    // and the sign, each its own hit so re-using a registered object doesn't
    // overwrite an earlier id (log-closure is added once the log stand exists).
    const retieMarker = box(fence, 0.3, 0.3, 0.2, 0.35, 0.75, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(fence, "retie the tape", 0.35, 1.1, 0.1, { css: "#e8b64a", w: 0.32 });
    reg(hits, retieMarker, "retie-tape");
    const recheckMarker = box(dangerSign, 0.4, 0.3, 0.15, 0, 1.25, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, recheckMarker, "recheck-sign");

    const manifestBoard = group(g, gateX + 0.4, 0, -0.9, -0.3);
    box(manifestBoard, 0.14, 0.005, 0.2, 0, 0.75, 0, 0xf3efe4, { rough: 0.9 });
    decal(manifestBoard, 0.12, 0.18, 0, 0.753, 0, signFace("MANIFEST", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(manifestBoard, "manifest board", 0, 0.9, 0, { css: "#e8b64a", w: 0.32 });
    reg(hits, manifestBoard, "manifest-board");

    // ------------------------------------------------------------- public side
    const logStand = group(g, -1.35, 0, 0.8, 0.3);
    box(logStand, 0.06, 1.0, 0.06, 0, 0.5, 0, APA_STEEL, { rough: 0.5, metal: 0.5 });
    box(logStand, 0.4, 0.02, 0.3, 0, 1.0, 0, 0x3a3c3e, { rough: 0.6 });
    decal(logStand, 0.34, 0.24, 0, 1.011, 0, signFace("SITE LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 })).rotation.x = -Math.PI / 2;
    holoTag(logStand, "site log", 0, 1.25, 0, { css: "#e8b64a", w: 0.3 });
    reg(hits, logStand, "site-log");
    const logCloseMarker = box(logStand, 0.4, 0.1, 0.3, 0, 1.05, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, logCloseMarker, "log-closure");

    const ppeRack = group(g, -1.85, 0, 0.3, -0.5);
    box(ppeRack, 0.06, 1.6, 0.06, 0, 0.8, 0, APA_STEEL, { rough: 0.5, metal: 0.5 });
    const hardHat = ball(ppeRack, 0.12, 0.16, 1.35, 0.05, APA_ACCENT, { rough: 0.4, seg: 14, seg2: 10 });
    holoTag(ppeRack, "hard hat", 0.16, 1.5, 0.05, { css: "#e8b64a", w: 0.24 });
    reg(hits, hardHat, "hard-hat");
    const vest = box(ppeRack, 0.3, 0.4, 0.1, -0.02, 1.0, 0.05, 0xf2ae14, { rough: 0.7 });
    holoTag(ppeRack, "hi-vis vest", -0.02, 1.25, 0.05, { css: "#e8b64a", w: 0.28 });
    reg(hits, vest, "hi-vis-vest");
    const glasses = group(ppeRack, 0.02, 0.65, 0.06);
    torus(glasses, 0.03, 0.008, -0.035, 0, 0, 0x2b3138, { rough: 0.4, seg: 6, seg2: 16 });
    torus(glasses, 0.03, 0.008, 0.035, 0, 0, 0x2b3138, { rough: 0.4, seg: 6, seg2: 16 });
    holoTag(glasses, "safety glasses", 0, 0.14, 0, { css: "#e8b64a", w: 0.32 });
    reg(hits, glasses, "safety-glasses");

    const chest = toolChest(g, 1.7, 1.2, { ry: -0.6, color: APA_ACCENT });
    void chest;
    const radioDock = group(g, 1.55, 0, 0.5, -0.4);
    box(radioDock, 0.1, 0.24, 0.06, 0, 0.12, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    ball(radioDock, 0.014, 0, 0.27, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
    holoTag(radioDock, "radio", 0, 0.4, 0, { css: "#e8b64a", w: 0.22 });
    reg(hits, radioDock, "radio-unit");

    // Tape roll on the awareness worker's own bench — the self-repair trap.
    const binoculars = group(g, -0.3, 0, 0.5, 0.15);
    box(binoculars, 0.02, 0.6, 0.02, 0, 0.3, 0, APA_STEEL, { rough: 0.5, metal: 0.5 });
    box(binoculars, 0.16, 0.06, 0.08, 0, 0.62, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    for (const dx of [-0.05, 0.05]) cyl(binoculars, 0.024, 0.024, 0.06, dx, 0.62, 0.05, 0x1b1e22, { rough: 0.4, metal: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(binoculars, "binoculars", 0, 0.8, 0, { css: "#e8b64a", w: 0.32 });
    reg(hits, binoculars, "binoculars");

    const tapeRoll = group(g, -1.6, 0, 0.6, 0.2);
    torus(tapeRoll, 0.05, 0.03, 0, 0.06, 0, 0xd8232a, { rough: 0.6, seg: 10, seg2: 20 });
    holoTag(tapeRoll, "tape — patch it yourself?", 0, 0.18, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, tapeRoll, "self-patch-tape");

    // Traffic cone and the gap it belongs at.
    const traffic = cone(g, 1.0, 0.6, { color: APA_ACCENT });
    reg(hits, traffic, "traffic-cone");
    const coneSocket = box(g, 0.3, 0.02, 0.3, gateX - 0.15, 0.011, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["cone-socket"] = coneSocket;

    for (let i = 0; i < 2; i++) barrierPanel(g, -2.3 + i * 1.0, 1.8, { color: APA_ACCENT });

    // A visitor, off to one side on the public sidewalk until the interrupt
    // moves them under the tape.
    const visitor = standingFigure(g, -1.7, -0.6, { ry: 1.1, cloth: 0x3a5a68, atStation: true });
    holoTag(visitor, "visitor", 0, 1.9, 0, { css: "#f0645b", w: 0.24 });
    visitor.visible = false;

    // ------------------------------------------------------------------ dust
    const siteDust = particles(g, 40, 0xc9b99a, { size: 0.03, life: 1.0, additive: false, opacity: 0.22 });
    siteDust.position.set(gateX - 0.4, 0.3, -1.1);

    let bagTearActive = false, visitorAcross = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.2),
      footprint: 2.4,

      onStepComplete(step) {
        if (step.id === "check-labels") { /* both flagged bags stay visible as findings */ }
        if (step.id === "wheel-wash") { washSpray.visible = true; }
        if (step.id === "gate-log") { bagGood.children[1].material = mat(0x59c97b, { rough: 0.55, opacity: 0.9, transparent: true }); }
        if (step.id === "secure-perimeter") { tapeSeg1.material = mat(APA_ACCENT, { emissive: APA_ACCENT, ei: 1.2, rough: 0.5 }); }
      },

      onInterrupt(it) {
        if (it.id === "bag-tears-ramp") {
          bagTearActive = true;
          bagSingle.rotation.z = 0.9;
          bagSingle.position.y = -0.05;
        }
        if (it.id === "visitor-under-tape") {
          visitorAcross = true;
          visitor.visible = true;
          visitor.position.set(-0.6, 0, -1.2);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bag-tears-ramp") { bagTearActive = false; bagSingle.rotation.z = 0; bagSingle.position.y = 0; }
        if (it.id === "visitor-under-tape") { visitorAcross = false; visitor.visible = false; }
      },

      animate(t, dt, session) {
        fanBlades.rotation.z += dt * 12;
        lamp.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.4;
        siteDust.visible = true;
        siteDust.userData.step(dt, new THREE.Vector3(-0.3, 0.2, 0.1), 0.15, 0.4, 0.1);
        washSpray.visible = session?.step?.id === "wheel-wash" && (session.turn?.amount ?? 0) > 0;
        if (washSpray.visible) washSpray.userData.step(dt, new THREE.Vector3(0, -0.6, 0), 0.08, 0.7, -1.2);
        if (session?.turn && session.step?.id === "wheel-wash") vw.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "dust-reading") {
          repaint(monitorHead.userData.screen, signFace(`${Math.round(gg.t * 180)}`, {
            bg: "#0d1c24", accent: gg.t > 0.15 && gg.t < 0.42 ? "#59c97b" : "#f0645b", fg: "#ffe9b0", scale: 0.6,
          }));
        }
        void bagTearActive; void visitorAcross;
      },
    };
  },
};
