import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, mat, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shore Power Hookup VR — Maritime & Ports, station eighty-nine.
//
// Cold ironing a berthed container ship: connecting it to the port's shore
// power so its auxiliary diesels shut down for the call rather than idling at
// the berth. The learner is the port electrician working the shore side of
// the connection; the ship's own electrician works the vessel side and has
// to agree at every step that matters. Nothing here is about any one
// terminal's history — every real high-voltage shore connection is built to
// IEC/ISO/IEEE 80005-1, and the reason it exists at all is California's
// At-Berth Regulation: the tonnes of diesel exhaust a fleet of idling ships
// no longer puts into a port neighbourhood's air over a year of calls.

const SPH_ACCENT = 0x2e8fd6;

export const SIM_SHORE_POWER_HOOKUP = {
  id: "shore-power-hookup",
  index: "89",
  domain: "Maritime & Ports",
  trade: "Port electrician — shore power (cold ironing)",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "IBEW port electricians; ILWU Local 10 — the longshore side of the hookup; California Air Resources Board At-Berth Regulation; IEC/ISO/IEEE 80005-1 high-voltage shore connection; NFPA 70E; OSHA 1918 marine terminals",
  name: "Shore Power Hookup",
  title: simTitle("Shore Power Hookup"),
  tagline: "Cold ironing a berthed ship: compatibility and berth rating checked against the plan, the CMS positioned, the reel paid out by crane, ground landed first, interlock and pilot circuit proven, the breaker closed on the port's order, synchronisation confirmed, and the auxiliaries shut down clean",
  accent: SPH_ACCENT,
  accentCss: "#2e8fd6",
  parSeconds: 260,
  footprint: 2.6,
  badge: { id: "cold-iron-clean", name: "Cold Iron Clean", note: "Ground proven first, the breaker closed only on the port's order, synchronisation confirmed with the ship, and both auxiliaries shut down clean — first time" },

  game: system({
    name: "Shore Power Crew",
    currency: "VOLT",
    ranks: ["Apprentice Electrician", "Journeyman", "Port Electrician", "Lead Electrician", "Shore Power Certified"],
    badges: [
      { id: "ground-first", name: "Ground First", note: "The ground connector landed and proven before either phase bank", test: AWARD.stepClean("connectors") },
      { id: "never-live", name: "Never Live Early", note: "Never touched the panel before the interlock, never closed a breaker without the order", test: AWARD.safe },
      { id: "sync-true", name: "Sync True", note: "Insulation test and synchronisation both read inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-hookup", name: "Clean Hookup", note: "No corrections anywhere in the connection", test: AWARD.clean },
      { id: "steady-payout", name: "Steady Pay-out", note: "Held the reel rate in band the whole run", test: AWARD.unbroken },
      { id: "stack-clear-fast", name: "Stack Clear", note: "Auxiliaries shut down inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "live-panel-touch": "You put a bare hand on the vessel's shore connection panel before the interlock was proven. IEC/ISO/IEEE 80005-1 treats that panel as live until the interlock and the pilot circuit both prove otherwise — not until it merely looks safe from the outside.",
    "cable-drag-deck": "You hauled the cable across the quay by hand instead of paying it out with the crane. A cable dragged over a rough quay edge abrades and kinks in ways no visual check catches, and OSHA 1918 exists precisely because a quay does that to any load nobody is supposed to be carrying by hand.",
    "breaker-no-order": "You reached for the shore breaker before the port gave the order to close it. The breaker belongs to the port's own switching discipline — closing it on your own judgment is the one thing that discipline exists to prevent, whoever is standing at the handle.",
    "sync-skip": "You called for the vessel breaker to close without the ship's electrician confirming synchronisation. Closing two breakers onto systems that are not in step is exactly the fault a cold-ironing synchronisation check exists to catch before it happens, not after.",
  },

  lateNotes: {
    "shore-breaker": "The shore breaker closes only after the port gives the order — nothing to close until then.",
    "sync-panel": "There is nothing to synchronise until the shore breaker is actually closed and feeding the connection.",
    "vessel-breaker": "The vessel breaker closes after synchronisation is confirmed with the ship's electrician, not before.",
    "insulation-tester": "Nothing to test until the connectors are actually landed on the shore connection box.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "berth-plan",
      title: "Check compatibility and the berth rating against the plan",
      cue: "Confirm the vessel's shore-power system and the berth's rated capacity match the connection plan.",
      why: "California's At-Berth Regulation is the reason this hookup happens at all — the vessel's own receptacle, voltage and frequency have to match what this berth actually delivers, and IEC/ISO/IEEE 80005-1 sets the compatibility both sides are built to. A mismatch found here is a mismatch found on paper, not with a live cable in someone's hands.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-gloves", "stage-arc", "stage-mat"],
      itemNames: { "stage-gloves": "rated dielectric gloves", "stage-arc": "arc-rated coveralls", "stage-mat": "insulating mat" },
      title: "Stage PPE for the connection",
      cue: "Rated gloves, arc-rated coveralls and the insulating mat down before a connector is touched.",
      why: "IEC/ISO/IEEE 80005-1 puts real voltage on this connector once it is live — high enough that NFPA 70E treats the shore connection box as its own arc-flash boundary — and the gloves, the coveralls and the mat underfoot are what stand between a fault and the electrician making the connection up.",
    },
    {
      id: "cms-position", kind: "drag", target: "cms-unit",
      title: "Position the cable management system at the vessel's connection point",
      cue: "Wheel the CMS into place under the ship's shore-power receptacle and drop it on the mark.",
      why: "The cable management system supports the run from the reel to the ship's receptacle so the cable lands on the connector straight, not at an angle that strains the pins the moment it takes a load. Positioned here first, the pay-out, the landing and the strain relief that follow all take the line the CMS sets.",
      drag: { to: "connection-point", radius: 0.5, missNote: "Not on the mark — the CMS has to sit square under the receptacle or the cable comes in at an angle." },
    },
    {
      id: "reel-payout", kind: "track", target: "cable-reel", seconds: 6,
      title: "Pay out the cable reel with the crane",
      cue: "Signal the crane to lower the reel's load steadily — never let the cable go slack on the quay or snatch tight.",
      why: "OSHA 1918's marine terminal rules and the cable's own bend-radius limit both assume this run is carried, not dragged: a shore-power cable pulled by hand across a quay picks up abrasion and kinks a megger will not catch until the cable is already energised. The crane carries the weight; the deck never does.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "REEL RATE", readout: (v) => (v < 0.4 ? "too slow — cable sagging" : v > 0.6 ? "too fast — snatch load" : "steady pay-out") },
      holdBreakNote: "The rate broke rhythm and the cable dropped slack onto the quay — exactly the abrasion the crane exists to prevent. Bring it back to a steady pay-out.",
    },
    {
      id: "connectors", kind: "sequence",
      targets: ["ground-connector", "phase-connector-1", "phase-connector-2"],
      itemNames: { "ground-connector": "ground connector", "phase-connector-1": "phase connector — bank 1", "phase-connector-2": "phase connector — bank 2" },
      title: "Land the connectors, ground first",
      cue: "Land the ground connector into the shore connection box, then the two phase connector banks.",
      why: "IEC/ISO/IEEE 80005-1 requires the ground path made and proven before either phase bank is landed, because a fault on an ungrounded connection has nowhere safe to go — the ground connector is what gives it somewhere before there is anything else to fault to.",
      outOfOrderNote: "Ground first, then the phase banks — the ground path has to exist before there is anything else to land.",
    },
    {
      id: "interlock", kind: "sequence", anyOrder: true,
      targets: ["interlock-engaged", "pilot-circuit-check"],
      itemNames: { "interlock-engaged": "mechanical interlock", "pilot-circuit-check": "pilot circuit continuity" },
      title: "Prove the interlock and the pilot circuit",
      cue: "Engage the mechanical interlock and prove continuity on the pilot circuit before anything is energised.",
      why: "The interlock makes it physically impossible to close the shore breaker onto an unmated connector, and the pilot circuit is the low-voltage line that interlock depends on — both are proven now, dead, because proving them after the breaker closes is proving them on a connector that is already live.",
    },
    {
      id: "insulation-test", kind: "gauge", target: "insulation-tester",
      title: "Test insulation resistance before energising",
      cue: "Run the megger on the made-up cable and commit the reading against the minimum.",
      why: "A cable that has been coiled, paid out and landed picks up nicks and damp ingress a visual check misses; the insulation resistance reading is the number that says the cable can actually carry the load IEC/ISO/IEEE 80005-1 is about to put on it, not just that it looks fine.",
      gauge: { label: "MΩ", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 200)} MΩ`, missNote: "Below the minimum insulation resistance — do not energise. Find the fault before the next reading." },
    },
    {
      id: "breaker-permission", kind: "select", target: "port-radio",
      title: "Call the port for the order to close the shore breaker",
      cue: "Radio the port's control room: connection made, interlock proven, ready to energise.",
      why: "The shore breaker only closes on an order from the port that owns the feeder behind it — IBEW port electricians work this side of the connection under a switching discipline that never lets the person standing at the breaker decide alone that the moment has come.",
    },
    {
      id: "breaker-close", kind: "turn", target: "shore-breaker",
      title: "Close the shore-side breaker",
      cue: "Turn the shore breaker's handle through to closed, on the port's order.",
      why: "Closing this breaker puts real voltage onto a cable an ILWU Local 10 gang may still be working around on the same quay, and it is the one control that turns the whole run from dead cable to live feeder.",
      turn: { turns: 0.85, axis: "y", label: "SHORE BREAKER" },
    },
    {
      id: "sync-check", kind: "hold", target: "sync-panel", seconds: 5,
      title: "Confirm synchronisation with the ship's electrician",
      cue: "Hold the sync check while the ship's electrician confirms voltage, frequency and phase rotation match.",
      why: "Cold ironing does not simply plug a ship into shore power — the vessel's own system has to be brought into synchronism with the shore feeder before load transfers, or the mismatch shows up as a fault the moment the vessel breaker closes. This is confirmed with the ship's own electrician, never assumed from the shore side alone.",
      holdBreakNote: "Released before the ship's electrician confirmed the match — hold until the sync reading is called good from both sides.",
    },
    {
      id: "vessel-breaker", kind: "select", target: "vessel-breaker",
      title: "Have the vessel breaker closed",
      cue: "Confirm with the ship's electrician that the vessel's shore breaker is closed and load is transferring.",
      why: "The vessel breaker is the ship's own control, closed by the ship's electrician once synchronism is confirmed — the load only actually moves from the auxiliary generators to the shore feeder once both breakers are closed in the right order.",
    },
    {
      id: "shutdown-observe", kind: "sequence", anyOrder: true,
      targets: ["engine-port-off", "engine-stbd-off"],
      itemNames: { "engine-port-off": "port auxiliary engine", "engine-stbd-off": "starboard auxiliary engine" },
      title: "Watch the auxiliary engines shut down",
      cue: "Confirm both auxiliary engines have shut down now that shore power is carrying the ship's load.",
      why: "This is the whole point of the hookup: California's At-Berth Regulation exists because a ship idling its diesel auxiliaries at berth puts exhaust into a port neighbourhood for the whole time it is alongside, and the stack only goes clear once both auxiliaries are actually off, not merely once the breaker reads closed.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["loose-clamp"],
      itemNames: { "loose-clamp": "strain-relief clamp" },
      itemNotes: { "loose-clamp": "The strain-relief clamp on the phase connector bank nearest the CMS was never fully tightened — the cable's own weight has started to pull on the landed connector." },
      title: "Walk the connection before signing off",
      cue: "Check every connector, the interlock and the strain relief before logging the hookup complete.",
      why: "A connector that is landed but not fully secured does not fail today — it fails on the next tide movement or the next gust, hours into the call, well after anyone is still watching this closely.",
    },
  ],

  interrupts: [
    {
      id: "tide-tension-check",
      kind: "Cable tension alarm as the ship moves on the tide",
      after: "reel-payout", delay: 3, seconds: 12,
      alert: "The tide has lifted the ship against its lines and the cable has come up hard against the CMS — the tension alarm on the reel is sounding.",
      cue: "Recheck the cable management system before the pay-out goes any further.",
      target: "cms-unit",
      why: "A shore-power run carries some slack for exactly this — the berth's own tidal range — but once the cable comes up hard against the CMS, that slack is gone and the next few centimetres of tide movement load the connector itself rather than the cable. Checking the CMS the moment the alarm sounds keeps that load off pins that were never rated to carry it.",
      missNote: "The pay-out kept going while the cable stayed hard up against the CMS, and the strain that should have stopped at the cable management system carried straight through to the connector landed at the other end.",
      wrongNote: "It's the cable management system. A tension alarm from the reel means the CMS is the point actually taking the load right now — check it before anything else moves.",
    },
    {
      id: "pilot-circuit-dropout",
      kind: "Pilot circuit dropping out mid-transfer",
      after: "sync-check", delay: 2, seconds: 12,
      alert: "The pilot circuit's continuity light has dropped out while the ship's electrician is still confirming synchronisation.",
      cue: "A dropped pilot circuit means the interlock's own proof is gone — recheck it now.",
      target: "pilot-circuit-check",
      why: "The pilot circuit is the low-voltage line the interlock's own proof depends on, and IEC/ISO/IEEE 80005-1 trips the whole connection if it opens — a dropout mid-transfer means the interlock can no longer prove what it proved at the start, and the connection is only as safe as the last continuity check that is still actually true.",
      missNote: "The synchronisation call went ahead with the pilot circuit already open, on the strength of a continuity check that had been true several minutes earlier and was no longer true now.",
      wrongNote: "It's the pilot circuit test point. A dropout there means the interlock's own proof has to be re-established before anything else moves forward.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SPH_ACCENT);

    // ------------------------------------------------------------- the quay
    const quay = box(g, 6.2, 0.1, 5.4, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    quay.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#212a32", base2: "#1a222a", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xb9c2ca },
    );
    const lane = box(g, 1.0, 0.02, 4.6, 1.3, 0.111, -0.3, 0xffffff, { rough: 0.55, metal: 0.35, cast: false });
    lane.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 8, px: 256 }),
      { rough: 0.5, metal: 0.4, color: 0xc7ccd1 },
    );
    for (const bx of [-2.6, -1.0, 0.8, 2.4]) {
      cyl(g, 0.14, 0.16, 0.3, bx, 0.15, 2.1, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 14 });
      cyl(g, 0.1, 0.1, 0.08, bx, 0.31, 2.1, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 12 });
    }

    // ------------------------------------------------------------- ship hull
    const hull = group(g, 0, 0.1, -2.5);
    box(hull, 6.4, 2.2, 0.5, 0, 1.1, 0, 0x1b3548, { rough: 0.7, metal: 0.35, cast: false });
    box(hull, 6.4, 0.08, 0.55, 0, 2.24, 0, 0xdfe6ec, { rough: 0.5, metal: 0.3, cast: false });
    for (let i = -5; i <= 5; i++) box(hull, 0.05, 1.9, 0.02, i * 0.55, 1.1, 0.26, 0x14232f, { rough: 0.7, cast: false });
    // Deckhouse where the receptacle panel, the vessel breaker and the sync panel sit.
    const house = group(hull, -1.4, 2.28, 0.1);
    box(house, 1.8, 1.2, 0.7, 0, 0.6, 0, 0xd7dde2, { rough: 0.55, metal: 0.2 });
    for (let i = 0; i < 3; i++) box(house, 0.28, 0.24, 0.02, -0.6 + i * 0.5, 0.7, 0.36, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    // Funnel with idling exhaust, cleared once the auxiliaries shut down.
    const funnel = group(hull, 2.4, 2.28, -0.1);
    cyl(funnel, 0.28, 0.32, 1.1, 0, 0.55, 0, 0xb8402f, { rough: 0.7, metal: 0.2, seg: 16 });
    box(funnel, 0.66, 0.1, 0.66, 0, 1.12, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const stackSmoke = particles(funnel, 26, 0x8a9099, { size: 0.05, life: 1.4, additive: false, opacity: 0.4 });

    // Receptacle panel: interlock, pilot circuit, ground + two phase banks.
    const panel = group(house, 0, 0.62, 0.36);
    box(panel, 0.62, 0.5, 0.05, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const livePanelHit = box(panel, 0.56, 0.44, 0.02, 0, 0, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "bare hand on the panel?", 0, 0.32, 0.03, { css: "#d2312b", w: 0.5 });
    reg(hits, livePanelHit, "live-panel-touch");
    const groundPin = cyl(panel, 0.03, 0.03, 0.06, -0.2, -0.12, 0.05, 0x59c97b, { rough: 0.4, metal: 0.7, seg: 10 });
    groundPin.rotation.x = Math.PI / 2; groundPin.visible = false;
    const groundHit = box(panel, 0.1, 0.1, 0.08, -0.2, -0.12, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "ground", -0.2, -0.28, 0.03, { css: "#2e8fd6", w: 0.18 });
    reg(hits, groundHit, "ground-connector");
    const phase1 = cyl(panel, 0.03, 0.03, 0.06, 0.0, -0.12, 0.05, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 10 });
    phase1.rotation.x = Math.PI / 2; phase1.visible = false;
    const phase1Hit = box(panel, 0.1, 0.1, 0.08, 0.0, -0.12, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "phase — bank 1", 0.0, -0.28, 0.03, { css: "#2e8fd6", w: 0.28 });
    reg(hits, phase1Hit, "phase-connector-1");
    const phase2 = cyl(panel, 0.03, 0.03, 0.06, 0.2, -0.12, 0.05, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 10 });
    phase2.rotation.x = Math.PI / 2; phase2.visible = false;
    const phase2Hit = box(panel, 0.1, 0.1, 0.08, 0.2, -0.12, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "phase — bank 2", 0.2, -0.28, 0.03, { css: "#2e8fd6", w: 0.28 });
    reg(hits, phase2Hit, "phase-connector-2");
    const clampHit = box(panel, 0.08, 0.06, 0.08, 0.2, -0.22, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clampHit, "loose-clamp");
    const interlockLamp = ball(panel, 0.03, -0.15, 0.16, 0.04, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 12 });
    const interlockHit = box(panel, 0.1, 0.1, 0.06, -0.15, 0.16, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "interlock", -0.15, 0.28, 0.03, { css: "#2e8fd6", w: 0.24 });
    reg(hits, interlockHit, "interlock-engaged");
    const pilotLamp = ball(panel, 0.03, 0.05, 0.16, 0.04, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 12 });
    const pilotHit = box(panel, 0.1, 0.1, 0.06, 0.05, 0.16, 0.03, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(panel, "pilot circuit", 0.05, 0.28, 0.03, { css: "#2e8fd6", w: 0.32 });
    reg(hits, pilotHit, "pilot-circuit-check");

    // Vessel breaker and the sync panel, on the house wall beside the receptacle.
    const vBreaker = group(house, -0.75, 0.55, 0.36);
    box(vBreaker, 0.16, 0.22, 0.08, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    const vLever = box(vBreaker, 0.05, 0.14, 0.03, 0, -0.02, 0.05, 0xe8eef2, { rough: 0.4 });
    holoTag(vBreaker, "vessel breaker", 0, 0.2, 0.05, { css: "#2e8fd6", w: 0.32 });
    reg(hits, vBreaker, "vessel-breaker");
    const syncPanel = group(house, 0.75, 0.55, 0.36);
    box(syncPanel, 0.28, 0.24, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const syncLamps = [-0.08, 0, 0.08].map((dx) => ball(syncPanel, 0.022, dx, 0.06, 0.03, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10 }));
    const syncScreen = instrument(syncPanel, 0, -0.16, 0.06, { idle: "--V --Hz", color: 0x2e8fd6, w: 0.14, d: 0.06 });
    holoTag(syncPanel, "synchronise — hold", 0, 0.22, 0.05, { css: "#2e8fd6", w: 0.4 });
    reg(hits, syncPanel, "sync-panel");
    const syncSkipHit = box(house, 0.2, 0.2, 0.1, 0.75, 0.85, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(house, "close it now?", 0.75, 1.05, 0.36, { css: "#d2312b", w: 0.3 });
    reg(hits, syncSkipHit, "sync-skip");

    // Engine room telltales — two auxiliary engines, watched from the deck.
    const eng1 = instrument(hull, -2.6, 0.6, 0.3, { idle: "AUX 1 — RUN", color: 0x2e8fd6, w: 0.13, d: 0.19 });
    holoTag(hull, "port auxiliary", -2.6, 0.85, 0.3, { css: "#2e8fd6", w: 0.32 });
    reg(hits, eng1, "engine-port-off");
    const eng2 = instrument(hull, -2.2, 0.6, 0.3, { idle: "AUX 2 — RUN", color: 0x2e8fd6, w: 0.13, d: 0.19 });
    holoTag(hull, "starboard auxiliary", -2.2, 0.85, 0.3, { css: "#2e8fd6", w: 0.38 });
    reg(hits, eng2, "engine-stbd-off");

    // ---------------------------------------------------- cable management system
    const cmsHome = new THREE.Vector3(1.6, 0.11, 0.6);
    const cmsTarget = new THREE.Vector3(-0.7, 0.11, -1.3);
    const cms = group(g, cmsHome.x, cmsHome.y, cmsHome.z);
    box(cms, 0.5, 0.06, 0.34, 0, 0.03, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const wx of [-0.18, 0.18]) for (const wz of [-0.13, 0.13]) cyl(cms, 0.05, 0.05, 0.04, wx, 0.0, wz, 0x14171a, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    const cmsArm = group(cms, 0, 0.06, 0);
    box(cmsArm, 0.06, 0.5, 0.06, 0, 0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    torus(cmsArm, 0.09, 0.014, 0, 0.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(cms, "cable management system", 0, 0.68, 0, { css: "#2e8fd6", w: 0.5 });
    reg(hits, cms, "cms-unit");
    const connectionMark = torus(g, 0.16, 0.008, cmsTarget.x, 0.111, cmsTarget.z, 0x2e8fd6, { emissive: 0x2e8fd6, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    connectionMark.rotation.x = -Math.PI / 2;
    reg(hits, connectionMark, "connection-point");

    // --------------------------------------------------------------- cable reel
    const reelPost = group(g, 1.7, 0.11, 1.7);
    box(reelPost, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    cyl(reelPost, 0.04, 0.04, 1.2, 0, 0.65, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 12 });
    const jib = group(reelPost, 0, 1.25, 0);
    box(jib, 1.1, 0.06, 0.06, 0.5, 0, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    const reelDrum = cyl(reelPost, 0.22, 0.22, 0.18, 0, 0.9, 0, 0xb8402f, { rough: 0.55, metal: 0.4, seg: 18 });
    reelDrum.rotation.z = Math.PI / 2;
    holoTag(reelPost, "cable reel", 0, 1.5, 0, { css: "#2e8fd6", w: 0.3 });
    reg(hits, reelDrum, "cable-reel");
    const reelReadout = instrument(reelPost, 0.3, 0.9, 0, { idle: "----", color: 0x2e8fd6, w: 0.12, d: 0.18 });

    // Cable itself: reel → CMS home → CMS target → receptacle, revealed a stage
    // at a time so the run always looks like what has actually been done.
    const cableToCms = hose(g, [[1.7, 0.55, 1.6], [1.6, 0.4, 1.1], [cmsHome.x, cmsHome.y, cmsHome.z]], 0.025, 0x1b1e23, { steps: 16, rough: 0.75 });
    cableToCms.visible = false;
    const cableCoil = torus(g, 0.22, 0.045, 1.55, 0.13, 1.75, 0x1b1e23, { rough: 0.8, seg: 8, seg2: 20 });
    cableCoil.rotation.x = Math.PI / 2;
    holoTag(g, "drag it across the quay?", 1.55, 0.42, 1.75, { css: "#d2312b", w: 0.5 });
    reg(hits, cableCoil, "cable-drag-deck");
    const cableToPanel = hose(g, [[cmsTarget.x, cmsTarget.y, cmsTarget.z], [cmsTarget.x, 0.5, cmsTarget.z - 0.4], [-1.4, 0.62, -2.0]], 0.025, 0x1b1e23, { steps: 16, rough: 0.75 });
    cableToPanel.visible = false;

    // ------------------------------------------------------------- shore breaker
    const breakerCab = group(g, -1.9, 0.11, 1.4);
    box(breakerCab, 0.6, 1.1, 0.4, 0, 0.55, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    box(breakerCab, 0.5, 0.06, 0.32, 0, 1.15, 0, 0xb8402f, { rough: 0.5 });
    const shoreBreaker = valveWheel(breakerCab, 0, 0.75, 0.22, { r: 0.1, color: 0xd2312b, body: 0x2b2f34 });
    holoTag(breakerCab, "shore breaker", 0, 1.02, 0.22, { css: "#2e8fd6", w: 0.32 });
    reg(hits, shoreBreaker.userData.wheel, "shore-breaker");
    const breakerNoOrderHit = box(breakerCab, 0.3, 0.2, 0.15, 0, 0.4, 0.22, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(breakerCab, "close it without the order?", 0, 0.2, 0.22, { css: "#d2312b", w: 0.55 });
    reg(hits, breakerNoOrderHit, "breaker-no-order");

    // ------------------------------------------------------------- console + gear
    const chest = toolChest(g, -1.4, 0.5, { ry: 0.5, color: 0x2f4f6f });
    const radio = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "CH 6 · CALL", color: 0x2e8fd6, w: 0.1, d: 0.16 });
    holoTag(radio, "port radio", 0, 0.15, 0, { css: "#2e8fd6", w: 0.26 });
    reg(hits, radio, "port-radio");
    const tester = instrument(chest, 0.14, 0.79, 0.08, { ry: 0.1, idle: "-- MΩ", color: 0x2e8fd6, w: 0.1, d: 0.16 });
    holoTag(tester, "insulation tester", 0, 0.15, 0, { css: "#2e8fd6", w: 0.4 });
    reg(hits, tester, "insulation-tester");
    const gloves = group(chest, -0.05, 0.92, -0.16);
    box(gloves, 0.16, 0.05, 0.1, 0, 0, 0, 0xf2c14b, { rough: 0.8 });
    holoTag(gloves, "gloves", 0, 0.1, 0, { css: "#2e8fd6", w: 0.16 });
    reg(hits, gloves, "stage-gloves");
    const arc = group(chest, 0.13, 0.92, -0.16);
    box(arc, 0.16, 0.05, 0.1, 0, 0, 0, 0x2f3a44, { rough: 0.8 });
    holoTag(arc, "arc coveralls", 0, 0.1, 0, { css: "#2e8fd6", w: 0.22 });
    reg(hits, arc, "stage-arc");
    const mat_ = group(g, -1.1, 0.11, 0.4);
    box(mat_, 0.5, 0.02, 0.36, 0, 0.01, 0, 0x2f3a44, { rough: 0.9 });
    holoTag(mat_, "insulating mat", 0, 0.14, 0, { css: "#2e8fd6", w: 0.32 });
    reg(hits, mat_, "stage-mat");

    // -------------------------------------------------------------- plan board
    const board = holoPanel(g, 0.95, 0.62, 2.2, 1.1, 1.0, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#2e8fd6"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d6eefb"; cx.fillText("SHORE CONNECTION PLAN — IEEE 80005-1", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Vessel receptacle: HV, 3-phase, matches berth", "Berth rating: within vessel's plan figure", "Ground landed first, then phase banks",
       "Interlock + pilot circuit proven before energising", "Breaker closes only on the port's order", "Synchronise with ship's electrician before transfer"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: -0.5, accent: SPH_ACCENT });
    reg(hits, board, "berth-plan");

    const portElectrician = standingFigure(g, -0.4, 1.85, { ry: 2.6, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e });
    holoTag(portElectrician, "port electrician", 0, 1.9, 0, { css: "#2e8fd6", w: 0.32 });
    standingFigure(house, -0.1, 0.9, { ry: 3.0, cloth: 0x2f3a44, atStation: true });
    holoTag(house, "ship's electrician", -0.1, 1.7, 0.9, { css: "#2e8fd6", w: 0.32 });
    cone(g, 2.5, -1.6); cone(g, -2.5, -1.7);
    barrierPanel(g, 0.6, 2.3, { color: 0xf2c14b, ry: 0.1 });

    let auxOff = 0;
    const cmsHomePos = cms.position.clone();
    const cmsAlertMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.3, rough: 0.4, metal: 0.5 });
    const cmsHomeMat = cmsArm.material;
    const pilotOkMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
    const pilotBadMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "cms-position") { cms.position.copy(cmsTarget); cableToCms.visible = true; }
        if (step.id === "reel-payout") repaint(reelReadout.userData.screen, signFace("PAID OUT", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "connectors") { groundPin.visible = true; phase1.visible = true; phase2.visible = true; cableToPanel.visible = true; }
        if (step.id === "interlock") { interlockLamp.material = pilotOkMat; pilotLamp.material = pilotOkMat; }
        if (step.id === "breaker-permission") repaint(radio.userData.screen, signFace("ORDER GIVEN", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.5 }));
        if (step.id === "vessel-breaker") vLever.rotation.z = -Math.PI / 3;
        if (step.id === "shutdown-observe") { auxOff = 2; }
        if (step.id === "walk") clampHit.visible = false;
      },
      onHazard() {},
      // Both interruptions visibly change the scene the instant they fire —
      // the CMS really shows the load, the pilot lamp really drops — not
      // only once animate() next ticks.
      onInterrupt(it) {
        if (it.id === "tide-tension-check") {
          cms.position.x = cmsTarget.x + 0.06;
          cmsArm.material = cmsAlertMat;
        }
        if (it.id === "pilot-circuit-dropout") {
          pilotLamp.material = pilotBadMat;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tide-tension-check") {
          cms.position.copy(cmsTarget);
          cmsArm.material = cmsHomeMat;
        }
        if (it.id === "pilot-circuit-dropout") {
          pilotLamp.material = pilotOkMat;
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        stackSmoke.visible = auxOff < 2;
        if (auxOff < 2) stackSmoke.userData.step(dt, new THREE.Vector3(0, 1.25, 0), 0.12, 0.3, 0.35);
        if (step?.id === "shutdown-observe") {
          if (session.sequence.includes("engine-port-off")) repaint(eng1.userData.screen, signFace("AUX 1 — OFF", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
          if (session.sequence.includes("engine-stbd-off")) repaint(eng2.userData.screen, signFace("AUX 2 — OFF", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "insulation-test") repaint(tester.userData.screen, signFace(`${Math.round(gg.t * 200)} MΩ`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "reel-payout" && session.holding) repaint(reelReadout.userData.screen, signFace(`${Math.round(session.track.v * 100)}%`, { bg: "#0d1c24", accent: session.track.v >= 0.4 && session.track.v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
        if (session?.turn && step?.id === "breaker-close") shoreBreaker.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "sync-check") {
          const frac = session.holdFor / (step.seconds ?? 5);
          for (let i = 0; i < syncLamps.length; i++) syncLamps[i].material = frac > (i + 1) / 3 ? pilotOkMat : mat(0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6 });
          repaint(syncScreen.userData.screen, signFace(frac >= 1 ? "IN SYNC" : "MATCHING…", { bg: "#0d1c24", accent: frac >= 1 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        void cmsHomePos;
      },
    };
  },
};
