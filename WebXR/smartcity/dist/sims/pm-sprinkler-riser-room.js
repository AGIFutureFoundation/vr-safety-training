import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, valveWheel, pipeRun, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sprinkler Riser Room VR — Building Systems & Facilities,
// property management programme, zone six of twenty.
//
// The room where the building's sprinkler system comes in from the street,
// inspected the way an IUOE Local 39 building engineer inspects it under
// NFPA 25: the inspection log read, the valves walked — and one floor control
// valve found shut — the impairment handled with tag, notice and a fire
// watch, the valve reopened and chained, the static pressure read, a main
// drain flowed and compared, the inspector's test valve opened to prove the
// waterflow alarm, the impairment ended and the building log written. A
// generic building; no real monitoring company, fire department or
// contractor is named.

const PMSR_ACCENT = 0xd84a3a;

export const SIM_PM_SPRINKLER_RISER_ROOM = {
  id: "pm-sprinkler-riser-room",
  index: "306",
  domain: "Property Management",
  trade: "Building engineer — IUOE Local 39 stationary engineers, with the sprinkler contractor's inspector and an SEIU porter on fire watch",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "NFPA 25 (inspection, testing and maintenance of water-based fire protection systems) for control valve inspections, gauges, spare sprinklers, main drain tests, inspector's test flows and the impairment procedure — tag, notify, fire watch, restore; NFPA 72 for the waterflow and valve tamper signals the riser sends to the fire alarm; OSHA 29 CFR 1910.157 for the extinguisher a fire watch carries and 29 CFR 1910.22 for a floor kept dry around a drain test; the state fire code's impairment notice to the fire department; IUOE Local 39 building engineers and SEIU porters.",
  supportLine: "IUOE Local 39's member services, the SEIU member assistance line or your employer's EAP",
  name: "Sprinkler Riser Room",
  title: simTitle("Sprinkler Riser Room"),
  tagline: "The riser inspected under NFPA 25: a closed floor valve found, the impairment tagged, notified and watched, the valve reopened and chained, pressure read, a main drain flowed, the waterflow alarm proven and the impairment ended",
  accent: PMSR_ACCENT,
  accentCss: "#d84a3a",
  parSeconds: 270,
  footprint: 2.4,
  badge: { id: "valves-open", name: "Valves Open", note: "Every control valve found, reopened, proven and signed off with the impairment handled by the book" },

  game: system({
    name: "Riser Watch",
    currency: "PSI",
    ranks: ["Engineer Trainee", "Building Engineer", "Fire Systems Engineer", "Chief Engineer", "Riser Watch Certified"],
    badges: [
      { id: "never-shut", name: "Never Shut", note: "No unsafe action anywhere in the inspection", test: AWARD.safe },
      { id: "impairment-by-the-book", name: "By the Book", note: "The impairment handled in order on the first try", test: AWARD.stepClean("impairment") },
      { id: "static-true", name: "Static True", note: "Pressure committed near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections anywhere", test: AWARD.clean },
      { id: "short-impairment", name: "Short Impairment", note: "Inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-valves", name: "Eight Clean", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "main-valve-close": "You are reaching to close the main control valve to stop one dripping head. That shuts the sprinklers off for the entire building, and the fire that starts while it is closed will find no water. NFPA 25 treats any closed control valve as an impairment to be tagged, notified and watched — and a drip is fixed at the floor valve, not the main.",
    "hose-hook-on-pipe": "You are hanging the drain hose on the sprinkler pipe to get it off the floor. NFPA 25 does not allow sprinkler piping to carry loads it was never braced for; hangers let go, fittings crack, and a pipe used as a hook is one of the most common deficiencies an inspector writes up.",
    "test-hose-loose": "You are about to open the main drain with its discharge hose lying loose on the floor. A main drain flows at full system pressure; a loose hose whips, sprays the electrical panel next to it and floods the room. The discharge goes through the fixed drain line to the outside, secured, before the valve moves.",
    "closed-valve-signoff": "You are initialling the weekly valve card on a valve that is shut. A signature is the building's statement that the valve was checked and found open; signing it closed turns a finding into a false record, and it is exactly the paperwork that is read aloud after a fire where the sprinklers did not operate.",
  },

  lateNotes: {
    "valve-chain": "The chain goes on once the valve is fully open — chaining it now would lock it shut.",
    "panel-annunciator": "Confirm the waterflow signal once the inspector's test has actually flowed long enough to send it.",
    "building-log": "The inspection is logged once the impairment is ended and the system is back in service.",
  },

  steps: [
    {
      id: "itm-log", kind: "select", target: "itm-log",
      title: "Read the inspection log",
      cue: "Read the riser's NFPA 25 inspection log: last week's valve checks, the last main drain result and anything still open.",
      why: "NFPA 25 is a schedule — weekly, monthly, quarterly, annual — and the log is what tells you where in it this riser is. It also holds the last main drain result, which is the number today's test is compared against: a drop between the two is how a partly closed valve or a blocked supply is found before a fire finds it.",
    },
    {
      id: "valve-walk", kind: "find", noHint: true,
      targets: ["valve-closed-f3", "gauge-date", "spare-head-cabinet"],
      itemNames: { "valve-closed-f3": "floor 3 control valve found closed", "gauge-date": "system gauge past its replacement date", "spare-head-cabinet": "spare head cabinet missing its wrench" },
      itemNotes: {
        "valve-closed-f3": "The floor 3 control valve is shut — the stem is in and the handwheel is at the stop. Somebody closed it and never reopened it; floor 3 has had no sprinkler protection since.",
        "gauge-date": "The system gauge's date is well past the replacement interval NFPA 25 sets. A gauge nobody can trust makes today's readings meaningless.",
        "spare-head-cabinet": "The spare sprinkler cabinet has heads but no wrench. A fused head cannot be replaced without the special wrench, which means the system stays off longer after any activation.",
      },
      title: "Walk the riser's valves and equipment",
      cue: "Three conditions on this riser would fail the weekly inspection. Find them.",
      why: "Most sprinkler failures in fires come down to a closed valve, and a closed valve looks almost exactly like an open one unless you read the stem or the indicator. The walk is the weekly habit NFPA 25 builds its schedule on: every valve, every gauge and the spare-head cabinet, looked at on purpose rather than passed on the way to something else.",
    },
    {
      id: "impairment", kind: "sequence", anyOrder: false,
      targets: ["impairment-tag", "monitoring-call", "firewatch-radio"],
      itemNames: { "impairment-tag": "impairment tag hung on the valve", "monitoring-call": "monitoring company and fire department told", "firewatch-radio": "porter sent to floor 3 on fire watch" },
      title: "Treat the closed valve as an impairment",
      cue: "Hang the impairment tag, tell the monitoring company and the fire department, then put a porter on fire watch on floor 3.",
      why: "The moment the closed valve was found, floor 3 became an impaired system, and NFPA 25's impairment procedure applies whether it was closed an hour ago or a month ago: the tag says so at the valve, the notice tells the people who would respond to a fire, and the fire watch is a person walking the unprotected floor with an extinguisher until the water is back.",
      outOfOrderNote: "Tag, notify, then fire watch. The tag goes on first so nobody else touches the valve while you are on the phone.",
    },
    {
      id: "open-valve", kind: "turn", target: "f3-valve-wheel",
      title: "Reopen the floor 3 control valve fully",
      cue: "Turn the floor 3 handwheel open until the stem is fully out, then back it off a quarter turn.",
      why: "A control valve is only open when it is fully open; a valve cracked a few turns reads as open to anyone glancing at it and chokes the flow a fire needs. Turning it to the stop and backing off a quarter turn is the fitters' habit that keeps it from binding — and the extended stem is what the next inspector reads.",
      turn: { turns: 2, axis: "z", label: "FLOOR 3 CONTROL VALVE", readout: (t) => `${Math.round(t * 100)}% OPEN` },
    },
    {
      id: "static-pressure", kind: "gauge", target: "riser-gauge",
      title: "Read the riser's static pressure",
      cue: "Read the system gauge now the valve is open and commit when it settles inside the normal static band.",
      why: "Static pressure is the riser at rest: city supply plus whatever the fire pump or the tank adds. A reading well below the log's normal points to a supply problem — a partly shut underground valve, a failing check — and a reading above it can mean a pressure-regulating fault. Either way, the drain test that follows is only meaningful against a trustworthy static.",
      gauge: {
        label: "RISER STATIC PRESSURE", speed: 0.5, green: [0.48, 0.62],
        readout: (t) => `${Math.round(20 + t * 140)} psi`,
        missNote: "That is outside the riser's normal static band. Let the gauge settle and read it again — and if it truly sits there, that is a supply problem to report.",
      },
    },
    {
      id: "main-drain", kind: "hold", target: "main-drain", seconds: 6,
      title: "Flow the main drain test",
      cue: "With the discharge secured to the outside, hold the main drain wide open until the residual pressure settles, then close it slowly.",
      why: "A main drain test drops the riser's pressure while flowing and shows how quickly and how far it recovers. NFPA 25 compares that residual against earlier results: a residual much lower than last time is a partly closed valve or an obstruction somewhere upstream. Holding it open until the reading settles is what makes the number comparable at all.",
      holdBreakNote: "You closed it before the residual settled. Open it again and hold it until the gauge stops moving — a half-flowed test cannot be compared with anything.",
    },
    {
      id: "chain-valve", kind: "drag", target: "valve-chain",
      title: "Chain and lock the reopened valve",
      cue: "Carry the chain and padlock to the floor 3 handwheel and lock it in the open position.",
      why: "A chain and lock through the handwheel is what keeps an open valve open between inspections — against a contractor looking for a quick shut-off, or a well-meaning resident who hears water. NFPA 25 accepts a locked or electronically supervised valve on a longer inspection interval precisely because the lock makes an accidental closure so much harder.",
      drag: { to: "f3-chain-socket", radius: 0.5, missNote: "Not on the handwheel. Loop the chain through the floor 3 wheel before you let go." },
    },
    {
      id: "itv-flow", kind: "track", target: "itv-valve", seconds: 6,
      title: "Flow the inspector's test valve",
      cue: "Open the inspector's test valve and keep a steady flow through the sight glass until the waterflow alarm reports.",
      why: "The inspector's test valve flows the same water as one open sprinkler, so it proves the whole chain a real fire depends on: the flow switch sees it, the fire alarm reports it, and the bell rings. A trickle may never trip the switch and a surge floods the drain; a steady flow, held, is the test NFPA 25 and NFPA 72 both expect.",
      track: {
        start: 0.2, green: [0.4, 0.62], rise: 0.45, fall: 0.4, drift: 0.1,
        label: "INSPECTOR'S TEST — FLOW",
        readout: (v) => (v < 0.4 ? "trickle — switch will not trip" : v > 0.62 ? "surging — drain overflowing" : "steady one-head flow"),
      },
      holdBreakNote: "The flow wandered out of the steady band. Bring it back to one head's worth and hold it until the alarm reports.",
    },
    {
      id: "flow-signal", kind: "select", target: "panel-annunciator",
      title: "Confirm the waterflow signal",
      cue: "Close the test valve and confirm the waterflow alarm showed at the annunciator and reached the monitoring company.",
      why: "A bell that rings in the riser room proves only the local alarm. The signal has to reach the fire alarm panel and the monitoring company, or a real sprinkler activation at 3 a.m. rings in an empty room. Confirming both ends of the chain is the whole reason the test is run.",
    },
    {
      id: "end-impairment", kind: "sequence", anyOrder: false,
      targets: ["impairment-tag", "monitoring-call"],
      itemNames: { "impairment-tag": "impairment tag removed", "monitoring-call": "monitoring company and fire department told the system is restored" },
      title: "End the impairment",
      cue: "Remove the impairment tag, then tell the monitoring company and the fire department the system is back in service.",
      why: "An impairment that is never formally ended leaves the fire department believing floor 3 is unprotected and the monitoring company treating its signals as expected. Ending it the same way it was started — at the valve, then by phone — closes the record and brings the porter off fire watch.",
      outOfOrderNote: "Tag off first, then the call. Telling them the system is restored while the tag still says otherwise leaves two records that disagree.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Write the inspection into the building log",
      cue: "Log the closed valve and how long it was found shut, the main drain result against last time, the flow test and the gauge and wrench to replace.",
      why: "NFPA 25 expects inspection, testing and impairment records to be kept, and they are the building's evidence that its sprinklers were maintained. The closed valve in particular has to be written down plainly — when it was found, who reopened it — so that the question of how it got closed can actually be answered.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the fitter and the porter",
      cue: "Ask the contractor's fitter and the porter who stood fire watch how that sat with them, and name the member lines.",
      why: "Finding a floor that has had no sprinklers for an unknown length of time is unsettling for the person who finds it and for the porter who walks that floor with an extinguisher. A short check-in with both, with the IUOE Local 39 and SEIU member lines named, is how a crew makes room for that before the next task.",
    },
  ],

  interrupts: [
    {
      id: "inspector-arrives",
      kind: "Inspector arrives",
      after: "main-drain", delay: 3, seconds: 12,
      alert: "A fire department inspector walks in mid-test for the annual inspection and asks for the last five years of main drain results.",
      cue: "Close the drain slowly, then hand over the records from the cabinet.",
      target: "records-cabinet",
      why: "Main drain results only mean something as a series, and the inspector is asking for the series. Producing years of results from the records cabinet shows the building has been comparing them all along; being unable to is itself a deficiency, whatever today's number is.",
      missNote: "The inspector waited and left with no drain history. Today's result has nothing to be compared against, and the building's records are written up before its valves are.",
      wrongNote: "Not that. The inspector wants the main drain history — it is in the records cabinet on the wall.",
    },
    {
      id: "tamper-trouble",
      kind: "Alarm trouble signal",
      after: "itv-flow", delay: 3, seconds: 12,
      alert: "The annunciator's amber trouble lamp comes on: TAMPER — FLOOR 3 CONTROL VALVE. The switch never reseated when the valve was reopened.",
      cue: "Keep the flow steady, then reseat the floor 3 tamper switch.",
      target: "f3-tamper-switch",
      why: "The tamper switch is what tells the fire alarm, and the monitoring company, that a valve has moved. A switch left showing trouble on an open valve trains everybody to ignore that signal — which is the signal that would have caught the closed valve in the first place. Reseating it restores the only electronic guard floor 3 has.",
      missNote: "The tamper trouble stayed on the panel. Everybody who sees it now learns that a floor 3 tamper signal means nothing — until the day the valve really is closed again.",
      wrongNote: "That does not clear it. The floor 3 tamper switch is on the valve's yoke — reseat it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMSR_ACCENT);

    // ------------------------------------------------------------ floor
    const concTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#7a8086", base2: "#6f757b", seam: "rgba(20,24,28,0.3)" }), { repeat: 3, px: 384 });
    const conc = box(g, 6.0, 0.01, 5.6, 0, 0.005, -0.3, 0x7a8086, { rough: 0.8, cast: false });
    conc.material = texturedMat(concTex, { rough: 0.75, metal: 0.05, color: 0xc6ccd1 });
    conc.receiveShadow = true;
    decal(g, 2.8, 0.52, 0, 2.62, -5.36, signFace("SPRINKLER RISER ROOM", { bg: "#200e0c", accent: "#d84a3a", fg: "#fbe6e2", scale: 0.44 }), { px: 512 });
    const wet = box(g, 1.0, 0.004, 0.8, 1.9, 0.013, -1.3, 0x9fc4e4, { rough: 0.05, metal: 0.2, opacity: 0.35, transparent: true, cast: false });
    wet.visible = false;

    // ------------------------------------------------------------ main riser
    const riser = group(g, -1.3, 0, -2.0);
    cyl(riser, 0.09, 0.09, 4.6, 0, 2.3, 0, PMSR_ACCENT, { rough: 0.5, metal: 0.4, seg: 16 });
    // Underground entry and alarm check valve.
    cyl(riser, 0.16, 0.16, 0.4, 0, 0.2, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 14 });
    box(riser, 0.34, 0.5, 0.3, 0, 0.9, 0, 0xc8201a, { rough: 0.45, metal: 0.4 });
    decal(riser, 0.24, 0.1, 0, 0.9, 0.152, signFace("ALARM CHECK", { bg: "#8a1a14", accent: "#ffffff", fg: "#ffffff", scale: 0.45 }), { px: 128 });
    // Main OS&Y valve — the main-shut trap.
    const mainValve = valveWheel(riser, 0, 1.45, 0.18, { r: 0.16, color: 0xc8201a, body: 0x8a1a14 });
    mainValve.rotation.x = Math.PI / 2;
    holoTag(riser, "MAIN control valve", 0.35, 1.45, 0.25, { css: "#f0645b", w: 0.36 });
    reg(hits, mainValve, "main-valve-close");
    // System gauge with an old date tag.
    const gaugeG = group(riser, 0.2, 1.9, 0.1);
    cyl(gaugeG, 0.07, 0.07, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const gaugeFace = decal(gaugeG, 0.11, 0.11, 0, 0, 0.017, signFace("-- psi", { bg: "#f4f6f8", accent: "#d84a3a", fg: "#1d262e", scale: 0.3 }), { px: 128 });
    reg(hits, gaugeFace, "riser-gauge");
    const dateTag = decal(gaugeG, 0.06, 0.05, 0.1, -0.06, 0.02, paperFace("GAUGE", ["2011"], { band: "#8a2a2a" }), { px: 64 });
    reg(hits, dateTag, "gauge-date");
    // Main drain valve and its discharge through the wall.
    const drainValve = valveWheel(riser, -0.3, 0.7, 0.1, { r: 0.07, color: 0x2f6f4a, body: 0x3a4148 });
    holoTag(drainValve, "Main drain", 0, 0.45, 0, { css: "#d84a3a", w: 0.24 });
    reg(hits, drainValve, "main-drain");
    pipeRun(riser, [[-0.3, 0.7, 0], [-0.8, 0.7, 0], [-1.2, 0.7, 0]], 0.03, 0x6d7379, { steps: 6 });
    const hoseEnd = group(g, -2.2, 0, -1.2);
    for (let i = 0; i < 4; i++) {
      const s = cyl(hoseEnd, 0.03, 0.03, 0.4, i * 0.12, 0.03, i * 0.08, 0x2f5a9a, { rough: 0.7, seg: 8 });
      s.rotation.z = Math.PI / 2; s.rotation.y = i * 0.4;
    }
    holoTag(hoseEnd, "Loose discharge hose", 0.2, 0.25, 0.1, { css: "#f0645b", w: 0.38 });
    reg(hits, hoseEnd, "test-hose-loose");

    // ------------------------------------------------------------ floor control valve manifold
    const manifold = group(g, 0.3, 0, -2.2);
    pipeRun(manifold, [[-1.6, 2.8, 0], [0, 2.8, 0], [1.6, 2.8, 0]], 0.07, PMSR_ACCENT, { steps: 10 });
    const floorValves = {};
    for (const [i, fl] of [[0, 2], [1, 3], [2, 4]]) {
      const x = -0.9 + i * 0.9;
      cyl(manifold, 0.05, 0.05, 1.3, x, 2.1, 0, PMSR_ACCENT, { rough: 0.5, metal: 0.4, seg: 12 });
      const v = valveWheel(manifold, x, 1.2, 0.15, { r: 0.12, color: fl === 3 ? 0x8a2a2a : 0xc8201a, body: 0x8a1a14 });
      v.rotation.x = Math.PI / 2;
      const stem = cyl(manifold, 0.012, 0.012, fl === 3 ? 0.08 : 0.26, x, 1.2, 0.48 - (fl === 3 ? 0.09 : 0), 0xc9d0d6, { rough: 0.3, metal: 0.8, seg: 6 });
      stem.rotation.x = Math.PI / 2;
      decal(manifold, 0.16, 0.08, x, 1.62, 0.07, signFace(`FLOOR ${fl}`, { bg: "#8a1a14", accent: "#ffffff", fg: "#ffffff", scale: 0.5 }), { px: 128 });
      const tamper = box(manifold, 0.08, 0.1, 0.06, x + 0.14, 1.45, 0.1, 0x3a4148, { rough: 0.5 });
      floorValves[fl] = { v, stem, tamper };
    }
    const f3 = floorValves[3];
    holoTag(manifold, "Floor 3 handwheel", 0, 0.98, 0.3, { css: "#d84a3a", w: 0.34 });
    reg(hits, f3.v, "f3-valve-wheel");
    reg(hits, f3.stem, "valve-closed-f3");
    reg(hits, f3.tamper, "f3-tamper-switch");
    const f3Socket = box(manifold, 0.2, 0.2, 0.1, 0, 1.2, 0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["f3-chain-socket"] = f3Socket;
    const weeklyCard = decal(manifold, 0.08, 0.11, -0.14, 1.0, 0.2, paperFace("WEEKLY", ["Open ✓", "Sealed ✓", "Init: __"], { band: "#3a4148" }), { px: 96 });
    reg(hits, weeklyCard, "closed-valve-signoff");
    const impTag = group(manifold, 0.14, 1.05, 0.22);
    const impFace = decal(impTag, 0.1, 0.14, 0, 0, 0, paperFace("IMPAIRED", ["SYSTEM OUT", "OF SERVICE"], { band: "#b81410" }), { px: 96 });
    impFace.visible = false;
    const impStack = box(g, 0.14, 0.02, 0.1, 1.5, 0.92, -1.2, 0xb81410, { rough: 0.6 });
    holoTag(g, "Impairment tag", 1.5, 1.05, -1.2, { css: "#d84a3a", w: 0.3 });
    reg(hits, impStack, "impairment-tag");
    const chain = group(g, 1.15, 0.94, -1.25);
    for (let i = 0; i < 5; i++) torus(chain, 0.02, 0.005, i * 0.035, 0, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 10 }).rotation.y = (i % 2) * Math.PI / 2;
    box(chain, 0.04, 0.05, 0.02, 0.2, 0, 0, 0xd8232a, { rough: 0.5 });
    holoTag(chain, "Chain and lock", 0.1, 0.12, 0, { css: "#d84a3a", w: 0.28 });
    reg(hits, chain, "valve-chain");
    // A hose hung off the branch pipe — the trap.
    const hung = group(manifold, 1.3, 2.4, 0.1);
    torus(hung, 0.18, 0.03, 0, 0, 0, 0x2f5a9a, { rough: 0.7, seg: 8, seg2: 18 });
    box(hung, 0.02, 0.3, 0.02, 0, 0.25, 0, 0x6d7379, { rough: 0.5, metal: 0.5 });
    holoTag(hung, "Hang it on the pipe?", 0, -0.3, 0.05, { css: "#f0645b", w: 0.36 });
    reg(hits, hung, "hose-hook-on-pipe");

    // ------------------------------------------------------------ inspector's test valve
    const itv = group(g, 2.1, 0, -1.9);
    pipeRun(itv, [[0, 2.6, 0], [0, 1.2, 0]], 0.03, PMSR_ACCENT, { steps: 6 });
    const itvWheel = valveWheel(itv, 0, 1.15, 0.08, { r: 0.06, color: 0x2f6f4a, body: 0x3a4148 });
    itvWheel.rotation.x = Math.PI / 2;
    const sight = cyl(itv, 0.04, 0.04, 0.12, 0, 0.9, 0.08, 0xcfe3f0, { rough: 0.1, opacity: 0.5, transparent: true, seg: 12 });
    void sight;
    decal(itv, 0.24, 0.08, 0, 1.5, 0.05, signFace("INSPECTOR'S TEST", { bg: "#8a1a14", accent: "#ffffff", fg: "#ffffff", scale: 0.42 }), { px: 128 });
    reg(hits, itvWheel, "itv-valve");
    const flow = particles(itv, 24, 0xcfe3f0, { size: 0.02, life: 0.4, additive: false, opacity: 0.4 });
    flow.position.set(0, 0.8, 0.08);
    flow.visible = false;

    // ------------------------------------------------------------ annunciator, bell, phone, radio
    const ann = group(g, 2.55, 0, -0.4, -Math.PI / 2);
    box(ann, 0.36, 0.46, 0.06, 0, 1.5, 0, 0xb8261e, { rough: 0.5, metal: 0.2 });
    const annFace = decal(ann, 0.3, 0.16, 0, 1.58, 0.032, signFace("NORMAL", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.45 }), { glow: true, ei: 0.8, px: 192 });
    reg(hits, annFace, "panel-annunciator");
    const troubleLamp = ball(ann, 0.018, 0.08, 1.38, 0.035, 0x3a3018, { rough: 0.4, seg: 8 });
    const flowLamp = ball(ann, 0.018, -0.08, 1.38, 0.035, 0x3a1a18, { rough: 0.4, seg: 8 });
    const bell = group(g, 2.55, 2.4, -1.2, -Math.PI / 2);
    cyl(bell, 0.14, 0.14, 0.08, 0, 0, 0.04, 0xc8201a, { rough: 0.4, metal: 0.4, seg: 16 }).rotation.x = Math.PI / 2;
    decal(bell, 0.2, 0.05, 0, -0.2, 0.01, signFace("SPRINKLER ALARM", { bg: "#c8201a", accent: "#c8201a", fg: "#ffffff", scale: 0.6 }), { px: 128 });
    const desk = group(g, 1.4, 0, -1.2);
    box(desk, 0.7, 0.9, 0.45, 0, 0.45, 0, 0x5a626a, { rough: 0.5, metal: 0.4 });
    const phone = group(desk, -0.15, 0.92, 0);
    box(phone, 0.18, 0.05, 0.14, 0, 0.025, 0, 0x1b1e22, { rough: 0.5 });
    cyl(phone, 0.018, 0.018, 0.18, 0, 0.07, -0.02, 0x1b1e22, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(phone, "Monitoring · fire dept", 0, 0.2, 0, { css: "#d84a3a", w: 0.38 });
    reg(hits, phone, "monitoring-call");
    const radio = group(desk, 0.22, 0.92, 0.05);
    box(radio, 0.05, 0.14, 0.03, 0, 0.07, 0, 0x1b1e22, { rough: 0.5 });
    cyl(radio, 0.006, 0.006, 0.08, 0.015, 0.18, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    holoTag(radio, "Fire watch radio", 0, 0.32, 0, { css: "#d84a3a", w: 0.3 });
    reg(hits, radio, "firewatch-radio");

    // Spare sprinkler cabinet and the records cabinet.
    const spareCab = group(g, -2.55, 0, -0.5, Math.PI / 2);
    box(spareCab, 0.36, 0.3, 0.14, 0, 1.5, 0, 0xc8201a, { rough: 0.45, metal: 0.3 });
    for (let i = 0; i < 6; i++) cyl(spareCab, 0.012, 0.012, 0.05, -0.12 + i * 0.05, 1.5, 0.075, 0xb8853a, { rough: 0.4, metal: 0.7, seg: 6 }).rotation.x = Math.PI / 2;
    const wrenchSlot = box(spareCab, 0.3, 0.04, 0.02, 0, 1.4, 0.075, 0x14171b, { rough: 0.9 });
    holoTag(spareCab, "Spare heads — wrench?", 0, 1.72, 0.07, { css: "#d84a3a", w: 0.38 });
    reg(hits, wrenchSlot, "spare-head-cabinet");
    const wrench = box(spareCab, 0.26, 0.03, 0.02, 0, 1.4, 0.085, 0x8b949d, { rough: 0.3, metal: 0.8 });
    wrench.visible = false;
    const recCab = group(g, -2.55, 0, 0.6, Math.PI / 2);
    box(recCab, 0.6, 1.2, 0.4, 0, 0.6, 0, 0x5a626a, { rough: 0.45, metal: 0.5 });
    const recDrawer = box(recCab, 0.5, 0.2, 0.02, 0, 0.95, 0.21, 0x6d7379, { rough: 0.45, metal: 0.5 });
    holoTag(recCab, "ITM records", 0, 1.35, 0.2, { css: "#d84a3a", w: 0.26 });
    reg(hits, recDrawer, "records-cabinet");

    // FDC and backflow preventer for dressing; a unit heater overhead.
    const bf = group(g, 0.0, 0, -0.9);
    pipeRun(bf, [[-0.6, 0.5, 0], [0.6, 0.5, 0]], 0.08, 0x3a6a9a, { steps: 8, flanges: [[-0.3, 0.5, 0], [0.3, 0.5, 0]], flangeAxis: "x" });
    box(bf, 0.3, 0.26, 0.22, 0, 0.5, 0, 0x2f5a8a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-0.45, 0.45]) cyl(bf, 0.03, 0.03, 0.5, sx, 0.25, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 8 });
    const heater = group(g, 0.6, 3.6, 0.8);
    box(heater, 0.6, 0.5, 0.4, 0, 0, 0, 0x8b949d, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(heater, 0.56, 0.02, 0.02, 0, -0.18 + i * 0.09, 0.21, 0x3a4148, { rough: 0.5 });

    // ------------------------------------------------------------ boards
    const logSheet = holoPanel(g, 0.54, 0.38, -2.2, 1.7, -1.5, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d84a3a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe6e2"; cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("NFPA 25 INSPECTION LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e8b8b2";
      ["Valves weekly · open & sealed", "Main drain: 68 psi static / 54 residual", "Gauges: replace on interval", "Open item: F3 painters' drip"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { ry: 1.0, accent: PMSR_ACCENT });
    reg(hits, logSheet, "itm-log");
    const logBoard = holoPanel(g, 0.52, 0.36, -2.3, 1.7, 1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(24,10,8,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d84a3a"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbe6e2"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("BUILDING LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e8b8b2";
      ["Valve found shut · reopened", "Drain result · flow test", "Impairment ended"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 1.2, accent: PMSR_ACCENT });
    reg(hits, logBoard, "building-log");
    const crewBoard = holoPanel(g, 0.5, 0.34, 2.2, 1.7, 1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,18,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fd1c9"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e3f7ee"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfe8d6";
      cx.fillText("Engineer · fitter · fire watch", w / 2, h * 0.56);
      cx.fillText("IUOE Local 39 · SEIU lines", w / 2, h * 0.74);
    }, { ry: -1.0, accent: 0x7fd1c9 });
    reg(hits, crewBoard, "crew-checkin-board");

    // ------------------------------------------------------------ people
    const fitter = standingFigure(g, 0.9, 0.3, { ry: -0.6, cloth: 0x3a4a5a, trousers: 0x1b2230, helmet: 0xf4f6f8, glasses: true });
    const inspector = standingFigure(g, -1.0, 1.4, { ry: 2.8, cloth: 0x1f2f4a, trousers: 0x1b2230, atStation: true });
    inspector.visible = false;

    let flowing = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.3, 1.5, -2.0),

      onStep(step) {
        if (step.id === "main-drain") wet.visible = false;
        if (step.id === "itv-flow") { flowing = true; flow.visible = true; }
      },

      onStepComplete(step) {
        if (step.id === "impairment") impFace.visible = true;
        if (step.id === "open-valve") { f3.stem.scale.set(1, 3.2, 1); f3.stem.position.z = 0.48; }
        if (step.id === "static-pressure") repaint(gaugeFace, signFace("68 psi", { bg: "#f4f6f8", accent: "#59c97b", fg: "#1d262e", scale: 0.3 }));
        if (step.id === "main-drain") repaint(gaugeFace, signFace("54 res", { bg: "#f4f6f8", accent: "#59c97b", fg: "#1d262e", scale: 0.3 }));
        if (step.id === "chain-valve") chain.position.set(0.3, 1.2, -1.9);
        if (step.id === "itv-flow") {
          flowing = false; flow.visible = false;
          flowLamp.material = mat(0xc8201a, { emissive: 0xc8201a, ei: 1.8 });
          repaint(annFace, signFace("WATERFLOW", { bg: "#2a0e0c", accent: "#e0524a", fg: "#ffd2ce", scale: 0.4 }));
        }
        if (step.id === "flow-signal") {
          flowLamp.material = mat(0x3a1a18, { rough: 0.4 });
          repaint(annFace, signFace("NORMAL", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.45 }));
        }
        if (step.id === "end-impairment") impFace.visible = false;
      },

      onInterrupt(it) {
        if (it.id === "inspector-arrives") inspector.visible = true;
        if (it.id === "tamper-trouble") {
          troubleLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.8 });
          repaint(annFace, signFace("TAMPER F3\nTROUBLE", { bg: "#2a2010", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.32 }));
        }
      },
      onInterruptEnd(it) {
        if (it.id === "inspector-arrives") {
          inspector.visible = false;
          if (it.resolved === "answered") recDrawer.position.z = 0.4;
        }
        if (it.id === "tamper-trouble" && it.resolved === "answered") {
          troubleLamp.material = mat(0x3a3018, { rough: 0.4 });
          repaint(annFace, signFace("NORMAL", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.45 }));
        }
      },

      onHazard(hitId) {
        if (hitId === "test-hose-loose") wet.visible = true;
      },

      animate(t, dt, session) {
        fitter.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        if (flowing && flow.userData.step) flow.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.02, 0.4, 0.2);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "static-pressure") {
          repaint(gaugeFace, signFace(`${Math.round(20 + gg.t * 140)} psi`, { bg: "#f4f6f8", accent: gg.t > 0.48 && gg.t < 0.62 ? "#59c97b" : "#d84a3a", fg: "#1d262e", scale: 0.3 }));
        }
      },
    };
  },
};
