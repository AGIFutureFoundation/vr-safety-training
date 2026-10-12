import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Creosote Pile Removal VR — Maritime & Ports, station eighty-five.
//
// Pulling derelict creosote-treated timber piles from the bay on a generic
// shoreline reach beside a former shipyard — not any one site's history, the
// trade procedure a crane-barge crew runs on Bay Area creosote pile removal
// work generally (the practice the State Coastal Conservancy funds up and
// down San Francisco Bay). The learner is the deck lead and rigger who calls
// the pull to the crane operator and works the choker by hand; the operator
// on the crane is IUOE Local 3, and the barge and tug crew are the
// Inlandboatmen's Union of the Pacific. A derelict pile is a hundred-year-old
// timber soaked in coal-tar creosote, buried who knows how far into the mud,
// and every control here answers the same two questions: does the pile come
// out whole without leaving a broken stub as a hazard nobody can see, and
// does the creosote that pile has been shedding into the bay for a century
// stay out of the water on the way up rather than washing straight back in.

const CPR_ACCENT = 0x3a2e26;
const CPR_RUST = 0xc9622a;

export const SIM_CREOSOTE_PILE_REMOVAL = {
  id: "creosote-pile-removal",
  index: "85",
  domain: "Maritime",
  trade: "Pile removal deck lead / rigger — marine construction crew",
  category: "Maritime & Ports",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "Pile Drivers Local 34 (United Brotherhood of Carpenters) marine construction; IUOE Local 3 operating engineers (crane); Inlandboatmen's Union of the Pacific (IBU, ILWU marine division) — barge and tug crew; U.S. Army Corps of Engineers Section 404 permit conditions; San Francisco Bay Conservation and Development Commission (BCDC) permit; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; State Coastal Conservancy creosote pile removal program testing and disposal practice; OSHA 29 CFR 1926 Subpart CC cranes and derricks in construction",
  name: "Creosote Pile Removal",
  title: simTitle("Creosote Pile Removal"),
  tagline: "Pulling a derelict creosote pile clean: the removal plan and work window read, a turbidity curtain anchored, the choker rigged to the pile head, a steady vertical pull with no stub left below the mudline, the pile drained over the barge, cut and binned, and the sediment settled before the curtain comes up",
  accent: CPR_ACCENT,
  accentCss: "#3a2e26",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "clean-pull", name: "Clean Pull", note: "A pile pulled whole, or its stub marked and logged, drained over the barge, and no reading over the curtain's limit" },

  game: system({
    name: "Pile Deck",
    currency: "FT",
    ranks: ["Deckhand", "Pile Deck Lead", "Rigging Boss", "Removal Foreman", "Pile Deck Certified"],
    badges: [
      { id: "plan-honest", name: "Plan Honest", note: "Read the removal plan and confirmed every curtain anchor clean before the first pull", test: AWARD.all(AWARD.stepClean("plan"), AWARD.stepClean("anchor-check")) },
      { id: "nothing-adrift", name: "Nothing Adrift", note: "Never a hazard, never a reading called outside its band", test: AWARD.safe },
      { id: "true-pull", name: "True Pull", note: "Pull length and settle reading both read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-pull-run", name: "Clean Pull", note: "No corrections across the whole pile", test: AWARD.clean },
      { id: "steady-hoist", name: "Steady Hoist", note: "Held the pull rate in band the whole way up", test: AWARD.unbroken },
      { id: "pile-away", name: "Pile Away", note: "Pile pulled, drained and binned inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bight-stand": "You stood inside the bight of the choker cable while it was taking up load. A wire under strain straightens the instant whatever it is holding lets go, and anyone standing in the loop it makes on the way is taken with it — a bight is never a place to stand on a pulling deck, loaded or not.",
    "extractor-jaw-reach": "You reached into the vibratory extractor's jaws to clear a snagged strand while it was still running. The jaws close on a pile hard enough to shake a hundred-year-old timber loose from the mud, and a hand anywhere near them when the head cycles goes wherever the jaw does — the extractor gets locked out before anyone's arm goes near that opening.",
    "drain-over-water": "You swung the freshly pulled pile out over open water to let it drip instead of holding it over the barge's own drip tray. A century in the mud has left that timber saturated with creosote, and every drop that lands in the bay instead of the tray is exactly the contamination this whole removal exists to take out of the water — it drains over the barge or it does not drain yet.",
    "curtain-early-retrieve": "You started hauling the turbidity curtain back in before the settle reading came down. The plume this pull just raised is still suspended in the water column the moment the pull ends, and pulling the curtain before it settles just lets the current carry everything the curtain was holding straight out past the boundary the 401 certification measures against.",
  },

  lateNotes: {
    "choker-stage": "Rig the choker after the curtain is out and anchored — there is no boundary yet to hold whatever the first tug on this pile stirs up.",
    "pull-call": "Call the pull only once the choker is rigged and the spuds are set — there is nothing on the hook to pull yet.",
    "drip-tray": "Swing the pile over the drip tray after it clears the water, not before there is a pile up to drain.",
    "log-board": "Log the pull once the pile is drained and cut — the record wants the finished footage, not a guess made while it is still hanging on the hook.",
  },

  // Interruptions: see shared/game.js. One is the pile itself letting go
  // below the mudline mid-pull, which turns an ordinary extraction into a
  // charted hazard if nobody marks it; the other is the bay finding the
  // one anchor already carrying the most current.
  interrupts: [
    {
      id: "stub-below-mudline",
      kind: "Pile parted below the mudline",
      after: "pull", delay: 4, seconds: 13,
      alert: "The pile just let go below the mudline — the head came up on the choker but there is a stub of creosote timber still standing in the bottom, and nothing marks where it is.",
      cue: "A broken stub is now a hazard nobody else can see. Mark it before anything else moves.",
      target: "stub-marker-buoy",
      why: "A stub left below the mudline with nothing over it is a hazard to every boat and every future diver that comes through this reach until somebody charts it, and the only moment anybody on this barge knows exactly where it is is right now, on the wire, before the barge shifts off this footprint. The buoy goes over it the moment it happens, not on a note to come back to later.",
      missNote: "The barge moved on to the next pile with the broken stub unmarked, and a piece of creosote timber standing in the mud went back to being a hazard nobody downstream of this crew has any way of knowing is there.",
      wrongNote: "That's not it. The stub marker buoy is what puts this exact spot on the chart before the barge moves off it — nothing else on this deck does that.",
    },
    {
      id: "tug-wake-anchor-drag",
      kind: "Curtain anchor dragging",
      after: "drain-hold", delay: 4, seconds: 13,
      alert: "A tug's wake off the channel has set the turbidity curtain surging, and its downstream anchor is walking loose along the mud.",
      cue: "Your curtain is coming off its line. Re-tension it before it drags clear.",
      target: "curtain-turnbuckle",
      why: "The curtain only holds the plume this pull just raised while its anchors keep the skirt down against the bottom; an anchor that has walked loose opens a gap the next wake finds first, and everything creosote-laden this pull stirred up goes straight out through it into water the 401 certification exists to protect. It gets re-tensioned the moment it is seen dragging, not watched to see whether the mud holds it on its own.",
      missNote: "The anchor kept walking and the curtain lifted off the bottom on the next wake, and the plume from this pull went straight past the one control the permit was relying on to hold it.",
      wrongNote: "It's the curtain's own anchor turnbuckle. Nothing else on this bank puts the skirt back down against the bottom.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "plan-board",
      title: "Read the removal plan and the in-water work window",
      cue: "Check the Corps' Section 404 permit, the BCDC permit and today's in-water work window before rigging anything.",
      why: "The removal plan sets which piles come out today, in what order, and the permit's seasonal work window is a hard stop the tide does not care about — pulling a pile outside the window or out of the plan's sequence is work the permit was never written to cover, whatever the barge is physically capable of doing.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-vest", "stage-helmet", "stage-comms"],
      itemNames: { "stage-vest": "life vest", "stage-helmet": "hard hat", "stage-comms": "radio headset" },
      title: "Stage the deck lead's own gear",
      cue: "Life vest, hard hat, and a radio headset before stepping under the boom.",
      why: "A pulling barge is a loaded crane over open water with a hundred-year-old timber about to come off the bottom unpredictably — the vest is buoyancy the moment a wet deck takes a foot out, the hard hat is for a load nobody sees swing until it already has, and the headset is how the deck lead calls a steady pull to the operator instead of guessing at hand signals over the extractor's noise.",
    },
    {
      id: "curtain-deploy", kind: "drag", target: "turbidity-curtain",
      title: "Deploy the turbidity curtain around the pile",
      cue: "Carry the curtain out and clip it to the ring around today's pile.",
      why: "A creosote pile has been shedding its own contamination into the mud around it for a century, and pulling it stirs that mud into the water column along with whatever the extraction itself dislodges. A skirt closed all the way round the pile is what keeps that cloud inside a boundary the 401 certification can actually be measured against, so it goes in before the choker touches the pile, not after the water has already gone dark.",
      drag: { to: "curtain-ring", radius: 0.5, missNote: "Not on the ring — the curtain has to close the full loop around the pile or the plume goes straight out the gap." },
    },
    {
      id: "anchor-check", kind: "find", noHint: true,
      targets: ["anchor-1", "anchor-2", "anchor-3"],
      itemNames: { "anchor-1": "anchor 1", "anchor-2": "anchor 2", "anchor-3": "anchor 3" },
      itemNotes: {
        "anchor-1": "First point in the loop, dug in and holding against a tug on the chain.",
        "anchor-2": "Second point holds the skirt down flat against the bottom instead of letting it float up on the tide.",
        "anchor-3": "Third point closes the loop — it is also the one furthest from the barge, so nobody checks it by accident on the way past.",
      },
      title: "Confirm every point holding the curtain to the bottom",
      cue: "Find and click all three anchor points before the choker goes anywhere near the pile.",
      why: "A curtain floats loose the instant even one of its points drags out of the mud, and that failure does not announce itself from the barge deck — it shows up later as a plume nobody can explain. Confirming all three before the pull starts is what makes every reading taken for the rest of the job mean something.",
    },
    {
      id: "choker-rig", kind: "drag", target: "choker-stage",
      title: "Rig the choker to the pile head",
      cue: "Carry the choker cable out to the pile and clip it around the head.",
      why: "The choker is set by hand, by the rigger, around the pile head itself — not guessed at from the deck — because a choker that slips even a little on a pull this heavy does not slip a little, it lets go entirely with a load already coming off the bottom. Getting it square on the head before the crane ever takes a strain is the only version of this job where the pile comes up on the wire instead of coming loose from it.",
      drag: { to: "pile-head-socket", radius: 0.45, missNote: "Not seated on the pile head — a choker that slips off the timber on the first strain has nothing left to hold the pull." },
    },
    {
      id: "spuds", kind: "turn", target: "spud-winch",
      title: "Lower and set the spuds",
      cue: "Wind the spud winch down until both piles are seated and the barge stops moving on the current.",
      why: "A pull this heavy from a barge that is still working on the current does not come up vertical — it comes up at whatever angle the barge happens to be swinging at, which is exactly how a pile snaps off below the mudline instead of pulling clean. The spuds pin the barge down so the choker's pull stays straight over the pile the whole way up.",
      turn: { turns: 1.0, axis: "y", label: "SPUD WINCH" },
    },
    {
      id: "pull", kind: "track", target: "pull-call", seconds: 7,
      title: "Call the pull rate for the extraction",
      cue: "Hold the rate-call paddle in the working range — no jerked strain, no pull so slow the extractor stalls in the mud.",
      why: "A pile jerked out too fast snaps at the weakest point in a hundred years of rot and leaves the break below the mudline where nobody can see it; pulled too slow, the vibratory extractor loses the rhythm that is breaking the mud's own grip on the timber and the pile just sits there working the choker instead of coming free. Steady is what brings a rotten pile up whole instead of leaving half of it behind.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "PULL RATE", readout: (v) => (v < 0.38 ? "stalled in the mud" : v > 0.58 ? "jerking — will snap it" : "steady vertical pull") },
      holdBreakNote: "The call broke rhythm and the pull lurched on the wire — that is exactly how a rotten pile snaps off below the mudline. Bring it back to a steady rate.",
    },
    {
      id: "length-check", kind: "gauge", target: "length-indicator",
      title: "Read the pull length against the pile's known depth",
      cue: "Watch the length indicator and commit the reading against the driven depth on record.",
      why: "The record says how deep this pile was originally driven, and the only honest way to know whether the whole thing came out is to read how much timber actually cleared the mudline against that number — not to eyeball the stump end and guess. A short reading here is the first and clearest sign of a stub left behind.",
      gauge: { label: "LENGTH CLEARED", speed: 0.7, green: [0.68, 0.92], readout: (t) => `${(t * 26).toFixed(1)} ft`, missNote: "Short of the driven depth on record. Do not call this pile clear until the reading matches what was actually driven." },
    },
    {
      id: "drain-hold", kind: "hold", target: "drip-tray", seconds: 5,
      title: "Hold the pile over the drip tray",
      cue: "Swing the pile over the barge's drip tray and hold it there until it stops running.",
      why: "A pile that has sat in creosote-soaked mud for a century keeps shedding it long after it clears the water, and every drop belongs in the tray the barge is built to contain, not over the side. Held until it actually stops running, the tray catches the contamination the removal exists to take out of the bay instead of just moving it from the mud to the surface.",
      holdBreakNote: "You swung it clear before it stopped running — whatever was still draining went wherever the boom happened to be pointing. Bring it back over the tray and hold until it is done.",
    },
    {
      id: "cut-bin", kind: "sequence",
      targets: ["cut-mark", "cut-saw", "bin-place"],
      itemNames: { "cut-mark": "mark the cut lengths", "cut-saw": "cut the pile to length", "bin-place": "place the sections in the lined bin" },
      title: "Cut the pile and bin the sections",
      cue: "Mark the cut lengths, saw through them, then place each section in the lined bin, in that order.",
      why: "Marking before cutting is what keeps the sections a size the bin and the disposal manifest are actually built for, and the lined bin is what keeps creosote leaching out of cut timber from soaking into the barge deck the same way it has been soaking into the bay mud for a hundred years. Cutting before marking is how a crew ends up with sections nothing downstream was sized to take.",
      outOfOrderNote: "Mark, then cut, then bin — a section cut before it is marked is a size nobody downstream asked for.",
    },
    {
      id: "log", kind: "select", target: "log-board",
      title: "Log the pull record",
      cue: "Commit the pile's record: identifier, length cleared, and whether a stub remains below the mudline.",
      why: "The removal plan is only as good as the record built from it — the next crew, and the regulator reading the disposal manifest, need to know exactly which piles came out clean and which ones left a stub still standing, and the only place that distinction survives the day is this log, written down now rather than remembered later.",
    },
    {
      id: "settle", kind: "gauge", target: "settle-meter",
      title: "Read the settle reading before the curtain comes up",
      cue: "Take the turbidity reading inside the curtain and commit it against the permit's differential limit.",
      why: "The pull just raised a plume the curtain has been holding, and pulling the curtain in before that plume has actually settled is how sediment that would otherwise have stayed contained goes straight out with the current the moment the boundary comes down. This reading is what says the water inside the curtain is quiet enough to retrieve it without undoing everything the curtain just did.",
      gauge: { label: "SETTLE NTU", speed: 0.68, green: [0.38, 0.58], readout: (t) => `${Math.round(t * 40)} NTU`, missNote: "Still above the differential the permit allows. Give the plume more time and read it again before touching the curtain." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["choker-coil-check", "extractor-hose-check"],
      itemNames: { "choker-coil-check": "the choker cable's coil", "extractor-hose-check": "the extractor's hydraulic hose" },
      itemNotes: {
        "choker-coil-check": "The choker cable has been left in a loose heap instead of coiled. Left as is, the next pile's rigger is untangling a snag instead of setting a choker.",
        "extractor-hose-check": "The vibratory extractor's hydraulic hose has chafed against the boom on this pull. Left unchecked, it is the next pile's failure waiting on the first hard pull.",
      },
      title: "Walk the deck before the barge moves to the next pile",
      cue: "Check the choker's coil and the extractor's hydraulic hose before this footprint is left behind.",
      why: "The barge is about to move to the next pile with the crew's attention on the transit, and the choker and the extractor are what the next pull depends on completely. Both get one more look here, because neither gets a second chance once the barge is off this footprint.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CPR_RUST);

    // ------------------------------------------------------------ the water
    const water = slab(g, 6.0, 0.02, 5.6, 0, 0.01, -0.3, 0x1c2f38, { rough: 0.2, metal: 0.26, opacity: 0.85, transparent: true, cast: false });
    const haze = particles(g, 30, 0xc7d6dd, { size: 0.045, life: 1.1, additive: false, opacity: 0.2 });
    haze.position.set(0, 0.55, -1.6);

    // ------------------------------------------------------------- the barge
    const barge = group(g, -0.55, 0.19, 0.3);
    box(barge, 3.0, 0.36, 2.6, 0, -0.16, 0, 0x33291f, { rough: 0.75, metal: 0.28, cast: false });
    box(barge, 3.0, 0.05, 2.6, 0, 0.03, 0, 0x453a2c, { rough: 0.72, metal: 0.22 });
    for (let i = -1; i <= 1; i++) box(barge, 0.03, 0.01, 2.6, i * 1.0, 0.06, 0, 0x241d15, { rough: 0.8, cast: false });

    // Spuds at the forward corners, with the choker's bight — the hazard
    // hotspot the deck lead is never supposed to be standing inside.
    const spudGroup = group(barge, 0, 0, 0.9);
    const spuds = [];
    for (const sx of [-1.25, 1.25]) {
      const spud = cyl(spudGroup, 0.05, 0.05, 1.4, sx, 0.4, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
      spuds.push(spud);
    }
    const spudWinchGrp = group(barge, 0, 0.06, 0.55);
    const spudWinch = valveWheel(spudWinchGrp, 0, 0.16, 0, { r: 0.09, color: CPR_RUST, body: 0x2b3138 });
    holoTag(spudWinchGrp, "spud winch", 0, 0.42, 0, { css: "#c9622a", w: 0.32 });
    reg(hits, spudWinch.userData.wheel, "spud-winch");

    const chokerBight = group(barge, 0.65, 0.05, 0.7);
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      cyl(chokerBight, 0.012, 0.012, 0.09, Math.sin(a) * 0.32, 0.02, Math.cos(a) * 0.18 - 0.18, 0x8a7a54, { rough: 0.85, seg: 6, cast: false }).rotation.z = a;
    }
    const bightHit = box(barge, 0.5, 0.3, 0.4, 0.65, 0.2, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(barge, "stand in the bight?", 0.65, 0.5, 0.7, { css: "#e8622a", w: 0.4 });
    reg(hits, bightHit, "bight-stand");

    // Crane tower and boom over the pile, carrying the vibratory extractor.
    const craneBase = group(barge, 0, 0.03, -0.7);
    box(craneBase, 0.4, 1.3, 0.4, 0, 0.65, 0, 0x453a2c, { rough: 0.6, metal: 0.4 });
    const boomPivot = group(craneBase, 0, 1.3, 0);
    const boom = group(boomPivot, 0, 0, 0);
    boom.rotation.x = -0.55;
    box(boom, 0.16, 0.16, 2.4, 0, 0, 1.2, 0x3f342a, { rough: 0.55, metal: 0.5 });
    const cableAnchor = group(boom, 0, 0, 2.3);
    const cable = cyl(cableAnchor, 0.012, 0.012, 1.1, 0, -0.55, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 8 });
    void cable;
    const extractorGrp = group(cableAnchor, 0, -1.1, 0);
    box(extractorGrp, 0.34, 0.4, 0.3, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.55 });
    const jawL = box(extractorGrp, 0.08, 0.22, 0.28, -0.16, -0.28, 0, 0x8a939b, { rough: 0.45, metal: 0.6 });
    const jawR = box(extractorGrp, 0.08, 0.22, 0.28, 0.16, -0.28, 0, 0x8a939b, { rough: 0.45, metal: 0.6 });
    void jawL; void jawR;
    holoTag(extractorGrp, "vibratory extractor", 0, 0.32, 0, { css: "#c9622a", w: 0.46 });
    const jawHit = box(extractorGrp, 0.3, 0.3, 0.3, 0, -0.28, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(extractorGrp, "clear a snag by hand?", 0, -0.55, 0, { css: "#e8622a", w: 0.48 });
    reg(hits, jawHit, "extractor-jaw-reach");

    // The derelict pile itself, standing in the water within the crane's reach.
    const pile = group(g, 0.55, -0.15, -1.15);
    cyl(pile, 0.14, 0.16, 1.5, 0, 0.6, 0, 0x2c231a, { rough: 0.95, seg: 14, finish: "wood" });
    for (let i = 0; i < 5; i++) box(pile, 0.02, 0.02, 0.02, (Math.random() - 0.5) * 0.2, 0.3 + i * 0.25, 0.14, 0x1a140e, { rough: 0.98, cast: false });
    const pileHead = group(pile, 0, 1.35, 0);
    hits["pile-head-socket"] = pileHead;
    holoTag(pile, "creosote pile", 0, 1.6, 0, { css: "#c9622a", w: 0.36 });

    // The choker, staged coiled on the barge deck until it is rigged.
    const chokerStage = group(barge, -1.0, 0.05, -0.2);
    torus(chokerStage, 0.22, 0.03, 0, 0.03, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    torus(chokerStage, 0.14, 0.025, 0, 0.03, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(chokerStage, "choker — staged", 0, 0.32, 0, { css: "#c9622a", w: 0.34 });
    reg(hits, chokerStage, "choker-stage");

    // Deck console for the rate-call paddle, the deck lead's own gear, the
    // length indicator, the log board and the drip tray.
    const console_ = toolChest(barge, 1.1, 0.5, { color: 0x2f4d5f });
    for (const [id, dx, color, label] of [["stage-vest", -0.2, 0xe8b02e, "VEST"], ["stage-helmet", 0.0, 0xf2c14b, "HELMET"], ["stage-comms", 0.2, 0x2f4d5f, "COMMS"]]) {
      const it = group(console_, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#231b12", accent: "#f2e2b0", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const callPost = group(barge, 0.55, 0.06, -0.4);
    cyl(callPost, 0.03, 0.035, 0.7, 0, 0.35, 0, 0x453a2c, { rough: 0.5, metal: 0.5, seg: 10 });
    const callPaddle = group(callPost, 0, 0.7, 0);
    box(callPaddle, 0.28, 0.05, 0.05, 0, 0.14, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(callPost, "rate-call paddle", 0, 1.05, 0, { css: "#c9622a", w: 0.34 });
    reg(hits, callPaddle, "pull-call");
    const callReadout = instrument(callPost, -0.22, 0.72, 0, { idle: "----", color: CPR_RUST, w: 0.13, d: 0.19 });

    const lengthPost = group(barge, 0.9, 0.06, -0.85);
    cyl(lengthPost, 0.025, 0.03, 0.5, 0, 0.25, 0, 0x453a2c, { rough: 0.5, metal: 0.5, seg: 10 });
    const lengthInst = instrument(lengthPost, 0, 0.55, 0, { idle: "-- ft", color: CPR_RUST, w: 0.13, d: 0.19 });
    holoTag(lengthPost, "length indicator", 0, 0.78, 0, { css: "#c9622a", w: 0.36 });
    reg(hits, lengthInst, "length-indicator");

    const dripTray = slab(barge, 0.7, 0.06, 0.5, -0.1, 0.06, 0.15, 0x2b3138, { radius: 0.02, rough: 0.6, metal: 0.4 });
    holoTag(barge, "drip tray", -0.1, 0.28, 0.15, { css: "#c9622a", w: 0.24 });
    reg(hits, dripTray, "drip-tray");
    const drainHit = box(g, 0.4, 0.3, 0.3, 1.3, 0.2, -1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drain it over the water?", 1.3, 0.5, -1.35, { css: "#e8622a", w: 0.5 });
    reg(hits, drainHit, "drain-over-water");

    const crewOnBarge = standingFigure(barge, 1.25, -0.25, { ry: 2.4, cloth: 0x2b3138, vest: 0xe8b02e, helmet: 0xf2c14b });
    void crewOnBarge;

    // -------------------------------------------------------- cut and bin
    const cutBench = group(g, 1.7, 0.03, 0.35, -0.4);
    box(cutBench, 1.0, 0.5, 0.5, 0, 0.26, 0, 0x53606b, { rough: 0.65, metal: 0.3, cast: false });
    const cutPileSeg = cyl(cutBench, 0.12, 0.13, 0.8, 0, 0.56, 0, 0x2c231a, { rough: 0.95, seg: 12 });
    cutPileSeg.rotation.z = Math.PI / 2;
    const markMarks = group(cutBench, 0, 0.56, 0);
    for (const mx of [-0.2, 0.2]) box(markMarks, 0.01, 0.28, 0.28, mx, 0, 0, 0xe8622a, { rough: 0.5, cast: false });
    holoTag(cutBench, "cut marks", 0, 0.85, 0, { css: "#c9622a", w: 0.24 });
    reg(hits, markMarks, "cut-mark");
    const saw = group(cutBench, 0.35, 0.56, 0.2);
    box(saw, 0.3, 0.06, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    holoTag(saw, "chainsaw", 0, 0.22, 0, { css: "#c9622a", w: 0.22 });
    reg(hits, saw, "cut-saw");

    const bin = group(g, 2.1, 0.03, -0.6, -0.2);
    box(bin, 1.1, 0.55, 0.7, 0, 0.28, 0, 0x2f4d3a, { rough: 0.85, cast: false });
    box(bin, 1.14, 0.02, 0.74, 0, 0.56, 0, 0x1e3226, { rough: 0.9, cast: false });
    decal(bin, 0.5, 0.16, 0, 0.57, 0.2, signFace("LINED BIN — CREOSOTE TIMBER", { bg: "#0d1c14", accent: "#c9622a", scale: 0.45 }));
    holoTag(bin, "lined bin", 0, 0.85, 0, { css: "#c9622a", w: 0.3 });
    reg(hits, bin, "bin-place");
    const binSections = [];
    for (let i = 0; i < 3; i++) {
      const seg = cyl(bin, 0.1, 0.1, 0.5, -0.3 + i * 0.3, 0.6, 0, 0x2c231a, { rough: 0.95, seg: 10 });
      seg.rotation.z = Math.PI / 2;
      seg.visible = false;
      binSections.push(seg);
    }

    // --------------------------------------------------------- log board
    const logBoard = holoPanel(g, 0.85, 0.58, -1.9, 1.05, -0.35, (cx, w, h) => {
      cx.fillStyle = "#1c150c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9622a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f2e6c8"; cx.fillText("PILE REMOVAL LOG", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#efe3c4";
      ["Pile ID / location", "Length cleared vs. driven depth", "Stub below mudline: Y / N",
       "Disposal manifest lot"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.14)));
    }, { ry: 0.5, accent: CPR_ACCENT });
    reg(hits, logBoard, "log-board");

    // -------------------------------------------------------- pile record
    const stubBuoy = group(g, 0.7, 0.02, -1.25);
    ball(stubBuoy, 0.09, 0, 0.09, 0, 0xd2312b, { rough: 0.6, seg: 14 });
    cyl(stubBuoy, 0.008, 0.008, 0.4, 0, 0.3, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(stubBuoy, "stub marker", 0, 0.5, 0, { css: "#c9622a", w: 0.3 });
    stubBuoy.visible = false;
    reg(hits, stubBuoy, "stub-marker-buoy");

    // ------------------------------------------------------- turbidity curtain
    const bundle = group(g, -2.3, 0.1, 1.4, 0.4);
    cyl(bundle, 0.09, 0.09, 0.55, 0, 0.09, 0, CPR_RUST, { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bundle, "turbidity curtain — furled", 0, 0.28, 0, { css: "#c9622a", w: 0.46 });
    reg(hits, bundle, "turbidity-curtain");

    const curtainRing = group(g, 0.3, 0, -1.0);
    curtainRing.visible = false;
    const anchorSpots = [["anchor-1", -1.3, 0.6], ["anchor-2", 0.3, -1.9], ["anchor-3", 1.9, 0.6]];
    for (const [, x, z] of anchorSpots) {
      const seg = cyl(curtainRing, 0.03, 0.03, 0.4, x - 0.3, 0.24, z + 1.0, CPR_RUST, { rough: 0.6, seg: 10 });
      seg.rotation.z = Math.PI / 2;
    }
    const socket = group(curtainRing, 0, 0.15, 0);
    hits["curtain-ring"] = socket;
    for (const [id, x, z] of anchorSpots) {
      const anchor = group(g, x, 0.03, z);
      cyl(anchor, 0.05, 0.06, 0.06, 0, 0.03, 0, 0x3a3f45, { rough: 0.9, seg: 10 });
      reg(hits, anchor, id);
    }

    const retrieveHit = box(g, 0.4, 0.3, 0.3, 1.9, 0.2, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "haul the curtain in early?", 1.9, 0.5, 0.6, { css: "#e8622a", w: 0.5 });
    reg(hits, retrieveHit, "curtain-early-retrieve");

    const turnbuckleGrp = group(g, -0.7, 0.06, -2.0);
    const turnbuckle = valveWheel(turnbuckleGrp, 0, 0.1, 0, { r: 0.08, color: CPR_RUST, body: 0x2b5a6a });
    holoTag(turnbuckleGrp, "curtain anchor turnbuckle", 0, 0.34, 0, { css: "#c9622a", w: 0.5 });
    reg(hits, turnbuckle.userData.wheel, "curtain-turnbuckle");

    // -------------------------------------------------------------- settle
    const settleBuoy = group(g, -1.6, 0.02, -1.4);
    const settleBall = ball(settleBuoy, 0.11, 0, 0.09, 0, 0xe8622a, { rough: 0.6, seg: 14 });
    const settleInst = instrument(settleBuoy, 0.15, 0.15, 0, { idle: "-- NTU", color: CPR_RUST, w: 0.13, d: 0.19 });
    holoTag(settleBuoy, "settle monitor — real time", 0, 0.34, 0, { css: "#c9622a", w: 0.46 });
    reg(hits, settleInst, "settle-meter");

    // ------------------------------------------------------------- permit
    const planBoard = holoPanel(g, 0.92, 0.62, 2.15, 1.1, 0.6, (cx, w, h) => {
      cx.fillStyle = "#1c150c"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9622a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f2e6c8"; cx.fillText("USACE §404 PERMIT — PILE REMOVAL", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#efe3c4";
      ["BCDC permit on file", "In-water work window — dates", "Turbidity limit: differential over curtain",
       "Pull length vs. driven depth", "Disposal per State Coastal Conservancy program"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.4, accent: CPR_ACCENT });
    reg(hits, planBoard, "plan-board");

    // --------------------------------------------------------- support skiff
    const skiffHome = new THREE.Vector3(3.4, 0.02, 1.3);
    const skiff = group(g, skiffHome.x, skiffHome.y, skiffHome.z, -0.6);
    box(skiff, 1.5, 0.36, 0.7, 0, 0.22, 0, 0x1f2a33, { rough: 0.7, metal: 0.25, cast: false });
    box(skiff, 0.6, 0.44, 0.55, -0.25, 0.56, 0, 0xe8edf1, { rough: 0.6, cast: false });
    cyl(skiff, 0.028, 0.028, 0.6, -0.25, 1.02, 0, 0xc3ccd3, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    const skiffLight = ball(skiff, 0.055, -0.25, 1.36, 0, 0xffe9a8, { emissive: 0xffe9a8, ei: 1.2, rough: 0.4, cast: false });
    standingFigure(skiff, 0.45, 0.05, { ry: -2.2, cloth: 0x243a4a, vest: 0xf2681f, atStation: true }).position.y = 0.38;
    holoTag(g, "tug standing by", skiffHome.x, 1.55, skiffHome.z, { css: "#c9622a", w: 0.3 });
    const wake = particles(g, 22, 0xcfe4f0, { size: 0.032, life: 0.8, additive: false, opacity: 0.32 });

    cone(g, -2.5, 2.0, { color: CPR_RUST });
    cone(g, 2.7, -1.7, { color: CPR_RUST });
    barrierPanel(g, -0.2, 2.2, { color: 0xe8b02e });

    // -------------------------------------------------------- final walk items
    const chokerCoilCheck = group(barge, -1.35, 0.07, 0.6, 0.4);
    torus(chokerCoilCheck, 0.12, 0.02, 0, 0, 0, 0x8a7a54, { rough: 0.85, seg: 6, seg2: 12 }).rotation.x = Math.PI / 2;
    reg(hits, chokerCoilCheck, "choker-coil-check");
    const extractorHoseCheck = group(extractorGrp, 0.2, 0.1, 0);
    cyl(extractorHoseCheck, 0.012, 0.012, 0.3, 0, 0, 0, 0x1b1e23, { rough: 0.7, seg: 8 }).rotation.z = 0.4;
    reg(hits, extractorHoseCheck, "extractor-hose-check");

    // ------------------------------------------------ deck detail and dressing
    // Non-interactive dressing: a rail along the working side, a boarding
    // ladder down to the waterline, deck cleats, and a field of older
    // derelict pile stumps still standing offshore — the reason this crew
    // has more than one pull ahead of it today.
    const railGrp = group(barge, 0, 0.06, -1.3);
    for (let i = -2; i <= 2; i++) cyl(railGrp, 0.012, 0.012, 0.32, i * 0.7, 0.16, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(railGrp, 0.012, 0.012, 2.9, 0, 0.32, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;

    const ladderGrp = group(barge, 1.3, -0.16, 0.4, 0.2);
    for (const sx of [-1, 1]) cyl(ladderGrp, 0.012, 0.012, 0.5, sx * 0.12, -0.25, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    for (let i = 0; i < 4; i++) cyl(ladderGrp, 0.01, 0.01, 0.24, 0, -0.08 - i * 0.11, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 6 }).rotation.z = Math.PI / 2;

    for (const [cx, cz] of [[-1.35, -1.25], [1.35, -1.25]]) {
      const cleat = group(barge, cx, 0.06, cz);
      box(cleat, 0.1, 0.05, 0.03, 0, 0.025, 0, 0x3a3f45, { rough: 0.6, metal: 0.5 });
    }
    const ropeCoil = group(barge, -0.9, 0.06, -1.15);
    torus(ropeCoil, 0.1, 0.018, 0, 0.02, 0, 0x8a7a54, { rough: 0.85, seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
    torus(ropeCoil, 0.06, 0.015, 0, 0.02, 0, 0x8a7a54, { rough: 0.85, seg: 6, seg2: 12 }).rotation.x = Math.PI / 2;

    for (const [sx, sz, sh] of [[-1.4, -2.3, 0.6], [-0.9, -2.6, 0.4], [1.2, -2.4, 0.5]]) {
      const stump = group(g, sx, -0.1, sz);
      cyl(stump, 0.1, 0.12, sh, 0, sh / 2, 0, 0x241d15, { rough: 0.96, seg: 10 });
      box(stump, 0.04, 0.02, 0.04, 0.06, sh * 0.7, 0.05, 0x1a140e, { rough: 0.98, cast: false });
    }

    let pullPasses = 0, monitorHigh = false, curtainDragging = false, stubMarked = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 0.4),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "curtain-deploy") {
          bundle.visible = false;
          curtainRing.visible = true;
        }
        if (step.id === "choker-rig") {
          chokerStage.visible = false;
        }
        if (step.id === "spuds") {
          for (const spud of spuds) spud.position.y = 0.02;
        }
        if (step.id === "pull") {
          pullPasses += 1;
          pile.position.y = 0.55;
        }
        if (step.id === "length-check") {
          repaint(lengthInst.userData.screen, signFace("LOGGED", { bg: "#1c150c", accent: "#59c97b", fg: "#f2e6c8", scale: 0.55 }));
        }
        if (step.id === "drain-hold") {
          pile.parent.remove(pile);
          barge.add(pile);
          pile.position.set(-0.1, 0.5, 0.15);
          pile.rotation.set(0, 0, 0);
        }
        if (step.id === "cut-bin") {
          cutPileSeg.visible = false;
          for (const seg of binSections) seg.visible = true;
        }
        if (step.id === "log") {
          repaint(logBoard.userData.face, signFace("LOGGED", { bg: "#1c150c", accent: "#59c97b", fg: "#f2e6c8", scale: 0.55 }));
        }
        if (step.id === "settle") {
          repaint(settleInst.userData.screen, signFace("CLEAR", { bg: "#1c150c", accent: "#59c97b", fg: "#f2e6c8", scale: 0.55 }));
        }
        if (step.id === "walk") {
          chokerCoilCheck.visible = false;
          extractorHoseCheck.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "stub-below-mudline") {
          stubMarked = false;
          stubBuoy.visible = true;
          stubBuoy.children[0].material = mat(0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 2.2 });
        }
        if (it.id === "tug-wake-anchor-drag") {
          curtainDragging = true;
          turnbuckleGrp.position.x -= 0.22;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stub-below-mudline") {
          stubMarked = true;
          stubBuoy.children[0].material = mat(0xd2312b, { rough: 0.6 });
        }
        if (it.id === "tug-wake-anchor-drag") {
          curtainDragging = false;
          turnbuckleGrp.position.x += 0.22;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        haze.visible = true;
        haze.userData.step(dt, new THREE.Vector3(0, 0.5, -1.5), 1.6, 0.14, 0.1);
        wake.visible = pullPasses > 0;
        if (pullPasses > 0) wake.userData.step(dt, new THREE.Vector3(1.0, 0.03, -0.4), 0.7, 0.4, -0.5);
        water.position.y = 0.01 + Math.sin(t * 1.1) * 0.004;
        skiffLight.material = mat(0xffe9a8, { emissive: monitorHigh ? 0xf0645b : 0xffe9a8, ei: monitorHigh ? 2.0 : 1.2, rough: 0.4 });
        if (curtainDragging) turnbuckleGrp.rotation.y = Math.sin(t * 4) * 0.1;
        if (stubMarked) stubBuoy.rotation.y += dt * 1.2;

        const step = session?.step;
        if (step?.id === "pull") {
          const rate = session.track ? session.track.v : 0;
          extractorGrp.position.y = -1.1 + rate * 0.06;
          repaint(callReadout.userData.screen, signFace(rate < 0.38 ? "SLOW" : rate > 0.58 ? "JERK" : "STEADY", {
            bg: "#1c150c", accent: rate >= 0.38 && rate <= 0.58 ? "#59c97b" : "#f0645b", fg: "#f2e6c8", scale: 0.55,
          }));
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "length-check") {
            repaint(lengthInst.userData.screen, signFace(`${(gg.t * 26).toFixed(1)} ft`, { bg: "#1c150c", accent: gg.t >= 0.68 && gg.t <= 0.92 ? "#59c97b" : "#f0645b", fg: "#f2e6c8", scale: 0.55 }));
          }
          if (step?.id === "settle") {
            monitorHigh = gg.t < 0.38 || gg.t > 0.58;
            settleBall.material = mat(monitorHigh ? 0xf0645b : 0xe8622a, { rough: 0.5, emissive: monitorHigh ? 0xf0645b : 0x000000, ei: monitorHigh ? 1.6 : 0 });
            repaint(settleInst.userData.screen, signFace(`${Math.round(gg.t * 40)} NTU`, { bg: "#1c150c", accent: monitorHigh ? "#f0645b" : "#59c97b", fg: "#f2e6c8", scale: 0.55 }));
          }
        } else if (step?.id !== "settle") {
          monitorHigh = false;
        }
      },
    };
  },
};
