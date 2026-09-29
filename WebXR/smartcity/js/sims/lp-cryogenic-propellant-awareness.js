import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, surfaceTexture, texturedMat,
  pavingFace, gratingFace, reg,
} from "../citykit.js";

import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cryogenic Propellant Awareness — its own gamified system: Upwind.
//
// LA-PROGRAMME (docs/consoles/LA-PROGRAMME.md): awareness for a support or construction worker who works NEAR a cryogenic
// storage area at a launch-site build — never the operator of it. The tank farm is generic and procedural: no product,
// volume, pressure, temperature or process is stated, and no real site's layout is shown; those belong to the site's own
// permit and the safety data sheet. The practice is taught from NFPA 55 (cryogenic fluids), OSHA hazard communication and PPE,
// and the eyewash standard. ?fault=frost-line swaps the frosted and the dry line so the right answer is read, not remembered.

const LPCRY_ACCENT = 0x7fd6ff;

export const SIM_LP_CRYOGENIC_PROPELLANT_AWARENESS = {
  id: "lp-cryogenic-propellant-awareness",
  index: "lp-1",
  domain: "Energy",
  trade: "Launch-site support crew, cryogenic-safety awareness — UA",
  category: "Energy & Power",
  district: "aerospace-depot",
  weather: "overcast",
  certification: "UA pipe trades training as a body; NFPA 55 Compressed Gases and Cryogenic Fluids Code; OSHA 29 CFR 1910.1200 hazard communication, 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.151 medical services and first aid; ANSI Z358.1 emergency eyewash and shower equipment; the safety data sheet for the cryogenic liquid the area permit names",
  name: "Cryogenic Propellant Awareness",
  title: simTitle("Cryogenic Propellant Awareness"),
  tagline: "Working beside a cryogenic storage area without being part of it: the area permit and the safety data sheet read, an oxygen monitor bump-tested, loose insulated gloves and a face shield, an upwind escape planned, frost and trapped lines recognised, and a vapour cloud answered by walking upwind and calling it in",
  accent: LPCRY_ACCENT,
  accentCss: "#7fd6ff",
  parSeconds: 300,
  footprint: 2.9,
  badge: { id: "upwind", name: "Upwind", note: "Read the permit and the SDS, proved the oxygen monitor, planned the upwind route and never walked into the vapour" },

  game: system({
    name: "Upwind",
    currency: "O2",
    ranks: ["Visitor", "Area Inducted", "Support Crew", "Crew Lead", "Upwind Certified"],
    badges: [
      { id: "permit-first", name: "Permit First", note: "Read the area permit before crossing the fence line", test: AWARD.stepClean("area-permit") },
      { id: "never-in-cloud", name: "Never in the Cloud", note: "Answered every vapour release from upwind", test: AWARD.safe },
      { id: "steady-sample", name: "Steady Sample", note: "Held the oxygen sample near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-induction", name: "Inside Par", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-induction", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
    ],
  }),

  supportLine: "your UA local's member assistance programme, or the site's employee assistance line if a release or a near miss is what stayed with you",

  faults: [{ id: "frost-line", label: "Line frosting: CHECK", step: "find-frost", target: "dry-line", note: "The line that was dry this morning is the one frosting now. Flag the frosting line, not the one you flagged yesterday.", from: "frosted-line", cue: "Find the line you must not touch." }],

  hazards: {
    "touch-frost-hazard": "That puts a bare hand on a frosted line. Frost on a pipe means the metal is cold enough to freeze skin to it on contact, and the ice that looks harmless is the warning, not the danger itself.",
    "walk-in-fog-hazard": "That walks into the white vapour to see where it is coming from. The fog is condensed moisture from the air; the gas that made it is invisible, heavier than air while cold, and can leave too little oxygen to breathe well before anyone feels short of breath.",
    "tight-gloves-hazard": "That pulls on tight leather work gloves for the fence-line walk. A splash of cryogenic liquid can be held against the skin by a tight glove; insulated gloves are worn loose so they can be thrown off in a second.",
    "pit-entry-hazard": "That climbs down into the valve pit to read a gauge. Cold vapour pools in pits, trenches and low ground, and a space that is open to the sky can still hold an atmosphere that is not safe to enter without testing and a permit.",
  },

  lateNotes: {
    "area-permit-board": "The area permit is read before the fence line is crossed, every shift, because the tanks' state and the exclusion zones change with the work.",
    "cryo-gloves": "Insulated cryogenic gloves are worn loose, cuffs outside the sleeves, so a splash runs off and the glove comes off in one pull.",
  },

  interrupts: [
    { id: "o2-alarm", kind: "Low oxygen", after: "o2-hold", delay: 3, seconds: 11, alert: "Your personal oxygen monitor is alarming low while you stand at the fence line by the low ground.", cue: "Walk to the upwind muster marker now.", target: "upwind-marker", why: "A low-oxygen alarm near cryogenic storage means gas has displaced the air where you are standing, and the only answer that does not depend on knowing why is to leave on the upwind route you planned, because judgement is one of the first things a thin atmosphere takes away.", missNote: "You stayed at the fence line with the monitor alarming. The alarm is answered by walking upwind first and asking why second.", wrongNote: "Not that — a low-oxygen alarm is answered by walking to the upwind marker." },
    { id: "relief-lifts", kind: "Vapour release", after: "o2-track", delay: 3, seconds: 11, alert: "A relief vent on the tank farm has lifted and a white cloud is rolling along the ground toward the laydown.", cue: "Sound the stop-work horn so the crew moves upwind.", target: "stop-work-horn", why: "A relief lifting is equipment doing its job, but the cloud it makes can drift across the people working downwind who cannot see what you see, and the stop-work horn is what turns one person's view of the cloud into the whole crew walking out of its path.", missNote: "The cloud drifted toward the crew with no stop-work call. What you see from the fence line has to reach the people downwind.", wrongNote: "That isn't it — the drifting cloud is answered with the stop-work horn." },
  ],

  steps: [
    { id: "area-permit", kind: "select", target: "area-permit-board", title: "Read the area permit", cue: "Read the area permit at the gate: the exclusion zones, the muster point and who controls the tanks.", why: "The area permit is where the operator of the storage area writes down what is live today, where the exclusion zones sit and who has authority over the tanks, and a support crew that has not read it is working next to equipment on assumptions nobody has checked since yesterday." },
    { id: "sds-cryo", kind: "select", target: "sds-cryo", title: "Read the safety data sheet", cue: "Read the SDS for the cryogenic liquid the permit names before you go near the fence.", why: "Each cryogenic liquid has its own mix of hazards — some displace oxygen, some enrich it and make ordinary materials burn fiercely, all of them freeze tissue on contact — and the safety data sheet is what tells you which of those applies here and what first aid it needs." },
    { id: "bump-test", kind: "gauge", target: "o2-meter", title: "Bump-test the oxygen monitor", cue: "Bump-test your personal oxygen monitor and commit only once it reads in the green.", why: "An oxygen monitor that has not been bump-tested may show a normal reading in air that is not normal, and near cryogenic storage the monitor is the only sense you have for a gas you cannot see or smell, so it is proven before it is trusted.", gauge: { label: "O2 MONITOR", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "bump passed" : "check sensor"), missNote: "Not in the green — take the monitor back to the crib; do not cross the fence with it." } },
    { id: "ppe-cryo", kind: "sequence", anyOrder: true, targets: ["cryo-gloves", "cryo-shield", "cuffs-out"], itemNames: { "cryo-gloves": "loose insulated gloves", "cryo-shield": "face shield over safety glasses", "cuffs-out": "trouser cuffs outside the boots" }, title: "Dress for a splash", cue: "Loose insulated gloves, a face shield over glasses, trouser cuffs outside the boots.", why: "Cryogenic PPE is about where a splash goes: a face shield keeps it off the eyes, loose gloves can be flung off rather than holding liquid against the hand, and cuffs outside the boots stop a spill running down inside them where it would sit against the skin." },
    { id: "wind-check", kind: "select", target: "windsock", title: "Read the windsock and plan upwind", cue: "Read the windsock and pick the upwind route to the muster marker before you start.", why: "A vapour cloud moves with the wind and hugs the ground while it is cold, so the escape route has to be chosen before anything happens, from the windsock you can see now, rather than guessed at while the cloud is already rolling toward you." },
    { id: "find-frost", kind: "find", noHint: true, targets: ["frosted-line"], itemNames: { "frosted-line": "frosting transfer line" }, itemNotes: { "frosted-line": "A frosting line is carrying very cold liquid or gas right now: flag it, keep hands and tools off it and tell the area controller." }, decoyNotes: { "dry-line": "A dry, ambient line with no frost on it. Nothing to flag there today." }, title: "Find the line you must not touch", cue: "Find the line you must not touch.", why: "Frost on the outside of a line is the plainest sign that what is inside is cold enough to freeze skin and to make carbon steel brittle, and spotting it from a distance is how a support crew keeps a ladder, a hand or a sling off a pipe that cannot take it." },
    { id: "cone-vent", kind: "drag", target: "exclusion-cone", drag: { to: "vent-zone", radius: 0.4, missNote: "Not placed — set the cone at the edge of the relief-vent exclusion zone." }, title: "Mark the vent exclusion zone", cue: "Carry the cone to the edge of the relief-vent exclusion zone.", why: "Relief vents can lift without warning when a tank warms, and marking the exclusion zone around their discharge keeps the laydown, the crane path and the crew's walking route out of the one place a release is certain to go first." },
    { id: "o2-hold", kind: "hold", target: "o2-hold-pad", seconds: 5, title: "Sample the low ground", cue: "Hold the monitor at the fence line by the low ground while it samples.", why: "Cold vapour is heavier than air and settles in hollows, trenches and pits before it spreads, so the monitor is held low and long enough to read the air a kneeling worker would breathe, not only the air at head height.", holdBreakNote: "Moved off before the sample settled. Hold it until the reading is steady." },
    { id: "o2-track", kind: "track", target: "o2-track-meter", seconds: 8, title: "Walk the fence line sampling", cue: "Walk the fence line keeping the monitor's sample flow inside the band.", why: "A pumped sample only reads the air it draws, and walking too fast or blocking the inlet starves it, so holding the flow in band along the whole fence line is what makes a clear reading mean the air really is clear.", track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "SAMPLE", readout: (v) => (v < 0.4 ? "starved" : v > 0.62 ? "too fast" : "steady") }, holdBreakNote: "The sample flow left the band. Slow down and clear the inlet before you go on." },
    { id: "find-trapped", kind: "find", noHint: true, targets: ["trapped-line"], itemNames: { "trapped-line": "line shut between two valves with no relief" }, itemNotes: { "trapped-line": "Cryogenic liquid shut between two closed valves warms and expands; a section with no relief device is reported to the area controller, never opened or heated by the support crew." }, decoyNotes: { "relieved-line": "A section between two valves with its relief device fitted. Nothing to flag there." }, title: "Find the trapped section", cue: "Find the length of line shut in between two valves with no relief fitted.", why: "Liquid trapped between two closed valves keeps warming and turning to gas, and without a relief device the pressure in that short length has nowhere to go, which is why the support crew's job is to recognise it and report it rather than touch a valve that is not theirs." },
    { id: "release-drill", kind: "sequence", anyOrder: false, targets: ["stop-work-horn", "upwind-marker", "radio-control"], itemNames: { "stop-work-horn": "stop-work horn sounded", "upwind-marker": "crew walked upwind to the marker", "radio-control": "area controller called" }, outOfOrderNote: "Out of order — sound the horn, walk upwind, then call the area controller from the marker.", title: "Run the release drill", cue: "Sound the stop-work horn, walk upwind to the marker, then call the area controller.", why: "In a release the order matters: the horn warns the people who cannot see the cloud, walking upwind takes everyone out of it, and the call to the area controller is made from the marker, where you can describe what you saw without breathing it." },
    { id: "shower-check", kind: "select", target: "safety-shower", title: "Locate the safety shower", cue: "Find the nearest safety shower and eyewash and walk the route to it once.", why: "Tepid water is the first aid for a cryogenic splash on skin or eyes, and the seconds spent finding the shower after a splash are seconds the tissue keeps freezing, so the route is walked once on a calm day to make it automatic." },
    { id: "handover", kind: "select", target: "handover-log", title: "Log what you saw", cue: "Log the frosting line, the trapped section and the release drill for the area controller.", why: "The area controller owns the tanks and the lines, and the support crew's observations only change anything once they are written down and handed over, so the frost, the trapped section and the drill go on the log before the crew leaves the fence line." },
  ],

  build(root) {
    const ACC = LPCRY_ACCENT;
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, ACC);
    const ground = box(g, 9.2, 0.12, 9.2, 0, 0.06, 0, 0xffffff, { rough: 0.8 });
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {}), { repeat: 5, px: 512 }), { rough: 0.8, metal: 0.02, color: 0xffffff });
    const walk = box(g, 2.2, 0.03, 0.9, -3.2, 0.13, 3.3, 0xffffff, { rough: 0.7, cast: false });
    walk.material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xffffff });
    holoTag(g, "cryogenic storage area — procedural, not a real site", -2.6, 3.8, -7.05, { css: "#7fd6ff", w: 0.8 });
    // the tank farm beyond the fence: vacuum-jacketed vessels, legs, transfer lines, relief stacks
    const tanks = [];
    for (let i = 0; i < 4; i++) {
      const x = -3.3 + i * 2.2, z = -5.4;
      const t = cyl(g, 0.62, 0.62, 3.0, x, 2.1, z, 0xe8edf0, { rough: 0.35, metal: 0.5, seg: 20 });
      tanks.push(t);
      ball(g, 0.62, x, 3.6, z, 0xe8edf0, { rough: 0.35, metal: 0.5, seg: 16 });
      for (const [lx, lz] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) cyl(g, 0.05, 0.05, 0.7, x + lx, 0.45, z + lz, 0x5d666e, { rough: 0.5, metal: 0.6, seg: 8 });
      cyl(g, 0.04, 0.04, 1.2, x + 0.5, 4.2, z, 0x9aa3ab, { rough: 0.4, metal: 0.6, seg: 8 });
      box(g, 0.5, 0.18, 0.02, x, 1.3, z + 0.63, 0x1d4f7a, { rough: 0.5 });
    }
    for (let i = 0; i < 6; i++) box(g, 8.2, 0.07, 0.07, 0, 0.9 + i * 0.05, -4.2 + i * 0.12, i % 2 ? 0xdfe6ea : 0xb9c3cb, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 10; i++) box(g, 0.08, 1.0, 0.08, -4.2 + i * 0.93, 0.5, -3.8, 0x6d767e, { rough: 0.5, metal: 0.5 });
    // the fence line
    for (let i = 0; i < 14; i++) cyl(g, 0.03, 0.03, 1.6, -4.4 + i * 0.68, 0.8, -3.1, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 6 });
    for (const y of [0.4, 0.9, 1.4]) box(g, 8.9, 0.02, 0.02, 0, y, -3.1, 0x8a939b, { rough: 0.5, metal: 0.6 });
    // the low ground (a shallow hollow by the fence) and a valve pit
    box(g, 2.0, 0.02, 1.2, 2.8, 0.125, -2.4, 0x5a6168, { rough: 0.95, cast: false });
    const pitRim = box(g, 0.9, 0.1, 0.9, -3.6, 0.17, -2.2, 0x3b4148, { rough: 0.8 });
    const post = (x, z, h) => cyl(g, 0.035, 0.045, h, x, h / 2, z, 0x3b4148, { rough: 0.5, metal: 0.5, seg: 10 });
    const cap = {};
    const put = (id, label, x, z, shape, colour) => {
      post(x, z, 0.95);
      if (shape === "ball") cap[id] = ball(g, 0.075, x, 1.03, z, colour, { rough: 0.45, seg: 12 });
      else if (shape === "cyl") cap[id] = cyl(g, 0.07, 0.07, 0.12, x, 1.01, z, colour, { rough: 0.5, seg: 12 });
      else if (shape === "meter") cap[id] = instrument(g, x, 0.97, z, { ry: Math.atan2(-x, 3.6 - z), idle: "--", color: ACC });
      else cap[id] = box(g, 0.18, 0.14, 0.12, x, 1.02, z, colour, { rough: 0.5 });
      holoTag(g, label, x, 1.3, z, { css: "#7fd6ff", w: Math.min(0.6, 0.12 + label.length * 0.018) });
      reg(hits, cap[id], id);
    };
    put("sds-cryo", "safety data sheet", -1.68, 1.47, "box", 0x2b2f34);
    put("o2-meter", "oxygen monitor", -2.09, 0.9, "meter");
    put("cryo-gloves", "loose insulated gloves", -2.25, 0.24, "ball", 0x2f6fb0);
    put("cryo-shield", "face shield", -2.13, -0.42, "cyl", 0x3a78c9);
    put("cuffs-out", "cuffs outside boots", -1.74, -1.01, "box", 0x4b5561);
    put("windsock", "windsock reading", -1.14, -1.45, "ball", 0xf07a2b);
    put("exclusion-cone", "exclusion cone", -0.4, -1.68, "cyl", 0xf0b323);
    cap["vent-zone"] = group(g, 0.4, 0.95, -1.68); post(0.4, -1.68, 0.95);
    box(cap["vent-zone"], 0.3, 0.06, 0.3, 0, 0.03, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 }); box(cap["vent-zone"], 0.22, 0.01, 0.22, 0, 0.065, 0, ACC, { emissive: ACC, ei: 0.4, rough: 0.5 });
    holoTag(g, "vent exclusion edge", 0.4, 1.3, -1.68, { css: "#7fd6ff", w: 0.46 }); reg(hits, cap["vent-zone"], "vent-zone");
    put("o2-hold-pad", "sample the low ground", 1.14, -1.45, "ball", 0x2b2f34);
    put("o2-track-meter", "sample flow", 1.74, -1.01, "meter");
    put("stop-work-horn", "stop-work horn", 2.13, -0.42, "cyl", 0xd2312b);
    put("upwind-marker", "upwind muster marker", 2.25, 0.24, "box", 0x59c97b);
    put("radio-control", "call the area controller", 2.09, 0.9, "ball", 0x59637a);
    put("safety-shower", "safety shower and eyewash", 1.68, 1.47, "cyl", 0x59c97b);
    // the lines to read (find steps): frosted vs dry, trapped vs relieved
    const lineAt = (id, x, colour, frost) => { const l = cyl(g, 0.06, 0.06, 1.1, x, 0.62, -2.7, colour, { rough: frost ? 0.9 : 0.4, metal: frost ? 0.1 : 0.6, seg: 10 }); l.rotation.z = Math.PI / 2; cap[id] = l; reg(hits, l, id); return l; };
    lineAt("frosted-line", -1.6, 0xf4fbff, true);
    lineAt("dry-line", -0.53, 0x9aa3ab, false);
    lineAt("trapped-line", 0.53, 0x9aa3ab, false);
    lineAt("relieved-line", 1.6, 0x9aa3ab, false);
    for (const x of [0.13, 0.93]) cyl(g, 0.07, 0.07, 0.14, x, 0.62, -2.7, 0xd2312b, { rough: 0.5, seg: 10 });
    cyl(g, 0.03, 0.03, 0.3, 1.6, 0.8, -2.7, 0x59c97b, { rough: 0.5, seg: 8 });
    box(g, 3.8, 0.05, 0.4, 0, 0.5, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1.8, 1.8]) box(g, 0.05, 0.5, 0.36, sx, 0.25, -2.7, 0x53585e, { rough: 0.6, metal: 0.4 });
    // hazard boards
    const hazard = (id, text, x, z, ry) => { const hz = group(g, x, 0, z, ry); cyl(hz, 0.03, 0.03, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
      const pd = box(hz, 0.26, 0.18, 0.02, 0, 1.0, 0, 0xd2312b, { rough: 0.5 }); decal(pd, 0.22, 0.14, 0, 0, 0.012, signFace(text, { bg: "#5a0f0f", accent: "#ffffff", scale: 0.3 })); reg(hits, pd, id); };
    hazard("touch-frost-hazard", "TOUCH\nFROST", -1.22, 2.96, 2.75);
    hazard("walk-in-fog-hazard", "INTO\nFOG", 1.22, 2.96, -2.75);
    hazard("tight-gloves-hazard", "TIGHT\nGLOVES", -3.04, -1.01, 1.25);
    hazard("pit-entry-hazard", "PIT\nENTRY", 3.04, -1.01, -1.25);
    const board = holoPanel(g, 0.7, 0.46, -2.9, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#7fd6ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("AREA PERMIT · CRYOGENIC STORAGE", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#a9c6d6";
      ["Liquid: as the permit names it", "Exclusion zones: relief vents", "Muster: upwind marker", "Support crew: observe, never operate"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.12)));
    }, { ry: 0.9, accent: ACC });
    reg(hits, board, "area-permit-board");
    const logSign = group(g, 2.9, 0, 1.0, -0.9);
    box(logSign, 0.44, 0.32, 0.03, 0, 1.2, 0, 0x1b232b, { rough: 0.6 });
    const logFace = decal(logSign, 0.4, 0.28, 0, 1.2, 0.02, signFace("HANDOVER LOG\nOPEN", { bg: "#11181f", accent: "#7fd6ff", scale: 0.26 }), { px: 320 });
    holoTag(logSign, "handover log", 0, 1.46, 0, { css: "#7fd6ff", w: 0.34 });
    reg(hits, logSign, "handover-log");
    // the windsock mast and the laydown beyond
    cyl(g, 0.04, 0.05, 3.2, 4.1, 1.6, -3.4, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const sock = cyl(g, 0.12, 0.05, 0.7, 4.45, 3.1, -3.4, 0xf07a2b, { rough: 0.8, seg: 10 }); sock.rotation.z = Math.PI / 2;
    for (let i = 0; i < 24; i++) box(g, 0.5, 0.12, 0.3, (i % 2 ? 1 : -1) * 4.25, 0.18 + (Math.floor(i / 2) % 4) * 0.14, 1.2 + Math.floor(i / 8) * 0.5, [0x6d767e, 0xb08a4a, 0x3a78c9][i % 3], { rough: 0.8 });
    // the vapour cloud (shown on the relief interruption) and the fault lamp
    const cloud = group(g, 1.6, 0, -3.6);
    for (let i = 0; i < 7; i++) ball(cloud, 0.35 + (i % 3) * 0.1, (i - 3) * 0.35, 0.25 + (i % 2) * 0.1, (i % 3) * 0.2, 0xf2f6f8, { rough: 1, seg: 10 });
    cloud.visible = false;
    const faultLamp = ball(g, 0.07, 3.4, 2.0, -3.2, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 12 });
    faultLamp.visible = false;
    const crew = standingFigure(g, -3.9, 0.8, { ry: 1.2, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(crew, "area controller", 0, 1.95, 0.15, { css: "#7fd6ff", w: 0.34 });
    const faultOn = /[?&]fault=frost-line(&|$)/.test(globalThis.location?.search ?? "");
    const fStep = SIM_LP_CRYOGENIC_PROPELLANT_AWARENESS.steps.find((s) => s.id === "find-frost");
    const fDecl = SIM_LP_CRYOGENIC_PROPELLANT_AWARENESS.faults[0];
    if (fStep) { fStep.targets = [faultOn ? fDecl.target : fDecl.from]; fStep.cue = faultOn ? fDecl.note : fDecl.cue; }
    if (faultOn) { cap["dry-line"].material = mat(0xf4fbff, { rough: 0.9 }); cap["frosted-line"].material = mat(0x9aa3ab, { rough: 0.4, metal: 0.6 }); holoTag(g, "Line frosting: CHECK", 3.4, 2.25, -3.2, { css: "#d2312b", w: 0.44 }); }
    faultLamp.visible = faultOn;
    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),
      onInterrupt(it) {
        if (it.id === "o2-alarm") { faultLamp.visible = true; cap["o2-hold-pad"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.6 }); }
        if (it.id === "relief-lifts") { cloud.visible = true; cap["stop-work-horn"].material = mat(0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "o2-alarm") { faultLamp.visible = false; cap["upwind-marker"].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 }); }
        if (it.id === "relief-lifts") { cloud.position.x += 1.2; cap["stop-work-horn"].material = mat(0x59c97b, { rough: 0.5 }); }
      },
      onStepComplete(step) {
        if (step.id === "bump-test") repaint(cap["o2-meter"].userData.screen, signFace("OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "handover") repaint(logFace, signFace("HANDOVER LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        if (step.id === "cone-vent") pitRim.material = mat(0xf0b323, { rough: 0.7 });
      },
      onHazard() {},
      animate(t, dt, session) {
        crew.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        if (tanks[0]) sock.rotation.y = Math.sin(t * 0.7) * 0.15;
        if (cloud.visible) cloud.scale.setScalar(1 + Math.sin(t * 1.3) * 0.05);
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "bump-test") repaint(cap["o2-meter"].userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "OK" : "CHECK", { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
      },
    };
  },
};
