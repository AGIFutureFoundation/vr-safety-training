import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, mudflatFace, waterFace,
} from "../citykit.js";
import { excavator, dumpTruck } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Legacy Mercury & PCB Hotspot Handling VR — SF Bay
// Restoration & Cleanup, pack D (contaminated sediment and water quality).
//
// A shoreline cell inside a sheet-pile cofferdam where the work plan has
// delineated a hotspot of legacy mercury and PCBs in the sediment — a
// generic reach, not any real site's history or cleanup status. The hotspot
// is dug in thin cuts at low water by a tracked excavator, straight into a
// lined roll-off bin kept for that category, with the mercury vapour
// analyser read before and during the dig, the spill kit ready for the free
// mercury beads old sediment can hold, a confirmation sample taken off the
// floor, the bin closed and marked, the truck scanned before release, and the
// crew doffed through the decon line in order. The learner is the LIUNA
// Local 261 hazmat lead; an IUOE Local 3 operator runs the excavator. Action
// levels, excavation limits and every disposal call read against "the site
// safety and health plan" or "the work plan"; no exposure figure appears.

const BRHG_ACCENT = 0xc0a0d8;

export const SIM_BR_LEGACY_MERCURY_AND_PCB_HOTSPOT_HANDLING = {
  id: "br-legacy-mercury-and-pcb-hotspot-handling",
  index: "BR-D5",
  domain: "Environmental",
  trade: "LIUNA Local 261 hazardous-waste laborer leading the hotspot cut, with an IUOE Local 3 operating engineer on the excavator",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA Local 261 hazardous waste and environmental remediation training (LIUNA Training and Education Fund) for the hotspot crew; IUOE Local 3 operating engineer apprenticeship for the excavator in the cofferdam; OSHA HAZWOPER, 29 CFR 1910.120, including the site safety and health plan's air monitoring, PPE and decontamination; 40 CFR 761 for the handling, marking and storage of PCB remediation waste; RCRA 40 CFR 262 generator duties and DTSC rules for any of it the profile makes hazardous waste; the Regional Water Quality Control Board's Section 401 certification and Army Corps Section 404 conditions for work below the tide line; EPA QA/G-5 chain-of-custody practice for the confirmation samples",
  name: "Legacy Mercury & PCB Hotspot Handling",
  title: simTitle("Legacy Mercury & PCB Hotspot Handling"),
  tagline: "A delineated hotspot dug out and kept apart: the work plan's hotspot page read, the crew dressed and fit-tested, mercury vapour read before the cut, the stakes walked, the bin lined, the mist started, thin cuts called into the bin while free mercury beads show in the bucket, the floor sampled while the truck backs in unspotted, the bin closed and marked, the truck scanned before release, the cell walked, the crew doffed in order, logged and checked in",
  accent: BRHG_ACCENT,
  accentCss: "#c0a0d8",
  parSeconds: 310,
  footprint: 2.5,
  badge: { id: "kept-apart", name: "Kept Apart", note: "Every bucket of the hotspot went into its own lined bin, the beads were contained without a vacuum or a broom, and nobody left the zone out of order" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261 or IUOE Local 3 — with the employer's employee assistance line behind it",

  game: system({
    name: "Hotspot Cell",
    currency: "CUT",
    ranks: ["Hazmat Hand", "Cut Signaller", "Hotspot Lead", "Remediation Foreman", "Hotspot Cell Certified"],
    badges: [
      { id: "read-before-cut", name: "Read Before Cut", note: "The hotspot page read and the vapour baseline taken clean before the first bucket", test: AWARD.all(AWARD.stepClean("hotspot-plan"), AWARD.stepClean("vapour-baseline")) },
      { id: "no-vacuum-no-broom", name: "No Vacuum, No Broom", note: "Never a shop vacuum on the beads, never a mask down, never under the bucket, never a side-cast on bare ground", test: AWARD.safe },
      { id: "scans-true", name: "Scans True", note: "Baseline and release scans both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-cell", name: "Clean Cell", note: "No corrections from the plan to the check-in", test: AWARD.clean },
      { id: "thin-cuts", name: "Thin Cuts", note: "Held the cut call in band the whole time", test: AWARD.unbroken },
      { id: "out-by-the-tide", name: "Out By The Tide", note: "Cell logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "vacuum-beads": "You reached for the shop vacuum to pick up the mercury beads. A vacuum's motor warms and blows the air it draws across the beads, turning liquid mercury into vapour and spraying it round the cell, and the machine itself is contaminated for good. Beads are covered with the spill kit's amalgamating powder and collected with its sponges and scoops, never vacuumed or swept.",
    "mask-down-to-talk": "You pulled your respirator down to shout to the operator. Mercury vapour has no smell and gives no warning, and the respirator protects only while it is sealed on the face — the seconds it is down are the seconds the site safety plan's action level was set to prevent. Talk on the radio or by the agreed hand signals, with the seal on.",
    "into-the-cut": "You stepped down into the cut to grab the confirmation sample while the bucket was still working. The floor of a fresh cut in wet sediment is soft and the sheet-pile corner is where a slumping face lands, and the operator cannot see the cut floor behind the bucket. The bucket is grounded and the operator says so before anyone goes in, and the sample is taken from the edge with the long-handled scoop where the plan allows.",
    "side-cast": "You waved the operator to side-cast a bucket of hotspot spoil onto the bare ground beside the bin to save a swing. Hotspot material set down on unlined ground has just made a new hotspot, one nobody delineated, and it drains into the cell on the next tide. Every bucket goes into the lined bin kept for its category, or the dig pauses until there is room.",
  },

  lateNotes: {
    "misting-valve": "Start the mist once the bin is lined and ready — wetting the face before there is anywhere for the spoil to go just runs water into the cell.",
    "cut-paddle": "The cut is called once the mist is on the face and the bin is lined — a dry face sheds dust and there is nowhere lined for the bucket to go.",
    "release-scan": "Scan the truck and the bin once the bin is closed and marked — scanning before it is closed only proves what the open load was giving off.",
    "hotspot-log": "The hotspot log is written after the crew has come out through the decon line — it records the doff and the release as well as the dig.",
  },

  steps: [
    {
      id: "hotspot-plan", kind: "select", target: "hotspot-plan",
      title: "Read the hotspot page of the work plan",
      cue: "At the board: the delineated limits and the stakes, the depth to dig to, the segregation categories and their bins, the tide window, and the air monitoring action levels in the site safety and health plan.",
      why: "The hotspot exists on paper before it exists in the ground: sampling delineated it, the work plan draws its limits and depth, and the site safety and health plan sets what vapour reading stops the work. Digging it without reading both means guessing where contamination ends and what the air is allowed to carry, which is the one thing HAZWOPER makes sure nobody on the crew has to guess.",
    },
    {
      id: "dress", kind: "sequence", anyOrder: true,
      targets: ["ppe-coverall", "ppe-gloves", "ppe-respirator"],
      itemNames: { "ppe-coverall": "chemical coverall, cuffs taped", "ppe-gloves": "inner nitrile and outer chemical gloves", "ppe-respirator": "the fit-tested respirator the plan assigns, seal checked" },
      title: "Dress for the hotspot",
      cue: "Chemical coverall with taped cuffs, two layers of gloves, and the respirator the site safety plan assigns — seal checked before you step in.",
      why: "PCBs soak into skin and mercury vapour is breathed, so the hotspot crew is dressed against both: a coverall and taped cuffs keep sediment off skin, two glove layers let the outer pair be shed when fouled, and the respirator the plan assigns — fit-tested to the wearer and seal-checked each time — is the protection the air monitoring is measured against.",
    },
    {
      id: "vapour-baseline", kind: "gauge", target: "hg-analyser",
      title: "Read mercury vapour at the cut before the first bucket",
      cue: "Hold the mercury vapour analyser at breathing height by the cut and commit the baseline against the site safety plan's action level.",
      why: "Mercury vapour cannot be seen or smelled, and the only way anyone knows whether the dig is raising it is to compare readings against a baseline taken before the ground was opened. The baseline is read at breathing height where the crew stands, because that is the air the respirators and the action level exist for.",
      gauge: { label: "Hg VAPOUR", speed: 0.66, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "analyser still zeroing" : t <= 0.58 ? "baseline — under the action level" : "reading at the cut face, not breathing height"), missNote: "Outside the band — let the analyser finish zeroing and read it at breathing height, not down at the face." },
    },
    {
      id: "stake-walk", kind: "find", noHint: true,
      targets: ["stake-missing", "flag-wrong"],
      itemNames: { "stake-missing": "a corner stake of the hotspot knocked out", "flag-wrong": "a flag in the wrong category's colour" },
      itemNotes: {
        "stake-missing": "The north-east corner stake is lying flat in the mud. Without it the operator is guessing where the hotspot's limit is, and the cut either stops short or runs into material the plan put in another category.",
        "flag-wrong": "One flag on the east line is the colour for the general fill category, not the hotspot. Dug by the flags, that strip would go in the wrong bin.",
      },
      title: "Walk the delineation stakes",
      cue: "Walk the hotspot's limits: every corner stake standing where the survey set it, every flag the hotspot's colour.",
      why: "The stakes and flags are the only place the work plan's drawing meets the ground, and the operator digs to them. A stake knocked out overnight or a flag in the wrong colour moves the limit without anyone deciding to, and the result is hotspot material left in the ground or clean material sent for expensive disposal — both of which the confirmation sampling will find too late.",
    },
    {
      id: "line-bin", kind: "drag", target: "bin-liner",
      title: "Line the hotspot roll-off bin",
      cue: "Carry the liner to the roll-off bin kept for the hotspot category and lay it in, lapped over the rim on every side.",
      why: "The hotspot goes into its own bin so it is never mixed with anything the plan puts in a lighter category, and the bin is lined so what drains out of wet sediment stays in the load rather than weeping through the door seals onto the road. A liner lapped over the rim is one that cannot slump down under the first bucket and leave bare steel.",
      drag: { to: "rolloff-bin", radius: 0.5, missNote: "Not in the bin — the liner goes into the hotspot bin and laps over the rim on every side." },
    },
    {
      id: "mist-on", kind: "turn", target: "misting-valve",
      title: "Start the mist over the cut face",
      cue: "Open the misting line's valve until a fine mist lies over the cut face — damp, not running.",
      why: "Sediment that dries on the face sheds dust carrying PCBs, and a light mist keeps it bound without running water into the cell floor. The valve is opened to a mist, not a spray, because standing water in the cut spreads the hotspot across the floor and becomes water that has to be managed as the work plan says before it goes anywhere.",
      turn: { turns: 1.25, label: "MIST VALVE", readout: (t) => (t < 0.3 ? "shut — face drying" : t < 0.9 ? "opening — mist building" : "fine mist on the face") },
    },
    {
      id: "thin-cuts", kind: "track", target: "cut-paddle", seconds: 7,
      title: "Call thin cuts inside the stakes into the bin",
      cue: "Hold the call steady: a thin cut inside the stakes, the bucket curled and swung low straight into the lined bin.",
      why: "The hotspot is taken off in thin cuts so the operator stays inside the delineated limits and depth rather than gouging past them, and each bucket goes straight from the face into the lined bin with no stop on the ground. The laborer's call holds the pace, because a fast, deep bucket spills over its lip and throws sediment across the cell on the swing.",
      track: { start: 0.12, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "CUT CALL", readout: (v) => (v < 0.4 ? "scraping — tide window closing" : v > 0.6 ? "deep and fast — spilling on the swing" : "thin cut, low swing to the bin") },
      holdBreakNote: "The call broke and the bucket bit deep and swung fast. Bring it back to a thin cut and a low swing into the bin.",
    },
    {
      id: "confirm-sample", kind: "hold", target: "confirm-scoop", seconds: 5,
      title: "Take the confirmation sample off the cut floor",
      cue: "With the bucket grounded, hold the long-handled scoop at the floor's grid node until the jar is filled, then cap it.",
      why: "Whether the hotspot is gone is not decided by how the cut looks; it is decided by confirmation samples from the floor and walls at the grid nodes the work plan sets, analysed under chain of custody. Taken from the edge with the long scoop and the bucket grounded, the sample is the right material from the right place, taken without anyone standing in the cut.",
      holdBreakNote: "The scoop lifted off the node before the jar filled. Put it back on the grid node and hold it until the jar is full.",
    },
    {
      id: "close-bin", kind: "sequence",
      targets: ["bin-cover", "bin-mark", "bin-record"],
      itemNames: { "bin-cover": "bin cover drawn and strapped", "bin-mark": "the bin marked for its contents as the rules require", "bin-record": "bin number recorded against the grid cells" },
      title: "Close, mark and record the bin",
      cue: "Draw and strap the cover, mark the bin for what is in it, then record its number against the grid cells it came from.",
      why: "PCB remediation waste is stored covered and marked under 40 CFR 761, and the bin's number is tied to the grid cells it holds so the profile results and the disposal decision can follow it. The order matters: a bin marked before it is covered is marked open, and a record made before the bin is closed may describe a load that changed after.",
      outOfOrderNote: "Out of order — cover it first, then mark it, then record its number against the cells it came from.",
    },
    {
      id: "release-scan", kind: "gauge", target: "release-scan",
      title: "Scan the truck and the bin before release",
      cue: "Run the vapour analyser along the truck's tyres and bed and the closed bin, and commit the reading against the plan's release criterion.",
      why: "A truck that has worked beside a mercury hotspot can carry sediment on its tyres and body out of the exclusion zone and onto a public road. The release scan, against the criterion the site safety plan sets, is how the crew knows the truck and the closed bin are fit to leave — the exclusion zone's boundary is only real if things are checked as they cross it.",
      gauge: { label: "RELEASE SCAN", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "wand too far from the tyre" : t <= 0.6 ? "inside the release criterion" : "reading still falling — hold"), missNote: "Outside the band — hold the wand close along the tread and read again once it steadies." },
    },
    {
      id: "cell-walk", kind: "find", noHint: true,
      targets: ["cover-torn", "wash-overflow"],
      itemNames: { "cover-torn": "a tear in the stockpile cover", "wash-overflow": "the boot wash tub brimming over" },
      itemNotes: {
        "cover-torn": "The cover over the general-fill stockpile has torn at a strap; rain on the pile tonight drains into the cell, carrying fines.",
        "wash-overflow": "The boot wash tub is full to the brim and slopping onto the ground at the decon line — that water is contaminated and is handled as the work plan says, not left to run.",
      },
      title: "Walk the cell before it is left",
      cue: "Walk the cell and the decon line: the stockpile cover, the boot wash, the cofferdam corners.",
      why: "The hotspot cell sits below the tide line inside a cofferdam overnight, and what fails there fails into the Bay: a torn cover lets rain carry fines off a pile, a brimming wash tub runs decon water onto open ground. One walk at the end of the shift finds both while they are a strap and a pump-out rather than a release.",
    },
    {
      id: "doff", kind: "sequence",
      targets: ["doff-outer-gloves", "doff-coverall", "doff-respirator"],
      itemNames: { "doff-outer-gloves": "outer gloves off at the drop", "doff-coverall": "coverall rolled off inside-out", "doff-respirator": "respirator off last, at the clean end" },
      title: "Come out through the decon line in order",
      cue: "Outer gloves off at the drop, the coverall rolled off inside-out, and the respirator off last at the clean end — then wash.",
      why: "Doffing is where contamination most often reaches skin, and the order is what prevents it: the fouled outer gloves come off first so they do not touch the rest, the coverall is rolled inside-out so its outside never meets the wearer, and the respirator comes off last, at the clean end, so the air being breathed is clean when the seal breaks.",
      outOfOrderNote: "Out of order — outer gloves first, then the coverall inside-out, and the respirator comes off last at the clean end.",
    },
    {
      id: "hotspot-log", kind: "select", target: "hotspot-log",
      title: "Write the hotspot log",
      cue: "Log the vapour baseline and the readings through the dig, the stake reset, the beads and how they were contained, the confirmation sample and its custody, the bin number and cells, the unspotted truck, the release scan and the doff.",
      why: "The hotspot log is what the confirmation results, the bin profiles and the disposal decision are matched against, and it is the crew's record of exposure — the vapour readings with their times are what an occupational health review reads. The beads and the truck go in as they happened, because a log that leaves out the hard parts of the day is a log nobody can rely on for the easy ones.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator and the crew",
      cue: "On the radio: the cell is closed, the bin is staged for its profile, when the tide lets the crew back in, and how everyone is after the beads and a truck backing in blind.",
      why: "Free mercury in a bucket and a truck reversing with nobody spotting it are both things that stay with a crew after the shift, and the operator spent the day swinging over people in respirators. The check-in closes the day's plan out loud and it is the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "mercury-beads",
      kind: "Free mercury beads in the bucket",
      after: "thin-cuts", delay: 3, seconds: 14,
      alert: "The last bucket has opened a pocket of silver beads — liquid mercury glinting in the spoil on the bucket's lip and on the cut face — and the vapour analyser has started to climb.",
      cue: "Signal the bucket down and go to the mercury spill kit: cover the beads before anything else moves.",
      target: "mercury-kit",
      why: "Free mercury is the one thing in the hotspot that can reach the air in a hurry: beads spread when they are disturbed and give off vapour while they are exposed. The spill kit's amalgamating powder and covers stop both, so the bucket is grounded and the beads covered before the dig resumes — and the air monitoring decides whether the crew stays in.",
      missNote: "The bucket kept swinging with beads on its lip; they scattered across the cell floor and the bin rim, the analyser passed the action level, and the whole crew had to withdraw while the cell was decontaminated.",
      wrongNote: "The mercury spill kit — ground the bucket and cover the beads with it before anything else moves.",
    },
    {
      id: "truck-backing-blind",
      kind: "Truck reversing with no spotter",
      after: "confirm-sample", delay: 2, seconds: 13,
      alert: "The dump truck has started backing toward the cell with nobody spotting it — the second laborer is kneeling by the bin in its path, facing away.",
      cue: "Blow the air horn: stop the truck before it reaches the bin.",
      target: "air-horn",
      why: "A dump truck reversing into a work area has a blind zone behind it the driver cannot see into, and the rule that nobody backs up without a spotter is there for exactly the person kneeling behind a bin. The air horn is the agreed stop signal everyone on the site knows, and it stops the truck now; the spotter and the backing plan come after.",
      missNote: "The truck kept reversing until the second laborer heard the backup alarm and scrambled clear; the tailgate caught the bin's corner and shoved it off its liner onto the unlined ground.",
      wrongNote: "The air horn — the agreed stop signal; stop the truck first, then get a spotter on it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRHG_ACCENT);

    // ------------------------------------------------- shoreline and water
    const flat = box(g, 14, 0.03, 8.6, 0, 0.015, -0.6, 0xffffff, { rough: 0.98, cast: false });
    flat.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3e3a33", base2: "#322f29" }), { repeat: 4, px: 512 }), { rough: 0.98, color: 0xc8c0b0 });
    const water = box(g, 18, 0.02, 8, 0, 0.004, -9.2, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#152629", mid: "#1a2f33" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8ea6aa });

    // ------------------------------------------------- the cofferdam cell
    const cell = group(g, -0.6, 0, -2.6);
    const sheet = (cx, w, h) => {
      cx.fillStyle = "#5a5048"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) { cx.fillStyle = i % 2 ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.08)"; cx.fillRect((i * w) / 16, 0, w / 16, h); }
      cx.fillStyle = "rgba(120,70,30,0.35)"; cx.fillRect(0, h * 0.7, w, h * 0.3);
    };
    const sheetMat = texturedMat(surfaceTexture(sheet, { repeat: 2, px: 256 }), { rough: 0.7, metal: 0.4, color: 0xd0c8c0 });
    for (const [w, d, x, z] of [[3.6, 0.1, 0, -1.2], [3.6, 0.1, 0, 1.2], [0.1, 2.4, -1.8, 0], [0.1, 2.4, 1.8, 0]]) {
      const s = box(cell, w, 0.8, d, x, 0.4, z, 0xffffff);
      s.material = sheetMat;
    }
    const floor = box(cell, 3.5, 0.03, 2.3, 0, 0.03, 0, 0xffffff, { cast: false });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#2a2620", base2: "#221f1a", pools: 9 }), { repeat: 2, px: 256 }), { rough: 0.98, color: 0xb0a898 });
    const cutFace = box(cell, 1.6, 0.25, 1.0, -0.4, 0.14, -0.3, 0x3a3228, { rough: 0.95 });
    const beads = group(cell, -0.2, 0.28, -0.1);
    for (let i = 0; i < 5; i++) ball(beads, 0.025, (i - 2) * 0.07, 0, (i % 2) * 0.05, 0xd8dde2, { rough: 0.05, metal: 0.95, seg: 8, seg2: 6 });
    beads.visible = false;
    const powder = box(cell, 0.5, 0.02, 0.24, -0.2, 0.28, -0.08, 0x9a9488, { rough: 0.95 });
    powder.visible = false;
    // Stakes and flags.
    const stakes = {};
    for (const [id, x, z, colour] of [["stake-sw", -1.2, 0.8, 0xc0a0d8], ["stake-se", 1.0, 0.8, 0xc0a0d8], ["stake-nw", -1.2, -0.9, 0xc0a0d8]]) {
      const st = group(cell, x, 0, z);
      cyl(st, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x8a6a4a, { rough: 0.9, seg: 6 });
      box(st, 0.14, 0.09, 0.005, 0.07, 0.84, 0, colour, { rough: 0.8 });
      stakes[id] = st;
    }
    const fallen = group(cell, 1.05, 0.05, -0.95);
    const fallenStake = cyl(fallen, 0.02, 0.02, 0.9, 0, 0, 0, 0x8a6a4a, { rough: 0.9, seg: 6, emissive: 0x2a1406, ei: 0.4 });
    fallenStake.rotation.z = Math.PI / 2;
    reg(hits, fallen, "stake-missing");
    const wrongFlag = group(cell, 1.0, 0, 0.0);
    cyl(wrongFlag, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x8a6a4a, { rough: 0.9, seg: 6 });
    const wrongCloth = box(wrongFlag, 0.14, 0.09, 0.005, 0.07, 0.84, 0, 0x2f8a4a, { rough: 0.8 });
    reg(hits, wrongFlag, "flag-wrong");
    holoTag(cell, "hotspot cell — cofferdam", 0, 1.35, -1.2, { css: "#c0a0d8", w: 0.44 });
    // Hazards in and by the cell.
    const cutHit = box(cell, 0.6, 0.5, 0.5, 0.5, 0.35, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cell, "step into the cut for the sample?", 0.5, 0.75, 0.3, { css: "#e8622a", w: 0.56 });
    reg(hits, cutHit, "into-the-cut");
    const sideHit = box(g, 0.6, 0.4, 0.6, 2.0, 0.25, -3.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "side-cast on the bare ground?", 2.0, 0.6, -3.9, { css: "#e8622a", w: 0.5 });
    reg(hits, sideHit, "side-cast");

    // ------------------------------------------- excavator and dump truck
    const exc = excavator(g, -6.0, 0, -4.4, { ry: Math.PI / 2 });
    const { house, bucket } = exc.userData.parts;
    house.rotation.y = 0.2;
    holoTag(g, "excavator — IUOE Local 3", -6.0, 5.4, -4.4, { css: "#c0a0d8", w: 0.46 });
    const truck = dumpTruck(g, 6.9, 0, -3.4, { ry: Math.PI / 2 });
    const { tailgate } = truck.userData.parts;
    const truckHome = truck.position.x;
    holoTag(g, "dump truck — general fill", 6.9, 3.7, -3.4, { css: "#c0a0d8", w: 0.46 });

    // ---------------------------------------------- the lined roll-off bin
    const bin = group(g, 2.4, 0, -1.4, -0.2);
    box(bin, 1.2, 0.08, 2.0, 0, 0.1, 0, 0x3a4a5a, { rough: 0.6, metal: 0.4 });
    for (const [w, d, x, z] of [[1.2, 0.06, 0, -1.0], [1.2, 0.06, 0, 1.0], [0.06, 2.0, -0.6, 0], [0.06, 2.0, 0.6, 0]]) box(bin, w, 0.9, d, x, 0.55, z, 0x3a4a5a, { rough: 0.6, metal: 0.4 });
    const binSocket = group(bin, 0, 0.9, 0);
    hits["rolloff-bin"] = binSocket;
    const binLinerIn = box(bin, 1.1, 0.02, 1.9, 0, 1.0, 0, 0x1a1c1e, { rough: 0.55 });
    binLinerIn.visible = false;
    const binCover = box(bin, 1.24, 0.03, 2.04, 0, 1.02, 0, 0x2f6f3a, { rough: 0.8 });
    binCover.visible = false;
    holoTag(bin, "hotspot roll-off bin", 0, 1.4, 0, { css: "#c0a0d8", w: 0.38 });
    const liner = group(g, 1.4, 0, 0.5);
    box(liner, 0.7, 0.24, 0.24, 0, 0.12, 0, 0x1a1c1e, { rough: 0.55 });
    holoTag(liner, "bin liner roll", 0, 0.45, 0, { css: "#c0a0d8", w: 0.26 });
    reg(hits, liner, "bin-liner");
    const coverRoll = group(g, 3.3, 0, -0.1);
    box(coverRoll, 0.3, 0.2, 0.5, 0, 0.1, 0, 0x2f6f3a, { rough: 0.8 });
    holoTag(coverRoll, "bin cover", 0, 0.4, 0, { css: "#c0a0d8", w: 0.2 });
    reg(hits, coverRoll, "bin-cover");
    const markSign = decal(bin, 0.4, 0.4, 0.62, 0.6, 0.3, (cx, w, h) => { cx.fillStyle = "#f2e8d0"; cx.fillRect(0, 0, w, h); cx.strokeStyle = "#1b1e22"; cx.lineWidth = 6; cx.strokeRect(8, 8, w - 16, h - 16); cx.fillStyle = "#1b1e22"; cx.font = `700 ${Math.round(h * 0.16)}px Arial`; cx.textAlign = "center"; cx.fillText("MARKING", w / 2, h * 0.45); cx.fillText("PENDING", w / 2, h * 0.65); }, { px: 128 });
    markSign.rotation.y = Math.PI / 2;
    reg(hits, markSign, "bin-mark");
    const binRecord = decal(g, 0.2, 0.26, 3.4, 1.0, 0.7, paperFace("BIN RECORD", ["Bin: —", "Cells: —", "Category: hotspot"], { bg: "#f2efe6", band: "#c0a0d8" }), { px: 160 });
    binRecord.rotation.y = -0.8;
    box(g, 0.25, 0.85, 0.25, 3.5, 0.43, 0.6, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    reg(hits, binRecord, "bin-record");

    // ---------------------------------------- analyser, mist, kit, horn
    const hg = group(g, -2.1, 0, -0.7, 0.3);
    cyl(hg, 0.025, 0.025, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(hg, 0.26, 0.16, 0.14, 0, 1.25, 0, 0xe8edf1, { rough: 0.5 });
    const hgScreen = decal(hg, 0.2, 0.08, 0, 1.27, 0.075, signFace("Hg —", { bg: "#0d1c24", accent: "#c0a0d8", fg: "#efe6ff", scale: 0.5 }), { px: 160, glow: true, ei: 0.8 });
    const hgLamp = ball(hg, 0.03, 0.1, 1.38, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(hg, "mercury vapour analyser", 0, 1.55, 0, { css: "#c0a0d8", w: 0.42 });
    reg(hits, hgScreen, "hg-analyser");
    const mist = group(g, -2.6, 0, -1.9);
    cyl(mist, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x5b6771, { rough: 0.45, metal: 0.6, seg: 8 });
    const mistValve = group(mist, 0, 0.8, 0.06);
    box(mistValve, 0.18, 0.03, 0.03, 0, 0, 0, 0x2f6fb8, { rough: 0.5 });
    holoTag(mist, "misting valve", 0, 1.15, 0, { css: "#c0a0d8", w: 0.28 });
    reg(hits, mistValve, "misting-valve");
    const mistSheet = box(g, 1.6, 0.4, 0.02, -1.0, 0.5, -2.95, 0xdfeef6, { rough: 0.2, opacity: 0.25, transparent: true, cast: false });
    mistSheet.visible = false;
    const kit = group(g, -1.3, 0, 0.3, 0.2);
    box(kit, 0.5, 0.36, 0.34, 0, 0.18, 0, 0xf06a2b, { rough: 0.6 });
    decal(kit, 0.4, 0.12, 0, 0.26, 0.175, signFace("MERCURY SPILL KIT", { bg: "#f2f2ee", accent: "#f06a2b", fg: "#1b1e22", scale: 0.42 }), { px: 192 });
    holoTag(kit, "mercury spill kit", 0, 0.58, 0, { css: "#c0a0d8", w: 0.32 });
    reg(hits, kit, "mercury-kit");
    const vac = group(g, -0.3, 0, 0.9);
    cyl(vac, 0.16, 0.16, 0.4, 0, 0.2, 0, 0x2b3138, { rough: 0.5, seg: 12 });
    const vacHit = box(vac, 0.4, 0.5, 0.4, 0, 0.25, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(vac, "shop-vac the beads?", 0, 0.62, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, vacHit, "vacuum-beads");
    const horn = group(g, 1.3, 0, 1.0);
    cyl(horn, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    cyl(horn, 0.05, 0.09, 0.16, 0, 1.08, 0.05, 0xd2312b, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(horn, "air horn", 0, 1.3, 0, { css: "#c0a0d8", w: 0.2 });
    reg(hits, horn, "air-horn");

    // Cut paddle and confirmation scoop at the cell edge.
    const call = group(g, 0.7, 0, -0.9);
    cyl(call, 0.03, 0.035, 0.9, 0, 0.45, 0, 0x4a4538, { rough: 0.5, metal: 0.5, seg: 10 });
    const paddle = group(call, 0, 0.92, 0);
    box(paddle, 0.3, 0.05, 0.05, 0, 0.1, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(call, "cut call", 0, 1.25, 0, { css: "#c0a0d8", w: 0.2 });
    reg(hits, paddle, "cut-paddle");
    const scoop = group(g, -0.2, 0, -1.1, 0.4);
    cyl(scoop, 0.015, 0.015, 1.6, 0, 0.5, -0.4, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6 }).rotation.x = 0.9;
    const scoopJar = cyl(scoop, 0.04, 0.04, 0.1, 0.15, 0.85, 0, 0xe6ecef, { rough: 0.2, seg: 10 });
    holoTag(scoop, "long-handled scoop", 0, 1.1, 0, { css: "#c0a0d8", w: 0.34 });
    reg(hits, scoop, "confirm-scoop");

    // Release scan station at the truck's way out.
    const scan = group(g, 3.9, 0, -1.9, -0.8);
    cyl(scan, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const scanScreen = decal(scan, 0.26, 0.12, 0, 1.05, 0.02, signFace("RELEASE SCAN", { bg: "#0d1c24", accent: "#c0a0d8", fg: "#efe6ff", scale: 0.4 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(scan, "truck release scan", 0, 1.3, 0, { css: "#c0a0d8", w: 0.34 });
    reg(hits, scanScreen, "release-scan");

    // Close-out faults: stockpile cover and boot wash.
    const pile = group(g, -3.6, 0, -3.2);
    box(pile, 1.2, 0.5, 0.9, 0, 0.25, 0, 0x2f6f3a, { rough: 0.8 });
    const tear = box(pile, 0.3, 0.12, 0.02, 0.2, 0.4, 0.46, 0x5a4a38, { rough: 0.95, emissive: 0x2a1406, ei: 0.35 });
    reg(hits, tear, "cover-torn");
    holoTag(pile, "general-fill stockpile", 0, 0.8, 0, { css: "#c0a0d8", w: 0.38 });

    // ------------------------------------------------------- decon line
    const decon = group(g, -2.4, 0, 1.5, 0.3);
    box(decon, 1.8, 0.02, 0.6, 0, 0.02, 0, 0xf2c14b, { rough: 0.8 });
    const tub = cyl(decon, 0.26, 0.26, 0.2, -0.6, 0.1, 0, 0x2f6fb8, { rough: 0.6, seg: 12 });
    void tub;
    const tubWater = cyl(decon, 0.25, 0.25, 0.02, -0.6, 0.21, 0, 0x5a6a5a, { rough: 0.2, emissive: 0x1a2a10, ei: 0.3, seg: 12 });
    reg(hits, tubWater, "wash-overflow");
    for (const [id, x, colour, label] of [["doff-outer-gloves", -0.1, 0xd2312b, "GLOVE DROP"], ["doff-coverall", 0.35, 0xe8edf1, "SUIT BAG"], ["doff-respirator", 0.8, 0x2b3138, "CLEAN END"]]) {
      const it = group(decon, x, 0, 0);
      box(it, 0.26, 0.5, 0.26, 0, 0.25, 0, colour, { rough: 0.7 });
      decal(it, 0.22, 0.08, 0, 0.42, 0.135, signFace(label, { bg: "#0d1c24", accent: "#c0a0d8", scale: 0.45 }), { px: 128 });
      reg(hits, it, id);
    }
    holoTag(decon, "decon line", 0, 0.8, 0, { css: "#c0a0d8", w: 0.24 });

    // ----------------------------------------------- PPE, boards, radio
    const ppe = group(g, 2.7, 0, 1.6, -0.6);
    box(ppe, 0.9, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(ppe, 0.8, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-coverall", -0.28, 0xe8edf1, "COVERALL"], ["ppe-gloves", 0, 0x2f7a4a, "GLOVES"], ["ppe-respirator", 0.28, 0x2b3138, "RESPIRATOR"]]) {
      const it = group(ppe, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#0d1c24", accent: "#c0a0d8", scale: 0.45 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const maskHit = box(g, 0.4, 0.4, 0.4, 0.3, 1.5, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull the mask down to shout?", 0.3, 1.8, -1.3, { css: "#e8622a", w: 0.5 });
    reg(hits, maskHit, "mask-down-to-talk");
    const plan = decal(g, 0.56, 0.4, -0.9, 1.25, 1.9, paperFace("WORK PLAN — HOTSPOT H-2", ["Limits: the survey's stakes, hotspot flags", "Depth: per the plan, confirm by sample", "Bins: hotspot bin, lined, marked", "Air: action levels per the safety plan", "Release: scan, then out of the zone"], { bg: "#f0ebf4", band: "#c0a0d8" }), { px: 320 });
    plan.rotation.y = 0.25;
    cyl(g, 0.03, 0.035, 1.0, -0.9, 0.5, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, plan, "hotspot-plan");
    const logBoard = decal(g, 0.46, 0.34, 1.0, 1.2, 2.2, paperFace("HOTSPOT LOG", ["Air: —", "Cuts: —", "Bin: —", "Remarks: —"], { bg: "#f0ebf4", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.2;
    cyl(g, 0.03, 0.035, 1.0, 1.0, 0.5, 2.18, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "hotspot-log");
    const radioPost = group(g, 0.0, 0, 2.3);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#c0a0d8", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    const laborer = standingFigure(g, 3.3, -3.0, { ry: 2.4, cloth: 0xe8edf1, vest: 0xf2c14b, gloves: true, respirator: true });
    holoTag(laborer, "second laborer", 0, 1.95, 0, { css: "#c0a0d8", w: 0.3 });

    const waterTex = water.material.map;
    let swing = 0, grounded = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 0.6, -2.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "stake-walk") { fallen.rotation.z = 0; fallenStake.rotation.z = 0; fallenStake.position.y = 0.4; wrongCloth.material = mat(0xc0a0d8, { rough: 0.8 }); }
        if (step.id === "line-bin") { liner.visible = false; binLinerIn.visible = true; }
        if (step.id === "mist-on") mistSheet.visible = true;
        if (step.id === "thin-cuts") cutFace.scale.y = 0.5;
        if (step.id === "confirm-sample") scoopJar.material = mat(0x5a4a38, { rough: 0.6 });
        if (step.id === "close-bin") { binCover.visible = true; coverRoll.visible = false; repaint(markSign, (cx, w, h) => { cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, h); cx.strokeStyle = "#1b1e22"; cx.lineWidth = 6; cx.strokeRect(8, 8, w - 16, h - 16); cx.fillStyle = "#1b1e22"; cx.font = `700 ${Math.round(h * 0.15)}px Arial`; cx.textAlign = "center"; cx.fillText("MARKED", w / 2, h * 0.45); cx.fillText("PER RULE", w / 2, h * 0.65); }); }
        if (step.id === "release-scan") repaint(scanScreen, signFace("RELEASED", { bg: "#0d1c24", accent: "#59c97b", fg: "#efe6ff", scale: 0.42 }));
        if (step.id === "cell-walk") { tear.visible = false; tubWater.position.y = 0.12; }
        if (step.id === "hotspot-log") repaint(logBoard, paperFace("HOTSPOT LOG", ["Air: baseline · beads · cleared", "Cuts: to the stakes · sampled", "Bin: covered · marked · recorded", "Truck stopped · scanned · doffed"], { bg: "#f0ebf4", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "mercury-beads") {
          beads.visible = true;
          hgLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 });
          repaint(hgScreen, signFace("Hg RISING", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffdada", scale: 0.5 }));
        }
        if (it.id === "truck-backing-blind") truck.position.x = truckHome - 1.0;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "mercury-beads") {
          grounded = true; beads.visible = false; powder.visible = true;
          hgLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.2 });
          repaint(hgScreen, signFace("Hg FALLING", { bg: "#0d1c24", accent: "#f2ae14", fg: "#efe6ff", scale: 0.5 }));
        }
        if (it.id === "truck-backing-blind") { truck.position.x = truckHome - 0.6; if (tailgate) tailgate.rotation.x = 0.05; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.005; waterTex.offset.y = t * 0.002; }
        if (session?.turn && step?.id === "mist-on") mistValve.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "thin-cuts" && !grounded) {
          swing += dt * (0.4 + (session.track?.v ?? 0) * 0.8);
          house.rotation.y = 0.2 - (Math.sin(swing) * 0.5 + 0.5) * 0.5;
          if (bucket) bucket.rotation.x = Math.sin(swing * 2) * 0.25;
          paddle.rotation.z = -(session.track?.v ?? 0) * 1.2;
        }
        if (mistSheet.visible) mistSheet.position.y = 0.5 + Math.sin(t * 2) * 0.03;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "vapour-baseline") repaint(hgScreen, signFace(gg.t < 0.4 ? "ZEROING" : gg.t <= 0.58 ? "BASELINE" : "AT FACE", { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#efe6ff", scale: 0.5 }));
      },
    };
  },
};
