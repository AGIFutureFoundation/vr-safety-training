import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Industrial Press & Steam VR — Sewing & Garment Trades, station
// three. The steam press is the one machine on this floor that stores real
// energy of its own: a boiler behind the wall keeping pressure, a head that
// closes with tonnes of clamping force, and steam and vacuum doing in
// seconds what a hand iron does in minutes. The two-hand control exists
// because the head does not know a garment from a hand, and the boiler's
// gauge exists because pressure that is fine one shift can be a problem the
// next if nobody is reading it.

const IPS_ACCENT = 0xd9703a;

export const SIM_INDUSTRIAL_PRESS_STEAM = {
  id: "industrial-press-steam",
  index: "178",
  domain: "Manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) garment and apparel production; the state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the press head's two-hand control; OSHA 29 CFR 1910.147 lockout before the head is opened for cleaning; ASME Boiler and Pressure Vessel Code requirements for the boiler's safety relief valve; NFPA 70 for the press's electrical supply",
  name: "Industrial Press & Steam",
  title: simTitle("Industrial Press & Steam"),
  tagline: "Boiler pressure checked, the head run on two-hand control, steam and vacuum by fabric, a scorch caught, and the press shut down clean",
  accent: IPS_ACCENT,
  accentCss: "#d9703a",
  parSeconds: 270,
  footprint: 2.7,
  badge: { id: "press-certified", name: "Press Certified", note: "Boiler checked, every cycle run two-handed, a scorch caught, and the press shut down to the end of a real shift" },

  game: system({
    name: "Press Standard",
    currency: "STEAM",
    ranks: ["Press Helper", "Press Operator", "Lead Presser", "Finishing Supervisor", "Press Standard Certified"],
    badges: [
      { id: "two-hands-every-time", name: "Two Hands Every Time", note: "Never ran the head one-handed or with the guard bypassed", test: AWARD.stepClean("press-cycle") },
      { id: "hands-clear-press", name: "Hands Clear", note: "Never reached under the head or into a live steam leak", test: AWARD.safe },
      { id: "boiler-precise", name: "Boiler Precise", note: "Held the boiler pressure reading near band centre", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-press-run", name: "Clean Run", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-checks", name: "Steady Checks", note: "Held every reading without a break", test: AWARD.unbroken },
      { id: "press-fast", name: "Press Fast", note: "Shift closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "guard-bypassed": "That second palm button has a strip of tape holding it down. Taping one side of a two-hand control turns it into a one-hand control, which puts a hand back in exactly the space the second button was there to keep clear of a closing head — the whole reason it takes two hands is that a head this heavy cannot be stopped by one hand that just got caught under it.",
    "hose-cracked": "That spare steam hose has a bulge and a hairline crack along one side, coiled on the rack like it's still serviceable. A hose that fails under pressure does it suddenly, not gradually, and coiling a cracked one back onto the rack instead of tagging it out is how the next person to grab a spare in a hurry grabs this one.",
    "relief-tag-expired": "That relief valve's inspection tag expired months ago. A boiler's pressure relief valve is the one thing standing between normal operating pressure and a vessel failure if something upstream sticks, and the ASME code's inspection interval exists because a relief valve can seize shut with age the same way anything else with a spring in it can — nobody finds that out from looking at it.",
    "condensate-drain": "The condensate drain at the base of the boiler is dripping scalding water onto the floor instead of into its trap. Live steam condenses hot, well above a scald threshold, and a puddle of it on a walked path is a burn hazard on the floor of a room where everyone's attention is on a press head, not on where they're stepping.",
  },

  lateNotes: {
    "press-cycle": "Not yet — the boiler has to read in range and the garment has to actually be on the buck before the head goes anywhere near it.",
    "head-latch": "Not yet — the head opens once the full steam-and-vacuum cycle has actually finished, not partway through it.",
    "lock-prop": "Not yet — cleaning the buck happens once the head is confirmed open and propped, not while it's only resting on its own weight.",
  },

  steps: [
    {
      id: "work-order", kind: "select", target: "work-order",
      title: "Read the work order",
      cue: "Check the fabric type, the count and the steam and heat setting this batch calls for.",
      why: "Every fabric on this floor presses at a different combination of heat, steam and vacuum, and the work order is the only place that number is written down for this batch rather than guessed at from what the last garment on the buck happened to be. Wool scorches at a setting synthetics need to press flat, and starting from memory instead of the ticket is how one garment in a batch comes out wrong before anyone notices the fabric changed.",
    },
    {
      id: "boiler-pressure", kind: "gauge", target: "boiler-gauge",
      title: "Check the boiler pressure",
      cue: "Read the boiler pressure gauge and commit once it's holding inside the safe operating band.",
      why: "The boiler feeding this press holds real stored energy independent of anything the head is doing, and its pressure is checked before the first garment goes on the buck, not assumed steady because it read fine yesterday. A gauge running low starves the head of steam mid-cycle; one running high is a boiler operating outside the range its relief valve was set to protect, and the only way to know which this shift is, is to read it.",
      gauge: { label: "BOILER PRESSURE", speed: 0.6, green: [0.42, 0.6], readout: (t) => `${Math.round(60 + t * 40)} psi`, missNote: "Outside the safe band — do not load the press until the boiler is holding in range. Check the burner and the relief valve before trying again." },
    },
    {
      id: "relief-valve", kind: "select", target: "relief-valve",
      title: "Check the relief valve's inspection tag",
      cue: "Confirm the boiler's pressure relief valve carries a current inspection tag.",
      why: "The relief valve is what actually protects this boiler if pressure runs past the gauge's warning — it is the last mechanical thing standing between a stuck control and a vessel failure, and a spring-loaded valve can seize with age the same as anything else that isn't cycled. The ASME code's inspection interval is what proves this specific valve will still open when it's needed, not just that one exists on the boiler.",
    },
    {
      id: "steam-valve", kind: "turn", target: "steam-valve",
      title: "Open the steam supply to the head",
      cue: "Turn the steam supply valve open now that the boiler and relief valve are both confirmed.",
      why: "Steam goes to the head only after the boiler side of this system is confirmed, in that order — opening the supply first and checking the gauge after is a bet that whatever the boiler is doing right now happens to be safe. Turning the valve last means every check that could have caught a problem already ran before live steam is anywhere near the head.",
      turn: { turns: 0.75, axis: "y", label: "STEAM SUPPLY" },
    },
    {
      id: "guard-check", kind: "select", target: "guard-check",
      title: "Check the two-hand control",
      cue: "Confirm both palm buttons are free, untaped and spaced so one hand cannot reach both.",
      why: "A two-hand control only works as a guard if both buttons genuinely need two separate hands — spaced far enough apart, and both live — because its entire job is making sure both of an operator's hands are somewhere other than under the head before it can close. A control checked clean before every shift is what keeps that guarantee real instead of theoretical.",
    },
    {
      id: "lay-garment", kind: "drag", target: "garment",
      title: "Lay the garment on the buck",
      cue: "Carry the garment onto the buck, arranged flat and square to the fabric's own grain.",
      why: "A garment bunched or laid off-square on the buck presses its own wrinkles into permanent creases the instant the head closes, because the press has no way to know the fold underneath wasn't intentional. Laying it flat and square before the head ever moves is the only point in the cycle where a mistake here is still a five-second fix instead of a garment that has to be re-pressed or re-cut.",
      drag: { to: "buck-zone", radius: 0.4, missNote: "Not square on the buck — lay the garment flat before the head comes down on it." },
    },
    {
      id: "fabric-setting", kind: "select", target: "preset-wool",
      title: "Select the fabric's steam preset",
      cue: "Choose the preset that matches this batch's fabric from the work order — not the last preset used.",
      why: "The preset sets the actual heat and steam volume the head delivers, and a synthetic preset run on wool scorches it while a wool preset run on synthetics never gets it flat. The preset that was already sitting selected from the last batch is not a safe default — it is whatever fabric happened to go through this press last, and the work order is what says whether that's still true.",
    },
    {
      id: "press-cycle", kind: "hold", target: "press-cycle", seconds: 8,
      title: "Run the press cycle two-handed",
      cue: "Press and hold both palm buttons through the full steam-and-vacuum cycle.",
      why: "Both palm buttons held down is what proves both of the operator's hands are clear of the buck for the entire time the head is closing and steaming, not just at the instant the cycle started — letting go of either button partway is supposed to stop the head, and holding through the full cycle is the only way this control actually does the job it's built for. The vacuum that follows the steam pulls moisture back out of the fabric so the garment comes off dry, not just hot.",
      holdBreakNote: "A palm button let go mid-cycle. That is exactly what the control is supposed to catch — reset, keep both hands on the buttons, and run the full cycle through without a break.",
    },
    {
      id: "head-open", kind: "select", target: "head-latch",
      title: "Open the head",
      cue: "Release the head latch once the full cycle has actually finished.",
      why: "The head only opens once the cycle's own timer says the steam and vacuum phases are both done — cracking it early vents live steam across whoever's hands are anywhere near the buck, and the garment underneath hasn't finished drying under vacuum yet either. The latch is checked, not forced, and it opens when the cycle says it's ready to.",
    },
    {
      id: "scorch-check", kind: "find", noHint: true,
      targets: ["scorched-panel"],
      itemNames: { "scorched-panel": "the scorched panel on the finished rack" },
      itemNotes: { "scorched-panel": "This panel has a faint yellow-brown scorch mark along one edge — a preset run too hot for this fabric, or a cycle left on too long. It looks like a finished, pressed garment from a glance; the mark only shows once you're actually looking for it." },
      title: "Check the finished pieces before they're bagged",
      cue: "One garment on the finished rack has a scorch mark. Find it.",
      why: "A scorch mark on a dark fabric under shop lighting is easy to miss from across the room, and it is a garment that goes out the door as a return the moment a customer sees it under a brighter light. Catching it here, against the rest of the batch, is the only point where it costs a re-press instead of a returned sale.",
    },
    {
      id: "lock-open-clean", kind: "select", target: "lock-prop",
      title: "Lock the head open to clean the buck",
      cue: "Set the mechanical prop that holds the head open before reaching in to clean the buck's padding.",
      why: "A head resting on its own weight, latch released, is not the same thing as a head that cannot move — a control fault or somebody bumping a pedal with a hand already on the buck is exactly the scenario a mechanical prop exists to make impossible rather than merely unlikely. The prop goes in before a hand does, the same principle 1910.147 states for any equipment being reached into for servicing.",
    },
    {
      id: "shutdown", kind: "sequence",
      targets: ["steam-shutoff", "boiler-drain", "press-power-off"],
      itemNames: { "steam-shutoff": "steam supply, closed", "boiler-drain": "boiler blowdown, drained", "press-power-off": "press power, off" },
      title: "Shut the press down for the shift",
      cue: "Close the steam supply, drain the boiler's blowdown, then power the press off.",
      why: "Steam goes off first so nothing downstream is still live while the rest of the shutdown happens, the blowdown clears sediment that settles to the bottom of the boiler every shift and left there shortens the vessel's life, and the power only comes off last, once nothing pressurized is depending on the control system still being there. Skipping the blowdown to save five minutes is exactly how a boiler earns an unscheduled inspection instead of a scheduled one.",
      outOfOrderNote: "Steam off, then the blowdown, then power — killing power first leaves the steam side live with no control panel watching it.",
    },
  ],

  // Two things a presser can only half-see with both hands committed to the
  // palm buttons or already reaching into the machine. See shared/game.js.
  interrupts: [
    {
      id: "hose-leak",
      kind: "Steam leak",
      after: "press-cycle", delay: 3, seconds: 12,
      alert: "A fitting on the steam hose feeding the head starts hissing and throwing a visible jet of live steam across the bench.",
      cue: "That hose is leaking live steam, not just venting normally.",
      target: "steam-valve",
      why: "A fitting that lets go under pressure sprays steam at scald temperature in whatever direction it's pointed, and the only thing that stops it is cutting the supply at the valve — not walking toward the leak to look at it, and not waiting for the current cycle to finish on its own. The valve is upstream of every fitting on this line, which is exactly why it's the answer regardless of where the leak actually is.",
      missNote: "The cycle ran on with the hose still leaking. Steam at that pressure and temperature causes a scald through clothing in the time it takes to notice it's happening, and every second the supply stays open is a second that jet keeps reaching whoever is standing near the bench.",
      wrongNote: "It's the steam supply valve — shut it before doing anything else about that leak.",
    },
    {
      id: "hand-under-head",
      kind: "Reach under the head",
      after: "press-cycle", delay: 6, seconds: 12,
      alert: "A coworker reaches under the head to tug the garment straight while the cycle is still running.",
      cue: "There is a hand under a head that has not finished its cycle.",
      target: "press-estop",
      why: "The two-hand control only protects the operator holding it — it does nothing for a second person who reaches in from the side while the buttons stay held down, which is exactly the gap the emergency stop exists to cover. The stop kills the cycle outright rather than waiting for the operator to notice and let go, because noticing in time is not something this situation can be counted on for.",
      missNote: "The cycle ran on with a hand under the head. The two-hand control did its job on the person holding it and nothing for the person who reached in past it — the head does not sense a hand, only the buttons it was built to sense.",
      wrongNote: "It's the emergency stop — a hand is under the head right now. Hit it before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, IPS_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#c2c9cf", base2: "#b0b8bf", step: 26 }), { repeat: 4, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.45, metal: 0.55, color: 0xc2c9cf });

    // ------------------------------------------------------------ press head
    const press = group(g, 0, 0, -0.6);
    box(press, 1.5, 0.1, 1.0, 0, 0.86, 0, 0x8b929a, { rough: 0.4, metal: 0.5 }); // lower buck base
    const buckTop = slab(press, 1.3, 0.08, 0.85, 0, 0.92, 0, 0xc2c9cf, { radius: 0.03, rough: 0.5 });
    buckTop.material = steelMat();
    const buckZone = box(press, 1.1, 0.01, 0.7, 0, 0.965, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, buckZone, "buck-zone");
    for (const sx of [-0.65, 0.65]) box(press, 0.14, 1.3, 0.14, sx, 1.55, -0.4, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    box(press, 1.5, 0.16, 0.3, 0, 2.15, -0.4, CITY.darkSteel, { rough: 0.5, metal: 0.6 }); // top beam
    const headArm = group(press, 0, 2.0, 0.05);
    const head = box(headArm, 1.2, 0.14, 0.8, 0, 0, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    void head;
    holoTag(press, "Steam press", 0, 2.35, -0.4, { css: "#d9703a", w: 0.32 });

    // Palm buttons, spaced wide, one taped down (hazard) unless corrected.
    const btnL = group(press, -0.75, 0.95, 0.6);
    cyl(btnL, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 16 });
    const capL = cyl(btnL, 0.04, 0.04, 0.025, 0, 0.02, 0, 0x59c97b, { rough: 0.4, seg: 16 });
    void capL;
    const btnR = group(press, 0.75, 0.95, 0.6);
    cyl(btnR, 0.05, 0.05, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 16 });
    const capR = cyl(btnR, 0.04, 0.04, 0.025, 0, 0.02, 0, 0x59c97b, { rough: 0.4, seg: 16 });
    void capR;
    const tape = box(btnR, 0.09, 0.006, 0.03, 0, 0.03, 0, 0xe0d090, { rough: 0.6 });
    reg(hits, tape, "guard-bypassed");
    const twoHand = group(press, 0, 0.9, 0.6);
    reg(hits, twoHand, "press-cycle");
    holoTag(twoHand, "Two-hand control", 0, 0.12, 0, { css: "#d9703a", w: 0.34 });
    // A separate invisible marker for the pre-cycle guard check, so it keeps
    // its own hit id instead of overwriting the control's — see reg()'s note.
    const guardCheckMark = box(twoHand, 0.36, 0.02, 0.1, 0, -0.03, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, guardCheckMark, "guard-check");

    const headLatch = group(press, -0.7, 2.05, -0.35);
    box(headLatch, 0.05, 0.14, 0.03, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    reg(hits, headLatch, "head-latch");
    const lockPropObj = group(press, 0.7, 1.4, -0.35);
    cyl(lockPropObj, 0.02, 0.02, 0.6, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    lockPropObj.visible = false;
    reg(hits, lockPropObj, "lock-prop");

    // Garment, laid off the buck at first.
    const garment = group(g, -1.6, 0, 0.4, 0.3);
    box(garment, 0.5, 0.01, 0.35, 0, 0.72, 0, 0xdfe4e8, { rough: 0.8 });
    reg(hits, garment, "garment");
    holoTag(garment, "Pressed garment", 0, 0.85, 0, { css: "#d9703a", w: 0.32 });

    // Preset selector chips beside the head.
    const presets = group(press, 0.9, 0.95, -0.05);
    box(presets, 0.3, 0.2, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    const presetSpecs = [
      { id: "preset-cotton", label: "COTTON", x: -0.09 },
      { id: "preset-wool", label: "WOOL", x: 0 },
      { id: "preset-synth", label: "SYNTH", x: 0.09 },
    ];
    for (const p of presetSpecs) {
      const chip = decal(presets, 0.08, 0.05, p.x, 0, 0.02, signFace(p.label, { bg: "#1c2024", accent: "#d9703a", scale: 0.5 }), { px: 96 });
      reg(hits, chip, p.id);
    }

    // ------------------------------------------------------------ boiler
    const boiler = group(g, -2.1, 0, -1.4, 0.3);
    lathe(boiler, [[0.001, 0], [0.34, 0.02], [0.36, 0.1], [0.36, 1.1], [0.32, 1.2], [0.001, 1.22]], 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.5, seg: 22 });
    const gaugeFace = decal(boiler, 0.16, 0.14, 0.3, 1.0, 0.1, signFace("-- psi", { bg: "#0d1c24", accent: "#bfeaf7", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.7 });
    const gaugeObj = group(boiler, 0.3, 1.0, 0.1);
    gaugeObj.userData.screen = gaugeFace;
    reg(hits, gaugeObj, "boiler-gauge");
    const reliefBody = group(boiler, -0.32, 1.05, 0.05, -0.5);
    cyl(reliefBody, 0.03, 0.03, 0.16, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 12 });
    const reliefTag = decal(reliefBody, 0.07, 0.09, 0, -0.13, 0.02, signFace("INSP\nOK", { bg: "#f4e9d8", accent: "#27904e", fg: "#22303c", scale: 0.4 }), { px: 96 });
    void reliefTag;
    reg(hits, reliefBody, "relief-valve");
    holoTag(boiler, "Boiler", 0, 1.4, 0, { css: "#d9703a", w: 0.24 });

    // Spare relief valve on the wall with an expired tag — hazard.
    const spareRelief = group(g, -2.7, 0, -0.6, 0.3);
    cyl(spareRelief, 0.028, 0.028, 0.14, 0, 0.9, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 12 });
    decal(spareRelief, 0.06, 0.08, 0, 0.78, 0.03, signFace("EXPIRED", { bg: "#f4d8d8", accent: "#b81410", fg: "#22303c", scale: 0.42 }), { px: 96 });
    holoTag(spareRelief, "relief valve — tag expired", 0, 1.0, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, spareRelief, "relief-tag-expired");

    // Condensate drain, dripping — hazard.
    const drain = group(boiler, 0, 0.05, -0.2);
    cyl(drain, 0.025, 0.025, 0.06, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const drip = particles(drain, 12, 0xbfe6f0, { size: 0.012, life: 0.3, additive: false, opacity: 0.6 });
    holoTag(drain, "condensate — dripping", 0, -0.12, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, drain, "condensate-drain");

    // ------------------------------------------------------------ steam valve
    const valvePost = group(g, -1.2, 0, -1.6, 0.4);
    cyl(valvePost, 0.03, 0.03, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const valveWheelMesh = group(valvePost, 0, 0.9, 0);
    torus(valveWheelMesh, 0.11, 0.014, 0, 0, 0, 0xb8402f, { rough: 0.55, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const spoke = box(valveWheelMesh, 0.2, 0.012, 0.018, 0, 0, 0, 0xb8402f, { rough: 0.55 });
      spoke.rotation.y = (i * Math.PI) / 4;
    }
    reg(hits, valvePost, "steam-valve");
    holoTag(valvePost, "Steam supply", 0, 1.1, 0, { css: "#d9703a", w: 0.3 });
    // Its own invisible marker for the end-of-shift shutoff, so it keeps its
    // own hit id instead of overwriting the valve's — see reg()'s note.
    const steamShutoffMark = box(valvePost, 0.06, 0.06, 0.06, 0, 0.55, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, steamShutoffMark, "steam-shutoff");
    const steamHose = cyl(g, 0.02, 0.02, 1.1, -0.8, 1.0, -1.1, 0x2b2f34, { rough: 0.6, seg: 10 });
    steamHose.rotation.z = 0.9;
    const hoseFitting = group(g, -0.6, 1.1, -0.95);
    cyl(hoseFitting, 0.03, 0.03, 0.06, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 12 });
    const leakJet = particles(hoseFitting, 24, 0xe4ecf2, { size: 0.03, life: 0.5, additive: false, opacity: 0.5 });
    holoTag(hoseFitting, "hose fitting", 0, 0.12, 0, { css: "#d9703a", w: 0.26 });

    // Spare cracked hose on a rack — hazard.
    const hoseRack = group(g, -2.7, 0, 0.6, 0.4);
    box(hoseRack, 0.04, 0.7, 0.04, 0, 0.35, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const crackedHose = torus(hoseRack, 0.12, 0.02, 0, 0.55, 0, 0x2b2f34, { rough: 0.6, seg: 8, seg2: 20 });
    crackedHose.rotation.x = Math.PI / 2;
    decal(hoseRack, 0.05, 0.05, 0.13, 0.5, 0, signFace("crack", { bg: "#3a1a1a", accent: "#f0645b", scale: 0.5 }), { px: 64 });
    holoTag(hoseRack, "spare hose — cracked", 0, 0.75, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, crackedHose, "hose-cracked");

    // Emergency stop paddle on the press frame.
    const estop = group(press, 0.7, 1.1, 0.62);
    cyl(estop, 0.02, 0.02, 0.14, 0, 0.07, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const estopCap = ball(estop, 0.05, 0, 0.16, 0, 0xd2312b, { rough: 0.4, seg: 16 });
    void estopCap;
    reg(hits, estop, "press-estop");
    holoTag(estop, "E-STOP", 0, 0.28, 0, { css: "#d2312b", w: 0.24 });

    // Boiler blowdown drain and the press power switch, for the shutdown sequence.
    const blowdown = group(boiler, 0.3, 0.08, -0.05);
    cyl(blowdown, 0.02, 0.02, 0.1, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    reg(hits, blowdown, "boiler-drain");
    const powerSwitch = group(g, 1.4, 0, -1.0, -0.3);
    box(powerSwitch, 0.14, 0.22, 0.1, 0, 1.2, 0, 0x2b2f34, { rough: 0.5 });
    const powerHandle = box(powerSwitch, 0.03, 0.09, 0.03, 0, 1.28, 0.05, 0xd2312b, { rough: 0.5 });
    void powerHandle;
    reg(hits, powerSwitch, "press-power-off");
    holoTag(powerSwitch, "Press power", 0, 1.4, 0, { css: "#d9703a", w: 0.3 });

    // ------------------------------------------------------------ work order + finished rack
    const workOrder = holoPanel(g, 0.56, 0.4, 2.3, 1.5, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(24,12,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9703a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f4dcc4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("WORK ORDER — STYLE 4402", w * 0.06, h * 0.14);
      ctx.fillStyle = "#fbeee0";
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Fabric: wool blend, 24 pcs", "Preset: WOOL", "Steam + vacuum, full cycle"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.15)));
    }, { ry: -0.5, accent: IPS_ACCENT });
    reg(hits, workOrder, "work-order");

    const finishedRack = group(g, 1.9, 0, 1.6, -0.5);
    for (const sx of [-0.5, 0.5]) box(finishedRack, 0.04, 1.5, 0.04, sx, 0.75, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    box(finishedRack, 1.1, 0.03, 0.03, 0, 1.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const garmentColours = [0xdfe4e8, 0x8fa6c9, 0x9a7448];
    const finishedPieces = [];
    garmentColours.forEach((c, i) => {
      const piece = box(finishedRack, 0.26, 0.4, 0.05, -0.35 + i * 0.35, 1.15, 0, c, { rough: 0.8 });
      finishedPieces.push(piece);
    });
    holoTag(finishedRack, "Finished rack", 0, 1.6, 0, { css: "#d9703a", w: 0.3 });
    const scorchMark = decal(finishedPieces[1], 0.18, 0.09, 0.03, 0.1, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.fillStyle = "rgba(122,90,42,0.55)";
      cx.beginPath(); cx.ellipse(w * 0.5, h * 0.5, w * 0.42, h * 0.32, 0.3, 0, Math.PI * 2); cx.fill();
    }, { px: 64, transparent: true });
    reg(hits, scorchMark, "scorched-panel");

    // -------------------------------------------------------------- dressing
    // A lockstitch head and a marking table visible across the room, a spare
    // press pad on a shelf, a fire extinguisher and a safety board — the
    // sewing room the other two stations stand in, seen from the press's
    // corner of it.
    const bgLockstitch = group(g, 1.6, 0, -2.6, -0.3);
    for (const [lx, lz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) {
      box(bgLockstitch, 0.05, 0.78, 0.05, lx, 0.39, lz, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    }
    box(bgLockstitch, 0.7, 0.04, 0.5, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    box(bgLockstitch, 0.26, 0.24, 0.12, -0.15, 0.94, -0.04, 0x1c2024, { rough: 0.35, metal: 0.5 });
    cyl(bgLockstitch, 0.08, 0.1, 0.32, -0.28, 0.55, 0.18, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 12 });

    const padShelf = group(g, 2.6, 0, -1.4, 0.4);
    box(padShelf, 0.5, 0.03, 0.35, 0, 1.0, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    for (const sx of [-0.2, 0.2]) cyl(padShelf, 0.014, 0.014, 1.0, sx, 0.5, 0.13, 0x8b929a, { rough: 0.4, metal: 0.6, seg: 8 });
    box(padShelf, 0.4, 0.06, 0.28, 0, 1.05, 0, 0xdfe4e8, { rough: 0.7 });
    holoTag(padShelf, "Spare buck pads", 0, 1.2, 0, { css: "#d9703a", w: 0.32 });

    const ext = group(g, -2.7, 0, 1.9, -0.4);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });

    const safetyBoard = group(g, 2.7, 0, 1.0, 0.5);
    box(safetyBoard, 0.5, 0.4, 0.03, 0, 1.1, 0, 0x1b2026, { rough: 0.6 });
    decal(safetyBoard, 0.44, 0.34, 0, 1.1, 0.018,
      signFace("TWO HANDS\nEVERY\nCYCLE", { bg: "#0d1c24", accent: "#d9703a", fg: "#fff3d6", scale: 0.26 }));
    cyl(safetyBoard, 0.02, 0.02, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    slab(g, 2.2, 0.02, 0.7, 0, 0.01, 0.9, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      box(g, 0.09, 0.006, 0.09, -0.95 + i * 0.32, 0.022, 0.68 + j * 0.44, 0x14171a, { cast: false, receive: false });
    }

    // Overhead steam main feeding the boiler, on hangers, with lagging bands —
    // the supply this boiler actually draws from, not a boiler standing alone.
    const overhead = group(g, -1.6, 0, -1.6);
    cyl(overhead, 0.05, 0.05, 2.4, 0, 2.6, 0, 0xb9bec4, { rough: 0.5, metal: 0.5, seg: 14 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) box(overhead, 0.06, 0.02, 0.09, -1.1 + i * 0.55, 2.6, 0, 0x2b2f34, { rough: 0.6, cast: false });
    for (const hx of [-1.0, 0, 1.0]) cyl(overhead, 0.01, 0.01, 0.5, hx, 2.85, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(overhead, "Steam main", 0, 2.75, 0, { css: "#d9703a", w: 0.3 });

    // Small control panel beside the boiler with its own readouts.
    const panel = group(g, -1.6, 0, -1.9, 0.2);
    box(panel, 0.4, 0.5, 0.14, 0, 1.1, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    for (let i = 0; i < 3; i++) {
      cyl(panel, 0.03, 0.03, 0.015, -0.1 + i * 0.1, 1.25, 0.08, 0x0d1c24, { rough: 0.4, seg: 16 }).rotation.x = Math.PI / 2;
    }
    decal(panel, 0.34, 0.14, 0, 0.95, 0.08, signFace("BOILER PANEL", { bg: "#0d1c24", accent: "#d9703a", scale: 0.4 }), { px: 128 });
    holoTag(panel, "Control panel", 0, 1.4, 0.08, { css: "#d9703a", w: 0.32 });

    // A second stack of pressed pieces waiting to bag, and a cloth bolt rack
    // like the marking table's, tying this corner of the room to the others.
    const bagStack = group(g, 2.4, 0, 0.4, -0.4);
    for (let i = 0; i < 4; i++) box(bagStack, 0.4, 0.03, 0.28, 0, 0.1 + i * 0.05, 0, 0xdfe4e8, { rough: 0.75, opacity: 0.85, transparent: true });
    holoTag(bagStack, "Ready to bag", 0, 0.4, 0, { css: "#d9703a", w: 0.3 });

    const boltRack = group(g, -2.6, 0, 1.4, 0.3);
    const boltColours = [0x8fa6c9, 0x9a7448];
    boltColours.forEach((c, i) => {
      cyl(boltRack, 0.15, 0.15, 0.65, 0, 0.15 + i * 0.32, 0, c, { rough: 0.75, seg: 16 }).rotation.z = Math.PI / 2;
    });
    holoTag(boltRack, "Cloth bolts", 0, 0.9, 0, { css: "#d9703a", w: 0.26 });

    const spoolCart = group(g, 0.6, 0, 2.2, -0.3);
    box(spoolCart, 0.4, 0.04, 0.3, 0, 0.5, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(spoolCart, 0.02, 0.02, 0.5, sx * 0.16, 0.25, sz * 0.11, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    const spoolColours = [0xb8402f, 0x27904e, 0xe0972e];
    spoolColours.forEach((c, i) => cyl(spoolCart, 0.035, 0.035, 0.1, -0.1 + i * 0.1, 0.57, 0, c, { rough: 0.7, seg: 12 }));

    // A second presser at the background machine, clear of every control.
    const crew = standingFigure(g, 1.55, -1.95, { ry: -0.2, cloth: 0xf2f2f2, trousers: 0x2b3138 });
    void crew;

    let cycling = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -0.2),

      onStepComplete(step) {
        if (step.id === "relief-valve") { /* confirmed, no visual change needed beyond the tag already shown */ }
        if (step.id === "steam-valve") { valveWheelMesh.rotation.z += 1.2; }
        if (step.id === "guard-check") { tape.visible = false; }
        if (step.id === "lay-garment") { garment.parent.remove(garment); press.add(garment); garment.position.set(0, 0.975, 0); garment.rotation.set(0, 0, 0); }
        if (step.id === "head-open") { headArm.position.y = 2.35; }
        if (step.id === "scorch-check") { finishedPieces[1].position.x -= 0.14; finishedPieces[1].position.y += 0.05; }
        if (step.id === "lock-open-clean") { lockPropObj.visible = true; }
        if (step.id === "shutdown") { valveWheelMesh.rotation.z -= 1.2; powerHandle.position.y -= 0.05; }
      },

      onInterrupt(it) {
        if (it.id === "hose-leak") { leakJet.visible = true; }
        if (it.id === "hand-under-head") { estopCap.material = mat(0xff8a2a, { emissive: 0xff8a2a, ei: 2.0, rough: 0.4 }); garment.rotation.y = 0.3; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hose-leak") { leakJet.visible = false; }
        if (it.id === "hand-under-head") { estopCap.material = mat(0xd2312b, { rough: 0.4 }); garment.rotation.y = 0; }
      },

      animate(t, dt, session) {
        cycling = !!(session?.step?.id === "press-cycle" && session.holding);
        const target = cycling ? 0.98 : 2.0;
        headArm.position.y += (target - headArm.position.y) * Math.min(1, dt * 3);
        if (leakJet.visible) leakJet.userData.step(dt, new THREE.Vector3(0.15, 0, 0), 0.06, 0.9, -0.2);
        if (drip) drip.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.02, 0.15, -1.4);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "boiler-pressure") {
          repaint(gaugeObj.userData.screen, signFace(`${Math.round(60 + gg.t * 40)} psi`, {
            bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
