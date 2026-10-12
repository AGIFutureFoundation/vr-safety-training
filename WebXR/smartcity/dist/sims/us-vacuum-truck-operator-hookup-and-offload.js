import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Vacuum Truck Operator Hookup and Offload VR — UNIONSIMS, the craft trainings of the Bay
// Restoration Academy wave (docs/consoles/UNIONSIMS.md).
//
// A generic setting: no real plant, street, property, vehicle maker or model
// is shown. The practice is taught from the standards the certification line
// names. The union tags come from tools/unions.json and are a trade
// reference only: the platform has no partnership with any union and this
// station is not any union's programme.

const USVT_ACCENT = 0xf2a23a;
const USVT_CSS = "#f2a23a";

export const SIM_US_VACUUM_TRUCK_OPERATOR_HOOKUP_AND_OFFLOAD = {
  id: "us-vacuum-truck-operator-hookup-and-offload",
  index: "961",
  domain: "Environmental",
  trade: "Vacuum truck operator on a stormwater maintenance crew, setting up, running and offloading a combination vacuum truck at a street trash capture device with a laborer at the opening",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA Training and Education Fund confined space awareness for the laborer at the opening, with the employer's vacuum truck operator training; OSHA 29 CFR 1926.601 motor vehicles on a work site; OSHA 29 CFR 1910.146 permit-required confined spaces (the service is non-entry, worked from the surface); 29 CFR 1910.147 control of hazardous energy for the truck's power take-off before any hand clears the tube; the MUTCD Part 6 for the lane closure; OSHA 29 CFR 1910.95 for hearing protection near the blower; ANSI/ISEA 107 high-visibility garments and 29 CFR 1910.132 PPE; the NPDES stormwater rules, 40 CFR 122.26, and the municipal stormwater permit for where collected debris and water may be decanted",
  name: "Vacuum Truck Operator Hookup and Offload",
  title: simTitle("Vacuum Truck Operator Hookup and Offload VR"),
  accent: USVT_ACCENT,
  accentCss: USVT_CSS,
  tagline: "A combination vacuum truck at a street trash capture device: yesterday's report read, the truck set up past the opening with the lane coned, the outriggers and chocks down, the vacuum relief and the debris-body seals checked, the boom swung clear of the overhead line, the vacuum held in band while the laborer guides the tube, the hose kept out of the walkway, the full-body gauge read, the offload done only at the approved decant site, and the report written",
  parSeconds: 330,
  footprint: 3,
  badge: {"id":"usvt-badge","name":"Steady Suction","note":"The truck set up, the vacuum held in band and the load decanted only where it may go"},
  unions: ["teamsters","liuna"],
  tradeReference: "Trade reference: the craft taught here is the one the tagged unions' members do; the platform has no partnership with them and this station is not their programme.",
  supportLine: "your union's member assistance programme",

  game: system({
    name: "Steady Suction",
    currency: "TAG",
    ranks: ["Yard Hand", "Crew Hand", "Lead Hand", "Certified Hand", "Journey Level"],
    badges: [
      { id: "usvt-clean-read", name: "Clean Read", note: "The key reading committed inside its band first time", test: AWARD.stepClean("read-body-level") },
      { id: "usvt-held", name: "Held Steady", note: "Every watch and hold ran unbroken", test: AWARD.unbroken },
      { id: "usvt-safe", name: "Never a Shortcut", note: "No unsafe action reached for anywhere in the run", test: AWARD.safe },
    ],
    challenges: [
      { id: "usvt-clean", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "usvt-fast", name: "Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "boom-into-service-drop": "You raised the boom without looking up. The service drop is inside the swing — the boom stays below and clear of overhead lines.",
    "operator-enters-opening": "You went to climb down into the opening to clear the tube. The operator never enters a permit space; the tube is cleared from the surface.",
    "drain-at-kerb": "You reached to open the drain valve at the kerb. Collected water and debris go only to the approved decant site.",
    "skip-outriggers": "You went to swing the boom with the outriggers up. Set the chocks and outriggers first."
  },

  steps: [
    {
      "id": "read-last-inspection",
      "kind": "select",
      "target": "inspection-record",
      "title": "Read yesterday's truck inspection report",
      "cue": "Read the last inspection report for the truck, its vacuum system and its boom, and any repair sign-off.",
      "why": "The operator reviews the last written inspection report before operating, because a leaking debris-body seal or a boom hydraulic weep written up yesterday is either signed off as repaired or still there; starting without reading it means taking an unknown truck to a live street."
    },
    {
      "id": "cone-the-lane",
      "kind": "sequence",
      "targets": [
        "advance-sign",
        "taper-cones",
        "truck-cones"
      ],
      "itemNames": {
        "advance-sign": "advance warning sign",
        "taper-cones": "lane taper cones",
        "truck-cones": "cones round the truck"
      },
      "title": "Set the sign, the taper, then the truck's cones",
      "cue": "Place the advance warning sign up the lane first, then the taper, then cone round the truck and the hose run.",
      "outOfOrderNote": "Out of order — the advance sign goes up first, then the taper, then the truck's cones; a taper with no sign ahead surprises drivers.",
      "why": "MUTCD Part 6 sets up temporary traffic control from the approaching driver's side first, because a crew placing the taper with no sign ahead is itself the unexpected obstruction; the truck's own cones then keep traffic off the hose and the laborer at the opening."
    },
    {
      "id": "chock-and-outriggers",
      "kind": "sequence",
      "targets": [
        "wheel-chocks",
        "outrigger-pads"
      ],
      "itemNames": {
        "wheel-chocks": "wheel chocks",
        "outrigger-pads": "outrigger pads"
      },
      "title": "Chock the wheels and set the outriggers on pads",
      "cue": "Chock the rear wheels, then lower each outrigger onto its pad before the boom leaves its cradle.",
      "outOfOrderNote": "Out of order — chock the wheels before the outriggers take the truck's weight.",
      "why": "A boom loaded with a full tube of water and debris shifts the truck's weight toward the opening, and 29 CFR 1926.601 expects vehicles parked on a work site to be secured against movement; pads spread the outrigger load so it does not punch through a gutter edge or a soft verge."
    },
    {
      "id": "check-relief-valve",
      "kind": "turn",
      "target": "vacuum-relief-valve",
      "title": "Check the vacuum relief valve moves freely",
      "cue": "Work the vacuum relief valve through its travel and confirm it returns and seats.",
      "why": "The relief valve is what lets air into the system when the tube is blocked, so the vacuum cannot pull the debris body past its rating; a relief that sticks is found at the truck, not when a plug of leaves seals the tube over the sump.",
      "turn": {
        "turns": 0.8,
        "label": "RELIEF VALVE",
        "readout": (t) => (t < 0.4 ? 'closed' : t < 0.9 ? 'travelling' : 'returned and seated')
      }
    },
    {
      "id": "check-body-seals",
      "kind": "select",
      "target": "rear-door-seal",
      "title": "Look at the debris-body door seal and locks",
      "cue": "Look round the rear door seal for cuts and debris, and confirm every door lock is closed before the pump starts.",
      "why": "A rear door that is not locked and sealed can let the loaded body leak water and fine sediment onto the street, which is exactly what the capture device exists to keep out of the storm drain, and a door that lets go under load releases its contents at once."
    },
    {
      "id": "hearing-protection",
      "kind": "select",
      "target": "ear-defenders",
      "title": "Put on hearing protection before the blower starts",
      "cue": "Put on the ear defenders and hand a set to the laborer at the opening before starting the vacuum blower.",
      "why": "The positive-displacement blower on a vacuum truck is loud enough at the controls to call for hearing protection under 29 CFR 1910.95, and the laborer beside the opening is closer to the tube inlet noise than the operator; both put it on before the noise starts."
    },
    {
      "id": "find-overhead-line",
      "kind": "find",
      "noHint": true,
      "targets": [
        "overhead-service-drop"
      ],
      "itemNames": {
        "overhead-service-drop": "overhead service drop over the boom's swing"
      },
      "itemNotes": {
        "overhead-service-drop": "A service drop crosses the street above the boom's swing path — the boom stays below and clear of it."
      },
      "title": "Look up along the boom's swing before raising it",
      "cue": "Look up along the whole swing path of the boom for overhead lines, branches and signs before the boom leaves the cradle.",
      "why": "A boom raised into an overhead line energises the whole truck and anyone touching it or its hose, and the employer's procedure keeps the boom well clear of energised lines; the look up comes first because the operator's eyes are on the opening once suction starts."
    },
    {
      "id": "swing-boom-clear",
      "kind": "hold",
      "target": "boom-control",
      "seconds": 5,
      "title": "Swing the boom over the opening, below the line",
      "cue": "Hold the swing control at a slow rate, keeping the boom low and under the service drop until the tube is over the opening.",
      "why": "A slow, low swing keeps the tube's weight under control and the boom well clear of the overhead line; a fast swing makes the dangling tube pendulum toward the laborer standing at the opening.",
      "holdBreakNote": "You let go mid-swing — the tube swung on. Hold the control steady until the tube is over the opening."
    },
    {
      "id": "hold-vacuum-band",
      "kind": "track",
      "target": "vacuum-gauge",
      "seconds": 7,
      "title": "Hold the vacuum in band while the laborer guides the tube",
      "cue": "Keep the vacuum inside the band on the gauge while the laborer guides the tube over the sump, easing off when it climbs.",
      "why": "Too much vacuum slams the tube onto the device's screen and can collapse a hose or draw the relief, and too little leaves water and fines behind; holding the band keeps the laborer's guide job steady and the device's screen undamaged.",
      "track": {
        "start": 0.45,
        "green": [
          0.36,
          0.66
        ],
        "rise": 0.3,
        "fall": 0.27,
        "drift": 0.13,
        "label": "VACUUM",
        "readout": (v) => (v < 0.36 ? 'low — debris left' : v > 0.66 ? 'high — ease off' : 'in band')
      },
      "holdBreakNote": "The vacuum left the band — ease off before the tube grabs the screen or the relief blows."
    },
    {
      "id": "route-hose-clear",
      "kind": "drag",
      "target": "suction-hose",
      "title": "Lay the spare hose along the kerb, out of the walkway",
      "cue": "Carry the spare hose section along the kerb line to its rack, out of the pedestrian path.",
      "why": "A hose left across the sidewalk is a trip hazard to people walking past a street job, and a hose run inside the coned area stays where traffic cannot drive over it and where the crew can see it.",
      "drag": {
        "to": "hose-rack",
        "radius": 0.5,
        "missNote": "Not on the rack — carry the hose the whole way so nothing lies across the walkway."
      }
    },
    {
      "id": "read-body-level",
      "kind": "gauge",
      "target": "body-level-gauge",
      "title": "Read the debris body's fill level",
      "cue": "Watch the body level indicator and commit when it settles in the band that leaves room below the shut-off.",
      "why": "A debris body filled past its shut-off float carries water into the blower and ruins it, and an overfull body also puts the truck over its axle weights for the drive to the decant site; the operator stops loading in the band, not at the top.",
      "gauge": {
        "label": "BODY LEVEL",
        "speed": 0.6,
        "green": [
          0.55,
          0.8
        ],
        "readout": (t) => `${(t * 100).toFixed(0)}% full`,
        "missNote": "Not in the band — too high risks carry-over into the blower; stop in the band."
      }
    },
    {
      "id": "decant-approved-site",
      "kind": "select",
      "target": "decant-site-plan",
      "title": "Offload only at the approved decant site",
      "cue": "Check the plan's decant site and drive the load there — never open the door or drain water at the street or into another inlet.",
      "why": "Collected stormwater debris and water are discharged only where the stormwater permit and the facility allow, because draining the tank at the kerb puts the trash and sediment straight back into the storm drain the crew has just cleaned; the plan names the site."
    },
    {
      "id": "write-own-report",
      "kind": "select",
      "target": "operator-report-card",
      "title": "Write your own inspection report",
      "cue": "Write today's defects — anything seen on the seal, the boom or the relief — and sign the report.",
      "why": "A written report of defects that affect safe operation at the end of the day is the only way tomorrow's operator and the shop learn about a weeping seal or a sticky relief valve found today."
    }
  ],

  interrupts: [
    {
      "id": "cyclist-in-lane",
      "kind": "A cyclist rides into the coned lane",
      "after": "swing-boom-clear",
      "delay": 2,
      "seconds": 12,
      "alert": "A cyclist has ridden past the taper into the coned lane and is heading for the hose run.",
      "cue": "Stop the boom and call the cyclist clear round the cones before anything else — the swing can wait.",
      "target": "stop-cyclist",
      "why": "A person inside the work zone near a moving boom and a live hose is answered first; the swing restarts only once the lane is clear again.",
      "missNote": "You kept swinging while the cyclist rode through the hose run; the boom moved with a person under its path.",
      "wrongNote": "The cyclist first — a person in the lane is answered before the boom moves again."
    },
    {
      "id": "tube-plugs",
      "kind": "The tube plugs and the vacuum climbs",
      "after": "hold-vacuum-band",
      "delay": 2,
      "seconds": 12,
      "alert": "A mat of leaves has plugged the tube and the vacuum is climbing toward the relief.",
      "cue": "Open the vacuum relief at the truck to break the vacuum before the laborer touches the tube.",
      "target": "relief-break-lever",
      "why": "A plugged tube under full vacuum grips whatever is at its mouth; breaking the vacuum at the truck before anyone reaches the tube is the only safe way to clear it.",
      "missNote": "The vacuum stayed on the plugged tube; the laborer reached for a tube still gripping under full suction.",
      "wrongNote": "Break the vacuum first — nobody touches a plugged tube while it is under suction."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, USVT_ACCENT);
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
    const vt = vehicle(-0.9, -1.5, Math.PI / 2, 2.8, 0xe8e3d6, 0xf2a23a, 1.2);
    const tank = cyl(vt, 0.5, 0.5, 1.5, 0, 1.2, -0.45, 0xe8e3d6, { rough: 0.45, metal: 0.4, seg: 18 }); tank.rotation.x = Math.PI / 2;
    const boom = cyl(g, 0.09, 0.09, 1.9, 0.9, 1.9, -1.5, 0x2b2f33, { rough: 0.5, seg: 10 }); boom.rotation.z = Math.PI / 2.6;
    cyl(g, 0.34, 0.34, 0.05, 1.9, 0.07, -1.2, 0x3a3f44, { rough: 0.8, metal: 0.5, seg: 18 });
    box(g, 0.9, 0.6, 0.6, 2.9, 0.3, -1.9, 0x5b646c, { rough: 0.6 });

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
    const PROPS = [{"id":"inspection-record","name":"inspection record","kind":"prop"},{"id":"advance-sign","name":"advance warning sign","kind":"prop"},{"id":"taper-cones","name":"lane taper cones","kind":"prop"},{"id":"truck-cones","name":"cones round the truck","kind":"prop"},{"id":"wheel-chocks","name":"wheel chocks","kind":"prop"},{"id":"outrigger-pads","name":"outrigger pads","kind":"prop"},{"id":"vacuum-relief-valve","name":"vacuum relief valve","kind":"prop"},{"id":"rear-door-seal","name":"rear door seal","kind":"prop"},{"id":"ear-defenders","name":"ear defenders","kind":"prop"},{"id":"overhead-service-drop","name":"overhead service drop over the boom's swing","kind":"find"},{"id":"boom-control","name":"boom control","kind":"prop"},{"id":"vacuum-gauge","name":"vacuum gauge","kind":"meter"},{"id":"suction-hose","name":"suction hose","kind":"prop"},{"id":"hose-rack","name":"hose rack","kind":"dest"},{"id":"body-level-gauge","name":"body level gauge","kind":"meter"},{"id":"decant-site-plan","name":"decant site plan","kind":"prop"},{"id":"operator-report-card","name":"operator report card","kind":"prop"},{"id":"stop-cyclist","name":"stop cyclist","kind":"figure"},{"id":"relief-break-lever","name":"relief break lever","kind":"prop"}];
    const HAZ = [{"id":"boom-into-service-drop","name":"boom into service drop?"},{"id":"operator-enters-opening","name":"operator enters opening?"},{"id":"drain-at-kerb","name":"drain at kerb?"},{"id":"skip-outriggers","name":"skip outriggers?"}];
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
        obj = instrument(post, 0, 0.93, 0, { ry: Math.atan2(-x, -z), idle: "----", color: USVT_ACCENT, w: 0.12, d: 0.18 });
        bodyMesh = null;
        holoTag(post, p.name, 0, 1.2, 0, { css: USVT_CSS, w: 0.34 });
      } else if (/permit|log|order|checklist|board|sign|plan|record|dvir|card|label/.test(p.id)) {
        obj = holoPanel(g, 0.5, 0.34, x, 1.3, z, (cx, w, h) => {
          cx.fillStyle = "#101a22"; cx.fillRect(0, 0, w, h); cx.fillStyle = USVT_CSS; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#eef6ff"; cx.fillText(p.name.toUpperCase().slice(0, 30), w * 0.06, h * 0.2);
          cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfe3f0";
          ["Read before work starts", "Initial each line", "Report every defect"].forEach((l, k) => cx.fillText(l, w * 0.06, h * (0.45 + k * 0.17)));
        }, { ry: Math.atan2(-x, -z), accent: USVT_ACCENT });
        bodyMesh = box(obj, 0.04, 0.9, 0.04, 0, -0.75, -0.02, propCols[i % 8], { rough: 0.5, metal: 0.5 });
      } else if (/lock|tag/.test(p.id)) {
        const post = group(g, x, 0, z);
        bodyMesh = box(post, 0.3, 0.5, 0.2, 0, 0.9, 0, propCols[i % 8], { rough: 0.5, metal: 0.4 });
        cyl(post, 0.03, 0.03, 0.65, 0, 0.33, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = lockTag(post, 0, 0.9, 0.12, { lines: ["LOCKED", "OUT"] });
        holoTag(post, p.name, 0, 1.3, 0, { css: USVT_CSS, w: 0.34 });
      } else if (/lamp|light|indicator|beacon/.test(p.id)) {
        const post = group(g, x, 0, z);
        cyl(post, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        obj = ball(post, 0.06, 0, 1.05, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.2 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.3, 0, { css: USVT_CSS, w: 0.36 });
      } else if (/cable|hose|connector|nozzle|plug|line|latch|clamp|clip/.test(p.id)) {
        const post = group(g, x, 0, z);
        box(post, 0.36, 0.7, 0.24, 0, 0.35, 0, propCols[i % 8], { rough: 0.55, metal: 0.3 });
        obj = cyl(post, 0.035, 0.035, 0.6, 0.08, 0.95, 0, p.kind === "find" ? 0xf07a1f : 0x1f2326, { rough: 0.5, seg: 10 });
        obj.rotation.z = 0.5;
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.35, 0, { css: USVT_CSS, w: 0.36 });
      } else if (p.kind === "dest") {
        obj = box(g, 0.6, 0.02, 0.6, x, 0.075, z, USVT_ACCENT, { rough: 0.6, opacity: 0.55, transparent: true });
        bodyMesh = obj;
        holoTag(g, p.name, x, 0.45, z, { css: USVT_CSS, w: 0.34 });
      } else {
        const post = group(g, x, 0, z);
        obj = box(post, 0.34, 0.34, 0.26, 0, 0.72, 0, propCols[i % 8], { rough: 0.5, metal: 0.35 });
        cyl(post, 0.03, 0.03, 0.55, 0, 0.28, 0, 0x6b7580, { rough: 0.5, metal: 0.6, seg: 8 });
        bodyMesh = obj;
        holoTag(post, p.name, 0, 1.12, 0, { css: USVT_CSS, w: 0.36 });
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
