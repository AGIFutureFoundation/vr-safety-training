import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — coach feedback and growth
// mindset. A film session can build a player up or take them apart, and the
// difference is rarely the mistake on the screen — it is whether the
// correction that follows names one specific, fixable thing or turns into a
// verdict on the player themselves. What is taught here is a feedback shape
// the Association for Applied Sport Psychology recommends — the behaviour,
// its impact, one actionable fix, and something genuine about effort to
// build on — and a player's ability to take a correction without it
// becoming a collapse.
//
// Sited generically in the gym-court district; the team, the players and the
// footage are invented. No research finding or statistic is asserted, and no
// player is ever compared to a real athlete or shown film of anyone real.

const BBI_ACCENT = 0x53d0c0;
const BBI_CSS = "#53d0c0";

export const SIM_BB_COACH_FEEDBACK_AND_GROWTH_MINDSET = {
  id: "bb-coach-feedback-and-growth-mindset",
  index: "347",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on coaching feedback that builds a young athlete's game rather than their fear of the next mistake; the Association for Applied Sport Psychology's guidance on growth-mindset feedback — the specific behaviour, its impact, one actionable fix, and genuine credit for effort; NFHS basketball rules and its sportsmanship expectations for how a team treats a teammate's mistakes on film as much as on the court; the U.S. Center for SafeSport for private, observable correction rather than a mistake replayed for laughs in front of the team; CDC Heads Up for a knock to the head noticed while walking a correction through at game speed; the American Red Cross first aid course for a player who is unwell or dehydrated sitting through a long review session",
  name: "Coach Feedback and Growth Mindset",
  title: simTitle("Coach Feedback and Growth Mindset"),
  tagline: "The same mistake on film either becomes one specific, fixable thing or a verdict on the player watching it — the difference is entirely in how the correction is given",
  accent: BBI_ACCENT,
  accentCss: BBI_CSS,
  parSeconds: 335,
  footprint: 2.6,
  badge: { id: "correction-not-collapse", name: "Correction, Not Collapse", note: "A hard mistake on film corrected specifically and taken by the player as something to fix, not as who they are" },

  supportLine: "your league's coach coordinator, or the assistant who handled the team side of the room while you ran the review — a player who takes a correction hard is worth a follow-up conversation too",

  game: system({
    name: "Film Room Board",
    currency: "GROWTH POINTS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Feedback Mentor"],
    badges: [
      { id: "clear-room-first", name: "Clear Room First", note: "Every hazard in the film room found before the review starts", test: AWARD.stepClean("scan-the-film-room-before-review") },
      { id: "no-collapse", name: "No Collapse", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "steady-review", name: "Steady Review", note: "Receptiveness and composure through the review both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unshaken", name: "Unshaken", note: "Held the player's composure in band through the rest of the review", test: AWARD.unbroken },
      { id: "quick-review", name: "Quick Review", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "compare-the-player-to-a-teammate": "You told the player watching film that they should just do it the way a specific teammate does. The Association for Applied Sport Psychology's guidance on growth-mindset feedback is built around a player's own progress against their own last attempt, not a comparison to someone else — a comparison teaches a player to measure themselves against people they cannot control instead of a fix they actually can.",
    "give-only-criticism-no-specific-fix": "You listed everything wrong with the play and left the room without naming one specific thing to actually do differently. Feedback with no actionable fix is not coaching, it is a verdict — a player who hears only what went wrong, with nothing concrete to try next time, walks away with the mistake and nothing to replace it with.",
    "leave-the-projector-cable-across-the-walkway": "You left the projector's cable running straight across the walkway between the bench and the screen. A player getting up mid-review to demonstrate a footwork fix, watching the film and not their feet, is exactly who catches a foot on a cable like that, and a room full of chairs makes a fall from a trip worse, not better.",
    "mock-the-mistake-in-front-of-the-team": "You played the blooper clip for the whole team to laugh at instead of reviewing it privately with the player it happened to. The U.S. Center for SafeSport's own standard for correction is that it should be observable and private, not a performance for an audience — a mistake turned into a joke for the team stops being a coaching moment and becomes something that player carries into every game after.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the film session once the review has run and the player has taken the correction — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-film-room-before-review", kind: "find", noHint: true,
      targets: ["cable-across-the-walkway", "player-arms-crossed-already", "empty-water-bottle"],
      itemNames: {
        "cable-across-the-walkway": "the projector cable running across the walkway",
        "player-arms-crossed-already": "the player sitting with arms already crossed",
        "empty-water-bottle": "an empty water bottle on the bench",
      },
      itemNotes: {
        "cable-across-the-walkway": "A cable across the one path between the bench and the screen is a trip waiting for someone standing up to demonstrate a fix. Tape it down or reroute it before anyone moves.",
        "player-arms-crossed-already": "Crossed arms before the film has even started is a player already braced for a verdict, not a conversation. That tells you how to open the review.",
        "empty-water-bottle": "A long film session is still practice time. An empty bottle before the review even starts means somebody needs water before the lights go down.",
      },
      decoyNotes: {
        "player-notebook-ready": "A player with a notebook out, ready to write something down, is exactly the posture the review wants. Look for what actually needs fixing first.",
      },
      title: "Scan the film room before the review starts",
      cue: "Look at the room and at the player. Mark what has to be fixed underfoot and what tells you how they are arriving to this conversation.",
      why: "A film session starts before the first clip plays: a cable across the walkway is a fall waiting to happen the moment someone stands up to demonstrate a fix, an empty water bottle means a player sitting through a long review already thirsty, and crossed arms tell a coach exactly how braced this player already is for what is coming.",
    },
    {
      id: "post-the-feedback-model", kind: "select", target: "feedback-model-card",
      title: "Post the feedback shape before the first clip",
      cue: "Put up the order: the specific behaviour, its impact, one actionable fix, and credit for what is already working.",
      why: "A player who knows the shape a correction is going to take — what happened, why it mattered, one thing to change, and something real about their effort — can actually listen for the fix instead of bracing for however long the criticism is going to run. The order matters as much as the words: process before the sentence starts.",
    },
    {
      id: "pause-before-the-clip-plays", kind: "hold", target: "context-marker", seconds: 5,
      title: "Hold a real pause before the clip plays",
      cue: "Tell the player which clip they are about to see and why, then hold here before hitting play — no surprises, no ambush.",
      why: "A mistake replayed with no warning lands as an ambush no matter how gently the words afterward are chosen. Giving the player a moment to know what they are about to watch, and holding that pause instead of rushing straight to the clip, is what keeps the whole review feeling like coaching instead of a setup.",
      holdBreakNote: "The clip started before the player knew what was coming. Hold the pause and tell them what they are about to see first.",
    },
    {
      id: "build-the-feedback-in-order", kind: "sequence",
      targets: ["fb-specific-behavior", "fb-impact", "fb-actionable-fix", "fb-effort-credit"],
      itemNames: {
        "fb-specific-behavior": "name the specific behaviour",
        "fb-impact": "name its impact on the play",
        "fb-actionable-fix": "give one actionable fix",
        "fb-effort-credit": "credit something real about effort",
      },
      title: "Build the feedback in order",
      cue: "Name the behaviour first, then its impact, then one fix, then real credit for effort.",
      why: "Each part earns the next: naming the exact behaviour keeps the conversation about the play and not the player, naming its impact is what makes the fix worth caring about, one specific fix is something a player can actually go practise, and credit for genuine effort at the end is what keeps a hard correction from reading as a verdict on the whole session.",
      outOfOrderNote: "Out of order. The specific behaviour gets named first — starting with the fix before the player even knows what is being fixed leaves them guessing at what you actually saw.",
    },
    {
      id: "choose-one-fix-not-five", kind: "select", target: "single-fix-card",
      title: "Choose one fix to give, not a list",
      cue: "Post the single actionable correction this review is actually about — not everything that could be improved.",
      why: "A player who leaves a review with five things to fix leaves with none of them, because there is no way to practise five corrections at once. Choosing the one fix that matters most right now, and saving the rest for another day, is what makes a correction something a player can actually go do something with.",
    },
    {
      id: "turn-to-the-right-camera-angle", kind: "turn", target: "angle-dial",
      title: "Turn the film to the angle that actually shows the fix",
      cue: "Turn the angle dial until the clip shows the footwork or the read clearly, not just the ball.",
      turn: { turns: 0.5, axis: "y", label: "ANGLE" },
      why: "A player who can actually see the thing being corrected — the foot that stepped wrong, the gap they missed — believes it faster than a player who is only told about it while looking at a different part of the screen. Turning to the angle that shows the fix clearly does more of the convincing than any sentence a coach says over it.",
    },
    {
      id: "read-the-players-receptiveness", kind: "gauge", target: "receptiveness-gauge",
      title: "Read how open the player is before landing the fix",
      cue: "Commit when the player reads as open — not still bracing, not checked out of the conversation.",
      gauge: {
        label: "OPEN", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "still bracing — too soon" : t <= 0.6 ? "open — land it now" : "checked out — too late"),
        missNote: "Outside the band. Landed too soon, the fix bounces off a player still bracing for criticism; too late, they have already stopped listening. Find open and commit.",
      },
      why: "The exact same correction lands differently depending on when it is given: too soon and a player still bracing for criticism does not actually hear it, too late and a player who has emotionally checked out of the conversation is not listening for anything at all. Reading the moment honestly, rather than by the clock, is what makes the fix worth giving at all.",
    },
    {
      id: "hold-the-quiet-after-the-fix", kind: "hold", target: "landing-marker", seconds: 5,
      title: "Hold a quiet moment for the correction to land",
      cue: "Say the fix once, clearly, then stop talking — hold the quiet here instead of piling on more.",
      why: "A coach who keeps talking after the fix has already been said is not reinforcing it, they are drowning it in more words for a player to sort through. Holding quiet right after the correction gives it room to actually land, and it tells the player the conversation is a fix, not the opening of a longer lecture.",
      holdBreakNote: "The talking started again before the fix had a chance to land. Hold the quiet a few more seconds and let it sit.",
    },
    {
      id: "spot-the-fixed-mindset-signs", kind: "find", noHint: true,
      targets: ["fixed-defensive-excuse", "fixed-comparing-down", "fixed-giving-up-posture"],
      itemNames: {
        "fixed-defensive-excuse": "the player already making an excuse for the mistake",
        "fixed-comparing-down": "the player comparing themselves unfavourably to a teammate, unprompted",
        "fixed-giving-up-posture": "the player's posture reading as ready to give up on the whole session",
      },
      itemNotes: {
        "fixed-defensive-excuse": "An excuse offered before the fix is even finished being said is a sign the correction landed as a verdict, not a fix. Slow down and name the behaviour again, plainly.",
        "fixed-comparing-down": "A player putting themselves down against a teammate is treating one mistake as proof of something bigger. That needs redirecting to the one specific fix, not the whole comparison.",
        "fixed-giving-up-posture": "Slumped shoulders and a player checking out of the room is the fixed-mindset spiral in full — the credit-for-effort part of the feedback shape needs to come back in now, not later.",
      },
      decoyNotes: {
        "fixed-asking-a-clarifying-question": "A player asking exactly what to do differently is the growth-mindset response working. Look for who is not asking anything at all.",
      },
      title: "Spot the signs of a fixed-mindset response",
      cue: "Watch how the player is carrying the correction, not just whether they nodded along. Mark what needs redirecting.",
      why: "A correction can be given exactly right and still land as a verdict if the player was already braced to hear one. Catching a defensive excuse, an unprompted comparison to a teammate, or a posture that has already given up on the session is what tells a coach the feedback needs redirecting back to the one specific, fixable thing before the review goes any further.",
    },
    {
      id: "move-the-mistake-from-identity-to-action", kind: "drag",
      title: "Move the mistake from who-I-am to what-I'll-do",
      cue: "Drag the mistake token from the 'who I am' side of the board to the 'what I'll do differently' side.",
      target: "identity-token",
      drag: { to: "action-bin", radius: 0.45, missNote: "Still on the 'who I am' side. A mistake left there stays a verdict on the player instead of one thing to practise — move it all the way to the action side." },
      why: "A growth mindset is not a feeling a coach can talk a player into — it is treating a mistake as an action to change rather than a fact about who you are. Moving a physical token from one side of the board to the other gives that distinction something concrete to point at, which is easier for a young player to hold onto than the phrase alone.",
    },
    {
      id: "quiet-word-for-the-struggling-player", kind: "select", target: "quiet-word-spot",
      title: "Give a player who took it hard a quiet word",
      cue: "Step to the side with the player who is still struggling with the correction — brief, calm, private.",
      why: "A player who visibly took a correction hard needs to hear, quietly and to them alone, that the mistake is not the whole story of their game. Said privately, it is reassurance that keeps the growth-mindset frame intact; said in front of the team, it becomes one more thing for that player to be self-conscious about.",
    },
    {
      id: "hold-composure-through-the-rest-of-the-review", kind: "track", target: "review-composure-meter", seconds: 8,
      title: "Hold the player's composure through the rest of the review",
      cue: "Keep the player's composure in band through the remaining clips — not shut down, not swinging into overconfidence to cover it.",
      track: {
        start: 0.32, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.15, label: "COMPOSURE",
        readout: (v) => (v < 0.38 ? "shut down — checked out" : v > 0.62 ? "overcorrecting — covering with bravado" : "steady through the rest of the film"),
      },
      why: "One hard correction can either be absorbed and built on or can colour every clip that follows it, either shutting the player down for the rest of the session or pushing them into a defensive bravado that covers the same thing up. Holding composure in band through the remaining clips is what tells a coach the growth-mindset frame actually held past the first fix.",
      holdBreakNote: "Composure left the band — shut down, or overcorrecting with bravado. Bring it back to steady before the next clip.",
    },
    {
      id: "log-the-film-review", kind: "select", target: "practice-log-board",
      title: "Log the film review",
      cue: "Record the fix given, how the player took it, and anything the athletic trainer noticed.",
      why: "The one fix given, how the player actually took the correction and anything the athletic trainer noticed about their state are what the next practice needs to build on. Written down at the time, the log is the fairest record of whether this player needs the same fix reinforced gently or is ready for the next one.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "After the room clears: how the review felt to run, anything either of you saw, and is the player good to rejoin the group?",
      why: "Giving a hard correction and watching a player take it takes something out of the coach delivering it too. A short check-in — what did you see, how did that feel to say, is this player worth a follow-up conversation — keeps the staff working as a team and is exactly the kind of noticing the guide's check-in points to.",
    },
  ],

  interrupts: [
    {
      id: "player-stands-up-to-walk-out",
      kind: "Emotional moment",
      after: "hold-the-quiet-after-the-fix", delay: 3, seconds: 12,
      alert: "The player stands up abruptly, blinking back tears, and moves toward the door as if they are about to walk out of the review entirely.",
      cue: "Point them calmly to the step-outside spot for a minute of air, rather than blocking the door or telling them to sit back down.",
      target: "step-outside-spot",
      why: "A player who needs to step away from a hard correction is not refusing to be coached, they are regulating, and blocking the door or ordering them back into the chair turns a normal reaction into a bigger confrontation. Pointing calmly to a real space to take a minute keeps the moment from escalating and tells the player the room is not going to chase them for having a feeling.",
      missNote: "Nobody offered anywhere to go, and the player either sat back down still holding it in or left the gym entirely with nobody checking on them outside.",
      wrongNote: "That does not give them anywhere to go. Point them to the step-outside spot for a minute of air.",
    },
    {
      id: "the-team-sees-the-clip-and-laughs",
      kind: "Team moment",
      after: "hold-composure-through-the-rest-of-the-review", delay: 3, seconds: 12,
      alert: "The rest of the team wanders past the open door, spots the blooper clip still frozen on the screen, and starts laughing at it.",
      cue: "Send the assistant to turn the screen away and close the door — the review stays between the coach and the player.",
      target: "screen-privacy-spot",
      why: "A private correction stops being private the moment the rest of the team can see the screen and laugh at it, and the damage is done the instant it happens, not after someone finally notices. Sending the assistant to turn the screen away and shut the door immediately is what keeps this review the private conversation it was always supposed to be.",
      missNote: "The laughing kept going for another minute before anyone closed the door, and the player in the review chair heard every second of it.",
      wrongNote: "That does not stop the team from seeing it. Send the assistant to turn the screen away and close the door.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBI_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBI_ACCENT, { emissive: o.color ?? BBI_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBI_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c2622", accent: o.accent ?? BBI_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBI_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,26,24,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBI_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eafff9";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c8f0e6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBI_ACCENT, { rough: 0.5, emissive: o.accent ?? BBI_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };

    // ------------------------------------------------------------ the film room floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#122622", base2: "#0e201c", seam: "rgba(2,10,8,0.5)",
    }), { repeat: 2, px: 384 });
    const floor = box(g, 3.0, 0.02, 2.2, 0, 0.012, -1.3, 0x122622, { rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0xc8ece0 });

    // ------------------------------------------------------------ the screen and bench
    const screenPost = group(g, 0, 0, -3.0);
    box(screenPost, 2.0, 1.3, 0.04, 0, 1.5, 0, 0x1a1e23, { rough: 0.3, metal: 0.3 });
    const screenFace = decal(screenPost, 1.86, 1.16, 0, 1.5, 0.03, (cx, w, h) => {
      cx.fillStyle = "#08201c"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#53d0c0"; cx.lineWidth = 6; cx.strokeRect(20, 20, w - 40, h - 40);
      cx.fillStyle = "#53d0c0"; cx.font = `700 ${Math.round(h * 0.14)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("FILM", w / 2, h / 2);
    }, { px: 480, glow: true, ei: 0.7 });
    void screenFace;
    for (const sx of [-0.9, 0.9]) cyl(screenPost, 0.03, 0.03, 1.5, sx, 0.75, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    const bench = group(g, 0, 0, -0.9);
    box(bench, 1.6, 0.06, 0.4, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.7, 0.7]) box(bench, 0.05, 0.42, 0.34, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const projector = box(g, 0.2, 0.12, 0.2, 0, 1.1, 0.4, 0x2b2f35, { rough: 0.5, metal: 0.4 });
    void projector;
    const cable = box(g, 0.03, 0.006, 2.8, 1.05, 0.006, -0.6, 0x1a1e23, { rough: 0.7, cast: false });
    bead(1.05, 0.24, -0.6, "cable-across-the-walkway", "Projector cable across the walkway", { w: 0.5 });

    // ------------------------------------------------------------ the player watching film
    const reviewPlayer = standingFigure(g, -0.5, -0.75, { ry: 1.3, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    bead(-0.5, 2.0, -0.78, "player-arms-crossed-already", "Arms already crossed", { w: 0.4 });
    const waterBottle = cyl(g, 0.045, 0.045, 0.16, 0.6, 0.52, -0.9, 0xdfe8ee, { rough: 0.2, opacity: 0.6, seg: 12 });
    void waterBottle;
    bead(0.6, 0.66, -0.9, "empty-water-bottle", "Empty water bottle", { color: 0xf2c14b, css: "#f2c14b", w: 0.4 });
    bead(-1.3, 0.6, -1.4, "player-notebook-ready", "Notebook ready", { w: 0.36, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ feedback model, context, sequence
    card(-2.4, 1.4, -2.9, "feedback-model-card", "Feedback shape", "BEHAVIOUR · IMPACT ·\nFIX · EFFORT", { w: 0.44, cw: 0.44 });
    stand(1.2, -0.1, 0, 1.0);
    bead(1.2, 1.15, -0.1, "context-marker", "Pause before the clip plays", { w: 0.46 });
    const routine = group(g, -2.3, 0, -2.1, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["fb-specific-behavior", "1 · Name the behaviour", 0.56], ["fb-impact", "2 · Name the impact", 0.82],
      ["fb-actionable-fix", "3 · One actionable fix", 1.08], ["fb-effort-credit", "4 · Credit the effort", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBI_ACCENT, { emissive: BBI_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBI_CSS, w: 0.46 });
      reg(hits, b, lid);
    }
    card(2.0, 1.3, -1.9, "single-fix-card", "Choose one fix", "ONE THING.\nNOT FIVE.", { ry: -0.4, w: 0.34 });

    // ------------------------------------------------------------ angle dial, receptiveness gauge
    const dial = group(g, -1.6, 0, 0.55);
    cyl(dial, 0.16, 0.16, 0.03, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 20 });
    const dialArrow = box(dial, 0.03, 0.02, 0.13, 0, 0.92, 0.08, BBI_ACCENT, { emissive: BBI_ACCENT, ei: 0.8, rough: 0.4 });
    holoTag(dial, "Camera angle dial", 0, 1.12, 0, { css: BBI_CSS, w: 0.36 });
    reg(hits, dial.children[0], "angle-dial");
    const tStand = stand(1.75, 0.8, -0.3);
    const receptiveness = instrument(tStand, 0, 1.02, 0, { idle: "OPEN?", color: BBI_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Player receptiveness", 0, 1.22, 0, { css: BBI_CSS, w: 0.4 });
    reg(hits, receptiveness, "receptiveness-gauge");
    stand(0.75, -1.95, 0, 0.9);
    bead(0.75, 1.05, -1.95, "landing-marker", "Quiet after the fix", { w: 0.42 });

    // ------------------------------------------------------------ fixed-mindset watch, identity board
    bead(-0.75, 0.55, 1.1, "fixed-defensive-excuse", "Defensive excuse", { w: 0.4, r: 0.024 });
    bead(0.9, 0.6, 1.25, "fixed-comparing-down", "Comparing down, unprompted", { w: 0.44, r: 0.024 });
    bead(0.15, 0.9, 1.85, "fixed-giving-up-posture", "Giving-up posture", { w: 0.4, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "fixed-asking-a-clarifying-question", "Asking a clarifying question", { w: 0.48, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const identity = group(g, -3.1, 0, 0.75, 1.1);
    for (const sx of [-0.32, 0.32]) cyl(identity, 0.018, 0.018, 1.4, sx, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(identity, 0.74, 0.46, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a2430"; cx.font = `700 ${Math.round(h * 0.11)}px Arial`; cx.textAlign = "center";
      cx.fillText("WHO I AM", w * 0.27, h * 0.16); cx.fillText("WHAT I'LL DO", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const identityToken = cyl(identity, 0.05, 0.05, 0.02, -0.2, 1.16, 0.03, 0xd8261e, { rough: 0.5, seg: 14 });
    identityToken.rotation.x = Math.PI / 2;
    holoTag(identity, "Mistake token", -0.2, 1.5, 0.03, { css: BBI_CSS, w: 0.32 });
    reg(hits, identityToken, "identity-token");
    const actionBin = box(identity, 0.16, 0.16, 0.01, 0.2, 1.16, 0.02, BBI_ACCENT, { emissive: BBI_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, actionBin, "action-bin");
    bead(2.35, 0.75, 1.0, "quiet-word-spot", "Quiet word, away from the group", { color: 0xf2c14b, css: "#f2c14b", w: 0.5 });

    // ------------------------------------------------------------ composure meter, step-outside, door
    const cStand = stand(-1.3, 1.65, -0.35);
    const composure = instrument(cStand, 0, 1.02, 0, { idle: "CALM", color: BBI_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Composure through the review", 0, 1.22, 0, { css: BBI_CSS, w: 0.44 });
    reg(hits, composure, "review-composure-meter");
    const doorway = group(g, 3.45, 0, 1.3, -Math.PI / 2);
    box(doorway, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(doorway, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    bead(3.0, 1.5, 1.9, "step-outside-spot", "Step outside for a minute", { color: 0x59c97b, css: "#59c97b", w: 0.44 });
    const teammates = [
      standingFigure(g, -3.2, -2.4, { ry: 0.6, cloth: 0x3a5a7a, trousers: 0x2b2f35, atStation: true }),
      standingFigure(g, -3.6, -2.1, { ry: 0.4, cloth: 0x7a3a1a, trousers: 0x2b2f35, atStation: true }),
    ];
    bead(-3.4, 2.35, -2.25, "screen-privacy-spot", "Turn the screen away", { color: 0x59c97b, css: "#59c97b", w: 0.42 });

    // ------------------------------------------------------------ boards, guide
    const log = board(0.6, 0.36, 1.5, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Fix given · how it landed", "Trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.2, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.6, 0.3, 0.4, 2.05, -3.0, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["One fix. Real credit. Not a verdict."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
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
    hazardCard(-1.85, 1.25, 0.35, "compare-the-player-to-a-teammate", "Compare to a teammate?", "WHY NOT LIKE\nYOUR TEAMMATE", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "give-only-criticism-no-specific-fix", "List everything wrong?", "JUST BE\nBETTER", 0.1);
    hazardCard(0.6, 1.25, 1.2, "leave-the-projector-cable-across-the-walkway", "Leave the cable out?", "IT'S FINE\nWHERE IT IS", -0.1);
    hazardCard(1.9, 1.25, 0.35, "mock-the-mistake-in-front-of-the-team", "Play it for the team?", "EVERYONE\nCOME LOOK", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 1.65, 1.55, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 1.65, 2.1, 1.55, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, 1.9, { ry: 2.4, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, 1.9, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void dialArrow; void teammates; void bench; void screenPost;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, -0.9),

      onStepComplete(step) {
        if (step.id === "scan-the-film-room-before-review") cable.visible = false;
        if (step.id === "turn-to-the-right-camera-angle") dialArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "move-the-mistake-from-identity-to-action") identityToken.position.set(0.2, 1.16, 0.02);
        if (step.id === "log-the-film-review") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Fix taken, composure held", "Player checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "player-stands-up-to-walk-out") {
          reviewPlayer.position.set(0.6, 0, -0.2);
          reviewPlayer.rotation.y = -0.9;
        }
        if (it.id === "the-team-sees-the-clip-and-laughs") {
          for (const tm of teammates) tm.position.set(tm.position.x + 0.4, 0, tm.position.z + 0.5);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "player-stands-up-to-walk-out") {
          reviewPlayer.position.set(2.7, 0, 1.7); reviewPlayer.rotation.y = -2.2;
          paintGuide("That was the right call — a minute of air, and they came back ready to hear the rest.");
        }
        if (it.id === "the-team-sees-the-clip-and-laughs") {
          screenPost.rotation.y = 1.1;
          doorLeaf.rotation.y = 1.0; doorLeaf.position.x = -0.35;
          paintGuide("Handled quickly — the screen is turned away and the door is shut. The review stays between the two of you.");
        }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-the-players-receptiveness") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(receptiveness.userData.screen, signFace(ok ? "OPEN" : gg.t < 0.42 ? "BRACING" : "CHECKED OUT", { bg: "#0c2622", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafff9", scale: 0.42 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-composure-through-the-rest-of-the-review") {
          const ok = tr.v >= 0.38 && tr.v <= 0.62;
          repaint(composure.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.38 ? "SHUT DOWN" : "BRAVADO", { bg: "#0c2622", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafff9", scale: 0.42 }));
        }
      },
    };
  },
};
