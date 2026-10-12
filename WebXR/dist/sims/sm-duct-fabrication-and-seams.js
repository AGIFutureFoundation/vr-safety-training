import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Duct Fabrication and Seams VR — Manufacturing & Automation,
// SMART sheet metal pack. Turning sheared blanks into a rectangular duct
// section: corners notched, the Pittsburgh lock rolled on the lock former,
// sides bent on the box-and-pan brake, the lock closed, the transverse flange
// rolled and cornered, the seams sealed to the class on the drawing, and the
// section stencilled and logged. A duct is a pressure vessel with a
// tolerance of a few pascals; the seam is where it either holds or leaks,
// and the lock former is where an apprentice's fingers meet a pair of
// rollers that do not stop for them.

const SMDF_ACCENT = 0x6fa8c8;

export const SIM_SM_DUCT_FABRICATION_AND_SEAMS = {
  id: "sm-duct-fabrication-and-seams",
  index: "218",
  domain: "Manufacturing & Automation",
  trade: "Sheet metal fabricator — SMART, International Training Institute duct construction curriculum",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "SMART and its International Training Institute duct fabrication curriculum; SMACNA HVAC Duct Construction Standards — Metal and Flexible for pressure class, seam type, transverse joint and seal class; OSHA 29 CFR 1910.212 point-of-operation guarding on the lock former, notcher and coil line, 29 CFR 1910.147 lockout/tagout on the coil line, 29 CFR 1910.138 hand protection for raw edges; ANSI B11 machine safety series",
  name: "Duct Fabrication and Seams",
  title: simTitle("Duct Fabrication and Seams"),
  tagline: "Pressure class off the drawing, corners notched, a Pittsburgh lock rolled and closed, sides braked to angle, the flange rolled and cornered, seams sealed to class, the section stencilled and logged",
  accent: SMDF_ACCENT,
  accentCss: "#6fa8c8",
  parSeconds: 280,
  footprint: 2.2,
  badge: { id: "seam-to-class", name: "Seam To Class", note: "A section built to the drawing's pressure and seal class, with nothing fed past the infeed guard" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's training coordinator or the shop steward, or your employer's employee assistance program if the rollers are what you keep seeing",

  game: system({
    name: "Fab Shop",
    currency: "SEAM",
    ranks: ["Pre-apprentice", "Fab Apprentice", "Lock Former", "Fab Lead", "Fab Shop Certified"],
    badges: [
      { id: "class-read", name: "Class Read", note: "The pressure and seal class taken from the drawing before the first notch", test: AWARD.stepClean("spec-read") },
      { id: "fingers-front", name: "Fingers Front", note: "Nothing past the infeed guard, nothing bare on a raw edge", test: AWARD.safe },
      { id: "square-section", name: "Square Section", note: "Brake angle inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-section", name: "Clean Section", note: "One section, no corrections", test: AWARD.clean },
      { id: "steady-bead", name: "Steady Bead", note: "Sealant run without a break", test: AWARD.unbroken },
      { id: "section-in-time", name: "Section In Time", note: "Stencilled inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "roller-nip": "Your fingers followed the blank into the lock former's rollers. The infeed guard is set so a sheet passes and a hand does not, and the rollers pull at the speed of the sheet — faster than a reflex. A blank that hangs up is backed out with the machine stopped, never pushed through with a fingertip.",
    "coil-guard-off": "You reached across the coil line while its guard interlock was bypassed. The coil line shears and beads under power at the touch of a button, and the interlock is what 29 CFR 1910.212 relies on to keep it from doing so with a hand inside; a bypassed interlock is a guard that exists only on the drawing. The line is locked out and the interlock restored before anybody reaches into it.",
    "bare-edge-stack": "You picked a blank off the stack by its raw edge without gloves. Every edge on that stack came off a shear an hour ago and has not been hemmed yet; SMART shops treat a stack of unhemmed blanks as a stack of knives, which is what it is. Gloves on, and lift by the faces, not the edges.",
    "wrong-sealant": "You reached for the general-purpose tube instead of the listed duct sealant. The drawing's seal class assumes a sealant tested for the duct's pressure, temperature and the movement of a metal seam; a hardware-store caulk cracks off the lock in a season and the duct leaks exactly where the test could not see it. The listed tube is the only one that goes on a duct.",
  },

  lateNotes: {
    "lock-closer": "The lock is closed after the sides are braked and the section is square — closing it flat on the bench closes a seam that then has to be bent, and the bend opens it again.",
    "seal-gun": "Sealant goes on a finished, closed seam. A bead over an open lock is sealant on the floor by tomorrow.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "fab-board",
      title: "Sign on at the fab shop board",
      cue: "Mark yourself onto the lock former and note who is on the coil line and the brake beside you.",
      why: "A fab shop is three machines within an arm's reach of each other, and the board is how the people at them know who is where. Signing on means the coil line operator knows there is somebody at the lock former behind them before the line starts, and the lead knows an apprentice is on rollers that pull at sheet speed; SMART shops treat that board as the first guard on every machine in the room, because a machine started without knowing who is beside it is a machine started blind.",
    },
    {
      id: "spec-read", kind: "select", target: "duct-drawing",
      title: "Take the pressure, seam and seal class off the drawing",
      cue: "Find the pressure class, the gauge it demands, the seam type and the SMACNA seal class before a corner is notched.",
      why: "The drawing's pressure class sets the gauge, the seam type and the reinforcement under the SMACNA HVAC Duct Construction Standards, and the seal class says which seams get sealant at all. A section built from habit instead of the drawing is a section for a different duct: too light a gauge oil-cans under pressure, an unsealed transverse joint on a class A run leaks the air the whole system was sized to deliver, and neither fault is visible on the bench.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["edge-gloves", "shop-glasses"],
      itemNames: { "edge-gloves": "cut-resistant gloves", "shop-glasses": "safety glasses" },
      title: "Gloves and glasses before the stack",
      cue: "Cut-resistant gloves and glasses from the station — the blanks are unhemmed.",
      why: "The stack beside the lock former is sheared blanks with nothing done to the edges yet, and the hand protection 29 CFR 1910.138 asks for is rated against exactly that edge. Glasses are for the corner that springs when a notch is cut and for the sealant that flicks off a bead; both are the kind of thing that happens once in a career and takes an eye the one time it does.",
    },
    {
      id: "notch", kind: "select", target: "notcher",
      title: "Notch the corners on the notcher",
      cue: "Set the blank against the notcher stops and take the four corner notches, hands on the sheet's face and clear of the blade opening.",
      why: "The notches let the lock and the flange form without the corners fighting each other, and they are cut against the stops so all four are the same, because a corner notched deep on one side and shallow on the other is a section that will not square. The notcher blade is a small guillotine with a stop-controlled throat; the sheet goes to the stop and the fingers stay on the face.",
    },
    {
      id: "lock-feed", kind: "drag", target: "duct-blank",
      title: "Bring the blank to the lock former",
      cue: "Carry the notched blank to the lock former's infeed and set its edge into the infeed guide.",
      why: "The blank enters the rollers along the guide so the lock forms straight and full-depth from the first inch; a blank started crooked forms a lock that tapers, and a tapered lock will not take the flange it has to mate with. The infeed guide is also the guard — the sheet is fed by its trailing edge and the guide is what keeps a hand out of the nip.",
      drag: { to: "lock-infeed", radius: 0.4, missNote: "Not in the infeed guide — a blank started off the guide rolls a lock that tapers along its length." },
    },
    {
      id: "roll-lock", kind: "track", target: "pittsburgh-feed", seconds: 6,
      title: "Roll the Pittsburgh lock",
      cue: "Feed the blank through the rollers at a steady rate — guide it from behind, never ahead of the infeed guard.",
      why: "The rollers form the lock in stages along the machine, and they do it evenly only if the sheet arrives at the speed the rollers pull it; a sheet held back stretches the pocket, a sheet pushed rides up and jams. Steady feed keeps both hands at the trailing edge where the guard protects them, which is the other reason the pace matters — the hand that hurries a sheet is the hand that follows it into the nip.",
      track: { label: "FEED", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 20)} m/min` },
      holdBreakNote: "The feed hunted — the sheet rode up and the lock pocket has a flat in it. Hold the pace steady.",
    },
    {
      id: "brake-bend", kind: "gauge", target: "brake-angle",
      title: "Brake the sides to angle",
      cue: "Bend the sides on the box-and-pan brake and commit inside the angle band.",
      why: "A rectangular duct is only rectangular if its bends are; a side braked short leaves a lock that will not reach its pocket, a side braked over leaves a joint that gaps at the flange. Springback varies with gauge and with how the sheet was sheared, so the angle is read off the protractor on the first bend rather than off the brake's stop, and the stop is adjusted to the metal rather than the other way round.",
      gauge: { label: "ANGLE", speed: 0.72, green: [0.46, 0.6], readout: (t) => `${(84 + t * 12).toFixed(1)}°`, missNote: "Off the angle — a side out of square is a lock that never seats. Reset the stop and bend again." },
    },
    {
      id: "close-lock", kind: "turn", target: "lock-closer",
      title: "Close the lock",
      cue: "Set the flange of the mating side into the pocket and turn the lock down with the seaming tool along its length.",
      why: "The Pittsburgh lock holds because the flange sits full-depth in the pocket and the pocket's lip is hammered over onto it; a lock closed with the flange short in the pocket looks the same from outside and opens the first time the duct is pressurised. Closing it in one continuous pass from one end, rather than in spots, keeps the section straight instead of banana-shaped.",
      turn: { turns: 1, axis: "z", label: "SEAM" },
    },
    {
      id: "flange", kind: "sequence",
      targets: ["flange-roll", "flange-corners"],
      itemNames: { "flange-roll": "roll the transverse flange", "flange-corners": "fit the corner pieces" },
      title: "Roll and corner the transverse flange",
      cue: "Roll the flange on both ends of the section, then drive the corner pieces into the flange at all four corners.",
      why: "The transverse joint is where this section meets the next, and the SMACNA HVAC Duct Construction Standards give it a flange type and reinforcement by pressure class; the flange is rolled before the corners go in because the corners lock into a formed flange, not a flat edge. Corners driven into a flange that was not fully rolled sit proud, and a proud corner is a joint that leaks at the one point a gasket cannot reach.",
      outOfOrderNote: "Flange first, then the corners — a corner piece has nothing to lock into on an unrolled edge.",
    },
    {
      id: "seal", kind: "hold", target: "seal-gun", seconds: 4,
      title: "Seal the seams to class",
      cue: "Run a continuous bead of the listed duct sealant along the lock and into the flange corners, without lifting the gun.",
      why: "The seal class on the drawing decides whether the longitudinal seam, the transverse joint or both are sealed, and a seal is only a seal if it is continuous; a bead lifted and restarted leaves a pinhole under a skin of sealant that passes a glance and fails a leakage test. The gun stays down for the whole run, and the listed sealant is the one that survives the duct's pressure and the temperature swing.",
      holdBreakNote: "You lifted the gun mid-bead — a pinhole under a skin of sealant. Go back to where you stopped and run it through.",
    },
    {
      id: "edge-walk", kind: "find", noHint: true,
      targets: ["raw-edge", "open-lock"],
      itemNames: { "raw-edge": "an unhemmed raw edge", "open-lock": "a lock not fully closed" },
      itemNotes: {
        "raw-edge": "That edge was meant to be hemmed and was not — on a duct that goes out to a crew who install it bare-handed in a ceiling, that is a cut waiting for whoever lifts it.",
        "open-lock": "The lock is closed at the ends and open in the middle where the seaming tool skipped; the section will hold on the bench and leak along its length under pressure.",
      },
      title: "Walk the section before it leaves the bench",
      cue: "Run a gloved hand along every edge and seam and click the two things wrong with it.",
      why: "A finished section is inspected by the person who made it, on the bench, because the next person to touch it is an installer on a lift with the section over their head. A raw edge is a wound in that person's hand; an open lock is a leak the balancing crew will chase for a day. Both are found in a minute with a gloved hand run along the metal and cost hours to find anywhere else.",
    },
    {
      id: "stencil", kind: "select", target: "class-stencil",
      title: "Stencil the section",
      cue: "Mark the section with the job, the pressure class, the seal class and the run it belongs to.",
      why: "A duct section with no marking is a section the installer guesses at, and a class 2 section hung on a class 4 riser is a duct that oil-cans and leaks at every joint the day the fans start. The stencil ties the metal to the drawing, and it is the first thing the inspector asks to see when a seam class is questioned on site, because it says the fabricator knew what they were building.",
    },
    {
      id: "handoff", kind: "find", noHint: true,
      targets: ["sharp-corner", "missing-corner-piece"],
      itemNames: { "sharp-corner": "a sharp unbroken corner", "missing-corner-piece": "a flange corner with no corner piece" },
      itemNotes: {
        "sharp-corner": "The notch left a point on that corner and nobody broke it — it goes through a glove and through the flex duct that will be pushed over it.",
        "missing-corner-piece": "Three corner pieces, not four. The joint will draw up crooked and the gasket will never seat at the empty corner.",
      },
      title: "Check the stack going out to the job",
      cue: "The sections on the cart are somebody else's problem tomorrow — click the two that should not leave the shop.",
      why: "The cart is the last place the shop can catch its own faults, and the two that matter most are the ones an installer cannot fix on a lift: a sharp corner that should have been broken on the bench, and a missing corner piece that means the joint will not draw up. Checking the cart takes a minute; a section sent back from the site costs a day and a truck.",
    },
    {
      id: "fab-log", kind: "select", target: "fab-log",
      title: "Log the run",
      cue: "Enter the job, the section count, the pressure and seal class and the coil line interlock fault, and sign it.",
      why: "The log records that this run was built to the class on the drawing and by whom, which is what the shop shows an inspector when a seam is questioned on site months later. It also carries the coil line's bypassed interlock, so the fault is fixed on the record rather than rediscovered by the next operator reaching into a line that starts without warning.",
    },
  ],

  interrupts: [
    {
      id: "inspector-seam-class",
      kind: "Inspector at the machine",
      after: "roll-lock", delay: 3, seconds: 12,
      alert: "The inspector has walked up to the lock former and is asking which seam type and seal class this run is being built to.",
      cue: "The rollers are turning and somebody wants an answer you should have on paper.",
      target: "duct-drawing",
      why: "The answer to an inspector is never from memory; it is the drawing, with the SMACNA pressure class and the seal class on it, held up beside the section. Stopping the feed to point at the drawing costs a minute. Answering from memory while the sheet keeps feeding is how the sheet gets a hand's attention instead of the rollers getting it.",
      missNote: "You kept feeding and answered over your shoulder. The inspector wrote down what you said, which was not what the drawing said, and the run now has a note against it that a piece of paper would have closed in a minute — and your hands were on a live infeed while your eyes were on the inspector.",
      wrongNote: "It is the drawing on the board. The seam and seal class are on it, and the inspector wants to see them, not hear them.",
    },
    {
      id: "coil-line-start",
      kind: "Machine started beside you",
      after: "seal", delay: 3, seconds: 12,
      alert: "Somebody has hit start on the coil line behind you. Its guard interlock is still bypassed from the morning's repair and the line is running with the shear guard open.",
      cue: "A machine is running with no guard, a metre from your back.",
      target: "coil-estop",
      why: "A coil line running with its interlock bypassed is an unguarded shear and beader in a room full of people who assume it is guarded. The bead on your seam can be restarted; the stop on the coil line is the only thing that ends the hazard, and it is pressed by whoever sees it first, not by whoever owns the machine.",
      missNote: "You finished your bead with an unguarded coil line running behind you. Nobody reached into it this time. The interlock stayed bypassed for the rest of the shift, and the next person to clear a jam in it did so with the guard open and the drive live.",
      wrongNote: "It is the coil line's emergency stop. Kill the line first — the interlock can be fixed with the machine dead.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMDF_ACCENT);

    const floor = box(g, 6.4, 0.06, 6.2, 0, 0.03, -0.2, 0x3a4048, { rough: 0.9, cast: false });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2c3239", base2: "#242a31", step: 28 }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.25 });
    box(g, 6.0, 0.005, 0.08, 0, 0.062, 2.2, 0xe8b02e, { rough: 0.8, cast: false });

    // ------------------------------------------------------ the lock former
    const former = group(g, 0.2, 0.06, -1.6);
    box(former, 1.8, 0.9, 0.7, 0, 0.45, 0, 0x4a5a66, { rough: 0.6, metal: 0.4 });
    box(former, 1.9, 0.08, 0.8, 0, 0.94, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    // Roller stands along the top, the infeed guide at the near end.
    const rollers = [];
    for (let i = 0; i < 6; i++) {
      const st = group(former, -0.7 + i * 0.28, 1.0, 0);
      box(st, 0.08, 0.3, 0.28, 0, 0.15, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
      const r1 = cyl(st, 0.05, 0.05, 0.12, 0, 0.12, 0.18, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
      const r2 = cyl(st, 0.05, 0.05, 0.12, 0, 0.24, 0.18, CITY.steel, { rough: 0.3, metal: 0.85, seg: 14 });
      r1.rotation.z = Math.PI / 2; r2.rotation.z = Math.PI / 2;
      rollers.push(r1, r2);
    }
    const infeedGuard = box(former, 0.4, 0.22, 0.03, -0.95, 1.18, 0.34, 0xe8b02e, { rough: 0.6, opacity: 0.7, transparent: true });
    const infeed = box(former, 0.36, 0.02, 0.2, -0.95, 1.13, 0.2, 0xffffff, { rough: 0.5 });
    infeed.visible = false; hits["lock-infeed"] = infeed;
    holoTag(former, "lock former — infeed guide", -0.95, 1.5, 0.34, { css: "#6fa8c8", w: 0.46 });
    const nip = box(former, 1.6, 0.16, 0.14, 0, 1.18, 0.18, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nip, "roller-nip");
    const feedLever = group(former, 1.0, 1.1, 0.4);
    cyl(feedLever, 0.02, 0.02, 0.24, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    ball(feedLever, 0.035, 0, 0, 0.14, 0xb8402f, { rough: 0.5 });
    reg(hits, feedLever, "pittsburgh-feed");
    holoTag(former, "feed control", 1.0, 1.32, 0.4, { css: "#6fa8c8", w: 0.26 });
    const formerLamp = ball(former, 0.03, 0.85, 1.0, 0.36, 0x59c97b, { emissive: 0x59c97b, ei: 1.5 });
    decal(former, 0.5, 0.12, 0, 0.6, 0.36, signFace("PITTSBURGH LOCK FORMER", { bg: "#0d1c24", accent: "#6fa8c8", scale: 0.5 }));

    // ------------------------------------------------------- the coil line
    // Behind the former: a decoiler, shear head and beader with the guard
    // interlock bypassed — the hazard, and the machine the interruption starts.
    const coil = group(g, -0.4, 0.06, -3.0);
    const coilDrum = cyl(coil, 0.5, 0.5, 0.5, -2.0, 0.8, 0, 0xaeb5bb, { rough: 0.3, metal: 0.7, seg: 24 });
    coilDrum.rotation.z = Math.PI / 2;
    box(coil, 0.1, 0.8, 0.6, -2.0, 0.4, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    box(coil, 3.0, 0.7, 0.7, 0, 0.35, 0, 0x4a5a66, { rough: 0.6, metal: 0.4 });
    box(coil, 3.1, 0.06, 0.8, 0, 0.73, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    box(coil, 0.8, 0.7, 0.7, 0.6, 1.1, 0, 0x50606c, { rough: 0.6, metal: 0.4 });          // shear head
    box(coil, 0.7, 0.05, 0.05, 0.6, 0.8, 0.36, CITY.steel, { rough: 0.3, metal: 0.85 });
    const coilGuard = box(coil, 0.9, 0.4, 0.03, 0.6, 1.0, 0.4, 0xe8b02e, { rough: 0.6, opacity: 0.6, transparent: true });
    coilGuard.rotation.x = -1.1;                                                            // propped open
    const coilInterlock = group(coil, 1.1, 1.3, 0.38);
    box(coilInterlock, 0.08, 0.1, 0.05, 0, 0, 0, 0x22262b, { rough: 0.6 });
    box(coilInterlock, 0.02, 0.06, 0.01, 0.03, 0, 0.03, 0xd2312b, { rough: 0.5 });
    decal(coilInterlock, 0.14, 0.04, 0, -0.08, 0.026, signFace("INTERLOCK", { bg: "#22262b", accent: "#d2312b", scale: 0.5 }));
    reg(hits, coilInterlock, "coil-guard-off");
    holoTag(coil, "coil line — interlock bypassed", 0.6, 1.7, 0.4, { css: "#d2312b", w: 0.5 });
    const coilEstop = group(coil, -0.8, 1.0, 0.4);
    box(coilEstop, 0.1, 0.1, 0.03, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    cyl(coilEstop, 0.035, 0.03, 0.03, 0, 0, 0.025, 0xd2312b, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    reg(hits, coilEstop, "coil-estop");
    holoTag(coil, "coil line stop", -0.8, 1.2, 0.4, { css: "#6fa8c8", w: 0.28 });
    const coilLamp = ball(coil, 0.035, 1.3, 1.5, 0.3, 0x3a4048, { rough: 0.5 });
    const coilBeacon = cyl(coil, 0.05, 0.05, 0.1, 0.6, 1.5, 0, 0xd2312b, { emissive: 0xd2312b, ei: 2.0, seg: 12 });
    coilBeacon.visible = false;

    // ------------------------------------------------------------ the brake
    const brake = group(g, 2.4, 0.06, -0.6, -1.3);
    for (const sx of [-0.9, 0.9]) box(brake, 0.3, 1.5, 0.6, sx, 0.75, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    box(brake, 2.0, 0.25, 0.4, 0, 1.0, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    const apron = box(brake, 2.0, 0.08, 0.4, 0, 0.82, 0.25, 0x5f6b76, { rough: 0.5, metal: 0.5 });
    box(brake, 1.8, 0.2, 0.08, 0, 1.25, 0.1, CITY.steel, { rough: 0.35, metal: 0.8 });     // clamping fingers
    for (let i = 0; i < 7; i++) box(brake, 0.2, 0.22, 0.09, -0.75 + i * 0.25, 1.25, 0.1, 0x7c868f, { rough: 0.4, metal: 0.7 });
    const brakeFace = decal(brake, 0.28, 0.1, 0.9, 1.5, 0.31, signFace("--°", { bg: "#0d1c24", accent: "#6fa8c8", fg: "#dff2fb", scale: 0.62 }), { glow: true, ei: 0.7 });
    reg(hits, brakeFace, "brake-angle");
    holoTag(brake, "box-and-pan brake", 0, 1.75, 0.2, { css: "#6fa8c8", w: 0.36 });

    // ----------------------------------------------------------- the notcher
    const notcher = group(g, -2.3, 0.06, -1.4, 0.6);
    box(notcher, 0.5, 0.9, 0.5, 0, 0.45, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    box(notcher, 0.7, 0.05, 0.7, 0, 0.93, 0, 0x7c868f, { rough: 0.4, metal: 0.7 });
    box(notcher, 0.12, 0.3, 0.12, 0, 1.1, -0.1, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    box(notcher, 0.16, 0.04, 0.16, 0, 0.98, 0.1, CITY.steel, { rough: 0.3, metal: 0.85 });
    cyl(notcher, 0.015, 0.015, 0.5, 0.3, 1.2, -0.1, 0x2b2f34, { rough: 0.5, seg: 8 }).rotation.z = 0.6;
    for (const sx of [-0.25, 0.25]) box(notcher, 0.03, 0.03, 0.4, sx, 0.97, 0.15, 0xe8b02e, { rough: 0.6 });
    reg(hits, notcher, "notcher");
    holoTag(notcher, "corner notcher", 0, 1.45, 0, { css: "#6fa8c8", w: 0.3 });

    // ---------------------------------------------------------- the benches
    // Blank stack (hazard), the blank itself (dragged), and the assembly bench
    // where the section is closed, flanged, sealed and stencilled.
    const stack = group(g, -1.6, 0.06, 0.6, 0.2);
    for (const [sx, sz] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) box(stack, 0.05, 0.7, 0.05, sx, 0.35, sz, 0x3a4048, { rough: 0.6, metal: 0.5 });
    box(stack, 0.9, 0.05, 0.7, 0, 0.72, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 6; i++) box(stack, 0.8, 0.006, 0.6, 0, 0.75 + i * 0.007, 0, 0xb9bec4, { rough: 0.3, metal: 0.7 });
    const stackEdge = box(stack, 0.82, 0.08, 0.05, 0, 0.77, 0.31, 0xb9bec4, { rough: 0.3, metal: 0.7, opacity: 0.35, transparent: true, cast: false });
    reg(hits, stackEdge, "bare-edge-stack");
    holoTag(stack, "unhemmed blanks", 0, 1.0, 0, { css: "#d2312b", w: 0.32 });
    const blank = box(stack, 0.8, 0.006, 0.6, 0, 0.8, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    reg(hits, blank, "duct-blank");
    const bench = group(g, 1.7, 0.06, 1.3, -0.5);
    box(bench, 1.6, 0.06, 0.9, 0, 0.85, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    for (const [sx, sz] of [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]]) box(bench, 0.06, 0.82, 0.06, sx, 0.41, sz, 0x50606c, { rough: 0.6, metal: 0.4 });
    // The duct section on the bench: four sides, the lock along the top edge.
    const section = group(bench, 0, 0.9, 0);
    box(section, 0.6, 0.4, 0.004, 0, 0.2, 0.2, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.6, 0.4, 0.004, 0, 0.2, -0.2, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.6, 0.004, 0.4, 0, 0.0, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    box(section, 0.6, 0.004, 0.4, 0, 0.4, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    const lockLip = box(section, 0.6, 0.03, 0.02, 0, 0.41, 0.2, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    const seamTool = group(section, 0.2, 0.46, 0.22);
    box(seamTool, 0.16, 0.03, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    box(seamTool, 0.04, 0.16, 0.02, 0.06, 0.06, 0, 0xb8402f, { rough: 0.5 });
    reg(hits, seamTool, "lock-closer");
    holoTag(section, "hand seamer", 0.2, 0.62, 0.22, { css: "#6fa8c8", w: 0.26 });
    const openLock = box(section, 0.2, 0.03, 0.03, -0.1, 0.42, 0.2, 0xd2312b, { rough: 0.5, opacity: 0.36, transparent: true, cast: false });
    reg(hits, openLock, "open-lock");
    const rawEdge = box(section, 0.6, 0.02, 0.006, 0, 0.0, -0.2, 0xd2312b, { rough: 0.5, opacity: 0.35, transparent: true, cast: false });
    reg(hits, rawEdge, "raw-edge");
    // Flange ends: the roll and the corner pieces.
    const flangeRoll = box(section, 0.02, 0.44, 0.44, 0.31, 0.2, 0, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    reg(hits, flangeRoll, "flange-roll");
    const corners = group(section, -0.31, 0.2, 0);
    for (const [sy, sz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2]]) box(corners, 0.02, 0.06, 0.06, 0, sy, sz, 0x7c868f, { rough: 0.4, metal: 0.7 });
    reg(hits, corners, "flange-corners");
    const missingCorner = box(corners, 0.02, 0.06, 0.06, 0, 0.2, 0.2, 0xd2312b, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    reg(hits, missingCorner, "missing-corner-piece");
    const sharpCorner = box(section, 0.03, 0.03, 0.03, 0.3, 0.41, -0.2, 0xd2312b, { rough: 0.5, opacity: 0.4, transparent: true, cast: false });
    reg(hits, sharpCorner, "sharp-corner");
    const bead = box(section, 0.58, 0.012, 0.012, 0, 0.42, 0.21, 0x9aa3a8, { rough: 0.9 });
    bead.visible = false;
    // Sealant gun (listed) and the wrong tube.
    const gun = group(bench, 0.6, 0.92, 0.3, 0.4);
    cyl(gun, 0.025, 0.025, 0.22, 0, 0, 0, 0x2f6f8c, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(gun, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    cyl(gun, 0.006, 0.012, 0.05, 0.13, 0, 0, 0x8a8f94, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    reg(hits, gun, "seal-gun");
    holoTag(bench, "listed duct sealant", 0.6, 1.12, 0.3, { css: "#6fa8c8", w: 0.36 });
    const wrongTube = cyl(bench, 0.022, 0.022, 0.2, -0.6, 0.98, 0.35, 0xe8e2d0, { rough: 0.6, seg: 12 });
    holoTag(bench, "general-purpose caulk", -0.6, 1.16, 0.35, { css: "#d2312b", w: 0.38 });
    reg(hits, wrongTube, "wrong-sealant");
    const stencil = group(bench, -0.5, 0.9, -0.3);
    box(stencil, 0.24, 0.002, 0.14, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    cyl(stencil, 0.02, 0.02, 0.08, 0.16, 0.04, 0, 0x22262b, { rough: 0.6, seg: 10 });
    reg(hits, stencil, "class-stencil");
    const stencilMark = decal(section, 0.3, 0.1, 0, 0.2, 0.203, signFace("JOB 2261 · CL 2 · SEAL A", { bg: "#c8ced3", accent: "#22262b", fg: "#22262b", scale: 0.5 }));
    stencilMark.visible = false;

    // ----------------------------------------------------- board, PPE, log
    const board = group(g, -2.7, 0.06, 1.8, 0.9);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("FAB SHOP — TODAY", ["Lock former: apprentice (you)", "Coil line: journeyman (repair a.m.)", "Brake 2: journeyman", "Inspector due: yes", "Interlock bypass: RESTORE"], { bg: "#eef1f3", band: "#6fa8c8" }), { px: 384 });
    reg(hits, boardFace, "fab-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoPanel(g, 0.7, 0.48, -0.9, 1.75, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "#0b161c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6fa8c8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dff2fb";
      ctx.fillText("DUCT DRAWING — RUN SA-3", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Pressure class: 2 in. w.g. positive", "Gauge: 24 ga galvanised (600 mm side)", "Seam: Pittsburgh lock", "Joint: TDC flange, corners, gasket", "Seal class: A (all seams and joints)"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMDF_ACCENT, ry: 0.3 });
    const drawingHit = box(g, 0.7, 0.48, 0.04, -0.9, 1.75, 2.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    drawingHit.rotation.y = 0.3;
    reg(hits, drawingHit, "duct-drawing");
    const ppe = group(g, 2.8, 0.06, 0.4, -1.4);
    box(ppe, 0.5, 0.7, 0.16, 0, 1.25, 0, 0x2b2f34, { rough: 0.6 });
    decal(ppe, 0.44, 0.1, 0, 1.55, 0.085, signFace("PPE — FAB", { bg: "#0d1c24", accent: "#6fa8c8", scale: 0.5 }));
    const gloves = group(ppe, -0.12, 1.3, 0.1);
    for (const sx of [-0.03, 0.03]) box(gloves, 0.05, 0.12, 0.02, sx, 0, 0, 0x7a8a3a, { rough: 0.8 });
    reg(hits, gloves, "edge-gloves");
    const glasses = group(ppe, 0.12, 1.3, 0.1);
    box(glasses, 0.14, 0.04, 0.02, 0, 0, 0, 0xdfe9ee, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, glasses, "shop-glasses");
    const logBoard = group(g, 2.85, 0.06, 1.9, -0.8);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("FAB LOG", ["Run SA-3 — 24 ga", "Sections: ____", "Class: ____ / Seal ____", "Faults: ____", "Signed: ____"], { bg: "#f4efe4", band: "#6fa8c8" }), { px: 256 });
    reg(hits, logFace, "fab-log");
    holoTag(logBoard, "fab log", 0, 1.5, 0, { css: "#6fa8c8", w: 0.2 });

    // ---------------------------------------------------------- the crew
    const lead = standingFigure(g, -1.85, 2.1, { ry: 2.6, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0x6fa8c8, gloves: true });
    const inspector = standingFigure(g, 1.9, -2.05, { ry: -0.9, cloth: 0xe8e2d0, trousers: 0x22262b, helmet: 0xffffff });
    inspector.visible = false;
    const clipboard = box(inspector, 0.16, 0.22, 0.01, 0.2, 1.05, 0.2, 0xf4efe4, { rough: 0.7 });
    clipboard.rotation.x = -0.3;

    // ------------------------------------------------------- shop dressing
    const chest = toolChest(g, 0.9, 2.3, { ry: 0.3, color: 0x4a5a66 });
    holoTag(chest, "seamers · snips · rivet gun", 0, 0.95, 0, { css: "#6fa8c8", w: 0.46 });
    const cart = group(g, -0.6, 0.06, -0.3, 0.2);
    box(cart, 1.0, 0.05, 0.7, 0, 0.35, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.45, -0.3], [0.45, -0.3], [-0.45, 0.3], [0.45, 0.3]]) cyl(cart, 0.05, 0.05, 0.03, sx, 0.05, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 2; i++) {
      const s = group(cart, -0.2 + i * 0.45, 0.6, 0);
      box(s, 0.4, 0.4, 0.004, 0, 0, 0.2, 0xc8ced3, { rough: 0.3, metal: 0.7 });
      box(s, 0.4, 0.4, 0.004, 0, 0, -0.2, 0xc8ced3, { rough: 0.3, metal: 0.7 });
      box(s, 0.4, 0.004, 0.4, 0, 0.2, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
      box(s, 0.4, 0.004, 0.4, 0, -0.2, 0, 0xc8ced3, { rough: 0.3, metal: 0.7 });
    }
    holoTag(cart, "sections out", 0, 0.95, 0, { css: "#6fa8c8", w: 0.26 });
    for (const sx of [-1.6, 0.2, 2.0]) {
      box(g, 0.6, 0.06, 0.2, sx, 2.75, -1.0, 0x2b2f34, { rough: 0.6, cast: false });
      box(g, 0.56, 0.02, 0.16, sx, 2.72, -1.0, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.2, rough: 0.5, cast: false });
    }
    const tray = group(g, 0, 0.06, -3.0);
    for (let i = 0; i < 5; i++) box(tray, 0.5, 0.06, 0.18, -1.2 + i * 0.6, 2.7, 0.55, 0x3a4550, { rough: 0.55, metal: 0.5, cast: false });
    for (const [x, z] of [[1.3, -2.4], [-1.9, -2.5], [2.6, 2.5]]) cone(g, x, z);
    const ext = group(g, 2.9, 0.06, -1.9, -0.8);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });
    const scrapBin = group(g, -2.8, 0.06, -0.2, 0.3);
    box(scrapBin, 0.6, 0.45, 0.6, 0, 0.22, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 3; i++) box(scrapBin, 0.3, 0.01, 0.1, -0.1 + i * 0.1, 0.46 + i * 0.02, i * 0.08, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    holoTag(scrapBin, "offcuts", 0, 0.65, 0, { css: "#6fa8c8", w: 0.2 });
    const signBoard = group(g, 0.6, 0.06, 2.85, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("FEED FROM\nTHE BACK\nEDGE", { bg: "#0d1c24", accent: "#6fa8c8", fg: "#dff2fb", scale: 0.28 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const gasketRoll = cyl(g, 0.12, 0.12, 0.08, 2.4, 0.95, 1.9, 0x22262b, { rough: 0.8, seg: 16 });
    gasketRoll.rotation.x = Math.PI / 2;

    let feeding = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.1, -1.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lock-feed") { blank.parent.remove(blank); former.add(blank); blank.position.set(-0.7, 1.14, 0.18); blank.rotation.set(0, 0, 0); blank.scale.set(1, 1, 0.5); }
        if (step.id === "roll-lock") { blank.position.x = 0.6; }
        if (step.id === "close-lock") { lockLip.position.z = 0.19; lockLip.scale.set(1, 0.6, 1); openLock.visible = false; }
        if (step.id === "flange") { corners.children.forEach((c) => { c.scale.set(1.4, 1.4, 1.4); }); }
        if (step.id === "seal") { bead.visible = true; }
        if (step.id === "edge-walk") { openLock.visible = true; openLock.material = mat(0xd2312b, { rough: 0.5, opacity: 0.5 }); rawEdge.material = mat(0xd2312b, { rough: 0.5, opacity: 0.7 }); }
        if (step.id === "stencil") { stencilMark.visible = true; }
        if (step.id === "fab-log") repaint(logFace, paperFace("FAB LOG", ["Run SA-3 — 24 ga", "Sections: 6 of 6", "Class: 2 in. / Seal A", "Coil interlock bypassed — reported", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#6fa8c8" }));
      },
      onHazard() {},
      // The inspector really appears at the machine; the coil line really runs.
      onInterrupt(it) {
        if (it.id === "inspector-seam-class") { inspector.visible = true; inspector.position.set(1.6, 0, -2.5); }
        if (it.id === "coil-line-start") { coilBeacon.visible = true; coilLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 }); coilGuard.rotation.x = -1.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "inspector-seam-class") { inspector.position.set(2.2, 0, 1.8); inspector.rotation.y = -2.2; }
        if (it.id === "coil-line-start") { coilBeacon.visible = false; coilLamp.material = mat(0x3a4048, { rough: 0.5 }); }
      },

      animate(t, dt, session) {
        const step = session?.step;
        feeding = !!(step?.id === "roll-lock" && session.holding);
        if (feeding) for (const r of rollers) r.rotation.x += dt * 6;
        formerLamp.position.y = 1.0 + (feeding ? Math.sin(t * 8) * 0.004 : 0);
        if (coilBeacon.visible) coilBeacon.rotation.y += dt * 4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "brake-bend") {
          apron.rotation.x = -gg.t * 1.5;
          repaint(brakeFace, signFace(`${(84 + gg.t * 12).toFixed(1)}°`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff2fb", scale: 0.62 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "close-lock") seamTool.position.x = 0.2 - tn.amount * 0.4;
        const tr = session?.track;
        if (tr && step?.id === "roll-lock") blank.position.x = -0.7 + tr.inBand / 6 * 1.3;
      },
    };
  },
};
