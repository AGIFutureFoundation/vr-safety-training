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

// SmartCiti.X~ Basketball Fundamentals VR — station ten: the scrimmage and
// the sportsmanship debrief that closes the programme. The sideline checked,
// the ground rules said, fair teams picked, short periods on the clock, the
// game's temperature held, minutes shared, a quiet timeout huddle, tired
// players rested, the sportsmanship moments noticed, a handshake line, a
// debrief in the right order, a cool-down — and the guide's check-in at the
// end, because a heated game stays with the young players and the adults who
// ran it.
//
// Sited generically in the gym-court district; the teams and players are
// invented. No rule number is quoted.

const BBG_ACCENT = 0xc88aff;
const BBG_CSS = "#c88aff";

export const SIM_BB_SCRIMMAGE_AND_SPORTSMANSHIP_DEBRIEF = {
  id: "bb-scrimmage-and-sportsmanship-debrief",
  index: "340",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on shorter periods, equal playing time, fair teams and a positive, development-first game; NFHS basketball rules and its sportsmanship expectations for players, coaches and spectators; CDC Heads Up for a fall to the head in game play — recognise, remove, refer; the U.S. Center for SafeSport for calm, observable handling of conflict and emotional well-being; the American Red Cross first aid course for a player hurt in the scrimmage",
  name: "Scrimmage and Sportsmanship Debrief",
  title: simTitle("Scrimmage and Sportsmanship Debrief"),
  tagline: "The sideline checked, ground rules said, fair teams, short periods, the game's temperature held, minutes shared, tired players rested, sportsmanship noticed, a handshake line, a debrief in order, and a check-in on how everyone is",
  accent: BBG_ACCENT,
  accentCss: BBG_CSS,
  parSeconds: 340,
  footprint: 2.5,
  badge: { id: "good-game", name: "Good Game", note: "A scrimmage played hard and fair, every flare-up cooled, and every player leaving heard and in one piece" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your league's coach coordinator, or the assistant and athletic trainer who ran the game with you — a heated game can stay with the adults as much as the players, and saying so is part of coaching",

  game: system({
    name: "Box Score",
    currency: "GOOD GAMES",
    ranks: ["Scorekeeper", "Bench Coach", "Assistant Coach", "Head Coach", "Programme Mentor"],
    badges: [
      { id: "clear-sideline", name: "Clear Sideline", note: "Every sideline hazard found before tip-off", test: AWARD.stepClean("check-the-sideline") },
      { id: "fair-play", name: "Fair Play", note: "No unsafe action in the whole scrimmage", test: AWARD.safe },
      { id: "even-and-calm", name: "Even and Calm", note: "Game temperature and minutes both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-game", name: "Clean Game", note: "No corrections anywhere in the scrimmage", test: AWARD.clean },
      { id: "cool-heads", name: "Cool Heads", note: "Held the game's temperature in band the whole time", test: AWARD.unbroken },
      { id: "on-schedule", name: "On Schedule", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "play-on-after-head-hits-floor": "You waved play on after a player's head hit the floor on a fall because they got straight up. Getting up quickly says nothing about the brain: concussion signs can appear later, and a player left in the game is one collision away from a second blow before anyone has checked.",
    "overtime-no-water": "You added an extra overtime period and skipped the water break to finish the game. The end of a scrimmage is when players are hottest and most tired, and a gym full of young players who have not had a drink since the last break is how dizziness and heat illness arrive.",
    "extend-past-the-plan": "You kept the scrimmage going well past the planned time because it was close. Game minutes are the most intense load of practice, and running past the plan stacks unplanned volume onto tired legs — the late-session fatigue in which ankles roll and technique falls apart.",
    "drink-spill-by-the-table": "You played on past the sports drink spilled on the court by the scorer's table. A sideline spill is where players save balls going out of bounds and where subs step on; sticky or slick, it is a fall waiting for the next fast break.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the scrimmage once the debrief and the cool-down are done — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "check-the-sideline", kind: "find", noHint: true,
      targets: ["pre-spare-balls", "pre-glasses-no-strap", "pre-bracelet"],
      itemNames: {
        "pre-spare-balls": "spare balls loose on the sideline",
        "pre-glasses-no-strap": "a player in everyday glasses with no sports strap",
        "pre-bracelet": "a bracelet still on a wrist",
      },
      itemNotes: {
        "pre-spare-balls": "A spare ball that rolls onto the court mid-game ends up under a player's foot. Rack every one before tip-off.",
        "pre-glasses-no-strap": "Everyday glasses fly off and shatter on contact. Sports goggles or a strap, or the player sits this one out and plays in drills.",
        "pre-bracelet": "Jewellery comes off before play — a bracelet catches fingers and scratches in every scramble for the ball.",
      },
      decoyNotes: {
        "pre-knee-sleeve": "A knee sleeve is fine to play in. Look for what will roll underfoot, shatter or catch.",
      },
      title: "Check the sideline and the players before tip-off",
      cue: "Look along the sideline and at each player. Mark everything that has to be fixed before the game starts.",
      why: "A scrimmage is the least controlled part of practice: ten players at game speed, loose balls and bodies going out of bounds. Loose spare balls, everyday glasses and jewellery are the three things that turn game contact into an injury, and they are all fixed in the minute before tip-off rather than after the first scramble.",
    },
    {
      id: "say-the-ground-rules", kind: "select", target: "sportsmanship-board",
      title: "Say the ground rules out loud",
      cue: "Respect the referee's call, help an opponent up, no trash talk, and the whistle stops everything.",
      why: "Sportsmanship is a rule of the game, not a mood: NFHS basketball rules and its sportsmanship expectations hold players and coaches to respecting officials and opponents. Saying the ground rules before the tip gives every player the same standard to be held to, and gives the coach something clear to point back to when the game gets heated.",
    },
    {
      id: "pick-fair-teams", kind: "sequence", anyOrder: true,
      targets: ["balance-size", "balance-experience", "balance-friends"],
      itemNames: {
        "balance-size": "balance the teams by size",
        "balance-experience": "balance the teams by experience",
        "balance-friends": "split up the close friend groups",
      },
      title: "Pick fair teams",
      cue: "Balance by size and experience, and split the friend groups so nobody plays as a clique.",
      why: "Lopsided teams make for rough games: the losing side gets frustrated and the bigger side plays out of control. Balancing size and experience, the way youth development guidance recommends, keeps the contest close and the contact fair, and splitting friend groups means nobody is left out and nobody gangs up.",
    },
    {
      id: "set-the-game-clock", kind: "turn", target: "game-clock-dial",
      title: "Set short periods on the game clock",
      cue: "Turn the game clock to short periods with a break between each.",
      turn: { turns: 0.5, axis: "z", label: "PERIODS" },
      why: "Youth development guidance favours shorter periods for young players so that intensity stays high and fatigue stays low. Short periods with a break between them also build natural water breaks and substitution points into the game, which does more for safety than any reminder shouted from the bench.",
    },
    {
      id: "hold-the-temperature", kind: "track", target: "temperature-meter", seconds: 8,
      title: "Hold the game's temperature in band",
      cue: "Keep the game competitive but calm — enough intensity to play hard, never boiling over.",
      track: {
        start: 0.3, green: [0.38, 0.62], rise: 0.55, fall: 0.44, drift: 0.16, label: "TEMPERATURE",
        readout: (v) => (v < 0.38 ? "flat — nobody competing" : v > 0.62 ? "boiling — tempers rising" : "hard and fair"),
      },
      why: "A good scrimmage is competitive, and competition raises the temperature. The coach's job is to keep it in the band — calling fouls consistently, praising effort, stepping in early on the first sharp word — so the game stays hard and fair. Let it boil and contact turns into retaliation; let it go flat and nobody learns to compete.",
      holdBreakNote: "The game's temperature left the band — boiling over, or gone completely flat. Bring it back to hard and fair.",
    },
    {
      id: "share-the-minutes", kind: "gauge", target: "minutes-meter",
      title: "Share the minutes fairly",
      cue: "Commit when every player's minutes read even — nobody stuck on the bench, nobody playing the whole game.",
      gauge: {
        label: "MINUTES", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "uneven — some barely playing" : t <= 0.6 ? "even" : "uneven — some never resting"),
        missNote: "Uneven. Players stuck on the bench learn nothing and players never resting get tired and hurt. Find even and commit.",
      },
      why: "Equal playing time is central to youth development guidance for a reason beyond fairness: the players who never come off are the ones most tired and most likely to get hurt late in the game, and the ones who never go on miss the practice they came for. Reading minutes as the game goes is how a coach keeps both from happening.",
    },
    {
      id: "timeout-huddle", kind: "hold", target: "huddle-hold-marker", seconds: 7,
      title: "Hold a calm, quiet timeout huddle",
      cue: "Call a timeout and keep the huddle quiet and focused — one message, every player listening — while you watch the floor.",
      why: "A timeout is the coach's reset button: a moment to cool a game down, give one clear message and let tired players breathe. Holding the huddle quiet and calm — not a lecture, not shouting — models the composure the ground rules asked for, and gives the coach a moment to see who looks exhausted, overheated or upset.",
      holdBreakNote: "The huddle broke up before the message landed. Bring them back in, quiet, and finish the timeout.",
    },
    {
      id: "rest-the-tired", kind: "drag", target: "tired-player-token",
      title: "Rotate the tired player onto the rest bench",
      cue: "Move the tired player's token from the court column to the rest column on the sub board.",
      drag: { to: "rest-socket", radius: 0.45, missNote: "Not on the rest column. A tired player left on the court is the next rolled ankle — move the token all the way across." },
      why: "Fatigue is when young players get hurt: technique slips, reactions slow and landings get sloppy. A sub board that makes rest visible — the tired player moved to the rest column, water in hand — gets them off the floor before the fatigue does the deciding, and it tells the whole team that resting is part of the game.",
    },
    {
      id: "notice-sportsmanship", kind: "find", noHint: true,
      targets: ["moment-help-up", "moment-trash-talk", "moment-ref-complaint"],
      itemNames: {
        "moment-help-up": "a player helping an opponent up after a fall",
        "moment-trash-talk": "a player trash-talking after a basket",
        "moment-ref-complaint": "a player arguing with the referee's call",
      },
      itemNotes: {
        "moment-help-up": "That is the standard. Name it out loud in the debrief so the whole team hears what good sportsmanship looks like.",
        "moment-trash-talk": "A quiet word now, not a scene — and the ground rule repeated in the debrief without naming anyone.",
        "moment-ref-complaint": "The call stands and the referee is respected. Speak to the player privately, then move on.",
      },
      decoyNotes: {
        "moment-celebrating": "Celebrating a good basket with a teammate is fine. Look for the moments worth praising or correcting.",
      },
      title: "Notice the sportsmanship moments",
      cue: "Watch the game for the moments to praise and the moments to correct. Mark each one.",
      why: "What a coach notices is what a team learns to value. Praising the player who helped an opponent up, and correcting trash talk and arguing with officials quietly and privately, builds the culture the ground rules described. Correction done calmly and away from the crowd is the kind SafeSport guidance asks of adults working with young athletes.",
    },
    {
      id: "handshake-line", kind: "select", target: "handshake-line-marker",
      title: "End the game with a handshake line",
      cue: "Both teams line up and shake hands or bump fists, and say 'good game' to every player.",
      why: "The handshake line closes a competitive game with a gesture of respect, whatever the score. It gives every player a moment to put the game down, helps defuse anything left over from a hard foul, and reinforces that the opponent was a partner in the practice, not an enemy.",
    },
    {
      id: "run-the-debrief", kind: "sequence",
      targets: ["debrief-went-well", "debrief-improve", "debrief-shout-out", "debrief-next-time"],
      itemNames: {
        "debrief-went-well": "what went well",
        "debrief-improve": "one thing to improve",
        "debrief-shout-out": "a sportsmanship shout-out",
        "debrief-next-time": "what we work on next practice",
      },
      title: "Run the debrief in the right order",
      cue: "What went well, one thing to improve, a sportsmanship shout-out, then what we work on next time.",
      why: "A debrief that starts with what went well lets players hear the correction that follows; one thing to improve is something they can actually hold on to; the sportsmanship shout-out makes the ground rules real; and ending on the next practice sends them home looking forward. Out of order, a debrief becomes a list of mistakes that nobody remembers.",
      outOfOrderNote: "Out of order. Start with what went well — a debrief that opens with mistakes loses the room before the useful part.",
    },
    {
      id: "cool-down", kind: "hold", target: "cool-down-marker", seconds: 5,
      title: "Hold a short cool-down",
      cue: "Everyone walks, breathes and stretches gently for a short count before heading for the door.",
      why: "A short cool-down brings heart rate and breathing down gradually after the hardest part of practice, and it gives the coach one last look at every player: the one limping, the one very flushed, the one who has gone quiet. It is also a calm moment to end on, which matters after a game that got heated.",
      holdBreakNote: "The cool-down broke up before the count. Bring them back and finish it — the door can wait a moment.",
    },
    {
      id: "log-the-scrimmage", kind: "select", target: "practice-log-board",
      title: "Log the scrimmage",
      cue: "Record the minutes, the flare-up and how it was handled, the evacuation, the sportsmanship moments and anything the athletic trainer saw.",
      why: "The scrimmage log carries the most for the least effort: the flare-up and how it was settled, the evacuation and the headcount, minutes played, the sportsmanship moments named, and anything the athletic trainer noticed. Written at the time, it is the fairest account for players and parents and the best starting point for the next session.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer — how did that land?",
      cue: "Two minutes after the gym empties: how are each of you after the flare-up and the alarm, and is there anything to follow up with a player or a family?",
      why: "A heated game and an alarm in one session leave something with the adults as well as the players. Checking in afterwards — how did that land, is there a player or family to follow up with, does anyone need support — is the peer support the guide's check-in points to, and it is what keeps a coaching staff able to run the next practice as well as this one.",
    },
  ],

  interrupts: [
    {
      id: "hard-foul-and-a-shove",
      kind: "Heated moment",
      after: "hold-the-temperature", delay: 3, seconds: 12,
      alert: "A hard foul on a drive, the fouled player shoves back, and now both benches are on their feet shouting.",
      cue: "Call timeout at the scorer's table, bring both teams to their benches, and separate the two players — calm voice, no crowd.",
      target: "timeout-table",
      why: "When a game boils over, the first move is to stop it: a timeout empties the floor, both teams go to their benches, and the two players are separated before anything else happens. A calm voice from the coach resets the room faster than a raised one, and the talk with each player happens privately, in view of another adult, once they are calm.",
      missNote: "Play restarted with both players still furious, the next possession ended in another hard foul, and a bench player ran on to get involved. What was one heated moment is now a scuffle with half the gym in it.",
      wrongNote: "That does not stop the game. Call timeout at the scorer's table and get both teams to their benches.",
    },
    {
      id: "fire-alarm-mid-game",
      kind: "Fire alarm",
      after: "timeout-huddle", delay: 3, seconds: 12,
      alert: "The fire alarm goes off in the middle of the timeout huddle, with both teams, the scorer and a few parents in the gym.",
      cue: "Everyone out through the marked fire exit — both teams, the scorer and the parents — headcount by team outside.",
      target: "fire-exit-door",
      why: "An alarm during a game means more people to move: both teams, the scorer, the parents in the bleachers. Everyone leaves through the marked exit together, with the adults at the front and back, and each coach counts their own team against their list at the assembly point. Nobody goes back for bags, phones or the scoreboard.",
      missNote: "The huddle finished its talk, then players went back for bags and parents waited to see if it was real. By the time the gym was empty, nobody could say for sure that everyone — players, parents and the scorer — had come out.",
      wrongNote: "The alarm comes first. Everyone out through the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBG_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBG_ACCENT, { emissive: o.color ?? BBG_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBG_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1a0e26", accent: o.accent ?? BBG_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBG_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(20,10,30,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBG_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f8f0ff";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e0ccf6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBG_ACCENT, { rough: 0.5, emissive: o.accent ?? BBG_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const wrap = (cx, text, x, y, maxW, lh) => {
      let line = "", yy = y;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x, yy);
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.11, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the scrimmage half
    const courtTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#2a1a3a", base2: "#241632", seam: "rgba(8,4,14,0.55)",
    }), { repeat: 2, px: 384 });
    const halfMat = box(g, 3.0, 0.02, 1.9, 0, 0.012, -1.3, 0x2a1a3a, { rough: 0.95, cast: false });
    halfMat.material = texturedMat(courtTex, { rough: 0.95, metal: 0.02, color: 0xd8c8e8 });
    const reds = [
      standingFigure(g, -0.9, -1.0, { ry: 0.3, cloth: 0xd8261e, trousers: 0x2a1a1a, atStation: true }),
      standingFigure(g, 0.25, -1.6, { ry: -0.2, cloth: 0xd8261e, trousers: 0x2a1a1a, atStation: true }),
    ];
    const blues = [
      standingFigure(g, -0.45, -1.35, { ry: Math.PI - 0.3, cloth: 0x2a5ad8, trousers: 0x1a1a2a, atStation: true }),
      standingFigure(g, 0.95, -1.1, { ry: Math.PI + 0.3, cloth: 0x2a5ad8, trousers: 0x1a1a2a, atStation: true }),
    ];
    const gameBall = basketball(g, 0.6, 0.4, -1.05);

    // ------------------------------------------------------------ sideline checks
    const spares = [basketball(g, 2.3, 0.11, 0.3), basketball(g, 2.55, 0.11, 0.1)];
    bead(2.45, 0.5, 0.2, "pre-spare-balls", "Spare balls loose", { w: 0.3 });
    bead(-0.75, 1.66, -0.85, "pre-glasses-no-strap", "Glasses, no strap", { w: 0.32, r: 0.024 });
    bead(0.1, 0.95, -1.45, "pre-bracelet", "Bracelet", { w: 0.22, r: 0.024 });
    bead(1.1, 0.55, -0.95, "pre-knee-sleeve", "Knee sleeve", { w: 0.26, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ scorer's table and clock
    const table = group(g, -2.3, 0, -0.9, 0.9);
    box(table, 1.2, 0.05, 0.5, 0, 0.74, 0, 0x3a2a4a, { rough: 0.7 });
    box(table, 1.2, 0.7, 0.04, 0, 0.37, 0.24, 0x2a1a3a, { rough: 0.7 });
    decal(table, 1.0, 0.3, 0, 0.45, 0.27, signFace("SCORER'S TABLE", { bg: "#1a0e26", accent: BBG_CSS, scale: 0.5 }), { px: 256 });
    const timeoutBtn = box(table, 0.14, 0.05, 0.14, 0.35, 0.79, 0, 0xf2c14b, { rough: 0.4, emissive: 0xf2c14b, ei: 0.4 });
    holoTag(table, "Timeout — scorer's table", 0.35, 1.0, 0, { css: "#f2c14b", w: 0.44 });
    reg(hits, timeoutBtn, "timeout-table");
    const clockFace = group(table, -0.3, 0.77, 0);
    const clockDial = cyl(clockFace, 0.08, 0.08, 0.04, 0, 0.02, 0, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 16 });
    const clockTick = box(clockFace, 0.02, 0.012, 0.07, 0, 0.045, 0.03, 0xffcf4a, { rough: 0.4, emissive: 0xffcf4a, ei: 0.8 });
    holoTag(table, "Game clock", -0.3, 1.0, 0, { css: BBG_CSS, w: 0.24 });
    reg(hits, clockDial, "game-clock-dial");
    const spill = cyl(g, 0.24, 0.24, 0.004, -1.75, 0.006, -0.35, 0xd8a83a, { rough: 0.2, opacity: 0.55, seg: 16, cast: false });
    void spill;

    // ------------------------------------------------------------ rules, teams, meters
    const code = board(0.62, 0.4, -1.35, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "GROUND RULES", ["Respect the call", "Help them up · no trash talk", "The whistle stops everything"]));
    reg(hits, code.userData.face, "sportsmanship-board");
    const teams = group(g, 2.35, 0, -2.1, -0.6);
    cyl(teams, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["balance-size", "Balance size", 0.8], ["balance-experience", "Balance experience", 1.05], ["balance-friends", "Split friend groups", 1.3]]) {
      const b = ball(teams, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(teams, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.38 });
      reg(hits, b, lid);
    }
    const tStand = stand(1.65, 0.8, -0.4);
    const temperature = instrument(tStand, 0, 1.02, 0, { idle: "TEMP", color: BBG_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Game temperature", 0, 1.22, 0, { css: BBG_CSS, w: 0.34 });
    reg(hits, temperature, "temperature-meter");
    const mStand = stand(-0.3, -2.55, 0.1);
    const minutes = instrument(mStand, 0, 1.02, 0, { idle: "MINUTES", color: BBG_ACCENT, w: 0.2, d: 0.26 });
    holoTag(mStand, "Minutes played", 0, 1.22, 0, { css: BBG_CSS, w: 0.3 });
    reg(hits, minutes, "minutes-meter");
    const huddle = cyl(g, 0.45, 0.45, 0.006, 1.1, 0.02, -2.3, BBG_ACCENT, { rough: 0.6, opacity: 0.7, emissive: BBG_ACCENT, ei: 0.4, seg: 24, cast: false });
    void huddle;
    bead(1.1, 0.8, -2.3, "huddle-hold-marker", "Quiet timeout huddle", { w: 0.38 });

    // ------------------------------------------------------------ sub board
    const sub = group(g, -3.0, 0, 0.7, 1.1);
    for (const sx of [-0.35, 0.35]) cyl(sub, 0.02, 0.02, 1.5, sx, 0.75, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(sub, 0.8, 0.5, 0, 1.3, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a0e26"; cx.font = `700 ${Math.round(h * 0.12)}px Arial`; cx.textAlign = "center";
      cx.fillText("ON COURT", w * 0.27, h * 0.16); cx.fillText("RESTING", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const token = cyl(sub, 0.05, 0.05, 0.02, -0.2, 1.25, 0.04, 0xd8261e, { rough: 0.5, seg: 14 });
    token.rotation.x = Math.PI / 2;
    holoTag(sub, "Tired player's token", -0.2, 1.62, 0.04, { css: BBG_CSS, w: 0.36 });
    reg(hits, token, "tired-player-token");
    const restSocket = box(sub, 0.16, 0.16, 0.01, 0.2, 1.25, 0.03, BBG_ACCENT, { emissive: BBG_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, restSocket, "rest-socket");

    // ------------------------------------------------------------ sportsmanship, handshake, debrief
    bead(-0.45, 2.02, -1.35, "moment-help-up", "Helping up", { w: 0.26, r: 0.024 });
    bead(0.25, 2.0, -1.6, "moment-trash-talk", "Trash talk", { w: 0.26, r: 0.024 });
    bead(0.95, 2.02, -1.1, "moment-ref-complaint", "Arguing the call", { w: 0.32, r: 0.024 });
    bead(-0.9, 2.0, -1.0, "moment-celebrating", "Celebrating", { w: 0.28, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const shake = box(g, 1.6, 0.008, 0.08, 0.2, 0.03, -0.2, BBG_ACCENT, { emissive: BBG_ACCENT, ei: 0.4, rough: 0.6, cast: false });
    holoTag(g, "Handshake line", 0.2, 0.22, -0.2, { css: BBG_CSS, w: 0.28 });
    reg(hits, shake, "handshake-line-marker");
    const debrief = group(g, -2.35, 0, -2.25, 0.4);
    cyl(debrief, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["debrief-went-well", "1 · What went well", 0.62], ["debrief-improve", "2 · One thing to improve", 0.9],
      ["debrief-shout-out", "3 · Sportsmanship shout-out", 1.18], ["debrief-next-time", "4 · Next practice", 1.46],
    ]) {
      const b = ball(debrief, 0.028, 0, y, 0, BBG_ACCENT, { emissive: BBG_ACCENT, ei: 1.5, seg: 12 });
      holoTag(debrief, label, 0.24, y, 0, { css: BBG_CSS, w: 0.48 });
      reg(hits, b, lid);
    }
    stand(1.35, -0.15, 0, 0.9);
    bead(1.35, 1.05, -0.15, "cool-down-marker", "Cool-down", { w: 0.24 });

    // ------------------------------------------------------------ the guide's board (shared/ei-guide.js)
    const guide = board(0.66, 0.32, 0.55, 2.1, -3.05, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Play hard. Play fair. Check in after."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ boards, exit, kit
    const log = board(0.6, 0.36, 1.75, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Minutes · flare-up · alarm", "Sportsmanship · trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.56, 0.36, 3.1, 1.66, -0.9, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["How did that land?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const exit = group(g, 3.45, 0, 1.5, -Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");
    const bench = group(g, -1.3, 0, 1.95);
    box(bench, 2.0, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.9, 0.9]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 4; i++) cyl(bench, 0.035, 0.035, 0.2, -0.6 + i * 0.4, 0.57, 0, [0x3a8fd0, 0xe0e4e8][i % 2], { rough: 0.5, seg: 10 });
    const ring = torus(g, 0.3, 0.02, 2.4, 0.02, 2.1, BBG_ACCENT, { rough: 0.5, seg: 6, seg2: 20, cast: false });
    ring.rotation.x = Math.PI / 2;

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.8, 1.25, 0.4, "drink-spill-by-the-table", "Play on past the spill?", "IT'S BY THE\nTABLE, PLAY ON", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "play-on-after-head-hits-floor", "Play on — they got straight up?", "GOT UP FAST\nPLAY ON", 0.1);
    hazardCard(0.6, 1.25, 1.2, "overtime-no-water", "Overtime, skip the water?", "ONE MORE\nNO BREAK", -0.1);
    hazardCard(1.8, 1.25, 1.2, "extend-past-the-plan", "Keep going past the plan?", "IT'S CLOSE ·\nKEEP GOING", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.45, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.45, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x6a3a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void assistant;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.2, -1.5),

      onStepComplete(step) {
        if (step.id === "check-the-sideline") for (const b of spares) b.visible = false;
        if (step.id === "set-the-game-clock") clockTick.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "rest-the-tired") token.position.set(0.2, 1.25, 0.05);
        if (step.id === "handshake-line") { reds[0].rotation.y = Math.PI / 2; blues[0].rotation.y = -Math.PI / 2; }
        if (step.id === "run-the-debrief") paintGuide("Good debrief. Now the part nobody scores: how is everyone — players and staff — after a game like that?");
        if (step.id === "log-the-scrimmage") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Flare-up settled at the table", "Everyone out and counted"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. That is the call the ground rules and the players are counting on you to get right.");
      },

      onInterrupt(it) {
        if (it.id === "hard-foul-and-a-shove") {
          reds[1].position.set(0.55, 0, -1.2); reds[1].rotation.y = -Math.PI / 2;
          blues[1].position.set(0.95, 0, -1.2); blues[1].rotation.y = Math.PI / 2;
        }
        if (it.id === "fire-alarm-mid-game") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
          gameBall.position.set(0.3, 0.11, -0.8);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hard-foul-and-a-shove") {
          reds[1].position.set(-1.4, 0, 1.4); reds[1].rotation.y = 0.3;
          blues[1].position.set(2.3, 0, 1.2); blues[1].rotation.y = -0.3;
          paintGuide("That was the right call. Separate first, talk later — calmly, and privately.");
        }
        if (it.id === "fire-alarm-mid-game") { exitLeaf.rotation.y = -1.2; exitLeaf.position.x = 0.35; }
      },

      animate(t, dt, session) {
        void dt;
        if (gameBall.position.y > 0.2) gameBall.position.y = 0.15 + Math.abs(Math.sin(t * 4.5)) * 0.3;
        if (session?.step?.id === "set-the-game-clock") clockFace.rotation.y = t;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "share-the-minutes") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(minutes.userData.screen, signFace(ok ? "EVEN" : "UNEVEN", { bg: "#1a0e26", accent: ok ? "#59c97b" : "#f0645b", fg: "#f8f0ff", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-the-temperature") {
          const ok = tr.v >= 0.38 && tr.v <= 0.62;
          repaint(temperature.userData.screen, signFace(ok ? "HARD · FAIR" : tr.v < 0.38 ? "FLAT" : "BOILING", { bg: "#1a0e26", accent: ok ? "#59c97b" : "#f0645b", fg: "#f8f0ff", scale: 0.48 }));
        }
      },
    };
  },
};
