import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pyro Cue VR — Entertainment & Live Events, station five.
// Setting and firing a proximate pyrotechnic effect on an arena stage, the
// afternoon before doors. Everything in this job is about the order in which
// a circuit becomes capable of firing: the device goes in last, the line
// stays shunted until it is tested, the test is done with the panel's own
// current-limited circuit rather than a meter, and the panel is armed only
// once the zone has been walked and called clear — with the key in the
// operator's pocket the entire time it is not.
//
// The misfire is the part that kills people. A device that does not go is a
// device that might still go, so the rule is that nobody approaches it: the
// panel is disarmed, the line is shunted, the key comes out, and only then
// does anyone walk downstage, after the wait the manufacturer specifies.

const PYRO_ACCENT = 0xff7a3c;

export const SIM_PYRO_CUE = {
  id: "pyro-cue",
  index: "61",
  domain: "Live events",
  trade: "Pyrotechnic operator / stage technician",
  category: "Entertainment & Live Events",
  weather: "clear",
  certification: "IATSE stage locals; NFPA 1126 use of pyrotechnics before a proximate audience; ATF licensing for the acquisition and storage of explosive materials; state or provincial pyrotechnic operator licensing, which varies by jurisdiction; the permit and inspection of the authority having jurisdiction for this venue and this show",
  name: "Pyro Cue",
  title: simTitle("Pyro Cue"),
  tagline: "A proximate effect set and fired: permit and fallout zone first, device loaded last, line shunted until the panel tests it, armed only on the all-clear, and a misfire nobody walks up to",
  accent: PYRO_ACCENT,
  accentCss: "#ff7a3c",
  parSeconds: 280,
  footprint: 2.2,
  badge: { id: "cue-held", name: "Cue Held", note: "An effect set, tested, armed on the all-clear and fired — and a misfire handled from the panel rather than from the stage" },

  game: system({
    name: "Firing Authority",
    currency: "CUE",
    ranks: ["Deck Hand", "Pyro Assistant", "Pyrotechnic Operator", "Effects Lead", "Firing Authority Certified"],
    badges: [
      { id: "key-in-pocket", name: "Key In Pocket", note: "The firing key never sat in an unattended panel", test: AWARD.stepClean("key-out") },
      { id: "nobody-walked-up", name: "Nobody Walked Up", note: "Never approached a device on a live circuit, never fired on an unwalked zone", test: AWARD.safe },
      { id: "measured-not-guessed", name: "Measured, Not Guessed", note: "Fallout distance measured to the device's rating rather than eyeballed", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cue", name: "Clean Cue", note: "No corrections from load-in to load-out", test: AWARD.clean },
      { id: "held-the-watch", name: "Held The Watch", note: "Stood the full fire watch after the effect", test: AWARD.unbroken },
      { id: "before-doors", name: "Before Doors", note: "Set and proven inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "ohmmeter": "You put a multimeter across the electric match. An ordinary ohmmeter proves continuity by pushing current through the thing it is measuring, and the current it pushes is comfortably enough to fire an e-match sitting in your hand. Continuity on a firing line is proven with the panel's own current-limited test circuit or a purpose-built blasting galvanometer, never a meter out of the toolbox.",
    "walk-to-misfire": "You walked downstage to a device that did not fire. It did not fire yet. Until the panel is disarmed, the line shunted and the key out of the panel and in your pocket, that device has a live circuit on it and you are standing over the muzzle — and even after all of that, the wait the manufacturer specifies comes before anybody approaches.",
    "arm-early": "You armed the panel before the zone was walked. Arming is the last thing that happens, after the stage is called clear and after you have looked at it yourself, because an armed panel is a panel one button away from an effect going off into whatever is standing in front of it.",
    "key-left-in": "You left the firing key in the panel. The key is the one thing that makes the panel yours: in your pocket it is a piece of metal, and in an unattended panel on a dark stage it is an effect anybody can fire by leaning on the desk.",
  },

  lateNotes: {
    "pyro-device": "The device goes into the mortar after the position is set, the zone is measured and the line is proven — it is the last thing loaded, not the first.",
    "arm-switch": "The panel arms after the zone walk and the all-clear, never before.",
    "fire-button": "The effect fires on the cue, from an armed panel, over a zone somebody has just looked at.",
  },

  // Interruptions: see shared/game.js. Both are the two ways a proximate
  // effect actually goes wrong — somebody in the zone, and a device that
  // does not go.
  interrupts: [
    {
      id: "dancer-in-zone",
      kind: "Zone breach",
      after: "continuity", delay: 4, seconds: 12,
      alert: "A dancer has come back out to mark a spot and is standing downstage of the mortar, inside the fallout zone, looking at their feet.",
      cue: "The zone you just had called clear is not clear any more.",
      target: "stage-comms",
      why: "An all-clear is a photograph of a stage at one moment, and stages do not hold still. The person is not going to see a black mortar taped to a black deck in a work light, so the call goes back to the stage manager and the zone is re-walked — the effect waits, because the effect can.",
      missNote: "The zone stayed breached and the all-clear you were holding was already out of date. On a show that cue would have gone on time into the space that person was standing in.",
      wrongNote: "That is not how you stop a stage. The call goes to the stage manager on comms, and it goes now.",
    },
    {
      id: "misfire",
      kind: "Device did not go",
      after: "fire", delay: 3, seconds: 14,
      alert: "Cue went, one report instead of two. The stage-right mortar is dark and the panel is showing continuity on that circuit.",
      cue: "One did not go — and a device that did not go is not a device that will not go.",
      target: "arm-switch",
      why: "The circuit still reads continuity, which means the match is intact and the device is exactly as capable of firing as it was a second ago. Everything happens at the panel: disarm, shunt the line, key out, and only then start the clock on the manufacturer's wait before anybody walks downstage. The single thing you must not do is go and look.",
      missNote: "The panel stayed armed with a live device on the deck. The next thing that happened on that stage was somebody walking past it, and the reason nothing happened to them is not one that belongs in a method statement.",
      wrongNote: "Not that. A misfire is handled at the panel — disarm first, and nothing at the stage end until it is.",
    },
  ],

  steps: [
    {
      id: "plot", kind: "select", target: "cue-sheet",
      title: "Read the effect plot and the cue sheet",
      cue: "Which effect, which device, which position, which cue number, and what the device is rated for.",
      why: "The plot is the agreement between the designer, the operator and the authority that issued the permit. The device's own rating is what sets every distance on this stage, so it is read off the box rather than remembered from the last show.",
    },
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Check the permit and the inspection",
      cue: "Confirm the permit covers this venue, this show and these effects, and that the inspection has happened.",
      why: "A proximate effect is fired under a permit issued for a named show in a named room, after somebody from the authority having jurisdiction has walked it. No permit on the board is not a paperwork problem — it is an effect that does not happen tonight.",
    },
    {
      id: "zone", kind: "gauge", target: "tape-measure",
      title: "Measure the fallout zone",
      cue: "Run the tape from the device position downstage and commit on the separation the rating calls for.",
      why: "Separation is measured, not stepped out. The number comes from the device's own rating and the geometry of where it points, and it is the one dimension on this stage that has an audience standing at the end of it.",
      gauge: {
        label: "SEPARATION", speed: 0.7, green: [0.46, 0.66],
        readout: (t) => `${(t * 9).toFixed(1)} m`,
        missNote: "That is not the separation this device is rated for. Move the position or change the device — those are the only two options.",
      },
    },
    {
      id: "barriers", kind: "sequence",
      targets: ["zone-marker-sl", "zone-marker-sr", "zone-tape"],
      itemNames: { "zone-marker-sl": "stage-left marker", "zone-marker-sr": "stage-right marker", "zone-tape": "tape the line on the deck" },
      title: "Mark the zone on the deck",
      cue: "Marker stage left, marker stage right, then tape the line between them.",
      why: "A zone that only exists in the operator's head is a zone the dancers, the deck crew and the camera operator all walk through. Marked on the deck it becomes something the whole floor can see and the stage manager can call against.",
    },
    {
      id: "mortar", kind: "select", target: "mortar-mount",
      title: "Check the mount and the angle",
      cue: "Confirm the mortar is secured to the deck and pointing where the plot says.",
      why: "A mortar that moves between the check and the cue makes every distance you just measured a distance to somewhere else. Secured, and pointed up and away from anywhere a person is ever going to be.",
    },
    {
      id: "shunt", kind: "select", target: "line-shunt",
      title: "Confirm the firing line is shunted",
      cue: "Check the line is shorted out at the stage end before anything goes near the mortar.",
      why: "A shunted line is two legs tied together, so a stray voltage — a radio, a static discharge, a dimmer leaking down a shared conduit — has a path that is not through the match. It stays shunted through the whole load, and it is the reason a device can be handled at all.",
    },
    {
      id: "device-load", kind: "drag", target: "pyro-device",
      title: "Load the device",
      cue: "Carry the device from the case and seat it in the mortar.",
      why: "Last thing in, and only once the position, the zone and the shunt are all done. Everything before this point is work around an empty tube; everything after it is work around a device.",
      drag: { to: "mortar-socket", radius: 0.4, missNote: "Not seated in the mortar — a device resting in the tube is a device that leaves at an angle nobody measured." },
    },
    {
      id: "continuity", kind: "gauge", target: "panel-test",
      title: "Test continuity from the panel",
      cue: "Use the panel's own test circuit and commit on the reading.",
      why: "The panel's test circuit is current-limited specifically so it can prove a match is intact without being enough to fire it. Anything else in the toolbox that measures resistance does so by pushing current, and on an e-match that is not a measurement, it is a cue.",
      gauge: {
        label: "LOOP", speed: 0.72, green: [0.3, 0.52],
        readout: (t) => `${(t * 7).toFixed(1)} Ω`,
        missNote: "That loop reading is not a good circuit — open or shorted, either way the cue does not go and you do not know why until you have found it.",
      },
    },
    {
      id: "key-out", kind: "turn", target: "firing-key",
      title: "Take the key",
      cue: "Turn the key out of the panel and put it in your pocket.",
      why: "The key is the difference between a firing panel and a desk. Out of the panel and on the operator, the effect belongs to one person; left in it, the effect belongs to whoever is nearest when the room goes dark.",
      turn: { turns: 0.25, axis: "z", reverse: true, label: "FIRING KEY" },
    },
    {
      id: "allclear", kind: "sequence",
      targets: ["walk-the-zone", "stage-comms"],
      itemNames: { "walk-the-zone": "walk the zone yourself", "stage-comms": "all-clear from the stage manager" },
      title: "Walk it, then take the all-clear",
      cue: "Walk the fallout zone with your own eyes, then take the all-clear on comms.",
      why: "Your eyes first, then the call. The stage manager is clearing a stage they can see the front of; the operator is clearing the volume the effect actually occupies, which includes the place behind the riser that nobody looks at.",
      outOfOrderNote: "Walk it first, then take the call — an all-clear you accepted before looking is somebody else's opinion of your zone.",
    },
    {
      id: "arm", kind: "select", target: "arm-switch",
      title: "Arm the panel",
      cue: "Key in, arm the circuit, and stay at the panel.",
      why: "Arming is the last thing and it happens with the operator standing at the desk. From here to the cue is measured in seconds, and for all of them the panel is one press from an effect.",
    },
    {
      id: "fire", kind: "hold", target: "fire-button", seconds: 3,
      title: "Fire on the cue",
      cue: "Hold the fire button through the cue.",
      why: "Held rather than tapped, because the operator's hand on the button through the whole effect is the operator still watching the stage through the whole effect — and the fastest way to stop the rest of a sequence is a hand that comes off.",
      holdBreakNote: "Came off the button mid-cue. On a sequence that drops the rest of the effects and leaves half of them loaded.",
    },
    {
      id: "disarm", kind: "sequence",
      targets: ["arm-switch", "line-shunt", "firing-key"],
      itemNames: { "arm-switch": "disarm the panel", "line-shunt": "shunt the line", "firing-key": "key out and in your pocket" },
      title: "Make it safe in order",
      cue: "Disarm, shunt, key out — in that order, before anybody moves downstage.",
      why: "Three things, and each one only means something with the ones before it. Disarmed stops the panel firing, shunted stops anything else firing it, key out stops the panel being re-armed by somebody who does not know what is on the deck.",
      outOfOrderNote: "Disarm, then shunt, then key. The panel stops being able to fire before the line is touched.",
    },
    {
      id: "firewatch", kind: "hold", target: "fire-watch-post", seconds: 5,
      title: "Stand the fire watch",
      cue: "Hold the post and watch the deck and the drapes for the full watch.",
      why: "What lands after an effect is still hot, and a soft good that has caught takes minutes to show itself. The watch is stood where the effect was, for as long as the venue's own rule says, and it is the reason a smouldering drape is found by the person who fired the cue.",
      holdBreakNote: "The watch was cut short. The whole point of a fire watch is the part after it looks like nothing happened.",
    },
    {
      id: "loadout", kind: "find",
      targets: ["spent-casing", "unfired-stock", "device-log"],
      itemNames: { "spent-casing": "spent casing", "unfired-stock": "unfired stock", "device-log": "the device log" },
      itemNotes: {
        "spent-casing": "The spent casing comes out of the mortar and is accounted for. A tube that looks empty in a work light is not a tube anybody loads on top of.",
        "unfired-stock": "Unfired stock goes back in the magazine case, locked, and off the deck. It does not live in a road box overnight because the case it came in is the case the licence covers.",
        "device-log": "Every device that came out of the case is written against what happened to it. The count in equals the count out, or nobody goes home.",
      },
      title: "Load out and account for everything",
      cue: "Click the three things that have to be reconciled before the deck is released.",
      why: "The count is the whole of it. A device unaccounted for at the end of a night is a device somewhere in a venue that is about to be handed to a different crew.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, PYRO_ACCENT);

    // ------------------------------------------------------------- the deck
    // A black stage deck with a riser upstage, drapes behind, and the front
    // edge of the deck downstage where the audience would be.
    const deck = box(g, 5.0, 0.1, 3.6, 0, 0.05, -0.6, 0x14181c, { rough: 0.92, finish: "painted", tile: [5, 4] });
    void deck;
    const riser = box(g, 2.4, 0.5, 1.0, -0.2, 0.35, -2.1, 0x1c2228, { rough: 0.85, finish: "painted", tile: [3, 1] });
    void riser;
    for (let i = 0; i < 7; i++) {
      box(g, 0.42, 3.2, 0.06, -2.1 + i * 0.7, 1.7, -2.75, 0x1a1013, { rough: 0.98, finish: "painted", tile: [1, 3] });
    }
    // Truss over the stage with a couple of fixtures on it.
    const truss = group(g, 0, 3.1, -1.4);
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(truss, 0.03, 0.03, 5.0, 0, sy * 0.14, sz * 0.14, 0x9aa4ad, { rough: 0.5, metal: 0.7, seg: 8 })
        .rotation.z = Math.PI / 2;
    }
    for (let i = -2; i <= 2; i++) {
      const lamp = group(truss, i * 1.0, -0.3, 0);
      box(lamp, 0.18, 0.26, 0.18, 0, 0, 0, 0x22272c, { rough: 0.6, metal: 0.4 });
      ball(lamp, 0.06, 0, -0.16, 0, 0xffd9a0, { emissive: 0xffd9a0, ei: 1.4 });
    }

    // ------------------------------------------------------- mortar position
    const mortarBase = group(g, 0.85, 0.1, -1.55);
    box(mortarBase, 0.46, 0.06, 0.46, 0, 0.03, 0, 0x2b3138, { rough: 0.7, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(mortarBase, 0.016, 0.016, 0.07, sx * 0.18, 0.035, sz * 0.18, CITY.steel, { rough: 0.4, metal: 0.85, seg: 8 });
    }
    const mortar = cyl(mortarBase, 0.075, 0.08, 0.5, 0, 0.31, 0, 0x3a4550, { rough: 0.55, metal: 0.5, seg: 18 });
    mortar.rotation.x = -0.12;
    holoTag(mortarBase, "Mortar — secured, angle per plot", 0, 0.78, 0, { css: "#ff7a3c", w: 0.62 });
    reg(hits, mortarBase, "mortar-mount");
    const mortarSocket = group(mortarBase, 0, 0.52, 0.03);
    hits["mortar-socket"] = mortarSocket;
    const muzzleFlash = particles(g, 30, 0xffcf7a, { size: 0.06, life: 0.6, additive: true, opacity: 0.85 });
    muzzleFlash.position.set(0.85, 0.72, -1.58);
    muzzleFlash.visible = false;

    // Second mortar stage right — the one that does not go.
    const mortarR = group(g, -1.55, 0.1, -1.55);
    box(mortarR, 0.46, 0.06, 0.46, 0, 0.03, 0, 0x2b3138, { rough: 0.7, metal: 0.4 });
    const tubeR = cyl(mortarR, 0.075, 0.08, 0.5, 0, 0.31, 0, 0x3a4550, { rough: 0.55, metal: 0.5, seg: 18 });
    tubeR.rotation.x = -0.12;
    holoTag(mortarR, "Mortar SR", 0, 0.78, 0, { css: "#8fa9c4", w: 0.24 });
    const approachR = box(mortarR, 0.44, 0.5, 0.44, 0, 0.35, 0.42, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(mortarR, "go and look at it?", 0, 0.14, 0.46, { css: "#d2312b", w: 0.4 });
    reg(hits, approachR, "walk-to-misfire");

    // The device in its case, downstage left, to be carried in.
    const deviceCase = group(g, -2.0, 0.1, 0.55, 0.35);
    box(deviceCase, 0.66, 0.34, 0.44, 0, 0.17, 0, 0x4a2f14, { rough: 0.85 });
    box(deviceCase, 0.68, 0.05, 0.46, 0, 0.36, 0, 0x33210e, { rough: 0.8 });
    decal(deviceCase, 0.4, 0.14, 0, 0.2, 0.225, signFace("1.4G  MAGAZINE", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.5 }));
    lockTag(deviceCase, 0.3, 0.2, 0.2, { color: 0xf2c14b });
    const device = cyl(deviceCase, 0.06, 0.06, 0.2, 0.05, 0.48, 0, 0xd8232a, { rough: 0.6, seg: 16 });
    holoTag(deviceCase, "Device — load it last", 0, 0.72, 0, { css: "#ff7a3c", w: 0.46 });
    reg(hits, device, "pyro-device");
    const unfired = cyl(deviceCase, 0.055, 0.055, 0.18, -0.16, 0.46, 0.02, 0x8a2b2b, { rough: 0.6, seg: 14 });
    reg(hits, unfired, "unfired-stock");

    // ----------------------------------------------------- the firing panel
    const desk = group(g, 2.15, 0, 0.75, -0.85);
    box(desk, 0.9, 0.06, 0.55, 0, 0.92, 0, 0x2f3740, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(desk, 0.02, 0.02, 0.92, sx * 0.4, 0.46, sz * 0.22, CITY.darkSteel, { rough: 0.5, metal: 0.65, seg: 8 });
    }
    const panel = box(desk, 0.62, 0.1, 0.36, 0, 1.0, 0, 0x22272c, { rough: 0.5, metal: 0.5 });
    void panel;
    const panelFace = decal(desk, 0.5, 0.26, 0, 1.055, -0.02, signFace("DISARMED", {
      bg: "#101820", accent: "#8fa9c4", fg: "#cfe0ea", scale: 0.42,
    }), { px: 384, glow: true, ei: 0.7 });
    panelFace.rotation.x = -Math.PI / 2;
    const keyPivot = group(desk, -0.22, 1.06, 0.1);
    cyl(keyPivot, 0.024, 0.024, 0.03, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.8, seg: 12 });
    box(keyPivot, 0.012, 0.055, 0.02, 0, 0.04, 0, 0xc9a227, { rough: 0.4, metal: 0.8 });
    holoTag(desk, "firing key", -0.22, 1.16, 0.18, { css: "#f2c14b", w: 0.24 });
    reg(hits, keyPivot, "firing-key");
    const armSwitch = box(desk, 0.05, 0.05, 0.05, -0.04, 1.07, 0.1, 0xf2894b, { rough: 0.5 });
    holoTag(desk, "arm", -0.04, 1.16, 0.18, { css: "#f2894b", w: 0.14 });
    reg(hits, armSwitch, "arm-switch");
    const fireBtn = cyl(desk, 0.045, 0.045, 0.035, 0.14, 1.07, 0.1, 0xd8232a, { rough: 0.45, seg: 18 });
    holoTag(desk, "fire", 0.14, 1.16, 0.18, { css: "#f0645b", w: 0.14 });
    reg(hits, fireBtn, "fire-button");
    const testBtn = instrument(desk, 0.3, 1.0, -0.08, { idle: "-- Ω", color: 0x2b3138, w: 0.16, d: 0.14 });
    holoTag(desk, "continuity test", 0.3, 1.16, -0.08, { css: "#8fa9c4", w: 0.32 });
    reg(hits, testBtn, "panel-test");

    // The trap: an ordinary multimeter left on the desk.
    const meter = slab(desk, 0.11, 0.035, 0.16, -0.36, 0.96, -0.12, 0xf2c14b, { radius: 0.01, rough: 0.6 });
    holoTag(desk, "check it with the multimeter?", -0.36, 1.16, -0.16, { css: "#d2312b", w: 0.56 });
    reg(hits, meter, "ohmmeter");
    const keptKey = box(desk, 0.05, 0.05, 0.05, -0.22, 0.86, 0.22, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(desk, "leave the key in?", -0.22, 0.74, 0.26, { css: "#d2312b", w: 0.36 });
    reg(hits, keptKey, "key-left-in");
    const earlyArm = box(desk, 0.05, 0.05, 0.05, 0.1, 0.86, 0.22, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(desk, "arm it now and save time?", 0.1, 0.74, 0.26, { css: "#d2312b", w: 0.5 });
    reg(hits, earlyArm, "arm-early");

    // Firing line back to the stage, and the shunt at the stage end.
    const shuntBox = group(g, 1.55, 0.1, -0.85);
    box(shuntBox, 0.18, 0.12, 0.14, 0, 0.06, 0, 0x2f6f4a, { rough: 0.6, metal: 0.4 });
    const shuntLink = box(shuntBox, 0.13, 0.02, 0.02, 0, 0.14, 0, 0x59c97b, { rough: 0.5, metal: 0.6 });
    holoTag(shuntBox, "line shunt", 0, 0.32, 0, { css: "#59c97b", w: 0.24 });
    reg(hits, shuntBox, "line-shunt");
    cyl(g, 0.012, 0.012, 1.4, 1.2, 0.12, -1.2, 0x1f2429, { rough: 0.8, seg: 8 }).rotation.z = Math.PI / 2.6;

    // ------------------------------------------------------- zone and markers
    const zoneLine = group(g, 0, 0.1, 0.35);
    const zoneTape = group(zoneLine, 0, 0, 0);
    for (let i = -3; i <= 3; i++) {
      box(zoneTape, 0.3, 0.008, 0.05, i * 0.6, 0.006, 0, 0xff7a3c, { emissive: 0xff7a3c, ei: 0.5, cast: false });
    }
    holoTag(zoneLine, "FALLOUT ZONE — downstage of this line", 0, 0.5, 0, { css: "#ff7a3c", w: 0.86 });
    reg(hits, zoneTape, "zone-tape");
    const markerL = cone(g, 1.95, 0.35, { color: 0xff7a3c });
    reg(hits, markerL, "zone-marker-sl");
    const markerR = cone(g, -1.95, 0.35, { color: 0xff7a3c });
    reg(hits, markerR, "zone-marker-sr");
    const walkZone = box(g, 3.4, 0.02, 1.4, 0, 0.115, -0.5, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk the zone", 0, 0.42, -0.5, { css: "#ff7a3c", w: 0.3 });
    reg(hits, walkZone, "walk-the-zone");

    const tape = slab(g, 0.1, 0.05, 0.1, -0.95, 0.16, 0.9, 0xf2c14b, { radius: 0.012, rough: 0.6 });
    holoTag(g, "Tape measure", -0.95, 0.4, 0.9, { css: "#f2c14b", w: 0.3 });
    reg(hits, tape, "tape-measure");

    // ----------------------------------------------- comms, boards, fire watch
    const comms = group(g, 2.15, 0, 1.55, -1.2);
    cyl(comms, 0.03, 0.035, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    box(comms, 0.18, 0.22, 0.12, 0, 1.2, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    ball(comms, 0.02, 0, 1.32, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(comms, "Stage manager comms", 0, 1.48, 0, { css: "#59c97b", w: 0.44 });
    reg(hits, comms, "stage-comms");

    const boards = group(g, -2.45, 0, -0.35, 1.25);
    const cueSheet = holoPanel(boards, 0.72, 0.5, 0, 1.45, 0, (cx, w, h) => {
      cx.fillStyle = "#1a1006"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#ff7a3c"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffd6bd";
      cx.fillText("EFFECT PLOT — CUE 24", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#ffe8dc";
      ["2 × GERB, STAGE DECK SL / SR", "RATED SEPARATION PER DEVICE BOX",
        "ANGLE: UPSTAGE 7 DEG FROM VERTICAL", "FIRE ON SM CALL, NOT ON MUSIC"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { accent: PYRO_ACCENT });
    cyl(boards, 0.03, 0.035, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, cueSheet, "cue-sheet");

    const permits = group(g, -2.45, 0, 0.95, 1.5);
    const permitPanel = holoPanel(permits, 0.66, 0.46, 0, 1.35, 0, (cx, w, h) => {
      cx.fillStyle = "#101c22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#bff7d4";
      cx.fillText("AHJ PERMIT — THIS VENUE", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ec";
      ["SHOW NAMED — YES", "EFFECTS LISTED — YES", "INSPECTION WALKED 15:40", "OPERATOR LICENCE ON FILE"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.38 + i * 0.15)));
    }, { accent: 0x59c97b });
    cyl(permits, 0.03, 0.035, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, permitPanel, "permit-board");

    const watchPost = group(g, 0.1, 0.1, 1.35);
    cyl(watchPost, 0.16, 0.2, 0.04, 0, 0.02, 0, 0xff7a3c, { rough: 0.7, seg: 18 });
    const extinguisher = cyl(watchPost, 0.07, 0.07, 0.42, 0.22, 0.21, 0, 0xd8232a, { rough: 0.5, seg: 16 });
    void extinguisher;
    holoTag(watchPost, "Fire watch post", 0, 0.62, 0, { css: "#ff7a3c", w: 0.36 });
    reg(hits, watchPost, "fire-watch-post");

    const casing = cyl(g, 0.06, 0.06, 0.16, 1.25, 0.18, -1.05, 0x5a5048, { rough: 0.8, seg: 14 });
    casing.visible = false;
    reg(hits, casing, "spent-casing");
    const logBook = slab(g, 0.2, 0.03, 0.26, 2.45, 0.97, -0.45, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Device log", 2.45, 1.16, -0.45, { css: "#8fa9c4", w: 0.24 });
    reg(hits, logBook, "device-log");

    barrierPanel(g, -1.15, 1.85, { color: 0xe4622a });
    toolChest(g, 1.25, 1.55);

    // The dancer who comes back out, waiting in the wings until they do.
    const dancer = standingFigure(g, -2.75, -1.35, { ry: 1.4, cloth: 0x7a4fbd });

    // -------------------------------------------------------------- live state
    let armed = false, fired = false, misfire = false, keyIn = true;
    const dancerHome = dancer.position.clone();

    const setPanel = (text, accent) => repaint(panelFace, signFace(text, {
      bg: "#101820", accent, fg: "#cfe0ea", scale: 0.42,
    }));

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "barriers") {
          zoneTape.children.forEach((c) => { c.material = mat(0xff7a3c, { emissive: 0xff7a3c, ei: 1.6, cast: false }); });
        }
        if (step.id === "device-load") { device.position.set(0, 0, 0); mortarSocket.add(device); }
        if (step.id === "key-out") { keyIn = false; keyPivot.rotation.z = -Math.PI / 2; setPanel("KEY OUT", "#f2c14b"); }
        if (step.id === "arm") { armed = true; keyIn = true; keyPivot.rotation.z = 0; setPanel("ARMED", "#f0645b"); }
        if (step.id === "fire") {
          fired = true; muzzleFlash.visible = true; casing.visible = true;
          setPanel("CUE 24 FIRED", "#ffcf7a");
        }
        if (step.id === "disarm") {
          armed = false; keyIn = false; misfire = false;
          keyPivot.rotation.z = -Math.PI / 2;
          shuntLink.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.5 });
          setPanel("DISARMED · SHUNTED", "#59c97b");
        }
      },

      // Both interruptions really happen on the deck: the dancer walks into
      // the zone, and the stage-right mortar stays dark with a continuity
      // lamp on the panel. See tools/interrupt_react.mjs.
      onInterrupt(it) {
        if (it.id === "dancer-in-zone") { dancer.position.set(-0.6, 0.1, -0.7); dancer.rotation.y = 0.2; }
        if (it.id === "misfire") {
          misfire = true;
          tubeR.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.5 });
          setPanel("SR — CONTINUITY", "#f0645b");
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dancer-in-zone") { dancer.position.copy(dancerHome); dancer.rotation.y = 1.4; }
        if (it.id === "misfire") {
          misfire = false;
          tubeR.material = mat(0x3a4550, { rough: 0.55, metal: 0.5 });
          setPanel("SR — SAFED", "#59c97b");
        }
      },

      onHazard(hitId) {
        if (hitId === "arm-early" || hitId === "key-left-in") setPanel("UNSAFE STATE", "#f0645b");
      },

      animate(t, dt, session) {
        const step = session?.step;

        // The effect really goes, and the stage-right tube really does not.
        if (muzzleFlash.visible) {
          muzzleFlash.userData.step(dt, new THREE.Vector3(0, 2.4, -0.3), 0.3, 0.45, 0.2);
        }

        // Truss lamps breathe so the deck is never a still photograph.
        for (const lamp of truss.children) {
          if (lamp.children?.[1]?.material) lamp.children[1].material.emissiveIntensity = 1.2 + Math.sin(t * 1.4) * 0.2;
        }
        if (armed) {
          fireBtn.material.emissiveIntensity = 1.0 + Math.sin(t * 6) * 0.6;
        }
        void keyIn;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "continuity") {
          repaint(testBtn.userData.screen, signFace(`${(gg.t * 7).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.28 && gg.t < 0.54 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && step?.id === "zone") {
          setPanel(`${(gg.t * 9).toFixed(1)} m`, gg.t > 0.44 && gg.t < 0.68 ? "#59c97b" : "#f0645b");
        }
      },
    };
  },
};
