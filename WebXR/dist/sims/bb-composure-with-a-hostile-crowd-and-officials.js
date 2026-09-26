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

// SmartCiti.X~ Basketball Fundamentals VR — composure with a hostile crowd
// and officials. The moment a call goes the other way and a parent in the
// second row starts shouting at a fourteen-year-old by name is not a moment
// any drill can fully rehearse, but the routine underneath it can be: one
// breath, a cue word, eyes back on the bench, and the argument left to the
// adults whose job it actually is. What is taught here is not how to win the
// argument — it is how to not have one, so the game the player actually
// controls keeps being played.
//
// Sited generically in the gym-court district; the team, the officials and
// the crowd are invented. No research finding or statistic is asserted: the
// routine is taught as a practice the coaching and sport-psychology bodies
// below recommend, not as proven science, and no official is named, blamed
// or quoted with anything beyond a generic hand signal.

const BBC_ACCENT = 0xff6b4a;
const BBC_CSS = "#ff6b4a";

export const SIM_BB_COMPOSURE_WITH_A_HOSTILE_CROWD_AND_OFFICIALS = {
  id: "bb-composure-with-a-hostile-crowd-and-officials",
  index: "345",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on coaching a young athlete's emotional response to officiating rather than the call itself; the Association for Applied Sport Psychology's guidance on a short composure routine under provocation — a breath, a cue word, and attention returned to the bench; NFHS basketball rules on technical fouls and its sportsmanship expectations for players, coaches and benches; the U.S. Center for SafeSport for protecting a young athlete from personal, targeted abuse from a spectator, and for calm, observable adult handling of a hostile fan; CDC Heads Up for a head knock taken in a courtside scramble; the American Red Cross first aid course for a spilled drink or a fall along the baseline",
  name: "Composure with a Hostile Crowd and Officials",
  title: simTitle("Composure with a Hostile Crowd and Officials"),
  tagline: "A bad call and a heckling parent are not something a player can win an argument with — one breath, a cue word and eyes back on the bench keep the game the one thing still in their control",
  accent: BBC_ACCENT,
  accentCss: BBC_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: { id: "still-in-the-game", name: "Still in the Game", note: "A bad call and a hostile heckle both met with the routine instead of an argument, and the bench stayed calm around it" },

  supportLine: "your league's coach coordinator, or the assistant who walked the heckler back from the rail with you — a hostile crowd can rattle the adults on the bench as much as the player wearing the jersey",

  game: system({
    name: "Bench Composure Board",
    currency: "STEADY POINTS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Composure Mentor"],
    badges: [
      { id: "clear-baseline-first", name: "Clear Baseline First", note: "Every hazard on the sideline found before the first bad call lands", test: AWARD.stepClean("scan-the-stands-for-trouble") },
      { id: "no-blow-up", name: "No Blow-Up", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "steady-under-heckling", name: "Steady Under Heckling", note: "Composure tempo and the heckling meter both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unshaken", name: "Unshaken", note: "Held composure in band through the whole heckling stretch", test: AWARD.unbroken },
      { id: "quick-reset", name: "Quick Reset", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "argue-the-call-nose-to-nose": "You let the player who disagreed with the call get nose-to-nose with the official instead of stepping in yourself. NFHS rules treat that as a technical foul waiting to happen, and a young player nose-to-nose with an adult authority figure is one more shouted word away from an ejection that ends their night over a call that was never theirs to argue.",
    "let-the-heckler-keep-going-unanswered": "You let the parent in the second row keep shouting personal insults at a fourteen-year-old by name without anyone from the gym stepping in. A spectator targeting a minor by name with personal, sustained abuse is exactly the unwatched moment SafeSport guidance expects an adult in charge of the gym to notice and stop, not wait out.",
    "spilled-drink-left-on-the-baseline": "You left a spilled drink sitting on the baseline while everyone's attention was on the argument at half-court. A player sprinting back on defence with their eyes on the scoreboard, not the floor, is one slick patch away from a fall at full speed, and a heated moment is exactly when nobody is watching the floor for it.",
    "bench-empties-onto-the-court": "You let the whole bench get up and come onto the court toward the official and the shouting parent instead of holding the team where they were. A crowd of players converging on one heated spot is how a two-person disagreement becomes a ten-person incident, and NFHS sportsmanship rules hold the bench, not just the player at the center of it, responsible for staying off the floor.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the composure session once the heckling has run and the routine has held — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-stands-for-trouble", kind: "find", noHint: true,
      targets: ["crowd-heckler-parent", "crowd-spilled-drink", "crowd-player-squaring-up"],
      itemNames: {
        "crowd-heckler-parent": "a parent leaning over the rail, already shouting",
        "crowd-spilled-drink": "a spilled drink pooling on the baseline",
        "crowd-player-squaring-up": "a player squaring up toward the official",
      },
      itemNotes: {
        "crowd-heckler-parent": "That is personal, not just loud. Note it now so the assistant is ready to move the moment it crosses the line.",
        "crowd-spilled-drink": "A slick patch on the baseline gets missed by everyone watching the argument instead of the floor. Flag it before someone sprints through it.",
        "crowd-player-squaring-up": "That is the flashpoint the whole routine exists for. Get there before the second word is said.",
      },
      decoyNotes: {
        "crowd-fan-cheering-normally": "A fan cheering loudly for a good play is the crowd doing exactly what it should. Look for what is actually a problem.",
      },
      title: "Scan the sideline the moment a call goes wrong",
      cue: "Look at the stands, the floor and your own player. Mark what has to be handled and what has to be fixed underfoot.",
      why: "A bad call changes the room in one second: a parent's tone turns personal, a spilled drink nobody was watching becomes a slip risk, and a player's shoulders square up before a coach can get a word in. Reading all three in the same glance — the crowd, the floor and the player — is what lets the routine start before any of them gets worse.",
    },
    {
      id: "read-the-technical-foul-line", kind: "select", target: "foul-line-card",
      title: "Read the technical-foul line before anyone crosses it",
      cue: "Post the reminder: arguing a call is a coach's conversation with an official, never a player's shouting match.",
      why: "NFHS rules put a real cost on arguing a call — a technical foul that can hand the other team points and a player an early exit from the game. Posting that line where the bench can see it is a reminder that the conversation with an official belongs to the coach, calmly, and never to a player standing in the heat of the play.",
    },
    {
      id: "breath-after-the-bad-call", kind: "hold", target: "breath-marker", seconds: 6,
      title: "Hold one slow breath right after the bad call",
      cue: "Player stops, one slow breath in, a longer one out — hold here and watch it happen, no talking over it.",
      why: "The Association for Applied Sport Psychology's guidance on composure under provocation starts the same way a reset after a miss does: something physical before anything said. A slow exhale brings a player's body down from the jolt of a call that felt unfair, so whatever happens next is a decision made by their skill, not by the adrenaline of the moment.",
      holdBreakNote: "The breath got cut short before it finished. Let the player take the whole slow breath before the routine moves on.",
    },
    {
      id: "build-the-composure-routine", kind: "sequence",
      targets: ["comp-breath", "comp-cue-word", "comp-shoulders-down", "comp-eyes-on-bench"],
      itemNames: {
        "comp-breath": "one slow breath",
        "comp-cue-word": "say the cue word",
        "comp-shoulders-down": "shoulders down, unclench",
        "comp-eyes-on-bench": "eyes back on the bench",
      },
      title: "Build the composure routine in order",
      cue: "Breath first, then the cue word, then shoulders down, then eyes back on the bench and the coach.",
      why: "Each part sets up the next: the breath calms the body so the cue word actually lands instead of getting lost in adrenaline, dropping the shoulders undoes the physical posture of an argument before it starts one, and only then are the player's eyes free to find the bench instead of staying locked on the official or the stands.",
      outOfOrderNote: "Out of order. The breath comes first — a cue word said to a racing body does not stick, and eyes on the bench before the shoulders drop still reads as squared up for a fight.",
    },
    {
      id: "choose-a-composure-cue", kind: "select", target: "cue-word-card",
      title: "Choose one short composure cue",
      cue: "Pick a cue word short enough to say to yourself mid-argument — 'Bench', not a whole sentence.",
      why: "A cue word works under provocation for the same reason it works after a miss: it is short enough to say silently in the two seconds after a bad call, and specific enough to mean something a player has actually practised. A vague 'stay calm' gives the mind nothing to do; one practised word gives it a job to do instead of arguing.",
    },
    {
      id: "turn-focus-back-to-the-bench", kind: "turn", target: "focus-dial",
      title: "Turn attention back to the bench",
      cue: "Turn the focus dial toward the bench — the routine ends pointed at the coach, not at the official or the stands.",
      turn: { turns: 0.5, axis: "y", label: "TO BENCH" },
      why: "Turning attention physically toward the bench gives the composure routine somewhere concrete to end, the same way calling the next play ends a reset after a miss. A player left facing the official or the crowd is still in the argument even if they have stopped talking; one turned back toward the coach has actually left it.",
    },
    {
      id: "composure-tempo", kind: "gauge", target: "composure-clock",
      title: "Keep the composure routine at the right tempo",
      cue: "Commit when the routine reads steady — not skipped, not dragged out into a staring match.",
      gauge: {
        label: "TEMPO", speed: 0.62, green: [0.4, 0.58],
        readout: (t) => (t < 0.4 ? "rushed — skipped the breath" : t <= 0.58 ? "steady — back with the bench" : "stalled — still staring them down"),
        missNote: "Outside the band. Rushed skips the breath that makes the cue word work; stalled keeps the player locked in a staring match with the official or the stands. Find steady and commit.",
      },
      why: "A composure routine run too fast skips straight past the breath that calms the body, so the cue word lands on a nervous system that never came down; run too slow, it turns into a staring match that keeps the confrontation alive instead of ending it. The routine only works at its own pace, the same way it does after a miss.",
    },
    {
      id: "hold-the-breath-before-play-resumes", kind: "hold", target: "retry-breath-marker", seconds: 5,
      title: "Hold the breath again before play resumes",
      cue: "Right before the ball is back in play, the same one breath — hold it here, no rushing back onto the floor.",
      why: "The routine only matters if it gets used the moment it is needed most, which is the inbound pass right after a call that stung, not only in the calm of a walk-through. Holding the same breath before play resumes is what turns a routine talked about into one a player actually reaches for with the whole gym still watching.",
      holdBreakNote: "Play started before the breath finished. Hold it the whole way through — the inbound can wait one more second.",
    },
    {
      id: "spot-the-warning-signs", kind: "find", noHint: true,
      targets: ["warn-clenched-fists", "warn-mouthing-off", "warn-teammate-egging-on"],
      itemNames: {
        "warn-clenched-fists": "a player with fists clenched at their sides",
        "warn-mouthing-off": "a player still mouthing off at the official",
        "warn-teammate-egging-on": "a teammate egging the argument on from the bench",
      },
      itemNotes: {
        "warn-clenched-fists": "Clenched fists are the body still arguing even after the mouth has stopped. Get the quiet word in before it becomes a hand.",
        "warn-mouthing-off": "Still talking is the routine not having landed. Pull them back to the breath, not to a lecture.",
        "warn-teammate-egging-on": "A teammate stoking it from the bench keeps the fire lit even if the player at the center has calmed down. Quiet that voice too.",
      },
      decoyNotes: {
        "warn-clapping-it-off": "A player clapping and moving on has already reset. Look for who has not.",
      },
      title: "Spot the warning signs the routine has not landed",
      cue: "Watch the bench and the floor for who is still carrying the argument. Mark what needs a quiet word.",
      why: "A hostile call does not end when the whistle stops — it lingers in clenched fists, a mouth that keeps going, and a teammate who keeps the fire lit from the bench. Catching those signs here, before the next possession, is what a composure routine is actually for: not just one player calming down, but the whole bench staying out of it.",
    },
    {
      id: "let-the-call-go", kind: "drag", target: "call-token",
      title: "Physically let the bad call go",
      cue: "Drag the call token from the 'still arguing it' side of the board to the 'let go' bin.",
      drag: { to: "release-bin", radius: 0.45, missNote: "Still on the 'still arguing it' side. A call talked about but not physically moved off the board is a call still being carried — move it all the way to the bin." },
      why: "Letting go of a call a player believes was wrong is an abstract idea, and abstract ideas are hard to actually do while a crowd is still loud. A physical action — moving a token off the board — gives the mental step something concrete to stand for, the same trick that works for letting a missed shot go, and it works here for the same reason.",
    },
    {
      id: "quiet-word-with-the-heated-player", kind: "select", target: "quiet-word-spot",
      title: "Give the most heated player a quiet word, not a lecture",
      cue: "Step to the side with the player still carrying the call — a short, calm sentence, away from the bench and the crowd.",
      why: "A correction given quietly, one to one, and briefly is heard; the same words said loudly in front of the bench become a second public moment for a player already embarrassed by the first one. Calm, private and observable correction is the kind safe-sport guidance asks of adults working with young athletes, in a heated moment as much as a quiet one.",
    },
    {
      id: "hold-composure-through-the-heckling", kind: "track", target: "heckle-composure-meter", seconds: 8,
      title: "Hold composure through the ongoing heckling",
      cue: "Keep the bench and the player's composure in band while the heckling continues — not flat and checked out, not boiling over.",
      track: {
        start: 0.32, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.15, label: "COMPOSURE",
        readout: (v) => (v < 0.38 ? "flat — switched off" : v > 0.62 ? "boiling — tempers rising" : "steady through the heckling"),
      },
      why: "A hostile crowd tests a composure routine longer than a single bad call does, because the heckling does not stop when the routine finishes once. Holding the bench's composure in band — not letting frustration boil over, not letting the player check out and go flat — is what keeps the routine available for the tenth shouted comment the same way it was for the first.",
      holdBreakNote: "Composure left the band — boiling over, or gone flat. Bring it back to steady before the next possession.",
    },
    {
      id: "log-the-composure-session", kind: "select", target: "practice-log-board",
      title: "Log the composure session",
      cue: "Record the cue word used, how the heckling was handled, and anything the athletic trainer saw on the baseline.",
      why: "The cue word a player settled on, how sustained heckling was handled and anything the athletic trainer noticed on the baseline are what the next game needs to build on. Written down at the time, the log is the fairest record for the player and the clearest starting point for the same routine again next week.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: how the heckling felt to manage, anything seen on the baseline, and is everybody good to carry on?",
      why: "Managing a hostile crowd and a bad call takes something out of the adults on the bench too. A short check-in — what did you see, how did that feel to handle, is anyone worth a follow-up call — keeps the staff working as a team and is exactly the kind of noticing the guide's check-in points to.",
    },
  ],

  interrupts: [
    {
      id: "player-nose-to-nose-with-the-official",
      kind: "Bad call",
      after: "breath-after-the-bad-call", delay: 3, seconds: 12,
      alert: "The player squares up nose-to-nose with the official, still shouting about the call, and the official's hand is already reaching for the whistle.",
      cue: "Step between them at the buffer spot, calm and quick — not a lecture yet, just get your body between them.",
      target: "coach-buffer-spot",
      why: "A player nose-to-nose with an official is seconds from a technical foul or an ejection, and the fastest way to stop it is not words from the sideline but a coach's body physically between the two of them. Getting to the buffer spot quickly, calm rather than shouting louder than the player, is what actually breaks the confrontation up before the whistle decides it for you.",
      missNote: "The argument ran another ten seconds before anyone stepped in, and the official reached for the whistle. The technical foul that followed cost more than the bad call ever would have.",
      wrongNote: "That does not get between them. Go to the buffer spot, between the player and the official.",
    },
    {
      id: "heckler-leans-over-the-rail",
      kind: "Heckler",
      after: "hold-composure-through-the-heckling", delay: 3, seconds: 12,
      alert: "The parent in the second row leans right over the rail toward the bench, shouting something personal at your player by name.",
      cue: "Send the assistant to the rail to ask the parent to step back, calm and clear — the head coach stays with the team.",
      target: "rail-escort-spot",
      why: "A spectator leaning over the rail to target a young player by name has crossed from loud into personal, and that is a conversation for an adult who is not also trying to run the game. Sending the assistant to handle it calmly at the rail keeps the head coach with the team and keeps the whole exchange in the open, the way safe-sport guidance expects a hostile-spectator moment to be handled.",
      missNote: "Nobody went to the rail, and the shouting kept going right through the next two possessions. Your player heard every word of it with no adult stepping in.",
      wrongNote: "That does not reach the rail. Send the assistant to the rail, calm and clear.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, BBC_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBC_ACCENT, { emissive: o.color ?? BBC_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBC_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#26120c", accent: o.accent ?? BBC_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBC_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(26,14,10,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff0ea";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#f4d8cc";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBC_ACCENT, { rough: 0.5, emissive: o.accent ?? BBC_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.11) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the lane, hoop and baseline
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#2c1a14", base2: "#261510", seam: "rgba(10,4,2,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 1.6, 0.02, 2.2, 0, 0.012, -1.6, 0x2c1a14, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xe8ccc0 });
    const baseline = box(g, 3.2, 0.006, 0.05, 0, 0.025, -3.0, 0xf6f4ee, { rough: 0.6, cast: false });
    void baseline;
    const hoop = group(g, 0, 0, -3.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });
    const officialBall = basketball(g, -0.2, 0.11, -1.3);
    void officialBall;

    // ------------------------------------------------------------ the crowd rail and heckler
    const rail = group(g, 0, 0, 2.5);
    box(rail, 3.6, 0.05, 0.05, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (const sx of [-1.6, -0.8, 0, 0.8, 1.6]) box(rail, 0.04, 0.9, 0.04, sx, 0.45, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const bleacherRows = [];
    for (let i = 0; i < 3; i++) {
      const row = box(g, 3.6, 0.05, 0.5, 0, 1.05 + i * 0.32, 2.9 + i * 0.4, 0x5a6068, { rough: 0.7 });
      bleacherRows.push(row);
    }
    const fans = [
      standingFigure(g, -1.2, 3.1, { ry: Math.PI, cloth: 0x7a8a9a, atStation: true }),
      standingFigure(g, 1.1, 3.3, { ry: Math.PI, cloth: 0x9a8a7a, atStation: true }),
    ];
    const heckler = standingFigure(g, -0.4, 2.55, { ry: Math.PI, cloth: 0x8a4a3a, atStation: true });
    bead(-0.4, 1.95, 2.55, "crowd-heckler-parent", "Heckling parent at the rail", { color: 0xf0645b, css: "#f0645b", w: 0.5 });
    bead(1.3, 0.65, -2.0, "crowd-fan-cheering-normally", "Fan cheering normally", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ the official and the flashpoint
    const official = standingFigure(g, 0.7, -1.2, { ry: -1.6, cloth: 0x2b2f35, trousers: 0x1a1e23, atStation: true });
    const officialArm = box(official, 0.06, 0.32, 0.06, 0.22, 1.35, 0, 0x2b2f35, { rough: 0.5 });
    const heatedPlayer = standingFigure(g, 0.1, -1.15, { ry: 1.5, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    bead(0.4, 2.0, -1.18, "crowd-player-squaring-up", "Player squaring up to the official", { w: 0.52 });
    bead(-0.6, 0.11, -2.9, "crowd-spilled-drink", "Spilled drink on the baseline", { color: 0xf2c14b, css: "#f2c14b", w: 0.44, r: 0.03 });
    const spill = cyl(g, 0.14, 0.14, 0.004, -0.6, 0.006, -2.9, 0x8a5a2a, { rough: 0.3, opacity: 0.7, seg: 16, cast: false });

    // ------------------------------------------------------------ foul-line reminder, routine ladder
    card(-2.4, 1.4, -2.9, "foul-line-card", "Technical-foul reminder", "COACH TALKS TO REFS.\nPLAYERS DO NOT.", { w: 0.46, cw: 0.44 });
    stand(1.2, -0.1, 0, 1.0);
    bead(1.2, 1.15, -0.1, "breath-marker", "Breath after the bad call", { w: 0.44 });
    const coachBuffer = group(g, 0.35, 0, -1.4);
    bead(0.35, 1.3, -1.4, "coach-buffer-spot", "Coach steps between", { color: 0x59c97b, css: "#59c97b", w: 0.42 });
    void coachBuffer;
    const routine = group(g, -2.3, 0, -2.1, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["comp-breath", "1 · One slow breath", 0.56], ["comp-cue-word", "2 · Say the cue word", 0.82],
      ["comp-shoulders-down", "3 · Shoulders down", 1.08], ["comp-eyes-on-bench", "4 · Eyes on the bench", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBC_ACCENT, { emissive: BBC_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBC_CSS, w: 0.44 });
      reg(hits, b, lid);
    }
    card(2.0, 1.3, -1.9, "cue-word-card", "Choose a cue word", "BENCH · STEADY ·\nHERE", { ry: -0.4, w: 0.36 });
    const dial = group(g, -1.6, 0, 0.55);
    cyl(dial, 0.16, 0.16, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const dialArrow = box(dial, 0.03, 0.02, 0.13, 0, 0.92, 0.08, BBC_ACCENT, { emissive: BBC_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(dial, "Focus dial", 0, 1.12, 0, { css: BBC_CSS, w: 0.28 });
    reg(hits, dial.children[0], "focus-dial");
    const tStand = stand(1.75, 0.8, -0.3);
    const tempo = instrument(tStand, 0, 1.02, 0, { idle: "TEMPO", color: BBC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Composure tempo", 0, 1.22, 0, { css: BBC_CSS, w: 0.3 });
    reg(hits, tempo, "composure-clock");
    stand(0.75, -1.95, 0, 0.9);
    bead(0.75, 1.05, -1.95, "retry-breath-marker", "Breath before play resumes", { w: 0.46 });

    // ------------------------------------------------------------ warning signs, let-it-go board
    bead(-0.75, 0.55, 1.1, "warn-clenched-fists", "Clenched fists", { w: 0.34, r: 0.024 });
    bead(0.9, 0.6, 1.25, "warn-mouthing-off", "Still mouthing off", { w: 0.4, r: 0.024 });
    bead(0.15, 0.9, 1.85, "warn-teammate-egging-on", "Teammate egging it on", { w: 0.42, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "warn-clapping-it-off", "Clapping it off", { w: 0.38, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const bench = group(g, -1.5, 0, 1.9);
    box(bench, 2.0, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.9, 0.9]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const eggingTeammate = standingFigure(g, -0.5, 1.85, { ry: 0.8, cloth: 0x7a3a1a, trousers: 0x2b2f35, atStation: true });
    void eggingTeammate;
    const letGo = group(g, -3.1, 0, 0.75, 1.1);
    for (const sx of [-0.32, 0.32]) cyl(letGo, 0.018, 0.018, 1.4, sx, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(letGo, 0.74, 0.46, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a2430"; cx.font = `700 ${Math.round(h * 0.12)}px Arial`; cx.textAlign = "center";
      cx.fillText("STILL ARGUING IT", w * 0.27, h * 0.16); cx.fillText("LET GO", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const callToken = cyl(letGo, 0.05, 0.05, 0.02, -0.2, 1.16, 0.03, 0xd8261e, { rough: 0.5, seg: 14 });
    callToken.rotation.x = Math.PI / 2;
    holoTag(letGo, "Call token", -0.2, 1.5, 0.03, { css: BBC_CSS, w: 0.3 });
    reg(hits, callToken, "call-token");
    const releaseBin = box(letGo, 0.16, 0.16, 0.01, 0.2, 1.16, 0.02, BBC_ACCENT, { emissive: BBC_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, releaseBin, "release-bin");
    bead(2.35, 0.75, 1.0, "quiet-word-spot", "Quiet word, away from the group", { color: 0xf2c14b, css: "#f2c14b", w: 0.5 });

    // ------------------------------------------------------------ heckling meter, rail escort
    const cStand = stand(-1.3, 1.65, -0.35);
    const heckleMeter = instrument(cStand, 0, 1.02, 0, { idle: "CALM", color: BBC_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Composure through the heckling", 0, 1.22, 0, { css: BBC_CSS, w: 0.44 });
    reg(hits, heckleMeter, "heckle-composure-meter");
    bead(-0.4, 1.5, 2.15, "rail-escort-spot", "Assistant to the rail", { color: 0x59c97b, css: "#59c97b", w: 0.42 });

    // ------------------------------------------------------------ boards, exit, kit
    const log = board(0.6, 0.36, 1.5, 1.72, -3.1, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Cue word · heckling handled", "Baseline · trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.2, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.6, 0.3, 0.4, 2.1, -3.1, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Argue it. Or reset it. Not both."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
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
    hazardCard(-1.85, 1.25, 0.35, "argue-the-call-nose-to-nose", "Let them argue it out?", "GET IN THERE\nAND ARGUE", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "let-the-heckler-keep-going-unanswered", "Let the heckling go on?", "IT'S JUST\nA LOUD FAN", 0.1);
    hazardCard(0.6, 1.25, 1.2, "spilled-drink-left-on-the-baseline", "Leave the spill for later?", "NOBODY'S\nNEAR IT NOW", -0.1);
    hazardCard(1.9, 1.25, 0.35, "bench-empties-onto-the-court", "Send the bench over?", "EVERYBODY\nGET OUT THERE", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 1.65, 1.55, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 1.65, 2.1, 1.55, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void dialArrow; void fans; void bleacherRows; void spill;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, -1.3),

      onStepComplete(step) {
        if (step.id === "scan-the-stands-for-trouble") spill.visible = false;
        if (step.id === "turn-focus-back-to-the-bench") dialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "let-the-call-go") callToken.position.set(0.2, 1.16, 0.02);
        if (step.id === "log-the-composure-session") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Routine held through the heckling", "Baseline checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "player-nose-to-nose-with-the-official") {
          heatedPlayer.position.set(0.3, 0, -1.18);
          officialArm.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.6, rough: 0.4 });
        }
        if (it.id === "heckler-leans-over-the-rail") {
          heckler.position.set(-0.2, 0, 2.35);
          heckler.rotation.y = Math.PI - 0.3;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "player-nose-to-nose-with-the-official") {
          heatedPlayer.position.set(0.1, 0, -1.15);
          officialArm.material = mat(0x2b2f35, { rough: 0.5 });
          paintGuide("That was the right call — a body between them settled it before the whistle had to.");
        }
        if (it.id === "heckler-leans-over-the-rail") {
          heckler.position.set(-0.4, 0, 2.55);
          heckler.rotation.y = Math.PI;
          assistant.position.set(-0.6, 0, 2.1); assistant.rotation.y = Math.PI;
          paintGuide("Handled calmly — the rail is quiet again and the bench never had to hear another word of it.");
        }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "composure-tempo") {
          const ok = gg.t >= 0.4 && gg.t <= 0.58;
          repaint(tempo.userData.screen, signFace(ok ? "STEADY" : gg.t < 0.4 ? "RUSHED" : "STALLED", { bg: "#26120c", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff0ea", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-composure-through-the-heckling") {
          const ok = tr.v >= 0.38 && tr.v <= 0.62;
          repaint(heckleMeter.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.38 ? "FLAT" : "BOILING", { bg: "#26120c", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff0ea", scale: 0.48 }));
        }
      },
    };
  },
};
