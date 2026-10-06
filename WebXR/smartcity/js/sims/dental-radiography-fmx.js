import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  seatedFigure, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, standingFigure,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dental Radiography — Full-Mouth Series VR — Dental & Oral Health.
//
// The radiographer's side of dental assisting, run as its own career step: a
// complete full-mouth series taken with a paralleling instrument and a digital
// sensor. The holder is assembled the way its own kit intends, the sensor is
// sheathed before it goes anywhere near a mouth, the receptor is seated in the
// slot on its long axis, exposure factors are set for the patient in the chair
// rather than left on the last one's, the tubehead is brought square to the
// aiming ring, the region order is worked through so nothing is exposed twice,
// and a retake is a decision made against a rule instead of a reflex.
//
// The credential named is DANB's Radiation Health and Safety component and the
// separate state radiography permit that sits on top of it. Nothing here
// states a clause number: where a rule belongs to a body, the body is named.

const RFX_ACCENT = 0xe8a13c;
const RFX_LEAD = 0x5e6a74;
const RFX_PANEL = 0x1d2a33;

export const SIM_DENTAL_RADIOGRAPHY_FMX = {
  id: "dental-radiography-fmx",
  index: "214",
  domain: "Dental",
  trade: "Dental assistant — radiographer (DANB RHS)",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Radiation Health and Safety (RHS) component and the separate state dental radiography permit the practice act requires above it; the ADA and FDA's patient-selection recommendations for dental radiographic examinations; the ALARA principle and the state radiation control programme's own operator rules; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for receptor barriers and holder reprocessing; OSHA 29 CFR 1910.1030; the American Dental Assistants Association (ADAA) as the profession's body; SEIU and UFCW clinic staff agreements",
  name: "Full-Mouth Radiographic Series",
  title: simTitle("Full-Mouth Radiographic Series"),
  tagline: "A complete series on a paralleling instrument: holder assembled, sensor sheathed and seated, factors set for this patient, tubehead square to the ring, region order worked, retakes decided by rule",
  accent: RFX_ACCENT,
  accentCss: "#e8a13c",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "series-complete", name: "Series Complete", note: "A full-mouth series taken with the patient shielded, the factors set for them, and every retake justified in the exposure record" },

  game: system({
    name: "Receptor Discipline",
    currency: "VIEW",
    ranks: ["Radiography Student", "Permitted Operator", "Series Radiographer", "Imaging Lead", "Receptor Discipline Certified"],
    badges: [
      { id: "sheathed-first", name: "Sheathed First", note: "The sensor barrier went on before the sensor went anywhere", test: AWARD.stepClean("sheath-sensor") },
      { id: "never-a-hand-inside", name: "Never A Hand Inside", note: "No unsafe action anywhere in the series", test: AWARD.safe },
      { id: "factors-for-this-patient", name: "Factors For This Patient", note: "Exposure factors committed inside the band for the patient in the chair", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-series-fmx", name: "Clean Series", note: "No corrections anywhere in the series", test: AWARD.clean },
      { id: "held-the-bite", name: "Held The Bite", note: "Both timed passages carried without a break", test: AWARD.unbroken },
      { id: "series-inside-par", name: "Series Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fmx-held-by-hand": "A hand is holding the receptor inside the patient's mouth. Nobody's fingers belong in the primary beam, ever — that is what the holder and its bite block are for, and an operator who steadies a sensor by hand takes a direct-beam dose to the fingers on every exposure of every series they ever take.",
    "fmx-bare-sensor": "That sensor is going in with no barrier on it at all. A digital sensor cannot be heat sterilised — it is an electronic device on a cable — so the single-use sheath plus surface disinfection between patients is the entire barrier, and a bare sensor carries one patient's saliva into the next patient's mouth.",
    "fmx-adult-setting-on-child": "The unit is still on the previous patient's adult factors with a child in the chair. Exposure factors are set to the patient's size and the region being imaged; a child exposed on adult settings receives dose that bought nothing, and ALARA is not a slogan about the machine, it is a decision made at this dial for every single patient.",
    "fmx-blanket-retake": "That command retakes the whole series because one view was unusable. A retake is another exposure, justified one image at a time: the view that is non-diagnostic is repeated and nothing else, because reshooting eighteen images to fix one is seventeen exposures nobody could defend in the record.",
  },

  lateNotes: {
    "fmx-control-panel": "Not yet. Nothing is aligned, the patient is not holding anything and the room is not clear — the exposure control is the last thing touched, never the first.",
    "fmx-retake-card": "There is nothing to judge yet. The retake rule is applied to images that exist, after the series has been reviewed, not decided in advance.",
    "fmx-exposure-log": "The series is not finished. The record carries what was actually exposed, including any retake and why, so it is written at the end.",
  },

  steps: [
    {
      id: "shield-patient", kind: "sequence", anyOrder: true,
      targets: ["fmx-lead-apron", "fmx-thyroid-collar"],
      itemNames: { "fmx-lead-apron": "lead apron", "fmx-thyroid-collar": "thyroid collar" },
      itemNotes: {
        "fmx-lead-apron": "Laid flat over the chest and lap, not bunched — a folded apron leaves a gap exactly where scatter arrives.",
        "fmx-thyroid-collar": "Closed at the front of the neck. The thyroid is the most radiosensitive tissue in the field for a dental exposure, and the collar is the one piece of shielding that covers it.",
      },
      title: "Shield the patient before anything else is touched",
      cue: "Apron flat over the chest and lap, thyroid collar closed at the neck.",
      why: "Shielding goes on first because it is the only step that stops being possible once you are busy. A lead apron and a thyroid collar absorb the scatter that a dental beam throws inside the patient's own tissue, and the thyroid in particular is the most radiosensitive structure anywhere near a dental field — which is why a collar is standard on a series of this length rather than optional comfort.",
    },
    {
      id: "sheath-sensor", kind: "select", target: "fmx-sensor-sheath",
      title: "Sheathe the digital sensor",
      cue: "Slide the sensor into a fresh single-use barrier and seal it before it leaves the tray.",
      why: "A digital sensor is an electronic device on a cable: it cannot go in an autoclave, and no amount of wiping makes a textured plastic housing that has been in a mouth safe for the next one. The single-use sheath, followed by surface disinfection of the sensor itself, is the whole barrier the CDC's dental guidelines rely on — and it only works if the sheath goes on before the sensor is carried anywhere.",
    },
    {
      id: "assemble-holder", kind: "sequence",
      targets: ["fmx-holder-bite", "fmx-holder-arm", "fmx-holder-ring"],
      itemNames: { "fmx-holder-bite": "bite block", "fmx-holder-arm": "indicator arm", "fmx-holder-ring": "aiming ring" },
      outOfOrderNote: "Out of order. The bite block takes the receptor, the indicator arm clips into the block, and the aiming ring slides onto the arm last — reset and build it in that order or the ring will not sit at the distance the arm sets.",
      title: "Assemble the paralleling instrument",
      cue: "Bite block, then indicator arm, then the aiming ring onto the arm.",
      why: "A paralleling instrument is a jig, and it only works assembled in its own order: the block holds the receptor parallel to the long axis of the teeth, the arm fixes the beam's relationship to it, and the ring tells the tubehead exactly where to sit. Built out of order the ring ends up at the wrong distance along the arm, and every image from it is either cone-cut or foreshortened.",
    },
    {
      id: "seat-receptor", kind: "drag", target: "fmx-sensor",
      title: "Seat the sensor in the bite block",
      cue: "Carry the sheathed sensor to the block and seat it in the slot, long axis in the slot's direction.",
      why: "The slot in the bite block is cut to hold the receptor flat and parallel to the teeth being imaged, and it only does that if the sensor is seated all the way in on the correct axis. A sensor pushed in crooked or half-seated tips the receptor plane away from the teeth, and the result is an image with the roots cut off the bottom — a retake and another exposure for a mistake made on the bench.",
      drag: { to: "fmx-holder-slot", radius: 0.4, missNote: "Not seated. Push the sensor fully into the block's slot on its long axis — a receptor balanced on the lip of the slot will move the moment the patient bites." },
    },
    {
      id: "exposure-factors", kind: "gauge", target: "fmx-exposure-dial",
      title: "Set the exposure factors for the patient in the chair",
      cue: "Dial the factors to this patient's size and this region, and commit inside the band.",
      gauge: {
        label: "PATIENT SIZE / REGION", speed: 0.6, green: [0.36, 0.56],
        readout: (t) => (t < 0.36 ? "under — image will be thin and unreadable" : t > 0.56 ? "over — dose with nothing gained" : "set for this patient"),
        missNote: "Off the setting for this patient and this region. Under-exposed gives a flat image that forces a retake, and over-exposed gives the patient dose that bought nothing at all — both are ALARA failures made at the same dial.",
      },
      why: "Every unit has factors selected by patient size and by region, because a child's molar and a large adult's molar are different thicknesses of tissue. Leaving the last patient's setting on is the single most common way a dental patient receives dose nobody intended: it is invisible on the image if it is only slightly high, and the record will show an exposure that was never chosen for the person who received it.",
    },
    {
      id: "align-tubehead", kind: "turn", target: "fmx-aiming-ring",
      title: "Bring the tubehead square to the aiming ring",
      cue: "Swing the tubehead round until the cone is flush and centred on the ring.",
      turn: { turns: 0.6, axis: "y", label: "TUBEHEAD TO RING" },
      why: "The aiming ring exists so alignment is a mechanical fact rather than an estimate: cone flush against the ring means the beam is perpendicular to the receptor and centred on it. A few degrees off and the circular beam clips the corner of a rectangular receptor — the cone-cut you then have to retake — or the teeth come out elongated and the bone levels cannot be read at all.",
    },
    {
      id: "bite-hold", kind: "hold", target: "fmx-bite-hold", seconds: 5,
      title: "Have the patient close and hold on the block",
      cue: "Ask them to bite gently and hold still while you step out — hold the position until the exposure is made.",
      why: "The whole geometry depends on the patient's teeth staying closed on the block for the few seconds it takes to leave the room and expose. Movement during the exposure blurs the image the same way it blurs a photograph, and a patient who lets go halfway resets the receptor position so the next image is taken from somewhere nobody chose.",
      holdBreakNote: "The bite opened before the exposure. The receptor has moved, so the alignment you just set no longer describes where it is — reseat, realign and start the view again.",
    },
    {
      id: "expose-from-panel", kind: "select", target: "fmx-control-panel",
      title: "Expose from the control position",
      cue: "Step behind the barrier, check the room is clear, and make the exposure from the panel.",
      why: "The operator's own dose is the one that accumulates across every patient of every day, which is why state radiation control programmes set an operator position at distance and out of the beam's path rather than beside the chair. Behind the barrier with the doorway in view, you also see anyone about to walk in — and that is the other half of why the exposure is made from there.",
    },
    {
      id: "palatal-seat", kind: "track", target: "fmx-palate-placement", seconds: 6,
      title: "Hold the receptor's seat for the posterior views",
      cue: "Keep the placement pressure steady against the palate — firm enough to stay, gentle enough not to gag.",
      why: "The posterior views are the ones patients cannot tolerate, and the reason is almost always pressure rather than size: pressed hard into the palate or the floor of the mouth the receptor triggers a gag, and held too lightly it drops out of position between your hand leaving and the exposure being made. The band between those is narrow, and it is the difference between a full series and an abandoned one.",
      track: {
        start: 0.15, green: [0.34, 0.56], rise: 0.5, fall: 0.42, drift: 0.12, label: "PLACEMENT PRESSURE",
        readout: (v) => (v < 0.34 ? "too light — receptor sliding out of position" : v > 0.56 ? "too firm — gag reflex" : "seated and tolerated"),
      },
      holdBreakNote: "Placement lost. Reseat against the palate and settle the pressure before asking the patient to close again.",
    },
    {
      id: "region-order", kind: "select", target: "fmx-region-order-card",
      title: "Work the series in a fixed region order",
      cue: "Follow the posted order through the arches rather than moving around the mouth.",
      why: "A series worked in the same order every time is a series where nothing is missed and nothing is taken twice. Moving around the mouth by feel, the views blur together, an operator loses count, and the fix for a lost count is always another exposure — the fixed order is the reason a full-mouth series can be reconstructed afterwards from the mount alone.",
    },
    {
      id: "judge-images", kind: "find", noHint: true,
      targets: ["fmx-cone-cut", "fmx-overlap"],
      itemNames: { "fmx-cone-cut": "a cone-cut view", "fmx-overlap": "a view with overlapped contacts" },
      itemNotes: {
        "fmx-cone-cut": "A clear unexposed arc across one corner: the beam was not centred on the receptor. The alignment fault is at the ring, and the diagnosis that view was taken for is missing from the cut region.",
        "fmx-overlap": "The contacts between the teeth are superimposed, so the interproximal surfaces cannot be read. The horizontal angulation was off — the beam has to pass through the contacts, not across them.",
      },
      title: "Find the two views in this series that are not diagnostic",
      cue: "Two images on the display cannot be read. Find them before the series is mounted.",
      why: "Judging your own images is the part of the job that decides how much radiation a patient ends up receiving. A view with a cone-cut or with overlapped contacts cannot answer the question it was taken for, so it is worthless dose already delivered; spotting exactly which two, and why each failed, is what stops the same fault producing the same failure on the next patient.",
    },
    {
      id: "retake-decision", kind: "select", target: "fmx-retake-card",
      title: "Apply the retake rule",
      cue: "Repeat only the views that cannot be read, and record why each was retaken.",
      why: "A retake is a new exposure with its own justification, so the rule is narrow: repeat the non-diagnostic view, correct the fault that caused it, and write down that you did. Retaking anything else adds dose for reassurance, and a retake that goes unrecorded hides both the extra exposure and the pattern — the same angulation error, on the same view, across every patient an operator images.",
    },
    {
      id: "sensor-turnover", kind: "sequence", anyOrder: true,
      targets: ["fmx-discard-sheath", "fmx-wipe-sensor", "fmx-holder-reprocess"],
      itemNames: {
        "fmx-discard-sheath": "discard the barrier", "fmx-wipe-sensor": "disinfect the sensor",
        "fmx-holder-reprocess": "holder to reprocessing",
      },
      itemNotes: {
        "fmx-discard-sheath": "Peeled off and binned with the sensor still inside it until the last moment, so the sheath comes away from the contaminated side rather than over it.",
        "fmx-wipe-sensor": "Then the sensor itself, with the disinfectant its manufacturer names — the sheath is a barrier, not a substitute for this.",
        "fmx-holder-reprocess": "The paralleling instrument is heat-tolerant and is sterilised between patients, unlike the sensor — it goes to the reprocessing centre, not back in the drawer.",
      },
      title: "Turn the receptor and the holder over",
      cue: "Barrier off and binned, sensor disinfected, holder into reprocessing.",
      why: "The sensor and the holder leave this room by two different routes, and mixing them up is how a radiography room becomes a cross-contamination problem. The holder is heat-tolerant and gets sterilised like any other instrument; the sensor cannot be, so it gets a fresh barrier every time and a disinfectant its own manufacturer approves — solvents that are fine on a counter will craze a sensor housing.",
    },
    {
      id: "dentist-review", kind: "select", target: "fmx-dentist-review",
      title: "Have the dentist review the series before the patient is released",
      cue: "Bring the mounted series up and check in with the dentist while the patient is still here.",
      why: "Interpretation is the dentist's, not the radiographer's, and it has to happen while the patient is still in the building: if a view is missing or a region needs an additional film, taking it now costs one more exposure at the same visit instead of recalling the patient for another appointment and another shielding-and-setup cycle. The check-in is also where you hand over what you saw during placement.",
    },
    {
      id: "exposure-log", kind: "select", target: "fmx-exposure-log",
      title: "Close the exposure record and hand the room over",
      cue: "Record the views, the factors, any retake and its reason, then hand the room on.",
      why: "The exposure record is how a dose that should not have happened ever gets found. Views taken, factors used, retakes and their reasons, operator and date: with that written down, a faulty timer, a drifting output or one operator's repeated angulation error shows up as a pattern. Without it, every one of those disappears into a set of images nobody can trace back to a setting.",
    },
  ],

  interrupts: [
    {
      id: "fmx-door-opened",
      kind: "Radiation control",
      after: "bite-hold", delay: 3, seconds: 12,
      alert: "Someone has pushed the door open and walked into the room while you are set up to expose.",
      cue: "Nobody stands in this room during an exposure but the patient.",
      target: "fmx-warning-lamp",
      why: "The controlled area exists so that the only person receiving a dose from this exposure is the patient it was justified for. The warning lamp and the door are what keep everyone else out; an exposure made with a colleague standing beside the chair gives them a dose that was never justified for anyone and that nobody will ever record.",
      missNote: "The exposure went ahead with another person standing inside the room. Their dose is unrecorded, unjustified and entirely avoidable, and because nothing visible happens to anyone at these levels the habit survives — which is exactly how an occupational dose accumulates across a career.",
      wrongNote: "It is the warning lamp and the door it controls. Clear the room and show it is controlled before the exposure, not after.",
    },
    {
      id: "fmx-pregnancy-question",
      kind: "Patient question",
      after: "palatal-seat", delay: 3, seconds: 12,
      alert: "The patient says she is pregnant and has been told the whole series has to be cancelled.",
      cue: "Answer this from the patient-selection guidance, not from the corridor.",
      target: "fmx-selection-criteria-card",
      why: "The ADA and FDA's patient-selection recommendations do not treat pregnancy as a reason to withhold a radiograph that is diagnostically necessary — they treat it as another reason to be certain it is necessary, and to shield. Cancelling a needed series leaves a diagnosis unmade; the answer is the selection criteria and the apron, and the dentist confirms the need.",
      missNote: "The series was abandoned on corridor advice. An untreated infection does more harm to a pregnancy than a shielded dental exposure, and the patient leaves believing something about radiation that is not what the selection guidance says — which the next practice will have to undo.",
      wrongNote: "It is the selection criteria card. What decides this is whether the radiograph is needed, and that judgement belongs to the dentist against published patient-selection guidance.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RFX_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#c2cdd2", base2: "#b8c3c9", seam: "rgba(0,0,0,0.11)",
    }), { repeat: 4, px: 256 });
    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 5, px: 256 });

    const floorPlate = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xc2cdd2, { radius: 0.05, cast: false });
    floorPlate.material = texturedMat(floorTex, { rough: 0.72, metal: 0.05, color: 0xd0d9de });

    // ------------------------------------------------------------- the chair
    const chair = group(g, -0.2, 0, -0.9);
    cyl(chair, 0.23, 0.27, 0.12, 0, 0.06, 0.3, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 18 });
    cyl(chair, 0.07, 0.07, 0.44, 0, 0.3, 0.3, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
    slab(chair, 0.56, 0.13, 1.1, 0, 0.56, 0.05, 0x3f5a63, { radius: 0.07, rough: 0.6 });
    const chairBack = group(chair, 0, 0.62, -0.62);
    slab(chairBack, 0.54, 0.86, 0.16, 0, 0.3, 0, 0x3f5a63, { radius: 0.07, rough: 0.6 });
    const headrest = ball(chairBack, 0.13, 0, 0.78, 0.02, 0x3f5a63, { rough: 0.6, seg: 14 });
    headrest.scale.set(1.45, 0.66, 0.95);
    chairBack.rotation.x = -0.75;
    for (const sx of [-1, 1]) box(chair, 0.06, 0.05, 0.5, sx * 0.31, 0.63, 0.1, 0x314750, { rough: 0.55 });

    const patient = seatedFigure(chair, 0, 0.6, -0.08, { ry: 0, cloth: 0x7b8792, legs: 0x545f68 });
    patient.root.rotation.x = -0.82;

    // Lead apron and thyroid collar, on a wall hook and then on the patient.
    const apronHook = group(g, -2.25, 0, -0.35, 0.5);
    slab(apronHook, 0.66, 1.9, 0.06, 0, 0.95, -0.06, 0x6b7680, { radius: 0.02, rough: 0.6 });
    decal(apronHook, 0.5, 0.11, 0, 1.82, -0.025, signFace("SHIELDING", { bg: "#1b242b", accent: "#e8a13c", scale: 0.4 }), { px: 256 });
    cyl(apronHook, 0.02, 0.02, 1.5, 0, 0.75, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    for (const sx of [-1, 1]) cyl(apronHook, 0.016, 0.016, 0.1, sx * 0.14, 1.5, 0.02, CITY.steel, { rough: 0.35, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    const apron = group(apronHook, 0, 1.05, 0.06);
    slab(apron, 0.4, 0.56, 0.05, 0, -0.22, 0, RFX_LEAD, { radius: 0.05, rough: 0.7, metal: 0.25 });
    slab(apron, 0.3, 0.14, 0.05, 0, 0.06, 0, RFX_LEAD, { radius: 0.05, rough: 0.7, metal: 0.25 });
    decal(apron, 0.22, 0.07, 0, -0.34, 0.03, signFace("0.25 mm Pb", { bg: "#4b555e", accent: "#e8a13c", scale: 0.42 }), { px: 160 });
    holoTag(apron, "lead apron", 0, 0.2, 0, { css: "#e8a13c", w: 0.34 });
    reg(hits, apron, "fmx-lead-apron");

    const collar = group(apronHook, 0, 1.3, 0.1);
    torus(collar, 0.09, 0.028, 0, 0, 0, RFX_LEAD, { rough: 0.7, metal: 0.25, seg: 8, seg2: 20 });
    box(collar, 0.06, 0.05, 0.04, 0, -0.08, 0.02, RFX_LEAD, { rough: 0.7, metal: 0.25 });
    holoTag(collar, "thyroid collar", 0, 0.16, 0, { css: "#e8a13c", w: 0.4 });
    reg(hits, collar, "fmx-thyroid-collar");

    // ----------------------------------------------------- the X-ray unit arm
    // The wall unit stands to the right of the chair and its folding arm reaches
    // back over the headrest, which is where a tubehead actually has to end up.
    // The arm is built toward -x so the yoke lands beside the patient's head
    // rather than out across the room behind the operator's barrier.
    const unit = group(g, 1.5, 0, -2.2, 0);
    box(unit, 0.26, 0.9, 0.18, 0, 1.4, 0, 0xe4e9ec, { rough: 0.5, metal: 0.15 });
    cyl(unit, 0.05, 0.06, 1.9, 0, 0.95, 0, 0xdfe4e8, { rough: 0.45, metal: 0.2, seg: 14 });
    const armA = box(unit, 1.0, 0.07, 0.1, -0.5, 1.86, 0.1, 0xe4e9ec, { rough: 0.5, metal: 0.2 });
    const armB = group(unit, -1.0, 1.86, 0.1);
    box(armB, 0.8, 0.065, 0.09, -0.4, 0, 0, 0xe4e9ec, { rough: 0.5, metal: 0.2 });
    const yoke = group(armB, -0.82, -0.14, 0);
    box(yoke, 0.1, 0.24, 0.1, 0, 0, 0, 0xdfe4e8, { rough: 0.45, metal: 0.25 });
    const tubehead = group(yoke, 0, -0.22, 0);
    cyl(tubehead, 0.11, 0.11, 0.2, 0, 0, 0, 0xeff3f6, { rough: 0.35, metal: 0.3, seg: 20 }).rotation.z = Math.PI / 2;
    const cone = cyl(tubehead, 0.055, 0.075, 0.24, -0.22, 0, 0, 0xe8edf0, { rough: 0.35, metal: 0.2, seg: 20 });
    cone.rotation.z = Math.PI / 2;
    torus(tubehead, 0.058, 0.008, -0.34, 0, 0, RFX_ACCENT, { emissive: RFX_ACCENT, ei: 0.7, rough: 0.5, seg: 6, seg2: 20, cast: false })
      .rotation.y = Math.PI / 2;
    armB.rotation.y = 0.5;
    holoTag(tubehead, "tubehead", 0, 0.2, 0, { css: "#e8a13c", w: 0.3 });
    void armA;

    // The aiming ring the tubehead is brought square to — the turn control.
    const aimRing = group(g, -0.05, 1.0, -0.42, 0.3);
    const ringBody = torus(aimRing, 0.11, 0.012, 0, 0, 0, RFX_ACCENT, { emissive: RFX_ACCENT, ei: 0.5, rough: 0.5, seg: 8, seg2: 24 });
    ringBody.rotation.y = Math.PI / 2;
    ownMaterial(ringBody);
    for (let i = 0; i < 3; i++) {
      const spoke = box(aimRing, 0.008, 0.008, 0.11, 0, 0, 0, 0xcfd6db, { rough: 0.4, metal: 0.6 });
      spoke.rotation.x = (i / 3) * Math.PI;
    }
    holoTag(aimRing, "aiming ring", 0, 0.2, 0, { css: "#e8a13c", w: 0.34 });
    reg(hits, aimRing, "fmx-aiming-ring");

    // The bite block in the patient's mouth — the hold control — with the
    // indicator arm running out to the ring.
    const biteAssembly = group(g, -0.2, 0.98, -0.66);
    const biteBlock = box(biteAssembly, 0.05, 0.03, 0.06, 0, 0, 0, 0xf2f6f8, { rough: 0.5 });
    const indicatorArm = box(biteAssembly, 0.03, 0.012, 0.28, 0.02, -0.01, 0.16, 0xcfd6db, { rough: 0.4, metal: 0.55 });
    holoTag(biteAssembly, "bite — hold closed", 0, 0.12, 0, { css: "#e8a13c", w: 0.44 });
    reg(hits, biteAssembly, "fmx-bite-hold");
    void indicatorArm; void biteBlock;

    // The palatal placement control, its own marker beside the bite assembly.
    const palate = group(g, -0.36, 0.95, -0.72);
    ball(palate, 0.018, 0, 0, 0, 0xdba8a4, { rough: 0.6, seg: 12 });
    torus(palate, 0.04, 0.006, 0, 0, 0, RFX_ACCENT, { emissive: RFX_ACCENT, ei: 0.4, rough: 0.5, seg: 6, seg2: 16, cast: false })
      .rotation.x = Math.PI / 2;
    holoTag(palate, "placement pressure", 0, 0.12, 0, { css: "#e8a13c", w: 0.46 });
    reg(hits, palate, "fmx-palate-placement");

    // ------------------------------------------------- the holder kit on a tray
    const kitCart = toolChest(g, 1.65, 0.55, { ry: -0.7, color: RFX_ACCENT });
    const kitTray = group(kitCart, 0, 0.8, 0);
    const kitTop = slab(kitTray, 0.46, 0.02, 0.24, 0, 0, 0, 0x9aa4ac, { radius: 0.01, rough: 0.4, metal: 0.45 });
    kitTop.material = texturedMat(steelTex, { rough: 0.42, metal: 0.5, color: 0xb6bec4 });

    const holderBite = group(kitTray, -0.16, 0.03, 0.04);
    box(holderBite, 0.055, 0.03, 0.07, 0, 0, 0, 0xf2f6f8, { rough: 0.5 });
    box(holderBite, 0.055, 0.012, 0.02, 0, 0.02, -0.03, 0xdfe8ee, { rough: 0.5 });
    holoTag(holderBite, "bite block", 0, 0.08, 0, { css: "#e8a13c", w: 0.32 });
    reg(hits, holderBite, "fmx-holder-bite");

    const holderArm = group(kitTray, -0.02, 0.03, 0.04);
    box(holderArm, 0.028, 0.01, 0.2, 0, 0, 0, 0xcfd6db, { rough: 0.4, metal: 0.55 });
    box(holderArm, 0.028, 0.03, 0.02, 0, 0.015, -0.09, 0xcfd6db, { rough: 0.4, metal: 0.55 });
    holoTag(holderArm, "indicator arm", 0, 0.08, 0, { css: "#e8a13c", w: 0.38 });
    reg(hits, holderArm, "fmx-holder-arm");

    const holderRing = group(kitTray, 0.15, 0.04, 0.04);
    const ringSpare = torus(holderRing, 0.055, 0.008, 0, 0, 0, 0xcfd6db, { rough: 0.4, metal: 0.5, seg: 6, seg2: 20 });
    ringSpare.rotation.x = Math.PI / 2;
    holoTag(holderRing, "aiming ring — kit", 0, 0.09, 0, { css: "#e8a13c", w: 0.44 });
    reg(hits, holderRing, "fmx-holder-ring");

    // The sensor, its sheath box, and the socket the sensor is seated into.
    const sensor = group(kitTray, 0.06, 0.04, -0.07, 0.3);
    box(sensor, 0.045, 0.012, 0.06, 0, 0, 0, 0x2e3a42, { rough: 0.4, metal: 0.2 });
    box(sensor, 0.035, 0.004, 0.05, 0, 0.008, 0, 0x6f7f8a, { rough: 0.3, metal: 0.3 });
    hose(sensor, [[0.02, 0, 0.03], [0.1, 0.01, 0.12], [0.22, 0.0, 0.16]], 0.006, 0x3a4048, { steps: 10, rough: 0.6 });
    holoTag(sensor, "digital sensor", 0, 0.08, 0, { css: "#e8a13c", w: 0.38 });
    reg(hits, sensor, "fmx-sensor");

    const sheathBox = group(kitCart, -0.2, 0.83, -0.1, 0.2);
    box(sheathBox, 0.14, 0.07, 0.1, 0, 0, 0, 0x2f7d6a, { rough: 0.6 });
    decal(sheathBox, 0.11, 0.035, 0, 0.005, 0.051, signFace("SENSOR SHEATHS", { bg: "#1f5c4e", accent: "#bfeee0", scale: 0.34 }), { px: 160 });
    for (let i = 0; i < 3; i++) box(sheathBox, 0.04, 0.005, 0.06, -0.03 + i * 0.03, 0.04, 0, 0xf4f8fa, { rough: 0.5, opacity: 0.8, transparent: true });
    holoTag(sheathBox, "single-use barrier", 0, 0.12, 0, { css: "#e8a13c", w: 0.46 });
    reg(hits, sheathBox, "fmx-sensor-sheath");

    const holderSlot = box(g, 0.24, 0.16, 0.2, -0.2, 0.98, -0.66, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["fmx-holder-slot"] = holderSlot;

    // ------------------------------------------------ control position + barrier
    const barrier = group(g, 2.35, 0, -1.0, -0.6);
    slab(barrier, 1.1, 2.0, 0.09, 0, 1.0, 0, 0xcfd6db, { radius: 0.02, rough: 0.55, metal: 0.2 });
    const window = slab(barrier, 0.46, 0.4, 0.02, 0, 1.45, 0.06, 0xbfe4f2, { radius: 0.02, rough: 0.15, opacity: 0.45, transparent: true });
    void window;
    decal(barrier, 0.5, 0.12, 0, 0.5, 0.05, signFace("OPERATOR POSITION", { bg: "#3e4a52", accent: "#e8a13c", scale: 0.32 }), { px: 256 });

    const panelBox = group(barrier, 0.0, 1.12, 0.09);
    box(panelBox, 0.34, 0.24, 0.06, 0, 0, 0, RFX_PANEL, { rough: 0.45, metal: 0.3 });
    const panelFace = decal(panelBox, 0.28, 0.14, 0, 0.03, 0.035,
      paperFace("EXPOSURE", ["ADULT · MOLAR", "READY"], { bg: "#0f1b22", band: "#e8a13c" }), { px: 256 });
    const exposeButton = cyl(panelBox, 0.028, 0.028, 0.02, 0, -0.07, 0.04, CITY.good, { emissive: CITY.good, ei: 0.7, rough: 0.5, seg: 16 });
    exposeButton.rotation.x = Math.PI / 2;
    ownMaterial(exposeButton);
    holoTag(panelBox, "control panel", 0, 0.2, 0, { css: "#e8a13c", w: 0.36 });
    reg(hits, panelBox, "fmx-control-panel");

    // The exposure-factor dial, its own control beside the panel.
    const dial = group(barrier, 0.32, 1.12, 0.09);
    cyl(dial, 0.06, 0.06, 0.03, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 18 }).rotation.x = Math.PI / 2;
    box(dial, 0.012, 0.012, 0.1, 0, 0.02, 0.02, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 6; i++) {
      const a = -1.1 + (i / 5) * 2.2;
      box(dial, 0.006, 0.02, 0.006, Math.sin(a) * 0.075, Math.cos(a) * 0.075, 0.02, 0xdfe4e8, { rough: 0.5, cast: false });
    }
    holoTag(dial, "size / region", 0, 0.16, 0, { css: "#e8a13c", w: 0.36 });
    reg(hits, dial, "fmx-exposure-dial");

    // Warning lamp over the door, and the doorway itself.
    const doorway = group(g, -2.6, 0, 2.2, 0.35);
    for (const sx of [-1, 1]) box(doorway, 0.1, 2.1, 0.14, sx * 0.55, 1.05, 0, 0xd2d8dd, { rough: 0.6 });
    box(doorway, 1.2, 0.12, 0.14, 0, 2.16, 0, 0xd2d8dd, { rough: 0.6 });
    const doorLeaf = group(doorway, -0.5, 0, 0.04);
    const leaf = slab(doorLeaf, 0.98, 2.0, 0.05, 0.49, 1.0, 0, 0xe4e9ec, { radius: 0.01, rough: 0.6 });
    void leaf;
    const lampHousing = box(doorway, 0.3, 0.14, 0.1, 0, 2.34, 0.02, 0x3a4048, { rough: 0.5, metal: 0.3 });
    const warnLamp = box(doorway, 0.24, 0.09, 0.03, 0, 2.34, 0.08, 0xf0645b, { emissive: 0xf0645b, ei: 0.2, rough: 0.4, cast: false });
    ownMaterial(warnLamp);
    decal(doorway, 0.28, 0.07, 0, 2.2, 0.08, signFace("X-RAY IN USE", { bg: "#2b1a1a", accent: "#f0645b", scale: 0.34 }), { px: 192 });
    holoTag(doorway, "warning lamp", 0, 2.5, 0.02, { css: "#f0645b", w: 0.38 });
    reg(hits, warnLamp, "fmx-warning-lamp");
    void lampHousing;

    // ------------------------------------------------------ display and paperwork
    const deskRun = group(g, 2.3, 0, 0.9, -1.0);
    box(deskRun, 1.3, 0.76, 0.5, 0, 0.38, 0, 0xd2d8dd, { rough: 0.55 });
    const deskTop = slab(deskRun, 1.36, 0.04, 0.54, 0, 0.78, 0, 0xeef3f5, { radius: 0.01, rough: 0.5 });
    void deskTop;
    const monitor = group(deskRun, 0, 0.8, -0.1);
    cyl(monitor, 0.1, 0.12, 0.02, 0, 0.01, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 16 });
    cyl(monitor, 0.02, 0.02, 0.18, 0, 0.1, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 10 });
    const screenBody = box(monitor, 0.66, 0.4, 0.03, 0, 0.38, 0, 0x22282d, { rough: 0.4, metal: 0.3 });
    void screenBody;
    // The mounted series: a grid of small views, two of them wrong.
    const mount = group(monitor, 0, 0.38, 0.02);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
      box(mount, 0.1, 0.13, 0.004, -0.24 + c * 0.12, 0.09 - r * 0.17, 0, 0x8ea3ad, { rough: 0.5, cast: false });
    }
    const coneCut = group(mount, 0.24, 0.09, 0.006);
    box(coneCut, 0.1, 0.13, 0.004, 0, 0, 0, 0x6f8894, { rough: 0.5, cast: false });
    box(coneCut, 0.035, 0.05, 0.005, 0.03, 0.04, 0.002, 0x1a2126, { rough: 0.5, cast: false });
    holoTag(coneCut, "view 5", 0, 0.1, 0, { css: "#f0645b", w: 0.2 });
    reg(hits, coneCut, "fmx-cone-cut");

    const overlapView = group(mount, -0.12, -0.08, 0.006);
    box(overlapView, 0.1, 0.13, 0.004, 0, 0, 0, 0x6f8894, { rough: 0.5, cast: false });
    for (let i = 0; i < 3; i++) box(overlapView, 0.012, 0.09, 0.005, -0.02 + i * 0.02, 0, 0.002, 0x2a333a, { rough: 0.5, cast: false });
    holoTag(overlapView, "view 7", 0, 0.1, 0, { css: "#f0645b", w: 0.2 });
    reg(hits, overlapView, "fmx-overlap");

    const regionCard = decal(deskRun, 0.26, 0.32, -0.42, 0.805, 0.06,
      paperFace("REGION ORDER", ["Anterior · premolar · molar", "Maxillary then mandibular", "Same order every patient"], { band: "#e8a13c" }), { px: 256 });
    regionCard.rotation.x = -Math.PI / 2;
    holoTag(deskRun, "region order", -0.42, 0.95, 0.06, { css: "#e8a13c", w: 0.36 });
    reg(hits, regionCard, "fmx-region-order-card");

    const retakeCard = decal(deskRun, 0.26, 0.3, 0.42, 0.805, 0.06,
      paperFace("RETAKE RULE", ["Only non-diagnostic views", "Correct the fault first", "Record view + reason"], { band: "#c0392b" }), { px: 256 });
    retakeCard.rotation.x = -Math.PI / 2;
    holoTag(deskRun, "retake rule", 0.42, 0.95, 0.06, { css: "#e8a13c", w: 0.34 });
    reg(hits, retakeCard, "fmx-retake-card");

    const criteriaCard = decal(deskRun, 0.26, 0.3, -0.42, 0.805, -0.16,
      paperFace("SELECTION CRITERIA", ["ADA / FDA recommendations", "Radiograph when indicated", "Shield, then expose"], { band: "#2f8f6a" }), { px: 256 });
    criteriaCard.rotation.x = -Math.PI / 2;
    holoTag(deskRun, "selection criteria", -0.42, 0.95, -0.16, { css: "#59c97b", w: 0.44 });
    reg(hits, criteriaCard, "fmx-selection-criteria-card");

    const exposureLog = decal(deskRun, 0.26, 0.34, 0.42, 0.805, -0.16,
      paperFace("EXPOSURE RECORD", ["Views + factors", "Retakes + reason", "Operator · date"], { band: "#e8a13c" }), { px: 256 });
    exposureLog.rotation.x = -Math.PI / 2;
    holoTag(deskRun, "exposure record", 0.42, 0.95, -0.16, { css: "#e8a13c", w: 0.42 });
    reg(hits, exposureLog, "fmx-exposure-log");

    // ------------------------------------------------------------- turnover kit
    const turnoverShelf = group(g, -2.4, 0, 1.15, 0.7);
    box(turnoverShelf, 0.05, 1.3, 0.5, -0.4, 0.65, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(turnoverShelf, 0.05, 1.3, 0.5, 0.4, 0.65, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const y of [0.5, 0.95]) box(turnoverShelf, 0.84, 0.025, 0.46, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });

    const sheathBin = group(turnoverShelf, -0.24, 0.52, 0);
    cyl(sheathBin, 0.09, 0.08, 0.16, 0, 0.08, 0, 0x53585e, { rough: 0.55, metal: 0.3, seg: 14 });
    decal(sheathBin, 0.12, 0.04, 0, 0.1, 0.09, signFace("BARRIER WASTE", { bg: "#2b3138", accent: "#e8a13c", scale: 0.3 }), { px: 160 });
    holoTag(sheathBin, "discard barrier", 0, 0.24, 0, { css: "#e8a13c", w: 0.42 });
    reg(hits, sheathBin, "fmx-discard-sheath");

    const wipeTub = group(turnoverShelf, 0.05, 0.52, 0);
    cyl(wipeTub, 0.07, 0.07, 0.15, 0, 0.075, 0, 0x2f6f8c, { rough: 0.45, metal: 0.1, seg: 16 });
    cyl(wipeTub, 0.03, 0.03, 0.03, 0, 0.16, 0, 0xdfe4e8, { rough: 0.5, seg: 12 });
    decal(wipeTub, 0.1, 0.035, 0, 0.09, 0.071, signFace("APPROVED WIPES", { bg: "#1d4a5e", accent: "#bfe9f7", scale: 0.3 }), { px: 160 });
    holoTag(wipeTub, "disinfect sensor", 0, 0.24, 0, { css: "#e8a13c", w: 0.44 });
    reg(hits, wipeTub, "fmx-wipe-sensor");

    const reproBin = group(turnoverShelf, 0.28, 0.52, 0);
    box(reproBin, 0.2, 0.09, 0.15, 0, 0.05, 0, 0x6f5ba8, { rough: 0.55 });
    decal(reproBin, 0.16, 0.04, 0, 0.055, 0.076, signFace("TO REPROCESSING", { bg: "#3b2f63", accent: "#d8c9ff", scale: 0.28 }), { px: 192 });
    holoTag(reproBin, "holder to reprocessing", 0, 0.2, 0, { css: "#e8a13c", w: 0.52 });
    reg(hits, reproBin, "fmx-holder-reprocess");

    // ------------------------------------------------------------------ hazards
    const bareHand = group(g, -0.52, 0.94, -0.62, 0.4);
    ball(bareHand, 0.03, 0, 0, 0, 0xd3a37d, { rough: 0.75, seg: 12 });
    for (let i = 0; i < 3; i++) cyl(bareHand, 0.008, 0.008, 0.05, -0.012 + i * 0.012, 0.02, 0.02, 0xd3a37d, { rough: 0.75, seg: 8 })
      .rotation.x = 0.6;
    holoTag(bareHand, "holding it by hand", 0, 0.1, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, bareHand, "fmx-held-by-hand");

    const bareSensor = group(kitCart, 0.2, 0.83, -0.12, -0.2);
    box(bareSensor, 0.045, 0.012, 0.06, 0, 0, 0, 0x4a3a3a, { rough: 0.4, metal: 0.2 });
    holoTag(bareSensor, "no barrier", 0, 0.07, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, bareSensor, "fmx-bare-sensor");

    const adultPreset = group(barrier, -0.34, 1.12, 0.09);
    box(adultPreset, 0.16, 0.1, 0.05, 0, 0, 0, 0x54343a, { rough: 0.5, metal: 0.2 });
    const adultBadge = decal(adultPreset, 0.13, 0.05, 0, 0.005, 0.03, signFace("ADULT — LAST PT", { bg: "#54343a", accent: "#f0645b", scale: 0.3 }), { px: 192 });
    holoTag(adultPreset, "previous patient's factors", 0, 0.1, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, adultPreset, "fmx-adult-setting-on-child");

    const blanketRetake = group(deskRun, 0.0, 0.82, 0.16);
    box(blanketRetake, 0.12, 0.03, 0.07, 0, 0, 0, 0x5a3038, { rough: 0.5 });
    decal(blanketRetake, 0.1, 0.03, 0, 0.018, 0, signFace("RETAKE ALL", { bg: "#5a3038", accent: "#f0645b", scale: 0.34 }), { px: 160 })
      .rotation.x = -Math.PI / 2;
    holoTag(blanketRetake, "retake the whole series", 0, 0.1, 0, { css: "#f0645b", w: 0.54 });
    reg(hits, blanketRetake, "fmx-blanket-retake");

    // ------------------------------------------------------------- the dentist
    const dentist = standingFigure(g, 2.25, 2.2, { ry: -2.6, cloth: 0x2f5f70, skin: 0x855637 });
    holoTag(dentist, "the dentist", 0, 1.8, 0, { css: "#e8a13c", w: 0.34 });
    const reviewMark = box(dentist, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reviewMark, "fmx-dentist-review");

    // A second figure waiting outside the doorway — the person who will walk in.
    const colleague = standingFigure(g, -3.5, 3.05, { ry: 2.3, cloth: 0x4a7f7a, skin: 0xbd8860 });
    colleague.visible = false;

    const panel = holoPanel(g, 0.74, 0.5, -2.45, 1.6, -1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,16,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8a13c"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe3bd";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("IMAGING ROOM — FULL SERIES", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fdf3e6";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Shield first · sheath the sensor", "Factors set per patient and region",
       "Expose from the control position", "Retake by rule, recorded"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.16));
      });
    }, { accent: RFX_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.2, 2.62, 0.4, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.2, 2.585, 0.4, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.5, rough: 0.4, cast: false });
    }

    const key = new THREE.DirectionalLight(0xfff2e0, 0.85);
    key.position.set(2.4, 4.6, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfff6ea, 0x5f6a70, 0.9));

    let doorOpen = false, exposing = false;
    const leafHome = doorLeaf.rotation.y;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.2, 1.0, -0.8),

      onStep(step) { exposing = step.id === "expose-from-panel"; },

      onStepComplete(step) {
        if (step.id === "shield-patient") {
          apron.parent.remove(apron);
          chair.add(apron);
          apron.position.set(0, 0.92, -0.18);
          apron.rotation.set(-0.7, 0, 0);
          collar.parent.remove(collar);
          chair.add(collar);
          collar.position.set(0, 1.12, -0.42);
        }
        if (step.id === "sheath-sensor") {
          repaint(panelFace, paperFace("EXPOSURE", ["SENSOR SHEATHED", "READY"], { bg: "#0f1b22", band: "#2f8f6a" }));
        }
        if (step.id === "seat-receptor") {
          sensor.parent.remove(sensor);
          biteAssembly.add(sensor);
          sensor.position.set(0, 0.01, -0.02);
          sensor.rotation.set(0, 0, 0);
        }
        if (step.id === "exposure-factors") {
          repaint(adultBadge, signFace("SET FOR THIS PT", { bg: "#2c4a3c", accent: "#9fe8c0", scale: 0.3 }));
        }
        if (step.id === "expose-from-panel") exposeButton.material.emissiveIntensity = 0.2;
        if (step.id === "judge-images") { coneCut.visible = false; overlapView.visible = false; }
        if (step.id === "sensor-turnover") bareSensor.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "fmx-door-opened") {
          doorOpen = true;
          doorLeaf.rotation.y = leafHome - 1.1;
          colleague.visible = true;
          warnLamp.material.emissiveIntensity = 1.6;
        }
        if (it.id === "fmx-pregnancy-question") {
          criteriaCard.material.emissiveIntensity = 1.5;
          patient.head.rotation.y = 0.35;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fmx-door-opened") {
          doorOpen = false;
          doorLeaf.rotation.y = leafHome;
          colleague.visible = false;
          warnLamp.material.emissiveIntensity = 0.6;
        }
        if (it.id === "fmx-pregnancy-question") {
          criteriaCard.material.emissiveIntensity = 0.8;
          patient.head.rotation.y = 0;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        patient.head.rotation.x = Math.sin(t * 0.6) * 0.02;
        if (!doorOpen) warnLamp.material.emissiveIntensity = exposing ? 1.2 + Math.sin(t * 7) * 0.3 : 0.2;
        ringBody.material.emissiveIntensity = 0.4 + Math.sin(t * 1.6) * 0.15;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "exposure-factors") {
          const ok = gg.t >= 0.36 && gg.t <= 0.56;
          repaint(panelFace, paperFace("EXPOSURE", [`${Math.round(55 + gg.t * 25)} kVp`, ok ? "IN BAND" : "OUT OF BAND"],
            { bg: "#0f1b22", band: ok ? "#2f8f6a" : "#c0392b" }));
        }
      },
    };
  },
};
