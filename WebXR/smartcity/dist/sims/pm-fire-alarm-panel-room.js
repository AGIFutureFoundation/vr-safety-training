import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fire Alarm Panel Room VR — Building Systems & Facilities,
// property management programme, zone five of twenty.
//
// The room with the fire alarm control unit, run the way an IUOE Local 39
// building engineer runs a routine test alongside the licensed fire alarm
// technician: the event history read first, the monitoring station and the
// residents told before anything is tested, the room walked for the faults
// NFPA 72 cares about, the standby batteries read, a lamp check, a
// replacement detector seated and smoke-tested, the panel reset and the
// account taken off test, the controls locked and the whole test written
// into the building log. A generic building; no real monitoring company,
// manufacturer or fire department is named.

const PMFA_ACCENT = 0xe0524a;

export const SIM_PM_FIRE_ALARM_PANEL_ROOM = {
  id: "pm-fire-alarm-panel-room",
  index: "305",
  domain: "Property Management",
  trade: "Building engineer — IUOE Local 39 stationary engineers, working with the licensed fire alarm contractor and SEIU front desk staff",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "NFPA 72 (National Fire Alarm and Signaling Code) for inspection and testing, notification of the supervising station and occupants before a test, standby battery checks, a marked and protected branch circuit, and record documentation kept at the control unit; NFPA 101 for the rated walls a penetration must not breach; NFPA 70 for the panel's branch circuit; OSHA 29 CFR 1910.38 for the building's emergency action plan and alarm notification, 29 CFR 1910.333 for work near the battery terminals, and 29 CFR 1910.23 for keeping a pole on the floor instead of a ladder; the state fire code's permit rule for work on fire alarm systems; IUOE Local 39 and SEIU building staff.",
  supportLine: "IUOE Local 39's member services or your employer's EAP",
  name: "Fire Alarm Panel Room",
  title: simTitle("Fire Alarm Panel Room"),
  tagline: "A routine fire alarm test done in order: history read, monitoring and residents told, faults found, batteries read, a lamp check, a detector seated and smoke-tested, the panel reset and taken off test, and the controls locked",
  accent: PMFA_ACCENT,
  accentCss: "#e0524a",
  parSeconds: 280,
  footprint: 2.4,
  badge: { id: "system-normal", name: "System Normal", note: "A fire alarm tested, restored and back on line with the monitoring station, with nothing silenced, disabled or switched off along the way" },

  game: system({
    name: "Panel Authority",
    currency: "SIGNALS",
    ranks: ["Engineer Trainee", "Building Engineer", "Chief's Assistant", "Chief Engineer", "Panel Authority Certified"],
    badges: [
      { id: "never-silenced", name: "Never Silenced", note: "No unsafe action anywhere in the test", test: AWARD.safe },
      { id: "told-first", name: "Told First", note: "Monitoring and residents told in order on the first try", test: AWARD.stepClean("notify-before-test") },
      { id: "float-true", name: "Float True", note: "Battery voltage committed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections anywhere", test: AWARD.clean },
      { id: "short-window", name: "Short Window", note: "Off test inside 80% of par", test: AWARD.fast(0.8) },
      { id: "nine-signals", name: "Nine Signals", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "alarm-silence": "You are pressing silence and walking away from a signal nobody has investigated. Silencing stops the noise, not the condition: the device that reported is still in alarm or trouble, and the next signal from anywhere in the building may be masked behind it. NFPA 72 lets a signal be silenced so that it can be investigated, not instead.",
    "zone-disable": "You are disabling a whole zone to stop a nuisance alarm. A disabled zone is a floor of detectors that will no longer report a fire, and the monitoring station and the fire department are counting on them. Disabling a device is an impairment to be notified, recorded and fixed — never a way to get through a shift.",
    "fa-breaker-handle": "You are switching off the fire alarm's branch circuit to stop the trouble beeping. The panel falls back to its batteries and starts counting down the hours they will last, and nobody upstairs knows. NFPA 72 wants this breaker marked and protected precisely because switching it off is so tempting and so dangerous.",
    "detector-bag": "You are pulling a cover over the corridor smoke detector so the contractor's dust will not set it off. A covered detector is a floor with no smoke detection, and covers put on 'for an hour' are routinely found months later. If dust work is planned, the device is impaired through the panel with notice — not bagged at the ceiling.",
  },

  lateNotes: {
    "panel-reset": "The panel is reset once the test device is clear and the detector has stopped reporting — a reset now just brings the signal straight back.",
    "building-log": "The test goes into the log once the system is back to normal and off test with the monitoring station.",
    "spare-detector": "The replacement head goes on once the faulty one has been found and the panel is enabled for the work.",
  },

  steps: [
    {
      id: "event-history", kind: "select", target: "fa-history-log",
      title: "Read the panel's event history",
      cue: "Scroll the control unit's event history and the fire alarm log for anything since the last test.",
      why: "The event history is the panel's memory: the detector that went into trouble twice overnight, the supervisory that cleared itself, the battery fault an hour after a storm. Reading it before a test tells you which devices are misbehaving and stops you mistaking an existing fault for something your test just caused.",
    },
    {
      id: "notify-before-test", kind: "sequence", anyOrder: false,
      targets: ["monitoring-call", "resident-notice"],
      itemNames: { "monitoring-call": "monitoring station told — account on test", "resident-notice": "residents and the desk told" },
      title: "Tell the monitoring station and the residents",
      cue: "Call the supervising station to put the account on test, then tell the desk and post the notice for residents.",
      why: "NFPA 72 expects the supervising station and the building's occupants to be told before a test so that a test signal is not dispatched as a fire and so that residents do not learn to ignore the horns. The order matters: the account goes on test first, because the first device you touch sends a signal whether anybody has been warned or not.",
      outOfOrderNote: "Monitoring first, then residents. A notice posted while the account is still live does nothing to stop the first test signal being dispatched as a fire.",
    },
    {
      id: "room-walk", kind: "find", noHint: true,
      targets: ["dust-cover", "breaker-label", "record-cabinet"],
      itemNames: { "dust-cover": "dust cover left on a detector", "breaker-label": "branch circuit breaker not marked", "record-cabinet": "record documentation cabinet empty" },
      itemNotes: {
        "dust-cover": "A construction dust cover is still on one detector head. It cannot sense smoke through the plastic — that head has been out of service since the painters left.",
        "breaker-label": "The panel's branch circuit breaker is not marked in red or identified. NFPA 72 wants it marked and protected so nobody switches it off by mistake.",
        "record-cabinet": "The record documentation cabinet by the panel is empty. The as-builts, the sequence of operations and the last inspection report belong in it for the next technician and the inspector.",
      },
      title: "Walk the panel room for faults",
      cue: "Three things in this room would be written up at the next inspection. Find them.",
      why: "A fire alarm is only as good as its least-watched part. A covered detector, an unmarked breaker and missing records are each invisible from the panel's display, which will cheerfully read normal while all three are true. The walk is where a building engineer finds them before an inspector or a fire does.",
    },
    {
      id: "panel-key", kind: "turn", target: "panel-key",
      title: "Enable the panel's controls",
      cue: "Turn the control unit's key to enable the controls for the test.",
      why: "The key is what separates people who may operate the fire alarm from people who happen to be standing near it. Enabling the controls deliberately, with the key, is also the point from which the panel records who was working on it — and the key comes back out the moment the test is over.",
      turn: { turns: 0.25, axis: "z", label: "PANEL KEY", readout: (t) => (t < 0.95 ? "CONTROLS LOCKED" : "CONTROLS ENABLED") },
    },
    {
      id: "battery-voltage", kind: "gauge", target: "battery-meter",
      title: "Read the standby batteries",
      cue: "Read the standby battery voltage on the meter and commit when it sits inside the float band.",
      why: "When the building loses power, the fire alarm runs on these two batteries and nothing else, for the hours NFPA 72 requires and then long enough to sound every horn. A low float voltage is a battery near the end of its life; a high one is a charger cooking them. Either way the reading is the only warning before an outage finds out for you.",
      gauge: {
        label: "STANDBY BATTERY — FLOAT VOLTAGE", speed: 0.5, green: [0.8, 0.92],
        readout: (t) => `${(22 + t * 6).toFixed(1)} V DC`,
        missNote: "Outside the float band. Low means a failing battery, high means an overcharging one — read it again and commit only inside the band, or write it up for replacement.",
      },
    },
    {
      id: "lamp-check", kind: "hold", target: "lamp-check-button", seconds: 4,
      title: "Run the lamp check",
      cue: "Hold the lamp check button until every LED and the display segment test has lit.",
      why: "An LED that has burned out is a signal that cannot be seen: an alarm lamp that stays dark in a real fire, a trouble lamp that never shows the fault. Holding the lamp check lights every indicator at once so a dead one is obvious, and it is the only way to prove the panel can show what it knows.",
      holdBreakNote: "You let go before every indicator had lit. Hold it through the whole check — a lamp you did not see light is a lamp you have not proven.",
    },
    {
      id: "replace-detector", kind: "drag", target: "spare-detector",
      title: "Seat the replacement detector head",
      cue: "Carry the replacement smoke detector head to the empty base on the soffit and twist it home.",
      why: "The head with the dust cover has been fouled and is being replaced like for like. A head that is only half-seated in its base can look fitted from the floor and still read as missing at the panel — or worse, not report at all. Seating it fully is what puts that part of the corridor back under detection.",
      drag: { to: "detector-base-socket", radius: 0.5, missNote: "Not on the base. Line the head up with the empty base on the soffit before you let it go." },
    },
    {
      id: "smoke-test", kind: "track", target: "smoke-tester-pole", seconds: 6,
      title: "Smoke-test the new head from the floor",
      cue: "Raise the pole tester over the head and keep a steady puff of test aerosol until the detector's LED latches.",
      why: "A new head is not in service until it has been proven to see smoke. Too little aerosol and it never alarms; too much and the residue fouls the chamber you just replaced. The pole keeps you on the floor rather than a ladder under 29 CFR 1910.23, and the latched LED plus the signal at the panel is the proof the device and the circuit both work.",
      track: {
        start: 0.2, green: [0.4, 0.6], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "TEST AEROSOL — PUFF",
        readout: (v) => (v < 0.4 ? "too little — chamber empty" : v > 0.6 ? "too much — fouling the chamber" : "steady — chamber filling"),
      },
      holdBreakNote: "The aerosol went out of the steady band. Too little never trips it, too much ruins it — bring it back and hold it until the LED latches.",
    },
    {
      id: "panel-reset", kind: "select", target: "panel-reset",
      title: "Reset the panel",
      cue: "With the head clear of aerosol, press reset and confirm the panel returns to normal.",
      why: "Smoke detectors latch until the panel is reset, so a successful test ends with the system still showing an alarm. Resetting once the chamber has cleared returns every circuit to watching; resetting too early brings the signal straight back and hides whether the device really cleared.",
    },
    {
      id: "restore-monitoring", kind: "sequence", anyOrder: false,
      targets: ["monitoring-call", "resident-notice"],
      itemNames: { "monitoring-call": "monitoring station — account off test, signals confirmed", "resident-notice": "notice taken down, desk told" },
      title: "Take the account off test",
      cue: "Call the supervising station, confirm they received the test signals and take the account off test, then take the notice down.",
      why: "An account left on test is a building whose real fire will be logged and ignored. Confirming with the supervising station that the test signals actually arrived proves the whole chain — device, panel, communicator, receiver — and taking the account off test is the step people forget when a test runs long.",
      outOfOrderNote: "Off test with the monitoring station first. Taking the notice down while the account is still on test tells residents it is over when a real alarm would still be ignored.",
    },
    {
      id: "lock-panel", kind: "turn", target: "panel-key",
      title: "Lock the panel's controls",
      cue: "Turn the key back to lock the controls and take it with you.",
      why: "A control unit left enabled lets anyone who walks in silence, reset or disable it with a button. Locking it and taking the key back to the key cabinet is the last act of the test — and the one that keeps the panel under the control of the people accountable for it.",
      turn: { turns: 0.25, axis: "z", label: "PANEL KEY", reverse: true, readout: (t) => (t < 0.95 ? "CONTROLS ENABLED" : "CONTROLS LOCKED") },
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the test into the building log",
      cue: "Log the devices tested, the battery reading, the head replaced, the supervisory and the contractor stopped.",
      why: "NFPA 72 expects inspection and testing to be recorded, and the building log is where the building keeps its own copy: what was tested, what failed, what was replaced, and who was stopped from breaching a rated wall. The next technician and the next inspector start from this page.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the technician",
      cue: "Ask the fire alarm technician how the day went, and name the member services line before you leave.",
      why: "Fire alarm work is interrupted constantly — residents, contractors, false alarms and the pressure to get the building off test — and the engineer usually carries the blame for every horn that sounded. A short check-in at the end, with the support line named, keeps the crew talking about the day instead of just the defects.",
    },
  ],

  interrupts: [
    {
      id: "supervisory-tamper",
      kind: "Alarm trouble signal",
      after: "lamp-check", delay: 2, seconds: 12,
      alert: "The panel buzzes and an amber lamp latches: SUPERVISORY — VALVE TAMPER, RISER 2, FLOOR 3. Nobody is supposed to be near that valve.",
      cue: "Break off the lamp check and find where that device is on the zone map.",
      target: "zone-map",
      why: "A valve tamper supervisory means a sprinkler control valve has moved from open — which is how most sprinkler systems are found shut after a fire. The zone map turns the panel's text into a location someone can walk to; the right response is to find it and send someone to see the valve, not to acknowledge the signal and carry on testing.",
      missNote: "The supervisory sat on the panel and nobody went to look. If that valve is really closing, riser 2 is losing its sprinklers on floor 3 and the building is the last to know.",
      wrongNote: "That does not locate it. The zone map on the wall shows where riser 2's floor 3 valve is — find it and send someone.",
    },
    {
      id: "contractor-no-permit",
      kind: "Contractor without a permit",
      after: "smoke-test", delay: 3, seconds: 12,
      alert: "A cable contractor has put a ladder up outside the door and is cutting a hole through the rated wall above it to pull cable. There is no permit posted and no firestop on his cart.",
      cue: "Stop the test and check the permit board before he cuts any further.",
      target: "permit-board",
      why: "A hole through a rated wall without firestop turns a fire barrier into a flue, and NFPA 101 counts on that wall to hold a fire back from the panel room. Work on or near the fire alarm system also needs its permit and a named contractor. Checking the permit board is how the engineer stops him politely, with the building's rules behind the request.",
      missNote: "The contractor finished his hole and moved on. There is now an open penetration in a rated wall over the fire alarm room, and no record of who made it or whether it will ever be sealed.",
      wrongNote: "That will not stop him. Check the permit board — no permit, no work on that wall.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMFA_ACCENT);

    // ------------------------------------------------------------ floor
    const tileTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#9aa3aa", base2: "#8e979e", seam: "rgba(30,34,38,0.25)" }), { repeat: 3, px: 384 });
    const floor = box(g, 6.0, 0.01, 5.6, 0, 0.005, -0.3, 0x9aa3aa, { rough: 0.7, cast: false });
    floor.material = texturedMat(tileTex, { rough: 0.6, metal: 0.05, color: 0xd6dce0 });
    floor.receiveShadow = true;
    decal(g, 2.8, 0.52, 0, 2.62, -4.36, signFace("FIRE ALARM CONTROL ROOM", { bg: "#200e0c", accent: "#e0524a", fg: "#fbe6e2", scale: 0.42 }), { px: 512 });

    // ------------------------------------------------------------ the control unit
    const facp = group(g, -0.2, 0, -2.2);
    box(facp, 1.1, 1.3, 0.22, 0, 1.45, 0, 0xb8261e, { rough: 0.45, metal: 0.3 });
    box(facp, 1.14, 0.04, 0.24, 0, 2.12, 0, 0x8a1a14, { rough: 0.5, metal: 0.3 });
    decal(facp, 0.6, 0.1, 0, 2.0, 0.112, signFace("FIRE ALARM CONTROL UNIT", { bg: "#8a1a14", accent: "#f4efe4", fg: "#ffffff", scale: 0.5 }), { px: 384 });
    const display = decal(facp, 0.5, 0.18, 0, 1.78, 0.112, signFace("SYSTEM NORMAL\n09:41", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.3 }), { glow: true, ei: 0.85, px: 320 });
    reg(hits, display, "fa-history-log");
    const ledColours = [[0x59c97b, "AC POWER"], [0x3a1a18, "ALARM"], [0x3a3018, "SUPERVISORY"], [0x3a3018, "TROUBLE"]];
    const leds = ledColours.map(([c], i) => ball(facp, 0.018, -0.36 + i * 0.1, 1.6, 0.115, c, { rough: 0.4, seg: 8, emissive: i === 0 ? 0x59c97b : 0x000000, ei: 1.4 }));
    decal(facp, 0.42, 0.04, -0.21, 1.56, 0.112, signFace("PWR  ALM  SUP  TBL", { bg: "#b8261e", accent: "#b8261e", fg: "#ffffff", scale: 0.7 }), { px: 256 });
    const btn = (x, y, colour, label, id, tagCss) => {
      const b = group(facp, x, y, 0.115);
      box(b, 0.1, 0.05, 0.02, 0, 0, 0, colour, { rough: 0.5 });
      decal(b, 0.1, 0.025, 0, -0.045, 0.002, signFace(label, { bg: "#b8261e", accent: "#b8261e", fg: "#ffffff", scale: 0.7 }), { px: 128 });
      if (id) reg(hits, b, id);
      if (tagCss) holoTag(b, label, 0, 0.07, 0.01, { css: tagCss, w: 0.26 });
      return b;
    };
    btn(-0.36, 1.42, 0x3a4148, "ACK", "ack-button");
    btn(-0.2, 1.42, 0xf2c14b, "SILENCE", "alarm-silence", "#f0645b");
    btn(-0.04, 1.42, 0x2f7d4a, "RESET", "panel-reset", "#e0524a");
    btn(0.12, 1.42, 0x3a6a9a, "LAMP CHECK", "lamp-check-button", "#e0524a");
    btn(0.3, 1.42, 0x8a3a8a, "DISABLE ZONE", "zone-disable", "#f0645b");
    const keyGrp = group(facp, 0.42, 1.2, 0.115);
    cyl(keyGrp, 0.025, 0.025, 0.02, 0, 0, 0, 0xc9d0d6, { rough: 0.3, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    const keyTurn = group(keyGrp, 0, 0, 0.012);
    box(keyTurn, 0.01, 0.05, 0.01, 0, 0.018, 0, 0xd8b23a, { rough: 0.3, metal: 0.8 });
    keyGrp.userData.wheel = keyTurn;
    holoTag(keyGrp, "Panel key", 0, 0.08, 0.01, { css: "#e0524a", w: 0.2 });
    reg(hits, keyGrp, "panel-key");
    // Battery cabinet below with its meter.
    const batt = group(facp, 0, 0, 0.02);
    box(batt, 0.9, 0.55, 0.26, 0, 0.45, 0, 0x8a1a14, { rough: 0.45, metal: 0.3 });
    for (const sx of [-0.2, 0.2]) {
      box(batt, 0.3, 0.3, 0.16, sx, 0.4, 0.06, 0x2b3138, { rough: 0.6 });
      cyl(batt, 0.015, 0.015, 0.03, sx - 0.08, 0.56, 0.06, 0xc8201a, { rough: 0.4, seg: 6 });
      cyl(batt, 0.015, 0.015, 0.03, sx + 0.08, 0.56, 0.06, 0x1b1e22, { rough: 0.4, seg: 6 });
    }
    const meter = group(g, 0.55, 0.68, -1.95, -0.3);
    box(meter, 0.13, 0.04, 0.2, 0, 0, 0, 0xf2c14b, { rough: 0.55 });
    const meterFace = decal(meter, 0.1, 0.06, 0, 0.022, -0.04, signFace("-- V", { bg: "#0d1c24", accent: "#e0524a", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.85, px: 160 });
    meterFace.rotation.x = -Math.PI / 2;
    box(g, 0.5, 0.66, 0.4, 0.55, 0.33, -1.95, 0x3a4148, { rough: 0.6 });
    holoTag(meter, "Battery meter", 0, 0.14, 0, { css: "#e0524a", w: 0.28 });
    reg(hits, meter, "battery-meter");

    // Record documentation cabinet, door ajar and empty.
    const rec = group(g, -1.1, 0, -2.3);
    box(rec, 0.4, 0.5, 0.14, 0, 1.55, 0, 0xb8261e, { rough: 0.45, metal: 0.3 });
    const recDoor = box(rec, 0.38, 0.48, 0.02, 0.12, 1.55, 0.14, 0xb8261e, { rough: 0.45, metal: 0.3 });
    recDoor.rotation.y = -0.9;
    decal(rec, 0.3, 0.08, 0, 1.72, 0.072, signFace("RECORD DOCUMENTS", { bg: "#8a1a14", accent: "#ffffff", fg: "#ffffff", scale: 0.45 }), { px: 192 });
    const recInside = box(rec, 0.34, 0.4, 0.01, 0, 1.52, 0.07, 0x14171b, { rough: 0.9 });
    reg(hits, recInside, "record-cabinet");
    const docs = box(rec, 0.26, 0.34, 0.06, 0, 1.52, 0.04, 0xe6eef4, { rough: 0.7 });
    docs.visible = false;

    // Zone map beside the panel.
    const zoneMap = holoPanel(g, 0.52, 0.4, 1.05, 1.6, -2.3, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0524a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe6e2"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("ZONE MAP — FLOORS 1–8", w / 2, h * 0.14);
      for (let f = 0; f < 8; f++) {
        cx.strokeStyle = "#e0a49e"; cx.lineWidth = 2; cx.strokeRect(w * 0.12, h * (0.22 + f * 0.09), w * 0.76, h * 0.07);
        cx.fillStyle = "#e0a49e"; cx.font = `${Math.round(h * 0.05)}px Arial`; cx.textAlign = "left"; cx.fillText(`F${8 - f}`, w * 0.14, h * (0.27 + f * 0.09));
      }
      cx.fillStyle = "#f2c14b"; cx.beginPath(); cx.arc(w * 0.7, h * (0.27 + 5 * 0.09), h * 0.02, 0, Math.PI * 2); cx.fill();
    }, { ry: -0.25, accent: PMFA_ACCENT });
    reg(hits, zoneMap, "zone-map");

    // ------------------------------------------------------------ soffit with detectors
    const soffit = group(g, 0.4, 0, -0.6);
    box(soffit, 2.2, 0.1, 1.2, 0, 2.75, 0, 0xe6e8ea, { rough: 0.85 });
    for (const sx of [-1.1, 1.1]) box(soffit, 0.05, 1.45, 0.05, sx, 3.45, 0, 0x6d7379, { rough: 0.5, metal: 0.5, cast: false });
    const head = (x, z) => {
      const d = group(soffit, x, 2.68, z);
      cyl(d, 0.07, 0.07, 0.04, 0, 0, 0, 0xf4f0e6, { rough: 0.5, seg: 16 });
      ball(d, 0.008, 0.05, -0.02, 0, 0xc8201a, { rough: 0.4, seg: 6, emissive: 0xc8201a, ei: 0.4 });
      return d;
    };
    head(-0.7, 0.2);
    const covered = head(0.7, -0.2);
    const cover = cyl(covered, 0.085, 0.085, 0.07, 0, -0.01, 0, 0xdfe8ee, { rough: 0.3, opacity: 0.65, transparent: true, seg: 14 });
    holoTag(covered, "Dust cover?", 0, -0.14, 0, { css: "#e0524a", w: 0.22 });
    reg(hits, cover, "dust-cover");
    const base = group(soffit, 0, 2.69, 0.25);
    cyl(base, 0.06, 0.06, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.5, seg: 16 });
    holoTag(base, "Empty base", 0, -0.1, 0, { css: "#e0524a", w: 0.22 });
    const baseSocket = box(base, 0.2, 0.05, 0.2, 0, -0.03, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["detector-base-socket"] = baseSocket;
    const newLed = ball(base, 0.008, 0.05, -0.04, 0, 0x3a1a18, { rough: 0.4, seg: 6 });
    newLed.visible = false;
    // Spare head on the workbench.
    const bench = group(g, 1.6, 0, -1.2, -0.5);
    box(bench, 1.2, 0.05, 0.6, 0, 0.9, 0, 0x8b6a48, { rough: 0.6 });
    for (const sx of [-0.55, 0.55]) for (const sz of [-0.25, 0.25]) box(bench, 0.04, 0.88, 0.04, sx, 0.44, sz, 0x3a4148, { rough: 0.5, metal: 0.4 });
    const spare = group(bench, -0.25, 0.95, 0.05);
    cyl(spare, 0.07, 0.07, 0.04, 0, 0.02, 0, 0xf4f0e6, { rough: 0.5, seg: 16 });
    holoTag(spare, "Replacement head", 0, 0.14, 0, { css: "#e0524a", w: 0.32 });
    reg(hits, spare, "spare-detector");
    const bagRoll = group(bench, 0.3, 0.95, 0.05);
    cyl(bagRoll, 0.05, 0.05, 0.14, 0, 0.05, 0, 0xdfe8ee, { rough: 0.3, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(bagRoll, "Detector covers", 0, 0.16, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, bagRoll, "detector-bag");
    // Pole tester leaning by the bench.
    const pole = group(g, 1.05, 0, -0.35);
    const shaft = cyl(pole, 0.014, 0.014, 2.3, 0, 1.15, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    shaft.rotation.z = 0.08;
    cyl(pole, 0.09, 0.07, 0.14, -0.09, 2.35, 0, 0x2b3138, { rough: 0.5, seg: 12 });
    holoTag(pole, "Pole smoke tester", 0, 1.0, 0.03, { css: "#e0524a", w: 0.34 });
    reg(hits, pole, "smoke-tester-pole");
    const puff = ball(base, 0.12, 0, -0.12, 0, 0xe8ecef, { rough: 1.0, opacity: 0.35, transparent: true, seg: 10 });
    puff.visible = false;

    // ------------------------------------------------------------ breaker panel, NAC extender
    const bp = group(g, 2.55, 0, -1.9, -Math.PI / 2);
    box(bp, 0.5, 0.8, 0.12, 0, 1.4, 0, 0x8b949d, { rough: 0.45, metal: 0.55 });
    for (let i = 0; i < 6; i++) box(bp, 0.1, 0.03, 0.03, -0.1, 1.65 - i * 0.08, 0.065, 0x2b3138, { rough: 0.5 });
    const faBreaker = box(bp, 0.1, 0.03, 0.03, 0.12, 1.49, 0.065, 0x2b3138, { rough: 0.5 });
    holoTag(bp, "Switch off FA breaker?", 0.12, 1.9, 0.07, { css: "#f0645b", w: 0.4 });
    reg(hits, faBreaker, "fa-breaker-handle");
    const breakerLabel = box(bp, 0.1, 0.03, 0.005, 0.12, 1.44, 0.065, 0xdfe4e8, { rough: 0.6 });
    reg(hits, breakerLabel, "breaker-label");
    const nac = group(g, 2.55, 0, 0.3, -Math.PI / 2);
    box(nac, 0.4, 0.5, 0.14, 0, 1.5, 0, 0xb8261e, { rough: 0.45, metal: 0.3 });
    decal(nac, 0.3, 0.06, 0, 1.68, 0.072, signFace("NAC POWER", { bg: "#8a1a14", accent: "#ffffff", fg: "#ffffff", scale: 0.5 }), { px: 128 });
    for (let i = 0; i < 3; i++) cyl(nac, 0.012, 0.012, 1.3, -0.12 + i * 0.12, 2.4, 0, 0xc8201a, { rough: 0.6, seg: 6, cast: false });

    // ------------------------------------------------------------ desk with phone and notice
    const desk = group(g, -1.9, 0, -0.9, Math.PI / 2);
    box(desk, 1.1, 0.05, 0.55, 0, 0.76, 0, 0x5a4a3a, { rough: 0.6 });
    for (const sx of [-0.5, 0.5]) box(desk, 0.05, 0.74, 0.5, sx, 0.37, 0, 0x3a2a20, { rough: 0.6 });
    const phone = group(desk, -0.2, 0.785, 0);
    box(phone, 0.2, 0.06, 0.16, 0, 0.03, 0, 0x1b1e22, { rough: 0.5 });
    cyl(phone, 0.02, 0.02, 0.2, 0, 0.08, -0.03, 0x1b1e22, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(phone, "Monitoring station", 0, 0.2, 0, { css: "#e0524a", w: 0.36 });
    reg(hits, phone, "monitoring-call");
    const notice = group(g, -1.2, 0, 1.6, 0.4);
    cyl(notice, 0.012, 0.012, 1.3, 0, 0.65, 0, 0x3a4148, { rough: 0.5, seg: 6 });
    box(notice, 0.28, 0.03, 0.28, 0, 0.015, 0, 0x3a4148, { rough: 0.5 });
    const noticeFace = decal(notice, 0.42, 0.3, 0, 1.3, 0.015, paperFace("RESIDENT NOTICE", ["Fire alarm testing today", "09:30 – 12:00", "Horns may sound briefly", "Desk: ext. 100"], { band: "#b81410" }), { px: 256 });
    reg(hits, noticeFace, "resident-notice");

    // ------------------------------------------------------------ boards
    const permits = holoPanel(g, 0.46, 0.32, 2.2, 1.65, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0524a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe6e2"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("WORK PERMITS", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#e8b8b2";
      cx.fillText("Fire alarm: licensed contractor", w / 2, h * 0.56);
      cx.fillText("Penetrations: firestop plan", w / 2, h * 0.74);
    }, { ry: -1.0, accent: PMFA_ACCENT });
    reg(hits, permits, "permit-board");
    const logBoard = holoPanel(g, 0.52, 0.36, -2.35, 1.65, 0.7, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e0524a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe6e2"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e8b8b2";
      ["Devices tested · batteries", "Head replaced · supervisory", "Contractor stopped"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.2, accent: PMFA_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, -2.1, 1.65, 1.75, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Engineer · technician", w / 2, h * 0.56);
      cx.fillText("IUOE Local 39 member services", w / 2, h * 0.74);
    }, { ry: 0.9, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // Conduit drops into the panel, a horn-strobe and an extinguisher by the door.
    for (let i = 0; i < 3; i++) cyl(g, 0.02, 0.02, 2.1, -0.5 + i * 0.3, 3.15, -2.2, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 6, cast: false });
    const hs = group(g, -2.6, 2.1, -0.2, Math.PI / 2);
    box(hs, 0.14, 0.2, 0.06, 0, 0, 0, 0xc8201a, { rough: 0.5 });
    box(hs, 0.08, 0.04, 0.03, 0, 0.05, 0.04, 0xf4f6f8, { rough: 0.2, emissive: 0xf4f6f8, ei: 0.3 });
    decal(hs, 0.1, 0.04, 0, -0.05, 0.032, signFace("FIRE", { bg: "#c8201a", accent: "#c8201a", fg: "#ffffff", scale: 0.7 }), { px: 64 });
    const ext = group(g, 2.5, 0, 1.0);
    cyl(ext, 0.07, 0.07, 0.42, 0, 0.55, 0, 0xc8201a, { rough: 0.45, metal: 0.3, seg: 14 });
    cyl(ext, 0.03, 0.03, 0.08, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.6, seg: 8 });
    box(ext, 0.2, 0.03, 0.12, 0, 0.3, -0.05, 0x3a4148, { rough: 0.5, metal: 0.4 });
    const deskChair = group(g, -1.35, 0, -0.9);
    cyl(deskChair, 0.04, 0.04, 0.45, 0, 0.23, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8 });
    box(deskChair, 0.44, 0.08, 0.44, 0, 0.5, 0, 0x3a2a2a, { rough: 0.7 });
    box(deskChair, 0.06, 0.5, 0.44, 0.2, 0.8, 0, 0x3a2a2a, { rough: 0.7 });
    slab(g, 1.4, 0.01, 0.9, -0.2, 0.012, -1.6, 0x2b3138, { radius: 0.03, rough: 0.95, cast: false });

    // ------------------------------------------------------------ people and the contractor's ladder
    const tech = standingFigure(g, 1.4, 0.6, { ry: -0.6, cloth: 0x2b3a4a, trousers: 0x1b2230, toolBelt: true });
    const ladder = group(g, 1.6, 0, 1.9);
    for (const sx of [-0.2, 0.2]) box(ladder, 0.04, 2.4, 0.04, sx, 1.2, 0, 0xd9a441, { rough: 0.5 });
    for (let i = 0; i < 7; i++) box(ladder, 0.4, 0.03, 0.04, 0, 0.3 + i * 0.3, 0, 0xb8862b, { rough: 0.5 });
    ladder.visible = false;
    const contractor = standingFigure(g, 1.0, 1.95, { ry: Math.PI, cloth: 0x4a5a6a, trousers: 0x2b3138, cap: 0x2f5a9a, atStation: true });
    contractor.visible = false;

    let testing = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.1, 1.5, -2.0),

      onStep(step) {
        if (step.id === "smoke-test") { testing = true; puff.visible = true; }
      },

      onStepComplete(step) {
        if (step.id === "notify-before-test") repaint(display, signFace("ACCOUNT ON TEST", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.34 }));
        if (step.id === "room-walk") { cover.visible = false; breakerLabel.material = mat(0xc8201a, { rough: 0.5 }); docs.visible = true; }
        if (step.id === "battery-voltage") repaint(meterFace, signFace("27.2 V", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.5 }));
        if (step.id === "replace-detector") { spare.visible = false; newLed.visible = true; }
        if (step.id === "smoke-test") {
          testing = false; puff.visible = false;
          newLed.material = mat(0xc8201a, { emissive: 0xc8201a, ei: 2.0 });
          leds[1].material = mat(0xc8201a, { emissive: 0xc8201a, ei: 1.8 });
          repaint(display, signFace("ALARM — F3 SMOKE\nTEST", { bg: "#2a0e0c", accent: "#e0524a", fg: "#ffd2ce", scale: 0.28 }));
        }
        if (step.id === "panel-reset") {
          newLed.material = mat(0x3a1a18, { rough: 0.4 });
          leds[1].material = mat(0x3a1a18, { rough: 0.4 });
          repaint(display, signFace("SYSTEM NORMAL\nON TEST", { bg: "#0d1c14", accent: "#f2c14b", fg: "#c9f5d8", scale: 0.3 }));
        }
        if (step.id === "restore-monitoring") { repaint(display, signFace("SYSTEM NORMAL\n11:52", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.3 })); notice.visible = false; }
      },

      onInterrupt(it) {
        if (it.id === "supervisory-tamper") {
          leds[2].material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.8 });
          repaint(display, signFace("SUPERVISORY\nTAMPER R2 F3", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.3 }));
        }
        if (it.id === "contractor-no-permit") { ladder.visible = true; contractor.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "supervisory-tamper" && it.resolved === "answered") {
          leds[2].material = mat(0x3a3018, { rough: 0.4 });
          repaint(display, signFace("ACCOUNT ON TEST", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.34 }));
        }
        if (it.id === "contractor-no-permit" && it.resolved === "answered") { contractor.visible = false; ladder.visible = false; }
      },

      onHazard(hitId) {
        if (hitId === "fa-breaker-handle") leds[0].material = mat(0x1a2a1a, { rough: 0.4 });
      },

      animate(t, dt, session) {
        tech.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (testing && session?.track) puff.scale.setScalar(0.5 + session.track.v);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "battery-voltage") {
          repaint(meterFace, signFace(`${(22 + gg.t * 6).toFixed(1)} V`, { bg: "#0d1c24", accent: gg.t > 0.8 && gg.t < 0.92 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
    };
  },
};
