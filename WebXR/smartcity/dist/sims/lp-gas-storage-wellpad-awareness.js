import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  pavingFace, gratingFace, reg,
} from "../citykit.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Gas Storage Well Pad Safety — its own gamified system: Pad Discipline.
//
// LA-PROGRAMME (docs/consoles/LA-PROGRAMME.md): a contractor crew's day on a natural gas storage well pad while the
// operator's people run the wells. The pad is generic and procedural: no well count, depth, pressure, product
// specification or real site's layout is stated; those are the operator's permit and procedures. Taught from OSHA process
// safety management, lockout, hot work and PPE, and NFPA 51B. ?fault=flange-weep moves the weeping flange so the right
// answer is read, not remembered.

const LPWP_ACCENT = 0xf2b84b;

export const SIM_LP_GAS_STORAGE_WELLPAD_AWARENESS = {
  id: "lp-gas-storage-wellpad-awareness",
  index: "lp-2",
  domain: "Energy",
  trade: "Gas storage contractor crew, well pad safety — USW",
  category: "Energy & Power",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "USW health and safety training as a body; OSHA 29 CFR 1910.119 process safety management of highly hazardous chemicals, 29 CFR 1910.147 control of hazardous energy, 29 CFR 1910.252 welding and cutting and 29 CFR 1910.132 personal protective equipment; NFPA 51B fire prevention during hot work; the operator's pad work permit and isolation list",
  name: "Gas Storage Well Pad Safety",
  title: simTitle("Gas Storage Well Pad Safety"),
  tagline: "A contractor crew on a natural gas storage well pad while the operator runs the wells: the pad permit read, the gas monitor bump-tested, flame-resistant clothing on, every ignition source left at the gate, a weeping flange reported rather than tightened, hot work only inside a tested boundary, and a personal lock on the group box before anyone touches isolated pipe",
  accent: LPWP_ACCENT,
  accentCss: "#f2b84b",
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "pad-discipline", name: "Pad Discipline", note: "Read the pad permit, left the ignition sources at the gate, tested before hot work and locked on before touching isolated pipe" },

  game: system({
    name: "Pad Discipline",
    currency: "LEL",
    ranks: ["Visitor", "Pad Inducted", "Contractor Hand", "Contractor Lead", "Pad Discipline Certified"],
    badges: [
      { id: "permit-first-pad", name: "Permit First", note: "Read the pad permit before driving past the gate", test: AWARD.stepClean("pad-permit") },
      { id: "no-ignition", name: "Nothing Lit", note: "Never carried an ignition source onto the pad", test: AWARD.safe },
      { id: "steady-test", name: "Steady Test", note: "Held the continuous gas test near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-pad", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-pad", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your USW local's member assistance programme, or the site's employee assistance line if a release or a near miss is what stayed with you",

  faults: [{ id: "flange-weep", label: "Flange weep: CHECK", step: "find-weep", target: "tight-flange", note: "The flange that was tight yesterday is the one weeping now. Report the weeping flange, not yesterday's.", from: "weeping-flange", cue: "Find the flange that is weeping gas." }],

  hazards: {
    "phone-on-pad-hazard": "That carries a phone and a lighter past the ignition-control sign. On a gas pad an ignition source is anything that can spark or get hot, and the gate is where they are left because a release does not give anyone time to walk back.",
    "tighten-live-hazard": "That puts a wrench on a weeping flange that is still under pressure. Tightening a live joint can crack a gasket or a bolt the rest of the way, and the flange belongs to the operator, who isolates it before anyone touches it.",
    "skip-gas-test-hazard": "That strikes the arc without a gas test because the pad smelt clean. Natural gas can be present well below the level anyone smells it near a wellhead, and the test is what the hot-work permit is written on.",
    "cut-lock-hazard": "That cuts another worker's lock off the group box to finish early. A personal lock is that person's own control over the energy they are exposed to, and it comes off only by them or by the written procedure for an absent worker.",
  },

  lateNotes: {
    "pad-permit-board": "The pad permit is read at the gate every shift, because which wells are live and where hot work is allowed change with the operator's work.",
    "fr-coveralls": "Flame-resistant coveralls are worn zipped, sleeves down, because a flash fire is over in a moment and ordinary clothing keeps burning after it.",
  },

  interrupts: [
    { id: "lel-alarm", kind: "Gas alarm", after: "gas-test-hold", delay: 3, seconds: 11, alert: "The gas monitor at the hot-work boundary has gone into alarm while the welder is setting up.", cue: "Call stop on the hot work now.", target: "stop-hot-work", why: "A combustible gas alarm inside a hot-work boundary means the condition the permit was written on no longer exists, and stopping the work before the arc is struck removes the one thing the gas needs to become a fire, whatever turns out to be the source.", missNote: "The hot work carried on with the gas monitor in alarm. The permit ends the moment the test fails.", wrongNote: "Not that — the gas alarm is answered by stopping the hot work." },
    { id: "wind-shift", kind: "Wind shift", after: "gas-test-track", delay: 3, seconds: 11, alert: "The wind has swung round and is now blowing from the wellheads straight across the crew's work area.", cue: "Move the crew to the crosswind marker.", target: "crosswind-marker", why: "A muster point is only upwind while the wind holds, and when it swings the crew moves to the crosswind side so that anything leaking from the wellheads is carried past them rather than through the place they would gather.", missNote: "The crew stayed downwind of the wellheads after the shift. The wind decides where upwind is, not the map.", wrongNote: "That isn't it — the wind shift is answered at the crosswind marker." },
  ],

  steps: [
    { id: "pad-permit", kind: "select", target: "pad-permit-board", title: "Read the pad permit", cue: "Read the pad work permit at the gate: live wells, hot-work areas, the muster point and who the operator's contact is.", why: "The operator's permit is the only document that says which wellheads are live today, where hot work is allowed and who can stop the job, and a contractor who has not read it is making decisions next to pressurised gas on information that may be a shift out of date." },
    { id: "bump-lel", kind: "gauge", target: "lel-meter", title: "Bump-test the gas monitor", cue: "Bump-test your combustible gas monitor and commit only once it reads in the green.", why: "A combustible gas monitor that has not been bump-tested can sit at zero in air that is not clean, and on a well pad that monitor is the crew's only reliable sense for a gas that disperses faster than anyone can smell it, so it is proven every day before it is trusted.", gauge: { label: "GAS MONITOR", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "bump passed" : "check sensor"), missNote: "Not in the green — return the monitor; nobody goes onto the pad with an unproven meter." } },
    { id: "ppe-pad", kind: "sequence", anyOrder: true, targets: ["fr-coveralls", "pad-glasses", "pad-hearing"], itemNames: { "fr-coveralls": "flame-resistant coveralls", "pad-glasses": "hard hat and safety glasses", "pad-hearing": "hearing protection" }, title: "Dress for the pad", cue: "Flame-resistant coveralls, hard hat and glasses, hearing protection.", why: "Flame-resistant coveralls are there for the flash fire nobody plans for, the hard hat and glasses for the overhead work and flying debris of a construction crew, and hearing protection because a venting line or a compressor nearby can be loud enough to damage hearing over a single shift." },
    { id: "ignition-locker", kind: "select", target: "phone-locker", title: "Leave ignition sources at the gate", cue: "Put your phone, lighter and any unrated electronics in the locker at the ignition-control sign.", why: "Everything that can make a spark or a hot surface is a possible ignition source for a gas release, and leaving phones, lighters and unrated devices at the gate is the simplest control there is, because it removes them from the pad instead of relying on nobody using them." },
    { id: "pad-wind", kind: "select", target: "pad-windsock", title: "Read the windsock", cue: "Read the windsock and note the upwind muster point before work starts.", why: "Gas released at a wellhead moves with the wind, so the muster point that keeps the crew safe depends on where the wind is coming from today, and reading the windsock at the start is what turns an alarm into a walk the crew already knows." },
    { id: "find-weep", kind: "find", noHint: true, targets: ["weeping-flange"], itemNames: { "weeping-flange": "weeping flange" }, itemNotes: { "weeping-flange": "A weeping flange is reported to the operator's contact and the area kept clear; the contractor crew does not tighten or touch it." }, decoyNotes: { "tight-flange": "A dry, tight flange with its bolts all engaged. Nothing to report there." }, title: "Find the weeping flange", cue: "Find the flange that is weeping gas.", why: "A flange that hisses, frosts or bubbles is leaking gas at pressure, and the contractor's part is to see it and report it so the operator can isolate and repair it, because a wrench on a live joint turns a small leak into a sudden one." },
    { id: "hot-boundary", kind: "drag", target: "barrier-tape", drag: { to: "hot-work-edge", radius: 0.4, missNote: "Not placed — set the barrier at the edge of the permitted hot-work area." }, title: "Mark the hot-work boundary", cue: "Carry the barrier tape to the edge of the permitted hot-work area.", why: "The hot-work permit covers one area and no further, and marking its boundary on the ground keeps sparks, slag and the welder's leads inside the space that was tested and away from wellheads and lines that were not." },
    { id: "gas-test-hold", kind: "hold", target: "gas-test-pad", seconds: 5, title: "Gas-test the hot-work area", cue: "Hold the monitor at the hot-work location, low and high, until the reading settles.", why: "Natural gas is lighter than air but can collect under equipment and in low corners before it rises, so the test is held long enough at the work height and at ground level to read the air the arc will actually meet.", holdBreakNote: "Moved off before the reading settled. Hold the monitor until it is steady." },
    { id: "gas-test-track", kind: "track", target: "gas-track-meter", seconds: 8, title: "Keep the continuous test running", cue: "Keep the continuous monitor's sample inside the band while the hot work goes on.", why: "A single test only proves the air at one moment, and on a live pad conditions change, so a continuous monitor kept sampling properly through the whole job is what lets the fire watch stop the work the moment the air changes.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "SAMPLE", readout: (v) => (v < 0.4 ? "starved" : v > 0.62 ? "flooded" : "steady") }, holdBreakNote: "The sample left the band. Clear the inlet and hold it steady." },
    { id: "find-unlocked", kind: "find", noHint: true, targets: ["unlocked-valve"], itemNames: { "unlocked-valve": "isolation valve with no lock" }, itemNotes: { "unlocked-valve": "Every valve on the isolation list carries the operator's lock; one without a lock is reported and no one works on that pipe until it is secured." }, decoyNotes: { "locked-valve": "An isolation valve chained and locked as the list says. Nothing to report there." }, title: "Find the unsecured isolation", cue: "Walk the isolation list and find the valve with no lock on it.", why: "Isolation is only as good as its weakest point, and one valve on the list without a lock is a path for gas back into the pipe the crew is about to open, so checking every point against the list is how a contractor confirms the protection someone else put in place." },
    { id: "lock-on", kind: "sequence", anyOrder: false, targets: ["group-lockbox", "zero-energy-check", "permit-sign"], itemNames: { "group-lockbox": "personal lock on the group box", "zero-energy-check": "zero energy shown by the operator", "permit-sign": "permit signed on" }, outOfOrderNote: "Out of order — your own lock on the group box, then the operator shows zero energy, then you sign on.", title: "Lock on before touching the pipe", cue: "Put your personal lock on the group box, have the operator show zero energy, then sign on to the permit.", why: "Group lockout lets one set of operator locks isolate many points while each worker still holds their own control, and the order matters: your lock goes on first, the operator proves the pipe is at zero energy with you watching, and only then do you sign that you are working on it." },
    { id: "muster-walk", kind: "select", target: "muster-point-pad", title: "Walk the muster route", cue: "Walk the route to the upwind muster point once, before the work starts.", why: "An alarm on a gas pad gives seconds, not minutes, and a route walked once in calm conditions is one the crew follows without thinking, around the wellheads and equipment rather than through them." },
    { id: "pad-handover", kind: "select", target: "pad-log", title: "Log and hand back", cue: "Log the weeping flange, the unsecured valve and the gas tests, and hand the permit back.", why: "The operator's people keep running the wells after the crew leaves, and what the contractor saw — a weep, an unsecured valve, a failed test — only helps them once it is written on the permit and handed back in person." },
  ],

  build(root) {
    const ACC = LPWP_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const ground = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.85 });
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {}), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.02, color: 0xffffff });
    const deck = box(g, 2.2, 0.03, 0.9, -3.2, 0.13, 3.3, 0xffffff, { rough: 0.7, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "gas storage well pad — procedural, not a real site", -2.6, 3.8, -7.05, { css: "#f2b84b", w: 0.8 });
    // wellheads: a stack of valves and spools on each cellar, with their flowlines
    const heads = [];
    for (let i = 0; i < 3; i++) {
      const x = -3 + i * 3, z = -5.2;
      box(g, 1.4, 0.1, 1.4, x, 0.17, z, 0x4b5057, { rough: 0.9 });
      for (let k = 0; k < 4; k++) cyl(g, 0.22 - k * 0.02, 0.22 - k * 0.02, 0.32, x, 0.4 + k * 0.36, z, [0xc4302b, 0x8a939b, 0xc4302b, 0x8a939b][k], { rough: 0.45, metal: 0.6, seg: 14 });
      heads.push(ball(g, 0.14, x, 1.95, z, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 12 }));
      for (const s of [-1, 1]) { const w = cyl(g, 0.05, 0.05, 0.45, x + s * 0.3, 1.0, z, 0x2b2f34, { rough: 0.5, seg: 8 }); w.rotation.z = Math.PI / 2; }
      const fl = cyl(g, 0.08, 0.08, 2.2, x + 1.1, 0.35, z + 0.6, 0x9aa3ab, { rough: 0.4, metal: 0.6, seg: 10 }); fl.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 8; i++) box(g, 8.4, 0.06, 0.06, 0, 0.3 + (i % 4) * 0.08, -3.9 + Math.floor(i / 4) * 0.2, i % 2 ? 0xd9dfe4 : 0xb7c0c8, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 12; i++) box(g, 0.08, 0.5, 0.08, -4.2 + i * 0.76, 0.25, -3.8, 0x6d767e, { rough: 0.5, metal: 0.5 });
    // the pad fence and the ignition-control sign
    for (let i = 0; i < 14; i++) cyl(g, 0.03, 0.03, 1.6, -4.4 + i * 0.68, 0.8, -3.1, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 6 });
    for (const y of [0.4, 0.9, 1.4]) box(g, 8.9, 0.02, 0.02, 0, y, -3.1, 0x8a939b, { rough: 0.5, metal: 0.6 });
    const sign = box(g, 0.6, 0.4, 0.03, -4.1, 1.5, 2.2, 0xd2312b, { rough: 0.5 });
    decal(sign, 0.54, 0.34, 0, 0, 0.02, signFace("NO IGNITION\nSOURCES", { bg: "#6a1010", accent: "#ffffff", scale: 0.26 }));
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#f2b84b", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("lel-meter", "gas monitor", -1.68, 1.47, "meter");
    put("fr-coveralls", "FR coveralls", -2.09, 0.9, "box", 0x2a4f8f);
    put("pad-glasses", "hard hat and glasses", -2.25, 0.24, "ball", 0xf2f2f2);
    put("pad-hearing", "hearing protection", -2.13, -0.42, "cyl", 0xf0b323);
    put("phone-locker", "ignition-source locker", -1.74, -1.01, "box", 0x4b5561);
    put("pad-windsock", "windsock reading", -1.14, -1.45, "ball", 0xf07a2b);
    put("barrier-tape", "barrier tape", -0.4, -1.68, "cyl", 0xf0b323);
    cap["hot-work-edge"] = group(g, 0.4, 0.95, -1.68); post(0.4, -1.68, 0.95);
    box(cap["hot-work-edge"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["hot-work-edge"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "hot-work boundary", 0.4, 1.3, -1.68, { css: "#f2b84b", w: 0.44 }); reg(hits, cap["hot-work-edge"], "hot-work-edge");
    put("gas-test-pad", "gas test point", 1.14, -1.45, "ball", 0x2b2f34);
    put("gas-track-meter", "continuous monitor", 1.74, -1.01, "meter");
    put("stop-hot-work", "stop the hot work", 2.13, -0.42, "cyl", 0xd2312b);
    put("crosswind-marker", "crosswind marker", 2.25, 0.24, "box", 0x59c97b);
    put("group-lockbox", "group lockbox", 2.09, 0.9, "box", 0xc4302b);
    put("zero-energy-check", "zero energy shown", 1.68, 1.47, "ball", 0x59637a);
    put("permit-sign", "sign on to the permit", 0.6, 2.3, "cyl", 0x3a78c9);
    put("muster-point-pad", "upwind muster point", -0.6, 2.3, "box", 0x59c97b);
    // the flanges and valves to read (find steps)
    const fitting = (id, x, colour) => { const f = cyl(g, 0.11, 0.11, 0.1, x, 0.62, -2.7, colour, { rough: 0.5, metal: 0.6, seg: 12 }); f.rotation.z = Math.PI / 2; cap[id] = f; reg(hits, f, id); return f; };
    fitting("weeping-flange", -1.6, 0xb8c2ca);
    fitting("tight-flange", -0.53, 0x8a939b);
    fitting("unlocked-valve", 0.53, 0xc4302b);
    fitting("locked-valve", 1.6, 0xc4302b);
    const frost = ball(g, 0.05, -1.6, 0.72, -2.62, 0xf4fbff, { rough: 1, seg: 8 });
    box(g, 0.08, 0.08, 0.04, 1.6, 0.74, -2.62, 0xf0b323, { rough: 0.5 });
    box(g, 3.8, 0.05, 0.4, 0, 0.5, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.5, 0.36, sx, 0.25, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("phone-on-pad-hazard", "PHONE\nON PAD", -1.22, 2.96, 2.75);
    hazard("tighten-live-hazard", "TIGHTEN\nLIVE", 1.22, 2.96, -2.75);
    hazard("skip-gas-test-hazard", "SKIP\nGAS TEST", -3.04, -1.01, 1.25);
    hazard("cut-lock-hazard", "CUT\nLOCK", 3.04, -1.01, -1.25);
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f2b84b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PAD WORK PERMIT", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Live wells: as the operator lists", "Hot work: tested area only", "Isolation: group lockout", "Muster: upwind of the wellheads"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "pad-permit-board");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("PAD LOG\nOPEN", { bg: "#11181f", accent: "#f2b84b", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "pad log", 0, 1.46, 0, { css: "#f2b84b", w: 0.3 });
    reg(hits, logSign, "pad-log");
    cyl(g, 0.04, 0.05, 3.2, 4.1, 1.6, -3.4, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const sock = cyl(g, 0.12, 0.05, 0.7, 4.45, 3.1, -3.4, 0xf07a2b, { rough: 0.8, seg: 10 }); sock.rotation.z = Math.PI / 2;
    for (let i = 0; i < 24; i++) box(g, 0.5, 0.12, 0.3, (i % 2 ? 1 : -1) * 4.25, 0.18 + (Math.floor(i / 2) % 4) * 0.14, 1.2 + Math.floor(i / 8) * 0.5, [0x6d767e, 0xb08a4a, 0x2a4f8f][i % 3], { rough: 0.8 });
    const welder = group(g, 0.9, 0, -2.2);
    box(welder, 0.5, 0.4, 0.35, 0, 0.2, 0, 0x2f6fb0, { rough: 0.6 });
    const arcLamp = ball(welder, 0.05, 0, 0.5, 0.2, 0x7fd6ff, { emissive: 0x7fd6ff, ei: 1.4, seg: 8 });
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2a4f8f, helmet: 0xf2f2f2 });
    holoTag(crew, "operator's contact", 0, 1.95, 0.15, { css: "#f2b84b", w: 0.36 });
    const faultOn = /[?&]fault=flange-weep(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_LP_GAS_STORAGE_WELLPAD_AWARENESS.steps.find((s) => s.id === "find-weep");
    const fDecl = SIM_LP_GAS_STORAGE_WELLPAD_AWARENESS.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { frost.position.x = -0.53; holoTag(g, "Flange weep: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "lel-alarm") { faultLamp.visible = true; cap["gas-test-pad"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "wind-shift") { sock.rotation.y = Math.PI; cap["crosswind-marker"].material = mat(0xf0b323, { rough: 0.5, emissive: 0xf0b323, ei: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lel-alarm") { faultLamp.visible = false; arcLamp.visible = false; cap["stop-hot-work"].material = mat(0x59c97b, { rough: 0.5 }); }
        if (it.id === "wind-shift") { crew.position.x += 1.0; cap["crosswind-marker"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
      },
      onStepComplete(step) {
        if (step.id === "bump-lel") repaint(cap["lel-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "pad-handover") repaint(logFace, signFace("PAD LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        if (step.id === "lock-on") cap["group-lockbox"].material = mat(0x59c97b, { rough: 0.5 });
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (heads[0]) sock.rotation.x = Math.sin(t * 0.7) * 0.12;
        if (arcLamp.visible) arcLamp.scale.setScalar(0.8 + Math.abs(Math.sin(t * 9)) * 0.4);
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "bump-lel") repaint(cap["lel-meter"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
