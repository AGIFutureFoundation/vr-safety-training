import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, torus, group, repaint, signFace, hose, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, asphaltFace, gratingFace, corrugatedFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Camera Dolly & Crane Track VR — Screen & Media Crafts.
//
// A soundstage floor laid with curved dolly track for a moving shot, and a
// counterweighted jib crane trackside for the boom reveal that follows it.
// The learner is the IATSE key grip who reads the day's grip plot, dresses
// gloves and knee pads before laying track by hand, sweeps the assembled
// track for an unpinned joint, a missing wedge and a snagged cable, checks
// today's lens-and-camera package against the crane's own counterweight
// chart, balances the arm on its sled, locks the swivel base, clamps the
// last track joint, calls the crew clear on the radio, pushes the dolly
// through the shot at a smooth, held speed, loads sandbags onto the
// counterweight tray, confirms the jib's swing zone with a spotter, and pans
// the reveal — with a gear cart wheeled across the live track and a
// counterweight sled slipping half a notch both needing an answer that is
// not the control already in the learner's hand. The production and the
// stage are generic.

const GRP_ACCENT = 0x4fc3f7;
const GRP_CSS = "#4fc3f7";

export const SIM_MD_CAMERA_DOLLY_AND_CRANE_TRACK = {
  id: "md-camera-dolly-and-crane-track",
  index: "709",
  domain: "Screen & Media Crafts",
  trade: "IATSE key grip, laying curved dolly track and balancing a counterweighted jib crane for a moving reveal shot",
  category: "Entertainment & Live Events",
  weather: "overcast",
  certification: "IATSE grip department training; ASME B30.5 mobile crane practice, applied to the jib arm's counterweighted boom; OSHA 29 CFR 1926.451 general fall-protection requirements for the counterweight sled; ANSI/ISEA 107 high-visibility apparel for the grip crew working trackside",
  name: "Camera Dolly & Crane Track",
  title: simTitle("Camera Dolly & Crane Track"),
  tagline: "A soundstage dolly track and jib crane before the reveal: the grip plot read, gloves and knee pads on, the assembled track swept for an unpinned joint and a missing wedge, the counterweight chart checked against today's lens package, the arm balanced on its sled, the swivel locked, the last joint clamped, the crew called clear, the dolly pushed through the shot at a held speed, sandbags loaded to the tray, the swing zone confirmed with a spotter, and the reveal panned — a gear cart crossing the live track and a slipping counterweight sled both answered off a control that isn't the one already in the learner's hand",
  accent: GRP_ACCENT,
  accentCss: GRP_CSS,
  parSeconds: 330,
  footprint: 2.9,
  badge: { id: "smooth-and-balanced", name: "Smooth and Balanced", note: "The track swept clean, the arm balanced before the swivel locked, the shot held smooth on the dolly, and the crossing cart and the slipping sled both answered off the right control" },

  supportLine: "your IATSE local's member assistance contact, or the production's own employee assistance programme",

  game: system({
    name: "Grip Truck",
    currency: "TRACK",
    ranks: ["Loader", "Set-Up Grip", "Dolly Grip", "Best Boy Grip", "Key Grip Certified"],
    badges: [
      { id: "balanced-first", name: "Balanced First", note: "Never locked the swivel before the arm read balanced on its sled", test: AWARD.stepClean("balance-check") },
      { id: "cart-answered", name: "Cart Answered", note: "The crossing cart was held off the grip radio, not ignored", test: AWARD.unbroken },
      { id: "never-under-the-dolly", name: "Never Under the Dolly", note: "Never reached under a moving dolly, never in the swing radius, never pulled an armed counterweight pin, never on ungritted track", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lay", name: "Clean Lay", note: "No corrections from the plot to the closing log", test: AWARD.clean },
      { id: "smooth-push", name: "Smooth Push", note: "The dolly held its speed band the whole push, first time", test: AWARD.precise(0.7) },
      { id: "rolling-on-time", name: "Rolling On Time", note: "Balanced and rolling inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-under-moving-dolly": "You reached under the dolly while it was still rolling on the track. A dolly's wheels and truck run in a channel built to carry the weight of the camera package and everyone riding it, and a hand caught between a wheel and the rail does not get a warning first. The dolly is only reached under stopped, with the brake set.",
    "stand-in-swing-radius": "You stood inside the jib arm's swing radius while it was counterweighted and unlocked. A balanced arm swings on very little force, and a person standing where the arm's own arc passes is standing exactly where a boom operator's shot is about to go — whether or not anyone meant to swing it yet. The radius is marked and it stays clear until the operator calls it clear.",
    "pull-counterweight-pin-while-armed": "You pulled the counterweight sled's locking pin while the arm was still loaded and balanced. That pin is the only thing holding the sled at the balance point the gauge just proved — pull it loaded, and the sled runs free on its rail with the arm's whole balance behind it. The pin comes out only after the arm is racked down and the load is off the sled.",
    "climb-onto-ungritted-track": "You stepped onto a section of track that had not been swept and gritted yet. A dolly track is level and clean because the dolly's whole ride depends on it, and standing on a section still carrying grip crew's own grease and shim dust is exactly how somebody's boot finds the one patch that isn't where their foot expected it to be.",
  },

  lateNotes: {
    "swivel-lock": "The swivel locks once the arm has read balanced on the sled — locking an unbalanced arm just locks in the lean.",
    "sandbag": "The sandbag loads onto the tray after the swing zone is confirmed clear — not before, and never while anyone is inside the radius.",
    "grip-log": "The log is written last, after the shot is struck and the sandbags are counted back off the tray.",
  },

  steps: [
    {
      id: "read-plot", kind: "select", target: "shot-plot-panel",
      title: "Read today's grip plot",
      cue: "Read the grip plot: the track's curve, the crane's counterweight chart, and today's lens-and-camera package weight.",
      why: "The plot is where today's shot is actually specified before anyone lays a length of track — the curve the dolly follows, the weight the jib arm has to balance against, and which camera package is riding today, because a longer lens or a bigger body changes the balance point the crane was set up for yesterday.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["grip-gloves", "knee-pads"],
      itemNames: { "grip-gloves": "grip gloves", "knee-pads": "knee pads" },
      title: "Glove up and pad up before laying track",
      cue: "Pull on grip gloves and knee pads before handling track sections or kneeling to pin a joint.",
      why: "Track sections are steel, cold, and have a way of finding a bare knuckle at the exact moment a joint seats, and a grip who spends the whole call kneeling on bare concrete to pin joints knows within the first hour why the pads exist. Both go on before the first section comes off the truck, not after the first pinch.",
    },
    {
      id: "track-sweep", kind: "find", noHint: true,
      targets: ["unpinned-joint", "missing-wedge", "snagged-cable"],
      itemNames: { "unpinned-joint": "unpinned track joint", "missing-wedge": "missing levelling wedge", "snagged-cable": "camera cable snagged under a wheel" },
      itemNotes: {
        "unpinned-joint": "This joint's coupler pin never seated — the two rail sections are only resting against each other. A dolly crossing an unpinned joint at speed can hop the gap, and the camera operator riding it feels that hop as a jolt on the shot nobody planned.",
        "missing-wedge": "One section has no levelling wedge under it, and it sits a hair proud of the section beside it. A track that isn't level in one spot rides fine in rehearsal and reads as a bump the moment the take is the one that matters.",
        "snagged-cable": "A camera cable is looped up under the near rail instead of run clear of the truck. A cable caught under a moving dolly's wheel gets pulled tight before anyone notices, and whatever is on the other end of that cable stops working mid-shot.",
      },
      title: "Sweep the assembled track before it carries a shot",
      cue: "Walk the track and click the three things wrong with how it was laid.",
      why: "Track looks the same whether it is right or almost right, and the difference only shows up once a loaded dolly is rolling on it — an unpinned joint, an unlevelled section and a snagged cable are the three ways today's smooth push becomes tomorrow's blown take.",
    },
    {
      id: "counterweight-chart", kind: "select", target: "counterweight-chart",
      title: "Check today's camera package against the counterweight chart",
      cue: "Read the crane's counterweight chart against today's lens and camera body weight before touching the sled.",
      why: "The chart is what turns 'looks about right' into an actual number — the sled's position for a balanced arm changes with every lens swap and every accessory hung off the camera, and the chart is built from the manufacturer's own tested combinations rather than guessed from how the arm feels in the hand.",
    },
    {
      id: "balance-check", kind: "gauge", target: "balance-gauge",
      title: "Balance the jib arm on its counterweight sled",
      cue: "Slide the counterweight sled and read the balance gauge until the arm settles inside the plotted band.",
      why: "A balanced arm moves on almost no force at all, which is the entire point of a counterweighted crane — an arm that is even a little heavy or light fights the operator on every pan and tilt, and fighting a jib arm is how a boom operator loses the smooth motion the shot was built around.",
      gauge: { label: "BALANCE", speed: 0.6, green: [0.44, 0.6], readout: (t) => (t < 0.44 ? "nose heavy" : t > 0.6 ? "tail heavy" : "balanced"), missNote: "Not balanced — the sled needs to sit where the chart says for today's package, not wherever feels close." },
    },
    {
      id: "swivel-lock", kind: "turn", target: "swivel-lock",
      title: "Lock the swivel base once the arm reads balanced",
      cue: "With the arm balanced, turn the swivel base's lock to SET.",
      why: "The swivel lock is what keeps the whole crane from creeping on its base while the arm is being worked, and it is set only after the balance is proven — locking a base under an arm that still needs adjusting just means unlocking it again to fix what should have been checked first.",
      turn: { turns: 1.0, label: "SWIVEL LOCK", readout: (t) => (t < 0.5 ? "free" : t < 0.95 ? "locking" : "set") },
    },
    {
      id: "track-clamp", kind: "hold", target: "track-clamp", seconds: 4,
      title: "Hold the last joint's clamp closed while the pin seats",
      cue: "Hold the coupler clamp closed on the last joint until the pin seats fully home.",
      why: "A coupler pin seats under steady pressure, not a quick squeeze — letting go early is how a joint reads pinned from a glance but opens the first time a loaded dolly rolls across it at speed.",
      holdBreakNote: "You let go before the pin seated. A joint that looks closed and a joint that is closed are not the same thing until the pin is fully home.",
    },
    {
      id: "grip-radio-check", kind: "select", target: "grip-radio",
      title: "Call the crew clear before the dolly moves",
      cue: "Call the grip crew on the radio to confirm the track and the swing radius are both clear before the dolly rolls.",
      why: "A dolly push and a jib swing both cross ground other crew members are working around all day, and the radio call is what turns 'probably clear by now' into an actual confirmation from the people who would know.",
    },
    {
      id: "dolly-push", kind: "track", target: "dolly-push", seconds: 6,
      title: "Push the dolly through the shot at a held speed",
      cue: "Push the dolly along the track, holding the speed inside the shot's band the whole way — a jerk or a stall reads on camera as much as a jolt in the track would.",
      why: "A dolly move that speeds up or stalls mid-shot is on camera the same way a jolt from a bad joint is, and holding a steady push through the whole curve — easing in and out rather than snapping to speed — is the actual skill a dolly grip is hired for, not just laying the track underneath it.",
      track: { start: 0.5, green: [0.42, 0.58], rise: 0.5, fall: 0.5, drift: 0.12, label: "DOLLY SPEED", readout: (v) => (v < 0.42 ? "lagging" : v > 0.58 ? "surging" : "held") },
      holdBreakNote: "The push surged or lagged out of the shot's band — ease back toward the held speed rather than correcting hard.",
    },
    {
      id: "sandbag-load", kind: "drag", target: "sandbag",
      title: "Load a sandbag onto the counterweight tray",
      cue: "Carry the spare sandbag from the gear line onto the crane's counterweight tray to true up the balance for the next lens change.",
      why: "A sandbag on the tray is the fine adjustment between chart weights — a lens swap that lands between two plotted numbers gets trued up here rather than by fighting the arm through the next take. It goes on the tray itself, not balanced loose on the sled where it can shift.",
      drag: { to: "counterweight-tray", radius: 0.5, missNote: "Not on the tray — a sandbag balanced on the sled's edge is a sandbag that slides the moment the arm moves." },
    },
    {
      id: "swing-spotter-confirm", kind: "select", target: "swing-spotter-radio",
      title: "Confirm the swing zone is clear with the spotter",
      cue: "Call the trackside spotter to confirm the jib's swing radius is clear before the reveal.",
      why: "The spotter's only job during the reveal is watching the arc the arm is about to sweep through — not the shot, not the dolly, just the radius. Confirming that call out loud is what keeps 'should be clear' from being treated the same as an actual answer.",
    },
    {
      id: "jib-pan", kind: "hold", target: "jib-pan-handle", seconds: 4,
      title: "Pan the jib through the reveal",
      cue: "Hold the jib's pan handle steady through the reveal, easing the arm rather than snapping it to the mark.",
      why: "A balanced arm makes a smooth pan possible, but it does not make it automatic — snapping the handle to the mark reads on camera as exactly what it is, and holding the motion through the whole reveal is what turns a correctly balanced crane into an actual shot.",
      holdBreakNote: "The pan broke early — a balanced arm still needs to be eased through the reveal, not snapped to the mark.",
    },
    {
      id: "grip-log", kind: "select", target: "grip-log",
      title: "Log the track, the balance and the sandbag count",
      cue: "Log the joint that was found unpinned, the wedge replaced, the balance point used and the sandbag count on the tray.",
      why: "The log is what the next grip on this crane reads before they touch the sled — a balance point that worked for today's lens is a starting guess for tomorrow's, not a fact anyone should have to rediscover the hard way. An unpinned joint that isn't written down is one the next crew finds by feel.",
    },
  ],

  interrupts: [
    {
      id: "cart-crossing-track",
      kind: "Gear cart crosses the live track",
      after: "track-clamp", delay: 2, seconds: 12,
      alert: "A grip crew member has started wheeling a heavy gear cart straight across the track, right in the dolly's path.",
      cue: "Call the crew on the radio to hold at the track before the cart fouls the rail.",
      target: "grip-radio",
      why: "A cart crossing a live track can catch a wheel in the rail channel or leave a scrape the dolly's own wheels ride over on the next push, and a shout across a soundstage floor does not reliably beat a crew member already committed to crossing. The radio reaches the whole crew at once, which a shout from behind a clamped joint does not.",
      missNote: "The cart crossed anyway. A wheel caught the rail channel and left a scrape the dolly's own wheels rode over on the next push.",
      wrongNote: "Not the clamp you're holding — that only answers for this joint. The radio is what reaches a crew member already crossing.",
    },
    {
      id: "sled-slip",
      kind: "Counterweight sled slips on its rail",
      after: "dolly-push", delay: 2, seconds: 12,
      alert: "The jib arm's counterweight sled has slipped half a notch on its rail, and the balance gauge needle is jumping toward the red.",
      cue: "Hit the counterweight lock lever before the arm free-swings.",
      target: "counterweight-lock-lever",
      why: "A sled that slips is a sled no longer holding the balance point the gauge proved, and an arm that goes even a little out of balance starts drifting on its own the moment nobody is actively holding it against that drift. The lock lever clamps the sled to the rail directly — a separate control from the balance gauge, which only ever reads the problem rather than stopping it.",
      missNote: "The sled kept sliding and the arm drifted off its mark on its own. Nobody had clamped the sled back to the rail.",
      wrongNote: "Not the balance gauge — it only reads the drift. The lock lever is what actually clamps the sled back to the rail.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, GRP_ACCENT);

    // ------------------------------------------------------------ the stage floor
    const floor = box(g, 7.6, 0.05, 6.2, 0, 0.025, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#26282b", base2: "#1f2124", tarLines: 2 }), { repeat: 5, px: 512 }), { rough: 0.9, metal: 0.03, color: 0x9aa0a6 });

    // ------------------------------------------------------------------ track
    const trackPts = [[-2.6, -1.2], [-1.4, -1.5], [0.0, -1.4], [1.2, -0.9], [1.9, -0.1]];
    const trackGroup = group(g, 0, 0, 0);
    for (let i = 0; i < trackPts.length - 1; i++) {
      const [x0, z0] = trackPts[i], [x1, z1] = trackPts[i + 1];
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const rail = group(trackGroup, mx, 0, mz, ang);
      const railMesh = box(rail, 0.22, 0.05, len, -0.09, 0.025, 0, 0xffffff, { rough: 0.55, metal: 0.5 });
      railMesh.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, { base: "#3a4046", base2: "#2e3338" }), { repeat: 2, px: 256 }), { rough: 0.5, metal: 0.6, color: 0xb8bec4 });
      box(rail, 0.22, 0.05, len, 0.09, 0.025, 0, 0x8b949d, { rough: 0.45, metal: 0.6 });
      if (i === 2) {
        const jointGap = box(rail, 0.08, 0.06, 0.05, 0, 0.03, len / 2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
        holoTag(rail, "joint — pinned?", 0, 0.2, len / 2, { css: "#d2312b", w: 0.36 });
        reg(hits, jointGap, "unpinned-joint");
      }
      if (i === 1) {
        const wedgeGap = box(rail, 0.2, 0.02, 0.2, 0.16, 0.005, -len / 2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
        holoTag(rail, "wedge missing?", 0.16, 0.15, -len / 2, { css: "#d2312b", w: 0.36 });
        reg(hits, wedgeGap, "missing-wedge");
      }
    }
    const clampLever = group(trackGroup, 1.9, 0, -0.1, -0.4);
    box(clampLever, 0.04, 0.1, 0.04, 0, 0.08, 0.12, 0xe8b02e, { rough: 0.45, metal: 0.5 });
    holoTag(clampLever, "joint clamp — hold", 0, 0.28, 0.12, { css: GRP_CSS, w: 0.36 });
    reg(hits, clampLever, "track-clamp");
    const ungrittedHit = box(trackGroup, 0.5, 0.06, 0.3, 0.5, 0.03, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trackGroup, "step here — ungritted?", 0.5, 0.2, -1.3, { css: "#d2312b", w: 0.44 });
    reg(hits, ungrittedHit, "climb-onto-ungritted-track");
    const snaggedCable = hose(trackGroup, [[-1.6, 0.04, -1.55], [-1.3, 0.04, -1.45], [-1.0, 0.04, -1.5]], 0.012, 0x1b1e22, { steps: 8 });
    holoTag(trackGroup, "cable — snagged?", -1.3, 0.2, -1.45, { css: "#d2312b", w: 0.38 });
    reg(hits, snaggedCable, "snagged-cable");

    // ------------------------------------------------------------------- dolly
    const dolly = group(g, -2.6, 0, -1.2, 0.5);
    box(dolly, 0.5, 0.1, 0.7, 0, 0.08, 0, 0x2b2f34, { rough: 0.55, metal: 0.45 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(dolly, 0.05, 0.05, 0.04, sx * 0.2, 0.03, sz * 0.28, 0x14171a, { rough: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    const seatPost = cyl(dolly, 0.03, 0.03, 0.4, -0.1, 0.32, -0.1, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    const seat = box(dolly, 0.24, 0.05, 0.24, -0.1, 0.52, -0.1, 0x2b2f34, { rough: 0.6 });
    const brakeLever = box(dolly, 0.05, 0.14, 0.03, 0.2, 0.22, -0.3, 0xd2312b, { rough: 0.5 });
    holoTag(dolly, "dolly brake", 0.2, 0.4, -0.3, { css: GRP_CSS, w: 0.3 });
    reg(hits, brakeLever, "dolly-brake");
    const dollyPush = box(dolly, 0.06, 0.06, 0.06, 0, 0.2, 0.32, GRP_ACCENT, { rough: 0.5, emissive: GRP_ACCENT, ei: 0.6 });
    holoTag(dolly, "push the dolly", 0, 0.4, 0.32, { css: GRP_CSS, w: 0.32 });
    reg(hits, dollyPush, "dolly-push");
    const reachHit = box(dolly, 0.4, 0.08, 0.6, 0, -0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(dolly, "reach under moving?", 0, 0.15, 0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, reachHit, "reach-under-moving-dolly");
    void seatPost; void seat;

    // ---------------------------------------------------------------- jib crane
    const crane = group(g, 1.6, 0, 1.3, -0.6);
    box(crane, 0.6, 0.1, 0.6, 0, 0.05, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    const swivel = group(crane, 0, 0.12, 0);
    cyl(swivel, 0.14, 0.14, 0.1, 0, 0, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 16 });
    const swivelLockKnob = box(swivel, 0.05, 0.05, 0.08, 0.16, 0.02, 0, 0xe8b02e, { rough: 0.4, metal: 0.6 });
    holoTag(swivel, "swivel lock", 0.16, 0.16, 0, { css: GRP_CSS, w: 0.3 });
    reg(hits, swivelLockKnob, "swivel-lock");
    const armPivot = group(swivel, 0, 0.14, 0);
    const arm = group(armPivot, 0, 0.6, 0, 0);
    arm.rotation.z = -0.35;
    const armBoom = box(arm, 2.6, 0.1, 0.1, 0.9, 0, 0, 0x9aa0a6, { rough: 0.4, metal: 0.6 });
    const cameraHead = box(arm, 0.2, 0.16, 0.28, 2.15, -0.02, 0, 0x1b1e22, { rough: 0.5, metal: 0.4 });
    const panHandle = box(arm, 0.05, 0.05, 0.3, 1.0, -0.14, 0, 0xe8b02e, { rough: 0.5 });
    holoTag(arm, "pan handle", 1.0, -0.3, 0, { css: GRP_CSS, w: 0.3 });
    reg(hits, panHandle, "jib-pan-handle");
    const sledRail = box(arm, 0.9, 0.06, 0.1, -0.55, -0.02, 0, CITY.darkSteel, { rough: 0.45, metal: 0.6 });
    const sled = group(arm, -0.7, 0.02, 0);
    box(sled, 0.3, 0.2, 0.22, 0, 0, 0, 0x3a3f45, { rough: 0.5, metal: 0.4 });
    const balanceInstrument = instrument(sled, 0, 0.26, 0, { idle: "-- bal", color: GRP_ACCENT, w: 0.12, d: 0.14 });
    reg(hits, balanceInstrument, "balance-gauge");
    const sledPin = box(sled, 0.03, 0.06, 0.03, 0.14, -0.1, 0.1, 0x8b949d, { rough: 0.4, metal: 0.7 });
    holoTag(sled, "counterweight pin — armed?", 0.14, 0.1, 0.1, { css: "#d2312b", w: 0.5 });
    reg(hits, sledPin, "pull-counterweight-pin-while-armed");
    const trayHit = box(sled, 0.26, 0.03, 0.2, 0, -0.12, 0, 0xd8a63a, { rough: 0.6 });
    holoTag(sled, "counterweight tray", 0, -0.26, 0, { css: GRP_CSS, w: 0.34 });
    reg(hits, trayHit, "counterweight-tray");
    const lockLever = box(sled, 0.04, 0.1, 0.04, -0.16, 0.14, 0, 0xd2312b, { rough: 0.5 });
    holoTag(sled, "sled lock lever", -0.16, 0.28, 0, { css: GRP_CSS, w: 0.32 });
    reg(hits, lockLever, "counterweight-lock-lever");
    const kinkLampCrane = box(sled, 0.04, 0.04, 0.02, 0, 0.2, 0.12, 0xd2312b, { rough: 0.4, emissive: 0xd2312b, ei: 0, cast: false });
    void kinkLampCrane;
    const swingHit = torus(g, 1.1, 0.02, 1.6, 0.011, 1.3, 0xd2312b, { rough: 0.5, cast: false, seg: 8, seg2: 24, transparent: true, opacity: 0.4 });
    swingHit.rotation.x = -Math.PI / 2;
    holoTag(g, "swing radius — clear?", 1.6, 0.3, 2.3, { css: "#d2312b", w: 0.4 });
    reg(hits, swingHit, "stand-in-swing-radius");
    void armBoom; void cameraHead; void sledRail;

    // ------------------------------------------------------------- gear / crew
    const cart = toolChest(g, -3.0, 1.6, { ry: 0.3, color: 0x2b2b30 });
    const rack = group(g, -3.0, 0, 0.8, 0.3);
    cyl(rack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.18, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const gloves = box(rack, 0.14, 0.05, 0.1, -0.14, 1.0, 0, 0xd8a63a, { rough: 0.8 });
    holoTag(rack, "grip gloves", -0.14, 1.2, 0, { css: GRP_CSS, w: 0.28 });
    reg(hits, gloves, "grip-gloves");
    const pads = box(rack, 0.14, 0.1, 0.1, 0.14, 0.95, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(rack, "knee pads", 0.14, 1.15, 0, { css: GRP_CSS, w: 0.26 });
    reg(hits, pads, "knee-pads");
    const sandbag = group(g, -3.1, 0, 2.4, 0.4);
    box(sandbag, 0.3, 0.14, 0.2, 0, 0.07, 0, 0x6b5a44, { rough: 0.9 });
    holoTag(sandbag, "sandbag", 0, 0.24, 0, { css: GRP_CSS, w: 0.24 });
    reg(hits, sandbag, "sandbag");
    void cart;

    const gripRadioProp = instrument(g, -1.0, 0.9, 2.1, { ry: 0.4, idle: "GRIP — CH 4", color: GRP_ACCENT, w: 0.1, d: 0.16 });
    holoTag(gripRadioProp, "grip radio", 0, 0.16, 0, { css: GRP_CSS, w: 0.3 });
    reg(hits, gripRadioProp, "grip-radio");
    const spotterRadioProp = instrument(g, 2.6, 0.9, 1.9, { ry: -0.6, idle: "SPOTTER — CH 5", color: GRP_ACCENT, w: 0.1, d: 0.16 });
    holoTag(spotterRadioProp, "spotter radio", 0, 0.16, 0, { css: GRP_CSS, w: 0.34 });
    reg(hits, spotterRadioProp, "swing-spotter-radio");

    // Gear cart decoy for the interruption, hidden until it crosses.
    const crossingCart = group(g, -1.3, 0, -2.3, 0.4);
    box(crossingCart, 0.4, 0.4, 0.3, 0, 0.2, 0, 0xdfe4e8, { rough: 0.6, metal: 0.2 });
    for (const sx of [-1, 1]) cyl(crossingCart, 0.05, 0.05, 0.04, sx * 0.16, 0.05, 0, 0x14171a, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    crossingCart.visible = false;

    const gripFigure = standingFigure(g, 0.4, -2.2, { ry: 2.4, vest: GRP_ACCENT, cloth: 0x2b2f34 });
    holoTag(gripFigure, "key grip", 0, 2.0, 0, { css: GRP_CSS, w: 0.3 });
    void gripFigure;

    // ------------------------------------------------------------------ paperwork
    const plot = holoPanel(g, 0.95, 0.66, -3.4, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#0a1c26"; cx.fillRect(0, 0, w, h); cx.fillStyle = GRP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff2fb"; cx.fillText("GRIP PLOT — DOLLY + CRANE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.064)}px Arial, sans-serif`; cx.fillStyle = "#e6f4fb";
      ["Track: 5-section curve, camera left to right", "Crane: counterweight per chart, today's package", "Swing radius: marked, spotter confirms clear",
       "Dolly speed band: per the shot's own plot", "Sandbags trim the balance between chart weights"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.9, accent: GRP_ACCENT });
    reg(hits, plot, "shot-plot-panel");

    const chart = holoPanel(g, 0.8, 0.58, 2.6, 1.3, 1.6, (cx, w, h) => {
      cx.fillStyle = "#0a1c26"; cx.fillRect(0, 0, w, h); cx.fillStyle = GRP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff2fb"; cx.fillText("COUNTERWEIGHT CHART", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e6f4fb";
      ["Today's package: body + zoom", "Chart position: sled mark C", "Trim with sandbags as needed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.5, accent: GRP_ACCENT });
    reg(hits, chart, "counterweight-chart");

    const log = holoPanel(g, 0.6, 0.42, -3.3, 1.3, 2.2, (cx, w, h) => {
      cx.fillStyle = "#0a1c26"; cx.fillRect(0, 0, w, h); cx.fillStyle = GRP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff2fb"; cx.fillText("GRIP LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e6f4fb";
      ["Track: —", "Balance point: —", "Sandbags: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.7, accent: GRP_ACCENT });
    reg(hits, log, "grip-log");

    // -------------------------------------------------------------- dressing
    barrierPanel(g, -3.4, 3.0, { color: GRP_ACCENT, ry: 0.4 });
    cone(g, 2.9, 2.6, { color: GRP_ACCENT });
    cone(g, -1.4, 2.8, { color: GRP_ACCENT });
    const flatWall = box(g, 3.0, 2.4, 0.1, 3.4, 1.2, -2.4, 0xffffff, { rough: 0.7 });
    flatWall.material = texturedMat(surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: 0x2b2f34 }), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.2, color: 0x9aa0a6 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-donning") { gloves.visible = false; pads.visible = false; }
        if (step.id === "track-sweep") { /* nothing to hide: finds stay visible as evidence */ }
        if (step.id === "counterweight-chart") {
          repaint(chart.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0a1c26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff2fb"; cx.fillText("COUNTERWEIGHT CHART", w * 0.06, h * 0.14);
            cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Today's package: confirmed", "Chart position: sled mark C", "Cleared to balance"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
          });
        }
        if (step.id === "swivel-lock") swivelLockKnob.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "sandbag-load") sandbag.visible = false;
        if (step.id === "grip-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0a1c26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff2fb"; cx.fillText("GRIP LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Track: joint pinned, wedge replaced", "Balance point: sled mark C", "Sandbags: one on tray, logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "cart-crossing-track") { crossingCart.visible = true; }
        if (it.id === "sled-slip") { kinkLampCrane.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 }); repaint(balanceInstrument.userData.screen, signFace("SLIPPING", { bg: "#2b0d0d", accent: "#d2312b", fg: "#ffd8d8", scale: 0.45 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cart-crossing-track") { crossingCart.visible = false; }
        if (it.id === "sled-slip") { kinkLampCrane.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0, rough: 0.4 }); repaint(balanceInstrument.userData.screen, signFace("LOCKED", { bg: "#0d2b16", accent: "#59c97b", fg: "#d8f5e0", scale: 0.5 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "swivel-lock") swivelLockKnob.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "balance-check") repaint(balanceInstrument.userData.screen, signFace(gg.t < 0.44 ? "NOSE" : gg.t > 0.6 ? "TAIL" : "BAL", { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#e6f4fb", scale: 0.6 }));
        if (step?.id === "dolly-push" && session.holding) dolly.position.x = -2.6 + (session.track.v ?? 0.5) * 4.0;
        void dt; void t; void CITY;
      },
    };
  },
};
