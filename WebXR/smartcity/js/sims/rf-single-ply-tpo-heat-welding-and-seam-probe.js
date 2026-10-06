import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, concreteFace, blockFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Single-Ply TPO Heat Welding & Seam Probe VR — Construction &
// Structural Trades, the Roofers and Waterproofers pack.
//
// A mechanically-attached TPO roof mid-install: insulation boards fastened
// down, the first courses of white membrane rolled and plated at the
// perimeter, and the hot-air welder staged at the next seam. The learner is
// the roofer welding and probing that seam while the crew keeps fastening the
// sheet behind them. A generic building and a generic crew; no manufacturer
// or contractor is named.

const TPOH_PAL = palette("construction");
const TPOH_ACCENT = TPOH_PAL.accent;
const TPOH_CSS = "#f2c14b";

export const SIM_RF_SINGLE_PLY_TPO_HEAT_WELDING_AND_SEAM_PROBE = {
  id: "rf-single-ply-tpo-heat-welding-and-seam-probe",
  index: "rf2",
  domain: "Construction & Structural Trades",
  trade: "Roofer heat-welding a mechanically-attached TPO membrane and probing every seam before it is signed off",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection at the roof edge and around the open hatch, and 29 CFR 1926 Subpart M Fall protection generally; ANSI Z359 for the harness and anchor; 29 CFR 1926.1153 for any cutting or grinding dust nearby; NRCA single-ply installation and wind-uplift practice; Roofers Local 40 apprenticeship and training",
  name: "Single-Ply TPO Heat Welding & Seam Probe",
  title: simTitle("Single-Ply TPO Heat Welding & Seam Probe"),
  tagline: "The fastening plan read, harness clipped, the welder and a staged sheet inspected, the welder's nozzle brought to temperature, a sheet dragged out and fastened to the wind-uplift pattern, the seam welded at a steady pace and probed clean, the primer capped, scrap hauled off, the perimeter checked and the day logged, with a gust testing an unfinished edge and fumes pooling behind the parapet along the way",
  accent: TPOH_ACCENT,
  accentCss: TPOH_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "seam-probed-clean", name: "Seam Probed Clean", note: "Every seam probed fused, the perimeter fastened to the wind-uplift pattern, and nobody caught a lungful of fumes doing it" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Probe Line",
    currency: "FUSE",
    ranks: ["Apprentice", "Welder Hand", "Seam Prober", "Lead Mechanic", "Wind-Uplift Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The fastening plan read before the first plate was driven", test: AWARD.stepClean("fastening-plan") },
      { id: "steady-weld", name: "Steady Weld", note: "The welder swept the whole seam without a break in pace", test: AWARD.unbroken },
      { id: "no-lungful", name: "No Lungful", note: "No hand at the hot nozzle, no open primer can, no unfastened edge left for the wind", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "fully-fused", name: "Fully Fused", note: "The seam probe committed inside the fused band first time", test: AWARD.precise(0.7) },
      { id: "sheet-closed", name: "Sheet Closed", note: "Log written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "open-hatch-no-guard": "The roof hatch beside the weld path is standing open with its guardrail gate unlatched. 29 CFR 1926.501 treats an open hatch as a hole to be guarded the whole time it is open, and a roofer walking backward while feeding the welder's cord is exactly the person who finds an unguarded hole by stepping into it, not by looking for it first.",
    "hot-nozzle-clear": "You reached toward the welder's nozzle to clear a scrap of jammed membrane while it was still powered on. The nozzle runs at a temperature high enough to fuse thermoplastic sheet in seconds, and a bare hand finds that out the same way the membrane does — instantly and without warning, which is why the welder is switched off and set down before anyone's fingers go near the tip.",
    "primer-can-open": "The seam primer's can is sitting open behind the parapet, in the one corner of the roof the wind does not reach. Its solvent vapour is heavier than air and has nowhere to go in that dead pocket, so it pools instead of dispersing — exactly the low-ventilation condition the primer's own label warns keeps its cap on except while it is actually being brushed onto a seam.",
    "loose-perimeter-sheet": "The last row of fastening plates along this sheet's perimeter has not been driven yet, and the sheet is already flapping at the free edge. A single-ply roof holds against wind uplift only where it is actually fastened to the pattern the manufacturer's wind-uplift rating assumes — a sheet plated everywhere except the edge is a sheet with nothing stopping the wind from getting underneath it and peeling the whole course.",
  },

  lateNotes: {
    "seam-probe": "The probe reads the seam once the welder has actually passed over it and it has had a moment to cool — there is nothing fused yet before that.",
    "primer-can": "The cap goes back on right after the primer is brushed on, not held open in reserve for the next seam.",
    "log-board": "The log is written once the perimeter has been walked and checked, not before.",
  },

  steps: [
    {
      id: "fastening-plan", kind: "select", target: "plan-board",
      title: "Read the fastening plan and wind-uplift pattern",
      cue: "Read the plan: the fastener spacing at the field, the perimeter and the corners, and the wind-uplift rating it is built to.",
      why: "A mechanically-attached single-ply roof only performs to its wind-uplift rating where the fasteners are actually placed on the pattern the engineering behind that rating assumes — tighter at the perimeter and corners than in the field, per the manufacturer's plan. Skipping the plan and fastening from habit is how a roof that was rated for the building's wind zone fails at a corner nobody reinforced.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the perimeter.",
      why: "This roof has an open hatch and an unguarded perimeter in the same work area, and 29 CFR 1926.502 makes the anchor, harness and connection one rated system rather than three pieces of gear worn out of habit. Snugged before it is clipped, because a loose harness slides under load exactly where it should not.",
    },
    {
      id: "welder-inspect", kind: "find", noHint: true,
      targets: ["welder-cord-frayed", "membrane-tear"],
      itemNames: { "welder-cord-frayed": "a frayed patch on the welder's power cord", "membrane-tear": "a tear in a staged membrane sheet" },
      itemNotes: {
        "welder-cord-frayed": "The cord's insulation is worn through to bare copper a hand's width from the strain relief — flexed hot near a nozzle running at welding temperature, that is a shock and a burn waiting on the same fault.",
        "membrane-tear": "A staged sheet has a puncture near its edge from a dropped tool. Welded over without a patch, that tear is a leak path the membrane's whole warranty depends on nobody rolling out.",
      },
      title: "Inspect the welder and the staged sheet before starting",
      cue: "Check the welder's cord and nozzle, and look over the next staged sheet for tears or punctures before it is rolled out.",
      why: "The welder runs hundreds of degrees at its nozzle and pulls real current to get there, so its cord is inspected before every plug-in the same way a harness is inspected before every use. A torn sheet is cheaper to catch on the stack than to find as a leak call a year after it is welded into the field.",
    },
    {
      id: "welder-temp", kind: "gauge", target: "welder-temp",
      title: "Bring the welder's nozzle to temperature",
      cue: "Read the welder's nozzle temperature and commit once it sits in the manufacturer's working band for this membrane.",
      why: "A nozzle run too cool never fuses the sheets into one membrane — it lays a bead on top that peels the first time it is tested; run too hot, it scorches through the top ply instead of welding it. The manufacturer's temperature band is what the machine was built to weld this thickness of TPO at.",
      gauge: {
        label: "WELDER NOZZLE — TEMPERATURE", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => `${Math.round(900 + t * 500)} °F`,
        missNote: "Off the manufacturer's welding band. Let it settle and read it again before the nozzle touches the seam.",
      },
    },
    {
      id: "sheet-layout", kind: "drag", target: "membrane-sheet",
      title: "Roll the next sheet out to the layout line",
      cue: "Carry the next TPO sheet from the stack and roll it out flat to the chalked layout line over the insulation.",
      why: "The layout line marks the overlap the fastening plan is built around; short of it and the seam has nothing to weld, long past it and the pattern underneath drifts off its marks course by course. The sheet is carried flat rather than dragged across the insulation boards, because a dragged sheet picks up grit that keeps the weld from ever fusing clean.",
      drag: { to: "layout-line", radius: 0.55, missNote: "Not on the layout line. Carry the sheet all the way out to the chalk mark before letting it lie flat." },
    },
    {
      id: "fastener-drive", kind: "turn", target: "fastener-driver",
      title: "Drive the perimeter plate to the pattern",
      cue: "Set the plate on its mark and drive the fastener until it seats flush — not proud, not sunk through the facer.",
      why: "A plate driven proud tents the membrane welded over it and becomes the first place a foot finds a soft spot; a fastener sunk through the insulation's facer loses its pull-out strength exactly where the wind-uplift rating needs it most. Flush and on the plan's mark is the only setting that gives the pattern its rated holding power.",
      turn: { turns: 0.5, axis: "z", label: "FASTENER DRIVER", readout: (t) => (t < 0.4 ? "backed out" : t > 0.85 ? "overdriven" : "seated flush") },
    },
    {
      id: "weld-pass", kind: "track", target: "welder-nozzle", seconds: 6,
      title: "Sweep the welder along the seam at a steady pace",
      cue: "Hold the nozzle and trailing roller moving at a steady pace along the seam — too slow scorches the sheet, too fast leaves it unfused.",
      why: "The nozzle melts both sheets to a running edge for the roller right behind it to press together, and that only happens inside a narrow speed window: held still, the top ply scorches through before the weld is even made; swept too fast, the roller presses two sheets that never got hot enough to become one. The steady middle pace is what the manufacturer's welding guide calls a sound seam.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "WELDER SWEEP SPEED", readout: (v) => (v < 0.4 ? "too slow — scorching" : v > 0.62 ? "too fast — unfused" : "fusing clean") },
      holdBreakNote: "The sweep broke out of the steady band. Bring the nozzle back to a steady pace along the seam before it cools past welding temperature.",
    },
    {
      id: "seam-probe", kind: "gauge", target: "seam-probe",
      title: "Probe the cooled seam for a continuous weld",
      cue: "Drag the blunt probe along the whole seam and commit the reading once it stays in the fully-fused band end to end.",
      why: "A probe dropping into a gap the eye cannot see is how a roofer finds the one span of seam that never actually fused, before the membrane finds it for them during the next storm. NRCA's quality-control practice has every seam probed after it cools, and a probe that catches anywhere means that stretch gets re-welded, not signed off.",
      gauge: {
        label: "SEAM PROBE — RESISTANCE", speed: 0.55, green: [0.42, 0.62],
        readout: (t) => (t < 0.42 ? "catches — void" : t > 0.62 ? "skates — overheated" : "fully fused"),
        missNote: "The probe caught a gap or skated over a scorched patch. Re-weld that stretch of seam before probing it again.",
      },
    },
    {
      id: "primer-cap", kind: "select", target: "primer-can",
      title: "Cap the seam primer right after use",
      cue: "Brush the primer onto the detail seam, then cap the can immediately rather than leaving it open for the next one.",
      why: "The primer's solvent is what makes it dangerous to leave open — it keeps evaporating whether anyone is using it or not, and a can left open behind a parapet fills a dead-air corner with vapour nobody is watching. Capped between uses, it only ever off-gasses while it is actually being brushed on.",
    },
    {
      id: "seam-cure", kind: "hold", target: "seam-cure", seconds: 4,
      title: "Hold the roller on the fresh patch while it cures",
      cue: "Press the hand roller onto the freshly welded patch and hold it there until the manufacturer's cure time has passed.",
      why: "A weld is fully bonded once it has cooled and set, and stepping onto it before then can peel the very seam that was just probed clean. Holding the roller down for the manufacturer's cure time is the cheap way to make sure the next boot on that patch is standing on a finished seam rather than a warm one.",
      holdBreakNote: "The roller came off before the cure time was up — hold it down a little longer before anyone walks that patch.",
    },
    {
      id: "scrap-haul", kind: "drag", target: "scrap-bag",
      title: "Haul the trim scrap to the debris chute",
      cue: "Drag the bag of membrane trim and backer scrap to the chute rather than leaving it loose on the deck.",
      why: "Loose trim scrap on a finished membrane is exactly what tears the next sheet dragged over it, and blown scrap off an open roof is a falling-object hazard for anyone below. The chute takes it off the roof the same day it is cut, not at the end of the job.",
      drag: { to: "chute-socket", radius: 0.55, missNote: "Not in the chute. Drag the scrap bag all the way to the chute before letting go." },
    },
    {
      id: "perimeter-check", kind: "find", noHint: true,
      targets: ["fastener-row", "perimeter-sheet"],
      itemNames: { "fastener-row": "the perimeter fastener row counted against the plan", "perimeter-sheet": "the stretch of edge that is still unfastened" },
      itemNotes: {
        "fastener-row": "Counted plate by plate against the wind-uplift pattern's spacing, this run is one short of the plan — the gap will not show up as a leak, only as the one spot a gust finds a purchase months from now.",
        "perimeter-sheet": "This stretch of perimeter still has bare membrane past its last plate — the sheet the earlier gust already tried to get under, now confirmed and ready for its last few fasteners.",
      },
      title: "Walk the perimeter and find what the plan says should already be closed",
      cue: "Walk the finished perimeter against the fastening plan: count the plate row and find the stretch of edge that is still unfastened.",
      why: "A roof that is fastened everywhere except one forgotten stretch of edge is a roof the wind will find that one stretch on, and the walk-round at the end of the day — plate row counted, every stretch of edge looked at — is the last chance to catch a skipped fastener or an unfinished sheet before the crew is gone and the first real gust arrives overnight.",
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log the course, the finds and the fastener count",
      cue: "Write the frayed cord replaced, the torn sheet swapped, the seam probes clean, and the fastener row confirmed into the log.",
      why: "The next roofer on this course inherits whatever the log says rather than what actually happened, so the finds that do not show up in the finished membrane — a cord replaced, a sheet swapped before it was welded in — are exactly the things worth writing down while they are still fresh.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the crew fastening behind you",
      cue: "Radio the crew laying sheet behind you: the course is welded and probed, the perimeter is fastened, and name the support line.",
      why: "A welding crew and a fastening crew are working the same course a few feet apart, and a short check-in is what keeps the fastening crew from covering a seam that has not actually been probed yet, or welding started on a sheet that is not fully plated down.",
    },
  ],

  interrupts: [
    {
      id: "wind-lifts-perimeter",
      kind: "Gust off the parapet",
      after: "weld-pass", delay: 2, seconds: 14,
      alert: "A gust catches the unfastened stretch of perimeter sheet, and it starts lifting off the deck from the free edge inward.",
      cue: "Grab the fastener driver and get the remaining plates in before the wind gets further under the sheet.",
      target: "fastener-driver",
      why: "A single-ply sheet is only as secure as its last driven fastener, and the moment between rolling a sheet out and finishing its perimeter row is exactly when a gust can find the free edge and start peeling — which is why NRCA's practice is to fasten a sheet's perimeter before moving on rather than leaving it for the end of the day.",
      missNote: "The gust kept working under the sheet until it folded back on itself, dragging grit into the underside that keeps it from ever lying flat again.",
      wrongNote: "That does not hold a lifting sheet down. Get the fastener driver on the remaining plates before the wind gets any further under it.",
    },
    {
      id: "fumes-behind-parapet",
      kind: "Laborer feeling dizzy",
      after: "sheet-layout", delay: 3, seconds: 14,
      alert: "The laborer stacking scrap behind the parapet radios that their head is swimming and their eyes are stinging.",
      cue: "Cap the open primer can pooling fumes in that dead-air corner and get the laborer moved upwind.",
      target: "primer-can",
      why: "Solvent vapour in a still corner behind a parapet does not disperse the way it would in open air, and a worker who has been breathing it for a while feels the effect before anyone watching from a few feet away notices anything at all. Capping the can stops it adding to the pool; moving the laborer gets them out of what is already there.",
      missNote: "The can stayed open and the laborer kept working in the pooled fumes until the headache was bad enough to call it in on the radio themselves.",
      wrongNote: "Not that. Cap the primer can that is filling that corner with fumes, and get the laborer clear of it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, TPOH_ACCENT);

    // ------------------------------------------------------------ roof deck: TPO over insulation, parapet
    const tpoTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#d6dadb", tone2: "#c9cdcf" }), { repeat: 3, px: 384 });
    const deck = box(g, 6.4, 0.24, 5.6, 0, 0.12, 0, 0xffffff);
    deck.material = texturedMat(tpoTex, { rough: 0.55, metal: 0.05, color: 0xe8ebec });
    deck.receiveShadow = true;
    const isoTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a08a5e", tone2: "#93805699" }), { repeat: 2, px: 256 });
    const insulation = box(g, 2.6, 0.02, 5.6, 2.2, 0.251, 0, 0xffffff);
    insulation.material = texturedMat(isoTex, { rough: 0.85, metal: 0.02, color: 0xc7b487 });
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.6, pd, px, 0.54, pz, 0xffffff);
      wall.material = texturedMat(surfaceTexture((cx, w, h) => blockFace(cx, w, h, { block: 0x8f918b }), { repeat: 2, px: 256 }), { rough: 0.85, metal: 0.02, color: 0xc0c2be });
      box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.87, pz, 0x8b949d, { rough: 0.5, metal: 0.5 });
    }

    // The layout line for the next sheet.
    const layoutMark = box(g, 3.0, 0.012, 0.8, 2.2, 0.252, 0.5, 0xd8c88a, { opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "layout line", 2.2, 0.4, 0.5, { css: TPOH_CSS, w: 0.22 });
    reg(hits, layoutMark, "layout-line");

    // ------------------------------------------------------------ hatch, unguarded
    const hatch = group(g, -1.9, 0.24, 1.8);
    box(hatch, 0.9, 0.3, 0.9, 0, 0.15, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    box(hatch, 0.7, 0.02, 0.7, 0, 0.31, 0, 0x0a0b0d, { rough: 1.0 });
    const gate = group(hatch, 0.55, 0, 0);
    box(gate, 0.04, 0.04, 1.1, 0, 1.1, 0, TPOH_PAL.trim, { rough: 0.5 });
    box(gate, 0.04, 0.04, 1.1, 0, 0.6, 0, TPOH_PAL.trim, { rough: 0.5 });
    gate.rotation.y = 1.1;
    holoTag(hatch, "open hatch — gate latched?", 0, 0.9, 0.3, { css: "#d2312b", w: 0.5 });
    reg(hits, gate, "open-hatch-no-guard");

    // ------------------------------------------------------------ welder cart, staged sheets
    const cart = group(g, 1.5, 0.24, 1.5, 0.4);
    box(cart, 0.4, 0.05, 0.5, 0, 0.03, 0, TPOH_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (const [sx, sz] of [[-0.15, -0.2], [0.15, -0.2], [-0.15, 0.2], [0.15, 0.2]]) cyl(cart, 0.04, 0.04, 0.03, sx, 0.02, sz, 0x1b1e22, { rough: 0.7, seg: 12 });
    const welderBody = box(cart, 0.3, 0.28, 0.24, 0, 0.2, 0, TPOH_PAL.structure, { rough: 0.5, metal: 0.4 });
    void welderBody;
    const cordBad = hose(cart, [[-0.1, 0.18, 0.1], [-0.3, 0.1, 0.25], [-0.5, 0.05, 0.3]], 0.012, 0x2b2b30, { steps: 10, rough: 0.7 });
    const frayed = box(cart, 0.03, 0.02, 0.02, -0.3, 0.1, 0.25, 0xc0c6cc, { rough: 0.5, metal: 0.6 });
    reg(hits, frayed, "welder-cord-frayed");
    void cordBad;
    const tempFace = decal(cart, 0.12, 0.06, 0, 0.4, 0.12, signFace("-- °F", { bg: "#0d1c24", accent: TPOH_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 160 });
    holoTag(cart, "welder temperature", 0, 0.5, 0, { css: TPOH_CSS, w: 0.34 });
    reg(hits, tempFace, "welder-temp");

    const wand = group(g, 1.9, 0.3, 0.6, -0.6);
    cyl(wand, 0.02, 0.025, 0.4, 0, 0.02, 0, 0x8a8f95, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    cyl(wand, 0.045, 0.05, 0.14, 0, 0.02, -0.24, 0x2b2b30, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(wand, "welder nozzle", 0, 0.14, 0, { css: TPOH_CSS, w: 0.26 });
    reg(hits, wand, "welder-nozzle");
    const nozzleTipHit = box(wand, 0.06, 0.06, 0.06, 0, 0.02, -0.24, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(wand, "clear the hot nozzle by hand?", 0, 0.3, -0.24, { css: "#d2312b", w: 0.5 });
    reg(hits, nozzleTipHit, "hot-nozzle-clear");
    const seamBead = box(g, 1.5, 0.015, 0.1, 2.2, 0.253, 0.62, 0xd8dadb, { rough: 0.4, metal: 0.1 });
    seamBead.visible = false;

    const rollStack = group(g, 2.6, 0.24, -1.6);
    for (let i = 0; i < 2; i++) {
      const roll = cyl(rollStack, 0.16, 0.16, 1.0, i * 0.34, 0.16, 0, 0xe4e8e9, { rough: 0.6, seg: 16 });
      roll.rotation.z = Math.PI / 2;
    }
    holoTag(rollStack, "TPO sheet stack", 0.17, 0.45, 0, { css: TPOH_CSS, w: 0.32 });
    reg(hits, rollStack, "membrane-sheet");
    const tear = box(rollStack, 0.04, 0.02, 0.06, -0.2, 0.32, 0, 0x8a4a2a, { rough: 0.9 });
    reg(hits, tear, "membrane-tear");
    const looseSheet = group(g, 2.2, 0.253, 0.5);
    box(looseSheet, 3.0, 0.012, 0.8, 0, 0, 0, 0xe4e8e9, { rough: 0.55 });
    looseSheet.visible = false;

    // Fastener driver, plate row.
    const driver = group(g, 1.6, 0.3, 0.62, 0.5);
    cyl(driver, 0.03, 0.035, 0.3, 0, 0.02, 0, TPOH_PAL.accent, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    box(driver, 0.08, 0.1, 0.06, 0, 0.02, -0.16, 0x2b2b30, { rough: 0.5 });
    holoTag(driver, "fastener driver", 0, 0.2, 0, { css: TPOH_CSS, w: 0.3 });
    reg(hits, driver, "fastener-driver");
    const plateRow = group(g, 3.0, 0.253, 0.4);
    for (let i = 0; i < 11; i++) cyl(plateRow, 0.02, 0.02, 0.006, i * 0.14 - 0.7, 0.004, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(plateRow, "perimeter fastener row", 0, 0.2, 0, { css: TPOH_CSS, w: 0.4 });
    reg(hits, plateRow, "fastener-row");
    // Insulation board stack staged for the next section of deck.
    const boardStack = group(g, -0.6, 0.24, -2.1);
    for (let i = 0; i < 6; i++) box(boardStack, 1.2, 0.05, 0.8, 0, 0.03 + i * 0.055, 0, 0xc7b487, { rough: 0.85 });
    holoTag(boardStack, "insulation boards, staged", 0, 0.45, 0, { css: TPOH_CSS, w: 0.4 });

    // The seam probe.
    const probe = group(g, 1.2, 0.24, 0.9, 0.3);
    cyl(probe, 0.012, 0.012, 0.3, 0, 0.03, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    box(probe, 0.05, 0.06, 0.04, 0, 0.03, -0.17, 0x2b3138, { rough: 0.5 });
    holoTag(probe, "seam probe", 0, 0.16, 0, { css: TPOH_CSS, w: 0.24 });
    reg(hits, probe, "seam-probe");
    const roller = group(g, -0.4, 0.24, 0.62, 0.5);
    cyl(roller, 0.05, 0.05, 0.3, 0, 0.05, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    box(roller, 0.02, 0.36, 0.02, 0, 0.28, 0, 0x8a7048, { rough: 0.7 });
    holoTag(roller, "hand roller", 0, 0.5, 0, { css: TPOH_CSS, w: 0.22 });
    reg(hits, roller, "seam-cure");

    // Perimeter loose sheet (wind hazard) and scrap.
    const perim = group(g, 3.15, 0.253, -1.6);
    box(perim, 0.5, 0.012, 1.6, 0, 0, 0, 0xe4e8e9, { rough: 0.55 });
    holoTag(perim, "loose perimeter edge?", 0, 0.3, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, perim, "loose-perimeter-sheet");
    const perimHit = box(g, 0.6, 0.4, 1.8, 3.15, 0.4, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, perimHit, "perimeter-sheet");
    const flapSheet = box(g, 0.5, 0.015, 1.4, 3.15, 0.35, -1.6, 0xe4e8e9, { rough: 0.55 });
    flapSheet.visible = false;

    const scrapBag = group(g, 0.6, 0.24, 2.0);
    cyl(scrapBag, 0.16, 0.14, 0.4, 0, 0.2, 0, 0x2b2b2b, { rough: 0.4, seg: 12 });
    holoTag(scrapBag, "trim scrap bag", 0, 0.5, 0, { css: TPOH_CSS, w: 0.28 });
    reg(hits, scrapBag, "scrap-bag");
    for (let i = 0; i < 5; i++) {
      box(g, 0.14 + (i % 2) * 0.06, 0.01, 0.1, 0.3 + i * 0.11, 0.246, 1.7 + (i % 3) * 0.1, 0xd8dcdd, { rough: 0.6, cast: false });
    }
    const chute = group(g, -2.6, 0.24, 2.2);
    cyl(chute, 0.22, 0.16, 0.9, 0, 0.45, 0, TPOH_PAL.structure, { rough: 0.6, metal: 0.3, seg: 12 });
    holoTag(chute, "debris chute", 0, 1.0, 0, { css: TPOH_CSS, w: 0.26 });
    const chuteSocket = box(chute, 0.3, 0.1, 0.3, 0, 0.85, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["chute-socket"] = chuteSocket;

    // Primer can and fume pocket behind the parapet.
    const primer = group(g, -2.7, 0.24, -1.9);
    cyl(primer, 0.06, 0.06, 0.12, 0, 0.06, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(primer, "primer can — capped?", 0, 0.3, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, primer, "primer-can");
    const primerOpenHit = box(primer, 0.14, 0.05, 0.14, 0, 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, primerOpenHit, "primer-can-open");
    const fumes = particles(g, 40, 0x9a9a70, { size: 0.045, life: 1.3, opacity: 0.45 });
    fumes.position.set(-2.7, 0.4, -1.9);
    fumes.visible = false;
    const primerCap = box(primer, 0.07, 0.02, 0.07, 0, 0.13, 0, 0x2b2b30, { rough: 0.6 });
    primerCap.visible = false;

    // ------------------------------------------------------------ crew, chest, boards
    const laborer = standingFigure(g, -2.3, -1.6, { ry: 1.0, vest: 0xd8f23a, helmet: TPOH_PAL.accent, gloves: true });
    holoTag(laborer, "laborer stacking scrap", 0, 2.0, 0, { css: TPOH_CSS, w: 0.36 });
    const fastenPartner = standingFigure(g, 3.0, 1.6, { ry: -2.4, vest: 0xd8f23a, helmet: TPOH_PAL.trim, gloves: true, harness: true });
    holoTag(fastenPartner, "fastening crew", 0, 2.0, 0, { css: TPOH_CSS, w: 0.3 });
    const chest = toolChest(g, -2.0, 1.0, { ry: 2.2, color: TPOH_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: TPOH_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, -0.6, 0.24, -0.6);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, TPOH_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: TPOH_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: TPOH_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: TPOH_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 0.9, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = TPOH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("FASTENING PLAN — WIND UPLIFT", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Field: per plan spacing", "Perimeter + corners: tighter per plan", "Weld: manufacturer's temperature band",
       "Probe every seam before sign-off", "NRCA single-ply practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: TPOH_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = TPOH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("WELD LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Course: —", "Finds: —", "Fasteners: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: TPOH_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "welder-inspect") { frayed.material = mat(0x59c97b); tear.material = mat(0x59c97b); }
        if (step.id === "sheet-layout") looseSheet.visible = true;
        if (step.id === "weld-pass") seamBead.visible = true;
        if (step.id === "primer-cap") repaint(radio.userData.screen, signFace("PRIMER CAPPED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.34 }));
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("WELD LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Course: welded + probed", "Finds: cord + torn sheet", "Fasteners: row confirmed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("COURSE CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wind-lifts-perimeter") flapSheet.visible = true;
        if (it.id === "fumes-behind-parapet") fumes.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-lifts-perimeter") flapSheet.visible = false;
        if (it.id === "fumes-behind-parapet") { fumes.visible = false; primerCap.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "fastener-driver") driver.rotation.z = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "welder-temp") {
          repaint(tempFace, signFace(`${Math.round(900 + gg.t * 500)} °F`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (flapSheet.visible) flapSheet.rotation.z = Math.sin(t * 5) * 0.2;
        if (fumes.visible) fumes.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.05, 0.3, -0.3);
        void paperFace;
      },
    };
  },
};
