import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Zero-Emission Terminal Equipment Pre-Use VR — CLEANPORTS, the zero-emission port operations
// block of the Bay Program wave.
//
// A generic container-terminal setting (no real terminal, equipment maker or
// model is shown). The practice is taught from the standards the
// certification line names; the Clean Ports note below says which workforce
// partner the Port of Oakland's programme names for this kind of training,
// from the facts file only, and never claims the station is that partner's
// curriculum. Union tags come from tools/unions.json.

const CPTE_ACCENT = 0xf0b323;
const CPTE_CSS = "#f0b323";

export const SIM_CP_ZERO_EMISSION_TERMINAL_EQUIPMENT_PRE_USE = {
  id: "cp-zero-emission-terminal-equipment-pre-use",
  index: "845",
  domain: "Maritime",
  trade: "ILWU equipment operator doing the pre-use inspection on a battery-electric yard tractor, top pick and straddle carrier before a vessel shift",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "ILWU operator training; OSHA 29 CFR 1917 marine terminals, including powered industrial truck inspection before use; 29 CFR 1910.178 powered industrial trucks; ANSI B56.1 for lift truck operator checks; NFPA 70E for the high-voltage warnings an operator must recognise and not touch; and each machine's posted operator's checklist",
  name: "Zero-Emission Terminal Equipment Pre-Use",
  title: simTitle("Zero-Emission Terminal Equipment Pre-Use VR"),
  accent: CPTE_ACCENT,
  accentCss: CPTE_CSS,
  tagline: "Three battery-electric machines before a vessel shift: the operator's checklist read, the charge cable unplugged and hung before anything moves, the yard tractor's state of charge read against the shift, a lit high-voltage warning on its dash found and the tractor tagged, the top pick's twistlocks and spreader cycled, its hydraulic line checked, the straddle carrier's legs, tyres and mirrors walked, the pedestrian alert tested on a machine that is otherwise silent, a brake test held, a broken camera found, and the defects written up",
  parSeconds: 340,
  footprint: 3,
  badge: {"id":"cpte-badge","name":"Checked Before It Rolled","note":"Every machine walked, every warning read and the quiet ones heard before they moved"},
  unions: ["ilwu","iam"],
  cleanPorts: "The Port of Oakland's Clean Ports programme finances 188 pieces of zero-emission cargo handling equipment and names PMA for skills and safety training on operating it; this station teaches the general pre-use practice from its cited standards and is not PMA's curriculum.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Checked Before It Rolled",
    currency: "TAG",
    ranks: ["Yard Hand", "Zero-Emission Crew", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "cpte-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("read-state-of-charge") },
      { id: "cpte-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "cpte-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "cpte-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "cpte-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drive-with-cable-connected": "You reached for the drive control with the charge cable still connected. Driving off pulls the connector and can leave damaged, live pins on the ground.",
    "open-hv-cover": "You went to open the high-voltage cover to see what the warning meant. Only a qualified mechanic works on those conductors — the operator tags and reports.",
    "run-hand-along-hose": "You ran your hand along the hydraulic hose to find the leak. A pinhole leak can inject fluid through skin; look for wet fittings, never feel for them.",
    "skip-alert-test": "You skipped the pedestrian alert test. On a machine this quiet, the alert is often the only warning people on foot get."
  },

  steps: [
    {
      "id": "read-operator-checklist",
      "kind": "select",
      "target": "operator-checklist",
      "title": "Read each machine's posted checklist",
      "cue": "Read the yard tractor's, the top pick's and the straddle carrier's posted checklists before walking to the first one.",
      "why": "Each type of equipment has its own items — twistlocks on a top pick, leg sensors on a straddle carrier, fifth wheel on a tractor — and 29 CFR 1917 expects powered equipment inspected before use; the posted list is what makes the walk the same whoever does it."
    },
    {
      "id": "unplug-and-hang-cable",
      "kind": "drag",
      "target": "tractor-charge-cable",
      "title": "Unplug the charge cable and hang it up",
      "cue": "Unlatch the yard tractor's charge connector and carry the cable back to the dispenser's hanger.",
      "why": "Driving off with a charge cable still connected pulls the connector, damages the cable and the dispenser, and can leave live pins on the ground; the machine's interlock should stop it, but the operator's own check is the one that does not depend on a sensor.",
      "drag": {
        "to": "dispenser-hanger",
        "radius": 0.5,
        "missNote": "The cable is not on its hanger — carry it all the way back so nothing is left across the lane."
      }
    },
    {
      "id": "read-state-of-charge",
      "kind": "gauge",
      "target": "soc-display",
      "title": "Read the state of charge against the shift",
      "cue": "Read the tractor's state of charge and commit once it settles in the band the shift plan needs.",
      "why": "A battery-electric tractor that runs short mid-shift stops in a lane where it becomes an obstruction, and matching the charge to the shift's moves before you start is the operator's part of keeping the terminal flowing and the lanes clear.",
      "gauge": {
        "label": "CHARGE %",
        "speed": 0.6,
        "green": [
          0.7,
          1
        ],
        "readout": (t) => `${(t * 100).toFixed(0)}%`,
        "missNote": "Not settled in the band — wait for the display to steady; a low charge goes back on the charger, not out to the ship."
      }
    },
    {
      "id": "find-hv-warning",
      "kind": "find",
      "noHint": true,
      "targets": [
        "hv-warning-lamp"
      ],
      "itemNames": {
        "hv-warning-lamp": "high-voltage system warning on the tractor's dash"
      },
      "itemNotes": {
        "hv-warning-lamp": "The dash shows the high-voltage system warning — an isolation fault the machine has detected; the tractor is tagged and reported, not driven or opened by the operator."
      },
      "title": "Read the dash for any warning",
      "cue": "Switch on and read every warning on the tractor's dash before releasing the brake.",
      "why": "The high-voltage system checks its own insulation and warns when it finds current leaking toward the frame; NFPA 70E keeps anyone who is not qualified away from those conductors, so the operator's job is to read the warning, tag the machine and let a qualified mechanic take it."
    },
    {
      "id": "tag-tractor",
      "kind": "select",
      "target": "defect-tag",
      "title": "Tag the tractor out and take the spare",
      "cue": "Hang the do-not-operate tag on the tractor's wheel and key out; take the spare tractor on the board.",
      "why": "A tagged machine with its key taken cannot be picked up by the next operator in a hurry, and taking the spare keeps your shift's work moving without anyone deciding a warning light is probably nothing."
    },
    {
      "id": "cycle-twistlocks",
      "kind": "turn",
      "target": "twistlock-switch",
      "title": "Cycle the top pick's twistlocks",
      "cue": "Turn the twistlock switch through locked and unlocked and watch every indicator on the spreader follow.",
      "why": "The top pick lifts a container only by its four twistlocks, and the indicators tell the operator each one has turned fully; a twistlock that sticks or an indicator that lies is how a container comes loose in the air, so both are proven before the first lift.",
      "turn": {
        "turns": 1,
        "label": "TWISTLOCKS",
        "readout": (t) => (t < 0.45 ? 'unlocked' : t < 0.9 ? 'turning' : 'locked — 4 of 4')
      }
    },
    {
      "id": "check-hydraulic-line",
      "kind": "select",
      "target": "spreader-hose",
      "title": "Look along the spreader's hydraulic lines",
      "cue": "Look along the hoses to the spreader for wet fittings, rubbing or bulges — look, never run a hand along them.",
      "why": "Electric top picks still move their mast and spreader hydraulically, and a pinhole leak can inject fluid through skin; looking for a wet fitting or a rubbed cover, and reporting it, is the operator's check without putting a hand where the pressure is."
    },
    {
      "id": "walk-straddle-carrier",
      "kind": "sequence",
      "anyOrder": false,
      "targets": [
        "straddle-legs",
        "straddle-tyres",
        "straddle-mirrors"
      ],
      "itemNames": {
        "straddle-legs": "legs and spreader frame",
        "straddle-tyres": "tyres and wheel nuts",
        "straddle-mirrors": "mirrors and cameras"
      },
      "outOfOrderNote": "Walk the carrier from the top down — frame first, then tyres, then the mirrors you will drive by.",
      "title": "Walk the straddle carrier",
      "cue": "Frame and legs, then tyres and wheel nuts, then mirrors and cameras, in that order.",
      "why": "A straddle carrier's operator sits high above a machine that spans a container, and the blind spots around its legs are large; the walk-around finds structural damage and tyre problems before the machine is loaded, and proves the mirrors and cameras that cover those blind spots."
    },
    {
      "id": "find-broken-camera",
      "kind": "find",
      "noHint": true,
      "targets": [
        "cracked-camera"
      ],
      "itemNames": {
        "cracked-camera": "cracked rear leg camera"
      },
      "itemNotes": {
        "cracked-camera": "The rear leg camera's housing is cracked and its image is fogged — the operator would lose sight of the ground behind that leg."
      },
      "title": "Check every camera image",
      "cue": "Look at each camera's image on the cab screen and each camera housing on the legs.",
      "why": "Cameras cover what the mirrors cannot on a machine this tall, and a fogged or cracked one leaves a blind zone exactly where people and other machines pass; a camera fault is a defect that keeps the carrier off the berth until it is fixed."
    },
    {
      "id": "test-pedestrian-alert",
      "kind": "select",
      "target": "alert-sound-button",
      "title": "Test the pedestrian alert sound",
      "cue": "Test the travel alarm and the pedestrian alert: you should hear both from the ground.",
      "why": "Battery-electric machines make little noise at low speed, so the travel alarm and the pedestrian alert are what tell people on foot that a machine is moving; an alert that does not sound makes a quiet machine an unannounced one."
    },
    {
      "id": "hold-brake-test",
      "kind": "hold",
      "target": "brake-test-pedal",
      "seconds": 5,
      "title": "Hold the service brake test",
      "cue": "On the test roll, apply the service brake and hold it until the machine is fully stopped and the regen gauge reads zero.",
      "why": "Electric machines slow partly through regenerative braking, which can mask a weak service brake in normal driving; holding a proper brake test on the test roll proves the friction brakes alone can stop the machine when regen cannot, such as with a full battery.",
      "holdBreakNote": "You let off the brake before the machine was stopped — hold it through the stop so the test proves the service brakes, not regen."
    },
    {
      "id": "write-up-defects",
      "kind": "select",
      "target": "defect-report",
      "title": "Write up every defect",
      "cue": "Write up the tractor's high-voltage warning, the carrier's cracked camera and anything else found, one line each.",
      "why": "The written defect report is how the maintenance shop learns which machines to take first and why, and it protects the operator who refused a machine; a defect told only to the next operator in the canteen is not reported."
    },
    {
      "id": "radio-foreman",
      "kind": "select",
      "target": "terminal-radio",
      "title": "Tell the foreman which machines are ready",
      "cue": "Radio the foreman: spare tractor out, top pick ready, carrier tagged for its camera.",
      "why": "The foreman assigns machines to the vessel gangs, and a shift planned around a machine that is tagged loses time at the berth; telling them straight away lets the plan change before the ship's first move."
    }
  ],

  interrupts: [
    {
      "id": "walker-in-blind-spot",
      "kind": "A lasher walks into the carrier's blind spot",
      "after": "walk-straddle-carrier",
      "delay": 2,
      "seconds": 12,
      "alert": "A lasher has walked in between the straddle carrier's legs to take a shortcut while you are checking its cameras.",
      "cue": "Call them out from between the legs and walk them to the walkway — the cameras wait.",
      "target": "stop-lasher",
      "why": "The area between and behind a straddle carrier's legs is its largest blind spot, and a person cutting through there is invisible from the cab; getting them out now is what keeps a later move from finding them.",
      "missNote": "You kept checking the camera images while the lasher stood between the legs; the carrier's next operator would not have seen them from the cab.",
      "wrongNote": "The lasher first — a person in a blind spot is moved before the inspection goes on."
    },
    {
      "id": "radio-rushes-machine",
      "kind": "The foreman pushes to send the tractor out",
      "after": "hold-brake-test",
      "delay": 2,
      "seconds": 12,
      "alert": "The foreman is on the radio asking you to just send the warning-lit tractor to the berth because the ship is early.",
      "cue": "Answer on the radio: the tractor stays tagged, the spare is going — the write-up waits.",
      "target": "radio-reply",
      "why": "A high-voltage warning is not a judgement call to be made under schedule pressure, and answering clearly — the tag stays, here is the spare — is how the operator keeps the machine off the berth without leaving the foreman guessing.",
      "missNote": "You carried on writing while the call went unanswered; someone else took the tagged tractor's key off the board because nobody had said why it was tagged.",
      "wrongNote": "Answer the foreman first — pressure to use tagged equipment is answered straight away."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, CPTE_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#34373a", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    vehicle(-1.6, -1.6, Math.PI / 2, 2.4, 0x2f6f9f, 0xf0b323);
    vehicle(1.2, -1.7, Math.PI / 2, 2.8, 0x3f7f4a, 0xf0b323, 1.3);
    const sc = group(g, 2.9, 0, -0.6);
    for (const lx of [-0.5, 0.5]) for (const lz of [-0.6, 0.6]) cyl(sc, 0.08, 0.08, 2.6, lx, 1.3, lz, 0xd8a42b, { rough: 0.5, metal: 0.4, seg: 10 });
    box(sc, 1.2, 0.2, 1.4, 0, 2.6, 0, 0xd8a42b, { rough: 0.5, metal: 0.4 });

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
    const PROPS = [{"id":"operator-checklist","name":"operator checklist","kind":"prop"},{"id":"tractor-charge-cable","name":"tractor charge cable","kind":"prop"},{"id":"dispenser-hanger","name":"dispenser hanger","kind":"dest"},{"id":"soc-display","name":"soc display","kind":"meter"},{"id":"hv-warning-lamp","name":"high-voltage system warning on the tractor's dash","kind":"find"},{"id":"defect-tag","name":"defect tag","kind":"prop"},{"id":"twistlock-switch","name":"twistlock switch","kind":"prop"},{"id":"spreader-hose","name":"spreader hose","kind":"prop"},{"id":"straddle-legs","name":"legs and spreader frame","kind":"prop"},{"id":"straddle-tyres","name":"tyres and wheel nuts","kind":"prop"},{"id":"straddle-mirrors","name":"mirrors and cameras","kind":"prop"},{"id":"cracked-camera","name":"cracked rear leg camera","kind":"find"},{"id":"alert-sound-button","name":"alert sound button","kind":"prop"},{"id":"brake-test-pedal","name":"brake test pedal","kind":"prop"},{"id":"defect-report","name":"defect report","kind":"prop"},{"id":"terminal-radio","name":"terminal radio","kind":"prop"},{"id":"stop-lasher","name":"stop lasher","kind":"figure"},{"id":"radio-reply","name":"radio reply","kind":"prop"}];
    const HAZ = [{"id":"drive-with-cable-connected","name":"drive with cable connected?"},{"id":"open-hv-cover","name":"open hv cover?"},{"id":"run-hand-along-hose","name":"run hand along hose?"},{"id":"skip-alert-test","name":"skip alert test?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: CPTE_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: CPTE_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = CPTE_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: CPTE_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: CPTE_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: CPTE_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: CPTE_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, CPTE_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: CPTE_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: CPTE_CSS, w: 0.36 });
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
