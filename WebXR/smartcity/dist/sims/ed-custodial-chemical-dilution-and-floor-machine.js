import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg, cone,
  surfaceTexture, texturedMat, tileFace, blockFace, safetyStripeFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Custodial Chemical Dilution & Floor Machine VR — Building
// Systems & Facilities, the education-support-staff programme.
//
// A school hallway outside the custodial closet at the end of the day: the
// wall-mounted dilution-control dispenser that meters concentrate into water
// so nobody eyeballs a chemical, the colour-coded jug rack, a walk-behind
// floor machine stripping a hallway section, and the eyewash station the
// closet keeps for exactly the day the dispenser is bypassed anyway. The
// learner is the AFT- or CSEA-represented custodian running the chemical and
// the machine after students have gone home, with a supervising custodian
// nearby and the odd straggler still in the building. The school, the
// chemical brand and the dispenser make are all generic; every quantity is
// read off the label, the SDS or the dispenser's own dial, never invented.

const CD_ACCENT = 0x5fb87a;
const CD_CSS = "#5fb87a";

export const SIM_ED_CUSTODIAL_CHEMICAL_DILUTION_AND_FLOOR_MACHINE = {
  id: "ed-custodial-chemical-dilution-and-floor-machine",
  index: "620",
  domain: "Building Systems & Facilities",
  trade: "AFT- or CSEA-represented school custodian running chemical dilution and floor-care equipment",
  category: "Building Systems & Facilities",
  indoor: "service",
  weather: "overcast",
  certification: "AFT and CSEA custodial training; OSHA's Hazard Communication standard (29 CFR 1910.1200) for the GHS-labelled concentrate, the safety data sheet on file and the label on every secondary container; OSHA's PPE standards (29 CFR 1910.132, 29 CFR 1910.133, 29 CFR 1910.138) for gloves, goggles and hand protection at the dispenser and the machine; ANSI/ISEA Z358.1 for the eyewash station; OSHA's control of hazardous energy (29 CFR 1910.147) for unplugging the floor machine before a pad or brush change; the chemical manufacturer's own dilution-control system and label directions; the district's custodial procedure for chemical storage and floor care",
  name: "Custodial Chemical Dilution & Floor Machine",
  title: simTitle("Custodial Chemical Dilution & Floor Machine"),
  tagline: "The hallway after the bell: the SDS read before the jug is touched, the dispenser metering the dilution instead of a guess, the machine walked round before it's plugged in, a wet-floor cone up before the pad turns, the eyewash proven, and the pad changed only once the cord is out of the wall",
  accent: CD_ACCENT,
  accentCss: CD_CSS,
  parSeconds: 300,
  footprint: 2.7,
  badge: { id: "metered-not-guessed", name: "Metered, Not Guessed", note: "Every dilution off the dispenser's own dial, the machine grounded and chocked with its cord clear of the walkway, and the eyewash proven before the shift ends" },

  supportLine: "your AFT or CSEA chapter's member assistance line, or the district's employee assistance programme",

  game: system({
    name: "Hallway Shift",
    currency: "OZ",
    ranks: ["Custodial Aide", "Floor Tech", "Lead Custodian", "Building Engineer", "Facilities Certified"],
    badges: [
      { id: "never-eyeballed", name: "Never Eyeballed", note: "Every chemical metered through the dispenser, never poured by eye", test: AWARD.safe },
      { id: "clean-pass", name: "Clean Pass", note: "No corrections across the whole hallway", test: AWARD.clean },
      { id: "steady-pad", name: "Steady Pad", note: "The floor machine held in its pressure band without a break", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "closet-open-on-time", name: "Closet Open on Time", note: "Set up and machine plugged in inside 80% of par", test: AWARD.fast(0.8) },
      { id: "one-pass-walkaround", name: "One-Pass Walkaround", note: "Machine inspection clean on the first pass", test: AWARD.stepClean("machine-walkaround") },
      { id: "eight-in-a-row", name: "Eight in a Row", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "bleach-ammonia-mix": "That bucket has bleach and an ammonia-based cleaner poured into it together. Mixing the two releases chloramine gas, and a closet-sized room fills with it fast enough that the person who mixed it is usually the one who breathes the most of it — the label on each jug exists precisely so this pairing never happens by accident.",
    "bypass-metering-tip": "That spray bottle is being filled straight from the concentrate jug, past the dispenser's own metering tip. The dispenser exists because a chemical strong enough to disinfect a doorknob is also strong enough to burn skin and eyes at full strength — skipping it turns a diluted-and-safe cleaner into an undiluted one in an unlabelled bottle.",
    "cord-across-doorway": "The floor machine's cord is run straight across the doorway instead of along the baseboard. A cord underfoot in a doorway is a trip for anyone passing through and a crush point for the cord itself every time the door swings — it gets routed clear of the walkway before the machine ever starts.",
    "unlocked-chemical-closet": "The closet door is standing open with the chemical rack in plain reach and nobody watching it. A school hallway has students in it before and after the custodian's own shift, and a closet full of concentrate is exactly the kind of thing Hazard Communication assumes stays behind a closed, latched door.",
  },

  lateNotes: {
    "secondary-label": "Not yet — the bottle gets labelled once it's actually been filled at the dispenser, not before.",
    "eyewash-station": "The eyewash gets proven once the machine is running and the hallway is underway, not before the shift starts.",
  },

  steps: [
    {
      id: "read-sds", kind: "select", target: "sds-binder",
      title: "Read tonight's label and SDS",
      cue: "Open the SDS binder and read the label for tonight's chemical before touching any jug.",
      why: "The label and the safety data sheet are where the dilution ratio, the PPE the manufacturer calls for and the first-aid measures all actually live — reading them before the jug comes off the shelf is the difference between diluting a chemical correctly and finding out what it does at full strength from the label after something has already gone wrong.",
    },
    {
      id: "ppe-don", kind: "sequence", anyOrder: false,
      targets: ["ppe-gloves", "ppe-goggles", "ppe-apron"],
      itemNames: { "ppe-gloves": "chemical-resistant gloves", "ppe-goggles": "splash goggles", "ppe-apron": "chemical apron" },
      title: "Glove, then goggle, then apron",
      cue: "Pull on the chemical-resistant gloves, then the splash goggles, then the apron, in that order.",
      why: "Gloves go on first because everything else on the shelf is about to be handled by hands that are already protected; goggles go on before the apron so a splash off the jug's own cap never reaches an open eye while the apron is still being tied. OSHA's PPE standards call for the manufacturer's listed protection at the dispenser — this is where it goes on, not after the first jug is already open.",
      outOfOrderNote: "Gloves, then goggles, then the apron — the label's PPE goes on before the jug does, in the order that keeps a splash off bare skin and out of an eye.",
    },
    {
      id: "chemical-select", kind: "select", target: "correct-jug",
      title: "Pick tonight's chemical off the rack",
      cue: "Read the colour coding on the rack and take the quaternary disinfectant jug the SDS called for.",
      why: "The rack is colour-coded precisely so a custodian working from memory at the end of a long shift still reaches for the right jug — the SDS just read named the disinfectant, not the degreaser or the glass cleaner beside it, and the colour on the cap is the fast check that the hand about to lift it is lifting the right one.",
    },
    {
      id: "dilution-set", kind: "gauge", target: "dilution-station",
      title: "Set the dispenser to the label's dilution",
      cue: "Turn the dispenser's selector to the ratio the label calls for and commit it.",
      why: "The dispenser's whole job is to turn a concentrate strong enough to burn skin into a working solution at a known strength, metered the same way every time — a dial set even one notch off either wastes concentrate on a solution too weak to disinfect, or hands the custodian a bottle stronger than the label, the SDS or anyone's skin is expecting.",
      gauge: { label: "DILUTION RATIO", speed: 0.6, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? `1:${Math.round(40 + t * 200)} — too weak` : t > 0.6 ? `1:${Math.round(40 + t * 200)} — too strong` : "1:64 — per label"), missNote: "Off the label's ratio. Turn the selector back toward the marked band and commit the reading the dispenser actually gives." },
    },
    {
      id: "fill-bottle", kind: "hold", target: "fill-nozzle", seconds: 5,
      title: "Fill the spray bottle at the dispenser",
      cue: "Hold the bottle under the dispenser's metering tip until it fills to the line.",
      why: "The metering tip is what makes the dispenser's dial mean anything — holding the bottle steady under it for the whole fill is how the ratio just set on the dial actually ends up in the bottle, rather than a rushed half-fill that gets topped up from the tap later at no ratio anyone chose.",
      holdBreakNote: "You pulled the bottle away before the fill line. A bottle topped off some other way is a bottle at a dilution nobody actually set.",
    },
    {
      id: "label-bottle", kind: "select", target: "secondary-label",
      title: "Label the filled bottle",
      cue: "Apply the secondary-container label naming the chemical and today's dilution.",
      why: "Hazard Communication requires a labelled secondary container for a reason that shows up the first time somebody other than the person who filled it picks up an unmarked spray bottle — a bottle without its own label is a mystery liquid to the next custodian, the sub covering the shift, or a curious student who finds it on a cart.",
    },
    {
      id: "machine-walkaround", kind: "find", noHint: true,
      targets: ["frayed-cord", "missing-ground-pin", "worn-pad"],
      itemNames: { "frayed-cord": "the frayed spot in the power cord", "missing-ground-pin": "the broken ground pin on the plug", "worn-pad": "the floor pad worn through to the backing" },
      itemNotes: {
        "frayed-cord": "The cord's outer jacket is split near the handle, with a wire visible underneath. A cord that flexes at that spot every time the machine turns is one strand away from a shock or a short.",
        "missing-ground-pin": "The plug's ground pin has snapped off. Without it, a fault inside the motor has no path to ground except through whoever is holding the handle.",
        "worn-pad": "The pad is worn through to its backing on one side. A pad that thin no longer buffs evenly — it burns a track into the finish exactly where the backing rides the floor.",
      },
      title: "Walk round the floor machine before it's plugged in",
      cue: "Three things about this machine are not right. Find them before the cord goes into the wall.",
      why: "A walk-around before power ever reaches the machine is the only point in the whole shift the cord, the plug and the pad can be checked without anything spinning — the same habit a mechanic uses on a vehicle, applied to the one piece of equipment in the building that a custodian is alone with every night.",
    },
    {
      id: "cord-route", kind: "drag", target: "machine-cord",
      title: "Run the cord along the wall, clear of the walkway",
      cue: "Carry the cord's slack to the wall hooks so it never crosses the walking line.",
      why: "A cord routed along the baseboard and up onto its hooks cannot be stepped on, rolled over by a cart, or caught in a door — the same trip and crush hazard the hallway hazard tag calls out is designed out of the setup here rather than worked around later.",
      drag: { to: "cord-hook-spot", radius: 0.5, missNote: "Not on the hooks — the slack still crosses the walkway. Route it to the wall before the machine starts." },
    },
    {
      id: "plug-in", kind: "turn", target: "twist-lock-plug",
      title: "Seat and lock the plug into the GFCI outlet",
      cue: "Push the twist-lock plug in and turn it to seat against the GFCI outlet.",
      why: "The outlet by the closet is GFCI-protected precisely because a floor machine runs on a wet floor by design — the twist-lock keeps the plug from working loose mid-pass, and the GFCI behind it is the backstop if the machine's insulation ever fails while the floor underneath it is soaked.",
      turn: { turns: 0.4, label: "TWIST-LOCK PLUG", readout: (t) => (t < 0.8 ? "seating" : "locked") },
    },
    {
      id: "wet-floor-sign", kind: "drag", target: "wet-floor-cone",
      title: "Set the wet-floor cone before the pad turns",
      cue: "Carry the cone to the top of the hallway before starting the machine.",
      why: "A hallway with a machine already running and no cone up is a hallway where the first person to slip is whoever comes around the corner without warning — the cone goes up before the pad turns, not after someone has already found the wet patch the hard way.",
      drag: { to: "cone-spot", radius: 0.5, missNote: "Not at the top of the hallway. Anyone rounding that corner needs to see the cone before they reach the wet section." },
    },
    {
      id: "buffer-pass", kind: "track", target: "floor-machine", seconds: 6,
      title: "Hold a steady pass with the floor machine",
      cue: "Keep the machine's pad pressure in the working band as it strips the section.",
      why: "A floor machine that rides too light chatters and skates instead of stripping evenly, and one pushed down too hard burns a dark ring into the finish where the pad digs in — a steady, even pressure the whole pass is what leaves the floor level enough for the next coat of finish to lie flat.",
      track: {
        start: 0.2, green: [0.4, 0.64], rise: 0.42, fall: 0.4, drift: 0.12, label: "PAD PRESSURE",
        readout: (v) => (v < 0.4 ? "riding too light" : v > 0.64 ? "digging in" : "even pass"),
      },
      holdBreakNote: "Pressure out of band — too light skates the pad, too hard burns a ring into the finish. Bring it back to steady.",
    },
    {
      id: "eyewash-check", kind: "hold", target: "eyewash-station", seconds: 8,
      title: "Prove the eyewash station",
      cue: "Hold the eyewash valve open until both heads flow together in a steady stream.",
      why: "An eyewash station nobody has activated between shifts is a station that might deliver a first blast of rust-coloured water, or nothing at all, to someone who has just gotten concentrate in their eyes — proving both heads flow together, now, while the schedule allows for it, is what keeps that station ready for the one day it's actually needed.",
      holdBreakNote: "You let go before both heads settled into a steady stream. A short flush proves nothing about whether the line behind it is actually clear.",
    },
    {
      id: "pad-lockout-change", kind: "sequence", anyOrder: false,
      targets: ["unplug-machine", "pad-retainer-off", "new-pad-on"],
      itemNames: { "unplug-machine": "machine unplugged", "pad-retainer-off": "pad retainer released", "new-pad-on": "new pad seated" },
      title: "Unplug before changing the pad",
      cue: "Pull the plug from the outlet, release the pad retainer, then seat the new pad, in that order.",
      why: "A floor machine's drive plate is still live the instant it's plugged in even with the motor off, and 29 CFR 1910.147 exists for exactly this reason — the cord comes out of the wall before a hand ever goes near the retainer, so the one energy source that could turn the plate is already controlled before the old pad comes off.",
      outOfOrderNote: "Unplug first — the retainer and the pad come off only once the machine has no way to receive power.",
    },
    {
      id: "log-usage", kind: "select", target: "usage-log",
      title: "Log tonight's chemical and area",
      cue: "Record the chemical, the dilution and the hallway section on the custodial log.",
      why: "The log is what lets the next shift, the school nurse or the district know exactly what was used where and at what strength if anyone ever asks — a clean floor with no record behind it leaves the next question about it unanswerable.",
    },
  ],

  interrupts: [
    {
      id: "student-in-hallway",
      kind: "Student walks toward the wet section",
      after: "buffer-pass", delay: 3, seconds: 11,
      alert: "A student who stayed late for practice has come around the corner, heading straight for the wet, stripped section of hallway.",
      cue: "Move the cone to block their path before they reach the wet floor.",
      target: "wet-floor-cone",
      why: "A cone set up at the top of the hallway does nothing for someone who enters from the far end — the machine keeps running, but the cone moves to wherever the actual foot traffic is now heading, because the hazard is the wet floor under whoever's walking toward it, not a fixed spot on the ground.",
      missNote: "The student walked straight onto the wet section before the cone moved — exactly the slip a floor machine's own hallway is built to cause the moment nobody blocks the new path in.",
      wrongNote: "The cone — it needs to move to where the student is actually walking, not stay where it was first set.",
    },
    {
      id: "closet-door-ajar",
      kind: "Closet door left open",
      after: "eyewash-check", delay: 2, seconds: 11,
      alert: "The custodial closet door has swung open behind you, and a young student has stopped right at the threshold, looking at the chemical rack.",
      cue: "Shut and latch the closet door before they step inside.",
      target: "closet-door",
      why: "A closet full of concentrate is safe exactly as long as its door stays closed — the moment it swings open with nobody watching, the whole point of storing the chemicals behind a latched door is undone, and the fastest fix is closing it, not walking over to have a conversation first.",
      missNote: "The door stayed open long enough that the student had already stepped over the threshold — a closet is only as secure as the door that was supposed to be shut.",
      wrongNote: "The closet door — that's what's standing open with a student right at it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, CD_ACCENT);

    // ------------------------------------------------------------- hallway floor
    const floor = box(g, 7.2, 0.06, 5.4, 0, 0.03, 0, 0xffffff, { rough: 0.85 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 7, tile: 0xd8dcd6, grout: "#9a9d97", grout2: "#8f918b" }), { repeat: 6, px: 512 }), { rough: 0.75, metal: 0.02, color: 0xdfe3dd });

    // ------------------------------------------------------------- custodial closet alcove
    const closet = group(g, -2.9, 0, -1.6);
    const closetWallMat = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 4, block: 0x8f948d }), { repeat: 2, px: 384 }), { rough: 0.85, metal: 0.02, color: 0xffffff });
    const backWall = box(closet, 1.9, 2.3, 0.12, 0, 1.15, -0.7, 0x8f948d, { rough: 0.85 });
    backWall.material = closetWallMat;
    const sideWall = box(closet, 0.12, 2.3, 1.6, 0.9, 1.15, 0, 0x8f948d, { rough: 0.85 });
    sideWall.material = closetWallMat;
    const closetDoor = group(closet, -0.9, 0, 0.6, 0);
    box(closetDoor, 0.04, 2.05, 0.86, 0, 1.02, -0.43, 0x5b6470, { rough: 0.5, metal: 0.4 });
    const doorKnob = ball(closetDoor, 0.02, 0.03, 1.0, -0.78, 0xc8ccd0, { rough: 0.3, metal: 0.8 });
    void doorKnob;
    holoTag(closetDoor, "closet door", 0, 2.15, -0.43, { css: CD_CSS, w: 0.3 });
    reg(hits, closetDoor, "closet-door");
    const doorWedge = box(closet, 0.06, 0.03, 0.03, -0.9, 0.02, 0.13, 0xb8925a, { rough: 0.7 });
    holoTag(closet, "door wedge — propped open", -0.9, 0.2, 0.13, { css: "#f0645b", w: 0.56 });
    reg(hits, doorWedge, "unlocked-chemical-closet");

    // Wire shelving with colour-coded jugs, inside the alcove.
    const rack = group(closet, 0.1, 0, -0.55);
    for (let s = 0; s < 2; s++) {
      const shelfY = 0.5 + s * 0.55;
      box(rack, 1.1, 0.03, 0.32, 0, shelfY, 0, 0xb8bcc0, { rough: 0.4, metal: 0.6 });
    }
    const jugSpecs = [
      { id: "correct-jug", x: -0.3, y: 0.53, color: 0x3fae6a, label: "DISINFECTANT" },
      { id: "bleach-jug-shelf", x: 0, y: 0.53, color: 0xd8dde2, label: "BLEACH" },
      { id: "ammonia-jug-shelf", x: 0.3, y: 0.53, color: 0xf2c14b, label: "AMMONIA CLEANER" },
      { id: "glass-jug-shelf", x: -0.15, y: 1.08, color: 0x5fb8f0, label: "GLASS CLEANER" },
    ];
    for (const j of jugSpecs) {
      const jug = group(rack, j.x, 0, 0);
      box(jug, 0.16, 0.28, 0.12, 0, j.y + 0.14, 0, j.color, { rough: 0.4, metal: 0.1 });
      box(jug, 0.06, 0.06, 0.06, 0, j.y + 0.31, 0, 0xdfe4e8, { rough: 0.5 });
      decal(jug, 0.13, 0.1, 0, j.y + 0.18, 0.062, paperFace(j.label.split(" ")[0], j.label.split(" ").slice(1), { bg: "#f4e9d8" }));
      if (j.id === "correct-jug") reg(hits, jug, j.id);
    }
    const bypassBottle = group(closet, 0.5, 0, -0.2);
    box(bypassBottle, 0.06, 0.16, 0.06, 0, 0.6, 0, 0xf2f4f6, { rough: 0.4, opacity: 0.6, transparent: true });
    box(bypassBottle, 0.16, 0.24, 0.1, -0.2, 0.53, 0, 0xf2c14b, { rough: 0.4 });
    holoTag(bypassBottle, "filling straight from the jug?", -0.2, 0.8, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, bypassBottle, "bypass-metering-tip");

    // Mop sink with the mixed-chemical hazard bucket.
    const sink = group(closet, 0.85, 0, 0.55);
    box(sink, 0.5, 0.3, 0.4, 0, 0.15, 0, 0x9aa1a8, { rough: 0.5, metal: 0.4 });
    const mixBucket = group(sink, -0.35, 0, 0.3);
    cyl(mixBucket, 0.14, 0.15, 0.28, 0, 0.14, 0, 0xd8532a, { rough: 0.55, seg: 16 });
    const fumes = ball(mixBucket, 0.1, 0, 0.32, 0, 0xc8d840, { emissive: 0xc8d840, ei: 0.5, opacity: 0.35, transparent: true, rough: 0.8 });
    void fumes;
    holoTag(mixBucket, "bleach + ammonia mixed", 0, 0.5, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, mixBucket, "bleach-ammonia-mix");

    // ------------------------------------------------------------- dilution station on the wall
    const dilution = group(g, -1.3, 0, -2.5);
    box(dilution, 0.5, 0.7, 0.16, 0, 0.9, 0, 0xe8eef2, { rough: 0.4, metal: 0.3 });
    const dilutionScreen = instrument(dilution, 0, 1.3, 0.1, { idle: "SET RATIO", color: CD_ACCENT, w: 0.14, d: 0.02, ry: 0 });
    holoTag(dilution, "dilution dispenser", 0, 1.5, 0.1, { css: CD_CSS, w: 0.4 });
    reg(hits, dilutionScreen, "dilution-station");
    const selectorDial = cyl(dilution, 0.05, 0.05, 0.03, 0, 1.05, 0.09, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 16 });
    selectorDial.rotation.x = Math.PI / 2;
    const nozzle = group(dilution, 0, 0.7, 0.1);
    cyl(nozzle, 0.015, 0.02, 0.1, 0, -0.15, 0.02, 0x8a929a, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(nozzle, "metering tip — hold bottle here", 0, -0.02, 0.02, { css: CD_CSS, w: 0.5 });
    reg(hits, nozzle, "fill-nozzle");
    const bottle = group(g, -1.1, 0, -2.15);
    const bottleBody = cyl(bottle, 0.04, 0.045, 0.16, 0, 0.08, 0, 0xf2f4f6, { rough: 0.4, opacity: 0.5, transparent: true });
    const labelTag = decal(bottle, 0.07, 0.06, 0, 0.09, 0.046, paperFace("LABEL", ["ME"], { bg: "#f4e9d8" }));
    labelTag.visible = false;
    reg(hits, labelTag, "secondary-label");

    // SDS binder and usage log, on a shelf near the closet.
    const sdsBinder = group(g, -2.0, 0, -2.6);
    box(sdsBinder, 0.22, 0.28, 0.06, 0, 0.14, 0, 0xd8532a, { rough: 0.5 });
    decal(sdsBinder, 0.16, 0.1, 0, 0.2, 0.031, paperFace("SDS", ["BINDER"], { bg: "#f4e9d8" }));
    holoTag(sdsBinder, "SDS binder", 0, 0.34, 0, { css: CD_CSS, w: 0.32 });
    reg(hits, sdsBinder, "sds-binder");
    const usageLog = holoPanel(g, 0.5, 0.34, -2.85, 1.3, -0.3, (cx, w, h) => {
      cx.fillStyle = "rgba(3,16,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = CD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf7ee"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("CUSTODIAL USAGE LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#c8e8d0";
      cx.fillText("Chemical · dilution · area", w / 2, h * 0.65);
    }, { ry: 0.6, accent: CD_ACCENT });
    reg(hits, usageLog, "usage-log");

    // PPE hooks near the closet door.
    const ppeHooks = group(g, -2.5, 0, -0.8);
    const gloveHook = box(ppeHooks, 0.1, 0.14, 0.03, -0.3, 1.1, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(ppeHooks, "gloves", -0.3, 1.28, 0, { css: CD_CSS, w: 0.2 });
    reg(hits, gloveHook, "ppe-gloves");
    const goggleHook = ball(ppeHooks, 0.06, 0, 1.1, 0, 0xdfe4e8, { rough: 0.4, opacity: 0.5, transparent: true });
    holoTag(ppeHooks, "goggles", 0, 1.28, 0, { css: CD_CSS, w: 0.24 });
    reg(hits, goggleHook, "ppe-goggles");
    const apronHook = box(ppeHooks, 0.16, 0.24, 0.02, 0.3, 1.05, 0, 0x2b6f4a, { rough: 0.6 });
    holoTag(ppeHooks, "apron", 0.3, 1.28, 0, { css: CD_CSS, w: 0.2 });
    reg(hits, apronHook, "ppe-apron");

    // ------------------------------------------------------------- floor machine
    const machine = group(g, 0.5, 0, 0.6, 0.4);
    const machineBody = cyl(machine, 0.24, 0.26, 0.22, 0, 0.14, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 20 });
    const pad = cyl(machine, 0.26, 0.26, 0.02, 0, 0.01, 0, 0x8a6a3c, { rough: 0.7, seg: 20 });
    void pad;
    const handleGroup = group(machine, 0, 0.24, -0.1);
    for (const sx of [-1, 1]) cyl(handleGroup, 0.012, 0.012, 0.75, sx * 0.16, 0.37, -0.15, 0x2b2b30, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.x = -0.5;
    box(handleGroup, 0.4, 0.03, 0.06, 0, 0.72, -0.4, 0x2b2b30, { rough: 0.5 });
    holoTag(machine, "floor machine", 0, 0.9, -0.4, { css: CD_CSS, w: 0.32 });
    reg(hits, machineBody, "floor-machine");
    const frayedCord = cyl(machine, 0.014, 0.014, 0.08, -0.05, 0.45, -0.5, 0xc8a03a, { rough: 0.8, seg: 8 });
    holoTag(machine, "frayed cord jacket", -0.05, 0.6, -0.5, { css: "#f0645b", w: 0.4 });
    reg(hits, frayedCord, "frayed-cord");
    const wornPad = box(machine, 0.06, 0.01, 0.06, 0.18, 0.02, 0.1, 0x5b4530, { rough: 0.8 });
    holoTag(machine, "pad worn to backing", 0.18, 0.16, 0.1, { css: "#f0645b", w: 0.42 });
    reg(hits, wornPad, "worn-pad");
    const machinePlug = group(machine, 0, 0.08, -0.85);
    box(machinePlug, 0.05, 0.05, 0.03, 0, 0, 0, 0x1a1d20, { rough: 0.6 });
    const brokenPin = box(machinePlug, 0.006, 0.006, 0.012, 0, -0.01, 0.02, 0xc0c6cc, { rough: 0.5, metal: 0.6 });
    void brokenPin;
    holoTag(machinePlug, "ground pin snapped off", 0, 0.14, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, machinePlug, "missing-ground-pin");

    // Cord, plug and outlet.
    const cordMesh = hose(g, [[0.5, 0.4, 0.55], [1.4, 0.35, 0.5], [2.0, 0.3, -0.6], [2.0, 0.3, -1.6]], 0.014, 0x1a1d20, { steps: 12, rough: 0.7 });
    holoTag(g, "cord — route to hooks", 1.4, 0.6, 0.5, { css: CD_CSS, w: 0.4 });
    reg(hits, cordMesh, "machine-cord");
    const doorwayHazardCord = cyl(g, 0.014, 0.014, 1.0, 1.6, 0.03, 0.0, 0x1a1d20, { rough: 0.7, seg: 8 });
    doorwayHazardCord.rotation.z = Math.PI / 2;
    holoTag(g, "cord across the doorway", 1.6, 0.2, 0.0, { css: "#f0645b", w: 0.44 });
    reg(hits, doorwayHazardCord, "cord-across-doorway");
    const cordHookSpot = torus(g, 0.12, 0.01, 1.6, 0.06, -1.55, CD_ACCENT, { emissive: CD_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    cordHookSpot.rotation.x = Math.PI / 2;
    reg(hits, cordHookSpot, "cord-hook-spot");

    const outlet = group(g, 2.0, 0, -1.65);
    box(outlet, 0.1, 0.14, 0.03, 0, 0.5, 0, 0xdfe4e8, { rough: 0.5 });
    holoTag(outlet, "GFCI outlet", 0, 0.68, 0, { css: CD_CSS, w: 0.28 });
    const plugGroup = group(g, 1.85, 0.5, -1.55, 0.3);
    box(plugGroup, 0.05, 0.05, 0.04, 0, 0, 0, 0x1a1d20, { rough: 0.6 });
    const plugPin = cyl(plugGroup, 0.006, 0.006, 0.03, 0, 0, 0.03, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 });
    void plugPin;
    holoTag(plugGroup, "twist-lock plug", 0, 0.15, 0, { css: CD_CSS, w: 0.3 });
    reg(hits, plugGroup, "twist-lock-plug");
    const unplugMarker = box(g, 0.12, 0.12, 0.12, 2.0, 0.5, -1.63, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unplug at the outlet", 2.0, 0.7, -1.63, { css: CD_CSS, w: 0.4 });
    reg(hits, unplugMarker, "unplug-machine");
    const retainerMarker = box(machine, 0.12, 0.06, 0.12, -0.1, -0.02, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(machine, "pad retainer", 0.2, 0.14, 0.05, { css: CD_CSS, w: 0.3 });
    reg(hits, retainerMarker, "pad-retainer-off");
    const newPadMarker = box(machine, 0.12, 0.06, 0.12, 0.1, -0.02, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, newPadMarker, "new-pad-on");

    // Wet-floor cone and its stand spot at the top of the hallway.
    const wetCone = cone(g, -0.4, 1.2);
    holoTag(wetCone, "wet floor cone", 0, 0.7, 0, { css: CD_CSS, w: 0.32 });
    reg(hits, wetCone, "wet-floor-cone");
    const coneSpot = torus(g, 0.2, 0.012, -0.4, 0.06, 1.0, CD_ACCENT, { emissive: CD_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    coneSpot.rotation.x = Math.PI / 2;
    reg(hits, coneSpot, "cone-spot");

    // Hazard-striped strip on the floor along the stripped section.
    const stripedStrip = box(g, 0.4, 0.005, 2.4, -0.4, 0.063, 2.2, 0xffffff, { rough: 0.6, cast: false });
    stripedStrip.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h, { stripes: 6 }), { repeat: 2, px: 256 }), { rough: 0.7, color: 0xf2c14b });

    // ------------------------------------------------------------- eyewash station
    const eyewash = group(g, 2.3, 0, 1.7);
    cyl(eyewash, 0.03, 0.035, 0.9, 0, 0.45, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 12 });
    box(eyewash, 0.28, 0.1, 0.14, 0, 0.92, 0, 0xf2c14b, { rough: 0.5 });
    for (const sx of [-1, 1]) {
      const head = ball(eyewash, 0.035, sx * 0.08, 0.98, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4 });
      void head;
    }
    const eyewashHandle = box(eyewash, 0.16, 0.03, 0.03, 0, 0.75, 0.08, 0xd8532a, { rough: 0.5 });
    void eyewashHandle;
    const eyewashStream = ball(eyewash, 0.02, 0, 1.0, 0, 0xbfe0f8, { emissive: 0xbfe0f8, ei: 0.5, opacity: 0.5, transparent: true, rough: 0.5 });
    eyewashStream.visible = false;
    holoTag(eyewash, "eyewash station", 0, 1.15, 0, { css: CD_CSS, w: 0.34 });
    reg(hits, eyewash, "eyewash-station");

    // Crew: a supervising custodian, clear of every control.
    const supervisor = standingFigure(g, 2.6, -1.8, { ry: -0.6, cloth: 0x2b3138, trousers: 0x1e2226, gloves: true });
    holoTag(supervisor, "building engineer", 0, 1.95, 0, { css: CD_CSS, w: 0.32 });

    // A student, hidden until an interrupt calls for them.
    const student = standingFigure(g, 0, -2.6, { ry: 0, cloth: 0x3f7a9e, trousers: 0x2b3138, cap: false, atStation: true });
    student.scale.set(0.86, 0.86, 0.86);
    student.visible = false;

    let doorAjar = false;

    return {
      hits,
      footprint: 2.7,

      onStepComplete(step) {
        if (step.id === "dilution-set") repaint(dilutionScreen.userData.screen, signFace("1:64", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.55 }));
        if (step.id === "fill-bottle") bottleBody.material = mat(0x3fae6a, { rough: 0.4, opacity: 0.7, transparent: true });
        if (step.id === "label-bottle") labelTag.visible = true;
        if (step.id === "cord-route") cordHookSpot.visible = false;
        if (step.id === "plug-in") plugGroup.position.set(2.0, 0.5, -1.63);
        if (step.id === "wet-floor-sign") { wetCone.position.set(-0.4, 0, 1.0); coneSpot.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "student-in-hallway") { student.visible = true; student.position.set(-0.4, 0, 2.6); }
        if (it.id === "closet-door-ajar") { doorAjar = true; closetDoor.rotation.y = -0.9; student.visible = true; student.position.set(-2.5, 0, -0.9); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "student-in-hallway") { wetCone.position.set(-0.4, 0, 2.3); student.visible = false; }
        if (it.id === "closet-door-ajar") { doorAjar = false; closetDoor.rotation.y = 0; student.visible = false; }
      },

      animate(t, dt, session) {
        void doorAjar;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "dilution-set") {
          const ratio = Math.round(40 + gg.t * 200);
          repaint(dilutionScreen.userData.screen, signFace(`1:${ratio}`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
          selectorDial.rotation.z = gg.t * Math.PI * 1.4;
        }
        const tr = session?.track;
        if (tr && session.step?.id === "buffer-pass") {
          machine.position.y = 0;
          machine.rotation.y = 0.4 + Math.sin(t * 3) * 0.05 * (1 - Math.abs(tr.v - 0.52) * 2);
        }
        const holding = session?.step?.id === "eyewash-check" && session.holding;
        eyewashStream.visible = holding;
        supervisor.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        void dt;
      },
    };
  },
};
