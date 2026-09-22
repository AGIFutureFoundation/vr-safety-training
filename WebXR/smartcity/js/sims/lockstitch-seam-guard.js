import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, rackFrame, rackUnit, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Lockstitch Seam Behind the Guard VR — Sewing & Garment Trades,
// station two. The same single-needle head from the threading station, now
// running production: a straight seam held at a working speed behind the
// finger guard, backtacked at both ends so the seam cannot pull out under the
// first wear it takes, a curve fed by guiding the cloth rather than dragging
// it into the needle, one bundle chained straight into the next without
// cutting the thread between pieces, a needle break stopped and accounted
// for down to the broken tip before the machine runs again, and the count
// reconciled against the ticket before the bundle moves on.

const LSG_ACCENT = 0x5a8fd6;

export const SIM_LOCKSTITCH_SEAM_GUARD = {
  id: "lockstitch-seam-guard",
  index: "173",
  domain: "Garment manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the needle guard behind which every seam runs, 1910.147 control of hazardous energy for a needle break, and NIOSH ergonomics guidance for the seated, repetitive pace a production line runs at",
  name: "Lockstitch Seam Behind the Guard",
  title: simTitle("Lockstitch Seam Behind the Guard"),
  tagline: "A straight seam at speed behind the guard, backtacked, a curve fed not pulled, chained bundle to bundle, a needle break accounted for, and the count",
  accent: LSG_ACCENT,
  accentCss: "#5a8fd6",
  parSeconds: 240,
  footprint: 2.2,
  badge: { id: "bundle-clean", name: "Bundle Clean", note: "A full bundle chained through at speed with a needle break handled cleanly and the count reconciled" },

  game: system({
    name: "Line Authority",
    currency: "SEAM",
    ranks: ["Floor Trainee", "Machine Operator", "Line Operator", "Lead Operator", "Line Authority Certified"],
    badges: [
      { id: "break-clean", name: "Break Handled Clean", note: "Every piece of a broken needle found and logged before the machine ran again", test: AWARD.stepClean("needle-break") },
      { id: "guard-kept", name: "Guard Kept", note: "Never reached into the needle zone while the machine could move", test: AWARD.safe },
      { id: "seam-steady", name: "Seam Steady", note: "Held the feed rate inside the band on both the straight seam and the curve", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections through the whole bundle", test: AWARD.clean },
      { id: "unbroken-feed", name: "Unbroken Feed", note: "Never dropped out of the feed band", test: AWARD.unbroken },
      { id: "bundle-fast", name: "Bundle Fast", note: "Bundle complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "needle-zone-reach": "You reached into the needle and presser-foot zone while the machine was still able to run. A production machine left live between pieces restarts on a bumped pedal exactly as fast as it does mid-seam — the zone behind the guard is not somewhere a hand rests while you reach for the next piece.",
    "belt-guard-gap": "The treadle motor's belt guard is hanging open with the pulley turning behind it. A worn latch left unfixed is still a missing guard the moment the machine is running, and 29 CFR 1910.212 does not treat a guard that is present but open as a guard that is on.",
    "snips-blade-up": "The thread snips are lying open, blade up, on the feed table where the next piece gets picked up. A blade left open in the one spot a hand reaches for cloth without looking is a cut that has nothing to do with the needle at all.",
    "bundle-blocking-pedal": "Loose-cut pieces from the bundle are piled over the foot pedal. A pedal that cannot travel its full stroke either fails to stop the machine when the foot comes off it or launches the seam at a speed the operator did not ask for — the pedal's travel stays clear, every bundle, not just the tidy ones.",
  },

  lateNotes: {
    "power-switch": "That is the needle-break control — nothing is wrong with the machine yet. Keep feeding the seam.",
    "foot-pedal": "Not yet — the guard, the ticket and the alignment come first, in that order.",
    "reverse-lever": "The backtack happens at the very start and the very end of the seam, not in the middle of it.",
  },

  steps: [
    {
      id: "ticket", kind: "select", target: "bundle-ticket",
      title: "Read the bundle ticket",
      cue: "Check the operation, the style and the quantity this bundle is cut for.",
      why: "The ticket is what says this bundle is this operation on this style, not the one that looks the same from across the room — a seam sewn to the wrong ticket's spec is a whole bundle recut on the clock, and the mistake is invisible until quality control finds it three operations later.",
    },
    {
      id: "guard-check", kind: "select", target: "needle-guard",
      title: "Confirm the needle guard is down",
      cue: "Check the finger guard is swung down in front of the needle before the machine runs at production speed.",
      why: "A guard that was down at the last threading check does not stay down on its own — it gets checked at the start of every bundle, because a shift's worth of seams run at a working pace with nothing between a guiding finger and the needle is exactly the exposure the guard exists to remove.",
    },
    {
      id: "align-guide", kind: "select", target: "seam-guide",
      title: "Check the seam guide is set",
      cue: "Confirm the edge guide on the bed is set to this ticket's seam allowance.",
      why: "The guide is what turns a hand-eye judgement into a repeatable seam allowance across an entire bundle — a guide left set for the last operation's allowance sews every piece in this bundle a consistent amount wrong, which is worse than random error because nothing about it looks off piece to piece.",
    },
    {
      id: "load-first", kind: "drag", target: "bundle",
      title: "Feed the first piece under the foot",
      cue: "Carry the top piece from the bundle onto the bed, aligned to the seam guide.",
      why: "The first piece sets the pace for the whole bundle — fed square to the guide before the foot ever comes down, not squared up after the needle has already started, because a seam that starts crooked stays crooked for its whole length.",
      drag: { to: "feed-socket", radius: 0.32, missNote: "Not aligned on the guide — carry the piece fully onto the bed against the edge guide." },
    },
    {
      id: "needle-down", kind: "turn", target: "handwheel",
      title: "Hand-turn the needle down into the cloth",
      cue: "Turn the handwheel by hand to set the needle down before the pedal takes over.",
      why: "Starting a seam with the needle already down and located exactly where the first stitch belongs is what keeps the first stitch from wandering off the seam line the instant the pedal is pressed — a seam that starts a stitch length off the mark is a flaw at the one point in the seam every inspection actually looks at.",
      turn: { turns: 0.15, axis: "z", label: "NEEDLE DOWN" },
    },
    {
      id: "backtack-start", kind: "hold", target: "reverse-lever", seconds: 2,
      title: "Backtack at the start",
      cue: "Hold the reverse lever for a few stitches before running the seam forward.",
      why: "A seam that starts with a plain forward stitch and nothing locking it pulls out the first time the garment is handled roughly — the backtack at the start is what keeps the whole seam from unravelling from one end the moment it takes any load.",
      holdBreakNote: "Released the reverse lever too soon. A short backtack does not lock the seam — hold it for the full few stitches.",
    },
    {
      id: "straight-seam", kind: "track", target: "foot-pedal", seconds: 6,
      title: "Run the straight seam at a working speed",
      cue: "Feed the piece through at a steady production pace, guiding rather than pushing it.",
      why: "A working pace is fast enough to make the bundle's quota and slow enough that a hand two inches from a needle moving several hundred times a minute has time to react to anything wrong — running too fast to correct a wander, or so slow the line falls behind, are both the wrong answer to what this step is actually asking for.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "FEED RATE", readout: (v) => (v < 0.4 ? "too slow — line falls behind" : v > 0.6 ? "too fast to react" : "working pace") },
      holdBreakNote: "Feed rate broke out of the working band. Bring it back to a pace you can actually react inside before continuing.",
    },
    {
      id: "backtack-end", kind: "hold", target: "reverse-lever", seconds: 2,
      title: "Backtack at the end",
      cue: "Hold the reverse lever again for a few stitches to lock the far end of the seam.",
      why: "The end of the seam takes the same load the start does the first time the garment is pulled the other way — locking both ends the same way is what makes the seam a closed loop of stitching instead of a run that only holds until somebody tugs the wrong corner.",
      holdBreakNote: "Released too soon again. Both ends of this seam get the same lock — hold the full backtack.",
    },
    {
      id: "curve-feed", kind: "track", target: "foot-pedal", seconds: 6,
      title: "Feed the curve by guiding, not pulling",
      cue: "Turn the piece through the curve with your hands, keeping the feed rate steady rather than pulling cloth through faster than the feed dogs move it.",
      why: "Pulling cloth through a curve faster than the feed dogs are moving it stretches the seam allowance on the inside of the curve and puckers it, which is a defect that shows on the finished garment no amount of pressing fixes — the feed dogs set the pace on a curve exactly the way they do on a straight line, and the hands only steer.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.4, drift: 0.14, label: "FEED RATE", readout: (v) => (v < 0.4 ? "too slow — dragging" : v > 0.6 ? "too fast — pulling the seam" : "guided, not pulled") },
      holdBreakNote: "The curve got pulled out of the feed band. Let the feed dogs set the pace and just steer the piece.",
    },
    {
      id: "chain-next", kind: "drag", target: "next-piece",
      title: "Chain straight into the next piece",
      cue: "Without cutting the thread, carry the next piece from the bundle up to the foot.",
      why: "Chaining pieces one after another with the thread still connecting them is what a piece-rate line actually runs on — stopping to cut thread and re-thread the start of every single piece costs more time across a bundle than it is ever worth, so the pieces are separated afterward, at the trimming table, not here.",
      drag: { to: "feed-socket", radius: 0.32, missNote: "Not aligned to feed — carry the next piece fully onto the guide before it reaches the foot." },
    },
    {
      id: "needle-break", kind: "sequence",
      targets: ["power-switch", "tip-in-fabric", "tip-on-floor", "log-board"],
      itemNames: {
        "power-switch": "power off", "tip-in-fabric": "broken tip found in the fabric",
        "tip-on-floor": "broken tip found on the floor", "log-board": "break logged",
      },
      title: "Handle a needle break",
      cue: "Power off the instant it snaps, then account for every broken piece before you log it.",
      why: "A needle that snaps leaves at least two pieces — the stub still in the clamp and the tip, which can be anywhere from the fabric to the floor to inside the bobbin case — and a tip that is not found stays lost inside a garment that ships, which is exactly the kind of defect a metal detector at the end of the line exists to catch after it was already avoidable here.",
      outOfOrderNote: "Power off first, then find every piece, then log it — not the other way around.",
    },
    {
      id: "count", kind: "select", target: "count-tally",
      title: "Reconcile the count",
      cue: "Check the finished pieces against the ticket's quantity on the tally counter.",
      why: "The count is what tells the next operation this bundle is complete rather than short a piece that got set aside and forgotten — a bundle passed on short is a shortage nobody notices until it is somebody else's missing piece at final inspection.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["guard-propped", "pins-floor"],
      itemNames: { "guard-propped": "guard propped open with a bobbin", "pins-floor": "pins on the floor by the treadle" },
      itemNotes: {
        "guard-propped": "Somebody propped the needle guard open with a spare bobbin to \"see the needle better.\" That is the guard defeated, not adjusted.",
        "pins-floor": "Loose pins dropped by the treadle are a puncture waiting for the next person who kicks off their shoe under the table.",
      },
      title: "Walk the station before the next bundle",
      cue: "Two things at this bench are out of place. Find them by looking.",
      why: "A bundle that ran clean can still leave the station worse than it found it — a propped guard or pins on the floor are both invisible from the operator's chair and both somebody else's injury if the next person to sit down does not catch them first.",
    },
  ],

  // A needle break at speed, and a ticket that quietly stops matching the
  // cut halfway through the bundle. See shared/game.js.
  interrupts: [
    {
      id: "needle-snap",
      kind: "Needle break",
      after: "straight-seam", delay: 3, seconds: 10,
      alert: "The needle snaps mid-seam with a sharp crack, and the machine is still trying to feed the piece through.",
      cue: "That was the needle breaking, not a skipped stitch.",
      target: "power-switch",
      why: "A snapped needle can put a piece of itself anywhere from the fabric to the bobbin case in the half-second it takes to notice, and every second the machine keeps running afterward is a chance for the feed dogs to drive a broken tip further into the piece or into the hook — the power comes off before anything else happens, including finishing the stitch you were on.",
      missNote: "The machine kept feeding after the needle snapped. Whatever is left of that needle just went further into the piece or the hook than it was a second ago, and now it has to be found blind instead of found where it broke.",
      wrongNote: "That's not the ticket — the machine is still running on a broken needle. Power off first.",
    },
    {
      id: "ticket-mismatch",
      kind: "Ticket does not match the cut",
      after: "chain-next", delay: 4, seconds: 12,
      alert: "The piece you just chained in is a different pattern size than the one printed on your bundle ticket.",
      cue: "That piece does not match what your ticket says this bundle is.",
      target: "bundle-ticket",
      why: "A bundle that got mixed at the cutting table looks identical piece to piece until somebody actually checks the ticket against what is in their hands — sewing a mismatched piece into a seam produces a garment that fails at final inspection for a reason nobody on this line caused, and it is far cheaper to catch here than after it is sewn.",
      missNote: "The mismatched piece went into the seam anyway. Whatever size that piece actually is, it is now sewn into a bundle labelled for a different one, and it will not be caught again until someone downstream is holding the finished piece.",
      wrongNote: "The pedal isn't the problem — check the piece in your hands against the ticket before it goes under the foot.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, LSG_ACCENT);
    box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x424852, { rough: 0.9 });

    // The production machine: same family of head as the threading station,
    // now dressed for a running bundle rather than a set-up bench.
    const table = group(g, 0, 0.1, -0.7);
    for (const sx of [-0.7, 0.7]) box(table, 0.08, 0.75, 0.5, sx, 0.375, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const bed = box(table, 1.5, 0.05, 0.7, 0, 0.75, 0, 0x2b2f34, { rough: 0.5, metal: 0.55 });
    void bed;
    const head = group(table, 0.1, 0.78, 0);
    box(head, 0.75, 0.08, 0.28, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    box(head, 0.14, 0.5, 0.22, -0.28, 0.29, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    box(head, 0.6, 0.14, 0.24, 0.02, 0.55, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    const needleBar = group(head, 0.28, 0.42, 0.06);
    cyl(needleBar, 0.012, 0.012, 0.28, 0, -0.05, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 });
    const presserBar = group(head, 0.28, 0.42, 0.1);
    cyl(presserBar, 0.012, 0.012, 0.24, 0, -0.03, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    box(presserBar, 0.06, 0.02, 0.1, 0, -0.15, 0, 0x22262b, { rough: 0.5 });
    const guard = group(head, 0.28, 0.35, 0.14, -0.3);
    box(guard, 0.03, 0.14, 0.01, 0, 0, 0, 0xe8b02e, { rough: 0.5, opacity: 0.75, transparent: true });
    reg(hits, guard, "needle-guard");
    const wheelGroup = group(head, 0.42, 0.25, 0);
    cyl(wheelGroup, 0.09, 0.09, 0.02, 0, 0, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 20 }).rotation.z = Math.PI / 2;
    reg(hits, wheelGroup, "handwheel");
    const reverseLever = group(head, -0.1, 0.55, 0.1);
    box(reverseLever, 0.03, 0.09, 0.015, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    reg(hits, reverseLever, "reverse-lever");

    // Needle-zone hazard marker, separate from the needle-guard control.
    const needleZone = box(head, 0.1, 0.14, 0.1, 0.28, 0.34, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, needleZone, "needle-zone-reach");

    // Seam guide on the bed edge.
    const seamGuide = box(head, 0.14, 0.01, 0.02, 0.05, 0.045, 0.15, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    reg(hits, seamGuide, "seam-guide");

    // Feed point marker, where the bundle's pieces come onto the bed.
    const feedMarker = box(head, 0.2, 0.005, 0.16, 0.02, 0.048, 0.14, 0xffffff, { rough: 0.5 });
    feedMarker.visible = false; hits["feed-socket"] = feedMarker;

    // Bundle stack, and the second stack chained in from.
    const bundle = group(g, -1.3, 0.1, 0.6, 0.2);
    box(bundle, 0.36, 0.2, 0.28, 0, 0.1, 0, 0xd8c9a3, { rough: 0.7 });
    holoTag(bundle, "bundle", 0, 0.28, 0, { css: "#5a8fd6", w: 0.2 });
    reg(hits, bundle, "bundle");
    const nextStack = group(g, -1.0, 0.1, 1.1, 0.1);
    box(nextStack, 0.34, 0.18, 0.26, 0, 0.09, 0, 0xd0c39a, { rough: 0.7 });
    holoTag(nextStack, "next piece", 0, 0.25, 0, { css: "#5a8fd6", w: 0.24 });
    reg(hits, nextStack, "next-piece");

    // Ticket panel, count tally, log board, thread snips, the belt hazard.
    const ticket = holoPanel(g, 0.5, 0.32, -1.3, 1.4, -1.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,12,18,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5a8fd6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dbe6f5"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("BUNDLE 214 — OP 12", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#dbe6f5";
      ["Style 4402, size 10, qty 24", "Straight seam, side panel", "Seam allowance 1.0 cm"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.38 + i * 0.15)));
    }, { ry: 0.5, accent: LSG_ACCENT });
    reg(hits, ticket, "bundle-ticket");

    const tally = instrument(g, 0.9, 0.85, -0.15, { idle: "0 / 24", color: LSG_ACCENT, w: 0.13, d: 0.2 });
    holoTag(tally, "count tally", 0, 0.15, 0, { css: "#5a8fd6", w: 0.24 });
    reg(hits, tally, "count-tally");

    const logBoard = group(g, 1.3, 0.1, -0.15, 0.2);
    box(logBoard, 0.3, 0.4, 0.02, 0, 0.75, 0, 0x2b2f34, { rough: 0.6 });
    decal(logBoard, 0.26, 0.34, 0, 0.75, 0.012, signFace("NEEDLE\nBREAK LOG", { bg: "#0d1c24", accent: "#5a8fd6", scale: 0.4 }));
    reg(hits, logBoard, "log-board");

    const powerSwitch = group(table, 0.65, 0.55, 0.28);
    box(powerSwitch, 0.06, 0.08, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5 });
    box(powerSwitch, 0.02, 0.045, 0.02, 0, 0.01, 0.025, 0xd2312b, { rough: 0.5 });
    decal(powerSwitch, 0.09, 0.025, 0, -0.05, 0.022, signFace("POWER", { bg: "#22262b", accent: "#5a8fd6", scale: 0.55 }));
    reg(hits, powerSwitch, "power-switch");

    const pedal = group(g, 0.1, 0.1, 0.55);
    box(pedal, 0.3, 0.06, 0.22, 0, 0.03, 0, 0x22262b, { rough: 0.6 });
    box(pedal, 0.26, 0.02, 0.18, 0, 0.07, 0.01, 0x14171a, { rough: 0.6 });
    reg(hits, pedal, "foot-pedal");
    const pedalDebris = box(g, 0.28, 0.05, 0.2, 0.1, 0.08, 0.55, 0xd0c39a, { rough: 0.7 });
    reg(hits, pedalDebris, "bundle-blocking-pedal");

    // Broken-tip find props: one snagged in a scrap on the bed, one on the floor.
    const tipInFabric = box(head, 0.006, 0.006, 0.03, 0.06, 0.048, 0.13, 0xdfe4e8, { rough: 0.2, metal: 0.9 });
    reg(hits, tipInFabric, "tip-in-fabric");
    const tipOnFloor = box(g, 0.006, 0.006, 0.03, -0.2, 0.005, 0.65, 0xdfe4e8, { rough: 0.2, metal: 0.9 });
    reg(hits, tipOnFloor, "tip-on-floor");

    const snips = group(g, 0.9, 0.79, -0.2, 0.6);
    box(snips, 0.09, 0.008, 0.02, 0, 0, 0, 0xb9bec4, { rough: 0.3, metal: 0.8 });
    box(snips, 0.02, 0.008, 0.05, -0.04, 0, 0.03, 0x22262b, { rough: 0.6 });
    reg(hits, snips, "snips-blade-up");

    const under = group(table, 0.3, 0, 0.2);
    box(under, 0.18, 0.14, 0.14, 0, 0.14, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    cyl(under, 0.05, 0.05, 0.03, 0, 0.24, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 16 });
    const belt = box(under, 0.02, 0.4, 0.02, 0, 0.5, 0, 0x1b1e22, { rough: 0.6 });
    reg(hits, belt, "belt-guard-gap");

    // Find-step decoys: the guard propped, and pins on the floor.
    const bobbinProp = cyl(head, 0.018, 0.018, 0.03, 0.28, 0.28, 0.2, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 12 });
    reg(hits, bobbinProp, "guard-propped");
    const pinsFloor = group(g, -0.4, 0, 0.6);
    for (let i = 0; i < 4; i++) cyl(pinsFloor, 0.002, 0.002, 0.03, (i % 2) * 0.03, 0.001, Math.floor(i / 2) * 0.03, 0xdfe4e8, { rough: 0.2, metal: 0.8, seg: 6 }).rotation.z = Math.PI / 2;
    reg(hits, pinsFloor, "pins-floor");

    // -------------------------------------------------------- room dressing
    for (const dz of [1.1, 2.0]) {
      const other = group(g, -1.9, 0.1, -1.0 + dz * -0.6, 0);
      box(other, 1.2, 0.75, 0.5, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
      box(other, 0.6, 0.28, 0.22, -0.1, 0.9, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6 });
      cyl(other, 0.07, 0.02, 0.28, 0.24, 1.0, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const overlockBox = group(g, 1.9, 0.1, -1.7, -0.5);
    box(overlockBox, 0.7, 0.75, 0.5, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    box(overlockBox, 0.4, 0.3, 0.3, 0, 0.9, 0, 0x9aa1a8, { rough: 0.4, metal: 0.6 });
    holoTag(overlockBox, "overlock", 0, 1.15, 0, { css: "#5a8fd6", w: 0.24 });
    const cutTable = group(g, 2.0, 0.1, 1.4, 0.2);
    box(cutTable, 1.4, 0.75, 0.8, 0, 0.375, 0, 0x6b5b46, { rough: 0.7 });
    box(cutTable, 1.3, 0.03, 0.7, 0, 0.77, 0, 0xe6ddc6, { rough: 0.6 });
    holoTag(cutTable, "cutting table", 0, 0.95, 0, { css: "#5a8fd6", w: 0.28 });
    const press = group(g, -2.3, 0.1, 1.7, 0.3);
    box(press, 0.5, 1.1, 0.5, 0, 0.55, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    box(press, 0.6, 0.1, 0.6, 0, 1.15, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    holoTag(press, "press", 0, 1.35, 0, { css: "#5a8fd6", w: 0.2 });

    const threadRack = rackFrame(g, -0.3, 1.9, { ry: 0, h: 1.1 });
    for (let i = 0; i < 3; i++) rackUnit(threadRack, 0.22 + i * 0.3, ["SPUN POLY", "COTTON WRAP", "HEAVY BOND"][i], { css: "#5a8fd6" });

    const bolts = group(g, 1.4, 0.1, 2.2, 0.2);
    for (let i = 0; i < 3; i++) cyl(bolts, 0.15, 0.15, 0.7, i * 0.34, 0.15, 0, [0x4f6f8c, 0x8c5a4f, 0x5a8c6f][i], { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bolts, "cloth bolts", 0.34, 0.4, 0, { css: "#5a8fd6", w: 0.24 });

    toolChest(g, 2.4, -0.2, { ry: -0.4, color: 0x5b6672 });
    const crewOne = standingFigure(g, -2.4, -1.3, { ry: 0.6, cloth: 0x37505f });
    const crewTwo = standingFigure(g, 2.6, 0.55, { ry: -1.6, cloth: 0x506070 });
    void crewOne; void crewTwo;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.7),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "guard-check") guard.rotation.y = 0;
        if (step.id === "load-first") { bundle.parent.remove(bundle); table.add(bundle); bundle.position.set(0.05, 0.048, 0.14); bundle.scale.set(0.5, 0.3, 0.5); }
        if (step.id === "chain-next") { nextStack.parent.remove(nextStack); table.add(nextStack); nextStack.position.set(0.05, 0.048, 0.05); nextStack.scale.set(0.5, 0.3, 0.5); }
        if (step.id === "count") repaint(tally.userData.screen, signFace("24 / 24", { bg: "#0d1c24", accent: "#59c97b", fg: "#dbe6f5", scale: 0.55 }));
        if (step.id === "walk") { bobbinProp.visible = false; pinsFloor.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "needle-snap") needleBar.rotation.z = 0.3;
        if (it.id === "ticket-mismatch") nextStack.rotation.z = 0.4;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "needle-snap") needleBar.rotation.z = 0;
        if (it.id === "ticket-mismatch") nextStack.rotation.z = 0;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "needle-down" && session.turn) wheelGroup.rotation.x = session.turn.amount * Math.PI * 2;
        if ((step?.id === "straight-seam" || step?.id === "curve-feed") && session.holding) wheelGroup.rotation.x += dt * 14;
        void t;
      },
    };
  },
};
