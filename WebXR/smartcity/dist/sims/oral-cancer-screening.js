import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, seatedFigure, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Oral Cancer Screening VR — its own gamified system: Early Look.
// The screening every adult recall should include, run as its own procedure
// rather than a box ticked at the end of a cleaning. The skill is order and
// description: extraoral before intraoral, every intraoral site in the same
// sequence every time, and a real finding written up in terms — site, size,
// colour, texture, induration, duration — specific enough for the surgeon
// who has never seen this patient's mouth to know exactly what was found.

const OCS_ACCENT = 0x4fb8c9;

export const SIM_ORAL_CANCER_SCREENING = {
  id: "oral-cancer-screening",
  index: "130",
  domain: "Preventive dentistry",
  trade: "Registered dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The ADA's and the National Cancer Institute's oral cancer screening guidance, including the two-week persistent-lesion referral rule; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; HIPAA for the referral and the photographic record; the state dental hygiene board's scope of practice for referral; the ADHA",
  name: "Oral Cancer Screening",
  title: simTitle("Oral Cancer Screening"),
  tagline: "The screening every adult recall should include: extraoral and intraoral in a fixed order, a finding described in terms a surgeon can act on, and the two-week rule",
  accent: OCS_ACCENT,
  accentCss: "#4fb8c9",
  parSeconds: 270,
  footprint: 2.0,
  badge: { id: "early-look", name: "Early Look", note: "A full screening run in order with a finding fully described and referred inside the two-week rule" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the profession's own support resource, not an invented hotline.
  supportLine: "your employer's employee assistance program, or the ADHA's member resources, because being the one who found it is its own weight",

  game: system({
    name: "Early Look",
    currency: "SCAN",
    ranks: ["Recall Assistant", "Screening Hygienist", "Lead Screener", "Clinic Reviewer", "ADA Screening Certified"],
    badges: [
      { id: "clean-hands", name: "Clean Hands", note: "Never touched a bare-hand or cross-contamination trap", test: AWARD.safe },
      { id: "steady-palpation", name: "Steady Palpation", note: "Held the bimanual palpation reading near band centre", test: AWARD.precise(0.7) },
      { id: "order-kept", name: "Order Kept", note: "Ran the intraoral sequence with no correction", test: AWARD.stepClean("intraoral-visual") },
    ],
    challenges: [
      { id: "recall-pace", name: "Recall Pace", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-second-look", name: "No Second Look", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "screening-streak", name: "Screening Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "bare-hand-reach": "You reached toward this patient's mouth before gloving up. Standard precautions apply before the first contact of the appointment, not after — OSHA's bloodborne pathogens standard and the CDC's infection-control guidelines both treat gloving as the starting condition for touching a patient, never an afterthought once your hand is already there.",
    "personal-phone": "That is a personal phone, not the practice's secure intraoral camera. A photo of a patient's mouth taken on personal hardware is protected health information sitting on a device with no chain of custody back to this chart — exactly what HIPAA's safeguards for records exist to prevent.",
    "used-gauze": "That gauze is still on the tray from the last patient. Reusing anything that touched a previous patient's mouth is a cross-contamination event the CDC's infection-control guidelines exist specifically to rule out — fresh gauze, every patient, no exceptions for convenience.",
    "coffee-mug": "That is a drink sitting at the operatory counter, inside the clinical area. Eating and drinking where patient care happens is a standard-precautions violation for the same reason it always is — the gloves and the counter surfaces around a mouth exam are not somewhere food belongs.",
  },

  lateNotes: {
    "intraoral-camera": "There's no confirmed finding to photograph yet.",
    "referral-pad": "Describe and photograph the finding, and check how long it has been present, before deciding on a referral.",
    "chart-terminal": "The finding isn't documented yet — the record comes after the exam and the referral decision, not before.",
  },

  steps: [
    {
      id: "risk-history", kind: "select", target: "health-history-form",
      title: "Update the risk history",
      cue: "Ask about tobacco, alcohol, HPV exposure, and sun exposure to the lips since the last visit.",
      why: "Tobacco and alcohol use, HPV exposure, and sun exposure on the lips are the risk factors the ADA's and the NCI's screening guidance both point to first, and every one of them can change between recalls — a history taken once at intake and never updated is a risk profile that stops being true the year it was written.",
    },
    {
      id: "ppe-donning", kind: "select", target: "ppe-stand",
      title: "Glove up before the first contact",
      cue: "Put on gloves, mask and eyewear before touching the patient.",
      why: "Standard precautions start before the appointment does, not at some point during it — the CDC's infection-control guidelines and OSHA's bloodborne pathogens standard both treat PPE as the condition contact begins under, and an oral cancer screening puts your hands in a patient's mouth more than almost any other hygiene procedure.",
    },
    {
      id: "light-aim", kind: "turn", target: "exam-light",
      forceClass: "light",
      robotNote: "The light is aimed across the patient's face to open up the oropharynx.",
      title: "Aim the light for a clear view of the oropharynx",
      cue: "Bring the overhead light down onto the back of the mouth.",
      why: "Half of this screening happens at the very back of the mouth — the oropharynx, the tonsillar pillars, the base of the tongue — and none of it is visible without a light actually aimed there rather than left at whatever angle the last patient's cleaning needed.",
      turn: { turns: 0.25, axis: "x", label: "EXAM LIGHT" },
    },
    {
      id: "extraoral-exam", kind: "sequence",
      noRobot: true, forceClass: "light",
      robotNote: "The face, the lips and the cervical nodes, palpated.",
      targets: ["face-inspect", "lips-extraoral", "neck-nodes"],
      itemNames: { "face-inspect": "the face", "lips-extraoral": "the lips, from outside", "neck-nodes": "the neck nodes, bimanually" },
      title: "Run the extraoral exam in order",
      cue: "Face, then the lips from outside, then the neck nodes with both hands — in that order.",
      why: "The extraoral exam runs face to lips to neck because that is the order a real asymmetry, a lip lesion, or a node actually presents in front of you — skipping straight to palpating the neck misses whatever the face and the outer lip would have shown first, in daylight, before your hands are anywhere near the patient.",
      outOfOrderNote: "Face, then the outer lips, then the neck nodes bimanually — that order is what the extraoral exam actually is, not a checklist you can run in whatever sequence is convenient.",
    },
    {
      id: "intraoral-visual", kind: "sequence",
      noRobot: true, forceClass: "light",
      robotNote: "Five intraoral sites, inspected in order.",
      targets: ["lips-intraoral", "buccal-mucosa", "gingiva", "palate", "oropharynx"],
      itemNames: { "lips-intraoral": "the lips, inside", "buccal-mucosa": "the buccal mucosa", "gingiva": "the gingiva", "palate": "the palate", "oropharynx": "the oropharynx" },
      title: "Run the intraoral visual exam in order",
      cue: "Lips inside, buccal mucosa, gingiva, palate, then the oropharynx — the same order every time.",
      why: "A fixed order is what turns a screening into something repeatable across every hygienist in the practice and every recall this patient ever has — a finding described as \"on the palate\" only means something because the palate was checked in the same place in the sequence last time, not wherever the exam happened to wander that day.",
      outOfOrderNote: "Lips inside, buccal mucosa, gingiva, palate, then the oropharynx — the fixed order is what makes this exam comparable from one recall to the next.",
    },
    {
      id: "tongue-exam", kind: "hold", target: "tongue-gauze", seconds: 6,
      noRobot: true, forceClass: "light",
      robotNote: "The tongue is retracted with gauze and turned to see all three surfaces.",
      title: "Retract the tongue with gauze and inspect all three surfaces",
      cue: "Wrap the tongue in gauze, extend it gently, and hold while you check dorsal, lateral and ventral.",
      why: "The lateral border and the ventral surface of the tongue are where a disproportionate share of oral cancers are actually found, and neither one is visible with the tongue resting still in the mouth — the gauze is what lets you extend it far enough, and holding it steady is what lets you actually look at all three surfaces instead of one.",
      holdBreakNote: "Released before all three surfaces were checked. The dorsal surface is the easy one to see without gauze at all — the lateral and ventral surfaces are the reason you picked it up.",
    },
    {
      id: "floor-of-mouth", kind: "track", target: "floor-of-mouth", seconds: 5,
      noRobot: true, forceClass: "light",
      robotNote: "Bimanual palpation: one hand inside the mouth, one under the jaw.",
      title: "Palpate the floor of the mouth bimanually",
      cue: "One finger inside, one hand under the chin, and keep the pressure gentle and steady.",
      why: "The floor of the mouth cannot be fully assessed by looking alone — a firm area under otherwise normal-looking mucosa is exactly what bimanual palpation is built to catch, and the pressure has to stay in a narrow gentle band: too light and you feel nothing through the tissue, too firm and you cannot tell the patient's own guarding from an actual finding.",
      track: {
        start: 0.14, green: [0.34, 0.54], rise: 0.48, fall: 0.4, drift: 0.1, label: "PALPATION PRESSURE",
        readout: (v) => (v < 0.34 ? "too light — feeling nothing" : v > 0.54 ? "too firm — patient guarding" : "reading clearly"),
      },
      holdBreakNote: "Pressure out of the gentle band. Ease back to a steady, even pressure and hold it there.",
    },
    {
      id: "differential-check", kind: "find", noHint: true,
      noRobot: true, forceClass: "none",
      robotNote: "Telling a lesion from a normal variant is a judgement made looking into somebody's mouth.",
      targets: ["true-lesion"],
      itemNames: { "true-lesion": "the finding that is not a normal variant" },
      itemNotes: {
        "true-lesion": "This one does not match a known normal variant — persistent, indurated, and unlike anything on the reference board. This is the finding to document, photograph and time.",
      },
      decoyNotes: {
        "fordyce-granules": "Small pale-yellow raised spots on the buccal mucosa, symmetric and unchanging — Fordyce granules, a normal sebaceous variant, not a finding.",
        "linea-alba": "A white line along the buccal mucosa at the bite line — linea alba, from chronic cheek-biting or clenching against the teeth, not a finding.",
        "torus-palatinus": "A firm, smooth midline bony ridge on the hard palate — a torus, a normal bony growth, not a finding.",
      },
      title: "Tell the finding from a normal variant",
      cue: "One of these four is not a normal anatomic variant. Find it before you chart anything as a finding.",
      why: "Fordyce granules, linea alba and a palatal or mandibular torus are the normal variants every hygienist eventually learns to recognise on sight, and charting one of them as a finding sends a patient for an unnecessary referral — the actual skill this screening tests is telling the one that is not a variant from the three that are.",
    },
    {
      id: "describe-finding", kind: "sequence", anyOrder: true,
      targets: ["site", "size", "colour", "texture", "induration", "duration"],
      itemNames: { site: "site", size: "size", colour: "colour", texture: "texture", induration: "induration", duration: "duration" },
      title: "Describe the finding in full",
      cue: "Record site, size, colour, texture, induration and duration — all six, before you move on.",
      why: "A referral that says \"a spot on the tongue\" tells the oral surgeon almost nothing they can act on before the patient walks in the door. Site, size, colour, texture, induration and duration together are what let a clinician who has never seen this mouth understand exactly what was found and how urgently it needs to be seen.",
    },
    {
      id: "photograph-finding", kind: "select", target: "intraoral-camera",
      noRobot: true, forceClass: "light",
      robotNote: "The camera head goes in the mouth to frame the finding.",
      title: "Photograph the finding",
      cue: "Capture the finding on the practice's own intraoral camera.",
      why: "A description is one hygienist's words; a photograph is something the referring surgeon, and this same chart a year from now, can compare directly against what is actually there — taken on the practice's own camera, so the image is a HIPAA-covered record from the moment the shutter closes, not a file sitting on somebody's phone.",
    },
    {
      id: "duration-check", kind: "gauge", target: "chart-timeline",
      title: "Confirm how long the finding has been present",
      cue: "Check the chart's timeline against what the patient reports and commit once it's confirmed.",
      why: "The two-week rule is the whole reason this question gets asked precisely rather than accepted on impression: a lesion persisting past two weeks is referred, and a lesion the patient noticed three days ago is watched and rechecked — the same finding gets a different answer depending on nothing but this one number.",
      gauge: { label: "DAYS PRESENT — CONFIRM", speed: 0.55, green: [0.58, 0.85], readout: (t) => `${Math.round(t * 30)} days`, missNote: "That reading does not actually confirm past-two-weeks. Re-check the chart's timeline against what the patient told you before committing." },
    },
    {
      id: "referral", kind: "select", target: "referral-pad",
      title: "Write the referral",
      cue: "Complete the referral to oral surgery or oral pathology for this finding.",
      why: "A hygienist's scope of practice is to screen, describe and refer — not to diagnose what a lesion is. The referral is what turns a well-documented finding into a biopsy or a specialist's own examination, which is the only way this ever gets an actual answer.",
    },
    {
      id: "record", kind: "select", target: "chart-terminal",
      title: "Finalise the chart entry",
      cue: "Enter the finding, the photograph and the referral into the patient's record.",
      why: "The chart entry is what makes this screening exist for the next recall as well as this one — a finding that was seen, described and referred but never actually written into the record is, as far as the next hygienist who opens this chart is concerned, a finding that never happened.",
    },
  ],

  interrupts: [
    {
      id: "decline-tongue-pull",
      kind: "Patient discomfort",
      after: "tongue-exam", delay: 3, seconds: 12,
      alert: "The patient has put a hand up and is trying to pull their tongue back — the gauze retraction is clearly more than they want to tolerate right now.",
      cue: "Your hands are on the gauze. The patient is telling you to stop, not to keep going.",
      target: "stop-signal-card",
      why: "A patient can withdraw consent to any part of an exam at any point, and a raised hand mid-retraction is exactly that — acknowledging the stop signal and pausing is what keeps this a consented exam rather than something done to a patient who has already said they have had enough.",
      missNote: "The retraction continued for several more seconds after the patient tried to signal stop. Whatever this screening found after that point, it found it past the moment this patient withdrew consent to continue — and that is the part of the visit they will remember.",
      wrongNote: "Acknowledge the stop signal and ease off the gauze. Nothing about this exam continues over a patient who is actively telling you to stop.",
    },
    {
      id: "always-been-there",
      kind: "Patient history",
      after: "floor-of-mouth", delay: 3, seconds: 13,
      alert: "The patient mentions, almost in passing, that the area you're palpating \"has always been there\" — but nothing on the chart's history has ever documented it before.",
      cue: "Your hands are mid-palpation. The patient just said something worth checking against the record, not just believing.",
      target: "chart-terminal",
      why: "\"It's always been there\" is a patient's honest impression, not a documented fact, and a hygienist's own memory of previous visits is not a reliable substitute for what the chart actually says — pulling up the record is what tells you whether this is truly longstanding or whether it is new and simply feels familiar to a patient who was not looking for it before.",
      missNote: "The finding went forward as long-standing on the patient's word alone, with nobody actually checking the chart. If it was new, this screening just lost the two-week clock on a finding that needed exactly that timeline to be right.",
      wrongNote: "Pull up the chart and check. A patient's impression that something has always been there is not the same as a record that says so.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 1.95, OCS_ACCENT);

    // ------------------------------------------------------------- dental chair
    const chair = group(g, -0.5, 0, -0.1, 0.3);
    slab(chair, 0.62, 0.14, 0.6, 0, 0.55, 0, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    const chairBack = slab(chair, 0.6, 0.75, 0.14, 0, 0.98, -0.22, 0x3f6f86, { radius: 0.06, rough: 0.6 });
    chairBack.rotation.x = -0.55;
    const headrest = slab(chair, 0.3, 0.2, 0.1, 0, 1.42, -0.5, 0x2f5768, { radius: 0.04, rough: 0.65 });
    void headrest;
    for (const sx of [-1, 1]) {
      cyl(chair, 0.03, 0.03, 0.5, sx * 0.26, 0.28, -0.15, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
    }
    cyl(chair, 0.22, 0.24, 0.14, 0, 0.06, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });

    // The patient, reclined against the raked back.
    const patient = seatedFigure(chair, 0, 0.55, 0.02, { skin: 0xcf9e78, cloth: 0x8b98a0, ry: 0 });
    // Robot training: this is a person, so the head and the torso are
    // keep-out volumes an embodied trainee never enters unless the step it
    // is working declares patient contact. See shared/robot-embodiment.js.
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    patient.torso.rotation.x = -0.55;
    patient.head.rotation.x = 0.35;
    holoTag(chair, "patient", 0, 1.9, 0, { css: "#4fb8c9", w: 0.24 });

    // Anatomical markers on and around the patient's head and neck — the
    // exam sites for the extraoral and intraoral sequences.
    const site = (parent, x, y, z, id, label) => {
      const m = ball(parent, 0.045, x, y, z, OCS_ACCENT, { emissive: OCS_ACCENT, ei: 1.0, rough: 0.5, seg: 10 });
      holoTag(parent, label, x, y + 0.09, z, { css: "#4fb8c9", w: 0.36 });
      reg(hits, m, id);
      return m;
    };
    const head = patient.head;
    site(head, 0, 0.02, 0.11, "face-inspect", "face");
    site(head, 0.06, -0.1, 0.1, "lips-extraoral", "lips — outside");
    site(patient.torso, 0.16, 0.72, 0.04, "neck-nodes", "neck nodes — bimanual");
    site(head, 0.05, -0.11, 0.11, "lips-intraoral", "lips — inside");
    site(head, 0.09, -0.03, 0.08, "buccal-mucosa", "buccal mucosa");
    site(head, 0.02, -0.06, 0.11, "gingiva", "gingiva");
    site(head, -0.02, 0.03, 0.1, "palate", "palate");
    site(head, -0.06, -0.01, 0.09, "oropharynx", "oropharynx");
    const tongueSite = site(head, 0, -0.09, 0.1, "tongue-gauze", "tongue — gauze retraction");
    void tongueSite;
    site(head, -0.03, -0.12, 0.1, "floor-of-mouth", "floor of mouth — bimanual");

    // The differential board: four small lesions, one of them real.
    const board = holoPanel(g, 0.9, 0.6, 1.6, 1.5, -0.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb8c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#bfe6ec";
      ctx.font = `600 ${Math.round(h * 0.08)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DIFFERENTIAL — WHICH ONE IS A FINDING?", w * 0.05, h * 0.1);
    }, { ry: 0.4 });
    const boardSpots = [
      { id: "fordyce-granules", label: "pale spots — buccal mucosa", x: -0.28, col: 0xf2e0b0 },
      { id: "linea-alba", label: "white line — bite line", x: -0.08, col: 0xf4f0e8 },
      { id: "true-lesion", label: "indurated, irregular", x: 0.12, col: 0xb8402f },
      { id: "torus-palatinus", label: "bony ridge — palate", x: 0.32, col: 0xe8d8c0 },
    ];
    for (const s of boardSpots) {
      const spot = ball(board, 0.06, s.x, -0.08, 0.01, s.col, { rough: 0.5, seg: 12 });
      holoTag(board, s.label, s.x, -0.2, 0.01, { css: "#4fb8c9", w: 0.4 });
      reg(hits, spot, s.id);
    }

    // Documentation chart: six describe-finding fields.
    const chart = holoPanel(g, 0.7, 0.8, 1.75, 0.95, 0.65, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fb8c9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eafcff";
      ctx.font = `600 ${Math.round(h * 0.06)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FINDING — DESCRIBE IN FULL", w * 0.06, h * 0.08);
    }, { ry: -0.3 });
    const fields = ["site", "size", "colour", "texture", "induration", "duration"];
    fields.forEach((f, i) => {
      const fx = -0.24 + (i % 2) * 0.24;
      const fy = 0.14 - Math.floor(i / 2) * 0.16;
      const btn = box(chart, 0.18, 0.05, 0.01, fx, fy, 0.006, 0x1f5a63, { rough: 0.5 });
      decal(chart, 0.16, 0.035, fx, fy, 0.012, signFace(f.toUpperCase(), { bg: "#1f5a63", accent: "#bfeaf0", scale: 0.55 }), { px: 96 });
      reg(hits, btn, f);
    });

    // PPE stand.
    const ppe = group(g, -1.9, 0, -1.4, 0.5);
    box(ppe, 0.06, 1.5, 0.06, 0, 0.75, 0, CITY.steel, { rough: 0.5, metal: 0.5 });
    const gloveBox = box(ppe, 0.18, 0.13, 0.08, -0.15, 0.9, 0.05, 0x2f7d4a, { rough: 0.6 });
    void gloveBox;
    const maskBox = box(ppe, 0.16, 0.1, 0.06, 0.15, 1.05, 0.05, 0xdfe4e4, { rough: 0.55 });
    void maskBox;
    const glasses = torus(ppe, 0.05, 0.01, 0, 1.3, 0.07, 0x2b3138, { rough: 0.4, metal: 0.5, seg: 8, seg2: 16 });
    void glasses;
    holoTag(ppe, "PPE stand", 0, 1.55, 0, { css: "#4fb8c9", w: 0.3 });
    reg(hits, ppe, "ppe-stand");

    // Exam light.
    const lightPost = group(g, -0.5, 0, 0.85);
    cyl(lightPost, 0.03, 0.04, 1.6, 0, 0.8, 0, CITY.steel, { rough: 0.35, metal: 0.7, seg: 10 });
    const lightArm = group(lightPost, 0, 1.6, 0, 0.3);
    box(lightArm, 0.55, 0.03, 0.03, 0.27, 0, 0, CITY.steel, { rough: 0.35, metal: 0.7 });
    const lightHead = ball(lightArm, 0.13, 0.55, -0.1, 0, 0xf4f8ff, { emissive: 0xf4f8ff, ei: 1.4, rough: 0.4 });
    lightArm.userData.wheel = lightHead;
    holoTag(lightArm, "exam light", 0.55, 0.13, 0, { css: "#4fb8c9", w: 0.28 });
    reg(hits, lightArm, "exam-light");

    // Tool cart: camera, timeline chart, gauze, decoys.
    const cart = toolChest(g, 1.35, -0.9, { ry: -0.6, color: OCS_ACCENT });
    const camera = group(cart, -0.14, 0.79, 0.06, 0.3);
    box(camera, 0.07, 0.05, 0.18, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.4 });
    ball(camera, 0.02, 0, 0, 0.1, 0xdfe8ee, { rough: 0.2, metal: 0.5, seg: 12 });
    holoTag(camera, "intraoral camera", 0, 0.1, 0, { css: "#4fb8c9", w: 0.34 });
    reg(hits, camera, "intraoral-camera");

    const timeline = instrument(cart, 0.1, 0.79, 0.02, { ry: -0.3, idle: "-- days", color: OCS_ACCENT });
    holoTag(timeline, "chart timeline", 0, 0.16, 0, { css: "#4fb8c9", w: 0.32 });
    reg(hits, timeline, "chart-timeline");

    const freshGauze = group(cart, 0.2, 0.79, 0.2);
    for (let i = 0; i < 3; i++) slab(freshGauze, 0.05, 0.008, 0.05, 0, i * 0.009, 0, 0xf4f6f8, { radius: 0.004, rough: 0.95 });
    holoTag(freshGauze, "fresh gauze", 0, 0.08, 0, { css: "#4fb8c9", w: 0.28 });

    const usedGauze = group(g, 1.9, 0.79, -1.2);
    slab(usedGauze, 0.05, 0.008, 0.05, 0, 0, 0, 0xc9a488, { radius: 0.004, rough: 0.95 });
    slab(usedGauze, 0.05, 0.008, 0.05, 0.01, 0.008, 0.01, 0xa87858, { radius: 0.004, rough: 0.95 });
    holoTag(usedGauze, "gauze — from last patient", 0, 0.08, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, usedGauze, "used-gauze");

    const phone = group(g, 2.0, 0.79, -0.6, 0.3);
    box(phone, 0.035, 0.075, 0.006, 0, 0, 0, 0x1b1e22, { rough: 0.3, metal: 0.4 });
    box(phone, 0.03, 0.065, 0.001, 0, 0, 0.004, 0x2b7fd6, { emissive: 0x2b7fd6, ei: 0.5, rough: 0.2 });
    holoTag(phone, "personal phone", 0, 0.1, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, phone, "personal-phone");

    // Counter with the record terminal, referral pad, history form and mug.
    const counter = slab(g, 1.3, 0.06, 0.4, 1.6, 0.75, 1.0, 0xdfe4e4, { radius: 0.02, rough: 0.5 });
    void counter;
    for (const sx of [-1, 1]) box(g, 0.04, 0.75, 0.04, 1.6 + sx * 0.6, 0.375, 1.0, CITY.steel, { rough: 0.4, metal: 0.6 });

    const terminal = group(g, 1.85, 0.78, 0.9, -0.3);
    slab(terminal, 0.3, 0.2, 0.02, 0, 0.13, 0, 0x1b1e22, { radius: 0.02, rough: 0.4 });
    const screen = decal(terminal, 0.26, 0.16, 0, 0.13, 0.011, signFace("CHART", { bg: "#0d1c24", accent: "#4fb8c9", fg: "#bfeaf0", scale: 0.5 }), { glow: true, ei: 0.7, px: 160 });
    cyl(terminal, 0.02, 0.02, 0.13, 0, 0.05, 0, CITY.steel, { rough: 0.4, metal: 0.6, seg: 8 });
    holoTag(terminal, "chart terminal", 0, 0.3, 0, { css: "#4fb8c9", w: 0.32 });
    reg(hits, terminal, "chart-terminal");

    const historyForm = decal(g, 0.24, 0.3, 1.4, 0.783, 1.15, paperFace("HEALTH HISTORY UPDATE", ["Tobacco use?", "Alcohol use?", "HPV vaccination?", "Sun exposure — lips?"]));
    historyForm.rotation.x = -Math.PI / 2;
    reg(hits, historyForm, "health-history-form");

    const referralPad = decal(g, 0.2, 0.26, 1.85, 0.783, 1.15, paperFace("REFERRAL", ["Oral surgery / pathology", "Finding — see chart + photo"], { band: "#c0392b" }));
    referralPad.rotation.x = -Math.PI / 2;
    reg(hits, referralPad, "referral-pad");

    const stopCard = group(g, -1.4, 0.9, 0.4, 0.2);
    box(stopCard, 0.1, 0.06, 0.005, 0, 0, 0, 0xf2f2ec, { rough: 0.6 });
    decal(stopCard, 0.09, 0.05, 0, 0, 0.003, signFace("STOP", { bg: "#f2f2ec", accent: "#c0392b", scale: 0.6 }), { px: 96 });
    holoTag(stopCard, "stop-signal card", 0, 0.09, 0, { css: "#4fb8c9", w: 0.34 });
    reg(hits, stopCard, "stop-signal-card");

    const mug = group(g, 1.6, 0.79, 1.15);
    cyl(mug, 0.035, 0.032, 0.09, 0, 0.045, 0, 0xdfe4e8, { rough: 0.35, seg: 14 });
    torus(mug, 0.024, 0.006, 0.05, 0.045, 0, 0xdfe4e8, { rough: 0.35, seg: 6, seg2: 16 }).rotation.y = Math.PI / 2;
    holoTag(mug, "coffee — at the counter", 0, 0.12, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, mug, "coffee-mug");

    // Bare-hand-reach trap, near the patient's mouth.
    const reachTrap = box(g, 0.3, 0.3, 0.3, -0.35, 0.75, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachTrap, "bare-hand-reach");

    // Assistant, clear of the chair and the cart.
    const assistant = standingFigure(g, 2.3, 1.6, { ry: -2.3, cloth: 0x1f6f63, vest: OCS_ACCENT, skin: 0xb98a63 });
    holoTag(assistant, "dental assistant", 0, 1.75, 0, { css: "#4fb8c9", w: 0.36 });

    const key = new THREE.DirectionalLight(0xf4f9ff, 0.85);
    key.position.set(-2, 4.5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xe8f4fa, 0x53585e, 0.85));

    let tongueOut = false;

    return {
      hits,
      footprint: 2.0,
      spawnLook: new THREE.Vector3(-0.4, 1.1, 0.2),

      onStepComplete(step) {
        if (step.id === "tongue-exam") { tongueOut = true; patient.head.rotation.z = 0.08; }
        if (step.id === "photograph-finding") repaint(screen, signFace("PHOTO SAVED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf0", scale: 0.36 }));
        if (step.id === "duration-check") repaint(timeline.userData.screen, signFace("CONFIRMED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf0", scale: 0.4 }));
        if (step.id === "record") repaint(screen, signFace("RECORDED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf0", scale: 0.4 }));
      },

      onInterrupt(it) {
        if (it.id === "decline-tongue-pull") {
          patient.head.rotation.x = 0.1;
          stopCard.rotation.y += 0.5;
        }
        if (it.id === "always-been-there") {
          terminal.rotation.y += 0.3;
          screen.material.emissiveIntensity = 1.4;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "decline-tongue-pull") {
          patient.head.rotation.x = 0.35;
          stopCard.rotation.y -= 0.5;
        }
        if (it.id === "always-been-there") {
          terminal.rotation.y -= 0.3;
          screen.material.emissiveIntensity = 0.7;
        }
      },

      animate(t, dt, session) {
        void dt;
        if (tongueOut) patient.head.rotation.y = Math.sin(t * 0.6) * 0.02;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "duration-check") {
          repaint(timeline.userData.screen, signFace(`${Math.round(gg.t * 30)} days`, {
            bg: "#0d1c24", accent: gg.t > 0.58 && gg.t < 0.85 ? "#59c97b" : "#f0645b", fg: "#bfeaf0", scale: 0.5,
          }));
        }
      },
    };
  },
};
