import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
  particles, seatedFigure, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Orthodontic Assisting VR — Dental & Oral Health.
//
// A bonding-and-adjustment appointment in an orthodontic practice, worked
// from the assistant's side of the chair: the bracket tray laid out in the
// order the bonding sequence needs it, cheek retractor and moisture control
// placed so the enamel actually stays dry, the etch held to the label's own
// window and rinsed to a frosted surface, bracket height checked against the
// gauge before the orthodontist bonds it, and then the archwire and the
// elastomeric modules changed and the distal ends tucked.
//
// The credential named is DANB's Certified Orthodontic Assistant, and what an
// assistant may actually do at this chair — place and remove archwires and
// ligatures, or only hand them across — is whatever the state dental practice
// act's allowable-duties list for orthodontic assistants says, which differs
// state to state. This station never asserts a particular state's list: it
// asks the learner to read the one posted in their own operatory.

const ORTHA_ACCENT = 0x9fb8e8;
const ORTHA_CSS = "#9fb8e8";
const ORTHA_STEEL = 0xb9c2ca;
const ORTHA_UPHOLSTERY = 0x435a6b;
const ORTHA_CABINET = 0xe4e9ed;
const ORTHA_MODULE_TONES = [0x6fc8e8, 0xe87f9f, 0x8fd6a0, 0xf0c25a, 0xb490e0];

export const SIM_ORTHODONTIC_ASSISTING = {
  id: "orthodontic-assisting",
  index: "212",
  domain: "Dental & Oral Health",
  trade: "Orthodontic dental assistant",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "DANB's Certified Orthodontic Assistant (COA) credential and the infection control and radiation health and safety components behind it; the state dental practice act's allowable-duties list for orthodontic assistants, which decides whether archwires and ligatures are placed or only passed; the American Association of Orthodontists (AAO) as the specialty's body and the American Dental Assistants Association (ADAA) as the assistants'; the CDC's Guidelines for Infection Control in Dental Health-Care Settings and its 2016 Summary; OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication for the etchant and the bonding resin; HIPAA's Privacy Rule for the chart and the progress photographs; SEIU and UFCW as the unions representing clinic staff in organised practices",
  name: "Orthodontic Assisting",
  title: simTitle("Orthodontic Assisting"),
  tagline: "Bracket tray, retraction and isolation, an etch held to the label's window, bracket height on the gauge, archwire and module change with the distal ends tucked",
  accent: ORTHA_ACCENT,
  accentCss: ORTHA_CSS,
  parSeconds: 270,
  footprint: 2.2,
  badge: { id: "bracket-true", name: "Bracket True", note: "A full bonding and adjustment visit with the etch held to its window and every wire end accounted for" },

  game: system({
    name: "Orthodontic Chairside",
    currency: "ARCH",
    ranks: ["Ortho Trainee", "Orthodontic Assistant", "Lead Ortho Assistant", "Clinical Coordinator", "Certified Orthodontic Assistant"],
    badges: [
      { id: "dry-field", name: "Dry Field", note: "Isolation held so the etch and the adhesive never saw saliva", test: AWARD.stepClean("isolation-gaps") },
      { id: "no-loose-ends", name: "No Loose Ends", note: "No unsafe action anywhere in the appointment", test: AWARD.safe },
      { id: "gauge-true", name: "Gauge True", note: "Bracket height committed close to the gauge's own mark", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-bond", name: "Clean Bond", note: "No corrections anywhere in the visit", test: AWARD.clean },
      { id: "held-the-window", name: "Held The Window", note: "Every timed hold carried to full duration first time", test: AWARD.unbroken },
      { id: "on-the-hour", name: "On The Hour", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "etchant-bead": "That bead of phosphoric-acid etchant has run off the bracket pad and is sitting on the gum margin. Reaching for it with a dry cotton roll smears it further along the tissue instead of removing it — etchant on soft tissue is rinsed off with copious water, immediately, because the burn it leaves keeps working for as long as the gel is in contact with the gingiva.",
    "unclipped-wire": "That distal end of the archwire is standing proud past the molar tube, unclipped and untucked. A wire end left long is what lacerates a cheek somewhere between this chair and the school bus, and it is the single most common reason a patient rings the practice in pain between adjustment visits.",
    "dropped-bracket": "That bracket went on the floor and somebody put it back in the kit. A bracket is a single-use sterile component bonded directly to enamel and left there for eighteen months — one that touched a clinic floor goes in the waste, not back into the tray, however unused it looks.",
    "bulk-module-bag": "That bulk bag of elastomeric modules is open on the counter and has been reached into with treatment gloves. The whole bag becomes contaminated the first time a gloved hand goes in after touching a patient's mouth, and every child who gets a module out of it afterwards is sharing whatever came in on that glove.",
  },

  lateNotes: {
    "etch-applicator": "Not yet. The etchant goes nowhere near enamel until the retractor is seated and the field is actually dry — etching a wet surface produces a bond that looks identical and fails in a fortnight.",
    "cure-light": "Hold off. There is nothing bonded to cure yet, and running the light across an un-etched, unprimed pad only warms the tooth.",
    "archwire": "The brackets are not bonded and cured yet. An archwire tied into a bracket whose adhesive is still soft pulls it straight off the tooth on the way in.",
  },

  steps: [
    {
      id: "scope-board", kind: "select", target: "duties-board",
      title: "Read the allowable-duties list posted in this operatory",
      cue: "Check what an orthodontic assistant may do at this chair today, and what has to be passed to the orthodontist.",
      why: "Whether you place the archwire and the ligatures yourself or only pass them across is decided by the state dental practice act's allowable-duties list for orthodontic assistants, and that list is different in the next state over. DANB's Certified Orthodontic Assistant credential proves you know how to do the work; it is the practice act, posted in the room, that says which parts of it are yours to do under this supervision.",
    },
    {
      id: "ortho-ppe", kind: "sequence", anyOrder: true,
      targets: ["ortho-mask", "ortho-eyewear", "ortho-gloves"],
      itemNames: { "ortho-mask": "mask", "ortho-eyewear": "eye protection with side shields", "ortho-gloves": "treatment gloves" },
      title: "Don chairside PPE",
      cue: "Mask, eye protection with side shields, and treatment gloves before the tray is opened.",
      why: "Bonding an arch is a spatter procedure: etchant, primer, rinse water and the clippings off a cut archwire all leave the mouth at speed. The CDC's dental infection-control guidance and OSHA's bloodborne pathogens standard both set the barrier by the task rather than the room, and a wire end that snaps off under the distal-end cutter travels far enough that side shields are the part nobody should be improvising.",
    },
    {
      id: "tray-setup", kind: "sequence",
      targets: ["bracket-kit", "bonding-resin", "cure-light", "ligature-instrument"],
      itemNames: {
        "bracket-kit": "the patient's own bracket kit",
        "bonding-resin": "etchant and bonding resin",
        "cure-light": "curing light",
        "ligature-instrument": "ligature director and distal-end cutter",
      },
      title: "Lay the bracket tray out in bonding order",
      cue: "Bracket kit first, then the etchant and resin, the curing light, and the ligature instruments last.",
      why: "A bonding tray is laid out in the order the sequence will actually reach for it, because the one moment you cannot go hunting for an instrument is the moment an etched, rinsed and dried tooth is sitting there waiting. Setting the ligature instruments out first and the bracket kit last is how a tray ends up being rummaged through with a dry field ticking away and a patient's lip held open.",
      outOfOrderNote: "Out of order. The tray is built in the order the appointment consumes it — kit, adhesives, light, then the wire and ligature instruments that come out only after the brackets are cured.",
    },
    {
      id: "retractor-fit", kind: "drag", target: "cheek-retractor",
      title: "Seat the cheek retractor",
      cue: "Place the retractor so both lips are clear of the bracket line and nothing is pinched at the corners.",
      why: "The retractor is what gives the orthodontist a field and what keeps a lip out of the etchant, and it is also the single most uncomfortable thing about a bonding visit for the patient. Seated badly it pinches the corners of the mouth, the patient starts moving, and a moving patient is how a bracket ends up bonded two millimetres off the long axis of the tooth.",
      drag: { to: "patient-mouth", radius: 0.32, missNote: "Not seated. A retractor that is not actually holding both lips clear leaves tissue inside the field the etchant is about to go into." },
    },
    {
      id: "isolation-gaps", kind: "find", noHint: true,
      targets: ["saturated-roll", "retractor-pinch", "saliva-pool"],
      itemNames: {
        "saturated-roll": "the saturated cotton roll",
        "retractor-pinch": "the lip pinched under the retractor flange",
        "saliva-pool": "saliva pooling in the floor of the mouth",
      },
      itemNotes: {
        "saturated-roll": "A cotton roll that has already taken up all the fluid it can hold is no longer isolating anything — it is a wet sponge sitting against the enamel you are about to etch, wicking moisture back onto the exact surface that has to stay dry.",
        "retractor-pinch": "The lower lip is caught under the retractor flange. That is what makes a patient shift and reach up mid-bond, and a pinched lip is also a lip that ends up inside the field when the etchant goes on.",
        "saliva-pool": "Saliva pooling in the floor of the mouth will find the etched surface the moment the patient swallows. A frosted, etched enamel surface contaminated by saliva has to be rinsed, dried and re-etched — there is no rescuing it by drying harder.",
      },
      title: "Find what is defeating moisture control",
      cue: "Look at the field before the etchant comes out. Three things here will let moisture back onto the enamel.",
      why: "Every part of a bonded bracket's eighteen-month survival is decided in the seconds the enamel is supposed to be dry, and moisture is the one contaminant that leaves no trace to find afterwards — a bond that failed because a cotton roll was saturated looks exactly like one that failed for any other reason. Finding the leaks before the etchant comes out is the only chance anyone gets at this.",
    },
    {
      id: "etch-window", kind: "track", target: "etch-applicator", seconds: 7,
      title: "Hold the etch inside the label's own window",
      cue: "Work the etchant across the bracket pads and keep the timing inside the band the label sets.",
      why: "The etchant on this tray has a conditioning time printed on its own label, and both directions off it cost you the bond: short of it the enamel is not micro-roughened enough for the resin tags to key into, past it the surface is over-dissolved into a chalky layer that crumbles away under the adhesive. The label's number is a tested number, not a suggestion, and it belongs to that product rather than to etchants in general.",
      track: {
        start: 0.12, green: [0.36, 0.64], rise: 0.5, fall: 0.42, drift: 0.13, label: "ETCH WINDOW",
        readout: (v) => (v < 0.36 ? "under-conditioned" : v > 0.64 ? "over-etched — chalky" : "inside the label's window"),
      },
      holdBreakNote: "The etch drifted out of the label's window. Under-etched enamel gives the resin nothing to key into; over-etched enamel gives it a powdery layer that lets go of the tooth underneath.",
    },
    {
      id: "rinse-frost", kind: "hold", target: "air-water-syringe", seconds: 6,
      title: "Rinse and dry to a frosted surface",
      cue: "Rinse the etchant off thoroughly, then dry until the pads read chalky white.",
      why: "The rinse has to carry every trace of the gel away, because etchant left under a bracket pad keeps dissolving enamel after the bracket is bonded on top of it, and the dry has to go far enough that the surface reads frosted chalk-white rather than glossy. That frosted look is the only visible confirmation anybody gets that the enamel was actually conditioned before the primer went on.",
      holdBreakNote: "You came off the rinse-and-dry early. A pad that still looks glossy has either etchant or water on it, and the adhesive is about to be asked to bond to whichever one it is.",
    },
    {
      id: "bracket-height", kind: "gauge", target: "bracket-gauge",
      title: "Check bracket height against the gauge",
      cue: "Set the bracket on the height gauge and commit where the prescription puts it on this tooth.",
      why: "A bracket's vertical position is what tells the archwire where the tooth should finish, so a bracket bonded a millimetre high or low builds that error into the whole treatment and gets paid for months later in a tooth that will not level. The gauge exists because judging that height by eye across a retracted lip is exactly the kind of estimate that is confidently wrong.",
      gauge: {
        label: "BRACKET HEIGHT", speed: 0.5, green: [0.42, 0.6],
        readout: (t) => `${(3.5 + t * 2.4).toFixed(1)} mm from the incisal edge`,
        missNote: "Off the prescription's height for this tooth. The archwire will express that error for the rest of treatment, and nobody will be able to see where it came from.",
      },
    },
    {
      id: "cure-hold", kind: "hold", target: "cure-light", seconds: 7,
      title: "Cure each pad for its full time",
      cue: "Hold the curing light on the pad for the time the adhesive's own instructions set, from both sides where they say so.",
      why: "The adhesive's cure time is a light-energy figure rather than a countdown for its own sake, and a pad that got half the exposure is a bracket that comes off in a fortnight looking like a bonding failure nobody can explain. The tip matters as much as the clock: adhesive crusted on the light guide cuts the output that actually reaches the pad while the timer keeps reading the same.",
      holdBreakNote: "The cure came off early. Half-cured adhesive holds well enough to finish the appointment and lets go somewhere out in the world, usually at the least convenient possible moment.",
    },
    {
      id: "archwire-cinch", kind: "turn", target: "archwire",
      title: "Seat and cinch the archwire",
      cue: "Engage the wire through every bracket slot and cinch it at the molar tubes.",
      why: "An archwire that is not engaged in every slot is treating some of these teeth and none of the others, and one that is not cinched at the molars walks forward through the tubes as the patient eats until a long end is sitting in a cheek. Cinching is what holds the wire where the prescription put it between now and the next adjustment, which is five weeks of chewing away.",
      turn: { turns: 1, axis: "y", label: "ARCHWIRE SEAT" },
    },
    {
      id: "wire-end-tuck", kind: "select", target: "wire-end",
      title: "Cut and tuck every distal end",
      cue: "Cut the distal ends to length and tuck them in against the molar tube — then run a finger round to check.",
      why: "The check that finds a proud wire end is a gloved finger run right round the arch, not a look, because the end that lacerates a cheek is usually one that could not be seen past the molar tube in the first place. This is also the step that decides whether the practice hears from this patient in pain tomorrow, and it takes about fifteen seconds to do properly.",
    },
    {
      id: "module-dispense", kind: "find", noHint: true,
      targets: ["module-stick", "overglove", "module-waste"],
      itemNames: {
        "module-stick": "the pre-dispensed module stick for this patient",
        "overglove": "the overglove for reaching into the drawer",
        "module-waste": "the waste cup for used modules",
      },
      itemNotes: {
        "module-stick": "Modules come out of the bulk supply once, onto a stick for this patient, before treatment gloves ever touch a mouth. Whatever is left on that stick at the end of the visit is waste, not stock going back into the bag.",
        "overglove": "If anything has to be fetched from a drawer mid-treatment, an overglove goes on over the contaminated glove first. That is the whole reason overgloves exist: the alternative is a drawer handle that now carries what the last patient's mouth carried.",
        "module-waste": "Used modules go straight into a waste cup on the tray, not back onto the counter or into the bulk bag. An elastomeric module that has been in a mouth is single-use waste, and it looks identical to a clean one the moment it is put down.",
      },
      title: "Find what keeps module handling single-patient",
      cue: "Three things on this tray are what stop elastomerics becoming a shared supply. Find them.",
      why: "Elastomeric modules are the cheapest thing in the room and the easiest place in an orthodontic practice to build a cross-contamination route, because nothing about a handled module looks different afterwards. The CDC's dental infection-control guidance answers that with dispensing rather than judgement: what leaves the bulk supply leaves once, for one patient, and what comes back is waste.",
    },
    {
      id: "appointment-note", kind: "select", target: "chart-note",
      title: "Chart the visit",
      cue: "Record the brackets bonded, the archwire size and material, the module colour and the interval to the next adjustment.",
      why: "The next assistant at this chair sets their tray from this note and nothing else, so the wire size, the material and what was bonded today are what decide whether the next visit starts on time or starts with a puzzle. It is also the record that makes a debonded bracket in three weeks answerable — the same chart HIPAA's Privacy Rule protects is the one that has to be accurate enough to be worth protecting.",
    },
    {
      id: "crew-handoff", kind: "select", target: "crew-board",
      title: "Check in with the assistant taking the next chair",
      cue: "Hand over what the sterilisation room is waiting on, and ask how their morning is going before you walk away.",
      why: "An orthodontic practice runs three or four chairs off one sterilisation room, so the cassette you leave and the instruments you have tied up decide whether anybody else's next patient starts on time. Asking the question out loud is the part that gets skipped: this is a chair where somebody is either coping with the pace or quietly not, and the assistant beside you is the only person in the building placed to notice either.",
    },
  ],

  interrupts: [
    {
      id: "etchant-runs-to-tissue",
      kind: "Chemical on soft tissue",
      after: "etch-window", delay: 3, seconds: 12,
      alert: "A bead of etchant has run off the bracket pad and is sitting on the gum margin — the patient has just flinched.",
      cue: "Rinse it off now, with water, not with a cotton roll.",
      target: "air-water-syringe",
      why: "Phosphoric-acid etchant keeps acting on gingival tissue for as long as it is in contact with it, so the answer is copious water at once rather than blotting, which only spreads the gel along the margin. OSHA's hazard communication standard is why that product's safety data sheet is in this room at all, and what it says for skin and mucosa contact is rinse, immediately and thoroughly.",
      missNote: "The etchant stayed on the gingiva through the rest of the etch window. The patient leaves with a white chemical burn along the margin that will slough over the next few days, and every minute it sat there made it deeper — none of which was visible while it was happening under a retractor.",
      wrongNote: "It is the air-water syringe. Etchant on tissue comes off with water at once; a cotton roll drags it along the margin and makes the contact area bigger.",
    },
    {
      id: "bracket-comes-loose",
      kind: "Loose component in the mouth",
      after: "cure-hold", delay: 3, seconds: 12,
      alert: "Something has come loose on the opposite arch — the patient says there is a hard bit moving around in their mouth.",
      cue: "Get suction in there and retrieve it before they swallow.",
      target: "hv-suction",
      why: "A loose bracket or a cut wire end in a retracted, supine mouth is an airway problem first and an orthodontic problem second, and the window between a patient noticing it and swallowing it is a few seconds long. High-volume evacuation is what retrieves it; the bonding failure that produced it is something to work out afterwards, on a patient who is sitting up.",
      missNote: "The loose component was still in the mouth when the retractor came out. A swallowed bracket is usually uneventful and an aspirated one is a chest radiograph and a bronchoscopy, and nothing about the moment it happens tells you which of the two you are dealing with.",
      wrongNote: "It is the high-volume suction. A hard component loose in a supine mouth is retrieved first; what caused it is a question for later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, ORTHA_ACCENT);

    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#f2f5f7", base2: "#e6ebef", seam: "rgba(0,0,0,0.07)",
    }), { repeat: 3, px: 256 });
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#cdd6dc", base2: "#c2ccd4", seam: "rgba(0,0,0,0.09)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.2, 0.008, 5.2, 0, 0.002, 0, 0xffffff, { radius: 0.06, rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.85, metal: 0.03, color: 0xffffff });

    // ------------------------------------------------------------ ortho chair
    const chair = group(g, 0, 0, -0.9, 0.12);
    slab(chair, 0.6, 0.13, 1.45, 0, 0.5, 0, ORTHA_UPHOLSTERY, { radius: 0.07, rough: 0.6 });
    const chairBack = slab(chair, 0.56, 0.86, 0.58, 0, 0.84, -0.53, ORTHA_UPHOLSTERY, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = -0.9;
    const headrest = ball(chair, 0.13, 0, 1.06, -0.98, ORTHA_UPHOLSTERY, { rough: 0.6, seg: 14 });
    headrest.scale.set(1.5, 0.66, 1.1);
    cyl(chair, 0.055, 0.075, 0.68, 0, 0.24, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 14 });
    cyl(chair, 0.22, 0.26, 0.06, 0, 0.03, 0, 0x30363d, { rough: 0.45, metal: 0.5, seg: 18 });
    slab(chair, 0.66, 0.05, 0.86, 0, 0.55, 0.02, 0x364453, { radius: 0.04, rough: 0.45, metal: 0.3 });
    slab(chair, 0.07, 0.05, 0.42, 0.31, 0.63, 0.1, 0x364453, { radius: 0.02, rough: 0.5 });
    slab(chair, 0.07, 0.05, 0.42, -0.31, 0.63, 0.1, 0x364453, { radius: 0.02, rough: 0.5 });

    // The patient: a teenager mid-treatment, reclined with the retractor in.
    const patient = seatedFigure(chair, 0, 0.58, -0.4, { skin: 0xc9976b, cloth: 0xd9e4ec, seed: 3 });
    patient.root.rotation.x = -0.52;
    const bib = slab(chair, 0.34, 0.01, 0.26, 0, 0.78, -0.3, 0x6f92b8, { radius: 0.03, rough: 0.8 });
    bib.rotation.x = -0.5;

    // The working field: a small stand-in arch at the mouth, so the etch, the
    // brackets and the wire all have somewhere to be.
    const mouth = group(chair, 0, 1.02, -0.86);
    const archUpper = torus(mouth, 0.055, 0.008, 0, 0.012, 0, 0xf0e3d6, { rough: 0.5, seg: 8, seg2: 22 });
    archUpper.rotation.x = Math.PI / 2;
    const archLower = torus(mouth, 0.05, 0.007, 0, -0.018, 0.004, 0xf0e3d6, { rough: 0.5, seg: 8, seg2: 22 });
    archLower.rotation.x = Math.PI / 2;
    const brackets = [];
    for (let i = 0; i < 8; i++) {
      const a = -0.95 + (i / 7) * 1.9;
      const b = box(mouth, 0.012, 0.012, 0.008, Math.sin(a) * 0.056, 0.012, Math.cos(a) * 0.056 - 0.004,
        ORTHA_STEEL, { rough: 0.25, metal: 0.9 });
      b.rotation.y = a;
      brackets.push(b);
    }
    const mouthSocket = box(mouth, 0.2, 0.12, 0.14, 0, 0.01, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["patient-mouth"] = mouthSocket;

    // The archwire itself, tied into the brackets once it is placed.
    const archwire = torus(mouth, 0.058, 0.0025, 0, 0.012, -0.004, 0xd8dde2, { rough: 0.2, metal: 0.95, seg: 6, seg2: 26 });
    archwire.rotation.x = Math.PI / 2;
    archwire.visible = false;
    const archwireTray = group(g, 1.0, 0.94, 0.28, 0.3);
    torus(archwireTray, 0.07, 0.0025, 0, 0, 0, 0xd8dde2, { rough: 0.2, metal: 0.95, seg: 6, seg2: 26 }).rotation.x = Math.PI / 2.6;
    holoTag(archwireTray, "Archwire", 0, 0.1, 0, { css: ORTHA_CSS, w: 0.26 });
    reg(hits, archwireTray, "archwire");

    // The tucked distal end — its own marker, so the check has a target that
    // is not the wire itself.
    const wireEnd = group(mouth, 0.058, 0.012, 0.05);
    cyl(wireEnd, 0.0022, 0.0022, 0.022, 0, 0, 0, 0xd8dde2, { rough: 0.2, metal: 0.95, seg: 6 }).rotation.x = Math.PI / 2;
    ball(wireEnd, 0.004, 0, 0, 0.012, 0x8fd6a0, { emissive: 0x8fd6a0, ei: 0.4, rough: 0.4, seg: 8 });
    holoTag(wireEnd, "Distal end", 0.03, 0.05, 0, { css: ORTHA_CSS, w: 0.24 });
    reg(hits, wireEnd, "wire-end");

    // The proud, unclipped end on the other side — the hazard.
    const unclipped = group(mouth, -0.062, 0.012, 0.055);
    cyl(unclipped, 0.0022, 0.0022, 0.05, 0, 0, 0.018, 0xd8dde2, { rough: 0.2, metal: 0.95, seg: 6 }).rotation.x = 1.2;
    holoTag(unclipped, "Wire end proud", -0.02, 0.06, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, unclipped, "unclipped-wire");

    // The etchant bead on the gingival margin — the hazard, and the thing the
    // first interruption makes appear.
    const etchBead = group(mouth, 0.02, 0.026, 0.048);
    const etchBlob = ball(etchBead, 0.007, 0, 0, 0, 0xe86a8a, { emissive: 0xe86a8a, ei: 0.25, rough: 0.35, seg: 10 });
    ownMaterial(etchBlob);
    holoTag(etchBead, "Etchant on tissue", 0.02, 0.05, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, etchBead, "etchant-bead");
    etchBead.visible = false;

    // The loose bracket the second interruption puts in the mouth.
    const looseBracket = box(mouth, 0.013, 0.013, 0.009, -0.03, -0.03, 0.03, ORTHA_STEEL, { rough: 0.25, metal: 0.9 });
    looseBracket.visible = false;

    // ------------------------------------------------ retractor and isolation
    const retractorRest = group(g, -0.62, 0.96, 0.18, -0.5);
    const cheekRetractor = group(retractorRest, 0, 0, 0);
    torus(cheekRetractor, 0.05, 0.006, -0.035, 0, 0, 0xf2f5f7, { rough: 0.35, seg: 6, seg2: 18 }).rotation.y = 0.4;
    torus(cheekRetractor, 0.05, 0.006, 0.035, 0, 0, 0xf2f5f7, { rough: 0.35, seg: 6, seg2: 18 }).rotation.y = -0.4;
    cyl(cheekRetractor, 0.005, 0.005, 0.07, 0, 0, 0, 0xf2f5f7, { rough: 0.35, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(cheekRetractor, "Cheek retractor", 0, 0.09, 0, { css: ORTHA_CSS, w: 0.4 });
    reg(hits, cheekRetractor, "cheek-retractor");

    const isolation = group(g, 0.56, 0.94, 0.02, -0.4);
    slab(isolation, 0.3, 0.02, 0.2, 0, 0, 0, ORTHA_CABINET, { radius: 0.01, rough: 0.45, metal: 0.2 });
    const satRoll = cyl(isolation, 0.014, 0.014, 0.048, -0.09, 0.03, -0.04, 0xd6cdb8, { rough: 0.95, seg: 10 });
    satRoll.rotation.z = Math.PI / 2;
    holoTag(isolation, "Saturated roll", -0.09, 0.1, -0.04, { css: "#f0b86e", w: 0.38 });
    reg(hits, satRoll, "saturated-roll");
    const dryRolls = group(isolation, 0.08, 0.03, -0.04);
    for (let i = 0; i < 3; i++) {
      cyl(dryRolls, 0.013, 0.013, 0.045, 0, i * 0.026, 0, 0xf7f4ec, { rough: 0.95, seg: 10 }).rotation.z = Math.PI / 2;
    }
    const pinchMark = box(g, 0.03, 0.012, 0.03, 0.09, 1.55, -1.72, 0xf0645b, { emissive: 0xf0645b, ei: 0.3, rough: 0.5 });
    holoTag(g, "Lip pinched", 0.09, 1.62, -1.72, { css: "#f0b86e", w: 0.32 });
    reg(hits, pinchMark, "retractor-pinch");
    const salivaPool = box(g, 0.05, 0.006, 0.04, -0.07, 1.5, -1.73, 0x7fc8e8, { emissive: 0x7fc8e8, ei: 0.25, rough: 0.3, opacity: 0.8, transparent: true });
    holoTag(g, "Saliva pooling", -0.1, 1.44, -1.73, { css: "#f0b86e", w: 0.4 });
    reg(hits, salivaPool, "saliva-pool");

    // -------------------------------------------------------- delivery unit
    const unit = group(g, 1.28, 0, -0.8, -0.55);
    box(unit, 0.46, 0.84, 0.4, 0, 0.42, 0, ORTHA_CABINET, { rough: 0.5, metal: 0.15 });
    const unitTop = slab(unit, 0.5, 0.04, 0.44, 0, 0.86, 0, 0xffffff, { radius: 0.01, rough: 0.45 });
    unitTop.material = texturedMat(topTex, { rough: 0.45, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 3; i++) {
      box(unit, 0.42, 0.2, 0.02, 0, 0.18 + i * 0.24, 0.21, 0xd3dae0, { rough: 0.5, metal: 0.2 });
      box(unit, 0.14, 0.015, 0.025, 0, 0.18 + i * 0.24, 0.225, 0x8e979f, { rough: 0.4, metal: 0.6 });
    }
    const syringe = group(unit, -0.16, 0.92, 0.06, 0.35);
    cyl(syringe, 0.011, 0.011, 0.2, 0, 0.06, 0, 0xe8edf1, { rough: 0.3, metal: 0.3, seg: 10 }).rotation.x = 0.5;
    cyl(syringe, 0.004, 0.004, 0.06, 0, 0.18, 0.04, ORTHA_STEEL, { rough: 0.25, metal: 0.9, seg: 8 }).rotation.x = 0.5;
    holoTag(syringe, "Air-water syringe", 0, 0.26, 0, { css: ORTHA_CSS, w: 0.44 });
    reg(hits, syringe, "air-water-syringe");
    hose(unit, [[-0.16, 0.88, 0.04], [-0.1, 0.7, 0.14], [-0.02, 0.5, 0.2]], 0.009, 0xcfd8de, { steps: 10, rough: 0.5 });

    const suction = group(unit, 0.16, 0.92, 0.06, -0.3);
    cyl(suction, 0.016, 0.013, 0.18, 0, 0.05, 0, 0xdfe6ec, { rough: 0.35, metal: 0.2, seg: 12 }).rotation.x = -0.4;
    cyl(suction, 0.02, 0.02, 0.03, 0, 0.16, -0.05, 0x5f7ea0, { rough: 0.4, metal: 0.3, seg: 12 }).rotation.x = -0.4;
    holoTag(suction, "High-volume suction", 0, 0.24, 0, { css: ORTHA_CSS, w: 0.5 });
    reg(hits, suction, "hv-suction");
    hose(unit, [[0.16, 0.88, 0.04], [0.22, 0.66, 0.16], [0.16, 0.42, 0.22]], 0.014, 0xcfd8de, { steps: 10, rough: 0.5 });

    // ----------------------------------------------------------- bracket tray
    const trayStand = group(g, -1.34, 0, -0.55, 0.6);
    cyl(trayStand, 0.16, 0.19, 0.04, 0, 0.02, 0, 0x30363d, { rough: 0.45, metal: 0.5, seg: 18 });
    cyl(trayStand, 0.028, 0.028, 0.86, 0, 0.45, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 12 });
    const tray = group(trayStand, 0, 0.9, 0.06);
    slab(tray, 0.52, 0.02, 0.34, 0, 0, 0, 0xe9eef2, { radius: 0.012, rough: 0.4, metal: 0.25 });
    slab(tray, 0.5, 0.008, 0.32, 0, 0.015, 0, 0x6f8fb2, { radius: 0.01, rough: 0.85 });

    const bracketKit = group(tray, -0.18, 0.03, -0.08);
    box(bracketKit, 0.13, 0.024, 0.1, 0, 0, 0, 0xf4f7f9, { rough: 0.5, opacity: 0.85, transparent: true });
    for (let i = 0; i < 5; i++) box(bracketKit, 0.012, 0.012, 0.009, -0.045 + i * 0.023, 0.02, 0, ORTHA_STEEL, { rough: 0.25, metal: 0.9 });
    decal(bracketKit, 0.1, 0.03, 0, 0.014, 0.051, signFace("UL 1-5", { bg: "#eef4fa", accent: ORTHA_CSS, scale: 0.5 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(bracketKit, "Bracket kit", 0, 0.1, 0, { css: ORTHA_CSS, w: 0.32 });
    reg(hits, bracketKit, "bracket-kit");

    const resin = group(tray, -0.02, 0.03, -0.09);
    cyl(resin, 0.017, 0.019, 0.06, -0.025, 0.03, 0, 0xe8dcc2, { rough: 0.35, metal: 0.05, seg: 12 });
    cyl(resin, 0.015, 0.017, 0.055, 0.025, 0.028, 0, 0xd7e4ef, { rough: 0.35, metal: 0.05, seg: 12 });
    decal(resin, 0.07, 0.03, 0, 0.062, 0.001, signFace("ETCH 30s", { bg: "#fff3d8", accent: "#c4762a", scale: 0.46 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(resin, "Etchant + resin", 0, 0.11, 0, { css: ORTHA_CSS, w: 0.4 });
    reg(hits, resin, "bonding-resin");

    const etchApplicator = group(tray, 0.02, 0.05, 0.08, 0.3);
    cyl(etchApplicator, 0.008, 0.008, 0.11, 0, 0, 0, 0xe2b0c4, { rough: 0.4, seg: 10 }).rotation.z = Math.PI / 2.3;
    cyl(etchApplicator, 0.003, 0.003, 0.03, 0.055, 0.022, 0, 0xc4577e, { rough: 0.35, seg: 8 }).rotation.z = Math.PI / 2.3;
    holoTag(etchApplicator, "Etch applicator", 0, 0.09, 0, { css: ORTHA_CSS, w: 0.42 });
    reg(hits, etchApplicator, "etch-applicator");

    const cureLight = group(tray, 0.17, 0.05, -0.02, -0.35);
    cyl(cureLight, 0.019, 0.022, 0.15, 0, 0, 0, 0x2f4a6b, { rough: 0.4, metal: 0.3, seg: 12 }).rotation.z = Math.PI / 2.6;
    const cureTip = cyl(cureLight, 0.009, 0.012, 0.05, 0.075, 0.035, 0, 0xbfe4f2, { emissive: 0x7fd6f2, ei: 0.05, rough: 0.2, seg: 10 });
    cureTip.rotation.z = Math.PI / 2.6;
    ownMaterial(cureTip);
    holoTag(cureLight, "Curing light", 0, 0.1, 0, { css: ORTHA_CSS, w: 0.34 });
    reg(hits, cureLight, "cure-light");

    const ligInstr = group(tray, 0.17, 0.035, 0.1, 0.5);
    for (let i = 0; i < 2; i++) {
      cyl(ligInstr, 0.005, 0.005, 0.13, 0, i * 0.014, i * 0.02, ORTHA_STEEL, { rough: 0.22, metal: 0.92, seg: 8 }).rotation.z = Math.PI / 2;
    }
    box(ligInstr, 0.02, 0.008, 0.03, 0.06, 0.007, 0.01, ORTHA_STEEL, { rough: 0.22, metal: 0.92 });
    holoTag(ligInstr, "Ligature instruments", 0, 0.09, 0, { css: ORTHA_CSS, w: 0.52 });
    reg(hits, ligInstr, "ligature-instrument");

    const bracketGauge = group(tray, -0.18, 0.04, 0.1, -0.4);
    box(bracketGauge, 0.09, 0.006, 0.03, 0, 0, 0, 0xdce3e9, { rough: 0.3, metal: 0.7 });
    for (let i = 0; i < 5; i++) box(bracketGauge, 0.002, 0.008, 0.012 + i * 0.002, -0.032 + i * 0.016, 0.004, 0, 0x3a4652, { rough: 0.4 });
    holoTag(bracketGauge, "Height gauge", 0, 0.08, 0, { css: ORTHA_CSS, w: 0.34 });
    reg(hits, bracketGauge, "bracket-gauge");

    // The dropped bracket under the tray stand — the hazard.
    const droppedBracket = group(g, -1.1, 0.02, -0.1);
    box(droppedBracket, 0.014, 0.014, 0.01, 0, 0.008, 0, ORTHA_STEEL, { rough: 0.3, metal: 0.85 });
    holoTag(droppedBracket, "Dropped — floor", 0, 0.09, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, droppedBracket, "dropped-bracket");

    // ------------------------------------------------------ module dispensing
    const moduleCounter = group(g, -2.5, 0, 1.55, 1.25);
    box(moduleCounter, 1.15, 0.86, 0.5, 0, 0.43, 0, ORTHA_CABINET, { rough: 0.5, metal: 0.12 });
    const moduleTop = slab(moduleCounter, 1.2, 0.04, 0.54, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.45 });
    moduleTop.material = texturedMat(topTex, { rough: 0.45, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 2; i++) {
      box(moduleCounter, 0.52, 0.28, 0.02, -0.28 + i * 0.56, 0.6, 0.26, 0xd3dae0, { rough: 0.5, metal: 0.2 });
      box(moduleCounter, 0.18, 0.016, 0.026, -0.28 + i * 0.56, 0.6, 0.275, 0x8e979f, { rough: 0.4, metal: 0.6 });
    }

    const moduleStick = group(moduleCounter, -0.34, 0.92, 0.06, 0.2);
    cyl(moduleStick, 0.004, 0.004, 0.11, 0, 0, 0, 0xf2f5f7, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) {
      torus(moduleStick, 0.0055, 0.0022, -0.04 + i * 0.02, 0, 0, ORTHA_MODULE_TONES[i], { rough: 0.55, seg: 6, seg2: 12 }).rotation.y = Math.PI / 2;
    }
    holoTag(moduleStick, "Module stick", 0, 0.08, 0, { css: ORTHA_CSS, w: 0.34 });
    reg(hits, moduleStick, "module-stick");

    const overglove = group(moduleCounter, -0.02, 0.92, 0.06);
    box(overglove, 0.1, 0.05, 0.07, 0, 0.02, 0, 0xf7fafc, { rough: 0.7, opacity: 0.7, transparent: true });
    box(overglove, 0.09, 0.015, 0.06, 0, 0.05, 0, 0xe9f2f8, { rough: 0.75, opacity: 0.6, transparent: true });
    holoTag(overglove, "Overglove", 0, 0.1, 0, { css: ORTHA_CSS, w: 0.3 });
    reg(hits, overglove, "overglove");

    const moduleWaste = group(moduleCounter, 0.3, 0.9, 0.06);
    cyl(moduleWaste, 0.04, 0.032, 0.07, 0, 0.035, 0, 0x8fa3b5, { rough: 0.5, metal: 0.2, seg: 14, open: true, side: 2 });
    for (let i = 0; i < 3; i++) {
      torus(moduleWaste, 0.0055, 0.0022, -0.012 + (i % 2) * 0.02, 0.012 + Math.floor(i / 2) * 0.008, 0.008,
        ORTHA_MODULE_TONES[i], { rough: 0.6, seg: 6, seg2: 10 });
    }
    holoTag(moduleWaste, "Module waste", 0, 0.12, 0, { css: ORTHA_CSS, w: 0.36 });
    reg(hits, moduleWaste, "module-waste");

    // The open bulk bag — the hazard.
    const bulkBag = group(moduleCounter, 0.5, 0.92, -0.12, -0.3);
    box(bulkBag, 0.11, 0.07, 0.07, 0, 0.03, 0, 0xeef3f7, { rough: 0.65, opacity: 0.55, transparent: true });
    box(bulkBag, 0.11, 0.02, 0.02, 0, 0.075, -0.02, 0xeef3f7, { rough: 0.65, opacity: 0.4, transparent: true }).rotation.x = 0.5;
    for (let i = 0; i < 4; i++) {
      torus(bulkBag, 0.005, 0.002, -0.035 + i * 0.014, 0.012, 0.01, ORTHA_MODULE_TONES[i % 5], { rough: 0.6, seg: 6, seg2: 10 });
    }
    holoTag(bulkBag, "Bulk bag — open", 0, 0.13, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, bulkBag, "bulk-module-bag");

    // ------------------------------------------------------------------- PPE
    const ppe = group(g, -2.05, 0, -1.6, -0.75);
    slab(ppe, 0.52, 1.44, 0.11, 0, 0.72, 0, 0x5b6771, { radius: 0.02, rough: 0.5, metal: 0.35 });
    slab(ppe, 0.56, 0.05, 0.16, 0, 0.02, 0, 0x3a4249, { radius: 0.02, rough: 0.55, metal: 0.3 });
    const orthoGloves = box(ppe, 0.19, 0.13, 0.08, -0.13, 0.86, 0.08, 0x6fa8d6, { rough: 0.7 });
    box(ppe, 0.16, 0.03, 0.06, -0.13, 0.95, 0.08, 0x8fc4e8, { rough: 0.75 });
    holoTag(ppe, "Gloves", -0.13, 1.0, 0.08, { css: ORTHA_CSS, w: 0.26 });
    reg(hits, orthoGloves, "ortho-gloves");
    const orthoMask = box(ppe, 0.13, 0.08, 0.03, 0.13, 0.9, 0.08, 0xe6eef4, { rough: 0.7 });
    cyl(ppe, 0.002, 0.002, 0.1, 0.13, 0.9, 0.095, 0xcdd7de, { rough: 0.8, seg: 6 }).rotation.z = 0.6;
    holoTag(ppe, "Mask", 0.13, 1.0, 0.08, { css: ORTHA_CSS, w: 0.22 });
    reg(hits, orthoMask, "ortho-mask");
    const orthoEyewear = group(ppe, 0, 1.28, 0.08);
    box(orthoEyewear, 0.19, 0.07, 0.005, 0, 0, 0.012, 0xcfeaf6, { rough: 0.2, opacity: 0.5, transparent: true });
    box(orthoEyewear, 0.03, 0.07, 0.03, -0.1, 0, 0, 0x2f5f7c, { rough: 0.35, metal: 0.2 });
    box(orthoEyewear, 0.03, 0.07, 0.03, 0.1, 0, 0, 0x2f5f7c, { rough: 0.35, metal: 0.2 });
    box(orthoEyewear, 0.2, 0.014, 0.014, 0, 0.042, 0, 0x2f5f7c, { rough: 0.35, metal: 0.2 });
    holoTag(ppe, "Eye protection", 0, 1.4, 0.08, { css: ORTHA_CSS, w: 0.38 });
    reg(hits, orthoEyewear, "ortho-eyewear");

    // -------------------------------------------------------- boards / charts
    const dutiesBoard = holoPanel(g, 0.66, 0.46, -1.35, 1.52, -2.25, (cx, w, h) => {
      cx.fillStyle = "rgba(8,16,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = ORTHA_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#cfe0fa";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ALLOWABLE DUTIES — THIS STATE", w * 0.06, h * 0.14);
      cx.fillStyle = "#eef4ff";
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Practice act list, posted", "DANB COA on file", "Supervision level named",
        "Passing vs. placing: read it"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { accent: ORTHA_ACCENT });
    reg(hits, dutiesBoard, "duties-board");

    const chartNote = holoPanel(g, 0.58, 0.4, 1.9, 1.42, -1.7, (cx, w, h) => {
      cx.fillStyle = "rgba(8,18,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#cfeedd";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("PROGRESS NOTE", w * 0.06, h * 0.15);
      cx.fillStyle = "#eaf6f0";
      cx.font = `${Math.round(h * 0.088)}px Arial, sans-serif`;
      ["Brackets bonded: UL 1-5", "Archwire: size / material", "Modules: colour",
        "Next adjustment: interval"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: 0x8fd6a0, ry: -0.5 });
    reg(hits, chartNote, "chart-note");

    const crewBoard = holoPanel(g, 0.54, 0.34, -2.2, 1.4, 0.05, (cx, w, h) => {
      cx.fillStyle = "rgba(10,14,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0b86e"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe2bd";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("CHAIR HANDOVER", w * 0.06, h * 0.16);
      cx.fillStyle = "#fff3e4";
      cx.font = `${Math.round(h * 0.095)}px Arial, sans-serif`;
      ["Cassettes to sterilisation", "Chair 3 next: 14:20", "How is your morning?"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.19)));
    }, { accent: 0xf0b86e, ry: 0.9 });
    reg(hits, crewBoard, "crew-board");

    // ------------------------------------------------------------- room dress
    const cabinetRun = group(g, 0.35, 0, -2.95, 0);
    box(cabinetRun, 2.3, 0.84, 0.5, 0, 0.42, 0, ORTHA_CABINET, { rough: 0.5, metal: 0.12 });
    const runTop = slab(cabinetRun, 2.36, 0.04, 0.54, 0, 0.86, 0, 0xffffff, { radius: 0.01, rough: 0.45 });
    runTop.material = texturedMat(topTex, { rough: 0.45, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 4; i++) {
      box(cabinetRun, 0.54, 0.7, 0.02, -0.86 + i * 0.57, 0.44, 0.26, 0xd3dae0, { rough: 0.5, metal: 0.2 });
      box(cabinetRun, 0.18, 0.018, 0.028, -0.86 + i * 0.57, 0.66, 0.276, 0x8e979f, { rough: 0.4, metal: 0.6 });
    }
    // The colour library, in a rack on the worktop rather than in an overhead
    // cupboard: at spawn the camera looks straight through this wall.
    box(cabinetRun, 0.8, 0.05, 0.26, -0.7, 0.9, 0.06, 0x8e979f, { rough: 0.5, metal: 0.4 });
    for (let k = 0; k < 5; k++) {
      box(cabinetRun, 0.12, 0.08, 0.1, -1.0 + k * 0.15, 0.96, 0.06, ORTHA_MODULE_TONES[k], { rough: 0.6 });
    }

    const sink = group(g, 2.6, 0, -0.35, -Math.PI / 2);
    cyl(sink, 0.16, 0.16, 0.13, 0, 0.84, 0, 0xe4eaee, { rough: 0.3, metal: 0.2, seg: 16, open: true, side: 2 });
    cyl(sink, 0.02, 0.02, 0.28, 0, 1.0, -0.13, ORTHA_STEEL, { rough: 0.28, metal: 0.9, seg: 10 });
    cyl(sink, 0.014, 0.014, 0.12, 0, 1.13, -0.07, ORTHA_STEEL, { rough: 0.28, metal: 0.9, seg: 10 }).rotation.x = 1.2;
    const soap = group(g, 2.7, 0, -0.95, -Math.PI / 2);
    box(soap, 0.09, 0.22, 0.08, 0, 1.15, 0, 0xf2f6f8, { rough: 0.4 });
    box(soap, 0.05, 0.03, 0.05, 0, 1.01, 0.02, 0x3a4249, { rough: 0.5 });
    decal(soap, 0.07, 0.05, 0, 1.24, 0.042, signFace("WASH", { bg: "#f2f6f8", fg: "#1f4a63", accent: ORTHA_CSS, scale: 0.55 }));

    toolChest(g, -2.75, 2.45, { ry: -0.7, color: ORTHA_ACCENT });

    // Progress-photo corner: a camera on a tripod and a mirror on a stand.
    const photoCorner = group(g, 2.3, 0, 1.3, -1.2);
    cyl(photoCorner, 0.1, 0.12, 0.03, 0, 0.015, 0, 0x30363d, { rough: 0.5, metal: 0.4, seg: 14 });
    for (let i = 0; i < 3; i++) {
      const leg = cyl(photoCorner, 0.008, 0.008, 0.92, 0, 0.46, 0, 0x3a4249, { rough: 0.4, metal: 0.6, seg: 8 });
      leg.rotation.z = Math.sin((i / 3) * Math.PI * 2) * 0.14;
      leg.rotation.x = Math.cos((i / 3) * Math.PI * 2) * 0.14;
    }
    box(photoCorner, 0.13, 0.09, 0.07, 0, 0.98, 0, 0x2b3138, { rough: 0.45, metal: 0.3 });
    cyl(photoCorner, 0.032, 0.032, 0.07, 0, 0.98, 0.06, 0x1d2228, { rough: 0.35, metal: 0.4, seg: 14 });
    ball(photoCorner, 0.024, 0, 0.98, 0.1, 0x2f4a6b, { rough: 0.15, metal: 0.5, seg: 12 });

    const mirrorStand = group(g, 2.45, 0, 0.35, -1.5);
    cyl(mirrorStand, 0.13, 0.15, 0.03, 0, 0.015, 0, 0x30363d, { rough: 0.5, metal: 0.4, seg: 14 });
    cyl(mirrorStand, 0.014, 0.014, 1.05, 0, 0.53, 0, 0x5b6771, { rough: 0.4, metal: 0.6, seg: 10 });
    box(mirrorStand, 0.3, 0.42, 0.02, 0, 1.22, 0, 0xdff0f8, { rough: 0.08, metal: 0.6 });
    box(mirrorStand, 0.34, 0.46, 0.015, 0, 1.22, -0.014, 0x5b6771, { rough: 0.45, metal: 0.4 });

    // Ceiling-track light over the chair.
    const opLight = group(g, 0, 0, -0.9);
    cyl(opLight, 0.02, 0.02, 0.5, 0, 2.15, 0, CITY.darkSteel, { rough: 0.35, metal: 0.8, seg: 10 });
    const lightArm = group(opLight, 0, 1.88, 0);
    cyl(lightArm, 0.018, 0.018, 0.8, 0, 0, 0, CITY.darkSteel, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2.6;
    const lightHead = group(lightArm, 0.56, -0.28, -0.1);
    box(lightHead, 0.36, 0.1, 0.24, 0, 0, 0, 0xeef3f6, { rough: 0.3, metal: 0.3 });
    box(lightHead, 0.31, 0.02, 0.2, 0, -0.055, 0, 0xfff6de, { emissive: 0xfff6de, ei: 0.9, rough: 0.3, cast: false });
    cyl(lightHead, 0.012, 0.012, 0.09, 0, -0.08, 0.1, 0xdde4e9, { rough: 0.35, metal: 0.2, seg: 8 });

    // A patient-education poster on the side wall.
    const poster = decal(g, 0.6, 0.42, 2.45, 1.5, -1.05, paperFace("CARE OF YOUR BRACES", [
      "Soft foods for 24 hours", "Brush after every meal", "Nothing hard, sticky or chewy",
      "Ring us if a wire is poking",
    ], { bg: "#f6f1e6", band: "#5f7ea0" }), { px: 320 });
    poster.rotation.y = -Math.PI / 2;

    // The sterilisation pass-through hatch on the back wall.
    const hatch = group(g, -2.75, 0, -0.15, Math.PI / 2);
    box(hatch, 0.6, 0.5, 0.06, 0, 1.4, 0, 0xcfd8de, { rough: 0.5, metal: 0.3 });
    box(hatch, 0.52, 0.42, 0.02, 0, 1.4, 0.04, 0xa9b6bf, { rough: 0.45, metal: 0.4 });
    decal(hatch, 0.4, 0.08, 0, 1.72, 0.04, signFace("STERILISATION", { bg: "#22303c", accent: ORTHA_CSS, scale: 0.4 }), { px: 192 });

    // ------------------------------------------------------------------- crew
    standingFigure(g, 1.05, -2.1, { ry: 2.5, cloth: 0x2f5f7c, skin: 0x8d5a3b, seed: 7 });
    const secondAssistant = standingFigure(g, -1.9, 0.7, { ry: -1.1, cloth: 0x3f7f78, skin: 0xe0b38a, seed: 11 });

    const spatter = particles(g, 26, 0xdff0f8, { size: 0.01, life: 0.35, additive: false, opacity: 0.5 });
    let etching = false, curing = false, looseActive = false, beadActive = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.05, -0.95),

      onStep(step) {
        etching = step.id === "etch-window";
        curing = step.id === "cure-hold";
      },

      onStepComplete(step) {
        if (step.id === "retractor-fit") {
          cheekRetractor.parent.remove(cheekRetractor);
          mouth.add(cheekRetractor);
          cheekRetractor.position.set(0, 0.006, 0.05);
          cheekRetractor.rotation.set(-Math.PI / 2, 0, 0);
        }
        if (step.id === "isolation-gaps") {
          satRoll.visible = false;
          pinchMark.material = mat(0x8fd6a0, { emissive: 0x8fd6a0, ei: 0.3, rough: 0.5 });
          salivaPool.visible = false;
        }
        if (step.id === "rinse-frost") {
          for (const b of brackets) b.material = mat(0xf7f4ec, { rough: 0.7 });
        }
        if (step.id === "cure-hold") {
          for (const b of brackets) b.material = mat(ORTHA_STEEL, { rough: 0.25, metal: 0.9 });
        }
        if (step.id === "archwire-cinch") {
          archwire.visible = true;
          archwireTray.visible = false;
        }
        if (step.id === "wire-end-tuck") unclipped.visible = false;
        if (step.id === "module-dispense") {
          bulkBag.visible = false;
          for (let i = 0; i < brackets.length; i += 2) {
            brackets[i].material = mat(ORTHA_MODULE_TONES[(i / 2) % 5], { rough: 0.55 });
          }
        }
        if (step.id === "appointment-note") {
          repaint(chartNote.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#8fd6a0"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#d8f4e4";
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("PROGRESS NOTE — SIGNED", w * 0.06, h * 0.15);
            cx.fillStyle = "#eaf6f0";
            cx.font = `${Math.round(h * 0.088)}px Arial, sans-serif`;
            ["UL 1-5 bonded, cured", "0.016 upper, cinched distal",
              "Modules: teal, single-use", "Recall 5 weeks"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "etchant-runs-to-tissue") { etchBead.visible = true; beadActive = true; }
        if (it.id === "bracket-comes-loose") {
          looseBracket.visible = true;
          looseActive = true;
          secondAssistant.position.set(-0.9, 0, 0.75);
        }
      },

      onInterruptEnd(it) {
        if (it.id === "etchant-runs-to-tissue") {
          beadActive = false;
          if (it.resolved === "answered") etchBead.visible = false;
        }
        if (it.id === "bracket-comes-loose") {
          looseActive = false;
          if (it.resolved === "answered") {
            looseBracket.visible = false;
            secondAssistant.position.set(-1.9, 0, 0.7);
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        spatter.visible = etching && !!session?.track;
        if (spatter.visible) spatter.userData.step(dt, new THREE.Vector3(0, 1.08, -1.76), 0.06, 0.3, -0.6);
        cureTip.material.emissiveIntensity = curing ? 1.6 + Math.sin(t * 9) * 0.3 : 0.05;
        if (beadActive) etchBlob.material.emissiveIntensity = 0.6 + Math.sin(t * 7) * 0.3;
        if (looseActive) looseBracket.position.x = -0.03 + Math.sin(t * 4) * 0.012;
      },
    };
  },
};
