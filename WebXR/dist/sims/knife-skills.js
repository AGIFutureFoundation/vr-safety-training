import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Knife Skills VR — Culinary & Hospitality, station one.
// A prep cook's own bench inside the shared commercial kitchen (see
// interiors.js's "kitchen" style — the hood line along the back wall is the
// same room every station in this programme stands in). The hazard here is
// never the knife: it is the board that slides, the blade nobody can see
// under water, and the mandoline run bare-handed because the guard was
// "only going to be a second." Every real injury on a prep line traces back
// to one of those three, which is why all four registered hazards live there.

const KS_ACCENT = 0xe8b02e;

export const SIM_KNIFE_SKILLS = {
  id: "knife-skills",
  index: "101",
  domain: "Food service",
  trade: "Prep cook",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  certification: "UNITE HERE Local 2 — hospitality and food service; the FDA Food Code as adopted in the California Retail Food Code; California Food Handler card and ServSafe Food Protection Manager; Cal/OSHA General Industry Safety Orders; OSHA 29 CFR 1910.138 hand protection; ANSI/ISEA 105 cut-resistance ratings; NSF/ANSI 2 food-contact equipment for the boards and prep surfaces",
  name: "Knife Skills",
  title: simTitle("Knife Skills"),
  tagline: "Board anchored, edge honed, claw grip, the cut-resistant glove on the mandoline, and a clean sanitised close",
  accent: KS_ACCENT,
  accentCss: "#e8b02e",
  parSeconds: 230,
  footprint: 2.3,
  badge: { id: "clean-board", name: "Clean Board", note: "A full prep run with the edge honed, the glove on for the mandoline, and nothing left in the sink" },

  game: system({
    name: "Board Authority",
    currency: "DICE",
    ranks: ["Dish Hand", "Prep Cook", "Line Cook", "Lead Prep", "Board Authority Certified"],
    badges: [
      { id: "no-sink-blade", name: "No Sink Blade", note: "Never left a blade for the sink to hide", test: AWARD.stepClean("carry-back") },
      { id: "gloved-up", name: "Gloved Up", note: "Never touched the mandoline's edge bare-handed", test: AWARD.safe },
      { id: "even-dice", name: "Even Dice", note: "Held the claw-grip cut close to the target size", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-prep", name: "Clean Prep", note: "No corrections through the whole run", test: AWARD.clean },
      { id: "steady-hone", name: "Steady Hone", note: "Held the honing angle without a break", test: AWARD.unbroken },
      { id: "ticket-fast", name: "Ticket Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "sink-knife": "There is a blade under that cloudy water. Knives never go into a soaking sink — the next person plunging a hand in to find a whisk finds the edge first, and nobody who does that sees it coming.",
    "mandoline-no-guard": "That spare mandoline on the shelf has no hand guard clipped to it. A mandoline blade is exposed edge to edge across the full width of the carriage; run one bare and the only thing between your fingertips and the blade is how far down the vegetable you've gotten.",
    "bare-blade-check": "You touched the mandoline's edge directly to see how sharp it was. That edge is exposed the width of the carriage on purpose — it is not the thing you put a fingertip against to find out.",
    "dull-knife": "That blade on the rack is visibly nicked and dull. A dull edge needs more downward force to make the same cut, and force is exactly what turns a slip into a laceration — the fix is the honing steel, never leaning on it harder.",
  },

  lateNotes: {
    "chef-knife": "Board anchored on the towel first. A knife in your hand over a board that can still slide is the slip waiting to happen.",
    "mandoline": "Not yet — the guard clips on and the glove goes on the guiding hand before that carriage ever sees a vegetable.",
    "green-board": "The raw board goes through wash, rinse and sanitiser before a clean board comes off the rack — swapping straight across skips the step that actually protects the produce.",
  },

  steps: [
    {
      id: "ticket", kind: "select", target: "prep-ticket",
      title: "Read the prep ticket",
      cue: "Check what's being cut, for which dish, and how much of it.",
      why: "The ticket sets the cut size and the quantity before the first board comes down. A prep cook who starts cutting before reading it is guessing at both, and a guess that's wrong is a whole tray recut on the clock.",
    },
    {
      id: "board", kind: "select", target: "red-board",
      title: "Take the raw-protein board",
      cue: "Pull the red board for the raw chicken thighs on the ticket.",
      why: "Red is raw meat and poultry, every station, every shift — the colour code exists so the right board is a glance across a busy line rather than a decision made from memory under pressure, and so this board never turns up under produce later.",
    },
    {
      id: "anchor", kind: "drag", target: "cutting-board",
      title: "Anchor the board on a damp towel",
      cue: "Carry the board onto the folded damp towel so it can't slide.",
      why: "A board with nothing under it walks across a stainless counter the first time the knife bites at an angle, and a moving board under a moving blade is how a controlled cut turns into an uncontrolled one. The damp towel grips both surfaces and stops that dead.",
      drag: { to: "towel-pad", radius: 0.28, missNote: "Not lined up with the towel — the board has to sit fully on the damp cloth or it can still walk." },
    },
    {
      id: "knife", kind: "select", target: "chef-knife",
      title: "Take the chef knife",
      cue: "Draw the chef knife off the magnetic rack — not the nicked one beside it.",
      why: "A rack holds more than one blade for a reason, and the one with a chip in the edge is there to be sent for sharpening, not carried to a board because it was closer to hand. The knife that comes off this rack is the one that gets checked before it cuts anything.",
    },
    {
      id: "hone", kind: "track", target: "honing-steel", seconds: 6,
      title: "Check and hone the edge",
      cue: "Draw the blade down the steel at a steady angle, heel to tip, and hold it in the band.",
      why: "Honing straightens a rolled edge back into line; it does not sharpen a genuinely dull blade, but it is what tells you which one you're holding. A consistent angle every pass is what keeps the edge true — wander the angle and you round it off instead of correcting it.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.55, fall: 0.42, drift: 0.12, label: "HONING ANGLE",
        readout: (v) => (v < 0.4 ? "too flat — rolling the edge" : v > 0.62 ? "too steep — biting the steel" : "true"),
      },
      holdBreakNote: "Angle wandered off the steel. An inconsistent pass rounds the edge instead of straightening it — reset and draw it through again.",
    },
    {
      id: "dice", kind: "gauge", target: "chef-knife",
      title: "Dice to the ticket size with a claw grip",
      cue: "Curl the guiding hand into a claw, knuckles to the blade, and commit the cut inside the target band.",
      why: "The claw grip puts your knuckles between the edge and your fingertips, so the blade always has a flat, blunt surface to travel against no matter where your hand has moved to. Even pieces from that grip also cook evenly — a ragged dice leaves the small pieces overdone before the big ones are through.",
      gauge: {
        label: "DICE SIZE", speed: 0.85, green: [0.4, 0.58],
        readout: (t) => `${(6 + t * 20).toFixed(1)} mm`,
        missNote: "Off the ticket's dice size — reset the claw grip, guide with the knuckles, and cut again.",
      },
    },
    {
      id: "glove", kind: "select", target: "cut-glove",
      title: "Glove the guiding hand",
      cue: "Pull the ANSI/ISEA A4-rated cut-resistant glove onto your guiding hand.",
      why: "A mandoline blade runs the full width of the carriage with nothing to stop a fingertip that follows the vegetable down too far. The rated glove is graded to resist that cut — OSHA 1910.138 is why it exists at this station, and it goes on before the guard, not after the first pass.",
    },
    {
      id: "guard", kind: "select", target: "mandoline-guard",
      title: "Clip the hand guard onto the mandoline",
      cue: "Seat the food holder guard onto the carriage before the blade is used for anything.",
      why: "The guard is what actually keeps your hand off the blade — the glove is the backup, not the plan. A mandoline used without its guard is a mandoline used the way it puts most people in urgent care: it works fine, right up until the vegetable runs out before your hand does.",
    },
    {
      id: "slice", kind: "track", target: "mandoline", seconds: 6,
      title: "Feed the mandoline at a steady stroke",
      cue: "Push the guard through in even, unhurried strokes and hold the feed rate in the band.",
      why: "Too fast and the carriage can bind or kick the slice back at you; too slow and the blade wobbles the cut uneven. A steady, guarded stroke is what a mandoline is designed around — rushing it is the only way this tool bites the hand that's actually protected.",
      track: {
        start: 0.15, green: [0.38, 0.6], rise: 0.5, fall: 0.4, drift: 0.13, label: "FEED RATE",
        readout: (v) => (v < 0.38 ? "too slow — wobbling the cut" : v > 0.6 ? "too fast — risk of bind" : "steady"),
      },
      holdBreakNote: "Feed rate broke out of the band. Bring the stroke back to a steady, guarded pace before the next pass.",
    },
    {
      id: "carry-back", kind: "drag", target: "chef-knife",
      title: "Carry the knife back point-down",
      cue: "Lift the chef knife point-down at your side and return it to the rack.",
      why: "A knife travels point-down and close to the body, never swinging out at hip height where it can catch a passing cook, and it goes back to the rack — never left on the board, never set down in a sink to deal with later. Every knife has exactly two places it belongs: the rack or the hand holding it.",
      drag: { to: "knife-rack", radius: 0.3, missNote: "Not on the rack — a knife set down anywhere else is a knife the next person finds by hand." },
    },
    {
      id: "swap", kind: "sequence",
      targets: ["board-wash", "board-sani", "green-board"],
      itemNames: { "board-wash": "wash — detergent", "board-sani": "sanitise — hold contact time", "green-board": "clean produce board" },
      itemNotes: { "board-wash": "Detergent and friction take the raw protein's film off the board. Nothing sanitises through a layer of fat and blood." },
      title: "Retire the raw board and bring up a clean one",
      cue: "Wash the red board, sanitise it, then take the green board down for produce.",
      why: "The board that carried raw chicken does not go straight back into service on anything else, and it does not get rinsed and called done — wash first, then sanitiser held for its full contact time, in that order, or the swap protects nobody.",
      outOfOrderNote: "Wash before sanitiser, always. Sanitiser poured onto a soiled board never reaches the surface it's meant to disinfect.",
    },
    {
      id: "close", kind: "hold", target: "sani-spray", seconds: 6,
      title: "Sanitise the station and let it stand",
      cue: "Spray down the counter and board and hold while the sanitiser stands its full contact time.",
      why: "The station gets the same treatment the board just did: sprayed and left wet for its labelled contact time, not wiped dry the second it's sprayed. A dry surface is a clean surface that was never actually sanitised — the chemical only earns its kill claim while it's still sitting there wet.",
      holdBreakNote: "Wiped off early. The surface went dry before contact time was up — spray it again and let it stand the full count.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["board-wrong-slot", "towel-bunched"],
      itemNames: { "board-wrong-slot": "board back in the wrong rack slot", "towel-bunched": "bunched towel underfoot" },
      itemNotes: {
        "board-wrong-slot": "A produce board sitting in the raw-meat slot. The next cook grabs by colour without looking twice, and this is exactly how the wrong board ends up under raw poultry.",
        "towel-bunched": "The anchor towel has bunched up on the floor by the counter leg. A folded towel stops a board from sliding; a bunched one on the tile is just something to catch a boot on.",
      },
      title: "Walk the station before the next ticket",
      cue: "Two things at this bench are out of place. Find them by looking.",
      why: "A line moves fast enough that nobody stops to inspect a station between tickets unless it's part of the routine. Two minutes spent looking at your own bench catches the board in the wrong slot and the towel on the floor before either one becomes somebody else's problem.",
    },
  ],

  // A busy line puts two things on a prep cook that neither look like the
  // ticket in front of them: a co-worker's hand crossing the board, and
  // another cook's blade going somewhere it should never sit. See shared/game.js.
  interrupts: [
    {
      id: "reach-across",
      kind: "Co-worker reach",
      after: "hone", delay: 3, seconds: 11,
      alert: "A co-worker leans right across your board for the salt tin while you're mid-stroke on the steel.",
      cue: "Their hand is crossing the same line your blade just came off of.",
      target: "chef-knife",
      why: "The honing steel and a hand reaching across the same six inches of counter do not share that space safely. Set the blade down flat on the board, edge turned away, until the reach is clear — a knife kept moving because stopping felt like losing time is how a co-worker's forearm meets an edge that was never aimed at them.",
      missNote: "You kept working the steel while they reached past it. It happened to clear you this time. The next co-worker who reaches across a moving blade is trusting a habit you haven't actually built yet.",
      wrongNote: "Set the knife down — flat on the board, edge away from the reach — before anything else happens.",
    },
    {
      id: "knife-in-sink",
      kind: "Blade in the soak sink",
      after: "slice", delay: 4, seconds: 12,
      alert: "Another cook just dropped a paring knife into the soapy sink beside you and walked off to answer the pass.",
      cue: "There's a blade under that water now and your hands are full of mandoline.",
      target: "sink-knife",
      why: "A knife dropped into a full sink disappears the instant the water settles — cloudy soap water hides an edge completely, and the next hand into that basin, yours or anyone else's, finds it by feel. It gets pulled and set on the rack the moment it's noticed, not left for whoever reaches in next.",
      missNote: "The blade stayed under the water for the rest of the run. Nobody happened to reach in blind. That was luck, not a fixed hazard — the next hand into that sink still finds it exactly the way this one would have.",
      wrongNote: "It's the soak sink — there's a blade under that water. Fish it out and onto the rack before it's forgotten.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, KS_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#c9d0d6", base2: "#b7bec5", step: 30 }), { repeat: 4, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.4, metal: 0.7, color: 0xc9d0d6 });

    // ------------------------------------------------------------- prep bench
    const bench = group(g, 0, 0, -1.05);
    const benchTop = box(bench, 1.7, 0.06, 0.85, 0, 0.9, 0, 0xc9d0d6, { radius: 0.01, rough: 0.35, metal: 0.7 });
    benchTop.material = steelMat();
    box(bench, 1.7, 0.86, 0.06, 0, 0.47, -0.4, 0x8b929a, { rough: 0.5, metal: 0.5 });
    for (const lx of [-0.75, 0.75]) box(bench, 0.06, 0.86, 0.78, lx, 0.47, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });

    // Damp folded towel — the anchor spot for the board.
    const towel = group(bench, -0.35, 0.935, 0.18);
    slab(towel, 0.42, 0.02, 0.3, 0, 0, 0, 0x3f7f9e, { radius: 0.02, rough: 0.85 });
    slab(towel, 0.42, 0.006, 0.3, 0, 0.013, 0, 0x5a9dba, { radius: 0.02, rough: 0.85, cast: false });
    holoTag(towel, "Anchor towel", 0, 0.1, 0, { css: "#e8b02e", w: 0.3 });
    reg(hits, towel, "towel-pad");

    // Cutting board — starts loose on the counter until it's anchored.
    const board = slab(bench, 0.44, 0.02, 0.3, 0.32, 0.935, 0.1, 0xc0392b, { radius: 0.012, rough: 0.6 });
    board.visible = false;
    reg(hits, board, "cutting-board");

    // A co-worker's arm, reaching straight across the board — hidden until
    // the reach-across interrupt fires.
    const reachArm = group(bench, -0.9, 1.02, 0.15, 0.5);
    cyl(reachArm, 0.05, 0.045, 0.55, 0, 0, 0, 0xdfe6ec, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    ball(reachArm, 0.06, 0.32, 0, 0, 0xc99878, { rough: 0.75, seg: 12 });
    reachArm.visible = false;

    // Colour-coded board rack, three slots.
    const rack = group(bench, 0.55, 0.935, -0.3);
    box(rack, 0.5, 0.02, 0.28, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    const boardColours = [
      { id: "red-board", c: 0xc0392b, x: -0.16 },
      { id: "green-board", c: 0x27904e, x: 0 },
      { id: "blue-board", c: 0x2d6fb5, x: 0.16 },
    ];
    for (const b of boardColours) {
      const bd = slab(rack, 0.14, 0.012, 0.02, b.x, 0.09, 0.1, b.c, { radius: 0.006, rough: 0.6 });
      bd.rotation.x = -0.2;
      if (b.id !== "blue-board") reg(hits, bd, b.id);
    }
    holoTag(rack, "Board rack", 0, 0.24, 0, { css: "#e8b02e", w: 0.26 });
    // Board sitting in the wrong slot for the closing walk — a produce-green
    // board racked where the raw-meat board belongs.
    const wrongSlot = slab(rack, 0.14, 0.012, 0.02, -0.16, 0.14, 0.1, 0x27904e, { radius: 0.006, rough: 0.6 });
    wrongSlot.rotation.x = -0.2;
    reg(hits, wrongSlot, "board-wrong-slot");

    // Prep ticket.
    const ticket = holoPanel(g, 0.5, 0.34, -1.2, 1.5, -1.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,10,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8b02e"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8cf9a";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TICKET 41 — TABLE 6", w * 0.06, h * 0.16);
      ctx.fillStyle = "#f4f2e6";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("CHICKEN + SLAW PREP", w * 0.06, h * 0.37);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#d8cf9a";
      ["Dice: 12 mm, raw chicken thigh", "Mandoline: 2 mm cabbage, guarded",
       "Board: red for protein, green for produce"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.54 + i * 0.13)));
    }, { ry: 0.5, accent: KS_ACCENT });
    reg(hits, ticket, "prep-ticket");

    // -------------------------------------------------------------- knife rack
    const strip = group(g, 1.15, 0, -1.55, -0.3);
    box(strip, 0.05, 0.9, 0.55, 0, 1.1, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    box(strip, 0.03, 0.9, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const knifeSpecs = [
      { id: "chef-knife", y: 1.4, len: 0.32, nick: false },
      { id: "dull-knife", y: 1.15, len: 0.28, nick: true },
      { id: null, y: 0.92, len: 0.22, nick: false },
    ];
    let chefKnifeGroup = null;
    for (const k of knifeSpecs) {
      const kn = group(strip, 0.03, k.y, 0);
      const blade = box(kn, 0.014, k.len, 0.028, 0, -k.len / 2, 0, 0xdfe4e8, { rough: k.nick ? 0.5 : 0.15, metal: 0.9 });
      if (k.nick) {
        box(kn, 0.016, 0.012, 0.028, 0, -k.len + 0.02, 0, 0x9aa1a8, { rough: 0.6, cast: false });
        blade.material = mat(0xb9bec4, { rough: 0.55, metal: 0.6 });
      }
      box(kn, 0.02, 0.09, 0.02, 0, 0.045, 0, 0x22262b, { rough: 0.6 });
      if (k.id) reg(hits, kn, k.id);
      if (k.id === "chef-knife") chefKnifeGroup = kn;
    }
    holoTag(strip, "Knife rack", 0, 1.62, 0, { css: "#e8b02e", w: 0.26 });
    hits["knife-rack"] = strip;

    // Honing steel on the counter beside the rack.
    const steel = group(bench, 0.3, 0.965, -0.24, 0.3);
    cyl(steel, 0.012, 0.012, 0.32, 0, 0.16, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 14 });
    box(steel, 0.024, 0.1, 0.024, 0, -0.05, 0, 0x22262b, { rough: 0.6 });
    ball(steel, 0.014, 0, -0.11, 0, 0x22262b, { rough: 0.6, seg: 10 });
    steel.rotation.z = Math.PI / 2;
    holoTag(steel, "Honing steel", 0, 0.16, 0, { css: "#e8b02e", w: 0.28 });
    reg(hits, steel, "honing-steel");

    // ---------------------------------------------------------- wash / sani
    const swap = group(g, -1.1, 0, -1.7);
    box(swap, 1.0, 0.6, 0.5, 0, 0.8, 0, 0x8b929a, { rough: 0.3, metal: 0.8 });
    for (const [id, x, water] of [["board-wash", -0.25, 0x38708a], ["board-sani", 0.25, 0x2f8a7a]]) {
      const basin = box(swap, 0.4, 0.2, 0.36, x, 1.02, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
      box(swap, 0.36, 0.02, 0.32, x, 1.11, 0, water, { rough: 0.12, metal: 0.2, opacity: 0.78 });
      reg(hits, basin, id);
    }
    decal(swap, 0.9, 0.09, 0, 1.32, 0, signFace("WASH   SANITISE", { scale: 0.5 }));
    holoTag(swap, "Board swap", 0, 1.5, 0, { css: "#e8b02e", w: 0.3 });

    // ------------------------------------------------------------ soak sink
    const sink = group(g, -1.8, 0, -0.35, 0.5);
    box(sink, 0.55, 0.6, 0.48, 0, 0.8, 0, 0x8b929a, { rough: 0.3, metal: 0.8 });
    const soakBasin = box(sink, 0.46, 0.2, 0.4, 0, 1.02, 0, 0x9aa1a8, { rough: 0.3, metal: 0.75 });
    box(sink, 0.42, 0.03, 0.36, 0, 1.115, 0, 0x5b6f72, { rough: 0.2, metal: 0.1, opacity: 0.82 });
    decal(sink, 0.4, 0.08, 0, 1.35, 0, signFace("SOAK", { bg: "#1f2429", accent: "#6cc6f0", scale: 0.5 }));
    reg(hits, soakBasin, "sink-knife");
    // The handle that surfaces the instant a co-worker drops a second knife in.
    const droppedHandle = box(sink, 0.02, 0.02, 0.13, 0.08, 1.14, -0.02, 0x22262b, { rough: 0.6 });
    droppedHandle.rotation.set(0.3, 0.4, 0);
    droppedHandle.visible = false;
    const sinkSplash = particles(sink, 26, 0xdfe9f0, { size: 0.014, life: 0.4, additive: false, opacity: 0.6 });

    // Bunched towel on the floor — closing-walk find target.
    const floorTowel = group(g, -1.55, 0, 0.05);
    box(floorTowel, 0.24, 0.03, 0.2, 0, 0.015, 0, 0x5a9dba, { rough: 0.85 });
    box(floorTowel, 0.14, 0.03, 0.14, 0.05, 0.03, 0.03, 0x5a9dba, { rough: 0.85 });
    reg(hits, floorTowel, "towel-bunched");

    // ------------------------------------------------------------ mandoline
    const mando = group(g, 1.55, 0, -0.55, -0.35);
    const mandoBase = box(mando, 0.5, 0.62, 0.4, 0, 0.31, 0, 0x8b929a, { rough: 0.3, metal: 0.8 });
    mandoBase.material = steelMat();
    const mandoBody = group(mando, 0, 0.62, 0);
    slab(mandoBody, 0.46, 0.03, 0.32, 0, 0, 0, 0x2b3138, { radius: 0.01, rough: 0.4, metal: 0.5 });
    const mandoRamp = slab(mandoBody, 0.46, 0.02, 0.28, 0, 0.05, -0.03, 0xdfe4e8, { radius: 0.01, rough: 0.2, metal: 0.9 });
    mandoRamp.rotation.x = -0.15;
    // The exposed blade line at the ramp's low edge.
    const bladeEdge = box(mandoBody, 0.42, 0.006, 0.012, 0, 0.02, 0.11, 0xf4f7fa, { rough: 0.1, metal: 0.95, cast: false });
    reg(hits, mandoBody, "mandoline");
    reg(hits, bladeEdge, "bare-blade-check");
    // The hand guard/food holder — sits beside the mandoline until clipped on.
    const guard = group(mando, 0.35, 0.68, 0.05);
    box(guard, 0.14, 0.03, 0.14, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    for (let i = 0; i < 5; i++) box(guard, 0.008, 0.05, 0.008, -0.05 + i * 0.025, -0.04, 0, 0x22262b, { rough: 0.6, cast: false });
    holoTag(guard, "Hand guard", 0, 0.1, 0, { css: "#e8b02e", w: 0.26 });
    reg(hits, guard, "mandoline-guard");
    // Vegetable riding the guard once it's fitted.
    const veg = box(mando, 0.09, 0.09, 0.16, 0, 0.72, 0.05, 0x8fbf5a, { rough: 0.6 });
    veg.visible = false;
    // Slices collecting in the tray below.
    const trayCatch = box(mando, 0.4, 0.03, 0.24, 0, 0.32, 0.16, 0x8b929a, { rough: 0.4, metal: 0.6 });
    void trayCatch;

    // Cut-resistant glove on a hook beside the mandoline.
    const glove = group(mando, -0.35, 0.9, 0);
    box(glove, 0.02, 0.16, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    ball(glove, 0.06, 0, -0.1, 0, 0x3c4a52, { rough: 0.8, seg: 12 });
    for (let i = 0; i < 4; i++) cyl(glove, 0.011, 0.011, 0.055, -0.03 + i * 0.02, -0.16, 0, 0x3c4a52, { rough: 0.8, seg: 8 });
    holoTag(glove, "Cut-resistant glove — ANSI A4", 0, 0.05, 0, { css: "#e8b02e", w: 0.44 });
    reg(hits, glove, "cut-glove");

    // Spare mandoline, guardless, on the shelf — the decoy hazard.
    const shelf = group(g, 1.95, 0, -1.5);
    box(shelf, 0.6, 0.02, 0.3, 0, 1.05, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    for (const sx of [-0.28, 0.28]) cyl(shelf, 0.015, 0.015, 1.05, sx, 0.53, 0.13, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    const spareMando = group(shelf, 0, 1.07, 0);
    slab(spareMando, 0.36, 0.024, 0.26, 0, 0, 0, 0x3c444c, { radius: 0.01, rough: 0.45, metal: 0.5 });
    box(spareMando, 0.34, 0.014, 0.008, 0, 0.017, 0.08, 0xdfe4e8, { rough: 0.15, metal: 0.9 });
    holoTag(spareMando, "Spare mandoline — no guard", 0, 0.14, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, spareMando, "mandoline-no-guard");

    // Sanitiser spray for the closing wipe-down.
    const sani = group(bench, -0.6, 0.965, -0.24);
    lathe(sani, [[0.001, 0], [0.03, 0.004], [0.032, 0.018], [0.032, 0.13], [0.026, 0.15], [0.014, 0.16], [0.014, 0.18], [0.001, 0.183]],
      0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.85, seg: 14 });
    cyl(sani, 0.012, 0.012, 0.09, 0, 0.08, 0, 0x59c97b, { rough: 0.3, opacity: 0.8, seg: 10 });
    box(sani, 0.026, 0.045, 0.045, 0, 0.2, 0.01, 0x2b6f47, { rough: 0.6 });
    holoTag(sani, "Sanitiser", 0, 0.24, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, sani, "sani-spray");

    // Anti-fatigue mat in front of the bench.
    slab(g, 1.4, 0.02, 0.7, 0, 0.01, -1.6, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      box(g, 0.09, 0.006, 0.09, -0.55 + i * 0.22, 0.022, -1.85 + j * 0.24, 0x14171a, { cast: false, receive: false });
    }

    // Wire shelving with produce crates — the depth behind the bench.
    const wireShelf = group(g, -2.2, 0, -1.0, 0.3);
    for (let s = 0; s < 3; s++) {
      box(wireShelf, 0.7, 0.02, 0.4, 0, 0.35 + s * 0.42, 0, 0x9aa1a8, { rough: 0.4, metal: 0.7 });
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(wireShelf, 0.014, 0.014, 1.3, sx * 0.32, 0.68, sz * 0.16, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    const crateColours = [0x8fbf5a, 0xd8a44e, 0xc0392b, 0x6cc6a0];
    crateColours.forEach((c, i) => {
      box(wireShelf, 0.28, 0.16, 0.3, -0.2 + (i % 2) * 0.4, 0.42 + Math.floor(i / 2) * 0.42, 0, c, { rough: 0.75 });
    });
    holoTag(wireShelf, "Produce shelf", 0, 1.3, 0, { css: "#e8b02e", w: 0.32 });

    // Herb and spice jars on a small rail above the ticket panel.
    const spiceRail = group(g, -1.2, 0, -1.35);
    box(spiceRail, 0.5, 0.02, 0.08, 0, 1.15, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    const spiceColours = [0x7a5a30, 0x9c8a3f, 0xb85a2a, 0x5a7a3a, 0x8a3a2a];
    spiceColours.forEach((c, i) => {
      cyl(spiceRail, 0.028, 0.03, 0.09, -0.2 + i * 0.1, 1.24, 0, 0xdfe4e8, { rough: 0.2, opacity: 0.7, seg: 12 });
      cyl(spiceRail, 0.024, 0.024, 0.06, -0.2 + i * 0.1, 1.2, 0, c, { rough: 0.8, seg: 10 });
    });

    // A second cook, clear of every control, working their own end of the bench.
    const crew = standingFigure(g, -0.2, -2.55, { ry: 0.2, cloth: 0xf2f2f2, trousers: 0x2b3138, vest: false });

    // Overhead pot rack — ambience, matching the room's hood line.
    const potRack = group(g, 0, 0, -2.5);
    box(potRack, 1.6, 0.03, 0.03, 0, 2.5, 0, 0x8b929a, { rough: 0.4, metal: 0.7, cast: false });
    for (const px of [-0.6, -0.2, 0.2, 0.6]) {
      cyl(potRack, 0.006, 0.006, 0.22, px, 2.38, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 6, cast: false });
      cyl(potRack, 0.12, 0.13, 0.09, px, 2.24, 0, 0x9aa1a8, { rough: 0.35, metal: 0.75, seg: 14 });
    }

    let mandoOn = false, sliceCount = 0;
    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.4, 1.15, -1.0),

      onStepComplete(step) {
        if (step.id === "board") board.visible = true;
        if (step.id === "anchor") board.position.set(-0.35, 0.955, 0.18);
        if (step.id === "knife") {
          // Off the rack and into the cook's working hand, over the board.
          chefKnifeGroup.parent.remove(chefKnifeGroup);
          bench.add(chefKnifeGroup);
          chefKnifeGroup.rotation.set(0, 0, 0.2);
          chefKnifeGroup.position.set(-0.1, 1.02, 0.24);
        }
        if (step.id === "guard") { mandoOn = true; guard.position.set(0, 0.7, 0.09); veg.visible = true; }
        if (step.id === "slice") { veg.scale.z = 0.25; }
        if (step.id === "carry-back") {
          board.visible = false;
          // Back on the rack, point never wandering out toward anyone.
          chefKnifeGroup.parent.remove(chefKnifeGroup);
          strip.add(chefKnifeGroup);
          chefKnifeGroup.rotation.set(0, 0, 0);
          chefKnifeGroup.position.set(0.03, 1.4, 0);
        }
        if (step.id === "swap") wrongSlot.visible = false;
        if (step.id === "walk") floorTowel.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "reach-across") reachArm.visible = true;
        if (it.id === "knife-in-sink") { droppedHandle.visible = true; sinkSplash.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "reach-across") reachArm.visible = false;
        if (it.id === "knife-in-sink") { droppedHandle.visible = false; sinkSplash.visible = false; }
      },

      animate(t, dt, session) {
        if (sinkSplash.visible) sinkSplash.userData.step(dt, new THREE.Vector3(0.08, 1.13, -0.02), 0.05, 0.4, -1.8);
        if (mandoOn && session?.step?.id === "slice" && session.holding) {
          sliceCount += dt;
          veg.position.z = 0.05 - Math.min(0.1, sliceCount * 0.015);
        }
        const g2 = session?.gauge;
        if (g2 && !g2.committed && session.step?.id === "dice") {
          // purely a readout side-effect of the shared gauge loop; no canvas here to repaint
          void g2;
        }
      },
    };
  },
};
