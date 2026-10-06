import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Well Install VR — Environmental Monitoring, station eighty-four.
//
// Installing a groundwater monitoring well by hollow-stem auger on a generic
// parcel: a former shipyard tract under a federal cleanup order, sited the
// way rad-survey.js and sampling-well.js are rather than at any named
// facility. See hunters-point.js for why a real Superfund site gets a
// sourced flat briefing instead of a walkable scene — this station teaches
// the trade procedure a drilling crew runs on installing a well like the
// ones that record's monitoring network would need.
//
// The learner is the geologist's field lead directing the driller, not the
// operator: the mast, the auger and the pumps are IUOE Local 3's hands on
// the controls, and every step here is the field lead's own duty of
// confirming, screening, logging and directing — the same division of labor
// a real boring log is written from. What makes the well worth anything
// later is not the hole itself but the record of it: the interval it was
// screened at, the seal proven placed and hydrated before the grout went in
// behind it, and the survey point that ties the whole thing to a coordinate
// somebody can find again.

const WI_ACCENT = 0x8a9a6f;

export const SIM_WELL_INSTALL = {
  id: "well-install",
  index: "84",
  domain: "Environmental",
  trade: "Environmental geologist — field lead",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "IUOE Local 3 drillers and rig operators; LIUNA hazmat laborers under OSHA HAZWOPER (29 CFR 1910.120); ASTM D5092 standard practice for monitoring well design and installation; California well construction standards (DWR Bulletin 74); the county well permit and the site's quality assurance project plan (QAPP)",
  name: "Well Install",
  title: simTitle("Well Install"),
  tagline: "Hollow-stem auger monitoring well: locate and permit checked, the mast raised inside its clearance, cuttings screened and drummed, screen and casing set, filter pack and seal placed and hydrated before the grout, the well developed clear, the survey point logged",
  accent: WI_ACCENT,
  accentCss: "#8a9a6f",
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "well-of-record", name: "Well of Record", note: "A boring drilled inside its clearance and exclusion zone, cuttings drummed as IDW, a seal hydrated before the grout, and a survey point logged — nothing free-fallen, nothing on the ground" },

  game: system({
    name: "Boring Log Authority",
    currency: "FT-BGS",
    ranks: ["Field Assistant", "Field Geologist", "Field Lead", "Senior Field Lead", "Boring Log Certified"],
    badges: [
      { id: "cleared-before-up", name: "Cleared Before Up", note: "The overhead clearance and exclusion zone were set before the mast ever came up", test: AWARD.stepClean("set-zone") },
      { id: "never-under-it", name: "Never Under It", note: "Never under the mast, never a hand near the flights, never a free-fallen seal", test: AWARD.safe },
      { id: "steady-hand", name: "Steady Hand", note: "Held the mast and the auger advance near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-boring", name: "Clean Boring", note: "No corrections anywhere in the installation", test: AWARD.clean },
      { id: "steady-advance", name: "Steady Advance", note: "Held the auger advance in band without a dropout", test: AWARD.unbroken },
      { id: "well-logged-fast", name: "Well Logged", note: "Survey point logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-the-mast": "You stood underneath the mast while it was up. A hollow-stem auger rig's mast is carrying the full weight of the kelly bar and the auger string overhead, and the one rule that never bends on a drill pad is that nobody — including the person directing the rig — stands under a raised load, ever, for any reason.",
    "hand-near-auger": "You reached toward the auger flights while they were turning. A rotating flight does not stop for a hand near it and does not care whose hand it is; cuttings are cleared and inspected with a shovel or a scoop held at a distance, never by hand, and never while the string is still turning.",
    "dump-cuttings-ground": "You had the cuttings dumped straight onto the ground beside the pit. Cuttings off an auger on a site under a federal cleanup order are investigation-derived waste until a lab result says otherwise, and IDW that goes on the ground instead of into a drummed, labeled container is a release the site's own work plan exists to prevent — on the exact soil the boring was drilled to characterize.",
    "free-fall-pack": "You had the filter sand poured straight down the annulus from the surface instead of run down the tremie pipe. A free-fallen pack bridges against the casing on the way down and leaves voids in the very interval the well depends on to filter formation water — ASTM D5092 calls for a tremie below the water table for exactly this reason, and a bridged pack is invisible until the well never develops clean.",
  },

  lateNotes: {
    "auger-control": "The auger advances after the mast is up, plumb, and the boring is spotted on the surveyed location — not before the rig is even set.",
    "grout-valve": "The grout goes in once the seal is placed and proven hydrated, not while the bentonite is still dry pellets settling onto the pack.",
    "survey-point": "The survey point is shot after the well is developed and capped — logging a coordinate for a hole that is not finished yet is a record of the wrong thing.",
  },

  interrupts: [
    {
      id: "mast-drift",
      kind: "Mast creeping out of plumb",
      after: "raise-mast", delay: 4, seconds: 13,
      alert: "The outrigger pad on the low side has settled into the softened shoulder, and the top of the mast is walking toward the overhead line's clearance limit.",
      cue: "The ground under one corner of this rig just changed the geometry you signed off on.",
      target: "mast-stop-signal",
      why: "The clearance to that overhead line was set for a mast standing plumb on a level pad, and a settling outrigger changes that geometry without anyone touching a control. The field lead's job right now is the stop signal to the driller before the mast travels another degree closer to the line — not the outrigger itself, which is the driller's own control and not what closes the gap fastest.",
      missNote: "The mast kept walking toward the line while the boring continued underneath it. A mast that reaches an energized overhead conductor does not give a warning first — the clearance distance is the entire margin, and it was allowed to close to nothing.",
      wrongNote: "That does not stop the drift. The hand signal to the driller is what halts the rig before the mast travels any further.",
    },
    {
      id: "pid-spike",
      kind: "PID reading spikes on the cuttings",
      after: "advance-auger", delay: 4, seconds: 13,
      alert: "The PID reading off the auger flights has jumped well past the action level in your field procedure and is still climbing as the flights turn.",
      cue: "The cuttings coming up right now are telling you something the boring log has not caught up to yet.",
      target: "auger-stop-signal",
      why: "A reading above the action level mid-run means the auger has entered material more contaminated than the crew's current respiratory protection was set up for, and the QAPP's own action-level trigger exists precisely so that keeps drilling is not the default answer. The signal to stop the rig now, screen properly and upgrade PPE before advancing another foot is the field lead's call — the driller cannot see the meter from the cab.",
      missNote: "The auger kept advancing through a reading nobody acted on. Continuing to drill past an action-level exceedance means the crew is now working an unknown exposure with the protection sized for the boring it thought it was drilling, which is exactly the gap a HAZWOPER action level is written to close.",
      wrongNote: "That does not stop the auger. The stop signal to the driller is what halts the rig so the crew can screen and upgrade before another foot goes in.",
    },
  ],

  steps: [
    {
      id: "check-locate", kind: "select", target: "locate-permit-board",
      title: "Confirm the locate and the boring permit",
      cue: "Check the utility locate against the site plan and confirm the county boring permit covers this location and depth.",
      why: "A locate more than a few weeks old is not a locate, and a permit for a different depth or a different spot on the parcel does not cover the hole this rig is about to drill. Both are checked here, at the rig, against paper — not assumed from the last boring on this pad.",
    },
    {
      id: "site-walk", kind: "find", noHint: true,
      targets: ["overhead-line-uncleared", "locate-flag-conflict"],
      itemNames: { "overhead-line-uncleared": "overhead line with no clearance flagged yet", "locate-flag-conflict": "locate flags that disagree with the site plan" },
      itemNotes: {
        "overhead-line-uncleared": "There is a service drop crossing the pad with no clearance distance flagged yet. A mast raised under an unflagged line is a mast whose crew has no marked limit to work inside — the flag has to go up before the mast does.",
        "locate-flag-conflict": "The locate flags on the ground do not match where the site plan shows the buried gas service running. A conflict like this gets resolved with the locate crew before the auger turns, not decided in the field by whichever line looks more likely.",
      },
      title: "Walk the pad before rigging up",
      cue: "Look over the pad for what has to be resolved before the mast comes up, and click what needs attention.",
      why: "Everything below and above this pad that could catch the rig is easiest to fix before anything is raised or turning. Found here, it is a flag moved or a call made; found after the mast is up, it is the rig backing off a line it should never have been under.",
    },
    {
      id: "set-zone", kind: "sequence", anyOrder: true,
      targets: ["overhead-clearance-flag", "exclusion-cones"],
      itemNames: { "overhead-clearance-flag": "overhead clearance flagged", "exclusion-cones": "exclusion zone coned off" },
      title: "Set the clearance and the exclusion zone",
      cue: "Flag the overhead clearance distance and cone off the exclusion zone before the mast goes up.",
      why: "The clearance flag is the line nobody lets the mast cross, and the exclusion zone is the ground nobody but the driller stands on once the string is turning. Both exist to be set before the mast is a hazard, not adjusted afterward around wherever it ended up.",
    },
    {
      id: "raise-mast", kind: "track", target: "mast-control", seconds: 7,
      title: "Direct the mast up, inside clearance",
      cue: "Hold the raise steady and watch the plumb band — the mast has to come up inside the flagged clearance, not just eventually stop there.",
      why: "A mast raised too fast overshoots plumb and has to be walked back against a line that is now closer than the flag allows; raised too slow, the outriggers are loaded unevenly for longer than they need to be. Steady, inside the band, is what a mast that is actually plumb over a level pad looks like from outside the cab.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.55, fall: 0.45, drift: 0.11, label: "MAST PLUMB",
        readout: (v) => (v < 0.42 ? "still low" : v > 0.62 ? "past plumb — walking toward the line" : "up and plumb"),
      },
      holdBreakNote: "The mast came out of the plumb band mid-raise. Bring it back into band and hold — a mast that stops outside plumb is a mast standing closer to the line than the flag allows.",
    },
    {
      id: "spot-boring", kind: "select", target: "boring-stake",
      title: "Confirm the boring is spotted correctly",
      cue: "Check the auger is centred over the surveyed stake for this boring, not the last one.",
      why: "The boring log means nothing if the hole it describes is not the hole the survey grid says it is. A boring spotted a metre off its stake is a data point that reads as being somewhere it is not on every map made from it afterward.",
    },
    {
      id: "advance-auger", kind: "track", target: "auger-control", seconds: 8,
      title: "Direct the auger to the target interval",
      cue: "Hold the advance rate steady in the band while the hollow-stem auger turns down to the screened interval.",
      why: "Too fast and the flights load up with cuttings instead of clearing them, which is how a string gets stuck; too slow and the boring runs long for no benefit to the sample. A steady rate in band is also what keeps the driller reading the formation as it comes up, rather than fighting the machine.",
      track: {
        start: 0.1, green: [0.38, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "ADVANCE RATE",
        readout: (v) => (v < 0.38 ? "loading the flights" : v > 0.6 ? "outrunning the cuttings" : "advancing cleanly"),
      },
      holdBreakNote: "Advance rate out of band — either the flights are loading up or the string is outrunning what it is cutting. Bring it back and hold.",
    },
    {
      id: "screen-cuttings", kind: "gauge", target: "pid-meter",
      title: "Screen the cuttings with the PID",
      cue: "Read the PID over the cuttings coming off the flights at this interval and commit while it sits in the expected background band.",
      why: "Screening every interval, not just the ones that look different, is what catches a change in the subsurface before it catches the crew. A background reading logged now is also what makes a later exceedance obviously a change, rather than something argued about after the fact.",
      gauge: { label: "CUTTINGS PID", speed: 0.7, green: [0.1, 0.34], readout: (t) => `${(t * 24).toFixed(1)} ppm`, missNote: "Above the interval's expected background. Stop, screen again and confirm before this interval is logged clean." },
    },
    {
      id: "drum-cuttings", kind: "drag", target: "cuttings-pile",
      title: "Drum the cuttings as investigation-derived waste",
      cue: "Carry the screened cuttings from the discharge chute to the labeled IDW drum and set them down square.",
      why: "Cuttings off a boring on a site under a federal cleanup order are IDW from the moment they leave the auger, pending the lab result that says otherwise — they go straight into the drum, labeled and logged, with nowhere in between for them to sit on bare ground.",
      drag: { to: "idw-drum-socket", radius: 0.42, missNote: "Not on the drum — the cuttings go into the labeled IDW container, not beside it." },
    },
    {
      id: "set-screen-casing", kind: "sequence",
      targets: ["lower-screen", "lower-casing"],
      itemNames: { "lower-screen": "well screen lowered to interval", "lower-casing": "riser casing lowered and landed" },
      title: "Set the screen and casing at the target interval",
      cue: "Lower the screen to the design interval, then land the riser casing above it.",
      why: "The screen has to sit at the interval the geology and the design actually call for before the casing above it is landed — landing the casing first fixes the whole string's depth before the screen can be checked against the interval it was designed to sit in.",
      outOfOrderNote: "Screen first, to the target interval, then the casing landed above it — not the other way round.",
    },
    {
      id: "place-filter-pack", kind: "drag", target: "sand-bag",
      title: "Tremie the filter pack into the annulus",
      cue: "Carry the sand to the tremie pipe and feed it down the annulus around the screen.",
      why: "Run down the tremie pipe, the pack settles evenly around the screen from the bottom up. That even pack is the entire filter this well relies on to keep formation fines out of every sample pulled from it for the rest of its life.",
      drag: { to: "annulus-socket", radius: 0.42, missNote: "Not down the tremie — the pack is fed down the pipe into the annulus, not dropped in from the surface." },
    },
    {
      id: "place-bentonite-seal", kind: "drag", target: "bentonite-bag",
      title: "Place the bentonite seal above the pack",
      cue: "Carry the bentonite pellets to the tremie pipe and set the seal above the filter pack.",
      why: "The seal sits directly on top of the filter pack and below the grout, and it is what keeps surface water and the grout itself from ever reaching the screened interval. A seal placed short of the pack, or mixed into it, gives the grout a path straight down to the water the well exists to sample cleanly.",
      drag: { to: "seal-socket", radius: 0.42, missNote: "Not on top of the pack — the seal goes directly above the filter sand, not into it or above the wrong interval." },
    },
    {
      id: "hydrate-seal", kind: "hold", target: "hydration-hose", seconds: 5,
      title: "Hydrate the seal before the grout",
      cue: "Hold water on the bentonite pellets until the seal is fully swollen and sealed.",
      why: "A dry or half-hydrated bentonite seal still has voids in it, and grout poured onto a seal with voids finds every one of them on its way down. Held wet for the full duration, the pellets swell into a continuous plug that the grout then sits on rather than passes through.",
      holdBreakNote: "The water came off before the seal finished swelling. A partially hydrated seal is not a shorter version of a sealed one — hold it again for the full duration.",
    },
    {
      id: "grout-well", kind: "turn", target: "grout-valve",
      title: "Grout the annulus to the surface",
      cue: "Open the tremie grout valve and pump grout from the bottom of the annulus up to the surface.",
      why: "Pumped from the bottom up through the tremie, the grout displaces water and air ahead of it and fills the annulus without trapping either. Poured from the top, it channels down the outside of the casing and leaves exactly the kind of gap the seal below was placed to prevent.",
      turn: { turns: 0.6, axis: "y", label: "GROUT VALVE" },
    },
    {
      id: "develop-well", kind: "track", target: "development-pump", seconds: 8,
      title: "Develop the well until turbidity clears",
      cue: "Hold the surge and pump rate steady in the band until the discharge runs clear of drilling fines.",
      why: "Development is what removes the fines the drilling itself put into the formation around the screen — a well that is never developed samples the drilling, not the aquifer, for every event it is used for after this one.",
      track: {
        start: 0.12, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "DEV. RATE",
        readout: (v) => (v < 0.4 ? "not enough surge to move fines" : v > 0.6 ? "surging too hard — could damage the pack" : "developing steadily"),
      },
      holdBreakNote: "Development rate dropped out of band. Bring it back and hold until the discharge actually runs clear — stopping early leaves fines the next sampling event will read as the aquifer.",
    },
    {
      id: "log-survey", kind: "sequence",
      targets: ["survey-point", "well-tag"],
      itemNames: { "survey-point": "survey point and elevation shot", "well-tag": "well ID tag locked on" },
      title: "Log the survey point and the well tag",
      cue: "Shoot the survey point and elevation, then lock the well ID tag onto the casing.",
      why: "The survey point ties this exact casing to a coordinate and an elevation everyone downstream — the sampler, the lab, the report — will use without ever seeing the boring again, and the tag is what stops that well from ever being confused with the one next to it.",
      outOfOrderNote: "Shoot the survey point first, then tag the well — the tag identifies a well that already has a surveyed location on record.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WI_ACCENT);

    // ---------------------------------------------------------------- the pad
    box(g, 6.6, 0.1, 5.6, 0, 0.05, -0.2, 0x6b6252, { rough: 0.95, finish: "concrete", tile: [6, 5] });
    barrierPanel(g, -2.6, -1.7, { color: 0xf2c14b, w: 1.3 });
    barrierPanel(g, 2.6, 1.9, { color: 0xf2c14b, ry: 1.6, w: 1.3 });
    cone(g, -1.0, 2.3, { color: 0xf2c14b });
    cone(g, 1.4, 2.3, { color: 0xf2c14b });

    // ---------------------------------------------------------------- locate/permit board
    const board = group(g, -2.1, 0, 1.6, 0.5);
    holoPanel(board, 0.95, 0.62, 0, 1.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#161a10"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8a9a6f"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e6ecd9"; ctx.fillText("BORING MW-22 — PERMIT & LOCATE", w * 0.06, h * 0.12);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#d8e2c8";
      ["Utility locate: valid, dated this week", "County boring permit: MW-22, 0-45 ft bgs",
        "Screen interval: 30-40 ft bgs (design)", "Overhead: service drop crosses NW corner",
        "QAPP action level: PID 25 ppm sustained"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.135)));
    }, { accent: WI_ACCENT });
    reg(hits, board, "locate-permit-board");

    // ---------------------------------------------------------------- overhead line + flags
    const overhead = group(g, -1.5, 0, -1.9);
    for (const dx of [-1.6, 1.6]) cyl(overhead, 0.05, 0.05, 2.6, dx, 1.3, 0, 0x6b6a62, { rough: 0.8, seg: 10 });
    const wire = cyl(overhead, 0.012, 0.012, 3.3, 0, 2.5, 0, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 8 });
    wire.rotation.z = Math.PI / 2;
    holoTag(overhead, "service drop", 0, 2.75, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, wire, "overhead-line-uncleared");
    const clearanceFlag = box(overhead, 0.05, 0.24, 0.02, 1.0, 2.0, 0, 0xff6b3a, { rough: 0.6 });
    holoTag(overhead, "clearance flag", 1.0, 2.3, 0, { css: "#8a9a6f", w: 0.32 });
    reg(hits, clearanceFlag, "overhead-clearance-flag");

    // Locate flags — one that reads wrong against the plan.
    const flagsGrp = group(g, -0.5, 0, -1.2);
    for (const [dx, col] of [[-0.3, 0xff8a3a], [0.3, 0xffe23a]]) {
      cyl(flagsGrp, 0.006, 0.006, 0.4, dx, 0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 6 });
      box(flagsGrp, 0.08, 0.05, 0.006, dx, 0.42, 0, col, { rough: 0.6 });
    }
    const wrongFlag = group(flagsGrp, 0.7, 0, 0.1);
    cyl(wrongFlag, 0.006, 0.006, 0.4, 0, 0.2, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 6 });
    box(wrongFlag, 0.08, 0.05, 0.006, 0, 0.42, 0, 0x3fa2e0, { rough: 0.6 });
    holoTag(wrongFlag, "flag disagrees with plan", 0, 0.56, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, wrongFlag, "locate-flag-conflict");

    // Exclusion-zone cones the sequence step confirms.
    const exclusionGrp = group(g, 0.2, 0, 1.8);
    for (const [dx, dz] of [[-0.9, 0], [0.9, 0], [0, -0.7], [0, 0.7]]) cone(exclusionGrp, dx, dz, { color: 0xff6b3a });
    holoTag(exclusionGrp, "exclusion zone", 0, 0.5, 0, { css: "#8a9a6f", w: 0.32 });
    reg(hits, exclusionGrp, "exclusion-cones");

    // ---------------------------------------------------------------- the rig
    const rig = group(g, 0.3, 0, -0.1);
    box(rig, 1.5, 0.5, 2.2, 0, 0.28, 0, 0xe4622a, { rough: 0.6, metal: 0.3 });
    for (const [sx, sz] of [[-0.7, -1.0], [0.7, -1.0], [-0.7, 1.0], [0.7, 1.0]]) {
      cyl(rig, 0.05, 0.05, 0.5, sx, 0.05, sz, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
      box(rig, 0.16, 0.06, 0.16, sx * 1.15, 0.03, sz * 1.15, 0x3c444c, { rough: 0.6, metal: 0.5 });
    }
    const outriggerLow = box(rig, 0.16, 0.06, 0.16, -0.8, 0.03, -1.15, 0x3c444c, { rough: 0.6, metal: 0.5 });
    void outriggerLow;
    const cab = box(rig, 0.7, 0.55, 0.9, -0.3, 0.85, 0.5, 0xd8d2c4, { rough: 0.5, metal: 0.3 });
    void cab;

    // The mast: hinged at the rig deck, raised by the track step.
    const mastPivot = group(rig, 0, 0.53, -0.9);
    const mast = group(mastPivot, 0, 0, 0);
    box(mast, 0.18, 3.4, 0.14, 0, 1.7, 0, 0x8a939b, { rough: 0.5, metal: 0.55 });
    for (let i = 0; i < 6; i++) box(mast, 0.2, 0.02, 0.02, 0, 0.4 + i * 0.55, 0.07, 0x6f7a83, { rough: 0.6, cast: false });
    const kelly = cyl(mast, 0.035, 0.035, 2.2, 0, 2.6, 0, 0x3c444c, { rough: 0.5, metal: 0.6, seg: 12 });
    void kelly;
    holoTag(mast, "mast — MW-22", 0, 3.6, 0, { css: "#8a9a6f", w: 0.4 });
    mastPivot.rotation.x = Math.PI / 2.15; // resting near-horizontal until raised
    hits["mast-control"] = mastPivot;
    reg(hits, mastPivot, "mast-control");
    const inclino = instrument(rig, 0.35, 1.0, -0.6, { idle: "-- °", color: 0x8a9a6f, w: 0.12, d: 0.18, ry: -0.4 });
    holoTag(rig, "plumb indicator", 0.35, 1.18, -0.6, { css: "#8a9a6f", w: 0.32 });

    const mastStop = group(rig, 0.5, 0.85, 0.2);
    box(mastStop, 0.1, 0.1, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    ball(mastStop, 0.05, 0, 0.09, 0.02, 0xff3b30, { emissive: 0xff3b30, ei: 0.6, rough: 0.4 });
    holoTag(mastStop, "STOP — hand signal", 0, 0.2, 0, { css: "#f2c14b", w: 0.42 });
    reg(hits, mastStop, "mast-stop-signal");

    const underMastZone = box(g, 0.7, 1.6, 1.6, 0.3, 0.8, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under it to signal?", 0.3, 1.7, -1.0, { css: "#d2312b", w: 0.5 });
    reg(hits, underMastZone, "under-the-mast");

    // Auger flights, staged below the mast — spin during advance-auger.
    const augerGrp = group(rig, 0, 0.28, 0.2);
    const flights = cyl(augerGrp, 0.09, 0.09, 1.0, 0, -0.4, 0, 0x6f7a83, { rough: 0.5, metal: 0.5, seg: 16 });
    for (let i = 0; i < 10; i++) {
      const ring = torus(augerGrp, 0.13, 0.015, 0, -0.85 + i * 0.09, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 6, seg2: 14 });
      ring.rotation.x = Math.PI / 2;
    }
    holoTag(augerGrp, "auger control", 0, 0.3, 0, { css: "#8a9a6f", w: 0.34 });
    reg(hits, augerGrp, "auger-control");

    const augerStop = group(rig, -0.5, 0.85, 0.2);
    box(augerStop, 0.1, 0.1, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const augerStopLamp = ball(augerStop, 0.05, 0, 0.09, 0.02, 0xff3b30, { emissive: 0xff3b30, ei: 0.6, rough: 0.4 });
    augerStopLamp.material = augerStopLamp.material.clone();
    holoTag(augerStop, "STOP — hand signal", 0, 0.2, 0, { css: "#f2c14b", w: 0.42 });
    reg(hits, augerStop, "auger-stop-signal");

    const handHazard = box(rig, 0.2, 0.2, 0.2, 0.28, 0.05, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rig, "clear it by hand?", 0.28, 0.3, 0.2, { css: "#d2312b", w: 0.36 });
    reg(hits, handHazard, "hand-near-auger");
    void flights;

    // ---------------------------------------------------------------- the boring
    // Cut into a raised drill pad rather than the plaza deck itself — the deck
    // is a solid disc from y -0.30 to 0, and a hole sunk straight into it would
    // be invisible and still clickable, which is the worst of both. The same
    // trick trench-box.js and hot-tap.js use for their excavations.
    const APRON = 0.32;
    const boreApron = group(g, 0.3, 0, 0.9);
    box(boreApron, 1.5, APRON, 1.5, 0, APRON / 2, 0, 0x6b6252, { rough: 0.95, finish: "concrete", tile: [2, 2] });
    const boreHole = cyl(boreApron, 0.17, 0.17, 1.7, 0, APRON - 0.85, 0, 0x241d14, { rough: 0.98, cast: false, seg: 18 });
    void boreHole;
    holoTag(boreApron, "boring MW-22", 0.3, APRON + 0.5, 0, { css: "#8a9a6f", w: 0.4 });

    const stake = group(boreApron, 0.26, APRON, 0.05);
    cyl(stake, 0.015, 0.015, 0.3, 0, 0.15, 0, 0xff6b3a, { rough: 0.6, seg: 8 });
    decal(stake, 0.14, 0.06, 0, 0.32, 0, signFace("MW-22", { bg: "#161a10", accent: "#8a9a6f", fg: "#e6ecd9", scale: 0.6 }));
    holoTag(stake, "boring stake", 0, 0.44, 0, { css: "#8a9a6f", w: 0.3 });
    reg(hits, stake, "boring-stake");

    // ---------------------------------------------------------------- PID + cuttings + IDW drum
    const pidCart = group(g, 1.6, 0, 0.6);
    box(pidCart, 0.3, 0.5, 0.24, 0, 0.25, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const pidMeter = instrument(pidCart, 0, 0.53, 0, { idle: "-- ppm", color: 0x8a9a6f, w: 0.14, d: 0.2 });
    holoTag(pidCart, "PID meter", 0, 0.72, 0, { css: "#8a9a6f", w: 0.28 });
    reg(hits, pidMeter, "pid-meter");
    const pidBeacon = ball(pidCart, 0.035, 0.1, 0.62, 0, 0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 });
    pidBeacon.visible = false;

    const cuttingsChute = group(g, 1.1, 0, 0.5);
    const cuttingsPile = cyl(cuttingsChute, 0.22, 0.3, 0.22, 0, 0.11, 0, 0x5c4f3a, { rough: 0.95, seg: 16 });
    holoTag(cuttingsChute, "screened cuttings", 0, 0.34, 0, { css: "#8a9a6f", w: 0.36 });
    reg(hits, cuttingsPile, "cuttings-pile");

    const groundSpot = cyl(g, 0.3, 0.3, 0.01, 1.35, 0.11, 0.9, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "bare ground", 1.35, 0.4, 0.9, { css: "#d2312b", w: 0.26 });
    reg(hits, groundSpot, "dump-cuttings-ground");

    const drum = group(g, 2.1, 0, 0.9, 0.3);
    cyl(drum, 0.24, 0.24, 0.62, 0, 0.31, 0, 0xd8b23a, { rough: 0.6, metal: 0.3, seg: 20 });
    cyl(drum, 0.25, 0.25, 0.03, 0, 0.63, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 20 });
    decal(drum, 0.36, 0.16, 0.26, 0.35, 0, signFace("IDW — PENDING RESULTS", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.34 }));
    holoTag(drum, "IDW drum", 0, 0.78, 0, { css: "#f2c14b", w: 0.28 });
    const drumSocket = group(drum, 0, 0.62, 0);
    hits["idw-drum-socket"] = drumSocket;

    // ---------------------------------------------------------------- screen/casing staged rack
    const rack = group(g, -1.9, 0, -0.6, 0.3);
    box(rack, 0.1, 0.1, 2.0, -0.15, 0.4, 0, 0x4a545e, { rough: 0.6, metal: 0.4 });
    box(rack, 0.1, 0.1, 2.0, 0.15, 0.4, 0, 0x4a545e, { rough: 0.6, metal: 0.4 });
    const screenPipe = cyl(rack, 0.045, 0.045, 1.8, 0, 0.5, 0, 0xdfe3e6, { rough: 0.5, metal: 0.3, seg: 14 });
    screenPipe.rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) torus(rack, 0.045, 0.004, 0, 0.5, -0.85 + i * 0.15, 0x9aa3ab, { rough: 0.4, metal: 0.5, seg: 6, seg2: 10 }).rotation.y = Math.PI / 2;
    holoTag(rack, "well screen", 0, 0.72, -0.9, { css: "#8a9a6f", w: 0.3 });
    reg(hits, screenPipe, "lower-screen");
    const casingPipe = cyl(rack, 0.05, 0.05, 1.8, 0, 0.68, 0, 0xe8eef2, { rough: 0.5, metal: 0.3, seg: 14 });
    casingPipe.rotation.x = Math.PI / 2;
    holoTag(rack, "riser casing", 0, 0.9, -0.9, { css: "#8a9a6f", w: 0.3 });
    reg(hits, casingPipe, "lower-casing");

    // ---------------------------------------------------------------- tremie, filter pack, seal, grout
    const tremie = group(g, -0.4, 0, 1.0);
    cyl(tremie, 0.03, 0.03, 2.0, 0, 1.0, 0, 0xc9a94f, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(tremie, "tremie pipe", 0, 2.1, 0, { css: "#8a9a6f", w: 0.3 });
    const annulusSocket = group(tremie, 0, 0.1, 0);
    hits["annulus-socket"] = annulusSocket;
    const sealSocket = group(tremie, 0, 0.45, 0);
    hits["seal-socket"] = sealSocket;
    const freeFallSpot = box(g, 0.2, 0.2, 0.2, 0.1, 0.9, 1.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just pour it in from here?", 0.1, 1.1, 1.05, { css: "#d2312b", w: 0.5 });
    reg(hits, freeFallSpot, "free-fall-pack");

    const sandCart = group(g, -1.3, 0, 1.5, 0.4);
    for (const [dx, dz] of [[-0.12, -0.1], [0.12, 0.1]]) box(sandCart, 0.24, 0.3, 0.16, dx, 0.15, dz, 0xd8c9a0, { rough: 0.85 });
    holoTag(sandCart, "filter sand", 0, 0.36, 0, { css: "#8a9a6f", w: 0.28 });
    reg(hits, sandCart, "sand-bag");

    const bentoniteCart = group(g, -0.9, 0, 1.7, 0.4);
    for (const [dx, dz] of [[-0.12, -0.1], [0.12, 0.1]]) box(bentoniteCart, 0.24, 0.3, 0.16, dx, 0.15, dz, 0x6f6558, { rough: 0.85 });
    holoTag(bentoniteCart, "bentonite pellets", 0, 0.36, 0, { css: "#8a9a6f", w: 0.34 });
    reg(hits, bentoniteCart, "bentonite-bag");

    const hydrateGrp = group(g, -0.55, 0, 1.25);
    const hydrateHose = cyl(hydrateGrp, 0.012, 0.012, 0.6, 0, 0.5, 0, 0x2f7d4a, { rough: 0.6, seg: 10 });
    holoTag(hydrateGrp, "hydration water", 0, 0.85, 0, { css: "#8a9a6f", w: 0.34 });
    reg(hits, hydrateHose, "hydration-hose");

    const groutPump = group(g, -1.7, 0, 1.1, 0.3);
    box(groutPump, 0.34, 0.34, 0.3, 0, 0.2, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    const groutValveWheel = group(groutPump, 0, 0.5, 0.16);
    torus(groutValveWheel, 0.08, 0.012, 0, 0, 0, 0xd2312b, { rough: 0.6, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(groutPump, "grout valve", 0, 0.68, 0.16, { css: "#8a9a6f", w: 0.3 });
    reg(hits, groutValveWheel, "grout-valve");
    hose(g, [[-1.7, 0.35, 1.1], [-1.1, 0.45, 1.05], [-0.4, 0.6, 1.0]], 0.014, 0x8a939b, { steps: 12 });

    // ---------------------------------------------------------------- development pump
    const devPump = group(g, 0.6, 0, 1.9, -0.3);
    box(devPump, 0.32, 0.3, 0.28, 0, 0.16, 0, 0xe4622a, { rough: 0.6, metal: 0.3 });
    const devLamp = ball(devPump, 0.024, 0.14, 0.32, 0.1, 0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
    void devLamp;
    holoTag(devPump, "development pump", 0, 0.42, 0, { css: "#8a9a6f", w: 0.36 });
    reg(hits, devPump, "development-pump");
    const dischargeParticles = particles(devPump, 20, 0x9fb4c9, { size: 0.03, life: 0.6, additive: false, opacity: 0.4 });
    dischargeParticles.visible = false;

    // ---------------------------------------------------------------- survey point + well tag
    const surveyGrp = group(g, 0.55, 0, -0.4, 0.4);
    cyl(surveyGrp, 0.02, 0.02, 0.6, 0, 0.3, 0, 0xf2c14b, { rough: 0.6, seg: 8 });
    ball(surveyGrp, 0.03, 0, 0.62, 0, 0xf2c14b, { rough: 0.5, seg: 12 });
    holoTag(surveyGrp, "survey point", 0, 0.78, 0, { css: "#8a9a6f", w: 0.3 });
    reg(hits, surveyGrp, "survey-point");

    const capGrp = group(rig, 0, 0.53, 0.6);
    cyl(capGrp, 0.06, 0.06, 0.08, 0, 0.03, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 14 });
    const tag = box(capGrp, 0.07, 0.04, 0.01, 0, 0.09, 0.06, 0xe8eef2, { rough: 0.5 });
    holoTag(capGrp, "well ID tag", 0, 0.2, 0.06, { css: "#8a9a6f", w: 0.28 });
    reg(hits, tag, "well-tag");

    toolChest(g, 2.4, -1.3, { ry: 0.4, color: 0x2f6f8c });
    const lead = standingFigure(g, -0.5, -0.65, { ry: 0.5, cloth: 0x37505f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(lead, "field lead", 0, 1.9, 0, { css: "#8a9a6f", w: 0.28 });

    let mastRaised = false, drifted = false, pidHigh = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 0.9, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "site-walk") { wrongFlag.visible = false; }
        if (step.id === "raise-mast") { mastRaised = true; mastPivot.rotation.x = 0; }
        if (step.id === "screen-cuttings") { repaint(pidMeter.userData.screen, signFace("6.0 ppm", { bg: "#0d1c14", accent: "#59c97b", fg: "#e6ecd9", scale: 0.6 })); }
        if (step.id === "drum-cuttings") { cuttingsPile.visible = false; }
        if (step.id === "set-screen-casing") {
          rack.remove(screenPipe); boreApron.add(screenPipe);
          screenPipe.rotation.set(0, 0, 0); screenPipe.position.set(0, APRON - 1.3, 0);
          rack.remove(casingPipe); boreApron.add(casingPipe);
          casingPipe.rotation.set(0, 0, 0); casingPipe.position.set(0, APRON - 0.7, 0);
        }
        if (step.id === "place-filter-pack") { sandCart.visible = false; }
        if (step.id === "place-bentonite-seal") { bentoniteCart.visible = false; }
        if (step.id === "grout-well") { groutValveWheel.rotation.z = 1.1; }
        if (step.id === "develop-well") { dischargeParticles.visible = true; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "mast-drift") { drifted = true; outriggerLow.position.y = -0.05; outriggerLow.material = outriggerLow.material.clone(); outriggerLow.material.color.set(0xd2312b); }
        if (it.id === "pid-spike") { pidHigh = true; pidBeacon.visible = true; repaint(pidMeter.userData.screen, signFace("41 ppm", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffd9d4", scale: 0.6 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "mast-drift") { drifted = false; outriggerLow.position.y = 0.03; outriggerLow.material.color.set(0x3c444c); }
        if (it.id === "pid-spike") { pidHigh = false; pidBeacon.visible = false; repaint(pidMeter.userData.screen, signFace("6.0 ppm", { bg: "#0d1c14", accent: "#59c97b", fg: "#e6ecd9", scale: 0.6 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (dischargeParticles.visible) dischargeParticles.userData.step(dt, new THREE.Vector3(0.6, 0.3, 1.9), 0.05, 0.4, 0.3);
        if (mastRaised) augerGrp.rotation.y = t * 3;
        if (drifted) mastStop.children[1].material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.2;
        if (pidHigh) { pidMeter.userData.screen.material.emissiveIntensity = 1.2 + Math.sin(t * 8) * 0.6; augerStopLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 10) * 1.0; }
        if (session?.track && step?.id === "raise-mast") {
          const v = session.track.v;
          const driftOffset = drifted ? 0.14 : 0;
          mastPivot.rotation.x = Math.PI / 2.15 - v * (Math.PI / 2.15) - driftOffset;
        } else if (!mastRaised) {
          mastPivot.rotation.x = Math.PI / 2.15;
        }
        if (session?.track && step?.id === "advance-auger") {
          const v = session.track.v;
          augerGrp.position.y = 0.28 - v * 0.5;
        }
        if (session?.track && step?.id === "develop-well") {
          dischargeParticles.visible = true;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "screen-cuttings") {
          repaint(pidMeter.userData.screen, signFace(`${(gg.t * 24).toFixed(1)}`, { bg: "#0d1c14", accent: gg.t >= 0.1 && gg.t <= 0.34 ? "#59c97b" : "#f2ae14", fg: "#e6ecd9", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "grout-well") groutValveWheel.rotation.z = session.turn.amount * Math.PI;
      },
    };
  },
};
