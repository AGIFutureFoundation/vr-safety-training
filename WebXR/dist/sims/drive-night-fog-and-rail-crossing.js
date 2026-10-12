import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat, gradientFill, noiseTexture } from "../../../shared/kit.js";
import { tractorTrailer, flArticulate } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Night Fog and Rail Crossing VR — Mobility & Transit, the fourth
// deep driving station in the Job Readiness Edition. A placarded cargo tank
// driven at night into fog and over a rail crossing: low beams, not high,
// a speed you can stop inside the distance you can see, the window down to
// listen, the stop at the crossing that 49 CFR 392 requires of a hazmat cargo
// tank, a look for the second track and room on the far side, across in one
// gear without shifting, and the shipping papers where a responder will look.
//
// The road is drawn at half scale and the fog is the stage's own weather; the
// HUD band is the trainee's hold and every speed in the text is "per the
// posted limit". The stopping distance — no closer than fifteen feet and
// within fifty of the nearest rail — is 49 CFR 392's own, attributed to it.
// Sited generically: no real railroad, crossing or carrier.

const DRN_ACCENT = 0x9aa8ff;
const DRN_CSS = "#9aa8ff";
const DRN_SCALE = 0.5;

export const SIM_DRIVE_NIGHT_FOG_AND_RAIL_CROSSING = {
  id: "drive-night-fog-and-rail-crossing",
  index: "321",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, Job Readiness Edition deep driving — Teamsters tank and hazmat freight at night: fog, lights and railroad crossings under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "fog",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A curriculum includes night operation, extreme driving conditions and railroad-highway grade crossings; 49 CFR 383 for the skills test; 49 CFR 392 for driving a commercial motor vehicle, including the stop a hazmat cargo tank must make at a rail crossing and the no-shifting rule on the tracks; 49 CFR 393 for headlamps and lamps; PHMSA 49 CFR 177 for the shipping papers' place in the cab; 49 CFR 395 for the duty status; the state CDL handbook's night, fog and railroad-crossing guidance; CVSA roadside inspection practice; Teamsters (IBT) freight locals' driver training",
  name: "Night Fog and Rail Crossing",
  title: simTitle("Night Fog and Rail Crossing"),
  tagline: "A placarded tank at night into fog and over the tracks: low beams, a speed inside your sight distance, the window down, the stop the rule requires, both tracks and the far side checked, across in one gear",
  accent: DRN_ACCENT,
  accentCss: DRN_CSS,
  parSeconds: 320,
  footprint: 2.6,
  apron: false,
  badge: { id: "one-gear-across", name: "One Gear Across", note: "Lights right for the fog, the stop in the band, both tracks looked for and across without a shift — first time" },

  game: system({
    name: "Crossing",
    currency: "RAIL",
    ranks: ["Permit Holder", "Night Trainee", "Tank Driver", "Hazmat Lead", "Crossing Certified"],
    badges: [
      { id: "low-beams", name: "Low Beams", note: "All three drives with every check on time", test: AWARD.all(AWARD.stepClean("drn-into-fog"), AWARD.stepClean("drn-across"), AWARD.stepClean("drn-fog-bank")) },
      { id: "never-on-the-tracks", name: "Never on the Tracks", note: "Never used high beams in fog, raced the train, stopped on the tracks or reached for the phone", test: AWARD.safe },
      { id: "sight-distance", name: "Inside Sight Distance", note: "Every drive and the fog speed held in band with no excursion", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-night", name: "Clean Night", note: "No corrections anywhere", test: AWARD.clean },
      { id: "fifteen-to-fifty", name: "Fifteen to Fifty", note: "The stop point and drives near the centre of their bands", test: AWARD.precise(0.8) },
      { id: "on-time", name: "On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drn-high-beams": "You went to switch to high beams in the fog. Fog reflects a high beam straight back into your eyes as a white wall, and you see less, not more. Low beams — and fog lamps if the rig has them — light the road under the fog instead of the fog itself.",
    "drn-race-train": "You went to beat the train across. A train cannot stop or swerve, it is usually closer and faster than it looks at night, and a tractor-trailer takes a long time to clear a crossing. Nobody ever needed the time they save by racing a train.",
    "drn-stop-on-tracks": "You went to stop with the trailer still over the tracks because traffic is queued beyond the crossing. Never start across unless there is room to clear the tracks completely on the far side — a rig stopped on a crossing is the crash the whole procedure exists to prevent.",
    "drn-phone": "You went to pick up the hand-held phone. 49 CFR 392 prohibits hand-held mobile phone use and texting by commercial drivers, and at a crossing at night you need your ears as much as your eyes: the radio off, the fan off, nothing in your hand.",
  },

  lateNotes: {
    "drn-window-crank": "The window comes down on the approach to the crossing, so you can listen before you stop.",
    "drn-stop-gauge": "The stop point is judged on the approach, once the crossing is in sight.",
    "drn-shipping-papers": "The papers go in the door pocket when you leave the cab at the end — not while you are driving.",
  },

  steps: [
    {
      id: "drn-card", kind: "select", target: "drn-trip-card",
      title: "Read the load and the night",
      cue: "Read the trip card: a placarded cargo tank, the fog advisory, and the rail crossing on the route.",
      why: "What you are hauling changes how you drive this road. A placarded cargo tank is one of the vehicles 49 CFR 392 requires to stop at a rail crossing, the fog advisory decides your speed and your lights before you see a single wisp of it, and knowing a crossing is coming means you are listening for a train a long way before the crossbuck appears out of the fog.",
    },
    {
      id: "drn-cab", kind: "sequence",
      targets: ["drn-wipers", "drn-defrost", "drn-mirror-heat"],
      itemNames: { "drn-wipers": "wipers on intermittent", "drn-defrost": "defrost on the windscreen", "drn-mirror-heat": "heated mirrors on" },
      title: "Wipers, defrost, heated mirrors",
      cue: "Before the fog: wipers on intermittent, defrost on, and the mirror heaters on.",
      why: "Fog is water in the air, and it settles on the glass and the mirrors as a film that scatters every light into glare. Wipers on intermittent, the defroster on the windscreen and the mirror heaters on keep the surfaces you look through clear before the fog thickens, instead of being fiddled with once you are already in it with a tank behind you.",
      outOfOrderNote: "Wipers, then defrost, then the mirror heaters — clear the windscreen first, it is where you look most.",
    },
    {
      id: "drn-into-fog", kind: "drive", target: "drn-rig",
      title: "Low beams and into the fog",
      cue: "Low beams on before you pull away, then slow into the fog with a look in each mirror.",
      why: "Headlamps are for being seen as much as for seeing, and in fog the low beam does both better than the high: it lights the road surface under the fog, not the fog itself. Slowing as you enter keeps your stopping distance inside the distance your lights reach — overdriving your headlights in fog is how a stopped car becomes a crash.",
      holdBreakNote: "Out of the lane or out of the band in the fog. Hold a speed you can stop inside the distance you can see.",
      drive: {
        path: [[-6.2, -1.2], [-6.3, -3.0], [-6.0, -4.6], [-5.4, -5.6], [-4.6, -5.8]],
        speedBand: [10, 25], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.2, sceneRate: 0.08,
        bandLabel: "slow for the fog, per the posted limit",
        checks: [
          { at: 0, kind: "lights", note: "Low beams on before you move — in fog the high beam blinds you with your own light." },
          { at: 2, kind: "mirror-left", note: "Left mirror: nobody closing fast behind you in the murk." },
          { at: 3, kind: "mirror-right", note: "Right mirror: the tank's side and the shoulder edge, the only line you can see." },
        ],
        controls: { brake: "drn-brake-pedal" },
        laneNote: "You left the lane in the fog — the edge line is all there is to follow, and past it is the ditch.",
      },
    },
    {
      id: "drn-window", kind: "turn", target: "drn-window-crank",
      title: "Window down to listen",
      cue: "Wind the window down on the approach, with the radio and fan off, so you can hear a train.",
      why: "In fog you may hear a train long before you see its headlight, but not through a closed window with the fan roaring and the radio on. Winding the window down and silencing the cab on the approach to every crossing costs nothing, and at night in fog it can be the only warning you get.",
      turn: { turns: 1, axis: "z", label: "WINDOW" },
    },
    {
      id: "drn-stop-point", kind: "gauge", target: "drn-stop-gauge",
      title: "Judge the stop point",
      cue: "Judge where the cab stops: no closer than 15 feet and within 50 feet of the nearest rail. Commit when it is right.",
      why: "49 CFR 392 has the vehicles it requires to stop — a hazmat cargo tank among them — stop within fifty feet of the nearest rail and no closer than fifteen. Too far back and you cannot see down the tracks past the buildings and brush; too close and the overhang of a passing train, or a slide on a wet road, reaches you.",
      gauge: { label: "TO NEAREST RAIL", speed: 0.7, green: [0.2, 0.72], readout: (t) => `${Math.round(5 + t * 60)} ft`, missNote: "That stop point is outside fifteen to fifty feet from the nearest rail — judge it again before the cab gets there." },
    },
    {
      id: "drn-stop", kind: "hold", target: "drn-brake-pedal", seconds: 4,
      title: "Stop and hold at the crossing",
      cue: "Hold the rig stopped at the stop point while you look and listen both ways.",
      why: "The stop is only worth making if the rig stays stopped long enough to look and listen properly — both directions, down both tracks, with the window open. Rolling forward while still looking puts the cab closer to the rails with every second, and in fog the headlight of a train can appear and be on you faster than a creeping truck can react.",
      holdBreakNote: "You rolled off the stop before the look and listen were done — hold it until you have checked both ways.",
    },
    {
      id: "drn-look", kind: "find", noHint: true,
      targets: ["drn-second-track", "drn-low-clearance", "drn-far-queue"],
      itemNames: { "drn-second-track": "the second set of tracks", "drn-low-clearance": "the low ground clearance sign", "drn-far-queue": "traffic stopped just past the crossing" },
      itemNotes: {
        "drn-second-track": "A second track. When one train passes, another can be coming the other way on the second — look again before you go.",
        "drn-low-clearance": "Low ground clearance: a humped crossing can hang up a low-slung trailer on the rails. Know it before you are on it.",
        "drn-far-queue": "Cars stopped just beyond the crossing. Do not start across until there is room for the whole rig past the tracks.",
      },
      title: "Look both ways, and past the tracks",
      cue: "Look both ways down every track and past the crossing. Find what would trap the rig on the rails.",
      why: "A crossing is cleared in three directions, not two: both ways down every track, because a second track can hide a second train, and past the crossing, because a queue on the far side can leave a trailer's tail on the rails. A humped crossing is the third trap — a low trailer hung up on the rails is stuck exactly where a train will be.",
    },
    {
      id: "drn-across", kind: "drive", target: "drn-rig",
      title: "Across in one gear",
      cue: "Go across in the gear you started in — no shifting on the tracks — and watch the tank clear in the right mirror.",
      why: "The gear for the crossing is chosen before you start, because a missed shift on the tracks can leave the rig in neutral with a train coming. Going across in one gear, steadily, and watching in the right mirror until the whole tank is clear of the far rail, is the procedure; 49 CFR 392 forbids shifting gears while crossing for exactly that reason.",
      holdBreakNote: "Out of lane or band on the crossing — steady and in one gear, not stopping and not rushing.",
      drive: {
        path: [[-4.6, -5.8], [-1.0, -5.8], [2.0, -5.8], [4.6, -5.6], [6.2, -4.4]],
        speedBand: [3, 12], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.6, sceneRate: 0.18,
        bandLabel: "steady, one gear, no shifting",
        checks: [
          { at: 2, kind: "mirror-right", note: "Right mirror: is the whole tank past the far rail yet?" },
          { at: 4, kind: "mirror-left", note: "Left mirror as you pull away: the crossing behind you and the road ahead." },
        ],
        forbid: {
          "gear-up": "You shifted gears on the crossing. A missed shift on the tracks can leave the rig in neutral on the rails — choose the gear before you start across and stay in it.",
          "gear-down": "You shifted gears on the crossing. A missed shift on the tracks can leave the rig in neutral on the rails — choose the gear before you start across and stay in it.",
        },
        controls: { brake: "drn-brake-pedal" },
      },
    },
    {
      id: "drn-fog-speed", kind: "track", target: "drn-throttle", seconds: 5,
      title: "Hold your speed inside your sight",
      cue: "The fog thickens past the crossing. Hold a speed at which you could stop within what your lights show.",
      why: "The handbook's answer to fog is simple and unpopular: slow down until you could stop within the distance you can see, and if you cannot see, find a safe place off the road. The trap is creeping back up to speed as your eyes adjust — the fog did not get thinner just because you got used to it.",
      track: { start: 0.2, green: [0.3, 0.52], rise: 0.5, fall: 0.44, drift: 0.13, label: "SPEED", readout: (v) => (v < 0.3 ? "crawling — traffic behind" : v > 0.52 ? "outrunning the lights" : "inside sight distance") },
      holdBreakNote: "Speed out of band in the fog — slow enough to stop within what you can see, not slower than you need.",
    },
    {
      id: "drn-fog-bank", kind: "drive", target: "drn-rig",
      title: "Through the fog bank",
      cue: "Through the thickest fog: check left for the edge, right for the tank, and follow the fog line.",
      why: "In the thickest fog the right edge line is the most reliable guide you have, and the mirrors tell you the tank is tracking where you think it is. Keeping checks going while your eyes want to lock on the patch of road in the headlights is what stops the rig drifting onto the shoulder, where people who have stopped in fog are standing.",
      holdBreakNote: "Out of lane or band in the fog bank — follow the edge line and hold your speed down.",
      drive: {
        path: [[6.2, -4.4], [6.6, -3.0], [6.7, -1.4], [6.5, 0.4], [5.8, 2.0]],
        speedBand: [8, 20], laneWidth: 1.5, graceSeconds: 1.8, checkWindow: 1.3, sceneRate: 0.09,
        bandLabel: "fog — inside your sight distance",
        checks: [
          { at: 1, kind: "mirror-left", note: "Left mirror: the centre line, and anyone trying to pass blind." },
          { at: 3, kind: "mirror-right", note: "Right mirror: the tank and the shoulder, where a stopped car or a person would be." },
        ],
        controls: { brake: "drn-brake-pedal" },
      },
    },
    {
      id: "drn-papers", kind: "drag", target: "drn-shipping-papers",
      title: "Shipping papers in the door pocket",
      cue: "Leaving the cab at the stop: put the shipping papers in the driver's door pocket.",
      why: "If something happens to a hazmat load while the driver is away from the controls, the first responder needs the shipping papers without searching the cab. PHMSA's 49 CFR 177 puts them in a holder on the inside of the driver's door or on the driver's seat whenever you are out of it, where anyone at the door will find them.",
      drag: { to: "drn-door-pocket", radius: 0.45, missNote: "Not in the pocket — the papers go in the holder on the driver's door, all the way in." },
    },
    {
      id: "drn-debrief", kind: "select", target: "drn-crew-checkin",
      title: "Talk the night through with the trainer",
      cue: "Go over the crossing, the pedestrian in the fog and your speed with the trainer, and say how the night felt.",
      why: "Night fog with a tank behind you is draining, and the tiredness it leaves is a hazard for the rest of the shift. Talking through the crossing, the pedestrian who appeared at the edge of the beams and how slow the fog made you feel, with a trainer who has driven it, turns a tense run into judgement you can use next time — and names fatigue before it names itself.",
    },
    {
      id: "drn-log", kind: "select", target: "drn-eld-status",
      title: "Log the stop",
      cue: "Change the electronic log to on duty, not driving, for the stop.",
      why: "Night hours count exactly like day hours under 49 CFR 395, and a slow drive through fog eats into the day's driving time faster than planned. Logging the stop honestly when the wheels stop keeps the record true, and a true record is what tells you — and your dispatcher — that you are out of hours before the next leg rather than halfway through it.",
    },
  ],

  interrupts: [
    {
      id: "drn-signals",
      kind: "Crossing signals",
      after: "drn-into-fog", delay: 3, seconds: 10,
      alert: "Out of the fog ahead, the crossing's red lights have started flashing and the bell is ringing — a train is coming.",
      cue: "Stop short of the crossing.",
      target: "drn-brake-pedal",
      why: "Flashing lights and a bell mean a train is close, whatever you can or cannot see down the tracks in the fog. The answer is a controlled stop short of the crossing and a wait until the lights stop and the track is clear — never a run at it.",
      missNote: "You kept rolling toward a crossing with its lights flashing. A train cannot stop for you, fog hides how close it is, and a placarded tank on a crossing is the worst crash in this whole course.",
      wrongNote: "It is the brake. The crossing signals are flashing — the rig stops short of the tracks.",
    },
    {
      id: "drn-walker",
      kind: "Pedestrian in the fog",
      after: "drn-fog-bank", delay: 3, seconds: 10,
      alert: "A person in dark clothes has appeared at the edge of your low beams, walking on the shoulder toward you, close to the lane.",
      cue: "Slow down and give them room.",
      target: "drn-brake-pedal",
      why: "At night in fog a pedestrian in dark clothing is visible for a moment before you reach them. Braking at once and easing away from the shoulder if the lane allows gives them the room and gives you the time — the tank's side and its mirror pass within feet of the shoulder.",
      missNote: "You held your speed past a pedestrian at the edge of the lane in fog. Dark clothing at night is seen late, and the trailer's side and mirror pass far closer to the shoulder than the cab does.",
      wrongNote: "It is the brake. Someone is walking at the edge of the lane in the fog.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root, 0, 0.06, 0);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, DRN_ACCENT);

    // ------------------------------------------------------------ ground and the country road
    const drnRoadTex = surfaceTexture((cx, w, h) => {
      gradientFill(cx, w, h, [[0, "#2f3134"], [1, "#2a2c2f"]], { horizontal: true });
      noiseTexture(cx, w, h, { density: 4400, alpha: 0.18, tone: "0,0,0" });
      cx.fillStyle = "rgba(240,240,232,0.95)"; cx.fillRect(4, 0, 6, h); cx.fillRect(w - 10, 0, 6, h);
      cx.fillStyle = "rgba(242,193,75,0.95)"; for (let y = 0; y < h; y += h / 3) cx.fillRect(w / 2 - 3, y, 6, h * 0.18);
    }, { repeat: 1, px: 256 });
    drnRoadTex.repeat?.set?.(1, 2);
    const roadMat = texturedMat(drnRoadTex, { rough: 0.9, metal: 0.02 });
    const fieldTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h), { repeat: 6, px: 256 });
    const ground = box(g, 24, 0.06, 20, 0.5, -0.03, -2.0, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(fieldTex, { rough: 0.95, metal: 0.02, color: 0x6f7a62 });
    const roadPts = [[-6.1, 0.4], [-6.2, -1.2], [-6.3, -3.0], [-6.0, -4.6], [-5.4, -5.6], [-4.6, -5.8], [-1.0, -5.8], [2.0, -5.8], [4.6, -5.6], [6.2, -4.4], [6.6, -3.0], [6.7, -1.4], [6.5, 0.4], [5.8, 2.0], [4.6, 3.4]];
    for (let i = 1; i < roadPts.length; i++) {
      const [x0, z0] = roadPts[i - 1], [x1, z1] = roadPts[i];
      const seg = box(g, 2.4, 0.04, Math.hypot(x1 - x0, z1 - z0) + 0.35, (x0 + x1) / 2, 0.02, (z0 + z1) / 2, 0xffffff, { rough: 0.9, cast: false });
      seg.material = roadMat; seg.rotation.y = Math.atan2(x1 - x0, z1 - z0);
    }

    // ------------------------------------------------------------ the rail line: two tracks crossing the road
    const tieTex = surfaceTexture((cx, w, h) => {
      gradientFill(cx, w, h, [[0, "#6d6258"], [1, "#5f554c"]]);
      noiseTexture(cx, w, h, { density: 6000, alpha: 0.3, tone: "40,35,30" });
      cx.fillStyle = "rgba(70,48,32,0.95)"; for (let y = 0; y < h; y += h / 8) cx.fillRect(0, y, w, h / 18);
    }, { repeat: 1, px: 256 });
    tieTex.repeat?.set?.(1, 6);
    const tieMat = texturedMat(tieTex, { rough: 0.95, metal: 0.02 });
    const tracks = [];
    for (const x of [0.9, 2.4]) {
      const bed = box(g, 1.3, 0.05, 20, x, 0.045, -6.0, 0xffffff, { rough: 0.95, cast: false });
      bed.material = tieMat;
      const pair = group(g, x, 0, -6.0);
      for (const sx of [-0.36, 0.36]) box(pair, 0.06, 0.08, 20, sx, 0.11, 0, 0xa7adb2, { rough: 0.35, metal: 0.8 });
      tracks.push(pair);
    }
    reg2(tracks[1], "drn-second-track");
    // The crossing signal: crossbuck, two red lamps, and the track-count plate.
    const signal = group(g, -0.3, 0, -4.2, 0);
    cyl(signal, 0.05, 0.05, 2.6, 0, 1.3, 0, 0xd9dcdf, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(signal, 0.9, 0.9, 0, 2.3, 0.05, (cx, w, h) => {
      cx.clearRect(0, 0, w, h); cx.save(); cx.translate(w / 2, h / 2);
      for (const a of [Math.PI / 4, -Math.PI / 4]) { cx.save(); cx.rotate(a); cx.fillStyle = "#f4f4f0"; cx.fillRect(-w * 0.48, -h * 0.07, w * 0.96, h * 0.14); cx.fillStyle = "#1b1e23"; cx.font = `700 ${Math.round(h * 0.09)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(a > 0 ? "RAILROAD" : "CROSSING", 0, 0); cx.restore(); }
      cx.restore();
    }, { px: 256, transparent: true });
    const lampL = cyl(signal, 0.1, 0.1, 0.06, -0.24, 1.7, 0.06, 0x3a1010, { rough: 0.4, seg: 12 });
    const lampR = cyl(signal, 0.1, 0.1, 0.06, 0.24, 1.7, 0.06, 0x3a1010, { rough: 0.4, seg: 12 });
    lampL.rotation.x = Math.PI / 2; lampR.rotation.x = Math.PI / 2;
    decal(signal, 0.36, 0.18, 0, 1.35, 0.05, signFace("2 TRACKS", { bg: "#f4f4f0", fg: "#1b1e23", accent: "#1b1e23", scale: 0.5 }), { px: 128 });
    const lampOn = mat(0xff3322, { emissive: 0xff2211, ei: 2.2, rough: 0.3 });
    const lampOff = lampL.material;
    const lowSign = group(g, -3.0, 0, -4.1, 0.3);
    cyl(lowSign, 0.03, 0.03, 1.3, 0, 0.65, 0, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(lowSign, 0.6, 0.6, 0, 1.3, 0.02, signFace("LOW GROUND CLEARANCE", { bg: "#f2c14b", fg: "#1b1e23", accent: "#1b1e23", scale: 0.3 }), { px: 192 });
    reg2(lowSign, "drn-low-clearance");
    // A queue of tail lights just past the tracks.
    const queue = group(g, 4.6, 0, -4.6, 0.8);
    box(queue, 0.95, 0.62, 2.3, 0, 0.4, 0, 0x3a4450, { rough: 0.4, metal: 0.4 });
    box(queue, 0.7, 0.08, 0.04, 0, 0.62, -1.16, 0xd8322c, { emissive: 0xc01810, ei: 1.8, rough: 0.35 });
    reg2(queue, "drn-far-queue");
    // Fence posts along the field edge, the only other things in the fog.
    for (const [x, z] of [[-8.4, -3.0], [-8.0, -6.6], [8.6, -6.8], [8.8, -1.0]]) cyl(g, 0.05, 0.06, 1.0, x, 0.5, z, 0x5b4636, { rough: 0.9, seg: 6 });

    // ------------------------------------------------------------ the rig: a placarded cargo tank
    const rig = flArticulate(tractorTrailer(g, -6.2, 0, -1.2, { ry: Math.PI, trailer: "tanker", livery: { colour: 0x3b4a8a, fleetName: "SMARTCITI TANK LINES", unitNumber: "T-321" } }));
    rig.scale.setScalar(DRN_SCALE);
    reg2(rig, "drn-rig");
    const walker = standingFigure(g, 9.6, -2.6, { ry: -Math.PI / 2, cloth: 0x22262b, trousers: 0x1b1e23, atStation: true });

    // ------------------------------------------------------------ the unsafe choices
    const redSlab = (x, z, w, d, id, text, tw) => {
      const s = slab(g, w, 0.02, d, x, 0.07, z, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
      holoTag(g, text, x, 0.3, z, { css: "#d2312b", w: tw });
      reg2(s, id);
      return s;
    };
    redSlab(1.65, -4.6, 1.2, 0.6, "drn-stop-on-tracks", "stop on the tracks for the queue?", 0.5);
    redSlab(-1.9, -3.9, 1.0, 0.6, "drn-race-train", "beat the train across?", 0.38);

    // ------------------------------------------------------------ the cab controls, brought to the pad
    const dash = group(g, -1.7, 0, 1.1, 0.5);
    box(dash, 1.1, 0.9, 0.36, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.34, 0.05, 0, 1.06, 0.06, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const wipers = box(dash, 0.08, 0.05, 0.05, -0.1, 1.12, 0.1, 0x59636d, { rough: 0.5 });
    reg2(wipers, "drn-wipers");
    const defrost = box(dash, 0.08, 0.05, 0.05, 0.06, 1.12, 0.1, 0x4a6aa8, { rough: 0.5 });
    reg2(defrost, "drn-defrost");
    const mirrorHeat = box(dash, 0.08, 0.05, 0.05, 0.22, 1.12, 0.1, 0xb86a2a, { rough: 0.5 });
    reg2(mirrorHeat, "drn-mirror-heat");
    const highBeam = box(dash, 0.07, 0.05, 0.05, -0.26, 1.12, 0.1, 0x2f6fe0, { rough: 0.5 });
    holoTag(dash, "high beams to see better?", -0.26, 1.36, 0.1, { css: "#d2312b", w: 0.4 });
    reg2(highBeam, "drn-high-beams");
    const crank = group(dash, 0.56, 0.9, 0.05);
    box(crank, 0.03, 0.14, 0.03, 0, 0.05, 0, 0x2b2f34, { rough: 0.5 });
    reg2(crank, "drn-window-crank");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "drn-brake-pedal");
    const throttle = box(dash, 0.08, 0.03, 0.18, 0.22, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(throttle, "drn-throttle");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.4, 0.96, 0.18, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "phone lit up — check it?", 0.4, 0.8, 0.2, { css: "#d2312b", w: 0.38 });
    reg2(phone, "drn-phone");
    const eld = instrument(dash, -0.36, 1.08, 0.09, { idle: "DRIVING", color: DRN_ACCENT, w: 0.16, d: 0.12 });
    reg2(eld, "drn-eld-status");
    const papers = box(g, 0.22, 0.02, 0.3, -0.6, 0.93, 1.35, 0xf2ecd8, { rough: 0.8 });
    reg2(papers, "drn-shipping-papers");
    const pocket = box(g, 0.34, 0.26, 0.06, -2.55, 0.5, 1.7, 0x3a3f45, { rough: 0.8 });
    hits["drn-door-pocket"] = pocket;

    // ------------------------------------------------------------ stop-point gauge, boards, trainer
    const stopPost = group(g, 2.3, 0, 1.5, -0.5);
    box(stopPost, 0.06, 1.1, 0.06, 0, 0.55, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const stopFace = decal(stopPost, 0.34, 0.2, 0, 1.22, 0.04, signFace("TO RAIL", { bg: "#0c0e1a", accent: DRN_CSS, fg: "#e6e9ff", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(stopPost, "drn-stop-gauge");
    const card = holoPanel(g, 0.84, 0.54, 1.9, 1.5, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#0c0e1a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRN_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e6e9ff"; ctx.fillText("NIGHT LEG — PLACARDED TANK", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f2f3ff";
      ["Fog advisory on the valley road", "Rail crossing: 2 tracks", "Tank must stop: 15–50 ft from rail", "Across in one gear — no shifting", "Speed: per the posted limit", "Papers in the door pocket at stops"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.6, accent: DRN_ACCENT });
    reg2(card, "drn-trip-card");
    const checkin = holoPanel(g, 0.46, 0.3, 0.2, 1.75, 2.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("NIGHT DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Crossing · the walker · fatigue", w / 2, h * 0.66);
    }, { ry: 0.2, accent: 0x4fd1ff });
    reg2(checkin, "drn-crew-checkin");
    standingFigure(g, -2.9, 0.7, { ry: 1.4, cloth: 0x2d3350, vest: 0xd8e24a });
    let flashing = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.0, -6.0),
      onStepComplete(step) {
        if (step.id === "drn-stop-point") repaint(stopFace, signFace("IN BAND", { bg: "#0c0e1a", accent: "#59c97b", fg: "#e6e9ff", scale: 0.42 }));
        if (step.id === "drn-papers") papers.position.set(-2.55, 0.6, 1.72);
        if (step.id === "drn-log") repaint(eld.userData.screen, signFace("ON DUTY", { bg: "#0c0e1a", accent: "#59c97b", fg: "#e6e9ff", scale: 0.45 }));
      },
      // The crossing's lamps really start flashing; the walker really steps
      // into the edge of the beams on the shoulder.
      onInterrupt(it) {
        if (it.id === "drn-signals") { flashing = true; lampL.material = lampOn; }
        if (it.id === "drn-walker") { walker.position.set(7.4, 0, -0.6); walker.rotation.y = Math.PI; }
      },
      onInterruptEnd(it) {
        if (it.id === "drn-signals") { flashing = false; lampL.material = lampOff; lampR.material = lampOff; }
        if (it.resolved !== "answered") return;
        if (it.id === "drn-walker") walker.position.set(8.4, 0, 1.2);
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "drn-stop-point") {
          const ok = gg.t >= 0.2 && gg.t <= 0.72;
          repaint(stopFace, signFace(`${Math.round(5 + gg.t * 60)} ft`, { bg: "#0c0e1a", accent: ok ? "#59c97b" : "#f2ae14", fg: "#e6e9ff", scale: 0.5 }));
        }
        if (session?.turn && step?.id === "drn-window") crank.rotation.z = session.turn.amount * Math.PI * 2;
        if (flashing) {
          const on = Math.floor(t * 2.4) % 2 === 0;
          lampL.material = on ? lampOn : lampOff;
          lampR.material = on ? lampOff : lampOn;
        }
        void dt;
      },
    };
  },
};
