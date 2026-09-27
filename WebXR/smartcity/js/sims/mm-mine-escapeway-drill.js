import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame, rackUnit,
  cone, barrierPanel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mine Escapeway & Self-Rescuer Drill VR — Manufacturing &
// Automation, mill and mine pack, station six.
//
// An evacuation drill run to the mine's emergency plan: the self-contained
// self-rescuer donned completely before anything else, the primary
// escapeway checked and the alternate taken the moment the primary is found
// blocked, the directional lifeline followed by feel with its cones read
// rather than guessed at, a changeover made at a cached unit the instant a
// crew member's own SCSR signals trouble, and a refuge sealed and reported
// in once reached. Per the mine's emergency plan throughout — no distance,
// no time and no clause number here is a fact this platform is claiming to
// know, and the mine safety regulations are named only generically.

const MED_ACCENT = 0x4a9e5f;

export const SIM_MM_MINE_ESCAPEWAY_DRILL = {
  id: "mm-mine-escapeway-drill",
  index: "713",
  domain: "Mining",
  trade: "Underground miner — mine emergency and evacuation drill",
  category: "Manufacturing & Automation",
  weather: "clear",
  certification: "UMWA health and safety training; per the mine's emergency plan and the mine safety regulations, named generically; NIOSH criteria documents on occupational safety and emergency evacuation; NIMS/ICS incident command coordination with surface command",
  name: "Mine Escapeway & Self-Rescuer Drill",
  title: simTitle("Mine Escapeway & Self-Rescuer Drill"),
  tagline: "An evacuation drill to the mine's emergency plan: the self-rescuer donned complete, the alternate escapeway taken, the lifeline followed by feel, a changeover made, the refuge sealed and reported",
  accent: MED_ACCENT,
  accentCss: "#4a9e5f",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "escape-drilled", name: "Escape Drilled", note: "An evacuation drill run to the plan: self-rescuer donned complete, the lifeline followed, the refuge sealed and the crew accounted for" },

  game: system({
    name: "Mine Escape Authority",
    currency: "AIR",
    ranks: ["New Miner", "Section Hand", "Fire Boss", "Mine Examiner", "Mine Escape Authority Certified"],
    badges: [
      { id: "sealed-and-donned", name: "Sealed And Donned", note: "Self-rescuer donned complete before moving, first time", test: AWARD.stepClean("don-scsr") },
      { id: "never-broke-seal", name: "Never Broke Seal", note: "Never broke the SCSR seal early, misread the lifeline, pushed the blocked primary, or left the refuge unsealed", test: AWARD.safe },
      { id: "unit-swapped-clean", name: "Unit Swapped Clean", note: "SCSR indicator read correctly at every changeover check", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-drill", name: "Clean Drill", note: "No corrections through the whole drill", test: AWARD.clean },
      { id: "lifeline-unbroken", name: "Lifeline Unbroken", note: "The lifeline follow never broke its steady pace", test: AWARD.unbroken },
      { id: "drill-fast", name: "Drill Fast", note: "Drill completed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fresh-air-tempt": "You reached to break the SCSR seal here, on a guess that the air must be fine by now. An SCSR is not removed until the plan or a qualified person confirms breathable air — the smell or feel of a passage is not a reading anyone can act on, and a seal broken one section too early puts the wearer back into whatever the unit was donned for in the first place.",
    "wrong-way-cone": "You followed the cone pointing back the way you came. A directional lifeline's cones are meant to be read by feel in low visibility, and the whole system only works if the cone that is felt is trusted over a guess about which way feels right — going by feel and then ignoring what it says is worse than not having a lifeline at all.",
    "blocked-primary": "You pushed into the blocked primary escapeway instead of taking the alternate. The plan names two routes out for exactly this situation, and forcing a way through debris in the primary route on the hope it clears is a bet against a route that was built to be walked away from, not tested.",
    "refuge-side-hatch": "You went out the refuge's side hatch instead of sealing the door behind the crew. The hatch is not the way the refuge is meant to be sealed, and leaving it open defeats the seal the whole chamber depends on for everyone still inside it.",
  },

  lateNotes: {
    "changeover-cache": "Not yet — your own unit is reading fine. The cache is for the unit that has actually signalled trouble.",
    "refuge-door-handle": "Not yet. The crew is inside and accounted for before the door is sealed.",
  },

  steps: [
    {
      id: "emergency-plan", kind: "select", target: "escape-plan-board",
      title: "Read the section's emergency plan",
      cue: "Check the primary and alternate escapeways and the nearest refuge for this section.",
      why: "The emergency plan names this section's actual routes and refuge, not a generic layout — a drill run from memory of a different section's plan teaches the wrong way out for the one you are actually standing in.",
    },
    {
      id: "don-scsr", kind: "sequence", anyOrder: true,
      targets: ["scsr-mouthpiece", "scsr-noseclip", "scsr-strap"],
      itemNames: { "scsr-mouthpiece": "mouthpiece in and sealed", "scsr-noseclip": "nose clip on", "scsr-strap": "unit strapped and carried" },
      title: "Don the self-contained self-rescuer completely",
      cue: "Mouthpiece in and sealed, nose clip on, unit strapped on — all three before moving.",
      why: "The self-rescuer only works as a sealed system — a mouthpiece in without the nose clip on lets a wearer breathe around the unit rather than through it, which defeats the whole device in exactly the atmosphere it exists for. All three go on before a single step is taken toward the escapeway.",
    },
    {
      id: "check-primary-route", kind: "find", noHint: true,
      targets: ["primary-route-blocked"],
      itemNames: { "primary-route-blocked": "debris blocking the primary escapeway" },
      itemNotes: { "primary-route-blocked": "The primary escapeway is blocked by fallen debris — exactly the situation the plan's alternate route exists for." },
      title: "Check the primary escapeway",
      cue: "Look down the primary route and click what you find.",
      why: "The primary route is checked, not assumed clear, because the plan's alternate only does its job if a blocked primary is actually recognised as blocked rather than pushed through on the assumption it will open up further along.",
    },
    {
      id: "select-alternate", kind: "select", target: "alternate-escapeway-marker",
      title: "Take the alternate escapeway",
      cue: "Turn into the marked alternate route now that the primary is blocked.",
      why: "The alternate exists precisely for the moment the primary cannot be used, and taking it as soon as the primary is found blocked is what the plan is built around — a crew that keeps trying the primary has already spent time the alternate did not need to cost them.",
    },
    {
      id: "follow-lifeline", kind: "track", target: "lifeline-rope", seconds: 6,
      title: "Follow the directional lifeline",
      cue: "Hold the lifeline and move at a steady pace, feeling for the cones as you go.",
      why: "A lifeline followed too fast in low visibility is a lifeline whose cones get missed by feel; followed too slowly, a crew loses time it may not have to spare. The steady pace a drill is run at is what lets every cone actually be felt and read, which is the entire reason the lifeline is directional in the first place.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "PACE", readout: (v) => (v < 0.4 ? "too slow" : v > 0.6 ? "too fast to feel the cones" : "steady") },
      holdBreakNote: "Pace out of band — slow enough to feel every cone, fast enough to keep moving.",
    },
    {
      id: "read-cone", kind: "select", target: "direction-cone",
      title: "Read the cone by feel",
      cue: "Stop at the cone marker and confirm which way its point aims before continuing.",
      why: "A directional lifeline's cones are shaped so the point can be felt in the dark, and reading the correct one is what turns a rope in your hand into an actual direction out — the system is only as good as the cone that is actually checked at every marker, not assumed from the last one.",
    },
    {
      id: "changeover-check", kind: "gauge", target: "scsr-gauge",
      title: "Check your SCSR at the changeover station",
      cue: "Read your unit's indicator at the marked changeover station.",
      why: "A changeover station exists on the route for exactly the moment a unit's own indicator says it should be swapped, and the indicator is what is actually read — not how much air a wearer feels like they still have, which is a poor judge of what the chemical inside the unit is actually doing.",
      gauge: { label: "SCSR STATUS", speed: 0.72, green: [0.5, 1.0], readout: (t) => (t >= 0.5 ? "still supplying" : "switch at the cache"), missNote: "Reading says switch — swap at the cache now, not further down the route." },
    },
    {
      id: "call-checkin", kind: "hold", target: "mine-phone", seconds: 5,
      title: "Call out your status",
      cue: "Hold the mine phone and report your crew's status and position to the surface.",
      why: "Surface command is coordinating every crew's evacuation at once, and a call-in is what lets the plan's own incident command actually know where each crew is — a crew that reaches the surface without ever calling in is a crew command spent the whole drill treating as still missing.",
      holdBreakNote: "You hung up before the call-in finished. A status report cut short tells surface command less than no call at all, because now they think they heard from you.",
    },
    {
      id: "seal-refuge", kind: "turn", target: "refuge-door-handle",
      title: "Seal the refuge door",
      cue: "Turn the handle to seal the refuge door once the whole crew is inside.",
      why: "The refuge only holds its own atmosphere if the door is actually sealed, and it is sealed the moment the crew is in — not left cracked in case somebody is still coming, which is what the headcount step is for instead.",
      turn: { turns: 0.5, axis: "y", label: "SEAL" },
    },
    {
      id: "verify-air-supply", kind: "select", target: "refuge-air-supply",
      title: "Confirm the refuge's air supply is running",
      cue: "Check that the refuge's compressed air and scrubber system has started.",
      why: "A sealed refuge is only breathable for as long as its own air supply is actually running, and confirming that it started is what tells the crew the chamber is doing the one job it exists for, rather than just being a sealed box.",
    },
    {
      id: "headcount", kind: "drag", target: "roster-tally",
      title: "Take the headcount",
      cue: "Carry the roster tally to the accounted-for board and mark everyone present.",
      why: "A headcount taken and reported is what turns 'the crew got out' into a fact command can act on — an evacuation that ends without a headcount leaves command guessing at exactly the question a search would otherwise have to answer.",
      drag: { to: "accounted-for-board", radius: 0.4, missNote: "Not on the board — the tally has to actually reach the accounted-for board to count." },
    },
    {
      id: "debrief-log", kind: "select", target: "debrief-board",
      title: "Log the drill debrief",
      cue: "Record what worked and what did not in the escapeway and the drill.",
      why: "A drill that finds a blocked route, a hard-to-read cone or a slow changeover is only useful to the next crew if it gets written down — the debrief is what turns this run into something the mine can actually fix before a real evacuation depends on it.",
    },
  ],

  interrupts: [
    {
      id: "scsr-fails",
      kind: "Unit signals trouble",
      after: "follow-lifeline", delay: 3, seconds: 12,
      alert: "A crew member's SCSR indicator has flipped to its failure signal mid-route.",
      cue: "A unit has just signalled trouble, not you.",
      target: "changeover-cache",
      why: "A unit that signals failure is treated as failed immediately, not monitored a while longer to see if the signal was a fluke — the changeover cache exists on the route for exactly this moment, and reaching it before the failing unit is actually needed is the whole reason it is positioned where it is.",
      missNote: "The crew kept moving on a unit that had already signalled failure. An SCSR does not give a second warning once it has already told you it failed, and waiting to see whether it keeps working is testing the one piece of equipment the drill cannot afford to lose.",
      wrongNote: "It is the changeover cache. Nothing else gets a failing unit swapped before it actually runs out.",
    },
    {
      id: "smoke-drop",
      kind: "Visibility drops",
      after: "read-cone", delay: 4, seconds: 12,
      alert: "Smoke rolls into the escapeway and visibility drops to almost nothing.",
      cue: "You can no longer see the person ahead of you.",
      target: "escapeway-call-point",
      why: "A call point along the route is what reports a crew's position and condition the moment visibility drops, rather than waiting until the crew either reaches the refuge or does not — surface command planning a response needs to know where a crew lost visibility, not just where they eventually turned up.",
      missNote: "The crew kept moving through zero visibility without reporting it. A call point exists precisely for the moment conditions get worse mid-route, and skipping it means command is planning a response with the last position they had, not the one that actually matters now.",
      wrongNote: "It is the escapeway call point. Nothing else reports your position from partway down the route.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, MED_ACCENT);
    box(g, 6.6, 0.12, 6.4, 0, 0.06, 0, 0x2b2620, { rough: 0.95, finish: "concrete" });

    const rockColour = 0x39322a;
    const roofHeight = 2.3;
    box(g, 6.6, 0.5, 6.4, 0, roofHeight + 0.25, 0, rockColour, { rough: 0.98, cast: false });
    for (const sx of [-3.3, 3.3]) box(g, 0.5, roofHeight, 6.4, sx, roofHeight / 2, 0, rockColour, { rough: 0.95, cast: false });
    holoTag(g, "escapeway drill — section 7", 0, roofHeight - 0.2, -2.9, { css: "#4a9e5f", w: 0.6 });

    // Primary (blocked) and alternate escapeways.
    const primary = group(g, -1.2, 0, -1.8);
    box(primary, 1.0, roofHeight, 0.1, 0, roofHeight / 2, 0, 0x2f2a22, { rough: 0.9, cast: false });
    const debris = box(primary, 0.9, 0.6, 0.7, 0, 0.3, 0.3, 0x4a4030, { rough: 0.95 });
    reg(hits, debris, "primary-route-blocked");
    const blockedEntrance = box(primary, 1.0, 1.8, 0.15, 0, 0.9, -0.3, 0xd2312b, { rough: 0.7, opacity: 0.001, transparent: true, cast: false });
    reg(hits, blockedEntrance, "blocked-primary");
    holoTag(primary, "primary escapeway", 0, roofHeight, -0.3, { css: "#d2312b", w: 0.4 });

    const alternate = group(g, 1.2, 0, -1.8);
    box(alternate, 1.0, 0.1, 3.6, 0, 0.05, 0, 0x4fd1ff, { emissive: 0x4fd1ff, ei: 0.4, rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    holoTag(alternate, "alternate escapeway", 0, roofHeight - 0.2, -1.6, { css: "#4fd1ff", w: 0.42 });
    reg(hits, alternate, "alternate-escapeway-marker");

    // Lifeline with cones along the alternate route.
    const lifeline = cyl(g, 0.015, 0.015, 3.6, 1.2, 0.9, -1.8, 0xeef2f6, { rough: 0.7, seg: 6, cast: false });
    lifeline.rotation.x = Math.PI / 2;
    reg(hits, lifeline, "lifeline-rope");
    function directionCone(x, z, ry, colour = 0xf0b323) {
      const c = new THREE.ConeGeometry(0.06, 0.16, 12);
      const m = new THREE.Mesh(c, mat(colour, { rough: 0.5, finish: "painted" }));
      m.position.set(x, 0.95, z);
      m.rotation.set(Math.PI / 2, ry, 0);
      g.add(m);
      return m;
    }
    const goodCone = directionCone(1.2, -0.6, 0);
    reg(hits, goodCone, "direction-cone");
    const wrongCone = directionCone(1.2, 0.2, Math.PI, 0xd2312b);
    reg(hits, wrongCone, "wrong-way-cone");
    const freshAirSign = box(g, 0.3, 0.2, 0.02, 0.6, 1.2, -0.9, 0xf0b323, { rough: 0.5, opacity: 0.7, transparent: true });
    holoTag(g, "surface ahead?", 0.6, 1.5, -0.9, { css: "#f0645b", w: 0.36 });
    reg(hits, freshAirSign, "fresh-air-tempt");

    // Changeover cache and SCSR indicator.
    const cache = group(g, 1.6, 0, 0.4);
    box(cache, 0.4, 0.4, 0.3, 0, 0.2, 0, 0xf0b323, { rough: 0.6, finish: "painted" });
    holoTag(cache, "SCSR changeover cache", 0, 0.5, 0, { css: "#f0b323", w: 0.44 });
    reg(hits, cache, "changeover-cache");
    const gaugeStand = group(g, 1.0, 0, 0.6);
    cyl(gaugeStand, 0.03, 0.035, 0.6, 0, 0.3, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const scsrFace = instrument(gaugeStand, 0, 0.65, 0, { ry: 0.5, idle: "-- --", color: MED_ACCENT });
    reg(hits, scsrFace, "scsr-gauge");

    const callPointPost = group(g, 1.6, 0, -0.6);
    box(callPointPost, 0.14, 0.8, 0.12, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const callPointLight = ball(callPointPost, 0.05, 0, 0.82, 0.07, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.0, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(callPointPost, "escapeway call point", 0, 1.02, 0, { css: "#f2c14b", w: 0.4 });
    reg(hits, callPointPost, "escapeway-call-point");

    // The refuge alternative.
    const refuge = group(g, 0, 0, 1.8);
    box(refuge, 2.2, roofHeight - 0.3, 2.0, 0, (roofHeight - 0.3) / 2, 0, 0x5a6a5c, { rough: 0.7, metal: 0.3, finish: "galvanised" });
    const refugeDoor = group(refuge, -1.05, 1.0, 0);
    box(refugeDoor, 0.08, 1.6, 0.9, 0, 0, 0, 0x8a929a, { rough: 0.5, metal: 0.5 });
    const doorHandle = cyl(refugeDoor, 0.03, 0.03, 0.2, 0.06, 0, 0.3, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 10 });
    doorHandle.rotation.z = Math.PI / 2;
    reg(hits, refugeDoor, "refuge-door-handle");
    const sideHatch = box(refuge, 0.6, 0.6, 0.08, 0.9, 0.7, 1.0, 0x8a929a, { rough: 0.5, metal: 0.5, opacity: 0.7, transparent: true });
    reg(hits, sideHatch, "refuge-side-hatch");
    const airSupply = group(refuge, 0.8, 0, -0.8);
    cyl(airSupply, 0.2, 0.22, 0.6, 0, 0.3, 0, 0xdfe9ee, { rough: 0.5, metal: 0.4, seg: 16 });
    holoTag(airSupply, "refuge air supply", 0, 0.65, 0, { css: "#4a9e5f", w: 0.4 });
    reg(hits, airSupply, "refuge-air-supply");
    const phone = group(refuge, -0.8, 0, -0.8);
    box(phone, 0.2, 0.3, 0.1, 0, 1.1, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    holoTag(phone, "mine phone", 0, 1.32, 0, { css: "#4a9e5f", w: 0.3 });
    reg(hits, phone, "mine-phone");
    const rosterBoard = holoPanel(g, 0.5, 0.36, 0.9, 1.4, 2.4, (cx, w, h) => {
      cx.fillStyle = "#0e1a12"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4a9e5f"; cx.fillRect(0, 0, w, 5);
      cx.font = `${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f2e8"; cx.fillText("ACCOUNTED FOR", w * 0.08, h * 0.5);
    }, { accent: MED_ACCENT });
    reg(hits, rosterBoard, "accounted-for-board");
    const tally = box(g, 0.14, 0.1, 0.02, -0.6, 1.0, 1.6, 0xf0b323, { rough: 0.5, finish: "painted" });
    reg(hits, tally, "roster-tally");

    // Plan board and debrief board.
    const planBoard = holoPanel(g, 0.6, 0.42, -2.7, 1.5, 1.7, (cx, w, h) => {
      cx.fillStyle = "#0e1a12"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4a9e5f"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("EMERGENCY EVACUATION PLAN", w * 0.055, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e6f2e8";
      ["Primary escapeway: per the map", "Alternate escapeway: per the map", "Refuge: per the plan", "Call in at every changeover"].forEach((l, i) => cx.fillText(l, w * 0.055, h * (0.32 + i * 0.15)));
    }, { accent: MED_ACCENT, ry: 0.4 });
    reg(hits, planBoard, "escape-plan-board");
    const debriefStand = group(g, -2.6, 0, 2.0);
    cyl(debriefStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const debriefBoard = decal(debriefStand, 0.32, 0.4, 0, 0.95, 0.02, paperFace("DRILL DEBRIEF", ["Route: ____", "Time: per the plan", "Notes: ____"], { bg: "#e2ecd8", band: "#3f7a4a" }), { px: 256 });
    reg(hits, debriefBoard, "debrief-board");

    // SCSR donning rack.
    const scsrRack = group(g, -2.6, 0, -0.4);
    box(scsrRack, 0.9, 1.4, 0.1, 0, 0.7, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const mouthpiece = ball(scsrRack, 0.06, -0.26, 1.0, 0.08, 0xdfe9ee, { rough: 0.5, seg: 12, seg2: 10 });
    holoTag(scsrRack, "SCSR mouthpiece", -0.26, 1.22, 0.08, { css: "#4a9e5f", w: 0.38 });
    reg(hits, mouthpiece, "scsr-mouthpiece");
    const noseclip = box(scsrRack, 0.1, 0.06, 0.05, 0, 1.0, 0.08, 0x2b2f34, { rough: 0.6 });
    holoTag(scsrRack, "nose clip", 0, 1.14, 0.08, { css: "#4a9e5f", w: 0.28 });
    reg(hits, noseclip, "scsr-noseclip");
    const strap = box(scsrRack, 0.5, 0.3, 0.14, 0.28, 0.95, 0.08, 0xf0b323, { rough: 0.6, finish: "painted" });
    holoTag(scsrRack, "SCSR unit + strap", 0.28, 1.18, 0.08, { css: "#4a9e5f", w: 0.4 });
    reg(hits, strap, "scsr-strap");

    for (const [x, z] of [[-2.9, 2.6], [2.9, 2.4]]) cone(g, x, z);
    barrierPanel(g, 0, 2.9, { ry: 1.57, color: 0xf0b323 });
    const smokeParticles = particles(g, 24, 0x555a52, { size: 0.06, life: 0.7, additive: false, opacity: 0.4 });
    smokeParticles.position.set(1.2, 1.2, -0.4);
    smokeParticles.visible = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "don-scsr") { mouthpiece.material = mat(0x59c97b, { emissive: 0x2f7d4a, ei: 0.6, rough: 0.5 }); }
        if (step.id === "select-alternate") { blockedEntrance.material = mat(0xd2312b, { opacity: 0.25, transparent: true, rough: 0.6 }); }
        if (step.id === "seal-refuge") { doorHandle.rotation.x = Math.PI / 2; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "scsr-fails") { cache.children[0].material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 1.5, rough: 0.5 }); }
        if (it.id === "smoke-drop") { smokeParticles.visible = true; callPointLight.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.0, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "scsr-fails") { cache.children[0].material = mat(0xf0b323, { rough: 0.6, finish: "painted" }); }
        if (it.id === "smoke-drop") { smokeParticles.visible = false; callPointLight.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.0, rough: 0.4 }); }
      },
      animate(t, dt, session) {
        void dt;
        if (smokeParticles.visible) smokeParticles.userData.step?.(0.016, new THREE.Vector3(1.2, 1.2, -0.4), 0.25, 0.2, 0.3);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "changeover-check") {
          repaint(scsrFace.userData.screen, signFace(gg.t >= 0.5 ? "OK" : "SWITCH", { bg: "#1a1208", accent: gg.t >= 0.5 ? "#59c97b" : "#f0645b", fg: "#f6ead6", scale: 0.55 }));
        }
        void t;
      },
    };
  },
};
