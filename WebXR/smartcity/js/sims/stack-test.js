import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, torus, lathe, group, decal, repaint, signFace, paperFace,
  particles, hose, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, cone, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Stack Test VR — Environmental Monitoring, station eight.
//
// A compliance source test on the stack of a boiler/incinerator, run from the
// sampling platform by a testing contractor's crew with the plant's own
// operators holding the load steady underneath them.
//
// This is not ambient monitoring and it is not a well. The number that comes
// off this platform goes into a permit file and will be read years later by
// somebody who was not here, so the procedure is at least as much about what
// INVALIDATES a run as it is about taking one. The post-test leak check is the
// sharp end of that: it is run at the end, on the train that has just been
// used, and if it fails, the run it brackets does not exist. Nothing else in
// the station can retroactively destroy an hour of work the way that one can.
//
// The other three things that make it its own trade:
//   * the traverse points are CALCULATED, from where the ports sit relative to
//     the nearest upstream and downstream flow disturbances (Method 1) — they
//     are not chosen by eye and they are not the same from stack to stack;
//   * isokinetic means the gas enters the nozzle at the same velocity it was
//     travelling past it. Sample fast and particulate is under-collected,
//     sample slow and it is over-collected, so the rate is computed from the
//     velocity head at each point (Method 2) and then HELD across the whole
//     traverse (Method 5);
//   * the train is hot glass full of reagent — the probe comes out of a duct
//     at temperature and the impingers hold acid — and none of it counts until
//     it has been recovered into labelled containers in a clean area.
//
// Everything physical happens at a rail on a platform up the side of a hot
// stack, under OSHA 29 CFR 1910 Subpart D.

const STK_ACCENT = 0xe07a5f;

export const SIM_STACK_TEST = {
  id: "stack-test",
  index: "68",
  domain: "Environmental",
  trade: "Source emissions tester / stack testing technician",
  category: "Environmental Monitoring",
  weather: "wind",
  certification: "IUOE and USW plant crews working with the testing contractor's source-testing team; the EPA reference methods in 40 CFR Part 60 Appendix A — Method 1 traverse points, Method 2 velocity by pitot, Method 3 gas composition, Method 4 moisture and Method 5 particulate; the facility's operating permit and the test protocol approved under it; OSHA 29 CFR 1910 Subpart D for the sampling platform, its guardrail and its fixed ladder",
  name: "Stack Test",
  title: simTitle("Stack Test"),
  tagline: "An isokinetic source test from the sampling platform: traverse points calculated, train leak-checked both ends, the rate held across the traverse, and everything recovered into labelled containers",
  accent: STK_ACCENT,
  accentCss: "#e07a5f",
  parSeconds: 310,
  footprint: 2.2,
  badge: { id: "run-stands", name: "The Run Stands", note: "A traverse taken isokinetically, bracketed by leak checks that both passed, and recovered so an auditor can follow it" },

  game: system({
    name: "Source Test Authority",
    currency: "DSCF",
    ranks: ["Test Assistant", "Sampling Technician", "Team Leader", "Qualified Source Tester", "Source Test Authority"],
    badges: [
      { id: "bracketed", name: "Bracketed", note: "Both leak checks carried to full duration, first time", test: AWARD.unbroken },
      { id: "nothing-invented", name: "Nothing Invented", note: "Never touched the recorded data and never skipped a check", test: AWARD.safe },
      { id: "on-the-nozzle", name: "On The Nozzle", note: "Velocity, rate and metered volume all read close to band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "points-calculated", name: "Points Calculated", note: "Surveyed the ports and laid the traverse out without a correction", test: AWARD.stepClean("port-survey") },
      { id: "held-the-traverse", name: "Held The Traverse", note: "Kept the sampling rate in band across the whole traverse", test: AWARD.stepClean("isokinetic") },
      { id: "off-the-stack", name: "Off The Stack", note: "Test run, recovered and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-post-leak": "You started breaking the train down without running the post-test leak check. That check is not paperwork and it is not optional: it is the only evidence that the volume the dry gas meter recorded actually came through the nozzle rather than in through a fitting somewhere on the platform. Run it after the train is disconnected and the whole run it brackets is gone — an hour of traverse, the plant's load held steady for nothing, and a return visit that somebody pays for.",
    "hot-port": "You put your face and your hand across an open port on a duct at operating temperature. What comes out of a port is gas at stack temperature, and on a duct that is not under steady negative pressure it comes out rather than being drawn in. The port is opened from the side, with the cap between you and the hole, and nothing goes across it that you are not willing to have burned.",
    "bare-hands": "You handled the probe liner and the impinger glassware bare-handed. The liner has just come out of a heated duct and the probe sheath holds that heat long after the run ends; the impingers are thin glass holding reagent, and the first two of them are charged with an acid solution. Gloves rated for both, every time the train is touched, and the glassware moved in its case rather than in your fingers.",
    "rewrite-data": "You went back and adjusted a number already written on the field data sheet. A stack test is evidence in a permit file: its value comes entirely from the fact that the raw readings were recorded as they were taken and can be re-derived by somebody who was not standing here. A correction is struck through, initialled and dated so the original stays readable — a number quietly replaced turns a test report into a document nobody can rely on, and it is the single fastest way for a tester to end a career.",
  },

  lateNotes: {
    "probe": "The probe goes to the port after the train is assembled and the pre-test leak check has passed — not before.",
    "rate-control": "The sampling rate is set from the velocity head at the point, so the pitot is read before this is touched.",
  },

  steps: [
    {
      id: "protocol", kind: "select", target: "test-protocol",
      title: "Take the approved test protocol",
      cue: "Read what permit condition this run is proving, which methods it runs under, and what the plant is holding.",
      why: "A compliance test is run against a protocol the agency approved beforehand — the methods, the run count, the run duration and the process conditions the plant must maintain throughout. Anything done differently on the day has to be justified afterwards to somebody who was not here, so the deviation is decided now rather than discovered later.",
    },
    {
      id: "platform", kind: "sequence", anyOrder: true,
      targets: ["ladder-cage", "deck-grating", "rail-gate"],
      itemNames: { "ladder-cage": "fixed ladder and cage", "deck-grating": "platform grating and toeboard", "rail-gate": "self-closing gate at the ladder opening" },
      itemNotes: {
        "ladder-cage": "The ladder is the only way on and off this platform, and everything the test needs comes up it on a rope, not in a hand.",
        "deck-grating": "The grating is sound and the toeboard is continuous — a dropped wrench off this deck lands where the plant's own people are working.",
        "rail-gate": "The gate swings shut on its own. A guardrail with a permanent hole in it at the top of a ladder is not a guardrail.",
      },
      title: "Prove the platform before anything is carried up",
      cue: "Ladder and cage, deck grating and toeboard, and the gate at the ladder opening — in whatever order you walk them.",
      why: "The platform is somebody else's structure and the test crew is a visitor on it. Subpart D puts the guardrail, the toeboard and the fixed ladder on the plant, but the crew that finds them defective is the crew standing on them with a heavy probe, so it is checked on arrival and before any load goes on it.",
    },
    {
      id: "port-survey", kind: "gauge", target: "port-survey",
      title: "Survey the ports against the flow disturbances",
      cue: "Measure the port location in duct diameters from the nearest disturbance upstream and downstream, and commit.",
      why: "Method 1 does not let you pick a sampling location; it makes you measure one. How far the ports sit from the nearest bend, damper, fan or change of section — expressed in duct diameters — is what decides how many traverse points the run needs and where on the probe they fall. Ports close to a disturbance are sampling a swirling, stratified flow and need more points to describe it.",
      gauge: {
        label: "DIAMETERS", speed: 0.7, green: [0.5, 0.74],
        readout: (t) => `${(t * 10).toFixed(1)} D downstream`,
        missNote: "That puts the port nearer the disturbance than the point count you are about to use allows. Either the layout goes up to more points or this is not a sampling location — it is not a judgement call.",
      },
    },
    {
      id: "traverse-points", kind: "select", target: "point-layout",
      title: "Lay the traverse points out on the probe",
      cue: "Take the point count and spacing the survey gives you, and mark them off the inside wall of the port.",
      why: "Each point represents an equal area of the duct, so they are not evenly spaced — they crowd toward the wall where the same fraction of area sits in a thinner ring. The marks are measured from the inside duct wall and the port's own length is added, because the probe is graduated from the nozzle and the port is not part of the duct.",
    },
    {
      id: "train-build", kind: "sequence", anyOrder: true,
      targets: ["nozzle-set", "filter-load", "impinger-charge"],
      itemNames: { "nozzle-set": "nozzle selected and measured", "filter-load": "filter loaded in the holder", "impinger-charge": "impingers charged and set in the ice bath" },
      itemNotes: {
        "nozzle-set": "The nozzle is measured, not assumed — its bore is what the isokinetic rate is computed against for the whole run.",
        "filter-load": "The filter goes in the holder in the recovery area, handled with tweezers, in the container it was weighed in.",
        "impinger-charge": "The first impingers take their reagent by measured volume; the last takes silica gel, and the lot goes in ice.",
      },
      title: "Assemble the sample train",
      cue: "Nozzle measured, filter loaded, impingers charged and iced — the recovery area does these in whatever order it runs.",
      why: "Everything the run will be judged on is decided here: the nozzle bore that sets the rate, the tared filter that catches the particulate, and the impingers whose contents become the moisture result. It is assembled in a clean area, away from the platform, because dust that gets into the train here is indistinguishable from dust that came out of the duct.",
    },
    {
      id: "leak-pre", kind: "hold", target: "vacuum-pump", seconds: 6,
      title: "Pre-test leak check on the assembled train",
      cue: "Plug the nozzle, pull the vacuum and hold while the meter dial is watched for movement.",
      why: "The pre-test check finds a bad fitting while it still costs nothing but the minute it takes to fix it. It proves the train is tight before an hour of traverse is invested in it, and it is watched on the dial rather than on the pump — a leak this test is looking for is small enough that the only way you will see it is by watching something that should not move.",
      holdBreakNote: "You let go before the check ran. A leak rate is a volume over a time; cut the time short and there is no rate, just an opinion.",
    },
    {
      id: "open-port", kind: "turn", target: "port-cap",
      title: "Crack the port cap from the side",
      cue: "Stand to one side of the port, keep the cap between you and the hole, and back it off slowly.",
      why: "A cap that has been on a hot duct is seized and the space behind it may be at positive pressure. Backed off slowly from the side, a puff of hot gas goes past you; spun off standing square to it, it goes into you. The platform rail is right there, so this is also the moment to be braced against something rather than leaning on the cap.",
      turn: { turns: 1.5, axis: "x", label: "PORT CAP" },
    },
    {
      id: "probe-carry", kind: "drag", target: "probe",
      title: "Carry the probe to the port",
      cue: "Lift the probe off the rack, keep it inside the rail, and set the nozzle into the port.",
      why: "A heated probe with a pitot lashed to it is long, heavy, front-loaded and made largely of glass, and it is being handled at a rail on a platform. It stays inside the guardrail the whole way, carried at the balance rather than the ends, because the recovery from a stumble is to let go of it and there has to be somewhere safe for it to land.",
      drag: { to: "port-seat", radius: 0.5, missNote: "The nozzle is not seated in the port. A probe resting against the boss is a probe about to go down the outside of the stack." },
    },
    {
      id: "pitot", kind: "gauge", target: "pitot-manometer",
      title: "Read the velocity head at the point",
      cue: "Let the column settle, then commit the velocity head the pitot is giving you at this traverse point.",
      why: "Method 2 gets velocity from the difference between the pitot's impact and static pressures, and that difference is what the isokinetic rate for this point is computed from. A column still swinging is the duct's turbulence, not its velocity — commit on a moving manometer and every rate that follows is derived from a number the stack was not actually doing.",
      gauge: {
        label: "VELOCITY HEAD", speed: 0.82, green: [0.4, 0.6],
        readout: (t) => `${(t * 2.0).toFixed(2)} in. H2O`,
        missNote: "You took that off a column that had not settled. Wait for the manometer to steady — a velocity head read mid-swing is a guess wearing a decimal point.",
      },
    },
    {
      id: "isokinetic", kind: "track", target: "rate-control", seconds: 9,
      title: "Hold the rate isokinetic across the traverse",
      cue: "Set the rate the velocity gives you and keep it in the band as you step the probe through the points.",
      why: "Isokinetic means the gas enters the nozzle at the same velocity it was travelling past it. Sample faster than the gas and the nozzle pulls in gas from outside its own streamline while the heavier particles carry straight past, so particulate is under-collected; sample slower and the flow spills around the nozzle while inertia carries particles into it, so it is over-collected. The result is only the duct's if the rate tracks the velocity at every point.",
      track: {
        label: "ORIFICE", green: [0.42, 0.62], rise: 0.5, fall: 0.42, drift: 0.13,
        readout: (v) => `${(v * 3.2).toFixed(2)} in. H2O`,
      },
    },
    {
      id: "leak-post", kind: "hold", target: "nozzle-cap", seconds: 7,
      title: "Post-test leak check — before anything is disconnected",
      cue: "Cap the nozzle with the probe still in the port and hold the vacuum while the dial is watched.",
      why: "This is the check the whole run hangs on. It is made at the highest vacuum the run reached, on the train exactly as the run left it, before a single fitting is broken — because a leak found after the train comes apart cannot be attributed to the run or to the disassembly. Fail it and the run is invalid and gets repeated; there is no correction factor that rescues it and no argument to be had with the reviewer about it.",
      holdBreakNote: "You broke the post-test check off partway. An incomplete check is a failed check — it cannot be reported as a pass, so run the full duration or repeat the run.",
    },
    {
      id: "meter-volume", kind: "gauge", target: "dry-gas-meter",
      title: "Read the metered sample volume",
      cue: "Read the dry gas meter against the run time and the rate you were holding, and commit.",
      why: "The metered volume is the denominator of the whole result, and it is also the first place a badly held traverse shows up: run the rate high or low against what the velocity called for and the volume will not agree with the time it was collected over. It is corrected for meter calibration, pressure and temperature before it means anything, which is why the raw reading is written down exactly as the dial shows it.",
      gauge: {
        label: "SAMPLE VOL", speed: 0.72, green: [0.44, 0.66],
        readout: (t) => `${(t * 80).toFixed(1)} dscf`,
        missNote: "The metered volume does not agree with the run time at the rate the velocity called for. The traverse was not held isokinetic, and the isokinetic result calculated from this will say so.",
      },
    },
    {
      id: "recovery", kind: "sequence",
      targets: ["filter-container", "probe-rinse", "impinger-container"],
      itemNames: { "filter-container": "filter into its own container", "probe-rinse": "front-half rinse into its container", "impinger-container": "impinger contents measured into theirs" },
      itemNotes: {
        "filter-container": "Filter out with tweezers, back into the dish it was weighed in, sealed and labelled before anything else is opened.",
        "probe-rinse": "Nozzle, liner and the front half of the holder brushed and rinsed into their own container — this is still the particulate catch.",
        "impinger-container": "Back half last: contents measured for the moisture result, then into a labelled container of its own.",
      },
      title: "Recover the train in the clean area, front half first",
      cue: "Filter out first, then the front-half rinse, then the back half — and label every container as it is closed.",
      why: "The front half — nozzle, liner, filter — is the particulate catch, and the back half is the moisture. Recover them in that order and nothing from the impingers can find its way into the catch; recover them the other way round and there is no way afterwards to prove it did not. Every container is labelled at the moment it is closed, with the run, the location and the date, because a set of unlabelled jars in a cooler is not a sample.",
    },
    {
      id: "data-sheet", kind: "select", target: "field-data-sheet",
      title: "Close out the field data sheet",
      cue: "Raw readings as taken, corrections struck through and initialled, and the run signed.",
      why: "The report that leaves the office months from now is derived entirely from this sheet, and the reviewer's first question will be whether the sheet is contemporaneous. Raw numbers as read, times as they happened, and any correction made so the original is still legible underneath it — a sheet that has been tidied up is worth less than one that is messy and honest.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["bent-pitot", "loose-spare-cap"],
      itemNames: { "bent-pitot": "damaged pitot leg", "loose-spare-cap": "spare port left hand-tight" },
      itemNotes: {
        "bent-pitot": "The pitot's static leg has taken a knock against the port boss. A Type S pitot out of alignment does not read obviously wrong, it reads slightly wrong — which is worse, because it will be believed. That assembly goes out of service until it is inspected against the method's dimensional criteria.",
        "loose-spare-cap": "The spare port's cap has been left hand-tight. It will back itself off against a hot flange and put a jet of stack gas across a platform where somebody will be working on the next shift, after your crew has gone home.",
      },
      title: "Walk the platform before you go down the ladder",
      cue: "Look over the pitot, the ports and what you are leaving behind; click what needs writing up.",
      why: "The crew that comes to this platform next is not yours, and the equipment that goes into the next run is the equipment leaving this one. Both of the things worth finding here are quiet: a pitot that will still give a plausible reading, and a cap that will hold until it does not.",
    },
  ],

  interrupts: [
    {
      id: "gate-hooked",
      kind: "Guardrail opening",
      after: "train-build", delay: 3, seconds: 12,
      alert: "Somebody has hooked the self-closing gate back open to pass gear up, and walked off. There is now an unguarded hole at the top of the ladder.",
      cue: "The guardrail has a hole in it at the ladder opening.",
      target: "rail-gate",
      why: "A self-closing gate is the only thing standing between a working platform and an open ladderway, and it stops working the moment somebody hooks it back for convenience. The crew on this deck is about to spend an hour walking backwards along a traverse with their eyes on a manometer, which is exactly the situation the gate exists for.",
      missNote: "The gate stayed hooked open for the whole run. Nobody went through it, which was luck rather than anything you did — the crew stepped past an unguarded ladderway repeatedly while carrying a probe and watching a gauge, and the next person up the ladder arrived through a hole in the guardrail they had no reason to expect.",
      wrongNote: "It is the gate at the ladder opening. Unhook it and let it close before anyone else moves on this deck.",
    },
    {
      id: "load-swing",
      kind: "Process load change",
      after: "isokinetic", delay: 4, seconds: 13,
      alert: "The plant has swung load mid-traverse — the stack temperature is climbing and the draft has changed. The velocity at your point is not what you computed the rate from.",
      cue: "The duct is no longer doing what it was doing when you set the rate.",
      target: "pitot-manometer",
      why: "The isokinetic rate is only correct for the velocity it was computed from, and a compliance run is supposed to be taken at the process conditions the protocol specifies. When the load moves, the first thing to do is re-read the velocity head so the rate can be recomputed — and then find out whether the plant can hold the condition at all, because a run taken across a load swing may not represent anything the permit cares about.",
      missNote: "The traverse carried on at a rate computed for a velocity the duct had stopped doing. Every point after the swing was sampled anisokinetically, so the particulate catch is biased and the isokinetic result calculated back at the office will fall outside what the method allows — the run is rejected, the plant holds load again, and the crew comes back.",
      wrongNote: "It is the manometer. Re-read the velocity head before you touch the rate, because the rate is computed from it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, STK_ACCENT);

    // ------------------------------------------------------------- the stack
    // The stack itself is scenery: a tall banded shell rising past the
    // platform, with the breeching coming into its base from off to one side
    // and a plume at the top so the thing reads as in service rather than as
    // a piece of pipe. Nothing the learner has to reach is on it above the
    // platform's own working height.
    const STACK_X = -2.5, STACK_Z = -2.6;
    const stack = group(g, STACK_X, 0, STACK_Z);
    cyl(stack, 0.98, 1.2, 15.0, 0, 7.5, 0, 0x9a6a55,
      { rough: 0.95, seg: 26, finish: "concrete", tile: [6, 14] });
    for (let i = 0; i < 5; i++) {
      cyl(stack, 1.03 - i * 0.045, 1.05 - i * 0.045, 0.16, 0, 2.2 + i * 2.7, 0, 0x6e6157,
        { rough: 0.9, seg: 26, finish: "rust", tile: [6, 1], cast: false });
    }
    cyl(stack, 1.0, 1.0, 0.3, 0, 15.1, 0, 0x4a5259, { rough: 0.7, metal: 0.4, seg: 26 });
    holoTag(stack, "Stack — unit 2 boiler", 0, 4.6, 1.22, { css: "#e07a5f", w: 0.5 });
    const plume = particles(g, 30, 0xd9dde2, { size: 0.3, life: 2.4, additive: false, opacity: 0.2 });
    plume.position.set(STACK_X, 15.4, STACK_Z);
    // The breeching duct, coming in low from the boiler house.
    const breech = group(g, -4.9, 0, -2.6);
    box(breech, 3.4, 1.5, 1.5, 0, 0.9, 0, 0x6a7178,
      { rough: 0.72, metal: 0.45, finish: "galvanised", tile: [4, 2], cast: false });
    for (const dx of [-1.15, -0.2, 0.75]) {
      box(breech, 0.08, 1.58, 1.58, dx, 0.9, 0, 0x4c545b, { rough: 0.7, metal: 0.5, cast: false });
    }
    box(breech, 3.5, 0.1, 1.6, 0, 1.72, 0, 0x3f474e, { rough: 0.8, cast: false });
    for (const sx of [-1.2, 0.9]) {
      box(breech, 0.14, 0.75, 0.14, sx, 0.08, 0.85, 0x4c545b, { rough: 0.8, cast: false });
    }
    holoTag(breech, "Breeching from the boiler house", 0.4, 2.05, 0.8, { css: "#8fb3c4", w: 0.56 });
    // The ladder continuing up the stack past the platform — scenery, and the
    // reason the deck reads as partway up something rather than as a stage.
    const upper = group(g, STACK_X + 0.55, 0, STACK_Z + 1.02);
    for (const sx of [-0.22, 0.22]) cyl(upper, 0.022, 0.022, 7.0, sx, 4.6, 0, 0x7b838a, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    for (let i = 0; i < 20; i++) {
      box(upper, 0.44, 0.02, 0.02, 0, 1.4 + i * 0.34, 0, 0x7b838a, { rough: 0.5, metal: 0.6, cast: false });
    }
    for (let i = 0; i < 7; i++) {
      const hoop = torus(upper, 0.36, 0.014, 0, 2.2 + i * 0.95, 0.18, 0x7b838a, { rough: 0.55, metal: 0.55, seg: 6, seg2: 16, cast: false });
      hoop.rotation.x = Math.PI / 2;
    }

    // ---------------------------------------------------- the sampling platform
    // A grating deck bracketed off the stack, guarded on its three open sides
    // with top rail, midrail and toeboard, and reached by a caged ladder that
    // arrives through a self-closing gate. The deck is the whole working area:
    // everything the procedure asks for is on it, within the rail.
    const DX0 = -1.35, DX1 = 2.05, DZ0 = -2.3, DZ1 = 1.3;
    box(g, DX1 - DX0, 0.08, DZ1 - DZ0, (DX0 + DX1) / 2, 0.05, (DZ0 + DZ1) / 2,
      0x1d242a, { rough: 0.95, metal: 0.1 });
    // Serrated bar grating, drawn rather than modelled: a deck this size built
    // out of individual bars is a hundred meshes for something the learner only
    // ever sees underfoot, and one flat plate reads as a table rather than as a
    // platform you can see through to the drop below.
    const deckFace = decal(g, DX1 - DX0, DZ1 - DZ0, (DX0 + DX1) / 2, 0.118, (DZ0 + DZ1) / 2, (cx, w, h) => {
      cx.fillStyle = "#0c1014"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5f6970";
      const pitch = Math.max(8, Math.round(w / 40));
      for (let x = 0; x < w; x += pitch) cx.fillRect(x, 0, Math.max(3, pitch * 0.42), h);
      cx.fillStyle = "#39414a";
      const cross = Math.max(16, Math.round(h / 16));
      for (let y = 0; y < h; y += cross) cx.fillRect(0, y, w, Math.max(2, cross * 0.18));
      // Panel joints: this deck is laid in three sections, and the seams are
      // what makes it read as a deck rather than as one poured surface.
      cx.fillStyle = "#89939b";
      for (const f of [0.02, 0.35, 0.68, 0.98]) cx.fillRect(0, h * f - h * 0.008, w, h * 0.016);
      for (const f of [0.02, 0.98]) cx.fillRect(w * f - w * 0.008, 0, w * 0.016, h);
      // A worn yellow walkway stripe down the middle of the deck.
      cx.fillStyle = "rgba(224,170,60,0.5)";
      cx.fillRect(0, h * 0.5 - h * 0.035, w, h * 0.07);
    }, { px: 768, rough: 0.9, metal: 0.4 });
    deckFace.rotation.x = -Math.PI / 2;
    // Cantilever brackets back to the stack — what holds the deck up.
    for (const dz of [-1.7, -0.4, 0.9]) {
      const arm = box(g, 1.4, 0.07, 0.07, -0.7, 0.0, dz, 0x4a535b, { rough: 0.7, metal: 0.5, cast: false });
      arm.rotation.z = -0.28;
    }
    // The grating panel the arrival check is made on, set slightly proud so it
    // reads as a panel rather than as the whole deck.
    const grating = box(g, 0.8, 0.035, 0.7, 0.95, 0.142, 0.62, 0x6d7780,
      { rough: 0.8, metal: 0.25, finish: "grating", tile: [2, 2] });
    holoTag(g, "Deck grating · toeboard", 0.95, 0.44, 0.62, { css: "#e07a5f", w: 0.44 });
    reg(hits, grating, "deck-grating");

    // Guardrail: posts, top rail, midrail, toeboard. Open only at the gate.
    const RAIL_TOP = 1.16, RAIL_MID = 0.62;
    const railMat = { rough: 0.5, metal: 0.65, finish: "galvanised", cast: false };
    const post = (x, z) => cyl(g, 0.026, 0.03, RAIL_TOP, x, RAIL_TOP / 2 + 0.1, z, 0x9aa3ab, { ...railMat, seg: 10 });
    const runX = (z, x0, x1) => {
      for (const y of [RAIL_TOP, RAIL_MID]) {
        box(g, x1 - x0, 0.03, 0.03, (x0 + x1) / 2, y + 0.1, z, 0x9aa3ab, railMat);
      }
      box(g, x1 - x0, 0.1, 0.02, (x0 + x1) / 2, 0.16, z, 0xd8d0b4, { rough: 0.7, cast: false });
    };
    const runZ = (x, z0, z1) => {
      for (const y of [RAIL_TOP, RAIL_MID]) {
        box(g, 0.03, 0.03, z1 - z0, x, y + 0.1, (z0 + z1) / 2, 0x9aa3ab, railMat);
      }
      box(g, 0.02, 0.1, z1 - z0, x, 0.16, (z0 + z1) / 2, 0xd8d0b4, { rough: 0.7, cast: false });
    };
    runX(DZ1, DX0, DX1);
    runX(DZ0, DX0, DX1);
    runZ(DX1, DZ0, -0.05);
    runZ(DX1, 0.85, DZ1);
    for (const [px, pz] of [[DX0, DZ0], [0.35, DZ0], [DX1, DZ0], [DX1, -0.05], [DX1, 0.85], [DX1, DZ1], [0.35, DZ1], [DX0, DZ1]]) post(px, pz);

    // The self-closing gate across the ladder opening, and the caged ladder.
    const gate = group(g, DX1, 0, -0.05);
    box(gate, 0.028, 0.03, 0.9, 0, RAIL_TOP + 0.1, 0.45, 0xf2c14b, { rough: 0.55, metal: 0.4, cast: false });
    box(gate, 0.028, 0.03, 0.9, 0, RAIL_MID + 0.1, 0.45, 0xf2c14b, { rough: 0.55, metal: 0.4, cast: false });
    box(gate, 0.03, 0.72, 0.03, 0, 0.56, 0.88, 0xf2c14b, { rough: 0.55, metal: 0.4, cast: false });
    holoTag(g, "Self-closing gate", DX1 + 0.02, 1.52, 0.4, { css: "#f2c14b", w: 0.36 });
    reg(hits, gate, "rail-gate");

    const ladder = group(g, DX1 + 0.33, 0, 0.4);
    for (const sz of [-0.21, 0.21]) cyl(ladder, 0.022, 0.022, 3.6, 0, -1.5, sz, 0x9aa3ab, { ...railMat, seg: 8 });
    for (let i = 0; i < 11; i++) {
      const rung = cyl(ladder, 0.014, 0.014, 0.42, 0, 0.1 - i * 0.3, 0, 0x9aa3ab, { ...railMat, seg: 8 });
      rung.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 4; i++) {
      const hoop = torus(ladder, 0.34, 0.014, -0.18, -0.35 - i * 0.78, 0, 0x9aa3ab, { ...railMat, seg: 6, seg2: 16 });
      hoop.rotation.y = Math.PI / 2;
    }
    holoTag(g, "Fixed ladder · cage", DX1 + 0.36, 0.92, 0.4, { css: "#8fb3c4", w: 0.38 });
    reg(hits, ladder, "ladder-cage");

    // --------------------------------------------------------- the two ports
    // Set in the stack wall at working height off the deck, pointing along +x
    // so the crew works at them side-on with the rail behind them.
    const portBoss = (z, colour) => {
      const p = group(g, STACK_X + 1.06, 1.3, z);
      cyl(p, 0.11, 0.13, 0.22, 0.05, 0, 0, colour, { rough: 0.65, metal: 0.5, seg: 16, finish: "rust", tile: [1, 1] })
        .rotation.z = Math.PI / 2;
      cyl(p, 0.16, 0.16, 0.03, -0.04, 0, 0, 0x6e6157, { rough: 0.8, metal: 0.35, seg: 16 }).rotation.z = Math.PI / 2;
      return p;
    };
    const portA = portBoss(-1.95, 0x8a7f74);
    holoTag(g, "Sampling port — traverse", STACK_X + 1.18, 1.68, -1.95, { css: "#e07a5f", w: 0.48 });
    const portCap = group(portA, 0.2, 0, 0);
    cyl(portCap, 0.1, 0.1, 0.09, 0, 0, 0, 0xb8664a, { rough: 0.6, metal: 0.45, seg: 18, finish: "painted", tile: [1, 1] })
      .rotation.z = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box(portCap, 0.06, 0.022, 0.022, 0.03, Math.sin(a) * 0.09, Math.cos(a) * 0.09, 0x8d5038, { rough: 0.6, metal: 0.4 });
    }
    reg(hits, portCap, "port-cap");
    const portSeat = box(g, 0.3, 0.3, 0.3, STACK_X + 1.26, 1.3, -1.95, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["port-seat"] = portSeat;

    const portB = portBoss(-0.85, 0x8a7f74);
    const spareCap = cyl(portB, 0.1, 0.1, 0.09, 0.2, 0, 0, 0x8d7a5a, { rough: 0.7, metal: 0.35, seg: 18, finish: "rust", tile: [1, 1] });
    spareCap.rotation.z = Math.PI / 2;
    spareCap.rotation.y = 0.22;
    holoTag(g, "Spare port", STACK_X + 1.2, 1.66, -0.85, { css: "#8fb3c4", w: 0.26 });
    reg(hits, spareCap, "loose-spare-cap");
    const hotPortTrap = box(g, 0.34, 0.5, 0.5, STACK_X + 1.62, 1.42, -1.95, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Look into the port?", STACK_X + 1.62, 1.86, -1.95, { css: "#f0645b", w: 0.4 });
    reg(hits, hotPortTrap, "hot-port");

    // ------------------------------------------------ the probe and its pitot
    const rack = group(g, 1.0, 0, 0.72);
    for (const dx of [-0.6, 0.6]) {
      box(rack, 0.06, 0.4, 0.14, dx, 0.3, 0, 0x4a535b, { rough: 0.6, metal: 0.4 });
      box(rack, 0.1, 0.05, 0.2, dx, 0.5, 0, 0x2b3138, { rough: 0.7 });
    }
    const probe = group(g, 1.0, 0.55, 0.72, 1.5708);
    cyl(probe, 0.026, 0.026, 1.9, 0, 0, 0, 0xb6c2cc, { rough: 0.35, metal: 0.7, seg: 12, finish: "brushed" })
      .rotation.x = Math.PI / 2;
    cyl(probe, 0.038, 0.038, 0.5, 0, 0, 0.55, 0xe07a5f, { rough: 0.55, metal: 0.2, seg: 12, finish: "painted", tile: [1, 1] })
      .rotation.x = Math.PI / 2;
    cyl(probe, 0.012, 0.018, 0.1, 0, 0, -1.0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;
    // The Type S pitot lashed alongside — two legs facing opposite ways.
    const pitot = group(probe, 0.055, 0, -0.55);
    cyl(pitot, 0.009, 0.009, 1.0, 0, 0, 0, 0xc6ced6, { rough: 0.35, metal: 0.75, seg: 8 }).rotation.x = Math.PI / 2;
    const pitotLeg = cyl(pitot, 0.009, 0.009, 0.07, 0, 0.032, -0.48, 0xc6ced6, { rough: 0.35, metal: 0.75, seg: 8 });
    pitotLeg.rotation.z = Math.PI / 2;
    holoTag(g, "Probe · Type S pitot", 1.0, 0.95, 0.72, { css: "#e07a5f", w: 0.42 });
    reg(hits, probe, "probe");
    reg(hits, pitotLeg, "bent-pitot");
    // The umbilical from the probe back to the console.
    hose(g, [[1.6, 0.5, 0.72], [1.85, 0.32, 0.2], [1.75, 0.35, -0.8], [1.6, 0.6, -1.25]], 0.022, 0x2b3138,
      { steps: 16, rough: 0.85 });

    // ------------------------------------------------------------- the console
    // The meter box: dry gas meter, orifice and the rate control, with the
    // pump beside it and the inclined manometer on its own post.
    const meterBox = group(g, 1.45, 0, -1.35, -0.35);
    slab(meterBox, 0.78, 0.5, 0.55, 0, 0.7, 0, 0x2f5f7a, { radius: 0.03, rough: 0.55, metal: 0.35, finish: "painted", tile: [2, 1] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(meterBox, 0.022, 0.022, 0.45, sx * 0.32, 0.23, sz * 0.2, 0x59636d, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    holoTag(meterBox, "Meter box", 0, 1.12, 0, { css: "#4fd1ff", w: 0.26 });
    const meter = instrument(meterBox, -0.2, 0.96, 0.02, { ry: 0.2, idle: "-- dscf", color: 0x4fd1ff });
    reg(hits, meter, "dry-gas-meter");
    const rateControl = group(meterBox, 0.24, 0.96, 0.0);
    cyl(rateControl, 0.055, 0.06, 0.035, 0, 0, 0, 0xe07a5f, { rough: 0.5, metal: 0.3, seg: 18 });
    box(rateControl, 0.014, 0.03, 0.05, 0, 0.03, 0.03, 0xf4efe6, { rough: 0.5 });
    holoTag(meterBox, "Rate control", 0.24, 1.14, 0.0, { css: "#e07a5f", w: 0.3 });
    reg(hits, rateControl, "rate-control");
    const consoleLamp = box(meterBox, 0.05, 0.03, 0.02, 0.05, 0.86, 0.28, 0x59c97b,
      { emissive: 0x59c97b, ei: 1.2, rough: 0.4, cast: false });

    const pump = group(g, 1.85, 0, -2.0, 0.4);
    box(pump, 0.3, 0.26, 0.24, 0, 0.23, 0, 0x36404a, { rough: 0.7, metal: 0.3, finish: "painted", tile: [1, 1] });
    cyl(pump, 0.06, 0.06, 0.16, 0.09, 0.42, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 14 });
    holoTag(pump, "Leak-check pump", 0, 0.66, 0, { css: "#4fd1ff", w: 0.36 });
    reg(hits, pump, "vacuum-pump");

    // The inclined manometer on its post, with a real column to move.
    const manoPost = group(g, 0.5, 0, -2.16);
    cyl(manoPost, 0.022, 0.026, 1.0, 0, 0.6, 0, 0x59636d, { rough: 0.55, metal: 0.5, seg: 10 });
    const mano = group(manoPost, 0, 1.16, 0.02);
    slab(mano, 0.34, 0.03, 0.2, 0, 0, 0, 0x22303c, { radius: 0.01, rough: 0.5 });
    const manoScale = decal(mano, 0.3, 0.13, 0, 0.018, 0.0, (cx, w, h) => {
      cx.fillStyle = "#101c24"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#7fa7bb"; cx.lineWidth = Math.max(1, h * 0.03);
      for (let i = 0; i <= 10; i++) {
        const x = w * 0.06 + (w * 0.88 * i) / 10;
        cx.beginPath(); cx.moveTo(x, h * 0.62); cx.lineTo(x, i % 5 === 0 ? h * 0.24 : h * 0.44); cx.stroke();
      }
      cx.fillStyle = "#bfeaf7";
      cx.font = `600 ${Math.round(h * 0.28)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("VELOCITY HEAD  in. H2O", w * 0.06, h * 0.84);
    }, { px: 320, glow: true, ei: 0.7 });
    manoScale.rotation.x = -Math.PI / 2;
    const manoColumn = box(mano, 0.1, 0.012, 0.016, -0.06, 0.026, -0.04, 0xe07a5f,
      { emissive: 0xe07a5f, ei: 1.3, rough: 0.4, cast: false });
    holoTag(manoPost, "Inclined manometer", 0, 1.38, 0, { css: "#e07a5f", w: 0.42 });
    reg(hits, mano, "pitot-manometer");

    // The port survey: a tape and a stadia readout clamped to the stack, which
    // is what the Method 1 layout is actually derived from.
    const survey = instrument(g, -1.12, 1.0, -1.42, { ry: 1.2, idle: "-- D", color: 0xe07a5f });
    holoTag(g, "Port survey — duct diameters", -1.12, 1.2, -1.42, { css: "#e07a5f", w: 0.5 });
    reg(hits, survey, "port-survey");

    // ---------------------------------------------- the recovery / clean area
    // Downwind end of the deck, away from the port, where the train is built
    // before the run and taken apart after it.
    const bench = group(g, -0.45, 0, 0.62, 0.25);
    slab(bench, 1.3, 0.05, 0.6, 0, 0.78, 0, 0xcbd3d9, { radius: 0.015, rough: 0.4, metal: 0.2 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(bench, 0.02, 0.02, 0.68, sx * 0.58, 0.44, sz * 0.24, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    holoTag(bench, "Recovery area — clean", 0, 1.18, 0, { css: "#59c97b", w: 0.46 });

    const nozzleCase = group(bench, -0.45, 0.83, 0.02);
    box(nozzleCase, 0.24, 0.06, 0.16, 0, 0.03, 0, 0x2b3138, { rough: 0.7 });
    for (let i = 0; i < 4; i++) {
      cyl(nozzleCase, 0.008, 0.014, 0.07, -0.075 + i * 0.05, 0.09, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 10 });
    }
    holoTag(bench, "Nozzles — measured", -0.45, 1.02, 0.02, { css: "#59c97b", w: 0.38 });
    reg(hits, nozzleCase, "nozzle-set");

    const filterHolder = group(bench, -0.05, 0.83, 0.0);
    cyl(filterHolder, 0.055, 0.055, 0.07, 0, 0.04, 0, 0xdfe6ea, { rough: 0.2, metal: 0.1, opacity: 0.72, transparent: true, seg: 18 });
    torus(filterHolder, 0.058, 0.008, 0, 0.075, 0, 0xb8402f, { rough: 0.6, seg: 6, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(bench, "Filter holder", -0.05, 1.0, 0.0, { css: "#59c97b", w: 0.3 });
    reg(hits, filterHolder, "filter-load");

    // The impingers, in their ice bath.
    const iceBath = group(bench, 0.42, 0.83, 0.0);
    box(iceBath, 0.42, 0.18, 0.2, 0, 0.09, 0, 0x2f6f8c, { rough: 0.55, metal: 0.2, finish: "painted", tile: [1, 1] });
    const impingers = [];
    for (let i = 0; i < 4; i++) {
      const jar = lathe(iceBath, [[0.001, 0], [0.033, 0.01], [0.034, 0.14], [0.02, 0.17], [0.02, 0.2], [0.001, 0.205]],
        -0.15 + i * 0.1, 0.09, 0, i < 2 ? 0xbfe2ea : 0xe4e9ec,
        { rough: 0.18, metal: 0.05, opacity: 0.66, transparent: true, seg: 14 });
      impingers.push(jar);
    }
    holoTag(bench, "Impingers — reagent, iced", 0.42, 1.04, 0.0, { css: "#59c97b", w: 0.48 });
    reg(hits, iceBath, "impinger-charge");

    // Labelled containers, the things the run actually leaves behind.
    const containers = group(g, -1.0, 0, -0.35, 0.9);
    box(containers, 0.44, 0.04, 0.3, 0, 0.5, 0, 0x4a535b, { rough: 0.7, metal: 0.3 });
    for (const sx of [-1, 1]) cyl(containers, 0.018, 0.018, 0.48, sx * 0.18, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const dish = cyl(containers, 0.05, 0.05, 0.02, -0.14, 0.53, 0, 0xe8edf0,
      { rough: 0.2, metal: 0.05, opacity: 0.7, transparent: true, seg: 16 });
    holoTag(containers, "Container 1 — filter", -0.14, 0.72, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, dish, "filter-container");
    const rinseJar = lathe(containers, [[0.001, 0], [0.042, 0.012], [0.043, 0.13], [0.026, 0.16], [0.026, 0.185], [0.001, 0.19]],
      0.0, 0.52, 0, 0xd7e3e8, { rough: 0.2, metal: 0.05, opacity: 0.7, transparent: true, seg: 16 });
    holoTag(containers, "Container 2 — front-half rinse", 0.02, 0.82, 0, { css: "#59c97b", w: 0.56 });
    reg(hits, rinseJar, "probe-rinse");
    const backHalf = lathe(containers, [[0.001, 0], [0.042, 0.012], [0.043, 0.13], [0.026, 0.16], [0.026, 0.185], [0.001, 0.19]],
      0.15, 0.52, 0, 0xcfd9c2, { rough: 0.2, metal: 0.05, opacity: 0.7, transparent: true, seg: 16 });
    holoTag(containers, "Container 3 — back half", 0.17, 0.72, 0, { css: "#59c97b", w: 0.44 });
    reg(hits, backHalf, "impinger-container");

    // The nozzle cap on its lanyard: the post-test leak check is made with
    // this on, with the probe still in the port.
    const nozzleCap = group(g, -0.62, 0.9, -1.55);
    cyl(nozzleCap, 0.026, 0.03, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5, metal: 0.35, seg: 14 });
    hose(nozzleCap, [[0, 0, 0], [0.1, -0.16, 0.1], [0.24, -0.3, 0.16]], 0.005, 0x2b3138, { steps: 10, rough: 0.9, cast: false });
    holoTag(g, "Nozzle cap — post-test check", -0.62, 1.12, -1.55, { css: "#f2c14b", w: 0.54 });
    reg(hits, nozzleCap, "nozzle-cap");

    // ----------------------------------------------------- paperwork in the AR
    const protocol = holoPanel(g, 0.62, 0.44, -0.42, 1.78, -2.26, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e07a5f"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("APPROVED TEST PROTOCOL · RUN 1 OF 3", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("PARTICULATE — UNIT 2 STACK", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Methods 1-5, 40 CFR 60 App. A", "Permit condition: particulate limit",
       "Process held at the protocol condition", "Leak check before and after each run",
       "Post-test failure invalidates the run", "Recovery in the clean area only"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 0.12, accent: STK_ACCENT });
    reg(hits, protocol, "test-protocol");

    const layout = holoPanel(g, 0.56, 0.4, 1.15, 1.78, -2.24, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("METHOD 1 — TRAVERSE LAYOUT", w * 0.06, h * 0.15);
      // The points, crowding toward the wall because each one owns an equal
      // area of a circular duct.
      const cy = h * 0.56, x0 = w * 0.1, x1 = w * 0.9;
      cx.strokeStyle = "#5d7f92"; cx.lineWidth = Math.max(2, h * 0.02);
      cx.beginPath(); cx.moveTo(x0, cy); cx.lineTo(x1, cy); cx.stroke();
      const frac = [0.02, 0.07, 0.15, 0.29, 0.71, 0.85, 0.93, 0.98];
      cx.fillStyle = "#4fd1ff";
      for (const f of frac) {
        cx.beginPath(); cx.arc(x0 + (x1 - x0) * f, cy, Math.max(2, h * 0.035), 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillText("Equal areas — measured from the inside wall", w * 0.06, h * 0.8);
      cx.fillText("Add the port length to every mark", w * 0.06, h * 0.91);
    }, { ry: -0.2, accent: 0x4fd1ff });
    reg(hits, layout, "point-layout");

    const sheet = group(g, -1.16, 0, 0.5, 0.75);
    box(sheet, 0.3, 0.02, 0.4, 0, 0.92, 0, 0x6d5a43, { rough: 0.8 });
    const sheetFace = decal(sheet, 0.27, 0.36, 0, 0.932, 0,
      paperFace("FIELD DATA — RUN 1", ["Point / time / dH", "Meter in ____  out ____",
        "Leak: pre ___  post ___", "Nozzle dia. ____", "Recovered by ______"], { worn: true }), { px: 256 });
    sheetFace.rotation.x = -Math.PI / 2;
    holoTag(sheet, "Field data sheet", 0, 1.12, 0, { css: "#f2c14b", w: 0.38 });
    reg(hits, sheet, "field-data-sheet");

    // --------------------------------------------------------- the temptations
    const skipTrap = box(g, 0.4, 0.5, 0.4, 1.9, 0.6, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Break the train down?", 1.9, 1.0, -0.55, { css: "#f0645b", w: 0.44 });
    reg(hits, skipTrap, "skip-post-leak");
    const handsTrap = box(g, 0.34, 0.4, 0.34, 0.18, 1.0, -1.22, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Bare hands on the liner?", 0.18, 1.34, -1.22, { css: "#f0645b", w: 0.48 });
    reg(hits, handsTrap, "bare-hands");
    const dataTrap = box(g, 0.34, 0.4, 0.34, -1.16, 1.28, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Adjust the number?", -1.16, 1.5, 0.5, { css: "#f0645b", w: 0.42 });
    reg(hits, dataTrap, "rewrite-data");

    // ---------------------------------------------------------------- the crew
    // The second tester works the console while the first works the port; that
    // position against the equipment IS the content here, which is what
    // atStation says — the plan-view clearance rule cannot express a person
    // standing on a deck at the rail with the meter box under their hands.
    standingFigure(g, 1.62, -0.62, { ry: -2.5, atStation: true, cloth: 0x2f3f4a, vest: 0xe07a5f, helmet: 0xf2f2f2 });
    holoTag(g, "Second tester — console", 1.62, 2.05, -0.62, { css: "#e07a5f", w: 0.46 });
    // The plant's operator, stood off the platform at the foot of the ladder —
    // the person holding the load steady while the run is taken.
    standingFigure(g, 2.55, 2.5, { ry: 3.5, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "Plant operator — holding load", 2.55, 2.05, 2.5, { css: "#f2c14b", w: 0.52 });
    cone(g, -1.9, 1.85, { color: 0xe07a5f });
    cone(g, -2.5, 0.6, { color: 0xe07a5f });

    // ------------------------------------------------------------ live state
    const probeHome = probe.position.clone();
    const probeHomeRy = probe.rotation.y;
    const gateHomeY = gate.rotation.y;
    const manoHomeX = manoColumn.position.x;
    let running = false, capOff = false, loadSwing = 0, gateOpen = false, recovered = false;
    const sampleWisp = particles(g, 16, 0xcfd5da, { size: 0.03, life: 0.6, additive: false, opacity: 0.28 });
    sampleWisp.position.set(STACK_X + 1.3, 1.35, -1.95);

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "open-port") {
          capOff = true;
          portCap.position.set(0.44, -0.22, 0.2);
          portCap.rotation.z = 1.1;
        }
        if (step.id === "probe-carry") {
          // The probe goes into the port and stays there for the run.
          probe.position.set(STACK_X + 1.5, 1.3, -1.95);
          probe.rotation.y = 0;
        }
        if (step.id === "isokinetic") running = true;
        if (step.id === "leak-post") {
          running = false;
          nozzleCap.position.set(STACK_X + 1.02, 1.3, -1.95);
        }
        if (step.id === "recovery") {
          recovered = true;
          dish.material = mat(0x59c97b, { rough: 0.5 });
          rinseJar.material = mat(0x59c97b, { rough: 0.5, opacity: 0.8, transparent: true });
          backHalf.material = mat(0x59c97b, { rough: 0.5, opacity: 0.8, transparent: true });
        }
        if (step.id === "walk") {
          spareCap.rotation.y = 0;
          spareCap.material = mat(0x59c97b, { rough: 0.6 });
        }
      },

      // Both of these really happen in the scene: the gate swings open and
      // stays open, and the manometer column runs off up its scale while the
      // console lamp goes to alarm.
      onInterrupt(it) {
        if (it.id === "gate-hooked") {
          gateOpen = true;
          gate.rotation.y = -1.25;
          gate.position.z = 0.08;
          for (const c of gate.children) if (c.isMesh) c.material = mat(0xf0645b, { rough: 0.55, metal: 0.4 });
        }
        if (it.id === "load-swing") {
          loadSwing = 1;
          manoColumn.position.x = manoHomeX + 0.085;
          manoColumn.scale.x = 2.1;
          consoleLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gate-hooked") {
          gateOpen = false;
          gate.rotation.y = gateHomeY;
          gate.position.z = -0.05;
          for (const c of gate.children) if (c.isMesh) c.material = mat(0xf2c14b, { rough: 0.55, metal: 0.4 });
        }
        if (it.id === "load-swing") {
          loadSwing = 0;
          manoColumn.position.x = manoHomeX;
          manoColumn.scale.x = 1;
          consoleLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
        }
      },

      onHazard(hitId) {
        // Reaching across a hot open port puts gas out of it, visibly.
        if (hitId === "hot-port") loadSwing = Math.max(loadSwing, 0.6);
      },

      animate(t, dt, session) {
        // The stack is in service whatever the crew is doing.
        plume.visible = true;
        plume.userData.step(dt, new THREE.Vector3(0.35, 0.2, 0.35), 0.4, 0.9 + loadSwing * 0.6, 0.25);
        if (capOff && (running || loadSwing)) {
          sampleWisp.visible = true;
          sampleWisp.userData.step(dt, new THREE.Vector3(0.5 + loadSwing, 0.4, 0), 0.08, 0.5, 0.4);
        } else if (sampleWisp.visible) sampleWisp.visible = false;
        if (gateOpen) consoleLamp.material.emissiveIntensity = 1.4 + Math.sin(t * 6) * 0.6;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "port-survey") {
          repaint(survey.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} D`, {
            bg: "#1e1410", accent: gg.t > 0.48 && gg.t < 0.76 ? "#59c97b" : "#f0645b", fg: "#ffd9c6", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "meter-volume") {
          repaint(meter.userData.screen, signFace(`${(gg.t * 80).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.42 && gg.t < 0.68 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        // The manometer column is a real column: it tracks the gauge while the
        // velocity head is being read, and drifts while the rate is held.
        if (gg && !gg.committed && session.step?.id === "pitot") {
          manoColumn.position.x = manoHomeX + gg.t * 0.1;
          manoColumn.material.emissiveIntensity = gg.t > 0.38 && gg.t < 0.62 ? 1.9 : 0.9;
        } else if (session?.track && session.step?.id === "isokinetic") {
          manoColumn.position.x = manoHomeX + session.track.v * 0.09 + loadSwing * 0.05;
        }
        void recovered;
      },
    };
  },
};
