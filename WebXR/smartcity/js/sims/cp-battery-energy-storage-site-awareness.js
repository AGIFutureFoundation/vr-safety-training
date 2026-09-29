import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Battery Energy Storage Site Awareness VR — CLEANPORTS, the zero-emission port operations
// block of the Bay Program wave.
//
// A generic container-terminal setting (no real terminal, equipment maker or
// model is shown). The practice is taught from the standards the
// certification line names; the Clean Ports note below says which workforce
// partner the Port of Oakland's programme names for this kind of training,
// from the facts file only, and never claims the station is that partner's
// curriculum. Union tags come from tools/unions.json.

const CPBE_ACCENT = 0xe8d23a;
const CPBE_CSS = "#e8d23a";

export const SIM_CP_BATTERY_ENERGY_STORAGE_SITE_AWARENESS = {
  id: "cp-battery-energy-storage-site-awareness",
  index: "843",
  domain: "Energy",
  trade: "Port worker or IBEW electrician inducted to a battery energy storage system site: its hazards, its entry rules and who may go inside",
  category: "Energy & Power",
  weather: "clear",
  certification: "IBEW/NECA JATC training for qualified electrical workers; NFPA 855 installation of stationary energy storage systems, including hazard mitigation, signage and emergency response planning; NFPA 70E electrical safety in the workplace for DC arc flash and shock; NFPA 70 (NEC) for the energy storage system's disconnecting means; 29 CFR 1910.147 the control of hazardous energy; 29 CFR 1910.269 for work at electric supply stations; and the site's own emergency response plan",
  name: "Battery Energy Storage Site Awareness",
  title: simTitle("Battery Energy Storage Site Awareness VR"),
  accent: CPBE_ACCENT,
  accentCss: CPBE_CSS,
  tagline: "A battery energy storage site inside the port fence: the entry sign and the site's rules read, the sign-in log, the gas detection panel read normal, a cabinet with a warning lamp found and reported rather than opened, the thermal readout watched, a visitor held behind the line, the fire department access route kept clear, the emergency stop and its meaning learned, a pallet of cardboard moved away from the enclosures, and the site signed out",
  parSeconds: 320,
  footprint: 3,
  badge: {"id":"cpbe-badge","name":"Line Held","note":"Nothing opened that was not yours to open, the visitor kept behind the line and the warning lamp reported, not investigated"},
  unions: ["ibew","ilwu"],
  cleanPorts: "The Port of Oakland's Clean Ports programme includes a battery energy storage system among its funded activities; this awareness station teaches general site practice from its cited standards and does not describe that system.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Line Held",
    currency: "TAG",
    ranks: ["Yard Hand", "Zero-Emission Crew", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "cpbe-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("read-gas-panel") },
      { id: "cpbe-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "cpbe-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "cpbe-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cpbe-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-faulted-enclosure": "You reached to open enclosure B with its warning lamp lit. An enclosure door opened on a battery fault can let air into a space where flammable gas is collecting — that door stays shut for the responders.",
    "enter-without-escort": "You walked past the keep-out line without your escort. Only qualified, authorised people go inside the storage area, and nobody else knows which doors are energised or where to go if the alarm sounds.",
    "smoke-near-enclosures": "You reached for a lighter near the enclosures. Ignition sources are kept away from energy storage because a vented cell's gas needs only a spark.",
    "treat-e-stop-as-safe": "You treated the pressed e-stop as meaning the site was safe to enter. The cells inside stay charged whatever the e-stop does — it opens the grid connection, not the batteries."
  },

  steps: [
    {
      "id": "read-entry-sign",
      "kind": "select",
      "target": "bess-entry-sign",
      "title": "Read the site's entry sign",
      "cue": "Read the sign on the gate: the hazards, the emergency contact, who may enter and what is required to do so.",
      "why": "NFPA 855 has a storage site marked with its hazards and an emergency contact, and the sign is the site telling you its rules before you are inside; qualified electrical workers may work in the enclosures, while everyone else — however long they have worked at the port — enters escorted or not at all."
    },
    {
      "id": "sign-in-and-brief",
      "kind": "sequence",
      "anyOrder": true,
      "targets": [
        "site-sign-in-log",
        "site-escort"
      ],
      "itemNames": {
        "site-sign-in-log": "the site sign-in log",
        "site-escort": "the site's qualified escort"
      },
      "title": "Sign in and meet your escort",
      "cue": "Sign the log with the time and your purpose, and get the escort's brief on where you may and may not walk.",
      "why": "The sign-in log is how the site knows who is inside if an alarm sounds, and the escort's brief turns the sign's general rules into this site's specifics — which enclosures are energised, where the muster point is, which door the fire department will use."
    },
    {
      "id": "read-gas-panel",
      "kind": "gauge",
      "target": "gas-detection-panel",
      "title": "Read the gas detection panel",
      "cue": "Read the site's gas detection panel and commit once it settles inside the normal band.",
      "why": "A battery cell going into thermal runaway can vent flammable and toxic gas before any smoke or flame shows, which is why storage sites carry gas detection tied to ventilation and alarms; a normal reading at the gate is your cue that entry is permitted today.",
      "gauge": {
        "label": "GAS % LEL",
        "speed": 0.6,
        "green": [
          0,
          0.08
        ],
        "readout": (t) => `${(t * 100).toFixed(0)}% LEL`,
        "missNote": "Not settled — wait for the panel's reading to steady inside the normal band before you commit."
      }
    },
    {
      "id": "find-warning-lamp",
      "kind": "find",
      "noHint": true,
      "targets": [
        "cabinet-warning-lamp"
      ],
      "itemNames": {
        "cabinet-warning-lamp": "amber warning lamp on enclosure B"
      },
      "itemNotes": {
        "cabinet-warning-lamp": "Enclosure B's amber warning lamp is lit — a fault the battery management system has flagged, and a reason to report and keep the door shut, not to look inside."
      },
      "title": "Look along the enclosures for any warning lamp",
      "cue": "Scan every enclosure's status lamps from the walkway without touching a door.",
      "why": "The battery management system watches each rack's voltage and temperature and lights a warning when something drifts, and an enclosure door opened on a fault can let fresh air into a space where gas is building; a warning lamp is reported and left shut for the people trained to respond."
    },
    {
      "id": "report-warning-lamp",
      "kind": "select",
      "target": "site-radio",
      "title": "Report the lamp to the site's control room",
      "cue": "Radio the control room: enclosure B amber lamp lit, door shut, nobody near it.",
      "why": "The site's emergency response plan starts with the people who can see the battery management data and isolate the rack remotely, and a clear report — which enclosure, which lamp, that the door is shut — lets them act without anyone going closer."
    },
    {
      "id": "watch-thermal-readout",
      "kind": "track",
      "target": "thermal-readout",
      "seconds": 6,
      "title": "Watch enclosure B's temperature with the control room",
      "cue": "Stay at the walkway readout and keep watching enclosure B's temperature inside the band while the control room checks it.",
      "why": "A temperature that holds steady while the control room investigates is reassurance, and one that climbs is the trigger for the site's evacuation; watching it from the walkway rather than the door is how you stay useful without adding yourself to the hazard.",
      "track": {
        "start": 0.45,
        "green": [
          0.3,
          0.6
        ],
        "rise": 0.3,
        "fall": 0.28,
        "drift": 0.13,
        "label": "ENCL B °C",
        "readout": (v) => (v < 0.3 ? 'sensor low' : v > 0.6 ? 'rising — step back' : 'steady')
      },
      "holdBreakNote": "The readout left the band before the control room answered — keep eyes on it; a climb you missed is the one they needed you to call out."
    },
    {
      "id": "hold-visitor-behind-line",
      "kind": "drag",
      "target": "visitor-badge",
      "title": "Keep the visitor behind the line",
      "cue": "Walk the visitor's badge back to the painted keep-out line and have them wait there.",
      "why": "Only qualified, authorised people go inside the storage area's inner line, and a visitor who has not had the brief does not know which doors are energised or where the muster point is; the painted line is the site's answer to who may enter.",
      "drag": {
        "to": "keep-out-line",
        "radius": 0.5,
        "missNote": "Not at the line — bring the visitor all the way back behind the painted keep-out line."
      }
    },
    {
      "id": "clear-fire-access",
      "kind": "drag",
      "target": "cardboard-pallet",
      "title": "Clear the fire access route",
      "cue": "Move the pallet of cardboard left beside enclosure C back to the laydown area, off the fire lane.",
      "why": "NFPA 855 keeps combustibles away from storage enclosures and keeps a clear access for the fire department, because a small fire beside an enclosure can heat it from outside and a blocked lane delays the responders who know how to handle one.",
      "drag": {
        "to": "laydown-area",
        "radius": 0.5,
        "missNote": "Still in the fire lane — carry the pallet all the way to the marked laydown area."
      }
    },
    {
      "id": "learn-site-e-stop",
      "kind": "select",
      "target": "site-e-stop",
      "title": "Learn what the site emergency stop does",
      "cue": "Read the label on the site emergency stop: it opens the system's disconnect, and who is allowed to press it.",
      "why": "An emergency stop at a storage site opens the connection to the grid and the port's loads, but the cells inside remain charged whatever it does; knowing that stops anyone treating a pressed e-stop as a safe-to-enter signal."
    },
    {
      "id": "hold-at-muster-point",
      "kind": "hold",
      "target": "muster-point",
      "seconds": 5,
      "title": "Walk to the muster point and stay for the drill count",
      "cue": "When the escort calls the drill, walk upwind to the muster point and stay put until you are counted.",
      "why": "The muster point is placed upwind and away from the enclosures because vented battery gas travels with the wind, and staying there until counted is what lets the site know nobody is still inside; drifting back to finish a task is how people go missing in a real alarm.",
      "holdBreakNote": "You left the muster point before the count finished — in a real alarm the escort would now be looking for you among the enclosures."
    },
    {
      "id": "check-signage",
      "kind": "select",
      "target": "hazard-sign-panel",
      "title": "Read the hazard signs on the enclosures",
      "cue": "Read the signs on each enclosure door: electrical hazard, the energy storage marking and the emergency contact.",
      "why": "The signs carry the information a responder or a new worker needs without having to ask anyone: what is inside, what it can do and who to call; reading them with the escort is how the marks become meaningful rather than wallpaper."
    },
    {
      "id": "sign-out",
      "kind": "select",
      "target": "site-sign-out",
      "title": "Sign out of the site",
      "cue": "Sign the log with your exit time and note the amber lamp reported on enclosure B.",
      "why": "Signing out closes the headcount the log opened, and noting what you reported gives the next person on the list the context before they walk in; a log with an entry and no exit is a person the site has to go looking for."
    }
  ],

  interrupts: [
    {
      "id": "gas-alarm-chirps",
      "kind": "The gas detection panel chirps",
      "after": "watch-thermal-readout",
      "delay": 2,
      "seconds": 12,
      "alert": "The gas detection panel has just chirped a pre-alarm while you are watching enclosure B's temperature.",
      "cue": "Call it to the escort on the site radio's alarm channel — the visitor waits.",
      "target": "alarm-call-point",
      "why": "A pre-alarm from gas detection is the site's earliest warning that a cell may be venting, and calling it at once lets the control room confirm and start the response plan before the reading reaches the alarm level.",
      "missNote": "You kept your eyes on the readout while the pre-alarm went unreported; the escort learned of it only when the full alarm sounded.",
      "wrongNote": "The alarm call first — a gas pre-alarm is reported the moment it sounds."
    },
    {
      "id": "contractor-with-grinder",
      "kind": "A contractor arrives with a grinder",
      "after": "clear-fire-access",
      "delay": 2,
      "seconds": 12,
      "alert": "A contractor has walked up to the fence with an angle grinder, planning to cut a bracket off the enclosure C fence post.",
      "cue": "Stop them at the gate and send them to the hot-work permit desk — the e-stop label waits.",
      "target": "stop-contractor",
      "why": "Hot work near an energy storage enclosure needs a permit and a gas check first, because sparks and a vented cell's gas are the combination the site's rules are written to keep apart.",
      "missNote": "You read the e-stop label while the contractor started the grinder at the fence; sparks were landing beside enclosure C before anyone checked for a permit.",
      "wrongNote": "Stop the contractor first — an ignition source arriving at the site is answered before anything else."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, CPBE_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#393c3f", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    for (let i = 0; i < 4; i++) { const c = cabinet(-2.1 + i * 1.4, -2.0, 0xdfe4e8, 1.7); box(c, 0.66, 0.12, 0.02, 0, 1.55, 0.26, 0xe8d23a, { rough: 0.6 }); }
    box(g, 6.4, 0.9, 0.04, 0, 0.45, -2.55, 0x7a848d, { rough: 0.5, metal: 0.6, opacity: 0.6, transparent: true });

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
    const PROPS = [{"id":"bess-entry-sign","name":"bess entry sign","kind":"prop"},{"id":"site-sign-in-log","name":"the site sign-in log","kind":"prop"},{"id":"site-escort","name":"the site's qualified escort","kind":"prop"},{"id":"gas-detection-panel","name":"gas detection panel","kind":"meter"},{"id":"cabinet-warning-lamp","name":"amber warning lamp on enclosure B","kind":"find"},{"id":"site-radio","name":"site radio","kind":"prop"},{"id":"thermal-readout","name":"thermal readout","kind":"meter"},{"id":"visitor-badge","name":"visitor badge","kind":"prop"},{"id":"keep-out-line","name":"keep out line","kind":"dest"},{"id":"cardboard-pallet","name":"cardboard pallet","kind":"prop"},{"id":"laydown-area","name":"laydown area","kind":"dest"},{"id":"site-e-stop","name":"site e stop","kind":"prop"},{"id":"muster-point","name":"muster point","kind":"prop"},{"id":"hazard-sign-panel","name":"hazard sign panel","kind":"prop"},{"id":"site-sign-out","name":"site sign out","kind":"prop"},{"id":"alarm-call-point","name":"alarm call point","kind":"prop"},{"id":"stop-contractor","name":"stop contractor","kind":"figure"}];
    const HAZ = [{"id":"open-faulted-enclosure","name":"open faulted enclosure?"},{"id":"enter-without-escort","name":"enter without escort?"},{"id":"smoke-near-enclosures","name":"smoke near enclosures?"},{"id":"treat-e-stop-as-safe","name":"treat e stop as safe?"}];
    const propCols = [0x2b3138, 0x3c444c, 0x46505a, 0x55606a, 0x2f3a44, 0x394652, 0x4c5660, 0x5f6973];
    const bodies = {};
    const home = {};
    const n = PROPS.length;
    PROPS.forEach((p, i) => {
      const a = Math.PI * (1.08 + 0.84 * (i / Math.max(1, n - 1)));
      const r = i % 2 ? 2.55 : 1.85;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85 + 0.25;
      let obj, bodyMesh;
      if (p.kind === "figure") {
        obj = standingFigure(g, x * 1.08, z + 0.2, { ry: Math.atan2(-x, -z), cloth: 0x3a5a7a });
        bodyMesh = null;
        holoTag(obj, p.name, 0, 1.95, 0, { css: "#d2312b", w: 0.34 });
      } else if (p.kind === "meter") {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: CPBE_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: CPBE_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = CPBE_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: CPBE_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: CPBE_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: CPBE_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: CPBE_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, CPBE_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: CPBE_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: CPBE_CSS, w: 0.36 });
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
