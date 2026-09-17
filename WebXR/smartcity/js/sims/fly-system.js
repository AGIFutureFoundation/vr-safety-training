import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, hose, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fly System VR — Entertainment & Live Events, station four.
// Loading a counterweight lineset in a theatre: the rail locked and the
// deck cleared before the batten moves, fixtures hung and safetied, the
// loader clipped in on the bridge, bricks to match the pipe one at a time
// with spreader plates and a lock ring, a test lift that feels for balance,
// trim set, and the rail locked, clamped and tagged before anyone walks.

const FS_ACCENT = 0xa079ff;

export const SIM_FLY_SYSTEM = {
  id: "fly-system",
  index: "40",
  domain: "Entertainment & Live Events",
  trade: "Theatrical rigger / fly operator",
  category: "Entertainment & Live Events",
  certification: "IATSE — ETCP Certified Rigger (Theatre); ANSI E1.4-1 manual counterweight rigging systems; OSHA 29 CFR 1910.28 fall protection on the loading bridge; venue 'heads up' and lineset-tagging procedure",
  name: "Fly System",
  title: simTitle("Fly System"),
  tagline: "Counterweight lineset load: rail locked, deck cleared with a call, batten in, fixtures hung and safetied, loader clipped in on the bridge, bricks to match the pipe with spreaders and a lock ring, balanced test lift, trim, lock, clamp, tag",
  accent: FS_ACCENT,
  accentCss: "#a079ff",
  parSeconds: 260,
  footprint: 2.6,
  badge: { id: "in-balance", name: "In Balance", note: "A lineset loaded to the pipe, spreadered and ringed, test-lifted in balance and tagged — first time" },

  game: system({
    name: "Fly Crew",
    currency: "BRICK",
    ranks: ["Deckhand", "Loader", "Fly Operator", "Head Flyman", "Fly Crew Certified"],
    badges: [
      { id: "heads-up", name: "Heads Up", note: "Rail locked and the deck called clear before the batten moved, first time", test: AWARD.stepClean("clear") },
      { id: "never-runaway", name: "Never a Runaway", note: "Never unlocked out of balance, never on the bridge unclipped, never under a moving pipe", test: AWARD.safe },
      { id: "to-the-brick", name: "To the Brick", note: "Arbor loaded and trim set inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-hang", name: "Clean Hang", note: "No corrections anywhere on the lineset", test: AWARD.clean },
      { id: "hand-over-hand", name: "Hand Over Hand", note: "Both fly moves held steady the whole way", test: AWARD.unbroken },
      { id: "hang-fast", name: "Hung In Time", note: "Lineset loaded and tagged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unlock-unbalanced": "You released the rope lock with the batten loaded and the arbor light. A pipe-heavy lineset runs away to the deck, the arbor flies to the loft, and the purchase line takes the hands off whoever is holding it. The lock stays on until the arbor matches the pipe.",
    "bridge-unclipped": "You stepped onto the loading bridge without clipping in. It is a forty-foot drop to the deck through a gap the width of an arbor, and the bricks you are handling weigh more than the harness.",
    "under-batten": "You walked under a batten that was moving. Everything on a moving pipe — a fixture, a safety cable, a wrench — lands on the deck under it; the stage is called clear and stays clear until the pipe stops.",
    "toss-brick": "You tossed a brick to the bridge instead of handing it. A counterweight brick is twenty pounds of steel; dropped from the bridge it goes through the deck, and through whoever is on it.",
  },

  lateNotes: {
    "purchase-line": "The batten moves only after the rail is locked off, the deck is called clear, and the operator is on the rail.",
    "purchase-test": "The test lift comes after the arbor is loaded to the pipe, spreadered and ringed — an unbalanced test is the runaway.",
    "trim-mark": "Trim is set after the test lift proves the lineset is in balance.",
  },

  steps: [
    {
      id: "schedule", kind: "select", target: "hang-schedule",
      title: "Read the hang schedule",
      cue: "Check lineset 12: the fixtures, the batten load and the arbor capacity.",
      why: "The schedule says what goes on the pipe and what that weighs; the arbor is loaded to that number, not to how the rope feels.",
    },
    {
      id: "lock", kind: "select", target: "rope-lock",
      title: "Lock the rail",
      cue: "Set the rope lock on lineset 12 and put the operator on the rail.",
      why: "Nothing is hung on a pipe that can move. The lock holds the lineset while it goes out of balance during loading; the operator is the second lock.",
    },
    {
      id: "clear", kind: "sequence", anyOrder: true,
      targets: ["call-heads-up", "clear-deck"],
      itemNames: { "call-heads-up": "'heads up' call", "clear-deck": "deck clear under the batten" },
      title: "Call and clear the deck",
      cue: "'Heads up, lineset 12 coming in' — loud, and wait for the deck under the batten to clear.",
      why: "The call is the only warning a stage has. Nobody stands under a pipe that is about to move, and the fly operator does not move it until the deck answers.",
    },
    {
      id: "batten-in", kind: "track", target: "purchase-line", seconds: 6,
      title: "Bring the batten in",
      cue: "Hand over hand on the purchase line, steady, until the batten is at working height on the deck.",
      why: "Steady hand-over-hand keeps the lineset under control and the arbor from bouncing in its guides. A fast fly is a fly that gets away.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "FLY IN", readout: (v) => (v < 0.4 ? "stalled" : v > 0.6 ? "too fast" : "steady") },
      holdBreakNote: "Speed out of band — the arbor is bouncing. Settle the line and hold.",
    },
    {
      id: "hang", kind: "sequence",
      targets: ["attach-fixtures", "safety-cables", "cable-pick"],
      itemNames: { "attach-fixtures": "fixtures clamped", "safety-cables": "safety cables", "cable-pick": "cable pick tied off" },
      title: "Hang and safety the fixtures",
      cue: "Clamp each fixture to the pipe, safety-cable every one, then tie off the cable pick.",
      why: "A clamp holds a fixture until it does not; the safety cable is what holds it then. Cable ties come last so nothing is left hanging when the pipe flies.",
      outOfOrderNote: "Clamp, then safety, then tie off — every fixture is safetied before the cable is dressed.",
    },
    {
      id: "bridge", kind: "sequence", anyOrder: true,
      targets: ["harness-clip", "bridge-gate"],
      itemNames: { "harness-clip": "harness clipped to the bridge line", "bridge-gate": "bridge gate closed" },
      title: "Clip in on the loading bridge",
      cue: "Clip the harness to the bridge tie-off line and close the gate before touching a brick.",
      why: "The loading bridge is a catwalk over the arbor pit forty feet up with an open side to load through. The tie-off is what keeps a loader who leans out on the bridge.",
    },
    {
      id: "load", kind: "gauge", target: "arbor-scale",
      title: "Load the arbor to the pipe",
      cue: "Hand bricks onto the arbor one at a time until the arbor weight matches the batten load — commit inside the band.",
      why: "The arbor balances the pipe plus what is on it. Light, the pipe runs to the deck; heavy, the arbor runs to the loft. The number on the schedule is the number in the arbor.",
      gauge: { label: "ARBOR vs PIPE", speed: 0.7, green: [0.48, 0.6], readout: (t) => `${Math.round(t * 600)} lb`, missNote: "Out of balance — add or remove a brick and read it again." },
    },
    {
      id: "spread", kind: "sequence",
      targets: ["spreader-plates", "lock-ring"],
      itemNames: { "spreader-plates": "spreader plates", "lock-ring": "lock ring" },
      title: "Spreader plates and lock ring",
      cue: "A spreader plate every two feet of bricks, then the lock ring cinched at the top.",
      why: "Spreaders keep the arbor rods from bowing under a stack; the ring keeps the stack from jumping the rods if the arbor stops hard. No ring, and the bricks leave the arbor on a runaway.",
      outOfOrderNote: "Spreaders through the stack first, then the ring on top.",
    },
    {
      id: "test", kind: "track", target: "purchase-test", seconds: 6,
      title: "Test lift",
      cue: "Release the lock with a hand on the line, lift the batten a foot, and feel for balance — steady.",
      why: "The test lift is the only proof of balance. A hand on the line feels a heavy pipe or a heavy arbor before it becomes a runaway; a foot of travel is enough to know.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "TEST LIFT", readout: (v) => (v < 0.4 ? "pipe heavy" : v > 0.6 ? "arbor heavy" : "in balance") },
      holdBreakNote: "The line is pulling — out of balance. Lock it and correct the arbor.",
    },
    {
      id: "trim", kind: "gauge", target: "trim-mark",
      title: "Fly to trim",
      cue: "Fly the batten out to the trim height on the plot and commit inside the band.",
      why: "Trim is where the designer wants the light. It is set once, marked on the purchase line, and the clamp holds it for the run.",
      gauge: { label: "TRIM", speed: 0.75, green: [0.5, 0.64], readout: (t) => `${(t * 40).toFixed(1)} ft`, missNote: "Off trim — fly to the mark on the plot." },
    },
    {
      id: "tieoff", kind: "sequence",
      targets: ["rope-lock-close", "trim-clamp", "tag-loaded"],
      itemNames: { "rope-lock-close": "rope lock", "trim-clamp": "trim clamp", "tag-loaded": "lineset tag" },
      title: "Lock, clamp, tag",
      cue: "Lock the rope lock, set the trim clamp, and tag lineset 12 as loaded with the weight.",
      why: "The tag tells the next crew what is on the pipe and in the arbor; the clamp holds trim; the lock holds everything. Nobody leaves an untagged lineset.",
      outOfOrderNote: "Lock, then clamp, then tag — the lineset is held before it is labelled.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["brick-unseated"],
      itemNames: { "brick-unseated": "brick outside the rods" },
      itemNotes: { "brick-unseated": "One brick is sitting on the stack outside the arbor rods — it is not held by the ring and will leave the arbor on the first hard stop." },
      title: "Walk the arbor before you leave the bridge",
      cue: "Look down the stack — every brick on the rods, spreaders in, ring tight — and click what is wrong.",
      why: "The arbor is checked from the bridge before the loader unclips. A brick outside the rods is found now or on the deck.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, FS_ACCENT);
    box(g, 6.0, 0.1, 5.4, 0, 0.05, 0, 0x2b2622, { rough: 0.95 });
    // Stage-left wall with the locking rail, the arbor guide track and the loading bridge high above.
    const wall = group(g, -2.6, 0.1, 0);
    box(wall, 0.2, 4.4, 5.0, 0, 2.2, 0, 0x2f2a2a, { rough: 0.9 });
    // Arbor: two guide rods, a frame, a stack of bricks that grows with the gauge.
    const arbor = group(wall, 0.35, 0.2, -0.6);
    for (const sz of [-0.12, 0.12]) cyl(arbor, 0.015, 0.015, 4.0, 0, 2.0, sz, 0x8b98a5, { rough: 0.4, metal: 0.8, seg: 8 });
    const carriage = group(arbor, 0, 1.2, 0);
    box(carriage, 0.14, 0.06, 0.34, 0, 0, 0, 0x1b1e23, { rough: 0.6, metal: 0.5 });
    box(carriage, 0.14, 0.06, 0.34, 0, 1.3, 0, 0x1b1e23, { rough: 0.6, metal: 0.5 });
    for (const sz of [-0.15, 0.15]) cyl(carriage, 0.012, 0.012, 1.3, 0, 0.65, sz, 0x1b1e23, { rough: 0.5, metal: 0.7, seg: 8 });
    const bricks = [];
    for (let i = 0; i < 10; i++) { const b = box(carriage, 0.12, 0.09, 0.3, 0, 0.08 + i * 0.1, 0, 0x4a5561, { rough: 0.7, metal: 0.5 }); b.visible = i < 2; bricks.push(b); }
    const spreaders = [];
    for (let i = 0; i < 2; i++) { const s = box(carriage, 0.13, 0.015, 0.32, 0, 0.53 + i * 0.4, 0, 0xf2c14b, { rough: 0.6, metal: 0.5 }); s.visible = false; spreaders.push(s); }
    const ring = box(carriage, 0.14, 0.03, 0.34, 0, 1.12, 0, 0xd2312b, { rough: 0.5, metal: 0.6 }); ring.visible = false;
    const unseated = box(carriage, 0.12, 0.09, 0.3, 0.16, 1.02, 0, 0x4a5561, { rough: 0.7, metal: 0.5 }); unseated.visible = false;
    reg(hits, unseated, "brick-unseated");
    holoTag(arbor, "arbor — lineset 12", 0.3, 0.9, 0, { css: "#a079ff", w: 0.34 });
    // Locking rail at deck level: rope lock, trim clamp, tag, purchase line loop.
    const rail = group(wall, 0.6, 0, 1.0);
    box(rail, 0.12, 1.0, 1.6, 0, 0.5, 0, 0x3a3535, { rough: 0.8 });
    const ropeLock = box(rail, 0.16, 0.18, 0.12, 0.1, 1.0, -0.4, 0xd2312b, { rough: 0.5, metal: 0.4 });
    holoTag(rail, "rope lock", 0.1, 1.25, -0.4, { css: "#a079ff", w: 0.2 });
    reg(hits, ropeLock, "rope-lock");
    const ropeLockClose = box(rail, 0.16, 0.18, 0.12, 0.1, 1.0, -0.1, 0xd2312b, { rough: 0.5, metal: 0.4 });
    holoTag(rail, "lock (after trim)", 0.1, 1.25, -0.1, { css: "#a079ff", w: 0.3 });
    reg(hits, ropeLockClose, "rope-lock-close");
    const clamp = box(rail, 0.14, 0.1, 0.1, 0.1, 0.8, 0.2, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    holoTag(rail, "trim clamp", 0.1, 0.6, 0.2, { css: "#a079ff", w: 0.22 });
    reg(hits, clamp, "trim-clamp");
    const tag = box(rail, 0.02, 0.12, 0.08, 0.1, 1.0, 0.5, 0xffe9a8, { rough: 0.8 });
    holoTag(rail, "lineset tag", 0.1, 1.2, 0.5, { css: "#a079ff", w: 0.22 });
    reg(hits, tag, "tag-loaded");
    const purchase = hose(g, [[-1.9, 0.3, 0.4], [-1.9, 1.6, 0.4], [-1.95, 3.9, -0.2], [-2.2, 4.1, -0.6]], 0.016, 0xd9dde2, { steps: 20, rough: 0.8 });
    const purchaseHit = cyl(g, 0.05, 0.05, 1.2, -1.9, 1.0, 0.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false, seg: 8 });
    holoTag(g, "purchase line — fly in", -1.9, 1.75, 0.4, { css: "#a079ff", w: 0.4 });
    reg(hits, purchaseHit, "purchase-line");
    const purchaseTest = cyl(g, 0.05, 0.05, 0.6, -1.9, 2.1, 0.4, 0xffffff, { opacity: 0.001, transparent: true, cast: false, seg: 8 });
    holoTag(g, "test lift", -1.9, 2.5, 0.4, { css: "#a079ff", w: 0.18 });
    reg(hits, purchaseTest, "purchase-test");
    const unlockBad = box(rail, 0.2, 0.2, 0.2, 0.15, 1.35, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rail, "unlock now?", 0.15, 1.55, -0.7, { css: "#d2312b", w: 0.24 });
    reg(hits, unlockBad, "unlock-unbalanced");
    const trim = instrument(rail, 0.15, 1.02, 0.85, { idle: "-- ft", color: 0xa079ff, w: 0.12, d: 0.18, ry: Math.PI / 2 });
    holoTag(rail, "trim mark", 0.15, 1.25, 0.85, { css: "#a079ff", w: 0.2 });
    reg(hits, trim, "trim-mark");
    // Loading bridge high on the wall: platform, tie-off line, gate, bricks cart, scale readout.
    const bridge = group(wall, 0.55, 3.2, -0.6);
    box(bridge, 0.7, 0.06, 2.0, 0.35, 0, 0, 0x4a4a4a, { rough: 0.8, metal: 0.3 });
    for (const z of [-0.95, 0.95]) cyl(bridge, 0.02, 0.02, 1.0, 0.68, 0.5, z, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    box(bridge, 0.02, 0.02, 2.0, 0.68, 1.0, 0, 0x8b98a5, { rough: 0.5, metal: 0.6 });
    const tieLine = box(bridge, 0.02, 0.02, 2.0, 0.2, 1.6, 0, 0xf2c14b, { rough: 0.6, metal: 0.4 });
    holoTag(bridge, "bridge tie-off line", 0.2, 1.8, 0, { css: "#f2c14b", w: 0.36 });
    reg(hits, tieLine, "harness-clip");
    const gate = box(bridge, 0.02, 0.9, 0.5, 0.68, 0.5, -1.2, 0xd2312b, { rough: 0.6, metal: 0.4 });
    holoTag(bridge, "bridge gate", 0.68, 1.1, -1.2, { css: "#a079ff", w: 0.22 });
    reg(hits, gate, "bridge-gate");
    const unclipped = box(bridge, 0.5, 1.2, 0.5, 0.35, 0.7, 0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bridge, "step out unclipped?", 0.35, 1.4, 0.75, { css: "#d2312b", w: 0.36 });
    reg(hits, unclipped, "bridge-unclipped");
    const cart = box(bridge, 0.4, 0.4, 0.5, 0.35, 0.23, 0.4, 0x2b2f34, { rough: 0.7 });
    for (let i = 0; i < 4; i++) box(bridge, 0.12, 0.09, 0.3, 0.3 + (i % 2) * 0.13, 0.48 + Math.floor(i / 2) * 0.1, 0.4, 0x4a5561, { rough: 0.7, metal: 0.5 });
    const scale = instrument(bridge, 0.35, 0.06, -0.55, { idle: "-- lb", color: 0xa079ff, w: 0.13, d: 0.2 });
    holoTag(bridge, "arbor scale", 0.35, 0.3, -0.55, { css: "#a079ff", w: 0.24 });
    reg(hits, scale, "arbor-scale");
    const spreaderPick = box(bridge, 0.13, 0.015, 0.32, 0.35, 0.45, -0.2, 0xf2c14b, { rough: 0.6, metal: 0.5 });
    holoTag(bridge, "spreader plates", 0.35, 0.6, -0.2, { css: "#a079ff", w: 0.3 });
    reg(hits, spreaderPick, "spreader-plates");
    const ringPick = box(bridge, 0.14, 0.03, 0.34, 0.35, 0.5, 0.05, 0xd2312b, { rough: 0.5, metal: 0.6 });
    holoTag(bridge, "lock ring", 0.35, 0.68, 0.05, { css: "#a079ff", w: 0.2 });
    reg(hits, ringPick, "lock-ring");
    const toss = box(bridge, 0.3, 0.3, 0.3, 0.9, 0.5, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bridge, "toss it up?", 0.9, 0.75, 0.4, { css: "#d2312b", w: 0.24 });
    reg(hits, toss, "toss-brick");
    void cart;
    // Batten: a pipe across the stage with lift lines to the loft; fixtures come on when hung.
    const batten = group(g, 0.4, 3.6, -0.6);
    cyl(batten, 0.025, 0.025, 4.6, 0, 0, 0, 0x1b1e23, { rough: 0.5, metal: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    for (const x of [-2.0, -0.7, 0.7, 2.0]) box(batten, 0.006, 3.0, 0.006, x, 1.5, 0, 0x8b98a5, { rough: 0.4, metal: 0.8, cast: false });
    const fixtures = [];
    for (const x of [-1.6, -0.5, 0.6, 1.7]) {
      const f = group(batten, x, -0.25, 0);
      box(f, 0.03, 0.14, 0.03, 0, 0.16, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
      cyl(f, 0.09, 0.11, 0.26, 0, 0, 0, 0x1b1e23, { rough: 0.5, metal: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
      const lens = cyl(f, 0.08, 0.08, 0.02, 0, 0, 0.14, 0xffe9a8, { emissive: 0xffe9a8, ei: 0.6, rough: 0.3, cast: false, seg: 14 });
      lens.rotation.x = Math.PI / 2;
      const safety = hose(f, [[-0.04, 0.24, 0], [0.02, 0.32, 0.04], [0.06, 0.2, 0.02]], 0.006, 0x8b98a5, { steps: 8, rough: 0.4, metal: 0.8 });
      safety.visible = false;
      f.visible = false;
      fixtures.push({ f, safety, lens });
    }
    const cablePick = hose(batten, [[-2.1, -0.05, 0], [-1.0, -0.12, 0.05], [0.4, -0.12, 0.05], [2.1, -0.05, 0]], 0.012, 0x1b1e23, { steps: 20, rough: 0.8 });
    cablePick.visible = false;
    holoTag(batten, "lineset 12 — batten", 0, 0.2, 0, { css: "#a079ff", w: 0.34 });
    const attachHit = box(batten, 4.4, 0.3, 0.3, 0, -0.2, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, attachHit, "attach-fixtures");
    const safetyHit = box(batten, 4.4, 0.2, 0.3, 0, 0.12, 0.2, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(batten, "safety cables", 1.2, 0.35, 0.2, { css: "#a079ff", w: 0.26 });
    reg(hits, safetyHit, "safety-cables");
    const pickHit = box(batten, 0.3, 0.3, 0.3, -2.2, -0.1, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(batten, "cable pick", -2.2, 0.3, 0, { css: "#a079ff", w: 0.2 });
    reg(hits, pickHit, "cable-pick");
    const underHit = slab(g, 4.6, 0.01, 0.8, 0.4, 0.11, -0.6, 0xd2312b, { rough: 0.7, opacity: 0.2, transparent: true, cast: false });
    holoTag(g, "under the pipe?", 1.8, 0.4, -0.6, { css: "#d2312b", w: 0.28 });
    reg(hits, underHit, "under-batten");
    // Deck items: hang schedule, the call spot, the fixture road cases, crew.
    const board = group(g, 1.8, 0, 1.8, -0.7);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#120d1c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#a079ff"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#e9dcff"; ctx.fillText("HANG SCHEDULE — LINESET 12", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f3ecff";
      ["4 × ellipsoidal @ 34 lb, cable 40 lb", "Batten load: 320 lb (pipe weight in arbor)", "Arbor: 20-lb bricks, capacity 1,200 lb", "Spreader every 2 ft; lock ring on top", "Loader clipped in on the bridge, gate shut", "'Heads up' before every move; deck clear", "Trim: 24 ft; tag with weight when done"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: FS_ACCENT });
    reg(hits, board, "hang-schedule");
    const caller = standingFigure(g, 1.2, 0.6, { ry: 2.6, cloth: 0x1b1e23 });
    holoTag(caller, "'heads up, lineset 12!'", 0, 1.9, 0, { css: "#a079ff", w: 0.4 });
    reg(hits, caller, "call-heads-up");
    const clearZone = slab(g, 4.6, 0.01, 1.0, 0.4, 0.105, 0.3, 0x59c97b, { rough: 0.7, opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "deck clear", 2.0, 0.35, 0.3, { css: "#59c97b", w: 0.2 });
    reg(hits, clearZone, "clear-deck");
    for (const x of [1.0, 1.7]) box(g, 0.6, 0.6, 0.6, x, 0.4, -1.9, 0x1b1e23, { rough: 0.6, metal: 0.3 });
    standingFigure(g, -1.4, 1.5, { ry: 1.2, cloth: 0x1b1e23 });

    let battenY = 3.6, targetY = 3.6, arborY = 1.2, loaded = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(-1.0, 1.4, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "batten-in") { targetY = 1.4; }
        if (step.id === "hang") { for (const fx of fixtures) { fx.f.visible = true; fx.safety.visible = true; } cablePick.visible = true; }
        if (step.id === "spread") { for (const s of spreaders) s.visible = true; ring.visible = true; }
        if (step.id === "test") { targetY = 1.7; }
        if (step.id === "trim") { targetY = 3.4; }
        if (step.id === "tieoff") unseated.visible = true;
        if (step.id === "walk") unseated.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "hang") { if (session.sequence.includes("attach-fixtures")) for (const fx of fixtures) fx.f.visible = true; if (session.sequence.includes("safety-cables")) for (const fx of fixtures) fx.safety.visible = true; }
        if (step?.id === "spread" && session.sequence.includes("spreader-plates")) for (const s of spreaders) s.visible = true;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "load") {
          loaded = gg.t; const n = Math.round(gg.t * 10);
          for (let i = 0; i < bricks.length; i++) bricks[i].visible = i < Math.max(2, n);
          repaint(scale.userData.screen, signFace(`${Math.round(gg.t * 600)} lb`, { bg: "#150f22", accent: gg.t >= 0.48 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#efe6ff", scale: 0.62 }));
        }
        if (gg && !gg.committed && step?.id === "trim") { targetY = 1.7 + gg.t * 2.2; repaint(trim.userData.screen, signFace(`${(gg.t * 40).toFixed(1)} ft`, { bg: "#150f22", accent: gg.t >= 0.5 && gg.t <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#efe6ff", scale: 0.62 })); }
        if ((step?.id === "batten-in" || step?.id === "test") && session.holding) battenY += (targetY - battenY) * Math.min(1, dt * 1.5);
        else if (step?.id === "trim" || !step || session?.finished) battenY += (targetY - battenY) * Math.min(1, dt * 1.5);
        batten.position.y = battenY;
        arborY = 1.2 + (3.6 - battenY) * 0.55;
        carriage.position.y = arborY;
        purchase.visible = true;
        for (const fx of fixtures) fx.lens.material.emissiveIntensity = 0.4 + Math.max(0, Math.sin(t * 1.3)) * 0.5;
        void loaded;
      },
    };
  },
};
