import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, tileFace, concreteFace, stainlessFace, reg,
} from "../citykit.js";
import { glassVacuumLifter, tapeMeasure } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Storefront Frame And Glass Set With Cups VR — Construction &
// Structural Trades, glaziers and architectural metal pack. Ground-level
// storefront glazing: the anodised aluminium frame is already up, and a
// tempered lite goes into it two-handed, one hand-cup each side, set on
// blocks, gasketed and beaded while the entry doors stand propped open to
// the sidewalk. Nothing here is far off the ground, which is exactly why it
// gets treated casually — a lite this size still weighs what it weighs, the
// door that is propped open is also a door that swings, and the sidewalk on
// the other side of that threshold has people on it who did not sign a
// tailboard.

const GLSF_ACCENT = 0xf2a33d;

export const SIM_GL_STOREFRONT_FRAME_AND_GLASS_SET_WITH_CUPS = {
  id: "gl-storefront-frame-and-glass-set-with-cups",
  index: "353",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 storefront and entrance systems",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials for the tempered entrance lite; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria for the stepladder work at the transom; the storefront system manufacturer's glazing details for setting-block location and gasket compression",
  name: "Storefront Frame And Glass Set With Cups",
  title: simTitle("Storefront Frame And Glass Set With Cups"),
  tagline: "Tailboard and PPE, the floor walked, the vacuum cups proven on scrap, the lite carried two-handed to the frame, blocked, gasketed and beaded, squared, and the sill's weeps checked clear",
  accent: GLSF_ACCENT,
  accentCss: "#f2a33d",
  parSeconds: 275,
  footprint: 2.1,
  badge: { id: "storefront-set-clean", name: "Storefront Set Clean", note: "A tempered entrance lite blocked, gasketed and beaded square in its frame with the sidewalk never put at risk while it was carried" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the lite catching the wind at the propped door is what you keep seeing",

  game: system({
    name: "Storefront Crew",
    currency: "PANE",
    ranks: ["Pre-apprentice", "Ground Hand", "Glazier", "Lead Glazier", "Storefront Certified"],
    badges: [
      { id: "cups-proven", name: "Cups Proven", note: "The vacuum cups tested on scrap before they carried the real lite", test: AWARD.stepClean("cups-check") },
      { id: "sidewalk-clear", name: "Sidewalk Clear", note: "No unsafe action toward the open threshold the whole run", test: AWARD.safe },
      { id: "square-true", name: "Square True", note: "The lite squared inside tolerance, first read", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "The lite set without a correction", test: AWARD.clean },
      { id: "held-in-rabbet", name: "Held In Rabbet", note: "The lite never came off the blocks before the first gasket lock was in", test: AWARD.unbroken },
      { id: "pane-in-time", name: "Pane In Time", note: "Set, sealed and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-lite-edge": "You picked the lite up by its bare edge instead of keeping both cups seated on the faces. A tempered storefront lite's edge is ground but not blunted, and the corner is exactly where the whole weight of the pane concentrates if a cup loses its seal; a hand on that edge when the lite shifts is a hand in the one place the glass actually cuts. The lite moves on its cups, gloved, or it stays on the A-frame.",
    "ladder-top-step": "You stood on the ladder's top step to reach the transom bar. The top step is not a step on this ladder — it is the part the label says never to stand on — and reaching past your own balance point at head height with a lite of glass nearby is exactly how a stepladder goes over sideways. The next rung down keeps your hips inside the rails where the ladder can actually catch you.",
    "prop-pinch": "You reached to catch the propped door instead of stepping clear of its swing. A storefront door under a closer is spring-loaded the moment its prop kicks loose, and a hand at the hinge side or the lock stile when that happens is a hand the door does not know is there. The door gets a new prop, or it gets watched from outside its swing — never caught by hand.",
    "lite-gust": "You carried the lite past the open threshold without a second set of hands steadying it. A gust through a propped storefront doorway meets almost four square feet of glass like a sail meets a door, and a lite that catches wind on cups alone will twist out of the seal before the carrier can plant their feet. Two people, cups seated, and the door prop checked before the lite ever clears the A-frame.",
  },

  lateNotes: {
    "entry-lite": "The lite leaves the A-frame after the cups are proven on scrap and the door prop is confirmed. A lite carried past an unchecked prop is a lite carried past a door that can still swing.",
    "sealant-gun": "Sealant goes on a lite already gasketed and blocked. A bead run against glass still shifting on its blocks pulls loose the first time the lite settles onto them.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — which bay is glazing, the sidewalk closure, who holds the door prop, the wind limit for carrying the lite — and sign it.",
      why: "The tailboard names which storefront bay is open to the sidewalk today and who is holding the door while the lite moves, because a ground-level job reads as low-risk right up until a lite meets a gust at an open threshold with pedestrians a metre away. Signing it is what makes today's plan the crew's plan rather than something assumed.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind at the open bay",
      cue: "Take the anemometer reading at the propped entrance and commit it inside the working band before the lite leaves the A-frame.",
      why: "A storefront bay with both doors propped open is a wind tunnel through the building, and a large tempered lite on hand cups alone has no rating for that funnel the way a crane's load chart rates a gust. A reading over the band means the doors get chocked shut and the lite waits, because carrying it through that gap on a guess is how a lite leaves the cups mid-carry.",
      gauge: { label: "WIND", speed: 0.68, green: [0.2, 0.5], readout: (t) => `${(t * 34).toFixed(0)} km/h`, missNote: "That reading is outside the working band at this doorway — over it, chock the doors and wait; under it, read it again at the threshold." },
    },
    {
      id: "ppe-seq", kind: "sequence",
      targets: ["cut-gloves", "safety-glasses", "work-boots"],
      itemNames: { "cut-gloves": "cut-resistant gloves", "safety-glasses": "safety glasses", "work-boots": "steel-toe work boots" },
      title: "Glove and glass up before the lite comes off the cart",
      cue: "Cut-resistant gloves, then safety glasses, then boots checked — in that order, before a hand goes near the A-frame.",
      why: "A ground-level glazing job still puts a hand on a ground edge and a foot under a lite that can slip, and the order matters because gloves go on before anything is touched, glasses before the first edge is broken free of the A-frame's felt, and boots are the last thing checked because they are the one item nobody remembers to look at once the gloves are already on.",
      outOfOrderNote: "Gloves, then glasses, then boots — the hand goes into a glove before it touches anything on the cart.",
    },
    {
      id: "floor-walk", kind: "find", noHint: true,
      targets: ["unchocked-frame", "floor-offcut"],
      itemNames: { "unchocked-frame": "the A-frame cart not chocked", "floor-offcut": "a glass offcut left on the floor" },
      itemNotes: {
        "unchocked-frame": "The A-frame cart's wheel is not chocked, and a cart of standing glass that rolls under its own lean is a cart that lays its whole load down.",
        "floor-offcut": "A sliver of tempered offcut is sitting on the floor by the threshold, exactly where the next foot lands carrying a lite.",
      },
      title: "Walk the bay before the lite moves",
      cue: "Look at the A-frame and the floor between it and the frame — click the two things wrong before anyone carries anything.",
      why: "The A-frame cart holds every lite on this job upright on its own lean, and an unchocked wheel turns that lean into a fall the moment someone brushes past it; the offcut on the floor is the kind of thing a boot finds by stepping on it while both hands are full of glass. Both get answered before the first lite comes off the cart.",
    },
    {
      id: "cups-check", kind: "select", target: "vacuum-cups",
      title: "Prove the vacuum cups on scrap before trusting them on the lite",
      cue: "Pump each cup on the scrap pane, watch the vacuum gauge settle, and confirm the release lever before the cups go anywhere near the entry lite.",
      why: "A hand cup that reads full vacuum on a clean face can still be carrying a nicked seal that bleeds down under load, and the way to find that out is on a piece of scrap nobody minds dropping — not on the tempered lite that is going into the frame. The release lever gets checked here too, because a cup that will not let go on command is its own kind of hazard once the lite is up against the rabbet.",
    },
    {
      id: "lite-drag", kind: "drag", target: "entry-lite",
      title: "Carry the lite from the A-frame to the frame opening",
      cue: "Both cups seated on the faces, two-handed, guide the lite from the A-frame to the storefront rabbet — not released until it is offered up square.",
      why: "The lite is carried face-on with both cups doing the holding, because a lite carried edge-first by hand is a lite with nothing between a slip and the floor. It goes to the rabbet square because a lite offered up skewed will not seat against the glazing stop without being forced, and forcing a tempered lite against an aluminium stop is how a corner chips before it is even set.",
      drag: { to: "storefront-rabbet", radius: 0.48, missNote: "Not square to the rabbet — a lite offered up crooked will not seat against the stop without forcing it." },
    },
    {
      id: "block-seq", kind: "sequence",
      targets: ["block-location", "block-durometer", "block-level"],
      itemNames: { "block-location": "setting blocks at the quarter points", "block-durometer": "correct durometer block for this lite", "block-level": "blocks checked level" },
      title: "Place the setting blocks",
      cue: "Blocks at the quarter points of the sill first, the right durometer for this lite's weight, then checked level — in that order.",
      why: "Setting blocks carry the lite's own dead weight without carrying it onto the gasket, and the manufacturer's glazing detail puts them at the quarter points because that is where a lite this size actually bears without rocking. The wrong durometer block crushes under the load or refuses to compress at all, and a block that is not level tips the lite a fraction of a degree that shows up as a jammed door the first cold morning.",
      outOfOrderNote: "Location, then durometer, then level — a block checked level before it is the right hardness for this lite is a check that means nothing.",
    },
    {
      id: "lite-hold", kind: "hold", target: "hold-point", seconds: 4,
      title: "Hold the lite plumb on the blocks while the first stop is set",
      cue: "Both hands on the cups, hold the lite flat against the rabbet while the first glazing stop is fitted — do not let go until it clicks home.",
      why: "Between the lite landing on the blocks and the first stop clicking in, the lite is held square by your grip on the cups and nothing else, and letting go early lets it rock forward off the blocks it just landed on. The stop is what turns the lite from something you are holding into something the frame is holding.",
      holdBreakNote: "You let go before the stop clicked home — the lite rocked forward off the blocks. Reseat it on the blocks and hold until the stop is in.",
    },
    {
      id: "gasket-roll", kind: "turn", target: "gasket-roller",
      title: "Roll the compression gasket into its groove",
      cue: "Feed the gasket into the glazing channel and turn the roller steadily around the full perimeter, no stretch, no slack.",
      why: "The gasket is what keeps water and wind load off the sealant and off the glass edge, and it has to go in at its own length rather than stretched, because a stretched gasket shrinks back after installation and opens a gap at the corner it was pulled tightest around. Rolled rather than pushed, it seats evenly instead of bunching at one point and starving the next.",
      turn: { turns: 1, axis: "z", label: "SEAT" },
    },
    {
      id: "sealant-track", kind: "track", target: "sealant-gun", seconds: 5,
      title: "Run the perimeter sealant bead",
      cue: "Gun at the exterior joint, run a continuous bead at a steady pace around the frame so the sealant fills to the depth the glazing detail calls for.",
      why: "The exterior bead is the storefront's actual weather seal, sitting outside a gasket that only manages compression; run too fast it skins over a gap, too slow it overfills and skins the gasket's own movement joint shut. The steady pace is what puts the manufacturer's specified depth of sealant against the frame the whole way round, on a joint at eye level that shows every flaw from the sidewalk.",
      track: { label: "BEAD", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.12, readout: (v) => `${Math.round(v * 20)} mm/s` },
      holdBreakNote: "The bead ran out of the band — a thin spot or an overfill at eye level on the storefront. Tool it out and run that stretch again at a steady pace.",
    },
    {
      id: "square-gauge", kind: "gauge", target: "square-gauge",
      title: "Check the lite square in its frame",
      cue: "Read the diagonal tape against the frame's own corners and commit inside tolerance.",
      why: "A storefront lite that is out of square is invisible from across the street and obvious the day the door beside it stops closing flush, because the same frame carries both. The diagonal reading is taken against the frame's own corners rather than a level, since it is the frame's geometry the lite has to match, not true vertical.",
      gauge: { label: "SQUARE mm", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.5) * 30).toFixed(1)} mm`, missNote: "Outside square tolerance against the frame corners — back to the blocks before the bead goes on." },
    },
    {
      id: "joint-seq", kind: "sequence",
      targets: ["bead-tool", "cap-bead"],
      itemNames: { "bead-tool": "the bead tooled", "cap-bead": "cap bead checked at the sill corners" },
      title: "Tool the bead and cap the sill corners",
      cue: "Tool the perimeter bead first, then a cap bead at each sill corner where the setting blocks sit.",
      why: "Tooling the bead presses it onto both the frame and the glass edge instead of leaving it sitting proud where it skins over a void, and the sill corners get a cap bead of their own because that is exactly where the setting blocks leave a gap in the main run — the one place water actually finds its way to the weeps if it is missed.",
      outOfOrderNote: "Tool the main run first, then the cap beads at the corners — capping a corner before the main bead is tooled just gets tooled over again.",
    },
    {
      id: "door-check", kind: "find", noHint: true,
      targets: ["loose-prop", "tape-down"],
      itemNames: { "loose-prop": "the door prop kicked loose", "tape-down": "barricade tape down at the sidewalk" },
      itemNotes: {
        "loose-prop": "The door prop has walked loose from foot traffic and the door is riding on its closer alone now — a spring waiting for a hand near the hinge.",
        "tape-down": "The barricade tape along the sidewalk has come off its stanchion on one end, and pedestrians are walking straight toward the threshold where the lite just went in.",
      },
      title: "Check the door and the sidewalk before the tools come off the sill",
      cue: "Look at the prop and the barricade tape — click the two things wrong before the crew steps back from the frame.",
      why: "The door prop and the sidewalk barricade are the two things standing between this finished bay and the public the whole time work continues around it, and both fail the same quiet way — a prop that walks loose, tape that comes off a stanchion nobody was watching. Neither gets left for the next person to notice.",
    },
    {
      id: "weep-check", kind: "select", target: "weep-holes",
      title: "Check the sill's weep holes are clear",
      cue: "Confirm the weep holes at the sill are open and clear of sealant before calling the bay finished.",
      why: "The weep holes are what lets water that gets past the gasket back out of the frame instead of pooling against the glass edge all winter, and a bead tooled a little too generously at the sill is exactly what plugs them — the one mistake in this whole install that shows up as a stained sill six months from now instead of today.",
    },
    {
      id: "log", kind: "select", target: "install-log",
      title: "Log the bay",
      cue: "Lite size, block durometer, square reading, wind readings and the faults found and fixed, and sign it.",
      why: "The log ties this lite's square reading and block spec to a date and a name, which is what the crew shows if a corner ever needs to be explained. It also carries the loose prop and the sidewalk tape as fixed rather than assumed, for whoever walks past this bay after the crew has moved down the strip.",
    },
  ],

  interrupts: [
    {
      id: "door-swing",
      kind: "The propped door swings",
      after: "lite-hold", delay: 3, seconds: 11,
      alert: "A gust has kicked the door prop loose and the storefront door is swinging shut on its closer while your hands are on the lite.",
      cue: "The door is loose and swinging on its own now.",
      target: "door-wedge",
      why: "A door on a closer with no prop holding it does exactly what the closer is built to do — shut, on its own schedule, regardless of whose hands are full at the time. A fresh wedge driven under it is what stops the swing without anyone reaching for the hinge side while the lite is still on the blocks.",
      missNote: "The door swung until it found the jamb on its own. Nobody's hand was near it this time. The closer does not know the crew has a lite on the blocks four feet away, and it will swing exactly the same way the next time the prop walks loose.",
      wrongNote: "It is the door wedge, driven in fresh. Stop the swing before anyone's hand is anywhere near that hinge.",
    },
    {
      id: "sidewalk-walker",
      kind: "Pedestrian toward the open bay",
      after: "sealant-track", delay: 3, seconds: 11,
      alert: "A pedestrian has stepped off the kerb toward the threshold where the barricade tape has come down, straight at the sealant work.",
      cue: "Someone from the sidewalk is walking toward the open bay.",
      target: "sidewalk-barrier",
      why: "The barricade tape is the only thing telling a pedestrian this threshold is not a doorway to walk through today, and tape down on one end reads as no barrier at all from the sidewalk side. Restringing it now is what turns a person about to walk into wet sealant and open tools into a person who sees the line before they cross it.",
      missNote: "The pedestrian walked up to the frame and looked in before anyone reached them. They stepped back on their own. The tape was down for exactly as long as it took someone to notice, and this time it was a person who noticed on their own rather than a hand on the sealant gun.",
      wrongNote: "It is the sidewalk barrier. Restring the tape before anyone else reaches this threshold.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, GLSF_ACCENT);

    // ------------------------------------------------------------ the floor
    const interior = box(g, 3.4, 0.06, 5.0, -1.6, 0.03, 0, 0xe8ecee, { rough: 0.5, cast: false });
    interior.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8 }), { repeat: 4, px: 384 }), { rough: 0.5, metal: 0.05 });
    const sidewalk = box(g, 3.4, 0.06, 5.0, 1.9, 0.03, 0, 0x8b8d89, { rough: 0.9, cast: false });
    sidewalk.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom" }), { repeat: 4, px: 384 }), { rough: 0.9, metal: 0.05 });

    // ------------------------------------------------------- the storefront
    const wall = group(g, 0.15, 0.06, 0);
    for (const sz of [-2.1, 2.1]) {
      const mullionSide = box(wall, 0.14, 3.0, 0.14, 0, 1.5, sz, 0x6b4a2e, { rough: 0.35, metal: 0.55 });
      mullionSide.material = texturedMat(surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, { base: "#6b4a2e", base2: "#4f3620" }), { repeat: 2, px: 256 }), { rough: 0.35, metal: 0.55 });
      // Already-glazed sidelites either side of the entry.
      box(wall, 0.02, 2.6, 1.4, 0, 1.5, sz + (sz > 0 ? 0.9 : -0.9), 0x9fd6e6, { rough: 0.12, metal: 0.1, opacity: 0.5, transparent: true, cast: false });
    }
    box(wall, 0.2, 0.16, 4.2, 0, 3.02, 0, 0x6b4a2e, { rough: 0.35, metal: 0.55, cast: false });   // head/transom bar
    box(wall, 0.2, 0.14, 4.2, 0, 0.05, 0, 0x6b4a2e, { rough: 0.4, metal: 0.55, cast: false });     // sill
    holoTag(wall, "Storefront elevation — Bay 3", 0, 3.5, 0, { css: "#f2a33d", w: 0.4 });

    // The transom above the entry, reached from a stepladder.
    const transom = group(wall, 0, 2.7, 0.85);
    box(transom, 0.9, 0.4, 0.03, 0, 0, 0, 0x9fd6e6, { rough: 0.12, metal: 0.1, opacity: 0.5, transparent: true, cast: false });
    const ladder = group(g, 0.5, 0.06, 1.0, 0.3);
    for (const sx of [-0.22, 0.22]) box(ladder, 0.04, 1.9, 0.04, sx, 0.95, 0, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(ladder, 0.44, 0.02, 0.04, 0, 0.2 + i * 0.36, 0, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    const topStep = box(ladder, 0.44, 0.02, 0.3, 0, 1.8, 0.1, 0xd2312b, { opacity: 0.4, transparent: true, cast: false });
    reg(hits, topStep, "ladder-top-step");
    holoTag(ladder, "top step — no", 0, 2.0, 0.1, { css: "#d2312b", w: 0.3 });

    // The frame opening the lite goes into, with the rabbet and stops.
    const opening = group(wall, 0, 1.5, 0);
    const rabbet = box(opening, 1.5, 2.4, 0.06, 0, 0, 0.06, 0xaeb5bb, { rough: 0.4, metal: 0.7 });
    hits["storefront-rabbet"] = rabbet;
    const blockA = group(opening, -0.5, -1.15, 0.08); box(blockA, 0.1, 0.06, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.6 }); reg(hits, blockA, "block-location");
    const blockB = group(opening, 0.5, -1.15, 0.08); box(blockB, 0.1, 0.06, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.6 }); reg(hits, blockB, "block-durometer");
    const blockC = group(opening, 0, -1.15, 0.08); box(blockC, 0.06, 0.06, 0.06, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }); reg(hits, blockC, "block-level");
    holoTag(opening, "setting blocks", 0, -1.35, 0.08, { css: "#f2a33d", w: 0.3 });
    const holdPoint = box(opening, 1.3, 1.0, 0.1, 0, 0.4, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, holdPoint, "hold-point");
    const gasketRoller = group(opening, 0.7, 0, 0.1);
    cyl(gasketRoller, 0.02, 0.02, 0.1, 0, 0, 0, 0x22262b, { rough: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, gasketRoller, "gasket-roller");
    holoTag(opening, "gasket roller", 0.7, 0.2, 0.1, { css: "#f2a33d", w: 0.24 });
    const squareGauge = instrument(opening, -0.7, 0.9, 0.15, { ry: 0.4, idle: "-- mm", color: 0xf2a33d });
    reg(hits, squareGauge, "square-gauge");
    holoTag(opening, "square gauge", -0.7, 1.15, 0.15, { css: "#f2a33d", w: 0.28 });
    const beadTool = group(opening, -0.7, -0.6, 0.12);
    box(beadTool, 0.02, 0.1, 0.02, 0, 0, 0, 0x22262b, { rough: 0.6 });
    reg(hits, beadTool, "bead-tool");
    const capBead = group(opening, 0.5, -1.1, 0.12);
    box(capBead, 0.1, 0.03, 0.03, 0, 0, 0, 0x4a4a4a, { rough: 0.7 });
    reg(hits, capBead, "cap-bead");
    const weeps = group(opening, 0, -1.19, 0.1);
    for (const wx of [-0.5, 0.5]) box(weeps, 0.03, 0.01, 0.06, wx, 0, 0, 0x1b1e22, { rough: 0.7 });
    reg(hits, weeps, "weep-holes");
    holoTag(opening, "weep holes", 0, -1.4, 0.1, { css: "#f2a33d", w: 0.24 });

    // ------------------------------------------------------------ the A-frame
    const aframe = group(g, -2.5, 0.06, -0.8, 0.2);
    box(aframe, 1.4, 0.05, 0.4, 0, 0.02, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    for (const sz of [-0.15, 0.15]) box(aframe, 1.4, 0.9, 0.03, 0, 0.47, sz, 0x50606c, { rough: 0.6, metal: 0.4 }).rotation.x = sz > 0 ? -0.35 : 0.35;
    const cartLites = [];
    for (let i = 0; i < 2; i++) { const l = box(aframe, 1.2, 1.3, 0.08, -0.1 + i * 0.1, 0.85, 0, 0x9fd6e6, { rough: 0.12, metal: 0.1, opacity: 0.5, transparent: true }); cartLites.push(l); }
    const entryLite = group(aframe, 0.2, 0.85, 0, 0.1);
    box(entryLite, 1.2, 1.3, 0.02, 0, 0, 0, 0xa8dcea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    reg(hits, entryLite, "entry-lite");
    const bareEdge = box(entryLite, 1.24, 0.05, 0.03, 0, 0.66, 0.015, 0xd2312b, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, bareEdge, "bare-lite-edge");
    holoTag(aframe, "entry lite — by the cups", 0.2, 1.6, 0, { css: "#f2a33d", w: 0.36 });
    const scrapLite = box(aframe, 0.4, 0.4, 0.02, -0.75, 0.4, 0, 0xa8dcea, { rough: 0.1, opacity: 0.5, transparent: true, cast: false });
    const wheel = cyl(aframe, 0.05, 0.05, 0.04, -0.65, 0.03, 0, 0x1b1e22, { rough: 0.7, seg: 12 });
    wheel.rotation.z = Math.PI / 2;
    reg(hits, wheel, "unchocked-frame");
    const offcut = box(g, 0.1, 0.01, 0.06, -1.4, 0.06, 0.3, 0xa8dcea, { rough: 0.2, opacity: 0.6, transparent: true, cast: false });
    reg(hits, offcut, "floor-offcut");

    // Vacuum cups (two-cup manual lifters) staged at the A-frame.
    glassVacuumLifter(g, -1.8, 0.9, -0.5, { ry: 0.6 });
    const cupsObj = glassVacuumLifter(g, -1.8, 0.9, -1.1, { ry: 0.6 });
    reg(hits, cupsObj, "vacuum-cups");
    holoTag(g, "cups — prove on scrap", -1.8, 1.15, -0.8, { css: "#f2a33d", w: 0.3 });

    // ------------------------------------------------------------ the doors
    const door = group(wall, -1.35, 0, 0.9, 0.5);
    box(door, 0.03, 2.3, 1.0, 0, 1.15, 0, 0x6b4a2e, { rough: 0.4, metal: 0.55 });
    box(door, 0.02, 2.2, 0.9, 0.02, 1.15, 0, 0x9fd6e6, { rough: 0.12, metal: 0.1, opacity: 0.5, transparent: true, cast: false });
    const hingeZone = box(door, 0.1, 2.3, 0.15, -0.02, 1.15, -0.42, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hingeZone, "prop-pinch");
    const thresholdGust = box(g, 1.7, 2.0, 0.5, -1.0, 1.0, 1.1, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, thresholdGust, "lite-gust");
    const prop = group(g, -0.7, 0.06, 1.7);
    box(prop, 0.06, 0.08, 0.2, 0, 0.04, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, prop, "loose-prop");
    holoTag(g, "door prop", -0.7, 0.3, 1.7, { css: "#f2a33d", w: 0.24 });
    const wedge = group(g, -0.7, 0.06, 1.4);
    box(wedge, 0.06, 0.08, 0.2, 0, 0.04, 0, 0x8a7449, { rough: 0.7 });
    wedge.visible = false;
    reg(hits, wedge, "door-wedge");

    // ------------------------------------------------------------ sidewalk
    const barrier = group(g, 3.0, 0.06, 0, 0.4);
    box(barrier, 0.05, 0.9, 0.05, -1.5, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    box(barrier, 0.05, 0.9, 0.05, 1.5, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const tape = box(barrier, 3.0, 0.06, 0.01, 0, 0.85, 0, 0xf2c14b, { rough: 0.6, cast: false });
    reg(hits, tape, "tape-down");
    holoTag(barrier, "barricade tape", 0, 1.1, 0, { css: "#f2a33d", w: 0.3 });
    const sidewalkBarrier = group(g, 2.6, 0.06, -0.4);
    box(sidewalkBarrier, 0.5, 0.02, 0.9, 0, 0.86, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sidewalkBarrier, "sidewalk-barrier");
    const walker = standingFigure(g, 3.3, -1.6, { ry: -1.0, cloth: 0x3a5a6e, trousers: 0x2b2f34, outfit: "office" });
    const anemometer = instrument(g, 2.4, 1.1, 1.6, { ry: -0.4, idle: "-- km/h", color: 0xf2a33d, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(g, "anemometer", 2.4, 1.4, 1.6, { css: "#f2a33d", w: 0.26 });

    // ------------------------------------------------------------ tools and boards
    const gun = group(g, -0.6, 0.1, -1.8, -0.3);
    cyl(gun, 0.025, 0.025, 0.24, 0, 0, 0, 0xf2a33d, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(gun, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, gun, "sealant-gun");
    holoTag(g, "sealant gun", -0.6, 0.35, -1.8, { css: "#f2a33d", w: 0.24 });
    tapeMeasure(g, -2.1, 0.06, -1.6, { ry: 0.3 });
    const ppeBox = group(g, -2.6, 0.06, 0.6);
    box(ppeBox, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x2b2f34, { rough: 0.8 });
    const gloves = box(ppeBox, 0.2, 0.03, 0.14, 0, 0.16, 0, 0x1b2026, { rough: 0.9 });
    reg(hits, gloves, "cut-gloves");
    const glasses = box(ppeBox, 0.14, 0.03, 0.05, 0, 0.19, 0.05, 0x2b7bbf, { rough: 0.3, opacity: 0.6, transparent: true });
    reg(hits, glasses, "safety-glasses");
    const boots = box(g, 0.3, 0.14, 0.14, -2.6, 0.07, 0.9, 0x1b1e22, { rough: 0.85 });
    reg(hits, boots, "work-boots");

    const tailboard = group(g, -2.7, 0.7, 1.6, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — BAY 3", ["Bay: storefront entry, bay 3", "Sidewalk: barricaded", "Wind limit: per plan at the doorway", "Door prop: checked, held clear", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#f2a33d" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -2.7, 1.25, 1.6, { css: "#f2a33d", w: 0.22 });
    const logBoard = group(g, 2.9, 0.7, 1.7, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("INSTALL LOG — BAY 3", ["Lite: ____", "Blocks: ____", "Square: ____", "Wind: ____", "Signed: ____"], { bg: "#f4efe4", band: "#f2a33d" }), { px: 256 });
    reg(hits, logFace, "install-log");
    holoTag(g, "install log", 2.9, 1.15, 1.7, { css: "#f2a33d", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -2.9, 1.7, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "#1a1206"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2a33d"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fbeed8";
      ctx.fillText("GLAZING DETAIL — BAY 3", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Lite: tempered, per Z97.1", "Blocks: per the manufacturer's chart", "Gasket: compression, no stretch", "Sealant: listed silicone, per drawing depth", "Weeps: clear before close-out"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLSF_ACCENT, ry: 0.5, stalk: true });

    // ----------------------------------------------------------- the crew
    const journeyman = standingFigure(g, -0.3, -1.3, { ry: 2.4, cloth: 0x8a5a2e, trousers: 0x2b2f34, helmet: 0xf2a33d, vest: 0xf2c14b, gloves: true });
    const helper = standingFigure(g, 0.5, -1.3, { ry: 2.6, cloth: 0x3a5a6e, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b });

    // --------------------------------------------------------- dressing
    for (const [x, z] of [[2.8, -2.1], [2.8, 2.1]]) cone(g, x, z);

    let holdingLite = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.5, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lite-drag") { entryLite.parent.remove(entryLite); opening.add(entryLite); entryLite.position.set(0, 0, 0.08); entryLite.rotation.set(0, 0, 0); }
        if (step.id === "floor-walk") { wheel.material = mat(0x1b1e22, { rough: 0.7 }); offcut.visible = false; }
        if (step.id === "gasket-roll") { gasketRoller.rotation.z = Math.PI; }
        if (step.id === "joint-seq") { beadTool.rotation.y = 0.4; }
        if (step.id === "door-check") { prop.position.set(-1.35, 0, 1.35); tape.material = mat(0xf2c14b, { rough: 0.6 }); }
        if (step.id === "log") repaint(logFace, paperFace("INSTALL LOG — BAY 3", ["Lite: bay 3 entry, tempered", "Blocks: per chart, pass", "Square: 0.4 mm", "Wind: 10–14 km/h", "Signed: apprentice / journeyman"], { bg: "#f4efe4", band: "#f2a33d" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "door-swing") { door.rotation.y = -0.9; prop.position.set(-0.9, 0, 1.9); }
        if (it.id === "sidewalk-walker") { walker.position.set(2.2, 0, -0.4); walker.rotation.y = 2.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "door-swing") { door.rotation.y = 0.5; wedge.visible = true; }
        if (it.id === "sidewalk-walker") { walker.position.set(3.3, 0, -1.6); walker.rotation.y = -1.0; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingLite = !!(step?.id === "lite-hold" && session.holding);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 34).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "square-gauge") {
          repaint(squareGauge.userData.screen, signFace(`${((gg.t - 0.5) * 30).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "sealant-track") { /* bead visual kept simple on this station */ }
        if (holdingLite) entryLite.position.z = 0.08 + Math.sin(t * 3) * 0.003;
      },
    };
  },
};
