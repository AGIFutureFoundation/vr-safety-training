import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, lockTag, reg,
  surfaceTexture, texturedMat, asphaltFace, gravelFace, gratingFace, safetyStripeFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Water Main Break Emergency Shutdown & Excavation VR — Water &
// Environmental, UWUA water distribution crew.
//
// A break under the street is a race between two things: getting the flow
// stopped, and not creating a second emergency while doing it. The valve
// book decides which two valves actually make the section — not habit, not
// the nearest box lid — and the order they close in matters as much as
// whether they close at all: shut the wrong one first and the surge the
// other one stops has to go somewhere. Once the section is dead, the pit is
// somebody's excavation before it is anybody's repair, which is why the
// locate ticket is read before a shovel touches the road and the clamp does
// not go on until the gauge, not a guess, says the main is actually at zero.
// Sited generically: no real street, main size or customer named, and no
// clause number this crew is not sure of.

const UT1_ACCENT = 0x3fa3e0;
const UT1_CSS = "#3fa3e0";
const UT1_PAL = palette("utility");

export const SIM_UT_WATER_MAIN_BREAK_EMERGENCY_SHUTDOWN_AND_EXCAVATION = {
  id: "ut-water-main-break-emergency-shutdown-and-excavation",
  index: "ut-01",
  domain: "Water",
  trade: "UWUA water distribution crew — emergency main-break response",
  category: "Water & Environmental",
  weather: "rain",
  certification: "UWUA water utility crew training; AWWA C651 disinfecting water mains for the section's return to service; OSHA 29 CFR 1926 Subpart P excavations for the repair pit; OSHA 29 CFR 1910.147 the control of hazardous energy for locking out the isolated valves; the utility's own valve book and dispatch procedure for which two valves actually make this section",
  name: "Water Main Break Emergency Shutdown & Excavation",
  title: simTitle("Water Main Break Emergency Shutdown"),
  tagline: "The valve book decides which two valves make the section and the order they close in, the locate ticket is read before the pit is opened, and the clamp does not go on until the gauge — not a guess — says the main is actually at zero",
  accent: UT1_ACCENT,
  accentCss: UT1_CSS,
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "main-isolated", name: "Main Isolated", note: "A break shut down on the valve book's own two valves, in order, with the pit proven safe and the section clamped only after the gauge read zero" },

  game: system({
    name: "Distribution Authority",
    currency: "GPM",
    ranks: ["Apprentice", "Service Crew", "Distribution Operator", "Crew Lead", "Distribution Authority Certified"],
    badges: [
      { id: "book-before-boxes", name: "Book Before Boxes", note: "The valve book was read before either box lid was touched", test: AWARD.stepClean("break-report") },
      { id: "order-held", name: "Order Held", note: "Downstream closed before upstream, every time, with no unsafe action", test: AWARD.safe },
      { id: "zero-before-clamp", name: "Zero Before Clamp", note: "Held the isolation watch steady before the clamp ever touched the pipe", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shutdown", name: "Clean Shutdown", note: "No corrections from the report to the log", test: AWARD.clean },
      { id: "unbroken-watch", name: "Unbroken Watch", note: "The isolation watch ran to completion without a break", test: AWARD.unbroken },
      { id: "street-back-fast", name: "Street Back Fast", note: "Section returned to service inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-locate-check": "You went to break ground without checking the locate ticket against the marks on the street. The marks are the only thing standing between this excavation and whatever else runs under this block — a gas main, a telecom duct, a fibre line — and a shovel that goes in before they are read finds out what is down there the hard way.",
    "wrong-valve-order": "You went to close the upstream valve before the downstream one. The downstream valve is what stops the customers past the break from pulling flow through it while it is still open; close upstream first and the whole section between the two valves is still pressurised on the break side, with nowhere for that pressure to go but out through the failure that is already there.",
    "no-traffic-control": "You went to step into the open lane before the cones and the barrier were set. A break crew works with its back to whatever is still moving in that lane, and a driver who does not yet know this block has a hole in the street has no reason to be looking for a boot in the roadway.",
    "clamp-under-pressure": "You went to set the repair clamp on the main before the isolation watch confirmed zero. A clamp bolted onto a pipe that is still finding pressure from a valve that has not fully seated is a clamp fighting the main instead of sealing it, and the water behind that pressure has already shown once today what it does when it finds a way out.",
  },

  lateNotes: {
    "downstream-valve": "The downstream valve closes first, before the upstream one — not together, and not upstream first.",
    "upstream-valve": "The upstream valve closes second, only once the downstream valve is confirmed shut and the gauge has been read.",
    "vac-wand": "The pit is cleared with the vacuum wand once the section is isolated, not while the main could still be moving water into it.",
    "repair-clamp": "The clamp goes on only after the isolation watch has held at zero for its full watch — not on the strength of the valves simply being closed.",
  },

  // Two things that happen to a crew whose hands are on a valve wheel or a
  // vac wand and whose eyes are on a gauge. See shared/game.js.
  interrupts: [
    {
      id: "hydrant-in-use-call",
      kind: "Dispatch calls about a hydrant on this main",
      // Armed on the isolation watch, so the window overlaps the moment the
      // section is believed dead but has not yet been proven that way for
      // long enough to trust.
      after: "isolation-watch", delay: 3, seconds: 13,
      alert: "Dispatch is calling: a hydrant on this exact main may still be flowing for a working fire two blocks over, and they need to know before this section goes fully dead.",
      cue: "That call decides whether this shutdown can finish — answer the radio before you touch another valve.",
      target: "dispatch-radio",
      why: "A hydrant supplying a working fire is the one customer on this main that a shutdown cannot simply proceed past, and the crew standing at the valves has no way to know it is in use unless dispatch tells them — answering the radio is what keeps this shutdown from starving an engine crew that is depending on this exact section.",
      missNote: "The radio went unanswered while the shutdown carried on. Whether that hydrant was still needed for the fire two blocks over was never confirmed before the section went dead.",
      wrongNote: "It is the radio. Nothing at the valves themselves has changed — the question is whether this main can go dead at all right now.",
    },
    {
      id: "resident-at-tape",
      kind: "A resident walks up to the open pit",
      after: "vac-clear", delay: 3, seconds: 12,
      alert: "A resident from the house across the street has walked past the cones and is standing right at the barrier tape, phone out, looking down into the open pit.",
      cue: "Get them back behind the tape before the pit opens any further.",
      target: "safety-tape",
      why: "An open pit next to a main that was, until minutes ago, actively failing is not a place for anyone who is not on this crew, and a resident filming from the tape line has no way to judge how close is too close — moving them back is what keeps a curious bystander from becoming the next thing this crew has to explain.",
      missNote: "The resident stayed right at the tape while the crew's attention stayed on the pit. Nobody was watching the one person on this block who did not know where the edge of the excavation actually was.",
      wrongNote: "It is the tape line, and the resident standing at it. The pit itself has not changed.",
    },
  ],

  supportLine: "your utility's employee assistance programme, or your UWUA steward if you are not sure how to reach it",

  steps: [
    {
      id: "break-report", kind: "select", target: "break-report",
      title: "Read the break report and valve book",
      cue: "Check the break report against the valve book: which main, which two valves make the section, and any critical customer on it.",
      why: "The valve book, not the nearest box lid, is what says which two valves actually isolate this stretch of main — a distribution system is full of valves that look right and isolate the wrong section entirely, and a hydrant or a critical customer riding this main is the one fact worth knowing before anything closes.",
    },
    {
      id: "traffic-control", kind: "sequence",
      targets: ["set-cone-a", "set-cone-b", "set-barrier"],
      itemNames: { "set-cone-a": "first cone placed", "set-cone-b": "second cone placed", "set-barrier": "barrier set across the lane" },
      title: "Set the traffic control before anyone steps into the lane",
      cue: "Place both cones, then set the barrier, before anyone works between them and the open street.",
      why: "The crew works with its back to whatever is still moving in that lane once the pit is open, and a driver who does not yet know this block has a failure in the street has no reason to be watching for anyone in the roadway — the cones and the barrier are what make this crew visible before it is vulnerable.",
      outOfOrderNote: "Both cones first, then the barrier across the lane — a barrier with no cones ahead of it gives a driver no warning before they reach it.",
    },
    {
      id: "locate-check", kind: "select", target: "locate-ticket",
      title: "Confirm the locate ticket before breaking ground",
      cue: "Check the locate ticket against the marks already on the street before any excavation begins.",
      why: "The marks are the only record of what else runs under this block — a gas main, a telecom duct, a fibre line — and reading them against the ticket now is a two-minute check against striking one of them once the vac wand or a hand tool goes into that ground.",
    },
    {
      id: "find-valve-boxes", kind: "find", noHint: true,
      targets: ["valve-box-a", "valve-box-b"],
      itemNames: { "valve-box-a": "the downstream valve box the book names", "valve-box-b": "the upstream valve box the book names" },
      itemNotes: {
        "valve-box-a": "This box lid matches the downstream valve number in the book. It closes first.",
        "valve-box-b": "This box lid matches the upstream valve number in the book. It closes second, once the downstream side is confirmed shut.",
      },
      title: "Find the two valve boxes the book names",
      cue: "Walk the block and find the two valve box lids that match the numbers in the valve book — not just any lid in the pavement.",
      why: "A distribution block can carry more valve boxes than the ones that matter to this section, and a lid worked on the strength of 'it's a valve box' rather than the number stamped in the book is how a crew isolates the wrong stretch of main while the actual break keeps running.",
    },
    {
      id: "close-downstream", kind: "turn", target: "downstream-valve",
      title: "Close the downstream valve first",
      cue: "Wind the downstream valve fully shut before touching the one upstream of the break.",
      why: "Closing downstream first stops the customers past the break from pulling flow through the failure while the section is still partly open — closed in the other order, the upstream side is already dead while the break is still being fed from behind it.",
      turn: { turns: 0.75, axis: "y", label: "DOWNSTREAM VALVE" },
    },
    {
      id: "main-gauge-read", kind: "gauge", target: "main-gauge",
      title: "Read the main gauge before the second valve",
      cue: "Bring the gauge reading down to where the book says the downstream side should sit, then commit.",
      why: "The gauge, not the feel of the wheel, is what actually says the downstream valve seated — a valve that stopped turning against grit in the seat rather than against a closed gate reads exactly like a good valve until somebody checks the number.",
      gauge: { label: "SECTION PRESSURE", speed: 0.7, green: [0.12, 0.3], readout: (t) => `${Math.round(t * 80)} psi`, missNote: "Still reading pressure the downstream valve should have taken off this side — check the valve before you close the next one." },
    },
    {
      id: "close-upstream", kind: "turn", target: "upstream-valve",
      title: "Close the upstream valve second",
      cue: "Now the downstream side is confirmed, wind the upstream valve fully shut.",
      why: "This is the valve that actually stops the break — closed only now, with the downstream side already proven dead, so the surge this valve stops has nowhere behind it to push a customer's service backward into.",
      turn: { turns: 0.75, axis: "y", label: "UPSTREAM VALVE" },
    },
    {
      id: "isolation-watch", kind: "track", target: "main-gauge", seconds: 7,
      title: "Hold the isolation watch",
      cue: "Watch the gauge stay at zero for the full watch — any creep back up means a valve has not fully seated.",
      why: "A valve that looks closed and a valve that is sealed are not always the same valve — grit, a worn seat or a gate that stopped short all read the same the instant it stops turning, and only a watch held long enough shows a slow creep back toward pressure before the pit is opened on the strength of a valve that has not actually held.",
      track: { start: 0.05, green: [0.0, 0.12], rise: 0.05, fall: 0.3, drift: 0.1, label: "SECTION PRESSURE", readout: (v) => (v > 0.12 ? "creeping back up — a valve is not seated" : "holding at zero") },
      holdBreakNote: "That reading crept back up during the watch — a valve is not fully seated, and it has to be found before this section counts as dead.",
    },
    {
      id: "vac-clear", kind: "hold", target: "vac-wand", seconds: 5,
      title: "Clear the pit with the vac wand",
      cue: "Hold the vacuum wand over the standing water and mud until the pit floor is visible.",
      why: "A flooded pit hides the barrel, hides the break itself and hides whatever else is down there until it is cleared — the vac wand does that without a shovel finding it first, which matters most right on top of a main that just failed once already today.",
      holdBreakNote: "The wand came off before the floor was visible — hold it again, a partly cleared pit still hides the break and whatever else is down there.",
    },
    {
      id: "hand-expose", kind: "find",
      targets: ["gas-line-marking", "telecom-duct"],
      itemNames: { "gas-line-marking": "the yellow-marked gas line crossing the pit", "telecom-duct": "the telecom duct along the pit wall" },
      itemNotes: {
        "gas-line-marking": "A yellow-marked gas line crosses this pit close enough that anything past a hand tool near it works to the locate ticket's clearance, not to feel.",
        "telecom-duct": "A telecom duct runs along this wall of the pit — shallow enough that widening the excavation here means hand-exposing it first, not assuming the trench box clears it.",
      },
      title: "Hand-expose what else is in this pit",
      cue: "Before any power tool goes back into the pit, find and hand-expose what else the locate ticket said would be here.",
      why: "The locate ticket named what should be near this pit, but only hand-exposing it proves exactly where — a gas line or a duct found by a machine bucket instead of a gloved hand is found by breaking it, and this pit already sits on top of one failure for the day.",
    },
    {
      id: "install-clamp", kind: "drag", target: "repair-clamp",
      title: "Bring the repair clamp to the break",
      cue: "Carry the repair clamp down and close it round the failed section.",
      why: "The clamp goes exactly round the failed section, seated on clean barrel either side of the break, because a clamp landed off-centre bridges the failure on one side and clamps sound pipe on the other — sealing nothing where it actually needs to.",
      drag: { to: "main-socket", radius: 0.45, missNote: "Not centred on the break — a clamp seated off to one side has nothing to seal on the failed side of the pipe." },
    },
    {
      id: "torque-clamp", kind: "sequence",
      targets: ["clamp-bolt-a", "clamp-bolt-b", "clamp-bolt-c"],
      itemNames: { "clamp-bolt-a": "snug all round", "clamp-bolt-b": "cross-pattern to half torque", "clamp-bolt-c": "cross-pattern to full torque" },
      title: "Torque the clamp in pattern",
      cue: "Snug all round first, then cross-pattern to half torque, then cross-pattern to full.",
      why: "A gasket pulled tight on one side first rolls out of its groove on the other before the rest of the bolts ever get there — snug, half, full, across the pattern every time, is what makes the seal even instead of even everywhere except the one bolt that went home first.",
      outOfOrderNote: "Snug all round, then half torque across the pattern, then full — pulling one bolt fully home first is how the gasket rolls before the rest catch up.",
    },
    {
      id: "return-to-service", kind: "gauge", target: "main-gauge",
      title: "Bring the section back to pressure",
      cue: "Reopen slowly and bring the section gauge back into its normal band without a spike.",
      why: "A section reopened too fast slams a column of standing water into a clamp that has not had a moment to seat under real pressure — brought back slowly, the gauge shows a smooth climb into the normal band instead of a spike that finds whatever the torque pattern might have missed.",
      gauge: { label: "RETURN PRESSURE", speed: 0.55, green: [0.55, 0.75], readout: (t) => `${Math.round(t * 80)} psi`, missNote: "That climb outran the band — back off and bring it up slower, the clamp needs to seat under load, not against a spike." },
    },
    {
      id: "close-out-log", kind: "select", target: "outage-log",
      title: "Complete the outage and disinfection log",
      cue: "Fill in the outage log: the valves operated, the clamp installed, and the flush point referenced for disinfection before this block's water is called good.",
      why: "The next crew that reads this main's record depends on this log being honest about what actually touched the water main today — which valves closed, what the repair was, and that the section was flushed and disinfected before anybody downstream drank from it, per AWWA C651, rather than assumed clean because the pressure came back.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, UT1_ACCENT);

    // ---------------------------------------------------------------- ground
    const streetTex = surfaceTexture((ctx, w, h) => asphaltFace(ctx, w, h, { base: "#2c2e30", base2: "#26282a" }), { repeat: 3, px: 384 });
    const street = box(g, 5.6, 0.06, 4.2, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    street.material = texturedMat(streetTex, { rough: 0.95, metal: 0.02, color: UT1_PAL.ground });
    const walkTex = surfaceTexture((ctx, w, h) => gravelFace(ctx, w, h, { base: "#6b665c", base2: "#5e5a51" }), { repeat: 5, px: 320 });
    const walk = box(g, 1.4, 0.08, 4.2, -2.5, 0.04, 0, 0xffffff, { rough: 0.9 });
    walk.material = texturedMat(walkTex, { rough: 0.9, metal: 0.02 });

    // -------------------------------------------------------------- the pit
    // Cut into a raised apron of spoil and road plate, the way hot-tap and
    // trench-box do it, so it reads as a hole rather than a dark smudge.
    const APRON = 0.34;
    const apron = group(g, 0.2, 0, -0.6);
    const structTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#2a2f33", base2: "#22262a" }), { repeat: 2, px: 256 });
    for (const sz of [-1, 1]) {
      const p = box(apron, 3.2, APRON, 0.5, 0, APRON / 2, sz * 1.05, 0xffffff, { rough: 0.9 });
      p.material = texturedMat(structTex, { rough: 0.9, metal: 0.1, color: UT1_PAL.structure });
    }
    for (const sx of [-1, 1]) {
      const p = box(apron, 0.5, APRON, 1.6, sx * 1.35, APRON / 2, 0, 0xffffff, { rough: 0.9 });
      p.material = texturedMat(structTex, { rough: 0.9, metal: 0.1, color: UT1_PAL.structure });
    }
    // Spoil heaped on the kerb side, and a steel road plate leaning clear.
    const spoilTex = surfaceTexture((ctx, w, h) => gravelFace(ctx, w, h, { base: "#4a3a24", base2: "#3f3120" }), { repeat: 2, px: 256 });
    for (let i = 0; i < 4; i++) {
      const s = ball(apron, 0.28 + (i % 2) * 0.07, -1.1 + i * 0.7, APRON + 0.15, -1.3, 0xffffff, { rough: 1.0, seg: 12 });
      s.material = texturedMat(spoilTex, { rough: 1.0 });
    }
    const plateTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#4a5560", base2: "#3c454e" }), { repeat: 1, px: 256 });
    const plate = box(apron, 1.35, 0.05, 0.85, 1.1, APRON + 0.28, 1.15, 0xffffff, { rough: 0.6, metal: 0.5 });
    plate.material = texturedMat(plateTex, { rough: 0.6, metal: 0.5 });
    plate.rotation.x = -0.22;

    const holeD = 0.95;
    const hole = group(g, 0.2, APRON, -0.6);
    box(hole, 2.2, 0.02, 1.6, 0, -holeD, 0, 0x33291b, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) box(hole, 0.06, holeD, 1.6, sx * 1.1, -holeD / 2, 0, 0x4a3a24, { rough: 0.96, cast: false });
    for (const sz of [-1, 1]) box(hole, 2.2, holeD, 0.06, 0, -holeD / 2, sz * 0.8, 0x4a3a24, { rough: 0.96, cast: false });
    const shield = group(hole, 0, 0, 0);
    for (const sx of [-1, 1]) box(shield, 0.05, holeD - 0.1, 1.4, sx * 1.0, -holeD / 2, 0, UT1_PAL.trim, { rough: 0.55, metal: 0.5 });
    holoTag(hole, "Shored pit", 0, 0.4, 0.75, { css: UT1_CSS, w: 0.3 });

    // The broken main crossing the bottom of the pit, with a visible failure.
    const main = group(hole, 0, -holeD + 0.3, 0);
    const barrelA = cyl(main, 0.16, 0.16, 0.9, -0.55, 0, 0, 0x4c5a62, { rough: 0.75, metal: 0.35, seg: 18 });
    barrelA.rotation.z = Math.PI / 2;
    const barrelB = cyl(main, 0.16, 0.16, 0.9, 0.55, 0, 0, 0x4c5a62, { rough: 0.75, metal: 0.35, seg: 18 });
    barrelB.rotation.z = Math.PI / 2;
    const crack = torus(main, 0.16, 0.03, 0, 0, 0, 0x1c1e20, { rough: 0.9, seg: 10, seg2: 16 });
    crack.rotation.x = Math.PI / 2;
    holoTag(main, "the failure", 0, 0.3, 0.15, { css: "#f0645b", w: 0.28 });
    const mainSocket = group(main, 0, 0.18, 0);
    hits["main-socket"] = mainSocket;

    // A gas-marked line and a telecom duct crossing near the pit wall.
    const gasLine = cyl(hole, 0.03, 0.03, 1.3, -0.9, -holeD + 0.55, 0.2, 0xf2c14b, { rough: 0.5, seg: 12 });
    gasLine.rotation.x = Math.PI / 2;
    holoTag(hole, "gas line — locate marked", -0.9, -holeD + 0.85, 0.2, { css: "#f2c14b", w: 0.5 });
    reg(hits, gasLine, "gas-line-marking");
    const telecomDuct = box(hole, 0.12, 0.08, 1.4, 0.95, -holeD + 0.5, -0.2, 0xd85c9e, { rough: 0.5 });
    holoTag(hole, "telecom duct", 0.95, -holeD + 0.8, -0.2, { css: "#d85c9e", w: 0.36 });
    reg(hits, telecomDuct, "telecom-duct");

    // ------------------------------------------------------- the valve boxes
    const valveBox = (x, z, id, label, decoy = false) => {
      const b = group(g, x, 0, z);
      const collarTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#3a3f43", base2: "#2f3337" }), { repeat: 1, px: 160 });
      const collar = cyl(b, 0.13, 0.13, 0.05, 0, 0.025, 0, 0xffffff, { rough: 0.7, metal: 0.4, seg: 16 });
      collar.material = texturedMat(collarTex, { rough: 0.7, metal: 0.4 });
      const lid = cyl(b, 0.1, 0.1, 0.03, 0, 0.05, 0, 0x2b2f33, { rough: 0.6, metal: 0.5, seg: 16 });
      decal(b, 0.16, 0.16, 0, 0.066, 0, signFace(decoy ? "WV" : label, { bg: "#1a1c1e", accent: decoy ? "#5a6066" : UT1_CSS, fg: "#eaeef0", scale: 0.6 }), { px: 128 }).rotation.x = -Math.PI / 2;
      if (!decoy) { holoTag(b, label === "12" ? "downstream box" : "upstream box", 0, 0.28, 0, { css: UT1_CSS, w: 0.4 }); reg(hits, lid, id); }
      return b;
    };
    valveBox(-1.9, 0.9, "valve-box-a", "12");
    valveBox(1.9, 1.0, "valve-box-b", "07");
    valveBox(0.2, 1.7, null, "", true);

    // Valve risers down in the pit, worked from the surface.
    const riser = (x, z, id, label) => {
      const r = group(hole, x, -holeD + 0.3, z, 0);
      cyl(r, 0.05, 0.05, holeD - 0.1, 0, (holeD - 0.1) / 2, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
      const wheel = valveWheel(r, 0, holeD - 0.05, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.09 });
      holoTag(r, label, 0, holeD + 0.14, 0, { css: UT1_CSS, w: 0.4 });
      reg(hits, wheel.userData.wheel, id);
      return wheel;
    };
    const downstreamWheel = riser(-0.55, -0.1, "downstream-valve", "downstream valve");
    const upstreamWheel = riser(0.55, -0.1, "upstream-valve", "upstream valve");

    // Section gauge, staged where a crew can watch it from the pit edge.
    const gaugePost = group(g, 1.35, 0, -1.9, -0.4);
    box(gaugePost, 0.06, 0.9, 0.06, 0, 0.45, 0, CITY.darkSteel, { rough: 0.6, metal: 0.4 });
    const mainGauge = instrument(gaugePost, 0, 0.94, 0, { idle: "-- psi", color: 0x2b2f34, w: 0.16, d: 0.14 });
    holoTag(gaugePost, "section gauge", 0, 1.14, 0, { css: UT1_CSS, w: 0.36 });
    reg(hits, mainGauge, "main-gauge");

    // Break report board and locate marks.
    const board = group(g, -2.15, 0, -1.9, 0.4);
    const boardPanel = decal(board, 0.44, 0.32, 0, 0.7, 0, paperFace("BREAK REPORT", ["Main: per the valve book", "Valves: downstream then upstream", "Critical customer: check book"], { scale: 0.78 }));
    holoTag(board, "break report & valve book", 0, 0.92, 0, { css: UT1_CSS, w: 0.56 });
    reg(hits, boardPanel, "break-report");
    box(board, 0.5, 0.7, 0.04, 0, 0.35, -0.02, UT1_PAL.structure, { rough: 0.7 });

    const marks = group(g, -0.6, 0.065, 1.6);
    for (let i = 0; i < 5; i++) box(marks, 0.16, 0.006, 0.07, -0.32 + i * 0.16, 0, 0, 0x3fa2e0, { rough: 0.8, cast: false });
    decal(marks, 0.42, 0.14, 0, 0.004, 0.24, signFace("LOCATE TICKET", { bg: "#0d2430", accent: UT1_CSS, scale: 0.42 }));
    holoTag(g, "locate ticket vs. marks", -0.6, 0.55, 1.6, { css: UT1_CSS, w: 0.5 });
    reg(hits, marks, "locate-ticket");

    // Vac wand and hose, on a compact reel — not the whole vac truck.
    const vacRig = group(g, 2.1, 0, -1.2, -0.6);
    const vacTank = cyl(vacRig, 0.22, 0.24, 0.7, 0, 0.35, 0, 0xd8b23a, { rough: 0.55, metal: 0.3, seg: 16 });
    void vacTank;
    const vacHose = cyl(vacRig, 0.035, 0.035, 1.1, -0.3, 0.2, 0.4, 0x2b2f33, { rough: 0.7, seg: 10 });
    vacHose.rotation.z = 0.6;
    const vacWand = group(vacRig, -0.8, 0.15, 0.9, 0.5);
    cyl(vacWand, 0.03, 0.03, 0.5, 0, 0, 0, 0x8a939b, { rough: 0.45, metal: 0.6, seg: 10 });
    box(vacWand, 0.06, 0.05, 0.05, 0, -0.28, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(vacRig, "vac wand", -0.8, 0.5, 0.9, { css: "#f2c14b", w: 0.28 });
    reg(hits, vacWand, "vac-wand");

    // Repair clamp, staged on the verge until it is carried in.
    const clamp = group(g, -2.3, 0, 0.4, 0.5);
    const clampTex = surfaceTexture((ctx, w, h) => safetyStripeFace(ctx, w, h, { a: "#f2c14b", b: "#1a1a1a", stripes: 6 }), { repeat: 1, px: 160 });
    const clampBand = cyl(clamp, 0.22, 0.22, 0.4, 0, 0.3, 0, 0xffffff, { rough: 0.5, metal: 0.4, seg: 18 });
    clampBand.rotation.z = Math.PI / 2;
    clampBand.material = texturedMat(clampTex, { rough: 0.5, metal: 0.4 });
    holoTag(clamp, "repair clamp", 0, 0.62, 0, { css: "#59c97b", w: 0.32 });
    reg(hits, clamp, "repair-clamp");
    const boltRig = group(hole, 0, -holeD + 0.5, 0);
    const boltGroups = [];
    for (let i = 0; i < 3; i++) {
      const b = group(boltRig, -0.2 + i * 0.2, 0, 0.2);
      torus(b, 0.032, 0.011, 0, 0, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8, seg2: 14 }).rotation.x = Math.PI / 2;
      boltGroups.push(b);
      reg(hits, b, `clamp-bolt-${"abc"[i]}`);
    }
    holoTag(boltRig, "snug, half, full", 0, 0.26, 0.24, { css: UT1_CSS, w: 0.34 });

    // Traffic control: cones, barrier and the safety tape line.
    cone(g, 2.2, 1.8, { color: 0xe4622a });
    const coneA = cone(g, 2.5, 1.4, { color: 0xe4622a });
    reg(hits, coneA, "set-cone-a");
    const coneB = cone(g, 2.6, 0.6, { color: 0xe4622a });
    reg(hits, coneB, "set-cone-b");
    const barrier = barrierPanel(g, 2.6, -0.3, { color: 0xe4622a });
    reg(hits, barrier, "set-barrier");
    const tape = box(g, 1.6, 0.02, 0.03, -2.5, 0.85, 1.55, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(g, "safety tape", -2.5, 1.0, 1.55, { css: "#f2c14b", w: 0.3 });
    reg(hits, tape, "safety-tape");

    // Dispatch radio and outage log.
    const radio = box(g, 0.1, 0.16, 0.05, -2.0, 0.9, -1.2, 0x1b1e23, { rough: 0.5 });
    holoTag(g, "dispatch radio", -2.0, 1.14, -1.2, { css: UT1_CSS, w: 0.32 });
    reg(hits, radio, "dispatch-radio");
    const logBench = group(g, 2.2, 0, 1.7);
    box(logBench, 0.9, 0.72, 0.5, 0, 0.36, 0, UT1_PAL.structure, { rough: 0.7, metal: 0.2 });
    const logPanel = decal(logBench, 0.3, 0.36, 0, 0.73, 0, paperFace("OUTAGE LOG", ["Valves operated ___", "Repair: clamp ___", "Flush & disinfect per AWWA C651"], { scale: 0.8 }));
    logPanel.rotation.x = -Math.PI / 2;
    holoTag(logBench, "outage log", 0, 0.94, 0, { css: UT1_CSS, w: 0.32 });
    reg(hits, logPanel, "outage-log");

    // Hazard decoys.
    const wrongOrder = box(hole, 0.2, 0.2, 0.2, 0.9, -holeD + 0.9, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hole, "close upstream first?", 1.0, -holeD + 1.2, -0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, wrongOrder, "wrong-valve-order");
    const skipLocate = box(g, 0.2, 0.2, 0.2, -1.0, 0.5, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just start digging?", -1.0, 0.75, 1.3, { css: "#d2312b", w: 0.42 });
    reg(hits, skipLocate, "skip-locate-check");
    const noTraffic = box(g, 0.2, 0.2, 0.2, 2.1, 0.5, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step out before the cones?", 2.15, 0.75, 0.2, { css: "#d2312b", w: 0.52 });
    reg(hits, noTraffic, "no-traffic-control");
    const clampEarly = box(hole, 0.2, 0.2, 0.2, -0.2, -holeD + 0.9, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hole, "clamp it now, feels dead?", -0.1, -holeD + 1.2, 0.35, { css: "#d2312b", w: 0.5 });
    reg(hits, clampEarly, "clamp-under-pressure");

    toolChest(g, -2.6, -1.3);
    lockTag(g, -1.0, 0.9, -1.6, { color: 0xf2c14b, lines: ["MAIN", "ISOLATED"] });
    const dispatcher = standingFigure(g, -2.7, -1.9, { ry: 0.8, cloth: 0x2b6f8f, vest: 0xf2c14b });
    void dispatcher;
    const resident = standingFigure(g, -3.0, 2.0, { ry: -0.6, cloth: 0x6a3f7a, atStation: true });

    const boardInfo = holoPanel(g, 0.95, 0.6, 2.15, 0, -1.9, (ctx, w, h) => {
      ctx.fillStyle = "#0a1e28"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = UT1_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e3f2fd"; ctx.fillText("MAIN BREAK — SHUTDOWN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f4f9fd";
      ["Downstream valve, then upstream", "Watch the gauge before the pit opens", "Locate ticket before any tool", "Clamp only after zero holds"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.15)));
    }, { ry: 0.6, accent: UT1_ACCENT });
    void boardInfo;

    let watching = false, radioAlert = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "close-downstream") repaint(mainGauge.userData.screen, signFace("24", { bg: "#0d1c14", accent: "#f2ae14", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "close-upstream") { watching = true; repaint(mainGauge.userData.screen, signFace("4", { bg: "#0d1c14", accent: "#f2ae14", fg: "#e9ffe9", scale: 0.55 })); }
        if (step.id === "isolation-watch") { watching = false; repaint(mainGauge.userData.screen, signFace("0", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 })); }
        if (step.id === "vac-clear") { crack.visible = true; }
        if (step.id === "install-clamp") { clamp.position.set(0.2 - 0.55 + 0.55, APRON - holeD + 0.55, -0.6 - 0.1); clamp.rotation.z = Math.PI / 2; clamp.rotation.y = 0; }
        if (step.id === "torque-clamp") boltGroups.forEach((b, i) => { b.rotation.z = 0.5 + i * 0.3; });
        if (step.id === "return-to-service") repaint(mainGauge.userData.screen, signFace("62", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "hydrant-in-use-call") { radioAlert = true; radio.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8, rough: 0.4 }); }
        if (it.id === "resident-at-tape") { resident.position.set(-1.1, 0, 1.5); resident.rotation.y = 0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hydrant-in-use-call") { radioAlert = false; radio.material = mat(0x1b1e23, { rough: 0.5 }); }
        if (it.id === "resident-at-tape") { resident.position.set(-3.0, 0, 2.0); resident.rotation.y = -0.6; }
      },
      onHazard() {},
      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          const step = session?.step;
          if (step?.id === "main-gauge-read") repaint(mainGauge.userData.screen, signFace(`${Math.round(gg.t * 80)}`, { bg: "#0d1c24", accent: gg.t > 0.12 && gg.t < 0.3 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
          if (step?.id === "return-to-service") repaint(mainGauge.userData.screen, signFace(`${Math.round(gg.t * 80)}`, { bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.turn && session.step?.id === "close-downstream") downstreamWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.turn && session.step?.id === "close-upstream") upstreamWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (radioAlert) radio.rotation.z = Math.sin(t * 6) * 0.05;
        void watching;
      },
    };
  },
};
