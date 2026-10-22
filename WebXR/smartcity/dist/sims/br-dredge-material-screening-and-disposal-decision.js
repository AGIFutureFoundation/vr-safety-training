import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { excavator } from "../../../shared/equipment.js";
import { spudBarge, workboat } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dredge Material Screening & Disposal Decision VR — SF Bay
// Restoration & Cleanup, pack D (contaminated sediment and water quality).
//
// Where dredged sediment goes — an in-bay placement site, a wetland being
// rebuilt with it, or an upland landfill — is decided before the dredge
// starts, from the sediment's testing, by the agencies that make up the
// Dredged Material Management Office and the project's own work plan. The
// crew's decision is narrower and just as important: does what the bucket is
// bringing up match what that decision was made about? The learner is the
// LIUNA Local 261 material screener on the dredge's deck; an IUOE Local 3
// operator runs the barge-mounted excavator, an Inlandboatmen's Union
// deckhand minds the scow and a tug skipper waits to take it away. The
// screener confirms position, screens every bite, stops the dig on material
// the characterisation did not describe, samples it under custody and holds
// the scow until the people the work plan names decide. The station never
// says where any real site's sediment went, and never makes the placement
// call itself: that is always "per the work plan".

const BRDS_ACCENT = 0x9a8ad8;

export const SIM_BR_DREDGE_MATERIAL_SCREENING_AND_DISPOSAL_DECISION = {
  id: "br-dredge-material-screening-and-disposal-decision",
  index: "BR-D7",
  domain: "Environmental",
  trade: "LIUNA Local 261 material screener on the dredge deck, with an IUOE Local 3 operating engineer on the barge-mounted excavator, an Inlandboatmen's Union deckhand on the scow and a tug skipper standing by",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA Local 261 hazardous waste and environmental remediation training (LIUNA Training and Education Fund) for the material screener; IUOE Local 3 operating engineer apprenticeship for the dredge's excavator; the DMMO suitability determination for each dredge unit and the Army Corps Section 404 permit conditions it sits under; the Regional Water Quality Control Board's Section 401 water quality certification; BCDC permit conditions for the placement sites; OSHA HAZWOPER, 29 CFR 1910.120, for screening and sampling material that may be contaminated; EPA QA/G-5 chain-of-custody practice for the unexpected-material sample; RCRA 40 CFR 262 and DTSC rules if the work plan's profile makes any of it hazardous waste",
  name: "Dredge Material Screening & Disposal Decision",
  title: simTitle("Dredge Material Screening & Disposal Decision"),
  tagline: "Matching every bite to the decision already made about it: the work plan's dredge-unit map and the suitability determination read, the dredge's position confirmed inside the unit, the scow walked and its drain shut, bites called while unexpected oily material comes up, the material sampled while the tug wants to leave, it reported in order, the scow placarded on hold, its draft read, the load ticket written, the deck walked, logged and the crew checked in",
  accent: BRDS_ACCENT,
  accentCss: "#9a8ad8",
  parSeconds: 310,
  footprint: 2.5,
  badge: { id: "held-for-the-decision", name: "Held For The Decision", note: "Stopped the dig on material the characterisation did not describe, sampled it under custody and kept the scow from leaving until the work plan's people decided" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261, IUOE Local 3 or the Inlandboatmen's Union — with the employer's employee assistance line behind it",

  game: system({
    name: "Scow Screen",
    currency: "BITE",
    ranks: ["Deck Hand", "Screener", "Senior Screener", "Dredge Inspector", "Scow Screen Certified"],
    badges: [
      { id: "in-the-unit", name: "In The Unit", note: "The determination read and the dredge's position confirmed inside the unit clean", test: AWARD.all(AWARD.stepClean("read-determination"), AWARD.stepClean("position-fix")) },
      { id: "never-sniffed", name: "Never Sniffed", note: "Never under the bucket, never a nose in the sample, never on the coaming, never a sheen washed overboard", test: AWARD.safe },
      { id: "fix-and-draft", name: "Fix And Draft", note: "Position and draft both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-screen", name: "Clean Screen", note: "No corrections from the determination to the check-in", test: AWARD.clean },
      { id: "closed-bucket", name: "Closed Bucket", note: "Held the bite call in band the whole time", test: AWARD.unbroken },
      { id: "ticket-written", name: "Ticket Written", note: "Scow ticketed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-the-bucket": "You walked under the excavator's swing to look down into the scow. A clamshell or bucket carrying wet sediment drips and sheds on its way across, and the operator is watching the scow, not the deck under the boom — anyone beneath it is where a slipped load lands. The scow is screened from the rail beside the swing, never from under it.",
    "sniff-the-sample": "You leaned in to smell the black sediment to judge the odour. A chemical odour is a reason to stand back, not lean in: whatever is giving it off is being breathed, at the strongest it will ever be, and HAZWOPER's air monitoring exists so that no one has to use their nose as the instrument. The meter reads it; the screener stays upwind.",
    "ride-the-coaming": "You stepped up onto the scow's coaming to see across the load. The coaming is a narrow wet curb above a deck of loose sediment on one side and the water on the other, and the scow moves under every bucket. The load is judged from the dredge's rail or the scow's own walkway, with the PFD fastened.",
    "hose-sheen-over": "You reached for the deck hose to wash the sheen off the scow's deck and over the side. The sheen is part of what makes this material unexpected, and washing it overboard puts it in the water the certification protects while destroying the evidence the decision will be made on. The scow's drain stays shut; the sheen stays where it is until the work plan's people have seen it.",
  },

  lateNotes: {
    "sump-valve": "Shut the scow's deck drain once the scow is alongside and walked — before the first bite, not after the deck is already draining overboard.",
    "bite-paddle": "Call the bites once the position is confirmed and the scow's drain is shut — digging before either is digging somewhere unconfirmed into a scow that leaks.",
    "hold-placard": "Hang the hold placard once the unexpected material has been sampled and reported — the placard carries the report's reference.",
    "dredge-log": "The dredge log is written after the deck walk — it records what the walk found as well as what the dig did.",
  },

  steps: [
    {
      id: "read-determination", kind: "select", target: "determination-board",
      title: "Read the dredge-unit map and the suitability determination",
      cue: "At the board: today's dredge unit and its boundaries, what the testing found in it, the placement the determination approved for it, and the work plan's procedure for material that does not match.",
      why: "Every dredge unit's placement — in the Bay, into a restoration site, or up to a landfill — was decided from testing by the agencies of the Dredged Material Management Office and written into the work plan before the dredge moved. The screener's job is to know what that decision assumed the material would be, so that anything the bucket brings up that does not match is recognised the moment it appears.",
    },
    {
      id: "deck-gear", kind: "sequence", anyOrder: true,
      targets: ["gear-pfd", "gear-helmet", "gear-coverall"],
      itemNames: { "gear-pfd": "work vest PFD, fastened", "gear-helmet": "hard hat", "gear-coverall": "coated coverall and boots" },
      title: "Gear up for the dredge deck",
      cue: "PFD fastened, hard hat under the boom, coated coverall and boots for the spray off the bucket.",
      why: "The dredge deck is a working barge beside open water with a bucket swinging overhead, so the PFD is fastened and the hard hat worn for the whole shift. The coverall and boots keep what drips off the bucket off the screener, because the material being screened is by definition material whose contents are being checked.",
    },
    {
      id: "position-fix", kind: "gauge", target: "position-display",
      title: "Confirm the dredge is inside today's unit",
      cue: "Read the positioning display and commit the bucket's position against the dredge-unit boundary before the first bite.",
      why: "The suitability determination applies to a dredge unit, a drawn area with a depth — not to wherever the dredge happens to be. A bucket a few metres over the boundary is digging material that was tested and approved for somewhere else, or not approved at all, so the position is confirmed on the display before the first bite and every time the dredge moves.",
      gauge: { label: "POSITION vs UNIT", speed: 0.66, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "fix still settling" : t <= 0.58 ? "inside the unit's boundary" : "over the boundary line"), missNote: "Outside the band — let the fix settle and read the bucket's position against the unit's boundary again." },
    },
    {
      id: "scow-walk", kind: "find", noHint: true,
      targets: ["coaming-gap", "draft-marks-fouled"],
      itemNames: { "coaming-gap": "a gap in the scow's coaming seal", "draft-marks-fouled": "the scow's draft marks caked over with mud" },
      itemNotes: {
        "coaming-gap": "The seal at a coaming joint has pulled away; wet sediment will weep through it and down the scow's side into the water all the way to the placement site.",
        "draft-marks-fouled": "The draft marks on the scow's side are caked with old mud. Nobody can read how deep the scow sits, which means nobody can tell when it is at its load line.",
      },
      title: "Walk the scow before it is loaded",
      cue: "From the rail: the coaming seals all round, and the draft marks on the side readable.",
      why: "The scow carries the material to wherever the decision sends it, and it has to arrive with the load it left with. A coaming gap leaks sediment into the water all the way there, and draft marks nobody can read mean the scow is loaded by guesswork. Both are fixed alongside, empty, where a seal and a scrubbing brush are all it takes.",
    },
    {
      id: "shut-drain", kind: "turn", target: "sump-valve",
      title: "Shut the scow's deck drain",
      cue: "Turn the scow's deck drain valve fully shut and check its indicator reads closed.",
      why: "Water squeezes out of dredged sediment as it settles in the scow, and an open deck drain lets it — and the fines in it — run straight overboard. Shutting the drain keeps that water with the load so it is managed wherever the load goes, which is part of what the placement decision assumed when it approved the unit.",
      turn: { turns: 1.25, label: "DECK DRAIN", readout: (t) => (t < 0.3 ? "open — draining overboard" : t < 0.9 ? "closing" : "shut — indicator closed") },
    },
    {
      id: "bite-call", kind: "track", target: "bite-paddle", seconds: 7,
      title: "Screen and call each bite",
      cue: "Hold the call steady: closed bucket, slow hoist through the water, a look at every bite as it breaks the surface.",
      why: "A bucket hoisted fast through the water column washes sediment out of its jaws and raises the turbidity the certification limits; a bucket swung before it is closed drips across the deck. Called at a steady pace, each bite breaks the surface slowly enough for the screener to see what it is — which is the whole point of a screener on the deck.",
      track: { start: 0.12, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "BITE CALL", readout: (v) => (v < 0.4 ? "dragging — tide window closing" : v > 0.6 ? "fast hoist — washing out" : "closed bucket, slow hoist") },
      holdBreakNote: "The call broke and the bucket came up fast and open. Bring it back to a closed bucket and a slow hoist.",
    },
    {
      id: "grab-sample", kind: "hold", target: "grab-sampler", seconds: 5,
      title: "Sample the unexpected material",
      cue: "From upwind, with the bucket grounded in the scow, hold the long-handled sampler in the black material until the jar is filled, then cap it.",
      why: "The people who will decide what happens to this material need to know what it is, and that comes from a sample taken from it, not from the screener's description. The sample is taken from upwind with the long-handled sampler and the bucket grounded, so the screener is not breathing it or standing under the swing, and it goes straight into custody.",
      holdBreakNote: "The sampler came out before the jar filled. Put it back into the black material and hold it until the jar is full.",
    },
    {
      id: "report", kind: "sequence",
      targets: ["mark-position", "photo-bite", "notify-contact"],
      itemNames: { "mark-position": "the position marked on the display", "photo-bite": "the material photographed in the scow", "notify-contact": "the work plan's contact notified" },
      title: "Report the unexpected material in order",
      cue: "Mark the position on the display first, photograph the material where it sits, then call the contact the work plan names.",
      why: "The position is marked first because the dredge is still on the spot and will drift or move; the photograph is taken before anything disturbs the material; and the call to the work plan's contact comes with both in hand, so the decision is made on where it came from and what it looked like rather than on a description over the radio.",
      outOfOrderNote: "Out of order — mark the position while the dredge is still on it, then photograph the material, then call it in with both.",
    },
    {
      id: "hold-scow", kind: "drag", target: "hold-placard",
      title: "Placard the scow on hold",
      cue: "Carry the HOLD placard to the scow's rail and hang it where the tug skipper and every deckhand will see it.",
      why: "A scow with unexpected material in it cannot go to the placement site the unit was approved for until the work plan's people decide, and a placard on its rail is what stops it being towed away by someone who did not hear the radio call. It carries the report's reference so anyone who asks knows why the scow is waiting and who is deciding.",
      drag: { to: "scow-rail", radius: 0.5, missNote: "Not on the scow's rail — the hold placard goes where the tug skipper and the deckhands will see it first." },
    },
    {
      id: "draft", kind: "gauge", target: "draft-marks",
      title: "Read the scow's draft against its load line",
      cue: "Read the cleaned draft marks and commit the reading against the scow's load line.",
      why: "A scow loaded past its load line has less freeboard than its design allows, and in a Bay chop it takes water over the coaming and sheds sediment on the way. Reading the draft against the load line decides whether the dig stops on this scow, and the reading goes on the load ticket so the placement site knows what is coming.",
      gauge: { label: "DRAFT vs LOAD LINE", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "chop on the marks — wait" : t <= 0.6 ? "under the load line" : "at the load line — stop loading"), missNote: "Outside the band — wait for the chop to settle on the marks and read the draft against the load line again." },
    },
    {
      id: "load-ticket", kind: "select", target: "load-ticket",
      title: "Write the scow's load ticket",
      cue: "Ticket the scow: dredge unit, bites and estimated volume, draft, destination held pending the decision, and the report's reference.",
      why: "The load ticket goes with the scow and is what the placement site, the Corps and the Water Board reconcile against the dredging record. With unexpected material aboard, its destination is written as held pending the decision the work plan calls for, not the unit's usual placement, so no one downstream can mistake it for an ordinary load.",
    },
    {
      id: "deck-walk", kind: "find", noHint: true,
      targets: ["deck-spill", "curtain-slack"],
      itemNames: { "deck-spill": "black material spilled on the dredge deck by the rail", "curtain-slack": "the turbidity curtain slack near the dredge" },
      itemNotes: {
        "deck-spill": "A slop of the black material has fallen on the dredge deck by the rail. It is shovelled back into the scow, not hosed overboard, and the spot goes in the log.",
        "curtain-slack": "The turbidity curtain beside the dredge has gone slack where the barge swung; its skirt is lifting and the plume the bucket raised is drifting under it.",
      },
      title: "Walk the dredge deck while the dig is stopped",
      cue: "Walk the deck and look along the curtain: anything spilled on the deck, any slack in the curtain beside the dredge.",
      why: "The stop is a chance to put right what the dig was doing while nobody was looking: material that slopped onto the deck and a curtain that went slack when the barge swung. Both are the kind of thing that turns a controlled stop for unexpected material into an uncontrolled release of it.",
    },
    {
      id: "dredge-log", kind: "select", target: "dredge-log",
      title: "Write the dredge log",
      cue: "Log the position fixes, the scow walk and its fixes, the time and place of the unexpected material, the sample and its custody, the report, the tug held, the draft, the ticket and the deck walk.",
      why: "The dredge log is the record the suitability determination is checked against after the fact — that every bucket came from the approved unit and went where it was approved to go. The unexpected material, the hold and the tug go in with their times and positions, because the log is what shows the crew stopped when the material stopped matching, which is the point of screening at all.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator, the deckhand and the tug",
      cue: "On the radio: the scow is on hold and logged, who is deciding and when the crew will hear, and how everyone is after a stop on unknown material.",
      why: "Unknown material in the bucket is unsettling for everyone on the dredge — the operator who dug it, the deckhand on the scow beside it, the skipper told to wait. The check-in says out loud who is deciding and when, so nobody guesses, and it is also the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "unexpected-material",
      kind: "Unexpected material in the bucket",
      after: "bite-call", delay: 3, seconds: 14,
      alert: "The last bite has come up black and oily with a rainbow sheen and a sharp chemical smell — nothing like the grey bay mud the unit's testing described.",
      cue: "Raise the red stop flag to the operator: stop the dig and ground the bucket in the scow.",
      target: "stop-flag",
      why: "The placement decision for this unit was made about the material its testing found, and material that looks and smells like this was not part of that decision. The work plan's procedure starts with stopping, because every further bite mixes more of the unknown into a scow full of approved sediment, and the red flag is the stop the operator is watching for.",
      missNote: "The operator kept digging while the screener watched the sheen; four more bites of the black material went into the scow on top of approved sediment, and the whole load became a question instead of one bucket.",
      wrongNote: "The red stop flag — the operator has to stop digging before anything else is done.",
    },
    {
      id: "tug-wants-scow",
      kind: "Tug about to take the scow",
      after: "grab-sample", delay: 2, seconds: 13,
      alert: "The tug skipper has come alongside and is calling that he is taking the scow to the placement site now to catch the tide.",
      cue: "Get on the tug's channel: the scow is on hold, it does not move until the work plan's people decide.",
      target: "tug-radio",
      why: "The tug skipper has a tide to catch and a scow he was told to move this morning; he has not seen the black material or heard the report. The only thing that stops a routine tow is someone telling him directly, now, that the scow is held — once it is under way to the placement site, the decision has been made by default.",
      missNote: "Nobody called the tug; the skipper made the scow up and was halfway to the placement site before the supervisor's call reached him, and the scow had to be brought back with its load still in question.",
      wrongNote: "The tug's radio channel — tell the skipper directly that the scow is held.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRDS_ACCENT);

    // ------------------------------------------------- dredge deck, water
    const deck = box(g, 12, 0.12, 6.4, -2.0, 0.06, -0.6, 0xffffff, { rough: 0.85 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#4a463e", base2: "#403c34", step: 22 }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.3, color: 0xccc4b6 });
    box(g, 12, 0.08, 0.1, -2.0, 0.16, -3.8, CITY.hiVis, { rough: 0.6 });
    const water = box(g, 22, 0.02, 14, 0, 0.004, -8.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#13262a", mid: "#182f34" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8ca6aa });
    const curtain = group(g, -5.5, 0, -5.2);
    const curtainSegs = [];
    for (let i = 0; i < 4; i++) {
      const s = cyl(curtain, 0.12, 0.12, 1.4, i * 1.3 - 2.0, 0.08, 0, 0xf2c14b, { rough: 0.7, seg: 10 });
      s.rotation.z = Math.PI / 2;
      curtainSegs.push(s);
    }
    const slack = box(curtain, 1.2, 0.05, 0.1, 1.9, 0.02, 0.3, 0xb08a2a, { rough: 0.8, emissive: 0x2a2206, ei: 0.3 });
    reg(hits, slack, "curtain-slack");
    holoTag(curtain, "turbidity curtain", 0, 0.5, 0, { css: "#9a8ad8", w: 0.32 });

    // ------------------------------------------------- the dredge excavator
    const exc = excavator(g, -2.8, 0.12, -1.9, { ry: Math.PI / 2 });
    const { house, boom, bucket } = exc.userData.parts;
    house.rotation.y = -0.7;
    holoTag(g, "dredge excavator — IUOE Local 3", -5.4, 5.4, -1.9, { css: "#9a8ad8", w: 0.6 });
    const underHit = box(g, 0.6, 0.6, 0.6, -1.5, 0.45, -3.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk under the swing to look?", -1.5, 0.95, -3.2, { css: "#e8622a", w: 0.5 });
    reg(hits, underHit, "under-the-bucket");

    // ------------------------------------------------------------ the scow
    const scow = spudBarge(g, 3.2, -0.6, -7.6, { ry: Math.PI / 2, livery: { fleetName: "BAY WORKS", unitNumber: "SCOW 4" } });
    void scow;
    const load = box(g, 7.5, 0.5, 4.4, 3.2, 1.2, -7.6, 0x5a5448, { rough: 0.95 });
    const blackPatch = box(g, 1.8, 0.06, 1.4, 1.6, 1.48, -6.4, 0x141414, { rough: 0.2, metal: 0.5, emissive: 0x2a1a3a, ei: 0.3 });
    blackPatch.visible = false;
    const deckhand = standingFigure(g, 6.6, -5.7, { ry: -2.6, atStation: true, cloth: 0x2a3a48, vest: 0xf06a2b, helmet: 0xf2f2ee, gloves: true });
    deckhand.position.y = 0.95;
    holoTag(g, "scow deckhand", 6.6, 3.0, -5.7, { css: "#9a8ad8", w: 0.28 });
    // Scow-side controls and marks within reach of the dredge rail.
    const valve = group(g, 1.6, 0.95, -4.55);
    const valveRing = torus(valve, 0.1, 0.015, 0, 0.18, 0, 0x2f6fb8, { rough: 0.5, seg: 6, seg2: 16 });
    valveRing.rotation.x = Math.PI / 2;
    box(valve, 0.1, 0.18, 0.1, 0, 0.06, 0, 0x2f4d5f, { rough: 0.5, metal: 0.5 });
    const valveInd = box(valve, 0.06, 0.04, 0.02, 0.1, 0.1, 0.05, 0xd2312b, { rough: 0.5 });
    holoTag(valve, "scow deck drain", 0, 0.42, 0, { css: "#9a8ad8", w: 0.3 });
    reg(hits, valveRing, "sump-valve");
    const marks = decal(g, 0.3, 0.9, 0.2, 0.55, -4.37, (cx, w, h) => {
      cx.fillStyle = "#3d4f5c"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2f2ee"; for (let i = 0; i < 6; i++) cx.fillRect(w * 0.2, (i * h) / 6, w * 0.4, h / 30);
      cx.fillStyle = "#e0b12a"; cx.fillRect(0, h * 0.3, w, 5);
    }, { px: 64 });
    reg(hits, marks, "draft-marks");
    const mud = box(g, 0.32, 0.6, 0.02, 0.2, 0.55, -4.35, 0x4a3e30, { rough: 0.95, emissive: 0x1a1006, ei: 0.3 });
    reg(hits, mud, "draft-marks-fouled");
    const gap = box(g, 0.3, 0.14, 0.06, 2.6, 1.15, -4.45, 0x8a6a3a, { rough: 0.9, emissive: 0x3a1a06, ei: 0.35 });
    reg(hits, gap, "coaming-gap");
    const rail = group(g, -0.5, 1.25, -4.45);
    hits["scow-rail"] = rail;
    holoTag(g, "scow rail", -0.5, 1.7, -4.45, { css: "#9a8ad8", w: 0.2 });
    const coamingHit = box(g, 0.6, 0.4, 0.4, 3.8, 1.3, -4.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step up on the coaming?", 3.8, 1.72, -4.4, { css: "#e8622a", w: 0.42 });
    reg(hits, coamingHit, "ride-the-coaming");

    // ------------------------------------------------------ the tug stand-in
    const tug = workboat(g, 6.8, -0.45, -1.2, { ry: 0, livery: { fleetName: "BAY TOWING", unitNumber: "T-9" } });
    const tugHome = tug.position.clone();
    const skipper = standingFigure(g, 6.8, -0.4, { ry: Math.PI, atStation: true, cloth: 0x243a4a, vest: 0xf06a2b, helmet: 0xf2f2ee });
    skipper.position.y = 0.72;
    holoTag(g, "tug skipper", 6.8, 2.8, -0.4, { css: "#9a8ad8", w: 0.24 });

    // ------------------------------------------------ deck console and kit
    const con = group(g, 1.6, 0.12, -0.9, -0.5);
    box(con, 0.8, 0.95, 0.5, 0, 0.47, 0, 0x2b3138, { rough: 0.55, metal: 0.3 });
    const posScreen = decal(con, 0.6, 0.34, 0, 1.12, 0.1, (cx, w, h) => {
      cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#9a8ad8"; cx.lineWidth = 3; cx.strokeRect(w * 0.15, h * 0.2, w * 0.6, h * 0.6);
      cx.fillStyle = "#f2c14b"; cx.fillRect(w * 0.42, h * 0.46, 8, 8);
      cx.fillStyle = "#bfeaf7"; cx.font = `600 ${Math.round(h * 0.12)}px Arial`; cx.fillText("DU-3", w * 0.17, h * 0.16);
    }, { px: 256, glow: true, ei: 0.8 });
    posScreen.rotation.x = -0.4;
    holoTag(con, "positioning display", 0, 1.45, 0, { css: "#9a8ad8", w: 0.36 });
    reg(hits, posScreen, "position-display");
    const markBtn = cyl(con, 0.04, 0.04, 0.03, -0.25, 0.97, 0.18, 0xf2c14b, { rough: 0.4, seg: 12 });
    reg(hits, markBtn, "mark-position");
    const camera = group(con, 0.25, 0.97, 0.15);
    box(camera, 0.12, 0.08, 0.06, 0, 0.04, 0, 0x1b1e22, { rough: 0.5 });
    holoTag(con, "mark · camera", 0, 1.1, 0.3, { css: "#9a8ad8", w: 0.26 });
    reg(hits, camera, "photo-bite");
    const phone = group(g, 2.6, 0.12, 0.3, -0.6);
    box(phone, 0.3, 0.9, 0.3, 0, 0.45, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    box(phone, 0.1, 0.18, 0.05, 0, 1.0, 0.16, 0x9a8ad8, { rough: 0.5 });
    holoTag(phone, "work plan contact line", 0, 1.3, 0, { css: "#9a8ad8", w: 0.38 });
    reg(hits, phone, "notify-contact");
    const tugRadio = group(g, 3.8, 0.12, -0.5, -0.6);
    box(tugRadio, 0.3, 0.9, 0.3, 0, 0.45, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    box(tugRadio, 0.07, 0.2, 0.05, 0, 1.02, 0.16, 0xd2312b, { rough: 0.5 });
    holoTag(tugRadio, "tug channel", 0, 1.3, 0, { css: "#9a8ad8", w: 0.24 });
    reg(hits, tugRadio, "tug-radio");

    // Bite paddle, stop flag, sampler, hose.
    const call = group(g, -0.6, 0.12, -2.4);
    cyl(call, 0.03, 0.035, 0.9, 0, 0.45, 0, 0x4a4538, { rough: 0.5, metal: 0.5, seg: 10 });
    const paddle = group(call, 0, 0.92, 0);
    box(paddle, 0.3, 0.05, 0.05, 0, 0.1, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(call, "bite call", 0, 1.25, 0, { css: "#9a8ad8", w: 0.2 });
    reg(hits, paddle, "bite-paddle");
    const flag = group(g, -2.2, 0.12, -1.0);
    cyl(flag, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flagCloth = box(flag, 0.34, 0.24, 0.01, 0.18, 0.7, 0, 0xd2312b, { rough: 0.8 });
    holoTag(flag, "red stop flag", 0, 1.4, 0, { css: "#9a8ad8", w: 0.26 });
    reg(hits, flag, "stop-flag");
    const sampler = group(g, 0.4, 0.12, -3.2, 0.3);
    cyl(sampler, 0.015, 0.015, 1.8, 0, 0.6, -0.3, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6 }).rotation.x = 0.7;
    const samplerJar = cyl(sampler, 0.04, 0.04, 0.1, 0.15, 0.8, 0.2, 0xe6ecef, { rough: 0.2, seg: 10 });
    holoTag(sampler, "long-handled sampler", 0, 1.3, 0, { css: "#9a8ad8", w: 0.36 });
    reg(hits, sampler, "grab-sampler");
    const sniffHit = box(g, 0.5, 0.5, 0.5, 1.1, 1.1, -4.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean in and smell it?", 1.1, 1.5, -3.9, { css: "#e8622a", w: 0.38 });
    reg(hits, sniffHit, "sniff-the-sample");
    const hoseReel = group(g, -3.4, 0.12, 0.6);
    cyl(hoseReel, 0.22, 0.22, 0.2, 0, 0.3, 0, 0x2f6f3a, { rough: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    const hoseHit = box(hoseReel, 0.5, 0.6, 0.5, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(hoseReel, "hose the sheen overboard?", 0, 0.75, 0, { css: "#e8622a", w: 0.46 });
    reg(hits, hoseHit, "hose-sheen-over");
    const spill = box(g, 0.5, 0.03, 0.3, -1.2, 0.14, -3.5, 0x141414, { rough: 0.2, metal: 0.5 });
    reg(hits, spill, "deck-spill");
    spill.visible = false;

    // The hold placard waiting on the deck.
    const placard = group(g, -1.4, 0.12, 0.9, 0.3);
    box(placard, 0.5, 0.36, 0.03, 0, 0.5, 0, 0xd2312b, { rough: 0.6 });
    decal(placard, 0.44, 0.3, 0, 0.5, 0.02, signFace("HOLD", { bg: "#d2312b", accent: "#f2f2ee", fg: "#ffffff", scale: 0.5 }), { px: 128 });
    holoTag(placard, "hold placard", 0, 0.85, 0, { css: "#9a8ad8", w: 0.26 });
    reg(hits, placard, "hold-placard");
    const placardOnRail = box(g, 0.5, 0.36, 0.03, -0.5, 1.45, -4.42, 0xd2312b, { rough: 0.6, emissive: 0x5a0808, ei: 0.3 });
    placardOnRail.visible = false;

    // ------------------------------------------- gear, boards and radio
    const gear = group(g, -3.0, 0.12, 1.8, 0.6);
    box(gear, 0.9, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(gear, 0.8, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["gear-pfd", -0.28, 0xf06a2b, "PFD"], ["gear-helmet", 0, 0xf2f2ee, "HARD HAT"], ["gear-coverall", 0.28, 0xe8edf1, "COVERALL"]]) {
      const it = group(gear, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#0d1c24", accent: "#9a8ad8", scale: 0.45 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const board = decal(g, 0.6, 0.44, -0.9, 1.3, 1.9, paperFace("DREDGE UNIT DU-3", ["Boundary: per the unit map", "Testing: grey bay mud, as characterised", "Placement: per the determination", "Unexpected material: stop, sample, hold", "Decision: the work plan's contact"], { bg: "#ecebf4", band: "#9a8ad8" }), { px: 320 });
    board.rotation.y = 0.3;
    cyl(g, 0.03, 0.035, 1.1, -0.9, 0.6, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, board, "determination-board");
    const ticket = decal(g, 0.22, 0.28, 0.9, 1.1, 1.3, paperFace("SCOW LOAD TICKET", ["Unit: DU-3", "Draft: —", "Destination: —", "Report ref: —"], { bg: "#f2efe6", band: "#9a8ad8" }), { px: 192 });
    ticket.rotation.y = -0.4;
    box(g, 0.3, 0.9, 0.3, 1.0, 0.57, 1.18, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    reg(hits, ticket, "load-ticket");
    const logBoard = decal(g, 0.46, 0.34, 1.9, 1.25, 1.9, paperFace("DREDGE LOG", ["Fixes: —", "Bites: —", "Stops: —", "Remarks: —"], { bg: "#ecebf4", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.5;
    cyl(g, 0.03, 0.035, 1.0, 1.9, 0.6, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "dredge-log");
    const radioPost = group(g, 0.1, 0.12, 2.3);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#9a8ad8", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    const waterTex = water.material.map;
    let swing = 0, stopped = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 0.9, -3.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "position-fix") repaint(posScreen, (cx, w, h) => { cx.fillStyle = "#0d1c24"; cx.fillRect(0, 0, w, h); cx.strokeStyle = "#59c97b"; cx.lineWidth = 3; cx.strokeRect(w * 0.15, h * 0.2, w * 0.6, h * 0.6); cx.fillStyle = "#59c97b"; cx.fillRect(w * 0.42, h * 0.46, 8, 8); cx.fillStyle = "#bfeaf7"; cx.font = `600 ${Math.round(h * 0.12)}px Arial`; cx.fillText("DU-3 · IN UNIT", w * 0.17, h * 0.16); });
        if (step.id === "scow-walk") { mud.visible = false; gap.material = mat(0xe0b12a, { rough: 0.5 }); }
        if (step.id === "shut-drain") valveInd.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "grab-sample") samplerJar.material = mat(0x141414, { rough: 0.3 });
        if (step.id === "hold-scow") { placard.visible = false; placardOnRail.visible = true; spill.visible = true; }
        if (step.id === "load-ticket") repaint(ticket, paperFace("SCOW LOAD TICKET", ["Unit: DU-3", "Draft: under load line", "Destination: HELD — pending", "Report ref: logged"], { bg: "#f2efe6", band: "#d2312b" }));
        if (step.id === "deck-walk") { spill.visible = false; slack.visible = false; curtainSegs.forEach((s) => { s.material = mat(0x59c97b, { rough: 0.7 }); }); }
        if (step.id === "dredge-log") repaint(logBoard, paperFace("DREDGE LOG", ["Fixes: in DU-3", "Bites: stopped on black material", "Sampled · reported · scow held", "Tug held · deck and curtain fixed"], { bg: "#ecebf4", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "unexpected-material") blackPatch.visible = true;
        if (it.id === "tug-wants-scow") tug.position.set(tugHome.x - 1.4, tugHome.y, tugHome.z - 2.2);
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "unexpected-material") { stopped = true; flagCloth.position.y = 1.1; if (bucket) bucket.rotation.x = 0.4; }
        if (it.id === "tug-wants-scow") tug.position.set(tugHome.x + 0.6, tugHome.y, tugHome.z + 0.4);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = -t * 0.002; }
        if (session?.turn && step?.id === "shut-drain") valveRing.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "bite-call" && !stopped) {
          swing += dt * (0.4 + (session.track?.v ?? 0) * 0.8);
          house.rotation.y = -0.7 - (Math.sin(swing) * 0.5 + 0.5) * 0.7;
          if (boom) boom.rotation.x = Math.sin(swing) * 0.08;
          paddle.rotation.z = -(session.track?.v ?? 0) * 1.2;
        }
        load.position.y = 1.2 + Math.sin(t * 0.9) * 0.01;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "draft") marks.position.y = 0.55 + Math.sin(t * 3) * 0.01;
      },
    };
  },
};
