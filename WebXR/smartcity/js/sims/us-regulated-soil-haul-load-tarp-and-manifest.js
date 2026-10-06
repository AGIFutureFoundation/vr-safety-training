import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Regulated Soil Haul: Load, Tarp and Manifest VR — UNIONSIMS, the craft trainings of the Bay
// Restoration Academy wave (docs/consoles/UNIONSIMS.md).
//
// A generic setting: no real plant, street, property, vehicle maker or model
// is shown. The practice is taught from the standards the certification line
// names. The union tags come from tools/unions.json and are a trade
// reference only: the platform has no partnership with any union and this
// station is not any union's programme.

const USRH_ACCENT = 0xc9a13b;
const USRH_CSS = "#c9a13b";

export const SIM_US_REGULATED_SOIL_HAUL_LOAD_TARP_AND_MANIFEST = {
  id: "us-regulated-soil-haul-load-tarp-and-manifest",
  index: "962",
  domain: "Environmental",
  trade: "Teamsters driver hauling regulated soil and debris from a cleanup or source-control site, with a LIUNA laborer at the load-out and the decontamination pad",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA hazmat laborers under OSHA HAZWOPER (29 CFR 1910.120) at the load-out and the decontamination pad; PHMSA 49 CFR 172 hazmat employee training, shipping papers and placards where the load is a regulated hazardous material; EPA RCRA 40 CFR 262 for the hazardous-waste manifest; OSHA 29 CFR 1926.601 motor vehicles on a work site; 29 CFR 1910.132 PPE; the NPDES stormwater rules, 40 CFR 122.26, for track-out reaching a storm drain; and the site's own work plan for the load-out route, the decon pad and the receiving facility",
  name: "Regulated Soil Haul: Load, Tarp and Manifest",
  title: simTitle("Regulated Soil Haul: Load, Tarp and Manifest VR"),
  accent: USRH_ACCENT,
  accentCss: USRH_CSS,
  tagline: "A regulated-soil load-out: the work plan's route and receiving facility read, the truck staged on the clean side, the bed liner checked, the load watched in from outside the swing, the tarp pulled and strapped, the tyres and mudflaps brushed on the decon pad, the manifest checked line by line and signed, placards matched, the track-out swept, and the haul logged",
  parSeconds: 330,
  footprint: 3,
  badge: {"id":"usrh-badge","name":"Clean Off the Pad","note":"Loaded, covered, decontaminated and papered before the wheels touched the street"},
  unions: ["teamsters","liuna"],
  tradeReference: "Trade reference: the craft taught here is the one the tagged unions' members do; the platform has no partnership with them and this station is not their programme.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Clean Off the Pad",
    currency: "TAG",
    ranks: ["Yard Hand", "Crew Hand", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "usrh-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("watch-load-height") },
      { id: "usrh-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "usrh-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "usrh-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "usrh-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "drive-into-exclusion-zone": "You went to back the truck across the load-out line. The truck stays on the clean side; the bucket comes to it.",
    "climb-onto-load": "You went to climb onto the load to spread the tarp. Pull the tarp from the ground with the crank.",
    "sign-blank-manifest": "You reached to sign the manifest before checking its lines. Check the facility and description first, then sign.",
    "hose-soil-into-gutter": "You went to hose the exit apron into the gutter. Sweep track-out back onto the pad."
  },

  steps: [
    {
      "id": "read-haul-plan",
      "kind": "select",
      "target": "haul-plan",
      "title": "Read the work plan's haul page",
      "cue": "Read the haul page: the load-out route on site, the decon pad, the approved receiving facility and the paperwork the load needs.",
      "why": "The work plan names the only facility that may receive the soil and the route out of the exclusion zone, and hauling regulated soil to the wrong facility is a violation that follows the load; the driver reads it before the truck is staged, not at the gate."
    },
    {
      "id": "stage-clean-side",
      "kind": "drag",
      "target": "truck-position-marker",
      "title": "Stage the truck on the clean side of the load-out line",
      "cue": "Move the staging marker to the marked position on the clean side, where the excavator reaches the bed without the truck entering the cut.",
      "why": "Keeping the truck on the clean side of the line means the tyres never touch contaminated ground, so the decon pad has only splash to deal with; 29 CFR 1910.120 site control keeps vehicles out of the exclusion zone unless the plan allows it.",
      "drag": {
        "to": "clean-side-bay",
        "radius": 0.5,
        "missNote": "Not in the bay — the truck must sit fully on the clean side of the line."
      }
    },
    {
      "id": "check-bed-liner",
      "kind": "find",
      "noHint": true,
      "targets": [
        "torn-liner-corner"
      ],
      "itemNames": {
        "torn-liner-corner": "torn corner of the bed liner"
      },
      "itemNotes": {
        "torn-liner-corner": "The liner is torn at the tailgate corner — wet soil would weep out onto the road. Replace it before loading."
      },
      "title": "Check the bed liner and tailgate seal",
      "cue": "Look along the bed liner and the tailgate seal for tears or gaps before anything is loaded.",
      "why": "Wet regulated soil weeps through a torn liner or an open tailgate seal and leaves a trail on every road to the facility; finding the tear before loading is a new liner, finding it after is a spill report."
    },
    {
      "id": "stand-clear-of-swing",
      "kind": "hold",
      "target": "driver-safe-spot",
      "seconds": 5,
      "title": "Stand at the safe spot while the bucket loads",
      "cue": "Out of the cab and outside the swing, hold at the marked safe spot in the operator's view until loading stops.",
      "why": "29 CFR 1926.601 keeps drivers clear of a bucket passing over the cab unless the cab is protected, and standing at the marked spot in the operator's view means the operator always knows where the driver is while the loaded bucket swings.",
      "holdBreakNote": "You stepped off the safe spot while the bucket was still swinging — stay put until loading stops."
    },
    {
      "id": "watch-load-height",
      "kind": "gauge",
      "target": "load-height-gauge",
      "title": "Watch the load height against the bed rails",
      "cue": "Commit when the load settles below the rail line with room for the tarp to lie flat.",
      "why": "A load heaped above the rails cannot be covered properly and sheds soil on every bump, and an overloaded truck breaks its axle weights; stopping in the band leaves a load the tarp can close over and a truck inside its weights.",
      "gauge": {
        "label": "LOAD HEIGHT",
        "speed": 0.6,
        "green": [
          0.55,
          0.8
        ],
        "readout": (t) => `${(t * 100).toFixed(0)}% of rail`,
        "missNote": "Not in the band — heaped above the rails, the tarp cannot close; stop in the band."
      }
    },
    {
      "id": "pull-and-strap-tarp",
      "kind": "sequence",
      "targets": [
        "tarp-crank",
        "front-tarp-strap",
        "rear-tarp-strap"
      ],
      "itemNames": {
        "tarp-crank": "tarp crank",
        "front-tarp-strap": "front tarp strap",
        "rear-tarp-strap": "rear tarp strap"
      },
      "title": "Pull the tarp, then strap it front and rear",
      "cue": "Crank the tarp fully over the load from the ground, then fasten the front strap and the rear strap.",
      "outOfOrderNote": "Out of order — the tarp is cranked fully over before either strap is fastened, or the straps pin it half-open.",
      "why": "A regulated load is covered so nothing leaves the truck on the road, and a tarp pulled from the ground with the crank keeps the driver off the load itself; strapping both ends stops the wind lifting it on the freeway."
    },
    {
      "id": "brush-tyres-on-pad",
      "kind": "track",
      "target": "decon-brush-meter",
      "seconds": 6,
      "title": "Brush the tyres and mudflaps on the decon pad",
      "cue": "With the truck on the decon pad, keep the brush pressure in band while the laborer works each tyre and mudflap.",
      "why": "Soil on the tyres and mudflaps is the load leaving the site by another route, and the decon pad exists so that none of it reaches the public road; steady brushing on the pad, with the water caught there, is what the plan's track-out control depends on.",
      "track": {
        "start": 0.45,
        "green": [
          0.36,
          0.66
        ],
        "rise": 0.3,
        "fall": 0.27,
        "drift": 0.13,
        "label": "BRUSH",
        "readout": (v) => (v < 0.36 ? 'too light — soil left' : v > 0.66 ? 'splashing' : 'clean pass')
      },
      "holdBreakNote": "The brushing left the band — go back over the tyre so nothing is carried off the pad."
    },
    {
      "id": "check-manifest-lines",
      "kind": "select",
      "target": "manifest-form",
      "title": "Check the manifest line by line, then sign",
      "cue": "Check the generator, the receiving facility, the description and the quantity against the plan, then sign as transporter.",
      "why": "Where the soil is a hazardous waste, EPA 40 CFR 262 has the manifest travel with it from the generator to the receiving facility, and the transporter's signature says the load and the paper match; signing a manifest that names the wrong facility makes the driver part of the error."
    },
    {
      "id": "match-placards",
      "kind": "select",
      "target": "placard-board",
      "title": "Match the placards to the shipping paper",
      "cue": "Confirm the placards on the truck match the hazard class on the shipping paper, or that none are required for this load.",
      "why": "PHMSA 49 CFR 172 placards tell a first responder what is in the truck before anyone gets close, and a placard that does not match the paper sends a responder the wrong message at the worst moment; the driver checks the match before leaving."
    },
    {
      "id": "sweep-track-out",
      "kind": "drag",
      "target": "street-broom",
      "title": "Sweep any track-out at the site exit",
      "cue": "Sweep the soil at the site exit back onto the pad before the next truck, never into the gutter.",
      "why": "Any soil that does reach the exit apron washes into the nearest storm drain in the next rain, which is the pathway source-control work exists to cut; sweeping it back onto the pad closes that route.",
      "drag": {
        "to": "decon-pad-edge",
        "radius": 0.5,
        "missNote": "Not back on the pad — sweep the soil all the way onto the pad, never toward the gutter."
      }
    },
    {
      "id": "radio-departure",
      "kind": "select",
      "target": "dispatch-radio",
      "title": "Call the departure to the site and the facility",
      "cue": "Radio the load number, the time and the facility to the site lead, and confirm the facility expects the load.",
      "why": "The site's haul log has to account for every regulated load that left, and a receiving facility that does not expect a load may turn it away, leaving a covered regulated load parked on a street; the call closes both gaps."
    },
    {
      "id": "log-the-haul",
      "kind": "select",
      "target": "haul-log",
      "title": "Log the haul",
      "cue": "Record the load number, the manifest number, the facility and the time out.",
      "why": "The haul log ties every manifest to a load and a time, which is how the site shows that everything that left arrived where the plan said; a missing line is a load the site cannot account for."
    }
  ],

  interrupts: [
    {
      "id": "worker-walks-behind",
      "kind": "A laborer walks behind the truck",
      "after": "stand-clear-of-swing",
      "delay": 2,
      "seconds": 12,
      "alert": "A laborer has walked behind the truck toward the tailgate while the bucket is still swinging.",
      "cue": "Call the laborer back to the safe spot and signal the operator to stop the swing.",
      "target": "stop-laborer",
      "why": "A person behind the truck and under the bucket's path is answered before loading goes on; the operator cannot see the tailgate side from the cab.",
      "missNote": "You kept holding your spot while the laborer stood under the swing; the next bucket passed over a person.",
      "wrongNote": "The laborer first — a person under the swing is answered before loading goes on."
    },
    {
      "id": "pad-sump-full",
      "kind": "The decon pad's sump alarm lights",
      "after": "brush-tyres-on-pad",
      "delay": 2,
      "seconds": 12,
      "alert": "The decon pad's sump high-level lamp has lit — the wash water is about to overtop the pad.",
      "cue": "Stop the wash and call for the sump to be pumped to its holding tank before brushing again.",
      "target": "sump-alarm-lamp",
      "why": "Wash water from the pad carries the same soil the decon is removing, and a sump that overtops sends it off the pad; stopping the wash until it is pumped keeps it contained.",
      "missNote": "You kept brushing and the pad overtopped; wash water ran off the pad toward the street.",
      "wrongNote": "The sump first — wash water stays on the pad, so stop and pump it."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, USRH_ACCENT);
    const floor = box(g, 7.4, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.88 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3a3630", base2: "#27292c", seam: "rgba(0,0,0,0.32)" }), { repeat: 5, px: 512 }), { rough: 0.88, metal: 0.02, color: 0xa0a6ac });
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
    const dt0 = vehicle(-0.6, -1.5, Math.PI / 2, 3.0, 0xdfe4e8, 0x8c7a3a, 1.2);
    box(dt0, 1.05, 0.6, 1.6, 0, 1.0, -0.55, 0x8c7a3a, { rough: 0.6, metal: 0.3 });
    box(dt0, 1.07, 0.03, 1.62, 0, 1.32, -0.55, 0x2f5f3f, { rough: 0.9 });
    box(g, 1.6, 0.5, 1.2, 2.5, 0.25, -1.6, 0x6b5a45, { rough: 0.95 });
    box(g, 1.7, 0.02, 1.3, 2.5, 0.51, -1.6, 0x1c1e20, { rough: 0.8, opacity: 0.85, transparent: true });

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
    const PROPS = [{"id":"haul-plan","name":"haul plan","kind":"prop"},{"id":"truck-position-marker","name":"truck position marker","kind":"prop"},{"id":"clean-side-bay","name":"clean side bay","kind":"dest"},{"id":"torn-liner-corner","name":"torn corner of the bed liner","kind":"find"},{"id":"driver-safe-spot","name":"driver safe spot","kind":"prop"},{"id":"load-height-gauge","name":"load height gauge","kind":"meter"},{"id":"tarp-crank","name":"tarp crank","kind":"prop"},{"id":"front-tarp-strap","name":"front tarp strap","kind":"prop"},{"id":"rear-tarp-strap","name":"rear tarp strap","kind":"prop"},{"id":"decon-brush-meter","name":"decon brush meter","kind":"meter"},{"id":"manifest-form","name":"manifest form","kind":"prop"},{"id":"placard-board","name":"placard board","kind":"prop"},{"id":"street-broom","name":"street broom","kind":"prop"},{"id":"decon-pad-edge","name":"decon pad edge","kind":"dest"},{"id":"dispatch-radio","name":"dispatch radio","kind":"prop"},{"id":"haul-log","name":"haul log","kind":"prop"},{"id":"stop-laborer","name":"stop laborer","kind":"figure"},{"id":"sump-alarm-lamp","name":"sump alarm lamp","kind":"prop"}];
    const HAZ = [{"id":"drive-into-exclusion-zone","name":"drive into exclusion zone?"},{"id":"climb-onto-load","name":"climb onto load?"},{"id":"sign-blank-manifest","name":"sign blank manifest?"},{"id":"hose-soil-into-gutter","name":"hose soil into gutter?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: USRH_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: USRH_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = USRH_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: USRH_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: USRH_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: USRH_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: USRH_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, USRH_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: USRH_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: USRH_CSS, w: 0.36 });
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
