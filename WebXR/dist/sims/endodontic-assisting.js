import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  seatedFigure, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, equipmentCabinet, standingFigure,
  surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Endodontic Assisting VR — Dental & Oral Health, station two
// hundred and thirteen. A root canal treatment from the assistant's chair: the
// tooth isolated behind a rubber dam before anything enters it, a working
// length that came off the apex locator rather than off a guess, files counted
// onto the bracket and counted off it again, the hypochlorite handled as the
// caustic it is with the eyewash treated as equipment rather than decoration,
// and the fill proved on a radiograph before the patient is dismissed.
//
// Sited generically: no real practice, no real patient, no invented clause.

const ENDO_ACCENT = 0xb583e0;
const ENDO_STEEL = 0x9aa6ac;
const ENDO_DAM = 0x3f6f8c;
const ENDO_CABINET = 0xe9eef2;
const ENDO_CHAIR = 0x35505e;

export const SIM_ENDODONTIC_ASSISTING = {
  id: "endodontic-assisting",
  index: "213",
  domain: "Endodontics",
  trade: "Dental assistant — endodontic assisting (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Certified Dental Assistant credential and its infection-control component; the state dental practice act, which decides which endodontic duties an assistant may carry out and which belong to the dentist alone; AGD continuing education for the general practice that does its own root canal treatment; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens, 29 CFR 1910.1200 hazard communication for the sodium hypochlorite on the bracket, 29 CFR 1910.133 eye and face protection and 29 CFR 1910.151 first aid; ANSI Z358.1 for the emergency eyewash this room has to be able to reach; ISO 23908 on sharps injury protection behind the file count",
  name: "Endodontic Assisting",
  title: simTitle("Endodontic Assisting"),
  tagline: "A root canal from the assistant's side: the dam on before anything opens, a working length read off the locator, files counted both ways, hypochlorite treated as caustic, and the fill proved on a radiograph",
  accent: ENDO_ACCENT,
  accentCss: "#b583e0",
  parSeconds: 295,
  footprint: 2.2,
  badge: { id: "sealed-canal", name: "Sealed Canal", note: "A canal isolated, shaped to a measured length, filled and proved on film with every file accounted for" },

  game: system({
    name: "Canal Discipline",
    currency: "APEX",
    ranks: ["Chairside Aide", "Endodontic Assistant", "Isolation Lead", "Treatment Coordinator", "Endodontics Certified"],
    badges: [
      { id: "dam-first", name: "Dam First", note: "Isolation placed before anything entered the tooth", test: AWARD.stepClean("dam-isolation") },
      { id: "measured-not-guessed", name: "Measured, Not Guessed", note: "Working length and shaping both held near band centre", test: AWARD.precise(0.72) },
      { id: "caustic-respect", name: "Caustic Respect", note: "Nothing unsafe reached for around the irrigant", test: AWARD.safe },
    ],
    challenges: [
      { id: "single-visit", name: "Single Visit", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-retries", name: "No Retries", note: "A treatment with no corrections", test: AWARD.clean },
      { id: "counted-streak", name: "Counted Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "bare-hypochlorite-beaker": "That is an open beaker of full-strength sodium hypochlorite sitting on the bracket with nothing over it and nothing written on it. An unlabelled open container of a caustic is what 29 CFR 1910.1200 exists to stop: anyone walking up to this tray has no way of knowing whether it holds irrigant, saline or anaesthetic, and an open dish of bleach is one knocked elbow away from a chemical burn on somebody's face.",
    "plain-needle-tip": "That irrigating needle has an open end rather than a side vent. A needle that jets forward is the one that pushes hypochlorite out of the apex into the tissue beyond it, and a hypochlorite accident is a sudden, severe swelling with bleeding and pain that can take weeks to settle — side venting exists so that the irrigant comes back up the canal instead of going down through it.",
    "cotton-roll-shortcut": "Those cotton rolls are set out as a substitute for the dam. Cotton and suction keep a tooth dryish; they do not stop a file, a fragment of a file or a mouthful of hypochlorite from reaching the throat, and they do not keep saliva out of a canal that is about to be sealed. Isolation for endodontics is the dam, and nothing else on this tray does the same job.",
    "alcohol-flame": "There is a lit alcohol flame standing beside a rubber dam, cotton rolls and an alcohol-soaked gauze. An open flame at the chair belongs nowhere near the drape, the patient's face or an oxygen line, and the fire it starts is fast and almost invisible in daylight — the heat carrier gets an electric heat source or nothing at all.",
  },

  lateNotes: {
    "master-cone": "The canal is shaped, irrigated and dry before anything is fitted into it. A cone carried up now goes into a canal that is not ready for it.",
    "rotary-motor": "The motor comes up once the length is measured and the hand files have established the glide path — not before.",
    "count-board": "The count is reconciled at the end of the visit, when every file that went on the bracket can actually be accounted for.",
  },

  steps: [
    {
      id: "endo-chart", kind: "select", target: "endo-chart",
      title: "Read the diagnosis and the pre-operative radiograph",
      cue: "Read the pulp-test findings, the tooth and the canal anatomy off the chart and the film before the tray is set.",
      why: "The film is where the number of canals, their curvature and the length to work toward are first estimated, and the pulp testing beside it is why this tooth is being treated rather than the one next to it. Prescribing and taking that film is held to the ADA's and FDA's guidance on selecting dental radiographs, which is what keeps imaging tied to a clinical question rather than to routine. An assistant who has not looked at either is setting out instruments for a tooth they cannot describe.",
    },
    {
      id: "dam-isolation", kind: "sequence",
      targets: ["dam-clamp", "dam-sheet", "dam-frame"],
      itemNames: { "dam-clamp": "the clamp tried on the tooth", "dam-sheet": "the dam sheet over the clamp bow", "dam-frame": "the frame" },
      title: "Isolate the tooth: clamp, dam, frame",
      cue: "Try the clamp on the tooth first, carry the dam over its bow, then seat the frame.",
      why: "Isolation is the first thing that happens and the reason endodontics can be done at all. The clamp is tried on the tooth before the dam goes anywhere near it, because a clamp that does not seat has to be swapped while you can still see what you are doing; the sheet then stretches over the bow to seal the tooth away from saliva and from the throat; the frame holds it open and out of the way. Done in any other order it becomes a struggle over the patient's face, and a dam fitted badly leaks in the one place it matters.",
      outOfOrderNote: "Out of order — clamp tried first, then the dam over its bow, then the frame. A dam wrestled on before the clamp is proven is a dam that has to come off again.",
    },
    {
      id: "bracket-check", kind: "find", noHint: true,
      targets: ["unlabeled-irrigant", "dam-pinhole", "eyewash-untagged"],
      itemNames: {
        "unlabeled-irrigant": "the unlabelled irrigant syringe",
        "dam-pinhole": "the dam sheet with a pinhole in it",
        "eyewash-untagged": "the eyewash with no activation tag",
      },
      itemNotes: {
        "unlabeled-irrigant": "A filled syringe with nothing written on it. Two clear liquids on one bracket — irrigant and anaesthetic — is exactly the mix-up that labelling prevents, and the label goes on when the syringe is filled, not when somebody asks.",
        "dam-pinhole": "Light comes through this sheet. A dam with a hole in it is a dam that leaks saliva into the canal and lets irrigant through to the tissue underneath, and it is no more use than no dam at all.",
        "eyewash-untagged": "The tag on this eyewash has not been signed in weeks. An eyewash nobody has run is an eyewash nobody knows works, and the one minute you need it is not the minute to find out.",
      },
      title: "Check the tray and the eyewash before the irrigant is drawn",
      cue: "Three things here will matter only when something goes wrong. Find them now.",
      why: "Each of these is invisible until the moment it costs something. An unlabelled syringe looks identical to the one beside it, a pinhole in a dam sheet shows up as a taste in the patient's mouth halfway through, and an untested eyewash looks exactly like a working one right up until somebody is standing at it with a face full of hypochlorite. Checking them costs a minute at the start of a visit and nothing at all afterwards.",
    },
    {
      id: "eye-protection", kind: "select", target: "patient-glasses",
      title: "Put eye protection on the patient",
      cue: "Set safety glasses on the patient and check your own face shield before the irrigant comes up.",
      why: "The patient is lying underneath everything that happens at this chair, with their eyes directly below a syringe of caustic, and they have no way of protecting themselves. Glasses for them and a face shield for you is what 29 CFR 1910.133 asks for wherever a liquid chemical can splash, and in endodontics the splash is not hypothetical — a syringe plunger that slips throws hypochlorite the length of the chair.",
    },
    {
      id: "working-length", kind: "gauge", target: "apex-locator",
      title: "Read the working length off the apex locator",
      cue: "Hold the file at the constriction and commit the working length the locator shows.",
      why: "The working length is the single measurement the rest of the treatment is built on: everything is cleaned, shaped and filled to it, and nothing goes beyond it. An electronic apex locator finds the apical constriction by the change in impedance at the end of the canal, which is more reliable than measuring off a film alone because the anatomical end of the root and its radiographic tip are not in the same place. Too long and files and irrigant go into tissue beyond the tooth; too short and infected tissue is left behind in the last millimetres.",
      gauge: {
        label: "WORKING LENGTH", speed: 0.78, green: [0.38, 0.6],
        readout: (t) => (t < 0.38 ? "short — canal left dirty" : t > 0.6 ? "long — past the apex" : `${(17 + t * 6).toFixed(1)} mm`),
        missNote: "Not at the constriction. Bring the file back until the locator settles, and confirm it against the film rather than accepting the first number that flashes.",
      },
    },
    {
      id: "irrigate-hold", kind: "hold", target: "irrigant-syringe", seconds: 9,
      title: "Irrigate passively, short of the length",
      cue: "Hold the side-vented needle loose in the canal, short of working length, and let the irrigant flow gently.",
      why: "Sodium hypochlorite is what actually dissolves the tissue and kills the bacteria that files cannot reach, and the technique is entirely about where it goes. The needle sits loose rather than wedged, two or three millimetres short of the length, and the plunger is pressed slowly, so the irrigant washes up and out of the canal instead of being forced through the apex. A needle jammed to length and pushed hard turns a routine irrigation into a hypochlorite injury in the tissue beyond the root.",
      holdBreakNote: "You let go mid-irrigation. Reseat the needle loose and short, and restart the flow — a canal half irrigated is a canal still full of what you came to remove.",
    },
    {
      id: "file-sequence", kind: "sequence",
      targets: ["hand-file-10", "hand-file-15", "rotary-file"],
      itemNames: { "hand-file-10": "the size 10 hand file", "hand-file-15": "the size 15 hand file", "rotary-file": "the rotary shaping file" },
      title: "Hand up the files in size order",
      cue: "Size 10 by hand, then size 15, and only then the rotary shaping file.",
      why: "The small hand files go first because their job is to prove a path all the way to the measured length — a glide path — and to tell the operator by feel where the canal curves. A rotary file put into a canal that has never been negotiated is a rotating instrument in an unknown space, which is how files separate and leave a fragment nobody can retrieve. Each file also goes onto the bracket in its numbered slot, because a file that is not in its slot is either in the canal or on the floor.",
      outOfOrderNote: "Wrong order — the small hand files establish the glide path first. A rotary file in an unnegotiated canal is the classic way an instrument separates.",
    },
    {
      id: "torque-set", kind: "turn", target: "rotary-motor",
      title: "Set the motor's torque and speed limit",
      cue: "Turn the motor dial to the torque and speed the file system is rated for.",
      why: "A torque-limited endodontic motor stops the file before the file breaks: set to the manufacturer's figure for that specific file system, it stalls or reverses when the flutes bind in a curve instead of twisting the instrument until it fails. Winding the torque up to get through a tight canal removes the one protection in the system, and the file that separates does so deep in the apical third where retrieving it may cost the tooth.",
      turn: { turns: 0.5, axis: "z", label: "TORQUE LIMIT" },
    },
    {
      id: "shape-canal", kind: "track", target: "rotary-handpiece", seconds: 10,
      title: "Keep the shaping pressure light and moving",
      cue: "Hold a light pecking motion at the measured length, in and out, never pressed in.",
      why: "Rotary shaping works on light, repeated in-and-out passes with the file always moving, because a file held still and pushed apically screws itself into the canal wall and is then fighting both the dentine and its own flutes. Steady light pressure cuts a smooth taper the fill can seal; hard pressure straightens curves, transports the canal away from its original path and loads the file until it fatigues. The canal is also re-irrigated between passes, so the debris the file loosens leaves rather than being packed toward the apex.",
      track: {
        start: 0.12, green: [0.34, 0.58], rise: 0.5, fall: 0.44, drift: 0.12, label: "APICAL PRESSURE",
        readout: (v) => (v < 0.34 ? "not engaging — no cutting" : v > 0.58 ? "too hard — file loading" : "light and moving"),
      },
      holdBreakNote: "The pressure went outside the band. Back off and keep the file moving — a loaded file in a curve is a file about to separate.",
    },
    {
      id: "obturate", kind: "drag", target: "master-cone",
      title: "Carry the master cone and sealer to the canal",
      cue: "Take the fitted master cone with sealer on it to the canal and seat it to the working length.",
      why: "Obturation is what makes the cleaning permanent: a fitted gutta-percha cone with sealer around it fills the shaped space so that bacteria have nowhere left to live and nothing can leak back in from the mouth or forward from the tissue. The cone is fitted to the same working length everything else was worked to, and the sealer is what fills the gap between a solid cone and a canal wall that is never perfectly round. A fill short of length leaves a space, and a fill past it puts material where the body has to deal with it.",
      drag: { to: "canal-socket", radius: 0.45, missNote: "Not seated in the canal. A cone that does not reach the working length leaves exactly the space the treatment was meant to close." },
    },
    {
      id: "file-count", kind: "select", target: "count-board",
      title: "Reconcile the file and sharps count",
      cue: "Count every file and needle back off the bracket against what went onto it, and dispose of them at the chair.",
      why: "Endodontic files are small, sharp and easy to lose, and the two ways they disappear are both serious: into the sharps stream uncounted, where the next person to handle the bag finds them, or off the bracket onto the floor and, occasionally, into a patient. Counting them off is also how a separated instrument is discovered at the chair rather than on a film weeks later. Sharps go straight into a container at the point of use, which is the control ISO 23908 and 29 CFR 1910.1030 both point at rather than carrying them anywhere.",
    },
    {
      id: "radiograph-read", kind: "find", noHint: true,
      targets: ["rad-void", "rad-short-fill"],
      itemNames: { "rad-void": "the void in the middle third", "rad-short-fill": "the fill sitting short of the length" },
      itemNotes: {
        "rad-void": "A dark gap inside the fill. A void is a space with nothing in it, and the whole point of obturation is that no such space is left — it is shown to the dentist before the patient is dismissed, not written up afterwards.",
        "rad-short-fill": "The fill stops a good two millimetres shy of where the locator said the canal ended. Short of length is untreated canal, and untreated canal is why a tooth comes back aching in six months.",
      },
      title: "Read the post-obturation radiograph",
      cue: "Find the two things on this film that mean the fill is not finished.",
      why: "The film after the fill is the only look anybody gets inside a sealed tooth, and it is taken to answer two specific questions: does the material reach the working length, and is it dense all the way with no gaps. Both defects on this film are correctable now, while the tooth is still open behind a dam, and neither is correctable in a fortnight. Reading it at the chair — and handing it to the dentist rather than filing it — is the difference between a treatment that is checked and one that is merely finished.",
    },
    {
      id: "team-checkin", kind: "select", target: "team-checkin",
      title: "Check in with the treating dentist and the next patient's assistant",
      cue: "Confirm the count, the irrigant used and anything that did not go to plan before the room turns over.",
      why: "The end of an endodontic visit carries information that goes stale within minutes: the final count, which irrigant and concentration went into the canal, whether the patient reported any taste or pain that could mean extrusion, and whether the operatory needs longer than the schedule allows to turn over. Saying it out loud to the person who will be in this room next is what keeps a rushed changeover from starting with a bracket somebody else set.",
    },
    {
      id: "endo-log", kind: "select", target: "endo-log",
      title: "Write the treatment record and hand over",
      cue: "Record the working length, the files used and counted, the irrigant, the fill and the review date, then hand over.",
      why: "The record of a root canal is what the next clinician works from when the tooth is restored, and when it is reviewed in a year: the measured working length, the file system and sizes taken to it, the irrigant and its concentration, the sealer and cone, the radiographs taken and the post-operative instructions given. It is also the only place a hypochlorite incident, a separated file or a dam that leaked would be written down, and a complication that is documented honestly at the visit is a complication the patient can be managed for rather than surprised by.",
    },
  ],

  interrupts: [
    {
      id: "hypochlorite-splash",
      kind: "Chemical exposure",
      after: "irrigate-hold", delay: 3, seconds: 14,
      alert: "The plunger jumped and a spray of sodium hypochlorite has gone up under the face shield into your eye — it is burning immediately.",
      cue: "Hypochlorite in the eye — get to the eyewash.",
      target: "eyewash-station",
      why: "Hypochlorite keeps damaging the surface of the eye for as long as it is in contact with it, so the only thing that helps is immediate flushing with the lids held open for a long, uninterrupted period — the fifteen minutes ANSI Z358.1 builds eyewash equipment around. Finishing the canal first, or rinsing at the operatory tap for a few seconds, is how a chemical splash becomes a corneal injury.",
      missNote: "You stayed at the canal with hypochlorite on the eye. Every second of contact is more surface damage, and the injury that follows is treated by an ophthalmologist rather than at this chair.",
      wrongNote: "It is the eyewash. Nothing at the bracket dilutes what is already on the eye, and the clock on this injury started the moment it landed.",
    },
    {
      id: "loose-file-on-drape",
      kind: "Sharps hazard",
      after: "shape-canal", delay: 3, seconds: 12,
      alert: "The file sponge has been knocked over — a used file is lying tip-up across the drape exactly where your forearm passes.",
      cue: "A used file is loose on the drape, tip up.",
      target: "sharps-container",
      why: "A contaminated file lying on a drape is a percutaneous injury waiting for the next reach across the chair, and endodontic files are fine enough that the stick is often noticed after the fact. It goes into the sharps container at the chair, one-handed, and then the count is corrected — not swept aside to be dealt with at the end of the visit.",
      missNote: "The file stayed on the drape. The next reach across the field is how an assistant ends up in the exposure protocol, with source testing and follow-up bloods, over an instrument that took two seconds to put away.",
      wrongNote: "It goes in the sharps container. Moving it somewhere else on the tray leaves a contaminated point loose in the working area and leaves the count wrong.",
    },
  ],

  supportLine: "A needlestick or a chemical splash goes straight to your practice's exposure protocol, and the state's occupational-health information line will talk a clinic worker through the follow-up testing free of charge.",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, ENDO_ACCENT);

    // A stainless splash-back texture behind the sterilisation run — the one
    // large flat surface in this room that is not a worktop.
    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, {
      base: "#cfd7dc", base2: "#bcc5cb",
    }), { repeat: 2, px: 256 });

    // --------------------------------------------------------------- the chair
    const chairBase = group(g, 0, 0, -1.0);
    cyl(chairBase, 0.23, 0.27, 0.1, 0, 0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.09, 0.1, 0.42, 0, 0.31, 0, ENDO_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const seatGroup = group(chairBase, 0, 0.52, 0);
    slab(seatGroup, 0.62, 0.14, 0.66, 0, 0, 0.28, ENDO_CHAIR, { radius: 0.07, rough: 0.6 });
    const chairBack = group(seatGroup, 0, 0.05, -0.22);
    slab(chairBack, 0.6, 0.9, 0.14, 0, 0.4, 0, ENDO_CHAIR, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = 0.44;
    slab(chairBack, 0.34, 0.24, 0.1, 0, 0.98, 0.02, ENDO_CHAIR, { radius: 0.06, rough: 0.6 });
    for (const sx of [-1, 1]) slab(seatGroup, 0.1, 0.06, 0.62, sx * 0.34, 0.09, 0.28, ENDO_STEEL, { radius: 0.02, rough: 0.4, metal: 0.6 });
    const patient = seatedFigure(seatGroup, 0, 0.08, 0.42, { skin: 0xd9ab84, cloth: 0x7f92a0 });
    patient.root.rotation.x = 0.44;
    patient.torso.rotation.x = -0.02;

    // The isolated tooth: dam sheet, frame, clamp and the access cavity.
    const damGroup = group(patient.head, 0.0, -0.02, 0.1);
    const damSheet = slab(damGroup, 0.12, 0.09, 0.005, 0, 0, 0, ENDO_DAM, { radius: 0.01, rough: 0.75 });
    damSheet.rotation.x = -0.25;
    reg2(damSheet, "dam-sheet");
    const damClamp = torus(damGroup, 0.012, 0.003, 0, 0.005, 0.006, ENDO_STEEL, { rough: 0.25, metal: 0.9, seg: 6, seg2: 14 });
    reg2(damClamp, "dam-clamp");
    const canalMark = ball(damGroup, 0.008, 0, 0.005, 0.012, 0x2a1a1e, { rough: 0.6 });
    reg2(canalMark, "canal-socket");
    const damFrame = group(damGroup, 0, 0, -0.01);
    for (const sx of [-1, 1]) cyl(damFrame, 0.004, 0.004, 0.1, sx * 0.075, 0, 0, 0xf2c14b, { rough: 0.5, seg: 6 });
    for (const sy of [-1, 1]) {
      const bar = cyl(damFrame, 0.004, 0.004, 0.15, 0, sy * 0.05, 0, 0xf2c14b, { rough: 0.5, seg: 6 });
      bar.rotation.z = Math.PI / 2;
    }
    reg2(damFrame, "dam-frame");
    const patientGlasses = group(patient.head, 0, 0.03, 0.07);
    for (const sx of [-1, 1]) torus(patientGlasses, 0.022, 0.004, sx * 0.03, 0, 0, 0xdfe8ee, { rough: 0.2, metal: 0.3, seg: 6, seg2: 16 });
    box(patientGlasses, 0.03, 0.006, 0.006, 0, 0, 0, 0xdfe8ee, { rough: 0.3 });
    reg2(patientGlasses, "patient-glasses");

    // --------------------------------------------------------- bracket tray
    const bracket = group(g, -0.72, 0, -0.5, 0.35);
    cyl(bracket, 0.05, 0.06, 0.72, 0, 0.36, 0, ENDO_STEEL, { rough: 0.3, metal: 0.75, seg: 12 });
    const trayTop = slab(bracket, 0.48, 0.03, 0.32, 0.1, 0.73, 0, 0xf2f5f7, { radius: 0.02, rough: 0.35, metal: 0.1 });
    void trayTop;
    // The numbered file sponge: three files in ascending size, each in a slot.
    const fileSponge = group(bracket, 0.02, 0.755, -0.06);
    box(fileSponge, 0.16, 0.02, 0.07, 0, 0, 0, 0xe7d9f2, { rough: 0.8 });
    const file10 = group(fileSponge, -0.05, 0.03, 0);
    cyl(file10, 0.0012, 0.0008, 0.06, 0, 0, 0, ENDO_STEEL, { rough: 0.2, metal: 0.9, seg: 6 });
    cyl(file10, 0.005, 0.005, 0.02, 0, -0.04, 0, 0xb583e0, { rough: 0.5, seg: 8 });
    reg2(file10, "hand-file-10");
    const file15 = group(fileSponge, 0, 0.03, 0);
    cyl(file15, 0.0016, 0.001, 0.06, 0, 0, 0, ENDO_STEEL, { rough: 0.2, metal: 0.9, seg: 6 });
    cyl(file15, 0.005, 0.005, 0.02, 0, -0.04, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    reg2(file15, "hand-file-15");
    const rotaryFile = group(fileSponge, 0.05, 0.03, 0);
    cyl(rotaryFile, 0.0022, 0.0012, 0.06, 0, 0, 0, 0xd8c98f, { rough: 0.2, metal: 0.85, seg: 6 });
    cyl(rotaryFile, 0.006, 0.006, 0.02, 0, -0.04, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    reg2(rotaryFile, "rotary-file");
    // The loose file the interruption knocks onto the drape.
    const looseFile = group(bracket, 0.2, 0.755, 0.1, 0.4);
    cyl(looseFile, 0.0016, 0.001, 0.06, 0, 0, 0, ENDO_STEEL, { rough: 0.25, metal: 0.85, seg: 6 });
    looseFile.visible = false;

    // The irrigant syringe with its side-vented needle, and the unlabelled twin.
    const irrigSyringe = group(bracket, 0.16, 0.77, -0.08, 0.5);
    cyl(irrigSyringe, 0.012, 0.012, 0.1, 0, 0, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.7, seg: 12 });
    irrigSyringe.rotation.z = Math.PI / 2;
    cyl(irrigSyringe, 0.0015, 0.0015, 0.035, 0.066, 0, 0, 0xb8c0c6, { rough: 0.3, metal: 0.8, seg: 6 }).rotation.z = Math.PI / 2;
    box(irrigSyringe, 0.03, 0.012, 0.012, -0.02, 0, 0.012, 0xf2c14b, { rough: 0.5 });
    reg2(irrigSyringe, "irrigant-syringe");
    const unlabeledSyringe = group(bracket, 0.24, 0.77, -0.02, -0.4);
    cyl(unlabeledSyringe, 0.011, 0.011, 0.09, 0, 0, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.7, seg: 12 });
    unlabeledSyringe.rotation.z = Math.PI / 2;
    holoTag(unlabeledSyringe, "No label", 0, 0.06, 0, { css: "#f0645b", w: 0.24 });
    reg2(unlabeledSyringe, "unlabeled-irrigant");
    const openBeaker = group(bracket, -0.1, 0.78, 0.1);
    cyl(openBeaker, 0.03, 0.026, 0.05, 0, 0, 0, 0xdfe8ee, { rough: 0.15, opacity: 0.5, seg: 14 });
    cyl(openBeaker, 0.026, 0.026, 0.03, 0, -0.008, 0, 0xd8f0c0, { rough: 0.3, opacity: 0.75, seg: 14 });
    holoTag(openBeaker, "Open — unlabelled", 0, 0.07, 0, { css: "#f0645b", w: 0.38 });
    reg2(openBeaker, "bare-hypochlorite-beaker");
    const plainNeedle = group(bracket, 0.06, 0.765, 0.12, 0.8);
    cyl(plainNeedle, 0.0015, 0.0015, 0.04, 0, 0, 0, 0xf0645b, { rough: 0.3, metal: 0.8, seg: 6 });
    plainNeedle.rotation.z = Math.PI / 2;
    holoTag(plainNeedle, "Open end", 0, 0.05, 0, { css: "#f0645b", w: 0.24 });
    reg2(plainNeedle, "plain-needle-tip");
    const cottonRolls = group(bracket, -0.06, 0.765, -0.12);
    for (let i = 0; i < 3; i++) {
      const roll = cyl(cottonRolls, 0.007, 0.007, 0.036, -0.02 + i * 0.02, 0, 0, 0xf6f2ea, { rough: 0.85, seg: 8 });
      roll.rotation.z = Math.PI / 2;
    }
    holoTag(cottonRolls, "Instead of the dam?", 0, 0.06, 0, { css: "#f0645b", w: 0.42 });
    reg2(cottonRolls, "cotton-roll-shortcut");

    // ------------------------------------------------------- endodontic cart
    const cart = group(g, 1.25, 0, -0.55, -0.45);
    box(cart, 0.46, 0.8, 0.36, 0, 0.4, 0, 0x3a4148, { rough: 0.5, metal: 0.25 });
    for (let i = 0; i < 3; i++) box(cart, 0.42, 0.02, 0.02, 0, 0.2 + i * 0.2, 0.19, 0x8b929a, { rough: 0.4, metal: 0.5 });
    const apexLocator = instrument(cart, -0.1, 0.84, 0.02, { w: 0.15, d: 0.2, idle: "-- mm", color: ENDO_ACCENT, ry: 0.2 });
    reg2(apexLocator, "apex-locator");
    const motorHead = group(cart, 0.14, 0.86, 0.04);
    slab(motorHead, 0.16, 0.1, 0.12, 0, 0, 0, ENDO_CABINET, { radius: 0.02, rough: 0.4, metal: 0.15 });
    const motorDial = cyl(motorHead, 0.025, 0.025, 0.018, 0, 0.02, 0.06, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 16 });
    motorDial.rotation.x = Math.PI / 2;
    const motorScreen = decal(motorHead, 0.1, 0.04, 0, 0.052, -0.01,
      signFace("TORQUE --", { bg: "#1a1226", accent: "#b583e0", fg: "#ece0fa", scale: 0.4 }), { px: 192, glow: true, ei: 0.7 });
    motorScreen.rotation.x = -Math.PI / 2;
    reg2(motorDial, "rotary-motor");
    const rotaryHandpiece = group(cart, 0.1, 0.72, 0.18, -0.3);
    cyl(rotaryHandpiece, 0.016, 0.02, 0.15, 0, 0, 0, 0x2f3740, { rough: 0.4, metal: 0.4, seg: 12 });
    const liveFile = cyl(rotaryHandpiece, 0.002, 0.001, 0.04, 0.008, 0.095, 0, ENDO_STEEL, { rough: 0.15, metal: 0.9, seg: 6 });
    rotaryHandpiece.rotation.z = 0.35;
    hose(cart, [[0.1, 0.72, 0.18], [0.05, 0.6, 0.24], [0, 0.5, 0.18]], 0.01, 0x2b3138, { steps: 10, rough: 0.7 });
    reg2(rotaryHandpiece, "rotary-handpiece");
    const masterCone = group(cart, -0.16, 0.86, 0.14);
    cyl(masterCone, 0.0035, 0.0012, 0.05, 0, 0, 0, 0xf0a35b, { rough: 0.6, seg: 8 });
    box(masterCone, 0.04, 0.004, 0.03, 0, -0.026, 0, 0xe4ecef, { rough: 0.5, cast: false });
    reg2(masterCone, "master-cone");
    const alcoholFlame = group(g, 1.75, 0, -0.1, 0.3);
    cyl(alcoholFlame, 0.035, 0.04, 0.08, 0, 0.96, 0, 0xb8c0c6, { rough: 0.4, metal: 0.6, seg: 14 });
    const flameCone = cyl(alcoholFlame, 0.001, 0.016, 0.07, 0, 1.03, 0, 0xffb347, { emissive: 0xffb347, ei: 1.8, rough: 0.4, seg: 10, cast: false });
    box(alcoholFlame, 0.24, 0.9, 0.24, 0, 0.45, 0, 0x4a545a, { rough: 0.6 });
    holoTag(alcoholFlame, "Open flame at the chair", 0, 1.12, 0, { css: "#f0645b", w: 0.46 });
    reg2(alcoholFlame, "alcohol-flame");

    // ------------------------------------------------------------- eyewash bay
    const eyewash = group(g, -1.95, 0, 0.35, 0.7);
    box(eyewash, 0.36, 0.06, 0.3, 0, 0.92, 0, 0xdfe4e8, { rough: 0.35, metal: 0.2 });
    cyl(eyewash, 0.04, 0.05, 0.9, 0, 0.45, 0.1, 0x59a86b, { rough: 0.5, metal: 0.3, seg: 12 });
    for (const sx of [-1, 1]) {
      const bowl = cyl(eyewash, 0.035, 0.02, 0.03, sx * 0.07, 0.97, -0.02, 0x59c97b, { rough: 0.4, seg: 12 });
      void bowl;
    }
    const eyewashPaddle = box(eyewash, 0.16, 0.03, 0.06, 0, 0.9, 0.14, 0xf2c14b, { rough: 0.5 });
    const eyewashSign = decal(eyewash, 0.22, 0.12, 0, 1.28, 0.08,
      signFace("EYEWASH", { bg: "#0f4a22", accent: "#8fe6a0", fg: "#ffffff", scale: 0.45 }), { px: 256 });
    reg2(eyewash, "eyewash-station");
    const eyewashSpray = particles(eyewash, 18, 0xcfeef8, { size: 0.01, life: 0.4, additive: false, opacity: 0.6 });
    eyewashSpray.visible = false;
    const untaggedTag = decal(eyewash, 0.09, 0.12, 0.16, 1.0, 0.06,
      paperFace("TEST LOG", ["Last run:", "-- / --"], { bg: "#efe6c9", worn: true }), { px: 160 });
    untaggedTag.rotation.z = 0.12;
    reg2(untaggedTag, "eyewash-untagged");

    // ------------------------------------------------- sterilisation counter
    const sterileRun = counter(g, 1.8, 0.5, 1.35, -1.85, 0xdfe4e8, { ry: 0.3 });
    const splash = box(sterileRun, 1.7, 0.4, 0.03, 0, 1.15, -0.24, 0xcfd7dc, { rough: 0.4, metal: 0.4 });
    splash.material = texturedMat(steelTex, { rough: 0.45, metal: 0.5, color: 0xffffff });
    const sharpsBin = group(sterileRun, -0.62, 0.95, 0.04);
    box(sharpsBin, 0.16, 0.24, 0.13, 0, 0.12, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsBin, 0.12, 0.02, 0.09, 0, 0.25, 0, 0xf2c14b, { rough: 0.5 });
    decal(sharpsBin, 0.13, 0.06, 0, 0.16, 0.066, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#fff", scale: 0.5 }), { px: 160 });
    reg2(sharpsBin, "sharps-container");
    const countBoard = group(sterileRun, 0.1, 0.96, 0.02, -0.2);
    box(countBoard, 0.24, 0.02, 0.18, 0, 0, 0, 0xf2f5f7, { rough: 0.5 });
    decal(countBoard, 0.2, 0.14, 0, 0.012, 0,
      paperFace("FILE COUNT", ["On: 10 / 15 / R", "Off: --", "Sharps: at chair"], { bg: "#f6f7f2" }), { px: 256 }).rotation.x = -Math.PI / 2;
    reg2(countBoard, "count-board");
    const damStock = group(sterileRun, 0.62, 0.96, 0.06, 0.2);
    for (let i = 0; i < 3; i++) box(damStock, 0.14, 0.008, 0.11, 0, i * 0.01, 0, ENDO_DAM, { rough: 0.75, cast: false });
    const pinholeSheet = box(damStock, 0.14, 0.008, 0.11, 0.02, 0.04, 0.02, 0x4f7f9c, { rough: 0.75 });
    holoTag(damStock, "Pinhole", 0, 0.1, 0, { css: "#f0645b", w: 0.22 });
    reg2(pinholeSheet, "dam-pinhole");

    // ------------------------------------------------------- wall paperwork
    const endoChart = holoPanel(g, 0.58, 0.42, -2.2, 1.5, -1.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(16,10,26,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b583e0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e8d9f7";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ENDODONTIC CHART — 46", w * 0.06, h * 0.15);
      ctx.fillStyle = "#f4ecfd";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Cold test: no response", "Percussion: tender", "Canals: mesial x2, distal", "Curvature: moderate mesial",
        "Estimated length: 20 mm", "Allergies: none noted"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.32 + i * h * 0.12));
    }, { ry: 0.6, accent: ENDO_ACCENT });
    reg2(endoChart, "endo-chart");

    const filmViewer = holoPanel(g, 0.5, 0.36, 0.95, 1.52, -1.85, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,10,14,0.95)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fa8b8"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#c9d6de";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("POST-FILL FILM", w / 2, h * 0.14);
      // A crude root outline with the two defects the step asks for.
      ctx.strokeStyle = "#7f8f9a"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.3); ctx.lineTo(w * 0.46, h * 0.86);
      ctx.lineTo(w * 0.56, h * 0.86); ctx.lineTo(w * 0.6, h * 0.3); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = "#e8eef2"; ctx.fillRect(w * 0.47, h * 0.34, w * 0.08, h * 0.4);
    }, { ry: -0.15, accent: 0x8fa8b8 });
    const radVoid = decal(filmViewer, 0.07, 0.06, -0.06, 0.0, 0.01,
      signFace("VOID", { bg: "#1a1014", accent: "#f0645b", scale: 0.4 }), { px: 128 });
    reg2(radVoid, "rad-void");
    const radShort = decal(filmViewer, 0.09, 0.06, 0.09, -0.1, 0.01,
      signFace("SHORT", { bg: "#1a1014", accent: "#f0a35b", scale: 0.4 }), { px: 128 });
    reg2(radShort, "rad-short-fill");

    const teamBoard = holoPanel(g, 0.44, 0.3, -1.55, 1.82, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ROOM HANDOVER", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Count · irrigant · turnover", w / 2, h * 0.66);
    }, { ry: 0.3, accent: 0x4fd1ff });
    reg2(teamBoard, "team-checkin");

    const endoLog = holoPanel(g, 0.52, 0.36, 1.85, 1.46, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(14,10,22,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b583e0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e8d9f7";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("TREATMENT RECORD", w / 2, h * 0.24);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Length · files · irrigant", w / 2, h * 0.52);
      ctx.fillText("Fill · films · review", w / 2, h * 0.72);
    }, { ry: -1.1, accent: ENDO_ACCENT });
    reg2(endoLog, "endo-log");

    // ------------------------------------------------------------- furniture
    cabinet(g, 0.9, 0.5, 0.3, 1.4, 1.7, -1.9, ENDO_CABINET, { doorColor: 0xd6dee2 });
    const stockCab = equipmentCabinet(g, 0.8, 0.9, 0.44, -2.4, -0.55, { ry: 0.9, color: ENDO_CABINET, doorColor: ENDO_CABINET, rough: 0.4, metal: 0.1, weathered: false, lines: ["ENDO", "STOCK"] });
    void stockCab;
    const opStool = group(g, 0.55, 0, 0.85, -0.5);
    cyl(opStool, 0.19, 0.2, 0.05, 0, 0.03, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(opStool, 0.03, 0.035, 0.5, 0, 0.29, 0, ENDO_STEEL, { rough: 0.3, metal: 0.8, seg: 12 });
    slab(opStool, 0.36, 0.09, 0.34, 0, 0.58, 0, 0x4d3f6b, { radius: 0.1, rough: 0.65 });
    const waste = group(g, -1.5, 0, 1.3, 0.2);
    cyl(waste, 0.14, 0.16, 0.34, 0, 0.17, 0, 0x4a545a, { rough: 0.7, seg: 14 });
    cyl(waste, 0.15, 0.15, 0.02, 0, 0.35, 0, 0x2b3138, { rough: 0.5, seg: 14 });

    const opLight = group(g, 0, 0, -1.0);
    cyl(opLight, 0.02, 0.02, 1.0, -0.6, 1.95, 0, ENDO_STEEL, { rough: 0.3, metal: 0.8, seg: 10 });
    const lampBody = group(opLight, -0.06, 1.88, 0.06);
    cyl(lampBody, 0.15, 0.12, 0.07, 0, 0, 0, 0xe4ecef, { rough: 0.3, metal: 0.4, seg: 18 });
    const lampFace = cyl(lampBody, 0.12, 0.12, 0.01, 0, -0.04, 0, 0xfff6e0, { emissive: 0xfff6e0, ei: 1.4, rough: 0.2, seg: 18, cast: false });
    cyl(opLight, 0.016, 0.016, 0.6, -0.3, 2.02, 0, ENDO_STEEL, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;

    standingFigure(g, 2.3, 0.4, { ry: -1.6, cloth: 0x5a4a8c, skin: 0xc89a70 });
    standingFigure(g, -2.6, 0.1, { ry: 1.7, cloth: 0x4aa6a0 });

    const key = new THREE.DirectionalLight(0xf8fbff, 0.82);
    key.position.set(2.2, 4.4, 3.0);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf0f0fa, 0x464e58, 0.92));

    let flushing = false;
    let shaping = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.1, -0.7),

      onStepComplete(step) {
        if (step.id === "dam-isolation") {
          damSheet.material = mat(0x2f6f8c, { rough: 0.75 });
          damFrame.rotation.z = 0.05;
        }
        if (step.id === "working-length") {
          repaint(apexLocator.userData.screen, signFace("20.1 mm", { bg: "#1a1226", accent: "#59c97b", fg: "#ece0fa", scale: 0.5 }));
        }
        if (step.id === "torque-set") repaint(motorScreen, signFace("TORQUE SET", { bg: "#1a1226", accent: "#59c97b", fg: "#ece0fa", scale: 0.35 }));
        if (step.id === "shape-canal") shaping = true;
        if (step.id === "obturate") { masterCone.position.set(0, 0.003, 0.016); damGroup.add(masterCone); }
        if (step.id === "file-count") repaint(countBoard.children[1], paperFace("FILE COUNT", ["On: 10 / 15 / R", "Off: 10 / 15 / R", "Reconciled"], { bg: "#eef6ee" }));
      },

      onInterrupt(it) {
        if (it.id === "hypochlorite-splash") {
          repaint(eyewashSign, signFace("USE NOW", { bg: "#5a1210", accent: "#ffd2ce", fg: "#ffffff", scale: 0.45 }));
          flameCone.visible = false;
          irrigSyringe.rotation.z = Math.PI / 2 + 0.6;
        }
        if (it.id === "loose-file-on-drape") {
          looseFile.visible = true;
          looseFile.rotation.z = 1.1;
          fileSponge.rotation.z = 0.35;
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hypochlorite-splash") {
          flushing = true;
          eyewashPaddle.rotation.x = -0.9;
          eyewashSpray.visible = true;
          repaint(eyewashSign, signFace("FLUSHING", { bg: "#0f4a22", accent: "#8fe6a0", fg: "#ffffff", scale: 0.45 }));
          flameCone.visible = true;
          irrigSyringe.rotation.z = Math.PI / 2;
        }
        if (it.id === "loose-file-on-drape") {
          looseFile.visible = false;
          fileSponge.rotation.z = 0;
          sharpsBin.rotation.y = 0.2;
        }
      },

      animate(t, dt, session) {
        patient.head.rotation.y = 0.04 + Math.sin(t * 0.32) * 0.03;
        patient.torso.position.y = Math.sin(t * 1.0) * 0.003;
        lampFace.material.emissiveIntensity = 1.3 + Math.sin(t * 0.7) * 0.05;
        flameCone.scale.y = 1 + Math.sin(t * 7) * 0.12;
        if (shaping) liveFile.rotation.y = t * 12;

        if (flushing) {
          eyewashSpray.userData.step(dt, new THREE.Vector3(0, 0.98, 0.04), 0.03, 0.4, -1.3);
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "working-length") {
          repaint(apexLocator.userData.screen, signFace(`${(17 + gg.t * 6).toFixed(1)}`, {
            bg: "#1a1226", accent: gg.t >= 0.38 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#ece0fa", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "shape-canal") {
          const good = tr.v >= 0.34 && tr.v <= 0.58;
          liveFile.material = mat(good ? 0x59c97b : 0xf0645b, { emissive: good ? 0x59c97b : 0xf0645b, ei: 1.2, rough: 0.2, metal: 0.8 });
          rotaryHandpiece.rotation.z = 0.35 - tr.v * 0.12;
        }
        if (session?.turn && session.step?.id === "torque-set") {
          motorDial.rotation.y = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
