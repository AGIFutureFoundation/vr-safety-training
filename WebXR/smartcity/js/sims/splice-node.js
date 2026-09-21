import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, rackFrame, rackUnit, toolChest, instrument, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Splice Node VR — its own gamified system: Photon Guild.
// Fibre splicing in a street node. The light that blinds you here is invisible,
// and the glass that gets into your skin is smaller than you can see.

export const SIM_SPLICE_NODE = {
  id: "splice-node",
  index: "05",
  domain: "Connectivity",
  trade: "Fibre optic technician",
  category: "Connectivity & Telecom",
  indoor: "service",
  weather: "rain",
  certification: "CWA and IBEW outside-plant technicians; OSHA 29 CFR 1910.268, the telecommunications standard, for work in and around a street node; the ANSI Z136 laser safety series for optical-fibre communication systems; NFPA 70E for the -48 V power plant in the cabinet; BICSI Installer 2, Optical Fiber, and the carrier's own loss budget and port tag-out procedure",
  name: "Splice Node",
  title: simTitle("Splice Node"),
  tagline: "Dark-fibre confirmation, laser safety, cleave quality and splice loss budget",
  accent: 0xa079ff,
  accentCss: "#a079ff",
  parSeconds: 200,
  badge: { id: "photon-guild", name: "Photon Guild", note: "Dark fibre proven, splice inside budget" },

  game: system({
    name: "Photon Guild",
    currency: "PHOTON",
    ranks: ["Cable Hand", "Splicer", "Node Technician", "Loss Budget Lead", "Guild Certified"],
    badges: [
      { id: "dark-proven", name: "Dark Proven", note: "Confirm the fibre is dark before it is ever exposed", test: AWARD.stepClean("power-check") },
      { id: "sub-tenth", name: "Sub-Tenth", note: "Cleave and splice near the centre of every band", test: AWARD.precise(0.78) },
      { id: "eyes-intact", name: "Eyes Intact", note: "Never look into a fibre end", test: AWARD.safe },
    ],
    challenges: [
      { id: "single-pass", name: "Single Pass", note: "No corrections across the whole splice", test: AWARD.clean },
      { id: "night-window", name: "Night Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-bench", name: "Clean Bench", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "bare-fibre-end": "You looked into the fibre end. Transmission wavelengths are invisible and your blink reflex never fires — the retinal burn is done before you know the port was live.",
    "fibre-scraps": "Those are cleaved fibre offcuts on the bench. Bare glass shards work into skin and cannot be seen on an X-ray. They go in the sharps tube, immediately, every time.",
    "alcohol-heat": "Isopropyl beside a running heat oven. The cleaning solvent is flammable and the oven cycles to 200 °C — one goes away before the other is switched on.",
    "unlabelled-port": "That port has no label and no lockout. Working an unidentified port means the service you take down belongs to somebody who did not know it was coming.",
    "power-shelf": "That is the -48 V battery plant, not a fibre shelf. Telecom DC power will put thousands of amps into a dropped spanner without tripping anything, and the arc takes the tool, the busbar and the hand holding it. Nothing in that shelf is part of a splice — it is worked on isolated, by the power technician, under NFPA 70E.",
  },

  lateNotes: {
    "cleaver": "Nothing gets cleaved before the fibre is proven dark and the buffer is stripped clean.",
    "splicer": "The splicer only sees what you put in it — cleave quality is set before the arc fires.",
  },

  // Interruptions: see shared/game.js. A splicer works with both hands in a
  // street cabinet at two in the morning, and the two things that arrive
  // uninvited are the port somebody else owns and the tray full of services
  // that are not yours.
  interrupts: [
    {
      id: "port-relit",
      kind: "Port back up",
      after: "cleave", delay: 4, seconds: 12,
      alert: "P3 has come back up on the OLT shelf. Provisioning has re-enabled the port you shut down, and the strand lying open on the bench is live again.",
      cue: "You made it dark at the source. Go and make it dark again.",
      target: "olt-port",
      why: "Disabling a port is a software state, and software states get undone — by a config rollback, by a change window closing, by a technician three exchanges away clearing alarms off a list. That is why the port is tagged and the strand is metered rather than trusted. A transmission wavelength is invisible, your blink reflex never fires for it, and the end face you are about to put under a cleaver sits forty millimetres from your eye.",
      missNote: "You cleaved and spliced a strand that had gone live behind you. If your face was over the tray when that port came up — and it was, that is where the work happens — the retinal burn is done before anything at all tells you the light is there.",
      wrongNote: "That is not what brought the light back. The port is on the OLT shelf, and it goes down and stays down before that fibre is touched again.",
    },
    {
      id: "tray-slump",
      kind: "Tray on the move",
      after: "loss", delay: 4, seconds: 13,
      alert: "The tray stack you propped open has settled. Tray 3 has dropped on its hinge and the strands routed out of it are pulling tight across the lip.",
      cue: "Your strand is not the only one in that tray.",
      target: "splice-tray",
      why: "There are twenty-three other strands in tray 3 and every one of them is somebody's live service. Glass does not tell you when you have hurt it: a macro-bend put in tonight passes a trace at bench temperature and shows up as attenuation when the cabinet swings thirty degrees in August. Take the weight off the tray before you finish your own joint, because the fault you cause here gets found by somebody who has no reason to connect it to your ticket.",
      missNote: "The tray hung on its own strands for the rest of the job. Nothing failed while you were standing there, which is exactly the problem — the bends went into live fibres and the trouble ticket lands months from now, on a circuit nobody has touched since tonight.",
      wrongNote: "It is the tray. Take the load off those strands before you carry on with the joint.",
    },
  ],

  steps: [
    {
      id: "ticket", kind: "select", target: "work-ticket",
      title: "Read the ticket and circuit ID",
      cue: "Confirm the circuit, the port, and that the shutdown window is approved.",
      why: "One strand in that tray is a hospital's imaging link and another is the backhaul for half the traffic signals north of the river. The ticket is what says which of the twelve is yours, which port feeds it, and which four hours the carrier has agreed you may break it in. Cutting the wrong strand is not a splice error — it is an outage somebody else has to explain.",
    },
    {
      id: "open-cabinet", kind: "turn", target: "cabinet-handle",
      title: "Unlock and open the node cabinet",
      cue: "Turn the latch and swing the door back onto its stop, clear of the footway.",
      why: "The door goes back against its stop and stays there. A street cabinet door loose in the wind takes the splicer's head or a passer-by's, and keeping the work off the footway is the part of OSHA's telecommunications standard that applies before any of the fibre content does. It is opened once, worked from, and shut — not propped half open for an hour.",
      turn: { turns: 0.5, axis: "z", label: "CABINET LATCH" },
    },
    {
      id: "shutdown", kind: "select", target: "olt-port",
      title: "Shut down the transmitter",
      cue: "Disable the OLT port feeding this strand at the shelf.",
      why: "You make the strand dark at the source, on the shelf in front of you, not at the far end where you cannot see who else has their hands in the rack. A 1550 nm carrier is outside the visible band and the blink reflex never fires for it, which is why the ANSI Z136 guidance for fibre communication systems is built around the strand being proven dark before an end face is ever exposed.",
    },
    {
      id: "tag-port", kind: "drag", target: "port-tag",
      title: "Tag the port out",
      cue: "Take the tag-out card off the bench and hang it on the port you just disabled.",
      why: "A disabled port with nothing hanging on it is a port the network operations centre re-enables the moment a customer rings about the service you just took down. The tag carries your name and your window, and in a cabinet nobody else is standing in it is the only thing that speaks for you to somebody two hundred miles away looking at the same alarm.",
      drag: { to: "olt-port", radius: 0.45, missNote: "Not on the port. A tag hung on the wrong shelf tells the NOC the wrong strand is down and leaves yours free to be turned straight back up." },
    },
    {
      id: "power-check", kind: "gauge", target: "power-meter",
      title: "Prove the fibre is dark",
      cue: "Meter the strand and commit when the received power is safely dark.",
      why: "Dark is a number in dBm, not an opinion. You shut one end down; the strand still runs miles to a node where a second technician may be doing exactly what you are doing, and the meter is the only thing that proves no light is arriving from their end. Anything above the threshold on the ticket means the end face stays capped until you know where the light is coming from.",
      gauge: {
        label: "OPTICAL POWER — RECEIVED", speed: 0.62, green: [0.0, 0.12],
        readout: (t) => `${(-62 + t * 66).toFixed(1)} dBm`,
        missNote: "Still carrying light. Do not expose that end — go back and find what is still transmitting.",
      },
    },
    {
      id: "eyewear", kind: "select", target: "laser-glasses",
      title: "Put on the laser eyewear",
      cue: "Take the wavelength-rated glasses from the case.",
      why: "Rated for the wavelengths carried in this node, not the safety glasses out of the van door. They are not there for the strand you have just proven dark — they are there for the port somebody else brings back up while your eye is six inches from an open tray, which is the only way anybody has ever been hurt by a fibre.",
    },
    {
      id: "open-tray", kind: "select", target: "splice-tray",
      title: "Open the splice tray",
      cue: "Unclip the tray and bring it out flat before you route anything to the bench.",
      why: "Trays come out one at a time and they come out flat. Every other strand in there is a live service belonging to somebody who has not been told anything is happening tonight, and a fibre levered against the edge of a tray takes a bend it never recovers from. That loss turns up weeks later as a link that fails on the cold nights and comes back by lunchtime.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["tight-bend", "slipped-sleeve", "short-slack"],
      itemNames: {
        "tight-bend": "the strand pulled round the post",
        "slipped-sleeve": "the splice sleeve out of its holder",
        "short-slack": "the strand with no service loop",
      },
      itemNotes: {
        "tight-bend": "That strand is routed inside its minimum bend radius. A macro-bend leaks light straight out of the core — it is adding loss to a live service right now, and glass held at that radius cracks eventually.",
        "slipped-sleeve": "The protection sleeve has come out of its holder, so the joint is carrying the strain instead of the sleeve. A fusion splice is butt-welded glass with no mechanical strength of its own; the sleeve is all it has.",
        "short-slack": "No service loop left on that strand. The next technician who has to re-splice it has nothing to pull into the tray and ends up jointing in new cable to buy the slack you could have left tonight.",
      },
      decoyNotes: {
        "sound-strand": "That one is routed correctly — sleeve seated in its holder, full service loop, no bend anywhere near the limit. Leave it alone.",
      },
      title: "Read the tray before you touch it",
      cue: "Three things in this tray are already wrong. Find them by looking.",
      why: "Whatever is wrong in a tray gets blamed on the last technician who opened it, and more to the point it is the thing that fails next. A bend inside the minimum radius, a sleeve out of its holder and a strand with no slack all pass a glance and fail a winter, and every one of them is cheaper to put right now, with the tray already open and the truck already here.",
    },
    {
      id: "prep", kind: "sequence",
      targets: ["protection-sleeve", "stripper", "cleaning-kit"],
      itemNames: {
        "protection-sleeve": "thread the protection sleeve on",
        "stripper": "strip the 250 µm buffer",
        "cleaning-kit": "clean the bare fibre",
      },
      title: "Sleeve on first, then strip and clean",
      cue: "Thread the protection sleeve onto the strand, then strip the coating, then clean the bare fibre.",
      why: "The sleeve goes on before anything else, because there is no way to thread it over a finished joint — forget it and the only remedy is to cut out the splice you just made and prepare both ends again. Then a clean strip with no nick in the cladding, then lint-free and solvent, because contamination is the largest single cause of a high-loss splice and both the cleaver and the arc assume a surface nothing has touched.",
      outOfOrderNote: "Sleeve first. Strip and cleave with no sleeve on the strand and the only way to protect the joint afterwards is to cut it out and start the preparation again.",
    },
    {
      id: "cleave", kind: "gauge", target: "cleaver",
      title: "Cleave to angle",
      cue: "Set the cleaver and commit inside the acceptable cleave angle.",
      why: "The end face has to be square to the axis of the core. Half a degree of angle and the two cores meet across a wedge of air instead of face to face; the arc fuses them anyway, the splicer reports a tidy-looking joint, and the loss stays in that link for the life of the cable. No amount of arc power recovers a bad cleave, so it gets a fresh blade position rather than one more go.",
      gauge: {
        label: "CLEAVE ANGLE", speed: 0.95, green: [0.0, 0.16],
        readout: (t) => `${(t * 3.2).toFixed(2)}°`,
        missNote: "Angle out of tolerance. Re-cleave — a bad end face guarantees a bad splice no matter what the splicer does.",
      },
    },
    {
      id: "splice", kind: "select", target: "splicer",
      title: "Fusion splice the joint",
      cue: "Load both ends, align and fire the arc.",
      why: "The splicer aligns the cores, burns off what is left on the faces and fuses the glass, and it will do that just as confidently to a dirty fibre with a two-degree cleave as to a good one. Everything you control happened before this button; the estimate it puts on the screen afterwards measures your preparation, not the machine.",
    },
    {
      id: "loss", kind: "gauge", target: "otdr",
      title: "Verify the splice loss",
      cue: "Shoot the OTDR and commit when the splice loss is inside budget.",
      why: "Every joint in the link spends part of a loss budget that was set when the route was designed, and that budget is what decides whether the far end still has enough light in three years, after the cable has been dug up and re-jointed twice by somebody else. A joint outside budget is cut out and redone now, while the tray is open and the window is still yours.",
      gauge: {
        label: "SPLICE LOSS", speed: 0.72, green: [0.0, 0.14],
        readout: (t) => `${(t * 0.6).toFixed(3)} dB`,
        missNote: "Over budget for a fusion splice. Cut it out and re-cleave — a marginal joint drifts worse with temperature.",
      },
    },
    {
      id: "protect", kind: "hold", target: "heat-oven", seconds: 6,
      title: "Run the full oven cycle on the sleeve",
      cue: "Slide the sleeve over the joint and hold it in the oven for the whole cycle.",
      why: "That sleeve is the only mechanical strength a fusion splice has — the glass is butt-welded and snaps at the joint the first time anything pulls on it. A cycle cut short leaves the shrink incomplete and the strength member loose inside, which survives the bench, survives the tray, and lets go on the first hot afternoon the cabinet has.",
      holdBreakNote: "You lifted it out early. A part-shrunk sleeve looks finished and holds nothing — run the full cycle.",
    },
    {
      id: "document", kind: "select", target: "label-tag",
      title: "Label and document",
      cue: "Label the strand, record the loss and restore the port.",
      why: "The record is what the next technician trusts at three in the morning with no light in the cabinet and a customer on the phone: strand, port, measured loss, date, your name. Then the port comes back up and the tag comes off, in that order, because a service restored before it is written down is a service nobody can find again when it fails.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 1.9, 0xa079ff);

    // ------------------------------------------------------------- street node
    const cabinet = group(g, -0.9, 0, -1.0, 0.35);
    box(cabinet, 1.0, 0.1, 0.6, 0, 0.05, 0, 0x2d3339, { rough: 0.85 });
    slab(cabinet, 0.92, 1.7, 0.52, 0, 0.95, 0, 0x4c565f, { radius: 0.03, rough: 0.5, metal: 0.5 });
    box(cabinet, 0.98, 0.05, 0.58, 0, 1.82, 0, 0x3d464e, { rough: 0.5, metal: 0.5 });
    const cabDoor = group(cabinet, -0.45, 0.95, 0.26);
    box(cabDoor, 0.88, 1.6, 0.025, 0.44, 0, 0, 0x545e67, { rough: 0.45, metal: 0.55 });
    cabDoor.rotation.y = 1.25;
    decal(cabDoor, 0.34, 0.12, 0.44, 0.6, 0.014,
      signFace("FIBRE NODE 7C", { bg: "#251c3d", accent: "#a079ff", scale: 0.5 }));
    // Security latch on the closing edge of the door — the first thing turned
    // and the last thing turned back.
    const latch = group(cabDoor, 0.82, -0.1, 0.02);
    cyl(latch, 0.022, 0.022, 0.05, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 12 }).rotation.x = Math.PI / 2;
    box(latch, 0.028, 0.14, 0.018, 0, 0, 0.035, 0xa8b0b8, { rough: 0.4, metal: 0.7 });
    holoTag(latch, "Cabinet latch", 0, 0.18, 0.04, { css: "#a079ff", w: 0.3 });
    reg(hits, latch, "cabinet-handle");
    holoTag(cabinet, "Street node 7C", 0, 2.02, 0.1, { css: "#a079ff", w: 0.34 });

    // OLT shelf with ports; one is unlabelled.
    const shelf = rackFrame(cabinet, 0, 0.08, { h: 1.42 });
    const olt = rackUnit(shelf, 1.18, "OLT · SHELF 1", { css: "#a079ff", glow: true, h: 0.12 });
    const portRow = group(olt, 0, -0.005, 0.005);
    const ports = [];
    for (let i = 0; i < 6; i++) {
      const p = group(portRow, -0.18 + i * 0.072, 0, 0);
      box(p, 0.05, 0.035, 0.012, 0, 0, 0, 0x14181d, { rough: 0.6 });
      const lamp = ball(p, 0.006, 0, 0.026, 0.006, i === 2 ? 0xa079ff : CITY.good,
        { emissive: i === 2 ? 0xa079ff : CITY.good, ei: 2.2 });
      ports.push(lamp);
      if (i === 2) {
        decal(p, 0.05, 0.016, 0, -0.03, 0.007, signFace("P3", { accent: "#a079ff", scale: 0.6 }), { px: 96 });
        reg(hits, p, "olt-port");
      }
      if (i === 5) reg(hits, p, "unlabelled-port");
    }
    rackUnit(shelf, 0.98, "TRANSPORT · 400G", { css: "#4fd1ff", glow: true });
    const powerShelf = rackUnit(shelf, 0.8, "POWER · -48 V", { css: "#59c97b", lampColor: 0x59c97b });
    holoTag(powerShelf, "-48 V plant — not yours", 0, 0.16, 0.02, { css: "#f0645b", w: 0.44 });
    reg(hits, powerShelf, "power-shelf");

    // Splice tray stack.
    const trays = group(cabinet, 0, 0.42, 0.06);
    for (let i = 0; i < 4; i++) {
      const tray = group(trays, 0, i * 0.09, 0);
      slab(tray, 0.62, 0.02, 0.36, 0, 0, 0, 0x2b3138, { radius: 0.015, rough: 0.55 });
      box(tray, 0.58, 0.012, 0.02, 0, 0.016, -0.16, 0xa079ff, { rough: 0.5 });
      for (let f = 0; f < 6; f++) {
        hose(tray, [[-0.26, 0.02, -0.1 + f * 0.03], [0, 0.02, 0.12 - f * 0.02], [0.26, 0.02, -0.1 + f * 0.03]],
          0.003, [0x4fd1ff, 0xf2c14b, 0x59c97b, 0xf0645b, 0xffffff, 0xa079ff][f], { steps: 14, rough: 0.4 });
      }
      if (i === 2) {
        reg(hits, tray, "splice-tray");
        // Three faults already in this tray, and one strand routed properly.
        const bend = group(tray, -0.2, 0.03, 0.1);
        torus(bend, 0.016, 0.003, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.9, rough: 0.4, seg: 6, seg2: 20 })
          .rotation.x = Math.PI / 2;
        holoTag(bend, "Tight bend", 0, 0.1, 0, { css: "#f0645b", w: 0.24 });
        reg(hits, bend, "tight-bend");

        const slipped = group(tray, 0.03, 0.03, 0.13);
        cyl(slipped, 0.005, 0.005, 0.055, 0, 0, 0, 0x8b929a, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2.6;
        holoTag(slipped, "Sleeve adrift", 0, 0.08, 0, { css: "#f0645b", w: 0.28 });
        reg(hits, slipped, "slipped-sleeve");

        const slack = group(tray, 0.23, 0.03, 0.08);
        box(slack, 0.022, 0.004, 0.022, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
        holoTag(slack, "No service loop", 0, 0.08, 0, { css: "#f0645b", w: 0.32 });
        reg(hits, slack, "short-slack");

        const sound = group(tray, -0.06, 0.03, -0.12);
        cyl(sound, 0.005, 0.005, 0.055, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
        reg(hits, sound, "sound-strand");
      }
    }
    holoTag(trays, "Tray 3 · strand 14", 0.05, 0.44, 0.1, { css: "#a079ff", w: 0.36 });

    // ------------------------------------------------------------ splice bench
    const bench = group(g, 0.95, 0, -0.25, -0.55);
    slab(bench, 1.3, 0.05, 0.7, 0, 0.92, 0, 0x39424b, { radius: 0.02, rough: 0.4, metal: 0.5 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(bench, 0.022, 0.022, 0.9, sx * 0.58, 0.45, sz * 0.28, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 10 });
    }
    box(bench, 1.24, 0.03, 0.02, 0, 0.96, -0.33, 0x2b3138, { rough: 0.6 });

    // Fusion splicer.
    const splicer = group(bench, -0.34, 0.95, 0.02, 0.2);
    slab(splicer, 0.3, 0.14, 0.24, 0, 0.07, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const lidGroup = group(splicer, 0, 0.14, -0.09);
    slab(lidGroup, 0.3, 0.02, 0.2, 0, 0, 0.09, 0x39424b, { radius: 0.02, rough: 0.5 });
    lidGroup.rotation.x = -1.1;
    const splicerScreen = decal(splicer, 0.16, 0.09, 0, 0.145, 0.06,
      signFace("READY", { bg: "#1a1030", accent: "#a079ff", fg: "#dccdff", scale: 0.55 }),
      { glow: true, ei: 0.9, px: 256 });
    splicerScreen.rotation.x = -Math.PI / 2.6;
    const arcFlash = ball(splicer, 0.012, 0, 0.15, -0.02, 0xffffff, { emissive: 0xffffff, ei: 5 });
    arcFlash.visible = false;
    holoTag(splicer, "Fusion splicer", 0, 0.34, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, splicer, "splicer");

    // Cleaver.
    const cleaver = group(bench, 0.02, 0.95, 0.1, -0.3);
    slab(cleaver, 0.18, 0.08, 0.14, 0, 0.04, 0, 0x1f6f8c, { radius: 0.015, rough: 0.5 });
    const cleaverArm = group(cleaver, 0, 0.08, -0.06);
    slab(cleaverArm, 0.17, 0.02, 0.11, 0, 0, 0.055, 0x2b8fa8, { radius: 0.01, rough: 0.5 });
    cleaverArm.rotation.x = -0.9;
    const cleaverDial = decal(cleaver, 0.05, 0.03, 0.06, 0.082, 0.04,
      signFace("0.0", { bg: "#0d2430", accent: "#a079ff", scale: 0.7 }), { px: 128, glow: true, ei: 0.7 });
    cleaverDial.rotation.x = -Math.PI / 2;
    holoTag(cleaver, "Precision cleaver", 0, 0.24, 0, { css: "#a079ff", w: 0.34 });
    reg(hits, cleaver, "cleaver");

    // Heat shrink oven.
    const oven = group(bench, 0.34, 0.95, -0.02, 0.35);
    slab(oven, 0.2, 0.1, 0.16, 0, 0.05, 0, 0x2b3138, { radius: 0.015, rough: 0.5 });
    box(oven, 0.13, 0.02, 0.05, 0, 0.1, 0, 0x14181d, { rough: 0.7 });
    const ovenLamp = ball(oven, 0.008, 0.07, 0.09, 0.06, CITY.hiVis, { emissive: CITY.hiVis, ei: 0.6 });
    holoTag(oven, "Heat oven", 0, 0.26, 0, { css: "#a079ff", w: 0.24 });
    reg(hits, oven, "heat-oven");

    // Stripper, cleaning kit, alcohol, scraps.
    const stripper = group(bench, -0.14, 0.95, 0.22, 0.8);
    box(stripper, 0.02, 0.012, 0.12, 0, 0.006, 0, 0xd8232a, { rough: 0.5 });
    box(stripper, 0.03, 0.016, 0.03, 0, 0.008, -0.06, 0x2b3138, { rough: 0.5 });
    holoTag(stripper, "Stripper", 0, 0.14, 0, { css: "#a079ff", w: 0.2 });
    reg(hits, stripper, "stripper");

    const cleanKit = group(bench, 0.2, 0.95, 0.22, -0.2);
    slab(cleanKit, 0.14, 0.05, 0.1, 0, 0.025, 0, 0xdfe4e8, { radius: 0.01, rough: 0.6 });
    box(cleanKit, 0.06, 0.012, 0.05, 0, 0.056, 0, 0xa079ff, { rough: 0.5 });
    holoTag(cleanKit, "Lint-free wipes", 0, 0.16, 0, { css: "#a079ff", w: 0.32 });
    reg(hits, cleanKit, "cleaning-kit");

    const alcohol = group(bench, 0.46, 0.95, 0.16);
    cyl(alcohol, 0.03, 0.032, 0.13, 0, 0.065, 0, 0xdfe4e8, { rough: 0.25, opacity: 0.8, seg: 14 });
    cyl(alcohol, 0.028, 0.028, 0.08, 0, 0.05, 0, 0xbfe4f2, { rough: 0.15, opacity: 0.7, seg: 14 });
    cyl(alcohol, 0.014, 0.014, 0.03, 0, 0.145, 0, 0xb8402f, { rough: 0.5, seg: 10 });
    decal(alcohol, 0.05, 0.03, 0, 0.07, 0.033, signFace("IPA", { bg: "#dfe4e8", fg: "#1b1e22", accent: "#f0645b", scale: 0.7 }), { px: 96 });
    holoTag(alcohol, "Isopropyl", 0, 0.22, 0, { css: "#f0645b", w: 0.22 });
    reg(hits, alcohol, "alcohol-heat");

    // The tag-out card that gets carried to the port, and the sleeve rack the
    // preparation sequence starts at.
    const portTag = group(bench, 0.54, 0.98, -0.12);
    box(portTag, 0.06, 0.002, 0.09, 0, 0, 0, 0xf2c14b, { rough: 0.7 });
    decal(portTag, 0.055, 0.08, 0, 0.003, 0,
      signFace("DO NOT ENABLE", { bg: "#f2c14b", fg: "#2a1a0d", accent: "#b8402f", scale: 0.35 }), { px: 128 })
      .rotation.x = -Math.PI / 2;
    holoTag(portTag, "Port tag-out", 0, 0.16, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, portTag, "port-tag");

    const sleeveRack = group(bench, 0.5, 0.95, 0.24);
    box(sleeveRack, 0.11, 0.012, 0.06, 0, 0.006, 0, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 4; i++) {
      cyl(sleeveRack, 0.004, 0.004, 0.05, -0.033 + i * 0.022, 0.016, 0, 0x14181d, { rough: 0.5, seg: 8 })
        .rotation.z = Math.PI / 2;
    }
    holoTag(sleeveRack, "Protection sleeves", 0, 0.14, 0, { css: "#a079ff", w: 0.38 });
    reg(hits, sleeveRack, "protection-sleeve");

    const scraps = group(bench, -0.5, 0.95, 0.2);
    for (let i = 0; i < 7; i++) {
      const s = cyl(scraps, 0.0012, 0.0012, 0.02 + Math.random() * 0.02,
        (Math.random() - 0.5) * 0.08, 0.002, (Math.random() - 0.5) * 0.06, 0xdfe4e8,
        { rough: 0.2, metal: 0.1, seg: 6 });
      s.rotation.set(Math.PI / 2, Math.random() * 3, Math.random() * 3);
    }
    holoTag(scraps, "Fibre offcuts", 0, 0.14, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, scraps, "fibre-scraps");

    // The exposed strand end on the bench rest — never look into it.
    const strandEnd = group(bench, -0.02, 0.96, -0.2);
    hose(strandEnd, [[-0.3, 0, 0.02], [-0.1, 0.005, 0], [0.1, 0, 0]], 0.0018, 0xf7f9fb, { steps: 12, rough: 0.3 });
    ball(strandEnd, 0.004, 0.1, 0, 0, 0xa079ff, { emissive: 0xa079ff, ei: 2.6 });
    reg(hits, strandEnd, "bare-fibre-end");
    const sleeve = cyl(strandEnd, 0.005, 0.005, 0.05, 0, 0.001, 0, 0x1b1e22, { rough: 0.6, seg: 10 });
    sleeve.rotation.z = Math.PI / 2;
    sleeve.visible = false;

    // ---------------------------------------------------------------- kit case
    const chest = toolChest(g, 1.55, 1.1, { ry: -0.8, color: 0x5b4a9a });
    const meter = instrument(chest, -0.1, 0.79, 0, { ry: 0.35, idle: "-- dBm", color: 0xa079ff, w: 0.11, d: 0.18 });
    holoTag(meter, "Power meter", 0, 0.16, 0, { css: "#a079ff", w: 0.28 });
    reg(hits, meter, "power-meter");

    const otdr = instrument(chest, 0.14, 0.79, 0.02, { ry: -0.35, idle: "TRACE", color: 0x2b3138, w: 0.16, d: 0.22 });
    holoTag(otdr, "OTDR", 0, 0.18, 0, { css: "#a079ff", w: 0.2 });
    reg(hits, otdr, "otdr");

    const glasses = group(chest, 0.0, 0.8, -0.14, 0.2);
    box(glasses, 0.14, 0.012, 0.035, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const lens = box(glasses, 0.12, 0.03, 0.01, 0, 0.006, -0.012, 0xd8a53a,
      { rough: 0.15, opacity: 0.55, emissive: 0x7a5a12, ei: 0.4 });
    for (const sx of [-1, 1]) box(glasses, 0.012, 0.008, 0.08, sx * 0.066, 0, 0.04, 0x22262b, { rough: 0.5 });
    holoTag(glasses, "Laser eyewear", 0, 0.14, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, glasses, "laser-glasses");

    // Sharps tube for the offcuts, sitting where it should be used.
    const sharps = group(bench, -0.5, 0.95, -0.14);
    cyl(sharps, 0.025, 0.028, 0.12, 0, 0.06, 0, 0xd8342a, { rough: 0.55, seg: 14 });
    cyl(sharps, 0.026, 0.026, 0.015, 0, 0.125, 0, 0xf2e9c9, { rough: 0.5, seg: 14 });

    // ------------------------------------------------------------ holo tickets
    const ticket = holoPanel(g, 0.56, 0.4, 1.75, 1.45, -1.15, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a079ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#a99ecb";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK TICKET FT-2290", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f0ecff";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SPLICE STRAND 14 · TRAY 3", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#bdb2dd";
      ["Circuit: metro ring west", "Port: OLT shelf 1 · P3",
       "Window approved: 01:00 – 04:00", "Cleave tolerance: ≤ 0.5°",
       "Splice budget: ≤ 0.08 dB"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: -0.7, accent: 0xa079ff });
    reg(hits, ticket, "work-ticket");

    const labelTag = holoPanel(g, 0.4, 0.24, -1.85, 1.35, 0.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,8,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a079ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f0ecff";
      ctx.font = `600 ${Math.round(h * 0.22)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("LABEL + RECORD", w / 2, h * 0.36);
      ctx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`;
      ctx.fillStyle = "#bdb2dd";
      ctx.fillText("Strand ID · loss · date · tech", w / 2, h * 0.68);
    }, { ry: 0.85, accent: 0xa079ff });
    reg(hits, labelTag, "label-tag");

    let portLive = true;
    let arcTimer = 0;
    let ovenRunning = false;

    return {
      hits,
      footprint: 1.9,

      // The interruptions land in the scene the splicer can actually see from
      // the bench: the port lamp comes back up on the shelf behind them, and
      // the tray stack drops on its hinge. See the interrupts block above.
      onInterrupt(it) {
        if (it.id === "port-relit") {
          portLive = true;
          ports[2].material = mat(0xa079ff, { emissive: 0xa079ff, ei: 3.2 });
        }
        if (it.id === "tray-slump") { trays.rotation.z = 0.16; trays.position.y = 0.38; }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "port-relit") {
          portLive = false;
          ports[2].material = mat(0x3a3350, { emissive: 0x3a3350, ei: 0.6 });
        }
        if (it.id === "tray-slump") { trays.rotation.z = 0; trays.position.y = 0.42; }
      },

      onStepComplete(step) {
        if (step.id === "shutdown") {
          portLive = false;
          ports[2].material = mat(0x3a3350, { emissive: 0x3a3350, ei: 0.6 });
        }
        if (step.id === "eyewear") lens.material = mat(0xd8a53a, { rough: 0.15, opacity: 0.75, emissive: 0x7a5a12, ei: 0.7 });
        if (step.id === "open-cabinet") cabDoor.rotation.y = 2.1;
        if (step.id === "tag-port") portTag.rotation.z = 1.2;
        if (step.id === "open-tray") trays.position.z = 0.24;
        if (step.id === "splice") { arcTimer = 0.6; repaint(splicerScreen, signFace("FUSING", { bg: "#1a1030", accent: "#a079ff", fg: "#dccdff", scale: 0.55 })); }
        if (step.id === "loss") repaint(splicerScreen, signFace("0.041 dB", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.48 }));
        if (step.id === "protect") { ovenRunning = true; sleeve.visible = true; }
        if (step.id === "document") {
          ports[2].material = mat(CITY.good, { emissive: CITY.good, ei: 2.2 });
        }
      },

      animate(t, dt, session) {
        ports.forEach((p, i) => {
          if (i === 2 && portLive) p.material.emissiveIntensity = 1.8 + Math.sin(t * 5) * 0.8;
        });
        if (ovenRunning) ovenLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 8) * 0.8;
        if (arcTimer > 0) {
          arcTimer -= dt;
          arcFlash.visible = true;
          arcFlash.scale.setScalar(0.6 + Math.random() * 1.2);
        } else if (arcFlash.visible) arcFlash.visible = false;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          const id = session.step?.id;
          if (id === "power-check") {
            repaint(meter.userData.screen, signFace(`${(-62 + gg.t * 66).toFixed(1)}`, {
              bg: "#0d1c24", accent: gg.t < 0.12 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (id === "cleave") {
            repaint(cleaverDial, signFace(`${(gg.t * 3.2).toFixed(1)}`, {
              bg: "#0d2430", accent: gg.t < 0.16 ? "#59c97b" : "#f2c14b", scale: 0.7,
            }));
          }
          if (id === "loss") {
            repaint(otdr.userData.screen, signFace(`${(gg.t * 0.6).toFixed(2)}`, {
              bg: "#0d1c24", accent: gg.t < 0.14 ? "#59c97b" : "#f2c14b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
