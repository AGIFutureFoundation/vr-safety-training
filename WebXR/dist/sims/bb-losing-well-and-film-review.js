import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine, eiTeamLine, reflectionPrompt } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — losing well and film review.
// The morning after a close loss, the team watches the game back. The
// lesson is what to do with a loss: own your part out loud, name one thing
// to fix, and thank the teammate who covered for you. The review is run
// so no player is put on trial in front of the others, and so the player
// who is taking it hardest is noticed.
//
// Sited generically in the gym-court district; the team and players are
// invented. No statistic, study or named player is asserted.

const LWF_ACCENT = 0xe0607a;
const LWF_CSS = "#e0607a";

export const SIM_BB_LOSING_WELL_AND_FILM_REVIEW = {
  id: "bb-losing-well-and-film-review",
  index: "729",
  domain: "Youth Sports",
  trade: "Youth basketball player and coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on keeping winning and losing in proportion for young players; the Association for Applied Sport Psychology's guidance on coach feedback, growth mindset and learning from a loss without shame; NFHS basketball rules and its sportsmanship expectations for how a team talks about a game and its officials; the U.S. Center for SafeSport for observable, non-shaming correction and for a review room with two adults present; CDC Heads Up for the knock from last night's game that still needs following up; the American Red Cross first aid course; AFSCME and SEIU recreation staff who run the league",
  name: "Losing Well and Film Review",
  title: simTitle("Losing Well and Film Review"),
  tagline: "After a loss: own your part, name one thing to fix, and thank the teammate who covered for you",
  accent: LWF_ACCENT,
  accentCss: LWF_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"lost-well","name":"Lost Well","note":"A loss reviewed with every player owning one thing, fixing one thing and thanking one teammate"},

  supportLine: "your coach, a parent or a teammate you trust — a loss that stays with you for days is worth talking about, and there is no penalty for saying so",

  game: system({
    name: "Review Board",
    currency: "LESSONS",
    ranks: ["Viewer","Owner","Fixer","Film Captain","Team Mentor"],
    badges: [
      { id: "clean-read", name: "Read the Room", note: "Everything in the opening scan found first time", test: AWARD.stepClean("read-the-room-after-a-loss") },
      { id: "no-blame", name: "No Blame", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "replay-one-mistake-over-and-over": "You rewound one player's turnover again and again in front of the whole team. Replaying a single mistake turns film review into a public trial, and the Association for Applied Sport Psychology's guidance on feedback is that a player shown their error repeatedly in front of peers learns shame rather than the fix — show it once, name the fix, move on.",
    "blame-the-officials": "You spent the review arguing that the officials lost the game for the team. Blaming the officials hands the loss to somebody the team cannot coach, and NFHS sportsmanship expectations ask players and coaches to talk about officials with respect; the review is for what the team controls.",
    "skip-your-own-part": "You pointed out everyone else's mistakes and none of your own. A review where the loudest player owns nothing teaches everyone else to hide theirs, and the whole point of losing well is that each person names their part first — including the captain and the coach.",
    "wave-off-the-knock": "You decided the teammate who took a knock last night was fine because they came to review. CDC Heads Up is clear that concussion signs can show up hours or a day later, so a knock from the game gets asked about and reported to the coach the next day, not assumed away."
  },

  lateNotes: {
    "lwf-practice-plan": "The plan is written once everybody has named their one fix — nothing to record yet.",
    "lwf-crew-checkin": "The check-in comes at the very end, after the plan."
  },

  steps: [
    {
      id: "read-the-room-after-a-loss",
      kind: "find",
      noHint: true,
      targets: [
        "lwf-player-hood-up",
        "lwf-player-phone-replay",
        "lwf-player-rubbing-head"
      ],
      itemNames: {
        "lwf-player-hood-up": "a player with hood up, sitting apart",
        "lwf-player-phone-replay": "a player replaying the last shot on their phone",
        "lwf-player-rubbing-head": "the teammate who took a knock, rubbing their head"
      },
      itemNotes: {
        "lwf-player-hood-up": "Hood up and sitting apart is somebody carrying the loss alone. They need a word before the film starts.",
        "lwf-player-phone-replay": "Replaying the last shot alone is the spiral the review is meant to replace with one fix.",
        "lwf-player-rubbing-head": "Rubbing their head the day after a knock is a sign to tell the coach now, before any film."
      },
      decoyNotes: {
        "lwf-player-eating": "A player eating breakfast is just hungry. Look for who is hurting."
      },
      title: "Read the room before the film starts",
      cue: "As the team comes in, look for who is carrying last night harder than the rest.",
      why: "A loss lands differently on every player, and the review goes better when the ones taking it hardest are noticed first. The player sitting apart with a hood up, the one replaying the last shot alone, and the teammate still rubbing their head after last night's knock each need something before the film — a word, a reframe, or the coach told now."
    },
    {
      id: "post-the-ground-rules",
      kind: "select",
      target: "lwf-ground-rules",
      title: "Post the review's ground rules",
      cue: "Show any mistake once, name the fix, and nobody is put on trial.",
      why: "Ground rules said before the film starts are what make the room safe enough to be honest in. Show a mistake once, name the fix, move on: players who know they will not be replayed in front of their friends are the ones who will say what they were thinking on the play, and that is the thing the coach most needs to hear."
    },
    {
      id: "build-the-review-in-order",
      kind: "sequence",
      targets: [
        "lwf-order-own",
        "lwf-order-fix",
        "lwf-order-thank",
        "lwf-order-plan"
      ],
      itemNames: {
        "lwf-order-own": "1 · each player owns one part",
        "lwf-order-fix": "2 · each names one thing to fix",
        "lwf-order-thank": "3 · each thanks a teammate",
        "lwf-order-plan": "4 · the coach sets the plan"
      },
      title: "Run the review in the order losing well needs",
      cue: "Own your part, name one fix, thank a teammate, then the coach sets the plan.",
      why: "Owning a part comes first because a fix without ownership is a fix for somebody else. The fix comes next so the ownership has somewhere to go, the thanks comes after so the review ends on the team rather than on mistakes, and the coach's plan comes last because it is built from what the players themselves just said.",
      outOfOrderNote: "Out of order. Each player owns their part before naming a fix — a fix without ownership is advice for somebody else."
    },
    {
      id: "hold-while-they-speak",
      kind: "hold",
      target: "lwf-listen-marker",
      seconds: 6,
      title: "Hold still while a teammate owns their part",
      cue: "A teammate is naming their mistake — hold here and listen, no jokes, no correcting them.",
      why: "Owning a mistake out loud in front of teammates is hard, and the room's reaction decides whether anybody does it again. Holding still and listening — no joke to break the tension, no correction on top of what they said — tells the player that honesty is safe here, which is the whole culture a good review is building.",
      holdBreakNote: "You broke in before they finished. Let a teammate own their part all the way — the room's silence is the respect."
    },
    {
      id: "turn-to-the-one-fix",
      kind: "turn",
      target: "lwf-fix-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FIX"
      },
      title: "Turn the dial to the team's one fix",
      cue: "Turn the dial to the one thing the team will fix this week: boxing out on free throws.",
      why: "A loss usually has a dozen causes and a week has room for one fix done well. Turning the dial to a single thing — boxing out on free throws, say — gives the team a target they can actually hit by the next game, and turns the weight of a loss into a practice plan rather than a list of everything that went wrong."
    },
    {
      id: "pace-the-film",
      kind: "gauge",
      target: "lwf-film-pace",
      gauge: {
        label: "PACE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too fast and nothing is learned; too slow and every clip becomes a trial. Move at the pace of one fix per clip."
      },
      title: "Run the film at the right pace",
      cue: "Commit when the film pace reads right — one clip, one fix, move on.",
      why: "Film run too fast is highlights with nothing learned; film run too slow, stopping on every mistake, becomes the public trial the ground rules promised against. The right pace is one clip, one fix and move on, which keeps the review about the team's week ahead rather than one player's worst minute."
    },
    {
      id: "move-the-thanks-token",
      kind: "drag",
      target: "lwf-thanks-token",
      drag: {
        to: "lwf-teammate-spot",
        radius: 0.45,
        missNote: "The thanks did not reach the teammate. Say who covered for you and why — all the way, out loud."
      },
      title: "Thank the teammate who covered for you",
      cue: "Drag the thank-you token to the teammate who rotated when you were beaten.",
      why: "In every loss somebody covered for somebody else — rotated when a teammate was beaten, dove for a loose ball, took a charge they were in position for. Thanking them by name, out loud, in the review makes that invisible work visible, and it is the sentence that turns a room of individual disappointments back into a team."
    },
    {
      id: "own-your-part-out-loud",
      kind: "select",
      target: "lwf-own-it-card",
      title: "Own your part out loud",
      cue: "Your turn: say one thing you did that cost the team, plainly and without excuses.",
      why: "The captain and the coach go first, because a leader who owns a part makes it safe for everyone else. One plain sentence — my part was three reaching fouls in the fourth quarter — with no excuse tacked on, is what losing well sounds like, and it is the model every other player will follow for the rest of the season."
    },
    {
      id: "spot-the-spiral",
      kind: "find",
      noHint: true,
      targets: [
        "lwf-spiral-all-my-fault",
        "lwf-spiral-quit-talk",
        "lwf-spiral-laughing-it-off"
      ],
      itemNames: {
        "lwf-spiral-all-my-fault": "a player saying the whole loss was their fault",
        "lwf-spiral-quit-talk": "a player saying they want to quit",
        "lwf-spiral-laughing-it-off": "a player laughing everything off"
      },
      itemNotes: {
        "lwf-spiral-all-my-fault": "\"All my fault\" is as untrue as \"none of it was\". Bring them back to one part and one fix.",
        "lwf-spiral-quit-talk": "Talk of quitting after a loss needs a private word from the coach, not a debate in front of the team.",
        "lwf-spiral-laughing-it-off": "Laughing everything off can be how a player hides it hurting. A quiet check-in, not a telling-off."
      },
      decoyNotes: {
        "lwf-spiral-taking-notes": "A player writing down their fix is doing exactly the job."
      },
      title: "Find where the loss is turning into a spiral",
      cue: "Listen to the room and mark each player whose response has gone past one part and one fix.",
      why: "Losing well sits between two spirals: the player who takes all the blame and the player who takes none of it by laughing it off, with talk of quitting as the sign it has gone further. Each needs a different response — a reframe, a private word from the coach, a quiet check-in — and none of them needs a debate in front of the team."
    },
    {
      id: "hold-the-room-honest",
      kind: "track",
      target: "lwf-honesty-meter",
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
        label: "HONEST"
      },
      title: "Keep the room honest and kind through the last clips",
      cue: "Hold the room in band — honest about the mistakes, kind about the people.",
      why: "A review drifts two ways: into politeness where nobody names anything, or into harshness where every clip becomes a verdict. Holding it in band — honest about what happened on the floor, kind about the people who did it — is the balance the Association for Applied Sport Psychology's feedback guidance describes, and it is the only one players learn from.",
      holdBreakNote: "The room left the band — gone quiet and polite, or turned harsh. Bring it back to honest about plays, kind about people."
    },
    {
      id: "write-the-plan",
      kind: "select",
      target: "lwf-practice-plan",
      doneLine: "One fix, drills set",
      title: "Write the week's plan from the one fix",
      cue: "Put the one fix on the practice plan with the drills that train it.",
      why: "The plan is the review's result. Writing the one fix onto the week's practice with the drills that train it turns a loss into a direction, and it gives every player a place to put the disappointment that is not their own head. The plan also records the knock followed up, so the coach knows it was handled."
    },
    {
      id: "share-the-next-win-forward",
      kind: "select",
      target: "lwf-share-board",
      doneLine: "Covering teammates named",
      title: "Name who the next win will belong to",
      cue: "Close the review: whatever happens next game, name the players whose work nobody sees.",
      why: "Ending a loss review by naming the teammates whose work nobody sees — the rotations, the screens, the boxing out — tells the team that the next win, when it comes, will belong to all of them. It is the same credit-sharing a captain gives after a win, offered forward, and it sends players out of the room looking at each other rather than at the floor."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "lwf-crew-checkin",
      doneLine: "Everybody checked in",
      title: "Check in with the team before they leave",
      cue: "At the door: how is everyone doing after last night, really?",
      why: "A loss can stay with a young player for days. Asking how they are, really, at the door — with no score and no lesson attached — and reminding them who they can talk to is exactly the check-in the guide offers after a hard run, and it is sometimes the only moment a player who is struggling will say so."
    }
  ],

  interrupts: [
    {
      id: "a-player-walks-out",
      kind: "Player leaves",
      after: "hold-while-they-speak",
      delay: 3,
      seconds: 12,
      target: "lwf-assistant-follows",
      alert: "A player gets up in the middle of a teammate owning their part and walks out of the room, upset.",
      cue: "Send the assistant coach after them calmly — you keep holding for the teammate who is speaking.",
      why: "A player walking out needs an adult with them, and the teammate mid-sentence needs the room to stay with them. The assistant follows, calmly and within sight of others as SafeSport guidance asks, and the speaker is not abandoned halfway through the hardest thing they will say all week.",
      missNote: "Nobody went after the player, who sat alone in the corridor for the rest of the review, and the teammate who was speaking stopped mid-sentence and did not finish.",
      wrongNote: "That does not reach the player who left. Send the assistant after them."
    },
    {
      id: "the-knock-shows-up",
      kind: "Head injury sign",
      after: "hold-the-room-honest",
      delay: 3,
      seconds: 12,
      target: "lwf-report-knock",
      alert: "The teammate who took a knock last night says the screen is making them dizzy and their head hurts.",
      cue: "Pause the film, tell the coach and the athletic trainer now, and get the family called.",
      why: "Dizziness and a headache the day after a knock are exactly the delayed signs CDC Heads Up tells coaches to watch for. The review stops, the trainer and the family are told, and the player does not go back to the screen or the court until they have been evaluated.",
      missNote: "The film carried on, the player sat through the rest with a headache, and nobody called home until they mentioned it at the next practice.",
      wrongNote: "That does not get the player help. Pause, tell the coach and trainer, and call home."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = LWF_ACCENT;
    const CSS = LWF_CSS;
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
      const d = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, d, id);
      return d;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const t = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, t, id);
      return t;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#b9844f", base2: "#a8743f", seam: "rgba(60,36,14,0.35)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    // painted lines, the key and the hoop
    for (const [w, d, x, z] of [[7.2, 0.05, 0, -4.2], [0.05, 7.2, -3.6, -0.6], [0.05, 7.2, 3.6, -0.6], [7.2, 0.05, 0, 1.2]]) box(g, w, 0.006, d, x, 0.016, z, 0xf4f1ea, { rough: 0.7, cast: false });
    const key = box(g, 1.6, 0.006, 1.9, 0, 0.015, -3.2, ACC, { rough: 0.8, opacity: 0.55, cast: false });
    void key;
    torus(g, 0.9, 0.025, 0, 0.018, 1.2, 0xf4f1ea, { rough: 0.7, seg: 6, seg2: 32 }).rotation.x = Math.PI / 2;
    const hoop = group(g, 0, 0, -4.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 }).rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });
    // bleachers along the far side, a ball rack and the scorer's table
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a6a4a", base2: "#7a5a3a", seam: "rgba(30,20,10,0.5)" }), { repeat: 2, px: 256 });
    const woodMat = texturedMat(woodTex, { rough: 0.75, metal: 0.02, color: 0xe8d8c0 });
    for (let tier = 0; tier < 4; tier++) for (let seg = 0; seg < 4; seg++) {
      const plank = box(g, 1.5, 0.06, 0.4, -2.4 + seg * 1.6, 0.3 + tier * 0.34, -5.0 - tier * 0.4, 0x8a6a4a, { rough: 0.7 });
      plank.material = woodMat;
      box(g, 0.05, 0.3 + tier * 0.34, 0.05, -3.1 + seg * 1.6, (0.3 + tier * 0.34) / 2, -5.0 - tier * 0.4, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }
    const rack = group(g, 3.3, 0, -3.3, -0.6);
    box(rack, 0.9, 0.04, 0.35, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (const sx of [-0.4, 0.4]) box(rack, 0.04, 0.5, 0.35, sx, 0.25, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 4; i++) ball(rack, 0.11, -0.3 + i * 0.2, 0.63, 0, 0xd8641e, { rough: 0.75, seg: 16 });
    const table = group(g, -3.3, 0, -3.0, 0.6);
    box(table, 1.4, 0.05, 0.5, 0, 0.74, 0, 0x2b3138, { rough: 0.6 });
    box(table, 1.4, 0.7, 0.03, 0, 0.37, 0.24, ACC, { rough: 0.6, emissive: ACC, ei: 0.15 });
    const clock = decal(table, 0.5, 0.2, 0, 1.0, 0, (cx, w, h) => text(cx, w, h, "HOME 00 · AWAY 00", ["Q2 · 04:12"]), { px: 256, glow: true, ei: 0.9 });
    void clock;
    const benchL = group(g, -1.8, 0, 3.4);
    box(benchL, 2.2, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 }).material = woodMat;
    for (const sx of [-1.0, 1.0]) box(benchL, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) cyl(g, 0.035, 0.035, 0.2, -2.6 + i * 0.3, 0.1, 3.75, i % 2 ? 0x2a7ab8 : 0xe8e8e8, { rough: 0.4, seg: 10 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.90, -0.27, "lwf-player-hood-up", "a player with hood up, sitting apart", {});
    bead(-1.42, 1.18, -0.62, "lwf-player-phone-replay", "a player replaying the last shot on their phone", {});
    bead(-1.03, 1.46, -0.71, "lwf-player-rubbing-head", "the teammate who took a knock, rubbing their head", {});
    bead(-1.08, 0.90, -1.11, "lwf-player-eating", "Player eating breakfast", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "lwf-order-own", "1 · each player owns one part", {});
    bead(-0.58, 1.46, -1.44, "lwf-order-fix", "2 · each names one thing to fix", {});
    bead(-0.24, 0.90, -1.23, "lwf-order-thank", "3 · each thanks a teammate", {});
    bead(0, 1.18, -1.55, "lwf-order-plan", "4 · the coach sets the plan", {});
    bead(0.24, 1.46, -1.23, "lwf-listen-marker", "Listening, no interruptions", {});
    bead(0.58, 0.90, -1.44, "lwf-spiral-all-my-fault", "a player saying the whole loss was their fault", {});
    bead(0.68, 1.18, -1.05, "lwf-spiral-quit-talk", "a player saying they want to quit", {});
    bead(1.08, 1.46, -1.11, "lwf-spiral-laughing-it-off", "a player laughing everything off", {});
    bead(1.03, 0.90, -0.71, "lwf-spiral-taking-notes", "Player writing their fix down", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "lwf-assistant-follows", "Assistant follows, calmly", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "lwf-report-knock", "Tell the coach, call home", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "lwf-ground-rules", "Review ground rules", "SHOW IT ONCE.\nNAME THE FIX", { ry: 1.20 });
    dials["lwf-fix-dial"] = dial(-1.89, -1.4, 0.93, "lwf-fix-dial", "The one fix");
    meters["lwf-film-pace"] = meter(-1.45, -1.85, 0.67, "lwf-film-pace", "Film pace");
    tokens["lwf-thanks-token"] = token(-0.92, -2.16, 0.40, "lwf-thanks-token", "Thank-you token");
    spots["lwf-teammate-spot"] = spot(-0.31, -2.33, 0.13, "lwf-teammate-spot", "The teammate who covered");
    card(0.31, 1.35, -2.33, "lwf-own-it-card", "My part was...", "MY PART\nWAS...", { ry: -0.13 });
    meters["lwf-honesty-meter"] = meter(0.92, -2.16, -0.40, "lwf-honesty-meter", "Room honesty");
    boards["lwf-practice-plan"] = board(1.45, -1.85, -0.67, "lwf-practice-plan", "This week's plan");
    boards["lwf-share-board"] = board(1.89, -1.4, -0.93, "lwf-share-board", "Next game");
    boards["lwf-crew-checkin"] = board(2.19, -0.85, -1.20, "lwf-crew-checkin", "Coach and team check-in");
    hazardCard(-1.53, 0.72, -1.21, "replay-one-mistake-over-and-over", "Rewind their turnover again?", "REWIND.\nWATCH IT AGAIN", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "blame-the-officials", "Say the refs lost it for us?", "THE REFS\nCOST US", 0.30);
    hazardCard(0.58, 0.72, -1.86, "skip-your-own-part", "Point out everyone else's mistakes?", "NOT MY\nFAULT", -0.30);
    hazardCard(1.53, 0.72, -1.21, "wave-off-the-knock", "Assume last night's knock is fine?", "THEY CAME,\nSO THEY'RE FINE", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Own it. Fix one thing. Thank someone."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const t = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(t)?.width ?? t.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = t;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the crew (clear of every control)
    const crew = {};
    crew["coach"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["assistant"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["trainer"] = standingFigure(g, -2.9, -2.3, { ry: 0.9, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", -2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    crew["cocaptain"] = standingFigure(g, 2.9, -2.3, { ry: -0.9, cloth: 0xf2f2f2, trousers: 0x2b2f35, atStation: true });
    holoTag(g, "Co-captain", 2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-player-walks-out"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x7a3a1a, atStation: true });
    arrivals["a-player-walks-out"].visible = false;
    arrivals["the-knock-shows-up"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0xf2f2f2, atStation: true });
    arrivals["the-knock-shows-up"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-thanks-token") { const s = spots["lwf-teammate-spot"]; tokens["lwf-thanks-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "write-the-plan") repaint(boards["lwf-practice-plan"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["One fix, drills set"], "#59c97b"));
        if (step.id === "share-the-next-win-forward") repaint(boards["lwf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Covering teammates named"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["lwf-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Everybody checked in"], "#59c97b"));
        if (step.id === "own-your-part-out-loud") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("loss", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "move-the-thanks-token") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("loss", { seed: 1 }) : "Say the next job, not the last mistake.");
        if (step.id === "crew-check-in") paintGuide(typeof reflectionPrompt === "function" ? reflectionPrompt({ team: true }) : "What did you say out loud that helped?");
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function" ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 }) : "Stop there. Take a breath and go again.");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide(typeof eiLine === "function" ? eiLine("missed", { kind: it.kind, seed: 0 }) : "That one went unanswered. Next time it wins."); return; }
        if (it.id === "a-player-walks-out") { crew["assistant"].position.set(1.9, 0, -2.6); if (who) who.position.set(2.4, 0, -3.6); paintGuide("The assistant is with them; the teammate who was speaking finished."); }
        if (it.id === "the-knock-shows-up") { crew["trainer"].position.set(-1.9, 0, -2.7); if (who) who.position.set(-1.4, 0, -3.4); paintGuide("Film paused, trainer with them, family called — that knock is being followed up properly."); }
      },

      animate(t, dt, session) {
        void t; void dt;
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
