import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, particles, mat,
  seatedFigure, counter, cabinet, trolley,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, equipmentCabinet, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Denture Delivery & Adjustment VR — Dental & Oral Health, station
// two hundred and fourteen. The appointment where a finished removable
// prosthesis stops belonging to the laboratory and starts belonging to the
// person wearing it: the case checked against its own prescription, the fit
// proved with pressure-indicating paste rather than by asking whether it hurts,
// the adjustment cut at the bench under a guard and under extraction, the bite
// checked, the appliance marked with its owner's identity, and an older patient
// sent home with instructions they can actually follow tonight.
//
// Sited generically. No real laboratory, no real patient, no invented clause.

const DDA_ACCENT = 0xe0a24b;
const DDA_STEEL = 0x9aa6ac;
const DDA_ACRYLIC = 0xf4e3d7;
const DDA_CABINET = 0xece7de;
const DDA_CHAIR = 0x5c4a3a;

export const SIM_DENTURE_DELIVERY_AND_ADJUSTMENT = {
  id: "denture-delivery-and-adjustment",
  index: "214",
  domain: "Removable prosthodontics",
  trade: "Dental assistant and dental laboratory technician — removable prosthodontics (DANB Certified Dental Assistant), SEIU and UFCW clinic, dental and laboratory staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Certified Dental Assistant credential; the state dental practice act, which lists which parts of a denture delivery an assistant may carry out and which adjustments only the dentist may make; ACP guidance on removable prosthodontic care and the prosthodontic team; the laboratory prescription the practice act requires for every case; SEIU and UFCW clinic, dental and laboratory staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings on disinfecting an appliance travelling between the laboratory and the chair; OSHA 29 CFR 1910.133 eye and face protection and 29 CFR 1910.134 respiratory protection for acrylic dust; 8 CCR 5141 on controlling a harmful exposure at its source; NIOSH guidance on local exhaust at a bench",
  name: "Denture Delivery & Adjustment",
  title: simTitle("Denture Delivery & Adjustment"),
  tagline: "A finished denture handed over properly: case checked against the prescription, fit proved with paste, the spot cut under a guard and under extraction, bite checked, appliance marked, and home care an older patient can follow",
  accent: DDA_ACCENT,
  accentCss: "#e0a24b",
  parSeconds: 310,
  footprint: 2.3,
  badge: { id: "seated-and-marked", name: "Seated & Marked", note: "A denture delivered on proof rather than on hope, adjusted safely and marked with its owner's identity" },

  game: system({
    name: "Bench & Chair",
    currency: "FIT",
    ranks: ["Laboratory Aide", "Prosthetic Assistant", "Bench Technician", "Delivery Lead", "Prosthodontics Certified"],
    badges: [
      { id: "paste-not-guesswork", name: "Paste, Not Guesswork", note: "Pressure spots found with paste before anything was cut", test: AWARD.stepClean("pip-read") },
      { id: "dust-controlled", name: "Dust Controlled", note: "Shield, respirator and extraction in that order before the bur turned", test: AWARD.stepClean("dust-control") },
      { id: "gentle-hands", name: "Gentle Hands", note: "Bench speed and trimming pressure both held near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "one-appointment", name: "One Appointment", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-do-overs", name: "No Do-Overs", note: "A delivery with no corrections", test: AWARD.clean },
      { id: "steady-bench", name: "Steady Bench", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "boiling-water-cup": "That is a cup of boiling water set out as a way of cleaning the denture. Heat distorts acrylic, and a denture that has been dropped in boiling water comes back warped in a way nobody can see and nobody can undo — it no longer fits the ridge it was processed against. It is also the single commonest thing a well-meaning patient does at home, which is exactly why it is never demonstrated in the surgery.",
    "kitchen-abrasive-cleaner": "That is a household abrasive cleaner beside the brush. Scouring powders and bleaches cut fine scratches into the polished acrylic that plaque then colonises, and bleach attacks the metal of a partial denture's clasps and framework. The patient goes home copying whatever they watched happen here, so the only cleaner that appears at this chair is one made for dentures.",
    "unguarded-lathe": "The bench lathe is running with its guard swung out of the way and no shield over anybody's face. A polishing wheel at that speed will snatch a denture out of your fingers and throw it — usually into the wall, sometimes into a face — and the acrylic that shatters goes wherever it likes. The guard is down and the shield is on before the lathe is touched.",
    "diy-reline-kit": "That is an over-the-counter reline kit somebody has left in the drawer. A home reline seals a soft, permanently deforming layer over a denture nobody has examined: it hides the ridge that is being resorbed underneath it, holds plaque against the tissue, and makes the appliance impossible to adjust properly afterwards. A sore spot is adjusted at this chair, not padded over at home.",
  },

  lateNotes: {
    "lab-handpiece": "Nothing is cut until the paste has shown where the pressure actually is. A bur brought up now is guesswork with a permanent result.",
    "id-marker-tag": "The appliance is marked once the adjustment is finished, so the mark is not cut away five minutes later.",
    "home-care-card": "The home-care conversation happens once the denture actually fits, when the patient can concentrate on it.",
  },

  steps: [
    {
      id: "case-match", kind: "select", target: "lab-prescription",
      title: "Match the case to its own prescription",
      cue: "Read the laboratory prescription and check the case in front of you is the one it describes.",
      why: "A finished case arrives with a written prescription that names the patient, the appliance, the shade, the tooth mould and the materials used, and that document is what the practice act requires a laboratory to work from in the first place. Two boxes come back on the same day from the same laboratory more often than anybody likes to admit, and the wrong upper denture will seat well enough at the first look to get as far as the patient's mouth. Matching the case to the paperwork takes ten seconds and is the only check that catches it.",
    },
    {
      id: "case-check", kind: "find", noHint: true,
      targets: ["acrylic-flash", "undisinfected-case", "wrong-shade-tag"],
      itemNames: {
        "acrylic-flash": "the sharp flash along the border",
        "undisinfected-case": "the case that has not been disinfected on return",
        "wrong-shade-tag": "the shade tag that does not match the prescription",
      },
      itemNotes: {
        "acrylic-flash": "A thin sharp edge of acrylic left along the periphery. Run a finger along it and it catches — it will do the same to the inside of a lip within an hour of wear, and it comes off here with a stone rather than out of a sore mouth next week.",
        "undisinfected-case": "Nothing on this box says the case was disinfected when it came back from the laboratory. An appliance that has been in another patient's mouth, then a laboratory, then a courier bag, is disinfected in both directions — that is the CDC's line on items travelling to and from a laboratory.",
        "wrong-shade-tag": "The shade tag taped to this case is not the shade the prescription asks for. Better to find that now than after the patient has looked in the mirror and trusted you.",
      },
      title: "Check the case over before it goes near the patient",
      cue: "Three things about this returned case are wrong. Find them before you seat anything.",
      why: "The two minutes before an appliance goes into a mouth are the only cheap minutes in this appointment. A sharp border, a case nobody disinfected and a shade that does not match the prescription each cost almost nothing to put right now and a great deal afterwards: a laceration, a cross-contamination nobody can trace, and a patient who no longer believes what they are told about their own denture.",
    },
    {
      id: "try-in", kind: "select", target: "denture-upper",
      title: "Seat the denture and check the fit and the borders",
      cue: "Seat it gently and check the extension, the border seal and whether it rocks.",
      why: "The first seat answers questions in order: does it go on at all, does the periphery stop short of the moving tissue rather than digging into it, does it stay up when the patient is asked to talk, and does it rock when finger pressure is applied to one side. Each of those has a different cause and a different fix, and the fix is chosen from what the appliance does in the mouth rather than from what the model on the bench suggested it would do.",
    },
    {
      id: "closure-hold", kind: "hold", target: "denture-upper", seconds: 9,
      title: "Hold it seated while the patient closes",
      cue: "Hold the denture up and steady while the patient closes gently and holds.",
      why: "Holding it seated while the patient closes is how you tell a retention problem from an occlusion problem. If the appliance only unseats when the teeth come together, the bite is pushing it off rather than the fit failing; if it drops the moment you let go, the periphery or the seal is wrong. Doing this before any adjustment is cut matters, because grinding acrylic off a denture that was being unseated by its own bite makes a badly fitting denture out of a well fitting one.",
      holdBreakNote: "You let go before the patient had closed. Hold it up until the teeth meet — without that you cannot tell whether the bite or the fit is unseating it.",
    },
    {
      id: "pip-paint", kind: "select", target: "pip-brush",
      title: "Paint the tissue surface with pressure-indicating paste",
      cue: "Paint a thin, even layer of pressure-indicating paste across the whole fitting surface.",
      why: "Pressure-indicating paste turns an invisible problem into a visible one. Painted thin and even over the fitting surface and then seated under normal closing pressure, it is wiped away exactly where the acrylic is pressing hardest on tissue and left undisturbed everywhere else. Without it, the adjustment is guided by where the patient says it hurts, and a sore mouth reports pain unreliably and often in the wrong place — which is how a denture ends up ground away in three spots that were never the problem.",
    },
    {
      id: "pip-read", kind: "find", noHint: true,
      targets: ["pip-spot-ridge", "pip-spot-tuberosity", "pip-spot-frenum"],
      itemNames: {
        "pip-spot-ridge": "the wiped spot over the bony ridge",
        "pip-spot-tuberosity": "the wiped spot at the back of the ridge",
        "pip-spot-frenum": "the wiped notch where the frenum sits",
      },
      itemNotes: {
        "pip-spot-ridge": "Paste wiped clean over a sharp point on the ridge. Bone with thin tissue over it takes all the load here, and this is the spot that ulcerates first if it is left.",
        "pip-spot-tuberosity": "A clean patch at the very back of the ridge, where the denture is riding on the tuberosity. It shows up as a nagging ache rather than a sharp pain, which is why patients often do not report it at all.",
        "pip-spot-frenum": "The paste is wiped in a narrow line where the frenum crosses the border. A frenum trapped against acrylic hurts when the patient talks, and the fix is a notch rather than a general grinding of the border.",
      },
      title: "Read the pressure spots the paste has revealed",
      cue: "Find the three places the paste has been wiped away — those are the spots to relieve.",
      why: "Reading the paste is the whole skill: the places it has gone are the places the acrylic is loading the tissue, and the places it is untouched must not be touched by a bur either. Three distinct patterns matter here — a point on the ridge, the back of the ridge, and a line where the frenum crosses the border — because each one is relieved differently: a dimple, a broad reduction and a notch respectively. Cutting all three the same way ends up with a denture that is loose everywhere and still sore in one place.",
    },
    {
      id: "dust-control", kind: "sequence",
      targets: ["face-shield", "dust-respirator", "bench-extractor"],
      itemNames: { "face-shield": "the face shield", "dust-respirator": "the respirator", "bench-extractor": "the bench extraction hood" },
      title: "Shield, respirator, extraction — before the bur turns",
      cue: "Face shield on, respirator fitted, extraction running, then go to the bench.",
      why: "Trimming acrylic throws a fine dust and small hard fragments at speed, and the three controls do different jobs: the shield stops a fragment reaching your eyes, the respirator keeps the respirable fraction out of your lungs, and the extraction hood takes the dust away at the point it is made instead of letting the room breathe it. The hood is the one that matters most, because 8 CCR 5141 and NIOSH both put control at the source above anything worn on a face — but it only works if it is switched on before the bur is, not after the first cut.",
      outOfOrderNote: "Wrong order — shield, then respirator, then extraction, and all three before the handpiece. Dust already in the air is dust the hood never caught.",
    },
    {
      id: "bench-speed", kind: "gauge", target: "bench-speed-readout",
      title: "Set the bench handpiece speed for acrylic",
      cue: "Set the handpiece speed for an acrylic bur, then commit the reading.",
      why: "Acrylic is cut at a moderate speed with a light touch, because the material does not tolerate heat: too fast, or pressed too hard, and the surface melts and smears rather than cutting, which clogs the bur and leaves a glazed layer that is rougher than what you started with. Too slow and the bur judders across the surface and digs. The right speed with a sharp acrylic bur takes the spot off in seconds without ever letting the appliance get warm enough to move.",
      gauge: {
        label: "BENCH SPEED", speed: 0.78, green: [0.34, 0.58],
        readout: (t) => (t < 0.34 ? "too slow — bur will judder" : t > 0.58 ? "too fast — acrylic will melt" : `${Math.round(8 + t * 14)}k rpm`),
        missNote: "Outside the range an acrylic bur works in. Set it off the bur's own chart rather than winding it up until it sounds fast.",
      },
    },
    {
      id: "trim-spot", kind: "track", target: "lab-handpiece", seconds: 10,
      title: "Relieve the spot under the guard, light and moving",
      cue: "Keep the bur light and moving over the marked spot only, with the guard down.",
      why: "The cut is deliberately timid. Light, moving pressure inside the marked area takes off a few tenths of a millimetre at a time, and every pass is followed by another look at the paste rather than by a deeper cut — acrylic removed cannot be put back, and a denture relieved too far loses the contact that was holding it up. Hands stay behind the guard and the appliance is held so that if the bur does catch, it throws the denture away from your fingers rather than through them.",
      track: {
        start: 0.12, green: [0.34, 0.58], rise: 0.5, fall: 0.44, drift: 0.12, label: "BUR PRESSURE",
        readout: (v) => (v < 0.34 ? "barely touching" : v > 0.58 ? "too heavy — cutting deep" : "light and moving"),
      },
      holdBreakNote: "The pressure went out of band. Ease off and keep the bur moving — a heavy bur takes off more acrylic in one pass than the paste asked for.",
    },
    {
      id: "polish-change", kind: "turn", target: "chuck-collar",
      title: "Change from the bur to the polishing wheel",
      cue: "Turn the chuck collar to release the bur and seat the polishing wheel.",
      why: "Every surface a bur has touched is left rough, and rough acrylic against mucosa is an ulcer waiting to happen — it also holds plaque in a way polished acrylic does not, which matters for a patient whose denture will be in their mouth for years. So the cut is always followed by pumice and a high shine on the relieved area only. Changing the chuck properly, with the handpiece stopped, is also what keeps a half-seated bur from coming loose at speed.",
      turn: { turns: 0.75, axis: "y", label: "CHUCK COLLAR" },
    },
    {
      id: "occlusion-check", kind: "select", target: "articulating-paper",
      title: "Check the occlusion with articulating paper",
      cue: "Mark the bite with articulating paper and check the contacts are even side to side.",
      why: "A complete denture is held in place by a bite that loads it evenly: one high contact acts as a pivot, tipping the appliance and dropping the other side every time the patient closes, which the patient experiences as a loose denture rather than as a high spot. Marking the contacts with paper shows where the load actually lands, and the marks — not the patient's description — are what gets adjusted. On a new denture this is checked again at the review appointment, because the tissue underneath changes shape in the first weeks of wear.",
    },
    {
      id: "home-care-card", kind: "select", target: "home-care-card",
      title: "Go through home care with the patient and whoever helps them",
      cue: "Go through cleaning, overnight removal and the sore-spot plan, in writing, with whoever helps at home.",
      why: "This is the part of the appointment that decides how the next ten years go, and it is short enough to be written on one card: clean it over a basin of water with a soft denture brush and a cleaner made for the job, take it out overnight so the tissue underneath gets a rest and thrush has less chance to take hold, never use boiling water or a household abrasive, and come back for a sore spot rather than filing it down at home. Said to an older patient and to the person who helps them, with the card to take away, it survives the drive home.",
    },
    {
      id: "denture-id", kind: "drag", target: "id-marker-tag",
      title: "Mark the denture with the patient's identity",
      cue: "Carry the identification marker to the denture and place it into the recess on the flange.",
      why: "A marked denture can be given back. Unmarked appliances are lost by the hundred in hospitals and care homes every year, and a patient who cannot eat properly while a replacement is made for them loses weight and independence quickly — which is why identification inside a removable appliance is standard practice for anyone in residential or long-term care, and a reasonable offer to everybody else. The mark goes inside the flange where it does not show, is processed into the acrylic rather than written on it, and carries a name or a number the practice can trace.",
      drag: { to: "denture-id-socket", radius: 0.45, missNote: "Not in the recess. A marker stuck on a polished surface comes off in the first week — it belongs in the flange recess, sealed into the acrylic." },
    },
    {
      id: "team-checkin", kind: "select", target: "team-checkin",
      title: "Check in with the laboratory and the front desk",
      cue: "Tell the technician what you adjusted and book the review with the front desk before the patient leaves.",
      why: "The technician who processed this case has no other way of learning that its posterior border was long or its bite ran high on one side, and that feedback is the only thing that makes the next case better. The front desk needs the twenty-four to forty-eight hour review booked while the patient is still in the building, because a sore spot that gets seen the next day is an adjustment and a sore spot that waits a fortnight is an ulcer, and an older patient who has stopped wearing the denture rather than complaining about it is the one nobody hears from.",
    },
    {
      id: "delivery-log", kind: "select", target: "delivery-log",
      title: "Write the delivery record and hand over",
      cue: "Record what was delivered, what was adjusted, the identification placed and the review date, then hand over.",
      why: "The record has to say what was actually handed over and what was done to it: the appliance and its laboratory, the shade and mould, every adjustment cut and where, the identification method placed inside it, the instructions given, and the review appointment made. It is the reference for the next adjustment, the evidence that the appliance was marked, and — if this patient moves into residential care — the document that lets somebody else prove whose denture it is.",
    },
  ],

  interrupts: [
    {
      id: "denture-slips",
      kind: "Patient handling",
      after: "closure-hold", delay: 3, seconds: 12,
      alert: "The patient has taken the denture out themselves and it is sliding out of their fingers straight toward the tile floor.",
      cue: "The denture is about to go on the floor — get something under it.",
      target: "denture-basin",
      why: "A denture dropped onto a hard floor fractures or chips, and a fractured denture means the patient goes home without one while it is repaired. The reason appliances are handled over a basin of water or a folded towel is precisely this moment: hands are slow and a wet acrylic denture is slippery, so the catch is made by what is underneath rather than by reflexes.",
      missNote: "It hit the floor. Even when it does not visibly crack, an appliance that has been dropped on tile goes back to the laboratory to be checked — and this patient eats soup for a week while that happens.",
      wrongNote: "It is the basin. Nothing you can reach for at the bracket gets under a falling denture in time; what is already underneath it is what saves it.",
    },
    {
      id: "extraction-trips",
      kind: "Exposure control",
      after: "trim-spot", delay: 3, seconds: 12,
      alert: "The bench extraction has cut out — its indicator is dark and a visible cloud of acrylic dust is drifting up past your face.",
      cue: "The extractor has stopped and the dust is coming back at you.",
      target: "extractor-reset",
      why: "A respirator is the last line, not the first: with the hood off, every pass of the bur puts respirable acrylic dust into the room for everybody else in it as well as for you, which is the exposure 8 CCR 5141 asks to be controlled at its source. The bur stops, the hood is reset, and the cut resumes when the extraction is proved to be pulling again.",
      missNote: "You kept cutting with the extraction dead. The dust that got past your respirator's seal is the part you never notice, and the room it settled in is somebody else's next appointment.",
      wrongNote: "It is the extractor's reset. Turning the handpiece down or leaning away does not take the dust anywhere — only the hood does that.",
    },
  ],

  supportLine: "Bench work wears hands, shoulders and hearing down over a career: your local's health and safety representative — SEIU and UFCW both train them — will arrange an ergonomic assessment of your bench at no cost to you.",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, DDA_ACCENT);

    const benchTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d9cdbb", base2: "#cdc0ad", seam: "rgba(0,0,0,0.09)",
    }), { repeat: 3, px: 256 });

    // ----------------------------------------------------------- chair side
    const chairBase = group(g, -0.55, 0, -1.0, 0.25);
    cyl(chairBase, 0.23, 0.27, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.09, 0.1, 0.4, 0, 0.3, 0, DDA_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const seatGroup = group(chairBase, 0, 0.5, 0);
    slab(seatGroup, 0.62, 0.14, 0.66, 0, 0, 0.28, DDA_CHAIR, { radius: 0.07, rough: 0.62 });
    const chairBack = group(seatGroup, 0, 0.05, -0.22);
    slab(chairBack, 0.6, 0.86, 0.14, 0, 0.4, 0, DDA_CHAIR, { radius: 0.07, rough: 0.62 });
    chairBack.rotation.x = 0.3;
    slab(chairBack, 0.34, 0.24, 0.1, 0, 0.94, 0.02, DDA_CHAIR, { radius: 0.06, rough: 0.62 });
    for (const sx of [-1, 1]) slab(seatGroup, 0.1, 0.06, 0.6, sx * 0.34, 0.09, 0.28, DDA_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    // An older patient, sitting up rather than laid flat for a delivery.
    const patient = seatedFigure(seatGroup, 0, 0.08, 0.36, { skin: 0xe0bb99, cloth: 0x7b6f86, hair: 0xd8d4cc });
    patient.root.rotation.x = 0.3;
    patient.torso.rotation.x = -0.04;

    // The upper denture itself, on a gauze square on the bracket until it is seated.
    const bracket = group(g, 0.35, 0, -0.85, -0.4);
    cyl(bracket, 0.05, 0.06, 0.74, 0, 0.37, 0, DDA_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    const trayTop = slab(bracket, 0.5, 0.03, 0.34, 0.06, 0.75, 0, 0xf4f1ea, { radius: 0.02, rough: 0.4, metal: 0.08 });
    void trayTop;
    const gauzeSquare = box(bracket, 0.16, 0.004, 0.14, -0.08, 0.77, 0, 0xf6f2ea, { rough: 0.9, cast: false });
    void gauzeSquare;
    const dentureUpper = group(bracket, -0.08, 0.79, 0);
    const dentureBase = ball(dentureUpper, 0.055, 0, 0, 0, 0xe58b8b, { rough: 0.4 });
    dentureBase.scale.set(1.0, 0.36, 0.86);
    for (let i = 0; i < 7; i++) {
      const a = -1.15 + i * 0.38;
      box(dentureUpper, 0.012, 0.016, 0.012, Math.sin(a) * 0.045, 0.014, Math.cos(a) * 0.04 - 0.005, DDA_ACRYLIC, { rough: 0.25 });
    }
    reg2(dentureUpper, "denture-upper");
    // The fitting surface, with the three spots the paste reveals and the
    // flange recess the identification marker drops into.
    const fitSurface = group(dentureUpper, 0, -0.012, 0);
    const pipRidge = ball(fitSurface, 0.008, -0.01, 0, -0.01, 0xd8e8f0, { rough: 0.5 });
    reg2(pipRidge, "pip-spot-ridge");
    const pipTuber = ball(fitSurface, 0.008, 0.03, 0, 0.03, 0xd8e8f0, { rough: 0.5 });
    reg2(pipTuber, "pip-spot-tuberosity");
    const pipFrenum = box(fitSurface, 0.006, 0.004, 0.016, -0.04, 0, 0.02, 0xd8e8f0, { rough: 0.5 });
    reg2(pipFrenum, "pip-spot-frenum");
    const idSocket = cyl(dentureUpper, 0.006, 0.006, 0.003, 0.03, -0.004, -0.03, 0xcf7f7f, { rough: 0.5, seg: 10 });
    reg2(idSocket, "denture-id-socket");
    const sharpFlash = box(dentureUpper, 0.02, 0.002, 0.004, -0.045, -0.006, 0.035, 0xf8ece0, { rough: 0.3 });
    holoTag(dentureUpper, "Sharp flash", 0, 0.08, 0, { css: "#f0645b", w: 0.28 });
    reg2(sharpFlash, "acrylic-flash");

    const pipBrush = group(bracket, 0.1, 0.78, -0.08, 0.4);
    cyl(pipBrush, 0.004, 0.004, 0.11, 0, 0, 0, 0xe0a24b, { rough: 0.5, seg: 8 });
    pipBrush.rotation.z = Math.PI / 2;
    cyl(pipBrush, 0.007, 0.005, 0.02, 0.06, 0, 0, 0xf4f1ea, { rough: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    const pipJar = cyl(bracket, 0.022, 0.022, 0.035, 0.16, 0.775, -0.06, 0xdfe8ee, { rough: 0.2, opacity: 0.6, seg: 12 });
    void pipJar;
    reg2(pipBrush, "pip-brush");
    const artPaper = group(bracket, 0.16, 0.775, 0.08, -0.3);
    box(artPaper, 0.05, 0.002, 0.03, 0, 0, 0, 0x3a5fbf, { rough: 0.6, cast: false });
    box(artPaper, 0.012, 0.01, 0.034, -0.032, 0.004, 0, 0xb8c0c6, { rough: 0.4, metal: 0.5 });
    reg2(artPaper, "articulating-paper");
    const idMarker = group(bracket, 0.22, 0.78, 0);
    cyl(idMarker, 0.006, 0.006, 0.004, 0, 0, 0, 0xf2f5f7, { rough: 0.3, seg: 10 });
    decal(idMarker, 0.012, 0.008, 0, 0.003, 0, signFace("ID", { bg: "#f2f5f7", fg: "#5c4a3a", accent: "#e0a24b", scale: 0.5 }), { px: 64 }).rotation.x = -Math.PI / 2;
    holoTag(idMarker, "Identification marker", 0, 0.06, 0, { css: "#e0a24b", w: 0.44 });
    reg2(idMarker, "id-marker-tag");

    // The water basin the appliance is handled over.
    const basin = group(g, 0.15, 0, -0.35, 0.2);
    cyl(basin, 0.15, 0.13, 0.07, 0, 0.72, 0, 0xcfd8de, { rough: 0.35, metal: 0.15, seg: 18 });
    const basinWater = cyl(basin, 0.135, 0.125, 0.04, 0, 0.72, 0, 0x8fc8e0, { rough: 0.15, opacity: 0.65, seg: 18 });
    cyl(basin, 0.03, 0.035, 0.7, 0, 0.35, 0, DDA_STEEL, { rough: 0.35, metal: 0.7, seg: 10 });
    reg2(basin, "denture-basin");

    // ------------------------------------------------------------- the bench
    const bench = counter(g, 1.9, 0.6, 1.5, -1.0, 0xd9cdbb, { ry: -1.15 });
    bench.children[0].material = texturedMat(benchTex, { rough: 0.6, metal: 0.05, color: 0xffffff });
    const benchLamp = group(bench, -0.6, 0.95, -0.12);
    cyl(benchLamp, 0.02, 0.025, 0.4, 0, 0.2, 0, DDA_STEEL, { rough: 0.35, metal: 0.7, seg: 10 });
    const lampShade = cyl(benchLamp, 0.09, 0.06, 0.07, 0.08, 0.42, 0.04, 0xf2ede0, { rough: 0.4, seg: 16 });
    const lampGlow = cyl(lampShade, 0.055, 0.055, 0.008, 0, -0.038, 0, 0xfff4d8, { emissive: 0xfff4d8, ei: 1.5, rough: 0.3, seg: 16, cast: false });

    // Extraction hood over the working area, with its own indicator and a reset.
    const hood = group(bench, 0.1, 1.0, -0.14);
    box(hood, 0.34, 0.03, 0.22, 0, 0.32, 0, 0xc8cfd4, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(hood, 0.02, 0.32, 0.2, sx * 0.16, 0.16, 0, 0xc8cfd4, { rough: 0.5, metal: 0.4 });
    cyl(hood, 0.06, 0.06, 0.3, 0, 0.48, -0.06, 0xb8c0c6, { rough: 0.6, metal: 0.3, seg: 14 });
    const hoodLamp = ball(hood, 0.012, 0.13, 0.3, 0.09, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
    reg2(hood, "bench-extractor");
    const extractorReset = group(bench, 0.44, 0.98, -0.2);
    box(extractorReset, 0.1, 0.09, 0.05, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.3 });
    const resetButton = cyl(extractorReset, 0.02, 0.02, 0.014, 0, 0.02, 0.03, 0xf2c14b, { rough: 0.4, seg: 14 });
    resetButton.rotation.x = Math.PI / 2;
    decal(extractorReset, 0.08, 0.025, 0, -0.03, 0.026, signFace("RESET", { bg: "#1b2026", accent: "#f2c14b", scale: 0.45 }), { px: 128 });
    reg2(extractorReset, "extractor-reset");

    // The bench handpiece with its guard, and the chuck collar.
    const handpieceRig = group(bench, 0.08, 0.98, 0.04, 0.3);
    cyl(handpieceRig, 0.018, 0.022, 0.18, 0, 0.02, 0, 0x2f3740, { rough: 0.45, metal: 0.4, seg: 12 });
    handpieceRig.rotation.z = 1.2;
    const acrylicBur = cyl(handpieceRig, 0.006, 0.004, 0.035, 0, 0.115, 0, 0xd8c98f, { rough: 0.3, metal: 0.6, seg: 8 });
    reg2(handpieceRig, "lab-handpiece");
    const chuckCollar = cyl(bench, 0.016, 0.016, 0.02, 0.15, 1.0, 0.1, 0xb8c0c6, { rough: 0.3, metal: 0.8, seg: 14 });
    reg2(chuckCollar, "chuck-collar");
    const burGuard = box(bench, 0.16, 0.12, 0.01, 0.08, 1.06, 0.14, 0xcfe8f0, { rough: 0.15, opacity: 0.45 });
    const speedGauge = instrument(bench, -0.26, 0.97, 0.08, { w: 0.13, d: 0.18, idle: "-- rpm", color: DDA_ACCENT, ry: 0.3 });
    reg2(speedGauge, "bench-speed-readout");
    const dustCloud = particles(bench, 20, 0xe8ddc8, { size: 0.012, life: 0.5, additive: false, opacity: 0.5 });

    // The lathe with its guard swung away, at the far end of the bench.
    const lathe = group(bench, 0.78, 0.94, 0.0, -0.4);
    box(lathe, 0.2, 0.14, 0.16, 0, 0.07, 0, 0x4a545a, { rough: 0.55, metal: 0.35 });
    const latheWheel = cyl(lathe, 0.06, 0.06, 0.02, 0.13, 0.09, 0, 0xe8dcc0, { rough: 0.85, seg: 18 });
    latheWheel.rotation.z = Math.PI / 2;
    const latheGuard = box(lathe, 0.02, 0.12, 0.12, 0.13, 0.2, 0.1, 0xcfe8f0, { rough: 0.2, opacity: 0.45 });
    latheGuard.rotation.z = 0.9;
    holoTag(lathe, "Guard swung out", 0, 0.26, 0, { css: "#f0645b", w: 0.38 });
    reg2(lathe, "unguarded-lathe");

    // PPE hooks at the bench end.
    const ppeHook = group(g, 2.45, 0, 0.35, -1.5);
    slab(ppeHook, 0.34, 0.85, 0.07, 0, 0.5, 0, 0x5a5f65, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const faceShield = group(ppeHook, 0, 0.78, 0.07);
    box(faceShield, 0.22, 0.16, 0.012, 0, 0, 0, 0xd8f0f8, { rough: 0.15, opacity: 0.5 });
    box(faceShield, 0.22, 0.03, 0.03, 0, 0.09, 0, 0x2b3138, { rough: 0.5 });
    reg2(faceShield, "face-shield");
    const respirator = group(ppeHook, 0, 0.52, 0.06);
    ball(respirator, 0.055, 0, 0, 0, 0xe8eef0, { rough: 0.7 });
    box(respirator, 0.1, 0.008, 0.008, 0, 0.03, -0.03, 0xdfe4e8, { rough: 0.6 });
    decal(respirator, 0.06, 0.02, 0, -0.02, 0.05, signFace("N95", { bg: "#e8eef0", fg: "#2b3138", accent: "#e0a24b", scale: 0.5 }), { px: 96 });
    reg2(respirator, "dust-respirator");
    const apronStack = group(ppeHook, 0, 0.24, 0.06);
    for (let i = 0; i < 3; i++) box(apronStack, 0.16, 0.02, 0.08, 0, i * 0.026, 0, 0x7b6f86, { rough: 0.7, cast: false });

    // -------------------------------------------------------- returned case
    const caseTrolley = trolley(g, -1.85, 0.45, 0x4a545a, { ry: 0.6 });
    const caseBox = group(caseTrolley, 0, 0.9, 0);
    box(caseBox, 0.3, 0.12, 0.22, 0, 0, 0, 0xcdbfa8, { rough: 0.7 });
    decal(caseBox, 0.24, 0.07, 0, 0.065, 0, paperFace("LAB CASE", ["Upper complete", "Shade A2"], { bg: "#f2ece0" }), { px: 224 }).rotation.x = -Math.PI / 2;
    const noDisinfectTag = decal(caseBox, 0.1, 0.07, 0.1, 0.02, 0.112,
      paperFace("RETURN", ["Disinfected:", "--"], { bg: "#efe6c9", worn: true }), { px: 160 });
    holoTag(caseBox, "No disinfection record", 0, 0.16, 0, { css: "#f0645b", w: 0.5 });
    reg2(noDisinfectTag, "undisinfected-case");
    const shadeTag = group(caseTrolley, 0.16, 0.62, 0.06, 0.3);
    box(shadeTag, 0.05, 0.02, 0.09, 0, 0, 0, 0xe8d8b8, { rough: 0.4 });
    for (let i = 0; i < 3; i++) box(shadeTag, 0.012, 0.014, 0.024, -0.014 + i * 0.014, 0.016, 0.02, 0xf2e8d8, { rough: 0.3 });
    holoTag(shadeTag, "Shade B1 — not A2", 0, 0.08, 0, { css: "#f0645b", w: 0.44 });
    reg2(shadeTag, "wrong-shade-tag");

    // The two things a patient should never be shown: boiling water and scouring powder.
    const wrongCare = group(g, -2.3, 0, 1.2, -0.5);
    slab(wrongCare, 0.6, 0.5, 0.4, 0, 0.25, 0, DDA_CABINET, { radius: 0.02, rough: 0.5 });
    const boilCup = group(wrongCare, -0.14, 0.52, 0);
    cyl(boilCup, 0.05, 0.04, 0.09, 0, 0.045, 0, 0xf2f5f7, { rough: 0.3, seg: 14 });
    const steam = particles(boilCup, 10, 0xe8f4f8, { size: 0.014, life: 0.8, additive: false, opacity: 0.35 });
    steam.visible = true;
    holoTag(boilCup, "Boiling water", 0, 0.16, 0, { css: "#f0645b", w: 0.32 });
    reg2(boilCup, "boiling-water-cup");
    const abrasive = group(wrongCare, 0.12, 0.52, 0.04);
    cyl(abrasive, 0.035, 0.035, 0.13, 0, 0.065, 0, 0xd8a23b, { rough: 0.6, seg: 14 });
    decal(abrasive, 0.05, 0.05, 0, 0.065, 0.036, signFace("SCOUR", { bg: "#b8791a", accent: "#fff", scale: 0.4 }), { px: 96 });
    holoTag(abrasive, "Household abrasive", 0, 0.18, 0, { css: "#f0645b", w: 0.42 });
    reg2(abrasive, "kitchen-abrasive-cleaner");
    const relineKit = group(wrongCare, 0.0, 0.52, -0.12);
    box(relineKit, 0.11, 0.05, 0.07, 0, 0.025, 0, 0xcf5f8f, { rough: 0.5 });
    decal(relineKit, 0.09, 0.03, 0, 0.051, 0, signFace("DIY RELINE", { bg: "#8c2b55", accent: "#ffd2e4", scale: 0.35 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg2(relineKit, "diy-reline-kit");

    // --------------------------------------------------------- wall paperwork
    const labRx = holoPanel(g, 0.58, 0.42, -2.15, 1.5, -0.65, (ctx, w, h) => {
      ctx.fillStyle = "rgba(26,18,8,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a24b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e4c8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LABORATORY PRESCRIPTION", w * 0.06, h * 0.15);
      ctx.fillStyle = "#fdf3e4";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Upper complete denture", "Shade A2 · mould 24", "Heat-cured acrylic", "Identification: requested",
        "Delivery: today", "Review: 24-48 hours"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.32 + i * h * 0.12));
    }, { ry: 0.5, accent: DDA_ACCENT });
    reg2(labRx, "lab-prescription");

    const homeCard = group(g, 1.35, 0, 1.15, -0.5);
    cyl(homeCard, 0.02, 0.024, 1.0, 0, 0.5, 0, DDA_STEEL, { rough: 0.35, metal: 0.7, seg: 10 });
    box(homeCard, 0.22, 0.17, 0.02, 0, 1.02, 0, 0xf6f1e4, { rough: 0.6 });
    decal(homeCard, 0.19, 0.14, 0, 1.02, 0.012,
      paperFace("LOOKING AFTER IT", ["Brush over water", "Out overnight", "No boiling water", "Sore? Come back"], { bg: "#faf4e6" }), { px: 256 });
    reg2(homeCard, "home-care-card");

    const teamBoard = holoPanel(g, 0.46, 0.32, 1.85, 1.8, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,20,24,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("LAB FEEDBACK", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("What was adjusted · review booked", w / 2, h * 0.66);
    }, { ry: -0.3, accent: 0x4fd1ff });
    reg2(teamBoard, "team-checkin");

    const logPanel = holoPanel(g, 0.52, 0.36, -1.6, 1.8, 1.75, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,16,8,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0a24b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f6e4c8";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("DELIVERY RECORD", w / 2, h * 0.24);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Appliance · adjustments · ID", w / 2, h * 0.52);
      ctx.fillText("Instructions · review date", w / 2, h * 0.72);
    }, { ry: 0.3, accent: DDA_ACCENT });
    reg2(logPanel, "delivery-log");

    // -------------------------------------------------------------- furniture
    cabinet(g, 0.95, 0.5, 0.3, 2.1, 1.7, -1.75, DDA_CABINET, { doorColor: 0xdcd5c8 });
    const modelShelf = group(g, -1.15, 0, 1.95, 0.3);
    slab(modelShelf, 0.8, 0.06, 0.28, 0, 1.0, 0, DDA_CABINET, { radius: 0.02, rough: 0.5 });
    for (const sx of [-1, 1]) cyl(modelShelf, 0.02, 0.02, 1.0, sx * 0.34, 0.5, 0, DDA_STEEL, { rough: 0.4, metal: 0.6, seg: 8 });
    for (let i = 0; i < 4; i++) {
      const cast = ball(modelShelf, 0.045, -0.28 + i * 0.19, 1.06, 0, 0xf2ece0, { rough: 0.85 });
      cast.scale.set(1, 0.6, 0.8);
      cyl(modelShelf, 0.05, 0.05, 0.03, -0.28 + i * 0.19, 1.03, 0, 0xe4ddd0, { rough: 0.9, seg: 12 });
    }
    const stockCab = equipmentCabinet(g, 0.8, 0.9, 0.44, 2.3, -0.9, { ry: -0.7, color: DDA_CABINET, doorColor: DDA_CABINET, rough: 0.45, metal: 0.08, weathered: false, lines: ["DENTURE", "STOCK"] });
    void stockCab;
    const stool = group(g, 1.1, 0, 0.35, -0.5);
    cyl(stool, 0.19, 0.2, 0.05, 0, 0.03, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(stool, 0.03, 0.035, 0.5, 0, 0.29, 0, DDA_STEEL, { rough: 0.3, metal: 0.8, seg: 12 });
    slab(stool, 0.36, 0.09, 0.34, 0, 0.58, 0, 0x6d5a45, { radius: 0.1, rough: 0.65 });

    standingFigure(g, -1.2, -0.1, { ry: 1.6, cloth: 0xb08a4a, skin: 0xb98a63 });
    standingFigure(g, 1.7, 2.15, { ry: -2.4, cloth: 0x4a7f8c });

    const key = new THREE.DirectionalLight(0xfff6ea, 0.85);
    key.position.set(-2.4, 4.4, 2.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfaf2e6, 0x4e4a44, 0.9));

    let extracting = true;
    let trimming = false;
    let steamT = 0;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -0.7),

      onStepComplete(step) {
        if (step.id === "try-in") { dentureUpper.position.set(-0.04, 0.83, 0.02); dentureUpper.rotation.z = 0.1; }
        if (step.id === "pip-paint") {
          for (const spot of [pipRidge, pipTuber, pipFrenum]) spot.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 0.8, rough: 0.4 });
        }
        if (step.id === "dust-control") { hoodLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 }); }
        if (step.id === "bench-speed") repaint(speedGauge.userData.screen, signFace("SET", { bg: "#241a0c", accent: "#59c97b", fg: "#f8e6c8", scale: 0.55 }));
        if (step.id === "trim-spot") { trimming = false; pipRidge.scale.setScalar(0.5); }
        if (step.id === "polish-change") { acrylicBur.material = mat(0xe8dcc0, { rough: 0.85 }); chuckCollar.rotation.y = 1.2; }
        if (step.id === "occlusion-check") { artPaper.rotation.z = 0.5; }
        if (step.id === "denture-id") { idMarker.position.set(0.03, -0.006, -0.03); dentureUpper.add(idMarker); }
        if (step.id === "delivery-log") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(14,28,18,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcf6e4";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("DELIVERY SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("Review booked · ID recorded", w / 2, h * 0.68);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "denture-slips") {
          dentureUpper.position.set(-0.04, 0.68, 0.14);
          dentureUpper.rotation.z = 0.9;
          patient.torso.rotation.x = 0.16;
        }
        if (it.id === "extraction-trips") {
          extracting = false;
          hoodLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.4 });
          dustCloud.visible = true;
          resetButton.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.4 });
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "denture-slips") {
          dentureUpper.position.set(0.1, 0.78, 0.05);
          basin.add(dentureUpper);
          dentureUpper.rotation.z = 0;
          patient.torso.rotation.x = -0.04;
        }
        if (it.id === "extraction-trips") {
          extracting = true;
          hoodLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
          dustCloud.visible = false;
          resetButton.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0, rough: 0.4 });
        }
      },

      animate(t, dt, session) {
        patient.head.rotation.y = -0.06 + Math.sin(t * 0.3) * 0.04;
        patient.torso.position.y = Math.sin(t * 0.95) * 0.003;
        lampGlow.material.emissiveIntensity = 1.45 + Math.sin(t * 0.9) * 0.06;
        steamT += dt;
        if (steamT > 0.05) { steam.userData.step(steamT, new THREE.Vector3(0, 0.1, 0), 0.02, 0.1, 0.25); steamT = 0; }
        if (dustCloud.visible) dustCloud.userData.step(dt, new THREE.Vector3(0.08, 1.02, 0.06), 0.05, 0.18, 0.05);

        if (session?.step?.id === "trim-spot" && session.holding) {
          trimming = true;
          acrylicBur.rotation.y = t * 20;
          if (extracting) {
            dustCloud.visible = true;
            dustCloud.userData.step(dt, new THREE.Vector3(0.08, 1.02, 0.06), 0.03, 0.12, -0.4);
          }
        } else if (trimming && dustCloud.visible && extracting) {
          dustCloud.visible = false;
        }
        if (session?.turn && session.step?.id === "polish-change") {
          chuckCollar.rotation.y = session.turn.amount * Math.PI * 2;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "bench-speed") {
          repaint(speedGauge.userData.screen, signFace(`${Math.round(8 + gg.t * 14)}k`, {
            bg: "#241a0c", accent: gg.t >= 0.34 && gg.t <= 0.58 ? "#59c97b" : "#f0645b", fg: "#f8e6c8", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "trim-spot") {
          const good = tr.v >= 0.34 && tr.v <= 0.58;
          burGuard.material = mat(good ? 0xcfe8f0 : 0xf0b8b0, { rough: 0.2, opacity: 0.45 });
          handpieceRig.rotation.z = 1.2 - tr.v * 0.15;
        }
      },
    };
  },
};
