import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Scaffold Erection VR — Construction & Structural Trades,
// station four. Building a frame scaffold two lifts high against a wall: a
// competent person's inspection, base plates and mudsills on ground that
// will carry it, plumb and level checked before the second lift, ties to
// the structure, full planking, guardrails and access — and the green tag
// that says it is safe to work from. The scaffold that fails is the one
// that was never tied.

const SE_ACCENT = 0xf0a63a;

export const SIM_SCAFFOLD_ERECTION = {
  id: "scaffold-erection",
  index: "36",
  domain: "Construction",
  trade: "Scaffold erector / carpenter",
  category: "Construction & Structural Trades",
  certification: "UBC (Carpenters) — scaffold erector qualification; OSHA 29 CFR 1926.451 / 1926.454 scaffold competent person; fall protection during erection per 1926.451(g)",
  name: "Scaffold Erection",
  title: simTitle("Scaffold Erection"),
  tagline: "Frame scaffold, two lifts: ground and sills, base plates, plumb and level, tie-ins, full planking, guardrails, ladder access, green tag",
  accent: SE_ACCENT,
  accentCss: "#f0a63a",
  parSeconds: 250,
  footprint: 2.6,
  badge: { id: "green-tagged", name: "Green Tagged", note: "A scaffold built on sound ground, plumb, tied, fully planked, guarded and tagged by the competent person" },

  game: system({
    name: "Scaffold Authority",
    currency: "LIFT",
    ranks: ["Erector", "Lead Erector", "Competent Person", "Scaffold Foreman", "Scaffold Authority Certified"],
    badges: [
      { id: "sound-ground", name: "Sound Ground", note: "Sills and base plates set before a frame went up, first time", test: AWARD.stepClean("sills") },
      { id: "tied-in", name: "Tied In", note: "Never climbed the frames, never worked an untied lift", test: AWARD.safe },
      { id: "plumb-true", name: "Plumb True", note: "Plumb and level inside tolerance", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-build", name: "Clean Build", note: "No corrections through the whole erection", test: AWARD.clean },
      { id: "tie-held", name: "Tie Held", note: "Held every tie to torque", test: AWARD.unbroken },
      { id: "up-by-break", name: "Up by Break", note: "Tagged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "climb-frames": "You climbed the cross-braces to reach the second lift. Braces are not a ladder; they flex, they are not spaced for feet, and the fall is onto the frames below. Access is a ladder or a stair, built in.",
    "untied-work": "You started planking the second lift with no tie to the structure. Two lifts of frame scaffold with no tie is a free-standing tower over its height-to-base ratio — the wind, or one person leaning, is enough.",
    "block-on-sill": "You set a base plate on a concrete block instead of a mudsill. Blocks crack and tip; a base plate on a tipped block puts a leg in the air and the load on the other three.",
    "plank-gap": "You left a plank gap over the wall side wide enough to step through. Full planking means no gap over 1 inch at the wall, and none anywhere a foot can go.",
  },

  lateNotes: {
    "frame-2": "The second lift goes on after the first is plumb, level and tied.",
    "green-tag": "The tag is the last thing on. It says everything before it was done.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "scaffold-plan",
      title: "Read the scaffold plan",
      cue: "Check the height, the tie pattern, the load class and the ground report.",
      why: "The plan is the competent person's design: how high, how tied, how loaded. The erection follows it; it does not improvise on site.",
    },
    {
      id: "ground", kind: "select", target: "ground-check",
      title: "Inspect the ground",
      cue: "Walk the footprint: firm, level, no backfill, no voids, drainage away from the legs.",
      why: "Everything above the sills stands on this. Soft ground under one leg settles under load, and the scaffold racks toward it.",
    },
    {
      id: "sills", kind: "sequence",
      targets: ["mudsill-a", "mudsill-b", "base-plate"],
      itemNames: { "mudsill-a": "left mudsill", "mudsill-b": "right mudsill", "base-plate": "base plates on the sills" },
      title: "Set the mudsills and base plates",
      cue: "Mudsills under each leg line, then base plates centred on the sills, then screw jacks.",
      why: "The sill spreads the leg load over the ground; the base plate sits on the sill, never on the ground or a block. In that order, so the jacks have something to stand on.",
      outOfOrderNote: "Sills first, then base plates on them — a plate on the ground is a leg on the ground.",
    },
    {
      id: "frame-1", kind: "drag", target: "frame-1",
      title: "Stand the first lift",
      cue: "Set the first pair of frames on the base plates and brace them.",
      why: "The first lift sets everything above it. It goes on the plates square, braced both sides, before anyone lets go of it.",
      drag: { to: "frame-socket", radius: 0.5, missNote: "Not on the base plates — set the frame legs onto the plates." },
    },
    {
      id: "plumb", kind: "gauge", target: "level-tool",
      title: "Plumb and level the first lift",
      cue: "Adjust the screw jacks until the frames read plumb and the ledgers level; commit inside tolerance.",
      why: "Out of plumb at the first lift is doubled at the second. The jacks are adjusted now, while the scaffold is one lift high and light.",
      gauge: { label: "PLUMB", speed: 0.75, green: [0.45, 0.6], readout: (t) => `${((t - 0.525) * 40).toFixed(1)} mm/m`, missNote: "Out of plumb — adjust the jacks and read the level again." },
    },
    {
      id: "tie", kind: "hold", target: "wall-tie", seconds: 4,
      title: "Tie the scaffold to the structure",
      cue: "Set the tie into the wall anchor and torque it to the coupler figure.",
      why: "The tie is what makes the scaffold part of the building instead of a tower beside it. It goes in at the first lift, before the second goes up.",
      holdBreakNote: "Came off before the coupler was torqued — the tie is not holding anything. Set it again.",
    },
    {
      id: "frame-2", kind: "drag", target: "frame-2",
      title: "Stand the second lift",
      cue: "Second pair of frames on the first, coupling pins in, braced.",
      why: "The second lift goes on a plumb, level, tied first lift. Pins in so the frames cannot lift off; braces on so they cannot rack.",
      drag: { to: "frame-2-socket", radius: 0.5, missNote: "Not on the first lift — set the frames over the coupling pins." },
    },
    {
      id: "planking", kind: "sequence",
      targets: ["plank-1", "plank-2", "plank-3"],
      itemNames: { "plank-1": "outside plank", "plank-2": "middle plank", "plank-3": "wall-side plank" },
      title: "Fully plank the working platform",
      cue: "Planks across the full width, wall side closed, ends overhanging the ledger by the rule, cleated.",
      why: "Full planking is the floor the crew works on. A gap is a leg through the platform; an unsecured plank is a plank that walks off the ledger.",
      outOfOrderNote: "Outside in — the wall-side plank closes the gap last.",
    },
    {
      id: "guardrails", kind: "sequence", anyOrder: true,
      targets: ["toprail", "midrail", "toeboard"],
      itemNames: { "toprail": "top rail", "midrail": "mid rail", "toeboard": "toeboard" },
      title: "Guardrails and toeboards",
      cue: "Top rail, mid rail and toeboard on every open side of the platform.",
      why: "Ten feet up, the guardrail is the fall protection. Top rail stops a person, mid rail stops a slip under it, toeboard stops the hammer going over onto whoever is below.",
    },
    {
      id: "access", kind: "select", target: "access-ladder",
      title: "Fit the access ladder",
      cue: "Attach the ladder and the access gate so the platform is reached without climbing frames.",
      why: "The ladder is how the scaffold is used, not just built. Without it, the first person up climbs the braces — and so does everyone after.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["missing-pin"],
      itemNames: { "missing-pin": "missing coupling pin" },
      itemNotes: { "missing-pin": "The right-hand frame on the second lift has no coupling pin — the frame is sitting in the socket by weight alone. One lift of the platform and it comes up with the plank." },
      title: "Competent person inspection",
      cue: "Inspect every connection, brace, tie and plank before the tag goes on; click what is wrong.",
      why: "The tag is the competent person's word that the scaffold is safe. The inspection is the work behind the word.",
    },
    {
      id: "tag", kind: "select", target: "green-tag",
      title: "Hang the green tag",
      cue: "Green tag at the access point: inspected, date, competent person's name.",
      why: "Green says built and inspected; anyone may use it. Yellow says restrictions; red says stay off. The colour at the ladder is the whole crew's instruction.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SE_ACCENT);
    box(g, 6.0, 0.1, 5.2, 0, 0.05, 0, 0x6b5e4d, { rough: 0.98 });
    // The wall to be scaffolded, with tie anchors.
    box(g, 6.0, 4.2, 0.3, 0, 2.1, -1.9, 0xc9c0ac, { rough: 0.95 });
    const anchor = group(g, 0, 1.7, -1.72);
    cyl(anchor, 0.03, 0.03, 0.1, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(anchor, "tie anchor", 0, 0.14, 0, { css: "#f0a63a", w: 0.2 });
    reg(hits, anchor, "wall-tie");
    // Ground: sills, base plates, a concrete block hazard.
    const groundCheck = cyl(g, 1.6, 1.6, 0.01, 0, 0.105, -0.9, 0x8a7a5a, { rough: 0.95, cast: false });
    holoTag(g, "footprint — firm, level?", 0, 0.35, 0.3, { css: "#f0a63a", w: 0.4 });
    reg(hits, groundCheck, "ground-check");
    const sills = {};
    for (const [id, x] of [["mudsill-a", -1.0], ["mudsill-b", 1.0]]) {
      const s = box(g, 0.3, 0.05, 1.8, x, 0.125, -1.0, 0x8b6a42, { rough: 0.9 });
      reg(hits, s, id); sills[id] = s;
    }
    const plates = group(g, 0, 0.15, -1.0);
    for (const [x, z] of [[-1.0, -0.7], [1.0, -0.7], [-1.0, 0.7], [1.0, 0.7]]) box(plates, 0.15, 0.02, 0.15, x, 0, z, 0x8a949d, { rough: 0.5, metal: 0.6 });
    reg(hits, plates, "base-plate");
    const frameSocket = box(g, 2.0, 0.02, 1.4, 0, 0.17, -1.0, 0xffffff, { rough: 0.5 });
    frameSocket.visible = false; hits["frame-socket"] = frameSocket;
    const block = box(g, 0.4, 0.2, 0.2, 2.2, 0.2, 0.4, 0x9a9a92, { rough: 0.95 });
    holoTag(g, "concrete block — not a sill", 2.2, 0.5, 0.4, { css: "#d2312b", w: 0.42 });
    reg(hits, block, "block-on-sill");
    // Frames staged flat on the ground (dragged into place), second-lift socket above.
    function frame(parent, x, y, z, lying) {
      const f = group(parent, x, y, z);
      for (const sx of [-1.0, 1.0]) cyl(f, 0.025, 0.025, 1.9, sx, 0.95, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 10 });
      for (const y2 of [0.6, 1.85]) cyl(f, 0.02, 0.02, 2.0, 0, y2, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
      if (lying) { f.rotation.x = -Math.PI / 2; }
      return f;
    }
    const f1 = frame(g, -2.3, 0.15, 1.2, true);
    holoTag(f1, "frame — lift 1", 0, 1.0, 0.3, { css: "#f0a63a", w: 0.28 });
    reg(hits, f1, "frame-1");
    const f2 = frame(g, 2.3, 0.15, 1.4, true);
    holoTag(f2, "frame — lift 2", 0, 1.0, 0.3, { css: "#f0a63a", w: 0.28 });
    reg(hits, f2, "frame-2");
    const f2Socket = box(g, 2.0, 0.02, 1.4, 0, 2.07, -1.0, 0xffffff, { rough: 0.5 });
    f2Socket.visible = false; hits["frame-2-socket"] = f2Socket;
    const braces = group(g, 0, 0.17, -1.0);
    const braceA = cyl(braces, 0.012, 0.012, 2.4, 0, 1.0, 0.72, 0xe8b02e, { rough: 0.5, seg: 6 }); braceA.rotation.z = 0.9; braceA.visible = false;
    const climb = box(braces, 2.0, 1.9, 0.2, 0, 1.0, 0.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(braces, "climb the braces?", 0, 2.1, 0.9, { css: "#d2312b", w: 0.32 });
    reg(hits, climb, "climb-frames");
    // Platform planks, guardrails, ladder, tags — all appear as steps complete.
    const platform = group(g, 0, 2.05, -1.0);
    const planks = {};
    for (const [id, z] of [["plank-1", 0.5], ["plank-2", 0], ["plank-3", -0.5]]) {
      const p = box(platform, 2.4, 0.04, 0.45, 0, 0, z, 0xc48b3f, { rough: 0.85, opacity: 0.25, transparent: true });
      planks[id] = p;
      reg(hits, p, id);
    }
    const plankGap = box(platform, 2.4, 0.04, 0.2, 0, 0.02, -0.75, 0xd2312b, { rough: 0.6, opacity: 0.3, transparent: true });
    holoTag(platform, "leave the wall gap?", 0, 0.3, -0.75, { css: "#d2312b", w: 0.34 });
    reg(hits, plankGap, "plank-gap");
    const untied = box(platform, 2.0, 0.3, 1.0, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, untied, "untied-work");
    const rails = {};
    for (const [id, y, h] of [["toprail", 1.0, 0.03], ["midrail", 0.5, 0.03], ["toeboard", 0.12, 0.15]]) {
      const r = box(platform, 2.4, h, 0.03, 0, y, 0.75, 0xe8b02e, { rough: 0.5, opacity: 0.25, transparent: true });
      rails[id] = r;
      reg(hits, r, id);
    }
    const ladder = group(g, 1.4, 0.15, 0.1, 0.3);
    for (const sx of [-0.2, 0.2]) box(ladder, 0.04, 2.4, 0.04, sx, 1.2, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    for (let i = 0; i < 7; i++) box(ladder, 0.4, 0.03, 0.03, 0, 0.3 + i * 0.32, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    holoTag(ladder, "access ladder", 0, 2.6, 0, { css: "#f0a63a", w: 0.26 });
    reg(hits, ladder, "access-ladder");
    const pinMissing = box(g, 0.06, 0.08, 0.06, 1.0, 2.05, -0.3, 0xd2312b, { rough: 0.5 });
    reg(hits, pinMissing, "missing-pin");
    const tag = group(ladder, 0.35, 1.6, 0.05);
    box(tag, 0.1, 0.14, 0.01, 0, 0, 0, 0x59c97b, { rough: 0.6 });
    decal(tag, 0.09, 0.06, 0, 0, 0.006, signFace("GREEN", { bg: "#59c97b", accent: "#0b1219", scale: 0.55 }));
    reg(hits, tag, "green-tag");
    // Level tool, plan, competent person.
    const chest = toolChest(g, -2.4, 0.2, { ry: 0.6, color: 0x6a4a1a });
    const level = instrument(chest, 0, 0.79, 0, { ry: 0.3, idle: "-- mm/m", color: 0xf0a63a, w: 0.12, d: 0.19 });
    holoTag(level, "level — plumb", 0, 0.16, 0, { css: "#f0a63a", w: 0.26 });
    reg(hits, level, "level-tool");
    holoPanel(chest, 0.6, 0.42, -0.6, 1.3, 0.1, (ctx, w, h) => {
      ctx.fillStyle = "#1f1408"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#f0a63a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("SCAFFOLD PLAN — EAST ELEVATION", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#fff0dc";
      ["Frame scaffold, 2 lifts, light duty", "Sills + base plates + screw jacks", "Tie at lift 1, every 4 m vertical", "Full planking, rails + toeboards", "Ladder access, green tag by CP"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SE_ACCENT });
    const plan = box(chest, 0.6, 0.42, 0.04, -0.6, 1.3, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, plan, "scaffold-plan");
    standingFigure(g, 2.4, 1.8, { ry: -1.0, cloth: 0xe4622a });
    cone(g, -2.8, -1.4);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "frame-1") { f1.parent.remove(f1); g.add(f1); f1.position.set(0, 0.17, -1.0); f1.rotation.set(0, 0, 0); braceA.visible = true; }
        if (step.id === "frame-2") { f2.parent.remove(f2); g.add(f2); f2.position.set(0, 2.07, -1.0); f2.rotation.set(0, 0, 0); }
        if (step.id === "planking") for (const p of Object.values(planks)) p.material.opacity = 1;
        if (step.id === "guardrails") for (const r of Object.values(rails)) r.material.opacity = 1;
        if (step.id === "inspect") pinMissing.visible = false;
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "planking") for (const id of Object.keys(planks)) planks[id].material.opacity = session.sequence.includes(id) ? 1 : 0.25;
        if (step?.id === "guardrails") for (const id of Object.keys(rails)) rails[id].material.opacity = session.sequence.includes(id) ? 1 : 0.25;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "plumb") { f1.rotation.z = (gg.t - 0.525) * 0.1; repaint(level.userData.screen, signFace(`${((gg.t - 0.525) * 40).toFixed(1)} mm/m`, { bg: "#0d1c24", accent: gg.t >= 0.45 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#fff0dc", scale: 0.6 })); }
      },
    };
  },
};
