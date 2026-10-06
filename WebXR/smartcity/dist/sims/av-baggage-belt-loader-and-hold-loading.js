import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, asphaltFace, concreteFace,
  corrugatedFace, safetyStripeFace, reg,
} from "../citykit.js";
import { regionalJet, cargoBeltLoader } from "../../../shared/equipment.js";
import { palletStack } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Baggage Belt-Loader & Hold Loading VR — its own gamified
// system: Load Balance.
//
// The ramp crew's own order for loading a hold: the loader inspected and
// brought in at walking pace, the load plan read before a single bag moves,
// the hazardous-materials bag spotted and segregated on its own rather than
// stacked against everything else, the hold built bottom-to-top the way the
// plan calls for it, every bit of it tied down before the door ever closes,
// and the weight checked against the plan before the loader backs clear. No
// bag weight, hold capacity or centre-of-gravity limit here is one this
// platform is certain of — those live on the load plan itself.

const AVBG_ACCENT = 0xf2a23b;

export const SIM_AV_BAGGAGE_BELT_LOADER_AND_HOLD_LOADING = {
  id: "av-baggage-belt-loader-and-hold-loading",
  index: "av-4",
  domain: "Aviation",
  trade: "Ramp agent, baggage and cargo loading — IAM/TWU ramp crew",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU ramp training; FAA 14 CFR Part 121 air carrier weight-and-balance and load-planning requirements; OSHA 29 CFR 1910.178 powered industrial trucks and 29 CFR 1910.132 personal protective equipment",
  name: "Baggage Belt-Loader & Hold Loading",
  title: simTitle("Baggage Belt-Loader & Hold Loading"),
  tagline: "A hold loaded to the plan: the loader inspected and brought in at walking pace, the hazmat bag spotted and segregated on its own, the hold built bottom-to-top, every bit of it tied down before the door closes, and the weight checked against the plan before the loader backs clear",
  accent: AVBG_ACCENT,
  accentCss: "#f2a23b",
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "load-balance", name: "Load Balance", note: "Hazmat segregated, the hold built to the plan, tied down before the door closed, and the weight checked before the loader backed away" },

  game: system({
    name: "Load Balance",
    currency: "LOAD",
    ranks: ["Ramp Hand", "Loader Qualified", "Hazmat Spotter", "Lead Loader", "Load Balance Certified"],
    badges: [
      { id: "hazmat-eye", name: "Hazmat Eye", note: "Spotted the hazmat bag and segregated it clean, first time", test: AWARD.stepClean("identify-hazmat") },
      { id: "tied-down", name: "Tied Down", note: "Never closed the door on an unsecured hold", test: AWARD.safe },
      { id: "steady-belt", name: "Steady Belt", note: "Held the belt speed near band centre the whole load", test: AWARD.precise(0.7) },
      { id: "clean-inspection", name: "Clean Inspection Certified", note: "Found every defect on the loader, first pass", test: AWARD.stepClean("inspect-loader") },
    ],
    challenges: [
      { id: "quick-load", name: "Quick Load", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "load-streak", name: "Load Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call at the belt loader is what stayed with you",

  hazards: {
    "under-loader-hazard": "You are standing under the belt loader's platform while it is moving. The platform is a shear point against the aircraft's own sill and against the loader's frame, and there is no room to get clear of it once it is already closing.",
    "stack-against-hazmat-hazard": "That stacks an ordinary bag directly against the hazmat bag instead of its own segregated spot. The segregation distance is what keeps an ordinary bag's own weight and movement away from a package the load plan flagged for a reason this crew was not told the details of, only the rule.",
    "unsecured-load-hazard": "That closes the cargo door before the load is tied down. An unsecured hold shifts under the aircraft's own accelerations the first time it climbs or turns, and a shift that size can move the aircraft's centre of gravity outside where the flight crew planned for it to be.",
    "overweight-hold-hazard": "That keeps loading past the weight the plan called for this hold. Every hold has a limit tied to the aircraft's own structure and its centre of gravity for this flight, and loading past it is not a matter of the hold looking like it has more room — it is a limit the aircraft was never planned to fly past today.",
  },

  lateNotes: {
    "hazmat-bin": "The hazmat bag gets spotted and segregated before the rest of the hold is built around it, not sorted out afterward once it is already buried under other bags.",
    "tiedown-straps": "The load gets tied down before the cargo door ever closes, not checked afterward once the door is already shut.",
  },

  interrupts: [
    {
      id: "belt-jams",
      kind: "Belt jam",
      after: "monitor-belt-speed", delay: 5, seconds: 12,
      alert: "A bag has jammed sideways on the belt and the loader's motor is straining against it.",
      cue: "Hit the belt stop now, before the motor or the bag itself gives.",
      target: "belt-estop",
      why: "A jammed belt under a straining motor either burns out the drive or suddenly frees itself and sends the jammed bag flying, and stopping it the moment it jams is what keeps either outcome from happening in the first place.",
      missNote: "The belt kept straining against the jam instead of being stopped. A motor pushed hard enough against a jam either fails outright or clears itself violently, and neither one is a surprise this crew wants at the sill.",
      wrongNote: "That's not it — the jam is what has to clear before this belt runs again.",
    },
    {
      id: "bag-slides-off",
      kind: "Load shift",
      after: "load-forward-hold", delay: 4, seconds: 11,
      alert: "A bag has come loose on the belt and is sliding back toward the edge of the platform.",
      cue: "Stop the belt now, before the bag goes over the edge.",
      target: "belt-estop",
      why: "A bag that goes over the edge of a raised platform falls onto whoever or whatever is underneath it, and the belt has to stop the instant a load is seen moving on its own rather than trusted to stay put until someone reaches it.",
      missNote: "The belt kept running while the bag slid toward the edge. A bag falling from platform height is exactly the kind of struck-by injury the stop control exists to prevent with one press.",
      wrongNote: "Off target — the sliding bag needs this belt stopped, and nothing about the rest of the load changes that.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "back-support", "work-gloves"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "back-support": "back support belt", "work-gloves": "work gloves" },
      title: "Suit up before loading",
      cue: "Hi-vis vest, back support belt and gloves before anyone touches a bag.",
      why: "Every bag in this hold gets lifted and turned by hand at some point before it settles into place, and the back support belt is what this crew wears on every single load specifically because that repetition is where a back injury actually happens, not on the one heavy bag anyone was already braced for.",
    },
    {
      id: "brief", kind: "select", target: "load-plan-board",
      title: "Read the load plan",
      cue: "Confirm the hold assignment, the weight limit and the hazmat note before anything moves.",
      why: "The load plan is what sets this hold's own weight limit and where each bag is meant to sit for the aircraft's centre of gravity, and a crew that has not read it is building a hold to a guess instead of to the plan the flight was actually released against.",
    },
    {
      id: "inspect-loader", kind: "find", noHint: true,
      targets: ["torn-belt", "hydraulic-leak-loader", "damaged-guardrail"],
      itemNames: {
        "torn-belt": "torn section of the conveyor belt",
        "hydraulic-leak-loader": "hydraulic leak at the ramp",
        "damaged-guardrail": "damaged platform guardrail",
      },
      itemNotes: {
        "torn-belt": "A torn belt can grab a bag's strap or a loose flap and pull a hand in right behind it.",
        "hydraulic-leak-loader": "A leak at the ramp is lift pressure this loader is losing before it ever reaches the sill.",
        "damaged-guardrail": "A guardrail that will not stay latched is the one thing standing between the platform and a fall from it.",
      },
      decoyNotes: { "sound-loader-panel": "The control panel is clean, dry and responds normally. Nothing to flag there." },
      title: "Inspect the belt loader",
      cue: "Walk the loader. Three problems are hiding on it — find them by looking.",
      why: "A loader that looks ready from the ground is not the same thing as one a competent person has actually walked before it reaches the sill — a torn belt, a hydraulic leak or a bad guardrail found now costs a repair, and found once it is loaded and raised costs an injury this crew did not have to have.",
    },
    {
      id: "position-loader", kind: "drag", target: "loader-body",
      title: "Bring the loader in",
      cue: "Drive the loader in at walking pace and stop it short of the aircraft.",
      why: "Every vehicle that approaches a parked aircraft on the ramp does it at walking pace and stops short of the skin — the last distance to the sill is closed with the platform itself, never by rolling the loader the rest of the way in.",
      drag: { to: "sill-approach", radius: 0.5, missNote: "Not stopped short of the aircraft — bring the loader in and stop before the platform reaches the skin." },
    },
    {
      id: "raise-to-sill", kind: "turn", target: "raise-lever",
      title: "Raise the platform to the sill",
      cue: "Turn the raise lever until the platform is level with the cargo door sill.",
      why: "A platform even a little off the sill height is a lip every single bag has to be lifted or dropped over on its way in, and getting that level right once at the start is what keeps the whole load from turning into a lift at every single bag.",
      turn: { turns: 0.4, axis: "z", label: "PLATFORM HEIGHT" },
    },
    {
      id: "open-cargo-door", kind: "select", target: "cargo-door",
      title: "Open the cargo door",
      cue: "Open the cargo door only once the platform is set at the sill.",
      why: "The door opens after the platform is already at the right height so nothing is ever reaching into an open hold from a platform still finding its level, and no bag ever has to be lifted or dropped across a gap that has not settled yet.",
    },
    {
      id: "identify-hazmat", kind: "find", noHint: true,
      targets: ["hazmat-bag"],
      itemNames: { "hazmat-bag": "hazmat-labelled bag" },
      itemNotes: { "hazmat-bag": "The hazmat label is what sets this bag apart from every ordinary one on the belt — it goes in its own segregated spot, not wherever the next gap in the hold happens to be." },
      decoyNotes: { "ordinary-bag": "An ordinary bag, no hazard label. Loads normally with the rest of the hold." },
      title: "Spot the hazmat bag",
      cue: "Find the hazmat-labelled bag on the belt before the rest of the hold is built around it.",
      why: "The hazmat bag has to be identified before it disappears into the middle of a hold built around it — spotted now, it gets its own segregated spot; missed now, it gets found again only by someone digging through bags that were never supposed to be stacked against it.",
    },
    {
      id: "load-forward-hold", kind: "sequence",
      targets: ["heavy-bag-forward", "light-bag-aft"],
      itemNames: { "heavy-bag-forward": "heavy bag, forward and low", "light-bag-aft": "light bag, aft" },
      title: "Build the hold to the plan",
      cue: "Load the heavy bag forward and low first, then the light bag aft.",
      why: "The plan puts weight where it puts it for the aircraft's own centre of gravity, not for convenience — loading heavy and low first is what keeps the bags loaded after it from ever needing to sit somewhere the plan did not put them.",
      outOfOrderNote: "Heavy bag forward and low first, then the light bag — the plan's own centre-of-gravity order, not the order that happens to be easiest to reach.",
    },
    {
      id: "segregate-hazmat", kind: "select", target: "hazmat-bin",
      title: "Segregate the hazmat bag",
      cue: "Place the hazmat bag in its own segregated spot, clear of the rest of the hold.",
      why: "The segregated spot is the one place in this hold built specifically to keep that bag's own hazard away from everything stacked against ordinary bags — putting it anywhere else is the load plan's hazmat note being read and then ignored.",
    },
    {
      id: "secure-tiedown", kind: "sequence", anyOrder: true,
      targets: ["tiedown-straps", "cargo-net"],
      itemNames: { "tiedown-straps": "tie-down straps secured", "cargo-net": "cargo net secured" },
      title: "Secure the load",
      cue: "Secure the tie-down straps and the cargo net before anything else happens to this door.",
      why: "Nothing about this hold is finished until it is physically tied down — a hold that looks built to plan but was never strapped is a load that only stays where it is until the aircraft's own first turn or climb moves it somewhere the plan never accounted for.",
    },
    {
      id: "monitor-belt-speed", kind: "track", target: "belt-controls", seconds: 7,
      title: "Hold the belt speed steady",
      cue: "Keep the belt speed inside the band while the last bags feed up.",
      why: "A belt that surges and stalls is harder to stop cleanly the instant something goes wrong on it, and a steady speed is what keeps every bag arriving at the sill at a rate this crew can actually keep up with rather than a rush this crew is constantly a step behind.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.13, label: "BELT SPEED", readout: (v) => (v < 0.4 ? "too slow" : v > 0.62 ? "running away" : "steady") },
      holdBreakNote: "Belt speed out of band. Bring it back to steady before the next bag reaches the sill.",
    },
    {
      id: "weight-check", kind: "gauge", target: "weight-gauge",
      title: "Check the weight against the plan",
      cue: "Read the hold weight and commit only once it is inside the plan's band.",
      why: "The weight gauge is the one number that tells this crew the hold actually matches the plan's own centre-of-gravity assumptions — stopping short leaves capacity the flight was released expecting to use, and running over puts the hold past a limit tied to the aircraft's own structure.",
      gauge: { label: "HOLD WEIGHT", speed: 0.6, green: [0.46, 0.6], readout: (t) => `${Math.round(t * 100)}% of plan`, missNote: "Outside the plan's band — confirm the weight against the load plan before closing anything." },
    },
    {
      id: "close-cargo-door", kind: "select", target: "cargo-door",
      title: "Close the cargo door",
      cue: "Close the cargo door only once the load is tied down and the weight is confirmed.",
      why: "The door closes last, after the tie-down and the weight are both already confirmed, because everything about a hold this crew cannot see again until the next stop depends on both of those being true before it is sealed shut for the rest of the flight.",
    },
    {
      id: "lower-and-clear", kind: "hold", target: "lower-lever", seconds: 6,
      title: "Lower the platform and clear",
      cue: "Hold the lower control until the platform is fully down, then back the loader clear.",
      why: "A platform lowered halfway and left is a lip at exactly the height most likely to catch a foot or a ground vehicle's mirror, so it comes all the way down under a held control before the loader ever moves off the stand and back into the flow of everything else on the ramp.",
      holdBreakNote: "Released the lower control partway down. Hold it through the whole descent — a platform stopped halfway is a hazard nobody parked here to leave behind.",
    },
    {
      id: "closeout-log", kind: "select", target: "closing-log",
      title: "Log the load",
      cue: "Log the hold weight, the hazmat placement and the tie-down check before signing off.",
      why: "The load log is what the flight crew's own weight and balance and the next station both read — a hold built perfectly to plan but never logged against it leaves nothing behind to prove the aircraft actually got the load it was released to carry.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVBG_ACCENT);

    // ------------------------------------------------------------------ apron ground
    const groundMesh = box(g, 8.4, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2b2d2f", base2: "#252729" }), { repeat: 7, px: 512 }),
      { rough: 0.94, metal: 0.03, color: 0xb4babe },
    );
    // Concrete stand pad under the loader — a second textured surface.
    const padMesh = box(g, 2.4, 0.1, 3.2, 1.6, 0.12, 0.4, 0xffffff, { rough: 0.85, cast: false });
    padMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { tone: "#8b8d89" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xffffff },
    );
    // Hazard striping around the platform's own working zone — a third textured surface.
    for (const [bx, bz, bw, bd] of [[1.6, 2.0, 2.6, 0.15], [1.6, -1.2, 2.6, 0.15]]) {
      const edge = box(g, bw, 0.005, bd, bx, 0.104, bz, 0xffffff, { rough: 0.85, cast: false });
      edge.material = texturedMat(
        surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, {}), { repeat: 2, px: 256 }),
        { rough: 0.8, metal: 0.02, color: 0xffffff },
      );
    }

    // ------------------------------------------------------------------ canopy over the load table (main structure)
    const canopy = group(g, -2.5, 0, 1.8, 0.2);
    for (const [cx2, cz2] of [[-0.8, -0.7], [0.8, -0.7], [-0.8, 0.7], [0.8, 0.7]]) cyl(canopy, 0.05, 0.05, 2.3, cx2, 1.15, cz2, PAL.trim, { rough: 0.5, metal: 0.4, seg: 10 });
    const roof = box(canopy, 2.1, 0.08, 1.8, 0, 2.32, 0, 0xffffff, { rough: 0.6 });
    roof.material = texturedMat(
      surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: PAL.structure, ribs: 8 }), { repeat: 2, px: 512 }),
      { rough: 0.55, metal: 0.25, color: 0xffffff },
    );
    holoTag(canopy, "load table", 0, 2.7, 0, { css: "#f2a23b", w: 0.3 });

    // ------------------------------------------------------------------ aircraft & loader
    const jet = regionalJet(g, 0, 0, -2.4, { livery: { colour: PAL.structure, accent: AVBG_ACCENT, fleetName: "SITE AIR", unitNumber: "N440XA" } });
    holoTag(jet, "aircraft on stand", 0, 3.4, 0, { css: "#f2a23b", w: 0.4 });
    const { cargoDoor } = jet.userData.parts;
    reg(hits, cargoDoor, "cargo-door");

    const loader = cargoBeltLoader(g, 2.2, 0, 1.2, { ry: -2.2, livery: { colour: PAL.accent, fleetName: "RAMP", unitNumber: "BL-9" } });
    reg(hits, loader, "loader-body");
    holoTag(loader, "belt loader", 0, 2.4, 0, { css: "#f2a23b", w: 0.28 });
    const { beltRamp, controlPanel } = loader.userData.parts;
    const sillApproach = group(g, 1.0, 0.3, -0.4);
    hits["sill-approach"] = sillApproach;

    const tornBelt = group(beltRamp, 0, 0.1, 1.2);
    box(tornBelt, 0.1, 0.02, 0.08, 0, 0, 0, 0xb8402f, { rough: 0.7 });
    reg(hits, tornBelt, "torn-belt");
    const hydraulicLeakLoader = group(loader, -0.3, 0.3, -0.5);
    ball(hydraulicLeakLoader, 0.03, 0, 0, 0, 0x2b2318, { rough: 0.5, opacity: 0.7, transparent: true, seg: 10 });
    reg(hits, hydraulicLeakLoader, "hydraulic-leak-loader");
    const damagedGuardrail = group(beltRamp, 0.55, 0.2, -0.6);
    box(damagedGuardrail, 0.05, 0.15, 0.02, 0, 0, 0, 0x5a4a2a, { rough: 0.8 });
    reg(hits, damagedGuardrail, "damaged-guardrail");
    const soundLoaderPanel = group(controlPanel ?? loader, 0, 0.1, 0.08);
    ball(soundLoaderPanel, 0.015, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg(hits, soundLoaderPanel, "sound-loader-panel");

    const raiseLever = group(loader, 0.55, 0.9, -1.3, 0.2);
    box(raiseLever, 0.06, 0.05, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const raiseKnob = cyl(raiseLever, 0.014, 0.014, 0.14, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 10 });
    raiseKnob.rotation.z = Math.PI / 2;
    holoTag(raiseLever, "raise lever", 0, 0.66, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, raiseKnob, "raise-lever");
    const belowLoaderHit = box(g, 1.4, 1.0, 2.6, 1.2, 0.6, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the platform?", 1.2, 1.2, 0.4, { css: "#d2312b", w: 0.44 });
    reg(hits, belowLoaderHit, "under-loader-hazard");

    // ------------------------------------------------------------------ bags & hazmat
    const beltBags = [];
    const bagLayout = [[-0.3, 0.9], [0.0, 1.5], [0.3, 2.1], [-0.15, 2.6]];
    for (const [bx, bz] of bagLayout) { const bag = box(beltRamp, 0.28, 0.18, 0.2, bx, 0.15, bz, 0x59637a, { rough: 0.7 }); beltBags.push(bag); }
    const hazmatBag = box(beltRamp, 0.28, 0.18, 0.2, 0.15, 0.15, 3.0, 0xf2c14b, { rough: 0.6 });
    decal(hazmatBag, 0.24, 0.14, 0, 0, 0.011, signFace("HAZMAT", { bg: "#5a4a0f", accent: "#ffffff", scale: 0.4 }));
    reg(hits, hazmatBag, "hazmat-bag");
    const ordinaryBag = box(beltRamp, 0.28, 0.18, 0.2, -0.2, 0.15, 3.0, 0x59637a, { rough: 0.7 });
    reg(hits, ordinaryBag, "ordinary-bag");

    const heavyBagPick = box(g, 0.32, 0.22, 0.24, 3.4, 0.11, 2.4, 0x3b4148, { rough: 0.7 });
    holoTag(g, "heavy bag", 3.4, 0.34, 2.4, { css: "#f2a23b", w: 0.24 });
    reg(hits, heavyBagPick, "heavy-bag-forward");
    const lightBagPick = box(g, 0.24, 0.16, 0.18, 3.7, 0.08, 2.4, 0xdfe6ea, { rough: 0.7 });
    holoTag(g, "light bag", 3.7, 0.26, 2.4, { css: "#f2a23b", w: 0.22 });
    reg(hits, lightBagPick, "light-bag-aft");
    const stackAgainstHazard = box(g, 0.4, 0.5, 0.4, -0.9, 0.4, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stack against the hazmat bag?", -0.9, 0.7, -1.6, { css: "#d2312b", w: 0.5 });
    reg(hits, stackAgainstHazard, "stack-against-hazmat-hazard");

    const hazmatBin = group(g, -0.9, 0, -2.2, 0.3);
    box(hazmatBin, 0.5, 0.35, 0.5, 0, 0.18, 0, 0xf2c14b, { rough: 0.6 });
    decal(hazmatBin, 0.42, 0.18, 0, 0.18, 0.26, signFace("HAZMAT\nONLY", { bg: "#5a4a0f", accent: "#ffffff", scale: 0.32 }), { px: 256 });
    holoTag(hazmatBin, "hazmat segregated spot", 0, 0.5, 0, { css: "#f2a23b", w: 0.44 });
    reg(hits, hazmatBin, "hazmat-bin");

    const tiedownStraps = group(g, -1.6, 0, -2.2, 0.2);
    box(tiedownStraps, 0.5, 0.03, 0.06, 0, 0.1, 0, AVBG_ACCENT, { rough: 0.6 });
    holoTag(tiedownStraps, "tie-down straps", 0, 0.26, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, tiedownStraps, "tiedown-straps");
    const cargoNet = group(g, -2.1, 0, -1.7, 0.2);
    box(cargoNet, 0.4, 0.02, 0.4, 0, 0.1, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(cargoNet, "cargo net", 0, 0.24, 0, { css: "#f2a23b", w: 0.24 });
    reg(hits, cargoNet, "cargo-net");
    const unsecuredHazard = group(g, -2.6, 0.14, -1.2, 0.2);
    box(unsecuredHazard, 0.06, 0.04, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const closeAnywayPaddle = box(unsecuredHazard, 0.12, 0.08, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(closeAnywayPaddle, 0.1, 0.06, 0, 0, 0.008, signFace("CLOSE\nNOW", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, closeAnywayPaddle, "unsecured-load-hazard");

    const beltControls = group(loader, -0.55, 0.9, -1.3, -0.2);
    box(beltControls, 0.06, 0.05, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55 });
    const beltKnob = ball(beltControls, 0.025, 0, 0.5, 0.03, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.8, seg: 10 });
    holoTag(beltControls, "belt speed control", 0, 0.66, 0, { css: "#f2a23b", w: 0.36 });
    reg(hits, beltKnob, "belt-controls");
    const beltEstop = group(loader, 0, 1.3, -1.4, 0);
    cyl(beltEstop, 0.03, 0.03, 0.05, 0, 0, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 12 });
    const eStopCap = ball(beltEstop, 0.035, 0, 0.03, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.7, seg: 12 });
    holoTag(beltEstop, "belt stop", 0, 0.16, 0, { css: "#d2312b", w: 0.26 });
    reg(hits, eStopCap, "belt-estop");

    const weightGauge = instrument(g, -1.0, 0, 1.0, { ry: 1.0, idle: "--%", color: AVBG_ACCENT });
    holoTag(weightGauge, "hold weight", 0, 0.16, 0, { css: "#f2a23b", w: 0.28 });
    reg(hits, weightGauge, "weight-gauge");
    const overweightHazard = group(g, -1.4, 0.14, 1.3, 0.3);
    box(overweightHazard, 0.06, 0.04, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const loadMorePaddle = box(overweightHazard, 0.12, 0.08, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(loadMorePaddle, 0.1, 0.06, 0, 0, 0.008, signFace("LOAD\nMORE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 }));
    reg(hits, loadMorePaddle, "overweight-hold-hazard");

    const lowerLever = group(loader, 0.55, 0.9, -1.5, 0.2);
    box(lowerLever, 0.06, 0.05, 0.04, 0, 0.42, 0, 0x2b2f34, { rough: 0.55 });
    const lowerKnob = cyl(lowerLever, 0.014, 0.014, 0.14, 0.06, 0.42, 0, 0xf2c14b, { emissive: 0xd8a63a, ei: 0.5, rough: 0.4, seg: 10 });
    lowerKnob.rotation.z = Math.PI / 2;
    holoTag(lowerLever, "lower control", 0, 0.58, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, lowerKnob, "lower-lever");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -2.9, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2a23b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOAD PLAN · HOLD 1", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("HAZMAT SEGREGATED", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Weight limit: per the load plan", "Heavy bags forward and low",
       "Hazmat bag: own segregated spot", "Tie down before the door closes",
       "Weight confirmed before the loader clears"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.4, accent: AVBG_ACCENT });
    reg(hits, plan, "load-plan-board");

    const ppeRack = group(g, -3.4, 0, 2.4, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, AVBG_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const backProp = box(ppeRack, 0.2, 0.14, 0.04, -0.2, 0.6, 0, 0x2b3138, { rough: 0.7 });
    holoTag(backProp, "back support belt", 0, 0.18, 0, { css: "#f2a23b", w: 0.38 });
    reg(hits, backProp, "back-support");
    const gloveProp = box(ppeRack, 0.16, 0.05, 0.1, 0.2, 0.62, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(gloveProp, "work gloves", 0, 0.16, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, gloveProp, "work-gloves");

    const closingLog = group(g, 3.3, 0, -0.6, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("LOAD LOG\nOPEN", { bg: "#11181f", accent: "#f2a23b", scale: 0.3 }), { px: 320 });
    holoTag(closingLog, "load log", 0, 1.34, 0, { css: "#f2a23b", w: 0.26 });
    reg(hits, closingLog, "closing-log");

    // Palletized ULDs staged nearby, dressing the ramp.
    palletStack(g, 3.6, 0, -1.4, {});

    const attendant = standingFigure(g, -0.6, -1.0, { ry: 2.4, cloth: 0x2b3138, vest: AVBG_ACCENT, helmet: 0xf2f2f2 });
    holoTag(attendant, "ramp agent", 0, 1.95, 0.15, { css: "#f2a23b", w: 0.3 });

    const dust = particles(g, 14, 0x9a8a6a, { size: 0.02, life: 0.5, additive: false, opacity: 0.12 });

    let doorOpen = false, platformDown = 1;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.4),

      onInterrupt(it) {
        if (it.id === "belt-jams") { beltRamp.rotation.z = 0.12; }
        if (it.id === "bag-slides-off") { beltBags[0]?.position.set(-0.3, 0.15, 0.6); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "belt-jams") { beltRamp.rotation.z = 0; }
        if (it.id === "bag-slides-off") { beltBags[0]?.position.set(-0.3, 0.15, 0.9); }
      },
      onStepComplete(step) {
        if (step.id === "inspect-loader") {
          tornBelt.children[0].material = mat(0x59c97b, { rough: 0.5 });
          hydraulicLeakLoader.children[0].material = mat(0x59c97b, { rough: 0.5, opacity: 0.3, transparent: true });
          damagedGuardrail.children[0].material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "open-cargo-door") { doorOpen = true; }
        if (step.id === "close-cargo-door") { doorOpen = false; }
        if (step.id === "closeout-log") {
          repaint(closingLogFace, signFace("LOAD LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        const step = session?.step;
        cargoDoor.rotation.y = doorOpen ? 1.1 : 0;
        if (step?.id === "lower-and-clear" && session.holding) platformDown = Math.max(0, platformDown - dt / 6);
        beltRamp.position.y = 0.75 - (1 - platformDown) * 0.35;
        attendant.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "weight-check") {
          repaint(weightGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(1.6, 0.3, 0.4), 0.15, 0.1, -0.08);
      },
    };
  },
};
