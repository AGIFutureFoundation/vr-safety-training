import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet, rackFrame, rackUnit,
  lockTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Building Automation Alarm Triage VR — Building Systems &
// Facilities, the stationary engineer building plant block.
//
// A central plant control room: the BAS workstation and its alarm queue, an
// electrical panel feeding air-handler AHU-3 with its arc-flash label, and a
// rack of point controllers along the back wall. The learner is the IUOE
// stationary engineer triaging the queue, with a control room operator
// watching the workstation. The building and its systems are generic.

const SEB_ACCENT = 0x6fc9e8;
const SEB_CSS = "#6fc9e8";

export const SIM_SE_BUILDING_AUTOMATION_ALARM_TRIAGE = {
  id: "se-building-automation-alarm-triage",
  index: "345",
  domain: "Facilities",
  trade: "IUOE stationary engineer triaging the building automation alarm queue, with a control room operator watching the workstation",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "ANSI/ASHRAE 111 measurement, testing and balancing practice for verifying a point against the physical system, NFPA 70 National Electrical Code and NFPA 70E for the arc-flash label and boundary at the AHU-3 panel, 29 CFR 1910.147 control of hazardous energy for locking out the fan motor before a breaker reset, and IUOE local training fund stationary engineer curricula",
  name: "Building Automation Alarm Triage",
  title: simTitle("Building Automation Alarm Triage VR"),
  tagline: "The queue at shift start: the alarm board read and the top alarm acknowledged, glasses and insulated gloves on, the arc-flash label read before the panel door opens, the physical sensor checked against the screen's own reading, AHU-3's fan motor locked out before the breaker is touched, the breaker reset, the airflow watched back into band, the alarm cleared, a freeze-stat alarm found buried lower in the queue and escalated before it is dismissed as noise, a live fire-alarm spike answered at the panel itself, the point log updated, the crew checked in, and the triage closed",
  accent: SEB_ACCENT,
  accentCss: SEB_CSS,
  parSeconds: 320,
  footprint: 2.7,
  badge: { id: "queue-triaged-clean", name: "Queue Triaged Clean", note: "Every alarm read on its own merits, the panel never opened without PPE, and a buried alarm caught before it was scrolled past" },

  supportLine: "your IUOE local's member assistance programme",

  game: system({
    name: "Alarm Queue",
    currency: "TAG",
    ranks: ["Control Room Hand", "Triage Crew", "Panel Lead", "BAS Certified", "Stationary Engineer Certified"],
    badges: [
      { id: "locked-before-reset", name: "Locked Before Reset", note: "AHU-3's fan motor locked out before the breaker was touched", test: AWARD.stepClean("lockout-ahu") },
      { id: "airflow-held-clean", name: "Airflow Held Clean", note: "The airflow watch stayed in band the whole restart", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never the panel opened bare, never a breaker reset without lockout, never a freeze-stat alarm silenced unread", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-triage", name: "Clean Triage", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "point-on-the-band", name: "Point On The Band", note: "Point-value gauge committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "queue-cleared-fast", name: "Queue Cleared Fast", note: "Triage log closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-panel-no-ppe": "You reached for the panel door before your safety glasses and insulated gloves were on. The arc-flash label on this panel is there because a fault inside it can put more energy into the air in a tenth of a second than the door was ever meant to contain, and the PPE is what stands between that event and the hand that opens it.",
    "skip-lockout-reset-breaker": "You reset the tripped breaker before locking out AHU-3's fan motor. A breaker that trips once has a reason, and resetting it onto a motor that is not locked out means the very first thing that happens if the fault is still there is the motor trying to start again with nobody positioned to catch it.",
    "silence-freeze-alarm-without-check": "You silenced the freeze-stat alarm from the workstation without walking the coil or checking outside air conditions. A freeze-stat trips because coil temperature actually dropped low enough to risk splitting a coil full of water, and silencing it from a screen three floors away, without confirming why it tripped, is how a nuisance alarm and a burst coil get treated exactly the same way until the water shows up.",
    "bypass-safety-interlock": "You forced the software override to run the fan past its own safety interlock instead of finding out why the interlock tripped. The interlock is there because something downstream — a fire damper, a low-limit switch, a smoke detector — decided the fan should not be running, and overriding it from a screen does not change whatever condition made that decision in the first place.",
  },

  lateNotes: {
    "breaker-handle": "The fan motor has to be locked out before this breaker is touched — not after.",
    "airflow-meter": "Nothing to watch yet — the breaker has to be reset before there is any airflow to read.",
    "correction-tag": "Nothing to log yet — escalate the freeze-stat alarm before updating the point database.",
  },

  steps: [
    {
      id: "read-alarm-queue", kind: "select", target: "alarm-board",
      title: "Read the alarm queue at shift start",
      cue: "Read the queue: which alarm is highest priority, what AHU it is on, and what the point history shows.",
      why: "A queue read top to bottom by priority, rather than in whatever order alarms happened to arrive, is what keeps a shift from spending the first hour on a nuisance alarm while a high-priority one sits three rows down unread.",
    },
    {
      id: "ack-priority-alarm", kind: "select", target: "priority-alarm",
      title: "Acknowledge the top-priority alarm",
      cue: "Acknowledge the AHU-3 discharge high-temperature alarm before doing anything else with the queue.",
      why: "Acknowledging the alarm is what tells the rest of the building's operators someone is already on it, and doing it before walking to the panel is what keeps a second engineer from independently chasing the same alarm at the same time.",
    },
    {
      id: "don-panel-ppe", kind: "sequence", anyOrder: true,
      targets: ["safety-glasses", "insulated-gloves"],
      itemNames: { "safety-glasses": "safety glasses", "insulated-gloves": "insulated gloves" },
      title: "Safety glasses and insulated gloves on before the panel door opens",
      cue: "Safety glasses and insulated gloves on before touching the AHU-3 panel door.",
      why: "The panel's own arc-flash label sets a PPE requirement for exactly this kind of door-open, breaker-reset work, and putting the glasses and gloves on before the door even opens is what keeps the label's requirement from being something read after the fact.",
    },
    {
      id: "read-arc-flash-label", kind: "select", target: "panel-label",
      title: "Read the arc-flash label before opening the door",
      cue: "Read the panel's arc-flash label: the boundary distance and the PPE category, before the door comes open.",
      why: "The label is the one place this panel's own incident-energy study is written down where the person about to open it can actually see it, and reading it now — not from memory of the last panel that looked similar — is what makes the PPE already on your hands and eyes the PPE this specific panel actually calls for.",
    },
    {
      id: "verify-point-value", kind: "gauge", target: "field-sensor",
      title: "Check the physical sensor against the BAS screen's reading",
      cue: "Read the discharge sensor at the AHU and commit the reading once it settles inside the band the screen's own alarm implies.",
      why: "A BAS screen shows what its sensor reports, not necessarily what the air is actually doing, and checking the field sensor directly is what tells you whether this is a real high-temperature condition or a sensor that has drifted and is reporting one that is not there.",
      gauge: { label: "DISCHARGE TEMP", speed: 0.65, green: [0.4, 0.62], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the band — hold the sensor reading until it stops moving before you commit it." },
    },
    {
      id: "lockout-ahu", kind: "select", target: "ahu-lockout",
      title: "Lock out AHU-3's fan motor before touching the breaker",
      cue: "Lock and tag the fan motor's disconnect before reaching for the tripped breaker.",
      why: "29 CFR 1910.147 exists for exactly this sequence — a motor that faulted once and tripped its breaker is a motor that can fault again the instant power is restored, and locking it out first is what keeps that second fault from happening with a hand already inside the panel.",
    },
    {
      id: "reset-breaker", kind: "turn", target: "breaker-handle",
      title: "Reset the tripped breaker",
      cue: "Turn the breaker handle from tripped through off to reset, watching it seat rather than forcing it.",
      why: "A breaker reset that skips through its own off position, or is forced past where it should seat, is a reset that does not actually clear the trip mechanism — cycling it through off first, and feeling it seat at reset, is what makes this breaker good for the next fault it needs to catch.",
      turn: { turns: 0.5, label: "BREAKER", readout: (t) => (t < 0.4 ? "off" : t < 0.85 ? "resetting" : "reset") },
    },
    {
      id: "restart-airflow-watch", kind: "track", target: "airflow-meter", seconds: 6,
      title: "Watch the airflow climb back into band",
      cue: "Watch the airflow reading as the fan restarts, keeping it inside the band all the way to a steady run.",
      why: "A fan that restarts and then trips again a few seconds later looks fine for the first moment, and holding the watch through the whole climb — rather than walking away the moment airflow appears — is what catches a fault that only shows up once the motor is actually under load.",
      track: { start: 0.1, green: [0.55, 0.8], rise: 0.5, fall: 0.2, drift: 0.1, label: "AIRFLOW", readout: (v) => (v < 0.55 ? "climbing" : v > 0.8 ? "overshoot" : "steady") },
      holdBreakNote: "The watch broke off before the airflow settled — a restart that is only checked for the first second misses exactly the fault that trips a few seconds in.",
    },
    {
      id: "clear-alarm", kind: "select", target: "bas-screen",
      title: "Clear the alarm on the BAS screen",
      cue: "Clear the AHU-3 discharge alarm once the airflow reading has actually settled into its steady band.",
      why: "Clearing the alarm is the record that this specific condition was checked, corrected and confirmed — not just acknowledged — and doing it only after the airflow watch settled is what keeps the queue's own history honest about what was actually fixed.",
    },
    {
      id: "find-hidden-alarm", kind: "find", noHint: true,
      targets: ["freeze-stat-alarm"],
      itemNames: { "freeze-stat-alarm": "freeze-stat alarm lower in the queue" },
      itemNotes: { "freeze-stat-alarm": "A freeze-stat alarm on a different air handler sits several rows down the queue, easy to scroll past while AHU-3 held the screen's attention — it is escalated, not silenced." },
      title: "Scroll the rest of the queue before closing it out",
      cue: "Scroll down through the rest of the alarm queue for anything else that has been sitting unread.",
      why: "A queue that gets closed the moment the top alarm clears is a queue that never gets read past the first row, and scrolling the rest of it now — while you are already at the workstation — is what catches a second, quieter alarm before a full shift goes by with nobody having read it.",
    },
    {
      id: "escalate-freeze-alarm", kind: "select", target: "escalation-radio",
      title: "Escalate the freeze-stat alarm",
      cue: "Call the freeze-stat alarm in for a coil check rather than clearing it from the screen alone.",
      why: "A freeze-stat trip needs eyes on the actual coil before anyone decides it was nuisance, and escalating it now — while it is still fresh in the queue — is what gets a second engineer walking that AHU before outside air conditions get any colder.",
    },
    {
      id: "update-point-log", kind: "drag", target: "correction-tag",
      title: "Update the point database with today's correction",
      cue: "Carry the correction tag from the workstation to the point database entry for AHU-3's discharge sensor.",
      why: "A sensor that drifted enough to trigger a false high-temperature alarm needs its calibration corrected in the point database, not just cleared on today's screen, and moving the correction tag onto the actual point entry is what keeps tomorrow's shift from triaging the exact same drift as a brand-new alarm.",
      drag: { to: "point-db-marker", radius: 0.5, missNote: "Not on the point database entry — the correction tag has to land on AHU-3's own point record, not just back on the workstation desk." },
    },
    {
      id: "crew-checkin", kind: "select", target: "control-radio",
      title: "Check in with the control room operator",
      cue: "Call the operator: AHU-3 cleared, the freeze-stat escalated, and the panel closed up.",
      why: "The operator watching the workstation is the one who sees the next alarm the moment it lands, and a triage that ends without a verbal handoff is a triage the operator has to reconstruct from the screen alone instead of hearing directly from the engineer who was just at the panel.",
    },
    {
      id: "close-triage-log", kind: "select", target: "triage-log",
      title: "Close the triage log",
      cue: "Record the AHU-3 fault, the sensor correction, and the freeze-stat escalation before signing off the shift.",
      why: "The triage log is what the next shift reads before their own queue starts filling, and a freeze-stat escalation that never makes the log is a coil check the next engineer has no way of knowing was already called in.",
    },
  ],

  interrupts: [
    {
      id: "second-ahu-alarm-trips",
      kind: "A second AHU trips while the first restart is still being watched",
      after: "reset-breaker", delay: 2, seconds: 14,
      alert: "A second air handler has just tripped on its own high-temperature alarm while AHU-3's restart is still being watched.",
      cue: "Break off and lock out the second AHU before it cascades further — the airflow watch on AHU-3 waits.",
      target: "second-ahu-marker",
      why: "Two air handlers tripping close together is often one shared cause — a chiller fault, a shared electrical feeder — and getting the second one locked out now is what keeps a two-alarm event from becoming a three- or four-alarm one while attention stays fixed on the first restart.",
      missNote: "The airflow watch on AHU-3 continued while the second AHU sat tripped and unlocked; by the time anyone reached it, a third handler on the same feeder had also tripped.",
      wrongNote: "The second AHU's own lockout — a cascading trip is answered by securing the next unit, not by finishing the watch already underway.",
    },
    {
      id: "fire-alarm-point-spike",
      kind: "A life-safety point spikes on the BAS mid-triage",
      after: "find-hidden-alarm", delay: 2, seconds: 12,
      alert: "A smoke-detector point on the BAS has just spiked into alarm while you are still working the queue.",
      cue: "Go to the fire alarm panel now and verify it directly — the freeze-stat escalation waits.",
      target: "fire-panel-marker",
      why: "A life-safety alarm always outranks a routine BAS queue, and verifying it at the actual fire alarm panel — not from the BAS screen's own summary of it — is the only way to know in the next few seconds whether this building needs an evacuation or is reading a false alarm from a dusty detector.",
      missNote: "The freeze-stat escalation was finished first while the smoke-detector point sat unverified; the fire alarm panel was not checked until the monitoring company's own callback came in.",
      wrongNote: "The fire alarm panel — a life-safety spike is verified immediately, ahead of anything already in the routine queue.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, SEB_ACCENT);

    // -------------------------------------------------------------- floor
    box(g, 6.0, 0.06, 5.0, 0, 0.03, 0, 0x2b2f34, { rough: 0.9, finish: "concrete", tile: 3 });

    // ------------------------------------------------------------ workstation
    const desk = box(g, 1.3, 0.04, 0.6, -1.6, 0.72, 0.6, 0x3c444c, { rough: 0.5, metal: 0.3 });
    void desk;
    const screen = holoPanel(g, 0.95, 0.62, -1.6, 1.3, 0.35, (cx, w, h) => {
      cx.fillStyle = "#0b1a1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = SEB_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5fb"; cx.fillText("ALARM QUEUE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eefaff";
      ["1. AHU-3 discharge HIGH TEMP", "2. Chiller-2 status normal", "3. AHU-7 freeze-stat (unread)", "4. Cooling tower normal"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.3 + i * 0.15)));
    }, { ry: 0.3, accent: SEB_ACCENT });
    reg(hits, screen, "alarm-board");
    const alarmRow = box(g, 0.6, 0.03, 0.03, -1.8, 1.2, 0.35, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 1.2 });
    holoTag(alarmRow, "AHU-3 alarm", 0, 0.15, 0, { css: SEB_CSS, w: 0.3 });
    reg(hits, alarmRow, "priority-alarm");
    const bypassHit = box(g, 0.3, 0.15, 0.05, -1.3, 1.1, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "force the interlock?", -1.3, 1.35, 0.35, { css: "#d2312b", w: 0.44 });
    reg(hits, bypassHit, "bypass-safety-interlock");
    const clearBtn = box(g, 0.12, 0.05, 0.02, -1.9, 0.95, 0.35, 0x2b3138, { rough: 0.5 });
    holoTag(clearBtn, "clear alarm", 0, 0.14, 0, { css: SEB_CSS, w: 0.28 });
    reg(hits, clearBtn, "bas-screen");
    const silenceHit = box(g, 0.25, 0.1, 0.02, -1.4, 0.95, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "silence it unread?", -1.4, 1.15, 0.35, { css: "#d2312b", w: 0.4 });
    reg(hits, silenceHit, "silence-freeze-alarm-without-check");
    const freezeHit = box(g, 0.6, 0.02, 0.03, -1.8, 1.0, 0.35, 0xe8b02e, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "freeze-stat row", -1.8, 0.9, 0.4, { css: SEB_CSS, w: 0.3 });
    reg(hits, freezeHit, "freeze-stat-alarm");

    // ---------------------------------------------------------------- rack
    const rack = rackFrame(g, -2.5, 1.6, { ry: 0.5, h: 1.6 });
    rackUnit(rack, 0.3, "AHU-3");
    rackUnit(rack, 0.5, "AHU-7");
    rackUnit(rack, 0.7, "CHW-2");
    const correctionTag = decal(rack, 0.2, 0.24, 0, 0.95, 0.26, paperFace("CORRECTED", ["AHU-3 discharge"], { bg: "#f2e0a0", band: SEB_CSS }), { px: 128 });
    reg(hits, correctionTag, "correction-tag");
    const pointDb = group(g, -2.5, 0, 0.1);
    box(pointDb, 0.3, 0.02, 0.2, 0, 1.05, 0, 0x2b3138, { rough: 0.6 });
    holoTag(pointDb, "point database", 0, 1.2, 0, { css: SEB_CSS, w: 0.34 });
    reg(hits, pointDb, "point-db-marker");

    // -------------------------------------------------------------- panel
    const panel = equipmentCabinet(g, 0.7, 1.2, 0.4, 1.4, -1.4, { color: 0xe8b02e, open: 0.9 });
    holoTag(panel, "AHU-3 panel", 0, 1.5, -1.4, { css: SEB_CSS, w: 0.32 });
    const labelDecal = decal(panel.userData.door, 0.36, 0.5, 0.34 - 0.03, 0, 0.03, (cx, w, h) => {
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a1400"; cx.font = `700 ${Math.round(h * 0.14)}px Arial, sans-serif`; cx.textAlign = "center";
      cx.fillText("WARNING", w / 2, h * 0.18);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("ARC FLASH", w / 2, h * 0.34);
      cx.fillText("BOUNDARY 4 ft", w / 2, h * 0.46);
      cx.fillText("PPE CAT 2", w / 2, h * 0.58);
    }, { px: 128 });
    reg(hits, labelDecal, "panel-label");
    const openHit = box(g, 0.3, 0.6, 0.05, 1.7, 1.0, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open the panel bare?", 1.7, 1.4, -1.4, { css: "#d2312b", w: 0.44 });
    reg(hits, openHit, "open-panel-no-ppe");
    const breaker = box(panel, 0.06, 0.12, 0.05, 0, 0.1, 0.03, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(panel, "breaker — reset", 0, 0.32, 0, { css: SEB_CSS, w: 0.3 });
    reg(hits, breaker, "breaker-handle");
    const lockPoint = lockTag(g, 1.15, 1.1, -1.3, { lines: ["AHU-3 FAN", "LOCKED OUT"] });
    reg(hits, lockPoint, "ahu-lockout");
    const skipLockoutHit = box(g, 0.15, 0.1, 0.05, 1.5, 0.95, -1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reset without lockout?", 1.5, 1.2, -1.35, { css: "#d2312b", w: 0.46 });
    reg(hits, skipLockoutHit, "skip-lockout-reset-breaker");

    // -------------------------------------------------------------- sensor
    const sensor = instrument(g, 2.0, 1.5, -0.6, { ry: -0.5, idle: "-- °F", color: SEB_ACCENT, w: 0.1, d: 0.14 });
    holoTag(sensor, "field sensor", 0, 0.18, 0, { css: SEB_CSS, w: 0.3 });
    reg(hits, sensor, "field-sensor");
    const airflowGauge = instrument(g, 2.0, 1.5, -1.0, { ry: -0.5, idle: "-- CFM", color: SEB_ACCENT, w: 0.1, d: 0.16 });
    holoTag(airflowGauge, "airflow meter", 0, 0.18, 0, { css: SEB_CSS, w: 0.3 });
    reg(hits, airflowGauge, "airflow-meter");

    // ------------------------------------------------------------ second AHU
    const secondAhu = group(g, 2.6, 0, 1.6);
    box(secondAhu, 0.5, 0.7, 0.4, 0, 0.35, 0, 0x3c444c, { rough: 0.5, metal: 0.4 });
    holoTag(secondAhu, "second AHU", 0, 0.8, 0, { css: SEB_CSS, w: 0.32 });
    reg(hits, secondAhu, "second-ahu-marker");

    // -------------------------------------------------------------- fire panel
    const firePanel = group(g, -0.6, 0, 2.2);
    box(firePanel, 0.4, 0.6, 0.15, 0, 0.5, 0, 0xd2312b, { rough: 0.5 });
    holoTag(firePanel, "fire alarm panel", 0, 0.85, 0, { css: SEB_CSS, w: 0.4 });
    reg(hits, firePanel, "fire-panel-marker");

    // -------------------------------------------------------------- radios
    const chest = toolChest(g, -2.3, -1.5, { ry: 0.6, color: 0x2b3138 });
    const escRadio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 7 · OPS", color: SEB_ACCENT, w: 0.1, d: 0.16 });
    holoTag(escRadio, "escalation radio", 0, 0.16, 0, { css: SEB_CSS, w: 0.38 });
    reg(hits, escRadio, "escalation-radio");
    const ctrlRadio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 7 · CTRL", color: SEB_ACCENT, w: 0.1, d: 0.16 });
    holoTag(ctrlRadio, "control room radio", 0, 0.16, 0, { css: SEB_CSS, w: 0.4 });
    reg(hits, ctrlRadio, "control-radio");

    // -------------------------------------------------------------- PPE rack
    const rack2 = group(g, -0.4, 0, 1.6, 0.3);
    cyl(rack2, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack2, 0.4, 0.03, 0.03, 0, 1.15, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const glassesProp = group(rack2, -0.1, 0.85, 0);
    box(glassesProp, 0.14, 0.05, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.6, transparent: true });
    holoTag(rack2, "safety glasses", -0.1, 1.0, 0, { css: SEB_CSS, w: 0.34 });
    reg(hits, glassesProp, "safety-glasses");
    const glovesProp = group(rack2, 0.14, 0.85, 0);
    box(glovesProp, 0.14, 0.2, 0.02, 0, 0, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(rack2, "insulated gloves", 0.14, 1.0, 0, { css: SEB_CSS, w: 0.36 });
    reg(hits, glovesProp, "insulated-gloves");

    // -------------------------------------------------------------- log
    const log = holoPanel(g, 0.6, 0.42, -0.4, 1.3, -2.2, (cx, w, h) => {
      cx.fillStyle = "#0b1a1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = SEB_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5fb"; cx.fillText("TRIAGE LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaff";
      ["AHU-3: —", "Sensor: —", "Freeze-stat: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.5, accent: SEB_ACCENT });
    reg(hits, log, "triage-log");

    // ------------------------------------------------------------------ crew
    const operator = standingFigure(g, -1.0, 1.4, { ry: -1.5, cloth: 0x2b3138, vest: SEB_ACCENT, helmet: 0xf2f2f2 });
    holoTag(operator, "control room operator", 0, 1.95, 0, { css: SEB_CSS, w: 0.46 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ack-priority-alarm") alarmRow.material = mat(0xf2ae14, { emissive: 0x6a4a08, ei: 0.6, rough: 0.5 });
        if (step.id === "verify-point-value") repaint(sensor.userData.screen, signFace("MATCH", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "lockout-ahu") lockPoint.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "clear-alarm") alarmRow.material = mat(0x59c97b, { emissive: 0x1a5a2a, ei: 0.5, rough: 0.5 });
        if (step.id === "escalate-freeze-alarm") repaint(escRadio.userData.screen, signFace("ESCALATED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        if (step.id === "crew-checkin") repaint(ctrlRadio.userData.screen, signFace("QUEUE CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
        if (step.id === "close-triage-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0b1a1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dff5fb"; cx.fillText("TRIAGE LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["AHU-3: cleared", "Sensor: recalibrated", "Freeze-stat: escalated"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "second-ahu-alarm-trips") secondAhu.children[0].material = mat(0xf0645b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.5 });
        if (it.id === "fire-alarm-point-spike") firePanel.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-ahu-alarm-trips") secondAhu.children[0].material = mat(0x59c97b, { rough: 0.5 });
        if (it.id === "fire-alarm-point-spike") firePanel.children[0].material = mat(0xd2312b, { rough: 0.5 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "reset-breaker") breaker.rotation.x = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify-point-value") repaint(sensor.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "restart-airflow-watch" && session.holding) repaint(airflowGauge.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v >= 0.55 && session.track.v <= 0.8 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY;
      },
    };
  },
};
