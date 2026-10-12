import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace, blockFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Firestop and Fire Wrap Installation VR — Building Systems &
// Facilities, the second of the Insulators and Boilermakers pack. A rated
// wall and a rated floor, each opened by a mechanical or electrical trade for
// their own pipes and cables, closed back up to the listed system: the
// annular space measured before anything is packed, the penetrants checked
// against the drawing, mineral wool and sealant built up to the tested
// depth, an intumescent wrap collar fitted around a combustible pipe, and
// the finished opening labelled so the next trade through here knows it is
// rated again.
//
// Sited generically: no manufacturer's system number, no real building's
// drawing set — the depths and ratios on the readouts are "per the listing".

const IBFW_ACCENT = 0xd8663a;
const IBFW_PAL = palette("construction");

export const SIM_IB_FIRESTOP_AND_FIRE_WRAP_INSTALLATION = {
  id: "ib-firestop-and-fire-wrap-installation",
  index: "353",
  domain: "Facilities",
  trade: "Insulator, firestop and fire-wrap installation — Insulators Local 16",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Insulators Local 16 heat and frost insulators apprenticeship and training; OSHA 29 CFR 1910.1200 hazard communication for the sealant's safety data sheet; 29 CFR 1910.134 respiratory protection against solvent vapour; 29 CFR 1910.1000 air contaminants and the permissible exposure limits; ANSI A10.8 scaffolding safety requirements for the ladder and platform work; NFPA 51B fire prevention during welding, cutting and other hot work for the fire watch coordinated across this wall",
  name: "Firestop and Fire Wrap Installation",
  title: simTitle("Firestop and Fire Wrap Installation"),
  tagline: "A wall and a floor penetration closed back up to the listed firestop system, measured before it is packed and labelled after it is sealed",
  accent: IBFW_ACCENT,
  accentCss: "#d8663a",
  parSeconds: 300,
  footprint: 2.25,
  badge: { id: "opening-rated", name: "Opening Rated", note: "Every penetration closed to the listed system, measured before packing and labelled after sealing" },

  game: system({
    name: "Firestop Certified",
    currency: "SEAL",
    ranks: ["Helper", "Firestop Tech", "Lead Installer", "Firestop Foreman", "Firestop Certified"],
    badges: [
      { id: "listed-system-only", name: "Listed System Only", note: "Never sealed over a mismatched or oversized opening", test: AWARD.safe },
      { id: "measured-not-guessed", name: "Measured, Not Guessed", note: "Held every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "collar-clean", name: "Collar Clean", note: "Fastened the fire wrap collar with no correction", test: AWARD.stepClean("collar-fasten") },
    ],
    challenges: [
      { id: "clean-close", name: "Clean Close", note: "No corrections from the drawing to the label", test: AWARD.clean },
      { id: "steady-bead", name: "Steady Bead", note: "Held the sealant bead through the whole pass", test: AWARD.unbroken },
      { id: "fast-seal", name: "Fast Seal", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-floor-core": "You stepped toward the unpacked floor core as though it were solid decking. An open through-floor penetration wide enough for pipe and cable is also wide enough for a boot, and until it is packed or covered it is a fall-through hazard to the level below — it gets a temporary cover or a barrier the moment it is found open, not a careful step around the edge.",
    "wrong-system-mix": "The cables and the pipe running through this sleeve do not match any penetrant combination the listed system on the drawing was tested with. A firestop system is only rated for the exact mix of pipe, cable and insulation it was tested against — packing an untested combination and sealing over it gives whoever reads that rating years from now a number that was never actually proven for what is really running through the wall.",
    "oversized-annulus": "That gap between the pipe and the sleeve is wider than the listing allows, and packing it the usual way leaves it exactly that — usual, not tested. An oversized annular space needs the wider-opening detail from the system, or a different listed system altogether; forcing standard-depth mineral wool into a gap it was never rated for is a firestop that looks finished and was never actually tested to perform.",
    "solvent-sealant-no-vent": "You are running the solvent-based sealant gun with no ventilation and no respirator on. This sealant's data sheet calls for local exhaust or a fitted respirator specifically because the solvent vapour builds up fastest in the same enclosed spaces this job sends you into — a mechanical shaft or a small equipment room with the door shut behind you.",
  },

  lateNotes: {
    "annular-space-object": "The mineral wool goes in once the annular space has actually been measured against the listing, not before — packing first and checking later just tells you the gap after it is already covered.",
    "fire-wrap-collar": "The collar goes on once the annular space and the penetrant mix are both confirmed against the drawing, not fitted first and questioned afterward.",
  },

  steps: [
    {
      id: "assembly-drawing", kind: "select", target: "system-drawing",
      title: "Read the listed firestop system drawing",
      cue: "Confirm the system number, the penetrants it was tested with and the fill material it calls for.",
      why: "The listed system drawing is the only thing that makes this opening a tested assembly rather than a guess dressed up to look like one — it names the exact pipe or cable types, the annular space range and the fill material the whole rating rests on. Working from a similar-looking drawing on a similar-looking penetration is how a rated wall stops being rated without anyone deciding that on purpose.",
    },
    {
      id: "annular-space", kind: "gauge", target: "gap-probe",
      title: "Measure the annular space",
      cue: "Probe the gap between the pipe and the sleeve and commit once it reads inside the listed range.",
      why: "The annular space is a tested dimension, not a look — too tight and the fill material cannot move the way the listing assumes when the pipe heats and expands; too wide and there is more open gap than the system was ever proven to close. The probe is what tells the two apart before a single handful of mineral wool goes in and hides the number for good.",
      gauge: {
        label: "ANNULAR SPACE", speed: 0.6, green: [0.3, 0.6],
        readout: (t) => `${(t * 2.4).toFixed(2)} in`,
        missNote: "Outside the listed annular space range. Check the drawing for a wider-opening detail or a different system before packing this gap.",
      },
    },
    {
      id: "opening-survey", kind: "find", noHint: true,
      targets: ["floor-core-open", "orphan-conduit", "cracked-sleeve"],
      itemNames: { "floor-core-open": "the unpacked floor core", "orphan-conduit": "the conduit not on the drawing", "cracked-sleeve": "the cracked sleeve" },
      itemNotes: {
        "floor-core-open": "An open core in the floor slab is a fall-through hazard before it is anything else — it gets a temporary cover the moment it is found, whether or not the firestop crew is ready to close it yet.",
        "orphan-conduit": "A conduit running through this opening that never appears on the listed drawing is a penetrant this system was never tested with — it either gets its own reviewed detail or it gets rerouted, not packed in alongside everything the drawing does recognise.",
        "cracked-sleeve": "A cracked steel sleeve no longer holds the annular space the listing assumes, and fill material packed against a broken edge does not behave like fill material packed against a sound one — the sleeve gets replaced before anything goes into it.",
      },
      title: "Survey the opening before packing it",
      cue: "Three things about this opening are not right yet. Find them before the fill material goes in.",
      why: "An opening surveyed honestly before it is packed is a rated assembly; the same opening packed first and questioned later is a guess with a label on it. The open core, the orphan conduit and the cracked sleeve are the three failures that hide completely under finished sealant, which is exactly why they are checked while the opening is still visible.",
    },
    {
      id: "ppe", kind: "sequence",
      targets: ["nitrile-gloves", "vapor-mask", "eye-shield"],
      itemNames: { "nitrile-gloves": "nitrile gloves", "vapor-mask": "organic-vapour respirator", "eye-shield": "eye protection" },
      title: "Don PPE in order",
      cue: "Nitrile gloves first, then the organic-vapour respirator, then eye protection.",
      why: "The gloves go on before the sealant cartridge is ever loaded, because this material is meant to stay off skin from the first squeeze; the respirator seats next against a clean face rather than one already sweating under safety glasses; the eyewear goes on last so it is not fogged by the mask's exhale valve before the work even starts.",
      outOfOrderNote: "Wrong order — gloves before the cartridge is loaded, respirator seated on a clean face, eyewear last.",
    },
    {
      id: "mineral-wool-packing", kind: "hold", target: "annular-space-object", seconds: 5,
      title: "Pack the mineral wool backer",
      cue: "Pack the mineral wool into the annular space and hold it compressed to the listed density.",
      why: "The backer is packed to a specified density, not simply stuffed until the gap looks full — under-compressed and the sealant has nothing firm to bear against as it cures; over-compressed and it no longer holds the pipe centred the way the listing assumes. The hold is what proves it actually reached that density rather than looking packed for a moment before springing back.",
      holdBreakNote: "Released before it compressed to depth. Mineral wool packed loosely today is an air gap behind finished sealant tomorrow.",
    },
    {
      id: "position-collar", kind: "drag", target: "fire-wrap-collar",
      title: "Position the intumescent fire wrap collar",
      cue: "Carry the collar to the combustible pipe and set it against the wall face.",
      why: "A combustible pipe cannot simply be packed like a steel one — it needs a collar of intumescent material that stays inert at room temperature and expands to crush the pipe shut only once a fire actually reaches it, and that collar has to sit flush against the wall face to close the opening the moment the pipe is gone.",
      drag: { to: "collar-mount-point", radius: 0.5, missNote: "Not seated against the wall face yet. The collar only closes this opening in a fire if it is mounted exactly where the drawing places it." },
    },
    {
      id: "collar-fasten", kind: "sequence",
      targets: ["collar-wrap", "collar-latch", "collar-fasteners"],
      itemNames: { "collar-wrap": "collar wrapped around the pipe", "collar-latch": "latch closed", "collar-fasteners": "fasteners driven" },
      title: "Wrap, latch and fasten the collar",
      cue: "Wrap the collar fully around the pipe, close the latch, then drive the mounting fasteners.",
      why: "The collar has to be fully wrapped before the latch closes anything, because a latch closed over a partial wrap holds a gap shut rather than a pipe; the fasteners go in last so the collar cannot walk loose from vibration once it is holding its final shape against the wall.",
      outOfOrderNote: "Wrong order — full wrap first, then the latch, then the fasteners into the wall.",
    },
    {
      id: "torque-fastener", kind: "turn", target: "collar-strap",
      title: "Torque the collar strap",
      cue: "Turn the wrench on the collar's mounting strap to the specified torque.",
      why: "A collar mounted loose can shift off-centre on the pipe long before any fire ever reaches it, and shifted off-centre is not the position it was tested in. The torque is turned to the number on the listing, not to a feel — a strap left loose fails silently and a strap overtightened can distort the collar's shell before it has done anything at all.",
      turn: { turns: 1.0, axis: "z", label: "COLLAR STRAP TORQUE", readout: (t) => `${Math.round(t * 100)}% OF SPEC` },
    },
    {
      id: "apply-sealant", kind: "track", target: "sealant-gun", seconds: 7,
      title: "Run the sealant bead",
      cue: "Hold the caulking gun steady across the opening at an even bead rate.",
      why: "An even bead rate is what leaves a continuous, void-free seal across the whole opening — too fast and the bead thins out and skips low spots; too slow and it puddles in one place while starving the rest of the joint, and a firestop with a void in it is a firestop that was never actually finished.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "SEALANT BEAD RATE",
        readout: (v) => (v < 0.36 ? "starving — leaving gaps" : v > 0.6 ? "pooling — uneven depth" : "even continuous bead"),
      },
      holdBreakNote: "Bead rate slipped out of band. Bring it back even before it leaves a gap the depth check will only find after it has cured.",
    },
    {
      id: "sealant-depth", kind: "gauge", target: "depth-probe",
      title: "Check the sealant depth",
      cue: "Probe the wet sealant and commit once the depth reads inside the listed range.",
      why: "The system's fire rating is tested at a specific sealant depth, and the only way to know this joint actually reached it is to probe it while the material is still wet enough to correct — checking after it cures turns a two-minute fix into a cut-out and redo.",
      gauge: {
        label: "SEALANT DEPTH", speed: 0.65, green: [0.42, 0.68],
        readout: (t) => `${(t * 1.2).toFixed(2)} in`,
        missNote: "Depth outside the listed range. Add material or tool it down while it is still workable, before it sets.",
      },
    },
    {
      id: "label-install", kind: "select", target: "system-label",
      title: "Install the firestop system identification label",
      cue: "Attach the permanent label naming the system number and the date beside the opening.",
      why: "The label is what tells the next trade through here — the one cutting a new cable path five years from now — exactly which listed system this opening was closed to, so they open the right drawing instead of guessing from what they can see. An unlabelled firestop is invisible information the day somebody needs it most.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["pinhole-void", "missed-cable", "smeared-label"],
      itemNames: { "pinhole-void": "the pinhole void in the sealant", "missed-cable": "the cable left outside the fill", "smeared-label": "the label smeared before it set" },
      itemNotes: {
        "pinhole-void": "A pinhole in the cured sealant is a path smoke and hot gas will find well before the fire itself does — it gets probed and patched now, while the crew and their tools are still standing here.",
        "missed-cable": "A cable routed outside the packed fill material is a cable that was never actually part of this firestop, however close it runs beside it — it comes inside the fill or it gets its own reviewed detail.",
        "smeared-label": "A label smeared illegible before the adhesive set tells the next trade nothing at all — it gets replaced now, while the crew that knows this system number is still on site to read it correctly.",
      },
      title: "Walk the finished opening",
      cue: "Three things about this closed opening are not right. Find them before signing off.",
      why: "A firestop that looks finished and a firestop that is actually finished are told apart at the pinhole, the stray cable and the label — the three things a walk-down catches while the crew that built this is still here to fix them, rather than an inspector months later.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibfw-crew-checkin",
      title: "Check in with the firestop foreman",
      cue: "Report the orphan conduit, the cracked sleeve and how the sealant fumes felt in that space.",
      why: "The orphan conduit needs its own reviewed detail before anyone seals around it, and the cracked sleeve needs replacing on tomorrow's list — neither of those happens unless the foreman hears about them today. The check-in is also where a space that needed better ventilation than it had gets flagged before the next crew works it the same way.",
    },
    {
      id: "closing-log", kind: "select", target: "ibfw-closing-log",
      title: "Sign the firestop closeout log",
      cue: "Record the system number, the annular space and sealant depth readings, and the openings flagged for follow-up, then sign.",
      why: "The closeout log is the paper trail that turns a sealed opening into a documented, inspectable one — the system number for the next trade, the actual measured readings against the listing, and the orphan conduit and cracked sleeve flagged so the follow-up work does not depend on anyone's memory of today.",
    },
  ],

  interrupts: [
    {
      id: "adjacent-hot-work",
      kind: "Hot work nearby",
      after: "mineral-wool-packing", delay: 4, seconds: 12,
      alert: "A welder on the far side of this wall has started hot work, and sparks are visible through the still-open gap beside your packing.",
      cue: "Call the fire watch before this opening is sealed shut on a live spark hazard.",
      target: "fire-watch-radio",
      why: "Hot work on the other side of an opening you are actively closing is a coordination problem before it is a firestop problem — sealing this gap without telling anyone traps whatever heat or spark just came through on your side of the wall, and the fire watch on the other side needs to know a crew is working the same opening from here.",
      missNote: "The packing continued while sparks kept coming through the gap. An opening being closed on one side while hot work runs on the other is exactly the coordination failure the radio call exists to prevent.",
      wrongNote: "It is the fire-watch radio. Nothing about this opening gets sealed until both crews know what the other is doing.",
    },
    {
      id: "cable-pull-crew",
      kind: "Second crew arriving",
      after: "apply-sealant", delay: 4, seconds: 12,
      alert: "A second crew has shown up to pull a new data cable through this exact opening while the sealant is still wet.",
      cue: "Stop them before they disturb an uncured seal.",
      target: "stop-work-sign",
      why: "Sealant pulled through by a cable before it has cured never actually seals anything — it tears, it channels, and the firestop crew has no way to know that happened until someone probes the depth and finds a hole where the seal should be. The stop-work sign is what buys the cure time this seal needs before anyone else touches the opening.",
      missNote: "The second crew pulled their cable through while the sealant was still soft. Whatever seal existed in that opening a moment ago now has a channel torn straight through it, invisible from either side of the wall.",
      wrongNote: "That is not it. The stop-work sign is what actually keeps another crew's hands out of an opening that has not cured yet.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Insulators Local 16 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.25, IBFW_ACCENT);

    // ------------------------------------------------------------- floor and rated wall
    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "smooth", tone: "#716c64", tone2: "#615c54",
    }), { repeat: 6 });
    const floor = box(g, 6.4, 0.1, 6.0, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9 });

    const wallTex = surfaceTexture((cx, w, h) => blockFace(cx, w, h, {
      block: IBFW_PAL.structure, joint: "#5c5750",
    }), { repeat: 4 });
    const ratedWall = box(g, 4.2, 2.6, 0.24, -0.9, 1.3, -1.8, 0xffffff, { rough: 0.85, metal: 0.1 });
    ratedWall.material = texturedMat(wallTex, { rough: 0.85 });
    holoTag(ratedWall, "2-hour rated wall", 0, 1.5, 0, { css: "#d8663a", w: 0.5 });

    // The steel sleeve through the rated wall, with a pipe and a bundle of
    // cable already routed through it before this crew arrived.
    const sleeve = group(g, -0.9, 1.35, -1.8);
    const sleeveTube = cyl(sleeve, 0.16, 0.16, 0.3, 0, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 18, open: true });
    sleeveTube.rotation.x = Math.PI / 2;
    reg2(sleeveTube, "sleeve");
    const pipeThrough = cyl(sleeve, 0.07, 0.07, 0.7, 0, 0, 0, 0xb8402f, { rough: 0.6, metal: 0.2, seg: 16 });
    pipeThrough.rotation.x = Math.PI / 2;
    const gapProbeTarget = torus(sleeve, 0.115, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.4 });
    gapProbeTarget.rotation.x = Math.PI / 2;
    holoTag(sleeve, "Annular space", 0, 0.25, 0.16, { css: "#d8663a", w: 0.38 });
    reg2(gapProbeTarget, "gap-probe");
    const packedWool = torus(sleeve, 0.115, 0.045, 0, 0, 0, 0xe8e2d4, { rough: 0.95 });
    packedWool.rotation.x = Math.PI / 2;
    packedWool.visible = false;
    reg2(packedWool, "annular-space-object");
    const sealantBead = torus(sleeve, 0.15, 0.02, 0, 0, 0.14, 0x8b929a, { rough: 0.6 });
    sealantBead.rotation.x = Math.PI / 2;
    sealantBead.visible = false;
    reg2(sealantBead, "depth-probe");

    const crackedSleeve = group(sleeve, 0.4, 0, 0);
    torus(crackedSleeve, 0.1, 0.012, 0, 0, 0, 0x8b929a, { rough: 0.6, metal: 0.4 }).rotation.x = Math.PI / 2;
    box(crackedSleeve, 0.02, 0.06, 0.01, 0.09, 0.02, 0, 0x1b1e22, { cast: false });
    holoTag(crackedSleeve, "Cracked sleeve", 0, 0.2, 0, { css: "#f0645b", w: 0.34 });
    reg2(crackedSleeve, "cracked-sleeve");

    const orphanConduit = cyl(g, 0.03, 0.03, 0.6, -0.35, 1.55, -1.8, 0x3a78c9, { rough: 0.5, metal: 0.3, seg: 12 });
    orphanConduit.rotation.x = Math.PI / 2;
    holoTag(g, "Conduit not on the drawing", -0.35, 1.72, -1.75, { css: "#f0645b", w: 0.52 });
    reg2(orphanConduit, "orphan-conduit");

    // ----------------------------------------------------------------- floor core
    const floorCore = group(g, 1.1, 0, -0.2);
    box(floorCore, 0.5, 0.1, 0.5, 0, 0.05, 0, 0x11151a, { rough: 0.95, cast: false });
    const coreConduit = cyl(floorCore, 0.05, 0.05, 0.6, 0, 0.2, 0, 0x3a78c9, { rough: 0.5, metal: 0.3, seg: 12 });
    void coreConduit;
    holoTag(floorCore, "Open floor core", 0, 0.24, 0, { css: "#f0645b", w: 0.4 });
    reg2(floorCore, "open-floor-core");
    reg2(floorCore, "floor-core-open");

    // ------------------------------------------------------------- fire wrap collar (combustible pipe)
    const combustiblePipe = group(g, 0.9, 0, -1.4);
    const cpvc = cyl(combustiblePipe, 0.05, 0.05, 2.4, 0, 1.35, 0, 0xd8d090, { rough: 0.6, seg: 16 });
    void cpvc;
    holoTag(combustiblePipe, "Combustible pipe run", 0, 2.65, 0, { css: "#d8663a", w: 0.44 });
    const collarMount = group(combustiblePipe, 0, 1.35, 0);
    box(collarMount, 0.3, 0.3, 0.02, 0, 0, 0.13, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["collar-mount-point"] = collarMount;
    const collar = group(g, 0.4, 1.35, -0.9, 0.4);
    torus(collar, 0.14, 0.06, 0, 0, 0, 0x2b6f4f, { rough: 0.6, seg: 10, seg2: 20 });
    holoTag(collar, "Fire wrap collar", 0, 0.22, 0, { css: "#d8663a", w: 0.4 });
    reg2(collar, "fire-wrap-collar");
    const collarLatch = box(collar, 0.05, 0.08, 0.03, 0.14, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    reg2(collarLatch, "collar-wrap");
    const collarLatchClose = box(collar, 0.04, 0.06, 0.02, 0.16, 0.02, 0, 0xd8b23a, { rough: 0.4, metal: 0.6 });
    reg2(collarLatchClose, "collar-latch");
    const collarFasteners = group(collar, -0.14, 0, 0);
    for (let i = 0; i < 3; i++) cyl(collarFasteners, 0.01, 0.01, 0.03, 0, 0.05 * i - 0.05, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    reg2(collarFasteners, "collar-fasteners");
    const strapWrench = box(collar, 0.16, 0.03, 0.03, 0, 0.2, 0, 0x3a78c9, { rough: 0.4, metal: 0.3 });
    reg2(strapWrench, "collar-strap");

    // ------------------------------------------------------------- tool bench
    const bench = group(g, -2.0, 0, 0.6);
    slab(bench, 1.0, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const gunTarget = group(bench, 0.2, 0.72, 0.15, -0.3);
    box(gunTarget, 0.06, 0.16, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    cyl(gunTarget, 0.018, 0.024, 0.2, 0, 0.15, 0.05, 0xb8b0a0, { rough: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(gunTarget, "Sealant gun", 0, 0.24, 0, { css: "#d8663a", w: 0.34 });
    reg2(gunTarget, "sealant-gun");

    const probe = instrument(bench, -0.2, 0.75, -0.1, { idle: "-- in", color: IBFW_ACCENT });
    holoTag(probe, "Gap / depth probe", 0, 0.16, 0, { css: "#d8663a", w: 0.42 });
    // Shares its readout with both gauge steps.
    hits["gap-probe-inst"] = probe;

    const solventGun = group(bench, 0.15, 0.72, -0.15, 0.3);
    box(solventGun, 0.05, 0.14, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(solventGun, "Solvent sealant, no vent", 0, 0.2, 0, { css: "#f0645b", w: 0.5 });
    reg2(solventGun, "solvent-sealant-no-vent");
    const solventFumes = particles(solventGun, 18, 0xbfc8cf, { size: 0.02, life: 0.5, additive: false, opacity: 0.25 });
    solventFumes.visible = false;

    // Undersized / oversized alternative annulus, staged as a hazard object.
    const oversizedTrap = group(g, 1.7, 0, -1.8);
    torus(oversizedTrap, 0.2, 0.06, 0, 1.4, 0, 0xb8402f, { rough: 0.6 }).rotation.x = Math.PI / 2;
    holoTag(oversizedTrap, "Oversized gap — pack it anyway?", 0, 1.7, 0, { css: "#f0645b", w: 0.62 });
    reg2(oversizedTrap, "oversized-annulus");

    const wrongMixTrap = group(g, -1.8, 0, -1.8);
    cyl(wrongMixTrap, 0.1, 0.1, 0.3, 0, 1.35, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 16, open: true }).rotation.x = Math.PI / 2;
    for (const dz of [-0.05, 0.05]) cyl(wrongMixTrap, 0.02, 0.02, 0.4, 0, 1.35, dz, 0x3a78c9, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(wrongMixTrap, "Not on the listing", 0, 1.6, 0, { css: "#f0645b", w: 0.48 });
    reg2(wrongMixTrap, "wrong-system-mix");

    // ------------------------------------------------------------------ PPE
    const ppeRack = group(g, -2.1, 0, -1.2, 0.5);
    slab(ppeRack, 0.1, 1.4, 0.5, 0, 0.7, 0, 0x4a525a, { radius: 0.02, rough: 0.6, metal: 0.4 });
    const gloves = box(ppeRack, 0.14, 0.08, 0.05, 0.08, 1.0, 0.15, 0xdfe4a8, { rough: 0.65 });
    holoTag(gloves, "Nitrile gloves", 0, 0.12, 0, { css: "#d8663a", w: 0.36 });
    reg2(gloves, "nitrile-gloves");
    const respMask = box(ppeRack, 0.12, 0.08, 0.06, 0.08, 1.25, 0.15, 0x2b3138, { rough: 0.5, metal: 0.2 });
    holoTag(respMask, "Vapour respirator", 0, 0.12, 0, { css: "#d8663a", w: 0.4 });
    reg2(respMask, "vapor-mask");
    const eyeShield = box(ppeRack, 0.14, 0.05, 0.05, 0.08, 1.45, 0.15, 0xbfe8ff, { rough: 0.3, opacity: 0.7, transparent: true });
    holoTag(eyeShield, "Eye protection", 0, 0.1, 0, { css: "#d8663a", w: 0.36 });
    reg2(eyeShield, "eye-shield");

    // ------------------------------------------------------------------- label + walk targets
    const labelTarget = decal(sleeve, 0.16, 0.1, 0, -0.24, 0.16, signFace("FIRESTOP\nSYSTEM", { bg: "#1b1e22", accent: "#d8663a", fg: "#f4ecd8", scale: 0.32 }), { px: 200 });
    reg2(labelTarget, "system-label");

    const pinhole = ball(sleeve, 0.012, 0.06, 0.16, 0.1, 0x000000, { rough: 0.9 });
    holoTag(sleeve, "Pinhole void", 0.06, 0.32, 0.1, { css: "#f0645b", w: 0.36 });
    reg2(pinhole, "pinhole-void");
    const missedCable = cyl(g, 0.015, 0.015, 0.5, -1.3, 1.4, -1.7, 0x2b6f4f, { rough: 0.6, seg: 8 });
    missedCable.rotation.x = Math.PI / 2;
    holoTag(g, "Cable outside the fill", -1.3, 1.55, -1.65, { css: "#f0645b", w: 0.46 });
    reg2(missedCable, "missed-cable");
    const smearedLabel = decal(g, 0.14, 0.08, -1.1, 0.9, -1.66, signFace("SM3AR", { bg: "#3a2a1a", accent: "#8a6640", fg: "#8a6640", scale: 0.3 }), { px: 160 });
    holoTag(g, "Label smeared before it set", -1.1, 1.04, -1.66, { css: "#f0645b", w: 0.5 });
    reg2(smearedLabel, "smeared-label");

    // ------------------------------------------------------------------- paperwork + crew
    const drawing = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,6,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8663a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9b39a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FIRESTOP SYSTEM DRAWING", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4ecd8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("WALL PENETRATION — LISTED SYSTEM", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9b39a";
      ["Annular space: per the listing", "Fill: mineral wool + sealant",
        "Combustible pipe: intumescent collar", "Sealant depth: per the listing",
        "Label required on completion"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBFW_ACCENT });
    reg2(drawing, "system-drawing");

    const chest = toolChest(g, 2.0, 1.3, { ry: -0.6, color: IBFW_ACCENT });
    void chest;

    // Staged cartridges and a short A-frame ladder for the wall work.
    const cartridgeRack = group(g, -1.6, 0, 1.4);
    for (let i = 0; i < 6; i++) {
      cyl(cartridgeRack, 0.03, 0.03, 0.28, (i % 3) * 0.08 - 0.08, 0.14, Math.floor(i / 3) * 0.09, 0xd8663a, { rough: 0.5, seg: 12 });
    }
    holoTag(cartridgeRack, "Sealant cartridges", 0, 0.32, 0, { css: "#d8663a", w: 0.42 });

    const ladder = group(g, -0.4, 0, -0.9, 1.57);
    for (const sx of [-0.18, 0.18]) cyl(ladder, 0.014, 0.014, 1.9, sx, 0.95, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 8 });
    for (let i = 0; i < 6; i++) box(ladder, 0.4, 0.02, 0.02, 0, 0.2 + i * 0.32, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });

    const foreman = standingFigure(g, -2.65, -0.9, { ry: 0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.6, 1.6, -2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,10,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8663a"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ecd8";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("orphan conduit · cracked sleeve · crew status", w / 2, h * 0.68);
    }, { accent: IBFW_ACCENT });
    reg2(checkin, "ibfw-crew-checkin");

    const welder = standingFigure(g, 2.35, -1.5, { ry: -1.4, cloth: 0x2b3138, helmet: 0xf2c14b, vest: 0xd8e24a });
    const weldSparks = particles(welder, 14, 0xffb347, { size: 0.02, life: 0.3, additive: true, opacity: 0.6 });
    weldSparks.position.set(0, 1.1, 0.15);
    weldSparks.visible = false;

    const radio = group(g, 1.9, 0, 0.9, -0.3);
    box(radio, 0.06, 0.14, 0.04, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    holoTag(radio, "Fire-watch radio", 0, 1.02, 0, { css: "#d8663a", w: 0.4 });
    reg2(radio, "fire-watch-radio");

    const stopSign = group(g, 0.9, 0, 1.3, 0.2);
    box(stopSign, 0.28, 0.28, 0.02, 0, 1.2, 0, 0xc8102e, { rough: 0.6 });
    decal(stopSign, 0.22, 0.1, 0, 1.2, 0.011, signFace("STOP\nCURING", { bg: "#c8102e", accent: "#ffffff", fg: "#ffffff", scale: 0.4 }), { px: 180 });
    holoTag(stopSign, "Stop-work sign", 0, 1.4, 0, { css: "#d8663a", w: 0.38 });
    reg2(stopSign, "stop-work-sign");

    const cablePuller = standingFigure(g, 2.1, -1.3, { ry: -0.7, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xe4622a });
    void cablePuller;

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.6, 0.93, -2.6, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Firestop closeout log", -2.6, 1.12, -2.6, { css: "#8fa9c4", w: 0.46 });
    reg2(closingLog, "ibfw-closing-log");

    // ----------------------------------------------------------------- state

    return {
      hits,
      footprint: 2.25,

      onStepComplete(step) {
        if (step.id === "mineral-wool-packing") packedWool.visible = true;
        if (step.id === "apply-sealant") sealantBead.visible = true;
        if (step.id === "final-walk") {
          pinhole.material = mat(0x8b929a, { rough: 0.6 });
          smearedLabel.material = mat(0xffffff, { transparent: true });
          repaint(smearedLabel, signFace("FIRESTOP\nSYSTEM", { bg: "#1b1e22", accent: "#d8663a", fg: "#f4ecd8", scale: 0.32 }));
        }
      },

      onInterrupt(it) {
        if (it.id === "adjacent-hot-work") weldSparks.visible = true;
        if (it.id === "cable-pull-crew") cablePuller.position.z = -0.3;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "adjacent-hot-work") weldSparks.visible = false;
        if (it.id === "cable-pull-crew") cablePuller.position.z = -1.3;
      },

      onHazard(hitId) {
        if (hitId === "solvent-sealant-no-vent") solventFumes.visible = true;
      },

      animate(t, dt, session) {
        if (weldSparks.visible) weldSparks.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.08, 0.6, -0.6);
        if (solventFumes.visible) solventFumes.userData.step(dt, new THREE.Vector3(0, 0.1, 0), 0.05, 0.2, 0.3);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "annular-space") {
            const v = (gg.t * 2.4).toFixed(2);
            repaint(probe.userData.screen, signFace(`${v}"`, {
              bg: "#0d1c24", accent: gg.t > 0.3 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (session.step?.id === "sealant-depth") {
            const v = (gg.t * 1.2).toFixed(2);
            repaint(probe.userData.screen, signFace(`${v}"`, {
              bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
