import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — layups and finishing at the rim.
// The layup line looks like the easiest drill on the practice plan and is
// actually one of the more collision-prone: several young players driving
// toward the same six square feet of floor at speed, all watching the rim
// instead of each other. What is taught here is the footwork that makes a
// layup repeatable — gather, plant, drive, soft touch — and the approach
// control and spacing that keep a line of players finishing at the rim from
// turning into a pile-up under it.
//
// Sited generically in the gym-court district; the team and players are
// invented. No research finding or statistic is asserted, and no rule
// number or court dimension is quoted as a rule.

const BBL_ACCENT = 0x4fe0a0;
const BBL_CSS = "#4fe0a0";

export const SIM_BB_LAYUPS_AND_FINISHING_AT_THE_RIM = {
  id: "bb-layups-and-finishing-at-the-rim",
  index: "349",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on teaching finishing footwork with both hands rather than only a player's dominant side; NFHS basketball rules on legal footwork at the rim and its sportsmanship expectations for a crowded finishing line; CDC Heads Up for a knock to the head taken in contact under the rim; the U.S. Center for SafeSport for calm, observable correction of a footwork fault rather than a fault called out in front of the line; the American Red Cross first aid course for a player down after a hard finish",
  name: "Layups and Finishing at the Rim",
  title: simTitle("Layups and Finishing at the Rim"),
  tagline: "The easiest drill on the practice plan is also the most collision-prone: gather, plant, drive, soft touch, and a controlled approach that keeps the line under the rim from becoming a pile-up",
  accent: BBL_ACCENT,
  accentCss: BBL_CSS,
  parSeconds: 325,
  footprint: 2.6,
  badge: { id: "soft-touch-clean-line", name: "Soft Touch, Clean Line", note: "A finishing line run with clean footwork, a controlled approach and nobody colliding under the rim" },

  supportLine: "your league's coach coordinator, or the assistant and athletic trainer who were running the finishing line with you — a collision under the rim is worth talking through afterwards too",

  game: system({
    name: "Finishing Line Board",
    currency: "SOFT-TOUCH POINTS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Finishing Mentor"],
    badges: [
      { id: "clear-lane-first", name: "Clear Lane First", note: "Every hazard under the rim found before the first rep", test: AWARD.stepClean("scan-the-lane-before-layup-drills") },
      { id: "no-collision", name: "No Collision", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "controlled-approach", name: "Controlled Approach", note: "Approach speed and release touch both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-line", name: "Unbroken Line", note: "Held a balanced landing through the whole hold", test: AWARD.unbroken },
      { id: "quick-finish", name: "Quick Finish", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "run-layup-lines-on-a-still-wet-patch": "You started the finishing line before a wet patch under the rim had actually dried. A player driving hard toward the rim, eyes on the ball and the defender rather than the floor, is exactly who plants a foot on a slick spot at full speed, and the landing zone under the basket is the worst place on the whole court for a slip to happen.",
    "let-two-lines-collide-under-the-rim": "You ran two finishing lines from opposite sides of the key without staggering them, and two players arrived under the rim at the same moment from different directions. NFHS sportsmanship expectations assume a drill is actually organised to keep players from colliding, and a crowded landing zone with players approaching blind to each other is a collision waiting on the very next rep.",
    "played-on-after-a-hard-knee-to-the-head-under-the-rim": "You let a player keep running the line after taking a hard knee to the head in traffic under the rim because they said they were fine. CDC Heads Up is clear that a knock to the head gets a player out of play and evaluated regardless of how they feel in the moment — a finishing line is not worth risking a second hit on a player who has not been checked.",
    "double-the-rep-count-with-no-water-break": "You doubled the number of finishing reps with no water break and called it conditioning. Loading on unplanned extra volume with no rest is exactly the kind of overuse and dehydration risk youth guidelines warn against, and it teaches a player that good footwork gets rewarded with more work instead of with rest.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the finishing session once the line has run and the reps have held — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-lane-before-layup-drills", kind: "find", noHint: true,
      targets: ["ball-rack-in-the-landing-zone", "wet-spot-under-the-rim", "player-standing-under-the-net"],
      itemNames: {
        "ball-rack-in-the-landing-zone": "a ball rack sitting in the landing zone",
        "wet-spot-under-the-rim": "a wet spot still drying under the rim",
        "player-standing-under-the-net": "a player standing directly under the net",
      },
      itemNotes: {
        "ball-rack-in-the-landing-zone": "A rack sitting where players land after a finish is exactly what a knee or an ankle catches on the way down. Move it clear of the landing zone first.",
        "wet-spot-under-the-rim": "A wet patch in the one spot every finishing line lands on is the worst place on the court for it. Dry it before the first rep, not after someone slips.",
        "player-standing-under-the-net": "Someone standing in the landing zone waiting their turn is directly in the path of the next finish. Move them back to the line before anyone drives.",
      },
      decoyNotes: {
        "line-spaced-correctly": "A line already spaced with room between each player is exactly what the drill wants. Look for what is actually in the way.",
      },
      title: "Scan the lane before the finishing line starts",
      cue: "Look at the landing zone and the line. Mark what has to be moved before the first rep goes up.",
      why: "The landing zone under the rim is where every finish in this drill ends up, which makes it the one spot on the floor that has to be completely clear before the first rep: a rack left there, a wet patch not yet dry, and a player standing where the next finish lands are all the same kind of problem read in the same glance.",
    },
    {
      id: "hold-the-ready-stance-before-the-first-rep", kind: "hold", target: "ready-stance-marker", seconds: 5,
      title: "Hold a ready stance before the first rep",
      cue: "Balanced, knees bent, eyes up at the rim — hold here before the first player goes, no rushing the start.",
      why: "A finishing line that starts with the first player already off-balance sets the tempo for every rep that follows it. Holding a genuinely ready stance before the first rep — balanced, eyes up — is what makes the footwork that follows something the player actually controls instead of something they are recovering into mid-approach.",
      holdBreakNote: "The first rep started before the stance was actually ready. Hold it a moment longer and start balanced.",
    },
    {
      id: "post-the-finishing-menu", kind: "select", target: "finishing-menu-card",
      title: "Post today's finishing menu",
      cue: "Put up which finishes are being drilled: right-hand layup, left-hand layup, and off the glass.",
      why: "A posted menu tells every player in the line exactly what today's rep is, which keeps the line moving with a purpose instead of everyone just shooting whatever feels easiest. Naming both hands on the menu, not only a player's dominant side, is what USA Basketball's youth guidelines mean by teaching a complete player rather than a comfortable one.",
    },
    {
      id: "build-the-layup-footwork-in-order", kind: "sequence",
      targets: ["layup-gather", "layup-inside-foot", "layup-outside-knee", "layup-soft-touch"],
      itemNames: {
        "layup-gather": "gather the ball",
        "layup-inside-foot": "plant the inside foot",
        "layup-outside-knee": "drive the outside knee up",
        "layup-soft-touch": "finish with a soft touch",
      },
      title: "Build the layup footwork in order",
      cue: "Gather the ball first, then plant the inside foot, then drive the outside knee up, then finish with a soft touch.",
      why: "Each part of the footwork sets up the next: the gather has to happen before the plant so the step is not rushed, the inside foot has to plant before the outside knee drives up or the jump has no base under it, and a soft touch only comes from a body that is still under control after all three — rushed footwork almost always shows up first as a hard, off-balance finish.",
      outOfOrderNote: "Out of order. The gather comes first — planting the inside foot before the ball is gathered is a travel waiting to be called, and driving the knee up before the plant just means jumping off the wrong foot.",
    },
    {
      id: "turn-to-the-approach-side", kind: "turn", target: "approach-angle-dial",
      title: "Turn the approach board to today's side",
      cue: "Turn the angle dial to set which side of the rim the line is approaching from.",
      turn: { turns: 0.5, axis: "y", label: "APPROACH SIDE" },
      why: "Approaching from the same side every time only ever builds one version of the footwork. Turning the dial to change the approach side on purpose is what makes a player's inside foot and outside knee work correctly whichever way the defense actually forces them to go in a real game.",
    },
    {
      id: "track-the-approach-speed", kind: "track", target: "approach-speed-meter", seconds: 8,
      title: "Track the approach speed all the way to the rim",
      cue: "Keep the approach speed in band the whole way in — not so slow the footwork has no rhythm, not so fast it is out of control under the rim.",
      track: {
        start: 0.3, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "APPROACH SPEED",
        readout: (v) => (v < 0.4 ? "too slow — no rhythm to the steps" : v > 0.62 ? "too fast — out of control at the rim" : "controlled, all the way in"),
      },
      why: "A layup approach that is too slow never builds the rhythm the footwork actually needs, and one that is too fast arrives at the rim with a body that cannot control its own landing — which is exactly how a controlled drill turns into a collision in the crowded space under the basket. Holding the approach in band the whole way in is what keeps speed working for the player instead of against everyone near the rim.",
      holdBreakNote: "The approach speed left the band — too slow, or too fast for the traffic under the rim. Reset and come in again under control.",
    },
    {
      id: "gauge-the-release-touch", kind: "gauge", target: "release-touch-gauge",
      title: "Read the release touch before committing to the shot",
      cue: "Commit when the touch reads soft — not a flat, hard finish, not a shot released so high it clangs off the back of the rim.",
      gauge: {
        label: "TOUCH", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "flat — too hard off the glass" : t <= 0.6 ? "soft — good touch" : "over-arced — clanging long"),
        missNote: "Outside the band. A flat release comes off too hard to finish cleanly; an over-arced one clangs off the back iron. Find soft and commit.",
      },
      why: "A layup finished with a hard, flat release rattles off the rim as often as it goes in, and one released with too much arc misses long off the back iron just as often. Reading the touch before releasing, rather than shooting on reflex, is what turns a rushed finish into the soft, repeatable one the whole drill is built to teach.",
    },
    {
      id: "spot-the-finishing-faults", kind: "find", noHint: true,
      targets: ["fault-traveling-gather", "fault-charging-a-defender", "fault-no-eyes-up"],
      itemNames: {
        "fault-traveling-gather": "a gather that starts a step early — a travel",
        "fault-charging-a-defender": "a finish that charges straight into a defender",
        "fault-no-eyes-up": "a player finishing with no eyes up for help defense",
      },
      itemNotes: {
        "fault-traveling-gather": "A gather taken a step too early is a travel every time it is called correctly. Reset the count before the next rep.",
        "fault-charging-a-defender": "Lowering a shoulder into a defender instead of finishing around them is a charge and a collision both — this needs a footwork fix, not just a foul call.",
        "fault-no-eyes-up": "A player finishing with their eyes locked on the rim the whole way in never sees the help defender rotating over. That habit gets fixed here, not in a game.",
      },
      decoyNotes: {
        "fault-soft-touch-finish": "A finish with a genuinely soft touch is exactly the form this drill wants. Look for what actually needs correcting.",
      },
      title: "Spot the finishing faults in the line",
      cue: "Watch each rep for what breaks down before the ball leaves the hand. Mark what needs a correction.",
      why: "Most layup faults show up in the two steps before the shot, not in the shot itself: a gather taken too early, a shoulder lowered into a defender instead of finished around them, and eyes locked on the rim instead of scanning for help are all patterns worth catching in the line, before any of them turns into a bad habit that shows up in a real game.",
    },
    {
      id: "rack-the-loose-balls-between-reps", kind: "drag",
      title: "Rack the loose balls before the next rep",
      cue: "Carry the stray ball from the landing zone back to the ball rack.",
      target: "stray-ball-token",
      drag: { to: "ball-rack-socket", radius: 0.45, missNote: "Not on the rack. A ball left anywhere in the landing zone is a ball the next player in line can plant a foot on mid-approach — carry it all the way to the rack." },
      why: "A finishing line only stays safe if the landing zone is actually clear before the next player drives, and that means racking stray balls as part of the drill's rhythm, not as an afterthought once someone has already rolled an ankle on one.",
    },
    {
      id: "correct-a-fault-with-a-quiet-word", kind: "select", target: "quiet-word-spot",
      title: "Correct a footwork fault with a quiet word",
      cue: "Step to the side with the player whose footwork needs fixing — a short, calm correction, not called out to the whole line.",
      why: "A footwork correction given quietly, one to one, is heard as coaching; the same correction shouted down the line becomes a public moment for a player who was already trying their best. Calm, private and observable correction is the standard safe-sport guidance sets for adults working with young athletes.",
    },
    {
      id: "hold-a-balanced-landing", kind: "hold", target: "landing-marker", seconds: 5,
      title: "Hold a balanced landing after the finish",
      cue: "Land soft, knees bent, and hold there a moment before jogging back to the line — no rushing straight to the next rep.",
      why: "A player who lands hard and immediately sprints back to the end of the line never actually practises the part of the footwork that protects their knees and ankles on landing. Holding a balanced landing for a moment, every rep, is what makes soft, controlled landings a habit instead of something only checked once and then forgotten.",
      holdBreakNote: "The landing got rushed before it was actually balanced. Hold it a moment longer before moving on.",
    },
    {
      id: "rotate-players-through-both-hands", kind: "turn", target: "both-hands-dial",
      title: "Turn the rotation dial to the off hand",
      cue: "Turn the hands dial from strong hand to off hand so every player finishes both ways before the line ends.",
      turn: { turns: 0.5, axis: "y", label: "OFF HAND" },
      why: "A player who only ever finishes with their dominant hand is a player a defense can force to one side and take the shot away from entirely. Turning the rotation deliberately to the off hand, every line, is what USA Basketball's youth guidelines mean by building a complete finisher rather than a comfortable one.",
    },
    {
      id: "log-the-layup-session", kind: "select", target: "practice-log-board",
      title: "Log the layup session",
      cue: "Record which faults came up, how the approach speed held, and anything the athletic trainer checked.",
      why: "Which footwork faults kept showing up, how the approach speed held under the track and anything the athletic trainer noticed are what the next finishing session needs to build on — a log written at the time is the fairest record for coaching the same fix again next practice.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the end of the line: anything either of you saw, and is everybody good to move to the next drill?",
      why: "Running a finishing line and watching for both footwork and collisions takes real attention from the adults running it too. A short check-in — what did you see, is anyone worth watching a little closer — keeps the staff working as a team and is exactly the kind of noticing the guide's check-in points to.",
    },
  ],

  interrupts: [
    {
      id: "two-players-collide-under-the-rim",
      kind: "Player down",
      after: "track-the-approach-speed", delay: 3, seconds: 12,
      alert: "Two players from opposite sides of the line arrive under the rim at the same moment and collide hard, and one of them stays down.",
      cue: "Radio the athletic trainer to the landing zone immediately and hold the rest of the line where it is.",
      target: "athletic-trainer-radio-spot",
      why: "A collision under the rim needs the athletic trainer's eyes on the player who stayed down before anyone decides how serious it is, and holding the rest of the line prevents a second collision on top of the first while the trainer is still getting there. The radio call happens immediately, not after finishing the rep that was already in progress.",
      missNote: "The line kept running for another rep before anyone called the trainer over, and the player who was down had already tried to get up and walk it off on their own.",
      wrongNote: "That does not get the trainer to the landing zone. Radio the athletic trainer immediately and hold the line.",
    },
    {
      id: "fire-alarm-during-the-finishing-line",
      kind: "Fire alarm",
      after: "hold-a-balanced-landing", delay: 3, seconds: 12,
      alert: "The fire alarm sounds mid-line, with a ball still bouncing loose under the rim and players scattered between the line and the landing zone.",
      cue: "Ball down, everybody out through the marked fire exit, headcount outside against the day's list.",
      target: "fire-exit-door",
      why: "The finishing line's rhythm is not a reason to squeeze in one more rep before leaving. The ball goes down where it is, the gym empties through the marked exit with an adult at the front and back, and a headcount happens outside — every alarm treated as real, every time, no matter what rep was mid-approach when it sounded.",
      missNote: "One more player finished their rep before the line moved, and outside the headcount came up short before someone remembered they had stayed behind to watch the ball go in.",
      wrongNote: "The alarm comes first. Ball down and everybody to the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBL_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBL_ACCENT, { emissive: o.color ?? BBL_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBL_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0a2418", accent: o.accent ?? BBL_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBL_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(6,26,18,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBL_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eafff2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c8f0da";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBL_ACCENT, { rough: 0.5, emissive: o.accent ?? BBL_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.11) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the lane and hoop
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#0e2c1e", base2: "#0a2418", seam: "rgba(2,10,6,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 1.8, 0.02, 2.4, 0, 0.012, -1.6, 0x0e2c1e, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xc0ecd8 });
    const hoop = group(g, 0, 0, -3.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });

    // ------------------------------------------------------------ landing-zone hazards
    const ballRack = group(g, 0.3, 0, -1.85);
    box(ballRack, 0.5, 0.5, 0.3, 0, 0.25, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (const bx of [-0.15, 0.15]) basketball(ballRack, bx, 0.55, 0, 0.08);
    bead(0.3, 0.7, -1.85, "ball-rack-in-the-landing-zone", "Ball rack in the landing zone", { w: 0.46 });
    const wetSpot = cyl(g, 0.3, 0.3, 0.004, -0.4, 0.006, -2.0, 0x6fb8ff, { rough: 0.2, opacity: 0.5, seg: 20, cast: false });
    bead(-0.4, 0.11, -2.0, "wet-spot-under-the-rim", "Wet spot under the rim", { color: 0x6fb8ff, css: "#6fb8ff", w: 0.44, r: 0.03 });
    const waitingPlayer = standingFigure(g, 0.15, -2.3, { ry: 0.2, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    bead(0.15, 2.0, -2.3, "player-standing-under-the-net", "Standing under the net", { w: 0.46 });
    bead(1.6, 0.6, -0.1, "line-spaced-correctly", "Line spaced correctly", { w: 0.44, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ ready stance, menu, footwork ladder
    stand(1.3, -0.1, 0, 1.0);
    bead(1.3, 1.15, -0.1, "ready-stance-marker", "Ready stance", { w: 0.36 });
    card(-2.4, 1.4, -2.9, "finishing-menu-card", "Today's finishing menu", "RIGHT · LEFT ·\nOFF THE GLASS", { w: 0.42, cw: 0.42 });
    const routine = group(g, -2.3, 0, -2.1, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["layup-gather", "1 · Gather the ball", 0.56], ["layup-inside-foot", "2 · Plant inside foot", 0.82],
      ["layup-outside-knee", "3 · Drive the knee up", 1.08], ["layup-soft-touch", "4 · Soft-touch finish", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBL_ACCENT, { emissive: BBL_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBL_CSS, w: 0.42 });
      reg(hits, b, lid);
    }
    const dial = group(g, -1.6, 0, 0.55);
    cyl(dial, 0.16, 0.16, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const dialArrow = box(dial, 0.03, 0.02, 0.13, 0, 0.92, 0.08, BBL_ACCENT, { emissive: BBL_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(dial, "Approach angle dial", 0, 1.12, 0, { css: BBL_CSS, w: 0.4 });
    reg(hits, dial.children[0], "approach-angle-dial");

    // ------------------------------------------------------------ approach track, release gauge
    const tStand = stand(1.75, 0.85, -0.3);
    const approachSpeed = instrument(tStand, 0, 1.02, 0, { idle: "SPEED", color: BBL_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Approach speed", 0, 1.22, 0, { css: BBL_CSS, w: 0.34 });
    reg(hits, approachSpeed, "approach-speed-meter");
    const gStand = stand(1.5, -1.5, 0);
    const touch = instrument(gStand, 0, 1.02, 0, { idle: "TOUCH", color: BBL_ACCENT, w: 0.2, d: 0.26 });
    holoTag(gStand, "Release touch", 0, 1.22, 0, { css: BBL_CSS, w: 0.32 });
    reg(hits, touch, "release-touch-gauge");

    // ------------------------------------------------------------ fault watch, rack drag
    bead(-0.8, 0.55, 1.1, "fault-traveling-gather", "Traveling gather", { w: 0.4, r: 0.024 });
    bead(0.85, 0.6, 1.25, "fault-charging-a-defender", "Charging a defender", { w: 0.42, r: 0.024 });
    bead(0.1, 0.9, 1.85, "fault-no-eyes-up", "No eyes up for help", { w: 0.4, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "fault-soft-touch-finish", "Soft-touch finish", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const strayBall = basketball(g, -2.9, 0.11, 0.9);
    bead(-2.9, 0.4, 0.9, "stray-ball-token", "Stray ball", { w: 0.32 });
    const rackTwo = group(g, -3.3, 0, -1.4);
    box(rackTwo, 0.5, 0.5, 0.3, 0, 0.25, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    holoTag(rackTwo, "Ball rack", 0, 0.6, 0, { css: BBL_CSS, w: 0.26 });
    const rackSocket = box(rackTwo, 0.3, 0.02, 0.2, 0, 0.5, 0, BBL_ACCENT, { emissive: BBL_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, rackSocket, "ball-rack-socket");
    bead(2.35, 0.75, 1.0, "quiet-word-spot", "Quiet word on footwork", { color: 0xf2c14b, css: "#f2c14b", w: 0.42 });

    // ------------------------------------------------------------ landing hold, both hands
    stand(0.75, -1.95, 0, 0.9);
    bead(0.75, 1.05, -1.95, "landing-marker", "Balanced landing", { w: 0.38 });
    const handsDial = group(g, 2.1, 0, -1.5, -0.5);
    cyl(handsDial, 0.15, 0.15, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const handsDialArrow = box(handsDial, 0.03, 0.02, 0.12, 0, 0.92, 0.07, BBL_ACCENT, { emissive: BBL_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(handsDial, "Both-hands rotation dial", 0, 1.12, 0, { css: BBL_CSS, w: 0.44 });
    reg(hits, handsDial.children[0], "both-hands-dial");

    // ------------------------------------------------------------ boards, exit, guide
    const log = board(0.6, 0.36, 1.5, 1.72, -3.1, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Faults · approach speed", "Trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.2, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    bead(3.0, 1.5, 1.8, "athletic-trainer-radio-spot", "Radio the trainer", { color: 0xf2c14b, css: "#f2c14b", w: 0.4 });
    const exit = group(g, -3.45, 0, 1.3, Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");
    const guide = board(0.6, 0.3, 0.4, 2.05, -3.1, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Soft touch. Clean line."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.12, x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.14;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.85, 1.25, 0.35, "run-layup-lines-on-a-still-wet-patch", "Start on the wet patch?", "IT'S ALMOST\nDRY", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "let-two-lines-collide-under-the-rim", "Run both lines together?", "BOTH SIDES\nAT ONCE", 0.1);
    hazardCard(0.6, 1.25, 1.2, "played-on-after-a-hard-knee-to-the-head-under-the-rim", "Said they're fine — play on?", "SHAKE IT OFF,\nKEEP GOING", -0.1);
    hazardCard(1.9, 1.25, 0.35, "double-the-rep-count-with-no-water-break", "Double the reps, no water?", "MORE REPS.\nNO BREAK", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 1.65, 1.55, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 1.65, 2.1, 1.55, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void assistant; void dialArrow; void waitingPlayer; void wetSpot; void strayBall;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "scan-the-lane-before-layup-drills") { ballRack.position.set(-3.3, 0, -1.4); waitingPlayer.position.set(0.15, 0, -2.7); }
        if (step.id === "turn-to-the-approach-side") dialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "rotate-players-through-both-hands") handsDialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "rack-the-loose-balls-between-reps") strayBall.position.set(-3.3, 0.32, -1.4);
        if (step.id === "log-the-layup-session") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Footwork clean, approach controlled", "Landing zone checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "two-players-collide-under-the-rim") {
          waitingPlayer.position.set(-0.2, 0, -2.0);
          waitingPlayer.rotation.y = 0.9;
        }
        if (it.id === "fire-alarm-during-the-finishing-line") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "two-players-collide-under-the-rim") {
          trainer.position.set(-1.0, 0, -1.8); trainer.rotation.y = 1.6;
          paintGuide("That was the right call — the trainer got there fast and the rest of the line stayed clear.");
        }
        if (it.id === "fire-alarm-during-the-finishing-line") { exitLeaf.rotation.y = 1.2; exitLeaf.position.x = -0.35; }
      },

      animate(t, dt, session) {
        void dt;
        const tr = session?.track;
        if (tr && session.step?.id === "track-the-approach-speed") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(approachSpeed.userData.screen, signFace(ok ? "CONTROLLED" : tr.v < 0.4 ? "TOO SLOW" : "TOO FAST", { bg: "#0a2418", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafff2", scale: 0.4 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "gauge-the-release-touch") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(touch.userData.screen, signFace(ok ? "SOFT" : gg.t < 0.42 ? "FLAT" : "OVER-ARCED", { bg: "#0a2418", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafff2", scale: 0.4 }));
        }
      },
    };
  },
};
