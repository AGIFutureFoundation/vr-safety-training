import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, hose, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Broadcast Truck VR — Entertainment & Live Events, station five.
// The utility electrician's power tie-in for an outside-broadcast truck at a
// live event: a portable generator feeding a truck that cannot afford to
// blink, over camlok connectors made in the one order that keeps the frame
// bonded before it's hot.
//
// Two things make a generator tie-in a different job from a building tie-in.
// The first is the neutral-ground bond: a generator standing alone as the
// only source has to be bonded right there, at the generator, or a ground
// fault anywhere downstream has no path home to trip anything. The second is
// the truck's own transfer switch — it has to switch the neutral along with
// the phases, so the generator's bond and the shore power's bond are never
// both live to the same ground at once, and it has to make the changeover
// without a gap the truck's UPS can't bridge, because a broadcast that drops
// sync for half a second does not get that half-second back.

const OB_ACCENT = 0x2fd1a0;

export const SIM_BROADCAST_TRUCK = {
  id: "broadcast-truck",
  index: "74",
  domain: "Entertainment",
  trade: "Outside-broadcast / utility electrician",
  category: "Entertainment & Live Events",
  weather: "clear",
  certification: "IATSE broadcast and IBEW utility electricians; NEC Article 525 (carnivals, fairs and similar events) and Article 530 (motion picture and television studios); NFPA 70E qualified for the lockout/verification; OSHA 29 CFR 1910.147 lockout/tagout on the generator breaker; NEC 250.6 and 702 on generator neutral-ground bonding and objectionable current",
  name: "Broadcast Truck",
  title: simTitle("Broadcast Truck"),
  tagline: "Generator power to an outside-broadcast truck: neutral-ground bond checked, camloks landed ground-first, GFCI proven, and the transfer to shore power held clean without dropping the truck's UPS",
  accent: OB_ACCENT,
  accentCss: "#2fd1a0",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "clean-transfer", name: "Clean Transfer", note: "A generator tie-in bonded, cammed ground-first and GFCI-proven, with the transfer to shore power held clean and the UPS never dropped" },

  game: system({
    name: "Tie-In Authority",
    currency: "AMP",
    ranks: ["Deck Electrician", "Distro Tech", "Utility Electrician", "Production Electrician", "Tie-In Certified"],
    badges: [
      { id: "bond-proven", name: "Bond Proven", note: "The generator's neutral-ground bond was checked before the first cam went on", test: AWARD.stepClean("bond-check") },
      { id: "ground-first", name: "Ground First", note: "Camlok connectors landed ground, neutral, then phases, no shortcut", test: AWARD.all(AWARD.stepClean("cams"), AWARD.safe) },
      { id: "clean-changeover", name: "Clean Changeover", note: "Held the transfer inside the make-before-break band the whole way", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-tie-in", name: "Clean Tie-In", note: "No corrections from the power plan to the close-out", test: AWARD.clean },
      { id: "load-held", name: "Load Held", note: "Held the full load test without a break", test: AWARD.unbroken },
      { id: "on-air-on-time", name: "On Air On Time", note: "Power live and proven inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "phase-first": "You reached for a phase camlok before the ground was landed at the generator's own distro panel. Landing ground first is what keeps the frame bonded before any conductor downstream could be hot — skip it, and a fault anywhere on this feeder has no path back to the source until somebody notices the hard way.",
    "wet-camlok": "The generator's distro is standing in the runoff pooling by the ice truck. A metal frame carrying three phases on wet ground is a shock path to whoever touches it next, and it gets moved to dry, level ground before it carries any load at all.",
    "double-bond": "You landed a second bonding jumper between neutral and ground at the truck, on top of the one already at the generator. With the transfer switch already switching the neutral, that second bond opens a parallel path for return current over the safety-ground conductor and the truck's own chassis — the exact 'objectionable current' NEC 250.6 exists to keep off equipment enclosures, and it turns every metal case on this truck into part of the path.",
    "gfci-bypass": "You ran the camera position's power off a plain stinger cable instead of the GFCI-protected field run. That cable is going out across ground the audience walks on, in whatever weather the show gets, and the GFCI on the proper run is the only thing standing between a nicked jacket out there and somebody getting the fault current instead of a tripped breaker.",
  },

  lateNotes: {
    "cam-ground": "Not yet — the generator breaker is locked out and the bond is proven before any camlok goes on.",
    "genset-breaker": "The breaker stays locked until the cams are landed in order, strain-relieved and covered.",
    "gfci-test-button": "Nothing goes out on the field run until the GFCI has been tested and confirmed to trip.",
  },

  // Interruptions: see shared/game.js. Both happen on the generator side of
  // the tie-in, behind an electrician whose eyes are on the truck.
  interrupts: [
    {
      id: "freq-sag",
      kind: "Generator",
      after: "transfer", delay: 4, seconds: 13,
      alert: "The generator's frequency has sagged and the truck's video sync is chasing it.",
      cue: "Something else just came onto this generator that the load plan didn't account for.",
      target: "governor-panel",
      why: "Broadcast gear locks its timing to the power feeding it, and a generator carrying an unplanned load droops in frequency before anything trips a breaker. The governor panel is where that gets trimmed back, and it has to happen before the drift is large enough to actually drop a video wall or a router out of sync on air.",
      missNote: "The sag ran through most of the load test with nobody at the governor. Every downstream device chasing that frequency drifted right along with it.",
      wrongNote: "Not that. The governor panel is what corrects a frequency sag, and it corrects it now.",
    },
    {
      id: "gfci-trip",
      kind: "Field cabling",
      after: "load-test", delay: 4, seconds: 12,
      alert: "The field GFCI has tripped and the stage boxes just went dark.",
      cue: "Something on that run just found a ground fault the hard way.",
      target: "gfci-reset",
      why: "A GFCI trips because current found a path it was never supposed to take, most often water at a connector out on the field run. The reset panel on the GFCI enclosure is where that gets dealt with — not a blind re-energise somewhere else on the truck, because the fault is still sitting out there on the cable until somebody actually looks at what tripped it.",
      missNote: "The stage boxes stayed dark while the show clock kept running. Nobody at the reset panel meant nobody knew why it tripped either.",
      wrongNote: "That's not the reset. It's on the GFCI enclosure itself, and that's where this gets answered.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "power-plan",
      title: "Read the event power plan",
      cue: "Check the generator's rated output, the service size, and the load list the truck brings.",
      why: "The plan says whether one generator or two carries this show, and which NEC article governs the tie-in — a fairground stage under Article 525 is landed differently than a permanent studio under Article 530, and that distinction is settled here, before any cable is uncoiled.",
    },
    {
      id: "lockout", kind: "turn", target: "genset-breaker",
      title: "Open and lock the generator's output breaker",
      cue: "Throw the breaker off and hang your lock and tag before anything is landed on the panel.",
      why: "The breaker is opened and locked before a single camlok touches it. Your lock is the only thing that stops somebody else closing it while your hands are on the lugs — the same rule that governs every panel on this circuit, generator or building.",
      turn: { turns: 0.5, axis: "z", label: "GENSET BREAKER" },
    },
    {
      id: "bond-check", kind: "gauge", target: "bond-tester",
      title: "Check the generator's neutral-ground bond",
      cue: "Read the bond tester across the generator's neutral and ground bus and commit on what it shows.",
      why: "A portable generator standing as the only source on site has to have its neutral bonded to ground right there, at the generator — that bond is what makes a ground fault downstream trip a breaker instead of just sitting there energised. An open reading here means nothing downstream will ever trip on a fault until somebody finds that out the hard way.",
      gauge: {
        label: "BOND", speed: 0.7, green: [0.0, 0.16],
        readout: (t) => `${(t * 8).toFixed(1)} Ω`,
        missNote: "That is not a bonded neutral. Land the bonding jumper at the generator before anything downstream is trusted to trip on a fault.",
      },
    },
    {
      id: "tie-in", kind: "drag", target: "feeder-whip",
      title: "Carry the feeder whip to the truck",
      cue: "Carry the camlok feeder whip from the generator's distro to the truck's shore-power inlet and seat it in the socket.",
      why: "This whip is the only conductor between a generator somebody else sized and a truck full of gear that cannot brown out mid-broadcast. It is carried and seated before anything on either end is energised, the same as any other feeder run on this job.",
      drag: { to: "truck-inlet", radius: 0.45, missNote: "Not seated in the truck's inlet — a whip that isn't locked home is a connector waiting to arc under the first real load." },
    },
    {
      id: "cams", kind: "sequence",
      targets: ["cam-ground", "cam-neutral", "cam-l1", "cam-l2", "cam-l3"],
      itemNames: { "cam-ground": "ground (green)", "cam-neutral": "neutral (white)", "cam-l1": "phase A", "cam-l2": "phase B", "cam-l3": "phase C" },
      title: "Land the camlok connectors ground-first",
      cue: "Ground, then neutral, then the three phases — in that order, latched at the generator's distro.",
      why: "Ground first so the frame and the whole feeder are bonded before any conductor could be hot; neutral before phases so nothing downstream ever sees a floating neutral, even for a second. Breaking the tie-in reverses the order — phases off first, ground last — for exactly the same reason.",
      outOfOrderNote: "Ground, neutral, then phases. A phase landed first is the one order this connector exists to prevent.",
    },
    {
      id: "strain", kind: "select", target: "strain-relief",
      title: "Strain-relieve and cover the taps",
      cue: "Secure the feeder to the distro frame and close the tap cover so no lug is exposed.",
      why: "The feeder gets walked on and rolled over all day at a load-in like this one. The strain relief takes that pull instead of the camlok collars, and the cover means nobody finds a live lug with a boot or a hand.",
    },
    {
      id: "energize", kind: "turn", target: "genset-breaker",
      title: "Remove the lock and energise",
      cue: "Take your lock off, clear the area, and close the generator's output breaker.",
      why: "Your lock, your key, your call to re-energise. The area is clear because the first breaker close is the moment a fault in the feeder or the panel shows itself.",
      turn: { turns: 0.5, axis: "z", label: "GENSET BREAKER" },
    },
    {
      id: "phase-check", kind: "gauge", target: "distro-meter",
      title: "Read the phases at the truck's distro",
      cue: "Read phase-to-neutral on each phase at the truck and commit inside the nominal band.",
      why: "Three phases reading right at the truck's own distro is the proof the tie-in and the cam order both came out correct. A lost neutral shows here first — one leg high, one low — long before it shows as a rack of gear browning out on air.",
      gauge: { label: "VOLTS", speed: 0.75, green: [0.46, 0.6], readout: (t) => `${Math.round(100 + t * 40)} V`, missNote: "Off nominal — do not load it. Recheck the neutral and the cam order before anything downstream is trusted." },
    },
    {
      id: "gfci-test", kind: "hold", target: "gfci-test-button", seconds: 3,
      title: "Test the field cable's GFCI",
      cue: "Press and hold the test button on the field cable's in-line GFCI until the trip indicator confirms it opened.",
      why: "A GFCI that has never been tested is a GFCI nobody has actually proven will open on a ground fault. It gets pressed and confirmed before the cable run goes out across the field, where an audience is standing on the other end of it.",
      holdBreakNote: "Released before the trip confirmed. An untested GFCI is a guess about what happens the first time somebody's cable gets wet.",
    },
    {
      id: "transfer", kind: "track", target: "transfer-switch", seconds: 6,
      title: "Ease the transfer to shore power",
      cue: "Hold the transfer switch handle through the changeover, inside the band — too fast breaks before it makes, too slow overlaps the two sources.",
      why: "The truck's UPS only bridges a gap it doesn't have to fill — dropped for even a moment, everything downstream that isn't already on battery blinks, and a video wall or router that blinks mid-broadcast doesn't just flicker, it drops sync and takes minutes to recover. Held too long the other way, generator and shore power are briefly paralleled on the same bus, which neither source's protection is built to survive.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.1, label: "TRANSFER",
        readout: (v) => (v < 0.4 ? "breaking before it makes" : v > 0.62 ? "overlapping the sources" : "clean make-before-break"),
      },
      holdBreakNote: "Transfer out of band — too fast drops the UPS's load, too slow parallels two sources neither one is built to share the bus with.",
    },
    {
      id: "switched-neutral", kind: "select", target: "switch-plate",
      title: "Confirm the transfer switch is switched-neutral",
      cue: "Check the transfer switch's data plate confirms it switches the neutral, not just the phases.",
      why: "With the neutral switched, only one source is ever bonded to ground at a time. A switch that leaves the neutral solid ties the generator's bond and the shore power's bond together every moment both sources are connected — exactly the parallel path NEC 250.6 exists to prevent.",
    },
    {
      id: "walk-cable", kind: "find", noHint: true,
      targets: ["damaged-jacket", "ground-pin-missing", "no-ramp"],
      itemNames: { "damaged-jacket": "damaged cable jacket", "ground-pin-missing": "missing ground pin", "no-ramp": "cable across the walkway with no ramp" },
      itemNotes: {
        "damaged-jacket": "The jacket is cut through to the conductors where a road case rolled over it. That run gets replaced before the show, not taped and left for the GFCI to catch.",
        "ground-pin-missing": "The equipment-ground pin has been bent back and removed on this connector. A GFCI trips on some faults with no ground path at all, but the chassis it's supposed to protect has nowhere for a fault current to go until that pin is back.",
        "no-ramp": "This cable crosses a walkway with nothing over it. It is a trip hazard for the crew and a crush hazard for the cable the moment a loaded cart or a wheelchair rolls over the bare jacket.",
      },
      title: "Walk the field cable run",
      cue: "Walk the cable from the truck to the stage box and click the three things that fail this run.",
      why: "The tie-in is the interesting part and the field run is where it actually gets tested — foot traffic, weather and the show's own gear all live on this cable, and none of these three faults show up until somebody is standing on one.",
    },
    {
      id: "load-test", kind: "hold", target: "load-test", seconds: 4,
      title: "Load test on generator power",
      cue: "Bring the truck's full rig up and hold it steady on generator power before calling the tie-in good.",
      why: "A tie-in that reads right unloaded and sags the moment the truck's full load comes up was never actually proven. The load test is what separates a connection that looks correct from one that holds through an actual broadcast.",
      holdBreakNote: "Load dropped early — the tie-in was never proven under the load it actually has to carry.",
    },
    {
      id: "close-out", kind: "find",
      targets: ["chassis-ground-rod", "gfci-tag", "spill-kit"],
      itemNames: { "chassis-ground-rod": "ground rod bonded to the chassis", "gfci-tag": "GFCI test tag", "spill-kit": "spill containment under the generator" },
      itemNotes: {
        "chassis-ground-rod": "The ground rod is driven and bonded to the truck's chassis. It's the local path to earth this whole tie-in depends on being there, not assumed.",
        "gfci-tag": "The GFCI is tagged with today's date and a pass. It's the only record that the test in this shift actually happened, for whoever's on this generator next.",
        "spill-kit": "There's absorbent containment under the generator's fuel and oil connections. A generator run unattended for a whole show is a leak waiting for somewhere to go, and this is where it goes instead of the ground.",
      },
      title: "Close out before the show goes live",
      cue: "Click the three things that have to be right before this generator is left running unattended.",
      why: "None of these are the interesting part of the job, and all three are what an incident report looks for first: the ground rod that's actually bonded, the tag that proves the GFCI was tested today, and the containment that keeps a leak off the ground instead of in it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, OB_ACCENT);
    box(g, 5.4, 0.08, 4.6, 0, 0.04, 0, 0x2a2f34, { rough: 0.95, finish: "asphalt", tile: [5, 4] });

    // ------------------------------------------------------------ the OB truck
    const truck = group(g, 1.55, 0, -1.5, -0.35);
    box(truck, 2.4, 1.5, 1.6, 0, 0.95, 0, 0xe8eef2, { rough: 0.5, metal: 0.3, finish: "painted", tile: [2, 1] });
    box(truck, 2.4, 0.5, 1.7, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.4 }); // chassis skirt
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(truck, 0.24, 0.24, 0.24, sx * 0.95, 0.12, sz * 0.65, 0x1b1e22, { rough: 0.8, seg: 16 });
    }
    decal(truck, 1.3, 0.3, 0, 1.1, 0.81, signFace("OUTSIDE BROADCAST 4", { bg: "#0b2018", accent: "#2fd1a0", scale: 0.44 }));
    // Roof gear: satellite uplink dish, microwave dish and an HVAC unit —
    // dressing that says "broadcast truck" from across the pad.
    const roof = group(truck, 0.5, 1.72, -0.2);
    cyl(roof, 0.03, 0.03, 0.3, 0, 0.15, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    torus(roof, 0.34, 0.03, 0, 0.32, 0.1, 0xd7dce1, { rough: 0.45, seg: 10, seg2: 22 }).rotation.x = -0.5;
    ball(roof, 0.05, 0, 0.5, -0.15, 0x2b3138, { rough: 0.5, seg: 10 });
    const dish2 = group(truck, -0.3, 1.68, 0.1, 0.6);
    cyl(dish2, 0.02, 0.02, 0.18, 0, 0.09, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    torus(dish2, 0.16, 0.018, 0, 0.2, 0, 0xd7dce1, { rough: 0.45, seg: 8, seg2: 16 }).rotation.x = -0.4;
    const hvac = group(truck, 0.1, 1.68, 0.55);
    box(hvac, 0.5, 0.14, 0.34, 0, 0.07, 0, 0xc7ccd1, { rough: 0.55, metal: 0.35 });
    for (let i = 0; i < 4; i++) box(hvac, 0.4, 0.012, 0.02, 0, 0.14, -0.12 + i * 0.08, 0x8d9aa4, { rough: 0.5 });
    for (let i = 0; i < 3; i++) cyl(truck, 0.012, 0.012, 0.6, 0.2 - i * 0.02, 1.6, -0.5, 0x2b2f34, { rough: 0.7, seg: 6 });
    // Cutaway equipment bay: UPS rack, the transfer switch and a small rack
    // of production gear, visible from the open side facing the spawn point.
    const bay = group(truck, 0, 0.5, 0.81);
    box(bay, 1.0, 0.9, 0.02, -0.6, 0.45, 0, 0x1b1e22, { rough: 0.7, cast: false });
    const ups = group(bay, -0.85, 0.05, 0.05);
    box(ups, 0.5, 0.7, 0.4, 0, 0.35, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 3; i++) ball(ups, 0.02, -0.16 + i * 0.16, 0.62, 0.21, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(ups, "Truck UPS", 0, 0.78, 0, { css: "#59c97b", w: 0.28 });
    const rackCol = group(bay, 0.15, 0.05, 0.05);
    box(rackCol, 0.4, 0.72, 0.36, 0, 0.36, 0, 0x22282e, { rough: 0.55, metal: 0.35 });
    for (let i = 0; i < 4; i++) {
      box(rackCol, 0.36, 0.1, 0.02, 0, 0.1 + i * 0.15, 0.19, [0x2fd1a0, 0x59c97b, 0x2fd1a0, 0xf2c14b][i], { rough: 0.5, metal: 0.3 });
      ball(rackCol, 0.008, -0.15, 0.14 + i * 0.15, 0.2, 0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
      ball(rackCol, 0.008, 0.15, 0.14 + i * 0.15, 0.2, 0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
    }
    holoTag(rackCol, "Production rack", 0, 0.78, 0.05, { css: "#2fd1a0", w: 0.36 });
    const xferBox = group(bay, -0.25, 0.05, 0.05);
    box(xferBox, 0.42, 0.6, 0.35, 0, 0.3, 0, 0x3c454e, { rough: 0.55, metal: 0.45 });
    const xferHandle = group(xferBox, 0, 0.5, 0.19);
    box(xferHandle, 0.05, 0.22, 0.05, 0, 0, 0, CITY.hiVis, { rough: 0.5 });
    reg(hits, xferHandle, "transfer-switch");
    holoTag(xferBox, "Transfer switch", 0, 0.66, 0, { css: "#2fd1a0", w: 0.36 });
    const xferPlate = box(xferBox, 0.3, 0.1, 0.02, 0, 0.14, 0.19, 0x1b1e22, { rough: 0.5 });
    reg(hits, xferPlate, "switch-plate");
    const inlet = group(truck, -0.95, 0.55, 0.55, 0.4);
    box(inlet, 0.16, 0.16, 0.1, 0, 0, 0, 0x8d9aa4, { rough: 0.4, metal: 0.7 });
    holoTag(inlet, "Shore inlet", 0, 0.18, 0, { css: "#2fd1a0", w: 0.3 });
    hits["truck-inlet"] = inlet;
    const distro = group(truck, 0.85, 0.55, 0.6, 0.3);
    box(distro, 0.4, 0.5, 0.24, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    for (let i = 0; i < 6; i++) cyl(distro, 0.02, 0.02, 0.04, -0.13 + (i % 3) * 0.13, 0.14 - Math.floor(i / 3) * 0.15, 0.13, [0x2f7d4a, 0xffffff, 0x1b1e22, 0xd2312b, 0x1f4ea8, 0x1b1e22][i], { rough: 0.4, metal: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    const distroMeter = instrument(distro, 0, 0.32, 0, { idle: "-- V", color: 0x2fd1a0, w: 0.15, d: 0.18 });
    reg(hits, distroMeter, "distro-meter");

    // ---------------------------------------------------------- the generator
    const genset = group(g, -1.5, 0, -1.4, 0.5);
    box(genset, 1.3, 0.85, 0.7, 0, 0.55, 0, 0xe4622a, { rough: 0.65, metal: 0.35 });
    box(genset, 1.32, 0.06, 0.72, 0, 1.0, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    decal(genset, 0.6, 0.12, 0, 1.03, 0.37, signFace("GENSET — 200 kW", { bg: "#241608", accent: "#f2c14b", scale: 0.44 }));
    const govPanel = group(genset, -0.45, 0.85, 0.36);
    box(govPanel, 0.2, 0.16, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.55, metal: 0.45 });
    const govKnob = cyl(govPanel, 0.03, 0.03, 0.03, 0, 0, 0.04, CITY.hiVis, { rough: 0.5, seg: 12 });
    holoTag(govPanel, "Governor panel", 0, 0.16, 0.05, { css: "#f2c14b", w: 0.36 });
    reg(hits, govKnob, "governor-panel");

    const bondPost = group(genset, 0.45, 0.85, 0.36);
    box(bondPost, 0.06, 0.1, 0.03, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.75 });
    const bondTester = instrument(bondPost, 0, 0.16, 0.03, { idle: "-- Ω", color: 0x2b3138, w: 0.13, d: 0.12 });
    holoTag(bondPost, "Bond tester", 0, 0.34, 0.03, { css: "#2fd1a0", w: 0.32 });
    reg(hits, bondTester, "bond-tester");

    // The generator's own distro panel, breaker, cam lugs and lockout.
    const genDistro = group(g, -0.75, 0, -1.75, 0.3);
    box(genDistro, 0.7, 1.1, 0.24, 0, 0.55, 0, 0x3c454e, { rough: 0.55, metal: 0.45 });
    decal(genDistro, 0.5, 0.1, 0, 1.02, 0.13, signFace("GENSET DISTRO 200 A 3Ø", { bg: "#1b1e22", accent: "#2fd1a0", scale: 0.44 }));
    const breaker = group(genDistro, 0.24, 0.7, 0.13);
    box(breaker, 0.05, 0.24, 0.05, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, breaker, "genset-breaker");
    const lock = lockTag(breaker, 0.05, 0.05, 0.03, { color: 0x2fd1a0 });
    lock.visible = false;
    const lugFaces = {};
    const camSpecs = [["cam-ground", -0.24, 0x2f7d4a, "G"], ["cam-neutral", -0.12, 0xffffff, "N"], ["cam-l1", 0, 0x1b1e22, "A"], ["cam-l2", 0.12, 0xd2312b, "B"], ["cam-l3", 0.24, 0x1f4ea8, "C"]];
    for (const [id, dx, color, label] of camSpecs) {
      const lug = group(genDistro, dx, 0.4, 0.14);
      cyl(lug, 0.03, 0.03, 0.06, 0, 0, 0, color, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
      lugFaces[id] = decal(lug, 0.05, 0.03, 0, 0.05, 0.03, signFace(label, { bg: "#1b1e22", accent: "#2fd1a0", scale: 0.6 }));
      reg(hits, lug, id);
    }
    const phaseFirst = box(genDistro, 0.18, 0.08, 0.1, 0.12, 0.52, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(genDistro, "phase cam first?", 0.18, 0.64, 0.24, { css: "#d2312b", w: 0.3 });
    reg(hits, phaseFirst, "phase-first");
    const strain = group(genDistro, -0.3, 0.2, 0.15);
    box(strain, 0.1, 0.06, 0.06, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    holoTag(strain, "strain relief", 0, 0.1, 0, { css: "#2fd1a0", w: 0.24 });
    reg(hits, strain, "strain-relief");

    // The extra bonding jumper decoy, coiled by the transfer switch.
    const extraBond = group(truck, -0.55, 0.15, 0.62, 0.6);
    torus(extraBond, 0.08, 0.012, 0, 0, 0, 0x59c97b, { rough: 0.5, metal: 0.6, seg: 8, seg2: 16 });
    holoTag(extraBond, "bond it here too?", 0, 0.16, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, extraBond, "double-bond");

    // Feeder whip, staged on the verge between generator and truck.
    const whip = group(g, -0.3, 0, -0.6, -0.3);
    cyl(whip, 0.05, 0.05, 0.9, 0, 0.25, 0, 0x1b1e22, { rough: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(whip, "Feeder whip", 0, 0.42, 0, { css: "#2fd1a0", w: 0.3 });
    reg(hits, whip, "feeder-whip");

    const damage = box(g, 0.14, 0.05, 0.1, -0.3, 0.075, 0.6, 0xb8b0a0, { rough: 0.7 });
    reg(hits, damage, "damaged-jacket");
    const feederRun = hose(g, [[-0.75, 0.06, -1.7], [-0.5, 0.05, -0.6], [0.4, 0.05, 0.3], [1.3, 0.05, 0.6], [1.55, 0.5, 0.4]], 0.028, 0x1b1e22, { steps: 28 });
    void feederRun;

    // -------------------------------------------------------------- field run
    // Kept inside the station's own footprint (spawn stands well back of
    // z ~ footprint + 1.4) so nothing here crowds the camera at the door.
    const fieldRun = hose(g, [[1.55, 0.5, 0.4], [1.0, 0.03, 0.9], [0.1, 0.03, 1.3], [-0.9, 0.03, 1.5], [-1.6, 0.03, 1.3]], 0.02, 0x1b1e22, { steps: 24 });
    void fieldRun;
    const walkway = box(g, 1.1, 0.02, 0.7, -0.6, 0.011, 1.5, 0x3a4048, { rough: 0.85, cast: false });
    void walkway;
    const noRamp = box(g, 0.3, 0.15, 0.3, -0.6, 0.08, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "bare cable, no ramp?", -0.6, 0.4, 1.5, { css: "#d2312b", w: 0.44 });
    reg(hits, noRamp, "no-ramp");
    const noGround = group(g, 0.35, 0, 1.4, 0.4);
    cyl(noGround, 0.022, 0.026, 0.1, 0, 0.05, 0, 0x8d9aa4, { rough: 0.5, metal: 0.6, seg: 12 });
    holoTag(noGround, "ground pin, bent back?", 0, 0.22, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, noGround, "ground-pin-missing");

    // GFCI enclosure and stage box at the field run's far end.
    const gfciBox = group(g, -1.6, 0, 1.3, 0.5);
    box(gfciBox, 0.34, 0.28, 0.16, 0, 0.5, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    const gfciBtn = box(gfciBox, 0.06, 0.06, 0.04, -0.08, 0.5, 0.09, 0xf2c14b, { rough: 0.5 });
    reg(hits, gfciBtn, "gfci-test-button");
    const gfciLamp = ball(gfciBox, 0.02, 0.09, 0.5, 0.1, 0x59c97b, { emissive: 0x59c97b, ei: 2.0 });
    const gfciReset = box(gfciBox, 0.06, 0.06, 0.04, 0.09, 0.4, 0.09, 0xd2312b, { rough: 0.5 });
    reg(hits, gfciReset, "gfci-reset");
    holoTag(gfciBox, "Field GFCI", 0, 0.72, 0, { css: "#2fd1a0", w: 0.3 });

    const stinger = group(g, -1.85, 0, 0.85, 0.7);
    cyl(stinger, 0.02, 0.02, 0.5, 0, 0.06, 0, 0xd2312b, { rough: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    holoTag(stinger, "spare, skip the GFCI?", 0, 0.3, 0, { css: "#d2312b", w: 0.52 });
    reg(hits, stinger, "gfci-bypass");

    const cameraPos = group(g, -1.3, 0, 1.85, 0.3);
    box(cameraPos, 0.3, 0.9, 0.3, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const camLamp = ball(cameraPos, 0.03, 0, 0.94, 0.12, 0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
    holoTag(cameraPos, "Camera position", 0, 1.1, 0, { css: "#2fd1a0", w: 0.4 });
    const loadTest = group(cameraPos, 0, 0.2, 0.2);
    box(loadTest, 0.1, 0.1, 0.1, 0, 0, 0, CITY.hiVis, { rough: 0.5 });
    reg(hits, loadTest, "load-test");

    // A small LED video wall on truss beside the camera position — the load
    // this whole tie-in is actually feeding.
    const wall = group(g, -0.35, 0, 1.95, 0.15);
    for (const sx of [-1, 1]) cyl(wall, 0.03, 0.03, 1.8, sx * 0.7, 0.9, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    box(wall, 1.4, 0.06, 0.06, 0, 1.75, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    for (let cx = 0; cx < 3; cx++) for (let cy = 0; cy < 3; cy++) {
      const panel = box(wall, 0.42, 0.42, 0.04, -0.56 + cx * 0.56, 0.5 + cy * 0.44, 0.05, 0x0d1c24, { rough: 0.3, emissive: 0x2fd1a0, ei: 0.5 });
      void panel;
    }
    holoTag(wall, "LED wall", 0, 1.95, 0, { css: "#2fd1a0", w: 0.3 });

    // Cable ties along the feeder and field runs — small dressing that also
    // reads as "somebody actually managed this cable".
    for (let i = 0; i < 5; i++) box(g, 0.05, 0.02, 0.05, -0.5 + i * 0.4, 0.05, 0.3 + i * 0.1, 0x1b1e22, { rough: 0.7, cast: false });
    for (let i = 0; i < 4; i++) box(g, 0.05, 0.02, 0.05, 0.9 - i * 0.35, 0.05, 0.9 + i * 0.15, 0x1b1e22, { rough: 0.7, cast: false });

    // A vendor cart parked near the ice/beverage tap that feeds the puddle
    // decoy — set dressing that explains where the water came from.
    const cart = group(g, -0.3, 0, -2.35, 0.4);
    box(cart, 0.5, 0.5, 0.4, 0, 0.4, 0, 0xe8eef2, { rough: 0.5, finish: "painted" });
    box(cart, 0.5, 0.06, 0.4, 0, 0.66, 0, 0x2fd1a0, { rough: 0.5 });
    for (const sx of [-1, 1]) cyl(cart, 0.06, 0.06, 0.04, sx * 0.2, 0.06, 0.15, 0x1b1e22, { rough: 0.8, seg: 12 });
    holoTag(cart, "Ice cart", 0, 0.82, 0, { css: "#8fa9c4", w: 0.24 });

    // Puddle from the ice truck, under the generator distro.
    const puddle = slab(g, 1.0, 0.006, 0.8, -0.75, 0.104, -1.75, 0x6fb4d8, { rough: 0.15, opacity: 0.45, transparent: true, cast: false });
    reg(hits, puddle, "wet-camlok");
    holoTag(g, "runoff from the ice truck", -0.75, 0.4, -1.95, { css: "#d2312b", w: 0.5 });

    // Close-out items.
    const groundRod = cyl(g, 0.014, 0.014, 0.5, 1.85, -0.1, -1.1, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    groundRod.position.y = 0.1;
    holoTag(g, "Ground rod", 1.85, 0.4, -1.1, { css: "#8fa9c4", w: 0.3 });
    reg(hits, groundRod, "chassis-ground-rod");
    const gfciTag = box(g, 0.06, 0.09, 0.01, -1.62, 0.5, 1.94, 0xf4e9d8, { rough: 0.7 });
    holoTag(g, "GFCI tag", -1.62, 0.64, 1.94, { css: "#8fa9c4", w: 0.28 });
    reg(hits, gfciTag, "gfci-tag");
    const spillKit = slab(g, 0.5, 0.03, 0.4, -1.5, 0.02, -1.05, 0xf2c14b, { radius: 0.01, rough: 0.7 });
    holoTag(g, "Spill containment", -1.5, 0.24, -1.05, { css: "#8fa9c4", w: 0.36 });
    reg(hits, spillKit, "spill-kit");

    const board = group(g, 2.1, 0, -0.4, -1.2);
    const planPanel = holoPanel(board, 0.9, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#0a1f18"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2fd1a0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dff7ee"; ctx.fillText("EVENT POWER PLAN — OB TRUCK 4", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#e6f7ef";
      ["Genset: 200 kW, 120/208 V 3Ø", "Truck load: 140 A max per phase", "Cams: G → N → A → B → C (on)", "Off: C → B → A → N → G",
        "Transfer switch: 4-pole, switched N", "Field run: GFCI protected throughout"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: OB_ACCENT });
    reg(hits, planPanel, "power-plan");

    barrierPanel(g, -0.2, -2.3, { color: 0x2fd1a0 });
    cone(g, 1.0, -2.4, { color: 0x2fd1a0 });
    cone(g, -1.9, 0.6, { color: 0x2fd1a0 });
    toolChest(g, 2.4, 1.4);
    const crew = standingFigure(g, 0.4, -0.05, { ry: -0.6, cloth: 0x2b6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    void crew;
    holoTag(g, "Utility electrician", 0.4, 2.0, -0.05, { css: "#2fd1a0", w: 0.42 });

    // -------------------------------------------------------------- live state
    let energised = false, transferring = false, gfciTripped = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout") { breaker.rotation.z = -1.2; lock.visible = true; }
        if (step.id === "tie-in") { whip.position.set(0.3, 0, 0.4); whip.rotation.z = Math.PI / 2; }
        if (step.id === "cams") for (const [id] of camSpecs) repaint(lugFaces[id], signFace("✓", { bg: "#0d2b22", accent: "#59c97b", scale: 0.6 }));
        if (step.id === "energize") { breaker.rotation.z = 0; lock.visible = false; energised = true; }
        if (step.id === "gfci-test") { gfciLamp.material = mat(0x2fd1a0, { emissive: 0x2fd1a0, ei: 2.2 }); }
        if (step.id === "walk-cable") damage.visible = false;
      },
      onInterrupt(it) {
        if (it.id === "freq-sag") { govKnob.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.0, rough: 0.4 }); }
        if (it.id === "gfci-trip") { gfciTripped = true; gfciLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 }); camLamp.material = mat(0x2b3138, { rough: 0.7 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "freq-sag") { govKnob.material = mat(CITY.hiVis, { rough: 0.5 }); }
        if (it.id === "gfci-trip") { gfciTripped = false; gfciLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0 }); camLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6 }); }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && (step?.id === "lockout" || step?.id === "energize")) {
          breaker.rotation.z = step.id === "lockout" ? -session.turn.amount / session.turn.required * 1.2 : -1.2 + session.turn.amount / session.turn.required * 1.2;
        }
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "bond-check") {
            repaint(bondTester.userData.screen, signFace(`${(gg.t * 8).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t < 0.2 ? "#59c97b" : "#f0645b", fg: "#dff7ee", scale: 0.55 }));
          }
          if (step?.id === "phase-check") {
            repaint(distroMeter.userData.screen, signFace(`${Math.round(100 + gg.t * 40)}`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff7ee", scale: 0.55 }));
          }
        }
        transferring = step?.id === "transfer" && session.holding;
        xferHandle.position.x = transferring ? Math.min(1, (session.track?.v ?? 0)) * 0.1 - 0.05 : 0;
        const loading = step?.id === "load-test" && session.holding;
        camLamp.material.emissiveIntensity = !gfciTripped && energised && loading ? 0.4 + Math.min(1, session.holdFor / 4) * 2.0 : gfciTripped ? 0 : 1.6;
      },
    };
  },
};
