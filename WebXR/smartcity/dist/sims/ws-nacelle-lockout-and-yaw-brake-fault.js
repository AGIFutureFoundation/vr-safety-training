import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, gratingFace, corrugatedFace, palette,
} from "../citykit.js";
import { multimeter, radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Nacelle Lockout & Yaw-Brake Fault VR — Energy & Power,
// IBEW wind technician.
//
// A stopped rotor is not a locked rotor, and a turbine stopped from the
// control room is not an isolated one. Inside the nacelle the crew stops it
// locally, watches the rotor come down, drives the rotor lock home, proves
// the yaw is held, then isolates, locks, tags and tests for absence of
// voltage before bleeding the stored hydraulic energy and trying a start
// that must not happen. Sited in a generic nacelle: no turbine model,
// voltage, pressure or speed is stated — each is the manufacturer's manual
// and the site's lockout procedure.

const WS2_ACCENT = 0x5fb8e0;
const WS2_CSS = "#5fb8e0";
const WS2_PAL = palette("utility");

export const SIM_WS_NACELLE_LOCKOUT_AND_YAW_BRAKE_FAULT = {
  id: "ws-nacelle-lockout-and-yaw-brake-fault",
  index: "ws-02",
  domain: "Energy",
  trade: "IBEW wind technician",
  category: "Energy & Power",
  district: "wind-farm",
  weather: "wind",
  certification: "IBEW/NECA JATC wind-technician training as a body; 29 CFR 1910.147 for the control of hazardous energy and 29 CFR 1910.269 for generation installations; NFPA 70E for the absence-of-voltage test and the arc-flash boundary; ANSI Z359 for the tie-off in the nacelle; the turbine manufacturer's manual for the rotor lock, the yaw brake and every pressure and speed",
  name: "Nacelle Lockout & Yaw-Brake Fault",
  title: simTitle("Nacelle Lockout & Yaw-Brake Fault"),
  tagline: "Stopped locally, the rotor watched down and locked, the yaw proven held, then isolated, locked, tagged, tested for absence of voltage and bled of stored energy before a start that must not happen",
  accent: WS2_ACCENT,
  accentCss: WS2_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "locked-held-proven", name: "Locked, Held, Proven", note: "The rotor locked, the yaw held, the energy isolated and the start tried dead before anyone reached into the drive train" },

  game: system({
    name: "Nacelle Authority",
    currency: "LOCKS",
    ranks: ["Trainee", "Technician", "Wind Technician", "Lead Technician", "Nacelle Authority Certified"],
    badges: [
      { id: "rotor-locked-first", name: "Rotor Locked First", note: "The rotor lock went in before any other work", test: AWARD.stepClean("rotor-lock") },
      { id: "nothing-trusted", name: "Nothing Trusted", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-watch", name: "Steady Watch", note: "Held the rotor slow-down watch steady", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-lockout", name: "Clean Lockout", note: "No corrections from the work order to the log", test: AWARD.clean },
      { id: "unbroken-bleed", name: "Unbroken Bleed", note: "The accumulator bleed ran to completion", test: AWARD.unbroken },
      { id: "brisk-isolation", name: "Brisk Isolation", note: "Isolated and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "trust-remote-stop": "You went to start work in the drive train on the strength of the control room's remote stop. A remote stop can be reset from somewhere else by someone who does not know you are in the nacelle; only a local stop, a lock and a tag you hold keep the machine from being started while your hands are in it.",
    "enter-hub-unlocked": "You went to open the hub hatch before the rotor lock was engaged. A rotor that is stopped but not locked can turn with a gust, and a hub is the one place in the turbine where that movement closes on a person.",
    "skip-voltage-test": "You went to open the converter cabinet without testing for absence of voltage. An open breaker is a claim; the test on the conductors, with a tester proven before and after, is the proof, and until then the cabinet is treated as live.",
    "open-hydraulics-charged": "You went to crack a hydraulic fitting with the accumulator still charged. Stored hydraulic energy does not care that the pump is locked off — it is released through the fitting and whatever is in front of it.",
  },

  lateNotes: {
    "rotor-lock-pin": "The rotor lock goes in only once the rotor has come to a stop — never driven into a rotor that is still turning.",
    "accumulator-valve": "The accumulator is bled after the electrical isolation is locked and tested, not before the pump could be restarted behind you.",
  },

  faults: [
    {
      id: "yaw-brake-fault",
      label: "Yaw brake fault",
      note: "The yaw brake indicator shows a fault and the nacelle has crept with the wind. The brake cannot be trusted to hold the yaw: engage the mechanical yaw lock before any work in the nacelle.",
      step: "yaw-held",
      change: {
        target: "yaw-lock-pin",
        title: "Engage the mechanical yaw lock",
        cue: "The yaw brake is faulted — engage the mechanical yaw lock instead of trusting the brake indicator.",
        why: "A faulted yaw brake lets the whole nacelle swing with the wind, and every tool, lanyard and person inside it swings too; the mechanical yaw lock is the manufacturer's way of holding the yaw when the brake cannot be trusted, and it goes in before anyone reaches into the drive train or climbs onto the roof.",
      },
    },
  ],

  interrupts: [
    {
      id: "yaw-creep",
      kind: "The nacelle creaks and starts to yaw",
      after: "rotor-slowdown", delay: 3, seconds: 11,
      alert: "The nacelle creaks and the floor starts to turn under you — the yaw is moving with the wind while the rotor is still coming down.",
      cue: "Hit the nacelle emergency stop now.",
      target: "nacelle-estop",
      why: "Uncommanded yaw with people in the nacelle is a stop-everything moment, and the emergency stop is the one control in reach that drops every drive at once; the cause is found afterwards, with the machine held, not while it is still moving.",
      missNote: "The nacelle kept yawing with nobody stopping it. Every person and tool inside was moving with it.",
      wrongNote: "It is the emergency stop. The rotor-speed meter is telling you what the rotor is doing, not stopping the yaw.",
    },
    {
      id: "ground-crew-radio",
      kind: "The ground crew calls the nacelle",
      after: "accumulator-bleed", delay: 3, seconds: 12,
      alert: "The ground crew is calling on the radio — they want to raise a part on the service crane and need to know the hatch is clear.",
      cue: "Answer the ground crew on the radio before anything comes up the crane.",
      target: "nacelle-radio",
      why: "A load coming up the service crane arrives at the hatch where the crew is working, and a crane lift that starts without the nacelle's word is how a part and a person arrive at the same opening. One call settles who is where before the hook moves.",
      missNote: "The call went unanswered and the ground crew had no word from the nacelle about the hatch.",
      wrongNote: "It is the radio. The bleed valve has done its work; the ground crew needs an answer.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "work-order", kind: "select", target: "nacelle-work-order",
      title: "Read the work order and the lockout procedure",
      cue: "Read the work order and the turbine's lockout procedure: what is being worked on and every energy source it names.",
      why: "A nacelle carries electrical, rotational, hydraulic and gravitational energy in one small room, and the turbine's own lockout procedure is the list of every source and every isolation point for this machine; working from memory of a different turbine is how one source gets left live.",
    },
    {
      id: "local-stop", kind: "sequence",
      targets: ["local-stop-button", "service-mode-key"],
      itemNames: { "local-stop-button": "turbine stopped at the local panel", "service-mode-key": "service-mode key turned and pocketed" },
      title: "Stop the turbine locally and take service mode",
      cue: "Stop the turbine at the nacelle panel, then turn the service-mode key and keep it.",
      why: "The local stop and the service-mode key take control of the turbine away from the control room, so nobody can restart it remotely while the crew is inside. The key goes in the pocket of the person doing the work — control that stays in the nacelle cannot be handed away by accident.",
      outOfOrderNote: "Stop first, then service mode — the key takes control of a turbine that is already stopped.",
    },
    {
      id: "rotor-slowdown", kind: "track", target: "rotor-speed-meter", seconds: 7,
      title: "Watch the rotor come down",
      cue: "Keep watching the rotor-speed meter as the rotor comes down to a stop.",
      why: "The rotor lock is designed to go into a stopped rotor, and a lock driven into a rotor that is still turning can shear or damage the lock disc. Watching the speed come down to nothing, rather than guessing from the sound, is what makes the next step safe.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.1, label: "ROTOR SPEED", readout: (v) => (v > 0.65 ? "still turning" : v < 0.35 ? "check the reading" : "coming down") },
      holdBreakNote: "The watch broke before the rotor stopped — keep your eyes on the meter until it reads stopped.",
    },
    {
      id: "rotor-lock", kind: "turn", target: "rotor-lock-pin",
      title: "Drive the rotor lock home",
      cue: "Wind the rotor lock pin into the lock disc until it is fully engaged.",
      why: "The brake holds a rotor against normal forces; the rotor lock holds it mechanically, and it is the only thing between a gust and a turning shaft when hands go into the drive train or the hub. Fully engaged means the manufacturer's engaged indication, not a pin half in the hole.",
      turn: { turns: 0.8, axis: "z", label: "ROTOR LOCK" },
    },
    {
      id: "yaw-held", kind: "select", target: "yaw-brake-indicator",
      title: "Prove the yaw is held",
      cue: "Check the yaw brake indicator shows the brake applied and holding.",
      why: "A nacelle that yaws with the wind moves everything inside it, and the yaw brake is what holds it; proving the brake is applied and holding, from its own indicator, is the check that the room you are about to work in will stay where it is.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["main-breaker", "breaker-lock", "breaker-tag"],
      itemNames: { "main-breaker": "main breaker opened", "breaker-lock": "personal lock applied", "breaker-tag": "tag filled in and hung" },
      title: "Isolate, lock and tag",
      cue: "Open the main breaker named in the procedure, apply your personal lock, then hang your tag.",
      why: "Opening the breaker isolates; the personal lock is what stops it being closed while you are exposed, and the tag tells anyone who reaches for it who is inside and why. The lock is yours alone because the only person who should remove it is the one whose safety it protects.",
      outOfOrderNote: "Breaker open, then your lock, then your tag — a tag on a closed breaker protects nobody.",
    },
    {
      id: "absence-test", kind: "gauge", target: "voltage-tester",
      title: "Test for absence of voltage",
      cue: "Prove the tester on a known source, test the conductors, then prove the tester again — commit when it reads absent.",
      why: "An open breaker can be the wrong breaker, a back-feed can make a dead circuit live, and a tester can fail silently. Proving the tester before and after the test is what makes an absent reading mean absent rather than a broken meter.",
      gauge: { label: "ABSENCE OF VOLTAGE", speed: 0.55, green: [0.2, 0.45], readout: (t) => (t > 0.45 ? "PRESENT — stop" : "absent on all phases"), missNote: "That is not an absent reading — treat the cabinet as live and find the source before going further." },
    },
    {
      id: "stored-energy", kind: "find", noHint: true,
      targets: ["hydraulic-accumulator", "converter-capacitors"],
      itemNames: { "hydraulic-accumulator": "the charged hydraulic accumulator", "converter-capacitors": "the converter's DC-link capacitors" },
      itemNotes: {
        "hydraulic-accumulator": "The accumulator still holds pressure with the pump locked off — it is stored energy the electrical lockout does not touch.",
        "converter-capacitors": "The converter's capacitors can hold a charge after the breaker opens; the manufacturer's discharge wait and test apply before hands go in.",
      },
      title: "Find the stored energy the lockout did not touch",
      cue: "Look for the energy still stored in the nacelle after the electrical isolation.",
      why: "A breaker isolates the supply, not what is already stored: pressure in an accumulator and charge in a capacitor bank are both still there after the lock goes on. Finding them by name, from the procedure, is how the lockout covers every source rather than the obvious one.",
    },
    {
      id: "accumulator-bleed", kind: "hold", target: "accumulator-valve", seconds: 5,
      title: "Bleed the accumulator",
      cue: "Hold the bleed valve open until the gauge reads zero, per the manufacturer's manual.",
      why: "The accumulator is bled through its own valve, slowly and to zero on its own gauge, so the stored pressure goes back to the tank instead of out of a fitting in someone's face. Held until zero, not until it sounds quiet.",
      holdBreakNote: "The valve closed before the gauge reached zero — there is still pressure in the accumulator.",
    },
    {
      id: "try-start", kind: "select", target: "local-start-try",
      title: "Try a start that must not happen",
      cue: "Press the local start to prove the isolation holds, then return it to off.",
      why: "The try is the proof that the lockout isolated the right thing: a start button that does nothing confirms the breaker, the lock and the control path, and it is done with everyone clear, before hands go into the machine rather than after.",
    },
    {
      id: "tie-off", kind: "select", target: "nacelle-anchor",
      title: "Tie off in the nacelle",
      cue: "Clip your lanyard to the nacelle anchor before working near the open hatch or the roof.",
      why: "The nacelle floor has openings — the hatch, the service crane opening — and the roof is outside the shell; a connection to the rated anchor the manufacturer marked is what turns a slip near an opening into a stumble instead of a fall.",
    },
    {
      id: "loto-log", kind: "select", target: "loto-log",
      title: "Record the lockout",
      cue: "Record the lockout: breaker, locks, the absence test, the accumulator bled and the rotor and yaw locks.",
      why: "The record is what the next shift, or the person who relieves you, reads before touching this machine; it says what is isolated and by whom, so nobody restores energy on a guess about who is still inside.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS2_ACCENT);

    // The nacelle cutaway: a grated floor and a corrugated shell on two sides.
    const floorTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#7d858d", base2: "#646b72" }), { repeat: 4, px: 256 });
    const floor = box(g, 6.0, 0.08, 4.8, 0, 0.04, -0.2, 0xffffff, { rough: 0.7 });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.4 });
    const shellTex = surfaceTexture((ctx, w, h) => corrugatedFace(ctx, w, h), { repeat: 2, px: 256 });
    for (const [x, ry] of [[-3.0, Math.PI / 2], [3.0, -Math.PI / 2]]) {
      const wall = box(g, 4.8, 2.6, 0.08, x, 1.3, -0.2, 0xffffff, { rough: 0.6 });
      wall.rotation.y = ry;
      wall.material = texturedMat(shellTex, { rough: 0.6, metal: 0.2, color: 0xe9ecee });
    }
    const back = box(g, 6.0, 2.6, 0.08, 0, 1.3, -2.6, 0xffffff, { rough: 0.6 });
    back.material = texturedMat(shellTex, { rough: 0.6, metal: 0.2, color: 0xdfe3e6 });

    // Drive train: main shaft, lock disc, gearbox, generator.
    const shaft = cyl(g, 0.22, 0.22, 2.4, 0, 1.0, -1.2, 0x8b949b, { rough: 0.4, metal: 0.6, seg: 16 });
    shaft.rotation.x = Math.PI / 2;
    const disc = cyl(g, 0.55, 0.55, 0.08, 0, 1.0, -0.4, 0x6b737a, { rough: 0.4, metal: 0.6, seg: 20 });
    disc.rotation.x = Math.PI / 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; box(g, 0.06, 0.06, 0.1, Math.cos(a) * 0.45, 1.0 + Math.sin(a) * 0.45, -0.4, 0x2b3138, { rough: 0.5 }); }
    box(g, 1.2, 1.1, 1.0, 0, 0.75, -1.9, 0x4a5560, { rough: 0.5, metal: 0.5 });
    box(g, 1.0, 0.9, 1.2, 1.6, 0.6, -1.6, 0x3a6ea5, { rough: 0.5, metal: 0.4 });
    const lockPin = group(g, 0.62, 1.0, -0.4);
    const pin = cyl(lockPin, 0.05, 0.05, 0.4, 0, 0, 0, 0xf0b323, { rough: 0.4, metal: 0.5, seg: 12 });
    pin.rotation.z = Math.PI / 2;
    holoTag(lockPin, "rotor lock", 0.2, 0.3, 0, { css: WS2_CSS, w: 0.28 });
    reg(hits, pin, "rotor-lock-pin");
    const rotorInst = instrument(g, -0.8, 1.5, -0.3, { idle: "RPM", color: 0x2b2f34, w: 0.18, d: 0.03 });
    holoTag(g, "rotor speed", -0.8, 1.72, -0.3, { css: WS2_CSS, w: 0.28 });
    reg(hits, rotorInst, "rotor-speed-meter");

    // Yaw ring, drives and brake calipers.
    const yawRing = torus(g, 1.6, 0.08, 0, 0.12, -0.2, 0x5a6168, { rough: 0.5, metal: 0.5, seg: 8, seg2: 32 });
    yawRing.rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const a = Math.PI * 0.2 + i * Math.PI * 0.2; cyl(g, 0.12, 0.12, 0.5, Math.cos(a) * 1.6, 0.4, -0.2 - Math.sin(a) * 1.6, 0x3a4047, { rough: 0.5, metal: 0.5, seg: 12 }); }
    for (let i = 0; i < 6; i++) { const a = Math.PI + i * Math.PI / 6; box(g, 0.18, 0.14, 0.14, Math.cos(a) * 1.6, 0.2, -0.2 - Math.sin(a) * 1.6, 0xc0282a, { rough: 0.5, metal: 0.4 }); }
    const yawInd = instrument(g, -1.8, 1.3, 0.6, { idle: "YAW BRAKE", color: 0x2b2f34, w: 0.2, d: 0.03 });
    holoTag(g, "yaw brake indicator", -1.8, 1.55, 0.6, { css: WS2_CSS, w: 0.4 });
    reg(hits, yawInd, "yaw-brake-indicator");
    const yawLock = group(g, -2.1, 0.3, -0.9);
    const yawPin = cyl(yawLock, 0.06, 0.06, 0.4, 0, 0, 0, 0xf0b323, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(yawLock, "mechanical yaw lock", 0, 0.45, 0, { css: WS2_CSS, w: 0.4 });
    reg(hits, yawPin, "yaw-lock-pin");
    const faultLamp = cyl(g, 0.05, 0.05, 0.05, -1.55, 1.3, 0.62, 0x444444, { rough: 0.4, seg: 10 });

    // Control panel, breaker cabinet, converter, hydraulics.
    const panel = group(g, -2.6, 0, 1.2, Math.PI / 2);
    box(panel, 0.7, 1.4, 0.3, 0, 0.9, 0, 0xd7dbdd, { rough: 0.5 });
    const stopBtn = cyl(panel, 0.05, 0.05, 0.04, -0.15, 1.3, 0.16, 0xd2312b, { rough: 0.4, seg: 12 });
    stopBtn.rotation.x = Math.PI / 2;
    reg(hits, stopBtn, "local-stop-button");
    const keySw = box(panel, 0.08, 0.08, 0.04, 0.15, 1.3, 0.16, 0x2b3138, { rough: 0.4, metal: 0.5 });
    reg(hits, keySw, "service-mode-key");
    const startBtn = cyl(panel, 0.045, 0.045, 0.04, 0.15, 1.1, 0.16, 0x59c97b, { rough: 0.4, seg: 12 });
    startBtn.rotation.x = Math.PI / 2;
    reg(hits, startBtn, "local-start-try");
    holoTag(panel, "local panel", 0, 1.75, 0.1, { css: WS2_CSS, w: 0.3 });
    const estop = cyl(g, 0.07, 0.07, 0.05, 2.9, 1.4, 0.8, 0xd2312b, { rough: 0.4, seg: 12 });
    estop.rotation.z = Math.PI / 2;
    holoTag(g, "nacelle e-stop", 2.7, 1.65, 0.8, { css: "#d2312b", w: 0.3 });
    reg(hits, estop, "nacelle-estop");

    const cab = group(g, 2.6, 0, 1.4, -Math.PI / 2);
    box(cab, 0.9, 1.8, 0.45, 0, 0.9, 0, 0x8b949b, { rough: 0.5, metal: 0.4 });
    const breaker = box(cab, 0.14, 0.24, 0.06, -0.2, 1.2, 0.25, 0x2b3138, { rough: 0.4 });
    reg(hits, breaker, "main-breaker");
    const lock = lockTag(cab, -0.2, 0.95, 0.26, { color: 0xd2312b, lines: ["LOCK"] });
    reg(hits, lock, "breaker-lock");
    const tag = lockTag(cab, 0.05, 0.95, 0.26, { color: 0xf2c14b, lines: ["DANGER", "DO NOT", "OPERATE"] });
    reg(hits, tag, "breaker-tag");
    const caps = box(cab, 0.3, 0.3, 0.1, 0.2, 0.5, 0.24, 0x3a4047, { rough: 0.5 });
    reg(hits, caps, "converter-capacitors");
    holoTag(cab, "converter cabinet", 0, 1.95, 0.1, { css: WS2_CSS, w: 0.36 });
    const tester = multimeter(g, 2.0, 0.85, 1.9);
    holoTag(g, "voltage tester", 2.0, 1.1, 1.9, { css: WS2_CSS, w: 0.3 });
    reg(hits, tester, "voltage-tester");
    const testerBench = box(g, 0.8, 0.8, 0.5, 2.0, 0.4, 1.9, WS2_PAL.structure, { rough: 0.7 });
    void testerBench;

    const hyd = group(g, -1.2, 0, -2.0);
    const acc = cyl(hyd, 0.16, 0.16, 0.7, 0, 0.5, 0, 0x2b3138, { rough: 0.4, metal: 0.5, seg: 14 });
    reg(hits, acc, "hydraulic-accumulator");
    const valve = torus(hyd, 0.08, 0.02, 0.25, 0.4, 0.1, 0xd2312b, { rough: 0.4, seg: 6, seg2: 12 });
    reg(hits, valve, "accumulator-valve");
    const hydGauge = instrument(hyd, 0.25, 0.75, 0.1, { idle: "PRESS", color: 0x2b2f34, w: 0.14, d: 0.03 });
    holoTag(hyd, "accumulator", 0, 1.0, 0, { css: WS2_CSS, w: 0.3 });

    // Boards, radio, anchor.
    const orders = decal(g, 0.46, 0.34, -1.2, 1.5, -2.55, paperFace("WORK ORDER / LOTO", ["Task per work order", "Energy sources per procedure", "Limits per manufacturer's manual"], { scale: 0.72 }));
    holoTag(g, "work order", -1.2, 1.8, -2.5, { css: WS2_CSS, w: 0.3 });
    reg(hits, orders, "nacelle-work-order");
    const log = decal(g, 0.4, 0.3, 1.2, 1.5, -2.55, paperFace("LOCKOUT RECORD", ["Breaker / locks ___", "Absence test ___", "Rotor + yaw locks ___"], { scale: 0.72 }));
    holoTag(g, "lockout record", 1.2, 1.8, -2.5, { css: WS2_CSS, w: 0.32 });
    reg(hits, log, "loto-log");
    const radioObj = radio(g, -2.3, 0.9, 1.9);
    holoTag(g, "radio", -2.3, 1.15, 1.9, { css: WS2_CSS, w: 0.2 });
    reg(hits, radioObj, "nacelle-radio");
    const radioShelf = box(g, 0.5, 0.84, 0.4, -2.3, 0.42, 1.9, WS2_PAL.structure, { rough: 0.7 });
    void radioShelf;
    const anchor = torus(g, 0.08, 0.02, 0.9, 2.3, -2.5, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 6, seg2: 12 });
    holoTag(g, "rated anchor", 0.9, 2.5, -2.45, { css: WS2_CSS, w: 0.28 });
    reg(hits, anchor, "nacelle-anchor");
    const hatch = box(g, 0.9, 0.04, 0.9, 1.4, 0.1, 0.9, 0xc9ced2, { rough: 0.5, metal: 0.3 });
    holoTag(g, "floor hatch", 1.4, 0.35, 0.9, { css: WS2_CSS, w: 0.26 });
    void hatch;

    // Hazard decoys.
    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.46 });
      reg(hits, d, id);
    };
    decoy(-0.6, 1.1, 0.6, "trust-remote-stop", "control room stopped it — start?");
    decoy(0.2, 1.8, -1.0, "enter-hub-unlocked", "open the hub hatch now?");
    decoy(2.1, 1.3, 0.8, "skip-voltage-test", "breaker's open — go in?");
    decoy(-0.7, 0.9, -1.4, "open-hydraulics-charged", "crack the fitting now?");

    toolChest(g, 0.6, 1.9);
    standingFigure(g, -1.6, 2.0, { ry: 2.6, cloth: 0x2b4f7f, vest: 0xf2c14b });
    holoPanel(g, 1.0, 0.6, 0.2, 0, 2.2, (ctx, w, h) => {
      ctx.fillStyle = "#06141c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS2_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f6ff";
      ctx.fillText("NACELLE — LOCKED, HELD, PROVEN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Stop locally, keep the key", "Rotor locked, yaw held", "Lock, tag, test for absence", "Bleed stored energy, try a start"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: 0, accent: WS2_ACCENT });

    let creeping = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -1.0),
      onStep() {},
      onFault(id) {
        if (id === "yaw-brake-fault") { faultLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6 }); yawRing.rotation.z = 0.12; }
      },
      onStepComplete(step) {
        if (step.id === "rotor-lock") lockPin.position.x = 0.5;
        if (step.id === "yaw-held") repaint(yawInd.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "absence-test") repaint(tester.userData?.screen ?? yawInd.userData.screen, signFace("ABSENT", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "accumulator-bleed") repaint(hydGauge.userData.screen, signFace("ZERO", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
      },
      onInterrupt(it) {
        if (it.id === "yaw-creep") { creeping = true; faultLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.6 }); }
        if (it.id === "ground-crew-radio") radioObj.traverse((o) => { if (o.isMesh) o.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.5 }); });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "yaw-creep") { creeping = false; faultLamp.material = mat(0x444444, { rough: 0.4 }); }
        if (it.id === "ground-crew-radio") radioObj.traverse((o) => { if (o.isMesh) o.material = mat(0x1b1e23, { rough: 0.5 }); });
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.step?.id === "rotor-slowdown") disc.rotation.y = t * 1.5;
        if (creeping) yawRing.rotation.z += dt * 0.05;
        if (session?.turn && session.step?.id === "rotor-lock") lockPin.position.x = 0.62 - session.turn.amount * 0.12;
      },
    };
  },
};
