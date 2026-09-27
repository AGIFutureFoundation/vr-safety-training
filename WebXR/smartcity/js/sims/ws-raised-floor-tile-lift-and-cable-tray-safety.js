import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, cone, reg,
  surfaceTexture, texturedMat, pavingFace, palette,
} from "../citykit.js";
import { glassVacuumLifter } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Raised-Floor Tile Lift & Cable Tray Safety VR — Connectivity
// & Telecom, IBEW telecommunications technician.
//
// A raised access floor is a floor only while its tiles are in. One tile out
// is an opening in a busy aisle, a change to the hall's airflow and a view of
// a plenum full of power and data; two adjacent tiles out can weaken the
// grid. The tile is lifted with a proven suction lifter, the opening
// barricaded and attended, the cable laid into the tray rather than dragged
// over its edge, and the tile reseated flush. Sited generically: no floor
// rating, load or temperature is stated — each is the floor manufacturer's
// and the hall's operating procedure's.

const WS6_ACCENT = 0x62c1a0;
const WS6_CSS = "#62c1a0";
const WS6_PAL = palette("warehouse");

export const SIM_WS_RAISED_FLOOR_TILE_LIFT_AND_CABLE_TRAY_SAFETY = {
  id: "ws-raised-floor-tile-lift-and-cable-tray-safety",
  index: "ws-06",
  domain: "Connectivity",
  trade: "IBEW telecommunications technician",
  category: "Connectivity & Telecom",
  district: "data-center-build",
  weather: "overcast",
  certification: "IBEW/NECA JATC telecommunications training as a body; BICSI installation practice for the cable pathway and the tray fill; NFPA 70 (NEC) for the tray bonding and the cable types under a raised floor; 29 CFR 1910.22 for the floor opening and the walking surface; 29 CFR 1910.268 for telecommunications work; the floor manufacturer's instructions and the hall's operating procedure for every load and temperature",
  name: "Raised-Floor Tile Lift & Cable Tray Safety",
  title: simTitle("Raised-Floor Tile Lift & Cable Tray Safety"),
  tagline: "One tile out at a time with a proven lifter, the opening barricaded and attended, the plenum inspected, the cable laid into the tray rather than dragged over it, and the tile reseated flush",
  accent: WS6_ACCENT,
  accentCss: WS6_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "floor-kept-a-floor", name: "Floor Kept a Floor", note: "One tile out, barricaded and attended, the cable laid in, and the tile reseated flush" },

  game: system({
    name: "Pathway Authority",
    currency: "TILES",
    ranks: ["Apprentice", "Installer", "Telecom Technician", "Lead Technician", "Pathway Authority Certified"],
    badges: [
      { id: "barricaded-first", name: "Barricaded First", note: "The opening was barricaded before the tile came up", test: AWARD.stepClean("barricade") },
      { id: "no-open-holes", name: "No Open Holes", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-watch", name: "Steady Watch", note: "Held the airflow watch steady", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pull", name: "Clean Pull", note: "No corrections from the ticket to the close-out", test: AWARD.clean },
      { id: "unbroken-lift", name: "Unbroken Lift", note: "The tile lift ran without a break", test: AWARD.unbroken },
      { id: "brisk-pull", name: "Brisk Pull", note: "Lifted, laid in and reseated inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "step-into-opening": "You went to step across the open tile space to reach the rack. An open tile is a hole to the slab below, edged by tiles that can tip when a boot lands on their edge — the way round is along the barricade.",
    "lift-adjacent-tile": "You went to lift the next tile along while the first was still out. Two adjacent tiles out take away the support the grid's stringers rely on and can let the floor around the opening shift — the floor manufacturer limits it for a reason.",
    "drag-over-tray-edge": "You went to drag the cable over the tray's side rail. A cable pulled over an edge is crushed and its jacket scraped at that point, and the damage hides under the floor until the link fails or the power cable beside it heats.",
    "leave-opening-unattended": "You went to leave the open tile to fetch more cable. An opening in a live hall's aisle, even barricaded, is attended by the person who opened it until the tile is back.",
  },

  lateNotes: {
    "tile-lifter": "The tile comes up only once the opening is barricaded and the lifter's vacuum has been proven.",
    "tile-seat": "The tile is reseated once the cable is in the tray and tied, not with a cable still across the stringer.",
  },

  faults: [
    {
      id: "damaged-pedestal",
      label: "Damaged floor pedestal",
      note: "Under the lifted tile one pedestal is bent and its head has dropped. The tile is not reseated on it: leave the opening barricaded, post the sign and report it to the hall operator.",
      step: "reseat-tile",
      change: {
        kind: "select", target: "tile-barrier-sign",
        title: "Keep the opening barricaded and report the pedestal",
        cue: "A pedestal is bent — do not reseat the tile on it. Post the barricade sign and report it to the hall operator.",
        why: "A tile seated on a bent pedestal looks flush until the first loaded cart rolls over its corner and it tips into the plenum. Leaving the opening barricaded and signed keeps the hazard visible, and the report puts the floor repair in front of the people who own the hall.",
        turn: undefined,
      },
    },
  ],

  interrupts: [
    {
      id: "cart-down-aisle",
      kind: "A server cart rolls down the aisle",
      after: "tile-lift", delay: 3, seconds: 11,
      alert: "Someone is pushing a loaded server cart down the aisle toward the open tile, looking at the rack labels, not the floor.",
      cue: "Hold up the stop paddle and stop the cart before the barricade.",
      target: "aisle-stop-paddle",
      why: "A barricade marks the opening but a person steering a heavy cart and reading rack labels may not see it until a wheel is at the edge; the stop paddle held up in their line of sight stops the cart where the barricade alone might not.",
      missNote: "The cart kept coming toward the opening with nobody stopping it.",
      wrongNote: "It is the stop paddle. The tile is already up; the cart is the new hazard.",
    },
    {
      id: "inlet-hot-spot",
      kind: "A rack inlet temperature alarm",
      after: "airflow-watch", delay: 3, seconds: 12,
      alert: "The rack next to the opening has raised an inlet temperature alarm — the open tile is starving its perforated tile of cold air.",
      cue: "Call the hall operator on the phone and tell them what is open and where.",
      target: "hall-operator-phone",
      why: "An open tile changes the plenum's pressure and can starve the racks beside it of cold air; the hall operator watches the whole hall's cooling and may need the tile back in sooner, so they hear about the alarm from the person standing at the opening.",
      missNote: "The alarm went unreported while the rack inlet heated.",
      wrongNote: "It is the phone to the hall operator. The airflow watch tells you, not them.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "ticket", kind: "select", target: "work-ticket",
      title: "Read the work ticket and the floor plan",
      cue: "Read the ticket: which tile, which tray, the cable to lay and the hall's rules for an open tile.",
      why: "A floor plan says which tile opens over which tray and what else runs in the plenum there — power whips, chilled-water pipe, fire detection — so the tile that comes up is the right one and nothing under it is a surprise.",
    },
    {
      id: "notify", kind: "select", target: "hall-operator-phone",
      title: "Tell the hall operator before a tile comes up",
      cue: "Call the hall operator: which tile is coming up, for how long, and who is attending it.",
      why: "In a live hall the raised floor is also the cooling plenum, and the operator is watching its pressure and the rack temperatures; telling them first means a change in the readings has an explanation and a person to call.",
    },
    {
      id: "barricade", kind: "sequence",
      targets: ["tile-cones", "tile-barrier-chain"],
      itemNames: { "tile-cones": "cones set round the tile", "tile-barrier-chain": "barrier chain hung between them" },
      title: "Barricade the tile before it comes up",
      cue: "Set the cones round the tile, then hang the barrier chain.",
      why: "The barricade goes up before the opening exists, so there is never a moment when the hole is there and the warning is not; an aisle is a route people walk while reading labels, not the floor.",
      outOfOrderNote: "Cones, then the chain — the chain hangs between the cones.",
    },
    {
      id: "lifter-check", kind: "gauge", target: "lifter-vacuum-gauge",
      title: "Prove the lifter's vacuum",
      cue: "Pump the suction lifter onto the tile and commit when its gauge reads in the green.",
      why: "A suction cup can feel firm while it bleeds air through a nicked seal, and a tile that drops from a lifter lands on a foot or into the plenum on a cable; the gauge reads the vacuum the cups are actually holding, which is what the lift depends on.",
      gauge: { label: "LIFTER VACUUM", speed: 0.6, green: [0.55, 0.85], readout: (t) => (t < 0.55 ? "bleeding — re-seat the cups" : "holding in the green"), missNote: "The cups are not holding in the green — re-seat them before the tile comes up." },
    },
    {
      id: "tile-lift", kind: "hold", target: "tile-lifter", seconds: 4,
      title: "Lift the tile straight up",
      cue: "Hold the lifter and bring the tile straight up and out, keeping it level.",
      why: "A tile lifted straight and level clears its neighbours' edges without prising them up, and does not swing into the rack or the person beside you; tilted out, it drags a corner across the stringer and the next tile along.",
      holdBreakNote: "The lift stopped — bring the tile straight up and out in one steady movement.",
    },
    {
      id: "set-tile-down", kind: "drag", target: "lifted-tile",
      title: "Set the tile down out of the aisle",
      cue: "Carry the tile to its rest spot against the rack end, out of the walkway.",
      why: "A loose tile left in the aisle is a second trip hazard next to the first, and a tile leaning where a cart can catch it falls; set against the rack end it is out of the walkway and ready to go back.",
      drag: { to: "tile-rest-spot", radius: 0.5, missNote: "The tile is not at its rest spot — out of the aisle, against the rack end." },
    },
    {
      id: "inspect-plenum", kind: "find", noHint: true,
      targets: ["loose-pedestal-head", "cable-over-tray-edge"],
      itemNames: { "loose-pedestal-head": "a loose pedestal head", "cable-over-tray-edge": "a cable already crushed over the tray edge" },
      itemNotes: {
        "loose-pedestal-head": "This pedestal head turns by hand — the tile above it will rock. It is tightened per the floor manufacturer before the tile goes back.",
        "cable-over-tray-edge": "Someone before you pulled this cable over the side rail and it is flattened at the edge — reported so it can be tested and replaced.",
      },
      title: "Inspect the plenum under the tile",
      cue: "Look under the floor and find what needs putting right before the tile goes back.",
      why: "The open tile is the only time anyone sees this part of the plenum, so it is looked at, not just reached into: a loose pedestal head makes a rocking tile and a crushed cable is a failure waiting in the tray.",
    },
    {
      id: "lay-cable", kind: "sequence",
      targets: ["tray-bond-check", "cable-lay-in"],
      itemNames: { "tray-bond-check": "tray bonding jumper checked", "cable-lay-in": "cable laid into the tray and tied" },
      title: "Lay the cable into the tray",
      cue: "Check the tray's bonding jumper is in place, then lay the cable into the tray and tie it — never drag it over the side rail.",
      why: "A metal tray is bonded so a fault finds a path to ground instead of a person, and a broken jumper is found by looking; the cable is laid in by hand because a cable dragged over a rail is crushed at the rail and its performance or insulation suffers there.",
      outOfOrderNote: "Bonding first, then the cable — the tray is checked before anything else goes in it.",
    },
    {
      id: "airflow-watch", kind: "track", target: "cold-aisle-meter", seconds: 7,
      title: "Watch the cold aisle while the tile is out",
      cue: "Keep watching the cold-aisle reading beside the opening while you work.",
      why: "An open tile vents the plenum where it should not and starves the perforated tiles in front of the racks, so the cold-aisle reading beside the opening is watched for as long as it is open — the job is quick because the hall is live.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.1, label: "COLD AISLE", readout: (v) => (v > 0.65 ? "warming — close up soon" : v < 0.35 ? "check the sensor" : "holding") },
      holdBreakNote: "The watch broke — keep an eye on the cold aisle while the tile is out.",
    },
    {
      id: "reseat-tile", kind: "turn", target: "tile-seat",
      title: "Reseat the tile square",
      cue: "Turn the tile square to the grid and lower it onto its pedestals until it sits flush.",
      why: "A tile set down out of square rides up on a stringer and rocks, and a rocking tile under a cart wheel is how the next opening appears; turned square and lowered, it seats on all four pedestals at once.",
      turn: { turns: 0.35, axis: "y", label: "TILE SQUARE" },
    },
    {
      id: "flush-check", kind: "select", target: "flush-check",
      title: "Walk the tile",
      cue: "Step on each corner of the reseated tile and check it is flush and does not rock.",
      why: "The last check is the one the next person does without thinking — walking on it; a corner that dips under a boot now is fixed now, before it dips under a loaded cart.",
    },
    {
      id: "close-ticket", kind: "select", target: "close-out",
      title: "Close out the ticket",
      cue: "Close the ticket: the cable laid, the findings under the floor and the tile back, and tell the hall operator.",
      why: "The close-out tells the hall operator the plenum is sealed again and records what was found underneath, so a loose pedestal or a crushed cable becomes somebody's job rather than a memory.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS6_ACCENT);

    const slabTex = surfaceTexture((ctx, w, h) => pavingFace(ctx, w, h), { repeat: 3, px: 256 });
    const slab = box(g, 6.6, 0.06, 5.0, 0, 0.03, 0, 0xffffff, { rough: 0.9 });
    slab.material = texturedMat(slabTex, { rough: 0.9, color: 0xa8a6a0 });

    // A raised-floor section: a grid of tiles on pedestals, one lifted.
    const FH = 0.45, T = 0.6;
    const floor = group(g, 0, 0, -0.6);
    const tileTex = surfaceTexture((ctx, w, h) => { ctx.fillStyle = "#c9cdd0"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "#7e858b"; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, h - 4); ctx.fillStyle = "rgba(0,0,0,0.04)"; for (let i = 0; i < 200; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }, { repeat: 1, px: 128 });
    const tileMat = texturedMat(tileTex, { rough: 0.6, metal: 0.1 });
    for (let ix = -2; ix <= 2; ix++) for (let iz = -1; iz <= 1; iz++) {
      if (ix === 0 && iz === 0) continue;
      const t = box(floor, T - 0.01, 0.03, T - 0.01, ix * T, FH, iz * T, 0xffffff, { rough: 0.6 });
      t.material = tileMat;
    }
    for (let ix = -2; ix <= 3; ix++) for (let iz = -1; iz <= 2; iz++) cyl(floor, 0.02, 0.02, FH, (ix - 0.5) * T, FH / 2, (iz - 0.5) * T, 0x8b949b, { rough: 0.5, metal: 0.6, seg: 6 });
    for (const sx of [-1.5 * T - 0.02, 2.5 * T + 0.02]) box(floor, 0.04, FH, 3 * T, sx, FH / 2, 0, 0x5a6168, { rough: 0.6 });
    const pedHead = box(floor, 0.08, 0.03, 0.08, -0.5 * T, FH - 0.03, -0.5 * T, 0xf2ae14, { rough: 0.5, metal: 0.5 });
    reg(hits, pedHead, "loose-pedestal-head");
    const bentPed = cyl(floor, 0.022, 0.022, FH * 0.8, 0.5 * T, FH * 0.4, 0.5 * T, 0xd2312b, { rough: 0.5, seg: 6 });
    bentPed.rotation.z = 0.35;
    bentPed.visible = false;
    // Under-floor tray and cables.
    const tray = group(floor, 0, 0.15, 0);
    box(tray, 3.2, 0.02, 0.3, 0, 0, 0, 0xa8b0b6, { rough: 0.5, metal: 0.6 });
    for (const sz of [-0.15, 0.15]) box(tray, 3.2, 0.08, 0.02, 0, 0.04, sz, 0xa8b0b6, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 4; i++) cyl(tray, 0.015, 0.015, 3.1, 0, 0.03, -0.09 + i * 0.06, [0x3fa7d6, 0xf2c14b, 0x59c97b, 0x3fa7d6][i], { rough: 0.6, seg: 6 }).rotation.z = Math.PI / 2;
    const crushed = cyl(tray, 0.016, 0.016, 0.3, 0.5, 0.1, 0.17, 0xe0592a, { rough: 0.6, seg: 6 });
    reg(hits, crushed, "cable-over-tray-edge");
    const bond = box(tray, 0.08, 0.04, 0.04, -0.9, 0.06, 0.17, 0x59c97b, { rough: 0.5, metal: 0.6 });
    reg(hits, bond, "tray-bond-check");
    const layIn = box(tray, 0.3, 0.06, 0.2, 0.0, 0.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, layIn, "cable-lay-in");
    holoTag(floor, "under-floor tray", -1.2, 0.35, 0.3, { css: WS6_CSS, w: 0.34 });
    const seat = group(floor, 0, FH, 0);
    const seatMark = box(seat, T - 0.02, 0.01, T - 0.02, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, seatMark, "tile-seat");
    const flush = box(floor, 0.2, 0.05, 0.2, 0, FH + 0.03, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, flush, "flush-check");

    // The lifted tile, the lifter.
    const tile = group(g, 0, FH + 0.01, -0.6);
    const tMesh = box(tile, T - 0.01, 0.03, T - 0.01, 0, 0, 0, 0xffffff, { rough: 0.6 });
    tMesh.material = tileMat;
    reg(hits, tile, "lifted-tile");
    const lifter = glassVacuumLifter(g, 0, FH + 0.05, -0.6);
    reg(hits, lifter, "tile-lifter");
    const lifterGauge = instrument(g, 0.55, 0.9, 0.2, { idle: "VACUUM", color: 0x2b2f34, w: 0.14, d: 0.03 });
    holoTag(g, "lifter vacuum", 0.55, 1.1, 0.2, { css: WS6_CSS, w: 0.28 });
    reg(hits, lifterGauge, "lifter-vacuum-gauge");

    // Barricade.
    const cones = [];
    for (const [cx, cz] of [[-0.55, -1.15], [0.55, -1.15], [-0.55, -0.05], [0.55, -0.05]]) cones.push(cone(g, cx, cz));
    reg(hits, cones[3], "tile-cones");
    const chain = box(g, 1.1, 0.03, 0.03, 0, 0.6, -0.05, 0xd2312b, { rough: 0.6 });
    reg(hits, chain, "tile-barrier-chain");
    const sign = decal(g, 0.3, 0.2, 0.9, 0.9, -0.05, signFace("OPEN FLOOR", { bg: "#f2c14b", accent: "#1b1e23", fg: "#1b1e23", scale: 0.45 }));
    holoTag(g, "barricade sign", 0.9, 1.12, -0.05, { css: WS6_CSS, w: 0.3 });
    reg(hits, sign, "tile-barrier-sign");
    box(g, 0.04, 0.9, 0.04, 0.9, 0.45, -0.08, 0x5a6168, { rough: 0.6 });

    // Rack row behind, cold-aisle sensor, rest spot.
    const rackTex = surfaceTexture((ctx, w, h) => { ctx.fillStyle = "#15181c"; ctx.fillRect(0, 0, w, h); for (let i = 0; i < 20; i++) { ctx.fillStyle = "#262b31"; ctx.fillRect(6, 6 + i * 12, w - 12, 9); ctx.fillStyle = i % 3 ? "#3fc26a" : "#4fa3ff"; ctx.fillRect(w - 16, 9 + i * 12, 4, 3); } }, { repeat: 1, px: 256 });
    const racks = [];
    for (let i = 0; i < 4; i++) { const r = box(g, 0.6, 2.1, 1.0, -1.5 + i * 0.64, 1.05, -2.2, 0xffffff, { rough: 0.5 }); r.material = texturedMat(rackTex, { rough: 0.5, metal: 0.4 }); racks.push(r); }
    const rackLamp = cyl(g, 0.04, 0.04, 0.03, 0.4, 2.0, -1.68, 0x444444, { rough: 0.4, seg: 10 });
    rackLamp.rotation.x = Math.PI / 2;
    const restSpot = group(g, -2.1, 0.4, -1.6);
    hits["tile-rest-spot"] = restSpot;
    holoTag(g, "tile rest spot", -2.1, 0.9, -1.6, { css: WS6_CSS, w: 0.3 });
    const aisleInst = instrument(g, 1.9, 1.2, -1.6, { idle: "AISLE", color: 0x2b2f34, w: 0.16, d: 0.03 });
    holoTag(g, "cold-aisle reading", 1.9, 1.42, -1.6, { css: WS6_CSS, w: 0.36 });
    reg(hits, aisleInst, "cold-aisle-meter");
    box(g, 0.05, 1.2, 0.05, 1.9, 0.6, -1.6, 0x5a6168, { rough: 0.6 });
    // Overhead ladder tray.
    box(g, 5.0, 0.06, 0.4, 0, 2.7, -1.4, 0xa8b0b6, { rough: 0.5, metal: 0.6 });
    for (const hx of [-2.3, 0, 2.3]) box(g, 0.03, 0.5, 0.03, hx, 2.95, -1.4, 0x5a6168, { rough: 0.6 });

    // Boards, phone, paddle.
    const board = group(g, -2.6, 0, 0.8, 1.0);
    box(board, 0.6, 1.2, 0.05, 0, 0.6, 0, WS6_PAL.structure, { rough: 0.7 });
    const ticket = decal(board, 0.5, 0.36, 0, 0.95, 0.03, paperFace("WORK TICKET", ["Tile per floor plan", "Tray and cable per ticket", "Open tile per hall procedure"], { scale: 0.72 }));
    holoTag(board, "work ticket", 0, 1.32, 0, { css: WS6_CSS, w: 0.28 });
    reg(hits, ticket, "work-ticket");
    const closeOut = decal(board, 0.4, 0.26, 0, 0.45, 0.03, paperFace("CLOSE-OUT", ["Cable laid ___", "Findings ___", "Tile back ___"], { scale: 0.7 }));
    reg(hits, closeOut, "close-out");
    const phone = box(g, 0.14, 0.2, 0.08, 2.5, 1.4, 0.4, 0x2b3138, { rough: 0.5 });
    holoTag(g, "hall operator phone", 2.5, 1.65, 0.4, { css: WS6_CSS, w: 0.38 });
    reg(hits, phone, "hall-operator-phone");
    box(g, 0.3, 1.3, 0.1, 2.5, 0.65, 0.45, WS6_PAL.structure, { rough: 0.7 });
    const paddle = group(g, 1.6, 0, 1.4);
    cyl(paddle, 0.015, 0.015, 1.0, 0, 0.5, 0, 0x5a6168, { rough: 0.6, seg: 6 });
    const pFace = cyl(paddle, 0.15, 0.15, 0.02, 0, 1.1, 0, 0xd2312b, { rough: 0.5, seg: 16 });
    pFace.rotation.x = Math.PI / 2;
    holoTag(paddle, "stop paddle", 0, 1.4, 0, { css: "#d2312b", w: 0.26 });
    reg(hits, pFace, "aisle-stop-paddle");
    const cart = group(g, 3.0, 0, -0.8);
    box(cart, 0.6, 0.9, 0.9, 0, 0.55, 0, 0x5a6168, { rough: 0.5, metal: 0.4 });
    box(cart, 0.5, 0.3, 0.8, 0, 1.15, 0, 0x1c1f23, { rough: 0.5 });
    for (const sx of [-0.25, 0.25]) for (const sz of [-0.38, 0.38]) cyl(cart, 0.05, 0.05, 0.04, sx, 0.05, sz, 0x17191c, { rough: 0.7, seg: 8 }).rotation.z = Math.PI / 2;

    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.44 });
      reg(hits, d, id);
    };
    decoy(0, 0.8, -0.9, "step-into-opening", "step across the hole?");
    decoy(1.2, 0.7, -0.6, "lift-adjacent-tile", "pull the next tile too?");
    decoy(-0.9, 0.7, -0.3, "drag-over-tray-edge", "drag it over the rail?");
    decoy(-1.6, 1.0, 1.4, "leave-opening-unattended", "nip out for more cable?");

    standingFigure(g, -2.9, 2.0, { ry: 2.4, cloth: 0x2b4f7f, vest: 0xf2c14b });
    holoPanel(g, 1.0, 0.6, 0.6, 0, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "#061a14"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS6_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6fff6";
      ctx.fillText("RAISED FLOOR — ONE TILE, ATTENDED", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Barricade before it comes up", "Prove the lifter's vacuum", "Lay cable in — never over the rail", "Reseat flush, walk it"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: -0.2, accent: WS6_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.7, -0.8),
      onStep() {},
      onFault(id) {
        if (id === "damaged-pedestal") { bentPed.visible = true; }
      },
      onStepComplete(step) {
        if (step.id === "lifter-check") repaint(lifterGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "tile-lift") tile.position.y = FH + 0.5;
        if (step.id === "set-tile-down") { tile.position.set(-2.1, 0.4, -1.6); tile.rotation.x = 1.3; lifter.visible = false; }
        if (step.id === "inspect-plenum") pedHead.material = mat(0x8b949b, { rough: 0.5, metal: 0.5 });
        if (step.id === "reseat-tile") { tile.position.set(0, FH + 0.01, -0.6); tile.rotation.set(0, 0, 0); }
      },
      onInterrupt(it) {
        if (it.id === "cart-down-aisle") cart.position.set(1.4, 0, -0.6);
        if (it.id === "inlet-hot-spot") rackLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cart-down-aisle") cart.position.set(3.0, 0, -0.8);
        if (it.id === "inlet-hot-spot") rackLamp.material = mat(0x444444, { rough: 0.4 });
      },
      onHazard() {},
      animate(t, dt, session) {
        if (session?.turn && session.step?.id === "reseat-tile") tile.rotation.y = (1 - session.turn.amount) * 0.4;
        void racks;
      },
    };
  },
};
