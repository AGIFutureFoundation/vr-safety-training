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
  certification: "IATSE stage locals; NFPA 1126 use of pyrotechnics before a proximate audience; OSHA 29 CFR 1910.109 storage and handling of explosives and blasting agents; ATF licensing and magazine rules under 27 CFR Part 555 for the acquisition and storage of explosive materials; state or provincial pyrotechnic operator licensing, which varies by jurisdiction; the local AHJ's permit and sign-off for this venue and this show",
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
    "ohmmeter": "You clipped a shop multimeter onto the e-match leads. A general-purpose ohmmeter proves continuity by driving current through whatever it is testing, and that current is more than enough to set off a match resting in your palm. Continuity on a firing circuit gets proven only with the panel's own current-limited test loop or a dedicated blasting galvanometer — not a meter pulled from a tool pouch.",
    "walk-to-misfire": "You went down to a device that failed to fire. Failed is the wrong word for it — it simply has not fired yet. Until the panel reads disarmed, the circuit is shunted, and the key is out of the panel and in your pocket, that mortar is still live and you would be standing directly over its muzzle. Even once every one of those is true, no one moves in until the manufacturer's specified wait time has run out.",
    "arm-early": "You armed the panel before the deck was swept. Arming happens last, once the stage manager has confirmed the deck clear and you have checked it with your own eyes, because an armed panel sits one button press away from sending an effect into whatever happens to occupy its path.",
    "key-left-in": "You left the firing key sitting in the panel. Out of the panel and in your pocket, the key is a piece of metal that only you carry; left in an unattended panel on a dark stage, it turns that panel into something anyone leaning on the desk can fire.",
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
      alert: "A dancer has come back out to mark a spot and is standing downstage of the mortar, inside the exclusion line, staring down at their own footwork.",
      cue: "The area you just confirmed clear is not clear any more.",
      target: "stage-comms",
      why: "An all-clear only describes the stage at the instant it was given, and a stage in active use never holds still. That dancer has no reason to spot a black mortar taped to a black deck under a single work light, so word goes straight back to the stage manager and the area is swept again — the effect can wait, and it will.",
      missNote: "The exclusion line stayed breached while you sat on an all-clear that was already stale. On an actual show that cue fires on schedule, straight into the spot that person was standing in.",
      wrongNote: "That is not how a stage gets stopped. Word goes to the stage manager over the intercom, immediately.",
    },
    {
      id: "misfire",
      kind: "Device did not go",
      after: "fire", delay: 3, seconds: 14,
      alert: "The cue fired one report instead of two. The stage-right mortar stayed dark, and the panel is still reading continuity on that circuit.",
      cue: "One did not fire — and a device that did not fire is not the same thing as a device that cannot.",
      target: "arm-switch",
      why: "A continuity reading means the match is still intact, so that device is exactly as capable of firing as it was a moment ago. Every part of the response happens at the panel: disarm, shunt the circuit, pull the key — and only after all three do you start the clock on the manufacturer's wait. The one thing that is never acceptable is heading downstage to look at it.",
      missNote: "The panel stayed armed over a live device sitting on the deck. The next thing to happen on that stage was a crew member passing right by it, and the only reason nothing happened to them is not one you will find written into any method statement.",
      wrongNote: "Not that. A misfire is handled at the panel — disarm first, and nothing at the stage end until it is.",
    },
  ],

  steps: [
    {
      id: "plot", kind: "select", target: "cue-sheet",
      title: "Read the cue sheet for tonight's effect",
      cue: "Which effect, which device, which position on the deck, which cue number, and what that device is built to throw.",
      why: "The cue sheet is the one document the designer, the operator and the permitting AHJ all signed off on. Every distance on this deck still traces back to the device's own rating, read off the box in hand, not remembered from a previous show.",
    },
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Confirm the permit and the sign-off",
      cue: "Make sure the permit names this building, this show and these specific effects, and that the AHJ has already been through.",
      why: "A proximate effect only goes up under a permit written for this exact show in this exact room, once the AHJ has been through and signed off. An empty slot on that board is not a filing delay — it means the effect stays dark tonight.",
    },
    {
      id: "zone", kind: "gauge", target: "tape-measure",
      title: "Measure the separation distance",
      cue: "Run the tape out from the device toward the house and commit once you hit the separation its rating calls for.",
      why: "Separation gets measured with a tape, never paced off by eye. That number comes straight from the device's own rating and the angle it is aimed at, and it is the single distance on this deck with a crowd of people standing at the far end of it.",
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
      title: "Lay the exclusion line on the deck",
      cue: "Marker stage left, marker stage right, then tape the line between them.",
      why: "An exclusion line that only lives in the operator's head gets walked through by every dancer, stagehand and camera operator on the deck. Taped down, it becomes something everybody working the show can see, and something the stage manager can hold people to.",
    },
    {
      id: "mortar", kind: "select", target: "mortar-mount",
      title: "Check the mount and the angle",
      cue: "Confirm the mortar is bolted to the deck and aimed exactly where the cue sheet calls for.",
      why: "A mortar that shifts between this check and the cue turns every distance you just measured into a distance to somewhere else entirely. It has to stay bolted down and aimed up and away from any spot a person could ever occupy.",
    },
    {
      id: "shunt", kind: "select", target: "line-shunt",
      title: "Confirm the firing line is shunted",
      cue: "Check the line is shorted out at the stage end before anything goes near the mortar.",
      why: "A shunt is simply the two firing conductors tied together, so any stray voltage — a nearby radio, a static discharge, a dimmer leaking current down a shared conduit — has somewhere to go that is not through the match. It stays in place through the entire load-in, and it is the only reason a device can be handled by hand at all.",
    },
    {
      id: "device-load", kind: "drag", target: "pyro-device",
      title: "Load the device",
      cue: "Carry the device from the case and seat it in the mortar.",
      why: "It goes in last, only once the position, the separation and the shunt are all confirmed. Everything up to here is work around an empty tube; everything from here on is work around a live device.",
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
      title: "Sweep it yourself, then take the all-clear",
      cue: "Sweep the fallout area with your own eyes, then take the all-clear over the intercom.",
      why: "Your own eyes come first, the confirmation after. The stage manager can only clear the part of the stage they can actually see; the operator has to clear the whole volume the effect will fill, including the space behind the riser that a front-of-house view never reaches.",
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
      why: "Debris from an effect stays hot after it lands, and a soft good that has caught can take several minutes before it shows. The watch is held at the spot the effect went off, for as long as the house's own policy requires, which is exactly why a smouldering drape gets caught by the person who fired the cue instead of by whoever happens to notice it later.",
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
      why: "The reconciliation is the entire point of this step. A device that is not accounted for at the end of the night is a device left somewhere in a building that is about to be handed off to a completely different crew.",
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
