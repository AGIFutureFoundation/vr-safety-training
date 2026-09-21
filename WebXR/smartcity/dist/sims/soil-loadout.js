import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, deckPlateFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Soil Loadout VR — Environmental Monitoring, station seventy-six.
//
// Excavation and haul-out of contaminated soil from a remediation cell on a
// generic parcel: a former shipyard tract on a bay shoreline, under a
// federal cleanup order. No real site is named and nothing here dramatises
// any one cleanup's history — this is the trade procedure a crew runs on a
// site like that. The excavator does the digging; the laborer directing it
// never sets foot in the swing radius unsignalled, and the load leaving the
// cell is only as safe as the zones it was cut inside of, the dust readings
// taken before the first bucket, and the paperwork that makes it a legal
// shipment instead of dirt in a truck. Station air-monitor.js covers the
// fence-line instruments themselves; here the perimeter monitor is the thing
// the crew has to answer to, not the thing they are placing.

const SL_ACCENT = 0xf0b429;

export const SIM_SOIL_LOADOUT = {
  id: "soil-loadout",
  index: "76",
  domain: "Environmental",
  trade: "Excavation & haul-out crew — IUOE operator, LIUNA hazmat laborer directing, Teamsters driver",
  category: "Environmental Monitoring",
  weather: "wind",
  certification: "IUOE Local 3 operating engineers on the excavator; LIUNA hazmat laborers under OSHA HAZWOPER 40-hour (29 CFR 1910.120) directing the load from the ground; Teamsters drivers with DOT hazmat endorsements hauling it; EPA RCRA hazardous-waste manifest (40 CFR 262); the site's Air Monitoring Plan",
  name: "Soil Loadout",
  title: simTitle("Soil Loadout"),
  tagline: "Excavation and haul-out from a remediation cell: zones set from the wind, dust read clean before the first bucket, a lined and tarped load under a hazardous-waste manifest, and the perimeter alarm that stops everything",
  accent: SL_ACCENT,
  accentCss: "#f0b429",
  parSeconds: 290,
  footprint: 2.5,
  badge: { id: "clean-load", name: "Clean Load", note: "Zones set from the wind, dust read clean before the first bucket, the load lined, tarped and manifested, and the alarm answered the instant it sounded" },

  game: system({
    name: "Load Control",
    currency: "MANIFEST",
    ranks: ["Ground Guide", "Loadout Hand", "Manifest Lead", "Zone Authority", "Load Control Certified"],
    badges: [
      { id: "wind-set", name: "Wind Set", note: "Exclusion zone and corridor taped from the wind reading, first time, in order", test: AWARD.stepClean("zones") },
      { id: "never-through-alarm", name: "Never Through The Alarm", note: "Never kept loading through a dust alarm or waved a load through unchecked", test: AWARD.safe },
      { id: "swing-true", name: "Swing True", note: "Held the bucket's swing inside the safe corridor the whole load", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the loadout", test: AWARD.clean },
      { id: "unbroken-signal", name: "Unbroken Signal", note: "Never broke the swing-path signal", test: AWARD.unbroken },
      { id: "gate-early", name: "Gate Early", note: "Load through the gate inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "load-through-alarm": "You hit continue on the dust monitor while it was alarming, to keep the bucket moving. The monitor is the fence line's only real-time protection from this dig — silencing it while the plume is over the action level just means the people on the other side of that fence are the ones absorbing the difference.",
    "uncovered-haul": "You waved the truck through the gate before the tarp was checked. An untarped load moving at road speed is a dust source with no fence line and no monitor watching it at all — everything the exclusion zone and the corridor were built to contain is now blowing off the back of a moving truck.",
    "operator-blind-signal": "You stepped into the excavator's blind quadrant to give hand signals from what felt like a better angle. The whole reason signals come from a fixed, agreed position is that the operator knows exactly where to look for them — stand somewhere the cab can't see and the operator is swinging a loaded bucket on faith.",
    "manifest-skip": "You let the truck roll for the gate meaning to sign the manifest after. Once that truck is on a public road, the load is being hauled with nothing proving what's in it or where it's legally supposed to go — signing it 'later' is signing it never, from the seat of a truck that's already gone.",
  },

  lateNotes: {
    "water-cannon": "The valve opens the line, but the face doesn't get held wet on this step until the excavator is actually about to make the first cut — running it earlier just spends tank water on ground nobody's digging yet.",
    "manifest-clipboard": "Nothing to sign until the load is tarped and ready to leave the cell — a manifest filled out before the load exists is guessing at a weight and a description nobody has actually checked.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a hold or a track step — a gauge or a turn step resolves in one
  // click, too fast for the fuse to ever catch the learner mid-task.
  interrupts: [
    {
      id: "dust-alarm",
      kind: "Dust alarm",
      after: "direct-load", delay: 4, seconds: 14,
      alert: "The downwind perimeter monitor just alarmed above the action level — the wind has swung and the bucket is still cutting into the face.",
      cue: "Signal the operator to stop the bucket now, before anything else in the Air Monitoring Plan matters.",
      target: "excavator-stop",
      why: "Stop is the first word in the plan's own response for a reason — every second the bucket keeps cutting after an alarm adds more dust to a plume that is already over the line, and nothing else in the response does any good while the source is still running.",
      missNote: "The bucket kept cutting for another two loads while the monitor sat above the action level, and the plume that crossed the fence line during those minutes is not something wetting the face afterward gets back.",
      wrongNote: "Not that — the excavator has to stop first. Everything else in the plan's response waits on the bucket actually being still.",
    },
    {
      id: "early-departure",
      kind: "Early departure",
      after: "decon", delay: 3, seconds: 12,
      alert: "The driver's cab door shuts and the brake lights go dark — he's about to pull through the gate with the manifest still blank on the clipboard.",
      cue: "Get the manifest signed before that truck reaches the gate.",
      target: "manifest-clipboard",
      why: "A truck through the gate with an unsigned manifest is a load nobody can trace if it's stopped for inspection down the road — under RCRA the generator is responsible for that paperwork the moment the load leaves the scale, not whenever it's convenient to fill out.",
      missNote: "The truck cleared the gate with the manifest still blank, and the driver was three miles down the road hauling a load with no paper trail before anyone at the cell noticed it never got signed.",
      wrongNote: "Not that — get to the clipboard and the manifest signed before the truck actually reaches the gate.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the cell",
      cue: "Hi-vis vest and hard hat before you're anywhere near the swing radius.",
      why: "The operator's whole read on where the ground crew is standing depends on actually being able to see them against the dirt and the truck — vest and hardhat are what make a person visible from a cab twelve feet up, not a formality before the interesting part starts.",
    },
    {
      id: "wind-check", kind: "select", target: "wind-vane",
      title: "Read the wind",
      cue: "Check the vane and the anemometer before anything gets marked out.",
      why: "Everything that follows — where the exclusion zone sits, where the contamination-reduction corridor sits, which way the dust off the first bucket is going to travel — is set from this reading, not from where the cell happens to sit relative to the road.",
    },
    {
      id: "zones", kind: "sequence",
      targets: ["ez-perimeter", "crc-perimeter"],
      itemNames: { "ez-perimeter": "exclusion zone tape", "crc-perimeter": "contamination-reduction corridor tape" },
      title: "Set the zones from the wind",
      cue: "Tape the exclusion zone around the cell first, downwind of the reading, then the contamination-reduction corridor between it and clean ground.",
      why: "The exclusion zone is the hot side and has to exist before anyone works inside it; the corridor is the one-way transition a person or a load passes through to get clean, and it only makes sense once the boundary it's transitioning out of is already taped.",
      outOfOrderNote: "The corridor is the transition out of the exclusion zone — taping it before the zone it's supposed to lead out of exists is a corridor to nowhere.",
    },
    {
      id: "dust-baseline", kind: "gauge", target: "dust-monitor",
      title: "Read the perimeter dust monitors",
      cue: "Check both perimeter monitors and commit only inside the pre-work baseline band, before the first bucket.",
      why: "This is the number the whole shift gets measured against. An excavator that starts cutting before the baseline is read has no way to prove an alarm later was the dig and not just wherever the monitors always happened to sit.",
      gauge: {
        label: "PM10 BASELINE", speed: 0.6, green: [0.38, 0.55],
        readout: (t) => `${Math.round(t * 60)} µg/m³`,
        missNote: "That is not a settled baseline — read the monitors again before the excavator ever cuts into the cell.",
      },
    },
    {
      id: "liner", kind: "drag", target: "liner-roll",
      title: "Line the bed",
      cue: "Carry the liner to the truck and lay it into the bed before the first bucket loads.",
      why: "The liner is what keeps this load's own leachate off the truck frame and off the road between here and the disposal facility — a bucket that goes into an unlined bed can't be undone by lining it after the fact.",
      drag: { to: "truck-bed-socket", radius: 0.4, missNote: "Not seated in the bed — a liner bunched at one corner leaves bare steel the load sits directly on." },
    },
    {
      id: "cannon-valve", kind: "turn", target: "cannon-valve",
      title: "Open the water cannon",
      cue: "Turn the valve on the water truck's cannon before the bucket cuts into the face.",
      why: "The face has to already be wetting down when the first cut happens, not after dust is already airborne and moving toward the fence line — opening the valve is the step that comes first, not the one that follows a cloud.",
      turn: { turns: 0.6, axis: "y", label: "CANNON" },
    },
    {
      id: "wet-face", kind: "hold", target: "water-cannon", seconds: 5,
      title: "Wet the work face",
      cue: "Hold the cannon on the face until it's visibly damped down, not just sprayed.",
      why: "A quick pass that wets the surface and nothing underneath dries out again in the time it takes the bucket to swing back — the face needs to actually be damped through before the excavator commits to the first cut.",
      holdBreakNote: "Released the cannon before the face was actually damped — a half-second spray just moves dust around, it doesn't hold it down.",
    },
    {
      id: "direct-load", kind: "track", target: "hand-signals", seconds: 9,
      title: "Direct the load",
      cue: "Signal the operator continuously, keeping the bucket's swing inside the safe corridor clear of the ground crew.",
      why: "The operator's cab has blind spots the ground crew doesn't, which is the entire reason a laborer directs this load instead of the operator eyeballing it alone — continuous signals are what keeps the bucket's swing where the crew actually is, not where the operator assumes they are.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12, label: "SWING PATH",
        readout: (v) => (v < 0.4 ? "drifting toward the crew" : v > 0.62 ? "drifting wide of the truck" : "on the safe corridor"),
      },
      holdBreakNote: "The swing path drifted out of the safe corridor — bring the signal back on line before the bucket swings again.",
    },
    {
      id: "tarp", kind: "drag", target: "tarp-roll",
      title: "Tarp the load",
      cue: "Pull the tarp over the full bed and secure every corner before the truck moves.",
      why: "A loaded bed is a dust source the moment the truck starts moving — the tarp is what keeps this load from becoming its own uncontrolled release the instant it leaves the cell, on a road with no perimeter monitors watching it at all.",
      drag: { to: "truck-load-socket", radius: 0.42, missNote: "Not pulled over the load — a tarp bunched at one end leaves the rest of the bed open to the wind the second the truck moves." },
    },
    {
      id: "manifest", kind: "select", target: "manifest-clipboard",
      title: "Complete the manifest",
      cue: "Fill out and sign the hazardous-waste manifest for this load before the truck reaches the gate.",
      why: "Under RCRA, this load doesn't exist as a legal shipment until the manifest says what's in it, where it came from and where it's going — a truck that leaves without one is just dirt in a bed as far as anyone downstream can prove.",
    },
    {
      id: "decon", kind: "hold", target: "decon-wash", seconds: 5,
      title: "Run the truck through decon",
      cue: "Hold the wheel wash running until the undercarriage and tires run clear.",
      why: "Tracked soil off this cell is exactly what a decon pad exists to stop before it reaches a public road — cutting the wash short means the truck carries the cell out through its tires no matter how well the load itself was tarped.",
      holdBreakNote: "Cut the wash short — the wheels were still running dirty when it stopped. Hold it until they actually run clear.",
    },
    {
      id: "weigh", kind: "select", target: "scale-readout",
      title: "Weigh the load",
      cue: "Confirm the load weight against the manifest and the legal haul limit before the gate opens.",
      why: "A manifest with the wrong weight on it and a truck that's actually over the legal haul limit are two different problems that both start at the scale — reading it here is what catches either one before the truck is out on a public road.",
    },
    {
      id: "walk-check", kind: "find", noHint: true,
      targets: ["tarp-gap"],
      itemNames: { "tarp-gap": "loose tarp corner" },
      itemNotes: { "tarp-gap": "That corner of the tarp isn't cinched down — at road speed it's going to work loose, and the load underneath it is exactly what the tarp was supposed to keep off the highway." },
      title: "Walk the load before the gate",
      cue: "Walk the full truck and click the one thing that's still wrong before it goes through the gate.",
      why: "The tarp step and this walk are different skills — pulling a tarp over a load is not the same as noticing, from the ground, that one corner never actually cinched down. This is the last look before the manifest's promises are out on a public road.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, SL_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 6.0, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.97 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4a3f22", base2: "#3f351d", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.97, metal: 0.02, color: 0xc2b184 },
    );

    // ----------------------------------------------------- remediation cell
    // Cut into a raised apron rather than the ground plane itself, so the
    // excavation reads as a hole rather than a dark smudge — the same
    // treatment trench-box and hot-tap use.
    const APRON = 0.3;
    const apron = group(g, -0.9, 0, -0.3);
    for (const sz of [-1, 1]) {
      box(apron, 2.6, APRON, 0.55, 0, APRON / 2, sz * 1.05, 0x5a4a2a, { rough: 0.97, finish: "concrete", tile: [3, 1] });
    }
    for (const sx of [-1, 1]) {
      box(apron, 0.55, APRON, 1.6, sx * 1.03, APRON / 2, 0, 0x5a4a2a, { rough: 0.97, finish: "concrete", tile: [1, 2] });
    }
    const cellD = 0.55;
    const cell = group(g, -0.9, APRON, -0.3);
    box(cell, 1.9, 0.02, 1.5, 0, -cellD, 0, 0x2f2618, { rough: 0.98, cast: false });
    for (const sx of [-1, 1]) box(cell, 0.06, cellD, 1.5, sx * 0.95, -cellD / 2, 0, 0x453522, { rough: 0.96, cast: false });
    for (const sz of [-1, 1]) box(cell, 1.9, cellD, 0.06, 0, -cellD / 2, sz * 0.75, 0x453522, { rough: 0.96, cast: false });
    holoTag(cell, "remediation cell", 0, 0.35, 0.78, { css: "#f0b429", w: 0.5 });

    // ------------------------------------------------------------ wind vane
    const vane = group(g, -2.0, 0.14, 1.8);
    cyl(vane, 0.02, 0.02, 1.9, 0, 0.95, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    const arrow = group(vane, 0, 1.95, 0, 0.6);
    box(arrow, 0.32, 0.02, 0.02, 0, 0, 0, 0xffffff, { rough: 0.5 });
    box(arrow, 0.09, 0.09, 0.01, 0.14, 0, 0, 0xd2312b, { rough: 0.5 });
    const cups = group(vane, 0, 1.68, 0);
    for (let i = 0; i < 3; i++) { const c = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3); box(c, 0.15, 0.01, 0.01, 0.075, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6 }); ball(c, 0.028, 0.15, 0, 0, 0x22262b, { rough: 0.6 }); }
    holoTag(vane, "wind: onshore, 6 m/s", 0, 1.3, 0.05, { css: "#f0b429", w: 0.42 });
    reg(hits, vane, "wind-vane");

    // -------------------------------------------------------------- zones
    const ezPanels = [];
    for (const [x, z, ry] of [[-2.2, -0.3, Math.PI / 2], [-0.9, 0.55, 0], [0.4, -0.3, Math.PI / 2], [-0.9, -1.15, 0]]) {
      const p = barrierPanel(g, x, z, { ry, w: 1.3, color: SL_ACCENT });
      p.visible = false;
      ezPanels.push(p);
    }
    const ezPost = group(g, -2.2, 0.14, 0.9, 0.4);
    slab(ezPost, 0.3, 0.4, 0.03, 0, 0.7, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(ezPost, 0.26, 0.16, 0, 0.78, 0.017, signFace("EXCLUSION ZONE", { bg: "#2a1a05", accent: "#f0b429", scale: 0.42 }));
    holoTag(ezPost, "exclusion zone tape", 0, 0.95, 0, { css: "#f0b429", w: 0.42 });
    reg(hits, ezPost, "ez-perimeter");
    const crcPanels = [];
    for (const [x, z, ry] of [[1.1, -0.3, Math.PI / 2], [1.7, 0.6, 0], [1.7, -1.2, 0]]) {
      const p = barrierPanel(g, x, z, { ry, w: 1.2, color: 0x6fc3d1 });
      p.visible = false;
      crcPanels.push(p);
    }
    const crcPost = group(g, 1.3, 0.14, 1.1, -0.3);
    slab(crcPost, 0.3, 0.4, 0.03, 0, 0.7, 0, 0x2b2f34, { radius: 0.01, rough: 0.6 });
    decal(crcPost, 0.26, 0.16, 0, 0.78, 0.017, signFace("CRC — DECON CORRIDOR", { bg: "#052225", accent: "#6fc3d1", scale: 0.34 }));
    holoTag(crcPost, "contamination-reduction corridor", 0, 0.95, 0, { css: "#6fc3d1", w: 0.5 });
    reg(hits, crcPost, "crc-perimeter");

    // ------------------------------------------------------------- monitor
    const monitor = group(g, -2.3, 0.14, -1.1);
    box(monitor, 0.34, 0.48, 0.28, 0, 0.44, 0, 0xe8eef2, { rough: 0.5, metal: 0.2 });
    cyl(monitor, 0.03, 0.03, 0.38, 0, 0.87, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
    cyl(monitor, 0.065, 0.045, 0.11, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
    const monScreen = decal(monitor, 0.26, 0.11, 0, 0.53, 0.141, signFace("-- µg/m³", { bg: "#241a05", accent: "#f0b429", fg: "#ffe9bf", scale: 0.6 }), { glow: true, ei: 0.8 });
    holoTag(monitor, "perimeter dust monitor", 0, 0.78, 0.15, { css: "#f0b429", w: 0.48 });
    reg(hits, monitor, "dust-monitor");
    const strobe = ball(monitor, 0.035, 0.11, 0.95, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.2, rough: 0.4 });
    const muteBtn = box(monitor, 0.06, 0.03, 0.02, 0.1, 0.28, 0.15, 0x22262b, { rough: 0.6 });
    decal(muteBtn, 0.055, 0.02, 0, 0, 0.011, signFace("CONTINUE", { bg: "#22262b", accent: "#d2312b", scale: 0.55 }));
    reg(hits, muteBtn, "load-through-alarm");

    // -------------------------------------------------------------- excavator
    const excav = group(g, -1.0, 0.14 + APRON, -1.5, 2.4);
    box(excav, 0.9, 0.4, 0.7, 0, 0.35, 0, 0xe8b02e, { rough: 0.6 });
    cyl(excav, 0.34, 0.34, 0.14, 0, 0.6, 0, 0xe8b02e, { rough: 0.6, seg: 16 });
    const boom = group(excav, 0.1, 0.68, 0, -0.5);
    box(boom, 1.1, 0.15, 0.15, 0.55, 0, 0, 0xe8b02e, { rough: 0.6 });
    const dipper = group(boom, 1.05, 0, 0, 0.9);
    box(dipper, 0.65, 0.12, 0.12, 0.32, 0, 0, 0xe8b02e, { rough: 0.6 });
    const bucket = group(dipper, 0.6, -0.1, 0, 0.6);
    box(bucket, 0.36, 0.22, 0.34, 0, -0.1, 0, 0x2b2f34, { rough: 0.7 });
    for (const sx of [-0.35, 0.35]) box(excav, 1.0, 0.24, 0.18, 0, 0.12, sx, 0x2b2f34, { rough: 0.8 });
    const stopSign = group(excav, 0.35, 0.85, 0.35);
    box(stopSign, 0.16, 0.16, 0.01, 0, 0, 0, 0xd2312b, { rough: 0.6 });
    decal(stopSign, 0.14, 0.14, 0, 0, 0.006, signFace("STOP", { bg: "#7a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(excav, "excavator", 0, 1.15, 0.35, { css: "#f0b429", w: 0.3 });
    reg(hits, stopSign, "excavator-stop");
    // The excavator's blind quadrant, opposite the ground guide's post.
    const blindZone = box(g, 0.5, 0.3, 0.5, -1.55, 0.14 + APRON + 0.16, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "blind quadrant — signal from your post", -1.55, 0.14 + APRON + 0.5, -2.3, { css: "#d2312b", w: 0.62 });
    reg(hits, blindZone, "operator-blind-signal");

    // ------------------------------------------------------------ water truck
    const cannonTruck = group(g, 0.6, 0.14, 1.6, -1.2);
    box(cannonTruck, 1.3, 0.6, 0.85, 0, 0.5, 0, 0x6fa8b8, { rough: 0.55, metal: 0.25 });
    cyl(cannonTruck, 0.32, 0.32, 0.7, 0, 0.9, 0, 0x6fa8b8, { rough: 0.55, metal: 0.25, seg: 18 }).rotation.z = Math.PI / 2;
    const cannonMount = group(cannonTruck, 0.6, 1.0, 0);
    box(cannonMount, 0.16, 0.16, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const cannonWheel = valveWheel(cannonMount, 0.16, 0, 0.1, { r: 0.06, color: SL_ACCENT, body: 0x2b2f34 });
    reg(hits, cannonWheel.userData.wheel, "cannon-valve");
    const nozzle = cyl(cannonMount, 0.02, 0.03, 0.4, 0.4, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.5, seg: 12 });
    nozzle.rotation.z = Math.PI / 2;
    holoTag(cannonTruck, "water cannon", 0.6, 1.2, 0, { css: "#f0b429", w: 0.32 });
    reg(hits, cannonMount, "water-cannon");
    const spray = particles(cannonMount, 60, 0x6fb4d8, { size: 0.025, life: 0.6, additive: false, opacity: 0.65 });

    // ---------------------------------------------------------- haul truck
    const truck = group(g, 1.6, 0.14, -0.3, -0.5);
    box(truck, 0.9, 0.7, 0.75, -0.85, 0.5, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 0.55, 0.06, 0.75, -0.85, 0.86, 0, 0x2b2f34, { rough: 0.7 });
    const bed = group(truck, 0.5, 0, 0);
    box(bed, 1.6, 0.5, 1.0, 0, 0.28, 0, 0x8a939b, { rough: 0.55, metal: 0.35 });
    const bedFloor = box(bed, 1.5, 0.02, 0.9, 0, 0.04, 0, 0x2b2f34, { rough: 0.8, cast: false });
    for (const sx of [-1, 1]) cyl(truck, 0.22, 0.22, 0.22, sx * 1.0, 0.22, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    cyl(truck, 0.22, 0.22, 0.22, -1.55, 0.22, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    const bedSocket = group(bed, 0, 0.05, 0);
    hits["truck-bed-socket"] = bedSocket;
    const loadSocket = group(bed, 0, 0.3, 0);
    hits["truck-load-socket"] = loadSocket;
    // Soil already loaded, mid-scene, so the tarp step has a load to cover.
    const soilLoad = box(bed, 1.35, 0.28, 0.8, 0, 0.24, 0, 0x4a3a24, { rough: 0.95 });
    void soilLoad;
    holoTag(truck, "haul truck", -0.85, 1.0, 0, { css: "#f0b429", w: 0.3 });

    // Liner and tarp, staged on the ground beside the truck.
    const linerRoll = group(g, 1.0, 0.14, -1.0, 0.6);
    cyl(linerRoll, 0.09, 0.09, 0.7, 0, 0.09, 0, 0x2f6f4a, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(linerRoll, "liner roll", 0, 0.28, 0, { css: "#f0b429", w: 0.3 });
    reg(hits, linerRoll, "liner-roll");
    const tarpRoll = group(g, 1.9, 0.14, -1.15, 0.3);
    cyl(tarpRoll, 0.1, 0.1, 0.8, 0, 0.1, 0, 0x2b3138, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(tarpRoll, "tarp roll", 0, 0.3, 0, { css: "#f0b429", w: 0.28 });
    reg(hits, tarpRoll, "tarp-roll");
    // The loose corner the walk-check has to find, once the tarp is on.
    const tarpMesh = box(bed, 1.4, 0.03, 0.85, 0, 0.42, 0, 0x2b3138, { rough: 0.7, cast: false });
    tarpMesh.visible = false;
    const tarpGap = box(bed, 0.18, 0.03, 0.14, 0.62, 0.44, 0.36, 0x2b3138, { rough: 0.7, cast: false });
    tarpGap.visible = false;
    reg(hits, tarpGap, "tarp-gap");

    // ---------------------------------------------------------------- gate
    const gate = group(g, 2.2, 0.14, 1.6, -0.4);
    for (const sx of [-0.5, 0.5]) cyl(gate, 0.05, 0.05, 1.4, sx, 0.7, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    box(gate, 1.1, 0.05, 0.05, 0, 1.3, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const clipboard = group(gate, -0.3, 0, 0.3, 0.5);
    box(clipboard, 0.14, 0.005, 0.2, 0, 0.75, 0, 0xf3efe4, { rough: 0.9 });
    decal(clipboard, 0.12, 0.18, 0, 0.753, 0, signFace("MANIFEST", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(clipboard, "manifest", 0, 0.86, 0, { css: "#f0b429", w: 0.28 });
    reg(hits, clipboard, "manifest-clipboard");
    const waveLever = group(gate, 0.35, 0, 0.35, -0.3);
    box(waveLever, 0.04, 0.3, 0.04, 0, 0.75, 0, 0xd2312b, { rough: 0.55 });
    decal(waveLever, 0.16, 0.05, 0, 0.92, 0, signFace("WAVE THROUGH", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }));
    reg(hits, waveLever, "uncovered-haul");
    const stamp = group(gate, 0.5, 0, 0.55, 0.4);
    cyl(stamp, 0.05, 0.05, 0.09, 0, 0.75, 0, 0x2f3740, { rough: 0.55, seg: 14 });
    decal(stamp, 0.09, 0.03, 0, 0.8, 0, signFace("APPROVED — GO", { bg: "#1b1e22", accent: "#f0b429", scale: 0.4 }));
    reg(hits, stamp, "manifest-skip");

    // ------------------------------------------------------- decon + scale
    const decon = group(g, 0.6, 0.14, 2.0, -0.2);
    const deconPad = box(decon, 1.3, 0.02, 1.0, 0, 0.011, 0, 0xffffff, { rough: 0.55, metal: 0.35, cast: false });
    deconPad.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 8, px: 256 }),
      { rough: 0.5, metal: 0.5, color: 0xc7ccd1 },
    );
    for (const sx of [-0.5, 0.5]) cyl(decon, 0.03, 0.03, 0.9, sx, 0.3, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(decon, "decon wheel wash", 0, 0.55, 0, { css: "#f0b429", w: 0.4 });
    reg(hits, decon, "decon-wash");
    const washSpray = particles(decon, 30, 0x6fb4d8, { size: 0.02, life: 0.4, additive: false, opacity: 0.6 });

    const scale = group(g, 0.6, 0.14, 2.6, 0.3);
    slab(scale, 1.0, 0.06, 0.7, 0, 0.03, 0, 0x2b2f34, { radius: 0.02, rough: 0.55, metal: 0.4 });
    const scaleReadout = instrument(scale, 0, 0.36, -0.4, { idle: "-- lb", color: SL_ACCENT, w: 0.16, d: 0.2 });
    holoTag(scaleReadout, "scale readout", 0, 0.16, 0, { css: "#f0b429", w: 0.32 });
    reg(hits, scaleReadout, "scale-readout");

    // ------------------------------------------------------------- ground crew
    const guide = standingFigure(g, -1.75, -0.9, { atStation: true, ry: 1.0, cloth: 0x2b3138, vest: SL_ACCENT, helmet: 0xf2f2f2 });
    holoTag(guide, "ground guide's post", 0, 1.95, 0.15, { css: "#f0b429", w: 0.4 });
    reg(hits, guide, "hand-signals");
    const ppeRack = group(g, -1.6, 0.14, 1.5, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, SL_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#f0b429", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#f0b429", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    cone(g, -2.4, -1.9, { color: SL_ACCENT }); cone(g, 2.4, 2.4, { color: SL_ACCENT });
    toolChest(g, 2.4, -1.5, { ry: -0.6, color: 0x8a5a1a });
    const dust = particles(g, 40, 0xc9b99a, { size: 0.03, life: 1.0, additive: false, opacity: 0.32 });
    standingFigure(g, 2.6, -0.65, { ry: -2.2, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });

    // -------------------------------------------------------------- live state
    let alarming = false, driverLeaving = false, tarped = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "zones") ezPanels.concat(crcPanels).forEach((p) => { p.visible = true; });
        if (step.id === "liner") { linerRoll.parent.remove(linerRoll); bedSocket.add(linerRoll); linerRoll.position.set(0, 0.02, 0); linerRoll.rotation.set(0, 0, Math.PI / 2); linerRoll.scale.set(1.6, 1, 1.05); }
        if (step.id === "wet-face") repaint(monScreen, signFace("FACE WET", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.45 }));
        if (step.id === "tarp") {
          tarped = true; tarpMesh.visible = true;
          tarpRoll.parent.remove(tarpRoll); loadSocket.add(tarpRoll); tarpRoll.visible = false;
          tarpGap.visible = true;
        }
        if (step.id === "decon") repaint(monScreen, signFace("CLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        if (step.id === "weigh") repaint(scaleReadout.userData.screen, signFace("41,200 lb", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "walk-check") tarpGap.visible = false;
      },
      onInterrupt(it) {
        if (it.id === "dust-alarm") {
          alarming = true;
          strobe.material.emissiveIntensity = 2.4;
          repaint(monScreen, signFace("184 µg/m³ !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.5 }));
        }
        if (it.id === "early-departure") { driverLeaving = true; truck.position.x += 0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "dust-alarm") {
          alarming = false;
          strobe.material.emissiveIntensity = 0.2;
          repaint(monScreen, signFace("31 µg/m³", { bg: "#241a05", accent: "#f0b429", fg: "#ffe9bf", scale: 0.6 }));
        }
        if (it.id === "early-departure") { driverLeaving = false; truck.position.x -= 0.6; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        cups.rotation.y += dt * 2.6;
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(-1.0, 0.5, -0.3), 1.0, 0.4, 0.15);
        if (alarming) strobe.material.emissiveIntensity = Math.floor(t * 4) % 2 === 0 ? 2.4 : 0.2;
        else strobe.material.emissiveIntensity = 0.2;
        if (step?.id === "wet-face" && session.holding) {
          spray.visible = true; spray.userData.step(dt, new THREE.Vector3(1.0, -0.2, 0), 0.15, 1.6, -2.5);
        } else spray.visible = false;
        if (step?.id === "decon" && session.holding) {
          washSpray.visible = true; washSpray.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.1, 0.9, -1.0);
        } else washSpray.visible = false;
        if (!tarped) { boom.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.15; dipper.rotation.y = 0.9 + Math.sin(t * 0.6) * 0.1; }
        void driverLeaving;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "dust-baseline") {
          repaint(monScreen, signFace(`${Math.round(gg.t * 60)} µg/m³`, {
            bg: "#241a05", accent: gg.t >= 0.38 && gg.t <= 0.55 ? "#59c97b" : "#f2ae14", fg: "#ffe9bf", scale: 0.6,
          }));
        }
        if (session?.turn && step?.id === "cannon-valve") {
          cannonWheel.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
