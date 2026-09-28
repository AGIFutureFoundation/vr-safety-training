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

// SmartCiti.X~ Basketball Fundamentals VR — the timeout huddle.
// Down by six with the other team on a run, the coach gives the captain
// the first part of a timeout. Thirty seconds, one fact, one change, one
// encouragement, and nobody blamed. The station teaches a captain to run a
// huddle that leaves five players calmer and clearer than they came in,
// with water taken and the player who is hurting noticed.
//
// Sited generically in the gym-court district; the team and players are
// invented. No statistic, study or named player is asserted.

const THA_ACCENT = 0xffc93b;
const THA_CSS = "#ffc93b";

export const SIM_BB_TIMEOUT_HUDDLE_AND_ADJUSTMENT = {
  id: "bb-timeout-huddle-and-adjustment",
  index: "728",
  domain: "Youth Sports",
  trade: "Youth basketball team captain",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on player leadership and on water and rest in games; NFHS basketball rules for how a timeout is requested and how long the team has before play resumes; the Association for Applied Sport Psychology's guidance on composure, short cue-based instruction and encouragement under pressure; the U.S. Center for SafeSport for a huddle kept free of shaming; CDC Heads Up for the teammate who took a knock and is quieter than usual; the American Red Cross first aid course for the check-in that finds them; AFSCME and SEIU recreation staff who run the league",
  name: "Timeout Huddle and Adjustment",
  title: simTitle("Timeout Huddle and Adjustment"),
  tagline: "Thirty seconds, one fact, one change, one encouragement — and nobody blamed",
  accent: THA_ACCENT,
  accentCss: THA_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"thirty-seconds","name":"Thirty Seconds","note":"A huddle that named one fact, made one change and sent five players out steadier, with no one blamed"},

  supportLine: "your coach, your co-captain, or a teammate you trust — leading a huddle when the team is losing is hard, and it is worth talking about afterwards",

  game: system({
    name: "Huddle Board",
    currency: "STEADY",
    ranks: ["Teammate","Voice","Co-Captain","Captain","Team Leader"],
    badges: [
      { id: "clean-read", name: "Read the Bench", note: "Everything in the opening scan found first time", test: AWARD.stepClean("read-the-bench-coming-in") },
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
    "name-who-lost-us-the-lead": "You opened the huddle by saying which player's turnovers had cost the lead. Naming a teammate as the reason the team is losing turns thirty seconds meant for a fix into a trial, and the Association for Applied Sport Psychology's guidance on composure is that blame spoken under pressure shrinks every player who hears it, not only the one it is aimed at.",
    "give-five-instructions-at-once": "You gave five different changes in thirty seconds. Under pressure, players remember one thing clearly or nothing at all; a huddle that tries to fix everything leaves the team walking back onto the floor with a list nobody can recall, which is worse than one clear change.",
    "skip-the-water": "You used the whole timeout talking and nobody drank. USA Basketball's guidelines and NFHS sports medicine guidance both treat water in a stoppage as part of the game plan, and a team running on empty in the second half makes the tired decisions that caused the run in the first place.",
    "let-the-argument-run-on": "You let two players keep arguing about whose man it was while the clock ran. An argument left running in a huddle takes the thirty seconds with it and sends two players back out angry at each other; the captain's job is to stop it with one sentence and settle it later."
  },

  lateNotes: {
    "tha-scorebook": "The note goes in the book after the team is back on the floor — nothing to record yet.",
    "tha-crew-checkin": "The check-in with the coach comes after the game, at the very end."
  },

  steps: [
    {
      id: "read-the-bench-coming-in",
      kind: "find",
      noHint: true,
      targets: [
        "tha-heads-down",
        "tha-two-arguing",
        "tha-quiet-teammate"
      ],
      itemNames: {
        "tha-heads-down": "players walking in with heads down",
        "tha-two-arguing": "two teammates still arguing",
        "tha-quiet-teammate": "a teammate unusually quiet after a knock"
      },
      itemNotes: {
        "tha-heads-down": "Heads down means the team needs lifting before it can listen. The encouragement matters as much as the change.",
        "tha-two-arguing": "An argument walking into the huddle will take it over unless it is stopped in the first sentence.",
        "tha-quiet-teammate": "Quieter than usual after a knock is worth a word — and worth telling the coach about."
      },
      decoyNotes: {
        "tha-teammate-drinking": "A teammate already drinking water is doing the right thing. Look for what needs you."
      },
      title: "Read the team as it walks to the bench",
      cue: "In the seconds before the huddle forms, look at who is coming in and how.",
      why: "The huddle starts before anyone sits down. Heads down, two players still arguing and a teammate who has gone quiet since a knock are three different problems, and a captain who sees them walking in knows what the thirty seconds have to do: settle, fix one thing and lift, while the coach is told about the teammate who may need checking."
    },
    {
      id: "post-the-huddle-format",
      kind: "select",
      target: "tha-format-card",
      title: "Hold to the huddle format",
      cue: "One fact, one change, one encouragement — nothing else fits in thirty seconds.",
      why: "The format is what makes thirty seconds enough. One fact says what is actually happening, one change says what the team will do differently, and one encouragement sends them out believing they can do it. Anything more is a lecture the clock will cut off halfway, and players walk back out with the first half of a sentence."
    },
    {
      id: "build-the-huddle-in-order",
      kind: "sequence",
      targets: [
        "tha-order-water",
        "tha-order-fact",
        "tha-order-change",
        "tha-order-lift"
      ],
      itemNames: {
        "tha-order-water": "1 · water in hands",
        "tha-order-fact": "2 · one fact, plainly",
        "tha-order-change": "3 · one change",
        "tha-order-lift": "4 · one encouragement"
      },
      title: "Run the huddle in order",
      cue: "Water first, then the fact, then the change, then the encouragement.",
      why: "Water goes in hands first because it takes no words and a tired team listens better with something to drink. The fact comes before the change so the change makes sense, and the encouragement comes last because it is what players carry out onto the floor — the last thing said in a huddle is the thing remembered.",
      outOfOrderNote: "Out of order. Water goes in hands first, then the fact — a change given before anyone knows why it is needed does not stick."
    },
    {
      id: "hold-a-calm-voice",
      kind: "hold",
      target: "tha-calm-voice",
      seconds: 6,
      title: "Hold a calm, low voice as the huddle forms",
      cue: "Drop your voice, slow down and hold it — the team matches the captain's tone.",
      why: "A captain who shouts in a huddle tells the team it is time to panic; one who drops their voice and slows down tells them the problem is manageable. The Association for Applied Sport Psychology's work on composure under pressure keeps returning to this: the leader's tone sets the room's, so the calm has to come first.",
      holdBreakNote: "Your voice climbed before the hold was up. The team will match whatever tone you use — bring it back down."
    },
    {
      id: "turn-the-one-change",
      kind: "turn",
      target: "tha-change-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SWITCH D"
      },
      title: "Turn the dial to the one change",
      cue: "Turn the dial to the single adjustment the team will make: switch every screen this possession.",
      why: "One change, stated as a single action everyone can do on the next play, is what a team under pressure can actually carry out. Turning the dial to it makes the change a thing all five players saw decided, not a suggestion one player half heard — and it gives the coach, who takes the second half of the timeout, a clear place to build from."
    },
    {
      id: "time-the-huddle",
      kind: "gauge",
      target: "tha-huddle-clock",
      gauge: {
        label: "30 SEC",
        speed: 0.6,
        green: [
          0.42,
          0.6
        ],
        missNote: "Outside the band. Too short and the change never landed; too long and the coach has no time. Finish your part inside your share of the clock."
      },
      title: "Finish your part inside the clock",
      cue: "Commit when your part ends in the window — enough to land the change, leaving the coach their time.",
      why: "The captain has part of a short timeout, not all of it. Finishing inside that share leaves the coach time for their adjustment and still gets everyone back on the floor before the official's signal; running over means the coach is cut off, and stopping too soon means the change never actually landed with the team."
    },
    {
      id: "hand-the-water-out",
      kind: "drag",
      target: "tha-water-token",
      drag: {
        to: "tha-bench-spot",
        radius: 0.45,
        missNote: "The bottles did not reach the bench. Water in hands is the first thing the huddle does — carry them all the way."
      },
      title: "Get water into every player's hand",
      cue: "Drag the bottles from the cooler to the bench — every player drinks while listening.",
      why: "A timeout is also a water break, and a captain who hands the bottles out is doing leadership nobody notices. USA Basketball's guidelines and NFHS sports medicine guidance both treat hydration in stoppages as part of keeping players safe, and a team that drinks while it listens loses none of the thirty seconds to it."
    },
    {
      id: "stop-the-blame",
      kind: "select",
      target: "tha-no-blame-card",
      title: "Stop the blame with one sentence",
      cue: "Settle the argument: \"We fix it together, next play\" — and move on.",
      why: "Two players arguing about whose man it was are both partly right and neither is helped by winning. One sentence from the captain — we fix it together, next play — stops it without choosing a side, keeps the huddle's thirty seconds for the fix, and sends both players out as teammates instead of as a verdict."
    },
    {
      id: "spot-who-needs-more",
      kind: "find",
      noHint: true,
      targets: [
        "tha-needs-knock",
        "tha-needs-benched",
        "tha-needs-fouled-out"
      ],
      itemNames: {
        "tha-needs-knock": "the teammate who took the knock, holding their head",
        "tha-needs-benched": "a substitute who has not played and looks lost",
        "tha-needs-fouled-out": "a player with four fouls, jaw clenched"
      },
      itemNotes: {
        "tha-needs-knock": "Holding their head after a knock is a sign to tell the coach now. CDC Heads Up: when in doubt, sit them out.",
        "tha-needs-benched": "A sub about to go in cold needs one clear job. Tell them their man and the change.",
        "tha-needs-fouled-out": "Four fouls and a clenched jaw is a player one reach away from sitting down. A word about hands up, not reaching."
      },
      decoyNotes: {
        "tha-needs-laughing": "A teammate laughing at a joke is loosening up — that is fine in a huddle."
      },
      title: "Find who needs more than the huddle gave",
      cue: "As the team stands up, look again: who needs a word, and who needs the coach?",
      why: "The huddle speaks to the whole team, but some players need something more specific: a sub going in cold needs their job, a player on four fouls needs a reminder about hands, and a teammate holding their head after a knock needs the coach to know now. A captain who looks twice catches what a single speech cannot."
    },
    {
      id: "hold-the-team-steady",
      kind: "track",
      target: "tha-steady-meter",
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
        label: "STEADY"
      },
      title: "Keep the team steady walking back out",
      cue: "Hold steadiness in band as the team returns to the floor — not flat, not fired up past thinking.",
      why: "A huddle can send a team out flat, or so wound up that the first possession is a charge and a foul. Holding steadiness in band as they walk back — a hand on a shoulder, the change repeated once, a name called — is what gives the one change a chance to actually happen on the next play.",
      holdBreakNote: "Steadiness left the band — flat or over-pumped. Repeat the change once and bring the tone back."
    },
    {
      id: "note-the-adjustment",
      kind: "select",
      target: "tha-scorebook",
      doneLine: "Change and knock noted",
      title: "Note the change and the knock for the coach",
      cue: "Write the adjustment made and the teammate who took the knock on the bench notes.",
      why: "The coach cannot see everything and a captain's note closes the gap: what change the team made, whether it worked, and which teammate took a knock and went quiet. The last line is the most important; a possible head injury that nobody wrote down is one nobody follows up on after the game."
    },
    {
      id: "win-or-lose-share-it",
      kind: "select",
      target: "tha-share-board",
      doneLine: "Credit shared",
      title: "Share the result, whatever it is",
      cue: "At the whistle, name one teammate whose work turned the run — or who kept going when it did not.",
      why: "Whatever happened after the timeout, the captain's last job is to share it. Naming the teammate who made the change work, or who kept going when it did not, is how a team learns that a timeout was a thing they did together — and it is the part of leadership that costs nothing and is remembered longest."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "tha-crew-checkin",
      doneLine: "Captain checked in",
      title: "Check in with the coach about the huddle",
      cue: "After the game: how did it feel to lead, what landed, and what would you change?",
      why: "Leading a huddle while losing is hard, and captains rarely get asked how it felt. A short check-in with the coach — what landed, what did not, how are you — is how a young leader learns the job without carrying the weight of a loss alone, and it is exactly the kind of noticing the guide's check-in exists for."
    }
  ],

  interrupts: [
    {
      id: "the-official-signals-early",
      kind: "Official's signal",
      after: "hold-a-calm-voice",
      delay: 3,
      seconds: 12,
      target: "tha-cut-to-change",
      alert: "The official signals that the timeout is nearly over — far sooner than the captain expected.",
      cue: "Cut straight to the one change and the encouragement — the voice stays calm.",
      why: "A huddle that runs out of time mid-sentence sends the team out with nothing. When the signal comes early the captain skips everything but the change and the lift, still in the same low voice, because those two things are what the team needs on the next possession.",
      missNote: "The captain kept talking through the signal, the team walked out with half an explanation and no change, and the next possession looked exactly like the run.",
      wrongNote: "That does not shorten the huddle. Cut to the one change and the encouragement."
    },
    {
      id: "a-parent-shouts-at-a-player",
      kind: "Parent in the stands",
      after: "hold-the-team-steady",
      delay: 3,
      seconds: 12,
      target: "tha-assistant-to-stands",
      alert: "A parent in the front row shouts at their own child by name about the turnovers as the team walks back out.",
      cue: "Signal the assistant coach to go to the stands — you stay with the player and keep them facing the floor.",
      why: "A captain cannot manage an adult in the stands, and trying to would pull them away from the teammate who needs them. Signalling the assistant hands the parent to an adult whose job it is, while the captain keeps the player facing the game and repeats their one job.",
      missNote: "Nobody went to the stands, the parent kept shouting, and the player turned the ball over twice more looking up at the crowd.",
      wrongNote: "That does not reach the parent. Signal the assistant coach to go to the stands."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = THA_ACCENT;
    const CSS = THA_CSS;
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
    bead(-1.22, 0.90, -0.27, "tha-heads-down", "players walking in with heads down", {});
    bead(-1.42, 1.18, -0.62, "tha-two-arguing", "two teammates still arguing", {});
    bead(-1.03, 1.46, -0.71, "tha-quiet-teammate", "a teammate unusually quiet after a knock", {});
    bead(-1.08, 0.90, -1.11, "tha-teammate-drinking", "Teammate already drinking", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "tha-order-water", "1 · water in hands", {});
    bead(-0.58, 1.46, -1.44, "tha-order-fact", "2 · one fact, plainly", {});
    bead(-0.24, 0.90, -1.23, "tha-order-change", "3 · one change", {});
    bead(0, 1.18, -1.55, "tha-order-lift", "4 · one encouragement", {});
    bead(0.24, 1.46, -1.23, "tha-calm-voice", "Calm, low voice", {});
    bead(0.58, 0.90, -1.44, "tha-needs-knock", "the teammate who took the knock, holding their head", {});
    bead(0.68, 1.18, -1.05, "tha-needs-benched", "a substitute who has not played and looks lost", {});
    bead(1.08, 1.46, -1.11, "tha-needs-fouled-out", "a player with four fouls, jaw clenched", {});
    bead(1.03, 0.90, -0.71, "tha-needs-laughing", "Teammate laughing", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "tha-cut-to-change", "Cut to the one change", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "tha-assistant-to-stands", "Send the assistant", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "tha-format-card", "The huddle format", "ONE FACT\nONE CHANGE\nONE LIFT", { ry: 1.20 });
    dials["tha-change-dial"] = dial(-1.89, -1.4, 0.93, "tha-change-dial", "The one change");
    meters["tha-huddle-clock"] = meter(-1.45, -1.85, 0.67, "tha-huddle-clock", "Huddle clock");
    tokens["tha-water-token"] = token(-0.92, -2.16, 0.40, "tha-water-token", "Water bottles");
    spots["tha-bench-spot"] = spot(-0.31, -2.33, 0.13, "tha-bench-spot", "Every player's hand");
    card(0.31, 1.35, -2.33, "tha-no-blame-card", "We, not you", "WE, NOT YOU.\nNEXT PLAY", { ry: -0.13 });
    meters["tha-steady-meter"] = meter(0.92, -2.16, -0.40, "tha-steady-meter", "Team steadiness");
    boards["tha-scorebook"] = board(1.45, -1.85, -0.67, "tha-scorebook", "Bench notes");
    boards["tha-share-board"] = board(1.89, -1.4, -0.93, "tha-share-board", "After the game");
    boards["tha-crew-checkin"] = board(2.19, -0.85, -1.20, "tha-crew-checkin", "Captain and coach check-in");
    hazardCard(-1.53, 0.72, -1.21, "name-who-lost-us-the-lead", "Say whose turnovers cost the lead?", "THAT WAS\nALL YOU", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "give-five-instructions-at-once", "Fix five things at once?", "1·2·3·4·5\nCHANGES", 0.30);
    hazardCard(0.58, 0.72, -1.86, "skip-the-water", "Talk through the whole timeout?", "NO TIME\nFOR WATER", -0.30);
    hazardCard(1.53, 0.72, -1.21, "let-the-argument-run-on", "Let them argue it out?", "WHOSE MAN\nWAS IT?!", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["One fact. One change. One encouragement."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    crew["official"] = standingFigure(g, 2.9, -2.3, { ry: -0.9, cloth: 0x1a1a1a, trousers: 0x2b2f35 });
    holoTag(g, "Official", 2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-official-signals-early"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x1a1a1a, atStation: true });
    arrivals["the-official-signals-early"].visible = false;
    arrivals["a-parent-shouts-at-a-player"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x4a5a6a, atStation: true });
    arrivals["a-parent-shouts-at-a-player"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "hand-the-water-out") { const s = spots["tha-bench-spot"]; tokens["tha-water-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "note-the-adjustment") repaint(boards["tha-scorebook"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Change and knock noted"], "#59c97b"));
        if (step.id === "win-or-lose-share-it") repaint(boards["tha-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Credit shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["tha-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Captain checked in"], "#59c97b"));
        if (step.id === "stop-the-blame") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("huddle-disagreement", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "win-or-lose-share-it") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 0 }) : "Say the next job, not the last mistake.");
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
        if (it.id === "the-official-signals-early") { crew["official"].position.set(2.2, 0, -2.7); if (who) who.position.set(1.9, 0, -3.4); paintGuide("Cut short, still calm — the team walked out with the one change and nothing else."); }
        if (it.id === "a-parent-shouts-at-a-player") { crew["assistant"].position.set(-1.9, 0, -2.8); if (who) who.position.set(-1.2, 0, -3.5); paintGuide("The assistant has the stands; the player has their captain and one job."); }
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
