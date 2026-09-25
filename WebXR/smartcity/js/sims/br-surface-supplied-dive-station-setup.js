import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { workboat } from "../../../shared/fleet.js";
import { generatorTrailer } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Surface-Supplied Dive Station Setup VR — SF Bay Restoration &
// Cleanup, maritime and underwater, pack A (underwater work and dive safety).
//
// The deck of a dive support workboat on the Bay, an hour before the first
// dive of a restoration job: the low-pressure dive compressor with its intake
// hose, filter tower and belt guard, the volume tank with its drain, the air
// control panel with its primary and secondary supplies and its regulator,
// the high-pressure cylinder bank with its whip checks, the diver's helmet on
// its stand with the bailout bottle and harness, the umbilical flaked on deck,
// the comms box, the standby's rig on the bench, the deck generator (the
// equipment kit's generator trailer, lashed on deck) and the crew boat (the
// fleet kit's workboat) alongside with its outboards. The learner is the lead
// diver, a Pile Drivers Local 34 commercial diver, setting the station up
// under the supervisor with the tender and the standby diver. Every figure on
// deck wears a PFD. Supply pressures, depths and times are never written as
// numbers: they are per the dive plan and the employer's safe practices manual.

const BRSS_ACCENT = 0x6fb7e8;
const BRSS_CSS = "#6fb7e8";

/** A round dial with a needle, on its own group so it registers as a control. */
function brssDial(parent, x, y, z, label) {
  const gg = group(parent, x, y, z);
  const face = cyl(gg, 0.08, 0.08, 0.03, 0, 0, 0, 0xf1f3f4, { rough: 0.4, seg: 20 });
  face.rotation.x = Math.PI / 2;
  const needle = box(gg, 0.008, 0.06, 0.006, 0, 0.02, 0.02, 0xd2312b, { rough: 0.4 });
  holoTag(gg, label, 0, 0.14, 0, { css: BRSS_CSS, w: Math.max(0.2, label.length * 0.018) });
  return { gg, needle };
}

export const SIM_BR_SURFACE_SUPPLIED_DIVE_STATION_SETUP = {
  id: "br-surface-supplied-dive-station-setup",
  index: "319",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver as lead diver setting up a surface-supplied air dive station on a Bay workboat, with the dive supervisor, the tender and the standby diver",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.430 diving equipment (air compressor systems and their intakes, breathing gas hoses, helmets), 29 CFR 1910.425 surface-supplied air diving (the reserve breathing gas and the standby) and 29 CFR 1910.420 the employer's safe practices manual; ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; supply, depth and time per the dive plan",
  name: "Surface-Supplied Dive Station Setup",
  title: simTitle("Surface-Supplied Dive Station Setup"),
  tagline: "An hour before the first dive: the setup taken from the supervisor, the compressor intake run upwind, the filter and the belt guard found, the volume tank drained, the primary and secondary lined up, the bailout read, the helmet's non-return valve proven while the crew boat's exhaust drifts over the intake, the umbilical's pneumo and comms ends found, the panel brought up steady while the compressor overheats, the pneumo zeroed, the standby's rig staged and the station logged ready — every step in a PFD",
  accent: BRSS_ACCENT,
  accentCss: BRSS_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "clean-air-station", name: "Clean Air Station", note: "Intake upwind, condensate out, both supplies proven and the non-return valve holding before a diver dressed" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Station Setup",
    currency: "CHARGE",
    ranks: ["Tender", "Diver-Tender", "Diver", "Lead Diver", "Dive Station Certified"],
    badges: [
      { id: "intake-upwind", name: "Intake Upwind", note: "The compressor's intake run upwind of every exhaust first time", test: AWARD.stepClean("run-intake") },
      { id: "valve-proven", name: "Valve Proven", note: "Bailout and panel both inside the band first time", test: AWARD.precise(0.7) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No intake at an exhaust, no grease on a high-pressure fitting, no whip check off, no hand past a guard", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Setup", note: "No corrections from the brief to the log", test: AWARD.clean },
      { id: "panel-steady", name: "Panel Steady", note: "The regulator held in band the whole bring-up", test: AWARD.unbroken },
      { id: "ready-early", name: "Ready Early", note: "Station logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "intake-at-exhaust": "You went to hang the compressor's intake beside the generator's exhaust stack, where the hose reaches without moving anything. A low-pressure dive compressor breathes whatever is at its intake and delivers it straight to the diver's helmet under pressure: carbon monoxide from an exhaust is invisible, has no smell, and at depth it poisons a diver faster than it would at the surface. 29 CFR 1910.430 wants intakes located away from exhaust and other contaminants — upwind, with the hose run to get there.",
    "grease-hp-fitting": "You reached for the tin of general-purpose grease to ease the high-pressure fitting on the cylinder bank. Oil and ordinary grease in a high-pressure gas fitting can ignite from the heat of compression when the valve is opened fast, and a fire inside a fitting is a fire in the diver's gas supply. Only the lubricant the manufacturer specifies for that service goes on those threads — usually none at all.",
    "whip-check-off": "You were about to open the high-pressure bank with the whip check unclipped from the hose joint. A high-pressure hose that parts at a fitting whips across the deck with enough force to break bones, and the whip check is the restraint that stops it. It is clipped across every high-pressure joint before any valve is opened.",
    "reach-past-guard": "You went to check the compressor belt tension with the guard swung open and the compressor running. A belt and pulley take a hand and a glove in faster than anyone can pull back, and a compressor on a moving deck is a machine you cannot brace against. The belt is checked with the compressor stopped, locked out and cooled, and the guard goes back on before it restarts.",
  },

  lateNotes: {
    "tank-drain": "The volume tank is drained once the compressor has been inspected — find the problems with the source of the air before you start moving it.",
    "panel-regulator": "The panel is brought up once the non-return valve is proven and the umbilical's ends are clean — nothing goes down a hose that has not been checked.",
    "setup-log": "The station is logged once the standby's rig is staged — the log records a finished station.",
  },

  steps: [
    {
      id: "take-setup", kind: "select", target: "setup-sheet",
      title: "Take the station setup from the supervisor",
      cue: "At the log table, in your PFD: the diving mode for today, the station layout from the employer's safe practices manual, the primary and secondary supplies the dive plan names, and who sets up what.",
      why: "A surface-supplied station is set up to a layout the employer's safe practices manual writes down, because the supervisor has to be able to walk up to any station the contractor runs and find the panel, the secondary supply and the standby's rig where they expect them. 29 CFR 1910.420 has that manual at the dive location, and the setup starts from it and from today's dive plan rather than from how the last crew left the deck.",
    },
    {
      id: "run-intake", kind: "drag", target: "intake-hose",
      title: "Run the compressor's intake upwind of every exhaust",
      cue: "Carry the compressor's intake hose to the upwind rail, clear of the generator's stack and the crew boat's outboards, and clip it high.",
      why: "The compressor breathes what is at its intake and sends it, compressed, to the diver. On a workboat the air near the deck carries the generator's exhaust, the outboards' exhaust and fuel vapour from the fuel cans, so the intake is run to the upwind rail and clipped high, away from all of them. The wind on the Bay swings through the day, which is why the intake's position is checked again whenever it does.",
      drag: { to: "upwind-rail", radius: 0.5, missNote: "Not on the upwind rail — the intake goes where no exhaust can reach it, clipped high." },
    },
    {
      id: "inspect-compressor", kind: "find", noHint: true,
      targets: ["filter-tag", "belt-guard"],
      itemNames: { "filter-tag": "filter cartridge tag past its change on the service record", "belt-guard": "belt guard hanging open on one fastener" },
      itemNotes: {
        "filter-tag": "The tag on the filter tower's cartridge shows it past the change the service record calls for. The filter is what takes oil mist and moisture out of the air the diver breathes; a spent cartridge passes them through.",
        "belt-guard": "The guard over the compressor's belt and pulleys is hanging on one fastener. With the compressor running that is an open nip point at knee height on a moving deck.",
      },
      title: "Inspect the compressor and its filtration before it runs",
      cue: "Walk the compressor with it stopped: the filter tower and its cartridge tag, the belt and its guard, the oil, the hoses and the pressure relief.",
      why: "The dive compressor is the diver's lungs for the day, and 29 CFR 1910.430 holds it to being inspected, maintained and delivering air fit to breathe. The filter cartridge is what stands between the compressor's own oil and the diver's helmet, and the guard is what stands between the tender's hand and the belt; both are checked with the machine stopped, because the time to find them wanting is before anybody is breathing from it.",
    },
    {
      id: "drain-tank", kind: "turn", target: "tank-drain",
      title: "Blow the condensate out of the volume tank",
      cue: "Open the volume tank's drain valve and let the water and oil blow out until the air runs dry, then close it.",
      why: "Compressing humid Bay air drops water out of it, and the volume tank is where that water and any oil carried over collect. Left in, the condensate rides into the panel and the umbilical, fogs the diver's helmet and freezes in the regulator in cold water. It is blown down at every setup until the air runs dry, and whatever comes out tells the team how the compressor is running.",
      turn: { turns: 1.0, label: "TANK DRAIN", readout: (t) => (t < 0.3 ? "closed — condensate in the tank" : t < 0.9 ? "blowing down — water and oil out" : "running dry — close it") },
    },
    {
      id: "line-up-supplies", kind: "sequence",
      targets: ["primary-hose", "secondary-bank"],
      itemNames: { "primary-hose": "primary supply from the volume tank made up to the panel", "secondary-bank": "secondary supply from the cylinder bank lined up on its own valve" },
      title: "Make up the primary supply, then line up the secondary",
      cue: "Connect the primary supply hose from the volume tank to the panel's primary inlet, then line up the high-pressure bank to the secondary inlet with the whip check clipped.",
      why: "29 CFR 1910.425 wants a surface-supplied diver to have a reserve breathing gas supply as well as the primary, and the station is built so the supervisor can switch from one to the other in seconds without leaving the panel. The primary is made up first so the secondary is lined up to a panel that is already plumbed, and every high-pressure joint gets its whip check before its valve is opened.",
      outOfOrderNote: "Out of order — make up the primary to the panel first, then line the secondary up to it.",
    },
    {
      id: "read-bailout", kind: "gauge", target: "bailout-gauge",
      title: "Read the bailout bottle against the dive plan",
      cue: "Crack the bailout bottle's valve, let the gauge settle and commit the reading against the charge the dive plan sets for this depth.",
      why: "The bailout bottle on the diver's back is the gas they breathe when everything at the surface fails at once — hose, panel, compressor and secondary together. It has to be charged to what the dive plan sets for this depth, and it is read at the setup rather than trusted from yesterday, because a bailout that was cracked and left open overnight is an empty bottle the diver will only discover when they need it.",
      gauge: { label: "BAILOUT vs PLAN", speed: 0.7, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "below the plan's charge — refill" : t <= 0.62 ? "charged per the dive plan" : "needle not settled"), missNote: "Outside the band — let the bailout gauge settle and read it against the charge the dive plan sets." },
    },
    {
      id: "nrv-test", kind: "hold", target: "nrv-test", seconds: 5,
      title: "Prove the helmet's non-return valve",
      cue: "With the helmet's gas inlet disconnected, hold the test: try to draw back through the non-return valve and keep trying until it has held — nothing should come back.",
      why: "The non-return valve at the helmet's inlet is what stops a parted or cut hose at the surface from sucking the gas out of the helmet — and the diver's face into it — at depth. It is tested before every dive by trying to draw back through it, and held long enough to prove it seals, because a valve that sticks open fails silently until the hose is damaged and then fails catastrophically.",
      holdBreakNote: "You let go before the valve had held — a non-return valve is proven by holding the draw until it seals. Take the test from the start.",
    },
    {
      id: "umbilical-ends", kind: "find", noHint: true,
      targets: ["pneumo-blocked", "comms-pin"],
      itemNames: { "pneumo-blocked": "pneumo hose end plugged with dried silt", "comms-pin": "green corrosion on a comms connector pin" },
      itemNotes: {
        "pneumo-blocked": "The open end of the pneumo hose is plugged with dried silt from the last job. A blocked pneumo reads wrong or not at all, and the supervisor reads the diver's depth — and the decompression — off it.",
        "comms-pin": "One pin in the helmet comms connector is furred with green corrosion. A connector like that works on deck and cuts in and out in the water, which is when the supervisor most needs to hear the diver.",
      },
      title: "Check the umbilical's pneumo and comms ends",
      cue: "At the helmet end of the umbilical: blow through the pneumo hose and look at the comms connector's pins before anything is made up to the helmet.",
      why: "The umbilical carries four things to the diver, and two of them fail quietly: a pneumo hose plugged with silt still looks like a hose, and a corroded comms pin still passes a test on a dry deck. Both are the supervisor's view of the diver — depth and voice — so they are checked at the helmet end at every setup, and cleaned or changed rather than hoped through another dive.",
    },
    {
      id: "bring-up-panel", kind: "track", target: "panel-regulator", seconds: 6,
      title: "Bring the panel up to the dive plan's supply and hold it",
      cue: "Open the panel regulator steadily to bring the diver's supply up to the over-bottom pressure the dive plan sets, and hold it there while the supervisor watches the gauges — no overshoot, no hunting.",
      why: "The panel regulator sets the pressure the diver's helmet receives above the pressure at their depth, and the dive plan sets that figure for today's depth. Brought up steadily it settles where it was set and shows any leak as a falling gauge; opened in a rush it overshoots, slams the helmet's regulator and hides a leak in the needle's swing. The supervisor watches it held before calling the station ready.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "PANEL REGULATOR", readout: (v) => (v < 0.42 ? "under the plan's supply" : v > 0.6 ? "overshooting — ease back" : "steady at the dive plan's supply") },
      holdBreakNote: "The supply went out of band — overshoot or sag. Bring the regulator back steadily and hold it at the dive plan's figure.",
    },
    {
      id: "zero-pneumo", kind: "select", target: "pneumo-gauge",
      title: "Zero the pneumo with the hose end at the surface",
      cue: "With the pneumo hose's end held at the waterline, bleed it and set the pneumofathometer to read zero at the surface.",
      why: "The pneumofathometer reads the diver's depth from the pressure needed to bleed gas out of the open end of the hose, and it only reads true if it starts from zero at the surface. A gauge that reads a little deep puts the dive on the wrong line of the tables the supervisor holds; zeroing it at the waterline at every setup is how the depth that goes in the dive record is the diver's real one.",
    },
    {
      id: "stage-standby", kind: "drag", target: "standby-helmet",
      title: "Stage the standby diver's helmet on the bench",
      cue: "Carry the standby's helmet to the bench beside their umbilical, made up and ready to go on in a hurry.",
      why: "29 CFR 1910.425 wants a standby diver available while a diver is in the water, and available means able to go in within moments, not after a search for their helmet. The standby's rig is made up on its own supply and staged beside them on the bench, so if the diver is fouled or unconscious the standby dresses, checks and goes while the supervisor is still on the comms.",
      drag: { to: "standby-bench", radius: 0.5, missNote: "Not on the bench — the standby's helmet goes beside their umbilical, ready to go on." },
    },
    {
      id: "setup-log", kind: "select", target: "setup-log",
      title: "Log the station setup",
      cue: "Record the compressor inspection and the filter changed, the tank blown down, both supplies lined up, the bailout charged, the non-return valve proven, the pneumo cleaned and zeroed and the comms connector changed.",
      why: "29 CFR 1910.430 wants diving equipment inspected and its maintenance recorded, and the setup log is where today's checks become a record the next crew can read: which cartridge went in, which connector was changed and who proved the non-return valve. The exhaust and the overheating go in as well, because a compressor that ran hot this morning is the first thing the mechanic should hear about.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Report the station ready and check in with the team",
      cue: "Tell the supervisor the station is set and logged, walk the tender and the standby through what changed, and check how everyone is before the diver dresses.",
      why: "The supervisor calls the station ready, not the diver who set it up, and the report is made at the team board so the tender and the standby hear what was found and changed. It is also the moment to say how people are: a long setup in the sun, a compressor that overheated and a filter that should have been changed last week are the kind of morning the Pile Drivers Local 34 member assistance line exists for when a deck conversation does not settle it.",
    },
  ],

  interrupts: [
    {
      id: "exhaust-at-intake",
      kind: "Exhaust drifting over the compressor intake",
      after: "nrv-test", delay: 2, seconds: 14,
      alert: "The crew boat alongside has started its outboards to reposition, and the wind has swung — blue exhaust is drifting straight across the compressor's intake.",
      cue: "Stop the compressor at its kill switch until the crew boat has moved and the intake is clear again.",
      target: "compressor-kill",
      why: "Everything the compressor draws in goes into the volume tank and on to the diver, so the moment exhaust reaches the intake the compressor is stopped — before it has filled the tank with carbon monoxide. It restarts only when the exhaust has gone and the intake has been re-run upwind, and if the tank might have taken any in, it is blown down before anyone breathes from it.",
      missNote: "The compressor kept running in the outboards' exhaust and pumped it into the volume tank; the tank had to be blown down and the air tested before the dive, and the morning's dive window was lost.",
      wrongNote: "The compressor's kill switch — stop it before it pumps the exhaust into the tank.",
    },
    {
      id: "compressor-overheat",
      kind: "Compressor high-temperature alarm",
      after: "bring-up-panel", delay: 2, seconds: 14,
      alert: "The compressor's high-temperature lamp is flashing and the primary supply gauge on the panel has started to sag.",
      cue: "Open the crossover to put the panel on the secondary bank, then tell the supervisor.",
      target: "crossover-valve",
      why: "A compressor that overheats will shut itself down or start cooking its oil into the air, and either way the primary supply is failing. The station is built for exactly this: the crossover puts the panel on the secondary bank in seconds, with no gap in supply, and only then is the compressor attended to. With a diver in the water that is the difference between an inconvenience and an emergency ascent.",
      missNote: "The primary kept sagging while the regulator was chased up to hold it; the compressor tripped on temperature and the panel fell to nothing for the seconds it took to find the crossover.",
      wrongNote: "The crossover valve — put the panel on the secondary bank before the primary fails.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRSS_ACCENT);

    // ------------------------------------------------------- water and deck
    const water = box(g, 8.4, 0.02, 8.0, 0, 0.012, -1.0, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2833", mid: "#11323e" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x84aab6 });
    const deck = box(g, 6.2, 0.14, 3.8, 0, 0.4, 0.2, 0xffffff, { rough: 0.8 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#40474d", base2: "#363c42", step: 20 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc4cad0 });
    box(g, 6.2, 0.4, 3.8, 0, 0.16, 0.2, 0xe3e6e9, { rough: 0.5, metal: 0.3, cast: false });
    box(g, 6.2, 0.1, 0.08, 0, 0.52, -1.66, CITY.hiVis, { rough: 0.6 });
    box(g, 6.0, 0.04, 0.04, 0, 1.45, -1.62, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    for (const x of [-2.9, -0.9, 0.9, 2.9]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.62, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });

    // ------------------------------------------------------- compressor, filter, belt guard
    const comp = group(g, -2.2, 0.47, -0.6);
    box(comp, 0.9, 0.55, 0.6, 0, 0.28, 0, 0x2f6f4a, { rough: 0.55, metal: 0.35 });
    cyl(comp, 0.14, 0.14, 0.4, -0.25, 0.75, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 14 });
    const filterTower = group(comp, 0.32, 0.55, 0.2);
    cyl(filterTower, 0.07, 0.07, 0.5, 0, 0.25, 0, 0xc0c6cc, { rough: 0.35, metal: 0.7, seg: 14 });
    const filterTag = decal(filterTower, 0.1, 0.12, 0, 0.25, 0.075, paperFace("FILTER", ["overdue"], { bg: "#f6e2c2", band: "#c8102e" }), { px: 96 });
    reg(hits, filterTag, "filter-tag");
    const guard = group(comp, -0.46, 0.3, 0.1);
    const guardPlate = box(guard, 0.04, 0.4, 0.44, 0, 0, 0.22, 0xe8b02e, { rough: 0.5, metal: 0.3 });
    guard.rotation.y = -0.9;
    reg(hits, guardPlate, "belt-guard");
    const beltHit = box(comp, 0.3, 0.4, 0.4, -0.62, 0.3, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(comp, "check the belt while it runs?", -0.6, 0.72, 0.4, { css: "#d2312b", w: 0.52 });
    reg(hits, beltHit, "reach-past-guard");
    const lamp = ball(comp, 0.035, 0.1, 0.6, 0.31, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10, seg2: 8 });
    const killG = group(comp, -0.1, 0.62, 0.31);
    cyl(killG, 0.04, 0.04, 0.03, 0, 0, 0, 0xd2312b, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(killG, "compressor kill switch", 0, 0.14, 0.02, { css: BRSS_CSS, w: 0.42 });
    reg(hits, killG, "compressor-kill");
    holoTag(comp, "LP dive compressor", 0, 1.1, 0, { css: BRSS_CSS, w: 0.36 });
    // Intake hose, and the rail it runs to.
    const intake = group(g, -2.55, 1.05, -0.3);
    cyl(intake, 0.05, 0.05, 0.12, 0, 0, 0, 0x2b3138, { rough: 0.6, seg: 12 });
    const intakeHose = hose(g, [[-2.4, 0.9, -0.5], [-2.6, 0.95, -0.35], [-2.55, 1.0, -0.3]], 0.025, 0x15181c, { steps: 8, rough: 0.8 });
    holoTag(intake, "intake hose", 0, 0.14, 0, { css: BRSS_CSS, w: 0.22 });
    reg(hits, intake, "intake-hose");
    const upwind = group(g, -0.6, 1.55, -1.6);
    const upRing = torus(upwind, 0.18, 0.01, 0, 0, 0, BRSS_ACCENT, { emissive: BRSS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    void upRing;
    holoTag(upwind, "upwind rail — clip high", 0, 0.26, 0, { css: BRSS_CSS, w: 0.42 });
    reg(hits, upwind, "upwind-rail");
    const smoke = group(g, -2.3, 1.1, -1.9);
    for (let i = 0; i < 4; i++) ball(smoke, 0.22 + i * 0.05, i * 0.25, i * 0.12, 0.35 * i, 0x6f7f8f, { rough: 1, opacity: 0.35, transparent: true, cast: false, seg: 10, seg2: 8 });
    smoke.visible = false;

    // ------------------------------------------------------- deck generator and its exhaust
    const gen = generatorTrailer(g, -2.3, 0.47, 1.35, { ry: Math.PI / 2 });
    void gen;
    const stackHit = box(g, 0.4, 0.5, 0.4, -1.5, 1.8, 1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hang the intake by the exhaust?", -1.5, 2.2, 1.35, { css: "#d2312b", w: 0.56 });
    reg(hits, stackHit, "intake-at-exhaust");

    // ------------------------------------------------------- volume tank and drain
    const vt = group(g, -1.0, 0.47, -1.0);
    cyl(vt, 0.22, 0.22, 1.0, 0, 0.6, 0, 0xe8e2d0, { rough: 0.5, metal: 0.3, seg: 16 });
    ball(vt, 0.22, 0, 1.1, 0, 0xe8e2d0, { rough: 0.5, metal: 0.3, seg: 16, seg2: 8 });
    const drainV = group(vt, 0.2, 0.12, 0.1);
    const drainWheel = valveWheel(drainV, 0, 0, 0, { r: 0.05, color: 0xd2312b, body: 0x2b3138 });
    drainWheel.scale.set(0.5, 0.5, 0.5);
    holoTag(drainV, "tank drain", 0, 0.28, 0, { css: BRSS_CSS, w: 0.22 });
    reg(hits, drainV, "tank-drain");
    const puddle = cyl(g, 0.25, 0.25, 0.005, -0.75, 0.48, -0.85, 0x6a5a3a, { rough: 0.2, metal: 0.3, opacity: 0.7, transparent: true, cast: false, seg: 16 });
    puddle.visible = false;
    hose(g, [[-1.8, 0.8, -0.6], [-1.4, 0.55, -0.8], [-1.1, 0.7, -1.0]], 0.022, 0x15181c, { steps: 8, rough: 0.8 });

    // ------------------------------------------------------- air panel, secondary bank
    const panel = group(g, 0.4, 0.47, -1.15);
    box(panel, 1.1, 0.8, 0.45, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const pFace = box(panel, 1.0, 0.56, 0.05, 0, 1.08, -0.1, 0x3a4148, { rough: 0.5, metal: 0.5 });
    pFace.rotation.x = -0.3;
    const prim = brssDial(panel, -0.3, 1.14, -0.02, "primary");
    const pneumo = brssDial(panel, 0.05, 1.14, -0.02, "pneumo");
    reg(hits, pneumo.gg, "pneumo-gauge");
    const sec = brssDial(panel, 0.38, 1.14, -0.02, "secondary");
    const regG = group(panel, -0.1, 0.86, -0.25);
    cyl(regG, 0.06, 0.06, 0.05, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    const regKnob = box(regG, 0.016, 0.1, 0.02, 0, 0, -0.03, 0xf2c14b, { rough: 0.5 });
    holoTag(regG, "panel regulator", 0, 0.14, 0, { css: BRSS_CSS, w: 0.32 });
    reg(hits, regG, "panel-regulator");
    const xover = group(panel, 0.35, 0.86, -0.25);
    const xoverHandle = box(xover, 0.14, 0.025, 0.025, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    cyl(xover, 0.03, 0.03, 0.05, 0, 0, 0.02, 0x5b6771, { rough: 0.4, metal: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(xover, "crossover to secondary", 0, 0.12, 0, { css: BRSS_CSS, w: 0.42 });
    reg(hits, xover, "crossover-valve");
    const primHose = group(g, -0.35, 0.95, -1.05);
    hose(primHose, [[-0.6, -0.3, 0.05], [-0.3, -0.1, 0.02], [0, 0, 0]], 0.022, 0x15181c, { steps: 8, rough: 0.8 });
    const primEnd = cyl(primHose, 0.03, 0.03, 0.08, 0, 0, 0, 0xc8a24a, { rough: 0.35, metal: 0.6, seg: 10 });
    primEnd.rotation.z = Math.PI / 2;
    holoTag(primHose, "primary supply", 0, 0.18, 0, { css: BRSS_CSS, w: 0.3 });
    reg(hits, primHose, "primary-hose");
    const bank = group(g, 1.6, 0.47, -1.2);
    for (let i = 0; i < 3; i++) cyl(bank, 0.11, 0.11, 1.2, -0.25 + i * 0.25, 0.6, 0, [0x2f5f8f, 0x2f5f8f, 0x3a6a9a][i], { rough: 0.45, metal: 0.5, seg: 14 });
    box(bank, 0.8, 0.06, 0.3, 0, 0.9, 0, 0x5b6771, { rough: 0.5, metal: 0.5 });
    const bankValve = group(bank, 0, 1.3, 0.05);
    cyl(bankValve, 0.035, 0.035, 0.08, 0, 0, 0, 0xc8a24a, { rough: 0.35, metal: 0.6, seg: 10 });
    holoTag(bankValve, "secondary bank", 0, 0.18, 0, { css: BRSS_CSS, w: 0.3 });
    reg(hits, bankValve, "secondary-bank");
    hose(g, [[1.6, 1.75, -1.15], [1.2, 1.4, -1.2], [0.8, 1.2, -1.2]], 0.015, 0x15181c, { steps: 8, rough: 0.8 });
    const whip = group(g, 1.25, 1.52, -1.1);
    const whipOpen = hose(whip, [[0, 0, 0], [0.08, -0.12, 0.05], [0.12, -0.25, 0.04]], 0.006, 0xc0c6cc, { steps: 6, rough: 0.4, metal: 0.6 });
    const whipHit = box(whip, 0.3, 0.35, 0.3, 0.05, -0.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(whip, "open it — whip check off?", 0, 0.2, 0.05, { css: "#d2312b", w: 0.48 });
    reg(hits, whipHit, "whip-check-off");
    const grease = group(g, 2.3, 0.47, -0.6);
    cyl(grease, 0.08, 0.08, 0.1, 0, 0.05, 0, 0xc8a030, { rough: 0.5, metal: 0.4, seg: 14 });
    holoTag(grease, "grease the HP fitting?", 0, 0.3, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, grease, "grease-hp-fitting");

    // ------------------------------------------------------- helmet stand, bailout, umbilical ends
    const stand = group(g, 1.2, 0.47, 0.35);
    cyl(stand, 0.04, 0.05, 1.0, 0, 0.5, 0, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 8 });
    const helmet = ball(stand, 0.2, 0, 1.18, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 16, seg2: 12 });
    void helmet;
    const port = cyl(stand, 0.09, 0.09, 0.04, 0, 1.18, 0.18, 0x274a5f, { rough: 0.1, metal: 0.5, seg: 16 });
    port.rotation.x = Math.PI / 2;
    const nrv = group(stand, 0.2, 1.1, 0.05);
    cyl(nrv, 0.025, 0.025, 0.1, 0, 0, 0, 0xc8a24a, { rough: 0.35, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    const nrvLamp = ball(nrv, 0.018, 0.07, 0.04, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.0, seg: 8, seg2: 6 });
    holoTag(nrv, "non-return valve test", 0.05, 0.14, 0, { css: BRSS_CSS, w: 0.4 });
    reg(hits, nrv, "nrv-test");
    const bail = group(g, 1.75, 0.47, 0.5);
    cyl(bail, 0.09, 0.09, 0.6, 0, 0.3, 0, 0xd8dde2, { rough: 0.4, metal: 0.5, seg: 14 });
    const bailGauge = brssDial(bail, 0, 0.72, 0.05, "bailout gauge");
    reg(hits, bailGauge.gg, "bailout-gauge");
    const flake = group(g, 0.1, 0.48, 0.4);
    for (let i = 0; i < 3; i++) for (const sx of [-0.2, 0.2]) torus(flake, 0.2, 0.025, sx, 0.02 + i * 0.05, 0, 0xf2c14b, { rough: 0.8, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    hose(g, [[0.3, 0.6, 0.4], [0.7, 0.9, 0.4], [1.0, 1.1, 0.4]], 0.025, 0xf2c14b, { steps: 8, rough: 0.8 });
    const pneumoEnd = group(g, 0.55, 0.56, 0.85);
    cyl(pneumoEnd, 0.012, 0.012, 0.16, 0, 0, 0, 0x2b5aa8, { rough: 0.6, seg: 6 }).rotation.z = Math.PI / 2;
    const plug = ball(pneumoEnd, 0.02, 0.09, 0, 0, 0x6a5a3a, { rough: 1, seg: 8, seg2: 6 });
    holoTag(pneumoEnd, "pneumo end", 0, 0.1, 0, { css: BRSS_CSS, w: 0.22 });
    reg(hits, plug, "pneumo-blocked");
    const connector = group(g, 0.85, 0.56, 0.9);
    cyl(connector, 0.03, 0.03, 0.06, 0, 0, 0, 0x1b1e22, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    const pin = ball(connector, 0.012, 0.035, 0, 0, 0x4a8a5a, { rough: 0.9, emissive: 0x1a3a22, ei: 0.4, seg: 8, seg2: 6 });
    holoTag(connector, "comms connector", 0, 0.1, 0, { css: BRSS_CSS, w: 0.3 });
    reg(hits, pin, "comms-pin");

    // ------------------------------------------------------- standby bench, log, team board
    const bench = group(g, 2.35, 0.47, 1.3, -0.4);
    box(bench, 1.0, 0.4, 0.4, 0, 0.2, 0, 0x5b4a3a, { rough: 0.8 });
    const benchRing = torus(bench, 0.2, 0.01, -0.25, 0.42, 0, BRSS_ACCENT, { emissive: BRSS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    benchRing.rotation.x = Math.PI / 2;
    holoTag(bench, "standby bench", 0, 0.7, 0, { css: BRSS_CSS, w: 0.28 });
    reg(hits, bench, "standby-bench");
    const sbHelmet = group(g, 0.5, 0.47, 1.9);
    ball(sbHelmet, 0.18, 0, 0.2, 0, 0xd8dde2, { rough: 0.35, metal: 0.4, seg: 14, seg2: 10 });
    holoTag(sbHelmet, "standby's helmet", 0, 0.5, 0, { css: BRSS_CSS, w: 0.32 });
    reg(hits, sbHelmet, "standby-helmet");
    const table = group(g, -0.9, 0.47, 1.75);
    box(table, 0.8, 0.06, 0.5, 0, 0.8, 0, 0x5b4a3a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const setupSheet = decal(table, 0.3, 0.22, -0.18, 0.84, 0, paperFace("SETUP", ["Mode: surface-supplied air", "Layout: per the manual", "Supply: per the dive plan"], { bg: "#eef2f6", band: "#2b5aa8" }), { px: 160 });
    setupSheet.rotation.x = -Math.PI / 2;
    holoTag(table, "setup sheet · station log", 0, 1.1, 0, { css: BRSS_CSS, w: 0.46 });
    reg(hits, setupSheet, "setup-sheet");
    const log = decal(table, 0.3, 0.22, 0.2, 0.84, 0, paperFace("STATION LOG", ["Compressor ____", "Supplies ____", "NRV ____ Pneumo ____"], { bg: "#f3efe4", band: "#6fb7e8" }), { px: 160 });
    log.rotation.x = -Math.PI / 2;
    reg(hits, log, "setup-log");
    const team = decal(g, 0.6, 0.4, 2.7, 1.35, -0.3, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Lead diver", "Tender · Standby", "Station: setting up"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = -Math.PI / 2;
    box(g, 0.04, 0.46, 0.66, 2.73, 1.35, -0.3, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");

    // ------------------------------------------------------- crew in PFDs
    const supervisor = standingFigure(g, -1.55, 0.7, { ry: 2.5, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor", 0, 1.95, 0, { css: BRSS_CSS, w: 0.22 });
    const tenderFig = standingFigure(g, -0.75, 0.45, { ry: 2.2, cloth: 0x1f3a52, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true });
    tenderFig.position.y = 0.47;
    holoTag(tenderFig, "tender", 0, 1.95, 0, { css: BRSS_CSS, w: 0.18 });
    const standby = standingFigure(g, 1.6, 1.55, { ry: -2.8, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 1.95, 0, { css: BRSS_CSS, w: 0.28 });

    // ------------------------------------------------------- the crew boat alongside
    const crewBoat = workboat(g, -0.8, -0.45, -4.3, { ry: -Math.PI / 2, livery: { colour: 0xd9dde0, fleetName: "BAY WORKS", unitNumber: "WB-2" } });
    const outboards = crewBoat.userData.parts?.outboards;

    const waterTex = water.material.map;
    let overheating = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 0.9, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "run-intake") { intake.position.set(-0.6, 1.5, -1.55); intakeHose.visible = false; }
        if (step.id === "inspect-compressor") { guard.rotation.y = 0; repaint(filterTag, paperFace("FILTER", ["changed"], { bg: "#e6f6ea", band: "#59c97b" })); }
        if (step.id === "drain-tank") puddle.visible = true;
        if (step.id === "line-up-supplies") whipOpen.visible = false;
        if (step.id === "nrv-test") nrvLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
        if (step.id === "umbilical-ends") { plug.visible = false; pin.material = mat(0xc8a24a, { rough: 0.35, metal: 0.6 }); }
        if (step.id === "zero-pneumo") pneumo.needle.rotation.z = 1.2;
        if (step.id === "stage-standby") { sbHelmet.position.set(2.1, 0.9, 1.2); benchRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "setup-log") repaint(log, paperFace("STATION LOG", ["Compressor: filter changed", "Supplies: both proven", "NRV held · pneumo zeroed"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "exhaust-at-intake") { smoke.visible = true; if (outboards) outboards.rotation.x = 0.2; }
        if (it.id === "compressor-overheat") { overheating = true; lamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6 }); }
      },
      onInterruptEnd(it) {
        if (it.id === "exhaust-at-intake") { smoke.visible = false; if (it.resolved === "answered") { lamp.material = mat(0x5b6771, { rough: 0.5 }); killG.position.z = 0.34; } }
        if (it.id === "compressor-overheat") { overheating = false; if (it.resolved === "answered") { xoverHandle.rotation.y = Math.PI / 2; sec.needle.rotation.z = 0; lamp.material = mat(0xf2b33d, { emissive: 0xf2b33d, ei: 1.0 }); } }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "drain-tank") drainWheel.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-bailout") bailGauge.needle.rotation.z = 1.2 - gg.t * 2.4;
        if (step?.id === "bring-up-panel" && session.holding) { regKnob.rotation.z = -(session.track?.v ?? 0) * 2; prim.needle.rotation.z = 1.2 - (session.track?.v ?? 0) * 2.4; }
        if (overheating) prim.needle.rotation.z = 0.3 + Math.sin(t * 3) * 0.1;
        if (smoke.visible) smoke.position.x = -2.3 + ((t * 0.3) % 0.6);
        void sec;
      },
    };
  },
};
