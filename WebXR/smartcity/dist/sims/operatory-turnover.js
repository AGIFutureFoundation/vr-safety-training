import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Operatory Turnover VR — Dental & Oral Health, station one.
// The dirty-to-clean turn of a dental operatory between patients: sharps and
// contaminated instruments contained at the point of use, every touched
// surface disinfected to the label's own contact time rather than a wipe and
// a guess, single-use barriers replaced rather than reused, waterlines and
// suction run clear, and the next setup laid out from a sterile, indicator-
// checked cassette before the next patient ever sits down.

const OT_ACCENT = 0x5ec9c2;

export const SIM_OPERATORY_TURNOVER = {
  id: "operatory-turnover",
  index: "116",
  domain: "Dental Hygiene",
  trade: "Dental hygienist",
  category: "Dental & Oral Health",
  indoor: "clinic",
  certification: "ADHA (American Dental Hygienists' Association) infection-control guidance; the CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003) and its 2016 Summary; OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication; the Dental Hygiene Board of California and the state dental practice act",
  name: "Operatory Turnover",
  title: simTitle("Operatory Turnover"),
  tagline: "Dirty-to-clean turnover: sharps and instruments contained at point of use, surfaces held to full contact time, barriers changed, lines flushed, the next setup laid out sterile",
  accent: OT_ACCENT,
  accentCss: "#5ec9c2",
  parSeconds: 210,
  footprint: 2.0,
  badge: { id: "turnover-clean", name: "Turnover Clean", note: "A full dirty-to-clean turnover with every contact time honoured and nothing left for the next patient to find" },

  game: system({
    name: "Chairside Standard",
    currency: "SEAL",
    ranks: ["Junior Assistant", "Chairside Hygienist", "Lead Hygienist", "Infection Control Lead", "Chairside Standard Certified"],
    badges: [
      { id: "contact-held", name: "Contact Held", note: "The disinfectant stayed wet for its full labeled contact time", test: AWARD.stepClean("contact-time") },
      { id: "sharp-safe", name: "Sharp Safe", note: "No hazard hit anywhere in the turnover", test: AWARD.safe },
      { id: "barrier-discipline", name: "Barrier Discipline", note: "Every barrier changed before the next patient sat down", test: AWARD.stepClean("barriers") },
    ],
    challenges: [
      { id: "clean-turnover", name: "Clean Turnover", note: "No corrections anywhere in the sequence", test: AWARD.clean },
      { id: "held-the-wipe", name: "Held The Wipe", note: "Held the wet-contact wait the full time, first try", test: AWARD.unbroken },
      { id: "fast-chair", name: "Fast Chair", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "uncapped-needle": "That local anesthetic needle is still uncapped on the tray from the last patient. Two-handed recapping is the classic needlestick; the safety shield gets activated with one hand, or it goes straight into sharps unrecapped — never picked up bare across the point.",
    "early-wipe": "That towel dried the counter down right after the spray went on. An EPA-registered intermediate-level disinfectant only kills what its label claims if the surface stays visibly wet for the full contact time printed on that label — wiped dry early, it has disinfected nothing and looks identical to a surface that has.",
    "torn-barrier": "That barrier sleeve on the light handle is split at the seam. A torn barrier is not a barrier — bare plastic film is showing through, and the handle underneath it has been touched with the same gloves that just handled this patient's mouth.",
    "no-indicator-cassette": "That pouch has no indicator strip printed on it at all. Every sterile package needs an internal and external chemical indicator so a colour change proves the load actually saw sterilizing conditions before anyone trusts what's inside — a pouch with no way to check that is not verified sterile, it is unverified.",
  },

  lateNotes: {
    "sterile-cassette": "Not yet. The operatory hasn't finished disinfection — bringing the sterile setup in while a surface is still working its contact time risks it picking up spatter or a stray touch before the room is actually clean.",
    "hand-sanitizer": "Hold off. Hand hygiene here is the last thing before the door opens for the next patient, not a placeholder partway through the turnover.",
    "indicator-strip": "There's nothing sealed to check yet — the sterile cassette has to be on the tray first.",
  },

  steps: [
    {
      id: "ppe-turnover", kind: "sequence", anyOrder: true,
      targets: ["utility-gloves", "turnover-mask", "eye-shield"],
      itemNames: { "utility-gloves": "utility gloves", "turnover-mask": "mask", "eye-shield": "eye protection" },
      title: "Don turnover PPE",
      cue: "Utility gloves, mask and eye protection before you touch anything on this tray.",
      why: "Turnover is not the same exposure as chairside work: you are handling used sharps, spray disinfectant and whatever spattered during the appointment, so the barrier is heavier gloves and a mask rated for aerosol, not the exam gloves you just pulled off. OSHA's PPE provisions treat the task, not the room, as what decides the barrier.",
    },
    {
      id: "contain-hazards", kind: "sequence", anyOrder: true,
      targets: ["dirty-cassette", "sharps-container"],
      itemNames: { "dirty-cassette": "close the contaminated cassette", "sharps-container": "sharps to the point-of-use container" },
      title: "Contain the sharps and the instruments at the point of use",
      cue: "Latch the used instruments into the closed cassette, and drop the sharps straight into this container — here at the chair.",
      why: "A closed cassette carries the instruments from this tray to reprocessing without another hand touching a blade or a probe in between, and OSHA's bloodborne pathogens standard puts sharps disposal as close to the point of use as it can be engineered — every step a used sharp travels in someone's hand is another chance for it to find someone's hand by accident.",
    },
    {
      id: "read-label", kind: "select", target: "disinfectant-bottle",
      title: "Read the disinfectant's contact time",
      cue: "Check the label on the intermediate-level disinfectant before you spray.",
      why: "An EPA-registered surface disinfectant's kill claim is only true for the wet contact time printed on its own label — two minutes for one product, ten for another. The bottle in your hand decides how long the next step actually has to last, not a number remembered from a different brand.",
    },
    {
      id: "apply-disinfectant", kind: "track", target: "spray-wand", seconds: 6,
      title: "Spray every surface a gloved hand touched",
      cue: "Work the light handles, the headrest, the chair switches, the syringe and the counter — steady, even coverage.",
      why: "Anything a gloved hand or a splash reached during the appointment is a surface, whether or not it looks touched — the light handle and the chair-height switch are handled every single visit and missed every single time someone only wipes what is obviously dirty.",
      track: {
        start: 0.1, green: [0.35, 0.65], rise: 0.55, fall: 0.45, drift: 0.12, label: "SPRAY COVERAGE",
        readout: (v) => (v < 0.35 ? "patchy — go back over it" : v > 0.65 ? "flooding — slow down" : "even coverage"),
      },
      holdBreakNote: "Coverage dropped out of band — a patchy spray leaves dry spots that never see the disinfectant at all.",
    },
    {
      id: "contact-time", kind: "hold", target: "wet-surface", seconds: 6,
      title: "Hold the wet contact time",
      cue: "Leave every sprayed surface visibly wet for the full time on the label — do not touch or dry it early.",
      why: "The kill claim on that bottle was tested for a surface that stayed wet the whole stated time, not for a surface sprayed and immediately wiped. Wiped dry early, a disinfected-looking counter has had the same contact as one that was never sprayed at all — and nothing about how it looks afterward tells you which one you did.",
      holdBreakNote: "You broke contact early. A surface dried before its time is not disinfected — it only looks that way.",
    },
    {
      id: "barriers", kind: "sequence", anyOrder: true,
      targets: ["light-handle-barrier", "chair-switch-barrier", "syringe-barrier"],
      itemNames: { "light-handle-barrier": "light handle barrier", "chair-switch-barrier": "chair switch barrier", "syringe-barrier": "air-water syringe barrier" },
      title: "Change the single-use barriers",
      cue: "Fresh barrier sleeve on the light handle, the chair switches, and the air-water syringe.",
      why: "A barrier is single-use precisely so the highest-touch points in the room — the light handle you re-position mid-treatment, the switch you press with a gloved hand, the syringe button — never rely on a spray-and-wipe to be clean between patients. It is changed every time, whether or not it looks used.",
    },
    {
      id: "waterline-flush", kind: "hold", target: "waterline-valve", seconds: 5,
      title: "Flush the dental unit waterline",
      cue: "Hold the flush open for the time the infection-control plan sets before the next patient's water runs through it.",
      why: "Water sitting in a narrow line since the last patient grows biofilm on the tubing wall, and a short burst does not clear it — the practice's own waterline protocol sets a flush time long enough to run that stagnant water out before anyone's mouth is downstream of it again.",
      holdBreakNote: "You let go before the flush time was up — the line still has last patient's standing water in it.",
    },
    {
      id: "suction-flush", kind: "select", target: "evacuation-cleaner",
      title: "Run cleaner through the suction lines",
      cue: "Draw the evacuation system cleaner through the high-volume suction and saliva ejector.",
      why: "Suction lines carry the same aerosol and debris the waterlines do, in the other direction, and they biofoul the same way if nothing is ever run through them between patients — the line cleaner is what keeps that tubing from becoming its own contamination source.",
    },
    {
      id: "restock-check", kind: "select", target: "supply-cart",
      title: "Restock consumables for the next patient",
      cue: "Check the cart has bibs, cotton rolls and saliva ejector tips before the setup goes down.",
      why: "A turnover that ends with the room clean but the cart empty just moves the interruption to the middle of the next appointment, with gloves already on and the patient already seated.",
    },
    {
      id: "setup-tray", kind: "drag", target: "sterile-cassette",
      title: "Bring the sterile cassette to the tray",
      cue: "Carry the wrapped, sterile cassette from storage and set it on the cleaned tray.",
      why: "The sterile setup only belongs on this tray once the tray itself is the clean side of the room — bringing it in earlier puts a sterile package down on a surface that has not finished being disinfected.",
      drag: { to: "tray-slot", radius: 0.4, missNote: "Not on the tray — set the cassette down square on the disinfected surface, not balanced on the edge." },
    },
    {
      id: "check-indicator", kind: "select", target: "indicator-strip",
      title: "Check the pouch's indicator before opening",
      cue: "Read the sterilization indicator printed on the pouch before you break the seal.",
      why: "The indicator's colour change is the only thing on that pouch that actually says the load reached sterilizing conditions — the wrap looks identical whether the cycle worked or the autoclave came up short, and the strip is what tells the two apart before the instruments touch a patient.",
    },
    {
      id: "final-hand-hygiene", kind: "select", target: "hand-sanitizer",
      title: "Hand hygiene before the next patient",
      cue: "Sanitise before you open the door and bring the next patient in.",
      why: "Hand hygiene closes the loop the same way it opened it — everything from the dirty tray to the disinfectant bottle to the cart has been in your hands, and the next patient's first contact with this room is your hand on theirs.",
    },
  ],

  interrupts: [
    {
      id: "early-seating",
      kind: "Scheduling pressure",
      after: "contact-time", delay: 3, seconds: 12,
      alert: "The front desk has walked the next patient down the hall and is pointing them at your open door.",
      cue: "That surface has not finished its contact time yet.",
      target: "wait-sign",
      why: "A disinfectant that has not sat wet for its full labeled time has not disinfected the surface, whatever it looks like — the schedule running behind is not a reason to seat someone on a chair the label says is not ready yet.",
      missNote: "The patient came in and sat down while the disinfectant was still working. The chair looked clean. Whether it actually was depends on a contact time that never finished, and nothing about how it looks afterward will ever tell you.",
      wrongNote: "It is the wait sign — hold the door until the label's time is actually up, not until it looks dry.",
    },
    {
      id: "needle-found",
      kind: "Sharps hazard",
      after: "waterline-flush", delay: 3, seconds: 11,
      alert: "There is a second needle on the tray, uncapped, that nobody disposed of at the chair after the last patient.",
      cue: "An uncapped needle just turned up on the tray you already cleared.",
      target: "sharps-container",
      why: "A missed sharp does not become safe by being ignored a second time — it goes into the container the moment it is found, the same as it should have gone in the first time, engineered device or not.",
      missNote: "The needle stayed on the tray through the rest of the turnover. Every additional minute it sits there uncapped is another chance for a hand reaching for something else to find it instead.",
      wrongNote: "It is the sharps container. An uncapped needle does not wait for a better moment.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.0, OT_ACCENT);

    // A solid-surface countertop texture and a stainless splash zone, from
    // citykit's tiling canvases rather than a flat swatch.
    const topTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 2, base: "#eef2f4", base2: "#e3e8eb", seam: "rgba(0,0,0,0.08)",
    }), { repeat: 3, px: 256 });

    // -------------------------------------------------------------- dental chair
    const chair = group(g, 0, 0, -1.0);
    // Robot training: nobody is in this chair right now and somebody will be
    // in a minute, so the headrest carries a default head keep-out volume an
    // embodied trainee treats as occupied. See shared/robot-embodiment.js.
    chair.userData.patientChair = { offset: [0, 1.34, -0.92], radius: 0.22 };
    slab(chair, 0.62, 0.14, 1.5, 0, 0.5, 0, 0x3a4a52, { radius: 0.08, rough: 0.55 });
    const back = slab(chair, 0.58, 0.9, 0.6, 0, 0.86, -0.55, 0x3a4a52, { radius: 0.08, rough: 0.55 });
    back.rotation.x = -0.35;
    const headrest = ball(chair, 0.13, 0, 1.34, -0.92, 0x3a4a52, { rough: 0.55, seg: 14 });
    headrest.scale.set(1.5, 0.7, 1);
    cyl(chair, 0.05, 0.05, 0.7, 0, 0.25, 0, CITY.darkSteel, { rough: 0.3, metal: 0.85, seg: 14 });
    slab(chair, 0.7, 0.06, 0.9, 0, 0.55, 0, 0x2b3138, { radius: 0.04, rough: 0.4, metal: 0.4 });

    // Overhead light on a jointed arm, with the barrier on its handle.
    const lightArm = group(chair, -0.32, 1.5, -0.2, 0.5);
    cyl(lightArm, 0.02, 0.02, 0.9, 0, 0, 0, CITY.darkSteel, { rough: 0.35, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2.4;
    const lightHead = group(lightArm, 0.75, 0.35, 0);
    box(lightHead, 0.32, 0.1, 0.22, 0, 0, 0, 0xe8edf0, { rough: 0.3, metal: 0.3 });
    const handle = cyl(lightHead, 0.014, 0.014, 0.1, 0, -0.09, 0.08, 0xdfe4e8, { rough: 0.3, metal: 0.2, seg: 8 });
    // Barrier sleeve, intact, over the handle.
    const handleBarrier = cyl(lightHead, 0.018, 0.018, 0.11, 0, -0.09, 0.08, 0xf4f8fa, { rough: 0.5, opacity: 0.6, transparent: true, seg: 8 });
    reg(hits, handleBarrier, "light-handle-barrier");
    void handle;

    // A torn barrier sleeve — the decoy — dangling loosely on the arm joint.
    const tornBarrier = group(lightArm, 0.35, 0.05, 0.05);
    box(tornBarrier, 0.05, 0.09, 0.02, 0, 0, 0, 0xf4f8fa, { rough: 0.6, opacity: 0.55, transparent: true });
    box(tornBarrier, 0.02, 0.04, 0.02, 0.02, -0.04, 0.005, 0xf4f8fa, { rough: 0.6, opacity: 0.4, transparent: true }).rotation.z = 0.5;
    holoTag(tornBarrier, "Torn sleeve", 0, 0.09, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, tornBarrier, "torn-barrier");

    // Chair-height switch, with its own barrier target.
    const switchPad = box(chair, 0.06, 0.02, 0.08, -0.34, 0.5, 0.3, 0xdfe4e8, { rough: 0.35, metal: 0.3 });
    const switchBarrier = box(chair, 0.075, 0.005, 0.095, -0.34, 0.512, 0.3, 0xf4f8fa, { rough: 0.5, opacity: 0.55, transparent: true });
    reg(hits, switchBarrier, "chair-switch-barrier");
    void switchPad;

    // Air-water syringe on a holder beside the chair.
    const syringeHolder = group(chair, 0.34, 0.6, 0.35);
    cyl(syringeHolder, 0.16, 0.16, 0.05, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 16 });
    const syringe = cyl(syringeHolder, 0.012, 0.012, 0.22, 0, 0.14, 0.05, 0xdfe4e8, { rough: 0.3, metal: 0.3, seg: 10 });
    syringe.rotation.x = 0.5;
    const syringeBarrier = box(syringeHolder, 0.02, 0.02, 0.02, 0, 0.24, 0.1, 0xf4f8fa, { rough: 0.5, opacity: 0.55, transparent: true });
    reg(hits, syringeBarrier, "syringe-barrier");

    // Uncapped needle left on the tray — the point-of-use hazard.
    const needleTray = group(chair, 0.1, 0.58, 0.55);
    box(needleTray, 0.22, 0.01, 0.14, 0, 0, 0, 0xe8edf0, { rough: 0.4, metal: 0.3 });
    const needle = group(needleTray, -0.02, 0.015, 0);
    cyl(needle, 0.008, 0.008, 0.08, 0, 0, 0, 0xdfe8ee, { rough: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(needle, 0.0015, 0.0015, 0.03, 0.055, 0, 0, CITY.steel, { rough: 0.1, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(needleTray, "Uncapped", 0, 0.08, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, needle, "uncapped-needle");

    // Dirty cassette waiting to be closed and moved off.
    const dirtyCassette = group(chair, -0.16, 0.58, 0.5);
    box(dirtyCassette, 0.24, 0.03, 0.14, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(dirtyCassette, 0.01, 0.02, 0.1, -0.09 + i * 0.045, 0.02, 0, CITY.steel, { rough: 0.3, metal: 0.7 });
    holoTag(dirtyCassette, "Dirty cassette", 0, 0.1, 0, { css: OT_ACCENT, w: 0.34 });
    reg(hits, dirtyCassette, "dirty-cassette");

    // -------------------------------------------------------- side counter / sink
    const counter = group(g, -2.2, 0, -0.4);
    slab(counter, 1.1, 0.04, 0.55, 0, 0.9, 0, 0xffffff, { radius: 0.01, rough: 0.5 });
    counter.children[0].material = texturedMat(topTex, { rough: 0.5, metal: 0.06, color: 0xffffff });
    box(counter, 1.1, 0.86, 0.55, 0, 0.44, 0, 0xd7dce1, { rough: 0.55, metal: 0.1 });
    // Sink basin.
    cyl(counter, 0.16, 0.16, 0.14, -0.3, 0.86, 0, 0xdfe4e8, { rough: 0.3, metal: 0.2, seg: 16, open: true, side: 2 });
    cyl(counter, 0.02, 0.02, 0.3, -0.3, 1.1, 0.12, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 }).rotation.x = 0.4;

    // Disinfectant bottle and spray wand on the counter.
    const bottle = group(counter, 0.25, 0.9, 0.1);
    cyl(bottle, 0.045, 0.05, 0.17, 0, 0.1, 0, 0xf2c14b, { rough: 0.4, metal: 0.1, seg: 14 });
    decal(bottle, 0.07, 0.09, 0, 0.11, 0.051, paperFace("", ["INTERMEDIATE", "LEVEL", "2 MIN WET"], { bg: "#fff5d6" }), { px: 160 });
    reg(hits, bottle, "disinfectant-bottle");

    const wand = group(counter, 0.42, 0.92, 0.12, 0.4);
    cyl(wand, 0.018, 0.02, 0.14, 0, 0, 0, 0x53585e, { rough: 0.4, metal: 0.3, seg: 10 });
    cyl(wand, 0.006, 0.006, 0.06, 0, 0.1, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
    holoTag(wand, "Spray wand", 0, 0.16, 0, { css: OT_ACCENT, w: 0.26 });
    reg(hits, wand, "spray-wand");

    // The wet-surface highlight — the chair, the light, the counter — glows
    // teal while contact time is running.
    const wetSurface = box(counter, 1.14, 0.06, 0.59, 0, 0.93, 0, OT_ACCENT, { emissive: OT_ACCENT, ei: 0.001, rough: 0.5, cast: false });
    reg(hits, wetSurface, "wet-surface");

    // The used towel wiped dry too early — the decoy sitting balled on the counter.
    const earlyWipe = group(counter, -0.42, 0.93, 0.12);
    slab(earlyWipe, 0.14, 0.03, 0.14, 0, 0, 0, 0xf4f6f8, { radius: 0.02, rough: 0.9 });
    holoTag(earlyWipe, "Wiped dry early", 0, 0.06, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, earlyWipe, "early-wipe");

    const handSanitizer = group(g, -1.6, 0, -2.0, 0.4);
    box(handSanitizer, 0.1, 0.24, 0.09, 0, 0.7, 0, 0xf0f4f6, { rough: 0.4 });
    box(handSanitizer, 0.06, 0.03, 0.05, 0, 0.55, 0.02, 0x2b3138, { rough: 0.5 });
    decal(handSanitizer, 0.08, 0.05, 0, 0.83, 0.046, signFace("SANITISE", { bg: "#f0f4f6", fg: "#0f4257", accent: "#5ec9c2", scale: 0.55 }));
    reg(hits, handSanitizer, "hand-sanitizer");

    // ------------------------------------------------------------------- PPE stand
    const ppe = group(g, -2.3, 0, 1.3, -0.4);
    slab(ppe, 0.5, 1.5, 0.1, 0, 0.75, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const utilGloves = box(ppe, 0.2, 0.14, 0.08, -0.14, 0.9, 0.07, 0xf2c14b, { rough: 0.75 });
    holoTag(ppe, "Utility gloves", -0.14, 1.02, 0.07, { css: OT_ACCENT, w: 0.32 });
    reg(hits, utilGloves, "utility-gloves");
    const turnoverMask = box(ppe, 0.12, 0.08, 0.03, 0.14, 0.95, 0.07, 0xdfe4e8, { rough: 0.7 });
    holoTag(ppe, "Mask", 0.14, 1.04, 0.07, { css: OT_ACCENT, w: 0.22 });
    reg(hits, turnoverMask, "turnover-mask");
    const eyeShield = group(ppe, 0, 1.35, 0.07);
    torus(eyeShield, 0.09, 0.012, 0, 0, 0, 0x2f6f8c, { rough: 0.3, metal: 0.2, seg: 6, seg2: 16 });
    box(eyeShield, 0.2, 0.08, 0.004, 0, 0, 0.01, 0xbfe4f2, { rough: 0.2, opacity: 0.5, transparent: true });
    holoTag(ppe, "Eye protection", 0, 1.48, 0.07, { css: OT_ACCENT, w: 0.36 });
    reg(hits, eyeShield, "eye-shield");

    // -------------------------------------------------------------- sharps & waste
    const sharpsUnit = group(g, 2.3, 0, -1.0, -Math.PI / 2);
    box(sharpsUnit, 0.3, 0.38, 0.24, 0, 1.1, 0, 0xd8342a, { rough: 0.6 });
    box(sharpsUnit, 0.32, 0.05, 0.26, 0, 1.32, 0, 0xf2e9c9, { rough: 0.55 });
    box(sharpsUnit, 0.14, 0.02, 0.09, 0, 1.345, 0.02, 0x2b2e33, { rough: 0.6 });
    decal(sharpsUnit, 0.26, 0.14, 0, 1.13, 0.122, signFace("SHARPS", { bg: "#a5261e", accent: "#f2ae14", fg: "#ffffff", scale: 0.4 }));
    box(sharpsUnit, 0.32, 0.44, 0.28, 0, 1.1, 0, 0x8d959d, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    reg(hits, sharpsUnit, "sharps-container");

    // -------------------------------------------------------------------- waterline / suction
    const utilityBox = group(g, 0.9, 0, -1.5, 0.5);
    box(utilityBox, 0.4, 0.9, 0.3, 0, 0.45, 0, 0x53585e, { rough: 0.5, metal: 0.3 });
    const valveWheel = torus(utilityBox, 0.06, 0.012, 0.14, 0.7, 0.16, 0x2f6f4a, { rough: 0.5, seg: 6, seg2: 16 });
    valveWheel.rotation.x = Math.PI / 2;
    reg(hits, valveWheel, "waterline-valve");
    hose(utilityBox, [[0.14, 0.45, 0.16], [0.3, 0.3, 0.2], [0.4, 0.1, 0.1]], 0.012, 0xbfd6e2, { steps: 10, rough: 0.4 });

    const evacBottle = group(utilityBox, -0.18, 0.6, 0.16);
    cyl(evacBottle, 0.045, 0.045, 0.2, 0, 0, 0, 0x59c97b, { rough: 0.4, metal: 0.1, seg: 12 });
    holoTag(evacBottle, "Line cleaner", 0, 0.16, 0, { css: OT_ACCENT, w: 0.32 });
    reg(hits, evacBottle, "evacuation-cleaner");

    // ---------------------------------------------------------------- sterile storage
    const cabinet = toolChest(g, 2.3, 1.3, { ry: -0.5, color: OT_ACCENT });
    const sterileCassette = group(g, 2.5, 0.5, 1.15);
    box(sterileCassette, 0.24, 0.03, 0.16, 0, 0, 0, 0xf4f8fa, { rough: 0.5, opacity: 0.7, transparent: true });
    decal(sterileCassette, 0.1, 0.05, 0, 0.02, 0.081, signFace("STERILE", { bg: "#eef7f4", accent: "#2f7d4a", scale: 0.55 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(sterileCassette, "Sterile cassette", 0, 0.09, 0, { css: OT_ACCENT, w: 0.34 });
    reg(hits, sterileCassette, "sterile-cassette");
    const trayDrop = box(g, 0.3, 0.02, 0.2, 0.12, 0.58, -0.45, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["tray-slot"] = trayDrop;

    const indicatorStrip = decal(sterileCassette, 0.1, 0.03, 0, 0.017, 0.081,
      signFace("—", { bg: "#f4f8fa", accent: "#8b929a", scale: 0.6 }), { px: 96 });
    reg(hits, indicatorStrip, "indicator-strip");

    // Unindicated spare pouch nearby — the decoy.
    const noIndicator = group(g, 2.65, 0.5, 1.5);
    box(noIndicator, 0.2, 0.02, 0.14, 0, 0, 0, 0xe8edf0, { rough: 0.6, opacity: 0.6, transparent: true });
    holoTag(noIndicator, "No indicator strip", 0, 0.06, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, noIndicator, "no-indicator-cassette");

    // Supply cart.
    const cart = group(g, 1.3, 0, 0.6, -0.3);
    box(cart, 0.4, 0.6, 0.3, 0, 0.3, 0, 0x2f7d4f, { rough: 0.55, metal: 0.2 });
    box(cart, 0.36, 0.03, 0.26, 0, 0.62, 0, 0xdfe4e8, { rough: 0.4 });
    for (let i = 0; i < 3; i++) box(cart, 0.3, 0.05, 0.2, 0, 0.66 + i * 0.07, 0, 0xf4f6f8, { rough: 0.8 });
    reg(hits, cart, "supply-cart");

    // -------------------------------------------------------------------- doorway
    const waitSign = group(g, 2.4, 0, 2.4);
    box(waitSign, 0.05, 1.2, 0.05, 0, 0.6, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6 });
    const signLamp = box(waitSign, 0.24, 0.16, 0.03, 0, 1.25, 0, 0x3a4048, { rough: 0.5, metal: 0.3 });
    const signLight = box(waitSign, 0.2, 0.11, 0.032, 0, 1.25, 0.001, 0xf0645b, { emissive: 0xf0645b, ei: 0.05, rough: 0.4, cast: false });
    holoTag(waitSign, "Please wait", 0, 1.4, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, signLight, "wait-sign");
    void signLamp;

    const nextPatient = standingFigure(g, 1.6, 2.6, { ry: -2.5, cloth: 0x6b7f8c, skin: 0xd9a985 });
    nextPatient.visible = false;

    // Paperwork panel: the turnover checklist on the wall.
    const panel = holoPanel(g, 0.6, 0.42, 0, 1.5, -2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,18,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5ec9c2"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#bfe9e4";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("OPERATORY 3 — TURNOVER", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Sharps + cassette at point of use", "Disinfectant: full label contact time",
       "Barriers: light, switch, syringe", "Waterline flush per plan"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { accent: OT_ACCENT });
    void panel;

    // Consumables shelving against the back wall: bibs, cotton rolls, cups,
    // barrier film and a spare box of the utility gloves the room runs on.
    const shelfA = group(g, -3.6, 0, -3.0);
    box(shelfA, 0.06, 1.5, 0.7, -0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfA, 0.06, 1.5, 0.7, 0.42, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const SHELF_STOCK = [
      [0.3, "BIBS", 0xdfe4e8], [0.75, "COTTON ROLLS", 0xf4f8fa], [1.2, "CUPS", 0xbfe4f2],
    ];
    for (const [y, label, c] of SHELF_STOCK) {
      box(shelfA, 0.82, 0.02, 0.68, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = -1; i <= 1; i++) {
        box(shelfA, 0.24, 0.16, 0.2, i * 0.28, y + 0.09, 0, c, { rough: 0.7 });
        decal(shelfA, 0.18, 0.06, i * 0.28, y + 0.09, 0.101, signFace(label, { bg: "#22272c", accent: "#5ec9c2", scale: 0.42 }), { px: 96 });
      }
    }
    holoTag(shelfA, "Consumables", 0, 1.55, 0, { css: OT_ACCENT, w: 0.4 });

    const shelfB = group(g, 3.7, 0, -3.0);
    box(shelfB, 0.06, 1.0, 0.6, -0.36, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfB, 0.06, 1.0, 0.6, 0.36, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(shelfB, 0.72, 0.02, 0.58, 0, 0.6, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
    const spareGloveBox = box(shelfB, 0.22, 0.14, 0.18, -0.2, 0.68, 0, 0xf2c14b, { rough: 0.75 });
    decal(shelfB, 0.16, 0.05, -0.2, 0.68, 0.091, signFace("GLOVES", { bg: "#22272c", accent: "#f2c14b", scale: 0.45 }), { px: 96 });
    const spareBarrierBox = box(shelfB, 0.22, 0.1, 0.18, 0.2, 0.66, 0, 0xf4f8fa, { rough: 0.6 });
    decal(shelfB, 0.16, 0.04, 0.2, 0.66, 0.091, signFace("BARRIER FILM", { bg: "#22272c", accent: "#5ec9c2", scale: 0.36 }), { px: 96 });
    void spareGloveBox; void spareBarrierBox;

    // A lidded step-bin for general waste, and a floor mat under the chair.
    const bin = group(g, -1.2, 0, 2.2);
    cyl(bin, 0.13, 0.11, 0.32, 0, 0.16, 0, 0x53585e, { rough: 0.55, metal: 0.3, seg: 14 });
    cyl(bin, 0.14, 0.14, 0.03, 0, 0.33, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 14 });
    slab(g, 1.1, 0.006, 1.5, 0, 0.001, -1.0, 0x2b3138, { radius: 0.05, rough: 0.9, opacity: 0.5, transparent: true, cast: false });

    let wetT = 0, flushing = false, spraying = false, waitActive = false;
    const mist = particles(g, 30, 0xbfe9e4, { size: 0.012, life: 0.4, additive: false, opacity: 0.5 });

    return {
      hits,
      footprint: 2.0,
      spawnLook: new THREE.Vector3(0, 1.1, -1.0),

      onStep(step) { spraying = step.id === "apply-disinfectant"; },

      onStepComplete(step) {
        if (step.id === "apply-disinfectant") { wetSurface.material.emissiveIntensity = 0.9; wetT = 1; }
        if (step.id === "contact-time") { wetSurface.material.emissiveIntensity = 0.15; earlyWipe.visible = false; }
        if (step.id === "contain-hazards") { needle.visible = false; dirtyCassette.visible = false; }
        if (step.id === "barriers") {
          handleBarrier.material = mat(0xf9fcfc, { rough: 0.5, opacity: 0.9 });
          tornBarrier.visible = false;
        }
        if (step.id === "waterline-flush") flushing = false;
        if (step.id === "setup-tray") {
          sterileCassette.parent.remove(sterileCassette);
          chair.add(sterileCassette);
          sterileCassette.position.set(0.12, 0.58, 0.55);
          sterileCassette.rotation.set(0, 0, 0);
        }
        if (step.id === "check-indicator") repaint(indicatorStrip, signFace("PASS", { bg: "#eef7f4", accent: "#2f7d4a", scale: 0.6 }));
      },

      onInterrupt(it) {
        if (it.id === "early-seating") { nextPatient.visible = true; waitActive = true; }
        if (it.id === "needle-found") { needle.visible = true; needleTray.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "early-seating") { nextPatient.visible = false; waitActive = false; signLight.material.emissiveIntensity = 0.05; }
        if (it.id === "needle-found") needle.visible = false;
      },

      onHazard() {},

      animate(t, dt, session) {
        flushing = session?.step?.id === "waterline-flush" && !!session.holding;
        if (waitActive) signLight.material.emissiveIntensity = 1.4 + Math.sin(t * 6) * 0.4;
        mist.visible = spraying && !!session?.track;
        if (mist.visible) mist.userData.step(dt, new THREE.Vector3(-1.78, 0.95, -0.28), 0.1, 0.4, -1.4);
        wetT = Math.max(0, wetT - dt * 0.02);
        void flushing;
      },
    };
  },
};
