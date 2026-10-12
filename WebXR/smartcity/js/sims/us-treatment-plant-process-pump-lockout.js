import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Treatment Plant Process Pump Lockout VR — UNIONSIMS, the craft trainings of the Bay
// Restoration Academy wave (docs/consoles/UNIONSIMS.md).
//
// A generic setting: no real plant, street, property, vehicle maker or model
// is shown. The practice is taught from the standards the certification line
// names. The union tags come from tools/unions.json and are a trade
// reference only: the platform has no partnership with any union and this
// station is not any union's programme.

const USPL_ACCENT = 0x4fa3d1;
const USPL_CSS = "#4fa3d1";

export const SIM_US_TREATMENT_PLANT_PROCESS_PUMP_LOCKOUT = {
  id: "us-treatment-plant-process-pump-lockout",
  index: "963",
  domain: "Environmental",
  trade: "Wastewater treatment plant operator and mechanic locking out a process pump and its blower-fed aeration line before a mechanic opens the pump",
  category: "Water & Environmental",
  weather: "overcast",
  certification: "California State Water Resources Control Board wastewater treatment plant operator certification practice; OSHA 29 CFR 1910.147 control of hazardous energy, including the energy-control procedure, the group lockout and the verification of isolation; 29 CFR 1910.146 permit-required confined spaces for the wet well the pump draws from; 29 CFR 1910.132 for the PPE at the motor control centre; 29 CFR 1910.22 walking-working surfaces in the pump gallery; ANSI Z358.1 for the eyewash beside the seal-water chemical tank; NFPA 820 for the plant's classified areas; OSHA 29 CFR 1910.1200 hazard communication for the seal-water chemicals; NIOSH findings on deaths of workers servicing machinery that was not locked out",
  name: "Treatment Plant Process Pump Lockout",
  title: simTitle("Treatment Plant Process Pump Lockout VR"),
  accent: USPL_ACCENT,
  accentCss: USPL_CSS,
  tagline: "A process pump at a treatment plant: the work order and the pump's energy-control procedure read, the control room told, the pump stopped in local and the standby taken out of auto, the breaker opened and locked with a group box, the suction and discharge valves closed and chained, the line bled to zero, the stored air in the aeration header vented, the try-start tried, each worker's lock on the box, the job done and the pump released by the procedure",
  parSeconds: 330,
  footprint: 3,
  badge: {"id":"uspl-badge","name":"Zero Energy Proven","note":"Every source isolated, bled and tried before a hand went inside the pump"},
  unions: ["iuoe","afscme","uwua"],
  tradeReference: "Trade reference: the craft taught here is the one the tagged unions' members do; the platform has no partnership with them and this station is not their programme.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Zero Energy Proven",
    currency: "TAG",
    ranks: ["Yard Hand", "Crew Hand", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "uspl-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("read-gas-at-wet-well") },
      { id: "uspl-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "uspl-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "uspl-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "uspl-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "remove-anothers-lock": "You reached to remove another worker's lock from the box. Only the person who applied a lock removes it.",
    "open-casing-under-pressure": "You went to loosen the casing bolts before bleeding. Bleed to zero and prove it first.",
    "leave-standby-in-auto": "You left the standby in auto. On level control it can start itself and push flow into the header.",
    "skip-try-start": "You reached for the coupling guard without a try-start. Verify isolation before anyone touches the pump."
  },

  steps: [
    {
      "id": "read-energy-procedure",
      "kind": "select",
      "target": "energy-control-plan",
      "title": "Read the pump's energy-control procedure",
      "cue": "Read the work order and the pump's own energy-control procedure: every source, every isolation point and how isolation is verified.",
      "why": "29 CFR 1910.147 requires a written procedure for each machine listing its energy sources, because a process pump has more than the motor: pressure in the line, flow from the wet well and a standby pump that can start on level; reading it first is how none of them is missed."
    },
    {
      "id": "tell-control-room",
      "kind": "select",
      "target": "control-room-radio",
      "title": "Tell the control room before anything is stopped",
      "cue": "Radio the control room: which pump, why, and that its standby will be out of auto while the work is done.",
      "why": "The control room runs the process on the pumps it can see, and a pump that disappears without warning can back up a channel or starve a basin; 1910.147 also requires affected employees to be told before a lockout is applied."
    },
    {
      "id": "stop-and-hand",
      "kind": "sequence",
      "targets": [
        "local-stop-button",
        "standby-hand-off-auto"
      ],
      "itemNames": {
        "local-stop-button": "pump local stop",
        "standby-hand-off-auto": "standby pump hand-off-auto switch"
      },
      "title": "Stop the pump in local, take the standby out of auto",
      "cue": "Stop the pump at its local station, then turn the standby's hand-off-auto switch to off.",
      "outOfOrderNote": "Out of order — stop the running pump at its local station first, then take the standby out of auto.",
      "why": "Stopping at the local station before opening the breaker avoids breaking load current, and taking the standby out of auto matters because a standby on level control starts itself when the wet well rises and pushes flow back through a shared header."
    },
    {
      "id": "lock-group-box",
      "kind": "sequence",
      "targets": [
        "mcc-breaker-lock",
        "group-lock-box"
      ],
      "itemNames": {
        "mcc-breaker-lock": "breaker lock at the motor control centre",
        "group-lock-box": "group lock box"
      },
      "title": "Open and lock the breaker, key into the group box",
      "cue": "Open the pump's breaker at the motor control centre, apply the lead's lock and tag, then drop the key into the group lock box.",
      "outOfOrderNote": "Out of order — the breaker is opened and locked before its key goes in the group box.",
      "why": "A group lockout under 1910.147 puts one set of locks on the isolation points and the keys in a box that every worker locks, so no isolation can be removed while anyone's lock is still on the box; the breaker is opened in the PPE the plant's electrical programme requires under 29 CFR 1910.132."
    },
    {
      "id": "find-seal-water-feed",
      "kind": "find",
      "noHint": true,
      "targets": [
        "seal-water-solenoid"
      ],
      "itemNames": {
        "seal-water-solenoid": "seal-water solenoid on its own circuit"
      },
      "itemNotes": {
        "seal-water-solenoid": "The seal-water solenoid is fed from a lighting panel, not the pump's breaker — it is a separate source the procedure lists."
      },
      "title": "Find the source the breaker does not cover",
      "cue": "Look over the pump, its seal-water line and the local panel for any energy source still live with the breaker locked.",
      "why": "A process pump's seal-water solenoid, heater or instrument is often fed from a different panel than the motor, and 29 CFR 1910.147 requires every source to be isolated; the one missed is the one a mechanic finds with a hand inside the casing."
    },
    {
      "id": "close-and-chain-valves",
      "kind": "sequence",
      "targets": [
        "suction-valve-chain",
        "discharge-valve-chain"
      ],
      "itemNames": {
        "suction-valve-chain": "suction valve chain lock",
        "discharge-valve-chain": "discharge valve chain lock"
      },
      "title": "Close and chain the suction and discharge valves",
      "cue": "Close the suction valve, then the discharge valve, and chain and lock each handwheel.",
      "outOfOrderNote": "Out of order — close the suction side first, then the discharge, so the casing is never left open to the header alone.",
      "why": "A stopped pump still has the wet well's head on its suction and the header's pressure on its discharge, and opening the casing with either valve open floods the gallery; chaining the handwheels makes the valves part of the lockout, not a courtesy."
    },
    {
      "id": "bleed-to-zero",
      "kind": "track",
      "target": "casing-pressure-gauge",
      "seconds": 6,
      "title": "Bleed the casing and hold it at zero",
      "cue": "Open the casing bleed slowly and keep the gauge in the zero band while the trapped pressure drains to the floor sump.",
      "why": "The water trapped between two closed valves stays under pressure, and 1910.147 requires stored energy to be relieved before work begins; bleeding slowly into the sump keeps the release controlled and shows whether a valve is passing.",
      "track": {
        "start": 0.55,
        "green": [
          0.3,
          0.6
        ],
        "rise": 0.3,
        "fall": 0.27,
        "drift": 0.13,
        "label": "CASING",
        "readout": (v) => (v < 0.3 ? 'bleeding too fast' : v > 0.6 ? 'pressure left' : 'at zero, holding')
      },
      "holdBreakNote": "The casing pressure left the band — a valve may be passing; hold the bleed until it stays at zero."
    },
    {
      "id": "vent-air-header",
      "kind": "turn",
      "target": "header-vent-valve",
      "title": "Vent the stored air in the aeration header",
      "cue": "Open the vent on the blower-fed header branch that feeds the pump's seal water tank until it stops hissing.",
      "why": "The aeration blowers keep air in the header under pressure, and a branch that feeds the pump's seal system holds that energy after the pump stops; venting it is the stored-energy step a procedure lists and a hurried lockout skips.",
      "turn": {
        "turns": 0.8,
        "label": "HEADER VENT",
        "readout": (t) => (t < 0.4 ? 'closed — pressurised' : t < 0.9 ? 'venting' : 'vented, silent')
      }
    },
    {
      "id": "try-start",
      "kind": "hold",
      "target": "local-start-button",
      "seconds": 4,
      "title": "Try-start the pump and confirm nothing moves",
      "cue": "Clear everyone from the coupling guard, then hold the local start and confirm the pump does not turn.",
      "why": "The try-start is the verification 1910.147 requires, because a lock on the wrong breaker looks exactly like a lock on the right one until the start button is pressed; the pump must not turn, and the switch goes back to off afterwards.",
      "holdBreakNote": "You let go before the try was complete — hold the start long enough to prove the pump cannot turn."
    },
    {
      "id": "read-gas-at-wet-well",
      "kind": "gauge",
      "target": "wet-well-gas-meter",
      "title": "Read the air at the wet well hatch",
      "cue": "Read oxygen, flammables and hydrogen sulfide at the hatch beside the pump before the gallery work starts, and commit when all read clear.",
      "why": "A pump gallery beside a wet well can collect hydrogen sulfide when the flow stops, and 29 CFR 1910.146 treats a wet well as a permit space; reading the air at the hatch before the casing opens is how the crew knows the gallery is still safe to work in.",
      "gauge": {
        "label": "GAS",
        "speed": 0.6,
        "green": [
          0.6,
          0.9
        ],
        "readout": (t) => (t < 0.6 ? 'settling' : t > 0.9 ? 'recheck sensor' : 'O2 ok · LEL 0 · H2S 0'),
        "missNote": "Not settled — wait for every sensor to read clear before committing."
      }
    },
    {
      "id": "each-worker-locks",
      "kind": "drag",
      "target": "personal-lock-rack",
      "title": "Each worker puts a personal lock on the box",
      "cue": "Have the mechanic and each helper put their own lock and tag on the group lock box before they touch the pump.",
      "why": "Under a group lockout each worker's own lock on the box is their protection, because the box cannot open until the last of them removes theirs; a worker who relies on the lead's lock alone has no say over when the pump is released.",
      "drag": {
        "to": "group-box-hasp",
        "radius": 0.5,
        "missNote": "Not on the box — carry the personal lock all the way to the group box hasp and close it."
      }
    },
    {
      "id": "release-by-procedure",
      "kind": "select",
      "target": "release-checklist",
      "title": "Release the pump by the procedure",
      "cue": "When the job is done: guards on, tools out, everyone clear and accounted for, personal locks off, then valves, header and breaker restored in order.",
      "why": "1910.147 sets the release: the work area checked, everyone clear and told, then each lock removed by the person who applied it; restoring valves before the breaker keeps the pump from starting dry against a closed discharge."
    },
    {
      "id": "log-and-return-auto",
      "kind": "select",
      "target": "operator-log",
      "title": "Return the standby to auto and log the job",
      "cue": "Return the standby's switch to auto, tell the control room both pumps are available, and log the lockout and its release.",
      "why": "A standby left in off after the job is a plant with no backup for the next high flow, and the log is how the next shift knows what was isolated, for how long and that it was released by the procedure."
    }
  ],

  interrupts: [
    {
      "id": "high-level-alarm",
      "kind": "The wet well high-level alarm sounds",
      "after": "bleed-to-zero",
      "delay": 2,
      "seconds": 12,
      "alert": "The wet well's high-level alarm is sounding while one pump is locked out.",
      "cue": "Radio the control room to bring the other duty pump on — never pull a lock to answer a level alarm.",
      "target": "level-alarm-panel",
      "why": "The level is answered by the pumps that are not locked out, from the control room; the lockout stays on because a pump under repair is not a pump the plant has.",
      "missNote": "You kept bleeding while the alarm sounded; the wet well rose with nobody bringing the duty pump on.",
      "wrongNote": "The alarm first — call the control room to bring the duty pump on; the lock stays."
    },
    {
      "id": "coworker-reaches-guard",
      "kind": "A coworker reaches for the coupling guard",
      "after": "try-start",
      "delay": 2,
      "seconds": 12,
      "alert": "A coworker has reached for the coupling guard before putting a personal lock on the box.",
      "cue": "Stop them and have them lock the box first — the try-start can finish after.",
      "target": "stop-coworker",
      "why": "A worker whose own lock is not on the box has no protection if the lead releases the lockout; stopping them costs seconds.",
      "missNote": "You finished the try-start while the coworker's hands were at the guard with no lock of their own on the box.",
      "wrongNote": "The coworker first — nobody's hands near the pump without their own lock on the box."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, USPL_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#33383c", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    for (let i = 0; i < 2; i++) { const bx = -1.6 + i * 3.0; box(g, 2.6, 0.7, 1.2, bx, 0.35, -2.0, 0x8e949a, { rough: 0.85 }); box(g, 2.4, 0.02, 1.0, bx, 0.69, -2.0, 0x5f7a6a, { rough: 0.2, metal: 0.1 }); for (let k = 0; k < 5; k++) cyl(g, 0.02, 0.02, 1.0, bx - 1.2 + k * 0.6, 1.2, -1.38, 0xf2d21b, { rough: 0.5, seg: 6 }); box(g, 2.6, 0.04, 0.04, bx, 1.7, -1.38, 0xf2d21b, { rough: 0.5 }); }
    for (let i = 0; i < 3; i++) { const c = cabinet(-2.8 + i * 0.9, -0.9, 0x9aa7b3, 1.1); box(c, 0.3, 0.16, 0.02, 0, 0.8, 0.26, 0x0d1c24, { emissive: 0x4fa3d1, ei: 0.5 }); }
    cyl(g, 0.12, 0.12, 5.6, 0, 1.9, -2.7, 0x3f6f9f, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;

    // ------------------------------------------------ site dressing: concrete barriers, cones, bollards, lights
    const stackColours = [0xb9b4aa, 0xaaa59b, 0xc4bfb5, 0x9f9a90, 0xb2ada3, 0xbdb8ae, 0xa7a298, 0xc0bbb1, 0xaea99f, 0xb6b1a7, 0xa39e94, 0xbab5ab];
    for (let i = 0; i < 12; i++) {
      const sx = -3.4 + (i % 6) * 1.3, sy = 0.3 + Math.floor(i / 6) * 0.6;
      box(g, 1.2, 0.56, 0.4, sx, sy, -3.1, stackColours[i], { rough: 0.9, metal: 0.02 });
      for (let r = 0; r < 3; r++) box(g, 0.02, 0.5, 0.41, sx - 0.45 + r * 0.45, sy, -3.1 + 0.005, stackColours[i] + 0x080808, { rough: 0.9, metal: 0.02 });
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
    const PROPS = [{"id":"energy-control-plan","name":"energy control plan","kind":"prop"},{"id":"control-room-radio","name":"control room radio","kind":"prop"},{"id":"local-stop-button","name":"pump local stop","kind":"prop"},{"id":"standby-hand-off-auto","name":"standby pump hand-off-auto switch","kind":"prop"},{"id":"mcc-breaker-lock","name":"breaker lock at the motor control centre","kind":"prop"},{"id":"group-lock-box","name":"group lock box","kind":"prop"},{"id":"seal-water-solenoid","name":"seal-water solenoid on its own circuit","kind":"find"},{"id":"suction-valve-chain","name":"suction valve chain lock","kind":"prop"},{"id":"discharge-valve-chain","name":"discharge valve chain lock","kind":"prop"},{"id":"casing-pressure-gauge","name":"casing pressure gauge","kind":"meter"},{"id":"header-vent-valve","name":"header vent valve","kind":"prop"},{"id":"local-start-button","name":"local start button","kind":"prop"},{"id":"wet-well-gas-meter","name":"wet well gas meter","kind":"meter"},{"id":"personal-lock-rack","name":"personal lock rack","kind":"prop"},{"id":"group-box-hasp","name":"group box hasp","kind":"dest"},{"id":"release-checklist","name":"release checklist","kind":"prop"},{"id":"operator-log","name":"operator log","kind":"prop"},{"id":"level-alarm-panel","name":"level alarm panel","kind":"prop"},{"id":"stop-coworker","name":"stop coworker","kind":"figure"}];
    const HAZ = [{"id":"remove-anothers-lock","name":"remove anothers lock?"},{"id":"open-casing-under-pressure","name":"open casing under pressure?"},{"id":"leave-standby-in-auto","name":"leave standby in auto?"},{"id":"skip-try-start","name":"skip try start?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: USPL_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: USPL_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = USPL_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: USPL_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: USPL_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: USPL_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: USPL_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, USPL_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: USPL_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: USPL_CSS, w: 0.36 });
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
