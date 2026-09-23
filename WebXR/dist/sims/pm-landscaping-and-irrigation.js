import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Landscaping & Irrigation VR — Building Systems & Facilities,
// property management zone eighteen.
//
// The building's front lawn, planting beds and the irrigation that keeps
// them alive through a dry summer: a smart controller on the wall, a
// pressure vacuum breaker that keeps lawn water out of the drinking water,
// spray heads in the turf, a valve box per zone, and a contract mowing crew
// working around all of it. The program set to the season and the water
// agency's days rather than reset, the mower's blade serviced under lockout,
// a sheared head shut off at its valve, and the shed walked for fuel and
// guards. Generic building — only the codes, standards and unions are named.

const PMLI_ACCENT = 0x7ac85a;
const PMLI_CSS = "#7ac85a";
const PMLI_WARN = "#f0645b";

export const SIM_PM_LANDSCAPING_AND_IRRIGATION = {
  id: "pm-landscaping-and-irrigation",
  index: "234",
  domain: "Building Systems & Facilities",
  trade: "Grounds and irrigation technician — SEIU building staff, with IUOE Local 39 engineers on the backflow and the apartment association's CAMT credential",
  category: "Building Systems & Facilities",
  weather: "wind",
  certification: "ASSE 1020 for the irrigation pressure vacuum breaker and the ASSE 5110 tester who certifies it each year; AWWA M14 cross-connection control; OSHA 29 CFR 1910.95 hearing conservation for the mower and blower, 29 CFR 1910.133 eye protection and 29 CFR 1910.132 PPE for trimming; 29 CFR 1910.147 lockout on the mower blade; 29 CFR 1910.1200 hazard communication for fertiliser and fuel; NIOSH heat guidance for grounds crews; the local water agency's watering-day rules; SEIU building staff, IUOE Local 39 engineers on the backflow and the apartment association's CAMT credential",
  name: "Landscaping & Irrigation",
  title: simTitle("Landscaping & Irrigation"),
  tagline: "The front lawn in a dry summer: the controller set to the season instead of reset, the vacuum breaker walked, the mower serviced under lockout, a sheared head shut at its valve, and the shed walked",
  accent: PMLI_ACCENT,
  accentCss: PMLI_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "green-and-safe", name: "Green and Safe", note: "Program kept, heads fixed, blade serviced under lockout, and a geyser shut off at its own valve" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Grounds Crew",
    currency: "GALLONS",
    ranks: ["Grounds Helper", "Irrigation Tech", "Grounds Lead", "Grounds Supervisor", "Irrigation Certified"],
    badges: [
      { id: "program-kept", name: "Program Kept", note: "The controller adjusted, never reset", test: AWARD.stepClean("set-run-time") },
      { id: "blade-safe", name: "Blade Safe", note: "No unsafe act anywhere on the grounds", test: AWARD.safe },
      { id: "even-pressure", name: "Even Pressure", note: "Held the zone pressure through the manual run", test: AWARD.stepClean("run-zone") },
    ],
    challenges: [
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole round", test: AWARD.clean },
      { id: "steady-zone", name: "Steady Zone", note: "Held the manual run without breaking the band", test: AWARD.unbroken },
      { id: "before-the-heat", name: "Before the Heat", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "factory-reset": "You pressed the controller's factory reset to clear a fault. Mid-season, that wipes every zone's run times, the watering days the water agency allows and the seasonal adjustment, and the controller falls back to a default that waters every day — the lawn floods, the building breaks the watering rules, and nobody finds out until the bill or the fine arrives.",
    "hand-under-deck": "You reached under the mower deck to clear a clump with the engine still running. The blade spins at a speed that cuts through a boot, and a clump that lets go frees the blade all at once — the engine is off, the plug boot off and the blade blocked before a hand goes near it.",
    "refuel-hot-engine": "You started refuelling the trimmer straight after running it. Petrol splashed on a hot muffler vaporises and can flash, and the person holding the can is standing in the middle of it — let the engine cool, refuel on bare ground away from the building.",
    "dig-without-locate": "You went to dig out the broken lateral without calling for a utility locate. The front lawn carries the building's gas service, the electrical feed to the site lighting and the telecom line, and a spade through any of them is a very bad morning — the locate marks come first, then the shovel.",
  },

  lateNotes: {
    "new-nozzle": "Not yet — the new nozzle goes on after the mower is serviced and the zone is ready to run.",
    "seasonal-adjust": "The seasonal adjustment is set after the soil has been read and the zone has run — not on a guess.",
  },

  steps: [
    {
      id: "read-schedule", kind: "select", target: "schedule-sheet",
      title: "Read the controller program and the watering rules",
      cue: "Check the zone run times and the water agency's permitted days before touching the controller.",
      why: "The controller's program is a season's worth of decisions about soil, sun and plant type, and the water agency's permitted days are a rule the building can be fined for breaking. Reading both first means any change you make is an adjustment to a known program, not a guess that quietly overwrites the work of whoever set it up in spring.",
    },
    {
      id: "walk-zones", kind: "find", noHint: true,
      targets: ["head-on-sidewalk", "pvb-bonnet-drip"],
      itemNames: { "head-on-sidewalk": "spray head soaking the sidewalk", "pvb-bonnet-drip": "vacuum breaker dripping at its bonnet" },
      itemNotes: {
        "head-on-sidewalk": "This head has been knocked round and is spraying the public sidewalk instead of the bed. It wastes water, leaves a slick path for residents and is exactly what a water agency inspector writes up.",
        "pvb-bonnet-drip": "The pressure vacuum breaker is dripping from under its bonnet. A little spill at start-up is normal; a steady drip means the air inlet poppet is not seating, and the device that keeps lawn water out of the drinking water needs its tester.",
      },
      title: "Walk the zones",
      cue: "Find the head that is watering the wrong thing and the device that is not protecting the water.",
      why: "Irrigation problems hide in plain sight because nobody watches the system run at five in the morning. Walking the zones finds the head that is wasting water on concrete, and it finds the vacuum breaker that is the only thing between fertilised lawn water and the building's drinking water — AWWA's cross-connection manual treats lawn irrigation as a classic backflow hazard for exactly that reason.",
    },
    {
      id: "set-run-time", kind: "turn", target: "controller-dial",
      title: "Adjust zone four's run time",
      cue: "Turn the controller dial to trim zone four's run time for the shaded bed.",
      why: "A zone's run time is set for its own sun, soil and plants, and a shaded bed watered like the sunny lawn next to it rots its roots and runs off onto the sidewalk. Trimming the one zone on the dial keeps every other zone's program intact — which is the whole difference between adjusting a controller and resetting it.",
      turn: { turns: 0.4, axis: "z", label: "ZONE 4 RUN TIME" },
    },
    {
      id: "read-soil", kind: "gauge", target: "moisture-probe",
      title: "Read the soil moisture in the bed",
      cue: "Push the probe into the root zone and commit when the reading settles in the band.",
      why: "What the lawn looks like from the path is a poor guide to what is happening at the roots, and overwatering kills a lawn as surely as thirst does. The probe reading in the root zone is what the run time should answer to, and it turns an argument about whether the grass looks dry into a number.",
      gauge: { label: "SOIL MOISTURE", speed: 0.55, green: [0.38, 0.6], readout: (t) => `${Math.round(t * 60)}% VWC`, missNote: "Outside the band — saturated drowns the roots, dry means the zone isn't reaching them. Read it again, deeper." },
    },
    {
      id: "lockout-mower", kind: "sequence",
      targets: ["mower-engine-off", "spark-plug-boot", "blade-block"],
      itemNames: { "mower-engine-off": "engine off, key out", "spark-plug-boot": "spark plug boot pulled", "blade-block": "blade block set" },
      title: "Lock out the mower for its blade",
      cue: "Engine off and key out, spark plug boot off, then the blade block set before any hand goes under.",
      why: "A mower blade can turn the engine over when it is moved by hand, and an engine with its plug connected can fire on that one turn. Key out, boot off and a block wedged against the blade is the grounds crew's lockout: nothing can start it, and the blade cannot move while the nut is worked.",
      outOfOrderNote: "Key, plug boot, block — setting the block with the plug still connected leaves the engine one blade-turn from firing.",
    },
    {
      id: "loosen-blade", kind: "hold", target: "blade-wrench", seconds: 5,
      title: "Hold the wrench while the blade nut breaks loose",
      cue: "Brace the wrench against the blocked blade and hold steady until the nut breaks free.",
      why: "A blade nut is torqued hard and breaks loose all at once, and a hand braced badly slides straight along a sharp edge when it does. Holding the wrench steady against the blocked blade, gloved, pulling away from the edge, is how a blade change ends without stitches.",
      holdBreakNote: "You let off before the nut broke free. Jerking at it again is how the wrench slips onto the edge — hold steady until it gives.",
    },
    {
      id: "fit-nozzle", kind: "drag", target: "new-nozzle",
      title: "Fit a new nozzle on the misaligned head",
      cue: "Carry the matched nozzle to the head, seat it and turn its arc back onto the bed.",
      why: "Heads in a zone are matched for precipitation rate, and a nozzle swapped for whatever was in the truck makes one patch of the zone flood while the rest stays dry. Seating the matched nozzle and setting its arc back onto the bed fixes both the wasted water and the slick on the sidewalk.",
      drag: { to: "head-socket", radius: 0.5, missNote: "Not on the head — a nozzle left on the path is a head still spraying the sidewalk." },
    },
    {
      id: "run-zone", kind: "track", target: "zone-pressure", seconds: 7,
      title: "Run zone four manually and watch its pressure",
      cue: "Start zone four from the controller and keep the pressure in the band as the heads pop up.",
      why: "Every head in a zone is designed for a pressure band: too low and the spray falls short, leaving dry rings; too high and it mists away on the wind. Watching the pressure as the zone runs is also how a broken head or a split lateral announces itself, because pressure falls off a cliff the moment water has an easier way out.",
      track: { start: 0.25, green: [0.4, 0.64], rise: 0.44, fall: 0.38, drift: 0.12, label: "ZONE PRESSURE", readout: (v) => (v < 0.4 ? "falling short" : v > 0.64 ? "misting away" : "full throw") },
      holdBreakNote: "The pressure left the band. Short means dry rings, high means mist on the wind — bring it back to full throw.",
    },
    {
      id: "walk-shed", kind: "find", noHint: true,
      targets: ["fuel-can-uncapped", "cracked-trimmer-guard"],
      itemNames: { "fuel-can-uncapped": "fuel can left uncapped by the shed door", "cracked-trimmer-guard": "trimmer with a cracked debris guard" },
      itemNotes: {
        "fuel-can-uncapped": "The fuel can's cap is off and it is sitting in the sun by the door. Vapour pours out of it at ankle height toward the mower's hot muffler.",
        "cracked-trimmer-guard": "The string trimmer's debris guard is split through. Without it, stones and glass come off the line toward the operator's legs and eyes.",
      },
      title: "Walk the tool shed",
      cue: "Find the fuel and the tool that will hurt someone on the next round.",
      why: "The tool shed is where a grounds crew's worst days usually start: fuel left open near an engine, a guard cracked last week and used anyway. The hazard communication standard covers the fuel and the PPE standard covers the eyes and legs the guard protects — neither helps if the shed is not walked.",
    },
    {
      id: "seasonal-adjust", kind: "gauge", target: "seasonal-adjust",
      title: "Set the controller's seasonal adjustment",
      cue: "Watch the seasonal adjust percentage and commit where it matches this week's weather.",
      why: "The seasonal adjustment scales every zone's run time together as the weather changes, which is how a controller follows a heatwave or a cool week without anyone touching the individual programs. Set against the week's weather and the soil reading, it keeps the lawn alive on the least water the season allows.",
      gauge: { label: "SEASONAL ADJUST", speed: 0.55, green: [0.45, 0.66], readout: (t) => `${Math.round(40 + t * 90)}%`, missNote: "Outside the week's band — too low scorches the lawn, too high floods it. Set it again." },
    },
    {
      id: "lock-controller", kind: "turn", target: "controller-cabinet-lock",
      title: "Lock the controller cabinet",
      cue: "Close the controller's cabinet and turn its lock.",
      why: "An unlocked controller on the side of a building is one curious resident, contractor or passer-by away from a factory reset or a zone left running all night. Locking it keeps the program that was just set exactly as it was set, and it makes the next change somebody's decision rather than an accident.",
      turn: { turns: 0.3, axis: "z", label: "CABINET LOCK" },
    },
    {
      id: "crew-checkin", kind: "select", target: "contractor-checkin",
      title: "Check in with the mowing contractor",
      cue: "Show the contractor where the heads are flagged, hand over the sheared head, and ask how the crew is doing in the heat.",
      why: "The contract mowing crew will be back next week over the same heads, and a sheared head handed over in person — with the flags that mark the others — is how it does not happen twice. A crew working in the sun with loud machines all morning is also a crew worth asking about water, shade and hearing, which NIOSH's heat guidance puts on the lead, not the calendar.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the round in the building log",
      cue: "Log the run-time change, the soil reading, the head repairs, the vacuum breaker drip and the sheared head.",
      why: "The building log is where the vacuum breaker's drip is recorded until the certified tester has been, where the sheared head becomes a back-charge to the mowing contract, and where next spring's technician finds out why zone four runs shorter than the others. A controller program with no written history is one that gets reset the first time it is misunderstood.",
    },
  ],

  interrupts: [
    {
      id: "treated-lawn",
      kind: "Resident walking onto the treated lawn",
      after: "loosen-blade", delay: 3, seconds: 12,
      alert: "While you hold the wrench, a resident walking her dog steps over the knocked-down posting flag onto the lawn that was treated with fertiliser this morning.",
      cue: "Stand the posting flag back up and point her to the path. The blade stays blocked.",
      target: "posting-flag",
      why: "Posting flags are how the building tells residents and their pets to keep off a treated lawn until the product's label says it is safe, and a flag lying in the grass tells them nothing. Standing it back up and pointing to the path answers her now and everyone who comes after her.",
      missNote: "She and the dog crossed the treated lawn the whole window. The flag is still lying in the grass, and the next resident will do the same.",
      wrongNote: "That doesn't warn her. The posting flag is what tells residents the lawn has been treated — stand it back up.",
    },
    {
      id: "sheared-head",
      kind: "Sprinkler head sheared by a mower",
      after: "run-zone", delay: 3, seconds: 12,
      alert: "The contract mower clips a head on zone four as it runs — a geyser shoots across the walkway where residents are coming and going.",
      cue: "Close zone four's valve in the valve box. Don't reach over the geyser for the head.",
      target: "zone-valve-box",
      why: "A sheared head dumps the zone's whole flow out of one broken riser, flooding the bed, washing mulch onto the path and spraying residents on the walkway. Closing the zone valve stops it at its source in seconds, where reaching into the geyser to stuff the riser only gets you soaked and the water keeps coming.",
      missNote: "The geyser ran across the walkway the whole window. The bed is washing out, the path is flooded, and the zone is still open.",
      wrongNote: "That doesn't stop the flow. Zone four's valve in the green valve box shuts the geyser off at its source.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PMLI_ACCENT);

    // ------------------------------------------------------------ lawn, beds, walkway
    const lawnTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 10, base: "#4f8a3a", base2: "#467f33", seam: "rgba(30,60,20,0.18)" }), { repeat: 4, px: 384 });
    const lawn = box(g, 7.0, 0.04, 5.0, 0, 0.02, -0.4, 0x4f8a3a, { rough: 0.95 });
    lawn.material = texturedMat(lawnTex, { rough: 0.95, metal: 0.0, color: 0x6aa84f });
    const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#c8c0b0", base2: "#bdb5a4", seam: "rgba(60,50,40,0.35)" }), { repeat: 3, px: 256 });
    const walk = box(g, 1.2, 0.05, 5.0, 0.4, 0.03, -0.4, 0xc8c0b0, { rough: 0.8 });
    walk.material = texturedMat(walkTex, { rough: 0.8, metal: 0.02, color: 0xd8d0c0 });
    const bed = box(g, 2.0, 0.06, 1.3, -2.1, 0.03, -1.9, 0x5a4030, { rough: 0.95 });
    void bed;
    for (let i = 0; i < 6; i++) ball(g, 0.22 + (i % 3) * 0.05, -2.8 + i * 0.28, 0.25, -2.2 + (i % 2) * 0.35, 0x3f7a34 + (i % 2) * 0x051005, { rough: 0.9, seg: 10 });
    for (const [tx, tz] of [[-2.8, 0.9], [2.8, -2.3]]) {
      cyl(g, 0.1, 0.14, 1.8, tx, 0.9, tz, 0x6a4a2a, { rough: 0.9, seg: 10 });
      ball(g, 0.8, tx, 2.2, tz, 0x3f7a34, { rough: 0.9, seg: 12 });
    }
    // Building wall with the controller, a clipped hedge along its foot,
    // edging stones along the walk, a bench and two path bollards.
    box(g, 7.0, 3.0, 0.2, 0, 1.5, -3.0, 0xc8b8a0, { rough: 0.85 });
    for (let i = 0; i < 6; i++) box(g, 0.5, 0.55, 0.4, 0.9 + i * 0.42, 0.3, -2.7, i % 2 ? 0x3f7a34 : 0x447f38, { rough: 0.95 });
    for (let i = 0; i < 9; i++) for (const sx of [-0.63, 0.63]) box(g, 0.05, 0.06, 0.45, 0.4 + sx, 0.05, -2.6 + i * 0.52, 0x9a9488, { rough: 0.9 });
    const parkBench = group(g, 2.6, 0, -1.2, -Math.PI / 2);
    box(parkBench, 1.2, 0.05, 0.4, 0, 0.45, 0, 0x8a6a4a, { rough: 0.85 });
    box(parkBench, 1.2, 0.3, 0.05, 0, 0.66, -0.18, 0x8a6a4a, { rough: 0.85 });
    for (const sx of [-1, 1]) box(parkBench, 0.06, 0.45, 0.4, sx * 0.52, 0.225, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const bz of [-1.6, 0.8]) {
      cyl(g, 0.07, 0.08, 0.8, 1.15, 0.4, bz, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
      cyl(g, 0.08, 0.08, 0.08, 1.15, 0.84, bz, 0xfff0c8, { emissive: 0xffe0a0, ei: 0.6, rough: 0.3, seg: 10 });
    }

    // ------------------------------------------------------------ controller
    const ctl = group(g, -0.9, 1.3, -2.85);
    box(ctl, 0.5, 0.6, 0.16, 0, 0, 0, 0x5a6a5a, { rough: 0.5, metal: 0.3 });
    const ctlFace = decal(ctl, 0.34, 0.16, 0, 0.12, 0.085, signFace("Z4 · 12 MIN", { bg: "#0d1c14", accent: PMLI_CSS, fg: "#e4ffd6", scale: 0.42 }), { glow: true, ei: 0.8, px: 192 });
    const dial = group(ctl, -0.1, -0.1, 0.09);
    cyl(dial, 0.06, 0.06, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const dialPtr = box(dial, 0.008, 0.04, 0.006, 0, 0.024, 0.018, 0xf2c14b, { rough: 0.4 });
    reg(hits, dial, "controller-dial");
    const resetBtn = cyl(ctl, 0.02, 0.02, 0.02, 0.15, -0.2, 0.09, 0xd8232a, { rough: 0.4, seg: 12 });
    resetBtn.rotation.x = Math.PI / 2;
    holoTag(ctl, "factory reset?", 0.15, -0.34, 0.09, { css: PMLI_WARN, w: 0.28 });
    reg(hits, resetBtn, "factory-reset");
    const adjust = decal(ctl, 0.14, 0.08, 0.12, -0.08, 0.085, signFace("ADJ --%", { bg: "#0d1c14", accent: PMLI_CSS, fg: "#e4ffd6", scale: 0.45 }), { glow: true, ei: 0.8, px: 128 });
    reg(hits, adjust, "seasonal-adjust");
    const lock = group(ctl, 0.22, 0.2, 0.09);
    cyl(lock, 0.02, 0.02, 0.02, 0, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    const lockSlot = box(lock, 0.006, 0.025, 0.01, 0, 0, 0.012, 0x22262b, { rough: 0.5 });
    reg(hits, lock, "controller-cabinet-lock");
    holoTag(ctl, "irrigation controller", 0, 0.42, 0.09, { css: PMLI_CSS, w: 0.36 });
    const schedule = decal(g, 0.3, 0.38, -0.2, 1.3, -2.88, paperFace("PROGRAM", ["Z1 lawn 14m · Z2 bed 8m", "Z3 lawn 14m · Z4 shade 12m", "Days: Tue · Sat (agency)", "Start 5:00 am"], { bg: "#f4efe0", band: "#3a6a2a" }), { px: 256 });
    reg(hits, schedule, "schedule-sheet");

    // ------------------------------------------------------------ pressure vacuum breaker
    const pvb = group(g, 1.6, 0, -2.6);
    for (const sx of [-0.2, 0.2]) cyl(pvb, 0.03, 0.03, 0.9, sx, 0.45, 0, 0xb87333, { rough: 0.4, metal: 0.8, seg: 10 });
    cyl(pvb, 0.03, 0.03, 0.5, 0, 0.9, 0, 0xb87333, { rough: 0.4, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const pvbBody = group(pvb, 0, 0.98, 0);
    box(pvbBody, 0.16, 0.14, 0.12, 0, 0, 0, 0xb8862b, { rough: 0.35, metal: 0.7 });
    cyl(pvbBody, 0.05, 0.05, 0.1, 0, 0.12, 0, 0x2f6fb0, { rough: 0.4, seg: 12 });
    const drip = particles(pvb, 10, 0x9fd4ff, { size: 0.02, life: 0.5, additive: false, opacity: 0.7 });
    reg(hits, pvbBody, "pvb-bonnet-drip");
    holoTag(pvb, "pressure vacuum breaker", 0, 1.35, 0.05, { css: PMLI_CSS, w: 0.4 });

    // ------------------------------------------------------------ heads, valve box, flags
    const heads = [];
    for (const [hx, hz] of [[-1.6, -0.8], [-0.6, -1.4], [-2.4, -0.2], [1.6, -0.9], [2.2, 0.4]]) {
      const hd = group(g, hx, 0.04, hz);
      cyl(hd, 0.035, 0.035, 0.05, 0, 0.02, 0, 0x22262b, { rough: 0.6, seg: 10 });
      heads.push(hd);
    }
    const misHead = group(g, 1.05, 0.04, 0.4);
    cyl(misHead, 0.035, 0.035, 0.12, 0, 0.06, 0, 0x22262b, { rough: 0.6, seg: 10 });
    const misSpray = particles(misHead, 14, 0xbfe6ff, { size: 0.025, life: 0.4, additive: false, opacity: 0.6 });
    reg(hits, misHead, "head-on-sidewalk");
    const headSocket = box(misHead, 0.14, 0.14, 0.14, 0, 0.1, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["head-socket"] = headSocket;
    holoTag(misHead, "head on the sidewalk", 0, 0.32, 0, { css: PMLI_CSS, w: 0.32 });
    const nozzleBag = group(g, 0.95, 0, 1.35);
    box(nozzleBag, 0.3, 0.04, 0.24, 0, 0.72, 0, 0x7a6048, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(nozzleBag, 0.03, 0.72, 0.03, sx * 0.13, 0.36, sz * 0.1, 0x53606b, { rough: 0.5 });
    const nozzle = group(nozzleBag, 0, 0.76, 0);
    cyl(nozzle, 0.02, 0.025, 0.05, 0, 0, 0, 0x2f6fb0, { rough: 0.5, seg: 10 });
    reg(hits, nozzle, "new-nozzle");
    holoTag(nozzleBag, "matched nozzle", 0, 0.98, 0, { css: PMLI_CSS, w: 0.28 });
    const valveBox = group(g, -1.3, 0.04, 0.45);
    box(valveBox, 0.4, 0.04, 0.3, 0, 0.02, 0, 0x2f6a2a, { rough: 0.7 });
    decal(valveBox, 0.2, 0.06, 0, 0.042, 0, signFace("IRR · Z4", { bg: "#2f6a2a", accent: "#f2c14b", scale: 0.55 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg(hits, valveBox, "zone-valve-box");
    holoTag(valveBox, "zone 4 valve box", 0, 0.24, 0, { css: PMLI_CSS, w: 0.3 });
    const zoneGauge = group(g, -1.0, 0.04, -0.3);
    cyl(zoneGauge, 0.02, 0.02, 0.4, 0, 0.2, 0, 0xb87333, { rough: 0.4, metal: 0.8, seg: 8 });
    cyl(zoneGauge, 0.06, 0.06, 0.03, 0, 0.44, 0.02, 0xdfe4e8, { rough: 0.3, seg: 16 }).rotation.x = Math.PI / 2;
    const zNeedle = box(zoneGauge, 0.005, 0.045, 0.004, 0, 0.45, 0.04, 0xd8232a, { rough: 0.4 });
    reg(hits, zoneGauge, "zone-pressure");
    holoTag(zoneGauge, "zone 4 pressure", 0, 0.62, 0, { css: PMLI_CSS, w: 0.28 });
    const geyser = group(g, -2.4, 0.04, -0.2);
    const geyserCol = cyl(geyser, 0.03, 0.08, 1.4, 0, 0.7, 0, 0xbfe6ff, { rough: 0.1, opacity: 0.55, transparent: true, seg: 10 });
    const geyserSpray = particles(geyser, 20, 0xdff4ff, { size: 0.04, life: 0.6, additive: false, opacity: 0.7 });
    geyserCol.visible = false;
    const flagPole = group(g, -0.5, 0.04, 0.2);
    const flag = group(flagPole, 0, 0, 0);
    cyl(flag, 0.006, 0.006, 0.6, 0, 0.3, 0, 0xdfe4e8, { rough: 0.5, seg: 6 });
    box(flag, 0.14, 0.1, 0.004, 0.07, 0.55, 0, 0xf2c14b, { rough: 0.6 });
    flag.rotation.z = 1.4;
    reg(hits, flagPole, "posting-flag");
    holoTag(flagPole, "posting flag", 0.1, 0.32, 0, { css: PMLI_CSS, w: 0.24 });
    const probe = group(g, -1.9, 0.04, -1.5);
    cyl(probe, 0.008, 0.008, 0.4, 0, 0.15, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8, seg: 6 });
    const probeRead = instrument(probe, 0, 0.42, 0, { idle: "--% VWC", color: 0xf2c14b, w: 0.12, d: 0.16 });
    reg(hits, probeRead, "moisture-probe");
    holoTag(probe, "soil probe", 0, 0.64, 0, { css: PMLI_CSS, w: 0.2 });
    const shovel = group(g, -0.2, 0.04, -1.9, 0.3);
    cyl(shovel, 0.015, 0.015, 1.1, 0, 0.6, 0, 0x8a6a3a, { rough: 0.8, seg: 6 });
    box(shovel, 0.2, 0.26, 0.02, 0, 0.1, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    holoTag(shovel, "dig it out now?", 0, 1.3, 0, { css: PMLI_WARN, w: 0.28 });
    reg(hits, shovel, "dig-without-locate");

    // ------------------------------------------------------------ mower
    const mower = group(g, 1.9, 0, 1.2, -0.6);
    box(mower, 0.7, 0.18, 0.8, 0, 0.2, 0, 0x2f7a3a, { rough: 0.5, metal: 0.3 });
    cyl(mower, 0.18, 0.18, 0.3, 0, 0.42, 0.05, 0x3a3f45, { rough: 0.5, metal: 0.5, seg: 14 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(mower, 0.09, 0.09, 0.05, sx * 0.36, 0.09, sz * 0.32, 0x1b1e22, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(mower, 0.015, 0.015, 0.9, sx * 0.25, 0.7, -0.6, 0x8b929a, { rough: 0.5, seg: 6 }).rotation.x = 0.6;
    box(mower, 0.55, 0.04, 0.04, 0, 1.05, -0.85, 0x8b929a, { rough: 0.5 });
    const keySw = cyl(mower, 0.025, 0.025, 0.03, 0.12, 0.6, -0.08, 0xf2c14b, { rough: 0.4, seg: 10 });
    reg(hits, keySw, "mower-engine-off");
    const plugBoot = group(mower, -0.12, 0.5, 0.2);
    box(plugBoot, 0.04, 0.04, 0.08, 0, 0, 0, 0x1b1e22, { rough: 0.6 });
    hose(mower, [[-0.12, 0.5, 0.24], [-0.08, 0.56, 0.1], [0, 0.55, 0.05]], 0.006, 0x1b1e22, { steps: 6 });
    reg(hits, plugBoot, "spark-plug-boot");
    const block = group(mower, 0.42, 0.1, 0.1);
    box(block, 0.14, 0.06, 0.06, 0, 0, 0, 0xc8903a, { rough: 0.8 });
    reg(hits, block, "blade-block");
    const wrench = group(mower, 0.42, 0.06, 0.32);
    box(wrench, 0.24, 0.02, 0.03, 0, 0, 0, 0xc7cdd2, { rough: 0.3, metal: 0.9 });
    reg(hits, wrench, "blade-wrench");
    holoTag(mower, "blade · block · wrench", 0.42, 0.32, 0.3, { css: PMLI_CSS, w: 0.36 });
    const underDeck = box(mower, 0.3, 0.06, 0.3, -0.3, 0.08, 0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mower, "clear it by hand?", -0.3, 0.3, 0.5, { css: PMLI_WARN, w: 0.3 });
    reg(hits, underDeck, "hand-under-deck");

    // ------------------------------------------------------------ tool shed
    const shed = group(g, -2.6, 0, 1.7, 0.4);
    box(shed, 1.2, 1.8, 0.9, 0, 0.9, -0.2, 0x8a6a4a, { rough: 0.85 });
    box(shed, 1.3, 0.08, 1.0, 0, 1.84, -0.2, 0x5a4030, { rough: 0.8 });
    box(shed, 0.6, 1.5, 0.02, 0.1, 0.75, 0.26, 0x3a2a1a, { rough: 0.8 });
    const fuelCan = group(shed, 0.75, 0, 0.5);
    box(fuelCan, 0.22, 0.26, 0.14, 0, 0.13, 0, 0xd8232a, { rough: 0.5 });
    cyl(fuelCan, 0.02, 0.02, 0.08, 0.06, 0.3, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    reg(hits, fuelCan, "fuel-can-uncapped");
    const trimmer = group(shed, -0.5, 0, 0.55, 0.3);
    cyl(trimmer, 0.015, 0.015, 1.4, 0, 0.55, 0, 0x8b929a, { rough: 0.5, seg: 6 }).rotation.z = 0.6;
    box(trimmer, 0.14, 0.12, 0.1, -0.35, 1.05, 0, 0xf28c2a, { rough: 0.5 });
    const guard = box(trimmer, 0.16, 0.02, 0.1, 0.4, 0.05, 0, 0xf28c2a, { rough: 0.5 });
    reg(hits, guard, "cracked-trimmer-guard");
    const hotRefuel = box(trimmer, 0.18, 0.16, 0.14, -0.35, 1.05, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(trimmer, "refuel it hot?", -0.35, 1.25, 0.05, { css: PMLI_WARN, w: 0.26 });
    reg(hits, hotRefuel, "refuel-hot-engine");

    // ------------------------------------------------------------ log
    const logBoard = holoPanel(g, 0.56, 0.38, 2.7, 1.6, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,20,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMLI_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eefbe6";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · GROUNDS", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#d4eec8";
      ["Z4 run time · soil %", "nozzle · sheared head", "PVB drip → tester", "seasonal adjust"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: -0.6, accent: PMLI_ACCENT });
    reg(hits, logBoard, "building-log");

    // ------------------------------------------------------------ crew
    const contractor = standingFigure(g, 2.55, 2.05, { ry: -2.5, cloth: 0x3a5a2a, trousers: 0x2b3138, vest: 0xd8e33a, cap: 0x3a5a2a });
    reg(hits, contractor, "contractor-checkin");
    const walker = standingPerson(g, -0.8, 0.9, { ry: Math.PI, cloth: 0x8a5a9a, hiVis: false });
    const dog = group(walker.root, 0.4, 0, 0.2);
    box(dog, 0.45, 0.2, 0.16, 0, 0.32, 0, 0x3a2a1a, { rough: 0.9 });
    ball(dog, 0.09, 0.25, 0.45, 0, 0x3a2a1a, { rough: 0.9, seg: 10 });
    walker.root.visible = false;

    let gushing = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.4, 0.8, -1.2),

      onStepComplete(step) {
        if (step.id === "set-run-time") { dialPtr.rotation.z = -0.8; repaint(ctlFace, signFace("Z4 · 9 MIN", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.42 })); }
        if (step.id === "read-soil") repaint(probeRead.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "lockout-mower") { plugBoot.position.set(-0.2, 0.62, 0.3); block.position.set(0.3, 0.1, 0.1); }
        if (step.id === "fit-nozzle") { nozzle.visible = false; misSpray.visible = false; misHead.rotation.y = 1.2; }
        if (step.id === "walk-shed") { fuelCan.position.set(0.75, 0, -0.3); guard.visible = false; }
        if (step.id === "seasonal-adjust") repaint(adjust, signFace("ADJ 90%", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.45 }));
        if (step.id === "lock-controller") lockSlot.rotation.z = Math.PI / 2;
      },

      onInterrupt(it) {
        if (it.id === "treated-lawn") walker.root.visible = true;
        if (it.id === "sheared-head") { gushing = true; geyserCol.visible = true; geyserSpray.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "treated-lawn") {
          if (it.resolved === "answered") { flag.rotation.z = 0; walker.root.position.set(0.4, 0, 1.4); }
          else walker.root.visible = false;
        }
        if (it.id === "sheared-head") {
          gushing = false; geyserCol.visible = false; geyserSpray.visible = false;
          if (it.resolved === "answered") valveBox.position.y = 0.06;
        }
      },

      animate(t, dt, session) {
        drip.visible = true;
        drip.userData?.step?.(dt, new THREE.Vector3(0, 0.92, 0.05), 0.03, 0.05, -2.5);
        if (misSpray.visible) misSpray.userData?.step?.(dt, new THREE.Vector3(0, 0.14, 0), 0.05, 0.6, -1.2);
        if (gushing) geyserSpray.userData?.step?.(dt, new THREE.Vector3(0, 1.3, 0), 0.2, 0.6, -1.5);
        contractor.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "read-soil") repaint(probeRead.userData.screen, signFace(`${Math.round(gg.t * 60)}%`, { bg: "#0d1c24", accent: gg.t >= 0.38 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
          if (session.step?.id === "seasonal-adjust") repaint(adjust, signFace(`ADJ ${Math.round(40 + gg.t * 90)}%`, { bg: "#0d1c14", accent: gg.t >= 0.45 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#e4ffd6", scale: 0.45 }));
        }
        if (session?.track && session.step?.id === "run-zone") zNeedle.rotation.z = 0.9 - session.track.v * 1.8;
      },
    };
  },
};
