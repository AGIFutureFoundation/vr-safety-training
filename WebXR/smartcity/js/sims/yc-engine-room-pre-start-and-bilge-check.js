import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, mat, repaint, signFace } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Engine Room Pre-Start & Bilge Check VR — Maritime & Ports, the
// yacht and charter crew pack.
//
// The engine room of a mid-size motor yacht before the first start of the
// day: twin diesels either side of the centreline walkway, the sea strainers
// on the raw-water lines, the bilge below the plates with its float switch and
// pump, the blower switch and timer by the ladder, the fuel and raw-water
// valves, the generator with its panel, the hearing protection on its hook.
// The learner is the deckhand-engineer; the MEBA engineer is on the intercom.
// No pressure, temperature or level figure is stated — each is "per the
// engine's plate" or "per the engineer's checklist".

const YC4_ACCENT = 0x2b6f9e;
const YC4_CSS = "#2b6f9e";

export const SIM_YC_ENGINE_ROOM_PRE_START_AND_BILGE_CHECK = {
  id: "yc-engine-room-pre-start-and-bilge-check",
  index: "yc-4",
  domain: "Maritime & Ports",
  trade: "Charter yacht deckhand-engineer at the pre-start, under the MEBA licensed engineer's checklist, with the IBU and SIU deck crew above",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "MEBA engineering watch practice from the Calhoon MEBA Engineering School as a training body; IBU and SIU deck training; NFPA 306 control of gas hazards on vessels for the bilge vapour check and the blower run; OSHA 29 CFR 1910.95 occupational noise exposure and 29 CFR 1910.147 the control of hazardous energy for the open generator panel; 46 CFR 25 equipment for uninspected vessels; IMO STCW engineering watch basics",
  name: "Engine Room Pre-Start & Bilge Check",
  title: simTitle("Engine Room Pre-Start & Bilge Check"),
  tagline: "The first start of the day: the checklist read, muffs and gloves on, the belts and hoses walked for the cracked belt and the loose clamp, the bilge sniffed for vapour through a detector alarm, the blower run for the plan's time, the float switch lifted to prove the pump, the strainer cleared, the oil read on the stick, the valves opened in order, the raw water watched after the start as the filter drips, the generator's open panel tagged out, the engine log written and the engineer checked in",
  accent: YC4_ACCENT,
  accentCss: YC4_CSS,
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "blower-before-key", name: "Blower Before Key", note: "Vapour sniffed and the blower run before anything sparked, no hand near a belt, no rag on the manifold, and both the detector and the drip answered" },

  supportLine: "your union hall's member assistance programme — MEBA, the IBU or SIU — with the operator's employee assistance line behind it",

  game: system({
    name: "Below Decks",
    currency: "HOUR",
    ranks: ["Wiper", "Oiler", "Deckhand-Engineer", "Watch Engineer", "Below Decks Certified"],
    badges: [
      { id: "list-first", name: "List First", note: "The checklist read before a valve moved", test: AWARD.stepClean("pre-start-checklist") },
      { id: "on-the-stick", name: "On The Stick", note: "Oil level committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "clear-of-the-belt", name: "Clear Of The Belt", note: "No hand near a belt, no rag on the manifold, no early start, no live panel touched", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-start", name: "Clean Start", note: "No corrections from the checklist to the log", test: AWARD.clean },
      { id: "flow-watched", name: "Flow Watched", note: "Raw-water flow watched in band the whole way", test: AWARD.unbroken },
      { id: "first-light", name: "First Light", note: "Engine log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "belt-reach": "You reached across the front of the engine to check the belt with the start already armed. A belt drive takes a glove, the fingers in it and the hand behind them the instant the engine turns, and an armed start is an engine that can turn on a signal from the flybridge the deckhand never hears. Belts are checked with the start disarmed and the key in the deckhand's pocket, never leaning over a drive that could move.",
    "rag-on-manifold": "You left the wipe rag on the exhaust manifold after cleaning the dipstick. A rag on a manifold is a fire waiting for the engine to warm up: it smoulders, it drops into the bilge where the oil film is, and the engine room is closed and full of air being drawn through by the blower. Rags go in the covered bin the moment the hand is done with them — nothing burnable sits on anything that gets hot.",
    "start-before-blower": "You reached for the start before the bilge had been sniffed and the blower run. The engine room's bilge is where fuel vapour collects overnight, heavier than air and invisible, and the starter motor is a spark inside a closed box; the blower exists to change that air before the spark, and the sniff is how the deckhand knows whether the blower has more work to do. Sniff, blow, then start — never the key first.",
    "live-panel": "You reached into the generator's open panel to check the connection with the generator still live. The panel is open because it is being worked on, and the rules for the control of hazardous energy exist because a panel that is not locked out and tagged is a panel somebody else can energise while a hand is inside it. It is isolated, locked, tagged and proven dead — or the cover goes back on and nobody reaches in.",
  },

  lateNotes: {
    "engine-log": "The log is written once the engines are running clean and the generator panel is tagged — last, not first.",
    "blower-timer": "The blower runs after the bilge has been sniffed — the sniff tells the deckhand what the blower has to clear.",
  },

  steps: [
    {
      id: "pre-start-checklist", kind: "select", target: "checklist-board",
      title: "Read the engineer's pre-start checklist",
      cue: "Read the checklist on the engine room board: the order of the checks, the levels per the engines' plates, the blower time per the plan, the valve order, and the engineer's word before the first start.",
      why: "A pre-start is a sequence that only works in order — vapour before spark, water before heat, oil before load — and the checklist is where the engineer has written that order so the deckhand does not reinvent it at six in the morning with the captain asking for engines. Every level, time and pressure on it is the engine's own figure from its plate or the engineer's plan, which is why the deckhand reads the board rather than remembering yesterday's numbers.",
    },
    {
      id: "muffs-and-gloves", kind: "sequence", anyOrder: true,
      targets: ["ear-muffs", "engine-gloves"],
      itemNames: { "ear-muffs": "hearing protection", "engine-gloves": "engine-room gloves" },
      title: "Put on the hearing protection and the gloves",
      cue: "Hearing protection on before the blower or an engine runs, and the engine-room gloves on for the hot, sharp and oily things every check touches.",
      why: "An engine room under way is louder than the noise exposure rules allow for an unprotected ear for more than moments, and hearing lost to a season of pre-starts never comes back; the muffs go on before the first fan runs, not when the engines are already loud. The gloves are for the belts, the strainer lid, the dipstick and the manifold — an engine room is every kind of edge, heat and oil within arm's reach in a space too small to step back.",
    },
    {
      id: "belts-and-hoses", kind: "find", noHint: true,
      targets: ["belt-cracked", "hose-clamp-loose"],
      itemNames: { "belt-cracked": "cracked and glazed alternator belt", "hose-clamp-loose": "loose clamp on the raw-water hose" },
      itemNotes: {
        "belt-cracked": "The port engine's alternator belt is cracked across its ribs and glazed on the face — a belt that parts under way takes the raw-water pump with it and the engine overheats within minutes.",
        "hose-clamp-loose": "The raw-water hose clamp at the strainer is loose enough to turn by hand — a hose that lets go below the waterline is the sea coming into the engine room faster than the bilge pump can move it.",
      },
      title: "Walk the belts, hoses and clamps with the start disarmed",
      cue: "With the start disarmed, walk both engines: belts for cracks and glaze, hoses for softness and chafe, every clamp tight by hand, the raw-water hoses especially.",
      why: "The things that stop a yacht at sea are small — a belt, a hose, a clamp — and every one of them shows its failure the day before it fails, to a hand that touches it. The walk is done with the start disarmed because the deckhand's hands are on drives that would take them, and it is done every day because a clamp that was tight yesterday has had a day of vibration since; the raw-water hoses get the most attention because a hose below the waterline is the sea, and the sea does not wait for the bilge pump.",
    },
    {
      id: "bilge-sniff", kind: "hold", target: "bilge-sniff-point", seconds: 5,
      title: "Sniff the bilge for fuel vapour before anything runs",
      cue: "Lift the bilge plate by the fuel filters, put your face at the opening — not your lamp, not a match — and take the time to smell for fuel; hold there until you are sure.",
      why: "Fuel vapour is heavier than air and collects in the bilge overnight where nothing moves it, and the nose is the first detector every engine room has: a bilge that smells of fuel is a bilge with a leak somewhere above it and a starter motor that must not turn until the blower has changed the air and the leak is found. The rules on gas hazards in vessel spaces begin with exactly this — find out what is in the air before anything that sparks or heats runs in it.",
      holdBreakNote: "The sniff was cut short — a moment at the plate is not a check. Face back at the opening, and take the time.",
    },
    {
      id: "blower-run", kind: "turn", target: "blower-timer",
      title: "Run the engine-room blower for the plan's time",
      cue: "Turn the blower timer to the run time the plan gives for this space and let the blower change the air before any engine or the generator starts.",
      why: "The blower is what changes the air in a closed engine room, drawing from the bilge where the vapour sits and putting it over the side, and the plan's run time is the time that takes for this space — long enough to matter, which is longer than a deckhand in a hurry would guess. The timer is turned rather than the blower switched on so that the run is a known time and not a moment; the engine is started when the timer has run down, not when the blower has been heard.",
      turn: { turns: 1.5, label: "BLOWER TIMER", readout: (t) => (t < 0.3 ? "blower off" : t < 0.85 ? "timer winding" : "set · blower running") },
    },
    {
      id: "float-switch", kind: "drag", target: "float-switch",
      title: "Lift the float switch to prove the bilge pump",
      cue: "Reach down to the bilge well and lift the float switch until the pump runs, then let it drop and hear the pump stop — the pump proven, the switch proven, the discharge heard over the side.",
      why: "The bilge pump is the thing that buys time when a hose lets go, and a pump that has not been made to run today is a pump nobody knows works; the float switch is what starts it when nobody is below, and a switch stuck in oil or wedged under a hose starts nothing. Lifting the float proves both in one movement — the pump runs, the discharge is heard — and it is done every pre-start because it costs a minute and its failure costs the vessel.",
      drag: { to: "pump-test-socket", radius: 0.5, missNote: "Not to the test point — the float is lifted until the pump runs and the discharge is heard, then dropped and heard to stop." },
    },
    {
      id: "sea-strainer", kind: "select", target: "strainer-lid",
      title: "Open, clear and close the raw-water sea strainer",
      cue: "Close the seacock, open the strainer lid, lift the basket and clear the weed and grit, seat the basket and the lid with its gasket, and open the seacock — and see the strainer fill.",
      why: "The sea strainer is where the engine's cooling water comes in through whatever the marina is growing this month, and a basket half full of weed is an engine that runs hot the moment the vessel comes onto the plane. It is cleared with the seacock shut, because an open strainer with the seacock open is a hole in the hull below the waterline, and the seacock is opened again before the start and watched to fill — a strainer left shut is a raw-water pump destroyed in seconds.",
    },
    {
      id: "oil-level", kind: "gauge", target: "dipstick",
      title: "Read the oil level on the dipstick against the engine's marks",
      cue: "Pull the dipstick, wipe it, seat it and pull it again; read the level against the engine's own marks and commit it — the rag goes in the bin, not on the manifold.",
      why: "The dipstick is read twice because the first pull shows where the oil splashed, and it is read against the engine's own marks because the right level is the engine maker's figure, not a rule of thumb. Low oil is a bearing; high oil is a seal and oil in the bilge, which is the vapour problem from the other direction. The rag is the small thing on this step that matters most: it goes in the covered bin the moment the stick is wiped.",
      gauge: { label: "OIL LEVEL", speed: 0.7, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "below the low mark" : t <= 0.62 ? "between the marks" : "over the full mark"), missNote: "Outside the marks — the stick is wiped, seated and read again against the engine's own marks, not the first splash." },
    },
    {
      id: "valve-order", kind: "sequence",
      targets: ["fuel-valve", "raw-water-seacock", "battery-switch"],
      itemNames: { "fuel-valve": "fuel supply valve", "raw-water-seacock": "raw-water seacock", "battery-switch": "engine battery switch" },
      outOfOrderNote: "Fuel, then raw water, then the battery — the checklist's order, so the engine has fuel and cooling before it has the power to turn.",
      title: "Open the fuel valve, the seacock and the battery switch in the checklist's order",
      cue: "Open the fuel supply valve, confirm the raw-water seacock is open, then close the engine battery switch — in that order, each one checked by hand.",
      why: "The order is the point: an engine given electrical power before it has fuel and cooling water is an engine that can be started from the flybridge into a dry pump and an empty line, and the flybridge cannot see the engine room. Fuel first, water second, power last means the engine cannot turn until everything it needs to turn safely is already there, and every valve is checked by hand because a valve handle that looks open on a diesel is a valve handle that looks the same shut.",
    },
    {
      id: "raw-water-watch", kind: "track", target: "exhaust-watch", seconds: 6,
      title: "Watch the raw water at the exhaust after the start",
      cue: "With the engineer's word, the port engine is started from the flybridge — watch the exhaust outlet and the strainer for a steady flow of raw water and call it to the engineer, steadily, until the engine has settled.",
      why: "The first thing an engine tells the engine room after a start is whether it has cooling water, and it tells it at the exhaust: water in the exhaust means the pump is pulling, no water means the impeller is about to melt and the exhaust hose after it. The watch is steady and called out loud because the engineer on the intercom is reading temperatures that lag the truth by a minute, and the deckhand's eyes at the exhaust are a minute ahead of the gauge.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "RAW WATER FLOW", readout: (v) => (v < 0.42 ? "no water — impeller dry" : v > 0.6 ? "surging — air in the line" : "steady — water at the exhaust") },
      holdBreakNote: "The flow watch broke — eyes off the exhaust while the engine was settling. Back on the outlet, calling the flow to the engineer, until it holds steady.",
    },
    {
      id: "generator-tagout", kind: "select", target: "loto-tag",
      title: "Lock out and tag the generator's open panel",
      cue: "The generator's panel is off for a repair: isolate it at its breaker, lock the breaker, hang the tag with your name, and prove it dead before anyone reaches in — or the cover goes back on.",
      why: "An open panel in an engine room is a panel somebody will reach into, and the rules for the control of hazardous energy say the only person who can restore the power is the person who locked it out — a lock and a named tag, not a note and a hope. The generator is isolated at its own breaker, locked, tagged and proven dead, because the alternative is a deckhand's hand in a panel the captain re-energises from the flybridge without knowing anyone is below.",
    },
    {
      id: "engine-log", kind: "select", target: "engine-log",
      title: "Write the engine log",
      cue: "Enter the pre-start: the levels read, the belt and the clamp found, the vapour and the blower run, the pump proven, the strainer cleared, the detector alarm and the fuel filter drip, the generator's tag.",
      why: "The engine log is the engineer's memory of the plant and the record an inspector reads, and it is where a cracked belt becomes a spare fitted before the next trip and a loose clamp becomes a question about what else has vibrated loose. The detector alarm and the filter drip are logged because the next person below needs to know that this bilge held vapour this morning and that this filter weeps — a fault seen once and not written is a fault that surprises the next watch.",
    },
    {
      id: "crew-checkin", kind: "select", target: "er-intercom",
      title: "Check in with the engineer and the deck",
      cue: "On the intercom: both engines running clean with water at the exhaust, the generator tagged, what you found and what you fixed, and how you are after the alarm and the drip in a closed space.",
      why: "The engineer signs the plant over to the captain on the strength of the deckhand's report, and the deck above needs to hear that the engine room is closed up before the lines are handled. It is also the deckhand's own check-in: a vapour alarm and a fuel drip in a closed engine room at the start of a long day is a small hard thing, and the union's member assistance line is there for what the intercom does not carry.",
    },
  ],

  interrupts: [
    {
      id: "vapour-detector-alarm",
      kind: "Vapour detector alarms during the sniff",
      after: "bilge-sniff", delay: 2, seconds: 14,
      alert: "The bilge vapour detector by the fuel filters has gone into alarm while you are at the plate — the lamp is red and the sounder is going.",
      cue: "Prop the engine-room hatch fully open to the deck and get your face out of the bilge; the blower and the leak hunt come after the air is moving.",
      target: "hatch-prop",
      why: "A detector alarm during the sniff is confirmation of what the nose suspected: vapour in the bilge at a concentration the instrument calls dangerous, in a closed space with a person's face in it. The first move is air — the hatch propped wide gives the vapour somewhere to go and the deckhand somewhere to breathe — and only then the blower, and only then the search for the leak; nothing that sparks runs until the detector is quiet.",
      missNote: "The detector alarmed with the deckhand's face still at the plate and the hatch shut, and the engineer found them on the ladder, dizzy, with the blower not yet running.",
      wrongNote: "The hatch prop — air first, the deckhand out of the bilge; the blower and the leak hunt come after the space is open.",
    },
    {
      id: "fuel-filter-drip",
      kind: "Fuel filter drips after the start",
      after: "raw-water-watch", delay: 2, seconds: 14,
      alert: "The port engine's fuel filter has started to drip at its bowl seal now the engine is running — a steady drip onto the hot manifold below it.",
      cue: "Close the fuel shut-off at the tank for the port engine and tell the engineer; the engine stops when the line runs dry and the filter is fixed cold.",
      target: "fuel-shutoff",
      why: "Fuel dripping onto a manifold that is coming up to temperature is the engine-room fire, and the answer is at the tank, not at the filter — a hand at a leaking filter beside a hot manifold is a hand in the fire when it lights. The shut-off at the tank stops the fuel, the engine stops when the line runs dry, and the filter's bowl seal is fixed cold with the engineer; the drip is never chased with a rag on a running engine.",
      missNote: "The drip ran onto the manifold as it warmed, the smell reached the deck before anyone moved, and the engineer found the deckhand reaching for the filter with a rag.",
      wrongNote: "The fuel shut-off at the tank — the fuel is stopped at its source; nobody touches a leaking filter beside a hot manifold.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, YC4_ACCENT);

    // ------------------------------------------------------ the engine room
    const sole = box(g, 5.6, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.8 });
    sole.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a3f45", base2: "#2c3238", step: 22 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc0c6cc });
    // Hull sides and overhead, white with a frame every so often.
    for (const sx of [-1, 1]) {
      const wall = box(g, 0.1, 2.3, 5.0, sx * 2.85, 1.15, 0, 0xe9ebe6, { rough: 0.6, cast: false });
      void wall;
      for (let i = 0; i < 5; i++) box(g, 0.12, 2.2, 0.08, sx * 2.78, 1.1, -2.0 + i * 1.0, 0xc8ced4, { rough: 0.5, metal: 0.3 });
    }
    box(g, 5.6, 0.1, 5.0, 0, 2.35, 0, 0xdfe3e6, { rough: 0.7, cast: false });
    box(g, 5.6, 2.3, 0.1, 0, 1.15, -2.55, 0xe9ebe6, { rough: 0.6, cast: false });
    for (let i = 0; i < 6; i++) cyl(g, 0.04, 0.04, 5.0, -2.4 + i * 0.95, 2.2, 0, [0x2f6fe0, 0xd8322c, 0xc8ced4, 0x2f8f5a, 0xc8ced4, 0xf2c14b][i], { rough: 0.5, metal: 0.4, seg: 8 }).rotation.x = Math.PI / 2;
    // Twin diesels either side of the walkway.
    const engines = {};
    for (const sx of [-1, 1]) {
      const e = group(g, sx * 1.55, 0.06, -0.3);
      box(e, 1.1, 0.5, 2.4, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });                 // bed and sump
      box(e, 1.0, 0.7, 2.2, 0, 0.85, 0, 0xf1f3f4, { rough: 0.45, metal: 0.3, finish: "painted" }); // block
      box(e, 0.9, 0.25, 2.0, 0, 1.32, 0, 0xdfe3e6, { rough: 0.45, metal: 0.3 });                // rocker cover
      const manifold = cyl(e, 0.1, 0.1, 2.0, -sx * 0.55, 1.0, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 12 });
      manifold.rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) cyl(e, 0.05, 0.05, 0.2, -sx * 0.55, 1.15, -0.75 + i * 0.5, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
      cyl(e, 0.16, 0.16, 0.3, 0, 0.7, 1.25, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 14 }).rotation.x = Math.PI / 2;   // front pulley
      cyl(e, 0.1, 0.1, 0.2, sx * 0.3, 1.1, 1.3, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 12 }).rotation.x = Math.PI / 2;  // alternator pulley
      const belt = torus(e, 0.2, 0.02, sx * 0.15, 0.9, 1.4, 0x15181c, { rough: 0.9, seg: 6, seg2: 20 });
      belt.scale.set(1, 1.4, 1);
      box(e, 0.35, 0.3, 0.3, sx * 0.3, 1.1, 1.05, 0x3a4148, { rough: 0.5, metal: 0.6 });    // alternator
      const stick = group(e, sx * 0.45, 1.2, -0.4);
      cyl(stick, 0.015, 0.015, 0.3, 0, 0.15, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6 });
      torus(stick, 0.04, 0.012, 0, 0.32, 0, 0xf2c14b, { rough: 0.6, seg: 6, seg2: 12 });
      engines[sx] = { e, belt, stick, manifold };
    }
    const port = engines[1], stbd = engines[-1];
    holoTag(port.e, "port engine", 0, 1.9, 0, { css: YC4_CSS, w: 0.26 });
    holoTag(stbd.e, "starboard engine", 0, 1.9, 0, { css: YC4_CSS, w: 0.34 });
    const crackedBelt = box(port.e, 0.06, 0.06, 0.06, 0.15, 1.15, 1.4, 0xd2312b, { rough: 0.5, emissive: 0x4a0808, ei: 0.4 });
    reg(hits, crackedBelt, "belt-cracked");
    const beltHit = box(port.e, 0.5, 0.5, 0.3, 0.15, 0.9, 1.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(port.e, "check the belt — start armed?", 0.15, 1.55, 1.5, { css: "#d2312b", w: 0.54 });
    reg(hits, beltHit, "belt-reach");
    holoTag(port.stick, "dipstick", 0, 0.5, 0, { css: YC4_CSS, w: 0.22 });
    reg(hits, port.stick, "dipstick");
    const rag = box(port.e, 0.2, 0.03, 0.16, -0.55, 1.12, -0.5, 0xd8d2c4, { rough: 0.9 });
    holoTag(port.e, "rag on the manifold?", -0.55, 1.4, -0.5, { css: "#d2312b", w: 0.42 });
    reg(hits, rag, "rag-on-manifold");
    // Raw-water lines, seacocks and strainers on the hull side by each engine.
    const strainer = group(g, 2.6, 0.06, 1.3);
    cyl(strainer, 0.12, 0.12, 0.4, 0, 0.4, 0, 0x3f6f8f, { rough: 0.3, metal: 0.2, opacity: 0.7, transparent: true, seg: 14 });
    const strainerLid = cyl(strainer, 0.14, 0.14, 0.05, 0, 0.62, 0, 0x8a3a1a, { rough: 0.5, metal: 0.4, seg: 14 });
    const basket = cyl(strainer, 0.08, 0.08, 0.3, 0, 0.4, 0, 0x2f8f5a, { rough: 0.8, seg: 10 });
    void basket;
    hose(strainer, [[0, 0.2, 0], [-0.3, 0.2, -0.2], [-0.9, 0.5, -0.5]], 0.03, 0x15181c, { steps: 6, rough: 0.8 });
    const clamp = torus(strainer, 0.04, 0.012, -0.32, 0.2, -0.21, 0xd2312b, { rough: 0.4, metal: 0.6, emissive: 0x4a0808, ei: 0.4, seg: 6, seg2: 12 });
    holoTag(strainer, "sea strainer", 0, 0.9, 0, { css: YC4_CSS, w: 0.28 });
    reg(hits, strainerLid, "strainer-lid");
    reg(hits, clamp, "hose-clamp-loose");
    const seacock = group(strainer, 0.1, 0.1, 0.35);
    cyl(seacock, 0.05, 0.05, 0.12, 0, 0, 0, 0xb87333, { rough: 0.4, metal: 0.6, seg: 10 });
    const seacockHandle = box(seacock, 0.03, 0.02, 0.22, 0, 0.07, 0, 0xd2312b, { rough: 0.5 });
    holoTag(seacock, "raw-water seacock", 0, 0.28, 0, { css: YC4_CSS, w: 0.36 });
    reg(hits, seacock, "raw-water-seacock");
    // Fuel valve and shut-off at the tank bulkhead, fuel filters with the bowl that drips.
    const fuelPanel = group(g, -2.6, 0.06, 1.4);
    box(fuelPanel, 0.1, 1.2, 0.8, 0, 0.9, 0, 0xc8ced4, { rough: 0.5, metal: 0.3 });
    const fuelValve = group(fuelPanel, 0.1, 1.1, 0.2);
    cyl(fuelValve, 0.04, 0.04, 0.1, 0, 0, 0, 0xb87333, { rough: 0.4, metal: 0.6, seg: 10 });
    const fuelHandle = box(fuelValve, 0.02, 0.18, 0.03, 0, 0.09, 0.03, 0xf2c14b, { rough: 0.5 });
    holoTag(fuelValve, "fuel supply valve", 0, 0.3, 0, { css: YC4_CSS, w: 0.34 });
    reg(hits, fuelValve, "fuel-valve");
    const shutoff = group(fuelPanel, 0.1, 0.6, -0.2);
    cyl(shutoff, 0.05, 0.05, 0.1, 0, 0, 0, 0xd2312b, { rough: 0.4, metal: 0.4, seg: 10 });
    box(shutoff, 0.03, 0.22, 0.03, 0, 0.1, 0.03, 0xd2312b, { rough: 0.5 });
    holoTag(shutoff, "fuel shut-off — tank", 0, 0.32, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, shutoff, "fuel-shutoff");
    const filters = group(g, 0.6, 0.06, 0.9);
    for (const sx of [-0.18, 0.18]) { cyl(filters, 0.07, 0.07, 0.25, sx, 0.9, 0, 0xc0c6cc, { rough: 0.4, metal: 0.6, seg: 12 }); cyl(filters, 0.06, 0.06, 0.12, sx, 0.7, 0, 0x3f6f8f, { rough: 0.3, opacity: 0.7, transparent: true, seg: 12 }); }
    box(filters, 0.5, 0.04, 0.1, 0, 1.05, 0, 0x2b3138, { rough: 0.6 });
    const drip = hose(filters, [[0.18, 0.62, 0], [0.19, 0.4, 0.02], [0.2, 0.12, 0.05]], 0.008, 0xd8b45a, { steps: 6, rough: 0.5 });
    drip.visible = false;
    holoTag(filters, "fuel filters", 0, 1.3, 0, { css: YC4_CSS, w: 0.26 });
    // The bilge: an open plate by the filters, the sniff point, the float switch and pump, the detector.
    const bilge = group(g, 0.6, 0, 1.7);
    box(bilge, 0.7, 0.02, 0.7, 0, 0.005, 0, 0x0b1218, { rough: 0.9, cast: false });
    const plate = box(bilge, 0.7, 0.04, 0.7, 0.72, 0.2, 0, 0x3a3f45, { rough: 0.8, metal: 0.35 });
    plate.rotation.z = 1.2;
    const sniff = box(bilge, 0.6, 0.3, 0.6, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bilge, "bilge — sniff here", 0, 0.6, 0, { css: YC4_CSS, w: 0.34 });
    reg(hits, sniff, "bilge-sniff-point");
    const float = group(bilge, -0.2, -0.05, 0.15);
    box(float, 0.12, 0.06, 0.08, 0, 0, 0, 0xf1f3f4, { rough: 0.6 });
    hose(float, [[0, 0, 0], [0.15, 0.02, -0.1]], 0.008, 0x15181c, { steps: 3, rough: 0.8 });
    holoTag(float, "float switch", 0, 0.25, 0, { css: YC4_CSS, w: 0.26 });
    reg(hits, float, "float-switch");
    const pump = group(bilge, 0.2, -0.05, -0.2);
    cyl(pump, 0.07, 0.07, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 12 });
    const pumpRing = torus(pump, 0.14, 0.01, 0, 0.1, 0, YC4_ACCENT, { emissive: YC4_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    pumpRing.rotation.x = Math.PI / 2;
    holoTag(pump, "pump test point", 0, 0.32, 0, { css: YC4_CSS, w: 0.3 });
    reg(hits, pump, "pump-test-socket");
    const detector = group(g, 1.2, 0.5, 1.9);
    box(detector, 0.12, 0.16, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const detLamp = ball(detector, 0.02, 0, 0.05, 0.035, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 6, seg2: 6 });
    holoTag(detector, "vapour detector", 0, 0.2, 0, { css: YC4_CSS, w: 0.32 });
    // Blower switch and timer, the battery switch, the ladder and the hatch with its prop.
    const ladder = group(g, 0, 0.06, -2.2);
    for (const sx of [-0.25, 0.25]) cyl(ladder, 0.02, 0.02, 2.2, sx, 1.1, 0, 0xc8ced4, { rough: 0.4, metal: 0.6, seg: 8 });
    for (let i = 0; i < 6; i++) box(ladder, 0.5, 0.03, 0.03, 0, 0.3 + i * 0.36, 0, 0xc8ced4, { rough: 0.4, metal: 0.6 });
    const hatch = box(g, 0.9, 0.05, 0.9, 0, 2.32, -2.0, 0xc0c6cc, { rough: 0.4, metal: 0.5 });
    const hatchProp = group(g, 0.5, 2.3, -1.55);
    cyl(hatchProp, 0.015, 0.015, 0.5, 0, -0.25, 0, 0xc8ced4, { rough: 0.4, metal: 0.6, seg: 6 });
    holoTag(hatchProp, "hatch prop — open wide", 0, -0.55, 0, { css: YC4_CSS, w: 0.42 });
    reg(hits, hatchProp, "hatch-prop");
    const blower = group(g, -0.9, 1.4, -2.48);
    box(blower, 0.24, 0.3, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const timerKnob = cyl(blower, 0.05, 0.05, 0.04, 0, 0.04, 0.04, 0xf2c14b, { rough: 0.5, seg: 12 });
    timerKnob.rotation.x = Math.PI / 2;
    holoTag(blower, "blower timer", 0, 0.28, 0, { css: YC4_CSS, w: 0.28 });
    reg(hits, blower, "blower-timer");
    const battery = group(g, -1.6, 1.0, -2.48);
    box(battery, 0.3, 0.3, 0.06, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    const battHandle = box(battery, 0.04, 0.2, 0.04, 0, 0, 0.05, 0x15181c, { rough: 0.5 });
    holoTag(battery, "battery switch", 0, 0.28, 0, { css: YC4_CSS, w: 0.3 });
    reg(hits, battery, "battery-switch");
    const startBox = group(g, 0.9, 1.3, -2.48);
    box(startBox, 0.2, 0.24, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const startBtn = cyl(startBox, 0.03, 0.03, 0.04, 0, 0.02, 0.04, 0x59c97b, { rough: 0.4, seg: 10 });
    startBtn.rotation.x = Math.PI / 2;
    holoTag(startBox, "local start — now?", 0, 0.24, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, startBtn, "start-before-blower");
    // Exhaust outlet watch (a sight glass on the wet exhaust), generator with its open panel and the tag.
    const exhaust = group(g, 2.6, 0.06, -1.4);
    cyl(exhaust, 0.12, 0.12, 0.8, 0, 0.5, 0, 0x2b3138, { rough: 0.7, seg: 12 }).rotation.x = Math.PI / 2;
    const sight = cyl(exhaust, 0.08, 0.08, 0.2, 0, 0.5, 0.5, 0x3f6f8f, { rough: 0.3, opacity: 0.7, transparent: true, seg: 12 });
    sight.rotation.x = Math.PI / 2;
    const flow = box(exhaust, 0.1, 0.1, 0.18, 0, 0.5, 0.5, 0x8fd8e8, { rough: 0.3, emissive: 0x8fd8e8, ei: 0.5, cast: false });
    flow.visible = false;
    holoTag(exhaust, "exhaust — raw water watch", 0, 0.95, 0.3, { css: YC4_CSS, w: 0.48 });
    reg(hits, sight, "exhaust-watch");
    const genset = group(g, -2.2, 0.06, -1.5);
    box(genset, 0.9, 0.8, 1.0, 0, 0.4, 0, 0xdfe3e6, { rough: 0.45, metal: 0.3, finish: "painted" });
    box(genset, 0.5, 0.4, 0.04, 0.47, 0.5, 0, 0x2b3138, { rough: 0.5 });           // open panel frame
    for (let i = 0; i < 3; i++) box(genset, 0.06, 0.06, 0.06, 0.5, 0.36 + i * 0.12, -0.1 + i * 0.1, 0xb87333, { rough: 0.4, metal: 0.6 });
    const cover = box(genset, 0.5, 0.4, 0.03, 0.9, 0.3, 0.6, 0xdfe3e6, { rough: 0.45 });
    cover.rotation.y = 0.8;
    const liveHit = box(genset, 0.3, 0.4, 0.4, 0.55, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(genset, "reach into the live panel?", 0.5, 1.05, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, liveHit, "live-panel");
    const breaker = group(genset, 0.47, 0.85, -0.35);
    box(breaker, 0.1, 0.14, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const tag = box(breaker, 0.08, 0.12, 0.01, 0, -0.14, 0.04, 0xd2312b, { rough: 0.6 });
    tag.visible = false;
    const lock = box(breaker, 0.05, 0.06, 0.03, 0, -0.06, 0.05, 0xf2c14b, { rough: 0.5 });
    lock.visible = false;
    holoTag(breaker, "generator breaker — lock & tag", 0, 0.25, 0, { css: YC4_CSS, w: 0.54 });
    reg(hits, breaker, "loto-tag");
    // Boards, intercom, PPE hooks by the ladder.
    const board = holoPanel(g, 0.8, 0.56, 1.6, 1.5, -2.45, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC4_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("PRE-START CHECKLIST", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["1 Muffs · gloves · start disarmed", "2 Belts · hoses · clamps by hand", "3 Sniff the bilge · blower per the plan",
       "4 Pump proven · strainer cleared · oil on the stick", "5 Fuel · raw water · battery — in order", "6 Water at the exhaust · engineer's word · log"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.115)));
    }, { accent: YC4_ACCENT });
    reg(hits, board, "checklist-board");
    const log = holoPanel(g, 0.5, 0.36, -2.75, 1.5, 0.2, (cx, w, h) => {
      cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = YC4_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dcefff"; cx.fillText("ENGINE LOG", w * 0.06, h * 0.17);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#eef6ff";
      ["Levels: —", "Found: —", "Remarks: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
    }, { ry: Math.PI / 2, accent: YC4_ACCENT });
    reg(hits, log, "engine-log");
    const intercom = group(g, 2.78, 1.5, 0.2);
    box(intercom, 0.06, 0.24, 0.16, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const icLamp = ball(intercom, 0.024, -0.035, 0.07, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(intercom, "engineer's intercom", -0.05, 0.24, 0, { css: YC4_CSS, w: 0.38 });
    reg(hits, intercom, "er-intercom");
    const hooks = group(g, -0.6, 0, -2.45);
    box(hooks, 0.6, 0.04, 0.04, 0, 1.75, 0, 0xc8ced4, { rough: 0.45, metal: 0.6 });
    const muffs = group(hooks, -0.18, 1.55, 0.06);
    torus(muffs, 0.1, 0.015, 0, 0, 0, 0x2b3138, { rough: 0.6, seg: 6, seg2: 16 });
    for (const sx of [-0.1, 0.1]) box(muffs, 0.06, 0.09, 0.05, sx, -0.05, 0, 0xd2312b, { rough: 0.6 });
    holoTag(muffs, "hearing protection", 0, 0.2, 0, { css: YC4_CSS, w: 0.36 });
    reg(hits, muffs, "ear-muffs");
    const gloves = group(hooks, 0.18, 1.5, 0.06);
    box(gloves, 0.1, 0.16, 0.04, 0, 0, 0, 0xd8a63a, { rough: 0.8 });
    box(gloves, 0.1, 0.16, 0.04, 0.05, -0.04, 0.03, 0xd8a63a, { rough: 0.8 });
    holoTag(gloves, "engine gloves", 0, 0.2, 0, { css: YC4_CSS, w: 0.28 });
    reg(hits, gloves, "engine-gloves");
    const bin = cyl(g, 0.14, 0.12, 0.35, -1.2, 0.24, 2.2, 0xd2312b, { rough: 0.6, seg: 12 });
    void bin;

    const engineer = standingFigure(g, -2.1, 2.1, { ry: -0.9, cloth: 0x3f4a55, trousers: 0x2b3138, gloves: true });
    holoTag(engineer, "engineer", 0, 1.9, 0, { css: YC4_CSS, w: 0.22 });

    return {
      hits,
      spawnLook: new THREE.Vector3(1.0, 0.9, 0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "muffs-and-gloves") { muffs.visible = false; gloves.visible = false; }
        if (step.id === "belts-and-hoses") { crackedBelt.material = mat(0x15181c, { rough: 0.9 }); clamp.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.8 }); }
        if (step.id === "blower-run") detLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "float-switch") { float.position.y = -0.05; pumpRing.visible = false; }
        if (step.id === "sea-strainer") { strainerLid.material = mat(0xc0c6cc, { rough: 0.4, metal: 0.6 }); seacockHandle.rotation.y = Math.PI / 2; }
        if (step.id === "oil-level") { rag.visible = false; }
        if (step.id === "valve-order") { fuelHandle.rotation.x = Math.PI / 2; battHandle.rotation.z = Math.PI / 2; }
        if (step.id === "raw-water-watch") flow.visible = true;
        if (step.id === "generator-tagout") { tag.visible = true; lock.visible = true; cover.rotation.y = 0; cover.position.set(0.47, 0.5, 0); }
        if (step.id === "engine-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0e1a26"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#dcefff"; cx.fillText("ENGINE LOG", w * 0.06, h * 0.17);
            cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#e6f6ea";
            ["Levels: oil between marks · pump proven", "Found: belt · clamp · vapour · filter drip", "Remarks: generator locked and tagged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.2)));
          });
        }
        if (step.id === "crew-checkin") icLamp.material = mat(0x4fd1ff, { emissive: 0x4fd1ff, ei: 1.2 });
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "vapour-detector-alarm") detLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
        if (it.id === "fuel-filter-drip") { drip.visible = true; icLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vapour-detector-alarm") { hatch.rotation.x = -1.3; hatch.position.set(0, 2.6, -2.4); detLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.2 }); }
        if (it.id === "fuel-filter-drip") { drip.visible = false; icLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); flow.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "blower-run") timerKnob.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "oil-level") port.stick.position.y = 1.2 + gg.t * 0.3;
        if (step?.id === "raw-water-watch" && session.holding) flow.material.emissiveIntensity = 0.4 + Math.sin(t * 8) * 0.3;
        if (detLamp.material.emissiveIntensity > 1.5) detLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 10) * 0.5;
        void dt; void CITY; void stbd;
      },
    };
  },
};
