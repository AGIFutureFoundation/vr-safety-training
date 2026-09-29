import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Zero-Emission Drayage Truck Pre-Trip VR — CLEANPORTS, the zero-emission port operations
// block of the Bay Program wave.
//
// A generic container-terminal setting (no real terminal, equipment maker or
// model is shown). The practice is taught from the standards the
// certification line names; the Clean Ports note below says which workforce
// partner the Port of Oakland's programme names for this kind of training,
// from the facts file only, and never claims the station is that partner's
// curriculum. Union tags come from tools/unions.json.

const CPDT_ACCENT = 0x8fd14f;
const CPDT_CSS = "#8fd14f";

export const SIM_CP_ZERO_EMISSION_DRAYAGE_TRUCK_PRE_TRIP = {
  id: "cp-zero-emission-drayage-truck-pre-trip",
  index: "846",
  domain: "Mobility",
  trade: "Teamsters drayage driver doing the pre-trip inspection on a battery-electric drayage tractor and container chassis before the first port turn",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "Teamsters driver training; FMCSA 49 CFR 396 inspection, repair and maintenance, including reviewing the last driver vehicle inspection report and writing your own; 49 CFR 393 parts and accessories necessary for safe operation; 49 CFR 392 driving of commercial motor vehicles; ANSI Z535.4 for the high-voltage warning labels on the battery system; OSHA 29 CFR 1910.132 for the gloves and high-visibility vest worn on the walk-around; NFPA 70E for the high-voltage components a driver recognises and does not touch; and the tractor maker's own pre-trip items for its battery system",
  name: "Zero-Emission Drayage Truck Pre-Trip",
  title: simTitle("Zero-Emission Drayage Truck Pre-Trip VR"),
  accent: CPDT_ACCENT,
  accentCss: CPDT_CSS,
  tagline: "A battery-electric drayage tractor before the day's port turns: last night's inspection report read, the charge cable stowed and the port door shut, the state of charge read against the turns, the orange cables under the cab looked at and left alone, the air pressure built and held on an electric compressor, the brakes tested, the fifth wheel and the chassis twistlocks locked, a flat chassis tyre found, the pedestrian alert heard, and your own report written",
  parSeconds: 330,
  footprint: 3,
  badge: {"id":"cpdt-badge","name":"Rolled Out Ready","note":"The report read, the charge matched to the turns and the chassis locked to the box before the first turn"},
  unions: ["teamsters"],
  cleanPorts: "The Port of Oakland's Clean Ports programme finances 475 zero-emission drayage trucks; its release says MI assists WOJRC in expanding its Pre-Apprentice Transportation, Distribution and Logistics training programme to include careers affected by zero-emission vehicles. This station teaches the general pre-trip practice from its cited standards and is not that programme.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Rolled Out Ready",
    currency: "TAG",
    ranks: ["Yard Hand", "Zero-Emission Crew", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "cpdt-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("read-state-of-charge") },
      { id: "cpdt-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "cpdt-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "cpdt-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cpdt-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "grab-orange-cable": "You reached up to move the orange cable yourself. High-voltage cables are for qualified technicians only — a driver looks and reports.",
    "roll-with-cable-plugged": "You went to release the brakes with the charge cable still connected. Driving off pulls the connector and damages the dispenser and cable.",
    "skip-dvir-review": "You went straight to the truck without reading last night's report. A defect the last driver wrote up may still be there.",
    "leave-twistlock-open": "You went to pull out with a chassis twistlock unlocked. An unlocked twistlock can let the container shift or lift on a turn."
  },

  steps: [
    {
      "id": "read-last-dvir",
      "kind": "select",
      "target": "last-dvir",
      "title": "Read last night's inspection report",
      "cue": "Read the last driver's vehicle inspection report and the mechanic's sign-off for anything they wrote up.",
      "why": "49 CFR 396 has a driver review the last inspection report and sign it where defects were repaired, because a defect the last driver wrote up is either fixed and signed for or still there; starting the day without reading it means inheriting a problem blind."
    },
    {
      "id": "stow-charge-cable",
      "kind": "drag",
      "target": "depot-charge-cable",
      "title": "Unplug and stow the charge cable, shut the port door",
      "cue": "Unlatch the charge connector, carry the cable back to its hanger, then close the tractor's charge port door.",
      "why": "A charge cable left connected is pulled from the dispenser when the tractor moves, and an open charge port lets water and road grime into the inlet; stowing both is the first item because it is the one a battery-electric truck adds to the walk-around.",
      "drag": {
        "to": "cable-hanger-post",
        "radius": 0.5,
        "missNote": "Not stowed — carry the cable all the way back to the hanger so nothing is left on the ground behind the tractor."
      }
    },
    {
      "id": "read-state-of-charge",
      "kind": "gauge",
      "target": "range-display",
      "title": "Read the state of charge against the day's turns",
      "cue": "Read the charge and estimated range and commit once they settle in the band your turns need, with a margin for queues.",
      "why": "Terminal queues and traffic both use charge, and a truck that runs short between the terminal and the warehouse becomes a breakdown in a lane; matching the charge to the day's turns, with a margin, is the drayage version of checking the fuel.",
      "gauge": {
        "label": "RANGE",
        "speed": 0.6,
        "green": [
          0.7,
          1
        ],
        "readout": (t) => `${(t * 100).toFixed(0)}% charge`,
        "missNote": "Not settled in the band — wait for the display; too little margin means a charge before the first turn."
      }
    },
    {
      "id": "look-at-orange-cables",
      "kind": "select",
      "target": "under-cab-cables",
      "title": "Look at the orange cables — do not touch",
      "cue": "Look under the cab at the orange high-voltage cables and their clips for damage, and report anything you see.",
      "why": "The orange cables carry the battery's high voltage and are for qualified technicians only under NFPA 70E, but a driver's eyes on the walk-around are often the first to spot a cable hanging from a broken clip or rubbing on the frame; look, report, never handle."
    },
    {
      "id": "build-air-pressure",
      "kind": "track",
      "target": "air-pressure-gauge",
      "seconds": 6,
      "title": "Build air on the electric compressor and hold it",
      "cue": "Run the electric air compressor and keep the pressure inside the band while you watch for leaks.",
      "why": "A battery-electric tractor's air brakes are fed by an electric compressor instead of an engine-driven one, but 49 CFR 393 air brake requirements are the same; building pressure and watching it hold is how a leak in the lines or a weak compressor is found before the brakes need it.",
      "track": {
        "start": 0.45,
        "green": [
          0.38,
          0.66
        ],
        "rise": 0.3,
        "fall": 0.27,
        "drift": 0.13,
        "label": "AIR PSI",
        "readout": (v) => (v < 0.38 ? 'building slow' : v > 0.66 ? 'governor high' : 'holding')
      },
      "holdBreakNote": "The pressure fell out of band while you watched — find the leak before the truck moves; air brakes that lose pressure fail safe only if the driver catches it."
    },
    {
      "id": "hold-brake-application",
      "kind": "hold",
      "target": "brake-pedal",
      "seconds": 5,
      "title": "Hold a full brake application",
      "cue": "With the air built, hold a full service brake application and watch the gauge stay steady.",
      "why": "A full application held for a minute shows whether the brake system leaks under pressure, and on an electric truck it proves the friction brakes on their own, since regenerative braking does much of the everyday slowing and can hide a weak service brake.",
      "holdBreakNote": "You released before the check was complete — hold the application so the gauge can show whether the system leaks."
    },
    {
      "id": "check-fifth-wheel",
      "kind": "turn",
      "target": "fifth-wheel-release",
      "title": "Check the fifth wheel is locked",
      "cue": "Pull the release handle to test it, then confirm the jaws are closed round the kingpin and the handle is back in.",
      "why": "The fifth wheel is the only connection between tractor and chassis, and a jaw not fully closed round the kingpin can let a loaded chassis separate on the road; 49 CFR 393 sets the coupling requirements and the driver's look confirms them every trip.",
      "turn": {
        "turns": 0.8,
        "label": "FIFTH WHEEL",
        "readout": (t) => (t < 0.4 ? 'handle out' : t < 0.9 ? 'jaws closing' : 'locked on kingpin')
      }
    },
    {
      "id": "lock-chassis-twistlocks",
      "kind": "sequence",
      "anyOrder": true,
      "targets": [
        "front-twistlock",
        "rear-twistlock"
      ],
      "itemNames": {
        "front-twistlock": "front chassis twistlocks",
        "rear-twistlock": "rear chassis twistlocks"
      },
      "title": "Lock the container to the chassis",
      "cue": "Check every chassis twistlock is turned and locked into the container's corner castings.",
      "why": "A container rides on a chassis held only by its twistlocks, and one left unlocked can let the box shift or lift on a turn; 49 CFR 393 cargo securement covers intermodal containers, and the driver checks the locks each time a box is loaded."
    },
    {
      "id": "test-alert-sound",
      "kind": "select",
      "target": "alert-sound-test",
      "title": "Check the pedestrian alert sound",
      "cue": "With the tractor on and rolling slowly in the yard, confirm the pedestrian alert sound is audible from outside.",
      "why": "An electric drayage tractor is very quiet at terminal speeds, where people on foot are most common, and the alert sound is what lets them hear it coming; a silent truck in a busy yard is a hazard its driver cannot see."
    },
    {
      "id": "find-flat-chassis-tyre",
      "kind": "find",
      "noHint": true,
      "targets": [
        "low-chassis-tyre"
      ],
      "itemNames": {
        "low-chassis-tyre": "low tyre on the chassis's rear axle"
      },
      "itemNotes": {
        "low-chassis-tyre": "The chassis's rear inside tyre is visibly low — easy to miss from outside the dual, and a tyre that overheats on the road."
      },
      "title": "Walk the chassis tyres",
      "cue": "Look at every chassis tyre, including the inside duals, for pressure, cuts and tread.",
      "why": "Chassis come to a driver from a pool and are often the least looked-after part of the rig, and an under-inflated inside dual can overheat and fail on the freeway; finding it at the terminal means a chassis swap instead of a roadside repair."
    },
    {
      "id": "write-own-dvir",
      "kind": "select",
      "target": "own-dvir",
      "title": "Write your own inspection report",
      "cue": "Write the low chassis tyre and anything else found on today's report, and sign it.",
      "why": "49 CFR 396 requires a driver's written report of defects that would affect safe operation, and writing today's up is how the chassis pool and the shop hear about the tyre; the report also shows the tractor was inspected before it left."
    },
    {
      "id": "swap-chassis-and-call",
      "kind": "select",
      "target": "dispatch-radio",
      "title": "Call dispatch for a chassis swap",
      "cue": "Radio dispatch: tractor ready, chassis tyre low, need a swap before the first turn.",
      "why": "Dispatch books the terminal appointment, and a truck that arrives with a defective chassis is turned away or delayed at the gate; calling now gets the swap done before the appointment rather than at it."
    }
  ],

  interrupts: [
    {
      "id": "yard-spotter-waves",
      "kind": "A yard spotter walks behind the tractor",
      "after": "build-air-pressure",
      "delay": 2,
      "seconds": 12,
      "alert": "A yard spotter has walked behind the tractor to check a chassis number while the compressor runs.",
      "cue": "Sound the horn and wave them clear of the rear before anything else — the gauge can wait.",
      "target": "stop-spotter",
      "why": "An electric tractor gives no engine sound to warn someone behind it, and a driver about to test the brakes and couplings needs everyone clear of the rear first.",
      "missNote": "You kept watching the gauge while the spotter stood behind the tractor; the brake test would have started with them between tractor and chassis.",
      "wrongNote": "The spotter first — a person behind the rig is answered before the test goes on."
    },
    {
      "id": "charge-warning-pops",
      "kind": "The dash warns the battery is too warm to fast-charge",
      "after": "check-fifth-wheel",
      "delay": 2,
      "seconds": 12,
      "alert": "The dash has popped a battery temperature warning: the pack is too warm for a fast charge at the terminal later.",
      "cue": "Note the warning on the report for the shop — the twistlocks wait.",
      "target": "battery-temp-note",
      "why": "A battery thermal warning is something the shop needs to know about before the truck relies on a mid-day charge, and writing it down now keeps it from becoming a surprise at the terminal charger.",
      "missNote": "You finished the twistlocks and forgot the warning; the truck arrived at the terminal charger unable to take the charge its turns depended on.",
      "wrongNote": "Note the warning first — a battery warning goes on the report while it is in front of you."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, CPDT_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#303336", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    vehicle(-0.8, -1.4, Math.PI / 2, 2.4, 0xdfe4e8, 0x8fd14f, 1.2);
    const ch = group(g, 1.9, 0, -1.4, Math.PI / 2);
    box(ch, 1.0, 0.12, 2.6, 0, 0.6, 0, 0x2b2f33, { rough: 0.6, metal: 0.5 });
    box(ch, 1.05, 1.0, 2.5, 0, 1.18, 0, 0x8c2f2a, { rough: 0.7, metal: 0.25 });
    for (const wz of [-0.9, -0.5]) for (const wx of [-0.5, 0.5]) cyl(ch, 0.24, 0.24, 0.2, wx, 0.24, wz, 0x1c1e20, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;

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
    const PROPS = [{"id":"last-dvir","name":"last dvir","kind":"prop"},{"id":"depot-charge-cable","name":"depot charge cable","kind":"prop"},{"id":"cable-hanger-post","name":"cable hanger post","kind":"dest"},{"id":"range-display","name":"range display","kind":"meter"},{"id":"under-cab-cables","name":"under cab cables","kind":"prop"},{"id":"air-pressure-gauge","name":"air pressure gauge","kind":"meter"},{"id":"brake-pedal","name":"brake pedal","kind":"prop"},{"id":"fifth-wheel-release","name":"fifth wheel release","kind":"prop"},{"id":"front-twistlock","name":"front chassis twistlocks","kind":"prop"},{"id":"rear-twistlock","name":"rear chassis twistlocks","kind":"prop"},{"id":"alert-sound-test","name":"alert sound test","kind":"prop"},{"id":"low-chassis-tyre","name":"low tyre on the chassis's rear axle","kind":"find"},{"id":"own-dvir","name":"own dvir","kind":"prop"},{"id":"dispatch-radio","name":"dispatch radio","kind":"prop"},{"id":"stop-spotter","name":"stop spotter","kind":"figure"},{"id":"battery-temp-note","name":"battery temp note","kind":"prop"}];
    const HAZ = [{"id":"grab-orange-cable","name":"grab orange cable?"},{"id":"roll-with-cable-plugged","name":"roll with cable plugged?"},{"id":"skip-dvir-review","name":"skip dvir review?"},{"id":"leave-twistlock-open","name":"leave twistlock open?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: CPDT_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: CPDT_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = CPDT_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: CPDT_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: CPDT_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: CPDT_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: CPDT_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, CPDT_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: CPDT_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: CPDT_CSS, w: 0.36 });
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
