import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, seatedFigure, counter, cabinet,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, toolChest, standingFigure, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Draught Line Cleaning VR — Bartending course, station three.
// The beer lines get cleaned on a schedule whether or not anyone can taste
// the difference yet: caustic or acid line cleaner handled to its own SDS,
// goggles and gloves on before the bottle opens, every affected tap tagged
// so nobody pours from a line full of chemical, solution pumped through and
// given its contact time, flushed with water and tested with pH paper until
// the line reads neutral, kegs reconnected, the first pour off a clean line
// thrown away rather than served, and the whole cycle written down in the
// cleaning log.

const DLC_ACCENT = 0x9fc94f;

export const SIM_DRAUGHT_LINE_CLEANING = {
  id: "draught-line-cleaning",
  index: "139",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "UNITE HERE Local 2 bartenders; Cal/OSHA 8 CCR §5194 Hazard Communication for the line cleaner's own safety data sheet and label; OSHA's eye and skin protection requirements (29 CFR 1910.133) behind the goggles-and-gloves rule; NSF/ANSI 18-listed draught dispensing equipment and tubing; the ANSI-accredited California Food Handler card every bartender on this line also holds; the Brewers Association's draught quality guidance on contact time and neutral-pH flushing",
  name: "Draught Line Cleaning",
  title: simTitle("Draught Line Cleaning"),
  tagline: "Beer lines cleaned to the SDS: goggles and gloves, taps tagged, solution pumped and given its contact time, flushed to a neutral pH, kegs back on and the first pour thrown away",
  accent: DLC_ACCENT,
  accentCss: "#9fc94f",
  parSeconds: 275,
  footprint: 2.5,
  badge: { id: "neutral-and-clean", name: "Neutral and Clean", note: "A full line clean read neutral on the strip with every tap tagged and nobody poured from it — first time" },

  game: system({
    name: "Draught Quality",
    currency: "PH",
    ranks: ["New Bartender", "Line Certified", "Lead Bartender", "Bar Manager", "Draught Quality Certified"],
    badges: [
      { id: "sds-first", name: "SDS First", note: "Read the SDS before the bottle was ever opened", test: AWARD.stepClean("identify") },
      { id: "never-crossed", name: "Never Crossed", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "reads-neutral", name: "Reads Neutral", note: "pH strip and the whole run inside band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cycle", name: "Clean Cycle", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-contact", name: "Steady Contact", note: "Held contact time the full count without a break", test: AWARD.unbroken },
      { id: "lines-back-fast", name: "Lines Back Fast", note: "Kegs reconnected inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "mixing-chemicals": "That's an acid-based cleaner sitting open next to the caustic bucket already in use. Acid and caustic line cleaners meeting each other, whether in a drain or a bucket, react hard enough to throw a corrosive splash and a cloud of gas — the SDS for each one exists specifically so they never share a container or a moment.",
    "bare-face-check": "You leaned in over the open cleaner to look — no goggles. A splash off a moving line or a bucket doesn't wait for you to notice it's coming, and the label on a caustic or acid line cleaner says eye protection for exactly this reason, not as a formality before the real work starts.",
    "untagged-handle": "This tap handle never got tagged with the others. A line mid-clean that isn't tagged looks exactly like a line that's ready to pour, and the only thing standing between a customer and a glass of line cleaner is whether every handle got marked, not just most of them.",
    "unlabeled-bottle": "The line cleaner's been decanted into a spray bottle with no label on it. Cal/OSHA's hazard communication rule follows the chemical, not the original container — an unlabeled bottle of caustic under the bar is a bottle nobody after you will know to treat with any caution at all.",
  },

  lateNotes: {
    "cleaner-pump": "The lines get tagged and the keg disconnected before any cleaner goes anywhere near them.",
    "contact-timer": "Contact time starts once the solution is actually in the line, not before it's pumped through.",
    "ph-strip": "The pH gets tested after the flush, not before — there's nothing but cleaner in the line until then.",
    "keg-reconnect": "Kegs go back on once the line reads a neutral pH, not before.",
  },

  steps: [
    {
      id: "identify", kind: "find", noHint: true,
      targets: ["cleaner-label", "sds-sheet"],
      itemNames: { "cleaner-label": "cleaner drum label", "sds-sheet": "safety data sheet" },
      itemNotes: {
        "cleaner-label": "Caustic or acid — today's drum is labelled, and the label decides which neutraliser and which PPE apply for the rest of this clean.",
        "sds-sheet": "The safety data sheet for whichever chemical is loaded — first aid, ventilation and spill response all live here, and Cal/OSHA's hazard communication rule expects it read, not just stocked on a shelf.",
      },
      title: "Identify the cleaner and its SDS",
      cue: "Check the drum label, then pull the matching safety data sheet.",
      why: "A bar alternates between caustic and acid line cleaners depending on what's building up in the lines, and the two are handled differently enough — different PPE, different first aid, never mixed with each other — that the whole clean starts with confirming which one is actually in the bucket today.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["goggles", "gloves"],
      itemNames: { "goggles": "chemical goggles", "gloves": "chemical-resistant gloves" },
      title: "Goggles and gloves before the bottle opens",
      cue: "Both on before the cleaner comes off the shelf.",
      why: "Caustic and acid line cleaners are both corrosive to skin and eyes at working strength, and a splash happens at the moment you're least braced for it — opening the container, not partway through pumping — which is why the PPE goes on first, not after the first splash proves it was needed.",
    },
    {
      id: "stage-spill-kit", kind: "select", target: "spill-kit",
      title: "Stage the spill kit",
      cue: "Set the spill kit where you can reach it before you start pumping.",
      why: "A corrosive spill on a bar top full of glassware and electrical outlets is not something you want to be locating supplies for after it happens — staging the kit first is what makes the response take ten seconds instead of two minutes.",
    },
    {
      id: "tag-taps", kind: "sequence", anyOrder: true,
      targets: ["tap-tag-1", "tap-tag-2", "tap-tag-3"],
      itemNames: { "tap-tag-1": "IPA handle tag", "tap-tag-2": "lager handle tag", "tap-tag-3": "stout handle tag" },
      title: "Tag every affected tap \"Do Not Pour\"",
      cue: "Tag all three handles on this line before any cleaner goes in.",
      why: "A customer at the rail and a colleague working the well both read a tap handle the same way — available unless it says otherwise. Every handle on the line being cleaned gets its own tag, because the one left untagged is the one somebody pours from.",
    },
    {
      id: "disconnect-keg", kind: "turn", target: "keg-disconnect",
      title: "Disconnect the keg for the cleaning loop",
      cue: "Uncouple the keg and swap the line onto the cleaning pump.",
      why: "Cleaning solution runs a closed loop through the line and back to the bucket, not into a keg of beer — the coupler comes off and the pump goes on before any solution moves.",
      turn: { turns: 0.25, axis: "y", label: "COUPLER" },
    },
    {
      id: "pump-cleaner", kind: "hold", target: "cleaner-pump", seconds: 6,
      title: "Pump the cleaning solution through",
      cue: "Hold the pump running until solution has moved all the way through the line.",
      why: "A partial pump leaves clean beer in one stretch of tubing and cleaner in the next, and neither half gets what it needs — the whole line has to see the solution before contact time means anything.",
      holdBreakNote: "You stopped before the solution reached the far end. Restart the pump — a half-filled line hasn't been cleaned, it's been half cleaned.",
    },
    {
      id: "contact-time", kind: "hold", target: "contact-timer", seconds: 6,
      title: "Hold contact time",
      cue: "Let the solution sit in the line for the full contact time on the label.",
      why: "The chemical does its work by sitting against the beer-stone and yeast film built up on the inside of the tubing, not by passing through it — cutting the contact time short is the single most common reason a line that was 'just cleaned' still tastes off a week later.",
      holdBreakNote: "You flushed before the contact time finished. The solution needs the full time on the label to actually break down what's built up in the line — start the hold again.",
    },
    {
      id: "flush", kind: "track", target: "flush-valve", seconds: 6,
      title: "Flush the line with water",
      cue: "Hold the flush valve at a steady rate until the line runs clear.",
      why: "Too slow a flush leaves cleaner sitting in the low points of the line; too hard a flush can push water back past a fitting that isn't rated for it — a steady, held-open flow is what actually clears the tubing end to end.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.4, drift: 0.08, label: "FLUSH RATE", readout: (v) => (v < 0.4 ? "too slow" : v > 0.62 ? "too hard" : "steady") },
      holdBreakNote: "The flush rate drifted out of band. Too slow leaves cleaner sitting in the line, too hard risks a fitting — bring it back to a steady flow.",
    },
    {
      id: "ph-test", kind: "gauge", target: "ph-strip",
      title: "Test the line with pH paper",
      cue: "Dip the strip at the tap and commit while it reads neutral.",
      why: "A line that still reads acidic or basic still has cleaning chemical in it no matter how much water has gone through — the strip is the only honest answer to 'is it out yet,' and neutral is the only reading that means yes.",
      gauge: { label: "pH", speed: 0.7, green: [0.44, 0.6], readout: (t) => (3 + t * 8).toFixed(1), missNote: "Not neutral yet — keep flushing and test again before this line goes anywhere near a keg." },
    },
    {
      id: "reconnect-kegs", kind: "turn", target: "keg-reconnect",
      title: "Reconnect the kegs",
      cue: "Couple the keg back onto the now-neutral line.",
      why: "The line only goes back into beer service once the pH test has confirmed there's nothing left in it to confirm against — reconnecting on a hunch instead of a reading is exactly the shortcut this whole procedure exists to remove.",
      turn: { turns: 0.25, axis: "y", label: "COUPLER" },
    },
    {
      id: "finish", kind: "sequence", anyOrder: true,
      targets: ["discard-pour", "remove-tags"],
      itemNames: { "discard-pour": "discard the first pour", "remove-tags": "pull the tags" },
      title: "Discard the first pour and clear the tags",
      cue: "Pour and dump the first glass off each tap, then pull the \"Do Not Pour\" tags.",
      why: "The first pour off a freshly cleaned line still carries trace cleaner and the standing water from the flush — it gets poured out, not into a glass someone's paying for, and the tags come off only once there's a clean pour behind them to prove it.",
    },
    {
      id: "log", kind: "select", target: "cleaning-log",
      title: "Log the clean",
      cue: "Record the date, the chemical, the contact time and the final pH.",
      why: "The cleaning log is what turns 'we did this' into something a health inspector, the next shift or the brewery's own quality rep can actually check against a schedule instead of taking on faith.",
    },
  ],

  interrupts: [
    {
      id: "tap-request",
      kind: "Customer at the rail",
      after: "contact-time", delay: 3, seconds: 11,
      alert: "A customer orders an IPA off the tagged tap, and a colleague reaches for the handle to pour it.",
      cue: "Stop them — that handle's tagged for a reason, not out of service by accident.",
      target: "tap-tag-1",
      why: "A tag only protects a customer if it actually stops the next person who reaches for that handle; the line behind it is mid-clean and running cleaning solution right now, and the fastest way to make sure nobody pours from it is pointing at exactly what's already marked on it.",
      missNote: "The colleague poured off the tagged IPA tap while it was still running cleaning solution. A tag that gets overridden the first time someone's in a hurry isn't protecting anybody.",
      wrongNote: "It's the tag on the handle, not the pump you're holding. Point at what already says not to pour from it.",
    },
    {
      id: "bottle-knocked",
      kind: "Chemical spill",
      after: "pump-cleaner", delay: 3, seconds: 11,
      alert: "The open cleaner bottle gets knocked over on the bar top behind you.",
      cue: "Get to the spill kit — don't just wipe it with a bar rag.",
      target: "spill-kit",
      why: "A corrosive spill on a bar top isn't a bar-rag job — a rag spreads it thinner across a bigger surface and puts it on whoever's hand touches that rag next; the spill kit's neutraliser and absorbent are the only correct first move.",
      missNote: "The spill got wiped up with a bar rag instead of the spill kit. Spreading a corrosive thinner across the bar top, and onto the rag itself, is worse than the spill it started as.",
      wrongNote: "It's the spill kit. A bar rag doesn't neutralise anything — it just moves the chemical somewhere else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, DLC_ACCENT);

    box(g, 5.6, 0.06, 5.0, 0, 0.03, 0.4, 0x2a221c, { rough: 0.85, finish: "concrete", tile: [7, 6] });

    // ----------------------------------------------------------- guest side
    const railTop = counter(g, 3.8, 0.7, 0, 1.35, 0x33261c, { height: 1.05, undershelf: false });
    void railTop;
    const stoolTones = [0x6b7f8c, 0x8c6b56, 0x556b5a];
    const customerCloth = [0x4a5f6e, 0x6e4a3a, 0x3a5a4a];
    const customers = [];
    for (let i = 0; i < 3; i++) {
      const sx = -1.1 + i * 1.1;
      const stool = group(g, sx, 0, 1.95);
      cyl(stool, 0.03, 0.03, 0.72, 0, 0.36, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 10 });
      cyl(stool, 0.16, 0.16, 0.05, 0, 0.74, 0, stoolTones[i], { rough: 0.6, seg: 16 });
      const cust = seatedFigure(g, sx, 0.74, 1.95, { skin: 0xc99878, cloth: customerCloth[i], ry: (i - 1) * 0.12 });
      customers.push(cust);
    }

    // -------------------------------------------------------------- tap tower
    const tower = group(g, 0, 0, 0.8);
    box(tower, 0.5, 0.9, 0.34, 0, 0.75, 0, 0x8b929a, { rough: 0.4, metal: 0.55, finish: "brushed", tile: 2 });
    const tapLabels = ["IPA", "LAGER", "STOUT"];
    const tapColors = [0xe8a23b, 0xf2c14b, 0x4a352a];
    const handles = [], tagIds = ["tap-tag-1", "tap-tag-2", "tap-tag-3"];
    for (let i = 0; i < 3; i++) {
      const hx = -0.16 + i * 0.16;
      const handle = group(tower, hx, 1.15, 0);
      cyl(handle, 0.018, 0.018, 0.22, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
      ball(handle, 0.045, 0, 0.13, 0, tapColors[i], { rough: 0.5, seg: 14 });
      holoTag(handle, tapLabels[i], 0, 0.28, 0, { css: "#9fc94f", w: 0.24 });
      handles.push(handle);
      const tagMesh = decal(handle, 0.1, 0.14, 0, -0.05, 0.05, paperFace("DO NOT", ["POUR"], { bg: "#f4e9d8", band: "#b81410", worn: true }), { px: 160 });
      tagMesh.visible = false;
      const tagPick = box(g, 0.08, 0.02, 0.08, -1.7 + i * 0.24, 0.42, -1.2, 0xf4e9d8, { rough: 0.7 });
      holoTag(tagPick, `${tapLabels[i]} tag`, 0, 0.1, 0, { css: "#9fc94f", w: 0.24 });
      reg(hits, tagPick, tagIds[i]);
      tagPick.userData.tagMesh = tagMesh;
    }
    // The fourth handle nobody tagged — the hazard.
    const untagged = group(tower, 0.32, 1.15, 0);
    cyl(untagged, 0.018, 0.018, 0.22, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    ball(untagged, 0.045, 0, 0.13, 0, 0x5a6b3a, { rough: 0.5, seg: 14 });
    holoTag(untagged, "Untagged — pour this?", 0, 0.3, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, untagged, "untagged-handle");

    const kegDisc = group(g, 0.9, 0, -0.4, -0.4);
    box(kegDisc, 0.12, 0.1, 0.1, 0, 0.7, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(kegDisc, "Coupler", 0, 0.82, 0, { css: "#9fc94f", w: 0.24 });
    reg(hits, kegDisc, "keg-disconnect");
    const kegRecon = group(g, 0.9, 0, -0.4, -0.4);
    box(kegRecon, 0.12, 0.1, 0.1, 0, 0.7, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(kegRecon, "Coupler — lock", 0, 0.82, 0, { css: "#9fc94f", w: 0.28 });
    kegRecon.visible = false;
    reg(hits, kegRecon, "keg-reconnect");

    // --------------------------------------------------------- cleaning rig
    const bench = group(g, -1.4, 0, -0.7, 0.4);
    box(bench, 1.1, 0.06, 0.5, 0, 0.85, 0, 0x4a5561, { rough: 0.6, metal: 0.3 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(bench, 0.02, 0.02, 0.83, sx * 0.5, 0.42, sz * 0.2, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    }
    const causticBucket = cyl(bench, 0.16, 0.18, 0.34, -0.3, 1.02, 0, 0xdfe0c8, { rough: 0.5, seg: 16 });
    decal(bench, 0.14, 0.1, -0.3, 1.12, 0.171, signFace("CAUSTIC", { bg: "#1b1e06", accent: "#9fc94f", scale: 0.55 }), { px: 128 });
    void causticBucket;
    const pump = group(bench, 0.05, 0.9, 0.1);
    box(pump, 0.16, 0.14, 0.12, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.4 });
    cyl(pump, 0.03, 0.03, 0.1, 0.1, 0.09, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 10 });
    holoTag(pump, "Line pump", 0, 0.15, 0, { css: "#9fc94f", w: 0.26 });
    reg(hits, pump, "cleaner-pump");
    const timer = instrument(bench, 0.35, 0.98, -0.1, { idle: "00:00", color: 0x9fc94f, w: 0.13, d: 0.17, ry: -0.3 });
    reg(hits, timer, "contact-timer");

    const acidJug = group(g, -0.85, 0, -0.35, 0.3);
    box(acidJug, 0.14, 0.24, 0.1, 0, 0.62, 0, 0xe8d24f, { rough: 0.5 });
    decal(acidJug, 0.11, 0.08, 0, 0.68, 0.051, signFace("ACID", { bg: "#241a06", accent: "#f0645b", scale: 0.55 }), { px: 128 });
    holoTag(acidJug, "Open — mixing?", 0, 0.78, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, acidJug, "mixing-chemicals");

    const bareFaceTrap = group(g, -1.6, 0, -0.45, 0.4);
    ball(bareFaceTrap, 0.05, 0, 1.2, 0.1, 0xc99878, { rough: 0.75 });
    holoTag(bareFaceTrap, "No goggles?", 0, 1.32, 0.1, { css: "#f0645b", w: 0.3 });
    reg(hits, bareFaceTrap, "bare-face-check");

    const flushValve = valveWheel(g, -0.6, 0.85, -1.1, { r: 0.1, color: 0x4fb8c9, body: 0x2f3138 });
    holoTag(g, "Flush", -0.6, 1.05, -1.1, { css: "#9fc94f", w: 0.22 });
    reg(hits, flushValve, "flush-valve");
    const phStripInstrument = instrument(g, -0.15, 0.9, -1.25, { idle: "-- pH", color: 0x9fc94f, w: 0.12, d: 0.16, ry: 0.3 });
    reg(hits, phStripInstrument, "ph-strip");

    const drainPour = group(g, 0.5, 0, -1.4, -0.3);
    cyl(drainPour, 0.1, 0.12, 0.03, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, seg: 14 });
    holoTag(drainPour, "Discard here", 0, 0.5, 0, { css: "#9fc94f", w: 0.3 });
    reg(hits, drainPour, "discard-pour");
    const tagsPull = group(g, -1.4, 0, -1.4, 0.3);
    box(tagsPull, 0.12, 0.14, 0.02, 0, 0.5, 0, 0xf4e9d8, { rough: 0.7 });
    holoTag(tagsPull, "Pull the tags", 0, 0.62, 0, { css: "#9fc94f", w: 0.3 });
    reg(hits, tagsPull, "remove-tags");

    // PPE, SDS, spill kit and the unlabeled bottle.
    const ppeStand = group(g, -2.1, 0, 0.2, 0.4);
    box(ppeStand, 0.06, 1.2, 0.06, 0, 0.6, 0, CITY.steel, { rough: 0.5, metal: 0.5 });
    const goggles = ball(ppeStand, 0.06, 0.16, 1.0, 0, 0x2f6f8c, { rough: 0.4 });
    goggles.scale.z = 0.6;
    holoTag(ppeStand, "Goggles", 0.16, 1.14, 0, { css: "#9fc94f", w: 0.24 });
    reg(hits, goggles, "goggles");
    const gloves = box(ppeStand, 0.18, 0.14, 0.06, -0.16, 0.85, 0, 0xe8d24f, { rough: 0.8 });
    holoTag(ppeStand, "Gloves", -0.16, 1.0, 0, { css: "#9fc94f", w: 0.24 });
    reg(hits, gloves, "gloves");

    const cabinetSds = cabinet(g, 0.6, 0.5, 0.3, -2.3, 1.6, -1.6, 0xe6ecf1, { doorColor: 0xd7dce1 });
    void cabinetSds;
    const sdsPanel = holoPanel(g, 0.4, 0.28, -2.3, 1.35, -1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(12,18,10,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9fc94f"; ctx.fillRect(0, 0, w, 4);
      ctx.fillStyle = "#eaf6d8";
      ctx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("SAFETY DATA SHEET", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Caustic line cleaner — 8 CCR 5194", w / 2, h * 0.66);
    }, { accent: DLC_ACCENT });
    reg(hits, sdsPanel, "sds-sheet");
    const labelDrum = cyl(g, 0.15, 0.16, 0.4, -2.35, 0.2, -1.05, 0xdfe0c8, { rough: 0.6, seg: 16 });
    decal(g, 0.14, 0.1, -2.35, 0.28, -0.849, signFace("CAUSTIC LOT 44", { bg: "#1b1e06", accent: "#9fc94f", scale: 0.5 }), { px: 128 });
    reg(hits, labelDrum, "cleaner-label");

    const spillKit = toolChest(g, 2.3, 0.5, { ry: -0.7, color: 0xf2c14b });
    decal(spillKit, 0.5, 0.16, 0, 0.76, 0.201, signFace("SPILL KIT", { bg: "#1b1608", accent: "#9fc94f", scale: 0.5 }));
    reg(hits, spillKit, "spill-kit");

    const unlabeledBottle = group(g, -0.4, 0, -1.7, -0.3);
    box(unlabeledBottle, 0.08, 0.2, 0.08, 0, 0.42, 0, 0xdfe0c8, { rough: 0.5 });
    holoTag(unlabeledBottle, "No label?", 0, 0.55, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, unlabeledBottle, "unlabeled-bottle");

    // Cleaning log clipboard and the spilled bottle prop for the interrupt.
    const logBoard = holoPanel(g, 0.5, 0.36, 2.3, 1.5, -1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(12,18,10,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9fc94f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6d8";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("LINE CLEANING LOG", w / 2, h * 0.3);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Date · chemical · contact time · pH", w / 2, h * 0.62);
      ctx.fillText("Sign once the first pour is dumped", w / 2, h * 0.8);
    }, { ry: -0.4, accent: DLC_ACCENT });
    reg(hits, logBoard, "cleaning-log");

    const spilledBottle = group(g, 0.4, 0, -0.55, 0.6);
    cyl(spilledBottle, 0.05, 0.05, 0.22, 0, 0.03, 0, 0xdfe0c8, { rough: 0.5, seg: 14 });
    spilledBottle.rotation.z = Math.PI / 2;
    spilledBottle.visible = false;
    const puddle = particles(g, 20, 0xdfe0c8, { size: 0.02, life: 1.2, additive: false, opacity: 0.4 });

    // The coworker who reaches for a tagged handle mid-clean.
    const coworker = standingFigure(g, 1.4, -1.3, { ry: -2.3, cloth: 0x3a4550, vest: 0x9fc94f });

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -0.4),

      onStepComplete(step) {
        if (step.id === "tag-taps") {
          for (let i = 0; i < tagIds.length; i++) {
            const t = hits[tagIds[i]].userData.tagMesh;
            if (t) t.visible = true;
          }
        }
        if (step.id === "disconnect-keg") { kegDisc.visible = false; kegRecon.visible = true; }
        if (step.id === "reconnect-kegs") { kegRecon.visible = false; }
        if (step.id === "finish") {
          for (let i = 0; i < tagIds.length; i++) {
            const t = hits[tagIds[i]].userData.tagMesh;
            if (t) t.visible = false;
          }
        }
      },

      onInterrupt(it) {
        if (it.id === "tap-request") { coworker.position.x = 0.35; coworker.position.z = -0.55; }
        if (it.id === "bottle-knocked") {
          spilledBottle.visible = true;
          puddle.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "tap-request") { coworker.position.x = 1.4; coworker.position.z = -1.3; }
        if (it.id === "bottle-knocked" && it.resolved === "answered") {
          spilledBottle.visible = false;
          puddle.visible = false;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "ph-test") {
          const ph = (3 + gg.t * 8).toFixed(1);
          repaint(phStripInstrument.userData.screen, signFace(`${ph}`, { bg: "#0d1c14", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.6 }));
        }
        if (session?.step?.id === "pump-cleaner" && session.holding) {
          repaint(timer.userData.screen, signFace("PUMPING", { bg: "#1c2408", accent: "#9fc94f", fg: "#eaf6d8", scale: 0.5 }));
        }
        if (session?.step?.id === "contact-time" && session.holding) {
          const secs = Math.max(0, Math.ceil((session.step.seconds || 6) - session.holdFor));
          repaint(timer.userData.screen, signFace(`00:${String(secs).padStart(2, "0")}`, { bg: "#1c2408", accent: "#9fc94f", fg: "#eaf6d8", scale: 0.55 }));
        }
        if (puddle.visible) puddle.userData.step(dt, new THREE.Vector3(0.4, 0.42, -0.55), 0.1, 0.02, 0.01);
      },
    };
  },
};
