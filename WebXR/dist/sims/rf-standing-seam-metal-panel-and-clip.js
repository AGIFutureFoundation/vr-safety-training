import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, corrugatedFace, concreteFace, rustFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Standing-Seam Metal Panel & Clip VR — Construction &
// Structural Trades, the Roofers and Waterproofers pack.
//
// A standing-seam metal roof mid-install on concealed clips over purlins: a
// finished field of double-lock seams, the next panel staged to be carried,
// clipped and seamed, and a cutting station at the far corner. The learner
// runs the panel, the clip driver and the motorized seamer. A generic
// building and a generic crew; no manufacturer or contractor is named.

const SSMP_PAL = palette("construction");
const SSMP_ACCENT = SSMP_PAL.accent;
const SSMP_CSS = "#f2c14b";

export const SIM_RF_STANDING_SEAM_METAL_PANEL_AND_CLIP = {
  id: "rf-standing-seam-metal-panel-and-clip",
  index: "rf4",
  domain: "Construction & Structural Trades",
  trade: "Roofer installing standing-seam metal panels on concealed clips and running the mechanical seamer",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection at the roof edge, and 29 CFR 1926 Subpart M Fall protection generally; ANSI Z359 for the harness and anchor; 29 CFR 1926.1153 for coating dust from cutting or grinding; NRCA standing-seam metal roofing practice; Roofers Local 40 apprenticeship and training",
  name: "Standing-Seam Metal Panel & Clip",
  title: simTitle("Standing-Seam Metal Panel & Clip"),
  tagline: "The panel layout and clip plan read, harness clipped, a sharp edge and a bent clip found, the panel's surface temperature checked, a panel carried out of the wind, its clip driven, the panel held aligned, the seam run and its lock checked, the cutting station ventilated, a skipped clip found on the walk-round, offcuts hauled off and the day logged, with a gust catching the panel mid-carry and a coworker cutting coated steel without ventilation along the way",
  accent: SSMP_ACCENT,
  accentCss: SSMP_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "seam-locked-clean", name: "Seam Locked Clean", note: "Every panel clipped to the plan, every seam locked, and nobody carried a panel across the wind or a lungful of coating fume to do it" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Seam Run",
    currency: "CLIP",
    ranks: ["Apprentice", "Panel Hand", "Seam Runner", "Lead Mechanic", "Standing-Seam Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The clip plan read before the first panel was carried", test: AWARD.stepClean("layout-plan") },
      { id: "steady-seamer", name: "Steady Seamer", note: "The seamer ran the whole panel without a break in pace", test: AWARD.unbroken },
      { id: "never-carried-broadside", name: "Never Carried Broadside", note: "No panel walked across the wind, no bare hand on a hot panel, no cutting without ventilation", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-panel", name: "Clean Panel", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "locked-tight", name: "Locked Tight", note: "The seam-lock reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "field-closed", name: "Field Closed", note: "Day logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unclipped-panel-walk": "You are stepping onto the new panel before its clips are engaged, right at the leading edge. An unclipped standing-seam panel is resting on its purlins by friction alone, and it can slide or tip under a boot the same way an unfastened membrane sheet does — the difference is this one is also slick, painted steel. It is clipped down before anyone's weight goes on it.",
    "hot-panel-surface": "You are about to grab that panel bare-handed at midday. A painted metal panel in direct sun runs well past a temperature that raises a blister on contact, and it gives no warning before it burns the way a stove element does — gloves stay on for handling panels in the sun, full stop.",
    "coating-fume-cutting": "A coworker is grinding through a painted, galvanized panel at the parapet corner with no dust shroud and no respirator. Cutting or grinding a coated steel panel throws up a mix of paint and zinc-coating fume that 29 CFR 1926.1153-style dust controls and a respirator are there to keep out of someone's lungs — it is set up in the open air with a shroud and extraction before the first cut, not worked through and dealt with after.",
    "panel-catch-wind": "You are about to carry that full panel flat, broadside to the gust coming off the parapet. A standing-seam panel is a wide, light sheet of steel, and carried flat across the wind it catches exactly like a sail — it is carried edge-on into the wind, with a second person steadying the leading edge, never carried flat across an open gust.",
  },

  lateNotes: {
    "clip-driver": "The clip is driven once the panel is carried out and seated on its purlins — there is nothing to drive it into yet.",
    "seam-lock": "The lock is checked once the seamer has actually run the length of that seam.",
    "log-board": "The log is written once the walk-round has found what it is going to find, not before.",
  },

  steps: [
    {
      id: "layout-plan", kind: "select", target: "plan-board",
      title: "Read the panel layout and clip-spacing plan",
      cue: "Read the plan: the panel run direction, the clip spacing at the field and the eave, and the wind-uplift rating it is built to.",
      why: "A standing-seam roof's wind-uplift performance comes entirely from its concealed clips holding to the pattern the engineering behind the rating assumes — tighter at the eave and corners than in the field, per the manufacturer's plan. A clip spaced from habit instead of the plan is a roof rated for a wind zone it was never actually built to resist.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the eave.",
      why: "A standing-seam roof is slicker underfoot than almost anything else a roofer walks, painted steel included, and 29 CFR 1926.502 makes the anchor, harness and connection one rated system rather than three pieces of gear worn out of habit. Snugged before it is clipped, because a loose harness slides under load exactly where it should not.",
    },
    {
      id: "panel-inspect", kind: "find", noHint: true,
      targets: ["sharp-panel-edge", "bent-clip"],
      itemNames: { "sharp-panel-edge": "a sharp, unrolled edge on the next panel", "bent-clip": "a bent clip in the box" },
      itemNotes: {
        "sharp-panel-edge": "The next panel's factory edge has not been de-burred — a hand run along it the wrong way opens a clean slice, the way any freshly sheared steel edge will.",
        "bent-clip": "One clip in the box is bent enough that it will not seat square on the seam rib. A clip that does not seat square does not hold its rated pull-out load no matter how well the fastener under it is driven.",
      },
      title: "Inspect the next panel and the clip box before carrying either",
      cue: "Run a gloved hand along the next panel's edge and check the clips in the box for anything bent before either goes to the roof.",
      why: "A sharp panel edge and a bent clip both fail the same way — quietly, until the moment someone's hand meets the edge or the wind meets a clip that never actually held. Both are cheaper to find in the stack than on the roof.",
    },
    {
      id: "panel-temp", kind: "gauge", target: "panel-temp",
      title: "Check the panel's surface temperature",
      cue: "Read the surface thermometer on the staged panel and commit once you know whether bare-hand handling is safe.",
      why: "A painted metal panel's surface temperature in full sun can climb well past a safe bare-hand contact limit within an hour of sunrise, and it gives no visual warning that it has crossed that line. Reading it before the first panel is carried is what decides whether gloves are optional today or not.",
      gauge: {
        label: "PANEL SURFACE TEMPERATURE", speed: 0.5, green: [0.15, 0.42],
        readout: (t) => `${Math.round(70 + t * 90)} °F`,
        missNote: "That reading says gloves are not optional right now — read it again and handle the panel accordingly.",
      },
    },
    {
      id: "panel-carry", kind: "drag", target: "panel-stack",
      title: "Carry the panel out edge-on to the wind",
      cue: "Carry the next panel out to the layout line turned edge-on into the wind, not carried flat and broadside.",
      why: "Carried edge-on, a panel slices through moving air the way a sail does when it is luffed; carried flat and broadside, the same panel becomes the sail itself. Which way it is carried is decided before it leaves the stack, not partway across the roof when a gust already has hold of it.",
      drag: { to: "layout-line", radius: 0.55, missNote: "Not on the layout line. Carry the panel all the way out, edge-on to the wind, before setting it down." },
    },
    {
      id: "clip-driver", kind: "turn", target: "clip-driver",
      title: "Drive the clip fastener to seat the panel",
      cue: "Set the clip on its mark and drive the fastener until the clip seats flush against the seam rib.",
      why: "A clip driven flush holds its rated pull-out load; one left proud rocks under load and one driven through the purlin loses its grip entirely. The wind-uplift pattern the plan calls for only works if every clip on it is actually seated the way this one is.",
      turn: { turns: 0.5, axis: "z", label: "CLIP DRIVER", readout: (t) => (t < 0.4 ? "backed out" : t > 0.85 ? "overdriven" : "seated flush") },
    },
    {
      id: "panel-align", kind: "hold", target: "panel-align", seconds: 4,
      title: "Hold the panel aligned before seaming",
      cue: "Hold the panel's rib pressed square against the last course while the clips take it up — do not let it drift before the seamer runs.",
      why: "The seamer folds whatever two rib edges are actually sitting against each other when it runs, and a panel that has drifted a few millimetres out of alignment gets that drift folded permanently into the seam. Holding it square until the clips have taken the panel up is what keeps the run straight.",
      holdBreakNote: "The panel drifted out of alignment before the clips took hold — square it back up and hold it there.",
    },
    {
      id: "seamer-pass", kind: "track", target: "seamer", seconds: 6,
      title: "Run the seamer along the standing seam at a steady pace",
      cue: "Guide the motorized seamer along the seam at a steady pace — too slow doubles back on itself, too fast skips the fold.",
      why: "The seamer's rollers fold the two rib edges into a continuous double-lock seam as it travels, and that fold only forms cleanly inside a narrow speed range: too slow and it can double-crimp the same stretch, too fast and it skips past metal that never gets folded at all. A steady pace is what the manufacturer's seamer is built to run at.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "SEAMER TRAVEL SPEED", readout: (v) => (v < 0.4 ? "too slow — double-crimping" : v > 0.62 ? "too fast — skipped fold" : "locking clean") },
      holdBreakNote: "The seamer's pace broke out of the steady band. Bring it back to a steady travel speed along the seam.",
    },
    {
      id: "seam-lock", kind: "gauge", target: "seam-lock",
      title: "Check the seam's lock engagement",
      cue: "Test the seam's fold with the lock gauge and commit once it reads a fully engaged double lock end to end.",
      why: "A seam that looks folded can still be a single fold where a double lock was specified, and a single-locked seam holds less wind-uplift load and lets more water past it in a wind-driven rain. The gauge is what turns 'looks seamed' into a confirmed double lock the whole length of the run.",
      gauge: {
        label: "SEAM LOCK ENGAGEMENT", speed: 0.55, green: [0.42, 0.62],
        readout: (t) => (t < 0.42 ? "single lock only" : t > 0.62 ? "over-rolled" : "double lock engaged"),
        missNote: "That stretch is not fully double-locked. Run the seamer over it again before moving to the next panel.",
      },
    },
    {
      id: "cutoff-station", kind: "select", target: "cutoff-station",
      title: "Set up the cutting station with ventilation",
      cue: "Move the cutting station into open air, fit the shroud on the grinder and put the respirator on before notching the next panel.",
      why: "Cutting or grinding through a painted, galvanized panel throws coating and zinc fume that a shroud and moving air carry away, and a respirator is what catches whatever gets past both — set up before the first cut, this is prevention; done afterward at the corner nobody chose, it is exposure that already happened.",
    },
    {
      id: "clip-walk", kind: "find", noHint: true,
      targets: ["clip-spacing-gap", "loose-panel-edge"],
      itemNames: { "clip-spacing-gap": "a skipped clip in the finished field", "loose-panel-edge": "a panel edge not yet fully engaged in its seam" },
      itemNotes: {
        "clip-spacing-gap": "One clip position along the finished field was skipped — it will not show as a leak, only as the one spot in a real wind event that a gust can start working the panel loose from.",
        "loose-panel-edge": "This panel's edge is sitting in its seam but not fully engaged — it needs another pass of the seamer before it is actually locked, not just resting in place.",
      },
      title: "Walk the finished field and find what the plan says should already be closed",
      cue: "Walk the finished panels against the clip plan: find the skipped clip and the panel edge that never got its second seamer pass.",
      why: "A field that looks complete from a few feet away can still be hiding a skipped clip or a half-seamed edge, and the walk-round with the plan in hand is the last chance to catch either before the next course of panels covers the mark that would have shown it.",
    },
    {
      id: "scrap-haul", kind: "drag", target: "scrap-bin",
      title: "Haul the metal offcuts to the scrap bin",
      cue: "Carry the panel offcuts and clip scrap to the bin rather than leaving sharp trim loose on the deck.",
      why: "A sheared metal offcut left on a finished panel is a cut waiting for the next boot that steps near it, and loose trim blown off an open roof edge is a falling-object hazard for anyone below. The bin takes it off the roof the same day it is cut.",
      drag: { to: "bin-socket", radius: 0.55, missNote: "Not in the bin. Carry the offcuts all the way to the scrap bin before letting go." },
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log the field, the finds and the clip count",
      cue: "Write the bent clip discarded, the sharp edge de-burred, the skipped clip added, and the seam-lock readings into the log.",
      why: "The next crew inherits whatever the log says rather than what actually happened on the panel underneath their boots, so the finds that never show up in a finished field — a clip added after the fact, an edge de-burred before it cut someone — are exactly what is worth writing down while they are fresh.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the crew and the ground",
      cue: "Radio the crew fastening panels behind you: the field is clipped, seamed and checked, and name the support line.",
      why: "A panel crew works a few feet apart the whole shift, each person trusting the last one's clips and seams without re-checking them, and a short check-in at the end of the run is what confirms that trust was earned today rather than assumed.",
    },
  ],

  interrupts: [
    {
      id: "wind-catches-panel",
      kind: "Gust catches the panel mid-carry",
      after: "panel-carry", delay: 2, seconds: 14,
      alert: "A gust catches the panel as it is being carried, and it starts twisting out of your hands toward the open eave.",
      cue: "Set the panel down flat immediately and let it settle before the gust gets any more of it.",
      target: "panel-flat",
      why: "A panel already twisting in a gust is not a panel to fight for balance while still on your feet — setting it down flat the instant it starts moving takes the wind's leverage away, where trying to walk it the rest of the way to the layout line gives the gust more time to work.",
      missNote: "The panel kept twisting until it flipped out of reach entirely and slid toward the eave, dragging a scrape across two finished seams on its way.",
      wrongNote: "That does not stop a panel already twisting in the wind. Set it down flat right now.",
    },
    {
      id: "coworker-cutting-unventilated",
      kind: "Coworker grinding without ventilation",
      after: "seam-lock", delay: 2, seconds: 14,
      alert: "A coworker has started grinding a notch in a panel at the parapet corner with no shroud on the grinder and no respirator on.",
      cue: "Stop them and move the cut to the ventilated cutting station before another spark flies.",
      target: "cutoff-station",
      why: "Coating and zinc fume from a ground cut do not announce themselves the way a spark does, and by the time anyone smells anything the exposure has already happened. Moving the cut to the shrouded, ventilated station is what a hot second at the parapet corner should never have been instead.",
      missNote: "The coworker kept grinding at the parapet corner, coating dust drifting across the whole leeward side of the roof, until the notch was finished.",
      wrongNote: "That does not stop the fume. Move the cut to the ventilated cutting station before another pass of the grinder.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SSMP_ACCENT);

    // ------------------------------------------------------------ roof deck: standing-seam field, parapet
    const panelTex = surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: SSMP_PAL.structure, ribs: 8 }), { repeat: 3, px: 384 });
    const deck = box(g, 6.4, 0.24, 5.6, 0, 0.12, 0, 0xffffff);
    deck.material = texturedMat(panelTex, { rough: 0.45, metal: 0.55, color: 0xd8785c });
    deck.receiveShadow = true;
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.6, pd, px, 0.54, pz, 0xffffff);
      wall.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a99c8b", tone2: "#988c7c" }), { repeat: 2, px: 256 }), { rough: 0.85, metal: 0.02, color: 0xc6bcae });
      box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.87, pz, 0x8b949d, { rough: 0.5, metal: 0.5 });
    }
    // Purlins visible below the eave.
    for (let x = -2.6; x <= 2.6; x += 0.9) box(g, 0.06, 0.06, 5.4, x, 0.02, 0, 0x6a6e72, { rough: 0.6, metal: 0.5 });

    const layoutMark = box(g, 1.4, 0.012, 0.9, 0.9, 0.246, 0.4, 0xd8c88a, { opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "layout line", 0.9, 0.4, 0.4, { css: SSMP_CSS, w: 0.22 });
    reg(hits, layoutMark, "layout-line");
    const panelFlat = box(g, 1.35, 0.018, 0.85, 0.9, 0.256, 0.4, 0xd8785c, { rough: 0.4, metal: 0.5 });
    panelFlat.visible = false;
    reg(hits, panelFlat, "panel-flat");

    // ------------------------------------------------------------ panel stack and inspect
    const panelStack = group(g, 2.4, 0.24, 2.0);
    for (let i = 0; i < 4; i++) box(panelStack, 1.4, 0.02, 0.9, 0, 0.03 + i * 0.025, 0, 0xd8785c, { rough: 0.4, metal: 0.55 });
    holoTag(panelStack, "next panel", 0, 0.3, 0, { css: SSMP_CSS, w: 0.22 });
    reg(hits, panelStack, "panel-stack");
    const sharpEdge = box(panelStack, 1.4, 0.006, 0.03, 0, 0.12, 0.45, 0xe8ecee, { rough: 0.3, metal: 0.6 });
    reg(hits, sharpEdge, "sharp-panel-edge");
    const clipBox = group(g, 3.0, 0.24, 2.0);
    box(clipBox, 0.3, 0.15, 0.2, 0, 0.075, 0, SSMP_PAL.trim, { rough: 0.6 });
    holoTag(clipBox, "clip box", 0, 0.3, 0, { css: SSMP_CSS, w: 0.2 });
    const bentClip = box(clipBox, 0.06, 0.02, 0.08, 0.08, 0.16, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    bentClip.rotation.z = 0.4;
    reg(hits, bentClip, "bent-clip");
    const panelThermo = decal(panelStack, 0.12, 0.06, 0.4, 0.15, 0.3, signFace("-- °F", { bg: "#0d1c24", accent: SSMP_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 160 });
    holoTag(panelStack, "surface thermometer", 0.4, 0.35, 0.3, { css: SSMP_CSS, w: 0.3 });
    reg(hits, panelThermo, "panel-temp");

    // ------------------------------------------------------------ clip driver, alignment, seamer
    const clipDriver = group(g, 0.5, 0.3, 0.55, 0.5);
    cyl(clipDriver, 0.03, 0.035, 0.3, 0, 0.02, 0, SSMP_PAL.accent, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    box(clipDriver, 0.08, 0.1, 0.06, 0, 0.02, -0.16, 0x2b2b30, { rough: 0.5 });
    holoTag(clipDriver, "clip driver", 0, 0.2, 0, { css: SSMP_CSS, w: 0.24 });
    reg(hits, clipDriver, "clip-driver");
    const alignMark = box(g, 0.9, 0.03, 0.4, 0.9, 0.27, 0.1, SSMP_PAL.accent, { opacity: 0.3, transparent: true, emissive: SSMP_PAL.accent, ei: 0.5, cast: false });
    holoTag(g, "hold panel aligned", 0.9, 0.4, 0.1, { css: SSMP_CSS, w: 0.34 });
    reg(hits, alignMark, "panel-align");
    const seamer = group(g, 1.6, 0.3, 0.4, 0.3);
    box(seamer, 0.18, 0.16, 0.3, 0, 0.08, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    cyl(seamer, 0.05, 0.05, 0.08, 0, 0.02, 0.14, 0x9aa0a6, { rough: 0.4, metal: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(seamer, "motorized seamer", 0, 0.3, 0, { css: SSMP_CSS, w: 0.32 });
    reg(hits, seamer, "seamer");
    const seamLockFace = decal(seamer, 0.12, 0.05, 0, 0.25, 0, signFace("--", { bg: "#0d1c24", accent: SSMP_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(seamer, "seam lock gauge", 0, 0.35, 0, { css: SSMP_CSS, w: 0.3 });
    reg(hits, seamLockFace, "seam-lock");

    // ------------------------------------------------------------ cutting station and coworker
    const cutStation = group(g, -2.2, 0.24, -1.9);
    box(cutStation, 0.5, 0.04, 0.4, 0, 0.02, 0, 0x2b2b30, { rough: 0.6 });
    const shroud = torus(cutStation, 0.1, 0.02, 0, 0.15, 0.15, 0x8a8f95, { rough: 0.5, metal: 0.6, seg: 6, seg2: 16 });
    void shroud;
    const fanBlade = cyl(cutStation, 0.12, 0.12, 0.03, 0.25, 0.2, 0, SSMP_PAL.trim, { rough: 0.5, seg: 12 });
    void fanBlade;
    holoTag(cutStation, "ventilated cutting station", 0, 0.4, 0, { css: SSMP_CSS, w: 0.42 });
    reg(hits, cutStation, "cutoff-station");
    const grinderSpot = group(g, 3.1, 0.24, -2.3);
    cyl(grinderSpot, 0.06, 0.06, 0.2, 0, 0.1, 0, 0x2b2b30, { rough: 0.5, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(grinderSpot, "grinding without ventilation?", 0, 0.4, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, grinderSpot, "coating-fume-cutting");
    const fume = particles(g, 40, 0x9a9a70, { size: 0.045, life: 1.3, opacity: 0.45 });
    fume.position.set(3.1, 0.35, -2.3);
    fume.visible = false;
    const coworker = standingFigure(g, 3.0, -2.0, { ry: 0.5, vest: 0xd8f23a, gloves: true, atStation: true });
    coworker.visible = false;

    const windPanel = group(g, 1.9, 0.24, 2.4);
    box(windPanel, 0.6, 0.01, 0.5, 0, 0.006, 0, 0xd8785c, { rough: 0.4, metal: 0.5 });
    holoTag(windPanel, "carry flat across the wind?", 0, 0.3, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, windPanel, "panel-catch-wind");
    const hotPanel = group(g, 2.0, 0.24, -0.4);
    box(hotPanel, 0.6, 0.01, 0.5, 0, 0.006, 0, 0xd8785c, { rough: 0.4, metal: 0.5, emissive: 0x4a1a08, ei: 0.15 });
    holoTag(hotPanel, "grab bare-handed?", 0, 0.3, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, hotPanel, "hot-panel-surface");
    const eaveEdge = box(g, 6.4, 0.02, 0.4, 0, 0.25, 2.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step onto the unclipped panel?", 0.4, 0.4, 2.5, { css: "#d2312b", w: 0.5 });
    reg(hits, eaveEdge, "unclipped-panel-walk");

    // ------------------------------------------------------------ finished field walk-round
    const clipGapMark = box(g, 0.14, 0.02, 0.14, -1.5, 0.256, -1.0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skipped clip", -1.5, 0.4, -1.0, { css: SSMP_CSS, w: 0.22 });
    reg(hits, clipGapMark, "clip-spacing-gap");
    const loosePanelMark = box(g, 0.5, 0.02, 0.5, -0.6, 0.256, -1.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unlocked edge", -0.6, 0.4, -1.2, { css: SSMP_CSS, w: 0.24 });
    reg(hits, loosePanelMark, "loose-panel-edge");

    // Scrap bin, offcuts.
    const scrapBin = group(g, -1.4, 0.24, 1.6);
    box(scrapBin, 0.4, 0.35, 0.4, 0, 0.175, 0, SSMP_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(scrapBin, "scrap bin", 0, 0.5, 0, { css: SSMP_CSS, w: 0.22 });
    const binSocket = box(scrapBin, 0.3, 0.1, 0.3, 0, 0.36, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["bin-socket"] = binSocket;
    const offcuts = group(g, -1.0, 0.24, 1.8);
    for (let i = 0; i < 3; i++) box(offcuts, 0.3, 0.008, 0.08, i * 0.1, 0.004, i * 0.06, 0xb8bec4, { rough: 0.4, metal: 0.6, cast: false });
    holoTag(offcuts, "panel offcuts", 0, 0.3, 0, { css: SSMP_CSS, w: 0.24 });
    reg(hits, offcuts, "scrap-bin");

    // ------------------------------------------------------------ crew, chest, boards
    const partner = standingFigure(g, -0.4, 1.9, { ry: 2.8, vest: 0xd8f23a, helmet: SSMP_PAL.accent, gloves: true, harness: true });
    holoTag(partner, "panel crew", 0, 2.0, 0, { css: SSMP_CSS, w: 0.28 });
    const chest = toolChest(g, -2.0, 1.0, { ry: 2.2, color: SSMP_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: SSMP_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, -0.6, 0.24, -0.6);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, SSMP_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: SSMP_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: SSMP_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: SSMP_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, 0.9, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSMP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("PANEL LAYOUT — CLIP PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Field clip spacing per plan", "Eave + corners: tighter per plan", "Double-lock seam required",
       "Wind-uplift rating: per the manufacturer", "NRCA standing-seam practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: SSMP_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSMP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("PANEL LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Field: —", "Finds: —", "Seams: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: SSMP_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "panel-inspect") { sharpEdge.material = mat(0x59c97b); bentClip.material = mat(0x59c97b); }
        if (step.id === "panel-carry") panelFlat.visible = true;
        if (step.id === "cutoff-station") repaint(radio.userData.screen, signFace("SHROUD ON", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.36 }));
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("PANEL LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Field: clipped + seamed", "Finds: edge + clip + gap", "Seams: double lock confirmed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("FIELD CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "wind-catches-panel") panelFlat.rotation.z = 0.5;
        if (it.id === "coworker-cutting-unventilated") { coworker.visible = true; fume.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-catches-panel") panelFlat.rotation.z = 0;
        if (it.id === "coworker-cutting-unventilated") { coworker.visible = false; fume.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "clip-driver") clipDriver.rotation.z = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "panel-temp") {
          repaint(panelThermo, signFace(`${Math.round(70 + gg.t * 90)} °F`, { bg: "#0d1c24", accent: gg.t <= 0.42 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (gg && !gg.committed && step?.id === "seam-lock") {
          repaint(seamLockFace, signFace(gg.t >= 0.42 && gg.t <= 0.62 ? "DOUBLE LOCK" : gg.t < 0.42 ? "SINGLE" : "OVER-ROLLED", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.4 }));
        }
        if (fume.visible) fume.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.05, 0.3, -0.3);
        void paperFace;
      },
    };
  },
};
