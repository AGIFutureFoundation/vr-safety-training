import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tank Lining VR — Surface Prep & Coatings, station three.
// Blasting and lining the inside of a potable water storage tank.
//
// Two things make this job different from painting anything else. The first
// is that the blaster's air comes down a hose from a compressor somebody else
// sited: a Type CE blast hood is supplied-air, so where that intake is
// standing relative to the nearest exhaust decides whether the operator is
// breathing air or carbon monoxide, and the only thing between those two
// outcomes is a monitor with an alarm on it.
//
// The second is that the coating has a window rather than a moment. Steel at
// or below the dew point has water on it that nobody can see, and a lining
// rolled over that water fails from underneath months later, in a tank full
// of drinking water that then has to be drained to find out why. The data
// sheet's rule is the steel at least three degrees Celsius above the dew
// point and rising, and it is measured rather than judged — along with the
// profile the blast left, the wet film going on, and a holiday test at the
// end, because a lining for immersion service is only as good as its worst
// pinhole.

const TL_ACCENT = 0x5eb0c4;

export const SIM_TANK_LINING = {
  id: "tank-lining",
  index: "70",
  domain: "Coatings",
  trade: "Industrial painter / protective coatings applicator",
  category: "Surface Prep & Coatings",
  weather: "overcast",
  certification: "IUPAT industrial painters and the bridge and tank locals; AMPP (formerly SSPC and NACE) applicator and coating inspector qualification, with the surface preparation standard the specification names; NSF/ANSI 61 certification for a coating in contact with drinking water; AWWA C652 disinfection of water-storage facilities before return to service; OSHA 29 CFR 1910.146 permit-required confined spaces, 1910.134 for the supplied-air respirator and its breathing-air quality, and 1926.1153 respirable crystalline silica",
  name: "Tank Lining",
  title: simTitle("Tank Lining"),
  tagline: "Blasting and lining a potable water tank: breathing air proven before the hood goes on, profile and dew point measured before the first coat, film thickness held, holidays found, and the tank disinfected before it holds water again",
  accent: TL_ACCENT,
  accentCss: "#5eb0c4",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "lining-held", name: "Lining Held", note: "A tank lined on measured numbers — breathing air, profile, dew point, film thickness and a holiday test — and disinfected before it went back" },

  game: system({
    name: "Coatings Authority",
    currency: "MIL",
    ranks: ["Helper", "Blaster", "Applicator", "Coatings Foreman", "Coatings Authority Certified"],
    badges: [
      { id: "air-proven", name: "Air Proven", note: "The breathing air was sited and monitored before anybody put a hood on", test: AWARD.stepClean("air-quality") },
      { id: "nothing-guessed", name: "Nothing Guessed", note: "Never coated below the dew point rule, never blasted with silica, never took an unrated light in", test: AWARD.safe },
      { id: "film-held", name: "Film Held", note: "Wet film inside the specified range across the whole application", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-tank", name: "Clean Tank", note: "No corrections from the permit to the sample", test: AWARD.clean },
      { id: "steady-gun", name: "Steady Gun", note: "Held the application rate through the whole pass", test: AWARD.unbroken },
      { id: "inside-window", name: "Inside The Window", note: "Coated and closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "silica-abrasive": "You reached for the bag of silica sand. Blasting with it fills a closed steel tank with respirable crystalline silica, and a Type CE hood protects the person wearing it and nobody else — the pot tender, the hose watch and whoever opens the hatch next are all breathing what the blaster made. The specification names a non-silica abrasive for exactly this reason, and it is not a cost line to be traded away.",
    "intake-by-exhaust": "You set the breathing-air compressor intake beside the generator exhaust. That hose ends inside a hood on somebody's face in a tank they cannot quickly get out of, and carbon monoxide has no smell, no taste and no warning — the first symptom is the blaster stopping answering. The intake goes upwind and well clear of every exhaust on the site, and the monitor on the line is the backstop, not the plan.",
    "coat-below-dewpoint": "You put coating on steel that was at the dew point. There is condensate on that surface whether or not anybody can see it, and the lining goes on over the water rather than over the steel. It will look perfect on the day, pass a thickness check, and disbond from underneath a year later — in a tank that has to be drained, emptied of a city's water and re-entered to find out why.",
    "unrated-light": "You took an ordinary work light into a tank being sprayed with a solvent-borne coating. The ventilation in there is doing two jobs at once, and the second one is keeping the vapour below anything that will light. Every lamp, switch and cord that goes through that hatch is rated for the atmosphere the job creates, or it stays on the deck.",
  },

  lateNotes: {
    "blast-nozzle": "Blasting starts after the breathing air is sited, proven and monitored — the hood is the last thing on, not the first.",
    "spray-gun": "The first coat goes on after the profile is measured and the dew point rule is met, not on the shift it was scheduled for.",
    "holiday-detector": "The holiday test comes after the coating has reached the cure the data sheet asks for, not while it is still soft.",
  },

  // Interruptions: see shared/game.js. Both are the two ways the air in this
  // tank turns on the people in it.
  interrupts: [
    {
      id: "co-alarm",
      kind: "Breathing air",
      after: "blast", delay: 4, seconds: 12,
      alert: "The carbon monoxide monitor on the breathing-air line is in alarm and the pot tender is waving at the hatch.",
      cue: "The air going into the hood is not air any more.",
      target: "air-panel",
      why: "A CO alarm on a supplied-air line is not a reading to be watched — it is the reason that monitor exists. The blaster cannot smell it, cannot taste it and will not notice it before it has them, so the line is shut down and everybody comes out on the alarm, and the intake is found afterwards rather than diagnosed while somebody is still breathing off it.",
      missNote: "The alarm ran while the blasting carried on. Carbon monoxide does not announce itself to the person breathing it, so the way that ends is the hose watch noticing the nozzle has stopped moving.",
      wrongNote: "Not that. The breathing-air panel is where this stops, and it stops now.",
    },
    {
      id: "vent-stopped",
      kind: "Ventilation down",
      after: "spray", delay: 4, seconds: 13,
      alert: "The extraction fan has stopped and the LEL head inside the tank is climbing.",
      cue: "The thing keeping the vapour down has stopped keeping it down.",
      target: "vent-fan",
      why: "Ventilation in a tank being sprayed is doing two jobs: keeping the applicator's atmosphere breathable and keeping the solvent vapour below anything that will light. Lose it and the second one fails quietly — the space fills from the floor up while the work carries on, and the ignition source is whatever is already in there.",
      missNote: "Spraying continued into a tank with no extraction on it. The vapour came up past the LEL head while the applicator was still inside working to a wet film reading.",
      wrongNote: "That is not the fan. Nothing else in this tank matters until the air is moving again.",
    },
  ],

  steps: [
    {
      id: "permit", kind: "select", target: "entry-permit",
      title: "Take the permit and the coating specification",
      cue: "Read the entry permit and the spec together: the space, the abrasive named, the surface standard, and the coating's own data sheet.",
      why: "The permit governs the space and the specification governs the work, and on this job they are the same conversation — the abrasive, the ventilation rate and the respiratory protection are all set by what the coating needs and what blasting it creates.",
    },
    {
      id: "air-intake", kind: "drag", target: "air-intake",
      title: "Site the breathing-air intake",
      cue: "Carry the intake stand upwind and well clear of every exhaust on the site.",
      why: "This is the decision the whole job rests on and it is made on the ground, before anybody is in the tank. The hose from here ends inside a hood on a face, and carbon monoxide arrives there with no warning of any kind.",
      drag: { to: "upwind-stand", radius: 0.5, missNote: "Not clear of the exhausts — an intake anywhere downwind of a running engine is a CO line with a hose on the end of it." },
    },
    {
      id: "air-quality", kind: "gauge", target: "co-monitor",
      title: "Prove the breathing air",
      cue: "Read the carbon monoxide monitor on the line and commit on what it shows.",
      why: "Grade D breathing air with a monitor and an alarm on the line, proven before the hood goes on. The monitor is not a formality: it is the only thing in this system that can tell the blaster something they physically cannot detect.",
      gauge: {
        label: "CO IN LINE", speed: 0.72, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 60)} ppm`,
        missNote: "That is carbon monoxide in a breathing-air line. Nobody goes on air until the intake has been moved and it reads clean.",
      },
    },
    {
      id: "vent", kind: "turn", target: "vent-fan",
      title: "Start the extraction",
      cue: "Turn the extraction fan on and confirm air is moving through the tank.",
      why: "Continuous, and started before entry. It carries the dust out while blasting and the solvent vapour out while coating, and the permit is written on the assumption it is running the whole time.",
      turn: { turns: 0.3, axis: "z", label: "EXTRACTION FAN" },
    },
    {
      id: "enter", kind: "select", target: "tank-hatch",
      title: "Enter through the shell hatch",
      cue: "Through the hatch with the attendant at it and the air moving.",
      why: "One way in, one way out, and somebody at it who is not going in. Everything that follows happens at the end of a hose that runs back through this opening.",
    },
    {
      id: "blast", kind: "track", target: "blast-nozzle", seconds: 7,
      title: "Blast to the specified standard",
      cue: "Hold the nozzle standoff and rate steady and work the plate.",
      why: "Standoff and angle are what put the profile in the steel rather than just cleaning it. Too close and the abrasive shatters without cutting; too far and the pattern is soft and the profile comes out shallow and uneven.",
      track: {
        start: 0.1, green: [0.36, 0.58], rise: 0.5, fall: 0.45, drift: 0.12, label: "NOZZLE STANDOFF",
        readout: (v) => (v < 0.36 ? "too close, shattering the abrasive" : v > 0.58 ? "too far, pattern gone soft" : "cutting a clean profile"),
      },
      holdBreakNote: "Standoff out of band — the profile is what the lining keys into, and it is only as even as the nozzle was.",
    },
    {
      id: "profile", kind: "gauge", target: "profile-gauge",
      title: "Measure the anchor profile",
      cue: "Take the profile on the blasted plate and commit against the range the specification calls for.",
      why: "The lining grips the peaks and valleys the blast cut, so the profile is a specified dimension and not a finish. Too shallow and there is nothing to key into; too deep and the peaks stand proud of the film and rust through it from the tip down.",
      gauge: {
        label: "PROFILE", speed: 0.7, green: [0.4, 0.64],
        readout: (t) => `${(t * 6).toFixed(1)} mil`,
        missNote: "Outside the profile the specification calls for. Change the abrasive or the standoff and re-blast the area rather than coating over it.",
      },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["weld-spatter", "pitting", "flash-rust"],
      itemNames: { "weld-spatter": "weld spatter on the seam", "pitting": "pitting in the floor plate", "flash-rust": "flash rust on the shell" },
      itemNotes: {
        "weld-spatter": "There is spatter left on the seam. Coating will not hold a sharp edge or a loose bead — it pulls thin over both, and the first holiday on this tank will be along that weld.",
        "pitting": "The floor plate is pitted. Pits hold blast dust and solvent and they are where the film ends up thinnest, so they are cleaned out and struck up by hand before the general coat.",
        "flash-rust": "The shell has flashed rust since it was blasted. Blasted steel starts rusting immediately in a damp tank, and the specification says what degree of flash rust is acceptable and what has to be re-blasted.",
      },
      title: "Inspect the prepared surface",
      cue: "Walk the plate and click the three things that will fail this lining if they are coated over.",
      why: "A blasted tank looks uniformly grey and is not. The seam, the pits and the flash rust are the three places a lining goes on thin or goes on over something, and all three are invisible by the time the first coat has covered them.",
    },
    {
      id: "dewpoint", kind: "gauge", target: "dewpoint-meter",
      title: "Take the steel temperature against the dew point",
      cue: "Read the surface temperature and the dew point and commit on the margin between them.",
      why: "Steel at or below the dew point has condensate on it that the eye cannot find. The data sheet's rule is the steel at least three degrees Celsius above the dew point and rising, and it is a measurement rather than a judgement because the failure it prevents does not appear for a year.",
      gauge: {
        label: "STEEL ABOVE DEW POINT", speed: 0.7, green: [0.42, 0.85],
        readout: (t) => `${(t * 9 - 1).toFixed(1)} °C`,
        missNote: "Not enough margin over the dew point. There is water on that steel — warm the tank or wait for the conditions, but do not coat it.",
      },
    },
    {
      id: "mix", kind: "hold", target: "mixer", seconds: 5,
      title: "Mix and induct the material",
      cue: "Hold the mixer through the full time the data sheet gives, then let it stand for the induction.",
      why: "A two-component lining is a chemical reaction that has already started. Under-mixed material has unreacted resin in it that never cures, and skipping the induction puts it through the gun before the reaction has begun — both of which look perfectly fine going on.",
      holdBreakNote: "The mix was cut short. Streaks of unmixed component in an immersion lining are soft spots that stay soft.",
    },
    {
      id: "spray", kind: "track", target: "spray-gun", seconds: 7,
      title: "Apply the first coat",
      cue: "Hold the gun distance and pass rate steady across the plate.",
      why: "Even film comes from an even hand: a steady distance, a constant rate and a fifty per cent overlap. The recoat window on the data sheet starts now, and coating outside it means abrading the first coat before the second will bond to it.",
      track: {
        start: 0.12, green: [0.38, 0.58], rise: 0.5, fall: 0.45, drift: 0.12, label: "PASS RATE",
        readout: (v) => (v < 0.38 ? "heavy, it will sag" : v > 0.58 ? "light, dry spray" : "even wet coat"),
      },
      holdBreakNote: "Pass rate out of band — slow and it sags off the shell, fast and it lands dry and never flows out.",
    },
    {
      id: "wft", kind: "gauge", target: "wft-comb",
      title: "Check wet film as you go",
      cue: "Take the wet film with the comb behind the gun and commit on the reading.",
      why: "Wet film is the only thickness anybody can correct. Measured behind the gun it is a pass that can be adjusted; measured after it cures, the same number is a report about a tank that has to be abraded and recoated.",
      gauge: {
        label: "WET FILM", speed: 0.7, green: [0.44, 0.66],
        readout: (t) => `${Math.round(t * 30)} mil`,
        missNote: "Off the wet film the specification calls for — thin will not protect and thick will solvent-entrap and stay soft underneath.",
      },
    },
    {
      id: "holiday", kind: "gauge", target: "holiday-detector",
      title: "Find the holidays",
      cue: "Run the detector over the cured lining and commit on what it finds.",
      why: "A lining for immersion service is judged on its worst pinhole, not its average thickness. The detector finds what the eye cannot — the pit that starved, the edge that pulled thin, the run that trapped solvent — and every one found is marked and struck up before the tank sees water.",
      gauge: {
        label: "HOLIDAYS", speed: 0.75, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * 20)} found`,
        missNote: "That many discontinuities is not a repair list, it is a coat that has to go back on.",
      },
    },
    {
      id: "disinfect", kind: "select", target: "disinfect-rig",
      title: "Disinfect and sample before it goes back",
      cue: "Disinfect the tank to the standard, flush it, and take the sample.",
      why: "The coating is certified for contact with drinking water, and the tank still has to be disinfected before it holds any. AWWA C652 is where that is written, and the sample coming back clean is what turns the whole job from finished into accepted.",
    },
    {
      id: "walk", kind: "find",
      targets: ["hose-watch", "grounding-clamp", "cure-log"],
      itemNames: { "hose-watch": "the hose watch", "grounding-clamp": "bonding on the blast pot", "cure-log": "the cure and conditions log" },
      itemNotes: {
        "hose-watch": "The hose watch is still on the hatch. They tend the air line and the blast hose and they are the person who notices when the nozzle stops moving.",
        "grounding-clamp": "The blast pot and the tank shell are bonded. Abrasive moving down a hose builds static, and a tank is a large isolated conductor until somebody ties it to something.",
        "cure-log": "The log carries the conditions every coat went on in. When a lining is questioned years later, the dew point margin written down on the day is the whole of the defence.",
      },
      title: "Close the job out",
      cue: "Click the three things that have to be right before the crew leaves.",
      why: "Two of these keep somebody alive while the work is happening and one of them is the only evidence the work was done right. All three are the things nobody photographs.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, TL_ACCENT);

    // ------------------------------------------------------------- the tank
    // A bolted steel water tank with a shell hatch cut into it, the near
    // quarter opened out so the learner can see the plate they are working.
    const tank = group(g, -0.35, 0, -1.55);
    const R = 1.75, H = 2.8;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      if (a > 5.5 || a < 0.78) continue;           // the quarter left open
      // Painted, not bare galvanised. A grey tank in front of a grey city
      // disappears from the approach — and a municipal water tank is painted
      // anyway, because the coating outside is doing the same job as the
      // lining inside.
      const seg = box(tank, 0.62, H, 0.07, Math.sin(a) * R, H / 2, Math.cos(a) * R,
        0x2b7f8c, { rough: 0.6, metal: 0.25, finish: "painted", tile: [1, 3] });
      seg.rotation.y = a;
      box(tank, 0.62, 0.34, 0.075, Math.sin(a) * R, H * 0.62, Math.cos(a) * R,
        0xe8eef1, { rough: 0.55, finish: "painted" }).rotation.y = a;
    }
    cyl(tank, R + 0.08, R + 0.08, 0.12, 0, 0.06, 0, 0x6c7680, { rough: 0.85, seg: 26, finish: "concrete" });
    // Blasted floor plate inside, with the three defects on it.
    const floor = cyl(tank, R - 0.08, R - 0.08, 0.03, 0, 0.14, 0, 0x7e8790, { rough: 0.95, seg: 26 });
    void floor;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      cyl(tank, 0.02, 0.02, H, Math.sin(a) * (R - 0.02), H / 2, Math.cos(a) * (R - 0.02), 0x707a84,
        { rough: 0.6, metal: 0.5, seg: 6 });
    }
    decal(tank, 1.15, 0.28, 0.1, H * 0.62, R + 0.05, signFace("POTABLE WATER  No.2", {
      bg: "#e8eef1", accent: "#0f4c55", fg: "#0f4c55", scale: 0.42,
    }), { px: 384, rough: 0.6 });
    cyl(tank, R + 0.06, R + 0.02, 0.14, 0, H + 0.05, 0, 0x2b7f8c, { rough: 0.6, metal: 0.25, seg: 26, finish: "painted" });
    holoTag(tank, "Potable water tank — interior lining", 0, H + 0.5, 0, { css: "#5eb0c4", w: 0.82 });

    const hatch = group(tank, 0.15, 0.62, R - 0.02);
    torus(hatch, 0.36, 0.05, 0, 0, 0, 0x4a5560, { rough: 0.6, metal: 0.5, seg: 8, seg2: 22 });
    holoTag(hatch, "Shell hatch", 0, 0.52, 0.06, { css: "#5eb0c4", w: 0.3 });
    reg(hits, hatch, "tank-hatch");

    const spatter = box(tank, 0.5, 0.03, 0.03, -0.6, 0.16, 0.5, 0xb4a48a, { rough: 0.9 });
    holoTag(tank, "seam", -0.6, 0.42, 0.5, { css: "#8fa9c4", w: 0.16 });
    reg(hits, spatter, "weld-spatter");
    const pits = group(tank, 0.75, 0.155, -0.15);
    for (let i = 0; i < 5; i++) {
      cyl(pits, 0.035 + (i % 2) * 0.012, 0.03, 0.012, -0.16 + i * 0.09, 0, (i % 3) * 0.07 - 0.07, 0x3d444b,
        { rough: 1.0, seg: 10 });
    }
    holoTag(tank, "floor plate", 0.75, 0.42, -0.15, { css: "#8fa9c4", w: 0.26 });
    reg(hits, pits, "pitting");
    const flash = box(tank, 0.7, 0.9, 0.02, -0.95, 1.1, 1.38, 0x9a6a49, { rough: 0.95 });
    flash.rotation.y = -0.6;
    holoTag(tank, "shell, since it was blasted", -1.05, 1.72, 1.38, { css: "#f2894b", w: 0.56 });
    reg(hits, flash, "flash-rust");

    // ------------------------------------------------------ breathing air rig
    const genset = group(g, 2.45, 0, -1.5, -0.5);
    box(genset, 1.1, 0.72, 0.62, 0, 0.5, 0, 0xe4622a, { rough: 0.7, metal: 0.3 });
    const exhaust = cyl(genset, 0.05, 0.05, 0.75, -0.42, 1.2, -0.2, 0x2b2f34, { rough: 0.85, seg: 12 });
    const exhaustPuff = particles(g, 16, 0x8f9aa4, { size: 0.045, life: 0.9, additive: false, opacity: 0.3 });
    exhaustPuff.position.set(2.03, 1.6, -1.7);
    void exhaust;
    holoTag(genset, "Generator", 0, 1.0, 0.36, { css: "#f2894b", w: 0.26 });

    const compressor = group(g, 1.85, 0, 0.35, 0.4);
    box(compressor, 0.86, 0.6, 0.54, 0, 0.42, 0, 0x2f6f8f, { rough: 0.6, metal: 0.4 });
    decal(compressor, 0.5, 0.12, 0, 0.6, 0.271, signFace("BREATHING AIR — GRADE D", { bg: "#0b2430", accent: "#5eb0c4", scale: 0.42 }));
    const airPanel = group(compressor, 0.3, 0.86, 0.1);
    box(airPanel, 0.34, 0.3, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.45 });
    const coLamp = ball(airPanel, 0.028, 0, 0.1, 0.08, 0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
    holoTag(compressor, "Breathing-air panel", 0.3, 1.16, 0.1, { css: "#5eb0c4", w: 0.44 });
    reg(hits, airPanel, "air-panel");
    const coMon = instrument(compressor, -0.24, 0.78, 0.08, { idle: "-- ppm", color: 0x2b3138, w: 0.17, d: 0.14 });
    holoTag(compressor, "CO monitor on the line", -0.24, 0.98, 0.08, { css: "#5eb0c4", w: 0.5 });
    reg(hits, coMon, "co-monitor");

    // The intake stand, staged by the generator, to be carried upwind.
    const intake = group(g, 2.05, 0, -0.55, 0.2);
    cyl(intake, 0.035, 0.045, 1.5, 0, 0.75, 0, 0x8d9aa4, { rough: 0.5, metal: 0.55, seg: 12 });
    cyl(intake, 0.09, 0.09, 0.16, 0, 1.56, 0, 0x5eb0c4, { rough: 0.5, seg: 16 });
    for (const sx of [-1, 1]) cyl(intake, 0.02, 0.02, 0.5, sx * 0.2, 0.12, 0, 0x8d9aa4, { rough: 0.6, metal: 0.5, seg: 8 })
      .rotation.z = sx * 1.2;
    holoTag(intake, "Breathing-air intake", 0, 1.86, 0, { css: "#5eb0c4", w: 0.5 });
    reg(hits, intake, "air-intake");
    const upwind = group(g, -2.45, 0, 1.45);
    for (let i = -2; i <= 2; i++) {
      box(upwind, 0.22, 0.01, 0.05, i * 0.34, 0.008, 0, 0x5eb0c4, { emissive: 0x5eb0c4, ei: 0.5, cast: false });
    }
    holoTag(upwind, "upwind, clear of every exhaust", 0, 0.5, 0, { css: "#5eb0c4", w: 0.68 });
    hits["upwind-stand"] = upwind;
    const badSpot = box(g, 0.3, 0.3, 0.3, 2.3, 0.4, -0.95, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "handy, right by the genset?", 2.3, 0.76, -0.95, { css: "#d2312b", w: 0.56 });
    reg(hits, badSpot, "intake-by-exhaust");

    // -------------------------------------------------------- blast and spray
    const pot = group(g, 0.95, 0, 1.15, -0.3);
    cyl(pot, 0.26, 0.3, 1.0, 0, 0.5, 0, 0xd8b23a, { rough: 0.6, metal: 0.35 });
    cyl(pot, 0.16, 0.26, 0.24, 0, 1.1, 0, 0xd8b23a, { rough: 0.6, metal: 0.35, seg: 16 });
    holoTag(pot, "Blast pot", 0, 1.38, 0, { css: "#f2c14b", w: 0.28 });
    const bondClamp = box(pot, 0.09, 0.07, 0.07, 0.26, 0.16, 0.1, 0x59c97b, { rough: 0.5, metal: 0.6 });
    cyl(pot, 0.01, 0.01, 1.3, 0.55, 0.1, 0.3, 0x2f7d4a, { rough: 0.7, seg: 6 }).rotation.z = Math.PI / 2.2;
    holoTag(pot, "bonded to the shell", 0.3, -0.06, 0.16, { css: "#59c97b", w: 0.42 });
    reg(hits, bondClamp, "grounding-clamp");
    const nozzle = group(g, 0.35, 0.5, 0.55, -0.9);
    cyl(nozzle, 0.035, 0.05, 0.34, 0, 0, 0, 0x4a5560, { rough: 0.5, metal: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(nozzle, "Blast nozzle", 0, 0.28, 0, { css: "#f2c14b", w: 0.3 });
    reg(hits, nozzle, "blast-nozzle");
    const grit = particles(g, 26, 0xcfd3d8, { size: 0.03, life: 0.5, additive: false, opacity: 0.45 });
    grit.position.set(0.05, 0.5, 0.3);
    grit.visible = false;

    const sandBag = box(g, 0.42, 0.22, 0.3, 1.55, 0.11, 1.5, 0xc9b58a, { rough: 0.95 });
    decal(g, 0.28, 0.08, 1.55, 0.23, 1.5, signFace("SILICA SAND", { bg: "#3a3222", accent: "#f0645b", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;
    holoTag(g, "cheaper by the pallet?", 1.55, 0.5, 1.5, { css: "#d2312b", w: 0.46 });
    reg(hits, sandBag, "silica-abrasive");

    const gun = group(g, -0.35, 0.55, 0.75, 0.6);
    box(gun, 0.07, 0.16, 0.2, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    cyl(gun, 0.018, 0.024, 0.2, 0, 0.04, 0.18, 0x8d9aa4, { rough: 0.4, metal: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(gun, "Spray gun", 0, 0.28, 0, { css: "#5eb0c4", w: 0.26 });
    reg(hits, gun, "spray-gun");
    const mist = particles(g, 24, 0xbfd8e2, { size: 0.04, life: 0.7, additive: false, opacity: 0.35 });
    mist.position.set(-0.35, 0.6, 0.45);
    mist.visible = false;

    const mixer = group(g, -1.55, 0, 0.85, 1.1);
    cyl(mixer, 0.22, 0.24, 0.42, 0, 0.21, 0, 0x2f6f4a, { rough: 0.6, seg: 18 });
    const paddle = cyl(mixer, 0.02, 0.02, 0.6, 0, 0.55, 0, 0x8d9aa4, { rough: 0.45, metal: 0.65, seg: 10 });
    box(mixer, 0.16, 0.05, 0.05, 0, 0.3, 0, 0x8d9aa4, { rough: 0.45, metal: 0.65 });
    holoTag(mixer, "Mix and induct", 0, 0.92, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, mixer, "mixer");

    // ----------------------------------------------------------- instruments
    const bench = group(g, -2.1, 0, -0.25, 1.35);
    box(bench, 1.1, 0.06, 0.5, 0, 0.88, 0, 0x6a737c, { rough: 0.7, metal: 0.3 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(bench, 0.02, 0.02, 0.88, sx * 0.48, 0.44, sz * 0.2, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const profileGauge = instrument(bench, -0.34, 0.94, 0, { idle: "-- mil", color: 0xf2c14b, w: 0.15, d: 0.13 });
    holoTag(bench, "profile gauge", -0.34, 1.1, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, profileGauge, "profile-gauge");
    const dewMeter = instrument(bench, -0.02, 0.94, 0, { idle: "-- C", color: 0x4fd1ff, w: 0.15, d: 0.13 });
    holoTag(bench, "dew point meter", -0.02, 1.1, 0, { css: "#4fd1ff", w: 0.36 });
    reg(hits, dewMeter, "dewpoint-meter");
    const wftComb = slab(bench, 0.12, 0.02, 0.1, 0.3, 0.92, 0, 0xc0c6cc, { radius: 0.005, rough: 0.4, metal: 0.7 });
    holoTag(bench, "wet film comb", 0.3, 1.06, 0, { css: "#8fa9c4", w: 0.34 });
    reg(hits, wftComb, "wft-comb");
    const holidayDet = instrument(bench, 0.3, 0.94, -0.18, { idle: "--", color: 0xf0645b, w: 0.15, d: 0.13 });
    holoTag(bench, "holiday detector", 0.3, 1.1, -0.18, { css: "#f0645b", w: 0.38 });
    reg(hits, holidayDet, "holiday-detector");
    const coatNow = box(bench, 0.2, 0.2, 0.2, -0.02, 0.68, 0.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(bench, "it is only a degree, spray it?", -0.02, 0.56, 0.26, { css: "#d2312b", w: 0.6 });
    reg(hits, coatNow, "coat-below-dewpoint");
    const shopLight = group(g, -1.05, 0, 1.75, 0.5);
    cyl(shopLight, 0.03, 0.04, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, seg: 10 });
    box(shopLight, 0.24, 0.14, 0.12, 0, 0.96, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(shopLight, "take the work light in?", 0, 1.2, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, shopLight, "unrated-light");

    // ------------------------------------------------- ventilation and permit
    const fanRig = group(g, 1.25, 0, -2.35, -0.2);
    box(fanRig, 0.6, 0.6, 0.3, 0, 0.6, 0, 0x4a5560, { rough: 0.6, metal: 0.45 });
    const fanBlades = group(fanRig, 0, 0.6, 0.18);
    for (let b = 0; b < 4; b++) {
      box(fanBlades, 0.44, 0.09, 0.02, 0, 0, 0, 0x9aa4ad, { rough: 0.6 }).rotation.z = (b * Math.PI) / 4;
    }
    const fanSwitch = group(fanRig, 0.38, 0.62, 0.1);
    box(fanSwitch, 0.05, 0.16, 0.05, 0, 0, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(fanRig, "Extraction fan", 0, 1.06, 0, { css: "#5eb0c4", w: 0.34 });
    reg(hits, fanSwitch, "vent-fan");
    cyl(g, 0.17, 0.17, 1.6, 0.55, 0.9, -2.2, 0x9aa4ad, { rough: 0.8, seg: 14 }).rotation.z = Math.PI / 2;
    const lelHead = ball(g, 0.035, -0.2, 1.5, -1.3, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(g, "LEL head in the tank", -0.2, 1.72, -1.3, { css: "#59c97b", w: 0.46 });

    const board = group(g, -2.35, 0, -1.6, 0.85);
    const permitPanel = holoPanel(board, 0.76, 0.54, 0, 1.42, 0, (cx, w, h) => {
      cx.fillStyle = "#0b2028"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5eb0c4"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#cbe9f2";
      cx.fillText("ENTRY PERMIT + COATING SPEC", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = "#e6f4f8";
      ["SPACE: POTABLE TANK No.2 — PERMIT SPACE", "ABRASIVE: NON-SILICA, PER SPEC",
        "SURFACE STANDARD: PER SPECIFICATION", "COATING: NSF/ANSI 61 CERTIFIED",
        "STEEL >= 3 C ABOVE DEW POINT, RISING", "DISINFECT PER AWWA C652 BEFORE SERVICE"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.31 + i * 0.115)));
    }, { accent: TL_ACCENT });
    cyl(board, 0.03, 0.035, 1.15, 0, 0.57, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    reg(hits, permitPanel, "entry-permit");

    const disinfect = group(g, 2.4, 0, 1.35, -1.2);
    cyl(disinfect, 0.15, 0.15, 0.66, 0, 0.33, 0, 0xf2c14b, { rough: 0.55, seg: 16 });
    box(disinfect, 0.22, 0.2, 0.2, 0.22, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    decal(disinfect, 0.16, 0.07, 0, 0.46, 0.151, signFace("C652", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.55 }));
    holoTag(disinfect, "Disinfection rig and sample tap", 0, 0.88, 0, { css: "#f2c14b", w: 0.66 });
    reg(hits, disinfect, "disinfect-rig");

    const logBook = slab(g, 0.22, 0.03, 0.28, -1.95, 0.93, -0.6, 0xe8e2d4, { radius: 0.008, rough: 0.85 });
    holoTag(g, "Cure and conditions log", -1.95, 1.12, -0.6, { css: "#8fa9c4", w: 0.52 });
    reg(hits, logBook, "cure-log");

    barrierPanel(g, -1.5, 2.15, { color: 0x5eb0c4 });
    cone(g, 0.6, 2.3, { color: 0x5eb0c4 });
    toolChest(g, 2.55, 0.05);
    // The hose watch, on the hatch, who is the reason anybody inside is found.
    const watch = standingFigure(g, -0.2, -0.45, { ry: -3.0, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(g, "Hose watch", -0.2, 2.0, -0.45, { css: "#59c97b", w: 0.28 });
    reg(hits, watch, "hose-watch");

    // -------------------------------------------------------------- live state
    let venting = false, blasting = false, spraying = false, coAlarm = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.1, -1.2),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "air-intake") { intake.position.set(-2.45, 0, 1.45); intake.rotation.y = 0; }
        if (step.id === "vent") venting = true;
        if (step.id === "blast") { blasting = false; grit.visible = false; }
        if (step.id === "spray") { spraying = false; mist.visible = false; }
        if (step.id === "holiday") {
          repaint(holidayDet.userData.screen, signFace("CLEAR", {
            bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55,
          }));
        }
      },

      // Both interruptions really happen on the site: the CO lamp on the
      // breathing-air panel turns, and the fan stops with the LEL head going
      // red. See tools/interrupt_react.mjs.
      onInterrupt(it) {
        if (it.id === "co-alarm") {
          coAlarm = true;
          coLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.8, rough: 0.4 });
        }
        if (it.id === "vent-stopped") {
          venting = false;
          lelHead.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 });
          fanBlades.scale.setScalar(0.92);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "co-alarm") {
          coAlarm = false;
          coLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
        }
        if (it.id === "vent-stopped") {
          venting = true;
          lelHead.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.8, rough: 0.4 });
          fanBlades.scale.setScalar(1);
        }
      },

      onHazard(hitId) {
        if (hitId === "intake-by-exhaust") { coLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 }); }
      },

      animate(t, dt, session) {
        const step = session?.step;

        exhaustPuff.visible = true;
        exhaustPuff.userData.step(dt, new THREE.Vector3(-0.3, 0.6, 0.1), 0.05, 0.6, 1.4);
        if (venting) fanBlades.rotation.z += dt * 9;
        if (coAlarm) coLamp.material.emissiveIntensity = 2.2 + Math.sin(t * 10) * 1.2;
        paddle.rotation.y += dt * (step?.id === "mix" && session.holding ? 10 : 0);

        blasting = step?.id === "blast";
        grit.visible = blasting;
        if (blasting) grit.userData.step(dt, new THREE.Vector3(-0.5, 0.1, -0.9), 0.06, 0.4, 0.2);
        spraying = step?.id === "spray";
        mist.visible = spraying;
        if (spraying) mist.userData.step(dt, new THREE.Vector3(-0.3, 0.15, -0.8), 0.05, 0.5, 0.2);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "air-quality") {
            repaint(coMon.userData.screen, signFace(`${Math.round(gg.t * 60)}`, {
              bg: "#0b2430", accent: gg.t < 0.12 ? "#59c97b" : "#f0645b", fg: "#cbe9f2", scale: 0.55,
            }));
          }
          if (step?.id === "profile") {
            repaint(profileGauge.userData.screen, signFace(`${(gg.t * 6).toFixed(1)}`, {
              bg: "#1c1408", accent: gg.t > 0.38 && gg.t < 0.66 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
            }));
          }
          if (step?.id === "dewpoint") {
            repaint(dewMeter.userData.screen, signFace(`${(gg.t * 9 - 1).toFixed(1)}`, {
              bg: "#0d1c24", accent: gg.t > 0.4 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (step?.id === "holiday") {
            repaint(holidayDet.userData.screen, signFace(`${Math.round(gg.t * 20)}`, {
              bg: "#2a1010", accent: gg.t < 0.12 ? "#59c97b" : "#f0645b", fg: "#ffd2ce", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
