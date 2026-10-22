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

// SmartCiti.X~ Basketball Fundamentals VR — the final possession, decided
// under pressure. The clock winding down changes nothing about what the
// right basketball read is; it only changes how hard that read is to make
// calmly. What is taught here is the decision hierarchy a coach draws up
// before the ball is even inbounded — read the defense, find the actual
// open teammate, take your own shot last, not first — and the composure it
// takes for a young player to run that hierarchy instead of freezing or
// forcing a shot the moment the pressure shows up.
//
// Sited generically in the gym-court district; the team, the opponent and
// the score are invented. No research finding or statistic is asserted, and
// no game outcome is promised — the routine is taught as a decision-making
// practice, not a guarantee the shot goes in.

const BBQ_ACCENT = 0xffe066;
const BBQ_CSS = "#ffe066";

export const SIM_BB_FINAL_POSSESSION_DECISION_UNDER_PRESSURE = {
  id: "bb-final-possession-decision-under-pressure",
  index: "348",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on developing every player's decision-making rather than funnelling every close game to one player; the Association for Applied Sport Psychology's guidance on decision-making under pressure and a read-in-order hierarchy a young athlete can actually run with a clock winding down; NFHS basketball rules on game administration and timing for a possession that has to be timed and called correctly; CDC Heads Up for a knock to the head taken diving for a loose ball late in a close game; the American Red Cross first aid course for checking a player over before sending them back in for a final possession; the U.S. Center for SafeSport for how a player who misses the final shot is treated afterwards",
  name: "Final Possession, Decision Under Pressure",
  title: simTitle("Final Possession, Decision Under Pressure"),
  tagline: "The clock winding down does not change what the right read is, only how hard it is to make calmly — a decision hierarchy read in order beats a forced shot every time",
  accent: BBQ_ACCENT,
  accentCss: BBQ_CSS,
  parSeconds: 335,
  footprint: 2.6,
  badge: { id: "read-it-dont-force-it", name: "Read It, Don't Force It", note: "A final possession run through the decision hierarchy in order, calm under the clock instead of forced into the first option that showed up" },

  supportLine: "your league's coach coordinator, or the assistant and athletic trainer who were on the bench with you for the final possession — a close finish is worth talking through afterwards whichever way it went",

  game: system({
    name: "Final Possession Board",
    currency: "READ POINTS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Decision Mentor"],
    badges: [
      { id: "clear-floor-first", name: "Clear Floor First", note: "Every hazard on the floor found before the final possession starts", test: AWARD.stepClean("scan-the-floor-before-the-final-possession") },
      { id: "no-forced-shot", name: "No Forced Shot", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "steady-under-the-clock", name: "Steady Under the Clock", note: "Shot-clock urgency and composure through the possession both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unshaken", name: "Unshaken", note: "Held composure in band through the whole final possession", test: AWARD.unbroken },
      { id: "quick-read", name: "Quick Read", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "let-the-clock-run-with-no-reset-check": "You started the final possession without confirming the game clock and shot clock were actually set correctly. NFHS rules on game administration exist because a possession played against a clock nobody checked can be argued, replayed or protested after the fact, and a young team's biggest moment of the season deserves a clock that was actually verified before the ball was inbounded.",
    "call-a-play-only-for-one-star-player-every-time": "You drew up the final shot for the same player every single time regardless of what the defense actually showed. USA Basketball's youth development guidelines are built around every player learning to read the game, and always funnelling the last shot to one player teaches everyone else on the floor that their read of the defense never actually matters.",
    "push-a-player-back-in-after-a-hard-fall-to-finish-the-possession": "You sent a player who took a hard fall diving for the loose ball straight back in to finish the final possession without anyone checking on them first. CDC Heads Up is explicit that any knock to the head gets the player out of play and evaluated, and the importance of the moment on the scoreboard changes none of that — a possession is never worth risking a second hit on a player who has not been checked.",
    "berate-the-player-who-missed-the-final-shot": "You yelled at the player who missed the final shot in front of the whole team the moment it happened. The U.S. Center for SafeSport's standard for correction is calm and private, and a player who just took the pressure shot the coach's own hierarchy sent them into does not need a public verdict on the result — they need the same composure routine every other miss in this programme gets.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the possession once the read has run and the team has regrouped — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-floor-before-the-final-possession", kind: "find", noHint: true,
      targets: ["clock-operator-unconfirmed", "trailing-shoelace-under-pressure", "help-defender-cheating-off-ball"],
      itemNames: {
        "clock-operator-unconfirmed": "the scorer's table clock, not yet confirmed",
        "trailing-shoelace-under-pressure": "a player with a shoelace already coming untied",
        "help-defender-cheating-off-ball": "a help defender already cheating off the ball",
      },
      itemNotes: {
        "clock-operator-unconfirmed": "A final possession played against a clock nobody confirmed is a possession that can be argued after the fact. Check it before the inbound.",
        "trailing-shoelace-under-pressure": "A loose lace with the game on the line is a rolled ankle on the exact cut the play calls for. Tie it before the inbound, not during it.",
        "help-defender-cheating-off-ball": "A defender already sagging off their assignment is telling you exactly who is going to be open. That is the read the whole play should be built around.",
      },
      decoyNotes: {
        "bench-standing-calmly": "A bench standing and watching calmly is exactly the composure this possession needs. Look for what still needs attention.",
      },
      title: "Scan the floor before the final possession",
      cue: "Look at the clock, the floor and the defense. Mark what has to be fixed and what the defense is already telling you.",
      why: "The seconds before a final possession are not just about calling a play, they are the last chance to catch a clock nobody verified, a lace about to come undone on the exact cut the play needs, and a defensive tendency that tells you who is actually going to be open — all three read in the same glance before the ball is even inbounded.",
    },
    {
      id: "call-timeout-or-play-through", kind: "select", target: "timeout-decision-card",
      title: "Decide: call the timeout, or play through",
      cue: "Post the call: use the last timeout to set the play, rather than letting the possession start unorganised.",
      why: "A timeout used to set a clear play and a clear decision hierarchy is worth more with the game on the line than saving it for a moment that may never come. Deciding this deliberately, rather than by habit or hesitation, is the first read of the possession and it happens before the ball ever moves.",
    },
    {
      id: "post-the-decision-hierarchy", kind: "select", target: "hierarchy-card",
      title: "Post the decision hierarchy before the huddle breaks",
      cue: "Put up the order: read one is the open teammate, read two is the closeout you can drive, read three is your own shot, last.",
      why: "The Association for Applied Sport Psychology's guidance on decision-making under pressure is built on giving a player an order to read through rather than a single instruction to follow, because a clock winding down narrows attention fast — a hierarchy read in order still works when a single plan does not survive first contact with what the defense actually shows.",
    },
    {
      id: "build-the-final-play-in-order", kind: "sequence",
      targets: ["play-screen", "play-cut", "play-spacing", "play-shot-options"],
      itemNames: {
        "play-screen": "set the screen",
        "play-cut": "cut off the screen",
        "play-spacing": "space the floor",
        "play-shot-options": "read the shot options last",
      },
      title: "Build the final play in order",
      cue: "Screen first, then the cut off it, then the floor spaced, then the shot options read last.",
      why: "Each part of the play sets up the next: the screen has to be set before the cut off it means anything, the floor has to be spaced before the cutter has anywhere to go, and the shot options are read last because they depend on how the defense actually reacted to everything that came before — reading them first is guessing before the defense has shown you anything.",
      outOfOrderNote: "Out of order. The screen comes first — a cut with no screen set is just running, and reading shot options before the floor is spaced is reading a picture that has not developed yet.",
    },
    {
      id: "turn-to-the-called-set", kind: "turn", target: "play-call-dial",
      title: "Turn the board to the play actually being called",
      cue: "Turn the play-call dial to the set you are calling — the whole team sees the same call, not five different guesses.",
      turn: { turns: 0.5, axis: "y", label: "SET CALLED" },
      why: "A play called out loud in a loud gym gets misheard by at least one player, and a final possession run on five different guesses about what was called is not a play at all. Turning the dial to a visible call that everyone in the huddle can actually see removes the guessing before the ball is ever inbounded.",
    },
    {
      id: "hold-the-huddle-quiet-to-hear-the-call", kind: "hold", target: "huddle-marker", seconds: 6,
      title: "Hold the huddle quiet long enough to hear the call",
      cue: "Everyone quiet, eyes on the coach, while the call is actually given — hold here, no side conversations.",
      why: "A huddle that is still talking while the coach is calling the play means at least one player steps onto the floor not actually knowing what they are supposed to do. Holding the huddle quiet long enough for the call to be heard, completely, by every player, is what makes the play that follows an actual plan instead of four players guessing and one player who heard it.",
      holdBreakNote: "The huddle broke before the call finished. Hold it quiet a few more seconds so everyone actually hears the whole call.",
    },
    {
      id: "read-the-shot-clock-urgency", kind: "gauge", target: "shot-clock-gauge",
      title: "Read the shot-clock urgency before committing to a decision",
      cue: "Commit when the urgency reads timed right — not rushed before the action develops, not so late the clock decides for you.",
      gauge: {
        label: "URGENCY", speed: 0.62, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "rushed — the play hasn't developed" : t <= 0.6 ? "timed right — decide now" : "late — the clock is deciding for you"),
        missNote: "Outside the band. Deciding too soon means the play has not developed enough to show the real read; deciding too late lets the clock make the decision instead of the player. Find timed right and commit.",
      },
      why: "A decision made before the play has developed is a guess dressed up as a read, and a decision left until the last half-second is not a decision at all — it is whatever shot is available when the buzzer is about to sound. Reading the urgency honestly, rather than by instinct alone, is what keeps a player deciding on purpose instead of by accident.",
    },
    {
      id: "read-the-defense-and-choose-the-right-option", kind: "select", target: "read-choice-card",
      title: "Read the defense and choose the option the hierarchy points to",
      cue: "Post the read: the help defender collapsed, so the ball goes to the teammate that left open, not to the first shot available.",
      why: "This is the moment the whole hierarchy was built for: the defense has shown its hand, and the read points to a specific teammate rather than whichever option happens to feel most familiar under pressure. Choosing the option the actual defense created, not the option that was planned before anyone moved, is what decision-making under pressure means in practice.",
    },
    {
      id: "spot-the-signs-of-panic", kind: "find", noHint: true,
      targets: ["panic-freezing-with-the-ball", "panic-forcing-a-shot-early", "panic-not-calling-for-it"],
      itemNames: {
        "panic-freezing-with-the-ball": "a player freezing with the ball, no decision coming",
        "panic-forcing-a-shot-early": "a player forcing a contested shot before the play develops",
        "panic-not-calling-for-it": "the open teammate not calling for the ball at all",
      },
      itemNotes: {
        "panic-freezing-with-the-ball": "Freezing with the ball and the clock running is the pressure winning. A calm, loud call from the bench can restart the read before the clock does it for them.",
        "panic-forcing-a-shot-early": "A shot forced before the defense has actually reacted is the hierarchy skipped entirely. That is exactly what the read-in-order routine exists to prevent.",
        "panic-not-calling-for-it": "An open teammate who stays silent might as well be covered. Calling for the ball is part of making the read work for the whole team, not just the one holding it.",
      },
      decoyNotes: {
        "panic-calm-hands-ready": "A player with calm hands ready to catch and shoot is exactly what the possession needs. Look for who the pressure is actually getting to.",
      },
      title: "Spot the signs of panic under pressure",
      cue: "Watch the floor for who the clock is getting to, not just who has the ball. Mark what needs a calm word from the bench.",
      why: "Panic under pressure rarely looks like nothing happening — it looks like a freeze, a forced shot, or an open teammate who goes quiet exactly when calling for the ball would matter most. Catching those signs from the bench, in real time, is what lets a coach's voice cut through and restart the read before the clock makes the decision for the team.",
    },
    {
      id: "move-the-decision-to-the-open-teammate", kind: "drag",
      title: "Move the ball to the teammate the read actually found open",
      cue: "Drag the decision token from the ball-handler to the open teammate the defense actually left uncovered.",
      target: "decision-token",
      drag: { to: "open-teammate-spot", radius: 0.45, missNote: "Not with the open teammate. A read that finds the open player but does not actually get them the ball is a read that changed nothing — move the decision all the way there." },
      why: "Seeing the right read and actually making it are two different things under pressure, and a physical decision — moving the ball to the teammate the defense left open — is what turns a correct read into a correct possession. A read that stays only in a player's head, with the ball still going somewhere else, is worth nothing to the scoreboard.",
    },
    {
      id: "quiet-word-before-the-inbound", kind: "select", target: "quiet-word-spot",
      title: "Give the player taking the last shot a quiet word",
      cue: "Step to the side with the player about to take the final shot — a short, calm word, not more pressure stacked on top.",
      why: "A player about to take a pressure shot does not need reminding how much is riding on it — they already know. A quiet word that keeps things simple and calm is worth more than one more instruction added on top of everything already in their head in the final seconds.",
    },
    {
      id: "hold-composure-through-the-final-possession", kind: "track", target: "possession-composure-meter", seconds: 8,
      title: "Hold composure through the live final possession",
      cue: "Keep the bench and the floor's composure in band as the possession actually plays out — not frozen silent, not shouting over the play.",
      track: {
        start: 0.32, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.15, label: "COMPOSURE",
        readout: (v) => (v < 0.38 ? "frozen — nobody's talking" : v > 0.62 ? "shouting — drowning the call" : "steady through the possession"),
      },
      why: "A bench gone silent from nerves cannot call out a read the player on the floor cannot see for themselves, and a bench shouting over each other drowns out the one voice that might actually help. Holding composure in band on the sideline while the possession plays out live is what keeps the bench useful to the play instead of one more source of pressure.",
      holdBreakNote: "Composure left the band — frozen silent, or shouting over the play. Bring the bench back to steady before the shot goes up.",
    },
    {
      id: "log-the-possession-and-decision", kind: "select", target: "practice-log-board",
      title: "Log the possession and the decision made",
      cue: "Record which read was made, how it was executed, and anything the athletic trainer checked after the loose-ball fall.",
      why: "Which read a player actually made under pressure, how cleanly it was executed and anything the athletic trainer checked after a hard fall are what the next close game needs to build on, whether the shot went in or not — the decision is what gets coached, not only the result on the scoreboard.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "After the possession: how the read looked from the bench, anything either of you saw, and is everybody good to carry on?",
      why: "A close final possession takes something out of the adults on the bench too, win or lose. A short check-in — what did you see, how did the read look from your angle, is anyone worth a follow-up call — keeps the staff working as a team and is exactly the kind of noticing the guide's check-in points to.",
    },
  ],

  interrupts: [
    {
      id: "opposing-team-ices-the-shooter",
      kind: "Iced timeout",
      after: "hold-the-huddle-quiet-to-hear-the-call", delay: 3, seconds: 12,
      alert: "The opposing team calls a quick timeout right as your huddle breaks, trying to ice your shooter with extra time to think about the pressure.",
      cue: "Get the shooter to the reset-focus spot for a calm word, away from the rest of the huddle's nervous energy.",
      target: "reset-focus-spot",
      why: "A defensive timeout called specifically to give a shooter more time to worry is a real tactic, and the answer is not to let the shooter sit inside a huddle that is now also getting more nervous by the second. Pulling them aside calmly for one settling word keeps the extra time from working the way the other team intended it to.",
      missNote: "The shooter sat in the middle of an increasingly anxious huddle for the whole extra timeout, and stepped out to inbound more rattled than before the whistle blew.",
      wrongNote: "That does not settle the shooter. Get them to the reset-focus spot for a calm word on their own.",
    },
    {
      id: "bench-jumps-up-blocking-the-sideline",
      kind: "Sideline moment",
      after: "hold-composure-through-the-final-possession", delay: 3, seconds: 12,
      alert: "The whole bench jumps to its feet as the possession unfolds, spilling into the sideline and blocking the assistant's view of the play.",
      cue: "Send the assistant to get the bench to sit back down and clear the sideline — the coaching view of the play matters more than the celebration.",
      target: "bench-sit-spot",
      why: "A bench crowding the sideline mid-possession is a real obstruction — it blocks the coaching staff's view of exactly the play everyone needs to be reading clearly, and it is one shove away from spilling onto the live floor. Getting the bench to sit back down calmly, without losing the moment's energy entirely, keeps the sideline clear for the possession that is still being decided.",
      missNote: "The bench stayed crowded onto the sideline for the rest of the possession, and nobody on the coaching staff could actually see the read develop from behind the wall of players.",
      wrongNote: "That does not clear the sideline. Send the assistant to get the bench to sit back down.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, BBQ_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBQ_ACCENT, { emissive: o.color ?? BBQ_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBQ_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#2a2408", accent: o.accent ?? BBQ_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBQ_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(30,26,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBQ_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fffbe6";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#f4eec8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBQ_ACCENT, { rough: 0.5, emissive: o.accent ?? BBQ_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.11) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ lane and hoop
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#2c2810", base2: "#26220c", seam: "rgba(10,8,2,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 1.6, 0.02, 2.2, 0, 0.012, -1.6, 0x2c2810, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xece0c0 });
    const hoop = group(g, 0, 0, -3.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });

    // ------------------------------------------------------------ scoreboard clock
    const scoreboard = group(g, 0, 0, -3.35);
    box(scoreboard, 1.4, 0.5, 0.06, 0, 3.0, 0, 0x1a1e23, { rough: 0.3, metal: 0.4 });
    const clockFace = decal(scoreboard, 1.2, 0.36, 0, 3.0, 0.04, signFace("0:07", { bg: "#0a0a0a", accent: "#ffe066", fg: "#ffe066", scale: 0.7 }), { px: 240, glow: true, ei: 1.6 });
    void clockFace;
    const timeoutLight = ball(scoreboard, 0.05, 0.55, 3.2, 0.04, 0x2b2f35, { emissive: 0x2b2f35, ei: 0.2, seg: 12 });
    bead(0, 0.11, -3.4, "clock-operator-unconfirmed", "Scorer's table clock", { w: 0.4, r: 0.03 });

    // ------------------------------------------------------------ floor scene
    const laceMarkTeammate = standingFigure(g, 0.6, -1.1, { ry: -1.2, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    bead(0.6, 0.35, -1.1, "trailing-shoelace-under-pressure", "Shoelace coming untied", { w: 0.44, r: 0.03, color: 0xf2c14b, css: "#f2c14b" });
    const helpDefender = standingFigure(g, -1.2, -0.6, { ry: 1.6, cloth: 0x3a3f46, trousers: 0x1a1e23, atStation: true });
    bead(-1.2, 2.0, -0.6, "help-defender-cheating-off-ball", "Help defender cheating off-ball", { w: 0.5 });
    bead(1.6, 0.6, 0.4, "bench-standing-calmly", "Bench standing calmly", { w: 0.42, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const shooter = standingFigure(g, 0.0, -0.35, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    const openTeammate = standingFigure(g, 1.4, -0.9, { ry: -0.6, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    const inboundBall = basketball(g, 0.0, 0.11, -0.35);
    void inboundBall;

    // ------------------------------------------------------------ decision cards, hierarchy
    card(-2.4, 1.4, -2.9, "timeout-decision-card", "Timeout or play through?", "USE THE LAST\nTIMEOUT", { w: 0.42, cw: 0.42 });
    card(-2.4, 1.05, -2.55, "hierarchy-card", "Decision hierarchy", "1 OPEN MAN\n2 DRIVE 3 SHOOT", { w: 0.44, cw: 0.44 });
    const routine = group(g, -2.3, 0, -1.9, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["play-screen", "1 · Set the screen", 0.56], ["play-cut", "2 · Cut off it", 0.82],
      ["play-spacing", "3 · Space the floor", 1.08], ["play-shot-options", "4 · Read the shot last", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBQ_ACCENT, { emissive: BBQ_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBQ_CSS, w: 0.44 });
      reg(hits, b, lid);
    }
    const dial = group(g, -1.6, 0, 0.55);
    cyl(dial, 0.16, 0.16, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const dialArrow = box(dial, 0.03, 0.02, 0.13, 0, 0.92, 0.08, BBQ_ACCENT, { emissive: BBQ_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(dial, "Play-call dial", 0, 1.12, 0, { css: BBQ_CSS, w: 0.34 });
    reg(hits, dial.children[0], "play-call-dial");

    // ------------------------------------------------------------ huddle, shot-clock gauge
    stand(1.2, -0.05, 0, 1.0);
    bead(1.2, 1.15, -0.05, "huddle-marker", "Huddle quiet for the call", { w: 0.46 });
    const tStand = stand(1.75, 0.8, -0.3);
    const urgency = instrument(tStand, 0, 1.02, 0, { idle: "URGENT?", color: BBQ_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Shot-clock urgency", 0, 1.22, 0, { css: BBQ_CSS, w: 0.4 });
    reg(hits, urgency, "shot-clock-gauge");
    card(2.4, 1.3, -0.6, "read-choice-card", "Read the defense", "HELP COLLAPSED.\nBALL TO CORNER.", { ry: -0.5, w: 0.44, cw: 0.44 });

    // ------------------------------------------------------------ panic watch, decision drag
    bead(-0.75, 0.55, 1.1, "panic-freezing-with-the-ball", "Freezing with the ball", { w: 0.42, r: 0.024 });
    bead(0.9, 0.6, 1.25, "panic-forcing-a-shot-early", "Forcing a shot early", { w: 0.42, r: 0.024 });
    bead(0.15, 0.9, 1.85, "panic-not-calling-for-it", "Not calling for the ball", { w: 0.42, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "panic-calm-hands-ready", "Calm hands, ready", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const decisionBoard = group(g, -3.1, 0, 0.75, 1.1);
    for (const sx of [-0.32, 0.32]) cyl(decisionBoard, 0.018, 0.018, 1.4, sx, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(decisionBoard, 0.74, 0.46, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a2430"; cx.font = `700 ${Math.round(h * 0.12)}px Arial`; cx.textAlign = "center";
      cx.fillText("BALL HANDLER", w * 0.27, h * 0.16); cx.fillText("OPEN MAN", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const decisionToken = cyl(decisionBoard, 0.05, 0.05, 0.02, -0.2, 1.16, 0.03, 0xd8641e, { rough: 0.5, seg: 14 });
    decisionToken.rotation.x = Math.PI / 2;
    holoTag(decisionBoard, "Decision token", -0.2, 1.5, 0.03, { css: BBQ_CSS, w: 0.32 });
    reg(hits, decisionToken, "decision-token");
    const openTeammateSpot = box(decisionBoard, 0.16, 0.16, 0.01, 0.2, 1.16, 0.02, BBQ_ACCENT, { emissive: BBQ_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, openTeammateSpot, "open-teammate-spot");
    bead(2.35, 0.75, 1.0, "quiet-word-spot", "Quiet word before the inbound", { color: 0xf2c14b, css: "#f2c14b", w: 0.5 });

    // ------------------------------------------------------------ composure meter, reset spot, bench
    const cStand = stand(-1.3, 1.65, -0.35);
    const composure = instrument(cStand, 0, 1.02, 0, { idle: "CALM", color: BBQ_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Composure through the possession", 0, 1.22, 0, { css: BBQ_CSS, w: 0.5 });
    reg(hits, composure, "possession-composure-meter");
    bead(2.6, 1.5, -1.4, "reset-focus-spot", "Reset the shooter's focus", { color: 0x59c97b, css: "#59c97b", w: 0.44 });
    const bench = group(g, -1.5, 0, 1.9);
    box(bench, 2.0, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.9, 0.9]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const benchPlayers = [
      standingFigure(g, -1.9, 1.95, { ry: 0.5, cloth: 0x3a5a7a, trousers: 0x2b2f35, atStation: true }),
      standingFigure(g, -0.9, 1.95, { ry: -0.5, cloth: 0x3a5a7a, trousers: 0x2b2f35, atStation: true }),
    ];
    bead(-1.4, 2.35, 1.95, "bench-sit-spot", "Bench sits back down", { color: 0x59c97b, css: "#59c97b", w: 0.42 });

    // ------------------------------------------------------------ boards, guide
    const log = board(0.6, 0.36, 1.5, 1.72, -3.1, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Read made · how it went", "Trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.2, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.6, 0.3, 0.4, 2.1, -3.1, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Read it. Then decide. Not the other way."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
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
    hazardCard(-1.85, 1.25, 0.35, "let-the-clock-run-with-no-reset-check", "Skip checking the clock?", "IT'S PROBABLY\nRIGHT", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "call-a-play-only-for-one-star-player-every-time", "Same star, every time?", "GIVE THEM\nTHE BALL. ALWAYS", 0.1);
    hazardCard(0.6, 1.25, 1.2, "push-a-player-back-in-after-a-hard-fall-to-finish-the-possession", "Push them back in now?", "WE NEED THEM\nIN THERE", -0.1);
    hazardCard(1.9, 1.25, 0.35, "berate-the-player-who-missed-the-final-shot", "Let them have it?", "HOW DID YOU\nMISS THAT", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 1.65, 1.55, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 1.65, 2.1, 1.55, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void dialArrow; void laceMarkTeammate; void openTeammate; void shooter; void helpDefender;

    return {
      hits,
      footprint: 2.7,
      spawnLook: new THREE.Vector3(0, 1.3, -1.3),

      onStepComplete(step) {
        if (step.id === "scan-the-floor-before-the-final-possession") timeoutLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
        if (step.id === "turn-to-the-called-set") dialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "move-the-decision-to-the-open-teammate") decisionToken.position.set(0.2, 1.16, 0.02);
        if (step.id === "log-the-possession-and-decision") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Read made, composure held", "Player checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "opposing-team-ices-the-shooter") {
          timeoutLight.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4, rough: 0.3 });
        }
        if (it.id === "bench-jumps-up-blocking-the-sideline") {
          for (const bp of benchPlayers) bp.position.y = 0.15;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "opposing-team-ices-the-shooter") {
          timeoutLight.material = mat(0x2b2f35, { emissive: 0x2b2f35, ei: 0.2, rough: 0.5 });
          shooter.position.set(2.6, 0, -1.4); shooter.rotation.y = 1.0;
          paintGuide("That was the right call — a calm word away from the huddle, and the ice never took.");
        }
        if (it.id === "bench-jumps-up-blocking-the-sideline") {
          for (const bp of benchPlayers) bp.position.y = 0;
          paintGuide("Handled quickly — the sideline is clear again and the coaching staff can actually see the play.");
        }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-the-shot-clock-urgency") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(urgency.userData.screen, signFace(ok ? "NOW" : gg.t < 0.42 ? "TOO SOON" : "TOO LATE", { bg: "#2a2408", accent: ok ? "#59c97b" : "#f0645b", fg: "#fffbe6", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-composure-through-the-final-possession") {
          const ok = tr.v >= 0.38 && tr.v <= 0.62;
          repaint(composure.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.38 ? "FROZEN" : "SHOUTING", { bg: "#2a2408", accent: ok ? "#59c97b" : "#f0645b", fg: "#fffbe6", scale: 0.44 }));
        }
      },
    };
  },
};
