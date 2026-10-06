import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, gravelFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shotcrete Nozzle & Rebound VR — Cement masons and plasterers,
// station five.
//
// An OPCMIA nozzleman spraying wet-mix shotcrete onto a reinforced retaining
// wall: the placement plan read, the substrate walked for tight rebar
// clearance and a hose coupling with no whip check, the rebound zone cleared,
// the nozzle worked perpendicular and at distance in overlapping passes, the
// build-up thickness tracked, a probe cut to prove it, and the rebound
// shoveled up wet rather than let dry and swept. Mix design, air pressure and
// clearance dimensions are the placement plan's and the equipment manual's,
// never a number this file invents.

const CMSC_ACCENT = 0xf2c14b;
const CMSC_CSS = "#f2c14b";
const CMSC_PAL = palette("construction");

export const SIM_CM_SHOTCRETE_NOZZLE_AND_REBOUND = {
  id: "cm-shotcrete-nozzle-and-rebound",
  index: "704",
  domain: "Construction & Structural Trades",
  trade: "Cement mason — OPCMIA Local 300, shotcrete nozzleman",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; ACI nozzleman certification for shotcrete placement as a body; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction; OSHA 29 CFR 1926.1153 respirable crystalline silica for rebound and cleanup; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; the shotcrete placement plan and the equipment manufacturer's pressure and hose-coupling manual",
  name: "Shotcrete Nozzle & Rebound",
  title: simTitle("Shotcrete Nozzle & Rebound"),
  tagline: "A reinforced wall shot right: the placement plan read, the rebar clearance and the hose coupling walked before the line is charged, the rebound zone cleared, the nozzle worked perpendicular and at distance in overlapping passes, the build tracked and probe-checked, the rebound shoveled up wet, and the panel cured",
  accent: CMSC_ACCENT,
  accentCss: CMSC_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "clean-shot", name: "Clean Shot", note: "A panel shot to thickness with a whip-checked line, nobody in the rebound zone and the rebound shoveled wet — first time" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Shotcrete Crew",
    currency: "PANEL",
    ranks: ["Laborer", "Hose Hand", "Nozzleman Trainee", "Nozzleman", "Shotcrete Crew Certified"],
    badges: [
      { id: "walked-the-wall", name: "Walked The Wall", note: "The pre-shoot walk found the tight rebar and the bare coupling before the line was charged, first time", test: AWARD.stepClean("substrate-walk") },
      { id: "nobody-in-rebound", name: "Nobody In The Rebound Zone", note: "Never sprayed with a bystander in the zone, never a bare-faced overspray, never an unwhipped coupling charged, never a dry sweep of rebound", test: AWARD.safe },
      { id: "on-the-lift", name: "On The Lift", note: "The nozzle distance and the build-up thickness both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-panel", name: "Clean Panel", note: "No corrections through the whole panel", test: AWARD.clean },
      { id: "steady-pass", name: "Steady Pass", note: "The build-up thickness held in band for the whole pass", test: AWARD.unbroken },
      { id: "panel-by-break", name: "Panel By Break", note: "Shot, probed, cleaned and cured inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "overspray-no-shield": "You stood in the overspray without a face shield. Wet shotcrete is strongly alkaline the same as any fresh mix, and standing in the rebound cloud puts it on exposed skin and in the eyes at pressure, not just at rest. The face shield and sleeves stay on for every minute the line is charged.",
    "hose-whip-uncontrolled": "You charged the line with the coupling's whip check not fitted. A shotcrete hose under pressure that comes apart at a coupling becomes a hose whipping loose with the full line pressure behind it, and a whip check is the cable that keeps the two hose ends tethered together if the coupling itself lets go. It is fitted before the line is ever charged, not added after a coupling has already worked loose.",
    "dry-sweep-rebound": "You went to sweep the dried rebound pile instead of shoveling it up wet. Rebound is the same cement and aggregate that just got sprayed, and once it dries, sweeping it throws respirable crystalline silica into the air the same as sweeping any other dried cement debris. It is shoveled while still wet and never allowed to dry into a sweeping job.",
    "bystander-rebound-zone": "You let someone walk into the rebound zone while the nozzle was live. Shotcrete's rebound is aggregate ricocheting off the substrate at the same velocity the mix was sprayed at, and a person standing in that zone is standing in the path of flying stone, not just overspray. The zone is cleared and held clear for the whole time the nozzle is live.",
  },

  lateNotes: {
    "nozzle-trigger": "The nozzle only goes live once the rebar clearance is corrected, the whip check is fitted and the rebound zone is clear — none of that is optional because the line is already staged.",
    "probe-tool": "The probe only goes in once a pass has actually built up — probing a panel that has barely been shot proves nothing but a thin spot.",
    "close-log": "The panel is logged once the rebound has been cleared wet and the cure is on.",
  },

  steps: [
    {
      id: "placement-plan", kind: "select", target: "placement-plan",
      title: "Read the shotcrete placement plan",
      cue: "Read the mix design, the finished thickness, the rebar cover it has to bury, and the nozzle distance and angle the equipment manual calls for.",
      why: "Shotcrete is placed by the nozzleman's technique as much as by the mix itself, and the plan sets the one thickness and rebar cover the wall's design actually depends on — sprayed thin over the rebar, the reinforcing corrodes years early; sprayed at the wrong angle, it builds sand pockets behind the bar instead of encasing it. None of that is adjusted by feel once the pump is running.",
    },
    {
      id: "substrate-walk", kind: "find", noHint: true,
      targets: ["tight-rebar", "no-whip-check", "rebound-zone-open"],
      itemNames: { "tight-rebar": "rebar with no clearance from the substrate", "no-whip-check": "a hose coupling with no whip check fitted", "rebound-zone-open": "the rebound zone with no barrier set" },
      itemNotes: {
        "tight-rebar": "A run of rebar sits flush against the substrate with no chair or clearance block behind it — the shotcrete stream cannot get behind the bar to encase it.",
        "no-whip-check": "The coupling between the delivery hose and the nozzle hose has no whip check cable fitted across it.",
        "rebound-zone-open": "Nothing marks off the rebound zone in front of the wall — a laborer is walking straight through the line the nozzle is about to spray.",
      },
      title: "Walk the substrate before the line is charged",
      cue: "Walk the rebar, the hose couplings and the area in front of the wall, and click every defect you find.",
      why: "With the line still dead, a clearance block, a whip check and a barrier are each a couple of minutes' work. Start the pump before any of that happens and the same three gaps turn into rebar that never gets properly encased, a coupling whipping loose with the full line pressure behind it and nothing tethering the two hose ends, and a laborer standing directly in a stream of ricocheting aggregate.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["set-clearance", "fit-whip-check", "clear-rebound-zone"],
      itemNames: { "set-clearance": "rebar clearance set", "fit-whip-check": "whip check fitted", "clear-rebound-zone": "rebound zone barriered" },
      title: "Correct what the walk found",
      cue: "Set the clearance block behind the tight rebar, fit the whip check on the coupling, and barrier the rebound zone.",
      why: "Spotting a gap on the walk and then leaving it alone is arguably worse than missing it, because the crew now treats the wall and the line as ready on the strength of a note rather than an actual fix. The clearance has to be really set, the whip check really fitted and the zone really barriered before the pump starts, not just written down as done.",
    },
    {
      id: "clear-crew", kind: "select", target: "nozzle-trigger-zone",
      title: "Clear the crew from the panel before the line charges",
      cue: "Move anyone not on the nozzle back from the panel before the pump line is pressurized.",
      why: "A charged shotcrete line delivers mix and rebound at the same velocity the moment the trigger is pulled, and nobody standing close to the panel for a last-minute look has any warning before that happens. The panel is cleared while the line is still dead, which is the only point anyone can be certain of where the crew actually is.",
    },
    {
      id: "pressure-check", kind: "gauge", target: "pressure-gauge",
      title: "Set the nozzle air pressure",
      cue: "Adjust the compressor's air pressure and commit inside the equipment manual's band before the line is charged.",
      why: "Air pressure at the nozzle is what actually atomizes and accelerates the mix into the substrate; too low and the shotcrete just falls off in slugs instead of building a bonded layer, too high and it blows more rebound off the wall than it deposits. The manual's band is set before the trigger is ever pulled, not adjusted by how it sounds once it is spraying.",
      gauge: { label: "PRESSURE", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "too low — falling off in slugs" : t <= 0.6 ? "in the manual's band" : "too high — blowing off rebound"), missNote: "Off the manual's band — adjust the compressor and check the gauge again before charging the line." },
    },
    {
      id: "nozzle-pass", kind: "hold", target: "nozzle-trigger", seconds: 5,
      title: "Spray the first pass perpendicular and at distance",
      cue: "Hold the nozzle perpendicular to the wall at the manual's distance and sweep in overlapping passes, starting at the bottom of the panel.",
      why: "A nozzle held at an angle sprays across the rebar instead of into and behind it, leaving sand pockets exactly where the design needs solid, bonded shotcrete; held too far off the wall, the mix loses velocity and rebounds instead of embedding. Starting at the bottom is what keeps rebound from being trapped behind fresh material sprayed above it.",
      holdBreakNote: "The nozzle drifted off perpendicular and off distance mid-pass. Reset square to the wall at the manual's distance and hold the pass again.",
    },
    {
      id: "buildup-track", kind: "track", target: "nozzle-trigger", seconds: 6,
      title: "Track the build-up thickness across the panel",
      cue: "Keep the sweep rate even so the build-up thickness stays inside the plan's band across the whole panel.",
      why: "Swept too fast, a pass never actually reaches the plan's thickness before the nozzleman has already moved on, leaving a thin panel that reads fine until the rebar corrodes through it; swept too slow, the buildup sags and sloughs off its own weight before it takes its set. An even sweep is what keeps the whole panel at one thickness instead of thick in the middle and thin at the edges.",
      track: { start: 0.15, green: [0.38, 0.58], rise: 0.5, fall: 0.46, drift: 0.12, label: "BUILD-UP", readout: (v) => (v < 0.38 ? "under thickness" : v > 0.58 ? "sagging under its own weight" : "on the plan's thickness") },
      holdBreakNote: "The build-up left the band while the sweep kept going. Slow down over the thin stretch and bring it back into band.",
    },
    {
      id: "probe-check", kind: "gauge", target: "probe-tool",
      title: "Probe-check the panel's thickness",
      cue: "Push the penetration probe into a fresh test area and commit once the depth reads inside the plan's tolerance.",
      why: "A shotcrete surface can look like it has built up plenty and still read thin at the probe, because the eye reads the wettest, glossiest part of the pass rather than the actual depth behind it. The probe is the one check that proves the thickness the plan actually needs, in a test area cut for exactly that purpose.",
      gauge: { label: "THICKNESS", speed: 0.65, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "under the plan's tolerance" : t <= 0.62 ? "on the plan's tolerance" : "over — check the rate of rise"), missNote: "Off tolerance — mark the panel and shoot another pass over the thin area before moving on." },
    },
    {
      id: "cut-finish", kind: "turn", target: "screed-rod",
      title: "Cut the panel flush with the screed rod",
      cue: "Draw the screed rod along the panel's edge guides, cutting the fresh shotcrete to the plan's finished line.",
      why: "The screed rod is what actually gives this panel a finished, plumb edge instead of the rough as-shot surface the nozzle leaves — cut while the material is still plastic, it comes off clean; left until it sets, it has to be ground back, which is a slower, dustier way to reach the same line.",
      turn: { turns: 1, label: "SCREED" },
    },
    {
      id: "rebound-clear", kind: "drag", target: "rebound-shovel",
      title: "Shovel the rebound while it is still wet",
      cue: "Carry the shovel to the rebound pile and clear it into the spoil bin while it is still wet.",
      why: "Rebound is exactly the same cement and aggregate that came off the nozzle, and shoveled while it is still wet it is no different from any other wet spoil to handle. Left to dry, it becomes a pile of hardened cement fines that nobody should be sweeping, which is why it is cleared before it ever gets the chance to set.",
      drag: { to: "spoil-bin", radius: 0.6, missNote: "Not in the spoil bin — the wet rebound has to go into the bin, not left in a pile to dry." },
    },
    {
      id: "cure", kind: "select", target: "cure-compound",
      title: "Apply the cure",
      cue: "Apply the curing method the placement plan calls for across the whole finished panel.",
      why: "A shotcrete panel that is allowed to dry out before it has actually cured loses a real share of the strength the mix design assumed it would reach, and it shrink-cracks across a surface that has almost no depth to spare for a crack to travel through. The cure goes on while the panel is still fresh enough for it to actually work.",
    },
    {
      id: "close-out", kind: "select", target: "close-log",
      title: "Log the panel",
      cue: "Record the clearance corrected, the whip check fitted, the thickness probed and the cure applied.",
      why: "The shotcrete log is how the engineer knows this panel was probed to the plan's tolerance rather than judged by eye, and it is where the tight rebar and the missing whip check get written down so the next panel's walk starts from what this one already found.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the pump operator",
      cue: "Call the pump operator: panel shot, probed and cured. Then check in with the crew about the coupling and the rebound zone.",
      why: "The next panel's mix batch gets timed off whatever this call actually says happened, so the pump operator needs the real account, not the short version. A coupling started separating under pressure and a laborer spent a moment inside the rebound zone — say both plainly, and mention that the OPCMIA member assistance line is there for whoever the shift rattled.",
    },
  ],

  interrupts: [
    {
      id: "coupling-separating",
      kind: "Hose coupling separating under pressure",
      after: "nozzle-pass", delay: 2, seconds: 12,
      alert: "The hose coupling behind the nozzle has started to work apart under line pressure, held only by the whip check cable.",
      cue: "Shut the air off at the compressor before the coupling lets go completely.",
      target: "compressor-shutoff",
      why: "A whip check buys time, it does not fix a coupling that is already separating — the hose is still fully pressurized and will whip hard the instant it clears the last thread. The compressor shutoff kills the pressure driving the whip at its source, which is the only way to make the line safe to approach again.",
      missNote: "The coupling kept working loose with the line still charged; it let go fully a moment later and the whip check cable was the only thing that kept the hose end from crossing the crew.",
      wrongNote: "The compressor shutoff — a coupling already separating under pressure needs the air killed at the source, not watched.",
    },
    {
      id: "laborer-in-rebound",
      kind: "Laborer walking into a live rebound zone",
      after: "buildup-track", delay: 2, seconds: 12,
      alert: "A laborer has stepped past the barrier into the rebound zone while the nozzle is still live on the panel.",
      cue: "Sound the stop-spray horn before he takes another step forward.",
      target: "stop-spray-horn",
      why: "Rebound off a live nozzle is aggregate ricocheting at spray velocity, and a laborer inside that zone is standing in its path whether or not he can see the nozzle from where he is. The horn signals the nozzleman to kill the trigger immediately, which reaches him faster than shouting over a running compressor.",
      missNote: "The laborer kept walking through the rebound zone with the nozzle still live; a face shield he was not wearing would have been the only thing between him and the ricochet.",
      wrongNote: "The stop-spray horn — a person is already inside a live rebound zone, and the nozzle has to be killed before he goes any further.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMSC_ACCENT);
    const ground = box(g, 8.6, 0.04, 6.6, 0, 0.02, -0.3, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8f8b80", tone2: "#838075" }), { repeat: 4, px: 512 }), { rough: 0.95, color: 0xd8d3c4 });

    // ------------------------------------------------------------- the wall and rebar cage
    const wall = group(g, 0, 0.02, -2.4);
    const substrate = box(wall, 6.0, 2.8, 0.15, 0, 1.4, 0, 0x6b6d6a, { rough: 0.9 });
    void substrate;
    const rebarCage = group(wall, 0, 0.02, 0.1);
    const bars = [];
    for (let i = -4; i <= 4; i++) { const b = cyl(rebarCage, 0.012, 0.012, 2.6, i * 0.65, 1.4, 0, 0x7a5c3a, { rough: 0.9, seg: 6 }); bars.push(b); }
    for (let j = 0; j < 4; j++) { const b = cyl(rebarCage, 0.012, 0.012, 6.0, 0, 0.4 + j * 0.7, 0, 0x7a5c3a, { rough: 0.9, seg: 6 }); b.rotation.z = Math.PI / 2; bars.push(b); }
    const tightBar = bars[2];
    const tightRebarHit = box(rebarCage, 0.3, 0.6, 0.15, -2.6, 1.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tightRebarHit, "tight-rebar");
    holoTag(rebarCage, "no clearance behind the bar", -2.6, 1.4, 0, { css: CMSC_CSS, w: 0.4 });
    const clearanceSupply = group(wall, -2.6, 0.02, 0.4, 0.2);
    box(clearanceSupply, 0.1, 0.1, 0.06, 0, 0.05, 0, CMSC_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(clearanceSupply, "set clearance block", 0, 0.22, 0, { css: CMSC_CSS, w: 0.32 });
    reg(hits, clearanceSupply, "set-clearance");

    const shotTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#8b877c", tone2: "#7d7970" }), { repeat: 3, px: 512 }), { rough: 0.85, color: 0xdbd6c8 });
    const shotLayer = box(wall, 5.9, 2.7, 0.05, 0, 1.4, 0.12, 0xffffff);
    shotLayer.material = shotTex;
    shotLayer.scale.y = 0.02;
    shotLayer.visible = false;
    const nozzleHit = box(wall, 6.0, 2.8, 0.5, 0, 1.4, 0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["nozzle-trigger-zone"] = nozzleHit;
    const oversprayHit = box(wall, 6.0, 1.0, 0.6, 0, 2.4, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(wall, "stand in the overspray?", 0, 2.9, 0.3, { css: "#d2312b", w: 0.42 });
    reg(hits, oversprayHit, "overspray-no-shield");
    const screedRod = box(wall, 6.1, 0.03, 0.05, 0, 2.75, 0.2, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(wall, "screed rod", 0, 2.9, 0.2, { css: CMSC_CSS, w: 0.22 });
    reg(hits, screedRod, "screed-rod");

    // ------------------------------------------------------------- pump, compressor, hose, nozzle
    const pump = group(g, 3.4, 0.02, 1.8, -0.4);
    box(pump, 1.4, 0.9, 1.0, 0, 0.55, 0, 0x53606b, { rough: 0.6, metal: 0.3 });
    holoTag(pump, "shotcrete pump", 0, 1.15, 0, { css: CMSC_CSS, w: 0.3 });
    const compressor = group(g, 4.4, 0.02, 1.4, -0.2);
    box(compressor, 1.0, 0.7, 0.8, 0, 0.4, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    const compGauge = instrument(compressor, 0.4, 0.6, 0.3, { idle: "--", color: CMSC_CSS, w: 0.14, d: 0.2 });
    holoTag(compressor, "pressure gauge", 0.4, 0.85, 0.3, { css: CMSC_CSS, w: 0.28 });
    reg(hits, compGauge, "pressure-gauge");
    const shutoff = box(compressor, 0.1, 0.14, 0.06, -0.4, 0.6, 0.3, 0xd2312b, { rough: 0.5, metal: 0.3 });
    holoTag(compressor, "compressor shutoff", -0.4, 0.78, 0.3, { css: CMSC_CSS, w: 0.32 });
    reg(hits, shutoff, "compressor-shutoff");

    const deliveryHose = hose(g, [[3.9, 0.9, 1.8], [2.4, 0.9, 0.4], [0.6, 1.2, -1.4], [0, 1.4, -2.0]], 0.07, 0x3a4550, { steps: 20, rough: 0.7 });
    void deliveryHose;
    const coupling = group(g, 1.2, 0.02, -0.6, 0.4);
    cyl(coupling, 0.1, 0.1, 0.2, 0, 1.0, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 12 });
    const whipCable = cyl(coupling, 0.006, 0.006, 0.3, 0.15, 1.0, 0, 0xd2312b, { rough: 0.6, seg: 6 });
    whipCable.rotation.z = Math.PI / 2;
    whipCable.visible = false;
    reg(hits, coupling, "no-whip-check");
    holoTag(coupling, "hose coupling — no whip check", 0, 1.3, 0, { css: CMSC_CSS, w: 0.42 });
    const whipSupply = group(g, 1.6, 0.02, -0.4, 0.2);
    cyl(whipSupply, 0.006, 0.006, 0.2, 0, 0.2, 0, 0xd2312b, { rough: 0.6, seg: 6 });
    holoTag(whipSupply, "fit the whip check", 0, 0.34, 0, { css: CMSC_CSS, w: 0.32 });
    reg(hits, whipSupply, "fit-whip-check");
    const nozzle = group(g, 0.2, 0.02, -1.3, 0.1);
    cyl(nozzle, 0.05, 0.06, 0.5, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, seg: 12 });
    const nozzleTip = cyl(nozzle, 0.02, 0.04, 0.15, 0, 1.4, 0, 0xdfe6ec, { rough: 0.4, metal: 0.6, seg: 12 });
    void nozzleTip;
    reg(hits, nozzle, "nozzle-trigger");
    holoTag(nozzle, "nozzle trigger", 0, 1.55, 0, { css: CMSC_CSS, w: 0.24 });
    const spray = particles(g, 70, 0xb9b4a8, { size: 0.03, life: 0.5, additive: false, opacity: 0.7 });

    // ------------------------------------------------------------- rebound, spoil, probe
    const reboundPile = group(g, -2.0, 0.02, -1.6, 0.2);
    const reboundMesh = reboundPile;
    box(reboundMesh, 0.8, 0.16, 0.6, 0, 0.08, 0, 0xffffff);
    reboundMesh.children[0].material = texturedMat(surfaceTexture((cx, w, h) => gravelFace(cx, w, h, { base: "#6b665c", base2: "#5e5a51" }), { repeat: 2, px: 256 }), { rough: 0.95, color: 0xd8d3c4 });
    reg(hits, reboundMesh, "rebound-shovel");
    holoTag(reboundMesh, "wet rebound pile", 0, 0.36, 0, { css: CMSC_CSS, w: 0.3 });
    const dryHit = box(g, 0.8, 0.2, 0.6, -2.0, 0.3, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sweep it dry?", -2.0, 0.56, -1.6, { css: "#d2312b", w: 0.32 });
    reg(hits, dryHit, "dry-sweep-rebound");
    const spoilBin = box(g, 1.0, 0.6, 0.8, -3.4, 0.3, -1.4, 0x2b2f34, { rough: 0.7 });
    hits["spoil-bin"] = spoilBin;
    holoTag(g, "spoil bin", -3.4, 0.66, -1.4, { css: CMSC_CSS, w: 0.24 });

    const probe = group(g, 1.6, 0.02, -1.9, 0.2);
    cyl(probe, 0.015, 0.015, 0.4, 0, 0.2, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(probe, "penetration probe", 0, 0.44, 0, { css: CMSC_CSS, w: 0.3 });
    reg(hits, probe, "probe-tool");

    // ------------------------------------------------------------- rebound zone barrier, laborer, cure
    const zoneHit = box(g, 3.4, 0.06, 1.6, 0, 0.06, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "rebound zone — walk through?", -1.0, 0.3, -1.1, { css: "#d2312b", w: 0.4 });
    reg(hits, zoneHit, "bystander-rebound-zone");
    const noBarrierHit = box(g, 3.2, 0.05, 1.4, 0, 0.03, -1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "rebound zone — no barrier set", 1.2, 0.3, -1.1, { css: CMSC_CSS, w: 0.44 });
    reg(hits, noBarrierHit, "rebound-zone-open");
    const chargeWithoutWhipHit = box(g, 0.3, 0.3, 0.3, 1.2, 1.3, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "charge the line without the whip check?", 1.2, 1.6, -0.6, { css: "#d2312b", w: 0.52 });
    reg(hits, chargeWithoutWhipHit, "hose-whip-uncontrolled");
    const zoneBarrier = group(g, 1.7, 0.02, -0.8, 0.3);
    for (const x of [-0.6, 0.6]) cyl(zoneBarrier, 0.02, 0.025, 0.9, x, 0.45, 0, 0xe4622a, { rough: 0.7, seg: 8 });
    zoneBarrier.visible = false;
    const barrierSupply = group(g, 2.1, 0.02, -0.5, 0.2);
    cyl(barrierSupply, 0.02, 0.025, 0.6, 0, 0.3, 0, 0xe4622a, { rough: 0.7, seg: 8 });
    holoTag(barrierSupply, "barrier the rebound zone", 0, 0.62, 0, { css: CMSC_CSS, w: 0.4 });
    reg(hits, barrierSupply, "clear-rebound-zone");
    const laborer = standingFigure(g, -0.8, -1.0, { ry: 1.6, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    laborer.visible = false;
    const laborerElapsedRef = { v: 0 };
    const horn = group(g, 4.6, 0.02, 0.6, 0.2);
    box(horn, 0.1, 0.14, 0.06, 0, 0.9, 0, 0x2b2f34, { rough: 0.6 });
    const hornLight = ball(horn, 0.03, 0, 0.99, 0.03, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.4, rough: 0.4 });
    hornLight.material = hornLight.material.clone();
    holoTag(horn, "stop-spray horn", 0, 1.16, 0, { css: CMSC_CSS, w: 0.32 });
    reg(hits, horn, "stop-spray-horn");
    const cureSprayer = group(g, -2.8, 0.02, -0.3, 0.2);
    cyl(cureSprayer, 0.13, 0.13, 0.48, 0, 0.26, 0, 0x59c97b, { rough: 0.6, seg: 12 });
    holoTag(cureSprayer, "cure application", 0, 0.56, 0, { css: CMSC_CSS, w: 0.32 });
    reg(hits, cureSprayer, "cure-compound");

    // ------------------------------------------------------------- cards, log, radio, crew
    const board = group(g, 3.2, 0.02, -2.6, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMSC_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("PLACEMENT PLAN — WALL PANEL 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Mix and thickness: per the placement plan", "Rebar cover: per the design drawing", "Nozzle distance and angle: per the manual", "Cure: per the placement plan"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMSC_ACCENT });
    reg(hits, board, "placement-plan");

    const log = group(g, 4.0, 0.02, -2.6, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("SHOTCRETE LOG —\nPANEL 2", { bg: "#171108", accent: CMSC_CSS, fg: "#efeade", scale: 0.28 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "shotcrete log", 0, 1.62, 0, { css: CMSC_CSS, w: 0.24 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, 4.6, 0.02, -2.8, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMSC_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMSC_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const nozzleman = standingFigure(g, 0.6, -0.9, { ry: 2.6, cloth: 0x4a4038, vest: CMSC_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(nozzleman, "nozzleman", 0, 1.9, 0, { css: CMSC_CSS, w: 0.24 });
    for (const [x, z] of [[3.8, 2.6], [-3.6, -2.4]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // A stack of dry-mix bags and a spare-parts rack — ordinary storage a
    // shotcrete crew keeps clear of the working area.
    const yard = group(g, -3.4, 0.02, 2.4, 0.3);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) box(yard, 0.3, 0.1, 0.2, -0.6 + c * 0.32, 0.06 + r * 0.11, 0, r % 2 ? 0xc9b27a : 0xb8a06a, { rough: 0.9 });
    const partsRack = group(g, 4.4, 0.02, 2.4, -0.3);
    box(partsRack, 0.7, 0.05, 0.35, 0, 0.9, 0, CMSC_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) cyl(partsRack, 0.02, 0.02, 0.55, -0.28 + i * 0.14, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const offcutPile = group(g, 4.0, 0.02, 0.4, 0.2);
    for (let i = 0; i < 7; i++) cyl(offcutPile, 0.012, 0.012, 0.5 + (i % 3) * 0.1, -0.28 + i * 0.08, 0.06, 0, 0x7a5c3a, { rough: 0.9, seg: 6 }).rotation.z = Math.PI / 2;

    let spraying = false, fill = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.4, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { tightBar.position.z += 0.06; whipCable.visible = true; zoneBarrier.visible = true; }
        if (step.id === "nozzle-pass") spraying = false;
        if (step.id === "cure") { /* cure marker */ }
        if (step.id === "close-out") repaint(log.userData.face, signFace("SHOTCRETE LOG —\nPROBED + CURED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.24 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("PANEL 2 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "coupling-separating") { whipCable.material = whipCable.material.clone(); whipCable.material.color.set(0xff5a3c); }
        if (it.id === "laborer-in-rebound") { laborer.visible = true; laborerElapsedRef.v = 0; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "coupling-separating") whipCable.material.color.set(0xd2312b);
        if (it.id === "laborer-in-rebound") laborer.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && (step?.id === "pressure-check" || step?.id === "probe-check")) repaint(compGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#22201a", accent: "#f2ae14", fg: "#f7f4ec", scale: 0.6 }));
        if (step?.id === "nozzle-pass" && session.holding) { spraying = true; fill = Math.min(1, fill + dt / 6); spray.visible = true; spray.userData.step(dt, new THREE.Vector3(0.2, 1.5, -1.3), 0.12, 0.5, -2.8); }
        else if (step?.id === "buildup-track" && session.holding) { spraying = true; spray.visible = true; spray.userData.step(dt, new THREE.Vector3(0.2, 1.5, -1.3), 0.12, 0.5, -2.8); }
        else if (spray.visible) { spray.visible = false; spraying = false; }
        if (spraying) { shotLayer.visible = true; shotLayer.scale.y = Math.min(1, shotLayer.scale.y + dt / 10); }
        if (session?.turn && step?.id === "cut-finish") screedRod.position.z = 0.2 - session.turn.amount * 0.04;
        if (session?.activeInterrupt?.id === "laborer-in-rebound") { laborerElapsedRef.v += dt; laborer.position.x = -0.8 + Math.min(1, laborerElapsedRef.v / 8) * 1.0; }
        void CITY;
      },
    };
  },
};
