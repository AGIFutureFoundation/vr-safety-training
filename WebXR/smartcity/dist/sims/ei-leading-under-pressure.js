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

// SmartCiti.X~ Civic Leadership and Emotional Intelligence VR — leading
// under pressure. A water-main repair crew is behind schedule, the street
// has to reopen for the morning, and the crew is tired and starting to cut
// corners. The lead keeps the team steady: a calm voice, one clear next
// step, the safety steps kept when the clock says skip them, and credit
// shared at the end. Structure borrowed from NIMS and ICS — one lead, a
// manageable span, clear objectives — sized down to a single crew.
//
// Every person is invented. No statistic, study or quotation is asserted.

const ELP_ACCENT = 0xb07aff;
const ELP_CSS = "#b07aff";

export const SIM_EI_LEADING_UNDER_PRESSURE = {
  id: "ei-leading-under-pressure",
  index: "732",
  domain: "Civic",
  trade: "City public works crew lead",
  category: "Community Environmental Justice",
  weather: "overcast",
  certification: "NIMS and ICS for the structure a lead keeps under pressure — unity of command, a manageable span of control and objectives stated plainly; 8 CCR 3203, the employer's Injury and Illness Prevention Program, for hazards that are not traded for schedule; the MUTCD for the work zone that has to stay set until the street reopens; SAMHSA's trauma-informed principles of safety, peer support and empowerment for a tired crew; Psychological First Aid for the calm, practical presence a lead offers; SEIU and AFSCME for the public-works members whose contract sets rest breaks and overtime. The emotional-intelligence steps follow the programme's own guide",
  name: "Leading Under Pressure",
  title: simTitle("Leading Under Pressure"),
  tagline: "The schedule slips and the crew is tired: a calm voice, one clear next step, no safety step traded for time, and credit shared at the end",
  accent: ELP_ACCENT,
  accentCss: ELP_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"steady-lead","name":"Steady Lead","note":"A slipping schedule led with a calm voice, one next step at a time, every safety step kept and every crew member credited"},

  supportLine: "your supervisor, your union steward, or the employee assistance line — leading a tired crew against the clock is heavy, and worth talking through",

  game: system({
    name: "Lead Board",
    currency: "STEADY",
    ranks: ["Crew Member","Lead Hand","Crew Lead","Supervisor","Mentor"],
    badges: [
      { id: "clean-read", name: "Read the Crew", note: "Everything in the opening scan found first time", test: AWARD.stepClean("read-the-crew-under-pressure") },
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
    "skip-the-trench-check-to-save-time": "You told the crew to skip the trench inspection this once to catch up. A hazard traded for schedule is still a hazard, and 8 CCR 3203 asks the employer to correct hazards, not defer them; the time a skipped check saves is nothing next to what a collapse or a struck line costs the crew and the street.",
    "shout-to-speed-them-up": "You raised your voice to push the crew faster. A lead who shouts under pressure passes the pressure straight down, and a tired crew hurried by shouting makes the mistakes that cost more time than they save; the calm voice is not softness, it is the fastest way through.",
    "take-the-credit-with-the-supervisor": "You told the supervisor you had pulled the job back on schedule. Credit taken by the lead for a crew's overtime tells every tired worker that the effort was the lead's, and SAMHSA's principles of peer support and empowerment are built on the opposite — credit shared is what brings a crew back next time.",
    "cancel-the-rest-break": "You cancelled the crew's rest break to make up the time. Rest breaks are set in the contract SEIU and AFSCME members work under, and a crew with no break in a long night shift is a crew whose attention is going; the break is part of the schedule, not the slack in it."
  },

  lateNotes: {
    "elp-shift-log": "The shift log is written once the street is reopened — nothing to record yet.",
    "elp-crew-checkin": "The crew check-in comes at the very end of the shift."
  },

  steps: [
    {
      id: "read-the-crew-under-pressure",
      kind: "find",
      noHint: true,
      targets: [
        "elp-rushing-the-shoring",
        "elp-yawning-operator",
        "elp-snapping-at-each-other"
      ],
      itemNames: {
        "elp-rushing-the-shoring": "a worker rushing the trench shoring",
        "elp-yawning-operator": "the operator yawning at the controls",
        "elp-snapping-at-each-other": "two crew members snapping at each other"
      },
      itemNotes: {
        "elp-rushing-the-shoring": "Rushing the shoring is the schedule talking. That is the first place pressure becomes a hazard.",
        "elp-yawning-operator": "A yawning operator at the controls is fatigue at the most dangerous seat. A break or a swap.",
        "elp-snapping-at-each-other": "Snapping at each other is pressure turning into conflict. Calm voice first, then the next step."
      },
      decoyNotes: {
        "elp-flagger-steady": "The flagger holding the zone steadily is doing fine. Look for where pressure is showing."
      },
      title: "Read where the pressure is showing",
      cue: "Look across the crew and mark where the slipping schedule is turning into a risk.",
      why: "Pressure shows in a crew before anyone says the word behind: a worker rushing the shoring, the operator yawning at the controls, two people snapping at each other. Each is the schedule turning into a hazard in a different way, and a lead who sees them first can decide what the crew needs before the pressure decides for them."
    },
    {
      id: "state-the-objectives",
      kind: "select",
      target: "elp-objectives-card",
      title: "State the objectives in order",
      cue: "Safe trench, main repaired, street open — in that order, out loud.",
      why: "ICS asks every incident to run on objectives stated plainly and in priority, and the same discipline steadies a crew. Saying out loud that a safe trench comes before the repaired main, and both before the reopened street, settles the question every tired worker is silently asking — which corner can we cut — before anyone has to ask it."
    },
    {
      id: "build-the-next-steps-in-order",
      kind: "sequence",
      targets: [
        "elp-order-breathe",
        "elp-order-facts",
        "elp-order-one-step",
        "elp-order-check"
      ],
      itemNames: {
        "elp-order-breathe": "1 · breathe, lower your voice",
        "elp-order-facts": "2 · say where we are",
        "elp-order-one-step": "3 · give one next step",
        "elp-order-check": "4 · check it landed"
      },
      title: "Lead in the order pressure needs",
      cue: "Breathe, say where we are, give one next step, check it landed.",
      why: "The lead's own calm comes first because the crew reads it before they hear anything. Saying plainly where the job stands removes the rumours; one next step, not a list, gives tired people something they can do; and checking it landed catches the worker who nodded without hearing. Out of order, a lead gives instructions to a crew that is still reacting to the lead's own stress.",
      outOfOrderNote: "Out of order. Your own calm comes first — instructions given in a stressed voice carry the stress with them."
    },
    {
      id: "hold-a-calm-voice",
      kind: "hold",
      target: "elp-calm-spot",
      seconds: 6,
      title: "Hold a calm voice at the tailboard",
      cue: "Gather the crew at the tailboard and hold a low, level voice while you say where the job stands.",
      why: "A lead's voice is the crew's weather. Holding it low and level at the tailboard, while saying honestly that the job is behind, tells the crew the situation is serious and manageable at once — which is the state in which tired people make their best decisions, and the presence Psychological First Aid describes as the first thing people under stress need.",
      holdBreakNote: "Your voice climbed before the hold was up. The crew takes its tone from you — bring it back down."
    },
    {
      id: "turn-the-crew-rotation",
      kind: "turn",
      target: "elp-rotation-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "ROTATE"
      },
      title: "Turn the dial to rotate the tired operator",
      cue: "Rotate the yawning operator off the controls and a rested, qualified crew member on.",
      why: "Fatigue at the controls of an excavator beside an open trench and a live main is the most dangerous kind of tired. Rotating the operator to a lighter task, with a rested and qualified crew member taking the seat, keeps the job moving without asking anyone to push through the one thing that should not be pushed through."
    },
    {
      id: "set-the-pace",
      kind: "gauge",
      target: "elp-pace-meter",
      gauge: {
        label: "PACE",
        speed: 0.62,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too slow and the street stays shut; too fast and the corners get cut. Set a pace the crew can hold safely."
      },
      title: "Set a pace the crew can hold",
      cue: "Commit when the pace reads right — steady enough to recover time, never fast enough to skip a step.",
      why: "Under schedule pressure the instinct is to go as fast as possible, and a crew pushed flat-out for an hour then slows to a crawl and starts making mistakes. A steady pace the crew can hold safely until the street reopens usually recovers more time than a sprint, and it keeps every safety step in the sequence."
    },
    {
      id: "move-the-break-to-its-slot",
      kind: "drag",
      target: "elp-break-token",
      drag: {
        to: "elp-break-slot",
        radius: 0.45,
        missNote: "The break is not back in the plan. Rest is part of the schedule — move it all the way to its slot."
      },
      title: "Put the rest break back in the plan",
      cue: "Drag the rest break from the cancelled pile to its slot in the shift plan.",
      why: "Protecting the rest break when the schedule slips is the clearest signal a lead can give that the crew matters more than the clock. It is also practical: tired workers take longer to do everything, and a break taken on time buys back attention for the hardest part of the job, which is still ahead in the backfill and the paving."
    },
    {
      id: "say-where-we-are",
      kind: "select",
      target: "elp-calm-voice-card",
      title: "Tell the crew the truth about the schedule",
      cue: "\"Here's where we are: two hours behind, the trench is safe, and this is the next thing we do.\"",
      why: "Crews under pressure fill silence with rumours — the supervisor is furious, we will be here till noon. Telling them the truth plainly, with the good news that the trench is safe and a single next step, replaces the rumour with a plan, and trusts the crew with information in the way SAMHSA's principles of transparency describe."
    },
    {
      id: "spot-the-corners-being-cut",
      kind: "find",
      noHint: true,
      targets: [
        "elp-cut-no-spotter",
        "elp-cut-ladder-moved",
        "elp-cut-cones-pulled"
      ],
      itemNames: {
        "elp-cut-no-spotter": "the excavator swinging with no spotter",
        "elp-cut-ladder-moved": "the trench ladder pulled out early",
        "elp-cut-cones-pulled": "cones pulled back before the zone is clear"
      },
      itemNotes: {
        "elp-cut-no-spotter": "A swing with no spotter beside an open trench is the corner that hurts someone first. Stop the swing.",
        "elp-cut-ladder-moved": "The ladder is the way out of the trench. It stays until the last person is out.",
        "elp-cut-cones-pulled": "Cones pulled early put traffic into a zone that is still a worksite. Put them back until it is clear."
      },
      decoyNotes: {
        "elp-cut-tools-staged": "Tools staged ready for the paving is good preparation, not a corner cut."
      },
      title: "Find the corners being cut",
      cue: "Walk the site as the pace picks up and mark each safety step that is quietly disappearing.",
      why: "Under pressure, safety steps rarely get skipped by decision; they disappear one at a time because each one looks small. A swing with no spotter, the trench ladder pulled early, cones taken back before the zone is clear — a lead walking the site as the pace picks up is the only thing that catches them before one becomes the incident."
    },
    {
      id: "hold-the-crew-steady",
      kind: "track",
      target: "elp-steady-meter",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.15,
        label: "STEADY"
      },
      title: "Hold the crew steady through the backfill",
      cue: "Keep steadiness in band through the last stretch — not flagging, not frantic.",
      why: "The last stretch of a long night is where tired crews either flag or rush. Holding steadiness in band through the backfill — the next step named each time, a word to whoever looks tired, the pace unchanged — is what gets the street reopened without the incident that would have closed it again.",
      holdBreakNote: "Steadiness left the band — flagging or frantic. Name the next step again and reset the pace."
    },
    {
      id: "log-the-shift",
      kind: "select",
      target: "elp-shift-log",
      doneLine: "Delay, rotation and break recorded",
      title: "Log the shift honestly",
      cue: "Record why the job slipped, the operator rotation, the break kept and the time the street reopened.",
      why: "An honest shift log records the delay and its cause alongside the decisions made about it — the operator rotated, the break kept, no safety step skipped. That record protects the crew if anyone asks why the street opened late, and it gives the next job's planning the real time a repair like this takes."
    },
    {
      id: "share-the-credit",
      kind: "select",
      target: "elp-credit-board",
      doneLine: "Credit shared by name",
      title: "Share the credit with the supervisor, by name",
      cue: "Report the reopened street and name the crew members who made it happen.",
      why: "When the supervisor asks how the job was pulled back, the answer is the crew, by name: the operator who took the seat, the worker who kept the shoring right, the flagger who held the zone all night. Credit shared upward is what the crew will remember about this shift long after the delay is forgotten."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "elp-crew-checkin",
      doneLine: "Crew checked in",
      title: "Check in with the crew before they drive home",
      cue: "At the truck: how is everyone, and is anyone too tired to drive?",
      why: "A long night shift ends with a drive home, and a tired worker behind the wheel is the last hazard of the job. Asking how everyone is, and whether anyone is too tired to drive, with the steward and the employee assistance line named for anyone carrying the night with them, is the check-in the programme's guide offers."
    }
  ],

  interrupts: [
    {
      id: "the-supervisor-demands-faster",
      kind: "Pressure from above",
      after: "hold-a-calm-voice",
      delay: 3,
      seconds: 12,
      target: "elp-answer-with-plan",
      alert: "The supervisor calls the lead's radio demanding to know why the job is behind and saying to skip whatever it takes.",
      cue: "Answer with the plan and the objectives, calmly — safety first, then the repair, then the street.",
      why: "Pressure from above is where a lead's calm matters most, because whatever comes over the radio will be passed to the crew. Answering with the plan and the objectives in order, calmly, holds the line on safety and gives the supervisor what they actually need: a realistic time and a reason to trust it.",
      missNote: "The lead passed the supervisor's shouting straight to the crew, and within ten minutes somebody had pulled the trench ladder to save time.",
      wrongNote: "That does not answer the supervisor. Give them the plan and the objectives, calmly."
    },
    {
      id: "a-trench-wall-sloughs",
      kind: "Trench warning",
      after: "hold-the-crew-steady",
      delay: 3,
      seconds: 12,
      target: "elp-everyone-out",
      alert: "A section of soil sloughs off the trench wall beside the shoring while a crew member is down in it.",
      cue: "Call everyone out by the ladder and stop work in the trench — the schedule stops with it.",
      why: "Soil coming off a trench wall is a warning that beats any schedule. Everyone out by the ladder, work stopped, and the competent person reinspects before anyone goes back in; the lead who calls it without hesitation, two hours behind, is showing the crew what the objectives list meant.",
      missNote: "Nobody called it, the crew member stayed in the trench to finish the joint, and a second slough buried their boots before they climbed out.",
      wrongNote: "That does not get anyone out of the trench. Call everyone out and stop work."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = ELP_ACCENT;
    const CSS = ELP_CSS;
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
    bead(-1.22, 0.90, -0.27, "elp-rushing-the-shoring", "a worker rushing the trench shoring", {});
    bead(-1.42, 1.18, -0.62, "elp-yawning-operator", "the operator yawning at the controls", {});
    bead(-1.03, 1.46, -0.71, "elp-snapping-at-each-other", "two crew members snapping at each other", {});
    bead(-1.08, 0.90, -1.11, "elp-flagger-steady", "Flagger holding steady", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "elp-order-breathe", "1 · breathe, lower your voice", {});
    bead(-0.58, 1.46, -1.44, "elp-order-facts", "2 · say where we are", {});
    bead(-0.24, 0.90, -1.23, "elp-order-one-step", "3 · give one next step", {});
    bead(0, 1.18, -1.55, "elp-order-check", "4 · check it landed", {});
    bead(0.24, 1.46, -1.23, "elp-calm-spot", "Calm voice at the tailboard", {});
    bead(0.58, 0.90, -1.44, "elp-cut-no-spotter", "the excavator swinging with no spotter", {});
    bead(0.68, 1.18, -1.05, "elp-cut-ladder-moved", "the trench ladder pulled out early", {});
    bead(1.08, 1.46, -1.11, "elp-cut-cones-pulled", "cones pulled back before the zone is clear", {});
    bead(1.03, 0.90, -0.71, "elp-cut-tools-staged", "Tools staged for the paving", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "elp-answer-with-plan", "Answer with the plan", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "elp-everyone-out", "Everyone out, stop work", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "elp-objectives-card", "Tonight's objectives", "1 · SAFE TRENCH\n2 · MAIN REPAIRED\n3 · STREET OPEN", { ry: 1.20 });
    dials["elp-rotation-dial"] = dial(-1.89, -1.4, 0.93, "elp-rotation-dial", "Rotate the operator");
    meters["elp-pace-meter"] = meter(-1.45, -1.85, 0.67, "elp-pace-meter", "Crew pace");
    tokens["elp-break-token"] = token(-0.92, -2.16, 0.40, "elp-break-token", "Rest break");
    spots["elp-break-slot"] = spot(-0.31, -2.33, 0.13, "elp-break-slot", "Protected in the plan");
    card(0.31, 1.35, -2.33, "elp-calm-voice-card", "Here's where we are", "HERE'S WHERE\nWE ARE", { ry: -0.13 });
    meters["elp-steady-meter"] = meter(0.92, -2.16, -0.40, "elp-steady-meter", "Crew steadiness");
    boards["elp-shift-log"] = board(1.45, -1.85, -0.67, "elp-shift-log", "Shift log");
    boards["elp-credit-board"] = board(1.89, -1.4, -0.93, "elp-credit-board", "Report to the supervisor");
    boards["elp-crew-checkin"] = board(2.19, -0.85, -1.20, "elp-crew-checkin", "End-of-shift check-in");
    hazardCard(-1.53, 0.72, -1.21, "skip-the-trench-check-to-save-time", "Skip the trench check this once?", "SKIP THE\nCHECK TONIGHT", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "shout-to-speed-them-up", "Raise your voice to hurry them?", "FASTER!\nCOME ON!", 0.30);
    hazardCard(0.58, 0.72, -1.86, "take-the-credit-with-the-supervisor", "Tell the supervisor you saved it?", "I PULLED\nIT BACK", -0.30);
    hazardCard(1.53, 0.72, -1.21, "cancel-the-rest-break", "Cancel the break to catch up?", "NO BREAK.\nWE'RE BEHIND", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Calm voice. One next step."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    crew["lead"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0xf2c14b, trousers: 0x2b2f35 });
    holoTag(g, "Crew lead", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["supervisor"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Supervisor", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["operator"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0xff6a1a, trousers: 0x2b2f35 });
    holoTag(g, "Operator", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["competent"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Competent person", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-supervisor-demands-faster"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-supervisor-demands-faster"].visible = false;
    arrivals["a-trench-wall-sloughs"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0xf2c14b, atStation: true });
    arrivals["a-trench-wall-sloughs"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-the-break-to-its-slot") { const s = spots["elp-break-slot"]; tokens["elp-break-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "log-the-shift") repaint(boards["elp-shift-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Delay, rotation and break recorded"], "#59c97b"));
        if (step.id === "share-the-credit") repaint(boards["elp-credit-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Credit shared by name"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["elp-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Crew checked in"], "#59c97b"));
        if (step.id === "say-where-we-are") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("huddle-disagreement", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "share-the-credit") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 1 }) : "Say the next job, not the last mistake.");
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
        if (it.id === "the-supervisor-demands-faster") { crew["supervisor"].position.set(-2.4, 0, -0.2); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Plan given, calmly. The supervisor has a time; the crew has the same next step."); }
        if (it.id === "a-trench-wall-sloughs") { crew["competent"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Everyone out, work stopped, reinspection first — the schedule waits for the trench."); }
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
