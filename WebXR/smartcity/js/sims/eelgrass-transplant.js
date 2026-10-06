import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Eelgrass Transplant VR — Water & Environmental, station
// eighty-two.
//
// Diver-assisted eelgrass restoration at a generic subtidal site beside a
// former shipyard — not any one site's history, the trade procedure a Bay
// Area eelgrass mitigation crew runs on any planting day. The learner is the
// dive supervisor on the boat deck, never in the water: a commercial diver
// from Pile Drivers Local 34 harvests and plants shoots under the
// supervisor's checks, comms and a standby diver, while a tender minds the
// line. Everything here answers the two questions a dive supervisor is
// legally the one accountable for — is it safe to put a diver in the water
// right now, and does the crew know the moment it stops being safe — plus
// the two an eelgrass mitigation permit is written around: did the donor bed
// give up only its permitted share, and did the shoots go in the ground
// before the clock the boat ride already started against ran out.

const EEL_ACCENT = 0x3fae8f;

export const SIM_EELGRASS_TRANSPLANT = {
  id: "eelgrass-transplant",
  index: "82",
  domain: "Environmental",
  trade: "Dive supervisor / commercial diving crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "Pile Drivers Local 34 (United Brotherhood of Carpenters) commercial divers; OSHA 29 CFR 1910 Subpart T commercial diving operations; Association of Diving Contractors International (ADCI) consensus standards; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Conservation and Development Commission (BCDC) permit; NOAA Fisheries eelgrass mitigation policy for California; USCG diver-down flag carriage requirements",
  name: "Eelgrass Transplant",
  title: simTitle("Eelgrass Transplant"),
  tagline: "Diver-assisted eelgrass restoration: the dive plan and the tide window read, the donor bed harvested to its permitted share, shoots bundled inside the holding time, the standby diver ready before anyone splashes, planted to the grid on the surface tender's line, and the divers recalled the moment a vessel or the visibility says so",
  accent: EEL_ACCENT,
  accentCss: "#3fae8f",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "bed-established", name: "Bed Established", note: "A donor bed harvested to its permitted share and a new bed planted to the grid, with every diver accounted for the whole time" },

  game: system({
    name: "Dive Deck",
    currency: "SHOOT",
    ranks: ["Tender", "Dive Deck Hand", "Dive Supervisor", "Lead Supervisor", "Dive Deck Certified"],
    badges: [
      { id: "plan-honest", name: "Plan Honest", note: "Read the dive plan and the tide/visibility window clean before anyone splashed", test: AWARD.stepClean("dive-plan") },
      { id: "every-diver-up", name: "Every Diver Up", note: "Never a hazard, never a diver unaccounted for", test: AWARD.safe },
      { id: "true-spacing", name: "True Spacing", note: "Holding time and planting spacing both read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-splash", name: "Clean Splash", note: "No corrections across the whole dive", test: AWARD.clean },
      { id: "steady-comms", name: "Steady Comms", note: "Held the comms check steady the whole way", test: AWARD.unbroken },
      { id: "surface-early", name: "Surface Early", note: "Bed planted and divers recovered inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "solo-diver-signal": "You sent the diver down without a standby diver dressed and ready on deck. 29 CFR 1910.424 requires a standby diver at the ready position for any dive that isn't from the surface, because the only way to reach a diver in trouble underwater is another diver already dressed to go — not one who starts suiting up after the emergency starts.",
    "manual-shoot-overpull": "You pulled shoots past the donor bed's permitted harvest share to round out the bundle. NOAA Fisheries' mitigation policy caps what one bed gives up because a donor bed is itself a wild population, not a nursery — take past the cap and the planting that was supposed to offset a habitat loss creates a second one at the source.",
    "umbilical-slack-drop": "You let the diver's umbilical go slack and drop into the prop wash instead of tending it taut. A slack line is a line a passing hull or a prop can catch, and it is also a line that can no longer tell the surface anything about where the diver is or whether they are pulling on it — the tender's whole job is keeping that line a channel, not a hazard.",
    "shoots-left-on-deck": "You left a bundle of harvested shoots sitting on deck past the holding time instead of getting them back in the water. Eelgrass desiccates fast out of water, and a bundle held past its window goes into the substrate as compost, not as a transplant — the clock on a shoot starts the moment it leaves the donor bed, not when somebody remembers it is still on deck.",
  },

  lateNotes: {
    "harvest-shears": "Harvest after the donor bed's permitted percentage is confirmed on the board — cutting shoots before the cap is read is cutting blind.",
    "bundle-station": "Bundle and weight the shoots after they are harvested. There is nothing to bundle before the shears have actually been in the bed.",
    "grid-marker-1": "Plant at the grid after the dive supervisor's checks are done and the diver is actually in the water — a grid marker on the surface does not move sediment on its own.",
    "tender-line": "Tend the line once the diver has actually gone in. There is nothing on the umbilical to mind before the dive starts.",
  },

  // Interruptions: see shared/game.js. One is a vessel finding the exclusion
  // zone while the crew's attention is on the grid; the other is the water
  // itself closing the window the dive plan was written against.
  interrupts: [
    {
      id: "vessel-incursion",
      kind: "Vessel entering exclusion zone",
      after: "splash", delay: 4, seconds: 13,
      alert: "A vessel has crossed the dive flag line and is inside the exclusion zone while the diver is still down on the grid.",
      cue: "Recall the diver now — sound the recall before that hull gets any closer.",
      target: "recall-signal",
      why: "A diver working a grid a few feet down cannot see or hear a hull approaching from the surface, and a vessel inside the exclusion zone with a diver still under it is the single most common way a commercial dive turns into a fatality. The recall signal is sounded the moment the incursion is seen, not once the vessel is judged to be getting close enough to matter — there is no safe distance to wait and find out.",
      missNote: "The vessel kept closing while the diver stayed on the grid finishing the row, and the boat crossed directly over the diver's bubbles before anyone signaled a recall — exactly the moment a hull strike or a fouled prop actually happens.",
      wrongNote: "That's not it. The recall signal is the one thing on this deck that reaches a diver who cannot see the boat closing on them.",
    },
    {
      id: "visibility-drop",
      kind: "Visibility dropping below plan minimum",
      after: "tender-watch", delay: 4, seconds: 13,
      alert: "The turbidity off the grid has jumped and the diver's reported visibility has dropped under the plan's stated minimum.",
      cue: "Call the dive per the plan — check the visibility reading and recall if it's still under minimum.",
      target: "visibility-gauge",
      why: "The dive plan's visibility minimum is not a courtesy, it is the number below which a diver working blind on a grid loses the standby diver's ability to reach them fast enough if something goes wrong — ADCI's own consensus standards are built on that response-time math. Reading it and recalling the moment it reads under minimum is what keeps a planting dive from turning into a dive nobody can actually supervise from the surface.",
      missNote: "The dive carried on into water the plan's own minimum said not to work in, and for the rest of that row nobody on deck could have told whether the diver was in trouble or simply hard to see — which is the entire reason the minimum exists.",
      wrongNote: "Not that. The visibility gauge is the one reading that tells you whether this dive is still inside the plan the crew briefed to.",
    },
  ],

  steps: [
    {
      id: "dive-plan", kind: "select", target: "dive-plan-board",
      title: "Read the dive plan and the permit conditions",
      cue: "Check today's dive plan: depth, bottom time, visibility minimum, and the Corps §404 / BCDC harvest conditions.",
      why: "Everything the crew does today is bounded by a plan written before anyone left the dock — how deep, how long, how clear the water has to stay, and how much of the donor bed NOAA Fisheries' mitigation policy allows to be cut. Diving first and checking the plan afterward is how a crew finds out its limits only after crossing one.",
    },
    {
      id: "tide-window", kind: "gauge", target: "tide-current-meter",
      title: "Check the tide and current window",
      cue: "Read the current meter at the grid and commit it against the plan's working window.",
      why: "A diver working against a running current burns air and energy fast and drifts off the grid on every breath; the plan's tide window exists because slack water is the only time a planting dive on a fixed grid is actually a controlled dive rather than a fight with the current.",
      gauge: { label: "CURRENT", speed: 0.7, green: [0.38, 0.58], readout: (t) => `${(t * 1.4).toFixed(1)} kt`, missNote: "Outside the plan's working window. Wait for slack and read the meter again before anyone gears up." },
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-comms", "stage-pfd", "stage-flag"],
      itemNames: { "stage-comms": "dive comms box", "stage-pfd": "supervisor's life vest", "stage-flag": "diver-down flag" },
      title: "Stage the dive supervisor's own station",
      cue: "Comms box, life vest, and the diver-down flag before anyone gears up.",
      why: "The supervisor runs this dive from the surface and never gets in the water — the comms box is the only channel to a diver working a grid out of sight, the vest is buoyancy on a working boat deck, and the flag is the only signal a passing vessel has that there is a diver down here at all.",
    },
    {
      id: "diver-checks", kind: "sequence",
      targets: ["check-umbilical", "check-comms", "check-standby"],
      itemNames: { "check-umbilical": "umbilical and harness", "check-comms": "diver comms", "check-standby": "standby diver dressed" },
      title: "Run the pre-dive checks in order",
      cue: "Umbilical and harness, then comms, then confirm the standby diver is dressed and at the ready position.",
      why: "Each check only means something once the one before it has passed — a comms check on a harness that isn't clipped is a comms check on a diver about to go in the water unsecured, and a standby confirmed before comms are proven is a standby who cannot be called if the primary diver's line goes quiet.",
      outOfOrderNote: "Umbilical and harness first, then comms, then the standby diver. Checking the standby before comms are proven leaves no way to call for the standby if something is already wrong.",
    },
    {
      id: "harvest", kind: "gauge", target: "harvest-cap-meter",
      title: "Confirm the donor bed's permitted harvest share",
      cue: "Read the harvest meter against NOAA Fisheries' mitigation cap for this bed and commit before the shears go in.",
      why: "The cap on this reading is not a target to work up to, it is the line past which the donor bed itself is being drawn down rather than sustainably harvested — a bed cut past its share this season gives up less shoots next season, and the whole point of mitigation is a net gain in eelgrass, not a transfer of loss from one bed to another.",
      gauge: { label: "HARVEST SHARE", speed: 0.7, green: [0.3, 0.5], readout: (t) => `${Math.round(t * 40)}% of bed`, missNote: "Over the permitted share. Stop cutting and confirm the cap again before the shears go back in." },
    },
    {
      id: "harvest-shoots", kind: "sequence", anyOrder: true,
      targets: ["harvest-shears", "bundle-station", "weight-station"],
      itemNames: { "harvest-shears": "harvest shears at the donor bed", "bundle-station": "bundling table", "weight-station": "weight clips" },
      title: "Harvest, bundle and weight the shoots",
      cue: "Cut the shoots, bundle them, and clip a weight to each bundle before they leave the boat.",
      why: "A bundle with no weight floats off the moment it goes back over the side, and loose, unbundled shoots are impossible to plant on a spacing grid one blade at a time — bundled and weighted is what turns a boat deck of cuttings into something a diver can actually carry down and plant.",
    },
    {
      id: "splash", kind: "hold", target: "dive-ladder", seconds: 5,
      title: "Clear the diver to splash",
      cue: "Hold the go signal at the ladder for the full count — a rushed splash is a diver going in before the last check actually lands.",
      why: "The go signal held for the full count is the supervisor's own confirmation that every earlier check — harness, comms, standby — actually happened rather than being waved through, because the diver in the water in the next ten seconds is trusting that this moment wasn't rushed.",
      holdBreakNote: "The signal broke early — that is a diver splashing before the supervisor actually confirmed the last check. Reset and hold the full count.",
    },
    {
      id: "plant-grid", kind: "sequence",
      targets: ["grid-marker-1", "grid-marker-2", "grid-marker-3"],
      itemNames: { "grid-marker-1": "grid marker 1", "grid-marker-2": "grid marker 2", "grid-marker-3": "grid marker 3" },
      title: "Direct the diver to plant at the grid, marker to marker",
      cue: "Call the diver across markers 1, then 2, then 3, planting at the design spacing as they go.",
      why: "The mitigation permit specifies a planting density, not just a planted area, and a diver working without a called sequence drifts toward planting wherever the last bundle happens to be rather than the spacing the design actually calls for. Calling it marker to marker is how a boat deck's plan becomes an even bed on the bottom.",
      outOfOrderNote: "Marker 1, then marker 2, then marker 3 — the design spacing only holds if the grid gets planted in the order it was laid out in.",
    },
    {
      id: "tender-watch", kind: "track", target: "tender-line", seconds: 7,
      title: "Tend the umbilical through the planting run",
      cue: "Hold the line tension in the working range — no slack for a hull to catch, no drag on the diver.",
      why: "A tender pays the line in and out against exactly what the diver's position needs — too slack and the line can foul a prop or the diver's own fins, too taut and it drags the diver off the grid mid-plant. Steady tension is what keeps the umbilical doing its job of tracking the diver instead of fighting them.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.5, fall: 0.45, drift: 0.12, label: "LINE TENSION", readout: (v) => (v < 0.4 ? "slack — fouling risk" : v > 0.6 ? "too taut — dragging the diver" : "tracking the diver") },
      holdBreakNote: "The line went out of band and the tension broke rhythm — bring it back before it either fouls or drags.",
    },
    {
      id: "recover", kind: "turn", target: "dive-winch",
      title: "Recover the diver up the ladder",
      cue: "Wind the ladder winch to bring the diver up at a steady rate.",
      why: "A diver brought up too fast off a shallow working dive still has decompression obligations the plan accounts for, and a rushed recovery skips the safety stop the dive computer is counting on. Steady is what makes the recovery match the dive the plan actually authorized.",
      turn: { turns: 0.85, axis: "y", label: "LADDER WINCH" },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["o2-kit-check", "log-book-check"],
      itemNames: { "o2-kit-check": "the emergency oxygen kit", "log-book-check": "the dive log" },
      itemNotes: {
        "o2-kit-check": "The emergency oxygen kit's seal is broken and the cylinder is showing under pressure — it needs swapping before the next dive of the day, not after somebody needs it.",
        "log-book-check": "The dive log hasn't been filled in for this dive — bottom time, visibility, and the standby diver's name all belong in it before the crew moves on.",
      },
      title: "Walk the deck before the crew stands down",
      cue: "Check the emergency oxygen kit and the dive log before this dive is closed out.",
      why: "The oxygen kit is the one piece of gear on this deck that only matters in the exact moment it is needed, and the log is the only record that this dive happened inside the plan it was briefed against — both get checked now, while the crew is still standing here, not after everyone has already broken down the gear.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, EEL_ACCENT);

    // ------------------------------------------------------------ the water
    // Textured with citykit's shared surfaceTexture + waterFace rather than a
    // flat colour, so the bay under the boat reads as water rather than a
    // tinted plane. Tiled and drifted in animate() so it reads as moving.
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, {
      base: "#0d3a3a", mid: "#0f4a44", base2: "#0a2e2e",
    }), { repeat: 4, px: 256 });
    const water = box(g, 6.2, 0.03, 5.6, 0, 0.012, -0.4, 0x0f4a44, { rough: 0.22, metal: 0.28, opacity: 0.86, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.22, metal: 0.25, color: 0x2c8a7a });
    water.material.transparent = true;
    water.material.opacity = 0.86;

    // Eelgrass meadow glimpsed under the surface near the grid, so the bed
    // the diver is working reads as something living rather than an
    // abstraction. Sits below the water plane's opacity so it reads as
    // submerged, not as a lawn on top of the water.
    const meadow = group(g, 0.6, -0.05, -1.1);
    for (let i = 0; i < 40; i++) {
      const bx = (Math.random() - 0.5) * 2.0, bz = (Math.random() - 0.5) * 1.2;
      const blade = cyl(meadow, 0.006, 0.01, 0.22 + Math.random() * 0.1, bx, 0.1, bz, 0x2f7a5f, { rough: 0.9, seg: 4, cast: false });
      blade.rotation.z = (Math.random() - 0.5) * 0.3;
    }

    const spray = particles(g, 22, 0xbfe9df, { size: 0.03, life: 0.85, additive: false, opacity: 0.35 });
    spray.position.set(0, 0.05, -2.0);

    // -------------------------------------------------------------- the boat
    // The boat deck is the learner's floor — everything the supervisor
    // touches lives on it, at or above y=0.
    const boat = group(g, 0, 0.05, 0.9);
    box(boat, 2.6, 0.5, 2.0, 0, 0.28, 0, 0x2b3a3f, { rough: 0.65, metal: 0.3, cast: false });
    box(boat, 2.6, 0.06, 2.0, 0, 0.56, 0, 0x36474d, { rough: 0.6, metal: 0.25 });
    box(boat, 0.9, 0.7, 0.8, -0.6, 0.95, 0.5, 0x1f2b30, { rough: 0.6, metal: 0.2, cast: false });
    for (let i = -1; i <= 1; i++) box(boat, 0.02, 0.4, 2.0, i * 1.28, 0.75, 0, 0x8a939b, { rough: 0.45, metal: 0.6, cast: false });

    const deckLadder = group(boat, 0.9, 0.05, 0.95, 0);
    for (let i = 0; i < 4; i++) cyl(deckLadder, 0.012, 0.012, 0.35, -0.14, 0.5 - i * 0.14, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    for (const sx of [-0.1, 0.1]) cyl(deckLadder, 0.014, 0.014, 0.6, sx, 0.25, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(deckLadder, "dive ladder — hold to clear", 0, 0.7, 0, { css: "#3fae8f", w: 0.5 });
    reg(hits, deckLadder, "dive-ladder");
    const soloSignalHit = box(boat, 0.3, 0.3, 0.3, 1.15, 0.6, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(boat, "wave the diver down solo?", 1.15, 0.85, 0.7, { css: "#e8622a", w: 0.5 });
    reg(hits, soloSignalHit, "solo-diver-signal");

    const winchGrp = group(boat, 0.6, 0.6, 0.95);
    const diveWinch = valveWheel(winchGrp, 0, 0.14, 0, { r: 0.08, color: 0xe8b02e, body: 0x2b3138 });
    holoTag(winchGrp, "ladder winch", 0, 0.36, 0, { css: "#3fae8f", w: 0.34 });
    reg(hits, diveWinch.userData.wheel, "dive-winch");

    const flagMast = group(boat, -0.9, 0.56, 0.9);
    cyl(flagMast, 0.012, 0.012, 0.6, 0, 0.3, 0, 0x8a939b, { rough: 0.4, metal: 0.6, seg: 8 });
    const flag = box(flagMast, 0.18, 0.13, 0.006, 0.1, 0.55, 0, 0xd8232a, { rough: 0.6 });
    decal(flagMast, 0.13, 0.09, 0.1, 0.55, 0.004, signFace("DIVER", { bg: "#d8232a", accent: "#ffffff", scale: 0.5 }));
    reg(hits, flag, "stage-flag");

    // Supervisor's console: comms box, vest, gauges.
    const console_ = toolChest(boat, -0.15, 0.75, { color: 0x2f6f6a });
    const commsBox = group(console_, 0, 0.95, -0.12);
    box(commsBox, 0.14, 0.09, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    decal(commsBox, 0.12, 0.04, 0, 0.046, 0, signFace("COMMS", { bg: "#0d241f", accent: "#dff5ee", scale: 0.5 })).rotation.x = -Math.PI / 2;
    reg(hits, commsBox, "stage-comms");
    const pfdBox = group(console_, -0.22, 0.9, -0.12);
    box(pfdBox, 0.14, 0.08, 0.1, 0, 0, 0, 0xe8b02e, { rough: 0.8 });
    reg(hits, pfdBox, "stage-pfd");

    // Umbilical station: comms/harness/standby checks and the visibility gauge.
    const commsPost = group(boat, -0.9, 0.56, -0.5, 0.4);
    cyl(commsPost, 0.03, 0.035, 0.6, 0, 0.3, 0, 0x4a5c58, { rough: 0.5, metal: 0.5, seg: 10 });
    const commsHead = instrument(commsPost, 0, 0.62, 0, { idle: "-- COMMS", color: 0x3fae8f, w: 0.14, d: 0.18 });
    holoTag(commsPost, "diver comms", 0, 0.84, 0, { css: "#3fae8f", w: 0.32 });
    reg(hits, commsHead, "check-comms");

    const harnessRack = group(boat, -0.55, 0.56, -0.55);
    torus(harnessRack, 0.08, 0.014, 0, 0.16, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 8, seg2: 18 });
    for (const dx of [-0.06, 0.06]) cyl(harnessRack, 0.01, 0.01, 0.3, dx, 0.02, 0, 0xc9c2ac, { rough: 0.7, seg: 8 });
    holoTag(harnessRack, "umbilical & harness", 0, 0.36, 0, { css: "#3fae8f", w: 0.44 });
    reg(hits, harnessRack, "check-umbilical");

    const standbyRack = group(boat, -0.15, 0.56, -0.72);
    cyl(standbyRack, 0.06, 0.06, 0.4, 0, 0.2, 0, 0x2f6f6a, { rough: 0.5, metal: 0.4, seg: 14 });
    box(standbyRack, 0.14, 0.1, 0.08, 0, 0.42, 0, 0x8a939b, { rough: 0.5, metal: 0.5 });
    const standbyLight = ball(standbyRack, 0.03, 0.1, 0.48, 0, 0x3a3f45, { rough: 0.5, seg: 12 });
    holoTag(standbyRack, "standby diver's gear", 0, 0.6, 0, { css: "#3fae8f", w: 0.4 });
    reg(hits, standbyRack, "check-standby");
    const standbyDiver = standingFigure(boat, -0.4, -0.75, { ry: 2.9, cloth: 0x1a3a3a, vest: 0xf2c14b, helmet: 0x1a3a3a, atStation: true });
    void standbyDiver;

    // -------------------------------------------------------------- the grid
    // Anchored off the bow, over the meadow, on posts driven into the
    // mudline so the markers read as fixed to the bottom rather than
    // floating debris.
    const gridMarkers = {};
    for (const [id, x, z] of [["grid-marker-1", -0.4, -1.6], ["grid-marker-2", 0.6, -1.55], ["grid-marker-3", 1.5, -1.6]]) {
      const post = group(g, x, -0.02, z);
      cyl(post, 0.014, 0.016, 0.5, 0, 0.02, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      const cap = ball(post, 0.05, 0, 0.28, 0, 0xe8622a, { rough: 0.6, seg: 12 });
      reg(hits, post, id);
      gridMarkers[id] = { post, cap };
    }

    // Donor bed and harvest station, slightly apart from the planting grid.
    const donorBed = group(g, -2.2, -0.03, -1.3);
    for (let i = 0; i < 28; i++) {
      const bx = (Math.random() - 0.5) * 0.9, bz = (Math.random() - 0.5) * 0.7;
      cyl(donorBed, 0.006, 0.01, 0.2 + Math.random() * 0.08, bx, 0.09, bz, 0x3a8f6a, { rough: 0.9, seg: 4, cast: false });
    }
    const harvestMeter = instrument(g, -2.0, 0.5, -0.55, { idle: "-- %", color: 0x3fae8f, w: 0.14, d: 0.2 });
    holoTag(g, "harvest share — NOAA cap", -2.0, 0.72, -0.55, { css: "#3fae8f", w: 0.5 });
    reg(hits, harvestMeter, "harvest-cap-meter");

    const shears = group(boat, -1.1, 0.56, 0.2, -0.3);
    box(shears, 0.05, 0.16, 0.02, 0, 0.08, 0, 0x8a939b, { rough: 0.4, metal: 0.7 });
    box(shears, 0.14, 0.02, 0.02, 0.05, 0.16, 0, 0x2b3138, { rough: 0.6 });
    holoTag(shears, "harvest shears", 0, 0.32, 0, { css: "#3fae8f", w: 0.32 });
    reg(hits, shears, "harvest-shears");
    const overpullHit = box(g, 0.4, 0.3, 0.4, -2.6, 0.2, -1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut past the cap?", -2.6, 0.5, -1.5, { css: "#e8622a", w: 0.4 });
    reg(hits, overpullHit, "manual-shoot-overpull");

    const bundleTable = group(boat, -1.0, 0.56, 0.65);
    box(bundleTable, 0.4, 0.04, 0.3, 0, 0.02, 0, 0x6f6248, { rough: 0.75 });
    holoTag(bundleTable, "bundling table", 0, 0.24, 0, { css: "#3fae8f", w: 0.34 });
    reg(hits, bundleTable, "bundle-station");
    const shootBundle = group(bundleTable, 0, 0.05, 0);
    for (let i = 0; i < 6; i++) cyl(shootBundle, 0.005, 0.008, 0.16, -0.1 + i * 0.04, 0.08, 0, 0x3a8f6a, { rough: 0.9, seg: 4, cast: false });
    const leftOnDeckHit = box(boat, 0.3, 0.3, 0.3, -1.0, 0.8, 0.65, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(boat, "leave it on deck past the clock?", -1.0, 1.05, 0.65, { css: "#e8622a", w: 0.56 });
    reg(hits, leftOnDeckHit, "shoots-left-on-deck");

    const weightBin = group(boat, -0.6, 0.56, 0.65);
    box(weightBin, 0.2, 0.08, 0.16, 0, 0.04, 0, 0x4a4f54, { rough: 0.6, metal: 0.5 });
    holoTag(weightBin, "weight clips", 0, 0.24, 0, { css: "#3fae8f", w: 0.3 });
    reg(hits, weightBin, "weight-station");

    // ----------------------------------------------------------- the diver
    const diverHome = new THREE.Vector3(0.6, -0.28, -1.55);
    const diver = standingFigure(g, diverHome.x, diverHome.z, { ry: 0.4, cloth: 0x1a3a3a, vest: 0x2f6f5f, atStation: true, helmet: 0x1a3a3a });
    diver.position.y = diverHome.y;
    diver.rotation.x = 0;
    diver.visible = false;

    const umbilical = group(boat, 0.9, 0.3, 0.95);
    cyl(umbilical, 0.014, 0.014, 0.9, 0, -0.15, 0, 0xe8b02e, { rough: 0.6, seg: 10 });
    reg(hits, umbilical, "tender-line");
    const tenderFigure = standingFigure(boat, 0.85, 0.55, { ry: -0.6, cloth: 0x2f4d5f, vest: 0xe8b02e, atStation: true });
    void tenderFigure;
    const slackHit = box(g, 0.4, 0.3, 0.4, 0.6, -0.1, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let the line go slack?", 0.6, 0.2, 0.4, { css: "#e8622a", w: 0.44 });
    reg(hits, slackHit, "umbilical-slack-drop");

    // -------------------------------------------------------------- gauges
    const tideMeterGrp = group(g, 1.9, 0.02, 0.6, -0.4);
    cyl(tideMeterGrp, 0.025, 0.03, 0.4, 0, 0.2, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 });
    const tideMeter = instrument(tideMeterGrp, 0.14, 0.34, 0, { idle: "-- kt", color: 0x3fae8f, w: 0.13, d: 0.19 });
    holoTag(tideMeterGrp, "tide / current meter", 0, 0.56, 0, { css: "#3fae8f", w: 0.44 });
    reg(hits, tideMeter, "tide-current-meter");

    const visGaugeGrp = group(g, 1.4, -0.02, -1.4);
    cyl(visGaugeGrp, 0.02, 0.024, 0.3, 0, 0.15, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 10 });
    const visGauge = instrument(visGaugeGrp, 0.12, 0.26, 0, { idle: "-- ft", color: 0x3fae8f, w: 0.12, d: 0.18 });
    const visLamp = ball(visGaugeGrp, 0.03, -0.14, 0.3, 0, 0x3a3f45, { rough: 0.5, seg: 12 });
    holoTag(visGaugeGrp, "diver visibility", 0, 0.44, 0, { css: "#3fae8f", w: 0.4 });
    reg(hits, visGauge, "visibility-gauge");

    // Recall signal — the interrupt target for a vessel in the exclusion zone.
    const recallGrp = group(boat, 0.4, 0.56, -0.55);
    cyl(recallGrp, 0.03, 0.03, 0.16, 0, 0.08, 0, 0xd8232a, { rough: 0.5, metal: 0.4, seg: 12 });
    const recallLight = ball(recallGrp, 0.035, 0, 0.17, 0, 0x8a2a2a, { emissive: 0x8a2a2a, ei: 0.4, rough: 0.4, seg: 12 });
    holoTag(recallGrp, "diver recall", 0, 0.32, 0, { css: "#d8232a", w: 0.3 });
    reg(hits, recallLight, "recall-signal");

    // Intruding vessel, hidden until the interrupt fires.
    const intruder = group(g, 3.8, 0.05, -1.8, -0.8);
    box(intruder, 1.3, 0.32, 0.6, 0, 0.2, 0, 0x2f3a3f, { rough: 0.7, metal: 0.25, cast: false });
    box(intruder, 0.5, 0.36, 0.5, -0.2, 0.5, 0, 0xe8edf1, { rough: 0.6, cast: false });
    intruder.visible = false;
    const intruderHome = intruder.position.clone();

    // ------------------------------------------------------- dive plan board
    const planBoard = holoPanel(g, 0.92, 0.62, -2.1, 1.05, 1.0, (cx, w, h) => {
      cx.fillStyle = "#0b1c1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fae8f"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff5ee"; cx.fillText("DIVE PLAN — EELGRASS MITIGATION", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e6faf3";
      ["Max depth / bottom time — see log", "Visibility minimum: per plan", "OSHA 1910 Subpart T — standby required",
       "USACE §404 / BCDC harvest cap", "NOAA Fisheries mitigation policy"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.5, accent: EEL_ACCENT });
    reg(hits, planBoard, "dive-plan-board");

    // ---------------------------------------------------------------- walk items
    const o2Kit = group(boat, 0.3, 0.56, 0.95);
    box(o2Kit, 0.16, 0.12, 0.12, 0, 0.06, 0, 0xd8232a, { rough: 0.6 });
    decal(o2Kit, 0.14, 0.06, 0, 0.13, 0.061, signFace("O2", { bg: "#2a0d0d", accent: "#ffdada", scale: 0.6 }));
    reg(hits, o2Kit, "o2-kit-check");
    const logBook = box(boat, 0.14, 0.02, 0.1, 0.6, 0.58, 0.6, 0xc9c2ac, { rough: 0.85 });
    reg(hits, logBook, "log-book-check");

    cone(g, -2.6, 1.3, { color: EEL_ACCENT });
    cone(g, 2.5, 1.5, { color: EEL_ACCENT });
    barrierPanel(g, 0, 1.9, { color: 0xe8b02e });

    let diverDown = false, recallActive = false, visLow = false, planted = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, 1.9),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "diver-checks") {
          standbyLight.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
        }
        if (step.id === "harvest") {
          repaint(harvestMeter.userData.screen, signFace("LOGGED", { bg: "#0b1c1a", accent: "#59c97b", fg: "#dff5ee", scale: 0.5 }));
        }
        if (step.id === "harvest-shoots") {
          for (const bx of shootBundle.children) bx.material = mat(0xc9a24a, { rough: 0.7 });
        }
        if (step.id === "splash") {
          diverDown = true;
          diver.visible = true;
        }
        if (step.id === "plant-grid") {
          planted = 3;
          for (const m of Object.values(gridMarkers)) m.cap.material = mat(0x59c97b, { rough: 0.6 });
        }
        if (step.id === "recover") {
          diverDown = false;
          diver.visible = false;
        }
        if (step.id === "walk") {
          o2Kit.visible = false;
          logBook.visible = false;
        }
      },

      onInterrupt(it) {
        if (it.id === "vessel-incursion") {
          recallActive = true;
          intruder.visible = true;
          recallLight.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 2.4, rough: 0.4 });
        }
        if (it.id === "visibility-drop") {
          visLow = true;
          visLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
          repaint(visGauge.userData.screen, signFace("LOW", { bg: "#2a1c0d", accent: "#f0645b", fg: "#ffe8d8", scale: 0.6 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vessel-incursion") {
          recallActive = false;
          intruder.visible = false;
          intruder.position.copy(intruderHome);
          recallLight.material = mat(0x8a2a2a, { emissive: 0x8a2a2a, ei: 0.4, rough: 0.4 });
        }
        if (it.id === "visibility-drop") {
          visLow = false;
          visLamp.material = mat(0x3a3f45, { rough: 0.5 });
          repaint(visGauge.userData.screen, signFace("CLEAR", { bg: "#0b1c1a", accent: "#59c97b", fg: "#dff5ee", scale: 0.55 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        spray.visible = true;
        spray.userData.step(dt, new THREE.Vector3(0, 0.06, -2.0), 0.6, 0.3, -0.2);
        water.position.y = 0.012 + Math.sin(t * 1.1) * 0.005;
        if (waterTex.offset) {
          waterTex.offset.x = (t * 0.015) % 1;
          waterTex.offset.y = (t * 0.01) % 1;
        }
        if (diverDown) diver.position.y = diverHome.y + Math.sin(t * 1.6) * 0.02;
        for (let i = 0; i < planted; i++) {
          const m = Object.values(gridMarkers)[i];
          if (m) m.post.position.y = -0.02 + Math.sin(t * 1.3 + i) * 0.002;
        }
        if (recallActive) intruder.position.x = intruderHome.x - Math.min(1.6, t % 20 * 0.25);
        recallLight.material.emissiveIntensity = recallActive ? 1.8 + Math.sin(t * 8) * 0.6 : 0.4;
        void visLow;

        const step = session?.step;
        if (step?.id === "tender-watch" && session.track) {
          const v = session.track.v;
          umbilical.rotation.z = (v - 0.5) * 0.3;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "tide-window") {
            repaint(tideMeter.userData.screen, signFace(`${(gg.t * 1.4).toFixed(1)} kt`, { bg: "#0b1c1a", accent: gg.t >= 0.38 && gg.t <= 0.58 ? "#59c97b" : "#f0645b", fg: "#dff5ee", scale: 0.55 }));
          }
          if (step?.id === "harvest") {
            repaint(harvestMeter.userData.screen, signFace(`${Math.round(gg.t * 40)}%`, { bg: "#0b1c1a", accent: gg.t >= 0.3 && gg.t <= 0.5 ? "#59c97b" : "#f0645b", fg: "#dff5ee", scale: 0.6 }));
          }
        }
      },
    };
  },
};
