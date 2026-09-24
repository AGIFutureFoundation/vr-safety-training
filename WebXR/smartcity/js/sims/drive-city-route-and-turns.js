import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, mat, gradientFill, noiseTexture } from "../../../shared/kit.js";
import { tractorTrailer, flArticulate, sedan } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ City Route and Turns VR — Mobility & Transit, the first of six
// deep driving stations in the Job Readiness Edition, after the TDL block's
// yard work. A tractor-trailer driven round a city block of right turns the
// way road training teaches them: signal early, stay in your own lane and
// swing wide only as you finish the turn, keep the trailer's rear close to
// the curb so nobody can squeeze up the inside, and live in the right mirror
// because that is where the trailer tandem cuts in toward the corner.
//
// The course is drawn at half scale so a whole block fits round the pad; the
// rig is the fleet kit's tractor-trailer at the same half scale, articulated
// so its trailer really off-tracks behind the tractor. Speeds on the HUD are
// the game's turning band, and the route text only ever says "per the posted
// limit" — no limit is invented. Sited generically: no real carrier, street
// or city, and no clause number the station is not sure of.

const DRC_ACCENT = 0x5fb8f0;
const DRC_CSS = "#5fb8f0";
const DRC_SCALE = 0.5;

export const SIM_DRIVE_CITY_ROUTE_AND_TURNS = {
  id: "drive-city-route-and-turns",
  index: "318",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, Job Readiness Edition deep driving — Teamsters freight driving on city streets under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "overcast",
  certification: "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A theory and road curriculum covers turning, space management and visual search; 49 CFR 383 for the Class A skills test the road portion prepares for; 49 CFR 392 for driving a commercial motor vehicle, including the hand-held phone rule; 49 CFR 393 for the mirrors and turn signals the route depends on; 49 CFR 395 for the duty status logged at the end; the state CDL handbook's turning and space-management guidance; CVSA roadside inspection practice; Teamsters (IBT) freight locals' driver training",
  name: "City Route and Turns",
  title: simTitle("City Route and Turns"),
  tagline: "A block of right turns with a trailer behind you: signal early, hold your lane, swing wide only as you finish, keep the rear tight to the curb, and live in the right mirror where the tandem cuts in",
  accent: DRC_ACCENT,
  accentCss: DRC_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tight-to-the-curb", name: "Tight to the Curb", note: "Three right turns with every signal and mirror on time, nobody squeezed up the inside, and nothing climbed — first time" },

  game: system({
    name: "Road",
    currency: "BLOCK",
    ranks: ["Permit Holder", "Road Trainee", "City Driver", "Route Lead", "Road Certified"],
    badges: [
      { id: "mirror-eyes", name: "Mirror Eyes", note: "Every drive step finished with no check missed", test: AWARD.all(AWARD.stepClean("drc-first-turn"), AWARD.stepClean("drc-second-turn"), AWARD.stepClean("drc-third-turn")) },
      { id: "no-squeeze", name: "No Squeeze Play", note: "Never swung left, cut the corner, rolled a red or picked up the phone", test: AWARD.safe },
      { id: "smooth-hands", name: "Smooth Hands", note: "Every drive held in lane and band with no excursion", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-block", name: "Clean Block", note: "No corrections anywhere", test: AWARD.clean },
      { id: "centre-line", name: "Centre of the Lane", note: "Drives and the swing-point read near the centre of their bands", test: AWARD.precise(0.8) },
      { id: "on-schedule", name: "On Schedule", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drc-left-swing": "You went to swing out to the left before the right turn. That is the move that invites the squeeze play: it opens a gap between your trailer and the curb that a car or a cyclist rolls into, and then your trailer tandem closes on them as it cuts in. Stay in your own lane, keep the rear tight to the curb, and swing wide only as you finish the turn.",
    "drc-corner-cut": "You went to start the turn early and cut the corner. A trailer's tandem tracks well inside the path of the tractor in a turn, so a turn started early puts the trailer wheels over the curb — through the sign post, the pedestrian waiting there, or the corner of the building. Pull further into the intersection before you turn.",
    "drc-red-roll": "You went to roll through the right turn on red without stopping. A right on red, where it is allowed at all, starts from a full stop with a look at the crosswalk and the lane you are turning into, and a tractor-trailer that rolls it cannot stop short for the pedestrian its right mirror has not shown yet.",
    "drc-phone": "You went to pick up the hand-held phone while driving. FMCSA prohibits hand-held mobile phone use and texting by commercial drivers under 49 CFR 392, and a city block is where your eyes are needed on three mirrors at once. The call waits until the brakes are set.",
  },

  lateNotes: {
    "drc-steering": "Hand-over-hand comes as you finish the turn, once you have pulled far enough into the intersection — not before the trailer has cleared the corner.",
    "drc-wheel-chock": "The chock goes in at the kerb once the rig is parked and the brakes are set — never while it can still roll.",
    "drc-eld-status": "The log changes once the rig is parked for the delivery, so driving time is logged as what it was.",
  },

  steps: [
    {
      id: "drc-route", kind: "select", target: "drc-route-card",
      title: "Read the route and the turns",
      cue: "Read the route card: the three right turns, the truck route, the tight corner and where you will park.",
      why: "A city route is planned before the wheels turn, because the turns are where a tractor-trailer gets into trouble. Knowing that all three turns are rights, which corner is tight, where the truck route runs and where the delivery parks lets you set up lane position and speed for each turn early, instead of discovering a corner you cannot make halfway into it.",
    },
    {
      id: "drc-cab-setup", kind: "sequence",
      targets: ["drc-seatbelt", "drc-mirror-adjust", "drc-gauges"],
      itemNames: { "drc-seatbelt": "seat belt on", "drc-mirror-adjust": "both mirrors set to show the trailer's side", "drc-gauges": "air, oil and temperature gauges read" },
      title: "Belt, mirrors, gauges",
      cue: "Belt on, set both mirrors so each shows the side of the trailer and the lane beside it, then read the gauges.",
      why: "The mirrors are how you will see the trailer through every turn, so they are set before the truck moves: each one showing a sliver of the trailer's side and the lane beside it, with the convex mirror showing the tandem. The belt goes on first because a sudden stop in the city is not a rare event, and the gauges are read so a low-air or overheat warning is news before you are in traffic.",
      outOfOrderNote: "Belt first, then mirrors, then the gauges — you set the mirrors from the seat you will drive in, belted.",
    },
    {
      id: "drc-first-turn", kind: "drive", target: "drc-rig",
      title: "First right: signal early, swing late",
      cue: "Signal right before you move, check the right mirror, hold your lane to the corner, then turn — watching the tandem in the right mirror.",
      why: "A right turn in a tractor-trailer is made from your own lane: signal well before the corner, check the right mirror for anyone alongside, pull further into the intersection than a car would, and swing wide only as you finish so the trailer's tandem clears the curb. Keeping the rear close to the curb is what stops a car or a bike squeezing up the inside while you turn.",
      holdBreakNote: "Out of the lane or out of the band. Hold your lane to the corner at turning speed, and correct early rather than late.",
      drive: {
        path: [[3.6, -5.3], [-1, -5.3], [-2.5, -5.7], [-3.6, -6.8], [-4, -8.3], [-4, -10.5]],
        speedBand: [4, 14], laneWidth: 1.5, graceSeconds: 1.6, checkWindow: 2.4, sceneRate: 0.2,
        bandLabel: "turning speed, per the posted limit",
        checks: [
          { at: 0, kind: "signal-right", note: "Signal before you move and well before the corner, so the drivers behind know the rig is about to slow and turn." },
          { at: 1, kind: "mirror-right", note: "Right mirror before the turn: anyone alongside on the right is about to be where your trailer is going." },
          { at: 3, kind: "mirror-right", note: "Right mirror in the turn: the tandem is cutting in toward the corner, and this is the only place you can see it." },
          { at: 5, kind: "mirror-left", note: "Left mirror as you straighten: the tractor swung wide, and the lane beside you needs checking before you settle." },
        ],
        controls: { brake: "drc-brake-pedal" },
        laneNote: "You left the lane and stayed out. In a right turn that is either the oncoming lane or the trailer over the curb.",
      },
    },
    {
      id: "drc-route-scan", kind: "find", noHint: true,
      targets: ["drc-cyclist", "drc-double-parked", "drc-low-limb"],
      itemNames: { "drc-cyclist": "the cyclist in the curb lane", "drc-double-parked": "the double-parked van", "drc-low-limb": "the low limb over the curb lane" },
      itemNotes: {
        "drc-cyclist": "A cyclist riding the curb lane, right in the gap a right-turning trailer closes. Anyone on your right at a turn is in the tandem's path.",
        "drc-double-parked": "A delivery van double-parked in the lane ahead. Passing it means leaving your lane — only with a clear left mirror and a signal.",
        "drc-low-limb": "A tree limb hanging lower than a trailer roof over the curb lane. Hugging the curb here takes the trailer's top rail through it.",
      },
      title: "Scan the block ahead",
      cue: "Before the next turn, look well ahead. Find what the rig could hit or trap.",
      why: "Good city drivers look far enough ahead to see trouble before they are in it — a quarter of a mile, or a block and a half, is the handbook's habit — because a loaded rig needs time and room to change anything. The cyclist, the double-parked van and the low limb are all visible a block away and all a problem once the trailer is beside them.",
    },
    {
      id: "drc-swing-point", kind: "gauge", target: "drc-swing-gauge",
      title: "Judge the swing point",
      cue: "Set how far into the intersection the tractor goes before you turn the wheel, then commit.",
      why: "The swing point decides the whole turn. Turn too early and the trailer tandem climbs the corner; pull too far and the tractor ends up in the oncoming lane of the street you are turning into. The handbook's answer is to go further into the intersection than feels natural, then turn sharply, so the trailer follows round the corner instead of over it.",
      gauge: { label: "SWING POINT", speed: 0.75, green: [0.46, 0.66], readout: (t) => (t < 0.46 ? "too early — over the curb" : t > 0.66 ? "too late — oncoming lane" : "clear of the corner"), missNote: "That swing point puts the trailer over the corner or the tractor in oncoming traffic — judge it again before you turn." },
    },
    {
      id: "drc-second-turn", kind: "drive", target: "drc-rig",
      title: "Second right: the tight corner",
      cue: "Left mirror, signal right, pull deep into the intersection, turn, and watch the tandem clear the corner in the right mirror.",
      why: "The tight corner is where the swing point pays off. Checking the left mirror first confirms you are not about to be passed as you slow, the early signal tells the traffic behind what the rig is doing, and pulling deep before turning keeps the tandem off the curb. The right mirror stays busy through the whole turn, because the trailer's rear is where the damage happens.",
      holdBreakNote: "Out of lane or band on the tight corner — slow down before the turn, not in it.",
      drive: {
        path: [[-4, -10.5], [-3.6, -12.1], [-2.5, -13.2], [-1, -13.6], [4.2, -13.6]],
        speedBand: [4, 13], laneWidth: 1.5, graceSeconds: 1.6, checkWindow: 2.2, sceneRate: 0.2,
        bandLabel: "turning speed, per the posted limit",
        checks: [
          { at: 0, kind: "mirror-left", note: "Left mirror before slowing for the turn: nobody should be committing to pass you as you do." },
          { at: 0, kind: "signal-right", note: "Signal on as you set up — early enough that it is information, not an announcement." },
          { at: 2, kind: "mirror-right", note: "Right mirror in the turn: the tandem is closest to the corner right now." },
          { at: 4, kind: "mirror-left", note: "Straightened out — check the lane beside you before you settle into it." },
        ],
        controls: { brake: "drc-brake-pedal" },
      },
    },
    {
      id: "drc-stop-line", kind: "hold", target: "drc-brake-pedal", seconds: 4,
      title: "Full stop at the stop line",
      cue: "Hold the brake at the stop line for a full stop, and look left, right and left again before you go.",
      why: "A full stop at the line, with the rig still for a moment, is what lets you look properly: left, right and left again, and a look at the crosswalk you are about to turn across. A rolling stop in a truck that long means you are already committed before you have seen whether anyone is stepping off the curb.",
      holdBreakNote: "You came off the brake before the look was done. Stop fully, look both ways and the crosswalk, then go.",
    },
    {
      id: "drc-hand-over-hand", kind: "turn", target: "drc-steering",
      title: "Hand over hand for the turn",
      cue: "Turn the wheel hand over hand for the next right, keeping both hands on it.",
      why: "Hand-over-hand steering keeps both hands on the wheel through a turn and gives you the full lock a trailer turn needs at low speed. Palming the wheel with one hand, or letting it spin back through your fingers, is how a driver loses the wheel over a pothole halfway round a corner with a pedestrian at the curb.",
      turn: { turns: 0.75, axis: "z", label: "STEERING" },
    },
    {
      id: "drc-third-turn", kind: "drive", target: "drc-rig",
      title: "Third right: down a gear, crosswalk ahead",
      cue: "Down a gear, signal right, watch the right mirror through the turn, then check left before the crosswalk.",
      why: "The third turn ends at a crosswalk, so the approach is slower: a lower gear before the turn gives you control without riding the brakes, the signal warns traffic, the right mirror shows the tandem clearing the corner, and the last look is at the crosswalk ahead, where a pedestrian who stepped off while you were turning is invisible from a cab until you look for them.",
      holdBreakNote: "Out of lane or band approaching the crosswalk — come down to turning speed before the corner.",
      drive: {
        path: [[4.2, -13.6], [5.7, -13.2], [6.8, -12.1], [7.2, -10.6], [7.2, -9.9]],
        speedBand: [3, 12], laneWidth: 1.5, graceSeconds: 1.6, checkWindow: 1.8, sceneRate: 0.2,
        bandLabel: "turning speed, per the posted limit",
        checks: [
          { at: 0, kind: "gear-down", note: "Down a gear before the turn, not in it — the engine holds the speed and both hands stay for the wheel." },
          { at: 1, kind: "signal-right", note: "Signal right before the corner, so the crosswalk and the traffic behind know where you are going." },
          { at: 2, kind: "mirror-right", note: "Right mirror: the tandem is closing on the corner post." },
          { at: 4, kind: "mirror-left", note: "Left mirror and a look at the crosswalk before you roll up to it." },
        ],
        controls: { brake: "drc-brake-pedal" },
      },
    },
    {
      id: "drc-creep", kind: "track", target: "drc-throttle", seconds: 5,
      title: "Creep past the parked van",
      cue: "Creep at idle past the double-parked van, ready to stop for anyone stepping out from behind it.",
      why: "A vehicle stopped at the curb hides everyone behind it — the driver getting out, the child running for the van, the cyclist coming round. Creeping past at idle means you can stop in a few feet when someone appears, and the pause gives the people who can see your cab the chance to see it before your trailer is beside them.",
      track: { start: 0.1, green: [0.3, 0.52], rise: 0.5, fall: 0.44, drift: 0.12, label: "CREEP", readout: (v) => (v < 0.3 ? "stalled" : v > 0.52 ? "too fast" : "idle creep") },
      holdBreakNote: "Speed out of band past the van — idle creep, or you cannot stop for whoever steps out.",
    },
    {
      id: "drc-chock", kind: "drag", target: "drc-wheel-chock",
      title: "Park and chock at the curb",
      cue: "Set the brakes, get down with three points of contact, and chock the trailer wheel at the curb.",
      why: "Kerbside, a loaded rig stands on a public street for as long as the drop takes, with pedestrians, prams and delivery dollies passing within arm's length of its wheels. Setting the spring brakes, the four-ways, and a wedge against the kerb-side trailer tyre is cheap insurance on a street that looks level and quietly is not, where a rolling trailer has nowhere to go but into people.",
      drag: { to: "drc-chock-socket", radius: 0.45, missNote: "Not snug to the tyre — set the chock tight against the trailer wheel on the curb side." },
    },
    {
      id: "drc-crew-checkin", kind: "select", target: "drc-crew-checkin",
      title: "Debrief with the road trainer",
      cue: "Talk the block through with the trainer: the squeeze on the first turn, the tight corner, and how the traffic felt.",
      why: "The trainer in the jump seat watched things a new driver cannot see from behind the wheel — how big the gap on the inside grew on the first right, how close the tandem came to the market's corner. Two minutes talking it over turns a near miss into a habit instead of a fright, and naming how tense the block felt is honest data too: fatigue and stress are real hazards on a city route.",
    },
    {
      id: "drc-eld", kind: "select", target: "drc-eld-status",
      title: "Change your duty status",
      cue: "Change the electronic log from driving to on duty, not driving, for the delivery.",
      why: "Hours of service under 49 CFR 395 count differently for wheels turning and for work at a kerb: handing freight off is on-duty time that is not driving. The electronic logging device will happily keep recording whatever status was last selected, so switching it as the rig stops keeps the day's driving clock honest — and an officer at a roadside inspection reads exactly that record.",
    },
  ],

  interrupts: [
    {
      id: "drc-car-squeeze",
      kind: "Car on your right",
      after: "drc-first-turn", delay: 3, seconds: 10,
      alert: "A car has pulled up on your right, into the gap between your trailer and the curb, just as you start the turn.",
      cue: "Stop the turn.",
      target: "drc-brake-pedal",
      why: "A car squeezed up the inside of a turning trailer is in the one place the tandem is about to go. Stopping — and letting it clear or back out — is the only answer; there is no amount of swinging wider that keeps a trailer off a car already beside it.",
      missNote: "You kept turning with a car in the gap on your right. The trailer tandem cuts in as it follows the tractor round, and it rolls onto whatever is between it and the curb — this is the squeeze-play crash.",
      wrongNote: "It is the brake. There is a car in the gap your trailer is about to close, and the rig stops until it is gone.",
    },
    {
      id: "drc-pedestrian",
      kind: "Pedestrian in the crosswalk",
      after: "drc-third-turn", delay: 3, seconds: 10,
      alert: "A pedestrian has stepped off the far curb into the crosswalk ahead, head down at their phone, as your tractor comes round the corner.",
      cue: "Stop short of the crosswalk.",
      target: "drc-brake-pedal",
      why: "A pedestrian in a crosswalk has the right of way, and one looking at a phone has not seen the rig. Stopping short of the crosswalk, with room to spare, is the whole job; the horn can wait until you are stopped and it is clear they have not noticed you.",
      missNote: "You drove on toward the crosswalk with a pedestrian in it. A pedestrian close in front of a conventional cab is below the hood line and invisible from the seat — the reason crosswalk crashes with trucks are so often fatal.",
      wrongNote: "It is the brake. Someone is in the crosswalk ahead, and the rig stops before it.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, DRC_ACCENT);

    // ------------------------------------------------------------ ground and the block of streets
    const drcRoadTex = surfaceTexture((cx, w, h) => {
      gradientFill(cx, w, h, [[0, "#3b3e42"], [1, "#35383c"]], { horizontal: true });
      noiseTexture(cx, w, h, { density: 4200, alpha: 0.16, tone: "0,0,0" });
      noiseTexture(cx, w, h, { density: 1800, alpha: 0.1, tone: "210,210,210" });
      cx.fillStyle = "rgba(236,236,228,0.9)"; cx.fillRect(4, 0, 6, h); cx.fillRect(w - 10, 0, 6, h);
      cx.fillStyle = "rgba(242,193,75,0.95)"; cx.fillRect(w / 2 - 9, 0, 5, h); cx.fillRect(w / 2 + 4, 0, 5, h);
    }, { repeat: 1, px: 256 });
    drcRoadTex.repeat?.set?.(1, 4);
    const roadMat = texturedMat(drcRoadTex, { rough: 0.92, metal: 0.02 });
    const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#8f8c86", base2: "#86837d", seam: "rgba(0,0,0,0.35)" }), { repeat: 8, px: 256 });
    const ground = box(g, 26, 0.1, 24, 0.5, -0.05, -5.5, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(walkTex, { rough: 0.95, metal: 0.02, color: 0xb4b0a8 });
    const road = (x, z, w, len, ry) => { const r = box(g, w, 0.04, len, x, 0.02, z, 0xffffff, { rough: 0.9, cast: false }); r.material = roadMat; r.rotation.y = ry; return r; };
    road(1.5, -4.4, 3.6, 21, Math.PI / 2);       // the street past the pad, east–west
    road(-4.9, -9.45, 3.6, 6.5, 0);              // the first cross street, north
    road(1.5, -14.5, 3.6, 16.4, Math.PI / 2);    // the far street, east–west
    road(7.9, -9.45, 3.6, 6.5, 0);               // the last cross street, south
    // Kerbs round the block, and the parking lot in the middle of it.
    for (const [x, z, w, d] of [[1.5, -6.28, 9.2, 0.16], [1.5, -12.62, 9.2, 0.16], [-3.18, -9.45, 0.16, 6.5], [6.18, -9.45, 0.16, 6.5]]) box(g, w, 0.14, d, x, 0.07, z, 0xb9b6ae, { rough: 0.8 });
    box(g, 9.0, 0.03, 6.2, 1.5, 0.015, -9.45, 0x4a4c4f, { rough: 0.95, cast: false });
    const parked = (x, z, tone) => box(g, 0.9, 0.62, 2.2, x, 0.4, z, tone, { rough: 0.4, metal: 0.4 });
    parked(-1, -8.3, 0x8f2d2d); parked(2.2, -8.3, 0xd9dcdf); parked(0.6, -10.6, 0x2d4f8f);
    // A low corner building on the far side of the first cross street, and its sign post.
    const shop = group(g, -8.6, 0, -9.6);
    box(shop, 3.2, 2.2, 5.0, 0, 1.1, 0, 0xa7866a, { rough: 0.85 });
    decal(shop, 2.2, 0.36, 1.61, 1.7, 0, signFace("CORNER MARKET", { bg: "#2d2a26", accent: DRC_CSS, fg: "#f4efe6", scale: 0.5 }), { px: 256 }).rotation.y = Math.PI / 2;
    cyl(g, 0.03, 0.03, 1.6, -3.05, 0.8, -6.45, 0x9aa1a7, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(g, 0.36, 0.36, -3.05, 1.55, -6.43, signFace("STOP", { bg: "#b3261e", fg: "#ffffff", accent: "#ffffff", scale: 0.55 }), { px: 128 });
    // The crosswalk across the last cross street, and its stop line.
    decal(g, 3.4, 0.8, 7.9, 0.046, -6.8, (cx, w, h) => { cx.clearRect(0, 0, w, h); cx.fillStyle = "rgba(238,238,234,0.92)"; for (let i = 0; i < 6; i++) cx.fillRect(w * (0.03 + i * 0.165), 0, w * 0.09, h); }, { px: 256, transparent: true }).rotation.x = -Math.PI / 2;
    box(g, 1.7, 0.012, 0.12, 7.0, 0.045, -7.35, 0xeeeeea, { rough: 0.7, cast: false });
    // Street trees along the near kerb.
    cyl(g, 0.08, 0.1, 1.6, -7.2, 0.8, -2.2, 0x5b4636, { rough: 0.9, seg: 8 });
    cyl(g, 0.02, 0.75, 1.3, -7.2, 2.1, -2.2, 0x3f6b3a, { rough: 0.9, seg: 10 });

    // ------------------------------------------------------------ the rig: the fleet kit's tractor-trailer, articulated
    const rig = flArticulate(tractorTrailer(g, 3.6, 0, -5.3, { ry: -Math.PI / 2, livery: { colour: 0x2f5f9e, fleetName: "SMARTCITI FREIGHT", unitNumber: "T-318" } }));
    rig.scale.setScalar(DRC_SCALE);
    reg2(rig, "drc-rig");

    // The car that squeezes up the inside, waiting behind the rig.
    const squeezeCar = sedan(g, 11.2, 0, -3.5, { ry: -Math.PI / 2, livery: { colour: 0xc9a227 } });
    squeezeCar.scale.setScalar(DRC_SCALE);

    // ------------------------------------------------------------ what the scan finds, on the near street
    const cyclist = group(g, 2.4, 0, -2.95, -Math.PI / 2);
    cyl(cyclist, 0.2, 0.2, 0.03, 0, 0.2, 0.35, 0x1b1e23, { rough: 0.6, seg: 14 }).rotation.z = Math.PI / 2;
    cyl(cyclist, 0.2, 0.2, 0.03, 0, 0.2, -0.35, 0x1b1e23, { rough: 0.6, seg: 14 }).rotation.z = Math.PI / 2;
    box(cyclist, 0.22, 0.62, 0.7, 0, 0.62, 0, 0xf2c14b, { rough: 0.7 });
    reg2(cyclist, "drc-cyclist");
    const van = group(g, -5.3, 0, -3.5, Math.PI / 2);
    box(van, 1.0, 1.1, 2.6, 0, 0.62, 0, 0xeef0f2, { rough: 0.5, metal: 0.2 });
    box(van, 0.25, 0.1, 0.05, 0.3, 0.3, -1.31, 0xffab2e, { emissive: 0xff8a00, ei: 1.2, rough: 0.4 });
    reg2(van, "drc-double-parked");
    const limb = group(g, 4.6, 0, -2.4);
    cyl(limb, 0.1, 0.12, 2.0, 0, 1.0, 0, 0x5b4636, { rough: 0.9, seg: 8 });
    const bough = cyl(limb, 0.04, 0.07, 1.6, 0, 2.05, -0.7, 0x5b4636, { rough: 0.9, seg: 8 });
    bough.rotation.x = 1.25;
    cyl(limb, 0.02, 0.6, 1.0, 0, 2.3, -1.2, 0x3f6b3a, { rough: 0.9, seg: 10 });
    reg2(bough, "drc-low-limb");

    // ------------------------------------------------------------ the unsafe choices
    const redSlab = (x, z, w, d, id, text, tw) => {
      const s = slab(g, w, 0.02, d, x, 0.06, z, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
      holoTag(g, text, x, 0.3, z, { css: "#d2312b", w: tw });
      reg2(s, id);
      return s;
    };
    redSlab(-1.6, -3.5, 1.2, 0.7, "drc-left-swing", "swing left to make the right?", 0.46);
    redSlab(-2.6, -5.9, 0.9, 0.6, "drc-corner-cut", "turn early — cut the corner?", 0.44);
    redSlab(5.4, -3.3, 1.0, 0.6, "drc-red-roll", "roll the right on red?", 0.38);

    // ------------------------------------------------------------ the cab controls, brought to the pad
    const dash = group(g, -1.75, 0, 1.05, 0.5);
    box(dash, 1.1, 0.9, 0.36, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 1.06, 0.34, 0.05, 0, 1.06, 0.06, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const steering = group(dash, -0.12, 1.24, 0.28);
    const rim = cyl(steering, 0.2, 0.2, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.5, seg: 18 });
    rim.rotation.x = 1.1;
    box(steering, 0.36, 0.03, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    reg2(steering, "drc-steering");
    const belt = box(dash, 0.05, 0.3, 0.02, -0.5, 1.15, 0.2, 0x3a3f45, { rough: 0.7 });
    reg2(belt, "drc-seatbelt");
    const mirrorKnob = box(dash, 0.08, 0.05, 0.05, 0.26, 1.12, 0.1, 0x59636d, { rough: 0.5 });
    reg2(mirrorKnob, "drc-mirror-adjust");
    const gauges = decal(dash, 0.32, 0.12, 0.12, 1.1, 0.09, signFace("AIR 120 · OIL OK", { bg: "#0d1c24", accent: DRC_CSS, fg: "#bfeaf7", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    reg2(gauges, "drc-gauges");
    const pedal = box(dash, 0.1, 0.03, 0.16, 0.05, 0.2, 0.3, 0x59636d, { rough: 0.5, metal: 0.5 });
    reg2(pedal, "drc-brake-pedal");
    const throttle = box(dash, 0.08, 0.03, 0.18, 0.22, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(throttle, "drc-throttle");
    const phone = box(dash, 0.07, 0.12, 0.01, 0.46, 1.2, 0.12, 0x1b1e23, { rough: 0.3 });
    holoTag(dash, "phone buzzing — pick up?", 0.46, 1.42, 0.12, { css: "#d2312b", w: 0.4 });
    reg2(phone, "drc-phone");
    const eld = instrument(dash, -0.36, 1.08, 0.09, { idle: "DRIVING", color: DRC_ACCENT, w: 0.16, d: 0.12 });
    reg2(eld, "drc-eld-status");

    // ------------------------------------------------------------ the swing-point gauge, chock and boards
    const swingPost = group(g, 2.4, 0, 1.6, -0.5);
    box(swingPost, 0.06, 1.1, 0.06, 0, 0.55, 0, 0x59636d, { rough: 0.5, metal: 0.5 });
    const swingFace = decal(swingPost, 0.34, 0.2, 0, 1.22, 0.04, signFace("SWING POINT", { bg: "#0a1520", accent: DRC_CSS, fg: "#f4f9fd", scale: 0.4 }), { px: 256, glow: true, ei: 0.8 });
    swingPost.userData.screen = swingFace;
    const swing = swingPost;
    reg2(swingPost, "drc-swing-gauge");
    const chock = box(g, 0.28, 0.2, 0.26, 0.5, 0.1, 2.3, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "wheel chock", 0.5, 0.45, 2.3, { css: DRC_CSS, w: 0.22 });
    reg2(chock, "drc-wheel-chock");
    // The curb-side trailer wheel, brought to the pad as a ghost the chock is set against.
    const ghostWheel = cyl(g, 0.34, 0.34, 0.22, 3.9, 0.36, -2.0, 0x1b1e23, { rough: 0.9, seg: 18, opacity: 0.55 });
    ghostWheel.rotation.z = Math.PI / 2;
    holoTag(g, "trailer wheel, curb side", 3.9, 0.95, -2.0, { css: DRC_CSS, w: 0.38 });
    const chockSocket = box(g, 0.3, 0.2, 0.3, 3.9, 0.1, -1.6, 0xffffff, { rough: 0.5 });
    chockSocket.visible = false; hits["drc-chock-socket"] = chockSocket;
    const card = holoPanel(g, 0.84, 0.54, 1.9, 1.5, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#0a1520"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = DRC_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e3f2fd"; ctx.fillText("ROUTE — THREE RIGHTS", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#f4f9fd";
      ["1  Right at the corner market (tight)", "2  Right at the far street", "3  Right, crosswalk at the end", "Truck route: stay on it", "Speed: per the posted limit", "Park at the curb, chock, log"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.6, accent: DRC_ACCENT });
    reg2(card, "drc-route-card");
    const checkin = holoPanel(g, 0.46, 0.3, -0.4, 1.75, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("TRAINER DEBRIEF", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Squeeze · tight corner · how it felt", w / 2, h * 0.66);
    }, { ry: 0.3, accent: 0x4fd1ff });
    reg2(checkin, "drc-crew-checkin");
    standingFigure(g, -2.7, -0.6, { ry: 1.2, cloth: 0x2b3a4a, vest: 0xd8e24a });
    const walker = standingFigure(g, 10.2, -6.6, { ry: -Math.PI / 2, cloth: 0x6a3f7a, atStation: true });

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.0, -5.5),
      onStepComplete(step) {
        if (step.id === "drc-swing-point") repaint(swing.userData.screen, signFace("SET", { bg: "#0a1520", accent: "#59c97b", fg: "#f4f9fd", scale: 0.55 }));
        if (step.id === "drc-route-scan") { van.position.set(-8.2, 0, -3.5); cyclist.position.set(-7.6, 0, -2.95); }
        if (step.id === "drc-chock") { chock.position.set(3.9, 0.1, -1.6); }
        if (step.id === "drc-eld") repaint(eld.userData.screen, signFace("ON DUTY", { bg: "#0a1520", accent: "#59c97b", fg: "#f4f9fd", scale: 0.45 }));
      },
      // The car really pulls into the gap on the right; the pedestrian really
      // steps out into the crosswalk in front of the cab.
      onInterrupt(it) {
        if (it.id === "drc-car-squeeze") { squeezeCar.position.set(-2.2, 0, -6.0); squeezeCar.rotation.y = -Math.PI * 0.72; }
        if (it.id === "drc-pedestrian") { walker.position.set(7.6, 0, -6.8); walker.rotation.y = -Math.PI / 2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drc-car-squeeze") { squeezeCar.position.set(-5.8, 0, -11.8); squeezeCar.rotation.y = Math.PI; }
        if (it.id === "drc-pedestrian") { walker.position.set(5.7, 0, -6.8); pedal.material = mat(0x59c97b, { rough: 0.5 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "drc-swing-point") {
          const ok = gg.t >= 0.46 && gg.t <= 0.66;
          repaint(swing.userData.screen, signFace(ok ? "CLEAR" : gg.t < 0.46 ? "EARLY" : "LATE", { bg: "#0a1520", accent: ok ? "#59c97b" : "#f2ae14", fg: "#f4f9fd", scale: 0.5 }));
        }
        if (session?.turn && step?.id === "drc-hand-over-hand") steering.rotation.z = session.turn.amount * Math.PI * 2;
        if (session?.drive) steering.rotation.z = -session.drive.steer * 0.9;
        void t; void dt;
      },
    };
  },
};
