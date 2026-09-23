import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Garden Soil Screen VR — Hunters Point Edition, Community
// Environmental Justice.
//
// Screening a community garden bed for lead and arsenic with a handheld XRF
// analyser, on a generic garden a few blocks from a fenced cleanup site —
// not the garden, no real gardeners named. The instrument is only as honest
// as its last check standard; the grid is what turns one reading into a
// defensible map of the bed; and the two numbers that decide anything are
// the action levels on the board, not what the soil looks like.

const GSS_ACCENT = 0x7fbf6a;

export const SIM_GARDEN_SOIL_SCREEN = {
  id: "garden-soil-screen",
  index: "160",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "California Department of Public Health Radiologic Health Branch registration for the XRF analyser's sealed source under OSHA 29 CFR 1910.1096 ionizing radiation; NIOSH field-portable XRF guidance for lead and arsenic screening; ASTM D6288 field portable XRF method; DTSC / OEHHA California Human Health Screening Levels for lead and arsenic in residential soil; EPA guidance on gardening in urban soils; the Hunters Point Biomonitoring Initiative's community garden screening protocol",
  name: "Garden Soil Screen",
  title: simTitle("Garden Soil Screen"),
  tagline: "Screening a community garden bed with a handheld XRF: the check standard proven first, the grid laid out, readings taken at depth, the action levels read straight, the bed that fails flagged and raised with clean fill, and a results sheet the gardeners can actually read",
  accent: GSS_ACCENT,
  accentCss: "#7fbf6a",
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "bed-honest", name: "Bed Honest", note: "A proven instrument, a real grid, an honest action-level call, and a failed bed raised with clean fill — not planted in" },

  game: system({
    name: "Garden Screen",
    currency: "READING",
    ranks: ["Volunteer", "Garden Screener", "Bed Lead", "Screening Coordinator", "Garden Screen Certified"],
    badges: [
      { id: "standard-first", name: "Standard First", note: "Never took a reading before the check standard proved the instrument", test: AWARD.stepClean("check-standard") },
      { id: "no-exposure", name: "No Exposure", note: "Never a hazard — instrument, bed or fill", test: AWARD.safe },
      { id: "reading-true", name: "Reading True", note: "The XRF reading and the depth hold both inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-screen", name: "Clean Screen", note: "No corrections across the whole screening event", test: AWARD.clean },
      { id: "depth-held", name: "Depth Held", note: "Held the probe steady for the full reading", test: AWARD.unbroken },
      { id: "bed-flagged-fast", name: "Bed Flagged Fast", note: "Failed bed flagged and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "point-at-person": "You swung the XRF's window toward the volunteer standing beside the bed. The sealed source in this instrument is why the state's Radiologic Health Branch registers it in the first place — the window points at soil and nothing else, ever, no matter how quick the check.",
    "skip-check-standard": "You pressed the XRF straight onto the bed's soil without ever reading the certified check standard first. A reading off an unproven instrument is not evidence of anything — the ASTM method this screening follows exists specifically so a number can be trusted, and that starts with proving the instrument before it ever touches a gardener's bed.",
    "plant-in-failed-bed": "You reached for the seed packets at the edge of the bed that just read over the action level. The reading is the reason nothing goes into this soil until it is raised and refilled — planting in it now puts down roots, and small hands, in dirt this station exists to keep them out of.",
    "no-clean-fill": "You grabbed the bag of soil dug out of the yard instead of the certified clean fill pallet. A raised bed built on the same contaminated soil, refilled with more of the same dirt from three feet away, is a taller box around the same problem — the whole point of raising it is the fill underneath being something else entirely.",
  },

  lateNotes: {
    "xrf-reading": "Nothing to read yet — the probe has to sit at depth in the bed before the analyser has anything real under its window.",
    "bed-marker-flag": "There is no call to flag yet — the reading has to clear the action-level board first, or the flag is a guess dressed up as a result.",
  },

  // Both interruptions fire while the screener's hands are already committed
  // to a hold: one while the probe is down in the bed and a bystander's
  // attention has gone elsewhere; one while the check standard is still
  // seated against the window, before a single real reading has been taken.
  interrupts: [
    {
      id: "child-hands-in-bed",
      kind: "Child's hands in the failed bed",
      after: "probe-depth", delay: 3, seconds: 12,
      alert: "A toddler from the family gardening two beds over has wandered off and is kneeling at the edge of this bed, both hands already down in the soil the XRF is sitting in.",
      cue: "Stop the family before more soil ends up on those hands — the caution sign, now.",
      target: "caution-sign",
      why: "Lead in soil does not need a cut or a scrape to get into a child — hand-to-mouth contact is the main route for a toddler exactly this age, and this bed has not even been cleared yet. The reading can wait eight seconds; the hands coming out of that soil cannot.",
      missNote: "The reading finished with the child still kneeling in the bed the whole time — whatever this soil turns out to hold, it already had eight more seconds of contact with two-year-old hands than any screening protocol accounts for.",
      wrongNote: "That's not it — the caution sign is what gets the family off this bed right now, not the analyser in your hand.",
    },
    {
      id: "standard-out-of-range",
      kind: "Check standard reads out of range",
      after: "check-standard", delay: 3, seconds: 12,
      alert: "The XRF's reading on its own certified check standard has drifted well outside the value on the standard's own certificate — something about today's instrument is not what it was at the last calibration.",
      cue: "Don't trust this instrument yet — swap in the fresh standard block and rerun the check.",
      target: "recheck-standard",
      why: "A check standard reading outside its certified range is not a rounding error, it is the one warning the instrument gives before every reading that follows it is wrong in the same direction — a drifted analyser can read a contaminated bed as clean or a clean bed as failed, and there is no way to tell which from the readout alone.",
      missNote: "The screening went ahead on an instrument that had just failed its own check standard. Every reading logged today now carries an asterisk nobody can remove after the fact — the gardeners get a results sheet built on a number the instrument itself had already contradicted.",
      wrongNote: "Not that — the fresh standard block is what proves the instrument again. Nothing else on this table does.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "screening-plan",
      title: "Read the screening plan",
      cue: "Check the bed list, the grid spacing, the sample depth and the action levels before the case comes open.",
      why: "The plan sets which beds get screened this morning, how many points make up each bed's grid, and how deep the probe has to sit — a screener who has not read it is guessing at the very numbers that decide whether a family's bed gets flagged.",
    },
    {
      id: "stage-gear", kind: "sequence", anyOrder: true,
      targets: ["nitrile-gloves", "dosimeter-badge", "operator-card"],
      itemNames: { "nitrile-gloves": "nitrile gloves", "dosimeter-badge": "radiation dosimeter badge", "operator-card": "XRF operator certification card" },
      title: "Stage the screener's own gear",
      cue: "Gloves on, dosimeter badge clipped on, operator card checked against today's instrument.",
      why: "The gloves keep whatever is actually in this soil off the screener's own hands between beds; the dosimeter is how the state's Radiologic Health Branch tracks exposure from the sealed source over a whole season of screenings, not just today; and the operator card is what makes today's reading one a registered operator is allowed to certify.",
    },
    {
      id: "check-standard", kind: "hold", target: "check-standard-block", seconds: 7,
      title: "Prove the instrument on its check standard",
      cue: "Hold the XRF's window against the certified check standard until the reading settles.",
      why: "The check standard has a certified, known value written on its own certificate — reading it first is the only way to know the instrument in your hand today is reading true, before it is ever trusted on soil where the true answer is exactly what nobody yet knows.",
      holdBreakNote: "You lifted the window before the reading settled — an unsettled check proves nothing about the instrument either way.",
    },
    {
      id: "lay-grid", kind: "sequence", anyOrder: true,
      targets: ["grid-1", "grid-2", "grid-3", "grid-4"],
      itemNames: { "grid-1": "grid stake — corner 1", "grid-2": "grid stake — corner 2", "grid-3": "grid stake — corner 3", "grid-4": "grid stake — corner 4" },
      title: "Lay out the bed's screening grid",
      cue: "Place all four stakes so the bed is divided into the plan's screening grid.",
      why: "One reading from wherever the probe happens to land is a reading about that one spot, not about the bed a family is about to plant — the grid is what turns a single number into a result that actually describes the whole bed the gardeners are asking about.",
    },
    {
      id: "probe-depth", kind: "hold", target: "xrf-probe", seconds: 8,
      title: "Seat the probe at the marked depth",
      cue: "Press the XRF's window flat against the soil at the depth collar and hold it steady.",
      why: "Lead and arsenic in garden soil are not even top to bottom — a probe held at the surface reads whatever blew in or was tracked across the top, while the depth collar is where a trowel and a child's hands actually reach. Holding steady at that depth is what makes the reading about the soil a plant's roots and a gardener's hands will actually touch.",
      holdBreakNote: "The window lifted off the soil before the reading settled — pick the depth back up and hold it there for the full count.",
    },
    {
      id: "read-xrf", kind: "gauge", target: "xrf-reading",
      title: "Read the lead and arsenic result",
      cue: "Let the analyser's reading settle and commit the value it lands on.",
      why: "The number on the screen is what the action-level board is about to be measured against — read it too early, while it is still climbing toward a stable value, and the bed gets judged against a number the instrument had not actually finished giving yet.",
      gauge: { label: "Pb / As", speed: 0.68, green: [0.42, 0.6], readout: (t) => `${Math.round(320 + t * 260)} ppm`, missNote: "That reading had not settled yet — let the analyser finish and commit the value it holds steady on." },
    },
    {
      id: "action-levels", kind: "select", target: "action-board",
      title: "Compare the reading to the action levels",
      cue: "Check today's reading against the DTSC / OEHHA screening levels on the board.",
      why: "A number in parts per million means nothing to a gardener on its own — the action-level board is what turns 500-odd parts per million into a plain answer: this bed is safe to plant, or it is not, measured against the same residential screening levels the state itself uses.",
    },
    {
      id: "flag-bed", kind: "drag", target: "bed-marker-flag",
      title: "Flag the failed bed",
      cue: "Carry the red \"do not plant\" marker to the bed that read over the action level.",
      why: "A result that lives only on a clipboard is a result the next volunteer who walks by never sees — the flag standing in the bed itself is what stops a hand reaching for a trowel here before the results sheet ever makes it back to the shed.",
      drag: { to: "bed-socket", radius: 0.45, missNote: "Not planted yet — the flag has to go in the bed itself, where the next person walking by will actually see it." },
    },
    {
      id: "clean-fill", kind: "select", target: "clean-fill-pallet",
      title: "Call for the raised bed and its clean fill",
      cue: "Order the raised-bed frame and the certified clean fill — not more of this bed's own soil.",
      why: "Raising the bed only solves anything if what goes inside it is different from what failed — certified clean fill, with its own paperwork, is what makes the new bed a fresh answer instead of the same contaminated dirt sitting a few inches higher.",
    },
    {
      id: "build-raised-bed", kind: "sequence",
      targets: ["raised-frame", "bed-liner", "clean-fill-pour"],
      itemNames: { "raised-frame": "raised-bed frame", "bed-liner": "root barrier liner", "clean-fill-pour": "certified clean fill" },
      title: "Build the raised bed",
      cue: "Set the frame, lay the root barrier liner, then fill with the certified clean soil.",
      why: "The liner goes down before the fill for the same reason the fill has to be clean at all — without it, a root or a worm eventually moves contaminated soil up into the very fill that was supposed to be the fix, on a timeline measured in seasons rather than an afternoon.",
      outOfOrderNote: "Frame, then liner, then fill — clean soil poured before the liner is down just sits on top of the problem it was bought to avoid.",
    },
    {
      id: "results-sheet", kind: "select", target: "results-sheet",
      title: "Complete the results sheet for the gardeners",
      cue: "Write the bed's result, the action level it was measured against, and the raised-bed plan in plain language.",
      why: "The gardeners who use this bed every week are not going to read a lab report in parts per million — the results sheet is what tells them, in their own language, which bed is fine, which bed is being raised, and why, so the decision this station made is one they can actually act on.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["mislabeled-fill-bag"],
      itemNames: { "mislabeled-fill-bag": "the bag marked \"garden soil\" beside the shed" },
      itemNotes: { "mislabeled-fill-bag": "This bag reads \"garden soil\" but it is dug from the yard, not the certified pallet — left beside the shed, it is exactly what the next volunteer reaches for without knowing today's result." },
      title: "Walk the garden before you pack up",
      cue: "Check the shed and the beds once more for anything that could undo today's result.",
      why: "The screening crew is not here every day — anything left ambiguous now is a decision some volunteer without today's results sheet will make alone, on a Saturday morning, with a trowel already in hand.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, GSS_ACCENT);

    // ---------------------------------------------------------------- ground
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { base: "#5a5340", base2: "#4d4736", tiles: 4 }), { repeat: 3, px: 256 });
    const path = box(g, 5.6, 0.1, 1.4, 0, 0.05, 1.6, 0x5a5340, { rough: 0.92, cast: false });
    path.material = texturedMat(padTex, { rough: 0.92, color: 0x9a9578 });
    const dirt = box(g, 5.6, 0.08, 3.0, 0, 0.04, -0.5, 0x4a3d28, { rough: 0.97, cast: false });

    // -------------------------------------------------------------- garden beds
    function bedBox(x, z, w, d, color) {
      const bg = group(g, x, 0.04, z);
      box(bg, w, 0.24, d, 0, 0.12, 0, 0x6f5a3a, { rough: 0.9 });
      const soil = box(bg, w - 0.1, 0.06, d - 0.1, 0, 0.25, 0, color, { rough: 0.95 });
      return { bg, soil };
    }
    // Two already-raised beds, planted, off to the side — the norm this
    // garden is trying to keep every bed at.
    const raisedA = bedBox(-1.9, 1.3, 0.9, 0.6, 0x3a4a2a);
    for (let i = 0; i < 4; i++) ball(raisedA.bg, 0.05, -0.3 + i * 0.2, 0.34, 0, 0x5f8a3f, { rough: 0.85, seg: 8 });
    const raisedB = bedBox(1.9, 1.4, 0.9, 0.6, 0x3a4a2a);
    for (let i = 0; i < 4; i++) ball(raisedB.bg, 0.05, -0.3 + i * 0.2, 0.34, 0, 0x5f8a3f, { rough: 0.85, seg: 8 });

    // The bed under test — native soil, not yet raised.
    const testBed = bedBox(0, -0.9, 1.5, 1.0, 0x4a3d28);

    // ----------------------------------------------------------------- grid
    const gridSpecs = [["grid-1", -0.6, -1.3], ["grid-2", 0.6, -1.3], ["grid-3", -0.6, -0.5], ["grid-4", 0.6, -0.5]];
    for (const [id, x, z] of gridSpecs) {
      const stake = group(g, x, 0.3, z);
      cyl(stake, 0.01, 0.012, 0.3, 0, 0.15, 0, 0xe8b02e, { rough: 0.6, seg: 8 });
      reg(hits, stake, id);
    }

    // -------------------------------------------------------------- XRF bench
    const bench = group(g, -1.3, 0.1, -0.2, 0.4);
    box(bench, 1.1, 0.7, 0.5, 0, 0.35, 0, 0x8a7d63, { rough: 0.75 });
    const xrfBody = group(bench, -0.1, 0.72, 0);
    box(xrfBody, 0.18, 0.08, 0.28, 0, 0.04, 0, GSS_ACCENT, { rough: 0.5, metal: 0.3 });
    box(xrfBody, 0.06, 0.06, 0.06, 0, 0.02, -0.19, 0x2b2f34, { rough: 0.4, metal: 0.5 });
    const xrfReadout = instrument(bench, -0.1, 0.86, 0, { idle: "-- ppm", color: GSS_ACCENT, w: 0.12, d: 0.18 });
    holoTag(bench, "XRF analyser", -0.1, 1.02, 0, { css: "#7fbf6a", w: 0.32 });

    const standardBlock = group(bench, 0.25, 0.73, 0.05);
    box(standardBlock, 0.16, 0.03, 0.16, 0, 0.015, 0, 0xdfe6ec, { rough: 0.4 });
    decal(standardBlock, 0.14, 0.14, 0, 0.031, 0, signFace("NIST CERT", { bg: "#e8eef2", accent: "#1b1e22", scale: 0.5 }));
    reg(hits, standardBlock, "check-standard-block");
    const driftLamp = ball(standardBlock, 0.016, 0, 0.05, 0.07, 0x59c97b, { emissive: 0x59c97b, ei: 1.4, seg: 10 });
    const freshStandard = group(bench, 0.42, 0.73, -0.12);
    box(freshStandard, 0.14, 0.03, 0.14, 0, 0.015, 0, 0xd9e6d0, { rough: 0.4 });
    decal(freshStandard, 0.12, 0.12, 0, 0.031, 0, signFace("SPARE STD", { bg: "#e0ecda", accent: "#1b1e22", scale: 0.45 }));
    reg(hits, freshStandard, "recheck-standard");

    const probe = group(g, 0, 0.3, -0.9);
    cyl(probe, 0.02, 0.024, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.4, metal: 0.6, seg: 10 });
    const collar = cyl(probe, 0.045, 0.05, 0.02, 0, 0.02, 0, 0xe8622a, { rough: 0.6, seg: 14 });
    holoTag(probe, "depth collar", 0, 0.55, 0, { css: "#7fbf6a", w: 0.3 });
    reg(hits, probe, "xrf-probe");
    void collar;

    const readoutHolo = holoPanel(g, 0.6, 0.4, 0.7, 1.0, -0.9, (cx, w, h) => {
      cx.fillStyle = "#12200e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fbf6a"; cx.fillRect(0, 0, w, 5);
      cx.font = `700 ${Math.round(h * 0.22)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6df"; cx.fillText("-- ppm", w / 2, h * 0.55);
    }, { ry: -0.3, accent: GSS_ACCENT });
    reg(hits, readoutHolo, "xrf-reading");

    // ------------------------------------------------------------ plan board
    const planBoard = holoPanel(g, 0.92, 0.62, -1.9, 1.15, -0.2, (cx, w, h) => {
      cx.fillStyle = "#12200e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fbf6a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#eaf6df"; cx.fillText("GARDEN SCREENING PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#dcefd2";
      ["Beds today: 3 · grid: 4 pts / bed", "Depth: 6 in below surface", "Instrument: prove on check std first",
       "Action levels: DTSC/OEHHA CHHSL", "Fail → raise bed, certified fill only"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.4, accent: GSS_ACCENT });
    reg(hits, planBoard, "screening-plan");

    // -------------------------------------------------------------- action levels
    const actionBoard = holoPanel(g, 0.9, 0.58, 1.9, 1.1, -0.2, (cx, w, h) => {
      cx.fillStyle = "#12200e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8b02e"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd0"; cx.fillText("DTSC / OEHHA ACTION LEVELS", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#efe3bf";
      ["Lead (residential garden): 80 ppm", "Arsenic (residential garden): 0.07 ppm", "Over either → raise, do not plant"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.14)));
    }, { ry: -0.35, accent: 0xe8b02e });
    reg(hits, actionBoard, "action-board");

    // --------------------------------------------------------------- gear
    const gearBench = group(g, -2.0, 0.1, 1.0, 0.5);
    box(gearBench, 0.7, 0.5, 0.35, 0, 0.25, 0, 0x8a7d63, { rough: 0.75 });
    const gloves = box(gearBench, 0.14, 0.03, 0.1, -0.2, 0.52, 0, 0x4a7fd8, { rough: 0.8 });
    holoTag(gearBench, "nitrile gloves", -0.2, 0.65, 0, { css: "#7fbf6a", w: 0.3 });
    reg(hits, gloves, "nitrile-gloves");
    const dosimeter = box(gearBench, 0.06, 0.08, 0.02, 0, 0.53, 0, 0xe8eef2, { rough: 0.5 });
    holoTag(gearBench, "dosimeter badge", 0, 0.65, 0, { css: "#7fbf6a", w: 0.32 });
    reg(hits, dosimeter, "dosimeter-badge");
    const opCard = box(gearBench, 0.09, 0.005, 0.06, 0.22, 0.505, 0, 0xf3efe4, { rough: 0.7 });
    holoTag(gearBench, "operator card", 0.22, 0.62, 0, { css: "#7fbf6a", w: 0.32 });
    reg(hits, opCard, "operator-card");

    // ------------------------------------------------------------- hazards
    const bystander = standingFigure(g, -0.4, 0.55, { ry: 2.4, cloth: 0x3a5a3a });
    holoTag(bystander, "garden volunteer", 0, 1.9, 0, { css: "#7fbf6a", w: 0.34 });
    const pointHit = box(g, 0.35, 0.5, 0.35, -1.0, 1.2, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "point it toward the volunteer?", -1.0, 1.5, 0.35, { css: "#d2312b", w: 0.5 });
    reg(hits, pointHit, "point-at-person");

    const skipHit = box(g, 0.4, 0.2, 0.3, 0.3, 0.3, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip straight to the bed?", 0.3, 0.55, -0.9, { css: "#d2312b", w: 0.48 });
    reg(hits, skipHit, "skip-check-standard");

    const seedRack = group(g, 0.9, 0.28, -1.15);
    for (let i = 0; i < 4; i++) box(seedRack, 0.05, 0.07, 0.01, -0.08 + i * 0.05, 0.035, 0, [0xd88a4a, 0x7fbf6a, 0xe8b02e, 0xd2745b][i], { rough: 0.7 });
    holoTag(seedRack, "seed packets", 0, 0.12, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, seedRack, "plant-in-failed-bed");

    // ---------------------------------------------------------------- fill
    const cleanPallet = group(g, 1.7, 0.1, -1.5);
    box(cleanPallet, 0.5, 0.35, 0.4, 0, 0.18, 0, 0xdad0b0, { rough: 0.85 });
    decal(cleanPallet, 0.4, 0.16, 0, 0.361, 0, signFace("CERTIFIED CLEAN FILL", { bg: "#1c1608", accent: "#dad0b0", scale: 0.42 }));
    reg(hits, cleanPallet, "clean-fill-pallet");
    const dirtyBag = group(g, 1.5, 0.06, -1.85);
    box(dirtyBag, 0.3, 0.24, 0.22, 0, 0.12, 0, 0x5a4a2f, { rough: 0.9 });
    decal(dirtyBag, 0.24, 0.1, 0, 0.241, 0, signFace("\"GARDEN SOIL\"", { bg: "#241d0d", accent: "#e8b02e", scale: 0.4 }));
    const noFillHit = box(g, 0.4, 0.4, 0.3, 1.5, 0.3, -1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fill it with this instead?", 1.5, 0.6, -1.85, { css: "#d2312b", w: 0.5 });
    reg(hits, noFillHit, "no-clean-fill");

    // ---------------------------------------------------- raised-bed build
    const newFrame = group(g, 0, 0.04, -0.9);
    newFrame.visible = false;
    box(newFrame, 1.5, 0.3, 1.0, 0, 0.15, 0, 0x8a6a44, { rough: 0.85 });
    reg(hits, newFrame, "raised-frame");
    const liner = group(g, 0, 0.28, -0.9);
    liner.visible = false;
    box(liner, 1.4, 0.01, 0.9, 0, 0, 0, 0x2b3138, { rough: 0.7, opacity: 0.85, transparent: true });
    reg(hits, liner, "bed-liner");
    const fillPour = group(g, 0, 0.32, -0.9);
    fillPour.visible = false;
    box(fillPour, 1.35, 0.08, 0.85, 0, 0.04, 0, 0xd6c79a, { rough: 0.9 });
    reg(hits, fillPour, "clean-fill-pour");

    // ----------------------------------------------------------- bed marker
    const flagHome = new THREE.Vector3(-1.4, 0.06, 0.9);
    const bedFlag = group(g, flagHome.x, flagHome.y, flagHome.z);
    cyl(bedFlag, 0.01, 0.012, 0.45, 0, 0.22, 0, 0x8a7a54, { rough: 0.8, seg: 8 });
    box(bedFlag, 0.14, 0.09, 0.006, 0.07, 0.42, 0, 0xd2312b, { rough: 0.6 });
    decal(bedFlag, 0.12, 0.06, 0.07, 0.42, 0.004, signFace("DO NOT PLANT", { bg: "#2a0d0d", accent: "#ffdada", scale: 0.4 }));
    reg(hits, bedFlag, "bed-marker-flag");
    const bedSocket = group(testBed.bg, 0, 0.3, -0.3);
    hits["bed-socket"] = bedSocket;

    // --------------------------------------------------------------- signage
    const cautionSign = group(g, 0.3, 0.32, -0.55);
    cautionSign.visible = true;
    cyl(cautionSign, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xe8622a, { rough: 0.7, seg: 8 });
    box(cautionSign, 0.16, 0.12, 0.006, 0, 0.46, 0, 0xf2c14b, { rough: 0.6 });
    decal(cautionSign, 0.14, 0.08, 0, 0.463, 0, signFace("STAND CLEAR", { bg: "#2a1c08", accent: "#f2c14b", scale: 0.42 }));
    reg(hits, cautionSign, "caution-sign");

    // -------------------------------------------------------- results sheet
    const shed = group(g, -2.1, 0.1, -1.4, 0.4);
    box(shed, 0.7, 1.0, 0.55, 0, 0.5, 0, 0x6f7a5a, { rough: 0.85 });
    box(shed, 0.75, 0.1, 0.6, 0, 1.05, 0, 0x4a5a3a, { rough: 0.8 });
    const sheetClip = group(shed, 0.32, 0.55, 0.29);
    box(sheetClip, 0.2, 0.006, 0.26, 0, 0, 0, 0xecebe0, { rough: 0.9 });
    decal(sheetClip, 0.18, 0.24, 0, 0.005, 0, paperFace("RESULTS SHEET", ["Bed / grid", "Result vs. action level", "Raised bed? Y/N", "For the gardeners — plain language"], { scale: 0.85 })).rotation.x = -Math.PI / 2;
    reg(hits, sheetClip, "results-sheet");

    const fillBagLeft = group(g, -2.1, 0.05, -0.9);
    box(fillBagLeft, 0.26, 0.2, 0.18, 0, 0.1, 0, 0x5a4a2f, { rough: 0.9 });
    decal(fillBagLeft, 0.2, 0.08, 0, 0.201, 0, signFace("\"GARDEN SOIL\"", { bg: "#241d0d", accent: "#e8b02e", scale: 0.4 }));
    reg(hits, fillBagLeft, "mislabeled-fill-bag");

    cone(g, -2.4, 2.2); cone(g, 2.4, 2.2);
    barrierPanel(g, 0, 2.3, { color: GSS_ACCENT });
    toolChest(g, 2.1, 1.1, { color: GSS_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-standard") repaint(xrfReadout.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e0f2d8", scale: 0.6 }));
        if (step.id === "read-xrf") repaint(readoutHolo.userData.face, (cx, w, h) => {
          cx.fillStyle = "#2a1408"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
          cx.font = `700 ${Math.round(h * 0.22)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillStyle = "#ffd9d9"; cx.fillText("540 ppm — OVER", w / 2, h * 0.55);
        });
        if (step.id === "flag-bed") { bedFlag.parent.remove(bedFlag); testBed.bg.add(bedFlag); bedFlag.position.set(0, 0.3, -0.3); }
        if (step.id === "clean-fill") cleanPallet.children[1].material.emissiveIntensity = 0.5;
        if (step.id === "build-raised-bed") { newFrame.visible = true; liner.visible = true; fillPour.visible = true; }
        if (step.id === "walk") fillBagLeft.visible = false;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "child-hands-in-bed") cautionSign.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.6 });
        if (it.id === "standard-out-of-range") { repaint(xrfReadout.userData.screen, signFace("DRIFT", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.55 })); driftLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "child-hands-in-bed") cautionSign.material = mat(0xe8622a, { rough: 0.7 });
        if (it.id === "standard-out-of-range") { repaint(xrfReadout.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e0f2d8", scale: 0.6 })); driftLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "read-xrf") {
          repaint(readoutHolo.userData.face, (cx, w, h) => {
            cx.fillStyle = "#12200e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#7fbf6a"; cx.fillRect(0, 0, w, 5);
            cx.font = `700 ${Math.round(h * 0.22)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillStyle = "#eaf6df"; cx.fillText(`${Math.round(320 + gg.t * 260)} ppm`, w / 2, h * 0.55);
          });
        }
      },
    };
  },
};
