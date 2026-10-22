import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, mat,
  seatedFigure, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, equipmentCabinet, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Teledentistry & Triage VR — Dental & Oral Health, station two
// hundred and sixteen. A community site's teledentistry room, with the patient
// in the chair and the dentist on the screen: the platform proved compliant
// before a word about anybody's health is said, the room made private, images
// captured well enough to be worth looking at, symptoms triaged against the
// criteria that mean an emergency department rather than an appointment, a
// referral made to the right level of care, and the limits of what a camera can
// answer stated out loud rather than glossed over.
//
// Sited generically. No real platform, no real patient, no invented clause.

const TDT_ACCENT = 0x4fc8b0;
const TDT_STEEL = 0x9aa6ac;
const TDT_DESK = 0x2f4249;
const TDT_CABINET = 0xe8eef0;

export const SIM_TELEDENTISTRY_AND_TRIAGE = {
  id: "teledentistry-and-triage",
  index: "216",
  domain: "Teledentistry and triage",
  trade: "Dental assistant — teledentistry facilitator and triage (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Certified Dental Assistant credential; the state dental practice act and its teledentistry provisions, which set what may be done remotely, who has to be licensed where the patient physically is, and what an assistant may record rather than diagnose; ADA policy on teledentistry, and the ADA's guidance with the FDA on when a radiograph is actually justified; HIPAA's privacy and security rules, including the business associate agreement behind any platform a practice uses; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for the intraoral camera's barrier and reprocessing; OSHA 29 CFR 1910.1030 bloodborne pathogens; FDA-cleared devices used inside their labelled indications",
  name: "Teledentistry & Triage",
  title: simTitle("Teledentistry & Triage"),
  tagline: "A virtual triage session run properly: compliant platform, private room, images worth reading, emergency criteria checked, the right level of care, and the limits of a camera said out loud",
  accent: TDT_ACCENT,
  accentCss: "#4fc8b0",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "right-level", name: "Right Level of Care", note: "A remote triage that sent this patient to the level of care their symptoms actually called for" },

  game: system({
    name: "Remote Triage",
    currency: "TRIA",
    ranks: ["Intake Aide", "Teledentistry Facilitator", "Triage Lead", "Care Navigator", "Teledentistry Certified"],
    badges: [
      { id: "privacy-held", name: "Privacy Held", note: "Nothing about this patient left the room by a route nobody agreed to", test: AWARD.safe },
      { id: "image-worth-reading", name: "Image Worth Reading", note: "Focus and sweep both held near band centre", test: AWARD.precise(0.72) },
      { id: "airway-first", name: "Airway First", note: "The triage worked in order, airway before anything else", test: AWARD.stepClean("triage-order") },
    ],
    challenges: [
      { id: "inside-the-slot", name: "Inside the Slot", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-session", name: "Clean Session", note: "A session with no corrections", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "consumer-chat-app": "That tablet is open on an ordinary consumer video-chat app, suggested because it is quicker. A platform used for care has to sit behind a business associate agreement with safeguards HIPAA actually requires, and a free app has neither — the convenience is real and so is the breach, because once this patient's face and complaint have gone through somebody else's servers there is no taking it back.",
    "referral-routine-slot": "That is the routine recall diary, six weeks out. Booking a spreading swelling into it is the single most dangerous thing anybody does on a triage line: the patient hears that they have an appointment, stops worrying, and the infection carries on into the spaces around the airway while they wait their turn. Urgency is decided by the symptoms, never by what the diary has free.",
    "unencrypted-usb": "That is a plain memory stick with today's intraoral captures copied onto it. Clinical images are identifiable health information, and an unencrypted stick in a coat pocket is the commonest way a small practice loses a patient's record entirely — the images belong in the record system the practice already secures, and nowhere else.",
    "scope-diagnosis-form": "That form has a space for you to write a diagnosis. Recording what the patient reports and what the camera shows is your job; deciding what it is, and what to prescribe for it, belongs to the licensed dentist under the practice act — including on a remote visit. A well-meant diagnosis written by an assistant is both outside scope and the thing a patient will quote back to everybody afterwards.",
  },

  lateNotes: {
    "intraoral-camera": "The camera is picked up once it has a fresh barrier on it and the platform is proved secure — not before either.",
    "referral-urgent": "The referral is made after the triage questions are answered, not from the first thing the patient said.",
    "capture-card": "Images go into the record once they are captures worth keeping — after the focus is set, not before.",
  },

  steps: [
    {
      id: "platform-check", kind: "select", target: "platform-console",
      title: "Prove the platform is one this practice may use",
      cue: "Check the platform's agreement, its encryption and its waiting room before the patient is admitted.",
      why: "Before a word about anybody's health crosses a network, three things have to be true: the practice holds a business associate agreement with whoever runs the platform, the session is encrypted end to end, and the virtual waiting room is locked so that nobody joins a consultation they were not invited to. Those are the safeguards HIPAA's security rule asks for rather than optional features, and the recording setting is checked at the same time, because a consultation recorded without consent is a disclosure nobody authorised.",
    },
    {
      id: "privacy-check", kind: "find", noHint: true,
      targets: ["door-ajar", "shared-login", "spare-camera-unsheathed"],
      itemNames: {
        "door-ajar": "the door left open onto the waiting area",
        "shared-login": "the shared login left signed in",
        "spare-camera-unsheathed": "the spare camera head with no barrier on it",
      },
      itemNotes: {
        "door-ajar": "The door is open onto a waiting area. Everything the patient says about their own mouth, and everything the dentist says back through the speaker, is audible to strangers — privacy in a remote consultation is mostly a matter of the room it happens in.",
        "shared-login": "A shared account, still signed in from the last session. A record that cannot be traced to an individual user cannot be audited at all, which is the point of the access controls a practice is meant to operate.",
        "spare-camera-unsheathed": "The spare camera head has no single-use barrier on it and is still damp. An intraoral camera goes into mouth after mouth, and the sheath is what makes that acceptable between the reprocessing the manufacturer specifies.",
      },
      title: "Make the room private before you admit anybody",
      cue: "Three things in this room would leak this consultation. Find them first.",
      why: "A remote consultation fails on privacy long before it fails on technology. An open door makes the whole conversation public to a waiting room, a shared login means nothing that happens next can be attributed to a person, and an unsheathed camera head is an infection-control problem that arrives with the next patient rather than this one. All three are visible from where you are standing and take a minute between them.",
    },
    {
      id: "identity-consent", kind: "select", target: "consent-panel",
      title: "Verify who the patient is, where they are, and that they agree to this",
      cue: "Confirm identity and the state the patient is physically in, and record consent to a remote visit.",
      why: "Three facts have to be established out loud at the start. Who the patient is, because a remote visit has no reception desk to check a card; where they physically are, because the dentist has to be licensed in that state and the practice act follows the patient rather than the clinician; and that they understand and accept how this appointment works, including what it cannot do and what it costs. Consent to a remote consultation is its own consent, recorded as such, not something inherited from the last in-person visit.",
    },
    {
      id: "triage-order", kind: "sequence",
      targets: ["check-airway", "check-swelling", "check-bleeding"],
      itemNames: { "check-airway": "breathing, voice and swallowing", "check-swelling": "where the swelling has spread to", "check-bleeding": "bleeding and trauma" },
      title: "Work the emergency criteria in order",
      cue: "Airway first: breathing, voice and swallowing. Then the swelling's spread. Then bleeding and trauma.",
      why: "Triage has an order for the same reason resuscitation does: the thing that kills fastest is asked about first. Difficulty breathing, a changed voice, drooling or an inability to swallow means an airway that is being compromised by swelling and an emergency department now, not an appointment. Only after that is the swelling's extent worth mapping — an eye closing, a firm swelling under the jaw or in the floor of the mouth, a fever — and bleeding and trauma after that. Asked in the wrong order, the first interesting answer is the one that gets followed, and the airway question never gets asked.",
      outOfOrderNote: "Wrong order — airway comes first, every time. A swelling you have measured carefully is no use if nobody asked whether the patient could still swallow.",
    },
    {
      id: "sheath-camera", kind: "select", target: "camera-sheath",
      title: "Barrier the camera and set the patient's lighting",
      cue: "Put a fresh single-use barrier on the camera head and position the light before it goes near the mouth.",
      why: "The barrier does two jobs: it keeps the camera's optics out of contact with saliva and blood, which is what makes it acceptable between patients under the CDC's dental infection-control guidance, and it keeps the camera itself — an FDA-cleared device with a manufacturer's reprocessing instruction — usable rather than damaged by repeated disinfection. The light is set at the same time because a barrier costs a little clarity, and light is what buys it back.",
    },
    {
      id: "focus-set", kind: "gauge", target: "camera-focus",
      title: "Set the focus until the lesion is actually legible",
      cue: "Set the focus so the tissue margin is sharp, then commit the reading.",
      why: "An image that is nearly in focus is worse than no image, because somebody will make a decision on it anyway. A remote dentist has no fingers in this mouth and no tactile information at all — the photograph is the examination, so the margin of the lesion, the colour of the tissue and the gum line have to be genuinely sharp. Out of focus, a soft carious lesion and a stain look the same, and so do an ulcer worth watching and one worth a biopsy.",
      gauge: {
        label: "CAMERA FOCUS", speed: 0.78, green: [0.36, 0.6],
        readout: (t) => (t < 0.36 ? "soft — margins unreadable" : t > 0.6 ? "hunting — past focus" : "sharp at the margin"),
        missNote: "Not sharp at the margin. Move the head rather than the focus ring until the tissue edge is crisp — a nearly focused image still gets a decision made on it.",
      },
    },
    {
      id: "capture-hold", kind: "hold", target: "intraoral-camera", seconds: 9,
      title: "Hold the camera steady for the capture",
      cue: "Hold the camera still on the swelling, with the light on it, for the full capture.",
      why: "Holding still is the whole of image quality on a hand-held intraoral camera: the sensor is small, the light is close and the exposure is long enough that a shaking hand turns the tissue margin into a smear. The capture is also framed with something for scale and with the neighbouring teeth in shot, so that whoever opens it later can tell which tooth it is — an immaculate photograph of an unidentifiable tooth answers nothing at all.",
      holdBreakNote: "You moved before the capture finished. Reframe and hold — a blurred capture is a capture somebody will still try to read.",
    },
    {
      id: "arch-sweep", kind: "track", target: "camera-arm", seconds: 10,
      title: "Sweep the arch at a steady pace",
      cue: "Talk the patient through opening wider and sweep the arch steadily, keeping the field lit.",
      why: "A single photograph of the thing the patient pointed at is not an examination; the sweep is what puts it in context and catches what nobody mentioned. Steady is the requirement — too fast and every frame is motion-blurred, too slow and the patient's jaw tires and closes on the camera. Narrating what you are doing as you go keeps a patient who cannot see the screen cooperating, and it is also how the remote dentist knows which part of the mouth they are looking at.",
      track: {
        start: 0.12, green: [0.34, 0.58], rise: 0.5, fall: 0.44, drift: 0.12, label: "SWEEP RATE",
        readout: (v) => (v < 0.34 ? "stalled — jaw will tire" : v > 0.58 ? "too fast — frames blurring" : "steady and lit"),
      },
      holdBreakNote: "The sweep went out of band. Bring the pace back — blurred frames are frames the dentist cannot use, and a tired jaw closes on the camera.",
    },
    {
      id: "triage-score", kind: "select", target: "triage-matrix",
      title: "Score the case against the criteria",
      cue: "Mark the findings against the emergency criteria on the matrix and read the level it lands on.",
      why: "The matrix exists so that the decision is made by the criteria rather than by how worried anybody sounds: airway involvement, swelling crossing into the eye, the submandibular space or the floor of the mouth, a fever with a rising pulse, uncontrolled bleeding, or trauma with a displaced or avulsed tooth. Each has a level of care attached to it, and writing the findings against the criteria is what makes the referral defensible — and what stops a frightened patient with a manageable problem being escalated while a calm one with a spreading infection is not.",
    },
    {
      id: "light-set", kind: "turn", target: "ring-light",
      title: "Turn the ring light to what the camera needs",
      cue: "Turn the ring light up for the intraoral view and down again for the patient's face.",
      why: "Two different shots need two different lights. Inside the mouth the camera is fighting a small aperture and a dark cavity, so it wants as much light as the patient can tolerate; on the face, the same setting blows out the skin and hides exactly the asymmetry and redness that a swelling is judged by. Turning the light deliberately between the two is a ten-second habit that decides whether a remote dentist is looking at evidence or at a bright smear.",
      turn: { turns: 0.75, axis: "z", label: "RING LIGHT" },
    },
    {
      id: "referral-level", kind: "select", target: "referral-urgent",
      title: "Refer to the level of care the findings call for",
      cue: "Take the same-day urgent card, not the routine diary and not a reassurance.",
      why: "The whole value of a triage call is that it puts a patient in the right place first time. This one — a spreading swelling with a fever, no airway involvement yet — is a same-day urgent appointment for drainage and definitive care, escalating to an emergency department the moment breathing, swallowing or voice change. Saying which level, why, and what would change it is the referral; a vague instruction to see somebody soon leaves the patient to triage themselves, which is what they rang to avoid.",
    },
    {
      id: "remote-limits", kind: "find", noHint: true,
      targets: ["limit-probing", "limit-vitality", "limit-radiograph"],
      itemNames: {
        "limit-probing": "periodontal probing depths",
        "limit-vitality": "percussion and pulp vitality testing",
        "limit-radiograph": "anything inside the bone or root",
      },
      itemNotes: {
        "limit-probing": "No camera measures a pocket. Attachment loss, mobility and bleeding on probing all need an instrument and a hand in the mouth, and a photograph of healthy-looking gums says nothing about the bone underneath.",
        "limit-vitality": "Whether a tooth is alive, and whether percussion hurts, are findings you get by tapping and testing — not by looking. A remote visit can describe a symptom but cannot make that diagnosis.",
        "limit-radiograph": "Caries under a restoration, a periapical lesion, a fracture in a root and the bone level are all invisible on any photograph. Whether a radiograph is justified at all is a clinical judgement the ADA's guidance with the FDA ties to a real diagnostic question, and it is made in person.",
      },
      title: "State what this visit could not establish",
      cue: "Name the three things this consultation cannot answer, on the record.",
      why: "A remote consultation is an excellent way to sort urgency and a poor way to make a diagnosis, and the honest version of it says so. Probing depths, pulp vitality and anything inside bone or root are simply not visible to a camera, which means a patient who has been seen remotely has not been examined — and the record has to say that, in those words, so nobody downstream mistakes a triage note for an assessment. Stating the limits out loud is also what stops a patient believing they have already been checked over.",
    },
    {
      id: "attach-captures", kind: "drag", target: "capture-card",
      title: "Put the captures into the patient's record",
      cue: "Carry the capture card to the record terminal and file the images against this patient.",
      why: "Images that are not in the record might as well not exist: the dentist who sees this patient in four hours needs them, and so does anybody comparing the swelling next week. Filing them into the practice's own system — rather than leaving them on the camera, on a phone or on a memory stick — is both a clinical necessity and the whole of what HIPAA's security rule is asking for, because the record system is the place the practice has actually secured, backed up and made auditable.",
      drag: { to: "record-terminal", radius: 0.5, missNote: "Not filed. Captures left anywhere but the record are images the next clinician will never find and the practice cannot account for." },
    },
    {
      id: "team-checkin", kind: "select", target: "team-checkin",
      title: "Check in with the dentist of record and the site staff",
      cue: "Confirm the plan with the dentist on the screen and with whoever is on site with the patient.",
      why: "A remote consultation ends with two people who both have to be certain of the same plan: the dentist who owns the clinical decision, and the person physically beside the patient who will act on it — booking the urgent slot, arranging the transport, watching for the airway signs on the way. Reading the plan back to both of them catches the half of misunderstandings that come from a dropped word on a speaker, and it is the moment anybody uneasy about the decision can say so.",
    },
    {
      id: "visit-log", kind: "select", target: "visit-log",
      title: "Document the session and hand over",
      cue: "Record the platform, the consent, the findings, the criteria applied, the referral and the stated limits.",
      why: "The note is the only trace a remote visit leaves, so it has to carry all of it: that the consultation was remote and on which platform, that consent was taken, who was present, what the patient reported, what the captures showed, which emergency criteria were checked and what they returned, the level of care referred to and by when, the red-flag instructions given, and what the visit could not establish. A note that records only the conclusion leaves the next clinician unable to tell a triaged patient from an examined one.",
    },
  ],

  interrupts: [
    {
      id: "encryption-dropped",
      kind: "Privacy breach",
      after: "capture-hold", delay: 3, seconds: 12,
      alert: "A banner has come up on the console: the session has dropped out of its encrypted channel and is continuing on an unsecured fallback.",
      cue: "The session is no longer encrypted — end it.",
      target: "end-session",
      why: "An unsecured channel carrying a patient's face, name and complaint is a disclosure in progress, and it does not stop being one because the consultation is nearly finished. The session ends, it is restarted on the compliant platform, and the drop-out is written down — a platform that falls back to an unencrypted route is a platform the practice has to ask its supplier about.",
      missNote: "The consultation carried on unencrypted. Nothing visible goes wrong, which is why this one gets ignored — and why the breach is discovered later by somebody else, with this patient's images in it.",
      wrongNote: "It is the end-session control. Nothing you adjust inside a session that has already fallen back to an unsecured channel puts the encryption back.",
    },
    {
      id: "airway-red-flag",
      kind: "Emergency criterion",
      after: "arch-sweep", delay: 3, seconds: 12,
      alert: "The patient's voice has gone muffled and thick, they are drooling slightly and they say they cannot swallow properly now.",
      cue: "Voice changed, drooling, cannot swallow — this is the airway.",
      target: "escalate-emergency",
      why: "A muffled voice, drooling and difficulty swallowing are the signs of swelling reaching the spaces around the airway, and that progresses over hours rather than days. It stops being a dental appointment at that moment: the escalation goes out to emergency services and the emergency department, and nobody waits for the sweep to finish or for a dentist to become free.",
      missNote: "The sweep continued. An airway compromised by a spreading dental infection closes over hours, and the patients who die of one are the patients who were given an appointment for later in the week.",
      wrongNote: "It is the emergency escalation. A booking, a prescription request or a better photograph all take time this patient's airway does not have.",
    },
  ],

  supportLine: "If a session leaves you carrying something heavy — a patient in real trouble, or a call you are unsure you handled — your union's member assistance programme runs a confidential line for clinic staff, and the state's dental board publishes the practice-act guidance if the question is about scope rather than about you.",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.2, TDT_ACCENT);

    const deskTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#e4eaec", base2: "#d8e0e3", seam: "rgba(0,0,0,0.07)",
    }), { repeat: 3, px: 256 });

    // ------------------------------------------------------------ the consult desk
    const desk = group(g, 0.85, 0, -1.2, -0.5);
    const deskTop = slab(desk, 1.25, 0.05, 0.6, 0, 0.75, 0, 0xe4eaec, { radius: 0.02, rough: 0.4, metal: 0.1 });
    deskTop.material = texturedMat(deskTex, { rough: 0.5, metal: 0.05, color: 0xffffff });
    for (const sx of [-1, 1]) {
      slab(desk, 0.06, 0.74, 0.55, sx * 0.58, 0.37, 0, TDT_DESK, { radius: 0.02, rough: 0.5, metal: 0.2 });
    }
    slab(desk, 1.2, 0.3, 0.04, 0, 0.55, -0.28, TDT_DESK, { radius: 0.02, rough: 0.5, metal: 0.2 });

    // The video call itself, on a monitor on a stand.
    const monitorStand = group(desk, -0.2, 0.78, -0.16);
    cyl(monitorStand, 0.07, 0.09, 0.02, 0, 0.01, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 16 });
    cyl(monitorStand, 0.018, 0.018, 0.2, 0, 0.11, 0, TDT_STEEL, { rough: 0.35, metal: 0.8, seg: 10 });
    const monitorBody = slab(monitorStand, 0.52, 0.33, 0.03, 0, 0.37, 0, 0x22282e, { radius: 0.01, rough: 0.5, metal: 0.2 });
    void monitorBody;
    const callScreen = holoPanel(desk, 0.46, 0.27, -0.2, 1.15, -0.14, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,26,30,0.95)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fc8b0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#cdefe7";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONSULTATION — DENTIST OF RECORD", w * 0.05, h * 0.16);
      ctx.fillStyle = "#e6faf5";
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ["Encrypted: end to end", "Waiting room: locked", "Recording: off", "Agreement: on file"]
        .forEach((line, i) => ctx.fillText(line, w * 0.05, h * 0.38 + i * h * 0.15));
    }, { accent: TDT_ACCENT });
    reg2(callScreen, "platform-console");
    const endSession = group(desk, 0.14, 0.79, -0.12);
    box(endSession, 0.09, 0.03, 0.06, 0, 0, 0, 0xd8342a, { rough: 0.5 });
    decal(endSession, 0.075, 0.04, 0, 0.017, 0, signFace("END", { bg: "#5a1210", accent: "#ffd2ce", scale: 0.45 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(endSession, "End session", 0, 0.1, 0, { css: "#f0645b", w: 0.28 });
    reg2(endSession, "end-session");

    // The login terminal and the record system, side by side on the desk.
    const loginPad = group(desk, 0.4, 0.79, 0.06, -0.2);
    slab(loginPad, 0.24, 0.02, 0.16, 0, 0, 0, 0x2f3740, { radius: 0.01, rough: 0.5 });
    const loginFace = decal(loginPad, 0.2, 0.12, 0, 0.013, 0,
      signFace("SHARED LOGIN", { bg: "#2a1a10", accent: "#f0a35b", scale: 0.35 }), { px: 224, glow: true, ei: 0.6 });
    loginFace.rotation.x = -Math.PI / 2;
    reg2(loginFace, "shared-login");
    const recordTerminal = group(desk, 0.4, 0.79, -0.18, -0.2);
    slab(recordTerminal, 0.26, 0.02, 0.16, 0, 0, 0, 0x2f3740, { radius: 0.01, rough: 0.5 });
    const recordFace = decal(recordTerminal, 0.22, 0.12, 0, 0.013, 0,
      paperFace("PATIENT RECORD", ["Attach captures", "here"], { bg: "#eef4f6" }), { px: 224 });
    recordFace.rotation.x = -Math.PI / 2;
    reg2(recordTerminal, "record-terminal");
    const captureCard = group(desk, 0.12, 0.79, 0.14);
    box(captureCard, 0.08, 0.012, 0.05, 0, 0, 0, 0xf2f5f7, { rough: 0.4 });
    decal(captureCard, 0.065, 0.035, 0, 0.008, 0, signFace("4 IMAGES", { bg: "#f2f5f7", fg: "#1d4a4a", accent: "#4fc8b0", scale: 0.35 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg2(captureCard, "capture-card");
    const usbStick = group(desk, 0.52, 0.78, 0.2, 0.4);
    box(usbStick, 0.05, 0.012, 0.018, 0, 0, 0, 0x4a545a, { rough: 0.5 });
    box(usbStick, 0.016, 0.008, 0.014, 0.03, 0, 0, 0xb8c0c6, { rough: 0.3, metal: 0.7 });
    holoTag(usbStick, "Unencrypted stick", 0, 0.07, 0, { css: "#f0645b", w: 0.38 });
    reg2(usbStick, "unencrypted-usb");
    const consumerTablet = group(desk, -0.5, 0.79, 0.16, 0.5);
    slab(consumerTablet, 0.2, 0.012, 0.14, 0, 0, 0, 0x1b1e22, { radius: 0.01, rough: 0.4 });
    decal(consumerTablet, 0.17, 0.11, 0, 0.008, 0, signFace("CHAT APP", { bg: "#123048", accent: "#7fd8f8", scale: 0.35 }), { px: 192 }).rotation.x = -Math.PI / 2;
    holoTag(consumerTablet, "No agreement behind it", 0, 0.09, 0, { css: "#f0645b", w: 0.46 });
    reg2(consumerTablet, "consumer-chat-app");
    const diagnosisForm = group(desk, -0.5, 0.79, -0.08, -0.3);
    box(diagnosisForm, 0.16, 0.006, 0.12, 0, 0, 0, 0xf6f2ea, { rough: 0.6 });
    decal(diagnosisForm, 0.14, 0.1, 0, 0.005, 0,
      paperFace("TRIAGE FORM", ["Diagnosis: ______", "Prescribe: ______"], { bg: "#faf6ec" }), { px: 224 }).rotation.x = -Math.PI / 2;
    holoTag(diagnosisForm, "Diagnosis line", 0, 0.08, 0, { css: "#f0a35b", w: 0.32 });
    reg2(diagnosisForm, "scope-diagnosis-form");

    // ------------------------------------------------------------ the patient side
    const chairBase = group(g, -0.75, 0, -0.9, 0.5);
    cyl(chairBase, 0.22, 0.26, 0.09, 0, 0.045, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 20 });
    cyl(chairBase, 0.085, 0.095, 0.38, 0, 0.28, 0, TDT_STEEL, { rough: 0.35, metal: 0.75, seg: 16 });
    const seatGroup = group(chairBase, 0, 0.47, 0);
    slab(seatGroup, 0.6, 0.13, 0.62, 0, 0, 0.26, 0x35606b, { radius: 0.07, rough: 0.6 });
    const chairBack = group(seatGroup, 0, 0.05, -0.2);
    slab(chairBack, 0.58, 0.85, 0.13, 0, 0.4, 0, 0x35606b, { radius: 0.07, rough: 0.6 });
    chairBack.rotation.x = 0.28;
    slab(chairBack, 0.33, 0.24, 0.1, 0, 0.92, 0.02, 0x35606b, { radius: 0.06, rough: 0.6 });
    const patient = seatedFigure(seatGroup, 0, 0.08, 0.34, { skin: 0xc98c5e, cloth: 0x8c6a7a });
    patient.root.rotation.x = 0.28;
    patient.torso.rotation.x = -0.03;
    // The swelling the consultation is about, on the patient's left cheek.
    const swelling = ball(patient.head, 0.032, -0.055, -0.02, 0.03, 0xd88a7a, { rough: 0.6 });
    swelling.scale.set(1, 0.8, 0.8);
    holoTag(patient.head, "Swelling — left cheek", -0.02, 0.15, 0.04, { css: "#f0a35b", w: 0.44 });

    // The kiosk arm: intraoral camera, its cradle, sheaths and the ring light.
    const kiosk = group(g, -0.05, 0, -0.55, -0.3);
    cyl(kiosk, 0.2, 0.22, 0.03, 0, 0.015, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(kiosk, 0.028, 0.032, 1.1, 0, 0.56, 0, TDT_STEEL, { rough: 0.35, metal: 0.8, seg: 12 });
    const cameraArm = group(kiosk, 0, 1.12, 0.06);
    cyl(cameraArm, 0.018, 0.018, 0.4, 0, 0, 0, TDT_STEEL, { rough: 0.35, metal: 0.8, seg: 10 });
    cameraArm.rotation.x = Math.PI / 2.6;
    reg2(cameraArm, "camera-arm");
    const camera = group(kiosk, 0, 1.24, 0.24);
    cyl(camera, 0.016, 0.019, 0.16, 0, 0, 0, 0xf2f5f7, { rough: 0.3, metal: 0.2, seg: 12 });
    const cameraTip = cyl(camera, 0.011, 0.013, 0.05, 0, 0.1, 0.01, 0xdfe8ee, { rough: 0.2, metal: 0.3, seg: 12 });
    const cameraLens = ball(camera, 0.008, 0, 0.125, 0.012, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.0, rough: 0.2 });
    camera.rotation.x = 0.5;
    hose(kiosk, [[0, 1.24, 0.24], [0, 1.0, 0.16], [0, 0.8, 0.06]], 0.009, 0x2b3138, { steps: 12, rough: 0.7 });
    reg2(camera, "intraoral-camera");
    const sheathBox = group(kiosk, 0.16, 0.98, 0.1, 0.3);
    box(sheathBox, 0.12, 0.06, 0.08, 0, 0, 0, 0x4fc8b0, { rough: 0.5 });
    decal(sheathBox, 0.1, 0.04, 0, 0.031, 0, signFace("SHEATHS", { bg: "#0f4a44", accent: "#8fe6d8", scale: 0.35 }), { px: 128 }).rotation.x = -Math.PI / 2;
    for (let i = 0; i < 3; i++) box(sheathBox, 0.012, 0.02, 0.05, -0.02 + i * 0.02, 0.04, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.6, cast: false });
    reg2(sheathBox, "camera-sheath");
    const spareCamera = group(kiosk, -0.18, 0.96, 0.12, -0.4);
    cyl(spareCamera, 0.015, 0.018, 0.14, 0, 0, 0, 0xe4ecef, { rough: 0.35, metal: 0.2, seg: 12 });
    spareCamera.rotation.z = Math.PI / 2;
    holoTag(spareCamera, "No barrier — still damp", 0, 0.07, 0, { css: "#f0645b", w: 0.46 });
    reg2(spareCamera, "spare-camera-unsheathed");
    const focusDial = instrument(kiosk, 0.02, 0.86, -0.1, { w: 0.12, d: 0.16, idle: "focus --", color: TDT_ACCENT, ry: 0.2 });
    reg2(focusDial, "camera-focus");
    const ringLight = group(kiosk, 0, 1.36, 0.1);
    const ringBody = torus(ringLight, 0.1, 0.014, 0, 0, 0, 0xe8eef0, { rough: 0.4, seg: 8, seg2: 24 });
    const ringGlow = torus(ringLight, 0.1, 0.008, 0, 0, 0.012, 0xfff8e8, { emissive: 0xfff8e8, ei: 1.3, rough: 0.3, seg: 6, seg2: 24, cast: false });
    ringBody.rotation.x = 0.4; ringGlow.rotation.x = 0.4;
    const ringDial = cyl(ringLight, 0.02, 0.02, 0.016, 0.13, -0.04, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6, seg: 14 });
    ringDial.rotation.z = Math.PI / 2;
    reg2(ringDial, "ring-light");

    // --------------------------------------------------------- the triage wall
    const triageMatrix = holoPanel(g, 0.64, 0.46, -1.95, 1.5, -0.35, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,24,24,0.93)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fc8b0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#cdefe7";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("EMERGENCY CRITERIA", w * 0.05, h * 0.12);
      ctx.fillStyle = "#e6faf5";
      ctx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`;
      ["Airway: voice, drooling, swallow", "Swelling: eye, jaw, floor of mouth",
        "Fever with rising pulse", "Bleeding that will not stop",
        "Trauma: displaced or avulsed tooth", "None of these: urgent or routine"]
        .forEach((line, i) => ctx.fillText(line, w * 0.05, h * 0.28 + i * h * 0.12));
    }, { ry: 0.4, accent: TDT_ACCENT });
    const checkAirway = decal(triageMatrix, 0.1, 0.05, -0.24, 0.05, 0.01,
      signFace("AIRWAY", { bg: "#0d2a2a", accent: "#f0645b", scale: 0.35 }), { px: 128 });
    reg2(checkAirway, "check-airway");
    const checkSwelling = decal(triageMatrix, 0.1, 0.05, -0.24, -0.02, 0.01,
      signFace("SPREAD", { bg: "#0d2a2a", accent: "#f0a35b", scale: 0.35 }), { px: 128 });
    reg2(checkSwelling, "check-swelling");
    const checkBleeding = decal(triageMatrix, 0.1, 0.05, -0.24, -0.16, 0.01,
      signFace("BLEED", { bg: "#0d2a2a", accent: "#f2c14b", scale: 0.35 }), { px: 128 });
    reg2(checkBleeding, "check-bleeding");
    const matrixMark = decal(triageMatrix, 0.12, 0.05, 0.22, -0.18, 0.01,
      signFace("SCORE", { bg: "#0d2a2a", accent: "#4fc8b0", scale: 0.35 }), { px: 128 });
    reg2(matrixMark, "triage-matrix");

    const limitsBoard = holoPanel(g, 0.56, 0.4, 1.85, 1.5, 0.75, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,18,10,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0a35b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe8d0";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("A CAMERA CANNOT TELL YOU", w / 2, h * 0.15);
    }, { ry: -1.0, accent: 0xf0a35b });
    const limitProbing = decal(limitsBoard, 0.2, 0.07, 0, 0.06, 0.01,
      signFace("POCKET DEPTHS", { bg: "#2a1a08", accent: "#f0a35b", scale: 0.3 }), { px: 192 });
    reg2(limitProbing, "limit-probing");
    const limitVitality = decal(limitsBoard, 0.2, 0.07, 0, -0.03, 0.01,
      signFace("VITALITY", { bg: "#2a1a08", accent: "#f2c14b", scale: 0.35 }), { px: 192 });
    reg2(limitVitality, "limit-vitality");
    const limitRadiograph = decal(limitsBoard, 0.2, 0.07, 0, -0.12, 0.01,
      signFace("BONE + ROOT", { bg: "#2a1a08", accent: "#e8d8b8", scale: 0.3 }), { px: 192 });
    reg2(limitRadiograph, "limit-radiograph");

    // Referral rack: urgent, routine diary, and the escalation line.
    const rack = group(g, 1.55, 0, -0.55, -0.7);
    slab(rack, 0.4, 0.5, 0.06, 0, 1.15, 0, TDT_DESK, { radius: 0.02, rough: 0.5 });
    cyl(rack, 0.024, 0.028, 0.95, 0, 0.48, 0, TDT_STEEL, { rough: 0.4, metal: 0.7, seg: 10 });
    const urgentCard = box(rack, 0.16, 0.11, 0.012, -0.09, 1.24, 0.04, 0x59c97b, { rough: 0.5 });
    decal(urgentCard, 0.14, 0.09, 0, 0, 0.008, paperFace("SAME DAY", ["Urgent care", "today"], { bg: "#e8f8ec" }), { px: 192 });
    reg2(urgentCard, "referral-urgent");
    const routineCard = box(rack, 0.16, 0.11, 0.012, 0.09, 1.24, 0.04, 0xb8c0c6, { rough: 0.5 });
    decal(routineCard, 0.14, 0.09, 0, 0, 0.008, paperFace("ROUTINE", ["Recall diary", "6 weeks"], { bg: "#eef0f2" }), { px: 192 });
    holoTag(routineCard, "Six weeks out", 0, 0.09, 0, { css: "#f0645b", w: 0.3 });
    reg2(routineCard, "referral-routine-slot");
    const escalate = group(rack, 0, 1.02, 0.05);
    box(escalate, 0.14, 0.1, 0.05, 0, 0, 0, 0xd8342a, { rough: 0.55 });
    const escalateLamp = ball(escalate, 0.014, 0.05, 0.06, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.7, rough: 0.4 });
    const handset = group(escalate, -0.02, 0.07, 0.02);
    box(handset, 0.11, 0.025, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    for (const sx of [-1, 1]) box(handset, 0.025, 0.035, 0.03, sx * 0.042, -0.02, 0, 0x2b3138, { rough: 0.5 });
    decal(escalate, 0.12, 0.035, 0, -0.04, 0.026, signFace("EMERGENCY", { bg: "#5a1210", accent: "#ffd2ce", scale: 0.35 }), { px: 160 });
    reg2(escalate, "escalate-emergency");

    // The door onto the waiting area, and the privacy screen beside it.
    const doorway = group(g, -2.0, 0, 1.25, 0.9);
    for (const sx of [-1, 1]) box(doorway, 0.07, 2.05, 0.12, sx * 0.45, 1.02, 0, 0xd6dee2, { rough: 0.6 });
    box(doorway, 0.97, 0.08, 0.12, 0, 2.08, 0, 0xd6dee2, { rough: 0.6 });
    const doorLeaf = group(doorway, 0.42, 0, 0.04);
    const leaf = box(doorLeaf, 0.8, 1.98, 0.04, -0.4, 0.99, 0, 0xe8eef0, { rough: 0.55 });
    doorLeaf.rotation.y = -0.95;
    decal(leaf, 0.2, 0.12, 0, 1.5, 0.025, signFace("IN SESSION", { bg: "#0f4a44", accent: "#8fe6d8", scale: 0.35 }), { px: 192 });
    reg2(doorLeaf, "door-ajar");
    const privacyScreen = group(g, -2.6, 0, -0.55, 1.1);
    for (let i = 0; i < 2; i++) {
      const panel = slab(privacyScreen, 0.5, 1.5, 0.03, i * 0.46, 0.78, i * 0.1, 0x8ca8b0, { radius: 0.01, rough: 0.7 });
      panel.rotation.y = i * 0.25;
    }

    const consentPanel = holoPanel(g, 0.5, 0.36, 1.5, 1.8, 1.75, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,22,28,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fd8f8"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8eff8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("REMOTE VISIT CONSENT", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Identity confirmed", "State the patient is in", "What this visit cannot do", "Consent recorded today"]
        .forEach((line, i) => ctx.fillText(line, w * 0.06, h * 0.38 + i * h * 0.15));
    }, { ry: -0.3, accent: 0x7fd8f8 });
    reg2(consentPanel, "consent-panel");

    const teamBoard = holoPanel(g, 0.44, 0.3, -1.25, 1.86, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,20,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dcf6e4";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("READ THE PLAN BACK", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Dentist · site staff · patient", w / 2, h * 0.66);
    }, { ry: 0.3, accent: 0x59c97b });
    reg2(teamBoard, "team-checkin");

    const visitLog = holoPanel(g, 0.54, 0.38, 2.0, 1.44, -1.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,22,24,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fc8b0"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#cdefe7";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("SESSION NOTE", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.088)}px Arial, sans-serif`;
      ctx.fillText("Platform · consent · findings", w / 2, h * 0.48);
      ctx.fillText("Criteria · referral · limits", w / 2, h * 0.68);
    }, { ry: -1.3, accent: TDT_ACCENT });
    reg2(visitLog, "visit-log");

    // ---------------------------------------------------------------- furniture
    const sideCounter = counter(g, 1.5, 0.5, 1.25, 1.35, 0xdfe4e8, { ry: 2.2 });
    void sideCounter;
    cabinet(g, 0.9, 0.5, 0.3, 1.35, 1.72, 1.7, TDT_CABINET, { doorColor: 0xd6dee2 });
    const stockCab = equipmentCabinet(g, 0.78, 0.9, 0.42, -2.35, -1.15, { ry: 1.0, color: TDT_CABINET, doorColor: TDT_CABINET, rough: 0.45, metal: 0.08, weathered: false, lines: ["CLINIC", "STOCK"] });
    void stockCab;
    const opStool = group(g, 0.35, 0, 0.4, -0.5);
    cyl(opStool, 0.19, 0.2, 0.05, 0, 0.03, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(opStool, 0.03, 0.035, 0.5, 0, 0.29, 0, TDT_STEEL, { rough: 0.3, metal: 0.8, seg: 12 });
    slab(opStool, 0.36, 0.09, 0.34, 0, 0.58, 0, 0x2f6f66, { radius: 0.1, rough: 0.65 });
    const handGel = group(g, 1.05, 0, 1.0, -0.4);
    cyl(handGel, 0.035, 0.035, 0.18, 0, 1.06, 0, 0xdfe8ee, { rough: 0.2, opacity: 0.7, seg: 14 });
    box(handGel, 0.05, 0.03, 0.03, 0, 1.17, 0.02, 0x4fc8b0, { rough: 0.5 });
    cyl(handGel, 0.02, 0.024, 0.95, 0, 0.5, 0, TDT_STEEL, { rough: 0.4, metal: 0.6, seg: 10 });

    standingFigure(g, -1.15, 0.95, { ry: -0.6, cloth: 0x2f6f66, skin: 0xa8784f });
    standingFigure(g, 2.35, 1.5, { ry: -2.5, cloth: 0x4a7f8c });

    const key = new THREE.DirectionalLight(0xf6fbff, 0.82);
    key.position.set(2.0, 4.4, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xeaf8f8, 0x46505a, 0.95));

    let secure = true;
    let sweeping = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.2, 1.2, -0.8),

      onStepComplete(step) {
        if (step.id === "privacy-check") { doorLeaf.rotation.y = 0; }
        if (step.id === "identity-consent") {
          repaint(consentPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(10,28,24,0.93)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcf6e4";
            ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("CONSENT RECORDED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Identity and location confirmed", w / 2, h * 0.66);
          });
        }
        if (step.id === "sheath-camera") { cameraTip.material = mat(0xeaf6fa, { rough: 0.15, opacity: 0.85 }); }
        if (step.id === "focus-set") repaint(focusDial.userData.screen, signFace("SHARP", { bg: "#0d2422", accent: "#59c97b", fg: "#cdf3ea", scale: 0.5 }));
        if (step.id === "arch-sweep") sweeping = false;
        if (step.id === "triage-score") {
          repaint(matrixMark, signFace("URGENT", { bg: "#0d2a2a", accent: "#f0a35b", scale: 0.35 }));
        }
        if (step.id === "referral-level") { urgentCard.position.y = 1.3; urgentCard.rotation.z = 0.12; }
        if (step.id === "attach-captures") { captureCard.position.set(0.4, 0.8, -0.18); desk.add(captureCard); }
        if (step.id === "visit-log") {
          repaint(visitLog.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(10,28,22,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcf6e4";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("NOTE SIGNED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("Limits stated · referral logged", w / 2, h * 0.68);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "encryption-dropped") {
          secure = false;
          repaint(callScreen.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(42,16,18,0.96)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#f0645b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#ffd2ce";
            ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("ENCRYPTION LOST", w / 2, h * 0.34);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("Session continuing unsecured", w / 2, h * 0.64);
          });
          cameraLens.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.2 });
        }
        if (it.id === "airway-red-flag") {
          swelling.scale.set(1.35, 1.1, 1.1);
          swelling.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.8, rough: 0.6 });
          escalateLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 });
          patient.head.rotation.x = 0.16;
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "encryption-dropped") {
          secure = true;
          repaint(callScreen.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(10,28,26,0.95)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#dcf6e4";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("SESSION ENDED", w / 2, h * 0.34);
            ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
            ctx.fillText("Restarted on the compliant platform", w / 2, h * 0.64);
          });
          cameraLens.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.0, rough: 0.2 });
        }
        if (it.id === "airway-red-flag") {
          handset.position.set(-0.02, 0.16, 0.08);
          handset.rotation.z = 0.5;
          escalateLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
          patient.head.rotation.x = 0.04;
        }
      },

      animate(t, dt, session) {
        void dt;
        patient.head.rotation.y = -0.08 + Math.sin(t * 0.3) * 0.03;
        patient.torso.position.y = Math.sin(t * 0.9) * 0.003;
        ringGlow.material.emissiveIntensity = 1.25 + Math.sin(t * 0.7) * 0.06;
        if (!secure) cameraLens.material.emissiveIntensity = 1.0 + Math.sin(t * 8) * 0.6;
        if (sweeping) camera.rotation.z = Math.sin(t * 1.4) * 0.2;

        if (session?.step?.id === "arch-sweep" && session.holding) sweeping = true;

        if (session?.turn && session.step?.id === "light-set") {
          ringDial.rotation.x = session.turn.amount * Math.PI * 2;
          ringGlow.material.emissiveIntensity = 0.7 + session.turn.amount * 1.6;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "focus-set") {
          const good = gg.t >= 0.36 && gg.t <= 0.6;
          repaint(focusDial.userData.screen, signFace(good ? "SHARP" : "SOFT", {
            bg: "#0d2422", accent: good ? "#59c97b" : "#f0645b", fg: "#cdf3ea", scale: 0.5,
          }));
          cameraLens.material = mat(good ? 0x59c97b : 0x4fd1ff, { emissive: good ? 0x59c97b : 0x4fd1ff, ei: 1.1, rough: 0.2 });
        }
        const tr = session?.track;
        if (tr && session.step?.id === "arch-sweep") {
          const good = tr.v >= 0.34 && tr.v <= 0.58;
          camera.rotation.x = 0.5 - tr.v * 0.2;
          cameraTip.material = mat(good ? 0xeaf6fa : 0xf0b8b0, { rough: 0.15, opacity: 0.85 });
        }
      },
    };
  },
};
