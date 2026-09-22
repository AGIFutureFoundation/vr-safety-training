import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Periodontal Charting VR — Dental & Oral Health, station three.
// A full periodontal chart: the probe's markings read, six sites a tooth
// probed with the probe walked and angled, depths called and charted,
// bleeding on probing and suppuration recorded, recession measured and
// clinical attachment loss calculated, furcation and mobility graded, the
// chart compared against the last visit, and the case staged and graded to
// the American Academy of Periodontology's 2017 classification so the
// treatment plan actually follows from what was found.

const PERIO_ACCENT = 0x6fc9a0;

export const SIM_PERIODONTAL_CHARTING = {
  id: "periodontal-charting",
  index: "121",
  domain: "Dental",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "SEIU and UFCW dental and clinic staff; the ADHA's standards for clinical dental hygiene practice; the American Academy of Periodontology's 2017 classification of periodontal diseases (staging and grading); the Dental Hygiene Board of California and the state's dental practice act; OSHA 29 CFR 1910.1030 bloodborne pathogens for every bleeding site this chart records",
  name: "Periodontal Charting",
  title: simTitle("Periodontal Charting"),
  tagline: "Six sites a tooth probed and walked, depths charted, bleeding and suppuration recorded, recession and attachment loss calculated, and the case staged and graded to the 2017 classification",
  accent: PERIO_ACCENT,
  accentCss: "#6fc9a0",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "chart-complete", name: "Chart Complete", note: "A full six-site chart, correctly graded and staged, with every change from the last visit caught" },

  game: system({
    name: "Attachment Watch",
    currency: "SITE",
    ranks: ["Charting Trainee", "Registered Prober", "Full-Mouth Charter", "Periodontal Lead", "Attachment Watch Certified"],
    badges: [
      { id: "six-sites", name: "Six Sites", note: "Every site walked in the taught order, first time", test: AWARD.stepClean("site-order") },
      { id: "no-guessed-numbers", name: "No Guessed Numbers", note: "Never charted a number the probe didn't actually read", test: AWARD.safe },
      { id: "staged-right", name: "Staged Right", note: "Stage and grade matched to the findings without correction", test: AWARD.stepClean("stage-grade") },
    ],
    challenges: [
      { id: "clean-chart", name: "Clean Chart", note: "No corrections anywhere in the chart", test: AWARD.clean },
      { id: "steady-walk", name: "Steady Walk", note: "Both timed steps held clean without a break", test: AWARD.unbroken },
      { id: "chart-on-time", name: "Chart on Time", note: "Full chart complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "eyeball-depth": "You charted a number you eyeballed instead of the one the probe actually read. Every measurement after this one — the CAL calculation, the stage, the grade, the plan — inherits whatever this guess got wrong, and nobody downstream can tell a measured 5mm from a guessed one.",
    "skip-bop": "You charted the depth and moved on without checking for bleeding or suppuration at the site. Bleeding on probing is often the earliest sign of active disease at a site that still measures shallow — skip the check and the chart records a healthy-looking number over a site that is actually inflamed.",
    "hard-probe": "You dragged the probe hard across the sulcus instead of walking it in small steps at each site. A dragged reading either overshoots into healthy tissue and reads too deep, or skates past the actual deepest point and reads too shallow — either way, the number on the chart is not the pocket.",
    "unsafe-probe-set-down": "You set the probe down tip-first, uncapped, on the open tray instead of in the sharps-safe holder. A sharp instrument left exposed on a shared tray is a needlestick waiting for whoever reaches for it next, gloved or not.",
  },

  lateNotes: {},

  steps: [
    {
      id: "position-light", kind: "turn", target: "position-light",
      forceClass: "light",
      robotNote: "The light arm crosses over the patient's face to reach the posterior quadrant.",
      title: "Position the light for the posterior quadrant",
      cue: "Bring the operatory light onto the quadrant you're about to probe.",
      turn: { turns: 0.3, axis: "y", label: "LIGHT POSITION" },
      why: "A posterior lingual site probed half in shadow is a site probed by feel instead of by sight — the light gets moved to the quadrant before the probe does, not adjusted after a reading is already in doubt.",
    },
    {
      id: "probe-check", kind: "select", target: "probe-check",
      title: "Read the probe's markings",
      cue: "Confirm which probe is in your hand and how its bands are marked.",
      why: "A UNC-15 marks every millimetre and a Williams probe marks 1-2-3, 5, 7-8-9, 10 — reading a number off the wrong assumption about which probe this is turns every site that follows into a plausible-looking wrong measurement.",
    },
    {
      id: "probe-pickup", kind: "drag", target: "probe-pickup",
      title: "Pick up the probe",
      cue: "Bring the probe from the tray into working position.",
      drag: { to: "probe-ready", radius: 0.4, missNote: "Not into position — bring the probe fully into your working hand before the first site." },
      why: "A probe half off the tray is a probe you are still reaching for while your other hand is already retracting the cheek — it comes fully into position before the first site, not mid-reach for it.",
    },
    {
      id: "probe-walk", kind: "track", target: "probe-walk", seconds: 6,
      noRobot: true, forceClass: "light",
      robotNote: "Intraoral: a probe walked against attachment, by feel, on a live patient.",
      title: "Walk and angle the probe",
      cue: "Hold light, steady pressure and keep the probe walking in small steps, parallel to the tooth's long axis.",
      track: {
        start: 0.14, green: [0.32, 0.56], rise: 0.5, fall: 0.42, drift: 0.12, label: "PROBING PRESSURE",
        readout: (v) => (v < 0.32 ? "too light — sites will be missed" : v > 0.56 ? "too hard — reading the periosteum, not the pocket" : "walking cleanly"),
      },
      why: "Roughly 25 grams of pressure — about what it takes to blanch the tip of a fingernail — is what the pocket actually measures at. Heavier than that and the probe pushes through inflamed tissue into the periosteum, charting a number that is not the true pocket depth.",
      holdBreakNote: "Pressure went out of band mid-walk — a probe that is too light skips sites and one that is too heavy reads the tissue, not the pocket. Bring it back and keep walking.",
    },
    {
      id: "site-order", kind: "sequence",
      noRobot: true, forceClass: "light",
      robotNote: "Six intraoral sites, probed to bone level.",
      targets: ["site-db", "site-b", "site-mb", "site-ml", "site-l", "site-dl"],
      itemNames: {
        "site-db": "distobuccal", "site-b": "buccal", "site-mb": "mesiobuccal",
        "site-ml": "mesiolingual", "site-l": "lingual", "site-dl": "distolingual",
      },
      title: "Probe all six sites, in order",
      cue: "Walk distobuccal, buccal, mesiobuccal around the facial, then mesiolingual, lingual, distolingual around the tongue side.",
      why: "Six sites, not one number rounded for the whole tooth — a pocket that is 3mm at the buccal and 7mm at the distolingual is two entirely different findings, and probing only the facial surface is how a full-mouth chart misses disease on the side nobody looked at.",
      outOfOrderNote: "Facial sites first — distobuccal, buccal, mesiobuccal — then the lingual side in the same direction. Walking it the same way every time is what keeps a full mouth from missing a site.",
    },
    {
      id: "call-depths", kind: "select", target: "chart-panel",
      title: "Chart the pocket depths",
      cue: "Call out and enter the depth read at each of the six sites.",
      why: "A depth called out loud and entered immediately is a number checked twice — once by the hand reading the probe and once by the ears hearing it said back. A number remembered for even a few sites and entered later is a number that drifts.",
    },
    {
      id: "bop-suppuration", kind: "select", target: "bop-panel",
      title: "Record bleeding and suppuration",
      cue: "Mark every site that bled on probing or expressed suppuration.",
      why: "Bleeding on probing and suppuration are findings in their own right, not footnotes to the depth — a site charted at 3mm with bleeding is a site with active inflammation that a depth number alone would call healthy.",
    },
    {
      id: "recession-cal", kind: "gauge", target: "recession-gauge",
      title: "Measure recession and calculate CAL",
      cue: "Read the recession at the gumline and commit — the chart adds it to the pocket depth for clinical attachment loss.",
      gauge: { label: "RECESSION (mm)", speed: 0.6, green: [0.28, 0.5], readout: (t) => `${(t * 6).toFixed(1)} mm`, missNote: "Read again from the gumline to the CEJ — an off measurement here throws off the attachment loss the whole stage is based on." },
      why: "Clinical attachment loss is the pocket depth plus the recession, measured from a fixed point — the cemento-enamel junction — rather than from the gumline alone. A tooth with recession can have a shallow pocket and still have lost real attachment, which is exactly the case a depth-only chart would miss.",
    },
    {
      id: "grade-involvement", kind: "sequence", anyOrder: true,
      noRobot: true, forceClass: "light",
      robotNote: "Furcation and mobility are both read with the probe in the mouth.",
      targets: ["furcation-ii", "mobility-1"],
      itemNames: { "furcation-ii": "furcation, Class II", "mobility-1": "mobility, Class I" },
      decoyNotes: {
        "furcation-i": "The probe enters the furcation area but nowhere near through it — that reads as Class I, not this tooth's finding of the probe entering into but not through.",
        "furcation-iii": "A through-and-through furcation is Class III. This probe stopped inside the furcation without exiting the other side — that is Class II.",
      },
      title: "Grade furcation involvement and mobility",
      cue: "Grade what this tooth's probe entry and hand test actually showed.",
      why: "Furcation and mobility grades are read off a specific test, not estimated from how bad the tooth looks — a Class II furcation and a Class I mobility on the same tooth changes the prognosis discussion from a Class III and Class III on the same numbers would.",
    },
    {
      id: "compare-hold", kind: "hold", target: "compare-hold", seconds: 5,
      title: "Compare against the last visit",
      cue: "Hold the prior chart against today's, site by site, and look for what moved.",
      why: "A chart is a comparison, not a snapshot — the number that matters most today is often the one that changed from last time, not the one that happens to be highest. Holding both charts side by side, site by site, is how a jump gets caught instead of being read as just another deep site.",
      holdBreakNote: "You let go of the comparison before it was through — a site that changed further down the chart gets missed if the review doesn't run the full length.",
    },
    {
      id: "stage-grade", kind: "sequence", anyOrder: true,
      targets: ["stage-ii", "grade-b"],
      itemNames: { "stage-ii": "Stage II", "grade-b": "Grade B" },
      decoyNotes: {
        "stage-i": "Stage I is early, attachment loss under 2mm — this chart's interdental CAL and radiographic bone loss are past that.",
        "stage-iii": "Stage III adds attachment loss of 5mm or more with vertical bone loss or a Class II/III furcation the periodontium can't recover on its own — this case's findings sit a stage short of that.",
        "grade-a": "Grade A is a slow rate of progression with no risk factors evident — this patient's history and the bone-loss-to-age ratio point to faster than that.",
        "grade-c": "Grade C is rapid progression with clear risk factors like uncontrolled diabetes or heavy smoking — neither is on this chart.",
      },
      title: "Stage and grade the case",
      cue: "Match today's findings to the AAP 2017 classification — stage for severity, grade for rate of progression.",
      why: "Stage describes how much damage has already happened — attachment loss, bone loss, tooth loss, complexity — and grade describes how fast it is likely moving. The same stage with a different grade is a different conversation about how urgently the plan needs to move.",
    },
    {
      id: "plan-follow", kind: "select", target: "plan-panel",
      title: "Confirm the plan follows from the chart",
      cue: "Match today's treatment plan to the stage and grade just charted.",
      why: "A chart that says Stage II Grade B and a plan that was already written before the probe came out are two documents that happen to share a patient — the plan is confirmed against what was actually found, not defended after the fact.",
    },
    {
      id: "close-review", kind: "find", noHint: true,
      targets: ["probe-disinfected", "sharps-put-away"],
      itemNames: { "probe-disinfected": "probe into the sterilisation pouch", "sharps-put-away": "sharps-safe holder closed" },
      itemNotes: {
        "probe-disinfected": "A probe left on the open tray after the last site is a contaminated sharp sitting in reach of the next thing anyone picks up.",
        "sharps-put-away": "The holder closed is what keeps a sharp instrument from becoming the first thing a hand meets reaching for something else on the tray.",
      },
      decoyNotes: {
        "chart-locked": "The chart is already locked and timestamped — nothing more to do with it here.",
      },
      title: "Close out before the patient leaves",
      cue: "Two things about the tray need to be true before this chair is done — find them.",
      why: "A chart that is perfect and a tray that still has an open sharp on it is not a finished visit — the room is left the way the next patient's chart needs it to start.",
    },
  ],

  interrupts: [
    {
      id: "site-changed-flag",
      kind: "Chart discrepancy",
      after: "compare-hold", delay: 3, seconds: 12,
      alert: "Site 30 distobuccal probes at 7mm with bleeding today. Last visit's chart shows the same site at 3mm.",
      cue: "That is a four-millimetre jump at one site, not just a deep number.",
      target: "flag-dentist-panel",
      why: "A single site that moved four millimetres between visits is a different finding from a site that has quietly been 7mm for years — it says something changed recently, and the AAP's grading depends on exactly that kind of rate-of-change evidence. It gets flagged for the dentist as a change, not filed as just another number on the chart.",
      missNote: "You finished the comparison without flagging the jump at site 30. A chart that records the 7mm but not that it used to be 3mm hides the one piece of evidence that would have told the dentist this site is actively getting worse right now.",
      wrongNote: "It is the flag for the dentist. Whatever else is on this chart, that four-millimetre change is what needs a second set of eyes.",
    },
    {
      id: "prolonged-bleeding",
      kind: "Bleeding beyond expected",
      after: "probe-walk", delay: 3, seconds: 12,
      alert: "The site you just probed is still bleeding well past the few seconds a healthy sulcus normally takes to stop — this patient's chart carries a blood thinner.",
      cue: "That is longer than probing alone accounts for.",
      target: "gauze-pack",
      why: "An anticoagulant changes how long a probed site bleeds, not whether probing itself was done correctly — applying gentle, sustained pressure with gauze until it actually stops is the response, rather than continuing to the next site and charting over a site that is still bleeding.",
      missNote: "You moved on to the next site while the last one was still bleeding. Prolonged bleeding on an anticoagulated patient is a known, expected event this practice has a response for — leaving it unmanaged is the failure, not the bleeding itself.",
      wrongNote: "It is the gauze. Apply sustained pressure to the site until the bleeding has actually stopped before anything else continues.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, PERIO_ACCENT);

    // -------------------------------------------------------------- the chair
    const chair = group(g, 0, 0, -1.7);
    cyl(chair, 0.22, 0.28, 0.42, 0, 0.21, 0, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 20, finish: "brushed" });
    cyl(chair, 0.09, 0.09, 0.18, 0, 0.46, 0, 0x5a636b, { rough: 0.4, metal: 0.6, seg: 14 });
    slab(chair, 0.62, 0.14, 0.72, 0, 0.56, -0.1, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    const back = slab(chair, 0.6, 0.85, 0.16, 0, 0.94, -0.62, 0x3f6f86, { radius: 0.08, rough: 0.6 });
    back.rotation.x = -0.42;
    const headrest = slab(chair, 0.34, 0.24, 0.1, 0, 1.34, -1.02, 0x3f6f86, { radius: 0.05, rough: 0.6 });
    headrest.rotation.x = -0.42;
    const footrest = slab(chair, 0.56, 0.12, 0.6, 0, 0.42, 0.55, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    footrest.rotation.x = 0.3;
    for (const sx of [-1, 1]) box(chair, 0.08, 0.05, 0.5, sx * 0.34, 0.68, -0.1, 0x2f5768, { rough: 0.65 });

    // The chair reclines; the patient's head tilts back with it rather than
    // the whole rigid figure pivoting, which would swing the legs up off the
    // footrest and read as a cross rather than a reclined person. The arms
    // rest angled in rather than straight down at the sides, which is what
    // was reading as a stark cross against the pale gown fabric.
    const patient = seatedFigure(chair, 0, 0.6, -0.36, { skin: 0xc99878, cloth: 0xb9c4c9 });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.head.rotation.x = -0.34;
    for (const [arm, sx] of [[patient.arms[0], -1], [patient.arms[1], 1]]) {
      arm.shoulder.rotation.set(-0.18, 0, sx * 0.16);
    }
    const mouthSite = group(patient.head, 0, -0.08, 0.1);

    // Six site markers laid out around the represented tooth, in walking order.
    const siteDefs = [
      ["site-db", -0.05, 0.03], ["site-b", 0, 0.04], ["site-mb", 0.05, 0.03],
      ["site-ml", 0.05, -0.03], ["site-l", 0, -0.04], ["site-dl", -0.05, -0.03],
    ];
    for (const [id, dx, dz] of siteDefs) {
      const s = ball(mouthSite, 0.008, dx, 0, dz, PERIO_ACCENT, { emissive: PERIO_ACCENT, ei: 0.7, rough: 0.5, seg: 8 });
      reg(hits, s, id);
    }

    // ---------------------------------------------------------- light + tray
    const lightPole = group(g, 0, 0, -2.3);
    cyl(lightPole, 0.05, 0.06, 2.4, 0, 1.2, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 14 });
    const lightArm = group(lightPole, 0, 2.3, 0);
    const lightBoom = cyl(lightArm, 0.03, 0.03, 0.9, 0.45, 0.05, 0.35, CITY.steel, { rough: 0.35, metal: 0.7, seg: 10 });
    lightBoom.rotation.set(0, 0.6, -1.1);
    const lightHead = cyl(lightArm, 0.16, 0.18, 0.1, 0.75, 0.32, 0.62, 0xeaf4fb, { rough: 0.3, metal: 0.2, seg: 20, emissive: 0xeaf4fb, ei: 0.6 });
    reg(hits, lightHead, "position-light");

    const trayArm = group(chair, 0.55, 0.9, -0.2, -0.6);
    cyl(trayArm, 0.025, 0.025, 0.55, 0, -0.28, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    slab(trayArm, 0.42, 0.03, 0.26, 0.2, -0.02, 0, 0x2b3138, { radius: 0.02, rough: 0.45, metal: 0.4 });

    // The probe, its holder and a sharps-safe pouch.
    const probePick = group(trayArm, 0.1, 0.02, -0.05, 0.3);
    cyl(probePick, 0.006, 0.006, 0.16, 0, 0, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 });
    for (const [c, y] of [[0xf0645b, 0.02], [0xeaf6ff, 0.05], [0xf0645b, 0.08]]) {
      cyl(probePick, 0.0075, 0.0075, 0.012, 0, y, 0, c, { rough: 0.4, seg: 8 });
    }
    reg(hits, probePick, "probe-check");
    const probePickup = group(trayArm, 0.24, 0.02, 0.02, 0.1);
    cyl(probePickup, 0.006, 0.006, 0.16, 0, 0, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 });
    holoTag(trayArm, "probe", 0.24, 0.16, 0.02, { css: "#6fc9a0", w: 0.2 });
    reg(hits, probePickup, "probe-pickup");
    const probeReadySocket = ball(mouthSite, 0.02, 0, 0.06, 0.14, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, probeReadySocket, "probe-ready");
    const probeWalkMark = ball(mouthSite, 0.018, 0, 0.04, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, probeWalkMark, "probe-walk");

    // Sharps-safe holder and the open-tray trap.
    const holder = group(trayArm, -0.14, 0.02, 0.06);
    cyl(holder, 0.03, 0.03, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 14 });
    reg(hits, holder, "sharps-put-away");
    const probeDisinfect = box(trayArm, 0.14, 0.02, 0.06, -0.14, 0.02, -0.08, 0xdfe4e8, { rough: 0.4, opacity: 0.7, transparent: true });
    reg(hits, probeDisinfect, "probe-disinfected");
    const trayOpenTrap = cyl(trayArm, 0.006, 0.006, 0.15, -0.05, 0.03, 0.1, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 });
    holoTag(trayArm, "probe down — tip out?", -0.05, 0.14, 0.1, { css: "#f0645b", w: 0.42 });
    reg(hits, trayOpenTrap, "unsafe-probe-set-down");

    // "Estimate it" and "skip the check" shortcuts near the chart.
    const guessBtn = box(g, 0.1, 0.1, 0.05, 1.1, 0.95, -1.5, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "chart an estimate?", 1.1, 1.1, -1.5, { css: "#f0645b", w: 0.4 });
    reg(hits, guessBtn, "eyeball-depth");
    const skipBopBtn = box(g, 0.1, 0.1, 0.05, 1.1, 0.75, -1.7, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "skip the BOP check?", 1.1, 0.9, -1.7, { css: "#f0645b", w: 0.42 });
    reg(hits, skipBopBtn, "skip-bop");
    // Excess-force trap, right at the probing site.
    const hardProbeMark = ball(mouthSite, 0.016, 0, 0, 0.18, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hardProbeMark, "hard-probe");

    // -------------------------------------------------------------- panels
    const chartPanel = holoPanel(g, 1.05, 0.72, -2.4, 1.55, -4.55, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fc9a0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
      cx.fillText("PERIODONTAL CHART — TOOTH 30", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d2";
      ["DB / B / MB: ___ / ___ / ___", "ML / L / DL: ___ / ___ / ___", "BOP · suppuration: ___"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.32 + i * h * 0.16));
    }, { accent: 0x6fc9a0 });
    reg(hits, chartPanel, "chart-panel");

    const bopPanel = holoPanel(g, 0.85, 0.55, -0.9, 1.5, -4.55, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fc9a0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
      cx.fillText("BOP / SUPPURATION", w * 0.05, h * 0.2);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d2";
      cx.fillText("Mark every site that bled", w * 0.05, h * 0.5);
    }, { accent: 0x6fc9a0 });
    reg(hits, bopPanel, "bop-panel");

    const recessionGauge = holoPanel(g, 0.7, 0.5, 0.6, 1.5, -4.55, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fc9a0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
      cx.fillText("-- mm", w / 2, h * 0.55);
    }, { accent: 0x6fc9a0 });
    reg(hits, recessionGauge, "recession-gauge");

    // Furcation / mobility grading panel with decoy grades.
    const gradeRow = group(g, -2.3, 0, -3.6);
    const gradeDefs = [
      ["furcation-i", "FURC. I", -0.62], ["furcation-ii", "FURC. II", -0.31],
      ["furcation-iii", "FURC. III", 0.0], ["mobility-1", "MOB. I", 0.42],
    ];
    const CORRECT_GRADE = new Set(["furcation-ii", "mobility-1"]);
    for (const [id, label, dx] of gradeDefs) {
      const btn = decal(gradeRow, 0.28, 0.16, dx, 0.9, 0,
        paperFace(label, ["tap to grade"], { bg: "#eaf7ef", band: CORRECT_GRADE.has(id) ? "#4a9a72" : "#c99a2b" }), { px: 220 });
      reg(hits, btn, id);
    }

    // Prior-chart comparison and the dentist flag.
    const compareHold = decal(g, 0.4, 0.5, 1.4, 0.95, -3.6,
      paperFace("LAST VISIT", ["Site 30 DB: 3mm", "no bleeding noted"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 240 });
    reg(hits, compareHold, "compare-hold");
    const flagPanel = group(g, 2.15, 0, -3.6, -0.3);
    box(flagPanel, 0.06, 0.28, 0.22, 0, 1.0, 0, 0x2b3138, { rough: 0.5 });
    const flagLamp = ball(flagPanel, 0.02, 0.04, 1.12, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 10 });
    holoTag(flagPanel, "flag for dentist", 0.04, 1.24, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, flagPanel, "flag-dentist-panel");

    // Gauze pack for the prolonged-bleeding interrupt.
    const gauzePack = group(g, -1.6, 0, -1.5);
    box(gauzePack, 0.09, 0.35, 0.32, 0, 0.175, 0, 0x8b929a, { rough: 0.55, metal: 0.3 });
    for (let i = 0; i < 3; i++) slab(gauzePack, 0.08, 0.006, 0.08, 0, 0.36 + i * 0.008, 0, 0xf4f6f8, { radius: 0.004, rough: 0.95 });
    holoTag(gauzePack, "gauze", 0, 0.5, 0, { css: "#6fc9a0", w: 0.22 });
    reg(hits, gauzePack, "gauze-pack");

    // Stage / grade panel with decoys.
    const stageRow = group(g, 0.6, 0, -3.95);
    const stageDefs = [
      ["stage-i", "STAGE I", -0.66], ["stage-ii", "STAGE II", -0.33], ["stage-iii", "STAGE III", 0.0],
      ["grade-a", "GRADE A", 0.42], ["grade-b", "GRADE B", 0.72], ["grade-c", "GRADE C", 1.02],
    ];
    for (const [id, label, dx] of stageDefs) {
      const btn = decal(stageRow, 0.26, 0.15, dx, 0.6, 0,
        paperFace(label, ["tap to select"], { bg: "#eaf7ef", band: id === "stage-ii" || id === "grade-b" ? "#4a9a72" : "#c99a2b" }), { px: 200 });
      reg(hits, btn, id);
    }

    const planPanel = holoPanel(g, 0.95, 0.6, -1.9, 1.5, -4.55, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fc9a0"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
      cx.fillText("TREATMENT PLAN", w * 0.05, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d2";
      cx.fillText("Quadrant SRP · 4-6wk re-eval", w * 0.05, h * 0.5);
    }, { accent: 0x6fc9a0 });
    reg(hits, planPanel, "plan-panel");

    const chartLocked = box(g, 0.1, 0.02, 0.08, -2.6, 1.0, -4.5, 0x2b3138, { rough: 0.5, opacity: 0.6, transparent: true });
    reg(hits, chartLocked, "chart-locked");

    // ---------------------------------------------------------- hygienist crew
    const hygienist = standingFigure(g, -1.0, -1.3, { ry: 1.0, cloth: 0x3a8f6f, skin: 0xb98a63 });
    holoTag(hygienist, "hygienist", 0, 1.9, 0, { css: "#6fc9a0", w: 0.3 });

    // Cabinet for depth along the side wall.
    const cabinet = group(g, -2.9, 0, -0.4, 0.5);
    box(cabinet, 1.0, 0.85, 0.5, 0, 0.425, 0, 0xdfe4e8, { rough: 0.55, metal: 0.15 });
    box(cabinet, 0.85, 0.06, 0.4, 0, 0.86, 0, 0xc7ccd1, { rough: 0.5 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.7),

      onStepComplete(step) {
        if (step.id === "probe-pickup") { probePickup.visible = false; }
        if (step.id === "call-depths") {
          repaint(chartPanel.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
            cx.fillText("PERIODONTAL CHART — TOOTH 30", w * 0.05, h * 0.12);
            cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d2";
            ["DB / B / MB: 7 / 4 / 3", "ML / L / DL: 3 / 3 / 4", "BOP · suppuration: pending"]
              .forEach((l, i) => cx.fillText(l, w * 0.05, h * 0.32 + i * h * 0.16));
          });
        }
        if (step.id === "recession-cal") {
          repaint(recessionGauge.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
            cx.fillText("1.5 mm · CAL 8.5", w / 2, h * 0.55);
          });
        }
        if (step.id === "plan-follow") {
          chartLocked.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, opacity: 0.9, transparent: true });
        }
      },

      onInterrupt(it) {
        if (it.id === "site-changed-flag") {
          flagLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.9 });
        }
        if (it.id === "prolonged-bleeding") {
          hardProbeMark.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 0.8 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "site-changed-flag") {
          flagLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5 });
        }
        if (it.id === "prolonged-bleeding") {
          hardProbeMark.material = mat(0x000000, { opacity: 0.001, transparent: true });
        }
      },

      animate(t, dt, session) {
        void t;
        const tr = session?.track;
        if (tr && session.step?.id === "probe-walk") {
          probeWalkMark.material = mat(tr.v >= tr.green[0] && tr.v <= tr.green[1] ? 0x59c97b : 0xf0645b, {
            emissive: tr.v >= tr.green[0] && tr.v <= tr.green[1] ? 0x59c97b : 0xf0645b, ei: 0.8,
          });
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "recession-cal") {
          repaint(recessionGauge.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,18,14,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = gg.t >= 0.28 && gg.t <= 0.5 ? "#59c97b" : "#f0645b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#dff8ec";
            cx.fillText(`${(gg.t * 6).toFixed(1)} mm`, w / 2, h * 0.55);
          });
        }
        if (session?.turn && session.step?.id === "position-light") lightArm.rotation.y = -session.turn.amount * 1.2;
        void dt;
      },
    };
  },
};
