import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure,
  surfaceTexture, texturedMat, sandFace, grassFace, gravelFace, palette, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bunker Renovation & Drainage VR — Grounds & Landscaping.
//
// A sand bunker rebuilt around a new drain line: the plan read before a
// shovel moves, the utility locate confirmed, the bunker walked for a
// sprinkler head and an unclear cable marker, the trench line marked and the
// spoil pile kept back from the edge, a competent person's own inspection
// confirmed before anyone steps in, the drain pipe joined and graded, and
// the sand raked to an even depth under a grade string before the liner and
// the edge sod go back down. No trench depth, slope ratio or grade
// percentage this platform is not certain of appears here — every one of
// them is "per the plan" or "per the competent person's own call".

const GKB_ACCENT = 0xc9a36b;
const GKB_PAL = palette("grounds");

export const SIM_GK_BUNKER_RENOVATION_AND_DRAINAGE = {
  id: "gk-bunker-renovation-and-drainage",
  index: "gk-07",
  domain: "Grounds & Landscaping",
  trade: "Sports-turf and golf course grounds crew — LIUNA grounds and landscaping crew",
  category: "Grounds & Landscaping",
  district: "open-range",
  weather: "clear",
  certification: "OSHA 29 CFR 1926 Subpart P Excavations, including the trench's own competent person inspection duties; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1926.21 safety training and education; NIOSH guidance on manual material handling; LIUNA grounds and landscaping crew training",
  name: "Bunker Renovation & Drainage",
  title: simTitle("Bunker Renovation & Drainage"),
  tagline: "A sand bunker rebuilt around a new drain line: the plan read, the locate confirmed, the trench line marked and the spoil kept back from the edge, a competent person's inspection confirmed, the pipe joined and graded, and the sand raked even under a grade string",
  accent: GKB_ACCENT,
  accentCss: "#c9a36b",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "drain-proven", name: "Drain Proven", note: "Locate confirmed, the trench inspected by a competent person, the pipe graded, and the bunker finished to an even sand depth" },

  supportLine: "your union steward or the parks department's employee assistance line",

  game: system({
    name: "Grounds Crew",
    currency: "TURF",
    ranks: ["Ground Hand", "Bunker Crew", "Drainage Certified", "Crew Lead", "Grounds Certified"],
    badges: [
      { id: "locate-confirmed", name: "Locate Confirmed", note: "Never dug before the utility locate was confirmed", test: AWARD.stepClean("confirm-locate") },
      { id: "edge-respected", name: "Edge Respected", note: "Never stood or piled spoil at the unshored trench edge", test: AWARD.safe },
      { id: "competent-inspected", name: "Competent Person Inspected", note: "Confirmed the competent person's trench inspection before entry", test: AWARD.stepClean("confirm-competent-person") },
      { id: "even-sand", name: "Even Sand", note: "Held the grade gauge and the raking pass near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "quick-bunker", name: "Quick Bunker", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-round", name: "Clean Round", note: "No corrections across the whole run", test: AWARD.clean },
      { id: "grounds-streak", name: "Grounds Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "stand-at-unshored-trench-edge": "You are standing right at the edge of the open trench with no protective slope confirmed. A trench wall that has not been checked by a competent person can give way with no warning at all, and standing at that edge trusts ground that nobody has actually confirmed is stable.",
    "cut-marked-utility-line": "You cut straight through the ground over the marked utility line instead of hand-digging it. A locate mark is where the utility is, not a suggestion of roughly where it might be, and machine or blind digging over that mark risks striking a line the whole locate process existed to protect.",
    "spoil-pile-at-edge": "You piled the spoil right at the edge of the open trench. Spoil stacked at the edge adds weight exactly where the trench wall is already carrying the least support, and that surcharge is what turns a stable-looking wall into one that gives way under its own added load.",
    "reach-into-trench-unprotected": "You reached down into the trench before it was confirmed safe. A trench that has not been inspected by a competent person is not a trench anyone's arm — let alone the rest of them — has any business going into, no matter how shallow it looks from standing height.",
  },

  lateNotes: {
    "irrigation-head-in-path": "A sprinkler head sitting in the planned trench line is exactly what a shovel or a trencher hits blind if the bunker is not walked and marked before the first cut.",
    "competent-person-tag": "The competent person's inspection happens before anyone steps into the trench, not after someone already has and it turned out fine.",
  },

  interrupts: [
    {
      id: "trench-wall-sloughs",
      kind: "Ground failure",
      after: "brace-drain-pipe", delay: 3, seconds: 10,
      alert: "The trench wall has started to slough near the brace point, sending loose sand sliding toward the pipe.",
      cue: "Sound the evacuate horn and clear the trench before the slough spreads.",
      target: "evacuate-horn",
      why: "A wall that has already started sloughing is telling the crew the ground there is actively failing, not settling, and sounding the evacuate horn immediately — rather than trying to finish bracing the pipe first — is what gets everyone clear before a small slough becomes a wall coming down on top of them.",
      missNote: "The bracing continued while the wall kept sloughing. Ground that is already moving does not wait for the crew to finish what they were doing.",
      wrongNote: "Not that — the evacuate horn is what this slough needs, before anything else in the trench continues.",
    },
    {
      id: "sprinkler-head-bursts",
      kind: "Line failure",
      after: "rake-sand-under-guide", delay: 4, seconds: 11,
      alert: "A nearby sprinkler head has burst and is spraying water straight into the bunker over the freshly raked sand.",
      cue: "Shut off the irrigation zone before the spray erodes the new grade.",
      target: "irrigation-shutoff",
      why: "Water spraying into a freshly raked bunker does not just wet the sand — it washes out the even grade the raking pass just set and can undercut the drain line underneath it, and shutting the zone off immediately is what stops that damage before the whole bunker has to be re-raked.",
      missNote: "The spray kept running while the sand washed out. A grade this fresh does not survive being sprayed on for long.",
      wrongNote: "Not that — the irrigation shutoff is what this burst needs, before the spray does any more damage.",
    },
  ],

  steps: [
    {
      id: "read-renovation-plan", kind: "select", target: "plan-board",
      title: "Read the renovation plan",
      cue: "Check the plan's own bunker shape and drainage layout before touching a shovel.",
      why: "The renovation plan is what sets the bunker's shape and where the new drain line actually runs — reading it before digging is what keeps today's trench following the design instead of an approximation of it made by eye.",
    },
    {
      id: "ppe-up", kind: "sequence", anyOrder: true,
      targets: ["work-gloves", "eye-protection"],
      itemNames: { "work-gloves": "work gloves", "eye-protection": "eye protection" },
      title: "Suit up before excavation",
      cue: "Work gloves and eye protection before the trench is opened.",
      why: "Handling pipe fittings, gravel and sand all day is exactly the kind of work gloves and eye protection are for — small cuts and grit in the eyes add up over a shift that a few seconds of PPE at the start would have prevented entirely.",
    },
    {
      id: "walk-the-bunker", kind: "find", noHint: true,
      targets: ["irrigation-head-in-path", "unclear-cable-marker", "unstable-bunker-face"],
      itemNames: { "irrigation-head-in-path": "the sprinkler head sitting in the planned trench line", "unclear-cable-marker": "the faded, unclear utility marker", "unstable-bunker-face": "the section of bunker face already sloughing" },
      itemNotes: {
        "irrigation-head-in-path": "A sprinkler head sitting in the trench line is exactly what gets struck blind if the bunker is not walked and marked before the first cut.",
        "unclear-cable-marker": "A marker this faded is not a marker anyone can actually trust the location from — it gets confirmed with the utility before it gets dug near.",
        "unstable-bunker-face": "A bunker face already sloughing on its own, before anyone has touched it, is ground that was never going to hold a trench cut into it without extra care.",
      },
      decoyNotes: { "clear-sand-area": "That stretch of sand is stable and clear of anything hidden. Nothing to flag there." },
      title: "Walk the bunker before opening the trench",
      cue: "Three things about this bunker change the plan — find them before the first cut.",
      why: "A bunker that looks like straightforward sand from the cart path is not the same thing as a bunker someone has actually walked, and a buried sprinkler head, an unclear marker or an already-sloughing face are exactly what a walk-down catches before the trench is opened.",
    },
    {
      id: "confirm-locate", kind: "select", target: "locate-tickets-board",
      title: "Confirm the utility locate",
      cue: "Check the locate tickets against the marked lines before the trench is opened.",
      why: "A locate ticket confirmed against the actual marks on the ground is what turns 'call before you dig' from a box checked at the office into an actual fact the crew can trust before the first cut goes anywhere near a marked line.",
    },
    {
      id: "excavation-prep", kind: "sequence", anyOrder: true,
      targets: ["trench-line-marked", "spoil-pile-staged"],
      itemNames: { "trench-line-marked": "trench line marked", "spoil-pile-staged": "spoil pile staged back from the edge" },
      title: "Prep the excavation",
      cue: "Mark the trench line to the plan and stage the spoil pile well back from the edge.",
      why: "Marking the trench line before cutting keeps the excavation on the plan's own drainage layout, and staging spoil back from the edge — rather than piling it right beside the cut — is what keeps that extra weight from adding to the load the trench wall already has to carry.",
    },
    {
      id: "confirm-competent-person", kind: "select", target: "competent-person-tag",
      title: "Confirm the competent person's inspection",
      cue: "Check the competent person's own inspection tag on the trench before anyone enters it.",
      why: "A competent person's inspection is what actually confirms this specific trench is safe to enter today — ground conditions change with weather and depth, and a tag from an inspection done before anyone steps in is what makes that safety a checked fact rather than an assumption carried over from the last trench.",
    },
    {
      id: "brace-drain-pipe", kind: "hold", target: "pipe-brace", seconds: 4,
      title: "Brace the drain pipe while checking grade",
      cue: "Hold the pipe braced in the trench for the full grade check.",
      why: "A pipe that shifts while the grade is being checked gives a reading that means nothing the moment it moves again — holding it braced for the whole check is what makes the grade reading something the crew can actually trust before backfilling locks it in place.",
      holdBreakNote: "Released the brace before the grade check finished. Hold the pipe steady for the whole check, every time.",
    },
    {
      id: "join-pipe-coupling", kind: "turn", target: "pipe-coupling",
      title: "Join the drain pipe sections",
      cue: "Turn the coupling to seat the two pipe sections fully home.",
      why: "A coupling that is not turned fully home leaves a gap sand and silt work into over the first season, which is exactly the slow failure a drain line built today is supposed to prevent for years, not months.",
      turn: { turns: 0.4, axis: "z", label: "PIPE COUPLING" },
    },
    {
      id: "check-drain-grade", kind: "gauge", target: "grade-level",
      title: "Check the drain line's fall",
      cue: "Read the grade level and commit only inside the plan's own fall band.",
      why: "A drain pipe laid flat or laid backward does not drain no matter how well it was joined — the grade level is what actually proves the pipe falls the direction and the amount the plan calls for, before it disappears under backfill where nobody can check it again.",
      gauge: {
        label: "DRAIN LINE FALL", speed: 0.58, green: [0.42, 0.68],
        readout: (t) => `${(t * 2).toFixed(1)}% fall`,
        missNote: "Outside the plan's fall band. Adjust the bedding and let the reading settle before committing it.",
      },
    },
    {
      id: "carry-sand-bags", kind: "drag", target: "sand-bag",
      title: "Carry sand to the bunker face",
      cue: "Carry the bagged sand from the stockpile to the marked bunker face.",
      why: "Staging the sand at the bunker face before backfilling the trench means the raking pass that follows can run start to finish without a break to fetch more material partway through.",
      drag: { to: "bunker-face-socket", radius: 0.4, missNote: "Not at the bunker face — carry the sand to where the bunker face actually is." },
    },
    {
      id: "rake-sand-under-guide", kind: "track", target: "grade-string", seconds: 8,
      title: "Rake the sand under the grade string",
      cue: "Keep the rake depth steady under the grade string across the whole bunker face.",
      why: "The grade string is the one reference that keeps sand depth consistent across a bunker face big enough that eye alone drifts — a raking pass that strays from it leaves thin spots that wash out and high spots that catch a club or a mower the first time either one crosses them.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.12,
        label: "SAND DEPTH",
        readout: (v) => (v < 0.4 ? "too thin — add sand" : v > 0.62 ? "too deep — pull sand back" : "even depth under the string"),
      },
      holdBreakNote: "The sand depth drifted off the grade string. Bring the raking pass back to an even depth before continuing.",
    },
    {
      id: "install-liner-and-sod", kind: "sequence", anyOrder: true,
      targets: ["liner-install", "edge-sod"],
      itemNames: { "liner-install": "bunker liner", "edge-sod": "edge sod" },
      title: "Install the liner and the edge sod",
      cue: "Lay the bunker liner over the graded sand and set the edge sod tight to the new line.",
      why: "The liner is what keeps the sand from mixing into the soil underneath it over time, and edge sod set tight to the new bunker line is what gives the renovation a clean, finished edge instead of a scar in the turf around it.",
    },
    {
      id: "backfill-and-compact", kind: "select", target: "backfill-check",
      title: "Backfill and compact around the drain",
      cue: "Confirm the backfill is compacted in lifts around the pipe before it is buried for good.",
      why: "Backfill dumped in all at once and never compacted settles unevenly over the following seasons, which telegraphs straight up through the sand as a dip right over the drain line — compacting it in lifts now is what keeps that from becoming next year's repair.",
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the bunker renovation log",
      cue: "Log the locate confirmation, the grade reading and the finished sand depth before leaving the site.",
      why: "The renovation log is what the next crew and the next inspection both read — a bunker finished cleanly but never logged leaves nothing behind to prove the locate was confirmed and the drain actually graded before it disappeared under the sand.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GKB_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 10, a: "#3d7a3a", b: "#457f44" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xdfeecb },
    );
    const bunker = box(g, 3.4, 0.02, 2.6, 0.3, 0.15, -0.6, 0xffffff, { rough: 0.9, cast: false });
    bunker.material = texturedMat(
      surfaceTexture((cx, w, h) => sandFace(cx, w, h, {}), { repeat: 4, px: 384 }),
      { rough: 0.9, metal: 0.02, color: 0xe8d9ae },
    );
    holoTag(bunker, "bunker face", 0, 0.4, -0.8, { css: "#c9a36b", w: 0.3 });
    const clearSand = group(bunker, 1.0, 0.02, -0.6);
    reg(hits, clearSand, "clear-sand-area");
    const clearSandMesh = box(clearSand, 0.4, 0.008, 0.3, 0, 0, 0, 0xe8d9ae, { rough: 0.85, cast: false });

    // ------------------------------------------------------------------ the trench
    const trench = group(g, -0.4, 0.14, 0.6, -0.2);
    const trenchPit = box(trench, 1.8, 0.16, 0.4, 0, -0.08, 0, 0x3a2f1c, { rough: 0.9, cast: false });
    const trenchWall = box(trench, 1.8, 0.02, 0.02, 0, -0.02, 0.19, 0x4a3a24, { rough: 0.9, cast: false });
    reg(hits, trenchWall, "stand-at-unshored-trench-edge");
    const reachHazard = box(trench, 1.6, 0.02, 0.3, 0, -0.14, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, reachHazard, "reach-into-trench-unprotected");
    holoTag(trench, "drain trench", 0, 0.2, 0, { css: "#c9a36b", w: 0.3 });

    const pipeSeg1 = cyl(trench, 0.05, 0.05, 0.8, -0.5, -0.1, 0, 0x9aa1a8, { rough: 0.4, metal: 0.5, seg: 14 });
    pipeSeg1.rotation.z = Math.PI / 2;
    const pipeSeg2 = cyl(trench, 0.05, 0.05, 0.8, 0.4, -0.1, 0, 0x9aa1a8, { rough: 0.4, metal: 0.5, seg: 14 });
    pipeSeg2.rotation.z = Math.PI / 2;
    const coupling = cyl(trench, 0.06, 0.06, 0.12, -0.05, -0.1, 0, 0xd2601c, { rough: 0.5, metal: 0.3, seg: 14 });
    coupling.rotation.z = Math.PI / 2;
    reg(hits, coupling, "pipe-coupling");
    const braceHit = box(trench, 0.14, 0.05, 0.05, 0.15, -0.1, 0, 0x2b3138, { rough: 0.5 });
    reg(hits, braceHit, "pipe-brace");

    const spoilStaged = group(g, 1.6, 0, 1.6, 0.3);
    for (let i = 0; i < 4; i++) ball(spoilStaged, 0.1 + i * 0.01, i * 0.15, 0.08, 0, 0x4a3a24, { rough: 0.9, seg: 10 });
    reg(hits, spoilStaged, "spoil-pile-staged");
    const spoilAtEdge = group(g, -0.4, 0, 1.0, 0.3);
    for (let i = 0; i < 3; i++) ball(spoilAtEdge, 0.09, i * 0.14, 0.07, 0, 0x4a3a24, { rough: 0.9, seg: 10 });
    reg(hits, spoilAtEdge, "spoil-pile-at-edge");

    const trenchLine = box(g, 1.8, 0.01, 0.06, -0.4, 0.16, 0.6, 0xf2c14b, { rough: 0.6, cast: false });
    reg(hits, trenchLine, "trench-line-marked");

    const cableMarker = box(g, 0.06, 0.2, 0.06, 1.5, 0.15, 0.9, 0x6a6a5a, { rough: 0.6 });
    reg(hits, cableMarker, "unclear-cable-marker");
    const cutLineHazard = box(g, 0.3, 0.02, 0.3, 1.5, 0.16, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cutLineHazard, "cut-marked-utility-line");

    const irrigationHead = cyl(bunker, 0.03, 0.03, 0.06, -0.6, 0.04, 0.3, 0x6f7a6f, { rough: 0.5, metal: 0.3, seg: 10 });
    reg(hits, irrigationHead, "irrigation-head-in-path");
    const irrigationShutoffValve = cyl(g, 0.06, 0.06, 0.14, 2.4, 0.14, 1.2, 0x2f6f4a, { rough: 0.5, metal: 0.4, seg: 12 });
    reg(hits, irrigationShutoffValve, "irrigation-shutoff");

    const sloughFace = box(bunker, 0.6, 0.03, 0.4, -1.0, 0.02, -1.0, 0x8a7050, { rough: 0.85, cast: false });
    reg(hits, sloughFace, "unstable-bunker-face");

    // ------------------------------------------------------------------ paperwork
    const plan = holoPanel(g, 0.58, 0.42, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9a36b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RENOVATION PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Fall: per the plan", "Sand depth: per the plan", "Trench slope: per the competent person"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.38 + i * 0.16)));
    }, { ry: 0.7, accent: GKB_ACCENT });
    reg(hits, plan, "plan-board");

    const locateBoard = group(g, -1.9, 0, 1.7, 0.4);
    box(locateBoard, 0.3, 0.4, 0.03, 0, 0.2, 0, 0x2b3138, { rough: 0.6 });
    const locateFace = decal(locateBoard, 0.26, 0.34, 0, 0.2, 0.017, signFace("LOCATE\nTICKETS ON FILE", { bg: "#0d1c24", accent: "#c9a36b", scale: 0.22 }), { px: 192 });
    reg(hits, locateFace, "locate-tickets-board");

    const competentTag = group(g, -0.4, 0.2, 1.0, 0.3);
    box(competentTag, 0.1, 0.14, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.55 });
    reg(hits, competentTag, "competent-person-tag");

    const gradeInst = instrument(g, 2.4, 0.5, -0.4, { ry: -0.4, idle: "-- %", color: GKB_ACCENT });
    holoTag(gradeInst, "grade level", 0, 0.16, 0, { css: "#c9a36b", w: 0.26 });
    reg(hits, gradeInst, "grade-level");

    const sandBags = group(g, -2.4, 0, 1.6, 0.4);
    box(sandBags, 0.24, 0.16, 0.16, 0, 0.08, 0, 0xd8c14b, { rough: 0.75 });
    reg(hits, sandBags, "sand-bag");
    const bunkerFaceSocket = group(g, 0.6, 0, -1.4);
    hits["bunker-face-socket"] = bunkerFaceSocket;

    const gradeStringPost1 = cyl(g, 0.01, 0.01, 0.4, -0.9, 0.2, -0.6, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    const gradeStringPost2 = cyl(g, 0.01, 0.01, 0.4, 1.4, 0.2, -0.6, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    const gradeStringLine = box(g, 2.3, 0.005, 0.005, 0.25, 0.4, -0.6, 0xf2c14b, { rough: 0.4, cast: false });
    reg(hits, gradeStringLine, "grade-string");

    const linerRoll = cyl(g, 0.08, 0.08, 0.4, 1.8, 0.14, 1.0, 0x2b3138, { rough: 0.6, metal: 0.2, seg: 14 });
    linerRoll.rotation.z = Math.PI / 2;
    reg(hits, linerRoll, "liner-install");
    const edgeSodStrip = box(g, 0.6, 0.04, 0.2, 1.8, 0.16, -1.6, 0xffffff, { rough: 0.9, cast: false });
    edgeSodStrip.material = texturedMat(
      surfaceTexture((cx, w, h) => grassFace(cx, w, h, { stripes: 4 }), { repeat: 2, px: 256 }),
      { rough: 0.9, metal: 0.02, color: 0xdfeecb },
    );
    reg(hits, edgeSodStrip, "edge-sod");

    const backfillZone = group(g, -0.4, 0.14, 0.6);
    const backfillMesh = box(backfillZone, 1.8, 0.02, 0.4, 0, 0, 0, 0x4a3a24, { rough: 0.85, cast: false });
    reg(hits, backfillMesh, "backfill-check");

    const chest = toolChest(g, 2.6, 1.6, { ry: -0.5, color: GKB_ACCENT });

    const gloveProp = box(chest, 0.1, 0.05, 0.02, -0.2, 0.79, 0.06, 0x8a6a3a, { rough: 0.8 });
    reg(hits, gloveProp, "work-gloves");
    const eyeProp = box(chest, 0.1, 0.04, 0.02, -0.08, 0.79, 0.06, 0x2b3138, { rough: 0.4 });
    reg(hits, eyeProp, "eye-protection");

    const evacHorn = group(g, -2.6, 0, 2.1, 0.4);
    box(evacHorn, 0.06, 0.06, 0.04, 0, 0.5, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, evacHorn, "evacuate-horn");

    const closingLog = group(g, 2.7, 0, -2.0, 0.4);
    box(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("RENOVATION LOG\nOPEN", { bg: "#11181f", accent: "#c9a36b", scale: 0.2 }), { px: 320 });
    holoTag(closingLog, "renovation log", 0, 1.34, 0, { css: "#c9a36b", w: 0.36 });
    reg(hits, closingLog, "closing-log");

    // ------------------------------------------------------------------ crew
    const crewMember = standingFigure(g, 1.9, -1.8, { ry: -2.0, cloth: 0x2b3138, vest: GKB_ACCENT, helmet: 0xf2f2f2 });
    holoTag(crewMember, "grounds crew", 0, 1.95, 0.15, { css: "#c9a36b", w: 0.32 });

    const spray = particles(irrigationShutoffValve, 16, 0x9adfef, { size: 0.02, life: 0.5, additive: true, opacity: 0.5 });
    spray.visible = false;
    const dust = particles(trench, 14, 0x8a7050, { size: 0.02, life: 0.5, additive: false, opacity: 0.18 });
    dust.visible = false;

    return {
      hits,
      footprint: 2.8,

      onInterrupt(it) {
        if (it.id === "trench-wall-sloughs") { trenchWall.material = mat(0xd2601c, { rough: 0.9 }); dust.visible = true; }
        if (it.id === "sprinkler-head-bursts") { spray.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "trench-wall-sloughs") { trenchWall.material = mat(0x4a3a24, { rough: 0.9 }); dust.visible = false; }
        if (it.id === "sprinkler-head-bursts") { spray.visible = false; }
      },
      onStepComplete(step) {
        if (step.id === "walk-the-bunker") {
          irrigationHead.material = mat(0x59c97b, { rough: 0.5 });
          cableMarker.material = mat(0x59c97b, { rough: 0.6 });
          sloughFace.material = mat(0x59c97b, { rough: 0.6, cast: false });
        }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("RENOVATION LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.2 }));
        }
      },
      onHazard(hitId) { if (hitId === "cut-marked-utility-line") { dust.visible = true; } },

      animate(t, dt, session) {
        crewMember.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        if (spray.visible) spray.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.1, 0.1, 0.15);
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.1, 0.1, -0.1);

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "check-drain-grade") {
          const pct = (gg.t * 2).toFixed(1);
          repaint(gradeInst.userData.screen, signFace(`${pct}%`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
