import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, instrument, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Neighbourhood Air Sensor VR — Community Environmental
// Justice, Hunters Point Edition.
//
// A community environmental monitor mounts a low-cost PM2.5 sensor on a
// resident's home for a neighbourhood air-monitoring network: siting by the
// network's own rules, a weatherproof mount and power run, a Wi-Fi pairing,
// a first reading proven against a handheld reference, a site record with
// photo and GPS, and the resident shown how to read their own number.
//
// Sited generically at a house on a residential block near a fenced
// cleanup site; no real address, resident or sensor make is named or
// implied — see the note against writing a model name anywhere in this
// edition.

const AIN_ACCENT = 0x6fd48a;

export const SIM_AIR_SENSOR_INSTALL = {
  id: "air-sensor-install",
  index: "147",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "Community science under the network's own siting and QA practice, drawn from EPA's low-cost air sensor siting guidance; OSHA 29 CFR 1910.23 ladder safety and NIOSH's ladder-safety guidance for the physical install; the Bay Area Air Quality Management District's Community Advisory Council process; consent for anything logged to a resident's home modelled on the standard in 45 CFR 46",
  name: "Neighbourhood Air Sensor",
  title: simTitle("Neighbourhood Air Sensor"),
  tagline: "A resident's own PM2.5 sensor: sited by the network's rules, mounted, wired, paired, proven against a handheld before it counts, logged with photo and GPS, and handed back to the resident who owns it",
  accent: AIN_ACCENT,
  accentCss: "#6fd48a",
  parSeconds: 260,
  footprint: 2.4,
  badge: { id: "network-node-proven", name: "Network Node Proven", note: "A sensor sited by the rules, consented to by the resident who hosts it, and proven against a handheld before it ever reports a number" },

  game: system({
    name: "Neighbourhood Network",
    currency: "READING",
    ranks: ["Trainee Installer", "Network Installer", "Site Steward", "QA Lead", "Neighbourhood Network Certified"],
    badges: [
      { id: "consented-first", name: "Consented First", note: "Got the resident's consent before anything went on the wall", test: AWARD.stepClean("consent") },
      { id: "never-unverified", name: "Never Unverified", note: "Never published a reading that had not been checked against the handheld", test: AWARD.safe },
      { id: "signal-true", name: "Signal True", note: "Held the Wi-Fi pairing inside its band on the first try", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-install", name: "Clean Install", note: "No corrections through the whole install", test: AWARD.clean },
      { id: "ladder-held", name: "Ladder Held", note: "Never let the ladder go unfooted", test: AWARD.unbroken },
      { id: "one-visit", name: "One Visit", note: "Sited, mounted, proven and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "vent-mount": "You marked the bracket position right beside the kitchen exhaust vent. Every time this household cooks, the sensor will read the frying pan instead of the block, and a network node that spikes on schedule with dinner gets learned as noise by everyone who looks at the public map — including the times it is right.",
    "grill-mount": "You marked the bracket directly over the barbecue. Charcoal and lighter fluid smoke will swamp this unit's readings on the one occasion a year the block actually cooks outside, and a sensor whose worst readings are always explainable by a neighbour's dinner is a sensor the network learns to discount.",
    "skip-drip-loop": "You ran the power cable straight into the enclosure with no drip loop. Water follows the cable down to the lowest point before it lets go, and without a loop that point is the enclosure's own seal — the first hard rain after this install finds the electronics, not the ground.",
    "unverified-reading": "You published the sensor's first reading without checking it against the handheld. A brand-new unit that reads high or low by a wide margin looks like real air on the public map until somebody notices the whole block trusts it, and the fifteen minutes a handheld comparison takes is what stands between an honest number and a bad one nobody catches for months.",
  },

  lateNotes: {
    "wifi-pairing": "Nothing to pair with the network until the unit has power — connect the weatherproof supply first.",
    "compare-chart": "There is no reading to compare yet. Take the handheld measurement before you judge the sensor against it.",
    "log-camera": "Log the site once the reading is proven, not before — a photo and GPS point for an unverified number is a record of nothing.",
  },

  interrupts: [
    {
      id: "leaf-blower",
      kind: "Unrelated dust source",
      after: "handheld-reading", delay: 3, seconds: 13,
      alert: "The resident's neighbour has started a leaf blower right under the sensor while the comparison test is running.",
      cue: "A cloud of dust and debris is being blown straight past the inlet mid-test.",
      target: "flag-reading",
      why: "A leaf blower a few metres from an optical particle counter throws a spike into the reading that has nothing to do with the neighbourhood's air, and it will land squarely inside the window this comparison is supposed to prove the sensor true against. Flagging the affected minutes on the record is what keeps that spike from being read later as either a passed or a failed calibration check — it is neither, and the log has to say so.",
      missNote: "The comparison ran straight through the leaf blower with nothing noted. Whoever reviews this install later sees a reading that does not match the handheld and has no way to know it was a lawnmower-grade dust cloud and not the sensor lying — the first honest explanation for a bad number is the one that never got written down.",
      wrongNote: "That does not flag the reading. The dust is coming from the leaf blower, not from the comparison chart itself — mark the affected minutes at the flag.",
    },
    {
      id: "ladder-slip",
      kind: "Ladder foot slipped",
      after: "ladder-footing", delay: 3, seconds: 12,
      alert: "The ladder's downhill foot has skated on the wet step while you are up mounting the bracket.",
      cue: "The ladder just shifted under you on the wet step below it.",
      target: "spotter-brace",
      why: "A ladder set on a rain-slick step has almost no friction to fall back on the instant its own base shifts, and by the time the wobble reaches the rungs the person on it has no free hand to catch the fall — the foot has to be held by someone standing at the base, not fixed by the person already sixteen rungs up. Calling the spotter over to brace the feet is the only response that reaches the actual point of failure before the ladder does.",
      missNote: "Nobody came to brace the feet, and the ladder kept walking on the wet step through the rest of the mount. A slipped ladder with a technician still on it is exactly the fall OSHA's ladder-safety standard exists to prevent, and it was one bystander away from being answered the whole time.",
      wrongNote: "That does not steady the ladder. The feet are slipping at the base — get the spotter's hands on the rails down there, not up at the bracket.",
    },
  ],

  steps: [
    {
      id: "consent", kind: "select", target: "consent-panel",
      title: "Get the resident's consent to host and log the site",
      cue: "Read the consent card with the resident before the ladder comes off the truck.",
      why: "Everything that follows — a bracket screwed to their wall, a cable run across their siding, a photo and GPS point of their own home going onto a public map — happens on this resident's property and in their name. Explaining that plainly, in a language they are comfortable in, and getting their yes before the first tool comes out is what keeps a neighbourhood network from being one more thing installed on a block instead of agreed to by it.",
    },
    {
      id: "siting-rules", kind: "select", target: "siting-card",
      title: "Read the network's siting rules",
      cue: "Check the height, clearance and placement rules before you pick a spot on the wall.",
      why: "The network's siting card sets a consistent height across every host site, a clearance from any exhaust or heat source, and a minimum distance off the wall's own surface — rules written so that a reading from this house means the same thing as a reading from the next one over. A technician who skips the card and eyeballs a spot is deciding, alone, to make this node incomparable to the other nine before a single bolt goes in.",
    },
    {
      id: "site-check", kind: "sequence", anyOrder: true,
      targets: ["clear-of-vent", "clear-of-grill", "clear-of-wall-heat", "height-mark"],
      itemNames: {
        "clear-of-vent": "clear of the kitchen exhaust vent",
        "clear-of-grill": "clear of the barbecue",
        "clear-of-wall-heat": "clear of the wall's own radiant heat",
        "height-mark": "the network's standard mounting height",
      },
      itemNotes: {
        "clear-of-vent": "A kitchen vent puts cooking exhaust straight into the intake of anything mounted too close to it, and that is not the neighbourhood's air.",
        "clear-of-grill": "Charcoal smoke a few feet away reads exactly like a pollution event to a sensor that cannot tell the difference.",
        "clear-of-wall-heat": "A dark wall in full sun runs hotter than the air around it, and a sensor pinned against it reads its own housing more than the block.",
        "height-mark": "Every node in this network is set at the same height so a reading here means the same thing as a reading from any other host's roofline.",
      },
      title: "Walk the wall and confirm the siting rules",
      cue: "Check clearance from the vent, the grill and the wall's own heat, and mark the mounting height — any order.",
      why: "Each of these four checks defeats a different way the mount could end up reading something other than the neighbourhood's air: cooking exhaust, grill smoke, a wall's own stored heat, or simply sitting at a height nobody else in the network shares. Skipping any one of them does not make the sensor lie outright — it makes it quietly describe this one wall instead of the block, which is a harder mistake to catch later than an outright failure would be.",
    },
    {
      id: "ladder-footing", kind: "select", target: "ladder-feet",
      title: "Set the ladder on stable, level footing",
      cue: "Check both feet are square and solid before you put a hand on the rails.",
      why: "The steps below the mounting point are wet, and a ladder foot resting on a wet, uneven edge has nothing to grip the instant weight shifts onto it from above. Setting the feet square on the most stable ground available, before the first rung is climbed, is the only point in this job where the ladder's footing can still be fixed by looking at it rather than by reacting to it moving.",
    },
    {
      id: "mount-bracket", kind: "turn", target: "bracket-bolts",
      title: "Drive the mounting bracket to the wall",
      cue: "Turn the bracket bolts down until the mount sits flush and solid against the siding.",
      why: "A bracket that is not driven fully home will work loose the first time wind gets under the sensor housing, and a sensor that has shifted even a few degrees off the wall no longer sits at the height or the clearance the siting rules just confirmed. The bolts are what turn today's correct siting decision into something that is still true a year from now.",
      turn: { turns: 0.6, axis: "y", label: "BRACKET BOLTS" },
    },
    {
      id: "inlet-check", kind: "find", noHint: true,
      targets: ["inlet-web"],
      itemNames: { "inlet-web": "spider web across the inlet" },
      itemNotes: { "inlet-web": "A web spun across a new unit's inlet screen while it sat in the truck bed will read as a permanent, artificially low bias the moment the sensor is powered on — it has to come off before the first reading means anything." },
      title: "Check the inlet before power-up",
      cue: "Look over the new unit's inlet screen and clear anything blocking it.",
      why: "A brand-new sensor has never run yet, so nothing in its own record can tell you the inlet is clear — that has to be checked by eye, once, before the first reading is ever taken. A blocked inlet does not throw an error; it just reads low forever, in the one direction a community network can least afford to be wrong in.",
    },
    {
      id: "weatherproof-power", kind: "sequence", anyOrder: true,
      targets: ["power-cable", "weather-cover", "drip-loop"],
      itemNames: { "power-cable": "connect the power cable", "weather-cover": "close the weatherproof cover", "drip-loop": "form the drip loop" },
      itemNotes: {
        "power-cable": "The low-voltage supply that keeps this unit reporting through the winter, not just the dry season.",
        "weather-cover": "The gasketed cover is what keeps the connection dry once the drip loop has done its job.",
        "drip-loop": "A dip in the cable below the enclosure gives rainwater a low point to drop off at, ahead of the seal rather than at it.",
      },
      title: "Run weatherproof power to the unit",
      cue: "Connect the cable, form the drip loop, then close the weatherproof cover — any order, but all three before the unit is left alone.",
      why: "A residential install has to survive being ignored for years at a time between visits, through every rainstorm the neighbourhood gets, and the only thing standing between the electronics and that weather is a properly sealed, properly looped supply run. A network node that fails wet is a gap in the map exactly when a storm is the thing residents most want a reading on.",
    },
    {
      id: "power-warmup", kind: "hold", target: "power-switch", seconds: 5,
      title: "Power on and let the sensor's fan settle",
      cue: "Hold the power switch until the internal fan spins up clean and steady.",
      why: "The optical counter inside a low-cost sensor needs its fan drawing a steady flow before any particle count it reports is meaningful, and that draw takes a few seconds to settle after power first hits the board. A reading taken while the fan is still ramping is not wrong in a way that shows up on the screen — it is a number from an instrument that has not finished waking up.",
      holdBreakNote: "You let go before the fan settled. A count taken during spin-up is not a low reading or a high one, it is one taken before the instrument was actually ready to measure anything.",
    },
    {
      id: "wifi-pairing", kind: "gauge", target: "wifi-pairing",
      title: "Pair the unit to the resident's Wi-Fi",
      cue: "Bring the signal strength into the green band and commit the pairing.",
      why: "A sensor that pairs on a weak signal will report for a week and then start dropping out the first time the resident's router gets busy, and a gap in the record reads to the network exactly like an outage nobody can diagnose remotely. Committing the pairing only once the signal is solidly in range is what keeps this node reporting through an ordinary evening of somebody else in the house streaming video.",
      gauge: {
        label: "SIGNAL", speed: 0.7, green: [0.55, 0.75],
        readout: (t) => `${Math.round(t * 100)}%`,
        missNote: "That signal is too weak to commit. A pairing made on a marginal signal is a node that goes quiet the first busy evening in this house.",
      },
    },
    {
      id: "handheld-reading", kind: "select", target: "handheld-meter",
      title: "Take a reading with the handheld reference meter",
      cue: "Read the handheld unit at the same spot before you trust the new sensor's number.",
      why: "The handheld reference is the only instrument on this job whose accuracy is not the thing being tested, which makes it the one number the new sensor's first reading actually has to answer to. Taking it now, at the same place and the same moment, is what turns the comparison that follows into an actual check instead of two numbers nobody can relate to each other.",
    },
    {
      id: "first-reading-check", kind: "track", target: "compare-chart", seconds: 8,
      title: "Track the sensor against the handheld",
      cue: "Watch the new unit's reading and keep it tracking close to the handheld's number.",
      why: "A single instant of agreement between the two instruments proves very little; watching them track together for a stretch is what shows the new sensor is actually responding to the same air the handheld is, not just coincidentally near the same number once. This is the last thing standing between an installed sensor and a sensor the neighbourhood can trust its own map to.",
      holdBreakNote: "You looked away before the comparison ran its course. A sensor that matched the handheld for a few seconds and then drifted needs exactly the attention a broken-off comparison never gave it.",
      track: {
        label: "PM2.5", green: [0.4, 0.62], rise: 0.42, fall: 0.38, drift: 0.12,
        readout: (v) => `${(v * 40).toFixed(1)} µg/m³`,
      },
    },
    {
      id: "site-log", kind: "select", target: "log-camera",
      title: "Log the site with a photo and GPS point",
      cue: "Photograph the finished mount and record its GPS coordinates in the site log.",
      why: "The photo is what lets the next technician who visits this house, months or years from now, confirm the sensor is still mounted the way it was sited, and the GPS point is what puts this reading on the public map at the right address rather than an approximate one. A network is only as trustworthy as the record of where each of its readings actually comes from.",
    },
    {
      id: "resident-readout", kind: "select", target: "resident-panel",
      title: "Show the resident how to read their own sensor",
      cue: "Walk the resident through the dashboard so they can check their own reading any time.",
      why: "The point of hosting a sensor is that the resident gets their own record of what they breathe, not that a technician visits once and leaves a box on the wall. A resident who can read the dashboard themselves is the difference between a network node and a decoration, and it is the last thing that makes this install actually theirs.",
    },
    {
      id: "sign-off", kind: "select", target: "sign-pad",
      title: "Sign the install record",
      cue: "Sign and date the completed install log with the resident.",
      why: "The signed record is what lets the network, the next technician and the resident themselves all agree on what was actually done at this address and when — the siting, the calibration check, the consent given. An install nobody signed for is a sensor on a wall with no account of whether it was ever done right.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, AIN_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 5.8, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2c332a", base2: "#242a22", seam: "rgba(0,0,0,0.35)" }), { repeat: 5, px: 512 }),
      { rough: 0.92, metal: 0.02, color: 0xc3cdb9 },
    );
    // A grass strip along the fence side.
    const grassMesh = box(g, 1.6, 0.02, 5.4, 2.4, 0.145, 0, 0xffffff, { rough: 0.95, cast: false });
    grassMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => { cx.fillStyle = "#31431f"; cx.fillRect(0, 0, w, h);
        cx.fillStyle = "rgba(90,120,50,0.4)"; for (let i = 0; i < 600; i++) { const x = Math.random() * w, y = Math.random() * h; cx.fillRect(x, y, 2, 6); } },
        { repeat: 3, px: 256 }),
      { rough: 0.98, metal: 0, color: 0xb8c3a4 },
    );

    // ------------------------------------------------------------- house wall
    const WALL_X = -1.9, WALL_Z = -1.5;
    const wall = group(g, WALL_X, 0, WALL_Z);
    box(wall, 0.2, 3.0, 5.2, 0, 1.5, 0, 0xd9cbb2, { rough: 0.92 });
    box(wall, 0.05, 3.05, 5.25, 0.1, 1.5, 0, 0x8a7a5c, { rough: 0.85 });
    // Kitchen window, high on the wall.
    box(wall, 0.03, 0.7, 0.9, 0.12, 2.1, -1.7, 0x2c3438, { rough: 0.3, metal: 0.3, opacity: 0.75, transparent: true });
    box(wall, 0.06, 0.76, 0.96, 0.13, 2.1, -1.7, 0x6d5a43, { rough: 0.7 });

    // Kitchen exhaust vent, low on the wall — the hazard the siting rule warns off.
    const vent = group(wall, 0.12, 1.55, -1.15);
    cyl(vent, 0.11, 0.11, 0.08, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) box(vent, 0.02, 0.16, 0.01, 0.05, 0, -0.06 + i * 0.04, 0x3c444c, { rough: 0.5 });
    holoTag(vent, "kitchen vent", 0, 0.25, 0, { css: "#f0645b", w: 0.32 });
    const ventSmoke = particles(vent, 22, 0xcfd6d2, { size: 0.03, life: 0.9, additive: false, opacity: 0.35 });
    const ventTrap = box(wall, 0.5, 0.5, 0.5, 0.3, 1.55, -1.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ventTrap, "vent-mount");

    // Correct mounting bracket, roughly one metre from the vent and at the
    // network's standard height.
    const mountX = 0.12, mountY = 1.62, mountZ = -0.05;
    const bracketBase = group(wall, mountX, mountY, mountZ);
    box(bracketBase, 0.05, 0.22, 0.16, 0, 0, 0, 0x3c444c, { rough: 0.5, metal: 0.5 });
    const bolt1 = cyl(bracketBase, 0.012, 0.012, 0.06, 0.02, 0.07, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    bolt1.rotation.z = Math.PI / 2;
    const bolt2 = cyl(bracketBase, 0.012, 0.012, 0.06, 0.02, -0.07, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    bolt2.rotation.z = Math.PI / 2;
    holoTag(bracketBase, "Bracket bolts", 0, 0.22, 0, { css: "#6fd48a", w: 0.36 });
    reg(hits, bracketBase, "bracket-bolts");

    // The sensor unit itself, sitting on the bracket once mounted.
    const sensorUnit = group(bracketBase, 0.07, 0, 0);
    box(sensorUnit, 0.16, 0.22, 0.14, 0, 0, 0, 0xf2f4f5, { rough: 0.5, metal: 0.15, finish: "painted" });
    const inlet = cyl(sensorUnit, 0.035, 0.03, 0.03, 0, 0.05, 0.075, 0x2b2f34, { rough: 0.6, seg: 14 });
    inlet.rotation.x = Math.PI / 2;
    const inletWeb = decal(sensorUnit, 0.07, 0.07, 0, 0.05, 0.09, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "rgba(230,235,235,0.7)"; cx.lineWidth = Math.max(1, w * 0.01);
      for (let i = 0; i < 5; i++) { cx.beginPath(); cx.moveTo(w / 2, h / 2); cx.lineTo(w / 2 + Math.cos(i * 1.26) * w * 0.42, h / 2 + Math.sin(i * 1.26) * h * 0.42); cx.stroke(); }
      for (let r = 6; r < w * 0.4; r += 8) { cx.beginPath(); cx.arc(w / 2, h / 2, r, 0, Math.PI * 2); cx.stroke(); }
    }, { px: 128, transparent: true, cast: false });
    reg(hits, inletWeb, "inlet-web");
    const sensorScreen = decal(sensorUnit, 0.12, 0.06, 0, -0.03, 0.071, signFace("-- µg/m³", { bg: "#0d1c24", accent: "#6fd48a", fg: "#bfeaf7", scale: 0.6 }), { glow: true, ei: 0.85, px: 256 });
    const powerSwitch = box(sensorUnit, 0.03, 0.02, 0.01, -0.06, -0.09, 0.071, 0x22262b, { rough: 0.6 });
    reg(hits, powerSwitch, "power-switch");
    const antennaBase = cyl(sensorUnit, 0.006, 0.006, 0.08, 0.06, 0.15, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    void antennaBase;
    const wifiBall = ball(sensorUnit, 0.012, 0.06, 0.19, 0, AIN_ACCENT, { emissive: AIN_ACCENT, ei: 0.4, rough: 0.4 });
    reg(hits, wifiBall, "wifi-pairing");

    // Weatherproof power run from a low junction box.
    const junction = group(wall, 0.12, 0.5, -0.05);
    box(junction, 0.14, 0.12, 0.08, 0, 0, 0, 0x6f7a83, { rough: 0.5, metal: 0.4 });
    const cablePlug = box(junction, 0.03, 0.03, 0.03, 0, -0.02, 0.06, 0xd2312b, { rough: 0.5 });
    reg(hits, cablePlug, "power-cable");
    const cover = box(junction, 0.16, 0.14, 0.02, 0, 0.09, 0.05, 0xdfe4e8, { rough: 0.4, metal: 0.3, opacity: 0.001, transparent: true, cast: false });
    reg(hits, cover, "weather-cover");
    // The correctly looped cable, sagging down before it rises back up.
    const loopA = { x: mountX - 0.02, y: mountY - 0.15, z: mountZ + 0.02 };
    const loopMid = { x: mountX - 0.02, y: 0.85, z: mountZ + 0.05 };
    const loopB = { x: 0.12, y: 0.56, z: -0.02 };
    for (const [a, b] of [[loopA, loopMid], [loopMid, loopB]]) {
      cyl(wall, 0.012, 0.012, Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0x22262b, { rough: 0.7, seg: 8 })
        .lookAt(new THREE.Vector3(b.x, b.y, b.z));
    }
    const dripLoopBall = ball(wall, 0.02, loopMid.x, loopMid.y, loopMid.z, 0x22262b, { rough: 0.6 });
    reg(hits, dripLoopBall, "drip-loop");
    // The decoy: a cable run straight down with no loop at all.
    const straightRun = cyl(wall, 0.012, 0.012, 0.9, 0.3, 1.15, -0.05, 0x22262b, { rough: 0.7, seg: 8, opacity: 0.001, transparent: true, cast: false });
    reg(hits, straightRun, "skip-drip-loop");

    // ------------------------------------------------------------- steps and ladder
    const stepsGroup = group(g, -0.9, 0, 0.6);
    for (let i = 0; i < 2; i++) {
      box(stepsGroup, 1.1, 0.16, 0.5, 0, 0.08 + i * 0.16, -i * 0.4, 0x8a8578, { rough: 0.9, finish: "concrete" });
    }
    const puddle = decal(stepsGroup, 0.7, 0.3, -0.1, 0.171, -0.05, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(120,160,180,0.35)"; cx.beginPath(); cx.ellipse(w / 2, h / 2, w * 0.4, h * 0.32, 0, 0, Math.PI * 2); cx.fill();
    }, { px: 128, transparent: true, cast: false });
    puddle.rotation.x = -Math.PI / 2;
    void puddle;

    const ladder = group(g, -1.55, 0, 0.35, 0.5);
    const ladderFeet = group(ladder, 0, 0, 0);
    for (const sx of [-0.18, 0.18]) box(ladderFeet, 0.05, 0.04, 0.08, sx, 0.02, 0, 0x3c444c, { rough: 0.7, metal: 0.4 });
    reg(hits, ladderFeet, "ladder-feet");
    for (const sx of [-0.18, 0.18]) cyl(ladder, 0.018, 0.014, 2.6, sx, 1.3, 0, 0xd9a441, { rough: 0.5, metal: 0.4, seg: 10 });
    for (let i = 0; i < 8; i++) box(ladder, 0.34, 0.02, 0.03, 0, 0.22 + i * 0.3, 0, 0xd9a441, { rough: 0.5, metal: 0.4 });
    ladder.rotation.x = -0.16;

    const spotter = standingFigure(g, -1.8, 1.4, { ry: 1.5, cloth: 0x37505f, vest: 0x6fd48a, helmet: 0xf2f2f2 });
    spotter.visible = false;
    const spotterMark = box(g, 0.3, 0.4, 0.3, -1.6, 0.5, 0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, spotterMark, "spotter-brace");
    holoTag(spotterMark, "Spotter — brace the feet", 0, 0.6, 0, { css: "#f0645b", w: 0.5 });

    // ------------------------------------------------------------ patio + grill
    const grill = group(g, 1.7, 0, -1.5, -0.4);
    cyl(grill, 0.32, 0.32, 0.32, 0, 0.75, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 20 });
    cyl(grill, 0.34, 0.34, 0.05, 0, 0.93, 0, 0x1b1e22, { rough: 0.6, seg: 20 });
    for (const sx of [-0.2, 0.2]) for (const sz of [-0.2, 0.2]) cyl(grill, 0.02, 0.02, 0.6, sx, 0.3, sz, 0x22262b, { rough: 0.6, metal: 0.5, seg: 8 });
    holoTag(grill, "Barbecue", 0, 1.0, 0, { css: "#f0645b", w: 0.3 });
    const grillTrap = box(g, 0.9, 0.5, 0.9, 1.4, 0.6, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, grillTrap, "grill-mount");

    // Wall-heat marker: a sun-baked dark patch further along the same wall.
    const heatMark = box(wall, 0.4, 0.4, 0.02, 0.11, 1.9, 1.4, 0xb85c3a, { rough: 0.95, opacity: 0.35, transparent: true, cast: false });
    holoTag(heatMark, "Wall runs hot in full sun", 0, 0.35, 0, { css: "#f2c14b", w: 0.5 });
    reg(hits, heatMark, "clear-of-wall-heat");
    const ventCheckMark = holoTag(wall, "Checked — clear of vent", 0.12, 1.9, -1.15, { css: "#6fd48a", w: 0.5 });
    reg(hits, ventCheckMark, "clear-of-vent");
    const grillCheckMark = holoTag(g, "Checked — clear of grill", 1.7, 1.55, -1.5, { css: "#6fd48a", w: 0.5 });
    reg(hits, grillCheckMark, "clear-of-grill");
    const heightMark = box(wall, 0.5, 0.01, 0.01, 0.12, 1.62, -0.55, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(heightMark, "Standard height", 0, 0.08, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, heightMark, "height-mark");

    // ------------------------------------------------------------- boards
    const consentPost = group(g, -0.4, 0, 1.8, -0.3);
    cyl(consentPost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const consentPanel = holoPanel(consentPost, 0.56, 0.42, 0, 1.2, 0, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fd48a"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e2f6e8";
      cx.fillText("HOST CONSENT", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.076)}px Arial, sans-serif`; cx.fillStyle = "#eef9f1";
      ["Site logged: photo + GPS, public map", "You may decline or remove any time",
       "Explained in the resident's language"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.34 + i * 0.15)));
    }, { accent: AIN_ACCENT });
    reg(hits, consentPanel, "consent-panel");

    const sitingPost = group(g, -0.4, 0, -1.9, 0.3);
    cyl(sitingPost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const sitingPanel = holoPanel(sitingPost, 0.56, 0.42, 0, 1.2, 0, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fd48a"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e2f6e8";
      cx.fillText("NETWORK SITING RULES", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.076)}px Arial, sans-serif`; cx.fillStyle = "#eef9f1";
      ["Height: network standard, every host", "Clear of vents, grills, wall heat",
       "10 ft min from any exhaust source"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.34 + i * 0.15)));
    }, { accent: AIN_ACCENT });
    reg(hits, sitingPanel, "siting-card");

    // ------------------------------------------------- handheld + comparison
    const bench = group(g, 1.4, 0, 1.4, -0.5);
    slab(bench, 0.7, 0.05, 0.5, 0, 0.75, 0, 0xd7dde0, { radius: 0.015, rough: 0.4, metal: 0.2 });
    for (const [sx, sz] of [[-0.28, -0.18], [0.28, -0.18], [-0.28, 0.18], [0.28, 0.18]]) cyl(bench, 0.018, 0.018, 0.75, sx, 0.37, sz, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const handheld = instrument(bench, -0.15, 0.79, 0, { ry: 0.2, idle: "-- µg/m³", color: 0xf2c14b, w: 0.12, d: 0.18 });
    holoTag(bench, "Handheld reference", -0.15, 0.98, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, handheld, "handheld-meter");
    const compareBox = instrument(bench, 0.18, 0.79, 0.05, { idle: "-- / --", color: 0x6fd48a, w: 0.16, d: 0.2 });
    holoTag(bench, "Compare to sensor", 0.18, 1.0, 0.05, { css: "#6fd48a", w: 0.4 });
    reg(hits, compareBox, "compare-chart");
    const flagPost = group(bench, -0.3, 0.75, 0.2);
    cyl(flagPost, 0.01, 0.01, 0.3, 0, 0.15, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 6 });
    const flag = box(flagPost, 0.08, 0.06, 0.008, 0.04, 0.3, 0, 0xf0645b, { rough: 0.6, cast: false });
    flag.visible = false;
    holoTag(flagPost, "Flag this reading", 0.04, 0.42, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, flagPost, "flag-reading");
    const acceptBtn = box(bench, 0.06, 0.03, 0.06, 0.32, 0.79, -0.15, 0x22262b, { rough: 0.6 });
    decal(acceptBtn, 0.055, 0.055, 0, 0.016, 0, signFace("PUBLISH", { bg: "#22262b", accent: "#f0645b", scale: 0.55 }));
    reg(hits, acceptBtn, "unverified-reading");

    // ------------------------------------------------------------ leaf blower NPC
    const neighbour = standingFigure(g, 2.6, -1.4, { ry: -2.2, cloth: 0xc9a227 });
    neighbour.visible = false;
    const blowerDust = particles(g, 40, 0xc9b99a, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    blowerDust.position.set(0.1, 1.6, -0.1);
    blowerDust.visible = false;

    // ------------------------------------------------------------- log + resident
    const logStand = group(g, 0.6, 0, 1.9, -0.6);
    box(logStand, 0.18, 0.04, 0.24, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const camera = instrument(logStand, 0, 0.9, 0, { idle: "GPS: --", color: 0x6fd48a, w: 0.12, d: 0.16 });
    holoTag(logStand, "Photo + GPS log", 0, 1.06, 0, { css: "#6fd48a", w: 0.42 });
    reg(hits, camera, "log-camera");

    const resident = standingFigure(g, -1.5, 2.3, { ry: 0.5, cloth: 0x8a5a6b });
    const residentPanel = holoPanel(g, 0.5, 0.36, -0.6, 1.7, 2.2, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#6fd48a"; cx.fillRect(0, 0, w, 4);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`; cx.fillStyle = "#eef9f1";
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("Your reading, live on the map", w * 0.07, h * 0.5);
    }, { accent: AIN_ACCENT });
    reg(hits, residentPanel, "resident-panel");
    void resident;

    const signClip = group(g, 0.6, 0, 2.4, -0.4);
    box(signClip, 0.24, 0.02, 0.32, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const signFacePanel = decal(signClip, 0.22, 0.29, 0, 0.871, 0,
      paperFace("INSTALL LOG", ["Consent obtained ___", "Siting confirmed ___",
        "Calibration check ___", "Signed ___ Date ___"], { worn: true }), { px: 256 });
    signFacePanel.rotation.x = -Math.PI / 2;
    holoTag(signClip, "Sign here", 0, 1.05, 0, { css: "#6fd48a", w: 0.3 });
    reg(hits, signFacePanel.parent, "sign-pad");

    toolChest(g, -2.4, 1.6, { color: 0x2f6f5a });
    barrierPanel(g, 2.4, 1.9, { color: AIN_ACCENT });
    cone(g, -0.4, 2.5, { color: AIN_ACCENT });

    // ------------------------------------------------------------ live state
    let ladderShifted = false, blowing = false, warming = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.5, -0.2),
      onStepComplete(step) {
        if (step.id === "inlet-check") inletWeb.visible = false;
        if (step.id === "power-warmup") { warming = false; repaint(sensorScreen, signFace("READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 })); }
        if (step.id === "wifi-pairing") wifiBall.material.emissiveIntensity = 2.0;
        if (step.id === "handheld-reading") repaint(handheld.userData.screen, signFace("14.2 µg/m³", { bg: "#0d1c24", accent: "#f2c14b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "first-reading-check") repaint(compareBox.userData.screen, signFace("14.6 / 14.2", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "ladder-slip") { ladderShifted = true; spotter.visible = true; ladder.rotation.z = 0.12; }
        if (it.id === "leaf-blower") { blowing = true; neighbour.visible = true; blowerDust.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ladder-slip") { ladderShifted = false; spotter.visible = false; ladder.rotation.z = 0; }
        if (it.id === "leaf-blower") { blowing = false; neighbour.visible = false; blowerDust.visible = false; flag.visible = true; }
      },
      animate(t, dt, session) {
        ventSmoke.visible = true;
        ventSmoke.userData.step(dt, new THREE.Vector3(WALL_X + 0.12, 1.55, WALL_Z - 1.15), 0.05, 0.3, 0.4);
        if (blowing) blowerDust.userData.step(dt, new THREE.Vector3(0.1, 1.6, -0.1), 0.4, 0.6, -0.2);
        if (ladderShifted) ladder.position.x = -1.55 + Math.sin(t * 14) * 0.015;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "wifi-pairing") {
          const pct = Math.round(gg.t * 100);
          repaint(sensorScreen, signFace(`WIFI ${pct}%`, { bg: "#0d1c24", accent: gg.t >= 0.55 && gg.t <= 0.75 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.holding && session.step?.id === "power-warmup") { warming = true; sensorUnit.rotation.y = Math.sin(t * 20) * 0.01; }
        if (!warming) sensorUnit.rotation.y = 0;
        if (session?.track && session.step?.id === "first-reading-check") {
          repaint(compareBox.userData.screen, signFace(`${(session.track.v * 40).toFixed(1)} / 14.2`, {
            bg: "#0d1c24", accent: session.track.v > 0.4 && session.track.v < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.52,
          }));
        }
      },
    };
  },
};
