import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace, gravelFace, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hot Asphalt Kettle & Mop VR — Construction & Structural
// Trades, the Roofers and Waterproofers pack.
//
// A built-up roof (BUR) mid-course: felt plies lapped and mopped down with
// hot asphalt hoisted up from the kettle staged below, working toward a
// gravel-surfaced flood coat. The learner runs the kettle and the mop. A
// generic building, a generic kettle; no manufacturer or contractor is named.

const HAK_PAL = palette("construction");
const HAK_ACCENT = HAK_PAL.accent;
const HAK_CSS = "#f2c14b";

export const SIM_RF_HOT_ASPHALT_KETTLE_AND_MOP = {
  id: "rf-hot-asphalt-kettle-and-mop",
  index: "rf3",
  domain: "Construction & Structural Trades",
  trade: "Roofer running a hot asphalt kettle and hot-mopping a built-up roof toward a gravel flood coat",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection at the roof edge, and 29 CFR 1926 Subpart M Fall protection generally; NFPA 51B and 29 CFR 1910.252 for the kettle's open flame and the fire watch it needs; ANSI Z359 for the harness and anchor; NRCA kettle and tanker safety practice; Roofers Local 40 apprenticeship and training",
  name: "Hot Asphalt Kettle & Mop",
  title: simTitle("Hot Asphalt Kettle & Mop"),
  tagline: "The kettle plan read, harness clipped, the shield, valve and a felt block checked, the asphalt brought to temperature, the burner lit, a bucket hoisted steady, the felt mopped at a steady rate and its coverage checked, the lap confirmed, gravel embedded in the flood coat, the kettle shut down and logged, with a gust pushing the flame at a felt stack and the kettle foaming without warning along the way",
  accent: HAK_ACCENT,
  accentCss: HAK_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "kettle-run-clean", name: "Kettle Run Clean", note: "A course mopped to coverage, a flareup and a foamover both caught, and nobody carried hot asphalt against their body to do it" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Kettle Watch",
    currency: "MOP",
    ranks: ["Apprentice", "Kettle Hand", "Mop Runner", "Lead Kettleman", "Kettle Safety Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The kettle plan read before the burner was ever lit", test: AWARD.stepClean("kettle-plan") },
      { id: "steady-mop", name: "Steady Mop", note: "The mop swept the whole course without a break in pace", test: AWARD.unbroken },
      { id: "never-carried-close", name: "Never Carried Close", note: "No lugger overfilled, no ladder unsecured, no hoist grabbed by hand", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-course", name: "Clean Course", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "on-the-evt", name: "On The EVT", note: "The asphalt temperature committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "course-closed", name: "Course Closed", note: "Kettle shut down inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "ladder-unsecured": "You are about to climb the extension ladder to the roof without it tied off or footed at the base. 29 CFR 1926.1053's requirement to secure a ladder at the top and foot it at the bottom exists because a ladder carrying a roofer and a hot lugger bucket is exactly the load that kicks a loose base out from under someone, and it happens on the way up, not while anyone is watching for it.",
    "overfilled-lugger": "That lugger bucket is filled above its safe line and you are about to carry it against your hip to save a trip. Hot asphalt at working temperature slops out of an overfilled bucket with every step, and carried close to the body it lands on skin rather than the deck. NRCA's kettle practice fills a lugger to its marked line and carries it at arm's length precisely so a slop has somewhere to fall that is not a person.",
    "no-fume-hood": "The kettle's fume hood is folded back and the flue is running open right where you are standing to check the brew. Asphalt fumes off a running kettle are a known respiratory irritant, and the hood exists to route them up and away from exactly the spot the kettleman stands — folded back, that spot is the one place on the roof the fumes are thickest.",
    "hoist-swinging": "The loaded hoist bucket is swinging on its rope in the gust and you are about to steady it by grabbing it with your hand. A bucket of hot asphalt in motion does not stop because a hand is in its way — it transfers its swing into whatever it hits. A tag line steadies a swinging load; a bare hand next to one just adds a burn to the near miss.",
  },

  lateNotes: {
    "kettle-burner": "The burner lights once the plan has been read and the shield, valve and block have all been checked — not before.",
    "coverage-scale": "Coverage is read once the mop has actually passed over that stretch of felt — there is nothing to check yet.",
    "log-board": "The log is written after the kettle is shut down, not while it is still running.",
  },

  steps: [
    {
      id: "kettle-plan", kind: "select", target: "plan-board",
      title: "Read the kettle's siting and safe-operation plan",
      cue: "Read the plan: the kettle's distance from combustibles and the building, the wind screen, the extinguisher at hand, and the PPE required to work it.",
      why: "A kettle is an open flame under a vat of asphalt held well above its flash point, and NRCA's kettle and tanker safety guidance sites it a set distance from anything that burns, with a wind screen, an extinguisher and a fire watch before it is ever lit — the same open-flame logic NFPA 51B applies to a torch, applied to a much larger fire if it ever gets away.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the edge where the hoist lands.",
      why: "The hoist lands its bucket right at the edge, which is exactly where a roofer reaching for a swinging load is most exposed. 29 CFR 1926.502 makes the anchor, harness and connection one rated system, snugged before it is clipped, so reaching for the hoist is not the moment the harness turns out to be loose.",
    },
    {
      id: "kettle-inspect", kind: "find", noHint: true,
      targets: ["cracked-faceshield", "kettle-relief-stuck", "damp-block"],
      itemNames: { "cracked-faceshield": "a cracked face shield on the PPE rack", "kettle-relief-stuck": "the kettle's high-limit thermostat stuck at its last reading", "damp-block": "a damp block of asphalt in the next batch to load" },
      itemNotes: {
        "cracked-faceshield": "The face shield on the rack has a crack straight across the lens — it will not stop a splash of hot asphalt from reaching the eyes, which is the one thing it is worn for.",
        "kettle-relief-stuck": "The high-limit thermostat's needle has not moved off its last reading since the kettle was lit yesterday — stuck there, it will not cut the burner if today's brew runs away past a safe temperature.",
        "damp-block": "One block in the next batch feels damp to the touch. Moisture trapped inside a block of asphalt flashes to steam the instant it hits the kettle's hot brew, and that steam can throw hot asphalt out of the kettle before anyone standing nearby has time to react.",
      },
      title: "Inspect the PPE, the kettle and the next batch before lighting",
      cue: "Check the face shield and gauntlets on the rack, the kettle's high-limit thermostat, and feel the next batch of blocks for dampness.",
      why: "A kettle's failure modes are almost all invisible until the moment they are not: a stuck thermostat gives no warning that the burner has stopped answering it, and a damp block looks exactly like a dry one until it hits the brew. Checking all three before the burner is lit is the only point in the day none of them has had a chance to hurt anyone yet.",
    },
    {
      id: "kettle-temp", kind: "gauge", target: "kettle-temp",
      title: "Bring the asphalt to its working temperature",
      cue: "Read the kettle's thermometer and commit once the asphalt sits in the manufacturer's equiviscous temperature band.",
      why: "Asphalt mopped too cool sets before it bonds the felt, leaving plies that lift the first time the roof flexes; mopped too hot, it oxidizes fast and loses the adhesion it was heated for in the first place, while running closer to its flash point the whole time. The manufacturer's band is the temperature the material was actually designed to be applied at.",
      gauge: {
        label: "KETTLE — ASPHALT TEMPERATURE", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => `${Math.round(350 + t * 200)} °F`,
        missNote: "Off the manufacturer's equiviscous temperature band. Let it settle and read it again before the first bucket is hoisted.",
      },
    },
    {
      id: "kettle-burner", kind: "turn", target: "kettle-burner",
      title: "Open the burner valve and light the kettle",
      cue: "Open the burner's fuel valve and light it with the wind screen already in place around the flame.",
      why: "The wind screen goes up before the flame does, not after, because a kettle burner lit into an open gust is a flame with no idea which way it is about to lean. Lighting it with the screen already around it is what keeps the first few seconds of an open flame from being the ones nobody had prepared for.",
      turn: { turns: 0.4, axis: "z", label: "BURNER VALVE", readout: (t) => (t < 0.5 ? "closed" : "lit") },
    },
    {
      id: "hoist-bucket", kind: "hold", target: "hoist-winch", seconds: 5,
      title: "Hoist the lugger bucket up to the roof, steady",
      cue: "Take up the hoist rope at a steady rate and hold it smooth all the way to the roof edge — no jerking, no letting it swing.",
      why: "A hot lugger raised in fits and starts swings further with every jerk, and a swinging bucket of asphalt at working temperature is a load nobody wants to be standing under or reaching for. A steady, continuous pull is what keeps the bucket's swing small enough that it lands where the tender is actually standing.",
      holdBreakNote: "The hoist stopped partway and the bucket started swinging on the rope — take up the pace again smooth and steady rather than in jerks.",
    },
    {
      id: "mop-cart", kind: "drag", target: "mop-cart",
      title: "Bring the mop cart to the next course",
      cue: "Wheel the loaded mop bucket and mop out to the chalked lap line for the next felt course.",
      why: "The lap line is where the plan's overlap is measured from, and getting the mop cart set up there before pouring keeps the first stroke of hot asphalt landing exactly where the felt actually needs it rather than wherever the cart happened to stop.",
      drag: { to: "lap-line", radius: 0.55, missNote: "Not on the lap line. Wheel the mop cart all the way out to the chalk mark before pouring." },
    },
    {
      id: "mop-sweep", kind: "track", target: "mop-handle", seconds: 6,
      title: "Mop the felt at a steady pace",
      cue: "Pour and spread the hot asphalt at a steady pace across the felt — too slow pools and cools, too fast starves the coverage.",
      why: "Hot asphalt is only a bonding agent while it is still hot and evenly spread; poured too slowly it cools into ridges before the felt is unrolled over it, and swept too fast it starves whole patches of the coverage weight the specification calls for. A steady pace is what keeps the mop laying an even, full bed the whole length of the course.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "MOP SWEEP RATE", readout: (v) => (v < 0.4 ? "too slow — cooling" : v > 0.62 ? "too fast — starved" : "even coverage") },
      holdBreakNote: "The sweep broke out of the steady band. Bring the mop back to a steady pace before the bed cools unevenly.",
    },
    {
      id: "coverage-check", kind: "gauge", target: "coverage-scale",
      title: "Check the interply mopping coverage",
      cue: "Weigh the coverage sample and commit once it sits inside the specification's pounds-per-square band.",
      why: "A mopped course that looks solid can still be light on weight per square, and a light interply mopping is a ply that is not actually bonded to the one below it — a fact that only shows up later as a blister or a lifted lap. The scale is what turns 'looks about right' into a number the specification actually asks for.",
      gauge: {
        label: "INTERPLY COVERAGE", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => `${Math.round(t * 40)} lb/square`,
        missNote: "Off the specification's coverage band. Mop the light stretch again before it cools past re-working.",
      },
    },
    {
      id: "felt-lap", kind: "select", target: "felt-lap",
      title: "Confirm the felt lap before the next ply",
      cue: "Check the new felt ply's overlap against the plan before the next course is mopped over it.",
      why: "Every ply's overlap is what makes a built-up roof one continuous membrane instead of a stack of separate sheets, and a lap that has drifted narrow in one course keeps drifting narrower in every course mopped on top of it until water finds the gap.",
    },
    {
      id: "gravel-embed", kind: "drag", target: "gravel-hopper",
      title: "Embed gravel into the hot flood coat",
      cue: "Wheel the gravel hopper over the flood coat while it is still hot and spread the aggregate evenly into it.",
      why: "Gravel only bonds into a flood coat while the asphalt underneath it is still hot enough to grip the stone — spread it after the coat has skinned over and the surfacing just sits loose, ready to migrate to the drains the first time it rains.",
      drag: { to: "flood-coat", radius: 0.55, missNote: "Not over the flood coat. Wheel the hopper out while the coat is still hot enough to embed the gravel." },
    },
    {
      id: "kettle-shutdown", kind: "turn", target: "kettle-burner",
      title: "Shut the burner down at the end of the course",
      cue: "Close the burner valve and let the kettle stand covered rather than leaving the flame running unattended.",
      why: "A kettle left running with nobody watching it is a fire waiting for whatever changes first — the wind, the fuel level, a stack of felt rolled too close. Shutting the burner down the moment the day's mopping is done is the difference between an attended flame and an unattended one.",
      turn: { turns: 0.25, axis: "z", reverse: true, label: "BURNER VALVE", readout: (t) => (t < 0.95 ? "LIT" : "OFF") },
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log the course, the finds and the coverage",
      cue: "Write the cracked shield replaced, the thermostat serviced, the damp block rejected, and the coverage readings into the log.",
      why: "A kettle that ran clean today is only proof of that for the crew that watched it; the log is what tells tomorrow's kettleman the thermostat was already serviced once and the coverage held its number, instead of them finding both things out the hard way.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the hoist tender and the ground",
      cue: "Radio the hoist tender and the ground crew: the kettle is shut down, the course is logged, and name the support line.",
      why: "The hoist tender has spent the whole course watching a rope with a hot load on the end of it, and a short check-in when the kettle goes cold is what lets them stand down knowing the burner they cannot see from the ground is actually out.",
    },
  ],

  interrupts: [
    {
      id: "kettle-flareup",
      kind: "Gust pushes the flame toward the felt stack",
      after: "kettle-burner", delay: 2, seconds: 14,
      alert: "A gust off the parapet pushes the burner's flame sideways, leaning it toward the stack of felt rolls staged a few feet away.",
      cue: "Pull the wind screen around to block the gust before the flame reaches the felt.",
      target: "wind-screen",
      why: "A kettle's flame is only ever a gust away from leaning into whatever is downwind of it, which is exactly why NRCA's kettle siting practice keeps combustibles clear and a wind screen at hand — the screen is not decoration, it is the one thing standing between a normal gust and a stack of felt catching alight.",
      missNote: "The flame kept leaning into the felt stack until the outer roll started to scorch — a few more seconds and the stack itself would have been alight.",
      wrongNote: "That does not block the wind. Pull the screen around the burner before the flame reaches the felt.",
    },
    {
      id: "kettle-foaming",
      kind: "Kettle foaming over",
      after: "mop-sweep", delay: 3, seconds: 14,
      alert: "The kettle starts foaming hard over its rim — a pocket of moisture nobody caught has hit the brew.",
      cue: "Back off and hit the kettle's emergency shutoff — do not add anything to a foaming kettle.",
      target: "kettle-eshutoff",
      why: "A foaming kettle is asphalt and steam trying to occupy the same space at once, and it can throw hot material well past the kettle's own rim while it works itself out. NRCA's kettle safety practice is unambiguous here: back away, cut the heat at the emergency shutoff, and let it settle — never add cold material or water to a kettle that is already foaming.",
      missNote: "The foam kept climbing over the rim while nobody backed away from it — exactly the moment a kettle throws hot asphalt furthest from where anyone expected it to land.",
      wrongNote: "Not that. Back off and hit the emergency shutoff — nothing else stops a kettle that is already foaming.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, HAK_ACCENT);

    // ------------------------------------------------------------ roof deck: BUR felt, gravel flood coat, parapet
    const burTex = surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#332d27", base2: "#2a251f", lanes: 0 }), { repeat: 3, px: 448 });
    const deck = box(g, 6.4, 0.24, 5.6, 0, 0.12, 0, 0xffffff);
    deck.material = texturedMat(burTex, { rough: 0.9, metal: 0.03, color: 0xb0a294 });
    deck.receiveShadow = true;
    const gravelTex = surfaceTexture((cx, w, h) => gravelFace(cx, w, h, { base: "#6b665c", base2: "#5e5a51" }), { repeat: 3, px: 384 });
    const floodCoat = box(g, 2.6, 0.02, 2.6, -1.6, 0.251, -1.4, 0xffffff);
    floodCoat.material = texturedMat(gravelTex, { rough: 0.95, metal: 0.02, color: 0x9a9488 });
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.6, pd, px, 0.54, pz, 0xffffff);
      wall.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a99c8b", tone2: "#988c7c" }), { repeat: 2, px: 256 }), { rough: 0.85, metal: 0.02, color: 0xc6bcae });
      box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.87, pz, 0x8b949d, { rough: 0.5, metal: 0.5 });
    }
    const flagHit = box(g, 2.6, 0.05, 2.6, -1.6, 0.28, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["flood-coat"] = flagHit;

    const layoutMark = box(g, 3.0, 0.012, 0.7, 0.4, 0.246, 0.6, 0xd8c88a, { opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "lap line", 0.4, 0.4, 0.6, { css: HAK_CSS, w: 0.2 });
    reg(hits, layoutMark, "lap-line");
    const lapCheck = box(g, 0.4, 0.02, 0.7, 1.6, 0.251, 0.6, 0xa89070, { rough: 0.7 });
    reg(hits, lapCheck, "felt-lap");

    // ------------------------------------------------------------ ladder access
    const ladder = group(g, -2.7, 0.24, 2.4, -0.3);
    for (const sx of [-0.24, 0.24]) cyl(ladder, 0.025, 0.025, 2.2, sx, 1.1, 0, 0xd9a441, { rough: 0.5, metal: 0.4, seg: 8 });
    for (let i = 0; i < 8; i++) box(ladder, 0.4, 0.03, 0.03, 0, i * 0.28, 0, 0xd9a441, { rough: 0.5 });
    holoTag(ladder, "extension ladder — secured?", 0, 2.5, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, ladder, "ladder-unsecured");

    // ------------------------------------------------------------ kettle, burner, hoist, felt stack
    const kettleYard = group(g, 2.2, 0.24, -1.7);
    cyl(kettleYard, 0.4, 0.42, 0.6, 0, 0.3, 0, HAK_PAL.structure, { rough: 0.55, metal: 0.4, seg: 20 });
    const kettleLid = cyl(kettleYard, 0.42, 0.42, 0.04, 0, 0.62, 0, 0x3a3f45, { rough: 0.5, metal: 0.5, seg: 20 });
    void kettleLid;
    const flue = cyl(kettleYard, 0.06, 0.06, 0.5, 0.3, 0.85, 0, 0x2b2f33, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(kettleYard, "kettle flue — hood down?", 0.3, 1.2, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, flue, "no-fume-hood");
    const burnerBox = group(kettleYard, 0, -0.02, 0.42);
    box(burnerBox, 0.2, 0.14, 0.1, 0, 0.07, 0, 0x2b2b30, { rough: 0.5 });
    const burnerHandle = box(burnerBox, 0.03, 0.08, 0.02, 0.08, 0.12, 0.05, HAK_PAL.accent, { rough: 0.5 });
    burnerBox.userData.wheel = burnerHandle;
    holoTag(burnerBox, "burner valve", 0, 0.24, 0, { css: HAK_CSS, w: 0.26 });
    reg(hits, burnerBox, "kettle-burner");
    const flame = ball(burnerBox, 0.05, 0, 0.02, -0.06, 0x4fa8ff, { emissive: 0x4fa8ff, ei: 3.0, seg: 10 });
    flame.visible = false;
    const tempFace = decal(kettleYard, 0.14, 0.06, 0, 0.72, 0, signFace("-- °F", { bg: "#0d1c24", accent: HAK_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 160 });
    reg(hits, tempFace, "kettle-temp");
    const eStop = group(kettleYard, -0.32, 0.4, 0.28);
    cyl(eStop, 0.05, 0.05, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(eStop, "emergency shutoff", 0, 0.12, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, eStop, "kettle-eshutoff");
    const foam = particles(g, 40, 0xd8cdb8, { size: 0.05, life: 1.0, opacity: 0.6 });
    foam.position.set(2.2, 0.7, -1.7);
    foam.visible = false;
    const splatter = box(g, 0.5, 0.01, 0.5, 2.2, 0.246, -1.35, 0x1c1815, { rough: 0.9, cast: false });
    splatter.visible = false;
    const screen = group(g, 2.2, 0.24, -2.1);
    box(screen, 1.1, 0.55, 0.03, 0, 0.28, 0, HAK_PAL.trim, { rough: 0.6, metal: 0.3 });
    screen.visible = false;
    const screenRoll = group(g, 3.1, 0.24, -2.1);
    cyl(screenRoll, 0.06, 0.06, 0.55, 0, 0.28, 0, HAK_PAL.trim, { rough: 0.6, metal: 0.3, seg: 12 });
    holoTag(screenRoll, "wind screen", 0, 0.6, 0, { css: HAK_CSS, w: 0.26 });
    reg(hits, screenRoll, "wind-screen");
    const feltStack = group(g, 3.1, 0.24, -1.2);
    for (let i = 0; i < 3; i++) { const r = cyl(feltStack, 0.15, 0.15, 0.9, i * 0.32, 0.15, 0, 0x2a2420, { rough: 0.85, seg: 14 }); r.rotation.z = Math.PI / 2; }
    holoTag(feltStack, "felt roll stack", 0.32, 0.4, 0, { css: HAK_CSS, w: 0.28 });
    const scorchMark = box(feltStack, 0.12, 0.1, 0.9, 0, 0.15, 0, 0x14100c, { rough: 1.0 });
    scorchMark.rotation.z = Math.PI / 2;
    scorchMark.visible = false;

    // Hoist winch and swinging bucket.
    const winch = group(g, 1.4, 0.24, 1.2, 0.5);
    cyl(winch, 0.06, 0.06, 0.4, 0, 0.2, 0, HAK_PAL.trim, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(winch, "hoist winch", 0, 0.5, 0, { css: HAK_CSS, w: 0.26 });
    reg(hits, winch, "hoist-winch");
    const bucketLine = hose(g, [[1.4, 3.2, 1.2], [1.4, 1.0, 1.2]], 0.01, 0x2b2b30, { steps: 8, rough: 0.7 });
    void bucketLine;
    const bucket = group(g, 1.4, 0.9, 1.2);
    cyl(bucket, 0.15, 0.12, 0.3, 0, 0.15, 0, 0x2b2f33, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(bucket, "steady the swinging bucket by hand?", 0, 0.5, 0, { css: "#d2312b", w: 0.56 });
    reg(hits, bucket, "hoist-swinging");
    const lugger = group(g, 0.6, 0.24, 1.0);
    cyl(lugger, 0.12, 0.1, 0.22, 0, 0.11, 0, 0x2b2f33, { rough: 0.5, metal: 0.5, seg: 14 });
    holoTag(lugger, "overfilled lugger — carry close?", 0, 0.4, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, lugger, "overfilled-lugger");

    // Mop cart, gravel hopper.
    const mopCart = group(g, -0.6, 0.24, 1.5, 0.4);
    box(mopCart, 0.5, 0.05, 0.7, 0, 0.03, 0, HAK_PAL.trim, { rough: 0.6, metal: 0.5 });
    cyl(mopCart, 0.22, 0.2, 0.35, -0.1, 0.22, 0, 0x2b2b30, { rough: 0.5, metal: 0.4, seg: 16 });
    for (const [sx, sz] of [[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]]) cyl(mopCart, 0.04, 0.04, 0.03, sx, 0.02, sz, 0x1b1e22, { rough: 0.7, seg: 12 });
    holoTag(mopCart, "mop cart", 0, 0.55, 0, { css: HAK_CSS, w: 0.22 });
    reg(hits, mopCart, "mop-cart");
    const mopHandle = group(g, 0.2, 0.3, 0.6, 0.5);
    cyl(mopHandle, 0.015, 0.02, 0.8, 0, 0.02, 0, 0x8a7048, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    box(mopHandle, 0.2, 0.03, 0.1, 0, 0.02, -0.42, 0x2b2b30, { rough: 0.6 });
    holoTag(mopHandle, "mop", 0, 0.16, 0, { css: HAK_CSS, w: 0.2 });
    reg(hits, mopHandle, "mop-handle");
    const seamBead = box(g, 1.5, 0.015, 0.15, 0.4, 0.248, 0.62, 0x2a221a, { rough: 0.4 });
    seamBead.visible = false;
    const scale = group(g, -1.4, 0.24, 0.9);
    box(scale, 0.2, 0.03, 0.2, 0, 0.015, 0, 0x2b2b30, { rough: 0.5 });
    const scaleFace = decal(scale, 0.12, 0.06, 0, 0.09, 0, signFace("-- lb/sq", { bg: "#0d1c24", accent: HAK_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 160 });
    holoTag(scale, "coverage scale", 0, 0.2, 0, { css: HAK_CSS, w: 0.28 });
    reg(hits, scaleFace, "coverage-scale");

    const hopper = group(g, -2.4, 0.24, -0.5, 0.3);
    box(hopper, 0.5, 0.4, 0.5, 0, 0.24, 0, HAK_PAL.trim, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.2, -0.2], [0.2, -0.2]]) cyl(hopper, 0.04, 0.04, 0.03, sx, 0.02, sz, 0x1b1e22, { rough: 0.7, seg: 12 });
    holoTag(hopper, "gravel hopper", 0, 0.5, 0, { css: HAK_CSS, w: 0.24 });
    reg(hits, hopper, "gravel-hopper");

    // ------------------------------------------------------------ crew, chest, boards
    const tender = standingFigure(g, 1.6, 1.9, { ry: -0.6, vest: 0xd8f23a, helmet: HAK_PAL.accent, gloves: true, harness: true });
    holoTag(tender, "hoist tender", 0, 2.0, 0, { css: HAK_CSS, w: 0.3 });
    const chest = toolChest(g, -2.0, 1.0, { ry: 2.2, color: HAK_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: HAK_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, -0.6, 0.24, -0.6);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, HAK_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: HAK_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const ppeRack = group(g, -2.7, 0.24, 0.9, 0.3);
    box(ppeRack, 0.3, 0.35, 0.03, 0, 0.4, 0, 0xe4e8e9, { rough: 0.4, opacity: 0.5, transparent: true });
    const shield = box(ppeRack, 0.28, 0.02, 0.02, 0, 0.42, 0.02, 0x8a4a2a, { rough: 0.7 });
    holoTag(ppeRack, "face shield + gauntlets", 0, 0.65, 0, { css: HAK_CSS, w: 0.4 });
    reg(hits, shield, "cracked-faceshield");
    const relief = box(kettleYard, 0.06, 0.08, 0.04, -0.3, 0.5, 0.1, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    reg(hits, relief, "kettle-relief-stuck");
    const blockPile = group(g, -1.9, 0.24, -0.9);
    for (let i = 0; i < 4; i++) box(blockPile, 0.18, 0.16, 0.18, (i % 2) * 0.2, 0.08 + Math.floor(i / 2) * 0.17, (i % 2) * 0.05, 0x1c1815, { rough: 0.85 });
    holoTag(blockPile, "asphalt blocks", 0.1, 0.5, 0, { css: HAK_CSS, w: 0.26 });
    const dampBlock = box(blockPile, 0.18, 0.16, 0.18, 0.2, 0.25, 0.05, 0x2a2620, { rough: 0.9 });
    reg(hits, dampBlock, "damp-block");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: HAK_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: HAK_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 0.9, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = HAK_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("KETTLE SAFE-OPERATION PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Sited clear of combustibles, per the plan", "Wind screen + extinguisher at hand",
       "PPE: face shield, gauntlets, long sleeves", "EVT band: per the manufacturer",
       "NRCA kettle + tanker safety practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: HAK_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = HAK_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("KETTLE LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Course: —", "Finds: —", "Coverage: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: HAK_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "kettle-inspect") { shield.material = mat(0x59c97b); relief.material = mat(0x59c97b); dampBlock.material = mat(0x59c97b); }
        if (step.id === "kettle-burner") flame.visible = true;
        if (step.id === "mop-sweep") seamBead.visible = true;
        if (step.id === "kettle-shutdown") flame.visible = false;
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("KETTLE LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Course: mopped to coverage", "Finds: shield + thermostat", "Coverage: on the specification"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("KETTLE OFF", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "kettle-flareup") flame.position.set(0.14, 0.05, -0.02);
        if (it.id === "kettle-foaming") foam.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "kettle-flareup") { flame.position.set(0, 0.02, -0.06); screen.visible = true; }
        if (it.id === "kettle-foaming") { foam.visible = false; splatter.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && (step?.id === "kettle-burner" || step?.id === "kettle-shutdown")) burnerHandle.rotation.x = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "kettle-temp") {
          repaint(tempFace, signFace(`${Math.round(350 + gg.t * 200)} °F`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (gg && !gg.committed && step?.id === "coverage-check") {
          repaint(scaleFace, signFace(`${Math.round(gg.t * 40)} lb/sq`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (flame.visible) flame.scale.setScalar(0.85 + 0.3 * Math.abs(Math.sin(t * 22)));
        if (bucket) bucket.position.x = 1.4 + Math.sin(t * 2.4) * 0.06;
        if (foam.visible) foam.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.06, 0.4, 0.2);
        void paperFace;
      },
    };
  },
};
