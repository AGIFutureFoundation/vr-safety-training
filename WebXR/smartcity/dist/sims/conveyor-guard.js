import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, reg } from "../citykit.js";
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

  steps: [
    {
      id: "ticket", kind: "select", target: "work-ticket",
      title: "Read the ticket",
      cue: "Check the jam location, the drive, and the lockout points for this conveyor.",
      why: "One conveyor can have a drive, a take-up and a gravity section, each with its own energy. The ticket's lockout points are the list; you do not discover them at the pulley.",
    },
    {
      id: "estop", kind: "select", target: "e-stop",
      title: "Hit the e-stop",
      cue: "Stop the belt at the nearest e-stop before approaching the jam.",
      why: "The e-stop is the immediate stop. It is not a lockout — it is what buys the seconds to get to one.",
    },
    {
      id: "lockout", kind: "turn", target: "disconnect",
      title: "Lock out the drive",
      cue: "Open the drive disconnect and hang your lock and tag.",
      why: "A stopped belt restarts the moment the jam clears and the controller sees the sensor go clear. Your lock is what stops that.",
      turn: { turns: 0.5, axis: "y", label: "DISCONNECT" },
    },
    {
      id: "bleed", kind: "hold", target: "takeup-release", seconds: 4,
      title: "Release the stored energy",
      cue: "Back off the gravity take-up until the belt tension is released and hold until it settles.",
      why: "A locked-out belt still has tension in it from the take-up weight. Cut a jam free under tension and the belt snaps taut — with your hand in it.",
      holdBreakNote: "Let go before it settled — there is still tension in the belt. Hold the release until it is slack.",
    },
    {
      id: "trystart", kind: "select", target: "start-button",
      title: "Try-start",
      cue: "With the lockout on, press start — nothing should happen.",
      why: "The try-start is the proof the lockout is on the right disconnect. A lock on the wrong breaker looks exactly like a lock on the right one until you press start.",
    },
    {
      id: "guard-off", kind: "select", target: "head-guard",
      title: "Remove the head guard",
      cue: "Take the head pulley guard off to reach the jam.",
      why: "The guard comes off only now — locked, bled, try-started — and it comes off knowing it goes back on before anything else does.",
    },
    {
      id: "clear", kind: "drag", target: "jam-carton",
      title: "Clear the jam",
      cue: "Pull the jammed carton out of the transfer and set it on the reject stand.",
      why: "The jam is cleared by hand only because the belt cannot move. The carton goes to the reject stand, not back on the belt.",
      drag: { to: "reject-socket", radius: 0.4, missNote: "Not on the reject stand — set the carton down there, not back on the belt." },
    },
    {
      id: "guard-on", kind: "select", target: "head-guard",
      title: "Refit the head guard",
      cue: "Guard back on and fastened before anything else.",
      why: "The guard goes on before the lock comes off. In that order there is never a moment the nip is reachable and the belt can move.",
    },
    {
      id: "pullcord", kind: "find", noHint: true,
      targets: ["cord-tie"],
      itemNames: { "cord-tie": "pull-cord tied back" },
      itemNotes: { "cord-tie": "The pull-cord along the return side is tied back to the frame with a cable tie — someone got tired of it tripping. It is cut free and the cord tested before this line runs." },
      title: "Walk the line for defeated safeguards",
      cue: "Check the pull-cords, guards and e-stops along the run and click what has been defeated.",
      why: "A jam on a conveyor with a working pull-cord is a stop. On one with the cord tied back it is an injury. The walk is how the second kind gets found.",
    },
    {
      id: "tension", kind: "gauge", target: "takeup-gauge",
      title: "Reset the belt tension",
      cue: "Bring the take-up back until the tension indicator is in the run band.",
      why: "The take-up was backed off to release energy; the belt runs at its tension or it slips and tracks off. Back into the band before restart.",
      gauge: { label: "TENSION", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Off the run band — slack tracks off, over-tight overloads the drive. Reset the take-up." },
    },
    {
      id: "restart", kind: "select", target: "restart-button",
      title: "Remove the lock, reset, restart",
      cue: "Your lock off, e-stop reset, clear the line, start.",
      why: "Lock off last, by you. The line is cleared by eye before the start, because the start is the moment everything you did is tested.",
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

    let running = true, tension = 1;
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
      animate(t, dt, session) {
        const step = session?.step;
        if (running) headPulley.rotation.y += dt * 3;
        if (step?.id === "bleed" && session.holding) { tension = Math.max(0.2, 1 - session.holdFor / 4); releaseKnob.rotation.y += dt * 4; }
        belt.position.y = 0.84 - (1 - tension) * 0.02;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "tension") repaint(tensionFace, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff4ff", scale: 0.6 }));
      },
    };
  },
};
