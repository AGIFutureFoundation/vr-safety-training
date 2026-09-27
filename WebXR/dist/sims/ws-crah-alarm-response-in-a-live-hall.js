import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, pavingFace, gratingFace, palette,
} from "../citykit.js";
import { multimeter, radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ CRAH Alarm Response in a Live Hall VR — Connectivity &
// Telecom, IBEW critical-facilities technician.
//
// A computer-room air handler alarms in a hall full of running racks. The
// response is a sequence, not a reflex: read the alarm, tell the hall
// operator, read the supply air against its band, walk the unit down, bring
// the standby unit on per the hall's procedure, and watch the hall recover
// before the failed unit is isolated, locked, tested dead and serviced.
// Sited generically: no temperature, set point, flow or voltage is stated —
// each is the hall's operating procedure and the unit manufacturer's manual.

const WS7_ACCENT = 0x6fb0e6;
const WS7_CSS = "#6fb0e6";
const WS7_PAL = palette("warehouse");

export const SIM_WS_CRAH_ALARM_RESPONSE_IN_A_LIVE_HALL = {
  id: "ws-crah-alarm-response-in-a-live-hall",
  index: "ws-07",
  domain: "Connectivity",
  trade: "IBEW critical-facilities technician",
  category: "Connectivity & Telecom",
  district: "data-center-build",
  weather: "overcast",
  certification: "IBEW/NECA JATC critical-facilities training as a body; 29 CFR 1910.147 for isolating the air handler before service; NFPA 70E and 29 CFR 1910.333 for the absence-of-voltage test at its disconnect; 29 CFR 1910.22 for a wet floor in the hall; 29 CFR 1910.38 for the hall's emergency action plan when the suppression system pre-alarms; the hall's operating procedure and the unit manufacturer's manual for every set point and limit",
  name: "CRAH Alarm Response in a Live Hall",
  title: simTitle("CRAH Alarm Response in a Live Hall"),
  tagline: "The alarm read and reported, the supply air read against its band, the unit walked down, the standby brought on per the procedure and the hall watched back before the failed unit is isolated and serviced",
  accent: WS7_ACCENT,
  accentCss: WS7_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "hall-held", name: "Hall Held", note: "The hall kept cool on the standby unit while the failed one was isolated, proven dead and serviced" },

  game: system({
    name: "Critical Facilities Authority",
    currency: "RACKS",
    ranks: ["Trainee", "Facilities Tech", "Critical Facilities Tech", "Lead Tech", "Critical Facilities Authority Certified"],
    badges: [
      { id: "reported-first", name: "Reported First", note: "The hall operator heard about it before anything was touched", test: AWARD.stepClean("tell-operator") },
      { id: "no-reflexes", name: "No Reflexes", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-watch", name: "Steady Watch", note: "Held the hall recovery watch steady", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "No corrections from the alarm to the log", test: AWARD.clean },
      { id: "unbroken-test", name: "Unbroken Test", note: "The absence test ran without a break", test: AWARD.unbroken },
      { id: "brisk-response", name: "Brisk Response", note: "Responded and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "silence-and-walk-away": "You went to silence the alarm and walk on. A silenced alarm is still a failing unit, and in a live hall the racks on its side warm with every minute nobody is working the problem.",
    "reach-into-running-fan": "You went to open the fan section with the unit still energised. The fans restart on their own control, and a hand in a fan section when they do is the injury the lockout exists to prevent.",
    "prop-containment-door": "You went to prop the cold-aisle containment door open to let the heat out. Containment works by keeping hot and cold air apart; propped open, it mixes them and makes every rack in the row run hotter.",
    "reset-breaker-repeatedly": "You went to reset the unit's tripped breaker again and again. A breaker that trips is reporting a fault, and resetting it onto that fault repeatedly can turn a failed fan motor into an arc in the panel.",
  },

  lateNotes: {
    "crah-access-latch": "The access panel opens only once the unit is locked out and proven dead.",
    "standby-unit-start": "The standby unit is brought on as soon as the walk-down is done — before the failed unit is taken apart, not after.",
  },

  faults: [
    {
      id: "crah-leak-detect",
      label: "CRAH leak detection",
      note: "The leak-detection cable under the unit is alarming and water is showing on the slab beneath the raised floor. The first move changes: isolate the chilled-water supply to the unit before anything else.",
      step: "standby",
      change: {
        target: "chilled-water-valve",
        title: "Isolate the chilled water to the leaking unit",
        cue: "The leak detector is alarming — close the unit's chilled-water isolation valves before bringing anything else on.",
        why: "Water under a raised floor finds the power whips and the cable trays, and every minute the supply stays open feeds the leak; closing the unit's isolation valves stops the source first, and the standby unit and the service follow once the water has stopped coming.",
      },
    },
  ],

  interrupts: [
    {
      id: "suppression-prealarm",
      kind: "The suppression panel goes to pre-alarm",
      after: "recovery-watch", delay: 3, seconds: 12,
      alert: "The clean-agent suppression panel at the hall door has gone to pre-alarm on a detector in this zone.",
      cue: "Go to the suppression panel and read the zone and the state.",
      target: "suppression-panel",
      why: "A pre-alarm is the system telling the people in the hall that a detector has seen something; reading the panel gives the zone and state that decide whether the emergency action plan's next step is investigate or leave, and nobody decides that from across the hall.",
      missNote: "The pre-alarm went unread while the work went on.",
      wrongNote: "It is the suppression panel. The recovery watch tells you about cooling, not a detector.",
    },
    {
      id: "water-spreading",
      kind: "Condensate spreads toward a power whip",
      after: "absence-test", delay: 3, seconds: 11,
      alert: "Condensate from the unit's pan is running across the floor toward a power whip at the end of the row.",
      cue: "Get the spill kit down across the water's path.",
      target: "spill-kit",
      why: "Water heading for a power connection is two hazards at once — a slip and an electrical one — and a spill kit's sock laid across its path stops it where it is while the source is dealt with.",
      missNote: "The water reached the power whip with nothing in its way.",
      wrongNote: "It is the spill kit. The tester has told you the unit is dead; the water is somewhere else.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "read-alarm", kind: "select", target: "alarm-panel",
      title: "Read the alarm",
      cue: "Read the building management panel: which unit, which alarm, and since when.",
      why: "A high-temperature alarm, a fan failure and a filter alarm send the technician to different places with different urgency; reading the panel first puts the right tool in hand and the right unit in front of you instead of chasing the loudest noise in the hall.",
    },
    {
      id: "tell-operator", kind: "select", target: "hall-operator-radio",
      title: "Tell the hall operator",
      cue: "Radio the hall operator: the unit, the alarm, and that you are responding.",
      why: "The hall operator sees the whole hall's cooling and load and may already be moving work off the affected racks; telling them first means two people are working the same problem with the same facts.",
    },
    {
      id: "supply-read", kind: "gauge", target: "supply-air-readout",
      title: "Read the supply air against its band",
      cue: "Bring the supply-air reading up to where it is and commit — inside the hall's band or not?",
      why: "The supply air leaving the unit says whether it is still cooling at all, and the hall's operating procedure sets the band; read against that written band, the reading decides whether this is a service call or a race to bring the standby unit on.",
      gauge: { label: "SUPPLY AIR vs BAND", speed: 0.6, green: [0.55, 0.85], readout: (t) => (t < 0.55 ? "inside the band" : "above the band — standby needed"), missNote: "That is not what the unit is reading — read it again before deciding on the standby." },
    },
    {
      id: "walk-down", kind: "sequence",
      targets: ["crah-filter-status", "fan-status-lamp", "condensate-pan"],
      itemNames: { "crah-filter-status": "filter differential checked", "fan-status-lamp": "fan status checked", "condensate-pan": "condensate pan checked" },
      title: "Walk the unit down",
      cue: "Check the filter differential, then the fan status, then the condensate pan.",
      why: "A walk-down in the same order every time finds the common causes — a loaded filter, a stopped fan, a full pan — without opening anything, and tells the technician what to bring for the repair before the unit is isolated.",
      outOfOrderNote: "Filter, fan, pan — the order the walk-down sheet runs.",
    },
    {
      id: "find-cause", kind: "find", noHint: true,
      targets: ["clogged-filter", "tripped-fan-breaker"],
      itemNames: { "clogged-filter": "a clogged filter bank", "tripped-fan-breaker": "a tripped fan breaker" },
      itemNotes: {
        "clogged-filter": "The filter differential is well past its change mark — the fans are pulling through a blanket and airflow has dropped.",
        "tripped-fan-breaker": "One fan's breaker has tripped. It is reported and investigated, not reset onto whatever tripped it.",
      },
      title: "Find why the unit is failing",
      cue: "Find what is causing the alarm on the unit.",
      why: "Knowing the cause decides the repair and whether it is safe to restore: a clogged filter is a swap, while a tripped fan breaker is a fault somebody has to find before the fan runs again.",
    },
    {
      id: "standby", kind: "select", target: "standby-unit-start",
      title: "Bring the standby unit on",
      cue: "Start the standby unit per the hall's procedure and confirm it is running.",
      why: "The hall's racks cannot wait for the repair, so the redundancy the hall was built with is brought on first; confirming the standby is actually running and moving air, not just switched, is what lets the failed unit be taken out of service.",
    },
    {
      id: "recovery-watch", kind: "track", target: "hall-temp-meter", seconds: 7,
      title: "Watch the hall recover",
      cue: "Keep watching the cold-aisle reading as the standby unit takes the load.",
      why: "A standby unit that starts but does not bring the cold aisle back is a second problem; watching the reading recover proves the hall is held before anyone isolates the failed unit and takes away what is left of its cooling.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.1, label: "COLD AISLE", readout: (v) => (v > 0.65 ? "still climbing" : v < 0.35 ? "check the sensor" : "recovering") },
      holdBreakNote: "The watch broke before the hall recovered — keep watching until the cold aisle is back.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["crah-disconnect", "crah-lock", "crah-tag"],
      itemNames: { "crah-disconnect": "unit disconnect opened", "crah-lock": "personal lock applied", "crah-tag": "tag filled in and hung" },
      title: "Isolate the failed unit",
      cue: "Open the unit's disconnect, apply your lock, then hang your tag.",
      why: "The unit's fans and heaters restart on their own controls, and the building management system can call it back on; the disconnect, your lock and your tag are what keep it off while hands are inside.",
      outOfOrderNote: "Disconnect, then lock, then tag.",
    },
    {
      id: "absence-test", kind: "hold", target: "unit-tester", seconds: 5,
      title: "Test the unit dead",
      cue: "Hold the proven tester on each phase at the unit's terminals until it reads absent.",
      why: "A unit can be fed from more than one source, and an open disconnect can be the wrong one; the test at the unit's own terminals, with a tester proven before and after, is the proof that what you are about to touch is dead.",
      holdBreakNote: "The tester came off before it read — hold it on each phase until it does.",
    },
    {
      id: "open-panel", kind: "turn", target: "crah-access-latch",
      title: "Open the access panel",
      cue: "Turn the access-panel latch and swing the panel open.",
      why: "The panel comes off only once the unit is proven dead, and it is swung open on its hinge rather than lifted off so it does not fall into the aisle or onto a floor tile edge.",
      turn: { turns: 0.4, axis: "z", label: "ACCESS LATCH" },
    },
    {
      id: "swap-filter", kind: "drag", target: "new-filter",
      title: "Fit the new filters",
      cue: "Carry the new filter bank to the slot and seat it with the airflow arrow the right way.",
      why: "A filter fitted backwards or not seated in its frame lets air bypass it, and the unit's coil loads with dust instead; the arrow and the frame are checked because that is what makes the swap a repair.",
      drag: { to: "filter-slot", radius: 0.5, missNote: "The filter is not seated in the slot — the arrow faces the airflow and the frame closes round it." },
    },
    {
      id: "log", kind: "select", target: "bms-log",
      title: "Log the response",
      cue: "Log the alarm, the cause, the standby start and the lockout, and tell the hall operator the unit's state.",
      why: "The log is how the next shift knows the hall is running on its standby unit and why, and the tripped breaker stays on it as an open item until someone has found what tripped it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS7_ACCENT);

    const slabTex = surfaceTexture((ctx, w, h) => pavingFace(ctx, w, h), { repeat: 3, px: 256 });
    const slab = box(g, 6.6, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.9 });
    slab.material = texturedMat(slabTex, { rough: 0.9, color: 0xb9bcc0 });

    // The failed CRAH unit and the standby unit.
    const unitTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#4a5058", base2: "#3a4047" }), { repeat: 2, px: 200 });
    const unit = group(g, -0.8, 0, -1.9);
    box(unit, 1.6, 2.2, 0.9, 0, 1.1, 0, 0xd7dbdd, { rough: 0.5, metal: 0.2 });
    const grille = box(unit, 1.4, 0.8, 0.02, 0, 1.6, 0.46, 0xffffff, { rough: 0.6 });
    grille.material = texturedMat(unitTex, { rough: 0.6, metal: 0.3 });
    const panelHinge = group(unit, -0.7, 0.2, 0.47);
    const accessPanel = box(panelHinge, 1.4, 0.9, 0.03, 0.7, 0.45, 0, 0xc9ced2, { rough: 0.5 });
    void accessPanel;
    const latch = box(unit, 0.06, 0.12, 0.04, 0.6, 0.65, 0.5, 0x2b3138, { rough: 0.4, metal: 0.5 });
    holoTag(unit, "access latch", 0.6, 0.88, 0.5, { css: WS7_CSS, w: 0.26 });
    reg(hits, latch, "crah-access-latch");
    const filterSlot = group(unit, 0, 0.6, 0.3);
    hits["filter-slot"] = filterSlot;
    const oldFilter = box(unit, 1.2, 0.6, 0.05, 0, 0.6, 0.35, 0x8a7a5a, { rough: 0.9 });
    reg(hits, oldFilter, "clogged-filter");
    const alarmLamp = cyl(unit, 0.06, 0.06, 0.06, 0.6, 2.05, 0.47, 0xf2ae14, { emissive: 0xff8a00, ei: 1.4, seg: 10 });
    alarmLamp.rotation.x = Math.PI / 2;
    const filterDp = instrument(unit, -0.5, 1.05, 0.47, { idle: "FILTER ΔP", color: 0x2b2f34, w: 0.16, d: 0.03 });
    reg(hits, filterDp, "crah-filter-status");
    const fanLamp = cyl(unit, 0.04, 0.04, 0.04, -0.1, 1.1, 0.47, 0xd2312b, { emissive: 0xd2312b, ei: 1.0, seg: 10 });
    fanLamp.rotation.x = Math.PI / 2;
    reg(hits, fanLamp, "fan-status-lamp");
    const pan = box(unit, 1.4, 0.08, 0.3, 0, 0.08, 0.55, 0x8b949b, { rough: 0.5, metal: 0.5 });
    reg(hits, pan, "condensate-pan");
    const supply = instrument(unit, 0.15, 1.05, 0.47, { idle: "SUPPLY", color: 0x2b2f34, w: 0.16, d: 0.03 });
    holoTag(unit, "supply air", 0.15, 1.28, 0.5, { css: WS7_CSS, w: 0.24 });
    reg(hits, supply, "supply-air-readout");
    holoTag(unit, "CRAH-2 (alarming)", 0, 2.45, 0.3, { css: "#f2ae14", w: 0.38 });
    const cwValve = torus(unit, 0.09, 0.02, 0.95, 0.4, 0.2, 0x3fa7d6, { rough: 0.4, seg: 6, seg2: 12 });
    holoTag(unit, "chilled-water valve", 1.1, 0.7, 0.2, { css: WS7_CSS, w: 0.36 });
    reg(hits, cwValve, "chilled-water-valve");
    for (const vy of [0.25, 0.55]) { const p = cyl(unit, 0.04, 0.04, 0.6, 0.95, vy, -0.1, 0x3fa7d6, { rough: 0.4, metal: 0.5, seg: 8 }); p.rotation.x = Math.PI / 2; }
    const leak = box(g, 1.4, 0.005, 0.8, -0.8, 0.065, -1.0, 0x6fb0e6, { rough: 0.1, metal: 0.4, opacity: 0.6, transparent: true });
    leak.visible = false;
    const leakLamp = cyl(g, 0.04, 0.04, 0.04, -1.8, 1.9, -1.4, 0x444444, { rough: 0.4, seg: 10 });

    const standby = group(g, 1.4, 0, -1.9);
    box(standby, 1.6, 2.2, 0.9, 0, 1.1, 0, 0xd7dbdd, { rough: 0.5, metal: 0.2 });
    const sGrille = box(standby, 1.4, 0.8, 0.02, 0, 1.6, 0.46, 0xffffff, { rough: 0.6 });
    sGrille.material = texturedMat(unitTex, { rough: 0.6, metal: 0.3 });
    const sBtn = cyl(standby, 0.05, 0.05, 0.04, 0.5, 1.1, 0.47, 0x59c97b, { rough: 0.4, seg: 12 });
    sBtn.rotation.x = Math.PI / 2;
    holoTag(standby, "standby CRAH-3 start", 0.3, 1.35, 0.5, { css: WS7_CSS, w: 0.4 });
    reg(hits, sBtn, "standby-unit-start");
    const sLamp = cyl(standby, 0.05, 0.05, 0.05, 0.6, 2.05, 0.47, 0x444444, { rough: 0.4, seg: 10 });
    sLamp.rotation.x = Math.PI / 2;

    // Disconnect, tester, filters, containment.
    const disc = group(g, -2.3, 0, -1.4, Math.PI / 2);
    box(disc, 0.4, 0.55, 0.2, 0, 1.3, 0, 0x8b949b, { rough: 0.5, metal: 0.4 });
    const dHandle = box(disc, 0.05, 0.2, 0.05, 0.15, 1.3, 0.12, 0xd2312b, { rough: 0.4 });
    reg(hits, dHandle, "crah-disconnect");
    const dLock = lockTag(disc, 0.15, 1.08, 0.12, { color: 0xd2312b, lines: ["LOCK"] });
    reg(hits, dLock, "crah-lock");
    const dTag = lockTag(disc, -0.1, 1.08, 0.12, { color: 0xf2c14b, lines: ["DANGER", "DO NOT", "OPERATE"] });
    reg(hits, dTag, "crah-tag");
    const fanBrk = box(disc, 0.08, 0.14, 0.04, -0.1, 1.45, 0.11, 0xf2ae14, { rough: 0.4 });
    reg(hits, fanBrk, "tripped-fan-breaker");
    holoTag(disc, "unit disconnect", 0, 1.8, 0.1, { css: WS7_CSS, w: 0.32 });
    box(disc, 0.05, 1.05, 0.05, 0, 0.52, 0, 0x5a6168, { rough: 0.6 });
    const tester = multimeter(g, 1.9, 0.85, 1.4);
    holoTag(g, "proven tester", 1.9, 1.1, 1.4, { css: WS7_CSS, w: 0.28 });
    reg(hits, tester, "unit-tester");
    box(g, 1.2, 0.8, 0.5, 2.2, 0.4, 1.4, WS7_PAL.structure, { rough: 0.7 });
    const newFilter = group(g, 2.6, 0.85, 1.4);
    box(newFilter, 0.5, 0.3, 0.05, 0, 0.15, 0, 0xf2f2ea, { rough: 0.9 });
    holoTag(newFilter, "new filter bank", 0, 0.45, 0, { css: WS7_CSS, w: 0.32 });
    reg(hits, newFilter, "new-filter");
    for (const cx of [-2.9, 2.9]) box(g, 0.05, 2.4, 3.0, cx, 1.2, 0.1, 0xbfe6f5, { rough: 0.2, opacity: 0.35, transparent: true, cast: false });
    const contDoor = box(g, 0.9, 2.1, 0.04, -2.4, 1.05, 1.6, 0xbfe6f5, { rough: 0.2, opacity: 0.45, transparent: true, cast: false });
    void contDoor;

    // Boards, radio, suppression panel, spill kit, racks.
    const bms = group(g, -2.6, 0, 0.3, 1.2);
    box(bms, 0.7, 0.5, 0.06, 0, 1.4, 0, 0x1c1f23, { rough: 0.4 });
    const bmsFace = decal(bms, 0.62, 0.42, 0, 1.4, 0.035, signFace("CRAH-2 ALARM", { bg: "#1c1206", accent: "#f2ae14", fg: "#fff4e0", scale: 0.4 }));
    holoTag(bms, "BMS alarm panel", 0, 1.8, 0, { css: WS7_CSS, w: 0.34 });
    reg(hits, bmsFace, "alarm-panel");
    box(bms, 0.06, 1.15, 0.06, 0, 0.58, 0, 0x5a6168, { rough: 0.6 });
    const logFace = decal(g, 0.4, 0.3, 0.2, 1.3, 2.2, paperFace("RESPONSE LOG", ["Alarm / cause ___", "Standby on ___", "Lockout ___"], { scale: 0.7 }));
    holoTag(g, "response log", 0.2, 1.6, 2.2, { css: WS7_CSS, w: 0.3 });
    reg(hits, logFace, "bms-log");
    box(g, 0.5, 1.2, 0.05, 0.2, 0.6, 2.23, WS7_PAL.structure, { rough: 0.7 });
    const radioObj = radio(g, -1.2, 0.9, 1.9);
    holoTag(g, "hall operator radio", -1.2, 1.15, 1.9, { css: WS7_CSS, w: 0.38 });
    reg(hits, radioObj, "hall-operator-radio");
    box(g, 0.5, 0.84, 0.4, -1.2, 0.42, 1.9, WS7_PAL.structure, { rough: 0.7 });
    const sup = group(g, 2.8, 0, 0.3, -Math.PI / 2);
    box(sup, 0.5, 0.6, 0.08, 0, 1.4, 0, 0xc0282a, { rough: 0.5 });
    const supLamp = cyl(sup, 0.04, 0.04, 0.03, 0.15, 1.55, 0.05, 0x444444, { rough: 0.4, seg: 10 });
    supLamp.rotation.x = Math.PI / 2;
    const supFace = decal(sup, 0.4, 0.2, 0, 1.3, 0.045, signFace("CLEAN AGENT", { bg: "#c0282a", accent: "#fff", fg: "#fff", scale: 0.4 }));
    holoTag(sup, "suppression panel", 0, 1.85, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, supFace, "suppression-panel");
    const kit = group(g, -2.0, 0, 2.2);
    cyl(kit, 0.25, 0.25, 0.6, 0, 0.3, 0, 0xf2c14b, { rough: 0.7, seg: 14 });
    holoTag(kit, "spill kit", 0, 0.8, 0, { css: WS7_CSS, w: 0.22 });
    reg(hits, kit, "spill-kit");
    const sock = cyl(g, 0.05, 0.05, 1.2, -1.6, 0.06, -0.3, 0xe8e0c8, { rough: 0.9, seg: 8 });
    sock.rotation.z = Math.PI / 2;
    sock.visible = false;
    const water = box(g, 0.8, 0.005, 1.4, -1.4, 0.065, 0.2, 0x6fb0e6, { rough: 0.1, metal: 0.4, opacity: 0.55, transparent: true });
    water.visible = false;
    const rackTex = surfaceTexture((ctx, w, h) => { ctx.fillStyle = "#15181c"; ctx.fillRect(0, 0, w, h); for (let i = 0; i < 20; i++) { ctx.fillStyle = "#262b31"; ctx.fillRect(6, 6 + i * 12, w - 12, 9); ctx.fillStyle = i % 3 ? "#3fc26a" : "#4fa3ff"; ctx.fillRect(w - 16, 9 + i * 12, 4, 3); } }, { repeat: 1, px: 256 });
    for (let i = 0; i < 3; i++) { const r = box(g, 0.6, 2.1, 1.0, 3.3, 1.05, -1.4 + i * 0.64, 0xffffff, { rough: 0.5 }); r.material = texturedMat(rackTex, { rough: 0.5, metal: 0.4 }); r.rotation.y = Math.PI / 2; }
    // Perforated floor tiles in the cold aisle and a ladder tray overhead.
    const perfTex = surfaceTexture((ctx, w, h) => { ctx.fillStyle = "#b9bec2"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#6b7178"; for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) ctx.fillRect(6 + i * 10, 6 + j * 10, 4, 4); }, { repeat: 1, px: 128 });
    for (let i = 0; i < 6; i++) { const pt = box(g, 0.58, 0.02, 0.58, 2.4 - (i % 2) * 0.6, 0.07, -1.3 + Math.floor(i / 2) * 0.62, 0xffffff, { rough: 0.6 }); pt.material = texturedMat(perfTex, { rough: 0.6, metal: 0.2 }); }
    box(g, 5.6, 0.06, 0.4, 0, 2.8, -0.9, 0xa8b0b6, { rough: 0.5, metal: 0.6 });
    for (const hx of [-2.6, -0.9, 0.9, 2.6]) box(g, 0.03, 0.6, 0.03, hx, 3.1, -0.9, 0x5a6168, { rough: 0.6 });
    for (let i = 0; i < 3; i++) box(g, 0.3, 0.3, 0.3, -2.9 + i * 0.35, 0.15, 2.3, 0xc9b58a, { rough: 0.9 });
    const hallInst = instrument(g, 2.4, 1.3, -0.4, { idle: "AISLE", color: 0x2b2f34, w: 0.16, d: 0.03 });
    holoTag(g, "cold-aisle reading", 2.4, 1.52, -0.4, { css: WS7_CSS, w: 0.36 });
    reg(hits, hallInst, "hall-temp-meter");
    box(g, 0.05, 1.3, 0.05, 2.4, 0.65, -0.4, 0x5a6168, { rough: 0.6 });

    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.44 });
      reg(hits, d, id);
    };
    decoy(-2.0, 1.0, 0.6, "silence-and-walk-away", "silence it and move on?");
    decoy(0.2, 0.9, -1.2, "reach-into-running-fan", "open the fans up now?");
    decoy(-2.4, 0.6, 1.2, "prop-containment-door", "prop the door open?");
    decoy(-1.8, 1.9, -0.9, "reset-breaker-repeatedly", "reset it again?");

    standingFigure(g, 3.0, 2.2, { ry: -2.6, cloth: 0x2b4f7f, vest: 0xf2c14b });
    holoPanel(g, 1.0, 0.6, 0.8, 0, 2.5, (ctx, w, h) => {
      ctx.fillStyle = "#06121c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS7_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f2ff";
      ctx.fillText("CRAH ALARM — HOLD THE HALL", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Read it, report it", "Walk the unit down", "Standby on, watch the hall", "Then isolate, prove dead, service"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: -0.2, accent: WS7_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.3, -1.4),
      onStep() {},
      onFault(id) {
        if (id === "crah-leak-detect") { leak.visible = true; leakLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 }); }
      },
      onStepComplete(step) {
        if (step.id === "supply-read") repaint(supply.userData.screen, signFace("HIGH", { bg: "#2a1a06", accent: "#f2ae14", fg: "#fff4e0", scale: 0.5 }));
        if (step.id === "standby") { sLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); leak.visible = false; }
        if (step.id === "open-panel") panelHinge.rotation.y = -1.3;
        if (step.id === "swap-filter") { oldFilter.visible = false; newFilter.position.set(-0.8, 0.6, -1.55); alarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0 }); }
      },
      onInterrupt(it) {
        if (it.id === "suppression-prealarm") supLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 });
        if (it.id === "water-spreading") water.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "suppression-prealarm") supLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 0.8 });
        if (it.id === "water-spreading") sock.visible = true;
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "open-panel") panelHinge.rotation.y = -session.turn.amount * 1.3;
      },
    };
  },
};
