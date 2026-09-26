import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, tileFace, stainlessFace, reg,
} from "../citykit.js";
import { tapeMeasure, level } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shop Drawing Takeoff And Field Measure VR — Construction &
// Structural Trades, glaziers and architectural metal pack. Before a
// replacement curtain wall bay is ever ordered, somebody stands in front of
// the actual opening with a tape, a laser and the shop drawing set and finds
// out whether the building agrees with the drawing. It usually does not,
// not exactly — settlement, tolerance stack-up and a hundred small trades
// that came before this one all move an opening a few millimetres off what
// the paper says, and a lite ordered to the drawing instead of the field
// measurement is a lite that arrives and does not fit.

const GLTD_ACCENT = 0x7a8fa3;

export const SIM_GL_SHOP_DRAWING_TAKEOFF_AND_FIELD_MEASURE = {
  id: "gl-shop-drawing-takeoff-and-field-measure",
  index: "359",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 takeoff and field measure",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials for the ordered lite; OSHA 29 CFR 1926.451 scaffolds general requirements and 29 CFR 1926.454 training requirements for scaffold erectors and users for the rolling tower used to reach the transom; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria",
  name: "Shop Drawing Takeoff And Field Measure",
  title: simTitle("Shop Drawing Takeoff And Field Measure"),
  tagline: "Tailboard and wind read, the rolling scaffold set up locked and railed, the drawing checked against the actual opening, width, height and diagonal taken and squared, a colour sample held to daylight, and the takeoff logged",
  accent: GLTD_ACCENT,
  accentCss: "#7a8fa3",
  parSeconds: 270,
  footprint: 2.0,
  badge: { id: "opening-measured-clean", name: "Opening Measured Clean", note: "A field measurement taken against a locked, railed scaffold and squared to the drawing, with the order going out on the building's own numbers rather than the paper's" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the scaffold rolling out from under you is what you keep seeing",

  game: system({
    name: "Survey Crew",
    currency: "MEASURE",
    ranks: ["Pre-apprentice", "Ground Hand", "Field Surveyor", "Lead Glazier", "Takeoff Certified"],
    badges: [
      { id: "scaffold-locked", name: "Scaffold Locked", note: "Every caster locked before the platform was climbed", test: AWARD.stepClean("scaffold-seq") },
      { id: "nobody-under", name: "Nobody Under", note: "No unsafe action on or under the scaffold the whole run", test: AWARD.safe },
      { id: "square-read", name: "Square Read", note: "The opening's diagonal reading taken inside tolerance, first time", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-takeoff", name: "Clean Takeoff", note: "The measurement taken without a correction", test: AWARD.clean },
      { id: "plumb-held", name: "Plumb Held", note: "The straightedge held steady the full reading", test: AWARD.unbroken },
      { id: "takeoff-in-time", name: "Takeoff In Time", note: "Measured, checked and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "temp-cover-edge": "You ran a hand along the damaged corner of the temporary cover on the next bay without looking at it first. The plywood over that bay has a split corner from the last time something struck it, and a split edge on a cover panel can carry a sliver or a sharp break the same as any other material that has already failed once. It gets looked at before it gets touched, and reported rather than picked at.",
    "scaffold-unlocked-wheel": "You climbed the rolling scaffold before every caster was locked. A tower on wheels is designed to move when it is meant to and stay dead still every other time, and the difference between those two states is entirely the locks — a platform that rolls a few centimetres while someone is on it can put them off the edge just as surely as a platform with no wheels at all. Every caster gets checked locked before a foot goes on the first rung.",
    "tripod-pinch": "You folded the laser's tripod leg with your fingers inside the hinge. A tripod leg locks with real spring force so it cannot collapse under the instrument's own weight, and that same force is what a finger meets if it is inside the hinge when the leg folds. The legs are worked from the outside, thumb and fingers clear of where they close.",
    "sample-panel-wind": "You held the glass colour sample out past the opening's edge to check it against the sky without a second hand steadying it. A sample this size catches a gust at height the same as any other lite, and a coupon that gets away from you at an open bay is a small piece of glass falling from a floor where a small piece of glass falling is exactly as dangerous as a large one to whoever is underneath. It is held close to the body, both hands, or clamped to a stand.",
  },

  lateNotes: {
    "colour-sample": "The sample only goes out toward the opening after the scaffold is locked and the tape readings are already taken. A sample held out before the platform is secure is one more thing to drop from a moving surface.",
    "laser-offset": "The laser is zeroed before it is trusted for a reading that goes on the takeoff sheet. A reading taken on an uncalibrated offset is a number the shop will cut a lite to.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — which bay is being measured, the scaffold plan, the wind limit for the sample check, who else has access — and sign it.",
      why: "A takeoff looks like paperwork right up until the scaffold goes up and the opening turns out to be a storey above a lobby floor, and the tailboard is what makes today's plan for the rolling tower and the sample check the crew's plan rather than something improvised once the tape is already out.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind before the sample goes out to the opening",
      cue: "Take the anemometer reading at the opening and commit it inside the working band before the colour sample is held up to it.",
      why: "A colour sample held out at an open bay to check against daylight is briefly exactly the kind of small flat panel a gust takes an interest in, and the reading is taken here rather than assumed from the lobby because the opening itself funnels whatever the building's exterior is doing that morning.",
      gauge: { label: "WIND", speed: 0.66, green: [0.2, 0.5], readout: (t) => `${(t * 28).toFixed(0)} km/h`, missNote: "That reading is outside the working band for holding the sample at the opening — over it, wait; under it, read it again at the bay." },
    },
    {
      id: "scaffold-seq", kind: "sequence",
      targets: ["caster-locks", "outriggers-out", "guardrails-up"],
      itemNames: { "caster-locks": "every caster locked", "outriggers-out": "outriggers deployed", "guardrails-up": "guardrails fitted" },
      title: "Set up the rolling scaffold",
      cue: "Lock every caster first, then deploy the outriggers, then fit the guardrails — in that order, before anyone climbs.",
      why: "29 CFR 1926.451 has a scaffold's stability and its guardrails checked before it is climbed, and the order here follows the actual risk: a tower that can roll is dangerous before anyone is on it, the outriggers are what stop it tipping once someone's weight moves toward one side, and the guardrails are what catches the fall the first two were meant to prevent needing to catch.",
      outOfOrderNote: "Casters, then outriggers, then guardrails — nothing gets climbed until the platform underneath it cannot move on its own.",
    },
    {
      id: "site-walk", kind: "find", noHint: true,
      targets: ["damaged-cover-corner", "loose-fastener"],
      itemNames: { "damaged-cover-corner": "the temporary cover's split corner", "loose-fastener": "a loose fastener on the lobby floor" },
      itemNotes: {
        "damaged-cover-corner": "The plywood cover over the next bay has a split corner that nobody has flagged since it happened.",
        "loose-fastener": "A fastener from some earlier job is sitting on the lobby floor right where the scaffold's own wheels are about to roll over it.",
      },
      title: "Walk the lobby before the scaffold goes up",
      cue: "Look at the cover panel and the floor where the scaffold will stand — click the two things wrong before setup starts.",
      why: "A split cover corner and a stray fastener under a scaffold's own wheel path are both things that read as background clutter in a lobby that sees foot traffic all day, and both change what happens the moment this crew's own work brings a hand or a caster into contact with them.",
    },
    {
      id: "drawing-check", kind: "select", target: "shop-drawing",
      title: "Check the shop drawing revision against the field opening",
      cue: "Read the drawing's revision block and confirm it matches the bay actually in front of you before a single measurement is taken.",
      why: "A shop drawing set changes revisions the same way any construction document does, and a measurement taken against the wrong revision is a measurement that answers a question nobody is asking anymore. The revision block is checked first because everything that follows only means something if it is being measured against the current drawing.",
    },
    {
      id: "laser-turn", kind: "turn", target: "laser-offset",
      title: "Zero the laser meter's reference offset",
      cue: "Turn the offset dial to zero against a known reference before trusting the meter for a reading that goes on the takeoff sheet.",
      why: "A laser meter measures from whatever its own reference offset is set to, and an offset left over from the last job's different mounting method reads a number that is wrong by exactly that offset — consistently, confidently, and wrong. It is zeroed against a known reference here, not assumed correct from this morning.",
      turn: { turns: 1, axis: "z", label: "ZERO" },
    },
    {
      id: "width-drag", kind: "drag", target: "tape-hook",
      title: "Stretch the tape across the opening's width",
      cue: "Hook the tape at one jamb and draw it across to the other, flat and untwisted, before reading the width.",
      why: "A tape that twists or sags between the jambs reads a distance longer than the opening actually is, and the width on the takeoff sheet is the one number every other trade downstream treats as fact — a lite ordered to a sagging tape's reading arrives too wide for a rabbet that was never actually that big.",
      drag: { to: "far-jamb", radius: 0.45, missNote: "Not flat to the far jamb — a sagging tape reads a width the opening does not actually have." },
    },
    {
      id: "plumb-hold", kind: "hold", target: "straightedge", seconds: 4,
      title: "Hold the straightedge steady against the jamb",
      cue: "Both hands on the straightedge, hold it flat against the jamb while the out-of-plumb reading is taken — do not let it drift.",
      why: "A straightedge that drifts even a few millimetres while the reading is being taken changes the number by exactly how much it drifted, and an opening's actual plumb is what tells the shop whether the new unit needs a shim allowance built into the order or can go in true. It is held steady the whole time the reading is being read, not just when it is first placed.",
      holdBreakNote: "The straightedge drifted off the jamb before the reading was taken — that number is not the opening's actual plumb. Reset it flat and hold until the reading is read.",
    },
    {
      id: "sill-track", kind: "track", target: "measuring-wheel", seconds: 5,
      title: "Run the measuring wheel across the sill at a steady pace",
      cue: "Roll the measuring wheel along the sill at a steady pace so the reading accumulates evenly across the whole run.",
      why: "A measuring wheel run too fast skips small sections of an uneven sill and undercounts the distance, while one run too slow can double-count where it hesitates — a steady pace is what the wheel's own mechanism actually depends on to read the sill's true length rather than an approximation of it.",
      track: { label: "WHEEL", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.13, readout: (v) => `${(v * 3).toFixed(2)} m/s` },
      holdBreakNote: "The pace ran out of the band — the wheel's count is no longer reliable for that stretch. Run it again at a steady pace.",
    },
    {
      id: "square-gauge", kind: "gauge", target: "diagonal-instrument",
      title: "Check the opening's diagonal against tolerance",
      cue: "Read the diagonal gauge across both corners and commit inside tolerance.",
      why: "An opening's two diagonals tell you whether it is actually a rectangle or a parallelogram that happens to have the right width and height, and a unit ordered to a width and height alone can still arrive unable to seat square in an opening whose diagonals do not match — the reading here is what a width and height measurement on their own cannot catch.",
      gauge: { label: "DIAGONAL mm", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.5) * 20).toFixed(1)} mm`, missNote: "Outside diagonal tolerance — this opening is out of square by more than the standard unit's allowance. Flag it before the order goes in." },
    },
    {
      id: "sample-hold", kind: "hold", target: "colour-sample", seconds: 4,
      title: "Hold the colour sample to daylight at the opening",
      cue: "Both hands on the sample, held close to the body at the opening's edge, steady while the colour match is checked against daylight.",
      why: "A finish colour reads differently under shop lighting than it does against the sky the finished unit will actually sit under, and the sample is checked here, at the opening, for that reason. It is held close and two-handed because this is exactly the small flat panel a gust at an open bay takes an interest in.",
      holdBreakNote: "The sample drifted out past a safe hold at the opening's edge — bring it back in close before continuing the check.",
    },
    {
      id: "takeoff-seq", kind: "sequence",
      targets: ["record-width", "record-height", "record-diagonal"],
      itemNames: { "record-width": "width recorded on the takeoff sheet", "record-height": "height recorded on the takeoff sheet", "record-diagonal": "diagonal recorded on the takeoff sheet" },
      title: "Record the takeoff",
      cue: "Width first, then height, then the diagonal reading — written onto the takeoff sheet in the order they were actually measured.",
      why: "The takeoff sheet is the one document the shop actually cuts glass from, and recording the numbers in the order they were measured is what keeps a transposed digit from being the only thing between a correct order and a lite that does not fit — three numbers checked once each in sequence catch more than the same three numbers checked all at once at the end.",
      outOfOrderNote: "Width, then height, then diagonal — recorded in the order they were actually read off the tape and the gauge.",
    },
    {
      id: "scaffold-walk", kind: "find", noHint: true,
      targets: ["scaffold-still-unlocked", "tool-on-platform"],
      itemNames: { "scaffold-still-unlocked": "a caster left unlocked after the climb-down", "tool-on-platform": "a tool left on the scaffold platform" },
      itemNotes: {
        "scaffold-still-unlocked": "One of the casters got knocked out of its lock partway through the job and nobody noticed climbing back down.",
        "tool-on-platform": "The laser meter is still sitting on the scaffold platform above head height for anyone walking under it.",
      },
      title: "Walk the scaffold before it is left standing",
      cue: "Look at the casters and the platform — click the two things wrong before the crew leaves the tower where it stands.",
      why: "A scaffold left standing in a lobby is a scaffold other people are going to walk past and under before this crew comes back for it, and an unlocked caster or a tool left on the platform are both things that turn a piece of equipment into a hazard for someone who never signed today's tailboard.",
    },
    {
      id: "log", kind: "select", target: "takeoff-log",
      title: "Log the takeoff",
      cue: "Width, height, diagonal, wind readings and the faults found and fixed, and sign it.",
      why: "The log ties this bay's actual field measurements to a date and a name, which is what the shop orders glass against instead of the drawing's original dimension. It also carries the damaged cover and the loose fastener as fixed rather than assumed, for whoever walks this lobby before the crew returns to install.",
    },
  ],

  interrupts: [
    {
      id: "gust-cover",
      kind: "Gust at the adjacent opening",
      after: "plumb-hold", delay: 3, seconds: 11,
      alert: "A gust has come through the adjacent bay's temporary cover and the loose weather film behind it is flapping hard enough to pull at its staples.",
      cue: "The weather film behind the cover is tearing loose.",
      target: "film-clamp",
      why: "A weather film held on by staples alone is one gust away from tearing free entirely, and the clamp bar across its edge is what holds it without anyone reaching into a gust-driven flap to restaple it by hand. It gets clamped now; the staples can be redone once the wind settles.",
      missNote: "The film tore two more staples free before the gust dropped. It held, this time, on the staples that were left. The clamp bar exists for exactly this gust and sat unused the whole time the film was tearing.",
      wrongNote: "It is the film clamp bar. Secure the tearing edge before reaching anywhere near it by hand.",
    },
    {
      id: "walker-under-scaffold",
      kind: "Someone walks toward the scaffold",
      after: "takeoff-seq", delay: 3, seconds: 11,
      alert: "Someone crossing the lobby is walking straight toward the scaffold's base, where the cordon cones have been kicked out of place.",
      cue: "Someone is approaching the scaffold with the cordon out of place.",
      target: "scaffold-cordon",
      why: "A rolling scaffold with tools still up on the platform is exactly the kind of thing nobody crossing a lobby thinks to look up at, and the cordon around its base is the only thing telling them not to walk directly under it. It gets reset the moment it is out of place, not after someone has already crossed the line it used to mark.",
      missNote: "The person walked past the scaffold's base and out the other side without looking up. Nothing fell while they were under it, this time. The cordon was out of place for exactly as long as it took someone to walk through where it should have been.",
      wrongNote: "It is the scaffold cordon. Reset it before anyone else walks under that platform.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, GLTD_ACCENT);

    // ------------------------------------------------------------ the lobby floor
    const floor = box(g, 6.6, 0.06, 5.6, 0, 0.03, 0, 0xe8ecee, { rough: 0.5, cast: false });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8 }), { repeat: 4, px: 384 }), { rough: 0.5, metal: 0.05 });

    // ------------------------------------------------------------ the wall / opening
    const wall = group(g, 0, 0.06, -2.4);
    box(wall, 6.6, 3.6, 0.2, 0, 1.8, 0, 0x6b4a2e, { rough: 0.35, metal: 0.5, cast: false });
    wall.children[0].material = texturedMat(surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, { base: "#6b4a2e", base2: "#4f3620" }), { repeat: 2, px: 256 }), { rough: 0.35, metal: 0.55 });
    const opening = group(wall, -1.0, 1.8, 0.11);
    const nearJamb = box(opening, 0.1, 3.2, 0.1, -0.7, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.65 });
    void nearJamb;
    const farJamb = box(opening, 0.1, 3.2, 0.1, 0.7, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["far-jamb"] = farJamb;
    const openingGap = box(wall, 1.5, 3.2, 0.05, -1.0, 1.8, 0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void openingGap;
    holoTag(wall, "Bay 14 — field measure", -1.0, 3.6, 0.1, { css: "#7a8fa3", w: 0.42 });
    const tapeHook = group(opening, -0.7, -1.4, 0.1);
    box(tapeHook, 0.04, 0.02, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, tapeHook, "tape-hook");
    const strEdge = group(opening, -0.7, 0.6, 0.14);
    box(strEdge, 0.02, 1.0, 0.02, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.6 });
    reg(hits, strEdge, "straightedge");
    holoTag(opening, "straightedge · jamb", -0.7, 1.3, 0.14, { css: "#7a8fa3", w: 0.3 });
    const wheel = group(opening, 0, -1.55, 0.1);
    cyl(wheel, 0.05, 0.05, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    reg(hits, wheel, "measuring-wheel");
    holoTag(opening, "measuring wheel", 0, -1.75, 0.1, { css: "#7a8fa3", w: 0.28 });
    const diagInst = instrument(opening, 0.9, 0.4, 0.15, { ry: 0.3, idle: "-- mm", color: 0x7a8fa3 });
    reg(hits, diagInst, "diagonal-instrument");
    holoTag(opening, "diagonal gauge", 0.9, 0.65, 0.15, { css: "#7a8fa3", w: 0.28 });

    // ------------------------------------------------------------ rolling scaffold
    const scaffold = group(g, -1.0, 0.06, -1.0, 0.2);
    const casters = [];
    for (const [sx, sz] of [[-0.5, -0.4], [0.5, -0.4], [-0.5, 0.4], [0.5, 0.4]]) {
      const c = cyl(scaffold, 0.07, 0.07, 0.06, sx, 0.07, sz, 0x1b1e22, { rough: 0.7, seg: 14 });
      c.rotation.z = Math.PI / 2;
      casters.push(c);
    }
    reg(hits, casters[0], "caster-locks");
    const climbZone = box(scaffold, 1.2, 1.8, 1.0, 0, 0.9, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, climbZone, "scaffold-unlocked-wheel");
    for (const sx of [-0.5, 0.5]) for (const sz of [-0.4, 0.4]) box(scaffold, 0.05, 1.6, 0.05, sx, 0.9, sz, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    const platform = box(scaffold, 1.1, 0.06, 0.9, 0, 1.7, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    void platform;
    const outriggers = group(scaffold, 0, 0.1, 0);
    for (const sx of [-0.9, 0.9]) box(outriggers, 0.5, 0.04, 0.04, sx, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    reg(hits, outriggers, "outriggers-out");
    const railTop = box(scaffold, 1.1, 0.03, 0.03, 0, 2.7, 0.45, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    reg(hits, railTop, "guardrails-up");
    holoTag(scaffold, "rolling scaffold", 0, 2.9, 0.45, { css: "#7a8fa3", w: 0.34 });
    const scaffoldStillUnlocked = cyl(scaffold, 0.07, 0.07, 0.06, 0.5, 0.07, 0.4, 0xd2312b, { opacity: 0.001, transparent: true, cast: false, seg: 14 });
    reg(hits, scaffoldStillUnlocked, "scaffold-still-unlocked");
    const cordonCones = [];
    for (const [x, z] of [[-1.6, -1.6], [-0.4, -1.6], [-1.6, -0.4], [-0.4, -0.4]]) { cordonCones.push([x, z]); cone(g, x, z); }
    const cordonZone = box(g, 1.6, 0.9, 1.6, -1.0, 0.5, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cordonZone, "scaffold-cordon");
    const toolOnPlatform = box(scaffold, 0.3, 0.06, 0.12, 0.2, 1.76, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    reg(hits, toolOnPlatform, "tool-on-platform");

    // Laser meter, tape, level.
    const laserStand = group(g, 0.6, 0.06, -1.4, -0.3);
    box(laserStand, 0.08, 1.0, 0.08, 0, 0.5, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const laserOffset = group(laserStand, 0, 1.02, 0);
    box(laserOffset, 0.1, 0.06, 0.05, 0, 0, 0, 0x22262b, { rough: 0.6 });
    reg(hits, laserOffset, "laser-offset");
    holoTag(laserStand, "laser meter", 0, 1.3, 0, { css: "#7a8fa3", w: 0.28 });
    const tripodPinch = box(laserStand, 0.14, 0.1, 0.06, 0, 0.2, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tripodPinch, "tripod-pinch");
    tapeMeasure(g, 1.4, 0.06, -0.6, { ry: 0.3 });
    level(g, -2.0, 0.06, 0.6, { ry: 0.4 });

    // Colour sample and stand.
    const sampleStand = group(g, -0.4, 0.06, -1.9, 0.2);
    box(sampleStand, 0.06, 0.7, 0.06, 0, 0.35, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const sample = group(sampleStand, 0, 0.75, 0, 0.1);
    box(sample, 0.3, 0.4, 0.02, 0, 0, 0, 0x6b4a2e, { rough: 0.35, metal: 0.4 });
    reg(hits, sample, "colour-sample");
    holoTag(sampleStand, "colour sample", 0, 1.0, 0, { css: "#7a8fa3", w: 0.3 });
    const sampleWindZone = box(g, 1.2, 1.2, 1.0, -0.6, 1.2, -1.8, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sampleWindZone, "sample-panel-wind");

    // Damaged temporary cover on the adjacent bay.
    const coverBay = group(wall, 1.6, 0, 0.1);
    box(coverBay, 1.4, 3.0, 0.03, 0, 0, 0, 0x8a7449, { rough: 0.85 });
    const coverCorner = box(coverBay, 0.3, 0.3, 0.04, 0.55, 1.3, 0.01, 0x8a7449, { rough: 0.85 });
    reg(hits, coverCorner, "damaged-cover-corner");
    const coverEdgeZone = box(coverBay, 0.34, 0.34, 0.08, 0.55, 1.3, 0.02, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, coverEdgeZone, "temp-cover-edge");
    const film = box(coverBay, 1.3, 2.8, 0.01, 0, 0, -0.03, 0x9fd6e6, { rough: 0.2, opacity: 0.35, transparent: true, cast: false });
    const filmClamp = box(coverBay, 1.4, 0.06, 0.04, 0, 1.5, 0.02, 0x59c97b, { rough: 0.5 });
    filmClamp.visible = false;
    reg(hits, filmClamp, "film-clamp");
    void film;

    const looseFastener = box(g, 0.06, 0.02, 0.02, -0.8, 0.06, -0.6, 0x8a8f94, { rough: 0.4, metal: 0.6 });
    reg(hits, looseFastener, "loose-fastener");

    // Shop drawing panel and takeoff sheet.
    const drawing = holoPanel(g, 0.6, 0.44, 2.2, 1.6, -1.2, (ctx, w, h) => {
      ctx.fillStyle = "#0e141a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7a8fa3"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e9edf1";
      ctx.fillText("SHOP DRAWING — BAY 14", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Revision: C, current", "Nominal width: per drawing", "Nominal height: per drawing", "Tolerance: per shop standard", "Field measure governs the order"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLTD_ACCENT, ry: -0.6, stalk: true });
    reg(hits, drawing, "shop-drawing");
    const recordW = group(g, 2.0, 0.7, -0.6);
    box(recordW, 0.04, 0.04, 0.04, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, recordW, "record-width");
    const recordH = group(g, 2.05, 0.7, -0.6);
    box(recordH, 0.04, 0.04, 0.04, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, recordH, "record-height");
    const recordD = group(g, 2.1, 0.7, -0.6);
    box(recordD, 0.04, 0.04, 0.04, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, recordD, "record-diagonal");

    const anemometer = instrument(g, 2.4, 1.1, 0.4, { ry: -0.4, idle: "-- km/h", color: 0x7a8fa3, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(g, "anemometer", 2.4, 1.4, 0.4, { css: "#7a8fa3", w: 0.26 });

    const tailboard = group(g, -2.6, 0.7, 1.8, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — TAKEOFF 14", ["Bay: 14, field measure", "Scaffold: rolling, locked", "Wind limit: per plan at the bay", "Cordon: cones around the base", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#7a8fa3" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -2.6, 1.25, 1.8, { css: "#7a8fa3", w: 0.22 });
    const logBoard = group(g, 2.6, 0.7, 1.8, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("TAKEOFF LOG — BAY 14", ["Width: ____", "Height: ____", "Diagonal: ____", "Wind: ____", "Signed: ____"], { bg: "#f4efe4", band: "#7a8fa3" }), { px: 256 });
    reg(hits, logFace, "takeoff-log");
    holoTag(g, "takeoff log", 2.6, 1.15, 1.8, { css: "#7a8fa3", w: 0.22 });

    const surveyor = standingFigure(g, 0.2, 1.2, { ry: -2.6, cloth: 0x3a5a6e, trousers: 0x2b2f34, helmet: 0x7a8fa3, vest: 0xf2c14b, outfit: "office" });
    const passerby = standingFigure(g, 2.8, -2.2, { ry: -2.4, cloth: 0x5a5a5a, trousers: 0x2b2f34, outfit: "office" });

    // Lobby dressing: a bench and a planter well clear of the scaffold and opening.
    const bench = group(g, 2.6, 0.06, 2.2);
    box(bench, 1.2, 0.45, 0.4, 0, 0.22, 0, 0x6b4a2e, { rough: 0.5, metal: 0.1 });
    for (const sx of [-0.5, 0.5]) box(bench, 0.06, 0.22, 0.35, sx, 0.11, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const planter = group(g, -2.8, 0.06, 2.2);
    cyl(planter, 0.3, 0.34, 0.5, 0, 0.25, 0, 0x50606c, { rough: 0.7, metal: 0.2, seg: 16 });
    ball(planter, 0.28, 0, 0.55, 0, 0x3f7a3f, { rough: 0.9 });

    let holdingStraight = false, holdingSample = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, 1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "site-walk") { coverCorner.material = mat(0x59c97b, { rough: 0.5 }); looseFastener.visible = false; }
        if (step.id === "scaffold-walk") { scaffoldStillUnlocked.material = mat(0x1b1e22, { rough: 0.7, opacity: 0.001, transparent: true }); toolOnPlatform.position.y = -1; }
        if (step.id === "log") repaint(logFace, paperFace("TAKEOFF LOG — BAY 14", ["Width: 1600 mm field", "Height: 3600 mm field", "Diagonal: within tolerance", "Wind: 8–12 km/h", "Signed: surveyor / lead"], { bg: "#f4efe4", band: "#7a8fa3" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-cover") { film.rotation.y = 0.15; }
        if (it.id === "walker-under-scaffold") { passerby.position.set(-0.6, 0, -1.0); passerby.rotation.y = 1.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-cover") { film.rotation.y = 0; filmClamp.visible = true; }
        if (it.id === "walker-under-scaffold") { passerby.position.set(2.8, 0, -2.2); passerby.rotation.y = -2.4; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingStraight = !!(step?.id === "plumb-hold" && session.holding);
        holdingSample = !!(step?.id === "sample-hold" && session.holding);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 28).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "square-gauge") {
          repaint(diagInst.userData.screen, signFace(`${((gg.t - 0.5) * 20).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (holdingStraight) strEdge.rotation.z = Math.sin(t * 3) * 0.003;
        if (holdingSample) sample.position.x = Math.sin(t * 3) * 0.004;
      },
    };
  },
};
