import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, lockTag, cylinderTank, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Water Heater & TPR Valve Replacement VR — Building Systems &
// Facilities, UA plumbers and pipefitters.
//
// A water heater is a sealed tank of near-boiling water with nowhere to
// expand, and the temperature-and-pressure relief valve is the one part on
// the whole appliance whose entire job is knowing when that has stopped
// being true. A valve rated for the wrong tank, a discharge pipe that traps
// what the valve is trying to release, or a tank never strapped to the wall
// it can fall away from in an earthquake all turn the same appliance into
// the same failure: a pressure vessel with no way to relieve itself. None
// of that shows up on a walkthrough. It shows up the one day something
// upstream fails and the tank finds out whether its own safety devices were
// actually installed to do their job.

const WHT_ACCENT = 0x4fb87a;

export const SIM_PL_WATER_HEATER_AND_TPR_VALVE_REPLACEMENT = {
  id: "pl-water-heater-and-tpr-valve-replacement",
  index: "pl-07",
  domain: "Building Systems & Facilities",
  trade: "UA plumber / water heater installer",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "UA plumbers and pipefitters apprenticeship; the Uniform Plumbing Code (UPC) for water heater installation, seismic strapping and relief valve discharge piping; the ASME Boiler and Pressure Vessel Code for the relief valve's rating; 29 CFR 1910.147 the control of hazardous energy; 8 CCR 3203 injury and illness prevention",
  name: "Water Heater & TPR Valve Replacement",
  title: simTitle("Water Heater & TPR Valve Replacement"),
  tagline: "The old tank isolated and drained, a new heater strapped against a seismic event before it is ever filled, the TPR valve matched to the tank's own rating with its discharge piped where it can actually do its job, and the gas connection tested before the pilot ever lights",
  accent: WHT_ACCENT,
  accentCss: "#4fb87a",
  parSeconds: 275,
  footprint: 2.2,
  badge: { id: "tank-proven", name: "Tank Proven", note: "A water heater installed, strapped, relief-valved to its own rating and gas-tested before the pilot ever lit" },

  game: system({
    name: "Pressure Vessel Authority",
    currency: "BTU",
    ranks: ["Apprentice", "Journeyman", "Plumber", "Lead Plumber", "Water Heater Certified"],
    badges: [
      { id: "drained-before-cut", name: "Drained Before Cut", note: "The old tank was isolated and fully drained before disconnection", test: AWARD.stepClean("drain-hold") },
      { id: "never-unrelieved", name: "Never Unrelieved", note: "The tank was never filled or fired with an unproven relief valve", test: AWARD.safe },
      { id: "steady-fill", name: "Steady Fill", note: "Held the fill and warm-up inside the band the whole watch", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-install", name: "Clean Install", note: "No corrections anywhere in the install", test: AWARD.clean },
      { id: "unbroken-drain", name: "Unbroken Drain", note: "The drain ran to empty without a break", test: AWARD.unbroken },
      { id: "tank-live-fast", name: "Tank Live Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-strap": "You called the install finished without securing the seismic straps. An unstrapped tank in an earthquake does not just fall over — it can pull its own gas or water connections apart on the way down, turning a toppled appliance into a fuel leak or a flood in the same motion.",
    "wrong-tpr-rating": "You fitted a relief valve rated for a different tank than the one it is sitting on. A relief valve's whole job is opening before this specific tank's pressure and temperature limits are exceeded, and one rated for a different appliance can sit closed well past the point where this tank actually needed it to act.",
    "discharge-piped-wrong": "You piped the relief valve's discharge into a dead end instead of somewhere open. A relief valve that is actually relieving pressure into a capped or undersized pipe is not relieving anything — the discharge has nowhere to go, and the valve might as well not be there.",
    "light-before-purge": "You lit the burner before purging air out of the new gas line. Air in the line means the flame can go out and reignite unpredictably as gas finally reaches the burner behind a pocket of air, which is exactly the kind of delayed ignition that flashes back at whoever is standing in front of the access panel.",
  },

  lateNotes: {
    "new-heater": "The new tank goes onto its pad once the old one is fully isolated and drained, not staged into position as the first move.",
    "tpr-valve": "The relief valve goes on after the tank is strapped down, not before — a tank that can topple is not ready for its final fittings yet.",
    "pilot-igniter": "The pilot only lights after the gas connection has been tested and purged of air, never as the very next thing after the valve opens.",
  },

  // Two things that happen to a plumber whose hands are on a wrench or an
  // igniter and whose eyes are on a gauge. See shared/game.js.
  interrupts: [
    {
      id: "co-detector-chirps",
      kind: "The hallway CO detector chirps during startup",
      // Armed on entering the pilot hold step, so the window lands right at
      // first ignition — answered at the detector, not the burner controls.
      after: "pilot", delay: 2, seconds: 11,
      alert: "The hallway carbon monoxide detector just chirped a low-battery or fault tone right as this burner lit for the first time.",
      cue: "That detector needs checking before this startup goes any further — a faulted CO detector is the wrong moment for a new gas appliance to be running unmonitored.",
      target: "co-detector",
      why: "A CO detector faulting the exact moment a gas appliance is first fired is the kind of coincidence that is easy to wave off and expensive to be wrong about — checking it now, while the burner is still being watched directly, is what keeps a genuinely faulted detector from being the only warning system covering this space for the rest of the day.",
      missNote: "The detector kept chirping while the startup carried on unchecked. Whatever that fault actually was, nobody looked at it before walking away.",
      wrongNote: "It is the hallway detector. The burner itself was never what just made that sound.",
    },
    {
      id: "gas-smell-report",
      kind: "Someone reports smelling gas elsewhere in the building",
      // Armed during the gas leak test, answered at the building's own
      // main gas shutoff rather than at the test gauge on this new joint.
      after: "gas-test", delay: 3, seconds: 12,
      alert: "Someone just came through the door saying they smell gas near the kitchen, on the other side of the building from this closet.",
      cue: "That report outranks finishing this leak test — go check the building's own gas shutoff before you commit another reading here.",
      target: "building-gas-shutoff",
      why: "A gas smell reported from a completely different part of the building is not something this specific joint's leak test can explain or rule out, and the person reporting it has no way to know that the smell they noticed and the work happening in this closet are unrelated — checking the building's main shutoff is what actually answers their report instead of leaving it hanging while a different, unrelated test finishes.",
      missNote: "The report went unanswered while the leak test on this new joint carried on. Whatever that person smelled by the kitchen, nobody went to check it.",
      wrongNote: "It is the building's main gas shutoff. This joint's own leak test cannot speak to a smell reported somewhere else entirely.",
    },
  ],

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the work order and heater spec",
      cue: "Check the work order: tank capacity, fuel type, and the relief valve rating this heater requires.",
      why: "The relief valve's own rating has to match this specific tank's maximum working pressure and temperature, and that number comes from the heater's spec plate and the work order, not from whatever valve happens to already be on the shelf.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["close-fuel-elec", "close-cold-inlet", "open-relief-tap"],
      itemNames: { "close-fuel-elec": "gas or power isolated", "close-cold-inlet": "cold inlet closed", "open-relief-tap": "a hot tap opened to relieve pressure" },
      title: "Isolate the old heater",
      cue: "Shut off the gas or the breaker, close the cold water inlet, then open a hot tap to relieve any pressure.",
      why: "The old tank is still capable of holding pressure and heat even with the fuel off, and opening a hot tap before disconnecting anything is what lets that residual pressure vent through a fixture instead of through the first fitting a wrench loosens.",
      outOfOrderNote: "Fuel or power first, then the cold inlet, then the relief tap — venting pressure before the inlet is closed just refills what was just vented.",
    },
    {
      id: "drain-hold", kind: "hold", target: "drain-valve", seconds: 6,
      title: "Drain the old tank fully",
      cue: "Hold the drain valve open until the tank reads empty.",
      why: "A tank that is only partly drained is still heavy enough to be unsafe to disconnect and manoeuvre, and a plumber who calls it drained on a guess rather than a reading finds out the difference the moment the old tank is tipped to come off its pad.",
      holdBreakNote: "The drain closed before the tank was actually empty — hold it open again, a partly full tank is not ready to move yet.",
    },
    {
      id: "inspect-old", kind: "find", noHint: true,
      targets: ["corroded-nipple", "no-expansion-tank"],
      itemNames: { "corroded-nipple": "corroded dielectric nipple", "no-expansion-tank": "missing thermal expansion tank" },
      itemNotes: {
        "corroded-nipple": "The old dielectric nipple has corroded through — reusing it on the new heater just carries the same slow failure over to a brand-new tank.",
        "no-expansion-tank": "There is no thermal expansion tank on this closed system, which means the new heater is going to be the only thing absorbing the pressure rise every time it heats a full tank of cold water.",
      },
      title: "Inspect the old connections before disconnecting",
      cue: "Look over what the old heater was actually connected to before anything comes apart.",
      why: "A corroded fitting and a missing expansion tank are both things the new installation needs to fix, not just work around, and finding them now — while the old heater is still in place to show exactly what it was dealing with — is easier than discovering either one after the new tank is already plumbed in.",
    },
    {
      id: "position-heater", kind: "drag", target: "new-heater",
      title: "Bring the new heater onto its pad",
      cue: "Drag the new heater onto the pad now the old one is disconnected and clear.",
      why: "The new tank goes onto a pad that is already clear and level, because setting a full-sized water heater down and then discovering the pad needs adjusting means moving several hundred pounds of appliance twice instead of once.",
      drag: { to: "heater-pad", radius: 0.45, missNote: "Not seated on the pad — a heater set down off its pad is not sitting on the strapping this closet is built around." },
    },
    {
      id: "strap", kind: "sequence",
      targets: ["strap-upper", "strap-lower"],
      itemNames: { "strap-upper": "upper seismic strap secured", "strap-lower": "lower seismic strap secured" },
      title: "Secure the seismic straps",
      cue: "Secure the upper strap, then the lower strap, both anchored to the framing.",
      why: "Two straps at different heights are what keep a tall, top-heavy tank from rocking and tearing at its own connections in an earthquake — a single strap, or one anchored to something other than the framing, gives the tank a pivot point instead of taking away its ability to move at all.",
      outOfOrderNote: "Upper strap first, then lower — the upper strap is what stops the tank from toppling while the lower one is still being fitted.",
    },
    {
      id: "select-tpr", kind: "select", target: "tpr-valve-board",
      title: "Match the relief valve to this tank",
      cue: "Check the relief valve board against this heater's spec plate before selecting a valve.",
      why: "The relief valve has to be rated at or below this tank's actual maximum working pressure and temperature, and the board is what confirms the valve in hand is rated for this appliance specifically, not just sized to fit the same thread.",
    },
    {
      id: "fit-tpr", kind: "drag", target: "tpr-valve",
      title: "Install the relief valve",
      cue: "Drag the matched relief valve into the tank's relief port now the tank is strapped.",
      why: "The relief valve is the last thing this tank needs before it can safely hold pressure at all, and fitting it only after the tank is already strapped down means it never has to go on — or come off again — while the tank could still shift.",
      drag: { to: "tpr-port", radius: 0.4, missNote: "Not seated in the relief port — a valve that is not fully threaded home will not seal, and a leaking relief valve is not a working one." },
    },
    {
      id: "discharge-pipe", kind: "sequence",
      targets: ["full-size-pipe", "no-shutoff-valve", "terminate-near-floor"],
      itemNames: { "full-size-pipe": "discharge run full size, no reduction", "no-shutoff-valve": "no valve anywhere in the discharge run", "terminate-near-floor": "terminated near the floor, open to view" },
      title: "Run the relief valve's discharge piping",
      cue: "Run the discharge full size with no valve in it, and terminate it near the floor where it can be seen.",
      why: "Every one of these three rules exists to keep the discharge path from ever becoming the reason the valve fails to protect the tank: a reduced pipe restricts flow exactly when full flow matters most, any valve in the run can be closed by someone who does not know what it is, and a termination anyone can see is a termination someone will actually notice if it ever discharges.",
      outOfOrderNote: "Size, then no valve, then the termination point — each rule is checked as the run is built, in the order it is built.",
    },
    {
      id: "gas-test", kind: "gauge", target: "gas-test-gauge",
      title: "Leak-test the new gas connection",
      cue: "Bring the test pressure up per the code and the drawing, then commit once it holds.",
      why: "A gas joint that will not hold a test pressure has a connection that is not sealed, and finding that now, before the burner is ever lit, is the difference between a wrench and a torch test versus a service call chasing the smell of gas after the appliance is already in use.",
      gauge: { label: "GAS TEST", speed: 0.65, green: [0.55, 0.75], readout: (t) => `${Math.round(t * 100)}% of test value`, missNote: "Did not hold — there is a joint on this gas connection that needs to be found and remade before anything gets lit." },
    },
    {
      id: "purge-gas", kind: "turn", target: "gas-cock",
      title: "Open the gas cock and purge the line",
      cue: "Open the gas cock slowly and purge the line of air before attempting ignition.",
      why: "Air sitting in a newly connected gas line delays real gas from reaching the burner, and lighting into that delay is how a flame goes out and reignites unpredictably a moment later — purging the air out first is what makes the first ignition attempt behave the way every one after it will.",
      turn: { turns: 0.75, axis: "y", label: "GAS COCK" },
    },
    {
      id: "pilot", kind: "hold", target: "pilot-igniter", seconds: 5,
      title: "Light the pilot per the manufacturer's manual",
      cue: "Hold the igniter per the manufacturer's manual until the pilot proves and stays lit.",
      why: "A pilot that lights and then drops out the instant the igniter is released has not actually proven itself — holding it for the full sequence the manufacturer's manual specifies is what lets the thermocouple or flame sensor actually prove a stable flame before the gas valve is trusted to stay open on its own.",
      holdBreakNote: "The igniter released before the pilot proved — hold it again for the full sequence, a flame that drops out this early has not proven anything.",
    },
    {
      id: "fill-watch", kind: "track", target: "fill-gauge", seconds: 8,
      title: "Fill the tank and watch the relief valve",
      cue: "Keep the fill rate steady while the tank fills and comes up to temperature, watching for any weep at the relief valve.",
      why: "A relief valve that weeps as soon as the tank starts building normal pressure was either fitted wrong or is defective, and catching that during the very first fill — while every connection is still open and easy to reach — is the last easy chance to fix it before the closet is closed up and called finished.",
      track: { start: 0.3, green: [0.35, 0.6], rise: 0.08, fall: 0.2, drift: 0.12, label: "FILL / WARM-UP", readout: (v) => (v < 0.35 ? "filling slowly" : v > 0.6 ? "pressure rising fast — watch the relief valve" : "filling steadily") },
      holdBreakNote: "That fill ran outside the band — ease back and watch the relief valve closely before continuing.",
    },
    {
      id: "walk-closet", kind: "find",
      targets: ["blocked-combustion-air", "vent-slope-wrong"],
      itemNames: { "blocked-combustion-air": "blocked combustion air opening", "vent-slope-wrong": "vent pipe sloped the wrong way" },
      itemNotes: {
        "blocked-combustion-air": "Someone has stacked boxes in front of the combustion air opening — a gas appliance starved of combustion air burns dirty and can pull its own exhaust back into the room.",
        "vent-slope-wrong": "This section of vent pipe slopes back toward the heater instead of up and away — condensate is going to run the wrong direction and pool exactly where it should not.",
      },
      title: "Walk the closet before calling the job finished",
      cue: "Walk the space around the new heater and check what is easy to miss once the tank itself looks done.",
      why: "A blocked combustion air opening and a vent sloped the wrong way both let a correctly installed heater fail anyway, from causes that have nothing to do with the tank itself — walking the closet is what catches a problem in the room instead of assuming the appliance is the whole story.",
    },
    {
      id: "startup", kind: "select", target: "startup-checklist",
      title: "Complete the startup checklist",
      cue: "Fill in the startup checklist with the relief valve rating, the gas test result, and the strap check.",
      why: "The startup checklist is what turns this installation into a record the next plumber, the next inspector, or an insurance adjuster after an incident can actually check against — a completed install with nothing written down is a claim with nothing behind it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, WHT_ACCENT);

    const floorTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#cfc9c2"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, (i / 6) * h); ctx.lineTo(w, (i / 6) * h); ctx.stroke(); }
    }, { repeat: 4 });
    box(g, 5.0, 0.08, 4.2, 0, 0.04, 0, 0xffffff, { rough: 0.6 }).material = texturedMat(floorTex, { color: 0xcfc9c2, rough: 0.6 });

    const wallTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#e9e4da"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(150,140,120,0.15)";
      for (let i = 0; i < 30; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }, { repeat: 2 });
    box(g, 5.0, 2.6, 0.12, 0, 1.4, -1.9, 0xffffff, { rough: 0.85 }).material = texturedMat(wallTex, { color: 0xe9e4da, rough: 0.85 });
    box(g, 5.0, 0.14, 0.3, 0, 2.65, -1.9, 0x99a2a8, { rough: 0.8 });

    // Old heater, being removed, on its way out.
    const oldHeaterGroup = group(g, -1.7, 0, -1.5, 0.3);
    cyl(oldHeaterGroup, 0.32, 0.32, 1.2, 0, 0.62, 0, 0x8a939b, { rough: 0.5, metal: 0.3, seg: 20 });
    const drainValve = cyl(oldHeaterGroup, 0.02, 0.02, 0.08, 0.3, 0.1, 0.15, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(oldHeaterGroup, "drain valve", 0.3, 0.28, 0.15, { css: "#4fb87a", w: 0.28 });
    reg(hits, drainValve, "drain-valve");
    const fuelSwitch = box(oldHeaterGroup, 0.08, 0.1, 0.03, -0.32, 0.5, 0.28, 0x2b3138, { rough: 0.5, metal: 0.4 });
    holoTag(oldHeaterGroup, "gas / power isolation", -0.32, 0.65, 0.28, { css: "#4fb87a", w: 0.5 });
    reg(hits, fuelSwitch, "close-fuel-elec");
    const coldInlet = valveWheel(oldHeaterGroup, 0, 1.3, 0.2, { color: 0x4fd1ff, body: 0x2b2f34, r: 0.06 });
    holoTag(oldHeaterGroup, "cold inlet", 0, 1.5, 0.2, { css: "#4fb87a", w: 0.3 });
    reg(hits, coldInlet, "close-cold-inlet");
    const relTap = box(oldHeaterGroup, 0.06, 0.1, 0.04, 0.32, 1.1, 0.2, 0xdfe6ec, { rough: 0.5 });
    holoTag(oldHeaterGroup, "relief tap", 0.32, 1.3, 0.2, { css: "#4fb87a", w: 0.28 });
    reg(hits, relTap, "open-relief-tap");
    const badNipple = cyl(oldHeaterGroup, 0.018, 0.018, 0.1, 0, 1.22, 0, 0x6a5540, { rough: 0.6, metal: 0.4, seg: 10 });
    reg(hits, badNipple, "corroded-nipple");
    const noExpansion = box(g, 0.2, 0.2, 0.2, -2.2, 1.6, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "no expansion tank here", -2.2, 1.82, -1.2, { css: "#d2312b", w: 0.5 });
    reg(hits, noExpansion, "no-expansion-tank");

    // Heater pad, new heater staged, straps.
    const pad = box(g, 0.7, 0.06, 0.7, 0.4, 0.03, -1.3, 0x8a8f95, { rough: 0.8 });
    void pad;
    hits["heater-pad"] = pad;
    const newHeater = group(g, 1.8, 0, -0.4, -0.3);
    const tankTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#eef3f5"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      for (let i = 0; i < 8; i++) ctx.fillRect(0, (i / 8) * h, w, 1);
    }, { repeat: 1 });
    const tankBody = cyl(newHeater, 0.33, 0.33, 1.25, 0, 0.63, 0, 0xffffff, { rough: 0.4, seg: 22 });
    tankBody.material = texturedMat(tankTex, { color: 0xeef3f5, rough: 0.4 });
    holoTag(newHeater, "new water heater", 0, 1.45, 0, { css: "#4fb87a", w: 0.4 });
    reg(hits, newHeater, "new-heater");

    const strapUpper = group(g, 0.4, 1.1, -1.3);
    box(strapUpper, 0.7, 0.03, 0.02, 0, 0, 0.34, 0xf2c14b, { rough: 0.5, cast: false });
    reg(hits, strapUpper, "strap-upper");
    const strapLower = group(g, 0.4, 0.5, -1.3);
    box(strapLower, 0.7, 0.03, 0.02, 0, 0, 0.34, 0xf2c14b, { rough: 0.5, cast: false });
    reg(hits, strapLower, "strap-lower");
    const skipStrapTarget = box(g, 0.2, 0.2, 0.2, 0.4, 1.7, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call it done without straps?", 0.4, 1.92, -1.5, { css: "#d2312b", w: 0.58 });
    reg(hits, skipStrapTarget, "skip-strap");

    // TPR valve board, valve, and the port on the new heater.
    const tprBoard = decal(g, 0.34, 0.42, -0.6, 1.3, -1.85, paperFace("RELIEF VALVE BOARD", ["Tank rating per spec plate", "Match psi and degF exactly", "Never substitute by thread size alone"], { scale: 0.78 }));
    holoTag(g, "TPR valve board", -0.6, 1.58, -1.85, { css: "#4fb87a", w: 0.4 });
    reg(hits, tprBoard, "tpr-valve-board");
    const tprValve = group(g, 2.4, 0.9, 0.2, -0.4);
    cyl(tprValve, 0.05, 0.05, 0.14, 0, 0, 0, 0xd8232a, { rough: 0.5, metal: 0.4, seg: 14 });
    box(tprValve, 0.06, 0.02, 0.02, 0.06, 0.05, 0, 0x2b3138, { rough: 0.5 });
    holoTag(tprValve, "TPR valve", 0, 0.18, 0, { css: "#4fb87a", w: 0.3 });
    reg(hits, tprValve, "tpr-valve");
    const wrongTprTarget = box(g, 0.2, 0.2, 0.2, 2.4, 1.3, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "close enough on the rating?", 2.4, 1.52, 0.2, { css: "#d2312b", w: 0.5 });
    reg(hits, wrongTprTarget, "wrong-tpr-rating");
    const tprPort = group(newHeater, 0, 1.0, 0.3);
    hits["tpr-port"] = tprPort;

    // Discharge piping.
    const discharge = group(g, 1.8, 0.1, -0.05, 0.4);
    const dischargePipe = cyl(discharge, 0.025, 0.025, 0.9, 0, 0.5, 0, 0x8a939b, { rough: 0.45, metal: 0.6, seg: 12 });
    void dischargePipe;
    reg(hits, discharge, "full-size-pipe");
    const noValveCheck = box(discharge, 0.14, 0.14, 0.14, 0.2, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noValveCheck, "no-shutoff-valve");
    const terminationPt = cyl(discharge, 0.03, 0.03, 0.02, 0, 0.06, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 12 });
    reg(hits, terminationPt, "terminate-near-floor");
    const wrongDischargeTarget = box(g, 0.2, 0.2, 0.2, 1.8, 0.9, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just cap it off?", 1.8, 1.12, -0.05, { css: "#d2312b", w: 0.4 });
    reg(hits, wrongDischargeTarget, "discharge-piped-wrong");

    // Gas train: test gauge, cock, pilot igniter.
    const gasTrain = group(g, -0.4, 0.5, -1.3, 0.3);
    const gasGauge = instrument(gasTrain, 0, 0.5, 0, { idle: "-- % test", color: 0x2b2f34, w: 0.15, d: 0.18 });
    holoTag(gasTrain, "gas test gauge", 0, 0.7, 0, { css: "#4fb87a", w: 0.34 });
    reg(hits, gasGauge, "gas-test-gauge");
    const gasCock = valveWheel(gasTrain, 0.25, 0.2, 0, { color: 0xd8232a, body: 0x2b2f34, r: 0.06 });
    holoTag(gasTrain, "gas cock", 0.25, 0.4, 0, { css: "#4fb87a", w: 0.24 });
    reg(hits, gasCock, "gas-cock");
    const pilotIgniter = box(gasTrain, 0.05, 0.05, 0.02, -0.2, 0.08, 0.1, 0xf2c14b, { rough: 0.5 });
    holoTag(gasTrain, "pilot igniter", -0.2, 0.22, 0.1, { css: "#4fb87a", w: 0.3 });
    reg(hits, pilotIgniter, "pilot-igniter");
    const pilotFlame = particles(gasTrain, 8, 0xff8800, { size: 0.02, life: 0.4, additive: true, opacity: 0.7 });
    pilotFlame.position.set(-0.2, 0.05, 0.15);
    pilotFlame.visible = false;
    const earlyIgniteTarget = box(g, 0.18, 0.18, 0.18, -0.65, 0.7, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "light it before the purge?", -0.65, 0.92, -1.3, { css: "#d2312b", w: 0.5 });
    reg(hits, earlyIgniteTarget, "light-before-purge");

    const fillGauge = instrument(newHeater, 0.36, 1.0, 0, { idle: "-- psi / degF", color: 0x2b2f34, w: 0.16, d: 0.18, ry: 0.5 });
    holoTag(newHeater, "fill gauge", 0.36, 1.2, 0, { css: "#4fb87a", w: 0.36 });
    reg(hits, fillGauge, "fill-gauge");

    // CO detector and the building's own gas shutoff.
    const codetector = group(g, 2.1, 2.3, -1.85);
    cyl(codetector, 0.08, 0.08, 0.03, 0, 0, 0, 0xf4f7f8, { rough: 0.4, seg: 14 });
    const codetLight = ball(codetector, 0.012, 0, -0.02, 0.05, 0x3a3f44, { emissive: 0x000000, ei: 0 });
    holoTag(codetector, "CO detector", 0, -0.14, 0, { css: "#4fb87a", w: 0.3 });
    reg(hits, codetLight, "co-detector");

    const bldgShutoff = group(g, -2.2, 0.1, 1.5, 0.3);
    box(bldgShutoff, 0.3, 0.4, 0.14, 0, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const bldgValve = valveWheel(bldgShutoff, 0, 0.42, 0.1, { color: 0xd8232a, body: 0x2b2f34, r: 0.08 });
    holoTag(bldgShutoff, "building gas shutoff", 0, 0.66, 0.1, { css: "#4fb87a", w: 0.5 });
    reg(hits, bldgValve, "building-gas-shutoff");

    // Combustion air and vent for the walk-round.
    const combAir = group(g, -1.9, 0.9, -1.85);
    box(combAir, 0.3, 0.3, 0.05, 0, 0, 0, 0x2b2f34, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    reg(hits, combAir, "blocked-combustion-air");
    const combBoxes = group(g, -1.9, 0, -1.6);
    for (let i = 0; i < 2; i++) box(combBoxes, 0.3, 0.24, 0.3, i * 0.3 - 0.15, 0.12, 0, 0xb8834a, { rough: 0.8 });
    const ventPipe = cyl(g, 0.06, 0.06, 0.8, 2.0, 2.2, -1.5, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 14 });
    ventPipe.rotation.x = 0.3;
    reg(hits, ventPipe, "vent-slope-wrong");

    // Bench: work order, startup checklist.
    const bench = group(g, -1.9, 0.1, 0.9);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const workOrder = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("WORK ORDER", ["Tank: 50 gal, gas", "Relief valve: per spec plate", "Seismic straps required", "Discharge per UPC"], { scale: 0.8 }));
    workOrder.rotation.x = -Math.PI / 2;
    holoTag(bench, "work order", -0.35, 0.98, 0, { css: "#4fb87a", w: 0.3 });
    reg(hits, workOrder, "work-order");
    const startupPaper = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("STARTUP CHECKLIST", ["Relief valve rating ______", "Gas test: pass / fail", "Straps: upper / lower ok"], { scale: 0.85 }));
    startupPaper.rotation.x = -Math.PI / 2;
    holoTag(bench, "startup checklist", 0.35, 0.98, 0.05, { css: "#4fb87a", w: 0.4 });
    reg(hits, startupPaper, "startup-checklist");

    const boardPanel = group(g, 2.1, 0, 1.8, -0.5);
    holoPanel(boardPanel, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0a2418"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fb87a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcf7e6"; ctx.fillText("WATER HEATER — CLOSET 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eafff2";
      ["Drain the old tank fully before disconnecting", "Strap upper and lower before the relief valve goes on", "Match the relief valve to this tank's own rating", "Full size, no valve, terminate near the floor", "Purge air before the pilot ever lights"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.12)));
    }, { accent: WHT_ACCENT });

    const plumber = standingFigure(g, 0.4, 1.9, { ry: 3.0, cloth: 0x3a7a5f });
    holoTag(plumber, "plumber", 0, 1.9, 0, { css: "#4fb87a", w: 0.28 });
    toolChest(g, 2.4, 1.5);
    // The old heater's cold and hot nipples staged for the swap, and a
    // shelf of spare fittings above the bench.
    for (const dz of [-0.06, 0.06]) {
      const nip = cyl(newHeater, 0.018, 0.018, 0.12, dz * 2.2, 1.28, 0, 0xb8402f, { rough: 0.5, metal: 0.5, seg: 12 });
      void nip;
    }
    const shelf = box(g, 0.9, 0.03, 0.2, -1.9, 1.0, 1.15, 0x8a8f95, { rough: 0.7, metal: 0.3 });
    void shelf;
    for (let i = 0; i < 5; i++) {
      const part = torus(g, 0.03, 0.01, -2.15 + i * 0.1, 1.05, 1.15, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8, seg2: 12 });
      part.rotation.x = Math.PI / 2;
    }
    for (const [x, z] of [[2.3, -2.0], [-2.4, -2.0]]) cone(g, x, z);

    let filling = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.2, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "drain-hold") repaint(gasGauge.userData.screen, signFace("EMPTY", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "inspect-old") { badNipple.visible = false; }
        if (step.id === "position-heater") { newHeater.position.set(0.4, 0, -1.3); newHeater.rotation.y = 0; }
        if (step.id === "fit-tpr") { tprValve.position.set(0.4, 0.9, -1.0); tprValve.rotation.y = 0; }
        if (step.id === "gas-test") repaint(gasGauge.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "pilot") pilotFlame.visible = true;
        if (step.id === "fill-watch") filling = true;
        if (step.id === "walk-closet") combBoxes.visible = false;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "co-detector-chirps") codetLight.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 2.2 });
        if (it.id === "gas-smell-report") bldgValve.userData.wheel.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "co-detector-chirps") codetLight.material = mat(0x3a3f44, { emissive: 0x000000, ei: 0 });
        if (it.id === "gas-smell-report") bldgValve.userData.wheel.material = mat(0xd8232a, { rough: 0.6 });
      },
      animate(t, dt, session) {
        if (pilotFlame.visible) pilotFlame.userData.step(dt, new THREE.Vector3(0, 0.3, 0), 0.02, 0.15, -0.1);
        if (filling) fillGauge.rotation.y = Math.sin(t * 0.2) * 0.005;
        if (session?.turn && session.step?.id === "purge-gas") gasCock.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
