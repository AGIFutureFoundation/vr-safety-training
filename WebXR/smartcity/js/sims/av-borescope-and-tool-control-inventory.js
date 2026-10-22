import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, lockTag, instrument,
  standingFigure, surfaceTexture, texturedMat, palette, blockFace,
  tileFace, gratingFace, reg,
} from "../citykit.js";
import { regionalJet } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Borescope & Tool-Control Inventory VR — its own gamified
// system: Nothing Left Behind.
//
// A borescope inspection run the way tool control actually works: every tool
// counted against its own shadow-board outline before the engine is touched
// at all, the engine locked out so nothing this crew is not expecting can
// start turning while a probe is inside it, the scan run and a finding
// logged, and then the same count run again afterward — because the only
// question tool control actually answers is whether every single thing that
// went out to this engine came back, and a shadow board with an empty
// outline on it is the one alarm this crew never gets to argue with. No
// borescope finding, tool count or lockout duration here is one this
// platform is certain of — those live on the work order and the shop's own
// tool-control programme.

const AVBS_ACCENT = 0xa079ff;

export const SIM_AV_BORESCOPE_AND_TOOL_CONTROL_INVENTORY = {
  id: "av-borescope-and-tool-control-inventory",
  index: "av-7",
  domain: "Aviation",
  trade: "Aircraft maintenance technician, borescope and tool control — IAM/TWU",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and TWU maintenance training; FAA 14 CFR Part 43 maintenance, preventive maintenance, rebuilding and alteration and 14 CFR Part 145 repair stations; OSHA 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.132 personal protective equipment",
  name: "Borescope & Tool-Control Inventory",
  title: simTitle("Borescope & Tool-Control Inventory"),
  tagline: "A borescope inspection tool-controlled end to end: every tool counted against the shadow board before the engine is touched, the engine locked out before the probe goes in, a finding scanned and logged, and the same count run again afterward until every outline on the board is full",
  accent: AVBS_ACCENT,
  accentCss: "#a079ff",
  parSeconds: 320,
  footprint: 2.9,
  badge: { id: "nothing-left-behind", name: "Nothing Left Behind", note: "Every tool counted before and after, the engine locked out for the whole scan, and the finding logged before the plug went back in" },

  game: system({
    name: "Nothing Left Behind",
    currency: "SCOPE",
    ranks: ["Ramp Hand", "Tool Control Qualified", "Borescope Certified", "Lead Inspector", "Nothing Left Behind Certified"],
    badges: [
      { id: "count-twice", name: "Count Twice", note: "Matched the tool count before and after, first time", test: AWARD.stepClean("posttask-tool-count") },
      { id: "locked-for-the-scan", name: "Locked for the Scan", note: "Never had the engine unlocked while the probe was inside it", test: AWARD.safe },
      { id: "steady-scan", name: "Steady Scan Certified", note: "Held the borescope view centred near band centre through the whole pass", test: AWARD.precise(0.72) },
      { id: "clean-start", name: "Clean Start", note: "Had every tool accounted for before the engine was ever touched", test: AWARD.stepClean("pretask-tool-count") },
    ],
    challenges: [
      { id: "quick-scope", name: "Quick Scope", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "scope-streak", name: "Scope Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IAM or TWU local's member assistance programme, or the site's employee assistance line if a close call around a running engine is what stayed with you",

  hazards: {
    "no-lockout-hazard": "That inserts the probe before the engine is locked out. A borescope inside an engine that can start turning is a probe this crew has no way to pull clear fast enough, and the lockout is what makes that scenario impossible rather than merely unlikely.",
    "tool-left-behind-hazard": "That signs off the job while the shadow board still shows an empty outline. A tool unaccounted for is a tool that might still be inside this engine, and the only honest response to an empty outline is finding it — not assuming it turned up somewhere else on the cart.",
    "blanking-plug-missing-hazard": "That leaves the intake without its blanking plug after the scan. An open intake on an engine that has not run yet is an invitation for anything loose nearby to end up ingested the first time it does.",
    "borescope-force-hazard": "That forces the probe past resistance instead of backing it off. A borescope pushed hard against something it should not be touching can score a blade or a seal this crew was sent in specifically to inspect, not to damage.",
  },

  lateNotes: {
    "missing-tool": "The tool count is proven before the engine is touched and proven again before the job is signed off — never just once, and never from memory.",
    "lockout-tag": "The lockout goes on before the probe goes anywhere near the engine, not fitted after the scan has already started.",
  },

  interrupts: [
    {
      id: "video-feed-glitches",
      kind: "Feed lost",
      after: "inspect-scan", delay: 5, seconds: 11,
      alert: "The borescope's video feed has glitched out entirely — the screen shows nothing but static.",
      cue: "Stop advancing the probe now, before it moves any further with no view of where it is going.",
      target: "borescope-stop",
      why: "Advancing a probe inside a running clearance this tight with no video feed is advancing blind, and the only safe response to losing the picture is to stop moving the probe until it comes back, not keep pushing on the hope it clears itself.",
      missNote: "The probe kept advancing with no video feed at all. A borescope pushed forward blind can catch on a blade or a seal this crew never saw coming because there was nothing to see it on.",
      wrongNote: "Not it — the lost feed is what stops this probe advancing, nothing else about the scan.",
    },
    {
      id: "coworker-reaches-for-ignition",
      kind: "Lockout challenge",
      after: "withdraw-borescope", delay: 4, seconds: 11,
      alert: "A coworker who does not realise the probe was just in this engine is reaching for the ignition switch nearby.",
      cue: "Stop them and confirm the lockout tag is still in place before anything near that switch happens.",
      target: "lockout-tag",
      why: "A lockout only protects this crew as long as everyone near the switch it is protecting knows it is there, and the moment somebody who does not know reaches for it, the tag has to be pointed to and confirmed before anything else happens near that switch.",
      missNote: "Nobody stopped the reach for the ignition switch while the lockout's own status went unconfirmed. A tag nobody is watching protects exactly nobody the moment somebody who does not know about it reaches past it.",
      wrongNote: "That's not the answer — the reach for the ignition switch is what needs stopping first.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["safety-glasses-bs", "hearing-protection", "work-gloves-bs"],
      itemNames: { "safety-glasses-bs": "safety glasses", "hearing-protection": "hearing protection", "work-gloves-bs": "work gloves" },
      title: "Suit up before the scope",
      cue: "Safety glasses, hearing protection and gloves before anyone opens the tool chest.",
      why: "The hangar around this engine runs other work at the same noise level whether or not this specific job is quiet, and this crew wears the same protection on a borescope job as on any other, because the hazard is the hangar's, not just this one task's.",
    },
    {
      id: "brief", kind: "select", target: "work-order-board",
      title: "Read the work order",
      cue: "Confirm the engine, the access port and the finding the borescope is looking for before opening anything.",
      why: "The work order is what tells this crew exactly which port to use and what they are actually looking for once the probe is inside — without it, a clean-looking scan proves nothing about the specific concern this inspection was ordered to check.",
    },
    {
      id: "pretask-tool-count", kind: "sequence", anyOrder: true,
      targets: ["tool-slot-1", "tool-slot-2", "tool-slot-3"],
      itemNames: { "tool-slot-1": "borescope probe accounted for", "tool-slot-2": "inspection mirror accounted for", "tool-slot-3": "flashlight accounted for" },
      title: "Count the tools before starting",
      cue: "Check every tool against its own shadow-board outline before the engine is touched.",
      why: "This count is the only baseline the post-task count is ever going to be compared against — skip it now and a missing tool found afterward has no way to prove it was not already missing before this crew ever opened the chest on this particular job.",
    },
    {
      id: "lockout-engine", kind: "sequence", anyOrder: true,
      targets: ["lockout-tag", "breaker-open"],
      itemNames: { "lockout-tag": "lockout tag applied", "breaker-open": "start breaker opened" },
      title: "Lock out the engine",
      cue: "Apply the lockout tag and open the start breaker before anything goes near the intake.",
      why: "A probe is about to sit inside an engine this crew has no way to pull clear of quickly, and the lockout is what makes it physically impossible for that engine to start turning while it is in there — not a formality, the actual reason the next step is survivable.",
    },
    {
      id: "verify-zero-energy", kind: "gauge", target: "zero-energy-meter",
      title: "Verify zero energy",
      cue: "Read the zero-energy meter and commit only once it confirms no stored energy remains.",
      why: "A lockout tag on a switch is not the same fact as an engine actually holding no energy to start with — this meter is what turns the tag from a label into a confirmed, checked state before anyone treats it as safe to work around.",
      gauge: { label: "ZERO ENERGY", speed: 0.6, green: [0.44, 0.62], readout: (t) => (t > 0.44 && t < 0.62 ? "confirmed zero" : "energy present"), missNote: "Not confirmed zero — recheck the lockout before anything goes near the intake." },
    },
    {
      id: "remove-blanking-plug", kind: "select", target: "blanking-plug",
      title: "Remove the blanking plug",
      cue: "Remove the intake blanking plug only once the lockout is verified.",
      why: "The plug comes off last, after the lockout is already confirmed, so the intake is never open on an engine this crew has not already made sure cannot start turning while a probe or a hand is anywhere near it — the two facts stay locked together for the whole scope.",
    },
    {
      id: "insert-borescope", kind: "drag", target: "borescope-probe",
      title: "Insert the probe",
      cue: "Carry the probe to the access port and feed it in slowly.",
      why: "The probe only goes where this crew actually guides it — fed in slowly and deliberately is what keeps the first resistance it meets from being a blade or a seal it was never supposed to touch that hard, rather than a clearance the probe could have found more gently.",
      drag: { to: "access-port", radius: 0.4, missNote: "Not seated in the access port — guide the probe fully in before starting the scan." },
    },
    {
      id: "inspect-scan", kind: "track", target: "borescope-view", seconds: 8,
      title: "Scan the engine internals",
      cue: "Keep the borescope view centred on the blades as you pan the probe through.",
      why: "A view that drifts off the blades is a scan that is technically running but not actually looking at anything useful, and keeping it centred is what turns the pass into an inspection instead of a probe moving through the dark.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.4, fall: 0.45, drift: 0.13, label: "VIEW CENTRE", readout: (v) => (v < 0.4 ? "drifted low" : v > 0.62 ? "drifted high" : "centred") },
      holdBreakNote: "View drifted off the blades. Bring it back to centre before continuing the pass.",
    },
    {
      id: "find-defect", kind: "find", noHint: true,
      targets: ["blade-nick"],
      itemNames: { "blade-nick": "nicked compressor blade" },
      itemNotes: { "blade-nick": "This is the nick the work order sent this scope in to look for — logged now, with the blade and stage noted, not just remembered for later." },
      decoyNotes: { "sound-blade": "This blade shows normal wear for its hours. Nothing to flag there." },
      title: "Find the defect",
      cue: "Look through the borescope view and find the nicked blade among the ones you're passing.",
      why: "A finding this small is exactly what a scan is built to catch and a walk-around from outside the engine never could — the whole reason this borescope job exists is that this specific defect is invisible from anywhere except right where the probe is now.",
    },
    {
      id: "log-finding", kind: "select", target: "inspection-sheet",
      title: "Log the finding",
      cue: "Log the blade, the stage and the finding on the inspection sheet before withdrawing the probe.",
      why: "A finding logged while the probe is still on the blade in question is a finding with the exact stage and position still fresh — pulled out first and logged from memory, it is a detail this crew is trusting itself to still have right afterward.",
    },
    {
      id: "withdraw-borescope", kind: "hold", target: "probe-retract-control", seconds: 6,
      title: "Withdraw the probe",
      cue: "Hold the retract control through a slow, steady withdrawal.",
      why: "A probe pulled out fast can catch the same blade it was just carefully guided past on the way in — holding a slow, steady retraction is what keeps the withdrawal as controlled as the insertion already was, instead of undoing that care in the last few seconds of the job.",
      holdBreakNote: "Released the retract control mid-withdrawal. Hold it through the whole way out — a fast pull now undoes how carefully this probe went in.",
    },
    {
      id: "install-blanking-plug", kind: "select", target: "blanking-plug",
      title: "Reinstall the blanking plug",
      cue: "Reinstall the intake blanking plug once the probe is fully clear.",
      why: "An open intake left sitting is an invitation for anything loose in the hangar to end up ingested the first time this engine runs, and the plug goes back the moment the probe is out, not sometime later when someone happens to remember it is still open.",
    },
    {
      id: "remove-lockout", kind: "sequence", anyOrder: true,
      targets: ["lockout-tag", "breaker-open"],
      itemNames: { "lockout-tag": "lockout tag removed", "breaker-open": "start breaker closed" },
      title: "Remove the lockout",
      cue: "Remove the lockout tag and close the breaker only once the plug is back in and the scope is clear.",
      why: "The lockout comes off last, after everything this crew put inside the engine is confirmed out and the intake is closed again — restoring power to an engine before that is confirmed is restoring it to a state nobody actually checked yet.",
    },
    {
      id: "posttask-tool-count", kind: "find", noHint: true,
      targets: ["missing-tool"],
      itemNames: { "missing-tool": "missing inspection mirror" },
      itemNotes: { "missing-tool": "This is the tool the shadow board came up short on — found now, on the cart where it was set down, rather than left for the next crew to discover the hard way." },
      decoyNotes: { "sound-tool-slot": "This tool is back on its own outline, clean and accounted for. Nothing to flag there." },
      title: "Recount the tools",
      cue: "Recheck the shadow board against the pre-task count — one tool is not back where it belongs.",
      why: "This is the count that actually matters: not that tools went out, but that every one of them came back, and an empty outline gets found and closed out before this job is anywhere close to finished, not signed off with a shrug and a guess about where it probably is.",
    },
    {
      id: "closeout-log", kind: "select", target: "closing-log",
      title: "Sign off the inspection",
      cue: "Log the finding, the tool count confirmation and the lockout times before releasing the engine.",
      why: "The inspection record is what the next shift and the aircraft's own maintenance log both read — a scan that found exactly what it was sent to find but never gets logged against a confirmed tool count leaves nothing behind to prove either one actually happened.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const PAL = palette("aviation");
    stationPad(g, 2.9, AVBS_ACCENT);

    // ------------------------------------------------------------------ hangar floor
    const groundMesh = box(g, 8.4, 0.12, 8.2, 0, 0.06, 0, 0xffffff, { rough: 0.6 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 8, tile: 0xd0d5d8, grout: "#93999b" }), { repeat: 5, px: 512 }),
      { rough: 0.55, metal: 0.05, color: 0xffffff },
    );
    // Drain grating under the engine stand — a second textured surface.
    const drainMesh = box(g, 1.0, 0.02, 0.5, -1.0, 0.111, -0.6, 0xffffff, { rough: 0.7, cast: false });
    drainMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => gratingFace(cx, w, h, {}), { repeat: 2, px: 256 }),
      { rough: 0.7, metal: 0.4, color: 0xffffff },
    );

    // ------------------------------------------------------------------ hangar wall (main structure)
    const wallMesh = box(g, 8.2, 4.6, 0.2, 0, 2.3, 4.2, 0xffffff, { rough: 0.75 });
    wallMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => blockFace(cx, w, h, { rows: 5, cols: 8, block: PAL.structure }), { repeat: 3, px: 512 }),
      { rough: 0.75, metal: 0.05, color: 0xffffff },
    );
    holoTag(g, "engine shop, bay 2", -3.6, 3.9, 4.1, { css: "#a079ff", w: 0.42 });

    // ------------------------------------------------------------------ aircraft, engine access
    const jet = regionalJet(g, 0, 0, -1.8, { livery: { colour: PAL.structure, accent: AVBS_ACCENT, fleetName: "SITE AIR", unitNumber: "N770XA" } });
    holoTag(jet, "aircraft in the shop", 0, 3.4, 0, { css: "#a079ff", w: 0.4 });
    const { engineL } = jet.userData.parts;

    const accessPort = group(engineL, 0, 0, 0.55);
    ball(accessPort, 0.06, 0, 0, 0, 0x14171a, { rough: 0.4, seg: 12 });
    holoTag(engineL, "access port", 0, 0.16, 0.55, { css: "#a079ff", w: 0.28 });
    reg(hits, accessPort, "access-port");
    const blankingPlug = group(engineL, 0, 0, 0.6);
    cyl(blankingPlug, 0.3, 0.3, 0.04, 0, 0, 0, 0xffd23b, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    holoTag(engineL, "blanking plug", 0, 0.4, 0.6, { css: "#a079ff", w: 0.28 });
    reg(hits, blankingPlug, "blanking-plug");
    const blankingMissingHazard = box(g, 0.7, 0.7, 0.3, 1.15, 0.62, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the intake open?", 1.15, 1.0, -1.9, { css: "#d2312b", w: 0.42 });
    reg(hits, blankingMissingHazard, "blanking-plug-missing-hazard");

    const lockoutTag = lockTag(g, 2.9, 1.0, -0.6, { lines: ["ENGINE", "LOCKED OUT"] });
    reg(hits, lockoutTag, "lockout-tag");
    const breakerOpen = box(g, 0.2, 0.28, 0.1, 3.3, 1.1, -0.6, 0x2b2f34, { rough: 0.55 });
    holoTag(breakerOpen, "start breaker", 0, 0.2, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, breakerOpen, "breaker-open");
    const noLockoutHazard = box(g, 0.4, 0.5, 0.4, 3.3, 1.5, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "start it anyway?", 3.3, 1.8, -1.1, { css: "#d2312b", w: 0.36 });
    reg(hits, noLockoutHazard, "no-lockout-hazard");

    const zeroEnergyMeter = instrument(g, 2.9, 0, -1.2, { ry: -0.4, idle: "--", color: AVBS_ACCENT });
    holoTag(zeroEnergyMeter, "zero-energy meter", 0, 0.16, 0, { css: "#a079ff", w: 0.36 });
    reg(hits, zeroEnergyMeter, "zero-energy-meter");

    const borescopeCase = group(g, -2.4, 0, 1.6, 0.3);
    box(borescopeCase, 0.5, 0.15, 0.3, 0, 0.08, 0, 0x2b2f34, { rough: 0.6 });
    const probe = hose(borescopeCase, [[0, 0.1, 0], [0.15, 0.12, 0.1], [0.3, 0.14, 0.2]], 0.015, 0x59637a, { rough: 0.4, metal: 0.5, steps: 10 });
    holoTag(borescopeCase, "borescope probe", 0, 0.3, 0, { css: "#a079ff", w: 0.34 });
    reg(hits, probe, "borescope-probe");
    const forceItLever = group(g, -1.9, 0.14, 1.3, 0.3);
    box(forceItLever, 0.08, 0.05, 0.03, 0, 0.14, 0, 0x2b2f34, { rough: 0.55 });
    const forcePaddle = box(forceItLever, 0.14, 0.1, 0.012, 0, 0.28, 0.007, 0xd2312b, { rough: 0.5 });
    decal(forcePaddle, 0.12, 0.08, 0, 0, 0.008, signFace("FORCE\nIT", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.32 }));
    reg(hits, forcePaddle, "borescope-force-hazard");

    const borescopeView = instrument(g, 3.4, 0, -2.3, { ry: -0.8, idle: "-- view", color: AVBS_ACCENT });
    holoTag(borescopeView, "borescope monitor", 0, 0.16, 0, { css: "#a079ff", w: 0.34 });
    reg(hits, borescopeView, "borescope-view");
    const glitchLight = ball(borescopeView, 0.018, 0.05, 0.03, 0.02, 0xd2312b, { emissive: 0xd2312b, ei: 1.6, seg: 10 });
    glitchLight.visible = false;
    const borescopeStop = group(g, 3.8, 0, -2.6, 0);
    cyl(borescopeStop, 0.03, 0.03, 0.05, 0, 0.9, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 12 });
    const borescopeStopCap = ball(borescopeStop, 0.035, 0, 0.93, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.7, seg: 12 });
    holoTag(borescopeStop, "scope stop", 0, 1.06, 0, { css: "#d2312b", w: 0.24 });
    reg(hits, borescopeStopCap, "borescope-stop");

    const bladeNick = ball(engineL, 0.02, 0.15, 0.1, 0.4, 0xb8402f, { rough: 0.6, seg: 10 });
    reg(hits, bladeNick, "blade-nick");
    const soundBlade = ball(engineL, 0.02, -0.15, 0.1, 0.4, 0x59637a, { rough: 0.5, seg: 10 });
    reg(hits, soundBlade, "sound-blade");

    const inspectionSheet = holoPanel(g, 0.55, 0.4, -1.6, 1.4, 1.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a079ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BORESCOPE FINDING", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Blade + stage: per the scan", "Finding: logged before withdrawal"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.14)));
    }, { ry: 0.4, accent: AVBS_ACCENT });
    reg(hits, inspectionSheet, "inspection-sheet");

    const retractControl = group(borescopeCase, 0, 0.3, -0.2, 0.2);
    ball(retractControl, 0.025, 0, 0, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.8, seg: 10 });
    holoTag(retractControl, "probe retract", 0, 0.16, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, retractControl, "probe-retract-control");

    const toolChest1 = toolChest(g, 2.4, 2.2, {});
    holoTag(toolChest1, "shadow-board chest", 0, 1.0, 0, { css: "#a079ff", w: 0.4 });
    const slot1 = box(toolChest1, 0.2, 0.03, 0.14, -0.18, 0.76, 0.21, AVBS_ACCENT, { rough: 0.6, opacity: 0.5, transparent: true });
    reg(hits, slot1, "tool-slot-1");
    const slot2 = box(toolChest1, 0.2, 0.03, 0.14, 0, 0.76, 0.21, AVBS_ACCENT, { rough: 0.6, opacity: 0.5, transparent: true });
    reg(hits, slot2, "tool-slot-2");
    const slot3 = box(toolChest1, 0.2, 0.03, 0.14, 0.18, 0.76, 0.21, AVBS_ACCENT, { rough: 0.6, opacity: 0.5, transparent: true });
    reg(hits, slot3, "tool-slot-3");
    const missingTool = box(g, 0.16, 0.02, 0.03, 3.1, 0.31, 2.4, 0x8b98a5, { rough: 0.5, metal: 0.5 });
    reg(hits, missingTool, "missing-tool");
    const soundToolSlot = box(toolChest1, 0.16, 0.02, 0.03, -0.25, 0.76, 0.15, 0x8b98a5, { rough: 0.5, metal: 0.5 });
    reg(hits, soundToolSlot, "sound-tool-slot");
    const toolLeftHazard = group(g, 2.0, 0.14, 1.9, 0.3);
    box(toolLeftHazard, 0.08, 0.05, 0.02, 0, 0.1, 0, 0x2b2f34, { rough: 0.55 });
    const signAnywayPaddle = box(toolLeftHazard, 0.14, 0.1, 0.012, 0, 0.2, 0.007, 0xd2312b, { rough: 0.5 });
    decal(signAnywayPaddle, 0.12, 0.08, 0, 0, 0.008, signFace("SIGN\nOFF", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.32 }));
    reg(hits, signAnywayPaddle, "tool-left-behind-hazard");

    // ------------------------------------------------------------------ paperwork + gear
    const plan = holoPanel(g, 0.62, 0.42, -3.2, 1.5, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a079ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER · ENGINE 1", w * 0.06, h * 0.1);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("COUNT BEFORE AND AFTER", w * 0.06, h * 0.28);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Access port + finding: per the work order", "Lockout before the probe goes in",
       "Zero energy confirmed, not assumed", "Blanking plug back before power is restored",
       "Tool count matched before sign-off"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.42 + i * 0.1)));
    }, { ry: 0.5, accent: AVBS_ACCENT });
    reg(hits, plan, "work-order-board");

    const ppeRack = group(g, -3.4, 0, 1.0, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const glassesProp = box(ppeRack, 0.12, 0.04, 0.03, 0, 0.6, 0.05, 0xdfe6ea, { rough: 0.3, opacity: 0.6, transparent: true });
    holoTag(glassesProp, "safety glasses", 0, 0.14, 0, { css: "#a079ff", w: 0.32 });
    reg(hits, glassesProp, "safety-glasses-bs");
    const earProp = group(ppeRack, 0.2, 0.62, 0);
    ball(earProp, 0.08, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 12 });
    holoTag(earProp, "hearing protection", 0, 0.18, 0, { css: "#a079ff", w: 0.38 });
    reg(hits, earProp, "hearing-protection");
    const gloveProp = box(ppeRack, 0.16, 0.05, 0.1, -0.2, 0.6, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(gloveProp, "work gloves", 0, 0.16, 0, { css: "#a079ff", w: 0.3 });
    reg(hits, gloveProp, "work-gloves-bs");

    const closingLog = group(g, 3.3, 0, 1.6, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("SCOPE LOG\nOPEN", { bg: "#11181f", accent: "#a079ff", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "inspection log", 0, 1.34, 0, { css: "#a079ff", w: 0.28 });
    reg(hits, closingLog, "closing-log");

    const attendant = standingFigure(g, -1.2, -0.1, { ry: 2.0, cloth: 0x2b3138, helmet: 0xf2f2f2 });
    holoTag(attendant, "maintenance tech", 0, 1.95, 0.15, { css: "#a079ff", w: 0.34 });

    return {
      hits,
      footprint: 2.9,
      spawnLook: new THREE.Vector3(0, 1.3, 3.6),

      onInterrupt(it) {
        if (it.id === "video-feed-glitches") { glitchLight.visible = true; repaint(borescopeView.userData.screen, signFace("NO SIGNAL", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.4 })); }
        if (it.id === "coworker-reaches-for-ignition") { breakerOpen.material = mat(0xf0645b, { rough: 0.55, emissive: 0xf0645b, ei: 0.5 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "video-feed-glitches") { glitchLight.visible = false; repaint(borescopeView.userData.screen, signFace("SCANNING", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 })); }
        if (it.id === "coworker-reaches-for-ignition") { breakerOpen.material = mat(0x2b2f34, { rough: 0.55 }); }
      },
      onStepComplete(step) {
        if (step.id === "verify-zero-energy") {
          repaint(zeroEnergyMeter.userData.screen, signFace("ZERO", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (step.id === "find-defect") { bladeNick.material = mat(0x59c97b, { rough: 0.6, seg: 10 }); }
        if (step.id === "posttask-tool-count") { missingTool.visible = false; }
        if (step.id === "closeout-log") {
          repaint(closingLogFace, signFace("SCOPE LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },
      onHazard() {},

      animate(t, dt, session) {
        attendant.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "verify-zero-energy") {
          repaint(zeroEnergyMeter.userData.screen, signFace(gg.t > 0.44 && gg.t < 0.62 ? "ZERO" : "ENERGY", {
            bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
