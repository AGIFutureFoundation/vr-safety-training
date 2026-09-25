import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, barrierPanel,
  reg, surfaceTexture, texturedMat, pavingFace, mudflatFace,
} from "../citykit.js";
import { mobileCrane, aerialBoomLift } from "../../../shared/equipment.js";
import { radio, tagLine } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tandem Lift & Girder Set VR — Bridge and Structural Trades.
//
// A steel girder for a short bridge span over a drainage channel, picked off
// its cribbing by two rough-terrain cranes working together and landed on
// the bearings of two pier caps, beside the first girder already set. The
// cranes are flown by IUOE operators; the raising gang is Ironworkers — tag
// lines on the ground, the connector in the boom lift's basket at the west
// cap. Everything the lift depends on — each crane's share of the load, the
// radii, the wind limit — is "per the lift plan"; this file states none of
// those numbers, because they belong to the plan and not to a training scene.

const BTL_ACCENT = 0xe0a83a;
const BTL_CSS = "#e0a83a";
const BTL_CAP_TOP = 2.4;              // pier cap bearing seat height
const BTL_SET_Z = -2.1;               // the new girder's line on the caps
const BTL_START = { y: 0.35, z: -0.55 };   // on its cribbing
const BTL_HIGH = 2.95;                // girder bottom when clear of the caps

/**
 * Aim a mobileCrane() so its boom tip hangs over a world point: slew the
 * house, telescope the boom and luff it, all from the kit's own pivots.
 * Returns the tip's world position (the kit hook hangs from it).
 */
function btlAimCrane(crane, cx, cz, ry, tx, tz, luff) {
  const { house, boom, boomSections, hook } = crane.userData.parts;
  const hy = 1.72, hz = -1.65;
  const hx0 = cx + hz * Math.sin(ry), hz0 = cz + hz * Math.cos(ry);
  let theta = Math.atan2(tx - hx0, tz - hz0) - ry, bx = hx0, bzw = hz0;
  for (let i = 0; i < 4; i++) {
    const lx = -0.25 * Math.cos(theta) - 1.5 * Math.sin(theta), lz = 0.25 * Math.sin(theta) - 1.5 * Math.cos(theta);
    bx = hx0 + lx * Math.cos(ry) + lz * Math.sin(ry);
    bzw = hz0 - lx * Math.sin(ry) + lz * Math.cos(ry);
    theta = Math.atan2(tx - bx, tz - bzw) - ry;
  }
  const d = Math.hypot(tx - bx, tz - bzw);
  const L = d / Math.cos(luff);
  const ext = Math.max(0, L - 8.4) / 3;
  house.rotation.y = theta;
  boom.rotation.x = -luff;
  boomSections[0].position.z = 0.3 + ext;
  boomSections[1].position.z = 0.25 + ext;
  boomSections[2].position.z = 0.25 + ext;
  hook.rotation.x = luff;
  return { x: tx, y: hy + 1.35 + L * Math.sin(luff), z: tz };
}

export const SIM_BS_TANDEM_LIFT_GIRDER_SET = {
  id: "bs-tandem-lift-girder-set",
  index: "319",
  domain: "Construction & Structural Trades",
  trade: "Ironworker raising gang with IUOE crane operators — two-crane girder set",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "Ironworkers IMPACT raising-gang and connector training and IUOE crane operator apprenticeship with NCCCO operator and signalperson certification; OSHA 29 CFR 1926.1432 multiple-crane lifts (the lift plan and the lift director) under 29 CFR 1926 Subpart CC, 29 CFR 1926.453 aerial lifts and Subpart R steel erection; ASME B30.5 mobile cranes; ANSI A92 mobile elevating work platforms; ANSI Z359 fall protection",
  name: "Tandem Lift & Girder Set",
  title: simTitle("Tandem Lift & Girder Set"),
  tagline: "Two cranes, one girder: the multiple-crane lift plan read, the rigging walked, the wind taken, tag lines on, the connector tied off in the basket, slack taken and a trial pick held, both cranes kept level through the hoist, the girder swung on its tag lines, landed on its bearings, braced to the first girder and bolted before the hooks come off",
  accent: BTL_ACCENT,
  accentCss: BTL_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "two-hooks-one-plan", name: "Two Hooks, One Plan", note: "A tandem pick flown to the plan: level the whole way, nobody under it, stopped for the wind, braced before release" },

  supportLine: "your Ironworkers or IUOE local's member assistance programme, or the employee assistance line on the contractor's site board",

  game: system({
    name: "Raising Gang",
    currency: "PICK",
    ranks: ["Apprentice", "Tag Line Hand", "Connector", "Signal Person", "Lift Director"],
    badges: [
      { id: "level-all-the-way", name: "Level All The Way", note: "The girder held level with each crane inside its share throughout the hoist", test: AWARD.unbroken },
      { id: "rigging-read", name: "Rigging Read", note: "Every rigging defect found first look", test: AWARD.stepClean("rigging-find") },
      { id: "nobody-under-it", name: "Nobody Under It", note: "No one under the load, no hand on the steel, no step into the swing radius, no climb on the basket rail", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections through the whole set", test: AWARD.clean },
      { id: "wind-read-true", name: "Wind Read True", note: "The wind reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "set-by-noon", name: "Set By Noon", note: "Girder set and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-suspended-load": "You stepped under the girder to steady it from below. Two cranes holding one girder is a load that can shift if either hoist moves a little faster than the other, and OSHA's crane rule keeps workers out from under a suspended load for exactly that reason: the load is only as steady as the least steady thing holding it. The tag line exists so nobody has to be under it.",
    "hand-on-girder": "You reached for the girder's end with your hands instead of the tag line. A girder on two hooks swings and turns with every correction either operator makes, and a hand on the steel is a hand between it and the pier cap it is being landed on. Loads are guided from a tag line's length away.",
    "swing-radius": "You stepped over the barricade into crane A's counterweight swing radius. When the house slews to follow the load, the counterweight sweeps that ring at body height and the operator cannot see behind it. The barricade marks the one place on this site that turns into a crush point with no warning.",
    "basket-rail-climb": "You went to stand on the basket's midrail to reach the bearing. An aerial lift's guardrail is fall protection only while the worker is inside it: standing on the rail lifts the body's centre of gravity above it, and a tied-off worker who goes over the rail swings into the pier cap. The basket is repositioned instead.",
  },

  lateNotes: {
    "tag-rope": "The tag line is held once the girder is clear of the caps and the cranes start the swing — before the hoist there is nothing to steer.",
    "cross-frame-bolts": "The cross-frame is bolted once it has been carried into place between the girders, from the basket, tied off.",
    "release-signal": "The hooks come off only once the girder is braced to the first girder and the connection is bolted — a lone girder on its bearings can roll.",
  },

  steps: [
    {
      id: "lift-plan", kind: "select", target: "lift-plan",
      title: "Read the multiple-crane lift plan",
      cue: "Read the plan: each crane's share of the load and its capacity at that radius, the rigging, the lift sequence, the wind limit, the signals, and who the lift director is.",
      why: "Two cranes on one load stop being two separate lifts: if one hoists faster or booms out, load shifts onto the other, and a crane working near its rated capacity can be pushed past it by a share it was never planned to carry. OSHA 29 CFR 1926.1432 requires a written plan for a multiple-crane lift, developed by a qualified person, reviewed with everyone involved, and run by one lift director. Every call made during the pick comes back to what that plan says.",
    },
    {
      id: "rigging-find", kind: "find", noHint: true,
      targets: ["kinked-sling", "unmoused-shackle", "no-crane-mat"],
      itemNames: {
        "kinked-sling": "a kinked wire rope sling with broken wires",
        "unmoused-shackle": "a screw-pin shackle not tightened or moused",
        "no-crane-mat": "an outrigger pad set on bare soil without its mat",
      },
      itemNotes: {
        "kinked-sling": "The east choker has a kink with broken wires standing out of the strand. A kinked wire rope has lost strength at the kink, and the rigging standard takes it out of service — it gets swapped before either crane takes a pound.",
        "unmoused-shackle": "The shackle on crane B's rigging has its screw pin backed off with no mousing. A pin that can turn under a swinging load can walk out, and then the shackle opens with the girder on it.",
        "no-crane-mat": "Crane B's rear outrigger pad is sitting on soft ground with its mat still stacked beside it. An outrigger puts a large share of the crane's weight and its load into one pad, and bare soil can settle under it mid-pick.",
      },
      title: "Walk the rigging and the crane set-up",
      cue: "Walk both cranes' rigging and outriggers: slings, shackles, hooks, pads and mats.",
      why: "A tandem pick fails at its weakest piece of rigging or its softest outrigger, and neither announces itself until the load is in the air. The crane standard and the rigging standard both put an inspection ahead of every lift because a kinked sling, an unmoused shackle pin and an unmatted pad are each five-minute fixes on the ground and a dropped girder or a tipped crane once the hoist starts.",
    },
    {
      id: "wind-reading", kind: "gauge", target: "wind-gauge",
      title: "Take the wind reading against the plan's limit",
      cue: "Read the anemometer at the boom-tip mast and commit the reading while it is steady and under the plan's limit.",
      why: "A girder is a sail: its long flat web catches wind that a compact load would not, and wind that swings a load on two hooks loads both cranes sideways in a way their charts do not show. The lift plan sets a wind limit for this pick, and the reading is taken where the load will be — up at boom-tip height, not down at the pad where the wind is always gentler — immediately before the lift is committed.",
      gauge: {
        label: "WIND", speed: 0.72, green: [0.3, 0.48],
        readout: (t) => (t < 0.3 ? "gusting — wait for a steady reading" : t <= 0.48 ? "steady, under the plan's limit" : "at or over the plan's limit"),
        missNote: "Not a steady reading under the limit — let the cups settle and read it again before anyone commits the pick.",
      },
    },
    {
      id: "tag-lines", kind: "drag", target: "tag-coil",
      title: "Put the tag line on the girder's west end",
      cue: "Carry the coiled tag line to the lifting lug on the west end and hook it on before anything leaves the cribbing.",
      why: "The tag lines go on while the girder is still sitting on its cribbing, because once it is in the air the only way to reach it is to stand near it. A girder hanging from two hooks can rotate on its slings, and the tag line is what lets the ground crew stop it turning and steer it onto the bearings from a rope's length away.",
      drag: { to: "girder-lug", radius: 0.45, missNote: "Not on the lifting lug — the tag line hooks to the lug at the girder's west end, where it can steer the whole piece." },
    },
    {
      id: "basket-tieoff", kind: "select", target: "basket-harness",
      title: "Tie off in the manbasket before it goes up",
      cue: "Clip your lanyard to the basket's anchor point and close the gate before the connector's basket is raised to the west cap.",
      why: "The connector works from the boom lift's basket beside the pier cap, and 29 CFR 1926.453 requires a body belt or harness with a lanyard attached to the boom or basket whenever the platform is raised. Clipped to the basket's own anchor, a worker jolted by the girder landing stays inside the rails; clipped to the girder or the cap, they would be tied to the load the basket is backing away from.",
    },
    {
      id: "lift-sequence", kind: "sequence",
      targets: ["slack-a", "slack-b", "trial-pick"],
      itemNames: { "slack-a": "crane A takes up its slack", "slack-b": "crane B takes up its slack", "trial-pick": "trial pick: a few inches up, hold, check brakes and level" },
      outOfOrderNote: "Crane A takes its slack, then crane B, then the trial pick — hoisting either crane before both are carrying their share puts the whole girder on one hook.",
      title: "Take the slack, crane by crane, then the trial pick",
      cue: "Call crane A to take up its slack, then crane B, then lift the girder a few inches off the cribbing and hold it there.",
      why: "The girder only comes off the cribbing once both cranes are carrying their planned share, so the slack is taken one crane at a time and the load comes up together. The trial pick — a few inches up and held — is where the operators confirm their brakes hold, the load cells read the shares the plan predicted, and the girder hangs level; a problem found at a few inches is set down again, not ridden up.",
    },
    {
      id: "load-share", kind: "track", target: "load-share", seconds: 7,
      title: "Keep the girder level through the hoist",
      cue: "Watch the level and both cranes' load readouts as they hoist together; keep the girder inside the plan's level band and each crane inside its share.",
      why: "In a tandem hoist the girder's level is the load share: as one end rises faster than the other, weight transfers onto the lower crane, which may already be near its rated capacity at that radius. 29 CFR 1926.1432 puts one lift director in charge of exactly this, and the job during the hoist is to keep watching — calling the faster crane to hold until the other catches up — the whole way to clearance height.",
      track: { start: 0.2, green: [0.38, 0.58], rise: 0.56, fall: 0.46, drift: 0.14, label: "LEVEL / SHARE", readout: (v) => (v < 0.38 ? "west end low — crane A overloading" : v > 0.58 ? "east end low — crane B overloading" : "level, both cranes inside their share") },
      holdBreakNote: "The girder went out of level and one crane took more than its share while nobody called it. Hold the faster crane, bring it back level, and keep watching.",
    },
    {
      id: "tag-rope", kind: "hold", target: "tag-rope", seconds: 5,
      title: "Steer the girder over the caps on the tag line",
      cue: "Hold the tag line steady as the cranes swing and boom the girder over its bearings — keep it square to the caps.",
      why: "The swing is the moment a girder wants to rotate on its slings, and a girder turning end-for-end over two pier caps can strike the cap, the first girder or the connector's basket. The tag line is held steadily through the whole swing so the girder arrives square, with the person holding it standing clear of both the load and the swing path.",
      holdBreakNote: "The tag line went slack mid-swing and the girder started to turn on its slings. Take it up again and hold it steady.",
    },
    {
      id: "land", kind: "select", target: "bearing-west",
      title: "Land the girder on its bearings",
      cue: "Signal both cranes down together and land the girder on the west and east bearings, centred on the anchor bolts.",
      why: "A girder lands on its bearings once, and it lands correctly only if both ends come down together and centred: land one end first and the other crane is carrying a load that is now pivoting on the bearing, and land it off the anchor bolts and the bearing has been loaded eccentrically before anything is bolted. The connector at the cap guides the last inches by eye and hand signal, not by pushing on the steel.",
    },
    {
      id: "brace", kind: "drag", target: "temp-brace",
      title: "Carry the cross-frame into place to the first girder",
      cue: "Bring the cross-frame from the cap across to the connection plates between the first girder and the new one.",
      why: "A single plate girder on its bearings is tall, narrow and heavy on top, and until it is braced to its neighbour it can roll over on its bearings under a gust or a bump. The erection plan braces each new girder to the one already set before the cranes let go, so the cross-frame goes in while both hooks are still holding the load.",
      drag: { to: "brace-socket", radius: 0.5, missNote: "Not on the connection plates — the cross-frame spans between the first girder and the new one, at the west end near the cap." },
    },
    {
      id: "cross-frame-bolts", kind: "turn", target: "cross-frame-bolts",
      title: "Bolt the cross-frame from the basket",
      cue: "Run the cross-frame's connection bolts up to snug from the basket, still tied off to it.",
      why: "The erection bolts that tie the cross-frame to both girders are what turn two independent girders into a stable pair. Subpart R sets the minimum connection before a hoisting line is released, because a connection held by drift pins or a couple of finger-tight bolts looks finished from the ground and is not what the engineer relied on when he told the crew the hooks could come off.",
      turn: { turns: 1, label: "CROSS-FRAME", readout: (t) => (t < 0.95 ? "running bolts up" : "snug — connection made") },
    },
    {
      id: "release", kind: "hold", target: "release-signal", seconds: 4,
      title: "Hold the slack-off signal until both slings go loose",
      cue: "With the girder braced and the connection bolted, give both cranes the one slack-off signal and hold it until both sets of slings hang loose, then let the connector unhook.",
      holdBreakNote: "The signal dropped before both slings were loose — one crane is still carrying part of the girder. Give the signal again and hold it.",
      why: "The hooks come off only when the girder is stable on its own — braced and bolted — and they come off together, so that neither crane is briefly carrying the whole piece. The lift director gives one signal for both, the operators slack off until the slings go loose, and only then does the connector take the rigging off from the basket.",
    },
    {
      id: "lift-log", kind: "select", target: "lift-log",
      title: "Log the lift",
      cue: "Record the wind reading, the load shares on the trial pick, the rigging swapped out, the stop for the wind and the person under the load.",
      why: "The lift log is how the next pick in this span starts from what actually happened rather than from the plan alone: the shares the load cells read, the wind that stopped the swing, the sling that was pulled from service and the worker who walked under the load. It is written at the pick, while the numbers on the displays are still the ones that were read, and it goes to the qualified person who wrote the plan.",
    },
    {
      id: "crew-checkin", kind: "select", target: "director-radio",
      title: "Check in with both operators and the gang",
      cue: "Call both cranes and the gang: girder set and braced, hooks clear. Then check in with the crew about the stop and the worker under the load.",
      why: "The operators plan the next girder around this call, and they need to hear the girder is braced before either one booms away. It is also the gang's check-in: somebody walking under a girder on two hooks and a gust mid-swing are both moments the crew carries for the rest of the shift, and the building trades' practice is to say so on the radio and name the member assistance line with it.",
    },
  ],

  interrupts: [
    {
      id: "worker-under-load",
      kind: "Worker under the load",
      after: "load-share", delay: 2, seconds: 12,
      alert: "A laborer carrying a bundle of bearing shims has walked straight under the girder as it rises between the caps.",
      cue: "Sound the air horn: all stop, and get him out from under it.",
      target: "air-horn",
      why: "Nobody works under a suspended load, and a load on two cranes is the least predictable suspended load there is. The air horn is the whole site's stop signal: both operators hold, and the worker under the girder hears it even if he never looked up.",
      missNote: "The laborer walked the length of the girder underneath it while both cranes kept hoisting; a correction on crane B dropped the east end a hand's width right over his head.",
      wrongNote: "The air horn — the person under the load comes before the level readout.",
    },
    {
      id: "wind-gust",
      kind: "Wind over the plan's limit",
      after: "tag-rope", delay: 2, seconds: 12,
      alert: "A gust has hit the girder mid-swing: the anemometer at the boom tip is reading over the lift plan's limit and the girder is weathervaning on its slings.",
      cue: "Call the wind hold: stop the swing and control the load until the wind drops back.",
      target: "wind-hold-call",
      why: "The plan's wind limit is not advisory: past it the girder's web loads both booms sideways, a force the crane charts do not account for. The lift director stops the lift the moment the reading crosses the limit, holds or lowers the load under control per the plan, and nobody resumes until the wind is back inside it.",
      missNote: "The swing carried on through the gust; the girder swung its west end a metre toward the connector's basket before the tag line caught it, and crane A's load readout spiked well past its planned share.",
      wrongNote: "The wind hold — the wind is over the plan's limit, and the lift director stops the lift before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BTL_ACCENT);

    // ----------------------------------------------- ground and channel
    const ground = box(g, 12.0, 0.04, 9.0, 0, 0.02, -2.0, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#5a5448", base2: "#4e493f", seam: "rgba(0,0,0,0.25)" }), { repeat: 5, px: 512 }), { rough: 0.97, color: 0xc8c0ae });
    const channel = box(g, 5.0, 0.02, 1.6, 0, 0.045, -3.2, 0xffffff);
    channel.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h), { repeat: 2, px: 256 }), { rough: 0.9, color: 0xb8c0b8 });

    // ----------------------------------------------- pier caps, first girder
    const capMat = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 2, base: "#9a968c", base2: "#8e8a80", seam: "rgba(0,0,0,0.15)" }), { repeat: 1, px: 256 }), { rough: 0.95, color: 0xe6e2d8 });
    for (const sx of [-1, 1]) {
      const cap = box(g, 1.0, 0.5, 2.8, sx * 3.0, BTL_CAP_TOP - 0.25, -2.7, 0xffffff);
      cap.material = capMat;
      const col = box(g, 0.7, BTL_CAP_TOP - 0.5, 2.0, sx * 3.0, (BTL_CAP_TOP - 0.5) / 2, -2.7, 0xffffff);
      col.material = capMat;
      if (sx > 0) box(g, 0.34, 0.05, 0.4, sx * 3.0, BTL_CAP_TOP + 0.025, BTL_SET_Z, 0x2b2b2b, { rough: 0.9 });
    }
    const steel = 0x6d8a96;
    const g1 = group(g, 0, BTL_CAP_TOP + 0.05, -3.4);
    box(g1, 6.6, 0.04, 0.36, 0, 0.02, 0, steel, { rough: 0.55, metal: 0.45 });
    box(g1, 6.6, 0.9, 0.025, 0, 0.47, 0, steel, { rough: 0.55, metal: 0.45 });
    box(g1, 6.6, 0.04, 0.36, 0, 0.92, 0, steel, { rough: 0.55, metal: 0.45 });

    // ----------------------------------------------- the girder being set
    const girder = group(g, 0, BTL_START.y, BTL_START.z);
    box(girder, 6.6, 0.04, 0.36, 0, 0.02, 0, steel, { rough: 0.55, metal: 0.45 });
    box(girder, 6.6, 0.9, 0.025, 0, 0.47, 0, steel, { rough: 0.55, metal: 0.45 });
    box(girder, 6.6, 0.04, 0.36, 0, 0.92, 0, steel, { rough: 0.55, metal: 0.45 });
    const lugs = [];
    for (const sx of [-1, 1]) {
      const lug = torus(girder, 0.06, 0.018, sx * 2.4, 1.0, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 6, seg2: 12 });
      lugs.push(lug);
    }
    const lugHit = box(girder, 0.3, 0.3, 0.4, -3.1, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(girder, "lifting lug — west end", -3.1, 1.2, 0.2, { css: BTL_CSS, w: 0.36 });
    reg(hits, lugHit, "girder-lug");
    const endHit = box(girder, 0.25, 0.9, 0.4, 3.2, 0.47, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(girder, "grab the end by hand?", 3.1, 1.25, 0.25, { css: "#d2312b", w: 0.4 });
    reg(hits, endHit, "hand-on-girder");
    // Slings from each lug up to its crane's hook: two legs each, drawn fresh as the girder moves.
    const slingMat = mat(0x9aa0a6, { rough: 0.5, metal: 0.6 });
    const lines = [0, 1].map(() => { const c = cyl(g, 0.02, 0.02, 1, 0, 0, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6, seg: 6 }); c.material = slingMat; return c; });
    reg(hits, lines[0], "slack-a");
    reg(hits, lines[1], "slack-b");
    const lineTags = [holoTag(g, "crane A load line", -2.4, 4.2, BTL_START.z + 0.1, { css: BTL_CSS, w: 0.32 }), holoTag(g, "crane B load line", 2.4, 4.2, BTL_START.z + 0.1, { css: BTL_CSS, w: 0.32 })];
    // The tag line, rigged at fit-up, running from the west lug to a hand at the ground.
    const tagRope = hose(g, [[-3.2, 0.9, -0.55], [-3.5, 0.55, 0.3], [-3.6, 1.0, 1.2]], 0.01, 0xe8762b, { steps: 12, rough: 0.85 });
    tagRope.visible = false;
    const tagHandle = box(g, 0.3, 0.3, 0.3, -3.6, 1.0, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "tag line — hold", -3.6, 1.35, 1.2, { css: BTL_CSS, w: 0.3 });
    reg(hits, tagHandle, "tag-rope");
    const coil = tagLine(g, -1.9, 0, 1.35, { ry: 0.5 });
    reg(hits, coil, "tag-coil");
    // Cribbing under the girder.
    for (const sx of [-1, 1]) box(g, 0.3, 0.33, 0.9, sx * 2.2, 0.165, BTL_START.z, 0x7a5a36, { rough: 0.95 });
    // Shadow under the load path.
    const shadow = box(g, 5.0, 0.01, 0.9, 0, 0.06, -1.2, 0x000000, { opacity: 0.25, transparent: true, cast: false });
    holoTag(g, "stand under it to steady it?", 0.9, 0.3, -1.0, { css: "#d2312b", w: 0.5 });
    reg(hits, shadow, "under-suspended-load");

    // ----------------------------------------------- the two cranes
    const cranes = [
      { cx: -5.9, cz: -9.3, ry: Math.PI / 2, name: "A", colour: 0xe0a83a },
      { cx: 5.9, cz: -9.3, ry: -Math.PI / 2, name: "B", colour: 0xd8c040 },
    ].map((c) => ({ ...c, obj: mobileCrane(g, c.cx, 0, c.cz, { ry: c.ry, livery: { colour: c.colour, fleetName: "CITY LIFT", unitNumber: `RT-${c.name}` } }) }));
    for (const c of cranes) for (const o of c.obj.userData.parts.outriggers) o.position.x += Math.sign(o.position.x) * 1.2;
    const aim = () => {
      const gp = girder.position;
      cranes.forEach((c, i) => {
        const tx = i === 0 ? -2.4 : 2.4;
        const tip = btlAimCrane(c.obj, c.cx, c.cz, c.ry, tx, gp.z, 0.6);
        const top = tip.y - 2.2, bot = gp.y + 1.0;
        lines[i].scale.y = Math.max(0.1, top - bot);
        lines[i].position.set(tx, (top + bot) / 2, gp.z);
        if (lineTags) lineTags[i].position.set(tx, Math.min(top, bot + 1.6), gp.z + 0.1);
      });
    };
    aim();
    // Crane B's rear outrigger pad on bare soil, its mat stacked beside it.
    const matStack = group(g, 3.4, 0, -5.4);
    box(matStack, 1.2, 0.26, 1.2, 0, 0.13, 0, 0x6a4a2a, { rough: 0.95 });
    holoTag(matStack, "outrigger mat — not under the pad", 0, 0.5, 0, { css: BTL_CSS, w: 0.52 });
    reg(hits, matStack, "no-crane-mat");
    // Rigging defects laid out on the ground by the cribbing.
    const sling = group(g, 1.3, 0, 0.55);
    hose(sling, [[-0.5, 0.03, 0], [-0.1, 0.03, 0.08], [0.0, 0.1, 0.02], [0.1, 0.03, -0.06], [0.5, 0.03, 0]], 0.014, 0x8b949d, { steps: 16, rough: 0.5, metal: 0.6 });
    holoTag(sling, "east choker", 0, 0.28, 0, { css: BTL_CSS, w: 0.22 });
    reg(hits, sling, "kinked-sling");
    const shackle = group(g, 2.1, 0, 0.8);
    torus(shackle, 0.07, 0.016, 0, 0.08, 0, 0x2f6fd0, { rough: 0.5, metal: 0.5, seg: 6, seg2: 12 });
    cyl(shackle, 0.014, 0.014, 0.2, 0.02, 0.08, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(shackle, "crane B shackle", 0, 0.3, 0, { css: BTL_CSS, w: 0.28 });
    reg(hits, shackle, "unmoused-shackle");
    // Crane A's counterweight swing radius, barricaded.
    const swing = group(g, -3.3, 0, -5.1);
    barrierPanel(swing, 0, 0, { ry: 0.5, w: 1.2 });
    const swingHit = box(swing, 1.2, 0.6, 0.3, 0, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    swingHit.rotation.y = 0.5;
    holoTag(swing, "step into the swing radius?", 0, 1.2, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, swingHit, "swing-radius");

    // ----------------------------------------------- the connector's basket
    const lift = aerialBoomLift(g, -8.05, 0, BTL_SET_Z, { ry: Math.PI / 2 });
    const { boom: liftBoom, jib, platform } = lift.userData.parts;
    liftBoom.rotation.x = -0.1; jib.rotation.x = 0.1;
    const anchor = torus(platform, 0.05, 0.014, -0.6, 0.3, 0.55, 0xf2c14b, { rough: 0.5, metal: 0.5, seg: 6, seg2: 12, emissive: BTL_ACCENT, ei: 0.8 });
    holoTag(platform, "basket anchor — tie off", -0.6, 1.45, 0.62, { css: BTL_CSS, w: 0.4 });
    reg(hits, anchor, "basket-harness");
    const railHit = box(platform, 1.0, 0.1, 0.1, 0.4, 0.6, 0.62, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(platform, "stand on the midrail?", 0.5, 0.85, 0.66, { css: "#d2312b", w: 0.36 });
    reg(hits, railHit, "basket-rail-climb");

    // ----------------------------------------------- bearings, cross-frame, bolts
    const bearingHit = box(g, 0.45, 0.2, 0.5, -3.0, BTL_CAP_TOP + 0.1, BTL_SET_Z, BTL_ACCENT, { opacity: 0.25, transparent: true, emissive: BTL_ACCENT, ei: 0.5, cast: false });
    reg(hits, bearingHit, "bearing-west");
    const brace = group(g, -3.0, BTL_CAP_TOP, -1.2);
    for (const [a, b] of [[[-0.1, 0.1, 0], [0.1, 0.8, -0.9]], [[-0.1, 0.8, 0], [0.1, 0.1, -0.9]]]) {
      const len = Math.hypot(b[1] - a[1], b[2] - a[2]);
      const bar = box(brace, 0.06, len, 0.06, 0, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 0xb0b8be, { rough: 0.5, metal: 0.6 });
      bar.rotation.x = Math.atan2(b[2] - a[2], b[1] - a[1]);
    }
    brace.rotation.y = Math.PI / 2;
    reg(hits, brace, "temp-brace");
    const braceSocket = box(g, 0.3, 0.9, 1.2, -2.55, BTL_CAP_TOP + 0.5, -2.75, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["brace-socket"] = braceSocket;
    const boltPlate = group(g, -2.55, BTL_CAP_TOP + 0.55, BTL_SET_Z - 0.03);
    box(boltPlate, 0.02, 0.5, 0.18, 0, 0, 0, 0x9aa3ab, { rough: 0.5, metal: 0.6 });
    const boltFace = decal(boltPlate, 0.16, 0.44, -0.012, 0, 0, signFace("BOLTS\nOPEN", { bg: "#2b2f33", accent: "#f2ae14", fg: "#f7f4ec", scale: 0.18 }), { px: 128 });
    boltFace.rotation.y = -Math.PI / 2;
    boltPlate.visible = false;
    const boltHit = box(g, 0.3, 0.6, 0.3, -2.55, BTL_CAP_TOP + 0.55, BTL_SET_Z - 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross-frame bolts", -2.4, BTL_CAP_TOP + 1.05, BTL_SET_Z - 0.1, { css: BTL_CSS, w: 0.3 });
    reg(hits, boltHit, "cross-frame-bolts");

    // ----------------------------------------------- the lift director's post
    const post = group(g, 1.9, 0, 1.2, -0.4);
    box(post, 0.9, 0.05, 0.5, 0, 0.9, 0, 0x2f3a44, { rough: 0.6, metal: 0.3 });
    box(post, 0.5, 0.9, 0.3, 0, 0.45, 0, 0x3a4550, { rough: 0.6, metal: 0.3 });
    const trial = group(post, 0.08, 0.925, 0.1);
    decal(trial, 0.15, 0.11, 0, 0.011, 0, signFace("TRIAL\nPICK", { bg: "#efe6d2", fg: "#2a2014", accent: BTL_CSS, scale: 0.3 }), { px: 128 }).rotation.x = -Math.PI / 2;
    reg(hits, trial, "trial-pick");
    const share = group(post, 0.3, 0.925, -0.05);
    box(share, 0.26, 0.2, 0.05, 0, 0.1, 0, 0x22262b, { rough: 0.5 });
    const shareFace = decal(share, 0.24, 0.17, 0, 0.1, 0.026, signFace("A — / B —", { bg: "#0d1c24", accent: BTL_CSS, fg: "#bfeaf7", scale: 0.3 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(post, "level / load share", 0.3, 1.33, -0.05, { css: BTL_CSS, w: 0.3 });
    reg(hits, share, "load-share");
    const dirRadio = radio(post, 0.42, 0.925, 0.16, { ry: -0.4 });
    reg(hits, dirRadio, "director-radio");
    const horn = group(post, 0.15, 0.925, 0.2);
    cyl(horn, 0.03, 0.03, 0.12, 0, 0.06, 0, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(post, "air horn", 0.15, 1.28, 0.25, { css: BTL_CSS, w: 0.16 });
    reg(hits, horn, "air-horn");
    // Wind: the boom-tip anemometer's display, a windsock, the hold flag.
    const mast = group(g, 2.8, 0, -0.2);
    cyl(mast, 0.03, 0.03, 3.2, 0, 1.6, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const cups = group(mast, 0, 3.25, 0);
    box(cups, 0.3, 0.012, 0.012, 0, 0, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    const sock = cyl(mast, 0.08, 0.04, 0.5, 0.25, 2.9, 0, 0xe8762b, { rough: 0.8, seg: 10 });
    sock.rotation.z = -1.1;
    const windBox = group(mast, 0, 1.3, 0.05);
    box(windBox, 0.26, 0.18, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5 });
    const windFace = decal(windBox, 0.24, 0.15, 0, 0, 0.026, signFace("WIND —", { bg: "#0d1c24", accent: BTL_CSS, fg: "#bfeaf7", scale: 0.36 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(mast, "anemometer — boom tip", 0, 1.55, 0.06, { css: BTL_CSS, w: 0.36 });
    reg(hits, windBox, "wind-gauge");
    const holdFlag = group(g, 2.55, 0, 1.95);
    cyl(holdFlag, 0.015, 0.015, 1.2, 0, 0.6, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const flag = decal(holdFlag, 0.36, 0.22, 0.19, 1.08, 0, signFace("WIND\nHOLD", { bg: "#3a3f44", accent: "#f2ae14", fg: "#f7f4ec", scale: 0.3 }), { px: 160 });
    holoTag(holdFlag, "wind hold", 0, 1.4, 0, { css: BTL_CSS, w: 0.18 });
    reg(hits, holdFlag, "wind-hold-call");
    const release = group(g, 1.25, 0, 2.05, 0.3);
    box(release, 0.03, 1.0, 0.03, 0, 0.5, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    const relFace = decal(release, 0.26, 0.18, 0, 1.05, 0.02, signFace("HOOKS\nON", { bg: "#2b2f33", accent: "#f2ae14", fg: "#f7f4ec", scale: 0.3 }), { px: 160 });
    holoTag(release, "release signal", 0, 1.3, 0, { css: BTL_CSS, w: 0.26 });
    reg(hits, release, "release-signal");

    // ----------------------------------------------- paper
    const panelDraw = (title, rows, done = false) => (cx, w, h) => {
      cx.fillStyle = "#17120a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BTL_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf1dc"; cx.fillText(title, w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = done ? "#d8f5e0" : "#f4ead4";
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.12)));
    };
    const plan = holoPanel(g, 0.95, 0.64, -1.0, 1.7, 2.1, panelDraw("MULTIPLE-CRANE LIFT PLAN — G2", [
      "Crane A west · crane B east · share per plan", "Radii and capacities: per plan, both cranes", "Wind limit at boom tip: per plan",
      "Slack A, slack B, trial pick, hoist level", "One lift director · air horn = all stop", "Brace to G1 and bolt before release",
    ]), { ry: 0.25, accent: BTL_ACCENT });
    reg(hits, plan, "lift-plan");
    const log = group(g, 0.45, 0, 2.45, -0.15);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.6, 0.42, 0, 1.3, 0.01, panelDraw("LIFT LOG — G2", ["Wind: —", "Shares on trial pick: —", "Rigging: —", "Stops: —"]), { px: 384, glow: true, ei: 0.6 });
    reg(hits, log, "lift-log");

    // ----------------------------------------------- crew
    const tagHand = standingFigure(g, 3.9, 0.6, { ry: -2.4, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0xf2c14b, gloves: true });
    hose(g, [[3.2, 0.9, -0.55], [3.6, 0.5, 0.1], [3.8, 1.0, 0.45]], 0.01, 0xe8762b, { steps: 10, rough: 0.85 });
    const laborer = standingFigure(g, 0.6, -1.0, { ry: 1.4, cloth: 0x5a4a3a, vest: 0xf2c14b, helmet: 0xf2f2f2, atStation: true });
    laborer.visible = false;

    const setGirder = (y, z, ry = 0) => { girder.position.y = y; girder.position.z = z; girder.rotation.y = ry; aim(); };
    let phase = "rest";

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 2.2, -2.2),
      onStep(step) { if (step.id === "load-share") phase = "hoist"; if (step.id === "tag-rope") phase = "swing"; },
      onStepComplete(step) {
        if (step.id === "rigging-find") { sling.children[0].material = mat(0xd2312b, { rough: 0.6 }); shackle.children[0].material = mat(0xd2312b, { rough: 0.6 }); matStack.position.set(4.2, 0, -7.2); }
        if (step.id === "wind-reading") repaint(windFace, signFace("UNDER LIMIT", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "tag-lines") { tagRope.visible = true; coil.visible = false; }
        if (step.id === "lift-sequence") setGirder(BTL_START.y + 0.12, BTL_START.z);
        if (step.id === "load-share") { phase = "rest"; setGirder(BTL_HIGH, BTL_START.z); }
        if (step.id === "tag-rope") { phase = "rest"; setGirder(BTL_HIGH, BTL_SET_Z); tagRope.visible = false; }
        if (step.id === "land") { setGirder(BTL_CAP_TOP + 0.05, BTL_SET_Z); bearingHit.visible = false; }
        if (step.id === "brace") brace.visible = true;
        if (step.id === "cross-frame-bolts") { boltPlate.visible = true; repaint(boltFace, signFace("BOLTED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.18 })); }
        if (step.id === "release") { lines.forEach((l) => { l.visible = false; }); repaint(relFace, signFace("HOOKS\nCLEAR", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 })); }
        if (step.id === "lift-log") repaint(log.userData.face, panelDraw("LIFT LOG — G2", ["Wind: under limit, then a gust — held", "Shares on trial pick: per plan", "Rigging: east choker and B shackle swapped", "Stops: worker under load — air horn"], true));
        if (step.id === "crew-checkin") repaint(dirRadio.userData.screen, signFace("G2 SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "worker-under-load") { laborer.visible = true; laborer.position.set(0.6, 0, -0.9); }
        if (it.id === "wind-gust") { sock.rotation.z = -1.55; girder.rotation.y = 0.14; flag.material = mat(0xd2312b, { rough: 0.7 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "worker-under-load") laborer.position.set(1.4, 0, 1.6);
        if (it.id === "wind-gust") { girder.rotation.y = 0; sock.rotation.z = -1.1; repaint(flag, signFace("HELD\nTHEN GO", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        cups.rotation.y = t * (session?.activeInterrupt?.id === "wind-gust" ? 14 : 5);
        if (phase === "hoist" && step?.id === "load-share") {
          const k = Math.min(1, (session.track?.inBand ?? 0) / 7);
          setGirder(BTL_START.y + 0.12 + (BTL_HIGH - BTL_START.y - 0.12) * k, BTL_START.z, (session.track.v - 0.48) * 0.08);
          repaint(shareFace, signFace(session.track.v < 0.38 ? "A HIGH" : session.track.v > 0.58 ? "B HIGH" : "LEVEL", { bg: "#0d1c24", accent: session.track.v >= 0.38 && session.track.v <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.4 }));
        }
        if (phase === "swing" && step?.id === "tag-rope") {
          const k = Math.min(1, (session.holdFor ?? 0) / 5);
          setGirder(BTL_HIGH, BTL_START.z + (BTL_SET_Z - BTL_START.z) * k, girder.rotation.y);
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-reading") repaint(windFace, signFace(gg.t < 0.3 ? "GUSTING" : gg.t <= 0.48 ? "STEADY" : "OVER", { bg: "#0d1c24", accent: gg.t >= 0.3 && gg.t <= 0.48 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.36 }));
        if (session?.turn && step?.id === "cross-frame-bolts") boltPlate.visible = session.turn.amount > 0.2;
        void CITY; void lugs;
      },
    };
  },
};
