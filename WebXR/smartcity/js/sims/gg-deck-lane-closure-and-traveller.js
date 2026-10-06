import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Deck Lane Closure & Traveller VR — Construction & Structural
// Trades, the Bay Area bridge pack, on the golden-gate-deck district.
//
// Before any crew can work the cable from the traveller, the lanes under it
// are closed — and a closure is a piece of engineering in its own right: the
// advance warning, the arrow board and a taper long enough for traffic at
// speed to merge before it reaches the crew. The station is the crew's end of
// the district's own closure: set up with the traffic, walked, the traveller
// released, run and parked, and the closure taken down against the order it
// went up. The traveller here is the station's mock-up on a practice section.

const GGL_ACCENT = 0xf08a24;

export const SIM_GG_DECK_LANE_CLOSURE_AND_TRAVELLER = {
  id: "gg-deck-lane-closure-and-traveller",
  index: "228",
  domain: "Construction",
  trade: "Ironworkers and IMPACT — traveller crew setting their own lane closure, with a flagger on the closure and the traveller operator",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  weather: "overcast",
  certification: "Ironworkers and IMPACT bridge crew training; MUTCD Part 6 temporary traffic control for the advance warning, the arrow board, the taper and the buffer; ANSI/ASSP A10.47 work zone safety for highway construction; ANSI/ISEA 107 high-visibility apparel; OSHA 29 CFR 1926 and 29 CFR 1926.502 for the traveller's fall protection; 29 CFR 1926.106 for work over water; the owner's traveller operating procedure",
  name: "Deck Lane Closure & Traveller",
  title: simTitle("Deck Lane Closure & Traveller"),
  tagline: "The lanes closed before the cable is worked: the traffic control plan read, the advance sign, arrow board and taper set with the traffic, the taper measured, the buffer marked, the truck spotted in while a cyclist rides into the closure, the closure walked, the traveller released and run while a fog bank rolls in, parked and chocked, and the closure taken down in reverse",
  accent: GGL_ACCENT,
  accentCss: "#f08a24",
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "taper-to-the-plan", name: "Taper To The Plan", note: "A closure set with the traffic, a taper measured to the plan's length, and a traveller run and parked without a correction" },

  supportLine: "the Ironworkers' member assistance programme through your local, and the crew's peer-support contact",

  game: system({
    name: "Closure Crew",
    currency: "CONE",
    ranks: ["Cone Setter", "Flagger", "Closure Lead", "Traveller Operator", "Closure Crew Certified"],
    badges: [
      { id: "with-the-traffic", name: "With The Traffic", note: "Closure devices set in the order traffic meets them", test: AWARD.stepClean("set-closure") },
      { id: "smooth-run", name: "Smooth Run", note: "Traveller run held inside its speed band", test: AWARD.precise(0.72) },
      { id: "never-in-the-lane", name: "Never In The Lane", note: "Never stood with your back to traffic or stepped into an open lane", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-closure", name: "Clean Closure", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-traveller", name: "Steady Traveller", note: "The traveller run never dropped out of band", test: AWARD.unbroken },
      { id: "closure-inside-par", name: "Closure Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "short-taper": "You started the taper here, with the cones bunched into a fraction of the length the plan calls for. A taper is the distance traffic has to merge out of a closed lane, and it is set from the speed of that traffic: cut short, it turns a merge into a swerve, and the drivers who do not make it arrive in the buffer and then in the work space. The plan's length is measured, not paced by eye.",
    "back-to-traffic": "You stood in the lane line facing the work with your back to the open lanes. Traffic beside a closure is moving at speed past people who are concentrating on something else, and the one rule that costs nothing is to face it: a worker who can see a vehicle drifting toward the cones has a second to move, and one with their back to it has none. High-visibility apparel makes you seen; facing traffic lets you see.",
    "untethered-traveller-tool": "The traveller's spanner is lying loose on its platform grating, with the deck edge and the strait beyond. A traveller rides and sways on the cable, and anything loose on it walks to the low side; a tool that goes off a traveller falls onto the lanes this closure is protecting, or past the railing onto the water. It rides tethered to the traveller rail.",
    "cone-from-open-lane": "You stepped out past the channelising line into an open lane to fetch a cone that had rolled there. That cone is now traffic's problem, not yours: a person in an open lane beside a closure is a person drivers have not been warned about, and they are travelling too fast to react. It is called to the flagger and retrieved when traffic is held, or left.",
  },

  lateNotes: {
    "traveller-drive": "The traveller runs once its rail clamps are released and the closure below it has been walked.",
    "rail-chock": "The chock goes in once the traveller has been run to its parking position and its brake is set.",
    "closure-log": "The closure is logged once it has been taken down and the lanes are open again.",
  },

  steps: [
    {
      id: "tcp", kind: "select", target: "closure-plan",
      title: "Read the traffic control plan for the closure",
      cue: "Read the plan: which lanes close, the advance warning distance, the arrow board, the taper length for this road's speed, the buffer, and the flagger's position.",
      why: "A lane closure on a bridge deck is designed before it is set: MUTCD Part 6 ties the advance warning distance, the taper length and the buffer to the speed of the traffic passing it, and the plan puts those numbers on paper for this deck. The crew sets the plan, not a closure that looks about right, because the lengths are what give a driver at speed time to see, decide and merge.",
    },
    {
      id: "set-closure", kind: "sequence",
      targets: ["advance-sign", "arrow-board-switch", "taper-cone"],
      itemNames: { "advance-sign": "advance warning sign", "arrow-board-switch": "arrow board on, arrow showing the merge", "taper-cone": "taper cones, first cone upstream" },
      title: "Set the closure in the order traffic meets it",
      cue: "Set the advance warning sign first, then switch the arrow board on, then lay the taper from its upstream end.",
      why: "A closure is put up in the order traffic meets it, so that at every moment during the set-up a driver has already been warned about whatever is ahead of them. Cones laid before the sign is up are cones nobody was told to expect, placed by a crew standing in a lane nobody has been told is closing. ANSI/ASSP A10.47 and the plan both follow the traffic.",
      outOfOrderNote: "Advance sign first, then the arrow board, then the taper — a device set before its warning is a surprise to the next driver.",
    },
    {
      id: "measure-taper", kind: "gauge", target: "taper-wheel",
      title: "Measure the taper against the plan's length",
      cue: "Walk the measuring wheel along the taper, behind the cones, and commit the length when it reads inside the band for the plan.",
      why: "The taper is the part of a closure people shorten without meaning to: the cones run out, or the next light standard is in the way, and a taper paced by eye comes up short every time. Measured with the wheel from behind the channelising line, it is either the plan's length or a correction to make before the crew goes to work behind it.",
      gauge: {
        label: "TAPER · % OF PLAN LENGTH", speed: 0.66, green: [0.5, 0.72],
        readout: (t) => `${Math.round(60 + t * 70)}% of plan`,
        missNote: "That taper is short of the plan's length — or the wheel ran off the line. Re-lay the cones out to the plan's length before anyone works behind them.",
      },
    },
    {
      id: "buffer", kind: "drag", target: "buffer-cone",
      title: "Mark the end of the buffer space",
      cue: "Carry the buffer cone to the painted mark where the buffer ends and the work space begins.",
      why: "The buffer is the empty length between the taper and the work, and it exists so a vehicle that fails the merge runs out of momentum in open space rather than among the crew. Nothing is parked or stacked in it and nobody works in it, and its end is marked so everyone can see where the work space starts.",
      drag: { to: "buffer-mark", radius: 0.45, missNote: "Not on the mark — the buffer's end is the painted mark, not wherever the cone happens to stop." },
    },
    {
      id: "spot-truck", kind: "hold", target: "truck-backup-spot", seconds: 5,
      title: "Spot the crew truck back into the closure",
      cue: "Stand at the spotter's position where the driver can see you in the mirror and hold the spot while the truck reverses in behind the buffer.",
      why: "A truck reversing into a closure is backing toward a crew it cannot see behind it, through a space the crew has been using as a walkway. The spotter stands where the driver's mirror shows them, holds the spot for the whole reverse and stops the truck the moment anyone crosses behind it, because the most common way a work zone injures its own crew is its own vehicles.",
      holdBreakNote: "You left the spotter's position with the truck still reversing — the driver lost the only eyes behind the truck. Hold the spot until it stops.",
    },
    {
      id: "walk-closure", kind: "find", noHint: true,
      targets: ["cone-knocked-over", "sign-sandbag-missing", "arrow-lamp-out"],
      itemNames: {
        "cone-knocked-over": "a taper cone knocked flat",
        "sign-sandbag-missing": "the advance sign's stand without its sandbag",
        "arrow-lamp-out": "a dark lamp in the arrow board's arrow",
      },
      itemNotes: {
        "cone-knocked-over": "A cone in the taper has been knocked flat, leaving a gap in the line a driver reads as the edge of the lane. It is stood back up from behind the line, not from the lane.",
        "sign-sandbag-missing": "The advance warning sign's stand has no sandbag on its leg. On a bridge deck the wind off the strait takes an unweighted sign down, and a warning lying flat is no warning.",
        "arrow-lamp-out": "One lamp in the arrow's head is dark. An arrow with a gap in it reads as a flashing bar, not a direction, and the arrow is the device that tells drivers which way to merge.",
      },
      title: "Walk the closure from behind the line",
      cue: "Walk the closure from behind the channelising line and find what is not as the plan set it: the cones, the sign's ballast, the arrow board.",
      why: "A closure starts to fail the moment it is set: a passing truck clips a cone, the wind works at a sign, a lamp dies. The crew walks it before the work starts and at intervals after, from behind the line, because MUTCD Part 6 devices are only doing their job while they are where the plan put them and working as they were set.",
    },
    {
      id: "traveller-tag", kind: "select", target: "traveller-tag",
      title: "Check the traveller's pre-use inspection tag",
      cue: "Read the traveller's inspection tag: wheels, brake, rail clamps, guardrails and anchor points checked today, and signed.",
      why: "A traveller is a suspended platform that carries people over the lanes and the water on nothing but the cable, its wheels and its brake, and it is inspected before each shift's use rather than assumed from yesterday's. The tag is the record that a named person looked at the parts that hold the platform to the cable today; an unsigned tag is a platform nobody has vouched for.",
    },
    {
      id: "release-clamps", kind: "turn", target: "rail-clamp-screw",
      title: "Release the traveller's parking clamps",
      cue: "Back the parking clamp screws off the cable, both ends, until the traveller is held only by its brake.",
      why: "The parking clamps hold the traveller to the cable when it is not in use, so wind cannot move it overnight. They come off one end and then the other while the brake is still set, so there is no moment when the traveller is held by nothing; only when both clamps are clear is the traveller ready to run on its brake and drive.",
      turn: { turns: 1.0, label: "PARKING CLAMPS", readout: (t) => (t < 0.5 ? "upstream clamp backing off" : t < 0.98 ? "downstream clamp backing off" : "clamps clear — on the brake") },
    },
    {
      id: "run-traveller", kind: "track", target: "traveller-drive", seconds: 7,
      title: "Run the traveller along the cable at a controlled speed",
      cue: "Run the traveller on its pendant to the work position, holding the speed inside the band — no lurches, no creeping.",
      why: "A traveller moving on the cable swings its platform, and the swing grows with every lurch of the drive. Held at a steady speed inside the operating band, the platform stays under its carriage and the crew aboard keeps their footing; a traveller jerked on and off the drive swings into the suspender ropes and makes every person on it hold on instead of look.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, label: "TRAVELLER SPEED",
        readout: (v) => (v < 0.4 ? "creeping — stop-start" : v > 0.62 ? "too fast — the platform is swinging" : "steady run"),
      },
      holdBreakNote: "The speed left the band and the platform started to swing. Ease back into the band and let it settle.",
    },
    {
      id: "park", kind: "sequence",
      targets: ["traveller-brake", "rail-chock"],
      itemNames: { "traveller-brake": "traveller brake set", "rail-chock": "cable chock in against the wheel" },
      title: "Park the traveller: brake, then chock",
      cue: "At the work position set the brake, then put the cable chock in against the downhill wheel.",
      why: "On a sloping cable a traveller always wants to run downhill, and the brake is what stops it; the chock is what holds it if the brake is knocked off or slips while the crew works. The brake goes on first because a chock set against a moving wheel is a chock thrown off the cable, and a crew does not step off the carriage until both are in.",
      outOfOrderNote: "Brake first — the chock goes against a wheel that has already stopped.",
    },
    {
      id: "take-down", kind: "sequence",
      targets: ["taper-cone", "arrow-board-switch", "advance-sign"],
      itemNames: { "taper-cone": "taper cones, from the work end back", "arrow-board-switch": "arrow board off", "advance-sign": "advance warning sign last" },
      title: "Take the closure down against the order it went up",
      cue: "With the work finished, pick up the taper from the work end back, then switch the arrow board off, and take the advance sign down last.",
      why: "The closure comes down in the reverse of the order it went up, so the warning is the last thing traffic loses: while cones are still on the deck, the arrow board and the sign are still telling drivers to expect them. A sign taken down first leaves a crew picking up cones in a lane nobody has been warned about.",
      outOfOrderNote: "Taper first, sign last — the warning stays up until the last device it warns about is off the deck.",
    },
    {
      id: "closure-log", kind: "select", target: "closure-log",
      title: "Log the closure and the traveller run",
      cue: "Record the times the lanes closed and opened, the taper length measured, the defects found on the walk, and the traveller's run and parking.",
      why: "The closure log is the record the owner and the traffic authority read if anything happened in or near the closure: when it went up, how long the taper actually was, what had been knocked over and when it was put right. The traveller's run and parking position go with it, so the next crew knows where the traveller is and what was checked before it moved.",
    },
    {
      id: "crew-checkin", kind: "select", target: "closure-radio",
      title: "Check in with the flagger and the traveller operator",
      cue: "Call the flagger and the operator on the closure channel: lanes open, traveller parked and chocked, and how the crew is.",
      why: "The flagger is the last person on the deck and leaves on the call, and the operator needs to hear the traveller's parking has been checked by someone else. A shift beside moving traffic, with a cyclist in the closure and the deck gone grey in fog, is one people carry home, so the crew checks in before the truck pulls out; the Ironworkers' member assistance line is there if it stays.",
    },
  ],

  interrupts: [
    {
      id: "cyclist-in-closure",
      kind: "Cyclist in the closure",
      after: "spot-truck", delay: 2, seconds: 12,
      alert: "A cyclist has come off the sidewalk through the barrier gap and is riding into the closure — straight across the path of the reversing truck.",
      cue: "Raise the stop paddle and call the truck to stop — the cyclist is behind it.",
      target: "stop-paddle",
      why: "A cyclist who has ridden into a closure does not know a truck is reversing, and the truck's driver cannot see them. The stop paddle is the signal both of them understand: it stops the truck through the driver's mirror and it stops the cyclist on sight. The spot is not abandoned — the paddle goes up from the spotter's position, and the truck moves again only when the cyclist is out of its path.",
      missNote: "The truck kept reversing with a cyclist crossing behind it, and the only person who could see both of them did not stop either.",
      wrongNote: "The stop paddle — the truck has to stop before anything else, and the paddle is what its driver is watching for.",
    },
    {
      id: "fog-on-the-run",
      kind: "Fog bank rolling in",
      after: "run-traveller", delay: 3, seconds: 13,
      alert: "A fog bank rolls in off the strait and over the railing — the traveller's far end and the flagger at the closure disappear into grey.",
      cue: "Switch the traveller's beacon on and slow the run — the flagger and the traffic below have to be able to see it.",
      target: "beacon-switch",
      why: "In fog a traveller moving over the lanes is a moving load nobody below can see, and the crew aboard can no longer see the flagger or the closure edge. The beacon makes the traveller visible through the grey to the flagger and to traffic in the open lanes, and the run slows because stopping distance in fog is the distance you can see, which has just shrunk.",
      missNote: "The traveller ran on into the fog with no beacon, invisible to the flagger and to the traffic beside the closure, at a speed set for clear air.",
      wrongNote: "The beacon switch — before anything else, the traveller has to be visible through the fog.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGL_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3c4249", base2: "#32383e" }), { repeat: 3, px: 256 });
    const workMat = box(g, 3.6, 0.02, 3.0, -1.0, 0.01, -0.6, 0x3c4249, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ closure devices on the open-lane side
    const signStand = group(g, 2.55, 0, 2.2, -0.4);
    for (const a of [-0.5, 0.5]) { const l = box(signStand, 0.04, 1.0, 0.04, a * 0.5, 0.45, 0, 0x5a636c, { rough: 0.5, metal: 0.5 }); l.rotation.z = a * 0.5; }
    const leg = box(signStand, 0.04, 0.04, 0.6, 0, 0.03, 0, 0x5a636c, { rough: 0.5, metal: 0.5 });
    void leg;
    const diamond = group(signStand, 0, 1.3, 0.02);
    diamond.rotation.z = Math.PI / 4;
    box(diamond, 0.6, 0.6, 0.02, 0, 0, 0, 0xf08a24, { rough: 0.6 });
    decal(signStand, 0.5, 0.26, 0, 1.3, 0.035, signFace("LANES CLOSED AHEAD", { bg: "#f08a24", accent: "#1a1e23", fg: "#111", scale: 0.42 }), { px: 256 });
    holoTag(signStand, "advance sign", 0, 1.85, 0, { css: "#f08a24", w: 0.28 });
    reg(hits, signStand, "advance-sign");
    const noBag = box(signStand, 0.18, 0.1, 0.12, 0.28, 0.06, 0.2, 0x3a3020, { opacity: 0.35, transparent: true, rough: 0.9 });
    reg(hits, noBag, "sign-sandbag-missing");

    const ab = group(g, 2.6, 0, -0.4, -0.3);
    box(ab, 0.8, 0.4, 1.0, 0, 0.35, 0, 0xe8b830, { rough: 0.6, metal: 0.3 });
    box(ab, 0.08, 1.2, 0.08, 0, 1.1, 0.3, 0xe8b830, { rough: 0.6, metal: 0.3 });
    box(ab, 1.2, 0.6, 0.06, 0, 1.9, 0.34, 0x1a1e23, { rough: 0.8 });
    const lamps = [];
    for (let i = 0; i < 6; i++) lamps.push(ball(ab, 0.035, -0.42 + i * 0.14, 1.9, 0.38, 0xffb13a, { emissive: 0xffb13a, ei: 2, seg: 8, seg2: 6 }));
    for (const [lx, ly] of [[0.28, 2.04], [0.28, 1.76], [0.14, 2.1]]) lamps.push(ball(ab, 0.035, lx, ly, 0.38, 0xffb13a, { emissive: 0xffb13a, ei: 2, seg: 8, seg2: 6 }));
    const deadLamp = ball(ab, 0.035, 0.14, 1.7, 0.38, 0x3a3020, { rough: 0.8, seg: 8, seg2: 6 });
    reg(hits, deadLamp, "arrow-lamp-out");
    const abSwitch = group(ab, -0.3, 0.62, 0.52);
    box(abSwitch, 0.16, 0.12, 0.06, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    box(abSwitch, 0.03, 0.06, 0.03, 0, 0.04, 0.04, 0x59c97b, { rough: 0.5 });
    holoTag(abSwitch, "arrow board switch", 0, 0.14, 0.02, { css: "#f08a24", w: 0.36 });
    reg(hits, abSwitch, "arrow-board-switch");

    const taper = group(g, 0, 0, 0);
    const taperCones = [];
    for (let i = 0; i < 5; i++) taperCones.push(cone(taper, 2.9 - i * 0.28, 2.6 - i * 0.7, { color: GGL_ACCENT }));
    reg(hits, taperCones[0], "taper-cone");
    holoTag(taper, "taper — first cone", 2.9, 0.8, 2.6, { css: "#f08a24", w: 0.34 });
    const flat = group(g, 2.05, 0.1, 0.5);
    flat.rotation.z = Math.PI / 2;
    cyl(flat, 0.03, 0.13, 0.55, 0, 0, 0, GGL_ACCENT, { rough: 0.75, seg: 12 });
    reg(hits, flat, "cone-knocked-over");
    const shortRun = group(g, 1.2, 0, 2.55);
    for (let i = 0; i < 3; i++) cone(shortRun, i * 0.22, -i * 0.12, { color: GGL_ACCENT });
    const shortHit = box(shortRun, 0.7, 0.5, 0.4, 0.22, 0.3, -0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(shortRun, "start the taper here?", 0.22, 0.85, -0.12, { css: "#d2312b", w: 0.42 });
    reg(hits, shortHit, "short-taper");
    const laneHit = box(g, 0.6, 1.6, 0.6, 3.35, 0.8, 1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand here, back to traffic?", 3.35, 1.75, 1.1, { css: "#d2312b", w: 0.5 });
    reg(hits, laneHit, "back-to-traffic");
    const strayCone = group(g, 3.5, 0, -1.3);
    cone(strayCone, 0, 0, { color: GGL_ACCENT });
    const strayHit = box(strayCone, 0.4, 0.7, 0.4, 0, 0.35, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(strayCone, "fetch it from the open lane?", 0, 0.85, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, strayHit, "cone-from-open-lane");

    const wheel = group(g, 1.35, 0, 1.3, 0.4);
    cyl(wheel, 0.015, 0.015, 0.9, 0, 0.45, 0, 0x2b3138, { rough: 0.6, seg: 8 }).rotation.x = 0.35;
    torus(wheel, 0.15, 0.02, 0, 0.15, -0.16, 0xe8b830, { rough: 0.6, seg: 6, seg2: 18 }).rotation.y = Math.PI / 2;
    const wheelScreen = instrument(wheel, 0, 0.86, 0.15, { idle: "-- %", color: GGL_ACCENT, w: 0.1, d: 0.12 });
    holoTag(wheel, "measuring wheel", 0, 1.08, 0.15, { css: "#f08a24", w: 0.32 });
    reg(hits, wheel, "taper-wheel");
    const bufferCone = cone(g, 2.1, 1.55, { color: 0xf2f2f2 });
    holoTag(bufferCone, "buffer cone — carry", 0, 0.75, 0, { css: "#f08a24", w: 0.36 });
    reg(hits, bufferCone, "buffer-cone");
    const bufferMark = group(g, 1.75, 0.022, -1.55);
    box(bufferMark, 0.8, 0.004, 0.1, 0, 0, 0, 0xf2f2f2, { rough: 0.7, emissive: 0xf2f2f2, ei: 0.3, cast: false });
    decal(bufferMark, 0.6, 0.16, 0, 0.003, 0.16, signFace("END OF BUFFER", { bg: "#1a1e23", accent: "#f08a24", fg: "#f2f2f2", scale: 0.4 }), { px: 192 }).rotation.x = -Math.PI / 2;
    reg(hits, bufferMark, "buffer-mark");

    // ------------------------------------------------ the spotter's position, paddle, radio
    const spot = group(g, -1.6, 0.012, 1.7);
    torus(spot, 0.3, 0.02, 0, 0, 0, GGL_ACCENT, { emissive: GGL_ACCENT, ei: 1.4, rough: 0.5, cast: false, seg: 6, seg2: 24 }).rotation.x = Math.PI / 2;
    holoTag(spot, "spotter position — hold", 0, 0.5, 0, { css: "#f08a24", w: 0.42 });
    reg(hits, spot, "truck-backup-spot");
    const paddle = group(g, -2.45, 0, 1.35);
    cyl(paddle, 0.02, 0.02, 1.6, 0, 0.8, 0, 0x2b3138, { rough: 0.6, seg: 8 });
    const paddleFace = decal(paddle, 0.42, 0.42, 0, 1.75, 0.012, signFace("STOP", { bg: "#c8201c", accent: "#ffffff", fg: "#ffffff", scale: 0.8 }), { px: 192 });
    holoTag(paddle, "stop paddle", 0, 2.08, 0, { css: "#f08a24", w: 0.26 });
    reg(hits, paddle, "stop-paddle");
    const chest = toolChest(g, -2.5, -0.3, { ry: 1.3, color: 0x7a4a22 });
    const radio = instrument(chest, 0.14, 0.79, 0.03, { ry: 0.1, idle: "CLOSURE CH", color: GGL_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "closure radio", 0, 0.15, 0, { css: "#f08a24", w: 0.28 });
    reg(hits, radio, "closure-radio");

    // ------------------------------------------------ the traveller on its practice section
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 1, rows: 12, pitch: 30 }), { repeat: 2, px: 256 });
    const sec = group(g, -1.0, 0, -1.6);
    const cab = cyl(sec, 0.22, 0.22, 3.6, 0, 2.2, 0, 0xc8461d, { rough: 0.62, metal: 0.3, seg: 18 });
    cab.rotation.z = Math.PI / 2 + 0.05;
    cab.material = texturedMat(steelTex, { rough: 0.62, metal: 0.3 });
    for (const px of [-1.7, 1.7]) {
      box(sec, 0.14, 2.1, 0.14, px, 1.05, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
      box(sec, 0.5, 0.04, 0.5, px, 0.02, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    }
    const trav = group(sec, -0.6, 2.2, 0);
    for (const dx of [-0.22, 0.22]) torus(trav, 0.12, 0.03, dx, 0.22, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 6, seg2: 16 });
    box(trav, 0.7, 0.1, 0.34, 0, 0.1, 0, 0x2a2f35, { rough: 0.6, metal: 0.5 });
    for (const sx of [-0.3, 0.3]) box(trav, 0.04, 1.3, 0.04, sx, -0.6, 0, CITY.hiVis, { rough: 0.55 });
    const platform = box(trav, 1.0, 0.05, 0.8, 0, -1.25, 0.2, 0x5a636c, { rough: 0.6, metal: 0.5 });
    void platform;
    box(trav, 1.0, 0.05, 0.04, 0, -0.75, 0.6, CITY.hiVis, { rough: 0.55 });
    box(trav, 1.0, 0.05, 0.04, 0, -1.0, 0.6, CITY.hiVis, { rough: 0.55 });
    const beacon = ball(trav, 0.07, 0, 0.26, 0, 0xf2a03a, { emissive: 0xf2a03a, ei: 2.4, seg: 10, seg2: 8 });
    beacon.visible = false;
    const tSpanner = group(trav, 0.3, -1.2, 0.5, 0.3);
    box(tSpanner, 0.18, 0.015, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8 });
    reg(hits, tSpanner, "untethered-traveller-tool");
    const tag = decal(trav, 0.12, 0.08, -0.36, 0.1, 0.18, paperFace("INSPECTED", ["TODAY", "SIGNED"], { bg: "#f2e6c8", band: "#59c97b" }), { px: 128 });
    holoTag(trav, "inspection tag", -0.36, 0.24, 0.18, { css: "#f08a24", w: 0.28 });
    reg(hits, tag, "traveller-tag");
    const clamps = group(sec, 0.1, 2.2, 0.2);
    box(clamps, 0.12, 0.14, 0.12, 0, 0, 0, 0xe8b830, { rough: 0.5, metal: 0.5 });
    const clampHandle = box(clamps, 0.14, 0.014, 0.014, 0, 0, 0.08, 0x2b3138, { rough: 0.6 });
    holoTag(clamps, "parking clamps — turn", 0, 0.18, 0.06, { css: "#f08a24", w: 0.4 });
    reg(hits, clamps, "rail-clamp-screw");
    const brake = group(sec, -1.25, 1.35, 0.25);
    torus(brake, 0.07, 0.014, 0, 0, 0, 0xb8402f, { rough: 0.55, seg: 6, seg2: 16 });
    for (let i = 0; i < 3; i++) box(brake, 0.14, 0.012, 0.012, 0, 0, 0, 0xb8402f, { rough: 0.55 }).rotation.z = (i * Math.PI) / 3;
    holoTag(brake, "traveller brake", 0, 0.14, 0, { css: "#f08a24", w: 0.3 });
    reg(hits, brake, "traveller-brake");
    const chock = group(sec, 1.2, 2.44, 0);
    box(chock, 0.16, 0.1, 0.16, 0, 0, 0, 0xe8b830, { rough: 0.6 });
    holoTag(chock, "cable chock", 0, 0.16, 0, { css: "#f08a24", w: 0.26 });
    reg(hits, chock, "rail-chock");
    const pendant = group(sec, 0.55, 1.2, 0.35);
    box(pendant, 0.1, 0.22, 0.07, 0, 0, 0, 0xe8b830, { rough: 0.6 });
    for (let i = 0; i < 3; i++) cyl(pendant, 0.015, 0.015, 0.02, 0, 0.06 - i * 0.05, 0.04, [0x59c97b, 0xf2c14b, 0xd8232a][i], { rough: 0.5, seg: 8 }).rotation.x = Math.PI / 2;
    hose(sec, [[0.55, 1.31, 0.35], [0.3, 1.8, 0.2], [-0.4, 2.3, 0.1]], 0.008, 0x1b1e23, { steps: 10, rough: 0.7 });
    holoTag(pendant, "traveller pendant", 0, 0.2, 0.04, { css: "#f08a24", w: 0.32 });
    reg(hits, pendant, "traveller-drive");
    const bSwitch = group(sec, 0.9, 1.2, 0.35);
    box(bSwitch, 0.08, 0.1, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    const bLed = box(bSwitch, 0.03, 0.03, 0.02, 0, 0.02, 0.03, 0x3a3020, { rough: 0.5 });
    holoTag(bSwitch, "beacon switch", 0, 0.12, 0.03, { css: "#f08a24", w: 0.28 });
    reg(hits, bSwitch, "beacon-switch");

    // ------------------------------------------------ paperwork
    const plan = holoPanel(g, 0.92, 0.62, -2.55, 1.35, 0.95, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f08a24"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe8cf"; cx.fillText("TRAFFIC CONTROL PLAN", w * 0.06, h * 0.13);
      cx.strokeStyle = "#f08a24"; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(w * 0.62, h * 0.9); cx.lineTo(w * 0.8, h * 0.45); cx.lineTo(w * 0.8, h * 0.2); cx.stroke();
      cx.font = `${Math.round(h * 0.064)}px Arial, sans-serif`; cx.fillStyle = "#fff2e4";
      ["Advance warning: per the plan's distance", "Arrow board: arrow to the open lanes", "Taper: length for this road's speed",
       "Buffer: clear, marked at its end", "Flagger at the closure throughout", "Remove in reverse order"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: 1.2, accent: GGL_ACCENT });
    reg(hits, plan, "closure-plan");
    const log = holoPanel(g, 0.7, 0.48, 0.2, 1.4, 2.55, (cx, w, h) => {
      cx.fillStyle = "rgba(20,12,4,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#f08a24"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe8cf"; cx.fillText("CLOSURE LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#fff2e4";
      ["Closed: —", "Taper: —", "Walk: —", "Traveller: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0, accent: GGL_ACCENT });
    reg(hits, log, "closure-log");

    // ------------------------------------------------ crew, the cyclist, the fog bank
    const flagger = standingFigure(g, -2.7, 2.1, { ry: 2.4, cloth: 0x2b3138, vest: 0xd4ff3a, helmet: 0xf2f2f2 });
    holoTag(flagger, "flagger", 0, 1.95, 0, { css: "#59c97b", w: 0.2 });
    const operator = standingFigure(g, 0.3, -2.55, { ry: 0.3, cloth: 0x1f3a52, vest: 0xe4dc3a, helmet: 0xf2c14b, harness: true });
    holoTag(operator, "traveller operator", 0, 1.95, 0, { css: "#59c97b", w: 0.36 });

    const cyclist = group(g, -9.5, 0, 8.5, 2.3);
    for (const dz of [-0.5, 0.5]) torus(cyclist, 0.32, 0.03, 0, 0.34, dz, 0x1a1e23, { rough: 0.8, seg: 6, seg2: 20 }).rotation.y = Math.PI / 2;
    box(cyclist, 0.04, 0.04, 1.0, 0, 0.55, 0, 0xd8232a, { rough: 0.4, metal: 0.5 });
    const rider = standingFigure(cyclist, 0, 0, { atStation: true, cloth: 0xd8232a, cap: 0x1a1e23 });
    rider.position.y = 0.2;
    cyclist.visible = false;
    const cyclistHome = cyclist.position.clone();

    const fog = group(g, -50, 0, -4);
    const fogMat = { rough: 1, opacity: 0.55, transparent: true, cast: false, receive: false };
    box(fog, 9, 8, 28, 0, 3, 0, 0xdfe5e9, fogMat);
    box(fog, 10, 6, 20, -4, 2, 9, 0xe8ecef, fogMat);
    box(fog, 7, 11, 16, 3, 4.5, -9, 0xd6dde2, fogMat);
    fog.visible = false;
    const fogHome = fog.position.clone();

    let riding = false, fogOn = false;
    const travHome = trav.position.clone();

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.2, -0.6),
      onStepComplete(step) {
        if (step.id === "set-closure") for (const l of lamps) l.visible = true;
        if (step.id === "buffer") bufferCone.position.set(1.75, 0, -1.55);
        if (step.id === "walk-closure") { flat.rotation.z = 0; flat.position.y = 0.29; deadLamp.material = mat(0xffb13a, { emissive: 0xffb13a, ei: 2 }); noBag.material = mat(0x6b5a3a, { rough: 0.9 }); }
        if (step.id === "release-clamps") clamps.visible = false;
        if (step.id === "run-traveller") trav.position.x = 0.8;
        if (step.id === "park") chock.position.set(1.15, 2.4, 0);
        if (step.id === "take-down") { taper.visible = false; for (const l of lamps) l.visible = false; signStand.rotation.z = Math.PI / 2; signStand.position.y = 0.1; }
        if (step.id === "closure-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(20,12,4,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#ffe8cf"; cx.fillText("CLOSURE LOG", w * 0.06, h * 0.15);
          cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#fff2e4";
          ["Closed / opened: times recorded", "Taper: measured to the plan", "Walk: cone, sandbag, lamp — corrected", "Traveller: run, braked, chocked"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
        });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LANES OPEN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "cyclist-in-closure") { riding = true; cyclist.visible = true; cyclist.position.set(-5.5, 0, 5.2); }
        if (it.id === "fog-on-the-run") { fogOn = true; fog.visible = true; fog.position.set(-24, 0, -4); }
      },
      onInterruptEnd(it) {
        if (it.id === "cyclist-in-closure") {
          riding = false;
          if (it.resolved === "answered") { cyclist.position.set(-8.5, 0, 7.6); cyclist.rotation.y = -0.8; paddleFace.rotation.y = 0.3; }
        }
        if (it.id === "fog-on-the-run" && it.resolved === "answered") {
          beacon.visible = true;
          bLed.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.5 });
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-traveller-tool") tSpanner.position.z = 0.58;
      },
      animate(t, dt, session) {
        const d = dt ?? 0.016;
        if (riding && cyclist.position.x < -2.6) { cyclist.position.x += d * 1.2; cyclist.position.z -= d * 1.0; }
        if (!cyclist.visible) cyclist.position.copy(cyclistHome);
        if (fogOn && fog.position.x < -12) fog.position.x += d * 0.8;
        if (!fogOn && fog.position.x !== fogHome.x) fog.position.copy(fogHome);
        for (let i = 0; i < lamps.length; i++) lamps[i].material.emissiveIntensity = (t % 1.2) < 0.75 ? 2 : 0.2;
        if (beacon.visible) beacon.material.emissiveIntensity = Math.sin(t * 6) > 0 ? 2.6 : 0.4;
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "measure-taper") repaint(wheelScreen.userData.screen, signFace(`${Math.round(60 + gg.t * 70)}%`, { bg: "#0d1c24", accent: gg.t >= 0.5 && gg.t <= 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "run-traveller" && session.track) trav.position.x = travHome.x + session.track.v * 1.6;
        if (session?.turn && step?.id === "release-clamps") clampHandle.rotation.z = session.turn.amount * Math.PI * 2;
        void CITY;
      },
    };
  },
};
