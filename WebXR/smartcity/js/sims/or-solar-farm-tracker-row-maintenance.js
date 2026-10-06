import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Solar Farm Tracker Row Maintenance VR — Energy & Power, on
// the open-range district. A single-axis tracker row on a utility-scale
// solar array, serviced under a proper lockout at the combiner before the
// manual override ever turns the row by hand, a worn slew bearing found and
// replaced, and the row swept through its full range and watched before
// anyone signs it back to production — with the heat and a rattlesnake in
// the row both handled the way the plan says to handle them, not on
// instinct in the moment.

const ORS_ACCENT = 0x9fd84f;

export const SIM_OR_SOLAR_FARM_TRACKER_ROW_MAINTENANCE = {
  id: "or-solar-farm-tracker-row-maintenance",
  index: "262",
  domain: "Energy",
  trade: "Solar technician — IBEW",
  category: "Energy & Power",
  district: "open-range",
  weather: "heat-haze",
  certification: "IBEW outside line and solar technicians; NFPA 70 (NEC) Article 690 photovoltaic systems; OSHA 29 CFR 1910.147 control of hazardous energy for the combiner lockout; NFPA 70E electrical safety in the workplace; NABCEP PV commissioning and maintenance practice",
  name: "Solar Tracker Row Maintenance",
  title: simTitle("Solar Tracker Row Maintenance"),
  tagline: "A tracker row serviced under a real combiner lockout: zero energy proven before the manual override turns the row, a worn bearing found and replaced, the full sweep watched before sign-off, and a rattlesnake in the row handled without anyone reaching near it",
  accent: ORS_ACCENT,
  accentCss: "#9fd84f",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "row-returned", name: "Row Returned", note: "A tracker row locked out, its bearing replaced, swept clean through its range and returned to production with the lock removed last" },

  supportLine: "the IBEW local's member assistance programme and the site's own heat-illness prevention plan contact",

  game: system({
    name: "Array Command",
    currency: "WATT",
    ranks: ["Field Tech", "Solar Technician", "Lead Technician", "Site Supervisor", "Array Certified"],
    badges: [
      { id: "locked-first", name: "Locked First", note: "The combiner locked and proven dead before the manual override ever turned", test: AWARD.safe },
      { id: "torque-held", name: "Torque Held", note: "Held the bearing bolt torque the full count", test: AWARD.unbroken },
      { id: "sweep-clean", name: "Sweep Clean", note: "The function test held in band the whole sweep", test: AWARD.stepClean("function-test") },
    ],
    challenges: [
      { id: "clean-row", name: "Clean Row", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "row-fast", name: "Row Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "tech-streak", name: "Tech Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "touch-live-combiner-terminals": "You reached into the combiner before the meter confirmed zero energy. A string combiner carries DC from every panel in the row at once, and DC does not self-interrupt at a gap the way AC can — a hand across live terminals is a sustained path, not a brief shock, until the fault clears itself through the person holding it.",
    "crank-tracker-before-lockout": "You reached for the manual override before the combiner was locked out. A tracker's drive is exactly the kind of load a control signal can re-energize without warning, and turning the row by hand while that circuit is still live is how a hand or an arm ends up in the drive train at the one moment nobody was expecting it to move on its own.",
    "reach-into-pinch-point": "You reached into the bearing mount while the row could still move. The torque tube's pivot is a running pinch point on any tracker that has not been proven locked out, and a hand placed there assumes a promise the row has not actually made yet.",
    "remove-lock-before-torque-complete": "You reached for your lock before the bearing bolts were torqued to spec. Pulling your own lockout before the mechanical work is actually finished puts the row back in service on a bearing that is still loose, which is the exact failure this service call exists to prevent in the first place.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order-board",
      title: "Take the tracker-row service ticket",
      cue: "Check the work order for the row number, the fault code and the bearing part number.",
      why: "The ticket is what turns a general 'the row isn't tracking right' into a specific, documented service call — the row number and the fault code are what a technician actually works from instead of guessing which bearing on a mile of tracker rows is the one that failed.",
    },
    {
      id: "heat-weather-board", kind: "select", target: "conditions-board",
      title: "Check the heat and fire-weather conditions",
      cue: "Read today's heat and fire-weather outlook before starting the row, per the forecast.",
      why: "Heat on open range with rows of dark panels radiating it back is a different day than the same forecast anywhere else on site, and the current outlook — not yesterday's — is what the crew's own heat-illness prevention plan sets its water and work/rest schedule against.",
    },
    {
      id: "ppe-sequence", kind: "sequence", anyOrder: true,
      targets: ["insulated-gloves", "voltage-tester", "hard-hat"],
      itemNames: { "insulated-gloves": "insulated gloves", "voltage-tester": "voltage tester", "hard-hat": "hard hat" },
      title: "Gear up before the row",
      cue: "Insulated gloves, voltage tester, hard hat — staged before the first panel.",
      why: "The gloves and the tester are what actually let a technician prove a DC circuit dead rather than assume it, and staging both before the first step of the isolation means neither one is a walk back to the truck once the combiner is already open.",
    },
    {
      id: "row-walk-find", kind: "find", noHint: true,
      targets: ["damaged-conduit", "loose-module-clamp"],
      itemNames: { "damaged-conduit": "damaged conduit", "loose-module-clamp": "loose module clamp" },
      itemNotes: {
        "damaged-conduit": "Conduit worn through to the conductor is a second fault waiting on this row, found while it is still just conduit.",
        "loose-module-clamp": "A module clamp backed off its torque is a panel that can lift and swing the first time wind gets under the edge of it.",
      },
      decoyNotes: { "clean-panel-face": "That panel face is clean and undamaged — the find is for what's actually wrong on the row, not every panel in it." },
      title: "Walk the row before touching the combiner",
      cue: "Walk the tracker row and click what needs fixing — two of them are here.",
      why: "A walk of the row before the isolation starts is what catches a second fault — a chafed conduit, a loose clamp — before it becomes the reason for a second service call next week, on a row that is already open and already locked out today.",
    },
    {
      id: "combiner-lockout", kind: "sequence",
      targets: ["combiner-disconnect-open", "personal-lock-applied", "lockout-tag-applied"],
      itemNames: { "combiner-disconnect-open": "combiner disconnect opened", "personal-lock-applied": "personal lock applied", "lockout-tag-applied": "lockout tag applied" },
      title: "Lock out the combiner",
      cue: "Open the disconnect, apply your personal lock, then the tag — in that order.",
      why: "The disconnect opens the circuit, but it is the lock that stops anyone else from closing it again while this row is open — applying the lock and the tag in order, right after the disconnect, is what turns an isolation someone else could still touch into one only this technician controls.",
      outOfOrderNote: "Disconnect open first, then your lock, then the tag — a lock applied before the disconnect is open is a lock on a circuit that was never actually opened.",
    },
    {
      id: "verify-zero-energy", kind: "gauge", target: "dc-meter",
      title: "Verify zero energy at the combiner",
      cue: "Test the combiner terminals with the meter and commit once it reads zero.",
      why: "The disconnect position is what should be true; the meter is what is actually true on these terminals right now, and OSHA 29 CFR 1910.147 accepts only the second one before anyone's hands go near the terminals — a disconnect that looks open can still leave a backfed string energized if a fault or a mis-wired combiner has done something the switch handle cannot show.",
      gauge: { label: "COMBINER DC VOLTAGE", speed: 0.62, green: [0.0, 0.08], readout: (t) => `${Math.round(t * 620)} V DC`, missNote: "Still reading energized. Recheck the disconnect and every string before the manual override goes anywhere near the row." },
    },
    {
      id: "tracker-turn", kind: "turn", target: "manual-override",
      title: "Turn the tracker to the service position",
      cue: "Crank the manual override to bring the actuator mount to a working height.",
      why: "With the combiner locked and proven dead, the manual override is the only thing that should be moving this row now, and cranking it by hand — rather than trusting the drive to be safely off — is what a locked-out tracker is actually for.",
      turn: { turns: 1.2, axis: "x", label: "MANUAL OVERRIDE" },
    },
    {
      id: "actuator-inspect", kind: "select", target: "slew-bearing",
      title: "Inspect the slew bearing",
      cue: "Check the worn bearing race the fault code pointed to.",
      why: "Confirming the specific bearing against the fault code before pulling anything apart is what keeps this service call to the one part that actually failed, instead of a row put back together with a guess still inside it.",
    },
    {
      id: "bearing-drag", kind: "drag", target: "spare-bearing",
      title: "Carry the replacement bearing to the mount",
      cue: "Carry the new bearing from the truck to the actuator mount.",
      why: "The new bearing has to actually be at the mount, seated and ready, before the old one comes off — the row sits open and locked out for exactly as long as this changeout takes, and a part still on the truck is time the row spends open for no reason.",
      drag: { to: "bearing-mount", radius: 0.5, missNote: "Not seated at the mount — a bearing set down beside it still has to be carried the rest of the way before anything can be torqued." },
    },
    {
      id: "torque-bearing", kind: "hold", target: "torque-wrench", seconds: 4,
      title: "Torque the new bearing to spec",
      cue: "Hold the wrench to the click on every bolt.",
      why: "A slew bearing under-torqued works itself loose under the row's own daily sweep long before anyone is back out to check it, and the click is the only proof the bolt is actually at spec rather than just tight by feel.",
      holdBreakNote: "Released before the click — that bolt is not at spec. Set it again rather than trust how it felt.",
    },
    {
      id: "remove-lockout", kind: "sequence",
      targets: ["lockout-tag-removed", "personal-lock-removed", "combiner-disconnect-closed"],
      itemNames: { "lockout-tag-removed": "lockout tag removed", "personal-lock-removed": "personal lock removed", "combiner-disconnect-closed": "combiner disconnect closed" },
      title: "Remove the lockout, in reverse",
      cue: "Tag off, then your lock, then close the disconnect — the exact reverse of how it went on.",
      why: "Removing the lockout in the reverse of the order it went on means the row is never live while it is still tagged, and the disconnect is the very last thing touched — the same discipline that kept everyone else out during the work is what confirms the work is actually finished before power comes back.",
      outOfOrderNote: "Tag off, then your lock, then the disconnect closed last — closing the disconnect before the lock and tag are off puts the row back live while it still reads as isolated.",
    },
    {
      id: "function-test", kind: "track", target: "test-control", seconds: 7,
      title: "Sweep the row and watch for binding",
      cue: "Hold the sweep rate steady in the band while the row cycles through its full range.",
      why: "The bearing is only proven fixed by watching it move — a slow, steady sweep through the row's full range is what actually shows a technician a bind or a catch the new bearing might still have, in a way a torque reading alone never will.",
      track: { start: 0.15, green: [0.38, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "SWEEP RATE", readout: (v) => (v < 0.38 ? "sweeping too fast to see a bind" : v > 0.6 ? "stalling the actuator" : "sweeping clean") },
      holdBreakNote: "Sweep rate out of band — too fast to actually see a bind, or slow enough to stall the actuator. Bring it back and hold through the full range.",
    },
    {
      id: "closing-log", kind: "sequence", anyOrder: true,
      targets: ["log-fault", "log-bearing", "log-sweep"],
      itemNames: { "log-fault": "fault code logged", "log-bearing": "bearing swap logged", "log-sweep": "function test logged" },
      title: "Log the service call",
      cue: "Write the fault code, the bearing swap and the function test into the service log.",
      why: "The log is what tells the site's asset management system this row is actually back in production on a proven bearing, and what saves the next technician on this row from re-diagnosing a fault this call already closed out.",
    },
    {
      id: "crew-checkin", kind: "select", target: "checkin-board",
      title: "Check in after the snake and the heat",
      cue: "Ask how your partner is doing after the snake and the heat-illness scare, not just whether the row is back up.",
      why: "A shift that includes both a rattlesnake in the row and a partner showing early heat-illness signs asks more of a crew than an ordinary bearing swap does, and checking in on that, out loud, is what keeps it from being the thing nobody mentions at the end of the day.",
    },
  ],

  interrupts: [
    {
      id: "snake-in-the-row",
      kind: "A snake in the row",
      after: "bearing-drag", delay: 3, seconds: 12,
      alert: "There's a snake coiled up in the shade right under the next module, close to where your hand was about to go.",
      cue: "Step back. Do not reach near it — let it move off on its own or call it in.",
      target: "snake-standoff",
      why: "A snake sheltering under a cool panel edge on open range is not something to move past with a hand near where it is coiled — backing off and giving it room is what actually works here, not a decision made at arm's length about how far away is far enough while the tool in your other hand is still reaching for the bearing.",
      missNote: "A hand went back toward the bearing with the snake still coiled right there. Whatever it decided to do about that hand was never something anyone on this crew got to choose.",
      wrongNote: "Step back from the row — the bearing waits, the snake does not care that you're on a schedule.",
    },
    {
      id: "heat-illness-symptom",
      kind: "Heat-illness symptoms",
      after: "torque-bearing", delay: 3, seconds: 12,
      alert: "Your partner just said they feel dizzy and a little sick, out here on the open row with the panels radiating the afternoon heat back at both of you.",
      cue: "Stop the task. Get them to shade and call it in per the heat-illness prevention plan.",
      target: "cooldown-call",
      why: "Early heat-illness signs are the plan's own trigger to stop, not a symptom to push through until the row is finished — the response is shade, water and a call, per the site's heat-illness prevention plan, made the moment the symptom is reported rather than after the bearing is torqued.",
      missNote: "The bearing got finished before anyone stopped for the dizziness. Heat illness gets worse while the task in front of somebody keeps feeling more urgent than it is, which is exactly the moment the plan says to stop trusting that feeling.",
      wrongNote: "It is your partner, not the bearing — stop, get them to shade, and call it in.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "or-solar-farm-tracker-row-maintenance", [-2.6, 0.9, 1.8]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, ORS_ACCENT);

    // ---------------------------------------------------------- the tracker row
    const row = group(g, 1.6, 0, -1.4, 0.15);
    const torqueTube = cyl(row, 0.09, 0.09, 7.0, 0, 1.1, 0, 0x8b98a5, { rough: 0.5, metal: 0.5, seg: 12 });
    void torqueTube;
    const panelGroup = group(row, 0, 1.1, 0);
    for (let i = -2; i <= 2; i++) {
      box(panelGroup, 1.7, 0.05, 1.0, i * 1.4, 0.3, 0, 0x1c3a5c, { rough: 0.3, metal: 0.2 });
    }
    panelGroup.rotation.x = -0.12;
    for (const sx of [-1, 1]) cyl(row, 0.1, 0.14, 1.4, sx * 3.4, 0.5, 0, 0x8b98a5, { rough: 0.6, metal: 0.4, seg: 10 });

    const conduit = cyl(row, 0.025, 0.025, 1.2, -1.6, 1.1, 0.4, 0x2b3138, { rough: 0.7, seg: 8 });
    conduit.rotation.z = Math.PI / 2;
    holoTag(row, "Conduit run", -1.6, 1.35, 0.4, { css: "#f0645b", w: 0.32 });
    reg(hits, conduit, "damaged-conduit");
    const clamp = box(row, 0.12, 0.06, 0.12, 0.7, 1.14, 0.5, 0x6b7078, { rough: 0.6, metal: 0.4 });
    holoTag(row, "Module clamp", 0.7, 1.3, 0.5, { css: "#f0645b", w: 0.34 });
    reg(hits, clamp, "loose-module-clamp");
    const cleanPanel = box(row, 0.14, 0.05, 0.1, -0.7, 1.14, 0.5, 0x1c3a5c, { rough: 0.3, metal: 0.2 });
    reg(hits, cleanPanel, "clean-panel-face");

    // The rest of the array behind this row — background rows, purely
    // scenic, reading as the field this one row belongs to.
    for (const rz of [-9, -12]) {
      const bgRow = group(g, 1.6, 0, rz, 0.15);
      cyl(bgRow, 0.07, 0.07, 6.4, 0, 1.05, 0, 0x8b98a5, { rough: 0.5, metal: 0.5, seg: 8, cast: false, receive: false });
      const bgPanels = group(bgRow, 0, 1.05, 0);
      for (let i = -2; i <= 2; i++) box(bgPanels, 1.6, 0.04, 0.9, i * 1.35, 0.28, 0, 0x1c3a5c, { rough: 0.4, metal: 0.15, cast: false, receive: false });
      bgPanels.rotation.x = -0.1;
      for (const sx of [-1, 1]) cyl(bgRow, 0.08, 0.11, 1.3, sx * 3.2, 0.5, 0, 0x8b98a5, { rough: 0.6, metal: 0.4, seg: 8, cast: false, receive: false });
    }
    // A switchgear cabinet at the row's near end, part of the array's own furniture.
    const switchCabinet = group(g, -0.6, 0, 2.6);
    box(switchCabinet, 0.5, 0.9, 0.4, 0, 0.45, 0, 0x5d6873, { rough: 0.55, metal: 0.3 });
    box(switchCabinet, 0.46, 0.3, 0.02, 0, 0.7, 0.21, 0x3a434d, { rough: 0.5, metal: 0.4 });
    holoTag(switchCabinet, "Switchgear", 0, 1.0, 0, { css: "#9fd84f", w: 0.3 });

    // ------------------------------------------------------------- actuator
    const actuatorMount = group(g, 1.6, 0, 2.0);
    box(actuatorMount, 0.5, 0.4, 0.4, 0, 0.4, 0, 0x3a434d, { rough: 0.6, metal: 0.4 });
    const bearing = torus(actuatorMount, 0.2, 0.06, 0, 0.65, 0, 0x9a3f2f, { rough: 0.6, metal: 0.5, seg: 10, seg2: 18 });
    bearing.rotation.x = Math.PI / 2;
    holoTag(actuatorMount, "Slew bearing — worn", 0, 0.95, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, bearing, "slew-bearing");
    const bearingMount = box(g, 0.3, 0.02, 0.3, 1.6, 0.011, 2.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["bearing-mount"] = bearingMount;
    const pinchTrap = box(actuatorMount, 0.2, 0.2, 0.2, 0.3, 0.65, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(actuatorMount, "Pinch point", 0.3, 0.9, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, pinchTrap, "reach-into-pinch-point");

    const overridePost = group(g, 2.2, 0, 2.4);
    cyl(overridePost, 0.03, 0.03, 0.7, 0, 0.35, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const crank = box(overridePost, 0.28, 0.05, 0.05, 0, 0.72, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(overridePost, "Manual override", 0, 0.95, 0, { css: "#9fd84f", w: 0.34 });
    reg(hits, crank, "manual-override");
    const crankTrap = box(overridePost, 0.16, 0.16, 0.16, 0, 0.72, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crankTrap, "crank-tracker-before-lockout");

    // ------------------------------------------------------------- combiner
    const combiner = group(g, -1.4, 0, 1.0, -0.4);
    box(combiner, 0.6, 0.9, 0.4, 0, 0.55, 0, 0x3a434d, { rough: 0.55, metal: 0.4 });
    const disconnectHandle = box(combiner, 0.05, 0.16, 0.05, -0.2, 0.85, 0.21, 0xd8232a, { rough: 0.5 });
    holoTag(combiner, "Combiner disconnect", -0.2, 1.05, 0.21, { css: "#9fd84f", w: 0.4 });
    reg(hits, disconnectHandle, "combiner-disconnect-open");
    const closedTarget = box(combiner, 0.05, 0.16, 0.05, 0.2, 0.85, 0.21, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["combiner-disconnect-closed"] = closedTarget;
    const liveTerminals = box(combiner, 0.3, 0.1, 0.05, 0, 0.4, 0.21, 0xd8b23a, { rough: 0.4, metal: 0.6 });
    holoTag(combiner, "Combiner terminals", 0, 0.55, 0.21, { css: "#f0645b", w: 0.4 });
    reg(hits, liveTerminals, "touch-live-combiner-terminals");
    const dcMeter = instrument(combiner, 0.25, 0.6, 0.22, { ry: -0.3, idle: "-- V", color: ORS_ACCENT });
    holoTag(combiner, "DC voltage tester", 0.25, 0.8, 0.22, { css: "#9fd84f", w: 0.34 });
    reg(hits, dcMeter, "dc-meter");

    const lockBox = group(g, -1.9, 0, 1.6);
    box(lockBox, 0.24, 0.3, 0.12, 0, 0.9, 0, 0xd8232a, { rough: 0.6, finish: "painted", tile: [1, 1] });
    lockTag(lockBox, 0, 1.1, 0.08, { color: 0xd8232a });
    holoTag(lockBox, "Personal lock", 0, 1.3, 0, { css: "#9fd84f", w: 0.3 });
    reg(hits, lockBox, "personal-lock-applied");
    const lockRemoveTarget = box(lockBox, 0.24, 0.3, 0.12, 0, 0.9, 0.001, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["personal-lock-removed"] = lockRemoveTarget;
    const tagPanel = decal(combiner, 0.2, 0.12, -0.2, 0.5, 0.24, signFace("LOCKED OUT", { bg: "#2a1a0d", accent: "#d8232a", scale: 0.4 }), { px: 128 });
    reg(hits, tagPanel, "lockout-tag-applied");
    const tagRemoveTarget = box(combiner, 0.2, 0.12, 0.02, -0.2, 0.5, 0.25, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["lockout-tag-removed"] = tagRemoveTarget;
    const earlyLockRemoveTrap = box(lockBox, 0.3, 0.36, 0.16, 0, 0.9, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, earlyLockRemoveTrap, "remove-lock-before-torque-complete");

    // ------------------------------------------------------------ tools
    const chest = toolChest(g, -2.6, -0.6, { ry: 0.6, color: ORS_ACCENT });
    const gloveGroup = group(chest, -0.14, 0.79, 0.06, 0.3);
    for (const sx of [-1, 1]) box(gloveGroup, 0.05, 0.14, 0.02, sx * 0.03, 0, 0, 0xd8b23a, { rough: 0.65 });
    holoTag(gloveGroup, "Insulated gloves", 0, 0.16, 0, { css: "#9fd84f", w: 0.34 });
    reg(hits, gloveGroup, "insulated-gloves");
    const tester = instrument(chest, 0.12, 0.79, 0.02, { ry: -0.4, idle: "-- V", color: ORS_ACCENT });
    holoTag(tester, "Voltage tester", 0, 0.16, 0, { css: "#9fd84f", w: 0.3 });
    reg(hits, tester, "voltage-tester");
    const hat = cyl(chest, 0.14, 0.16, 0.12, -0.02, 0.85, -0.1, 0xf2c14b, { rough: 0.5, seg: 14 });
    holoTag(chest, "Hard hat", -0.02, 1.0, -0.1, { css: "#9fd84f", w: 0.26 });
    reg(hits, hat, "hard-hat");

    const spareBearingRack = group(g, -2.6, 0, 0.4);
    const spareBearing = torus(spareBearingRack, 0.18, 0.05, 0, 0.5, 0, 0xd8b23a, { rough: 0.55, metal: 0.4, seg: 10, seg2: 16 });
    spareBearing.rotation.x = Math.PI / 2;
    holoTag(spareBearingRack, "Spare bearing", 0, 0.75, 0, { css: "#9fd84f", w: 0.32 });
    reg(hits, spareBearing, "spare-bearing");

    const wrench = box(chest, 0.05, 0.05, 0.4, 0.02, 0.9, 0.14, 0xdfe4e8, { rough: 0.35, metal: 0.75, finish: "brushed" });
    holoTag(chest, "Torque wrench", 0.02, 1.06, 0.14, { css: "#9fd84f", w: 0.3 });
    reg(hits, wrench, "torque-wrench");

    const testControl = instrument(overridePost, 0, 0.95, 0.22, { ry: 0, idle: "-- deg/s", color: ORS_ACCENT });
    holoTag(overridePost, "Sweep test control", 0, 1.15, 0.22, { css: "#9fd84f", w: 0.34 });
    reg(hits, testControl, "test-control");

    // -------------------------------------------------------------- boards
    const workOrderBoard = holoPanel(g, 0.56, 0.4, -1.4, 1.35, 2.6, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,6,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fd84f"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e6f7d0";
      cx.fillText("SERVICE TICKET — ROW 214", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d5e8b8";
      ["Fault: slew bearing wear alarm", "Part: bearing kit TR-214", "Lockout required at combiner"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.5, accent: ORS_ACCENT });
    reg(hits, workOrderBoard, "work-order-board");

    const condBoard = holoPanel(g, 0.56, 0.4, -1.4, 1.35, 3.1, (cx, w, h) => {
      cx.fillStyle = "rgba(20,14,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b134"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe9c8";
      cx.fillText("HEAT & FIRE WEATHER", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f0d9ad";
      ["Check the current spot forecast", "Heat-illness plan sets water breaks", "No figure repeated here as fact"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: 0.5, accent: 0xf2b134 });
    reg(hits, condBoard, "conditions-board");

    const snakeGroup = group(g, 2.4, 0, 1.7);
    const snakeBody = hose(snakeGroup, [[-0.2, 0.03, 0], [0, 0.03, 0.12], [0.2, 0.03, 0]], 0.05, 0x6b6a3a, { steps: 8, rough: 0.6 });
    snakeBody.visible = false;
    holoTag(snakeGroup, "Snake — keep clear", 0, 0.3, 0, { css: "#f0645b", w: 0.4 });
    const standoff = box(g, 0.6, 0.4, 0.6, 2.4, 0.2, 1.7, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, standoff, "snake-standoff");

    const cooldownRadio = group(g, -0.4, 0, -1.0);
    box(cooldownRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    holoTag(cooldownRadio, "Cooldown call", 0, 1.05, 0, { css: "#f2b134", w: 0.3 });
    reg(hits, cooldownRadio, "cooldown-call");

    const checkinBoard = holoPanel(g, 0.55, 0.38, -1.4, 1.35, -3.0, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e2f6ff";
      cx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfeaf7";
      ["\"How are you doing?\" — ask it", "IBEW member assistance line posted", "Answer logged, not assumed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: 0.5, accent: 0x4fd1ff });
    reg(hits, checkinBoard, "checkin-board");

    // The patrol partner, clear of every control and the row's own envelope.
    standingFigure(g, -0.4, 1.2, { ry: 2.0, cloth: 0x2b3a2f, vest: CITY.hiVis, helmet: 0xf2f2f2 });

    // Log board.
    const logSpec = [["log-fault", -0.2], ["log-bearing", 0.0], ["log-sweep", 0.2]];
    const logBoard = group(g, -2.2, 0, -1.6);
    for (const [id, tx] of logSpec) {
      const tile = box(logBoard, 0.12, 0.12, 0.02, tx, 0.9, 0, 0x1a0c0d, { rough: 0.6 });
      reg(hits, tile, id);
    }
    holoTag(logBoard, "Service log", 0, 1.08, 0, { css: "#9fd84f", w: 0.3 });

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(1.0, 1.2, 0.6),

      onStepComplete(step) {
        if (step.id === "combiner-lockout") disconnectHandle.rotation.z = 1.1;
        if (step.id === "remove-lockout") disconnectHandle.rotation.z = 0;
        if (step.id === "verify-zero-energy") liveTerminals.material = mat(0x53585e, { rough: 0.6 });
        if (step.id === "torque-bearing") bearing.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
      },

      onInterrupt(it) {
        if (it.id === "snake-in-the-row") { snakeBody.visible = true; }
        if (it.id === "heat-illness-symptom") { cooldownRadio.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "snake-in-the-row") { snakeBody.visible = false; }
        if (it.id === "heat-illness-symptom") { cooldownRadio.children[0].material = mat(0x2b3138, { rough: 0.5 }); }
      },

      animate(t, dt, session) {
        void dt;
        if (session?.step?.id === "function-test" && session.track) {
          row.rotation.z = -0.15 + Math.sin(t * 0.4) * 0.15;
        }
        const spin = dcMeter.userData.screen;
        void spin;
      },
    };
  },
};
