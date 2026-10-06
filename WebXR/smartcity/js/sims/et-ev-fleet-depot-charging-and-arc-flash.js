import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  lockTag, standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { cargoVan } from "../../../shared/fleet.js";

// SmartCiti.X~ EV Fleet Depot Charging & Arc Flash VR — Energy & Power, the
// energy transition systems block.
//
// A covered fleet depot with a row of charging dispensers, a service panel
// feeding them with its own arc-flash label, a fleet cargo van parked at a
// stall, and a second dispenser down the row with a fault indicator lit. The
// learner is the IBEW outside/utility electrician servicing the panel and
// testing the dispensers. The depot and its fleet are generic.

const ETE_ACCENT = 0x9fd84f;
const ETE_CSS = "#9fd84f";

export const SIM_ET_EV_FLEET_DEPOT_CHARGING_AND_ARC_FLASH = {
  id: "et-ev-fleet-depot-charging-and-arc-flash",
  index: "351",
  domain: "Energy",
  trade: "IBEW outside/utility electrician servicing an EV fleet depot's charging dispensers and service panel",
  category: "Energy & Power",
  weather: "overcast",
  certification: "NFPA 70E for the arc-flash boundary and PPE category at this panel, NFPA 70 National Electrical Code for the dispenser circuits, 29 CFR 1910.269 electric power generation, transmission and distribution practice, 29 CFR 1910.333 selection and use of work practices for electrical safety, and IBEW/NECA JATC apprenticeship and journeyman training",
  name: "EV Fleet Depot Charging & Arc Flash",
  title: simTitle("EV Fleet Depot Charging & Arc Flash VR"),
  tagline: "The row before the fleet plugs in for the night: the depot's energised work permit read, the arc-rated suit and face shield on, a cut charging cable found before anyone plugs into it, the panel's own arc-flash label read, zero energy proven on the meter, the panel locked and tagged, a lug torqued to spec, the dispenser module reconnected, the circuit re-energised and held through a test without a fault, a test charge session watched clean, a blinking ground-fault indicator found on the dispenser down the row before it is ignored, the dispenser tagged back in service, the crew checked in, and the permit closed",
  accent: ETE_ACCENT,
  accentCss: ETE_CSS,
  parSeconds: 340,
  footprint: 3.0,
  badge: { id: "depot-certified", name: "Depot Certified", note: "Zero energy proven before the panel was touched, a cut cable and a fault indicator both caught before they reached the fleet, and never a re-energise without the lockout confirmed first" },

  supportLine: "your IBEW local's member assistance programme",

  game: system({
    name: "Depot Row",
    currency: "TAG",
    ranks: ["Depot Hand", "Charging Crew", "Panel Lead", "Arc-Flash Certified", "Journeyman Certified"],
    badges: [
      { id: "zero-energy-proven", name: "Zero Energy Proven", note: "The meter proved zero energy before the panel was ever opened up", test: AWARD.stepClean("verify-panel-de-energized") },
      { id: "test-held-clean", name: "Test Held Clean", note: "The charge session watch stayed in band the whole test", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never re-energised without the lockout confirmed, never a damaged cable used, never a fault indicator ignored", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "torque-on-spec", name: "Torque On Spec", note: "Lug torque committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "permit-closed-fast", name: "Permit Closed Fast", note: "Permit closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "energize-panel-not-locked": "You reconnected the dispenser module and reached to re-energise the panel before confirming the lockout was actually off and the disconnect proven closed on your own terms. A panel that is re-energised on assumption rather than on a confirmed, deliberate step is a panel that can still be carrying the fault that sent someone in here in the first place.",
    "use-damaged-charge-cable": "You plugged the cut charging cable back into service instead of setting it aside. A charging cable with damaged insulation is carrying current close enough to the surface that a driver's own hand is one flex away from finding it, and a cable like that gets tagged out and replaced, never handed back to the fleet.",
    "skip-zero-energy-verify": "You reached for the lug before the meter had actually proven zero energy at the panel. NFPA 70E requires proving dead with a meter, not assuming a breaker did its job, because a breaker that looks open and a circuit that is actually de-energised are not guaranteed to be the same thing until the meter says so.",
    "ignore-ground-fault-indicator": "You saw the blinking ground-fault indicator on the next dispenser and kept working instead of tagging it out. A ground-fault indicator lit on a charging dispenser is telling you current is finding a path it should not be on, and walking past it because it was not the dispenser you came to service is leaving exactly that fault live for the next van that plugs in.",
  },

  lateNotes: {
    "panel-lockout": "The meter has to prove zero energy first — the panel is not locked out until that reading is in hand.",
    "torque-wrench": "There is nothing to torque yet — the panel has to be proven dead and locked out before any lug is touched.",
    "dispenser-tag": "Nothing to tag yet — the re-energised test has to pass clean before this dispenser goes back in service.",
  },

  steps: [
    {
      id: "read-depot-permit", kind: "select", target: "depot-permit",
      title: "Read the depot's energised work permit",
      cue: "Read the permit: the arc-flash boundary, the PPE category, and which dispensers are down for service tonight.",
      why: "The energised work permit is what makes this job legal to start — the boundary distance and PPE category this specific panel calls for, and exactly which dispensers are already known to be out of service rather than just slow to charge.",
    },
    {
      id: "don-ppe", kind: "sequence", anyOrder: true,
      targets: ["arc-suit", "face-shield"],
      itemNames: { "arc-suit": "arc-rated suit", "face-shield": "arc-rated face shield" },
      title: "Arc-rated suit and face shield on before the panel opens",
      cue: "Arc-rated suit and face shield on before touching the panel door.",
      why: "The panel's own arc-flash label sets a PPE category for exactly this kind of door-open, meter-test work, and putting the suit and shield on before the door even opens is what keeps the label's own requirement from being something read after the fact.",
    },
    {
      id: "inspect-charge-cable", kind: "find", noHint: true,
      targets: ["cut-charge-cable"],
      itemNames: { "cut-charge-cable": "cut charging cable on the near dispenser" },
      itemNotes: { "cut-charge-cable": "The near dispenser's charging cable has a cut through its outer jacket close to the handle — easy to miss in the depot's own low light, and tagged out before any van plugs into it." },
      title: "Check the dispensers before starting panel work",
      cue: "Look over each dispenser's charging cable for a cut, a crushed section, or exposed conductor before working the panel behind them.",
      why: "A charging cable handled by a different driver every night wears in ways that are not always obvious from a few feet away, and checking the row now, before the panel work draws all the attention, is what catches a cut cable while it is still just a maintenance note instead of a shock waiting for the next van.",
    },
    {
      id: "read-arc-flash-label", kind: "select", target: "panel-label",
      title: "Read the panel's arc-flash label",
      cue: "Read the panel's own arc-flash label: the boundary distance and the incident-energy category, before opening the door.",
      why: "The label is this specific panel's own incident-energy study written down where the person about to open it can see it, and reading it now, rather than trusting memory of a similar panel, is what makes the PPE already on your body the PPE this panel actually calls for.",
    },
    {
      id: "verify-panel-de-energized", kind: "gauge", target: "test-meter",
      title: "Prove zero energy with the meter",
      cue: "Test the panel's terminals with the meter and commit the reading once it settles inside the zero-energy band.",
      why: "NFPA 70E requires proving a circuit dead with a meter before it is treated as de-energised, because a breaker that looks open is not the same fact as a meter confirming no voltage is actually present — the reading is what this whole next sequence of steps depends on being true.",
      gauge: { label: "PANEL VOLTS", speed: 0.65, green: [0.0, 0.06], readout: (t) => `${(t * 240).toFixed(0)} V`, missNote: "Not settled at zero — hold the meter on the terminals until the reading stops moving before you commit it." },
    },
    {
      id: "lockout-panel", kind: "select", target: "panel-lockout",
      title: "Lock and tag the panel",
      cue: "Lock and tag the panel's disconnect once the meter has proven zero energy.",
      why: "The lock and tag are what keep this panel from being re-energised by someone else on shift while you are still inside it working a lug — and they only mean something applied after the meter has already proven the circuit dead, not before.",
    },
    {
      id: "torque-lug", kind: "turn", target: "torque-wrench",
      title: "Torque the lug to spec",
      cue: "Turn the torque wrench slowly until it clicks at spec, watching the click rather than counting turns.",
      why: "A lug torqued past spec can crack its own terminal, and one left under spec can loosen and arc under the dispenser's own charging current — the torque wrench's click is the one signal that tells you this connection is neither.",
      turn: { turns: 1.0, label: "TORQUE", readout: (t) => (t < 0.4 ? "snug" : t < 0.9 ? "torquing" : "clicked at spec") },
    },
    {
      id: "reconnect-dispenser", kind: "drag", target: "dispenser-module",
      title: "Reconnect the dispenser module",
      cue: "Carry the replacement dispenser module from the bench and seat it into the panel's own mounting bracket.",
      why: "The module only completes the circuit once it is actually seated in its bracket and its own connector fully mated, and doing this while the panel is still locked out is what keeps the reconnection itself from being live work.",
      drag: { to: "dispenser-bracket", radius: 0.5, missNote: "Not seated in the bracket — the module has to go fully into the mounting bracket's own connector, not rest against the outside of it." },
    },
    {
      id: "energize-test-hold", kind: "hold", target: "panel-lockout", seconds: 5,
      title: "Re-energise and hold for a clean test",
      cue: "Remove the lockout, re-energise, and hold your position at the panel watching for a fault the full test.",
      why: "A fault that is going to show up on re-energising usually shows up in the first few seconds, and holding your position at the panel for the full test — rather than walking away the moment power is restored — is what catches it while you are still standing there with the disconnect in reach.",
      holdBreakNote: "The test watch broke off before the full interval finished — a re-energise that is only watched for a second is watched for exactly the second before the fault a longer watch would have caught.",
    },
    {
      id: "watch-charge-session", kind: "track", target: "charge-current-meter", seconds: 6,
      title: "Watch a test charge session stay in band",
      cue: "Start a test charge on the reconnected dispenser and watch the current reading stay inside the band the whole session.",
      why: "A dispenser that draws current outside its rated band during a test is telling you something is still wrong with the reconnection, and watching the whole session — not just the first few seconds of a successful-looking start — is what confirms this dispenser is actually ready to hand back to the fleet.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.3, fall: 0.28, drift: 0.14, label: "CHARGE A", readout: (v) => (v < 0.4 ? "undercurrent" : v > 0.62 ? "overcurrent" : "in band") },
      holdBreakNote: "The current reading ran outside the band during the test session — a dispenser handed back to the fleet on an unfinished watch is a dispenser whose fault gets found by the next driver instead of by this test.",
    },
    {
      id: "find-fault-indicator", kind: "find", noHint: true,
      targets: ["ground-fault-indicator"],
      itemNames: { "ground-fault-indicator": "blinking ground-fault indicator on the next dispenser" },
      itemNotes: { "ground-fault-indicator": "The dispenser down the row has its own ground-fault indicator blinking — not the one on tonight's work order, and easy to walk past while focused on the panel you came to service." },
      title: "Look down the row before closing out",
      cue: "Look down the row of dispensers for any indicator lit that should not be, not just the one you came to service.",
      why: "A depot's other dispensers do not stop needing attention just because tonight's work order names a different one, and looking down the row now — while you are already at the panel with your meter in hand — is what catches a ground fault before a fleet van plugs into it overnight.",
    },
    {
      id: "tag-cleared-dispenser", kind: "select", target: "dispenser-tag",
      title: "Tag the dispenser back in service",
      cue: "Hang an in-service tag on the reconnected dispenser once the test charge session has passed clean.",
      why: "A tag on a cleared dispenser is what tells the next technician, without asking, that this one already passed its test tonight — a dispenser reconnected but never tagged is a dispenser the depot's own record cannot vouch for tomorrow morning.",
    },
    {
      id: "crew-checkin", kind: "select", target: "depot-radio",
      title: "Check in with the depot supervisor",
      cue: "Call the supervisor: dispenser cleared, the fault indicator down the row tagged out, panel closed up.",
      why: "The depot supervisor's own dispatch of tomorrow's fleet depends on knowing exactly which dispensers are actually safe to use tonight, and calling it in is what keeps that decision based on what you just confirmed rather than on an assumption that the row is fine.",
    },
    {
      id: "close-depot-permit", kind: "select", target: "depot-permit-close",
      title: "Close the energised work permit",
      cue: "Record the cut cable found, the lug torqued, the fault indicator tagged, and the test results before signing off.",
      why: "The permit's own close-out is the depot's record that tonight's work actually happened the way the plan called for, and a cut cable or a fault indicator found tonight that never makes the record is a hazard the next shift finds out about only by finding it again themselves.",
    },
  ],

  interrupts: [
    {
      id: "driver-tries-to-plug-in",
      kind: "A fleet driver tries to plug into the dispenser mid-service",
      after: "lockout-panel", delay: 2, seconds: 12,
      alert: "A fleet driver has just walked up and is about to plug their van into the dispenser you have locked out.",
      cue: "Stop them now and redirect them to another stall — the torque work waits.",
      target: "stop-driver",
      why: "A driver plugging into a dispenser fed from a panel you have locked out for a reason has no way of knowing this stall is not safe to use tonight, and stopping them before the plug ever makes contact is what keeps a locked-out circuit from being tested by someone who does not know it is locked out.",
      missNote: "The torque work continued while the driver kept approaching the dispenser; they were reaching for the connector before anyone called out to stop them.",
      wrongNote: "Stopping the driver — someone approaching a locked-out dispenser is answered immediately, not after finishing the work already in hand.",
    },
    {
      id: "ground-fault-trips-elsewhere",
      kind: "A ground fault trips on a different panel during the test",
      after: "watch-charge-session", delay: 2, seconds: 14,
      alert: "A ground fault has just tripped a breaker on the depot's second panel while your test charge is still running.",
      cue: "Go isolate the second panel now — the fault indicator check down the row waits.",
      target: "second-panel-marker",
      why: "A ground fault tripping on a live panel elsewhere in the depot needs eyes on it immediately, before it re-closes on its own or someone else tries to reset it blind, and isolating it now is what keeps one fault from becoming two while attention stays on the test already running.",
      missNote: "The row check continued while the second panel sat tripped and unexamined; a co-worker had already started resetting it without knowing why it tripped in the first place.",
      wrongNote: "The second panel — a fault tripping elsewhere is answered by isolating it immediately, not by finishing a check already underway.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, ETE_ACCENT);

    // -------------------------------------------------------------- depot floor
    const pad = box(g, 7.2, 0.06, 5.6, 0, 0.03, 0, 0xffffff, { rough: 0.86 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2f3134", base2: "#26282b", seam: "rgba(0,0,0,0.3)" }), { repeat: 5, px: 512 }), { rough: 0.86, metal: 0.02, color: 0x9aa0a6 });

    // ------------------------------------------------------------------ van
    const van = cargoVan(g, 1.6, 0, -1.6, { ry: 1.6, livery: { colour: 0xdfe4e8, fleetName: "SMARTCITI FLEET", unitNumber: "EV-6" } });
    holoTag(van, "fleet van", 0, 2.5, 0, { css: ETE_CSS, w: 0.24 });

    // -------------------------------------------------------------- dispensers
    const dispenserA = group(g, 0.5, 0, -0.9);
    box(dispenserA, 0.3, 1.2, 0.2, 0, 0.6, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(dispenserA, "dispenser A", 0, 1.4, 0, { css: ETE_CSS, w: 0.28 });
    const cableGood = cyl(dispenserA, 0.02, 0.02, 0.8, -0.2, 0.5, 0.1, 0xd2312b, { rough: 0.5, seg: 8 });
    void cableGood;
    const cutCable = cyl(dispenserA, 0.02, 0.02, 0.8, 0.2, 0.5, 0.1, 0xd2312b, { rough: 0.5, seg: 8 });
    holoTag(dispenserA, "check the cable", 0.2, 0.9, 0.1, { css: "#d2312b", w: 0.32 });
    reg(hits, cutCable, "cut-charge-cable");
    const useDamagedHit = box(g, 0.2, 0.2, 0.2, 0.9, 0.6, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "plug it back in?", 0.9, 0.9, -0.7, { css: "#d2312b", w: 0.4 });
    reg(hits, useDamagedHit, "use-damaged-charge-cable");

    const dispenserB = group(g, 3.4, 0, -0.9);
    box(dispenserB, 0.3, 1.2, 0.2, 0, 0.6, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(dispenserB, "dispenser B", 0, 1.4, 0, { css: ETE_CSS, w: 0.28 });
    const faultLamp = ball(dispenserB, 0.03, 0, 1.1, 0.11, 0xf0645b, { emissive: 0xf0645b, ei: 2.4 });
    reg(hits, faultLamp, "ground-fault-indicator");
    const ignoreFaultHit = box(g, 0.2, 0.2, 0.2, 3.6, 0.9, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep working, skip it?", 3.6, 1.2, -0.7, { css: "#d2312b", w: 0.44 });
    reg(hits, ignoreFaultHit, "ignore-ground-fault-indicator");

    // -------------------------------------------------------------- panel
    const panel = equipmentCabinet(g, 0.8, 1.3, 0.4, -1.2, -1.6, { color: 0xe8b02e, open: 0.9 });
    holoTag(panel, "service panel", 0, 1.6, -1.6, { css: ETE_CSS, w: 0.3 });
    const labelDecal = decal(panel.userData.door, 0.4, 0.55, 0.34 - 0.03, 0, 0.03, (cx, w, h) => {
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a1400"; cx.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`; cx.textAlign = "center";
      cx.fillText("WARNING", w / 2, h * 0.16);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("ARC FLASH", w / 2, h * 0.32);
      cx.fillText("BOUNDARY 4 ft", w / 2, h * 0.44);
      cx.fillText("PPE CAT 2", w / 2, h * 0.56);
    }, { px: 128 });
    reg(hits, labelDecal, "panel-label");
    const testPoints = box(panel, 0.15, 0.1, 0.05, 0, 0.15, 0.03, 0x2b3138, { rough: 0.5, metal: 0.5 });
    reg(hits, testPoints, "test-meter");
    const skipMeterHit = box(g, 0.2, 0.15, 0.2, -1.0, 0.9, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the meter?", -1.0, 1.15, -1.55, { css: "#d2312b", w: 0.4 });
    reg(hits, skipMeterHit, "skip-zero-energy-verify");
    const lock = lockTag(g, -0.85, 1.05, -1.35, { lines: ["PANEL", "LOCKED OUT"] });
    reg(hits, lock, "panel-lockout");
    const energizeNoLockHit = box(g, 0.2, 0.15, 0.2, -1.4, 0.5, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "energise without checking?", -1.4, 0.75, -1.55, { css: "#d2312b", w: 0.48 });
    reg(hits, energizeNoLockHit, "energize-panel-not-locked");
    const lug = box(panel, 0.06, 0.06, 0.04, -0.1, 0.05, 0.03, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    reg(hits, lug, "torque-wrench");

    // ------------------------------------------------------------- module
    const moduleBench = box(g, 0.3, 0.2, 0.2, -2.4, 0.55, 0.6, 0x2b3138, { rough: 0.6 });
    holoTag(moduleBench, "dispenser module", 0, 0.28, 0, { css: ETE_CSS, w: 0.34 });
    reg(hits, moduleBench, "dispenser-module");
    const bracket = box(panel, 0.2, 0.15, 0.1, 0.1, -0.15, 0.03, 0x2b3138, { rough: 0.6 });
    reg(hits, bracket, "dispenser-bracket");
    const chargeMeter = instrument(g, 1.4, 1.0, -0.6, { ry: -0.4, idle: "-- A", color: ETE_ACCENT, w: 0.1, d: 0.16 });
    holoTag(chargeMeter, "charge current", 0, 0.18, 0, { css: ETE_CSS, w: 0.32 });
    reg(hits, chargeMeter, "charge-current-meter");

    // ------------------------------------------------------------- second panel
    const secondPanel = group(g, 3.6, 0, -2.3);
    box(secondPanel, 0.5, 0.9, 0.3, 0, 0.45, 0, 0x3c444c, { rough: 0.5, metal: 0.4 });
    holoTag(secondPanel, "second panel", 0, 1.0, 0, { css: ETE_CSS, w: 0.3 });
    reg(hits, secondPanel, "second-panel-marker");

    // -------------------------------------------------------------- driver
    const driver = standingFigure(g, 2.6, 1.6, { ry: -2.6, cloth: 0x3a5a7a });
    holoTag(driver, "fleet driver", 0, 1.95, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, driver, "stop-driver");

    // -------------------------------------------------------------- tag
    const tag = decal(g, 0.2, 0.24, 0.5, 0.7, -0.5, (cx, w, h) => {
      cx.fillStyle = "#f2e0a0"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a1400"; cx.font = `700 ${Math.round(h * 0.4)}px Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("IN SVC", w / 2, h / 2);
    }, { px: 96 });
    tag.rotation.x = -Math.PI / 2;
    reg(hits, tag, "dispenser-tag");

    // -------------------------------------------------------------- paperwork
    const permit = holoPanel(g, 0.95, 0.66, -3.2, 1.35, -0.4, (cx, w, h) => {
      cx.fillStyle = "#0f1c08"; cx.fillRect(0, 0, w, h); cx.fillStyle = ETE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaffd8"; cx.fillText("ENERGISED WORK PERMIT", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f2ffe6";
      ["Arc-flash boundary: 4 ft", "PPE category 2 required",
        "Dispenser A: down for service", "Prove zero energy before lockout",
        "Torque every lug to spec", "Log every dispenser tested tonight"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.5, accent: ETE_ACCENT });
    reg(hits, permit, "depot-permit");

    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.3, 1.8, (cx, w, h) => {
      cx.fillStyle = "#0f1c08"; cx.fillRect(0, 0, w, h); cx.fillStyle = ETE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaffd8"; cx.fillText("PERMIT CLOSE-OUT", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f2ffe6";
      ["Cable: —", "Torque: —", "Fault: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.9, accent: ETE_ACCENT });
    reg(hits, log, "depot-permit-close");

    // -------------------------------------------------------------- radio & PPE
    const chest = toolChest(g, 2.6, -2.2, { ry: -0.4, color: 0x2b3138 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 13 · DEPOT", color: ETE_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "depot radio", 0, 0.16, 0, { css: ETE_CSS, w: 0.32 });
    reg(hits, radio, "depot-radio");
    const rack = group(g, -3.3, 0, 0.6, 0.3);
    cyl(rack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.4, 0.03, 0.03, 0, 1.15, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const suitProp = group(rack, -0.1, 0.85, 0);
    box(suitProp, 0.22, 0.5, 0.06, 0, 0, 0, 0xe8d23a, { rough: 0.7 });
    holoTag(rack, "arc-rated suit", -0.1, 1.1, 0, { css: ETE_CSS, w: 0.32 });
    reg(hits, suitProp, "arc-suit");
    const shieldProp = group(rack, 0.14, 0.85, 0);
    box(shieldProp, 0.2, 0.24, 0.01, 0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.6, transparent: true });
    holoTag(rack, "face shield", 0.14, 1.05, 0, { css: ETE_CSS, w: 0.28 });
    reg(hits, shieldProp, "face-shield");

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-charge-cable") cutCable.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.6, rough: 0.6 });
        if (step.id === "lockout-panel") lock.material = mat(0x59c97b, { rough: 0.4 });
        if (step.id === "watch-charge-session") repaint(chargeMeter.userData.screen, signFace("PASS", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "find-fault-indicator") faultLamp.visible = true;
        if (step.id === "tag-cleared-dispenser") tag.visible = true;
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ROW CLEARED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        if (step.id === "close-depot-permit") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0f1c08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#eaffd8"; cx.fillText("PERMIT CLOSE-OUT", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Cable: replaced", "Torque: on spec", "Fault: tagged out"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "driver-tries-to-plug-in") driver.position.set(1.6, 0, -1.0);
        if (it.id === "ground-fault-trips-elsewhere") secondPanel.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "driver-tries-to-plug-in") driver.position.set(2.6, 0, 1.6);
        if (it.id === "ground-fault-trips-elsewhere") secondPanel.children[0].material = mat(0x59c97b, { rough: 0.4 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "torque-lug") lug.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify-panel-de-energized") repaint(chargeMeter.userData.screen, signFace(`${(gg.t * 240).toFixed(0)} V`, { bg: "#0d1c24", accent: gg.t <= 0.06 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        if (step?.id === "watch-charge-session" && session.holding) repaint(chargeMeter.userData.screen, signFace(`${Math.round(session.track.v * 100)} A`, { bg: "#0d1c24", accent: session.track.v >= 0.4 && session.track.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        void dt; void t; void CITY;
      },
    };
  },
};

