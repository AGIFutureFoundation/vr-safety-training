import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Charging Yard: Connectors, E-Stops and Cable Management VR — CLEANPORTS, the zero-emission port operations
// block of the Bay Program wave.
//
// A generic container-terminal setting (no real terminal, equipment maker or
// model is shown). The practice is taught from the standards the
// certification line names; the Clean Ports note below says which workforce
// partner the Port of Oakland's programme names for this kind of training,
// from the facts file only, and never claims the station is that partner's
// curriculum. Union tags come from tools/unions.json.

const CPCY_ACCENT = 0x3fc1d8;
const CPCY_CSS = "#3fc1d8";

export const SIM_CP_CHARGING_YARD_CONNECTORS_AND_E_STOPS = {
  id: "cp-charging-yard-connectors-and-e-stops",
  index: "842",
  domain: "Energy",
  trade: "IBEW electrician and ILWU equipment operator opening a terminal charging yard for the shift — connectors, emergency stops and cable management",
  category: "Maritime & Ports",
  weather: "clear",
  certification: "IBEW/NECA JATC apprenticeship and journeyman training; NFPA 70 (NEC) for electric vehicle power transfer equipment and its disconnecting means; NFPA 70E electrical safety in the workplace; 29 CFR 1910.147 the control of hazardous energy; OSHA 29 CFR 1917 marine terminals for vehicle routes and pedestrian separation; ANSI Z535.4 for the product safety signs on each dispenser",
  name: "Charging Yard: Connectors, E-Stops and Cable Management",
  title: simTitle("Charging Yard: Connectors, E-Stops and Cable Management VR"),
  accent: CPCY_ACCENT,
  accentCss: CPCY_CSS,
  tagline: "The charging yard before the first shift plugs in: the yard's switching log read, a walk of every dispenser, a cracked connector latch found and tagged out, a cable left across the drive lane coiled back onto its hanger, the yard e-stop tested and reset on purpose, a yard tractor plugged in and its session watched, a pooled puddle at a pedestal found, the faulted dispenser locked out at its breaker, the in-service board updated and the shift lead told",
  parSeconds: 330,
  footprint: 3,
  badge: {"id":"cpcy-badge","name":"Yard Walked","note":"Every connector looked at, every cable off the ground and the e-stop proven before a single session started"},
  unions: ["ibew","ilwu"],
  cleanPorts: "The Port of Oakland's Clean Ports programme funds charging infrastructure among its zero-emission activities; it names PMA for skills and safety training on operating the equipment. This station teaches charging-yard practice from its cited standards and is not any partner's curriculum.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Yard Walked",
    currency: "TAG",
    ranks: ["Yard Hand", "Zero-Emission Crew", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "cpcy-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("read-switching-log") },
      { id: "cpcy-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "cpcy-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "cpcy-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cpcy-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "use-cracked-connector": "You went to plug the cracked connector into a tractor. A connector whose latch cannot lock can be pulled out under load, and the arc at the pins when it does is the hazard the latch exists to prevent.",
    "drive-over-cable": "You waved a tractor across the cable lying in the drive lane. Every wheel that rolls over a charging cable crushes its insulation from the inside, and the damage stays hidden until the jacket fails.",
    "reset-e-stop-blind": "You reset the e-stop without checking the row. Restoring power to every dispenser at once while someone may still be at a housing turns the reset into the hazard.",
    "open-housing-live": "You opened dispenser 2's housing before its breaker was locked out. A tag on a connector does nothing to the conductors behind that panel — only isolation at the breaker does."
  },

  steps: [
    {
      "id": "read-switching-log",
      "kind": "select",
      "target": "yard-switching-log",
      "title": "Read the yard's switching log",
      "cue": "Read which dispensers are tagged out, which breakers were switched overnight, and any faults the last shift wrote up.",
      "why": "A charging yard is an electrical installation that other people have been working on since you last saw it, and the switching log is where a breaker opened for repair or a connector already reported is written; walking the yard without it means rediscovering yesterday's faults the hard way."
    },
    {
      "id": "walk-dispenser-row",
      "kind": "sequence",
      "anyOrder": false,
      "targets": [
        "dispenser-one",
        "dispenser-two",
        "dispenser-three"
      ],
      "itemNames": {
        "dispenser-one": "dispenser 1",
        "dispenser-two": "dispenser 2",
        "dispenser-three": "dispenser 3"
      },
      "outOfOrderNote": "Walk the row in order from the yard entrance — skipping around is how a dispenser in the middle gets missed.",
      "title": "Walk the dispenser row in order",
      "cue": "Visit each dispenser from the entrance down: housing closed, screen alive, holster intact, signs readable.",
      "why": "Walking the row in the same order every shift is what makes the one dispenser that looks different stand out, and it keeps the check from depending on which pedestal happened to catch your eye; a damaged housing or a dead screen is often the first sign of water or impact damage inside."
    },
    {
      "id": "find-cracked-latch",
      "kind": "find",
      "noHint": true,
      "targets": [
        "cracked-connector-latch"
      ],
      "itemNames": {
        "cracked-connector-latch": "cracked latch on dispenser 2's connector"
      },
      "itemNotes": {
        "cracked-connector-latch": "Dispenser 2's connector has a crack across its latch — it will still push into an inlet, but it will not lock, and a connector that does not lock can be pulled out under load."
      },
      "title": "Look closely at each connector",
      "cue": "Pick up each connector: pins straight and clean, seal intact, latch whole and springing back.",
      "why": "The latch is what holds a connector in the vehicle inlet so the session can confirm it is seated before energising, and a cracked one lets the plug be pulled or knocked out mid-charge; connectors take a beating from being dropped on pavement and driven over, so they are looked at every shift."
    },
    {
      "id": "tag-out-connector",
      "kind": "select",
      "target": "out-of-service-tag",
      "title": "Tag the damaged connector out of service",
      "cue": "Hang the out-of-service tag on dispenser 2 and holster the connector so nobody plugs it in.",
      "why": "A defect found and not tagged is a defect the next operator finds by using it, and a tag on the holster is the one signal an operator coming off a vessel shift will see before they reach for the plug; it also tells the electrician which unit to open first."
    },
    {
      "id": "coil-trip-cable",
      "kind": "drag",
      "target": "loose-charge-cable",
      "title": "Get the cable off the drive lane",
      "cue": "Carry the charging cable left across the drive lane back to its overhead hanger.",
      "why": "A charging cable lying on the pavement is crushed by every wheel that crosses it and trips everyone who walks the yard at night, and the damage from being driven over is often inside the jacket where you cannot see it; cable management means cables live on their hangers.",
      "drag": {
        "to": "cable-hanger",
        "radius": 0.5,
        "missNote": "The cable is not on its hanger — carry it all the way up so no loop is left on the ground."
      }
    },
    {
      "id": "test-yard-e-stop",
      "kind": "select",
      "target": "yard-e-stop",
      "title": "Test the yard emergency stop",
      "cue": "Warn the yard on the radio, press the yard e-stop, confirm every dispenser screen goes dark.",
      "why": "The emergency stop is the one control anyone in the yard can reach to cut power to every dispenser at once, and it only earns that trust if it is proven to work; a test announced first means nobody mid-session is surprised by their charge dropping."
    },
    {
      "id": "reset-e-stop-deliberately",
      "kind": "turn",
      "target": "e-stop-reset",
      "title": "Reset the e-stop on purpose",
      "cue": "Twist the e-stop to release it, then reset the yard controller — only once everyone is clear.",
      "why": "An emergency stop that restores power the moment it is pulled out is not a safe design, which is why the reset is a separate deliberate act; releasing it only after checking the row keeps the restart under the control of someone who has looked.",
      "turn": {
        "turns": 0.75,
        "label": "RESET",
        "readout": (t) => (t < 0.5 ? 'twisting' : t < 0.9 ? 'released' : 'controller reset')
      }
    },
    {
      "id": "plug-in-yard-tractor",
      "kind": "drag",
      "target": "good-connector",
      "title": "Plug in a yard tractor",
      "cue": "Carry dispenser 1's connector to the parked tractor's inlet and seat it until the latch clicks.",
      "why": "The session will not start until the dispenser confirms the connector is latched in the inlet, and seating it fully is what keeps the pins from arcing on a partial contact; the tractor should be parked, braked and keyed off before the connector ever leaves the holster.",
      "drag": {
        "to": "tractor-inlet",
        "radius": 0.5,
        "missNote": "Not latched — push the connector straight into the inlet until the latch clicks, not resting against the inlet's edge."
      }
    },
    {
      "id": "watch-charge-session",
      "kind": "track",
      "target": "session-meter",
      "seconds": 6,
      "title": "Watch the first minutes of the session",
      "cue": "Stay at the dispenser and keep the session current inside the band until it settles.",
      "why": "A session that is going to fault usually does so in its first minutes as the current ramps up, and a person standing at the dispenser can stop it at once; walking off as soon as the screen says charging leaves a fault to be found by the next person who walks past.",
      "track": {
        "start": 0.5,
        "green": [
          0.4,
          0.64
        ],
        "rise": 0.3,
        "fall": 0.27,
        "drift": 0.14,
        "label": "SESSION A",
        "readout": (v) => (v < 0.4 ? 'derating' : v > 0.64 ? 'over limit' : 'steady')
      },
      "holdBreakNote": "The session current left the band before you had watched it settle — a session walked away from early is one whose fault is found by the next operator instead."
    },
    {
      "id": "find-pooled-water",
      "kind": "find",
      "noHint": true,
      "targets": [
        "pedestal-puddle"
      ],
      "itemNames": {
        "pedestal-puddle": "water pooled around dispenser 3's pedestal"
      },
      "itemNotes": {
        "pedestal-puddle": "Water pooled around dispenser 3's pedestal after the night's rain — the drain beside it is blocked, and the cable entry at the base is sitting in it."
      },
      "title": "Check the ground around the pedestals",
      "cue": "Look at the base of each pedestal for pooled water, a cracked base or a damaged bollard.",
      "why": "Dispensers are rated for weather, but water standing over a cable entry or a cracked pedestal base is how moisture reaches terminations over time; a blocked drain is a small fix today and a ground fault next month."
    },
    {
      "id": "lock-out-breaker",
      "kind": "select",
      "target": "dispenser-breaker",
      "title": "Lock out dispenser 2 at its breaker",
      "cue": "Open dispenser 2's breaker in the yard switchgear and hang your lock and tag before the electrician opens the housing.",
      "why": "A tag on the connector stops people using it, but opening the housing needs the energy controlled at its source under 29 CFR 1910.147, and a lock on the breaker is what makes the repair safe whoever turns up to do it."
    },
    {
      "id": "update-status-board",
      "kind": "select",
      "target": "in-service-board",
      "title": "Update the in-service board",
      "cue": "Mark dispenser 2 out of service and dispenser 3 watched for drainage on the yard's status board.",
      "why": "Operators pick a dispenser from the board as they pull in, so the board is the tool that routes equipment away from a faulted unit; an accurate board saves every operator from rediscovering the same fault."
    },
    {
      "id": "call-shift-lead",
      "kind": "select",
      "target": "yard-radio",
      "title": "Tell the shift lead",
      "cue": "Radio the lead: connector latch cracked and locked out, cable hung, e-stop tested, puddle at dispenser 3 needs the drain cleared.",
      "why": "The shift lead plans how many tractors can charge through the break, and one fewer dispenser changes that plan; telling them now keeps the charging schedule built on what the yard can actually do."
    }
  ],

  interrupts: [
    {
      "id": "operator-grabs-tagged-plug",
      "kind": "An operator reaches for the tagged connector",
      "after": "coil-trip-cable",
      "delay": 2,
      "seconds": 12,
      "alert": "An operator has pulled a tractor up to dispenser 2 and is lifting the tagged connector out of its holster.",
      "cue": "Stop them and send them to dispenser 1 — the e-stop test waits.",
      "target": "stop-operator",
      "why": "An operator coming off a long shift can miss a tag, and the only thing between them and a connector that will not latch is someone saying so; stopping them now keeps the tag meaning what it says.",
      "missNote": "You kept moving toward the e-stop while the operator seated the cracked connector; the session started with the plug unlatched in the inlet.",
      "wrongNote": "Stop the operator first — someone reaching for tagged-out equipment is answered before the next task."
    },
    {
      "id": "pedestrian-in-drive-lane",
      "kind": "A visitor walks into the drive lane",
      "after": "watch-charge-session",
      "delay": 2,
      "seconds": 12,
      "alert": "A visitor without a vest has walked into the drive lane between the dispensers as a quiet electric top pick moves down the row.",
      "cue": "Signal the top pick to stop and walk the visitor to the marked walkway — the pedestal check waits.",
      "target": "walkway-sign",
      "why": "Electric equipment is quiet enough that someone on foot may not hear it coming, and the marked walkway is the separation 29 CFR 1917 terminals depend on; getting a pedestrian out of a drive lane comes before any inspection.",
      "missNote": "The pedestal check went on while the visitor stood in the drive lane; the top pick's operator only saw them when the load was already overhead.",
      "wrongNote": "The walkway first — a person on foot in a vehicle lane is answered immediately."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, CPCY_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#2d3033", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    for (let i = 0; i < 3; i++) { const c = cabinet(-1.6 + i * 1.6, -1.95, 0x2a3f4d, 1.5); box(c, 0.36, 0.22, 0.02, 0, 1.15, 0.26, 0x0d1c24, { emissive: 0x3fc1d8, ei: 0.5 }); }
    vehicle(2.4, -0.9, 0, 2.2, 0x2f6f9f, 0x1f2326);

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
    const PROPS = [{"id":"yard-switching-log","name":"yard switching log","kind":"prop"},{"id":"dispenser-one","name":"dispenser 1","kind":"prop"},{"id":"dispenser-two","name":"dispenser 2","kind":"prop"},{"id":"dispenser-three","name":"dispenser 3","kind":"prop"},{"id":"cracked-connector-latch","name":"cracked latch on dispenser 2's connector","kind":"find"},{"id":"out-of-service-tag","name":"out of service tag","kind":"prop"},{"id":"loose-charge-cable","name":"loose charge cable","kind":"prop"},{"id":"cable-hanger","name":"cable hanger","kind":"dest"},{"id":"yard-e-stop","name":"yard e stop","kind":"prop"},{"id":"e-stop-reset","name":"e stop reset","kind":"prop"},{"id":"good-connector","name":"good connector","kind":"prop"},{"id":"tractor-inlet","name":"tractor inlet","kind":"dest"},{"id":"session-meter","name":"session meter","kind":"meter"},{"id":"pedestal-puddle","name":"water pooled around dispenser 3's pedestal","kind":"find"},{"id":"dispenser-breaker","name":"dispenser breaker","kind":"prop"},{"id":"in-service-board","name":"in service board","kind":"prop"},{"id":"yard-radio","name":"yard radio","kind":"prop"},{"id":"stop-operator","name":"stop operator","kind":"figure"},{"id":"walkway-sign","name":"walkway sign","kind":"prop"}];
    const HAZ = [{"id":"use-cracked-connector","name":"use cracked connector?"},{"id":"drive-over-cable","name":"drive over cable?"},{"id":"reset-e-stop-blind","name":"reset e stop blind?"},{"id":"open-housing-live","name":"open housing live?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: CPCY_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: CPCY_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = CPCY_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: CPCY_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: CPCY_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: CPCY_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: CPCY_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, CPCY_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: CPCY_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: CPCY_CSS, w: 0.36 });
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
