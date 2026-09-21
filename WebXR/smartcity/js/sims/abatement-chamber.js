import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Abatement Chamber VR — its own gamified system: Containment Command.
// Asbestos / lead abatement containment and decon. Fibres you cannot see are the
// entire hazard here, which is why the procedure never trusts a look — only a
// manometer reading, a wet surface, and a decon sequence taken in order.

export const SIM_ABATEMENT_CHAMBER = {
  id: "abatement-chamber",
  index: "17",
  domain: "Environmental",
  trade: "Asbestos / lead abatement worker",
  category: "Water & Environmental",
  indoor: "plant",
  certification: "LIUNA abatement workers; OSHA 29 CFR 1926.1101, the asbestos standard for construction, and 29 CFR 1910.134 respiratory protection; EPA AHERA worker accreditation and the EPA asbestos NESHAP for the waste; the project design and clearance criteria in the containment plan",
  name: "Abatement Chamber",
  title: simTitle("Abatement Chamber"),
  tagline: "Containment integrity, wet-method removal and the three-stage decon airlock",
  accent: 0xc9e265,
  accentCss: "#c9e265",
  parSeconds: 245,
  badge: { id: "containment-sealed", name: "Containment Sealed", note: "Full containment and decon with no shortcut on either" },

  game: system({
    name: "Containment Command",
    currency: "ABATE",
    ranks: ["Bag Handler", "Removal Tech", "Containment Lead", "Decon Supervisor", "Containment Certified"],
    badges: [
      { id: "negative-hold", name: "Negative Hold", note: "Never enter before pressure is confirmed", test: AWARD.safe },
      { id: "wet-clean", name: "Wet and Clean", note: "Hold every pressure reading near band centre", test: AWARD.precise(0.72) },
      { id: "decon-disciplined", name: "Decon Disciplined", note: "Clear the airlock stages with no correction", test: AWARD.stepClean("decon-sequence") },
    ],
    challenges: [
      { id: "shift-clearance", name: "Shift Clearance", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-air", name: "Clean Air", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "chamber-streak", name: "Chamber Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "containment-flap": "You pushed through the containment flap without confirming negative pressure on the manometer. If the enclosure isn't actually under negative pressure, opening it pushes fibres out into the building instead of holding them in.",
    "dry-removal-tool": "That is a dry scraper. Working the material dry aerosolises fibres immediately — the entire point of the wet method is that a wetted material does not go airborne when it is disturbed.",
    "early-respirator-removal": "You reached to pull the respirator off before finishing the decon shower. Contamination sits on the outside of that mask and on your skin and hair — it comes off only once you are standing in the clean room.",
    "unlabeled-bag": "That waste bag is neither double-bagged nor labeled, and it is sitting in the clean side of the airlock. An unlabeled asbestos or lead bag in a clean area is exactly how contamination leaves the site undetected.",
    "break-mug": "That is somebody's coffee, inside the regulated area. Eating, drinking and smoking in a regulated area are prohibited outright by the asbestos standard, for the obvious reason: the respirator has to come off to do any of them, and fibre that settled on the rim of that mug goes straight down somebody's throat.",
  },

  lateNotes: {
    "respirator": "The respirator does not come off until you are standing in the clean room, on the far side of the shower — not before.",
    "waste-bag": "Waste only gets bagged and labeled once the wet removal itself is finished, not while material is still coming down.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "work-plan",
      title: "Read the containment work plan",
      cue: "Confirm the work area, material type and containment class on the plan.",
      why: "The plan is what sets the containment class, the respirator, the waste route and the clearance criteria for this specific material, and friable pipe insulation is a different job from intact lead paint on a handrail even though the poly looks the same. It also states the negative pressure this enclosure has to hold, which is the number you will be committing to on the manometer in a few minutes.",
    },
    {
      id: "barrier-check", kind: "find", noHint: true,
      targets: ["poly-sheeting", "floor-tear", "open-vent"],
      itemNames: {
        "poly-sheeting": "the lifted seam on the barrier",
        "floor-tear": "the tear at the floor-to-wall joint",
        "open-vent": "the supply diffuser nobody sealed",
      },
      itemNotes: {
        "poly-sheeting": "A seam that has lifted off its tape. The poly is only a containment where it is sealed — everywhere else it is a sheet of plastic with air moving past it.",
        "floor-tear": "A tear where the floor sheet meets the wall sheet. That joint takes every boot in the enclosure and it is the first place a containment opens up, which is why it is doubled and taped rather than laid.",
        "open-vent": "A supply diffuser still open to the building. Critical barriers cover the vents as well as the doors — leave one and the negative-air unit spends the shift pulling conditioned air out of the rest of the building instead of holding the enclosure down.",
      },
      decoyNotes: {
        "clean-barrier": "That run of poly is sound: taped seam, doubled at the floor, no light through it. Leave it.",
      },
      title: "Walk the critical barriers",
      cue: "Three things about this containment are not sealed. Find them by looking.",
      why: "The poly is the only thing between this work and the rest of an occupied building, and it fails at seams, at the floor line and at the openings somebody forgot rather than in the middle of a sheet. You find those with your eyes and a hand on the plastic before the machine runs, because after that the enclosure is under pressure and every gap is a measured leak you are pulling building air through.",
    },
    {
      id: "negative-air", kind: "select", target: "negative-air-machine",
      title: "Start the negative-air machine",
      cue: "Run the HEPA-filtered negative-air unit and check the exhaust duct is discharging outside.",
      why: "The machine is what actually makes the enclosure negative, and it runs continuously for the whole job — through breaks, through lunch, through the night if the job runs over — not only while somebody happens to be inside. The filter is HEPA because anything coarser simply relocates the fibre, and the duct discharges outdoors because an exhaust dumped into a corridor has abated nothing.",
    },
    {
      id: "pressure-check", kind: "gauge", target: "manometer",
      title: "Confirm negative pressure on the manometer",
      cue: "Read the differential pressure and commit once it holds in the required range.",
      why: "Negative pressure is what makes air fall into the enclosure every time the flap opens instead of blowing out of it, and it is a number on a manometer rather than an impression from the machine sounding busy. A unit can run flat out against a containment so leaky it never develops any pressure at all, and the gauge is the only thing that tells those two situations apart.",
      gauge: {
        label: "CONTAINMENT — DIFFERENTIAL PRESSURE", speed: 0.6, green: [0.22, 0.5],
        readout: (t) => `-${(t * 0.09).toFixed(3)}" WC`,
        missNote: "Not enough negative pressure. Check the machine and the seals before anyone enters.",
      },
    },
    {
      id: "don-sequence", kind: "sequence",
      targets: ["coveralls", "respirator", "glove-tape"],
      itemNames: { coveralls: "coveralls", respirator: "respirator", "glove-tape": "taped gloves and boot covers" },
      title: "Don PPE in the correct order",
      cue: "Coveralls first, then the respirator, then tape the gloves and boot covers.",
      why: "The respirator seals against skin, so it goes on after the suit but before the hood — pull the hood up first and you have a facepiece sealing against a sheet of polypropylene, which is not a seal at all. The tape goes on last because it is what stops a sleeve riding up when you reach overhead, and reaching overhead is the whole of this job.",
      outOfOrderNote: "Wrong order — coveralls go on first, then the respirator seats against the hood, then gloves and boots get taped last.",
    },
    {
      id: "fit-check", kind: "hold", target: "respirator", seconds: 6,
      title: "Hold the user seal check",
      cue: "Block the cartridges, inhale, and hold the facepiece collapsed for the full check.",
      why: "A negative-pressure seal check is held, not flicked at: you block the inlets, breathe in, and the facepiece has to stay drawn against your face for the whole count without creeping back out. That is the difference between a respirator and a piece of rubber near your face, and OSHA's respiratory protection standard asks for it every single time the mask goes on — not once a year at the fit test.",
      holdBreakNote: "You released before the check was over. A facepiece that leaks slowly passes a quick squeeze and fails a shift — hold it the full count.",
    },
    {
      id: "wet-method", kind: "track", target: "sprayer", seconds: 7,
      title: "Wet the material with amended water",
      cue: "Hold the delivery low and steady so the amended water soaks in instead of blasting the surface.",
      why: "Amended water carries a surfactant so it wets through the material rather than beading on it, and that only happens if it is put on gently. Hit friable insulation with a hard jet and you aerosolise exactly the fibre you were trying to bind, inside a containment, at head height. Too light and you have only damped the face, so the first thing your scraper reaches is still dry.",
      track: {
        start: 0.12, green: [0.34, 0.54], rise: 0.5, fall: 0.44, drift: 0.11, label: "SPRAY DELIVERY",
        readout: (v) => (v < 0.34 ? "surface only — dry underneath" : v > 0.54 ? "too hard — blowing fibre off" : "soaking in"),
      },
      holdBreakNote: "Delivery out of band — a hard jet drives fibre into the air and a light mist only damps the face. Bring it back and hold it there.",
    },
    {
      id: "removal", kind: "select", target: "acm-material",
      title: "Remove the wetted material",
      cue: "Take the material down while it is still wet, working in small sections.",
      why: "A section small enough to stay wet through the whole of its removal is the only size worth starting, because insulation dries from the moment you open it and a big run outruns the sprayer. Material that dries in your hands is dry removal, whatever the plan says, and the enclosure is now holding airborne fibre instead of the damp lumps it was designed around.",
    },
    {
      id: "bag-label", kind: "drag", target: "waste-bag",
      title: "Double-bag the waste and take it to the load-out",
      cue: "Seal the material in two labelled bags and carry it to the waste load-out.",
      why: "Two bags, because the outer one is what stays clean enough to leave the enclosure, and a label because everybody downstream — the hauler, the scale house, the landfill operator, an inspector years later — has a right to know what they are handling. It leaves through the load-out rather than the decon airlock so that waste and people never use the same opening.",
      drag: { to: "bag-out-airlock", radius: 0.5, missNote: "Not at the load-out. A bag set down anywhere else in the enclosure is a bag somebody carries out through the shower, which is what the load-out exists to prevent." },
    },
    {
      id: "decon-sequence", kind: "sequence",
      targets: ["dirty-room", "shower-stage", "clean-room"],
      itemNames: { "dirty-room": "dirty room", "shower-stage": "shower", "clean-room": "clean room" },
      title: "Exit through the three-stage decon",
      cue: "Dirty room, then the shower, then the clean room — never out of order.",
      why: "Each stage takes off one layer and there is no other way out of this enclosure. Suit and boot covers come off in the dirty room, the shower takes what is on your skin and hair with the respirator still on your face, and only the clean room holds your own clothes. Go through it backwards and you have carried the whole shift's contamination into the one room that was clean.",
      outOfOrderNote: "Wrong order — the airlock only works dirty room, then shower, then clean room. Reversing it defeats the entire decon.",
    },
    {
      id: "respirator-off", kind: "select", target: "respirator",
      title: "Remove the respirator in the clean room",
      cue: "Take off the respirator only once you are standing in the clean room.",
      why: "The outside of that facepiece is the dirtiest surface you own, and the shower ran with it on for exactly that reason. This is the first point on the way out where the air around your face has been through the decon too, so it is the first point where taking the mask off does not simply undo the last ten minutes.",
    },
    {
      id: "close", kind: "select", target: "work-plan",
      title: "Close out the containment log",
      cue: "Record the pressure log, the waste manifest and the clearance sampling, then sign the plan closed.",
      why: "The log is the evidence that this enclosure actually held the pressure the plan called for, for the hours it was occupied, and that every bag is accounted for on the manifest. It is also where the clearance sampling goes, because the containment does not come down on somebody's opinion that the area looks clean — it comes down on a result, and the inspector reads that first.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.05, 0xc9e265);

    // -------------------------------------------------------------- containment area
    const cont = group(g, -0.9, 0, -0.6);
    const polyMat = { rough: 0.25, metal: 0, opacity: 0.35 };
    for (const [px, pz, pw, pd, pry] of [[0, -0.75, 1.6, 0.02, 0], [-0.8, 0, 0.02, 1.5, 0], [0.8, 0, 0.02, 1.5, 0]]) {
      box(cont, pw, 1.9, pd, px, 0.95, pz, 0xe7edb8, { ...polyMat, cast: false });
    }
    box(cont, 1.6, 0.02, 1.5, 0, 1.9, 0, 0xe7edb8, { ...polyMat, cast: false });
    const seam = box(cont, 1.58, 0.03, 0.03, 0, 1.0, -0.74, 0xc9e265, { rough: 0.5, cast: false });
    holoTag(cont, "Critical barrier", 0, 1.98, -0.5, { css: "#c9e265", w: 0.36 });
    reg(hits, seam, "poly-sheeting");

    // Two more places this containment is open, and one run that is sound.
    const floorTear = group(cont, -0.62, 0, -0.55);
    box(floorTear, 0.28, 0.05, 0.03, 0, 0.03, 0, 0xb8402f, { rough: 0.7, cast: false });
    box(floorTear, 0.1, 0.12, 0.02, 0.08, 0.08, 0, 0xe7edb8, { rough: 0.3, opacity: 0.5, cast: false });
    holoTag(floorTear, "Floor joint", 0, 0.28, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, floorTear, "floor-tear");

    const openVent = group(cont, 0.55, 0, -0.72);
    box(openVent, 0.3, 0.22, 0.03, 0, 1.55, 0, 0x3a4048, { rough: 0.7, cast: false });
    for (let v = 0; v < 4; v++) {
      box(openVent, 0.26, 0.018, 0.02, 0, 1.47 + v * 0.05, 0.02, 0x8b929a, { rough: 0.5, metal: 0.4, cast: false });
    }
    holoTag(openVent, "Supply diffuser", 0, 1.78, 0.04, { css: "#f0645b", w: 0.34 });
    reg(hits, openVent, "open-vent");

    const cleanBarrier = group(cont, -0.78, 0, 0.1);
    box(cleanBarrier, 0.03, 0.4, 0.5, 0, 1.1, 0, 0xc9e265, { rough: 0.5, opacity: 0.5, cast: false });
    reg(hits, cleanBarrier, "clean-barrier");

    // Flap entrance into the containment — the hazard if pushed through blind.
    const flap = group(cont, 0, 0, 0.72, Math.PI);
    box(flap, 0.7, 1.7, 0.015, 0, 0.9, 0, 0xdfe6a8, { ...polyMat, cast: false });
    holoTag(flap, "Entry flap", 0, 1.85, 0.02, { css: "#f0645b", w: 0.3 });
    reg(hits, flap, "containment-flap");

    // Negative-air machine with exhaust duct.
    const naMachine = group(cont, -0.55, 0, -0.4, 0.4);
    slab(naMachine, 0.36, 0.4, 0.3, 0, 0.22, 0, 0x53585e, { radius: 0.03, rough: 0.5, metal: 0.4 });
    const fanGrille = cyl(naMachine, 0.13, 0.13, 0.03, 0, 0.24, 0.16, 0x22272c, { rough: 0.6, seg: 18 });
    fanGrille.rotation.x = Math.PI / 2;
    const fanBlades = group(naMachine, 0, 0.24, 0.145);
    for (let i = 0; i < 5; i++) {
      const b = box(fanBlades, 0.1, 0.022, 0.008, 0, 0, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, cast: false });
      b.rotation.z = (i * Math.PI * 2) / 5;
    }
    const lamp = ball(naMachine, 0.012, 0.14, 0.4, 0.14, 0xd8232a, { emissive: 0xd8232a, ei: 1.5 });
    hose(cont, [[-0.55, 0.4, -0.24], [-0.7, 0.5, 0.1], [-0.78, 0.5, 0.6]], 0.05, 0xdfe4e8, { steps: 16, rough: 0.7 });
    holoTag(naMachine, "Negative-air unit", 0, 0.5, 0.2, { css: "#c9e265", w: 0.34 });
    reg(hits, naMachine, "negative-air-machine");

    const manometer = instrument(cont, -0.1, 0.95, -0.73, { ry: 0, idle: "0.000\"", color: 0xc9e265 });
    hose(cont, [[-0.1, 0.9, -0.72], [-0.3, 0.85, -0.5], [-0.55, 0.6, -0.4]], 0.006, 0xdfe4e8, { steps: 10, rough: 0.7 });
    holoTag(manometer, "Manometer", 0, 0.16, 0, { css: "#c9e265", w: 0.28 });
    reg(hits, manometer, "manometer");

    // Dry scraper — the trap on a shelf beside the wet-method sprayer.
    const dryTool = group(cont, 0.5, 0, -0.4, -0.2);
    box(dryTool, 0.02, 0.02, 0.3, 0, 0.5, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    box(dryTool, 0.08, 0.04, 0.01, 0, 0.5, 0.15, 0xc0c6cc, { rough: 0.35, metal: 0.7 });
    holoTag(dryTool, "Dry scraper", 0, 0.6, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, dryTool, "dry-removal-tool");

    const sprayer = group(cont, 0.5, 0, -0.05, -0.2);
    cyl(sprayer, 0.08, 0.09, 0.32, 0, 0.2, 0, 0x59c97b, { rough: 0.5, metal: 0.2, seg: 16 });
    cyl(sprayer, 0.012, 0.012, 0.2, 0.06, 0.42, 0, 0x22272c, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2.4;
    holoTag(sprayer, "Amended water", 0, 0.5, 0, { css: "#c9e265", w: 0.34 });
    reg(hits, sprayer, "sprayer");

    // Wrapped pipe material overhead — the ACM to remove.
    const acm = group(cont, 0.1, 0, 0.35);
    const pipe = cyl(acm, 0.045, 0.045, 1.1, 0, 1.6, 0, 0xd8cba0, { rough: 0.8, seg: 14 });
    pipe.rotation.z = Math.PI / 2;
    holoTag(acm, "Pipe insulation — ACM", 0, 1.78, 0, { css: "#c9e265", w: 0.4 });
    reg(hits, acm, "acm-material");

    const wasteStation = group(cont, -0.4, 0, 0.5, 0.3);
    box(wasteStation, 0.3, 0.02, 0.24, 0, 0.02, 0, 0x2b3138, { rough: 0.7 });
    // The bag is its own group so it can be picked up and carried to the
    // load-out rather than being part of the table it was filled on.
    const bag = group(wasteStation, 0, 0, 0);
    const bagInner = box(bag, 0.24, 0.2, 0.2, 0, 0.12, 0, 0xd8232a, { rough: 0.55 });
    const bagOuter = box(bag, 0.28, 0.24, 0.24, 0, 0.14, 0, 0xf2c14b, { rough: 0.55, opacity: 0.001 });
    bagOuter.material.transparent = true;
    decal(bag, 0.2, 0.06, 0, 0.24, 0.101, signFace("ACM WASTE", { bg: "#7d1512", accent: "#f2ae14", scale: 0.5 }), { px: 128 });
    holoTag(bag, "Waste bagging", 0, 0.34, 0, { css: "#c9e265", w: 0.32 });
    reg(hits, bag, "waste-bag");

    // Waste load-out on the far wall of the enclosure — bags leave here, people
    // leave through the shower, and the two never share an opening.
    const loadOut = group(cont, 0.62, 0, 0.66, -0.3);
    box(loadOut, 0.5, 0.06, 0.4, 0, 0.03, 0, 0x3a4048, { rough: 0.8 });
    box(loadOut, 0.5, 0.7, 0.04, 0, 0.38, -0.2, 0xdfe6a8, { rough: 0.3, opacity: 0.4, cast: false });
    decal(loadOut, 0.32, 0.07, 0, 0.72, -0.18, signFace("WASTE LOAD-OUT", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.42 }), { px: 160 });
    holoTag(loadOut, "Waste load-out", 0, 0.9, -0.1, { css: "#c9e265", w: 0.34 });
    reg(hits, loadOut, "bag-out-airlock");

    // Somebody's coffee on the bagging table, inside the regulated area.
    const mug = group(wasteStation, 0.2, 0, -0.08);
    cyl(mug, 0.035, 0.032, 0.09, 0, 0.065, 0, 0xdfe4e8, { rough: 0.35, seg: 14 });
    torus(mug, 0.024, 0.006, 0.05, 0.065, 0, 0xdfe4e8, { rough: 0.35, seg: 6, seg2: 16 }).rotation.y = Math.PI / 2;
    holoTag(mug, "Coffee — in the regulated area", 0, 0.24, 0, { css: "#f0645b", w: 0.52 });
    reg(hits, mug, "break-mug");

    // ------------------------------------------------------------------- PPE station
    const ppe = group(g, 1.4, 0, -1.4, -0.6);
    slab(ppe, 0.5, 1.6, 0.1, 0, 0.8, 0, 0x53585e, { radius: 0.02, rough: 0.5, metal: 0.4 });
    const coverallsHook = group(ppe, -0.14, 0.9, 0.07);
    box(coverallsHook, 0.16, 0.5, 0.05, 0, -0.1, 0, 0xdfe6a8, { rough: 0.85 });
    holoTag(coverallsHook, "Coveralls", 0, 0.22, 0, { css: "#c9e265", w: 0.28 });
    reg(hits, coverallsHook, "coveralls");

    const respMask = group(ppe, 0.14, 0.95, 0.08);
    box(respMask, 0.12, 0.08, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    torus(respMask, 0.045, 0.012, 0, 0, 0.03, 0x3c4650, { rough: 0.4 });
    holoTag(respMask, "Respirator", 0, 0.14, 0, { css: "#c9e265", w: 0.28 });
    reg(hits, respMask, "respirator");

    const gloveTape = group(ppe, 0, 1.35, 0.07);
    box(gloveTape, 0.1, 0.05, 0.1, -0.08, 0, 0, 0xf2c14b, { rough: 0.6 });
    cyl(gloveTape, 0.04, 0.04, 0.03, 0.08, 0, 0, 0xdfe4e8, { rough: 0.6, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(gloveTape, "Gloves + tape", 0, 0.14, 0, { css: "#c9e265", w: 0.3 });
    reg(hits, gloveTape, "glove-tape");

    // --------------------------------------------------------------------- decon line
    const decon = group(g, 1.1, 0, 1.0, -0.5);
    const dirty = group(decon, -0.7, 0, 0);
    box(dirty, 0.7, 1.9, 0.7, 0, 0.95, 0, 0x3a4048, { rough: 0.9, cast: false });
    decal(dirty, 0.3, 0.06, 0, 1.55, 0.36, signFace("DIRTY ROOM", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.45 }));
    holoTag(dirty, "1 · Dirty room", 0, 1.75, 0.36, { css: "#c9e265", w: 0.34 });
    reg(hits, dirty, "dirty-room");

    // Bin near the dirty room — the temptation to strip the respirator early.
    const binTrap = group(dirty, 0.28, 0, 0.3);
    cyl(binTrap, 0.1, 0.09, 0.2, 0, 0.1, 0, 0x2b3138, { rough: 0.6, seg: 14 });
    holoTag(binTrap, "Bin", 0, 0.24, 0, { css: "#f0645b", w: 0.2 });
    reg(hits, binTrap, "early-respirator-removal");

    const shower = group(decon, 0, 0, 0);
    box(shower, 0.7, 1.9, 0.7, 0, 0.95, 0, 0x2f6f8c, { rough: 0.7, cast: false });
    const showerHead = cyl(shower, 0.03, 0.03, 0.1, 0, 1.7, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const showerSpray = particles(shower, 30, 0xbfe4ff, { size: 0.014, life: 0.4, additive: false, opacity: 0.5 });
    decal(shower, 0.3, 0.06, 0, 1.55, 0.36, signFace("SHOWER", { bg: "#0d2430", accent: "#4fa3ff", scale: 0.45 }));
    holoTag(shower, "2 · Shower", 0, 1.75, 0.36, { css: "#c9e265", w: 0.3 });
    reg(hits, shower, "shower-stage");

    const clean = group(decon, 0.7, 0, 0);
    box(clean, 0.7, 1.9, 0.7, 0, 0.95, 0, 0xdfe6d8, { rough: 0.6, cast: false });
    decal(clean, 0.3, 0.06, 0, 1.55, 0.36, signFace("CLEAN ROOM", { bg: "#0f1b14", accent: "#59c97b", scale: 0.42 }));
    holoTag(clean, "3 · Clean room", 0, 1.75, 0.36, { css: "#c9e265", w: 0.34 });
    reg(hits, clean, "clean-room");

    // A loose unlabeled bag left in the clean room — the trap.
    const strayBag = group(clean, -0.2, 0, 0.2);
    box(strayBag, 0.18, 0.14, 0.14, 0, 0.07, 0, 0x7a7a7a, { rough: 0.7 });
    holoTag(strayBag, "Unlabeled bag", 0, 0.2, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, strayBag, "unlabeled-bag");

    // ------------------------------------------------------------------- paperwork
    const chest = toolChest(g, -1.7, 1.3, { ry: 0.7, color: 0xc9e265 });
    const plan = holoPanel(g, 0.56, 0.4, -1.8, 1.5, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,14,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9e265"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#c8d19a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CONTAINMENT PLAN AB-19", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f4f8e6";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("PIPE INSULATION — FRIABLE ACM", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#c8d19a";
      ["Pressure: -0.02\" WC minimum", "Method: wet removal only",
       "Decon: dirty, shower, clean — in order", "Waste: double bag + label",
       "Respirator off in clean room only"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0xc9e265 });
    reg(hits, plan, "work-plan");

    let naRunning = false;
    let wetted = false;

    return {
      hits,
      footprint: 2.05,

      onStepComplete(step) {
        if (step.id === "negative-air") { naRunning = true; lamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
        if (step.id === "pressure-check") repaint(manometer.userData.screen, signFace("-0.03\"", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "wet-method") { wetted = true; pipe.material = mat(0xb0a67c, { rough: 0.5 }); }
        if (step.id === "removal") acm.visible = false;
        if (step.id === "barrier-check") {
          floorTear.children[0].material = mat(0xc9e265, { rough: 0.5 });
          openVent.children[0].material = mat(0xe7edb8, { rough: 0.3 });
        }
        if (step.id === "bag-label") { bagOuter.material.transparent = false; bagOuter.material.opacity = 1; }
        if (step.id === "respirator-off") respMask.visible = false;
      },

      animate(t, dt, session) {
        if (naRunning) fanBlades.rotation.z += dt * 14;
        showerSpray.visible = session?.step?.id === "decon-sequence";
        if (showerSpray.visible) showerSpray.userData.step(dt, new THREE.Vector3(1.1 + 0, 2.3, 1.0), 0.05, 0.5, -1.4);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "pressure-check") {
          const v = (gg.t * 0.09).toFixed(3);
          repaint(manometer.userData.screen, signFace(`-${v}"`, {
            bg: "#0d1c24", accent: gg.t > 0.22 && gg.t < 0.5 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
