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

// SmartCiti.X~ Civic Leadership and Emotional Intelligence VR — conflict on
// the crew. Two members of a city street maintenance crew clash over how
// the work zone should be set, voices rising beside live traffic. The crew
// lead's job is to notice, name it, slow it down and get to the fix — the
// work zone made safe first, the disagreement heard in turn, and a decision
// both can work under. Emotional intelligence is taught here as a safety
// skill: an angry crew beside traffic is a crew not watching the traffic.
//
// Every person is invented. No statistic, study or quotation is asserted.

const ECC_ACCENT = 0xf28c38;
const ECC_CSS = "#f28c38";

export const SIM_EI_CONFLICT_ON_THE_CREW = {
  id: "ei-conflict-on-the-crew",
  index: "730",
  domain: "Civic",
  trade: "City street maintenance crew lead",
  category: "Community Environmental Justice",
  weather: "overcast",
  certification: "8 CCR 3203, the employer's Injury and Illness Prevention Program, for how a hazard a worker raises is heard and corrected and how a threat between co-workers is reported; the MUTCD for the temporary traffic control the crew is arguing about; SAMHSA's trauma-informed principles of safety, trustworthiness, peer support and collaboration; Psychological First Aid for calm, practical presence with somebody upset; SEIU and AFSCME for the public-works members whose contract and steward process sit behind any discipline. The emotional-intelligence steps follow the programme's own guide",
  name: "Conflict on the Crew",
  title: simTitle("Conflict on the Crew"),
  tagline: "Two crew members clash beside live traffic: notice it, name it, slow it down, and get to the fix — the work zone safe first",
  accent: ECC_ACCENT,
  accentCss: ECC_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"cooled-and-fixed","name":"Cooled and Fixed","note":"A crew conflict noticed early, slowed down, heard on both sides and settled into a decision the crew worked under"},

  supportLine: "your supervisor, your union steward, or the employee assistance line — a conflict on the crew that stays with you is worth talking through",

  game: system({
    name: "Crew Board",
    currency: "TRUST",
    ranks: ["Crew Member","Senior Worker","Crew Lead","Supervisor","Mentor"],
    badges: [
      { id: "clean-read", name: "Noticed Early", note: "Everything in the opening scan found first time", test: AWARD.stepClean("notice-the-conflict-early") },
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
    "argue-it-out-in-the-lane": "You let the argument carry on standing in the open lane beside traffic. Two people facing each other in anger are two people facing away from the traffic, and the MUTCD work zone exists precisely so that nobody is standing in the path of vehicles unprotected; the conversation moves behind the barrier first.",
    "pick-the-senior-worker-by-default": "You sided with the more senior crew member without hearing the other. Deciding by seniority tells the newer worker that raising a safety concern is pointless, and 8 CCR 3203 asks the employer to have a way for any worker to raise a hazard without fear — which starts with actually hearing them.",
    "threaten-a-write-up-on-the-spot": "You threatened both of them with a write-up in front of the crew. Discipline announced in anger in front of others shames people rather than fixing anything, and any real discipline runs through the process SEIU and AFSCME contracts set out, with a steward, not on the shoulder of a road.",
    "tell-them-to-just-get-over-it": "You told them both to get over it and get back to work. Waving off a conflict without hearing it pushes it underground, where it comes back as silence on the radio and a cone left unset; SAMHSA's trauma-informed principles put safety and trust first, and neither comes from being told to stop feeling something."
  },

  lateNotes: {
    "ecc-tailboard-log": "The tailboard note is written once the crew is back working under the decision — nothing to record yet.",
    "ecc-crew-checkin": "The crew check-in comes at the very end of the shift."
  },

  steps: [
    {
      id: "notice-the-conflict-early",
      kind: "find",
      noHint: true,
      targets: [
        "ecc-raised-voices",
        "ecc-back-to-traffic",
        "ecc-tool-thrown-down"
      ],
      itemNames: {
        "ecc-raised-voices": "two raised voices at the taper",
        "ecc-back-to-traffic": "a crew member with their back to traffic",
        "ecc-tool-thrown-down": "a shovel thrown down on the asphalt"
      },
      itemNotes: {
        "ecc-raised-voices": "Raised voices are the first sign and the easiest to act on. Walk over before it becomes the third sign.",
        "ecc-back-to-traffic": "Anyone arguing with their back to traffic has stopped watching it. That is the safety problem inside the people problem.",
        "ecc-tool-thrown-down": "A tool thrown down is anger turning physical, and a trip hazard in the work zone. Pick it up on the way in."
      },
      decoyNotes: {
        "ecc-flagger-waving": "The flagger waving traffic through is doing their job — leave them to it."
      },
      title: "Notice the conflict while it is small",
      cue: "Look across the work zone: where are the signs that two people on the crew are clashing?",
      why: "Crew conflicts are easiest to settle in their first minute and hardest after the third. Raised voices, a crew member with their back to live traffic and a tool thrown down on the asphalt are three signs of the same thing at different stages, and a lead who notices the first one walks over before the last one happens."
    },
    {
      id: "move-everyone-behind-the-barrier",
      kind: "select",
      target: "ecc-barrier-spot",
      title: "Move the conversation behind the barrier",
      cue: "Before anything is said about who is right, both crew members step behind the barrier.",
      why: "The work zone is set to keep people out of the path of traffic, and an argument pulls people's attention off it. Moving the conversation behind the barrier first is not avoiding the conflict; it is making sure the conflict is the only risk left in the conversation, which is the order a crew lead keeps under the MUTCD and the employer's injury prevention programme."
    },
    {
      id: "build-the-slowdown-in-order",
      kind: "sequence",
      targets: [
        "ecc-order-notice",
        "ecc-order-name",
        "ecc-order-slow",
        "ecc-order-fix"
      ],
      itemNames: {
        "ecc-order-notice": "1 · notice it",
        "ecc-order-name": "2 · name it out loud",
        "ecc-order-slow": "3 · slow it down",
        "ecc-order-fix": "4 · get to the fix"
      },
      title: "Take the conflict in order",
      cue: "Notice, name, slow down, then fix — never straight to the fix.",
      why: "Jumping straight to the fix while two people are still angry produces a decision neither will work under. Naming what you see makes the heat something the crew can talk about rather than act on; slowing down lets both people be heard; only then is there room for a fix that sticks through the rest of the shift.",
      outOfOrderNote: "Out of order. Name it out loud before trying to fix it — a fix handed to two angry people is a fix neither follows."
    },
    {
      id: "hold-a-steady-presence",
      kind: "hold",
      target: "ecc-steady-spot",
      seconds: 6,
      title: "Stand steady between them and breathe",
      cue: "Stand side-on between the two, voice low, hands open — hold it.",
      why: "Psychological First Aid describes calm, practical presence as the first thing someone upset needs, and a lead standing side-on between two crew members with open hands and a low voice is that presence in a work zone. Holding it lets both bodies come down before the words start, which is what makes the words useful when they come.",
      holdBreakNote: "You moved or raised your voice before the hold was up. Your calm is what the crew borrows — stand steady and breathe."
    },
    {
      id: "turn-the-pause-dial",
      kind: "turn",
      target: "ecc-pause-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "PAUSE"
      },
      title: "Turn the dial to pause that task",
      cue: "Pause the one task they were clashing over — the rest of the crew keeps working safely.",
      why: "Pausing the task in dispute, rather than the whole job, takes the pressure off without stopping the crew. It tells both workers the disagreement is worth a few minutes, and it means nobody is setting cones or cutting asphalt while still angry, which is when a concern that started as a disagreement becomes an injury."
    },
    {
      id: "pace-the-conversation",
      kind: "gauge",
      target: "ecc-pace-meter",
      gauge: {
        label: "PACE",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Rushed and nobody is heard; dragged out and it becomes a trial. Keep it short and complete.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Keep the conversation at the right pace",
      cue: "Commit when the pace reads right — each person heard fully, then on to the fix.",
      why: "A conflict conversation rushed through to get back to work leaves both people feeling unheard and the disagreement intact; one dragged out on the shoulder of a road turns into a hearing. The right pace is short and complete: each person says what they saw and why it mattered, the lead repeats it back, and the crew moves to the decision."
    },
    {
      id: "move-to-the-fix",
      kind: "drag",
      target: "ecc-decision-token",
      drag: {
        to: "ecc-agreed-spot",
        radius: 0.45,
        missNote: "The decision is not on the board yet. A fix both can work under goes all the way to agreed — say it and get two nods."
      },
      title: "Move the decision to agreed",
      cue: "Drag the decision token — longer taper, as the traffic plan shows — to the agreed spot, and get a nod from each.",
      why: "Both crew members were arguing about something real: one wanted a longer taper, the other wanted to finish before the traffic peak. A decision that uses the traffic plan as the tiebreaker, rather than seniority, is one both can accept, and getting a nod from each is what turns the lead's decision into the crew's."
    },
    {
      id: "hear-both-in-turn",
      kind: "select",
      target: "ecc-both-heard-card",
      title: "Hear both sides in turn",
      cue: "\"You first — then you.\" Each speaks without interruption and you say back what you heard.",
      why: "Hearing both sides in turn, and saying back what each one said, is how a crew lead shows that neither will be decided against without being heard. It is also usually where the fix appears, because two people who both care about the job were almost always arguing about different parts of the same concern."
    },
    {
      id: "spot-what-is-still-hot",
      kind: "find",
      noHint: true,
      targets: [
        "ecc-hot-not-talking",
        "ecc-hot-crew-muttering",
        "ecc-hot-radio-silent"
      ],
      itemNames: {
        "ecc-hot-not-talking": "the two still not talking to each other",
        "ecc-hot-crew-muttering": "the rest of the crew muttering and picking sides",
        "ecc-hot-radio-silent": "the radio gone quiet between them"
      },
      itemNotes: {
        "ecc-hot-not-talking": "Not talking after a fix means it is agreed but not settled. A second word before the next task.",
        "ecc-hot-crew-muttering": "A crew picking sides keeps the conflict alive after the two have settled it. That needs its own word.",
        "ecc-hot-radio-silent": "Radio silence between two crew members in a work zone is a safety gap, not just a mood. Check it now."
      },
      decoyNotes: {
        "ecc-hot-joking": "Two crew members joking at the truck is the crew settling back in — that is fine."
      },
      title: "Find where the conflict is still running",
      cue: "Watch the crew after the decision — where has it not really settled?",
      why: "A decision agreed is not the same as a conflict settled. Two people still not talking, the rest of the crew muttering about who was right, and a radio gone quiet between two workers who need to talk to each other in traffic are all signs to go back once more before the job carries on."
    },
    {
      id: "hold-crew-trust",
      kind: "track",
      target: "ecc-trust-meter",
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
      title: "Hold crew trust as work restarts",
      cue: "Keep trust in band as the paused task restarts — not tense, not forced cheerful.",
      why: "The first ten minutes after a conflict decide whether the crew works as one again or around each other. Holding trust in band — the two working the task together, the lead nearby but not hovering, the radio talking — is what shows the fix held, and is the peer support and collaboration SAMHSA's principles describe.",
      holdBreakNote: "Trust left the band — gone tense or forced. Slow the restart and check in with both."
    },
    {
      id: "note-it-on-the-tailboard",
      kind: "select",
      target: "ecc-tailboard-log",
      doneLine: "Concern and decision recorded",
      title: "Record the concern and the decision",
      cue: "Write the safety concern raised, the decision made and why, on the tailboard log.",
      why: "The concern that started the argument was a real safety concern, and 8 CCR 3203 asks for hazards raised by workers to be recorded and corrected. Writing it down with the decision and the reason protects both workers, shows the concern was taken seriously, and gives the next crew the answer before they have the same argument."
    },
    {
      id: "credit-both-out-loud",
      kind: "select",
      target: "ecc-credit-board",
      doneLine: "Both credited",
      title: "Credit both of them in front of the crew",
      cue: "At the end of the task, name what each one got right — in front of the crew.",
      why: "Both crew members were right about something — the taper and the timing. Crediting each in front of the crew, after the work is done, repairs what the argument cost in public and tells everyone watching that raising a concern on this crew is worth doing, which is the culture the employer's injury prevention programme depends on."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "ecc-crew-checkin",
      doneLine: "Crew checked in",
      title: "Check in with the crew at the end of the shift",
      cue: "At the truck: how is everyone after today, and is anything still sitting with anyone?",
      why: "A conflict on the crew can stay with people after the shift, including the lead who stepped into it. Asking how everyone is at the end, with the steward and the employee assistance line named for anyone who wants them, is the check-in the programme's guide offers, and it catches what a tailboard note cannot."
    }
  ],

  interrupts: [
    {
      id: "a-car-drifts-toward-the-taper",
      kind: "Vehicle intrusion",
      after: "hold-a-steady-presence",
      delay: 3,
      seconds: 12,
      target: "ecc-horn-signal",
      alert: "A car drifts toward the taper while the crew's attention is on the argument.",
      cue: "Sound the warning horn and clear everyone to the safe side — the conversation stops.",
      why: "This is why the conversation moved behind the barrier. An intrusion warning beats any conversation, and a lead who sounds it and clears the crew is protecting the two people who were too busy arguing to see the car.",
      missNote: "Nobody sounded the warning, the car clipped two cones at the taper, and one crew member jumped back into the second one's path.",
      wrongNote: "That does not warn the crew. Sound the horn and clear everyone."
    },
    {
      id: "one-walks-off-the-site",
      kind: "Crew member leaves",
      after: "hold-crew-trust",
      delay: 3,
      seconds: 12,
      target: "ecc-radio-supervisor",
      alert: "One of the two throws down their gloves and starts walking off the site toward the road.",
      cue: "Radio the supervisor to meet them safely off the road — you keep the crew working the zone.",
      why: "A worker walking off angry toward a road is a safety problem first. The supervisor meets them off the traffic side and away from the crew, while the lead keeps the work zone staffed; nobody chases anyone into traffic.",
      missNote: "Nobody radioed, the worker walked along the live lane to the corner, and the crew stopped work to watch.",
      wrongNote: "That does not get anyone to them. Radio the supervisor."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = ECC_ACCENT;
    const CSS = ECC_CSS;
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
    bead(-1.22, 0.90, -0.27, "ecc-raised-voices", "two raised voices at the taper", {});
    bead(-1.42, 1.18, -0.62, "ecc-back-to-traffic", "a crew member with their back to traffic", {});
    bead(-1.03, 1.46, -0.71, "ecc-tool-thrown-down", "a shovel thrown down on the asphalt", {});
    bead(-1.08, 0.90, -1.11, "ecc-flagger-waving", "Flagger waving traffic through", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "ecc-order-notice", "1 · notice it", {});
    bead(-0.58, 1.46, -1.44, "ecc-order-name", "2 · name it out loud", {});
    bead(-0.24, 0.90, -1.23, "ecc-order-slow", "3 · slow it down", {});
    bead(0, 1.18, -1.55, "ecc-order-fix", "4 · get to the fix", {});
    bead(0.24, 1.46, -1.23, "ecc-steady-spot", "Steady, between them", {});
    bead(0.58, 0.90, -1.44, "ecc-hot-not-talking", "the two still not talking to each other", {});
    bead(0.68, 1.18, -1.05, "ecc-hot-crew-muttering", "the rest of the crew muttering and picking sides", {});
    bead(1.08, 1.46, -1.11, "ecc-hot-radio-silent", "the radio gone quiet between them", {});
    bead(1.03, 0.90, -0.71, "ecc-hot-joking", "Crew joking at the truck", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "ecc-horn-signal", "Horn and clear", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "ecc-radio-supervisor", "Radio the supervisor", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "ecc-barrier-spot", "Behind the barrier", "BEHIND THE BARRIER", { ry: 1.20 });
    dials["ecc-pause-dial"] = dial(-1.89, -1.4, 0.93, "ecc-pause-dial", "Work pause");
    meters["ecc-pace-meter"] = meter(-1.45, -1.85, 0.67, "ecc-pace-meter", "Conversation pace");
    tokens["ecc-decision-token"] = token(-0.92, -2.16, 0.40, "ecc-decision-token", "The decision");
    spots["ecc-agreed-spot"] = spot(-0.31, -2.33, 0.13, "ecc-agreed-spot", "Agreed by both");
    card(0.31, 1.35, -2.33, "ecc-both-heard-card", "You first, then you", "YOU FIRST.\nTHEN YOU", { ry: -0.13 });
    meters["ecc-trust-meter"] = meter(0.92, -2.16, -0.40, "ecc-trust-meter", "Crew trust");
    boards["ecc-tailboard-log"] = board(1.45, -1.85, -0.67, "ecc-tailboard-log", "Tailboard log");
    boards["ecc-credit-board"] = board(1.89, -1.4, -0.93, "ecc-credit-board", "End of task");
    boards["ecc-crew-checkin"] = board(2.19, -0.85, -1.20, "ecc-crew-checkin", "Crew check-in");
    hazardCard(-1.53, 0.72, -1.21, "argue-it-out-in-the-lane", "Let them argue in the lane?", "SORT IT\nOUT HERE", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "pick-the-senior-worker-by-default", "Back the senior worker, no questions?", "SENIORITY\nWINS", 0.30);
    hazardCard(0.58, 0.72, -1.86, "threaten-a-write-up-on-the-spot", "Threaten a write-up right now?", "YOU'RE BOTH\nWRITTEN UP", -0.30);
    hazardCard(1.53, 0.72, -1.21, "tell-them-to-just-get-over-it", "Tell them to get over it?", "GET OVER IT.\nBACK TO WORK", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Notice it. Name it. Slow it down."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    crew["flagger"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0xff6a1a, trousers: 0x2b2f35 });
    holoTag(g, "Flagger", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["steward"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Union steward", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-car-drifts-toward-the-taper"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x9a2a2a, atStation: true });
    arrivals["a-car-drifts-toward-the-taper"].visible = false;
    arrivals["one-walks-off-the-site"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0xf2c14b, atStation: true });
    arrivals["one-walks-off-the-site"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "move-to-the-fix") { const s = spots["ecc-agreed-spot"]; tokens["ecc-decision-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "note-it-on-the-tailboard") repaint(boards["ecc-tailboard-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Concern and decision recorded"], "#59c97b"));
        if (step.id === "credit-both-out-loud") repaint(boards["ecc-credit-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Both credited"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["ecc-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Crew checked in"], "#59c97b"));
        if (step.id === "hear-both-in-turn") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("huddle-disagreement", { seed: 1 }) : "Say the next job, not the last mistake.");
        if (step.id === "credit-both-out-loud") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 1 }) : "Say the next job, not the last mistake.");
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
        if (it.id === "a-car-drifts-toward-the-taper") { crew["flagger"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Horn, clear, everyone safe — the argument can wait for the barrier."); }
        if (it.id === "one-walks-off-the-site") { crew["supervisor"].position.set(-1.9, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("The supervisor has them off the road; the crew kept working the zone."); }
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
