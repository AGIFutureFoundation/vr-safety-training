import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ First-Period Evaluation VR — Job Readiness Edition,
// apprenticeship navigation block.
//
// The end of an apprentice's first period, at the training centre's shop:
// the logbook of on-the-job hours checked for the errors that stop a period
// raise, a short skills demonstration — plumb a post, check a frame for
// square, clamp and make a guarded cut — the signed pages handed in, the
// evaluation read section by section before it is signed, and the next rate
// read off the wage schedule in the apprenticeship standard. A foreman who
// wants the apprentice up a lift alone, and a blade guard that sticks open,
// arrive mid-task. Every rate, hour and tolerance is an example; no real
// programme or training centre is depicted.

const FPE_ACCENT = 0xc98f5a;
const FPE_CSS = "#c98f5a";

export const SIM_FIRST_PERIOD_EVALUATION = {
  id: "first-period-evaluation",
  index: "260",
  domain: "Apprenticeship navigation",
  trade: "Construction apprentice — the first-period evaluation",
  category: "Community Environmental Justice",
  indoor: "shop",
  weather: "clear",
  certification: "The apprenticeship standard the apprentice is indentured under — registered with the U.S. Department of Labor or a State Apprenticeship Agency — which sets the on-the-job hours by work process, the related instruction, the periodic evaluation, the supervision of apprentices by journey-level workers and the progressive wage schedule; OSHA 29 CFR 1926.21 on the employer's duty to train, and the guarding and tool rules of 29 CFR 1926; OSHA 10 through the OSHA Outreach Training Program as the awareness base the demonstration builds on; NIOSH guidance on hearing loss prevention; SAMHSA's National Helpline and 988 for the stress an evaluation carries",
  name: "First-Period Evaluation",
  title: simTitle("First-Period Evaluation"),
  tagline: "The end of the first period: the logbook checked, a guarded skills demonstration, the signed pages in, the evaluation read before it is signed, and the next rate read off the schedule — while a foreman tries to send you up a lift alone",
  accent: FPE_ACCENT,
  accentCss: FPE_CSS,
  parSeconds: 300,
  footprint: 2.2,
  supportLine: "your journey-level mentor or your training coordinator if the evaluation is weighing on you, 988 if it has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using has become part of how you cope",
  badge: { id: "period-one-passed", name: "Period One Passed", note: "A clean logbook, a guarded demonstration and an evaluation read before it was signed" },

  game: system({
    name: "Period Card",
    currency: "HOUR",
    ranks: ["First Period", "Logbook Kept", "Demonstrated", "Evaluated", "Period Advancement Certified"],
    badges: [
      { id: "straight-logbook", name: "Straight Logbook", note: "The logbook errors and the pre-cut check both found clean", test: AWARD.all(AWARD.stepClean("logbook-errors"), AWARD.stepClean("pre-cut-check")) },
      { id: "no-shortcuts-in-the-shop", name: "No Shortcuts In The Shop", note: "No unsafe action anywhere in the evaluation", test: AWARD.safe },
      { id: "square-and-true", name: "Square And True", note: "The square check committed near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-evaluation", name: "Clean Evaluation", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "done-by-lunch", name: "Done By Lunch", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fpe-guard-off": "You went to pin the saw's blade guard up 'to see the line better'. The guard is what stands between a hand and a spinning blade when the work shifts or kicks back, and the tool rules in 29 CFR 1926 require guards to stay in place. A demonstration is scored on doing it safely first; a cut made with the guard pinned up fails the demonstration even if the line is perfect.",
    "fpe-quick-sign": "Someone put a page in front of you: 'sign here — we'll go over it later.' That page is your evaluation, and a signature says you have seen and accept what it says about your attendance, your skills and your safety. Signing before reading gives up the one chance to add a comment or question a mark — the evaluation is read, section by section, and signed last.",
    "fpe-padded-hours": "A coworker offered to sign your logbook for a day you were not on site. The logbook is the record your hours toward each work process are counted from, and your apprenticeship standard ties period advancement to those hours. A signed entry for a day you did not work is a false record with two names on it, and it can end an apprenticeship faster than any skills test.",
    "fpe-lift-alone": "You went for the scissor lift with the key in it, to go up alone and finish. An apprentice works under a journey-level worker, as the apprenticeship standard requires, and operating a lift takes training on that lift. Going up alone, untrained, with nobody at the base, is the unsafe shortcut the whole evaluation exists to catch before it is a habit.",
  },

  lateNotes: {
    "fpe-log-pages": "Not yet. The logbook pages go to the coordinator once the errors are fixed and the demonstration is done — hand in a logbook with an unsigned day and the period waits.",
    "fpe-period-log": "The period log is closed out last, once the evaluation is signed and the next rate is confirmed.",
  },

  steps: [
    {
      id: "open-logbook", kind: "select", target: "fpe-logbook",
      title: "Open your logbook of on-the-job hours",
      cue: "Open the logbook at this period's pages: hours by day, by work process, signed by the journey-level worker.",
      why: "An apprenticeship standard lays out the on-the-job learning by work process — so many hours on each kind of work — and the logbook is where those hours are recorded, day by day, and signed by the journey-level worker who supervised them. It is the document the first-period evaluation starts from, because period advancement, and the raise that comes with it, depends on the hours it shows.",
    },
    {
      id: "logbook-errors", kind: "find", noHint: true,
      targets: ["fpe-err-unsigned", "fpe-err-double", "fpe-err-process"],
      itemNames: { "fpe-err-unsigned": "a day with no signature", "fpe-err-double": "a day entered twice", "fpe-err-process": "hours under the wrong work process" },
      itemNotes: {
        "fpe-err-unsigned": "A day with hours but no journey-level signature usually does not count until it is signed. Ask the worker who supervised it, this week, while they remember.",
        "fpe-err-double": "The same day entered twice inflates the total and makes the whole page look unreliable. Strike the duplicate and initial it.",
        "fpe-err-process": "Hours logged under the wrong work process leave another process short, and the standard counts them separately. Move them to the right line.",
      },
      title: "Find the three logbook errors before you hand it in",
      cue: "On the example page, find the unsigned day, the day entered twice and the hours under the wrong work process.",
      why: "Most delays in period advancement come from the logbook, not the skills: an unsigned day that does not count, a duplicated day that makes the page unreliable, hours logged under the wrong work process so one process falls short. Finding them before the coordinator does is the difference between a raise this month and a raise after the paperwork has gone back and forth.",
    },
    {
      id: "plumb-post", kind: "hold", target: "fpe-level", seconds: 6,
      title: "Hold the post plumb while it is fastened",
      cue: "Hold the level on the post with the bubble centred while your mentor fastens the brace.",
      why: "Holding a post plumb while it is braced is basic, and it is exactly what an evaluator watches: whether you read the level, correct in small movements and hold steady until the fastener is in, rather than letting go the moment it looks close. It is also a two-person task done under a journey-level worker, which is how every task in the first period is supposed to go.",
      holdBreakNote: "You let go before the brace was fastened. The post drifted — centre the bubble and hold it until your mentor says it is in.",
    },
    {
      id: "square-check", kind: "gauge", target: "fpe-square-gauge",
      title: "Check the frame for square",
      cue: "Measure both diagonals and commit when the difference is inside the example tolerance.",
      gauge: {
        label: "DIAGONAL DIFFERENCE (EXAMPLE)", speed: 0.55, green: [0.42, 0.58],
        readout: (t) => { const d = Math.abs(t - 0.5) * 16; return `${d < 0.5 ? "0" : d.toFixed(1) + "/16"} in apart — example`; },
        missNote: "The diagonals are too far apart — the frame is out of square. Rack it gently and measure both again.",
      },
      why: "A rectangle is square when its two diagonals measure the same, and checking them is one of the first measurement habits a construction apprentice builds. The evaluator is watching whether you measure both, read the tape correctly and correct the frame rather than calling it close. The tolerance here is an example; the job's drawings or your journey-level worker set the real one.",
    },
    {
      id: "pre-cut-check", kind: "find", noHint: true,
      targets: ["fpe-ppe-glasses", "fpe-ppe-ears", "fpe-guard-down"],
      itemNames: { "fpe-ppe-glasses": "safety glasses on", "fpe-ppe-ears": "hearing protection on", "fpe-guard-down": "the blade guard down and free" },
      itemNotes: {
        "fpe-ppe-glasses": "Safety glasses on before the saw starts — chips and dust leave the blade faster than you can blink.",
        "fpe-ppe-ears": "Hearing protection on. NIOSH's guidance on hearing loss is plain that the damage from repeated loud tools is permanent and adds up over a career.",
        "fpe-guard-down": "The blade guard down and moving freely. A guard that sticks is a guard that is not there.",
      },
      title: "Do the pre-cut check",
      cue: "Before the saw starts, find the three things that have to be true: glasses on, hearing protection on, guard down and free.",
      why: "The pre-cut check takes ten seconds and is the part of the demonstration an evaluator will fail you on without looking at the cut. Glasses protect against chips, hearing protection against the damage NIOSH describes building up over a career of loud tools, and a guard that moves freely is the only thing between a hand and the blade. Doing it every time is the skill; the cut comes after.",
    },
    {
      id: "clamp-work", kind: "turn", target: "fpe-clamp",
      title: "Clamp the work before the cut",
      cue: "Turn the clamp until the board is held firm against the fence — no hand holding the offcut.",
      turn: { turns: 1.0, axis: "y", label: "CLAMP" },
      why: "A board that moves during a cut is how kickback and slipped hands happen. Clamping the work firm against the fence keeps both hands clear of the blade and the cut true, and it is the habit an evaluator is looking for: the work held by the clamp, not by a hand that has to be too close to the blade to do it.",
    },
    {
      id: "feed-cut", kind: "track", target: "fpe-saw-track", seconds: 7,
      title: "Feed the cut at a steady rate",
      cue: "Hold the feed inside the band: steady pressure, the guard riding on the work, hands outside the red zone.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "FEED",
        readout: (v) => (v < 0.4 ? "stalling — the blade will burn and bind" : v > 0.62 ? "forcing it — kickback risk" : "steady feed"),
      },
      holdBreakNote: "The feed dropped out of band. Ease off, let the blade do the work, and bring it back to a steady rate — never force it through.",
      why: "A steady feed lets the blade cut rather than bind: too slow and it burns and grabs, too fast and it forces the work and invites kickback. Holding the rate with the guard riding on the work and hands outside the marked zone is what the demonstration is scored on — the same discipline the guarding rules in 29 CFR 1926 assume, practised until it is automatic.",
    },
    {
      id: "hand-in-pages", kind: "drag", target: "fpe-log-pages",
      title: "Hand the signed logbook pages to the coordinator",
      cue: "Carry this period's corrected, signed pages to the coordinator's tray.",
      why: "The corrected, signed pages are what the training coordinator counts toward your work processes and your period advancement, so they go in by hand, to the coordinator's tray, not loose in a folder. Handing them in yourself means you can see them received and ask about anything short, which is how an apprentice keeps the hours they worked from getting lost between the jobsite and the office.",
      drag: { to: "fpe-coordinator-tray", radius: 0.4, missNote: "Not in the coordinator's tray. Pages left anywhere else are pages that can be lost — put them where they are logged." },
    },
    {
      id: "mentor-checkin", kind: "select", target: "fpe-mentor",
      title: "Check in with your mentor before the evaluation",
      cue: "Ask your journey-level mentor how the period looked from their side, and say honestly how you are doing.",
      why: "The journey-level worker who supervised you sees things the evaluation form does not, and hearing it before you sit down with the coordinator means nothing in the evaluation is a surprise. It is also the crew check-in: the first period is hard on bodies and on nerves, and a mentor who hears that can help. If it has become more than that, 988 or SAMHSA's National Helpline is the right next call.",
    },
    {
      id: "read-evaluation", kind: "sequence",
      targets: ["fpe-ev-attendance", "fpe-ev-skills", "fpe-ev-safety", "fpe-ev-sign"],
      itemNames: { "fpe-ev-attendance": "attendance and school", "fpe-ev-skills": "the skills marks", "fpe-ev-safety": "the safety record", "fpe-ev-sign": "comment and sign" },
      outOfOrderNote: "Out of order. Read attendance and school, then the skills marks, then the safety record — and only then add your comment and sign.",
      title: "Read the evaluation section by section, then sign",
      cue: "Read attendance and related instruction, the skills marks and the safety record before you comment and sign.",
      why: "An evaluation is a record of your period that follows you, and your signature says you have seen it. Reading attendance and related instruction, then the skills marks, then the safety record — before signing — is what lets you ask about a mark you do not understand or add a comment while it still counts. The apprenticeship standard sets the periodic evaluation; reading it is yours to do.",
    },
    {
      id: "next-rate", kind: "select", target: "fpe-wage-schedule",
      title: "Read the next period's rate off the wage schedule",
      cue: "With a satisfactory evaluation, find the second-period rate on the example schedule and confirm when it starts.",
      why: "The apprenticeship standard's progressive wage schedule sets the rate for each period, and advancement to the next one, with its raise, follows satisfactory progress. Reading the new rate off the schedule yourself, and confirming with the coordinator when it takes effect, is how you know what your next stub should say — and how you notice if it does not.",
    },
    {
      id: "period-log", kind: "select", target: "fpe-period-log",
      title: "Close out your period log",
      cue: "Log the hours by process, the evaluation date and marks, your comment, and the date the new rate starts.",
      why: "Your own record of the period — hours by work process, the evaluation's marks and your comment, the date the new rate starts — is the one that goes with you from job to job. It is what you check the next stub against, what you bring if hours go missing, and the page that shows, period by period, the road to journey level actually being walked.",
    },
  ],

  interrupts: [
    {
      id: "fpe-lift-order",
      kind: "Sent up a lift alone",
      after: "plumb-post", delay: 3, seconds: 12,
      alert: "Your mentor is called away to the phone, and a foreman walks over: 'Leave that. Take the scissor lift up and finish the blocking on your own — the key's in it.'",
      cue: "Do not go up alone. Take it to the person responsible for your apprenticeship.",
      target: "fpe-coordinator",
      why: "The apprenticeship standard has apprentices working under journey-level workers, and running a lift takes training on that lift and someone at the base. A first-period apprentice cannot weigh a foreman's instruction against all that alone; the training coordinator can, and usually settles it in a sentence. Taking it to the coordinator is not refusing work — it is putting the decision where it belongs.",
      missNote: "The foreman waited while you kept holding the post, and in the version where you went, you were up a lift you had never been trained on, alone, with nobody at the base — on the day you were being evaluated on whether you work safely.",
      wrongNote: "Not that. The answer is the training coordinator — not the lift, and not an argument with the foreman.",
    },
    {
      id: "fpe-guard-sticks",
      kind: "Blade guard sticking open",
      after: "feed-cut", delay: 3, seconds: 12,
      alert: "Halfway through the cut the blade guard catches and stays up, leaving the spinning blade exposed at the end of the board.",
      cue: "Stop the saw now.",
      target: "fpe-estop",
      why: "A guard stuck open is a guard that is not there, and the only safe response is to stop the blade before anything else — not to finish the cut, not to reach in and free it. The emergency stop is placed where it can be hit without reaching over the blade. Once the blade has stopped, the guard is checked and freed or the saw is tagged out of service.",
      missNote: "You kept feeding with the blade exposed, and in the version where the board shifted at the end of the cut, your hand was at the end of the board when it did. The cut was never worth that.",
      wrongNote: "Not that. The answer is the emergency stop — blade stopped first, guard sorted out after.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, FPE_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#6e6a62", base2: "#66625a", seam: "rgba(0,0,0,0.22)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.04, color: 0xa8a49a });

    // ------------------------------------------------------------ back wall
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xd2ccc0, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x4a4238, { rough: 0.7 });
    decal(g, 2.2, 0.16, 0, 2.4, -2.29, signFace("TRAINING CENTRE SHOP — EVALUATIONS", { bg: "#2a241c", accent: FPE_CSS, scale: 0.5 }), { px: 512 });

    // The evaluation board, with its four sections as markers.
    const evalBoard = holoPanel(g, 0.8, 0.66, -1.2, 1.55, -2.25, (cx, w, h) => {
      cx.fillStyle = "rgba(26,18,10,0.93)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = FPE_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6e2cc"; cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FIRST-PERIOD EVALUATION — EXAMPLE", w * 0.05, h * 0.1);
      cx.fillStyle = "#fff4e6"; cx.font = `${Math.round(h * 0.068)}px Arial, sans-serif`;
      ["1. Attendance + related instruction", "2. Skills: plumb, square, cut", "3. Safety record", "4. Apprentice comment + signature"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.18)));
    }, { accent: FPE_ACCENT });
    for (const [id, i] of [["fpe-ev-attendance", 0], ["fpe-ev-skills", 1], ["fpe-ev-safety", 2], ["fpe-ev-sign", 3]]) {
      reg(hits, box(evalBoard, 0.72, 0.1, 0.02, 0, 0.33 - (0.3 + i * 0.18) * 0.66, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    }
    const evTicks = [];
    for (let i = 0; i < 4; i++) {
      const tk = box(evalBoard, 0.03, 0.03, 0.01, 0.36, 0.33 - (0.3 + i * 0.18) * 0.66, 0.02, CITY.good, { emissive: CITY.good, ei: 1.0, cast: false });
      tk.visible = false;
      evTicks.push(tk);
    }

    // The wage schedule (example) beside it.
    const sched = group(g, 0.0, 1.55, -2.27);
    slab(sched, 0.8, 0.66, 0.03, 0, -0.33, 0, 0x2a241c, { radius: 0.02, rough: 0.6 });
    const schedFace = decal(sched, 0.74, 0.6, 0, 0, 0.02, paperFace("WAGE SCHEDULE — EXAMPLE", ["Journey rate: $40.00", "Period 1 · 50% · $20.00", "Period 2 · 55% · $22.00", "Advance on hours + evaluation", "All rates are examples"], { bg: "#f4f1e8", band: "#8a5a2c" }), { px: 320 });
    void schedFace;
    holoTag(sched, "wage schedule", 0, 0.4, 0.02, { css: FPE_CSS, w: 0.3 });
    reg(hits, sched, "fpe-wage-schedule");

    // The frame for the square check, hung on the wall, with its gauge.
    const frame = group(g, 1.3, 1.5, -2.27);
    for (const [w, h, x, y] of [[0.8, 0.05, 0, 0.3], [0.8, 0.05, 0, -0.3], [0.05, 0.65, -0.38, 0], [0.05, 0.65, 0.38, 0]]) box(frame, w, h, 0.05, x, y, 0, 0xc8a878, { rough: 0.8 });
    const diag = box(frame, 0.95, 0.01, 0.01, 0, 0, 0.03, 0xf2c14b, { rough: 0.5, cast: false });
    diag.rotation.z = Math.atan2(0.6, 0.76);
    const sqGauge = instrument(g, 1.3, 1.02, -2.1, { idle: "-- in", color: FPE_ACCENT, ry: 0 });
    sqGauge.rotation.x = Math.PI / 2.4;
    holoTag(sqGauge, "diagonal check", 0, 0.16, 0, { css: FPE_CSS, w: 0.3 });
    reg(hits, sqGauge, "fpe-square-gauge");

    // ------------------------------------------------------ the post and level
    const postBase = group(g, -1.55, 0, -1.0);
    box(postBase, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x5a5048, { rough: 0.8 });
    const post = box(postBase, 0.09, 1.8, 0.09, 0, 0.96, 0, 0xc8a878, { rough: 0.8 });
    void post;
    const brace = box(postBase, 0.04, 1.2, 0.08, 0.3, 0.6, 0, 0xb8986a, { rough: 0.8 });
    brace.rotation.z = 0.5;
    const level = group(postBase, 0.065, 1.2, 0);
    box(level, 0.03, 0.6, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const bubble = box(level, 0.02, 0.05, 0.03, 0.015, 0, 0, 0x7ad87a, { emissive: 0x7ad87a, ei: 0.6, rough: 0.3, cast: false });
    ownMaterial(bubble);
    holoTag(level, "level", 0, 0.38, 0, { css: FPE_CSS, w: 0.16 });
    reg(hits, level, "fpe-level");

    // The scissor lift with its key in (hazard).
    const lift = group(g, -2.25, 0, 0.3, Math.PI / 2);
    box(lift, 0.8, 0.3, 1.4, 0, 0.2, 0, 0x2f5f8a, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 2; i++) {
      const arm = box(lift, 0.06, 1.1, 0.06, 0, 0.75, 0, 0x5a6068, { rough: 0.4, metal: 0.6 });
      arm.rotation.x = i ? 0.9 : -0.9;
    }
    box(lift, 0.8, 0.08, 1.4, 0, 1.25, 0, 0x2f5f8a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-0.38, 0.38]) box(lift, 0.04, 0.9, 1.4, sx, 1.7, 0, 0xf2c14b, { rough: 0.5, opacity: 0.8, transparent: true });
    const liftKey = group(lift, 0.3, 0.4, 0.72);
    box(liftKey, 0.1, 0.1, 0.04, 0, 0, 0, 0x2a3036, { rough: 0.5 });
    box(liftKey, 0.02, 0.06, 0.02, 0, 0.06, 0.02, 0xdfae4a, { rough: 0.3, metal: 0.8 });
    holoTag(liftKey, "up alone?", 0, 0.2, 0.02, { css: "#f0645b", w: 0.22 });
    reg(hits, liftKey, "fpe-lift-alone");

    // ------------------------------------------------------------ the saw table
    const sawTable = group(g, 1.05, 0, -0.55, -0.2);
    box(sawTable, 1.2, 0.85, 0.7, 0, 0.425, 0, 0x4a5058, { rough: 0.5, metal: 0.4 });
    slab(sawTable, 1.3, 0.04, 0.8, 0, 0.87, 0, 0x8a9098, { radius: 0.01, rough: 0.35, metal: 0.7 });
    box(sawTable, 1.2, 0.06, 0.04, 0, 0.92, -0.25, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    const blade = cyl(sawTable, 0.13, 0.13, 0.008, 0, 0.9, 0.0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 22 });
    blade.rotation.x = Math.PI / 2;
    const guardPivot = group(sawTable, 0, 1.05, -0.1);
    const guard = box(guardPivot, 0.06, 0.12, 0.34, 0, 0, 0.1, 0xd8a020, { rough: 0.4, opacity: 0.8, transparent: true });
    ownMaterial(guard);
    reg(hits, guard, "fpe-guard-down");
    const board = box(sawTable, 0.9, 0.04, 0.14, -0.1, 0.91, 0.1, 0xd8b888, { rough: 0.8 });
    void board;
    const redZone = box(sawTable, 0.3, 0.004, 0.3, 0, 0.892, 0.05, 0xc0392b, { opacity: 0.5, transparent: true, rough: 0.6, cast: false });
    void redZone;
    // The clamp (turn target).
    const clamp = group(sawTable, -0.45, 0.95, 0.1);
    box(clamp, 0.05, 0.12, 0.05, 0, 0, 0, 0x2f5f8a, { rough: 0.5, metal: 0.4 });
    const clampHandle = cyl(clamp, 0.012, 0.012, 0.16, 0, 0.1, 0, 0xc0392b, { rough: 0.5, seg: 8 });
    clampHandle.rotation.z = Math.PI / 2;
    holoTag(clamp, "clamp", 0, 0.22, 0, { css: FPE_CSS, w: 0.16 });
    reg(hits, clamp, "fpe-clamp");
    // The feed track marker and the emergency stop.
    const feed = box(sawTable, 0.9, 0.12, 0.3, -0.1, 0.98, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, feed, "fpe-saw-track");
    holoTag(sawTable, "feed the cut", -0.1, 1.25, 0.1, { css: FPE_CSS, w: 0.26 });
    const estop = group(sawTable, 0.62, 0.7, 0.36);
    box(estop, 0.1, 0.1, 0.06, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const estopCap = cyl(estop, 0.04, 0.04, 0.04, 0, 0, 0.04, 0xc0392b, { rough: 0.4, seg: 14 });
    estopCap.rotation.x = Math.PI / 2;
    ownMaterial(estopCap);
    holoTag(estop, "emergency stop", 0, 0.14, 0.02, { css: "#f0645b", w: 0.3 });
    reg(hits, estop, "fpe-estop");
    // The pin that props the guard up (hazard).
    const pin = group(sawTable, 0.25, 1.02, -0.2);
    box(pin, 0.14, 0.02, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8 });
    holoTag(pin, "pin the guard up?", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, pin, "fpe-guard-off");
    const sawLamp = box(sawTable, 0.06, 0.06, 0.03, 0.5, 0.75, 0.36, 0x3a4048, { rough: 0.4 });
    ownMaterial(sawLamp);

    // The PPE hooks on the right wall: glasses and hearing protection.
    const ppe = group(g, 2.4, 0, -0.6, -Math.PI / 2);
    box(ppe, 0.8, 0.5, 0.03, 0, 1.4, 0, 0x6a5a48, { rough: 0.8 });
    const glasses = group(ppe, -0.2, 1.4, 0.05);
    box(glasses, 0.16, 0.05, 0.02, 0, 0, 0, 0x9ad0f0, { rough: 0.1, opacity: 0.7, transparent: true });
    box(glasses, 0.18, 0.012, 0.012, 0, 0.03, 0, 0x2a3036, { rough: 0.5 });
    reg(hits, glasses, "fpe-ppe-glasses");
    const ears = group(ppe, 0.2, 1.4, 0.06);
    for (const sx of [-0.06, 0.06]) cyl(ears, 0.045, 0.045, 0.04, sx, 0, 0, 0xd8a020, { rough: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    box(ears, 0.14, 0.015, 0.02, 0, 0.06, 0, 0x2a3036, { rough: 0.5 });
    reg(hits, ears, "fpe-ppe-ears");
    decal(ppe, 0.7, 0.1, 0, 1.72, 0.02, signFace("BEFORE THE SAW STARTS", { bg: "#2a241c", accent: FPE_CSS, scale: 0.5 }), { px: 256 });

    // ----------------------------------------------------- the coordinator desk
    const desk = group(g, -0.35, 0, 0.45);
    slab(desk, 1.3, 0.05, 0.65, 0, 0.74, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(desk, 0.05, 0.72, 0.6, sx * 0.62, 0.36, 0, 0x4a3a2a, { rough: 0.6 });
    // The logbook (select), with its error lines, on a stand so it reads.
    const logStand = group(desk, -0.3, 0.77, -0.05);
    const logbook = group(logStand, 0, 0.18, 0);
    logbook.rotation.x = -0.6;
    slab(logbook, 0.44, 0.34, 0.015, 0, -0.17, 0, 0xfdfbf4, { radius: 0.006, rough: 0.8 });
    decal(logbook, 0.42, 0.32, 0, 0, 0.01, paperFace("OJT LOGBOOK — PERIOD 1 (EXAMPLE)", [
      "Mon  8.0  layout     signed",
      "Tue  8.0  framing    (no signature)",
      "Wed  8.0  framing    signed",
      "Wed  8.0  framing    signed",
      "Thu  8.0  safety mtg → 'framing'",
    ], { bg: "#fdfbf4", band: "#8a5a2c" }), { px: 320 });
    box(logStand, 0.04, 0.18, 0.04, 0, 0.09, 0.08, 0x3a3028, { rough: 0.6 });
    holoTag(logbook, "OJT logbook", 0, 0.22, 0.02, { css: FPE_CSS, w: 0.26 });
    reg(hits, logbook, "fpe-logbook");
    const lrow = (i) => 0.16 - (0.26 + 0.1 * i) * 0.32;
    reg(hits, box(logbook, 0.4, 0.03, 0.03, 0, lrow(1), 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "fpe-err-unsigned");
    reg(hits, box(logbook, 0.4, 0.03, 0.03, 0, lrow(3), 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "fpe-err-double");
    reg(hits, box(logbook, 0.4, 0.03, 0.03, 0, lrow(4), 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "fpe-err-process");
    // The signed pages (drag) and the coordinator's tray (socket).
    const pages = group(desk, 0.1, 0.77, 0.15, 0.1);
    for (let i = 0; i < 3; i++) slab(pages, 0.2, 0.004, 0.27, i * 0.004, i * 0.005, 0, 0xfdfbf4, { radius: 0.004, rough: 0.85 });
    holoTag(pages, "signed pages", 0, 0.1, 0, { css: FPE_CSS, w: 0.26 });
    reg(hits, pages, "fpe-log-pages");
    const tray = group(desk, 0.45, 0.77, -0.1);
    box(tray, 0.34, 0.05, 0.26, 0, 0.025, 0, 0x2a3036, { rough: 0.5, metal: 0.3 });
    decal(tray, 0.3, 0.05, 0, 0.03, 0.131, signFace("COORDINATOR — IN", { bg: "#1b2224", accent: FPE_CSS, scale: 0.5 }), { px: 192 });
    reg(hits, tray, "fpe-coordinator-tray");
    // The 'sign here' page and the padded-hours offer (hazards).
    const quick = group(desk, 0.45, 0.77, 0.2, -0.2);
    slab(quick, 0.18, 0.004, 0.24, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const qFace = decal(quick, 0.16, 0.22, 0, 0.004, 0, paperFace("SIGN HERE", ["'we'll go over", "it later'"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    qFace.rotation.x = -Math.PI / 2;
    holoTag(quick, "sign before reading?", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, quick, "fpe-quick-sign");
    const pad = group(desk, -0.05, 0.77, -0.22, 0.2);
    slab(pad, 0.14, 0.004, 0.1, 0, 0, 0, 0xf7e36b, { radius: 0.004, rough: 0.8 });
    const pFace = decal(pad, 0.13, 0.09, 0, 0.004, 0, paperFace("I'LL SIGN TUE", ["'nobody checks'"], { bg: "#f7e36b", band: "#c0392b" }), { px: 128 });
    pFace.rotation.x = -Math.PI / 2;
    holoTag(pad, "padded hours?", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, pad, "fpe-padded-hours");
    // The period log.
    const logBook = group(desk, -0.5, 0.77, 0.22, 0.1);
    box(logBook, 0.2, 0.02, 0.15, 0, 0.01, 0, 0x8a5a2c, { rough: 0.6 });
    const logFace = decal(logBook, 0.17, 0.12, 0, 0.021, 0, paperFace("PERIOD LOG", ["Hours: ____", "Evaluated: ____", "New rate: ____"], { bg: "#f6f3ea", band: "#8a5a2c" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "period log", 0, 0.12, 0, { css: FPE_CSS, w: 0.22 });
    reg(hits, logBook, "fpe-period-log");

    // Workbench and lumber rack on the right.
    const bench = group(g, 2.1, 0, 1.2, -Math.PI / 2);
    slab(bench, 1.4, 0.06, 0.6, 0, 0.88, 0, 0xb8986a, { radius: 0.01, rough: 0.8 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(bench, 0.06, 0.86, 0.06, sx * 0.62, 0.43, sz * 0.25, 0x5a4a3a, { rough: 0.7 });
    for (let i = 0; i < 4; i++) box(bench, 1.2, 0.04, 0.1, 0, 0.94 + i * 0.045, -0.15, 0xd8b888, { rough: 0.8 });
    box(bench, 0.3, 0.12, 0.2, 0.4, 0.97, 0.12, 0xc0392b, { rough: 0.5 });
    // A lumber rack against the back wall.
    const rack = group(g, 2.1, 0, -1.9, -0.3);
    for (const sx of [-0.4, 0.4]) box(rack, 0.06, 1.6, 0.4, sx, 0.8, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) {
      box(rack, 0.9, 0.04, 0.4, 0, 0.4 + i * 0.5, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
      for (let b = 0; b < 3; b++) box(rack, 1.0, 0.06, 0.09, 0, 0.45 + i * 0.5 + (b % 2) * 0.06, -0.12 + b * 0.12, 0xd8b888, { rough: 0.8 });
    }
    for (const sx of [-1, 1]) {
      box(g, 1.2, 0.05, 0.3, sx * 1.1, 2.62, -0.5, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.1, 0.02, 0.22, sx * 1.1, 2.59, -0.5, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------- the people
    const mentor = standingFigure(g, -0.95, -1.35, { ry: 0.9, cloth: 0x3a4a5a, vest: 0xf2c14b, glasses: true });
    holoTag(mentor, "journey-level mentor", 0, 1.84, 0, { css: FPE_CSS, w: 0.42 });
    reg(hits, box(mentor, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "fpe-mentor");
    const coordinator = standingFigure(g, 0.9, 1.25, { ry: -2.6, cloth: 0x8a5a2c, skin: 0x6a4230 });
    holoTag(coordinator, "training coordinator", 0, 1.84, 0, { css: FPE_CSS, w: 0.42 });
    reg(hits, box(coordinator, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "fpe-coordinator");
    const foreman = standingFigure(g, -1.6, 0.7, { ry: 1.8, cloth: 0x7a4a2a, vest: 0xf2a43a, helmet: 0xffffff });
    holoTag(foreman, "foreman", 0, 1.95, 0, { css: "#f0645b", w: 0.2 });
    foreman.visible = false;

    let liftOn = false, guardStuck = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "plumb-post") bubble.material.emissiveIntensity = 1.2;
        if (step.id === "square-check") repaint(sqGauge.userData.screen, signFace("SQUARE", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "clamp-work") clampHandle.rotation.y = Math.PI / 2;
        if (step.id === "hand-in-pages") pages.position.set(0.45, 0.8, -0.1);
        if (step.id === "mentor-checkin") mentor.rotation.y = 0.2;
        if (step.id === "read-evaluation") for (const tk of evTicks) tk.visible = true;
        if (step.id === "period-log") repaint(logFace, paperFace("PERIOD LOG", ["Hours: logged", "Evaluated: signed", "New rate: period 2"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "fpe-lift-order") { liftOn = true; foreman.visible = true; mentor.visible = false; }
        if (it.id === "fpe-guard-sticks") {
          guardStuck = true;
          guardPivot.rotation.x = -0.9;
          sawLamp.material.emissive.set(CITY.alert);
          sawLamp.material.emissiveIntensity = 1.2;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "fpe-lift-order") {
          liftOn = false;
          mentor.visible = true;
          foreman.visible = it.resolved !== "answered";
          if (it.resolved === "answered") coordinator.rotation.y = -2.0;
        }
        if (it.id === "fpe-guard-sticks") {
          guardStuck = false;
          sawLamp.material.emissiveIntensity = 0;
          if (it.resolved === "answered") {
            estopCap.material = mat(0x7a1a14, { rough: 0.4 });
            guardPivot.rotation.x = 0;
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (liftOn) foreman.rotation.y = 1.8 + Math.sin(t * 3) * 0.2;
        if (guardStuck) sawLamp.material.emissiveIntensity = 0.8 + Math.sin(t * 12) * 0.6;
        if (session?.step?.id === "feed-cut" && !guardStuck) blade.rotation.y += dt * 20;
        if (session?.turn && session.step?.id === "clamp-work") clampHandle.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "square-check") {
          const ok = gg.t >= 0.42 && gg.t <= 0.58;
          const d = Math.abs(gg.t - 0.5) * 16;
          repaint(sqGauge.userData.screen, signFace(`${d.toFixed(1)}/16`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.56 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "feed-cut") board.position.x = -0.1 + Math.min(0.5, (tr.inBand ?? 0) / 7 * 0.5);
      },
    };
  },
};
