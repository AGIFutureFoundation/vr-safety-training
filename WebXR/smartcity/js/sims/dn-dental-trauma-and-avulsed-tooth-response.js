import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, seatedFigure, ownMaterial, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dental Trauma & Avulsed Tooth Response VR — Dental & Oral
// Health.
//
// A fifteen-year-old walks in from the pitch next door holding a permanent
// front tooth in a paper tissue. The clinic has perhaps an hour before the
// cells on that root are gone, and the assistant's part of the response is
// most of what decides whether they survive: the head injury ruled out first,
// the clock read, the root rinsed gently and never scrubbed, the tooth carried
// by its crown into a medium that keeps the cells alive, the dentist fetched
// to replant it, and a follow-up that lasts long after the splint comes off.
//
// Replanting, splinting and prescribing are the dentist's under the state
// dental board's practice act; the clinical order follows the dental-trauma
// guidance the AAPD's reference manual carries. The patient, the coach and the
// pitch are invented. The Unspoken Smiles programme is named only as the
// programme this platform is built for.

const DTR_ACCENT = 0xe8a05a;
const DTR_CSS = "#e8a05a";
const DTR_ALERT = "#f0645b";

export const SIM_DN_DENTAL_TRAUMA_AND_AVULSED_TOOTH_RESPONSE = {
  id: "dn-dental-trauma-and-avulsed-tooth-response",
  index: "319",
  domain: "Dental",
  trade: "Dental assistant — emergency and trauma chairside (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "The AAPD's reference-manual guidance on acute dental trauma, which follows the International Association of Dental Traumatology's avulsion protocol; the state dental board's practice act, under which replantation, splinting and prescribing are the dentist's; the CDC's dental infection-control guidelines and OSHA 29 CFR 1910.1030 bloodborne pathogens for a bleeding socket; the ADA's guidance and the ADA's CDT code set for how the trauma visit is recorded; HIPAA's privacy rule for clinical photographs of a minor; SEIU and UFCW clinic and dental staff; Unspoken Smiles, the programme this platform is built for",
  name: "Dental Trauma & Avulsed Tooth Response",
  title: simTitle("Dental Trauma & Avulsed Tooth Response"),
  tagline: "A knocked-out front tooth and an hour on the clock: head injury ruled out first, the root rinsed and never scrubbed, the tooth carried by its crown into a medium that keeps it alive, and the dentist at the chair to replant it",
  accent: DTR_ACCENT,
  accentCss: DTR_CSS,
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "root-kept-alive", name: "Root Kept Alive", note: "An avulsed permanent tooth handled by its crown, stored wet and handed to the dentist inside the window" },
  supportLine: "your clinic's employee assistance line, or the dentist you debrief with — a child's injury and a frightened parent stay with people",

  game: system({
    name: "Golden Hour",
    currency: "ROOT",
    ranks: ["Assisting Student", "Chairside Assistant", "Emergency Assistant", "Trauma Lead", "Golden Hour Certified"],
    badges: [
      { id: "head-first", name: "Head First", note: "The head-injury screen worked in order before anybody looked for the tooth", test: AWARD.stepClean("dtr-head-screen") },
      { id: "cells-kept", name: "Cells Kept", note: "No unsafe action anywhere in the response", test: AWARD.safe },
      { id: "steady-hands", name: "Steady Hands", note: "The suction and the photographs carried without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections anywhere in the response", test: AWARD.clean },
      { id: "gentle-stream", name: "Gentle Stream", note: "The rinse committed near the middle of its band", test: AWARD.precise(0.72) },
      { id: "inside-the-hour", name: "Inside The Hour", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dtr-scrub-brush": "That is the scrub brush at the sink, and the root is not a dirty instrument. The thin film of ligament cells on an avulsed root is exactly what lets it reattach, and a brush, a scrape or a wipe with gauze strips them off in seconds — a tooth scrubbed clean is a tooth that will fuse to the bone or be lost, however fast it goes back in.",
    "dtr-tap-water": "That is a cup of tap water, offered because it is closest. Water is the wrong liquid for living cells: it is less salty than they are, so it swells and bursts them within minutes. Milk, a balanced salt storage solution, saline or even the patient's own saliva keep them alive while the dentist is fetched — water only looks like the careful choice.",
    "dtr-uncapped-needle": "That anaesthetic needle is lying uncapped on the bracket table where hands will be moving fast. In an emergency everyone reaches across the tray, and an exposed needle is how a busy assistant ends up in a post-exposure evaluation; under 29 CFR 1910.1030 it is recapped with the one-handed scoop or a device, or it goes straight into the sharps unit.",
    "dtr-own-phone": "That is your own phone, suggested for the injury photographs because the clinic camera is across the room. Photographs of a child's injured mouth are protected health information under HIPAA, and a personal phone syncs them to somebody's cloud and camera roll where the practice can neither secure nor delete them — clinical images go on the clinic's camera, into the record, and nowhere else.",
  },

  lateNotes: {
    "dtr-call-dentist": "The dentist needs to know what they are walking into. Find the tooth and read the clock first, so the call says how long it has been out and where it is now.",
    "dtr-aftercare-sheet": "The aftercare is explained once the dentist has replanted and splinted the tooth and said what it needs — not before anybody knows what was done.",
    "dtr-trauma-log": "The response is not finished. The trauma record is written from what actually happened, including the times, at the end.",
  },

  steps: [
    {
      id: "dtr-head-screen", kind: "sequence", noRobot: false,
      targets: ["dtr-ask-conscious", "dtr-ask-neck", "dtr-ask-bleeding"],
      itemNames: {
        "dtr-ask-conscious": "knocked out, dizzy or vomiting?",
        "dtr-ask-neck": "neck pain or tingling?",
        "dtr-ask-bleeding": "bleeding that will not slow?",
      },
      outOfOrderNote: "Wrong order. A lost tooth is never the first question — consciousness and the neck come before anything in the mouth, because a concussion or a neck injury changes where this patient goes next.",
      title: "Rule out the injury that outranks the tooth",
      cue: "Ask the head-injury questions in order: loss of consciousness, then the neck, then bleeding.",
      why: "A blow hard enough to knock out a front tooth is hard enough to cause a concussion or a neck injury, and a clinic that goes straight to the mouth can miss the thing that actually needs an emergency department. Loss of consciousness, vomiting or confusion, then neck pain, then uncontrolled bleeding — any of those and the tooth waits. Screening in that order is the judgement that marks an assistant out for the emergency and trauma work a busy practice needs someone to own.",
    },
    {
      id: "dtr-ppe", kind: "select", target: "dtr-glove-station", noRobot: false,
      title: "Glove and put on eye protection before touching anything bloody",
      cue: "Non-latex gloves, a mask and protective eyewear, before you touch the tooth, the tissue or the patient.",
      why: "The tooth, the tissue it arrived in and the socket are all covered in blood and saliva, and in an emergency the temptation is to reach before gloving. The exposure control plan under 29 CFR 1910.1030 does not pause for urgency: gloves, a mask and eyewear take fifteen seconds and protect you for a whole career. An assistant who gloves automatically while everyone else is flustered is the calm pair of hands a dentist wants in every emergency after this one.",
    },
    {
      id: "dtr-read-clock", kind: "find", noHint: true, noRobot: false,
      targets: ["dtr-tooth-in-tissue", "dtr-coach-note"],
      itemNames: { "dtr-tooth-in-tissue": "the tooth drying in a paper tissue", "dtr-coach-note": "the coach's note of when it happened" },
      itemNotes: {
        "dtr-tooth-in-tissue": "The tooth is wrapped in a dry paper tissue. Every minute out of the mouth and dry is a minute of root cells dying, and the tissue is wicking away the moisture that was keeping some of them alive.",
        "dtr-coach-note": "The coach wrote the time of the collision on the back of the team sheet. That time is the start of the clock, and it is the first thing the dentist will ask for.",
      },
      title: "Find the two things that tell you how long this tooth has",
      cue: "Two things here set the clock. Find both before you do anything else with the tooth.",
      why: "An avulsed tooth has a window, and the dry time is what closes it: after about an hour out of the mouth and dry, the ligament cells on the root are generally gone and the tooth is treated differently. The time of the injury and how the tooth has been kept since are the two facts the dentist's whole decision rests on. Collecting them before anybody panics is what makes an assistant's handover worth having, and it is exactly the sort of clear thinking a trauma-trained assistant is valued for.",
    },
    {
      id: "dtr-rinse", kind: "gauge", target: "dtr-saline-syringe", noRobot: false, forceClass: "light",
      robotNote: "The rinse is on a tooth held over a basin, never on a person; a light ceiling because a root surface is the most delicate thing in the room.",
      title: "Rinse the root with a gentle saline stream, never a jet",
      cue: "Hold the tooth by its crown over the basin and set the saline to a gentle stream until the grit is off.",
      gauge: {
        label: "SALINE STREAM", speed: 0.6, green: [0.3, 0.5],
        readout: (t) => (t < 0.3 ? "trickle — grit still on the root" : t > 0.5 ? "jet — stripping the root surface" : "gentle stream, root intact"),
        missNote: "Outside the band. Too weak and the grit stays on the root; too hard and the stream strips the very cells the dentist is trying to save.",
      },
      why: "If the root has picked up dirt, it needs to come off without taking the ligament cells with it, and the only safe tool is a gentle stream of saline for a few seconds, never a brush and never a strong jet. Holding the tooth by its crown keeps fingers off the root entirely. Handling living tissue this carefully is a skill that carries from the emergency chair into surgical assisting, where the same rule — touch nothing that has to heal — governs the whole field.",
    },
    {
      id: "dtr-media", kind: "find", noHint: true, noRobot: false,
      targets: ["dtr-hbss-kit", "dtr-milk-carton"],
      itemNames: { "dtr-hbss-kit": "the balanced salt storage kit", "dtr-milk-carton": "the carton of cold milk" },
      itemNotes: {
        "dtr-hbss-kit": "A balanced salt storage solution in a tooth-rescue kit is made for exactly this: it matches the cells' own salt balance and keeps them alive for hours.",
        "dtr-milk-carton": "Cold milk from the staff fridge is the best thing most people have to hand — its salt balance is close to the cells' own, and it buys valuable time.",
      },
      title: "Find the two storage media that will keep the root alive",
      cue: "Several liquids are on the counter. Find the two that keep ligament cells alive while the dentist comes.",
      why: "Where the tooth waits matters as much as how long it waits. A balanced salt storage solution is the best, cold milk is excellent, and saline or the patient's own saliva will do in a pinch; water, which looks clean and careful, bursts the cells, and a dry tissue lets them die slowly. Knowing the difference without having to look it up is the kind of knowledge that makes an assistant the person schools and sports clubs call when they set up a first-aid plan.",
    },
    {
      id: "dtr-open-kit", kind: "turn", target: "dtr-kit-cap", noRobot: false,
      turn: { turns: 1.0, axis: "y", label: "KIT CAP" },
      title: "Open the storage kit without spilling the medium",
      cue: "Unscrew the storage kit's cap so the basket is ready to take the tooth.",
      why: "A tooth-rescue kit only works if the solution is still in it when the tooth arrives, so the cap comes off steadily with the container upright and the basket left in place to lower the tooth in without handling the root. It is a small thing done under pressure, which is the point: emergency response is mostly small things done correctly while somebody is frightened, and an assistant who can do them is the one trusted with the practice's emergency kit.",
    },
    {
      id: "dtr-store-tooth", kind: "drag", target: "dtr-tooth-forceps", noRobot: false, forceClass: "light",
      robotNote: "A tooth carried in forceps by its crown, off the patient and over the counter; light, because the root cannot take any grip at all.",
      drag: { to: "dtr-kit-basket", radius: 0.4, missNote: "That is not the kit's basket. Carry the tooth by its crown and lower it into the storage solution, root first, without touching the root." },
      title: "Carry the tooth by its crown into the storage solution",
      cue: "Pick the tooth up by the crown only and lower it into the kit's basket, fully covered.",
      why: "The crown is the part of the tooth that can be handled; the root is the part that has to heal. Carried by the crown and lowered into the medium until it is covered, the ligament cells stay wet and alive while the dentist is on the way. Fingers on the root, or a tooth left half out of the liquid, undo everything the rinse just protected. Handling a specimen this way is the same discipline a surgical or laboratory career asks for every day.",
    },
    {
      id: "dtr-call-dentist", kind: "select", target: "dtr-call-dentist", noRobot: false,
      title: "Call the dentist to the chair with the facts",
      cue: "Call the dentist now: the tooth, how long it has been out, how it was kept, and the head screen.",
      why: "Replanting an avulsed tooth, splinting it and deciding on medicines are the dentist's under the state dental board's practice act, and the sooner they are at the chair the better the outlook — ideally the tooth goes back within minutes. A call that says which tooth, the time of injury, the dry time and the storage medium, and that the head screen was clear, lets the dentist walk in ready. Clear, structured handovers are what move an assistant toward lead and office-management roles.",
    },
    {
      id: "dtr-suction-hold", kind: "hold", target: "dtr-suction-tip", seconds: 7, noRobot: false, forceClass: "light",
      robotNote: "The suction is held at the edge of the lip while the dentist replants — light contact on a face, never inside the socket.",
      title: "Hold the suction clear at the lip while the dentist replants",
      cue: "Keep the low-volume suction at the corner of the mouth, clear of the socket, while the dentist works.",
      holdBreakNote: "The suction drifted off. The field floods with blood and saliva and the dentist is replanting blind — bring it back to the corner of the lip.",
      why: "Replanting is done by the dentist with gentle finger pressure, and the socket must not be suctioned out, because the clot and the tissue in it are part of the healing. What the assistant holds is the suction at the lip, keeping pooled saliva and blood away so the dentist can see and the patient does not choke on it. Steady suction under stress is the core of chairside assisting, and it is the skill every specialty — surgery, endodontics, paediatrics — hires for.",
    },
    {
      id: "dtr-photo-track", kind: "track", target: "dtr-clinic-camera", seconds: 8, noRobot: false,
      title: "Hold the clinic camera steady for the record photographs",
      cue: "Keep the clinic camera framed and still on the splinted tooth while the series is taken.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "FRAMING",
        readout: (v) => (v < 0.38 ? "drifting off the tooth" : v > 0.62 ? "too close — no reference teeth" : "framed and steady"),
      },
      holdBreakNote: "The framing slipped. Bring the splinted tooth back to centre with the neighbouring teeth in shot and hold still.",
      why: "A trauma case is followed for years, and the photographs taken today are the baseline every later review is compared against — the colour of the tooth, the gum line, the splint. They also matter if there is ever a question about how the injury happened. Framed with the neighbouring teeth for reference and taken on the clinic's own camera, they go straight into the record. Clinical photography is a skill orthodontic and cosmetic practices specifically recruit assistants for.",
    },
    {
      id: "dtr-aftercare-sheet", kind: "select", target: "dtr-aftercare-sheet", noRobot: false,
      title: "Go through the aftercare with the parent, per the dentist",
      cue: "Explain the dentist's instructions: soft food, a soft brush, the mouth rinse, and a tetanus check with the family doctor.",
      why: "What happens at home over the next two weeks decides a lot. The dentist sets the instructions — typically a soft diet, careful brushing with a soft brush, a mouth rinse, and a check with the family's physician on whether a tetanus booster is due — and the assistant makes sure the parent actually understands them, in plain words and in writing. Patient education done well is a skill that leads toward hygiene school and treatment coordination alike.",
    },
    {
      id: "dtr-book-reviews", kind: "drag", target: "dtr-review-card", noRobot: false,
      drag: { to: "dtr-review-slot", radius: 0.4, missNote: "That is not the review column. The first review goes where the dentist asked for it, at the splint-removal visit, and the later ones follow it." },
      title: "Book the review visits the dentist asked for",
      cue: "Put the review card in the splint-removal slot and book the later checks after it.",
      why: "A replanted tooth can look fine for months and then start to resorb or lose its nerve, so the trauma guidance calls for a series of reviews, starting when the splint comes off and continuing for years. The dentist sets the schedule; the assistant books it before the family leaves, because a review that is left to a phone call later is the review that never happens. Recall management like this is the backbone of a front-office and patient-care-coordinator career.",
    },
    {
      id: "dtr-team-checkin", kind: "select", target: "dtr-team-checkin", noRobot: false,
      title: "Check in with the dentist and the team",
      cue: "Confirm what was done and ask how everyone is — the patient, the parent, and the two of you.",
      why: "Trauma visits are fast, frightening for the family and easy to leave half-documented. A short check-in with the dentist confirms the facts that go in the record — times, the medium, what was replanted and splinted — and gives both of you a moment to say how it went. A child's injury stays with people, and teams that talk about it afterwards stay steady for the next one; being the assistant who starts that conversation is a mark of a future lead.",
    },
    {
      id: "dtr-trauma-log", kind: "select", target: "dtr-trauma-log", noRobot: false,
      title: "Write the trauma record",
      cue: "Record the time of injury, the dry time, the storage medium, the head screen, the photographs and the reviews booked.",
      why: "The trauma record is the document every later decision about this tooth leans on: when it happened, how long it was dry, what it was kept in, what the dentist did, and when it will be seen again. It is also what supports the procedures the dentist records under the ADA's CDT code set, and what a school or insurer will ask for. Clear clinical documentation is the foundation of every dental career beyond the chair, from coding and billing to practice management.",
    },
  ],

  interrupts: [
    {
      id: "dtr-syncope",
      kind: "Medical emergency",
      after: "dtr-suction-hold", delay: 3, seconds: 12,
      alert: "The boy has gone grey and sweaty and his eyes are rolling — he is fainting sitting up in the chair.",
      cue: "Put the chair back flat and raise his legs with the foot control — the dentist stops.",
      target: "dtr-chair-pedal",
      why: "Fainting after an injury and the sight of blood is common, and the fastest safe answer is position: laid flat with the legs raised, blood returns to the brain and most people come round within a minute. Held upright, a fainting patient stays unconscious longer and can fall or inhale blood. If he does not come round promptly, it becomes the office emergency response.",
      missNote: "He stayed upright and unconscious with a mouth full of blood. That is the position in which fainting lasts longest and a patient is most likely to inhale what is in their mouth — the chair control was one reach away.",
      wrongNote: "It is the chair's foot control. Lay him flat and raise his legs first; the suction and everything else come after.",
    },
    {
      id: "dtr-coach-filming",
      kind: "Privacy breach",
      after: "dtr-photo-track", delay: 3, seconds: 11,
      alert: "The coach is in the doorway filming the boy in the chair on his phone, for the team chat.",
      cue: "Draw the operatory curtain and ask him to wait outside — then finish the series.",
      target: "dtr-curtain",
      why: "A minor in a dental chair, bleeding and frightened, is being recorded and shared without anybody's consent. Closing the curtain ends it at once, and asking the coach to wait outside restores the privacy the patient is owed; the photographs that matter are the clinical ones, on the clinic's camera, going into the record.",
      missNote: "The coach kept filming. A video of a child's injury in the chair went to a team chat with no consent from the child or his parent — a privacy failure the clinic let happen in its own operatory.",
      wrongNote: "It is the curtain. The problem is the doorway, so the doorway is what gets closed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, DTR_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#d4d9d2", base2: "#c8cec6", seam: "rgba(0,0,0,0.09)",
    }), { repeat: 4, px: 256 });
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#f3f1ec", base2: "#e6e3dc", seam: "rgba(0,0,0,0.06)",
    }), { repeat: 3, px: 256 });
    const floor = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xd4d9d2, { radius: 0.05, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.74, metal: 0.04, color: 0xdde2dc });

    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.frame ?? 0x3a3128, { rough: 0.5 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 384 });
      return b;
    };
    const lines = (title, rows, accent = DTR_CSS) => (cx, w, h) => {
      cx.fillStyle = "#15120e"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#f6ece0"; cx.font = `600 ${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.fillText(title, w * 0.05, h * 0.26);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.5 + i * 0.2)));
    };

    // -------------------------------------------------------------- chair
    const chair = group(g, -0.95, 0, -0.95);
    cyl(chair, 0.22, 0.26, 0.12, 0, 0.06, 0.3, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 18 });
    cyl(chair, 0.07, 0.07, 0.42, 0, 0.3, 0.3, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
    const seat = group(chair, 0, 0, 0);
    slab(seat, 0.56, 0.13, 1.1, 0, 0.56, 0.05, 0x7a4f3a, { radius: 0.07, rough: 0.6 });
    const back = group(chair, 0, 0.62, -0.62);
    const backPad = slab(back, 0.54, 0.86, 0.16, 0, 0.3, 0, 0x7a4f3a, { radius: 0.07, rough: 0.6 });
    ownMaterial(backPad);
    back.rotation.x = -0.5;
    const patient = seatedFigure(chair, 0, 0.58, -0.1, { ry: 0, cloth: 0x2f6fb0, legs: 0x1f2a3a });
    patient.root.rotation.x = -0.55;
    patient.root.position.set(0, 0.62, -0.1);
    patient.root.userData.patient = { part: "torso", radius: 0.3 };
    patient.head.userData.patient = { part: "head", radius: 0.2 };
    const pallor = ball(patient.head, 0.1, 0, 0.02, 0.02, 0xb9c4c0, { rough: 0.7, seg: 12, opacity: 0.55, transparent: true });
    pallor.visible = false;
    // The chair's foot control, at the base on the assistant's side.
    const pedal = group(g, -0.35, 0.03, -0.55);
    box(pedal, 0.22, 0.05, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    box(pedal, 0.08, 0.02, 0.06, -0.05, 0.035, 0, DTR_ACCENT, { rough: 0.5 });
    holoTag(pedal, "chair foot control", 0, 0.16, 0, { css: DTR_CSS, w: 0.36 });
    reg(hits, pedal, "dtr-chair-pedal");

    // The low-volume suction held at the lip.
    const suction = group(g, -0.84, 1.44, -1.5, 0.6);
    cyl(suction, 0.008, 0.01, 0.14, 0, 0, 0, 0xeef2f4, { rough: 0.3, seg: 10 }).rotation.z = 1.2;
    holoTag(suction, "suction — at the lip", 0, 0.1, 0, { css: DTR_CSS, w: 0.36 });
    reg(hits, suction, "dtr-suction-tip");
    hose(g, [[-0.78, 1.4, -1.47], [-0.45, 1.05, -1.1], [-0.2, 0.86, -0.85]], 0.008, 0xd7dce1, { steps: 10, rough: 0.5 });

    // The assistant's stool, pushed back while everyone is standing.
    const stool = group(g, 0.25, 0, 0.35);
    cyl(stool, 0.24, 0.26, 0.04, 0, 0.03, 0, CITY.darkSteel, { rough: 0.45, metal: 0.55, seg: 18 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(stool, 0.022, 0.022, 0.05, Math.cos(a) * 0.2, 0.025, Math.sin(a) * 0.2, 0x16191d, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    }
    cyl(stool, 0.035, 0.035, 0.44, 0, 0.26, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 12 });
    cyl(stool, 0.2, 0.2, 0.09, 0, 0.52, 0, 0x7a4f3a, { rough: 0.7, seg: 20 });

    // Lamp over the chair.
    const lampPost = group(g, -0.95, 0, -2.3);
    cyl(lampPost, 0.05, 0.06, 1.95, 0, 0.98, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 12 });
    const lampHead = group(lampPost, 0, 1.8, 0.7);
    box(lampHead, 0.4, 0.1, 0.24, 0, 0, 0, 0xe8edf0, { rough: 0.3, metal: 0.3 });
    box(lampHead, 0.34, 0.02, 0.2, 0, -0.06, 0, 0xfff6e6, { emissive: 0xfff6e6, ei: 1.0, rough: 0.4, cast: false });
    lampHead.rotation.x = 0.5;

    // ----------------------------------------------------- bracket table
    const bracket = group(g, 0.05, 0, -0.55, -0.3);
    cyl(bracket, 0.03, 0.03, 0.82, 0, 0.41, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    slab(bracket, 0.5, 0.03, 0.34, 0, 0.84, 0, 0xc9d1d6, { radius: 0.01, rough: 0.4, metal: 0.4 });
    const needle = group(bracket, 0.14, 0.87, 0.06, 0.4);
    cyl(needle, 0.008, 0.008, 0.1, 0, 0, 0, 0xdfe4e8, { rough: 0.3, seg: 8 }).rotation.z = Math.PI / 2;
    cyl(needle, 0.0015, 0.0015, 0.05, 0.075, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(needle, "uncapped needle", 0, 0.06, 0, { css: DTR_ALERT, w: 0.32 });
    reg(hits, needle, "dtr-uncapped-needle");
    // The tooth, in forceps, and the tissue it arrived in.
    const tissue = group(bracket, -0.12, 0.86, 0.02);
    const tissuePaper = box(tissue, 0.12, 0.02, 0.1, 0, 0, 0, 0xf4f4ef, { rough: 0.95 });
    void tissuePaper;
    holoTag(tissue, "tooth in a tissue", 0, 0.06, 0, { css: DTR_CSS, w: 0.32 });
    reg(hits, tissue, "dtr-tooth-in-tissue");
    const forceps = group(bracket, 0.0, 0.87, -0.08, 0.2);
    cyl(forceps, 0.004, 0.004, 0.13, 0, 0, 0, CITY.steel, { rough: 0.2, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    const tooth = group(forceps, 0.075, 0, 0);
    cyl(tooth, 0.008, 0.004, 0.022, 0, -0.012, 0, 0xe9dcc2, { rough: 0.6, seg: 8 });
    box(tooth, 0.012, 0.012, 0.006, 0, 0.004, 0, 0xf6f1e4, { rough: 0.3 });
    holoTag(forceps, "tooth — by the crown", 0, 0.07, 0, { css: DTR_CSS, w: 0.36 });
    reg(hits, forceps, "dtr-tooth-forceps");
    const ownPhone = group(bracket, 0.18, 0.86, -0.1, -0.3);
    box(ownPhone, 0.07, 0.008, 0.13, 0, 0, 0, 0x1b1f24, { rough: 0.4, emissive: 0x3f6f90, ei: 0.4 });
    holoTag(ownPhone, "your own phone", 0, 0.06, 0, { css: DTR_ALERT, w: 0.3 });
    reg(hits, ownPhone, "dtr-own-phone");

    // --------------------------------------------------- counter, right
    const counterRun = group(g, 1.35, 0, -1.3, -0.35);
    box(counterRun, 1.9, 0.86, 0.6, 0, 0.43, 0, 0xd8d4cc, { rough: 0.55 });
    const top = slab(counterRun, 1.96, 0.045, 0.64, 0, 0.88, 0, 0xffffff, { radius: 0.012, rough: 0.5 });
    top.material = texturedMat(topTex, { rough: 0.48, metal: 0.05, color: 0xffffff });
    for (let i = 0; i < 4; i++) box(counterRun, 0.44, 0.24, 0.02, -0.72 + i * 0.48, 0.6, 0.31, 0xc8c3ba, { rough: 0.5 });
    for (let i = 0; i < 3; i++) box(counterRun, 0.58, 0.6, 0.32, -0.6 + i * 0.6, 1.72, -0.16, 0xece8e0, { rough: 0.55 });
    // Storage media on the counter: two right answers and one wrong one.
    const hbss = group(counterRun, -0.6, 0.9, 0.08);
    cyl(hbss, 0.045, 0.045, 0.12, 0, 0.06, 0, 0xf2f6f8, { rough: 0.4, seg: 14 });
    decal(hbss, 0.07, 0.04, 0, 0.06, 0.046, signFace("TOOTH KIT", { bg: "#2a6f8f", accent: "#dff2f8", scale: 0.4 }), { px: 96 });
    holoTag(hbss, "salt storage kit", 0, 0.2, 0, { css: DTR_CSS, w: 0.32 });
    reg(hits, hbss, "dtr-hbss-kit");
    const cap = group(hbss, 0, 0.13, 0);
    cyl(cap, 0.048, 0.048, 0.025, 0, 0, 0, 0x2a6f8f, { rough: 0.5, seg: 14 });
    reg(hits, cap, "dtr-kit-cap");
    const basket = box(counterRun, 0.16, 0.12, 0.16, -0.6, 1.0, 0.08, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["dtr-kit-basket"] = basket;
    const milk = group(counterRun, -0.35, 0.9, 0.12);
    box(milk, 0.07, 0.14, 0.07, 0, 0.07, 0, 0xf6f6f2, { rough: 0.7 });
    box(milk, 0.07, 0.03, 0.07, 0, 0.155, 0, 0x5aa0d8, { rough: 0.6 });
    holoTag(milk, "cold milk", 0, 0.24, 0, { css: DTR_CSS, w: 0.22 });
    reg(hits, milk, "dtr-milk-carton");
    const water = group(counterRun, -0.1, 0.9, 0.12);
    cyl(water, 0.035, 0.03, 0.09, 0, 0.045, 0, 0xbfe4f2, { opacity: 0.55, transparent: true, seg: 12 });
    holoTag(water, "tap water", 0, 0.16, 0, { css: DTR_ALERT, w: 0.22 });
    reg(hits, water, "dtr-tap-water");
    // Saline syringe and basin.
    const saline = group(counterRun, 0.2, 0.92, 0.05);
    cyl(saline, 0.018, 0.018, 0.14, 0, 0.02, 0, 0xf2f6f8, { rough: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(saline, 0.09, 0.07, 0.04, 0, -0.01, 0.12, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 14 });
    holoTag(saline, "saline — gentle", 0, 0.12, 0, { css: DTR_CSS, w: 0.3 });
    reg(hits, saline, "dtr-saline-syringe");
    // The clinic camera on its stand.
    const camera = group(counterRun, 0.62, 0.9, 0.0);
    cyl(camera, 0.012, 0.012, 0.3, 0, 0.15, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6, seg: 8 });
    box(camera, 0.14, 0.09, 0.08, 0, 0.34, 0, 0x22262b, { rough: 0.4 });
    cyl(camera, 0.035, 0.035, 0.07, 0, 0.34, 0.07, 0x15181b, { rough: 0.3, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(camera, "clinic camera", 0, 0.46, 0, { css: DTR_CSS, w: 0.3 });
    reg(hits, camera, "dtr-clinic-camera");

    // ---------------------------------------------- left: sink and gloves
    const bench = group(g, -2.05, 0, 0.3, 0.6);
    box(bench, 0.9, 0.86, 0.5, 0, 0.43, 0, 0xd8d4cc, { rough: 0.55 });
    const benchTop = slab(bench, 0.94, 0.04, 0.54, 0, 0.88, 0, 0xffffff, { radius: 0.01, rough: 0.5 });
    benchTop.material = texturedMat(topTex, { rough: 0.5, metal: 0.05, color: 0xf6f4ef });
    cyl(bench, 0.12, 0.1, 0.06, -0.2, 0.9, 0, 0xdfe4e8, { rough: 0.25, metal: 0.3, seg: 16, open: true, side: 2 });
    cyl(bench, 0.012, 0.012, 0.24, -0.2, 1.02, -0.12, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
    const brush = group(bench, 0.0, 0.92, 0.05, 0.5);
    box(brush, 0.12, 0.02, 0.03, 0, 0, 0, 0x2f8f5a, { rough: 0.6 });
    box(brush, 0.08, 0.015, 0.03, 0, -0.015, 0, 0xf2e9c9, { rough: 0.9 });
    holoTag(brush, "scrub brush", 0, 0.07, 0, { css: DTR_ALERT, w: 0.26 });
    reg(hits, brush, "dtr-scrub-brush");
    const gloves = group(bench, 0.28, 0.92, 0.0);
    box(gloves, 0.18, 0.09, 0.11, 0, 0.045, 0, 0x5a7fd0, { rough: 0.6 });
    box(gloves, 0.16, 0.05, 0.02, 0, 0.045, 0.06, 0xf2f6f8, { rough: 0.6 });
    const eyewear = group(gloves, 0, 0.12, 0);
    box(eyewear, 0.12, 0.03, 0.01, 0, 0, 0, 0xbfe4f2, { opacity: 0.6, transparent: true, rough: 0.2 });
    holoTag(gloves, "gloves · mask · eyewear", 0, 0.22, 0, { css: DTR_CSS, w: 0.42 });
    reg(hits, gloves, "dtr-glove-station");
    const sharps = group(g, -2.35, 0, -0.95, 0.9);
    box(sharps, 0.26, 0.32, 0.2, 0, 1.3, 0, 0xd8342a, { rough: 0.6 });
    box(sharps, 0.28, 0.05, 0.22, 0, 1.48, 0, 0xf2e9c9, { rough: 0.55 });
    decal(sharps, 0.22, 0.12, 0, 1.3, 0.102, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }), { px: 160 });

    // Wall cabinets over the bench, a lidded bin and the first-aid box.
    for (let i = 0; i < 2; i++) {
      box(bench, 0.42, 0.55, 0.3, -0.22 + i * 0.44, 1.72, -0.1, 0xece8e0, { rough: 0.55 });
      box(bench, 0.1, 0.018, 0.018, -0.22 + i * 0.44, 1.5, 0.06, 0x8d959d, { rough: 0.3, metal: 0.8 });
    }
    const bin = group(g, -1.55, 0, 0.95);
    cyl(bin, 0.15, 0.13, 0.36, 0, 0.18, 0, 0x53585e, { rough: 0.55, metal: 0.3, seg: 16 });
    cyl(bin, 0.16, 0.16, 0.03, 0, 0.37, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 16 });
    const aidBox = group(bench, 0.3, 1.45, -0.18);
    box(aidBox, 0.26, 0.2, 0.1, 0, 0, 0, 0x2f8f5a, { rough: 0.5 });
    box(aidBox, 0.1, 0.03, 0.005, 0, 0, 0.052, 0xffffff, { rough: 0.5 });
    box(aidBox, 0.03, 0.1, 0.005, 0, 0, 0.052, 0xffffff, { rough: 0.5 });

    // --------------------------------------------- triage board, front-left
    const triage = board(0.62, 0.42, -1.55, 1.5, 1.1, lines("HEAD INJURY FIRST", ["", "", ""]), { ry: 0.9 });
    const Q = [["dtr-ask-conscious", 0.08, "1 KNOCKED OUT? VOMITING?"], ["dtr-ask-neck", -0.04, "2 NECK PAIN? TINGLING?"], ["dtr-ask-bleeding", -0.16, "3 BLEEDING WON'T SLOW?"]];
    for (const [id, y, label] of Q) {
      const q = group(triage, 0, y, 0.015);
      box(q, 0.56, 0.09, 0.01, 0, 0, 0, 0x2a2219, { rough: 0.5 });
      decal(q, 0.54, 0.08, 0, 0, 0.006, signFace(label, { bg: "#2a2219", accent: DTR_CSS, fg: "#f6ece0", scale: 0.4 }), { px: 256 });
      reg(hits, q, id);
    }
    // The coach's note, pinned beside it.
    const note = group(g, -1.1, 1.45, 1.45, 0.6);
    decal(note, 0.2, 0.14, 0, 0, 0, paperFace("TEAM SHEET", ["Collision: 15:42", "Tooth: upper front"], { band: DTR_CSS }), { px: 192 });
    reg(hits, note, "dtr-coach-note");

    // ---------------------------------------- intercom, doorway and curtain
    const intercom = group(g, 1.2, 1.35, -2.4);
    box(intercom, 0.16, 0.22, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    ball(intercom, 0.02, 0, 0.05, 0.025, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, seg: 10 });
    holoTag(intercom, "call the dentist", 0, 0.18, 0, { css: DTR_CSS, w: 0.32 });
    reg(hits, intercom, "dtr-call-dentist");
    const door = group(g, 2.3, 0, 0.55, -Math.PI / 2);
    box(door, 0.06, 2.1, 0.06, -0.5, 1.05, 0, 0x8b929a, { rough: 0.5 });
    box(door, 0.06, 2.1, 0.06, 0.5, 1.05, 0, 0x8b929a, { rough: 0.5 });
    box(door, 1.06, 0.06, 0.06, 0, 2.1, 0, 0x8b929a, { rough: 0.5 });
    const curtain = box(door, 0.96, 1.8, 0.02, -0.34, 1.05, 0.05, 0x9fc3b0, { rough: 0.9 });
    curtain.scale.x = 0.3;
    const curtainPull = group(door, 0.35, 1.2, 0.08);
    box(curtainPull, 0.06, 0.2, 0.03, 0, 0, 0, DTR_ACCENT, { rough: 0.5 });
    holoTag(curtainPull, "curtain", 0, 0.16, 0, { css: DTR_CSS, w: 0.22 });
    reg(hits, curtainPull, "dtr-curtain");
    const coach = standingFigure(g, 2.05, 1.55, { ry: -2.4, cloth: 0x3a5f2f });
    holoTag(coach, "the coach", 0, 1.86, 0, { css: DTR_CSS, w: 0.26 }).rotation.y = 2.4;
    const coachPhone = box(coach, 0.07, 0.13, 0.01, 0.12, 1.35, 0.25, 0x1b1f24, { emissive: 0x7fc4d8, ei: 0.7, rough: 0.4 });
    coachPhone.visible = false;

    // --------------------------------- aftercare, reviews, check-in and log
    const aftercare = board(0.34, 0.26, 0.15, 1.72, -2.4, paperFace("AFTERCARE", ["Soft food", "Soft brush · rinse", "Tetanus: family doctor"], { band: DTR_CSS }));
    reg(hits, aftercare.userData.face, "dtr-aftercare-sheet");
    const reviews = board(0.5, 0.3, -2.3, 1.55, -0.15, lines("REVIEWS", ["Splint off · then weeks · months · years"]), { ry: Math.PI / 2 });
    const reviewSlot = box(reviews, 0.2, 0.12, 0.06, -0.1, -0.02, 0.04, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["dtr-review-slot"] = reviewSlot;
    const reviewCard = group(counterRun, 0.85, 0.915, 0.18);
    box(reviewCard, 0.1, 0.006, 0.07, 0, 0, 0, 0xf2e3c9, { rough: 0.8 });
    holoTag(reviewCard, "review card", 0, 0.06, 0, { css: DTR_CSS, w: 0.26 });
    reg(hits, reviewCard, "dtr-review-card");
    const checkin = board(0.44, 0.28, 2.3, 1.55, -1.25, lines("TEAM CHECK-IN", ["What was done · times", "How is everyone?"], "#7fc4d8"), { ry: -Math.PI / 2, frame: 0x22323a });
    reg(hits, checkin.userData.face, "dtr-team-checkin");
    const log = board(0.4, 0.3, 0.72, 1.72, -2.4, paperFace("TRAUMA RECORD", ["Injury time · dry time", "Medium · head screen", "Photos · reviews"], { band: DTR_CSS }));
    reg(hits, log.userData.face, "dtr-trauma-log");

    const dentist = standingFigure(g, -2.3, 1.6, { ry: 2.4, cloth: 0x2f5f70 });
    holoTag(dentist, "the dentist", 0, 1.86, 0, { css: DTR_CSS, w: 0.28 }).rotation.y = -2.4;

    const panel = holoPanel(g, 0.8, 0.5, -1.0, 1.98, -2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(20,14,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = DTR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6d9b8"; cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillText("AVULSED PERMANENT TOOTH", w * 0.06, h * 0.16);
      cx.fillStyle = "#fbf1e6"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Head injury first", "Crown only — never the root", "Rinse gently · store wet, not water", "Dentist replants · reviews for years"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: DTR_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.2, 0.06, 0.34, i * 1.1, 2.62, -0.9, 0xece8e0, { rough: 0.4, cast: false });
      box(g, 1.08, 0.02, 0.26, i * 1.1, 2.585, -0.9, 0xfff6e6, { emissive: 0xfff6e6, ei: 0.55, rough: 0.4, cast: false });
    }
    const key = new THREE.DirectionalLight(0xfff4e8, 0.85);
    key.position.set(-2.4, 4.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xfbf6ef, 0x5d6a72, 0.9));

    const tickMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.5 });
    const backHome = back.rotation.x;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.0, -0.8),

      onStepComplete(step) {
        if (step.id === "dtr-read-clock") tissue.visible = false;
        if (step.id === "dtr-open-kit") { cap.position.set(0.09, -0.12, 0.04); cap.rotation.z = 0.4; }
        if (step.id === "dtr-store-tooth") { forceps.visible = false; box(hbss, 0.03, 0.02, 0.03, 0, 0.1, 0, 0xe9dcc2, { rough: 0.6 }); }
        if (step.id === "dtr-book-reviews") { reviewCard.parent.remove(reviewCard); reviews.add(reviewCard); reviewCard.position.set(-0.1, -0.02, 0.03); reviewCard.rotation.x = Math.PI / 2; }
        if (step.id === "dtr-trauma-log") repaint(log.userData.face, paperFace("TRAUMA RECORD", ["Times recorded", "Medium: salt kit", "Photos · reviews booked"], { band: "#59c97b" }));
        if (step.id === "dtr-head-screen") for (const c of triage.children) if (c.children?.[0]) c.children[0].material = tickMat;
      },

      onInterrupt(it) {
        if (it.id === "dtr-syncope") {
          pallor.visible = true;
          patient.head.rotation.x = 0.35;
          backPad.material.emissive.set(0xd8342a);
          backPad.material.emissiveIntensity = 0.6;
        }
        if (it.id === "dtr-coach-filming") {
          coachPhone.visible = true;
          coach.position.set(1.85, 0, 1.05);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dtr-syncope") {
          pallor.visible = false;
          patient.head.rotation.x = 0;
          backPad.material.emissiveIntensity = 0;
          back.rotation.x = backHome - 0.5;
          patient.root.rotation.x = -1.0;
          seat.rotation.x = -0.12;
        }
        if (it.id === "dtr-coach-filming") {
          coachPhone.visible = false;
          curtain.scale.x = 1;
          curtain.position.x = 0;
          coach.position.set(2.05, 0, 1.55);
        }
      },

      onHazard() {},

      animate(t) {
        patient.head.rotation.y = Math.sin(t * 0.8) * 0.05;
      },
    };
  },
};
