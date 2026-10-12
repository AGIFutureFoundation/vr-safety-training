import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station six: the free throw
// routine. The line and the lane checked, the lane rules explained, a towel
// at the line, the same routine every time (feet, dribbles, breath, eyes,
// shot, hold), the shooting foot aligned, the routine's tempo kept steady,
// the habits that break it spotted, composure held when legs are tired, water
// between rounds, and shooters rotated so everyone rests.
//
// Sited generically in the gym-court district; the team, the players and the
// parent are invented. No rule number or time limit is quoted.

const BBT_ACCENT = 0xe0c34a;
const BBT_CSS = "#e0c34a";

export const SIM_BB_FREE_THROW_ROUTINE = {
  id: "bb-free-throw-routine",
  index: "336",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on building routines, managing fatigue and rest between efforts; NFHS basketball rules on free-throw lane positions and when lane players may move; CDC Heads Up for the knocks a crowded lane can bring; the U.S. Center for SafeSport for parents kept welcome but outside the drill and every conversation in view; the American Red Cross first aid course for heat and dehydration signs",
  name: "Free Throw Routine",
  title: simTitle("Free Throw Routine"),
  tagline: "The line and lane checked, the lane rules explained, the same routine every time, the shooting foot lined up, a steady tempo, composure held on tired legs, water between rounds and shooters rotated to rest",
  accent: BBT_ACCENT,
  accentCss: BBT_CSS,
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "same-every-time", name: "Same Every Time", note: "One routine, held the same way through fatigue and pressure, with water, rest and a clear lane" },

  supportLine: "your league's coach coordinator, or the assistant who met the parent with you — a hard conversation at the door is worth talking through afterwards",

  game: system({
    name: "Line Routine",
    currency: "SWISHES",
    ranks: ["Rebound Helper", "Line Coach", "Assistant Coach", "Head Coach", "Routine Mentor"],
    badges: [
      { id: "clean-line", name: "Clean Line", note: "Everything wrong at the line found first time", test: AWARD.stepClean("check-the-line") },
      { id: "calm-lane", name: "Calm Lane", note: "No unsafe action in the whole free-throw block", test: AWARD.safe },
      { id: "steady-routine", name: "Steady Routine", note: "Routine tempo and composure both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-routine", name: "Clean Routine", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "unshaken", name: "Unshaken", note: "Held composure in band the whole time", test: AWARD.unbroken },
      { id: "brisk-routine", name: "Brisk Routine", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-water-between-rounds": "You ran free-throw rounds back to back with the conditioning and no water between. Free throws look like rest, so nobody drinks, but the players on the line are the same ones who just ran; their fluid loss keeps climbing and the first sign is a dizzy shooter at the line.",
    "sprints-for-every-miss": "You made every miss cost the whole team a sprint. Conditioning used as punishment piles unplanned load on tired legs, teaches players to fear the line rather than own a routine, and is exactly the kind of extra volume youth guidelines warn turns into overuse injuries.",
    "lane-players-crash-early": "You let the lane players charge in the moment the shooter started the routine. Players crashing the lane before the release collide with each other and with the shooter's follow-through — shoulders and heads meeting at speed in the narrowest part of the court.",
    "shoot-from-damp-line": "You let the next shooter step up onto the damp line without wiping it. Sweat drips at the line from every shooter before, and a shooter who rises slightly on the release and lands on a wet patch has nowhere to put their foot but sideways.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the free-throw block once it has run and the shooters rotated — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "check-the-line", kind: "find", noHint: true,
      targets: ["ft-sweat-at-line", "ft-ball-in-lane", "ft-chair-under-basket"],
      itemNames: {
        "ft-sweat-at-line": "sweat drips on the free-throw line",
        "ft-ball-in-lane": "a ball rolled into the lane",
        "ft-chair-under-basket": "a folding chair left under the basket",
      },
      itemNotes: {
        "ft-sweat-at-line": "Every shooter drips at the line. Towel it now, and keep the towel there for the whole block.",
        "ft-ball-in-lane": "A ball in the lane is under a lane player's feet the moment they move. Rack it.",
        "ft-chair-under-basket": "A chair under the basket is where a rebound and a landing both end. Fold it and take it to the wall.",
      },
      decoyNotes: {
        "ft-lane-block": "The painted lane block is part of the court. Look for what does not belong on the floor.",
      },
      title: "Check the line and the lane before the first shot",
      cue: "Look along the free-throw line and down the lane. Mark everything that should not be there.",
      why: "A free-throw drill puts one player standing still on a line every shooter before them has dripped on, and a lane full of players about to move at once. A wet line, a ball in the lane and a chair under the basket are the three things that turn that set-up into a slip or a rolled ankle, and all three take seconds to fix before the first shot.",
    },
    {
      id: "explain-lane-rules", kind: "select", target: "lane-rules-card",
      title: "Explain the lane rules before anyone lines up",
      cue: "Lane players stay in their spaces until the ball leaves the shooter's hand; the shooter stays behind the line until the ball hits the rim.",
      why: "The lane rules exist as much for safety as for fairness. When lane players wait for the release and the shooter stays behind the line, nobody is moving into the same space at the same moment. Explaining it the way NFHS basketball rules frame it, before the first round, means the drill practises the habit games require instead of the scramble players invent without it.",
    },
    {
      id: "towel-at-the-line", kind: "drag", target: "line-towel",
      title: "Put a towel at the line for the whole block",
      cue: "Carry the towel from the bench to the hook beside the line.",
      drag: { to: "towel-socket", radius: 0.45, missNote: "Not at the line. A towel back at the bench is a towel nobody walks back for — hang it beside the line." },
      why: "A towel beside the line lets every shooter dry their hands and wipe the line between rounds without anyone leaving the drill. It is the small fix that keeps the ball from slipping out of sweaty fingers and keeps the floor where the shooter lands dry, all block long.",
    },
    {
      id: "build-the-routine", kind: "sequence",
      targets: ["routine-feet", "routine-dribbles", "routine-breath", "routine-eyes", "routine-shoot"],
      itemNames: {
        "routine-feet": "feet set on the same spot",
        "routine-dribbles": "the same number of dribbles",
        "routine-breath": "one slow breath",
        "routine-eyes": "eyes to the front of the rim",
        "routine-shoot": "shoot and hold the follow-through",
      },
      title: "Build one routine, the same every time",
      cue: "Feet on the spot, the same dribbles, one slow breath, eyes on the rim, then shoot and hold.",
      why: "A free throw is the one shot in basketball taken with no defender and all the time in the world, which is exactly why nerves find it. A routine done identically every time — feet, dribbles, breath, eyes, shot — gives a young player something to do instead of worrying, and the order matters because each part settles the body for the next.",
      outOfOrderNote: "Out of order. Feet first so the base is set, then the rhythm of the dribbles, then the breath — eyes and shot come last, once the body is still.",
    },
    {
      id: "calm-breath", kind: "hold", target: "breath-marker", seconds: 7,
      title: "Hold the line quiet for the breath",
      cue: "Keep the gym quiet at the line while the shooter takes their breath — hold it and watch the lane.",
      why: "The breath is the part of the routine that turns a nervous body into a steady one, and it only works if the shooter gets a genuinely quiet moment. Holding the gym quiet and the lane still for that breath teaches everyone watching that the line belongs to the shooter, and gives the coach a moment to see whether anyone in the lane is itching to move early.",
      holdBreakNote: "The noise came back before the breath was done. Quiet the gym and let the shooter take it again.",
    },
    {
      id: "align-the-feet", kind: "turn", target: "foot-alignment-disc",
      title: "Line up the shooting foot with the rim",
      cue: "Turn the shooting foot a touch so it points at the rim, with the same foot forward every time.",
      turn: { turns: 0.25, axis: "y", label: "FOOT ANGLE" },
      why: "Where the shooting foot points is where the hip, shoulder and elbow tend to follow. A foot lined up with the rim, set on the same spot every time, makes the rest of the shot repeatable; a foot that wanders means every free throw is a slightly different shot. It is also the base that keeps the shooter balanced on a slick patch of line.",
    },
    {
      id: "routine-tempo", kind: "gauge", target: "routine-clock",
      title: "Keep the routine's tempo steady",
      cue: "Commit when the routine reads steady — not rushed, not stalled.",
      gauge: {
        label: "TEMPO", speed: 0.62, green: [0.4, 0.58],
        readout: (t) => (t < 0.4 ? "rushed — skipping steps" : t <= 0.58 ? "steady" : "stalling — overthinking"),
        missNote: "Outside the band. Rushed routines skip the breath; stalled ones give the nerves time. Find steady and commit.",
      },
      why: "A routine that speeds up under pressure drops its calming parts first, and one that slows down leaves the shooter alone with their nerves; both end in a different shot from the one practised. Keeping the tempo steady — and well inside the time officials allow at the line — is what makes the routine the same in the last minute of a close game as in an empty gym.",
    },
    {
      id: "spot-the-breakers", kind: "find", noHint: true,
      targets: ["fault-rushing", "fault-changing-dribbles", "fault-looking-at-bench"],
      itemNames: {
        "fault-rushing": "a shooter rushing the shot after a miss",
        "fault-changing-dribbles": "a shooter changing the number of dribbles",
        "fault-looking-at-bench": "a shooter looking over at the bench mid-routine",
      },
      itemNotes: {
        "fault-rushing": "After a miss, the next shot gets rushed to make it go away. Cue 'same routine, same speed'.",
        "fault-changing-dribbles": "Two dribbles, then four, then one — the routine has gone. Cue them back to their own number.",
        "fault-looking-at-bench": "Eyes on the bench mean the mind is on the bench. Cue 'eyes to the rim' and keep the sideline quiet.",
      },
      decoyNotes: {
        "fault-deep-breath": "The deep breath is part of the routine. Leave it be and look for what breaks it.",
      },
      title: "Spot the habits that break the routine",
      cue: "Watch each shooter's routine. Mark every habit that is breaking it.",
      why: "Routines break in predictable ways: speed after a miss, a changing dribble count, eyes drifting to the bench. Each is a sign the shooter's attention has left the line. Naming the one habit each player is fighting — calmly, and without making them feel watched from the sideline — keeps the routine theirs rather than a performance for the adults.",
    },
    {
      id: "composure-on-tired-legs", kind: "track", target: "composure-meter", seconds: 8,
      title: "Hold composure at the line on tired legs",
      cue: "After the running block, keep the shooters' composure in band — breath back to steady before every shot.",
      track: {
        start: 0.28, green: [0.4, 0.62], rise: 0.55, fall: 0.44, drift: 0.14, label: "COMPOSURE",
        readout: (v) => (v < 0.4 ? "flat — switched off" : v > 0.62 ? "racing — still out of breath" : "steady at the line"),
      },
      why: "Game free throws come after running, so the routine has to hold when legs are tired and breathing is fast. Holding composure in band — breath slowed, routine intact — is the skill; letting shooters step up still gasping, or so drained they have switched off, practises the miss. It is also the moment a coach sees who is more tired, or more overheated, than they are saying.",
      holdBreakNote: "Composure slipped — shooters stepping up still gasping, or switched right off. Slow the breath and reset the routine.",
    },
    {
      id: "water-between-rounds", kind: "select", target: "water-round-card",
      title: "Put water between every round",
      cue: "Every shooter drinks between rounds — the rounds follow running, so the water does too.",
      why: "Free-throw rounds are where a practice slows down, and slowing down is the right moment to drink. A rule that every round ends with water means the players who have just been running recover before they shoot again, and it catches the thirst young players do not notice until they are already behind.",
    },
    {
      id: "pressure-rounds", kind: "sequence", anyOrder: true,
      targets: ["pressure-one-shot", "pressure-team-watching", "pressure-after-a-run"],
      itemNames: {
        "pressure-one-shot": "one shot only, make or miss",
        "pressure-team-watching": "the whole team watching quietly",
        "pressure-after-a-run": "a shot after a short run, with water first",
      },
      title: "Add pressure rounds once the routine holds",
      cue: "One-shot rounds, the whole team watching, and a round after a short run — water before it.",
      why: "Pressure is added to a free-throw routine the same way load is added to any skill: once it holds without it. One-shot rounds, an audience of teammates and a round after a short run each rehearse part of what a game feels like, and none of them needs punishment attached to a miss to do it.",
    },
    {
      id: "rotate-the-shooters", kind: "drag", target: "next-shooter-token",
      title: "Rotate the shooters so everyone rests",
      cue: "Move the next shooter's token onto the line and the last shooter's to the rest bench.",
      drag: { to: "line-socket", radius: 0.45, missNote: "Not on the line. Rotate properly — next shooter onto the line, last shooter to the rest bench." },
      why: "Rotating shooters gives every player the same number of attempts and a real rest between them, instead of the best shooter staying at the line while others stand. It keeps the lane moving in an orderly way, and it spreads the work so nobody's legs or focus are carrying more than the rest.",
    },
    {
      id: "log-the-free-throws", kind: "select", target: "practice-log-board",
      title: "Log the free-throw block",
      cue: "Record each shooter's routine cue, makes out of attempts, water times and the conversation at the door.",
      why: "A shooter's routine cue and makes out of attempts are what let the next practice build on this one; water times show the block was run safely; the parent conversation at the door belongs in writing with who handled it. A log written at the time protects the players, the coach and the programme alike.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: how the door conversation went, anything the trainer saw after the running, and is everybody good to go on?",
      why: "The assistant handled the parent, the athletic trainer watched the players come off the running block, and the head coach ran the line. A quick check-in agrees what, if anything, needs to go back to the family, flags any player who looked overheated, and keeps the staff acting as one team in view of each other.",
    },
  ],

  interrupts: [
    {
      id: "fire-alarm-at-the-line",
      kind: "Fire alarm",
      after: "calm-breath", delay: 3, seconds: 12,
      alert: "The fire alarm cuts through the quiet at the line and the exit strobe starts flashing.",
      cue: "Everyone out through the marked fire exit now — no finishing the shot — and a headcount outside.",
      target: "fire-exit-door",
      why: "The quiet of a free-throw drill makes an alarm feel like an interruption to finish politely. It is not: the ball goes down, the lane empties, and everyone walks out through the marked exit with the adults at the front and back, then a headcount outside against the day's list. Every alarm is treated as real, every time.",
      missNote: "The shooter took the shot and the lane waited to see if it went in before anyone moved. The group left late and in a bunch, and outside nobody was sure the rebounder who went for the ball had come out at all.",
      wrongNote: "Not now — the alarm comes first. Everyone to the marked fire exit.",
    },
    {
      id: "parent-wants-a-word",
      kind: "Parent at the door",
      after: "composure-on-tired-legs", delay: 3, seconds: 12,
      alert: "A parent has walked onto the baseline by the door, upset, asking loudly why their child is not getting more shots, and wants to talk to the head coach right now.",
      cue: "Send the assistant to greet them at the door and set a time to talk after practice — the head coach stays with the drill.",
      target: "door-greeting-spot",
      why: "A parent with a concern deserves a real conversation, just not in the middle of a drill with their child on the line and the whole team listening. The assistant greeting them at the door, calmly, and fixing a time to talk after practice keeps the head coach supervising, keeps the parent heard, and keeps every adult conversation in the open, as SafeSport policies expect.",
      missNote: "The head coach walked off to argue with the parent on the baseline while the drill carried on unsupervised. Players were left running the lane with no adult watching, and the child at the centre of it heard every word.",
      wrongNote: "That leaves the parent standing on the baseline. The assistant goes to greet them at the door.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBT_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBT_ACCENT, { emissive: o.color ?? BBT_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBT_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#211c08", accent: o.accent ?? BBT_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBT_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(28,24,6,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBT_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdf8e4";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#efe4b8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBT_ACCENT, { rough: 0.5, emissive: o.accent ?? BBT_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.11, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the lane
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#5a4a18", base2: "#524314", seam: "rgba(20,16,4,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 1.6, 0.02, 2.2, 0, 0.012, -1.6, 0x5a4a18, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xe8dcb8 });
    const ftLine = box(g, 1.6, 0.006, 0.05, 0, 0.025, -0.5, 0xf6f4ee, { rough: 0.6, cast: false });
    void ftLine;
    for (const sx of [-1, 1]) {
      box(g, 0.05, 0.006, 2.2, sx * 0.8, 0.025, -1.6, 0xf6f4ee, { rough: 0.6, cast: false });
      for (const z of [-1.2, -1.8]) box(g, 0.2, 0.006, 0.05, sx * 0.9, 0.025, z, 0xf6f4ee, { rough: 0.6, cast: false });
    }
    const block = box(g, 0.2, 0.008, 0.12, 0.9, 0.028, -2.35, 0x7a1f2b, { rough: 0.6, cast: false });
    holoTag(g, "Lane block", 0.9, 0.2, -2.35, { css: "#7fc4d8", w: 0.22 });
    reg(hits, block, "ft-lane-block");
    const drips = cyl(g, 0.18, 0.18, 0.004, -0.2, 0.026, -0.45, 0x9fd0f0, { rough: 0.05, opacity: 0.5, seg: 16, cast: false });
    bead(-0.2, 0.4, -0.45, "ft-sweat-at-line", "Sweat on the line", { w: 0.32 });
    const laneBall = basketball(g, 0.3, 0.11, -1.4);
    bead(0.3, 0.45, -1.4, "ft-ball-in-lane", "Ball in the lane", { w: 0.3 });
    const chair = group(g, -0.45, 0, -2.55, 0.3);
    box(chair, 0.4, 0.04, 0.38, 0, 0.45, 0, 0x5a6068, { rough: 0.6, metal: 0.3 });
    box(chair, 0.4, 0.4, 0.03, 0, 0.66, -0.18, 0x5a6068, { rough: 0.6, metal: 0.3 });
    for (const sx of [-0.18, 0.18]) box(chair, 0.03, 0.45, 0.34, sx, 0.22, 0, 0x2b2f35, { rough: 0.5, metal: 0.5 });
    bead(-0.45, 1.0, -2.55, "ft-chair-under-basket", "Chair under the basket", { w: 0.4 });

    // ------------------------------------------------------------ the hoop at the end of the lane
    const hoop = group(g, 0, 0, -3.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hoop, 1.04, 0.34, 0.08, 0, 0.17, 0.12, 0x1f3a6b, { rough: 0.85 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });

    // ------------------------------------------------------------ shooter and lane players
    const shooter = standingFigure(g, 0.0, -0.3, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x2a2410, atStation: true });
    const lanePlayers = [
      standingFigure(g, -1.05, -1.2, { ry: -Math.PI / 2, cloth: 0x7a5a1a, trousers: 0x2a2410, atStation: true }),
      standingFigure(g, 1.05, -1.2, { ry: Math.PI / 2, cloth: 0x7a5a1a, trousers: 0x2a2410, atStation: true }),
      standingFigure(g, 1.05, -1.8, { ry: Math.PI / 2, cloth: 0xf2f2f2, trousers: 0x2a2410, atStation: true }),
    ];
    const shotBall = basketball(g, 0.0, 1.0, -0.55);
    bead(0.25, 1.9, -0.2, "fault-rushing", "Rushing", { w: 0.22, r: 0.024 });
    bead(-0.28, 0.5, -0.25, "fault-changing-dribbles", "Dribble count", { w: 0.3, r: 0.024 });
    bead(0.0, 2.02, -0.05, "fault-looking-at-bench", "Eyes to the bench", { w: 0.34, r: 0.024 });
    bead(-0.3, 1.55, -0.1, "fault-deep-breath", "Deep breath", { w: 0.26, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ routine props
    card(-1.35, 1.4, -2.9, "lane-rules-card", "Lane rules", "WAIT FOR\nTHE RELEASE", { w: 0.3 });
    const routine = group(g, -2.3, 0, -2.15, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["routine-feet", "1 · Feet on the spot", 0.56], ["routine-dribbles", "2 · Same dribbles", 0.82],
      ["routine-breath", "3 · One slow breath", 1.08], ["routine-eyes", "4 · Eyes on the rim", 1.34],
      ["routine-shoot", "5 · Shoot and hold", 1.6],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBT_ACCENT, { emissive: BBT_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBT_CSS, w: 0.42 });
      reg(hits, b, lid);
    }
    stand(1.25, -0.2, 0, 1.0);
    bead(1.25, 1.15, -0.2, "breath-marker", "Quiet for the breath", { w: 0.38 });
    const footBase = group(g, 0.45, 0, -0.35);
    const footDisc = cyl(footBase, 0.14, 0.14, 0.02, 0, 0.03, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 18 });
    const footMark = box(footBase, 0.09, 0.012, 0.24, 0, 0.05, 0, BBT_ACCENT, { emissive: BBT_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    holoTag(footBase, "Shooting foot", 0, 0.22, 0, { css: BBT_CSS, w: 0.26 });
    reg(hits, footDisc, "foot-alignment-disc");
    const tStand = stand(-1.2, -0.3, 0.3);
    const clock = instrument(tStand, 0, 1.02, 0, { idle: "TEMPO", color: BBT_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Routine tempo", 0, 1.22, 0, { css: BBT_CSS, w: 0.28 });
    reg(hits, clock, "routine-clock");
    const cStand = stand(1.65, 1.0, -0.4);
    const composure = instrument(cStand, 0, 1.02, 0, { idle: "CALM", color: BBT_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Composure", 0, 1.22, 0, { css: BBT_CSS, w: 0.24 });
    reg(hits, composure, "composure-meter");
    const pressure = group(g, 2.4, 0, -1.4, -0.9);
    cyl(pressure, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["pressure-one-shot", "One shot only", 0.8], ["pressure-team-watching", "Team watching", 1.05], ["pressure-after-a-run", "After a short run", 1.3]]) {
      const b = ball(pressure, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(pressure, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.34 });
      reg(hits, b, lid);
    }
    card(-2.95, 1.35, -0.3, "water-round-card", "Water every round", "SHOOT ·\nDRINK · SHOOT", { ry: 1.1, w: 0.36 });

    // ------------------------------------------------------------ towel, rotation, bench
    const towel = box(g, 0.3, 0.04, 0.2, -1.9, 0.48, 1.9, 0xf2f2f2, { rough: 0.95 });
    holoTag(g, "Towel", -1.9, 0.7, 1.9, { css: BBT_CSS, w: 0.16 });
    reg(hits, towel, "line-towel");
    const hook = group(g, -0.95, 0, -0.45);
    cyl(hook, 0.018, 0.018, 0.9, 0, 0.45, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    const tSocket = box(hook, 0.12, 0.02, 0.12, 0, 0.92, 0, BBT_ACCENT, { emissive: BBT_ACCENT, ei: 0.6, rough: 0.5 });
    holoTag(hook, "Towel hook", 0, 1.08, 0, { css: BBT_CSS, w: 0.22 });
    reg(hits, tSocket, "towel-socket");
    const bench = group(g, -1.6, 0, 1.9);
    box(bench, 1.8, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.8, 0.8]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const token = cyl(g, 0.09, 0.09, 0.04, -0.9, 0.48, 1.9, 0x59c97b, { rough: 0.5, seg: 16 });
    holoTag(g, "Next shooter", -0.9, 0.7, 1.9, { css: BBT_CSS, w: 0.24 });
    reg(hits, token, "next-shooter-token");
    const lSocket = box(g, 0.28, 0.008, 0.28, 0.0, 0.03, 0.1, BBT_ACCENT, { emissive: BBT_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "On the line", 0.0, 0.2, 0.1, { css: BBT_CSS, w: 0.22 });
    reg(hits, lSocket, "line-socket");

    // ------------------------------------------------------------ boards, exit, door
    const log = board(0.6, 0.36, 1.45, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Routine cue · makes / attempts", "Water times · door talk"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const exit = group(g, -3.45, 0, 1.0, Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");
    const door = group(g, 3.45, 0, 1.4, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(door, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    const parent = standingFigure(g, 3.0, 0.75, { ry: -2.2, cloth: 0x4a5a6a, atStation: true });
    parent.visible = false;
    bead(3.0, 1.25, 2.1, "door-greeting-spot", "Greet the parent at the door", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.8, 1.25, 0.35, "skip-water-between-rounds", "Rounds with no water?", "NO WATER\nKEEP SHOOTING", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "sprints-for-every-miss", "A sprint for every miss?", "MISS =\nTEAM SPRINT", 0.1);
    hazardCard(0.6, 1.25, 1.2, "lane-players-crash-early", "Let the lane crash early?", "GO ON\nTHE ROUTINE", -0.1);
    hazardCard(1.85, 1.25, 0.35, "shoot-from-damp-line", "Shoot from the damp line?", "NO NEED\nTO WIPE", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.4, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.4, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x7a5a1a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void shooter;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "check-the-line") { drips.visible = false; laneBall.visible = false; chair.position.set(-2.9, 0, -2.0); }
        if (step.id === "towel-at-the-line") { towel.position.set(-0.95, 0.9, -0.45); }
        if (step.id === "align-the-feet") footMark.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.7, rough: 0.5 });
        if (step.id === "rotate-the-shooters") token.position.set(0.0, 0.06, 0.1);
        if (step.id === "log-the-free-throws") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Routine held through fatigue", "Water after every round"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "fire-alarm-at-the-line") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
          shotBall.position.set(0.2, 0.11, -0.7);
        }
        if (it.id === "parent-wants-a-word") { parent.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fire-alarm-at-the-line") {
          exitLeaf.rotation.y = 1.2; exitLeaf.position.x = -0.35;
          for (const p of lanePlayers) p.rotation.y = Math.PI / 2 + 1.2;
        }
        if (it.id === "parent-wants-a-word") { assistant.position.set(2.6, 0, 1.3); assistant.rotation.y = -1.4; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (shotBall.position.y > 0.5) shotBall.position.y = 0.9 + Math.abs(Math.sin(t * 3)) * 0.25;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "routine-tempo") {
          const ok = gg.t >= 0.4 && gg.t <= 0.58;
          repaint(clock.userData.screen, signFace(ok ? "STEADY" : gg.t < 0.4 ? "RUSHED" : "STALLING", { bg: "#211c08", accent: ok ? "#59c97b" : "#f0645b", fg: "#fdf8e4", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "composure-on-tired-legs") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(composure.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.4 ? "FLAT" : "RACING", { bg: "#211c08", accent: ok ? "#59c97b" : "#f0645b", fg: "#fdf8e4", scale: 0.5 }));
        }
      },
    };
  },
};
