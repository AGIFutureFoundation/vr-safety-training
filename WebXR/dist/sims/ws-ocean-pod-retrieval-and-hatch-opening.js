import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, deckPlateFace, palette,
} from "../citykit.js";
import { oceanDataPod } from "../../../shared/equipment.js";
import { deckCrane } from "../../../shared/fleet.js";
import { radio, tagLine } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ocean Pod Retrieval & Hatch Opening VR — Connectivity &
// Telecom, IBEW / IUOE marine data-centre crew.
//
// A sealed data pod is brought up from its seabed skid by the workboat's
// deck crane, landed in its cradle and only then opened. The sea state is
// read against the lift plan before the hook goes down; the diver who rigged
// the bridle is out of the water and accounted for before the hoist moves;
// the pod is controlled with tag lines over the rail, sea-fastened, its
// shore cable isolated and locked, and its leak lamp read before a single
// hatch bolt turns. Sited generically: no depth, load, sea state or voltage
// is stated — each is the lift plan's, the dive plan's and the pod's own
// operating procedure's.

const WS8_ACCENT = 0x3f9fc4;
const WS8_CSS = "#3f9fc4";
const WS8_PAL = palette("marine");

export const SIM_WS_OCEAN_POD_RETRIEVAL_AND_HATCH_OPENING = {
  id: "ws-ocean-pod-retrieval-and-hatch-opening",
  index: "ws-08",
  domain: "Connectivity",
  trade: "IBEW / IUOE marine data-centre crew",
  category: "Connectivity & Telecom",
  district: "ocean-data-center",
  weather: "wind",
  certification: "IBEW/NECA JATC training as a body for the pod's electrical isolation; 29 CFR 1910.147 for locking out the shore cable before the hatch; NFPA 70E and 29 CFR 1910.333 for the electrically safe work condition inside the pod; 29 CFR 1910.28 for the deck edge and 29 CFR 1910.132 for the deck PPE and flotation; the lift plan, the dive plan and the pod's operating procedure for every sea state, load, depth and diving limit",
  name: "Ocean Pod Retrieval & Hatch Opening",
  title: simTitle("Ocean Pod Retrieval & Hatch Opening"),
  tagline: "The sea state read against the lift plan, the diver out and counted before the hoist moves, the pod brought over the rail on tag lines, sea-fastened and isolated, and its leak lamp read before a hatch bolt turns",
  accent: WS8_ACCENT,
  accentCss: WS8_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: { id: "landed-isolated-opened", name: "Landed, Isolated, Opened", note: "The pod lifted to the plan, landed and fastened, its cable locked out and its leak lamp read before the hatch came off" },

  game: system({
    name: "Marine Data Authority",
    currency: "LIFTS",
    ranks: ["Deckhand", "Rigger", "Pod Technician", "Lift Supervisor", "Marine Data Authority Certified"],
    badges: [
      { id: "diver-counted", name: "Diver Counted", note: "The diver was out and accounted for before the hoist moved", test: AWARD.stepClean("diver-clear") },
      { id: "no-hands-in-the-bight", name: "No Hands in the Bight", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-taglines", name: "Steady Tag Lines", note: "Held the pod steady over the rail", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-recovery", name: "Clean Recovery", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "unbroken-hoist", name: "Unbroken Hoist", note: "The hoist ran without a break", test: AWARD.unbroken },
      { id: "brisk-recovery", name: "Brisk Recovery", note: "Recovered and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stand-under-load": "You went to stand under the pod as it swung in over the deck. A suspended load moves with the boat as well as the crane, and the only safe place for a person is outside the area it could land in.",
    "hand-between-pod-and-rail": "You went to put a hand on the pod between it and the rail to steady it. A roll of the boat closes that gap faster than a hand can come out; the tag line is how a load is steadied from a distance.",
    "lift-with-diver-in-water": "You went to start the hoist with the diver still in the water. A load coming off the seabed stirs the bottom, swings on its bridle and can foul the diver's umbilical — the lift waits until the dive supervisor says the diver is out.",
    "open-hatch-cable-live": "You went to unbolt the hatch with the shore cable still energised. The pod's power and its batteries are behind that hatch, and the cable is isolated and locked before anyone reaches in.",
  },

  lateNotes: {
    "pod-landing": "The pod is landed only once it is under control on the tag lines and the cradle is clear — never dropped onto the deck on the roll.",
    "hatch-bolts": "The hatch bolts are turned only once the pod is sea-fastened, its cable locked out and its leak lamp read.",
  },

  faults: [
    {
      id: "leak-detect",
      label: "Pod leak detection",
      note: "The pod's leak-detect lamp is showing red on deck. The hatch is not opened: tag it on hold and report to the pod engineer, who follows the pod's own leak procedure.",
      step: "open-hatch",
      change: {
        kind: "select", target: "hatch-hold-tag",
        title: "Hold the hatch and report the leak",
        cue: "The leak lamp is red — hang the hold tag on the hatch and report to the pod engineer instead of unbolting it.",
        why: "A leak alarm means water or a changed atmosphere may be inside a sealed vessel full of powered equipment and batteries, and opening the hatch on it releases whatever that is at the face of the person with the wrench. Holding the hatch and reporting hands the decision to the engineer who owns the pod's leak procedure.",
        turn: undefined,
      },
    },
  ],

  interrupts: [
    {
      id: "wake-roll",
      kind: "A passing wake rolls the workboat",
      after: "hoist", delay: 3, seconds: 11,
      alert: "A wake from a passing vessel is rolling the workboat and the pod is swinging on the hook just below the rail.",
      cue: "Stop the hoist at the crane's stop control until the boat settles.",
      target: "crane-stop",
      why: "A load swinging at the rail as the boat rolls is the most dangerous moment of a recovery; stopping the hoist holds the pod below the rail, clear of the deck and the crew, until the roll has passed and the tag lines have it again.",
      missNote: "The hoist kept coming up through the roll with the pod swinging at the rail.",
      wrongNote: "It is the crane's stop. The hoist control is what brought the pod up into the roll.",
    },
    {
      id: "squall-call",
      kind: "The skipper calls a squall line",
      after: "taglines", delay: 3, seconds: 12,
      alert: "The skipper is calling from the wheelhouse — a squall line is coming down the channel toward the boat.",
      cue: "Answer the bridge on the radio and agree whether the lift lands now or holds.",
      target: "bridge-radio",
      why: "The skipper sees the weather coming and the lift supervisor sees the load; a squall on a boat with a pod on the hook is a decision for both of them together, made on the radio before the wind arrives rather than shouted across the deck after.",
      missNote: "The skipper's call went unanswered with the pod still on the hook.",
      wrongNote: "It is the bridge radio. The tag lines hold the pod; the call decides what happens next.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW or IUOE steward if you are not sure how to reach it",

  steps: [
    {
      id: "plans", kind: "select", target: "lift-plan",
      title: "Read the lift plan and the dive plan",
      cue: "Read the lift plan and the dive plan: the pod's weight per the plan, the crane's radius, the sea-state limit and the diving limits.",
      why: "The lift plan fixes what the crane may lift at what radius and in what sea, and the dive plan fixes what the diver does and when they are out; both are read before the hook goes in the water so the day's decisions are made against paper rather than against impatience.",
    },
    {
      id: "sea-state", kind: "gauge", target: "sea-state-readout",
      title: "Read the sea state against the lift plan",
      cue: "Bring the sea-state reading up to where it is and commit — inside the lift plan's limit or not?",
      why: "A crane on a boat lifts a load that moves with the swell, and the lift plan's sea-state limit is where that motion stays within what the crane and the crew can control; read against the written limit, the reading is the go or no-go for the whole recovery.",
      gauge: { label: "SEA STATE vs LIFT PLAN", speed: 0.6, green: [0.3, 0.55], readout: (t) => (t > 0.55 ? "over the lift plan's limit" : t < 0.3 ? "check the reading" : "inside the lift plan's limit"), missNote: "That is not the reading — read the sea state again before the go or no-go." },
    },
    {
      id: "deck-prep", kind: "sequence",
      targets: ["deck-cradle-ready", "tagline-ready"],
      itemNames: { "deck-cradle-ready": "deck cradle cleared and chocked", "tagline-ready": "tag lines flaked and manned" },
      title: "Prepare the deck",
      cue: "Clear and chock the deck cradle, then flake out the tag lines and man them.",
      why: "The pod needs somewhere to land the moment it clears the rail, and the tag lines need hands on them before it gets there; a deck prepared in advance keeps the load's time in the air as short as it can be.",
      outOfOrderNote: "Cradle, then tag lines — the lines lead to where the pod will land.",
    },
    {
      id: "diver-clear", kind: "select", target: "dive-supervisor-radio",
      title: "Confirm the diver is out",
      cue: "Confirm with the dive supervisor that the diver who rigged the bridle is out of the water and accounted for.",
      why: "The diver rigged the bridle on the seabed skid and the lift must not start until they are back on deck; the dive supervisor, who has been tending them, is the one person who can say so, and the lift waits for that word every time.",
    },
    {
      id: "rigging-check", kind: "find", noHint: true,
      targets: ["worn-shackle-pin", "kinked-sling"],
      itemNames: { "worn-shackle-pin": "a shackle pin not moused", "kinked-sling": "a kinked wire sling leg" },
      itemNotes: {
        "worn-shackle-pin": "The shackle pin has no mousing — it can back out as the load swings. It is moused before the hoist.",
        "kinked-sling": "One wire leg of the deck-end sling is kinked — a kink is a permanent loss of strength, and the leg comes out of service.",
      },
      title: "Check the deck-end rigging",
      cue: "Check the crane's hook, shackle and sling before the hoist and find what stops the lift.",
      why: "The rigging at the hook end is what the crew can see and check from deck, and a pin that can back out or a sling leg with a kink fails under exactly the swinging, snatching load a recovery at sea produces.",
    },
    {
      id: "hoist", kind: "hold", target: "crane-hoist-control", seconds: 5,
      title: "Hoist the pod slowly off the bottom",
      cue: "Hold the hoist control and bring the pod up slowly off its skid and through the splash zone.",
      why: "Breaking a pod out of the seabed and bringing it through the surface are the moments the load on the crane changes fastest; a slow, steady hoist lets the crane operator feel it and stop before a snatch load reaches the boom.",
      holdBreakNote: "The hoist stopped short — bring the pod up steadily through the splash zone.",
    },
    {
      id: "taglines", kind: "track", target: "tagline-control-meter", seconds: 7,
      title: "Control the pod over the rail",
      cue: "Keep the pod steady on the tag lines as it comes up over the rail and in over the deck.",
      why: "Over the rail the pod swings with the roll, and the tag lines, worked from outside its landing area, are what keep it from striking the rail, the crane or the crew; steady control is continuous work until it is down.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.14, label: "POD SWING", readout: (v) => (v > 0.65 ? "swinging out" : v < 0.35 ? "swinging in to the rail" : "steady on the lines") },
      holdBreakNote: "The pod got away from the lines — steady it before it comes any further in.",
    },
    {
      id: "land", kind: "drag", target: "pod-landing",
      title: "Land the pod in its cradle",
      cue: "Guide the pod down into the deck cradle and land it square.",
      why: "A pod landed square in its cradle sits on the supports it was designed for; landed on the roll or off-centre, it rocks, stresses its frame and can shift before it is fastened.",
      drag: { to: "deck-cradle", radius: 0.6, missNote: "The pod is not in the cradle — guide it down square into the supports." },
    },
    {
      id: "secure", kind: "sequence",
      targets: ["sea-fastening", "hook-released"],
      itemNames: { "sea-fastening": "pod sea-fastened in the cradle", "hook-released": "crane hook slacked and released" },
      title: "Sea-fasten, then release the hook",
      cue: "Chain the pod into its cradle, then slack and release the crane hook.",
      why: "Until it is fastened the crane is still holding the pod on a moving deck; releasing the hook first leaves a heavy load free to shift with the next roll. Fastened, then released, the pod is never unrestrained.",
      outOfOrderNote: "Fasten first, then release the hook — never the other way round on a moving deck.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["shore-cable-breaker", "cable-lock"],
      itemNames: { "shore-cable-breaker": "shore-cable breaker opened", "cable-lock": "personal lock and tag applied" },
      title: "Isolate the pod's cable",
      cue: "Open the shore-cable breaker named in the pod procedure, then apply your lock and tag.",
      why: "The pod's cable is how power reaches the equipment behind the hatch, and a lock you hold on its breaker is what keeps it dead while the hatch is open; the tag names the pod and the person inside it.",
      outOfOrderNote: "Breaker first, then your lock and tag.",
    },
    {
      id: "leak-check", kind: "select", target: "pod-leak-lamp",
      title: "Read the pod's leak lamp",
      cue: "Read the pod's leak-detect lamp and its status panel against the pod procedure before the hatch.",
      why: "The leak lamp is the pod's own report of whether water or a changed atmosphere is inside; it is read on deck, before anyone opens the hatch, because the answer changes what happens next.",
    },
    {
      id: "open-hatch", kind: "turn", target: "hatch-bolts",
      title: "Open the hatch bolts in pattern",
      cue: "Turn the hatch bolts off in the pattern the pod procedure shows, easing the seal evenly.",
      why: "A sealed hatch comes off evenly so its seal and faces are not damaged for the next deployment and any difference in pressure is released gradually round the whole seal, not through one side; the pattern is the pod procedure's for that reason.",
      turn: { turns: 0.6, axis: "z", label: "HATCH BOLTS" },
    },
    {
      id: "log", kind: "select", target: "retrieval-log",
      title: "Log the recovery",
      cue: "Log the recovery: the sea state, the lift, the lockout, the leak lamp reading and the hatch.",
      why: "The recovery log ties the pod's condition on deck to the conditions it came up in, so the engineers reading it later know whether what they find inside came from the seabed or from the lift.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS8_ACCENT);

    const deckTex = surfaceTexture((ctx, w, h) => deckPlateFace(ctx, w, h), { repeat: 3, px: 256 });
    const deck = box(g, 6.6, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.7 });
    deck.material = texturedMat(deckTex, { rough: 0.7, metal: 0.4, color: 0x9aa2a8 });
    // Stern rail with a gate where the pod comes aboard.
    for (const sx of [-3.2, -1.8, 1.8, 3.2]) box(g, 0.06, 1.0, 0.06, sx, 0.5, -2.45, 0xf0b323, { rough: 0.5 });
    for (const [x0, x1] of [[-3.2, -1.8], [1.8, 3.2]]) box(g, x1 - x0, 0.06, 0.06, (x0 + x1) / 2, 1.0, -2.45, 0xf0b323, { rough: 0.5 });

    // The crane and the pod on its hook, just below the rail.
    const crane = deckCrane(g, -2.4, 0, -1.2, { ry: 0.9 });
    const stopBtn = cyl(g, 0.06, 0.06, 0.05, -2.0, 1.2, -0.6, 0xd2312b, { rough: 0.4, seg: 12 });
    stopBtn.rotation.x = Math.PI / 2;
    holoTag(g, "crane stop", -2.0, 1.45, -0.6, { css: "#d2312b", w: 0.24 });
    reg(hits, stopBtn, "crane-stop");
    const hoistCtl = box(g, 0.1, 0.16, 0.06, -2.3, 1.2, -0.55, 0x2b3138, { rough: 0.5 });
    holoTag(g, "hoist control", -2.4, 0.95, -0.4, { css: WS8_CSS, w: 0.28 });
    reg(hits, hoistCtl, "crane-hoist-control");
    void crane;
    const podRig = group(g, 0, -2.2, -3.4);
    const pod = oceanDataPod(podRig, 0, 0, 0, { ry: Math.PI / 2 });
    const PP = pod.userData.parts;
    reg(hits, podRig, "pod-landing");
    const podLamp = PP.leakLamp;
    reg(hits, podLamp, "pod-leak-lamp");
    const hookLine = cyl(g, 0.01, 0.01, 4.0, 0, 2.0, -3.4, 0x9aa2a8, { rough: 0.4, metal: 0.6, seg: 6 });
    holoTag(g, "pod on the hook", 0.9, 1.3, -2.8, { css: WS8_CSS, w: 0.32 });

    // Cradle on deck.
    const cradle = group(g, 0.6, 0, 0.5);
    for (const sz of [-1.2, 1.2]) box(cradle, 0.3, 0.3, 0.3, 0, 0.15, sz, 0x2b3138, { rough: 0.6 });
    for (const sz of [-1.2, 1.2]) box(cradle, 1.8, 0.2, 0.25, 0, 0.35, sz, 0xd9a21e, { rough: 0.5 });
    const cradleMark = box(cradle, 0.6, 0.05, 0.6, 0, 0.45, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cradleMark, "deck-cradle-ready");
    hits["deck-cradle"] = cradle;
    holoTag(cradle, "deck cradle", 0, 0.9, 1.3, { css: WS8_CSS, w: 0.26 });
    const chain = box(cradle, 0.04, 0.04, 2.6, 0.9, 0.5, 0, 0x5a6168, { rough: 0.6, metal: 0.5 });
    reg(hits, chain, "sea-fastening");
    const hookRel = box(g, 0.12, 0.12, 0.12, 0.2, 1.6, -1.2, 0xf0b323, { rough: 0.5 });
    holoTag(g, "hook release", 0.2, 1.85, -1.2, { css: WS8_CSS, w: 0.26 });
    reg(hits, hookRel, "hook-released");
    const holdTag = lockTag(g, 1.6, 1.2, 1.0, { color: 0xd2312b, lines: ["HATCH", "ON", "HOLD"] });
    reg(hits, holdTag, "hatch-hold-tag");
    const bolts = group(g, 1.9, 1.35, 0.5);
    const boltRing = cyl(bolts, 0.22, 0.22, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.7, seg: 12 });
    boltRing.rotation.z = Math.PI / 2;
    holoTag(bolts, "hatch bolts", 0.1, 0.35, 0, { css: WS8_CSS, w: 0.26 });
    reg(hits, boltRing, "hatch-bolts");

    // Rigging, tag lines, deck boards.
    const shackle = cyl(g, 0.05, 0.05, 0.08, -0.4, 1.9, -3.4, 0xd9a21e, { rough: 0.5, metal: 0.5, seg: 8 });
    reg(hits, shackle, "worn-shackle-pin");
    const sling = cyl(g, 0.02, 0.02, 0.8, 0.3, 1.5, -3.4, 0x9aa2a8, { rough: 0.4, metal: 0.6, seg: 6 });
    sling.rotation.z = 0.4;
    reg(hits, sling, "kinked-sling");
    const tl = tagLine(g, 2.0, 0.02, -1.4);
    reg(hits, tl, "tagline-ready");
    const tagMeter = instrument(g, 2.6, 1.2, -1.2, { idle: "SWING", color: 0x2b2f34, w: 0.16, d: 0.03 });
    holoTag(g, "pod swing", 2.6, 1.42, -1.2, { css: WS8_CSS, w: 0.24 });
    reg(hits, tagMeter, "tagline-control-meter");
    box(g, 0.05, 1.2, 0.05, 2.6, 0.6, -1.2, 0x5a6168, { rough: 0.6 });

    const board = group(g, -2.7, 0, 1.2, 1.1);
    box(board, 0.6, 1.2, 0.05, 0, 0.6, 0, WS8_PAL.structure, { rough: 0.7 });
    const plan = decal(board, 0.5, 0.4, 0, 0.95, 0.03, paperFace("LIFT + DIVE PLAN", ["Weight and radius per lift plan", "Sea state per lift plan", "Diving limits per the dive plan"], { scale: 0.7 }));
    holoTag(board, "lift plan", 0, 1.34, 0, { css: WS8_CSS, w: 0.24 });
    reg(hits, plan, "lift-plan");
    const sea = instrument(board, 0, 0.45, 0.05, { idle: "SEA", color: 0x2b2f34, w: 0.18, d: 0.03 });
    holoTag(board, "sea state", 0.36, 0.45, 0.05, { css: WS8_CSS, w: 0.22 });
    reg(hits, sea, "sea-state-readout");
    const log = decal(g, 0.4, 0.3, 0.2, 1.2, 2.25, paperFace("RECOVERY LOG", ["Sea state ___", "Lockout ___", "Leak lamp ___"], { scale: 0.7 }));
    holoTag(g, "recovery log", 0.2, 1.5, 2.25, { css: WS8_CSS, w: 0.28 });
    reg(hits, log, "retrieval-log");
    box(g, 0.5, 1.1, 0.05, 0.2, 0.55, 2.28, WS8_PAL.structure, { rough: 0.7 });
    const diveRadio = radio(g, -1.4, 0.9, 2.0);
    holoTag(g, "dive supervisor", -1.4, 1.15, 2.0, { css: WS8_CSS, w: 0.3 });
    reg(hits, diveRadio, "dive-supervisor-radio");
    box(g, 0.5, 0.84, 0.4, -1.4, 0.42, 2.0, WS8_PAL.structure, { rough: 0.7 });
    const bridge = radio(g, 2.6, 0.9, 1.9);
    holoTag(g, "bridge radio", 2.6, 1.15, 1.9, { css: WS8_CSS, w: 0.26 });
    reg(hits, bridge, "bridge-radio");
    box(g, 0.5, 0.84, 0.4, 2.6, 0.42, 1.9, WS8_PAL.structure, { rough: 0.7 });
    const cabinet = group(g, 2.9, 0, 0.2, -Math.PI / 2);
    box(cabinet, 0.6, 1.0, 0.3, 0, 0.9, 0, 0x8b949b, { rough: 0.5, metal: 0.4 });
    const brk = box(cabinet, 0.12, 0.2, 0.05, -0.1, 1.1, 0.17, 0x2b3138, { rough: 0.4 });
    reg(hits, brk, "shore-cable-breaker");
    const lk = lockTag(cabinet, 0.12, 0.9, 0.17, { color: 0xd2312b, lines: ["LOCK", "POD"] });
    reg(hits, lk, "cable-lock");
    holoTag(cabinet, "shore-cable breaker", 0, 1.6, 0.1, { css: WS8_CSS, w: 0.36 });
    const cable = cyl(g, 0.05, 0.05, 3.0, 2.4, 0.06, -0.8, 0x17191c, { rough: 0.7, seg: 8 });
    cable.rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) cyl(g, 0.25, 0.25, 0.15, -0.6 + i * 0.1, 0.08 + i * 0.15, 2.1, 0xe0592a, { rough: 0.8, seg: 12 });

    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.44 });
      reg(hits, d, id);
    };
    decoy(0.0, 0.9, -1.8, "stand-under-load", "step under it to guide it?");
    decoy(-0.8, 1.1, -2.2, "hand-between-pod-and-rail", "steady it by hand?");
    decoy(-1.8, 1.8, 1.4, "lift-with-diver-in-water", "hoist now, diver's nearly out?");
    decoy(1.6, 1.8, 0.2, "open-hatch-cable-live", "unbolt it, cable's fine?");

    const squall = box(g, 20, 6, 0.1, 0, 5, -20, 0x2a3440, { opacity: 0.7, transparent: true, cast: false });
    squall.visible = false;
    standingFigure(g, 3.0, 2.6, { ry: -2.6, cloth: 0x2b4f7f, vest: 0xf07a1f });
    holoPanel(g, 1.0, 0.6, -0.8, 0, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "#061420"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS8_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f4ff";
      ctx.fillText("OCEAN POD — LAND, ISOLATE, THEN OPEN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Sea state against the lift plan", "Diver out before the hoist", "Tag lines, cradle, sea-fasten", "Lock the cable, read the leak lamp"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: 0.2, accent: WS8_ACCENT });

    let rolling = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, -1.6),
      onStep() {},
      onFault(id) {
        if (id === "leak-detect") podLamp.traverse((o) => { if (o.isMesh) o.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 }); });
      },
      onStepComplete(step) {
        if (step.id === "sea-state") repaint(sea.userData.screen, signFace("GO", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "rigging-check") shackle.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "hoist") podRig.position.set(0, 1.2, -3.4);
        if (step.id === "land") { podRig.position.set(0.6, 0.4, 0.5); hookLine.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "wake-roll") { rolling = true; podRig.position.x = 0.8; }
        if (it.id === "squall-call") squall.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wake-roll") { rolling = false; g.rotation.z = 0; podRig.position.x = 0; }
        if (it.id === "squall-call") squall.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        g.rotation.z = rolling ? Math.sin(t * 1.6) * 0.03 : 0;
        if (session?.step?.id === "taglines") podRig.rotation.y = Math.sin(t * 1.2) * 0.1;
        if (session?.turn && session.step?.id === "open-hatch") bolts.rotation.x = session.turn.amount * Math.PI;
      },
    };
  },
};
