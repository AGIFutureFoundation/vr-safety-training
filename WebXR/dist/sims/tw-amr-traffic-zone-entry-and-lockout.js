import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, lockTag,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { amrRobot } from "../../../shared/equipment.js";
import { palletRackBay, palletStack } from "../../../shared/props.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ AMR Traffic-Zone Entry & Lockout VR — Manufacturing &
// Automation, Teamsters warehouse and logistics automation.
//
// A pedestrian who steps into a marked AMR lane is trusting a safety
// scanner that has never met them personally, and the whole point of a
// traffic zone is that trust is never the plan — the gate interlock, the
// yield point, and the fleet controller's own eyes on the board are. This
// station walks the manual-access sequence a Teamsters warehouse associate
// actually uses to cross into a robot's floor: read the zone map, catch
// what is already wrong with it, request access at the gate rather than
// stepping past it, isolate and lock the charging dock's power before
// touching it, and mark the floor for every other robot in the fleet
// before starting hands-on work. No AMR fleet's stopping distance, scanner
// range or dock voltage is a number this platform is certain of — those
// live on the manufacturer's manual and the site's own zone risk
// assessment.

const TW1_PAL = palette("warehouse");
const AMR_ACCENT = 0x2f8fdb;

export const SIM_TW_AMR_TRAFFIC_ZONE_ENTRY_AND_LOCKOUT = {
  id: "tw-amr-traffic-zone-entry-and-lockout",
  index: "tw-1",
  domain: "Warehousing & Logistics",
  trade: "Teamsters warehouse associate — automated traffic-zone entry",
  category: "Manufacturing & Automation",
  indoor: "garage",
  certification: "Teamsters warehouse and logistics automation training; OSHA 29 CFR 1910.147 the control of hazardous energy and 29 CFR 1910.212 machine guarding; ANSI R15.06 and ISO 10218 for industrial robots and robot systems, worked the way a site's own robot-cell risk assessment applies them to a mobile-robot floor; NIOSH findings on struck-by incidents around automated material handling",
  name: "AMR Traffic-Zone Entry & Lockout",
  title: simTitle("AMR Traffic-Zone Entry & Lockout"),
  tagline: "Crossing into a live autonomous-mobile-robot floor the way the zone is actually built for it: the map read and checked for what is already wrong, access requested at the gate rather than stepped past, the charging dock's power isolated and locked before anyone touches it, and the floor marked for the rest of the fleet before hands-on work starts",
  accent: AMR_ACCENT,
  accentCss: "#2f8fdb",
  parSeconds: 260,
  footprint: 2.6,
  badge: { id: "amr-zone-certified", name: "AMR Zone Certified", note: "Read the zone honestly, requested access instead of stepping past the gate, isolated and locked the dock before touching it, and marked the floor before working" },

  game: system({
    name: "Zone Access Control",
    currency: "CLEARANCE",
    ranks: ["Floor Visitor", "Zone Aware", "Manual-Access Handler", "Zone Access Authority", "AMR Zone Certified"],
    badges: [
      { id: "never-step-past-the-gate", name: "Never Step Past the Gate", note: "Requested access every time, first try", test: AWARD.stepClean("gate-request") },
      { id: "locked-before-touched", name: "Locked Before Touched", note: "Isolated and locked the dock before the first hands-on step", test: AWARD.stepClean("dock-loto") },
      { id: "steady-clearance", name: "Steady Clearance", note: "Held the clearance test near band centre all shift", test: AWARD.precise(0.72) },
      { id: "clean-walk", name: "Clean Walk", note: "Never missed a hazard on the zone read", test: AWARD.stepClean("zone-hazard-read") },
    ],
    challenges: [
      { id: "quick-entry", name: "Quick Entry", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "access-streak", name: "Access Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your Teamsters local's member assistance programme, or the site's employee assistance line if a close call with a moving robot is what stayed with you",

  hazards: {
    "gap-walk-hazard": "That is the gap in the barrier where the tape has worn thin — the shortcut every busy associate is tempted by instead of walking the marked crossing to the gate. A scanner tuned to the marked lane has no reason to expect a body coming through a gap it was never told about, and the fleet controller's board shows the crossing as clear the whole time someone is standing in it.",
    "bypass-interlock-hazard": "That is the taped-open bypass on the gate interlock, left from the last time someone was in a hurry. An interlock held open no longer proves the aisle is clear before the gate releases — it just opens, every time, whether or not a robot is mid-approach on the other side.",
    "skip-loto-hazard": "That is the quick-power lever that skips isolating and locking the charging dock before anyone reaches into it. A dock that looks powered down because its display is dark can still have a live bus behind the panel — the isolator and the lock are what make that assumption provable instead of hoped for.",
    "override-scanner-hazard": "That is the override key left seated in the safety scanner's muting switch. Muting the scanner clears its detection field on purpose, for the one job that is supposed to need it — leaving the key seated means the next person to walk in front of it gets treated as invisible by a robot that would otherwise have stopped for them.",
  },

  lateNotes: {
    "gate-arm": "Access gets requested at the gate and the green release waited for, not assumed from how quiet the zone sounds.",
    "dock-isolator": "The dock's power gets isolated and locked before a hand goes near the connector, not checked by touch after the fact.",
  },

  interrupts: [
    {
      id: "amr-reroute-fault",
      kind: "AMR fault stop",
      after: "yield-hold", delay: 4, seconds: 12,
      alert: "An AMR in the zone has stopped short with its beacon flashing fault red — something in its path it did not expect.",
      cue: "Report the fault to the fleet controller board rather than waving the robot through or walking around it.",
      target: "fleet-board",
      why: "A robot stopped on a fault is a robot that has already decided something is wrong with what it is sensing, and reporting it to the controller is what gets a person with the fleet's own diagnostics looking at it — waving it through or working around it treats a safety stop as an inconvenience instead of the warning it is.",
      missNote: "The fault stop was left unreported. A fleet controller who never hears about a fault stop cannot tell a one-off sensor glitch from a robot that is about to do the same thing again on someone standing closer to it.",
      wrongNote: "Not that — the fault has to go to the fleet controller board before anything else about this stop matters.",
    },
    {
      id: "gate-interlock-fault",
      kind: "Gate interlock fault",
      after: "gate-request", delay: 3, seconds: 12,
      alert: "The pedestrian gate's interlock light has gone to red and stayed there — the gate is not releasing on this request.",
      cue: "Hold at the gate and call it in. Do not climb or force the gate open.",
      target: "gate-call-in",
      why: "An interlock that fails red is failing the way it is supposed to — closed — and forcing it open defeats the one control standing between a person and a lane a robot still believes is theirs; calling it in is what gets the gate looked at instead of defeated.",
      missNote: "The gate was forced instead of called in. A gate forced open once is a gate an associate learns to force again, and the second time there may actually be a robot on the other side of it.",
      wrongNote: "Not that — a red interlock gets called in, not climbed.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "steel-toe-boots"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "steel-toe-boots": "steel-toe boots" },
      title: "Suit up before entering the floor",
      cue: "Hi-vis vest and steel-toe boots before stepping anywhere near the marked lanes.",
      why: "An AMR's scanner is tuned for a person-shaped obstruction, not for a specific colour, but the hi-vis vest is what makes an associate visible to every other person and every powered industrial truck sharing this floor — the boots are what a dropped case or a caught foot does not get to end badly.",
    },
    {
      id: "zone-map-read", kind: "select", target: "zone-map-board",
      title: "Read the zone map",
      cue: "Confirm today's traffic-zone map before crossing into the lane.",
      why: "The map is what tells an associate where the marked lanes, the yield points and the pedestrian gate actually are today — a zone gets re-taped when the floor plan changes, and working from yesterday's mental picture is how a person ends up standing exactly where a robot's path says they will not be.",
    },
    {
      id: "zone-hazard-read", kind: "find", noHint: true,
      targets: ["gap-walk-hazard", "bypass-interlock-hazard", "override-scanner-hazard"],
      itemNames: {
        "gap-walk-hazard": "worn gap in the lane barrier",
        "bypass-interlock-hazard": "bypass taped open on the gate interlock",
        "override-scanner-hazard": "override key left in the scanner",
      },
      itemNotes: {
        "gap-walk-hazard": "A gap in the barrier is a crossing the scanner was never told to expect — it gets taped shut before anyone uses this zone, not stepped through.",
        "bypass-interlock-hazard": "A taped-open interlock releases the gate whether or not a robot is actually clear of it — it gets pulled before the gate is trusted again.",
        "override-scanner-hazard": "A key left seated in the mute switch is a scanner running blind for whoever walks in front of it next — it comes out and goes back to whoever is authorised to hold it.",
      },
      decoyNotes: {
        "spare-scanner-panel": "That spare scanner access panel is seated and latched, showing no damage. Nothing to flag there.",
      },
      title: "Read the zone for what is already wrong with it",
      cue: "Look around the entry before crossing. Three things are already wrong with this zone — find them.",
      why: "A zone that looks fine from the gate is not the same thing as one an associate has actually checked — a worn gap, a taped bypass or a seated override key each quietly cancels the one control they were built to provide, and finding them now costs a maintenance ticket instead of costing someone the moment a robot assumes they are not there.",
    },
    {
      id: "gate-request", kind: "select", target: "gate-reader",
      title: "Request access at the gate",
      cue: "Badge in at the reader and wait for the gate's own green release.",
      why: "Requesting access is what tells the fleet controller a person is about to be on the floor, so the system can hold or reroute traffic around the crossing — stepping past the gate without requesting it means every robot on this floor is still operating on the assumption that the lane is pedestrian-free.",
    },
    {
      id: "gate-cross", kind: "turn", target: "gate-arm",
      title: "Cross once the gate releases",
      cue: "Turn the gate arm through once the interlock shows green, not before.",
      why: "The gate arm only turns freely once the interlock has actually confirmed the lane clear — forcing it early is forcing past the one mechanical proof that a robot is not mid-approach on the other side.",
      turn: { turns: 0.5, axis: "y", label: "GATE ARM" },
    },
    {
      id: "yield-hold", kind: "hold", target: "yield-marker", seconds: 6,
      title: "Hold at the yield point",
      cue: "Stand on the marked yield point and hold until the crossing AMR has fully cleared.",
      why: "The yield point is placed where a robot's own sensors have the most room to see a person and route around them — stepping off it early, while a robot is still mid-pass, puts an associate back into the margin the zone was designed to remove.",
      holdBreakNote: "Stepped off the yield point before the robot cleared. The margin the yield point buys only exists for as long as someone actually stands on it.",
    },
    {
      id: "scanner-field-check", kind: "gauge", target: "scanner-post",
      title: "Confirm the safety scanner's field",
      cue: "Read the scanner's field indicator and commit only while it shows clear.",
      why: "A safety scanner's detection field is either actively watching the approach or it is not, and the indicator is the only honest way to know which — trusting that it is probably fine because the floor looks empty is exactly the assumption the indicator exists to replace.",
      gauge: {
        label: "SCANNER FIELD", speed: 0.55, green: [0.42, 0.64],
        readout: (t) => (t < 0.42 ? "field degraded — do not proceed" : t > 0.64 ? "field muted — do not proceed" : "field active and clear"),
        missNote: "The field was not reading active and clear. Do not proceed into the lane on a degraded or muted scanner.",
      },
    },
    {
      id: "dock-loto", kind: "sequence", anyOrder: false,
      targets: ["dock-isolator", "dock-lock", "dock-tag"],
      itemNames: { "dock-isolator": "dock power isolator", "dock-lock": "personal lock", "dock-tag": "danger tag" },
      title: "Isolate and lock the charging dock",
      cue: "Isolate the dock's power, apply your own lock, then apply the tag — in that order.",
      why: "The isolator alone can be re-energised by anyone who does not know a person is working past it; the lock is what makes that impossible without that person's own key, and the tag is what tells the next person walking by why the lock is there at all — skip any one of the three and the other two are only half a control.",
      outOfOrderNote: "Isolate, then lock, then tag — a lock with nothing isolated behind it, or a tag with no lock behind it, protects nobody.",
    },
    {
      id: "clearance-test", kind: "track", target: "clearance-target", seconds: 8,
      title: "Prove the manual-zone clearance",
      cue: "Advance the test target while keeping its distance from the scanner above the marked minimum the whole time.",
      why: "Proving the clearance with the test target under control is what confirms the manual zone is actually being honoured before a body relies on it — letting the distance close past the marked minimum even once is the exact failure the marked minimum exists to prevent.",
      track: {
        start: 0.75, green: [0.42, 0.9], rise: 0.4, fall: 0.55, drift: -0.12,
        label: "SCANNER CLEARANCE",
        readout: (v) => (v < 0.42 ? "clearance lost — too close" : v > 0.9 ? "test target lost the field" : "clearance held"),
      },
      holdBreakNote: "The clearance closed past the marked minimum. Bring the test target back under control before continuing.",
    },
    {
      id: "barrier-place", kind: "drag", target: "manual-zone-sign",
      title: "Mark the floor for the rest of the fleet",
      cue: "Carry the manual-zone sign to the marked spot at the dock before starting hands-on work.",
      why: "The fleet's routing only avoids a manual zone it has actually been told about — the sign at the marked spot is what tells every other robot and every other associate that this dock is occupied by hands-on work, not just what the person doing that work happens to know.",
      drag: { to: "manual-zone-socket", radius: 0.4, missNote: "Not on the marked spot — the sign only tells the fleet anything if it sits exactly where the floor mark says." },
    },
    {
      id: "notify-fleet", kind: "select", target: "fleet-board",
      title: "Notify the fleet controller",
      cue: "Confirm the fleet controller board shows this dock as a manual zone before leaving the gate.",
      why: "The board is the fleet controller's whole picture of the floor — an associate who marks the floor but never confirms the board shows it is trusting a sign a controller three screens deep in a shift may never actually see.",
    },
    {
      id: "closing-log", kind: "select", target: "closing-log",
      title: "Sign the zone entry log",
      cue: "Sign the entry log before the shift moves on to the next task.",
      why: "The signed log is the record that this specific entry, on this specific dock, was actually done by the procedure — not assumed fine because the last associate through this gate usually does it right.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, AMR_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.86 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d7379", base2: "#5f656b", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.86, metal: 0.06, color: TW1_PAL.ground },
    );
    // Marked AMR lane down the centre, safety-yellow border stripes.
    box(g, 1.6, 0.005, 5.4, 0, 0.145, -0.2, 0x2b2f34, { rough: 0.8, cast: false });
    for (const sx of [-0.82, 0.82]) box(g, 0.06, 0.007, 5.4, sx, 0.148, -0.2, TW1_PAL.accent, { rough: 0.6, cast: false });
    // Yield point marking near the gate.
    box(g, 0.7, 0.007, 0.7, 0.9, 0.148, 1.1, TW1_PAL.accent, { rough: 0.6, opacity: 0.85, transparent: true, cast: false });
    const yieldMarker = group(g, 0.9, 0.15, 1.1);
    cyl(yieldMarker, 0.28, 0.28, 0.006, 0, 0, 0, TW1_PAL.accent, { rough: 0.6, opacity: 0.01, transparent: true, cast: false, seg: 16 });
    reg(hits, yieldMarker, "yield-marker");

    // ------------------------------------------------------------------ AMR + robot
    const amr = amrRobot(g, -0.2, 0.14, -1.6, { ry: 3.1, livery: { colour: AMR_ACCENT, fleetName: "FLEET NAV", unitNumber: "AMR-14" } });
    const { statusRing } = amr.userData.parts;
    holoTag(amr, "AMR-14", 0, 0.9, 0, { css: "#2f8fdb", w: 0.28 });

    // ------------------------------------------------------------------ pedestrian gate
    const gatePost = group(g, 0.9, 0, 1.7);
    cyl(gatePost, 0.05, 0.05, 1.1, 0, 0.55, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 12 });
    const gateArm = group(gatePost, 0, 1.0, 0);
    box(gateArm, 1.0, 0.05, 0.05, 0.5, 0, 0, TW1_PAL.accent, { rough: 0.5, finish: "painted" });
    reg(hits, gateArm, "gate-arm");
    const interlockLight = ball(gatePost, 0.045, 0, 0.85, 0, 0x8a2020, { emissive: 0x000000, ei: 1, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(gatePost, "gate interlock", 0, 1.2, 0, { css: "#2f8fdb", w: 0.32 });

    const gateReader = group(g, 0.55, 0, 1.7, 0.3);
    box(gateReader, 0.1, 0.16, 0.03, 0, 1.05, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const readerLight = ball(gateReader, 0.02, 0, 1.1, 0.02, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 1.0, rough: 0.4, seg: 10, seg2: 8 });
    holoTag(gateReader, "badge reader", 0, 1.3, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, gateReader, "gate-reader");

    const gateCallIn = group(g, 0.3, 0, 2.0, 0.3);
    box(gateCallIn, 0.12, 0.2, 0.05, 0, 1.1, 0, 0xd2312b, { rough: 0.5 });
    decal(gateCallIn, 0.1, 0.06, 0, 1.16, 0.026, signFace("CALL IN", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    holoTag(gateCallIn, "gate call-in", 0, 1.35, 0, { css: "#2f8fdb", w: 0.32 });
    reg(hits, gateCallIn, "gate-call-in");

    // The worn gap in the barrier — the shortcut hazard.
    const gapHazard = group(g, 1.9, 0, 1.7);
    box(gapHazard, 0.5, 0.02, 0.3, 0, 0.01, 0, TW1_PAL.accent, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    reg(hits, gapHazard, "gap-walk-hazard");

    // The taped-open interlock bypass.
    const bypassHazard = group(gatePost, 0.06, 0.6, 0.02);
    box(bypassHazard, 0.06, 0.03, 0.01, 0, 0, 0, 0xd8c98a, { rough: 0.6, opacity: 0.75, transparent: true });
    reg(hits, bypassHazard, "bypass-interlock-hazard");

    // ------------------------------------------------------------------ safety scanner
    const scannerPost = group(g, -1.0, 0, 1.0, 0.4);
    cyl(scannerPost, 0.05, 0.06, 0.9, 0, 0.45, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 12 });
    box(scannerPost, 0.14, 0.14, 0.1, 0, 0.88, 0, 0x1c1e21, { rough: 0.45, metal: 0.4 });
    holoTag(scannerPost, "safety scanner", 0, 1.05, 0, { css: "#2f8fdb", w: 0.34 });
    reg(hits, scannerPost, "scanner-post");
    const overrideKey = group(scannerPost, 0.09, 0.86, 0.02);
    cyl(overrideKey, 0.008, 0.008, 0.06, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.85, seg: 8 });
    reg(hits, overrideKey, "override-scanner-hazard");
    const spareScannerPanel = group(scannerPost, -0.09, 0.7, 0.02);
    box(spareScannerPanel, 0.08, 0.1, 0.015, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    reg(hits, spareScannerPanel, "spare-scanner-panel");

    const clearanceTarget = group(g, -1.0, 0.14, 0.0);
    box(clearanceTarget, 0.18, 0.4, 0.18, 0, 0.2, 0, 0xf0b323, { rough: 0.6, finish: "painted" });
    holoTag(clearanceTarget, "test target", 0, 0.6, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, clearanceTarget, "clearance-target");

    // ------------------------------------------------------------------ charging dock
    const dockCab = group(g, 2.0, 0, -0.6, -0.3);
    box(dockCab, 0.6, 0.9, 0.32, 0, 0.55, 0, 0xd8d9d4, { rough: 0.5, finish: "painted" });
    holoTag(dockCab, "charging dock", 0, 1.0, 0, { css: "#2f8fdb", w: 0.34 });
    const isolatorHandle = group(dockCab, -0.35, 0.6, 0.18);
    box(isolatorHandle, 0.05, 0.14, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    reg(hits, isolatorHandle, "dock-isolator");
    // The associate's own lock and tag, staged ready to apply.
    const lockProp = group(dockCab, -0.2, 0.35, 0.19);
    box(lockProp, 0.03, 0.04, 0.017, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    cyl(lockProp, 0.018, 0.018, 0.03, 0, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.85, seg: 10 });
    reg(hits, lockProp, "dock-lock");
    const tagProp = group(dockCab, -0.05, 0.35, 0.19);
    decal(tagProp, 0.05, 0.07, 0, 0, 0.006, signFace("TAG", { bg: "#f4e9d8", accent: "#b81410", scale: 0.6 }));
    reg(hits, tagProp, "dock-tag");
    const lockedTag = lockTag(dockCab, -0.12, 0.35, 0.19, { ry: 0.2 });
    lockedTag.visible = false;

    const skipLever = box(dockCab, 0.09, 0.06, 0.02, 0.24, 0.75, 0.17, 0xd2312b, { rough: 0.5 });
    decal(skipLever, 0.08, 0.05, 0, 0, 0.011, signFace("SKIP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    reg(hits, skipLever, "skip-loto-hazard");

    // ------------------------------------------------------------------ zone dressing
    const rackBackdropL = palletRackBay(g, -2.9, 0.14, -2.6, { ry: 0 });
    holoTag(rackBackdropL, "storage aisle 4", 0, 4.4, 0, { css: "#2f8fdb", w: 0.34 });
    const rackBackdropR = palletRackBay(g, 2.9, 0.14, -2.6, { ry: Math.PI });
    holoTag(rackBackdropR, "storage aisle 5", 0, 4.4, 0, { css: "#2f8fdb", w: 0.34 });
    const idleAmr1 = amrRobot(g, -1.6, 0.14, 2.3, { ry: 2.4, livery: { colour: 0x8b929a, fleetName: "FLEET NAV", unitNumber: "AMR-07" } });
    holoTag(idleAmr1, "AMR-07", 0, 0.9, 0, { css: "#2f8fdb", w: 0.28 });
    const idleAmr2 = amrRobot(g, 1.9, 0.14, -2.4, { ry: 0.4, livery: { colour: 0x8b929a, fleetName: "FLEET NAV", unitNumber: "AMR-22" } });
    holoTag(idleAmr2, "AMR-22", 0, 0.9, 0, { css: "#2f8fdb", w: 0.28 });
    palletStack(g, -1.4, 0, 2.9, { ry: 0.3 });
    palletStack(g, 2.9, 0, -0.6, { ry: -0.4 });

    // ------------------------------------------------------------------ crew, boards
    const fleetController = standingFigure(g, -2.4, 1.4, { ry: 1.1, cloth: 0x2b3138, vest: TW1_PAL.accent, helmet: 0xf2f2f2 });
    holoTag(fleetController, "fleet controller", 0, 1.95, 0.15, { css: "#2f8fdb", w: 0.34 });

    const associate = standingFigure(g, 1.5, 2.35, { ry: -1.3, cloth: 0x37505f, vest: TW1_PAL.accent, helmet: 0xf2c14b });
    holoTag(associate, "warehouse associate", 0, 1.95, 0.15, { css: "#2f8fdb", w: 0.36 });

    const fleetBoard = holoPanel(g, 0.62, 0.42, -2.6, 1.5, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FLEET CONTROLLER", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DOCK 6 — CLEAR", w * 0.06, h * 0.36);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["AMR-14: nominal", "Manual zones: none active"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.16)));
    }, { ry: 0.6, accent: AMR_ACCENT });
    reg(hits, fleetBoard, "fleet-board");

    const zoneMap = holoPanel(g, 0.58, 0.4, 2.7, 1.5, 1.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ZONE MAP — DOCK 6", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Lane: centre, yellow border", "Yield point: at the gate", "Manual zone: mark before entry"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: -0.7, accent: AMR_ACCENT });
    reg(hits, zoneMap, "zone-map-board");

    const closingLog = group(g, 2.6, 0, 1.0, 0.5);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("ZONE ENTRY LOG\nOPEN", { bg: "#11181f", accent: "#2f8fdb", scale: 0.28 }), { px: 320 });
    holoTag(closingLog, "entry log", 0, 1.3, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, closingLog, "closing-log");

    // Manual-zone sign, staged until dragged to the dock.
    const signStage = group(g, 0.1, 0, -3.0, 0.3);
    box(signStage, 0.05, 0.9, 0.05, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const signBoard = box(signStage, 0.4, 0.32, 0.02, 0, 0.9, 0, TW1_PAL.accent, { rough: 0.6, finish: "painted" });
    decal(signStage, 0.36, 0.28, 0, 0.9, 0.021, signFace("MANUAL\nZONE", { bg: "#5a3d0f", accent: "#ffffff", scale: 0.4 }));
    holoTag(signStage, "manual-zone sign", 0, 1.15, 0, { css: "#2f8fdb", w: 0.34 });
    reg(hits, signStage, "manual-zone-sign");
    void signBoard;

    const signSocket = group(dockCab, 0.3, 0, 0.4);
    hits["manual-zone-socket"] = signSocket;

    // PPE staged at the entry.
    const ppeRack = group(g, -2.8, 0, 2.1, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, TW1_PAL.accent, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const bootsProp = group(ppeRack, 0.2, 0.06, 0);
    box(bootsProp, 0.1, 0.12, 0.24, 0, 0, 0, 0x2b2318, { rough: 0.75, finish: "rubber" });
    holoTag(bootsProp, "steel-toe boots", 0, 0.2, 0, { css: "#2f8fdb", w: 0.36 });
    reg(hits, bootsProp, "steel-toe-boots");

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "amr-reroute-fault") {
          statusRing.children[0].material = mat(0xd2312b, { emissive: 0xc01810, ei: 1.4, rough: 0.4 });
          amr.rotation.y += 0.35;
        }
        if (it.id === "gate-interlock-fault") {
          interlockLight.material = mat(0xd2312b, { emissive: 0xc01810, ei: 1.5, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "amr-reroute-fault") {
          statusRing.children[0].material = mat(0x4fd1ff, { emissive: 0x2f8fdb, ei: 1.2, rough: 0.4 });
          amr.rotation.y -= 0.35;
        }
        if (it.id === "gate-interlock-fault") {
          interlockLight.material = mat(0x2f7d4a, { emissive: 0x2f7d4a, ei: 1.4, rough: 0.4 });
        }
      },
      onStepComplete(step) {
        if (step.id === "zone-hazard-read") {
          gapHazard.children[0].material = mat(0x59c97b, { rough: 0.7, opacity: 0.2, transparent: true, cast: false });
          bypassHazard.children[0].material = mat(0x59c97b, { rough: 0.6, opacity: 0.3, transparent: true });
          overrideKey.children[0].visible = false;
        }
        if (step.id === "gate-request") { readerLight.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 1.2, rough: 0.4 }); }
        if (step.id === "gate-cross") { interlockLight.material = mat(0x2f7d4a, { emissive: 0x2f7d4a, ei: 1.4, rough: 0.4 }); }
        if (step.id === "dock-loto") { lockProp.visible = false; tagProp.visible = false; lockedTag.visible = true; }
        if (step.id === "barrier-place") { signStage.visible = false; }
        if (step.id === "notify-fleet") {
          repaint(fleetBoard.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#8fb3c4";
            ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("FLEET CONTROLLER", w * 0.06, h * 0.14);
            ctx.fillStyle = "#f0b323";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("DOCK 6 — MANUAL", w * 0.06, h * 0.36);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillStyle = "#a9c6d6";
            ["AMR-14: rerouted around dock 6", "Manual zone: active, dock 6"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.58 + i * 0.16)));
          });
        }
        if (step.id === "closing-log") {
          repaint(closingLogFace, signFace("ZONE ENTRY LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.28 }));
        }
      },

      animate(t, dt, session) {
        fleetController.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        associate.userData.head.rotation.y = Math.sin(t * 0.6 + 1) * 0.4;
        if (!session?.finished && session?.step?.id !== "clearance-test") {
          amr.position.z = -1.6 + Math.sin(t * 0.35) * 0.5;
        }
        void dt;
      },
    };
  },
};
