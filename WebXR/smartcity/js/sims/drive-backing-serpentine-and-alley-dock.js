import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import { tractorTrailer, flArticulate, forkliftCounterbalance } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, cone,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Backing Serpentine and Alley Dock VR — Mobility & Transit, the
// fifth deep driving station in the Job Readiness Edition. Where the TDL
// block's backing station reads the procedure, this one drives it: the
// learner backs the rig themselves, with a spotter whose hand signals were
// agreed before the first foot of reverse — a serpentine through a cone lane,
// then a sight-side alley dock between two parked trailers — and the two
// interruptions a range throws at a backing driver: a forklift that crosses
// behind the trailer, and a spotter who walks out of the mirror.
//
// The range is drawn at half scale; the reverse drive steps are driven with
// the rig facing against the path, and the trailer is drawn settling onto
// the line as the driver steers it there. Speeds are the trainee's band
// ("idle, dead slow"); no figure is quoted that the handbook does not give.
// Sited generically: no real range, carrier or warehouse.

const DRB_ACCENT = 0xf07fa8;
const DRB_CSS = "#f07fa8";
const DRB_SCALE = 0.5;

export const SIM_DRIVE_BACKING_SERPENTINE_AND_ALLEY_DOCK = {
  id: "drive-backing-serpentine-and-alley-dock",
  index: "322",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, Job Readiness Edition deep driving — Teamsters yard and range work: backing with a spotter under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "clear",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A range curriculum includes backing exercises and the alley dock; 49 CFR 383 for the basic control skills test the range prepares for; 49 CFR 392 for driving a commercial motor vehicle, including the hand-held phone rule; 49 CFR 393 for the mirrors, lamps and horn backing depends on; 49 CFR 395 for the duty status at the dock; the state CDL handbook's backing guidance — get out and look, back toward the driver's side, use a helper; OSHA 29 CFR 1910.178 for the forklift that shares the yard; CVSA roadside inspection practice; Teamsters (IBT) freight locals' driver training",
  name: "Backing Serpentine and Alley Dock",
  title: simTitle("Backing Serpentine and Alley Dock"),
  tagline: "You back it: signals agreed with the spotter, a serpentine through the cones, a pull-up and a sight-side alley dock between two trailers — with a forklift behind you and a spotter who steps out of the mirror",
  accent: DRB_ACCENT,
  accentCss: DRB_CSS,
  parSeconds: 340,
  footprint: 2.6,
  apron: false,
  badge: { id: "in-the-mirror", name: "Always in the Mirror", note: "Serpentine and alley dock backed clean, the forklift warned and the truck stopped the moment the spotter vanished — first time" },

  game: system({
    name: "Range",
    currency: "CONE",
    ranks: ["Permit Holder", "Range Trainee", "Backing Driver", "Yard Lead", "Range Certified"],
    badges: [
      { id: "weaver", name: "Weaver", note: "The serpentine and the alley dock backed with every check on time", test: AWARD.all(AWARD.stepClean("drb-serpentine"), AWARD.stepClean("drb-alley-dock")) },
      { id: "helper-safe", name: "Helper Safe", note: "Never pushed a jackknife, backed fast, followed a stranger's waves or reached for the phone", test: AWARD.safe },
      { id: "creep", name: "Creep", note: "Every drive held in lane and band with no excursion", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-range", name: "Clean Range", note: "No corrections anywhere", test: AWARD.clean },
      { id: "on-the-line", name: "On the Line", note: "Pull-up point and drives near the centre of their bands", test: AWARD.precise(0.8) },
      { id: "on-time", name: "On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drb-push-jackknife": "You went to keep backing into a tightening jackknife to save a pull-up. Once the angle between tractor and trailer closes past a point, more reverse only closes it further, until the trailer hits the cab. The fix is always the same and never shameful: stop, pull forward to straighten, and start the back again.",
    "drb-stranger-wave": "You went to follow the waving arms of a yard hand who is not your spotter. Two people giving signals is worse than none: their meanings differ, neither knows what the other is telling you, and the one who is not watching the gap may be waving you onto someone. Only the agreed spotter's signals move this rig; anyone else gets a stop until it is sorted out.",
    "drb-back-fast": "You went to back quickly to save time. Backing is done at idle in the lowest reverse gear because it is the speed at which you can stop within inches when the spotter signals or someone walks behind — and a trailer's rear cannot be seen from the seat at all.",
    "drb-phone": "You went to pick up the hand-held phone while backing. 49 CFR 392 prohibits hand-held mobile phone use by commercial drivers, and backing is where you need both hands, both mirrors and your spotter's signals at once.",
  },

  lateNotes: {
    "drb-wheel-hand": "The hand goes to the bottom of the wheel once the serpentine is behind you and the pull-up is next.",
    "drb-pullup-gauge": "The pull-up point is judged as you set up for the alley dock, not before the serpentine.",
    "drb-eld-status": "The log changes at the door, once the trailer is in and handed over.",
  },

  steps: [
    {
      id: "drb-card", kind: "select", target: "drb-range-card",
      title: "Read the range card",
      cue: "Read the course: the pull-through, the serpentine cones, the alley-dock door and where the spotter stands.",
      why: "Reverse is planned forwards. Once the rig is backing, a driver sees two narrow strips of glass and whatever the helper's hands say, so the shape of the cone lane, the pull-up that sets the dock, the side the swing comes from and the helper's standing spot all need settling while you can still look at them straight on, not rediscovered with the tandems already swinging.",
    },
    {
      id: "drb-signals", kind: "sequence",
      targets: ["drb-signal-stop", "drb-signal-slow", "drb-signal-back", "drb-signal-turn"],
      itemNames: { "drb-signal-stop": "stop — both hands up, palms out", "drb-signal-slow": "slow — palms pressing down", "drb-signal-back": "come back — hands waving you in", "drb-signal-turn": "turn — a pointed hand toward the side to swing" },
      title: "Agree the hand signals",
      cue: "Agree the signals with the spotter before you back: stop first, then slow, come back and turn.",
      why: "Hand signals are a language two people invent together on the spot, and a language one of them misreads is dangerous, so the vocabulary is rehearsed face to face at the cab door before reverse — halt first, since it outranks everything. Paired with it is a promise that never bends: an unreadable gesture, or a guide who drops out of view, means the wheels stop turning.",
      outOfOrderNote: "Stop first — it is the signal everything else depends on — then slow, come back and turn.",
    },
    {
      id: "drb-pull-through", kind: "drive", target: "drb-rig",
      title: "Pull through to the start",
      cue: "Pull forward along the range to the serpentine start, checking both mirrors for the cones and the spotter.",
      why: "The pull-through sets the rig straight at the start of the cone lane, and a straight start is half of a clean serpentine. Checking both mirrors as you go shows where the cones sit against the trailer and where your spotter has positioned themselves, before the rig is in reverse and those mirrors are all you have.",
      holdBreakNote: "Out of the lane or band on the pull-through — slow and straight.",
      drive: {
        path: [[-4.4, -4.6], [-1.5, -4.6], [1.5, -4.6], [3.6, -4.6]],
        speedBand: [3, 10], laneWidth: 1.6, graceSeconds: 1.8, checkWindow: 1.6, sceneRate: 0.2,
        bandLabel: "range speed",
        checks: [
          { at: 0, kind: "mirror-left", note: "Left mirror: the spotter is on the driver's side, where they will be for the back." },
          { at: 2, kind: "mirror-right", note: "Right mirror: the cone lane is clear along the trailer's right side." },
        ],
        controls: { brake: "drb-brake-pedal" },
      },
    },
    {
      id: "drb-goal", kind: "find", noHint: true,
      targets: ["drb-knocked-cone", "drb-oil-patch", "drb-light-arm"],
      itemNames: { "drb-knocked-cone": "the knocked-over cone in the lane", "drb-oil-patch": "the oil patch at the lane's bend", "drb-light-arm": "the dock light arm swung out low" },
      itemNotes: {
        "drb-knocked-cone": "A cone lying in the lane — the last trainee clipped it. Set it back up, or the lane you back into is not the lane you walked.",
        "drb-oil-patch": "An oil patch on the bend of the lane. The drive tyres can spin on it with the trailer pushing, and a spotter can slip on it.",
        "drb-light-arm": "The yard lamp's arm at the lane edge has been swung out and down, below roof height — the box's top rail would fold it back into its pole.",
      },
      title: "Get out and look",
      cue: "Get out and walk the backing path. Find what the trailer will hit or what will go wrong on the way.",
      why: "Walking the lane on foot beats every camera and mirror fitted to a tractor, because it shows ground level, head height at the building and the space directly astern — what a driver in the seat can never see. A toppled marker, a greasy stain under the drive axles and a lamp arm hanging low over the bay are plain as day from the tarmac and completely hidden once you climb back up.",
    },
    {
      id: "drb-clear-swing", kind: "drag", target: "drb-pallet-stack",
      title: "Clear the pallets from the swing",
      cue: "Drag the pallet stack out of the trailer's swing path to the marked clear spot.",
      why: "Timber stacked where the box will pivot is the cheapest obstacle on the whole range to remove and one of the most expensive to strike: splintered pallets under the tandems, a punctured sidewall, a shove into the building. Shifting it takes half a minute before reverse is engaged, and nobody should be moving anything in that zone once the rig is under way.",
      drag: { to: "drb-pallet-bay", radius: 0.5, missNote: "Still in the swing — slide the stack fully onto the green clear spot." },
    },
    {
      id: "drb-serpentine", kind: "drive", target: "drb-rig",
      title: "Back the serpentine",
      cue: "Tap the horn, then back through the cones at idle — left mirror, right mirror, left again — following the spotter.",
      why: "Weaving the markers drills the counter-intuitive core of reversing an articulated combination: the box heads opposite to the wheel, gentle early inputs succeed and big tardy ones overshoot. A short honk warns pedestrians that the combination is about to travel backwards; alternating glances — driver's side, passenger side, driver's side — keep both rear corners and the guide continuously visible.",
      holdBreakNote: "Out of the lane or out of the band in the serpentine — idle speed, small corrections, and pull up if it is going wrong.",
      drive: {
        path: [[3.6, -4.6], [2.0, -4.1], [0.4, -5.0], [-1.2, -4.1], [-3.0, -4.6]],
        speedBand: [1, 4], laneWidth: 1.4, graceSeconds: 2.0, checkWindow: 1.5, sceneRate: 0.3, reverse: true,
        bandLabel: "idle, dead slow",
        checks: [
          { at: 0, kind: "horn", note: "A tap of the horn before the first foot of reverse — anyone near the rig now knows it is about to move backwards." },
          { at: 1, kind: "mirror-left", note: "Left mirror: the first cone and your spotter's signal." },
          { at: 2, kind: "mirror-right", note: "Right mirror: the trailer's right corner past the middle cone." },
          { at: 3, kind: "mirror-left", note: "Left mirror: the last cone, and the spotter still in view." },
        ],
        controls: { brake: "drb-brake-pedal", horn: "drb-horn" },
        laneNote: "The trailer left the cone lane and stayed out — on a dock that is the trailer beside you or the building.",
      },
    },
    {
      id: "drb-wheel", kind: "turn", target: "drb-wheel-hand",
      title: "Hand at the bottom of the wheel",
      cue: "Put your hand at the bottom of the wheel and move it the way you want the trailer's rear to go.",
      why: "Gripping the rim near six o'clock turns a mental puzzle into a plain gesture: shift that hand toward whichever side the box's tail should travel, and it obliges. Novices steering from the top fight their own instinct on every correction; the handbook's bottom-grip habit makes the next manoeuvre, the angled approach to the bay, something the hands understand before the head does.",
      turn: { turns: 0.5, axis: "z", label: "WHEEL" },
    },
    {
      id: "drb-pull-up", kind: "drive", target: "drb-rig",
      title: "Pull up for the alley dock",
      cue: "Pull forward past the door, angling right so the trailer points toward it on your driver's side, with a mirror check each way.",
      why: "A good alley dock is decided in the pull-up: far enough past the door, and angled so the trailer already points toward it on the driver's side, where you can see it through your own window. Backing toward the driver's side — the sight side — is what the handbook asks for whenever the yard allows, because the blind side leaves the trailer's corner in a mirror you can barely use.",
      holdBreakNote: "Out of lane or band on the pull-up — slow, and angle it early.",
      drive: {
        path: [[-3.0, -4.6], [0, -4.6], [2.4, -4.4], [3.6, -3.8]],
        speedBand: [2, 8], laneWidth: 1.6, graceSeconds: 1.8, checkWindow: 1.5, sceneRate: 0.22,
        bandLabel: "range speed",
        checks: [
          { at: 0, kind: "mirror-right", note: "Right mirror: nothing on the blind side as the tractor angles away." },
          { at: 2, kind: "mirror-left", note: "Left mirror: the door, the parked trailer beside it and your spotter taking position." },
        ],
        controls: { brake: "drb-brake-pedal" },
      },
    },
    {
      id: "drb-pullup-point", kind: "gauge", target: "drb-pullup-gauge",
      title: "Judge the pull-up point",
      cue: "Judge how far past the door the tractor stops before the back. Commit when it is right.",
      why: "Pull up too short and the trailer cannot swing into the door without striking the parked trailer beside it; pull up too far and the back becomes a long, tight arc that needs several corrections. The right point leaves the trailer's rear already angled at the door, so the back is one smooth swing followed by a straight push.",
      gauge: { label: "PULL-UP POINT", speed: 0.7, green: [0.42, 0.64], readout: (t) => (t < 0.42 ? "too short — hits the trailer" : t > 0.64 ? "too far — a long arc" : "angled at the door"), missNote: "That pull-up leaves the trailer in the wrong place for the door — pull forward and set up again." },
    },
    {
      id: "drb-alley-dock", kind: "drive", target: "drb-rig",
      title: "Back into the alley dock",
      cue: "Tap the horn and back toward the driver's side into the door — left mirror, right mirror, left again — with the spotter always in view.",
      why: "Think of it as a pivot followed by a straight shove: the box's tail rotates toward the opening while the cab arcs round, then the final stretch runs square between its neighbours. The helper's hands and the driver's-side glass manage the pivot; the passenger-side glass watches the far corner creep past the parked van. The instant the helper is gone, everything halts.",
      holdBreakNote: "Out of lane or band in the alley dock — idle speed, and pull up rather than force it.",
      drive: {
        path: [[3.6, -3.8], [2.2, -3.3], [0.9, -2.8], [0.2, -3.1], [0, -3.8]],
        speedBand: [1, 4], laneWidth: 1.4, graceSeconds: 2.0, checkWindow: 1.3, sceneRate: 0.24, reverse: true,
        bandLabel: "idle, dead slow",
        checks: [
          { at: 0, kind: "horn", note: "Horn before reverse, every time — the dock crew is on the other side of that door." },
          { at: 1, kind: "mirror-left", note: "Left mirror: the swing toward the door, and your spotter's hands." },
          { at: 3, kind: "mirror-right", note: "Right mirror: the blind-side corner passing the parked trailer." },
          { at: 4, kind: "mirror-left", note: "Left mirror for the straight push in: the spotter signals the last feet." },
        ],
        controls: { brake: "drb-brake-pedal", horn: "drb-horn", radio: "drb-cb-radio" },
      },
    },
    {
      id: "drb-second-look", kind: "hold", target: "drb-brake-pedal", seconds: 3,
      title: "Stop short and look again",
      cue: "Hold the rig stopped a few feet short of the bumpers while the spotter checks the gap, then finish the back.",
      why: "Pausing a few feet out while the guide inspects the remaining clearance costs seconds and catches whatever changed during the manoeuvre: a leveller lip still extended, somebody leaning out of the opening, the box sitting crooked against the rubber. Only once those eyes have confirmed it does the last creep happen — the final yard is where warehouse staff get pinned.",
      holdBreakNote: "You rolled on before the gap was checked — hold the stop until the spotter signals.",
    },
    {
      id: "drb-debrief", kind: "select", target: "drb-crew-checkin",
      title: "Debrief with the spotter",
      cue: "Talk it through with the spotter: the forklift, the moment they stepped out of the mirror, and how the backing felt.",
      why: "Backing with a spotter is a two-person job, and a two-minute talk afterwards is how the pair gets better: which signal was unclear, when exactly they vanished from the mirror and why, how close the forklift came. Saying how the pressure of a first alley dock felt is part of it too — a driver who can name their stress backs more calmly next time.",
    },
    {
      id: "drb-log", kind: "select", target: "drb-eld-status",
      title: "Change the log at the door",
      cue: "Change the electronic log from driving to on duty, not driving, now the trailer is at the door.",
      why: "Manoeuvring on a range still counts as driving time under 49 CFR 395, while what follows at the bay — paperwork, waiting for the crew to empty the box — is on-duty time spent standing still. Flipping the status the moment the wheels stop keeps the electronic record faithful to the shift, instead of quietly logging a parked tractor as though it were still rolling.",
    },
  ],

  interrupts: [
    {
      id: "drb-forklift",
      kind: "Forklift behind the trailer",
      after: "drb-serpentine", delay: 3, seconds: 10,
      alert: "A lift truck has swung out from the end of the lane and is trundling straight across your box's tail, its operator staring at the pallet on the tines.",
      cue: "Warn it.",
      target: "drb-horn",
      why: "An operator absorbed in balancing a load has no idea a combination is reversing toward them. A blast on the horn, on top of the beeping reverse alarm, grabs their attention while there is still room, and the rig creeps no further until that lift truck has passed.",
      missNote: "You kept reversing while a lift truck crossed behind with nobody warned. Neither operator could see the other, and a box's rear sill meeting an overhead guard is exactly how a lift-truck operator gets hurt.",
      wrongNote: "It is the horn. A forklift is crossing behind you and its driver has not seen the trailer.",
    },
    {
      id: "drb-spotter-lost",
      kind: "Spotter out of view",
      after: "drb-alley-dock", delay: 3, seconds: 10,
      alert: "Your helper has ducked round the tail of the box to eyeball the gap, and neither pane of glass shows them or their hands any more.",
      cue: "Halt the rig.",
      target: "drb-brake-pedal",
      why: "No helper in view means no movement — full stop. They might be measuring clearance, they might be signalling where you cannot see, or they might have tripped; whichever it is, the next inch rolls in their direction.",
      missNote: "You kept reversing blind to your helper. Guides get crushed by the very rigs they direct at precisely this instant, having stepped out of view to get a better angle on the clearance.",
      wrongNote: "It is the brake. You have lost sight of the person guiding you — the rig stops until you see them again.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root, 0, 0.06, 0);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, DRB_ACCENT);

    // ------------------------------------------------------------ range apron, dock face, parked trailers
    const lotTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#4a4946", base2: "#42413e", seam: "rgba(0,0,0,0.45)" }), { repeat: 6, px: 256 });
    const lot = box(g, 24, 0.06, 18, 0, -0.03, -4.5, 0xffffff, { rough: 0.95 });
    lot.material = texturedMat(lotTex, { rough: 0.95, metal: 0.02, color: 0xb0ada8 });
    box(g, 11, 0.012, 0.08, 0.3, 0.006, -3.6, 0xf2c14b, { rough: 0.6, cast: false });
    const dock = group(g, 0, 0, -11.6);
    box(dock, 11, 3.2, 0.4, 0, 1.6, 0, 0xa9b2b9, { rough: 0.7 });
    const door = box(dock, 1.6, 2.0, 0.05, 0, 1.6, 0.22, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    for (const x of [-2.8, 2.8]) {
      const v = group(g, x, 0, -7.6);
      box(v, 1.3, 1.9, 7.4, 0, 1.3, 0, x < 0 ? 0xdfe4e8 : 0xe8e2d4, { rough: 0.6, metal: 0.2 });
    }
    // The cone lane for the serpentine.
    for (const [x, z] of [[2.0, -5.5], [0.4, -3.6], [-1.2, -5.5]]) cone(g, x, z);
    const knocked = group(g, -2.6, 0, -3.3, 0.4);
    const kc = cyl(knocked, 0.03, 0.13, 0.55, 0, 0.13, 0, 0xe4622a, { rough: 0.75, seg: 12 });
    kc.rotation.z = Math.PI / 2;
    reg2(knocked, "drb-knocked-cone");
    const oil = cyl(g, 0.45, 0.45, 0.012, 1.1, 0.01, -4.3, 0x141414, { rough: 0.15, metal: 0.2, seg: 18 });
    reg2(oil, "drb-oil-patch");
    const pallets = group(g, 1.9, 0, -6.1);
    box(pallets, 0.6, 0.5, 0.6, 0, 0.25, 0, 0x9a7a52, { rough: 0.9 });
    reg2(pallets, "drb-pallet-stack");
    const palletBay = box(g, 0.7, 0.02, 0.7, 4.6, 0.01, -2.6, 0x59c97b, { rough: 0.6, opacity: 0.4, cast: false });
    hits["drb-pallet-bay"] = palletBay;
    const lampArm = group(g, -3.7, 0, -2.9);
    cyl(lampArm, 0.04, 0.05, 2.2, 0, 1.1, 0, 0x59636d, { rough: 0.5, metal: 0.5, seg: 8 });
    const armBar = box(lampArm, 0.05, 0.05, 0.9, 0, 1.9, 0.45, 0x59636d, { rough: 0.5, metal: 0.5 });
    armBar.rotation.x = 0.5;
    reg2(lampArm, "drb-light-arm");

    // ------------------------------------------------------------ the rig, the forklift and the spotter
    const rig = flArticulate(tractorTrailer(g, -4.4, 0, -4.6, { ry: Math.PI / 2, livery: { colour: 0x7a3b6a, fleetName: "SMARTCITI YARD", unitNumber: "T-322" } }));
    rig.scale.setScalar(DRB_SCALE);
    reg2(rig, "drb-rig");
    const lift = forkliftCounterbalance(g, -9.2, 0, -8.8, { ry: Math.PI / 2 });
    lift.scale.setScalar(0.8);
    const spotter = standingFigure(g, 4.8, -6.4, { ry: -0.9, cloth: 0x2b3138, vest: 0xd8e24a, atStation: true });

    // ------------------------------------------------------------ the unsafe choices
    const redSlab = (x, z, w, d, id, text, tw) => {
      const s = slab(g, w, 0.02, d, x, 0.03, z, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
      holoTag(g, text, x, 0.28, z, { css: "#d2312b", w: tw });
      reg2(s, id);
      return s;
    };
    redSlab(0, -6.4, 1.0, 0.6, "drb-stranger-wave", "follow that yard hand's waves?", 0.48);
    redSlab(-3.9, -2.8, 1.0, 0.6, "drb-push-jackknife", "keep backing into the jackknife?", 0.5);
    redSlab(3.5, -2.4, 1.0, 0.6, "drb-back-fast", "back it quick?", 0.3);

    // ------------------------------------------------------------ the cab controls, brought to the pad
    const dash = group(g, -1.7, 0, 1.1, 0.5);
    box(dash, 1.1, 0.9, 0.36, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.34, 0.05, 0, 1.06, 0.06, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const wheel = group(dash, -0.12, 1.24, 0.28);
    const rim = cyl(wheel, 0.2, 0.2, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.5, seg: 18 });
    rim.rotation.x = 1.1;
    reg2(wheel, "drb-wheel-hand");
    const horn = box(dash, 0.08, 0.05, 0.05, 0.22, 1.2, 0.12, 0x2b2f34, { rough: 0.6 });
    reg2(horn, "drb-horn");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "drb-brake-pedal");
    const radio = box(dash, 0.14, 0.05, 0.1, -0.2, 0.92, 0.2, 0x1b1e23, { rough: 0.5 });
    reg2(radio, "drb-cb-radio");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.44, 1.2, 0.12, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "dispatch calling — pick up?", 0.44, 1.42, 0.12, { css: "#d2312b", w: 0.42 });
    reg2(phone, "drb-phone");
    const eld = instrument(dash, -0.36, 1.08, 0.09, { idle: "DRIVING", color: DRB_ACCENT, w: 0.16, d: 0.12 });
    reg2(eld, "drb-eld-status");

    // ------------------------------------------------------------ pull-up gauge, signal board, boards
    const pullPost = group(g, 2.3, 0, 1.5, -0.5);
    box(pullPost, 0.06, 1.1, 0.06, 0, 0.55, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const pullFace = decal(pullPost, 0.34, 0.2, 0, 1.22, 0.04, signFace("PULL-UP", { bg: "#1a0c14", accent: DRB_CSS, fg: "#fbe9f1", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(pullPost, "drb-pullup-gauge");
    const board = group(g, -2.9, 0, -0.9, 1.1);
    box(board, 0.05, 1.3, 0.05, 0, 0.65, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const sig = (label, y, id) => { const d = decal(board, 0.46, 0.16, 0, y, 0.03, signFace(label, { bg: "#1a0c14", accent: DRB_CSS, fg: "#fbe9f1", scale: 0.4 }), { px: 192, glow: true, ei: 0.7 }); reg2(d, id); return d; };
    sig("STOP ✋✋", 1.66, "drb-signal-stop");
    sig("SLOW ↓", 1.48, "drb-signal-slow");
    sig("COME BACK", 1.3, "drb-signal-back");
    sig("TURN ➜", 1.12, "drb-signal-turn");
    const card = holoPanel(g, 0.84, 0.54, 1.9, 1.5, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#1a0c14"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRB_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#fbe9f1"; ctx.fillText("RANGE — SERPENTINE + ALLEY DOCK", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#fdf4f8";
      ["Pull through, then back the cone lane", "Pull up past door 7, sight side", "Alley dock between two trailers", "Spotter: driver's-side rear corner", "Lose the spotter: stop", "Log at the door"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.6, accent: DRB_ACCENT });
    reg2(card, "drb-range-card");
    const checkin = holoPanel(g, 0.46, 0.3, 0.2, 1.75, 2.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SPOTTER DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Forklift · out of view · pressure", w / 2, h * 0.66);
    }, { ry: 0.2, accent: 0x4fd1ff });
    reg2(checkin, "drb-crew-checkin");

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.0, -6.0),
      onStepComplete(step) {
        if (step.id === "drb-goal") { knocked.rotation.set(0, 0, 0); kc.rotation.z = 0; kc.position.y = 0.29; armBar.rotation.x = -0.6; }
        if (step.id === "drb-clear-swing") pallets.position.set(4.6, 0, -2.6);
        if (step.id === "drb-pullup-point") repaint(pullFace, signFace("SET", { bg: "#1a0c14", accent: "#59c97b", fg: "#fbe9f1", scale: 0.55 }));
        if (step.id === "drb-alley-dock") { const art = rig.userData.articulation; if (art) { art.yaw = rig.rotation.y; art.pivot.rotation.y = 0; } door.visible = false; }
        if (step.id === "drb-log") repaint(eld.userData.screen, signFace("ON DUTY", { bg: "#1a0c14", accent: "#59c97b", fg: "#fbe9f1", scale: 0.45 }));
      },
      // The forklift really crosses behind the trailer; the spotter really
      // walks round behind it and out of both mirrors.
      onInterrupt(it) {
        if (it.id === "drb-forklift") { lift.position.set(-6.8, 0, -3.4); lift.rotation.y = Math.PI; }
        if (it.id === "drb-spotter-lost") { spotter.position.set(0.3, 0, -10.8); spotter.rotation.y = 0; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drb-forklift") { lift.position.set(-9.2, 0, -1.6); horn.material = mat(0x59c97b, { rough: 0.6 }); }
        if (it.id === "drb-spotter-lost") { spotter.position.set(1.6, 0, -9.6); spotter.rotation.y = -0.6; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "drb-pullup-point") {
          const ok = gg.t >= 0.42 && gg.t <= 0.64;
          repaint(pullFace, signFace(ok ? "ANGLED" : gg.t < 0.42 ? "SHORT" : "LONG", { bg: "#1a0c14", accent: ok ? "#59c97b" : "#f2ae14", fg: "#fbe9f1", scale: 0.5 }));
        }
        if (session?.turn && step?.id === "drb-wheel") wheel.rotation.z = session.turn.amount * Math.PI * 2;
        if (session?.drive) wheel.rotation.z = -session.drive.steer * 0.9;
        void t; void dt;
      },
    };
  },
};
