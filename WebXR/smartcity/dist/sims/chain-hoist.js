import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Chain Hoist VR — Entertainment & Live Events, station three.
// Flying a lighting truss on chain motors: the load is calculated before a
// hook goes up, every motor's chain is inspected, the bridle angles are read,
// the hooks are moused, the pickup is proven with a few inches of lift, and
// the deck is clear before the call to go. A truss that comes down comes
// down on the crew under it.

const CH_ACCENT = 0xff8a5c;

export const SIM_CHAIN_HOIST = {
  id: "chain-hoist",
  index: "30",
  domain: "Entertainment",
  trade: "Entertainment rigger — chain motors",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "IATSE — ETCP Certified Rigger (Arena); ANSI E1.6-1 powered hoists; manufacturer chain-motor inspection and load-rating compliance",
  name: "Chain Hoist",
  title: simTitle("Chain Hoist"),
  tagline: "Flying a truss: load calc, chain inspection, bridle angle, moused hooks, test lift, deck clear, trim and lock",
  accent: CH_ACCENT,
  accentCss: "#ff8a5c",
  parSeconds: 240,
  footprint: 2.4,
  badge: { id: "trim-locked", name: "Trim Locked", note: "A truss flown on calculated points, inspected chain, moused hooks, a proven test lift and a clear deck" },

  game: system({
    name: "Fly Authority",
    currency: "POINT",
    ranks: ["Deck Hand", "Up-Rigger", "Head Rigger", "Production Rigger", "Fly Authority Certified"],
    badges: [
      { id: "calc-first", name: "Calc First", note: "Load calculated before a hook went up, first time", test: AWARD.stepClean("loadcalc") },
      { id: "deck-clear", name: "Deck Clear", note: "Never lifted over a body, never ran a rejected chain", test: AWARD.safe },
      { id: "angles-read", name: "Angles Read", note: "Bridle angle and trim inside spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-fly", name: "Clean Fly", note: "No corrections anywhere in the fly", test: AWARD.clean },
      { id: "test-held", name: "Test Held", note: "Held the test lift the full count", test: AWARD.unbroken },
      { id: "doors-on-time", name: "Doors On Time", note: "Truss at trim inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-truss": "You called the lift with a crew member under the truss. Nothing goes up over a body; the deck is cleared and confirmed before the go, every lift.",
    "kinked-chain": "You ran a motor with a kinked, twisted chain. A twist in the load chain jams in the hoist under load and the motor drops the point — that chain is tagged out, not run.",
    "hook-not-moused": "You lifted on a hook with no mousing. A hook without its latch or mousing can walk off the sling under a bounce; the point that unhooks is the point the truss swings on.",
    "over-rating": "You added the point-load to a motor already at its rated capacity. A one-tonne motor is a one-tonne motor; the fix is another point, not a hope.",
  },

  lateNotes: {
    "motor-up": "Nothing goes up until the load is calculated, the chain is inspected and the hooks are moused.",
    "trim-mark": "Trim comes after the test lift proves the points hold.",
  },

  steps: [
    {
      id: "plot", kind: "select", target: "rig-plot",
      title: "Read the rigging plot",
      cue: "Check the points, the truss weight with fixtures and cable, and the motor rating at each point.",
      why: "The plot is the load, the points and the beams they hang from, with the dynamic factor already worked into the numbers. Every figure on it is checked against the venue's structure before a rigger clips onto anything and goes up.",
    },
    {
      id: "loadcalc", kind: "gauge", target: "load-calc",
      title: "Calculate the point load",
      cue: "Enter truss, fixtures, cable and the dynamic factor; commit the point load inside the motor's rating with margin.",
      why: "The point load is the truss plus every fixture and every foot of cable on it, divided across the points, with the bridle angle multiplying whatever each leg actually carries. It is calculated and written down against ASME B30.16's own margins — not estimated by eye from the deck.",
      gauge: { label: "POINT LOAD", speed: 0.75, green: [0.4, 0.56], readout: (t) => `${Math.round(200 + t * 1000)} kg`, missNote: "Over the working margin, or under the real load — recalculate with everything on the truss." },
    },
    {
      id: "chain", kind: "sequence", anyOrder: true,
      targets: ["chain-a", "chain-b"],
      itemNames: { "chain-a": "motor 1 chain", "chain-b": "motor 2 chain" },
      title: "Inspect each motor's load chain",
      cue: "Run each chain through your hands: no twists, no stretched links, no rust, the chain bag clear.",
      why: "The chain is the only thing between the beam and the truss once the motor takes weight. A twist or a stretched link is found by hand, before the motor is under load, using the same rejection criteria ASME B30.16 sets for load chain.",
    },
    {
      id: "bridle", kind: "gauge", target: "bridle-angle",
      title: "Set the bridle angle",
      cue: "Adjust the bridle legs until the included angle is inside the plot's limit.",
      why: "A wide bridle multiplies the load in each leg rather than sharing it evenly. At a 120-degree included angle, each leg is already carrying the full point load on its own; the plot's angle limit is the one the sling legs were actually rated for.",
      gauge: { label: "BRIDLE", speed: 0.7, green: [0.4, 0.58], readout: (t) => `${Math.round(30 + t * 100)}°`, missNote: "Angle outside the plot's limit — the legs are overloaded. Shorten the legs." },
    },
    {
      id: "mouse", kind: "sequence", anyOrder: true,
      targets: ["hook-a", "hook-b"],
      itemNames: { "hook-a": "motor 1 hook", "hook-b": "motor 2 hook" },
      title: "Mouse the hooks",
      cue: "Close and mouse every hook on the truss slings.",
      why: "Mousing keeps the sling captured in the hook's throat through a bounce or a swing during the show, when nobody is standing under the point to watch it. It costs thirty seconds to close; a hook that walks off under load costs the whole truss.",
    },
    {
      id: "test", kind: "hold", target: "motor-up", seconds: 4,
      title: "Test lift",
      cue: "Bump the motors up a few inches and hold — watch every point take the load.",
      why: "The test lift proves the points, the slings and the chain under the real, calculated load while the truss is still a few inches off the deck, where a failure drops a few inches onto an empty floor instead of a rigger's head.",
      holdBreakNote: "Dropped it before the points proved — bump it up and hold it.",
    },
    {
      id: "clear", kind: "select", target: "deck-check",
      title: "Clear the deck",
      cue: "Look under the whole truss, call it clear, and get a clear back from the deck.",
      why: "The go is called only by the person who has personally looked under the whole length of the truss and heard clear back from the deck crew — never assumed from across the room, and never called from memory of the last cue.",
    },
    {
      id: "fly", kind: "track", target: "motor-run", seconds: 7,
      title: "Fly the truss to trim",
      cue: "Run the motors together, watching the truss stay level, all the way to trim height.",
      why: "Motors that run at even slightly different speeds tilt the truss and shift its load onto whichever point is still carrying the higher end. The rigger watches the level indicator the whole climb and stops the faster motor the moment it drifts.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "LEVEL", readout: (v) => (v < 0.4 ? "SL low" : v > 0.6 ? "SR low" : "level") },
      holdBreakNote: "Truss tilted out of level — stop, correct, and run again.",
    },
    {
      id: "trim", kind: "select", target: "trim-mark",
      title: "Mark the trim and lock the motors",
      cue: "Truss at trim height: mark it, and lock out the motor controller.",
      why: "A locked controller cannot be bumped by a stray foot or a curious hand once the show is running under that truss. The trim mark is the reference every later call — bump-in, cue, strike — gets checked against for the rest of the run.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["shackle-open"],
      itemNames: { "shackle-open": "shackle pin not seated" },
      itemNotes: { "shackle-open": "The shackle on motor 2's bridle has its pin backed out two turns — it was never moused. Under a show's worth of bounce it walks out." },
      title: "Walk the points before the house opens",
      cue: "Inspect every hardware connection from beam to truss and click what is wrong.",
      why: "Hardware is checked again by eye and by hand after the fly itself, because the act of lifting is exactly what moves a hardware connection that looked fine sitting still on the deck. This walk is the last look before a house full of people sits underneath it.",
    },
  ],

  interrupts: [
    {
      id: "walk-under-truss-flying",
      kind: "Someone crosses under the flying truss",
      after: "fly", delay: 3, seconds: 12,
      alert: "A stagehand pushing a road case has just walked under the leading edge of the truss while it's still climbing toward trim, headphones on, looking at the case and not up.",
      cue: "Stop the climb and call the deck clear again before another inch of travel.",
      target: "deck-check",
      why: "A truss under motor power keeps climbing at whatever rate the controller is set to whether or not the deck below it is still the deck you checked a minute ago — people move, cases get pushed, and the clear you called before the fly started is not a clear that lasts for the whole climb on its own.",
      missNote: "The truss kept climbing over the stagehand with the case, who never looked up and never heard the motors over their own headphones. A dropped point at that moment lands on someone who had no idea they were under it.",
      wrongNote: "It is the deck check. Somebody under a truss that is still moving is a reason to stop the motors, not a reason to finish the climb faster.",
    },
    {
      id: "motor-chain-jam-warning",
      kind: "Motor 2 chain sounding wrong",
      after: "mouse", delay: 3, seconds: 12,
      alert: "A rigger up in the grid radios down that motor 2's chain has started grinding on the way through the guide, and the chain bag underneath is filling faster than it should be for the travel so far.",
      cue: "That chain gets a second look before this motor takes any load.",
      target: "chain-b",
      why: "A chain that grinds through its own feed guide is already fouling on something — a burr, a kink starting to form, a link that has begun to stretch — and a chain hoist under a load calculated for a healthy chain does not know the chain in front of it is not the one the rating assumes.",
      missNote: "The test lift went ahead on a chain that had already started grinding through the guide. A fouling chain under load is exactly the failure mode a pre-lift inspection exists to catch before the motor, not the truss, finds out the hard way.",
      wrongNote: "It is motor 2's chain. A chain that sounds wrong before it has even taken weight does not get a pass because the schedule is tight.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CH_ACCENT);
    box(g, 5.6, 0.1, 5.0, 0, 0.05, 0, 0x22262b, { rough: 0.9 });
    // Beams overhead, two chain motors, a lighting truss on the deck below.
    for (const z of [-1.2, 1.2]) box(g, 5.6, 0.3, 0.2, 0, 3.6, z, 0x5b6672, { rough: 0.6, metal: 0.5 });
    const truss = group(g, 0, 0.35, 0);
    for (const [y, z] of [[0, -0.2], [0, 0.2], [0.4, -0.2], [0.4, 0.2]]) cyl(truss, 0.025, 0.025, 4.0, 0, y, z, 0xc9ccd0, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    for (let i = -4; i <= 4; i++) { cyl(truss, 0.015, 0.015, 0.4, i * 0.45, 0.2, -0.2, 0xc9ccd0, { rough: 0.4, metal: 0.7, seg: 6 }); cyl(truss, 0.015, 0.015, 0.4, i * 0.45, 0.2, 0.2, 0xc9ccd0, { rough: 0.4, metal: 0.7, seg: 6 }); }
    for (const x of [-1.4, -0.5, 0.5, 1.4]) { const f = group(truss, x, -0.2, 0); cyl(f, 0.1, 0.12, 0.3, 0, 0, 0, 0x1b1e22, { rough: 0.6, seg: 12 }); ball(f, 0.06, 0, -0.16, 0, 0xfff1c4, { emissive: 0xfff1c4, ei: 0.4, rough: 0.4 }); }
    const motors = {};
    for (const [key, x] of [["a", -1.2], ["b", 1.2]]) {
      const m = group(g, x, 3.35, 0);
      box(m, 0.3, 0.4, 0.3, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
      box(m, 0.2, 0.25, 0.2, 0, -0.35, 0, 0x22262b, { rough: 0.7 });
      const chain = cyl(m, 0.01, 0.01, 2.6, 0, -1.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
      const hook = group(m, 0, -2.85, 0);
      cyl(hook, 0.03, 0.03, 0.12, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 });
      const latch = box(hook, 0.02, 0.06, 0.01, 0.02, -0.03, 0.02, 0xd2312b, { rough: 0.5 });
      holoTag(m, `motor ${key === "a" ? "1" : "2"} — 1 t`, 0, 0.35, 0, { css: "#ff8a5c", w: 0.26 });
      reg(hits, chain, `chain-${key}`); reg(hits, hook, `hook-${key}`);
      motors[key] = { m, chain, hook, latch };
    }
    const kinked = group(g, 2.3, 0.1, -1.0, 0.4);
    for (let i = 0; i < 5; i++) cyl(kinked, 0.012, 0.012, 0.25, i * 0.1 - 0.2, 0.05, Math.sin(i) * 0.05, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 }).rotation.z = Math.PI / 2 + Math.sin(i * 2) * 0.5;
    holoTag(kinked, "spare motor — twisted chain", 0, 0.3, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, kinked, "kinked-chain");
    const bareHook = group(g, -2.3, 0.1, -1.0);
    cyl(bareHook, 0.03, 0.03, 0.12, 0, 0.1, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(bareHook, "hook — no mousing, no latch", 0, 0.35, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, bareHook, "hook-not-moused");
    const bridle = group(g, 1.2, 1.4, 0);
    for (const sx of [-0.35, 0.35]) { const leg = cyl(bridle, 0.008, 0.008, 1.0, sx / 2, 0.45, 0, 0xe8b02e, { rough: 0.5, seg: 6 }); leg.rotation.z = sx; }
    const bridleFace = decal(bridle, 0.24, 0.08, 0, 1.0, 0.02, signFace("--°", { bg: "#0d1c24", accent: "#ff8a5c", fg: "#ffe0d0", scale: 0.6 }), { glow: true, ei: 0.6 });
    reg(hits, bridle, "bridle-angle");
    const shackle = group(bridle, 0, 0.95, 0);
    cyl(shackle, 0.02, 0.02, 0.06, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    box(shackle, 0.02, 0.02, 0.05, 0.04, 0, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, shackle, "shackle-open");
    // Deck: a crew member under the truss (hazard), deck-check marker, controller.
    const crew = standingFigure(g, 0.35, 0.9, { ry: 0.4, cloth: 0x1b1e22 });
    holoTag(crew, "crew under the truss", 0, 1.9, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, crew, "under-truss");
    const deckCheck = cyl(g, 0.35, 0.35, 0.01, -1.6, 0.105, 1.6, 0x59c97b, { rough: 0.6, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "deck check — call it clear", -1.6, 0.4, 1.6, { css: "#ff8a5c", w: 0.4 });
    reg(hits, deckCheck, "deck-check");
    const controller = group(g, 2.0, 0.1, 1.6, -0.6);
    box(controller, 0.5, 0.9, 0.3, 0, 0.45, 0, 0x2b2f34, { rough: 0.55, metal: 0.3 });
    const up = box(controller, 0.1, 0.06, 0.03, -0.12, 0.7, 0.16, 0x59c97b, { rough: 0.5 });
    decal(controller, 0.1, 0.04, -0.12, 0.78, 0.16, signFace("UP", { bg: "#22262b", accent: "#59c97b", scale: 0.6 }));
    reg(hits, up, "motor-up");
    const run = box(controller, 0.1, 0.06, 0.03, 0.12, 0.7, 0.16, 0xff8a5c, { rough: 0.5 });
    decal(controller, 0.1, 0.04, 0.12, 0.78, 0.16, signFace("RUN", { bg: "#22262b", accent: "#ff8a5c", scale: 0.6 }));
    reg(hits, run, "motor-run");
    const trimMark = box(controller, 0.16, 0.06, 0.03, 0, 0.45, 0.16, 0x22262b, { rough: 0.5 });
    decal(controller, 0.16, 0.04, 0, 0.53, 0.16, signFace("TRIM · LOCK", { bg: "#22262b", accent: "#ff8a5c", scale: 0.5 }));
    reg(hits, trimMark, "trim-mark");
    const overRating = box(controller, 0.16, 0.06, 0.03, 0, 0.25, 0.16, 0x22262b, { rough: 0.5 });
    decal(controller, 0.16, 0.04, 0, 0.33, 0.16, signFace("ADD POINT LOAD", { bg: "#22262b", accent: "#d2312b", scale: 0.45 }));
    reg(hits, overRating, "over-rating");
    const calc = instrument(controller, 0, 0.92, 0, { idle: "-- kg", color: 0xff8a5c, w: 0.16, d: 0.2 });
    holoTag(calc, "load calc", 0, 0.16, 0, { css: "#ff8a5c", w: 0.22 });
    reg(hits, calc, "load-calc");
    const plot = group(g, -2.2, 0, 1.4, 0.8);
    holoPanel(plot, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1f0e08"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#ff8a5c"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RIGGING PLOT — US TRUSS, 2 POINTS", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#ffe8dc";
      ["Truss 12 m + 8 fixtures + cable: 640 kg", "Motors: 2 × 1 t, chain inspected", "Bridle max included angle: 90°",
       "Dynamic factor 1.25", "Test lift 100 mm, hold, then fly", "Trim 7.2 m, controller locked"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: CH_ACCENT });
    reg(hits, plot, "rig-plot");
    cone(g, 2.5, -1.8); cone(g, -2.5, -1.8);

    let height = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, 0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "mouse") for (const m of Object.values(motors)) m.latch.material.color.set(0x59c97b);
        if (step.id === "clear") crew.position.set(-1.6, 0, 1.6);
        if (step.id === "walk") shackle.children[1].position.x = 0;
      },
      onHazard() {},
      // The stagehand really steps back under the truss, and motor 2's chain
      // really flags red, the instant each interruption fires.
      onInterrupt(it) {
        if (it.id === "walk-under-truss-flying") crew.position.set(0.35, 0, 0);
        if (it.id === "motor-chain-jam-warning") motors.b.chain.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.5, metal: 0.6 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "walk-under-truss-flying") crew.position.set(-1.6, 0, 1.6);
        if (it.id === "motor-chain-jam-warning") motors.b.chain.material = mat(0x8a949d, { rough: 0.5, metal: 0.6 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "test" && session.holding) height = Math.min(0.1, session.holdFor * 0.03);
        if (step?.id === "fly" && session.track) height = 0.1 + Math.min(1, session.track.inBand / 7) * 2.4;
        truss.position.y = 0.35 + height;
        for (const m of Object.values(motors)) { m.chain.scale.y = 1 - height / 3.1; m.chain.position.y = -1.5 + height / 2; m.hook.position.y = -2.85 + height; }
        bridle.position.y = 1.4 + height;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "loadcalc") repaint(calc.userData.screen, signFace(`${Math.round(200 + gg.t * 1000)} kg`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#ffe0d0", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "bridle") repaint(bridleFace, signFace(`${Math.round(30 + gg.t * 100)}°`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#ffe0d0", scale: 0.6 }));
      },
    };
  },
};
