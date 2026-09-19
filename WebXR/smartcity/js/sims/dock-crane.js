import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dock Crane VR — its own gamified system: Waterfront Authority.
// Container-crane lift over an active lashing gang. Nobody stands under a
// suspended box, lashings come off top-down, and a twist-lock indicator only
// means something once all four corners actually agree with it.

export const SIM_DOCK_CRANE = {
  id: "dock-crane",
  index: "20",
  domain: "Maritime",
  trade: "Longshoreman / container-crane operator",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "ILWU — OSHA 29 CFR 1917 qualified crane operator",
  name: "Dock Crane",
  title: simTitle("Dock Crane"),
  tagline: "Container lift: lashing release order, twist-lock verification and wind-limit discipline",
  accent: 0x3a7ca5,
  accentCss: "#3a7ca5",
  parSeconds: 240,
  badge: { id: "waterfront-certified", name: "Waterfront Certified", note: "Full lift cycle with the red zone clear and every lock verified" },

  game: system({
    name: "Waterfront Authority",
    currency: "DOCK",
    ranks: ["Lashing Hand", "Signal Person", "Crane Operator", "Gang Boss", "Waterfront Certified"],
    badges: [
      { id: "red-zone-clear", name: "Red Zone Clear", note: "Never stand under a suspended load", test: AWARD.safe },
      { id: "true-limits", name: "True Limits", note: "Hold every reading near band centre", test: AWARD.precise(0.72) },
      { id: "locks-verified", name: "Locks Verified", note: "Clear the twist-lock check with no correction", test: AWARD.stepClean("twist-lock-check") },
      { id: "agv-routed-clean", name: "AGV Routed Clean", note: "Teach the AGV route in order, first try", test: AWARD.stepClean("agv-teach") },
    ],
    challenges: [
      { id: "vessel-window", name: "Vessel Window", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "no-respot", name: "No Respot", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "gang-streak", name: "Gang Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "under-load-zone": "You stepped into the red zone directly beneath a suspended container. A dropped box or a parted sling gives nobody standing under it any time to react — the red zone stays empty for the entire lift, not just while it looks like it's moving.",
    "lashing-cutter": "That is a cutting tool, not a release. Cutting a lashing rod instead of unwinding the turnbuckle releases it with no control at all — exactly the uncontrolled shift that the top-down order exists to prevent.",
    "hoist-override": "That switch silences the unseated twist-lock warning instead of fixing it. Hoisting on an overridden warning means you find out which corner wasn't locked only after the container is already in the air.",
    "wind-override": "That switch bypasses the wind-speed lockout. Above the crane's rated wind limit the load can swing further than the operator can control, and overriding the limit does not change what the wind is actually doing to the box.",
  },

  lateNotes: {
    "spreader-bar": "The spreader only comes down onto the container once every lashing rod for that tier is off — not while one is still holding it to the stack.",
    "hoist-lever": "The hoist only takes weight once every corner lock reads engaged — not on three out of four.",
  },

  steps: [
    {
      id: "briefing", kind: "select", target: "lift-plan",
      title: "Hold the pre-lift briefing",
      cue: "Confirm the container weight, lift plan and the lashing gang's positions.",
      why: "The lashing gang and the crane operator are working the same box from two different places — the briefing is what keeps their timing matched.",
    },
    {
      id: "load-chart", kind: "select", target: "load-chart-board",
      title: "Check the load chart",
      cue: "Confirm the container's weight is inside the crane's rated capacity at this radius.",
      why: "Rated capacity falls as boom radius increases. The chart is checked for this specific lift, not assumed from a similar box lifted yesterday.",
    },
    {
      id: "wind-check", kind: "gauge", target: "anemometer",
      title: "Check wind speed against the rated limit",
      cue: "Read the anemometer and commit while it holds inside the crane's operating limit.",
      why: "A container is a sail once it leaves the stack. Wind speed against the crane's rated limit is checked before the box is off the chassis, not discovered mid-swing.",
      gauge: {
        label: "ANEMOMETER — WIND SPEED", speed: 0.55, green: [0.0, 0.42],
        readout: (t) => `${Math.round(t * 48)} mph`,
        missNote: "Over the crane's rated wind limit. Hold the lift and secure the boom until it drops.",
      },
    },
    {
      id: "red-zone-clear", kind: "select", target: "red-zone-marker",
      title: "Confirm the red zone is clear",
      cue: "Check and flag the red zone beneath the lift path clear of the lashing gang.",
      why: "This is confirmed before the box leaves the stack — once it's swinging, the red zone is not a place anyone can duck into or out of safely.",
    },
    {
      id: "lashing-release", kind: "sequence",
      targets: ["lash-top", "lash-mid", "lash-bottom"],
      itemNames: { "lash-top": "top-tier lashing rods", "lash-mid": "mid-tier lashing rods", "lash-bottom": "bottom-tier lashing rods" },
      title: "Release the lashings top-down",
      cue: "Unwind and free the lashing rods from the top tier down to the bottom.",
      why: "A stack is only stable while the tiers above are still tied. Releasing bottom-up leaves an upper tier held by nothing while someone is still standing among the containers.",
      outOfOrderNote: "Wrong order — lashings release top-tier first, then mid, then bottom. Bottom-up leaves an upper tier unsupported.",
    },
    {
      id: "spreader-position", kind: "select", target: "spreader-bar",
      title: "Position the spreader over the container",
      cue: "Land the spreader bar squarely on the container's corner castings.",
      why: "A spreader set even slightly off the castings will not seat the twist-locks properly no matter how solid they look going in.",
    },
    {
      id: "twist-lock-check", kind: "find", noHint: true,
      targets: ["corner-unlatched", "indicator-false"],
      itemNames: { "corner-unlatched": "unlatched corner lock", "indicator-false": "corner light showing false-locked" },
      itemNotes: {
        "corner-unlatched": "That twist-lock handle is still open — the corner casting is not actually captured no matter what the panel says.",
        "indicator-false": "That indicator reads locked but the lock itself has not rotated fully closed — the light is telling you something that isn't true.",
      },
      decoyNotes: {
        "corner-good-1": "That corner is fully seated and reading correctly — leave it.",
        "corner-good-2": "That corner is fully seated and reading correctly — leave it.",
      },
      title: "Verify all four twist-locks",
      cue: "Check each corner by hand. Two of the four don't match what the panel shows.",
      why: "The panel tells you what the sensors think happened. Checking the handles is how you find out what actually happened.",
    },
    {
      id: "signal-check", kind: "select", target: "signal-person",
      title: "Confirm with the signal person",
      cue: "Get a clear signal from the deck before taking any weight on the hook.",
      why: "The operator's view of the container is partly blocked from the cab. The signal person is watching the one angle the operator can't.",
    },
    {
      id: "hoist", kind: "select", target: "hoist-lever",
      title: "Take the lift",
      cue: "Take up slack smoothly and lift the container clear of the stack.",
      why: "A smooth take-up lets you feel the load coming on evenly. A snatched lift is how a marginal lock finally lets go.",
    },
    {
      id: "land-release", kind: "sequence",
      targets: ["lower-container", "release-twist-locks", "retract-spreader"],
      itemNames: { "lower-container": "lower onto the chassis", "release-twist-locks": "release the twist-locks", "retract-spreader": "retract the spreader" },
      title: "Land and release in order",
      cue: "Lower fully onto the chassis, confirm the hook is slack, then release the locks and retract.",
      why: "The locks only release once the container's full weight is back on the chassis — releasing early hands the load's weight to whatever is left holding it, which may be nothing.",
      outOfOrderNote: "Wrong order — the container lands and takes its own weight first, then the locks release, then the spreader retracts.",
    },
    {
      id: "agv-teach", kind: "sequence", targets: ["agv-wp-pickup", "agv-wp-transit", "agv-wp-stack"],
      itemNames: { "agv-wp-pickup": "Pickup waypoint", "agv-wp-transit": "Transit waypoint", "agv-wp-stack": "Stack waypoint" },
      title: "Teach the AGV route waypoints",
      cue: "Record the pickup, transit and stack points for the yard AGV, in that order.",
      why: "The AGV drives this route exactly in the order it was recorded — teach pickup, then transit, then stack, matching the path the container actually needs to travel.",
      itemNotes: {
        "agv-wp-pickup": "Recorded at the chassis where the container just landed.",
        "agv-wp-transit": "Recorded clear of the crane's swing radius and the lashing gang.",
        "agv-wp-stack": "Recorded at the destination stack.",
      },
      outOfOrderNote: "That point comes later in the route. Teach pickup, then transit, then stack — the AGV drives the points in recording order.",
    },
    {
      id: "agv-save", kind: "select", target: "agv-console-save",
      title: "Save the AGV route",
      cue: "Commit the three waypoints to the yard's AGV coordination system.",
      why: "An untaught point list is just recorded positions. Saving it is what turns three waypoints into a route the AGV can actually dispatch on.",
    },
    {
      id: "agv-run", kind: "hold", target: "agv-console-run", seconds: 2.5,
      title: "Dry-run the AGV route",
      cue: "Hold RUN/VERIFY and watch the route clear the swing radius and the gang before dispatch.",
      why: "A brand-new route is verified at walking pace with a hand on the console, watching the whole path, before an unmanned AGV ever drives it at full speed through a working yard.",
      holdBreakNote: "Released before the dry-run finished. Hold it through the whole route — that's how you catch a bad waypoint before the AGV drives it for real.",
    },
    {
      id: "log", kind: "select", target: "lift-plan",
      title: "Close the lift log",
      cue: "Record the lift weight, wind reading and lock verification, and sign the plan closed.",
      why: "The log is the record a surveyor or the next shift reads — what was lifted, in what wind, with which corners verified.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0x3a7ca5);

    // ------------------------------------------------------------------- container stack
    const stack = group(g, -0.9, 0, 0.2);
    const tierColors = [0xb8402f, 0x2f6f8c, 0xd8b23a];
    const rods = [];
    for (let tier = 0; tier < 3; tier++) {
      const box1 = box(stack, 1.1, 0.42, 0.5, 0, 0.25 + tier * 0.44, 0, tierColors[tier], { rough: 0.6, metal: 0.15 });
      const rod = cyl(stack, 0.012, 0.012, 0.4, -0.4, 0.05 + tier * 0.44, 0.3, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 8 });
      rod.rotation.z = Math.PI / 2.2;
      rods.push(rod);
    }
    reg(hits, rods[2], "lash-top");
    reg(hits, rods[1], "lash-mid");
    reg(hits, rods[0], "lash-bottom");
    holoTag(stack, "Stack 14 — 3 tier", 0, 1.6, 0.3, { css: "#3a7ca5", w: 0.36 });

    // Cutting tool left beside the stack — the shortcut trap.
    const cutter = group(g, -1.5, 0, 0.6, 0.4);
    box(cutter, 0.28, 0.03, 0.06, 0, 0.1, 0, 0xd8232a, { rough: 0.5 });
    box(cutter, 0.03, 0.14, 0.02, 0.12, 0.14, 0, 0x22272c, { rough: 0.5 });
    holoTag(cutter, "Bolt cutter", 0, 0.24, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, cutter, "lashing-cutter");

    // ------------------------------------------------------------------------- the crane
    const crane = group(g, 0.6, 0, -0.6);
    box(crane, 0.5, 2.6, 0.5, 0, 1.3, 0, 0x53585e, { rough: 0.55, metal: 0.4 });
    const boom = group(crane, 0, 2.6, 0, -0.1);
    box(boom, 3.0, 0.22, 0.3, 1.3, 0, 0, 0x3a7ca5, { rough: 0.5, metal: 0.3 });
    const trolley = group(boom, 2.4, -0.15, 0);
    box(trolley, 0.22, 0.14, 0.26, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const hoistCable = hose(trolley, [[0, 0, 0], [0, -1.5, 0]], 0.01, 0x22272c, { steps: 10, rough: 0.6 });

    const spreader = group(trolley, 0, -1.6, 0);
    box(spreader, 1.05, 0.1, 0.42, 0, 0, 0, 0x8b929a, { rough: 0.45, metal: 0.5 });
    holoTag(spreader, "Spreader bar", 0, 0.16, 0, { css: "#3a7ca5", w: 0.3 });
    reg(hits, spreader, "spreader-bar");

    const corners = [];
    const cornerFaces = {};
    const cornerSpecs = [
      { x: -0.48, z: -0.18, id: "corner-good-1" },
      { x: 0.48, z: -0.18, id: "corner-unlatched" },
      { x: -0.48, z: 0.18, id: "indicator-false" },
      { x: 0.48, z: 0.18, id: "corner-good-2" },
    ];
    for (const c of cornerSpecs) {
      const lockGroup = group(spreader, c.x, -0.08, c.z);
      cyl(lockGroup, 0.025, 0.025, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
      const handle = box(lockGroup, 0.09, 0.014, 0.014, 0, -0.06, 0, 0xf2c14b, { rough: 0.5 });
      const lamp = ball(lockGroup, 0.01, 0, -0.09, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
      corners.push({ lockGroup, handle, lamp, id: c.id });
      if (c.id === "corner-unlatched" || c.id === "indicator-false") reg(hits, lockGroup, c.id);
      if (c.id === "corner-unlatched") handle.rotation.y = 0.9;
      if (c.id === "indicator-false") lamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4 }); // shows green despite being unseated
    }

    const cab = group(crane, 0.35, 2.2, 0, -0.1);
    box(cab, 0.4, 0.35, 0.4, 0, 0, 0, 0xdfe4e8, { radius: 0.03, rough: 0.35, metal: 0.3 });
    const hoistLever = group(cab, -0.1, -0.1, 0.2);
    box(hoistLever, 0.02, 0.1, 0.02, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    holoTag(hoistLever, "Hoist lever", 0, 0.14, 0, { css: "#3a7ca5", w: 0.28 });
    reg(hits, hoistLever, "hoist-lever");

    const overrideSwitch = group(cab, 0.12, -0.1, 0.2);
    box(overrideSwitch, 0.05, 0.03, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    decal(overrideSwitch, 0.045, 0.018, 0, 0.02, 0.026, signFace("OVERRIDE", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.5 }), { px: 96 });
    holoTag(overrideSwitch, "Silence lock warning", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, overrideSwitch, "hoist-override");

    const windOverride = group(crane, -0.22, 1.7, 0.22, 0.3);
    box(windOverride, 0.06, 0.04, 0.03, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    decal(windOverride, 0.05, 0.022, 0, 0, 0.016, signFace("WIND BYPASS", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.42 }), { px: 96 });
    holoTag(windOverride, "Wind lockout bypass", 0, 0.09, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, windOverride, "wind-override");

    const anemo = group(crane, 0, 2.65, 0, 0.2);
    cyl(anemo, 0.01, 0.01, 0.3, 0, 0.15, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    const anemoInstrument = instrument(anemo, 0, 0.34, 0, { ry: 0, idle: "-- mph", color: 0x3a7ca5 });
    holoTag(anemo, "Anemometer", 0, 0.5, 0, { css: "#3a7ca5", w: 0.3 });
    reg(hits, anemoInstrument, "anemometer");

    // ------------------------------------------------------------------- red zone + gang
    const redZone = torus(g, 0.55, 0.02, 0.6, 0.01, -1.4, 0xf0645b, { emissive: 0xf0645b, ei: 1.3, rough: 0.4, cast: false, seg: 6, seg2: 32 });
    redZone.rotation.x = Math.PI / 2;
    reg(hits, box(g, 1.1, 0.02, 1.1, 0.6, 0.01, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false, receive: false }),
      "under-load-zone");
    holoTag(g, "Red zone", 0.6, 0.06, -1.95, { css: "#f0645b", w: 0.26 });

    const marker = group(g, 1.1, 0, -1.9, -0.3);
    cyl(marker, 0.012, 0.012, 0.7, 0, 0.35, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    box(marker, 0.14, 0.1, 0.01, 0, 0.66, 0, 0x3a7ca5, { rough: 0.5 });
    holoTag(marker, "Red zone marker", 0, 0.78, 0, { css: "#3a7ca5", w: 0.32 });
    reg(hits, marker, "red-zone-marker");

    const signal = standingFigure(g, 0.95, 0.23, { ry: -2.2, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(signal, "Signal person", 0, 1.95, 0.15, { css: "#3a7ca5", w: 0.3 });
    reg(hits, signal, "signal-person");

    // ------------------------------------------------------------------- landing chassis
    const chassis = group(g, -0.2, 0, 1.3);
    box(chassis, 1.2, 0.12, 0.5, 0, 0.06, 0, 0x53585e, { rough: 0.6, metal: 0.4 });
    for (const wx of [-0.5, 0.5]) for (const wz of [-0.2, 0.2]) {
      cyl(chassis, 0.09, 0.09, 0.08, wx, 0.04, wz, 0x1b1e22, { rough: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    }
    holoTag(chassis, "Chassis", 0, 0.2, 0.3, { css: "#3a7ca5", w: 0.24 });
    reg(hits, chassis, "lower-container");
    const releaseHandle = group(chassis, 0, 0.14, 0.22);
    box(releaseHandle, 0.06, 0.03, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, releaseHandle, "release-twist-locks");
    reg(hits, trolley, "retract-spreader");

    // -------------------------------------------------------- AGV coordination
    // Waypoints span from the chassis (pickup) through open yard clear of the
    // red zone (transit) to the destination stack — the same route an
    // automated guided vehicle would actually drive to clear the container.
    const agvWpSpecs = [
      { id: "agv-wp-pickup", label: "1 · Pickup", x: 0.45, z: 1.25, color: 0x59c97b },
      { id: "agv-wp-transit", label: "2 · Transit", x: -0.55, z: 0.75, color: 0x4fd1ff },
      { id: "agv-wp-stack", label: "3 · Stack", x: -1.15, z: 0.35, color: 0xffcc00 },
    ];
    const agvWps = agvWpSpecs.map((s) => {
      const marker = torus(g, 0.09, 0.012, s.x, 0.02, s.z, s.color,
        { emissive: s.color, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 24 });
      marker.rotation.x = Math.PI / 2;
      holoTag(g, s.label, s.x, 0.24, s.z, { css: "#3a7ca5", w: 0.32 });
      reg(hits, marker, s.id);
      return marker;
    });

    const agv = group(g, 0.45, 0, 1.55, 0.3);
    box(agv, 0.4, 0.14, 0.6, 0, 0.09, 0, 0xd8b23a, { rough: 0.5, metal: 0.3 });
    holoTag(agv, "Yard AGV", 0, 0.24, 0, { css: "#3a7ca5", w: 0.26 });

    const agvConsole = group(g, 0.9, 0, 1.0, -0.5);
    slab(agvConsole, 0.34, 0.28, 0.03, 0, 0.9, 0, 0xf2c14b, { radius: 0.02, rough: 0.55 });
    const agvConsoleScreen = decal(agvConsole, 0.28, 0.12, 0, 0.94, 0.017,
      signFace("AGV COORD", { bg: "#2a1a0d", accent: "#f2c14b", fg: "#ffe3ac", scale: 0.4 }), { glow: true, ei: 0.85, px: 220 });
    holoTag(agvConsole, "AGV coordination console", 0, 1.06, 0, { css: "#3a7ca5", w: 0.38 });
    const agvSaveBtn = cyl(agvConsole, 0.018, 0.018, 0.012, -0.07, 0.75, 0.017, 0x59c97b, { rough: 0.4, seg: 14 });
    agvSaveBtn.rotation.x = Math.PI / 2;
    reg(hits, agvSaveBtn, "agv-console-save");
    const agvRunBtn = cyl(agvConsole, 0.018, 0.018, 0.012, 0.07, 0.75, 0.017, 0x4fd1ff, { rough: 0.4, seg: 14 });
    agvRunBtn.rotation.x = Math.PI / 2;
    reg(hits, agvRunBtn, "agv-console-run");
    holoTag(agvConsole, "Save · Run", 0, 0.7, 0, { css: "#3a7ca5", w: 0.26 });

    // ------------------------------------------------------------------------- paperwork
    const chest = toolChest(g, 1.8, 1.3, { ry: -0.7, color: 0x3a7ca5 });
    const chart = holoPanel(g, 0.56, 0.4, 1.9, 1.5, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3a7ca5"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#9dc0d4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOAD CHART — CRANE 6", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf4fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("40 FT BOX — 28.4 t", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#9dc0d4";
      ["Rated at radius: 32 t", "Wind limit: 20 mph",
       "Lashings: top, mid, bottom", "Locks: all 4 corners verified",
       "Red zone: clear before lift"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: -0.6, accent: 0x3a7ca5 });
    reg(hits, chart, "load-chart-board");

    const plan = holoPanel(g, 0.44, 0.3, -1.9, 1.5, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3a7ca5"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf4fb";
      ctx.font = `600 ${Math.round(h * 0.18)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PRE-LIFT PLAN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      ctx.fillStyle = "#9dc0d4";
      ctx.fillText("Vessel 4 — bay 14, stack 14", w / 2, h * 0.62);
      ctx.fillText("Gang: 3 lashers + signal", w / 2, h * 0.8);
    }, { ry: 0.6, accent: 0x3a7ca5 });
    reg(hits, plan, "lift-plan");

    let hoisting = false;

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "lashing-release") rods.forEach((r) => { r.visible = false; });
        if (step.id === "twist-lock-check") {
          corners.forEach((c) => { c.handle.rotation.y = 0; c.lamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); });
        }
        if (step.id === "hoist") { hoisting = true; }
        if (step.id === "land-release") { hoisting = false; spreader.position.y = -1.6; }
        if (step.id === "agv-save") {
          repaint(agvConsoleScreen, signFace("SAVED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.45 }));
        }
        if (step.id === "agv-run") {
          repaint(agvConsoleScreen, signFace("VERIFIED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.36 }));
        }
      },

      animate(t, dt, session) {
        if (hoisting) {
          const lift = Math.min(0.6, (t % 3) * 0.3);
          spreader.position.y = -1.6 + lift;
          hoistCable.scale.y = 1 - lift / 1.5;
        }
        signal.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;

        // Dry-run playback: the AGV rides the taught route — pickup to
        // transit to stack — in step with the RUN/VERIFY hold progress.
        if (session?.step?.id === "agv-run" && session.holding) {
          const p = Math.min(1, session.holdFor / session.step.seconds);
          const from = p < 0.5 ? agvWps[0] : agvWps[1];
          const to = p < 0.5 ? agvWps[1] : agvWps[2];
          const localP = p < 0.5 ? p * 2 : (p - 0.5) * 2;
          agv.position.lerpVectors(from.position, to.position, localP);
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "wind-check") {
          const v = Math.round(gg.t * 48);
          repaint(anemoInstrument.userData.screen, signFace(`${v} mph`, {
            bg: "#0d1c24", accent: gg.t < 0.42 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
