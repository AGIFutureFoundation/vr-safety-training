import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace, tileFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Asbestos Glovebag Removal on a Pipe VR — Building Systems &
// Facilities, the third of the Insulators and Boilermakers pack. A short run
// of asbestos pipe insulation removed by the glovebag method while the
// header stays in service: the bag sealed to the pipe, the seal proven, the
// insulation wetted and stripped through the built-in sleeves, the bare
// pipe encapsulated, the bag cinched off as its own sealed waste unit, and
// the area cleared with an air sample before anyone works past the
// barricade tape.
//
// Sited generically: no plant name, no real line number the registry is not
// sure of — clearance numbers and air readings are "per the protocol".

const IBGL_ACCENT = 0xc9e265;
const IBGL_PAL = palette("utility");

export const SIM_IB_ASBESTOS_GLOVEBAG_REMOVAL_ON_A_PIPE = {
  id: "ib-asbestos-glovebag-removal-on-a-pipe",
  index: "354",
  domain: "Facilities",
  trade: "Insulator, asbestos abatement by the glovebag method — Insulators Local 16",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Insulators Local 16 asbestos abatement training; OSHA 29 CFR 1926.1101 asbestos in construction; 29 CFR 1910.134 respiratory protection; 29 CFR 1910.1200 hazard communication for the waste label; 29 CFR 1910.1000 air contaminants and the permissible exposure limits; EPA 40 CFR 61 the asbestos NESHAP governing the sealed waste leaving this pipe; NIOSH criteria for the fibre-counting method behind the clearance sample",
  name: "Asbestos Glovebag Removal on a Pipe",
  title: simTitle("Asbestos Glovebag Removal on a Pipe"),
  tagline: "A short run of pipe insulation stripped inside a sealed glovebag while the header stays in service, closed out on an air sample rather than a look",
  accent: IBGL_ACCENT,
  accentCss: "#c9e265",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "bag-sealed-clean", name: "Bag Sealed Clean", note: "Wetted, stripped and encapsulated inside a proven seal, closed out on a passing air sample" },

  game: system({
    name: "Abatement Certified",
    currency: "ABATE",
    ranks: ["Bag Handler", "Removal Tech", "Lead Abater", "Abatement Foreman", "Abatement Certified"],
    badges: [
      { id: "wet-before-strip", name: "Wet Before Strip", note: "Never reached for the dry scraper inside the bag", test: AWARD.safe },
      { id: "seal-proven", name: "Seal Proven", note: "Held the leak-check reading near band centre", test: AWARD.precise(0.72) },
      { id: "cinch-disciplined", name: "Cinch Disciplined", note: "Closed the bottom pouch in the correct order every time", test: AWARD.stepClean("cinch-bottom") },
    ],
    challenges: [
      { id: "clean-strip", name: "Clean Strip", note: "No corrections from the plan to the sample", test: AWARD.clean },
      { id: "steady-encapsulant", name: "Steady Encapsulant", note: "Held the encapsulant spray through the whole pass", test: AWARD.unbroken },
      { id: "fast-bag", name: "Fast Bag", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dry-strip-inside-bag": "You reached for the dry scraper sitting in the tray instead of wetting the insulation first. A glovebag keeps fibre off the room, not off the person working inside it — strip this material dry and the inside of that bag fills with airborne asbestos exactly at arm's length from your gloves, your sleeves and the seal you are about to break to get out.",
    "torn-glovebag-seam": "That glovebag has a visible tear along one seam and you are about to use it anyway. A torn bag does not hold negative pressure and does not contain what comes off the pipe once you start stripping — a bag this job depends on gets replaced the moment a tear is found, not patched with tape and hoped over.",
    "unlabeled-glovebag-waste": "The sealed glovebag sitting there as waste has no asbestos label on it. Once this bag is cinched off it is regulated asbestos waste like any other, and an unlabeled bag in the corridor is exactly how that waste gets picked up, moved and opened by someone with no idea what is inside it.",
    "live-steam-branch": "That branch valve into the header you are working on is still live, and it sits close enough to brush against while you are reaching around the glovebag. The header stays in service for this repair, which is the entire reason the glovebag method was chosen over a full shutdown — but that only works if the live branch is respected, not brushed past.",
  },

  lateNotes: {
    "sprayer": "The insulation gets wetted inside the bag before anything is stripped — not scraped first and wetted down afterward once fibre is already airborne.",
    "encapsulant-sprayer": "The bare pipe gets encapsulated once the insulation is fully stripped and the surface is clean, not sprayed over material still hanging on it.",
  },

  steps: [
    {
      id: "abatement-plan", kind: "select", target: "glovebag-plan",
      title: "Read the glovebag work plan",
      cue: "Confirm the pipe section, the material class and that the header stays in service during the work.",
      why: "The glovebag method is chosen specifically because the header keeps running through this repair, and the plan is what confirms this particular section, this material class and this length are actually within what a glovebag is rated to handle — a run too long or a fitting too complex for the bag turns a contained job into a torn one.",
    },
    {
      id: "pipe-survey", kind: "find", noHint: true,
      targets: ["damaged-jacketing", "wrong-section-marked", "adjacent-live-branch"],
      itemNames: { "damaged-jacketing": "the damaged jacketing below the target section", "wrong-section-marked": "the section marked on the wrong side of the valve", "adjacent-live-branch": "the live branch beside the target pipe" },
      itemNotes: {
        "damaged-jacketing": "Damaged jacketing just past the marked section means fibre may already be exposed there too — the survey widens to that spot before the bag goes up, rather than discovering it once the bag is already sealed to the wrong boundary.",
        "wrong-section-marked": "The tape marking the removal section is on the wrong side of the isolation valve. Bagging the marked spot as taped would leave the actual target section untouched and put the glovebag over pipe that was never scoped for this job.",
        "adjacent-live-branch": "A live branch valve sits close enough to the target section to be brushed while working the bag. It gets flagged and given clearance before anyone's arm goes near it, not discovered by touch mid-strip.",
      },
      title: "Survey the pipe before bagging it",
      cue: "Three things about this pipe are not right yet. Find them before the glovebag goes up.",
      why: "A glovebag sealed to the wrong boundary, over damaged jacketing it never accounted for, or next to a live branch nobody flagged, is a contained job that was never actually scoped correctly — and all three of those are far easier to see now than after the bag is taped shut and full of stripped material.",
    },
    {
      id: "ppe-don", kind: "sequence",
      targets: ["coveralls", "respirator", "gloves-taped"],
      itemNames: { coveralls: "coveralls", respirator: "respirator", "gloves-taped": "taped gloves" },
      title: "Don PPE in order",
      cue: "Coveralls first, then the respirator, then tape the gloves at the wrist.",
      why: "The respirator seals against skin, so it goes on after the coveralls' hood is in place but before the gloves are taped — taping the gloves last is what keeps a sleeve from working loose while both hands are inside the bag's built-in sleeves for the next twenty minutes.",
      outOfOrderNote: "Wrong order — coveralls first, respirator seated against the hood, gloves taped last.",
    },
    {
      id: "attach-glovebag", kind: "select", target: "glovebag-target",
      title: "Attach and seal the glovebag",
      cue: "Fit the glovebag around the pipe section and tape every seam to the pipe.",
      why: "Every seam taped to the pipe itself, not just to the insulation jacketing around it, is what turns a bag hanging on a pipe into an actual containment. A seam taped to jacketing that later shifts under the work is a seam that was never really sealed at all.",
    },
    {
      id: "leak-check", kind: "gauge", target: "leak-check-bulb",
      title: "Prove the bag's seal",
      cue: "Work the hand pump and commit once the bag holds the reading inside the sealed range.",
      why: "A glovebag that looks taped shut and a glovebag that actually holds a seal are not the same thing, and the only way to tell them apart before fibre is airborne inside it is to pressure it with the hand pump and watch whether it holds. A bag that will not hold a reading now will not hold anything once the stripping starts.",
      gauge: {
        label: "GLOVEBAG SEAL", speed: 0.6, green: [0.55, 0.85],
        readout: (t) => `${Math.round(t * 100)}% HOLDING`,
        missNote: "Not holding. Recheck every taped seam before a single tool goes into the sleeves.",
      },
    },
    {
      id: "wet-strip", kind: "hold", target: "sprayer", seconds: 5,
      title: "Wet the insulation inside the bag",
      cue: "Work the sprayer through the glove sleeves and hold it on the material until fully saturated.",
      why: "Wetting is what keeps this a contained job instead of a fibre release inside a sealed bag around your own hands — amended water carries a surfactant that soaks through the material rather than beading on the surface, and it only works if it is held on long enough to actually penetrate before the first strip.",
      holdBreakNote: "Let go before the material was fully soaked. Insulation that dries out mid-strip aerosolises inside the bag exactly where your hands are.",
    },
    {
      id: "collect-debris", kind: "drag", target: "debris-pile",
      title: "Move the stripped material to the bottom pouch",
      cue: "Push the wetted, stripped debris down through the sleeves into the bag's bottom pouch.",
      why: "Everything stripped goes down into the pouch as it comes off the pipe rather than piling up around the pipe inside the bag, because a bag crowded with loose debris is a bag more likely to snag or tear the next time a hand reaches through the sleeves.",
      drag: { to: "bottom-pouch", radius: 0.45, missNote: "Not down in the pouch yet. Debris left loose in the bag is debris in the way of the next reach through the sleeves." },
    },
    {
      id: "cinch-bottom", kind: "sequence",
      targets: ["pouch-cinch", "pouch-twist", "pouch-tape"],
      itemNames: { "pouch-cinch": "pouch cinched shut", "pouch-twist": "twisted closed", "pouch-tape": "taped off" },
      title: "Close off the bottom pouch",
      cue: "Cinch the built-in strap on the bottom pouch, twist it closed, then tape it off.",
      why: "The cinch strap draws the pouch tight before the twist locks that shape in, and the tape goes on last because a twist without tape works itself loose the moment the pouch is handled again — three steps that together separate the stripped material from the rest of the bag as its own sealed unit.",
      outOfOrderNote: "Wrong order — cinch the strap first, twist it closed, then tape it off.",
    },
    {
      id: "spray-encapsulant", kind: "track", target: "encapsulant-sprayer", seconds: 6,
      title: "Encapsulate the bare pipe",
      cue: "Hold the encapsulant sprayer steady across the now-bare pipe inside the bag.",
      why: "A lockdown encapsulant sealed over the bare pipe is what keeps any fibre that settled during the strip from becoming airborne again the moment the bag comes down — an even pass matters because a thin spot is a spot that was never actually locked down.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "ENCAPSULANT COVERAGE",
        readout: (v) => (v < 0.36 ? "thin — not locked down" : v > 0.6 ? "pooling — running off the pipe" : "even coat"),
      },
      holdBreakNote: "Coverage slipped out of band. An uneven coat leaves exactly the thin spot this whole step exists to prevent.",
    },
    {
      id: "cut-and-remove-bag", kind: "select", target: "glovebag-target",
      title: "Cut the bag free and bag it as waste",
      cue: "Cut the glovebag free from the pipe above the sealed pouch and remove the whole bag as sealed waste.",
      why: "The cut happens above the pouch that is already sealed, so the waste leaving this pipe is one continuously sealed unit from the moment the material left the pipe to the moment it leaves the building — not a bag reopened partway through to make the cut easier.",
    },
    {
      id: "clearance-air-sample", kind: "gauge", target: "air-sample-pump",
      title: "Run the clearance air sample",
      cue: "Start the personal air sampling pump and commit once the reading clears the protocol's level.",
      why: "The area does not get called clean because the pipe looks bare and the bag is gone — it gets called clean because a sample proves the fibre count in the air is below the level the protocol sets, measured rather than assumed from how tidy the work looks.",
      gauge: {
        label: "CLEARANCE AIR SAMPLE", speed: 0.55, green: [0.0, 0.22],
        readout: (t) => `${(t * 0.09).toFixed(3)} f/cc`,
        missNote: "Above the clearance level. The barricade stays up and the area stays restricted until a retest clears it.",
      },
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["dropped-debris", "wet-spot-missed", "loose-tool"],
      itemNames: { "dropped-debris": "the dropped scrap of insulation", "wet-spot-missed": "the wet spot on the floor", "loose-tool": "the tool left on the pipe rack" },
      itemNotes: {
        "dropped-debris": "A scrap of insulation on the floor outside the bag is material that never made it into the sealed pouch — it gets picked up and bagged as waste before anyone assumes the area is clear of it.",
        "wet-spot-missed": "A wet spot on the floor below the work is amended water that carried debris with it on the way down — it gets wiped and that wipe goes into the waste bag too, not left to dry and lift as dust later.",
        "loose-tool": "A tool left on the pipe rack after the bag comes down either goes back to the cart clean or gets decontaminated before it does — a tool assumed clean because the job looks finished is how contamination leaves with the next task.",
      },
      title: "Walk the area before pulling the barricade",
      cue: "Three things about this area are not right yet. Find them before calling it clear.",
      why: "The air sample proves the atmosphere is clear; the walk-down is what proves the area is too — the dropped scrap, the wet spot and the loose tool are the three things a clean-looking pipe does not tell you on its own.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibgl-crew-checkin",
      title: "Check in with the abatement foreman",
      cue: "Report the wrong-side marking, the live branch found close by, and how the bag held up.",
      why: "The wrong-side marking needs correcting on the drawing before the next section is scoped from it, and the live branch needs its own clearance note for whoever works this rack next. The check-in is also where a bag that felt marginal under pressure gets flagged before it is issued to the next crew.",
    },
    {
      id: "closing-log", kind: "select", target: "ibgl-closing-log",
      title: "Sign the abatement closeout log",
      cue: "Record the material quantity, the waste manifest number and the clearance sample result, then sign.",
      why: "The closeout log ties the waste manifest to the clearance sample and the section actually worked, so months from now the paperwork can answer exactly what came off this pipe, where it went, and what reading cleared the area — rather than relying on anyone's memory of the shift.",
    },
  ],

  interrupts: [
    {
      id: "bag-deflate",
      kind: "Seal failing",
      after: "wet-strip", delay: 4, seconds: 12,
      alert: "The glovebag has sagged and is visibly losing its shape — a taped seam has started to lift.",
      cue: "Reseal the lifted seam before any more material comes off the pipe.",
      target: "reseal-tape",
      why: "A bag that is losing its taped seal mid-strip is a containment that is failing in real time, not a cosmetic problem to fix at the end — reaching for more tape on the lifted seam now is what keeps everything stripped so far from finding its way past a seal that no longer holds.",
      missNote: "The strip continued while the seam kept lifting. A glovebag sagging open around a hand still working inside it is a containment failing exactly where the fibre is.",
      wrongNote: "It is the lifted seam. Nothing about this bag holds until that tape goes back on.",
    },
    {
      id: "hvac-restart-call",
      kind: "Air handler restarting",
      after: "spray-encapsulant", delay: 4, seconds: 12,
      alert: "A radio call says the building's air handler serving this space is about to restart — its isolation needs reconfirming before that happens.",
      cue: "Confirm the HVAC damper is still tagged before the air handler comes back on.",
      target: "hvac-damper-tag",
      why: "This space's air handler was isolated for the job precisely so nothing inside gets recirculated into the rest of the building, and a restart call is the moment that isolation either holds or gets reversed by someone who does not know a glovebag is still open here. The damper tag gets checked before the fan does, not after.",
      missNote: "The air handler restart went unconfirmed while the bag was still open. An isolation nobody rechecked at the exact moment it mattered is an isolation that was only ever theoretical.",
      wrongNote: "That is not it. The damper tag is what actually keeps this space isolated from the rest of the building's air.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Insulators Local 16 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, IBGL_ACCENT);

    // ------------------------------------------------------------- floor and mechanical room backdrop
    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "smooth", tone: "#6a6c68", tone2: "#5d5f5b",
    }), { repeat: 6 });
    const floor = box(g, 6.2, 0.1, 5.8, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9 });

    const wallTex = surfaceTexture((cx, w, h) => tileFace(cx, w, h, {
      tile: IBGL_PAL.structure, grout: "#4a504c",
    }), { repeat: 4 });
    const backWall = box(g, 5.4, 2.6, 0.12, 0, 1.3, -2.8, 0xffffff, { rough: 0.7 });
    backWall.material = texturedMat(wallTex, { rough: 0.7 });

    // ------------------------------------------------------------- header pipe run
    const rack = group(g, 0, 0, -1.5);
    for (const sx of [-1.6, 1.6]) cyl(rack, 0.04, 0.04, 1.55, sx, 0.775, 0, CITY.darkSteel, { rough: 0.6, metal: 0.6, seg: 10 });
    const header = cyl(rack, 0.11, 0.11, 3.3, -1.6, 1.55, 0, 0xd8cba0, { rough: 0.85, seg: 18 });
    header.rotation.z = Math.PI / 2;
    holoTag(rack, "Header — stays in service", 0, 1.95, 0, { css: "#c9e265", w: 0.56 });

    // The isolation-valve marking for the target section, and the live branch beside it.
    const isolValve = valveWheel(rack, 1.0, 1.55, 0, { r: 0.08, color: 0xf2c14b, body: IBGL_PAL.structure, ry: 1.57 });
    holoTag(isolValve, "Isolation valve — target section", 0, 0.24, 0, { css: "#c9e265", w: 0.52 });
    const liveBranch = valveWheel(rack, 0.6, 1.55, 0.25, { r: 0.06, color: 0xd8232a, body: IBGL_PAL.structure });
    holoTag(liveBranch, "Live branch", 0, 0.2, 0, { css: "#f0645b", w: 0.32 });
    reg2(liveBranch, "live-steam-branch");
    reg2(liveBranch, "adjacent-live-branch");

    const wrongMark = group(rack, -0.9, 1.55, 0);
    box(wrongMark, 0.3, 0.02, 0.02, 0, 0.14, 0, 0xd8232a, { cast: false });
    holoTag(wrongMark, "Marked on the wrong side", 0, 0.24, 0, { css: "#f0645b", w: 0.5 });
    reg2(wrongMark, "wrong-section-marked");

    const damagedJacket = cyl(rack, 0.13, 0.13, 0.3, -0.3, 1.55, 0, 0xa89268, { rough: 0.9, seg: 16 });
    holoTag(damagedJacket, "Damaged jacketing", 0, 0.2, 0, { css: "#f0645b", w: 0.44 });
    reg2(damagedJacket, "damaged-jacketing");

    // The glovebag itself, around the target section.
    const bagGroup = group(rack, 0.3, 1.55, 0);
    const bagBody = box(bagGroup, 0.7, 0.6, 0.5, 0, -0.05, 0, 0xe7edb8, { rough: 0.25, opacity: 0.4, transparent: true, cast: false });
    holoTag(bagGroup, "Glovebag", 0, 0.42, 0, { css: "#c9e265", w: 0.3 });
    reg2(bagBody, "glovebag-target");
    const pouch = group(bagGroup, 0, -0.42, 0);
    box(pouch, 0.3, 0.25, 0.25, 0, 0, 0, 0xdfe6a8, { rough: 0.3, opacity: 0.55, transparent: true, cast: false });
    hits["bottom-pouch"] = pouch;
    const pouchCinch = torus(pouch, 0.14, 0.012, 0, 0.1, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
    reg2(pouchCinch, "pouch-cinch");
    const pouchTwist = box(pouch, 0.03, 0.08, 0.03, 0, -0.02, 0, 0xd8cba0, { rough: 0.6 });
    reg2(pouchTwist, "pouch-twist");
    const pouchTape = box(pouch, 0.16, 0.02, 0.16, 0, -0.09, 0, 0xf2c14b, { rough: 0.5 });
    reg2(pouchTape, "pouch-tape");
    const debrisPile = ball(bagGroup, 0.08, 0.1, 0, 0.08, 0xa89268, { rough: 0.9 });
    reg2(debrisPile, "debris-pile");
    const seamLift = box(bagGroup, 0.24, 0.02, 0.02, 0.3, 0.28, 0.25, 0xffe37a, { emissive: 0xffe37a, ei: 0.6, cast: false });
    holoTag(seamLift, "Lifted seam", 0, 0.1, 0, { css: "#f0645b", w: 0.32 });
    reg2(seamLift, "reseal-tape");
    seamLift.visible = false;

    const leakBulb = group(g, -1.3, 0, -0.6, 0.3);
    ball(leakBulb, 0.07, 0, 0.5, 0, 0x2b6f4f, { rough: 0.6 });
    cyl(leakBulb, 0.012, 0.012, 0.3, 0, 0.5, 0.08, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.z = Math.PI / 2.2;
    holoTag(leakBulb, "Leak-check bulb", 0, 0.62, 0, { css: "#c9e265", w: 0.34 });
    reg2(leakBulb, "leak-check-bulb");

    const sprayer = group(g, -1.3, 0, -1.1, 0.2);
    cyl(sprayer, 0.07, 0.08, 0.3, 0, 0.2, 0, 0x59c97b, { rough: 0.5, metal: 0.2, seg: 14 });
    holoTag(sprayer, "Amended water sprayer", 0, 0.4, 0, { css: "#c9e265", w: 0.42 });
    reg2(sprayer, "sprayer");

    const encapsulantSprayer = group(g, -1.0, 0, -1.4, -0.3);
    cyl(encapsulantSprayer, 0.06, 0.07, 0.28, 0, 0.2, 0, 0x2f6f4a, { rough: 0.5, metal: 0.2, seg: 14 });
    holoTag(encapsulantSprayer, "Encapsulant sprayer", 0, 0.38, 0, { css: "#c9e265", w: 0.4 });
    reg2(encapsulantSprayer, "encapsulant-sprayer");

    // ------------------------------------------------------------- dry scraper hazard + torn bag + waste
    const dryScraper = group(g, 1.6, 0, -0.6, -0.3);
    box(dryScraper, 0.02, 0.02, 0.3, 0, 0.4, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    box(dryScraper, 0.08, 0.04, 0.01, 0, 0.4, 0.15, 0xc0c6cc, { rough: 0.35, metal: 0.7 });
    holoTag(dryScraper, "Dry scraper", 0, 0.5, 0, { css: "#f0645b", w: 0.3 });
    reg2(dryScraper, "dry-strip-inside-bag");

    const tornBag = group(g, 1.9, 0, -1.1, 0.3);
    box(tornBag, 0.4, 0.35, 0.02, 0, 0.4, 0, 0xe7edb8, { rough: 0.3, opacity: 0.4, transparent: true, cast: false });
    box(tornBag, 0.02, 0.15, 0.02, 0.18, 0.35, 0.01, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tornBag, "Torn glovebag — spare?", 0, 0.62, 0, { css: "#f0645b", w: 0.5 });
    reg2(tornBag, "torn-glovebag-seam");

    const wasteBag = group(g, 1.7, 0, 1.3);
    box(wasteBag, 0.3, 0.26, 0.26, 0, 0.13, 0, 0x7a7a7a, { rough: 0.7 });
    holoTag(wasteBag, "Unlabeled waste bag", 0, 0.32, 0, { css: "#f0645b", w: 0.5 });
    reg2(wasteBag, "unlabeled-glovebag-waste");

    // ------------------------------------------------------------------ PPE + bench
    const ppeRack = group(g, -2.1, 0, 1.2, 0.5);
    slab(ppeRack, 0.1, 1.5, 0.5, 0, 0.75, 0, 0x4a525a, { radius: 0.02, rough: 0.6, metal: 0.4 });
    const coverallsHook = box(ppeRack, 0.16, 0.5, 0.05, 0.08, 0.65, 0.15, 0xdfe6a8, { rough: 0.85 });
    holoTag(coverallsHook, "Coveralls", 0, 0.28, 0, { css: "#c9e265", w: 0.3 });
    reg2(coverallsHook, "coveralls");
    const respMask = box(ppeRack, 0.12, 0.08, 0.06, 0.08, 1.05, 0.15, 0x2b3138, { rough: 0.5, metal: 0.2 });
    holoTag(respMask, "Respirator", 0, 0.12, 0, { css: "#c9e265", w: 0.3 });
    reg2(respMask, "respirator");
    const glovesTaped = box(ppeRack, 0.1, 0.05, 0.1, 0.08, 1.25, 0.15, 0xf2c14b, { rough: 0.6 });
    holoTag(glovesTaped, "Taped gloves", 0, 0.1, 0, { css: "#c9e265", w: 0.32 });
    reg2(glovesTaped, "gloves-taped");

    const bench = group(g, -2.0, 0, -0.2, 0.4);
    slab(bench, 0.9, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const airPump = instrument(bench, -0.2, 0.75, -0.1, { idle: "-- f/cc", color: IBGL_ACCENT });
    holoTag(airPump, "Clearance air sample pump", 0, 0.16, 0, { css: "#c9e265", w: 0.52 });
    reg2(airPump, "air-sample-pump");

    // ------------------------------------------------------------------- final-walk targets
    const droppedDebris = ball(g, 0.05, 0.5, 0.06, -0.5, 0xa89268, { rough: 0.9 });
    holoTag(g, "Dropped scrap", 0.5, 0.2, -0.5, { css: "#f0645b", w: 0.3 });
    reg2(droppedDebris, "dropped-debris");
    const wetSpot = box(g, 0.3, 0.005, 0.3, 0.7, 0.006, -0.9, 0x2f6f8f, { rough: 0.2, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "Wet spot", 0.7, 0.14, -0.9, { css: "#f0645b", w: 0.3 });
    reg2(wetSpot, "wet-spot-missed");
    const looseTool = box(rack, 0.16, 0.03, 0.03, -0.6, 1.65, 0, 0x3a78c9, { rough: 0.4, metal: 0.3 });
    holoTag(looseTool, "Tool on the rack", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg2(looseTool, "loose-tool");

    // ------------------------------------------------------------------- paperwork + crew
    const plan = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9e265"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c8d19a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("GLOVEBAG PLAN GB-11", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4f8e6";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("HEADER PIPE — CLASS I TSI", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#c8d19a";
      ["Header: stays in service", "Method: wet, strip, encapsulate",
        "Seal: proven before stripping", "Clearance: per the protocol",
        "Waste: sealed pouch + manifest"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBGL_ACCENT });
    reg2(plan, "glovebag-plan");

    const chest = toolChest(g, 2.0, 1.9, { ry: -0.6, color: IBGL_ACCENT });
    void chest;

    // Additional pipe hangers along the header and a stack of spare glovebags.
    for (let i = 0; i < 4; i++) {
      cyl(rack, 0.012, 0.012, 0.24, -1.3 + i * 0.9, 1.42, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    }
    const spareBags = group(g, 2.0, 0, -1.0, 0.3);
    for (let i = 0; i < 4; i++) {
      box(spareBags, 0.34, 0.02, 0.4, 0, 0.02 + i * 0.03, 0, 0xe7edb8, { rough: 0.3, opacity: 0.5, transparent: true, cast: false });
    }
    holoTag(spareBags, "Spare glovebags", 0, 0.24, 0, { css: "#c9e265", w: 0.4 });

    const barrierTape = group(g, 0, 0, 2.2);
    for (let i = -2; i <= 2; i++) {
      box(barrierTape, 0.9, 0.05, 0.01, i * 0.95, 0.9, 0, 0xf2c14b, { cast: false, rough: 0.6 });
    }
    for (const sx of [-2.4, 2.4]) cyl(barrierTape, 0.02, 0.02, 1.0, sx, 0.5, 0, 0x2b2f33, { rough: 0.6, seg: 8 });
    holoTag(barrierTape, "Barricade line", 0, 1.1, 0, { css: "#c9e265", w: 0.4 });

    const foreman = standingFigure(g, -2.65, 0.9, { ry: -0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.5, 1.6, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9e265"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4f8e6";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("wrong-side mark · live branch · bag condition", w / 2, h * 0.68);
    }, { accent: IBGL_ACCENT });
    reg2(checkin, "ibgl-crew-checkin");

    const damperTag = group(g, 2.4, 0, -2.3, -0.3);
    box(damperTag, 0.3, 0.3, 0.08, 0, 1.5, 0, 0x4a525a, { rough: 0.6, metal: 0.4 });
    const damperLight = ball(damperTag, 0.025, 0, 1.66, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(damperTag, "HVAC damper tag", 0, 1.82, 0, { css: "#c9e265", w: 0.4 });
    reg2(damperTag, "hvac-damper-tag");

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.5, 0.93, 2.6, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Abatement closeout log", -2.5, 1.12, 2.6, { css: "#8fa9c4", w: 0.5 });
    reg2(closingLog, "ibgl-closing-log");

    // ----------------------------------------------------------------- state
    let bagStripped = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0.3, 1.4, -1.2),

      onStepComplete(step) {
        if (step.id === "wet-strip") { bagStripped = true; debrisPile.visible = true; }
        if (step.id === "collect-debris") debrisPile.position.set(0, -0.42, 0);
        if (step.id === "spray-encapsulant") header.material = mat(0xb0a67c, { rough: 0.5 });
        if (step.id === "clearance-air-sample") {
          repaint(airPump.userData.screen, signFace("CLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (step.id === "final-walk") {
          droppedDebris.visible = false;
          wetSpot.visible = false;
          looseTool.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "bag-deflate") { seamLift.visible = true; bagBody.material.opacity = 0.2; }
        if (it.id === "hvac-restart-call") damperLight.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bag-deflate") { seamLift.visible = false; bagBody.material.opacity = 0.4; }
        if (it.id === "hvac-restart-call") damperLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
      },

      onHazard(hitId) {
        void hitId;
      },

      animate(t, dt) {
        void t; void dt; void bagStripped;
      },
    };
  },
};
