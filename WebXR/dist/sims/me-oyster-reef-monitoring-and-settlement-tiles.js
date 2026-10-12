import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, reg, surfaceTexture, texturedMat, mudflatFace, waterFace, instrument, standingFigure } from "../citykit.js";
import { settlementTileRack } from "../../../shared/props.js";
import { skiff } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Oyster Reef Monitoring & Settlement Tiles VR — Marine Ecology
// & Restoration, station two of the ECO1 pack.
//
// A settlement-tile swap on a restored shellfish reef at low water, worked
// from a skiff nosed onto the reef's edge: the plan and the tide window read,
// the reef crossed on its marked path, the deployed rack lifted into a wet
// tray, each tile labelled, photographed on the grid board and bagged in
// order, a fresh rack set back on the same footing at the same orientation
// mark, and the swap recorded before the flood. The learner is the field
// technician on a monitoring crew; the skiff tender holds the boat. What is
// taught is the tile METHOD — the chain that keeps a tile's identity and
// wetness from the reef to the lab — not any claim about what settles on it.

const MEOR_ACCENT = 0xc9b48a;
const MEOR_CSS = "#c9b48a";
const MEOR_WARN = "#e8622a";

function meorCard(lines, band = MEOR_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "#14140f"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f4efe0"; cx.fillText("TILE SWAP — RACK CARD", w * 0.06, h * 0.2);
    cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#faf6ea";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.17)));
  };
}

export const SIM_ME_OYSTER_REEF_MONITORING_AND_SETTLEMENT_TILES = {
  id: "me-oyster-reef-monitoring-and-settlement-tiles",
  index: "602",
  domain: "Environmental",
  trade: "Field technician on a shellfish-reef monitoring crew, swapping settlement tiles at low water from a skiff held by a tender",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "fog",
  certification: "AFSCME and LIUNA monitoring and habitat crews as training bodies; OSHA 29 CFR 1910.132 personal protective equipment for shell, cold water and the skiff; Regional Water Quality Control Board Section 401 and Section 404 monitoring conditions the tile record answers; BCDC permit conditions for the reef; NOAA Fisheries and the U.S. Fish and Wildlife Service consultation measures for the work window; CDFW oversight of the collecting and handling the tiles involve",
  name: "Oyster Reef Monitoring & Settlement Tiles",
  title: simTitle("Oyster Reef Monitoring & Settlement Tiles"),
  tagline: "The tile plan and the tide window read, gloves, boots and vest on, the reef crossed on its path, the rack lifted into the wet tray, the cracked and the unlabelled tile found, each tile labelled, shot on the grid and bagged in order, the board held square while the flood reaches the tray, the fresh rack turned to its mark and set on its footing, the kit stowed, the tender called and the swap logged",
  accent: MEOR_ACCENT,
  accentCss: MEOR_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tile-chain-kept", name: "Tile Chain Kept", note: "Every tile kept wet, labelled and in order from the reef to the bag, and the fresh rack back on its own footing at its mark" },

  supportLine: "your union hall's member assistance programme — AFSCME or LIUNA, whichever your crew works under — with the employer's employee assistance line behind it",

  game: system({
    name: "Reef Crew",
    currency: "TILE",
    ranks: ["Field Hand", "Tile Tech", "Reef Tech", "Monitoring Lead", "Reef Certified"],
    badges: [
      { id: "in-order", name: "In Order", note: "Every tile labelled, shot and bagged in rack order first time", test: AWARD.stepClean("label-shoot-bag") },
      { id: "reef-kept", name: "Reef Kept", note: "Never a hazard, never a mound crossed", test: AWARD.safe },
      { id: "true-window", name: "True Window", note: "The tide staff read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-swap", name: "Clean Swap", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-board", name: "Steady Board", note: "The path walked and the board held without a break", test: AWARD.unbroken },
      { id: "off-before-flood", name: "Off Before The Flood", note: "Swap logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-the-mounds": "You stepped straight over the reef mounds to reach the rack instead of walking the flagged path round them. Live shell breaks under a boot the way it breaks under a wave, and a reef trodden down by the crew that monitors it stops being a fair test of the restoration; the path is flagged so the same few square metres take every footfall.",
    "bare-hand-on-shell": "You reached bare-handed into the reef to free the rack's foot. Cured shell has edges that open a glove, let alone a hand, in cold water where you will not feel the cut until it is bleeding — the gloves stay on for anything touching the reef, and the foot is freed with the pry bar, not fingers.",
    "tiles-in-the-sun": "You laid the wet tiles out on the skiff's thwart to dry off before photographing them. Whatever has settled on a tile is alive in a film of water, and a tile that dries is a tile whose record is gone before the camera reaches it; tiles go from the rack into the wet tray and from the tray into the bag, wet the whole way.",
    "rack-anywhere": "You set the fresh rack on a flat bit of rock that looked about right instead of the marked footing. A settlement rack is a fixed station precisely so the same footing at the same height and orientation is sampled every time; a rack set anywhere else produces a tile count that cannot be compared with the last one, and the trend the plan exists to build breaks at this swap.",
  },

  lateNotes: {
    "rack-deployed": "The rack is lifted once the reef has been crossed on its path — nothing is carried until the technician is standing where the plan says.",
    "photo-board": "The board is held once the tiles are labelled — a photograph of an unlabelled tile is a picture of nothing the lab can file.",
    "rack-fresh": "The fresh rack goes in after its orientation mark is turned to the footing's — set first and turned after, and the tiles face a different way to last time.",
    "rack-card": "The card is written once the fresh rack is set; the record says what is on the reef now, not what was about to be.",
  },

  steps: [
    {
      id: "tile-plan", kind: "select", target: "tile-plan-board",
      title: "Read the tile plan and the tide window",
      cue: "Check which rack is due, how many tiles it holds and in what order, the footing's orientation mark, and the low-water window the tide table gives for the crossing.",
      why: "A settlement-tile record works only if every tile keeps its identity from the reef to the lab — rack, row and position — and if the rack goes back on the same footing facing the same way. The plan holds those facts; the tide table holds the other constraint, a window that opens and closes without regard to how the swap is going. Reading both before the skiff touches the reef is how the crew arrives knowing what it will lift, what it will set, and when it must be back in the boat.",
    },
    {
      id: "kit-on", kind: "sequence", anyOrder: true,
      targets: ["gloves-on", "boots-on", "vest-on"],
      itemNames: { "gloves-on": "cut-resistant gloves", "boots-on": "felt-soled reef boots", "vest-on": "work vest" },
      title: "Gloves, reef boots and the work vest before the reef",
      cue: "Cut-resistant gloves, felt-soled boots for the wet rock, and the work vest zipped — every one on before a foot leaves the skiff.",
      why: "The reef is sharp shell on slick rock beside deep cold water, and 29 CFR 1910.132 asks the employer to have assessed exactly that: the gloves against the shell, the boots against the slick, the vest for the moment a technician leaning over a rack steps off the edge into water that takes the use of the hands in minutes. They go on in the skiff because a glove pulled on with a hand already bleeding is a bandage, not protection.",
    },
    {
      id: "read-staff", kind: "gauge", target: "tide-staff",
      title: "Read the tide staff against the working window",
      cue: "Read where the water stands on the staff at the reef edge and commit it against the low-water window the plan gives.",
      why: "The tide table is a prediction of the moon's pull; the staff is where the water actually is this morning after the wind and the pressure have had their say, and the two disagree often enough that the staff is what the crew works to. Reading it before the crossing sets how long the rack can be off its footing, and a reading committed now is a decision the crew made on the reef's edge rather than one made late with the tray already awash.",
      gauge: { label: "TIDE STAFF", speed: 0.7, green: [0.34, 0.54], readout: (t) => (t < 0.34 ? "still falling — wait" : t <= 0.54 ? "inside the working window" : "flood running — window closing"), missNote: "Outside the working window. Read the staff again and go only when the water stands inside the plan's band." },
    },
    {
      id: "walk-path", kind: "track", target: "reef-path", seconds: 6,
      title: "Walk the flagged path across the reef",
      cue: "Follow the flags at a pace that keeps both feet on the marked rock — no long steps, no shortcuts over the mounds.",
      why: "The path is flagged so the crew's footfalls land on the same few metres of bare rock every visit and the shell they are here to measure is never under a boot; walking it steadily keeps a technician carrying a tray from a long step onto a mound or a slick patch. The pace is set by the footing and the load, not by the tide — a hurried crossing is how the reef gets trampled and the tray gets dropped.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "PACE ON THE PATH", readout: (v) => (v < 0.4 ? "stopped — flood is not waiting" : v > 0.6 ? "hurrying — long steps off the flags" : "steady on the flagged rock") },
      holdBreakNote: "The pace broke — hurrying off the flags or stalled mid-reef. Find the next flag and take it up again.",
    },
    {
      id: "lift-rack", kind: "drag", target: "rack-deployed",
      title: "Lift the deployed rack into the wet tray",
      cue: "Free the rack's feet with the pry bar, lift it level by both uprights and set it in the wet tray with its tiles still hanging.",
      why: "The rack comes off its footing level and goes straight into a tray of reef water so the tiles never dry and never touch each other, because a tile face rubbed against its neighbour has lost part of the record the lab will count. It is lifted by the uprights and not the crossbar the tiles hang from, and it goes to the tray, not the deck: the tray is what keeps the chain wet from here to the bag.",
      drag: { to: "wet-tray", radius: 0.55, missNote: "Not in the wet tray — the rack goes straight into reef water, not onto the rock or the deck." },
    },
    {
      id: "inspect-tiles", kind: "find", noHint: true,
      targets: ["tile-cracked", "tile-unlabelled"],
      itemNames: { "tile-cracked": "the tile with a corner broken off", "tile-unlabelled": "the tile whose label has gone" },
      itemNotes: {
        "tile-cracked": "A tile with a corner broken away since it was hung. It is still counted — the lab scores what is left and records the loss of area — but the break goes on the card now so nobody later mistakes a smaller tile for a smaller count.",
        "tile-unlabelled": "A tile whose engraved tag has come off. Its position on the rack is still its identity, so it is labelled from the rack diagram before it moves — the one thing that cannot be recovered later is which slot it hung in.",
      },
      title: "Inspect the tiles in the tray before anything moves",
      cue: "Look across both rows in the tray for a broken tile and a tile that has lost its label; note them on the card before a tile leaves its slot.",
      why: "The rack diagram on the card is the only record of which tile hung where, and it is true only while the tiles are still hanging; a damaged or unlabelled tile found after the rack has been stripped is a tile whose position is a guess. Inspecting in the tray, in the rack, before anything moves is how a lost label costs a minute on the reef instead of the whole tile's data in the lab.",
    },
    {
      id: "label-shoot-bag", kind: "sequence",
      targets: ["label-pen", "photo-board", "sample-bag"],
      itemNames: { "label-pen": "engraving pen — rack, row, slot on the tile", "photo-board": "grid photo board with the scale and the card", "sample-bag": "labelled bag in the cooler" },
      title: "Label, photograph and bag each tile in rack order",
      cue: "For each tile in turn: confirm or re-engrave its label, shoot it face-up on the grid board with the card in frame, and bag it wet in the cooler.",
      why: "The three steps are one chain and their order is the method: a tile is photographed only once its label is on it, so the photograph carries its identity, and bagged only once it is photographed, so the bag holds a tile the lab can match to a frame. Doing it tile by tile in rack order means the card, the camera and the cooler agree without anyone reconstructing the sequence on the drive back.",
      outOfOrderNote: "Out of order — label first, then the board, then the bag. A photograph of an unlabelled tile is a picture the lab cannot file.",
    },
    {
      id: "board-hold", kind: "hold", target: "board-hold", seconds: 5,
      title: "Hold the grid board square for the tile shot",
      cue: "Hold the board level and square under the camera with the scale and the card in frame for the full count — no tilt, no shadow across the tile.",
      why: "The lab counts recruits from the photograph against the grid, and a board that tilts or drifts during the shot puts the grid's squares at different sizes across the tile; a shadow from the technician's own head hides the corner the count needed. Holding square for the full count is the reef-side proof that the frame is one the lab can score — a rushed shot cannot be told from a careful one until the count is being argued over months later.",
      holdBreakNote: "The board tilted before the count was done — the grid would read unevenly across the tile. Level it and hold again.",
    },
    {
      id: "orient-rack", kind: "turn", target: "orientation-mark",
      title: "Turn the fresh rack to the footing's orientation mark",
      cue: "Turn the fresh rack until the arrow on its crossbar lines up with the painted mark on the footing.",
      why: "The tiles hang face-down and the side of the rack that faces the channel sees a different flow from the side that faces the shore; a rack set ninety degrees from last time samples a different reef in the same spot. The orientation mark is painted on the footing so every crew sets the rack the same way without knowing why — it is turned to the mark before it is set, because a rack turned after setting scours the footing it is meant to sit still on.",
      turn: { turns: 0.7, label: "RACK ORIENTATION", readout: (t) => (t < 0.35 ? "off the mark" : t < 0.9 ? "coming round to the mark" : "arrow on the footing's mark") },
    },
    {
      id: "set-rack", kind: "drag", target: "rack-fresh",
      title: "Set the fresh rack on its footing",
      cue: "Carry the fresh rack level by its uprights and set its feet on the marked footing, arrow to the mark, tiles clear of the rock.",
      why: "The footing is the fixed point of the whole record — the same height above the bed, the same exposure, the same neighbours — and the fresh rack going onto it is what makes the next swap comparable with this one. It is set by its feet so the tiles hang free of the rock, because a tile touching the reef is a tile whose face is settled on from both sides and cannot be scored against the others.",
      drag: { to: "rack-footing", radius: 0.55, missNote: "Not on the footing — the rack's feet go on the marked footing, arrow to the mark, nowhere else." },
    },
    {
      id: "stow-kit", kind: "sequence", anyOrder: true,
      targets: ["cooler-lid", "tray-stow", "pry-bar-stow"],
      itemNames: { "cooler-lid": "cooler lid latched", "tray-stow": "wet tray emptied and stowed", "pry-bar-stow": "pry bar back in the skiff" },
      title: "Stow the cooler, the tray and the pry bar",
      cue: "Latch the cooler over the bagged tiles, empty and stow the tray, and put the pry bar back in the skiff before the crossing back.",
      why: "The crossing back is made with the flood coming and the hands full, and loose kit on a reef is kit that ends up in the water or under a boot. The cooler is latched so the bagged tiles stay wet and cold on the run in, the tray is emptied so nothing spills reef water full of shell into the skiff, and the pry bar goes back where the next technician looks for it.",
    },
    {
      id: "tender-checkin", kind: "select", target: "skiff-radio",
      title: "Call the tender before the crossing back",
      cue: "On the radio: rack swapped and card written, two of you crossing back now, and how the crew is after the flood reached the tray.",
      why: "The tender has held the skiff on the reef's edge through the whole swap and is the one person who can see the flood and the crew at once; the call tells them the crossing is starting so the boat is held where the path meets the water, not drifting off it. It is also the crew's own check-in — a flood at the tray is a frightening minute, and saying so on the radio is part of the job, with the AFSCME or LIUNA member assistance line behind it for whatever the drive back does not settle.",
    },
    {
      id: "swap-log", kind: "select", target: "rack-card",
      title: "Write the rack card and the swap log",
      cue: "On the card: rack and footing, tiles bagged in order, the broken corner and the re-labelled tile, the fresh rack's set time and mark, the staff readings, and the flood at the tray.",
      why: "The card travels with the cooler to the lab and the log stays with the programme, and both have to say the same thing: which tiles came off which footing, in what condition, and what went back. The Section 401 and Section 404 monitoring conditions this reef was built under are answered from records like this one, and the flood reaching the tray goes in as well — the next crew plans its window from what happened to this one.",
    },
  ],

  interrupts: [
    {
      id: "skiff-dragging",
      kind: "Skiff dragging its anchor",
      after: "walk-path", delay: 2, seconds: 14,
      alert: "Behind you the skiff has swung off the reef's edge — its anchor is dragging and the tender is hauling on the line alone.",
      cue: "Stop on the path and take up the skiff's bow line where it is tied off on the reef so the boat comes back to the landing.",
      target: "bow-line",
      why: "The skiff is the crew's way off the reef before the flood, and a boat dragging its anchor on a rising tide drifts further every minute the crew spends finishing the crossing. The bow line was tied off on the reef for exactly this, so a technician on the path can bring the boat back without stepping into the water — the tender on the anchor and the technician on the bow line is two people holding the boat, which is what it takes.",
      missNote: "The skiff drifted off the landing while you finished the crossing, and the crew was left on a reef with the flood running and the boat two hundred hard strokes away for a tender rowing alone.",
      wrongNote: "Not that. The bow line tied off on the reef is what brings the skiff back to the landing — take it up.",
    },
    {
      id: "flood-at-tray",
      kind: "Flood reaching the tray",
      after: "board-hold", delay: 2, seconds: 14,
      alert: "The water has come up the rock faster than the staff reading promised — it is lapping at the wet tray's feet with tiles still in it.",
      cue: "Lift the tray by its handle onto the high rock beside you before the next surge reaches it.",
      target: "tray-handle",
      why: "A tray of tiles lifted by the tide is a tray of tiles scattered across the reef with their positions lost, and a technician who keeps photographing while the water climbs is choosing one frame over the whole rack. The tray goes to the high rock the plan marked for it — one lift, then the work carries on there or the crew calls the swap and finishes on the boat, per the tide, not per how close to done it felt.",
      missNote: "The next surge lifted the tray and turned it; three tiles went into the pool between the mounds, and which slot each had come from was gone with them.",
      wrongNote: "Not that. The tray's handle is what moves the tiles to the high rock in one lift — take it before the surge does.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MEOR_ACCENT);

    // ------------------------------------------------------- the reef flat and the water
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#4a4638", base2: "#3a3628", cracks: 20, pools: 5 }), { repeat: 4, px: 256 });
    const flat = box(g, 6.4, 0.04, 5.8, 0, -0.02, -0.4, 0xffffff, { cast: false });
    flat.material = texturedMat(mudTex, { rough: 1, metal: 0, color: 0x8a8470 });
    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#1c3a3f", mid: "#254a4a", base2: "#17302f" }), { repeat: 4, px: 256 });
    const water = box(g, 6.4, 0.03, 2.4, 0, 0.0, 2.6, 0x254a4a, { cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x3a7a78 });
    water.material.transparent = true; water.material.opacity = 0.86;
    const waterHome = water.position.clone();
    // Reef mounds: shell clusters along the back and the sides.
    for (let i = 0; i < 24; i++) {
      const a = i * 0.62, r = 1.6 + (i % 4) * 0.35;
      const x = Math.cos(a) * r * 1.1, z = -0.6 + Math.sin(a) * r * 0.7;
      if (z > 0.9) continue;
      const m = ball(g, 0.16 + (i % 3) * 0.05, x, 0.06, z, [0x9a8c76, 0x7a7060, 0xb0a48e][i % 3], { rough: 1, seg: 7, seg2: 5 });
      m.scale.set(1.3, 0.6, 1.0);
      for (let k = 0; k < 3; k++) box(g, 0.05, 0.02, 0.07, x + (k - 1) * 0.08, 0.14, z + (k % 2) * 0.05, 0xd8d2c2, { rough: 0.9 }).rotation.set(0.3 * k, k, 0.2);
    }
    // Tide pools between the mounds.
    for (const [x, z] of [[-1.5, -1.6], [1.7, -1.4], [0.3, -2.2]]) {
      const pool = cyl(g, 0.35, 0.35, 0.02, x, 0.005, z, 0x1f3f44, { rough: 0.15, metal: 0.3, opacity: 0.8, transparent: true, seg: 14, cast: false });
      void pool;
    }
    const moundHit = box(g, 0.8, 0.5, 0.6, -1.7, 0.3, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step straight over the mounds?", -1.7, 0.7, -0.9, { css: MEOR_WARN, w: 0.54 });
    reg(hits, moundHit, "cross-the-mounds");

    // ------------------------------------------------------- the flagged path
    const path = group(g, 0, 0, 0);
    for (let i = 0; i < 6; i++) {
      const px = -0.2 + i * 0.36, pz = 1.5 - i * 0.5;
      cyl(path, 0.008, 0.008, 0.5, px, 0.25, pz, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 5 });
      box(path, 0.1, 0.07, 0.006, px + 0.05, 0.48, pz, 0xf06a2b, { rough: 0.6 });
    }
    const pathHit = box(path, 0.5, 0.2, 2.6, 0.7, 0.1, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    pathHit.rotation.y = -0.6;
    holoTag(path, "walk the flags", 0.7, 0.4, 0.4, { css: MEOR_CSS, w: 0.28 });
    reg(hits, pathHit, "reef-path");

    // ------------------------------------------------------- the racks, the footing, the tray
    const footing = group(g, 1.6, 0, -1.0);
    box(footing, 0.7, 0.06, 0.35, 0, 0.03, 0, 0x555b52, { rough: 1 });
    box(footing, 0.12, 0.004, 0.04, 0, 0.062, -0.12, 0xf2c14b, { rough: 0.6, cast: false });
    const footRing = torus(footing, 0.28, 0.01, 0, 0.1, 0, MEOR_ACCENT, { emissive: MEOR_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    footRing.rotation.x = Math.PI / 2;
    holoTag(footing, "footing — orientation mark", 0, 1.0, 0, { css: MEOR_CSS, w: 0.48 });
    reg(hits, footing, "rack-footing");
    const rackOld = settlementTileRack(g, 1.6, 0.06, -1.0, { colour: 0xd8d0b8 });
    holoTag(g, "deployed rack", 1.6, 1.15, -1.0, { css: MEOR_CSS, w: 0.28 });
    reg(hits, rackOld, "rack-deployed");
    const bareHit = box(g, 0.3, 0.2, 0.3, 1.25, 0.15, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "free the foot bare-handed?", 1.25, 0.45, -0.7, { css: MEOR_WARN, w: 0.5 });
    reg(hits, bareHit, "bare-hand-on-shell");
    const rackFresh = settlementTileRack(g, -0.6, 0.06, 1.9, { colour: 0xf4f6f6 });
    const arrow = box(g, 0.14, 0.02, 0.05, -0.6, 0.9, 1.9, 0xf06a2b, { rough: 0.6 });
    holoTag(g, "fresh rack", -0.6, 1.15, 1.9, { css: MEOR_CSS, w: 0.22 });
    reg(hits, rackFresh, "rack-fresh");
    reg(hits, arrow, "orientation-mark");
    const anywhereHit = box(g, 0.5, 0.3, 0.5, 2.3, 0.2, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "set it on any flat rock?", 2.3, 0.55, -0.2, { css: MEOR_WARN, w: 0.44 });
    reg(hits, anywhereHit, "rack-anywhere");
    const tray = group(g, 0.5, 0, -0.4);
    box(tray, 0.8, 0.14, 0.5, 0, 0.07, 0, 0x2b5aa8, { rough: 0.6 });
    box(tray, 0.72, 0.02, 0.42, 0, 0.13, 0, 0x2f6f6a, { rough: 0.2, metal: 0.3, opacity: 0.8, transparent: true, cast: false });
    const trayHandle = cyl(tray, 0.012, 0.012, 0.3, 0, 0.22, 0.26, 0x1b1e22, { rough: 0.6, seg: 8 });
    trayHandle.rotation.z = Math.PI / 2;
    holoTag(tray, "wet tray", 0, 0.42, 0, { css: MEOR_CSS, w: 0.2 });
    reg(hits, tray, "wet-tray");
    holoTag(tray, "tray handle — lift", 0, 0.3, 0.4, { css: "#f06a2b", w: 0.32 });
    reg(hits, trayHandle, "tray-handle");
    const highRock = ball(g, 0.5, -0.4, 0.15, -0.9, 0x555b52, { rough: 1, seg: 9, seg2: 6 });
    highRock.scale.set(1.3, 0.6, 1.0);
    holoTag(g, "high rock", -0.4, 0.6, -0.9, { css: MEOR_CSS, w: 0.2 });
    // The two tiles the inspection finds, on the tray's rim.
    const crackedTile = box(g, 0.15, 0.012, 0.15, 0.2, 0.15, -0.4, 0x9a8c76, { rough: 0.95, finish: "concrete" });
    crackedTile.scale.set(0.8, 1, 0.8);
    reg(hits, crackedTile, "tile-cracked");
    const blankTile = box(g, 0.15, 0.012, 0.15, 0.75, 0.15, -0.4, 0xa39682, { rough: 0.95, finish: "concrete" });
    reg(hits, blankTile, "tile-unlabelled");
    const sunHit = box(g, 0.4, 0.2, 0.3, -1.9, 0.5, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lay the tiles out to dry?", -1.9, 0.8, 1.7, { css: MEOR_WARN, w: 0.46 });
    reg(hits, sunHit, "tiles-in-the-sun");

    // ------------------------------------------------------- the bench kit: pen, board, cooler, pry bar
    const bench = group(g, -1.2, 0, 0.4);
    box(bench, 0.9, 0.5, 0.45, 0, 0.25, 0, 0x6f6248, { rough: 0.8, finish: "brushed" });
    const pen = cyl(bench, 0.012, 0.012, 0.16, -0.3, 0.55, 0.1, 0x1b1e22, { rough: 0.5, seg: 8 });
    pen.rotation.z = 1.1;
    holoTag(bench, "engraving pen", -0.3, 0.72, 0.1, { css: MEOR_CSS, w: 0.28 });
    reg(hits, pen, "label-pen");
    const board = decal(bench, 0.34, 0.26, 0.05, 0.52, -0.05, (cx, w, h) => {
      cx.fillStyle = "#f4f6f6"; cx.fillRect(0, 0, w, h); cx.strokeStyle = "#1b1e22"; cx.lineWidth = 2;
      for (let i = 1; i < 6; i++) { cx.beginPath(); cx.moveTo(w * i / 6, 0); cx.lineTo(w * i / 6, h); cx.stroke(); }
      for (let i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(0, h * i / 4); cx.lineTo(w, h * i / 4); cx.stroke(); }
      cx.fillStyle = "#1b1e22"; cx.fillRect(w * 0.05, h * 0.9, w * 0.3, h * 0.04);
    }, { px: 256 });
    board.rotation.x = -Math.PI / 2;
    holoTag(bench, "grid photo board", 0.05, 0.72, -0.05, { css: MEOR_CSS, w: 0.32 });
    reg(hits, board, "photo-board");
    const boardHold = torus(bench, 0.2, 0.01, 0.05, 0.75, -0.05, MEOR_ACCENT, { emissive: MEOR_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    boardHold.rotation.x = Math.PI / 2;
    holoTag(bench, "hold square — tile shot", 0.05, 0.95, -0.05, { css: MEOR_CSS, w: 0.42 });
    reg(hits, boardHold, "board-hold");
    const cooler = group(g, -2.0, 0, 0.9);
    box(cooler, 0.5, 0.36, 0.34, 0, 0.18, 0, 0xe8edf1, { rough: 0.6 });
    const coolerLid = box(cooler, 0.52, 0.05, 0.36, 0, 0.385, 0, 0x2b5aa8, { rough: 0.55 });
    const bagStack = box(cooler, 0.3, 0.1, 0.2, 0, 0.42, 0, 0xdfe6ea, { rough: 0.4, opacity: 0.6, transparent: true });
    holoTag(cooler, "labelled bag — cooler", 0, 0.62, 0, { css: MEOR_CSS, w: 0.4 });
    reg(hits, bagStack, "sample-bag");
    reg(hits, coolerLid, "cooler-lid");
    const trayStow = torus(g, 0.14, 0.01, -2.5, 0.55, 1.4, MEOR_ACCENT, { emissive: MEOR_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    trayStow.rotation.x = Math.PI / 2;
    holoTag(g, "stow the tray", -2.5, 0.75, 1.4, { css: MEOR_CSS, w: 0.26 });
    reg(hits, trayStow, "tray-stow");
    const pryBar = cyl(g, 0.014, 0.014, 0.7, 1.0, 0.1, 0.4, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 });
    pryBar.rotation.z = 1.4;
    holoTag(g, "pry bar", 1.0, 0.3, 0.4, { css: MEOR_CSS, w: 0.18 });
    reg(hits, pryBar, "pry-bar-stow");

    // ------------------------------------------------------- the tide staff
    const staffGrp = group(g, 2.4, 0, 1.6);
    box(staffGrp, 0.06, 1.3, 0.03, 0, 0.65, 0, 0xf4f6f6, { rough: 0.6 });
    for (let i = 0; i < 10; i++) box(staffGrp, 0.06, 0.02, 0.004, 0, 0.1 + i * 0.13, 0.018, i % 2 ? 0x1b1e22 : 0xd2312b, { rough: 0.6, cast: false });
    const staffHead = instrument(staffGrp, 0.14, 1.0, 0, { idle: "-- staff", color: MEOR_ACCENT, w: 0.13, d: 0.19 });
    holoTag(staffGrp, "tide staff", 0, 1.5, 0, { css: MEOR_CSS, w: 0.22 });
    reg(hits, staffHead, "tide-staff");

    // ------------------------------------------------------- the skiff, the tender, the bow line
    const sk = skiff(g, 1.2, -0.3, 3.2, { ry: Math.PI, livery: { colour: 0xc8ced4, fleetName: "REEF CREW", unitNumber: "SK-2", accent: 0xc9b48a } });
    const skHome = sk.position.clone();
    const tender = standingFigure(g, 1.2, 3.4, { ry: Math.PI, cloth: 0x2f4d5f, vest: 0xe8b02e, atStation: true });
    tender.position.y = 0.1;
    const bowLine = group(g, 1.7, 0, 1.9);
    cyl(bowLine, 0.02, 0.02, 0.4, 0, 0.2, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(bowLine, 0.012, 0.012, 1.4, 0, 0.3, 0.7, 0xf2c14b, { rough: 0.8, seg: 6 }).rotation.x = Math.PI / 2;
    holoTag(bowLine, "bow line — tied off", 0, 0.55, 0, { css: "#f2c14b", w: 0.34 });
    reg(hits, bowLine, "bow-line");
    const radioGrp = group(g, -1.6, 0.5, 0.3);
    const rad = radio(radioGrp, 0, 0, 0, {});
    holoTag(radioGrp, "tender radio", 0, 0.28, 0, { css: MEOR_CSS, w: 0.26 });
    reg(hits, rad, "skiff-radio");

    // ------------------------------------------------------- PPE, boards, card
    const ppe = group(g, -2.4, 0, 2.2);
    const gloves = box(ppe, 0.12, 0.05, 0.16, -0.2, 0.55, 0, 0xd8a63a, { rough: 0.7 });
    const boots = box(ppe, 0.16, 0.16, 0.28, 0.1, 0.08, 0, 0x2b3138, { rough: 0.7 });
    const vest = box(ppe, 0.28, 0.34, 0.1, 0.35, 0.7, 0, 0xd2312b, { rough: 0.7 });
    box(ppe, 0.6, 0.5, 0.06, 0.1, 0.25, -0.1, 0x6f6248, { rough: 0.8 });
    holoTag(ppe, "gloves · boots · vest", 0.1, 1.0, 0, { css: MEOR_CSS, w: 0.4 });
    reg(hits, gloves, "gloves-on"); reg(hits, boots, "boots-on"); reg(hits, vest, "vest-on");
    const planBoard = holoPanel(g, 0.9, 0.6, -2.5, 1.5, -0.6, (cx, w, h) => {
      cx.fillStyle = "#14140f"; cx.fillRect(0, 0, w, h); cx.fillStyle = MEOR_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f4efe0"; cx.fillText("TILE PLAN — RACK R-3", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#faf6ea";
      ["Six tiles, two rows, slots 1–6", "Footing F-3, arrow to the mark", "Window: low water per the table, staff rules",
       "Section 401 · Section 404 monitoring record", "NOAA Fisheries · USFWS · CDFW measures"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.7, accent: MEOR_ACCENT });
    reg(hits, planBoard, "tile-plan-board");
    const card = holoPanel(g, 0.5, 0.32, 0.4, 1.3, 1.4, meorCard(["R-3 off F-3 — tiles 1–6", "Pending"]), { ry: -0.3, accent: MEOR_ACCENT });
    reg(hits, card, "rack-card");

    // ------------------------------------------------------- birds, drift, dressing
    for (let i = 0; i < 6; i++) { const b = ball(g, 0.05, -2.6 + i * 0.5, 2.2 + Math.sin(i) * 0.3, -2.6, 0xdfe6ea, { rough: 0.6, seg: 6, seg2: 5 }); b.scale.set(1.6, 0.6, 0.8); }
    for (let i = 0; i < 8; i++) box(g, 0.14, 0.02, 0.06, 2.4 - i * 0.3, 0.02, 2.0 - (i % 2) * 0.2, 0x5a4a34, { rough: 0.95 }).rotation.y = i * 0.7;

    const wmap = water.material.map;
    let walking = false, flooding = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 0.6, -0.6),
      onStep(step) { if (step?.id === "walk-path") walking = true; },
      onStepComplete(step) {
        if (step.id === "walk-path") walking = false;
        if (step.id === "lift-rack") { rackOld.position.set(0.5, 0.14, -0.4); rackOld.scale.set(0.7, 0.7, 0.7); }
        if (step.id === "inspect-tiles") repaint(card.userData.face, meorCard(["R-3 off F-3 — tiles 1–6", "T4 corner broken · T5 re-labelled"]));
        if (step.id === "label-shoot-bag") { rackOld.visible = false; bagStack.position.y = 0.46; }
        if (step.id === "orient-rack") arrow.rotation.y = 0;
        if (step.id === "set-rack") { rackFresh.position.set(1.6, 0.06, -1.0); arrow.position.set(1.6, 0.9, -1.0); }
        if (step.id === "stow-kit") { coolerLid.position.y = 0.385; tray.position.set(1.2, 0.2, 3.0); pryBar.position.set(0.9, 0.3, 3.1); }
        if (step.id === "tender-checkin") rad.userData.show?.("SWAPPED\nCROSSING");
        if (step.id === "swap-log") repaint(card.userData.face, meorCard(["R-3 off · fresh R-3 on F-3 at mark", "6 bagged · staff read · flood at tray"], "#59c97b"));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "skiff-dragging") { sk.position.set(2.6, -0.3, 3.4); sk.rotation.y = Math.PI - 0.5; tender.position.set(2.6, 0.1, 3.6); }
        if (it.id === "flood-at-tray") { flooding = true; water.position.set(0, 0.0, 1.6); water.scale.z = 1.9; }
      },
      onInterruptEnd(it) {
        if (it.id === "skiff-dragging") { sk.position.copy(skHome); sk.rotation.y = Math.PI; tender.position.set(1.2, 0.1, 3.4); }
        if (it.id === "flood-at-tray") {
          flooding = false;
          if (it.resolved === "answered") { tray.position.set(-0.4, 0.4, -0.9); crackedTile.position.set(-0.7, 0.55, -0.9); blankTile.position.set(-0.1, 0.55, -0.9); }
          water.position.copy(waterHome); water.scale.z = 1;
        }
      },
      animate(t, dt, session) {
        if (wmap?.offset) { wmap.offset.x = t * 0.004; wmap.offset.y = t * 0.006; }
        sk.position.y = -0.3 + Math.sin(t * 1.1) * 0.02;
        if (walking) pathHit.position.x += 0;
        if (flooding) water.position.z = 1.6 + Math.sin(t * 2) * 0.1;
        const step = session?.step;
        if (session?.turn && step?.id === "orient-rack") arrow.rotation.y = 1.6 - session.turn.amount * 2.3;
        if (session?.gauge && !session.gauge.committed && step?.id === "read-staff") {
          const gt = session.gauge.t ?? 0;
          repaint(staffHead.userData.screen, signFace(gt < 0.34 ? "falling" : gt <= 0.54 ? "in window" : "flooding", { bg: "#0d1c24", accent: gt >= 0.34 && gt <= 0.54 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
      },
    };
  },
};
