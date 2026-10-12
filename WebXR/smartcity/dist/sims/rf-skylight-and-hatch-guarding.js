import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, asphaltFace, concreteFace, rustFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Skylight & Hatch Guarding VR — Construction & Structural
// Trades, the Roofers and Waterproofers pack.
//
// A low-slope roof mid re-roof: half old granulated cap sheet, half fresh
// membrane, with two skylights and a roof hatch scattered across it. The
// learner is the roofer whose whole job this stretch is screening and
// railing every opening before the membrane crew works anywhere near them. A
// generic building, a generic roof; no manufacturer or contractor is named.

const SKHG_PAL = palette("construction");
const SKHG_ACCENT = SKHG_PAL.accent;
const SKHG_CSS = "#f2c14b";

export const SIM_RF_SKYLIGHT_AND_HATCH_GUARDING = {
  id: "rf-skylight-and-hatch-guarding",
  index: "rf7",
  domain: "Construction & Structural Trades",
  trade: "Roofer screening skylights and railing roof hatches ahead of a re-roof crew",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 and 29 CFR 1926.502 fall protection, skylight screens and hole covers, and 29 CFR 1926 Subpart M Fall protection generally; ANSI Z359 for the harness and anchor; NRCA skylight and hatch guarding practice; Roofers Local 40 apprenticeship and training",
  name: "Skylight & Hatch Guarding",
  title: simTitle("Skylight & Hatch Guarding"),
  tagline: "The guarding plan read, harness clipped, a cracked dome and a backed-out screen fastener found, an existing screen proof-tested, the heat gun set down cold, a new screen carried out of the wind, fastened, seated and sealed, its own proof test held, the hatch's rail and gate confirmed in order, a second dome and an unmarked vent found on the walk-round, and the day logged, with a gust catching the next panel and a coworker radioing that a second hatch was left open along the way",
  accent: SKHG_ACCENT,
  accentCss: SKHG_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "every-opening-guarded", name: "Every Opening Guarded", note: "Every skylight screened, the hatch railed and gated, and nobody left an opening for the membrane crew to find the hard way" },

  supportLine: "Roofers Local 40's member assistance programme, or your contractor's employee assistance line",

  game: system({
    name: "Guard Line",
    currency: "GUARD",
    ranks: ["Apprentice", "Screen Hand", "Guard Runner", "Lead Guardsman", "Guarding Certified"],
    badges: [
      { id: "plan-first", name: "Plan First", note: "The guarding plan read before the first screen came out", test: AWARD.stepClean("guarding-plan") },
      { id: "steady-seal", name: "Steady Seal", note: "The sealant bead ran the whole frame without a break in pace", test: AWARD.unbroken },
      { id: "never-left-open", name: "Never Left Open", note: "No dome stepped on, no heat gun left hot, no panel carried across the wind", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-guard", name: "Clean Guard", note: "No corrections anywhere on the roof", test: AWARD.clean },
      { id: "proof-positive", name: "Proof Positive", note: "Both proof-load readings committed inside band first time", test: AWARD.precise(0.7) },
      { id: "roof-closed", name: "Roof Closed", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unscreened-skylight": "You are stepping toward the skylight dome with no screen or guardrail on it yet. 29 CFR 1926.501 treats an unguarded skylight opening the same as a hole in the deck — from a few feet away in work boots, a dirty acrylic dome and the roof around it look like the same surface, and a dome carries no one's weight at all.",
    "heat-gun-idle-near-screen": "The heat gun is switched on and lying against the stack of screen mesh instead of set down cold on open deck. A heat gun left running near plastic screen components or synthetic mesh does not need a spark to start something — it just needs enough time sitting against the wrong material, which is exactly what it is doing right now.",
    "sealant-fumes-enclosed": "You are bedding the screen frame's sealant down inside the skylight curb's own well, where the curb walls box the fumes in on four sides with nowhere to vent. A solvent-based sealant used in the open air off the curb is a smell; the same sealant worked inside a curb well with no airflow is a lungful with every breath.",
    "screen-panel-catch-wind": "You are about to carry the next screen panel flat across the gust coming off the parapet. A wire mesh screen panel is wide and light enough to catch wind exactly like an unclipped roof panel or a drainage board does, and a gust that gets under it at an unguarded opening can as easily pull a person toward that opening as take the panel out of their hands.",
  },

  lateNotes: {
    "screen-fastener": "The frame is fastened once the panel is actually carried out and seated on the curb — there is nothing to fasten yet.",
    "new-screen-proof": "The new screen is proof-tested once it is fastened and sealed, not before.",
    "log-board": "The log is written once the walk-round has found what it is going to find, not before.",
  },

  steps: [
    {
      id: "guarding-plan", kind: "select", target: "plan-board",
      title: "Read the skylight and hatch guarding plan",
      cue: "Read the plan: which openings need a screen, which need a guardrail, and the load the screens are rated to hold.",
      why: "Not every opening on a roof gets guarded the same way — a skylight gets a screen or a rail, a hatch gets a rail and a self-latching gate — and the plan is where the competent person has already matched each opening to what it actually needs, rated to the manufacturer's figure rather than whatever screen happened to be on the truck.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "anchor-clip"],
      itemNames: { harness: "full-body harness on and snugged", "anchor-clip": "lanyard clipped to the roof anchor" },
      outOfOrderNote: "Harness first — the lanyard clips to the back D-ring of a harness that is already on, not to one still on the rack.",
      title: "Harness on, then clipped to the roof anchor",
      cue: "Put the harness on and snug it, then clip the lanyard to the certified roof anchor before working toward the first unguarded opening.",
      why: "Every opening on this roof is, by definition, unguarded until you have finished with it, which makes the anchor, harness and connection the only fall protection actually in place while you work around each one. 29 CFR 1926.502 makes those three one rated system, snugged before it is clipped.",
    },
    {
      id: "roof-inspect", kind: "find", noHint: true,
      targets: ["cracked-dome", "missing-screen-fastener"],
      itemNames: { "cracked-dome": "a cracked skylight dome under an existing screen", "missing-screen-fastener": "a backed-out fastener on an existing screen frame" },
      itemNotes: {
        "cracked-dome": "The dome under this screen has a spider-crack across it from age or hail — the screen above it is still doing its job, but the dome itself would not have held anyone even before it cracked.",
        "missing-screen-fastener": "One fastener on this screen's frame has backed most of the way out. A screen held by three corners instead of four does not fail gracefully — it fails at the fourth corner, under whoever happens to be standing nearest it.",
      },
      title: "Walk the roof and check the existing screens before starting new ones",
      cue: "Look under the existing screens for a cracked dome, and check each frame's fasteners for anything backed out.",
      why: "A screen that was installed correctly last year is not guaranteed to still be doing its job today — fasteners work loose, domes crack from age and hail, and the only way to know an existing screen is still good is to actually check it before trusting it with anyone's weight.",
    },
    {
      id: "existing-screen-check", kind: "gauge", target: "existing-screen-gauge",
      title: "Proof-test an existing screen before trusting it",
      cue: "Press the proof-load gauge onto the existing screen and commit once the reading holds inside the plan's rated band.",
      why: "A screen that looks intact can still have lost its holding strength at a corner that is not visibly damaged, and the only way to actually know is to load it under control and read what it does — not to stand on it and find out the same way the plan is designed to prevent.",
      gauge: {
        label: "EXISTING SCREEN — PROOF LOAD", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "under rating" : t > 0.6 ? "over-tested" : "holds to rating"),
        missNote: "That reading is not conclusive. Read the proof load again before trusting this screen with anyone's weight.",
      },
    },
    {
      id: "heat-gun-off", kind: "select", target: "heat-gun",
      title: "Set the heat gun down cold before handling screen material",
      cue: "Switch the heat gun off and set it down on open deck, clear of the mesh and the plastic screen stock.",
      why: "A heat gun stays hot for a while after it is switched off, and set down against the wrong material it does not need to still be running to start something — set down cold on open deck, it is not touching anything it could start.",
    },
    {
      id: "screen-carry", kind: "drag", target: "screen-stack",
      title: "Carry the next screen panel out of the wind",
      cue: "Carry the next mesh screen panel out to the next unguarded curb, kept low and edge-on to the gust rather than flat and broadside.",
      why: "A wide, light mesh panel carried flat across an open gust catches it the same way an unclipped roof panel does, and doing that anywhere near an opening the panel is meant to guard is exactly the wrong place for a gust to get hold of anything.",
      drag: { to: "curb-line", radius: 0.55, missNote: "Not at the curb. Carry the panel all the way out, edge-on to the wind, before setting it down." },
    },
    {
      id: "screen-fastener", kind: "turn", target: "screen-fastener",
      title: "Fasten the screen frame to the curb",
      cue: "Set the frame square on the curb and drive its fasteners until each one seats flush.",
      why: "A screen only holds its rated load through fasteners actually seated the way the manufacturer specifies — proud, loose or missing even one, and the frame's rated capacity is a number that no longer describes the screen actually bolted to this curb.",
      turn: { turns: 0.5, axis: "z", label: "FRAME FASTENER", readout: (t) => (t < 0.4 ? "backed out" : t > 0.85 ? "overdriven" : "seated flush") },
    },
    {
      id: "screen-seat", kind: "hold", target: "screen-seat", seconds: 4,
      title: "Hold the screen seated while the clips take it up",
      cue: "Press the frame down square on the curb and hold it while the corner clips take the load.",
      why: "A frame released before its clips have actually taken hold can rock back off true, leaving one corner sitting slightly proud of the curb — a gap a foot can still find even after every fastener is driven.",
      holdBreakNote: "The frame lifted before the clips took hold — press it back down square and hold a little longer.",
    },
    {
      id: "sealant-bead", kind: "track", target: "sealant-gun", seconds: 6,
      title: "Run the sealant bead around the frame at a steady pace",
      cue: "Run a continuous bead around the frame's perimeter at a steady pace — too slow pools it, too fast leaves gaps.",
      why: "The sealant bead is what keeps water from finding the seam between the new screen frame and the curb, and it only does that as a continuous, even bead — too slow and it pools and skins over unevenly, too fast and it skips stretches that water will find on the very first rain.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.14, label: "SEALANT BEAD RATE", readout: (v) => (v < 0.4 ? "too slow — pooling" : v > 0.62 ? "too fast — gapping" : "even bead") },
      holdBreakNote: "The bead broke out of the steady band. Bring the gun back to a steady pace around the frame.",
    },
    {
      id: "new-screen-proof", kind: "gauge", target: "new-screen-proof",
      title: "Proof-test the screen you just installed",
      cue: "Press the proof-load gauge onto the new screen and commit once the reading holds inside the plan's rated band.",
      why: "The new screen gets the exact same proof test the old ones just got, because a screen fresh off the truck can still be installed with a fastener that never quite seated — a proof test now is what turns 'installed to the plan' into 'holds the way the plan says it should.'",
      gauge: {
        label: "NEW SCREEN — PROOF LOAD", speed: 0.55, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "under rating" : t > 0.6 ? "over-tested" : "holds to rating"),
        missNote: "That reading is not conclusive. Read the proof load again before this screen is signed off.",
      },
    },
    {
      id: "hatch-guard", kind: "sequence",
      targets: ["hatch-rail", "hatch-gate"],
      itemNames: { "hatch-rail": "hatch guardrail confirmed up", "hatch-gate": "hatch gate confirmed latched" },
      outOfOrderNote: "The rail is confirmed up before the gate is checked — a latched gate on a rail that was never actually there guards nothing.",
      title: "Confirm the hatch's guardrail, then its gate",
      cue: "Confirm the hatch's guardrail is up all the way round, then confirm the gate is closed and latched.",
      why: "A roof hatch is a hole with a lid, and the rail around it is what keeps anyone from stepping back into that hole while the lid is open — the rail is confirmed first because a latched gate on a rail that has come loose is confirming the wrong thing.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["second-cracked-dome", "unmarked-vent-hole"],
      itemNames: { "second-cracked-dome": "a second cracked dome further along the roof", "unmarked-vent-hole": "an unmarked, unguarded vent hole" },
      itemNotes: {
        "second-cracked-dome": "A second skylight further along the roof has the same spider-crack as the first — easy to miss once, easy to miss twice if the walk-round only covers half the roof.",
        "unmarked-vent-hole": "A plumbing vent stack was cut loose during the re-roof and never got its temporary cover put back — a hole the size of a boot, sitting open and completely unmarked.",
      },
      title: "Walk the whole roof one more time before signing off",
      cue: "Walk the far half of the roof against the plan: find the second cracked dome and the unmarked vent hole nobody has guarded yet.",
      why: "A guarding job is only as good as its coverage, and the openings most likely to get missed are the ones on the stretch of roof the crew has not walked yet — which is exactly why the last step before signing off is walking every square foot, not just the half that has already been worked.",
    },
    {
      id: "log-board", kind: "select", target: "log-board",
      title: "Log every opening, its guard and its finds",
      cue: "Write the cracked domes flagged, the backed-out fastener replaced, the new screen's proof reading, and the hatch confirmed into the log.",
      why: "The membrane crew coming in behind you trusts this log to know which openings are actually safe to work around, so an opening flagged but not yet fixed has to be written down as clearly as one that is already guarded — the two look identical from a few feet away.",
    },
    {
      id: "crew-checkin", kind: "select", target: "radio",
      title: "Check in with the membrane crew coming in behind you",
      cue: "Radio the membrane crew: every opening on this stretch is screened, railed or flagged, and name the support line.",
      why: "The membrane crew is about to work this whole stretch trusting that every opening on it has already been dealt with, and a short check-in is what makes that trust something you actually confirmed rather than something they assumed.",
    },
  ],

  interrupts: [
    {
      id: "gust-catches-panel",
      kind: "Gust catches the next panel",
      after: "screen-carry", delay: 2, seconds: 14,
      alert: "A gust catches the next screen panel staged at the curb before its fasteners are driven, and it starts sliding toward the open opening.",
      cue: "Get to the panel and set it down flat before it slides into the opening it is supposed to be guarding.",
      target: "panel-flat",
      why: "An unfastened screen panel sliding toward the exact opening it is meant to cover is the one moment a screen actively makes things worse rather than better — a panel half over a hole looks guarded from a glance and is not, which is why it gets set down flat the instant it starts moving rather than chased across the curb.",
      missNote: "The panel slid half over the opening and stopped there, looking guarded to anyone glancing at it from a few feet away — which is exactly the moment someone puts weight on it expecting a screen and finds a curb edge instead.",
      wrongNote: "That does not stop a sliding panel. Get to it and set it down flat before it reaches the opening.",
    },
    {
      id: "hatch-left-open-elsewhere",
      kind: "Coworker radios a second hatch left open",
      after: "new-screen-proof", delay: 2, seconds: 14,
      alert: "A coworker radios that the hatch on the far side of the roof has been left open with no rail up while the membrane crew took their break.",
      cue: "Get over to the far hatch and cover it before anyone walks back out onto that stretch.",
      target: "far-hatch-cover",
      why: "An open hatch does not stop being a hole just because the crew working near it stepped away for ten minutes, and a hatch with its rail down during a break is exactly the kind of gap between two people's responsibility that a hole falls through — covering it is what closes that gap instead of hoping the next person remembers it is open.",
      missNote: "The far hatch stayed open through the whole break, with nothing around it to stop anyone walking back out onto that stretch from finding it the hard way.",
      wrongNote: "Not that. Get over to the far hatch and cover it before anyone walks that stretch again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SKHG_ACCENT);

    // ------------------------------------------------------------ roof deck: old cap sheet / new membrane, parapet
    const oldTex = surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#332d27", base2: "#2a251f", lanes: 0 }), { repeat: 2, px: 384 });
    const oldDeck = box(g, 3.2, 0.24, 5.6, -1.6, 0.12, 0, 0xffffff);
    oldDeck.material = texturedMat(oldTex, { rough: 0.9, metal: 0.03, color: 0xb0a294 });
    const newTex = surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#d6dadb", tone2: "#c9cdcf" }), { repeat: 2, px: 384 });
    const newDeck = box(g, 3.2, 0.24, 5.6, 1.6, 0.12, 0, 0xffffff);
    newDeck.material = texturedMat(newTex, { rough: 0.55, metal: 0.05, color: 0xe8ebec });
    for (const [px, pz, pw, pd] of [[0, -2.7, 6.4, 0.18], [-3.1, 0, 0.18, 5.6]]) {
      const wall = box(g, pw, 0.6, pd, px, 0.54, pz, 0xffffff);
      wall.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8a8d89", tone2: "#7d7f7b" }), { repeat: 2, px: 320 }), { rough: 0.9, metal: 0.02, color: 0xb0b3ac });
      const cap = box(g, pw + 0.06, 0.05, pd + 0.06, px, 0.87, pz, 0xffffff);
      cap.material = texturedMat(surfaceTexture((cx, w, h) => rustFace(cx, w, h, { base: "#7a7268", base2: "#665f56" }), { repeat: 2, px: 256 }), { rough: 0.6, metal: 0.4, color: 0x9a9088 });
    }

    // ------------------------------------------------------------ existing screened skylight (old side)
    const oldSky = group(g, -1.9, 0.24, 1.6);
    box(oldSky, 0.9, 0.2, 0.9, 0, 0.1, 0, 0x6d747b, { rough: 0.8 });
    const oldDome = ball(oldSky, 0.4, 0, 0.2, 0, 0xcfe4ef, { rough: 0.25, opacity: 0.45, transparent: true, seg: 12 });
    oldDome.scale.set(1, 0.45, 1);
    const oldScreen = group(oldSky, 0, 0.32, 0);
    for (let i = -2; i <= 2; i++) box(oldScreen, 0.02, 0.02, 0.9, i * 0.18, 0, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6, cast: false });
    for (let i = -2; i <= 2; i++) box(oldScreen, 0.9, 0.02, 0.02, 0, 0, i * 0.18, 0x9aa0a6, { rough: 0.5, metal: 0.6, cast: false });
    holoTag(oldSky, "existing screen", 0, 0.55, 0, { css: SKHG_CSS, w: 0.3 });
    const crack = box(oldDome, 0.35, 0.006, 0.02, 0, 0.19, 0, 0x1a1e22, { rough: 0.6 });
    reg(hits, crack, "cracked-dome");
    const looseFastener = box(oldSky, 0.02, 0.015, 0.02, 0.42, 0.32, 0.42, 0xc0c6cc, { rough: 0.4, metal: 0.7 });
    reg(hits, looseFastener, "missing-screen-fastener");
    const proofGaugeFace = decal(oldSky, 0.12, 0.05, 0, 0.6, 0, signFace("--", { bg: "#0d1c24", accent: SKHG_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(oldSky, "proof-load gauge", 0, 0.7, 0, { css: SKHG_CSS, w: 0.3 });
    reg(hits, proofGaugeFace, "existing-screen-gauge");
    const unscreenedHit = box(oldSky, 0.9, 0.1, 0.9, 0, 0.4, 1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unscreened skylight?", -1.9, 0.65, 2.9, { css: "#d2312b", w: 0.44 });
    reg(hits, unscreenedHit, "unscreened-skylight");
    const unscreenedDome = group(g, -1.9, 0.24, 2.9);
    box(unscreenedDome, 0.9, 0.2, 0.9, 0, 0.1, 0, 0x6d747b, { rough: 0.8 });
    const bareDome = ball(unscreenedDome, 0.4, 0, 0.2, 0, 0xcfe4ef, { rough: 0.25, opacity: 0.45, transparent: true, seg: 12 });
    bareDome.scale.set(1, 0.45, 1);

    // New skylight curb (fresh membrane side) waiting for its screen.
    const newCurb = group(g, 1.7, 0.24, 1.4);
    box(newCurb, 0.9, 0.22, 0.9, 0, 0.11, 0, 0x8b949d, { rough: 0.6, metal: 0.4 });
    holoTag(newCurb, "curb line", 0, 0.32, 0, { css: SKHG_CSS, w: 0.24 });
    reg(hits, newCurb, "curb-line");
    const newDome = ball(newCurb, 0.4, 0, 0.22, 0, 0xcfe4ef, { rough: 0.25, opacity: 0.45, transparent: true, seg: 12 });
    newDome.scale.set(1, 0.45, 1);
    const newFrame = group(newCurb, 0, 0.34, 0);
    newFrame.visible = false;
    for (let i = -2; i <= 2; i++) box(newFrame, 0.02, 0.02, 0.9, i * 0.18, 0, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6, cast: false });
    const fastenerTool = group(g, 1.2, 0.3, 1.2, 0.3);
    cyl(fastenerTool, 0.03, 0.035, 0.28, 0, 0.02, 0, SKHG_PAL.accent, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    box(fastenerTool, 0.08, 0.1, 0.06, 0, 0.02, -0.15, 0x2b2b30, { rough: 0.5 });
    holoTag(fastenerTool, "frame fastener", 0, 0.2, 0, { css: SKHG_CSS, w: 0.28 });
    reg(hits, fastenerTool, "screen-fastener");
    const seatMark = box(newCurb, 0.9, 0.05, 0.9, 0, 0.36, 0, SKHG_PAL.accent, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, seatMark, "screen-seat");
    const sealantGun = group(g, 2.1, 0.3, 1.8, -0.4);
    box(sealantGun, 0.06, 0.16, 0.06, 0, 0.08, 0, 0x2b2b30, { rough: 0.5 });
    cyl(sealantGun, 0.02, 0.02, 0.2, 0, 0.16, 0.1, SKHG_PAL.trim, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(sealantGun, "sealant gun", 0, 0.3, 0, { css: SKHG_CSS, w: 0.26 });
    reg(hits, sealantGun, "sealant-gun");
    const sealBead = box(newCurb, 0.94, 0.02, 0.94, 0, 0.24, 0, 0x2b2b30, { rough: 0.4 });
    sealBead.visible = false;
    const newProofFace = decal(newCurb, 0.12, 0.05, 0, 0.65, 0, signFace("--", { bg: "#0d1c24", accent: SKHG_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.85, px: 128 });
    holoTag(newCurb, "proof-load gauge", 0, 0.75, 0, { css: SKHG_CSS, w: 0.3 });
    reg(hits, newProofFace, "new-screen-proof");

    // Sealant fumes, applied inside the curb well.
    const sealantFumeHit = box(newCurb, 0.5, 0.15, 0.5, 0, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sealant fumes — enclosed?", 1.7, 0.5, 1.4, { css: "#d2312b", w: 0.44 });
    reg(hits, sealantFumeHit, "sealant-fumes-enclosed");
    const fumes = particles(g, 40, 0x9a9a70, { size: 0.04, life: 1.0, opacity: 0.4 });
    fumes.position.set(1.7, 0.5, 1.4);

    // Screen stack, heat gun.
    const screenStack = group(g, 2.4, 0.24, -1.6);
    for (let i = 0; i < 3; i++) box(screenStack, 0.7, 0.02, 0.7, 0, 0.02 + i * 0.03, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    holoTag(screenStack, "screen panels", 0, 0.32, 0, { css: SKHG_CSS, w: 0.24 });
    reg(hits, screenStack, "screen-stack");
    const carriedPanel = group(g, 1.7, 0.28, 1.4);
    box(carriedPanel, 0.7, 0.02, 0.7, 0, 0, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    carriedPanel.visible = false;
    const panelFlat = box(g, 0.7, 0.02, 0.7, 2.9, 0.256, -1.6, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    panelFlat.visible = false;
    reg(hits, panelFlat, "panel-flat");
    const heatGun = group(g, 2.0, 0.3, -1.9, 0.4);
    box(heatGun, 0.14, 0.06, 0.06, 0, 0.03, 0, 0x2b2b30, { rough: 0.5 });
    cyl(heatGun, 0.02, 0.025, 0.12, 0.1, 0.03, 0, 0x8a8f95, { rough: 0.4, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(heatGun, "heat gun", 0, 0.2, 0, { css: SKHG_CSS, w: 0.22 });
    reg(hits, heatGun, "heat-gun");
    const heatGunHazard = group(g, 2.2, 0.24, -1.5);
    box(heatGunHazard, 0.14, 0.06, 0.06, 0, 0.03, 0, 0x2b2b30, { rough: 0.5, emissive: 0x4a1a08, ei: 0.3 });
    holoTag(heatGunHazard, "heat gun left running near mesh?", 0, 0.3, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, heatGunHazard, "heat-gun-idle-near-screen");
    const windPanelHit = group(g, 2.6, 0.24, -0.5);
    box(windPanelHit, 0.6, 0.01, 0.6, 0, 0.006, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    holoTag(windPanelHit, "carry flat across the wind?", 0, 0.3, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, windPanelHit, "screen-panel-catch-wind");

    // ------------------------------------------------------------ hatch
    const hatch = group(g, -2.4, 0.24, -1.8);
    box(hatch, 0.9, 0.3, 0.9, 0, 0.15, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    box(hatch, 0.7, 0.02, 0.7, 0, 0.31, 0, 0x0a0b0d, { rough: 1.0 });
    const rail = group(hatch, 0, 0, 0);
    for (const [x, z, w, d] of [[-0.55, 0, 0.04, 1.1], [0, 0.55, 1.1, 0.04]]) box(rail, w, 0.04, d, x, 1.1, z, SKHG_PAL.accent, { rough: 0.5 });
    holoTag(hatch, "hatch rail", -0.3, 1.3, 0.2, { css: SKHG_CSS, w: 0.24 });
    reg(hits, rail, "hatch-rail");
    const gate = group(hatch, 0.55, 0, 0);
    box(gate, 0.04, 0.04, 1.1, 0, 1.1, 0, SKHG_PAL.accent, { rough: 0.5 });
    box(gate, 0.04, 0.04, 1.1, 0, 0.6, 0, SKHG_PAL.accent, { rough: 0.5 });
    gate.rotation.y = 1.1;
    holoTag(gate, "hatch gate", 0.1, 1.3, 0.3, { css: SKHG_CSS, w: 0.24 });
    reg(hits, gate, "hatch-gate");

    // Far hatch, left open by the membrane crew (interrupt target).
    const farHatch = group(g, -2.6, 0.24, 2.4);
    box(farHatch, 0.9, 0.3, 0.9, 0, 0.15, 0, 0x6d7379, { rough: 0.6, metal: 0.4 });
    box(farHatch, 0.7, 0.02, 0.7, 0, 0.31, 0, 0x0a0b0d, { rough: 1.0 });
    holoTag(farHatch, "far hatch — open?", 0, 0.5, 0, { css: "#d2312b", w: 0.34 });
    farHatch.visible = false;
    const farHatchCover = box(farHatch, 0.75, 0.03, 0.75, 0, 0.34, 0, SKHG_PAL.trim, { rough: 0.6 });
    farHatchCover.visible = false;
    reg(hits, farHatchCover, "far-hatch-cover");

    // Final-walk finds.
    const secondCrackMark = box(g, 0.4, 0.1, 0.4, -1.4, 0.35, -2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "second cracked dome", -1.4, 0.55, -2.3, { css: SKHG_CSS, w: 0.34 });
    reg(hits, secondCrackMark, "second-cracked-dome");
    const ventHole = cyl(g, 0.1, 0.1, 0.02, 2.4, 0.256, 2.6, 0x0a0b0d, { rough: 1.0, seg: 14 });
    holoTag(g, "unmarked vent hole", 2.4, 0.4, 2.6, { css: SKHG_CSS, w: 0.3 });
    reg(hits, ventHole, "unmarked-vent-hole");

    // ------------------------------------------------------------ crew, chest, boards
    const membraneCrew = standingFigure(g, -0.4, -2.3, { ry: 0.6, vest: 0xd8f23a, helmet: SKHG_PAL.accent, gloves: true });
    holoTag(membraneCrew, "membrane crew", 0, 2.0, 0, { css: SKHG_CSS, w: 0.3 });
    const chest = toolChest(g, -0.4, -1.4, { ry: 2.0, color: SKHG_PAL.structure });
    chest.position.y = 0.24;
    const harnessRack = group(chest, -0.1, 0.79, 0, 0.3);
    box(harnessRack, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harnessRack, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(harnessRack, "harness", 0, 0.35, 0, { css: SKHG_CSS, w: 0.2 });
    reg(hits, harnessRack, "harness");
    const anchor = group(g, 0.4, 0.24, -0.6);
    cyl(anchor, 0.05, 0.07, 0.45, 0, 0.22, 0, SKHG_PAL.accent, { rough: 0.5, metal: 0.4, seg: 10 });
    torus(anchor, 0.05, 0.012, 0, 0.48, 0, CITY.steel, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(anchor, "anchor clip", 0, 0.65, 0, { css: SKHG_CSS, w: 0.26 });
    reg(hits, anchor, "anchor-clip");
    const radio = instrument(chest, -0.14, 0.79, -0.04, { ry: -0.3, idle: "CH 3 · ROOF", color: SKHG_PAL.accent, w: 0.1, d: 0.16 });
    holoTag(radio, "radio", 0, 0.16, 0, { css: SKHG_CSS, w: 0.2 });
    reg(hits, radio, "radio");

    const plan = holoPanel(g, 0.95, 0.64, -2.5, 1.6, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = SKHG_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("SKYLIGHT + HATCH GUARDING PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Skylights: screen or rail, per plan", "Hatches: rail + self-latching gate",
       "Screen rating: per the manufacturer", "Proof-test every screen before sign-off",
       "NRCA guarding practice"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.13)));
    }, { ry: 0.7, accent: SKHG_ACCENT });
    reg(hits, plan, "plan-board");
    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.35, 0.2, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = SKHG_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("GUARDING LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["Openings: —", "Finds: —", "Proof tests: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 1.1, accent: SKHG_ACCENT });
    reg(hits, log, "log-board");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.9, 0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "roof-inspect") { crack.material = mat(0x59c97b); looseFastener.material = mat(0x59c97b); }
        if (step.id === "screen-carry") carriedPanel.visible = true;
        if (step.id === "screen-fastener") newFrame.visible = true;
        if (step.id === "sealant-bead") sealBead.visible = true;
        if (step.id === "hatch-guard") gate.rotation.y = 0;
        if (step.id === "final-walk") ventHole.material = mat(0x59c97b);
        if (step.id === "log-board") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("GUARDING LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Openings: screened + railed", "Finds: 2 domes + fastener + vent", "Proof tests: both holding"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ROOF CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#c9f5d8", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-catches-panel") carriedPanel.rotation.z = 0.5;
        if (it.id === "hatch-left-open-elsewhere") farHatch.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-catches-panel") { carriedPanel.visible = false; panelFlat.visible = true; }
        if (it.id === "hatch-left-open-elsewhere") farHatchCover.visible = true;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "screen-fastener") fastenerTool.rotation.z = session.turn.amount * Math.PI * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && (step?.id === "existing-screen-check" || step?.id === "new-screen-proof")) {
          const face = step.id === "existing-screen-check" ? proofGaugeFace : newProofFace;
          repaint(face, signFace(gg.t >= 0.42 && gg.t <= 0.6 ? "HOLDS" : gg.t < 0.42 ? "LOW" : "OVER", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        fumes.userData.step(dt ?? 0.016, new THREE.Vector3(0, 0, 0), 0.04, 0.2, -0.2);
        void paperFace;
      },
    };
  },
};
