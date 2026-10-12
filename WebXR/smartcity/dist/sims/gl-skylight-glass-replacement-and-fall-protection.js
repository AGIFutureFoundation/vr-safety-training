import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, concreteFace, gratingFace, safetyStripeFace, reg,
} from "../citykit.js";
import { glassVacuumLifter, level } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Skylight Glass Replacement And Fall Protection VR —
// Construction & Structural Trades, glaziers and architectural metal pack.
// A cracked skylight unit gets replaced from the roof, and the hazard here
// is not the glass — it is the hole the glass leaves the moment it comes
// out of the curb. A skylight opening looks like part of the roof right up
// until someone's weight finds it, which is why the screen and the warning
// line go up before the old unit ever comes loose, and neither comes down
// again until the new one is sealed in.

const GLSK_ACCENT = 0xe0b23a;

export const SIM_GL_SKYLIGHT_GLASS_REPLACEMENT_AND_FALL_PROTECTION = {
  id: "gl-skylight-glass-replacement-and-fall-protection",
  index: "356",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 roof glazing and skylights",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials for the replacement skylight unit; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria for a roof opening; ANSI Z359 fall protection component standards for the roof anchor and lanyard; the skylight manufacturer's screen and cover load rating for the curb opening",
  name: "Skylight Glass Replacement And Fall Protection",
  title: simTitle("Skylight Glass Replacement And Fall Protection"),
  tagline: "Tailboard and wind read, harness tied to the roof anchor, the screen and warning line up before the old glass comes out, the new unit set and sealed, the screen down last",
  accent: GLSK_ACCENT,
  accentCss: "#e0b23a",
  parSeconds: 295,
  footprint: 2.2,
  badge: { id: "curb-never-open", name: "Curb Never Open", note: "A skylight unit replaced with the fall-through screen up for the whole time the curb had no glass in it" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the open curb with no screen on it is what you keep seeing",

  game: system({
    name: "Roof Crew",
    currency: "CURB",
    ranks: ["Pre-apprentice", "Ground Hand", "Roof Glazier", "Lead Glazier", "Roof Access Certified"],
    badges: [
      { id: "screen-first", name: "Screen First", note: "The fall-through screen and warning line rigged before the old glass came out", test: AWARD.stepClean("screen-seq") },
      { id: "curb-covered", name: "Curb Covered", note: "No unsafe action toward the open curb the whole run", test: AWARD.safe },
      { id: "level-true", name: "Level True", note: "The new unit levelled inside tolerance, first read", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-swap", name: "Clean Swap", note: "The unit swapped without a correction", test: AWARD.clean },
      { id: "dome-held", name: "Dome Held", note: "The new unit never came off the curb before the first fastener was in", test: AWARD.unbroken },
      { id: "curb-in-time", name: "Curb In Time", note: "Swapped, sealed and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cracked-dome-edge": "Lifting the failed unit out bare-handed skips the one accommodation this material demands: a laminate that has already started to give up its integrity does not part predictably, so a shifting fragment meets an ungloved palm exactly where nobody planned for contact. Corner-to-corner travel stays on the suction pads, mitts on, until the piece is safely down on the cart.",
    "skylight-fall-through": "Approaching the curb footprint while nothing spans it is indistinguishable, to an ordinary walk, from approaching any other patch of roofing membrane — until weight finds the gap and there is roofing on one side of that gap and a long drop on the other. Foot traffic stays off that footprint until either the mesh is restored or the finished unit has sealed the hole for good.",
    "curb-clamp-pinch": "Slipping digits beneath the retaining bar mid-tightening puts them exactly where a continuous perimeter clamp-down concentrates its force in one pass. That bar is engineered to bite down on aluminium and gasket alike, and knuckles caught along its closing line receive precisely that bite. Contact stays on the bar's exposed top, away from the line it is squeezing shut.",
    "dome-wind-catch": "Moving the fresh unit solo across open decking treats a broad, feather-light pane like cargo rather than like the sail it actually becomes the instant a rooftop gust gets under it — and an unbalanced twist that close to an unguarded hole ends the same whether the panel goes sideways or straight down. Two sets of hands, held flat, cover the whole trip from staging to curb.",
  },

  lateNotes: {
    "new-skylight": "The new unit comes off the hoist point after the screen has proven its rating and the warning line is up. A unit carried before the curb is protected is a unit carried past an open hole with nothing stopping a slip.",
    "sealant-gun": "Sealant goes around a unit already fastened at every point on the curb. A bead run against a unit still shifting on its clamps pulls loose the first rain that tests it.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — which curb is open today, the roof anchor points, the wind limit for the unit, who else has roof access — and sign it.",
      why: "A roof with more than one skylight is a roof where the wrong curb is exactly the mistake the tailboard exists to prevent, and today's plan names which curb the screen goes on, which anchor the harness ties to, and who else might come up the hatch while this curb is open. Signing it is what makes today's roof the crew's roof rather than an assumption.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind before the new unit crosses the roof",
      cue: "Take the anemometer reading at the roof edge and commit it inside the working band before the unit leaves the hoist point.",
      why: "A roof reads calmer at the parapet than it is in the open field where the skylights sit, and a lightweight glazing unit carried across that field catches whatever the roof is actually doing, not what the edge suggested. A reading over the band means the unit waits at the hoist point, because a unit that twists out of a carry near an open curb has two ways to go wrong instead of one.",
      gauge: { label: "WIND", speed: 0.68, green: [0.18, 0.46], readout: (t) => `${(t * 30).toFixed(0)} km/h`, missNote: "That reading is outside the working band for carrying the unit — over it, wait at the hoist point; under it, read it again at the curb." },
    },
    {
      id: "harness-seq", kind: "sequence",
      targets: ["harness-webbing", "lanyard-snap", "roof-anchor"],
      itemNames: { "harness-webbing": "harness webbing and stitching", "lanyard-snap": "lanyard and snap hook gate", "roof-anchor": "the roof's structural anchor point" },
      title: "Inspect the harness and tie off to the roof anchor",
      cue: "Webbing and stitching first, then the lanyard and its hook gate, then the hook onto the roof's own structural anchor — in that order.",
      why: "A roof with an open curb on it is fall-protection work whether or not anyone is near the edge, because the curb itself is the fall hazard now, not the parapet. The anchor is the roof's own structural point rather than anything convenient nearby, because a lanyard hooked to ductwork or a vent stack is a lanyard hooked to something that was never rated to catch a person.",
      outOfOrderNote: "Webbing, then lanyard, then anchor — the hook goes on last, onto a harness already proven sound.",
    },
    {
      id: "roof-walk", kind: "find", noHint: true,
      targets: ["unguarded-skylight", "roof-debris"],
      itemNames: { "unguarded-skylight": "a second skylight nearby with no screen", "roof-debris": "loose gravel and debris near the roof edge" },
      itemNotes: {
        "unguarded-skylight": "The skylight two curbs over has no screen and no warning line around it — somebody else's job, maybe, but a hole in this roof either way.",
        "roof-debris": "Loose ballast gravel is drifted right up to the parapet edge, exactly where a foot finds it while carrying something heavier than usual.",
      },
      title: "Walk the roof before the old glass comes out",
      cue: "Look at what else is on this roof and what is near the edge — click the two things wrong before the screen goes up on this curb.",
      why: "A roof with skylights on it usually has more than one, and a crew focused on the curb they are working can walk right past another one with no protection on it at all. Both the unguarded curb and the loose gravel at the edge get flagged before this crew's own work narrows their attention to one hole in the roof.",
    },
    {
      id: "screen-check", kind: "select", target: "screen-rating",
      title: "Check the fall-through screen's rating plate",
      cue: "Read the screen's rating plate and confirm it is rated to span this curb before it goes down.",
      why: "A fall-through screen is only doing its job if it is actually rated for the load and the span of this specific curb, and the rating plate is the one place that claim is made in writing rather than assumed from how the screen looks. A screen borrowed from a smaller curb on a different job is a screen that reads as protection and is not.",
    },
    {
      id: "screen-seq", kind: "sequence",
      targets: ["fall-screen", "warning-line", "screen-anchor"],
      itemNames: { "fall-screen": "screen set across the curb", "warning-line": "warning line strung around the curb", "screen-anchor": "screen anchored at all four corners" },
      title: "Rig the screen and warning line before the old glass comes out",
      cue: "Screen across the curb first, then the warning line strung around it, then the screen anchored at all four corners — in that order, before a single fastener is touched.",
      why: "The screen goes down before anything else because it is what makes the next several steps survivable if a foot ever does find the curb, and the warning line around it is what keeps anyone who is not looking at the curb from finding out about it by walking into the barrier. Anchoring the screen last is what stops it being just something laid over the hole rather than something that actually spans it under a load.",
      outOfOrderNote: "Screen, then warning line, then anchor it down — a warning line around a screen that is not anchored is a fence around a screen that can still slide.",
    },
    {
      id: "cap-turn", kind: "turn", target: "old-cap-fastener",
      title: "Free the old unit's retaining cap",
      cue: "Turn each fastener out of the old unit's retaining cap, evenly around the curb, before the unit is lifted.",
      why: "The retaining cap holds the old unit to the curb at every point around its perimeter, and freeing it evenly rather than at one corner first is what keeps the cracked unit from twisting and finishing its own failure while it is still fastened down. Every fastener comes out before the unit is touched, not part way through.",
      turn: { turns: 1, axis: "z", label: "FREE" },
    },
    {
      id: "old-glass-drag", kind: "drag", target: "cracked-unit",
      title: "Lift the old unit out onto the cart",
      cue: "Cups seated on the old unit, lift it straight up off the curb and onto the roof cart — not released until it is set flat.",
      why: "The old unit comes straight up rather than tilted out at an angle, because a cracked unit tilted against its own curb frame is a unit given one more chance to finish breaking on the way out. It goes onto the cart flat because a cracked unit set down on an edge is a unit that arrives at the dumpster in more pieces than it left the curb in.",
      drag: { to: "roof-cart", radius: 0.45, missNote: "Not set flat on the cart — a cracked unit resting on an edge finishes breaking on the way down." },
    },
    {
      id: "dome-hold", kind: "hold", target: "new-skylight", seconds: 4,
      title: "Hold the new unit square on the curb while the first fastener is started",
      cue: "Both hands on the unit, hold it square on the curb's gasket while the first cap fastener is started — do not let go until it is threaded.",
      why: "Between the unit landing on the curb and the first fastener catching, the unit is held square by your grip and nothing else, and letting go early lets it shift on the gasket before the fastener has anything to draw down against. The first fastener threaded is what turns the unit from something you are holding into something the curb is holding.",
      holdBreakNote: "You let go before the fastener threaded — the unit shifted on the gasket. Reseat it square and hold until the first fastener catches.",
    },
    {
      id: "cap-torque", kind: "turn", target: "new-cap-fastener",
      title: "Draw down the new unit's retaining cap",
      cue: "Turn every fastener down evenly around the curb, to the manufacturer's torque, so the cap clamps the unit without cracking it.",
      why: "The cap clamps a new unit exactly the way it clamped the old one, and driven evenly rather than tightened fully at one point first, so the clamping load spreads around the frame instead of concentrating at whichever fastener went in first — a new unit cracked by an uneven cap fails the same way the old one did, just sooner.",
      turn: { turns: 1, axis: "z", label: "TORQUE" },
    },
    {
      id: "sealant-track", kind: "track", target: "sealant-gun", seconds: 5,
      title: "Run the perimeter sealant bead",
      cue: "Gun at the curb joint, run a continuous bead at a steady pace around the new unit to the depth the manufacturer's detail calls for.",
      why: "The bead around a skylight curb is the roof's actual defence against the exact kind of water that finds every gap eventually, sitting on a joint that faces straight up into every storm this building gets. Run unevenly, it is a leak with a delay built in rather than a leak that shows up today.",
      track: { label: "BEAD", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.13, readout: (v) => `${Math.round(v * 20)} mm/s` },
      holdBreakNote: "The bead ran out of the band on the curb joint — a thin spot or an overfill. Tool it out and run that stretch again at a steady pace.",
    },
    {
      id: "level-gauge", kind: "gauge", target: "level-instrument",
      title: "Check the new unit level on the curb",
      cue: "Read the level gauge against the curb's own frame and commit inside tolerance.",
      why: "A skylight unit that sits even slightly out of level does not drain the way its own detail assumes, and standing water on a roof joint finds every weakness in a bead twice as fast as running water does. The gauge is read against the curb's own frame because that is the surface the water actually runs across, not an abstract level line.",
      gauge: { label: "LEVEL mm", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.5) * 24).toFixed(1)} mm`, missNote: "Outside level tolerance against the curb — back to the fasteners before the bead goes on." },
    },
    {
      id: "screen-down-seq", kind: "sequence",
      targets: ["warning-line-down", "screen-stow"],
      itemNames: { "warning-line-down": "warning line taken down", "screen-stow": "screen stowed for the next curb" },
      title: "Take down the screen and warning line",
      cue: "Warning line down first, then the screen lifted clear and stowed — only once the new unit is fastened and sealed.",
      why: "The screen and warning line come down in the reverse order they went up, and only now, because the curb is protected by the sealed unit itself rather than by the screen from this point on. Taking the warning line down first and the screen last means the barrier stays up for exactly as long as the curb actually needs it.",
      outOfOrderNote: "Warning line first, then the screen — the screen is the last thing between the curb and open air, so it is the last thing that comes off.",
    },
    {
      id: "roof-walk-2", kind: "find", noHint: true,
      targets: ["tool-at-edge", "unlatched-hatch"],
      itemNames: { "tool-at-edge": "a tool left near the roof edge", "unlatched-hatch": "the roof access hatch not latched" },
      itemNotes: {
        "tool-at-edge": "A driver is sitting right at the parapet edge from earlier in the job — one gust or one bump from going over onto whoever is below.",
        "unlatched-hatch": "The roof access hatch is closed but not latched, and a hatch that can blow open in the wind is a trip hazard for the next person coming up through it.",
      },
      title: "Walk the roof once more before signing off",
      cue: "Look at the parapet edge and the hatch — click the two things wrong before the crew leaves the roof.",
      why: "A roof that is finished from the curb's point of view is not finished until nothing near the edge can become a dropped object and the way down is actually secured behind the crew — both are exactly the kind of thing that gets assumed fine because the real work of the day already felt done.",
    },
    {
      id: "log", kind: "select", target: "curb-log",
      title: "Log the curb",
      cue: "Unit replaced, screen rating, wind readings, level reading and the faults found and fixed, and sign it.",
      why: "The log ties this curb's screen rating and level reading to a date and a name, which is what the crew shows if this roof ever leaks at this joint. It also carries the unguarded skylight and the loose hatch as fixed rather than assumed, for whoever is on this roof after the crew has packed up.",
    },
  ],

  interrupts: [
    {
      id: "gust-dome",
      kind: "Gust catches the new unit",
      after: "dome-hold", delay: 3, seconds: 11,
      alert: "A gust has caught the new unit on the curb before the first fastener is fully seated, and it is lifting at one corner.",
      cue: "The new unit is lifting off the curb at the corner.",
      target: "unit-clamp",
      why: "A unit not yet fastened at every point is a unit the wind can still get a grip under, and the temporary clamp across the unfastened corner is what holds it flat to the curb without anyone's hand near the gap the wind is using. The fastener sequence can pick back up once the clamp has it flat again.",
      missNote: "The gust let go of the corner on its own and the unit settled back down. It could as easily have gone the other way, off the curb and into the screen below. The clamp exists for exactly the gap between the hold and the last fastener, and it sat unused while the gust had its turn.",
      wrongNote: "It is the unit clamp. Get the lifting corner flat again before the fastener sequence continues.",
    },
    {
      id: "second-worker",
      kind: "A second roofer approaches the curb",
      after: "sealant-track", delay: 3, seconds: 11,
      alert: "Someone else on the roof crew is walking toward this curb, past where the warning line should still be up.",
      cue: "A second person is walking toward the curb.",
      target: "warning-line",
      why: "The curb still reads as a hazard to anyone who was not the one who rigged the screen, because they have no way to know from a glance whether this unit is sealed yet or not. Restringing the warning line is what tells them the same thing the crew already knows, without relying on a shout across an open roof.",
      missNote: "The second roofer walked right up to the curb edge and looked down before anyone reached them. They stepped back on their own. The warning line was down for exactly as long as it took someone else to notice, and this time it was luck rather than the line that kept them off the unfastened unit.",
      wrongNote: "It is the warning line. Get it back up before anyone else reads this curb as clear.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, GLSK_ACCENT);

    // ------------------------------------------------------------ the roof
    const roof = box(g, 7.0, 0.08, 6.4, 0, 0.04, 0, 0x9aa0a0, { rough: 0.85, cast: false });
    roof.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#9aa0a0", tone2: "#8b9191" }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.05 });
    const walkPad = box(g, 1.4, 0.02, 5.0, -2.6, 0.09, 0, 0x50606c, { rough: 0.7, metal: 0.2, cast: false });
    walkPad.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h)), { repeat: 4, px: 256 });

    // ------------------------------------------------------------ the curb
    const curb = group(g, 0, 0.08, -0.2);
    box(curb, 1.6, 0.4, 1.2, 0, 0.2, 0, 0x6b6d6a, { rough: 0.85, finish: "concrete", cast: false });
    const curbOpening = box(curb, 1.3, 0.02, 0.9, 0, 0.41, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, curbOpening, "skylight-fall-through");
    hits["roof-cart-curb"] = curbOpening;
    holoTag(curb, "curb — screened", 0, 0.75, 0, { css: "#e0b23a", w: 0.32 });

    // The old cracked unit sitting on the curb until removed.
    const oldUnit = group(curb, 0, 0.42, 0, 0.1);
    box(oldUnit, 1.35, 0.04, 0.95, 0, 0, 0, 0x8fc9d8, { rough: 0.15, opacity: 0.4, transparent: true, cast: false });
    reg(hits, oldUnit, "cracked-unit");
    holoTag(curb, "cracked unit — by cups", 0.4, 0.65, 0.4, { css: "#e0b23a", w: 0.36 });
    const crackedEdgeZone = box(curb, 1.4, 0.06, 1.0, 0, 0.44, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crackedEdgeZone, "cracked-dome-edge");
    const capOld = group(curb, 0, 0.44, 0, 0.1);
    box(capOld, 1.45, 0.03, 1.05, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.65 });
    reg(hits, capOld, "old-cap-fastener");
    const capPinch = box(curb, 1.5, 0.06, 1.1, 0, 0.47, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, capPinch, "curb-clamp-pinch");

    // The fall-through screen and warning line, over/around the curb.
    const screen = group(g, 0, 0.5, -0.2);
    box(screen, 1.7, 0.02, 1.3, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, opacity: 0.6, transparent: true, cast: false });
    reg(hits, screen, "fall-screen");
    const screenAnchors = [];
    for (const [sx, sz] of [[-0.75, -0.55], [0.75, -0.55], [-0.75, 0.55], [0.75, 0.55]]) {
      const a = cyl(screen, 0.015, 0.015, 0.06, sx, -0.01, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
      screenAnchors.push(a);
    }
    reg(hits, screenAnchors[0], "screen-anchor");
    const ratingPlate = box(screen, 0.14, 0.01, 0.1, 0.7, 0.02, 0.55, 0xd8d8d0, { rough: 0.5 });
    reg(hits, ratingPlate, "screen-rating");
    holoTag(screen, "screen rating plate", 0.7, 0.15, 0.55, { css: "#e0b23a", w: 0.3 });
    const warnPosts = [];
    for (const [sx, sz] of [[-1.1, -0.9], [1.1, -0.9], [1.1, 0.9], [-1.1, 0.9]]) {
      warnPosts.push(cyl(g, 0.02, 0.02, 0.9, sx, 0.53, sz - 0.2, 0xf2c14b, { rough: 0.5, seg: 10 }));
    }
    const warnLine = box(g, 4.2, 0.01, 0.01, 0, 0.95, -1.1, 0xf2c14b, { rough: 0.6, cast: false });
    reg(hits, warnLine, "warning-line");
    const warnLineDown = box(g, 4.2, 0.01, 0.01, 0, 0.95, 0.9, 0xf2c14b, { rough: 0.6, cast: false });
    reg(hits, warnLineDown, "warning-line-down");
    const screenStowMarker = box(g, 0.3, 0.05, 0.3, 1.3, 0.09, -1.6, 0x2b2f34, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, screenStowMarker, "screen-stow");

    // Anchor, harness, anemometer.
    const anchor = group(g, -2.2, 0.5, -0.5);
    box(anchor, 0.12, 0.12, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const ring = cyl(anchor, 0.05, 0.05, 0.02, 0, 0.06, 0, 0xd2312b, { rough: 0.5, metal: 0.5, seg: 14 });
    ring.rotation.x = Math.PI / 2;
    reg(hits, anchor, "roof-anchor");
    holoTag(g, "roof anchor point", -2.2, 0.75, -0.5, { css: "#e0b23a", w: 0.3 });
    const harnessBag = group(g, -2.5, 0.06, 1.0, 0.3);
    box(harnessBag, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x2b2f34, { rough: 0.8 });
    const webbing = box(harnessBag, 0.26, 0.04, 0.16, 0, 0.18, 0, 0xe0b23a, { rough: 0.85 });
    reg(hits, webbing, "harness-webbing");
    const lanyard = hose(harnessBag, [[0.1, 0.2, 0.05], [0.25, 0.3, 0.1], [0.4, 0.25, 0.05]], 0.012, 0xe0b23a, { steps: 10 });
    const snap = box(harnessBag, 0.05, 0.08, 0.02, 0.42, 0.25, 0.05, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, snap, "lanyard-snap");
    holoTag(g, "harness · lanyard", -2.5, 0.4, 1.0, { css: "#e0b23a", w: 0.3 });
    const anemometer = instrument(g, -2.8, 1.1, -1.2, { ry: 0.4, idle: "-- km/h", color: 0xe0b23a, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(g, "anemometer", -2.8, 1.4, -1.2, { css: "#e0b23a", w: 0.26 });

    // The new unit, hoist point, cart, second skylight, debris, tools.
    const hoistPoint = group(g, 2.4, 0.06, -1.6, -0.3);
    box(hoistPoint, 0.06, 0.9, 0.06, -0.5, 0.45, 0, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    const newUnit = group(hoistPoint, 0, 0.5, 0, 0.1);
    box(newUnit, 1.35, 0.04, 0.95, 0, 0, 0, 0xa8dcea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    reg(hits, newUnit, "new-skylight");
    holoTag(hoistPoint, "new unit — two-handed", 0, 0.85, 0, { css: "#e0b23a", w: 0.4 });
    const carryZone = box(g, 2.0, 1.2, 1.5, 1.4, 0.7, -1.0, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, carryZone, "dome-wind-catch");
    const capNew = group(curb, 0, 0.44, 0, 0.1);
    box(capNew, 1.45, 0.03, 1.05, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.65, opacity: 0, transparent: true });
    reg(hits, capNew, "new-cap-fastener");
    const unitClamp = group(curb, 0.6, 0.46, 0.4);
    box(unitClamp, 0.1, 0.03, 0.1, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    unitClamp.visible = false;
    reg(hits, unitClamp, "unit-clamp");
    const levelInst = instrument(curb, 0.9, 0.55, 0.3, { ry: 0.3, idle: "-- mm", color: 0xe0b23a });
    reg(hits, levelInst, "level-instrument");
    holoTag(curb, "level gauge", 0.9, 0.8, 0.3, { css: "#e0b23a", w: 0.28 });
    const gun = group(g, 1.1, 0.1, -0.9, -0.3);
    cyl(gun, 0.025, 0.025, 0.24, 0, 0, 0, 0xe0b23a, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(gun, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, gun, "sealant-gun");
    holoTag(g, "sealant gun", 1.1, 0.35, -0.9, { css: "#e0b23a", w: 0.24 });
    glassVacuumLifter(g, 1.5, 0.9, -1.9, { ry: -0.5 });
    level(g, -1.6, 0.09, 1.4, { ry: 0.3 });

    const cart = group(g, 2.6, 0.06, 1.4, 0.3);
    box(cart, 1.4, 0.05, 1.0, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    for (const [sx, sz] of [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]]) cyl(cart, 0.05, 0.05, 0.03, sx, 0.05, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    const cartSlot = box(cart, 1.35, 0.04, 0.95, 0, 0.08, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["roof-cart"] = cartSlot;

    const secondSkylight = group(g, -2.9, 0.08, -2.2);
    box(secondSkylight, 1.2, 0.3, 0.9, 0, 0.15, 0, 0x6b6d6a, { rough: 0.85, finish: "concrete", cast: false });
    const secondOpening = box(secondSkylight, 1.0, 0.02, 0.7, 0, 0.31, 0, 0xd2312b, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, secondOpening, "unguarded-skylight");
    holoTag(secondSkylight, "no screen — flag it", 0, 0.6, 0, { css: "#d2312b", w: 0.36 });
    const debris = box(g, 1.6, 0.03, 0.6, -3.4, 0.045, 1.6, 0x6b665c, { rough: 0.95, cast: false });
    debris.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, { a: "#8b8878", b: "#3a3831" })), { repeat: 2, px: 256 });
    reg(hits, debris, "roof-debris");
    const toolAtEdge = box(g, 0.16, 0.05, 0.02, 3.4, 0.1, -2.8, 0x1b1e22, { rough: 0.6 });
    reg(hits, toolAtEdge, "tool-at-edge");
    const hatch = group(g, 3.0, 0.06, 2.2);
    box(hatch, 0.8, 0.06, 0.8, 0, 0.03, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    hatch.rotation.z = 0.15;
    reg(hits, hatch, "unlatched-hatch");
    holoTag(hatch, "roof hatch", 0, 0.3, 0, { css: "#e0b23a", w: 0.26 });

    // ------------------------------------------------------- tailboard and log
    const tailboard = group(g, -3.0, 0.7, 2.0, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — CURB 6", ["Curb: skylight 6, screened", "Anchor: roof structural point", "Wind limit: per plan", "Others on roof: watch for curb 4", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#e0b23a" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -3.0, 1.25, 2.0, { css: "#e0b23a", w: 0.22 });
    const logBoard = group(g, 3.1, 0.7, -1.8, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("CURB LOG — CURB 6", ["Unit: ____", "Screen rating: ____", "Wind: ____", "Level: ____", "Signed: ____"], { bg: "#f4efe4", band: "#e0b23a" }), { px: 256 });
    reg(hits, logFace, "curb-log");
    holoTag(g, "curb log", 3.1, 1.15, -1.8, { css: "#e0b23a", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -3.3, 1.7, -1.2, (ctx, w, h) => {
      ctx.fillStyle = "#1c1608"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0b23a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fbeed0";
      ctx.fillText("SKYLIGHT DETAIL — CURB 6", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Unit: laminated safety glazing, per Z97.1", "Screen: rated per manufacturer plate", "Cap torque: per the manufacturer's manual", "Sealant: listed silicone, per drawing depth", "Level tolerance: per the roofing detail"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLSK_ACCENT, ry: 0.5, stalk: true });

    // ----------------------------------------------------------- the crew
    const journeyman = standingFigure(g, 0.8, -1.65, { ry: 2.6, cloth: 0x8a6a1c, trousers: 0x2b2f34, helmet: 0xe0b23a, vest: 0xf2c14b, harness: true, gloves: true });

    // --------------------------------------------------------- dressing
    for (const [x, z] of [[-3.2, 3.0], [3.2, 3.0]]) cone(g, x, z);

    // Roof dressing: an HVAC curb and vent stack well clear of the work area.
    const hvacCurb = group(g, 2.6, 0.08, -1.8);
    box(hvacCurb, 1.0, 0.5, 0.8, 0, 0.25, 0, 0x6b6d6a, { rough: 0.85, finish: "concrete", cast: false });
    box(hvacCurb, 0.9, 0.4, 0.7, 0, 0.7, 0, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    for (const dz of [-0.3, 0.3]) cyl(hvacCurb, 0.05, 0.05, 0.3, 0.5, 1.05, dz, 0x8a8f94, { rough: 0.5, metal: 0.5, seg: 10 });
    const ventStack = group(g, -3.0, 0.08, -0.6);
    cyl(ventStack, 0.12, 0.12, 0.6, 0, 0.3, 0, 0x6b6d6a, { rough: 0.85, finish: "concrete", seg: 12 });
    cyl(ventStack, 0.1, 0.1, 0.4, 0, 0.8, 0, 0xaeb5bb, { rough: 0.45, metal: 0.65, seg: 12 });
    ball(ventStack, 0.13, 0, 1.02, 0, 0xaeb5bb, { rough: 0.45, metal: 0.65 });
    const conduit = hose(g, [[2.6, 0.6, -1.4], [2.2, 0.6, -0.8], [1.8, 0.6, -0.4]], 0.03, 0x2b2f34, { steps: 8 });
    void conduit;
    const spareGasketRoll = group(g, -2.4, 0.06, -2.0);
    cyl(spareGasketRoll, 0.12, 0.12, 0.3, 0, 0.12, 0, 0x1b1e22, { rough: 0.8, seg: 16 });
    const toolTray = group(g, -1.2, 0.06, 1.4);
    box(toolTray, 0.4, 0.06, 0.28, 0, 0.03, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 3; i++) box(toolTray, 0.08, 0.03, 0.2, -0.12 + i * 0.12, 0.07, 0, 0x8a8f94, { rough: 0.5, metal: 0.6 });

    let holdingDome = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.5, 1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "harness-seq") { snap.parent.remove(snap); anchor.add(snap); snap.position.set(0, 0.1, 0.03); snap.rotation.set(0, 0, 0); }
        if (step.id === "roof-walk") { secondOpening.material = mat(0xd2312b, { rough: 0.6, opacity: 0.2, transparent: true }); debris.visible = false; }
        if (step.id === "cap-turn") { capOld.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "old-glass-drag") { oldUnit.parent.remove(oldUnit); cart.add(oldUnit); oldUnit.position.set(0, 0.1, 0); oldUnit.rotation.set(0, 0, 0); }
        if (step.id === "dome-hold") { newUnit.parent.remove(newUnit); curb.add(newUnit); newUnit.position.set(0, 0.44, 0); newUnit.rotation.set(0, 0, 0); }
        if (step.id === "cap-torque") { capNew.material = mat(0x8a8f94, { rough: 0.4, metal: 0.65 }); }
        if (step.id === "sealant-track") { /* bead visual kept simple on this station */ }
        if (step.id === "screen-down-seq") { warnPosts.forEach((p) => (p.visible = false)); screen.visible = false; }
        if (step.id === "roof-walk-2") { toolAtEdge.visible = false; hatch.rotation.z = 0; }
        if (step.id === "log") repaint(logFace, paperFace("CURB LOG — CURB 6", ["Unit: curb 6, replaced", "Screen rating: pass", "Wind: 8–14 km/h", "Level: 0.3 mm", "Signed: apprentice / journeyman"], { bg: "#f4efe4", band: "#e0b23a" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-dome") { newUnit.rotation.z = 0.2; newUnit.position.y = 0.5; }
        if (it.id === "second-worker") { journeyman.position.set(2.6, 0, -0.4); journeyman.rotation.y = -1.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-dome") { newUnit.rotation.z = 0; newUnit.position.y = 0.44; unitClamp.visible = true; }
        if (it.id === "second-worker") { journeyman.position.set(1.3, 0, -1.4); journeyman.rotation.y = 2.6; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingDome = !!(step?.id === "dome-hold" && session.holding);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 30).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.18 && gg.t <= 0.46 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "level-gauge") {
          repaint(levelInst.userData.screen, signFace(`${((gg.t - 0.5) * 24).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (holdingDome) newUnit.position.y = 0.5 + Math.sin(t * 3) * 0.004;
      },
    };
  },
};
