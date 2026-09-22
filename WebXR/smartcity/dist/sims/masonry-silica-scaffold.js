import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, hose, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, barrierPanel,
  valveWheel, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Masonry Silica Scaffold VR — Construction & Structural Trades.
// Block work off a frame scaffold, under the silica rule: the platform,
// guardrails and access checked before anyone climbs, Table 1 read before the
// saw runs, the water proven before the blade touches block, the course laid
// to the line, and a cleanup that never turns a shift's worth of settled dust
// back into the air with a broom.

const MSS_ACCENT = 0xb2492f;

export const SIM_MASONRY_SILICA_SCAFFOLD = {
  id: "masonry-silica-scaffold",
  index: "193",
  domain: "Construction",
  trade: "Bricklayer — BAC, with the mason tender",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "International Union of Bricklayers and Allied Craftworkers apprenticeship standards; OSHA 29 CFR 1926.1153 respirable crystalline silica — Table 1 for stationary masonry saws; OSHA 29 CFR 1926 Subpart L scaffolds — 1926.451 platforms, guardrails and access; NIOSH silicosis prevention guidance for the masonry trades",
  name: "Masonry Silica Scaffold",
  title: simTitle("Masonry Silica Scaffold"),
  tagline: "Block work off a frame scaffold under the silica rule: planks, guardrails and access inspected, the saw's water proven, block cut to Table 1, the respirator where the table calls for it, mortar mixed and the course laid to the line, cleanup without dry sweeping",
  accent: MSS_ACCENT,
  accentCss: "#b2492f",
  parSeconds: 295,
  footprint: 2.6,
  badge: { id: "course-certified", name: "Course Certified", note: "A course laid off a scaffold that was actually checked, block cut wet to Table 1, and a cleanup that never put the dust back in the air" },

  game: system({
    name: "Masonry Authority",
    currency: "COURSE",
    ranks: ["Tender", "Apprentice Mason", "Journeyman Bricklayer", "Lead Mason", "Masonry Authority Certified"],
    badges: [
      { id: "platform-sound", name: "Platform Sound", note: "Planks, guardrails and access checked before the first step up, first time", test: AWARD.stepClean("inspect") },
      { id: "wet-every-cut", name: "Wet Every Cut", note: "Never cut a block without water running", test: AWARD.safe },
      { id: "true-to-the-line", name: "True to the Line", note: "Every course held plumb to the mason's line", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-course", name: "Clean Course", note: "No corrections through the whole lay-up", test: AWARD.clean },
      { id: "held-the-cut", name: "Held the Cut", note: "Held a steady feed through the whole cut", test: AWARD.unbroken },
      { id: "course-by-break", name: "Course by Break", note: "Cut, laid and cleaned inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dry-cut-block": "You ran the saw against the block with no water on the blade. Dry-cutting masonry throws respirable crystalline silica into the air at many times the permissible exposure limit under 29 CFR 1926.1153 — the water is not there to keep the block cool, it is the entire control that keeps that dust out of your lungs.",
    "skip-respirator": "You cut on this saw with no respirator, in the exact condition Table 1 lists one for. Table 1 sets the respirator requirement by the task and the duration, not by how the air looks — a boxed-in cut with no way for the dust to disperse is precisely the condition that puts a respirator on the required side of the table instead of the optional one.",
    "platform-overload": "You stacked block on the platform well past what this scaffold's duty rating carries. OSHA's scaffold rule at 29 CFR 1926.451 rates a platform for a specific working load, and every unit staged on it before it is used is weight the planks, the ledgers and the frames are carrying whether or not anyone has climbed up yet — the platform does not fail when it is convenient to notice.",
    "dry-sweep-broom": "You swept the settled dust with a dry broom instead of the HEPA vacuum or a wet method. Table 1's engineering controls only work while the dust is still wet or captured — a dry broom puts every particle the water controls kept out of the air back into it, and the settled dust from a shift of wet-cut block is exactly the fine respirable fraction the whole rest of the procedure existed to keep down.",
  },

  lateNotes: {
    "saw-feed": "The blade only runs once the flow gauge reads a real number — a saw with a dry blade is a saw that should not be moving toward the block at all.",
    "respirator": "Table 1 already read what this task needs — the respirator being inconvenient does not change what the table says.",
    "hepa-vac": "Cleanup on a silica task is a HEPA vacuum or a wet method, never a dry broom, no matter how settled the dust looks.",
  },

  steps: [
    {
      id: "tag", kind: "select", target: "scaffold-tag",
      title: "Check the scaffold's inspection tag",
      cue: "Confirm the competent person's tag is current before climbing on.",
      why: "The tag is somebody else's claim that this scaffold was actually checked today, not an assumption carried over from yesterday because it looks the same — OSHA's scaffold rule at 29 CFR 1926.451 puts that inspection before each work shift, and climbing on a scaffold nobody has re-checked today is climbing on yesterday's inspection.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["scaffold-planks", "scaffold-guardrails", "scaffold-access"],
      itemNames: { "scaffold-planks": "platform planks", "scaffold-guardrails": "guardrails", "scaffold-access": "ladder access" },
      itemNotes: {
        "scaffold-planks": "There is a visible crack running most of the way across one plank near the middle of the platform.",
        "scaffold-guardrails": "The toeboard is missing on the open end of the platform, over the wall side.",
        "scaffold-access": "A pallet of block has been staged right at the foot of the access ladder.",
      },
      title: "Inspect the planks, guardrails and access",
      cue: "Walk the platform, the rails and the ladder, and click anything that is not fit to work from.",
      why: "This is the inspection the tag on the post is supposed to represent — a plank that reads fine from the ground can be the one that lets go under a mason's weight, and a scaffold with sound planks but a blocked ladder just moves the same fall risk from the platform to whatever the crew improvises to climb instead.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["planks-fixed", "guardrails-fixed", "access-cleared"],
      itemNames: { "planks-fixed": "cracked plank swapped", "guardrails-fixed": "toeboard fitted", "access-cleared": "ladder cleared" },
      title: "Correct what the inspection found",
      cue: "Swap the cracked plank, fit the missing toeboard, and clear the pallet off the ladder.",
      why: "A defect the inspection found and nobody corrected is worse than one nobody spotted — it lets the whole crew believe the platform was checked and is fit to work from, when the only thing that actually happened is somebody noticed and moved on.",
    },
    {
      id: "table1", kind: "select", target: "table-1-chart",
      title: "Read Table 1 for this saw",
      cue: "Check which controls this saw and this task fall under — water flow, task duration and whether the cut is boxed in.",
      why: "Table 1 in 29 CFR 1926.1153 is what tells a crew, without any air sampling, exactly which engineering controls and which respiratory protection a specific task and duration requires — a stationary masonry saw with water is one line on that table, and today's cut, boxed in against the wall, is the line that also calls for a respirator.",
    },
    {
      id: "respirator", kind: "select", target: "respirator",
      title: "Don the respirator Table 1 calls for",
      cue: "Put on the respirator before the saw runs, because today's cut falls on the side of the table that requires it.",
      why: "Table 1 has already made this decision — the respirator is not a judgement call left to how dusty the saw looks today, it is what the table requires for this exact task and condition, and skipping it because the water is running does not change what the table says.",
    },
    {
      id: "water-valve", kind: "turn", target: "water-valve",
      title: "Open the water valve",
      cue: "Turn the valve on the saw's water line and let the feed line pressurise.",
      why: "The water is the actual engineering control Table 1 is built around, not a courtesy to the blade — nothing on this saw is ready to touch a block until this line is proven to be delivering water to it.",
      turn: { turns: 1, axis: "z", label: "WATER VALVE" },
    },
    {
      id: "flow-check", kind: "gauge", target: "flow-gauge",
      title: "Prove the flow at the blade",
      cue: "Watch the flow gauge and commit only once it reads a steady flow at the blade.",
      why: "A valve that is open is not the same thing as water actually reaching the blade — a kinked line or a clogged nozzle can leave the valve wide open and the cutting edge running dry, and the gauge is the one honest way to know the control is doing its job before the first cut starts.",
      gauge: { label: "FLOW AT BLADE", speed: 0.7, green: [0.42, 0.66], readout: (t) => (t < 0.42 ? "no flow at the blade" : t > 0.66 ? "flow reading unstable" : "steady flow"), missNote: "Not proven — check the line for a kink or a clogged nozzle before cutting anything." },
    },
    {
      id: "cut", kind: "track", target: "saw-feed", seconds: 7,
      title: "Cut the block wet",
      cue: "Feed the block into the blade at a steady rate, water running the whole time.",
      why: "Feeding too fast binds and chips the block at the cut face and can kick it back off the table; feeding too slow does nothing for safety and just spends more time with the blade spinning in the cut. Steady, wet, all the way through is what Table 1's control depends on actually working for the whole cut, not just the first few seconds of it.",
      track: { start: 0.14, green: [0.38, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "FEED RATE", readout: (v) => (v < 0.38 ? "too slow — no benefit, only time" : v > 0.6 ? "too fast — chipping the face" : "steady feed") },
      holdBreakNote: "Feed rate ran out of band. Bring it back to a steady rate before the blade binds or chips the block.",
    },
    {
      id: "mortar-mix", kind: "gauge", target: "mortar-batch",
      title: "Mix the mortar to working consistency",
      cue: "Work the batch and commit once it holds a bed joint without slumping or crumbling.",
      why: "Mortar too wet slumps out from under the block the moment it is set and will not hold the line; too dry and it will not bond to the block face at all. This is judged by hand every batch, because the water a bag of mortar actually needs changes with the humidity and the sand moisture on any given morning.",
      gauge: { label: "MORTAR CONSISTENCY", speed: 0.68, green: [0.4, 0.62], readout: (t) => (t < 0.4 ? "too dry — will not bond" : t > 0.62 ? "too wet — will slump" : "workable"), missNote: "Not workable yet — that batch is either too dry to bond or too wet to hold a joint." },
    },
    {
      id: "bed", kind: "drag", target: "mortar-load",
      title: "Spread the bed joint",
      cue: "Carry a trowel load of mortar to the top of the course and spread the bed joint.",
      why: "The bed joint is what the next block actually sits on — spread thin or uneven, the block above it beds down unevenly the moment it takes any weight, and the course starts drifting out of level from the very first block laid on it.",
      drag: { to: "bed-socket", radius: 0.45, missNote: "Not on the course — carry the mortar to the top of the wall before it sets on the board." },
    },
    {
      id: "set-block", kind: "drag", target: "block",
      title: "Set the block to the line",
      cue: "Carry the block into the bed joint and align its face with the mason's line.",
      why: "The line is the only reference for the whole course staying straight over its full length — a block set to how it looks against the last one, rather than to the line, is how a wall drifts a little at a time until the whole course is visibly out by the far end.",
      drag: { to: "course-socket", radius: 0.45, missNote: "Not on the line — carry the block back and align its face with the string before it beds in." },
    },
    {
      id: "line-check", kind: "gauge", target: "mason-line-gauge",
      title: "Check the block against the line",
      cue: "Sight the block face against the line and commit once it reads true.",
      why: "A block that looks close enough by eye against a taut line is exactly how a face wall ends up with a visible wave in it — the line does not lie, and checking against it rather than against the last block laid is what keeps that error from compounding down the whole course.",
      gauge: { label: "FACE TO LINE", speed: 0.7, green: [0.44, 0.6], readout: (t) => `${((t - 0.52) * 30).toFixed(1)} mm off line`, missNote: "Off the line — tap it back true before the mortar sets." },
    },
    {
      id: "tool-joint", kind: "hold", target: "jointer", seconds: 4,
      title: "Tool the joint",
      cue: "Run the jointer along the mortar joint and hold a steady pass until it is compacted.",
      why: "Tooling compacts the mortar face and closes it against water intrusion — struck too soon it smears and never compacts, struck too late and the mortar has already started to set and just crumbles instead of closing, and a joint that was never actually compacted is where the wall starts taking on water years before anyone can see it from the outside.",
      holdBreakNote: "Came off the joint before it compacted — go back over it before the mortar sets any further.",
    },
    {
      id: "cleanup", kind: "select", target: "hepa-vac",
      title: "Clean up without dry sweeping",
      cue: "Vacuum the settled dust with the HEPA vac instead of reaching for the broom.",
      why: "Everything upstream of this — the wet cut, the respirator, the valve proven before the blade touched anything — was a control on silica dust, and a dry broom at the end of the shift puts that same fine dust straight back into the air the crew is standing in. Table 1's controls only hold if the cleanup respects them too.",
    },
  ],

  interrupts: [
    {
      id: "water-runs-dry",
      kind: "Water line dry",
      after: "cut", delay: 3, seconds: 12,
      alert: "The flow at the blade has stopped — the water line has run dry mid-cut and the blade is spinning against bare block.",
      cue: "That blade is cutting dry right now.",
      target: "saw-estop",
      why: "The instant the water stops, this cut is producing exactly the exposure Table 1's control exists to prevent — there is no version of finishing this one cut dry that is worth it, because the saw is still spinning silica into the air for every second it keeps running. Stop the saw first; the line gets checked once the blade is not turning.",
      missNote: "The cut kept going after the water stopped. A masonry saw cutting dry throws respirable crystalline silica into the air at many times the permissible limit for every second the blade keeps spinning, and that exposure does not reverse once the line is fixed.",
      wrongNote: "Stop the saw. A dry blade does not get a few more seconds of cutting while somebody checks the line.",
    },
    {
      id: "tender-dry-sweep",
      kind: "Dry sweeping",
      after: "line-check", delay: 3, seconds: 12,
      alert: "The mason tender has picked up a broom and started dry-sweeping the settled dust off the platform behind you.",
      cue: "That broom is putting a shift's worth of dust back into the air.",
      target: "hepa-vac",
      why: "A dry broom does not know the difference between ordinary site dirt and the fine respirable fraction Table 1's controls have been keeping out of the air all shift — handing the tender the HEPA vac instead is the only way this settled dust stays where the wet cutting and the respirator already put the effort into keeping it.",
      missNote: "The tender kept dry-sweeping while the course was laid. Every pass of that broom put more of a shift's worth of respirable silica back into the air the whole crew was breathing, undoing exactly what the wet cutting and the respirator were there to prevent.",
      wrongNote: "Get them the HEPA vac. A dry broom on this dust undoes everything the wet cut and the respirator were doing all day.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MSS_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.1, 5.2, 0, 0.05, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4c4238", base2: "#3e362e", seam: "rgba(0,0,0,0.42)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xc4b79f },
    );

    // ------------------------------------------------------------- the wall
    // Block coursing already up to working height, with the top course being
    // laid off the scaffold above it.
    const wall = group(g, 0, 0, -1.55);
    for (let row = 0; row < 4; row++) {
      for (let col = -3; col <= 3; col++) {
        box(wall, 0.38, 0.19, 0.19, col * 0.4 + (row % 2 ? 0.2 : 0), 0.1 + row * 0.2, 0, 0xc7bfa8, { rough: 0.9 });
      }
    }
    const lineA = group(wall, -1.5, 0.9, 0.14);
    const lineB = group(wall, 1.5, 0.9, 0.14);
    const masonLine = hose(wall, [[-1.5, 0.9, 0.14], [1.5, 0.9, 0.14]], 0.004, 0xe8e0c8, { steps: 4, rough: 0.7 });
    void lineA; void lineB;
    holoTag(wall, "top course — lay to the line", 0, 1.15, 0.14, { css: "#b2492f", w: 0.5 });

    const bedSocket = box(wall, 3.0, 0.04, 0.22, 0, 0.82, 0, 0xffffff, { rough: 0.5 });
    bedSocket.visible = false; hits["bed-socket"] = bedSocket;
    const mortarBed = box(wall, 3.0, 0.03, 0.2, 0, 0.82, 0, 0xa89a80, { rough: 0.9, opacity: 0.2, transparent: true });

    const courseSocket = box(wall, 0.4, 0.2, 0.2, 0.6, 0.9, 0, 0xffffff, { rough: 0.5 });
    courseSocket.visible = false; hits["course-socket"] = courseSocket;

    // The block already staged to fly into place.
    const block = box(g, 0.38, 0.19, 0.19, -1.4, 0.2, 0.6, 0xc7bfa8, { rough: 0.9 });
    holoTag(block, "block", 0, 0.24, 0, { css: "#b2492f", w: 0.18 });
    reg(hits, block, "block");

    // ------------------------------------------------------------- scaffold
    // One lift of frame scaffold, already erected and standing along the
    // wall. Working this scaffold, not building it, is the whole station.
    const scaffold = group(g, 0, 0, -0.75);
    function frameLeg(px) {
      const f = group(scaffold, px, 0, 0);
      for (const sx of [-0.5, 0.5]) cyl(f, 0.022, 0.022, 1.05, sx, 0.53, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
      for (const y of [0.3, 1.0]) cyl(f, 0.016, 0.016, 1.0, 0, y, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
      cyl(f, 0.012, 0.012, 1.15, 0, 0.55, 0, 0xe8b02e, { rough: 0.5, seg: 6 }).rotation.z = 0.9;
    }
    frameLeg(-1.4); frameLeg(1.4);
    const platform = group(scaffold, 0, 1.06, 0.2);
    const plankGroup = box(platform, 3.1, 0.04, 0.5, 0, 0, 0, 0xc48b3f, { rough: 0.85 });
    const plankCrack = box(platform, 1.6, 0.01, 0.02, 0, 0.021, 0, 0x2b2018, { rough: 0.9 });
    reg(hits, plankGroup, "scaffold-planks");
    const railGroup = group(scaffold, 0, 1.06, 0.44);
    for (const [y, h] of [[1.0, 0.03], [0.5, 0.03]]) box(railGroup, 3.1, h, 0.03, 0, y, 0, 0xe8b02e, { rough: 0.55 });
    // Toeboard missing on the wall side until the fix step fits it.
    const missingToe = box(railGroup, 3.1, 0.12, 0.02, 0, 0.06, -0.42, 0xe8b02e, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    reg(hits, railGroup, "scaffold-guardrails");
    const ladder = group(scaffold, -1.9, 0, -0.3, 0.2);
    for (const sx of [-0.2, 0.2]) box(ladder, 0.04, 1.1, 0.04, sx, 0.55, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 4; i++) box(ladder, 0.4, 0.03, 0.03, 0, 0.2 + i * 0.26, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    reg(hits, ladder, "scaffold-access");
    // The pallet of block blocking the ladder foot, until the crew clears it.
    const ladderBlock = group(g, -1.9, 0, -0.9);
    for (let i = 0; i < 4; i++) box(ladderBlock, 0.4, 0.19, 0.4, 0, 0.1 + i * 0.2, 0, 0xc7bfa8, { rough: 0.9 });
    holoTag(ladderBlock, "pallet — blocking ladder", 0, 0.95, 0, { css: "#d2312b", w: 0.4 });

    // Fix-step controls: small markers beside each defect the inspection found.
    const plankFixMark = box(platform, 0.1, 0.02, 0.1, -0.4, 0.03, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, plankFixMark, "planks-fixed");
    const guardrailFixMark = box(railGroup, 0.1, 0.1, 0.02, 0, 0.06, -0.42, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, guardrailFixMark, "guardrails-fixed");
    const accessFixMark = box(g, 0.2, 0.2, 0.2, -1.9, 0.1, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, accessFixMark, "access-cleared");

    const tag = group(ladder, 0.3, 1.5, 0.05);
    box(tag, 0.09, 0.13, 0.01, 0, 0, 0, 0x59c97b, { rough: 0.6 });
    decal(tag, 0.08, 0.055, 0, 0, 0.006, signFace("GREEN", { bg: "#59c97b", accent: "#0b1219", scale: 0.55 }), { px: 160 });
    reg(hits, tag, "scaffold-tag");

    // Overloaded pallet actually sitting on the platform — the hazard.
    const overload = group(platform, 1.1, 0.04, 0);
    for (let i = 0; i < 6; i++) box(overload, 0.34, 0.18, 0.34, 0, 0.09 + i * 0.19, 0, 0xc7bfa8, { rough: 0.9 });
    holoTag(overload, "stack it here?", 0, 1.4, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, overload, "platform-overload");

    // ---------------------------------------------------------------- saw
    const saw = group(g, 2.1, 0, 0.9, -0.4);
    box(saw, 0.9, 0.6, 0.6, 0, 0.3, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    const bladeGuard = cyl(saw, 0.24, 0.24, 0.04, 0.3, 0.65, 0, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 20 });
    bladeGuard.rotation.z = Math.PI / 2;
    const sawTable = box(saw, 0.7, 0.03, 0.4, 0, 0.62, 0, 0xb9bec4, { rough: 0.5, metal: 0.5 });
    void sawTable;
    const feedHandle = group(saw, -0.3, 0.66, 0);
    box(feedHandle, 0.16, 0.04, 0.04, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    holoTag(feedHandle, "saw feed", 0, 0.14, 0, { css: "#b2492f", w: 0.24 });
    reg(hits, feedHandle, "saw-feed");
    const estop = cyl(saw, 0.05, 0.05, 0.03, 0.35, 0.66, -0.25, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 16 });
    estop.material = estop.material.clone();
    holoTag(saw, "E-stop", 0.35, 0.78, -0.25, { css: "#d2312b", w: 0.22 });
    reg(hits, estop, "saw-estop");
    const drySparks = particles(g, 22, 0xf2ae14, { size: 0.022, life: 0.3, additive: true, opacity: 0.85 });
    drySparks.position.set(2.1, 0.66, 0.9);
    const dryCutTrap = box(saw, 0.5, 0.3, 0.4, 0.3, 0.62, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(saw, "cut it dry?", 0.3, 0.9, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, dryCutTrap, "dry-cut-block");

    // Water supply: valve, hose to the saw, flow gauge.
    const waterValve = valveWheel(g, 1.4, 0.55, 1.5, { color: 0x3fa9d8, body: 0x2b2f34, r: 0.09, ry: 0.4 });
    holoTag(waterValve, "water valve", 0, 0.28, 0, { css: "#b2492f", w: 0.26 });
    reg(hits, waterValve, "water-valve");
    const waterLine = hose(g, [[1.4, 0.55, 1.5], [1.7, 0.5, 1.1], [1.9, 0.5, 0.9]], 0.012, 0x3fa9d8, { steps: 12, rough: 0.6 });
    const flowGauge = instrument(g, 1.6, 0.9, 1.3, { ry: 0.3, idle: "-- gpm", color: MSS_ACCENT, w: 0.12, d: 0.19 });
    holoTag(flowGauge, "flow at blade", 0, 0.16, 0, { css: "#b2492f", w: 0.32 });
    reg(hits, flowGauge, "flow-gauge");
    const spray = particles(g, 26, 0x8fd0e8, { size: 0.02, life: 0.4, additive: false, opacity: 0.6 });
    spray.position.set(2.1, 0.66, 0.9);

    // -------------------------------------------------------------- table 1
    const table1Panel = holoPanel(g, 0.64, 0.5, 2.5, 1.4, -0.3, (cx, w, h) => {
      cx.fillStyle = "#22150f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#b2492f"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f3e2d8"; cx.fillText("1926.1153 TABLE 1 — SAW", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; cx.fillStyle = "#e5cabc";
      ["Stationary masonry saw, water fed", "Outdoors, under 4 hrs: no respirator", "Boxed in / over 4 hrs: respirator required", "Today's cut: boxed in against the wall"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: -0.5, accent: MSS_ACCENT });
    reg(hits, table1Panel, "table-1-chart");

    const respiratorHook = group(g, 2.6, 0, -1.0);
    cyl(respiratorHook, 0.012, 0.012, 0.5, 0, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const respMask = box(respiratorHook, 0.16, 0.1, 0.06, 0, 0.6, 0, 0x3a4048, { rough: 0.6 });
    ball(respiratorHook, 0.035, 0, 0.58, 0.05, 0xe8b02e, { rough: 0.5 });
    holoTag(respiratorHook, "respirator", 0, 0.75, 0, { css: "#b2492f", w: 0.3 });
    void respMask;
    reg(hits, respiratorHook, "respirator");
    const respiratorTrap = box(saw, 0.6, 0.5, 0.6, 0, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(saw, "run it bare-faced?", 0, 1.25, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, respiratorTrap, "skip-respirator");

    // ------------------------------------------------------------- mortar
    const mortarBoard = group(g, -2.0, 0, 0.8);
    box(mortarBoard, 0.9, 0.06, 0.9, 0, 0.4, 0, 0x5a4a34, { rough: 0.9 });
    const mortarPile = box(mortarBoard, 0.6, 0.14, 0.6, 0, 0.5, 0, 0xa89a80, { rough: 0.92 });
    void mortarPile;
    const mortarGauge = instrument(mortarBoard, 0.5, 0.43, 0, { ry: -0.4, idle: "--", color: MSS_ACCENT, w: 0.13, d: 0.2 });
    holoTag(mortarGauge, "mortar consistency", 0, 0.17, 0, { css: "#b2492f", w: 0.44 });
    reg(hits, mortarGauge, "mortar-batch");
    const mortarLoad = group(mortarBoard, -0.4, 0.5, 0.1);
    box(mortarLoad, 0.14, 0.03, 0.1, 0, 0, 0, 0xa89a80, { rough: 0.9 });
    holoTag(mortarLoad, "trowel load", 0, 0.13, 0, { css: "#b2492f", w: 0.24 });
    reg(hits, mortarLoad, "mortar-load");

    // ------------------------------------------------------------- line gauge
    const lineGauge = instrument(g, 1.2, 1.35, -1.15, { ry: 0.5, idle: "-- mm", color: MSS_ACCENT, w: 0.12, d: 0.19 });
    holoTag(lineGauge, "face to line", 0, 0.16, 0, { css: "#b2492f", w: 0.28 });
    reg(hits, lineGauge, "mason-line-gauge");

    // ------------------------------------------------------------- jointer
    const jointerChest = toolChest(g, -2.4, -0.6, { ry: 1.0, color: 0x6a3a28 });
    const jointer = group(jointerChest, 0, 0.79, 0.06, 0.4);
    cyl(jointer, 0.01, 0.01, 0.18, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 8 }).rotation.x = Math.PI / 2;
    box(jointer, 0.03, 0.03, 0.08, 0, 0, -0.1, 0x6a4a1a, { rough: 0.7 });
    holoTag(jointer, "jointer", 0, 0.13, 0, { css: "#b2492f", w: 0.2 });
    reg(hits, jointer, "jointer");

    // ------------------------------------------------------------- cleanup
    const hepaVac = group(g, 0.4, 0, 1.9);
    box(hepaVac, 0.3, 0.5, 0.3, 0, 0.25, 0, 0x2f6f4a, { rough: 0.6, metal: 0.3 });
    cyl(hepaVac, 0.04, 0.04, 0.4, 0.16, 0.6, 0, 0x2b2f34, { rough: 0.6, seg: 8 });
    holoTag(hepaVac, "HEPA vacuum", 0, 0.75, 0, { css: "#59c97b", w: 0.32 });
    reg(hits, hepaVac, "hepa-vac");
    const dryBroom = group(g, -0.4, 0, 1.9);
    cyl(dryBroom, 0.012, 0.012, 1.1, 0, 0.55, 0, 0x8a6a3a, { rough: 0.8, seg: 8 });
    box(dryBroom, 0.24, 0.08, 0.06, 0, 0.06, 0, 0xd8c98a, { rough: 0.85 });
    holoTag(dryBroom, "dry broom — do not use", 0, 1.2, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, dryBroom, "dry-sweep-broom");
    const dustBed = box(g, 1.6, 0.01, 1.2, 0, 0.11, 1.9, 0x8a7a5a, { rough: 0.95, opacity: 0.3, transparent: true, cast: false });

    // ---------------------------------------------------------------- crew
    const mason = standingFigure(g, 0.6, -0.1, { ry: 2.6, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(mason, "bricklayer", 0, 1.9, 0, { css: "#b2492f", w: 0.3 });
    const tender = standingFigure(g, 0, 2.4, { ry: -1.6, cloth: 0x4a5560, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(tender, "mason tender", 0, 1.9, 0, { css: "#b2492f", w: 0.34 });
    const tenderHome = { x: 0, z: 2.4, ry: -1.6 };
    barrierPanel(g, -2.8, -1.6, { ry: 0.9 });
    cone(g, 2.7, -1.8);
    cone(g, -2.7, 1.9);

    const dust = particles(g, 26, 0xd8d2c4, { size: 0.03, life: 0.6, additive: false, opacity: 0.35 });
    dust.position.set(0.4, 0.3, 1.9);

    let sawing = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.2, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { plankCrack.visible = false; missingToe.material.opacity = 1; ladderBlock.visible = false; }
        if (step.id === "respirator") respMask.material.color.set(0x2f6f8c);
        if (step.id === "bed") mortarBed.material.opacity = 1;
        if (step.id === "cleanup") dustBed.visible = false;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "water-runs-dry") {
          spray.visible = false;
          drySparks.visible = true;
          estop.material.color.set(0xff5a3c);
          estop.material.emissiveIntensity = 2.4;
        }
        if (it.id === "tender-dry-sweep") { tender.rotation.y = tenderHome.ry + 0.6; tender.position.x = tenderHome.x + 0.6; }
      },
      onInterruptEnd(it) {
        if (it.id === "water-runs-dry") {
          drySparks.visible = false;
          estop.material.color.set(0xd2312b);
          estop.material.emissiveIntensity = 1;
        }
        if (it.id === "tender-dry-sweep" && it.resolved === "answered") { tender.rotation.y = tenderHome.ry; tender.position.x = tenderHome.x; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "flow-check") repaint(flowGauge.userData.screen, signFace(gg.t < 0.42 ? "NO FLOW" : gg.t > 0.66 ? "UNSTABLE" : "STEADY", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.5 }));
        if (gg && !gg.committed && step?.id === "mortar-mix") repaint(mortarGauge.userData.screen, signFace(gg.t < 0.4 ? "DRY" : gg.t > 0.62 ? "WET" : "WORKABLE", { bg: "#22150f", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#f3e2d8", scale: 0.5 }));
        if (gg && !gg.committed && step?.id === "line-check") repaint(lineGauge.userData.screen, signFace(`${((gg.t - 0.52) * 30).toFixed(1)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        const tr = session?.track;
        if (step?.id === "cut" && session.holding) {
          sawing = true;
          spray.visible = true;
          spray.userData.step(dt, new THREE.Vector3(2.1, 0.66, 0.9), 0.08, 0.3, -3);
          dust.visible = false;
        } else {
          if (sawing) { sawing = false; spray.visible = false; }
          if (step?.id === "cleanup") { dust.visible = true; dust.userData.step(dt, new THREE.Vector3(0.4, 0.3, 1.9), 0.1, 0.3, -1.2); }
          else dust.visible = false;
        }
        void tr; void overload; void dryCutTrap; void respiratorTrap; void dryBroom; void drySparks;
      },
    };
  },
};
