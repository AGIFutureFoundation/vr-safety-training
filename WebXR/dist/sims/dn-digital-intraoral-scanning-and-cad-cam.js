import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Digital Intraoral Scanning & CAD/CAM VR — Dental & Oral Health.
//
// The digital side of a restorative appointment, from the assistant's chair:
// a reprocessed scanner tip seated and the scanner proved ready, the room's
// light brought down so it stops washing out the optics, a full-arch scan
// walked along one path, the margin checked on the screen before anybody
// designs to it, the crown laid out on the screen in order, a block milled
// behind a closed door, the sprue finished wet under extraction, and the file
// kept inside the record system the practice already secures.
//
// Sited generically: no real scanner, mill or software is named, and nothing
// here invents a duty. Whether an assistant may take the scan at all is the
// state dental board's allowable-duties list; the design is approved and the
// crown seated by the dentist. The Unspoken Smiles programme is named only as
// the programme this platform is built for — it is not described here.

const DSC_ACCENT = 0x6ec3e8;
const DSC_CSS = "#6ec3e8";
const DSC_ALERT = "#f0645b";
const DSC_CAB = 0xe6ecef;

export const SIM_DN_DIGITAL_INTRAORAL_SCANNING_AND_CAD_CAM = {
  id: "dn-digital-intraoral-scanning-and-cad-cam",
  index: "318",
  domain: "Dental",
  trade: "Dental assistant — digital scanning and chairside CAD/CAM (expanded-function assistant where the state allows it)",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The state dental board's allowable-duties list for assistants, which decides whether an assistant may take a digital impression at all and under what supervision; the ADA's guidance on the dental team and the ADA's CDT code set for the restoration the dentist records; the CDC's dental infection-control guidelines for a semi-critical scanner tip reprocessed to its manufacturer's instructions; OSHA 29 CFR 1910.1030 bloodborne pathogens for the saliva and blood the tip carries; NIOSH guidance on dust from grinding milled ceramic; HIPAA's privacy and security rules for a scan file that identifies a person; SEIU and UFCW clinic and dental staff; Unspoken Smiles, the programme this platform is built for",
  name: "Digital Intraoral Scanning & CAD/CAM",
  title: simTitle("Digital Intraoral Scanning & CAD/CAM"),
  tagline: "A crown made in one visit, done properly: a reprocessed tip, a scanner proved ready, one steady scan path, a margin checked before anybody designs to it, a block milled behind a closed door and a file that never leaves the record",
  accent: DSC_ACCENT,
  accentCss: DSC_CSS,
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "one-visit-crown", name: "One-Visit Crown", note: "A scan, a margin check, a design and a mill carried end to end without a remake" },
  supportLine: "your clinic's employee assistance line, or the lead assistant you debrief with — a long restorative day at the scanner is tiring work",

  game: system({
    name: "Digital Chairside",
    currency: "SCAN",
    ranks: ["Assisting Student", "Scanning Assistant", "CAD/CAM Assistant", "Digital Lead", "Digital Chairside Certified"],
    badges: [
      { id: "margin-read", name: "Margin Read", note: "Both margin faults found before the design began", test: AWARD.stepClean("dsc-margin-check") },
      { id: "clean-chain", name: "Clean Chain", note: "No unsafe action anywhere in the appointment", test: AWARD.safe },
      { id: "steady-wand", name: "Steady Wand", note: "The scan path and the mill door carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "no-remake", name: "No Remake", note: "No corrections anywhere in the appointment", test: AWARD.clean },
      { id: "light-right", name: "Light Right", note: "The operatory light set near the middle of its band", test: AWARD.precise(0.72) },
      { id: "chair-time", name: "Chair Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dsc-uncleaned-tip": "That tip is still in the holder from the last patient, fogged and unbagged. A scanner tip goes into mouth after mouth and touches saliva and often blood, which makes it a semi-critical device under the CDC's dental guidelines: it is reprocessed to its manufacturer's instructions or replaced between patients, and a tip that has only been wiped carries the last person's mouth into this one.",
    "dsc-dry-trim": "That is the dry grinding wheel on the open bench, with the extraction switched off. Milled ceramic ground dry throws a fine dust straight into the breathing zone of whoever is holding it, and the chips fly at the face; the sprue is finished wet, behind a shield, with the local extraction running, which is what NIOSH's dust guidance and plain sense both ask.",
    "dsc-latex-box": "That is a box of latex examination gloves, and this patient's chart carries a latex allergy flag. A latex allergy runs from a rash to anaphylaxis, and the reaction is to the proteins on the glove, so the only safe glove at this chair is the non-latex one from the dispenser — picked before anybody touches the patient, not swapped after their lips start to swell.",
    "dsc-personal-usb": "That is somebody's personal memory stick, offered to carry the scan file home to finish the design. A full-arch scan with a name on it is identifiable health information under HIPAA, and an unencrypted stick in a bag is the commonest way a small practice loses a record — the file stays in the practice's secured system and goes to a laboratory only through the portal the practice has an agreement with.",
  },

  lateNotes: {
    "dsc-record-archive": "Not yet. The scan is archived once it is a scan worth keeping — after the margin has been checked and the design is done, not while it is still being captured.",
    "dsc-crew-checkin": "The dentist has nothing to approve yet. The check-in happens with a finished, milled restoration on the tray, not before the block is even cut.",
    "dsc-case-log": "The appointment is not over. The record is written from what actually happened — the tip, the block lot and the cycle — at the end.",
  },

  steps: [
    {
      id: "dsc-tip-mount", kind: "select", target: "dsc-tip-pouch", noRobot: false,
      title: "Seat a reprocessed scanner tip from a sealed pouch",
      cue: "Open a sealed, reprocessed tip in front of the patient and seat it on the wand.",
      why: "The scanner tip is the only part of a very expensive camera that goes into the mouth, so it is the part the infection-control chain is built around. A tip from a sealed, indicator-changed pouch is a tip that went through the manufacturer's reprocessing cycle; one taken off the holder is a guess. Opening it where the patient can see it is also the first moment they learn this office does things properly — and that habit is exactly what gets an assistant trusted with the scanner, which is the door into digital dentistry.",
    },
    {
      id: "dsc-precheck", kind: "find", noHint: true, noRobot: false,
      targets: ["dsc-cal-overdue", "dsc-heater-cold"],
      itemNames: { "dsc-cal-overdue": "the calibration-overdue flag", "dsc-heater-cold": "the tip heater still cold" },
      itemNotes: {
        "dsc-cal-overdue": "The scanner's calibration is past due. An uncalibrated scanner stitches a slightly wrong arch without warning anyone, and a crown designed to it rocks on the tooth — the calibration takes two minutes with the target the manufacturer supplies.",
        "dsc-heater-cold": "The tip heater has not come up to temperature. A cold mirror fogs the instant it meets a warm breath, and a fogged scan is a scan full of holes the software quietly fills with guesses.",
      },
      title: "Find the two things that would ruin the scan before it starts",
      cue: "Two things on the scanner cart will spoil this scan. Find both before the wand goes near the patient.",
      why: "A digital impression fails silently. The software always produces a model, and a model built from a fogged mirror or an uncalibrated sensor looks perfectly plausible on the screen until the crown will not seat. The two minutes spent calibrating and warming the tip are the difference between one visit and a remake appointment, and an assistant who checks the machine before trusting it is the one a practice lets run its digital workflow on their own.",
    },
    {
      id: "dsc-light-down", kind: "gauge", target: "dsc-light-dimmer", noRobot: false,
      title: "Bring the operatory light down so it stops washing out the optics",
      cue: "Turn the overhead light down until the arch is lit by the scanner, not flooded by the lamp.",
      gauge: {
        label: "OPERATORY LIGHT", speed: 0.62, green: [0.28, 0.48],
        readout: (t) => (t < 0.28 ? "too dark to see the field" : t > 0.48 ? "glare — optics washed out" : "scanner light leading"),
        missNote: "Outside the band. Too bright and the lamp's glare swamps the scanner's own light; too dark and you cannot see the field to keep the wand where it belongs.",
      },
      why: "An optical scanner reads the light it projects onto the teeth, and a bright operatory lamp swamps it with glare and reflection off wet enamel, which the software reads as gaps. Too dark, and the operator loses the field. The right setting is low enough that the scanner's own light leads and bright enough that you can still see soft tissue, and learning to read that is one of the small practical skills that separates a trained digital assistant from somebody who has only watched a demonstration.",
    },
    {
      id: "dsc-scan-path", kind: "track", target: "dsc-scan-wand", seconds: 9,
      noRobot: true,
      robotNote: "Intraoral. The scanner wand goes into a live patient's mouth, so the scan is always the clinician's; the robot stages the cart and the light around it.",
      title: "Walk the scan along one path: occlusal, then lingual, then buccal",
      cue: "Keep the wand moving at an even pace along the arch — occlusal first, then the tongue side, then the cheek side.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "SCAN PACE",
        readout: (v) => (v < 0.38 ? "lingering — stitching errors building" : v > 0.62 ? "too fast — data holes" : "even pace, full capture"),
      },
      holdBreakNote: "The scan path broke. Go back to the last good tooth and pick the path up from there — the software stitches overlapping frames, not jumps.",
      why: "The scanner builds the arch by stitching overlapping frames, so the path matters as much as the pictures. Occlusal first gives the software a clear spine to stitch the rest to; lingual and buccal follow while it still knows where it is. Move too fast and there are holes; linger or jump about and the stitching drifts, so the far molar ends up a fraction out of place. A clean full-arch scan is a genuinely marketable skill, and in many states it is one of the expanded functions an assistant is paid more to perform.",
    },
    {
      id: "dsc-tip-return", kind: "select", target: "dsc-reprocess-cassette", noRobot: false,
      title: "Send the used tip back to reprocessing in its own cassette",
      cue: "Take the used tip off the wand and drop it in the closed reprocessing cassette for the sterilisation room.",
      why: "A used tip is contaminated the moment it leaves the mouth, and where it goes next decides whether the chain holds. The closed cassette carries it to the processing room without anybody handling it on the way, where it is cleaned and reprocessed to its manufacturer's instructions before it is bagged again. Leave it on the cart and it becomes the next patient's unbagged tip. Knowing how a device travels through the sterilisation chain is what lets an assistant move between the chair and the processing room — two careers, not one.",
    },
    {
      id: "dsc-margin-check", kind: "find", noHint: true, noRobot: false,
      targets: ["dsc-margin-void", "dsc-margin-tissue"],
      itemNames: { "dsc-margin-void": "a data hole at the distal margin", "dsc-margin-tissue": "tissue collapsed over the buccal margin" },
      itemNotes: {
        "dsc-margin-void": "There is a hole in the data right at the distal margin. The software has bridged it with a smooth guess, and a crown designed to a guessed margin is open there — the one place decay will start again.",
        "dsc-margin-tissue": "The gingiva has collapsed over the buccal margin, so the scan shows soft tissue where the finish line should be. That margin has to be re-exposed and rescanned by the operator; designing to it builds a crown that stops short of the preparation.",
      },
      title: "Check the margin on the screen before anybody designs to it",
      cue: "Rotate the model and find the two places where the margin is not really there.",
      why: "Everything downstream is built to the margin: the design, the mill path and the fit on the tooth. A scan can look immaculate from the front and still have a hole at the distal finish line or gum tissue lying over it, and the only time to catch that is now, while the patient is still in the chair and a rescan takes a minute rather than a whole new appointment. Reading margins on a screen is the skill laboratories and specialty practices hire digital assistants and technicians for.",
    },
    {
      id: "dsc-design-order", kind: "sequence", noRobot: false,
      targets: ["dsc-design-margin", "dsc-design-axis", "dsc-design-thickness"],
      itemNames: {
        "dsc-design-margin": "trace the margin line",
        "dsc-design-axis": "set the insertion axis",
        "dsc-design-thickness": "check the minimum thickness",
      },
      outOfOrderNote: "Out of order. The margin is traced first because everything else is measured from it; the axis follows, and the thickness check comes last because the axis changes it.",
      title: "Lay the crown out on the screen in order",
      cue: "Trace the margin, set the path of insertion, then check the material's minimum thickness — in that order.",
      why: "CAD software will happily let you do these in any order, and every one done early is undone by the next. The margin line defines the edge of the restoration; the insertion axis decides which undercuts matter; the minimum thickness check only means something once both are set, because the material's own minimum is what stops it cracking in function. The dentist approves the design, but an assistant who lays it out cleanly is the one who ends up running the practice's digital workflow.",
    },
    {
      id: "dsc-block-in", kind: "drag", target: "dsc-block", noRobot: false,
      drag: { to: "dsc-mill-chuck", radius: 0.4, missNote: "That is not the chuck. Carry the block to the mill's holder and seat it on the spindle side, with its shade label facing out." },
      title: "Carry the block of the prescribed shade and material to the mill",
      cue: "Take the block that matches the design's material and the shade the dentist chose, and seat it in the mill's holder.",
      why: "The block is where a digital design becomes a physical object, and it is also where the wrong decision is hardest to see afterwards. The material has to be the one the design was set up for, because minimum thickness and mill strategy depend on it, and the shade has to match what the dentist chose with the patient. The block's lot number goes in the record. A mill operator who reads the label before seating the block is the one a laboratory keeps on its milling line.",
    },
    {
      id: "dsc-block-screw", kind: "turn", target: "dsc-holder-screw", noRobot: false,
      turn: { turns: 1.25, axis: "z", label: "HOLDER SCREW" },
      title: "Torque the holder screw so the block cannot chatter",
      cue: "Turn the holder screw until the block is seated hard against its stop.",
      why: "A block that is not seated hard against its stop moves under the burs, and a moving block produces a crown that is slightly the wrong shape everywhere and chipped at the margin where it vibrated. The holder screw is the only thing resisting the cutting forces of two burs spinning at tens of thousands of revolutions a minute. Setting it by feel, every time, is the kind of bench discipline that makes a milling technician worth their wage.",
    },
    {
      id: "dsc-mill-door", kind: "hold", target: "dsc-mill-door-latch", seconds: 6, noRobot: false,
      title: "Hold the mill door until the interlock latches and the coolant runs",
      cue: "Close the door and hold it until the interlock clicks and coolant is running over the burs.",
      holdBreakNote: "You let go before the interlock latched. The cycle will not start — or worse, on a worn latch it starts with the door able to open. Close it again and hold.",
      why: "The mill's door interlock is what keeps coolant, ceramic chips and a broken bur inside the machine, and it only protects anybody once it has actually latched. Holding the door until the latch clicks and coolant is visibly running also proves the coolant reached the burs, because a mill cutting dry overheats the block and cracks it. Treating a machine's guard as something to confirm rather than assume is the habit every trade with a mill in it asks of its people.",
    },
    {
      id: "dsc-record-archive", kind: "select", target: "dsc-record-archive", noRobot: false,
      title: "Archive the scan in the patient record, not on the scanner",
      cue: "Save the scan and the design into the practice's record system and clear them off the scanner's local drive.",
      why: "The scanner keeps a local copy of everything it captures, and a cart that is wheeled between rooms or sent away for service is a cart full of identifiable scans. HIPAA's security rule expects the practice to know where its records live and to protect them there. Archiving to the record system and clearing the cart means the scan is backed up, attributable and gone from the one place nobody is watching — the kind of routine a practice looks for when it promotes someone to run its technology.",
    },
    {
      id: "dsc-wet-finish", kind: "hold", target: "dsc-wet-wheel", seconds: 5, noRobot: false,
      title: "Finish the sprue wet, behind the shield, with extraction running",
      cue: "Hold the restoration to the water-cooled wheel behind the shield until the sprue is flush.",
      holdBreakNote: "You pulled away with the sprue still proud. Put it back to the wet wheel behind the shield and finish it — a stub left on the contact is adjusted in the mouth instead.",
      why: "The milled crown comes out attached to the block by a sprue that has to be removed and the spot polished smooth. Doing it on a water-cooled wheel keeps the ceramic from heat-cracking and keeps the dust wet and out of the air; the shield and the extraction catch what the water does not. A smooth sprue site is also a smooth contact against the next tooth. Finishing ceramic safely is a laboratory bench skill, and it is the one that moves an assistant toward a dental technology career.",
    },
    {
      id: "dsc-crew-checkin", kind: "select", target: "dsc-crew-checkin", noRobot: false,
      title: "Check in with the dentist and the team before the try-in",
      cue: "Hand the finished crown over with what you saw — the margin, the block lot, any rescans — and ask how the chair is going.",
      why: "The fit on the tooth, the contacts and the bite are the dentist's call under every state dental board's rules, so the assistant hands over rather than seats. What makes that handover worth anything is detail: the rescan at the distal margin, the latex flag, the block lot. Asking the team how the chair is going at the same moment is how a long restorative day stays safe for everybody, and an assistant who does both is the one people want as a lead.",
    },
    {
      id: "dsc-case-log", kind: "select", target: "dsc-case-log", noRobot: false,
      title: "Write the digital case log",
      cue: "Record the tip's pouch number, the scanner calibration, the block's material, shade and lot, and the mill cycle.",
      why: "The case log makes the restoration traceable: which reprocessed tip went into this mouth, whether the scanner was calibrated, which lot of which material became this crown and which cycle cut it. If a material is recalled or the crown fractures, that record is the way back to what actually happened, and the ADA's CDT code the dentist records for the restoration has to be supported by the same notes. Documentation like this is what lets an assistant move into treatment coordination or practice management later.",
    },
  ],

  interrupts: [
    {
      id: "dsc-latex-reaction",
      kind: "Latex allergy",
      after: "dsc-scan-path", delay: 3, seconds: 12,
      alert: "The patient's lips are reddening and itching where your glove touched them — the chart's allergy flag says latex, and these gloves came from the unlabelled box.",
      cue: "Stop the scan, strip the gloves and re-glove from the non-latex dispenser, then call the dentist to the chair.",
      target: "dsc-nitrile-dispenser",
      why: "A latex reaction can move from a rash to swelling and breathing trouble quickly, and it keeps going for as long as the protein is on the skin. Stopping, removing the source and re-gloving in non-latex comes first; the dentist assesses the patient, and the emergency kit stays close by in case it keeps progressing.",
      missNote: "The scan carried on with latex gloves on the patient's lips. A contact reaction left in place can progress to swelling of the lips and airway, and every minute of scanning was another minute of exposure to the very thing the chart flagged.",
      wrongNote: "It is the non-latex glove dispenser. The gloves come off and non-latex ones go on before anything else touches this patient.",
    },
    {
      id: "dsc-screen-breach",
      kind: "Privacy breach",
      after: "dsc-mill-door", delay: 2.5, seconds: 11,
      alert: "While you hold the mill door, a courier at the open window is reading the design screen — the patient's name, date of birth and full-arch scan are on it.",
      cue: "Lock the workstation screen — the mill will hold its own door.",
      target: "dsc-screen-lock",
      why: "A screen with a name, a birth date and a scan on it, facing a window, is a disclosure happening in real time. Locking it takes a second and ends it; the mill's interlock carries on without you, which is why you can step away from the door once it has latched.",
      missNote: "The record stayed on show to the window for the rest of the cycle. That is a disclosure of identifiable health information to a stranger, and it happened because the screen was left open while everyone's attention was on the machine.",
      wrongNote: "It is the workstation's screen lock. The disclosure is on the monitor, so the monitor is what has to go dark.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, DSC_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#cfd8dc", base2: "#c3cdd2", seam: "rgba(0,0,0,0.09)",
    }), { repeat: 4, px: 256 });
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#f1f4f6", base2: "#e4e9ec", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 3, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xcfd8dc, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.74, metal: 0.04, color: 0xd8e0e4 });

    // A small board: coloured frame, painted face, returned with its face.
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.frame ?? 0x2a3a42, { rough: 0.5 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 384 });
      return b;
    };

    // ------------------------------------------------------------ the chair
    const chair = group(g, -0.95, 0, -0.95);
    cyl(chair, 0.22, 0.26, 0.12, 0, 0.06, 0.3, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 18 });
    cyl(chair, 0.07, 0.07, 0.42, 0, 0.3, 0.3, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
    slab(chair, 0.56, 0.13, 1.1, 0, 0.56, 0.05, 0x3a5a66, { radius: 0.07, rough: 0.6 });
    const back = group(chair, 0, 0.62, -0.62);
    slab(back, 0.54, 0.86, 0.16, 0, 0.3, 0, 0x3a5a66, { radius: 0.07, rough: 0.6 });
    back.rotation.x = -0.92;
    slab(chair, 0.38, 0.008, 0.36, 0, 0.72, -0.24, 0xbfe4f2, { radius: 0.02, rough: 0.8, cast: false });
    const patient = seatedFigure(chair, 0, 0.58, -0.1, { ry: 0, cloth: 0x7d6f8c, legs: 0x4f5a63 });
    patient.root.rotation.x = -1.02;
    patient.root.position.set(0, 0.62, -0.02);
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    // Lips that go red when the latex reaction starts.
    const lips = ball(patient.head, 0.035, 0, -0.06, 0.1, 0xd0443c, { rough: 0.6, seg: 10, emissive: 0xd0443c, ei: 0.5 });
    lips.scale.set(1.4, 0.5, 0.6);
    lips.visible = false;

    // The scanner wand, at the mouth: the track step's own target.
    const wand = group(g, -0.88, 1.2, -1.74, 0.5);
    cyl(wand, 0.018, 0.022, 0.2, 0, 0, 0, 0xeef2f4, { rough: 0.3, metal: 0.2, seg: 12 }).rotation.z = 1.2;
    cyl(wand, 0.012, 0.012, 0.05, -0.1, -0.04, 0, 0x2b3138, { rough: 0.4, seg: 10 }).rotation.z = 1.2;
    hose(g, [[-0.8, 1.18, -1.7], [-0.35, 0.95, -1.2], [-0.15, 0.92, -0.72]], 0.008, 0x2b3138, { steps: 10, rough: 0.6 });
    holoTag(wand, "scanner wand", 0, 0.12, 0, { css: DSC_CSS, w: 0.34 });
    reg(hits, wand, "dsc-scan-wand");

    // Overhead lamp from the static side.
    const lampPost = group(g, -0.95, 0, -2.3);
    cyl(lampPost, 0.05, 0.06, 1.95, 0, 0.98, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 });
    const lampHead = group(lampPost, 0, 1.78, 0.62);
    box(lampHead, 0.4, 0.1, 0.24, 0, 0, 0, 0xe8edf0, { rough: 0.3, metal: 0.3 });
    const lampFace = box(lampHead, 0.34, 0.02, 0.2, 0, -0.06, 0, 0xfff6e6, { emissive: 0xfff6e6, ei: 1.1, rough: 0.4, cast: false });
    ownMaterial(lampFace);
    lampHead.rotation.x = 0.45;

    // ------------------------------------------------------- scanner cart
    const cart = group(g, 0.1, 0, -0.6, -0.3);
    slab(cart, 0.5, 0.05, 0.4, 0, 0.82, 0, 0xdfe5e8, { radius: 0.02, rough: 0.45 });
    cyl(cart, 0.03, 0.03, 0.8, 0, 0.42, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    cyl(cart, 0.24, 0.26, 0.04, 0, 0.03, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 16 });
    const cartScreen = group(cart, 0, 1.12, -0.12);
    box(cartScreen, 0.36, 0.24, 0.03, 0, 0, 0, 0x1b2024, { rough: 0.4 });
    decal(cartScreen, 0.32, 0.2, 0, 0, 0.017, signFace("SCANNER READY?", { bg: "#0d1c24", accent: DSC_CSS, fg: "#dff2f8", scale: 0.42 }), { px: 256, glow: true, ei: 0.8 });
    // The two readiness faults, each its own marker on the cart.
    const calFlag = group(cartScreen, -0.1, -0.16, 0.03);
    box(calFlag, 0.1, 0.04, 0.01, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.5 });
    holoTag(calFlag, "calibration", 0, -0.05, 0, { css: "#f2c14b", w: 0.26 });
    reg(hits, calFlag, "dsc-cal-overdue");
    const heater = group(cart, 0.16, 0.86, 0.1);
    cyl(heater, 0.035, 0.035, 0.04, 0, 0, 0, 0x5a8fb0, { rough: 0.5, seg: 14 });
    holoTag(heater, "tip heater", 0, 0.08, 0, { css: DSC_CSS, w: 0.24 });
    reg(hits, heater, "dsc-heater-cold");
    // Sealed tip pouches and the cassette the used tip goes back in.
    const pouch = group(cart, -0.14, 0.86, 0.08);
    box(pouch, 0.12, 0.012, 0.07, 0, 0, 0, 0xf4f1e6, { rough: 0.8 });
    box(pouch, 0.03, 0.013, 0.07, 0.04, 0.001, 0, 0x59c97b, { rough: 0.7 });
    holoTag(pouch, "sealed tip", 0, 0.07, 0, { css: DSC_CSS, w: 0.24 });
    reg(hits, pouch, "dsc-tip-pouch");
    const cassette = group(g, 0.62, 0.9, -0.2);
    box(cassette, 0.2, 0.05, 0.12, 0, 0, 0, 0x7a8b96, { rough: 0.4, metal: 0.5 });
    box(cassette, 0.2, 0.012, 0.12, 0, 0.03, 0, 0xf2a83c, { rough: 0.5 });
    holoTag(cassette, "reprocessing cassette", 0, 0.1, 0, { css: DSC_CSS, w: 0.42 });
    reg(hits, cassette, "dsc-reprocess-cassette");
    // Hazard: the old tip, never reprocessed.
    const oldTip = group(cart, 0.02, 0.87, 0.14, 0.3);
    cyl(oldTip, 0.014, 0.016, 0.07, 0, 0, 0, 0xc9cfd3, { rough: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(oldTip, "tip from last patient", 0, 0.07, 0, { css: DSC_ALERT, w: 0.4 });
    reg(hits, oldTip, "dsc-uncleaned-tip");

    // ------------------------------------------------------ counter run
    const counterRun = group(g, 1.35, 0, -1.25, -0.35);
    box(counterRun, 1.9, 0.86, 0.6, 0, 0.43, 0, 0xd2d9dd, { rough: 0.55 });
    const top = slab(counterRun, 1.96, 0.045, 0.64, 0, 0.88, 0, 0xffffff, { radius: 0.012, rough: 0.5 });
    top.material = texturedMat(topTex, { rough: 0.48, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 4; i++) box(counterRun, 0.44, 0.24, 0.02, -0.72 + i * 0.48, 0.6, 0.31, 0xc4ccd2, { rough: 0.5 });
    for (let i = 0; i < 3; i++) box(counterRun, 0.58, 0.6, 0.32, -0.6 + i * 0.6, 1.72, -0.16, DSC_CAB, { rough: 0.55 });

    // The CAD workstation.
    const desk = group(counterRun, -0.45, 0.9, 0.02);
    box(desk, 0.06, 0.24, 0.06, 0, 0.12, -0.1, 0x2b3138, { rough: 0.5 });
    const monitor = group(desk, 0, 0.45, -0.08);
    box(monitor, 0.62, 0.38, 0.03, 0, 0, 0, 0x15191c, { rough: 0.4 });
    const cadFace = decal(monitor, 0.58, 0.34, 0, 0, 0.017, (cx, w, h) => {
      cx.fillStyle = "#0c1a22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = DSC_CSS; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#e8d9c6";
      cx.beginPath(); cx.ellipse(w * 0.5, h * 0.55, w * 0.2, h * 0.28, 0, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = "#59c97b"; cx.lineWidth = 3;
      cx.beginPath(); cx.ellipse(w * 0.5, h * 0.62, w * 0.22, h * 0.14, 0, 0, Math.PI * 2); cx.stroke();
      cx.fillStyle = "#dff2f8"; cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`;
      cx.fillText("PREP #— · MARGIN VIEW", w * 0.04, h * 0.12);
    }, { px: 384, glow: true, ei: 0.8 });
    void cadFace;
    // A red plate that lights while the record is exposed, and a dark lock
    // plate that covers the screen once it is locked.
    const exposedPlate = box(monitor, 0.6, 0.05, 0.005, 0, 0.21, 0.02, 0xd8342a, { emissive: 0xd8342a, ei: 1.1, rough: 0.5 });
    ownMaterial(exposedPlate);
    exposedPlate.visible = false;
    const lockPlate = decal(monitor, 0.58, 0.34, 0, 0, 0.022, signFace("LOCKED", { bg: "#101418", accent: "#59c97b", fg: "#dff2f8", scale: 0.5 }), { px: 256 });
    lockPlate.visible = false;
    const voidMark = group(monitor, 0.12, -0.02, 0.03);
    torus(voidMark, 0.03, 0.006, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, voidMark, "dsc-margin-void");
    const tissueMark = group(monitor, -0.1, -0.06, 0.03);
    torus(tissueMark, 0.03, 0.006, 0, 0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.8, seg: 6, seg2: 16, cast: false });
    reg(hits, tissueMark, "dsc-margin-tissue");
    holoTag(monitor, "CAD — margin view", 0, 0.26, 0, { css: DSC_CSS, w: 0.4 });
    // Three design buttons along the keyboard, in the order they are used.
    const DESIGN = [["dsc-design-margin", -0.16, "1 MARGIN"], ["dsc-design-axis", 0, "2 AXIS"], ["dsc-design-thickness", 0.16, "3 THICK"]];
    for (const [id, x, label] of DESIGN) {
      const k = group(desk, x, 0.02, 0.16);
      box(k, 0.13, 0.02, 0.07, 0, 0, 0, 0x2b3138, { rough: 0.5 });
      const lab = decal(k, 0.12, 0.05, 0, 0.012, 0, signFace(label, { bg: "#132028", accent: DSC_CSS, scale: 0.46 }), { px: 128 });
      lab.rotation.x = -Math.PI / 2;
      reg(hits, k, id);
    }
    const lockKey = group(desk, 0.3, 0.02, 0.1);
    box(lockKey, 0.08, 0.025, 0.06, 0, 0, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, rough: 0.5 });
    holoTag(lockKey, "screen lock", 0, 0.07, 0, { css: "#59c97b", w: 0.26 });
    reg(hits, lockKey, "dsc-screen-lock");

    // The record terminal beside it.
    const terminal = group(counterRun, 0.05, 0.9, -0.05);
    box(terminal, 0.3, 0.2, 0.03, 0, 0.18, 0, 0x1b2024, { rough: 0.4 });
    decal(terminal, 0.27, 0.17, 0, 0.18, 0.017, signFace("RECORD — ARCHIVE", { bg: "#0d1c24", accent: DSC_CSS, fg: "#dff2f8", scale: 0.36 }), { px: 256, glow: true, ei: 0.7 });
    box(terminal, 0.04, 0.08, 0.04, 0, 0.04, 0, 0x2b3138, { rough: 0.5 });
    reg(hits, terminal, "dsc-record-archive");
    const usb = group(counterRun, 0.28, 0.915, 0.1, 0.4);
    box(usb, 0.05, 0.012, 0.018, 0, 0, 0, 0xd8342a, { rough: 0.5 });
    box(usb, 0.015, 0.008, 0.012, 0.03, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    holoTag(usb, "personal USB stick", 0, 0.06, 0, { css: DSC_ALERT, w: 0.36 });
    reg(hits, usb, "dsc-personal-usb");

    // --------------------------------------------------------------- the mill
    const mill = group(counterRun, 0.62, 0.9, 0.02);
    slab(mill, 0.42, 0.46, 0.36, 0, 0.23, 0, 0xe9edf0, { radius: 0.03, rough: 0.4, metal: 0.2 });
    const doorPane = box(mill, 0.3, 0.26, 0.01, 0, 0.26, 0.185, 0x9fc9dc, { opacity: 0.45, transparent: true, rough: 0.2 });
    ownMaterial(doorPane);
    const latch = group(mill, 0.17, 0.26, 0.2);
    box(latch, 0.03, 0.1, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(latch, "door latch", 0, 0.09, 0, { css: DSC_CSS, w: 0.26 });
    reg(hits, latch, "dsc-mill-door-latch");
    const chuck = group(mill, 0, 0.24, 0.05);
    cyl(chuck, 0.03, 0.03, 0.06, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    reg(hits, chuck, "dsc-mill-chuck");
    const screw = group(mill, -0.12, 0.3, 0.19);
    cyl(screw, 0.025, 0.025, 0.02, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 14 }).rotation.x = Math.PI / 2;
    box(screw, 0.035, 0.008, 0.006, 0, 0, 0.012, 0x2b3138, { rough: 0.5 });
    holoTag(screw, "holder screw", 0, 0.07, 0, { css: DSC_CSS, w: 0.28 });
    reg(hits, screw, "dsc-holder-screw");
    const coolant = cyl(mill, 0.06, 0.06, 0.14, 0.26, 0.07, 0, 0x7fc4d8, { opacity: 0.6, transparent: true, seg: 12 });
    ownMaterial(coolant);
    holoTag(mill, "chairside mill", 0, 0.56, 0, { css: DSC_CSS, w: 0.34 });

    // The block drawer on the cart side of the counter, and the block itself.
    const drawer = group(g, 0.55, 0, 0.35, -0.2);
    box(drawer, 0.4, 0.8, 0.34, 0, 0.4, 0, 0xc4ccd2, { rough: 0.5 });
    slab(drawer, 0.42, 0.03, 0.36, 0, 0.815, 0, 0x2b3138, { radius: 0.01, rough: 0.5 });
    for (let i = 0; i < 3; i++) box(drawer, 0.06, 0.05, 0.08, -0.12 + i * 0.12, 0.855, -0.08, [0xefe6d6, 0xe8dcc4, 0xdfd1b6][i], { rough: 0.6 });
    const block = group(drawer, 0, 0.86, 0.08);
    box(block, 0.06, 0.05, 0.08, 0, 0, 0, 0xf3ead8, { rough: 0.5 });
    decal(block, 0.05, 0.02, 0, 0, 0.041, signFace("A2", { bg: "#f3ead8", accent: "#6ec3e8", fg: "#1b2024", scale: 0.6 }), { px: 64 });
    holoTag(block, "block — shade A2", 0, 0.08, 0, { css: DSC_CSS, w: 0.32 });
    reg(hits, block, "dsc-block");
    const blockHome = block.position.clone();

    // ------------------------------------------------ finishing bench, left
    const bench = group(g, -1.9, 0, 0.35, 0.5);
    box(bench, 0.9, 0.86, 0.5, 0, 0.43, 0, 0xd2d9dd, { rough: 0.55 });
    const benchTop = slab(bench, 0.94, 0.04, 0.54, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.5 });
    benchTop.material = texturedMat(topTex, { rough: 0.5, metal: 0.05, color: 0xf4f6f7 });
    const wheel = group(bench, 0.2, 0.92, 0);
    box(wheel, 0.2, 0.08, 0.16, 0, 0.04, 0, 0x53585e, { rough: 0.5, metal: 0.3 });
    const wheelDisc = cyl(wheel, 0.05, 0.05, 0.015, 0, 0.12, 0.05, 0x7fc4d8, { rough: 0.3, seg: 16 });
    wheelDisc.rotation.x = Math.PI / 2;
    const benchShield = slab(wheel, 0.24, 0.16, 0.006, 0, 0.2, 0.14, 0xbfe4f2, { radius: 0.01, opacity: 0.45, transparent: true, rough: 0.2 });
    void benchShield;
    hose(bench, [[0.2, 1.2, -0.15], [0.2, 1.5, -0.25], [0.2, 1.9, -0.25]], 0.03, 0x8b929a, { steps: 8, rough: 0.5 });
    holoTag(wheel, "wet wheel + extraction", 0, 0.32, 0, { css: DSC_CSS, w: 0.42 });
    reg(hits, wheel, "dsc-wet-wheel");
    const dryWheel = group(bench, -0.25, 0.92, 0.05);
    cyl(dryWheel, 0.05, 0.05, 0.02, 0, 0.08, 0, 0xb58b5a, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    box(dryWheel, 0.12, 0.06, 0.1, 0, 0.03, 0, 0x6d737a, { rough: 0.6 });
    holoTag(dryWheel, "dry wheel — no extraction", 0, 0.18, 0, { css: DSC_ALERT, w: 0.46 });
    reg(hits, dryWheel, "dsc-dry-trim");

    // Glove boxes on the side counter: the non-latex dispenser and the latex box.
    const gloveShelf = group(g, -2.2, 0, -0.75, 0.9);
    box(gloveShelf, 0.5, 0.9, 0.3, 0, 0.45, 0, 0xc4ccd2, { rough: 0.5 });
    const nitrile = group(gloveShelf, -0.12, 0.96, 0.02);
    box(nitrile, 0.2, 0.1, 0.12, 0, 0, 0, 0x5a7fd0, { rough: 0.6 });
    decal(nitrile, 0.16, 0.05, 0, 0, 0.061, signFace("NON-LATEX", { bg: "#2d4a8a", accent: "#bfe9f7", scale: 0.42 }), { px: 128 });
    holoTag(nitrile, "non-latex dispenser", 0, 0.12, 0, { css: "#59c97b", w: 0.38 });
    reg(hits, nitrile, "dsc-nitrile-dispenser");
    const nitrileHome = nitrile.position.clone();
    const latex = group(gloveShelf, 0.14, 0.96, 0.02);
    const latexBox = box(latex, 0.2, 0.1, 0.12, 0, 0, 0, 0xe8d8a8, { rough: 0.6 });
    ownMaterial(latexBox);
    holoTag(latex, "latex gloves", 0, 0.12, 0, { css: DSC_ALERT, w: 0.28 });
    reg(hits, latex, "dsc-latex-box");

    // A sharps unit and a hand sink, part of every operatory.
    const sharps = group(g, -2.3, 0, -1.25, 0.9);
    box(sharps, 0.26, 0.32, 0.2, 0, 1.3, 0, 0xd8342a, { rough: 0.6 });
    box(sharps, 0.28, 0.05, 0.22, 0, 1.48, 0, 0xf2e9c9, { rough: 0.55 });
    decal(sharps, 0.22, 0.12, 0, 1.3, 0.102, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }), { px: 160 });
    const sink = group(bench, -0.25, 0.9, -0.15);
    cyl(sink, 0.1, 0.09, 0.06, 0, 0, 0, 0xdfe4e8, { rough: 0.25, metal: 0.3, seg: 16, open: true, side: 2 });
    cyl(sink, 0.012, 0.012, 0.22, 0, 0.12, -0.09, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
    box(sink, 0.06, 0.012, 0.012, 0, 0.23, -0.06, CITY.steel, { rough: 0.3, metal: 0.85 });

    // ------------------------------------------------------ light dimmer
    const dimmer = group(g, -2.15, 1.2, -1.6, 0.9);
    box(dimmer, 0.14, 0.2, 0.03, 0, 0, 0, 0xeef2f4, { rough: 0.5 });
    const knob = cyl(dimmer, 0.035, 0.035, 0.03, 0, 0, 0.025, 0x2b3138, { rough: 0.5, seg: 14 });
    knob.rotation.x = Math.PI / 2;
    holoTag(dimmer, "operatory light", 0, 0.16, 0, { css: DSC_CSS, w: 0.32 });
    reg(hits, dimmer, "dsc-light-dimmer");

    // --------------------------------------------------- window and blind
    const win = group(g, 2.35, 0, -0.1, -Math.PI / 2);
    box(win, 1.2, 0.9, 0.04, 0, 1.45, 0, 0xbfe4f2, { opacity: 0.35, transparent: true, rough: 0.1 });
    box(win, 1.26, 0.05, 0.06, 0, 1.92, 0, 0x8b929a, { rough: 0.5 });
    box(win, 1.26, 0.05, 0.06, 0, 0.98, 0, 0x8b929a, { rough: 0.5 });
    const blind = box(win, 1.18, 0.86, 0.02, 0, 1.45, 0.04, 0xe8e2d4, { rough: 0.8 });
    const blindHome = blind.position.y;
    blind.position.y = blindHome + 0.4;
    blind.scale.y = 0.1;

    // --------------------------------------- check-in board and case log
    const checkin = board(0.48, 0.3, 0.1, 1.72, -2.35, (cx, w, h) => {
      cx.fillStyle = "#0e1c22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#eaf6fb"; cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.fillText("DENTIST + TEAM CHECK-IN", w * 0.05, h * 0.26);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      ["Margin · rescans · block lot", "How is the chair going?"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.52 + i * 0.22)));
    });
    reg(hits, checkin.userData.face, "dsc-crew-checkin");
    const logBoard = board(0.42, 0.3, 0.72, 1.72, -2.35, paperFace("DIGITAL CASE LOG", ["Tip pouch #", "Calibration", "Block material / shade / lot", "Mill cycle"], { band: DSC_CSS }));
    reg(hits, logBoard.userData.face, "dsc-case-log");

    // ------------------------------------------------------- the crew
    const dentist = standingFigure(g, -2.35, 1.35, { ry: 2.3, cloth: 0x2f5f70 });
    holoTag(dentist, "the dentist", 0, 1.86, 0, { css: DSC_CSS, w: 0.3 }).rotation.y = -2.3;
    const lead = standingFigure(g, 2.2, 1.25, { ry: -2.2, cloth: 0x4a7f7a });
    holoTag(lead, "lead assistant", 0, 1.86, 0, { css: DSC_CSS, w: 0.34 }).rotation.y = 2.2;

    // Readiness panel on the wall.
    const panel = holoPanel(g, 0.8, 0.5, -1.0, 1.95, -2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = DSC_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#bfe9f7"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("OPERATORY 3 — DIGITAL", w * 0.06, h * 0.16);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Tip reprocessed · scanner calibrated", "Light down · occlusal-lingual-buccal", "Margin checked before design",
        "Mill door latched · finish wet"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: DSC_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.62, -0.9, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.585, -0.9, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }
    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf4fbff, 0x5d6a72, 0.9));

    const okMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.5 });
    let milling = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.0, -0.8),

      onStep(step) { milling = step.id === "dsc-mill-door"; },

      onStepComplete(step) {
        if (step.id === "dsc-precheck") { calFlag.visible = false; heater.children[0].material = okMat; }
        if (step.id === "dsc-light-down") lampFace.material.emissiveIntensity = 0.35;
        if (step.id === "dsc-tip-return") box(cassette, 0.05, 0.02, 0.03, 0, 0.045, 0, 0xc9cfd3, { rough: 0.5 });
        if (step.id === "dsc-margin-check") { voidMark.visible = false; tissueMark.visible = false; }
        if (step.id === "dsc-block-in") { block.parent.remove(block); chuck.add(block); block.position.set(0.05, 0, 0); }
        if (step.id === "dsc-mill-door") doorPane.material.opacity = 0.7;
        if (step.id === "dsc-case-log") {
          repaint(logBoard.userData.face, paperFace("DIGITAL CASE LOG", ["Tip pouch — recorded", "Calibration — done", "Block A2 — lot recorded", "Cycle complete"], { band: "#59c97b" }));
        }
        void blockHome;
      },

      onInterrupt(it) {
        if (it.id === "dsc-latex-reaction") {
          lips.visible = true;
          latexBox.material.emissive.set(0xd8342a);
          latexBox.material.emissiveIntensity = 0.7;
        }
        if (it.id === "dsc-screen-breach") {
          exposedPlate.visible = true;
          blind.position.y = blindHome + 0.4;
          blind.scale.y = 0.1;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dsc-latex-reaction") {
          lips.visible = false;
          latex.visible = false;
          nitrile.position.set(nitrileHome.x + 0.12, nitrileHome.y + 0.02, nitrileHome.z + 0.08);
        }
        if (it.id === "dsc-screen-breach") {
          exposedPlate.visible = false;
          lockPlate.visible = true;
          blind.position.y = blindHome;
          blind.scale.y = 1;
        }
      },

      onHazard() {},

      animate(t) {
        patient.head.rotation.y = Math.sin(t * 0.6) * 0.04;
        if (milling) coolant.material.opacity = 0.5 + Math.sin(t * 6) * 0.15;
      },
    };
  },
};
