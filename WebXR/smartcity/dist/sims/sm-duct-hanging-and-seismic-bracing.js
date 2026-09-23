import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, pipeRun,
  standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Duct Hanging and Seismic Bracing VR — Manufacturing &
// Automation, SMART sheet metal pack. A corridor ceiling on a job under
// construction: a scissor lift, a duct jack, a run of rectangular duct going
// up on trapeze hangers off adhesive anchors in the slab, and the transverse
// and longitudinal braces the seismic drawing calls for. The lesson is time
// and load. An adhesive anchor holds nothing until the epoxy has cured for the
// hours on the cartridge, a hanger is a hanger only once its nuts are locked,
// and a lift on a slab full of debris is a platform that tilts.

const SMDH_ACCENT = 0x8fc47a;

export const SIM_SM_DUCT_HANGING_AND_SEISMIC_BRACING = {
  id: "sm-duct-hanging-and-seismic-bracing",
  index: "221",
  domain: "Manufacturing & Automation",
  trade: "Sheet metal installer — SMART, International Training Institute field installation curriculum",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "SMART and its International Training Institute field installation curriculum; SMACNA HVAC Duct Construction Standards for hanger type and spacing by duct size and the SMACNA Seismic Restraint Manual for transverse and longitudinal bracing; OSHA 29 CFR 1926.451 scaffold requirements as applied to a scissor lift, 29 CFR 1926.501 fall protection at the platform, 29 CFR 1926.453 where a boom lift is used; the anchor manufacturer's cure schedule and the engineer's seismic drawing",
  name: "Duct Hanging and Seismic Bracing",
  title: simTitle("Duct Hanging and Seismic Bracing"),
  tagline: "Hanger schedule and seismic drawing read, the lift inspected, the anchor's cure card checked before a load, trapeze hung and locked, the section raised and levelled, braces set to angle, the run walked and logged",
  accent: SMDH_ACCENT,
  accentCss: "#8fc47a",
  parSeconds: 290,
  footprint: 2.2,
  badge: { id: "cured-and-braced", name: "Cured And Braced", note: "A run hung on anchors that had cured, on hangers that were locked, with the braces the drawing asked for" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's apprenticeship coordinator or the job steward, or your employer's employee assistance program if the lift going over is what you keep feeling",

  game: system({
    name: "Ceiling Crew",
    currency: "HANGER",
    ranks: ["Pre-apprentice", "Ground Hand", "Duct Installer", "Run Lead", "Ceiling Crew Certified"],
    badges: [
      { id: "cure-read", name: "Cure Read", note: "The anchor's cure card read before the first hanger went on", test: AWARD.stepClean("anchor-cure") },
      { id: "feet-on-deck", name: "Feet On The Deck", note: "Never on a rail, never through an open gate, never a load on a wet anchor", test: AWARD.safe },
      { id: "on-angle", name: "On Angle", note: "Brace angle inside the drawing's band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "The section hung without a correction", test: AWARD.clean },
      { id: "level-held", name: "Level Held", note: "The run levelled without dropping out of band", test: AWARD.unbroken },
      { id: "run-in-time", name: "Run In Time", note: "Hung, braced and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wet-anchor": "You went to hang the trapeze on the anchor with the wet-epoxy tag still on it. An adhesive anchor holds nothing until the cartridge's cure time has passed at the slab's temperature — hours, not minutes, and longer on a cold morning — and a hanger loaded early pulls the rod out of uncured epoxy with the duct on it. The tag comes off when the card says so, never because the crew is ready.",
    "lift-gate-open": "You worked at height with the platform gate swung open behind you. The gate is the fourth side of the guardrail that 29 CFR 1926.451 and 1926.501 put between you and the slab, and a gate left open on a scissor lift is a guardrail with a person-shaped hole in it, directly behind a person facing the other way.",
    "midrail-stand": "You stood on the midrail to reach the far hanger. The guardrail is built to stop a person at waist height, and standing on it puts your waist above the top rail, where the rail stops nothing. The lift goes up, the lift moves, or the hanger waits — the rail is never a step.",
    "sharp-duct-end": "You caught the raw end of the duct section bare-handed as it swung on the jack. A field-cut duct end is a sheared edge nobody hemmed, and a section that swings puts that edge across a palm with its own weight behind it. Gloves on the lift, and the section steered by its flanges and the jack, not its edges.",
  },

  lateNotes: {
    "trapeze-hanger": "The hanger goes on after the anchor's cure card has been read and the tag is off — a hanger on a wet anchor is a load on nothing.",
    "duct-lift-crank": "The section is raised after the hangers are on and locked, so there is something to receive it. A duct on a jack with nowhere to go is a duct held up by a hand.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "site-board",
      title: "Check in at the site board",
      cue: "Sign onto the ceiling crew, note who is on the ground for you, and who else is working this corridor today.",
      why: "A run of duct goes up with one person on the platform and one on the ground, and the board is where both are named before the lift moves; the electricians and the pipe crew working the same corridor are on it too, which is how you learn the sprinkler main is going in above your route this afternoon. SMART crews read the board as the first control on a lift, because a platform going up with nobody named on the ground is a platform with nobody to stop it.",
    },
    {
      id: "hanger-schedule", kind: "select", target: "hanger-drawing",
      title: "Read the hanger schedule and the seismic drawing",
      cue: "Hanger type and spacing for this duct size, the anchor and its cure time, and where the transverse and longitudinal braces go.",
      why: "The SMACNA HVAC Duct Construction Standards give the hanger type and maximum spacing by duct size, and the engineer's drawing under the SMACNA Seismic Restraint Manual says where the braces sit and at what angle; both are read before the first anchor is drilled, because a hanger spaced from habit or a brace left for later is a run that passes by eye and fails the seismic inspection or the earthquake. The anchor's cure time on the drawing is the number the whole afternoon is planned around.",
    },
    {
      id: "lift-inspect", kind: "sequence", anyOrder: true,
      targets: ["lift-rails", "lift-tires", "lift-controls"],
      itemNames: { "lift-rails": "guardrails and gate", "lift-tires": "wheels, tyres and the slab under them", "lift-controls": "controls, horn and the emergency lowering" },
      title: "Inspect the lift before it leaves the floor",
      cue: "Rails and gate, wheels and the slab you will drive across, controls and the emergency lowering valve — all three before the first foot goes on.",
      why: "A scissor lift is a scaffold that drives, and 29 CFR 1926.451 wants it inspected by a competent person before each shift: rails that are pinned and a gate that latches, tyres that are not soft and a slab under them that is not covered in the debris the last trade left, controls that answer and an emergency lowering that works. Each of those is a way the platform ends up tilted or a person ends up on the floor, and each is found in a minute on the ground.",
    },
    {
      id: "anchor-cure", kind: "select", target: "cure-card",
      title: "Read the anchor's cure card before anything is hung",
      cue: "Find the card on the anchor set this morning, check the cartridge's cure time against the slab temperature and the time now.",
      why: "Adhesive anchors are set in the morning so the epoxy is cured by the time the duct goes up, and the cure time on the cartridge is at a stated temperature — a cold slab doubles it. The card on the anchor carries the time it was set and the time it may be loaded, and until that second time has passed the rod is a rod stuck in wet glue; the card is read, not the clock, and the wet-epoxy tag stays on until the card says it comes off.",
    },
    {
      id: "hanger-drag", kind: "drag", target: "trapeze-hanger",
      title: "Hang the trapeze on the rods",
      cue: "Lift the trapeze off the platform deck and set it onto the two hanger rods so the strut sits square under both.",
      why: "The trapeze is a length of strut across two threaded rods, and it carries the duct only when it sits square with a rod through each end and a nut under each; a trapeze hung on one rod and rested on the other is a hinge with a duct on it. It is lifted from the deck with two hands, set onto both rods at once, and held there until the nuts are on, because a trapeze that slides off one rod at height falls on whoever is below.",
      drag: { to: "rod-pair", radius: 0.45, missNote: "The strut is not on both rods — a trapeze on one rod is a hinge with a duct on it." },
    },
    {
      id: "nut-torque", kind: "turn", target: "hanger-nut",
      title: "Run the nuts down and lock them",
      cue: "Nut under the strut on each rod, run down snug, then the lock nut against it — both rods, before the section comes up.",
      why: "A hanger holds with two nuts per rod: the one the strut sits on and the lock nut that stops it backing off as the duct moves and the building vibrates. A single nut looks the same from the floor and walks down the rod a thread a week under a fan's vibration until the strut drops; the lock nut goes on before any load, because a load on a hanger with one nut is a load waiting for the thread to let go.",
      turn: { turns: 1, axis: "y", label: "LOCK NUT" },
    },
    {
      id: "raise", kind: "hold", target: "duct-lift-crank", seconds: 4,
      title: "Raise the section on the duct jack",
      cue: "Section strapped to the jack's cradle, then crank it up steadily until the flanges sit on the trapeze — no stopping halfway with a hand under it.",
      why: "The duct jack lifts the section to the trapeze so nobody's arms do, and the crank is turned steadily to the top because a section stopped halfway is a section a hand goes under to steady, and the jack's ratchet is the only thing holding it there. The section rides the cradle strapped, so a swing does not put its raw end across the platform, and it is landed on the trapeze with both flanges bearing before the strap comes off.",
      holdBreakNote: "You stopped the crank with the section in the air. A section halfway up is a section a hand goes under — take it steadily to the trapeze.",
    },
    {
      id: "level", kind: "track", target: "level-adjust", seconds: 5,
      title: "Level the run",
      cue: "Laser on the bottom of the run, adjust the nuts until the section reads level and hold it there while the second trapeze is snugged.",
      why: "A duct run out of level pulls its transverse joints open on the low side and pushes them shut on the high, which is a leak at every joint the balancing crew will spend a day chasing; the level is set with the laser on the duct's bottom and the hanger nuts, not by eye against a ceiling grid that is not level either. It is held level while the second trapeze is snugged because a run that was level for a moment is not a level run.",
      track: { label: "LEVEL", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${((v - 0.52) * 40).toFixed(1)} mm` },
      holdBreakNote: "The run drifted off level while the trapeze was being snugged — the joint on the low side has opened. Bring it back into the band and hold it.",
    },
    {
      id: "brace", kind: "sequence",
      targets: ["transverse-brace", "longitudinal-brace"],
      itemNames: { "transverse-brace": "the transverse brace across the run", "longitudinal-brace": "the longitudinal brace along it" },
      title: "Set the seismic braces the drawing calls for",
      cue: "Transverse brace first at the interval on the drawing, then the longitudinal brace at the joint the drawing marks.",
      why: "The SMACNA Seismic Restraint Manual braces a run against both directions of shake: transverse braces stop the duct swinging across the corridor, longitudinal braces stop it sliding along it, and the engineer's drawing gives the spacing of each. Transverse goes first because it steadies the run the longitudinal brace is then fixed to; a brace bolted to a duct that is still free to swing is a brace that has been bent before the first tremor.",
      outOfOrderNote: "Transverse first, then longitudinal — the longitudinal brace is fixed to a run the transverse brace has already steadied.",
    },
    {
      id: "clearance", kind: "gauge", target: "brace-angle",
      title: "Set the brace angle",
      cue: "Read the brace's angle to the slab on the inclinometer and commit inside the drawing's band.",
      why: "A seismic brace works at the angle it was designed for: too steep and it carries little of the horizontal load it exists for, too shallow and the anchor sees a pull-out it was not sized against. The drawing gives the angle as a band and the inclinometer on the brace is how it is proven, because the eye reads a brace on a ceiling as forty-five degrees whether it is thirty or sixty.",
      gauge: { label: "ANGLE", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${Math.round(25 + t * 40)}°`, missNote: "Off the drawing's band — a brace at the wrong angle loads the anchor in a way it was never sized for. Reset it." },
    },
    {
      id: "bracing-walk", kind: "find", noHint: true,
      targets: ["missing-locknut", "strut-short"],
      itemNames: { "missing-locknut": "a rod with no lock nut", "strut-short": "a strut that stops short of its rod" },
      itemNotes: {
        "missing-locknut": "One nut on that rod and nothing behind it — the strut will walk down the thread under the fan's vibration until it drops.",
        "strut-short": "That strut was cut short and the rod goes through nothing on that end; the trapeze is a lever bearing on one rod.",
      },
      title: "Walk the hangers before the lift moves on",
      cue: "From the platform, look along every rod and every strut of the run you just hung and click the two that are wrong.",
      why: "A hanger fault is invisible from the floor and obvious from the platform, and the platform is about to move to the next bay; this is the one moment the person who hung the run looks at all of it from arm's length. A rod with no lock nut and a strut that misses its rod are the two faults that let a run down months later, and both are fixed in a minute now with the tools already on the deck.",
    },
    {
      id: "joint-seal", kind: "select", target: "joint-sealant",
      title: "Seal the transverse joint",
      cue: "Gasket seated, corners drawn up, then the listed sealant run round the joint to the seal class on the drawing.",
      why: "The transverse joint is made up on the trapeze with the gasket seated and the corners drawn evenly, and sealed to the seal class the drawing gives, because the leakage test at the end of the job is a test of every joint the crew made overhead where nobody could see them. A joint sealed now, from the platform, costs a minute; the same joint found on the leakage test costs a lift, a ceiling opened and a day.",
    },
    {
      id: "ceiling-walk", kind: "find", noHint: true,
      targets: ["hanger-spacing-gap", "sprinkler-clash"],
      itemNames: { "hanger-spacing-gap": "the hanger spacing over the schedule", "sprinkler-clash": "the sprinkler main the brace will hit" },
      itemNotes: {
        "hanger-spacing-gap": "The gap between those two trapezes is over the schedule's maximum for this duct size — a third hanger goes in before the next section loads it.",
        "sprinkler-clash": "The longitudinal brace's line runs straight through where the sprinkler main goes in this afternoon. The brace moves now, on the drawing, not after the pipe is in.",
      },
      title: "Look along the run before the next section",
      cue: "Sight along the run and the ceiling beyond it and click the two things the next bay has to answer.",
      why: "The next section is hung to the same schedule as this one, and the ceiling ahead is shared with every other trade's pipe and conduit; a hanger spacing already over the maximum and a brace line through the sprinkler main are both cheaper to find from this platform than from a coordination meeting. The run is looked along, not just at, because a duct is a system and its faults accumulate down its length.",
    },
    {
      id: "hang-log", kind: "select", target: "hang-log",
      title: "Log the run",
      cue: "Sections hung, anchors and their cure times, braces set and their angle, the faults found and fixed, and sign it.",
      why: "The log is the record the seismic inspector reads against the drawing, and the record the crew reads when a hanger is questioned after the building is occupied: which anchor, set when, loaded when, braced at what angle. It also carries the missing lock nut and the short strut, so the faults are on paper as fixed rather than on somebody's memory as probably fine.",
    },
  ],

  interrupts: [
    {
      id: "tilt-alarm",
      kind: "Lift alarm",
      after: "raise", delay: 3, seconds: 12,
      alert: "The lift's tilt alarm is sounding. A wheel has rolled onto the debris on the slab and the platform is off level with the section in the air.",
      cue: "The floor you are standing on is no longer level.",
      target: "lift-stop",
      why: "A scissor lift's tilt alarm means the chassis is past the angle the maker rated it stable at, and the platform is at height with a duct section and a person on it. The crank stops, the platform's emergency stop is hit so nobody drives it further off level, and it comes down under the emergency lowering to a slab somebody clears first. The section can wait on the jack; the platform cannot wait on the tilt.",
      missNote: "You kept cranking with the tilt alarm sounding. The platform stayed up that time. A scissor lift on a tilted slab is a lever with you at the long end, and the alarm is the last warning before the maker's stability calculation stops applying to you.",
      wrongNote: "It is the emergency stop on the platform. Stop the lift first — the section, the crank and the slab are all problems for a platform that is not moving.",
    },
    {
      id: "helper-loads-early",
      kind: "Load on a wet anchor",
      after: "level", delay: 3, seconds: 12,
      alert: "The helper below has started hanging the next section on the anchors set this morning. The card on those says two more hours.",
      cue: "Somebody is loading epoxy that has not cured, under a run you are levelling.",
      target: "crew-radio",
      why: "The cure card on that anchor set is a time, and the time has not come; a hanger loaded on it pulls the rod out of wet epoxy with a duct section on the rod, in the corridor below the platform you are on. The radio stops the helper before the trapeze goes on. The level can be held again in a minute; the anchor cannot be un-loaded once the rod starts to move.",
      missNote: "You held the level and let the helper hang the section. The anchor held that afternoon. Uncured epoxy creeps under load for hours before it lets go, which is why the failure is at three in the morning with nobody under it — or at three in the afternoon with somebody.",
      wrongNote: "It is the radio. Stop the helper before the trapeze goes on the rods — the anchor's card is the answer, and they have not read it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMDH_ACCENT);

    // The slab, textured concrete, with the debris the last trade left.
    const slab = box(g, 6.6, 0.06, 6.4, 0, 0.03, -0.3, 0x6a6a66, { rough: 0.95, cast: false });
    slab.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#5a5852", base2: "#4e4c46", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }),
      { rough: 0.95, metal: 0.05 });
    const debris = group(g, 1.4, 0.06, -0.6);
    for (let i = 0; i < 6; i++) box(debris, 0.2 + (i % 3) * 0.1, 0.03, 0.12, (i % 3) * 0.25 - 0.25, 0.015, Math.floor(i / 3) * 0.2 - 0.1, [0x8b6a42, 0x9aa3a8, 0x5a5a5a][i % 3], { rough: 0.9 });
    holoTag(debris, "debris on the slab", 0, 0.3, 0, { css: "#d2312b", w: 0.32 });

    // ------------------------------------------------- the ceiling and run
    // Slab soffit at 3.2 m, hanger rods down from it, the duct run going up.
    box(g, 6.6, 0.1, 6.4, 0, 3.25, -0.3, 0x5a5852, { rough: 0.95, cast: false });
    const run = group(g, 0, 0, -1.4);
    // The section already hung, further along the run.
    const hung = group(run, -1.6, 2.5, 0);
    box(hung, 1.2, 0.5, 0.004, 0, 0, 0.3, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(hung, 1.2, 0.5, 0.004, 0, 0, -0.3, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(hung, 1.2, 0.004, 0.6, 0, 0.25, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(hung, 1.2, 0.004, 0.6, 0, -0.25, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    // Rods for the hung section, with the missing lock nut and the short strut as finds.
    for (const [sx, sz] of [[-0.5, -0.36], [-0.5, 0.36], [0.5, 0.36]]) cyl(run, 0.008, 0.008, 0.72, -1.6 + sx, 3.0 - 0.14, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    const shortRod = cyl(run, 0.008, 0.008, 0.72, -1.1, 3.0 - 0.14, -0.36, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    const hungStrut1 = box(run, 0.08, 0.04, 0.8, -2.1, 2.2, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    const shortStrut = box(run, 0.08, 0.04, 0.6, -1.1, 2.2, 0.06, 0x7c868f, { rough: 0.5, metal: 0.6 });
    reg(hits, shortStrut, "strut-short");
    for (const [sx, sz] of [[-2.1, -0.36], [-2.1, 0.36], [-1.1, 0.36]]) { cyl(run, 0.016, 0.016, 0.014, sx, 2.17, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 }); cyl(run, 0.016, 0.016, 0.014, sx, 2.15, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 }); }
    const singleNut = cyl(run, 0.016, 0.016, 0.014, -2.1, 2.17, 0.36, 0xd2312b, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, singleNut, "missing-locknut");
    holoTag(run, "hung section — check the rods", -1.6, 2.95, 0.5, { css: "#8fc47a", w: 0.5 });
    // The new bay: two rods off two anchors, one of them still tagged wet.
    const rods = group(run, 0.2, 0, 0);
    for (const sz of [-0.36, 0.36]) cyl(rods, 0.008, 0.008, 0.9, 0, 2.75, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    const rodPair = box(rods, 0.2, 0.06, 0.8, 0, 2.3, 0, 0xffffff, { rough: 0.5 });
    rodPair.visible = false; hits["rod-pair"] = rodPair;
    holoTag(rods, "hanger rods — bay 4", 0, 3.05, 0.5, { css: "#8fc47a", w: 0.36 });
    // The anchor set for the NEXT bay, still curing, tagged.
    const wetAnchor = group(run, 1.5, 3.1, -0.36);
    cyl(wetAnchor, 0.008, 0.008, 0.3, 0, -0.15, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    const wetTag = decal(wetAnchor, 0.16, 0.08, 0.02, -0.3, 0.02, signFace("WET — DO NOT LOAD", { bg: "#f2ae14", accent: "#22262b", fg: "#22262b", scale: 0.45 }));
    reg(hits, wetAnchor, "wet-anchor");
    const cureCard = decal(run, 0.2, 0.12, 1.5, 2.65, 0.4, paperFace("ANCHOR CARD", ["Set: 07:40 · 12 °C", "Cartridge cure: 4 h", "Load after: 11:40", "Bay 5 — 2 rods"], { bg: "#f4efe4", band: "#8fc47a" }), { px: 192 });
    reg(hits, cureCard, "cure-card");
    holoTag(run, "cure card — bay 5", 1.5, 2.85, 0.5, { css: "#f2ae14", w: 0.32 });
    const earlySection = group(run, 1.5, 2.3, 0);
    box(earlySection, 0.8, 0.5, 0.5, 0, 0, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    earlySection.visible = false;
    // The sprinkler main's route, marked on the soffit, that the brace line crosses.
    const sprinkler = pipeRun(run, [[-3.0, 3.0, 0.9], [3.0, 3.0, 0.9]], 0.05, 0xd2312b, { seg: 10 });
    reg(hits, sprinkler, "sprinkler-clash");
    holoTag(run, "sprinkler main — this afternoon", 0.6, 2.8, 0.95, { css: "#d2312b", w: 0.5 });
    // Braces: the transverse and longitudinal struts, angled, and the inclinometer on the transverse.
    const transverse = group(run, -1.6, 2.6, 0.3);
    const tBrace = box(transverse, 0.04, 0.9, 0.04, 0, 0.3, 0.3, 0x7c868f, { rough: 0.5, metal: 0.6 });
    tBrace.rotation.x = 0.7;
    reg(hits, transverse, "transverse-brace");
    const longitudinal = group(run, -1.0, 2.6, -0.3);
    const lBrace = box(longitudinal, 0.04, 0.9, 0.04, 0.3, 0.3, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    lBrace.rotation.z = -0.7;
    reg(hits, longitudinal, "longitudinal-brace");
    holoTag(run, "seismic braces", -1.3, 3.1, -0.6, { css: "#8fc47a", w: 0.28 });
    const incl = instrument(transverse, 0.1, 0.45, 0.45, { ry: 0, idle: "--°", color: 0x8fc47a, w: 0.1, d: 0.14 });
    reg(hits, incl, "brace-angle");
    // Hanger spacing find: the gap between the hung section's trapeze and bay 4.
    const spacingGap = box(run, 1.0, 0.03, 0.03, -0.5, 2.9, 0.5, 0xd2312b, { rough: 0.5, opacity: 0.35, transparent: true, cast: false });
    reg(hits, spacingGap, "hanger-spacing-gap");

    // -------------------------------------------------- the scissor lift
    const lift = group(g, -0.1, 0.06, -1.0);
    const chassis = group(lift, 0, 0, 0);
    box(chassis, 1.4, 0.35, 0.9, 0, 0.3, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) {
      const w = cyl(chassis, 0.14, 0.14, 0.12, sx, 0.14, sz, 0x1b1e22, { rough: 0.8, seg: 14 });
      w.rotation.x = Math.PI / 2;
    }
    const tires = box(chassis, 1.3, 0.02, 0.9, 0, 0.14, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tires, "lift-tires");
    // Scissor arms and the platform at 1.2 m — low enough that the learner's
    // reach still meets the rods at 2.3 m from the platform deck.
    for (let i = 0; i < 3; i++) {
      const a = box(chassis, 1.2, 0.04, 0.04, 0, 0.6 + i * 0.22, -0.3, 0x8a8f94, { rough: 0.5, metal: 0.6 });
      a.rotation.z = (i % 2 ? -1 : 1) * 0.35;
      const b = box(chassis, 1.2, 0.04, 0.04, 0, 0.6 + i * 0.22, 0.3, 0x8a8f94, { rough: 0.5, metal: 0.6 });
      b.rotation.z = (i % 2 ? 1 : -1) * 0.35;
    }
    const platform = group(chassis, 0, 1.25, 0);
    box(platform, 1.6, 0.06, 1.0, 0, 0, 0, 0x3a4048, { rough: 0.7, metal: 0.4 });
    const rails = group(platform, 0, 0, 0);
    for (const sx of [-0.78, 0.78]) for (const y of [0.5, 1.0]) box(rails, 0.03, 0.03, 1.0, sx, y, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    for (const y of [0.5, 1.0]) box(rails, 1.6, 0.03, 0.03, 0, y, -0.49, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    for (const [sx, sz] of [[-0.78, -0.49], [0.78, -0.49], [-0.78, 0.49], [0.78, 0.49]]) box(rails, 0.03, 1.05, 0.03, sx, 0.52, sz, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    reg(hits, rails, "lift-rails");
    const midrail = box(rails, 1.6, 0.04, 0.04, 0, 0.5, 0.49, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    reg(hits, midrail, "midrail-stand");
    box(rails, 0.9, 0.03, 0.03, -0.35, 1.0, 0.49, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    const gate = group(rails, 0.1, 0, 0.49);
    box(gate, 0.7, 0.03, 0.03, 0.35, 1.0, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    box(gate, 0.03, 0.5, 0.03, 0.7, 0.75, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    gate.rotation.y = -1.2;                                                            // swung open
    reg(hits, gate, "lift-gate-open");
    holoTag(platform, "gate — open", 0.7, 1.2, 0.6, { css: "#d2312b", w: 0.26 });
    const ctrl = group(platform, 0.6, 1.02, -0.4);
    box(ctrl, 0.3, 0.12, 0.2, 0, 0, 0, 0x22262b, { rough: 0.6 });
    cyl(ctrl, 0.03, 0.03, 0.06, -0.08, 0.08, 0, 0x2b2f34, { rough: 0.5, seg: 10 });
    ball(ctrl, 0.025, -0.08, 0.12, 0, 0x22262b, { rough: 0.5 });
    reg(hits, ctrl, "lift-controls");
    const liftStop = cyl(ctrl, 0.035, 0.035, 0.03, 0.08, 0.07, 0, 0xd2312b, { rough: 0.4, seg: 14 });
    reg(hits, liftStop, "lift-stop");
    holoTag(platform, "platform controls · stop", 0.6, 1.35, -0.4, { css: "#8fc47a", w: 0.42 });
    const tiltBeacon = cyl(platform, 0.04, 0.04, 0.08, -0.7, 1.1, -0.45, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.0, seg: 12 });
    tiltBeacon.visible = false;
    // On the deck: the trapeze (dragged), the nut driver (turn), the laser level (track), the sealant, the radio.
    const trapeze = group(platform, -0.4, 0.06, 0.1);
    box(trapeze, 0.08, 0.04, 0.8, 0, 0, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    for (const sz of [-0.36, 0.36]) cyl(trapeze, 0.016, 0.016, 0.014, 0, -0.03, sz, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, trapeze, "trapeze-hanger");
    holoTag(platform, "trapeze hanger", -0.4, 0.3, 0.1, { css: "#8fc47a", w: 0.3 });
    const nutDriver = group(platform, 0.2, 0.1, 0.3);
    cyl(nutDriver, 0.03, 0.03, 0.2, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(nutDriver, 0.012, 0.012, 0.12, 0.15, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    reg(hits, nutDriver, "hanger-nut");
    holoTag(platform, "nut driver", 0.2, 0.3, 0.3, { css: "#8fc47a", w: 0.24 });
    const laser = instrument(platform, -0.55, 0.1, -0.3, { ry: 0.3, idle: "LEVEL", color: 0x8fc47a, w: 0.1, d: 0.14 });
    reg(hits, laser, "level-adjust");
    holoTag(platform, "laser level", -0.55, 0.3, -0.3, { css: "#8fc47a", w: 0.24 });
    const sealant = group(platform, 0.5, 0.1, 0.3, 0.4);
    cyl(sealant, 0.025, 0.025, 0.22, 0, 0, 0, 0x2f6f8c, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(sealant, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, sealant, "joint-sealant");
    holoTag(platform, "listed duct sealant", 0.5, 0.3, 0.3, { css: "#8fc47a", w: 0.34 });
    const radio = group(platform, 0.72, 0.9, -0.2);
    box(radio, 0.06, 0.12, 0.04, 0, 0, 0, 0x22262b, { rough: 0.6 });
    cyl(radio, 0.006, 0.006, 0.1, 0.015, 0.1, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    ball(radio, 0.008, -0.015, 0.03, 0.022, 0x59c97b, { emissive: 0x59c97b, ei: 1.5 });
    reg(hits, radio, "crew-radio");
    holoTag(platform, "crew radio", 0.72, 1.1, -0.2, { css: "#8fc47a", w: 0.22 });

    // ------------------------------------------------------ the duct jack
    const jack = group(g, -1.3, 0.06, 0.9, 0.2);
    box(jack, 0.8, 0.1, 0.8, 0, 0.05, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) cyl(jack, 0.05, 0.05, 0.03, sx, 0.03, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    const mast = cyl(jack, 0.04, 0.04, 1.6, 0, 0.9, 0, 0x8a8f94, { rough: 0.5, metal: 0.6, seg: 12 });
    const cradle = group(jack, 0, 1.4, 0);
    box(cradle, 1.0, 0.04, 0.6, 0, 0, 0, 0x3a4048, { rough: 0.6, metal: 0.4 });
    const section = group(cradle, 0, 0.27, 0);
    box(section, 0.9, 0.5, 0.004, 0, 0, 0.3, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.9, 0.5, 0.004, 0, 0, -0.3, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.9, 0.004, 0.6, 0, 0.25, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.9, 0.004, 0.6, 0, -0.25, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.02, 0.52, 0.62, 0.45, 0, 0, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    for (const sz of [-0.2, 0.2]) box(cradle, 1.0, 0.02, 0.04, 0, 0.3, sz, 0xf2c14b, { rough: 0.7 });
    const sharpEnd = box(section, 0.03, 0.52, 0.62, -0.45, 0, 0, 0xd2312b, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    reg(hits, sharpEnd, "sharp-duct-end");
    holoTag(jack, "field-cut end — gloves", -0.45, 2.0, 0, { css: "#d2312b", w: 0.36 });
    const crank = group(jack, 0.2, 0.9, 0.3);
    cyl(crank, 0.02, 0.02, 0.06, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    const crankArm = box(crank, 0.02, 0.16, 0.02, 0, 0.08, 0.04, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    ball(crank, 0.025, 0, 0.16, 0.06, 0xb8402f, { rough: 0.5 });
    reg(hits, crank, "duct-lift-crank");
    holoTag(jack, "duct jack crank", 0.2, 1.15, 0.3, { css: "#8fc47a", w: 0.3 });

    // ----------------------------------------------------- board, drawing, log
    const board = group(g, -2.8, 0.06, 1.9, 0.9);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("SITE BOARD — LEVEL 2", ["Ceiling crew: apprentice (you) + helper", "Ground: helper — bay 4/5", "Electricians: corridor east", "Sprinkler main: 1300 — corridor", "Lift 7: inspected? ____"], { bg: "#eef1f3", band: "#8fc47a" }), { px: 384 });
    reg(hits, boardFace, "site-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoPanel(g, 0.72, 0.5, 2.4, 1.7, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "#0c160c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fc47a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f5df";
      ctx.fillText("HANGER SCHEDULE · SEISMIC — SA-3", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Duct 600 x 500: trapeze, 3/8 in. rod", "Spacing: max 2.4 m", "Anchor: adhesive, cure per cartridge", "Transverse brace: every 9 m, 45° ± 10°", "Longitudinal brace: every 18 m"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMDH_ACCENT, ry: -1.0 });
    const drawingHit = box(g, 0.72, 0.5, 0.04, 2.4, 1.7, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    drawingHit.rotation.y = -1.0;
    reg(hits, drawingHit, "hanger-drawing");
    const logBoard = group(g, 2.85, 0.06, 0.3, -1.2);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("HANG LOG — SA-3", ["Bay 4: ____", "Anchors/cure: ____", "Braces/angle: ____", "Faults: ____", "Signed: ____"], { bg: "#f4efe4", band: "#8fc47a" }), { px: 256 });
    reg(hits, logFace, "hang-log");
    holoTag(logBoard, "hang log", 0, 1.5, 0, { css: "#8fc47a", w: 0.22 });

    // ------------------------------------------------------------ the crew
    const helper = standingFigure(g, 1.9, -2.3, { ry: -0.6, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b, gloves: true });
    const lead = standingFigure(g, -2.0, 2.6, { ry: 2.7, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0x8fc47a, vest: 0xf2c14b, gloves: true });

    // --------------------------------------------------------- site dressing
    for (const sx of [-2.2, 0.0, 2.2]) {
      cyl(g, 0.02, 0.02, 0.5, sx, 2.95, 1.8, 0x1b1e22, { rough: 0.6, seg: 6, cast: false });
      box(g, 1.0, 0.08, 0.14, sx, 2.7, 1.8, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.0, rough: 0.5, cast: false });
    }
    pipeRun(g, [[-3.3, 2.9, -2.6], [3.3, 2.9, -2.6]], 0.03, 0x8a8f94, { seg: 8 });
    pipeRun(g, [[-3.3, 2.75, -2.4], [3.3, 2.75, -2.4]], 0.02, 0xd47a2a, { seg: 8 });
    const conduitTray = group(g, 0, 0.06, 2.6);
    for (let i = 0; i < 6; i++) box(conduitTray, 0.5, 0.05, 0.2, -1.5 + i * 0.6, 2.9, 0, 0x3a4550, { rough: 0.55, metal: 0.5, cast: false });
    for (const [x, z] of [[-1.2, -2.6], [2.6, -1.2], [-2.6, -0.4]]) cone(g, x, z);
    const anchorKit = group(g, 2.6, 0.06, -2.7, -0.4);
    box(anchorKit, 0.5, 0.3, 0.35, 0, 0.15, 0, 0xd2312b, { rough: 0.6 });
    for (let i = 0; i < 3; i++) cyl(anchorKit, 0.03, 0.03, 0.22, -0.15 + i * 0.15, 0.4, 0, 0xe8e2d0, { rough: 0.6, seg: 10 });
    holoTag(anchorKit, "epoxy cartridges · drill", 0, 0.6, 0, { css: "#8fc47a", w: 0.4 });
    const strutRack = group(g, -2.6, 0.06, -1.8, 0.6);
    for (const sx of [-0.4, 0.4]) box(strutRack, 0.06, 0.6, 0.06, sx, 0.3, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) box(strutRack, 1.6, 0.04, 0.04, 0, 0.62 + i * 0.045, -0.1 + i * 0.06, 0x7c868f, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 3; i++) cyl(strutRack, 0.008, 0.008, 1.6, 0, 0.5, 0.2 + i * 0.04, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(strutRack, "strut · rod stock", 0, 0.95, 0, { css: "#8fc47a", w: 0.3 });
    const wallStud = group(g, 0, 0.06, -3.3);
    for (let i = 0; i < 9; i++) box(wallStud, 0.05, 3.1, 0.1, -3.2 + i * 0.8, 1.55, 0, 0x9aa3a8, { rough: 0.5, metal: 0.6, cast: false });
    box(wallStud, 6.6, 0.1, 0.1, 0, 0.05, 0, 0x9aa3a8, { rough: 0.5, metal: 0.6, cast: false });
    const signBoard = group(g, 0.8, 0.06, 2.8, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("READ THE\nCURE CARD\nFIRST", { bg: "#0c160c", accent: "#8fc47a", fg: "#e6f5df", scale: 0.28 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    let cranking = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.8, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lift-inspect") { gate.rotation.y = 0; }
        if (step.id === "anchor-cure") { wetTag.visible = false; }
        if (step.id === "hanger-drag") { trapeze.parent.remove(trapeze); rods.add(trapeze); trapeze.position.set(0, 2.3, 0); trapeze.rotation.set(0, 0, 0); }
        if (step.id === "raise") { section.parent.remove(section); rods.add(section); section.position.set(0, 2.58, 0); section.rotation.set(0, 0, 0); cradle.position.y = 1.4; }
        if (step.id === "brace") { tBrace.material = mat(0x8fc47a, { rough: 0.5, metal: 0.5 }); lBrace.material = mat(0x8fc47a, { rough: 0.5, metal: 0.5 }); }
        if (step.id === "bracing-walk") { singleNut.material = mat(0x8a8f94, { rough: 0.4, metal: 0.7 }); shortStrut.scale.set(1, 1, 1.35); }
        if (step.id === "ceiling-walk") { spacingGap.visible = false; lBrace.position.x = 0.1; }
        if (step.id === "hang-log") repaint(logFace, paperFace("HANG LOG — SA-3", ["Bay 4: 1 section, 2 trapezes", "Anchors: bay 4 cured 10:10; bay 5 11:40", "Braces: T + L, 45°", "Lock nut, short strut — fixed", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#8fc47a" }));
      },
      onHazard() {},
      // The platform really tilts; the helper really goes for the wet anchor.
      onInterrupt(it) {
        if (it.id === "tilt-alarm") { chassis.rotation.z = 0.09; tiltBeacon.visible = true; }
        if (it.id === "helper-loads-early") { helper.position.set(1.5, 0, -0.6); helper.rotation.y = 0.2; earlySection.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tilt-alarm") { chassis.rotation.z = 0; tiltBeacon.visible = false; debris.visible = false; }
        if (it.id === "helper-loads-early") { helper.position.set(1.9, 0, -2.3); helper.rotation.y = -0.6; earlySection.visible = false; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        cranking = !!(step?.id === "raise" && session.holding);
        if (cranking) { crankArm.rotation.x += dt * 5; cradle.position.y = Math.min(2.2, cradle.position.y + dt * 0.25); }
        if (tiltBeacon.visible) tiltBeacon.rotation.y += dt * 4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "clearance") {
          tBrace.rotation.x = 0.35 + gg.t * 0.7;
          repaint(incl.userData.screen, signFace(`${Math.round(25 + gg.t * 40)}°`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#e6f5df", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "nut-torque") nutDriver.rotation.x = tn.amount * Math.PI * 2;
        const tr = session?.track;
        if (tr && step?.id === "level") {
          section.rotation.z = (tr.v - 0.52) * 0.12;
          repaint(laser.userData.screen, signFace(`${((tr.v - 0.52) * 40).toFixed(1)} mm`, { bg: "#0d1c24", accent: tr.v >= 0.42 && tr.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#e6f5df", scale: 0.55 }));
        }
      },
    };
  },
};
