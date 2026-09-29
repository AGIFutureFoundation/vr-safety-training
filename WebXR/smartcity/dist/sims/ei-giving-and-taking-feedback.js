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

// SmartCiti.X~ Civic Leadership and Emotional Intelligence VR — giving and
// taking feedback. On a city parks crew, a senior worker has to tell a
// newer colleague that the way they left the chipper was unsafe, and then
// hear back, in the same conversation, that their own instructions were
// unclear. The station teaches feedback that names the behaviour and not
// the person, and taking feedback without defending — both halves, in turn.
//
// Every person is invented. No statistic, study or quotation is asserted.

const EGF_ACCENT = 0x4fc3c9;
const EGF_CSS = "#4fc3c9";

export const SIM_EI_GIVING_AND_TAKING_FEEDBACK = {
  id: "ei-giving-and-taking-feedback",
  index: "731",
  domain: "Civic",
  trade: "City parks crew — senior worker and apprentice",
  category: "Community Environmental Justice",
  weather: "overcast",
  certification: "8 CCR 3203, the employer's Injury and Illness Prevention Program, for correcting an unsafe practice through training rather than blame and for recording what was corrected; Labor Code §6310 for a worker's protection when they raise a safety concern, including one about a senior colleague's instructions; SAMHSA's trauma-informed principles of safety, trustworthiness and collaboration for how a correction is delivered; Psychological First Aid for staying calm and practical with somebody who is upset; SEIU and AFSCME for the parks members whose contract governs any formal discipline. The emotional-intelligence steps follow the programme's own guide",
  name: "Giving and Taking Feedback",
  title: simTitle("Giving and Taking Feedback"),
  tagline: "Name the behaviour, not the person — and when it comes back to you, take it without defending",
  accent: EGF_ACCENT,
  accentCss: EGF_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"both-directions","name":"Both Directions","note":"Feedback given about the behaviour and taken without defence, in the same conversation"},

  supportLine: "your supervisor, your union steward, or a colleague you trust — a hard conversation at work is worth talking through afterwards",

  game: system({
    name: "Feedback Board",
    currency: "CLARITY",
    ranks: ["Apprentice","Crew Member","Senior Worker","Crew Lead","Mentor"],
    badges: [
      { id: "clean-read", name: "Right Moment", note: "Everything in the opening scan found first time", test: AWARD.stepClean("see-what-needs-saying") },
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
    "call-them-careless": "You told them they were careless. Naming the person instead of the behaviour gives them something to defend rather than something to fix, and SAMHSA's principles of safety and trustworthiness are about exactly this: a correction that feels like an attack teaches someone to hide the next mistake rather than stop making it.",
    "correct-them-in-front-of-the-crew": "You corrected them loudly in front of the whole crew at the truck. Public correction adds embarrassment to the lesson and makes the whole crew less willing to admit their own slips; the employer's injury prevention programme depends on people reporting near misses, and nobody reports to someone who shames them.",
    "defend-your-instructions": "When they said your instructions were unclear, you explained why they were not. Defending yourself turns their feedback into an argument and teaches them never to give it again; Labor Code §6310 protects a worker who raises a safety concern, and the least a senior colleague owes them is to listen first.",
    "save-it-for-the-annual-review": "You decided to mention it at their annual review instead. Feedback about a safety behaviour that waits months is feedback about a habit that has been practised for months, and 8 CCR 3203 asks for an unsafe practice to be corrected when it is found, not stored up."
  },

  lateNotes: {
    "egf-training-log": "The training note is written after both halves of the conversation — nothing to record yet.",
    "egf-crew-checkin": "The check-in comes at the very end of the day."
  },

  steps: [
    {
      id: "see-what-needs-saying",
      kind: "find",
      noHint: true,
      targets: [
        "egf-chipper-left-running",
        "egf-guard-open",
        "egf-no-ear-protection"
      ],
      itemNames: {
        "egf-chipper-left-running": "the chipper left running unattended",
        "egf-guard-open": "the feed guard left open",
        "egf-no-ear-protection": "ear protection hanging on the mirror"
      },
      itemNotes: {
        "egf-chipper-left-running": "A running chipper left alone is the behaviour to name — specific, observable, fixable.",
        "egf-guard-open": "An open guard is a second observable fact. Feedback built on facts gives nothing to argue with.",
        "egf-no-ear-protection": "Hearing protection on the mirror, not on the head. Name it as a thing seen, not a character flaw."
      },
      decoyNotes: {
        "egf-coffee-cup": "A coffee cup on the dash is not a safety behaviour. Stick to what matters."
      },
      title: "See exactly what needs saying",
      cue: "Look at the chipper and mark the specific things you actually saw — facts, not impressions.",
      why: "Good feedback starts with specifics you saw with your own eyes: the chipper left running, the guard open, the ear protection hanging on the mirror. Specific, observable facts give the other person something to fix; impressions like careless or sloppy give them something to defend, and the conversation goes wrong from the first sentence."
    },
    {
      id: "choose-the-private-spot",
      kind: "select",
      target: "egf-private-spot",
      title: "Choose a private spot, soon",
      cue: "Ask for two minutes one to one, away from the truck, now — not at the end of the week.",
      why: "Soon and private are the two conditions that make feedback land. Soon, because the behaviour is fresh and has not become a habit; private, because a correction watched by the crew becomes about embarrassment rather than the chipper. Two minutes away from the truck, straight after, is usually all it takes."
    },
    {
      id: "build-the-feedback-in-order",
      kind: "sequence",
      targets: [
        "egf-order-saw",
        "egf-order-why",
        "egf-order-ask",
        "egf-order-next"
      ],
      itemNames: {
        "egf-order-saw": "1 · what I saw",
        "egf-order-why": "2 · why it matters",
        "egf-order-ask": "3 · ask what happened",
        "egf-order-next": "4 · agree what happens next"
      },
      title: "Give the feedback in order",
      cue: "What I saw, why it matters, what happened from your side, what we do next.",
      why: "Starting with what you saw keeps it about the behaviour; saying why it matters gives the reason rather than a rule; asking what happened invites the other person's side before you decide anything; agreeing what happens next turns the conversation into a plan. Skipping the ask is the most common mistake, and it is where the second half of this station comes from.",
      outOfOrderNote: "Out of order. Say what you saw before why it matters — a reason given before the fact sounds like a verdict."
    },
    {
      id: "hold-while-they-answer",
      kind: "hold",
      target: "egf-listen-spot",
      seconds: 6,
      title: "Hold still while they answer",
      cue: "They are telling you what happened from their side — hold, listen, do not rebut.",
      why: "Asking what happened only works if you then actually listen. Holding still while the other person answers — no rebuttal forming, no finishing their sentence — is where you learn whether the problem was carelessness, a rushed schedule or, as it turns out here, an instruction that was not as clear as you thought it was.",
      holdBreakNote: "You started rebutting before they finished. Listen all the way through — their side is the information you asked for."
    },
    {
      id: "turn-to-receiving",
      kind: "turn",
      target: "egf-role-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "RECEIVE"
      },
      title: "Turn from giving to receiving",
      cue: "They say your instructions were unclear. Turn the dial from GIVING to RECEIVING.",
      why: "The hardest moment in feedback is when it comes back to you mid-conversation. Turning deliberately from giver to receiver — the same senior worker, now listening to criticism of their own instructions — is the skill this station is built around, because a crew where feedback only flows downward never hears about the unclear instruction until someone is hurt."
    },
    {
      id: "pace-your-reaction",
      kind: "gauge",
      target: "egf-reaction-meter",
      gauge: {
        label: "REACTION",
        speed: 0.62,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too defensive and they stop talking; too apologetic and the safety point gets lost. Take it in, steady.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Take it in at a steady pace",
      cue: "Commit when your reaction reads steady — not defensive, not collapsing into apology.",
      why: "Two reactions stop feedback coming back: defending yourself, and apologising so much that the other person ends up comforting you. A steady reaction — a breath, a nod, \"say more about that\" — keeps the conversation about the instruction and the chipper, and shows the newer worker that telling a senior colleague something uncomfortable is safe here."
    },
    {
      id: "move-the-instruction-fix",
      kind: "drag",
      target: "egf-instruction-token",
      drag: {
        to: "egf-rewritten-spot",
        radius: 0.45,
        missNote: "The instruction has not been rewritten yet. Taking feedback means changing the thing — move it all the way."
      },
      title: "Fix your own instruction",
      cue: "Drag your instruction to the rewritten spot: shutdown steps in order, written on the card at the chipper.",
      why: "Taking feedback means acting on it, not only hearing it. Rewriting the shutdown instruction step by step and fixing it to the chipper is the proof that the feedback landed, and it fixes the actual cause: a newer worker following an unclear verbal instruction was always going to leave the guard open sooner or later."
    },
    {
      id: "thank-them-for-it",
      kind: "select",
      target: "egf-thank-you-card",
      title: "Thank them for telling you",
      cue: "\"Thank you for telling me. What else was unclear?\"",
      why: "Thanking someone for criticism, and asking for more, is the single sentence that decides whether they will ever give it again. It also often surfaces the next problem — a second unclear step, a tool nobody showed them how to use — which is information a senior worker cannot get any other way."
    },
    {
      id: "spot-the-defences",
      kind: "find",
      noHint: true,
      targets: [
        "egf-defence-arms-crossed",
        "egf-defence-yes-but",
        "egf-defence-changing-subject"
      ],
      itemNames: {
        "egf-defence-arms-crossed": "your own arms crossed",
        "egf-defence-yes-but": "a \"yes, but\" forming",
        "egf-defence-changing-subject": "the urge to change the subject to their mistake"
      },
      itemNotes: {
        "egf-defence-arms-crossed": "Crossed arms tell them you have stopped listening before you have said a word. Uncross them.",
        "egf-defence-yes-but": "\"Yes, but\" deletes the yes. Stop at yes.",
        "egf-defence-changing-subject": "Going back to their mistake while they talk about yours is defending by attack. Finish theirs later."
      },
      decoyNotes: {
        "egf-defence-nodding": "Nodding while they speak is listening. Keep it."
      },
      title: "Catch your own defences",
      cue: "Look at yourself in this conversation and mark each sign you are defending rather than listening.",
      why: "Defensiveness shows before it is spoken: arms crossing, a \"yes, but\" forming, the urge to steer back to the other person's mistake. Catching them in yourself is the emotional-intelligence skill underneath taking feedback, because the other person sees them long before you say anything, and stops talking when they do."
    },
    {
      id: "hold-the-working-relationship",
      kind: "track",
      target: "egf-relationship-meter",
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
        label: "TRUST",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Hold the working relationship as you go back to work",
      cue: "Keep the relationship in band walking back to the chipper — not awkward, not pretending nothing happened.",
      why: "The walk back to work after a feedback conversation decides whether it strengthened the working relationship or strained it. Holding it in band — working the rewritten shutdown together, a normal word about the next job — tells both people the conversation was about the work, which is what makes the next one easier.",
      holdBreakNote: "The relationship left the band — gone awkward or falsely cheerful. Work the task together and let it settle."
    },
    {
      id: "record-the-correction",
      kind: "select",
      target: "egf-training-log",
      doneLine: "Correction and rewrite recorded",
      title: "Record the correction and the rewritten instruction",
      cue: "Log the unsafe practice corrected and the instruction rewritten — both halves.",
      why: "8 CCR 3203 asks for unsafe practices found and corrected to be documented, and the honest record here has two halves: the chipper left running and the instruction that allowed it. Recording both keeps the log from blaming the newer worker alone and tells the next supervisor that the fix was to the instruction, not only to the person."
    },
    {
      id: "share-the-rewrite",
      kind: "select",
      target: "egf-share-board",
      doneLine: "Rewrite shared, credit given",
      title: "Share the rewrite and credit where it came from",
      cue: "At the next tailboard, show the rewritten shutdown and say who pointed out the gap.",
      why: "Crediting the newer worker in front of the crew for pointing out the unclear instruction turns a private correction into a public example of the crew's safety culture working. It tells everyone that feedback upward is welcome, and it gives the person who took the risk of saying it the recognition that makes them do it again."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "egf-crew-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the day",
      cue: "At the truck: how did today's conversation sit with you both?",
      why: "Feedback conversations can sit uneasily for both people after the day is over. A short check-in — how did that sit with you, anything you did not get to say — keeps the working relationship honest, with the steward and the employee assistance line named for anyone who wants them, as the programme's guide asks."
    }
  ],

  interrupts: [
    {
      id: "the-chipper-starts-to-jam",
      kind: "Machine jam",
      after: "hold-while-they-answer",
      delay: 3,
      seconds: 12,
      target: "egf-emergency-stop",
      alert: "The chipper, still running, starts to jam and another crew member reaches toward the feed to clear it.",
      cue: "Hit the emergency stop and call them back — the conversation waits until the machine is safe.",
      why: "The feedback conversation was about exactly this machine, and a hand reaching into a jammed feed beats any conversation. The emergency stop comes first, the reach is called back, and the machine is locked out before anyone clears it; then the conversation resumes with a very clear example.",
      missNote: "Nobody hit the stop, and the crew member's glove was caught at the feed before the chipper was shut down.",
      wrongNote: "That does not stop the machine. Hit the emergency stop and call them back."
    },
    {
      id: "the-supervisor-asks-who-was-at-fault",
      kind: "Supervisor question",
      after: "hold-the-working-relationship",
      delay: 3,
      seconds: 12,
      target: "egf-answer-with-fix",
      alert: "The supervisor walks up and asks, in front of the crew, who left the chipper running earlier.",
      cue: "Answer with the fix, not a name: \"We found a gap in the shutdown instruction and rewrote it.\"",
      why: "The supervisor's question invites a name, and giving one would undo everything the conversation just built. Answering with the fix — the gap found and the instruction rewritten — is honest, keeps the correction where it belongs, and tells the supervisor the thing they actually need to know.",
      missNote: "The newer worker was named in front of the crew, went quiet for the rest of the day, and did not report the next near miss.",
      wrongNote: "That does not answer the supervisor with the fix. Tell them the instruction was rewritten."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = EGF_ACCENT;
    const CSS = EGF_CSS;
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d6f72", base2: "#5f6164", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    // the crew's worksite: barriers, a trailer, a work truck bed and pallets
    const stripeTex = surfaceTexture((cx, w, h) => { cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#1a1a1a"; for (let i = -h; i < w; i += 32) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + 16, 0); cx.lineTo(i + 16 + h, h); cx.lineTo(i + h, h); cx.fill(); } }, { repeat: 2, px: 128 });
    const stripeMat = texturedMat(stripeTex, { rough: 0.6, metal: 0.05 });
    for (let i = 0; i < 8; i++) {
      const a = -1.5 + i * 0.43, bx = Math.sin(a) * 3.4, bz = -Math.cos(a) * 3.4 - 0.6;
      const bar = group(g, bx, 0, bz, -a);
      box(bar, 0.9, 0.18, 0.05, 0, 0.8, 0, 0xf2c14b, { rough: 0.6 }).material = stripeMat;
      for (const sx of [-0.4, 0.4]) box(bar, 0.04, 0.8, 0.04, sx, 0.4, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
      box(bar, 0.9, 0.04, 0.3, 0, 0.02, 0, 0x2b2f35, { rough: 0.7 });
    }
    const siding = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#d8dde2", base2: "#c8cdd2", seam: "rgba(40,40,40,0.35)" }), { repeat: 2, px: 256 });
    const trailer = group(g, -2.6, 0, -4.9, 0.2);
    const shell = box(trailer, 3.0, 2.2, 1.6, 0, 1.3, 0, 0xd8dde2, { rough: 0.6 });
    shell.material = texturedMat(siding, { rough: 0.6, metal: 0.1 });
    box(trailer, 0.8, 1.8, 0.03, 0.6, 1.1, 0.82, 0x6b4a2e, { rough: 0.6 });
    for (const sx of [-1.1, 1.1]) cyl(trailer, 0.25, 0.25, 0.2, sx, 0.25, 0.7, 0x1a1a1a, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    const truck = group(g, 2.8, 0, -4.6, -0.3);
    box(truck, 1.8, 0.9, 3.6, 0, 0.75, 0, 0xf4f4f4, { rough: 0.5, metal: 0.3 });
    box(truck, 1.7, 0.7, 1.2, 0, 1.55, -1.1, 0xf4f4f4, { rough: 0.4, metal: 0.3 });
    box(truck, 1.6, 0.4, 0.04, 0, 1.6, -1.72, 0x2a3a4a, { rough: 0.1, metal: 0.4 });
    for (const [sx, sz] of [[-0.9, -1.1], [0.9, -1.1], [-0.9, 1.1], [0.9, 1.1]]) cyl(truck, 0.32, 0.32, 0.22, sx, 0.32, sz, 0x1a1a1a, { rough: 0.8, seg: 16 }).rotation.z = Math.PI / 2;
    box(truck, 1.82, 0.12, 0.1, 0, 0.5, 1.85, ACC, { rough: 0.5, emissive: ACC, ei: 0.3 });
    for (let i = 0; i < 3; i++) {
      const pal = group(g, 3.5, 0.0, -1.6 + i * 1.1, 0.1 * i);
      box(pal, 0.9, 0.12, 0.9, 0, 0.06, 0, 0x8a6a4a, { rough: 0.8 });
      box(pal, 0.8, 0.5, 0.8, 0, 0.37, 0, 0xc8b89a, { rough: 0.9 });
    }
    for (let i = 0; i < 6; i++) { const c = group(g, -3.7 + (i % 2) * 0.35, 0, -1.8 + i * 0.6); cyl(c, 0.14, 0.02, 0.5, 0, 0.26, 0, 0xff6a1a, { rough: 0.6, seg: 12 }); box(c, 0.32, 0.03, 0.32, 0, 0.015, 0, 0x1a1a1a, { rough: 0.8 }); }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.90, -0.27, "egf-chipper-left-running", "the chipper left running unattended", {});
    bead(-1.42, 1.18, -0.62, "egf-guard-open", "the feed guard left open", {});
    bead(-1.03, 1.46, -0.71, "egf-no-ear-protection", "ear protection hanging on the mirror", {});
    bead(-1.08, 0.90, -1.11, "egf-coffee-cup", "Coffee cup on the dash", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "egf-order-saw", "1 · what I saw", {});
    bead(-0.58, 1.46, -1.44, "egf-order-why", "2 · why it matters", {});
    bead(-0.24, 0.90, -1.23, "egf-order-ask", "3 · ask what happened", {});
    bead(0, 1.18, -1.55, "egf-order-next", "4 · agree what happens next", {});
    bead(0.24, 1.46, -1.23, "egf-listen-spot", "Listening, no rebuttal", {});
    bead(0.58, 0.90, -1.44, "egf-defence-arms-crossed", "your own arms crossed", {});
    bead(0.68, 1.18, -1.05, "egf-defence-yes-but", "a \"yes, but\" forming", {});
    bead(1.08, 1.46, -1.11, "egf-defence-changing-subject", "the urge to change the subject to their mistake", {});
    bead(1.03, 0.90, -0.71, "egf-defence-nodding", "Nodding along", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "egf-emergency-stop", "Hit the stop, lock it out", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "egf-answer-with-fix", "Answer with the fix", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "egf-private-spot", "One to one", "ONE TO ONE.\nAWAY FROM THE TRUCK", { ry: 1.20 });
    dials["egf-role-dial"] = dial(-1.89, -1.4, 0.93, "egf-role-dial", "Giver to receiver");
    meters["egf-reaction-meter"] = meter(-1.45, -1.85, 0.67, "egf-reaction-meter", "Your reaction");
    tokens["egf-instruction-token"] = token(-0.92, -2.16, 0.40, "egf-instruction-token", "My instruction");
    spots["egf-rewritten-spot"] = spot(-0.31, -2.33, 0.13, "egf-rewritten-spot", "Rewritten, step by step");
    card(0.31, 1.35, -2.33, "egf-thank-you-card", "Thank you, tell me more", "THANK YOU.\nTELL ME MORE", { ry: -0.13 });
    meters["egf-relationship-meter"] = meter(0.92, -2.16, -0.40, "egf-relationship-meter", "Working relationship");
    boards["egf-training-log"] = board(1.45, -1.85, -0.67, "egf-training-log", "Training log");
    boards["egf-share-board"] = board(1.89, -1.4, -0.93, "egf-share-board", "Crew tailboard");
    boards["egf-crew-checkin"] = board(2.19, -0.85, -1.20, "egf-crew-checkin", "End-of-day check-in");
    hazardCard(-1.53, 0.72, -1.21, "call-them-careless", "Tell them they are careless?", "YOU'RE\nCARELESS", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "correct-them-in-front-of-the-crew", "Correct them at the truck, in front of everyone?", "HEY, EVERYONE\nLOOK AT THIS", 0.30);
    hazardCard(0.58, 0.72, -1.86, "defend-your-instructions", "Explain why your instructions were fine?", "I WAS\nPERFECTLY CLEAR", -0.30);
    hazardCard(1.53, 0.72, -1.21, "save-it-for-the-annual-review", "Save it for the annual review?", "I'LL NOTE IT\nFOR LATER", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["The behaviour, not the person."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    crew["senior"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, "Senior worker", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["supervisor"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Supervisor", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["newer"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Newer worker", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["steward"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Union steward", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-chipper-starts-to-jam"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["the-chipper-starts-to-jam"].visible = false;
    arrivals["the-supervisor-asks-who-was-at-fault"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-supervisor-asks-who-was-at-fault"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-instruction-fix") { const s = spots["egf-rewritten-spot"]; tokens["egf-instruction-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-correction") repaint(boards["egf-training-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Correction and rewrite recorded"], "#59c97b"));
        if (step.id === "share-the-rewrite") repaint(boards["egf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Rewrite shared, credit given"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["egf-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "thank-them-for-it") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("teammate-mistake", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "share-the-rewrite") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 0 }) : "Say the next job, not the last mistake.");
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
        if (it.id === "the-chipper-starts-to-jam") { crew["newer"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Stopped, called back, locked out — the conversation can resume with a clear example."); }
        if (it.id === "the-supervisor-asks-who-was-at-fault") { crew["steward"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Answered with the fix. Nobody was named, and the supervisor knows what changed."); }
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
