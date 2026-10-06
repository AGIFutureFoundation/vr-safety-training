import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Playground & Courtyard VR — Building Systems & Facilities,
// property management zone nineteen.
//
// The inner courtyard of an older apartment building: a small playground
// with swings and a slide on loose mulch, a sandbox, benches with decades of
// paint on them, pavers, a shade sail and a gate to the street. The monthly
// playground inspection worked the way the public playground handbook lays
// it out, the sand swept for needles with tongs, the old paint left alone
// until it has been tested, a toddler kept inside the gate, and a resident's
// demand for a rule against children answered the way fair housing law
// requires. Generic building — only the codes, standards and unions are
// named.

const PMPC_ACCENT = 0xe8a04a;
const PMPC_CSS = "#e8a04a";
const PMPC_WARN = "#f0645b";

export const SIM_PM_PLAYGROUND_AND_COURTYARD = {
  id: "pm-playground-and-courtyard",
  index: "235",
  domain: "Building Systems & Facilities",
  trade: "Grounds and amenity staff — SEIU building staff and UNITE HERE residential hospitality staff, with the apartment association's CAM and CAMT credentials",
  category: "Building Systems & Facilities",
  weather: "overcast",
  certification: "The federal public playground safety handbook, with ASTM F1487 for the equipment and ASTM F1292 for the surfacing under it; EPA 40 CFR 745 lead-safe work practices before old paint on a pre-1978 property is disturbed; OSHA 29 CFR 1910.1030 for needles found in the sand, 29 CFR 1910.132 PPE, 29 CFR 1910.23 ladders for the shade sail and 29 CFR 1910.22 for the courtyard's walking surfaces; the Fair Housing Act's protection for families with children; SEIU building staff, UNITE HERE amenity staff and the apartment association's CAM and CAMT credentials",
  name: "Playground & Courtyard",
  title: simTitle("Playground & Courtyard"),
  tagline: "The monthly courtyard round: swings, bolts and mulch inspected to the handbook, the sand swept with tongs, old paint tested before it is touched, a toddler kept inside the gate, and a rule against children refused",
  accent: PMPC_ACCENT,
  accentCss: PMPC_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "safe-to-play", name: "Safe to Play", note: "Equipment inspected, surfacing at depth, sand swept with tongs, old paint left for testing, and every child still welcome" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Courtyard Round",
    currency: "INCHES",
    ranks: ["Grounds Helper", "Amenity Tech", "Grounds Lead", "Community Manager", "Playground Certified"],
    badges: [
      { id: "deep-enough", name: "Deep Enough", note: "Mulch depth read inside the band first time", test: AWARD.stepClean("probe-mulch") },
      { id: "tongs-not-hands", name: "Tongs Not Hands", note: "No unsafe act anywhere in the courtyard", test: AWARD.safe },
      { id: "steady-sail", name: "Steady Sail", note: "Lowered the sail without breaking the band", test: AWARD.stepClean("lower-sail") },
    ],
    challenges: [
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole round", test: AWARD.clean },
      { id: "steady-winch", name: "Steady Winch", note: "Held the winch without breaking the band", test: AWARD.unbroken },
      { id: "open-for-school", name: "Open for After School", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "sand-lead-paint": "You started sanding the flaking paint off the old bench. On a building this age that paint may well be lead, and dry sanding turns it into fine dust that settles into the sandbox and the mulch where small children play with their hands — the paint is tested first, and if it is lead it is worked lead-safe by someone trained to.",
    "climb-top-bar": "You climbed onto the swing set's top bar to look at the hanger. The top bar is round, eight feet up and above a mulch pit designed for a child's fall, not an adult's — the step ladder is for the hangers, footed on a board, with a second person holding it.",
    "barehand-needle": "You reached into the sand to pick up the needle with your fingers. A needle can carry bloodborne disease and there are often more under the one you can see — puncture-resistant gloves, tongs and the sharps container, and never fingers in sand you have not raked.",
    "blower-near-kids": "You started the leaf blower on the path while children were playing a few feet away. A blower throws grit, twigs and whatever is in the mulch at eye height, and it is loud enough to hurt small ears — the courtyard is blown before the children come out, not while they are in it.",
  },

  lateNotes: {
    "caution-tape": "Not yet — the swing is taped off once the round is done and the parts are ordered, not before it has been inspected.",
    "light-meter": "The path lighting is read at the end of the round, when the courtyard is starting to get dark.",
  },

  steps: [
    {
      id: "read-checklist", kind: "select", target: "inspection-checklist",
      title: "Read the monthly playground checklist",
      cue: "Check last month's findings and this month's items before walking the equipment.",
      why: "A playground wears in predictable places — hangers, S-hooks, bolts, the mulch under the swings — and the checklist is how each of them gets looked at every month rather than whenever somebody notices. Last month's findings tell you what was already on its way out, which is where this month's failure is most likely to be.",
    },
    {
      id: "walk-equipment", kind: "find", noHint: true,
      targets: ["s-hook-open", "protrusion-bolt"],
      itemNames: { "s-hook-open": "S-hook opened at the swing seat", "protrusion-bolt": "bolt end sticking out at the slide platform" },
      itemNotes: {
        "s-hook-open": "The S-hook joining the chain to the seat has opened into a gap. A child's clothing drawstring catches in a gap like that, and an open hook can let the seat drop mid-swing.",
        "protrusion-bolt": "A bolt at the slide platform sticks out well past its nut. It catches clothing at the top of the slide and cuts heads on the way past.",
      },
      title: "Walk the equipment",
      cue: "Find the hardware that can catch a child's clothing or let go.",
      why: "The playground handbook's hazard list is short and specific — openings that catch clothing, protrusions that snag or cut, hardware that can open — because those are the ways children actually get hurt on equipment. An open S-hook and a protruding bolt are both on it, and both are invisible from the bench where a parent sits.",
    },
    {
      id: "probe-mulch", kind: "gauge", target: "mulch-depth",
      title: "Probe the mulch depth under the swings",
      cue: "Push the depth probe into the mulch in the swing pit and commit when it reads in the band.",
      why: "Loose-fill surfacing only protects a falling child if it is deep enough for the fall height, and the pits under swings are kicked out first by every pair of feet that drags on the way down. The handbook ties the depth to the equipment's fall height, and ASTM F1292 is the test behind it; the probe is how you know whether this pit still meets it.",
      gauge: { label: "MULCH DEPTH", speed: 0.55, green: [0.56, 0.8], readout: (t) => `${(t * 16).toFixed(1)} in`, missNote: "Outside the band — too shallow and a fall lands on the base underneath. Probe again in the kicked-out pit." },
    },
    {
      id: "top-up-mulch", kind: "drag", target: "mulch-bucket",
      title: "Top up the kicked-out swing pit",
      cue: "Carry the bucket of mulch to the swing pit and rake it in.",
      why: "The pit under a swing is the exact spot a child falls onto when a grip fails, and it is also the spot where feet have scraped the mulch away to bare ground. Topping it up and raking it level puts the protection back where the fall actually happens, rather than where the mulch happens to have piled up.",
      drag: { to: "swing-pit-slot", radius: 0.5, missNote: "Not in the pit — mulch dumped beside the swing leaves the landing zone bare." },
    },
    {
      id: "cap-bolt", kind: "turn", target: "bolt-cap",
      title: "Cut back and cap the protruding bolt",
      cue: "Turn the acorn cap nut onto the trimmed bolt until it seats.",
      why: "A protruding bolt end is a snag and a cut at head height for a child, and the fix is simple: trim it back and seat a rounded cap nut over it so nothing sharp or threaded is left exposed. Seated fully, the cap also locks the nut behind it, which is the other thing a loose bolt at a slide platform needed.",
      turn: { turns: 0.7, axis: "z", label: "CAP NUT" },
    },
    {
      id: "check-chain", kind: "hold", target: "swing-chain", seconds: 4,
      title: "Hold the swing chain taut and check the hanger",
      cue: "Pull the chain taut and hold while you check wear at the top hanger.",
      why: "Swing hangers wear metal against metal with every swing, and the wear hides at the top where the chain pivots. Holding the chain taut shows whether the hanger's eye has worn thin or the chain link has worn into it — a hanger worn past its limit is the one that lets a swing drop with a child on it.",
      holdBreakNote: "You let the chain drop before you'd checked the hanger. Slack, the worn spot is hidden — hold it taut until you've looked.",
    },
    {
      id: "sweep-sand", kind: "sequence",
      targets: ["sharps-gloves", "sharps-tongs", "sharps-container"],
      itemNames: { "sharps-gloves": "puncture-resistant gloves on", "sharps-tongs": "needle picked up with tongs", "sharps-container": "needle into the sharps container" },
      title: "Pick the needle out of the sandbox",
      cue: "Gloves on, pick the needle up with the tongs, then drop it point-first into the sharps container.",
      why: "A needle in a sandbox is a bloodborne pathogen exposure waiting for a small hand, and the safe way to move it is the one that never puts fingers near the point. Puncture-resistant gloves first, tongs second and a rigid sharps container third is the bloodborne pathogens standard's logic worked in a playground — and the rest of the sand is raked before anyone digs in it again.",
      outOfOrderNote: "Gloves, tongs, container — any other order puts a hand near the point.",
    },
    {
      id: "lower-sail", kind: "track", target: "sail-winch", seconds: 7,
      title: "Lower the shade sail ahead of the wind",
      cue: "Winch the sail down steadily, keeping tension in the band so it does not flog.",
      why: "A shade sail left up in strong wind loads its posts and fittings far beyond what they were designed for, and a sail that lets go becomes a flogging sheet of fabric and steel over a playground. Lowering it steadily — tension held, never let run — keeps the corner hardware from snapping and the fabric from whipping across the courtyard.",
      track: { start: 0.25, green: [0.38, 0.64], rise: 0.44, fall: 0.38, drift: 0.12, label: "SAIL TENSION", readout: (v) => (v < 0.38 ? "flogging" : v > 0.64 ? "overloading the post" : "steady") },
      holdBreakNote: "The tension left the band. Slack and it flogs, too tight and the post takes the load — bring it back to steady.",
    },
    {
      id: "walk-courtyard", kind: "find", noHint: true,
      targets: ["flaking-bench-paint", "lifted-paver"],
      itemNames: { "flaking-bench-paint": "paint flaking off the old bench", "lifted-paver": "paver lifted by a tree root" },
      itemNotes: {
        "flaking-bench-paint": "Layers of old paint are flaking off the cast-iron bench beside the sandbox. On a building this age it has to be treated as lead until a test says otherwise, and flakes are falling into the play area.",
        "lifted-paver": "A tree root has lifted a paver an inch above its neighbours on the main path. That is the trip that residents with walkers and strollers meet first.",
      },
      title: "Walk the courtyard's benches and paths",
      cue: "Find the old surface that could poison a child and the path that will trip a resident.",
      why: "The courtyard is used by the building's youngest and oldest residents together, and its two classic hazards reflect that: old paint that small children put in their mouths, and a lifted paver that a resident with a walker cannot step over. EPA's lead-safe rules and the walking-surfaces standard are the two laws behind those two findings.",
    },
    {
      id: "read-path-light", kind: "gauge", target: "light-meter",
      title: "Read the path lighting at dusk",
      cue: "Hold the light meter on the main path and commit when it reads in the band.",
      why: "A courtyard that is well used by day becomes the building's darkest route home at night, and a lamp that has dimmed or failed is how a resident misses the lifted paver or a gate left open. Reading the path at dusk, rather than assuming the fixtures work, is how the round catches a failing lamp before somebody falls in the dark.",
      gauge: { label: "PATH LIGHT", speed: 0.55, green: [0.4, 0.66], readout: (t) => `${(t * 5).toFixed(1)} fc`, missNote: "Outside the band — too dim to see a trip, or you read it under the lamp head. Read it on the path again." },
    },
    {
      id: "tape-swing", kind: "drag", target: "caution-tape",
      title: "Tape off the swing until the hook is replaced",
      cue: "Carry the caution tape and out-of-service tag to the swing bay and hang it across.",
      why: "A swing with an open S-hook stays out of service until the hook is replaced with a closed one, and a closed-off swing only stays closed if the tape and tag make that obvious to a six-year-old and a parent alike. Taping the bay rather than removing the seat keeps the fault visible to the parts order and the inspector.",
      drag: { to: "swing-bay-slot", radius: 0.55, missNote: "Not across the swing bay — tape left anywhere else closes nothing." },
    },
    {
      id: "crew-checkin", kind: "select", target: "attendant-checkin",
      title: "Check in with the amenity attendant",
      cue: "Hand over the taped swing, the paint and the resident's complaint, and ask how the attendant is doing.",
      why: "The UNITE HERE amenity attendant is the one in the courtyard at after-school time, fielding parents about the taped swing and neighbours about the noise, so they need the findings and the building's answer on the children's rule in person. A shift that included a needle in the sand and an angry neighbour is also worth a real question about how they are.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the inspection in the building log",
      cue: "Log the checklist results, mulch depth, the needle, the paint for testing and the resident's complaint.",
      why: "The monthly playground inspection is only a defence if it is written down: the building log is what shows the mulch was at depth, the hook was found and taped the same day, and the paint was sent for testing before anyone touched it. It is also where the resident's complaint and the building's answer are recorded, so the next manager answers the same way.",
    },
  ],

  interrupts: [
    {
      id: "toddler-at-gate",
      kind: "Toddler heading for the street gate",
      after: "check-chain", delay: 3, seconds: 12,
      alert: "While you hold the swing chain, a toddler wanders away from the sandbox toward the street gate — which is standing open onto the sidewalk.",
      cue: "Latch the courtyard gate and walk the toddler back to the sandbox. The chain can wait.",
      target: "courtyard-gate-latch",
      why: "An open gate onto the street is the courtyard's one route to real danger, and a toddler moves faster toward it than anyone expects. Latching the gate first puts the barrier back between the child and the traffic, and walking her back finds the parent who looked away for a moment.",
      missNote: "The toddler reached the open gate the whole window with nobody stopping her. The sidewalk and the street are on the other side of it.",
      wrongNote: "That doesn't stop her. Latch the courtyard gate and walk her back to the sandbox.",
    },
    {
      id: "no-kids-demand",
      kind: "Resident demanding a rule against children",
      after: "lower-sail", delay: 3, seconds: 13,
      alert: "A resident storms over while you winch the sail, tapes a handmade 'NO KIDS IN COURTYARD' sign to the gate and demands the building ban children from it.",
      cue: "Take the handmade sign down, show him the house rules binder — quiet hours apply to everyone — and pass his complaint to the manager.",
      target: "rules-binder",
      why: "The Fair Housing Act protects families with children, and a rule that bans children from a shared courtyard, rather than setting conduct rules for everyone, is the kind of rule it has been used against. The house rules already cover noise for every resident; showing him those, and passing his complaint to the manager, answers him without the building discriminating against its own families.",
      missNote: "The handmade sign stayed on the gate the whole window. To every family walking past it, it reads as the building's rule — and that is how a fair housing complaint begins.",
      wrongNote: "That doesn't answer him. The house rules binder holds the conduct rules that apply to everyone — show him, and take the sign down.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PMPC_ACCENT);

    // ------------------------------------------------------------ pavers and play surface
    const paverTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 7, base: "#b89a7a", base2: "#ab8e6f", seam: "rgba(60,40,20,0.35)" }), { repeat: 5, px: 384 });
    const pavers = box(g, 7.0, 0.04, 5.4, 0, 0.02, -0.3, 0xb89a7a, { rough: 0.85 });
    pavers.material = texturedMat(paverTex, { rough: 0.85, metal: 0.02, color: 0xc8aa8a });
    const mulchTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 14, base: "#7a5436", base2: "#6e4a2e", seam: "rgba(40,24,10,0.3)" }), { repeat: 3, px: 256 });
    const mulch = box(g, 3.6, 0.06, 2.6, -1.1, 0.05, -1.3, 0x7a5436, { rough: 0.95 });
    mulch.material = texturedMat(mulchTex, { rough: 0.95, metal: 0.0, color: 0x8a6446 });
    // Timber border round the play area.
    for (const sz of [-1, 1]) box(g, 3.7, 0.14, 0.1, -1.1, 0.07, -1.3 + sz * 1.3, 0x6a4a2a, { rough: 0.9 });
    for (const sx of [-1, 1]) box(g, 0.1, 0.14, 2.6, -1.1 + sx * 1.8, 0.07, -1.3, 0x6a4a2a, { rough: 0.9 });

    // ------------------------------------------------------------ swing set
    const swings = group(g, -1.9, 0, -1.6);
    const topBar = cyl(swings, 0.05, 0.05, 2.0, 0, 2.3, 0, 0x2f6f8c, { rough: 0.5, metal: 0.5, seg: 12 });
    topBar.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = cyl(swings, 0.04, 0.04, 2.4, sx * 1.0, 1.15, sz * 0.5, 0x2f6f8c, { rough: 0.5, metal: 0.5, seg: 10 });
      leg.rotation.x = -sz * 0.21;
    }
    for (const sx of [-0.4, 0.4]) {
      for (const cz of [-0.12, 0.12]) cyl(swings, 0.008, 0.008, 1.7, sx, 1.45, cz, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6 });
      box(swings, 0.45, 0.04, 0.18, sx, 0.6, 0, 0x1b1e22, { rough: 0.8 });
    }
    const chainHold = group(swings, 0.4, 1.4, 0.12);
    box(chainHold, 0.06, 0.4, 0.06, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, chainHold, "swing-chain");
    holoTag(swings, "swing chain · hanger", 0.4, 2.55, 0.1, { css: PMPC_CSS, w: 0.34 });
    const sHook = group(swings, -0.4, 0.66, 0.12);
    torus(sHook, 0.02, 0.005, 0, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    box(sHook, 0.01, 0.03, 0.01, 0.025, 0.01, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9 }).rotation.z = 0.6;
    reg(hits, sHook, "s-hook-open");
    const topBarClimb = box(swings, 0.5, 0.12, 0.12, -0.7, 2.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(swings, "climb the top bar?", -0.7, 2.55, 0.1, { css: PMPC_WARN, w: 0.32 });
    reg(hits, topBarClimb, "climb-top-bar");
    const pitSlot = box(swings, 0.6, 0.1, 0.5, -0.4, 0.1, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["swing-pit-slot"] = pitSlot;
    const pitBare = cyl(swings, 0.25, 0.25, 0.01, -0.4, 0.085, 0.1, 0x4a3a2a, { rough: 0.9, seg: 16 });
    const bayTape = group(swings, 0, 0, 0.6);
    for (const y of [0.9, 1.1]) box(bayTape, 2.0, 0.05, 0.005, 0, y, 0, 0xf2c14b, { rough: 0.6 });
    bayTape.visible = false;
    const baySlot = box(swings, 1.8, 0.4, 0.1, 0, 1.0, 0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["swing-bay-slot"] = baySlot;
    const probe = group(g, -1.1, 0.08, -1.0);
    cyl(probe, 0.008, 0.008, 0.5, 0, 0.15, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8, seg: 6 });
    const probeRead = instrument(probe, 0, 0.45, 0, { idle: "-- in", color: 0xf2c14b, w: 0.12, d: 0.16 });
    reg(hits, probeRead, "mulch-depth");
    holoTag(probe, "depth probe", 0, 0.68, 0, { css: PMPC_CSS, w: 0.22 });
    const mulchBucket = group(g, -0.2, 0, -0.4);
    cyl(mulchBucket, 0.18, 0.15, 0.34, 0, 0.17, 0, 0xe8a04a, { rough: 0.5, seg: 14 });
    cyl(mulchBucket, 0.16, 0.16, 0.04, 0, 0.33, 0, 0x7a5436, { rough: 0.95, seg: 14 });
    reg(hits, mulchBucket, "mulch-bucket");
    holoTag(mulchBucket, "mulch bucket", 0, 0.52, 0, { css: PMPC_CSS, w: 0.24 });

    // ------------------------------------------------------------ slide and platform
    const slide = group(g, 0.1, 0, -1.9);
    box(slide, 0.9, 0.08, 0.9, 0, 1.2, 0, 0x2f8a5a, { rough: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(slide, 0.05, 0.05, 2.0, sx * 0.42, 1.0, sz * 0.42, 0x2f6f8c, { rough: 0.5, metal: 0.5, seg: 10 });
    const chute = box(slide, 0.5, 0.05, 1.8, 0.9, 0.62, 0.0, 0xf2c14b, { rough: 0.35 });
    chute.rotation.z = 0.62;
    chute.rotation.y = Math.PI / 2;
    chute.position.set(0.0, 0.62, 1.1);
    chute.rotation.set(0.62, 0, 0);
    for (let i = 0; i < 4; i++) box(slide, 0.5, 0.04, 0.12, 0, 0.3 * i + 0.1, -0.6 - i * 0.08, 0x2f8a5a, { rough: 0.6 });
    const bolt = group(slide, 0.45, 1.25, 0.2);
    cyl(bolt, 0.012, 0.012, 0.08, 0.04, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    reg(hits, bolt, "protrusion-bolt");
    const capNut = group(slide, 0.5, 1.25, 0.2);
    ball(capNut, 0.022, 0.03, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 10 });
    reg(hits, capNut, "bolt-cap");
    holoTag(slide, "platform bolt", 0.5, 1.45, 0.2, { css: PMPC_CSS, w: 0.24 });

    // ------------------------------------------------------------ sandbox, needle kit
    const sandbox = group(g, 1.4, 0, -1.2);
    for (const sz of [-1, 1]) box(sandbox, 1.4, 0.25, 0.1, 0, 0.125, sz * 0.6, 0x8a6a4a, { rough: 0.9 });
    for (const sx of [-1, 1]) box(sandbox, 0.1, 0.25, 1.2, sx * 0.65, 0.125, 0, 0x8a6a4a, { rough: 0.9 });
    const sand = box(sandbox, 1.2, 0.04, 1.1, 0, 0.18, 0, 0xe0cc9a, { rough: 0.95 });
    void sand;
    const needle = group(sandbox, 0.2, 0.21, 0.1);
    cyl(needle, 0.006, 0.006, 0.08, 0, 0, 0, 0xf4f4f0, { rough: 0.3, seg: 6 }).rotation.z = Math.PI / 2;
    cyl(needle, 0.002, 0.002, 0.05, 0.06, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 4 }).rotation.z = Math.PI / 2;
    holoTag(sandbox, "pick it up?", 0.2, 0.4, 0.1, { css: PMPC_WARN, w: 0.22 });
    reg(hits, needle, "barehand-needle");
    const kit = group(g, 2.4, 0, -0.3);
    box(kit, 0.5, 0.05, 0.4, 0, 0.75, 0, 0x7a6048, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(kit, 0.03, 0.75, 0.03, sx * 0.22, 0.375, sz * 0.17, 0x53606b, { rough: 0.5 });
    const gloves = group(kit, -0.15, 0.78, 0);
    box(gloves, 0.1, 0.03, 0.14, 0, 0.015, 0, 0x2f6fb0, { rough: 0.7 });
    reg(hits, gloves, "sharps-gloves");
    const tongs = group(kit, 0.02, 0.78, 0.05);
    box(tongs, 0.02, 0.02, 0.3, -0.01, 0.01, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8 });
    box(tongs, 0.02, 0.02, 0.3, 0.02, 0.01, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8 });
    reg(hits, tongs, "sharps-tongs");
    const sharpsBox = group(kit, 0.16, 0.78, -0.05);
    box(sharpsBox, 0.12, 0.2, 0.1, 0, 0.1, 0, 0xd8232a, { rough: 0.6 });
    reg(hits, sharpsBox, "sharps-container");
    holoTag(kit, "sharps kit", 0, 1.12, 0, { css: PMPC_CSS, w: 0.2 });

    // ------------------------------------------------------------ benches (one with old paint), paver, blower
    const oldBench = group(g, -2.9, 0, 0.3, Math.PI / 2);
    box(oldBench, 1.4, 0.06, 0.45, 0, 0.45, 0, 0x2f5a3a, { rough: 0.8 });
    box(oldBench, 1.4, 0.4, 0.06, 0, 0.7, -0.2, 0x2f5a3a, { rough: 0.8 });
    for (const sx of [-1, 1]) box(oldBench, 0.08, 0.45, 0.45, sx * 0.62, 0.225, 0, 0x1b1e22, { rough: 0.6, metal: 0.4 });
    const flakes = group(oldBench, 0.2, 0.49, 0.05);
    for (let i = 0; i < 6; i++) box(flakes, 0.05, 0.004, 0.04, -0.15 + i * 0.06, 0, (i % 2) * 0.05, [0xd8c89a, 0x9a3a2a, 0x2f5a3a][i % 3], { rough: 0.9 }).rotation.y = i;
    reg(hits, flakes, "flaking-bench-paint");
    const sander = group(oldBench, -0.3, 0.49, 0.1);
    box(sander, 0.14, 0.08, 0.1, 0, 0.04, 0, 0x2f6fb0, { rough: 0.5 });
    holoTag(sander, "sand it smooth?", 0, 0.24, 0, { css: PMPC_WARN, w: 0.28 });
    reg(hits, sander, "sand-lead-paint");
    const bench2 = group(g, 2.9, 0, 1.2, -Math.PI / 2);
    box(bench2, 1.4, 0.06, 0.45, 0, 0.45, 0, 0x8a6a4a, { rough: 0.8 });
    for (const sx of [-1, 1]) box(bench2, 0.08, 0.45, 0.45, sx * 0.62, 0.225, 0, 0x1b1e22, { rough: 0.6, metal: 0.4 });
    const paver = box(g, 0.3, 0.05, 0.3, 0.9, 0.065, 0.9, 0xb89a7a, { rough: 0.85 });
    paver.rotation.x = 0.12;
    reg(hits, paver, "lifted-paver");
    const blower = group(g, -0.6, 0, 1.3, 0.4);
    box(blower, 0.3, 0.3, 0.2, 0, 0.15, 0, 0xf28c2a, { rough: 0.5 });
    cyl(blower, 0.04, 0.04, 0.7, 0.3, 0.15, 0, 0x3a3f45, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(blower, "blow the path now?", 0, 0.5, 0, { css: PMPC_WARN, w: 0.32 });
    reg(hits, blower, "blower-near-kids");

    // ------------------------------------------------------------ shade sail and winch
    const sailPosts = [[-2.9, -2.6], [2.9, -2.6], [2.9, 0.2]];
    for (const [px, pz] of sailPosts) cyl(g, 0.07, 0.08, 3.4, px, 1.7, pz, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 10 });
    const sail = group(g, 1.0, 3.1, -1.6);
    const sailCloth = box(sail, 3.8, 0.02, 2.0, 0, 0, 0, 0xe8e0d0, { rough: 0.9, opacity: 0.9, transparent: true });
    sailCloth.rotation.z = 0.06;
    const winch = group(g, 2.9, 1.1, 0.35);
    cyl(winch, 0.06, 0.06, 0.12, 0, 0, 0, 0x3a4450, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    const winchHandle = box(winch, 0.02, 0.16, 0.02, 0.08, 0.06, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, winch, "sail-winch");
    holoTag(winch, "sail winch", 0, 0.2, 0.05, { css: PMPC_CSS, w: 0.22 });

    // ------------------------------------------------------------ street gate, rules binder, light meter, checklist, log
    const fence = group(g, 0, 0, 2.2);
    for (let i = 0; i < 24; i++) {
      const x = -3.2 + i * 0.28;
      if (x > -2.2 && x < -1.2) continue;
      box(fence, 0.03, 1.2, 0.03, x, 0.6, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    }
    box(fence, 6.6, 0.04, 0.04, 0, 1.2, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const gate = group(fence, -2.2, 0, 0);
    const gateLeaf = group(gate, 0, 0, 0);
    for (let i = 0; i < 4; i++) box(gateLeaf, 0.03, 1.2, 0.03, 0.12 + i * 0.25, 0.6, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    box(gateLeaf, 0.95, 0.04, 0.04, 0.48, 1.18, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    gateLeaf.rotation.y = 1.1;
    const gateLatch = group(fence, -1.2, 1.05, 0.03);
    box(gateLatch, 0.08, 0.12, 0.05, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    reg(hits, gateLatch, "courtyard-gate-latch");
    holoTag(fence, "street gate latch", -1.2, 1.36, 0.03, { css: PMPC_CSS, w: 0.3 });
    const noKidsSign = decal(fence, 0.36, 0.2, -1.6, 0.85, 0.05, paperFace("NO KIDS", ["IN COURTYARD!!"], { bg: "#fff8e8", band: "#b8402f" }), { px: 192 });
    noKidsSign.visible = false;
    const rulesPost = group(g, 2.3, 0, 1.75);
    cyl(rulesPost, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x8b929a, { rough: 0.5, seg: 8 });
    const rulesBinder = group(rulesPost, 0, 1.02, 0.02);
    box(rulesBinder, 0.26, 0.32, 0.06, 0, 0, 0, 0x2f5a7a, { rough: 0.6 });
    decal(rulesBinder, 0.2, 0.1, 0, 0.06, 0.032, signFace("HOUSE RULES", { bg: "#2f5a7a", accent: PMPC_CSS, scale: 0.4 }), { px: 128 });
    reg(hits, rulesBinder, "rules-binder");
    holoTag(rulesPost, "house rules binder", 0, 1.3, 0.02, { css: PMPC_CSS, w: 0.3 });
    decal(g, 0.5, 0.36, 1.5, 1.0, 2.25, paperFace("COURTYARD RULES", ["Quiet hours 10 pm – 7 am", "Clean up after pets", "Playground: ages 2–12", "Report hazards: office"], { bg: "#f4efe0", band: "#2f5a7a" }), { px: 256 });
    const lamp = group(g, 0.4, 0, 1.8);
    cyl(lamp, 0.04, 0.05, 2.6, 0, 1.3, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
    ball(lamp, 0.14, 0, 2.7, 0, 0xfff0c8, { emissive: 0xffe0a0, ei: 0.8, rough: 0.3, seg: 12 });
    const meter = instrument(g, 0.3, 0.9, 1.4, { idle: "-.- fc", color: 0xf2c14b, w: 0.12, d: 0.16 });
    reg(hits, meter, "light-meter");
    holoTag(g, "light meter", 0.3, 1.1, 1.4, { css: PMPC_CSS, w: 0.22 });
    const checklist = decal(g, 0.24, 0.32, 2.5, 1.3, -0.3, paperFace("PLAYGROUND · MONTHLY", ["Hangers · S-hooks", "Bolts · protrusions", "Surfacing depth", "Last: Z-hook wear"], { bg: "#f4efe0", band: "#8a5a1a" }), { px: 256 });
    reg(hits, checklist, "inspection-checklist");
    const tapeRoll = group(g, 2.1, 0.8, -0.3);
    torus(tapeRoll, 0.06, 0.025, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 16 });
    reg(hits, tapeRoll, "caution-tape");
    const logBoard = holoPanel(g, 0.56, 0.38, -2.4, 1.7, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,14,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMPC_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbf0e0";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · COURTYARD", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#eedcc4";
      ["checklist · mulch depth", "needle · swing taped", "bench paint → test", "complaint · rules shown"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.6, accent: PMPC_ACCENT });
    reg(hits, logBoard, "building-log");

    // ------------------------------------------------------------ crew
    const attendant = standingFigure(g, 1.55, 0.35, { ry: 2.8, cloth: 0x8a5a1a, trousers: 0x2b3138 });
    reg(hits, attendant, "attendant-checkin");
    const parent = standingFigure(g, 0.85, -0.2, { ry: -2.2, cloth: 0x5a7a9a, trousers: 0x3a3a48 });
    void parent;
    const toddler = standingPerson(g, -1.7, 1.6, { ry: Math.PI, cloth: 0xf2c14b, hiVis: false });
    toddler.root.scale.set(0.5, 0.5, 0.5);
    toddler.root.visible = false;
    const neighbour = standingPerson(g, -1.0, 1.7, { ry: Math.PI, cloth: 0x6a6a6a, hiVis: false });
    neighbour.root.visible = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.4, 1.0, -1.3),

      onStepComplete(step) {
        if (step.id === "probe-mulch") repaint(probeRead.userData.screen, signFace("LOGGED", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "top-up-mulch") { mulchBucket.visible = false; pitBare.visible = false; }
        if (step.id === "cap-bolt") bolt.visible = false;
        if (step.id === "sweep-sand") needle.visible = false;
        if (step.id === "lower-sail") { sail.position.y = 1.6; winchHandle.rotation.x = 1.0; }
        if (step.id === "walk-courtyard") paver.rotation.x = 0;
        if (step.id === "read-path-light") repaint(meter.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "tape-swing") { bayTape.visible = true; tapeRoll.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "toddler-at-gate") toddler.root.visible = true;
        if (it.id === "no-kids-demand") { neighbour.root.visible = true; noKidsSign.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "toddler-at-gate") {
          if (it.resolved === "answered") { gateLeaf.rotation.y = 0; toddler.root.position.set(1.0, 0, -0.5); }
          else toddler.root.visible = false;
        }
        if (it.id === "no-kids-demand") {
          if (it.resolved === "answered") { noKidsSign.visible = false; neighbour.root.position.set(-2.6, 0, 1.6); }
          else neighbour.root.visible = false;
        }
      },

      animate(t, dt, session) {
        attendant.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        parent.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.4;
        sailCloth.rotation.x = Math.sin(t * 1.3) * 0.03;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "probe-mulch") repaint(probeRead.userData.screen, signFace(`${(gg.t * 16).toFixed(1)} in`, { bg: "#0d1c24", accent: gg.t >= 0.56 && gg.t <= 0.8 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
          if (session.step?.id === "read-path-light") repaint(meter.userData.screen, signFace(`${(gg.t * 5).toFixed(1)} fc`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "lower-sail") sail.position.y = 3.1 - (1 - session.track.v) * 0.3;
      },
    };
  },
};
