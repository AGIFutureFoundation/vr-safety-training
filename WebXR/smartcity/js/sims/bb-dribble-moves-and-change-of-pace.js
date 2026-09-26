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

// SmartCiti.X~ Basketball Fundamentals VR — dribble moves and change of
// pace. A crossover or a hesitation only ever beats a defender because of
// what happens around it: a believable slow stretch that makes the sudden
// burst actually sudden. What is taught here builds on the pound dribble and
// handling series from the ball-handling station with a live, defender-read
// application — read the defender's balance, sell the hesitation, change
// pace sharply, and stay low and in control through the whole move instead
// of just fast.
//
// Sited generically in the gym-court district; the team and players are
// invented. No research finding or statistic is asserted, and no rule
// number or court dimension is quoted as a rule.

const BBE_ACCENT = 0xd88aff;
const BBE_CSS = "#d88aff";

export const SIM_BB_DRIBBLE_MOVES_AND_CHANGE_OF_PACE = {
  id: "bb-dribble-moves-and-change-of-pace",
  index: "350",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on live, defender-read ball-handling built on top of a player's basic dribble rather than skipped straight to game speed; NFHS basketball rules on legal dribbling and carrying, and its sportsmanship expectations for live moves run near a teammate; CDC Heads Up for a knock to the head taken in a collision between two live-move lines; the U.S. Center for SafeSport for calm, observable correction of a move that breaks down rather than a fault called out in front of the group; the American Red Cross first aid course for a rolled ankle on a hard change of pace",
  name: "Dribble Moves and Change of Pace",
  title: simTitle("Dribble Moves and Change of Pace"),
  tagline: "A crossover only beats a defender because of what happens around it — a believable slow stretch that makes the sudden burst actually sudden, run low and under control the whole way through",
  accent: BBE_ACCENT,
  accentCss: BBE_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: { id: "sell-it-then-burst", name: "Sell It, Then Burst", note: "A change of pace sharp enough to create separation, run low and under control from the hesitation to the burst" },

  supportLine: "your league's coach coordinator, or the assistant and athletic trainer who were running the live-move lines with you — a rolled ankle on a hard change of pace is worth talking through afterwards too",

  game: system({
    name: "Change-of-Pace Board",
    currency: "SEPARATION POINTS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Handles Mentor"],
    badges: [
      { id: "clear-lane-first", name: "Clear Lane First", note: "Every hazard in the lane found before live moves start", test: AWARD.stepClean("scan-the-lane-before-dribble-moves") },
      { id: "no-collision", name: "No Collision", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "controlled-burst", name: "Controlled Burst", note: "Change of pace and dribble height both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-series", name: "Unbroken Series", note: "Held dribble height in band through the whole series", test: AWARD.unbroken },
      { id: "quick-session", name: "Quick Session", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "run-live-moves-around-a-loose-ball": "You let players run live crossover moves through the lane with a loose ball still rolling underfoot. A change of pace already asks a player's feet to move fast and low without watching the floor, and a stray ball in that same space is exactly what a plant foot lands on wrong at the worst possible moment.",
    "let-two-live-move-lines-cross-paths": "You ran two lines of live dribble moves through the same stretch of floor without staggering them, so two players burst into the same space at the same time. NFHS sportsmanship expectations assume a drill is actually organised to keep players apart, and a defender-read move by its nature has a player looking at a defender, not at who else is coming through the same lane.",
    "push-through-a-rolled-ankle-to-finish-the-set": "You had a player finish the rest of the set after rolling an ankle on a hard change of pace because they said it barely hurt. An ankle that just rolled once is far more likely to roll again on the very next cut, and the American Red Cross first aid course is clear that it gets checked and rested before any more live moves, not played through to finish a rep count.",
    "add-extra-conditioning-sprints-as-a-fault-punishment": "You added extra conditioning sprints as punishment every time a player's crossover got picked or carried. Loading on unplanned sprint volume as a consequence for a skill fault is exactly the kind of overuse youth guidelines warn against, and it teaches a player that a mistake in a skill drill gets answered with fatigue instead of a fix.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the dribble session once the live series has run and the moves have held — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-lane-before-dribble-moves", kind: "find", noHint: true,
      targets: ["loose-ball-mid-lane", "cone-out-of-place", "defender-too-close-for-a-live-read"],
      itemNames: {
        "loose-ball-mid-lane": "a loose ball sitting in the middle of the lane",
        "cone-out-of-place": "a cone knocked out of its spacing line",
        "defender-too-close-for-a-live-read": "a defender starting too close for a live, safe read",
      },
      itemNotes: {
        "loose-ball-mid-lane": "A stray ball in the same space a live move is about to happen in is exactly what a fast, low plant foot lands on wrong. Rack it before the first rep.",
        "cone-out-of-place": "A cone out of its spacing line changes where a player expects the lane to be mid-move. Reset it before anyone reads a defender against it.",
        "defender-too-close-for-a-live-read": "A defender set up too close turns a controlled read into a collision the moment the burst happens. Reset the spacing before going live.",
      },
      decoyNotes: {
        "cones-set-correctly": "Cones already spaced correctly are exactly what the drill needs. Look for what is actually out of place.",
      },
      title: "Scan the lane before live dribble moves start",
      cue: "Look at the lane, the cones and the defender's starting spot. Mark what has to be fixed before anyone goes live.",
      why: "A live-move drill puts a player's eyes on a defender instead of the floor, which makes the floor itself the coach's job to check: a loose ball underfoot, a cone that has drifted out of its spacing line, and a defender starting too close for a controlled read are all the same kind of problem — caught now, before the first live rep, instead of during one.",
    },
    {
      id: "post-the-move-menu", kind: "select", target: "move-menu-card",
      title: "Post today's move menu",
      cue: "Put up the combo being drilled: hesitation into a crossover, in-and-out into a burst.",
      why: "A posted menu tells every player exactly which combo this rep is building toward, which is what turns a live-move line into deliberate practice instead of players improvising whatever move feels comfortable. Naming the combo also tells the defender what to actually give a realistic look at.",
    },
    {
      id: "build-the-crossover-move-in-order", kind: "sequence",
      targets: ["move-read-the-defender", "move-hesitate", "move-crossover", "move-burst"],
      itemNames: {
        "move-read-the-defender": "read the defender's balance",
        "move-hesitate": "hesitate to freeze them",
        "move-crossover": "crossover low and quick",
        "move-burst": "burst past on the change of pace",
      },
      title: "Build the crossover move in order",
      cue: "Read the defender first, then hesitate, then crossover low and quick, then burst past on the change of pace.",
      why: "Each part of the move sets up the next: reading the defender's balance is what tells a player which side is actually open, the hesitation only freezes a defender who is watching for it, the crossover has to stay low and quick to protect the ball through the switch, and the burst only creates separation because everything before it looked unhurried by comparison.",
      outOfOrderNote: "Out of order. Reading the defender comes first — a hesitation aimed at nothing in particular does not freeze anyone, and bursting before the crossover has actually happened is just running in a straight line.",
    },
    {
      id: "gauge-the-change-of-pace", kind: "gauge", target: "pace-gauge",
      title: "Read the change of pace before committing to the burst",
      cue: "Commit when the change reads sharp — not so smooth the defender stays with you, not so early it loses control of the ball.",
      gauge: {
        label: "PACE CHANGE", speed: 0.6, green: [0.44, 0.62],
        readout: (t) => (t < 0.44 ? "too smooth — defender stays with you" : t <= 0.62 ? "sharp — real separation" : "too early — losing control of the ball"),
        missNote: "Outside the band. Too smooth a change never actually surprises the defender; committing to the burst too early costs control of the ball before the separation is even won. Find sharp and commit.",
      },
      why: "A change of pace only works as a surprise, which means a gradual speed-up that a defender can match step for step is not really a change at all, and a burst started before the hesitation has actually sold itself just means losing the ball while still trying to accelerate. Reading the moment honestly is what turns a change of pace into real separation instead of a fast dribble that goes nowhere.",
    },
    {
      id: "turn-to-the-live-defender-side", kind: "turn", target: "defender-side-dial",
      title: "Turn the board to the side the defender is overplaying",
      cue: "Turn the side dial to whichever side the defender's set foot is actually overplaying today.",
      turn: { turns: 0.5, axis: "y", label: "ATTACK SIDE" },
      why: "A move drilled toward the same side every single rep only ever teaches a player to read one kind of defender. Turning the dial to change which side is being attacked is what makes the read — not just the move itself — something a player has actually practised against a realistic defensive look.",
    },
    {
      id: "hold-a-low-stance-through-the-move", kind: "hold", target: "low-stance-marker", seconds: 5,
      title: "Hold a low stance all the way through the move",
      cue: "Stay low through the hesitation and the crossover — hold here and check it, no standing up early.",
      why: "A player who stands up out of their stance partway through a crossover both loses the ball to a reaching defender more easily and gives away the move before the burst even starts. Holding a genuinely low stance through the whole sequence is what keeps the ball protected and the defender guessing until the change of pace actually happens.",
      holdBreakNote: "The stance came up before the move finished. Hold it low all the way through the crossover.",
    },
    {
      id: "track-the-dribble-height-through-the-series", kind: "track", target: "dribble-height-meter", seconds: 8,
      title: "Track the dribble height through the live series",
      cue: "Keep the dribble height in band through the whole series — not so high it gets picked, not so low control breaks down.",
      track: {
        start: 0.32, green: [0.4, 0.6], rise: 0.48, fall: 0.4, drift: 0.14, label: "DRIBBLE HEIGHT",
        readout: (v) => (v < 0.4 ? "too low — control breaking down" : v > 0.6 ? "too high — an easy steal" : "low and controlled through the series"),
      },
      why: "A dribble that climbs too high through a long series is an easy target for a defender's hands, and one pushed too low to compensate starts to break down a player's actual control of the ball. Holding the height in band through the whole series, not just the first rep, is what makes a low, controlled handle something a player can actually rely on deep into a live drill.",
      holdBreakNote: "Dribble height left the band — too high, or too low to control. Bring it back to steady before the next move.",
    },
    {
      id: "drag-the-pace-to-the-burst-zone", kind: "drag",
      title: "Drag the pace marker from cruise to burst",
      cue: "Drag the pace marker from the 'cruise' side of the board to the 'burst' zone, right as the change of pace happens.",
      target: "pace-token",
      drag: { to: "burst-zone", radius: 0.45, missNote: "Still on the 'cruise' side. A change of pace that never actually moves off cruise is no change at all — drag the marker all the way into the burst zone." },
      why: "Feeling a change of pace and actually committing to it are two different things under a defender's pressure, and a physical marker moved from cruise to burst gives that commitment something concrete to point at. A player who understands the idea but never actually changes gears has not learned the move — they have only learned to talk about it.",
    },
    {
      id: "spot-the-move-faults", kind: "find", noHint: true,
      targets: ["fault-carrying-the-ball", "fault-dribbling-too-upright", "fault-not-selling-the-hesitation"],
      itemNames: {
        "fault-carrying-the-ball": "a crossover with the hand coming up under the ball",
        "fault-dribbling-too-upright": "a player dribbling the whole move too upright",
        "fault-not-selling-the-hesitation": "a hesitation that does not actually sell — the defender never bites",
      },
      itemNotes: {
        "fault-carrying-the-ball": "A hand sliding up under the ball on the crossover is a carry every time it is called correctly. Reset the hand position before the next rep.",
        "fault-dribbling-too-upright": "Dribbling the whole move upright puts the ball far from the body and easy for a defender to reach. That needs a lower stance, not just a faster crossover.",
        "fault-not-selling-the-hesitation": "A hesitation the defender never reacts to has not actually sold anything — it is just a pause. That needs real weight shift and eye contact, not just a beat of stillness.",
      },
      decoyNotes: {
        "fault-low-tight-handle": "A low, tight handle through the whole move is exactly the form this drill wants. Look for what actually needs correcting.",
      },
      title: "Spot the move faults in the line",
      cue: "Watch each rep for what breaks down in the move, not just whether the defender got beat. Mark what needs a correction.",
      why: "A move can beat a defender on pure speed and still be full of faults that catch up with a player in a real game: a hand sliding into a carry, a stance too upright to protect the ball, and a hesitation that never actually looks believable are all worth catching here, in a controlled line, before a game referee or a better defender catches them instead.",
    },
    {
      id: "correct-a-fault-with-a-quiet-word", kind: "select", target: "quiet-word-spot",
      title: "Correct a move fault with a quiet word",
      cue: "Pull the player whose move needs work off to the side for a low-key word, rather than flagging the fault in front of the whole line.",
      why: "A move that is still developing draws enough self-consciousness from a young player without a fault being narrated out loud for the whole line to hear. Taking it aside, briefly and calmly, keeps the correction about the footwork itself rather than turning into a moment the player has to recover from socially as well as technically.",
    },
    {
      id: "hold-a-controlled-stop-after-the-burst", kind: "hold", target: "controlled-stop-marker", seconds: 5,
      title: "Hold a controlled stop after the burst",
      cue: "Come under control and hold a balanced stop after the burst — no sprinting straight into the next player's space.",
      why: "A burst that ends with a player still at full speed, uncontrolled, is one step from colliding with whoever or whatever is next in the lane. Holding a genuinely controlled stop after every burst is what keeps the change of pace a basketball move rather than a sprint that happens to end near a hoop.",
      holdBreakNote: "The stop was still moving fast when the hold ended. Come under control and hold a balanced stop before moving on.",
    },
    {
      id: "turn-the-reps-to-the-weak-hand", kind: "turn", target: "hand-rotation-dial",
      title: "Turn the reps over to the weak hand",
      cue: "Turn the hand-rotation dial from strong hand to weak hand so every player runs the move both ways.",
      turn: { turns: 0.5, axis: "y", label: "WEAK HAND" },
      why: "A crossover that only ever starts from a player's strong hand is a move a defense learns to anticipate by the second time down the floor. Turning the reps over to the weak hand, deliberately and on a schedule rather than only when it comes up, is what makes the whole combo something a player can actually use whichever way a defender forces them.",
    },
    {
      id: "log-the-dribble-session", kind: "select", target: "practice-log-board",
      title: "Log the dribble session",
      cue: "Write down the faults that kept recurring, how well the pace change and dribble height actually held under live pressure, and whatever the athletic trainer flagged.",
      why: "The next ball-handling session builds on whichever faults kept recurring under live pressure and on anything the athletic trainer noticed about the ankle roll, and neither of those is reliable from memory a day later. Getting it into the log while the series is still fresh is what makes next week's correction target the actual pattern instead of a guess at it.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "Before moving to the next drill: compare notes on anything either of you noticed, and confirm everybody is genuinely ready to continue.",
      why: "Two sets of eyes on a live-move line rarely see exactly the same thing — one adult reading the footwork, the other watching for the collision risk in the spacing — so comparing notes catches what either one alone would have missed. It is the same kind of deliberate noticing the guide's check-in is built around.",
    },
  ],

  interrupts: [
    {
      id: "player-rolls-an-ankle-on-a-hard-change-of-pace",
      kind: "Player down",
      after: "track-the-dribble-height-through-the-series", delay: 3, seconds: 12,
      alert: "A player plants hard on a change of pace, rolls an ankle, and goes down holding it right in the middle of the live line.",
      cue: "Get on the radio to the athletic trainer right away, and freeze the rest of the line exactly where it stands.",
      target: "athletic-trainer-radio-spot",
      why: "Nobody on the bench can tell from a distance whether an ankle that rolled hard is a bruise or something that needs an X-ray, which is exactly the judgement the athletic trainer is there to make. Freezing the rest of the live-move line the instant it happens keeps a second player from bursting through the same stretch of floor while attention is on the player who is down.",
      missNote: "The next player in line had already started their move before anyone reached for the radio, and the player on the ground had tried standing up on the ankle alone by the time the trainer actually arrived.",
      wrongNote: "That does not get help to the player on the floor. Call the athletic trainer over the radio and freeze the line.",
    },
    {
      id: "fire-alarm-during-dribble-moves",
      kind: "Fire alarm",
      after: "hold-a-controlled-stop-after-the-burst", delay: 3, seconds: 12,
      alert: "The fire alarm sounds mid-line, with a ball still live in a player's hands and the group scattered across the lane.",
      cue: "Drop the ball where it is and clear everyone out the marked fire exit, then count heads outside against today's list.",
      target: "fire-exit-door",
      why: "A player mid-crossover has no way of knowing on their own whether an alarm is real, so the whole gym moves the same way every time it sounds: the ball stays on the floor, the group leaves together through the marked exit with an adult front and back, and the headcount outside is what actually confirms everyone made it out.",
      missNote: "The player finished the move they were mid-burst on before joining everyone else, and outside the headcount came up one short until somebody remembered they had stayed to land it first.",
      wrongNote: "The alarm outranks the drill. Drop the ball and clear out through the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBE_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBE_ACCENT, { emissive: o.color ?? BBE_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBE_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c0c2a", accent: o.accent ?? BBE_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBE_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(20,8,30,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBE_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f8eaff";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e0c8f0";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBE_ACCENT, { rough: 0.5, emissive: o.accent ?? BBE_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.11) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the lane
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#1e0e2c", base2: "#180a24", seam: "rgba(8,2,14,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 2.0, 0.02, 2.4, 0, 0.012, -1.0, 0x1e0e2c, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xdcc8ec });
    const cones = [];
    for (const [cx0, cz0] of [[-1.3, -1.6], [1.3, -1.6], [-1.3, -0.4], [1.3, -0.4]]) {
      const cone = cyl(g, 0.09, 0.02, 0.26, cx0, 0.13, cz0, 0xff6a1a, { rough: 0.6, seg: 12 });
      cones.push(cone);
    }
    // ------------------------------------------------------------ lane hazards
    const strayBall = basketball(g, 0.1, 0.11, -1.0);
    bead(0.1, 0.4, -1.0, "loose-ball-mid-lane", "Loose ball in the lane", { w: 0.36 });
    const movedCone = cones[2];
    movedCone.position.set(-1.9, 0.13, 0.3);
    bead(-1.9, 0.4, 0.3, "cone-out-of-place", "Cone out of place", { w: 0.34, color: 0xf2c14b, css: "#f2c14b" });
    const closeDefender = standingFigure(g, -0.2, -1.75, { ry: 1.6, cloth: 0x3a3f46, trousers: 0x1a1e23, atStation: true });
    bead(-0.2, 2.0, -1.75, "defender-too-close-for-a-live-read", "Defender too close", { w: 0.42 });
    bead(1.7, 0.6, 0.6, "cones-set-correctly", "Cones set correctly", { w: 0.42, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ move menu, sequence ladder
    card(-2.4, 1.4, -2.9, "move-menu-card", "Today's move menu", "HESITATION →\nCROSSOVER → BURST", { w: 0.44, cw: 0.44 });
    const routine = group(g, -2.3, 0, -2.1, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["move-read-the-defender", "1 · Read the defender", 0.56], ["move-hesitate", "2 · Hesitate to freeze", 0.82],
      ["move-crossover", "3 · Crossover low", 1.08], ["move-burst", "4 · Burst on the change", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBE_ACCENT, { emissive: BBE_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBE_CSS, w: 0.42 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ pace gauge, side dial
    const pStand = stand(1.75, 0.8, -0.3);
    const paceGauge = instrument(pStand, 0, 1.02, 0, { idle: "PACE?", color: BBE_ACCENT, w: 0.2, d: 0.26 });
    holoTag(pStand, "Change of pace", 0, 1.22, 0, { css: BBE_CSS, w: 0.36 });
    reg(hits, paceGauge, "pace-gauge");
    const sideDial = group(g, -1.6, 0, 0.55);
    cyl(sideDial, 0.16, 0.16, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const sideDialArrow = box(sideDial, 0.03, 0.02, 0.13, 0, 0.92, 0.08, BBE_ACCENT, { emissive: BBE_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(sideDial, "Live defender side", 0, 1.12, 0, { css: BBE_CSS, w: 0.38 });
    reg(hits, sideDial.children[0], "defender-side-dial");

    // ------------------------------------------------------------ stance hold, height track
    stand(1.2, -0.1, 0, 1.0);
    bead(1.2, 1.15, -0.1, "low-stance-marker", "Low stance through the move", { w: 0.46 });
    const hStand = stand(-1.75, 0.9, 0.3);
    const height = instrument(hStand, 0, 1.02, 0, { idle: "HEIGHT", color: BBE_ACCENT, w: 0.2, d: 0.26 });
    holoTag(hStand, "Dribble height", 0, 1.22, 0, { css: BBE_CSS, w: 0.32 });
    reg(hits, height, "dribble-height-meter");

    // ------------------------------------------------------------ pace drag board
    const paceBoard = group(g, -3.1, 0, 0.75, 1.1);
    for (const sx of [-0.32, 0.32]) cyl(paceBoard, 0.018, 0.018, 1.4, sx, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(paceBoard, 0.74, 0.46, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a2430"; cx.font = `700 ${Math.round(h * 0.12)}px Arial`; cx.textAlign = "center";
      cx.fillText("CRUISE", w * 0.27, h * 0.16); cx.fillText("BURST", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const paceToken = cyl(paceBoard, 0.05, 0.05, 0.02, -0.2, 1.16, 0.03, 0xd8641e, { rough: 0.5, seg: 14 });
    paceToken.rotation.x = Math.PI / 2;
    holoTag(paceBoard, "Pace marker", -0.2, 1.5, 0.03, { css: BBE_CSS, w: 0.3 });
    reg(hits, paceToken, "pace-token");
    const burstZone = box(paceBoard, 0.16, 0.16, 0.01, 0.2, 1.16, 0.02, BBE_ACCENT, { emissive: BBE_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, burstZone, "burst-zone");

    // ------------------------------------------------------------ fault watch, controlled stop, weak hand
    bead(-0.75, 0.55, 1.1, "fault-carrying-the-ball", "Hand under the ball — carry", { w: 0.46, r: 0.024 });
    bead(0.9, 0.6, 1.25, "fault-dribbling-too-upright", "Dribbling too upright", { w: 0.42, r: 0.024 });
    bead(0.1, 0.9, 1.85, "fault-not-selling-the-hesitation", "Hesitation not selling", { w: 0.44, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "fault-low-tight-handle", "Low, tight handle", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    bead(2.35, 0.75, 1.0, "quiet-word-spot", "Quiet word on a move fault", { color: 0xf2c14b, css: "#f2c14b", w: 0.46 });
    stand(0.75, -1.95, 0, 0.9);
    bead(0.75, 1.05, -1.95, "controlled-stop-marker", "Controlled stop after the burst", { w: 0.48 });
    const handsDial = group(g, 2.1, 0, -1.5, -0.5);
    cyl(handsDial, 0.15, 0.15, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const handsDialArrow = box(handsDial, 0.03, 0.02, 0.12, 0, 0.92, 0.07, BBE_ACCENT, { emissive: BBE_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(handsDial, "Weak-hand rotation dial", 0, 1.12, 0, { css: BBE_CSS, w: 0.42 });
    reg(hits, handsDial.children[0], "hand-rotation-dial");

    // ------------------------------------------------------------ boards, exit, guide
    const log = board(0.6, 0.36, 1.5, 1.72, -3.1, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Faults · pace and height", "Trainer notes"]));
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
    const guide = board(0.6, 0.3, 0.4, 2.05, -3.1, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Sell it slow. Burst sharp."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
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
    hazardCard(-1.85, 1.25, 0.35, "run-live-moves-around-a-loose-ball", "Play on around the ball?", "IT'S FINE\nWHERE IT IS", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "let-two-live-move-lines-cross-paths", "Run both lines together?", "BOTH LINES\nAT ONCE", 0.1);
    hazardCard(0.6, 1.25, 1.2, "push-through-a-rolled-ankle-to-finish-the-set", "Finish the set on it?", "BARELY\nHURTS, GO", -0.1);
    hazardCard(1.9, 1.25, 0.35, "add-extra-conditioning-sprints-as-a-fault-punishment", "Sprints for the fault?", "CARRY IT?\nRUN SPRINTS", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 1.65, 1.55, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 1.65, 2.1, 1.55, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void assistant; void closeDefender; void sideDialArrow; void handsDialArrow; void cones;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, -1.1),

      onStepComplete(step) {
        if (step.id === "scan-the-lane-before-dribble-moves") { strayBall.visible = false; movedCone.position.set(-1.3, 0.13, -0.4); closeDefender.position.set(-0.2, 0, -2.3); }
        if (step.id === "turn-to-the-live-defender-side") sideDialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "drag-the-pace-to-the-burst-zone") paceToken.position.set(0.2, 1.16, 0.02);
        if (step.id === "turn-the-reps-to-the-weak-hand") handsDialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "log-the-dribble-session") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Moves clean, pace controlled", "Ankle checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "player-rolls-an-ankle-on-a-hard-change-of-pace") {
          closeDefender.position.set(0.3, 0, -1.0);
          closeDefender.rotation.y = 0.5;
        }
        if (it.id === "fire-alarm-during-dribble-moves") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "player-rolls-an-ankle-on-a-hard-change-of-pace") {
          trainer.position.set(0.6, 0, -0.7); trainer.rotation.y = -1.6;
          paintGuide("That was the right call — the trainer got there fast and the rest of the line stayed clear.");
        }
        if (it.id === "fire-alarm-during-dribble-moves") { exitLeaf.rotation.y = 1.2; exitLeaf.position.x = -0.35; }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "gauge-the-change-of-pace") {
          const ok = gg.t >= 0.44 && gg.t <= 0.62;
          repaint(paceGauge.userData.screen, signFace(ok ? "SHARP" : gg.t < 0.44 ? "SMOOTH" : "EARLY", { bg: "#1c0c2a", accent: ok ? "#59c97b" : "#f0645b", fg: "#f8eaff", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "track-the-dribble-height-through-the-series") {
          const ok = tr.v >= 0.4 && tr.v <= 0.6;
          repaint(height.userData.screen, signFace(ok ? "LOW · CONTROLLED" : tr.v < 0.4 ? "TOO LOW" : "TOO HIGH", { bg: "#1c0c2a", accent: ok ? "#59c97b" : "#f0645b", fg: "#f8eaff", scale: 0.34 }));
        }
      },
    };
  },
};
