import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles,
  gradientFill, noiseTexture,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, valveWheel, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Haul Road Dust VR — Environmental Monitoring, station
// ninety-eight.
//
// Dust control on a remediation site's haul road during a soil haul from a
// generic excavation cell to the public road — a former shipyard tract on a
// bay shoreline, under a federal cleanup order, not any one named site. The
// crew here is not the one digging; station soil-loadout covers loading the
// truck. This is the discipline that keeps the haul itself from becoming its
// own uncontrolled release once the wind picks up: a perimeter monitor read
// and answered rather than muted, a road wetted on a schedule rather than by
// feel, a load tarped before it ever reaches the gate, and a wheel wash and
// a street sweep that stand between this cell's own dirt and the public
// road it borders.

const HRD_ACCENT = 0xffcf33;

/** The haul road surface: packed, dusty gravel rather than a flat tan
 *  rectangle — a warm base, a fine grain, and pale tire-track streaks
 *  running the length of the strip where trucks have already worn it in. */
function haulRoadFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#7a6a45"], [1, "#6a5c3a"]], { horizontal: true });
  noiseTexture(g, w, h, { density: 3000, alpha: 0.09, tone: "40,32,16" });
  noiseTexture(g, w, h, { density: 1200, alpha: 0.06, tone: "210,200,170" });
  for (const [xf, wf] of [[0.28, 0.05], [0.68, 0.055]]) {
    g.fillStyle = "rgba(30,24,12,0.16)";
    g.fillRect(w * (xf - wf / 2), 0, w * wf, h);
    g.fillStyle = "rgba(230,220,190,0.08)";
    g.fillRect(w * (xf - wf / 2) - 3, 0, 3, h);
    g.fillRect(w * (xf + wf / 2), 0, 3, h);
  }
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * h, x = Math.random() * w, len = 10 + Math.random() * 26;
    g.fillStyle = `rgba(90,76,48,${(0.06 + Math.random() * 0.08).toFixed(3)})`;
    g.fillRect(x, y, len, 1.4);
  }
}

export const SIM_HAUL_ROAD_DUST = {
  id: "haul-road-dust",
  index: "98",
  domain: "Environmental",
  trade: "Haul road dust control crew — Teamsters haul and water-truck drivers, LIUNA laborers, IUOE Local 3",
  category: "Environmental Monitoring",
  weather: "wind",
  certification: "Teamsters drivers on the haul trucks and the water truck; LIUNA laborers on the wheel wash and the sweep; IUOE Local 3 on the water truck's pump and spray-bar equipment; the site's Dust Control Plan under the cleanup order; Bay Area AQMD Regulation 6 particulate limits and its construction dust requirements; EPA 40 CFR Part 58 monitor siting and operation; OSHA 1926 traffic-control provisions; DOT load-securement rules for the tarp",
  name: "Haul Road Dust",
  title: simTitle("Haul Road Dust"),
  tagline: "Dust control on the haul road during a soil haul: monitors read against their action level, the road wetted on the plan's schedule, the load tarped and washed clean before the gate, and the alarm that stops the haul the moment the wind turns",
  accent: HRD_ACCENT,
  accentCss: "#ffcf33",
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "clean-haul", name: "Clean Haul", note: "Every pass wetted to the plan's frequency, every load tarped and washed before the gate, and the alarm answered the instant the wind turned" },

  game: system({
    name: "Dust Control",
    currency: "PASS",
    ranks: ["Ground Hand", "Wash Attendant", "Pass Lead", "Monitor Authority", "Dust Control Certified"],
    badges: [
      { id: "never-through-alarm", name: "Never Through The Alarm", note: "Never silenced a monitor alarm or let a load through unwashed or untarped", test: AWARD.safe },
      { id: "steady-pass", name: "Steady Pass", note: "Held the wetting and sweeping passes inside the band the whole strip", test: AWARD.precise(0.7) },
      { id: "log-true", name: "Log True", note: "Closed out the monitor log with no correction", test: AWARD.stepClean("log-reconcile") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the shift", test: AWARD.clean },
      { id: "unbroken-pass", name: "Unbroken Pass", note: "Never broke a wetting or sweeping pass", test: AWARD.unbroken },
      { id: "gate-early", name: "Gate Early", note: "Reconciled the log inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "silence-alarm": "You hit continue on the dust monitor while it was alarming, to keep the water truck moving on to the next pass. The monitor is the only real-time protection the public road and the fence line have from this haul — silencing it while the reading is over the action level just means whoever is downwind of the plume absorbs the difference instead of the haul.",
    "skip-wet-pass": "You opened the bypass and let the spray bar skip a pass to save tank water. The plan's wetting frequency is not a suggestion — it is the number that keeps this road from drying out faster than the trucks can re-wet it, and one skipped pass is a dry stretch of road that every truck after it kicks straight into the air.",
    "wash-bypass": "You pulled the bypass lever and waved a truck through the gate without running the wheel wash. Tracked soil off this cell is exactly what the wash exists to stop before it reaches a public road — a truck that skips it carries the cell out through its own tires no matter how well the load itself was tarped.",
    "sweep-early": "You called the sweep done and pulled the sweeper off the road before the last pass finished. A partial sweep leaves exactly the tracked soil the wash and the tarp were supposed to keep off this stretch sitting on a public road at the end of the shift, for whatever rain or wind moves it next.",
  },

  lateNotes: {
    "water-truck": "Nothing to wet yet — the spray bar has to actually be checked and the valve opened before the truck rolls a pass, or the first pass is guessing at whether the bar even works.",
    "tarp-roll": "Nothing to tarp until the truck is actually loaded and staged at the cell mouth — a tarp pulled over an empty bed proves nothing about the load that hasn't left yet.",
    "decon-wash": "Nothing to wash yet — the load has to be tarped first, or a clean pair of tires on an uncovered load is only half the job done.",
    "street-sweeper": "Nothing to sweep yet — the day's hauling has to actually be finished, or the sweeper is chasing trucks that are still tracking fresh soil behind it.",
    "monitor-log-board": "Nothing to reconcile yet — the wetting and sweeping passes have to actually be run before there's anything on the log to check them against.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a track or a hold step — a gauge, select or sequence step resolves in
  // one action, too fast for the fuse to ever catch the learner mid-task.
  interrupts: [
    {
      id: "wind-alarm",
      kind: "Dust alarm",
      after: "wet-pass", delay: 4, seconds: 13,
      alert: "The downwind perimeter monitor just alarmed above the action level — the wind has freshened and swung onshore while the water truck is still mid-pass.",
      cue: "Stop the haul now, before anything else in the plan's response matters.",
      target: "haul-stop",
      why: "Stop is the first word in the plan's own alarm response for a reason — every truck that leaves the cell after the alarm sounds adds more dust to a plume that is already over the action level, and wetting the road or calling it in does no good while trucks are still moving through the source.",
      missNote: "Two more trucks rolled out of the cell while the monitor sat above the action level, and the plume that crossed the fence line during those minutes is not something a wetter road afterward gets back.",
      wrongNote: "Not that — the haul has to stop first. Everything else in the plan's response waits on the trucks actually being still.",
    },
    {
      id: "untarped-departure",
      kind: "Untarped departure",
      after: "wheel-wash", delay: 3, seconds: 12,
      alert: "A second haul truck is already rolling for the gate with its bed wide open — nobody tarped that load before it left the cell.",
      cue: "Flag it down before it reaches the gate; an untarped load doesn't get to leave the cell.",
      target: "flag-down",
      why: "A loaded bed moving at road speed is a dust source with no monitor watching it at all — everything the wetting passes, the wash and the tarp step were built to contain is blowing off the back of a truck the moment it clears the gate, and the gate is the last place anyone can stop it before that.",
      missNote: "The second truck cleared the gate untarped and was most of a mile down the public road, shedding dust the whole way, before anyone at the cell realized it had never been checked.",
      wrongNote: "Not that — flag the truck down. Nothing else at the gate keeps an untarped load from reaching the public road.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "dust-plan-board",
      title: "Read the dust control plan and the day's wind forecast",
      cue: "Check the wetting frequency, the monitor action level and the day's wind forecast before the water truck rolls.",
      why: "Everything that follows — how often the road gets wetted, what a monitor reading over the action level actually means today, whether the forecast wind is going to carry a plume toward the fence line or away from it — is set from this plan and this forecast, not from habit or from how the road looked yesterday.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the haul road",
      cue: "Hi-vis vest and hard hat before standing anywhere near a moving truck.",
      why: "Every driver on this strip is watching for a ground crew that is visible against dust and dirt from a cab well above eye level — vest and hardhat are what make a person on foot readable to a driver at speed, not a formality before the real work starts.",
    },
    {
      id: "monitor-check", kind: "gauge", target: "dust-monitor",
      title: "Check the perimeter dust monitors and note the action level",
      cue: "Read both perimeter monitors and commit only once the reading settles inside the pre-haul baseline band.",
      why: "This is the number the whole shift gets measured against, and the action level printed on the monitor is the line that turns a normal reading into a stop-the-haul reading. A crew that never reads the baseline has no way to prove a later alarm was the haul and not just where the monitors always happened to sit.",
      gauge: {
        label: "PM10 BASELINE", speed: 0.6, green: [0.36, 0.55],
        readout: (t) => `${Math.round(t * 60)} µg/m³`,
        missNote: "That is not a settled baseline — read the monitors again before the water truck rolls its first pass.",
      },
    },
    {
      id: "sprayer-check", kind: "select", target: "spray-bar",
      title: "Check the water truck's spray bar",
      cue: "Walk the spray bar and confirm every nozzle is clear before the truck rolls a pass.",
      why: "A clogged nozzle on one end of the bar wets one side of the road and leaves the other side dry, and nobody finds that out from the cab — it takes a walk down the bar with the truck stopped, before the first pass, to catch a nozzle that is going to under-wet a whole lane all shift.",
    },
    {
      id: "spray-valve", kind: "turn", target: "spray-valve",
      title: "Open the spray bar valve",
      cue: "Turn the valve open before the truck starts its first pass down the strip.",
      why: "The bar has to already be delivering water when the truck starts moving, not partway down the first pass — a valve opened late leaves the first stretch of road exactly as dry as it was before the truck ever rolled onto it.",
      turn: { turns: 0.6, axis: "y", label: "SPRAY BAR" },
    },
    {
      id: "wet-pass", kind: "track", target: "water-truck", seconds: 9,
      title: "Wet the road in passes at the plan's frequency",
      cue: "Drive the strip at the plan's speed, keeping the delivery inside the band so every pass overlaps the last.",
      why: "Too fast and the bar lays down a wet line the sun and the next truck's tires dry out before the following pass ever reaches it; too slow and the truck falls behind the frequency the plan actually calls for, leaving the far end of the strip running dry while the water truck is still working the near end.",
      track: {
        start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "PASS SPEED",
        readout: (v) => (v < 0.4 ? "too fast — under-wetted" : v > 0.6 ? "too slow — behind schedule" : "wetting at spec"),
      },
      holdBreakNote: "Pass speed drifted out of the band — at that pace the bar is either skating over ground it never really wetted or falling behind the plan's schedule. Bring it back and hold the pass.",
    },
    {
      id: "speed-post", kind: "sequence",
      targets: ["speed-sign", "briefing-log"],
      itemNames: { "speed-sign": "post the speed sign", "briefing-log": "sign the driver briefing" },
      title: "Sign and enforce the haul-truck speed limit",
      cue: "Post today's speed limit sign at the cell mouth, then log every driver's sign-off on the briefing before the first truck rolls.",
      why: "A speed limit that isn't posted and isn't tied to a signature is a number a driver can claim never to have heard — posting the sign is what makes the limit visible on the strip, and the sign-off is what makes it enforceable against a specific driver who is now on record as having heard it.",
      outOfOrderNote: "The sign goes up first, so there is something on the strip to actually brief drivers against — signing them onto a limit that isn't posted anywhere is signing them onto nothing.",
    },
    {
      id: "tarp", kind: "drag", target: "tarp-roll",
      title: "Tarp the load before it leaves the cell",
      cue: "Pull the tarp over the full bed and secure every corner before the truck rolls for the gate.",
      why: "A loaded bed is a dust source the moment the truck starts moving, and this strip has no monitor watching a truck once it clears the cell — the tarp is what keeps this load from becoming its own uncontrolled release for every metre of road between here and the gate.",
      drag: { to: "truck-load-socket", radius: 0.42, missNote: "Not pulled over the load — a tarp bunched at one corner leaves the rest of the bed open to the wind the moment the truck moves." },
    },
    {
      id: "wheel-wash", kind: "hold", target: "decon-wash", seconds: 5,
      title: "Run the wheel wash at the gate",
      cue: "Hold the wash running until the undercarriage and every tire run clear.",
      why: "Tracked soil off this cell is exactly what a wheel wash exists to stop before it reaches a public road — cutting the wash short means the truck carries the cell out through its tires no matter how well the load itself was tarped, and that track record sits on the public road until somebody sweeps it.",
      holdBreakNote: "Cut the wash short — the tires were still running dirty when it stopped. Hold it until they actually run clear.",
    },
    {
      id: "sweep", kind: "track", target: "street-sweeper", seconds: 8,
      title: "Sweep the public road at shift's end",
      cue: "Drive the sweeper along the frontage in overlapping passes, keeping speed inside the band.",
      why: "A sweeper run too fast skips the same fine material a wheel wash occasionally lets through, and one run too slow leaves the crew still out on a public road well after the haul that justified the traffic control has stopped — the band is what actually clears a full shift's tracked soil in one pass down the frontage.",
      track: {
        start: 0.1, green: [0.38, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "SWEEP PASS",
        readout: (v) => (v < 0.38 ? "too fast — soil left behind" : v > 0.6 ? "too slow — behind schedule" : "sweeping at spec"),
      },
      holdBreakNote: "Sweep speed drifted out of the band — bring it back before the pass leaves a stretch of frontage half-cleaned.",
    },
    {
      id: "log-reconcile", kind: "select", target: "monitor-log-board",
      title: "Reconcile the monitor log with the day's passes",
      cue: "Check the monitor readings against the wetting and sweeping passes actually logged, and sign the shift closed.",
      why: "A clean monitor reading and a haul that actually ran to the plan are two different claims, and this is where they get checked against each other — a monitor log with no record of the passes that were supposed to keep it clean is a shift nobody can reconstruct if a reading is ever questioned later.",
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["tracked-patch"],
      itemNames: { "tracked-patch": "tracked soil patch" },
      itemNotes: { "tracked-patch": "That patch of the public frontage still shows tire tracks in soil the sweep missed — exactly the material the wash and the tarp were supposed to keep off this stretch, sitting on it at the end of the shift." },
      title: "Walk the frontage before signing off",
      cue: "Walk the swept stretch of public road and click the one patch that's still tracked.",
      why: "The sweep step and this walk are different skills — driving the sweeper down the frontage is not the same as noticing, from the ground, that one patch never actually got cleared. This is the last look before the shift is signed as clean.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, HRD_ACCENT);

    // -------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.6, 0, 0.07, 0, 0xffffff, { rough: 0.97 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#544726", base2: "#463b20", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.97, metal: 0.02, color: 0xc4b586 },
    );

    // ----------------------------------------------------------- haul road
    // A raised strip rather than a flat tinted rectangle — the cell mouth at
    // one end, the gate at the other, the same treatment trench-box and
    // hot-tap give an excavation.
    const ROAD_TOP = 0.14 + 0.16;
    const road = box(g, 1.5, 0.16, 3.9, 0, 0.14 + 0.08, 0, 0xffffff, { rough: 0.9, cast: false });
    road.material = texturedMat(
      surfaceTexture((cx, w, h) => haulRoadFace(cx, w, h), { repeat: 4, px: 512 }),
      { rough: 0.88, metal: 0.02, color: 0xcabb8a },
    );
    // A wet sheen overlay, invisible until the first wetting pass runs.
    const wetOverlay = box(g, 1.4, 0.004, 3.8, 0, ROAD_TOP + 0.003, 0, 0x1c2a30, { rough: 0.2, opacity: 0.28, transparent: true, cast: false });
    wetOverlay.visible = false;
    // Shoulder gravel either side of the raised strip.
    for (const sx of [-1.0, 1.0]) box(g, 0.6, 0.1, 3.8, sx, 0.14 + 0.05, 0, 0x453a20, { rough: 0.95, cast: false });

    // -------------------------------------------------------------- cell end
    const cell = group(g, 0, ROAD_TOP, -1.75);
    box(cell, 1.3, 0.02, 0.5, 0, 0.011, 0, 0x2f2618, { rough: 0.98, cast: false });
    const stockpile = box(cell, 0.9, 0.4, 0.6, -0.9, 0.2, -0.35, 0x4a3a24, { rough: 0.96 });
    stockpile.rotation.y = 0.3;
    holoTag(cell, "cell mouth", 0, 0.4, 0.3, { css: "#ffcf33", w: 0.34 });

    // ------------------------------------------------------------ wind vane
    const vane = group(g, -2.1, 0.14, 1.8);
    cyl(vane, 0.02, 0.02, 1.9, 0, 0.95, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    const arrow = group(vane, 0, 1.95, 0, 0.6);
    box(arrow, 0.32, 0.02, 0.02, 0, 0, 0, 0xffffff, { rough: 0.5 });
    box(arrow, 0.09, 0.09, 0.01, 0.14, 0, 0, 0xd2312b, { rough: 0.5 });
    const cups = group(vane, 0, 1.68, 0);
    for (let i = 0; i < 3; i++) { const c = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3); box(c, 0.15, 0.01, 0.01, 0.075, 0, 0, CITY.steel, { rough: 0.5, metal: 0.6 }); ball(c, 0.028, 0.15, 0, 0, 0x22262b, { rough: 0.6 }); }
    holoTag(vane, "wind forecast: freshening onshore", 0, 1.3, 0.05, { css: "#ffcf33", w: 0.56 });

    // ------------------------------------------------------------- dust plan
    const planPost = group(g, -2.2, 0, 1.1, 0.4);
    const planBoard = holoPanel(planPost, 0.9, 0.6, 0, 1.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#241a05"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffcf33"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("DUST CONTROL PLAN — HAUL ROAD", w * 0.06, h * 0.12);
      ctx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; ctx.fillStyle = "#ffe9bf";
      ["Wetting frequency: every 20 min", "Monitor action level: 150 µg/m³ PM10",
       "Haul speed limit: 10 mph", "Load: tarped before the gate",
       "Wheel wash: every truck, every time", "Wind forecast: freshening onshore, PM"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.26 + i * 0.115));
      });
    }, { accent: HRD_ACCENT });
    reg(hits, planBoard, "dust-plan-board");

    // ------------------------------------------------------------- monitor
    const monitor = group(g, -1.7, 0.14, -0.6);
    box(monitor, 0.34, 0.48, 0.28, 0, 0.44, 0, 0xe8eef2, { rough: 0.5, metal: 0.2 });
    cyl(monitor, 0.03, 0.03, 0.38, 0, 0.87, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 12 });
    cyl(monitor, 0.065, 0.045, 0.11, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, seg: 16 });
    const monScreen = decal(monitor, 0.26, 0.11, 0, 0.53, 0.141, signFace("-- µg/m³", { bg: "#241a05", accent: "#ffcf33", fg: "#ffe9bf", scale: 0.6 }), { glow: true, ei: 0.8 });
    holoTag(monitor, "perimeter dust monitor", 0, 0.78, 0.15, { css: "#ffcf33", w: 0.48 });
    reg(hits, monitor, "dust-monitor");
    const strobe = ball(monitor, 0.035, 0.11, 0.95, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.2, rough: 0.4 });
    const muteBtn = box(monitor, 0.06, 0.03, 0.02, 0.1, 0.28, 0.15, 0x22262b, { rough: 0.6 });
    decal(muteBtn, 0.055, 0.02, 0, 0, 0.011, signFace("CONTINUE", { bg: "#22262b", accent: "#d2312b", scale: 0.55 }));
    reg(hits, muteBtn, "silence-alarm");

    // ------------------------------------------------------------ haul-stop
    const haulStop = group(g, -0.9, ROAD_TOP, -1.4);
    cyl(haulStop, 0.03, 0.04, 0.9, 0, 0.45, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const stopHead = ball(haulStop, 0.06, 0, 0.92, 0, 0xd2312b, { emissive: 0xd2312b, ei: 0.6, rough: 0.4 });
    void stopHead;
    decal(haulStop, 0.16, 0.16, 0, 0.92, 0.061, signFace("STOP", { bg: "#7a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(haulStop, "haul stop", 0, 1.06, 0, { css: "#ffcf33", w: 0.3 });
    reg(hits, haulStop, "haul-stop");

    // ------------------------------------------------------------ water truck
    const waterTruck = group(g, -0.4, ROAD_TOP, -0.4, -0.3);
    box(waterTruck, 1.3, 0.6, 0.85, 0, 0.5, 0, 0x6fa8b8, { rough: 0.55, metal: 0.25 });
    cyl(waterTruck, 0.32, 0.32, 0.7, 0, 0.9, 0, 0x6fa8b8, { rough: 0.55, metal: 0.25, seg: 18 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(waterTruck, 0.2, 0.2, 0.2, sx * 0.7, 0.2, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    const bar = group(waterTruck, 0.65, 0.16, 0);
    box(bar, 0.05, 0.05, 0.9, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.5 });
    for (let i = -3; i <= 3; i++) {
      const nozzle = cyl(bar, 0.012, 0.016, 0.05, 0, -0.03, i * 0.13, 0x22262b, { rough: 0.5, metal: 0.5, seg: 8 });
      void nozzle;
    }
    holoTag(bar, "spray bar", 0, 0.14, 0, { css: "#ffcf33", w: 0.28 });
    reg(hits, bar, "spray-bar");
    const sprayValveMount = group(waterTruck, 0.4, 0.95, 0);
    const sprayValve = valveWheel(sprayValveMount, 0, 0, 0.1, { r: 0.055, color: HRD_ACCENT, body: 0x2b2f34 });
    reg(hits, sprayValve.userData.wheel, "spray-valve");
    const spray = particles(bar, 60, 0x6fb4d8, { size: 0.025, life: 0.6, additive: false, opacity: 0.65 });
    holoTag(waterTruck, "water truck", -0.6, 1.05, 0, { css: "#ffcf33", w: 0.3 });
    // The bypass valve that lets a pass go dry.
    const bypassValve = box(waterTruck, 0.09, 0.03, 0.05, 0.55, 0.65, 0.3, 0xd2312b, { rough: 0.5 });
    decal(bypassValve, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP PASS", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.45 }));
    holoTag(waterTruck, "skip the pass?", 0.55, 0.72, 0.3, { css: "#d2312b", w: 0.44 });
    reg(hits, bypassValve, "skip-wet-pass");
    reg(hits, waterTruck, "water-truck");

    // ------------------------------------------------------------- speed sign
    const signPost = group(g, 0.6, ROAD_TOP, -1.1, -0.2);
    cyl(signPost, 0.025, 0.025, 1.3, 0, 0.65, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const signBoard = box(signPost, 0.32, 0.32, 0.02, 0, 1.3, 0, 0xffffff, { rough: 0.55 });
    decal(signBoard, 0.28, 0.28, 0, 0, 0.011, signFace("10 MPH", { bg: "#ffffff", accent: "#1b1e22", scale: 0.6 }), { px: 200 });
    holoTag(signPost, "haul speed limit", 0, 1.5, 0, { css: "#ffcf33", w: 0.34 });
    reg(hits, signBoard, "speed-sign");
    const briefClip = group(signPost, 0.3, 0.7, 0, 0.4);
    box(briefClip, 0.14, 0.005, 0.2, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(briefClip, 0.12, 0.18, 0, 0.004, 0, signFace("DRIVER BRIEFING", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.34 })).rotation.x = -Math.PI / 2;
    holoTag(briefClip, "briefing log", 0, 0.14, 0, { css: "#ffcf33", w: 0.32 });
    reg(hits, briefClip, "briefing-log");

    // -------------------------------------------------------------- truck 1
    const truck = group(g, 0.55, ROAD_TOP, 0.5, -0.2);
    box(truck, 0.9, 0.7, 0.75, -0.85, 0.5, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 0.55, 0.06, 0.75, -0.85, 0.86, 0, 0x2b2f34, { rough: 0.7 });
    const bed = group(truck, 0.5, 0, 0);
    box(bed, 1.6, 0.5, 1.0, 0, 0.28, 0, 0x8a939b, { rough: 0.55, metal: 0.35 });
    const bedFloor = box(bed, 1.5, 0.02, 0.9, 0, 0.04, 0, 0x2b2f34, { rough: 0.8, cast: false });
    void bedFloor;
    for (const sx of [-1, 1]) cyl(truck, 0.22, 0.22, 0.22, sx * 1.0, 0.22, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    cyl(truck, 0.22, 0.22, 0.22, -1.55, 0.22, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    const loadSocket = group(bed, 0, 0.3, 0);
    hits["truck-load-socket"] = loadSocket;
    const soilLoad = box(bed, 1.35, 0.28, 0.8, 0, 0.24, 0, 0x4a3a24, { rough: 0.95 });
    void soilLoad;
    holoTag(truck, "haul truck", -0.85, 1.0, 0, { css: "#ffcf33", w: 0.3 });
    const tarpRoll = group(g, 1.4, ROAD_TOP, 0.15, 0.3);
    cyl(tarpRoll, 0.1, 0.1, 0.8, 0, 0.1, 0, 0x2b3138, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(tarpRoll, "tarp roll", 0, 0.3, 0, { css: "#ffcf33", w: 0.28 });
    reg(hits, tarpRoll, "tarp-roll");
    const tarpMesh = box(bed, 1.4, 0.03, 0.85, 0, 0.42, 0, 0x2b3138, { rough: 0.7, cast: false });
    tarpMesh.visible = false;

    // ---------------------------------------------------------------- truck 2
    // The second truck, parked at the cell mouth until the "untarped
    // departure" interrupt sends it rolling for the gate.
    const truck2 = group(g, -0.7, ROAD_TOP, -1.5, -0.3);
    box(truck2, 0.85, 0.66, 0.7, -0.8, 0.48, 0, 0xd8dde2, { rough: 0.55, metal: 0.25 });
    box(truck2, 0.5, 0.06, 0.7, -0.8, 0.82, 0, 0x2b2f34, { rough: 0.7 });
    const bed2 = group(truck2, 0.45, 0, 0);
    box(bed2, 1.5, 0.46, 0.94, 0, 0.26, 0, 0x8a939b, { rough: 0.55, metal: 0.35 });
    box(bed2, 1.3, 0.26, 0.76, 0, 0.24, 0, 0x4a3a24, { rough: 0.95 });
    for (const sx of [-1, 1]) cyl(truck2, 0.2, 0.2, 0.2, sx * 0.95, 0.2, 0.3, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(truck2, "second haul truck", -0.8, 0.95, 0, { css: "#ffcf33", w: 0.4 });

    // -------------------------------------------------------------- wheel wash
    const wash = group(g, 0, ROAD_TOP, 1.15, 0);
    const washPad = box(wash, 1.3, 0.02, 0.9, 0, 0.011, 0, 0xffffff, { rough: 0.55, metal: 0.35, cast: false });
    washPad.material = texturedMat(
      surfaceTexture((cx, w, h) => haulRoadFace(cx, w, h), { repeat: 4, px: 256 }),
      { rough: 0.4, metal: 0.4, color: 0x8a9298 },
    );
    for (const sx of [-0.5, 0.5]) cyl(wash, 0.03, 0.03, 0.9, sx, 0.3, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    holoTag(wash, "wheel wash", 0, 0.55, 0, { css: "#ffcf33", w: 0.32 });
    reg(hits, wash, "decon-wash");
    const washSpray = particles(wash, 30, 0x6fb4d8, { size: 0.02, life: 0.4, additive: false, opacity: 0.6 });
    // The bypass lever that lets a truck skip the wash entirely.
    const washBypass = group(wash, 0.6, 0, -0.4, -0.3);
    box(washBypass, 0.04, 0.28, 0.04, 0, 0.14, 0, 0xd2312b, { rough: 0.55 });
    decal(washBypass, 0.16, 0.05, 0, 0.3, 0, signFace("BYPASS WASH", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.42 }));
    reg(hits, washBypass, "wash-bypass");

    // ---------------------------------------------------------------- gate
    const gate = group(g, 0, ROAD_TOP, 1.75, 0);
    for (const sx of [-0.65, 0.65]) cyl(gate, 0.05, 0.05, 1.4, sx, 0.7, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    box(gate, 1.4, 0.05, 0.05, 0, 1.3, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const flagPaddle = group(gate, -0.4, 0, 0.35, 0.4);
    cyl(flagPaddle, 0.012, 0.012, 0.5, 0, 0.25, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(flagPaddle, 0.18, 0.18, 0.01, 0, 0.52, 0, 0xd2312b, { rough: 0.6 });
    holoTag(flagPaddle, "flag down", 0, 0.68, 0, { css: "#ffcf33", w: 0.3 });
    reg(hits, flagPaddle, "flag-down");

    const logBoard = holoPanel(gate, 0.6, 0.42, 0.5, 1.3, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "#241a05"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffcf33"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("MONITOR LOG", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#ffe9bf";
      ["Wetting passes: —", "Sweep passes: —", "Monitor peak: -- µg/m³"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.36 + i * 0.16));
      });
    }, { ry: -0.3, accent: HRD_ACCENT });
    reg(hits, logBoard, "monitor-log-board");

    // -------------------------------------------------------------- sweeper
    const sweeper = group(g, 0.4, ROAD_TOP, 2.4, -0.2);
    box(sweeper, 1.0, 0.5, 0.7, 0, 0.4, 0, 0x8a939b, { rough: 0.55, metal: 0.3 });
    cyl(sweeper, 0.16, 0.16, 0.5, -0.55, 0.16, 0, 0x2b2f34, { rough: 0.7, seg: 16 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(sweeper, 0.18, 0.18, 0.18, sx * 0.42, 0.18, 0.36, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(sweeper, "street sweeper", 0, 0.72, 0, { css: "#ffcf33", w: 0.32 });
    reg(hits, sweeper, "street-sweeper");
    const sweepDust = particles(sweeper, 30, 0xc9b99a, { size: 0.025, life: 0.5, additive: false, opacity: 0.3 });
    // The "call it done" button that ends the sweep early.
    const endEarly = box(sweeper, 0.09, 0.03, 0.05, 0.3, 0.62, 0.3, 0xd2312b, { rough: 0.5 });
    decal(endEarly, 0.08, 0.025, 0, 0.016, 0, signFace("CALL IT DONE", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.4 }));
    reg(hits, endEarly, "sweep-early");

    // ------------------------------------------------------- public frontage
    const frontage = box(g, 4.4, 0.02, 0.9, 0, ROAD_TOP + 0.011, 2.75, 0xffffff, { rough: 0.7, metal: 0.05, cast: false });
    frontage.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#4c4f52", base2: "#414447" }), { repeat: 5, px: 384 }),
      { rough: 0.7, metal: 0.05, color: 0xb9bec2 },
    );
    const trackedPatch = box(g, 0.36, 0.004, 0.5, -1.3, ROAD_TOP + 0.014, 2.75, 0x453a22, { rough: 0.85, opacity: 0.55, transparent: true, cast: false });
    holoTag(trackedPatch, "tracked soil?", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, trackedPatch, "tracked-patch");

    // ------------------------------------------------------------- ground crew
    const ppeRack = group(g, -1.6, 0.14, 1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, HRD_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#ffcf33", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#ffcf33", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    cone(g, -2.4, -1.9, { color: HRD_ACCENT }); cone(g, 2.4, -1.2, { color: HRD_ACCENT });
    barrierPanel(g, 1.9, 1.85, { ry: -0.4, w: 1.0, color: HRD_ACCENT });
    toolChest(g, 2.4, -2.2, { ry: -0.6, color: 0x8a5a1a });
    const dust = particles(g, 40, 0xc9b99a, { size: 0.03, life: 1.0, additive: false, opacity: 0.28 });
    standingFigure(g, -2.5, 0.6, { ry: 1.0, cloth: 0x37505f, vest: HRD_ACCENT, helmet: 0xf2c14b });
    standingFigure(g, 2.6, 1.4, { ry: -2.2, cloth: 0x2b3138, vest: 0xe4dc3a, helmet: 0xf2f2f2 });

    // -------------------------------------------------------------- live state
    let alarming = false, truck2Rolling = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.6),
      footprint: 2.4,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "spray-valve") { /* valve opens visually via animate() */ }
        if (step.id === "wet-pass") { wetOverlay.visible = true; }
        if (step.id === "speed-post") repaint(monScreen, signFace("31 µg/m³", { bg: "#241a05", accent: "#ffcf33", fg: "#ffe9bf", scale: 0.6 }));
        if (step.id === "tarp") { tarpMesh.visible = true; tarpRoll.parent.remove(tarpRoll); loadSocket.add(tarpRoll); tarpRoll.visible = false; }
        if (step.id === "wheel-wash") repaint(monScreen, signFace("CLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        if (step.id === "sweep") { trackedPatch.visible = false; }
        if (step.id === "log-reconcile") repaint(logBoard.userData.face, signFace("LOG RECONCILED", { bg: "#0f1b14", accent: "#59c97b", scale: 0.4 }));
        if (step.id === "final-walk") { trackedPatch.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "wind-alarm") {
          alarming = true;
          strobe.material.emissiveIntensity = 2.4;
          repaint(monScreen, signFace("184 µg/m³ !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.5 }));
        }
        if (it.id === "untarped-departure") { truck2Rolling = true; truck2.position.z = 0.6; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-alarm") {
          alarming = false;
          strobe.material.emissiveIntensity = 0.2;
          repaint(monScreen, signFace("31 µg/m³", { bg: "#241a05", accent: "#ffcf33", fg: "#ffe9bf", scale: 0.6 }));
        }
        if (it.id === "untarped-departure") { truck2Rolling = false; truck2.position.z = -1.5; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        cups.rotation.y += dt * 2.6;
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(-0.4, 0.5, -0.4), 1.0, 0.4, 0.15);
        if (alarming) strobe.material.emissiveIntensity = Math.floor(t * 4) % 2 === 0 ? 2.4 : 0.2;
        else strobe.material.emissiveIntensity = 0.2;
        if (step?.id === "wet-pass" && session.holding) {
          spray.visible = true; spray.userData.step(dt, new THREE.Vector3(0, -0.15, 0), 0.15, 1.6, -2.5);
        } else spray.visible = false;
        if (step?.id === "wheel-wash" && session.holding) {
          washSpray.visible = true; washSpray.userData.step(dt, new THREE.Vector3(0, 0.2, 0), 0.1, 0.9, -1.0);
        } else washSpray.visible = false;
        if (step?.id === "sweep" && session.holding) {
          sweepDust.visible = true; sweepDust.userData.step(dt, new THREE.Vector3(0, 0.1, 0), 0.06, 0.7, -0.6);
        } else sweepDust.visible = false;
        if (truck2Rolling) truck2.position.z = Math.min(1.5, truck2.position.z + dt * 1.3);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "monitor-check") {
          repaint(monScreen, signFace(`${Math.round(gg.t * 60)} µg/m³`, {
            bg: "#241a05", accent: gg.t >= 0.36 && gg.t <= 0.55 ? "#59c97b" : "#f2ae14", fg: "#ffe9bf", scale: 0.6,
          }));
        }
        if (session?.turn && step?.id === "spray-valve") {
          sprayValve.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
