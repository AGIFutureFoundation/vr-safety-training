import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crane Yard VR — its own gamified system: Rigging Command.
// Mobile crane picks. The load chart does not care how the last ten picks went —
// it is checked against this radius, this boom angle, this load, every time.

export const SIM_CRANE_YARD = {
  id: "crane-yard",
  index: "13",
  domain: "Construction",
  trade: "Mobile crane operator / rigger",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUOE — NCCCO Mobile Crane Operator certified",
  name: "Crane Yard",
  title: simTitle("Crane Yard"),
  tagline: "Mobile crane pick: outrigger setup, load chart verification, anti-collision zone programming and a tag-line controlled lift",
  accent: 0x2f8fdb,
  accentCss: "#2f8fdb",
  parSeconds: 275,
  badge: { id: "rigging-command", name: "Rigging Command", note: "Set, verified against the chart and landed with the swing radius clear" },

  game: system({
    name: "Rigging Command",
    currency: "RIG",
    ranks: ["Yard Hand", "Rigger", "Signal Person", "Load Chart Certified", "Rigging Command"],
    badges: [
      { id: "solid-set", name: "Solid Set", note: "Level the outriggers and clear the chart before every pick", test: AWARD.all(AWARD.stepClean("level-check"), AWARD.stepClean("load-chart")) },
      { id: "swing-clear", name: "Swing Clear", note: "Never stand in the load path or the swing radius", test: AWARD.safe },
      { id: "rigging-precise", name: "Rigging Precise", note: "Hold every gauge reading near band centre", test: AWARD.precise(0.72) },
      { id: "zone-set", name: "Zone Set Clean", note: "Teach the anti-collision boundary in the correct order, first try", test: AWARD.stepClean("zone-teach") },
    ],
    challenges: [
      { id: "quick-pick", name: "Quick Pick", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-lift", name: "Clean Lift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "rig-streak", name: "Rig Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "swing-radius-stand": "You are standing inside the crane's swing radius while it is rigged for a pick. The counterweight and boom sweep that space without warning a person on foot can react to in time.",
    "two-block-risk": "You are hoisting past the anti-two-block limit. Running the hook block into the boom tip parts the hoist line or snaps the boom itself, and the load falls the moment either one lets go.",
    "chart-exceeded": "That pick is logged past the chart's rated capacity for this radius and boom angle. Cranes tip or fail structurally at the edge of the chart, not with a comfortable margin of warning first.",
    "kinked-sling": "That sling has a visible kink in its body. A kink is a stress point the sling was never rated for — it can fail well under its tag capacity exactly where the kink is.",
  },

  lateNotes: {
    "load-chart": "The chart gets checked against this radius and boom angle before rigging goes near the load, not as a formality once the pick is already hooked up and swinging.",
    "tag-line-crane": "The tag line goes on the load once it is already hooked and lifted clear, guiding it rather than fighting its swing from the ground.",
  },

  steps: [
    {
      id: "pre-lift", kind: "select", target: "lift-plan",
      title: "Read the lift plan",
      cue: "Confirm the load weight, working radius, boom angle and ground conditions.",
      why: "Every control that follows is sized to this specific pick. A lift plan read after the outriggers are already down is a plan you are checking your own work against.",
    },
    {
      id: "outrigger-setup", kind: "sequence", anyOrder: true,
      targets: ["outrigger-front", "outrigger-rear"],
      itemNames: { "outrigger-front": "front outriggers", "outrigger-rear": "rear outriggers" },
      title: "Extend and set the outriggers",
      cue: "Extend the front and rear outriggers onto their pads.",
      why: "The outriggers are what turns the crane's rated capacity from a number on paper into something the ground under this specific pad can actually support.",
    },
    {
      id: "level-check", kind: "gauge", target: "level-bubble",
      title: "Check the crane is level",
      cue: "Read the level bubble and commit only when it is centred.",
      why: "A crane that is off level derates in the direction of the lean without saying so. The chart assumes level ground — this is where you prove it, not assume it.",
      gauge: {
        label: "OUTRIGGER LEVEL", speed: 0.65, green: [0.46, 0.58],
        readout: (t) => `${((t - 0.5) * 6).toFixed(1)}° off level`,
        missNote: "Not level. Adjust the outrigger jacks before anything gets rigged to the hook.",
      },
    },
    {
      id: "load-chart", kind: "gauge", target: "load-chart",
      title: "Verify the load chart for this pick",
      cue: "Walk the boom to the planned radius and commit once the chart shows capacity in hand.",
      why: "The chart is read at the actual radius and boom angle for this specific pick, not the radius from last week's job that felt about the same.",
      gauge: {
        label: "CHART CAPACITY MARGIN AT RADIUS", speed: 0.55, green: [0.55, 0.85],
        readout: (t) => `${Math.round(t * 100)}% of rated capacity`,
        missNote: "That radius eats too much of the chart's rated capacity for this load. Walk the boom in or reduce the radius before rigging.",
      },
    },
    {
      id: "zone-teach", kind: "sequence", targets: ["zone-pt-a", "zone-pt-b", "zone-pt-c"],
      title: "Teach the anti-collision boundary",
      cue: "Walk the boom to each corner of the property line next door and mark it, in order, going around the corner.",
      why: "The RCI's anti-collision system only knows about a boundary you actually taught it. Teach the corners out of order and the system draws the line through the wrong side of the property, not around it.",
      itemNames: { "zone-pt-a": "boundary corner A", "zone-pt-b": "boundary corner B", "zone-pt-c": "boundary corner C" },
      itemNotes: {
        "zone-pt-a": "The near corner, closest to the crane's set position.",
        "zone-pt-b": "The mid corner, where the property line turns.",
        "zone-pt-c": "The far corner, at the limit of any planned swing.",
      },
      outOfOrderNote: "That corner comes later walking the line. Near corner, then the turn, then the far corner — the system connects them in the order you taught them, not the order that looks obvious from the cab.",
    },
    {
      id: "zone-save", kind: "select", target: "zone-save-btn",
      title: "Save the boundary to the RCI",
      cue: "Commit the taught boundary to the crane's rated capacity indicator as a no-swing zone.",
      why: "A taught boundary sitting unsaved is just where the boom happened to point. Saving it is what makes the RCI actually cut the swing at that line instead of trusting the operator to remember it.",
    },
    {
      id: "zone-verify", kind: "hold", target: "zone-verify-btn", seconds: 2.5,
      title: "Test-swing and verify the cutout",
      cue: "Hold VERIFY while the RCI test-swings the boom and confirms it stops dead at the taught boundary.",
      why: "You verify a brand-new anti-collision zone at slow test speed before the actual pick, because the first time it should ever stop the boom for real is the first time it's asked to.",
      holdBreakNote: "Released before the test-swing finished — hold it through the full check, that's the only way to catch a boundary point that was taught short or long.",
    },
    {
      id: "rigging-select", kind: "select", target: "rated-sling",
      title: "Select the correctly rated sling",
      cue: "Choose the sling rated for this load from the rigging rack, not the damaged one beside it.",
      why: "A sling's tag capacity assumes it is undamaged. The rack always has more than one option — the rated, sound one is the only correct choice.",
    },
    {
      id: "inspect-shackle", kind: "select", target: "shackle",
      title: "Inspect the shackle",
      cue: "Check the shackle's rated capacity stamp and pin condition before rigging it.",
      why: "A shackle with a worn or bent pin can walk loose under a cyclical load. The stamp tells you what it is rated for; the inspection tells you whether it still is.",
    },
    {
      id: "sling-angle", kind: "select", target: "sling-angle-check",
      title: "Verify the sling leg angle",
      cue: "Confirm the rigging angle is within the rated range before the load comes off the ground.",
      why: "A shallow sling angle multiplies the tension each leg actually carries. The same sling that is comfortably rated at a steep angle can be overloaded at a shallow one carrying the identical weight.",
    },
    {
      id: "signal-protocol", kind: "select", target: "signal-person",
      title: "Confirm the signal person protocol",
      cue: "Agree hand signals and radio call-outs with the dedicated signal person.",
      why: "Only one person directs the lift. The operator moves on that person's signal alone, so everyone on the pick needs to know who that is before the load leaves the ground.",
    },
    {
      id: "hook-load", kind: "select", target: "hook-block",
      title: "Hook the rigging to the load",
      cue: "Attach the sling to the hook block and confirm the load is centred underneath it.",
      why: "A load that is not centred under the hook swings the instant it clears the ground, which is exactly the moment you have the least control over it.",
    },
    {
      id: "tag-line-lift", kind: "hold", target: "tag-line-crane", seconds: 6,
      title: "Guide the lift with the tag line",
      cue: "Hold the tag line steady as the load comes up and swings toward the landing zone.",
      why: "The tag line lets you steer a suspended load without ever putting a hand on it. A load with no one steering it swings on its own until something stops it.",
      holdBreakNote: "Tag line released mid-lift. An unguided load keeps whatever swing it already had.",
    },
    {
      id: "set-down", kind: "drag", target: "suspended-load",
      title: "Make a controlled set-down",
      cue: "Carry the load over the landing zone and lower it into place.",
      why: "A controlled set-down means the load is stable on its own before the rigging comes off — not lowered fast and released before anyone has checked it is actually sitting flat.",
      drag: { to: "load-socket", radius: 0.5, missNote: "Not over the landing zone — line the load up with the marked pad before setting it down." },
    },
    {
      id: "log-lift", kind: "select", target: "crane-log",
      title: "Close out the lift log",
      cue: "Record the pick, confirm the area is clear, then boom down.",
      why: "The lift is not finished when the load lands — it is finished when the rigging is recovered, the area is confirmed clear and the pick is logged for the next crew.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0x2f8fdb);

    // ------------------------------------------------------------------- yard
    box(g, 4.6, 0.14, 4.6, 0, 0.07, 0, 0x59606a, { rough: 0.92 });
    for (let i = -3; i <= 3; i++) box(g, 4.6, 0.004, 0.02, 0, 0.145, i * 0.7, 0x484f57, { cast: false, receive: false });

    // ------------------------------------------------------------------- the crane
    const crane = group(g, -1.0, 0, -1.3, 0.3);
    slab(crane, 1.0, 0.5, 1.7, 0, 0.32, 0, 0x545e67, { radius: 0.04, rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(crane, 0.05, 0.05, 0.14, sx * 0.4, 0.07, sz * 0.7, 0x2b3138, { rough: 0.7, seg: 12 });
    }
    const cab = group(crane, 0, 0.75, 0.55);
    box(cab, 0.55, 0.42, 0.5, 0, 0, 0, 0x2f8fdb, { rough: 0.45, metal: 0.5 });
    box(cab, 0.4, 0.24, 0.02, 0, 0.02, -0.26, 0x9fd8ff, { rough: 0.2, opacity: 0.8, transparent: true });
    const boom = group(crane, 0, 0.8, -0.1, -0.1);
    box(boom, 3.4, 0.18, 0.18, 1.6, 0.35, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    holoTag(crane, "60 t mobile crane", 0, 1.3, 0.5, { css: "#2f8fdb", w: 0.4 });

    // Outriggers: four beams that extend on the setup step.
    const outriggerBeams = { front: [], rear: [] };
    for (const sz of [-1, 1]) {
      const key = sz < 0 ? "front" : "rear";
      for (const sx of [-1, 1]) {
        const beam = box(crane, 0.9, 0.09, 0.14, sx * 0.85, 0.14, sz * 0.75, 0x545e67, { rough: 0.5, metal: 0.5 });
        beam.scale.x = 0.15;
        const pad = cyl(crane, 0.14, 0.14, 0.03, sx * 1.5, 0.06, sz * 0.75, 0x2b3138, { rough: 0.7, seg: 16 });
        pad.visible = false;
        reg(hits, beam, key === "front" ? "outrigger-front" : "outrigger-rear");
        outriggerBeams[key].push({ beam, pad, sx });
      }
    }

    const bubbleHousing = group(crane, 0, 0.6, 0.3);
    box(bubbleHousing, 0.14, 0.06, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    const bubbleFace = decal(bubbleHousing, 0.12, 0.05, 0, 0.033, 0,
      signFace("LEVEL", { bg: "#0d1c24", accent: "#2f8fdb", fg: "#bfeaf7", scale: 0.5 }), { px: 200, glow: true, ei: 0.8 });
    bubbleFace.rotation.x = -Math.PI / 2;
    holoTag(bubbleHousing, "Level bubble", 0, 0.09, 0, { css: "#2f8fdb", w: 0.28 });
    reg(hits, bubbleHousing, "level-bubble");

    // Anti-collision RCI console, on the cab beside the level bubble.
    const rciConsole = group(cab, 0.2, -0.1, 0.26);
    const rciScreen = decal(rciConsole, 0.12, 0.06, 0, 0.05, 0.006,
      signFace("RCI ZONE", { bg: "#0d1c24", accent: "#2f8fdb", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.8, px: 180 });
    const zoneSaveBtn = cyl(rciConsole, 0.016, 0.016, 0.01, -0.03, -0.03, 0.006, 0x59c97b, { rough: 0.4, seg: 14 });
    zoneSaveBtn.rotation.x = Math.PI / 2;
    reg(hits, zoneSaveBtn, "zone-save-btn");
    const zoneVerifyBtn = cyl(rciConsole, 0.016, 0.016, 0.01, 0.03, -0.03, 0.006, 0x4fd1ff, { rough: 0.4, seg: 14 });
    zoneVerifyBtn.rotation.x = Math.PI / 2;
    reg(hits, zoneVerifyBtn, "zone-verify-btn");
    holoTag(rciConsole, "Save · Verify zone", 0, -0.07, 0, { css: "#2f8fdb", w: 0.32 });

    // ------------------------------------------------------- property boundary
    // Three corners along the fence line the boom must never swing past —
    // taught, saved and test-verified through the RCI console above.
    const zonePts = [
      [-2.7, -2.6, "zone-pt-a", "A · Near corner"],
      [-2.7, -0.6, "zone-pt-b", "B · Line turn"],
      [-2.7, 1.4, "zone-pt-c", "C · Far corner"],
    ];
    for (const [zx, zz, id, label] of zonePts) {
      const marker = torus(g, 0.09, 0.012, zx, 0.02, zz, 0x2f8fdb,
        { emissive: 0x2f8fdb, ei: 1.1, rough: 0.4, cast: false, seg: 6, seg2: 24 });
      marker.rotation.x = Math.PI / 2;
      holoTag(g, label, zx, 0.26, zz, { css: "#2f8fdb", w: 0.34 });
      reg(hits, marker, id);
    }

    // ------------------------------------------------------------------- the load
    const hookCable = hose(g, [[0.45, 2.5, -0.7], [0.4, 1.6, 0.0], [0.35, 0.95, 0.15]], 0.014, CITY.steel,
      { steps: 18, rough: 0.5, metal: 0.6 });
    const hookBlock = group(g, 0.35, 0.9, 0.15);
    box(hookBlock, 0.1, 0.08, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    torus(hookBlock, 0.05, 0.012, 0, -0.06, 0, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 8, seg2: 16 });
    reg(hits, hookBlock, "hook-block");

    const load = group(g, 0.35, 0.4, 0.15);
    box(load, 0.5, 0.4, 0.5, 0, 0, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const slingHang = hose(load, [[-0.24, 0.5, -0.24], [0, 0.9, 0], [0.24, 0.5, 0.24]], 0.01, CITY.steel,
      { steps: 12, rough: 0.5, metal: 0.6 });
    reg(hits, load, "suspended-load");

    const swingShadow = box(g, 3.0, 0.005, 3.0, -1.0, 0.15, -1.3, 0x000000, { opacity: 0.16, transparent: true, cast: false });
    holoTag(swingShadow, "Swing radius", -1.0, 0.3, 0.3, { css: "#f0645b", w: 0.32 });
    reg(hits, swingShadow, "swing-radius-stand");

    const twoBlockZone = ball(g, 0.08, 0.4, 2.55, -0.75, 0xf0645b, { emissive: 0xf0645b, ei: 1.6, opacity: 0.7, transparent: true });
    holoTag(twoBlockZone, "Two-block limit", 0, 0.16, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, twoBlockZone, "two-block-risk");

    // ------------------------------------------------------------------- rigging kit
    const chest = toolChest(g, 1.7, 1.2, { ry: -0.5, color: 0x2f8fdb });
    const ratedSling = group(chest, -0.14, 0.79, 0, 0.4);
    torus(ratedSling, 0.06, 0.012, 0, 0, 0, 0xf2c14b, { rough: 0.6, seg: 8, seg2: 18 });
    holoTag(ratedSling, "Rated sling", 0, 0.13, 0, { css: "#2f8fdb", w: 0.28 });
    reg(hits, ratedSling, "rated-sling");

    const kinkedSling = group(chest, 0.16, 0.79, 0.06, -0.3);
    torus(kinkedSling, 0.05, 0.012, 0, 0, 0, 0xb8402f, { rough: 0.7, seg: 8, seg2: 18 });
    box(kinkedSling, 0.03, 0.02, 0.02, 0.05, 0, 0, 0x6a3a2a, { rough: 0.8 });
    holoTag(kinkedSling, "Kinked sling", 0, 0.11, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, kinkedSling, "kinked-sling");

    const shackle = group(chest, 0, 0.8, -0.16, 0.2);
    torus(shackle, 0.03, 0.008, 0, 0, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 8, seg2: 16 });
    holoTag(shackle, "Rigging shackle", 0, 0.09, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, shackle, "shackle");

    const angleTool = group(chest, -0.08, 0.79, -0.14, -0.3);
    box(angleTool, 0.1, 0.02, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    holoTag(angleTool, "Sling angle check", 0, 0.08, 0, { css: "#2f8fdb", w: 0.32 });
    reg(hits, angleTool, "sling-angle-check");

    // ------------------------------------------------------------------- people
    const signalPerson = standingFigure(g, 1.6, -0.6, { ry: -1.9, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(signalPerson, "Signal person", 0, 1.95, 0.15, { css: "#2f8fdb", w: 0.3 });
    reg(hits, signalPerson, "signal-person");

    const tagLine = group(g, 0.7, 0, 0.4, -0.3);
    hose(tagLine, [[0, 1.4, -0.25], [0.15, 0.6, -0.1], [0.3, 0.02, 0]], 0.008, 0xf2c14b, { steps: 14, rough: 0.75 });
    holoTag(tagLine, "Tag line", 0.3, 0.15, 0, { css: "#2f8fdb", w: 0.24 });
    reg(hits, tagLine, "tag-line-crane");

    const landingZone = group(g, 1.5, 0, 1.3);
    box(landingZone, 0.9, 0.02, 0.9, 0, 0.15, 0, 0x2f8fdb, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
    holoTag(landingZone, "Landing zone", 0, 0.28, 0, { css: "#2f8fdb", w: 0.3 });
    // A plain, non-interactive marker at the load's actual resting transform
    // (same footprint as the pad above, but at the load's own resting height,
    // not the pad's) — the drag step measures and snaps against this, never
    // against the pad itself.
    const loadSocket = group(g, 1.5, 0.2, 1.3);
    hits["load-socket"] = loadSocket;

    // ------------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f8fdb"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LIFT PLAN · PICK 6", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("18,000 LB AT 30 FT RADIUS", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Chart margin required: ≥ 25%", "Sling rated: 8,000 lb per leg",
       "Ground bearing: verified for pads", "Swing radius: 12 m, keep clear",
       "Signal person: dedicated, radio linked"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0x2f8fdb });
    reg(hits, plan, "lift-plan");

    const chartPanel = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "-- %", color: 0x2f8fdb });
    holoTag(chartPanel, "Load chart", 0, 0.16, 0, { css: "#2f8fdb", w: 0.3 });
    reg(hits, chartPanel, "load-chart");

    // Overload marker on the boom — the trap for a pick logged past the chart.
    const overloadMarker = group(boom, -0.6, 0.16, 0, 0);
    ball(overloadMarker, 0.03, 0, 0, 0, 0xf0645b, { emissive: 0xf0645b, ei: 1.8 });
    holoTag(overloadMarker, "Radius exceeds chart", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, overloadMarker, "chart-exceeded");

    const craneLog = group(g, 1.9, 0, -0.6, 0.6);
    slab(craneLog, 0.4, 0.3, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const logFace = decal(craneLog, 0.36, 0.26, 0, 1.1, 0.02,
      signFace("LIFT LOG\nOPEN", { bg: "#11181f", accent: "#2f8fdb", scale: 0.32 }), { px: 320 });
    holoTag(craneLog, "Lift log", 0, 1.32, 0, { css: "#2f8fdb", w: 0.28 });
    reg(hits, craneLog, "crane-log");

    let outriggersDown = false;

    return {
      hits,
      footprint: 2.1,

      // While the load is actually being carried by hand to its landing spot,
      // the crane's own hook and cable would otherwise stay frozen pointing
      // at wherever the load started — hiding them for the moment reads as
      // "guided in by the tag line" rather than a visibly broken rig.
      onDragStart(id) {
        if (id !== "suspended-load") return;
        hookCable.visible = false;
        hookBlock.visible = false;
      },
      onDragEnd(id) {
        if (id !== "suspended-load") return;
        hookCable.visible = true;
        hookBlock.visible = true;
      },

      onStepComplete(step) {
        if (step.id === "outrigger-setup") {
          outriggersDown = true;
          for (const key of ["front", "rear"]) {
            for (const o of outriggerBeams[key]) { o.beam.scale.x = 1; o.pad.visible = true; }
          }
        }
        if (step.id === "zone-save") {
          repaint(rciScreen, signFace("SAVED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (step.id === "zone-verify") {
          repaint(rciScreen, signFace("VERIFIED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        }
        // load's own position/rotation are already set by the drag-and-drop
        // gesture itself (app.js snaps it onto load-socket on a successful
        // drop) — nothing to do here.
        if (step.id === "log-lift") {
          repaint(logFace, signFace("LIFT LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.32 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        signalPerson.userData.head.rotation.y = Math.sin(t * 0.7) * 0.5;
        twoBlockZone.material.emissiveIntensity = 1.3 + Math.sin(t * 3) * 0.5;
        if (!outriggersDown) boom.rotation.z = Math.sin(t * 0.3) * 0.01;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "level-check") {
            const off = ((gg.t - 0.5) * 6).toFixed(1);
            repaint(bubbleFace, signFace(`${off}°`, {
              bg: "#0d1c24", accent: gg.t > 0.46 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.45,
            }));
          }
          if (session.step?.id === "load-chart") {
            const pct = Math.round(gg.t * 100);
            repaint(chartPanel.userData.screen, signFace(`${pct}%`, {
              bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.85 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }

        // Test-swing toward the taught boundary as the RCI verify hold progresses.
        if (session?.step?.id === "zone-verify" && session.holding) {
          const p = Math.min(1, session.holdFor / session.step.seconds);
          crane.rotation.y = 0.3 + p * 0.5;
        }
      },
    };
  },
};
