import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, valveWheel, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hood Suppression VR — its own gamified system: Canopy Certified.
// The cook's-side half of a Type I hood's life under a working commercial
// kitchen unionized with UNITE HERE Local 2: the baffle filters pulled and
// read, the wet-chemical system's own readiness checked against its own tag,
// and the response drill run the one way it is ever supposed to run — pull,
// gas closed, fan left turning, everybody out. NFPA 96 and NFPA 17A are the
// spine; the fire department's own semi-annual tag is the proof.

const HS_RED = 0xd83a2a;

export const SIM_HOOD_SUPPRESSION = {
  id: "hood-suppression",
  index: "105",
  domain: "Culinary",
  trade: "Line cook / kitchen fire warden — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "kitchen",
  weather: "clear",
  certification: "UNITE HERE Local 2 kitchen fire-warden training; NFPA 96 ventilation control and fire protection of commercial cooking operations; NFPA 17A wet chemical extinguishing systems; the California Fire Code; OSHA 29 CFR 1910.157 portable extinguishers; the local fire department's semi-annual suppression-system inspection",
  name: "Hood Suppression",
  title: simTitle("Hood Suppression"),
  tagline: "The cook's-side hood inspection and the fire response: filters, fusible links, the pull station's clear path, and the drill itself",
  accent: HS_RED,
  accentCss: "#d83a2a",
  parSeconds: 270,
  footprint: 2.3,
  badge: { id: "canopy-certified", name: "Canopy Certified", note: "A full inspection and a clean drill — pull, gas closed, fan running, everyone out" },

  game: system({
    name: "Canopy Certified",
    currency: "HOOD",
    ranks: ["Porter", "Line Cook", "Fire Warden", "Kitchen Lead", "Canopy Certified"],
    badges: [
      { id: "fan-never-off", name: "Fan Never Off", note: "Never touched the fan control during the response", test: AWARD.safe },
      { id: "clean-drill", name: "Clean Drill", note: "Ran the response sequence with no correction", test: AWARD.stepClean("drill") },
      { id: "filters-true", name: "Filters True", note: "Held every reading near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "fast-walk", name: "Fast Walk", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-corrections", name: "No Corrections", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "canopy-streak", name: "Canopy Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "wrong-extinguisher": "That is a dry-chemical ABC unit, not the Class K by the range. Dry chemical does nothing to cool burning oil and can drive a fine spray of it airborne on discharge; the wet chemical in a Class K saponifies the surface of the oil into a foam blanket instead, which is the only reaction NFPA 17A actually engineers this fire around.",
    "gas-reset-early": "That is the system's mechanical gas-reset lever, and resetting it restores gas to every appliance under this hood. NFPA 96 and the gas code both treat that reset as something an authorized person does after the fire is confirmed fully out and the system re-serviced — not a switch flipped the moment the flames look like they have died down.",
    "fan-off-switch": "That control stops the hood's exhaust fan. The fan runs through the entire response, not just the cooking — it is the capture path the wet chemical discharges into, and stopping it lets a plenum full of hot combustion gas and unreacted agent sit still overhead instead of being drawn up and out.",
    "greasy-rag-pile": "Those are grease-soaked wiping rags stacked on top of the filter rack. NFPA 96 exists because grease residue is the fuel a hood fire actually burns — a pile of saturated rags sitting against warm sheet metal is stored fuel load in a system that is supposed to have none, and it ignites well below the temperature the filters themselves are rated to survive.",
  },

  lateNotes: {
    "pull-station": "The manual pull only means anything once the flare-up is confirmed real and everyone else is already clear of the hood line — it is not the first thing you reach for on a routine inspection.",
    "gas-valve": "The gas side of this system only gets touched twice: once to confirm the interlock moves freely during the inspection, and once when it actually closes on its own during a real discharge.",
  },

  steps: [
    {
      id: "tag-check", kind: "select", target: "service-tag",
      title: "Read the inspection tag",
      cue: "Confirm the fire department's semi-annual service date on the hood's tag.",
      why: "NFPA 96 requires this system serviced at least twice a year by a certified company, and the tag hanging on the manifold is the only proof of when that last happened — an inspection built on a system that is already overdue for service is checking the wrong thing first. The hood and duct assembly itself is NSF-listed for this exact application, and that listing is worth nothing if the suppression system riding on it has lapsed.",
    },
    {
      id: "fan-draw", kind: "track", target: "filter-face", seconds: 5,
      title: "Check the exhaust draw at the filter face",
      cue: "Hold the anemometer at the filter face and keep the reading steady in the required capture band.",
      track: {
        start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "FILTER FACE — CAPTURE VELOCITY",
        readout: (v) => (v < 0.4 ? "weak draw — grease escaping the canopy" : v > 0.6 ? "overdrawing — check for a blocked duct upstream" : "capture holding"),
      },
      holdBreakNote: "Reading dropped out of band. A hood that cannot hold capture velocity at the filter face is not actually catching everything it is supposed to — reset and hold it steady.",
      why: "A Type I hood only protects the room if the air it is supposed to capture is actually moving up through the filters at the rate the system was designed around; a weak draw here means smoke and grease-laden air are already slipping past the canopy edge before anything else in this inspection even starts.",
    },
    {
      id: "filter-pull", kind: "sequence",
      targets: ["filter-1", "filter-2", "filter-3"],
      itemNames: { "filter-1": "left baffle filter", "filter-2": "centre baffle filter", "filter-3": "right baffle filter" },
      title: "Pull, check and reseat the baffle filters",
      cue: "Left to right: pull each filter, check its grease loading, and reseat it in the correct orientation.",
      why: "A baffle filter only works with its drain groove facing down and its baffles angled the way the manufacturer built them — reseated backward, grease that should run off into the collection cup instead pools on top of the filter, which is fuel sitting exactly where the fire would want it.",
      outOfOrderNote: "Left to right — take them in the order they hang so none gets skipped on a busy line.",
    },
    {
      id: "defect-walk", kind: "find", noHint: true,
      targets: ["fusible-link", "nozzle-cap"],
      itemNames: { "fusible-link": "the corroded fusible link", "nozzle-cap": "the nozzle missing its blow-off cap" },
      itemNotes: {
        "fusible-link": "This link has gone dark and pitted rather than bright metal. A corroded link can fuse at the wrong temperature or not at all, and it is a service item, not something wiped clean and left in place.",
        "nozzle-cap": "This nozzle has no protective cap. Left open, grease and cooking residue drift straight into the orifice and clog it, so the one nozzle that is supposed to discharge over this appliance is the one that will not.",
      },
      decoyNotes: { "nozzle-good": "That nozzle's cap is seated correctly. Leave it." },
      title: "Walk the wet-chemical manifold",
      cue: "Two things on this manifold are not ready. Find them.",
      why: "A fusible link and a nozzle cap both fail quietly — nothing about either one looks urgent from across the kitchen — and the only way this system discharges where and when it is supposed to is if every link and every nozzle on the manifold is confirmed, not assumed, before the tag gets signed.",
    },
    {
      id: "path-clear", kind: "hold", target: "pull-station", seconds: 5,
      title: "Confirm the pull station's sightline and path",
      cue: "Hold at the manual pull station while you confirm nothing blocks the sightline or the approach to it.",
      why: "A pull station three seconds away by sightline and ten seconds away around a stack of totes is a pull station that costs a kitchen the difference between a scorched hood and a working fire — NFPA 96 calls for it visible and reachable for exactly that reason, and reachable is something you confirm standing there, not something you assume from memory.",
      holdBreakNote: "You stepped off before confirming the path. A pull station is only as fast as the walk to it — finish checking the approach.",
    },
    {
      id: "tank-pressure", kind: "gauge", target: "tank-gauge",
      title: "Read the wet-chemical cylinder's pressure gauge",
      cue: "Read the cylinder gauge and commit once it sits inside the charged band.",
      gauge: {
        label: "WET CHEMICAL CYLINDER — PRESSURE", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => `${Math.round(t * 100)}% charge`,
        missNote: "Not in the charged band. A cylinder reading outside its service range does not discharge the way the system was engineered around — it gets tagged and serviced before anything else here matters.",
      },
      why: "The wet chemical only reaches every nozzle on the manifold at the pressure the system was designed for, and a cylinder that has slowly bled off charge over months of vibration and heat looks completely normal sitting on the wall — the gauge is the only thing that tells a full cylinder from an empty one from across the room.",
    },
    {
      id: "gas-interlock-check", kind: "turn", target: "gas-valve",
      title: "Test the gas interlock's free travel",
      cue: "Turn the mechanical gas-shutoff lever through its travel and confirm it moves freely to its ready position.",
      turn: { turns: 0.3, axis: "z", label: "GAS INTERLOCK — ROUTINE CHECK" },
      why: "The gas interlock has exactly one job during a real discharge: close automatically the instant the system fires, with nothing in the mechanism binding on old grease or a corroded pivot. A routine check that moves it through its full travel by hand is the only way to find a sticking linkage before a fire finds it first.",
    },
    {
      id: "class-k-check", kind: "select", target: "class-k",
      title: "Check the Class K extinguisher",
      cue: "Confirm the Class K's gauge reads charged and it is hanging in its bracket by the range.",
      why: "OSHA's portable-extinguisher rule and NFPA 96 both expect a Class K within reach of the appliances it is rated for, charged and unobstructed — it is the tool a cook actually reaches for on a small fire the suppression system has not yet triggered on, and it is useless hanging empty or three stations away.",
    },
    {
      id: "spare-filter", kind: "drag", target: "spare-filter",
      title: "Send the spare filter to be washed",
      cue: "Carry the heavily grease-loaded spare filter to the wash station.",
      drag: { to: "wash-station", radius: 0.5, missNote: "Not lined up with the wash station's sink yet — carry it the rest of the way." },
      why: "A baffle filter that has gone from silver to solid black is carrying more grease than it can drain, and a heavily loaded filter is a documented NFPA 96 finding, not a cosmetic one — it goes to the sink for a real degrease, not back onto the rack the way it came off.",
    },
    {
      id: "drill-standby", kind: "hold", target: "class-k", seconds: 4,
      title: "Brief the crew on the drill sequence",
      cue: "Hold the ready position while the crew is walked through the drill: pull, gas closed, fan running, everyone out.",
      why: "A drill run cold, with nobody having heard the sequence out loud first, is where a cook freezes on which control comes first — saying the four steps out loud before anyone touches anything is what makes the drill itself fast when it actually has to be.",
      holdBreakNote: "Briefing broke off early. Finish walking the sequence before anyone moves — a drill nobody understood in advance is not a drill.",
    },
    {
      id: "drill", kind: "sequence",
      targets: ["pull-station", "gas-valve", "hood-fan", "exit-door"],
      itemNames: { "pull-station": "manual pull station", "gas-valve": "gas shutoff", "hood-fan": "hood fan — confirm running", "exit-door": "exit" },
      title: "Run the response drill",
      cue: "Pull the station, confirm the gas has closed, confirm the fan is still running, then evacuate.",
      why: "This order is the entire drill: pulling the station is what closes the gas and drops the chemical, confirming the fan is still turning is what tells you the capture path is intact rather than shut down, and only then does anyone head for the door — reversing any two of these turns a controlled response into people leaving a live fire with the fuel supply still open.",
      outOfOrderNote: "Wrong order — pull first, confirm the gas has closed, confirm the fan is still running, then evacuate. Nothing in this sequence is interchangeable.",
    },
    {
      id: "log-close", kind: "select", target: "defect-log",
      title: "Log the defects and close out the inspection",
      cue: "Record the corroded link and the missing nozzle cap in the log, then sign the inspection closed.",
      why: "The two defects found on the manifold do not fix themselves, and the log is what actually gets the certified service company back out here before the next semi-annual date — an inspection that finds a problem and writes nothing down is indistinguishable, six months from now, from one that never found it.",
    },
  ],

  interrupts: [
    {
      id: "flare-up-inspection",
      kind: "Live flare-up",
      after: "fan-draw", delay: 2, seconds: 12,
      alert: "A pan on the range under the hood has flared and the flame is climbing toward the filters.",
      cue: "This is real. Get to the pull station.",
      target: "pull-station",
      why: "A flare-up reaching the filters is exactly the fire this whole system exists for, and the correct response does not wait for the rest of the inspection checklist — pull the station, and everything the wet chemical and the gas interlock are built to do happens in the next few seconds.",
      missNote: "The flare-up reached the plenum with nobody at the pull station. A fire that climbs into the duct is no longer a range fire the Class K can reach — it is exactly the fire NFPA 96's suppression system exists to catch before that happens.",
      wrongNote: "The pull station, not the extinguisher and not the fan control. A fire already in the hood needs the system, not a handheld unit.",
    },
    {
      id: "roof-grease-report",
      kind: "Rooftop deficiency reported",
      after: "drill-standby", delay: 2, seconds: 12,
      alert: "A roofer working nearby radios down that grease is dripping from the fan's rooftop discharge onto the roof membrane.",
      cue: "That is a documented deficiency. Log it before it is forgotten.",
      target: "defect-log",
      why: "NFPA 96 treats grease reaching the rooftop discharge as a containment failure in the exhaust system, not a housekeeping note, and a roof membrane soaked in grease is both a fire load and a roofing liability — the fix is a service call, and the log is what actually makes that call happen instead of the report evaporating at shift change.",
      missNote: "The rooftop grease report went nowhere. Grease reaching open roof membrane keeps accumulating fuel outside the system built to contain it, and nobody downstream of this shift will know it was ever reported.",
      wrongNote: "The defect log. A rooftop discharge problem does not get fixed by anything happening inside the kitchen right now — it gets fixed by writing it down so the service company hears about it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, HS_RED);

    const SS = 0xb4bcc3, SS_DARK = 0x767e86;

    // ------------------------------------------------------------- the range
    const range = group(g, 0, 0, -3.2);
    box(range, 2.2, 0.86, 0.7, 0, 0.43, 0, SS_DARK, { rough: 0.35, metal: 0.75 });
    box(range, 2.2, 0.06, 0.74, 0, 0.87, 0, 0x2f3439, { rough: 0.5, metal: 0.5 });
    const burners = [];
    for (let i = 0; i < 4; i++) {
      const bx = -0.75 + i * 0.5;
      const b = group(range, bx, 0.95, 0);
      cyl(b, 0.09, 0.11, 0.03, 0, 0, 0, 0x1b1e22, { rough: 0.75, seg: 16 });
      const flame = cyl(b, 0.018, 0.06, 0.05, 0, 0.02, 0, 0x4aa3ff, { emissive: 0x2f7fff, ei: 2.2, opacity: 0.7, rough: 0.4, seg: 12, cast: false });
      flame.visible = i === 1;
      burners.push(flame);
    }
    const pan = group(range, -0.25, 0.99, 0);
    cyl(pan, 0.11, 0.115, 0.05, 0, 0, 0, 0x4a4f55, { rough: 0.35, metal: 0.7, seg: 20 });
    const oil = cyl(pan, 0.09, 0.088, 0.012, 0, 0.03, 0, 0xd8a44e, { rough: 0.2 });
    const fire = particles(pan, 90, 0xff9a3c, { size: 0.05, life: 0.5 });
    const smoke = particles(pan, 50, 0x9aa0a6, { size: 0.09, life: 1.3, additive: false, opacity: 0.22 });
    const fireLight = new THREE.PointLight(0xff8a3c, 0, 6, 2);
    fireLight.position.set(-0.25, 1.4, -3.2);
    g.add(fireLight);

    // ------------------------------------------------------------- the hood
    const hood = group(g, 0, 0, -3.2);
    box(hood, 2.5, 0.5, 1.1, 0, 2.3, 0, SS, { rough: 0.3, metal: 0.85 });
    box(hood, 2.6, 0.1, 1.2, 0, 2.02, 0, SS, { rough: 0.3, metal: 0.85 });
    const filterMeshes = [];
    for (let i = 0; i < 3; i++) {
      const fx = -0.75 + i * 0.75;
      const f = group(hood, fx, 2.15, 0.4);
      const grate = box(f, 0.62, 0.32, 0.03, 0, 0, 0, 0x8d959d, { rough: 0.35, metal: 0.9 });
      for (let s = 0; s < 5; s++) box(f, 0.02, 0.28, 0.005, -0.26 + s * 0.13, 0, 0.018, 0x6d7379, { rough: 0.5, metal: 0.6 });
      f.rotation.x = 0.34;
      reg(hits, grate, `filter-${i + 1}`);
      filterMeshes.push(grate);
    }
    holoTag(hood, "Baffle filters", 0, 2.5, 0.42, { css: "#d83a2a", w: 0.34 });
    // Filter-face anemometer probe point.
    const filterFace = box(hood, 0, 2.0, 0.5, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, filterFace, "filter-face");
    // Exhaust fan on the duct riser.
    cyl(hood, 0.24, 0.24, 0.4, 0.85, 2.85, 0, SS, { rough: 0.3, metal: 0.85, seg: 18 });
    const hoodFan = group(hood, 0.85, 2.62, 0);
    for (let i = 0; i < 5; i++) {
      const blade = box(hoodFan, 0.18, 0.007, 0.055, 0, 0, 0, 0x6f767d, { rough: 0.4, metal: 0.7, cast: false });
      blade.rotation.y = (i * Math.PI * 2) / 5; blade.rotation.z = 0.4;
    }
    reg(hits, hoodFan, "hood-fan");
    holoTag(hoodFan, "Hood fan — keep running", 0, 0.32, 0, { css: "#59c97b", w: 0.42 });
    const fanOffSwitch = group(hood, -1.15, 1.9, 0.5);
    box(fanOffSwitch, 0.1, 0.14, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5 });
    decal(fanOffSwitch, 0.08, 0.05, 0, 0.03, 0.026, signFace("FAN STOP", { bg: "#22262b", accent: "#f0645b", scale: 0.4 }));
    reg(hits, fanOffSwitch, "fan-off-switch");

    // Wet-chemical manifold along the front edge of the canopy.
    const manifold = group(hood, 0, 1.78, 0.55);
    cyl(manifold, 0.02, 0.02, 2.4, 0, 0, 0, CITY.darkSteel, { rough: 0.4, metal: 0.75, seg: 10 }).rotation.z = Math.PI / 2;
    const goodLink = group(manifold, -0.9, -0.06, 0);
    cyl(goodLink, 0.014, 0.014, 0.05, 0, 0, 0, 0xd8d0b0, { rough: 0.3, seg: 8 });
    const badLink = group(manifold, -0.3, -0.06, 0);
    cyl(badLink, 0.014, 0.014, 0.05, 0, 0, 0, 0x5c4a34, { rough: 0.75, seg: 8 });
    reg(hits, badLink, "fusible-link");
    const goodNozzle = group(manifold, 0.3, -0.08, 0.06);
    cyl(goodNozzle, 0.018, 0.018, 0.07, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.6, seg: 10 });
    ball(goodNozzle, 0.02, 0, -0.04, 0, 0xdfe4e8, { rough: 0.3 });
    reg(hits, goodNozzle, "nozzle-good");
    const openNozzle = group(manifold, 0.95, -0.08, 0.06);
    cyl(openNozzle, 0.018, 0.018, 0.07, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, openNozzle, "nozzle-cap");
    holoTag(manifold, "Wet-chemical manifold", 0, 0.14, 0, { css: "#d83a2a", w: 0.4 });

    // Grease rag pile stacked on the filter rack — the hazard.
    const ragPile = group(hood, 1.0, 2.02, 0.42);
    for (let i = 0; i < 4; i++) box(ragPile, 0.16, 0.03, 0.14, (Math.random() - 0.5) * 0.05, i * 0.028, (Math.random() - 0.5) * 0.04, 0x3a3226, { rough: 0.85 });
    holoTag(ragPile, "Grease rags", 0, 0.2, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, ragPile, "greasy-rag-pile");

    // ------------------------------------------------------ pull station + gas
    const pullStation = group(g, -1.9, 0, -1.8, 0.5);
    box(pullStation, 0.18, 0.26, 0.1, 0, 1.2, 0, 0xd8232a, { rough: 0.45, metal: 0.3 });
    const pullHandle = cyl(pullStation, 0.014, 0.014, 0.1, 0, 1.35, 0.06, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 8 });
    decal(pullStation, 0.15, 0.06, 0, 1.05, 0.052, signFace("PULL", { bg: "#7d1512", accent: "#ffe3ac", scale: 0.55 }));
    reg(hits, pullStation, "pull-station");
    holoTag(pullStation, "Manual pull station", 0, 1.5, 0, { css: HS_RED, w: 0.4 });

    // Obstruction that sat in front of the pull station's approach (dressing only).
    box(g, 0.5, 0.4, 0.4, -1.4, 0.2, -1.4, 0x8b6a42, { rough: 0.7 });

    const gasValve = valveWheel(g, -1.1, 0.7, -2.4, { r: 0.09, color: 0xf2c14b, body: 0x2f6f4a, ry: 0.4 });
    holoTag(gasValve, "Gas interlock", 0, 0.28, 0, { css: HS_RED, w: 0.32 });
    reg(hits, gasValve, "gas-valve");

    const wetCylinder = group(g, -1.9, 0, -3.0);
    cyl(wetCylinder, 0.14, 0.15, 0.75, 0, 0.4, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 18 });
    const tankGauge = decal(wetCylinder, 0.14, 0.14, 0.16, 0.55, 0, signFace("--%", { bg: "#12191f", accent: HS_RED, fg: "#ffd9d9", scale: 0.55 }), { glow: true, ei: 0.7 });
    tankGauge.rotation.y = Math.PI / 2;
    reg(hits, tankGauge, "tank-gauge");
    holoTag(wetCylinder, "Wet-chemical cylinder", 0, 0.85, 0, { css: HS_RED, w: 0.4 });

    // Class K extinguisher by the range, and the wrong ABC unit on the far wall.
    const classK = group(g, 1.6, 0, -3.1);
    cyl(classK, 0.08, 0.08, 0.5, 0, 0.5, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 16 });
    decal(classK, 0.13, 0.09, 0, 0.58, 0.085, signFace("K", { bg: "#f2ae14", fg: "#1b1e22", accent: "#b81410", scale: 0.9 }));
    reg(hits, classK, "class-k");
    holoTag(classK, "Class K", 0, 0.85, 0, { css: HS_RED, w: 0.28 });

    const abcExt = group(g, 2.1, 0, -0.4, -0.5);
    cyl(abcExt, 0.085, 0.085, 0.48, 0, 0.5, 0, 0xb81410, { rough: 0.4, metal: 0.3, seg: 16 });
    decal(abcExt, 0.13, 0.09, 0, 0.57, 0.09, signFace("ABC", { bg: "#2b3138", fg: "#dfe4e8", accent: "#8b929a", scale: 0.55 }));
    reg(hits, abcExt, "wrong-extinguisher");
    holoTag(abcExt, "ABC — not for grease", 0, 0.85, 0, { css: "#f0645b", w: 0.44 });

    // Gas reset lever near the manifold.
    const gasReset = group(g, -0.6, 0, -2.5);
    box(gasReset, 0.08, 0.2, 0.06, 0, 0.6, 0, 0x2f3439, { rough: 0.5, metal: 0.5 });
    cyl(gasReset, 0.012, 0.012, 0.16, 0.05, 0.68, 0.02, 0xd8232a, { rough: 0.4, seg: 8 });
    reg(hits, gasReset, "gas-reset-early");
    holoTag(gasReset, "Gas reset — authorized only", 0, 0.85, 0, { css: "#f0645b", w: 0.5 });

    // ------------------------------------------------------------- spare filter
    const spareFilter = group(g, 1.7, 0, -1.6, -0.3);
    box(spareFilter, 0.6, 0.05, 0.3, 0, 0.9, 0, 0x1b1e22, { rough: 0.75, metal: 0.5 });
    reg(hits, spareFilter, "spare-filter");
    holoTag(spareFilter, "Spare filter — heavy load", 0, 0.98, 0, { css: HS_RED, w: 0.48 });

    const washStation = group(g, 2.2, 0, 1.4, -0.5);
    box(washStation, 0.7, 0.7, 0.5, 0, 0.4, 0, SS, { rough: 0.3, metal: 0.8 });
    box(washStation, 0.6, 0.03, 0.4, 0, 0.76, 0, 0x8d959d, { rough: 0.3, metal: 0.85 });
    reg(hits, washStation, "wash-station");
    holoTag(washStation, "Filter wash sink", 0, 0.9, 0, { css: HS_RED, w: 0.36 });

    // Exit door on the far wall.
    const exitDoor = group(g, 3.0, 0, 1.0, -Math.PI / 2);
    box(exitDoor, 0.9, 2.0, 0.06, 0, 1.0, 0, 0x2f3439, { rough: 0.6, metal: 0.4 });
    decal(exitDoor, 0.7, 0.16, 0, 1.9, 0.04, signFace("EXIT", { bg: "#0f1b14", accent: "#59c97b", scale: 0.6 }));
    reg(hits, exitDoor, "exit-door");

    // Service tag on the manifold post.
    const serviceTag = decal(g, 0.2, 0.24, -0.4, 2.0, -3.85, paperFaceTag(), { px: 220 });
    reg(hits, serviceTag, "service-tag");

    // ------------------------------------------------------------- paperwork
    const chest = toolChest(g, 2.3, 1.6, { ry: -0.7, color: HS_RED });
    const log = holoPanel(g, 0.56, 0.4, -2.2, 1.6, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,6,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d83a2a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e0a89a";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("HOOD SUPPRESSION LOG", w * 0.06, h * 0.14);
      ctx.fillStyle = "#ffe4e4";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SEMI-ANNUAL — LINE 1 HOOD", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#e0a89a";
      ["Filters: 3 checked, orientation correct", "Defects: link corroded, cap missing",
       "Cylinder: charged", "Class K: charged, in bracket", "Drill run clean"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.48 + i * 0.11)));
    }, { ry: 0.5, accent: HS_RED });
    reg(hits, log, "defect-log");
    // A radio-call lamp beside the log — dark until the roofer's report comes
    // in, so the interrupt is something to actually notice, not just a caption.
    const roofAlertLamp = ball(g, 0.05, -2.2, 1.95, 1.0, 0x3a3d40, { emissive: 0x3a3d40, ei: 0.3, seg: 12, seg2: 8 });

    function paperFaceTag() {
      return (ctx, w, h) => {
        ctx.fillStyle = "#f4e9d8"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#b81410"; ctx.fillRect(0, 0, w, h * 0.16);
        ctx.fillStyle = "#f4e9d8";
        ctx.font = `700 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("FIRE DEPT TAG", w / 2, h * 0.08);
        ctx.fillStyle = "#22262b";
        ctx.font = `600 ${Math.round(h * 0.1)}px Arial, sans-serif`;
        ctx.fillText("SERVICED", w / 2, h * 0.4);
        ctx.fillText("THIS PERIOD", w / 2, h * 0.55);
        ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
        ctx.fillText("NFPA 96 · 17A", w / 2, h * 0.78);
      };
    }

    // A second cook, clear of the manifold and the pull station.
    const crew = standingFigure(g, 1.4, 1.9, { ry: 2.4, cloth: 0xdfe6ec, trousers: 0x2b3138 });

    let flareOn = false, fanRunning = true, systemPulled = false, gasOpen = true, nozzleCapAdded = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.3, -3.2),

      onStep(step) {
        if (step.id === "drill" && !flareOn) { flareOn = true; fire.visible = true; smoke.visible = true; }
      },

      onStepComplete(step) {
        if (step.id === "filter-pull") filterMeshes.forEach((f) => { f.material = mat(0xaeb7bf, { rough: 0.3, metal: 0.9 }); });
        if (step.id === "defect-walk") {
          badLink.children[0].material = mat(0xd8d0b0, { rough: 0.3 });
          if (!nozzleCapAdded) { nozzleCapAdded = true; ball(openNozzle, 0.02, 0, -0.04, 0, 0xdfe4e8, { rough: 0.3 }); }
        }
        if (step.id === "gas-interlock-check") gasValve.userData.wheel.rotation.z += 1.2;
        if (step.id === "drill") {
          systemPulled = true; gasOpen = false; flareOn = false; fire.visible = false; smoke.visible = false; fireLight.intensity = 0;
          pullHandle.position.y -= 0.06;
        }
        if (step.id === "log-close") repaint(tankGauge, signFace("OK", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.6 }));
      },

      onInterrupt(it) {
        if (it.id === "flare-up-inspection") { flareOn = true; fire.visible = true; smoke.visible = true; }
        if (it.id === "roof-grease-report") roofAlertLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "flare-up-inspection") { flareOn = false; fire.visible = false; smoke.visible = false; fireLight.intensity = 0; systemPulled = true; gasOpen = false; }
        if (it.id === "roof-grease-report") roofAlertLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
      },

      onHazard(hitId) {
        if (hitId === "fan-off-switch") fanRunning = false;
      },

      animate(t, dt, session) {
        void dt;
        if (fanRunning) hoodFan.rotation.y += dt * 5.5;
        burners.forEach((b, i) => { if (b.visible) b.material.emissiveIntensity = 2.0 + Math.sin(t * 13 + i) * 0.5; });
        if (flareOn) {
          fire.userData.step(dt, new THREE.Vector3(0, 0.05, 0), 0.14, 1.5, -0.7);
          smoke.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.2, 0.35, 0.5);
          fireLight.intensity = 5 + Math.random() * 5;
        }
        void oil; void gasOpen; void systemPulled;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "tank-pressure") {
          repaint(tankGauge, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#12191f", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffd9d9", scale: 0.55,
          }));
        }
      },
    };
  },
};
