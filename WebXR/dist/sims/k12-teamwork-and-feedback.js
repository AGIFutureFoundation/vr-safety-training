import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — Teamwork and Feedback. Upper-primary and lower-secondary life skills at an arena's team room: roles on a team, listening, giving feedback that is specific, kind and useful, receiving it without getting defensive, and settling a disagreement fairly, linked to the platform's emotional intelligence stations.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_TEAMWORK_AND_FEEDBACK = {
  id: "k12-teamwork-and-feedback",
  index: "828",
  domain: "Education",
  trade: "Life-skills class at the arena's team room — learner and team coach",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "Teamwork and Feedback",
  title: simTitle("Teamwork and Feedback"),
  tagline: "Specific, kind and useful — give feedback on the work, never the person",
  accent: 0x9a6ad0,
  accentCss: "#9a6ad0",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"team-player","name":"Team Player","note":"Roles agreed, feedback given specific and kind, received without defending and a disagreement settled fairly"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Team Board",
    currency: "ASSISTS",
    ranks: ["Newcomer","Teammate","Supporter","Captain","Coach"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-what-makes-a-team-work") },
      { id: "no-shortcut", name: "No Shortcuts", note: "No misconception or unsafe shortcut anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "feedback-about-the-person": "You said your teammate was just bad at it. Feedback about the person hurts and gives them nothing to work on; feedback about the work, what they did and what might help, is specific, kind and useful.",
    "defend-every-point": "You argued back against every point of feedback. Listening first, asking a question to understand and thanking the person, even if you disagree, gets you far more from feedback than defending yourself does.",
    "one-voice-decides": "You let the loudest voice decide for the whole team. Good teams hear from everyone, especially the quiet members, before deciding; the loudest idea is not always the best one.",
    "wet-floor-sprint": "You ran across a wet patch of court to reach the huddle. Wet sports floors are slippery; you walk round the cone, and the coach has the floor dried before anyone plays on it."
  },

  lateNotes: {
    "ktf-team-log": "The team review is written once the session is done — nothing to record yet.",
    "ktf-checkin": "The check-in comes at the very end of the session."
  },

  steps: [
    {
      id: "find-what-makes-a-team-work",
      kind: "find",
      noHint: true,
      targets: [
        "ktf-goal",
        "ktf-roles",
        "ktf-agreements"
      ],
      itemNames: {
        "ktf-goal": "the shared goal",
        "ktf-roles": "the list of roles",
        "ktf-agreements": "the team's talking agreements"
      },
      itemNotes: {
        "ktf-goal": "Everyone pulling towards the same thing.",
        "ktf-roles": "Each person knows their part.",
        "ktf-agreements": "Take turns, listen, respect ideas."
      },
      decoyNotes: {
        "ktf-trophy": "A reminder of past success, but it does not make this team work."
      },
      title: "Find what makes a team work",
      cue: "Mark the three things on the team board that help a team work together.",
      why: "Teams work well when everyone knows the shared goal, each person has a clear role, and there are agreed ways to talk, like taking turns and listening. Finding those three on the team board shows that good teamwork is built on purpose, not left to luck."
    },
    {
      id: "put-the-feedback-steps-in-order",
      kind: "sequence",
      targets: [
        "ktf-ord-ask",
        "ktf-ord-specific",
        "ktf-ord-next",
        "ktf-ord-listen"
      ],
      itemNames: {
        "ktf-ord-ask": "1 · ask if they want feedback",
        "ktf-ord-specific": "2 · name something specific that went well",
        "ktf-ord-next": "3 · suggest one next step",
        "ktf-ord-listen": "4 · listen to their reply"
      },
      title: "Put the feedback steps in order",
      cue: "Ask if they want feedback, name something specific, suggest one next step, then listen.",
      why: "Asking first makes feedback something offered, not forced. Naming something specific that went well, suggesting one clear next step and then listening to their reply keeps feedback useful and kind, and it is the pattern good coaches use every day. Skipping the listening step turns feedback into a lecture, and people stop hearing lectures quickly.",
      outOfOrderNote: "Out of order. Ask if they want feedback before you give it."
    },
    {
      id: "walk-round-the-wet-patch",
      kind: "select",
      target: "ktf-wet-card",
      title: "Walk round the wet patch",
      cue: "Read the coach's card: walk round the cone, never across a wet court.",
      why: "A wet patch on a sports floor is as slippery as ice. Walking round the cone and letting the coach dry it is the rule every team follows, because an injured teammate helps nobody, and looking after each other is where teamwork starts. A wet patch is also a test of the team: the one who stops to warn others is doing the team's work."
    },
    {
      id: "turn-the-role-wheel-to-share",
      kind: "turn",
      target: "ktf-role-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ROLES"
      },
      title: "Turn the role wheel to share the jobs",
      cue: "Turn the role wheel so each teammate gets a different job this round.",
      why: "Rotating roles lets everyone try leading, recording and checking, and stops the same people always doing the same jobs. It builds skills across the team and shows everyone what each role takes."
    },
    {
      id: "judge-the-tone-of-your-feedback",
      kind: "gauge",
      target: "ktf-tone-meter",
      gauge: {
        label: "TONE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not in the band. Make it more specific, or kinder."
      },
      title: "Judge the tone of your feedback",
      cue: "Commit when the tone meter shows your feedback is specific and kind.",
      why: "Feedback that is too vague helps nobody, and feedback that is harsh makes people stop listening. Aiming for specific and kind, the middle of the band, gives your teammate something clear to work on and the confidence to try it. The same words can land as help or as criticism depending on how they are said, so tone matters."
    },
    {
      id: "hold-your-reply-while-a-teammate",
      kind: "hold",
      target: "ktf-listen-hold",
      seconds: 6,
      title: "Hold your reply while a teammate speaks",
      cue: "Stay quiet and listen fully until your teammate has finished.",
      why: "Waiting until someone has finished, instead of planning your answer while they talk, is what listening really means. It shows respect, it means you hear the whole idea, and it often changes what you were going to say. People can tell when they are really being listened to, and it makes them more willing to listen back.",
      holdBreakNote: "You jumped in before they finished. Let them finish, then reply."
    },
    {
      id: "choose-a-helpful-feedback-card",
      kind: "drag",
      target: "ktf-feedback-token",
      drag: {
        to: "ktf-teammate-spot",
        radius: 0.45,
        missNote: "Not given yet. Take the specific, kind card to your teammate."
      },
      title: "Choose a helpful feedback card",
      cue: "Drag the specific, kind feedback card to your teammate's spot.",
      why: "A card that says what went well and one thing to try next gives your teammate a clear way forward. Choosing it over a vague or harsh card is practising exactly the words that make feedback land well."
    },
    {
      id: "spot-the-problems-in-a-practice",
      kind: "find",
      noHint: true,
      targets: [
        "ktf-tt-person",
        "ktf-tt-quiet",
        "ktf-tt-loudest"
      ],
      itemNames: {
        "ktf-tt-person": "feedback about the person, not the work",
        "ktf-tt-quiet": "a quiet teammate never asked",
        "ktf-tt-loudest": "the loudest voice deciding"
      },
      itemNotes: {
        "ktf-tt-person": "Talk about what they did.",
        "ktf-tt-quiet": "Hear from everyone.",
        "ktf-tt-loudest": "Decide together."
      },
      decoyNotes: {
        "ktf-tt-thanks": "Thanking teammates is good practice. Keep it."
      },
      title: "Spot the problems in a practice team talk",
      cue: "Look at the practice team talk and mark each problem.",
      why: "Team talks go wrong in familiar ways: feedback aimed at the person, a quiet teammate never asked and a decision made by the loudest voice. Spotting them in a practice talk helps you notice and fix them in real ones."
    },
    {
      id: "say-how-to-receive-feedback-well",
      kind: "select",
      target: "ktf-compare-card",
      title: "Say how to receive feedback well",
      cue: "Say what you do when someone gives you feedback, even if you disagree.",
      why: "Receiving feedback well means listening, asking a question to understand and thanking the person, then deciding what to use. Saying that aloud builds the habit, and it is one of the most valuable skills in school, sport and work. Nobody has to agree with every piece of feedback, but hearing it fully before deciding is fair to both people."
    },
    {
      id: "keep-a-disagreement-calm",
      kind: "track",
      target: "ktf-track-meter",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.14,
        label: "CALM"
      },
      title: "Keep a disagreement calm",
      cue: "Keep the discussion's temperature in the calm band as teammates disagree.",
      why: "Disagreements are normal and can make a team's ideas better, as long as they stay calm and about the ideas. Keeping your voice steady, naming what you agree on and looking for a fair way to decide keeps the team together. When a discussion stays calm, the team can use the disagreement to find a better plan than either side started with.",
      holdBreakNote: "The discussion got heated. Slow down, name what you agree on, and bring it back."
    },
    {
      id: "record-the-teams-review",
      kind: "select",
      target: "ktf-team-log",
      doneLine: "Team review recorded",
      title: "Record the team's review",
      cue: "Write what the team did well, one thing to improve and who will do what.",
      why: "A short team review turns one session into learning for the next. Writing a strength, one improvement and clear actions means everyone leaves knowing what comes next."
    },
    {
      id: "thank-a-teammate-for-something-specific",
      kind: "select",
      target: "ktf-share-board",
      doneLine: "Teammate thanked",
      title: "Thank a teammate for something specific",
      cue: "Thank one teammate for a specific thing they did today.",
      why: "Specific thanks tells someone exactly what they did that helped, which makes them more likely to do it again. It ends a session warmly and builds the trust that good teams rely on."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "ktf-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the session",
      cue: "How did working as a team feel today? What would you do differently?",
      why: "The arena crew ends a shift with a huddle, so the class ends with one: each learner says what the team did well and what they personally would change. Practising that in front of the group, with no blame in it, is the whole of the lesson, and the coach can hear which teams found their voice."
    }
  ],

  interrupts: [
    {
      id: "a-teammate-is-left-out",
      kind: "Left out",
      after: "hold-your-reply-while-a-teammate",
      delay: 3,
      seconds: 12,
      target: "ktf-invite-in",
      alert: "One teammate has gone quiet and moved to the edge of the group while others talk over them.",
      cue: "Invite them back in and ask for their idea.",
      why: "Being left out is painful and it loses the team a voice. Inviting them back and asking for their idea shows the team values everyone, and it is often exactly the idea the group needed.",
      missNote: "Nobody noticed, and the teammate sat out the rest of the session feeling unwanted by the group.",
      wrongNote: "That leaves them out. Invite them in. Choose the response that deals with it now."
    },
    {
      id: "the-coach-asks-for-feedback",
      kind: "Coach question",
      after: "keep-a-disagreement-calm",
      delay: 3,
      seconds: 12,
      target: "ktf-say-feedback",
      alert: "The team coach asks you to give feedback to a teammate on the drill they just led.",
      cue: "Say something specific they did well and one thing to try next.",
      why: "The coach is checking you can put the feedback steps into practice on the spot. Being specific and kind shows you can help a teammate improve without knocking their confidence.",
      missNote: "You said it was fine, and your teammate had nothing specific to work on in the next drill.",
      wrongNote: "That is too vague to help. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x9a6ad0;
    const CSS = "#9a6ad0";
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const dd = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, dd, id);
      return dd;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const tk = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, tk, id);
      return tk;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#7a6e62", base2: "#6c6256", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#ece0d4", base2: "#ded2c4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a hall's stage behind the station: risers, a curtain, footlights and rows of seats at the sides
    void wallMat;
    const stage = group(g, 0, 0, -4.4);
    box(stage, 6.6, 0.5, 1.6, 0, 0.25, 0, 0x4a3a30, { rough: 0.7 });
    box(stage, 6.8, 0.05, 1.7, 0, 0.52, 0, 0x6b4a2e, { rough: 0.6 });
    box(stage, 6.6, 2.6, 0.1, 0, 1.85, -0.75, 0x7a2a2a, { rough: 0.95 });
    for (let i = 0; i < 7; i++) box(stage, 0.12, 2.5, 0.06, -2.7 + i * 0.9, 1.85, -0.68, 0x8a3232, { rough: 0.95 });
    for (let i = 0; i < 6; i++) ball(stage, 0.05, -2.5 + i * 1.0, 0.56, 0.8, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, rough: 0.4, seg: 8 });
    for (const side of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const seat = group(g, side * (2.9 + c * 0.55), 0, -3.2 + r * 0.7, side * 0.35);
      box(seat, 0.45, 0.06, 0.45, 0, 0.45, 0, 0x2a5a8a, { rough: 0.8 });
      box(seat, 0.45, 0.5, 0.06, 0, 0.72, -0.2, 0x2a5a8a, { rough: 0.8 });
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(seat, 0.03, 0.42, 0.03, lx, 0.21, lz, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "ktf-goal", "the shared goal", {});
    bead(-1.42, 1.18, -0.62, "ktf-roles", "the list of roles", {});
    bead(-1.03, 1.46, -0.71, "ktf-agreements", "the team's talking agreements", {});
    bead(-1.08, 0.9, -1.11, "ktf-trophy", "a trophy on the shelf", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "ktf-ord-ask", "1 · ask if they want feedback", {});
    bead(-0.58, 1.46, -1.44, "ktf-ord-specific", "2 · name something specific that went well", {});
    bead(-0.24, 0.9, -1.23, "ktf-ord-next", "3 · suggest one next step", {});
    bead(0, 1.18, -1.55, "ktf-ord-listen", "4 · listen to their reply", {});
    bead(0.24, 1.46, -1.23, "ktf-listen-hold", "Listen until they finish", {});
    bead(0.58, 0.9, -1.44, "ktf-tt-person", "feedback about the person, not the work", {});
    bead(0.68, 1.18, -1.05, "ktf-tt-quiet", "a quiet teammate never asked", {});
    bead(1.08, 1.46, -1.11, "ktf-tt-loudest", "the loudest voice deciding", {});
    bead(1.03, 0.9, -0.71, "ktf-tt-thanks", "a teammate thanked for their idea", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "ktf-invite-in", "Invite them in and ask their idea", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "ktf-say-feedback", "Give specific, kind feedback", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "ktf-wet-card", "Walk round the cone", "WALK\nROUND", { ry: 1.2 });
    dials["ktf-role-dial"] = dial(-1.89, -1.4, 0.93, "ktf-role-dial", "Role wheel");
    meters["ktf-tone-meter"] = meter(-1.45, -1.85, 0.67, "ktf-tone-meter", "Feedback tone");
    tokens["ktf-feedback-token"] = token(-0.92, -2.16, 0.4, "ktf-feedback-token", "Specific, kind feedback");
    spots["ktf-teammate-spot"] = spot(-0.31, -2.33, 0.13, "ktf-teammate-spot", "Teammate's spot");
    card(0.31, 1.35, -2.33, "ktf-compare-card", "Receiving feedback", "LISTEN,\nASK, THANK", { ry: -0.13 });
    meters["ktf-track-meter"] = meter(0.92, -2.16, -0.4, "ktf-track-meter", "Disagreement kept calm");
    boards["ktf-team-log"] = board(1.45, -1.85, -0.67, "ktf-team-log", "Team review");
    boards["ktf-share-board"] = board(1.89, -1.4, -0.93, "ktf-share-board", "Thank a teammate");
    boards["ktf-checkin"] = board(2.19, -0.85, -1.2, "ktf-checkin", "End-of-session check-in");
    hazardCard(-1.53, 0.72, -1.21, "feedback-about-the-person", "Say they are just bad at it?", "YOU'RE\nBAD", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "defend-every-point", "Argue back against every piece of feedback?", "ARGUE\nBACK", 0.3);
    hazardCard(0.58, 0.72, -1.86, "one-voice-decides", "Let the loudest teammate decide for everyone?", "LOUDEST\nWINS", -0.3);
    hazardCard(1.53, 0.72, -1.21, "wet-floor-sprint", "Run across the wet court to join the huddle?", "WET\nCOURT", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Specific, kind, useful."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const tt = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(tt)?.width ?? tt.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = tt;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the people (clear of every control)
    const crew = {};
    crew["a"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, "Class teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Team coach", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Team captain", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-teammate-is-left-out"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-teammate-is-left-out"].visible = false;
    arrivals["the-coach-asks-for-feedback"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-coach-asks-for-feedback"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "choose-a-helpful-feedback-card") { const s = spots["ktf-teammate-spot"]; tokens["ktf-feedback-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-teams-review") repaint(boards["ktf-team-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Team review recorded"], "#59c97b"));
        if (step.id === "thank-a-teammate-for-something-specific") repaint(boards["ktf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Teammate thanked"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["ktf-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-how-to-receive-feedback-well") paintGuide("Listen, ask, thank.");
      },

      onHazard() {
        paintGuide("Stop. Is it about the work, not the person? Has everyone been heard?");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide("That one went unanswered. Next time, stop and deal with it first."); return; }
        if (it.id === "a-teammate-is-left-out") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Teammate invited back, idea heard. The session carries on."); }
        if (it.id === "the-coach-asks-for-feedback") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Specific, kind feedback given. The coach nods."); }
      },

      animate(tm, dt, session) {
        void tm; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
