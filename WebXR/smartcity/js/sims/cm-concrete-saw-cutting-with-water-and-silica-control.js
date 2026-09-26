import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Concrete Saw Cutting with Water & Silica Control VR — Cement
// masons and plasterers, station six.
//
// A cement mason cutting control joints in a cured slab inside a partly
// enclosed stairwell: the cutting plan read, the saw and the water supply
// walked before the blade turns, the cut path cleared, water flow set to the
// blade before cutting starts, the joint cut to depth along its length, the
// slurry vacuumed up, and the saw's exhaust and the crew's air both watched
// the whole time it runs. Joint spacing, cutting depth and CO limits are the
// cutting plan's and the equipment manual's, never a number this file
// invents.

const CMSAW_ACCENT = 0xf2c14b;
const CMSAW_CSS = "#f2c14b";
const CMSAW_PAL = palette("construction");

export const SIM_CM_CONCRETE_SAW_CUTTING_WITH_WATER_AND_SILICA_CONTROL = {
  id: "cm-concrete-saw-cutting-with-water-and-silica-control",
  index: "705",
  domain: "Construction & Structural Trades",
  trade: "Cement mason — OPCMIA Local 300, concrete saw operator",
  category: "Construction & Structural Trades",
  weather: "clear",
  indoor: "plant",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; OSHA 29 CFR 1926.1153 respirable crystalline silica — Table 1's wet-cutting method for saws; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction; OSHA 29 CFR 1910.212 machine guarding, as applied to the saw's blade guard; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; the cutting plan and the equipment manufacturer's manual for depth and water flow",
  name: "Concrete Saw Cutting with Water & Silica Control",
  title: simTitle("Concrete Saw Cutting with Water & Silica Control"),
  tagline: "Joints cut clean in a stairwell: the guard and the water line checked before the blade turns, the cut path cleared, water flow set ahead of the first cut, the joint cut to depth and length, the slurry vacuumed up, the saw's exhaust watched in the enclosed space, and the day logged",
  accent: CMSAW_ACCENT,
  accentCss: CMSAW_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "wet-every-cut", name: "Wet Every Cut", note: "Every joint cut with water on the blade, a guard fitted and the air watched in the enclosed space — first time" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Cutting Crew",
    currency: "JOINT",
    ranks: ["Laborer", "Saw Hand", "Cement Mason", "Lead Cutter", "Cutting Crew Certified"],
    badges: [
      { id: "checked-before-charge", name: "Checked Before It Turns", note: "The saw walk found the loose guard and the empty tank before the blade ever spun, first time", test: AWARD.stepClean("saw-walk") },
      { id: "never-dry", name: "Never Dry, Never Blind To The Air", note: "Never cut dry, never worked with the guard off, never ran the saw past a CO alarm, never a cord in the slurry", test: AWARD.safe },
      { id: "on-the-line", name: "On The Line", note: "Water flow and cutting depth both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-joint", name: "Clean Joint", note: "No corrections through the whole cut", test: AWARD.clean },
      { id: "steady-cut", name: "Steady Cut", note: "The cutting depth held for the whole joint", test: AWARD.unbroken },
      { id: "joint-by-break", name: "Joint By Break", note: "Cut, vacuumed and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dry-cut-no-water": "You went to make the cut with the water off. A dry-cut saw blade throws respirable crystalline silica into the air at many times the permissible limit, in dust fine enough to reach deep into the lungs and never come back out — OSHA's silica rule's Table 1 method for saws is water on the blade for exactly this reason.",
    "saw-kickback-unguarded": "You went to push the cut through a bind with the blade guard off. A blade that binds in a cut without its guard kicks the saw straight back at the operator with the full force of the motor behind it, and the guard is what deflects that kick instead of it landing on a hand or a leg.",
    "co-buildup-keep-cutting": "You kept the gas saw running in the stairwell after the CO alarm went off. Carbon monoxide from a gas engine has nowhere to go in an enclosed stairwell, and it builds to a dangerous concentration long before it is visible or has an obvious smell — the alarm is the only warning most crews get before symptoms start.",
    "cord-in-slurry": "You went to plug the vacuum in with the cord lying in the wet slurry. Cutting slurry is water and ground concrete sitting on the floor conducting current the moment a compromised cord touches it, and a mason standing in it is not insulated from a live short. The cord stays out of the slurry and the circuit is GFCI-protected before anything gets plugged in.",
  },

  lateNotes: {
    "saw-trigger": "The saw only starts once the guard is fitted, the water line is connected and the cut path is clear — none of that is optional because the saw is already staged on the line.",
    "depth-wheel": "The depth is only set once the joint layout has actually been marked — a depth set before the line is struck is a depth for the wrong joint.",
    "close-log": "The day is logged once the slurry is cleared and the air in the stairwell has been checked again.",
  },

  steps: [
    {
      id: "cutting-plan", kind: "select", target: "cutting-plan",
      title: "Read the cutting plan",
      cue: "Read the joint layout, the cutting depth, the timing window the slab allows for cutting, and the ventilation note for the stairwell.",
      why: "A control joint cut too shallow does not relieve the shrinkage stress it is there for, and cut too late or too early relative to the slab's strength either ravels the edge or misses the crack window entirely. The plan sets all three, plus the ventilation note for a gas saw working in a partly enclosed stairwell, and none of it is a call the operator makes on the fly.",
    },
    {
      id: "saw-walk", kind: "find", noHint: true,
      targets: ["loose-guard", "empty-tank", "cord-across-path"],
      itemNames: { "loose-guard": "a blade guard not seated", "empty-tank": "an empty water tank", "cord-across-path": "an extension cord lying across the cut path" },
      itemNotes: {
        "loose-guard": "The blade guard is sitting on the saw but not seated and pinned — it will not hold position once the saw starts vibrating.",
        "empty-tank": "The water tank feeding the blade is empty; the saw will cut dry the moment the trigger is pulled.",
        "cord-across-path": "An extension cord for the shop light is lying directly across the line the saw is about to cut along.",
      },
      title: "Walk the saw and the cut line before starting",
      cue: "Walk the saw, the water tank and the cutting path, and click every defect you find.",
      why: "Every one of these is a fix made with the blade dead and nothing running. Found once the saw is cutting, a loose guard is a kickback with nothing deflecting it, an empty tank is a lungful of silica dust before anyone notices the water stopped, and a cord under the saw's path is a cut cord live under a wet slab — the walk is what a quick fix looks like instead of any of that.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["seat-guard", "fill-tank", "clear-cord"],
      itemNames: { "seat-guard": "guard seated and pinned", "fill-tank": "water tank filled", "clear-cord": "cord cleared from the path" },
      title: "Correct what the walk found",
      cue: "Seat and pin the guard, fill the water tank, and clear the cord from the cutting path.",
      why: "The saw is not actually safe to start until the guard is seated, the tank is full and the cord is clear — noting those three problems and leaving them for later gives the crew false confidence that is arguably worse than not having checked, since everyone downstream now assumes the saw passed its walk.",
    },
    {
      id: "clear-path", kind: "select", target: "cut-path-zone",
      title: "Clear the cutting path",
      cue: "Move bystanders and other trades out of the line the saw is about to cut before starting it.",
      why: "A concrete saw throws slurry and occasionally kicks along the line it is cutting, and the operator's attention is on the joint line, not on who might step into it from the side. The path is cleared before the saw starts, which is the only point anyone can be sure it is actually empty.",
    },
    {
      id: "water-flow", kind: "gauge", target: "water-valve",
      title: "Set the water flow to the blade",
      cue: "Open the water valve and commit inside the manufacturer's band before the first cut starts.",
      why: "Too little water and the blade still throws dust even though the valve is technically open; too much and the slurry floods the cut and hides the line the operator is trying to follow. The manufacturer's band is the flow that actually keeps the blade wet enough to suppress dust without drowning the joint.",
      gauge: { label: "WATER FLOW", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "too little — dust still visible" : t <= 0.6 ? "in the manufacturer's band" : "too much — flooding the joint"), missNote: "Off the manufacturer's band — adjust the valve and check the flow again before cutting." },
    },
    {
      id: "depth-wheel", kind: "turn", target: "depth-wheel",
      title: "Set the blade depth for the joint",
      cue: "Turn the depth adjustment wheel to the cutting plan's depth for this joint before the blade touches the slab.",
      why: "Cut too shallow, the joint never relieves the shrinkage crack it exists to control and the slab cracks somewhere else instead; cut too deep, it weakens the slab more than the plan intended and risks cutting into embedded conduit or mesh the drawing shows below the surface. The depth is set once, to the plan, before the first pass.",
      turn: { turns: 1, label: "DEPTH" },
    },
    {
      id: "make-cut", kind: "hold", target: "saw-trigger", seconds: 5,
      title: "Make the first pass along the joint",
      cue: "Hold the saw steady on the chalk line and guide it through the first pass at a controlled feed rate.",
      why: "A controlled, steady feed is what keeps the blade cutting on line instead of wandering off it or binding hard enough to kick; a joint cut in one smooth pass is straighter and truer than one corrected halfway through because the operator rushed the feed.",
      holdBreakNote: "The saw wandered off the chalk line mid-pass. Reset at the last true point on the line and guide the pass again.",
    },
    {
      id: "cut-depth-track", kind: "track", target: "saw-trigger", seconds: 6,
      title: "Hold the cutting depth along the joint's length",
      cue: "Keep the feed rate steady so the cutting depth stays inside the plan's band for the whole length of the joint.",
      why: "Fed too fast, the blade rides shallow over harder aggregate and never reaches the plan's depth for that stretch; fed too slow, the blade can overheat and glaze, which dulls it and throws more dust for the same water flow. An even feed is what keeps the whole joint at one consistent depth.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "CUT DEPTH", readout: (v) => (v < 0.4 ? "shallow — riding over aggregate" : v > 0.6 ? "too deep — check for embeds" : "on the plan's depth") },
      holdBreakNote: "The depth left the band while the feed kept going. Slow down over the hard stretch and bring it back into band.",
    },
    {
      id: "slurry-clear", kind: "drag", target: "slurry-vacuum",
      title: "Vacuum the slurry off the joint",
      cue: "Carry the wet vacuum along the fresh joint and pick up the slurry before it dries on the slab.",
      why: "Wet slurry left to dry on a slab becomes a film of fine cement dust that the next foot traffic or sweep kicks straight back into the air, undoing the whole point of cutting wet in the first place. Vacuumed up while it is still wet, it is no different from any other liquid spill to handle.",
      drag: { to: "slurry-zone", radius: 0.6, missNote: "Not along the joint — the vacuum has to pick up the slurry the cut actually left, not a patch of dry floor." },
    },
    {
      id: "shutdown-check", kind: "select", target: "saw-kill",
      title: "Shut down and inspect the blade",
      cue: "Kill the saw at the switch and inspect the blade for damage before it goes back in the case.",
      why: "A blade that took a hard bind during the cut can crack or chip without it being obvious at a glance while it is still spinning down, and a damaged blade started up again on the next joint is a blade that can fail under load. Shutting down and inspecting before it is put away is what catches that before the next cut, not after.",
    },
    {
      id: "close-out", kind: "select", target: "close-log",
      title: "Log the day's cuts",
      cue: "Record the joints cut, the slurry cleared and the air checked in the stairwell.",
      why: "The cutting log is how the foreman knows every joint on the plan was actually cut to depth rather than skipped when the schedule got tight, and it is where the CO alarm and the empty water tank get written down so the next crew starting in this stairwell knows both were already found once.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: joints cut, slurry cleared, air checked. Then check in with the crew about the water line and the CO alarm.",
      why: "Whether the next stairwell gets cut on schedule, and with what fan running, comes down to what actually gets reported on this call. A water line failed mid-cut and a CO alarm sounded while the saw kept turning — neither one belongs left out, and neither does the fact that the OPCMIA member assistance line is available to whoever the shift left uneasy.",
    },
  ],

  interrupts: [
    {
      id: "water-line-fails",
      kind: "Water line to the blade fails mid-cut",
      after: "make-cut", delay: 2, seconds: 12,
      alert: "The water line feeding the blade has kinked and stopped, and the saw is starting to throw visible dust mid-cut.",
      cue: "Kill the saw before it cuts another inch dry.",
      target: "saw-kill",
      why: "A saw that loses its water mid-cut does not stop being dangerous just because it was wet a moment ago — every second it keeps spinning dry now is dust at full concentration going into the operator's breathing zone. The kill switch stops the cut immediately so the line can be cleared before cutting resumes, rather than finishing the pass dry to save time.",
      missNote: "The saw kept cutting dry through the rest of the pass while the water line stayed kinked; a visible dust cloud hung over the joint by the time anyone reached the switch.",
      wrongNote: "The saw kill switch — a dry blade throwing dust has to stop cutting immediately, not finish the pass first.",
    },
    {
      id: "co-alarm",
      kind: "CO monitor alarms in the enclosed stairwell",
      after: "cut-depth-track", delay: 2, seconds: 12,
      alert: "The CO monitor on the stairwell wall has started alarming from the gas saw's exhaust building up in the enclosed space.",
      cue: "Shut the saw down and get the ventilation fan running before anyone breathes more of it.",
      target: "vent-fan",
      why: "Carbon monoxide from a gas engine has no smell and no colour, and by the time a crew notices symptoms the concentration is already well past where the alarm first sounded. The saw stops adding to it immediately and the fan clears what has already built up — waiting to see if the alarm clears itself is exactly the gap the monitor exists to close.",
      missNote: "The saw kept running through the alarm while the crew worked the last few feet of the joint; the air in the stairwell stayed thick with exhaust for the rest of the cut.",
      wrongNote: "The ventilation fan — a CO alarm in an enclosed stairwell means the saw stops and the air gets cleared before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMSAW_ACCENT);
    const ground = box(g, 8.0, 0.04, 6.0, 0, 0.02, -0.3, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#8b877c", tone2: "#7d7970" }), { repeat: 4, px: 512 }), { rough: 0.8, color: 0xd0cabb });

    // ------------------------------------------------------------- stairwell walls (enclosed)
    const wallMat = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#9a968c", tone2: "#8e8a80" }), { repeat: 2, px: 256 }), { rough: 0.9, color: 0xe4dfd0 });
    for (const [x, z, w, d] of [[-4.0, -0.3, 0.2, 6.0], [4.0, -0.3, 0.2, 6.0], [0, -3.2, 8.0, 0.2]]) { const wl = box(g, w, 2.8, d, x, 1.4, z, 0xffffff); wl.material = wallMat; }

    // ------------------------------------------------------------- the joint line, chalk, embeds
    const jointLine = box(g, 5.0, 0.005, 0.02, 0, 0.045, 1.4, 0xf2e14b, { rough: 0.7, cast: false });
    void jointLine;
    const cutTrench = box(g, 5.0, 0.03, 0.06, 0, 0.02, 1.4, 0x3a3a36, { rough: 0.6 });
    cutTrench.visible = false;
    const cutTrenchHit = box(g, 5.2, 0.2, 0.4, 0, 0.1, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["cut-progress"] = cutTrenchHit;

    // ------------------------------------------------------------- the saw
    const saw = group(g, -2.6, 0.02, 1.4, 0.4);
    box(saw, 0.5, 0.35, 0.9, 0, 0.2, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    const blade = cyl(saw, 0.28, 0.28, 0.02, 0, 0.28, -0.5, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 24 });
    blade.rotation.z = Math.PI / 2;
    const guard = cyl(saw, 0.32, 0.32, 0.08, 0, 0.28, -0.5, CMSAW_PAL.trim, { rough: 0.5, metal: 0.5, seg: 24, open: true });
    guard.rotation.z = Math.PI / 2;
    guard.rotation.y = 0.3;
    reg(hits, guard, "loose-guard");
    holoTag(saw, "loose blade guard", 0, 0.55, -0.5, { css: CMSAW_CSS, w: 0.32 });
    const handle = box(saw, 0.05, 0.05, 0.6, 0, 0.45, 0.4, 0x2b2f34, { rough: 0.6 });
    reg(hits, handle, "saw-trigger");
    holoTag(saw, "saw trigger", 0, 0.65, 0.4, { css: CMSAW_CSS, w: 0.22 });
    const depthWheel = cyl(saw, 0.06, 0.06, 0.04, 0.28, 0.3, 0.2, CMSAW_PAL.accent, { rough: 0.5, metal: 0.5, seg: 16 });
    holoTag(saw, "depth wheel", 0.28, 0.42, 0.2, { css: CMSAW_CSS, w: 0.24 });
    reg(hits, depthWheel, "depth-wheel");
    const kickHit = box(saw, 0.6, 0.3, 0.4, 0, 0.5, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(saw, "push through the bind unguarded?", 0, 0.85, -0.2, { css: "#d2312b", w: 0.5 });
    reg(hits, kickHit, "saw-kickback-unguarded");
    const seatGuardSupply = group(g, -1.8, 0.02, 1.1, 0.2);
    cyl(seatGuardSupply, 0.1, 0.1, 0.03, 0, 0.16, 0, CMSAW_PAL.trim, { rough: 0.5, metal: 0.5, seg: 16 });
    holoTag(seatGuardSupply, "seat the guard", 0, 0.3, 0, { css: CMSAW_CSS, w: 0.26 });
    reg(hits, seatGuardSupply, "seat-guard");
    const killSwitch = box(saw, 0.08, 0.06, 0.03, -0.2, 0.4, 0.4, 0xd2312b, { rough: 0.5, metal: 0.3 });
    holoTag(saw, "saw kill switch", -0.2, 0.52, 0.4, { css: CMSAW_CSS, w: 0.26 });
    reg(hits, killSwitch, "saw-kill");
    const dryCutHit = box(saw, 0.4, 0.2, 0.6, 0, 0.28, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(saw, "cut it with the water off?", 0, 0.5, -0.8, { css: "#d2312b", w: 0.42 });
    reg(hits, dryCutHit, "dry-cut-no-water");
    const dust = particles(g, 60, 0xd8d2c4, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    const water = particles(g, 40, 0x8fb8d8, { size: 0.02, life: 0.5, additive: false, opacity: 0.5 });

    // ------------------------------------------------------------- water tank, valve
    const tank = group(g, -2.0, 0.02, 2.3, 0.2);
    cyl(tank, 0.24, 0.24, 0.5, 0, 0.27, 0, 0x3a4550, { rough: 0.6, seg: 16 });
    const tankFill = cyl(tank, 0.2, 0.2, 0.02, 0, 0.06, 0, 0x2b5a6a, { rough: 0.2, opacity: 0.7, transparent: true });
    reg(hits, tank, "empty-tank");
    holoTag(tank, "empty water tank", 0, 0.58, 0, { css: CMSAW_CSS, w: 0.32 });
    const fillSupply = group(g, -1.5, 0.02, 2.1, 0.2);
    cyl(fillSupply, 0.06, 0.06, 0.14, 0, 0.08, 0, 0x2b5a6a, { rough: 0.5, seg: 12 });
    holoTag(fillSupply, "fill the tank", 0, 0.22, 0, { css: CMSAW_CSS, w: 0.24 });
    reg(hits, fillSupply, "fill-tank");
    const valve = cyl(tank, 0.05, 0.05, 0.1, 0.2, 0.45, 0, CMSAW_PAL.accent, { rough: 0.5, metal: 0.5, seg: 12 });
    holoTag(tank, "water valve", 0.2, 0.6, 0, { css: CMSAW_CSS, w: 0.22 });
    reg(hits, valve, "water-valve");
    const waterHose = hose(g, [[-1.8, 0.5, 2.3], [-2.0, 0.3, 1.8], [-2.4, 0.28, 1.5]], 0.015, 0x2b5a6a, { steps: 8, rough: 0.7 });
    void waterHose;

    // ------------------------------------------------------------- cord, slurry, vacuum
    const cordAcross = cyl(g, 0.012, 0.012, 3.0, 0, 0.02, 1.4, 0xf2c14b, { rough: 0.7, seg: 8 });
    cordAcross.rotation.z = Math.PI / 2;
    reg(hits, cordAcross, "cord-across-path");
    holoTag(g, "cord across the cut path", 1.5, 0.2, 1.4, { css: CMSAW_CSS, w: 0.4 });
    const clearCordSupply = group(g, 2.0, 0.02, 1.9, 0.2);
    cyl(clearCordSupply, 0.012, 0.012, 0.3, 0, 0.1, 0, CMSAW_PAL.trim, { rough: 0.6, seg: 8 });
    holoTag(clearCordSupply, "clear the cord", 0, 0.24, 0, { css: CMSAW_CSS, w: 0.26 });
    reg(hits, clearCordSupply, "clear-cord");
    const slurryPuddle = box(g, 2.0, 0.006, 0.4, 0, 0.023, 1.4, 0x8a8579, { rough: 0.3, opacity: 0.4, transparent: true, cast: false });
    void slurryPuddle;
    const slurryZoneHit = box(g, 5.2, 0.1, 0.5, 0, 0.06, 1.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["slurry-zone"] = slurryZoneHit;
    const vac = group(g, 1.8, 0.02, 2.4, 0.2);
    cyl(vac, 0.22, 0.22, 0.45, 0, 0.24, 0, 0x2b2f34, { rough: 0.6, seg: 14 });
    holoTag(vac, "slurry vacuum", 0, 0.5, 0, { css: CMSAW_CSS, w: 0.28 });
    reg(hits, vac, "slurry-vacuum");
    const cordInSlurryHit = box(g, 0.4, 0.15, 0.4, 1.0, 0.1, 1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "plug in with the cord in the slurry?", 1.0, 0.3, 1.4, { css: "#d2312b", w: 0.5 });
    reg(hits, cordInSlurryHit, "cord-in-slurry");

    // ------------------------------------------------------------- CO monitor, vent fan, path zone
    const coMonitor = group(g, 3.6, 0.02, -2.6, 0.3);
    box(coMonitor, 0.2, 0.16, 0.05, 0, 1.5, 0, 0x2b2f34, { rough: 0.6 });
    const coFace = decal(coMonitor, 0.18, 0.13, 0, 1.5, 0.026, signFace("CO —", { bg: "#0d1c24", accent: CMSAW_CSS, fg: "#bfeaf7", scale: 0.35 }), { px: 160, glow: true, ei: 0.7 });
    holoTag(coMonitor, "CO monitor", 0, 1.7, 0, { css: CMSAW_CSS, w: 0.22 });
    const coKeepCuttingHit = box(coMonitor, 0.5, 0.4, 0.5, 0, 1.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(coMonitor, "keep cutting through the alarm?", 0, 2.2, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, coKeepCuttingHit, "co-buildup-keep-cutting");
    const ventFan = group(g, 3.8, 0.02, -3.0, 0.2);
    cyl(ventFan, 0.3, 0.3, 0.15, 0, 1.2, 0, CMSAW_PAL.trim, { rough: 0.5, metal: 0.5, seg: 16 });
    const fanBlades = cyl(ventFan, 0.26, 0.26, 0.02, 0, 1.2, 0.08, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 8 });
    holoTag(ventFan, "ventilation fan", 0, 1.42, 0, { css: CMSAW_CSS, w: 0.3 });
    reg(hits, ventFan, "vent-fan");
    const pathZoneHit = box(g, 5.2, 0.06, 1.2, 0, 0.05, 1.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cut-path-zone"] = pathZoneHit;

    // ------------------------------------------------------------- cards, log, radio, crew
    const board = group(g, 2.8, 0.02, -2.4, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMSAW_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("CUTTING PLAN — STAIRWELL B", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Joint layout and depth: per the plan", "Cut window: per the plan's timing", "Water on the blade — Table 1 method", "Ventilation: fan on, CO monitored"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMSAW_ACCENT });
    reg(hits, board, "cutting-plan");

    const log = group(g, 3.4, 0.02, -1.6, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("CUTTING LOG —\nSTAIRWELL B", { bg: "#171108", accent: CMSAW_CSS, fg: "#efeade", scale: 0.26 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "cutting log", 0, 1.62, 0, { css: CMSAW_CSS, w: 0.24 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, 3.8, 0.02, -0.8, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMSAW_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMSAW_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const mason = standingFigure(g, -1.0, 0.4, { ry: 1.4, cloth: 0x4a4038, vest: CMSAW_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: CMSAW_CSS, w: 0.24 });
    for (const [x, z] of [[3.4, 2.0], [-3.4, -1.8]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // A stacked pallet of spare blade blanks, a spare-parts rack and a coil
    // of extra water hose — ordinary storage a cutting crew keeps at hand.
    const yard = group(g, 3.0, 0.02, 2.2, 0.3);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) box(yard, 0.14, 0.1, 0.14, -0.72 + c * 0.18, 0.06 + r * 0.01, -0.63 + r * 0.18, r % 2 ? 0xb9bec4 : 0x8b949d, { rough: 0.5, metal: 0.6 });
    const partsRack = group(g, -3.6, 0.02, -0.6, -0.3);
    box(partsRack, 0.7, 0.05, 0.35, 0, 0.9, 0, CMSAW_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) cyl(partsRack, 0.02, 0.02, 0.55, -0.28 + i * 0.14, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const hoseCoil = group(g, -0.6, 0.02, 2.6, 0.2);
    for (let i = 0; i < 6; i++) cyl(hoseCoil, 0.14 + i * 0.02, 0.14 + i * 0.02, 0.02, 0, 0.02 + i * 0.022, 0, 0x2b5a6a, { rough: 0.7, seg: 16, open: true });

    let cutting = false, cutProgress = 0, coLevel = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(-1.4, 1.0, 1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { guard.rotation.y = 0; tankFill.scale.y = 3; cordAcross.visible = false; }
        if (step.id === "make-cut") cutting = false;
        if (step.id === "shutdown-check") cutting = false;
        if (step.id === "close-out") repaint(log.userData.face, signFace("CUTTING LOG —\nCUT + LOGGED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.24 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("STAIRWELL B DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.36 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "water-line-fails") { water.visible = false; dust.visible = true; }
        if (it.id === "co-alarm") { repaint(coFace, signFace("CO —\nALARM", { bg: "#3a0d0d", accent: "#d2312b", fg: "#ffd6d6", scale: 0.32 })); coLevel = 1; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "water-line-fails") { water.visible = true; dust.visible = false; }
        if (it.id === "co-alarm") { repaint(coFace, signFace("CO —\nCLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.32 })); coLevel = 0; fanBlades.userData.spin = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "water-flow") { water.visible = gg.t > 0.15; }
        if (session?.turn && step?.id === "depth-wheel") depthWheel.rotation.z = session.turn.amount * Math.PI * 2;
        if ((step?.id === "make-cut" || step?.id === "cut-depth-track") && session.holding) {
          cutting = true; cutProgress = Math.min(1, cutProgress + dt / 8);
          cutTrench.visible = true; cutTrench.scale.x = cutProgress;
          if (!session.activeInterrupt || session.activeInterrupt.id !== "water-line-fails") { water.visible = true; water.userData.step(dt, new THREE.Vector3(-2.6 + cutProgress * 5, 0.28, 1.4), 0.05, 0.2, -2); }
          dust.visible = !!(session.activeInterrupt && session.activeInterrupt.id === "water-line-fails");
          if (dust.visible) dust.userData.step(dt, new THREE.Vector3(-2.6 + cutProgress * 5, 0.3, 1.4), 0.1, 0.3, 0.5);
        } else { cutting = false; water.visible = false; }
        if (fanBlades.userData.spin || coLevel === 0) fanBlades.rotation.z += dt * 6;
        void cutting; void CITY;
      },
    };
  },
};
