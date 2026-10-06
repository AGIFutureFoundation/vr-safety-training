import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, reg,
  rackFrame, rackUnit, cone, standingFigure,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Conveyor Guard VR — Manufacturing & Automation, station three.
// Clearing a jam on a belt conveyor: the belt is locked out and the stored
// energy released before a hand goes near a nip point, the guard that came
// off goes back on before the restart, and the pull-cord that was tied back
// is the reason this job exists at all.

const CG_ACCENT = 0x8ecae6;

export const SIM_CONVEYOR_GUARD = {
  id: "conveyor-guard",
  index: "31",
  domain: "Manufacturing",
  trade: "Conveyor maintenance technician",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "UAW / IAM — OSHA 29 CFR 1910.147 lockout/tagout; ASME B20.1 conveyor safety (guarding of nip points, emergency stops); 1910.212 machine guarding",
  name: "Conveyor Guard",
  title: simTitle("Conveyor Guard"),
  tagline: "Belt jam clearance: e-stop, lockout, stored-energy release, try-start, guard off and back on, pull-cord restored, restart",
  accent: CG_ACCENT,
  accentCss: "#8ecae6",
  parSeconds: 225,
  footprint: 2.4,
  badge: { id: "nip-point-never", name: "Nip Point Never", note: "A jam cleared with the belt locked and proven dead, the guard back on, and the pull-cord live before the restart" },

  game: system({
    name: "Line Guard",
    currency: "BELT",
    ranks: ["Line Tech", "Maintenance Tech", "Line Lead", "Maintenance Lead", "Line Guard Certified"],
    badges: [
      { id: "try-start", name: "Try-Start", note: "Proved the lockout with a try-start before reaching in, first time", test: AWARD.stepClean("trystart") },
      { id: "guards-on", name: "Guards On", note: "Never reached into a nip point, never tied back a pull-cord", test: AWARD.safe },
      { id: "tension-set", name: "Tension Set", note: "Belt tension inside spec on the restart", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-clear", name: "Clean Clear", note: "No corrections through the whole clearance", test: AWARD.clean },
      { id: "bleed-held", name: "Bleed Held", note: "Held the stored-energy release the full count", test: AWARD.unbroken },
      { id: "line-back-fast", name: "Line Back Fast", note: "Line restarted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-nip": "You reached into the head pulley nip point with the belt live. A belt draws a hand into the pulley faster than you can pull back; the belt is locked and proven dead before anything goes near a nip.",
    "cord-tied": "You tied back the pull-cord so it stops tripping. The pull-cord is the only stop a worker on the line can reach; tied back, the next jam takes a hand with it.",
    "guard-off-run": "You restarted with the head guard still off. A conveyor runs with every guard on, or it does not run — the guard is what makes the nip a place a hand cannot reach.",
    "ride-belt": "You stepped onto the belt to reach the jam. A belt is not a walkway; a restart, a slip, or the jam letting go puts you into the transfer chute.",
  },

  lateNotes: {
    "disconnect": "E-stop first — the e-stop stops the belt now; the disconnect is the lockout that keeps it stopped.",
    "restart-button": "The guard goes back on and the pull-cord is proven before the line restarts.",
  },

  // Interruptions: see shared/game.js. A jam clearance has two ways to get
  // hurt after the lockout is on — a second energy source nobody isolated,
  // and an isolation that somebody else disturbs while your hands are full.
  interrupts: [
    {
      id: "infeed-still-running",
      kind: "Second energy source",
      after: "bleed", delay: 3, seconds: 12,
      alert: "The infeed spur behind you is still running — it's on its own drive, its own lockout, and nobody touched it. Cartons are stacking up against the locked head end and starting to bow the ones you're leaning past.",
      cue: "That belt was never part of your lockout. Shut it down before the stack reaches you.",
      target: "infeed-estop",
      why: "This line has two machines feeding one jam: the head-end drive you locked and an infeed spur with its own motor, its own energy and its own separate point of isolation. Locking the drive stops the belt under your hands; it does nothing to the spur still pushing cartons into the space you are about to reach into to bleed off tension, and a queue that keeps growing behind a stopped point eventually has nowhere to go but into you.",
      missNote: "The infeed spur ran the whole time you had your hands in the take-up. A queue of cartons kept pressing forward against a jam that was never built to hold that kind of load, and the point where that gives is usually the moment somebody has a hand in the pinch.",
      wrongNote: "It's the infeed spur, not anything on this drive. That belt has its own motor and it is still turning.",
    },
    {
      id: "isolation-nudged",
      kind: "Isolation disturbed",
      after: "clear", delay: 3, seconds: 12,
      alert: "Over at the disconnect your lock is hanging loose and the handle's been bumped part of the way back toward ON. Someone on the next line thought this drive was free.",
      cue: "Your hands are full of a jammed carton and somebody else has your isolation.",
      target: "disconnect",
      why: "A lock only protects the person actually behind it, and it only works if everyone who might touch that disconnect can see it is yours and leave it alone. On a shared panel with more than one drive on it, a lock that looks like a finished job is a lock somebody else will remove for you. Put the handle back to open and reset your lock before anything else, because the disconnect is what decides whether the belt under your hand can move.",
      missNote: "The disconnect went the rest of the way back to ON with the guard off and your hand still inside the transfer clearing the jam. The belt was one photoeye signal away from restarting on its own.",
      wrongNote: "It's the disconnect. Everything about this jam being safe to clear by hand depends on that lock staying exactly where you left it.",
    },
  ],

  steps: [
    {
      id: "ticket", kind: "select", target: "work-ticket",
      title: "Read the ticket",
      cue: "Check the jam location, the drive, and the lockout points for this conveyor.",
      why: "One conveyor line can have a head drive, a gravity take-up and an upstream infeed spur, and each one stores or delivers its own energy independently of the others. The ticket's lockout points are the complete list for this line; you do not discover a second drive still running by finding it at the pulley with your hands already inside the guard.",
    },
    {
      id: "estop", kind: "select", target: "e-stop",
      title: "Hit the e-stop",
      cue: "Stop the belt at the nearest e-stop before approaching the jam.",
      why: "The e-stop is the immediate stop, not the isolation — it drops the belt now, on a control circuit that a photoeye or a reset button can re-energise the instant the fault clears. It buys the seconds it takes to walk to the disconnect and put a lock on the source; nobody works near the nip with only the e-stop between them and a moving belt.",
    },
    {
      id: "lockout", kind: "turn", target: "disconnect",
      title: "Lock out the drive",
      cue: "Open the drive disconnect and hang your lock and tag.",
      why: "A belt stopped on its e-stop restarts itself the instant the jam sensor sees clear and the controller resets — a stopped belt is not a safe belt, only a belt waiting for permission. Opening the drive disconnect and hanging your own lock and tag on it is the only thing that takes that permission away from the controller and puts it in your hand alone.",
      turn: { turns: 0.5, axis: "y", label: "DISCONNECT" },
    },
    {
      id: "bleed", kind: "hold", target: "takeup-release", seconds: 4,
      title: "Release the stored energy",
      cue: "Back off the gravity take-up until the belt tension is released and hold until it settles.",
      why: "A locked-out belt is dead electrically but not mechanically — the gravity take-up still holds the belt in tension exactly the way it did while running, stored in the sag of the belt itself. Free a jam while that tension is still loaded and the belt snaps taut the instant the obstruction lets go, and whatever hand is on it travels with it toward the nip.",
      holdBreakNote: "Let go before it settled — there is still tension in the belt. Hold the release until it is slack.",
    },
    {
      id: "trystart", kind: "select", target: "start-button",
      title: "Try-start",
      cue: "With the lockout on, press start — nothing should happen.",
      why: "The try-start is the only proof that the lock is actually on the disconnect that feeds this belt and not a breaker that looks identical two panels over. A lock on the wrong device holds just as firmly and looks exactly as locked as the right one — the only thing that tells them apart is whether the belt moves when somebody presses start with your lock already on it.",
    },
    {
      id: "guard-off", kind: "select", target: "head-guard",
      title: "Remove the head guard",
      cue: "Take the head pulley guard off to reach the jam.",
      why: "The guard comes off only after the belt is locked, the tension is bled and the try-start has proven the lockout is real — three checks that all have to pass before the one thing standing between a hand and the nip point is removed. It comes off already knowing it goes back on before the lock does, in that order and no other.",
    },
    {
      id: "clear", kind: "drag", target: "jam-carton",
      title: "Clear the jam",
      cue: "Pull the jammed carton out of the transfer and set it on the reject stand.",
      why: "A hand goes anywhere near the nip only because the belt has already been proven unable to move — lockout, bleed and try-start done, in that order, before this step starts. The carton comes out to the reject stand, not back onto the belt, because a jammed carton put back where it jammed the first time jams the same way the moment the line restarts.",
      drag: { to: "reject-socket", radius: 0.4, missNote: "Not on the reject stand — set the carton down there, not back on the belt." },
    },
    {
      id: "guard-on", kind: "select", target: "head-guard",
      title: "Refit the head guard",
      cue: "Guard back on and fastened before anything else.",
      why: "The guard goes back on before the lock comes off, every time, with no exception for a quick restart. Reverse that order even once and there is a window, however short, where the nip point is open and the belt has permission to move — and a nip point does not need long to take a hand, only a fraction of a second of that window existing at all.",
    },
    {
      id: "pullcord", kind: "find", noHint: true,
      targets: ["cord-tie"],
      itemNames: { "cord-tie": "pull-cord tied back" },
      itemNotes: { "cord-tie": "The pull-cord along the return side is tied back to the frame with a cable tie — someone got tired of it tripping. It is cut free and the cord tested before this line runs." },
      title: "Walk the line for defeated safeguards",
      cue: "Check the pull-cords, guards and e-stops along the run and click what has been defeated.",
      why: "A jam on a line with a working pull-cord ends with somebody yanking a rope and the belt stopping. The same jam on a line where that cord has been tied back to stop it tripping on false alarms ends with the same reach and no stop at all — the walk down the return side, checking every cord and guard by hand, is how a defeated safeguard gets found and fixed before it is needed for real.",
    },
    {
      id: "tension", kind: "gauge", target: "takeup-gauge",
      title: "Reset the belt tension",
      cue: "Bring the take-up back until the tension indicator is in the run band.",
      why: "The take-up was deliberately backed off to bleed the stored tension before the guard came off, and the belt cannot run correctly slack — it slips on the drive pulley under load and tracks sideways off the frame until it rides against a guard or a support leg. Bringing the take-up back into the run band before restart is what makes the belt track straight and grip the drive the way it was designed to.",
      gauge: { label: "TENSION", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Off the run band — slack tracks off, over-tight overloads the drive. Reset the take-up." },
    },
    {
      id: "restart", kind: "select", target: "restart-button",
      title: "Remove the lock, reset, restart",
      cue: "Your lock off, e-stop reset, clear the line, start.",
      why: "Your lock comes off last, by you, and only after everything upstream and downstream is checked clear by eye — the guard back on, the pull-cord live, the tension reset. The moment the start button is pressed is the moment every one of those checks gets tested at once, on a belt about to move at full speed with people standing around it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CG_ACCENT);
    box(g, 5.6, 0.1, 5.0, 0, 0.05, 0, 0x4a4e52, { rough: 0.9 });
    // The conveyor: frame, belt, head pulley with guard, transfer chute, gravity take-up.
    const conv = group(g, 0, 0.1, -0.6);
    for (const sx of [-2.2, 2.2]) for (const sz of [-0.35, 0.35]) box(conv, 0.08, 0.8, 0.08, sx, 0.4, sz, 0x5b6672, { rough: 0.6, metal: 0.5 });
    box(conv, 4.6, 0.06, 0.8, 0, 0.8, 0, 0x2b2f34, { rough: 0.9 });
    const belt = box(conv, 4.4, 0.02, 0.7, 0, 0.84, 0, 0x1b1e22, { rough: 0.95 });
    for (let i = 0; i < 6; i++) box(conv, 0.5, 0.3, 0.4, -1.8 + i * 0.7, 1.0, 0, 0xc48b3f, { rough: 0.85 });
    const headPulley = cyl(conv, 0.16, 0.16, 0.8, 2.3, 0.78, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 18 });
    headPulley.rotation.x = Math.PI / 2;
    const nip = box(conv, 0.3, 0.2, 0.8, 2.15, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nip, "reach-nip");
    const guard = box(conv, 0.5, 0.5, 0.9, 2.3, 0.85, 0, 0xe8b02e, { rough: 0.6, opacity: 0.7, transparent: true });
    reg(hits, guard, "head-guard");
    const chute = box(conv, 0.6, 0.6, 0.9, 2.9, 0.4, 0, 0x6f7a83, { rough: 0.6, metal: 0.4 });
    const jam = group(conv, 2.55, 1.05, 0.05, 0.6);
    box(jam, 0.5, 0.3, 0.4, 0, 0, 0, 0xc48b3f, { rough: 0.85 });
    holoTag(jam, "jammed carton", 0, 0.3, 0, { css: "#8ecae6", w: 0.28 });
    reg(hits, jam, "jam-carton");
    const takeup = group(conv, -1.0, 0.2, 0);
    box(takeup, 0.3, 0.3, 0.3, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    cyl(takeup, 0.01, 0.01, 0.5, 0, 0.4, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const releaseKnob = cyl(takeup, 0.05, 0.05, 0.03, 0.2, 0, 0, 0xb8402f, { rough: 0.5, seg: 12 });
    releaseKnob.rotation.z = Math.PI / 2;
    holoTag(takeup, "gravity take-up — release", 0, 0.7, 0, { css: "#8ecae6", w: 0.42 });
    reg(hits, takeup, "takeup-release");
    const tensionFace = decal(conv, 0.24, 0.1, -1.0, 0.95, 0.42, signFace("--%", { bg: "#0d1c24", accent: "#8ecae6", fg: "#dff4ff", scale: 0.6 }), { glow: true, ei: 0.6 });
    reg(hits, tensionFace, "takeup-gauge");
    const ride = box(conv, 1.0, 0.1, 0.7, 0.8, 0.9, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(conv, "step on the belt?", 0.8, 1.25, 0, { css: "#d2312b", w: 0.3 });
    reg(hits, ride, "ride-belt");
    // Pull-cord along the near side with the tie-back; e-stop; controls.
    const cord = cyl(conv, 0.006, 0.006, 4.2, 0, 0.6, 0.48, 0xd2312b, { rough: 0.6, seg: 6 });
    cord.rotation.z = Math.PI / 2;
    const tie = box(conv, 0.06, 0.06, 0.06, -0.6, 0.6, 0.48, 0xffffff, { rough: 0.7 });
    reg(hits, tie, "cord-tie");
    const tieBack = box(conv, 0.3, 0.2, 0.2, 1.2, 0.6, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(conv, "tie the cord back?", 1.2, 0.35, 0.5, { css: "#d2312b", w: 0.32 });
    reg(hits, tieBack, "cord-tied");
    const estop = group(conv, 1.6, 1.3, 0.5);
    cyl(estop, 0.05, 0.05, 0.04, 0, 0, 0, 0xe8b02e, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    cyl(estop, 0.035, 0.035, 0.04, 0, 0, 0.03, 0xd2312b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    holoTag(estop, "E-STOP", 0, 0.1, 0, { css: "#d2312b", w: 0.16 });
    reg(hits, estop, "e-stop");
    const panel = group(g, 2.3, 0.1, 1.2, -0.8);
    box(panel, 0.7, 1.4, 0.3, 0, 0.7, 0, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    const disc = group(panel, -0.2, 1.05, 0.16);
    cyl(disc, 0.05, 0.05, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const discHandle = box(disc, 0.02, 0.1, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    decal(disc, 0.14, 0.03, 0, 0.09, 0.01, signFace("DRIVE DISC", { bg: "#22262b", accent: "#8ecae6", scale: 0.5 }));
    reg(hits, disc, "disconnect");
    const lock = lockTag(disc, 0.06, -0.06, 0.02, { color: 0x8ecae6 });
    lock.visible = false;
    const start = box(panel, 0.1, 0.06, 0.03, 0.15, 1.0, 0.16, 0x59c97b, { rough: 0.5 });
    decal(panel, 0.1, 0.04, 0.15, 1.08, 0.16, signFace("START", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, start, "start-button");
    const restart = box(panel, 0.16, 0.06, 0.03, 0, 0.6, 0.16, 0x59c97b, { rough: 0.5 });
    decal(panel, 0.16, 0.04, 0, 0.68, 0.16, signFace("RESET · RESTART", { bg: "#22262b", accent: "#59c97b", scale: 0.45 }));
    reg(hits, restart, "restart-button");
    const guardOffRun = box(panel, 0.16, 0.06, 0.03, 0, 0.35, 0.16, 0x22262b, { rough: 0.5 });
    decal(panel, 0.16, 0.04, 0, 0.43, 0.16, signFace("RUN — GUARD OFF", { bg: "#22262b", accent: "#d2312b", scale: 0.45 }));
    reg(hits, guardOffRun, "guard-off-run");
    holoPanel(panel, 0.6, 0.42, -0.6, 1.35, 0.1, (ctx, w, h) => {
      ctx.fillStyle = "#0a1a24"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#8ecae6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("TICKET — C-14 JAM AT HEAD", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#dff4ff";
      ["Lockout: drive disconnect DP-3", "Stored energy: gravity take-up", "Guard: head pulley, 4 bolts", "Pull-cord: both sides, test", "Belt tension: 45–60% on restart"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: CG_ACCENT });
    const ticket = box(panel, 0.6, 0.42, 0.04, -0.6, 1.35, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ticket, "work-ticket");
    const reject = group(g, 1.4, 0.1, 1.4);
    box(reject, 0.6, 0.6, 0.6, 0, 0.3, 0, 0x5b6672, { rough: 0.6, metal: 0.4 });
    const rejectSocket = box(reject, 0.5, 0.02, 0.5, 0, 0.62, 0, 0xffffff, { rough: 0.5 });
    rejectSocket.visible = false; hits["reject-socket"] = rejectSocket;
    holoTag(reject, "reject stand", 0, 0.8, 0, { css: "#8ecae6", w: 0.26 });
    toolChest(g, -2.2, 1.2, { ry: 0.6, color: 0x2f5f6f });

    // --------------------------------------------------- upstream infeed spur
    // Its own motor, its own drive, its own separate lockout point — a spur
    // feeding this belt that keeps running while only the head drive is
    // locked, which is exactly the second energy source a jam clearance forgets.
    const infeed = group(conv, -3.35, 0, 0);
    for (const sx of [-0.65, 0.65]) for (const sz of [-0.32, 0.32]) box(infeed, 0.06, 0.78, 0.06, sx, 0.39, sz, 0x5b6672, { rough: 0.6, metal: 0.5 });
    box(infeed, 1.5, 0.05, 0.75, 0, 0.78, 0, 0x2b2f34, { rough: 0.9 });
    box(infeed, 1.4, 0.02, 0.66, 0, 0.81, 0, 0x1b1e22, { rough: 0.95 });
    const infeedDrum = cyl(infeed, 0.09, 0.09, 0.76, 0.72, 0.81, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 14 });
    infeedDrum.rotation.x = Math.PI / 2;
    const infeedMotor = cyl(infeed, 0.075, 0.075, 0.22, 0.72, 0.5, 0.44, 0x2f4f8c, { rough: 0.5, metal: 0.4, seg: 12 });
    infeedMotor.rotation.z = Math.PI / 2;
    const cartons = [];
    const cartonHome = [];
    for (let i = 0; i < 6; i++) {
      const x = -0.55 + i * 0.2;
      const c = box(infeed, 0.28, 0.22, 0.26, x, 0.94, i % 2 ? 0.09 : -0.09, 0xc48b3f, { rough: 0.85 });
      cartons.push(c); cartonHome.push(x);
    }
    holoTag(infeed, "infeed spur — separate drive", 0, 1.2, 0, { css: "#8ecae6", w: 0.46 });
    const infeedEstop = group(infeed, -0.7, 1.05, 0.4);
    cyl(infeedEstop, 0.045, 0.045, 0.035, 0, 0, 0, 0xe8b02e, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const infeedLamp = cyl(infeedEstop, 0.032, 0.032, 0.036, 0, 0, 0.025, 0x8a949d, { rough: 0.4, seg: 14 });
    infeedLamp.rotation.x = Math.PI / 2;
    holoTag(infeedEstop, "INFEED E-STOP", 0, 0.12, 0, { css: "#d2312b", w: 0.28 });
    reg(hits, infeedEstop, "infeed-estop");

    // ---------------------------------------------------------- general dressing
    // A shrink-wrapped pallet by the reject stand, spare-parts rack behind
    // the tool chest, a wall extinguisher and lockout signage, and exclusion
    // cones marking the nip-point work zone off the walking aisle.
    const pallet = group(g, 2.0, 0.1, 2.1);
    box(pallet, 0.7, 0.08, 0.5, 0, 0.04, 0, 0x8b6a42, { rough: 0.9 });
    for (let i = 0; i < 3; i++) box(pallet, 0.6, 0.22, 0.42, 0, 0.2 + i * 0.24, 0, 0xc9a862, { rough: 0.8 });
    box(pallet, 0.66, 0.7, 0.46, 0, 0.42, 0, 0xdfe9ee, { rough: 0.15, opacity: 0.22, transparent: true });
    holoTag(pallet, "reject pallet", 0, 0.85, 0, { css: "#8ecae6", w: 0.28 });

    const rack = rackFrame(g, -2.9, 0.35, { ry: 0.6, h: 1.3 });
    for (let i = 0; i < 3; i++) rackUnit(rack, 0.3 + i * 0.35, ["ROLLERS", "SPLICE KIT", "GUARD BOLTS"][i], { css: "#8ecae6" });

    const ext = group(g, 3.05, 0.1, 0.55, -0.8);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });

    const safetyBoard = group(g, -1.0, 0.1, 2.25, 0.3);
    box(safetyBoard, 0.5, 0.4, 0.03, 0, 1.1, 0, 0x1b2026, { rough: 0.6 });
    decal(safetyBoard, 0.44, 0.34, 0, 1.1, 0.018,
      signFace("LOCKOUT\nSTATIONS\nONLY", { bg: "#0d1c24", accent: "#8ecae6", fg: "#dff4ff", scale: 0.28 }));
    cyl(safetyBoard, 0.02, 0.02, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    // Cable tray along the back wall feeding the panel.
    const tray = group(g, 2.3, 0.1, -1.9);
    for (let i = 0; i < 5; i++) box(tray, 0.5, 0.06, 0.18, -1.0 + i * 0.5, 1.6, 0, 0x3a4550, { rough: 0.55, metal: 0.5 });
    cyl(tray, 0.02, 0.02, 1.5, 0, 1.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;

    cone(g, -1.6, 1.75);
    cone(g, 1.9, -2.35);

    // A second technician from the next line, clear of every control, who is
    // the one who bumps the disconnect during the isolation-nudged interrupt.
    const secondTech = standingFigure(g, 1.65, -1.25, { ry: 2.4, vest: CITY.hiVis, helmet: 0xe8b02e });
    void secondTech;

    let running = true, tension = 1, infeedRunning = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(1.0, 0.9, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "estop") running = false;
        if (step.id === "lockout") { lock.visible = true; discHandle.rotation.z = Math.PI / 2; }
        if (step.id === "guard-off") guard.visible = false;
        if (step.id === "clear") { jam.parent.remove(jam); reject.add(jam); jam.position.set(0, 0.75, 0); jam.rotation.set(0, 0, 0); }
        if (step.id === "guard-on") guard.visible = true;
        if (step.id === "pullcord") tie.visible = false;
        if (step.id === "restart") { lock.visible = false; discHandle.rotation.z = 0; running = true; }
      },
      onHazard() {},
      // The infeed spur visibly keeps turning and the queue visibly grows
      // until the learner shuts it down; the disconnect visibly loses its
      // lock and its handle moves until the learner puts it back.
      onInterrupt(it) {
        if (it.id === "infeed-still-running") {
          infeedRunning = true;
          infeedLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.2, rough: 0.4 });
        }
        if (it.id === "isolation-nudged") {
          lock.visible = false;
          discHandle.rotation.z = Math.PI / 4;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "infeed-still-running") {
          infeedRunning = false;
          infeedLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.4, rough: 0.4 });
        }
        if (it.id === "isolation-nudged") {
          lock.visible = true;
          discHandle.rotation.z = Math.PI / 2;
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (running) headPulley.rotation.y += dt * 3;
        if (step?.id === "bleed" && session.holding) { tension = Math.max(0.2, 1 - session.holdFor / 4); releaseKnob.rotation.y += dt * 4; }
        belt.position.y = 0.84 - (1 - tension) * 0.02;
        if (infeedRunning) {
          infeedDrum.rotation.y += dt * 4;
          infeedMotor.rotation.x += dt * 4;
          for (let i = 0; i < cartons.length; i++) {
            cartons[i].position.x = Math.min(cartonHome[i] + 0.3, cartons[i].position.x + dt * 0.12);
          }
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tension") repaint(tensionFace, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff4ff", scale: 0.6 }));
      },
    };
  },
};
