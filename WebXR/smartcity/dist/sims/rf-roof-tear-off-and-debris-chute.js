import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace, woodGrainFace, brickFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Roof Tear-Off & Debris Chute VR — Construction & Structural
// Trades, the Roofers and Waterproofers pack.
//
// An old built-up roof mid tear-off: a stripped strip of deck exposed down to
// the sheathing, the old membrane and insulation still down on the rest, and
// a debris chute running from the parapet to a dumpster at grade. The
// learner runs the tear-off, the chute and the scan of the exposed deck. A
// generic building, a generic crew; no contractor or address is named.

const RTDC_PAL = palette("construction");
const RTDC_ACCENT = RTDC_PAL.accent;
const RTDC_CSS = "#f2c14b";

export const SIM_RF_ROOF_TEAR_OFF_AND_DEBRIS_CHUTE = {
  id: "rf-roof-tear-off-and-debris-chute",
  index: "rf6",
  domain: "Construction & Structural Trades",
  trade: "Roofer tearing off an old built-up roof and running debris down a chute to the dumpster",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection at the roof edge and any hole opened in the deck, and 29 CFR 1926 Subpart M Fall protection generally; ANSI Z359 for the harness and anchor; 29 CFR 1926.1153 for silica dust from cutting into a concrete curb or nailer; NRCA tear-off and dry-in practice; Roofers Local 40 apprenticeship and training",
  name: "Roof Tear-Off & Debris Chute",
  title: simTitle("Roof Tear-Off & Debris Chute"),
  tagline: "The tear-off plan and the extinguisher read, harness clipped, a popped nail and a hidden conduit found, the wind read, old fasteners backed out, debris carted to the chute and fed down at a steady rate, the strip cut to its line, the exposed deck scanned and dried in, a missed fastener and leftover debris found on the walk-round, and the day logged, with a gust scattering staged debris and a second crew member flagging an uncovered hole along the way",
  accent: RTDC_ACCENT,
  accentCss: RTDC_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "deck-scanned-clean", name: "Deck Scanned Clean", note: "A strip torn off, scanned and dried in with nobody stepping on an open hole or a fastener left in the chute's path" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Tear-Off Run",
    currency: "STRIP",
    ranks: ["Apprentice", "Tear-Off Hand", "Chute Runner", "Lead Stripper", "Tear-Off Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The tear-off plan read before the first fastener came out", test: AWARD.stepClean("tear-off-plan") },
      { id: "steady-cut", name: "Steady Cut", note: "The cut line ran the whole strip without a break in pace", test: AWARD.unbroken },
      { id: "never-stepped-the-hole", name: "Never Stepped The Hole", note: "No boot on a rotted section, no spark into the debris, no cutting dust without a respirator", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-strip", name: "Clean Strip", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "chute-steady", name: "Chute Steady", note: "The chute load held inside the band the whole feed", test: AWARD.precise(0.7) },
      { id: "strip-closed", name: "Strip Closed", note: "Dried in and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rotted-deck-section": "You are about to step onto a section of deck the tear-off just exposed, and it is visibly rotted where old moisture sat under the membrane for years. 29 CFR 1926.501 treats a hole in the roof — including a deck too weak to carry weight — as an edge to be guarded, and a rotted deck gives out from underfoot with no more warning than a hole covered by debris does.",
    "grinder-sparks-into-debris": "You are grinding through an old fastener with a pile of dry tear-off debris sitting right behind the wheel. Old felt and dried-out insulation catch a spark far more easily than anyone expects standing next to a roof that has never had a fire on it — the debris gets moved clear of any cutting or grinding before the wheel ever starts turning, not after the first spark lands in it.",
    "silica-dust-no-respirator": "You are cutting into the concrete curb without a respirator or a water suppression line on the saw. 29 CFR 1926.1153 exists because that fine dust does not settle where you can see it — it goes exactly as deep into a lung as it goes into the air, and a respirator or wet cutting is what keeps most of it out of both.",
    "debris-pile-blowing": "The pile of loose tear-off debris staged at the edge is starting to lift and scatter in the gust. A ripped-up section of old felt caught by wind does not just make a mess of the roof — it goes over the edge onto whatever, or whoever, is below, which is why staged debris gets weighted or bagged the moment it is pulled, not left loose until there is time to deal with it.",
  },

  lateNotes: {
    "cut-saw": "The cut line is run once the old fasteners along it have actually been backed out — there is nothing to cut cleanly through yet.",
    "deck-scan": "The deck is scanned once a strip has actually been torn off — there is nothing exposed to look at yet.",
    "log-board": "The log is written once the walk-round has found what it is going to find, not before.",
  },

  steps: [
    {
      id: "tear-off-plan", kind: "select", target: "plan-board",
      title: "Read the tear-off plan",
      cue: "Read the plan: the strip width that can be dried in before weather, the chute location, the dumpster below, and the fall protection required at the exposed deck.",
      why: "A tear-off is only ever opened as wide as the crew can dry back in before the weather changes, and the plan is where that width is actually decided — by the competent person, in daylight, rather than by however much felt has already been pulled when the sky starts to change.",
    },
    {
      id: "extinguisher-check", kind: "select", target: "extinguisher",
      title: "Confirm the extinguisher before any cutting or grinding",
      cue: "Check the extinguisher's gauge is in the green and that it is staged within reach of the cutting and grinding work.",
      why: "Old built-up roofing is dry felt and asphalt waiting for a spark, and cutting or grinding through embedded fasteners is exactly the work that throws one — the extinguisher is confirmed at hand before either tool is powered on, not fetched after the first ember catches.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the strip being torn off.",
      why: "A tear-off opens holes in the roof on purpose, on a schedule the crew controls, which is exactly why 29 CFR 1926.502 has the anchor, harness and connection working as one system the whole time — the edge and the hole are both live hazards for as long as the strip stays open.",
    },
    {
      id: "tear-off-inspect", kind: "find", noHint: true,
      targets: ["exposed-nail-pop", "hidden-conduit"],
      itemNames: { "exposed-nail-pop": "a popped nail standing proud of the old deck", "hidden-conduit": "an electrical conduit hidden under the old membrane" },
      itemNotes: {
        "exposed-nail-pop": "A fastener from the old roof has backed most of the way out and is standing proud of the deck under a thin skin of membrane — invisible until a boot finds it, and sharp enough to go straight through a sole when it does.",
        "hidden-conduit": "There is a conduit run under the old membrane exactly where the next strip's cut line is marked — cut through without knowing it is there, it is a fastener-removal job that turns into an electrical one.",
      },
      title: "Inspect the old roof before the first cut",
      cue: "Feel along the strip for anything standing proud under the membrane and look for any conduit or pipe the old roof might be hiding.",
      why: "Everything under an old built-up roof was covered up on purpose decades ago, and a tear-off is the one time all of it is about to be exposed to a pry bar, a saw and a boot at the same time — finding it first is cheaper than finding it with the tool already moving.",
    },
    {
      id: "wind-check", kind: "gauge", target: "wind-gauge",
      title: "Read the wind before opening the strip",
      cue: "Read the anemometer and commit only if the gusts are under the tear-off's wind limit.",
      why: "An open strip with no membrane on it is a strip with nothing to stop a gust getting under whatever is still loose on the deck, and the wind limit for tear-off work is set well below what it takes to turn staged debris into a falling-object hazard for the ground below.",
      gauge: {
        label: "WIND AT THE PARAPET — GUSTS", speed: 0.55, green: [0.08, 0.4],
        readout: (t) => `${Math.round(t * 60)} mph gusts`,
        missNote: "Gusting over the tear-off limit. Wait and read it again before the strip is opened any wider.",
      },
    },
    {
      id: "fastener-removal", kind: "turn", target: "fastener-tool",
      title: "Back out the old deck fasteners along the strip",
      cue: "Run the reversing driver along the strip's fasteners and back each one out before the felt is pulled over it.",
      why: "A fastener still gripping the deck under a sheet of felt is what turns a pull into a tear that goes the wrong direction, and backing them out first is what makes the next strip come up in one controlled piece instead of shredding wherever it was still held down.",
      turn: { turns: 0.5, axis: "z", reverse: true, label: "FASTENER DRIVER", readout: (t) => (t < 0.95 ? "gripping" : "backed out") },
    },
    {
      id: "tear-off-cart", kind: "drag", target: "tear-off-cart",
      title: "Cart the torn-off debris to the chute hopper",
      cue: "Wheel the loaded cart of old felt and insulation to the chute hopper rather than piling it loose on the deck.",
      why: "Debris piled loose on a roof is debris that has to be carted twice — once to a pile, once from the pile to the chute — and it is also exactly what a gust picks up in between. Carting it straight to the hopper is the version of this job that only moves it once.",
      drag: { to: "chute-hopper", radius: 0.55, missNote: "Not at the hopper. Wheel the cart all the way to the chute before tipping it." },
    },
    {
      id: "chute-feed", kind: "hold", target: "chute-hopper", seconds: 5,
      title: "Feed the chute at a steady rate",
      cue: "Tip the cart and hold a steady feed into the chute — dumping it all at once jams the chute and can bounce debris back up out of the hopper.",
      why: "A debris chute empties at a fixed rate, and dumping a full cart into it at once overloads that rate the same way pouring a bucket down a drain faster than it can swallow backs the sink up — the difference here is what backs up is old asphalt and nails, coming back up at whoever is standing over the hopper.",
      holdBreakNote: "The feed rushed and the chute backed up — slow down and let it clear before feeding more in.",
    },
    {
      id: "cut-line", kind: "track", target: "cut-saw", seconds: 6,
      title: "Cut the strip to its marked line at a steady pace",
      cue: "Run the saw along the marked cut line at a steady pace — too slow burns the blade into the deck, too fast wanders off the line.",
      why: "The cut line is where this strip ends and tomorrow's dry-in begins, and a saw run too fast wanders off that line into deck that was supposed to stay covered overnight, while one run too slow can burn through the deck sheathing along with the old roofing on top of it. A steady pace keeps the cut exactly where the plan needs it.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "CUT SAW TRAVEL SPEED", readout: (v) => (v < 0.4 ? "too slow — burning" : v > 0.62 ? "too fast — off the line" : "on the line") },
      holdBreakNote: "The saw's pace broke out of the steady band. Bring it back to a steady travel speed along the cut line.",
    },
    {
      id: "deck-scan", kind: "select", target: "deck-scan",
      title: "Scan the exposed deck before anyone walks it",
      cue: "Walk the newly exposed strip with your eyes first: soft spots, rot, daylight showing through, anything that was hidden a minute ago.",
      why: "The moment a strip is stripped bare is the one moment its deck can actually be looked at, and a deck that looked fine covered in three layers of old roofing can turn out to be rotted through in a spot nobody could have seen until right now.",
    },
    {
      id: "dry-in", kind: "select", target: "dry-in-tarp",
      title: "Dry the exposed strip in before the shift ends",
      cue: "Lay the temporary dry-in felt over the exposed strip and secure it against the wind before leaving the deck open overnight.",
      why: "An exposed deck left uncovered is a roof with no roof on it the moment weather changes, and NRCA's tear-off practice never opens more than a dry-in can cover by the end of the shift — the temporary felt is what keeps tonight's forecast from becoming tomorrow's water damage to the building below.",
    },
    {
      id: "strip-walk", kind: "find", noHint: true,
      targets: ["missed-fastener", "debris-left-on-deck"],
      itemNames: { "missed-fastener": "a fastener left standing in the dried-in strip", "debris-left-on-deck": "tear-off debris left on the finished deck" },
      itemNotes: {
        "missed-fastener": "One fastener along the strip never got backed out — left under the dry-in felt, it is a puncture waiting for the first person who walks that stretch tomorrow morning.",
        "debris-left-on-deck": "A scrap of old felt and a handful of nails were never carted to the chute — loose on a dried-in deck, they are exactly what tears the temporary felt the next time the wind gets under it.",
      },
      title: "Walk the strip and find what should already be gone",
      cue: "Walk the finished strip against the plan: find the fastener that never came out and the debris that never made it to the chute.",
      why: "A strip that looks finished from the hatch can still be hiding a fastener under the dry-in or a scrap of debris nobody carted, and the walk-round is the last chance to find either before the deck is covered again tomorrow and both are out of sight for good.",
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log the strip, the finds and the chute count",
      cue: "Write the conduit found, the rotted deck flagged, the missed fastener pulled, and the debris chute's load count into the log.",
      why: "Tomorrow's crew opens the next strip based on what this log says about today's — a conduit marked, a rotted section flagged for the framer, a fastener count that tells the dumpster hauler when the bin is actually full — none of which survives past the end of the shift unless it is written down.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the chute tender and the ground",
      cue: "Radio the chute tender and the ground crew: the strip is torn off, dried in and logged, and name the support line.",
      why: "The chute tender at grade has spent the whole shift watching a hopper for debris they cannot see coming, and a short check-in when the strip closes out is what lets them stand down and step clear of the chute for good.",
    },
  ],

  interrupts: [
    {
      id: "gust-scatters-debris",
      kind: "Gust scatters the staged debris",
      after: "tear-off-cart", delay: 2, seconds: 14,
      alert: "A gust off the parapet catches the pile of debris staged for the next cart load, and it starts scattering across the deck toward the edge.",
      cue: "Get to the debris and bag it down before more of it reaches the edge.",
      target: "debris-secured",
      why: "Loose tear-off debris scattering toward an open edge is a falling-object hazard for the ground below the instant any of it goes over, which is exactly why staged debris is bagged or weighted the moment it is pulled rather than left loose between cart trips.",
      missNote: "A double handful of old felt went over the edge before anyone reached the pile, landing on the sidewalk below with no one down there to see it coming.",
      wrongNote: "That does not stop scattering debris. Get to the pile and bag it down before more of it reaches the edge.",
    },
    {
      id: "hole-flagged-elsewhere",
      kind: "Coworker flags an uncovered hole",
      after: "deck-scan", delay: 2, seconds: 14,
      alert: "A coworker at the far end of the strip radios that they have found a section of deck with daylight showing through it, and it is not marked or covered yet.",
      cue: "Get the hole cover over to that section before anyone else walks that stretch of deck.",
      target: "hole-cover",
      why: "A hole in an exposed deck is invisible from a few feet away under the same dust and debris that made it hard to spot in the first place, and the only thing that actually protects the next person who walks that stretch is a cover physically over it, not a mental note that it is somewhere back there.",
      missNote: "The hole stayed uncovered while the crew kept working the strip, one careless step away from a section of deck that would not have held anyone's weight.",
      wrongNote: "Not that. Get the hole cover over to the section the coworker flagged before anyone walks it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, RTDC_ACCENT);

    // ------------------------------------------------------------ roof deck: old membrane, torn strip, exposed deck
    const oldTex = surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#3a332c", base2: "#302a24", lanes: 0 }), { repeat: 3, px: 384 });
    const deck = box(g, 6.4, 0.24, 5.6, 0, 0.12, 0, 0xffffff);
    deck.material = texturedMat(oldTex, { rough: 0.95, metal: 0.02, color: 0x9a8c7a });
    deck.receiveShadow = true;
    const woodTex = surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { planks: 10, tones: [0xa8845a, 0x977448, 0xb2916a] }), { repeat: 2, px: 320 });
    const exposedDeck = box(g, 2.0, 0.02, 2.4, 1.6, 0.251, -0.3, 0xffffff);
    exposedDeck.material = texturedMat(woodTex, { rough: 0.9, metal: 0.0, color: 0xc7a875 });
    const rotSpot = box(exposedDeck, 0.3, 0.02, 0.3, 0.4, 0.011, 0.3, 0x2a2018, { rough: 0.95 });
    reg(hits, rotSpot, "rotted-deck-section");
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.6, pd, px, 0.54, pz, 0xffffff);
      wall.material = texturedMat(surfaceTexture((cx, w, h) => brickFace(cx, w, h, { brick: [0xa8503a, 0x974731, 0xb35a3f] }), { repeat: 2, px: 320 }), { rough: 0.9, metal: 0.0, color: 0xc79080 });
      box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.87, pz, 0x8b949d, { rough: 0.5, metal: 0.5 });
    }
    const cutLineMark = box(g, 2.2, 0.012, 0.08, 1.6, 0.246, 0.9, 0xd8c88a, { opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "cut line", 1.6, 0.4, 0.9, { css: RTDC_CSS, w: 0.2 });
    reg(hits, cutLineMark, "cut-saw");
    const dryInTarp = box(g, 2.0, 0.012, 2.4, 1.6, 0.256, -0.3, 0x3a4148, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "dry-in tarp", 1.6, 0.4, -0.3, { css: RTDC_CSS, w: 0.24 });
    reg(hits, dryInTarp, "dry-in-tarp");
    const tarpLaid = box(g, 2.0, 0.02, 2.4, 1.6, 0.262, -0.3, 0x3a4148, { rough: 0.6 });
    tarpLaid.visible = false;
    const deckScanMark = box(exposedDeck, 2.0, 0.03, 2.4, 0, 0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, deckScanMark, "deck-scan");
    const nailPop = box(g, 0.02, 0.03, 0.02, 1.0, 0.256, 0.2, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    reg(hits, nailPop, "exposed-nail-pop");
    const hiddenConduit = box(g, 0.9, 0.015, 0.05, 1.6, 0.253, 0.55, 0x8a8f95, { rough: 0.5, metal: 0.5 });
    reg(hits, hiddenConduit, "hidden-conduit");

    // Concrete curb for the silica-dust cut.
    const curb = group(g, 2.7, 0.24, -2.0);
    box(curb, 0.6, 0.3, 0.4, 0, 0.15, 0, 0xa9ada4, { rough: 0.9 });
    holoTag(curb, "cutting the curb — respirator on?", 0, 0.5, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, curb, "silica-dust-no-respirator");

    // ------------------------------------------------------------ chute, cart, debris
    const chute = group(g, -2.6, 0.24, 1.6, 0.3);
    cyl(chute, 0.28, 0.2, 1.1, 0, 0.55, 0, RTDC_PAL.structure, { rough: 0.55, metal: 0.4, seg: 14 });
    holoTag(chute, "debris chute hopper", 0, 1.2, 0, { css: RTDC_CSS, w: 0.36 });
    reg(hits, chute, "chute-hopper");
    const dumpster = group(g, -2.7, 0.24, 2.3);
    box(dumpster, 0.7, 0.5, 1.0, 0, 0.25, 0, RTDC_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(dumpster, "dumpster below", 0, 0.6, 0, { css: RTDC_CSS, w: 0.28 });

    const cart = group(g, -0.6, 0.24, 1.5, 0.4);
    box(cart, 0.5, 0.05, 0.7, 0, 0.03, 0, RTDC_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 3; i++) box(cart, 0.4, 0.1, 0.5, 0, 0.1 + i * 0.06, 0, 0x2a2420, { rough: 0.9 });
    for (const [sx, sz] of [[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]]) cyl(cart, 0.04, 0.04, 0.03, sx, 0.02, sz, 0x1b1e22, { rough: 0.7, seg: 12 });
    holoTag(cart, "tear-off cart", 0, 0.5, 0, { css: RTDC_CSS, w: 0.26 });
    reg(hits, cart, "tear-off-cart");

    const debrisPile = group(g, 1.9, 0.24, 2.2);
    for (let i = 0; i < 5; i++) box(debrisPile, 0.4, 0.05, 0.3, (i % 3) * 0.15, 0.03 + Math.floor(i / 3) * 0.06, (i % 2) * 0.1, 0x2a2420, { rough: 0.9 });
    holoTag(debrisPile, "staged debris — weighted?", 0.2, 0.4, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, debrisPile, "debris-pile-blowing");
    const debrisScattered = group(g, 2.6, 0.24, 2.6);
    for (let i = 0; i < 3; i++) box(debrisScattered, 0.3, 0.02, 0.2, i * 0.2, 0.011, i * 0.1, 0x2a2420, { rough: 0.9 });
    debrisScattered.visible = false;
    const debrisBagged = group(g, 1.9, 0.24, 2.2);
    box(debrisBagged, 0.5, 0.3, 0.4, 0, 0.15, 0, 0x2b2b2b, { rough: 0.5 });
    debrisBagged.visible = false;
    reg(hits, debrisBagged, "debris-secured");

    // Grinder near debris (burn hazard) and cutting saw prop.
    const grinder = group(g, 2.1, 0.24, 1.7);
    cyl(grinder, 0.05, 0.05, 0.16, 0, 0.08, 0, 0x2b2b30, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(grinder, "grinding near the debris?", 0, 0.32, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, grinder, "grinder-sparks-into-debris");
    const sparks = particles(g, 30, 0xffc860, { size: 0.02, life: 0.4, additive: true, opacity: 0.7 });
    sparks.position.set(2.1, 0.3, 1.7);
    sparks.visible = false;

    const fastenerTool = group(g, 1.2, 0.3, 0.6, 0.4);
    cyl(fastenerTool, 0.03, 0.035, 0.28, 0, 0.02, 0, RTDC_PAL.accent, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    box(fastenerTool, 0.08, 0.1, 0.06, 0, 0.02, -0.15, 0x2b2b30, { rough: 0.5 });
    holoTag(fastenerTool, "fastener driver", 0, 0.2, 0, { css: RTDC_CSS, w: 0.26 });
    reg(hits, fastenerTool, "fastener-tool");

    // Missed-fastener + debris finds after dry-in.
    const missedFastenerMark = box(g, 0.15, 0.02, 0.15, 1.2, 0.26, -0.9, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    reg(hits, missedFastenerMark, "missed-fastener");
    const debrisLeftMark = box(g, 0.3, 0.02, 0.3, 2.2, 0.26, -1.0, 0x2a2420, { rough: 0.9 });
    reg(hits, debrisLeftMark, "debris-left-on-deck");

    // Hidden hole, flagged by a coworker elsewhere on the roof.
    const holeCoverKit = group(g, -1.9, 0.24, -2.1);
    box(holeCoverKit, 0.5, 0.03, 0.5, 0, 0.015, 0, RTDC_PAL.trim, { rough: 0.7 });
    holoTag(holeCoverKit, "hole cover", 0, 0.3, 0, { css: RTDC_CSS, w: 0.22 });
    reg(hits, holeCoverKit, "hole-cover");
    const flaggedHole = group(g, -2.6, 0.24, -1.2);
    cyl(flaggedHole, 0.25, 0.25, 0.02, 0, 0.01, 0, 0x0a0b0d, { rough: 1.0, seg: 16 });
    flaggedHole.visible = false;
    const flaggedHoleCovered = group(g, -2.6, 0.24, -1.2);
    box(flaggedHoleCovered, 0.5, 0.03, 0.5, 0, 0.015, 0, RTDC_PAL.trim, { rough: 0.7 });
    flaggedHoleCovered.visible = false;

    // ------------------------------------------------------------ crew, chest, boards
    const chuteTender = standingFigure(g, -1.4, 2.9, { ry: -0.8, vest: 0xd8f23a, helmet: RTDC_PAL.accent, gloves: true });
    holoTag(chuteTender, "chute tender", 0, 2.0, 0, { css: RTDC_CSS, w: 0.28 });
    const coworker = standingFigure(g, -2.4, -1.9, { ry: 1.6, vest: 0xd8f23a, gloves: true, atStation: true });
    holoTag(coworker, "coworker, far end", 0, 1.9, 0, { css: RTDC_CSS, w: 0.36 });
    const chest = toolChest(g, -1.5, -2.0, { ry: 2.0, color: RTDC_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: RTDC_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, 0.2, 0.24, -2.3);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, RTDC_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: RTDC_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const extStand = group(g, -0.9, 0.24, 2.3);
    cyl(extStand, 0.09, 0.1, 0.42, 0, 0.21, 0, 0xd2312b, { rough: 0.6, seg: 14 });
    holoTag(extStand, "extinguisher", 0, 0.5, 0, { css: RTDC_CSS, w: 0.24 });
    reg(hits, extStand, "extinguisher");
    const anemometer = group(g, 0.5, 0.24, -2.5);
    cyl(anemometer, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 6 });
    const windFace = decal(anemometer, 0.1, 0.06, 0, 1.25, 0.02, signFace("-- mph", { bg: "#0d1c24", accent: RTDC_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(anemometer, "anemometer", 0, 1.35, 0, { css: RTDC_CSS, w: 0.24 });
    reg(hits, windFace, "wind-gauge");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: RTDC_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: RTDC_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 0.4, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = RTDC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("TEAR-OFF PLAN — STRIP C", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Strip width: what dries in by shift end", "Chute at the parapet · dumpster below",
       "Fall protection: open deck + edge", "Wind limit: per the plan",
       "NRCA tear-off + dry-in practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: RTDC_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = RTDC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("TEAR-OFF LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Strip: —", "Finds: —", "Chute: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: RTDC_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "deck-scan") rotSpot.material = mat(0x59c97b, { rough: 0.6 });
        if (step.id === "dry-in") { tarpLaid.visible = true; dryInTarp.visible = false; }
        if (step.id === "strip-walk") { missedFastenerMark.material = mat(0x59c97b); debrisLeftMark.material = mat(0x59c97b); }
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("TEAR-OFF LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Strip: torn off + dried in", "Finds: conduit + rot + fastener", "Chute: load logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("STRIP CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.38 }));
      },
      onHazard(hitId) { if (hitId === "grinder-sparks-into-debris") sparks.visible = true; },
      onInterrupt(it) {
        if (it.id === "gust-scatters-debris") { debrisPile.visible = false; debrisScattered.visible = true; }
        if (it.id === "hole-flagged-elsewhere") flaggedHole.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-scatters-debris") { debrisScattered.visible = false; debrisBagged.visible = true; }
        if (it.id === "hole-flagged-elsewhere") { flaggedHole.visible = false; flaggedHoleCovered.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "fastener-removal") fastenerTool.rotation.z = -session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-check") {
          repaint(windFace, signFace(`${Math.round(gg.t * 60)} mph`, { bg: "#0d1c24", accent: gg.t > 0.08 && gg.t < 0.4 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (sparks.visible) sparks.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0.06, 0), 0.04, 0.6, -2.5);
        void paperFace;
      },
    };
  },
};
