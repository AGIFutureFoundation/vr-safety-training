import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, valveWheel,
  standingFigure, surfaceTexture, texturedMat, palette, concreteFace, corrugatedFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Spray Foam and Respirator Fit VR — Building Systems &
// Facilities, the eighth and last of the Insulators and Boilermakers pack.
// A mechanical room lined in closed-cell spray polyurethane foam: the full-
// face respirator fitted and quantitatively tested before anyone goes near
// the isocyanate component, ventilation set up, the room walked for
// ignition sources and uncovered items, the A/B ratio proven balanced, the
// pass sprayed to the specified thickness, and the room posted for its
// re-entry time before anyone without a respirator goes back in.
//
// Sited generically: no rig manufacturer, no chemical brand name — the fit-
// factor number, re-entry time and thickness figures are all "per the
// protocol" or "per the label".

const IBSF_ACCENT = 0xf2a03a;
const IBSF_PAL = palette("utility");

export const SIM_IB_SPRAY_FOAM_AND_RESPIRATOR_FIT = {
  id: "ib-spray-foam-and-respirator-fit",
  index: "359",
  domain: "Facilities",
  trade: "Insulator, spray polyurethane foam application — Insulators Local 16",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "Insulators Local 16 heat and frost insulators apprenticeship and training; OSHA 29 CFR 1910.134 respiratory protection and quantitative fit testing; 29 CFR 1910.1000 air contaminants and the permissible exposure limits for isocyanates; 29 CFR 1910.1200 hazard communication for the two-component system; 29 CFR 1926.451 scaffolds and ANSI A10.8 scaffolding safety requirements for the ceiling-pass platform; NIOSH criteria behind the quantitative fit-test protocol and the isocyanate exposure limits",
  name: "Spray Foam and Respirator Fit",
  title: simTitle("Spray Foam and Respirator Fit"),
  tagline: "A mechanical room sprayed in closed-cell foam behind a respirator fitted and quantitatively tested before the isocyanate component is ever opened",
  accent: IBSF_ACCENT,
  accentCss: "#f2a03a",
  parSeconds: 320,
  footprint: 2.3,
  badge: { id: "fit-proven-foam-held", name: "Fit Proven, Foam Held", note: "Respirator quantitatively fit-tested, ratio balanced and the pass held to specified thickness with the room posted for its re-entry time" },

  game: system({
    name: "Spray Foam Certified",
    currency: "MIL",
    ranks: ["Helper", "Applicator", "Lead Applicator", "Spray Foam Foreman", "Spray Foam Certified"],
    badges: [
      { id: "no-shortcut-on-fit", name: "No Shortcut on Fit", note: "Never sprayed before the quantitative fit test passed", test: AWARD.safe },
      { id: "thickness-precise", name: "Thickness Precise", note: "Held every gauge and track reading near band centre", test: AWARD.precise(0.72) },
      { id: "fit-disciplined", name: "Fit Disciplined", note: "Completed the fit-test sequence with no correction", test: AWARD.stepClean("fit-test-don") },
    ],
    challenges: [
      { id: "clean-job", name: "Clean Job", note: "No corrections from the data sheet to the re-entry post", test: AWARD.clean },
      { id: "steady-pass", name: "Steady Pass", note: "Held the spray pass through the whole rate", test: AWARD.unbroken },
      { id: "fast-foam", name: "Fast Foam", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "no-fit-test-skip": "You reached for the respirator hanging by the door and started for the room without running the fit test first. A respirator that has not been quantitatively fit-tested on your own face is a mask you are hoping seals, not one you know does — and isocyanate exposure through a gap in a seal you never checked shows up as sensitisation that does not go away even after you stop being exposed.",
    "isocyanate-no-glove": "You are handling the B-side isocyanate drum bare-handed. Isocyanates cross skin as readily as they cross a poor respirator seal, and repeated bare-hand contact is exactly how a spray foam applicator becomes sensitised to a chemical they will then react to for the rest of their career, at exposure levels far below what it took to sensitise them the first time.",
    "ignition-source-present": "That space heater is running a few feet from where the spray pass is about to start. The proportioner's heated hose and the blowing agent in this system both make an ignition source close to the spray zone a real hazard, and it gets shut off and moved clear before the trigger is ever pulled, not left running because it is only there to keep the room comfortable.",
    "early-reentry": "Someone is walking back into this room without a respirator before the posted re-entry time. Isocyanates off-gas from curing foam for a real, specified period, and a room that looks finished is not the same as a room whose air has actually cleared — the posted time is what the label and the ventilation plan both agree on, not a guess based on how long the trigger has been off.",
  },

  lateNotes: {
    "spray-gun-target": "The spray pass only starts once the ratio check reads balanced — not on the assumption that the equipment was set up correctly this morning.",
    "reentry-post": "The room only gets posted once the pass is actually finished and measured, not while spraying is still underway.",
  },

  steps: [
    {
      id: "spec", kind: "select", target: "job-data-sheet",
      title: "Read the job data sheet",
      cue: "Confirm the foam system, the isocyanate component and the respiratory protection required.",
      why: "The data sheet is what actually sets the respirator requirement for this specific system — full-face with the right cartridge, or supplied air, depending on the room's ventilation and the system's own exposure data — and guessing at that from a similar-looking job is how someone ends up in the wrong protection for the chemical actually in the hose.",
    },
    {
      id: "fit-test-don", kind: "sequence",
      targets: ["respirator-don", "strap-adjust", "seal-check-visual"],
      itemNames: { "respirator-don": "respirator donned", "strap-adjust": "straps adjusted", "seal-check-visual": "visual seal checked" },
      title: "Don the respirator for fit testing",
      cue: "Don the full-face respirator, adjust the straps evenly, then visually check the seal in the mirror.",
      why: "The straps are adjusted evenly, top and bottom together, because a respirator seated crooked can look sealed in the mirror and still leak along one side under the facepiece's own flex — the visual check is what catches an obviously bad seat before the quantitative instrument even starts reading.",
      outOfOrderNote: "Wrong order — don the mask, adjust the straps evenly, then check the seal visually before testing it.",
    },
    {
      id: "seal-check", kind: "hold", target: "seal-check-target", seconds: 6,
      title: "Hold the negative-pressure seal check",
      cue: "Block the cartridges, inhale, and hold the facepiece collapsed for the full count.",
      why: "A seal check held for the full count is what actually proves the facepiece stays drawn against the face under load, rather than a quick squeeze that passes on a seal that would leak the moment you turned your head or bent over to reach the spray gun.",
      holdBreakNote: "Released before the check was finished. A facepiece that leaks slowly passes a quick squeeze and fails the first time you actually move in it.",
    },
    {
      id: "fit-test-reading", kind: "gauge", target: "fit-test-instrument",
      title: "Run the quantitative fit-test reading",
      cue: "Read the fit-test instrument and commit only once the fit factor clears the required minimum.",
      why: "A quantitative fit factor is a number, not an impression — it is what actually proves this specific respirator on this specific face meets the protection this job's isocyanate exposure calls for, and no visual check or seal squeeze substitutes for it.",
      gauge: {
        label: "QUANTITATIVE FIT FACTOR", speed: 0.55, green: [0.62, 1.0],
        readout: (t) => `${Math.round(t * 500)}`,
        missNote: "Below the required fit factor. Reseat the mask and retest — this job does not start on a respirator that has not actually proven its seal.",
      },
    },
    {
      id: "ventilation-setup", kind: "select", target: "vent-fan-target",
      title: "Set up ventilation before spraying",
      cue: "Start the local exhaust fan and confirm fresh-air makeup into the room.",
      why: "Ventilation set up before the first pass, not partway through, is what keeps isocyanate vapour and overspray moving out of the room instead of building up around the people working in it — the respirator is the last line of defence, and it is only ever tested to work alongside ventilation that is actually running, not in place of it.",
    },
    {
      id: "area-prep", kind: "find", noHint: true,
      targets: ["uncovered-item", "space-heater", "missing-sheeting"],
      itemNames: { "uncovered-item": "the uncovered equipment", "space-heater": "the running space heater", "missing-sheeting": "the gap in the plastic sheeting" },
      itemNotes: {
        "uncovered-item": "Equipment left uncovered in the spray zone gets a permanent coat of overspray the moment the trigger is pulled — it gets sheeted before spraying starts, not wiped down afterward.",
        "space-heater": "A running space heater is an ignition source sitting close to a heated proportioner hose and a blowing agent — it gets shut off and moved clear of the spray zone before hot work of any kind, chemical or otherwise, starts in this room.",
        "missing-sheeting": "A gap in the plastic sheeting is a path for overspray to reach whatever is on the other side of it — the room is sheeted continuously before spraying, not in sections that leave an obvious gap unnoticed.",
      },
      title: "Survey the room before spraying",
      cue: "Three things about this room are not ready yet. Find them before the trigger gets pulled.",
      why: "Overspray goes wherever the room lets it, and every one of these three gaps is easy to close before spraying starts and expensive to fix after the foam has already cured on whatever it landed on.",
    },
    {
      id: "position-hose", kind: "drag", target: "proportioner-hose",
      title: "Position the proportioner hose",
      cue: "Carry the heated proportioner hose to the work area without kinking it.",
      why: "A kinked heated hose changes the pressure and temperature the material actually reaches the gun at, which is exactly the kind of hidden variable that later shows up as an inconsistent ratio nobody can explain from the gun alone.",
      drag: { to: "spray-position", radius: 0.5, missNote: "Not at the work position yet, and a hose dragged tight around a corner behind you is a hose that is probably kinked somewhere you cannot see." },
    },
    {
      id: "proportioner-check", kind: "turn", target: "ratio-check-valve",
      title: "Verify the A/B ratio",
      cue: "Turn the ratio check valve and commit once the reading shows the components balanced.",
      why: "Closed-cell foam only cures to its specified properties when the A and B components arrive at the gun in the ratio the system was designed around — off-ratio material can stay tacky, off-gas longer than expected, or simply never reach the fire and insulation performance the specification is buying.",
      turn: { turns: 0.8, axis: "z", label: "A/B RATIO CHECK", readout: (t) => `${Math.round(45 + t * 10)}:${Math.round(55 - t * 10)}` },
    },
    {
      id: "spray-pass", kind: "track", target: "spray-gun-target", seconds: 7,
      title: "Apply the spray pass",
      cue: "Hold the gun distance and pass rate steady across the surface.",
      why: "A steady distance and pass rate is what gives closed-cell foam its even rise and density across the whole surface — too close or too slow and it builds too thick to properly expand; too far or too fast and it lands thin, without the density the specification is counting on for both insulation and fire performance.",
      track: {
        start: 0.1, green: [0.36, 0.6], rise: 0.5, fall: 0.44, drift: 0.11, label: "PASS RATE",
        readout: (v) => (v < 0.36 ? "too slow — building too thick" : v > 0.6 ? "too fast — landing thin" : "even rise"),
      },
      holdBreakNote: "Pass rate slipped out of band. An uneven pass here is a density problem the thickness check is about to find.",
    },
    {
      id: "thickness-check", kind: "gauge", target: "thickness-probe",
      title: "Check the applied thickness",
      cue: "Probe the cured foam and commit once the reading meets the specified thickness.",
      why: "Thickness is a specified number tied to the R-value and fire rating this job is actually being paid to deliver, and the only way to know a pass reached it is to measure it — a foam surface that looks like a finished job and one that actually meets spec are not the same thing until this probe says so.",
      gauge: {
        label: "APPLIED THICKNESS", speed: 0.6, green: [0.42, 0.68],
        readout: (t) => `${(t * 4).toFixed(1)} in`,
        missNote: "Below the specified thickness. A second pass goes on now, while the crew and the rig are still set up for it.",
      },
    },
    {
      id: "reentry-hold", kind: "select", target: "reentry-post",
      title: "Post the room for its re-entry time",
      cue: "Post the sign naming the re-entry time before anyone without a respirator comes back in.",
      why: "Isocyanates continue off-gassing from curing foam for a specified period the label and the ventilation plan both account for, and a posted re-entry time is what stops someone from reading a quiet room as a safe one before the air has actually cleared on the schedule the chemistry, not the silence, sets.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["missed-overspray", "dropped-masking", "unlabeled-drum"],
      itemNames: { "missed-overspray": "the overspray on an unintended surface", "dropped-masking": "the dropped masking material", "unlabeled-drum": "the unlabeled empty drum" },
      itemNotes: {
        "missed-overspray": "Overspray on a surface that was never supposed to be sprayed is a cleanup problem that gets harder every hour it cures — it gets found and addressed now, while the material is still workable.",
        "dropped-masking": "Masking material dropped on the floor is a trip hazard in a room somebody is about to walk back into on the posted re-entry schedule — it gets picked up before the room is called finished.",
        "unlabeled-drum": "An empty isocyanate drum with no label on it is a hazard communication gap for whoever handles it next in the waste stream — it gets labelled before it leaves this room, not assumed obvious because the crew that used it already knows what it held.",
      },
      title: "Walk the room before posting it finished",
      cue: "Three things about this room are not right yet. Find them before calling the job done.",
      why: "A room that looks finished and a room that is actually ready to be posted and walked away from are told apart by the overspray, the dropped masking and the unlabeled drum — three things that do not show up in a glance from the doorway.",
    },
    {
      id: "crew-checkin", kind: "select", target: "ibsf-crew-checkin",
      title: "Check in with the spray foam foreman",
      cue: "Report the fit-test result, the heater found running, and how the ratio held through the pass.",
      why: "A fit factor near the minimum needs a note in the file even though it passed, so a future retest knows to watch it, and the running heater needs a reminder posted for the next crew before this room is used again. The check-in is also where a ratio that drifted mid-pass gets flagged before the proportioner goes on the next job unchecked.",
    },
    {
      id: "closing-log", kind: "select", target: "ibsf-closing-log",
      title: "Sign the application closeout log",
      cue: "Record the fit factor, the thickness readings and the re-entry time posted, then sign.",
      why: "The closeout log ties this specific application to the fit test that cleared the crew to spray it, the thickness actually measured, and the re-entry time posted for whoever comes back into the room next — the record that turns a finished-looking job into one that can actually be verified.",
    },
  ],

  interrupts: [
    {
      id: "makeup-air-fan-fails",
      kind: "Ventilation down",
      after: "spray-pass", delay: 4, seconds: 12,
      alert: "The makeup air fan has tripped off mid-spray, and haze is starting to build in the room.",
      cue: "Reset the fan before the spray pass continues.",
      target: "vent-fan-reset",
      why: "Ventilation loss mid-spray is not a pause-and-continue situation — vapour and overspray haze both build fast in a closed room with the fan down, right in the air the crew is working in behind respirators that were only ever fit-tested to work alongside ventilation that is actually running.",
      missNote: "The pass continued while haze kept building with the fan down. Ventilation that stops moving air is a room filling up with exactly what the respirator and the ventilation plan were both supposed to be handling together.",
      wrongNote: "It is the fan reset. Nothing about this spray pass continues safely with the makeup air down.",
    },
    {
      id: "bystander-enters-early",
      kind: "Early entry",
      after: "thickness-check", delay: 4, seconds: 12,
      alert: "A coworker without a respirator is walking toward the doorway, trying to enter before the posted re-entry time.",
      cue: "Stop them at the barrier before they cross into the posted room.",
      target: "entry-barrier",
      why: "The posted re-entry time exists precisely for the minutes right after spraying stops, when curing foam is still off-gassing and looks perfectly finished from the doorway — reinforcing the barrier now is what actually keeps somebody without a respirator from walking into exactly the exposure the whole posting exists to prevent.",
      missNote: "The coworker walked in before the posted time while the barrier went unreinforced. A room that looks done from the doorway is not the same as air that has actually cleared on the schedule the chemistry sets.",
      wrongNote: "That is not it. The entry barrier is what actually keeps someone out of this room before its posted time is up.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Insulators Local 16 business agent if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.3, IBSF_ACCENT);

    // ------------------------------------------------------------- floor and mechanical room
    const floorTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, {
      finish: "smooth", tone: "#706a5e", tone2: "#615c52",
    }), { repeat: 6 });
    const floor = box(g, 6.4, 0.1, 5.8, 0, 0.05, -0.1, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9 });

    const wallTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, {
      colour: IBSF_PAL.structure, ribs: 18,
    }), { repeat: 3 });
    const backWall = box(g, 5.4, 2.7, 0.12, 0, 1.35, -2.8, 0xffffff, { rough: 0.7, metal: 0.2 });
    backWall.material = texturedMat(wallTex, { rough: 0.65, metal: 0.25 });
    const sprayedWall = box(g, 2.2, 2.4, 0.1, 1.6, 1.2, -2.75, 0xf0eadc, { rough: 0.9 });
    holoTag(sprayedWall, "Sprayed closed-cell foam", 0, 1.4, 0, { css: "#f2a03a", w: 0.5 });

    // ------------------------------------------------------------- proportioner rig
    const proportioner = group(g, -1.6, 0, -1.2, -0.3);
    box(proportioner, 0.9, 0.7, 0.5, 0, 0.35, 0, 0x2f6f8f, { rough: 0.6, metal: 0.4 });
    holoTag(proportioner, "Proportioner", 0, 0.76, 0, { css: "#f2a03a", w: 0.36 });
    const drumA = cyl(proportioner, 0.18, 0.18, 0.5, -0.5, 0.25, 0.4, 0x2f6f8f, { rough: 0.6, seg: 16 });
    void drumA;
    const drumB = cyl(proportioner, 0.18, 0.18, 0.5, -0.9, 0.25, 0.4, 0xd8232a, { rough: 0.6, seg: 16 });
    holoTag(drumB, "Isocyanate — B side", 0, 0.36, 0, { css: "#f0645b", w: 0.44 });
    reg2(drumB, "isocyanate-no-glove");
    const ratioValve = valveWheel(proportioner, 0.4, 0.5, 0.2, { r: 0.06, color: 0xf2c14b, body: IBSF_PAL.structure });
    holoTag(ratioValve, "Ratio check valve", 0, 0.22, 0, { css: "#f2a03a", w: 0.4 });
    reg2(ratioValve, "ratio-check-valve");

    const hoseCoil = group(g, -1.0, 0, -0.5, 0.4);
    torus(hoseCoil, 0.3, 0.03, 0, 0.1, 0, 0xd8232a, { rough: 0.6, seg: 8, seg2: 20 });
    holoTag(hoseCoil, "Proportioner hose", 0, 0.32, 0, { css: "#f2a03a", w: 0.4 });
    reg2(hoseCoil, "proportioner-hose");
    const sprayPos = group(g, 1.0, 0, -0.8);
    box(sprayPos, 0.2, 0.2, 0.2, 0, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["spray-position"] = sprayPos;

    const sprayGun = group(g, 1.0, 0, -0.9, -0.4);
    box(sprayGun, 0.06, 0.16, 0.2, 0, 1.1, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(sprayGun, "Spray gun", 0, 1.24, 0, { css: "#f2a03a", w: 0.3 });
    reg2(sprayGun, "spray-gun-target");
    const foamMist = particles(sprayGun, 26, 0xf0eadc, { size: 0.03, life: 0.5, additive: false, opacity: 0.45 });
    foamMist.visible = false;
    const haze = particles(g, 20, 0xbfc8cf, { size: 0.03, life: 0.6, additive: false, opacity: 0.2 });
    haze.position.set(0.5, 1.4, -1.2);
    haze.visible = false;

    // ------------------------------------------------------------- fit-test station
    const fitBench = group(g, -2.0, 0, 1.0, 0.3);
    slab(fitBench, 0.9, 0.72, 0.5, 0, 0.36, 0, 0x5a636b, { radius: 0.02, rough: 0.6, metal: 0.3 });
    const respiratorTarget = group(fitBench, -0.2, 0.72, -0.1, 0.3);
    box(respiratorTarget, 0.12, 0.1, 0.08, 0, 0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    torus(respiratorTarget, 0.05, 0.014, 0, 0.14, 0.02, 0x3c4650, { rough: 0.4 });
    holoTag(respiratorTarget, "Respirator — fit test first", 0, 0.24, 0, { css: "#f2a03a", w: 0.52 });
    reg2(respiratorTarget, "respirator-don");
    reg2(respiratorTarget, "no-fit-test-skip");
    const strapAdjust = box(fitBench, 0.1, 0.02, 0.02, -0.2, 0.9, -0.1, 0xf2c14b, { rough: 0.6 });
    reg2(strapAdjust, "strap-adjust");
    const mirror = box(fitBench, 0.16, 0.2, 0.01, 0.2, 0.9, -0.24, 0xbfe4ff, { rough: 0.2, metal: 0.3 });
    holoTag(mirror, "Mirror", 0, 0.14, 0, { css: "#f2a03a", w: 0.24 });
    reg2(mirror, "seal-check-visual");
    reg2(mirror, "seal-check-target");

    const fitInstrument = instrument(fitBench, 0.2, 0.75, 0.1, { idle: "--", color: IBSF_ACCENT });
    holoTag(fitInstrument, "Quantitative fit-test instrument", 0, 0.16, 0, { css: "#f2a03a", w: 0.56 });
    reg2(fitInstrument, "fit-test-instrument");
    const thicknessProbe = instrument(fitBench, -0.05, 0.75, 0.18, { idle: "-- in", color: IBSF_ACCENT });
    holoTag(thicknessProbe, "Thickness probe", 0, 0.16, 0, { css: "#f2a03a", w: 0.4 });
    reg2(thicknessProbe, "thickness-probe");

    // ------------------------------------------------------------- ventilation, heater, hazards
    const ventFan = group(g, 2.0, 0, -1.6, -0.3);
    box(ventFan, 0.5, 0.5, 0.25, 0, 1.4, 0, 0x4a525a, { rough: 0.6, metal: 0.4 });
    const fanBlades = group(ventFan, 0, 1.4, 0.14);
    for (let i = 0; i < 4; i++) box(fanBlades, 0.34, 0.06, 0.008, 0, 0, 0, 0x9aa4ad, { rough: 0.6 }).rotation.z = (i * Math.PI) / 4;
    holoTag(ventFan, "Local exhaust fan", 0, 1.72, 0, { css: "#f2a03a", w: 0.4 });
    reg2(ventFan, "vent-fan-target");
    reg2(ventFan, "vent-fan-reset");

    const spaceHeater = group(g, 1.4, 0, -0.3, 0.4);
    box(spaceHeater, 0.24, 0.3, 0.16, 0, 0.15, 0, 0xd8232a, { rough: 0.5, metal: 0.3 });
    const heaterGlow = box(spaceHeater, 0.18, 0.1, 0.02, 0, 0.15, 0.09, 0xff8a3c, { emissive: 0xff8a3c, ei: 1.2 });
    holoTag(spaceHeater, "Space heater — running", 0, 0.36, 0, { css: "#f0645b", w: 0.5 });
    reg2(spaceHeater, "space-heater");
    reg2(spaceHeater, "ignition-source-present");

    const uncoveredItem = box(g, 0.3, 0.3, 0.3, 1.9, 0.15, 0.6, 0x3a78c9, { rough: 0.5, metal: 0.3 });
    holoTag(uncoveredItem, "Uncovered equipment", 0, 0.4, 0, { css: "#f0645b", w: 0.44 });
    reg2(uncoveredItem, "uncovered-item");

    const sheetingGap = group(g, 2.2, 0, 0.2);
    box(sheetingGap, 0.5, 1.8, 0.02, 0, 0.9, 0, 0xe7edb8, { rough: 0.3, opacity: 0.35, transparent: true, cast: false });
    box(sheetingGap, 0.12, 1.8, 0.03, 0.19, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sheetingGap, "Gap in the sheeting", 0, 1.95, 0, { css: "#f0645b", w: 0.44 });
    reg2(sheetingGap, "missing-sheeting");

    // ------------------------------------------------------------------- re-entry post + barrier
    const reentryPost = group(g, 1.6, 0, 0.6, 0.3);
    box(reentryPost, 0.28, 0.28, 0.02, 0, 1.3, 0, 0xd8232a, { rough: 0.5 });
    decal(reentryPost, 0.22, 0.1, 0, 1.3, 0.011, signFace("DO NOT\nENTER", { bg: "#c8102e", accent: "#ffffff", fg: "#ffffff", scale: 0.4 }), { px: 180 });
    holoTag(reentryPost, "Re-entry posting", 0, 1.5, 0, { css: "#f2a03a", w: 0.4 });
    reg2(reentryPost, "reentry-post");

    const entryBarrier = group(g, 2.4, 0, -0.4, -0.3);
    box(entryBarrier, 0.9, 0.05, 0.02, 0, 0.9, 0, 0xf2c14b, { rough: 0.6 });
    for (const sx of [-0.4, 0.4]) cyl(entryBarrier, 0.02, 0.02, 1.0, sx, 0.5, 0, 0x2b2f33, { rough: 0.6, seg: 8 });
    holoTag(entryBarrier, "Entry barrier", 0, 1.1, 0, { css: "#f2a03a", w: 0.34 });
    reg2(entryBarrier, "entry-barrier");
    const earlyWalker = standingFigure(g, 2.6, -1.0, { ry: 2.2, cloth: 0x2b3138, helmet: 0xf2c14b, vest: 0xd8e24a });
    holoTag(g, "Walking in early — no respirator?", 2.6, 2.0, -1.0, { css: "#f0645b", w: 0.6 });
    reg2(earlyWalker, "early-reentry");

    // ------------------------------------------------------------------- final-walk targets
    const overspray = box(g, 0.3, 0.02, 0.3, -0.6, 0.06, 0.9, 0xe4d8b8, { rough: 0.8, cast: false });
    holoTag(g, "Overspray", -0.6, 0.16, 0.9, { css: "#f0645b", w: 0.3 });
    reg2(overspray, "missed-overspray");
    const droppedMasking = box(g, 0.4, 0.01, 0.3, -1.2, 0.006, 0.5, 0xe7edb8, { rough: 0.5, opacity: 0.5, transparent: true, cast: false });
    holoTag(g, "Dropped masking", -1.2, 0.14, 0.5, { css: "#f0645b", w: 0.34 });
    reg2(droppedMasking, "dropped-masking");
    const emptyDrum = cyl(g, 0.18, 0.18, 0.5, -1.9, 0.25, 1.1, 0x7a7a7a, { rough: 0.7, seg: 16 });
    holoTag(g, "Unlabeled empty drum", -1.9, 0.56, 1.1, { css: "#f0645b", w: 0.5 });
    reg2(emptyDrum, "unlabeled-drum");

    // ------------------------------------------------------------------- paperwork + crew
    const dataSheet = holoPanel(g, 0.56, 0.4, -1.9, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2a03a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d9c19a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB DATA SHEET SF-27", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4ecdc";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("MECH ROOM — CLOSED-CELL SPF", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#d9c19a";
      ["Respirator: full-face, fit-tested", "Ratio: per the system, checked",
        "Thickness: per the spec", "Re-entry: per the label",
        "Ignition sources: cleared"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.1)));
    }, { ry: 0.7, accent: IBSF_ACCENT });
    reg2(dataSheet, "job-data-sheet");

    const chest = toolChest(g, 2.1, 1.6, { ry: -0.6, color: IBSF_ACCENT });
    void chest;

    // Staged sheeting rolls and a scaffold for the ceiling pass.
    const sheetRolls = group(g, -2.2, 0, -1.6, 0.3);
    for (let i = 0; i < 3; i++) {
      cyl(sheetRolls, 0.09, 0.09, 0.5, i * 0.22 - 0.22, 0.09, 0, 0xe7edb8, { rough: 0.4, opacity: 0.6, transparent: true, seg: 14 }).rotation.z = Math.PI / 2;
    }
    holoTag(sheetRolls, "Sheeting rolls", 0, 0.3, 0, { css: "#f2a03a", w: 0.36 });

    const scaffold = group(g, 1.6, 0, 1.3);
    for (const sx of [-0.6, 0.6]) for (const sz of [-0.35, 0.35]) {
      cyl(scaffold, 0.022, 0.022, 1.5, sx, 0.75, sz, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    }
    box(scaffold, 1.3, 0.04, 0.8, 0, 1.5, 0, 0x9aa4ad, { rough: 0.7, metal: 0.4 });
    for (const sz of [-0.35, 0.35]) box(scaffold, 1.3, 0.02, 0.02, 0, 1.9, sz, CITY.hiVis, { rough: 0.6 });
    holoTag(scaffold, "Ceiling-pass scaffold", 0, 2.05, 0, { css: "#f2a03a", w: 0.46 });

    const foreman = standingFigure(g, -2.7, 0.55, { ry: -0.7, cloth: 0x3a434d, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void foreman;
    const checkin = holoPanel(g, 0.46, 0.3, -2.6, 1.6, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2a03a"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#f4ecdc";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("CHECK IN — FOREMAN", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("fit factor · heater · ratio drift", w / 2, h * 0.68);
    }, { accent: IBSF_ACCENT });
    reg2(checkin, "ibsf-crew-checkin");

    const closingLog = slab(g, 0.22, 0.03, 0.28, -2.6, 0.93, 2.6, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Application closeout log", -2.6, 1.12, 2.6, { css: "#8fa9c4", w: 0.5 });
    reg2(closingLog, "ibsf-closing-log");

    // ----------------------------------------------------------------- state
    let venting = false, spraying = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0.3, 1.3, -0.8),

      onStepComplete(step) {
        if (step.id === "ventilation-setup") venting = true;
        if (step.id === "area-prep") {
          uncoveredItem.visible = false;
          heaterGlow.material = mat(0x3a3a3a, { emissive: 0x000000 });
          sheetingGap.children[1].material = mat(0xe7edb8, { opacity: 1, transparent: false });
        }
        if (step.id === "spray-pass") { spraying = false; foamMist.visible = false; sprayedWall.material = mat(0xf0eadc, { rough: 0.85 }); }
        if (step.id === "final-walk") {
          overspray.visible = false; droppedMasking.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "makeup-air-fan-fails") { venting = false; haze.visible = true; }
        if (it.id === "bystander-enters-early") earlyWalker.position.x = 2.35;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "makeup-air-fan-fails") { venting = true; haze.visible = false; }
        if (it.id === "bystander-enters-early") earlyWalker.position.x = 2.6;
      },

      onHazard() {},

      animate(t, dt, session) {
        if (venting) fanBlades.rotation.z += dt * 9;
        spraying = session?.step?.id === "spray-pass";
        foamMist.visible = spraying;
        if (spraying) foamMist.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.5, 0.2);
        if (haze.visible) haze.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.06, 0.3, 0.2);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "fit-test-reading") {
            repaint(fitInstrument.userData.screen, signFace(`${Math.round(gg.t * 500)}`, {
              bg: "#0d1c24", accent: gg.t > 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
            }));
          }
          if (session.step?.id === "thickness-check") {
            repaint(thicknessProbe.userData.screen, signFace(`${(gg.t * 4).toFixed(1)}`, {
              bg: "#1c1408", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
            }));
          }
        }
        void t;
      },
    };
  },
};
