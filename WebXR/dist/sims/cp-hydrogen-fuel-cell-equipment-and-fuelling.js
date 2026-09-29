import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hydrogen Fuel Cell Equipment and Fuelling VR — CLEANPORTS, the zero-emission port operations
// block of the Bay Program wave.
//
// A generic container-terminal setting (no real terminal, equipment maker or
// model is shown). The practice is taught from the standards the
// certification line names; the Clean Ports note below says which workforce
// partner the Port of Oakland's programme names for this kind of training,
// from the facts file only, and never claims the station is that partner's
// curriculum. Union tags come from tools/unions.json.

const CPHY_ACCENT = 0x7fb8ff;
const CPHY_CSS = "#7fb8ff";

export const SIM_CP_HYDROGEN_FUEL_CELL_EQUIPMENT_AND_FUELLING = {
  id: "cp-hydrogen-fuel-cell-equipment-and-fuelling",
  index: "844",
  domain: "Maritime",
  trade: "ILWU equipment operator or IAM mechanic fuelling a hydrogen fuel cell top pick at a terminal fuelling station and checking its fuel cell compartment",
  category: "Maritime & Ports",
  weather: "clear",
  certification: "ILWU operator training; NFPA 55 compressed gases and cryogenic fluids code for gaseous hydrogen storage and dispensing; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.178 powered industrial trucks for the operator's pre-use check; 29 CFR 1910.147 the control of hazardous energy before the fuel cell compartment is opened; NFPA 70 (NEC) for the dispenser's classified-area wiring; and the dispenser's own posted fuelling instructions",
  name: "Hydrogen Fuel Cell Equipment and Fuelling",
  title: simTitle("Hydrogen Fuel Cell Equipment and Fuelling VR"),
  accent: CPHY_ACCENT,
  accentCss: CPHY_CSS,
  tagline: "A hydrogen fuel cell top pick at the terminal's fuelling island: the posted instructions read, ignition sources left outside the island, the machine parked and shut down, the static ground clipped, a frosted and scuffed nozzle seal found and swapped for the spare, the nozzle seated, the fill pressure watched to the stop, the portable detector reading clean at every fitting, a hiss at the tank valve found with the detector rather than a hand, the dispenser's emergency stop pressed, the compartment locked out before the cover comes off, and the fuelling logged",
  parSeconds: 340,
  footprint: 3,
  badge: {"id":"cphy-badge","name":"Clean Fill","note":"No ignition source on the island, the ground clipped first and every fitting checked with the detector, never a hand"},
  unions: ["ilwu","iam"],
  cleanPorts: "The Port of Oakland's Clean Ports programme funds hydrogen cargo handling equipment among its activities and names PMA for skills and safety training on operating the zero-emission equipment; this station teaches general hydrogen fuelling practice from its cited standards and is not PMA's curriculum.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Clean Fill",
    currency: "TAG",
    ranks: ["Yard Hand", "Zero-Emission Crew", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "cphy-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("detector-check-fittings") },
      { id: "cphy-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "cphy-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "cphy-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cphy-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phone-on-island": "You carried your phone onto the fuelling island. Phones and other electronics are kept outside the line because a spark is all a hydrogen release needs.",
    "feel-for-leak": "You reached out to feel for the leak with your hand. Hydrogen burns nearly invisible and a high-pressure leak can cut skin — only the detector looks for leaks.",
    "fuel-with-cell-running": "You started to connect the nozzle with the fuel cell system still running. Shut down first so the system is not drawing from the tank while it fills.",
    "force-damaged-nozzle": "You pushed the nozzle with the scuffed seal onto the receptacle. A damaged seal leaks at the connection under fill pressure; use the spare and report it."
  },

  steps: [
    {
      "id": "read-fuelling-instructions",
      "kind": "select",
      "target": "fuelling-instructions-sign",
      "title": "Read the island's posted fuelling instructions",
      "cue": "Read the posted steps: shut down, ground, connect, fill, disconnect — and where the dispenser's emergency stop is.",
      "why": "Hydrogen dispensers differ in how their nozzles lock and how the fill is started, and the posted instructions are the station's own sequence for this dispenser; reading them each time is what keeps a habit from another island from becoming a nozzle pulled under pressure."
    },
    {
      "id": "leave-ignition-sources",
      "kind": "sequence",
      "anyOrder": true,
      "targets": [
        "phone-locker",
        "lighter-bin"
      ],
      "itemNames": {
        "phone-locker": "phone into the island locker",
        "lighter-bin": "lighter into the bin outside the line"
      },
      "title": "Leave ignition sources outside the island",
      "cue": "Phone into the locker and anything that can spark or flame into the bin before crossing the island's painted line.",
      "why": "Hydrogen ignites with very little energy across a wide range of mixtures with air, so the fuelling island is kept free of sparks and flames by rule rather than judgement; the painted line is where that rule starts, and it applies to everyone crossing it."
    },
    {
      "id": "park-and-shut-down",
      "kind": "select",
      "target": "top-pick-key",
      "title": "Park, lower the spreader, shut the machine down",
      "cue": "Spreader down, parking brake on, fuel cell system shut down from the key before any hose is touched.",
      "why": "A top pick with its spreader raised or its fuel cell still running is a machine with stored energy and a live hydrogen supply, and the fill is done with both brought to rest; shutting down first also stops the system drawing from the tank while it is being filled."
    },
    {
      "id": "clip-static-ground",
      "kind": "drag",
      "target": "ground-clamp",
      "title": "Clip the static ground before the nozzle",
      "cue": "Carry the dispenser's ground clamp to the machine's bonding point and clip it on.",
      "why": "Gas flowing through a hose can build a static charge, and a spark at the nozzle is the ignition the whole island is designed to avoid; the ground goes on first and comes off last so the machine and dispenser stay at the same potential throughout.",
      "drag": {
        "to": "bonding-point",
        "radius": 0.5,
        "missNote": "Not clipped — carry the clamp all the way to the machine's marked bonding point and close it on the bare metal tab."
      }
    },
    {
      "id": "find-damaged-nozzle-seal",
      "kind": "find",
      "noHint": true,
      "targets": [
        "scuffed-nozzle-seal"
      ],
      "itemNames": {
        "scuffed-nozzle-seal": "scuffed seal inside the nozzle"
      },
      "itemNotes": {
        "scuffed-nozzle-seal": "The nozzle's seal ring is scuffed and flattened on one side — it may not seal against the receptacle, and a poor seal leaks at the connection under fill pressure."
      },
      "title": "Look into the nozzle and receptacle",
      "cue": "Check the nozzle's seal ring and the machine's receptacle for damage, dirt or ice before connecting.",
      "why": "The connection between nozzle and receptacle holds the full fill pressure, and a damaged seal or grit on the receptacle is the most common place for a leak to start; the dispenser's spare nozzle or a call to the station tech is the answer, not a harder push."
    },
    {
      "id": "seat-nozzle",
      "kind": "drag",
      "target": "spare-nozzle",
      "title": "Seat the good nozzle on the receptacle",
      "cue": "Carry the spare nozzle to the receptacle and lock it until the latch shows engaged.",
      "why": "A hydrogen nozzle locks onto the receptacle mechanically before the dispenser will start, and a nozzle that is not fully locked is one the dispenser should refuse; seating it square and checking the latch indicator is how you know the dispenser's check is not the only one.",
      "drag": {
        "to": "fill-receptacle",
        "radius": 0.5,
        "missNote": "Not locked — push the nozzle squarely onto the receptacle and turn the lever until the latch shows engaged."
      }
    },
    {
      "id": "watch-fill-pressure",
      "kind": "track",
      "target": "fill-pressure-display",
      "seconds": 6,
      "title": "Watch the fill pressure climb to the stop",
      "cue": "Stay at the dispenser and keep the fill pressure inside its band until the dispenser stops the fill.",
      "why": "The dispenser controls the fill rate to keep the tank inside its temperature and pressure limits, and a person standing at the display can stop it at once if the reading does something the fill should not; walking away during a fill leaves nobody at the emergency stop.",
      "track": {
        "start": 0.45,
        "green": [
          0.35,
          0.62
        ],
        "rise": 0.3,
        "fall": 0.27,
        "drift": 0.13,
        "label": "FILL",
        "readout": (v) => (v < 0.35 ? 'stalled' : v > 0.62 ? 'over ramp' : 'filling')
      },
      "holdBreakNote": "The fill left its band before the dispenser stopped — stay at the display for the whole fill; that is where the emergency stop is."
    },
    {
      "id": "detector-check-fittings",
      "kind": "gauge",
      "target": "hydrogen-detector",
      "title": "Check each fitting with the portable detector",
      "cue": "Pass the portable detector over the receptacle and tank fittings and commit once the reading settles clean.",
      "why": "Hydrogen is colourless and odourless, so a leak cannot be seen or smelt, and a small one can go unnoticed until it finds an ignition source; a portable detector passed slowly over each fitting after the fill is how the tank's connections are checked.",
      "gauge": {
        "label": "H2 ppm",
        "speed": 0.6,
        "green": [
          0,
          0.07
        ],
        "readout": (t) => `${(t * 1000).toFixed(0)} ppm`,
        "missNote": "The detector had not settled — hold it still at the fitting until the reading steadies before you commit."
      }
    },
    {
      "id": "find-tank-valve-hiss",
      "kind": "find",
      "noHint": true,
      "targets": [
        "tank-valve-leak"
      ],
      "itemNames": {
        "tank-valve-leak": "detector alarm at the tank valve"
      },
      "itemNotes": {
        "tank-valve-leak": "The detector chirps at the tank's shut-off valve — a small leak at its packing, found by the instrument, and a reason to stop, isolate and report."
      },
      "title": "Trace the faint hiss with the detector",
      "cue": "A faint hiss near the tank rack — trace it with the detector, never with a hand or a rag.",
      "why": "A hydrogen flame burns nearly invisible in daylight and a high-pressure leak can cut skin, so a hand feeling for a leak is the one test that must never be used; the detector finds it from a safe distance and tells you which fitting to isolate."
    },
    {
      "id": "press-dispenser-e-stop",
      "kind": "select",
      "target": "dispenser-e-stop",
      "title": "Press the dispenser's emergency stop",
      "cue": "Press the island's emergency stop to shut the dispenser's supply, and call the leak in.",
      "why": "The island's emergency stop closes the dispenser's supply valves and stops the fill system, and pressing it on a confirmed leak is what keeps more gas from feeding the release while the machine is made safe; it is placed where you can reach it without crossing the leak."
    },
    {
      "id": "lock-out-compartment",
      "kind": "select",
      "target": "compartment-lock",
      "title": "Lock out before the fuel cell compartment opens",
      "cue": "Close the tank shut-off, key out, lock and tag the machine before the mechanic removes the compartment cover.",
      "why": "The fuel cell stack and its high-voltage output stay hazardous with the machine keyed off, and 29 CFR 1910.147 controls both the gas and the electrical energy before a cover comes off; the tank shut-off is part of the isolation, not an extra."
    },
    {
      "id": "hold-clear-while-venting",
      "kind": "hold",
      "target": "island-line",
      "seconds": 5,
      "title": "Hold everyone behind the island line while it vents",
      "cue": "Keep the island clear behind the painted line until the station tech confirms the release has dispersed.",
      "why": "Hydrogen is much lighter than air and disperses upward quickly in the open, which is why fuelling islands are outdoors and uncovered; holding people back for the short time it takes is what keeps anyone from walking into the release before it has gone.",
      "holdBreakNote": "People drifted back across the line before the tech gave the all clear — hold them until the release has dispersed."
    },
    {
      "id": "log-the-fuelling",
      "kind": "select",
      "target": "fuelling-log",
      "title": "Log the fuelling and the leak",
      "cue": "Record the machine, the fill, the swapped nozzle seal and the tank valve leak, with the time you pressed the emergency stop.",
      "why": "The fuelling log is how the station tech knows the nozzle seal needs replacing and how the maintenance shop knows why this top pick is tagged; a leak that is only told in passing is a leak the next shift finds again."
    }
  ],

  interrupts: [
    {
      "id": "truck-idles-by-island",
      "kind": "A diesel truck pulls up beside the island",
      "after": "watch-fill-pressure",
      "delay": 2,
      "seconds": 12,
      "alert": "An older diesel service truck has pulled up beside the fuelling island and its driver is climbing out with a lit cigarette.",
      "cue": "Stop the driver at the line and send them outside the island — the fill display waits for no one else.",
      "target": "stop-driver",
      "why": "A lit cigarette at the edge of a hydrogen island during a fill is the exact ignition source the painted line is meant to keep away, and stopping it at the line comes before anything else.",
      "missNote": "You stayed on the display while the driver walked toward the island smoking; they were at the dispenser before anyone told them to stop.",
      "wrongNote": "Stop the driver first — an open flame approaching the island is answered at once."
    },
    {
      "id": "detector-battery-low",
      "kind": "The portable detector warns of a low battery",
      "after": "detector-check-fittings",
      "delay": 2,
      "seconds": 12,
      "alert": "The portable hydrogen detector is beeping a low-battery warning as you start tracing the hiss near the tank rack.",
      "cue": "Swap to the charged spare detector from the station cabinet — the trace waits.",
      "target": "spare-detector",
      "why": "A detector running out of battery can stop reading without anyone noticing, and a silent detector over a leak looks exactly like a clean fitting; the spare is kept charged for this moment.",
      "missNote": "You kept tracing with the failing detector; it went quiet before it reached the tank valve and the leak read as clean.",
      "wrongNote": "The spare detector first — a failing instrument is swapped before its reading is trusted."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, CPHY_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#35383b", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
    // painted walkway and drive-lane lines
    for (let i = 0; i < 6; i++) box(g, 0.9, 0.012, 0.08, -3.0 + i * 1.2, 0.065, 2.35, 0xf2d21b, { rough: 0.7 });
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.7, 3.25, 0.065, -2.2 + i * 1.1, 0xeef2f5, { rough: 0.7 });

    // ------------------------------------------------ the equipment (generic)
    const vehicle = (x, z, ry, len, colour, trim, tall = 1) => {
      const v = group(g, x, 0, z, ry);
      box(v, 1.0, 0.35 * tall, len, 0, 0.45, 0, colour, { rough: 0.5, metal: 0.35 });
      box(v, 0.95, 0.75 * tall, 0.8, 0, 0.95 * tall, len / 2 - 0.45, colour, { rough: 0.45, metal: 0.3 });
      box(v, 0.8, 0.3, 0.02, 0, 1.08 * tall, len / 2 - 0.04, 0x9fc4d8, { rough: 0.1, metal: 0.5, opacity: 0.7, transparent: true });
      box(v, 0.7, 0.28, len * 0.4, 0, 0.3, -0.1, trim, { rough: 0.6 });
      cyl(v, 0.035, 0.035, len * 0.8, 0.46, 0.35, 0, 0xf07a1f, { rough: 0.5, seg: 8 }).rotation.x = Math.PI / 2;
      for (const [wx, wz] of [[-0.55, len / 2 - 0.5], [0.55, len / 2 - 0.5], [-0.55, -len / 2 + 0.45], [0.55, -len / 2 + 0.45]]) {
        cyl(v, 0.26, 0.26, 0.2, wx, 0.26, wz, 0x1c1e20, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;
        cyl(v, 0.13, 0.13, 0.21, wx, 0.26, wz, 0x9aa3ab, { rough: 0.4, metal: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
      }
      ball(v, 0.05, 0, 1.4 * tall, len / 2 - 0.45, 0xf2ae14, { emissive: 0xf2ae14, ei: 1.2 });
      return v;
    };
    const cabinet = (x, z, colour, h = 1.3) => {
      const c = group(g, x, 0, z);
      box(c, 0.7, h, 0.5, 0, h / 2, 0, colour, { rough: 0.5, metal: 0.3 });
      box(c, 0.6, 0.03, 0.02, 0, h * 0.8, 0.26, 0x2b3138, { rough: 0.6 });
      box(c, 0.02, h * 0.7, 0.02, 0.28, h * 0.45, 0.26, 0x8a949d, { rough: 0.4, metal: 0.7 });
      return c;
    };
    const dsp = cabinet(-0.9, -1.9, 0x2a3a4d, 1.8); box(dsp, 0.4, 0.3, 0.02, 0, 1.3, 0.26, 0x0d1c24, { emissive: 0x7fb8ff, ei: 0.5 });
    for (let i = 0; i < 3; i++) { cyl(g, 0.22, 0.22, 2.0, -3.0 + i * 0.5, 1.0, -2.3, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 16 }); }
    vehicle(1.6, -1.3, Math.PI / 2, 2.8, 0x3f7f4a, 0x7fb8ff, 1.3);

    // ------------------------------------------------ yard dressing (instanced feel, merged per kind)
    const stackColours = [0x8c2f2a, 0x2f5f8c, 0x3f7f4a, 0xb8862b, 0x6b4f8c, 0x7a7f86, 0xa8452f, 0x2f7f7a, 0x5a6b2f, 0x8c5a2f, 0x4a4f8c, 0x9a3f5f];
    for (let i = 0; i < 12; i++) {
      const sx = -3.4 + (i % 6) * 1.3, sy = 0.3 + Math.floor(i / 6) * 0.6;
      box(g, 1.2, 0.56, 0.55, sx, sy, -3.1, stackColours[i], { rough: 0.7, metal: 0.25 });
      for (let r = 0; r < 3; r++) box(g, 0.02, 0.5, 0.56, sx - 0.45 + r * 0.45, sy, -3.1 + 0.005, stackColours[i] + 0x080808, { rough: 0.6, metal: 0.3 });
    }
    const coneCols = [0xf07a1f, 0xf28a2f, 0xe86a14, 0xf5962f];
    for (let i = 0; i < 8; i++) {
      const cx0 = -3.3 + i * 0.95;
      cyl(g, 0.02, 0.1, 0.32, cx0, 0.16, 2.75, coneCols[i % 4], { rough: 0.6, seg: 10 });
      box(g, 0.22, 0.02, 0.22, cx0, 0.01, 2.75, 0x1c1e20, { rough: 0.8 });
    }
    const boll = [0xf2d21b, 0xe8c80f, 0xf5dc3a, 0xd8be14];
    for (let i = 0; i < 6; i++) { cyl(g, 0.07, 0.07, 0.8, -3.55, 0.4, -2.0 + i * 0.8, boll[i % 4], { rough: 0.5, seg: 10 }); ball(g, 0.075, -3.55, 0.82, -2.0 + i * 0.8, 0x2b2f33, { rough: 0.5 }); }
    for (let i = 0; i < 3; i++) {
      cyl(g, 0.05, 0.06, 3.2, 3.6, 1.6, -2.4 + i * 2.2, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
      box(g, 0.5, 0.08, 0.2, 3.45, 3.2, -2.4 + i * 2.2, 0x5b646c, { rough: 0.5, metal: 0.5 });
      box(g, 0.4, 0.03, 0.16, 3.45, 3.15, -2.4 + i * 2.2, 0xfff2cc, { emissive: 0xfff2cc, ei: 0.8 });
    }

    // ------------------------------------------------ the things you reach for
    const PROPS = [{"id":"fuelling-instructions-sign","name":"fuelling instructions sign","kind":"prop"},{"id":"phone-locker","name":"phone into the island locker","kind":"prop"},{"id":"lighter-bin","name":"lighter into the bin outside the line","kind":"prop"},{"id":"top-pick-key","name":"top pick key","kind":"prop"},{"id":"ground-clamp","name":"ground clamp","kind":"prop"},{"id":"bonding-point","name":"bonding point","kind":"dest"},{"id":"scuffed-nozzle-seal","name":"scuffed seal inside the nozzle","kind":"find"},{"id":"spare-nozzle","name":"spare nozzle","kind":"prop"},{"id":"fill-receptacle","name":"fill receptacle","kind":"dest"},{"id":"fill-pressure-display","name":"fill pressure display","kind":"meter"},{"id":"hydrogen-detector","name":"hydrogen detector","kind":"meter"},{"id":"tank-valve-leak","name":"detector alarm at the tank valve","kind":"find"},{"id":"dispenser-e-stop","name":"dispenser e stop","kind":"prop"},{"id":"compartment-lock","name":"compartment lock","kind":"prop"},{"id":"island-line","name":"island line","kind":"prop"},{"id":"fuelling-log","name":"fuelling log","kind":"prop"},{"id":"stop-driver","name":"stop driver","kind":"figure"},{"id":"spare-detector","name":"spare detector","kind":"prop"}];
    const HAZ = [{"id":"phone-on-island","name":"phone on island?"},{"id":"feel-for-leak","name":"feel for leak?"},{"id":"fuel-with-cell-running","name":"fuel with cell running?"},{"id":"force-damaged-nozzle","name":"force damaged nozzle?"}];
    const propCols = [0x2b3138, 0x3c444c, 0x46505a, 0x55606a, 0x2f3a44, 0x394652, 0x4c5660, 0x5f6973];
    const bodies = {};
    const home = {};
    const n = PROPS.length;
    let figN = 0;
    PROPS.forEach((p, i) => {
      const a = Math.PI * (1.08 + 0.84 * (i / Math.max(1, n - 1)));
      const r = i % 2 ? 2.55 : 1.85;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85 + 0.25;
      let obj, bodyMesh;
      if (p.kind === "figure") {
        const fx = 1.2 - (figN++) * 2.4, fz = 1.25; obj = standingFigure(g, fx, fz, { ry: Math.atan2(-fx, -fz), cloth: 0x3a5a7a });
        bodyMesh = null;
        holoTag(obj, p.name, 0, 1.95, 0, { css: "#d2312b", w: 0.34 });
      } else if (p.kind === "meter") {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: CPHY_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: CPHY_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = CPHY_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: CPHY_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: CPHY_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: CPHY_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: CPHY_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, CPHY_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: CPHY_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: CPHY_CSS, w: 0.36 });
      }
      reg(hits, obj, p.id);
      bodies[p.id] = { obj, bodyMesh, screen: obj.userData?.screen ?? null };
      home[p.id] = obj.position.clone();
    });
    HAZ.forEach((h, i) => {
      const x = -2.6 + i * 1.75, z = 1.95;
      const m = box(g, 0.24, 0.24, 0.24, x, 0.75, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, h.name, x, 1.02, z, { css: "#d2312b", w: 0.5 });
      reg(hits, m, h.id);
    });

    const tint = (id, colour, ei = 0) => {
      const b = bodies[id];
      if (b?.bodyMesh) b.bodyMesh.material = mat(colour, ei ? { rough: 0.45, emissive: colour, ei } : { rough: 0.45 });
    };
    const lastTarget = (step) => step.target ?? step.targets?.[step.targets.length - 1];
    const green = "#59c97b";

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.8),
      onStep() {},
      onStepComplete(step) {
        tint(lastTarget(step), 0x59c97b);
        if (step.drag?.to) tint(step.drag.to, 0x59c97b);
        const scr = bodies[lastTarget(step)]?.screen;
        if (scr) repaint(scr, signFace("PASS", { bg: "#0d1c24", accent: green, fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        const b = bodies[it.target];
        if (!b) return;
        b.obj.position.x += 0.3;
        tint(it.target, 0xf0645b, 1.4);
      },
      onInterruptEnd(it) {
        const b = bodies[it.target];
        if (!b || it.resolved !== "answered") return;
        b.obj.position.copy(home[it.target]);
        tint(it.target, 0x59c97b);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (!step) return;
        const scr = bodies[step.target]?.screen;
        if (!scr) return;
        const gg = session.gauge;
        if (step.kind === "gauge" && gg && !gg.committed) {
          const ok = gg.t >= step.gauge.green[0] && gg.t <= step.gauge.green[1];
          repaint(scr, signFace(step.gauge.readout(gg.t), { bg: "#0d1c24", accent: ok ? green : "#f2ae14", fg: "#bfeaf7", scale: 0.45 }));
        }
        if (step.kind === "track" && session.holding && session.track) {
          const v = session.track.v, ok = v >= step.track.green[0] && v <= step.track.green[1];
          repaint(scr, signFace(step.track.readout(v), { bg: "#0d1c24", accent: ok ? green : "#f2ae14", fg: "#bfeaf7", scale: 0.4 }));
        }
        void t; void dt; void CITY; void decal;
      },
    };
  },
};
