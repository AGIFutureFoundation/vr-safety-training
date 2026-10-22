import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bioswale Build VR — Water & Environmental, station eighty-six.
//
// Building a vegetated stormwater bioswale on a generic site beside a former
// shipyard — not any one site's history, the trade procedure a LIUNA and
// IUOE Local 3 crew runs on Bay Area bioswale construction generally, so the
// site's own runoff is treated before it ever reaches the bay. Everything
// here answers the question a stormwater permit is actually written around:
// does water that lands on this yard leave it cleaner and slower than it
// arrived, through a swale built to the grading plan rather than to how a
// trench happens to look once it is dug. The subgrade is checked before
// anything sits on it, the soil that does the actual filtering goes in loose
// rather than compacted, the check dams and the riser are set to the numbers
// the design calls out rather than to eye, and the first rain the swale sees
// is the inspection nobody has to schedule.

const BSW_ACCENT = 0x5a7a3a;
const BSW_BROWN = 0x5a4632;

export const SIM_BIOSWALE_BUILD = {
  id: "bioswale-build",
  index: "86",
  domain: "Environmental",
  trade: "Laborer / stormwater bioswale construction crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA laborers; IUOE Local 3 operating engineers (grading and compaction equipment); San Francisco Bay Regional Water Quality Control Board municipal stormwater (NPDES) permit; San Francisco Stormwater Management Requirements and Design Guidelines; Clean Water Act Section 402 municipal separate storm sewer system (MS4) practice; OSHA 29 CFR 1926 Subpart P excavations for the underdrain trench",
  name: "Bioswale Build",
  title: simTitle("Bioswale Build"),
  tagline: "Building a stormwater bioswale to grade: the design read against the survey stakes, subgrade compaction checked and the underdrain laid to fall, engineered soil placed loose to depth, check dams and the overflow riser set to the design numbers, plants set to the plan, and the first inflow watched to see the swale actually work",
  accent: BSW_ACCENT,
  accentCss: "#5a7a3a",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "swale-to-grade", name: "Swale To Grade", note: "A bioswale built to the design grade, with a clean subgrade, an unpacked soil mix, and the first inflow disperses across the dams" },

  game: system({
    name: "Swale Crew",
    currency: "IN/HR",
    ranks: ["Laborer", "Crew Hand", "Grade Lead", "Site Steward", "Swale Certified"],
    badges: [
      { id: "grade-honest", name: "Grade Honest", note: "Read the design plan and the stakes clean before the first cut", test: AWARD.all(AWARD.stepClean("plan"), AWARD.stepClean("stakes")) },
      { id: "nothing-compacted", name: "Nothing Compacted", note: "Never a hazard, never a reading called outside its band", test: AWARD.safe },
      { id: "true-grade", name: "True Grade", note: "Soil depth and riser elevation both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-swale", name: "Clean Swale", note: "No corrections across the whole build", test: AWARD.clean },
      { id: "steady-place", name: "Steady Place", note: "Held the soil placement rate in band the whole load", test: AWARD.unbroken },
      { id: "swale-ready", name: "Swale Ready", note: "Swale built and the first inflow watched inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "trench-cavein-entry": "You stepped down into the open underdrain trench without using the sloped access. An unshored trench cut for a pipe run does not care that the finished swale above it will be shallow and planted — the walls it has right now can still come in on whoever is standing at the bottom of it, and Subpart P does not have an exception for a trench that is only there for a weekend.",
    "roll-compact-mix": "You ran the plate compactor over the engineered soil mix to settle it faster. The whole reason this mix is specified instead of ordinary fill is that water moves through the pore space between its particles — compacting it closes that pore space, and a bioswale with a compacted soil layer is a shallow ditch that ponds and does the one job it was built for worse than bare ground would have.",
    "use-failed-mix": "You placed soil mix from a load whose delivery ticket had already failed its organic content and gradation spec, rather than sending the truck back. A bioswale's filtering capacity is entirely a property of the mix specified for it — a load that failed the ticket is not a slightly worse version of the same soil, it is a different material the design was never sized around, sitting under plants that are about to depend on it working.",
    "wash-to-drain": "You hosed the day's excess soil and wash water straight into the street's storm drain inlet instead of the site's containment area. That inlet goes to the same bay this whole swale exists to protect, untreated and immediately — which makes it the exact discharge the NPDES permit is written to stop, done with a hose in about the time it takes to notice.",
  },

  lateNotes: {
    "underdrain-pipe": "Lay the pipe once the subgrade compaction reading is in — there is nothing honest to lay it against before that.",
    "soil-spread": "Place the soil mix after the pipe's fall is confirmed — soil going in over an unproven pipe just gets dug back up if the fall is wrong.",
    "riser-collar": "Set the riser once the soil is at depth and the dams are down — there is no grade to set it against before the design profile is actually in the ground.",
    "test-valve": "Watch the first inflow after the plants are in, not before — an empty swale with no plugs in it tells you nothing about how the finished design behaves.",
  },

  // Interruptions: see shared/game.js. One is a supplier's own testing
  // catching a bad load after the crew is already mid-placement; the other
  // is the weather doing to an unfinished swale what it will always
  // eventually do to bare, unstabilised soil.
  interrupts: [
    {
      id: "failed-ticket-load",
      kind: "Delivery ticket failed",
      after: "soil-place", delay: 4, seconds: 13,
      alert: "The second truck's delivery ticket just came back from the lab failed — the gradation is off spec — and it is already backed up to the hopper waiting to dump.",
      cue: "That load does not go in. Flag it before it's dumped.",
      target: "reject-load-flag",
      why: "A mix that fails its own delivery ticket is not a soil the design was ever sized around, and once it is dumped and spread it is mixed into a layer nobody can un-mix — the flag has to go up while the load is still on the truck, because that is the only moment turning it away costs a phone call instead of an excavator.",
      missNote: "The load went in before the ticket was checked, and a layer of soil the design was never sized around is now buried under check dams and plants that are all going to depend on it filtering the way the spec assumed it would.",
      wrongNote: "That's not it. The reject flag is what stops this specific load before the hopper dumps it — nothing else on this site does that.",
    },
    {
      id: "rain-arriving",
      kind: "Rain cell arriving early",
      after: "first-inflow", delay: 4, seconds: 12,
      alert: "A rain cell that was not on this morning's forecast is moving in fast, and the bare soil on the upper bank has no erosion control down yet.",
      cue: "That soil is about to take a real storm with nothing holding it. Get the blanket down now.",
      target: "erosion-blanket",
      why: "Bare, loose engineered soil mix is exactly the material the whole build depends on staying in place and exactly the material a real storm moves first — every particle that washes off the bank before it is stabilised is filtering capacity that is not there anymore, and it goes downhill into the swale the crew just finished shaping. The blanket goes down before the rain does, not after the bank has already moved.",
      missNote: "The storm hit the bare bank before the blanket did, and rills cut straight down through soil that had not been given a season, or even a day, to root in and hold itself together.",
      wrongNote: "Not that. The erosion blanket is the one thing on this bank that stops bare soil from moving in a storm that is already inbound.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "plan-board",
      title: "Read the grading plan and the design profile",
      cue: "Check the design cross-section: subgrade elevation, soil mix depth, check dam spacing, and the riser's design elevation.",
      why: "Every cut and every fill on this site is a number on this plan before it is a shovel of dirt — the finished swale is judged against the cross-section drawn here, not against what a trench happens to look like once it is dug and backfilled by feel.",
    },
    {
      id: "stakes", kind: "find", noHint: true,
      targets: ["stake-1", "stake-2", "stake-3"],
      itemNames: { "stake-1": "stake 1 — inlet end", "stake-2": "stake 2 — mid-swale", "stake-3": "stake 3 — outlet end" },
      itemNotes: {
        "stake-1": "Stake 1 sets the inlet end of the design template — the swale's whole profile is built off this point, not off where the ground looks lowest this morning.",
        "stake-2": "Stake 2 is the mid-swale control that says the excavation is still following the surveyed grade and not just running downhill on its own.",
        "stake-3": "Stake 3 sets the outlet end, where the riser and the underdrain's own outfall are referenced from.",
      },
      title: "Find the survey stakes that set the design grade",
      cue: "Walk the site and click the three stakes the whole cross-section is built from.",
      why: "The subgrade cut, the soil depth, the dam spacing and the riser elevation are all measured off these three stakes, not off each other — finding all three before the first cut is what keeps every later reading tied to the same design instead of four separate guesses that happen to look similar.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-vest", "stage-helmet", "stage-gloves"],
      itemNames: { "stage-vest": "hi-vis vest", "stage-helmet": "hard hat", "stage-gloves": "gloves" },
      title: "Stage the crew's own gear",
      cue: "Hi-vis vest, hard hat, and gloves before stepping into the excavation.",
      why: "There is an open trench for the underdrain, grading equipment working the pad, and a soil mix that leaves everyone's hands raw by the end of a shift — the vest keeps a laborer visible to the equipment operator, the hard hat is for the boom of the mix hopper swinging overhead, and the gloves are what a full day of handling wet compost and wire ties does not do to bare skin.",
    },
    {
      id: "subgrade", kind: "gauge", target: "compaction-gauge",
      title: "Check the subgrade compaction",
      cue: "Press the compaction gauge into the exposed subgrade and commit the reading against spec.",
      why: "A bioswale only infiltrates through soil that is not already sealed by equipment traffic — a subgrade left over-compacted from the excavator's own tracks stops water at the bottom of the swale as effectively as a slab of concrete would, no matter how loose the soil mix placed on top of it is.",
      gauge: { label: "SUBGRADE", speed: 0.7, green: [0.38, 0.58], readout: (t) => `${Math.round(20 + t * 60)}% compaction`, missNote: "Over the compaction the design allows for infiltration. Loosen the subgrade and read it again before the pipe goes in." },
    },
    {
      id: "underdrain-lay", kind: "drag", target: "underdrain-pipe",
      title: "Lay the underdrain pipe",
      cue: "Carry the perforated pipe into the trench and set it in the bedding.",
      why: "The underdrain is the swale's backup — water that percolates past the soil mix faster than the ground beneath can absorb it needs somewhere to go that is not sideways into a neighbour's foundation, and that only happens if the pipe is actually in the trench the plan cut for it rather than staged on the bank.",
      drag: { to: "underdrain-trench", radius: 0.45, missNote: "Not in the trench bed — a pipe staged on the bank drains nothing." },
    },
    {
      id: "underdrain-fall", kind: "gauge", target: "fall-level",
      title: "Check the pipe's fall against the design",
      cue: "Read the line level on the pipe run and commit the fall against the design slope.",
      why: "A perforated pipe with no fall on it does not drain, it just fills — the whole point of specifying a slope on the plan is so that whatever gets into the pipe keeps moving to the outlet instead of sitting in it, and the only way to know the pipe actually has that slope is to read it, not to eyeball a trench that looks roughly level.",
      gauge: { label: "PIPE FALL", speed: 0.72, green: [0.42, 0.6], readout: (t) => `${(t * 2.4).toFixed(1)}% grade`, missNote: "Off the design slope. Reset the bedding and read the level again before the soil mix covers it." },
    },
    {
      id: "soil-place", kind: "track", target: "soil-spread", seconds: 7,
      title: "Place the engineered soil mix",
      cue: "Hold the spreader chute in the working range — a loose, even lift, not a packed one.",
      why: "The engineered mix does its filtering through the spaces between its own particles, so it goes in loose and gets left that way — fed too fast it piles and rides the chute into ridges that pack under their own weight, fed too slow the crew is standing over an idle hopper while the specified lift never actually builds to depth.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "SOIL PLACE RATE", readout: (v) => (v < 0.38 ? "leaving the trench short" : v > 0.58 ? "piling and packing" : "even, loose lift") },
      holdBreakNote: "The rate broke and the chute dumped a pile instead of a lift — that pile is packed the moment it lands. Bring it back to a steady rate.",
    },
    {
      id: "soil-depth", kind: "gauge", target: "soil-probe",
      title: "Read the soil mix depth against the design",
      cue: "Push the depth probe into the placed mix and commit the reading against the design lift.",
      why: "A loose lift that looks about right is not the same claim as a lift proven to depth — the probe is the only honest answer to how much filtering soil is actually over the underdrain, and it is read now, while there is still time to add another lift, not after the check dams are already sitting on top of it.",
      gauge: { label: "SOIL DEPTH", speed: 0.7, green: [0.42, 0.62], readout: (t) => `${(0.3 + t * 0.5).toFixed(2)} m`, missNote: "Short of the design lift. Add another pass of soil mix before anything else goes on top of it." },
    },
    {
      id: "check-dams", kind: "sequence",
      targets: ["dam-1", "dam-2", "dam-3"],
      itemNames: { "dam-1": "check dam at stake 1", "dam-2": "check dam at stake 2", "dam-3": "check dam at stake 3" },
      title: "Set the check dams at the design spacing",
      cue: "Set the check dams at stake 1, then stake 2, then stake 3, working downhill.",
      why: "Check dams are set working downhill so each one keys against still ground the upstream dam has already slowed, rather than against a bed the flow has already scoured. Set out of order, the lowest dam takes the full, unslowed force of the whole run of water above it — exactly the load the spacing on the design was calculated to spread across all three.",
      outOfOrderNote: "Inlet to outlet — stake 1, then stake 2, then stake 3. A downstream dam built before the ones above it takes flow the design never asked it to carry alone.",
    },
    {
      id: "riser", kind: "turn", target: "riser-collar",
      title: "Set the overflow riser to design elevation",
      cue: "Turn the riser's locking collar until the barrel seats at the design elevation.",
      why: "The riser is what keeps the swale a swale instead of a pond once a storm bigger than the design storm shows up — set too low, the swale never holds the depth it was designed to treat; set too high, it backs up onto the finished planting and drowns everything just placed in it. The collar locks it at the one elevation the level actually calls for.",
      turn: { turns: 0.75, axis: "y", label: "RISER COLLAR" },
    },
    {
      id: "plant", kind: "sequence",
      targets: ["plant-wet", "plant-transition", "plant-upland"],
      itemNames: { "plant-wet": "wet-zone plugs — swale bottom", "plant-transition": "transition-zone plugs — side slope", "plant-upland": "upland plugs — bank crest" },
      title: "Set the plants to the planting plan",
      cue: "Plant the wet-zone plugs first, then the transition slope, then the upland crest.",
      why: "The planting plan puts species where the tidal-frame equivalent for a swale — how often that spot actually sees standing water — matches what each species can survive, wettest to driest. Planted out of that order, it is easy to put a species that drowns on every storm into the one spot on the bank that holds water longest.",
      outOfOrderNote: "Bottom to crest — wet zone, then transition, then upland. A species set out of its zone is a plug that is either drowned or dried out by the first season.",
    },
    {
      id: "first-inflow", kind: "hold", target: "test-valve", seconds: 5,
      title: "Watch the first inflow",
      cue: "Hold the test valve open and watch the flow disperse across the dams before calling the swale finished.",
      why: "Every reading taken so far was a number on a gauge; this is the first time actual water crosses the finished swale, and it is the only check that shows whether the dams actually spread the flow the way the spacing was calculated to, rather than channelling straight down one side the way a plan on paper cannot show you.",
      holdBreakNote: "You let go before the flow settled into a pattern across the dams — reopen the valve and watch the full run before calling it finished.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["inlet-screen-check", "erosion-blanket-corner"],
      itemNames: { "inlet-screen-check": "the inlet trash screen", "erosion-blanket-corner": "the erosion blanket's loose corner" },
      itemNotes: {
        "inlet-screen-check": "The inlet's trash screen has come half off its frame. Left as is, the first real storm packs it with street debris and sends the flow around the swale instead of through it.",
        "erosion-blanket-corner": "One corner of the erosion control blanket on the bank has pulled loose from its staple. Left loose, the next wind or the next storm peels the whole blanket back from exactly the soil it is supposed to be holding down.",
      },
      title: "Walk the site before the crew stands down",
      cue: "Check the inlet screen and the erosion blanket before this swale is left to the weather.",
      why: "The crew is about to leave a finished bioswale to do its job unattended through however many storms come before the next site visit, and the inlet screen and the blanket are the two things most likely to fail quietly in the meantime. Both get one more look here, because neither one gets fixed by anybody once the crew is off this site.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, BSW_ACCENT);

    // ---------------------------------------------------------------- terrain
    // A raised soil pad, the swale cut into its top the way trench-box and
    // hot-tap cut their excavations into an apron rather than into the shared
    // plaza deck itself — everything here sits at or above y=0.
    const APRON = 0.3;
    const pad = group(g, 0, 0, -0.1);
    box(pad, 4.6, APRON, 3.2, 0, APRON / 2, 0, 0x4a3f2c, { rough: 0.97, finish: "soil" });
    box(pad, 4.6, 0.02, 3.2, 0, APRON + 0.01, 0, 0x4a6a34, { rough: 0.95, cast: false });

    // The swale basin cut into the pad: a shallow channel from the inlet
    // (upstream, -z) to the outlet riser (downstream, +z).
    const basinDepth = 0.22;
    const basin = group(pad, 0, APRON, 0);
    const basinFloor = box(basin, 1.15, 0.02, 3.0, 0, -basinDepth, 0, BSW_BROWN, { rough: 0.96, cast: false });
    for (const sx of [-1, 1]) {
      const wall = box(basin, 0.05, basinDepth, 3.0, sx * 0.6, -basinDepth / 2, 0, 0x5a4a34, { rough: 0.95, cast: false });
      wall.rotation.z = -sx * 0.12;
    }

    // The underdrain trench, a narrower and locally deeper cut in the middle
    // of the basin floor, with shoring boards down its short walls — the
    // Subpart P hazard this station is built around.
    const trenchDepth = 0.14;
    const trench = group(basin, 0, -basinDepth, -0.2);
    box(trench, 0.34, 0.015, 2.2, 0, -trenchDepth, 0, 0x2f2418, { rough: 0.97, cast: false });
    for (const sx of [-1, 1]) box(trench, 0.02, trenchDepth, 2.2, sx * 0.17, -trenchDepth / 2, 0, 0xd8b23a, { rough: 0.55, metal: 0.5 });
    holoTag(trench, "underdrain trench — shored", 0, 0.1, 0.5, { css: "#5a7a3a", w: 0.52 });
    const trenchAccess = group(basin, -0.4, -basinDepth, 1.1);
    box(trenchAccess, 0.4, trenchDepth, 0.4, 0, -trenchDepth / 2, 0, 0x4a3f2c, { rough: 0.97, cast: false }).rotation.x = 0.3;
    const trenchHit = box(trench, 0.34, trenchDepth, 0.5, 0, -trenchDepth / 2, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trench, "jump straight in?", 0, 0.2, -0.7, { css: "#e8622a", w: 0.4 });
    reg(hits, trenchHit, "trench-cavein-entry");

    // ------------------------------------------------------------ compaction
    const gaugeGrp = group(basin, 0.35, -basinDepth, -1.1);
    cyl(gaugeGrp, 0.02, 0.025, 0.5, 0, 0.25, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const compactionInst = instrument(gaugeGrp, 0.14, 0.5, 0, { idle: "--%", color: BSW_ACCENT, w: 0.13, d: 0.19 });
    holoTag(gaugeGrp, "compaction gauge", 0, 0.72, 0, { css: "#5a7a3a", w: 0.4 });
    reg(hits, compactionInst, "compaction-gauge");

    // ------------------------------------------------------------ underdrain
    const pipeStage = group(pad, -1.7, APRON + 0.02, -1.2, 0.4);
    cyl(pipeStage, 0.08, 0.08, 1.4, 0, 0.08, 0, 0x8fa9c4, { rough: 0.5, metal: 0.3, seg: 14, open: true });
    holoTag(pipeStage, "underdrain pipe — staged", 0, 0.32, 0, { css: "#5a7a3a", w: 0.42 });
    reg(hits, pipeStage, "underdrain-pipe");
    const trenchSocket = group(trench, 0, -trenchDepth + 0.08, 0);
    hits["underdrain-trench"] = trenchSocket;
    const laidPipe = cyl(trench, 0.07, 0.07, 2.1, 0, -trenchDepth + 0.08, 0, 0x8fa9c4, { rough: 0.5, metal: 0.3, seg: 14, open: true });
    laidPipe.visible = false;

    const levelGrp = group(trench, 0.25, -trenchDepth + 0.2, 0.6, -0.4);
    cyl(levelGrp, 0.012, 0.012, 0.5, 0, 0, 0, 0xf2f6fa, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    const fallInst = instrument(levelGrp, 0, 0.14, 0, { idle: "--%", color: BSW_ACCENT, w: 0.12, d: 0.17 });
    holoTag(levelGrp, "line level", 0, 0.32, 0, { css: "#5a7a3a", w: 0.26 });
    reg(hits, fallInst, "fall-level");

    // -------------------------------------------------------------- soil mix
    // The engineered soil surface: citykit's surfaceTexture with mudflatFace
    // rather than a flat colour, so the placed mix reads as loose, granular
    // material instead of a painted plane.
    const soilTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a4a34", base2: "#463a28", cracks: 18, pools: 0 }), { repeat: 3, px: 256 });
    const soilFill = box(basin, 1.05, 0.02, 2.9, 0, -0.03, 0, 0x5a4a34, { rough: 0.98, cast: false });
    soilFill.material = texturedMat(soilTex, { rough: 0.98, color: 0x8a7a58 });
    soilFill.visible = false;

    const hopperGrp = group(pad, 1.7, APRON + 0.02, -1.3, -0.3);
    box(hopperGrp, 0.7, 0.5, 0.6, 0, 0.28, 0, 0xb8933f, { rough: 0.85, cast: false });
    const soilPile = box(hopperGrp, 0.55, 0.22, 0.5, 0, 0.6, 0, 0x5a4a34, { rough: 0.98, cast: false });
    void soilPile;
    const chuteGrp = group(hopperGrp, 0, 0.55, -0.4);
    cyl(chuteGrp, 0.07, 0.09, 0.9, 0, 0, 0, 0x6f6248, { rough: 0.6, metal: 0.4, seg: 12 }).rotation.z = Math.PI / 2 + 0.3;
    const soilFall = particles(chuteGrp, 20, 0x8a7a58, { size: 0.026, life: 0.5, additive: false, opacity: 0.55 });
    soilFall.position.set(-0.4, -0.2, 0);
    soilFall.visible = false;
    const spreadPost = group(hopperGrp, 0.5, 0.06, 0.2);
    cyl(spreadPost, 0.03, 0.035, 0.6, 0, 0.3, 0, 0x4a4538, { rough: 0.5, metal: 0.5, seg: 10 });
    const spreadPaddle = group(spreadPost, 0, 0.6, 0);
    box(spreadPaddle, 0.26, 0.05, 0.05, 0, 0.12, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(spreadPost, "spreader chute paddle", 0, 0.92, 0, { css: "#5a7a3a", w: 0.4 });
    reg(hits, spreadPaddle, "soil-spread");
    const spreadReadout = instrument(spreadPost, -0.2, 0.62, 0, { idle: "----", color: BSW_ACCENT, w: 0.13, d: 0.18 });

    // A second, failed load staged nearby — the interruption's own truck.
    const failedLoad = group(pad, 2.1, APRON + 0.02, -0.2, 0.2);
    box(failedLoad, 0.5, 0.28, 0.5, 0, 0.14, 0, 0x5a4a34, { rough: 0.98, cast: false });
    decal(failedLoad, 0.4, 0.14, 0, 0.29, 0, signFace("LOAD 2 — TICKET PENDING", { bg: "#241d0d", accent: "#c9a24a", scale: 0.42 }));
    const rejectFlag = group(failedLoad, 0.3, 0.05, 0.3, 0.4);
    cyl(rejectFlag, 0.01, 0.01, 0.4, 0, 0.2, 0, 0xd2312b, { rough: 0.5, metal: 0.6, seg: 8 });
    box(rejectFlag, 0.12, 0.08, 0.006, 0.07, 0.36, 0, 0xd2312b, { rough: 0.6 });
    rejectFlag.visible = false;
    reg(hits, rejectFlag, "reject-load-flag");

    const compactorGrp = group(pad, -1.6, APRON + 0.02, 0.6, 0.3);
    box(compactorGrp, 0.4, 0.35, 0.55, 0, 0.2, 0, 0xe8b02e, { rough: 0.55, metal: 0.3 });
    cyl(compactorGrp, 0.24, 0.24, 0.5, 0, 0.24, -0.3, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(compactorGrp, "plate compactor", 0, 0.5, 0, { css: "#5a7a3a", w: 0.32 });
    const compactHit = box(basin, 0.9, 0.2, 0.9, 0, -0.1, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(basin, "roll the compactor over the mix?", 0, 0.15, 0.9, { css: "#e8622a", w: 0.6 });
    reg(hits, compactHit, "roll-compact-mix");

    const useFailedHit = box(failedLoad, 0.4, 0.3, 0.4, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(failedLoad, "dump it anyway?", 0, 0.5, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, useFailedHit, "use-failed-mix");

    const soilProbeGrp = group(basin, -0.2, -0.03, -0.4);
    cyl(soilProbeGrp, 0.014, 0.014, 0.5, 0, 0.25, 0, 0xf2f6fa, { rough: 0.5, seg: 8 });
    const soilProbeInst = instrument(soilProbeGrp, 0.14, 0.4, 0, { idle: "-- m", color: BSW_ACCENT, w: 0.13, d: 0.18 });
    holoTag(soilProbeGrp, "soil depth probe", 0, 0.62, 0, { css: "#5a7a3a", w: 0.36 });
    reg(hits, soilProbeInst, "soil-probe");

    // ------------------------------------------------------------- check dams
    const dams = {};
    for (const [id, z] of [["dam-1", -0.9], ["dam-2", 0.0], ["dam-3", 0.9]]) {
      const dam = group(basin, 0, -0.03, z);
      box(dam, 1.0, 0.1, 0.1, 0, 0.05, 0, 0x8a7a54, { rough: 0.95, cast: false });
      for (let i = -3; i <= 3; i++) cyl(dam, 0.012, 0.012, 0.12, i * 0.14, 0.09, 0, 0xa89268, { rough: 0.9, seg: 6, cast: false });
      holoTag(dam, "check dam", 0, 0.22, 0, { css: "#5a7a3a", w: 0.22 });
      reg(hits, dam, id);
      dams[id] = dam;
    }

    // -------------------------------------------------------------- riser
    const riserGrp = group(basin, 0, -0.03, 1.35);
    const riserBarrel = cyl(riserGrp, 0.06, 0.06, 0.55, 0, 0.27, 0, 0x8a939b, { rough: 0.45, metal: 0.6, seg: 16 });
    const riserCollar = valveWheel(riserGrp, 0.14, 0.4, 0, { r: 0.07, color: BSW_ACCENT, body: 0x2b3138 });
    holoTag(riserGrp, "overflow riser", 0, 0.62, 0, { css: "#5a7a3a", w: 0.32 });
    reg(hits, riserCollar.userData.wheel, "riser-collar");
    void riserBarrel;

    // -------------------------------------------------------------- planting
    const plantZones = {};
    for (const [id, z, color] of [["plant-wet", -0.85, 0x3f6b3a], ["plant-transition", 0.15, 0x5a8a3f], ["plant-upland", 1.0, 0x7aa04a]]) {
      const zoneGrp = group(basin, 0, -0.02, z);
      const plugs = [];
      for (let i = 0; i < 5; i++) {
        const px = -0.42 + i * 0.21;
        const plug = cyl(zoneGrp, 0.018, 0.018, 0.12, px, 0.06, 0, color, { rough: 0.9, seg: 8 });
        plug.visible = false;
        plugs.push(plug);
      }
      holoTag(zoneGrp, id === "plant-wet" ? "wet-zone plugs" : id === "plant-transition" ? "transition plugs" : "upland plugs", 0, 0.18, 0, { css: "#5a7a3a", w: 0.32 });
      reg(hits, zoneGrp, id);
      plantZones[id] = plugs;
    }

    // ----------------------------------------------------------------- inflow
    const inletGrp = group(basin, 0, -basinDepth + 0.05, -1.45, 0.2);
    cyl(inletGrp, 0.09, 0.09, 0.3, 0, 0.06, 0, 0x6b6660, { rough: 0.9, seg: 16, open: true }).rotation.x = Math.PI / 2;
    const screen = box(inletGrp, 0.14, 0.14, 0.01, 0, 0.06, 0.16, 0x8a939b, { rough: 0.5, metal: 0.6 });
    screen.rotation.x = 0.15;
    holoTag(inletGrp, "inlet — street runoff", 0, 0.3, 0, { css: "#5a7a3a", w: 0.4 });
    reg(hits, screen, "inlet-screen-check");

    const valvePost = group(basin, -0.3, -basinDepth + 0.1, -1.35);
    cyl(valvePost, 0.02, 0.024, 0.4, 0, 0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const testValve = valveWheel(valvePost, 0, 0.42, 0, { r: 0.07, color: 0xd2312b, body: 0x2b3138 });
    holoTag(valvePost, "test flow valve", 0, 0.62, 0, { css: "#5a7a3a", w: 0.34 });
    reg(hits, testValve.userData.wheel, "test-valve");
    const inflow = particles(inletGrp, 24, 0x8fd8ff, { size: 0.03, life: 0.7, additive: false, opacity: 0.55 });
    inflow.position.set(0, 0.04, 0.05);
    inflow.visible = false;

    // ------------------------------------------------------------- erosion
    const blanketRoll = group(pad, -1.9, APRON + 0.12, 1.2, 0.3);
    cyl(blanketRoll, 0.1, 0.1, 0.7, 0, 0, 0, 0x8a7a54, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(blanketRoll, "erosion control blanket", 0, 0.24, 0, { css: "#5a7a3a", w: 0.42 });
    reg(hits, blanketRoll, "erosion-blanket");
    const bankBlanket = box(pad, 1.1, 0.01, 0.7, -1.7, APRON + 0.021, 1.2, 0x8a7a54, { rough: 0.9, opacity: 0.9, transparent: true, cast: false });
    bankBlanket.visible = false;
    const looseCorner = box(pad, 0.14, 0.02, 0.1, -1.4, APRON + 0.03, 1.5, 0x9c8a60, { rough: 0.9, cast: false });
    reg(hits, looseCorner, "erosion-blanket-corner");

    // ---------------------------------------------------------- storm drain
    const stormDrain = group(pad, 1.9, APRON + 0.01, 1.4, -0.2);
    box(stormDrain, 0.4, 0.02, 0.3, 0, 0, 0, 0x3a3f45, { rough: 0.7, metal: 0.4, cast: false });
    for (let i = -2; i <= 2; i++) box(stormDrain, 0.32, 0.01, 0.02, 0, 0.011, i * 0.05, 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(stormDrain, "street storm drain — MS4", 0, 0.24, 0, { css: "#5a7a3a", w: 0.5 });
    const washHit = box(stormDrain, 0.5, 0.3, 0.4, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stormDrain, "hose it down the drain?", 0, 0.45, 0, { css: "#e8622a", w: 0.5 });
    reg(hits, washHit, "wash-to-drain");

    // ------------------------------------------------------------- staging
    const stakes = {};
    for (const [id, z, label] of [["stake-1", -1.4, "STAKE 1"], ["stake-2", 0, "STAKE 2"], ["stake-3", 1.4, "STAKE 3"]]) {
      const st = group(basin, 0.55, -basinDepth * 0.3, z);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, 0xe8622a, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1c1e12", accent: "#dff3d8", scale: 0.55 }));
      reg(hits, st, id);
      stakes[id] = st;
    }

    // A ground-level group at the top of the grass, for props that use the
    // (parent, x, z) helpers and expect to sit flush with grade rather than
    // embedded in the raised pad the way a raw group(pad, x, y, z) would.
    const padTop = group(pad, 0, APRON + 0.02, 0);
    const chest = toolChest(padTop, 1.9, 0.6, { color: 0x2f4d3a });
    for (const [id, dx, color, label] of [["stage-vest", -0.2, 0xe8b02e, "VEST"], ["stage-helmet", 0.0, 0xf2c14b, "HELMET"], ["stage-gloves", 0.2, 0x2f4d3a, "GLOVES"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }

    const planBoard = holoPanel(g, 0.92, 0.62, -1.95, 1.1, -1.4, (cx, w, h) => {
      cx.fillStyle = "#111a0d"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5a7a3a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e2f0d8"; cx.fillText("BIOSWALE DESIGN — CROSS SECTION", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#e8f2df";
      ["Subgrade compaction: max per spec", "Soil mix depth: design lift", "Check dam spacing per plan",
       "Riser elevation: design MLLW-equiv.", "NPDES stormwater permit on file"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.5, accent: BSW_ACCENT });
    reg(hits, planBoard, "plan-board");

    const crew = standingFigure(padTop, 1.5, -0.55, { ry: -1.0, cloth: 0x2f4d3a, vest: 0xe8b02e, helmet: 0xf2c14b });
    void crew;
    const crew2 = standingFigure(padTop, -0.55, 1.55, { ry: 2.4, cloth: 0x453a2c, vest: 0xe8b02e });
    void crew2;

    cone(g, -2.5, 2.0, { color: BSW_ACCENT });
    cone(g, 2.6, -2.0, { color: BSW_ACCENT });
    barrierPanel(g, 0, 2.2, { color: 0xe8b02e });

    let soilPlaced = false, inflowOpen = false, rainIncoming = false, ticketFailed = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 0.2),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "subgrade") {
          repaint(compactionInst.userData.screen, signFace("READ", { bg: "#111a0d", accent: "#59c97b", fg: "#e2f0d8", scale: 0.55 }));
        }
        if (step.id === "underdrain-lay") {
          pipeStage.visible = false;
          laidPipe.visible = true;
        }
        if (step.id === "underdrain-fall") {
          repaint(fallInst.userData.screen, signFace("SET", { bg: "#111a0d", accent: "#59c97b", fg: "#e2f0d8", scale: 0.55 }));
        }
        if (step.id === "soil-place") {
          soilPlaced = true;
          soilFill.visible = true;
        }
        if (step.id === "soil-depth") {
          repaint(soilProbeInst.userData.screen, signFace("LOGGED", { bg: "#111a0d", accent: "#59c97b", fg: "#e2f0d8", scale: 0.55 }));
        }
        if (step.id === "plant") {
          for (const plugs of Object.values(plantZones)) for (const p of plugs) p.visible = true;
        }
        if (step.id === "first-inflow") {
          inflowOpen = true;
        }
        if (step.id === "walk") {
          screen.visible = false;
          looseCorner.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "failed-ticket-load") {
          ticketFailed = true;
          rejectFlag.visible = true;
        }
        if (it.id === "rain-arriving") {
          rainIncoming = true;
          bankBlanket.visible = true;
          bankBlanket.material = mat(0xf0645b, { rough: 0.9, opacity: 0.6, transparent: true, emissive: 0xf0645b, ei: 0.5, cast: false });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "failed-ticket-load") {
          ticketFailed = false;
          rejectFlag.visible = false;
        }
        if (it.id === "rain-arriving") {
          rainIncoming = false;
          bankBlanket.material = mat(0x8a7a54, { rough: 0.9, opacity: 0.9, transparent: true, cast: false });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (soilFall.userData?.step) {
          soilFall.visible = session?.step?.id === "soil-place";
          if (soilFall.visible) soilFall.userData.step(dt, new THREE.Vector3(-0.4, -0.2, 0), 0.1, 0.9, -1.2);
        }
        inflow.visible = inflowOpen;
        if (inflowOpen) inflow.userData.step(dt, new THREE.Vector3(0, 0.04, 0.05), 0.09, 0.8, 0.9);
        if (rainIncoming) bankBlanket.rotation.z = Math.sin(t * 6) * 0.01;
        void soilPlaced; void ticketFailed;

        const step = session?.step;
        if (step?.id === "soil-place") {
          const rate = session.track ? session.track.v : 0;
          repaint(spreadReadout.userData.screen, signFace(rate < 0.38 ? "SHORT" : rate > 0.58 ? "PACKING" : "STEADY", {
            bg: "#111a0d", accent: rate >= 0.38 && rate <= 0.58 ? "#59c97b" : "#f0645b", fg: "#e2f0d8", scale: 0.55,
          }));
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "subgrade") {
            repaint(compactionInst.userData.screen, signFace(`${Math.round(20 + gg.t * 60)}%`, { bg: "#111a0d", accent: gg.t >= 0.38 && gg.t <= 0.58 ? "#59c97b" : "#f0645b", fg: "#e2f0d8", scale: 0.55 }));
          }
          if (step?.id === "underdrain-fall") {
            repaint(fallInst.userData.screen, signFace(`${(gg.t * 2.4).toFixed(1)}%`, { bg: "#111a0d", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#e2f0d8", scale: 0.55 }));
          }
          if (step?.id === "soil-depth") {
            repaint(soilProbeInst.userData.screen, signFace(`${(0.3 + gg.t * 0.5).toFixed(2)} m`, { bg: "#111a0d", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f0645b", fg: "#e2f0d8", scale: 0.55 }));
          }
        }
      },
    };
  },
};
