import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, seatedFigure, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pediatric Visit VR — its own gamified system: First Smiles.
// A five-year-old's first real dental visit, run knee-to-knee with the
// parent. Nothing here is about a procedure going wrong the way a hazard
// site does — the whole skill is reading a child who cannot yet tell you in
// words whether the plan needs to change, and knowing where a hygienist's own
// scope stops and a referral starts.

const PV_ACCENT = 0xffa94d;

export const SIM_PEDIATRIC_VISIT = {
  id: "pediatric-visit",
  index: "129",
  domain: "Pediatric dentistry",
  trade: "Registered dental hygienist — pediatric practice",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "The AAPD's Guideline on Behavior Guidance for the Pediatric Dental Patient (tell-show-do and the Frankl behavior rating scale); the state dental hygiene board's scope of practice for a registered dental hygienist; the ADHA; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; HIPAA for the child's record",
  name: "Pediatric Visit",
  title: simTitle("Pediatric Visit"),
  tagline: "A five-year-old's first dental visit: knee-to-knee, tell-show-do, and a plan that bends to the child in front of you",
  accent: PV_ACCENT,
  accentCss: "#ffa94d",
  parSeconds: 260,
  footprint: 2.0,
  badge: { id: "first-smiles", name: "First Smiles", note: "A first visit run without forcing the plan past what the child could actually tolerate" },

  game: system({
    name: "First Smiles",
    currency: "STAR",
    ranks: ["Front Desk Helper", "Pediatric Hygienist", "Behaviour Lead", "Clinic Mentor", "AAPD Practice Certified"],
    badges: [
      { id: "least-restrictive", name: "Least Restrictive", note: "Never reached for the restraint or the adult dose", test: AWARD.safe },
      { id: "steady-hands", name: "Steady Hands", note: "Held the prophy speed and the retraction near band centre", test: AWARD.precise(0.7) },
      { id: "tsd-clean", name: "Tell-Show-Do Clean", note: "Ran tell, show, do with no correction", test: AWARD.stepClean("tell-show-do") },
    ],
    challenges: [
      { id: "on-time-visit", name: "On-Time Visit", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-redo", name: "No Redo", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "calm-streak", name: "Calm Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "restraint-strap": "That is a papoose board, and reaching for it is not the next move here. A physical restraint is a last resort with its own informed-consent conversation and its own documented reason — it is never the answer to a child who is simply anxious, and it is not a shortcut around tell-show-do.",
    "adult-fluoride-varnish": "That is the bulk adult-strength varnish applicator, not the child's unit-dose packet. Fluoride varnish is dosed to a child's weight, and reaching for the adult supply on a five-year-old is exactly the kind of dosing error the unit-dose packets exist to make impossible.",
    "sharp-explorer-reach": "That explorer is sitting where a wiggling five-year-old's hand can reach it. A sharp instrument left within a young child's reach is a hazard the moment your attention is on their mouth and not on the tray.",
    "reach-no-gloves": "You reached toward this child's mouth before gloving up. Standard precautions apply to a five-year-old exactly the way they apply to every other patient in the practice — gloves go on before any contact, not after the first instrument is already in your hand.",
  },

  lateNotes: {
    "fluoride-varnish": "The caries-risk conversation and drying the teeth come first — the varnish goes on last.",
    "recall-wheel": "The visit isn't finished — post-care and the parent's questions come before you set the recall.",
    "post-care-card": "Hold the cotton rolls in for the varnish's full set time before you move on to post-care.",
  },

  steps: [
    {
      id: "history-review", kind: "select", target: "medical-history-form",
      title: "Review the medical and dental history",
      cue: "Read the intake form with the parent before the child comes near the chair.",
      why: "A five-year-old cannot report their own allergies, past reactions or a sibling's bad experience at another office, so the whole history for this visit comes from the parent's form, read before a single instrument is introduced. It is also the first HIPAA-covered record of this visit, and it stays between you and the parent, not read out loud across a waiting room.",
    },
    {
      id: "knee-to-knee", kind: "drag", target: "child",
      title: "Position the child knee-to-knee with the parent",
      cue: "Bring the child across from the parent's lap into the knee-to-knee position facing you.",
      why: "Knee-to-knee puts the child's head in your lap and their body across the parent's, with your knees and the parent's touching — the parent stays in physical contact the whole visit, which is most of what makes a first exam tolerable for a child this age, and it gives you the light and the angle a full-size chair cannot at this size.",
      drag: { to: "parent-lap", radius: 0.5, missNote: "Not lined up with the parent yet — knees have to actually touch for this position to hold the child securely." },
    },
    {
      id: "light-aim", kind: "select", target: "exam-light",
      title: "Aim the light for the knee-to-knee height",
      cue: "Bring the exam light down to the working height of the knee-to-knee position.",
      why: "The light is set for an adult in a reclined chair by default, and a child's mouth at knee-to-knee height is a foot lower and a different angle entirely — aimed wrong, you are working half-blind into your own shadow for the whole exam.",
    },
    {
      id: "tell-show-do", kind: "sequence",
      targets: ["tsd-tell", "tsd-show", "tsd-do"],
      itemNames: { "tsd-tell": "tell — explain in the child's words", "tsd-show": "show — demonstrate on the puppet", "tsd-do": "do — the real action" },
      title: "Introduce the mirror with tell-show-do",
      cue: "Tell what it does, show it on the puppet, then do the real thing — in that order, every time.",
      why: "Tell-show-do is the AAPD's own basic behaviour-guidance technique, and the order is the entire mechanism: telling in words a five-year-old understands takes the mystery out of a strange tool, showing it on something that is not their own body lets them watch it not hurt anyone, and only then does the same action happen to them — never introduced for the first time as a surprise in their own mouth.",
      outOfOrderNote: "Tell, then show, then do — doing it before the child has seen it done to the puppet is the surprise tell-show-do exists to remove.",
    },
    {
      id: "read-cooperation", kind: "find", noHint: true,
      targets: ["clenched-fists", "turned-away", "gripping-parent"],
      itemNames: { "clenched-fists": "clenched fists", "turned-away": "head turned away", "gripping-parent": "gripping the parent's sleeve" },
      itemNotes: {
        "clenched-fists": "Small fists held tight are a child bracing, not relaxing — a negative Frankl-scale sign that the pace needs to slow down before the mirror goes back in.",
        "turned-away": "The head has turned away from you and toward the parent. That is the child asking to disengage, well before it becomes an actual refusal.",
        "gripping-parent": "A tight grip on the parent's arm is the child anchoring against something. It is worth noticing before you ask for anything more of them.",
      },
      title: "Read the child's cooperation cues",
      cue: "Three things about this child's body language say the plan needs to slow down. Find them.",
      why: "The Frankl behaviour rating scale exists because a child's cooperation is not a single yes-or-no at the start of the visit — it moves, sometimes step to step, and a hygienist who is only watching the mouth misses every one of the cues that says the current pace is no longer working.",
    },
    {
      id: "toothbrush-prophy", kind: "gauge", target: "prophy-handpiece",
      title: "Set the slow-speed polishing cup",
      cue: "Bring the prophy cup up to speed and commit inside the comfortable band.",
      why: "A five-year-old's enamel is thinner than an adult's and a five-year-old's nerves are a lot closer to a spinning cup than an adult's are — too slow and the polish does nothing, too fast and the vibration and the noise alone can undo everything tell-show-do just built.",
      gauge: { label: "PROPHY CUP — SPEED", speed: 0.7, green: [0.28, 0.46], readout: (t) => `${Math.round(t * 3000)} rpm`, missNote: "Off the comfortable band for a child this size — a scared five-year-old is a harder recovery than a slow polish." },
    },
    {
      id: "intraoral-exam", kind: "track", target: "mirror", seconds: 6,
      title: "Hold gentle retraction while you count the teeth",
      cue: "Keep the mirror's retraction light and steady while you look, tooth by tooth.",
      why: "Retraction only has to be firm enough to hold the cheek clear of the view, and on a child that band is narrower than on an adult — too light and the cheek falls back across the teeth you are trying to see, too firm and the discomfort alone can end the exam faster than anything you actually find in the mouth.",
      track: {
        start: 0.14, green: [0.32, 0.52], rise: 0.5, fall: 0.42, drift: 0.12, label: "RETRACTION",
        readout: (v) => (v < 0.32 ? "too light — cheek falling back" : v > 0.52 ? "too firm — discomfort" : "clear view"),
      },
      holdBreakNote: "Out of the comfortable band. Ease back to a steady, gentle retraction and hold it there.",
    },
    {
      id: "risk-and-diet", kind: "sequence",
      targets: ["risk-chart", "diet-handout"],
      itemNames: { "risk-chart": "caries-risk chart", "diet-handout": "diet handout" },
      title: "Complete the caries-risk conversation",
      cue: "Score the caries-risk chart with the parent, then go through the diet handout together.",
      why: "The risk score is what the diet conversation is actually built on — a sippy cup of juice at nap time reads differently on a child already scored high risk than on one scored low, and running the diet talk before the risk factors are on the chart turns specific coaching into generic advice nobody remembers by the car park.",
      outOfOrderNote: "Score the risk chart first — the diet conversation that follows is built on what that chart just showed, not the other way round.",
    },
    {
      id: "varnish-apply", kind: "select", target: "fluoride-varnish",
      title: "Apply the fluoride varnish",
      cue: "Paint the child's unit-dose varnish onto the dried teeth.",
      why: "Varnish sets on contact with saliva, which is exactly why the teeth are dried first and why the dose comes pre-measured for this child's size in its own single-use packet — there is no field mixing and no adult-sized applicator anywhere near this part of the visit.",
    },
    {
      id: "varnish-set", kind: "hold", target: "cotton-rolls", seconds: 5,
      title: "Hold the cotton rolls while the varnish sets",
      cue: "Keep the cotton rolls in place so the varnish sets without saliva contact.",
      why: "The varnish needs a few minutes of true isolation to bond to the enamel, and the cotton rolls are the only thing holding saliva off it during that window — pull them early and the varnish that just went on can wash straight back off before it has set at all.",
      holdBreakNote: "Cotton rolls came out before the varnish set. Saliva contact this early can strip the dose you just applied — hold them in for the full time.",
    },
    {
      id: "post-care", kind: "select", target: "post-care-card",
      title: "Give the post-varnish care instructions",
      cue: "Walk the parent through soft foods and no brushing until the next morning.",
      why: "The varnish keeps working for hours after this visit ends, and that depends entirely on what happens once the family is back in the car — soft foods, no brushing until morning, and a parent who actually knows why, not a card handed over unread on the way out.",
    },
    {
      id: "parent-questions", kind: "select", target: "faq-card",
      title: "Answer the parent's questions",
      cue: "Take the parent's questions about thumb-sucking and the first loose tooth.",
      why: "Thumb-sucking before the permanent teeth start coming in, and a first loose primary tooth around this age, are both ordinary developmental milestones far more often than they are a problem — and a parent who leaves worrying about a normal thing is a parent who calls the office again before the next recall is due.",
    },
    {
      id: "recall-schedule", kind: "turn", target: "recall-wheel",
      title: "Set the recall interval",
      cue: "Turn the recall wheel to the next visit date.",
      why: "A first visit that goes well is worth nothing to this child's teeth if the next one does not happen — the recall interval is set here, in front of the parent, while the whole visit is still fresh enough that six months from now is a date they will actually keep.",
      turn: { turns: 0.3, axis: "z", label: "RECALL" },
    },
  ],

  interrupts: [
    {
      id: "bite-mirror",
      kind: "Child bites down",
      after: "intraoral-exam", delay: 3, seconds: 12,
      alert: "The child has suddenly clamped down on the mirror and will not open back up.",
      cue: "Your fingers are still near the mirror. Do not pull it against a closed bite.",
      target: "mouth-prop",
      why: "A sudden bite reflex in a young child is common and it is not defiance — pulling a mirror out against a clamped jaw is how a hygienist's finger gets caught or a handle gets bent, and the soft bite prop is exactly what lets the child release on their own terms without anything being forced.",
      missNote: "The mirror stayed under load against a closed bite for the rest of that exam. Sooner or later a bite that hard against metal chips a primary tooth or catches a finger, and neither is a way to end a child's first visit.",
      wrongNote: "Offer the soft bite prop and let the jaw release on its own — nothing gets pulled against a bite this firm.",
    },
    {
      id: "off-scope-request",
      kind: "Parent request",
      after: "varnish-set", delay: 3, seconds: 12,
      alert: "The parent, while you're still holding the cotton rolls, asks you to also smooth down a chipped front tooth today while the child is already sitting still.",
      cue: "Your hands are full with the cotton rolls. The parent is waiting on an answer.",
      target: "referral-pad",
      why: "Smoothing or restoring a chipped tooth is a restorative procedure outside a dental hygienist's scope of practice, however reasonable it sounds with a cooperative child already in the chair — the honest answer protects the child from a treatment done outside the scope that is actually licensed to provide it, not from a wasted trip back for the dentist to finish the same exam.",
      missNote: "The chipped tooth went untreated and unreferred, and the parent left thinking today's visit had covered it. The plan does not change because the child happens to be sitting still — it changes only with what the hygienist's scope actually allows.",
      wrongNote: "The referral pad is the honest answer here — a scope question does not get solved with the cotton rolls, and it does not get solved by improvising restorative care.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 1.95, PV_ACCENT);

    // ------------------------------------------------------- knee-to-knee seating
    const parentChair = group(g, -0.55, 0, 0.5, 0.75);
    slab(parentChair, 0.58, 0.14, 0.55, 0, 0.46, 0, 0xb87a4a, { radius: 0.05, rough: 0.7 });
    const parentBack = slab(parentChair, 0.56, 0.68, 0.13, 0, 0.86, -0.24, 0xb87a4a, { radius: 0.05, rough: 0.7 });
    parentBack.rotation.x = -0.1;
    for (const sx of [-1, 1]) {
      cyl(parentChair, 0.03, 0.03, 0.44, sx * 0.24, 0.23, -0.18, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
      cyl(parentChair, 0.03, 0.03, 0.44, sx * 0.24, 0.23, 0.18, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 10 });
    }
    const parent = seatedFigure(parentChair, 0, 0.46, 0.02, { skin: 0xc79a72, cloth: 0x3f6f56, ry: -0.3 });
    holoTag(parentChair, "parent", 0, 1.7, 0, { css: "#ffa94d", w: 0.24 });

    const stool = group(g, 0.55, 0, 0.5, -0.75);
    cyl(stool, 0.22, 0.22, 0.05, 0, 0.44, 0, 0x3f434a, { rough: 0.6, seg: 18 });
    cyl(stool, 0.03, 0.03, 0.44, 0, 0.22, 0, CITY.darkSteel, { rough: 0.35, metal: 0.7, seg: 10 });
    cyl(stool, 0.16, 0.16, 0.02, 0, 0.0, 0, 0x2b3138, { rough: 0.6, seg: 14 });
    const hygienist = seatedFigure(stool, 0, 0.44, 0.0, { skin: 0xd9ab86, cloth: 0x1f6f63, ry: 2.9 });
    holoTag(stool, "hygienist", 0, 1.68, 0, { css: "#ffa94d", w: 0.28 });

    // The child, positioned knee-to-knee once the drag step lands them there.
    // Built lying, so check_layout's crew rule (which only holds a standing
    // figure to a clearance test) does not apply to a five-year-old on a lap.
    const child = standingFigure(g, -0.55, 0.0, { lying: true, ry: -0.05, skin: 0xe0b183, cloth: 0xf2e0a0, vest: null });
    child.scale.setScalar(0.8);
    child.position.set(-0.55, 0.68, -0.15);
    // The "lying" transform lays the body out along local Z; a knee-to-knee
    // child bridges the parent and the hygienist along X, so turn it 90°.
    child.rotation.set(0, -Math.PI / 2, 0.06);
    holoTag(child, "child", 0, 0.3, 0, { css: "#ffa94d", w: 0.22 });
    reg(hits, child, "child");
    const parentLapSpot = torus(g, 0.16, 0.01, 0.05, 0.63, 0.28, PV_ACCENT,
      { emissive: PV_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    parentLapSpot.rotation.x = Math.PI / 2;
    reg(hits, parentLapSpot, "parent-lap");

    // Three body-language cues on the child, worth noticing before the plan
    // pushes ahead — small holographic call-outs rather than physical props.
    const fistMark = ball(child, 0.05, 0.32, 0.14, 0.05, PV_ACCENT, { emissive: PV_ACCENT, ei: 1.1, rough: 0.5, seg: 10 });
    holoTag(child, "clenched fists", 0.32, 0.24, 0.05, { css: "#ffa94d", w: 0.32 });
    reg(hits, fistMark, "clenched-fists");
    const headMark = ball(child, 0.05, -0.05, 0.32, -0.12, PV_ACCENT, { emissive: PV_ACCENT, ei: 1.1, rough: 0.5, seg: 10 });
    holoTag(child, "head turned away", -0.05, 0.42, -0.12, { css: "#ffa94d", w: 0.34 });
    reg(hits, headMark, "turned-away");
    const gripMark = ball(child, 0.05, -0.28, 0.1, 0.1, PV_ACCENT, { emissive: PV_ACCENT, ei: 1.1, rough: 0.5, seg: 10 });
    holoTag(child, "gripping parent's sleeve", -0.28, 0.2, 0.1, { css: "#ffa94d", w: 0.4 });
    reg(hits, gripMark, "gripping-parent");

    // Exam light on its own low arm, aimed for the knee-to-knee height.
    const lightPost = group(g, -0.05, 0, -0.35);
    cyl(lightPost, 0.03, 0.04, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.35, metal: 0.7, seg: 10 });
    const lightArm = group(lightPost, 0, 1.1, 0, -0.3);
    box(lightArm, 0.4, 0.03, 0.03, 0.2, 0, 0, CITY.steel, { rough: 0.35, metal: 0.7 });
    const lightHead = ball(lightArm, 0.1, 0.4, -0.08, 0, 0xf4f8ff, { emissive: 0xf4f8ff, ei: 1.3, rough: 0.4 });
    void lightHead;
    holoTag(lightArm, "exam light", 0.4, 0.12, 0, { css: "#ffa94d", w: 0.28 });
    reg(hits, lightArm, "exam-light");

    // ------------------------------------------------------------------- tray
    const cart = toolChest(g, 1.35, -0.15, { ry: -0.5, color: PV_ACCENT });
    const mirrorGroup = group(cart, -0.1, 0.79, 0.08, 0.3);
    cyl(mirrorGroup, 0.01, 0.01, 0.13, 0, 0, 0, CITY.steel, { rough: 0.25, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    const mirrorHead = cyl(mirrorGroup, 0.022, 0.022, 0.006, 0.075, 0, 0, 0xdfe8ee, { rough: 0.1, metal: 0.9, seg: 16 });
    mirrorHead.rotation.z = Math.PI / 2;
    holoTag(mirrorGroup, "mirror", 0, 0.12, 0, { css: "#ffa94d", w: 0.24 });
    reg(hits, mirrorGroup, "mirror");

    // The same mirror, touched to the child for the "do" of tell-show-do —
    // its own registered prop, set down on the tray next to the one used
    // later for the actual retraction, so each step keeps its own hit id.
    const tsdDoMirror = group(cart, -0.02, 0.79, 0.08, 0.3);
    cyl(tsdDoMirror, 0.008, 0.008, 0.1, 0, 0, 0, CITY.steel, { rough: 0.25, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    const tsdDoMirrorHead = cyl(tsdDoMirror, 0.018, 0.018, 0.005, 0.06, 0, 0, 0xdfe8ee, { rough: 0.1, metal: 0.9, seg: 16 });
    tsdDoMirrorHead.rotation.z = Math.PI / 2;
    holoTag(tsdDoMirror, "the do", 0, 0.09, 0, { css: "#ffa94d", w: 0.2 });
    reg(hits, tsdDoMirror, "tsd-do");

    const pickBook = group(cart, 0.12, 0.79, 0.1, -0.2);
    box(pickBook, 0.1, 0.14, 0.015, 0, 0.07, 0, 0xe4622a, { rough: 0.7 });
    decal(pickBook, 0.08, 0.1, 0, 0.07, 0.009, signFace("ANA VISITS", { bg: "#e4622a", accent: "#fff3df", scale: 0.4 }), { px: 96 });
    holoTag(pickBook, "picture book", 0, 0.18, 0, { css: "#ffa94d", w: 0.3 });
    reg(hits, pickBook, "tsd-tell");

    const puppet = group(cart, 0.28, 0.79, -0.02, 0.4);
    ball(puppet, 0.07, 0, 0.07, 0, 0xf2d9a0, { rough: 0.7, seg: 16 });
    ball(puppet, 0.03, 0, 0.02, 0.055, 0xffffff, { rough: 0.5, seg: 12 });
    holoTag(puppet, "demo puppet", 0, 0.16, 0, { css: "#ffa94d", w: 0.3 });
    reg(hits, puppet, "tsd-show");

    const softBite = group(cart, 0.02, 0.79, -0.14);
    torus(softBite, 0.03, 0.014, 0, 0, 0, 0xf5c56a, { rough: 0.8, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(softBite, "soft bite prop", 0, 0.1, 0, { css: "#ffa94d", w: 0.32 });
    reg(hits, softBite, "mouth-prop");

    const prophy = instrument(cart, -0.24, 0.79, -0.1, { ry: 0.5, idle: "-- rpm", color: PV_ACCENT });
    holoTag(prophy, "prophy handpiece", 0, 0.16, 0, { css: "#ffa94d", w: 0.34 });
    reg(hits, prophy, "prophy-handpiece");

    const cottonRolls = group(cart, 0.2, 0.79, 0.2);
    for (let i = 0; i < 2; i++) cyl(cottonRolls, 0.012, 0.012, 0.09, i * 0.03 - 0.015, 0, 0, 0xffffff, { rough: 0.95, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(cottonRolls, "cotton rolls", 0, 0.1, 0, { css: "#ffa94d", w: 0.28 });
    reg(hits, cottonRolls, "cotton-rolls");

    const varnish = group(cart, -0.12, 0.79, 0.24, -0.3);
    box(varnish, 0.03, 0.09, 0.02, 0, 0.045, 0, 0xf2c14b, { rough: 0.6 });
    decal(varnish, 0.024, 0.05, 0, 0.06, 0.011, signFace("5% NaF", { bg: "#f2c14b", accent: "#5a3d0d", scale: 0.4 }), { px: 64 });
    holoTag(varnish, "unit-dose varnish", 0, 0.13, 0, { css: "#ffa94d", w: 0.36 });
    reg(hits, varnish, "fluoride-varnish");

    // The decoys: adult bulk varnish, and a sharp explorer left in reach.
    const adultVarnish = group(g, 1.9, 0.9, -0.6, 0.4);
    cyl(adultVarnish, 0.03, 0.035, 0.14, 0, 0.07, 0, 0xd6a83c, { rough: 0.5, seg: 12 });
    decal(adultVarnish, 0.05, 0.03, 0, 0.12, 0.031, signFace("BULK — ADULT", { bg: "#d6a83c", accent: "#3a2c08", scale: 0.4 }), { px: 96 });
    holoTag(adultVarnish, "adult bulk varnish", 0, 0.19, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, adultVarnish, "adult-fluoride-varnish");

    const explorer = group(cart, 0.15, 0.79, 0.34, 0.2);
    cyl(explorer, 0.006, 0.006, 0.14, 0, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(explorer, "explorer — within reach", 0, 0.06, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, explorer, "sharp-explorer-reach");

    // A restraint board hanging on the wall — last resort, not a shortcut.
    const restraint = group(g, -1.85, 0, -0.9, 0.5);
    slab(restraint, 0.4, 0.7, 0.04, 0, 0.6, 0, 0xdfe0d8, { radius: 0.03, rough: 0.7 });
    for (let i = 0; i < 3; i++) box(restraint, 0.34, 0.05, 0.015, 0, 0.35 + i * 0.22, 0.03, 0xf2c14b, { rough: 0.6 });
    holoTag(restraint, "papoose board", 0, 1.0, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, restraint, "restraint-strap");

    // Glove box on the counter, and the bare-hand trap right at the child.
    const counterTop = slab(g, 1.1, 0.06, 0.4, 1.6, 0.75, -1.1, 0xdfe4e4, { radius: 0.02, rough: 0.5 });
    void counterTop;
    for (const sx of [-1, 1]) box(g, 0.04, 0.75, 0.04, 1.6 + sx * 0.53, 0.375, -1.1, CITY.steel, { rough: 0.4, metal: 0.6 });
    const gloveBox = group(g, 1.4, 0.78, -1.05);
    box(gloveBox, 0.12, 0.08, 0.09, 0, 0, 0, 0x2f7d4a, { rough: 0.6 });
    decal(gloveBox, 0.1, 0.03, 0, 0.041, 0, signFace("GLOVES", { bg: "#2f7d4a", accent: "#e8f5e8", scale: 0.55 }), { px: 96 });
    holoTag(gloveBox, "glove box", 0, 0.12, 0, { css: "#ffa94d", w: 0.28 });
    const reachTrap = box(g, 0.3, 0.3, 0.3, -0.55, 0.75, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachTrap, "reach-no-gloves");

    // Documentation and handouts, laid out on the counter.
    const historyForm = decal(g, 0.26, 0.32, 1.35, 0.783, -1.15, paperFace("HEALTH HISTORY", ["Patient: age 5", "Parent-completed intake", "No known allergies noted"]));
    historyForm.rotation.x = -Math.PI / 2;
    reg(hits, historyForm, "medical-history-form");

    const riskChart = decal(g, 0.24, 0.3, 1.85, 0.783, -1.15, paperFace("CARIES RISK", ["Fluoride exposure: low", "Snacking: frequent", "Plaque: moderate"], { band: "#f2ae14" }));
    riskChart.rotation.x = -Math.PI / 2;
    reg(hits, riskChart, "risk-chart");

    const dietHandout = decal(g, 0.22, 0.28, 2.05, 0.783, -0.95, paperFace("DIET", ["Water between meals", "Sippy cup: water only", "No bedtime bottle"]));
    dietHandout.rotation.x = -Math.PI / 2;
    reg(hits, dietHandout, "diet-handout");

    const postCareCard = decal(g, 0.22, 0.28, 1.35, 0.783, -0.9, paperFace("AFTER VARNISH", ["Soft foods today", "No brushing until tomorrow AM", "Avoid hot drinks"], { band: "#2f8f6a" }));
    postCareCard.rotation.x = -Math.PI / 2;
    reg(hits, postCareCard, "post-care-card");

    const faqCard = decal(g, 0.22, 0.28, 1.85, 0.783, -1.3, paperFace("PARENT FAQ", ["Thumb-sucking before age 6: usually fine", "First loose tooth ~age 5-6: normal"]));
    faqCard.rotation.x = -Math.PI / 2;
    reg(hits, faqCard, "faq-card");

    const referralPad = decal(g, 0.2, 0.26, 1.6, 0.783, -1.3, paperFace("REFERRAL", ["Restorative — see dentist", "Outside RDH scope of practice"], { band: "#c0392b" }));
    referralPad.rotation.x = -Math.PI / 2;
    reg(hits, referralPad, "referral-pad");

    // Recall wheel, mounted on the wall by the door.
    const recallGroup = group(g, -1.9, 1.1, 0.9, 0.5);
    box(recallGroup, 0.3, 0.3, 0.04, 0, 0, 0, 0xdfe0d8, { rough: 0.5 });
    const recallWheel = torus(recallGroup, 0.1, 0.02, 0, 0, 0.025, PV_ACCENT, { emissive: PV_ACCENT, ei: 0.8, rough: 0.5, seg: 8, seg2: 20 });
    const recallHand = box(recallGroup, 0.09, 0.012, 0.012, 0, 0, 0.03, 0x2b3138, { rough: 0.5 });
    recallGroup.userData.wheel = recallHand;
    decal(recallGroup, 0.24, 0.06, 0, -0.16, 0.021, signFace("RECALL — 6 MO", { bg: "#dfe0d8", accent: "#7a4a1a", scale: 0.4 }), { px: 128 });
    holoTag(recallGroup, "recall wheel", 0, 0.2, 0, { css: "#ffa94d", w: 0.3 });
    reg(hits, recallGroup, "recall-wheel");
    void recallWheel;

    // A dental assistant restocking the counter, standing clear of the chairs
    // and the tray — the crew figure check_layout holds to its clearance rule.
    const assistant = standingFigure(g, 2.25, -0.05, { ry: -2.0, cloth: 0x1f6f63, vest: PV_ACCENT, skin: 0xb98a63 });
    holoTag(assistant, "dental assistant", 0, 1.75, 0, { css: "#ffa94d", w: 0.36 });

    const key = new THREE.DirectionalLight(0xfff2df, 0.8);
    key.position.set(-2, 4.5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfff4e6, 0x6d5a44, 0.85));

    let childClamped = false;
    const mirrorHome = { pos: mirrorGroup.position.clone(), rotZ: mirrorGroup.rotation.z };

    return {
      hits,
      footprint: 2.0,
      spawnLook: new THREE.Vector3(0, 1.0, 0.1),

      onStepComplete(step) {
        if (step.id === "knee-to-knee") {
          child.position.set(0.0, 0.7, 0.15);
          child.rotation.set(0, -Math.PI / 2 - 0.1, 0);
        }
        if (step.id === "varnish-set") postCareCard.visible = true;
      },

      onInterrupt(it) {
        if (it.id === "bite-mirror") {
          childClamped = true;
          mirrorGroup.rotation.z = mirrorHome.rotZ + 0.4;
          child.userData.head.rotation.x = -0.15;
        }
        if (it.id === "off-scope-request") {
          referralPad.material.emissiveIntensity = 1.4;
          parent.torso.rotation.y = 0.25;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bite-mirror") {
          childClamped = false;
          mirrorGroup.rotation.z = mirrorHome.rotZ;
          child.userData.head.rotation.x = 0;
        }
        if (it.id === "off-scope-request") {
          referralPad.material.emissiveIntensity = 0.6;
          parent.torso.rotation.y = 0;
        }
      },

      animate(t, dt, session) {
        void dt;
        child.userData.head.rotation.y = Math.sin(t * 0.9) * 0.08;
        if (!childClamped) mirrorGroup.position.y = mirrorHome.pos.y + Math.sin(t * 1.4) * 0.003;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "toothbrush-prophy") {
          repaint(prophy.userData.screen, signFace(`${Math.round(gg.t * 3000)} rpm`, {
            bg: "#2a1a08", accent: gg.t > 0.28 && gg.t < 0.46 ? "#59c97b" : "#f0645b", fg: "#ffe3c2", scale: 0.5,
          }));
        }
      },
    };
  },
};
