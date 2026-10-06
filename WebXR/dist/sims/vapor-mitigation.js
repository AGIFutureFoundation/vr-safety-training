import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, equipmentCabinet, instrument,
  standingFigure, valveWheel, lockTag, pipeRun, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Vapor Mitigation VR — Building Systems & Facilities, station
// eighty-three. Commissioning a sub-slab depressurisation (SSD) system in a
// building that sits on a former shipyard parcel under a federal cleanup
// order — sited generically, the way pump-and-treat.js and hot-tap.js are,
// rather than at any named facility. See hunters-point.js for why a real
// Superfund site gets a sourced flat briefing instead of a walkable scene;
// this station teaches the trade procedure a plumbing/electrical crew runs
// on a mitigation system like the one that record's soil-vapour plume would
// require, without inventing facts about that case.
//
// The shape of the job: prove the sub-slab is pneumatically one thing before
// a fan ever runs on it, prove the fan's circuit is dead before the housing
// opens, hang the fan and route its discharge where it cannot feed the vapor
// back into the building, then prove the finished system actually pulls a
// vacuum at every point the design named — and prove it again with an
// indoor-air sample nobody can argue with. A placard signed on a system that
// skipped any of that is a placard nobody should trust.

const VM_ACCENT = 0xa07eff;

export const SIM_VAPOR_MITIGATION = {
  id: "vapor-mitigation",
  index: "83",
  domain: "Building Systems",
  trade: "Sub-slab depressurisation system installer",
  category: "Building Systems & Facilities",
  indoor: "service",
  weather: "overcast",
  certification: "UA Local 38 plumbers and pipefitters on the piping and vessel work; IBEW Local 6 electricians on the fan circuit under OSHA 29 CFR 1910.147 control of hazardous energy; LIUNA hazmat laborers on cuttings and waste handling; system design and commissioning per ASTM E2121 sub-slab depressurisation practice, the EPA OSWER vapor intrusion technical guide, and California DTSC's vapor intrusion guidance",
  name: "Vapor Mitigation",
  title: simTitle("Vapor Mitigation"),
  tagline: "Commissioning a sub-slab depressurisation system: communication proven at every test point, the fan circuit proven dead before the housing opens, the fan hung and vented clear of any intake, the vacuum verified against design, and an indoor-air sample sealed under chain of custody",
  accent: VM_ACCENT,
  accentCss: "#a07eff",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "field-proven", name: "Field Proven", note: "A communication test, a proven-dead fan circuit, a vacuum verified at every point against design, and an indoor-air sample sealed under chain of custody — all clean" },

  game: system({
    name: "Vapor Intrusion Control",
    currency: "IN.WC",
    ranks: ["Installer I", "Installer II", "Lead Installer", "System Commissioner", "Vapor Intrusion Certified"],
    badges: [
      { id: "proven-dead-first", name: "Proven Dead First", note: "The fan circuit was locked, tagged and proven dead before the housing was ever touched", test: AWARD.stepClean("isolate-fan") },
      { id: "never-in-live", name: "Never In Live", note: "The housing was never opened live and the discharge never landed near an intake", test: AWARD.safe },
      { id: "vacuum-true", name: "Vacuum True", note: "Held the manometer and vacuum readings near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-commission", name: "Clean Commission", note: "No corrections anywhere in the commissioning run", test: AWARD.clean },
      { id: "steady-field", name: "Steady Field", note: "Held the communication test in band without a dropout", test: AWARD.unbroken },
      { id: "system-live-fast", name: "System Live", note: "Placard signed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "housing-live": "You reached into the fan's terminal housing before its circuit was proven dead. OSHA's 29 CFR 1910.147 exists exactly for this moment: a fan motor's terminal block carries line voltage until somebody has actually locked the breaker, tagged it and tested it dead, and 'it's probably off' is not a control — it is a guess made with a hand inside an energised enclosure.",
    "tape-not-seal": "You reached for the tape to close the slab crack instead of a proper mechanical or urethane seal. A sub-slab depressurisation system only works if the vacuum field it pulls stays under the slab; a taped crack peels the first time the slab flexes with the season, and the system starts pulling conditioned building air instead of soil vapor without ever telling anyone it failed.",
    "wrench-riser": "You reached for the pipe wrench on a solvent-welded PVC riser. This joint is sized and torqued by the design, by hand, not by however hard a wrench can turn it — over-torquing a schedule-40 PVC coupling cracks the fitting, and a crack in a vacuum riser never shows itself until the fan is straining to hold a field it cannot reach.",
    "discharge-near-intake": "You routed the discharge toward the low vent instead of above the eave. ASTM E2121 and the EPA's vapor intrusion guidance both require the fan discharge clear of any door, window or air intake specifically so the vapor it just pulled out of the sub-slab does not walk straight back into the building — or the one next door — on the next gust.",
  },

  lateNotes: {
    "riser-coupling": "The coupling goes together after the fan is actually hung on its hangers — sealing a joint to a fan that is still on the cart just means doing it twice.",
    "utube-manometer": "The manometer is set once the fan is powered, wired and actually running — reading it on a dead system tells you nothing but zero.",
    "air-sample-pump": "The indoor-air sample is the last field task, after the system is verified holding vacuum at every point — a sample taken before that proves nothing about the mitigated condition.",
    "ops-placard": "The placard is signed after the sample is in hand and logged, not before — it is a record that the system was proven, not a promise that it will be.",
  },

  interrupts: [
    {
      id: "sump-air-loss",
      kind: "Test point lost communication",
      after: "comm-test", delay: 5, seconds: 14,
      alert: "TP-3, the farthest test point on the print, just dropped to zero on the micromanometer while the rest are holding steady.",
      cue: "Something between here and the far corner just gave the vacuum field a shortcut to the room.",
      target: "sump-lid-open",
      why: "A sub-slab vacuum field only extends as far as the slab stays airtight, and the floor drain sump beside the far wall has an unsealed lid sitting right on that flow path. An open sump is a straw from the sub-slab straight into the room air, and it will always win the vacuum ahead of a test point three metres further under the slab — reseal it now or the field extension test you are running is measuring the sump, not the system.",
      missNote: "TP-3 never came back before the window closed. A communication test that was allowed to keep running past a lost test point is a design that gets certified over a gap the crew already knew about, and the gap is exactly where the system will fail to protect the room above it.",
      wrongNote: "That does not touch the leak. The sump lid beside the far wall is what is shorting the field — reseal it.",
    },
    {
      id: "occupant-breaker",
      kind: "Fan circuit switched off",
      after: "air-sample", delay: 4, seconds: 13,
      alert: "The breaker for the fan circuit has just tripped to OFF — somebody in the building has been in the panel while the crew's back was turned.",
      cue: "The sample in your hand is only good for as long as the fan the room is being sampled under is actually running.",
      target: "fan-breaker",
      why: "The indoor-air sample is supposed to represent the building under the mitigated condition — fan running, sub-slab under vacuum — and every second the fan is off during that hold, the sample is drifting back toward the unmitigated condition it was drawn to disprove. Restoring the breaker now is the only way the sample in progress still means what it is labelled to mean.",
      missNote: "The fan stayed off for the rest of the hold. The sample that came out of that hold cannot honestly be labelled 'system operating' — the lab has no way to know it, and the report that goes out with it would be wrong in a way nobody could catch later.",
      wrongNote: "That does not restore the fan. The breaker on the panel is what somebody just switched off.",
    },
  ],

  steps: [
    {
      id: "design", kind: "select", target: "design-print",
      title: "Read the mitigation design",
      cue: "Check the test point locations, the design's minimum sub-slab vacuum and the fan and discharge specification before anything is touched.",
      why: "The print is what says how many test points prove this system, what vacuum counts as holding at each one, and where the discharge is allowed to terminate. None of that is decided on site by feel — it was sized to the plume and the slab this building actually sits on.",
    },
    {
      id: "walkdown", kind: "find", noHint: true,
      targets: ["slab-crack", "sump-lid-open"],
      itemNames: { "slab-crack": "unsealed slab penetration", "sump-lid-open": "open floor-drain sump lid" },
      itemNotes: {
        "slab-crack": "This control-joint crack runs straight to the sub-slab gravel the system depends on. Left open, it is a second uncontrolled inlet the fan has to compete with, and the vacuum field will always find the shorter path first.",
        "sump-lid-open": "The floor-drain sump lid is sitting ajar rather than seated and gasketed. A sump like this is plumbed straight into the same sub-slab void the system is trying to hold a vacuum on, and an open lid gives that vacuum a much easier way out than through the slab.",
      },
      title: "Walk the room before the system goes live",
      cue: "Look over the slab and the floor penetrations and click what needs sealing before the communication test.",
      why: "Every uncontrolled opening in this floor is a path the vacuum field will take instead of the path the design intended. Finding them now, before the fan ever runs, is the difference between commissioning a system and troubleshooting one that never worked.",
    },
    {
      id: "comm-test", kind: "track", target: "micromanometer", seconds: 8,
      title: "Run the sub-slab communication test",
      cue: "Hold the temporary suction at the pit steady while the micromanometer differential across the design's test points climbs into and holds the band.",
      why: "This is the whole premise of the system proven before the fan is ever installed: that the sub-slab is one pneumatically connected space, so that one fan pulling on one pit actually reaches every test point on the print. A system installed on a slab that never passed this test is a fan pulling on a pocket of gravel, not the plume underneath the building.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.13, label: "FIELD ΔP",
        readout: (v) => (v < 0.4 ? "not yet communicating" : v > 0.62 ? "over-drawing — check for a short path" : "communicating across the slab"),
      },
      holdBreakNote: "The field dropped out of band — the differential collapsed before every test point proved connected. Bring it back and hold until the whole slab reads together.",
    },
    {
      id: "isolate-fan", kind: "sequence",
      targets: ["fan-breaker", "lock-tag", "verify-dead"],
      itemNames: { "fan-breaker": "fan circuit breaker opened", "lock-tag": "lock and tag applied", "verify-dead": "circuit tested dead" },
      title: "Prove the fan circuit dead before the housing opens",
      cue: "Open the breaker, lock and tag it, then test the leads dead — in that order — before the fan housing is touched.",
      why: "Open, then lock and tag, then test: that order is 1910.147 itself. A breaker left merely open can be closed by anyone who does not see a tag on it, and a circuit that has never actually been tested is only assumed dead — the fan's own terminal block is the last thing to trust that assumption on.",
      outOfOrderNote: "Open the breaker first, then lock and tag it, then test the leads dead. Testing a circuit nobody has locked out yet proves nothing about what happens the moment you look away.",
    },
    {
      id: "hang-fan", kind: "drag", target: "fan-unit",
      title: "Hang the fan on its hangers",
      cue: "Carry the fan from the cart to the strap hangers below the joist and set it square on the riser line.",
      why: "The fan hangs on its own strap hangers, isolated from the riser it connects to, so the piping is never carrying the fan's weight or its vibration. A fan resting on the pipe instead of its hangers eventually cracks the very joint it depends on to pull a vacuum.",
      drag: { to: "fan-hanger-socket", radius: 0.4, missNote: "Not on the hangers — the fan seats on the strap hangers below the joist, in line with the riser, not wherever it lands." },
    },
    {
      id: "seal-riser", kind: "turn", target: "riser-coupling",
      title: "Make up the riser coupling",
      cue: "Turn the coupling by hand to the design's mark, joining the fan inlet to the pipe rising from the sub-slab pit.",
      why: "This joint is what carries the entire vacuum the fan generates down to the pit and the gravel beneath it. Made up to the design's mark by hand it seals; short of it, it leaks air the fan then wastes its whole capacity drawing through instead of through the slab.",
      turn: { turns: 0.6, axis: "y", label: "RISER COUPLING" },
    },
    {
      id: "wire-fan", kind: "sequence",
      targets: ["land-ground", "land-neutral", "land-hot", "close-housing"],
      itemNames: { "land-ground": "ground landed", "land-neutral": "neutral landed", "land-hot": "hot landed", "close-housing": "housing closed and latched" },
      title: "Land the fan's leads and close the housing",
      cue: "Land ground, then neutral, then hot, then close and latch the housing — in that order.",
      why: "Ground first and hot last is the whole point of the order: a ground that is already landed protects everyone working the rest of the box, and the hot conductor is the one you want in your hand for the shortest time possible, connected last with the circuit already proven dead.",
      outOfOrderNote: "Ground, then neutral, then hot, then close the housing. The hot conductor is landed last precisely so nobody is holding it any longer than the job requires.",
    },
    {
      id: "restore-power", kind: "select", target: "fan-breaker",
      title: "Restore the fan circuit",
      cue: "Remove the lock and tag and close the breaker now that the housing is closed and latched.",
      why: "Power comes back only once the housing is closed — a fan proven dead for the wiring stays proven dead until there is nothing left inside it for a hand to reach, which is exactly what a closed and latched housing means.",
    },
    {
      id: "discharge-route", kind: "drag", target: "discharge-pipe",
      title: "Route the discharge above the eave",
      cue: "Carry the discharge riser up and set it in the termination clear of the eave line and well away from the intake louvre.",
      why: "Everything this fan pulls out of the sub-slab has to go somewhere that is not back into this building or the one beside it. Terminated above the eave and clear of any intake, it disperses; terminated low or near a louvre, the system spends its whole life feeding the exact vapor intrusion it exists to stop back through the nearest open window.",
      drag: { to: "eave-termination", radius: 0.4, missNote: "Not clear of the roofline — the discharge terminates above the eave, away from every intake, not at whatever fitting is closest." },
    },
    {
      id: "set-manometer", kind: "gauge", target: "utube-manometer",
      title: "Set the system manometer",
      cue: "Zero the u-tube manometer with the fan running and commit the reading once it settles.",
      why: "The manometer is the system's own permanent readout — the thing a building engineer glances at every day long after this crew has left. Set correctly now, a falling reading months from now is the first and only warning that the system has stopped protecting the building.",
      gauge: { label: "SYSTEM ΔP", speed: 0.7, green: [0.42, 0.62], readout: (t) => `${(0.2 + t * 1.4).toFixed(2)} in. w.c.`, missNote: "Outside the operating band the design calls for. Let the fan settle and read it again before calling the manometer set." },
    },
    {
      id: "alarm-setpoint", kind: "turn", target: "alarm-dial",
      title: "Set the alarm set point",
      cue: "Dial the low-vacuum alarm to the design's set point below the reading the manometer just proved.",
      why: "The alarm is what tells a building engineer the fan has failed on a Tuesday afternoon rather than the system quietly doing nothing until the next annual inspection finds it. Set below the proven operating point, it trips on an actual loss of vacuum instead of on the system's own normal fluctuation.",
      turn: { turns: 0.5, axis: "y", label: "ALARM SET POINT" },
    },
    {
      id: "verify-vacuum", kind: "gauge", target: "vacuum-gauge",
      title: "Verify vacuum at every test point",
      cue: "Read the weakest of the design's test points against its stated minimum and commit only once every point holds.",
      why: "The communication test proved the slab is one connected space; this is the proof the running system actually holds the design's minimum vacuum at the point furthest from the pit, which is the point that fails first if anything is wrong. A system that holds at the pit and fails at the far corner is a system that has not been verified at all.",
      gauge: { label: "WEAKEST TEST POINT", speed: 0.68, green: [0.44, 0.64], readout: (t) => `${(0.006 + t * 0.05).toFixed(3)} in. w.c.`, missNote: "Below the design's minimum at that point. The field does not reach that far yet — check the riser and the seals before calling this system verified." },
    },
    {
      id: "air-sample", kind: "hold", target: "air-sample-pump", seconds: 6,
      title: "Take the indoor-air sample",
      cue: "Hold the sample pump running for the full duration with the system operating.",
      why: "This canister is what actually answers the question the whole job exists to answer: is the air in this building, right now, with the system running, safe to breathe. Every other reading in this station is a proxy for this one.",
      holdBreakNote: "The pump came off before the full duration ran — a partial draw is not a representative sample. Reset the canister and hold the complete duration again.",
    },
    {
      id: "coc", kind: "sequence",
      targets: ["label-sample", "seal-sample"],
      itemNames: { "label-sample": "canister labelled with location, date and time", "seal-sample": "custody seal applied" },
      title: "Label and seal the sample's chain of custody",
      cue: "Label the canister, then apply the custody seal.",
      why: "An unlabelled or unsealed canister is a result nobody downstream can trust to be this room, on this day, under this system's operation — and a mitigation system's whole case rests on a sample the lab and the regulator both believe.",
      outOfOrderNote: "Label the canister first, then seal it — the seal is what proves the label on it has not been swapped since.",
    },
    {
      id: "sign-placard", kind: "select", target: "ops-placard",
      title: "Sign the operations and maintenance placard",
      cue: "Sign and post the placard naming the design vacuum, the alarm set point and who to call if it trips.",
      why: "This placard is the only part of the whole job that stays in the room after the crew leaves. A building engineer who finds the alarm tripped six months from now acts on what this placard says, not on what anyone remembers about today.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, VM_ACCENT);

    // ---------------------------------------------------------------- floor & wall
    box(g, 5.4, 0.08, 4.6, 0, 0.04, -0.2, 0x848c92, { rough: 0.88, finish: "concrete", tile: [5, 4] });
    box(g, 5.4, 2.9, 0.14, 0, 1.55, -2.1, 0xcfd6da, { rough: 0.88 });
    box(g, 5.4, 0.16, 0.32, 0, 3.0, -2.1, 0xb4bcc2, { rough: 0.8 });
    // Overhead joist the fan hangs from.
    const joist = box(g, 3.6, 0.16, 0.2, 0.1, 2.6, 0.3, 0x8a7358, { rough: 0.85 });
    void joist;

    // ---------------------------------------------------------------- design print
    const designBoard = group(g, -1.85, 0, -1.95, 0.15);
    holoPanel(designBoard, 0.95, 0.66, 0, 1.35, 0, (ctx, w, h) => {
      ctx.fillStyle = "#170c26"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a07eff"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efe6ff"; ctx.fillText("SSD MITIGATION DESIGN", w * 0.06, h * 0.12);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#e2d6fb";
      ["Test points: TP-1, TP-2, TP-3 (TP-3 farthest from pit)", "Min. sub-slab vacuum: 0.010 in. w.c. at every point",
        "Fan: inline centrifugal, hung on strap hangers", "Discharge: terminate above eave, 3 m clear of any intake",
        "Alarm set point: below proven operating ΔP", "Sample: indoor air, full-canister hold, chain of custody"].forEach((l, i) => {
        ctx.fillText(l, w * 0.06, h * (0.26 + i * 0.115));
      });
    }, { accent: VM_ACCENT });
    reg(hits, designBoard, "design-print");

    // ---------------------------------------------------------------- electrical panel
    const panel = equipmentCabinet(g, 0.56, 0.72, 0.24, 1.95, -1.95, { color: 0x4a545e, doorColor: 0x39424b, ry: 0 });
    holoTag(panel, "fan circuit — panel B", 0, 1.0, 0.14, { css: "#a07eff", w: 0.42 });
    const breakerGroup = group(panel, 0, 0.6, 0.14);
    box(breakerGroup, 0.14, 0.2, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    const breakerLever = box(breakerGroup, 0.05, 0.09, 0.03, 0, 0.03, 0.04, 0xf2c14b, { rough: 0.5 });
    reg(hits, breakerGroup, "fan-breaker");
    const lock = lockTag(panel, 0.16, 0.6, 0.15, { color: 0xd2312b, lines: ["ELECTRICIAN", "ON DUTY"], tilt: -0.5 });
    reg(hits, lock, "lock-tag");
    const tester = group(panel, -0.2, 0.55, 0.16);
    box(tester, 0.06, 0.12, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    const testerScreen = decal(tester, 0.05, 0.03, 0, 0.07, 0.016, signFace("---", { bg: "#0d1c24", accent: "#f2c14b", fg: "#eaf6fb", scale: 0.65 }));
    for (const dz of [-0.02, 0.02]) cyl(tester, 0.006, 0.006, 0.09, dz * 2, -0.1, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8 });
    reg(hits, tester, "verify-dead");

    // ---------------------------------------------------------------- slab crack + sump
    const crackMesh = box(g, 0.5, 0.012, 0.05, -0.7, 0.05, 0.7, 0x1e1a14, { rough: 0.98, cast: false });
    crackMesh.rotation.y = 0.35;
    holoTag(g, "unsealed control joint", -0.7, 0.3, 0.7, { css: "#f2c14b", w: 0.5 });
    reg(hits, crackMesh, "slab-crack");
    const tapeRoll = torus(g, 0.06, 0.03, -0.95, 0.09, 0.55, 0xd8c94a, { rough: 0.7, seg: 10, seg2: 18 });
    tapeRoll.rotation.x = Math.PI / 2;
    holoTag(g, "tape it and move on?", -0.95, 0.28, 0.55, { css: "#d2312b", w: 0.44 });
    reg(hits, tapeRoll, "tape-not-seal");

    const sump = group(g, -1.55, 0, 1.1);
    cyl(sump, 0.26, 0.26, 0.06, 0, 0.03, 0, 0x53606b, { rough: 0.8, metal: 0.3, seg: 20 });
    const sumpLid = cyl(sump, 0.24, 0.24, 0.03, 0.06, 0.075, 0.02, 0x3c454e, { rough: 0.7, metal: 0.35, seg: 20 });
    sumpLid.rotation.z = 0.22;
    holoTag(sump, "floor-drain sump", 0, 0.32, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, sumpLid, "sump-lid-open");
    const sumpAlarmRing = torus(sump, 0.27, 0.012, 0, 0.02, 0, 0xd2312b, { emissive: 0xd2312b, ei: 2.2, rough: 0.4, seg: 8, seg2: 24 });
    sumpAlarmRing.rotation.x = Math.PI / 2;
    sumpAlarmRing.visible = false;

    // ---------------------------------------------------------------- test points (decorative — visuals for comm-test)
    const tpFaces = {};
    const tpSpecs = [["TP-1", -0.3, 0.4], ["TP-2", 0.3, 0.35], ["TP-3", 1.05, 0.55]];
    for (const [label, dx, dz] of tpSpecs) {
      const tp = group(g, dx, 0, dz);
      cyl(tp, 0.03, 0.035, 0.1, 0, 0.05, 0, 0x6f7a83, { rough: 0.6, metal: 0.4, seg: 12 });
      const face = decal(tp, 0.14, 0.05, 0, 0.11, 0, signFace("-- Pa", { bg: "#170c26", accent: "#a07eff", fg: "#efe6ff", scale: 0.6 }), { glow: true, ei: 0.7 });
      face.rotation.x = -Math.PI / 2;
      holoTag(tp, label, 0, 0.2, 0, { css: "#a07eff", w: 0.16 });
      tpFaces[label] = face;
    }

    // ---------------------------------------------------------------- suction pit + micromanometer
    const pit = group(g, 0.1, 0, 0.3);
    cyl(pit, 0.09, 0.09, 0.14, 0, 0.07, 0, 0x6f7a83, { rough: 0.6, metal: 0.4, seg: 16 });
    const riserLower = cyl(pit, 0.045, 0.045, 0.95, 0, 0.62, 0, 0xdfe3e6, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(pit, "suction pit", 0, 0.2, 0.14, { css: "#a07eff", w: 0.3 });
    void riserLower;

    const microCart = group(g, 0.85, 0, 1.0);
    box(microCart, 0.34, 0.55, 0.24, 0, 0.28, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const microMeter = instrument(microCart, 0, 0.58, 0, { idle: "-- Pa", color: 0xa07eff, w: 0.14, d: 0.2 });
    holoTag(microCart, "micromanometer", 0, 0.76, 0, { css: "#a07eff", w: 0.4 });
    reg(hits, microMeter, "micromanometer");
    hose(g, [[0.85, 0.5, 1.0], [0.4, 0.4, 0.7], [0.1, 0.15, 0.35]], 0.01, 0x2f7d4a, { steps: 12 });

    // ---------------------------------------------------------------- fan, staged then hung
    const fanCart = group(g, 1.75, 0, 0.9, -0.3);
    box(fanCart, 0.5, 0.06, 0.4, 0, 0.5, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    for (const [sx, sz] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]]) cyl(fanCart, 0.03, 0.03, 0.5, sx, 0.25, sz, 0x2b2f34, { rough: 0.8, seg: 10 });
    const fanUnit = group(fanCart, 0, 0.58, 0);
    cyl(fanUnit, 0.15, 0.15, 0.34, 0, 0.16, 0, 0xe8eef2, { rough: 0.5, metal: 0.3, seg: 20 });
    cyl(fanUnit, 0.06, 0.06, 0.14, 0, 0.16, -0.24, 0x9aa3ab, { rough: 0.5, metal: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    cyl(fanUnit, 0.06, 0.06, 0.14, 0, 0.16, 0.24, 0x9aa3ab, { rough: 0.5, metal: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const coverLatch = box(fanUnit, 0.08, 0.05, 0.03, 0.14, 0.3, 0, 0xd2312b, { rough: 0.5 });
    holoTag(fanUnit, "terminal cover", 0.14, 0.42, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, coverLatch, "housing-live");
    holoTag(fanUnit, "inline SSD fan", 0, 0.5, 0, { css: "#a07eff", w: 0.3 });
    reg(hits, fanUnit, "fan-unit");

    // The hanger socket the fan lands on, below the joist, in line with the riser.
    const hangerSocket = group(g, 0.1, 0, 0.3, 0);
    hits["fan-hanger-socket"] = hangerSocket;
    for (const dz of [-0.14, 0.14]) {
      box(g, 0.02, 0.9, 0.02, 0.1, 2.1, 0.3 + dz, 0x8a939b, { rough: 0.5, metal: 0.6, cast: false });
    }

    // Riser coupling — where the hung fan's inlet meets the pit's riser pipe.
    const coupling = group(g, 0.1, 0, 0.3, 0);
    const couplingBody = cyl(coupling, 0.06, 0.06, 0.1, 0, 1.15, 0, 0xc9a94f, { rough: 0.5, metal: 0.6, seg: 16 });
    holoTag(coupling, "riser coupling", 0.16, 1.15, 0, { css: "#a07eff", w: 0.34 });
    reg(hits, couplingBody, "riser-coupling");
    const wrench = group(g, 0.55, 0, 0.55, 0.6);
    box(wrench, 0.32, 0.03, 0.06, 0, 0.9, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    box(wrench, 0.08, 0.08, 0.08, -0.16, 0.9, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    holoTag(wrench, "put a wrench on it?", 0, 1.0, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, wrench, "wrench-riser");

    // Fan terminal box for wiring, at the hung position.
    const wireBox = group(g, 0.1, 0, 0.3, 0);
    box(wireBox, 0.16, 0.12, 0.1, 0.2, 1.55, 0, 0x2b2f34, { rough: 0.6 });
    const leadG = box(wireBox, 0.02, 0.02, 0.02, 0.16, 1.5, 0.02, 0x59c97b, { rough: 0.5 });
    reg(hits, leadG, "land-ground");
    const leadN = box(wireBox, 0.02, 0.02, 0.02, 0.2, 1.5, 0.02, 0xdfe6ec, { rough: 0.5 });
    reg(hits, leadN, "land-neutral");
    const leadH = box(wireBox, 0.02, 0.02, 0.02, 0.24, 1.5, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, leadH, "land-hot");
    const cover2 = box(wireBox, 0.17, 0.13, 0.02, 0.2, 1.55, 0.06, 0x9aa3ab, { rough: 0.5, metal: 0.4 });
    cover2.rotation.y = 0.9;
    reg(hits, cover2, "close-housing");
    holoTag(wireBox, "terminal box", 0.2, 1.68, 0, { css: "#a07eff", w: 0.28 });

    // ---------------------------------------------------------------- discharge riser + eave termination
    const dischargeStub = cyl(g, 0.045, 0.045, 0.9, 0.1, 2.15, 0.3, 0xdfe3e6, { rough: 0.5, metal: 0.3, seg: 14, cast: false });
    void dischargeStub;
    const dischargeCart = group(g, -0.6, 0, 1.3, 0.4);
    box(dischargeCart, 0.1, 0.7, 0.1, 0, 0.35, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const dischargePipe = cyl(dischargeCart, 0.045, 0.045, 0.7, 0, 0.35, 0, 0xdfe3e6, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(dischargeCart, "discharge riser", 0, 0.78, 0, { css: "#a07eff", w: 0.34 });
    reg(hits, dischargePipe, "discharge-pipe");

    const eaveTerm = group(g, 0.1, 0, 0.3, 0);
    box(g, 0.3, 0.06, 0.06, 0.1, 3.1, 0.3, 0x3c454e, { rough: 0.6, metal: 0.4, cast: false });
    holoTag(g, "eave termination — clear of intakes", 0.1, 3.25, 0.3, { css: "#59c97b", w: 0.62 });
    hits["eave-termination"] = eaveTerm;

    // Decoy intake louvre, well away from the correct termination.
    const intake = group(g, -2.0, 0, -1.6, 0);
    box(intake, 0.5, 0.4, 0.06, 0, 2.6, 0, 0x4a545e, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(intake, 0.42, 0.03, 0.04, 0, 2.4 + i * 0.09, 0.03, 0x2b2f34, { rough: 0.6, cast: false });
    holoTag(intake, "make-up air intake", 0, 2.9, 0, { css: "#f2c14b", w: 0.4 });
    const intakeHazard = box(g, 0.2, 0.2, 0.2, -1.75, 2.6, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "vent it here instead?", -1.75, 2.85, -1.5, { css: "#d2312b", w: 0.4 });
    reg(hits, intakeHazard, "discharge-near-intake");

    // ---------------------------------------------------------------- manometer, alarm, vacuum gauge
    const manoBoard = group(g, 0.55, 0, 0.85, 0);
    box(manoBoard, 0.24, 0.34, 0.05, 0, 1.5, 0, 0xe8eef2, { rough: 0.4, opacity: 0.6, transparent: true });
    const manoTubeA = cyl(manoBoard, 0.008, 0.008, 0.28, -0.06, 1.5, 0.03, 0x59c97b, { rough: 0.3, opacity: 0.8, transparent: true, seg: 8 });
    const manoTubeB = cyl(manoBoard, 0.008, 0.008, 0.28, 0.06, 1.5, 0.03, 0x59c97b, { rough: 0.3, opacity: 0.8, transparent: true, seg: 8 });
    void manoTubeA; void manoTubeB;
    const manoScreen = decal(manoBoard, 0.2, 0.06, 0, 1.66, 0.026, signFace("-- in.wc", { bg: "#170c26", accent: "#a07eff", fg: "#efe6ff", scale: 0.6 }), { glow: true, ei: 0.75 });
    holoTag(manoBoard, "u-tube manometer", 0, 1.72, 0, { css: "#a07eff", w: 0.4 });
    reg(hits, manoBoard, "utube-manometer");

    const alarmBox = group(g, 0.9, 0, 0.55, -0.3);
    box(alarmBox, 0.2, 0.24, 0.1, 0, 1.55, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const alarmDialFace = cyl(alarmBox, 0.06, 0.06, 0.02, 0, 1.6, 0.06, 0xdfe3e6, { rough: 0.4, seg: 20 });
    const alarmPointer = box(alarmBox, 0.05, 0.006, 0.006, 0.02, 1.6, 0.075, 0xd2312b, { rough: 0.5 });
    void alarmDialFace;
    holoTag(alarmBox, "low-vacuum alarm", 0, 1.78, 0.06, { css: "#a07eff", w: 0.38 });
    reg(hits, alarmPointer, "alarm-dial");
    const vacGaugeScreen = instrument(alarmBox, 0, 1.42, 0.06, { idle: "-- in.wc", color: 0xa07eff, w: 0.14, d: 0.2 });
    holoTag(alarmBox, "vacuum gauge", 0, 1.28, 0.06, { css: "#a07eff", w: 0.3 });
    reg(hits, vacGaugeScreen, "vacuum-gauge");
    const alarmLamp = ball(alarmBox, 0.02, -0.06, 1.66, 0.06, 0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
    void alarmLamp;

    // ---------------------------------------------------------------- sample bench + placard
    const bench = group(g, -1.9, 0, 0.4, 0.5);
    box(bench, 0.9, 0.75, 0.45, 0, 0.375, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const samplePump = group(bench, -0.25, 0.78, 0);
    box(samplePump, 0.22, 0.18, 0.16, 0, 0, 0, 0x4a545e, { rough: 0.6, metal: 0.35 });
    cyl(samplePump, 0.05, 0.05, 0.14, 0.14, 0.12, 0, 0xe8eef2, { rough: 0.4, opacity: 0.7, transparent: true, seg: 12 });
    holoTag(samplePump, "indoor-air sample", 0, 0.2, 0, { css: "#a07eff", w: 0.42 });
    reg(hits, samplePump, "air-sample-pump");
    const labelDecal = decal(bench, 0.2, 0.12, 0.12, 0.795, -0.12, signFace("LABEL", { bg: "#170c26", accent: "#a07eff", scale: 0.55 }));
    holoTag(bench, "label the canister", 0.12, 0.95, -0.12, { css: "#a07eff", w: 0.36 });
    reg(hits, labelDecal, "label-sample");
    const sealDecal = decal(bench, 0.16, 0.1, 0.32, 0.795, -0.02, signFace("SEAL", { bg: "#170c26", accent: "#f2c14b", scale: 0.55 }));
    holoTag(bench, "custody seal", 0.32, 0.92, -0.02, { css: "#a07eff", w: 0.3 });
    reg(hits, sealDecal, "seal-sample");

    const placard = decal(g, 0.5, 0.36, 1.4, 1.55, -2.02, paperFace("SSD SYSTEM — OPERATIONS", ["Design vacuum: 0.010 in.wc min", "Alarm set point: below proven ΔP", "If alarm sounds, call the installer", "Tester / date ______________"], { scale: 0.8 }));
    holoTag(g, "operations placard", 1.4, 1.8, -2.0, { css: "#a07eff", w: 0.4 });
    reg(hits, placard, "ops-placard");

    toolChest(g, 1.9, 1.7, { ry: -0.6, color: 0x2f6f8c });
    const tech = standingFigure(g, -0.6, -1.3, { ry: 0.3, cloth: 0x37505f });
    holoTag(tech, "installer", 0, 1.9, 0, { css: "#a07eff", w: 0.28 });
    for (const [x, z] of [[2.1, -1.6], [-2.1, 1.7]]) cone(g, x, z);

    let leaking = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.1, -0.7),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "walkdown") { crackMesh.visible = false; sumpLid.rotation.z = 0; sumpLid.position.set(0.06, 0.075, 0.02); }
        if (step.id === "isolate-fan") { breakerLever.rotation.x = -1.2; repaint(testerScreen, signFace("0 V", { bg: "#0d1c14", accent: "#59c97b", fg: "#eaf6fb", scale: 0.62 })); }
        if (step.id === "hang-fan") { fanCart.remove(fanUnit); hangerSocket.add(fanUnit); fanUnit.position.set(0, 1.35, 0); fanUnit.rotation.set(0, 0, 0); coverLatch.visible = false; }
        if (step.id === "restore-power") { breakerLever.rotation.x = 0; }
        if (step.id === "discharge-route") { dischargeCart.remove(dischargePipe); eaveTerm.add(dischargePipe); dischargePipe.position.set(0, 2.6, 0); dischargePipe.rotation.set(0, 0, 0); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "sump-air-loss") { leaking = true; sumpAlarmRing.visible = true; sumpLid.rotation.z = 0.22; }
        if (it.id === "occupant-breaker") { breakerLever.rotation.x = -1.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sump-air-loss") { leaking = false; sumpAlarmRing.visible = false; sumpLid.rotation.z = 0; }
        if (it.id === "occupant-breaker") { breakerLever.rotation.x = 0; }
      },
      animate(t, dt, session) {
        if (leaking) sumpAlarmRing.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.2;
        const step = session?.step;
        if (step?.id === "comm-test" && session.track) {
          const v = session.track.v;
          for (const [label] of tpSpecs) {
            const jitter = label === "TP-3" ? v * 0.85 : v;
            repaint(tpFaces[label], signFace(`${Math.round(jitter * 14)} Pa`, { bg: "#170c26", accent: jitter >= 0.4 && jitter <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#efe6ff", scale: 0.6 }));
          }
        }
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "set-manometer") repaint(manoScreen, signFace(`${(0.2 + gg.t * 1.4).toFixed(2)} in.wc`, { bg: "#170c26", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#efe6ff", scale: 0.6 }));
          if (step?.id === "verify-vacuum") repaint(vacGaugeScreen.userData.screen, signFace(`${(0.006 + gg.t * 0.05).toFixed(3)}`, { bg: "#0d1c14", accent: gg.t >= 0.44 && gg.t <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "alarm-setpoint") alarmPointer.rotation.z = -session.turn.amount * Math.PI * 0.6;
        if (session?.turn && step?.id === "seal-riser") couplingBody.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
