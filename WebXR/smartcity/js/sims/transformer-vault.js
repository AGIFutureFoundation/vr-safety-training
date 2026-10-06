import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  cone, barrierPanel, standingFigure, lockTag, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Transformer Vault VR — Energy & Power, station six.
// A padmount distribution transformer in a below-grade vault: the switching
// order, the clearance, the load-break elbows pulled with a hot stick, the
// grounds applied, and an oil sample drawn for dissolved-gas analysis. The
// vault is a confined space the moment the lid comes off, and the elbows are
// six hundred amps of stored fault current behind an insulating boot.

const TV_ACCENT = 0x4fd1ff;

export const SIM_TRANSFORMER_VAULT = {
  id: "transformer-vault",
  index: "51",
  domain: "Utility distribution",
  trade: "Substation / underground distribution electrician",
  category: "Energy & Power",
  weather: "rain",
  certification: "IBEW — underground distribution journeyman; NFPA 70E arc-flash boundary and PPE category; OSHA 29 CFR 1910.269 for the switching, clearance and grounding; ASTM D3612 dissolved-gas sampling",
  name: "Transformer Vault",
  title: simTitle("Transformer Vault"),
  tagline: "Padmount switching under a written order: clearance, hot stick, load-break elbows, grounds applied, oil drawn for DGA",
  accent: TV_ACCENT,
  accentCss: "#4fd1ff",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "vault-clear", name: "Vault Clear", note: "A padmount switched and grounded to a written order, with the oil drawn clean and the vault left safe" },

  game: system({
    name: "Vault Authority",
    currency: "KVA",
    ranks: ["Apprentice", "Cable Splicer", "UD Journeyman", "Switching Authority", "Vault Authority Certified"],
    badges: [
      { id: "order-followed", name: "Order Followed", note: "Every switch made in the written order's sequence, first time", test: AWARD.stepClean("switch-order") },
      { id: "grounded-first", name: "Grounded First", note: "Never worked a conductor before the grounds were on", test: AWARD.safe },
      { id: "sample-clean", name: "Sample Clean", note: "Oil drawn inside the temperature and fill band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "no-callback", name: "No Callback", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "stick-steady", name: "Stick Steady", note: "Held the elbow pull for the full count", test: AWARD.unbroken },
      { id: "restored-fast", name: "Restored Fast", note: "Vault closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-elbow": "You went for the elbow bare-handed. A 600-amp load-break elbow is an energised connector behind an insulating boot — it is pulled with a hot stick, in rubber gloves, from outside the flash boundary, and never with a hand on the cable.",
    "no-ground-work": "You started work on the conductor before the grounds were applied. De-energised is not the same as grounded: a backfeed from a customer generator or an induced voltage from the parallel circuit will kill you just as dead, and the grounds are the only thing that holds the conductor at earth.",
    "vault-entry": "You climbed into the vault before it was tested and ventilated. Below grade with a transformer in it is a permit space — heavier-than-air gases pool in it, and an oil fire consumes the oxygen in seconds.",
    "wet-gloves": "Those rubber gloves have been sitting in the rain in an open bag. Class 2 gloves are tested, dated and kept in their bag dry; wet or undated gloves are not PPE, they are the illusion of it.",
  },

  lateNotes: {
    "ground-cluster": "The grounds go on after the elbows are parked and the conductor is tested dead — not before it is isolated.",
    "oil-valve": "The sample comes last, once the transformer is isolated and grounded.",
  },

  steps: [
    {
      id: "switch-order", kind: "select", target: "switching-order",
      title: "Take the written switching order",
      cue: "Read the order: which way the loop feeds, which elbows come out, and in what sequence.",
      why: "Underground loops can be fed from either end. The order says which switch opens first so the vault is fed from nowhere, and it is written down because a switching sequence held in the head is how a loop gets backfed.",
    },
    {
      id: "boundary", kind: "sequence", anyOrder: true,
      targets: ["arc-suit", "class2-gloves", "flash-boundary"],
      itemNames: { "arc-suit": "arc-rated suit", "class2-gloves": "dated class 2 gloves", "flash-boundary": "flash boundary markers" },
      title: "Arc-rated PPE and the flash boundary",
      cue: "Suit to the incident-energy category, gloves in date, and the boundary set before the lid lifts.",
      why: "The label on the transformer gives the incident energy and the boundary. The suit is chosen against that number, the gloves are in test date, and the boundary keeps everyone who is not switching outside it.",
    },
    {
      id: "vent", kind: "select", target: "vault-blower",
      title: "Open and ventilate the vault",
      cue: "Lift the lid, set the blower, and let the vault turn over before anybody leans in.",
      why: "A below-grade vault is a permit space. Whatever has collected in it — SF6, exhaust, water vapour off a hot tank — sits at the bottom where a person's head goes first.",
    },
    {
      id: "atmos", kind: "gauge", target: "gas-meter",
      title: "Test the vault atmosphere",
      cue: "Bump-tested meter, lowered on its line, and read oxygen and LEL before entry.",
      why: "The meter goes down before the person does, and it reads at the bottom, not at the lip. Twenty point nine oxygen at the top of a vault says nothing about the bottom of it.",
      gauge: { label: "O2 %", speed: 0.7, green: [0.44, 0.6], readout: (t) => `${(18 + t * 6).toFixed(1)} %`, missNote: "Outside the safe band — keep ventilating and read it again before anyone enters." },
    },
    {
      id: "open-switch", kind: "turn", target: "loop-switch",
      title: "Open the loop switch to the order",
      cue: "Open the switch the order names, in the direction the order names.",
      why: "The loop is opened at the point the order specifies so that the section containing this transformer is fed from neither direction. Opening the wrong end leaves it live from the other.",
      turn: { turns: 0.5, axis: "y", label: "LOOP SW" },
    },
    {
      id: "pull-elbows", kind: "hold", target: "hot-stick", seconds: 5,
      title: "Park the load-break elbows with the hot stick",
      cue: "Hot stick on the elbow's pulling eye, steady pull, and park it on the standoff bushing.",
      why: "A load-break elbow interrupts current as it breaks, which is violent and bright. The stick keeps the length of an insulated pole between that event and the person making it, and the elbow goes on a parking stand rather than lying in the vault.",
      holdBreakNote: "The elbow came part way and stopped — a partly seated elbow is worse than a seated one. Park it properly.",
    },
    {
      id: "test-dead", kind: "gauge", target: "phasing-tester",
      title: "Test dead on every phase",
      cue: "Live-dead-live on a known source, then all three phases at the bushings.",
      why: "The tester is proved on a known live source before and after, because a tester that has failed reads dead on everything. Three phases, every time — the one you skip is the one that is still up.",
      gauge: { label: "PHASE kV", speed: 0.8, green: [0.05, 0.2], readout: (t) => `${(t * 18).toFixed(1)} kV`, missNote: "That is not dead. Recheck the switching and do not touch the conductor." },
    },
    {
      id: "grounds", kind: "sequence",
      targets: ["ground-cluster", "phase-a-ground", "phase-b-ground", "phase-c-ground"],
      itemNames: { "ground-cluster": "ground cluster to the grid", "phase-a-ground": "phase A", "phase-b-ground": "phase B", "phase-c-ground": "phase C" },
      title: "Apply the grounds — earth end first",
      cue: "Cluster to the ground grid first, then each phase in turn with the stick.",
      why: "The earth connection is made before the phase connection, every time. Making the phase end first turns the ground set into the conductor that carries fault current through your hands to nothing.",
    },
    {
      id: "lock", kind: "select", target: "clearance-tag",
      title: "Take your clearance",
      cue: "Your lock and tag on the switch, and the clearance number written on the order.",
      why: "The clearance is held by the person doing the work, not by the control room's intention. The number on the tag matches the number on the order, and it comes off when the work does.",
    },
    {
      id: "oil-sample", kind: "gauge", target: "oil-valve",
      title: "Draw an oil sample for dissolved-gas analysis",
      cue: "Flush the valve, then fill the syringe to the mark with no headspace.",
      why: "Dissolved-gas analysis reads the transformer's health from what the oil has absorbed — acetylene means arcing, ethylene means overheating. Air in the syringe invalidates the sample, so it is drawn with no bubble.",
      gauge: { label: "FILL", speed: 0.7, green: [0.5, 0.66], readout: (t) => `${Math.round(t * 60)} mL`, missNote: "Under-filled or over-filled — the lab will reject it. Draw it again to the mark." },
    },
    {
      id: "restore", kind: "sequence",
      targets: ["phase-c-ground", "phase-b-ground", "phase-a-ground", "ground-cluster"],
      itemNames: { "phase-c-ground": "phase C", "phase-b-ground": "phase B", "phase-a-ground": "phase A", "ground-cluster": "ground cluster last" },
      title: "Remove the grounds — phases first, earth last",
      cue: "The reverse of the way they went on: phases off, then the cluster.",
      why: "Coming off, the earth connection is the last thing broken, for the same reason it was the first thing made. Anything else leaves a ground set hanging on a conductor with no path to earth.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cracked-bushing", "oil-stain"],
      itemNames: { "cracked-bushing": "cracked standoff bushing", "oil-stain": "oil stain under the tank" },
      itemNotes: {
        "cracked-bushing": "The standoff bushing you parked an elbow on is cracked through its skirt. Next switching, that parked elbow is sitting on a bushing that cannot hold it off.",
        "oil-stain": "There is fresh oil under the tank's drain flange. A padmount that is losing oil is losing its insulation and its cooling at the same time.",
      },
      title: "Walk the vault before you close it",
      cue: "Look over the tank, the bushings and the floor before the lid goes back on; click what needs a work order.",
      why: "The vault gets opened once a year if it is lucky. What you noticed today is what gets fixed before the next fault finds it.",
    },
  ],

  // Two things that happen to a crew standing over an open vault in the rain.
  interrupts: [
    {
      id: "loop-reclose",
      kind: "Remote operation",
      after: "test-dead", delay: 4, seconds: 12,
      alert: "The control room's SCADA is showing a reclose attempt on the loop. The recloser lamp on the switch cabinet has just lit.",
      cue: "Your clearance is not on the switch yet.",
      target: "clearance-tag",
      why: "Until your lock and tag are on that switch and the clearance number is written down, the loop belongs to the control room and they can re-energise it from a desk. The tag is the only thing that makes the conductor yours.",
      missNote: "The loop reclosed onto a section you had tested dead and were standing over. The grounds happened not to be on yet, which means for those seconds the only thing between you and a re-energised conductor was somebody else's attention.",
      wrongNote: "It is the clearance tag. Nothing in this vault is yours until your lock is on that switch.",
    },
    {
      id: "vault-filling",
      kind: "Water rising",
      after: "oil-sample", delay: 4, seconds: 11,
      alert: "The rain has picked up and the vault is taking water faster than it drains. It is over the sill and rising on the tank.",
      cue: "Get the pump in before it reaches the grounds.",
      target: "sump-pump",
      why: "Water in a vault is a conductor, a slip hazard and a way to lose your footing over live gear all at once. It also floats the oil off any spill straight into the storm drain, which is a reportable release.",
      missNote: "The water reached the ground clamps and the parked elbows. Everything in the vault now has to be dried, inspected and re-tested before it can be re-energised, and the oil sheen went to the drain.",
      wrongNote: "It is the sump pump. A vault filling with water while you are standing in it outranks the sample.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, TV_ACCENT);

    // ------------------------------------------------------------- the vault
    // A below-grade concrete box with the lid off, the transformer down in it,
    // and a lip the learner stands at rather than steps into.
    const vault = group(g, 0, 0, -0.4);
    const VW = 2.3, VD = 1.8, VDEPTH = 0.95;
    box(vault, VW + 0.34, 0.16, VD + 0.34, 0, -0.08, 0, 0x6b7076,
      { rough: 0.95, finish: "concrete", tile: [3, 3] });                       // apron slab
    for (const [w, d, x, z] of [[VW + 0.3, 0.16, 0, -VD / 2 - 0.07], [VW + 0.3, 0.16, 0, VD / 2 + 0.07],
                                [0.16, VD + 0.3, -VW / 2 - 0.07, 0], [0.16, VD + 0.3, VW / 2 + 0.07, 0]]) {
      box(vault, w, 0.22, d, x, 0.11, z, 0x7d838a, { rough: 0.92, finish: "concrete", tile: [3, 1] });
    }
    // Walls going down, and a floor the learner can see the water rise on.
    for (const [w, d, x, z] of [[VW, 0.12, 0, -VD / 2], [VW, 0.12, 0, VD / 2],
                                [0.12, VD, -VW / 2, 0], [0.12, VD, VW / 2, 0]]) {
      box(vault, w, VDEPTH, d, x, -VDEPTH / 2, z, 0x5a6067, { rough: 0.95, finish: "concrete", tile: [3, 2], cast: false });
    }
    box(vault, VW, 0.08, VD, 0, -VDEPTH, 0, 0x4a5057, { rough: 0.96, finish: "concrete", tile: [3, 3], cast: false });
    const water = box(vault, VW - 0.06, 0.04, VD - 0.06, 0, -VDEPTH + 0.05, 0, 0x2b4a5c,
      { rough: 0.15, metal: 0.2, opacity: 0.66, transparent: true, cast: false });
    water.visible = false;
    const lid = box(g, VW + 0.36, 0.1, VD + 0.36, 0, 0.05, 1.75, 0x596069,
      { rough: 0.9, metal: 0.25, finish: "galvanised", tile: [3, 3] });
    lid.rotation.z = 0.04;
    holoTag(g, "Vault lid — off", 0, 0.34, 1.75, { css: "#4fd1ff", w: 0.3 });

    // ------------------------------------------------- the transformer itself
    const tank = group(vault, 0, -VDEPTH + 0.08, -0.1);
    box(tank, 1.15, 0.78, 0.82, 0, 0.39, 0, 0x3f6b53, { rough: 0.55, metal: 0.35, finish: "painted", tile: [2, 2] });
    box(tank, 1.2, 0.06, 0.86, 0, 0.8, 0, 0x37604a, { rough: 0.5, metal: 0.4, finish: "painted", tile: [2, 1] });
    for (const sx of [-1, 1]) {                                                  // cooling fins
      for (let i = 0; i < 6; i++) {
        box(tank, 0.03, 0.56, 0.1, sx * 0.6, 0.4, -0.3 + i * 0.12, 0x37604a, { rough: 0.6, metal: 0.35, cast: false });
      }
    }
    holoTag(tank, "500 kVA padmount", 0, 1.06, 0, { css: "#4fd1ff", w: 0.34 });
    // Nameplate: the incident energy the PPE choice is made against.
    decal(tank, 0.3, 0.2, 0, 0.5, 0.42, (cx, w, h) => {
      cx.fillStyle = "#d8d2c2"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#3a4450"; cx.lineWidth = Math.max(2, h * 0.03); cx.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
      cx.fillStyle = "#22303c"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("500 kVA · 12.47 kV", w / 2, h * 0.24);
      cx.font = `600 ${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillStyle = "#8a2f22";
      cx.fillText("ARC FLASH 8.4 cal/cm2", w / 2, h * 0.5);
      cx.fillStyle = "#3a4450";
      cx.fillText("CATEGORY 2 PPE", w / 2, h * 0.7);
    }, { px: 256, rough: 0.8 });

    // Three bushings with load-break elbows on them, and parking standoffs.
    const bushings = {};
    const PHASES = [["a", -0.36], ["b", 0], ["c", 0.36]];
    for (const [ph, x] of PHASES) {
      const bush = cyl(tank, 0.055, 0.065, 0.2, x, 0.5, 0.45, 0x4a5058, { rough: 0.55, seg: 16 });
      bush.rotation.x = Math.PI / 2;
      const elbow = group(tank, x, 0.5, 0.62);
      cyl(elbow, 0.055, 0.055, 0.17, 0, 0, 0, 0x22262b, { rough: 0.85, seg: 14, finish: "rubber" }).rotation.x = Math.PI / 2;
      cyl(elbow, 0.05, 0.05, 0.16, 0, 0.1, 0.06, 0x22262b, { rough: 0.85, seg: 14, finish: "rubber" }).rotation.x = 0.7;
      ball(elbow, 0.022, 0, 0.19, 0.11, 0xd8b23a, { rough: 0.5, metal: 0.6 });     // pulling eye
      bushings[ph] = { elbow, home: elbow.position.clone() };
      // The standoff this elbow gets parked on; one of them is cracked.
      const standoff = cyl(tank, 0.045, 0.05, 0.18, x, 0.18, 0.5, 0x3a4048, { rough: 0.6, seg: 14 });
      standoff.rotation.x = Math.PI / 2;
      if (ph === "b") {
        box(standoff, 0.012, 0.09, 0.012, 0.035, 0, 0.02, 0x8a3f33, { rough: 0.8 });
        reg(hits, standoff, "cracked-bushing");
      }
      // Ground clamp per phase, stowed until applied.
      const gnd = group(tank, x, 0.28, 0.66);
      torus(gnd, 0.035, 0.008, 0, 0, 0, 0xd8b23a, { rough: 0.5, metal: 0.7, seg: 8, seg2: 16 });
      gnd.visible = false;
      bushings[ph].ground = gnd;
      // Only phase A's elbow is the trap: it is the one at hand height on the
      // near side, and one registered hazard is enough to make the point.
      if (ph === "a") reg(hits, elbow, "bare-elbow");
    }
    // The secondary bus, bare and reachable over the tank lid — the thing a
    // learner reaches for once the elbows are parked and before the grounds
    // are on, which is exactly the window the procedure exists to close.
    const busBar = box(tank, 0.72, 0.025, 0.05, 0, 0.86, -0.22, 0xb87333, { rough: 0.45, metal: 0.85, finish: "brushed", tile: [3, 1] });
    holoTag(tank, "Secondary bus", 0, 1.0, -0.22, { css: "#f0645b", w: 0.28 });
    reg(hits, busBar, "no-ground-work");

    // The three ground points the learner actually clicks, on the vault lip
    // where a stick reaches them.
    const groundPts = {};
    for (const [i, [ph]] of PHASES.entries()) {
      const pt = group(g, -0.75 + i * 0.36, 0, 1.05);
      cyl(pt, 0.02, 0.02, 0.3, 0, 0.15, 0, 0xd8b23a, { rough: 0.45, metal: 0.7, seg: 10 });
      ball(pt, 0.035, 0, 0.32, 0, 0xd8b23a, { rough: 0.45, metal: 0.7 });
      holoTag(pt, `Phase ${ph.toUpperCase()}`, 0, 0.46, 0, { css: "#d8b23a", w: 0.2 });
      reg(hits, pt, `phase-${ph}-ground`);
      groundPts[ph] = pt;
    }
    const cluster = group(g, 0.35, 0, 1.05);
    box(cluster, 0.14, 0.1, 0.1, 0, 0.05, 0, 0x2f7d4f, { rough: 0.6, metal: 0.5 });
    cyl(cluster, 0.014, 0.014, 0.5, 0.05, 0.25, 0, 0x2f7d4f, { rough: 0.7, seg: 8 });
    holoTag(cluster, "Ground cluster", 0, 0.42, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, cluster, "ground-cluster");

    // -------------------------------------------------------- switch cabinet
    const cab = equipmentCabinet(g, 0.7, 1.25, 0.45, -2.15, 0.35, { ry: 0.5, color: 0x5f6a74 });
    const loopSwitch = group(cab, 0.18, 0.95, 0.24);
    cyl(loopSwitch, 0.05, 0.05, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const swHandle = box(loopSwitch, 0.05, 0.19, 0.035, 0, 0.07, 0.04, 0xd8232a, { rough: 0.5 });
    holoTag(cab, "Loop switch", 0.18, 1.3, 0.24, { css: "#4fd1ff", w: 0.28 });
    reg(hits, loopSwitch, "loop-switch");
    const recloseLamp = ball(cab, 0.022, -0.18, 1.0, 0.24, 0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
    recloseLamp.visible = false;
    const clearanceTag = lockTag(cab, -0.1, 0.72, 0.26, { color: 0xd8232a });
    holoTag(cab, "Clearance tag", -0.1, 0.62, 0.26, { css: "#f0645b", w: 0.26 });
    reg(hits, clearanceTag, "clearance-tag");

    // ---------------------------------------------------------- tools + gear
    const chest = toolChest(g, 2.05, 0.5, { ry: -0.7, color: 0x4fd1ff });
    const hotStick = group(g, 1.5, 0, 1.25, -0.4);
    cyl(hotStick, 0.022, 0.022, 1.7, 0, 0.85, 0, 0xe8a33d, { rough: 0.5, seg: 12 });
    box(hotStick, 0.05, 0.1, 0.03, 0, 1.72, 0, 0x8a8f96, { rough: 0.4, metal: 0.7 });
    holoTag(hotStick, "Hot stick", 0, 1.94, 0, { css: "#f2a23b", w: 0.24 });
    reg(hits, hotStick, "hot-stick");

    const tester = instrument(chest, -0.05, 0.8, 0.02, { ry: 0.3, idle: "-- kV", color: 0x4fd1ff });
    holoTag(tester, "Phasing tester", 0, 0.17, 0, { css: "#4fd1ff", w: 0.3 });
    reg(hits, tester, "phasing-tester");
    const gasMeter = instrument(g, -1.25, 0.95, 1.25, { ry: -0.5, idle: "-- %", color: 0x59c97b });
    holoTag(gasMeter, "4-gas meter", 0, 0.17, 0, { css: "#59c97b", w: 0.28 });
    reg(hits, gasMeter, "gas-meter");

    const blower = group(g, -1.75, 0, 1.5, 0.4);
    box(blower, 0.34, 0.34, 0.3, 0, 0.17, 0, 0xf2a23b, { rough: 0.6, finish: "painted", tile: [2, 2] });
    const fanBlades = group(blower, 0, 0.17, 0.16);
    for (let i = 0; i < 4; i++) {
      const b = box(fanBlades, 0.02, 0.13, 0.01, 0, 0, 0, 0x2b3138, { rough: 0.6, cast: false });
      b.rotation.z = (i / 4) * Math.PI * 2;
    }
    const duct = cyl(blower, 0.09, 0.09, 1.1, 0.3, 0.14, 0, 0xd9dde2, { rough: 0.7, seg: 12, cast: false });
    duct.rotation.z = Math.PI / 2;
    holoTag(blower, "Vault blower", 0, 0.5, 0, { css: "#f2a23b", w: 0.28 });
    reg(hits, blower, "vault-blower");

    const pump = group(g, 1.95, 0, 1.6, -0.3);
    cyl(pump, 0.1, 0.1, 0.24, 0, 0.12, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4, seg: 14 });
    cyl(pump, 0.03, 0.03, 0.9, 0.1, 0.4, 0, 0x8b929a, { rough: 0.7, seg: 10, cast: false }).rotation.z = -0.4;
    holoTag(pump, "Sump pump", 0, 0.52, 0, { css: "#4fd1ff", w: 0.26 });
    reg(hits, pump, "sump-pump");

    // PPE stand: the suit, the gloves in their dated bag, and the boundary cones.
    const ppe = group(g, -1.1, 0, 1.85, 0.3);
    box(ppe, 0.06, 1.5, 0.06, 0, 0.75, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const suit = box(ppe, 0.42, 0.62, 0.14, 0, 1.05, 0.08, 0x2f6f8c, { rough: 0.85, finish: "painted", tile: [1, 1] });
    holoTag(ppe, "Arc-rated suit", 0, 1.5, 0.08, { css: "#2f6f8c", w: 0.3 });
    reg(hits, suit, "arc-suit");
    const gloveBag = box(ppe, 0.2, 0.16, 0.08, 0.28, 0.72, 0.04, 0xf2c14b, { rough: 0.8 });
    holoTag(ppe, "Class 2 gloves", 0.28, 0.92, 0.04, { css: "#f2c14b", w: 0.28 });
    reg(hits, gloveBag, "class2-gloves");
    const wetGloves = box(ppe, 0.18, 0.14, 0.07, -0.3, 0.5, 0.04, 0x8a7f5a, { rough: 0.95 });
    holoTag(ppe, "Undated, wet", -0.3, 0.68, 0.04, { css: "#f0645b", w: 0.26 });
    reg(hits, wetGloves, "wet-gloves");

    const boundary = group(g, 1.05, 0, 2.05);
    for (let i = 0; i < 3; i++) cone(boundary, -0.5 + i * 0.5, 0, { color: 0xf2a23b });
    holoTag(boundary, "Flash boundary", 0, 0.62, 0, { css: "#f2a23b", w: 0.3 });
    reg(hits, boundary, "flash-boundary");

    // Oil sampling valve on the tank, reachable from the lip.
    const oilValve = valveWheel(tank, 0.5, 0.14, 0.44, { r: 0.05, color: 0xd8b23a, body: 0x37604a });
    holoTag(tank, "Oil sample valve", 0.5, 0.3, 0.44, { css: "#d8b23a", w: 0.3 });
    reg(hits, oilValve, "oil-valve");
    const oilStain = box(vault, 0.36, 0.006, 0.3, 0.38, -VDEPTH + 0.05, 0.28, 0x2a2318, { rough: 0.35, opacity: 0.8, transparent: true, cast: false });
    reg(hits, oilStain, "oil-stain");

    // Entry point the learner is not supposed to use before the tests pass.
    const entry = box(g, 0.5, 0.05, 0.4, 0, 0.14, -1.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Climb in?", 0, 0.5, -1.45, { css: "#f0645b", w: 0.24 });
    reg(hits, entry, "vault-entry");

    // Paperwork.
    const order = holoPanel(g, 0.6, 0.42, -2.2, 1.55, 1.45, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SWITCHING ORDER · SO-4471", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("VAULT 12 — PADMOUNT TX-500", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["1. Open loop switch S-12 (east feed)", "2. Park elbows A, B, C on standoffs",
       "3. Test dead — live/dead/live", "4. Grounds: cluster first, then A B C",
       "5. Clearance CL-8830 to crew lead", "6. DGA sample, 60 mL, no headspace"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.45 });
    reg(hits, order, "switching-order");

    // A second hand on site, back from the boundary where they belong.
    standingFigure(g, -2.5, 2.1, { ry: 0.9, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });

    let fanSpin = 0, vented = false, grounded = 0, waterLevel = 0;
    const arc = particles(g, 26, 0xbfe9ff, { size: 0.016, life: 0.3 });
    let arcTimer = 0;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "vent") { vented = true; }
        if (step.id === "open-switch") swHandle.rotation.z = -1.1;
        if (step.id === "pull-elbows") {
          // The elbows come off the bushings and onto the parking standoffs.
          for (const [ph] of PHASES) {
            const b = bushings[ph];
            b.elbow.position.set(b.home.x, 0.18, 0.5);
            b.elbow.rotation.x = -0.5;
          }
          arcTimer = 0.5;
        }
        if (step.id === "grounds") {
          grounded = 3;
          for (const [ph] of PHASES) bushings[ph].ground.visible = true;
          for (const [ph] of PHASES) {
            groundPts[ph].children[1].material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.45, metal: 0.7 });
          }
        }
        if (step.id === "lock") clearanceTag.rotation.z = 0.5;
        if (step.id === "restore") {
          grounded = 0;
          for (const [ph] of PHASES) bushings[ph].ground.visible = false;
        }
        if (step.id === "walk") { oilStain.visible = false; }
      },

      // The recloser lamp really lights, and the vault really takes water.
      onInterrupt(it) {
        if (it.id === "loop-reclose") recloseLamp.visible = true;
        if (it.id === "vault-filling") { water.visible = true; waterLevel = 1; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "loop-reclose") recloseLamp.visible = false;
        if (it.id === "vault-filling") { waterLevel = -1; }
      },

      onHazard(hitId) {
        if (hitId === "bare-elbow") arcTimer = 0.45;
        if (hitId === "vault-entry") arcTimer = 0.2;
      },

      animate(t, dt, session) {
        if (vented) { fanSpin += dt * 7; fanBlades.rotation.z = fanSpin; }
        if (arcTimer > 0) {
          arcTimer -= dt;
          arc.visible = true;
          arc.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.06, 1.2, -2.4);
        } else if (arc.visible) arc.visible = false;
        if (waterLevel > 0 && water.scale.y < 4.5) water.scale.y += dt * 1.6;
        if (waterLevel < 0) {
          water.scale.y = Math.max(1, water.scale.y - dt * 3.2);
          if (water.scale.y <= 1.01) { water.visible = false; waterLevel = 0; water.scale.y = 1; }
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "atmos") {
          repaint(gasMeter.userData.screen, signFace(`${(18 + gg.t * 6).toFixed(1)} %`, {
            bg: "#0d1c14", accent: gg.t > 0.42 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "test-dead") {
          repaint(tester.userData.screen, signFace(`${(gg.t * 18).toFixed(1)} kV`, {
            bg: "#0d1c24", accent: gg.t < 0.22 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        void grounded;
      },
    };
  },
};
