import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Torch-Applied Membrane & Fire Watch VR — Construction &
// Structural Trades, the Roofers and Waterproofers pack.
//
// A low-slope roof mid-course on a modified-bitumen re-roof: the base sheet
// already down, a stack of granulated cap-sheet rolls staged, and the torch
// cart wheeled up to the next lap line. The learner is the roofer running the
// torch, with a dedicated fire watch on the deck the whole time per NFPA 51B
// and 29 CFR 1910.252. A generic building and a generic crew; no real
// contractor, address or manufacturer is named.

const TAFW_PAL = palette("construction");
const TAFW_ACCENT = TAFW_PAL.accent;
const TAFW_CSS = "#f2c14b";

export const SIM_RF_TORCH_APPLIED_MEMBRANE_AND_FIRE_WATCH = {
  id: "rf-torch-applied-membrane-and-fire-watch",
  index: "rf1",
  domain: "Construction & Structural Trades",
  trade: "Roofer running a torch on a modified-bitumen cap sheet, with a dedicated fire watch on deck",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection at the roof edge, and 29 CFR 1926 Subpart M Fall protection generally; NFPA 51B and 29 CFR 1910.252 for hot work, fire watch and extinguishers; ANSI Z359 for the harness and anchor; NRCA torch-application and fire-watch practice; Roofers Local 40 apprenticeship and training",
  name: "Torch-Applied Membrane & Fire Watch",
  title: simTitle("Torch-Applied Membrane & Fire Watch"),
  tagline: "The hot work permit read and the extinguisher confirmed, harness clipped, the torch and hose inspected, the cylinder read, the torch lit, a cap-sheet roll rolled to the lap line and welded at a steady pace, the seam rolled and checked, the torch purged cold, the deck scanned, the permit closed and the cylinder shut, with a gust threatening a loose corner and smoke reported two floors down along the way",
  accent: TAFW_ACCENT,
  accentCss: TAFW_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "seam-welded-clean", name: "Seam Welded Clean", note: "A cap sheet torched on with the fire watch answered, nobody burned, and the permit closed before the cart rolled off" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Torch Watch",
    currency: "SEAM",
    ranks: ["Apprentice", "Torch Hand", "Seam Welder", "Lead Mopman", "Fire Watch Certified"],
    badges: [
      { id: "permit-first", name: "Permit First", note: "The hot work permit and the extinguisher confirmed before the torch was ever lit", test: AWARD.stepClean("hot-work-permit") },
      { id: "steady-pass", name: "Steady Pass", note: "The torch swept the whole seam without a break in the pace", test: AWARD.unbroken },
      { id: "never-touched-hot", name: "Never Touched Hot", note: "No hand near a molten seam, no cylinder left loose, no fume walked through", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lap", name: "Clean Lap", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "on-the-band", name: "On The Band", note: "The roller pressure committed inside the bond band first time", test: AWARD.precise(0.7) },
      { id: "course-closed", name: "Course Closed", note: "Permit closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "edge-gap-in-rail": "You are reaching past the gap in the guardrail after a dropped scraper instead of going around to a section that is still up. 29 CFR 1926.501 puts a worker at this edge under fall protection the whole time they are exposed, and a gap in the rail does not pause that duty — it just means the harness and lifeline are the only thing left doing the job the rail was doing a moment ago.",
    "hot-seam-touch": "You reached bare-handed for the seam the torch just passed over. Modified-bitumen bonds because the torch melts the underside to a running liquid, and that bead stays well above a skin-burn temperature for long minutes after the flame has moved on — it looks the same matte black as the cured seam beside it and it is not. The roller checks it; a hand never does.",
    "fumes-into-stairwell": "The stairwell bulkhead door is propped open right beside where the torch is running, and the asphalt fume plume is drifting straight down the stairs into the occupied floors below. NFPA 51B and 29 CFR 1910.252 both expect hot-work smoke and fumes kept clear of anywhere people are working or breathing, and an open door into the building is the one thing that undoes every bit of that on a roof with no other way for the fumes to go but sideways.",
    "cylinder-unchained": "The spare propane cylinder is standing free on the deck near the open edge instead of chained upright to the cart. A full cylinder is dense enough to roll or topple in a gust and heavy enough to hurt whoever it lands on, or to go over the edge itself — chaining it to the cart is the only thing standing between a breeze and a cylinder loose on a roof.",
  },

  lateNotes: {
    "torch-valve": "The torch is not lit until the hose and the regulator have both passed inspection — a leak found after ignition is a burn, not a finding.",
    "seam-roller": "The roller checks the bond once the torch has actually passed over that stretch of seam — there is nothing to press yet.",
    "cylinder-valve": "The cylinder stays open until the last pass is welded and rolled — shutting it now just means relighting it in a minute.",
  },

  steps: [
    {
      id: "hot-work-permit", kind: "select", target: "permit-board",
      title: "Read the hot work permit before anything is lit",
      cue: "Read the permit: the work area, the fire watch assigned, the extinguisher and fire blanket required, and how long the watch holds after the torch goes out.",
      why: "A torch on a roof deck is hot work under NFPA 51B and 29 CFR 1910.252, and both require a permit before it starts — naming the area, the fire watch, the extinguisher on hand and the post-work watch time, because a smoulder that starts under a seam does not announce itself until the roofer who could still smell propane is long gone.",
    },
    {
      id: "extinguisher-check", kind: "select", target: "extinguisher",
      title: "Confirm the extinguisher and the fire blanket",
      cue: "Check the extinguisher's gauge is in the green and the fire blanket is unrolled and ready at hand, not still strapped in the truck.",
      why: "The permit names an extinguisher at the work; naming one and having one within reach are two different things, and the difference is the ten seconds it takes to run back to the truck while a smoulder that started small gets ahead of you. 29 CFR 1910.252's hot-work rule is written around exactly that gap.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still hanging on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the edge.",
      why: "This roof has an open edge on the side the torch cart is headed toward, and 29 CFR 1926.502 makes the anchor, the harness and the connection one system rated to arrest a fall rather than three separate pieces of gear that happen to be worn. Snugged before it is clipped, because a loose harness slides under load exactly where it should not.",
    },
    {
      id: "hose-inspect", kind: "find", noHint: true,
      targets: ["hose-crack", "bad-regulator"],
      itemNames: { "hose-crack": "a crack in the propane hose near the torch wand", "bad-regulator": "a loose, corroded regulator fitting" },
      itemNotes: {
        "hose-crack": "A hairline crack runs across the hose a hand's width from the torch wand — flexed hot, it is exactly where a hose lets go and turns a controlled flame into a jet fire at the worker's hand.",
        "bad-regulator": "The regulator's fitting is corroded and sits loose on its threads, which is how a joint the gauge reads fine on today lets go under pressure tomorrow.",
      },
      title: "Inspect the hose and regulator before connecting the torch",
      cue: "Run the propane hose through your hands from the cylinder to the wand, and check the regulator fitting is tight and sound.",
      why: "A torch's fuel line is inspected before every connection because propane under pressure does not fail politely — a cracked hose or a loose regulator lets go as a jet of burning gas rather than a slow leak, and by the time it is obvious something is wrong the roofer holding the wand is already in the flame's path.",
    },
    {
      id: "cylinder-gauge", kind: "gauge", target: "cylinder-gauge",
      title: "Read the cylinder's regulator pressure",
      cue: "Read the regulator gauge and commit only when it sits in the torch manufacturer's working band.",
      why: "The torch's flame is only as controllable as the pressure feeding it — too low and it will not hold a steady weld, too high and it burns hotter and faster than the seam needs, scorching the membrane instead of bonding it. The manufacturer's band on the gauge is what the torch was built to run at, per the manufacturer's manual.",
      gauge: {
        label: "REGULATOR — DELIVERY PRESSURE", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => `${(t * 40).toFixed(1)} psi`,
        missNote: "Off the torch's working band. Adjust the regulator and read it again before the torch is lit on it.",
      },
    },
    {
      id: "torch-valve", kind: "turn", target: "torch-valve",
      title: "Open the torch valve and light it away from the rolls",
      cue: "Point the wand away from the stacked cap-sheet rolls, open the valve and light the torch.",
      why: "Lighting the torch pointed at anything is lighting a test flame at that thing, and a stack of bitumen-and-felt cap sheet is fuel that has not been asked to burn yet. NRCA's torch-application practice has the wand pointed at open deck or a metal shield for exactly the moment the valve first opens, before the flame is under control.",
      turn: { turns: 0.4, axis: "z", label: "TORCH VALVE", readout: (t) => (t < 0.5 ? "closed" : "lit") },
    },
    {
      id: "roll-membrane", kind: "drag", target: "membrane-roll",
      title: "Roll the next cap sheet to the lap line",
      cue: "Carry the next roll from the stack and unroll it to the chalked lap line, overlapping the course already down.",
      why: "The lap line is chalked to the manufacturer's overlap, and rolling short of it leaves a seam with nothing to weld; rolling past it wastes material and throws off every course after it. The roll is carried flat rather than dragged across the torch's own hose, because a roll pulled over a hot fuel line is how the day's work finds its own leak.",
      drag: { to: "lap-line", radius: 0.55, missNote: "Not on the lap line. Carry the roll all the way out to the chalk mark before letting it go." },
    },
    {
      id: "torch-pass", kind: "track", target: "torch-wand", seconds: 6,
      title: "Sweep the torch across the seam at a steady pace",
      cue: "Hold the torch moving at a steady pace along the seam — too slow scorches the membrane, too fast leaves a cold weld.",
      why: "A torch held still even for a second burns through the cap sheet's granules into the felt beneath it, and a torch swept too fast never gets the underside hot enough to bond. The steady middle pace is what the manufacturer's application guide calls a good weld — visible as a small, even bead of melted bitumen squeezing out along the whole lap, not just at the spots where the hand happened to slow down.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "TORCH SWEEP SPEED", readout: (v) => (v < 0.4 ? "too slow — scorching" : v > 0.62 ? "too fast — cold weld" : "steady weld") },
      holdBreakNote: "The sweep broke out of the steady band. Bring the torch back to a steady pace along the seam before it cools.",
    },
    {
      id: "seam-roller", kind: "gauge", target: "seam-roller",
      title: "Roll the hot seam to set the bond",
      cue: "Press the roller along the seam right behind the torch and commit the pressure inside the bond band.",
      why: "The roller does the work a hand cannot do safely: it presses the still-hot bitumen bead flat and continuous along the whole lap while the seam is still liquid enough to bond, and the pressure band is chosen so it seats the seam without squeezing all the bitumen out from under it. Rolled too light, the lap looks welded and peels the first time it is walked on; rolled too hard, it starves the seam of the bead that was supposed to seal it.",
      gauge: {
        label: "SEAM ROLLER — PRESSURE", speed: 0.55, green: [0.4, 0.6],
        readout: (t) => `${Math.round(t * 30)} lb`,
        missNote: "Off the bond band. Roll the seam again inside the pressure the manufacturer's guide calls for.",
      },
    },
    {
      id: "torch-off", kind: "hold", target: "torch-valve", seconds: 4,
      title: "Purge the torch and set it down cold-end-out",
      cue: "Close the valve, hold the wand clear of the deck while the flame dies out completely, and set it down pointed at open roof.",
      why: "A torch that is 'off' still has gas in the line until it is purged, and a wand set down still glowing at its tip has started fires by touching a stray scrap of felt nobody was watching. Holding it clear until the flame is fully out, then laying it down pointed at bare deck, is the last thing that happens before anyone's hands are near it again.",
      holdBreakNote: "The wand was set down before the flame had fully died — hold it clear a moment longer and check it is actually out.",
    },
    {
      id: "ir-scan", kind: "select", target: "ir-scan",
      title: "Scan the finished course for hidden heat",
      cue: "Sweep the infrared thermometer along the new seam and the deck either side of it, looking for anything still hot that should not be.",
      why: "A seam that looks cured can still be carrying heat down into the insulation board underneath it, and that is exactly the kind of heat a fire watch is posted to catch before it becomes a smoulder nobody is looking for. The scan is the roofer's own half of that watch, done while the course is still fresh in mind.",
    },
    {
      id: "fire-watch-log", kind: "select", target: "log-board",
      title: "Log the permit, the finds and the watch time",
      cue: "Write the hose crack destroyed, the regulator fitting replaced, the course welded, and the fire watch's start and hold-over time into the log.",
      why: "The permit is not closed by the torch going quiet — NFPA 51B expects the fire watch to keep watching for a stated time after hot work ends, and the log is where that hold-over time gets written down instead of guessed at by whoever happens to still be on the roof when the crew packs up.",
    },
    {
      id: "cylinder-off", kind: "turn", target: "cylinder-valve",
      title: "Shut the cylinder valve and cap the torch",
      cue: "Turn the cylinder's own valve closed and cap the torch fitting before wheeling the cart off the roof.",
      why: "The torch valve stops the flame; the cylinder valve stops the fuel. Leaving the cylinder open overnight with only the torch valve closed depends on a single seal holding gas back for twelve hours instead of two, and the roofer who closes both is the one whose cart is not the reason the next shift finds a propane smell at the hatch.",
      turn: { turns: 0.25, axis: "z", label: "CYLINDER VALVE", readout: (t) => (t < 0.95 ? "OPEN" : "CLOSED") },
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the fire watch and the ground",
      cue: "Radio the fire watch and the ground crew: the course is welded, the permit is closed, and name the support line.",
      why: "Hot work is one of the few jobs on a roof where a second person's whole task is watching the first one's back, and a short check-in when the torch goes cold is what lets the fire watch stand down instead of wondering whether the last hour's smoulder risk is actually over.",
    },
  ],

  interrupts: [
    {
      id: "gust-lifts-membrane",
      kind: "Wind gust off the parapet",
      after: "roll-membrane", delay: 2, seconds: 14,
      alert: "A gust off the parapet catches the loose corner of the cap sheet you just rolled out, and it starts peeling up off the deck before the torch has touched it.",
      cue: "Drop a sandbag on the loose corner before the wind gets under the whole sheet.",
      target: "sandbag-corner",
      why: "An unwelded cap sheet is not fastened to anything yet — it is held down by its own weight, and a gust that gets under one corner can lift a whole roll like a sail, taking it toward the open edge or over it. Weighting the corner is the roofer's own version of the wind limit the manufacturer sets for laying membrane, kept per the manufacturer.",
      missNote: "The gust got under the sheet before the sandbag went on, and the whole corner flipped back on itself, dragging grit into the underside that will keep it from ever bonding clean on this pass.",
      wrongNote: "That does not hold a loose sheet down. Drop the sandbag on the lifting corner before it peels any further.",
    },
    {
      id: "smoke-from-below",
      kind: "Smoke reported two floors down",
      after: "torch-off", delay: 2, seconds: 14,
      alert: "The porter two floors down radios that they can smell smoke near the stairwell. An earlier pass over that stretch was welded almost an hour ago.",
      cue: "Grab the extinguisher and check the seam above where the smell was reported.",
      target: "extinguisher",
      why: "A smoulder started by hot work can travel through insulation for a long time before it shows itself as smoke somewhere else in the building, which is the whole reason NFPA 51B and 29 CFR 1910.252 keep the fire watch posted well after the torch has gone quiet rather than treating the job as finished the moment the flame is out.",
      missNote: "The report went unanswered while the smoulder kept working under a seam nobody was watching any more — by the time anyone went to look, the smell had gotten a lot stronger.",
      wrongNote: "Not that. Grab the extinguisher and go find the spot the porter is smelling before it gets ahead of you.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, TAFW_ACCENT);

    // ------------------------------------------------------------ roof deck: membrane and parapet
    const memTex = surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2c2621", base2: "#241f1b", lanes: 0 }), { repeat: 3, px: 448 });
    const deck = box(g, 6.4, 0.24, 5.6, 0, 0.12, 0, 0xffffff);
    deck.material = texturedMat(memTex, { rough: 0.9, metal: 0.04, color: 0xb8ada2 });
    deck.receiveShadow = true;
    // Parapet on the back and left; open edge with a guardrail (and a gap) on the right/front.
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.62, pd, px, 0.55, pz, 0xa79a89, { rough: 0.92 });
      wall.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a99c8b", tone2: "#988c7c" }), { repeat: 2, px: 256 }), { rough: 0.85, metal: 0.02, color: 0xc6bcae });
      box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.89, pz, 0x8b949d, { rough: 0.5, metal: 0.5 });
    }
    // Guardrail along the open edge with a deliberate gap by the roll stack.
    const railZ = 2.75;
    for (const [x0, x1] of [[-3.0, -0.6], [0.4, 3.0]]) {
      const cx0 = (x0 + x1) / 2, len = x1 - x0;
      box(g, len, 0.04, 0.03, cx0, 1.02, railZ, TAFW_PAL.trim, { rough: 0.5, metal: 0.5 });
      box(g, len, 0.04, 0.03, cx0, 0.58, railZ, TAFW_PAL.trim, { rough: 0.5, metal: 0.5 });
      for (let x = x0; x <= x1 + 0.001; x += (x1 - x0) / Math.round((x1 - x0) / 0.55)) {
        cyl(g, 0.018, 0.018, 1.05, x, 0.52, railZ, TAFW_PAL.trim, { rough: 0.5, metal: 0.5, seg: 8 });
      }
    }
    const gapHit = box(g, 1.0, 1.0, 0.2, -0.1, 0.55, railZ, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "gap in the rail — reach past it?", -0.1, 1.3, railZ, { css: "#d2312b", w: 0.5 });
    reg(hits, gapHit, "edge-gap-in-rail");
    for (let i = 0; i < 5; i++) box(g, 0.1, 0.006, 0.28, 3.35, 0.245, -2.2 + i * 1.0, 0xf0645b, { rough: 0.8, cast: false });

    // The fresh lap line, chalked, where the roll and torch pass happen.
    const lapMark = box(g, 3.2, 0.012, 0.7, 0.4, 0.246, 0.4, 0xd8c88a, { opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "lap line", 0.4, 0.4, 0.4, { css: TAFW_CSS, w: 0.2 });
    reg(hits, lapMark, "lap-line");

    // ------------------------------------------------------------ torch cart
    const cart = group(g, 1.3, 0.24, -1.4, -0.3);
    box(cart, 0.5, 0.05, 0.7, 0, 0.03, 0, TAFW_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (const [sx, sz] of [[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]]) cyl(cart, 0.05, 0.05, 0.03, sx, 0.02, sz, 0x1b1e22, { rough: 0.7, seg: 12 });
    const cylBody = cyl(cart, 0.09, 0.1, 0.55, -0.12, 0.35, 0, TAFW_PAL.structure, { rough: 0.5, metal: 0.4, seg: 16 });
    void cylBody;
    const spareCyl = group(g, 2.6, 0.24, -1.1);
    cyl(spareCyl, 0.09, 0.1, 0.55, 0, 0.28, 0, TAFW_PAL.structure, { rough: 0.5, metal: 0.4, seg: 16 });
    holoTag(spareCyl, "spare cylinder — chained?", 0, 0.65, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, spareCyl, "cylinder-unchained");
    const regulator = group(cart, -0.12, 0.63, 0);
    box(regulator, 0.06, 0.07, 0.05, 0, 0, 0, 0xc0c6cc, { rough: 0.4, metal: 0.8 });
    const gaugeFace = decal(regulator, 0.045, 0.045, 0, 0.05, 0.026, signFace("-- psi", { bg: "#0d1c24", accent: TAFW_CSS, fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.85, px: 96 });
    holoTag(regulator, "regulator gauge", 0, 0.15, 0, { css: TAFW_CSS, w: 0.28 });
    reg(hits, gaugeFace, "cylinder-gauge");
    const cylValve = group(cart, -0.12, 0.9, 0);
    box(cylValve, 0.03, 0.05, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.4, metal: 0.8 });
    const cylHandle = box(cylValve, 0.08, 0.012, 0.02, 0.02, 0.03, 0, 0xd2312b, { rough: 0.5 });
    cylValve.userData.wheel = cylHandle;
    holoTag(cylValve, "cylinder valve", 0, 0.12, 0, { css: TAFW_CSS, w: 0.26 });
    reg(hits, cylValve, "cylinder-valve");
    const hoseBad = hose(cart, [[-0.12, 0.63, 0.03], [0.05, 0.5, 0.08], [0.22, 0.35, 0.2]], 0.012, 0xd2312b, { steps: 10, rough: 0.7 });
    const crack = box(cart, 0.03, 0.015, 0.015, 0.05, 0.5, 0.08, 0x1b1e22, { rough: 0.9 });
    reg(hits, crack, "hose-crack");
    const looseFit = box(cart, 0.03, 0.03, 0.03, -0.12, 0.6, 0.02, 0x6a4a2a, { rough: 0.9 });
    reg(hits, looseFit, "bad-regulator");
    void hoseBad;

    // ------------------------------------------------------ torch wand at the lap line
    const wand = group(g, 0.4, 0.3, 0.65, 0.6);
    cyl(wand, 0.025, 0.03, 0.5, 0, 0.02, 0, 0x8a8f95, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    cyl(wand, 0.06, 0.065, 0.16, 0, 0.02, -0.3, 0x2b2b30, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const flame = ball(wand, 0.045, 0, 0.02, -0.42, 0x4fa8ff, { emissive: 0x4fa8ff, ei: 3.0, seg: 10 });
    flame.visible = false;
    const wandValve = box(wand, 0.03, 0.05, 0.02, 0.02, 0.06, -0.12, TAFW_PAL.accent, { rough: 0.5 });
    wand.userData.wheel = wandValve;
    holoTag(wand, "torch valve", 0, 0.16, 0, { css: TAFW_CSS, w: 0.24 });
    reg(hits, wand, "torch-valve");
    const wandSweepMark = box(wand, 0.5, 0.05, 0.05, 0, 0.02, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wandSweepMark, "torch-wand");
    const seamBead = box(g, 1.6, 0.02, 0.1, 0.4, 0.248, 0.62, 0x1a1614, { rough: 0.2, metal: 0.1, emissive: 0x3a1a08, ei: 0.4 });
    seamBead.visible = false;
    const hotHit = box(g, 0.6, 0.05, 0.14, 0.9, 0.26, 0.62, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "touch the fresh seam?", 0.9, 0.5, 0.62, { css: "#d2312b", w: 0.44 });
    reg(hits, hotHit, "hot-seam-touch");

    // Roller.
    const roller = group(g, -0.5, 0.24, 0.62, 0.5);
    cyl(roller, 0.05, 0.05, 0.35, 0, 0.05, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    box(roller, 0.02, 0.4, 0.02, 0, 0.3, 0, 0x8a7048, { rough: 0.7 });
    holoTag(roller, "seam roller", 0, 0.55, 0, { css: TAFW_CSS, w: 0.24 });
    reg(hits, roller, "seam-roller");

    // ------------------------------------------------------------ rolls, sandbags
    const rollStack = group(g, 1.9, 0.24, 1.8);
    for (let i = 0; i < 3; i++) {
      const roll = cyl(rollStack, 0.16, 0.16, 1.0, i * 0.34, 0.16, 0, 0x1c1815, { rough: 0.85, seg: 16 });
      roll.rotation.z = Math.PI / 2;
    }
    holoTag(rollStack, "cap-sheet rolls", 0.34, 0.45, 0, { css: TAFW_CSS, w: 0.32 });
    reg(hits, rollStack, "membrane-roll");
    const looseSheet = group(g, 0.4, 0.246, 0.62);
    box(looseSheet, 1.5, 0.014, 0.6, 0, 0, 0, 0x2a2420, { rough: 0.85 });
    looseSheet.visible = false;
    const flapCorner = box(g, 0.5, 0.02, 0.4, 1.4, 0.28, 0.9, 0x2a2420, { rough: 0.85 });
    flapCorner.visible = false;
    const sandbagPile = group(g, 2.4, 0.24, 2.3);
    for (let i = 0; i < 3; i++) box(sandbagPile, 0.28, 0.1, 0.16, (i % 2) * 0.15, 0.06 + Math.floor(i / 2) * 0.11, (i % 2) * 0.08, 0x6a5a3a, { rough: 0.9 });
    holoTag(sandbagPile, "sandbag on the loose corner", 0, 0.35, 0, { css: TAFW_CSS, w: 0.44 });
    const sandOnCorner = box(g, 0.3, 0.11, 0.18, 1.3, 0.31, 0.85, 0x6a5a3a, { rough: 0.9 });
    sandOnCorner.visible = false;
    reg(hits, sandbagPile, "sandbag-corner");

    // ------------------------------------------------------------ bulkhead, stairwell fumes
    const bulk = group(g, -2.2, 0.24, -1.8);
    box(bulk, 1.1, 2.2, 1.0, 0, 1.1, 0, 0xa79a89, { rough: 0.9 });
    box(bulk, 1.2, 0.08, 1.1, 0, 2.24, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    const bulkDoor = box(bulk, 0.55, 1.7, 0.05, -0.55, 0.85, 0.55, 0x3a4148, { rough: 0.6, metal: 0.3 });
    bulkDoor.rotation.y = 1.1;
    holoTag(bulk, "stairwell door — propped open?", -0.4, 2.0, 0.5, { css: "#d2312b", w: 0.5 });
    reg(hits, bulkDoor, "fumes-into-stairwell");
    const fumePlume = particles(g, 40, 0x9a9a90, { size: 0.05, life: 1.2, opacity: 0.4 });
    fumePlume.position.set(0.4, 0.5, 0.62);

    // ------------------------------------------------------------ smoke interrupt at a scupper
    const scupper = group(g, -1.6, 0.24, 2.0);
    box(scupper, 0.2, 0.2, 0.3, 0, 0.12, 0, TAFW_PAL.trim, { rough: 0.6, metal: 0.4 });
    const smoke = particles(g, 50, 0x6a6a64, { size: 0.045, life: 1.4, opacity: 0.5 });
    smoke.position.set(-1.6, 0.3, 2.0);
    smoke.visible = false;
    const scorch = box(scupper, 0.4, 0.01, 0.3, 0, 0.001, 0, 0x14100c, { rough: 1.0, cast: false });
    scorch.visible = false;

    // ------------------------------------------------------------ crew, chest, boards
    const fireWatch = standingFigure(g, -0.6, -1.6, { ry: 1.2, vest: 0xd8f23a, helmet: TAFW_PAL.accent, gloves: true });
    holoTag(fireWatch, "fire watch", 0, 2.0, 0, { css: TAFW_CSS, w: 0.24 });
    const chest = toolChest(g, -2.0, 1.3, { ry: 2.4, color: TAFW_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: TAFW_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, -0.6, 0.24, -0.6);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, TAFW_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: TAFW_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const extStand = group(g, -1.5, 0.24, 0.4);
    cyl(extStand, 0.09, 0.1, 0.42, 0, 0.21, 0, 0xd2312b, { rough: 0.6, seg: 14 });
    box(extStand, 0.25, 0.02, 0.35, 0.25, 0.03, 0, 0x2b2b30, { rough: 0.9 });
    cyl(extStand, 0.1, 0.1, 0.03, 0.25, 0.06, 0, 0x6a6a5a, { rough: 0.9, seg: 12 });
    holoTag(extStand, "extinguisher + fire blanket", 0, 0.5, 0, { css: TAFW_CSS, w: 0.44 });
    reg(hits, extStand, "extinguisher");
    const irMeter = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.2, idle: "-- °F", color: TAFW_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(irMeter, "IR scanner", 0, 0.16, 0, { css: TAFW_CSS, w: 0.24 });
    reg(hits, irMeter, "ir-scan");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: TAFW_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: TAFW_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const permit = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 0.9, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = TAFW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("HOT WORK PERMIT — ROOF C", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Area: cap-sheet re-roof, west slope", "Fire watch: assigned, on deck", "Extinguisher + blanket required at torch",
       "Hold-over watch: per the permit", "NFPA 51B · 29 CFR 1910.252"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: TAFW_ACCENT });
    reg(hits, permit, "permit-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = TAFW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("HOT WORK LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Course: —", "Finds: —", "Watch: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: TAFW_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "hose-inspect") { crack.material = mat(0x59c97b); looseFit.material = mat(0x59c97b); }
        if (step.id === "torch-valve") flame.visible = true;
        if (step.id === "roll-membrane") { looseSheet.visible = true; rollStack.children[2]?.removeFromParent?.(); }
        if (step.id === "torch-pass") seamBead.visible = true;
        if (step.id === "torch-off") flame.visible = false;
        if (step.id === "ir-scan") repaint(irMeter.userData.screen, signFace("NO HOT SPOTS", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.42 }));
        if (step.id === "fire-watch-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("HOT WORK LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Course: welded + rolled", "Finds: hose + regulator", "Watch: hold-over logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("PERMIT CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-lifts-membrane") flapCorner.visible = true;
        if (it.id === "smoke-from-below") smoke.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-lifts-membrane") { flapCorner.visible = false; sandOnCorner.visible = true; }
        if (it.id === "smoke-from-below") { smoke.visible = false; scorch.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && (step?.id === "torch-valve" || step?.id === "cylinder-off")) {
          const wheel = step.id === "torch-valve" ? wandValve : cylHandle;
          wheel.rotation.x = session.turn.amount * Math.PI * 0.5;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "cylinder-gauge") {
          repaint(gaugeFace, signFace(`${(gg.t * 40).toFixed(1)} psi`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (flame.visible) flame.scale.setScalar(0.85 + 0.3 * Math.abs(Math.sin(t * 26)));
        if (fumePlume.visible !== false) fumePlume.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.05, 0.4, -0.6);
        if (smoke.visible) smoke.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.06, 0.5, -0.4);
        if (flapCorner.visible) flapCorner.rotation.z = Math.sin(t * 5) * 0.25;
        void paperFace;
      },
    };
  },
};
