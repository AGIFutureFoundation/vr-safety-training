import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ High-Voltage Lockout on Electric Cargo Equipment VR — CLEANPORTS, the zero-emission port operations
// block of the Bay Program wave.
//
// A generic container-terminal setting (no real terminal, equipment maker or
// model is shown). The practice is taught from the standards the
// certification line names; the Clean Ports note below says which workforce
// partner the Port of Oakland's programme names for this kind of training,
// from the facts file only, and never claims the station is that partner's
// curriculum. Union tags come from tools/unions.json.

const CPHV_ACCENT = 0xf2a12b;
const CPHV_CSS = "#f2a12b";

export const SIM_CP_HIGH_VOLTAGE_LOCKOUT_ON_ELECTRIC_CARGO_EQUIPMENT = {
  id: "cp-high-voltage-lockout-on-electric-cargo-equipment",
  index: "841",
  domain: "Maritime",
  trade: "ILWU maintenance mechanic or IAM machinist isolating the high-voltage system on a battery-electric yard tractor in a terminal shop bay",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "ILWU maintenance and repair training; IAM machinist training; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 the control of hazardous energy (lockout/tagout); NFPA 70E electrical safety in the workplace, including the shock protection boundary for DC systems, insulating gloves and the absence-of-voltage test; NFPA 70 (NEC) for the equipment's charging inlet circuit; and the equipment maker's own high-voltage service procedure and discharge wait time, stated only as the manual states it",
  name: "High-Voltage Lockout on Electric Cargo Equipment",
  title: simTitle("High-Voltage Lockout on Electric Cargo Equipment VR"),
  accent: CPHV_ACCENT,
  accentCss: CPHV_CSS,
  tagline: "A battery-electric yard tractor in the shop bay with a coolant fault on its work order: the service procedure read, insulating gloves air-tested and on, a chafed orange cable found at a frame clip, the key out and in your pocket, the service disconnect pulled and locked in its box, the discharge wait sat out in full, absence of voltage proven live-dead-live, the clip replaced and torqued, insulation resistance watched in band, a coolant weep at the pack found, the release checklist walked, and the bay foreman told",
  parSeconds: 360,
  footprint: 3,
  badge: {"id":"cphv-badge","name":"Zero Volts Proven","note":"The service disconnect locked, the wait sat out and the meter proving zero before a single orange cable was touched"},
  unions: ["ilwu","iam"],
  cleanPorts: "The Port of Oakland's Clean Ports programme names the Pacific Maritime Association (PMA) as the partner for skills and safety training on operating the zero-emission equipment; this station teaches the general high-voltage lockout practice from its cited standards and is not PMA's curriculum.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Zero Volts Proven",
    currency: "TAG",
    ranks: ["Yard Hand", "Zero-Emission Crew", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "cphv-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("prove-absence-of-voltage") },
      { id: "cphv-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "cphv-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "cphv-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cphv-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "touch-cable-bare-handed": "You reached for the orange cable with bare hands before the isolation was proven. A high-voltage cable is live until an absence-of-voltage test says otherwise, and bare skin inside the shock boundary is exactly what NFPA 70E's glove rule exists to prevent.",
    "skip-discharge-wait": "You opened the inverter cover straight after pulling the plug. The capacitors behind that cover hold their charge after the pack is disconnected, and the maker's wait is the time they need to bleed down — skipping it puts your hand where the stored energy still is.",
    "use-untested-gloves": "You pulled on the insulating gloves without rolling them for an air test. A pinhole in rubber insulating gloves is invisible to the eye and is the whole difference between a barrier and a false sense of one.",
    "reinsert-plug-early": "You went to put the service plug back before the release checklist was walked. Restoring energy with tools still in the frame or a cover off turns the first contactor click into a fault at the one place someone was just working."
  },

  steps: [
    {
      "id": "read-hv-service-order",
      "kind": "select",
      "target": "hv-service-order",
      "title": "Read the work order and the high-voltage procedure",
      "cue": "Read the order: a coolant fault on the pack, the tractor's unit number, and the maker's high-voltage service steps with its stated discharge wait.",
      "why": "A battery-electric tractor keeps hundreds of volts of direct current in its pack whether or not the key is on, so the job starts with the maker's own isolation steps and wait time in front of you — memory of a different model's procedure is how a disconnect gets missed."
    },
    {
      "id": "don-insulating-gloves",
      "kind": "sequence",
      "anyOrder": true,
      "targets": [
        "insulating-gloves",
        "leather-protectors"
      ],
      "itemNames": {
        "insulating-gloves": "rubber insulating gloves, air-tested",
        "leather-protectors": "leather protector gloves"
      },
      "title": "Air-test the insulating gloves and put protectors over them",
      "cue": "Roll each rubber insulating glove to trap air and check for leaks, then pull the leather protectors on over them.",
      "why": "NFPA 70E expects rubber insulating gloves rated for the system voltage whenever you are inside the shock boundary, and a pinhole you cannot see is exactly what the air test finds; the leather protectors keep a frame edge or a cable tie from cutting the rubber you are trusting."
    },
    {
      "id": "find-chafed-cable",
      "kind": "find",
      "noHint": true,
      "targets": [
        "chafed-hv-cable"
      ],
      "itemNames": {
        "chafed-hv-cable": "chafed orange high-voltage cable at a frame clip"
      },
      "itemNotes": {
        "chafed-hv-cable": "The orange cable running under the cab to the drive inverter has rubbed through its outer jacket where a frame clip has worked loose — braid showing, not copper yet."
      },
      "title": "Walk the orange cable runs before touching anything",
      "cue": "Look along every orange high-voltage cable from the pack to the inverter and the charge inlet for chafing, crushing or a loose clip.",
      "why": "Orange is the industry colour for high-voltage conductors on electric vehicles, and on a yard tractor that spends its shift over rough terminal pavement the clips that hold those cables loosen; a chafe found before the isolation is a job to plan, found by a hand it is a shock path."
    },
    {
      "id": "key-off-and-pocket",
      "kind": "select",
      "target": "key-switch",
      "title": "Key off, key in your pocket, 12-volt disconnect off",
      "cue": "Turn the key off, take it out and keep it on you, then open the low-voltage battery disconnect that powers the high-voltage contactors.",
      "why": "The contactors that connect the pack to the rest of the tractor are switched by the low-voltage system, so taking the key and opening that disconnect removes the command that could close them while you work — a key left in the dash is an invitation to anyone passing."
    },
    {
      "id": "pull-service-disconnect",
      "kind": "drag",
      "target": "service-plug",
      "title": "Pull the service disconnect and put it in the lock box",
      "cue": "Pull the pack's service disconnect plug and carry it to the lock box on the bay wall.",
      "why": "The service disconnect physically breaks the pack's circuit in the middle, and putting the plug where only your lock can release it means nobody can reinsert it because the tractor looks finished; a plug left on the seat is a plug someone helpfully puts back.",
      "drag": {
        "to": "plug-lockbox",
        "radius": 0.5,
        "missNote": "The plug is not in the lock box — carry it all the way in so the box can be closed and locked over it, not left on the bench beside it."
      }
    },
    {
      "id": "apply-personal-lock",
      "kind": "select",
      "target": "hv-lock-point",
      "title": "Your lock and tag on the box",
      "cue": "Close the lock box over the plug and hang your own lock and tag on it, with your name and the date.",
      "why": "Under 29 CFR 1910.147 each person working on isolated equipment puts on their own lock, so the energy source stays controlled by the one person exposed to it; a shared lock or a tag without a name tells the next shift nothing about who is still inside the frame."
    },
    {
      "id": "sit-out-discharge-wait",
      "kind": "hold",
      "target": "discharge-timer",
      "seconds": 6,
      "title": "Sit out the discharge wait in full",
      "cue": "Start the timer and stay clear of the orange cables until the maker's stated wait has fully run.",
      "why": "The drive inverter and the onboard charger hold capacitors that stay charged after the pack is disconnected, and the maker's wait is the time those take to bleed down through their resistors; cutting it short means your meter is the first thing that meets that stored charge — or your hand.",
      "holdBreakNote": "You stepped back into the frame before the wait ran out — the capacitors behind the inverter cover are still bleeding down, and the timer restarts from zero."
    },
    {
      "id": "prove-absence-of-voltage",
      "kind": "gauge",
      "target": "hv-meter",
      "title": "Prove absence of voltage, live-dead-live",
      "cue": "Check the meter on a known source, test the inverter's DC terminals phase to phase and to chassis, then check the meter again, and commit once it reads zero.",
      "why": "NFPA 70E treats a circuit as live until an absence-of-voltage test proves otherwise, and testing the meter on a known source before and after is what shows the zero you read was the circuit, not a blown fuse in the meter itself.",
      "gauge": {
        "label": "DC VOLTS",
        "speed": 0.62,
        "green": [
          0,
          0.05
        ],
        "readout": (t) => `${(t * 650).toFixed(0)} V DC`,
        "missNote": "The reading had not settled at zero — hold the probes on the terminals until the display stops falling before you commit it."
      }
    },
    {
      "id": "torque-new-clip",
      "kind": "turn",
      "target": "cable-clamp",
      "title": "Replace the clip and torque it to spec",
      "cue": "Fit the new clip with a cushion sleeve over the chafed section and turn the insulated driver until it clicks at spec.",
      "why": "A clip too loose lets the cable saw against the frame again over a few hundred terminal moves, and one overtightened crushes the insulation it is meant to protect; the insulated tool's click is the one sign the clamp is holding the cable without biting into it.",
      "turn": {
        "turns": 1,
        "label": "TORQUE",
        "readout": (t) => (t < 0.4 ? 'seating' : t < 0.9 ? 'tightening' : 'clicked at spec')
      }
    },
    {
      "id": "watch-insulation-resistance",
      "kind": "track",
      "target": "insulation-tester",
      "seconds": 6,
      "title": "Watch the insulation resistance stay in band",
      "cue": "Run the insulation tester on the repaired cable and keep the reading inside the band for the whole test.",
      "why": "A chafe can nick the inner insulation without showing on the outside, and an insulation resistance reading held through the whole test is what tells you the conductor is still sealed; a reading that sags is current finding its way toward the frame the driver sits on.",
      "track": {
        "start": 0.5,
        "green": [
          0.42,
          0.68
        ],
        "rise": 0.3,
        "fall": 0.26,
        "drift": 0.13,
        "label": "MEGOHMS",
        "readout": (v) => (v < 0.42 ? 'low — check the cable' : v > 0.68 ? 'test lead lifted' : 'in band')
      },
      "holdBreakNote": "The reading dropped out of band before the test finished — a cable signed off on half a test is a cable whose leak shows up under a driver instead of under the tester."
    },
    {
      "id": "find-coolant-weep",
      "kind": "find",
      "noHint": true,
      "targets": [
        "pack-coolant-weep"
      ],
      "itemNames": {
        "pack-coolant-weep": "coolant weeping at the pack's thermal loop fitting"
      },
      "itemNotes": {
        "pack-coolant-weep": "A glycol stain under the pack's thermal loop fitting — the coolant fault on the work order, and a liquid that has no business near high-voltage connectors."
      },
      "title": "Find the coolant fault on the work order",
      "cue": "Look under the pack along the thermal loop lines for the weep that set the coolant fault.",
      "why": "The pack's cooling loop keeps its cells in their temperature window, and coolant tracking toward a high-voltage connector is both the fault you were sent for and a new leakage path; finding the source now, while the system is still locked out, keeps the repair from becoming live work."
    },
    {
      "id": "walk-release-checklist",
      "kind": "select",
      "target": "release-checklist",
      "title": "Walk the release checklist before your lock comes off",
      "cue": "Tools out of the frame, covers back on, everyone clear, the plug reinserted only after the checklist is signed.",
      "why": "Releasing lockout is its own procedure under 29 CFR 1910.147: tools accounted for, guards and covers replaced, people told and clear, and only then the energy restored — a socket left on an inverter cover is found by the contactor closing."
    },
    {
      "id": "report-to-foreman",
      "kind": "select",
      "target": "shop-radio",
      "title": "Tell the bay foreman what you found",
      "cue": "Radio the foreman: clip replaced, insulation in band, coolant weep found at the loop fitting, tractor still tagged for the coolant repair.",
      "why": "The foreman decides which tractors go out to the berth, and a tractor with a coolant weep near its high-voltage connectors is not ready even though the chafe is fixed; saying exactly what was found keeps that decision on facts rather than on the tractor looking finished."
    }
  ],

  interrupts: [
    {
      "id": "coworker-reaches-for-key",
      "kind": "A co-worker reaches into the cab for the key",
      "after": "apply-personal-lock",
      "delay": 2,
      "seconds": 12,
      "alert": "A co-worker has climbed onto the tractor's step and is reaching into the cab to try the key switch while you sit out the wait.",
      "cue": "Stop them now and point to the lock box — the timer waits.",
      "target": "stop-coworker",
      "why": "Someone who has not seen the lock box does not know the tractor is isolated, and a key switch tried during a lockout is the exact action the lockout is meant to make impossible; stopping them keeps the procedure the only thing controlling that energy.",
      "missNote": "The wait continued while your co-worker reached into the cab; they were turning the switch before anyone told them the tractor was locked out, and only the pulled plug kept the contactors from closing.",
      "wrongNote": "Stop the co-worker first — a person reaching for the controls of isolated equipment is answered before the task in hand."
    },
    {
      "id": "second-tractor-backs-in",
      "kind": "A second tractor backs into the next bay",
      "after": "watch-insulation-resistance",
      "delay": 2,
      "seconds": 12,
      "alert": "A second electric yard tractor is backing into the next bay, almost silent, and the bay's barrier chain is still down.",
      "cue": "Raise the bay barrier and wave it off — the coolant check waits.",
      "target": "bay-barrier",
      "why": "Battery-electric equipment makes little noise at low speed, so the rumble people used to hear is gone; a raised barrier and a clear signal are what keep a quiet tractor from reversing into a bay where someone is working on the floor.",
      "missNote": "The coolant check went on while the tractor kept reversing toward the bay; its rear wheels were at the chain before the driver saw anyone was working there.",
      "wrongNote": "The barrier first — a vehicle backing toward a work bay is answered immediately, not after the check you were on."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, CPHV_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#33363a", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    vehicle(0.2, -1.5, Math.PI / 2, 2.6, 0x2f6f9f, 0xf2a12b);
    const bay = group(g, -2.6, 0, -1.9);
    box(bay, 0.1, 2.4, 1.6, 0, 1.2, 0, 0x5b646c, { rough: 0.6 });
    box(bay, 1.4, 0.08, 1.6, 0.7, 2.4, 0, 0x4a525a, { rough: 0.6 });

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
    const PROPS = [{"id":"hv-service-order","name":"hv service order","kind":"prop"},{"id":"insulating-gloves","name":"rubber insulating gloves, air-tested","kind":"prop"},{"id":"leather-protectors","name":"leather protector gloves","kind":"prop"},{"id":"chafed-hv-cable","name":"chafed orange high-voltage cable at a frame clip","kind":"find"},{"id":"key-switch","name":"key switch","kind":"prop"},{"id":"service-plug","name":"service plug","kind":"prop"},{"id":"plug-lockbox","name":"plug lockbox","kind":"dest"},{"id":"hv-lock-point","name":"hv lock point","kind":"prop"},{"id":"discharge-timer","name":"discharge timer","kind":"prop"},{"id":"hv-meter","name":"hv meter","kind":"meter"},{"id":"cable-clamp","name":"cable clamp","kind":"prop"},{"id":"insulation-tester","name":"insulation tester","kind":"meter"},{"id":"pack-coolant-weep","name":"coolant weeping at the pack's thermal loop fitting","kind":"find"},{"id":"release-checklist","name":"release checklist","kind":"prop"},{"id":"shop-radio","name":"shop radio","kind":"prop"},{"id":"stop-coworker","name":"stop coworker","kind":"figure"},{"id":"bay-barrier","name":"bay barrier","kind":"prop"}];
    const HAZ = [{"id":"touch-cable-bare-handed","name":"touch cable bare handed?"},{"id":"skip-discharge-wait","name":"skip discharge wait?"},{"id":"use-untested-gloves","name":"use untested gloves?"},{"id":"reinsert-plug-early","name":"reinsert plug early?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: CPHV_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: CPHV_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = CPHV_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: CPHV_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: CPHV_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: CPHV_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: CPHV_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, CPHV_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: CPHV_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: CPHV_CSS, w: 0.36 });
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
