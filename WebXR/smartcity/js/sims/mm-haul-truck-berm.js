import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, rackFrame, rackUnit,
  cone, barrierPanel, standingFigure, reg,
} from "../citykit.js";
import { dumpTruck } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Haul Truck Berm & Dump-Point Spotting VR — Manufacturing &
// Automation, mill and mine pack, station seven.
//
// A loaded haul truck's run to a surface dump point and back. The berm at
// the edge is what stands between a truck backing up and the drop behind
// it, and it is read against the truck's own axle before anyone backs
// toward it — not assumed adequate because a truck backed up to it before.
// A spotter's signal is what starts the back, a controlled rate is what
// finishes it, and the highwall above the point gets exactly the respect an
// unstable rock face is owed. Per the site's own traffic plan throughout;
// no berm height, no grade and no distance here is a fact this platform is
// claiming to know.

const HTB_ACCENT = 0xc77a2e;

export const SIM_MM_HAUL_TRUCK_BERM = {
  id: "mm-haul-truck-berm",
  index: "714",
  domain: "Mining",
  trade: "Surface mine haul truck operator",
  category: "Manufacturing & Automation",
  weather: "heat-haze",
  certification: "UMWA health and safety training; per the mine's traffic and dump-point plan and the mine safety regulations, named generically; ANSI B11 general safety requirements for machines; NIOSH criteria documents on haul-truck traffic and berm safety research",
  name: "Haul Truck Berm & Dump Point",
  title: simTitle("Haul Truck Berm & Dump Point"),
  tagline: "A loaded haul run to the dump point: the berm read against the axle, a spotter's signal before backing, a controlled back and dump, an empty return logged",
  accent: HTB_ACCENT,
  accentCss: "#c77a2e",
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "berm-respected", name: "Berm Respected", note: "A haul run made with the berm read before backing, the spotter's signal taken, and the highwall never trusted on a guess" },

  game: system({
    name: "Haul Road Authority",
    currency: "LOAD",
    ranks: ["Haul Truck Trainee", "Haul Truck Operator", "Lead Operator", "Pit Foreman", "Haul Road Authority Certified"],
    badges: [
      { id: "berm-read-first", name: "Berm Read First", note: "Berm checked against the axle before backing toward it, first time", test: AWARD.stepClean("berm-check") },
      { id: "never-past-the-berm", name: "Never Past The Berm", note: "Never backed on a low berm, without the spotter's signal, or parked under the highwall", test: AWARD.safe },
      { id: "clean-back", name: "Clean Back", note: "The back to the berm held its controlled rate", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections through the whole haul run", test: AWARD.clean },
      { id: "route-unbroken", name: "Route Unbroken", note: "Both drive legs never broke lane or band", test: AWARD.unbroken },
      { id: "run-fast", name: "Run Fast", note: "Haul run completed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "berm-too-low": "You backed toward the low berm instead of the one built to height. A berm that does not reach the truck's axle line does not stop the truck the way a proper one does — it can let a rear wheel ride up and over it rather than being stopped by it, which is exactly the moment a berm exists to prevent.",
    "no-spotter-signal": "You started backing without the spotter's signal. The spotter is watching the edge and the space behind the truck from an angle the mirrors do not cover, and backing on your own judgement instead of their signal removes the one check that actually covers your blind spot.",
    "highwall-overhang": "You parked under the overhanging face of the highwall. Rock that has undercut itself does not announce when it is about to let go, and the only position that is safe from it is not being underneath it — a truck parked there is a truck parked exactly where the rock is most likely to land.",
    "phone-distraction": "You reached for the phone while the truck was moving. A haul truck this size takes a driver's full attention to place safely on a road shared with the rest of the pit's traffic — a glance at a phone is a glance away from the one thing the load, the berm and the spotter all depend on you actually watching.",
  },

  lateNotes: {
    "reverse-control-lever": "Not yet. The berm is checked and the spotter's signal is taken before the truck moves backward.",
    "hoist-lever": "Not yet. The park brake is set before the bed comes up.",
  },

  steps: [
    {
      id: "pre-trip-walk", kind: "find", noHint: true,
      targets: ["tire-defect"],
      itemNames: { "tire-defect": "a cut in the sidewall of a rear tire" },
      itemNotes: { "tire-defect": "There is a visible cut in the sidewall of one of the rear tires — the kind of damage that can fail without warning under a loaded haul truck's own weight." },
      title: "Walk around the truck before the shift",
      cue: "Check the truck over and click what you find.",
      why: "A pre-trip walk-around is what catches a tire, a light or a leak before the truck is loaded and out on the haul road with it — the same defect found at the dump point is a defect found with a full load already riding on it.",
    },
    {
      id: "radio-checkin", kind: "select", target: "dispatch-radio",
      title: "Check in with dispatch",
      cue: "Radio dispatch for your route and dump point assignment.",
      why: "Dispatch is running every truck's route on the same haul road at once, and checking in before moving is what keeps your route matched to a plan somebody is actually tracking — a truck that picks its own route based on yesterday's assignment is a truck dispatch cannot account for.",
    },
    {
      id: "seatbelt", kind: "select", target: "seatbelt-buckle",
      title: "Buckle your seatbelt",
      cue: "Buckle in before the truck moves.",
      why: "A haul truck's cab is built to protect an operator who is actually belted into the seat — the belt is what keeps a driver in the position the cab's protection was designed around, on a road where the truck's own size does not mean nothing else out there can put it off level.",
    },
    {
      id: "haul-to-dump", kind: "drive", target: "haul-truck-rig",
      title: "Drive the loaded route to the dump point",
      cue: "Follow the haul road to the dump point, checking both mirrors and the horn at the marked points.",
      why: "The mirrors are how a haul truck driver keeps track of traffic a vehicle this size cannot simply see around, and the horn at a blind approach is what tells anyone on foot or in a smaller vehicle exactly where a load this size is before they are close enough for it to matter.",
      holdBreakNote: "Out of lane or band on the haul road — that is the load, the berm and everyone else on the road all riding on the same correction.",
      drive: {
        path: [[-5.5, -3.0], [-3.0, -3.4], [-0.5, -2.6], [1.5, -1.0], [2.2, 0.6]],
        speedBand: [10, 22], laneWidth: 1.6, graceSeconds: 1.8, checkWindow: 1.6, sceneRate: 0.09,
        bandLabel: "haul road speed",
        checks: [
          { at: 1, kind: "mirror-left", note: "Left mirror on the bend — the pit's own traffic runs both ways on this road." },
          { at: 3, kind: "horn", note: "Horn at the blind approach to the dump point." },
          { at: 4, kind: "mirror-right", note: "Right mirror as the dump point comes into view." },
        ],
        controls: { brake: "haul-brake-pedal", horn: "haul-horn-button" },
        laneNote: "You left the haul road's lane. On a road shared with loaded trucks and light vehicles, that is a truck this size in somebody else's path.",
      },
    },
    {
      id: "berm-check", kind: "select", target: "dump-berm",
      title: "Check the berm before backing",
      cue: "Sight the berm against the truck's own axle line before backing toward it.",
      why: "The berm is checked against this truck's actual axle line, not assumed built to spec from the cab — a berm that reaches the axle is what actually stops a rear wheel from riding up and over it, and that is a fact about this specific berm and this specific truck, not a general assumption about dump points.",
    },
    {
      id: "get-spotter-signal", kind: "select", target: "spotter",
      title: "Get the spotter's signal",
      cue: "Watch the spotter and wait for their signal before backing toward the edge.",
      why: "The spotter is positioned to see the space behind the truck and the edge itself from an angle the mirrors cannot cover, and their signal is what starts the back — not the driver's own read of the mirrors, which is exactly the view the spotter exists to cover for.",
    },
    {
      id: "back-to-berm", kind: "track", target: "reverse-control-lever", seconds: 6,
      title: "Back to the berm at a controlled rate",
      cue: "Hold the reverse control steady and back toward the berm at a controlled rate, watching the spotter.",
      why: "A back taken too fast gives the spotter no time to signal a stop if something changes behind the truck; taken too slow, the driver loses the feel for exactly where the wheels are relative to the berm. The controlled rate is what keeps the spotter's signal actually able to stop the truck in time if it needs to.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.5, fall: 0.42, drift: 0.12, label: "BACK RATE", readout: (v) => (v < 0.38 ? "too slow" : v > 0.58 ? "too fast for the spotter to stop you" : "controlled") },
      holdBreakNote: "Back rate out of band — bring it back under control before the wheels reach the berm.",
    },
    {
      id: "set-park-brake", kind: "turn", target: "park-brake-lever",
      title: "Set the park brake",
      cue: "Set the park brake before raising the bed.",
      why: "A bed raised on a truck that is not braked can roll the moment its balance shifts — the park brake is what keeps the truck exactly where the spotter placed it for the whole time the bed is up and the load is shifting off the back of it.",
      turn: { turns: 0.5, axis: "y", label: "PARK BRAKE" },
    },
    {
      id: "raise-bed", kind: "hold", target: "hoist-lever", seconds: 5,
      title: "Raise the bed and dump the load",
      cue: "Hold the hoist lever until the bed is fully raised and the load has cleared.",
      why: "The hoist is held through the full raise because a bed stopped partway with a load still shifting inside it is a load balanced somewhere the truck was never designed to carry it — the lever is held until the bed is all the way up and the bed is actually clear.",
      holdBreakNote: "You released the hoist before the bed finished raising. A load left half-dumped shifts the truck's balance in a way a fully raised or fully lowered bed does not.",
    },
    {
      id: "lower-bed", kind: "turn", target: "hoist-lower-control",
      title: "Lower the bed",
      cue: "Turn the control to lower the bed fully before moving off.",
      why: "The bed comes down fully before the truck moves — a raised bed changes the truck's height and its balance, and pulling away with it still up risks striking whatever the extra height was never accounted for, from an overhead structure to the highwall itself.",
      turn: { turns: 0.5, axis: "y", label: "LOWER" },
    },
    {
      id: "return-empty", kind: "drive", target: "haul-truck-rig",
      title: "Drive the empty return route",
      cue: "Follow the haul road back, signalling and checking both mirrors at the marked points.",
      why: "An empty truck handles differently from a loaded one — it brakes shorter and bounces more over the same road surface — and the same mirror and signal discipline applies on the way back, because the rest of the pit's traffic does not know your bed is empty just by looking at it.",
      holdBreakNote: "Out of lane or band on the return — an empty truck is still a truck this size on a shared road.",
      drive: {
        path: [[2.2, 0.6], [1.5, -1.0], [-0.5, -2.6], [-3.0, -3.4], [-5.5, -3.0]],
        speedBand: [12, 26], laneWidth: 1.6, graceSeconds: 1.8, checkWindow: 1.5, sceneRate: 0.095,
        bandLabel: "empty return speed",
        checks: [
          { at: 1, kind: "mirror-right", note: "Right mirror leaving the dump point." },
          { at: 3, kind: "signal-left", note: "Signal left for the turn back onto the main haul road." },
        ],
        controls: { brake: "haul-brake-pedal", horn: "haul-horn-button" },
        laneNote: "You left the lane on the return leg. An empty truck out of its lane is still a truck the rest of the pit has to react to.",
      },
    },
    {
      id: "log-load", kind: "select", target: "haul-log",
      title: "Log the load",
      cue: "Record the load and the dump point on the haul sheet.",
      why: "The haul sheet is what lets the pit track how the material is actually moving against the plan — a load hauled and dumped clean but never logged is a load the plan has no record of ever having moved.",
    },
  ],

  interrupts: [
    {
      id: "spotter-waves-off",
      kind: "Wave-off mid-back",
      after: "back-to-berm", delay: 3, seconds: 11,
      alert: "The spotter suddenly waves both arms overhead — a light vehicle has crossed into the space behind the truck.",
      cue: "The spotter is signalling stop, not go.",
      target: "haul-brake-pedal",
      why: "A wave-off overrides whatever signal came before it, because something has changed behind the truck that the spotter can see and the driver cannot. The brake is the only answer that matters the instant that signal changes — finishing the back on the signal that used to be current is backing on information that is no longer true.",
      missNote: "The truck kept backing after the wave-off. A spotter's signal is only worth having if it is obeyed the moment it changes, and a light vehicle behind a backing haul truck does not get a second warning if the truck keeps coming.",
      wrongNote: "It is the brake. A wave-off means stop, right now, from wherever the truck already is.",
    },
    {
      id: "highwall-shift",
      kind: "Highwall shows movement",
      after: "raise-bed", delay: 4, seconds: 12,
      alert: "A section of the highwall above the dump point sheds a visible slide of loose rock while the bed is still up.",
      cue: "The highwall above you just moved.",
      target: "dispatch-radio",
      why: "Visible movement on a highwall is reported immediately, before the truck pulls away as if nothing happened — dispatch needs to know this dump point may need to be closed for an examination before the next truck backs up to the same berm under the same wall.",
      missNote: "The slide went unreported and the next truck backed up to the same dump point under the same highwall. A highwall that has already shed rock once is telling you something about the rest of it, and the only way that reaches the next driver is if it gets called in.",
      wrongNote: "It is the dispatch radio. Nothing else gets this dump point looked at before the next truck backs up to it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, HTB_ACCENT);
    box(g, 7.2, 0.12, 6.6, 0, 0.06, 0, 0x8a7350, { rough: 0.95, finish: "concrete" });
    for (let i = -3; i <= 3; i++) box(g, 0.06, 0.13, 6.6, i * 1.1, 0.065, 0, 0xf0b323, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });

    // ------------------------------------------------------------- highwall
    const highwall = group(g, 2.4, 0, 1.6);
    box(highwall, 2.4, 3.0, 0.8, 0, 1.5, 0, 0x6a5a44, { rough: 0.95, finish: "concrete" });
    const overhang = box(highwall, 1.2, 0.4, 0.6, 0.4, 2.8, 0.4, 0x6a5a44, { rough: 0.95 });
    reg(hits, overhang, "highwall-overhang");
    const slideDust = particles(g, 20, 0x9a8560, { size: 0.05, life: 0.6, additive: false, opacity: 0.4 });
    slideDust.position.set(2.6, 2.4, 1.8);
    slideDust.visible = false;

    // -------------------------------------------------------------- berms
    function berm(x, z, high) {
      const bm = group(g, x, 0, z);
      box(bm, 2.0, high ? 0.55 : 0.22, 0.5, 0, (high ? 0.55 : 0.22) / 2, 0, 0x7a6448, { rough: 0.9, finish: "concrete" });
      return bm;
    }
    const goodBerm = berm(2.0, 0.9, true);
    reg(hits, goodBerm, "dump-berm");
    const lowBerm = berm(-1.5, 1.6, false);
    reg(hits, lowBerm, "berm-too-low");
    const dumpEdge = box(g, 2.0, 0.4, 0.3, 2.0, 0.2, 1.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["dump-edge"] = dumpEdge;
    holoTag(g, "dump point — berm to axle", 2.0, 0.9, 0.9, { css: "#c77a2e", w: 0.5 });

    // ---------------------------------------------------------- the truck
    const truck = dumpTruck(g, -5.5, 0, -3.0, { colour: 0xc77a2e, ry: 0.5 });
    reg(hits, truck, "haul-truck-rig");
    const tireCut = box(g, 0.05, 0.1, 0.02, -5.15, 0.6, -3.9, 0x1b1e22, { rough: 0.9 });
    reg(hits, tireCut, "tire-defect");
    const noSpotterZone = box(g, 1.0, 0.6, 1.0, 2.0, 0.3, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noSpotterZone, "no-spotter-signal");
    const phone = box(g, 0.08, 0.14, 0.02, -5.15, 1.5, -3.1, 0x2b2f34, { rough: 0.5 });
    holoTag(g, "phone", -5.15, 1.62, -3.1, { css: "#f0645b", w: 0.24 });
    reg(hits, phone, "phone-distraction");

    // Spotter figure at the dump point.
    const spotter = standingFigure(g, 1.2, 0.6, { ry: 2.0, cloth: 0x4a5b6b, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "spotter", 1.2, 2.0, 0.6, { css: "#c77a2e", w: 0.26 });
    reg(hits, spotter, "spotter");
    const waveOffLight = ball(g, 0.07, 1.2, 2.15, 0.6, 0x8a2020, { emissive: 0x000000, ei: 1, rough: 0.4, seg: 12, seg2: 10 });

    // Cab controls: reverse lever, park brake, hoist, seatbelt, radio, horn, brake pedal.
    const cabPanel = group(g, -5.9, 0, -2.5);
    box(cabPanel, 0.5, 1.3, 0.14, 0, 0.65, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const seatbelt = box(cabPanel, 0.3, 0.06, 0.04, 0, 0.5, 0.08, 0xd2312b, { rough: 0.7, finish: "rubber" });
    holoTag(cabPanel, "seatbelt", 0, 0.66, 0.08, { css: "#c77a2e", w: 0.26 });
    reg(hits, seatbelt, "seatbelt-buckle");
    const radio = group(cabPanel, 0, 0.95, 0.08);
    box(radio, 0.18, 0.16, 0.06, 0, 0, 0, 0x1b1e22, { rough: 0.6 });
    holoTag(radio, "dispatch radio", 0, 0.14, 0, { css: "#c77a2e", w: 0.32 });
    reg(hits, radio, "dispatch-radio");
    const brakePedal = box(g, 0.16, 0.08, 0.14, -5.85, 0.1, -2.35, 0xe8b02e, { rough: 0.6 });
    reg(hits, brakePedal, "haul-brake-pedal");
    const hornBtn = ball(cabPanel, 0.04, -0.12, 0.85, 0.09, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 12, seg2: 10 });
    reg(hits, hornBtn, "haul-horn-button");

    const revLeverPost = group(g, -1.0, 0, 0.4);
    box(revLeverPost, 0.14, 0.8, 0.12, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const revLeverArm = cyl(revLeverPost, 0.02, 0.02, 0.35, 0, 0.8, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, revLeverPost, "reverse-control-lever");
    const parkBrakePost = group(g, -0.6, 0, 0.4);
    box(parkBrakePost, 0.14, 0.8, 0.12, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const parkBrakeHandle = box(parkBrakePost, 0.03, 0.28, 0.03, 0, 0.85, 0.06, 0xd2312b, { rough: 0.5 });
    reg(hits, parkBrakePost, "park-brake-lever");
    const hoistPost = group(g, -0.2, 0, 0.4);
    box(hoistPost, 0.14, 0.8, 0.12, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const hoistArm = cyl(hoistPost, 0.02, 0.02, 0.35, 0, 0.8, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, hoistPost, "hoist-lever");
    const hoistLowerPost = group(g, 0.2, 0, 0.4);
    box(hoistLowerPost, 0.14, 0.8, 0.12, 0, 0.4, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const hoistLowerArm = cyl(hoistLowerPost, 0.02, 0.02, 0.35, 0, 0.8, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 8 });
    reg(hits, hoistLowerPost, "hoist-lower-control");

    // Haul log and dressing.
    const logStand = group(g, -2.0, 0, 1.6);
    cyl(logStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const logBoard = decal(logStand, 0.32, 0.4, 0, 0.95, 0.02, paperFace("HAUL SHEET", ["Load: ____", "Dump point: ____", "Trips: ____"], { bg: "#efe0c4", band: "#8a5a2a" }), { px: 256 });
    reg(hits, logBoard, "haul-log");
    const toolRack = toolChest(g, -2.7, -2.4, { ry: 0.5, color: 0xc77a2e });
    const spareRack = rackFrame(g, 2.9, -2.2, { ry: -0.6, h: 1.1 });
    for (let i = 0; i < 2; i++) rackUnit(spareRack, 0.3 + i * 0.34, ["SPARE TIRE", "WHEEL CHOCKS"][i], { css: "#c77a2e" });
    for (const [x, z] of [[-3.2, 2.4], [3.2, 2.2]]) cone(g, x, z);
    barrierPanel(g, 0, 3.1, { ry: 1.57, color: 0xf0b323 });
    const dustHaze = particles(g, 24, 0xd8c79a, { size: 0.06, life: 0.7, additive: false, opacity: 0.3 });
    dustHaze.position.set(0, 1.2, -1.0);

    return {
      hits,
      spawnLook: new THREE.Vector3(-5.0, 1.4, -2.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "seatbelt") { seatbelt.material = mat(0x59c97b, { rough: 0.6 }); }
        if (step.id === "set-park-brake") { parkBrakeHandle.rotation.z = Math.PI / 2; }
        if (step.id === "raise-bed") { truck.userData.parts?.hoist && (truck.userData.parts.hoist.rotation.x = -0.5); }
        if (step.id === "lower-bed") { truck.userData.parts?.hoist && (truck.userData.parts.hoist.rotation.x = 0); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "highwall-shift") { slideDust.visible = true; }
        if (it.id === "spotter-waves-off") {
          waveOffLight.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.4, rough: 0.4 });
          spotter.rotation.y = 2.0 + Math.PI;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "highwall-shift") { slideDust.visible = false; }
        if (it.id === "spotter-waves-off") {
          waveOffLight.material = mat(0x8a2020, { rough: 0.4 });
          spotter.rotation.y = 2.0;
        }
      },
      animate(t, dt, session) {
        void dt;
        dustHaze.userData.step?.(0.016, new THREE.Vector3(0, 1.2, -1.0), 0.3, 0.2, 0.4);
        if (slideDust.visible) slideDust.userData.step?.(0.016, new THREE.Vector3(2.6, 2.4, 1.8), 0.2, 0.3, -0.6);
        const step = session?.step;
        if (step?.id === "back-to-berm" && session.track) {
          const tv = session.track.v;
          truck.position.x = -1.0 + (2.0 - -1.0 - 1.4) * tv;
          truck.position.z = 0.6 + (0.9 - 0.6) * tv;
        }
        void t; void revLeverArm; void hoistArm; void hoistLowerArm;
      },
    };
  },
};
