import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Gas Leak Survey VR — Energy & Power, station seventy-one.
// A reported odour of natural gas on a street with a cast-iron distribution
// main under it, worked by one serviceperson with a combustible gas indicator
// and a bar.
//
// What separates a leak survey from every other gas job in this catalogue is
// that it is not a repair and it is not an entry. It is a measurement problem
// whose answer is a grade, and the grade is decided by WHERE the gas is, not
// by how strongly it announces itself. The same deflection is a leak that gets
// scheduled when it is in open soil at the kerb and a leak that gets a crew
// tonight when it is against a foundation wall — and if the reading is taken
// inside the structure at all, the job stops being a survey and becomes an
// evacuation.
//
// The other half is migration. Gas leaving a main almost never rises through
// the ground above it; it takes the easiest path, which is the sand and stone
// somebody backfilled a trench with years ago, and it runs along that trench
// under a frost lens or an asphalt overlay until it finds an opening — a sewer
// lateral, a water service sleeve, a cracked cellar wall two doors down. So
// the survey follows the utilities out from the source rather than following
// the smell, and the pattern of bar holes IS the finding.

const GLS_ACCENT = 0xf6a623;

export const SIM_GAS_LEAK_SURVEY = {
  id: "gas-leak-survey",
  index: "71",
  domain: "Energy",
  trade: "Gas distribution serviceperson / leak survey technician",
  category: "Energy & Power",
  weather: "overcast",
  certification: "UWUA and USW gas-utility locals — operator-qualified for leakage survey and leak investigation; 49 CFR Part 192 (PHMSA minimum safety standards for gas distribution pipelines, including its leakage-survey, investigation and repair requirements) and the operator's own written leak-grading and re-check procedure made under it; NFPA 54 for the customer fuel-gas piping downstream of the meter; OSHA 29 CFR 1910.146 where migrated gas puts a manhole or a vault into the survey",
  name: "Gas Leak Survey",
  title: simTitle("Gas Leak Survey"),
  tagline: "Reported odour over a distribution main: instrument zeroed in clean air, ignition sources controlled, bar-holed outward along the trench and the utilities, graded on where the gas is, inside readings evacuated rather than investigated",
  accent: GLS_ACCENT,
  accentCss: "#f6a623",
  parSeconds: 310,
  footprint: 2.3,
  badge: { id: "leak-graded", name: "Leak Graded", note: "An odour call worked out to its edges and graded on where the gas was, with nothing on the street left able to light it" },

  game: system({
    name: "Leak Survey Authority",
    currency: "SCALE",
    ranks: ["Serviceperson", "Leak Investigator", "Survey Technician", "Survey Crew Leader", "Leak Survey Authority Certified"],
    badges: [
      { id: "clean-zero", name: "Zeroed Clean", note: "Instrument zeroed in air that was actually clean, upwind of the call", test: AWARD.stepClean("zero") },
      { id: "nothing-to-light-it", name: "Nothing To Light It", note: "No vehicle, no bell push and no curiosity put an ignition source over the gas", test: AWARD.safe },
      { id: "read-the-hole", name: "Read The Hole", note: "Every bar hole read on a settled sample rather than on the first swing", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "Whole call worked with no corrections", test: AWARD.clean },
      { id: "held-the-draw", name: "Held The Draw", note: "Every timed draw carried through without letting go", test: AWARD.unbroken },
      { id: "graded-early", name: "Graded Early", note: "Grade called and passed on inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "doorbell": "You pressed the bell push to warn the householder. A bell push is a switch, and a switch makes a small arc every time it closes — on the outside wall of a building whose foundation hole has just read. The trade knocks. It knocks on the door frame, it leaves the bell, the light switches and the garage opener alone, and it tells the occupants to leave everything electrical exactly as they found it on the way out.",
    "truck-start": "You reached for the ignition to bring the truck up closer to the work. Your own vehicle is the largest and most reliable ignition source on this street: a starter motor, an alternator, a hot exhaust and a catalytic converter, all of them arriving directly over a trench that is venting. The truck gets parked upwind and clear at the start of the call and it stays there — the last few metres are walked, carrying what is rated to be carried.",
    "basement-entry": "You went down the cellar steps to find where it is coming in. An inside reading is the one finding on this call that ends the investigation instead of directing it: below grade, in an unventilated space with a standing pilot in the corner of it, there is nothing a serviceperson can usefully learn that is worth being in the room to learn it. Get the occupants out, get yourself out, call it in, and let the reading be taken from the doorway with a probe.",
    "zero-at-leak": "You zeroed the combustible gas indicator standing over the bar holes. A catalytic instrument zeroes to whatever air it is breathing at the moment you press it, so zeroing it in gas teaches it that gas is zero — and it will then read clean all the way down the street while you walk away from a leak it has been calibrated not to see. The zero is taken upwind, in air you have first proved is clean, and it is taken again after the instrument has been switched off or has sat in a rich sample.",
  },

  lateNotes: {
    "barhole-wall": "The hole at the foundation comes last. The pattern is driven outward from the source so you can see where the gas stops, not inward from the building so you can confirm what you already feared.",
    "curb-valve": "The service valve is shut once the extent is known and the building is clear — not on the way past, and not before anybody has been told what is about to go off.",
    "evacuate-call": "The call goes in when there is a reading to call about. Ringing it in on an odour with no instrument behind it starts a crew rolling to a number nobody can repeat.",
  },

  steps: [
    {
      id: "ticket", kind: "select", target: "odour-ticket",
      title: "Take the odour report",
      cue: "Read what was reported, by whom, from where, and how long ago.",
      why: "An odour call is somebody else's observation, and it is the only evidence there is until the instrument comes out of the truck. Whether it was smelled outdoors at the kerb or indoors in a cellar changes the approach before you leave the vehicle, and the time it was reported tells you whether you are arriving at a leak that has been filling a void under the pavement since last night or one that started while the caller was still on the phone.",
    },
    {
      id: "approach", kind: "sequence",
      targets: ["park-upwind", "engine-off", "is-kit"],
      itemNames: { "park-upwind": "truck parked upwind and short of the call", "engine-off": "engine and heater shut down", "is-kit": "intrinsically safe kit only, carried in" },
      title: "Park upwind, shut down, and walk the last part",
      cue: "Stop short of the address, kill the engine, and carry in only what is rated to be there.",
      why: "The first vehicle to arrive at a gas call parks where the gas is not, because a running engine sitting over a venting trench is the ignition source most likely to be present and the only one entirely within your control. Shutting it down also stops the cab heater and the beacon inverter. What goes in from there is the instrument, the bar and a torch rated for a flammable atmosphere; the phone and the ordinary lamp stay in the cab with the truck.",
      outOfOrderNote: "Wrong order — park it clear first, then shut it down, then pick up what you are carrying. Sorting kit on the tailgate of an idling truck parked over the leak is the wrong half of this done first.",
    },
    {
      id: "zero", kind: "hold", target: "cgi-zero", seconds: 5,
      title: "Zero the combustible gas indicator in clean air",
      cue: "Upwind of the call, hold the zero until the instrument settles on its own.",
      why: "A catalytic combustible gas indicator does not know what clean air is; it knows what it was breathing when somebody last zeroed it. Zero it upwind, away from the trench and away from the truck's own exhaust, and hold it long enough for the sensor to come to temperature and the reading to stop walking. An instrument zeroed in a hurry, or zeroed in the sample, produces a survey that proves the street is clear when it is not.",
      holdBreakNote: "You let go before it settled. A zero taken on a moving needle is a zero at whatever the needle happened to be doing — hold it through to the stop.",
    },
    {
      id: "paths", kind: "find", noHint: true,
      targets: ["main-trench", "sewer-lateral", "water-service"],
      itemNames: { "main-trench": "the backfilled trench over the main", "sewer-lateral": "the sewer lateral crossing it", "water-service": "the water service into the building" },
      itemNotes: {
        "main-trench": "The patch line down the carriageway is the trench the main was laid in. Whatever came out was backfilled with sand and stone, and that is now a drain running the length of the street with a better permeability than anything either side of it.",
        "sewer-lateral": "The lateral runs from the manhole under the trench line and into the building. Where two trenches cross, gas changes lanes — and this one ends inside somebody's cellar at a floor drain.",
        "water-service": "The water service enters through the foundation in a sleeve. The sleeve is the hole in the wall: the gas does not have to get through concrete, it only has to reach a pipe that already went through it.",
      },
      decoyNotes: {
        "odour-plume": "That is where it smells worst, which tells you where the wind has taken it and nothing whatever about where it came out of the ground. Odour collects in still corners, behind hedges and against walls. The survey follows the utilities.",
      },
      title: "Work out where it can travel before you drive a hole",
      cue: "Find the three underground paths that can carry this away from the source.",
      why: "Gas leaving a main rarely comes up through the ground directly above the leak. It takes the path of least resistance, which is the trench somebody backfilled with sand, and it stays under whatever is capping the surface until the cap runs out. Reading the street for its utilities first is what tells you where to put the bar holes, and just as importantly which buildings are downstream of a leak that has not reached them yet.",
    },
    {
      id: "barholes", kind: "sequence",
      targets: ["barhole-main", "barhole-trench", "barhole-wall"],
      itemNames: { "barhole-main": "over the main, at the service tee", "barhole-trench": "out along the trench", "barhole-wall": "at the foundation wall" },
      title: "Bar-hole outward, source first",
      cue: "Drive the pattern from the main, out along the trench, and only then at the wall.",
      why: "The pattern is the finding. Driven outward from the suspected source you watch the readings fall away and can say where the gas stops; driven inward from the building you only ever confirm the one hole you were already worried about and never learn the extent. Each hole goes down to the bedding and is angled off the pipe rather than onto it, because a bar driven onto a plastic service is how a survey becomes a second leak.",
      outOfOrderNote: "Out of order — the source hole first, then out along the trench, then the wall. Starting at the wall leaves you a number with nothing either side of it to compare it against.",
    },
    {
      id: "soil-read", kind: "gauge", target: "cgi-meter",
      title: "Read the bar hole in open soil",
      cue: "Purge the hole, let the instrument come up, and commit when the reading is on scale and steady.",
      why: "The reading you write down is the settled one. The first swing after the probe goes in is the air that was already in the hose and the top of the hole; the last is the hole drawing fresh air in around the probe as the pump empties it. Between those two is the plateau, and the plateau is the sample. A reading taken on the way up is a guess, and it is a guess somebody will read months later while deciding whether to dig this street up.",
      gauge: {
        label: "BAR HOLE 1 · SAMPLE", speed: 0.7, green: [0.34, 0.58],
        readout: (t) => (t < 0.34 ? "still rising — hose air" : t > 0.58 ? "falling away — hole drawn down" : "settled — read it now"),
        missNote: "That is not the sample. Committed on the rise you have written down the hose; committed on the fall you have written down the fresh air coming in around the probe. Purge it, let it plateau, take the middle.",
      },
    },
    {
      id: "wall-read", kind: "gauge", target: "wall-probe",
      title: "Read the hole at the foundation",
      cue: "Same instrument, same scale, same patience — commit on the settled reading at the wall.",
      why: "This is the reading the grade turns on. The identical deflection that is a scheduled repair out in the carriageway is a different grade entirely once it is against a structure, because a building is a void with people in it and a trench is not. Nothing about the instrument changes here; what changes is that the number now has an address attached to it, and the operator's procedure reads those two facts together rather than either one alone.",
      gauge: {
        label: "BAR HOLE 3 · FOUNDATION", speed: 0.72, green: [0.36, 0.6],
        readout: (t) => (t < 0.36 ? "still drawing" : t > 0.6 ? "sample diluting" : "settled at the wall"),
        missNote: "Not a settled sample. At the wall of all places the number has to be defensible — this is the reading that decides whether anybody sleeps in the building tonight.",
      },
    },
    {
      id: "inside", kind: "select", target: "evacuate-call",
      title: "An inside reading — evacuate and call it",
      cue: "The probe at the cellar doorway has come up. Get them out and get it called in.",
      why: "At or above the limit that makes it an inside reading, the job changes character: this is no longer a survey to be completed, it is an occupied building with a flammable atmosphere in it. Everybody comes out, nothing electrical is touched on the way — no lights, no switches, no phones used indoors — and the call goes to the emergency number and to gas control together, because what is needed now is a crew and a shutdown rather than a serviceperson with a bar.",
    },
    {
      id: "control", kind: "drag", target: "barricade",
      title: "Close the approach off",
      cue: "Carry the barrier across the street approach and set the cones behind it.",
      why: "Once the grade is going to be a serious one, everything that can drive, park or wander onto the leak has to be stopped at a distance rather than waved at as it arrives. A traffic control point put in early is also what keeps the next vehicle — a delivery van, a neighbour, the crew who came to help — from parking on the bar holes with its engine running, which is the commonest way a controlled gas call acquires an ignition source.",
      drag: { to: "street-socket", radius: 0.5, missNote: "Not across the approach. A barrier set off to one side is a barrier people drive around, and the thing you were keeping off the leak arrives anyway." },
    },
    {
      id: "curb-valve", kind: "turn", target: "curb-valve",
      title: "Shut the service at the curb box",
      cue: "Key into the box and take the service valve over to shut.",
      why: "Shutting the service takes the building out of the equation without touching the main, which is what lets one person make the street safe while the crew is still on the way. It is done at the curb box from the surface with a key, so nothing has to be opened and nobody has to stand at the meter set. It is also the point of no return for the occupants' heating, which is why it happens after they are out and after it has been called in, rather than before either.",
      turn: { turns: 0.25, axis: "y", label: "SERVICE VALVE — CURB BOX" },
    },
    {
      id: "watch", kind: "track", target: "monitor-probe", seconds: 6,
      title: "Hold a sample on the hole while it is logged",
      cue: "Keep the aspirator pulling steadily — not so hard it draws the hole down, not so slow it never clears.",
      why: "A logged reading has to be a repeatable one, which means the sample rate on this hole has to match the rate on the last. Squeeze too hard and the aspirator pulls fresh air in around the probe and reports a leak smaller than it is; too slow and the hose never clears, so every hole reads like the one before it. Steady is what makes three holes comparable, and comparable is the entire basis on which an extent gets drawn.",
      track: {
        start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.48, drift: 0.13, label: "ASPIRATOR RATE",
        readout: (v) => (v < 0.38 ? "hose not clearing" : v > 0.58 ? "drawing the hole down" : "steady draw"),
      },
      holdBreakNote: "Sample rate out of band — too slow and you are reading the last hole, too hard and you are reading the street. Bring it back and hold it there.",
    },
    {
      id: "extent", kind: "find",
      targets: ["clean-barhole", "manhole-lid", "frost-cap"],
      itemNames: { "clean-barhole": "the outermost hole that reads clean", "manhole-lid": "the manhole on the lateral", "frost-cap": "the frozen and overlaid cap" },
      itemNotes: {
        "clean-barhole": "The edge of a leak is a hole that reads nothing with a hole that reads something inboard of it. Without one of these the survey has no outside, and the repair crew has nowhere to stop digging.",
        "manhole-lid": "A manhole on a lateral that crosses the trench is a collection point and a confined space with an ignition risk in it. It gets read from the surface through the pick hole — it does not get lifted, and it certainly does not get entered on this call.",
        "frost-cap": "Frozen ground under a fresh overlay is a lid. The gas cannot come up through it, so it runs sideways underneath and surfaces at the first break — which is why a reading two properties away is usually not a second leak, it is this one, arriving.",
      },
      title: "Prove the extent before you hand it over",
      cue: "Find the three things that tell the next crew where this leak ends.",
      why: "An extent is what turns a reading into a work order. It is the outermost clean hole, the structures and voids the gas could have reached on the way, and the surface condition that explains why it went where it went. Handed over without those, the repair crew arrives knowing only that somewhere near this address there is gas, which is exactly what the caller told the control room hours ago.",
    },
    {
      id: "grade", kind: "select", target: "grade-board",
      title: "Assign the grade the procedure gives",
      cue: "Take the readings and their locations to the grading procedure and read the grade off it.",
      why: "The grade is not a judgement about how bad it smells or how experienced you are; it is the output of a table the operator wrote and files against, keyed on where the gas was found and what it is near. The same reading in open soil at the kerb and against an occupied foundation produce different grades, different response times and different re-check intervals, and the whole value of writing it this way is that the next person can reproduce your answer from your readings.",
    },
    {
      id: "handover", kind: "sequence",
      targets: ["leak-record", "repair-radio", "site-watch"],
      itemNames: { "leak-record": "readings, sketch and grade recorded", "repair-radio": "passed to gas control and the repair crew", "site-watch": "site left guarded and lit" },
      title: "Record it, pass it, and stay with it",
      cue: "Write it up, call it through with the grade and the extent, and leave the site watched.",
      why: "The record is the leak's only memory: the readings, the locations, the grade, the sketch of the bar hole pattern and the time each hole was taken. It is what the re-check is measured against and what an investigator reads if this street ever makes the news. Passing it by voice as well as in writing means the crew arrives already knowing the grade, and the site stays guarded because a barricade on its own never stopped the one person who decides the tape does not apply to them.",
      outOfOrderNote: "Wrong order — record it, then pass it, then set the watch. Calling in a grade you have not written down yet is how two different numbers end up in two different systems for the same leak.",
    },
  ],

  interrupts: [
    {
      id: "van-on-the-trench",
      kind: "Vehicle on the leak",
      after: "barholes", delay: 3, seconds: 12,
      alert: "A contractor's van has pulled onto the verge beside your bar holes and left the engine running while the driver gets out to see what you are doing.",
      cue: "There is a hot exhaust standing over the trench line.",
      target: "idling-van",
      why: "An idling vehicle parked over a venting trench puts a starter, an alternator and an exhaust system at ground level in the gas, and the driver is about to walk across your pattern and stand in it. Getting that van moved and shut down is worth more in this minute than any reading you could have taken while it was there.",
      missNote: "The van stayed where it was with the engine running for the rest of the survey, parked over a trench your own bar holes had just shown to be venting. Nothing happened, which is the only outcome you can report and the one that tells you least: the exhaust was hot, the ground was gassy, and the margin was somebody else's luck rather than anything you did.",
      wrongNote: "That is not what has arrived. The van is running, it is on the verge over the trench, and it is the thing that has to move.",
    },
    {
      id: "bell-push",
      kind: "Occupant at the door",
      after: "curb-valve", delay: 3, seconds: 12,
      alert: "The householder has come back up onto the porch and has her hand on the bell push, about to call her neighbour out to see what the crew is doing.",
      cue: "Somebody is reaching for a switch on a wall you have just found gas against.",
      target: "occupant",
      why: "A bell push is a switch and every switch arcs. It is on the outside wall of the building whose foundation hole has just read, feet from a water service sleeve the gas has a path to — and the person about to press it is the one you evacuated ten minutes ago. Intercepting her is the entire job right now; the valve can wait the thirty seconds it takes.",
      missNote: "She pressed the bell. Nothing came of it, and nothing coming of it is not evidence that it was safe — it is evidence that the concentration at that wall at that second happened to fall on the wrong side of the range that burns. Evacuated occupants come back for pets, phones and coats, and the crew that evacuated them is the only thing standing between them and the switches on their own house.",
      wrongNote: "That is not the problem in front of you. There is a person on the porch with a finger on a switch.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GLS_ACCENT);

    // ------------------------------------------------------------ the street
    // Everything below grade is cut into a raised road apron rather than into
    // the plaza deck, which is a solid disc from y -0.30 to 0 — a bar hole sunk
    // into the deck itself would be invisible and still clickable, which is the
    // worst of both. See the note beside the deck in stage.js.
    const ROAD = 0.3;
    const road = group(g, -0.2, 0, -0.5);
    box(road, 5.6, ROAD, 4.0, 0, ROAD / 2, 0, 0x33383d,
      { rough: 0.98, finish: "concrete", tile: [6, 4] });
    box(road, 5.6, 0.12, 0.22, 0, ROAD + 0.06, -1.95, 0x9aa0a4, { rough: 0.95, finish: "concrete", tile: [7, 1] });
    box(road, 5.6, 0.06, 0.26, 0, ROAD + 0.03, 1.97, 0x8a9094, { rough: 0.95, finish: "concrete", tile: [7, 1] });
    for (const sx of [-1, 1]) box(road, 0.2, 0.09, 4.0, sx * 2.7, ROAD + 0.045, 0, 0x8a9094, { rough: 0.95, finish: "concrete", tile: [1, 5] });
    for (let i = -3; i <= 3; i++) {
      box(road, 0.42, 0.006, 0.09, i * 0.78, ROAD + 0.004, 1.35, 0xd8d2b8, { rough: 0.85, cast: false });
    }

    // The trench scar over the main: a strip of newer, darker patching with a
    // saw-cut lip either side. This is the migration path and it has to read as
    // a different surface from three metres away.
    const trench = group(g, -0.2, ROAD, 0.2);
    const mainScar = box(trench, 5.2, 0.014, 0.56, 0, 0.007, 0, 0x4d4338,
      { rough: 1.0, finish: "concrete", tile: [6, 1] });
    for (const sz of [-1, 1]) box(trench, 5.2, 0.02, 0.03, 0, 0.01, sz * 0.3, 0x20242a, { rough: 0.95, cast: false });
    holoTag(trench, "Trench over the main — backfill", -1.0, 0.5, 0.42, { css: "#f6a623", w: 0.56 });
    reg(hits, mainScar, "main-trench");

    // Service trench teeing off the main and running under the footway.
    box(g, 0.34, 0.014, 2.1, -0.8, ROAD + 0.007, -0.85, 0x4d4338,
      { rough: 1.0, finish: "concrete", tile: [1, 2] });

    // Sewer lateral crossing the trench, and the manhole it runs back to.
    const lateral = group(g, 1.25, ROAD, -0.6);
    const latScar = box(lateral, 0.3, 0.014, 2.3, 0, 0.007, 0, 0x574a3c,
      { rough: 1.0, finish: "concrete", tile: [1, 2] });
    latScar.rotation.y = 0.22;
    holoTag(lateral, "Sewer lateral", 0.3, 0.46, 0.5, { css: "#8fa9c4", w: 0.3 });
    reg(hits, latScar, "sewer-lateral");
    const manhole = group(g, 1.75, ROAD, 0.95);
    cyl(manhole, 0.33, 0.33, 0.035, 0, 0.018, 0, 0x4a4f54, { rough: 0.9, metal: 0.4, seg: 24 });
    torus(manhole, 0.33, 0.022, 0, 0.012, 0, 0x2f343a, { rough: 0.95, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box(manhole, 0.16, 0.008, 0.05, Math.sin(a) * 0.17, 0.038, Math.cos(a) * 0.17, 0x3a4046, { rough: 0.9, cast: false }).rotation.y = a;
    }
    ball(manhole, 0.02, 0.2, 0.04, 0, 0x14181c, { rough: 0.95, seg: 8 });
    holoTag(manhole, "Manhole — pick hole only", 0, 0.5, 0, { css: "#8fa9c4", w: 0.46 });
    reg(hits, manhole, "manhole-lid");

    // Water service curb box, and the sleeve it goes through the wall in.
    const waterBox = group(g, -2.0, ROAD, -0.4);
    cyl(waterBox, 0.1, 0.1, 0.03, 0, 0.015, 0, 0x5f666c, { rough: 0.85, metal: 0.45, seg: 16 });
    cyl(waterBox, 0.075, 0.075, 0.012, 0, 0.036, 0, 0x7d858c, { rough: 0.7, metal: 0.6, seg: 14 });
    box(waterBox, 0.22, 0.012, 1.3, 0.12, 0.008, -0.8, 0x4f4a42, { rough: 1.0, cast: false });
    holoTag(waterBox, "Water service + sleeve", 0, 0.42, 0, { css: "#4fa3ff", w: 0.46 });
    reg(hits, waterBox, "water-service");

    // The frozen, overlaid cap that stops the gas surfacing where it leaked.
    const cap = group(g, 1.1, ROAD, 1.45);
    const capPatch = box(cap, 1.5, 0.016, 0.9, 0, 0.008, 0, 0x3b444c, { rough: 0.4, finish: "concrete", tile: [2, 1] });
    capPatch.rotation.y = 0.04;
    for (const sx of [-1, 1]) box(cap, 0.02, 0.02, 0.9, sx * 0.75, 0.012, 0, 0x1c2026, { rough: 0.9, cast: false });
    decal(cap, 0.7, 0.2, 0, 0.019, 0.3, signFace("OVERLAY", { bg: "#2a3138", accent: "#8fa9c4", fg: "#cfd9e2", scale: 0.5 }), { px: 192, rough: 0.9 })
      .rotation.x = -Math.PI / 2;
    holoTag(cap, "Frozen ground under new overlay", 0, 0.52, 0, { css: "#8fa9c4", w: 0.62 });
    reg(hits, cap, "frost-cap");

    // ---------------------------------------------------------- the bar holes
    // Each is a recessed sleeve with a raised collar, so it reads as a hole in
    // the road rather than as a dark dot painted on it.
    function barHole(x, z, label, css) {
      const b = group(g, x, ROAD, z);
      torus(b, 0.075, 0.016, 0, 0.012, 0, 0x6d747a, { rough: 0.8, metal: 0.3, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
      cyl(b, 0.058, 0.05, 0.26, 0, -0.13, 0, 0x14171a, { rough: 1.0, seg: 14, cast: false });
      cyl(b, 0.062, 0.062, 0.01, 0, 0.004, 0, 0x22262a, { rough: 1.0, seg: 16, cast: false });
      holoTag(b, label, 0, 0.42, 0, { css, w: 0.36 });
      return b;
    }
    reg(hits, barHole(-0.8, 0.2, "Bar hole 1 — over the main", "#f6a623"), "barhole-main");
    reg(hits, barHole(-0.8, -0.75, "Bar hole 2 — along the trench", "#f6a623"), "barhole-trench");
    reg(hits, barHole(-0.8, -1.7, "Bar hole 3 — at the wall", "#f0645b"), "barhole-wall");
    reg(hits, barHole(1.95, -0.1, "Bar hole 4 — reads clean", "#59c97b"), "clean-barhole");
    // The bar itself, stood in the last hole.
    const bar = cyl(g, 0.014, 0.014, 1.5, 1.95, ROAD + 0.68, -0.1, 0x7d858c, { rough: 0.5, metal: 0.7, seg: 10 });
    bar.rotation.z = 0.16;
    box(g, 0.2, 0.03, 0.04, 2.06, ROAD + 1.4, -0.1, 0x3a4046, { rough: 0.7 });

    // Gas venting at the source hole, which the survey exists to measure.
    const vent = particles(g, 26, 0xcfd8e2, { size: 0.035, life: 1.0, additive: false, opacity: 0.2 });
    vent.position.set(-0.8, ROAD + 0.06, 0.2);

    // ---------------------------------------------------------- the building
    // The address the odour was reported from, kept to the -z side so the walk
    // in from the gate looks across the work rather than into a wall.
    const house = group(g, -0.7, 0, -3.1);
    box(house, 4.6, 3.0, 0.3, 0, 1.5, 0, 0x8d6a52, { rough: 0.95, finish: "concrete", tile: [6, 4] });
    box(house, 4.9, 0.22, 0.5, 0, 3.08, 0.04, 0x6f5744, { rough: 0.9, finish: "concrete", tile: [6, 1] });
    box(house, 4.6, 0.36, 0.38, 0, 0.18, 0.06, 0x6a6560, { rough: 1.0, finish: "concrete", tile: [6, 1] });
    for (const dx of [-1.6, 1.35]) {
      box(house, 0.8, 0.9, 0.04, dx, 1.85, 0.17, 0x1b232b, { rough: 0.25, metal: 0.2 });
      box(house, 0.88, 0.06, 0.08, dx, 1.34, 0.19, 0xd9d2c4, { rough: 0.9 });
    }
    const porch = group(house, 0.0, 0, 0.3);
    box(porch, 1.3, 0.14, 0.7, 0, 0.07, 0.3, 0x9a958c, { rough: 0.95, finish: "concrete", tile: [2, 1] });
    box(porch, 0.86, 2.0, 0.07, 0, 1.14, 0.0, 0x33475a, { rough: 0.55, metal: 0.15, finish: "painted" });
    cyl(porch, 0.022, 0.022, 0.1, 0.32, 1.1, 0.06, 0xc9a24a, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) cyl(porch, 0.055, 0.055, 2.3, sx * 0.62, 1.15, 0.62, 0xd7d2c6, { rough: 0.9, seg: 12 });
    box(porch, 1.5, 0.14, 0.9, 0, 2.34, 0.4, 0x6f5744, { rough: 0.9, finish: "concrete", tile: [2, 1] });
    const bell = box(porch, 0.06, 0.09, 0.035, 0.52, 1.16, 0.035, 0xe8e2d6, { rough: 0.5 });
    ball(porch, 0.014, 0.52, 1.18, 0.055, 0xf0645b, { emissive: 0xf0645b, ei: 1.4 });
    holoTag(porch, "Ring the bell to warn them?", 0.52, 1.5, 0.08, { css: "#d2312b", w: 0.56 });
    reg(hits, bell, "doorbell");

    // Cellar steps down the side, where an inside reading tempts you in.
    const cellar = group(house, -1.95, 0, 0.42);
    box(cellar, 0.9, 0.18, 1.0, 0, 0.09, 0, 0x7a746c, { rough: 0.98, finish: "concrete", tile: [1, 1] });
    for (let i = 0; i < 3; i++) {
      box(cellar, 0.8, 0.02, 0.24, 0, 0.1 - i * 0.14, -0.06 + i * 0.26, 0x2a2e33, { rough: 1.0, cast: false });
    }
    box(cellar, 0.86, 0.9, 0.05, 0, 0.55, -0.5, 0x4a4238, { rough: 0.8, finish: "painted" }).rotation.x = -0.5;
    const cellarTrap = box(cellar, 0.85, 1.2, 0.9, 0, 0.6, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cellar, "Go down and find where it comes in?", 0, 1.3, 0.2, { css: "#d2312b", w: 0.7 });
    reg(hits, cellarTrap, "basement-entry");

    // Meter set on the wall — downstream of it the fuel-gas code takes over.
    const meterSet = group(house, 1.9, 0, 0.26);
    box(meterSet, 0.34, 0.4, 0.22, 0, 0.95, 0, 0xb8bcc0, { rough: 0.6, metal: 0.4, finish: "galvanised" });
    cyl(meterSet, 0.022, 0.022, 0.85, -0.12, 0.5, 0.02, 0xc5b358, { rough: 0.45, metal: 0.7, seg: 10 });
    cyl(meterSet, 0.022, 0.022, 0.5, 0.12, 1.35, 0.02, 0xc5b358, { rough: 0.45, metal: 0.7, seg: 10 });
    decal(meterSet, 0.2, 0.09, 0, 1.22, 0.12, signFace("METER SET", { bg: "#1b2129", accent: "#f6a623", scale: 0.5 }), { px: 192, rough: 0.8 });
    holoTag(meterSet, "Customer piping from here in", 0, 0.62, 0.16, { css: "#8fa9c4", w: 0.56 });

    // The foundation hole's own probe and readout.
    const wallProbe = instrument(g, -1.5, 0.95, -2.62, { ry: 0.25, idle: "----", color: 0xf6a623, w: 0.14, d: 0.2 });
    cyl(g, 0.01, 0.01, 0.9, -1.5, 0.5, -2.5, 0x2b3138, { rough: 0.6, seg: 8, cast: false });
    holoTag(g, "Foundation probe", -1.5, 1.2, -2.62, { css: "#f0645b", w: 0.36 });
    reg(hits, wallProbe, "wall-probe");

    // ------------------------------------------------------ instrument and kit
    const zeroStand = group(g, 2.45, 0, 1.55, -0.6);
    for (let i = 0; i < 3; i++) {
      const leg = cyl(zeroStand, 0.012, 0.016, 1.0, Math.sin(i * 2.1) * 0.16, 0.5, Math.cos(i * 2.1) * 0.16, 0x6d747a, { rough: 0.5, metal: 0.6, seg: 8 });
      leg.rotation.x = Math.cos(i * 2.1) * 0.16;
      leg.rotation.z = -Math.sin(i * 2.1) * 0.16;
    }
    slab(zeroStand, 0.2, 0.3, 0.1, 0, 1.12, 0, 0xf6a623, { radius: 0.02, rough: 0.5 });
    const cgiScreen = decal(zeroStand, 0.15, 0.09, 0, 1.2, 0.055,
      signFace("ZERO", { bg: "#1c1408", accent: "#f6a623", fg: "#ffe3ac", scale: 0.55 }), { px: 256, glow: true, ei: 0.9 });
    const zeroBtn = box(zeroStand, 0.05, 0.03, 0.04, 0, 1.0, 0.055, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.5 });
    holoTag(zeroStand, "Zero in clean air — upwind", 0, 1.48, 0, { css: "#59c97b", w: 0.58 });
    reg(hits, zeroBtn, "cgi-zero");

    const cgiMeter = instrument(g, -1.55, 0.92, 0.35, { ry: -0.45, idle: "----", color: 0xf6a623, w: 0.15, d: 0.22 });
    cyl(g, 0.011, 0.011, 0.86, -1.55, 0.47, 0.35, 0x2b3138, { rough: 0.6, seg: 8, cast: false });
    holoTag(g, "Combustible gas indicator", -1.55, 1.18, 0.35, { css: "#f6a623", w: 0.52 });
    reg(hits, cgiMeter, "cgi-meter");
    const zeroTrap = box(g, 0.4, 0.5, 0.4, -1.12, 0.62, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Zero the instrument here?", -1.12, 1.02, -0.35, { css: "#d2312b", w: 0.52 });
    reg(hits, zeroTrap, "zero-at-leak");

    // Aspirator squeeze bulb and hose, run into the source hole.
    const asp = group(g, -1.9, 0, 0.9, 0.4);
    ball(asp, 0.075, 0, 0.82, 0, 0x2f3740, { rough: 0.85, seg: 14 });
    cyl(asp, 0.012, 0.012, 0.16, 0, 0.72, 0, 0x2b3138, { rough: 0.7, seg: 8 });
    cyl(asp, 0.016, 0.02, 0.7, 0, 0.35, 0, 0x545c64, { rough: 0.6, metal: 0.4, seg: 10 });
    holoTag(asp, "Aspirator", 0, 1.02, 0, { css: "#4fd1ff", w: 0.24 });
    reg(hits, asp, "monitor-probe");

    // The curb box with the gas service valve in it.
    const curb = group(g, -2.25, ROAD, 0.9);
    cyl(curb, 0.13, 0.13, 0.05, 0, 0.025, 0, 0x5f666c, { rough: 0.85, metal: 0.45, seg: 18 });
    cyl(curb, 0.1, 0.1, 0.34, 0, -0.17, 0, 0x2a2e33, { rough: 1.0, seg: 14, cast: false });
    const keyPivot = group(curb, 0, 0.06, 0);
    cyl(keyPivot, 0.014, 0.014, 0.95, 0, 0.47, 0, 0xb8402f, { rough: 0.6, metal: 0.4, seg: 10 });
    box(keyPivot, 0.3, 0.028, 0.028, 0, 0.95, 0, 0xb8402f, { rough: 0.6 });
    holoTag(curb, "Service valve — curb box", 0, 1.22, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, keyPivot, "curb-valve");

    // -------------------------------------------------------------- the truck
    const truck = group(g, 2.7, 0, -1.5, -0.35);
    box(truck, 1.15, 0.85, 2.3, 0, 1.12, 0, 0xe8e4dc, { rough: 0.55, metal: 0.25, finish: "painted", tile: [1, 2] });
    box(truck, 1.1, 0.7, 0.95, 0, 1.5, 0.82, 0xe8e4dc, { rough: 0.55, metal: 0.25, finish: "painted" });
    box(truck, 1.02, 0.4, 0.05, 0, 1.62, 1.31, 0x1d2830, { rough: 0.2, metal: 0.3 });
    box(truck, 1.25, 0.22, 2.4, 0, 0.62, 0, 0x2b3138, { rough: 0.8, metal: 0.35 });
    for (const sz of [-0.75, 0.78]) for (const sx of [-1, 1]) {
      cyl(truck, 0.27, 0.27, 0.2, sx * 0.6, 0.29, sz, 0x15181c, { rough: 0.95, seg: 16 }).rotation.z = Math.PI / 2;
    }
    for (const sz of [-0.5, 0.2]) box(truck, 0.06, 0.5, 0.6, -0.6, 1.15, sz, 0xb9c0c6, { rough: 0.45, metal: 0.6 });
    decal(truck, 0.9, 0.3, 0.6, 1.3, 0, signFace("GAS EMERGENCY", { bg: "#f6a623", accent: "#1b2129", fg: "#1b2129", scale: 0.4 }), { px: 320, rough: 0.7 })
      .rotation.y = Math.PI / 2;
    const beacon = ball(truck, 0.07, 0, 1.92, 0.7, 0xf6a623, { emissive: 0xf6a623, ei: 2.2, rough: 0.4 });
    beacon.material = mat(0xf6a623, { emissive: 0xf6a623, ei: 2.2, rough: 0.4 }).clone();
    beacon.material.userData.ownMaterial = true;
    holoTag(truck, "Service truck — parked upwind", 0, 2.25, 0, { css: "#f6a623", w: 0.62 });
    reg(hits, truck, "park-upwind");
    const killSwitch = box(truck, 0.12, 0.16, 0.08, -0.62, 1.12, 0.78, 0xd8232a, { rough: 0.5 });
    holoTag(truck, "Engine + heater off", -0.72, 0.86, 0.78, { css: "#8fa9c4", w: 0.4 });
    reg(hits, killSwitch, "engine-off");
    const keys = box(truck, 0.05, 0.03, 0.09, -0.4, 1.4, 1.0, 0xc9a24a, { rough: 0.4, metal: 0.6 });
    holoTag(truck, "Start it and pull it closer?", -0.4, 1.64, 1.05, { css: "#d2312b", w: 0.58 });
    reg(hits, keys, "truck-start");
    const isKit = slab(truck, 0.4, 0.2, 0.3, 0.1, 1.68, -1.05, 0x1f7ae0, { radius: 0.02, rough: 0.5 });
    holoTag(truck, "Intrinsically safe kit", 0.1, 1.48, -1.2, { css: "#4fd1ff", w: 0.44 });
    reg(hits, isKit, "is-kit");
    const callBox = group(truck, 0.68, 1.42, 0.3);
    box(callBox, 0.16, 0.24, 0.1, 0, 0, 0, 0xd8232a, { rough: 0.5, finish: "painted" });
    ball(callBox, 0.022, 0, 0.09, 0.055, 0xffd9a0, { emissive: 0xffd9a0, ei: 1.6 });
    holoTag(truck, "Evacuate + call it in", 0.78, 1.72, 0.3, { css: "#f0645b", w: 0.44 });
    reg(hits, callBox, "evacuate-call");
    const handset = box(truck, 0.07, 0.15, 0.05, 0.68, 1.1, -0.15, 0x2b3138, { rough: 0.7 });
    cyl(truck, 0.008, 0.008, 0.26, 0.68, 1.3, -0.15, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(truck, "Gas control + repair crew", 0.78, 0.92, -0.15, { css: "#59c97b", w: 0.5 });
    reg(hits, handset, "repair-radio");

    // ------------------------------------------------ paperwork and the grade
    const ticket = holoPanel(g, 0.56, 0.4, 2.35, 1.55, 0.55, (cx, w, h) => {
      cx.fillStyle = "rgba(8,14,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f6a623"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c2a06a";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ODOUR REPORT · TICKET 4471", w * 0.06, h * 0.13);
      cx.fillStyle = "#f4e7cf";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("GAS SMELLED OUTDOORS", w * 0.06, h * 0.31);
      cx.fillStyle = "#cfc0a4";
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Caller: occupant, 14 Ferris Row", "Smelled at the front path, 06:40",
       "Still there when she left, 07:15", "Cast iron main, 1961, under carriageway",
       "Ground frozen, overlay laid in spring", "No inside odour reported"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: -0.5, accent: GLS_ACCENT });
    reg(hits, ticket, "odour-ticket");

    const gradeBoard = holoPanel(g, 0.54, 0.4, 1.35, 1.5, 1.85, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fc9a6";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("OPERATOR LEAK GRADING PROCEDURE", w * 0.06, h * 0.13);
      cx.fillStyle = "#e6f6ec";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Grade is set by LOCATION first:", "· open soil, clear of structures",
       "· under pavement or a sealed cap", "· at or under a building wall",
       "· inside a structure — evacuate", "then by reading, then by re-check interval.",
       "Read the grade off the table. Do not estimate it."]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.3 + i * h * 0.095));
    }, { ry: -0.3, accent: 0x59c97b });
    reg(hits, gradeBoard, "grade-board");

    const record = group(g, -2.45, 0, 1.7, 0.7);
    cyl(record, 0.03, 0.035, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 12 });
    const sheet = decal(record, 0.4, 0.5, 0, 1.2, 0,
      paperFace("LEAK RECORD", ["BAR HOLE 1 — OVER MAIN", "BAR HOLE 2 — TRENCH", "BAR HOLE 3 — WALL",
        "BAR HOLE 4 — CLEAN", "SKETCH + TIMES", "GRADE: ____"], { worn: true }), { px: 320 });
    sheet.rotation.x = -0.25;
    holoTag(record, "Leak record", 0, 1.56, 0, { css: "#f6a623", w: 0.3 });
    reg(hits, record, "leak-record");

    // The guard beacon left standing with the site.
    const watch = group(g, 0.55, 0, 2.15);
    cyl(watch, 0.14, 0.2, 0.08, 0, 0.04, 0, 0x2b3138, { rough: 0.9, seg: 14 });
    cyl(watch, 0.03, 0.03, 0.9, 0, 0.48, 0, 0x6d747a, { rough: 0.5, metal: 0.6, seg: 10 });
    const watchLamp = cyl(watch, 0.075, 0.075, 0.12, 0, 1.0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.0, rough: 0.4, seg: 14 });
    watchLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.0, rough: 0.4 }).clone();
    watchLamp.material.userData.ownMaterial = true;
    holoTag(watch, "Site watch", 0, 1.26, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, watch, "site-watch");

    // -------------------------------------------------------- traffic control
    const barricade = barrierPanel(g, 2.05, 2.25, { color: 0xe4622a, ry: 0.3 });
    holoTag(g, "Barrier — carry it across", 2.05, 1.22, 2.25, { css: "#f2894b", w: 0.5 });
    reg(hits, barricade, "barricade");
    const socket = group(g, -0.5, ROAD, 1.9);
    for (let i = -2; i <= 2; i++) {
      box(socket, 0.26, 0.012, 0.06, i * 0.4, 0.008, 0, 0xe4622a, { emissive: 0xe4622a, ei: 0.5, cast: false });
    }
    holoTag(socket, "Street approach", 0, 0.46, 0, { css: "#f2894b", w: 0.36 });
    hits["street-socket"] = socket;
    for (const [cx2, cz] of [[-1.85, 1.75], [0.9, 1.95]]) cone(g, cx2, cz, { color: 0xe4622a });

    // The smell, which is not where the gas is.
    const odourTrap = box(g, 0.7, 1.2, 0.7, 1.6, 0.9, -1.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Strongest smell — dig here?", 1.6, 1.7, -1.85, { css: "#d2312b", w: 0.56 });
    reg(hits, odourTrap, "odour-plume");
    const drift = particles(g, 20, 0xb9c7cf, { size: 0.045, life: 1.3, additive: false, opacity: 0.14 });
    drift.position.set(1.6, 0.7, -1.7);

    // ------------------------------------------------------ the interrupters
    const van = group(g, -3.0, 0, 2.55, 0.5);
    box(van, 0.95, 0.9, 1.9, 0, 1.05, 0, 0x4f7fa8, { rough: 0.5, metal: 0.3, finish: "painted", tile: [1, 2] });
    box(van, 0.9, 0.55, 0.7, 0, 1.28, 1.18, 0x4f7fa8, { rough: 0.5, metal: 0.3, finish: "painted" });
    box(van, 0.84, 0.32, 0.05, 0, 1.36, 1.54, 0x1d2830, { rough: 0.2, metal: 0.3 });
    for (const sz of [-0.62, 1.0]) for (const sx of [-1, 1]) {
      cyl(van, 0.22, 0.22, 0.16, sx * 0.5, 0.24, sz, 0x15181c, { rough: 0.95, seg: 14 }).rotation.z = Math.PI / 2;
    }
    const vanLamp = ball(van, 0.03, 0.34, 0.52, -0.96, 0xf0645b, { emissive: 0xf0645b, ei: 0.4, rough: 0.4 });
    vanLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 0.4, rough: 0.4 }).clone();
    vanLamp.material.userData.ownMaterial = true;
    holoTag(van, "Contractor's van", 0, 1.86, 0, { css: "#8fa9c4", w: 0.36 });
    reg(hits, van, "idling-van");
    const exhaust = particles(g, 18, 0x9aa4ad, { size: 0.03, life: 0.7, additive: false, opacity: 0.3 });
    exhaust.position.set(-2.6, 0.2, 1.7);

    toolChest(g, 2.05, 0.35, { ry: -0.4 });

    // The second technician, who took the reading at the cellar doorway, and
    // the householder. Both spots came out of the built scene rather than off
    // a guess — see tools/check_layout.mjs's crew clearance rule.
    const tech = standingFigure(g, -2.6, -1.15, { ry: 1.2, cloth: 0x2f6f8c, vest: 0xf6a623, helmet: 0xf2f2f2 });
    holoTag(g, "Second technician — at the door", -2.6, 2.05, -1.15, { css: "#f6a623", w: 0.62 });
    void tech;
    const occupant = standingFigure(g, 0.78, -2.2, { ry: 0.2, cloth: 0x7a4a6a, trousers: 0x33384a });
    holoTag(g, "Householder", 0.78, 2.0, -2.2, { css: "#8fa9c4", w: 0.3 });
    reg(hits, occupant, "occupant");

    let venting = true, smoking = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.5, 1.2, -1.0),

      onStepComplete(step) {
        if (step.id === "zero") {
          repaint(cgiScreen, signFace("ZEROED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        }
        if (step.id === "inside") {
          // The building really empties: the householder walks out to the kerb.
          occupant.position.set(2.35, 0, 0.95);
          occupant.rotation.y = 2.6;
          repaint(sheet, paperFace("LEAK RECORD", ["INSIDE READING — EVACUATED",
            "OCCUPANTS OUT 07:52", "GAS CONTROL NOTIFIED", "BAR HOLES 1-4 LOGGED",
            "SKETCH ATTACHED", "GRADE: ____"], { worn: true }));
        }
        if (step.id === "control") {
          socket.children.forEach((c) => {
            if (c.isMesh) c.material = mat(0xe4622a, { emissive: 0xe4622a, ei: 1.6, cast: false });
          });
        }
        if (step.id === "curb-valve") { keyPivot.rotation.y += Math.PI / 2; venting = false; }
        if (step.id === "grade") {
          repaint(gradeBoard.userData.face, signFace("GRADE CALLED\nON LOCATION", {
            bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.24,
          }));
        }
        if (step.id === "handover") watchLamp.material.emissiveIntensity = 3.0;
      },

      // Both interruptions change the street rather than the banner: the van
      // drives onto the verge with its exhaust running, and the householder
      // walks back up onto her own porch. See tools/interrupt_react.mjs.
      onInterrupt(it) {
        if (it.id === "van-on-the-trench") {
          van.position.set(-1.8, 0, 1.4);
          van.rotation.y = 1.1;
          vanLamp.material.emissiveIntensity = 2.6;
          exhaust.position.set(-1.8, 0.22, 2.3);
          smoking = true;
        }
        if (it.id === "bell-push") {
          occupant.position.set(-0.7, 0, -2.45);
          occupant.rotation.y = Math.PI;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "van-on-the-trench") {
          van.position.set(-3.3, 0, 3.0);
          van.rotation.y = 0.5;
          vanLamp.material.emissiveIntensity = 0.4;
          smoking = false;
        }
        if (it.id === "bell-push") {
          occupant.position.set(2.35, 0, 0.95);
          occupant.rotation.y = 2.6;
        }
      },

      onHazard(hitId) {
        // Reaching for an ignition source turns the truck beacon red: the
        // street is telling you it is still a gas call.
        if (hitId === "doorbell" || hitId === "truck-start") {
          beacon.material = mat(0xd8232a, { emissive: 0xd8232a, ei: 3.0, rough: 0.4 }).clone();
          beacon.material.userData.ownMaterial = true;
        }
        if (hitId === "zero-at-leak") {
          repaint(cgiScreen, signFace("ZERO IN GAS", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd7d2", scale: 0.42 }));
        }
      },

      animate(t, dt, session) {
        const step = session?.step;
        vent.visible = venting;
        if (venting) vent.userData.step(dt, new THREE.Vector3(0.18, 0.3, 0.14), 0.16, 0.5, 0.3);
        drift.visible = true;
        drift.userData.step(dt, new THREE.Vector3(0.35, 0.16, 0.2), 0.3, 0.35, 0.12);
        exhaust.visible = smoking;
        if (smoking) exhaust.userData.step(dt, new THREE.Vector3(0.1, 0.28, 0.3), 0.08, 0.5, 0.25);
        beacon.material.emissiveIntensity = 1.4 + Math.max(0, Math.sin(t * 3.1)) * 1.6;
        watchLamp.rotation.y += dt * 2.2;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "soil-read") {
          const inBand = gg.t > 0.34 && gg.t < 0.58;
          repaint(cgiMeter.userData.screen, signFace(inBand ? "SETTLED" : gg.t < 0.34 ? "RISING" : "FALLING", {
            bg: "#1c1408", accent: inBand ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.5,
          }));
        }
        if (gg && !gg.committed && step?.id === "wall-read") {
          const inBand = gg.t > 0.36 && gg.t < 0.6;
          repaint(wallProbe.userData.screen, signFace(inBand ? "AT WALL" : "WAIT", {
            bg: "#2a1408", accent: inBand ? "#59c97b" : "#f0645b", fg: "#ffd7b0", scale: 0.5,
          }));
        }
        if (step?.id === "watch" && session.track) {
          const v = session.track.v;
          const ok = v > 0.38 && v < 0.58;
          repaint(cgiMeter.userData.screen, signFace(ok ? "STEADY" : "RATE", {
            bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
