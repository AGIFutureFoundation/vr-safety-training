import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Container Lashing VR — Maritime & Ports, station two.
// Securing a tier of containers on deck before sailing: twist-locks proven
// locked, lashing rods and turnbuckles set in the pattern the ship's cargo
// securing manual calls for, a lashing bridge worked with fall protection,
// and the crane held off the bay until the lashers are clear. The container
// that slides off a ship at sea is the one that was never locked.

const CL_ACCENT = 0x4f9dde;

export const SIM_CONTAINER_LASHING = {
  id: "container-lashing",
  index: "27",
  domain: "Maritime",
  trade: "Longshore worker — lasher",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "ILWU/PMA longshore training — OSHA 29 CFR 1918 (longshoring) marine terminal safety; IMO SOLAS Chapter VI and the Cargo Securing Manual requirements approved for this ship, which is what fixes the lashing pattern for the bay; fall protection on lashing bridges",
  name: "Container Lashing",
  title: simTitle("Container Lashing"),
  tagline: "Deck stow securing: crane held off, twist-locks proven, rods and turnbuckles to the pattern, fall protection on the bridge, torque checked",
  accent: CL_ACCENT,
  accentCss: "#4f9dde",
  parSeconds: 240,
  footprint: 2.4,
  badge: { id: "stow-secured", name: "Stow Secured", note: "Every twist-lock proven, every rod to the pattern, the bridge worked tied off, the crane held until clear" },

  game: system({
    name: "Stow Authority",
    currency: "LASH",
    ranks: ["Lasher", "Lead Lasher", "Hatch Boss", "Walking Boss", "Stow Authority Certified"],
    badges: [
      { id: "locks-proven", name: "Locks Proven", note: "Every twist-lock checked before a rod went on", test: AWARD.stepClean("locks") },
      { id: "clear-of-crane", name: "Clear of the Crane", note: "Never under a suspended load, never untied on the bridge", test: AWARD.safe },
      { id: "torque-true", name: "Torque True", note: "Turnbuckles inside the manual's tension", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-bay", name: "Clean Bay", note: "No corrections anywhere in the bay", test: AWARD.clean },
      { id: "rod-steady", name: "Rod Steady", note: "Held the rod seating the full count", test: AWARD.unbroken },
      { id: "sailing-time", name: "Sailing Time", note: "Bay secured inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-load": "You walked under the spreader with a box on it. Nothing goes under a suspended container — a twist-lock that let go on the last lift is the one you find out about from underneath.",
    "untied-bridge": "You went onto the lashing bridge without clipping in. It is a narrow steel walkway three tiers up over open deck; the harness is worn, and it is clipped, or the bridge is not worked.",
    "hand-on-cone": "You put your hand on a twist-lock while the box is still coming down. Fingers between a 30-tonne container and its corner casting are gone before you feel the pinch.",
    "bent-rod": "You went to fit a lashing rod with a bent shank. A rod that is not straight does not seat in the casting and does not take the load the pattern assumes — it goes to the reject rack, not on the stack.",
    "loose-gear": "That is a twist-lock lying loose in the walkway. Gear left on the deck of a bay is what a lasher carrying a rod trips over on the way to the bridge ladder, and it is also the cone that goes over the side and through somebody's windscreen on the apron below — it goes back in the bin the moment you see it, not after the bay is finished.",
  },

  lateNotes: {
    "turnbuckle-a": "Rods first — a turnbuckle tightened on a rod that is not seated pulls the rod out of the casting.",
    "torque-gauge": "Nothing to check until the pattern is on and the turnbuckles are hand-tight.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "bay-plan",
      title: "Read the bay plan and securing pattern",
      cue: "Check the tier heights, the weights and the rod pattern the Cargo Securing Manual calls for on this bay.",
      why: "The pattern depends on the stack: how many tiers, how heavy, and where on deck the bay sits, because an outboard stack rolls through a far bigger arc than one on the centreline. The Cargo Securing Manual requirements approved for this ship decide which castings get rods and at what tension — not whichever rods and turnbuckles happen to be closest to hand, and not what worked on the last ship you lashed.",
    },
    {
      id: "crane-hold", kind: "select", target: "crane-radio",
      title: "Hold the crane off the bay",
      cue: "Radio the crane: lashers entering the bay, hold all lifts until the all-clear.",
      why: "The crane and the lashers never share a bay, because a gang on the deck cannot see a spreader coming over the stack behind them and the operator four storeys up cannot see a lasher kneeling between tiers. OSHA 29 CFR 1918 treats a suspended container over a person as a struck-by hazard whether the gang is ILWU on one coast or ILA on the other, and the hold goes on the radio before the first lasher's boot hits the deck — not once somebody is already in the bay.",
    },
    {
      id: "harness", kind: "sequence", anyOrder: true,
      targets: ["harness-on", "lanyard-clip"],
      itemNames: { "harness-on": "harness", "lanyard-clip": "lanyard clipped to the bridge line" },
      title: "Harness on, clipped to the bridge line",
      cue: "Harness worn and the lanyard clipped before a foot goes on the lashing bridge.",
      why: "The lashing bridge is a workplace three tiers up with open deck on both sides, painted steel that holds spray and diesel film, and nothing underfoot but grating. Clipped to the lifeline, a slip on wet steel is a scare and a bruise; unclipped, the same slip is a fall onto steel plating or straight into the open bay below, and the harness is worn on the walk out to the bridge rather than fitted once you are already standing on it.",
    },
    {
      id: "locks", kind: "sequence", anyOrder: true,
      targets: ["lock-a", "lock-b", "lock-c", "lock-d"],
      itemNames: { "lock-a": "fore-port lock", "lock-b": "fore-starboard lock", "lock-c": "aft-port lock", "lock-d": "aft-starboard lock" },
      title: "Prove every twist-lock",
      cue: "Check each twist-lock's handle is in the locked position — all four corners, every tier.",
      why: "A twist-lock in the unlocked position looks exactly like a locked one from a few feet away, and the painted indicator on the handle can be wrong — worn, bent by a spreader, or thrown back by the box landing on it. Four corners, checked by hand, on every tier, is the only proof there is, and it is the whole reason a lashing gang goes into the bay at all instead of the stow being signed off from the plan.",
    },
    {
      id: "rods", kind: "sequence",
      targets: ["rod-port", "rod-starboard"],
      itemNames: { "rod-port": "port lashing rod", "rod-starboard": "starboard lashing rod" },
      title: "Fit the lashing rods to the pattern",
      cue: "Hook the port rod into the casting, then the starboard rod, crossing as the pattern shows.",
      why: "The rods take the racking load when the ship rolls in a seaway — the force that tries to push the top of a stack sideways relative to its base while the twist-locks hold the corners together. Crossed, port and starboard, they carry that load in both directions of roll; one side fitted alone only resists roll toward that side, so a half-lashed stack is secure on one tack and effectively unlashed on the other.",
      outOfOrderNote: "Port then starboard — the pattern is worked one side, then crossed.",
    },
    {
      id: "seat", kind: "hold", target: "rod-seat", seconds: 4,
      title: "Seat the rod in the casting",
      cue: "Hold the rod head in the corner casting until it drops fully home.",
      why: "A rod that is hooked into the casting but not fully seated is carrying its load on the lip of the aperture rather than in the throat of it, and that lip lets go on the first hard roll at sea — days out, in weather, with nobody able to get back up onto the bridge to find out why a stack has started working. It is held under its own weight until it drops home, and you feel the seat rather than look for it.",
      holdBreakNote: "Let go before it seated — the rod head is sitting on the lip. Hold it until it drops home.",
    },
    {
      id: "turnbuckles", kind: "sequence",
      targets: ["turnbuckle-a", "turnbuckle-b"],
      itemNames: { "turnbuckle-a": "port turnbuckle", "turnbuckle-b": "starboard turnbuckle" },
      title: "Hand-tighten the turnbuckles",
      cue: "Take up the slack on each turnbuckle by hand, port then starboard, evenly.",
      why: "Even take-up on both sides is what keeps the stack sitting square on its castings. One side cranked down before the other has taken up its slack pulls the whole stack over toward it, so the rod on that side is already carrying load before anyone has set a tension figure and the rod opposite is slack — and a slack lashing does not start working until the ship is rolling, which is the one place nobody can correct it.",
      outOfOrderNote: "Port then starboard, evenly — one side over-tight pulls the stack.",
    },
    {
      id: "torque", kind: "gauge", target: "torque-gauge",
      title: "Set the turnbuckle tension",
      cue: "Tension each turnbuckle to the manual's figure and commit inside the band.",
      why: "Under-tensioned lashings go slack on the first roll and let the stack work, and a stack that works rounds out its castings until the twist-locks no longer hold anything. Over-tensioned ones pre-load the corner fittings past what the Cargo Securing Manual requirements assume, so the lashing takes up capacity the ship's own calculation had allocated to the seaway. The manual's kN figure is the figure, not a range to eyeball off the turnbuckle.",
      gauge: { label: "TENSION", speed: 0.75, green: [0.45, 0.6], readout: (t) => `${Math.round(10 + t * 40)} kN`, missNote: "Off the manual's tension — reset and tension it to the figure." },
    },
    {
      id: "lock-turnbuckle", kind: "turn", target: "lock-nut",
      title: "Lock the turnbuckles",
      cue: "Run the lock nut down against the body so the tension cannot back off.",
      why: "A turnbuckle without its lock nut run down against the body backs off a fraction of a turn with every roll of the ship, and a passage is tens of thousands of rolls. A lashing that has unwound itself is a lashing nobody notices has gone slack until somebody walks the bay at the next port — by which time the stack has been working in a seaway for days, and the castings are the part that paid for it.",
      turn: { turns: 0.75, axis: "y", label: "LOCK NUT" },
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["unlocked-lock"],
      itemNames: { "unlocked-lock": "twist-lock left unlocked on the upper tier" },
      itemNotes: { "unlocked-lock": "The aft-starboard lock on the upper tier is still in the unlocked position — its handle was never thrown. That box would have gone over at sea." },
      title: "Walk the bay before the all-clear",
      cue: "Check every lock and lashing on the way out and click what was missed.",
      why: "The walk-out is the last time anyone sees this bay before the hatch is worked, the gang goes ashore and the ship sails. A lock or a rod that is not caught here gets no second look for the whole passage, and the way the omission usually announces itself is a stack leaning against the one alongside it, or a box over the side — either of which starts as one handle nobody threw on a tier that was hard to reach.",
    },
    {
      id: "all-clear", kind: "select", target: "crane-radio-clear",
      title: "Give the crane the all-clear",
      cue: "Radio the crane: lashers out of the bay, lifts may resume.",
      why: "The hold comes off the same radio it went on, from the person who put it on, and only once every lasher is confirmed out of the bay by name rather than counted from a distance. A headcount taken from the deck misses the one hand still up on the bridge tying off a spare rod, and a hold released through a third party is a hold whose author no longer knows whether it is safe to lift.",
    },
  ],

  interrupts: [
    {
      id: "gust-lifeline-check",
      kind: "Wind gust on the bridge",
      after: "locks", delay: 4, seconds: 12,
      alert: "A gust has come across the deck and caught the lashing bridge. The lifeline is swinging on its brackets and your lanyard has ridden up the line toward the last stanchion.",
      cue: "You're still three tiers up. Confirm the clip before you move another casting.",
      target: "lanyard-clip",
      why: "A moving lifeline can walk a snap hook toward a stanchion bracket or a kink, and a clip riding against either one is not carrying a fall the way it is rated to. It is checked the moment the line has moved, not assumed good because it was good when you first clipped in.",
      missNote: "You kept working the corner locks with the clip sitting against the stanchion bracket instead of running free on the line. A fall onto that bracket loads the lanyard sideways, which is not the direction the hardware is rated for.",
      wrongNote: "It is the lanyard clip on the lifeline. A gust that can move the line can move where your clip sits on it — check it before the next casting.",
    },
    {
      id: "shift-change-lift",
      kind: "Crane resuming without the hold",
      after: "turnbuckles", delay: 3, seconds: 13,
      alert: "Radio traffic: the relief crane operator is coming on shift early and is asking dispatch which bays are clear for the next lift. Bay 22 is not on their hold list.",
      cue: "Your hold was called to the last operator, not this one.",
      target: "crane-radio",
      why: "A hold called to one operator does not carry itself across a shift change — the next operator only knows what is on their own list, and a bay with lashers still in it that never made that list looks clear from the cab. The hold is called again, to whoever has the crane now.",
      missNote: "The relief operator picked up a container over bay 22 believing it was clear, because nobody had called the hold to them directly. The gang was still on the deck when the spreader came over the stack.",
      wrongNote: "It is the crane radio. A hold that only reached the last operator has not reached this one — call it again before anything else moves.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CL_ACCENT);
    // Deck, hatch coaming, a two-tier stack and the lashing bridge alongside.
    box(g, 5.6, 0.12, 5.0, 0, 0.06, 0, 0x5c6a75, { rough: 0.85, metal: 0.4 });
    const stack = group(g, 0, 0.12, -0.9);
    const colours = [0x8a3a2f, 0x2f6f8c];
    for (let tier = 0; tier < 2; tier++) box(stack, 2.4, 1.0, 1.0, 0, 0.5 + tier * 1.02, 0, colours[tier], { rough: 0.7, metal: 0.3 });
    // Corner castings with twist-locks between tiers; the aft-starboard upper one is unlocked.
    const lockSpecs = [["lock-a", -1.15, -0.45], ["lock-b", 1.15, -0.45], ["lock-c", -1.15, 0.45], ["lock-d", 1.15, 0.45]];
    const lockHandles = {};
    for (const [id, x, z] of lockSpecs) {
      const l = group(stack, x, 1.01, z);
      box(l, 0.16, 0.14, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.6 });
      const handle = box(l, 0.12, 0.02, 0.02, 0.06, -0.02, 0.1, 0xe8b02e, { rough: 0.5 });
      lockHandles[id] = handle;
      reg(hits, l, id);
    }
    const unlocked = group(stack, 1.15, 2.03, 0.45);
    box(unlocked, 0.16, 0.14, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.6 });
    box(unlocked, 0.02, 0.02, 0.12, 0.09, -0.02, 0.06, 0xd2312b, { rough: 0.5 });
    reg(hits, unlocked, "unlocked-lock");
    const coneHazard = box(stack, 0.3, 0.2, 0.3, 0, 2.15, -0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stack, "hand on the cone?", 0, 2.4, -0.45, { css: "#d2312b", w: 0.3 });
    reg(hits, coneHazard, "hand-on-cone");
    // Lashing rods and turnbuckles on the near face.
    const rodFaces = {};
    for (const [id, x, dir] of [["rod-port", -0.9, 1], ["rod-starboard", 0.9, -1]]) {
      const r = group(stack, x, 0.9, 0.52);
      const rod = cyl(r, 0.02, 0.02, 1.4, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
      rod.rotation.z = dir * 0.55; rod.visible = false; rodFaces[id] = rod;
      const hook = box(r, 0.1, 0.1, 0.06, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.6 });
      reg(hits, r, id);
    }
    const seat = box(stack, 0.2, 0.2, 0.1, -0.9, 1.05, 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(stack, "casting — seat the rod", -0.9, 1.25, 0.6, { css: "#4f9dde", w: 0.34 });
    reg(hits, seat, "rod-seat");
    for (const [id, x] of [["turnbuckle-a", -0.55], ["turnbuckle-b", 0.55]]) {
      const tb = group(stack, x, 0.35, 0.55);
      cyl(tb, 0.035, 0.035, 0.3, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = 0.3;
      reg(hits, tb, id);
    }
    const lockNut = group(stack, -0.55, 0.2, 0.58);
    cyl(lockNut, 0.04, 0.04, 0.03, 0, 0, 0, 0xc9a227, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, lockNut, "lock-nut");
    const torque = instrument(g, 0.9, 0.62, 0.6, { ry: -0.4, idle: "-- kN", color: 0x4f9dde, w: 0.12, d: 0.19 });
    box(g, 0.4, 0.5, 0.3, 0.9, 0.37, 0.6, 0x2b2f34, { rough: 0.6 });
    holoTag(torque, "tension gauge", 0, 0.16, 0, { css: "#4f9dde", w: 0.28 });
    reg(hits, torque, "torque-gauge");
    // Lashing bridge: raised walkway with a lifeline; the untied entry is the hazard.
    const bridge = group(g, 0, 0.12, 0.9);
    box(bridge, 3.0, 0.06, 0.5, 0, 1.2, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    for (const sx of [-1.4, 1.4]) cyl(bridge, 0.03, 0.03, 1.2, sx, 0.6, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 10 });
    for (const sx of [-1.4, 0, 1.4]) cyl(bridge, 0.015, 0.015, 1.0, sx, 1.7, -0.22, 0xe8b02e, { rough: 0.5, seg: 8 });
    const lifeline = cyl(bridge, 0.008, 0.008, 3.0, 0, 2.1, -0.22, 0xe8b02e, { rough: 0.5, seg: 8 });
    lifeline.rotation.z = Math.PI / 2;
    holoTag(bridge, "lashing bridge — clip in", 0, 2.3, -0.2, { css: "#4f9dde", w: 0.4 });
    reg(hits, lifeline, "lanyard-clip");
    const ladderTop = box(bridge, 0.5, 0.3, 0.4, 1.6, 1.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bridge, "straight up, unclipped?", 1.6, 1.55, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, ladderTop, "untied-bridge");
    // Crane spreader overhead with a box on it; the deck under it is the hazard.
    const spreader = group(g, -1.8, 0.12, -0.9);
    box(spreader, 1.2, 0.5, 0.5, 0, 3.2, 0, 0x3a7d44, { rough: 0.7, metal: 0.3 });
    box(spreader, 1.3, 0.1, 0.6, 0, 3.5, 0, 0xe8b02e, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.5, 0.5]) cyl(spreader, 0.01, 0.01, 2.0, sx, 4.5, 0, 0x22262b, { rough: 0.5, seg: 6 });
    const underLoad = cyl(spreader, 0.6, 0.6, 0.01, 0, 0.005, 0, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(spreader, "SUSPENDED LOAD", 0, 2.8, 0.3, { css: "#d2312b", w: 0.3 });
    reg(hits, underLoad, "under-load");
    // Plan board, radio, PPE, rod rack with a bent rod.
    const board = group(g, 2.2, 0, 1.4, -0.8);
    holoPanel(board, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#08131e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4f9dde"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BAY 22 — DECK STOW, SECURING PATTERN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#dcefff";
      ["Tiers: 2 on deck, 24 t / 18 t", "Twist-locks: all corners, proven by hand", "Rods: crossed, port + starboard, tier 1 castings",
       "Turnbuckles: even, 30 kN, lock nuts down", "Bridge: harness + lanyard on the lifeline", "Crane: HOLD while lashers in bay"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: CL_ACCENT });
    reg(hits, board, "bay-plan");
    const chest = toolChest(g, 1.9, -0.4, { ry: -0.7, color: 0x2f4f6f });
    const radio = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "CH 4 · HOLD", color: 0x4f9dde, w: 0.1, d: 0.16 });
    holoTag(radio, "crane radio — hold", 0, 0.15, 0, { css: "#4f9dde", w: 0.34 });
    reg(hits, radio, "crane-radio");
    const radioClear = instrument(chest, 0.14, 0.79, 0.08, { ry: 0.1, idle: "CH 4 · CLEAR", color: 0x59c97b, w: 0.1, d: 0.16 });
    holoTag(radioClear, "all-clear", 0, 0.15, 0, { css: "#59c97b", w: 0.2 });
    reg(hits, radioClear, "crane-radio-clear");
    const harness = group(chest, 0, 0.92, -0.15);
    box(harness, 0.22, 0.1, 0.1, 0, 0, 0, 0xe4622a, { rough: 0.8 });
    holoTag(harness, "harness", 0, 0.12, 0, { css: "#4f9dde", w: 0.18 });
    reg(hits, harness, "harness-on");
    const rack = group(g, -2.2, 0.12, 1.2, 0.5);
    box(rack, 0.8, 0.05, 0.3, 0, 0.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 4; i++) cyl(rack, 0.02, 0.02, 1.4, -0.3 + i * 0.2, 1.2, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const bent = cyl(rack, 0.02, 0.02, 1.4, 0.45, 1.2, 0, 0x8a6a4a, { rough: 0.6, metal: 0.5, seg: 10 });
    bent.rotation.z = 0.12;
    holoTag(rack, "rod rack — one bent", 0, 2.0, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, bent, "bent-rod");
    // ------------------------------------------------------- deck dressing
    // What a bay actually has around it once the gang is working in it: the
    // hatch coaming the stack sits on, the next stack aft, the gear bins the
    // rods and turnbuckles come out of, the fire main, deck fittings and the
    // mast light that makes any of it visible on a night sailing.
    const clDeck = group(g, 0, 0.12, 0);
    // Hatch coaming ring under the stack, with cleats along its top edge.
    for (const [cx, cz, cw, cd] of [[0, -2.0, 4.4, 0.18], [0, 0.2, 4.4, 0.18], [-2.2, -0.9, 0.18, 2.4], [2.2, -0.9, 0.18, 2.4]]) {
      box(clDeck, cw, 0.22, cd, cx, 0.11, cz, 0x6c7a85, { rough: 0.8, metal: 0.45 });
      box(clDeck, cw + 0.05, 0.03, cd + 0.05, cx, 0.235, cz, 0x8a949d, { rough: 0.6, metal: 0.6, cast: false });
    }
    for (let i = 0; i < 7; i++) {
      box(clDeck, 0.1, 0.07, 0.14, -1.8 + i * 0.6, 0.27, 0.2, 0x8a949d, { rough: 0.5, metal: 0.6 });
    }
    // The next stack aft, already secured — the bay this gang is not in.
    const aft = group(clDeck, 0, 0, -3.15);
    for (let tier = 0; tier < 2; tier++) {
      box(aft, 2.4, 1.0, 1.0, 0, 0.5 + tier * 1.02, 0, tier ? 0x4a6b4f : 0x7a6a4a, { rough: 0.72, metal: 0.28 });
      for (const sx of [-1.15, 1.15]) for (const sz of [-0.45, 0.45]) {
        box(aft, 0.15, 0.13, 0.15, sx, 1.01 + tier * 1.02, sz, 0x2b2f34, { rough: 0.6, metal: 0.6 });
      }
    }
    for (const sx of [-0.8, 0.8]) {
      const r = cyl(aft, 0.018, 0.018, 1.35, sx, 0.85, 0.53, CITY.steel, { rough: 0.35, metal: 0.8, seg: 8 });
      r.rotation.z = sx > 0 ? -0.5 : 0.5;
    }
    // Gear bins: loose rods, a basket of turnbuckles, a bin of spare locks.
    const bins = group(clDeck, -2.5, 0, -0.1, 0.35);
    for (const [bx, bw, bcol] of [[-0.55, 0.5, 0x3f5b6d], [0.1, 0.55, 0x5a4b3a], [0.75, 0.5, 0x3f5b6d]]) {
      box(bins, bw, 0.42, 0.55, bx, 0.21, 0, bcol, { rough: 0.85, metal: 0.25 });
      box(bins, bw + 0.04, 0.04, 0.59, bx, 0.44, 0, 0x8a949d, { rough: 0.6, metal: 0.55, cast: false });
    }
    for (let i = 0; i < 6; i++) {
      const r = cyl(bins, 0.018, 0.018, 0.52, -0.62 + i * 0.05, 0.47, 0, CITY.steel, { rough: 0.4, metal: 0.75, seg: 8 });
      r.rotation.x = Math.PI / 2; r.rotation.z = 0.04 * i;
    }
    for (let i = 0; i < 6; i++) {
      cyl(bins, 0.03, 0.03, 0.2, -0.06 + (i % 3) * 0.14, 0.4 + Math.floor(i / 3) * 0.07, -0.1 + (i % 2) * 0.18,
        0x22262b, { rough: 0.55, metal: 0.6, seg: 8 }).rotation.z = 1.2 + i * 0.3;
    }
    for (let i = 0; i < 8; i++) {
      box(bins, 0.13, 0.11, 0.13, 0.6 + (i % 3) * 0.13, 0.4 + Math.floor(i / 3) * 0.11, -0.15 + (i % 2) * 0.2,
        0x2b2f34, { rough: 0.62, metal: 0.58 }).rotation.y = i * 0.4;
    }
    // Fire main and hydrant valves down the outboard side, and deck pad-eyes.
    const main = group(clDeck, 2.55, 0, -0.6);
    for (let i = 0; i < 4; i++) {
      cyl(main, 0.055, 0.055, 1.05, 0, 0.42, -1.4 + i * 1.1, 0xb04a35, { rough: 0.7, metal: 0.4, seg: 10 })
        .rotation.x = Math.PI / 2;
      cyl(main, 0.075, 0.075, 0.04, 0, 0.42, -0.88 + i * 1.1, 0x8a3a28, { rough: 0.65, metal: 0.5, seg: 10 })
        .rotation.x = Math.PI / 2;
      box(main, 0.09, 0.3, 0.09, 0, 0.16, -1.4 + i * 1.1, 0x6c7a85, { rough: 0.85, metal: 0.4 });
    }
    for (const hz of [-1.1, 1.0]) {
      cyl(main, 0.045, 0.045, 0.24, 0.1, 0.56, hz, 0xb04a35, { rough: 0.6, metal: 0.5, seg: 10 });
      torus(main, 0.07, 0.014, 0.1, 0.7, hz, 0xe8b02e, { rough: 0.45, metal: 0.6 });
    }
    for (let i = 0; i < 8; i++) {
      const px = -2.0 + (i % 4) * 1.3, pz = i < 4 ? 1.7 : -2.5;
      cyl(clDeck, 0.07, 0.08, 0.05, px, 0.03, pz, 0x6c7a85, { rough: 0.85, metal: 0.4, seg: 10 });
      torus(clDeck, 0.05, 0.011, px, 0.09, pz, 0x8a949d, { rough: 0.5, metal: 0.7 });
    }
    // Mast light over the bay and the outboard handrail run.
    const mast = group(clDeck, 2.6, 0, 1.5);
    cyl(mast, 0.06, 0.08, 3.1, 0, 1.55, 0, 0x6c7a85, { rough: 0.7, metal: 0.5, seg: 10 });
    box(mast, 0.5, 0.06, 0.12, -0.2, 3.1, 0, 0x6c7a85, { rough: 0.7, metal: 0.5 });
    for (const lx of [-0.34, -0.06]) {
      box(mast, 0.18, 0.12, 0.16, lx, 3.0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
      ball(mast, 0.045, lx, 2.93, 0, 0xfff0c4, { emissive: 0xffe9a8, ei: 1.5, cast: false });
    }
    const rail = group(clDeck, 0, 0, 2.1);
    for (let i = 0; i < 6; i++) cyl(rail, 0.022, 0.022, 1.0, -2.25 + i * 0.9, 0.5, 0, 0x8a949d, { rough: 0.55, metal: 0.6, seg: 8 });
    for (const ry of [0.6, 0.95]) {
      cyl(rail, 0.018, 0.018, 4.6, 0, ry, 0, 0x8a949d, { rough: 0.55, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    }
    // Scupper plates, and a twist-lock somebody left lying in the walkway.
    for (const sx of [-1.5, 0.3, 1.9]) {
      box(clDeck, 0.3, 0.02, 0.22, sx, 0.015, 1.9, 0x5c6a75, { rough: 0.9, metal: 0.4, cast: false });
      for (let i = 0; i < 3; i++) box(clDeck, 0.26, 0.03, 0.02, sx, 0.025, 1.83 + i * 0.07, 0x3d4852, { rough: 0.9, cast: false });
    }
    const looseLock = group(clDeck, -1.55, 0.06, 0.95);
    box(looseLock, 0.17, 0.12, 0.17, 0, 0, 0, 0x33383e, { rough: 0.62, metal: 0.55 });
    box(looseLock, 0.13, 0.02, 0.02, 0.07, 0.03, 0.09, 0xe8b02e, { rough: 0.5 });
    holoTag(looseLock, "gear in the walkway", 0, 0.42, 0, { css: "#d2312b", w: 0.34 });
    reg(hits, looseLock, "loose-gear");

    standingFigure(g, -1.0, 1.6, { ry: 0.6, cloth: 0xe4622a });
    cone(g, 2.4, -1.8); cone(g, -2.4, -1.9);

    const lifelineHomeRot = lifeline.rotation.z;
    const lifelineHomeY = lifeline.position.y;
    const spreaderHomeX = spreader.position.x;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "crane-hold") repaint(radio.userData.screen, signFace("HOLD ✓", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.6 }));
        if (step.id === "locks") for (const h of Object.values(lockHandles)) h.material.color.set(0x59c97b);
        if (step.id === "rods") for (const r of Object.values(rodFaces)) r.visible = true;
        if (step.id === "inspect") unlocked.children[1].rotation.y = Math.PI / 2;
        if (step.id === "all-clear") repaint(radioClear.userData.screen, signFace("CLEAR ✓", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
      },
      onHazard() {},
      // The lifeline really swings and the crane really creeps toward the bay
      // the moment each interruption fires — not only once animate() next ticks.
      onInterrupt(it) {
        if (it.id === "gust-lifeline-check") {
          lifeline.rotation.z = lifelineHomeRot + 0.15;
          lifeline.position.y = lifelineHomeY + 0.08;
        }
        if (it.id === "shift-change-lift") {
          spreader.position.x = spreaderHomeX + 0.6;
          repaint(radio.userData.screen, signFace("NO HOLD?", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd9d9", scale: 0.55 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-lifeline-check") {
          lifeline.rotation.z = lifelineHomeRot;
          lifeline.position.y = lifelineHomeY;
        }
        if (it.id === "shift-change-lift") {
          spreader.position.x = spreaderHomeX;
          repaint(radio.userData.screen, signFace("HOLD ✓", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.6 }));
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        spreader.position.y = 0.12 + Math.sin(t * 0.8) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "torque") repaint(torque.userData.screen, signFace(`${Math.round(10 + gg.t * 40)} kN`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.62 }));
        if (session?.turn && step?.id === "lock-turnbuckle") lockNut.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
