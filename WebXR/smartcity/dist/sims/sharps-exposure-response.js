import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, particles, seatedFigure, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sharps Exposure Response VR — Dental & Oral Health, station
// three. A needlestick mid-scaling: the procedure stopped and the patient
// reassured, the wound washed rather than squeezed, the exposure reported at
// once, the source patient's status pursued with consent, the exposed
// hygienist into post-exposure evaluation inside the hours that make
// prophylaxis meaningful, the stick logged on OSHA's own sharps injury log,
// the device examined for what actually failed, and a follow-up testing
// schedule set before anyone leaves the room.

const SER_ACCENT = 0xf2a23b;

export const SIM_SHARPS_EXPOSURE_RESPONSE = {
  id: "sharps-exposure-response",
  index: "118",
  domain: "Dental Hygiene",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "OSHA 29 CFR 1910.1030 bloodborne pathogens — the exposure control plan, engineering controls and the post-exposure evaluation; ISO 23908 for sharps injury protection devices; OSHA's sharps injury log recordkeeping requirement; the CDC's post-exposure prophylaxis guidance; the Dental Hygiene Board of California practice act",
  name: "Sharps Exposure Response",
  title: simTitle("Sharps Exposure Response"),
  tagline: "A needlestick mid-scaling: stopped safely, washed not squeezed, reported at once, the source pursued with consent, evaluation inside the hours that matter, and the stick logged and reviewed",
  accent: SER_ACCENT,
  accentCss: "#f2a23b",
  parSeconds: 230,
  footprint: 2.0,
  badge: { id: "exposure-managed", name: "Exposure Managed", note: "A needlestick handled start to finish inside the hours that make post-exposure prophylaxis meaningful" },

  game: system({
    name: "Exposure Response",
    currency: "HOUR",
    ranks: ["New Hygienist", "Chairside Responder", "Exposure Lead", "Safety Officer", "Exposure Response Certified"],
    badges: [
      { id: "washed-not-squeezed", name: "Washed, Not Squeezed", note: "The wound washed with soap and water for the full time, nothing else done to it", test: AWARD.stepClean("wash-wound") },
      { id: "reported-now", name: "Reported Now", note: "The exposure reported the moment the wound was washed, not at the end of the visit", test: AWARD.stepClean("report-supervisor") },
      { id: "log-complete", name: "Log Complete", note: "The sharps injury log closed out with the device review attached", test: AWARD.stepClean("sharps-log") },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections anywhere in the response", test: AWARD.clean },
      { id: "held-the-wash", name: "Held The Wash", note: "Held the wound wash the full time, first try", test: AWARD.unbroken },
      { id: "fast-response", name: "Fast Response", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bleach-bottle": "That is bleach. Bleach and other caustic disinfectants are never used on a needlestick wound — the CDC's guidance is soap and running water, nothing more aggressive, on a puncture that is already an open route into tissue.",
    "recap-needle": "Recapping that needle two-handed is exactly the motion that caused this exposure in the first place. It goes into the sharps container as it is, not back under a cap held in your other hand.",
    "torn-glove": "That glove is torn at the fingertip and still on the tray where it came off. Touching a phone, a form or a patient again with a compromised glove — or no glove — spreads this exposure to everything you touch next.",
    "sticky-note-report": "A note stuck to the supervisor's monitor is not a report. The exposure control plan requires the exposure reported to a supervisor directly and immediately, not left for someone to notice on their own time.",
  },

  lateNotes: {
    "rapid-test-kit": "There's no consent yet to test the source patient — that comes first.",
    "sharps-injury-log": "Not yet. The exposure needs to be reported and the evaluation window addressed before this becomes a closed record.",
    "exposure-clock": "The source patient's status isn't known yet, and that shapes the evaluation — get there first.",
  },

  steps: [
    {
      id: "stop-procedure", kind: "select", target: "scaler-down",
      title: "Stop the procedure safely",
      cue: "Set the scaler down and step back from the patient's mouth.",
      why: "The instrument goes down deliberately, not dropped or waved — a second sharp moving through the air in the same few seconds as the first one is how one needlestick becomes two.",
    },
    {
      id: "reassure-patient", kind: "select", target: "patient",
      noRobot: true, forceClass: "none",
      robotNote: "Comfort and explanation are the clinician's; a robot does not reassure the patient it was standing beside.",
      title: "Reassure the patient",
      cue: "Tell the patient what happened and that you're stepping out briefly.",
      why: "The patient just watched you flinch and stop mid-procedure with no explanation — a short, calm statement of what happened keeps them from imagining something worse than a stick, and keeps the room controlled while you deal with it.",
    },
    {
      id: "wash-wound", kind: "hold", target: "wound-site", seconds: 6,
      noRobot: true, forceClass: "light",
      robotNote: "The wound is a person's hand. First aid on anybody, staff included, is not the robot's to give.",
      title: "Wash the wound with soap and water",
      cue: "Hold the puncture under running water with soap for the full wash — no squeezing.",
      why: "Soap and running water is the CDC's own guidance for a percutaneous exposure — plain, unhurried, and long enough to matter. Squeezing the site to force blood out is not recommended and does not reduce exposure; running water does the actual work.",
      holdBreakNote: "You pulled your hand out early. A wash cut short is a wash that did not run long enough to do what it's actually for.",
    },
    {
      id: "reglove", kind: "select", target: "fresh-gloves",
      title: "Reglove before touching anything else",
      cue: "Take a fresh pair before you pick up a phone, a form, or the patient's chart.",
      why: "Everything from here — the phone, the paperwork, the patient's chart — gets touched by whatever is on your hands right now. A fresh glove is what keeps this exposure from becoming a second one on someone else's surface.",
    },
    {
      id: "secure-area", kind: "hold", target: "causative-needle", seconds: 5,
      title: "Secure the causative device",
      cue: "Keep the needle isolated where it fell and hold the area clear until it's handled properly.",
      why: "The device that caused this is evidence for the review that comes later — whether the safety shield engaged, whether it was defective, whether the container it was headed for was already full. It stays exactly where it is until that review happens, not picked up and disposed of on reflex.",
      holdBreakNote: "You let the area go before it was secured — anyone walking past can now touch the device or the exposure gets contaminated further.",
    },
    {
      id: "report-supervisor", kind: "select", target: "supervisor-phone",
      title: "Report the exposure immediately",
      cue: "Call your supervisor now, before you finish anything else.",
      why: "The exposure control plan exists because the clock that matters — the hours to post-exposure evaluation — starts running at the stick, not at the end of the day when it's convenient to mention. Immediate report is what keeps that clock from running out unnoticed.",
    },
    {
      id: "source-workup", kind: "sequence",
      targets: ["consent-form", "rapid-test-kit"],
      itemNames: { "consent-form": "the source patient's consent", "rapid-test-kit": "the source patient's rapid test" },
      title: "Get consent, then determine the source patient's status",
      cue: "Explain why their status matters and get consent first — then run or pull the rapid test result.",
      why: "Testing the source patient requires their consent under the same rules that apply to any other test, asked for directly before anything is drawn — and a known-negative source changes the urgency of everything that follows, while an unknown or positive one means treating this as if prophylaxis may be needed until the evaluation says otherwise.",
      outOfOrderNote: "Consent comes before the test, not after — asking permission after the sample is already drawn is not consent.",
    },
    {
      id: "post-exposure-eval", kind: "gauge", target: "exposure-clock",
      title: "Get to post-exposure evaluation inside the window",
      cue: "Watch the hours since the stick and commit while you're still inside the plan's evaluation window.",
      why: "HIV post-exposure prophylaxis is time-critical — its benefit falls the longer it is delayed, which is why the exposure control plan sets a number of hours, not a number of days, to get the exposed worker evaluated. The clock does not pause for paperwork.",
      gauge: { label: "HOURS SINCE STICK", speed: 0.65, green: [0.05, 0.3], readout: (t) => `${(t * 8).toFixed(1)} h`, missNote: "That is well past the window the plan sets. Evaluation started late is evaluation that may have missed the point where prophylaxis still helps." },
    },
    {
      id: "sharps-log", kind: "select", target: "sharps-injury-log",
      title: "Record the incident on the sharps injury log",
      cue: "Enter the stick on the sharps injury log — device, location, and what happened.",
      why: "OSHA requires a sharps injury log recording the type and brand of device and the work area where the injury happened, kept confidential and separate from the general OSHA 300 log. It is what turns one stick into data a practice can actually act on.",
    },
    {
      id: "device-review", kind: "find", noHint: true,
      targets: ["shield-not-engaged", "container-overfilled"],
      itemNames: { "shield-not-engaged": "the safety shield, never engaged", "container-overfilled": "the sharps container, packed past its line" },
      itemNotes: {
        "shield-not-engaged": "This device's safety shield was never activated before it went down. ISO 23908 sets the requirements a sharps injury protection feature has to meet, but the standard only reaches a device that was actually used the way it was designed — a shield found retracted is a device that was handled as if it had none.",
        "container-overfilled": "This container is packed well past its fill line. A sharp forced into an already-full container is exactly how the one already inside comes back out at somebody's hand — this is very likely part of how tonight happened.",
      },
      title: "Examine the device and the circumstances",
      cue: "Two things about how this happened are visible right here in the room. Find them.",
      why: "OSHA's bloodborne pathogens standard calls for evaluating exposure incidents to find an engineering or work-practice fix, not just to file paperwork on them — the device and the room it happened in usually already show what went wrong.",
    },
    {
      id: "followup-schedule", kind: "sequence",
      targets: ["baseline-draw", "six-week-draw", "twelve-week-draw"],
      itemNames: { "baseline-draw": "baseline draw", "six-week-draw": "6-week draw", "twelve-week-draw": "12-week draw" },
      title: "Set the follow-up testing schedule",
      cue: "Schedule the baseline draw, then the 6-week draw, then the 12-week draw.",
      why: "A single negative test right after the stick only rules out what the exposed worker already had — seroconversion takes time, which is why the schedule runs in stages rather than ending the moment the first result comes back clean.",
      outOfOrderNote: "Baseline first, then the 6-week draw, then the 12-week draw — each one is timed to catch what the last one was too early to see.",
    },
  ],

  interrupts: [
    {
      id: "wave-it-off",
      kind: "Minimising the exposure",
      after: "wash-wound", delay: 3, seconds: 12,
      alert: "The hygienist is drying their hand off already and says they'd rather just finish the scaling — the patient's already numb.",
      cue: "Finishing the appointment is not what happens next.",
      target: "supervisor-phone",
      why: "A needlestick does not wait for a convenient stopping point in someone else's treatment plan — the report starts now, while the exposure is fresh and the timeline for evaluation is still intact, not after the appointment that caused it is wrapped up.",
      missNote: "The scaling finished before the exposure was reported. Every minute added between the stick and the report is a minute subtracted from however many hours the plan allowed for evaluation.",
      wrongNote: "It is the phone — this gets reported before anything else continues, appointment included.",
    },
    {
      id: "sharps-overfilled",
      kind: "Overfilled sharps container",
      after: "secure-area", delay: 3, seconds: 11,
      alert: "While you're securing the area, you notice the sharps container this needle was headed for is already packed past its fill line.",
      cue: "That container should have been swapped out before this shift, not after tonight's stick.",
      target: "sharps-container-swap",
      why: "An overfull container is a hazard for the next person to use it whether or not it caused tonight's exposure — it gets swapped for an empty one now, on the spot, not left for the next hygienist to discover the same way this one did.",
      missNote: "The overfilled container stayed in service. It is now one more sharp away from causing exactly the injury that just happened here.",
      wrongNote: "It is the replacement container — swap it now, before anyone else reaches for that slot.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, SER_ACCENT);

    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#eef2f4", base2: "#e3e8eb", seam: "rgba(0,0,0,0.08)",
    }), { repeat: 3, px: 256 });

    // -------------------------------------------------------------- dental chair
    const chair = group(g, 0, 0, -1.0);
    slab(chair, 0.62, 0.14, 1.5, 0, 0.5, 0, 0x3a4a52, { radius: 0.08, rough: 0.55 });
    const back = slab(chair, 0.58, 0.9, 0.6, 0, 0.86, -0.55, 0x3a4a52, { radius: 0.08, rough: 0.55 });
    back.rotation.x = -0.35;
    cyl(chair, 0.05, 0.05, 0.7, 0, 0.25, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 14 });

    const patient = seatedFigure(chair, 0, 0.86, -0.15, { skin: 0xd9a985, cloth: 0x6b7f8c });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    reg(hits, patient.head, "patient");

    // The scaler, dropped safely onto the tray rather than left in the air.
    const tray = group(chair, 0.34, 0.58, 0.35);
    box(tray, 0.3, 0.02, 0.2, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    const scaler = group(tray, -0.02, 0.02, 0);
    cyl(scaler, 0.007, 0.007, 0.16, 0, 0, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    box(scaler, 0.09, 0.014, 0.014, -0.11, 0, 0, 0x2b3138, { rough: 0.5 });
    reg(hits, scaler, "scaler-down");

    // The causative needle, uncapped, on the tray where it fell.
    const needle = group(tray, 0.08, 0.02, 0.04);
    cyl(needle, 0.008, 0.008, 0.08, 0, 0, 0, 0xdfe8ee, { rough: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(needle, 0.0015, 0.0015, 0.03, 0.055, 0, 0, CITY.steel, { rough: 0.1, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(needle, "Shield not engaged", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, needle, "causative-needle");
    // The cap sitting apart from it — the recapping temptation.
    const cap = cyl(tray, 0.007, 0.009, 0.045, 0.1, 0.03, -0.05, 0xf2a23b, { rough: 0.5, seg: 10 });
    cap.rotation.z = Math.PI / 2;
    reg(hits, cap, "recap-needle");

    // A torn glove left on the tray.
    const tornGlove = group(tray, -0.1, 0.021, 0.05);
    box(tornGlove, 0.09, 0.006, 0.06, 0, 0, 0, 0xf2c14b, { rough: 0.8 });
    box(tornGlove, 0.02, 0.006, 0.02, 0.045, 0, 0, 0x2b3138, { rough: 0.9 });
    holoTag(tornGlove, "Torn glove", 0, 0.05, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, tornGlove, "torn-glove");

    // -------------------------------------------------------------- wash station
    const sink = group(g, -2.2, 0, -0.4);
    box(sink, 1.0, 0.86, 0.5, 0, 0.43, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const sinkTop = slab(sink, 1.0, 0.04, 0.5, 0, 0.87, 0, 0xffffff, { radius: 0.01 });
    sinkTop.material = texturedMat(topTex, { rough: 0.5, metal: 0.06, color: 0xffffff });
    cyl(sink, 0.16, 0.16, 0.14, -0.28, 0.86, 0, 0xdfe4e8, { rough: 0.3, metal: 0.2, seg: 16, open: true, side: 2 });
    cyl(sink, 0.014, 0.014, 0.28, -0.28, 1.1, 0.1, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 }).rotation.x = 0.4;
    const soap = cyl(sink, 0.03, 0.03, 0.12, 0.1, 0.94, 0.05, 0xf2a23b, { rough: 0.4, seg: 10 });
    void soap;

    // A gloved hand under the tap — the wound-site itself.
    const hand = group(sink, -0.28, 0.92, 0.14);
    box(hand, 0.09, 0.03, 0.15, 0, 0, 0, 0xd9a985, { rough: 0.7 });
    const puncture = ball(hand, 0.006, 0, 0.016, 0.04, 0x8e1c1c, { rough: 0.5, seg: 8 });
    holoTag(hand, "Wound", 0, 0.05, 0, { css: SER_ACCENT, w: 0.24 });
    reg(hits, hand, "wound-site");
    void puncture;
    const water = particles(sink, 30, 0xbfe4f2, { size: 0.012, life: 0.35, additive: false, opacity: 0.5 });

    // Bleach bottle on the sink edge — the decoy.
    const bleach = group(sink, 0.34, 0.94, -0.1);
    cyl(bleach, 0.035, 0.04, 0.16, 0, 0.08, 0, 0xdfe4e8, { rough: 0.4, seg: 12 });
    decal(bleach, 0.06, 0.08, 0, 0.09, 0.041, signFace("BLEACH", { bg: "#eef2f4", accent: "#f0645b", scale: 0.55 }), { px: 96 });
    reg(hits, bleach, "bleach-bottle");

    // ------------------------------------------------------------------- PPE stand
    const ppe = group(g, -2.3, 0, 1.0, -0.4);
    slab(ppe, 0.5, 1.4, 0.1, 0, 0.7, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const freshGloves = box(ppe, 0.2, 0.14, 0.08, 0, 0.85, 0.07, 0x8fd1a0, { rough: 0.75 });
    holoTag(ppe, "Fresh gloves", 0, 0.98, 0.07, { css: SER_ACCENT, w: 0.32 });
    reg(hits, freshGloves, "fresh-gloves");

    // ------------------------------------------------------------------ reporting
    const desk = group(g, 2.0, 0, 1.1, -0.6);
    box(desk, 0.7, 0.75, 0.4, 0, 0.375, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    const phone = group(desk, 0.1, 0.78, 0.1);
    box(phone, 0.09, 0.02, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.3 });
    box(phone, 0.07, 0.03, 0.02, 0, 0.02, -0.05, 0x2b3138, { rough: 0.4, metal: 0.3 });
    holoTag(phone, "Supervisor line", 0, 0.06, 0, { css: SER_ACCENT, w: 0.36 });
    reg(hits, phone, "supervisor-phone");

    // The sticky note on the desk — the decoy report.
    const note = decal(desk, 0.09, 0.09, -0.2, 0.79, 0.08,
      paperFace("", ["Had a stick —", "will explain later"], { bg: "#fff2a8" }), { px: 128 });
    note.rotation.x = -Math.PI / 2;
    reg(hits, note, "sticky-note-report");

    const consentForm = decal(desk, 0.24, 0.32, 0.2, 0.79, -0.02,
      paperFace("CONSENT — SOURCE TESTING", ["Patient: source", "Test: HIV / HBV / HCV", "Signature required"]));
    consentForm.rotation.x = -Math.PI / 2;
    reg(hits, consentForm, "consent-form");

    const testKit = group(g, 2.35, 0, 0.5, -0.3);
    box(testKit, 0.22, 0.08, 0.16, 0, 0.85, 0, 0xeef2f4, { rough: 0.5 });
    decal(testKit, 0.18, 0.04, 0, 0.891, 0, signFace("RAPID TEST", { bg: "#eef2f4", accent: "#f2a23b", scale: 0.5 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg(hits, testKit, "rapid-test-kit");

    // ----------------------------------------------------------------- the clock
    const clockPanel = holoPanel(g, 0.5, 0.34, 0, 1.6, -2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2a23b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe9b0";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("0.0 h", w * 0.08, h * 0.4);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("since the stick", w * 0.08, h * 0.72);
    }, { accent: SER_ACCENT });
    reg(hits, clockPanel, "exposure-clock");

    // ------------------------------------------------------------- log & review
    const logPanel = holoPanel(g, 0.5, 0.36, 1.7, 1.4, -1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2a23b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe9b0";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SHARPS INJURY LOG", w * 0.06, h * 0.2);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Device: — · Area: —", w * 0.06, h * 0.55);
    }, { accent: SER_ACCENT, ry: -0.3 });
    reg(hits, logPanel, "sharps-injury-log");

    // The overfull sharps container the causative needle was headed for.
    const sharpsUnit = group(g, 2.0, 0, -1.5, -Math.PI / 2);
    box(sharpsUnit, 0.3, 0.38, 0.24, 0, 1.1, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsUnit, 0.32, 0.05, 0.26, 0, 1.32, 0, 0xf2e9c9, { rough: 0.55 });
    for (let i = 0; i < 6; i++) {
      const s = cyl(sharpsUnit, 0.008, 0.008, 0.07, -0.09 + i * 0.036, 1.36, 0.02, 0xdfe8ee, { rough: 0.3, seg: 8 });
      s.rotation.set(0.4 * Math.random(), 0, 0.6 * (Math.random() - 0.5));
    }
    const sharpsTag = decal(sharpsUnit, 0.28, 0.06, 0, 1.24, 0.122, signFace("PAST FILL LINE", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }));
    const overfilledMarker = box(sharpsUnit, 0.34, 0.4, 0.28, 0, 1.1, 0, 0x8d959d, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    reg(hits, overfilledMarker, "container-overfilled");

    // The safety-shield marker on the causative needle for the device review.
    const shieldMarker = box(needle, 0.02, 0.02, 0.02, 0.03, 0.012, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, shieldMarker, "shield-not-engaged");

    // The fresh replacement container, on a small cart nearby.
    const cart = group(g, 2.4, 0, -0.7);
    box(cart, 0.3, 0.06, 0.26, 0, 0.5, 0, 0x59636d, { rough: 0.6, metal: 0.3 });
    const freshSharps = group(cart, 0, 0.5, 0);
    box(freshSharps, 0.2, 0.28, 0.16, 0, 0.17, 0, 0xd8342a, { rough: 0.6 });
    box(freshSharps, 0.22, 0.04, 0.18, 0, 0.32, 0, 0xf2e9c9, { rough: 0.55 });
    holoTag(freshSharps, "Replacement", 0, 0.42, 0, { css: SER_ACCENT, w: 0.32 });
    reg(hits, freshSharps, "sharps-container-swap");

    // Follow-up testing tray: three vials, one per draw.
    const followTray = group(g, 1.0, 0, 1.7);
    box(followTray, 0.3, 0.02, 0.14, 0, 0.5, 0, 0xdfe4e8, { rough: 0.4, metal: 0.2 });
    const draws = [["baseline-draw", -0.1, 0xf2a23b, "BASE"], ["six-week-draw", 0, 0x59c97b, "6WK"], ["twelve-week-draw", 0.1, 0x4fd1ff, "12WK"]];
    for (const [id, dx, c, label] of draws) {
      const vial = cyl(followTray, 0.014, 0.014, 0.05, dx, 0.535, 0, c, { rough: 0.4, seg: 10 });
      holoTag(vial, label, 0, 0.05, 0, { css: SER_ACCENT, w: 0.2 });
      reg(hits, vial, id);
    }

    const colleague = standingFigure(g, 1.6, 2.2, { ry: -2.4, cloth: 0x4aa6a0, vest: SER_ACCENT, skin: 0xb98a63 });

    // Consumables shelving against the back wall, and a first-aid cabinet
    // beside the sink — the room this happened in, not just the props named
    // in the steps.
    const shelfA = group(g, -3.7, 0, -3.0);
    box(shelfA, 0.06, 1.5, 0.7, -0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfA, 0.06, 1.5, 0.7, 0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "GAUZE", 0xf4f8fa], [0.75, "TAPE", 0xdfe4e8], [1.2, "SHARPS BAGS", 0xf2a23b],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelfA, 0.82, 0.02, 0.68, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelfA, 0.24, 0.16, 0.2, i * 0.28, y + 0.09, 0, c, { rough: 0.7 });
        decal(shelfA, 0.18, 0.06, i * 0.28, y + 0.09, 0.101, (cx, w, h) => {
          cx.fillStyle = "#22272c"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#ffe9b0"; cx.font = `600 ${Math.round(h * 0.42)}px Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(label, w / 2, h / 2);
        }, { px: 96 });
      }
    }
    holoTag(shelfA, "Supplies", 0, 1.55, 0, { css: SER_ACCENT, w: 0.32 });

    const firstAid = group(g, -3.6, 0, 0.6);
    box(firstAid, 0.32, 0.4, 0.14, 0, 1.1, 0, 0xd8342a, { rough: 0.55 });
    box(firstAid, 0.28, 0.36, 0.02, 0, 1.1, 0.071, 0xf2e9c9, { rough: 0.5 });
    decal(firstAid, 0.2, 0.14, 0, 1.14, 0.081, signFace("FIRST AID", { bg: "#7d1512", accent: "#f2ae14", scale: 0.4 }), { px: 96 });
    box(firstAid, 0.24, 0.03, 0.1, 0, 0.9, 0.05, 0xf2e9c9, { rough: 0.5 });
    box(firstAid, 0.06, 0.02, 0.06, -0.06, 0.94, 0.08, 0xf0645b, { rough: 0.6 });
    box(firstAid, 0.06, 0.02, 0.06, 0.06, 0.94, 0.08, 0xdfe4e8, { rough: 0.6 });

    // Wall poster: bloodborne pathogens exposure control quick reference.
    const poster = group(g, 0, 0, -3.93);
    box(poster, 0.66, 0.86, 0.02, 0, 1.5, 0, 0xf4f6f8, { rough: 0.7 });
    decal(poster, 0.6, 0.8, 0, 1.5, 0.011, paperFace("EXPOSURE CONTROL PLAN", [
      "1  Stop and reassure", "2  Wash — soap and water", "3  Report immediately",
      "4  Source consent + test", "5  Evaluation in window", "6  Log and review",
    ]));

    // A lidded step-bin near the desk, and a floor mat under the chair.
    const bin = group(g, 0.5, 0, 2.7);
    cyl(bin, 0.13, 0.11, 0.32, 0, 0.16, 0, 0x53585e, { rough: 0.55, metal: 0.3, seg: 14 });
    cyl(bin, 0.14, 0.14, 0.03, 0, 0.33, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 14 });
    box(bin, 0.02, 0.14, 0.02, 0, 0.24, 0.12, 0x2b3138, { rough: 0.6 });
    cyl(bin, 0.03, 0.03, 0.05, 0, 0.35, 0.1, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 10 });
    slab(g, 1.1, 0.006, 1.5, 0, 0.001, -1.0, 0x2b3138, { radius: 0.05, rough: 0.9, opacity: 0.5, transparent: true, cast: false });

    return {
      hits,
      footprint: 2.0,
      spawnLook: new THREE.Vector3(0, 1.1, -1.0),

      onStep(step) {
        if (step.id === "device-review") needle.visible = true;
      },

      onStepComplete(step) {
        if (step.id === "reglove") tornGlove.visible = false;
        if (step.id === "report-supervisor") note.visible = false;
        if (step.id === "post-exposure-eval") {
          repaint(clockPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(10,20,10,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f7e4";
            ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("Evaluated in window", w * 0.08, h * 0.5);
          });
        }
        if (step.id === "sharps-log") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#f2a23b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffe9b0";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("SHARPS INJURY LOG", w * 0.06, h * 0.2);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Device: logged · Area: op 2", w * 0.06, h * 0.55);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "sharps-overfilled") overfilledMarker.material = mat(0xd2312b, { opacity: 0.18, transparent: true });
        if (it.id === "wave-it-off") { scaler.position.y += 0.05; scaler.rotation.z = -0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sharps-overfilled") {
          repaint(sharpsTag, signFace("SWAPPED", { bg: "#123a1e", accent: "#59c97b", scale: 0.5 }));
          overfilledMarker.material = mat(0x8d959d, { opacity: 0.001, transparent: true });
        }
        if (it.id === "wave-it-off") { scaler.position.y -= 0.05; scaler.rotation.z = 0; }
      },

      onHazard() {},

      animate(t, dt, session) {
        water.visible = session?.step?.id === "wash-wound" && !!session.holding;
        if (water.visible) water.userData.step(dt, new THREE.Vector3(-2.48, 1.06, -0.26), 0.06, 0.5, -1.3);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "post-exposure-eval") {
          repaint(clockPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(20,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = gg.t >= 0.05 && gg.t <= 0.3 ? "#59c97b" : "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffe9b0";
            ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText(`${(gg.t * 8).toFixed(1)} h`, w * 0.08, h * 0.4);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("since the stick", w * 0.08, h * 0.72);
          });
        }
      },
    };
  },
};
