import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, lockTag, reg, surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fish Screen Maintenance VR — Water & Environmental, Bay
// Restoration & Cleanup pack C.
//
// Servicing a positive-barrier fish screen on a generic tidal diversion
// intake — not any one intake, and no claim about any one district's
// history. The screen exists so water can be drawn off the slough without
// drawing fish off with it, and every hazard on this job sits on one of two
// sides of the same lockout: the rotating drum and its drive motor kill or
// maim exactly like any other piece of rotating machinery the moment a hand
// or a sleeve gets near it under power, and the fish this screen exists to
// protect are the reason the crew cannot simply shut the intake off and
// walk away from the bypass while the work gets done at its own pace.

const BRFS_ACCENT = 0x5f9e5a;
const BRFS_FLAG = 0xe8622a;

export const SIM_BR_FISH_SCREEN_MAINTENANCE = {
  id: "br-fish-screen-maintenance",
  index: "br-c7",
  domain: "Environmental",
  trade: "Water diversion technician — fish screen maintenance crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "IUOE Local 3 operating engineers — fish screen mechanical maintenance; LIUNA Local 261 laborers — screen cleaning and debris crew; OSHA 29 CFR 1910.147 lockout/tagout of the screen drive motor; OSHA 29 CFR 1926 general construction safety; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; California Department of Fish and Wildlife fish screening criteria under the Fish and Game Code; U.S. Fish and Wildlife Service Endangered Species Act fish passage protections; work window per the permit",
  name: "Fish Screen Maintenance",
  title: simTitle("Fish Screen Maintenance"),
  tagline: "Servicing a positive-barrier fish screen on a tidal diversion intake: the drive motor locked out before anyone works the drum, the approach velocity read before and after, fouling found and cleared, a torn panel patched and cross-torqued back down, the bypass opened the moment a debris surge hits, and the lock never comes off until every hand is confirmed clear",
  accent: BRFS_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 320,
  footprint: 2.7,
  badge: { id: "screen-clear", name: "Screen Clear And Locked Right", note: "LOTO applied and removed clean, approach velocity true both times, nobody near the drum under power — first time" },

  game: system({
    name: "Screen Crew",
    currency: "MESH",
    ranks: ["Laborer", "Technician", "Lead Technician", "Site Steward", "Fish Screen Certified"],
    badges: [
      { id: "no-energy", name: "No Stored Energy", note: "Never a hazard, the drive motor locked out for the whole job", test: AWARD.safe },
      { id: "velocity-true", name: "Velocity Read True", note: "Approach velocity and motor startup both read inside the working band", test: AWARD.precise(0.7) },
      { id: "screen-first", name: "Screen Read Clean", note: "Access points and the first velocity reading both read clean before LOTO was applied", test: AWARD.stepClean("loto-apply") },
    ],
    challenges: [
      { id: "clean-screen", name: "Clean Screen", note: "No corrections across the whole maintenance run", test: AWARD.clean },
      { id: "steady-startup", name: "Steady Startup", note: "Held the motor startup inside the working band the whole ramp", test: AWARD.unbroken },
      { id: "screen-fast", name: "Screen Cleared Fast", note: "Maintenance closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "energize-without-loto": "You reached into the drum screen mechanism before the drive motor was locked out. A screen drum this size turns on stored momentum even after power is cut, and reaching into it on the assumption that it is off because it looks still is exactly how a hand or a sleeve gets pulled into a mechanism that was never actually isolated in the first place.",
    "bare-hand-mesh-edge": "You handled the torn screen mesh bare-handed instead of gloving up first. Perforated screen mesh is stamped and cut metal, and a torn edge is sharper than the intact panel around it — a laceration from mesh like this is a clean, deep cut that happens faster than a bare hand can react to it.",
    "remove-loto-without-confirm": "You pulled your lock and tag and moved to restart the motor without confirming every crew member was clear and accounted for. A group lockout only works when the last lock off the disconnect is the signal that everyone who put one on is actually clear — restarting on an assumption instead of a headcount is exactly how a second technician still inside the enclosure gets caught by a drum that starts turning underneath them.",
    "work-near-water-no-pfd": "You leaned out over the forebay to reach the screen face without the PFD staged for exactly this. The water beside a diversion intake moves toward the intake by design, and a slip into it here is a slip toward the one place on this structure built to pull things in, not push them back out.",
  },

  lateNotes: {
    "disconnect-switch": "Apply the lock and tag only after the access points are confirmed and the first velocity reading is taken — locking out blind, before the crew knows what state the screen is actually in, just wastes the one clean reading available before the work starts.",
    "drum-crank": "Index the drum only after the disconnect is locked and tagged — cranking it by hand before the lockout is confirmed is exactly the moment the drive could still be live.",
    "disconnect-switch-2": "Remove the lock only after every panel bolt is torqued back down — pulling it early just means restarting a screen that is not actually buttoned back up yet.",
  },

  // Interruptions: see shared/game.js. The first is exactly what a storm
  // drain does to a screen mid-cleaning; the second is the group lockout
  // doing the one job it exists to do.
  interrupts: [
    {
      id: "debris-surge-during-cleaning",
      kind: "Debris surge hits the screen mid-cleaning",
      after: "debris-haul", delay: 3, seconds: 13,
      alert: "A surge of storm debris has hit the screen face while the crew is still cleaning it, and the head loss across the screen is climbing fast.",
      cue: "Open the bypass gate now — the screen needs relief before the head loss climbs any further.",
      target: "bypass-gate",
      why: "A fish screen under rising head loss is a screen where the approach velocity at whatever mesh is still clear keeps climbing past what a fish can swim against, and the bypass is what gives the flow somewhere else to go while the crew finishes clearing the face — opening it now is what keeps the surge from turning a cleaning job into an impingement event.",
      missNote: "The head loss kept climbing while the crew finished the section they were on, and the approach velocity across the remaining clear mesh went well past the band this screen is designed to hold before anyone opened the bypass to relieve it.",
      wrongNote: "That is not it. The bypass gate is what relieves the screen under a debris surge — nothing else on this structure gives the flow somewhere else to go.",
    },
    {
      id: "second-worker-in-enclosure",
      kind: "Second worker discovered still inside the screen enclosure",
      after: "loto-remove", delay: 3, seconds: 12,
      alert: "A second technician is still inside the screen enclosure, tools in hand, when the restart sequence is about to begin.",
      cue: "Hit the restart estop now. Nothing turns over while somebody is still inside the enclosure.",
      target: "restart-estop",
      why: "The whole point of a group lockout is that the last lock coming off is supposed to mean every hand is out and accounted for — finding out that assumption was wrong after the restart sequence has already begun is exactly the gap the estop exists to close before the drum ever turns over on the technician still inside.",
      missNote: "The restart sequence continued and the drum began to turn while the second technician was still inside the enclosure — the exact failure a group lockout's headcount step exists to catch before it ever becomes a real injury instead of a close call.",
      wrongNote: "It's the restart estop. Nothing else on this panel stops the sequence before the drum turns over on somebody still inside.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "maintenance-plan-board",
      title: "Check the maintenance plan and lockout procedure before staging",
      cue: "Read the fish screening criteria, the 404 and 401 conditions, and the lockout/tagout procedure before any tool is staged.",
      why: "This screen is maintained under the same conditions the whole diversion runs under — the Corps' Section 404 permit, the Water Board's 401 certification, and California Department of Fish and Wildlife's fish screening criteria — plus a lockout/tagout procedure that is not optional the moment anyone's hands go near the drive train, and a crew that skips the plan because 'it's just a cleaning' still answers for every condition on it.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-pfd", "stage-gloves", "stage-eye"],
      itemNames: { "stage-pfd": "life vest", "stage-gloves": "gloves", "stage-eye": "eye protection" },
      title: "Stage the screen crew's PPE",
      cue: "Life vest, gloves and eye protection before anyone works the intake platform.",
      why: "The platform sits directly over water moving toward the intake by design, and the vest is buoyancy the moment a slip puts somebody in it; gloves are for the screen mesh's own cut edges and whatever the debris rack has caught; eye protection is for whatever a cleaning brush or a wrench throws working this close to a grated deck.",
    },
    {
      id: "find-access", kind: "find", noHint: true,
      targets: ["screen-panel-1", "screen-panel-2", "screen-panel-3"],
      itemNames: { "screen-panel-1": "screen panel 1 — near", "screen-panel-2": "screen panel 2 — center", "screen-panel-3": "screen panel 3 — far" },
      itemNotes: {
        "screen-panel-1": "Panel 1 is the near access point. Today's inspection starts here, not wherever the fouling looks worst from the platform.",
        "screen-panel-2": "Panel 2 is the center access point — the check that every panel gets inspected in turn instead of just the ones easiest to reach.",
        "screen-panel-3": "Panel 3 is the far access point, closest to the drive housing.",
      },
      title: "Find the three access points along the screen face",
      cue: "Walk the platform and click the three panel access points the inspection is built from.",
      why: "A screen face this wide fouls unevenly, and a crew that only checks the easy near panel misses exactly the far section most likely to be restricting flow the worst — finding all three access points first is what turns today's inspection into a full-face check instead of a look at whatever was closest to the ladder.",
    },
    {
      id: "loto-apply", kind: "select", target: "disconnect-switch",
      title: "Lock out and tag the screen drive motor",
      cue: "Open the disconnect, apply your lock and tag, and verify zero energy before anyone works near the drum.",
      why: "A drum screen's drive train carries enough stored momentum to keep turning for a moment even after the disconnect opens, and the lock and tag are what turn 'the switch is off' into a fact every crew member can verify for themselves instead of a claim they have to take on faith from whoever flipped it.",
    },
    {
      id: "approach-velocity-check", kind: "gauge", target: "velocity-meter",
      title: "Read the approach velocity before opening the screen",
      cue: "Take the reading at the screen face and commit it inside the working band before the panels are opened.",
      why: "The approach velocity is the one number that tells the crew whether fish reaching this screen can still swim clear of it, and reading it before any cleaning starts is what gives every reading taken for the rest of the job a real baseline instead of a guess about how fouled the screen already was.",
      gauge: { label: "APPROACH VEL", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${(t * 0.6).toFixed(2)} ft/s`, missNote: "Outside the working band. Let the reading settle and commit again before the panels are opened." },
    },
    {
      id: "drum-drive-crank", kind: "turn", target: "drum-crank",
      title: "Hand-crank the drum into position",
      cue: "Turn the manual crank to index the drum screen so the fouled section faces the platform.",
      why: "With the drive locked out, the only way to bring a different section of the drum around to the platform is the manual crank built for exactly this — indexing it by hand is what lets the crew inspect and clean the whole drum's circumference without ever needing the drive motor live to do it.",
      turn: { turns: 0.8, axis: "y", label: "DRUM CRANK" },
    },
    {
      id: "find-fouling", kind: "find", noHint: true,
      targets: ["debris-clump", "torn-mesh"],
      itemNotes: {
        "debris-clump": "A mat of debris has built up against the mesh here, restricting flow through this section of the screen.",
        "torn-mesh": "The mesh has torn here — a gap this size is a gap fish-sized enough to be exactly what the screen exists to prevent.",
      },
      title: "Find the fouling and damage on the indexed section",
      cue: "Check the drum section now facing the platform for debris buildup and mesh damage.",
      why: "Debris buildup and a torn panel are two different problems with two different fixes, and finding both before starting either job is what keeps the crew from patching a tear and then discovering the debris behind it was the bigger restriction the whole time.",
    },
    {
      id: "debris-haul", kind: "drag", target: "debris-clump",
      title: "Clear the debris to the collection bin",
      cue: "Pull the debris mat clear of the mesh and haul it to the collection bin.",
      why: "Debris left against the mesh even after the visible clump is broken up keeps restricting flow through that section, and hauling it clear to the bin — not just off to the side of the platform — is what keeps it from washing straight back against the screen on the next surge.",
      drag: { to: "collection-bin", radius: 0.5, missNote: "Not at the bin — debris left short of it is debris the next surge can wash straight back onto the screen." },
    },
    {
      id: "mesh-patch-hold", kind: "hold", target: "mesh-patch", seconds: 5,
      title: "Hold the mesh patch steady while it's fastened",
      cue: "Hold the patch flat over the torn section while the second technician fastens it down.",
      why: "A patch that shifts while it's being fastened goes on crooked, and a crooked patch leaves the same gap at one edge that the original tear left across the whole section — held flat and steady until every fastener is in, it closes the gap the screen exists to not have.",
      holdBreakNote: "The patch shifted before it was fully fastened — reset it flat over the tear and hold until every fastener is set.",
    },
    {
      id: "bolt-torque", kind: "sequence",
      targets: ["panel-bolt-1", "panel-bolt-2", "panel-bolt-3"],
      itemNames: { "panel-bolt-1": "bolt 1 — top", "panel-bolt-2": "bolt 2 — bottom", "panel-bolt-3": "bolt 3 — center" },
      title: "Torque the access panel bolts in a cross pattern",
      cue: "Torque the bolts in order: top, then bottom, then center — never around the panel in sequence.",
      why: "A panel bolted down in a simple round-the-edge sequence pulls unevenly and can bow the panel enough to leave a gap at the last bolt tightened; a cross pattern draws the panel down flat and even, the same reason a wheel's lug nuts are never torqued in a simple circle either.",
      outOfOrderNote: "Top, then bottom, then center — a cross pattern, not a circle. Bolted in sequence around the edge, the panel bows before the last bolt ever seats.",
    },
    {
      id: "loto-remove", kind: "select", target: "disconnect-switch-2",
      title: "Remove the lock and tag with a confirmed headcount",
      cue: "Confirm every crew member is clear and accounted for, then remove your lock and tag from the disconnect.",
      why: "A group lockout is only as safe as its last step: every lock that went on has to come off with a confirmed headcount behind it, not a glance around the platform — the moment that confirmation is skipped is the moment a lockout stops actually protecting whoever might still be near the drum.",
    },
    {
      id: "motor-startup", kind: "track", target: "motor-panel", seconds: 7,
      title: "Monitor the motor through startup",
      cue: "Watch the startup current and hold it inside the safe ramp band as the motor comes up to speed.",
      why: "A drive motor's startup current spikes hard for a moment before settling, and holding attention on that ramp is what catches a motor straining against something still fouling the drum before it trips a breaker or, worse, keeps pushing against an obstruction it should have been shut down for instead.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "STARTUP", readout: (v) => (v < 0.36 ? "still ramping" : v > 0.58 ? "current too high" : "normal startup") },
      holdBreakNote: "The startup current drifted out of the safe band. Bring the ramp back under control before the motor reaches full speed.",
    },
    {
      id: "flow-verify", kind: "gauge", target: "velocity-meter-2",
      title: "Re-check the approach velocity after restart",
      cue: "Take the reading after the motor is back up to speed and commit it inside the working band.",
      why: "The only way to know the maintenance actually fixed the restriction the crew found is to read the same measurement again under the same running conditions — a screen that reads clean now, after the patch and the cleaning, is a screen this crew can actually sign off on instead of one they are hoping is better.",
      gauge: { label: "APPROACH VEL", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${(t * 0.6).toFixed(2)} ft/s`, missNote: "Still outside the working band. Let the reading settle and commit again before signing off." },
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["loose-bolt-flag", "unlatched-hatch"],
      itemNotes: {
        "loose-bolt-flag": "A bolt on the platform grating sits proud instead of flush — click it to confirm the crew catches it before a boot does.",
        "unlatched-hatch": "The access hatch cover was never latched back down after the crank work.",
      },
      title: "Walk the platform and confirm nothing is left open",
      cue: "Check the proud bolt and the unlatched hatch before the crew calls this job done.",
      why: "A loose bolt or an unlatched hatch on a grated platform over moving water is easy to miss once the crew's attention has moved to signing off the readings — walking the platform now, before anyone leaves, is the last chance to catch what the next person on this deck would otherwise find with a misstep instead.",
    },
    {
      id: "log-maintenance", kind: "select", target: "closing-log",
      title: "Log the day's maintenance",
      cue: "Record the panels inspected, the velocity readings, the repair made, and the lockout status for the crew's record.",
      why: "The next crew on this screen reads today's log, not today's memory of it — a maintenance visit that went clean but was never logged looks, from the record, exactly like a screen nobody has checked, and a velocity reading that was never written down is a fact the next inspection has no way to confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, BRFS_ACCENT);

    // ---------------------------------------------------------------- terrain
    // A grated steel platform toward +z where the crew stages, the screen
    // face and drum spanning the intake in the middle, a calm forebay to one
    // side and the bypass channel to the other.
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3c4248", base2: "#33383d" }), { repeat: 4, px: 256 });
    const deckBase = box(g, 6.0, 0.32, 1.2, 0, 0.16, 1.9, 0x3c4248, { rough: 0.85 });
    void deckBase;
    const deck = box(g, 6.0, 0.02, 1.2, 0, 0.321, 1.9, 0x3c4248, { rough: 0.8, cast: false });
    deck.material = texturedMat(deckTex, { rough: 0.8, color: 0x9aa0a4 });

    const forebayTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#123542", mid: "#164055", base2: "#0e2a34" }), { repeat: 3, px: 256 });
    const forebay = box(g, 2.6, 0.03, 1.6, -1.8, -0.12, 0.2, 0x164055, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    forebay.material = texturedMat(forebayTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    forebay.material.transparent = true;
    forebay.material.opacity = 0.88;

    const bypassTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#0f2e3a", base2: "#0a1f29" }), { repeat: 3, px: 256 });
    const bypass = box(g, 2.6, 0.03, 1.6, 1.8, -0.12, 0.2, 0x0f2e3a, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    bypass.material = texturedMat(bypassTex, { rough: 0.2, metal: 0.25, color: 0x1e5060 });
    bypass.material.transparent = true;
    bypass.material.opacity = 0.88;
    const wave = particles(g, 20, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(-1.8, -0.1, 0.2);
    const bypassWave = particles(g, 16, 0xbfe6f2, { size: 0.03, life: 0.8, additive: false, opacity: 0.35 });
    bypassWave.position.set(1.8, -0.1, 0.2);

    // -------------------------------------------------------- upland station
    const planBoard = holoPanel(g, 0.95, 0.62, -2.3, 1.1, 2.15, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("MAINTENANCE PLAN — INTAKE 6", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["USACE CWA §404 / RWQCB §401", "CDFW fish screening criteria",
       "USFWS fish passage protections", "Lockout/tagout — 29 CFR 1910.147", "Work window per the permit"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: BRFS_ACCENT });
    reg(hits, planBoard, "maintenance-plan-board");

    const chest = toolChest(g, 0, 2.05, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-pfd", -0.2, 0xe8622a, "LIFE VEST"], ["stage-gloves", 0.0, 0x8a6a4a, "GLOVES"], ["stage-eye", 0.2, 0x2f4d3a, "EYE PRO"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.4 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -2.9, 0.9, { ry: 0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    const noPfdHit = box(g, 0.4, 0.3, 0.4, -1.9, 0.4, 1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean over the forebay unvested?", -1.9, 0.65, 1.0, { css: "#e8622a", w: 0.46 });
    reg(hits, noPfdHit, "work-near-water-no-pfd");

    // ---------------------------------------------------------- screen face
    const screenGrp = group(g, 0, 0.05, 0.2);
    for (const [id, x] of [["screen-panel-1", -1.6], ["screen-panel-2", 0], ["screen-panel-3", 1.6]]) {
      const panel = box(screenGrp, 1.4, 1.1, 0.06, x, 0.55, 0, 0x7a828a, { rough: 0.6, metal: 0.5 });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
        ball(panel, 0.02, x - 0.6 + c * 0.17, 0.15 + r * 0.16, 0.035, 0x3c444c, { rough: 0.6, metal: 0.3, seg: 6 });
      }
      const flagLabel = group(g, x, 1.2, 0.2);
      decal(flagLabel, 0.3, 0.1, 0, 0, 0, signFace(id.slice(-1), { bg: "#1b1e12", accent: "#dff3d8", scale: 0.6 }));
      reg(hits, panel, id);
    }

    // ------------------------------------------------------------ drum + crank
    const drumGrp = group(g, 2.2, 0.55, 0.2);
    cyl(drumGrp, 0.4, 0.4, 1.0, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 16 }).rotation.z = Math.PI / 2;
    const drumHousing = box(g, 0.6, 1.3, 0.6, 2.2, 0.55, 0.2, 0x3c444c, { rough: 0.6, metal: 0.4, opacity: 0.001, transparent: true });
    void drumHousing;
    const crankGrp = group(g, 2.55, 0.55, 0.5);
    cyl(crankGrp, 0.015, 0.015, 0.25, 0, 0.12, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8 });
    const crankHandleGrp = group(crankGrp, 0, 0.25, 0);
    box(crankHandleGrp, 0.2, 0.02, 0.02, 0.1, 0, 0, 0x5f9e5a, { rough: 0.7 });
    holoTag(crankGrp, "drum crank", 0, 0.45, 0, { css: "#5f9e5a", w: 0.3 });
    reg(hits, crankHandleGrp, "drum-crank");
    const energizeHit = box(g, 0.5, 0.5, 0.5, 2.2, 0.55, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach in without LOTO?", 2.2, 0.9, 0.2, { css: "#e8622a", w: 0.4 });
    reg(hits, energizeHit, "energize-without-loto");

    // ------------------------------------------------------------- fouling
    const debrisClump = group(g, -0.4, 0.3, 0.25);
    box(debrisClump, 0.3, 0.2, 0.1, 0, 0, 0, 0x5a4a30, { rough: 0.95 });
    holoTag(debrisClump, "debris clump", 0, 0.2, 0, { css: "#e8622a", w: 0.3 });
    reg(hits, debrisClump, "debris-clump");
    const tornMesh = box(g, 0.15, 0.1, 0.02, 0.4, 0.7, 0.25, 0x2b3138, { rough: 0.7 });
    holoTag(tornMesh, "torn mesh", 0, 0.14, 0, { css: "#e8622a", w: 0.26 });
    reg(hits, tornMesh, "torn-mesh");
    const meshEdgeHit = box(g, 0.2, 0.2, 0.2, 0.4, 0.7, 0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab the torn edge bare-handed?", 0.4, 0.95, 0.25, { css: "#e8622a", w: 0.46 });
    reg(hits, meshEdgeHit, "bare-hand-mesh-edge");

    const collectionBin = group(g, -2.4, 0.321, 1.3);
    box(collectionBin, 0.5, 0.35, 0.4, 0, 0.175, 0, 0x3c444c, { rough: 0.6, metal: 0.4 });
    holoTag(collectionBin, "collection bin", 0, 0.5, 0, { css: "#5f9e5a", w: 0.32 });
    hits["collection-bin"] = collectionBin;

    // ------------------------------------------------------------ patch + bolts
    const patchGrp = group(g, 0.4, 0.7, 0.24);
    slab(patchGrp, 0.2, 0.15, 0.01, 0, 0, 0, 0x8a939b, { rough: 0.6, metal: 0.4, opacity: 0.85, transparent: true });
    holoTag(patchGrp, "mesh patch — hold it flat", 0, 0.15, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, patchGrp, "mesh-patch");

    const boltPositions = { "panel-bolt-1": [0.3, 1.0], "panel-bolt-2": [0.3, 0.15], "panel-bolt-3": [0.5, 0.55] };
    const boltMeshes = {};
    for (const [id, [x, y]] of Object.entries(boltPositions)) {
      const bolt = cyl(g, 0.015, 0.015, 0.04, x, y, 0.27, 0x2b3138, { rough: 0.6, metal: 0.6, seg: 8 });
      reg(hits, bolt, id);
      boltMeshes[id] = bolt;
    }

    // ------------------------------------------------------------- control panel
    const panelGrp = group(g, -1.2, 0.321, 1.7);
    box(panelGrp, 0.4, 0.6, 0.15, 0, 0.3, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const switchGrp = group(panelGrp, 0, 0.35, 0.08);
    box(switchGrp, 0.08, 0.14, 0.04, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(panelGrp, "disconnect switch", 0, 0.68, 0, { css: "#5f9e5a", w: 0.34 });
    reg(hits, switchGrp, "disconnect-switch");
    const lockTagGrp = lockTag(panelGrp, 0.1, 0.2, 0.08);
    lockTagGrp.visible = false;
    const removeLotoMarker = box(panelGrp, 0.1, 0.16, 0.05, 0.1, 0.2, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, removeLotoMarker, "disconnect-switch-2");

    const restartEstop = box(panelGrp, 0.08, 0.08, 0.06, -0.15, 0.5, 0.09, 0xd2312b, { rough: 0.55 });
    holoTag(panelGrp, "restart estop", -0.15, 0.7, 0.09, { css: "#5f9e5a", w: 0.3 });
    reg(hits, restartEstop, "restart-estop");

    const motorPanel = instrument(g, -0.9, 0.321, 1.55, { idle: "-- A", color: 0x5f9e5a, w: 0.12, d: 0.19 });
    holoTag(g, "motor panel", -0.9, 0.5, 1.55, { css: "#5f9e5a", w: 0.28 });
    reg(hits, motorPanel, "motor-panel");

    // ------------------------------------------------------------- velocity meters
    const velMeter = instrument(g, -0.7, 0.1, 0.55, { idle: "-- ft/s", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(g, "approach velocity meter", -0.7, 0.3, 0.55, { css: "#5f9e5a", w: 0.4 });
    reg(hits, velMeter, "velocity-meter");
    const velMeter2 = instrument(g, 0.7, 0.1, 0.55, { idle: "-- ft/s", color: 0x5f9e5a, w: 0.12, d: 0.18 });
    holoTag(g, "post-restart velocity meter", 0.7, 0.3, 0.55, { css: "#5f9e5a", w: 0.44 });
    reg(hits, velMeter2, "velocity-meter-2");

    // ------------------------------------------------------------- bypass gate
    const bypassGateGrp = group(g, 1.9, 0.321, 1.2);
    box(bypassGateGrp, 0.3, 0.3, 0.06, 0, 0.15, 0, 0x3c444c, { rough: 0.6, metal: 0.5 });
    const bypassWheelGrp = group(bypassGateGrp, 0, 0.4, 0);
    const bypassWheel = valveWheel(bypassWheelGrp, 0, 0.08, 0, { r: 0.07, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(bypassGateGrp, "bypass gate", 0, 0.6, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, bypassWheel.userData.wheel, "bypass-gate");

    // ------------------------------------------------------------- LOTO confirm hazard
    const remLotoHit = box(g, 0.3, 0.3, 0.3, -1.2, 0.7, 1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "remove the lock without a headcount?", -1.2, 0.95, 1.85, { css: "#e8622a", w: 0.48 });
    reg(hits, remLotoHit, "remove-loto-without-confirm");

    // -------------------------------------------------------------- walk-round
    const looseBolt = cyl(g, 0.012, 0.012, 0.03, -1.7, 0.335, 1.6, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 6 });
    reg(hits, looseBolt, "loose-bolt-flag");
    const unlatchedHatch = box(g, 0.3, 0.02, 0.3, 2.0, 0.331, 1.55, 0x3c444c, { rough: 0.6, metal: 0.4 });
    unlatchedHatch.rotation.z = 0.15;
    reg(hits, unlatchedHatch, "unlatched-hatch");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, -2.3, 0.321, 1.9, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("SCREEN LOG", ["Panels inspected", "Velocity readings, before/after", "Repair made, bolts torqued", "Lockout status"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the maintenance", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.1, 2.3, { color: BRFS_ACCENT });
    cone(g, 3.1, 2.3, { color: BRFS_ACCENT });
    barrierPanel(g, 0, 2.4, { color: 0xe8b02e });

    let crankAmount = 0, patchHolding = false, headLossHigh = false, restartAborted = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.7, 0.9),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "loto-apply") { lockTagGrp.visible = true; }
        if (step.id === "debris-haul") { debrisClump.visible = false; }
        if (step.id === "bolt-torque") { for (const b of Object.values(boltMeshes)) b.material = mat(0x59c97b, { rough: 0.6, metal: 0.6 }); }
        if (step.id === "loto-remove") { lockTagGrp.visible = false; }
        if (step.id === "walk-hazards") { looseBolt.visible = false; unlatchedHatch.rotation.z = 0; }
      },

      // Both interruptions really change the scene: the bypass gate visibly
      // opens and the forebay level drops toward it, and the restart estop
      // lights while a second crew figure is visible still at the drum.
      onInterrupt(it) {
        if (it.id === "debris-surge-during-cleaning") {
          headLossHigh = true;
          debrisClump.scale.set(1.6, 1.6, 1.6);
        }
        if (it.id === "second-worker-in-enclosure") {
          restartEstop.material = mat(0xffee55, { emissive: 0xffee55, ei: 1.6, rough: 0.4 });
          restartAborted = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "debris-surge-during-cleaning") {
          headLossHigh = false;
          bypassWheelGrp.rotation.y += Math.PI / 2;
        }
        if (it.id === "second-worker-in-enclosure") {
          restartEstop.material = mat(0xd2312b, { rough: 0.55 });
          restartAborted = false;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(-1.8, -0.08, 0.2), 1.0, 0.3, -0.1);
        bypassWave.visible = true;
        bypassWave.userData.step(dt, new THREE.Vector3(1.8, -0.08, 0.2), 1.0, 0.3, -0.1);
        void headLossHigh; void restartAborted;

        const step = session?.step;
        if (step?.id === "drum-drive-crank" && session.turn) crankAmount = session.turn.amount;
        crankHandleGrp.rotation.z = -crankAmount * Math.PI * 2;
        drumGrp.rotation.x = crankAmount * Math.PI * 2;

        if (step?.id === "mesh-patch-hold") patchHolding = !!session.holding;
        patchGrp.scale.setScalar(patchHolding ? 1.05 : 1);

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "approach-velocity-check") {
            repaint(velMeter.userData.screen, signFace(`${(gg.t * 0.6).toFixed(2)} ft/s`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
          }
          if (step?.id === "flow-verify") {
            repaint(velMeter2.userData.screen, signFace(`${(gg.t * 0.6).toFixed(2)} ft/s`, { bg: "#0d1c14", accent: gg.t >= 0.4 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff3d8", scale: 0.6 }));
          }
        }
      },
    };
  },
};
