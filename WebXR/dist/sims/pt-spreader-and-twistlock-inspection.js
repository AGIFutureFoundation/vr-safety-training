import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, slab, hose, group, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Spreader & Twist-lock Inspection VR — Maritime & Ports, the
// port maintenance pack.
//
// A container spreader on its stands in the terminal's maintenance and repair
// bay: the ship-to-shore crane it came off is still working the vessel a few
// bays over, so the bay sits under a live boom and beside a live hustler lane.
// The learner is the ILWU maintenance and repair mechanic; the spreader is a
// below-the-hook lifting device and is inspected as one. Nothing here is a
// particular terminal — every spreader shop has a lane beside it and a crane
// above it, which is why the procedure is what it is.

const PTS_ACCENT = 0x3fa7c9;

export const SIM_PT_SPREADER_AND_TWISTLOCK_INSPECTION = {
  id: "pt-spreader-and-twistlock-inspection",
  index: "217",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair mechanic — spreader shop, PMA training programme, with IUOE crane maintenance",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE crane maintenance; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy; ASME B30.20 below-the-hook lifting devices; ASME B30.2 for the shop's overhead crane",
  name: "Spreader & Twist-lock Inspection",
  title: simTitle("Spreader & Twist-lock Inspection"),
  tagline: "A spreader on its stands: supply isolated and locked, stands proven under a live boom, every hose walked, a twist-lock cycled and measured, flippers checked, the telescope run on test power beside a hustler lane, an indicator caught lying, a new twist-lock fitted and torqued, and the spreader signed back to the crane",
  accent: PTS_ACCENT,
  accentCss: "#3fa7c9",
  parSeconds: 270,
  footprint: 2.6,
  badge: { id: "spreader-signed-back", name: "Spreader Signed Back", note: "Every corner proven, the indicator caught, the lane and the boom both answered, and the spreader handed back to the crane clean" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js):
  // the union's own line, not an invented hotline.
  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Spreader Shop",
    currency: "CONE",
    ranks: ["Shop Hand", "M&R Mechanic", "Spreader Tech", "Lead Mechanic", "Spreader Certified"],
    badges: [
      { id: "locked-before-reach", name: "Locked Before Reach", note: "The supply isolated, locked and tried before a hand went into a housing", test: AWARD.stepClean("isolate") },
      { id: "indicator-caught", name: "Indicator Caught", note: "The lying landed-and-locked indicator found before the spreader went back", test: AWARD.stepClean("indicator-check") },
      { id: "clear-of-everything", name: "Clear Of Everything", note: "Never under the boom, never in the lane, never a pin pulled under load", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections anywhere in the inspection", test: AWARD.clean },
      { id: "steady-telescope", name: "Steady Telescope", note: "Held the telescope rate in band for the whole run", test: AWARD.unbroken },
      { id: "shop-turnaround", name: "Shop Turnaround", note: "Spreader back to the crane inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "no-lockout-reach": "You reached into the twist-lock housing with the spreader's supply still live. A spreader's twist-locks are hydraulic or electric actuators that fire on a signal from a crane cab you cannot see into — 29 CFR 1910.147 exists because a hand in that housing is inside the machine, and the machine does not know you are there until it is isolated, locked and tried.",
    "flipper-pin-loaded": "You pulled the flipper's pivot pin while the flipper arm was still hanging on it. A flipper is a heavy steel arm with the whole of its weight on that pin; the moment the pin clears, the arm drops onto whatever is under it — the pin comes out only once the arm is cribbed or slung and the load is off it.",
    "under-headblock": "You walked under the headblock hanging on the shop crane. Nothing goes under a suspended load — not the headblock, not a boom, not a spreader — because a sheave pin or a wire rope does not announce that it is about to let go, and 29 CFR 1917 puts that rule on every crane in the terminal for exactly that reason.",
    "switch-jumper": "You jumpered the landed-pin switch to clear the fault. That switch is the only thing that tells the crane operator the spreader is actually sitting on the box before the twist-locks fire — a jumper makes the fault go away and makes the next lift a lift on unproven cones, which is how a container comes off a spreader mid-air.",
  },

  lateNotes: {
    "telescope-lever": "Nothing telescopes until the supply has been restored for the function test — the spreader is still locked out.",
    "retaining-bolts": "The retaining bolts are torqued once the replacement unit is seated in the corner, not before there is anything to hold.",
    "spreader-tag": "The spreader is signed back to the crane only after the new unit is fitted and torqued and the indicator fault is closed.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order-board",
      title: "Read the work order and the spreader's inspection history",
      cue: "Check what the crane crew reported, the last periodic inspection and which corner has the open fault.",
      why: "ASME B30.20 has a below-the-hook device inspected on a schedule and every time it comes in with a fault, and the two are different jobs: the work order says the crane crew saw a landed-and-locked light that did not agree with the corner, which is a fault that points at one corner and one switch, while the history says when the cones were last measured and which ones are already near their limit. Reading both first is what turns a shop visit into an inspection with a reason.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["isolator-handle", "lock-hasp", "try-control"],
      itemNames: { "isolator-handle": "spreader supply isolator", "lock-hasp": "your lock on the hasp", "try-control": "try the twist-lock control" },
      title: "Isolate the spreader's supply, lock it, and try it",
      cue: "Open the isolator on the supply from the headblock, hang your own lock on the hasp, then try the twist-lock control to prove it is dead.",
      why: "29 CFR 1910.147 puts the three moves in that order because each one proves the one before it: the isolator opens the supply, the lock keeps it open against anyone else in the shop, and the try is the only evidence that the isolator actually opened the circuit the twist-locks fire on rather than one that looked like it. A spreader that still answers its control after the lock is on is a spreader nobody should have a hand in, and the try is how that is found out while everyone is still standing back.",
      outOfOrderNote: "Isolator first, then your lock, then the try — the try proves the isolation, and a lock hung on a closed isolator proves nothing.",
    },
    {
      id: "stand-check", kind: "hold", target: "stand-chock", seconds: 4,
      title: "Prove the spreader is square on its stands",
      cue: "Hold the stand check: each stand plumb, each chock seated, the beams level on all four.",
      why: "A spreader on stands is a few tonnes of steel resting on four points, and the twist-lock and flipper work that follows puts a mechanic's weight and a pry bar's leverage on one end of it at a time. A stand that is not plumb or a chock that is not seated is the difference between a beam that takes that load and one that walks off the stand, and the check is held long enough to look at all four rather than the two nearest the door.",
      holdBreakNote: "Released before all four stands were checked — a spreader is square on four stands or it is not square at all. Start the check again.",
    },
    {
      id: "hose-walk", kind: "find", noHint: true,
      targets: ["chafed-hose"],
      itemNames: { "chafed-hose": "chafed hydraulic hose at the beam guide" },
      itemNotes: { "chafed-hose": "The hose on the inner beam's guide has worn through its outer cover where the beam telescopes across it — the braid is showing, and the next full extension would open it." },
      title: "Walk the hydraulic hoses and the loom",
      cue: "Follow every hose from the power pack to its actuator: chafe at the guides, kinks at the corners, weeps at the fittings.",
      why: "The hoses on a telescoping spreader move every time the beams do, which is dozens of times an hour on a working crane, and they chafe at exactly the guides the beams slide through. A hose that lets go under pressure sprays fluid across a hot power pack and drops a twist-lock actuator to whatever state it fails into — the walk finds the one hose that is one extension away from that while it is still a hose and not an incident.",
    },
    {
      id: "cycle-twistlock", kind: "turn", target: "twistlock-handle",
      title: "Cycle the twist-lock by hand through lock and unlock",
      cue: "Turn the cone through its quarter turn each way — it should move freely to both stops without binding or slop.",
      why: "A twist-lock that binds part-way through its quarter turn is a cone that will stop part-way on the crane too, and the indicator will call it locked while it sits across the corner casting half engaged. Cycling it by hand with the supply dead is the only way to feel the binding a working actuator would simply force through, and the slop at the stops is what tells you the shaft bushing is on its way out before the cone starts to lean in the casting.",
      turn: { turns: 0.25, label: "TWIST-LOCK", readout: (t) => (t < 0.12 ? "unlocked" : t < 0.24 ? "turning" : "locked") },
    },
    {
      id: "cone-wear", kind: "gauge", target: "wear-gauge",
      title: "Measure the twist-lock cone against the go/no-go gauge",
      cue: "Set the wear gauge on the cone and commit the reading inside the manufacturer's band.",
      why: "A twist-lock cone wears where it bears on the corner casting, and a cone that has worn past the manufacturer's limit still locks, still shows locked, and still lifts the box — right up to the lift where the worn shoulder pulls through the casting. ASME B30.20 makes wear a measured figure against a stated limit because the eye cannot see the difference between a cone with service left in it and one that has none, and the gauge is what makes the discard decision a number rather than an opinion.",
      gauge: { label: "CONE WEAR", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${(t * 6).toFixed(1)} mm`, missNote: "Outside the band — measure again with the gauge seated square on the cone's shoulder, not rocked onto the point." },
    },
    {
      id: "flippers", kind: "sequence", anyOrder: true,
      targets: ["flipper-left", "flipper-right"],
      itemNames: { "flipper-left": "left flipper pivot and bushing", "flipper-right": "right flipper pivot and bushing" },
      title: "Check the flipper pivots, pins and bushings",
      cue: "Lift each flipper through its arc: the pin retained, the bushing without play, the arm not bent.",
      why: "The flippers are the guides that centre the spreader on the box, and they take every side-load the crane operator's approach puts on the corners. A flipper with a worn bushing wanders, a bent flipper guides the spreader onto the casting off-centre, and a pin that has lost its retainer is one lift away from dropping the arm onto the lashing gang below — all three are found by moving the arm through its arc by hand, and none of them are found by looking at it from the floor.",
    },
    {
      id: "restore-for-test", kind: "select", target: "isolator-handle",
      title: "Clear the spreader and restore the supply for the function test",
      cue: "Everyone clear of the beams and corners, your lock off, the isolator closed — the spreader is live again for the test only.",
      why: "The telescope and the indicator checks that follow need the spreader powered, and the moment the isolator closes it is a machine again: the beams can extend across the bay and the twist-locks can fire on a signal. Restoring the supply is a deliberate step with a head count before it — the same head count 29 CFR 1910.147 requires before any lock comes off — because the person most likely to be in the machine when it wakes up is the mechanic who was just working inside it.",
    },
    {
      id: "telescope-run", kind: "track", target: "telescope-lever", seconds: 6,
      title: "Telescope the beams out and back on test power",
      cue: "Run the beams from twenty to forty and back, steady on the lever — never let the rate surge and never stall them mid-stroke.",
      why: "The telescope stroke is where the hoses, the guides and the beam wear pads all get exercised at once, and the rate at which the beams move tells the mechanic what the pump and the guides are doing: a surge means the flow control is not holding, a stall mid-stroke means a guide is binding or a hose is pinched. Holding a steady rate through the whole stroke is the test; a stroke run at whatever speed it wants proves only that the beams can move, not that they move the way a crane operator will need them to.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "TELESCOPE RATE", readout: (v) => (v < 0.4 ? "stalling — beam binding?" : v > 0.6 ? "surging — flow control" : "steady stroke") },
      holdBreakNote: "The rate broke out of band and the beams stalled mid-stroke — that is the surge or bind the test is looking for. Bring the lever back to a steady rate.",
    },
    {
      id: "indicator-check", kind: "find", noHint: true,
      targets: ["lying-switch"],
      itemNames: { "lying-switch": "landed-pin switch reading locked with the cone open" },
      itemNotes: { "lying-switch": "The aft-right corner's landed-pin switch reads locked on the panel while the cone below it is plainly in the open position — the switch has been knocked off its bracket and is closing on the housing instead of the pin." },
      title: "Prove every corner's indicator agrees with its cone",
      cue: "Cycle the locks on test power and compare each corner's panel light with the position of the cone under it.",
      why: "The crane operator locks and unlocks a spreader on the strength of four lights in the cab, and a light that says locked while the cone is open is the fault that lifts a container off the deck on three corners. The light is only worth what the switch behind it is actually sensing, so the check is not whether the lights come on but whether each one comes on when — and only when — its own cone has turned, corner by corner, with somebody standing where the cones can be seen.",
    },
    {
      id: "fit-unit", kind: "drag", target: "replacement-unit",
      title: "Fit the replacement twist-lock unit into the corner",
      cue: "Isolate again, then carry the new twist-lock unit from the cart and seat it in the aft-right corner housing.",
      why: "The unit goes into the corner as an assembly — cone, shaft, actuator lever and the switch bracket — and it goes in with the supply dead again, because the actuator it connects to is the same one that fires on a cab signal. A unit seated square in the housing takes the retaining bolts straight; one dropped in at an angle looks fitted, torques up, and leans the cone in the casting on the first lift.",
      drag: { to: "corner-socket", radius: 0.5, missNote: "Not seated — the unit has to sit square in the corner housing, shaft in the bore, before a bolt goes near it." },
    },
    {
      id: "torque-bolts", kind: "turn", target: "retaining-bolts",
      title: "Torque the retaining bolts to the manufacturer's figure",
      cue: "Pull the retaining bolts up in sequence to the figure on the work order, with the wrench clicking on each one.",
      why: "The twist-lock's retaining bolts carry the whole of the container's weight into the spreader beam on every lift, and a bolt pulled up by feel is either under-tensioned and working loose under the shock loads of a lift, or over-tensioned and yielded. The figure on the work order is the manufacturer's, the sequence keeps the unit from cocking in the housing as it pulls down, and the click is the only evidence anybody has that the bolt is at that figure and not at whatever the mechanic's arm thought it was.",
      turn: { turns: 1.5, label: "TORQUE", readout: (t) => (t < 0.5 ? "snugging" : t < 1.4 ? "pulling up" : "at figure") },
    },
    {
      id: "sign-back", kind: "select", target: "spreader-tag",
      title: "Sign the spreader back to the crane on the inspection log",
      cue: "Close the fault, record the cone wear figures, the hose and the unit replaced, and tag the spreader as inspected.",
      why: "ASME B30.20 wants the inspection recorded so the next mechanic knows what was measured and when, and the crane crew knows the fault they reported is closed rather than merely quiet. The log carries the wear figures forward so the next periodic inspection is a comparison and not a fresh guess, and the tag on the spreader is the only thing the crane operator will see before it goes back on the headblock — it says what was done, and by whom, and that is the whole of the handover.",
    },
    {
      id: "crew-checkin", kind: "select", target: "shop-radio",
      title: "Check in with the crane crew and the gang boss on the handover",
      cue: "Call the crane operator and the gang boss: what was found, what was changed, and how the shop crew is after a shift under a live boom.",
      why: "The spreader goes back onto a crane whose operator was working on the strength of a lying indicator all morning, and the gang boss under it deserves to hear that the fault was real and is closed rather than to find out from the next lift. The call is also the shop's own check-in — a shift spent beside a live lane and under a working boom is a shift with a couple of close calls in it, and the ILWU's own practice is to name them out loud, and name the support that exists, before everybody goes home.",
    },
  ],

  interrupts: [
    {
      id: "boom-overhead",
      kind: "Vessel crane boom swinging over the bay",
      after: "stand-check", delay: 2, seconds: 14,
      alert: "The crane working the vessel two bays over has slewed its boom out across the shop bay — its headblock is passing overhead.",
      cue: "Nothing continues under a moving boom. Call the crane on the shop radio and have it hold clear of the bay.",
      target: "shop-radio",
      why: "29 CFR 1917 puts the crane operator's clearance from workers in the operator's hands and the workers' clearance from the load in theirs, and the two meet on the radio: a boom over the shop bay means the operator either does not know the bay is manned or has been told otherwise. The call stops the swing before anything is hanging over a mechanic's head, and it is made by the person who can see the boom, not the one who cannot.",
      missNote: "The boom finished its swing over the bay with the headblock passing above the stands, and the stand check went on underneath it as if the sky were empty. Nothing fell; nothing was ever going to be allowed to.",
      wrongNote: "The shop radio — the boom is the crane operator's to move, and the only thing in the bay that reaches the operator is the radio.",
    },
    {
      id: "hustler-in-lane",
      kind: "Hustler entering the shop lane",
      after: "telescope-run", delay: 2, seconds: 12,
      alert: "A hustler has turned into the shop lane beside the bay with a chassis on, and the beams are extended out toward the lane.",
      cue: "Drop the lane stop paddle now — the beams are across the hustler's line.",
      target: "lane-stop-paddle",
      why: "A spreader telescoped to forty feet on its stands reaches past the bay line into the lane, at a height the hustler driver is not looking at and the chassis behind him will not clear. The stop paddle is the shop's own traffic control, and it is dropped the instant a vehicle turns into the lane rather than once it is obviously not going to stop, because the driver cannot see an extended beam end-on and the paddle is the one thing he is trained to see.",
      missNote: "The hustler came down the lane past the extended beam with nothing telling the driver to stop; the chassis cleared it by less than the width of a hand, and the telescope run carried on as if it had not.",
      wrongNote: "The stop paddle at the lane — the hustler driver answers to the paddle, and nothing else in the bay is in his eyeline.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTS_ACCENT);

    // ------------------------------------------------------------- shop floor
    const floor = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#2a2f35", base2: "#22272c", seam: "rgba(0,0,0,0.45)" }), { repeat: 5, px: 512 }),
      { rough: 0.9, metal: 0.04, color: 0xb2bac2 },
    );
    // The hustler lane runs along the east side of the bay.
    const lane = box(g, 1.2, 0.02, 5.6, 2.6, 0.111, 0, 0xffffff, { rough: 0.6, metal: 0.3, cast: false });
    lane.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 7, px: 256 }),
      { rough: 0.55, metal: 0.35, color: 0x9aa3ab },
    );
    for (let i = 0; i < 6; i++) box(g, 0.08, 0.012, 0.5, 2.0, 0.122, -2.4 + i * 0.95, 0xf2c14b, { rough: 0.7, cast: false });
    for (let i = 0; i < 6; i++) box(g, 0.08, 0.012, 0.5, 3.2, 0.122, -2.4 + i * 0.95, 0xf2c14b, { rough: 0.7, cast: false });

    // --------------------------------------------------------- the spreader
    const sp = group(g, -0.4, 0.1, -0.5);
    for (const sx of [-1.4, 1.4]) for (const sz of [-0.55, 0.55]) {
      cyl(sp, 0.06, 0.08, 0.7, sx, 0.35, sz, 0x3a4148, { rough: 0.6, metal: 0.5, seg: 12 });
      box(sp, 0.3, 0.04, 0.3, sx, 0.02, sz, 0x2b3138, { rough: 0.7, metal: 0.4 });
    }
    const standChock = box(sp, 0.12, 0.08, 0.16, -1.4, 0.06, 0.78, 0xe8b02e, { rough: 0.8 });
    holoTag(sp, "stands — hold", -1.4, 0.32, 0.95, { css: "#3fa7c9", w: 0.3 });
    reg(hits, standChock, "stand-chock");
    // Outer beams and the inner telescoping beams.
    for (const sz of [-0.42, 0.42]) box(sp, 3.0, 0.26, 0.24, 0, 0.83, sz, 0xe0b52a, { rough: 0.55, metal: 0.35 });
    const innerL = box(sp, 1.2, 0.2, 0.18, -1.9, 0.83, -0.42, 0xc99a1f, { rough: 0.55, metal: 0.4 });
    const innerR = box(sp, 1.2, 0.2, 0.18, 1.9, 0.83, 0.42, 0xc99a1f, { rough: 0.55, metal: 0.4 });
    box(sp, 0.5, 0.3, 1.1, 0, 0.85, 0, 0xd8ab22, { rough: 0.55, metal: 0.35 });
    // Power pack, control box and the loom on top.
    box(sp, 0.6, 0.3, 0.4, -0.7, 1.11, 0, 0x2f3a44, { rough: 0.5, metal: 0.5 });
    cyl(sp, 0.1, 0.1, 0.5, -0.7, 1.32, 0, 0x8a949d, { rough: 0.45, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    box(sp, 0.36, 0.28, 0.3, 0.6, 1.1, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    const hoseA = hose(sp, [[-0.4, 1.05, 0.1], [-1.0, 1.0, 0.45], [-1.6, 0.96, 0.5], [-2.2, 0.9, 0.42]], 0.02, 0x1b1e23, { steps: 14, rough: 0.75 });
    const hoseB = hose(sp, [[-0.4, 1.05, -0.1], [-1.0, 1.0, -0.45], [-1.6, 0.96, -0.5], [-2.2, 0.9, -0.42]], 0.02, 0x1b1e23, { steps: 14, rough: 0.75 });
    hose(sp, [[0.4, 1.05, 0.1], [1.0, 1.0, 0.45], [1.6, 0.96, 0.5], [2.2, 0.9, 0.42]], 0.02, 0x1b1e23, { steps: 14, rough: 0.75 });
    hose(sp, [[0.4, 1.05, -0.1], [1.0, 1.0, -0.45], [1.6, 0.96, -0.5], [2.2, 0.9, -0.42]], 0.02, 0x1b1e23, { steps: 14, rough: 0.75 });
    void hoseA;
    const chafed = box(sp, 0.16, 0.06, 0.06, -1.55, 0.96, -0.5, 0x6b4a2a, { rough: 0.9 });
    reg(hits, chafed, "chafed-hose");
    void hoseB;
    // Four corners: box, twist-lock cone, land pin, indicator lamp.
    const cones = [];
    const lamps = [];
    const cornerAt = [[-2.35, -0.42, "fl"], [-2.35, 0.42, "fr"], [2.35, -0.42, "al"], [2.35, 0.42, "ar"]];
    for (const [cx, cz, tag] of cornerAt) {
      const c = group(sp, cx, 0.83, cz);
      box(c, 0.36, 0.3, 0.3, 0, 0, 0, 0x3a4148, { rough: 0.55, metal: 0.5 });
      const cone_ = cyl(c, 0.05, 0.04, 0.12, 0, -0.22, 0, 0x9aa3ab, { rough: 0.4, metal: 0.7, seg: 10 });
      const head = box(c, 0.16, 0.05, 0.07, 0, -0.3, 0, 0x9aa3ab, { rough: 0.4, metal: 0.7 });
      head.rotation.y = tag === "ar" ? 0 : Math.PI / 2;
      cyl(c, 0.02, 0.02, 0.1, 0.12, -0.2, 0.1, 0xd7dde2, { rough: 0.4, metal: 0.7, seg: 8 });
      const lamp = ball(c, 0.025, 0, 0.2, 0.17, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 10 });
      cones.push({ cone: cone_, head, tag });
      lamps.push(lamp);
    }
    // The hand-cycled twist-lock is the forward-left one; the wear gauge sits on it.
    const twistHandle = group(sp, -2.35, 0.53, -0.42);
    box(twistHandle, 0.22, 0.04, 0.05, 0.11, 0, 0, 0xd2312b, { rough: 0.5, metal: 0.4 });
    holoTag(sp, "twist-lock — turn", -2.35, 0.36, -0.7, { css: "#3fa7c9", w: 0.34 });
    reg(hits, twistHandle, "twistlock-handle");
    const reachHit = box(sp, 0.3, 0.2, 0.2, -2.35, 0.7, 0.42, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sp, "hand in the housing?", -2.35, 1.1, 0.62, { css: "#d2312b", w: 0.44 });
    reg(hits, reachHit, "no-lockout-reach");
    // The lying switch on the aft-right corner.
    const lyingSwitch = box(sp, 0.06, 0.06, 0.04, 2.35, 0.98, 0.6, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    reg(hits, lyingSwitch, "lying-switch");
    const corner = cones[3];
    const cornerSocket = torus(sp, 0.14, 0.008, 2.35, 0.62, 0.42, PTS_ACCENT, { emissive: PTS_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    cornerSocket.rotation.x = Math.PI / 2;
    reg(hits, cornerSocket, "corner-socket");
    const bolts = group(sp, 2.35, 1.0, 0.42);
    for (const [bx, bz] of [[-0.12, -0.1], [0.12, -0.1], [-0.12, 0.1], [0.12, 0.1]]) cyl(bolts, 0.02, 0.02, 0.03, bx, 0, bz, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    holoTag(sp, "retaining bolts — torque", 2.35, 1.3, 0.42, { css: "#3fa7c9", w: 0.46 });
    reg(hits, bolts, "retaining-bolts");
    // Flippers at each end.
    const flipL = group(sp, -2.5, 0.7, -0.75);
    box(flipL, 0.08, 0.5, 0.12, 0, -0.2, 0, 0xd2312b, { rough: 0.6, metal: 0.3 });
    cyl(flipL, 0.03, 0.03, 0.2, 0, 0.02, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(sp, "flipper", -2.5, 1.05, -0.75, { css: "#3fa7c9", w: 0.2 });
    reg(hits, flipL, "flipper-left");
    const flipR = group(sp, -2.5, 0.7, 0.75);
    box(flipR, 0.08, 0.5, 0.12, 0, -0.2, 0, 0xd2312b, { rough: 0.6, metal: 0.3 });
    cyl(flipR, 0.03, 0.03, 0.2, 0, 0.02, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(sp, "flipper", -2.5, 1.05, 0.75, { css: "#3fa7c9", w: 0.2 });
    reg(hits, flipR, "flipper-right");
    for (const fz of [-0.75, 0.75]) {
      const f = group(sp, 2.5, 0.7, fz);
      box(f, 0.08, 0.5, 0.12, 0, -0.2, 0, 0xd2312b, { rough: 0.6, metal: 0.3 });
      cyl(f, 0.03, 0.03, 0.2, 0, 0.02, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.x = Math.PI / 2;
    }
    const loadedPin = cyl(sp, 0.025, 0.025, 0.26, 2.5, 0.72, -0.75, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 8 });
    loadedPin.rotation.x = Math.PI / 2;
    holoTag(sp, "pull the pin now?", 2.5, 1.12, -0.95, { css: "#d2312b", w: 0.4 });
    reg(hits, loadedPin, "flipper-pin-loaded");
    // Landed-and-locked panel on the control box.
    const panel = group(sp, 0.6, 1.1, 0.16);
    const panelLamps = [];
    for (let i = 0; i < 4; i++) panelLamps.push(ball(panel, 0.02, -0.1 + i * 0.066, 0.06, 0.01, 0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6, seg: 8 }));
    const jumper = hose(panel, [[-0.12, -0.05, 0.02], [-0.02, -0.1, 0.06], [0.1, -0.05, 0.02]], 0.008, 0xd2312b, { steps: 8, rough: 0.6 });
    holoTag(panel, "jumper the switch?", 0, -0.2, 0.02, { css: "#d2312b", w: 0.4 });
    reg(hits, jumper, "switch-jumper");
    // Telescope lever on the control box.
    const telescopeLever = group(sp, 0.6, 1.26, 0.1);
    cyl(telescopeLever, 0.012, 0.012, 0.16, 0, 0.08, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 8 });
    ball(telescopeLever, 0.03, 0, 0.17, 0, 0x2b2f34, { rough: 0.5, seg: 10 });
    holoTag(sp, "telescope — hold", 0.6, 1.55, 0.1, { css: "#3fa7c9", w: 0.34 });
    reg(hits, telescopeLever, "telescope-lever");

    // ------------------------------------------------- headblock on the shop crane
    const hb = group(g, 0.9, 2.5, -0.5);
    box(hb, 1.2, 0.3, 0.5, 0, 0, 0, 0x2f3a44, { rough: 0.55, metal: 0.5 });
    for (const sx of [-0.4, 0, 0.4]) cyl(hb, 0.14, 0.14, 0.08, sx, 0.2, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 14 }).rotation.x = Math.PI / 2;
    for (const sx of [-0.45, 0.45]) cyl(hb, 0.012, 0.012, 1.4, sx, 0.85, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    box(g, 4.0, 0.16, 0.3, 0.9, 3.3, -0.5, 0x3a4148, { rough: 0.6, metal: 0.5, cast: false });
    const underHit = box(g, 1.0, 0.05, 0.5, 0.9, 0.14, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk under the headblock?", 0.9, 1.9, -0.2, { css: "#d2312b", w: 0.5 });
    reg(hits, underHit, "under-headblock");

    // ------------------------------------------ the vessel crane's boom, overhead
    const boom = group(g, -6.0, 4.6, -3.5);
    box(boom, 7.0, 0.5, 0.5, 0, 0, 0, 0xd8dde2, { rough: 0.6, metal: 0.4, cast: false });
    box(boom, 7.0, 0.05, 0.6, 0, 0.3, 0, 0xd2312b, { rough: 0.6, cast: false });
    box(boom, 0.8, 0.4, 0.5, 2.0, -0.6, 0, 0x2f3a44, { rough: 0.55, metal: 0.5, cast: false });
    boom.rotation.y = 0.9;
    boom.visible = false;

    // ------------------------------------------------------- control cabinet
    const cab = group(g, -2.2, 0.1, 1.6);
    box(cab, 0.6, 1.2, 0.36, 0, 0.6, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    box(cab, 0.5, 0.05, 0.3, 0, 1.22, 0, 0x2b3138, { rough: 0.5 });
    const isoBody = box(cab, 0.14, 0.14, 0.06, 0, 0.9, 0.2, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const isoHandle = box(cab, 0.04, 0.2, 0.04, 0, 0.9, 0.24, 0xd2312b, { rough: 0.5 });
    holoTag(cab, "supply isolator", 0, 1.12, 0.22, { css: "#3fa7c9", w: 0.34 });
    reg(hits, isoBody, "isolator-handle");
    const hasp = group(cab, 0, 0.64, 0.2);
    box(hasp, 0.1, 0.04, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    const lock = lockTag(hasp, 0, -0.05, 0.02, { lines: ["M&R — DO", "NOT ENERGISE"] });
    lock.visible = false;
    holoTag(cab, "hasp — your lock", 0, 0.5, 0.22, { css: "#3fa7c9", w: 0.32 });
    reg(hits, hasp, "lock-hasp");
    const tryBtn = cyl(cab, 0.03, 0.03, 0.02, 0.18, 0.75, 0.19, 0x59c97b, { rough: 0.4, seg: 12 });
    tryBtn.rotation.x = Math.PI / 2;
    holoTag(cab, "try", 0.18, 0.66, 0.2, { css: "#3fa7c9", w: 0.12 });
    reg(hits, tryBtn, "try-control");

    // ------------------------------------------------------- chest and tools
    const chest = toolChest(g, -1.9, -1.9, { ry: 0.4, color: 0x2f4f6f });
    const gauge = instrument(chest, -0.1, 0.79, 0.02, { ry: 0.2, idle: "-- mm", color: 0x3fa7c9, w: 0.1, d: 0.16 });
    holoTag(gauge, "wear gauge", 0, 0.15, 0, { css: "#3fa7c9", w: 0.26 });
    reg(hits, gauge, "wear-gauge");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 4 · SHOP", color: 0x3fa7c9, w: 0.1, d: 0.16 });
    holoTag(radio, "shop radio", 0, 0.15, 0, { css: "#3fa7c9", w: 0.26 });
    reg(hits, radio, "shop-radio");
    box(chest, 0.34, 0.02, 0.03, 0.02, 0.77, -0.16, 0x8a949d, { rough: 0.35, metal: 0.85 });

    // ------------------------------------------------- cart with the new unit
    const cart = group(g, 1.5, 0.1, 1.7, -0.3);
    box(cart, 0.6, 0.05, 0.4, 0, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const [wx, wz] of [[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]]) cyl(cart, 0.02, 0.02, 0.5, wx, 0.25, wz, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    for (const [wx, wz] of [[-0.22, -0.16], [0.22, 0.16]]) cyl(cart, 0.05, 0.05, 0.03, wx, 0.05, wz, 0x14171a, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const unit = group(cart, 0, 0.6, 0);
    box(unit, 0.34, 0.16, 0.28, 0, 0, 0, 0x3a4148, { rough: 0.55, metal: 0.5 });
    cyl(unit, 0.05, 0.04, 0.12, 0, -0.14, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 10 });
    box(unit, 0.16, 0.05, 0.07, 0, -0.22, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(cart, "replacement unit", 0, 0.95, 0, { css: "#3fa7c9", w: 0.36 });
    reg(hits, unit, "replacement-unit");

    // ------------------------------------------------ lane paddle and hustler
    const paddlePost = group(g, 1.9, 0.1, -2.3);
    cyl(paddlePost, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const paddle = cyl(paddlePost, 0.18, 0.18, 0.02, 0, 1.35, 0, 0xd2312b, { rough: 0.5, seg: 8 });
    paddle.rotation.x = Math.PI / 2;
    paddle.rotation.z = Math.PI / 2;
    holoTag(paddlePost, "lane stop paddle", 0, 1.62, 0, { css: "#3fa7c9", w: 0.34 });
    reg(hits, paddlePost, "lane-stop-paddle");
    const hustler = group(g, 2.6, 0.1, 4.6);
    box(hustler, 0.9, 0.5, 1.4, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hustler, 0.86, 0.6, 0.7, 0, 1.0, -0.3, 0xe07a3f, { rough: 0.5, metal: 0.3 });
    box(hustler, 0.7, 0.3, 0.02, 0, 1.1, -0.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    cyl(hustler, 0.3, 0.3, 0.05, 0, 0.55, 0.4, 0x14171a, { rough: 0.7, seg: 14 });
    for (const [wx, wz] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.45], [0.45, 0.45]]) cyl(hustler, 0.22, 0.22, 0.2, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    const chassis = box(hustler, 0.9, 0.12, 2.2, 0, 0.55, 1.8, 0xd2312b, { rough: 0.6, metal: 0.4 });
    void chassis;
    hustler.visible = false;

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, -2.0, 1.15, -0.4, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fa7c9"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d6eefb"; cx.fillText("WORK ORDER — SPREADER 07", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Reported: aft-right locked light disagrees with corner", "Last periodic: cones 3 of 4 inside wear limit", "Hoses: guide chafe noted, not yet replaced",
       "Isolate · lock · try before any housing is opened", "Function test on shop power only, bay clear", "Torque figure on the sheet — no bolt by feel"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 0.9, accent: PTS_ACCENT });
    reg(hits, board, "work-order-board");
    const tagBoard = holoPanel(g, 0.6, 0.42, 2.0, 1.2, 0.6, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fa7c9"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d6eefb"; cx.fillText("INSPECTION LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Status: OUT OF SERVICE", "Fault: open", "Cone wear: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.7, accent: PTS_ACCENT });
    reg(hits, tagBoard, "spreader-tag");

    // ---------------------------------------------------------------- crew
    const mechanic = standingFigure(g, -2.45, 0.7, { ry: 1.4, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e, gloves: true });
    holoTag(mechanic, "M&R mechanic", 0, 1.9, 0, { css: "#3fa7c9", w: 0.3 });
    const apprentice = standingFigure(g, 2.4, -1.9, { ry: -2.6, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(apprentice, "shop apprentice", 0, 1.9, 0, { css: "#3fa7c9", w: 0.32 });
    cone(g, 0.6, 2.4); cone(g, -0.9, 2.4);
    barrierPanel(g, -0.2, 2.5, { color: 0xf2c14b, ry: 0 });

    const lockedMat = mat(0x59c97b, { emissive: 0x59c97b, ei: 2.0, rough: 0.4 });
    const openMat = mat(0x5a3a2a, { rough: 0.4, emissive: 0x5a3a2a, ei: 0.6 });
    const lyingMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
    const paddleUpMat = paddle.material;
    const paddleDownMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.5 });
    const hustlerHome = hustler.position.clone();
    let telescoped = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.0, -0.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "isolate") { isoHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "restore-for-test") { isoHandle.rotation.z = 0; lock.visible = false; }
        if (step.id === "hose-walk") chafed.visible = false;
        if (step.id === "telescope-run") { telescoped = true; innerL.position.x = -2.3; innerR.position.x = 2.3; }
        if (step.id === "indicator-check") { lyingSwitch.visible = false; panelLamps[3].material = openMat; }
        if (step.id === "fit-unit") { unit.position.set(0, 0.6, 0); unit.visible = false; corner.cone.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.8 }); isoHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "sign-back") {
          repaint(tagBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d6eefb"; cx.fillText("INSPECTION LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Status: IN SERVICE — signed", "Fault: closed, switch + unit replaced", "Cone wear: recorded, 4 of 4 in limit"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("HANDED OVER", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      // Both interruptions change the world the instant they fire: the boom
      // is actually over the bay, the hustler is actually in the lane.
      onInterrupt(it) {
        if (it.id === "boom-overhead") { boom.visible = true; boom.position.set(-1.0, 4.6, -1.0); boom.rotation.y = 0.2; }
        if (it.id === "hustler-in-lane") { hustler.visible = true; hustler.position.set(2.6, 0.1, 1.6); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "boom-overhead") { boom.visible = false; boom.position.set(-6.0, 4.6, -3.5); boom.rotation.y = 0.9; }
        if (it.id === "hustler-in-lane") { hustler.position.copy(hustlerHome); hustler.visible = false; paddle.material = paddleDownMat; paddle.rotation.z = 0; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "cycle-twistlock") {
          twistHandle.rotation.y = session.turn.amount * Math.PI * 2;
          cones[0].head.rotation.y = Math.PI / 2 + session.turn.amount * Math.PI * 2;
        }
        if (session?.turn && step?.id === "torque-bolts") bolts.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "cone-wear") repaint(gauge.userData.screen, signFace(`${(gg.t * 6).toFixed(1)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "telescope-run" && session.holding) {
          const v = session.track.v;
          innerL.position.x = -1.9 - Math.min(0.5, v * 0.8);
          innerR.position.x = 1.9 + Math.min(0.5, v * 0.8);
          for (let i = 0; i < lamps.length; i++) lamps[i].material = i === 3 ? lyingMat : lockedMat;
          for (let i = 0; i < panelLamps.length; i++) panelLamps[i].material = lockedMat;
        }
        if (step?.id === "indicator-check") {
          for (let i = 0; i < 3; i++) lamps[i].material = lockedMat;
          lamps[3].material = openMat;
          panelLamps[3].material = lyingMat;
        }
        if (telescoped && boom.visible) boom.rotation.y = 0.2 + Math.sin(t * 0.4) * 0.05;
        void paddleUpMat;
      },
    };
  },
};
