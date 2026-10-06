import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace, pavingFace,
} from "../citykit.js";
import { deckBarge } from "../../../shared/fleet.js";
import { excavator } from "../../../shared/equipment.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Barge Loading of Contaminated Sediment VR — SF Bay
// Restoration & Cleanup, Pack B (vessel and marine operations).
//
// Dewatered sediment from a shoreline cleanup is being loaded from a pier
// into a lined hopper barge for transport to the disposal site the work plan
// names. The learner is the Inlandboatmen's Union deckhand on the barge:
// walking the liner, rigging the spill apron across the gap, tending the
// spring line as she settles, signalling the IUOE Local 3 operator where to
// place each bucket so she loads level, and reading her drafts against the
// loading plan. LIUNA Local 261 hazmat laborers run the pier edge and the
// decon line. The sediment's profile, the destination and the allowed draft
// are all "per the work plan" or "the barge's loading plan" — nothing about
// any real site or its contaminants is stated. The barge is a fleet.js
// builder, the excavator an equipment.js builder, the radio a toolkit.js one.

const BRSD_ACCENT = 0xb8864a;
const BRSD_CSS = "#b8864a";

export const SIM_BR_BARGE_LOADING_OF_CONTAMINATED_SEDIMENT = {
  id: "br-barge-loading-of-contaminated-sediment",
  index: "329",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union (IBU) barge deckhand loading contaminated sediment at a pier, with an IUOE Local 3 excavator operator and LIUNA Local 261 hazmat laborers on the pier",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Inlandboatmen's Union (IBU) barge deck practice; IUOE Local 3 excavator operation; LIUNA Local 261 hazmat laborer training; OSHA 29 CFR 1910.120 HAZWOPER under the site health and safety plan; OSHA 29 CFR 1918 longshoring and 29 CFR 1926.106 work over water; RCRA waste determination and the disposal destination per the work plan; no discharge from the barge under the Regional Water Quality Control Board's requirements and the BCDC permit",
  name: "Barge Loading of Contaminated Sediment",
  title: simTitle("Barge Loading of Contaminated Sediment"),
  tagline: "Contaminated sediment loaded from a pier into a lined hopper barge: PFD over coveralls at the ladder head, the loading plan read, the liner and scuppers walked, the spill apron rigged across the gap, the spring line made fast, a radio check with the operator, the barge loaded level through a bucket spilling over her far side, the deck and coaming walked, the spring line tended as the load slumps and she lists, her drafts read against the plan, the hopper covered, decon and the load logged",
  accent: BRSD_ACCENT,
  accentCss: BRSD_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "loaded-level", name: "Loaded Level", note: "Never under the bucket, never in the hold, never across the gap, never inside the swing, and both the spill and the list answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union, IUOE Local 3 or LIUNA Local 261 — with the employer's employee assistance line behind it",

  game: system({
    name: "Hopper Deck",
    currency: "LOAD",
    ranks: ["Ordinary", "Deckhand", "Barge Hand", "Lead Deckhand", "Barge Loading Certified"],
    badges: [
      { id: "liner-first", name: "Liner First", note: "The liner and scuppers walked before the first bucket", test: AWARD.stepClean("liner-walk") },
      { id: "draft-true", name: "Draft True", note: "Drafts read inside the band first time", test: AWARD.precise(0.7) },
      { id: "out-of-the-swing", name: "Out Of The Swing", note: "Never under the bucket, never in the hold, never across the gap, never inside the swing", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-load", name: "Clean Load", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "level-load", name: "Level Load", note: "Barge held level in band all the way through loading", test: AWARD.unbroken },
      { id: "on-the-tide", name: "On The Tide", note: "Load logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "swing-radius": "You walked past the excavator's house inside its swing radius. The operator is watching the bucket and the barge, not the counterweight behind them, and the house swings through the space beside the tracks every cycle — a person there is crushed between the counterweight and whatever is behind them. The swing radius is barricaded and nobody enters it while the machine is working.",
    "into-hold": "You started down into the hopper to spread a clump of sediment by hand. A lined hold full of wet contaminated sediment is a place a boot sinks and sticks, where the next bucket lands, and where the contaminant exposure is worst — the operator places the sediment, and nobody goes into the hold while loading is under way.",
    "under-bucket": "You stood on the side deck under the bucket's path across the barge. A loaded bucket drops clumps and water as it swings, and a bucket that catches the coaming or drops its load does it onto the side deck — the deckhand works from the ends of the barge and signals from outside the swing path.",
    "step-across-gap": "You stepped across the gap between the pier and the barge instead of using the gangway. The barge moves against the fenders with every wake and settles as she loads; the gap opens and closes without warning, and a leg in it is crushed between hull and pier — or the person goes in between them. The gangway is the only way on and off.",
  },

  lateNotes: {
    "loading-radio": "Loading starts once the liner is walked, the apron rigged, the spring line fast and the radio check done with the operator.",
    "draft-marks": "The drafts are read once the loading is done and she has settled — the plan's maximum is for a loaded barge, not a light one.",
    "loading-log": "The load is logged once the hopper is covered and the crew have been through decon — last, not first.",
  },

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["barge-vest", "coverall-gloves"],
      itemNames: { "barge-vest": "work vest (PFD) over the coveralls, fastened", "coverall-gloves": "disposable coveralls and chemical gloves per the site plan" },
      title: "Coveralls, gloves and PFD on at the ladder head",
      cue: "At the head of the barge gangway on the pier: disposable coveralls and chemical gloves per the site health and safety plan, and the work vest on over them and fastened.",
      why: "The barge deck is work over water and it is also inside the site's contamination zone, so both kinds of protection go on before the gangway. The work vest goes over the coveralls so it can be seen and so its buckles are not hidden under a zip; the coveralls and gloves are what the site health and safety plan puts between the crew and the sediment, and they go on before anyone touches the barge's rails.",
    },
    {
      id: "loading-plan", kind: "select", target: "loading-plan",
      title: "Read the loading plan with the loading lead",
      cue: "Read the plan: the sediment's profile and destination per the work plan, the barge's maximum draft from her loading plan, the loading pattern fore and aft, the spill controls, and the air monitoring.",
      why: "A hopper barge loaded unevenly lists, strains her moorings and can put her deck edge under; loaded past her plan she can sink at the pier. The loading plan gives the pattern that keeps her level and the draft she must not exceed, and the work plan gives what the sediment is and where it is going — the deck needs both before the first bucket, because neither can be fixed once she is full.",
    },
    {
      id: "liner-walk", kind: "find", noHint: true,
      targets: ["liner-tear", "scupper-open"],
      itemNames: { "liner-tear": "liner torn at the coaming corner", "scupper-open": "deck scupper with its plug missing" },
      itemNotes: {
        "liner-tear": "The hopper liner has split where it folds into the coaming corner — sediment water will get behind it and out through the seams of the hopper.",
        "scupper-open": "A scupper on the side deck has no plug in it — anything that drains or spills onto the deck goes straight over the side into the Bay.",
      },
      title: "Walk the liner and the scuppers before loading",
      cue: "Walk the hopper's liner round every corner and seam, and every scupper on the side decks, before the first bucket comes over.",
      why: "The liner and the plugged scuppers are what keep contaminated water from the sediment out of the Bay, which is what the Regional Water Quality Control Board's requirements and the BCDC permit for this work come down to on the barge. A tear at a corner or a missing plug is invisible once the hold is full and the deck is muddy, so they are walked while the barge is empty and clean.",
    },
    {
      id: "rig-apron", kind: "drag", target: "spill-apron",
      title: "Rig the spill apron across the gap",
      cue: "Lay the spill apron from the pier edge to the barge's coaming under the bucket's swing, so anything the bucket drops lands on the apron, not in the water.",
      why: "Every bucket crosses the gap between pier and barge, and the gap is where a dropped clump goes straight into the Bay. The spill apron bridges it under the swing path so drips and clumps land on something that can be scraped back into the hold — it is rigged before loading because it cannot be rigged under a working bucket.",
      drag: { to: "apron-socket", radius: 0.7, missNote: "Not under the swing — the apron has to bridge the gap where the bucket crosses it, or the drops still go in the water." },
    },
    {
      id: "spring-fast", kind: "turn", target: "spring-cleat",
      title: "Make the spring line fast on the barge's cleat",
      cue: "Take the spring line's turns round the midships cleat and finish with figure-eights, leaving enough slack for her to settle as she loads.",
      why: "A barge settles as she loads and moves along the pier with every surge, and the spring line is what stops her walking fore and aft under the bucket. It is made fast with enough slack for her to settle, because a line made bar-tight on a light barge will be hanging her from the pier once she is loaded — and either part, or pull a bollard.",
      turn: { turns: 1.5, label: "SPRING LINE", readout: (t) => (t < 0.4 ? "first turn on" : t < 0.95 ? "figure-eights going on" : "made fast · slack for settling") },
    },
    {
      id: "radio-check", kind: "select", target: "loading-radio",
      title: "Radio check with the excavator operator",
      cue: "On the handheld, raise the operator: agree the loading pattern, the hand signals and the stop, and that you will call each bucket's placement.",
      why: "The operator places every bucket but cannot see the barge's list or drafts from the cab; the deckhand can. The radio check agrees who calls what before loading starts, so a call to shift the next load aft or to stop is understood the first time and not argued over with a full bucket in the air.",
    },
    {
      id: "load-level", kind: "track", target: "loading-radio", seconds: 6,
      title: "Call each bucket's placement to load her level",
      cue: "Call the bucket placements on the radio, fore and aft by the plan, holding the barge's list and trim in band as the hopper fills.",
      why: "Each bucket moves the barge's centre of weight, and a run of loads in one place lists her toward it — onto the pier fenders or away from them, straining the lines. Calling the placements by the plan and watching the inclinometer keeps her level as she fills; the deckhand's calls are the only feedback the operator has about the barge under the bucket.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.44, drift: 0.12, label: "LIST AND TRIM", readout: (v) => (v < 0.42 ? "loading light — lagging the pattern" : v > 0.6 ? "listing — shift the next load" : "level — loading to the pattern") },
      holdBreakNote: "She fell out of level — the loads bunched on one side. Call the next placements back to the pattern and hold her level.",
    },
    {
      id: "deck-walk", kind: "find", noHint: true,
      targets: ["deck-spillage", "coaming-overhang"],
      itemNames: { "deck-spillage": "sediment spilled onto the side deck", "coaming-overhang": "sediment heaped over the coaming top" },
      itemNotes: {
        "deck-spillage": "Clumps have dropped onto the side deck from the bucket's swing — slick underfoot and headed for the deck edge and the next scupper.",
        "coaming-overhang": "The load is heaped over the top of the coaming on the near side — it will slump onto the side deck, or over it, when she moves.",
      },
      title: "Walk the side deck and coaming",
      cue: "Walk the ends and the side deck: anything that has come out of the hopper onto the deck, anything heaped past the coaming.",
      why: "Sediment on the side deck is a slip on a narrow deck beside open water and contamination headed for the edge; sediment over the coaming is weight in the wrong place and a slump waiting to happen. Both are found by walking the deck between loads and fixed before more goes in — scraped back and the operator told to keep the load inside the coaming.",
    },
    {
      id: "tend-spring", kind: "hold", target: "spring-line", seconds: 5,
      title: "Tend the spring line as she settles",
      cue: "Keep the spring line at a working tension as she settles under the load — easing it through the cleat from outside its bight, never wrapped round a hand.",
      why: "As she takes the load she settles lower against the pier and the spring line tightens; left alone it takes her weight or parts. Tending it keeps her held without hanging her, and the deckhand works it from outside the bight at the cleat, because a spring line that parts snaps back along the deck toward whoever is standing in line with it.",
      holdBreakNote: "Let the spring line go bar-tight as she settled. Take it up again and ease it to a working tension.",
    },
    {
      id: "read-drafts", kind: "gauge", target: "draft-marks",
      title: "Read her drafts against the loading plan",
      cue: "Read the draft marks at the corners and commit the reading against the maximum in the barge's loading plan.",
      why: "The draft marks are the only honest measure of what the barge is carrying, and her loading plan sets the maximum for the water she will cross to the disposal site. The drafts are read once she has settled, at the corners, so a barge down by the head or the stern is caught and trimmed before the tug arrives — not discovered in open water.",
      gauge: { label: "DRAFT VS PLAN", speed: 0.72, green: [0.42, 0.58], readout: (t) => (t < 0.42 ? "light — room left in the plan" : t <= 0.58 ? "at the plan's draft" : "past the plan — offload"), missNote: "Outside the band — read the marks once she has settled, at the corners, against the loading plan's maximum." },
    },
    {
      id: "cover-hopper", kind: "drag", target: "hopper-tarp",
      title: "Pull the cover over the hopper",
      cue: "Pull the hopper cover out from its roll across the load and secure it at the coaming, so nothing blows or washes out in transit.",
      why: "An uncovered load of contaminated sediment sheds dust as it dries and washes out in spray and rain on the tow to the disposal site. The cover goes on at the pier, secured to the coaming, because nobody climbs onto a loaded hopper once she is under tow.",
      drag: { to: "tarp-socket", radius: 0.8, missNote: "Not over the load — the cover has to reach across the hopper to the far coaming, not lie folded at the near side." },
    },
    {
      id: "decon", kind: "sequence", anyOrder: true,
      targets: ["boot-wash", "glove-change"],
      itemNames: { "boot-wash": "boots scrubbed at the boot wash", "glove-change": "outer gloves and coveralls off at the change station" },
      title: "Go through the decon line before leaving the pier edge",
      cue: "At the decon line on the pier: scrub your boots at the boot wash, then outer gloves and coveralls off into the bag at the change station.",
      why: "Everything the crew wore on the barge has been in the sediment, and the decon line is what keeps it inside the contamination zone instead of in the crew truck, the break room and home. The site health and safety plan sets the order, and it is followed every time the crew leave the zone, not just at the end of the day.",
    },
    {
      id: "loading-log", kind: "select", target: "loading-log",
      title: "Log the load and what happened loading it",
      cue: "Log the load: drafts read against the plan, the liner tear and missing scupper plug, the spill over the far side and what was done, the slump and the list, and the cover secured.",
      why: "The loading log goes with the barge to the disposal site and into the project's record for the regulators: the drafts show she left inside her plan, and the spill over the far side is reported because anything that reached the water is exactly what the permit conditions are about. The liner tear goes in so it is repaired before the next load.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator and the pier crew",
      cue: "On the radio: she is loaded, covered and inside her drafts, the liner and the scupper for repair, and how everyone is after a spill over the side and a barge listing onto the pier.",
      why: "The operator loaded blind to the barge's list, and the laborers at the pier edge saw the spill first — each needs the deck's report while it is fresh. It is also the crew's own check-in: a long shift in coveralls handling contaminated material takes it out of people, and the union's member assistance line is there for what does not get said on the radio.",
    },
  ],

  interrupts: [
    {
      id: "bucket-spill",
      kind: "Bucket spills over the far side",
      after: "load-level", delay: 2, seconds: 14,
      alert: "The bucket has caught the far coaming as it swung — a slug of sediment has gone over the barge's outboard side and a brown plume is spreading on the water.",
      cue: "Call the stop to the operator and deploy the spill kit: the sorbent and turbidity boom from the kit across the plume on the far side.",
      target: "spill-kit",
      why: "Sediment in the water is the discharge the whole job is set up to prevent, and the first minutes decide how far the plume spreads on the tide. Stopping the loading and getting the spill kit's boom across the plume contains what can be contained, and it starts the report the permit conditions require — hoping it settles is not an answer the Regional Water Quality Control Board accepts.",
      missNote: "Loading carried on and the plume drifted off on the ebb along the pier face; the spill was found later from the shore, unreported and uncontained.",
      wrongNote: "The spill kit — stop the loading and get the boom across the plume before it spreads on the tide.",
    },
    {
      id: "load-slump-list",
      kind: "Load slumps, barge lists",
      after: "tend-spring", delay: 2, seconds: 14,
      alert: "The heap on the near side has slumped against the coaming and the barge is listing toward the pier, grinding on the fenders and bar-tightening the spring line.",
      cue: "Raise the operator on the loading radio: stop, and place the next loads on the high side to bring her back level.",
      target: "loading-radio",
      why: "A list toward the pier loads the fenders and the spring line and puts the near side deck lower with every bucket; carrying on the same pattern makes it worse. The operator has to hear it at once and put the next loads on the high side, because the barge will only come back level by moving weight — not by tightening the lines harder.",
      missNote: "Nobody told the operator; the next two buckets went on the near side, the list deepened, and the spring line parted with a crack across the side deck.",
      wrongNote: "The loading radio — the operator has to stop and load the high side to bring her back level.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRSD_ACCENT);

    // --------------------------------------- the water beyond the pier edge
    const water = box(g, 24, 0.02, 14, 0, 0.04, -3.9, 0xffffff, { rough: 0.12, metal: 0.25, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#15303a", mid: "#1c4250" }), { repeat: 5, px: 512 }), { rough: 0.12, metal: 0.25, color: 0xa8ccd8 });
    // Pier edge: a curb with a painted edge and a timber fender line.
    const pier = box(g, 20, 0.06, 7.4, 0, 0.03, 7.0, 0xffffff, { rough: 0.9, cast: false });
    pier.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h), { repeat: 5, px: 512 }), { rough: 0.9, color: 0xc9ced3 });
    box(g, 20, 0.16, 0.25, 0, 0.1, 3.42, 0xe8b02e, { rough: 0.6 });
    box(g, 20, 0.3, 0.14, 0, 0.1, 3.26, 0x4a3a2a, { rough: 0.95 });
    for (const bx of [-6.5, 3.4, 6.5]) cyl(g, 0.16, 0.2, 0.45, bx, 0.25, 3.95, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 12 });

    // --------------------------------- the hopper barge, deck at the pier
    const bg = group(g, 0, 0, 0);
    const barge = deckBarge(bg, 0, -1.78, 0, { ry: Math.PI / 2, kind: "hopper", livery: { fleetName: "BAY MARINE", unitNumber: "HB-9" } });
    const { load } = barge.userData.parts;
    const gangway = box(g, 1.0, 0.06, 1.2, 2.0, 0.12, 3.35, 0x8d949b, { rough: 0.5, metal: 0.6, finish: "galvanised" });
    void gangway;

    // ------------------------------------- the excavator on the pier
    const ex = excavator(g, -4.2, 0.06, 5.34, { ry: Math.PI, livery: { fleetName: "BAY RESTORATION", unitNumber: "EX-3" } });
    const { house } = ex.userData.parts;
    const pile = group(g, -7.4, 0.06, 7.0);
    cyl(pile, 1.2, 1.9, 1.2, 0, 0.6, 0, 0x4a3f33, { rough: 0.95, seg: 12 });
    const swingHit = box(g, 0.8, 1.2, 0.8, -2.0, 0.6, 6.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk past the turning house?", -2.0, 1.45, 6.4, { css: "#d2312b", w: 0.5 });
    reg(hits, swingHit, "swing-radius");

    // ------------------------------------------- liner, scupper, spillage
    const tear = box(g, 0.3, 0.3, 0.02, 3.8, 0.55, 2.2, 0x0a0c0c, { rough: 0.4, emissive: 0x2a0a08, ei: 0.3 });
    reg(hits, tear, "liner-tear");
    const scupper = cyl(g, 0.07, 0.07, 0.02, 1.0, 0.045, 2.95, 0x0a0c0c, { rough: 0.5, seg: 12 });
    reg(hits, scupper, "scupper-open");
    const spill = box(g, 0.6, 0.05, 0.4, -3.4, 0.06, 2.75, 0x4a3f33, { rough: 0.95 });
    spill.visible = false;
    reg(hits, spill, "deck-spillage");
    const over = box(g, 0.8, 0.14, 0.3, -1.6, 1.4, 2.3, 0x4a3f33, { rough: 0.95 });
    over.visible = false;
    reg(hits, over, "coaming-overhang");

    // --------------------------------------------- apron, spring line, cleat
    const apron = group(g, -1.9, 0.06, 4.3);
    box(apron, 0.9, 0.05, 0.5, 0, 0.03, 0, 0x6f7a83, { rough: 0.6, metal: 0.4, finish: "galvanised" });
    holoTag(apron, "spill apron", 0, 0.3, 0, { css: BRSD_CSS, w: 0.24 });
    reg(hits, apron, "spill-apron");
    const socket = group(g, -4.2, 0.12, 3.2);
    const socketRing = torus(socket, 0.45, 0.012, 0, 0, 0, BRSD_ACCENT, { emissive: BRSD_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    socketRing.rotation.x = Math.PI / 2;
    reg(hits, socket, "apron-socket");
    const cleat = group(g, 2.5, 0.03, 2.95);
    box(cleat, 0.34, 0.06, 0.1, 0, 0.1, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    box(cleat, 0.1, 0.1, 0.08, 0, 0.04, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    holoTag(cleat, "midships cleat", 0, 0.32, 0, { css: BRSD_CSS, w: 0.26 });
    reg(hits, cleat, "spring-cleat");
    const spring = hose(g, [[2.5, 0.16, 2.95], [2.9, 0.3, 3.4], [3.4, 0.45, 3.95]], 0.025, 0xe8dcb8, { steps: 10, rough: 0.85 });
    reg(hits, spring, "spring-line");
    holoTag(g, "spring line", 3.0, 0.7, 3.5, { css: BRSD_CSS, w: 0.22 });
    const incl = group(g, 0.4, 0.03, 2.85);
    cyl(incl, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const bubble = box(incl, 0.26, 0.04, 0.04, 0, 0.95, 0, 0x59c97b, { rough: 0.4, emissive: 0x2a7a3a, ei: 0.6 });
    holoTag(incl, "inclinometer — list", 0, 1.15, 0, { css: BRSD_CSS, w: 0.32 });
    const draft = group(g, 5.6, 0.05, 3.05);
    box(draft, 0.08, 0.3, 0.02, 0, 0.15, 0, 0xf3f5f7, { rough: 0.5 });
    const draftBar = box(draft, 0.1, 0.02, 0.03, 0, 0.1, 0.01, 0xd2312b, { rough: 0.4 });
    holoTag(draft, "draft marks — read over the side", 0, 0.5, 0, { css: BRSD_CSS, w: 0.52 });
    reg(hits, draft, "draft-marks");

    // ------------------------------------------ pier kit: radio, spill kit
    const radioPost = group(g, 0.7, 0.06, 3.75);
    cyl(radioPost, 0.022, 0.022, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const loadRadio = radio(radioPost, 0, 1.02, 0);
    holoTag(radioPost, "loading radio — operator", 0, 1.4, 0, { css: BRSD_CSS, w: 0.42 });
    reg(hits, radioPost, "loading-radio");
    const kit = group(g, -0.9, 0.06, 4.0);
    box(kit, 0.6, 0.45, 0.4, 0, 0.22, 0, 0xe8b02e, { rough: 0.6 });
    box(kit, 0.62, 0.05, 0.42, 0, 0.47, 0, 0x2b3138, { rough: 0.6 });
    holoTag(kit, "spill kit", 0, 0.72, 0, { css: BRSD_CSS, w: 0.2 });
    reg(hits, kit, "spill-kit");
    const plume = box(g, 2.0, 0.01, 1.2, -4.0, 0.055, -3.9, 0x6a5238, { rough: 0.8, cast: false });
    plume.visible = false;
    const sorbRing = hose(g, [[-5.2, 0.1, -3.9], [-4.0, 0.1, -3.1], [-2.8, 0.1, -3.9], [-4.0, 0.1, -4.7], [-5.2, 0.1, -3.9]], 0.07, 0xf2f2ee, { steps: 24, rough: 0.8 });
    sorbRing.visible = false;
    const tarp = group(g, 1.6, 0.06, 4.35);
    cyl(tarp, 0.12, 0.12, 1.0, 0, 0.12, 0, 0x2f5f8f, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(tarp, "hopper cover", 0, 0.4, 0, { css: BRSD_CSS, w: 0.24 });
    reg(hits, tarp, "hopper-tarp");
    const cover = box(g, 9.6, 0.02, 4.4, 0, 1.36, 0, 0x2f5f8f, { rough: 0.7 });
    cover.visible = false;
    const tarpSocket = group(g, 0, 1.3, 1.0);
    const tsRing = torus(tarpSocket, 0.4, 0.012, 0, 0, 0, BRSD_ACCENT, { emissive: BRSD_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    tsRing.rotation.x = Math.PI / 2;
    reg(hits, tarpSocket, "tarp-socket");

    // ----------------------------------------- decon, PPE rack, boards
    const bootWash = group(g, 3.2, 0.06, 4.6);
    box(bootWash, 0.7, 0.14, 0.5, 0, 0.07, 0, 0x2f5f8f, { rough: 0.5 });
    holoTag(bootWash, "boot wash", 0, 0.4, 0, { css: BRSD_CSS, w: 0.2 });
    reg(hits, bootWash, "boot-wash");
    const change = group(g, 4.2, 0.06, 4.8);
    box(change, 0.5, 0.8, 0.4, 0, 0.4, 0, 0xf2f2ee, { rough: 0.7 });
    holoTag(change, "change station", 0, 1.05, 0, { css: BRSD_CSS, w: 0.26 });
    reg(hits, change, "glove-change");
    const rack = group(g, 2.6, 0.06, 4.4);
    cyl(rack, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.2, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, 0.14, 0.95, 0);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xf06a2b, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.08, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(rack, "work vest — PFD", 0.14, 1.45, 0, { css: BRSD_CSS, w: 0.3 });
    reg(hits, vest, "barge-vest");
    const coverall = box(rack, 0.24, 0.5, 0.06, -0.14, 0.85, 0.02, 0xeef2f4, { rough: 0.8 });
    holoTag(rack, "coveralls and gloves", -0.14, 1.2, 0.06, { css: BRSD_CSS, w: 0.34 });
    reg(hits, coverall, "coverall-gloves");
    const drawPlan = (cx, w, h, done) => {
      cx.fillStyle = "#170f07"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRSD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f4e6d2"; cx.fillText("LOADING PLAN — HOPPER BARGE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#faf1e4";
      ["Material: profile and destination per work plan", "Max draft: the barge's loading plan", "Pattern: ends first, then midships, level",
        "Spill controls: apron, plugged scuppers, kit", "Air: monitoring per the site plan", "Swing radius: barricaded, nobody inside",
        "Decon: boot wash, then change station"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const plan = holoPanel(g, 0.82, 0.54, -0.5, 1.5, 4.9, (cx, w, h) => drawPlan(cx, w, h, false), { ry: 0, accent: BRSD_ACCENT });
    reg(hits, plan, "loading-plan");
    const drawLog = (cx, w, h, rows, done) => {
      cx.fillStyle = "#170f07"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRSD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f4e6d2"; cx.fillText("LOADING LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#faf1e4";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    };
    const llog = holoPanel(g, 0.66, 0.46, 1.5, 1.5, 5.0, (cx, w, h) => drawLog(cx, w, h, ["Load: —", "Barge: —", "Spills: —", "Remarks: —"], false), { ry: -0.3, accent: BRSD_ACCENT });
    reg(hits, llog, "loading-log");
    const crewRadio = radio(g, 2.15, 1.05, 5.1, { ry: -0.3 });
    holoTag(g, "crew radio", 2.15, 1.4, 5.12, { css: BRSD_CSS, w: 0.22 });
    reg(hits, crewRadio, "crew-radio");

    // -------------------------------------------------- hazard targets
    const holdHit = box(g, 0.8, 0.6, 0.5, 0.2, 0.9, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb into the hold to spread it?", 0.2, 1.7, 2.0, { css: "#d2312b", w: 0.56 });
    reg(hits, holdHit, "into-hold");
    const bucketHit = box(g, 0.7, 1.0, 0.6, -4.2, 0.5, 2.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the bucket's path?", -4.2, 1.2, 2.8, { css: "#d2312b", w: 0.52 });
    reg(hits, bucketHit, "under-bucket");
    const gapHit = box(g, 0.6, 0.4, 0.4, -0.9, 0.2, 3.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step across the gap?", -0.9, 0.6, 3.3, { css: "#d2312b", w: 0.36 });
    reg(hits, gapHit, "step-across-gap");

    // ------------------------------------------------------------- crew
    const laborer = standingFigure(g, -2.9, 4.6, { ry: 2.8, vest: 0xf06a2b, cloth: 0xeef2f4, helmet: 0xf1f3f4, gloves: true });
    holoTag(laborer, "LIUNA Local 261 laborer", 0, 1.95, 0, { css: BRSD_CSS, w: 0.42 });
    const lead = standingFigure(g, 0.6, 6.2, { ry: 3.0, vest: 0xf06a2b, helmet: 0xf2c14b, gloves: true });
    holoTag(lead, "loading lead", 0, 1.95, 0, { css: BRSD_CSS, w: 0.24 });

    const waterTex = water.material.map;
    return {
      hits,
      spawnLook: new THREE.Vector3(-1.5, 0.6, 1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "liner-walk") { tear.material = mat(0x1d2a22, { rough: 0.35 }); scupper.material = mat(0x8a949d, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "rig-apron") { apron.position.set(-4.2, 0.12, 3.2); socketRing.visible = false; }
        if (step.id === "load-level") { load.scale.y = 0.75; spill.visible = true; over.visible = true; }
        if (step.id === "deck-walk") { spill.visible = false; over.position.y = 1.2; over.scale.set(0.6, 1, 1); }
        if (step.id === "read-drafts") draftBar.position.y = 0.2;
        if (step.id === "cover-hopper") { cover.visible = true; tarp.visible = false; tsRing.visible = false; }
        if (step.id === "loading-log") {
          repaint(llog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Load: hopper full · covered", "Barge: at plan draft · level", "Spills: over far side, boomed", "Remarks: liner tear, scupper plug"], true));
          repaint(plan.userData.face, (cx, w, h) => drawPlan(cx, w, h, true));
        }
        if (step.id === "crew-checkin") crewRadio.userData.show?.("CH 06\nCLEAR");
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "bucket-spill") plume.visible = true;
        if (it.id === "load-slump-list") { bg.rotation.x = 0.035; load.position.z = 0.6; bubble.material = mat(0xd2312b, { emissive: 0x7a1a14, ei: 0.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bucket-spill") { sorbRing.visible = true; plume.scale.set(0.7, 1, 0.7); }
        if (it.id === "load-slump-list") { bg.rotation.x = 0; load.position.z = 0; bubble.material = mat(0x59c97b, { emissive: 0x2a7a3a, ei: 0.6 }); loadRadio.userData.show?.("CH 06\nHIGH SIDE"); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (step?.id === "load-level" && session.holding) {
          const v = session.track?.v ?? 0.5;
          load.scale.y = 0.25 + v * 0.8;
          if (house) house.rotation.y = Math.sin(t * 0.8) * 0.5;
          bubble.position.x = (v - 0.5) * 0.3;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-drafts") draftBar.position.y = 0.04 + gg.t * 0.24;
      },
    };
  },
};
