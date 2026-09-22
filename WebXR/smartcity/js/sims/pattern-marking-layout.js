import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, paperFace,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pattern Marking & Layout VR — Sewing & Garment Trades, station
// one. Before a blade ever touches cloth, the marker maker lays every piece
// of a style on the table: grain line to selvedge, nap running one way the
// whole length of the layer, notches and drill holes struck so the sewing
// room can find them without measuring, and the whole thing counted back
// against the cut ticket that started it. Nothing here is cut yet — a wrong
// marker is still a five-minute correction on this table; the same mistake
// found after the cutter has gone through the layer is fabric nobody can
// un-cut.

const PML_ACCENT = 0xc77bd9;

export const SIM_PATTERN_MARKING_LAYOUT = {
  id: "pattern-marking-layout",
  index: "176",
  domain: "Manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) garment and apparel production; the state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.132 hand protection around the awl, notcher and rotary cutter at the marking table; NIOSH ergonomics guidance for the prolonged standing, reaching and bent-over work a marking table asks for",
  name: "Pattern Marking & Layout",
  title: simTitle("Pattern Marking & Layout"),
  tagline: "Grain line to selvedge, nap held one way, notches and drill holes struck, and the marker counted back against the cut ticket",
  accent: PML_ACCENT,
  accentCss: "#c77bd9",
  parSeconds: 250,
  footprint: 2.4,
  badge: { id: "marker-true", name: "Marker True", note: "A layout on grain, on nap, notched, tagged and counted clean against the cut ticket" },

  game: system({
    name: "Marker Authority",
    currency: "YARD",
    ranks: ["Bundle Runner", "Marker Helper", "Marker Maker", "Lead Marker Maker", "Marker Authority Certified"],
    badges: [
      { id: "on-grain", name: "On Grain", note: "Never let a piece go down off its own grain line", test: AWARD.stepClean("grainline") },
      { id: "table-clear", name: "Table Clear", note: "Never left a sharp exposed on the table", test: AWARD.safe },
      { id: "efficient-marker", name: "Efficient Marker", note: "Held the marker's efficiency near the target band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-marker", name: "Clean Marker", note: "No corrections through the whole layout", test: AWARD.clean },
      { id: "steady-wheel", name: "Steady Wheel", note: "Held the tracing wheel's pressure without a break", test: AWARD.unbroken },
      { id: "marker-fast", name: "Marker Fast", note: "Layout complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "awl-spare": "That spare awl is standing point up in the tool tray instead of point down or sheathed. A hand reaching in fast for scissors or a tape measure finds the point first, and an awl's whole job is to puncture cloth — it does exactly the same thing to a fingertip with no more effort than that.",
    "notcher-open": "That notching plier has been left with its jaws open and the notching blade sitting exposed right at the edge of the table, where a hand reaches to gather the next bundle. Notchers are spring-loaded to snap shut through cloth; left open and unattended, the exposed edge is a laceration waiting on whoever's hand crosses it next, not a tool waiting to be picked up.",
    "rotary-cutter": "That rotary cutter's blade guard is retracted and the blade is sitting exposed on the table edge. A rotary blade left extended looks like nothing is wrong until a hand brushes past it reaching for fabric — it gets set down mid-task and forgotten exactly because nothing about it looks armed.",
    "cloth-runoff": "A length of cloth has slid off the table edge and is trailing across the floor into the walking lane. Fabric underfoot is exactly as slippery as it looks and exactly as easy to catch a boot heel in, and a marker maker's attention at this table is on the layout, not on the floor behind them.",
  },

  lateNotes: {
    "tracing-wheel": "Not yet — the outline gets chalked first. The wheel runs over a line that already exists; it does not draw one from nothing.",
    "size-labels": "Not yet — labels go on once the layout's efficiency is checked and the notches and drill holes are struck, not before the marker is actually finished.",
    "marker-tally": "The count against the cut ticket happens once every piece is down, notched, drilled and labelled — not partway through, while pieces are still moving.",
  },

  steps: [
    {
      id: "cut-ticket", kind: "select", target: "cut-ticket",
      title: "Read the cut ticket",
      cue: "Check the fabric, the size ratio and whether this style calls for a one-way (nap) layout.",
      why: "The cut ticket sets the exact count and ratio of sizes this marker has to deliver — how many of a size 6, 8 and 10 come off one layer of cloth — and it says whether the fabric has a nap or a one-way print that means every piece on the table has to run the same direction. A marker started from memory instead of the ticket is a bet that this fabric matches the last job, and a bolt of corduroy laid the wrong way looks identical to a right one until the finished garment comes back from the sewing floor shading two different colours panel to panel.",
    },
    {
      id: "unroll", kind: "turn", target: "cloth-roller",
      title: "Feed the cloth onto the table",
      cue: "Turn the roller to feed the bolt squarely onto the marking table.",
      why: "Cloth pulled off a bolt at an angle carries that skew into every piece marked on it, because the grain follows the weave itself, not the edge of the table it happens to be lying on. Feeding it off a turning roller square to the table, rather than yanking a length flat by hand, is what keeps the crosswise and lengthwise threads running perpendicular down the whole layer — the one thing a marker maker cannot fix afterward with a chalk line.",
      turn: { turns: 1.1, axis: "x", label: "FEED ROLLER" },
    },
    {
      id: "nap-arrow", kind: "select", target: "nap-arrow",
      title: "Check the nap arrow",
      cue: "Read the nap arrow printed on the selvedge before anything else goes down on this cloth.",
      why: "A napped fabric — corduroy, velvet, most fleece — reflects light differently depending on which way its pile runs, and every pattern piece in this marker has to point the same way that arrow does or the finished garment shows two-tone panels under any light that isn't flat overhead. The arrow gets read and confirmed before the first piece touches the cloth, not caught afterward by eye once the layout is already down.",
    },
    {
      id: "grainline", kind: "drag", target: "piece-front",
      title: "Lay the front piece on grain",
      cue: "Carry the front bodice piece onto the table with its grain line parallel to the selvedge.",
      why: "The grain line printed on every pattern piece is not decoration — it is the instruction for how that piece has to sit relative to the fabric's own lengthwise thread, and a piece pinned even a few degrees off it hangs wrong on a body the first time the finished garment is washed and worn. Lining the printed grain line up parallel to the selvedge, checked at both ends of the piece, is what a marker maker confirms before a single other piece goes down on this cloth.",
      drag: { to: "grainline-guide", radius: 0.4, missNote: "Not on the grain line — carry the piece back and line it up parallel to the selvedge before it stays down." },
    },
    {
      id: "nap-piece", kind: "drag", target: "piece-sleeve",
      title: "Lay the sleeve piece with the nap",
      cue: "Lay the sleeve piece so its nap direction matches the piece already on the table.",
      why: "Two pieces of the same nap-sensitive fabric cut with the pile running opposite directions look identical coming off this table and turn into a jacket with one sleeve catching the light differently from the body the first time anybody stands under a shop lamp. Every piece added to this marker gets checked against the nap arrow already established here, not just eyeballed against the piece next to it.",
      drag: { to: "nap-zone", radius: 0.4, missNote: "Not with the nap — the sleeve piece has to run the same direction as the front piece, or it comes off shaded wrong." },
    },
    {
      id: "chalk", kind: "select", target: "chalk",
      title: "Chalk the layout's outline",
      cue: "Chalk the outline of every piece before the tracing wheel runs over any of it.",
      why: "A chalk outline is what the cutter's blade actually follows once this cloth leaves the table, and a layout that only exists as loose paper pinned on top of the fabric is a layout the cutting room has no way to reproduce if a single piece shifts before the cutter gets to it. Chalking the edges now is what lets this marker survive being carried across the floor to the cutting table.",
    },
    {
      id: "trace", kind: "track", target: "tracing-wheel", seconds: 6,
      title: "Run the tracing wheel over the seam lines",
      cue: "Hold the wheel's pressure steady while it runs the seam lines, heel to point, on every piece.",
      why: "The wheel's teeth have to bite the chalk through the pattern paper and into the cloth beneath it — pressed too lightly, the mark comes out too faint for the cutting room to see; pressed too hard, it perforates the paper pattern itself, which is graded master stock the same piece gets pulled and reused from tomorrow. A steady hand the whole length of every seam is what keeps the mark legible without wearing the master pattern out one pass at a time.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.4, drift: 0.12, label: "WHEEL PRESSURE",
        readout: (v) => (v < 0.4 ? "too light — mark won't hold" : v > 0.62 ? "too heavy — perforating the pattern" : "true"),
      },
      holdBreakNote: "Pressure broke out of the band. A line that faint or that torn has to be run again — reset and trace the seam through in one steady pass.",
    },
    {
      id: "off-grain-find", kind: "find", noHint: true,
      targets: ["piece-off-grain"],
      itemNames: { "piece-off-grain": "the piece laid off the grain line" },
      itemNotes: { "piece-off-grain": "This piece drifted a few degrees off its own printed grain line while the layer was being smoothed. It does not look wrong from across the table — it only shows up as a garment that twists at the seam after the first wash, by which point it is finished goods, not a correction." },
      title: "Walk the table before it's chalked further",
      cue: "One piece on this table is off its own grain line. Find it.",
      why: "A piece that drifted while the layer was being smoothed does not announce itself — the marker still looks complete at a glance, and the grain line printed on the paper is the only thing that says otherwise. Checking every piece against its own line, not just the two most recently placed, is what catches the one that moved before it is chalked and cut along with everything else.",
    },
    {
      id: "efficiency", kind: "gauge", target: "marker-efficiency",
      title: "Check the marker's efficiency",
      cue: "Watch the efficiency reading and commit once the layout is using the cloth inside the target range.",
      why: "The marker's efficiency is the percentage of the cloth actually covered by pattern pieces once everything is nested as tight as the grain and nap rules allow, and it is the number that decides whether this style makes money or loses it on fabric alone. Nesting too loose wastes yardage on every single layer cut from this marker for the life of the style, and nesting past what the grain and nap rules actually allow produces pieces the sewing room has to reject on sight.",
      gauge: { label: "MARKER EFFICIENCY", speed: 0.7, green: [0.44, 0.6], readout: (t) => `${Math.round(70 + t * 22)}%`, missNote: "Outside the target range — loosen or tighten the nest, but never past what grain and nap allow, and check the reading again." },
    },
    {
      id: "mark-points", kind: "sequence",
      targets: ["notch-punch", "drill-awl"],
      itemNames: { "notch-punch": "seam notches, punched", "drill-awl": "internal points, drilled with the awl" },
      title: "Strike the notches and drill holes",
      cue: "Punch the seam notches first, then drill the internal points with the awl.",
      why: "Notches at the seam edges are what a sewing operator lines two pieces up on without measuring anything, so they get punched first while the piece is still exactly where the layout put it; the awl's job is marking internal points — dart tips, pocket placement — that are only in the right spot once the notches have already fixed the piece's position on the table. Doing it the other way round lets the piece shift between the two marks and the internal point ends up measured off a seam that has not been located yet.",
      outOfOrderNote: "Wrong order — the notches fix the piece's position first, then the awl marks internal points off that. An awl mark struck before the notches is a guess at where the seam will actually be.",
    },
    {
      id: "size-labels", kind: "select", target: "size-labels",
      title: "Tag every piece by size",
      cue: "Clip a size tag to every piece on the table before the bundle leaves it.",
      why: "A cut piece with no size tag is anonymous the second it is stacked with a dozen others in the same fabric, and a bundler working fast pairs pieces by shape, not by size — which is exactly how a size 8 front ends up sewn to a size 12 back three departments away from anyone who could have caught it here. The tag travels with the piece for the rest of its life on the floor; this table is the cheapest place in the whole shop to attach it.",
    },
    {
      id: "marker-tally", kind: "select", target: "marker-tally",
      title: "Count the marker against the cut ticket",
      cue: "Check the finished layout's piece count and size ratio against the cut ticket one last time.",
      why: "The ticket named an exact count and ratio of sizes before the first piece went down, and the only way to know this marker actually delivers that ratio is to count it back against the ticket now, on this table, while a missing or duplicated piece is still a five-minute fix. Found later, the same mistake is a short bundle discovered on the sewing floor with the fabric already cut and no more of that dye lot on the roll to fix it with.",
    },
  ],

  // Two things a marker maker can only half-see while bent over the table
  // chalking or watching a gauge. See shared/game.js.
  interrupts: [
    {
      id: "against-nap",
      kind: "Nap drift",
      after: "off-grain-find", delay: 4, seconds: 12,
      alert: "The sleeve piece you laid a few minutes ago has been knocked sideways — its nap is now running backward against the front piece.",
      cue: "Something on this table is fighting the nap direction.",
      target: "piece-sleeve",
      why: "A piece that shifts after it is laid does not announce itself — the marker still looks complete from a glance, and only the printed nap arrow says one piece is now running backward against its neighbour. That is exactly the kind of two-tone panel that only shows up once the garment is finished and standing under a light, never here on the table where it is still free to fix.",
      missNote: "The marker went to the cutting table with the sleeve piece's nap running backward. Every piece cut from that layer carries the mistake forward, and the panel comes back from the sewing floor shaded two different ways — cut goods that cannot be un-cut, on a bolt the mill may not even carry anymore.",
      wrongNote: "It's the sleeve piece — its nap is now running the wrong way against the front piece. Fix that before the layout goes any further.",
    },
    {
      id: "ticket-revised",
      kind: "Ticket change",
      after: "efficiency", delay: 3, seconds: 12,
      alert: "A runner drops a revised cut ticket on the table — the size ratio for this style just changed in the middle of the marker.",
      cue: "The ticket this layout was built from is no longer the ticket.",
      target: "cut-ticket",
      why: "A size ratio changed mid-marker is not a formality to note and keep going past — every size this layout carries has to match what the sewing floor actually needs now, and a marker finished against yesterday's ratio produces exactly the wrong count of exactly the wrong sizes. That is discovered only once bundles reach a line that cannot sew a size 14 out of a size 8 panel.",
      missNote: "The marker went to the cutting table built against the old ratio. The floor gets a stack of the wrong sizes in the wrong quantities, and the fix is not a chalk correction — it is fabric already cut wrong, sitting in bundles nobody can sew to the order that actually shipped.",
      wrongNote: "It's the revised ticket sitting on the table — read it before this marker goes any further.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PML_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#cdd4da", base2: "#bcc4cb", step: 26 }), { repeat: 5, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.45, metal: 0.55, color: 0xcdd4da });

    // ------------------------------------------------------------ marking table
    const table = group(g, 0, 0, -0.7);
    for (const [lx, lz] of [[-1.35, -0.5], [1.35, -0.5], [-1.35, 0.5], [1.35, 0.5]]) {
      box(table, 0.07, 0.86, 0.07, lx, 0.43, lz, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    }
    box(table, 3.0, 0.05, 1.3, 0, 0.85, 0, 0x8b929a, { rough: 0.4, metal: 0.4 });
    const tableTop = slab(table, 3.0, 0.03, 1.3, 0, 0.885, 0, 0xcdd4da, { radius: 0.01, rough: 0.4 });
    tableTop.material = steelMat();
    box(table, 3.02, 0.08, 1.32, 0, 0.83, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 }); // apron

    // Grain-line guide stripes painted the length of the table, plus the
    // selvedge edge marked in red at one long side.
    for (const gx of [-1.1, -0.55, 0, 0.55, 1.1]) {
      box(table, 0.01, 0.002, 1.2, gx, 0.902, 0, 0x8a95a0, { rough: 0.7, cast: false });
    }
    box(table, 3.0, 0.004, 0.02, 0, 0.903, -0.63, 0xb8402f, { rough: 0.6, cast: false }); // selvedge line
    holoTag(table, "Grain line", -1.1, 0.98, 0, { css: "#c77bd9", w: 0.24 });
    const grainGuide = box(table, 0.5, 0.01, 0.4, -0.8, 0.9, -0.15, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, grainGuide, "grainline-guide");
    const napZone = box(table, 0.5, 0.01, 0.4, -0.1, 0.9, -0.15, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, napZone, "nap-zone");

    // Pattern pieces waiting off the table before they're dragged on.
    function piecePaper(parent, x, z, label, color, ry = 0) {
      const p = group(parent, x, 0.905, z, ry);
      const sheet = decal(p, 0.42, 0.34, 0, 0.002, 0, (cx, w, h) => {
        cx.fillStyle = "#f3ecd8"; cx.fillRect(0, 0, w, h);
        cx.strokeStyle = "#22303c"; cx.lineWidth = Math.max(2, h * 0.02);
        cx.beginPath(); cx.moveTo(w * 0.1, h * 0.85); cx.quadraticCurveTo(w * 0.5, h * 0.05, w * 0.9, h * 0.85); cx.stroke();
        cx.strokeStyle = color; cx.lineWidth = Math.max(2, h * 0.015);
        cx.beginPath(); cx.moveTo(w * 0.5, h * 0.15); cx.lineTo(w * 0.5, h * 0.78); cx.stroke();
        cx.fillStyle = "#22303c"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
        cx.textAlign = "center"; cx.fillText(label, w / 2, h * 0.94);
      }, { px: 256, rough: 0.85 });
      sheet.rotation.x = -Math.PI / 2;
      return p;
    }
    const pieceFront = piecePaper(table, -1.35, 1.5, "FRONT — SZ 8", "#c0392b");
    reg(hits, pieceFront, "piece-front");
    const pieceSleeve = piecePaper(table, -0.75, 1.5, "SLEEVE — SZ 8", "#2d6fb5");
    reg(hits, pieceSleeve, "piece-sleeve");
    const pieceOffGrain = piecePaper(table, 0.9, -0.1, "BACK — SZ 8", "#27904e", 0.32);
    reg(hits, pieceOffGrain, "piece-off-grain");

    // ------------------------------------------------------------ cloth bolt
    const bolt = group(g, -2.1, 0, -0.4, 0.3);
    for (const sx of [-0.55, 0.55]) box(bolt, 0.06, 0.9, 0.06, sx, 0.45, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const rollerAxis = cyl(bolt, 0.09, 0.09, 1.0, 0, 0.75, 0, 0x8a6a42, { rough: 0.75, seg: 16 });
    rollerAxis.rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) cyl(bolt, 0.16 - i * 0.008, 0.16 - i * 0.008, 0.02, 0, 0.75, -0.45 + i * 0.02, 0x9a6a3c, { rough: 0.7, seg: 20, cast: false });
    const crank = group(bolt, 0.5, 0.75, 0);
    box(crank, 0.14, 0.02, 0.02, 0.07, 0, 0, 0x2b2f34, { rough: 0.6 });
    cyl(crank, 0.02, 0.02, 0.06, 0.14, 0, 0, 0x2b2f34, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    reg(hits, crank, "cloth-roller");
    const clothSheet = box(bolt, 0.9, 0.006, 0.02, 0.02, 0.6, 0, 0x8fa6c9, { rough: 0.8 });
    void clothSheet;
    const napArrow = decal(bolt, 0.18, 0.22, 0, 0.35, 0.5, (cx, w, h) => {
      cx.fillStyle = "#f3ecd8"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#22303c"; cx.lineWidth = h * 0.08;
      cx.beginPath(); cx.moveTo(w * 0.5, h * 0.85); cx.lineTo(w * 0.5, h * 0.2); cx.moveTo(w * 0.3, h * 0.4); cx.lineTo(w * 0.5, h * 0.15); cx.lineTo(w * 0.7, h * 0.4); cx.stroke();
    }, { px: 128, rough: 0.7 });
    reg(hits, napArrow, "nap-arrow");
    holoTag(bolt, "Cloth bolt", 0, 1.0, 0, { css: "#c77bd9", w: 0.24 });

    // ------------------------------------------------------------ cut ticket
    const ticket = holoPanel(g, 0.56, 0.4, -2.4, 1.5, 0.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,24,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c77bd9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eeddf4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("CUT TICKET — STYLE 4402", w * 0.06, h * 0.14);
      ctx.fillStyle = "#f7eefb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("RATIO 1-2-1 · NAP LAYOUT", w * 0.06, h * 0.34);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#d8c2e2";
      ["12 pieces per marker", "Corduroy, 54\" wide", "One-way nap — arrow up"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.52 + i * 0.13)));
    }, { ry: 0.5, accent: PML_ACCENT });
    reg(hits, ticket, "cut-ticket");

    const tally = holoPanel(g, 0.5, 0.36, 2.5, 1.4, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20,10,24,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c77bd9"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f7eefb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("MARKER TALLY", w / 2, h * 0.28);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillStyle = "#d8c2e2";
      ctx.fillText("12 pieces vs. 12 on ticket", w / 2, h * 0.56);
      ctx.fillText("Ratio 1-2-1 — confirmed", w / 2, h * 0.76);
    }, { ry: -0.6, accent: PML_ACCENT });
    reg(hits, tally, "marker-tally");

    // ------------------------------------------------------------ tool tray
    const tray = toolChest(g, 1.9, -1.2, { ry: -0.6, color: 0x6a4c85 });
    const chalk = group(tray, -0.1, 0.78, 0.05);
    box(chalk, 0.1, 0.02, 0.02, 0, 0, 0, 0xeee6d4, { rough: 0.9 });
    reg(hits, chalk, "chalk");
    holoTag(chalk, "Tailor's chalk", 0, 0.08, 0, { css: "#c77bd9", w: 0.24 });

    const wheel = group(tray, 0.15, 0.78, 0.06, 0.3);
    cyl(wheel, 0.012, 0.012, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    const wheelDisc = cyl(wheel, 0.045, 0.045, 0.008, 0.1, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 20 });
    wheelDisc.rotation.z = Math.PI / 2;
    reg(hits, wheel, "tracing-wheel");
    holoTag(wheel, "Tracing wheel", 0, 0.1, 0, { css: "#c77bd9", w: 0.28 });

    const notcher = group(tray, -0.2, 0.78, -0.08, -0.4);
    box(notcher, 0.16, 0.02, 0.03, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    box(notcher, 0.05, 0.03, 0.02, 0.1, 0.015, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, notcher, "notch-punch");
    holoTag(notcher, "Notcher", 0, 0.08, 0, { css: "#c77bd9", w: 0.22 });

    const awl = group(tray, 0.18, 0.78, -0.1, 0.5);
    cyl(awl, 0.014, 0.014, 0.1, 0, 0, 0, 0x5b3a24, { rough: 0.7, seg: 12 });
    cyl(awl, 0.004, 0.001, 0.09, 0, 0.09, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 10 });
    reg(hits, awl, "drill-awl");
    holoTag(awl, "Awl", 0, 0.16, 0, { css: "#c77bd9", w: 0.18 });

    // Spare awl left point up in the tray — hazard.
    const awlSpare = group(tray, -0.05, 0.78, -0.12);
    cyl(awlSpare, 0.013, 0.013, 0.09, 0, 0, 0, 0x5b3a24, { rough: 0.7, seg: 12 });
    cyl(awlSpare, 0.004, 0.001, 0.08, 0, 0.085, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 10 });
    holoTag(awlSpare, "spare awl — point up", 0, 0.15, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, awlSpare, "awl-spare");

    // Open notching plier left at the table edge — hazard.
    const notcherOpen = group(table, 1.45, 0.91, -0.5, 0.5);
    box(notcherOpen, 0.14, 0.018, 0.03, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    box(notcherOpen, 0.05, 0.03, 0.018, 0.09, 0.02, 0, 0xdfe4e8, { rough: 0.2, metal: 0.85 });
    holoTag(notcherOpen, "notcher — jaws open", 0, 0.08, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, notcherOpen, "notcher-open");

    // Rotary cutter, blade exposed, on the far table edge — hazard.
    const rotary = group(table, -1.4, 0.905, 0.55, -0.3);
    box(rotary, 0.16, 0.03, 0.03, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    cyl(rotary, 0.045, 0.045, 0.006, 0.11, -0.01, 0, 0xdfe4e8, { rough: 0.15, metal: 0.9, seg: 20 }).rotation.z = Math.PI / 2;
    holoTag(rotary, "rotary cutter — exposed", 0, 0.08, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, rotary, "rotary-cutter");

    // Cloth trailing off the table edge onto the floor — hazard.
    const runoff = group(g, -1.3, 0, 0.4, 0.2);
    box(runoff, 0.5, 0.006, 0.9, 0, 0.86, -1.0, 0x8fa6c9, { rough: 0.8, cast: false });
    box(runoff, 0.5, 0.006, 0.45, 0, 0.42, -1.35, 0x8fa6c9, { rough: 0.8, cast: false }).rotation.x = -0.5;
    holoTag(runoff, "cloth trailing on the floor", 0, 0.55, -1.2, { css: "#f0645b", w: 0.5 });
    reg(hits, runoff, "cloth-runoff");

    // Marker efficiency readout on the pendant beside the table.
    const pendant = group(g, 1.6, 0, -1.5, -0.4);
    box(pendant, 0.05, 1.1, 0.05, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
    const effPanel = instrument(pendant, 0, 1.05, 0.09, { idle: "-- %", color: PML_ACCENT, w: 0.16, d: 0.22, ry: 0 });
    holoTag(pendant, "Marker efficiency", 0, 1.28, 0.09, { css: "#c77bd9", w: 0.4 });
    reg(hits, effPanel, "marker-efficiency");

    // Size label rack, tags waiting to be clipped on.
    const labelRack = group(g, 2.2, 0, 0.6, -0.6);
    box(labelRack, 0.3, 0.4, 0.04, 0, 0.7, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 4; i++) {
      decal(labelRack, 0.1, 0.14, -0.11 + i * 0.075, 0.72, 0.025,
        paperFace("SZ " + [6, 8, 10, 12][i], [], { bg: "#f4e9d8" }), { px: 96 });
    }
    holoTag(labelRack, "Size tags", 0, 0.94, 0, { css: "#c77bd9", w: 0.24 });
    reg(hits, labelRack, "size-labels");

    // -------------------------------------------------------------- dressing
    // Two background lockstitch heads on their own tables, a thread rack, a
    // stack of cloth bolts, tied bundles waiting for the cutting room, an
    // extinguisher and a shop safety board — the sewing room this table sits
    // in, not a bare stage around it.
    function lockstitchHead(parent, x, z, ry) {
      const m = group(parent, x, 0, z, ry);
      for (const [lx, lz] of [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]]) {
        box(m, 0.05, 0.78, 0.05, lx, 0.39, lz, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
      }
      box(m, 0.8, 0.04, 0.55, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
      const head = group(m, 0.15, 0.82, -0.05);
      box(head, 0.3, 0.28, 0.14, 0, 0.14, 0, 0x1c2024, { rough: 0.35, metal: 0.5 });
      box(head, 0.06, 0.2, 0.06, 0, 0.34, 0.02, 0x1c2024, { rough: 0.35, metal: 0.5 });
      cyl(head, 0.01, 0.01, 0.16, 0, 0.44, 0.02, CITY.steel, { rough: 0.3, metal: 0.8, seg: 8 });
      box(head, 0.12, 0.03, 0.09, 0, 0.02, 0.09, 0x8b929a, { rough: 0.4, metal: 0.6 }); // guard
      const wheel2 = cyl(head, 0.06, 0.06, 0.02, -0.16, 0.2, 0, 0x2b2f34, { rough: 0.4, metal: 0.6, seg: 16 });
      wheel2.rotation.x = Math.PI / 2;
      cyl(m, 0.09, 0.11, 0.35, -0.3, 0.55, 0.2, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 12 });
      return m;
    }
    lockstitchHead(g, -1.6, -2.4, 0.2);
    lockstitchHead(g, 0.6, -2.6, -0.15);

    const threadRack = rackFrame(g, 2.5, -2.2, { ry: -0.5, h: 1.3 });
    const threadColours = [0xb8402f, 0x2d6fb5, 0x27904e, 0xe0972e, 0x6a4c85, 0xdfe4e8];
    threadColours.forEach((c, i) => {
      cyl(threadRack, 0.045, 0.045, 0.12, -0.2 + (i % 3) * 0.2, 0.5 + Math.floor(i / 3) * 0.3, 0.26, c, { rough: 0.75, seg: 14 });
    });
    holoTag(threadRack, "Thread rack", 0, 1.0, 0.26, { css: "#c77bd9", w: 0.28 });

    const boltStack = group(g, -2.6, 0, -1.7, 0.3);
    const boltColours = [0x8fa6c9, 0x9a7448, 0x6a4c85];
    boltColours.forEach((c, i) => {
      cyl(boltStack, 0.16, 0.16, 0.7, 0, 0.16 + i * 0.34, 0, c, { rough: 0.75, seg: 16 }).rotation.z = Math.PI / 2;
    });
    holoTag(boltStack, "Cloth bolts", 0, 1.15, 0, { css: "#c77bd9", w: 0.26 });

    const bundle = group(g, 2.2, 0, -2.3, 0.4);
    box(bundle, 0.4, 0.32, 0.4, 0, 0.16, 0, 0x8fa6c9, { rough: 0.85 });
    for (const rot of [0.6, -0.6]) {
      cyl(bundle, 0.008, 0.008, 0.5, 0, 0.16, 0, 0xdfe4e8, { rough: 0.6, seg: 8 }).rotation.z = rot;
    }
    holoTag(bundle, "Bundle — Style 4402", 0, 0.4, 0, { css: "#c77bd9", w: 0.4 });
    const bundle2 = group(g, 1.9, 0, -2.5, -0.3);
    box(bundle2, 0.36, 0.26, 0.36, 0, 0.13, 0, 0x9a7448, { rough: 0.85 });
    for (const rot of [0.5, -0.5]) {
      cyl(bundle2, 0.008, 0.008, 0.44, 0, 0.13, 0, 0xdfe4e8, { rough: 0.6, seg: 8 }).rotation.z = rot;
    }

    const scrapBin = group(g, -2.7, 0, 0.6, -0.3);
    box(scrapBin, 0.5, 0.4, 0.4, 0, 0.2, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(scrapBin, 0.3, 0.02, 0.1, -0.08 + (i % 2) * 0.16, 0.42 + Math.floor(i / 2) * 0.03, (i % 2) * 0.1, 0x8fa6c9, { rough: 0.6 });
    holoTag(scrapBin, "cloth scraps", 0, 0.58, 0, { css: "#c77bd9", w: 0.28 });

    const spoolCarts = group(g, -0.4, 0, 1.7, 0.4);
    box(spoolCarts, 0.4, 0.04, 0.3, 0, 0.5, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(spoolCarts, 0.02, 0.02, 0.5, sx * 0.16, 0.25, sz * 0.11, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    const spoolColours2 = [0xb8402f, 0x27904e, 0xe0972e];
    spoolColours2.forEach((c, i) => cyl(spoolCarts, 0.035, 0.035, 0.1, -0.1 + i * 0.1, 0.57, 0, c, { rough: 0.7, seg: 12 }));

    const ext = group(g, -2.5, 0, 1.6, -0.7);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });

    const safetyBoard = group(g, 2.6, 0, 1.5, 0.4);
    box(safetyBoard, 0.5, 0.4, 0.03, 0, 1.1, 0, 0x1b2026, { rough: 0.6 });
    decal(safetyBoard, 0.44, 0.34, 0, 1.1, 0.018,
      signFace("MARKING\nTABLE\nSAFETY", { bg: "#0d1c24", accent: "#c77bd9", fg: "#fff3d6", scale: 0.28 }));
    cyl(safetyBoard, 0.02, 0.02, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    // Anti-fatigue matting in front of the table.
    slab(g, 2.4, 0.02, 0.7, 0, 0.01, 0.4, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) {
      box(g, 0.09, 0.006, 0.09, -1.0 + i * 0.33, 0.022, 0.18 + j * 0.44, 0x14171a, { cast: false, receive: false });
    }

    // A second marker maker at the lockstitch tables in the background, clear
    // of every control on this bench.
    const crew = standingFigure(g, -1.95, -1.45, { ry: -0.3, cloth: 0xf2f2f2, trousers: 0x2b3138 });
    void crew;

    let effT = 0.5;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.15, -0.4),

      onStepComplete(step) {
        if (step.id === "unroll") { clothSheet.scale.x = 1.2; }
        if (step.id === "grainline") { pieceFront.position.set(-0.8, 0.905, -0.15); pieceFront.rotation.y = 0; }
        if (step.id === "nap-piece") { pieceSleeve.position.set(-0.1, 0.905, -0.15); pieceSleeve.rotation.y = 0; }
        if (step.id === "off-grain-find") { pieceOffGrain.rotation.y = 0; }
        if (step.id === "size-labels") { repaint(effPanel.userData.screen, signFace("TAGGED", { bg: "#1c3320", accent: "#59c97b", fg: "#eafbf1", scale: 0.5 })); }
      },

      onInterrupt(it) {
        if (it.id === "against-nap") { pieceSleeve.rotation.y = Math.PI; pieceSleeve.material?.color?.set?.(0xf0645b); }
        if (it.id === "ticket-revised") { ticket.userData.face.material.emissiveIntensity = 2.2; ticket.position.y = 1.62; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "against-nap") { pieceSleeve.rotation.y = 0; }
        if (it.id === "ticket-revised") { ticket.userData.face.material.emissiveIntensity = 0.95; ticket.position.y = 1.5; }
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "efficiency") {
          effT = gg.t;
          repaint(effPanel.userData.screen, signFace(`${Math.round(70 + gg.t * 22)}%`, {
            bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6,
          }));
        }
        void effT;
      },
    };
  },
};
