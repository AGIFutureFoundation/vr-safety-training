import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, signFace, mat, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Chassis & Genset Yard VR — Maritime & Ports, the port
// maintenance pack.
//
// The chassis yard: a container chassis in the repair bay with a clip-on
// generator set on its front for the reefer it carries, a hustler waiting to
// hook the next one, and a reefer on the neighbouring chassis running on its
// own genset. The learner is the ILWU maintenance and repair mechanic; the
// IUOE stationary engineers own the gensets' engine side. A chassis is worked
// on chocked or not at all, and a genset's output is live electrical
// equipment however small the engine that makes it.

const PTC_ACCENT = 0xc86a3c;

export const SIM_PT_CHASSIS_AND_GENSET_YARD = {
  id: "pt-chassis-and-genset-yard",
  index: "224",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair mechanic — chassis and genset yard, PMA training programme, with IUOE stationary engineers on the gensets",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE stationary engineers for the generator sets; OSHA 29 CFR 1917 marine terminals, including the chassis and intermodal equipment provisions; 29 CFR 1910.147 control of hazardous energy for the genset; NFPA 70E for the genset's output and the reefer pigtail; 29 CFR 1910.132 for the eye protection at the grinder",
  name: "Chassis & Genset Yard",
  title: simTitle("Chassis & Genset Yard"),
  tagline: "A chassis in the repair bay with its genset: chocked, landing gear down and the air bled before anything else, the frame walked for a crack, tyres gauged, the slack adjuster set, the brakes held and listened to while a hustler turns in, the genset checked, its battery isolated and locked, a new fuel filter fitted, the run test held in band while the reefer next door throws a code, the damaged pigtail found, and the chassis logged roadable",
  accent: PTC_ACCENT,
  accentCss: "#c86a3c",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "roadable-clean", name: "Roadable Clean", note: "Chocked before a hand went under, the genset isolated before a wrench went on, the lane and the reefer both answered, and the chassis signed roadable" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Chassis Yard",
    currency: "AXLE",
    ranks: ["Yard Hand", "Chassis Mechanic", "Genset Tech", "Lead Mechanic", "Chassis Yard Certified"],
    badges: [
      { id: "chocked-first", name: "Chocked First", note: "Chocks, landing gear and air bled in that order before a hand went near the frame", test: AWARD.stepClean("secure-chassis") },
      { id: "isolated-genset", name: "Isolated Genset", note: "The genset's battery disconnected and locked before the filter came off", test: AWARD.stepClean("genset-isolate") },
      { id: "yard-discipline", name: "Yard Discipline", note: "Never under an unchocked chassis, never between the hustler and the kingpin, never a live pigtail pulled, never a grinder by the tank", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections anywhere in the inspection", test: AWARD.clean },
      { id: "steady-run", name: "Steady Run", note: "Held the genset's output in band for the whole run test", test: AWARD.unbroken },
      { id: "back-on-the-road", name: "Back On The Road", note: "Chassis signed roadable inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "creep-under-unchocked": "You went under the chassis with no wheel chocks set. A chassis on a yard with a slope you cannot see rolls on its own brakes' leak-down, and a chassis that rolls with somebody under its crossmembers does not stop for them — the chocks go in before anything else because 29 CFR 1917's rule on securing intermodal equipment before work is written for exactly this piece of the yard.",
    "pull-pigtail-live": "You pulled the genset's pigtail out of the reefer with the genset running under load. The pigtail carries the reefer's compressor current, and a plug drawn under that load draws an arc across its contacts into the hand holding it — NFPA 70E treats the plug as a disconnecting means only with the load off, and the reefer goes down at its controller before the plug moves.",
    "between-hustler-chassis": "You stepped between the hustler's fifth wheel and the chassis kingpin while the hustler was backing to hook. The gap closes at the hustler's speed and the driver cannot see it from the cab — anyone in it is the coupling. Nobody stands between a hooking hustler and a chassis for any reason; the hand signal comes from the side.",
    "grind-near-fuel-tank": "You started the grinder on the crossmember a metre from the genset's fuel tank with its filler open. A grinder throws sparks further than the eye follows them, and diesel vapour at an open filler on a warm day is what those sparks are looking for — the tank is closed and the hot work moved or shielded before a disc turns, and 29 CFR 1917 has the hot-work rule on the terminal for that reason.",
  },

  lateNotes: {
    "new-fuel-filter": "The fuel filter comes off once the genset's battery is disconnected and locked — not before.",
    "genset-controller": "The genset is run for its test once the new filter is fitted and primed — not before.",
    "yard-log": "The chassis is signed roadable once the pigtail has been inspected and the run test is complete — the log is the last thing.",
  },

  steps: [
    {
      id: "roadability-sheet", kind: "select", target: "roadability-board",
      title: "Read the chassis inspection sheet and the driver's defect",
      cue: "Check the roadability inspection sheet for this chassis: the driver's defect, the last inspection, and what the genset's hour meter says.",
      why: "A chassis moves on public roads between the terminal and the customer, and the intermodal equipment provider owes it a roadability inspection on a schedule and after every defect a driver reports; the sheet is what says which of those this visit is, and what the last mechanic found. The driver wrote up a brake pull and a genset that stalled under load — two systems, two procedures, and the sheet is what keeps them from being handled as one job.",
    },
    {
      id: "secure-chassis", kind: "sequence",
      targets: ["wheel-chocks", "landing-gear", "air-bleed"],
      itemNames: { "wheel-chocks": "wheel chocks set both sides", "landing-gear": "landing gear cranked down to the pads", "air-bleed": "air system bled at the tanks" },
      title: "Chock the chassis, drop the landing gear, bleed the air",
      cue: "Chocks both sides of an axle first, the landing gear cranked down onto its pads, then the air tanks bled to zero.",
      why: "The three moves take the chassis's energy out in the order it can hurt: the chocks stop it rolling on a yard grade, the landing gear takes its nose weight so it cannot tip on the kingpin if a hustler bumps it, and the air bled to zero means the brake chambers are on their springs rather than on stored pressure when a hand goes near a slack adjuster. 29 CFR 1917 has intermodal equipment secured before it is worked on, and a chassis secured in another order is a chassis that can still move at one of those three steps.",
      outOfOrderNote: "Chocks first, then the landing gear, then the air — a chassis that can roll is not one to crank a leg down on, and a brake chamber under air is not one to reach into.",
    },
    {
      id: "frame-walk", kind: "find", noHint: true,
      targets: ["cracked-crossmember"],
      itemNames: { "cracked-crossmember": "cracked crossmember at the slider rail" },
      itemNotes: { "cracked-crossmember": "The crossmember behind the slider rail has a crack running from the rail bolt hole with bright metal in it — it has been opening under every loaded trip and it will not survive many more." },
      title: "Walk the frame, crossmembers and slider",
      cue: "Look along the main rails and every crossmember, at the slider rails and their locking pins, for cracks, bright metal and bent steel.",
      why: "A chassis frame carries a loaded container on the road at highway speed, and a crossmember cracked at a bolt hole is a frame that will let go on a pothole with a box on it. The crack shows as a line with bright metal in it long before it shows as a bent chassis, and it is found by walking the frame with a light — from beside it, on a chocked chassis — because nobody looks at the underside of a chassis at a truck stop.",
    },
    {
      id: "tyre-pressure", kind: "gauge", target: "tyre-gauge",
      title: "Gauge the tyre pressures against the sidewall figure",
      cue: "Gauge each tyre and commit the reading against the placarded cold pressure.",
      why: "A chassis tyre under pressure runs hot and fails on the highway with a box over it, and one over pressure wears its centre and loses grip on a wet ramp; the placarded cold pressure is the number both are measured against, and the gauge is how the mechanic gets to it rather than a thump with a bar. Every tyre is gauged, including the inside duals nobody can see, because the inside dual is the one that has been flat for a week.",
      gauge: { label: "TYRE PRESSURE", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 200)} psi`, missNote: "Outside the band — seat the gauge square on the valve stem and read it again, cold." },
    },
    {
      id: "slack-adjuster", kind: "turn", target: "slack-adjuster",
      title: "Set the brake slack adjuster on the pulling axle",
      cue: "Turn the slack adjuster to bring the pushrod stroke inside its limit, then check the stroke with the brakes applied.",
      why: "The driver's brake pull is a brake on one side doing more work than the other, and a slack adjuster set wrong is the usual reason: too much stroke and the chamber runs out of travel before the shoe meets the drum, too little and the shoe drags and heats. The adjuster is set with the air bled and checked with the brakes applied afterwards, because the pushrod stroke under application is the number that says whether the brake will actually stop a loaded chassis — and it is the number a roadside inspection measures.",
      turn: { turns: 0.75, label: "SLACK ADJUSTER", readout: (t) => (t < 0.3 ? "over-stroke" : t < 0.7 ? "adjusting" : "stroke in limit") },
    },
    {
      id: "brake-hold", kind: "hold", target: "brake-hand-valve", seconds: 5,
      title: "Apply the brakes and hold, listening for air leaks",
      cue: "Recharge the air, make a full brake application on the hand valve and hold it: pushrod stroke checked, and the system listened to for leaks.",
      why: "A full application held is the test of the whole air system at once: the pushrod stroke under pressure says the adjusters are right, and a leak that only shows under application — a chamber diaphragm, a glad hand seal — hisses where it can be heard only while the pressure is on. The hold is for the full interval because a slow leak takes that long to show as a gauge drop, and a chassis with a slow leak is a chassis whose brakes drag on and fade out somewhere on the freeway.",
      holdBreakNote: "Released before the application had held long enough to show a slow leak — the leak that matters is the one that takes a few seconds. Apply and hold again.",
    },
    {
      id: "genset-checks", kind: "sequence", anyOrder: true,
      targets: ["genset-fuel-cap", "genset-dipstick"],
      itemNames: { "genset-fuel-cap": "fuel filler cap and tank", "genset-dipstick": "engine oil level" },
      title: "Check the genset's fuel and oil before it is touched",
      cue: "Check the fuel filler is closed and the tank clean, and pull the dipstick for the oil level and its condition.",
      why: "The genset stalled under load, and the two cheapest reasons are a tank that ran dry or drew water and an engine that has run low on oil until it lost pressure — both are found in a minute with the engine off. The filler is checked closed as well as full because the grinder is coming out for the crossmember later, and an open diesel filler a metre from a grinder is the hot-work hazard the terminal's rule on it exists to stop.",
    },
    {
      id: "genset-isolate", kind: "select", target: "battery-disconnect",
      title: "Disconnect and lock the genset's battery",
      cue: "Open the genset's battery disconnect and hang your lock on it before the fuel system is opened.",
      why: "A genset's starter turns on a controller signal, and a controller set to auto-start restarts the engine the moment its reefer calls for power — with a mechanic's hands in the fuel system. 29 CFR 1910.147 puts the disconnect open and locked before any part of the engine is opened, because the genset is a machine that decides for itself when to start, and the lock is what takes that decision away while the filter is off.",
    },
    {
      id: "fuel-filter", kind: "drag", target: "new-fuel-filter",
      title: "Fit the new fuel filter to the filter head",
      cue: "Drain the old filter into the tray, carry the new one from the bench and spin it onto the filter head, gasket wetted, hand tight plus the turn on the label.",
      why: "A genset that stalls under load with fuel in the tank is usually starving through a filter that has picked up the tank's water and growth, and the filter is changed with a tray under it because a chassis yard drains to the terminal's stormwater. The new filter's gasket is wetted so it seats without tearing, and it is tightened by the label's figure rather than by arm, because an over-tightened spin-on filter is the one that cannot be changed next time without a chisel.",
      drag: { to: "filter-head", radius: 0.5, missNote: "Not on the head — the filter has to spin onto the head square, gasket to the face, before it is tightened." },
    },
    {
      id: "run-test", kind: "track", target: "genset-controller", seconds: 6,
      title: "Prime, start and hold the genset's output in band under load",
      cue: "Lock off, prime the filter, start the genset and put the reefer's load on it — hold the output frequency and voltage in band as the compressor cycles.",
      why: "The run test is the only thing that proves the stall is fixed: a genset that starts and idles proves nothing, and a genset that holds its frequency and voltage while a compressor starts against it is one that will carry a reefer to the customer without dropping its cargo's temperature. The output is held in band rather than watched to start because the stall was under load, and a governor hunting under a compressor start is a stall about to happen again on the freeway.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "OUTPUT", readout: (v) => (v < 0.4 ? "sagging — starving again?" : v > 0.6 ? "overspeed — governor hunting" : "holding under load") },
      holdBreakNote: "The output broke out of band under the compressor — that is the stall or the hunt the test exists to find. Hold it and watch it settle.",
    },
    {
      id: "pigtail-walk", kind: "find", noHint: true,
      targets: ["pigtail-damage"],
      itemNames: { "pigtail-damage": "chafed genset pigtail at the chassis rail" },
      itemNotes: { "pigtail-damage": "The pigtail from the genset to the reefer has chafed through its jacket where it crosses the chassis rail — the conductor insulation is showing and the rail edge has been cutting it on every trip." },
      title: "Inspect the genset pigtail and its route to the reefer",
      cue: "Follow the pigtail from the genset's output to the reefer's plug: jacket chafe at the rails, the plug's pins and its strain relief, the clips that route it.",
      why: "The pigtail is the genset's output on a cable that rides the chassis over every pothole, and a jacket chafed through at a rail edge is a phase conductor one trip from the frame — a fault the reefer clerk finds as a tripped genset and a driver finds as a shock on a wet chassis. NFPA 70E treats the pigtail as the live cord it is, and the walk is how a fault that has not happened yet gets found on a chocked chassis rather than on the road.",
    },
    {
      id: "yard-log", kind: "select", target: "yard-log",
      title: "Sign the chassis roadable on the inspection log",
      cue: "Record the crack found and tagged, the adjuster set and the brake test, the tyre pressures, the filter and pigtail replaced, the run test held — and sign the chassis roadable or hold it.",
      why: "The roadability record is what the intermodal equipment provider produces when a roadside inspection asks who last touched this chassis, and it is what the next mechanic reads before the next defect; the crack found is a hold on the chassis until it is repaired, whatever else was fixed. The sign-off is a decision — roadable, or held — and it is made by the mechanic who did the work, on the record, because a chassis released by inference is a chassis on the freeway with a crack nobody wrote down.",
    },
    {
      id: "crew-checkin", kind: "select", target: "yard-radio",
      title: "Check in with the hustler driver and the yard",
      cue: "Call the yard and the driver who wrote up the defect: the chassis is held for the crack, the genset is back, and how the crew is after a shift in the bay beside the hooking lane.",
      why: "The driver who wrote up the brake pull deserves to hear what it was and that the chassis is held for a crack they could not have seen, and the yard needs the hold before a dispatcher assigns the chassis to a box. The call is also the crew's check-in — a shift with a hustler backing past the bay and a reefer alarming next door is a shift with something left in it, and asking the crew before the bay is swept is how the ILWU does it; the member assistance line is named out loud because a line nobody names is a line nobody calls.",
    },
  ],

  interrupts: [
    {
      id: "hustler-hooking",
      kind: "Hustler entering the lane to hook a chassis",
      after: "brake-hold", delay: 2, seconds: 12,
      alert: "A hustler has turned into the lane and is backing toward the chassis beside this one to hook it — its fifth wheel is coming past the bay at walking pace.",
      cue: "Hit the bay stop sign now — the driver is looking in his mirror at the kingpin, not at the bay.",
      target: "bay-stop-sign",
      why: "A hustler backing to hook is driven from the mirrors with the driver's attention on a kingpin the size of a fist, and a repair bay beside the lane is out of that picture entirely; the bay stop sign is the lit signal the driver is trained to check before backing past a bay, and 29 CFR 1917 puts the traffic control on the terminal rather than on a mechanic being seen. It is hit the moment the hustler turns in, because a backing hustler closes on a bay faster than a shout carries.",
      missNote: "The hustler backed past the bay with the stop sign dark and hooked the next chassis with its fifth wheel passing a metre from the mechanic at the brake valve — the brake hold carried on as if the lane were empty.",
      wrongNote: "The bay stop sign — the driver checks the lit sign in his mirror before backing past a bay, and nothing else here is in that mirror.",
    },
    {
      id: "reefer-code-next-door",
      kind: "Fault code on the reefer next door",
      after: "run-test", delay: 2, seconds: 14,
      alert: "The reefer on the neighbouring chassis has thrown a low-voltage fault on its controller — its alarm is flashing and its genset is surging.",
      cue: "Break off and read the code at that reefer's controller before its genset stalls and the code goes with it.",
      target: "reefer-controller",
      why: "A reefer that faults on low voltage while its genset surges is either a genset about to stall or a pigtail failing under load — the same two faults this bay has just been chasing on the chassis beside it — and the code on the controller is the only evidence of which, until the genset stalls and the controller goes dark. Reading it at the controller now is what keeps a second chassis from leaving the yard with the fault this one came in with, and the cargo in that box has a temperature clock running.",
      missNote: "The fault code sat unread until the neighbouring genset stalled and the controller went dark with it — the code was gone, the box was warming, and nobody knew whether it was the genset or the pigtail until it was both.",
      wrongNote: "That reefer's controller — the code is the only evidence of what tripped, and it is read at the controller before the genset stalls and takes it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTC_ACCENT);

    // -------------------------------------------------------------- yard deck
    const deck = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#262b30", base2: "#1e2328", seam: "rgba(0,0,0,0.42)" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xb2bac2 },
    );
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.5, 2.3, 0.111, -2.4 + i * 1.1, 0xf2c14b, { rough: 0.7, cast: false });
    box(g, 0.08, 0.012, 5.6, -2.6, 0.111, 0, 0xe8eef2, { rough: 0.7, cast: false });
    const tray = box(g, 0.5, 0.04, 0.4, 0.2, 0.13, 1.0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    void tray;

    // -------------------------------------------------------- the chassis
    const ch = group(g, -0.3, 0.1, -0.5);
    for (const rz of [-0.45, 0.45]) box(ch, 4.6, 0.16, 0.1, 0, 0.9, rz, 0xd2312b, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 6; i++) box(ch, 0.06, 0.12, 0.9, -2.0 + i * 0.8, 0.9, 0, 0xb8402f, { rough: 0.6, metal: 0.4 });
    const crack = box(ch, 0.02, 0.1, 0.16, 0.42, 0.9, 0.3, 0xe0e4e8, { rough: 0.3, metal: 0.8 });
    reg(hits, crack, "cracked-crossmember");
    // Slider rails and pins.
    for (const rz of [-0.3, 0.3]) box(ch, 1.8, 0.06, 0.06, 1.0, 0.8, rz, 0x3a4148, { rough: 0.55, metal: 0.5 });
    // Axles, wheels, brake chambers.
    for (const ax of [0.8, 1.7]) {
      cyl(ch, 0.05, 0.05, 1.3, ax, 0.5, 0, 0x3a4148, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
      for (const wz of [-0.7, 0.7]) cyl(ch, 0.36, 0.36, 0.26, ax, 0.5, wz, 0x14171a, { rough: 0.85, seg: 16 }).rotation.x = Math.PI / 2;
      for (const wz of [-0.45, 0.45]) cyl(ch, 0.36, 0.36, 0.2, ax, 0.5, wz, 0x1c1f22, { rough: 0.85, seg: 16 }).rotation.x = Math.PI / 2;
      for (const wz of [-0.3, 0.3]) cyl(ch, 0.09, 0.09, 0.2, ax - 0.2, 0.62, wz, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const adjuster = group(ch, 0.6, 0.62, 0.3);
    box(adjuster, 0.05, 0.16, 0.04, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    cyl(adjuster, 0.02, 0.02, 0.05, 0, -0.08, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    holoTag(ch, "slack adjuster — turn", 0.6, 0.36, 0.5, { css: "#c86a3c", w: 0.42 });
    reg(hits, adjuster, "slack-adjuster");
    const tyreStem = cyl(ch, 0.012, 0.012, 0.05, 1.7, 0.5, 0.86, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 });
    tyreStem.rotation.x = Math.PI / 2;
    void tyreStem;
    // Landing gear at the front, kingpin plate, air tanks.
    const legs = group(ch, -1.6, 0.4, 0);
    for (const lz of [-0.35, 0.35]) { box(legs, 0.1, 0.7, 0.1, 0, 0.1, lz, 0x3a4148, { rough: 0.55, metal: 0.5 }); box(legs, 0.2, 0.05, 0.2, 0, -0.27, lz, 0x3a4148, { rough: 0.55, metal: 0.5 }); }
    const crank = box(legs, 0.02, 0.02, 0.25, 0.1, 0.35, 0.5, 0x8a949d, { rough: 0.4, metal: 0.7 });
    holoTag(ch, "landing gear — crank", -1.6, 1.12, 0.6, { css: "#c86a3c", w: 0.4 });
    reg(hits, legs, "landing-gear");
    void crank;
    box(ch, 0.6, 0.04, 0.8, -2.0, 0.8, 0, 0x3a4148, { rough: 0.5, metal: 0.6 });
    const tanks = group(ch, 1.25, 0.72, 0);
    cyl(tanks, 0.1, 0.1, 0.7, 0, 0, 0, 0x8a949d, { rough: 0.45, metal: 0.6, seg: 12 }).rotation.x = Math.PI / 2;
    const bleedCock = box(tanks, 0.03, 0.06, 0.03, 0, -0.12, 0.2, 0xd2312b, { rough: 0.5 });
    holoTag(ch, "air bleed", 1.25, 0.48, 0.5, { css: "#c86a3c", w: 0.22 });
    reg(hits, bleedCock, "air-bleed");
    const handValve = group(ch, -2.3, 0.7, 0.5);
    box(handValve, 0.08, 0.1, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    cyl(handValve, 0.01, 0.01, 0.12, 0, 0.08, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    ball(handValve, 0.02, 0, 0.15, 0, 0xd2312b, { rough: 0.5, seg: 8 });
    holoTag(ch, "brake hand valve — hold", -2.3, 1.05, 0.5, { css: "#c86a3c", w: 0.46 });
    reg(hits, handValve, "brake-hand-valve");
    // Chocks (set at the first axle, near side) and the hazard of the far side.
    const chocks = group(ch, 0.8, 0, 0.95);
    box(chocks, 0.2, 0.14, 0.14, -0.28, 0.07, 0, 0xe8b02e, { rough: 0.8 });
    box(chocks, 0.2, 0.14, 0.14, 0.28, 0.07, 0, 0xe8b02e, { rough: 0.8 });
    holoTag(ch, "wheel chocks", 0.8, 0.36, 1.1, { css: "#c86a3c", w: 0.28 });
    reg(hits, chocks, "wheel-chocks");
    const underHit = box(ch, 1.4, 0.05, 0.6, 0.1, 0.04, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(ch, "under it, no chocks?", 0.1, 0.5, -0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, underHit, "creep-under-unchocked");
    // Genset clipped on the front, under the container position.
    const gen = group(ch, -1.2, 1.05, 0);
    box(gen, 0.9, 0.5, 1.1, 0, 0.25, 0, 0xd8dde2, { rough: 0.5, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(gen, 0.6, 0.03, 0.02, 0, 0.12 + i * 0.1, 0.56, 0x22262b, { rough: 0.6, cast: false });
    cyl(gen, 0.04, 0.04, 0.4, 0.3, 0.6, -0.3, 0x3a4148, { rough: 0.5, metal: 0.6, seg: 10 });
    const fuelTank = box(gen, 0.5, 0.25, 0.25, -0.15, -0.15, 0.5, 0x8b98a5, { rough: 0.5, metal: 0.5 });
    void fuelTank;
    const fuelCap = cyl(gen, 0.05, 0.05, 0.04, -0.15, 0.0, 0.5, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 12 });
    holoTag(gen, "fuel cap + tank", -0.15, -0.4, 0.6, { css: "#c86a3c", w: 0.32 });
    reg(hits, fuelCap, "genset-fuel-cap");
    const dipstick = group(gen, 0.25, 0.3, 0.57);
    torus(dipstick, 0.025, 0.006, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 6, seg2: 12 });
    cyl(dipstick, 0.006, 0.006, 0.12, 0, -0.07, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    holoTag(gen, "dipstick", 0.25, 0.62, 0.57, { css: "#c86a3c", w: 0.2 });
    reg(hits, dipstick, "genset-dipstick");
    const battDisc = group(gen, -0.35, 0.3, 0.57);
    box(battDisc, 0.12, 0.12, 0.05, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const battHandle = box(battDisc, 0.03, 0.14, 0.03, 0, 0, 0.04, 0xd2312b, { rough: 0.5 });
    const lock = lockTag(battDisc, 0.08, -0.06, 0.04, { lines: ["M&R — DO", "NOT START"] });
    lock.visible = false;
    holoTag(gen, "battery disconnect — lock", -0.35, 0.62, 0.57, { css: "#c86a3c", w: 0.48 });
    reg(hits, battDisc, "battery-disconnect");
    const filterHead = group(gen, 0.47, 0.1, 0.2);
    box(filterHead, 0.06, 0.12, 0.12, 0, 0, 0, 0x3a4148, { rough: 0.5, metal: 0.6 });
    const oldFilter = cyl(filterHead, 0.05, 0.05, 0.14, 0.1, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
    oldFilter.rotation.z = Math.PI / 2;
    const headSocket = torus(filterHead, 0.07, 0.008, 0.06, 0, 0, PTC_ACCENT, { emissive: PTC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    headSocket.rotation.y = Math.PI / 2;
    holoTag(gen, "filter head", 0.47, -0.2, 0.3, { css: "#c86a3c", w: 0.26 });
    reg(hits, headSocket, "filter-head");
    const controller = instrument(gen, 0.0, 0.52, 0.3, { idle: "GENSET · OFF", color: 0xc86a3c, w: 0.16, d: 0.1 });
    holoTag(gen, "genset controller — hold", 0.0, 0.75, 0.3, { css: "#c86a3c", w: 0.48 });
    reg(hits, controller, "genset-controller");
    // Pigtail from the genset back along the rail, chafed at the rail edge.
    hose(ch, [[-0.8, 1.1, 0.3], [0.0, 1.0, 0.5], [0.8, 1.0, 0.5], [1.6, 1.05, 0.4]], 0.016, 0x1b1e23, { steps: 14, rough: 0.75 });
    const chafe = box(ch, 0.14, 0.05, 0.05, 0.85, 1.0, 0.5, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    reg(hits, chafe, "pigtail-damage");
    const grinder = group(g, -1.0, 0.1, 0.9);
    box(grinder, 0.26, 0.08, 0.08, 0, 0.04, 0, 0x2b3138, { rough: 0.6 });
    cyl(grinder, 0.07, 0.07, 0.01, 0.16, 0.04, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(grinder, "grind here, by the tank?", 0, 0.3, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, grinder, "grind-near-fuel-tank");

    // -------------------------------------------------- neighbouring reefer
    const nb = group(g, 0.4, 0.1, -2.5);
    box(nb, 4.2, 0.14, 0.9, 0, 0.9, 0, 0x8b98a5, { rough: 0.6, metal: 0.4 });
    for (const wx of [0.8, 1.6]) for (const wz of [-0.55, 0.55]) cyl(nb, 0.34, 0.34, 0.24, wx, 0.5, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.x = Math.PI / 2;
    box(nb, 4.0, 1.6, 0.9, 0, 1.8, 0, 0xdfe6ec, { rough: 0.55, metal: 0.25 });
    box(nb, 0.8, 1.3, 0.1, -1.9, 1.75, 0.5, 0x3a4148, { rough: 0.5, metal: 0.5 });
    const rctl = group(nb, -1.6, 2.1, 0.56);
    box(rctl, 0.3, 0.2, 0.05, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const rlamp = ball(rctl, 0.025, 0.1, 0.06, 0.03, 0x59c97b, { rough: 0.4, emissive: 0x59c97b, ei: 1.4, seg: 8 });
    const rscreen = instrument(rctl, -0.04, 0.0, 0.05, { idle: "RUN · −20°", color: 0xc86a3c, w: 0.16, d: 0.08 });
    rscreen.rotation.x = Math.PI / 2;
    holoTag(nb, "reefer controller", -1.6, 2.4, 0.56, { css: "#c86a3c", w: 0.36 });
    reg(hits, rctl, "reefer-controller");
    const nbGen = box(nb, 0.8, 0.45, 0.9, -1.6, 0.62, 0, 0xd8dde2, { rough: 0.5, metal: 0.3 });
    void nbGen;
    const pigPlug = group(nb, -1.1, 1.2, 0.5);
    cyl(pigPlug, 0.04, 0.04, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.55, metal: 0.3, seg: 12 }).rotation.x = Math.PI / 2;
    hose(nb, [[-1.1, 1.2, 0.58], [-1.3, 1.0, 0.7], [-1.6, 0.85, 0.5]], 0.016, 0x1b1e23, { steps: 8, rough: 0.75 });
    holoTag(nb, "pull it running?", -1.1, 1.5, 0.6, { css: "#d2312b", w: 0.36 });
    reg(hits, pigPlug, "pull-pigtail-live");
    const exhaust = particles(nb, 14, 0x8a9099, { size: 0.04, life: 1.0, additive: false, opacity: 0.35 });

    // ----------------------------------------------- hustler, lane, stop sign
    const hustler = group(g, 2.3, 0.1, 2.4, Math.PI);
    box(hustler, 0.9, 0.5, 1.4, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hustler, 0.86, 0.6, 0.7, 0, 1.0, -0.3, 0xe07a3f, { rough: 0.5, metal: 0.3 });
    box(hustler, 0.7, 0.3, 0.02, 0, 1.1, -0.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    cyl(hustler, 0.3, 0.3, 0.05, 0, 0.55, 0.4, 0x14171a, { rough: 0.7, seg: 14 });
    for (const [wx, wz] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.45], [0.45, 0.45]]) cyl(hustler, 0.22, 0.22, 0.2, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    const hustlerHome = hustler.position.clone();
    const betweenHit = box(g, 0.5, 0.05, 0.6, -2.4, 0.14, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand between them?", -2.4, 0.5, -0.5, { css: "#d2312b", w: 0.42 });
    reg(hits, betweenHit, "between-hustler-chassis");
    const signPost = group(g, 1.9, 0.1, -1.8);
    cyl(signPost, 0.02, 0.02, 1.5, 0, 0.75, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const sign = box(signPost, 0.34, 0.34, 0.03, 0, 1.6, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    const signLamp = ball(signPost, 0.06, 0, 1.6, 0.03, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10 });
    holoTag(signPost, "bay stop sign", 0, 1.9, 0, { css: "#c86a3c", w: 0.3 });
    reg(hits, signPost, "bay-stop-sign");
    void sign;

    // ------------------------------------------------------- chest and bench
    const chest = toolChest(g, 1.6, 1.2, { ry: -0.6, color: 0x2f4f6f });
    const tyreGauge = instrument(chest, -0.1, 0.79, 0.02, { ry: 0.2, idle: "-- psi", color: 0xc86a3c, w: 0.1, d: 0.16 });
    holoTag(tyreGauge, "tyre gauge", 0, 0.15, 0, { css: "#c86a3c", w: 0.26 });
    reg(hits, tyreGauge, "tyre-gauge");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 6 · YARD", color: 0xc86a3c, w: 0.1, d: 0.16 });
    holoTag(radio, "yard radio", 0, 0.15, 0, { css: "#c86a3c", w: 0.26 });
    reg(hits, radio, "yard-radio");
    const newFilter = group(chest, 0.02, 0.82, -0.15);
    cyl(newFilter, 0.05, 0.05, 0.14, 0, 0, 0, 0xe8c14b, { rough: 0.5, metal: 0.3, seg: 12 });
    holoTag(chest, "new fuel filter", 0.02, 1.06, -0.15, { css: "#c86a3c", w: 0.32 });
    reg(hits, newFilter, "new-fuel-filter");

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, -2.2, 1.25, 1.8, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c86a3c"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6dccb"; cx.fillText("ROADABILITY — CHASSIS 4471 · GENSET 118", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Driver defect: brake pull left · genset stalled under load", "Last inspection: 90 days · genset 1,240 h", "Chocks · landing gear · air bled before any work",
       "Genset: battery disconnect locked before fuel system", "Run test under reefer load — output held in band", "Sign roadable or hold — on the record"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 2.5, accent: PTC_ACCENT });
    reg(hits, board, "roadability-board");
    const logBoard = holoPanel(g, 0.6, 0.42, 2.7, 1.25, -0.4, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c86a3c"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6dccb"; cx.fillText("YARD LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Chassis 4471: IN BAY", "Frame: —", "Genset 118: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -1.3, accent: PTC_ACCENT });
    reg(hits, logBoard, "yard-log");

    // ---------------------------------------------------------------- crew
    const mechanic = standingFigure(g, -0.2, 1.9, { ry: 3.0, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e, gloves: true });
    holoTag(mechanic, "M&R mechanic", 0, 1.9, 0, { css: "#c86a3c", w: 0.3 });
    const driver = standingFigure(g, 2.7, 0.5, { ry: -2.2, cloth: 0x2b3138, vest: 0xfcee21, cap: 0x2b3138 });
    holoTag(driver, "hustler driver", 0, 1.9, 0, { css: "#c86a3c", w: 0.3 });
    cone(g, -2.4, 2.5); cone(g, 1.0, 2.5);
    barrierPanel(g, -1.0, 2.55, { color: 0xf2c14b, ry: 0 });

    const okMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
    const alarmMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
    const stopMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.4, rough: 0.4 });
    let reeferFault = false;
    let gensetRunning = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 0.9, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "secure-chassis") { legs.position.y = 0.3; }
        if (step.id === "frame-walk") crack.material = mat(0xe8b02e, { rough: 0.6 });
        if (step.id === "brake-hold") repaint(tyreGauge.userData.screen, signFace("BRAKES OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "genset-isolate") { battHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "fuel-filter") { newFilter.visible = false; oldFilter.material = mat(0xe8c14b, { rough: 0.5, metal: 0.3 }); }
        if (step.id === "run-test") { gensetRunning = true; battHandle.rotation.z = 0; lock.visible = false; repaint(controller.userData.screen, signFace("GENSET · RUN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 })); }
        if (step.id === "pigtail-walk") chafe.material = mat(0x1b1e23, { rough: 0.75 });
        if (step.id === "yard-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#f6dccb"; cx.fillText("YARD LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Chassis 4471: HELD — crossmember crack, repair order", "Brakes: adjuster set, test held · tyres to placard", "Genset 118: filter + pigtail replaced · run test held"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("YARD TOLD", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "hustler-hooking") { hustler.position.set(2.3, 0.1, -0.2); }
        if (it.id === "reefer-code-next-door") { reeferFault = true; rlamp.material = alarmMat; repaint(rscreen.userData.screen, signFace("LOW VOLT FAULT", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd0c8", scale: 0.45 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hustler-hooking") { hustler.position.copy(hustlerHome); signLamp.material = stopMat; }
        if (it.id === "reefer-code-next-door") { reeferFault = false; rlamp.material = mat(0xe8b02e, { emissive: 0xe8b02e, ei: 1.4, rough: 0.4 }); repaint(rscreen.userData.screen, signFace("CODE READ", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.5 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "slack-adjuster") adjuster.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tyre-pressure") repaint(tyreGauge.userData.screen, signFace(`${Math.round(gg.t * 200)} psi`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "run-test" && session.holding) {
          const v = session.track.v;
          repaint(controller.userData.screen, signFace(`${(58 + v * 4).toFixed(1)} Hz`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (step?.id === "brake-hold" && session.holding) {
          const frac = Math.min(1, session.holdFor / (step.seconds ?? 5));
          repaint(tyreGauge.userData.screen, signFace(`${Math.round(90 + frac * 30)} psi · HOLD`, { bg: "#0d1c24", accent: "#f2ae14", fg: "#ffe9b0", scale: 0.5 }));
        }
        rlamp.visible = reeferFault ? Math.sin(t * 8) > 0 : true;
        exhaust.visible = true;
        exhaust.userData.step(dt, new THREE.Vector3(-1.6, 0.9, -0.5), 0.05, 0.25, 0.3);
        void gensetRunning; void okMat; void CITY;
      },
    };
  },
};
