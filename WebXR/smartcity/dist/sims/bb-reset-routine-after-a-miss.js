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

// SmartCiti.X~ Basketball Fundamentals VR — the reset routine after a miss.
// Not a shooting drill: the moment right after a shot rims out or a pass
// sails away, when a young player's next few seconds decide whether the
// mistake stays one possession or becomes three. The routine taught here is
// short on purpose — one slow breath, a one-word cue, a physical "let it go"
// and eyes up for the next play — because a routine a player can actually
// use mid-game has to fit inside the time a game gives them.
//
// Sited generically in the gym-court district; the team and players are
// invented. No research finding or statistic is asserted: the routine is
// taught as a practice the coaching bodies below recommend, not as proven
// science.

const BBM_ACCENT = 0x6fb8ff;
const BBM_CSS = "#6fb8ff";

export const SIM_BB_RESET_ROUTINE_AFTER_A_MISS = {
  id: "bb-reset-routine-after-a-miss",
  index: "343",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on positive, mistake-tolerant coaching that keeps young players engaged after an error; the Association for Applied Sport Psychology's guidance on a short mental reset after a mistake — a breath, a cue word, and a return of attention to the next play; NFHS basketball rules and its sportsmanship expectations for how teammates treat each other after a miss; CDC Heads Up for a knock to the head taken in the scramble that follows a loose ball; the U.S. Center for SafeSport for calm, private, non-shaming correction; the American Red Cross first aid course for a player hurt in that scramble",
  name: "Reset Routine After a Miss",
  title: simTitle("Reset Routine After a Miss"),
  tagline: "One slow breath, a one-word cue, a physical let-it-go and eyes up for the next play — a routine short enough to actually use between one possession and the next",
  accent: BBM_ACCENT,
  accentCss: BBM_CSS,
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "next-play", name: "Next Play", note: "A miss met with the routine instead of a spiral, and the whole bench kept calm around it" },

  supportLine: "your league's coach coordinator, or the assistant and athletic trainer who were on the floor with you — a rough stretch of misses can rattle the adults running the drill as much as the player missing",

  game: system({
    name: "Next Play Board",
    currency: "RESETS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Mindset Mentor"],
    badges: [
      { id: "clear-lane-first", name: "Clear Lane First", note: "Every hazard on the floor found before the first retry", test: AWARD.stepClean("scan-the-room-after-a-miss") },
      { id: "no-pile-on", name: "No Pile-On", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "steady-reset", name: "Steady Reset", note: "Reset tempo and composure through the streak both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unshaken", name: "Unshaken", note: "Held composure in band through the whole cold streak", test: AWARD.unbroken },
      { id: "quick-reset", name: "Quick Reset", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dive-for-the-loose-ball-uncalled": "You let both players dive for the loose ball after the miss without calling it first. Two bodies going to the same spot on the floor at full speed, neither one watching for the other because both are watching the ball, is exactly how a shoulder meets a skull instead of a ball.",
    "played-on-after-the-wall-bang": "You let the player who banged their head on the padded wall chasing the rebound keep going because they said they were fine. Saying you are fine is not a medical opinion — concussion signs can show up minutes later, and a player left in is one more hit away from a second one before anyone has checked.",
    "fifty-makeup-free-throws-as-punishment": "You made the player who missed shoot fifty free throws right then as punishment. Extra reps loaded on as punishment are exactly the unplanned volume youth guidelines warn causes overuse injuries, and they teach the player that a miss is followed by pain, not by a routine they can use in a game.",
    "let-the-mocking-keep-going": "You let teammates keep laughing at the player who missed instead of stepping in. A young athlete's teammates ridiculing a mistake, left unanswered by the adult in charge, is exactly the kind of unwatched moment safe-sport guidance asks coaches to notice and stop before it becomes the story a player tells themselves about their own game.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the reset session once the streak has run and the routine has held — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-room-after-a-miss", kind: "find", noHint: true,
      targets: ["post-loose-ball", "post-chair-in-lane", "post-player-frozen"],
      itemNames: {
        "post-loose-ball": "the loose ball still rolling free",
        "post-chair-in-lane": "a folding chair left in the lane",
        "post-player-frozen": "a player frozen, staring at the rim",
      },
      itemNotes: {
        "post-loose-ball": "A ball still rolling after the miss is under the next diving foot. Rack it before anyone chases the rebound.",
        "post-chair-in-lane": "A chair in the lane is exactly where the next rebound and the next landing both happen. Fold it and take it to the wall.",
        "post-player-frozen": "That is the moment the routine is for. Notice it now, before it turns into three more bad possessions.",
      },
      decoyNotes: {
        "post-player-jogging-back": "A player already jogging back on defence has already reset. Look for what is still unsettled.",
      },
      title: "Scan the room in the first seconds after a miss",
      cue: "Look at the floor and at the player who missed. Mark what has to be fixed and what has to be noticed.",
      why: "A coach's first job after a miss is not the shot, it is the room: a loose ball and a stray chair are the next injury waiting to happen, and a player standing frozen and staring at the rim is the moment the whole reset routine exists for. Both are read in the same first glance, before either one gets worse.",
    },
    {
      id: "name-the-miss-calmly", kind: "select", target: "coach-cue-board",
      title: "Name the miss calmly, out loud",
      cue: "Post the calm line: 'Miss happens. Reset. Next play.' — said the same flat, even way every time.",
      why: "The coach's own reaction is the first cue every player on the floor reads. A raised voice or a long sigh turns the miss into a bigger event than it was; a flat, calm sentence said the same way every time tells the team that a miss is a normal part of the game and the routine, not the panic, is what happens next.",
    },
    {
      id: "breath-after-the-miss", kind: "hold", target: "breath-marker", seconds: 6,
      title: "Hold one slow breath before anything else",
      cue: "Player stops, takes one slow breath in and a longer one out — hold here and watch it happen, no talking over it.",
      why: "The Association for Applied Sport Psychology's guidance on a short mental reset starts with something physical rather than something said: a slow exhale is the fastest way to bring a body back down from the jolt of a mistake, so that the next decision — the pass, the shot, the sprint back — is made by the player's skill and not by the adrenaline of the miss.",
      holdBreakNote: "The breath got cut short before it finished. Let the player take the whole slow breath before the routine moves on.",
    },
    {
      id: "build-the-reset-routine", kind: "sequence",
      targets: ["reset-breath", "reset-cue-word", "reset-let-it-go", "reset-eyes-up"],
      itemNames: {
        "reset-breath": "one slow breath",
        "reset-cue-word": "say the cue word",
        "reset-let-it-go": "physically let the miss go",
        "reset-eyes-up": "eyes up for the next play",
      },
      title: "Build the reset routine in order",
      cue: "Breath first, then the cue word, then a physical let-it-go, then eyes up and back into the play.",
      why: "Each part of the routine prepares the next: the breath calms the body so the cue word actually lands instead of getting lost in adrenaline, letting the miss go physically gives the mind something to do besides replay it, and only then are the player's eyes actually free to find the next play instead of the last one.",
      outOfOrderNote: "Out of order. The breath comes first — a cue word said to a racing body does not stick, and eyes up before the miss is let go just means watching the next play through the last one.",
    },
    {
      id: "choose-a-cue-word", kind: "select", target: "cue-word-card",
      title: "Choose one short cue word",
      cue: "Pick a cue word short enough to say to yourself mid-game — 'Next', not a whole sentence.",
      why: "A cue word works because it is short enough to say silently between one possession and the next, and specific enough to mean something the player has practised. A vague 'forget it' gives the mind nothing to do; a single practised word gives it a job.",
    },
    {
      id: "call-the-next-play", kind: "turn", target: "play-dial",
      title: "Turn attention to the next play",
      cue: "Turn the play dial to call the next action — the routine ends pointed forward, not back at the miss.",
      turn: { turns: 0.5, axis: "y", label: "NEXT PLAY" },
      why: "Turning the dial to an actual next action — a set play, a defensive assignment — gives the routine somewhere concrete to end. A reset that stops at 'calm down' leaves a player calm and still standing still; one that ends on the next play sends them back into the game with something specific to do.",
    },
    {
      id: "reset-tempo", kind: "gauge", target: "reset-clock",
      title: "Keep the reset at the right tempo",
      cue: "Commit when the reset reads steady — not skipped, not dragged out.",
      gauge: {
        label: "TEMPO", speed: 0.62, green: [0.4, 0.58],
        readout: (t) => (t < 0.4 ? "rushed — skipped the breath" : t <= 0.58 ? "steady — back in the play" : "stalled — still dwelling"),
        missNote: "Outside the band. Rushed skips the breath that makes the rest of the routine work; stalled means missing the next possession entirely. Find steady and commit.",
      },
      why: "A reset that is rushed skips straight past the breath that calms the body, so the cue word lands on a nervous system that never came down; a reset that is stalled keeps the player dwelling long enough to miss the next possession. The routine only works run at its own pace — not instant, not endless.",
    },
    {
      id: "hold-the-breath-before-the-retry", kind: "hold", target: "retry-breath-marker", seconds: 5,
      title: "Hold the breath again before the next attempt",
      cue: "After a short cold streak, the same one breath before the retry — hold it here, no rushing the redo.",
      why: "The routine only matters if it gets used the moment it is needed most, which is the next attempt right after a miss that stung, not only in the calm of practice. Holding the same breath before the retry is what turns a routine talked about into a routine a player actually reaches for on the second miss and the third.",
      holdBreakNote: "The retry started before the breath finished. Hold it the whole way through — the shot can wait one more second.",
    },
    {
      id: "spot-the-spiral", kind: "find", noHint: true,
      targets: ["spiral-head-down", "spiral-blaming-a-teammate", "spiral-forcing-the-next-shot"],
      itemNames: {
        "spiral-head-down": "a player walking back with their head down",
        "spiral-blaming-a-teammate": "a player blaming a teammate for the last play",
        "spiral-forcing-the-next-shot": "a player forcing the very next shot too quickly",
      },
      itemNotes: {
        "spiral-head-down": "That posture is the first sign the routine did not land. Go to the quiet word, not a lecture.",
        "spiral-blaming-a-teammate": "Blame is the mind looking for somewhere to put the miss besides itself. Redirect gently to the routine.",
        "spiral-forcing-the-next-shot": "Forcing the next shot is the reset skipped entirely. Bring them back to the breath before the shot after that.",
      },
      decoyNotes: {
        "spiral-asking-for-the-ball-again": "Asking for the ball again after a miss is confidence, not a spiral. Look for what is still unsettled.",
      },
      title: "Spot the signs of a spiral, not just the misses",
      cue: "Watch how each player carries a miss, not just whether the next shot goes in. Mark what needs the routine.",
      why: "A cold streak is usually an emotional spiral wearing a shooting slump's clothes: it shows up in body language and blame before it shows up on the scoreboard. Catching it there — the head down, the blame, the forced next shot — lets a coach bring the routine back in before three misses become ten.",
    },
    {
      id: "let-the-miss-go", kind: "drag", target: "miss-token",
      title: "Physically let the miss go",
      cue: "Drag the miss token from the 'carrying it' side of the board to the 'let go' bin.",
      drag: { to: "release-bin", radius: 0.45, missNote: "Still on the 'carrying it' side. A miss talked about but not physically moved off the board is a miss still being carried — move it all the way to the bin." },
      why: "Letting a mistake go is an abstract idea to a young player, and abstract ideas are hard to actually do under pressure. A physical action — moving a token off the board — gives the mental step something concrete to stand for, which is easier to remember and easier to repeat than a phrase alone.",
    },
    {
      id: "quiet-word-away-from-the-group", kind: "select", target: "quiet-word-spot",
      title: "Give a struggling player a quiet word, not a lecture",
      cue: "Step to the side with the player who is spiralling — a short, calm sentence, away from the rest of the team.",
      why: "A correction given quietly, one to one, and briefly is heard; the same words said loudly in front of the team become a second, public mistake to carry. Calm, private and observable correction is the kind safe-sport guidance asks of adults working with young athletes, and it is also simply the version a player can actually hear.",
    },
    {
      id: "hold-composure-through-the-streak", kind: "track", target: "streak-composure-meter", seconds: 8,
      title: "Hold composure through a cold streak",
      cue: "Keep the bench and the player's composure in band through several misses in a row — not flat and checked out, not boiling over.",
      track: {
        start: 0.32, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.15, label: "COMPOSURE",
        readout: (v) => (v < 0.38 ? "flat — switched off" : v > 0.62 ? "boiling — tempers rising" : "steady through the streak"),
      },
      why: "A cold streak tests the routine more than a single miss does, because each new miss makes the next reset harder to reach for. Holding the bench's composure in band — not letting frustration boil over, not letting the player check out and go flat — is what keeps the routine available for the fifth miss the same way it was for the first.",
      holdBreakNote: "Composure left the band — boiling over, or gone flat. Bring it back to steady before the next attempt.",
    },
    {
      id: "log-the-reset-session", kind: "select", target: "practice-log-board",
      title: "Log the reset session",
      cue: "Record the cue word used, how the streak was handled, the wall bang and anything the athletic trainer saw.",
      why: "The cue word a player settled on, how a cold streak was handled and anything the athletic trainer noticed are what the next practice needs to build on. Written down at the time, the log is the fairest record for the player and the clearest starting point for coaching the same routine again next week.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: how the cold streak felt to manage, anything seen after the wall bang, and is everybody good to carry on?",
      why: "Coaching a player through a rough stretch of misses takes something out of the adults running the drill too. A short check-in — what did you see, how did that feel to manage, is anyone worth a follow-up call — keeps the staff working as a team and is exactly the kind of noticing the guide's check-in points to.",
    },
  ],

  interrupts: [
    {
      id: "teammates-mock-the-miss",
      kind: "Sideline moment",
      after: "breath-after-the-miss", delay: 3, seconds: 12,
      alert: "Two players on the bench are loudly mocking the miss, and the laughing is spreading down the row.",
      cue: "Step to the mocking teammates, quiet and calm — not a lecture to the whole bench, just the two of them.",
      target: "quiet-teammate-spot",
      why: "Mockery left to run builds the story a player tells themselves about their own game far faster than the miss itself does. Going straight to the two players who started it, calmly and without turning it into a speech for the whole bench, stops it before it spreads any further down the row.",
      missNote: "The laughing kept going, and by the time it stopped on its own half the bench had joined in. The player who missed heard every second of it.",
      wrongNote: "That does not reach the two who started it. Go to the mocking teammates directly, quiet and calm.",
    },
    {
      id: "fire-alarm-during-the-reset",
      kind: "Fire alarm",
      after: "hold-the-breath-before-the-retry", delay: 3, seconds: 12,
      alert: "The fire alarm sounds mid-retry, with the ball still in the shooter's hands and the exit strobe flashing.",
      cue: "Ball down, everybody out through the marked fire exit, headcount outside against the day's list.",
      target: "fire-exit-door",
      why: "The routine's calm is not a reason to finish the attempt first. The ball goes down where it is, the gym empties through the marked exit with an adult at the front and back, and a headcount happens outside — every alarm treated as real, every time, no matter what was mid-motion when it sounded.",
      missNote: "The retry finished before anyone moved, and the group left in a scattered rush instead of together. Outside, the headcount came up short before someone remembered the shooter had stayed to watch the ball go in.",
      wrongNote: "The alarm comes first. Ball down and everybody to the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBM_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBM_ACCENT, { emissive: o.color ?? BBM_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBM_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1c26", accent: o.accent ?? BBM_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBM_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,18,26,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBM_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6ff";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#cfe6f6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBM_ACCENT, { rough: 0.5, emissive: o.accent ?? BBM_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.11) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the lane and hoop
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#123044", base2: "#0f2a3c", seam: "rgba(4,12,18,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 1.6, 0.02, 2.2, 0, 0.012, -1.6, 0x123044, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xc8ddec });
    const ftLine = box(g, 1.6, 0.006, 0.05, 0, 0.025, -0.5, 0xf6f4ee, { rough: 0.6, cast: false });
    void ftLine;
    const hoop = group(g, 0, 0, -3.05);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });

    // ------------------------------------------------------------ post-miss scene
    const looseBall = basketball(g, 0.4, 0.11, -1.2);
    bead(0.4, 0.45, -1.2, "post-loose-ball", "Loose ball", { w: 0.28 });
    const chair = group(g, -0.5, 0, -2.5, 0.3);
    box(chair, 0.4, 0.04, 0.38, 0, 0.45, 0, 0x5a6068, { rough: 0.6, metal: 0.3 });
    box(chair, 0.4, 0.4, 0.03, 0, 0.66, -0.18, 0x5a6068, { rough: 0.6, metal: 0.3 });
    for (const sx of [-0.18, 0.18]) box(chair, 0.03, 0.45, 0.34, sx, 0.22, 0, 0x2b2f35, { rough: 0.5, metal: 0.5 });
    bead(-0.5, 1.0, -2.5, "post-chair-in-lane", "Chair in the lane", { w: 0.36 });
    const shooter = standingFigure(g, 0.0, -0.35, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    bead(0.0, 2.02, -0.15, "post-player-frozen", "Frozen, staring at the rim", { w: 0.48 });
    bead(-0.9, 0.6, -1.0, "post-player-jogging-back", "Already jogging back", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ the routine props
    card(-1.35, 1.4, -2.9, "coach-cue-board", "Coach's calm line", "MISS HAPPENS.\nRESET. NEXT PLAY.", { w: 0.42, cw: 0.4 });
    stand(1.15, -0.15, 0, 1.0);
    bead(1.15, 1.15, -0.15, "breath-marker", "Breath after the miss", { w: 0.42 });
    const routine = group(g, -2.3, 0, -2.15, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["reset-breath", "1 · One slow breath", 0.56], ["reset-cue-word", "2 · Say the cue word", 0.82],
      ["reset-let-it-go", "3 · Let it go", 1.08], ["reset-eyes-up", "4 · Eyes up, next play", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBM_ACCENT, { emissive: BBM_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBM_CSS, w: 0.42 });
      reg(hits, b, lid);
    }
    card(1.9, 1.3, -2.0, "cue-word-card", "Choose a cue word", "NEXT · RESET ·\nHERE", { ry: -0.4, w: 0.36 });
    const dial = group(g, -1.6, 0, 0.6);
    cyl(dial, 0.16, 0.16, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const dialArrow = box(dial, 0.03, 0.02, 0.13, 0, 0.92, 0.08, BBM_ACCENT, { emissive: BBM_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(dial, "Next-play dial", 0, 1.12, 0, { css: BBM_CSS, w: 0.32 });
    reg(hits, dial.children[0], "play-dial");
    const tStand = stand(1.7, 0.85, -0.35);
    const tempo = instrument(tStand, 0, 1.02, 0, { idle: "TEMPO", color: BBM_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Reset tempo", 0, 1.22, 0, { css: BBM_CSS, w: 0.28 });
    reg(hits, tempo, "reset-clock");
    stand(0.75, -1.9, 0, 0.9);
    bead(0.75, 1.05, -1.9, "retry-breath-marker", "Breath before the retry", { w: 0.44 });

    // ------------------------------------------------------------ spiral watch, let-it-go board
    bead(-0.8, 0.55, 1.1, "spiral-head-down", "Head down, walking back", { w: 0.42, r: 0.024 });
    bead(0.85, 0.6, 1.25, "spiral-blaming-a-teammate", "Blaming a teammate", { w: 0.4, r: 0.024 });
    bead(0.1, 0.3, -0.2, "spiral-forcing-the-next-shot", "Forcing the next shot", { w: 0.4, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "spiral-asking-for-the-ball-again", "Asking for the ball again", { w: 0.42, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const letGo = group(g, -3.0, 0, 0.8, 1.1);
    for (const sx of [-0.32, 0.32]) cyl(letGo, 0.018, 0.018, 1.4, sx, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(letGo, 0.74, 0.46, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a2430"; cx.font = `700 ${Math.round(h * 0.12)}px Arial`; cx.textAlign = "center";
      cx.fillText("CARRYING IT", w * 0.27, h * 0.16); cx.fillText("LET GO", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const missToken = cyl(letGo, 0.05, 0.05, 0.02, -0.2, 1.16, 0.03, 0xd8261e, { rough: 0.5, seg: 14 });
    missToken.rotation.x = Math.PI / 2;
    holoTag(letGo, "Miss token", -0.2, 1.5, 0.03, { css: BBM_CSS, w: 0.3 });
    reg(hits, missToken, "miss-token");
    const releaseBin = box(letGo, 0.16, 0.16, 0.01, 0.2, 1.16, 0.02, BBM_ACCENT, { emissive: BBM_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, releaseBin, "release-bin");
    bead(2.3, 0.75, 1.0, "quiet-word-spot", "Quiet word, away from the group", { color: 0xf2c14b, css: "#f2c14b", w: 0.5 });

    // ------------------------------------------------------------ composure meter, bench, mocking teammates
    const cStand = stand(-1.3, 1.7, -0.4);
    const composure = instrument(cStand, 0, 1.02, 0, { idle: "CALM", color: BBM_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Composure through the streak", 0, 1.22, 0, { css: BBM_CSS, w: 0.4 });
    reg(hits, composure, "streak-composure-meter");
    const bench = group(g, -1.4, 0, 1.95);
    box(bench, 1.9, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.85, 0.85]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const mockers = [
      standingFigure(g, -1.9, 1.95, { ry: 0.5, cloth: 0x7a3a1a, trousers: 0x2b2f35, atStation: true }),
      standingFigure(g, -0.9, 1.95, { ry: -0.5, cloth: 0x7a3a1a, trousers: 0x2b2f35, atStation: true }),
    ];
    bead(-1.4, 2.35, 1.95, "quiet-teammate-spot", "Mocking teammates", { color: 0xf0645b, css: "#f0645b", w: 0.44 });

    // ------------------------------------------------------------ boards, exit, kit
    const log = board(0.6, 0.36, 1.45, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Cue word · streak handling", "Wall bang · trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const exit = group(g, -3.45, 0, 1.3, Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");

    // ------------------------------------------------------------ the guide's board (shared/ei-guide.js)
    const guide = board(0.6, 0.3, 0.4, 2.05, -3.05, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Miss it. Reset it. Next play."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
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
    hazardCard(-1.8, 1.25, 0.35, "dive-for-the-loose-ball-uncalled", "Both dive for it, uncalled?", "GO GET IT\nNO CALL", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "played-on-after-the-wall-bang", "Fine — keep them in?", "SAID THEY'RE\nFINE, PLAY ON", 0.1);
    hazardCard(0.6, 1.25, 1.2, "fifty-makeup-free-throws-as-punishment", "Fifty makeup shots now?", "MISS = FIFTY\nMORE, NOW", -0.1);
    hazardCard(1.85, 1.25, 0.35, "let-the-mocking-keep-going", "Let the laughing go on?", "IT'S JUST\nJOKING AROUND", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.4, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.4, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void assistant; void dialArrow;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "scan-the-room-after-a-miss") { looseBall.visible = false; chair.position.set(-2.9, 0, -2.0); }
        if (step.id === "call-the-next-play") dialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "let-the-miss-go") missToken.position.set(0.2, 1.16, 0.02);
        if (step.id === "log-the-reset-session") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Routine held through the streak", "Wall bang checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "teammates-mock-the-miss") for (const m of mockers) m.rotation.y += 0.3;
        if (it.id === "fire-alarm-during-the-reset") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "teammates-mock-the-miss") {
          for (const m of mockers) m.position.set(m.position.x - 0.6, 0, m.position.z + 0.5);
          paintGuide("That was the right call — quiet, quick, and it landed before it spread.");
        }
        if (it.id === "fire-alarm-during-the-reset") { exitLeaf.rotation.y = 1.2; exitLeaf.position.x = -0.35; }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "reset-tempo") {
          const ok = gg.t >= 0.4 && gg.t <= 0.58;
          repaint(tempo.userData.screen, signFace(ok ? "STEADY" : gg.t < 0.4 ? "RUSHED" : "STALLED", { bg: "#0c1c26", accent: ok ? "#59c97b" : "#f0645b", fg: "#eaf6ff", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-composure-through-the-streak") {
          const ok = tr.v >= 0.38 && tr.v <= 0.62;
          repaint(composure.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.38 ? "FLAT" : "BOILING", { bg: "#0c1c26", accent: ok ? "#59c97b" : "#f0645b", fg: "#eaf6ff", scale: 0.48 }));
        }
      },
    };
  },
};
