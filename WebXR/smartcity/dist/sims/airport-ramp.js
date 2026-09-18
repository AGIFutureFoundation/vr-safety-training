import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Airport Ramp VR — Mobility & Transit, station five.
// Turning a narrow-body at the gate: the foreign-object walk and the
// equipment-restraint line before the aircraft arrives, marshalling it onto
// the lead-in, chocks before anything else touches it, cones set, ground
// power and the headset check with the flight deck, the bridge driven to
// the door under the safety envelope, the belt loader approached at walking
// pace, and the all-clear given only when the cones and chocks are back.

const AR2_ACCENT = 0x63b5f0;

export const SIM_AIRPORT_RAMP = {
  id: "airport-ramp",
  index: "46",
  domain: "Mobility & Transit",
  trade: "Airline ramp agent / ground handler",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "IAM and Transport Workers Union ramp locals; IATA Ground Operations Manual (AHM 630 ground support equipment, ERA safety envelope); FAA 14 CFR 139.303 personnel training and 139.329 movement-area safety; OSHA 29 CFR 1910.178 for powered ramp equipment",
  name: "Airport Ramp",
  title: simTitle("Airport Ramp"),
  tagline: "Gate turn: FOD walk and equipment restraint line, marshal onto the lead-in, chocks before anything touches it, cones set, ground power and headset to the flight deck, bridge to the door, loader at walking pace, all-clear only when chocks and cones are back",
  accent: AR2_ACCENT,
  accentCss: "#63b5f0",
  parSeconds: 250,
  footprint: 2.6,
  badge: { id: "clean-turn", name: "Clean Turn", note: "Chocks before contact, cones set, headset before pushback and the all-clear given last — first time" },

  game: system({
    name: "Ramp Operations",
    currency: "TURN",
    ranks: ["Ramp Agent", "Lead Agent", "Turn Coordinator", "Ramp Supervisor", "Ramp Operations Certified"],
    badges: [
      { id: "fod-free", name: "FOD Free", note: "The ramp walked and cleared before the aircraft arrived, first time", test: AWARD.stepClean("fod") },
      { id: "envelope-kept", name: "Envelope Kept", note: "Never inside the engine arc running, never a vehicle past the line, never a chock pulled early", test: AWARD.safe },
      { id: "on-the-line", name: "On the Line", note: "Nosewheel stop and bridge alignment both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-ramp", name: "Clean Ramp", note: "No corrections anywhere in the turn", test: AWARD.clean },
      { id: "steady-approach", name: "Steady Approach", note: "Bridge driven in steadily the whole way", test: AWARD.unbroken },
      { id: "on-time", name: "On Time", note: "Turn complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-engine-arc": "You walked through the engine's intake arc with the engine turning. A running narrow-body engine ingests a person from several metres in front of it, and the exhaust behind it will blow a baggage cart across the ramp.",
    "vehicle-past-line": "You drove ground equipment past the equipment-restraint line before the aircraft stopped and was chocked. Every year a piece of ground equipment strikes a moving aircraft on a ramp; the line exists to make that impossible.",
    "chock-pulled-early": "You pulled the chocks with the bridge still on the aircraft. Nothing holds the aircraft then except its brakes, and a brake release with the bridge attached takes the door off.",
    "under-fuselage-loading": "You stood under the fuselage while the loader was moving against it. The loader's platform is a shear point against the aircraft skin, and there is no room to get out from under it.",
  },

  lateNotes: {
    "bridge-drive": "The bridge comes to the door after the aircraft is stopped, chocked and coned.",
    "gpu-connect": "Ground power goes on after the aircraft is chocked and the engines are shut down.",
    "allclear-signal": "The all-clear is the last thing that happens, after the chocks and cones are back on the truck.",
  },


  // Interruptions: see shared/game.js. A ramp turn is the densest interruption
  // environment in this whole roster — everything on it moves, most of it is
  // driven by somebody who cannot see you, and the aircraft is the least of it.
  interrupts: [
    {
      id: "vehicle-inbound",
      kind: "Ramp traffic",
      after: "gpu", delay: 4, seconds: 11,
      alert: "A catering truck is coming up the stand and the equipment line cones are not where they should be.",
      cue: "Stop it at the line.",
      target: "cones-set",
      why: "The equipment restraint line is what stops a vehicle reaching the fuselage. It is reset for every turn because the last crew moved it, and a driver on a stand is steering to the cones, not to the paint.",
      missNote: "The truck came past the line with nothing marking it and stopped a metre off the fuselage. Ramp vehicle strikes on parked aircraft are the most common ground-damage claim there is, and the cone is the whole defence.",
      wrongNote: "The vehicle is coming and the line is not set. Nothing else on this turn matters for the next ten seconds.",
    },
    {
      id: "chock-kicked",
      kind: "Chock displaced",
      after: "bridge", delay: 5, seconds: 12,
      alert: "A tug has clipped the nose chock driving past. It is sitting a hand's width clear of the wheel.",
      cue: "The aircraft is not chocked. Re-set it before the bridge touches.",
      target: "chock-nose",
      why: "A chock that is not touching the tyre is not a chock. An aircraft on a sloping stand with the brakes released and the bridge docking against it has nothing holding it.",
      missNote: "You docked the bridge against an aircraft that was not chocked. If it had rolled, the bridge would have taken the door with it and everything in the jetway would have gone with the door.",
      wrongNote: "The nose chock is the one that got kicked. Re-set it — the rest of the turn can wait.",
    },
  ],

  steps: [
    {
      id: "brief", kind: "select", target: "turn-board",
      title: "Read the turn plan",
      cue: "Check the aircraft type, the stand, the equipment and who is on the headset.",
      why: "Stand geometry and aircraft type decide where the chocks and cones go and how far the bridge travels. The turn is planned on the ground before the aircraft is on final.",
    },
    {
      id: "fod", kind: "find", noHint: true,
      targets: ["fod-bolt", "fod-strap"],
      itemNames: { "fod-bolt": "loose bolt on the stand", "fod-strap": "cargo strap on the lead-in line" },
      itemNotes: {
        "fod-bolt": "A bolt is lying on the stand where the engine will pass — one ingestion writes off an engine.",
        "fod-strap": "A cargo strap is across the lead-in line and will be blown into the intake or wrapped around a nose gear.",
      },
      title: "Walk the stand for FOD",
      cue: "Walk the area the aircraft will occupy and pick up every loose object you find.",
      why: "Foreign object damage is the most expensive avoidable thing on a ramp. The walk happens before every arrival, and what is found goes in the bin, not kicked aside.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["equipment-line", "gse-parked", "hi-vis-check"],
      itemNames: { "equipment-line": "equipment restraint line clear", "gse-parked": "ground equipment behind the line", "hi-vis-check": "hi-vis and ear protection" },
      title: "Stage behind the line",
      cue: "Everything behind the equipment restraint line, brakes set, crew in hi-vis with hearing protection.",
      why: "Until the aircraft is stopped and chocked, the restraint line is the boundary between the ramp crew and a moving aeroplane.",
    },
    {
      id: "marshal", kind: "track", target: "marshal-wands", seconds: 6,
      title: "Marshal the aircraft in",
      cue: "Wands up, steady guidance down the lead-in line until the nosewheel reaches the stop bar.",
      why: "The pilot cannot see the nosewheel or the wingtips. The marshaller's rate and position are the only reference for the last thirty metres.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.6, fall: 0.5, drift: 0.12, label: "GUIDANCE", readout: (v) => (v < 0.38 ? "hesitating" : v > 0.58 ? "waving them in fast" : "steady") },
      holdBreakNote: "Signal rate out of band — the flight deck reads that as confusion. Steady the wands.",
    },
    {
      id: "stop", kind: "gauge", target: "stop-bar",
      title: "Stop on the mark",
      cue: "Give the stop when the nosewheel is on the stop bar — commit inside the band.",
      why: "The stop bar is where the bridge reaches the door and the wingtip clears the stand next door. A metre long or short and one of those is no longer true.",
      gauge: { label: "NOSEWHEEL", speed: 0.7, green: [0.46, 0.58], readout: (t) => `${((t - 0.52) * 400).toFixed(0)} cm`, missNote: "Off the stop bar — the bridge will not reach or the wingtip clearance is gone." },
    },
    {
      id: "chock", kind: "sequence",
      targets: ["chock-nose", "chock-main", "cones-set"],
      itemNames: { "chock-nose": "nose gear chocks", "chock-main": "main gear chocks", "cones-set": "wingtip and engine cones" },
      title: "Chock and cone",
      cue: "Nose chocks first, then the mains, then the cones at the wingtips and engines — and only then does anything else approach.",
      why: "Chocks before contact is the rule the whole ramp runs on. The cones mark the parts of the aircraft that ground equipment must never find with a mirror.",
      outOfOrderNote: "Nose, then mains, then cones — the aircraft is held before it is marked.",
    },
    {
      id: "gpu", kind: "sequence", anyOrder: true,
      targets: ["gpu-connect", "headset-plug"],
      itemNames: { "gpu-connect": "ground power connected", "headset-plug": "headset to the flight deck" },
      title: "Ground power and headset",
      cue: "Connect ground power and plug the headset into the nose interphone.",
      why: "Ground power lets the engines and the auxiliary unit shut down. The headset is the only direct line to the flight deck for the rest of the turn, and it is what pushback will happen on.",
    },
    {
      id: "bridge", kind: "track", target: "bridge-drive", seconds: 6,
      title: "Drive the bridge to the door",
      cue: "Bring the bridge in steadily, watching the cab height and the door sill.",
      why: "A bridge driven fast into an aircraft door is a hull strike that cancels the next four flights. Steady, watching the sill, with the auto-level following.",
      track: { start: 0.1, green: [0.36, 0.56], rise: 0.6, fall: 0.5, drift: 0.12, label: "BRIDGE", readout: (v) => (v < 0.36 ? "stopped" : v > 0.56 ? "too fast at the door" : "steady") },
      holdBreakNote: "Approach speed out of band — back off and bring it in steadily.",
    },
    {
      id: "align", kind: "gauge", target: "bridge-align",
      title: "Align and dock the bridge",
      cue: "Set the canopy against the fuselage and commit when the alignment is inside the band.",
      why: "The canopy seals to the fuselage and the auto-level keeps the sill matched as the aircraft rises with unloading. Off-centre, the seal leaks and the sill steps.",
      gauge: { label: "DOOR ALIGN", speed: 0.75, green: [0.46, 0.58], readout: (t) => `${((t - 0.52) * 60).toFixed(0)} cm off`, missNote: "Canopy off centre — re-align before the door opens." },
    },
    {
      id: "load", kind: "select", target: "belt-loader",
      title: "Bring the belt loader to the hold",
      cue: "Approach the cargo door at walking pace and stop short before raising the belt.",
      why: "Everything that approaches an aircraft does it at walking pace and stops short. The last metre is done with the platform, not with the vehicle.",
    },
    {
      id: "close", kind: "sequence",
      targets: ["cones-clear", "chocks-clear", "allclear-signal"],
      itemNames: { "cones-clear": "cones back on the truck", "chocks-clear": "chocks pulled", "allclear-signal": "all-clear to the flight deck" },
      title: "Clear the stand and give the all-clear",
      cue: "Cones up, then chocks, then the all-clear on the headset with the chocks held up in view.",
      why: "The chocks come up second to last and the all-clear last, with the chocks visible to the flight deck. That signal is the pilot's proof that nothing is still attached to their aircraft.",
      outOfOrderNote: "Cones, then chocks, then the all-clear — the aircraft is released last, and only once.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, AR2_ACCENT);
    box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0x3f4247, { rough: 0.95 });
    // Lead-in line and stop bar painted on the apron.
    for (let i = 0; i < 12; i++) box(g, 0.1, 0.004, 0.3, 0, 0.101, -2.6 + i * 0.36, 0xf2c14b, { rough: 0.9, cast: false });
    const stopBar = box(g, 1.2, 0.006, 0.09, 0, 0.102, 1.4, 0xd2312b, { rough: 0.9, cast: false });
    holoTag(g, "stop bar — 320", 0.85, 0.3, 1.4, { css: "#d2312b", w: 0.3 });
    reg(hits, stopBar, "stop-bar");
    // Equipment restraint line.
    for (let i = -8; i <= 8; i++) box(g, 0.22, 0.005, 0.1, i * 0.36, 0.101, 2.3, 0xf2f6fa, { rough: 0.9, cast: false });
    const erlHit = box(g, 6.0, 0.3, 0.3, 0, 0.2, 2.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "equipment restraint line", -2.2, 0.35, 2.3, { css: "#63b5f0", w: 0.5 });
    reg(hits, erlHit, "equipment-line");
    // Aircraft: nose, fuselage, wings, one engine, door.
    const ac = group(g, 0, 0.1, -1.4);
    const fuse = cyl(ac, 0.62, 0.62, 5.4, 0, 1.5, 0, 0xeef2f6, { rough: 0.35, metal: 0.25, seg: 22 });
    fuse.rotation.x = Math.PI / 2;
    ball(ac, 0.62, 0, 1.5, 2.6, 0xeef2f6, { rough: 0.35, metal: 0.25, seg: 18, seg2: 12 });
    box(ac, 0.5, 0.4, 0.35, 0, 1.75, 2.4, 0x1b2a38, { rough: 0.3, metal: 0.4 });
    for (let i = 0; i < 8; i++) box(ac, 0.1, 0.12, 0.02, -0.5 + (i % 2) * 1.0, 1.75, 1.2 - Math.floor(i / 2) * 0.9, 0x2b3a48, { rough: 0.3, cast: false });
    for (const sx of [-1, 1]) { const wing = box(ac, 2.9, 0.1, 1.1, sx * 1.7, 1.15, -0.4, 0xdfe6ec, { rough: 0.4, metal: 0.3 }); wing.rotation.y = sx * 0.16; wing.rotation.z = -sx * 0.05; }
    box(ac, 0.12, 1.7, 1.2, 0, 2.4, -2.3, 0xdfe6ec, { rough: 0.4, metal: 0.3 });
    const eng = group(ac, -1.5, 0.75, 0.25);
    cyl(eng, 0.4, 0.4, 1.2, 0, 0, 0, 0xd8dee4, { rough: 0.4, metal: 0.4, seg: 20, open: true }).rotation.x = Math.PI / 2;
    const fan = cyl(eng, 0.34, 0.34, 0.06, 0, 0, 0.5, 0x2b3138, { rough: 0.5, seg: 20 });
    fan.rotation.x = Math.PI / 2;
    cyl(eng, 0.1, 0.1, 0.5, 0, 0.5, -0.3, 0xb9bec4, { rough: 0.5, metal: 0.5, seg: 10 });
    holoTag(eng, "engine 1", 0, 0.6, 0.4, { css: "#63b5f0", w: 0.18 });
    const arc = cyl(g, 1.0, 1.6, 2.4, -1.5, 0.95, 0.9, 0xd2312b, { opacity: 0.1, transparent: true, rough: 0.5, cast: false, seg: 18, open: true });
    arc.rotation.x = Math.PI / 2;
    const arcHit = box(g, 1.3, 1.2, 1.2, -1.5, 0.8, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk through the arc?", -1.5, 1.55, 0.5, { css: "#d2312b", w: 0.4 });
    reg(hits, arcHit, "cross-engine-arc");
    // Gear and chocks.
    const noseGear = group(ac, 0, 0.1, 2.0);
    cyl(noseGear, 0.05, 0.05, 0.85, 0, 0.42, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 10 });
    for (const sx of [-1, 1]) cyl(noseGear, 0.17, 0.17, 0.1, sx * 0.1, 0.17, 0, 0x1a1e23, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;
    const noseChocks = [];
    for (const dz of [-0.3, 0.3]) { const c = box(noseGear, 0.3, 0.12, 0.16, 0, 0.06, dz, 0xf2c14b, { rough: 0.8 }); c.visible = false; noseChocks.push(c); }
    const noseChockPick = box(g, 0.3, 0.12, 0.16, 1.9, 0.16, 2.6, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "nose chocks", 1.9, 0.42, 2.6, { css: "#63b5f0", w: 0.26 });
    reg(hits, noseChockPick, "chock-nose");
    const mainChocks = [];
    for (const sx of [-1, 1]) {
      const mg = group(ac, sx * 0.55, 0.1, -0.6);
      cyl(mg, 0.06, 0.06, 0.8, 0, 0.4, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 10 });
      for (const dz of [-0.15, 0.15]) cyl(mg, 0.2, 0.2, 0.12, 0, 0.2, dz, 0x1a1e23, { rough: 0.9, seg: 14 }).rotation.z = Math.PI / 2;
      const c = box(mg, 0.34, 0.14, 0.18, 0, 0.07, 0.42, 0xf2c14b, { rough: 0.8 }); c.visible = false; mainChocks.push(c);
    }
    const mainChockPick = box(g, 0.34, 0.14, 0.18, 2.3, 0.17, 2.6, 0xf2c14b, { rough: 0.8 });
    holoTag(g, "main chocks", 2.3, 0.44, 2.6, { css: "#63b5f0", w: 0.26 });
    reg(hits, mainChockPick, "chock-main");
    const earlyPull = box(g, 0.4, 0.4, 0.4, 0.55, 0.3, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull the chocks now?", 0.55, 0.68, 0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, earlyPull, "chock-pulled-early");
    // Cones.
    const cones = [];
    for (const [x, z] of [[-3.0, -1.8], [3.0, -1.8], [-1.5, -0.5]]) { const c = cone(g, x, z); c.visible = false; cones.push(c); }
    const conePick = cone(g, 2.7, 2.6);
    holoTag(g, "cones", 2.7, 0.5, 2.6, { css: "#63b5f0", w: 0.16 });
    reg(hits, conePick, "cones-set");
    const coneClear = box(g, 0.4, 0.5, 0.4, -3.0, 0.3, -1.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cones back on the truck", -3.0, 0.72, -1.8, { css: "#63b5f0", w: 0.48 });
    reg(hits, coneClear, "cones-clear");
    const chockClear = box(g, 0.5, 0.4, 0.5, 0, 0.28, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "chocks pulled and shown", 0, 0.65, 0.9, { css: "#63b5f0", w: 0.48 });
    reg(hits, chockClear, "chocks-clear");
    // GSE behind the line: GPU, belt loader, bridge, tug.
    const gpu = group(g, 1.9, 0.1, 2.9, -0.3);
    box(gpu, 0.8, 0.6, 0.5, 0, 0.35, 0, 0xf2a23b, { rough: 0.6 });
    for (const [x, z] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) cyl(gpu, 0.1, 0.1, 0.08, x, 0.1, z, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(gpu, "ground power unit", 0, 0.85, 0, { css: "#63b5f0", w: 0.38 });
    reg(hits, gpu, "gpu-connect");
    const headset = box(ac, 0.08, 0.1, 0.05, 0.35, 0.35, 2.2, 0x1b1e23, { rough: 0.6 });
    holoTag(ac, "nose interphone", 0.35, 0.6, 2.25, { css: "#63b5f0", w: 0.34 });
    reg(hits, headset, "headset-plug");
    const allclear = box(g, 0.08, 0.18, 0.05, 1.3, 0.55, 1.9, 0x1b1e23, { rough: 0.6 });
    holoTag(g, "all-clear on the headset", 1.3, 0.82, 1.9, { css: "#63b5f0", w: 0.48 });
    reg(hits, allclear, "allclear-signal");
    const bridge = group(g, 3.2, 0.1, 0.4, 0);
    const bridgeTube = box(bridge, 2.6, 1.0, 1.1, 0, 1.8, 0, 0xc9d2da, { rough: 0.6, metal: 0.2 });
    box(bridge, 0.9, 1.2, 1.2, -1.5, 1.8, 0, 0xb2bcc5, { rough: 0.6, metal: 0.2 });
    for (const sx of [-1, 1]) cyl(bridge, 0.09, 0.09, 1.4, 0.7, 0.7, sx * 0.4, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    const bridgeCtl = instrument(bridge, 1.2, 1.1, 0.5, { idle: "-- cm", color: 0x63b5f0, w: 0.13, d: 0.2, ry: -0.6 });
    holoTag(bridge, "bridge drive", 1.2, 1.32, 0.5, { css: "#63b5f0", w: 0.28 });
    reg(hits, bridgeCtl, "bridge-drive");
    const alignCtl = instrument(bridge, 1.2, 0.85, 0.5, { idle: "-- cm", color: 0x63b5f0, w: 0.13, d: 0.2, ry: -0.6 });
    holoTag(bridge, "canopy align", 1.2, 0.62, 0.5, { css: "#63b5f0", w: 0.3 });
    reg(hits, alignCtl, "bridge-align");
    const loader = group(g, -3.0, 0.1, 2.9, 0.4);
    box(loader, 1.4, 0.5, 0.7, 0, 0.45, 0, 0x4a5561, { rough: 0.6, metal: 0.3 });
    const belt = box(loader, 1.8, 0.08, 0.5, 0.6, 0.85, 0, 0x2b2f34, { rough: 0.7 });
    belt.rotation.z = 0.25;
    for (const [x, z] of [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]]) cyl(loader, 0.16, 0.16, 0.12, x, 0.16, z, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(loader, "belt loader", 0, 1.15, 0, { css: "#63b5f0", w: 0.26 });
    reg(hits, loader, "belt-loader");
    const underFus = box(g, 1.2, 0.8, 0.8, -1.0, 0.5, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the loader?", -1.0, 1.0, -1.6, { css: "#d2312b", w: 0.44 });
    reg(hits, underFus, "under-fuselage-loading");
    const pastLine = box(g, 0.7, 0.6, 0.7, -2.0, 0.4, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drive past the line?", -2.0, 0.82, 1.7, { css: "#d2312b", w: 0.38 });
    reg(hits, pastLine, "vehicle-past-line");
    const gseParked = box(g, 0.9, 0.5, 0.6, -1.2, 0.35, 3.0, 0x53606b, { rough: 0.6, metal: 0.3 });
    holoTag(g, "ground equipment parked", -1.2, 0.75, 3.0, { css: "#63b5f0", w: 0.48 });
    reg(hits, gseParked, "gse-parked");
    // FOD items, hi-vis rack, marshaller with wands, turn board.
    const fodBolt = cyl(g, 0.035, 0.035, 0.05, -0.7, 0.13, 0.9, 0xb9bec4, { rough: 0.5, metal: 0.8, seg: 10 });
    reg(hits, fodBolt, "fod-bolt");
    const fodStrap = box(g, 0.5, 0.012, 0.06, 0.5, 0.11, -0.3, 0xf2a23b, { rough: 0.9 });
    fodStrap.rotation.y = 0.5;
    reg(hits, fodStrap, "fod-strap");
    const rack = group(g, 2.9, 0.1, 2.0, -0.4);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 });
    box(rack, 0.34, 0.5, 0.1, 0, 1.0, 0, 0xf2c14b, { rough: 0.8 });
    box(rack, 0.18, 0.1, 0.12, 0, 0.7, 0, 0x2b2f34, { rough: 0.7 });
    holoTag(rack, "hi-vis and ear defenders", 0, 1.4, 0, { css: "#63b5f0", w: 0.5 });
    reg(hits, rack, "hi-vis-check");
    const marshaller = standingFigure(g, 0.9, 2.0, { ry: 3.0, cloth: 0xf2a23b });
    const wands = group(marshaller, 0, 1.4, 0);
    for (const sx of [-1, 1]) { const wand = cyl(wands, 0.02, 0.02, 0.36, sx * 0.3, 0.1, 0.1, 0xf2703b, { emissive: 0xf2703b, ei: 1.4, rough: 0.4, cast: false, seg: 8 }); wand.rotation.z = sx * 0.5; }
    holoTag(marshaller, "marshaller — wands", 0, 1.95, 0, { css: "#63b5f0", w: 0.4 });
    reg(hits, marshaller, "marshal-wands");
    const board = group(g, -2.6, 0, 2.6, 0.5);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0a1824"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#63b5f0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d3e9fb"; ctx.fillText("TURN PLAN — STAND 12", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eaf4fd";
      ["Aircraft: narrow-body, 45 min turn", "Stop bar: 320 marking, nosewheel on line", "Chocks before ANY equipment contact", "Cones: both wingtips and No. 1 engine", "GPU then headset; APU off on ground power", "Loader: walking pace, stop short, platform in", "All-clear last, chocks visible to the deck"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: AR2_ACCENT });
    reg(hits, board, "turn-board");
    const jetwash = particles(g, 40, 0xcfd9e2, { size: 0.03, life: 0.7, additive: false, opacity: 0.25 });

    let taxi = 1, bridgeIn = 0, engineRunning = true;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.2),
      onStep() {},
      // The cone that is not where it should be, and the chock a tug kicked
      // clear of the wheel. Both are visible from where the learner stands.
      onInterrupt(it) {
        if (it.id === "vehicle-inbound") { conePick.position.x += 0.8; conePick.position.z -= 0.5; }
        if (it.id === "chock-kicked") for (const c of noseChocks) c.position.z *= 2.2;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vehicle-inbound") { conePick.position.x -= 0.8; conePick.position.z += 0.5; }
        if (it.id === "chock-kicked") for (const c of noseChocks) c.position.z /= 2.2;
      },
      onStepComplete(step) {
        if (step.id === "fod") { fodBolt.visible = false; fodStrap.visible = false; }
        if (step.id === "stop") { taxi = 0; engineRunning = false; arc.visible = false; }
        if (step.id === "chock") { for (const c of noseChocks) c.visible = true; for (const c of mainChocks) c.visible = true; for (const c of cones) c.visible = true; noseChockPick.visible = false; mainChockPick.visible = false; conePick.visible = false; }
        if (step.id === "load") { loader.position.set(-1.4, 0.1, 0.4); loader.rotation.y = 1.4; }
        if (step.id === "close") { for (const c of noseChocks) c.visible = false; for (const c of mainChocks) c.visible = false; for (const c of cones) c.visible = false; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "marshal" && session.holding) taxi = Math.max(0, taxi - dt / 6);
        ac.position.z = -1.4 - taxi * 3.2;
        if (engineRunning) { fan.rotation.z = t * 9; jetwash.visible = true; jetwash.userData.step(dt, new THREE.Vector3(-1.5, 0.85, -2.3), 0.3, 1.4, 0.2); }
        else if (jetwash.visible) jetwash.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "stop") repaint(bridgeCtl.userData.screen, signFace(`${((gg.t - 0.52) * 400).toFixed(0)} cm`, { bg: "#0a1824", accent: gg.t >= 0.46 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#eaf4fd", scale: 0.62 }));
        if (gg && !gg.committed && step?.id === "align") repaint(alignCtl.userData.screen, signFace(`${((gg.t - 0.52) * 60).toFixed(0)} cm`, { bg: "#0a1824", accent: gg.t >= 0.46 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#eaf4fd", scale: 0.62 }));
        if (step?.id === "bridge" && session.holding) bridgeIn = Math.min(1, bridgeIn + dt / 6);
        bridge.position.x = 3.2 - bridgeIn * 1.5;
        bridgeTube.scale.x = 1 + bridgeIn * 0.15;
      },
    };
  },
};
