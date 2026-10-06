import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, rackFrame, rackUnit, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Serger and Overlock VR — Sewing & Garment Trades, station
// three. The overlock machine finishes an edge and trims it in the same
// motion its lockstitch neighbours never touch: a spring-loaded knife
// running the whole time the machine does. Four threads have to go in by
// colour and in order before anything is trimmed, the cutting width is set
// to the seam allowance rather than guessed, the chain-off protects the
// knife from an empty run, and the one thing that never happens is clearing
// packed lint from around that knife without the machine locked out first.

const SOL_ACCENT = 0x5fb99a;

export const SIM_SERGER_OVERLOCK = {
  id: "serger-overlock",
  index: "174",
  domain: "Garment manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the overlock's own moving knife, 1910.147 control of hazardous energy before the knife or the throat plate is ever cleared of lint, and NIOSH ergonomics guidance for seated repetitive feeding",
  name: "Serger and Overlock",
  title: simTitle("Serger and Overlock"),
  tagline: "The knife guard, four threads by colour, the cutting width set, edges finished, the chain-off, and the knife locked out for cleaning",
  accent: SOL_ACCENT,
  accentCss: "#5fb99a",
  parSeconds: 235,
  footprint: 2.2,
  badge: { id: "edge-clean", name: "Edge Clean", note: "Four threads set by colour, an edge finished at the right width, and the knife cleaned only after lockout" },

  game: system({
    name: "Overlock Authority",
    currency: "LOOP",
    ranks: ["Floor Trainee", "Machine Operator", "Set-Up Operator", "Lead Operator", "Overlock Authority Certified"],
    badges: [
      { id: "knife-locked", name: "Knife Locked for Cleaning", note: "Never cleared lint from the knife without the machine locked out first", test: AWARD.stepClean("lockout-clean") },
      { id: "hands-clear", name: "Hands Clear of the Knife", note: "Never reached past the guard while the knife could move", test: AWARD.safe },
      { id: "width-true", name: "Width True", note: "Cutting width held close to the ticket's spec", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Set-Up", note: "No corrections through the whole thread-up", test: AWARD.clean },
      { id: "steady-feed", name: "Steady Feed", note: "Held the edge-finishing feed without dropping out", test: AWARD.unbroken },
      { id: "quick-thread", name: "Quick Thread", note: "Threaded and running inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "knife-reach-live": "You reached past the knife guard with the machine still powered. An overlock's knife is spring-loaded against the machine's own motion the entire time it runs, not only while fabric is actually being trimmed, so a hand past the guard is a hand at the blade whether or not anything is currently being cut.",
    "throat-plate-open": "The throat plate is off and the feed dogs and looper are exposed while the machine can still run. That opening is built to be worked through with the machine dead and the plate back on before the first stitch, not left open because the last adjustment was easier to see that way.",
    "thread-cone-tangle": "A thread cone has come off its holder and is tangled across the machine's own moving parts. Thread wound around a turning looper or knife shaft does not stay thread for long — it either snaps and whips or it drags whatever is tangled in it, and neither one is something to sort out with the machine running.",
    "loose-cuff-near-knife": "A loose cuff is hanging within reach of the knife's own swing. The blade does not know the difference between a scrap of fabric and a sleeve, and a cuff worked that close to a running overlock is exactly how a moment's inattention becomes a trip to the clinic instead of a finished edge.",
  },

  lateNotes: {
    "power-switch": "Cleaning the knife starts with power off, not the other way around — that comes at the lockout step.",
    "foot-pedal": "Not yet — the threads, the width and the guard all come first.",
    "knife-lever": "The knife only gets disengaged once the machine is already stopped at the switch.",
  },

  steps: [
    {
      id: "job-card", kind: "select", target: "job-card",
      title: "Read the job card",
      cue: "Check the edge finish, the thread colours and the cutting width this ticket calls for.",
      why: "An overlock's whole set-up — which four threads, how wide the knife trims, whether the edge is a plain finish or a rolled hem — comes off this ticket, not off whatever the machine happened to be set for on the last job that came through the station.",
    },
    {
      id: "knife-guard-check", kind: "select", target: "knife-guard",
      title: "Confirm the knife guard is in place",
      cue: "Check the spring guard sits closed over the knife before the machine is threaded.",
      why: "The guard is what keeps the one continuously moving blade on this machine away from a threading hand — it gets checked before the threads go in, because threading an overlock puts fingers closer to the knife than almost anything else this machine is used for.",
    },
    {
      id: "thread-four", kind: "sequence",
      targets: ["looper-upper", "looper-lower", "needle-left", "needle-right"],
      itemNames: {
        "looper-upper": "upper looper (yellow)", "looper-lower": "lower looper (blue)",
        "needle-left": "left needle (red)", "needle-right": "right needle (green)",
      },
      title: "Thread all four by colour, in order",
      cue: "Follow the machine's own colour-coded path: upper looper, lower looper, left needle, right needle.",
      why: "An overlock's stitch only forms because the two loopers and the two needles interlock their threads in a fixed sequence, and threading one out of order leaves a loop with nothing to catch it — the colour coding on the machine exists precisely because getting this order right by memory alone, under a deadline, is not something even an experienced operator gets right every time.",
      outOfOrderNote: "Upper looper, then lower looper, then the two needles — the colours on the machine are the order, not a suggestion.",
    },
    {
      id: "width-set", kind: "gauge", target: "width-dial",
      title: "Set the cutting width",
      cue: "Dial the knife's cutting width to the seam allowance on the job card.",
      why: "The knife trims the same width off every single piece that runs through it, so a width set even slightly off the ticket removes exactly that much seam allowance from every piece in the whole lot — a mistake that is invisible until an operation downstream cannot get enough fabric to actually sew the seam it needs.",
      gauge: { label: "CUT WIDTH", speed: 0.75, green: [0.44, 0.6], readout: (t) => `${(3.0 + t * 4.0).toFixed(1)} mm`, missNote: "Off the ticket's seam allowance — reset the width before the first piece runs." },
    },
    {
      id: "diff-feed", kind: "turn", target: "diff-feed-dial",
      title: "Set the differential feed",
      cue: "Turn the differential feed dial to match this fabric's stretch.",
      why: "The front and back feed dogs on an overlock can be told to move at different rates on purpose, which is what keeps a stretch knit from waving at the edge and a woven from puckering under the stitch — the same needle and thread settings look completely different on the finished edge depending only on this one dial.",
      turn: { turns: 0.3, axis: "z", label: "DIFF FEED" },
    },
    {
      id: "finish-edge", kind: "track", target: "foot-pedal", seconds: 6,
      title: "Finish the edge at a steady feed",
      cue: "Feed the raw edge through at a steady rate, neither starving the knife nor overfeeding it.",
      why: "Feeding too slowly lets the knife bite the same spot twice and nick the finished edge; feeding too fast pushes more fabric at the blade than it is set to trim and leaves a ragged cut the loopers cannot properly wrap — a steady feed is what makes the edge come out both cut clean and finished clean at the same time.",
      track: { start: 0.15, green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "FEED RATE", readout: (v) => (v < 0.4 ? "too slow — double cut" : v > 0.6 ? "too fast — ragged edge" : "steady") },
      holdBreakNote: "Feed dropped out of the steady band. Bring it back before the edge shows it.",
    },
    {
      id: "chain-off", kind: "drag", target: "thread-chain",
      title: "Chain off the end",
      cue: "Let the stitch run a couple of inches past the fabric's edge and carry the thread chain clear of the knife.",
      why: "Running the machine's own knife off the end of an empty chain instead of stopping dead at the fabric's edge is what keeps the loopers from jamming on an abrupt stop — the chain is what protects the machine, and it is pulled clear before anyone reaches anywhere near where it just came from.",
      drag: { to: "chain-clear-socket", radius: 0.3, missNote: "Not clear of the knife yet — carry the chain fully to the holding clip." },
    },
    {
      id: "cut-chain", kind: "select", target: "hand-snips",
      title: "Cut the chain with hand snips",
      cue: "Trim the thread chain with the hand snips, never the machine's own knife.",
      why: "The overlock's knife is set to the ticket's seam allowance, not to trimming thread tails, and running a thread chain back across it to save reaching for the snips is exactly the kind of shortcut that puts a hand back at the blade for no reason connected to the actual job.",
    },
    {
      id: "lockout-clean", kind: "sequence",
      targets: ["power-switch", "knife-lever", "lint-brush"],
      itemNames: { "power-switch": "power off", "knife-lever": "knife disengaged", "lint-brush": "lint brushed clear" },
      title: "Lock out before clearing lint from the knife",
      cue: "Power off, disengage the knife lever, then brush the lint clear — in that order.",
      why: "Lint packs into the space right around a moving knife faster on an overlock than on almost any other machine in the room, and clearing it with fingers while the machine is only 'probably' stopped is how a routine five-second job becomes the injury this station exists to prevent — the knife is confirmed disengaged, not just the motor confirmed off, before anything goes near it.",
      outOfOrderNote: "Power off, then the knife lever, then the brush — never brush first.",
    },
    {
      id: "reseat-plate", kind: "select", target: "throat-plate",
      title: "Reseat the throat plate",
      cue: "Set the throat plate back down flush before the machine runs again.",
      why: "A throat plate left off or sitting loose changes how the feed dogs grip the fabric and leaves the looper mechanism exposed at the exact spot a guiding hand sits closest to the machine — it goes back on before the machine is trusted to run, not after the next piece already shows a skipped stitch.",
    },
    {
      id: "power-restore", kind: "select", target: "power-switch",
      title: "Restore power",
      cue: "With the plate reseated and hands clear, turn the machine back on.",
      why: "Power comes back only once the plate is confirmed down and every tool is out of the knife and looper area — turning it on to test whether the plate is seated right is testing it with the machine, not before it.",
    },
    {
      id: "test-stitch", kind: "hold", target: "foot-pedal", seconds: 3,
      title: "Run a check stitch on scrap",
      cue: "Feed a scrap edge through and hold the pedal for a clean, even four-thread stitch.",
      why: "A check stitch on scrap is what proves the threading, the width and the differential feed all came back together correctly after the clean-out — nothing goes back into production off an assumption that reassembly went the way it was supposed to.",
      holdBreakNote: "Released mid check-stitch. An uneven restart is exactly what this step exists to catch — hold it through cleanly.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["guard-not-latched", "lint-under-table"],
      itemNames: { "guard-not-latched": "knife guard not latched", "lint-under-table": "lint pile under the table" },
      itemNotes: {
        "guard-not-latched": "The guard is resting closed but not actually latched — one bump and it swings open on a running knife.",
        "lint-under-table": "A drift of lint under the table is a housekeeping problem today and a fire load the day something runs hot.",
      },
      title: "Walk the station before the next job",
      cue: "Two things at this bench are out of place. Find them by looking.",
      why: "A finished edge that measures perfectly can still leave a guard that only looks closed or a lint pile nobody has swept in a week — both are invisible from the operator's own chair, which is exactly why they get looked for on purpose rather than noticed by accident.",
    },
  ],

  // Lint jams the knife mid-run, and a coworker leans in close enough to put
  // a loose sleeve near it. See shared/game.js.
  interrupts: [
    {
      id: "lint-jam",
      kind: "Lint packs the knife",
      after: "finish-edge", delay: 4, seconds: 12,
      alert: "Lint packs solid around the knife mid-seam and the edge starts coming out ragged instead of clean.",
      cue: "That ragged edge is lint jamming the knife, not a feed problem.",
      target: "power-switch",
      why: "The fix for a packed knife is the same lockout sequence as any other time this machine is cleared — power off, knife disengaged, then the lint brushed clear — reaching in to pick lint out from around a knife that is still able to move is trading a five-second delay for the exact injury this station is built to prevent.",
      missNote: "A hand went in toward the packed knife without the power coming off first. The knife did not know the difference between compacted lint and a fingertip — it was still able to move either way.",
      wrongNote: "The chain can wait — power off before anything goes near that packed knife.",
    },
    {
      id: "sleeve-lean-in",
      kind: "Coworker leans in with a loose sleeve",
      after: "thread-four", delay: 3, seconds: 11,
      alert: "A coworker leans in close over your shoulder to watch the threading, their loose sleeve swinging in near the knife guard.",
      cue: "That sleeve is drifting closer to the knife than they realise.",
      target: "knife-guard",
      why: "The knife guard is the boundary that matters here, not how close a person means to get — a loose sleeve does not stop on its own the way a hand can, so the guard is what gets checked and pointed to the moment anyone's clothing drifts near it, before the threading continues.",
      missNote: "The sleeve kept drifting near the running knife while the threading continued around it. Nobody's hand was ever actually on the blade, and that is exactly why nobody noticed how close the cuff had gotten until it was pointed out.",
      wrongNote: "The threads can wait a second — that sleeve is the thing that's actually near the blade.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SOL_ACCENT);
    box(g, 4.6, 0.1, 4.2, 0, 0.05, 0, 0x40453f, { rough: 0.9 });

    // The overlock: base, standard, head with the looper cover, knife.
    const table = group(g, 0, 0.1, -0.7);
    for (const sx of [-0.65, 0.65]) box(table, 0.08, 0.75, 0.48, sx, 0.375, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    box(table, 1.4, 0.05, 0.68, 0, 0.75, 0, 0x2b2f34, { rough: 0.5, metal: 0.55 });
    const head = group(table, 0.1, 0.78, 0);
    box(head, 0.6, 0.42, 0.3, 0, 0.2, 0, 0x3c444c, { rough: 0.35, metal: 0.6 });
    box(head, 0.16, 0.3, 0.22, -0.2, 0.5, 0, 0x3c444c, { rough: 0.35, metal: 0.6 });
    box(head, 0.5, 0.1, 0.26, 0, 0.68, 0, 0x3c444c, { rough: 0.35, metal: 0.6 });

    // Loopers and needles, colour-coded.
    const looperUpper = ball(head, 0.02, -0.05, 0.28, 0.1, 0xe8c94a, { rough: 0.4, metal: 0.4 });
    reg(hits, looperUpper, "looper-upper");
    const looperLower = ball(head, 0.02, -0.05, 0.16, 0.1, 0x4a7fe8, { rough: 0.4, metal: 0.4 });
    reg(hits, looperLower, "looper-lower");
    const needleLeft = cyl(head, 0.006, 0.006, 0.14, 0.02, 0.24, 0.11, 0xd2312b, { rough: 0.3, metal: 0.7, seg: 8 });
    reg(hits, needleLeft, "needle-left");
    const needleRight = cyl(head, 0.006, 0.006, 0.14, 0.06, 0.24, 0.11, 0x4a9a5a, { rough: 0.3, metal: 0.7, seg: 8 });
    reg(hits, needleRight, "needle-right");

    // Knife assembly and its spring guard.
    const knife = box(head, 0.012, 0.1, 0.02, 0.1, 0.16, 0.14, 0xdfe4e8, { rough: 0.2, metal: 0.9 });
    void knife;
    const guard = group(head, 0.14, 0.24, 0.14, -0.2);
    box(guard, 0.02, 0.16, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5, opacity: 0.7, transparent: true });
    reg(hits, guard, "knife-guard");
    const knifeZone = box(head, 0.08, 0.16, 0.08, 0.1, 0.18, 0.14, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, knifeZone, "knife-reach-live");

    // Throat plate, feed dogs, and the exposed-plate hazard when it is off.
    const throatPlate = box(head, 0.16, 0.01, 0.14, 0.06, 0.005, 0.12, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    reg(hits, throatPlate, "throat-plate");
    const throatOpen = box(head, 0.14, 0.02, 0.12, 0.06, -0.01, 0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, throatOpen, "throat-plate-open");

    // Cutting width dial, differential feed dial, power switch, knife lever.
    const widthDial = instrument(g, -0.6, 0.85, 0.35, { idle: "-.- mm", color: SOL_ACCENT, w: 0.12, d: 0.19 });
    holoTag(widthDial, "cut width", 0, 0.15, 0, { css: "#5fb99a", w: 0.22 });
    reg(hits, widthDial, "width-dial");
    const diffFeed = cyl(head, 0.02, 0.02, 0.05, -0.18, 0.35, 0.14, 0xf2c14b, { rough: 0.5, seg: 12 });
    diffFeed.rotation.z = Math.PI / 2;
    reg(hits, diffFeed, "diff-feed-dial");
    const powerSwitch = group(table, 0.6, 0.55, 0.26);
    box(powerSwitch, 0.06, 0.08, 0.04, 0, 0, 0, 0x22262b, { rough: 0.5 });
    box(powerSwitch, 0.02, 0.045, 0.02, 0, 0.01, 0.025, 0xd2312b, { rough: 0.5 });
    decal(powerSwitch, 0.09, 0.025, 0, -0.05, 0.022, signFace("POWER", { bg: "#22262b", accent: "#5fb99a", scale: 0.55 }));
    reg(hits, powerSwitch, "power-switch");
    const knifeLever = box(head, 0.03, 0.02, 0.05, 0.16, 0.32, 0.05, 0x8b929a, { rough: 0.4, metal: 0.6 });
    reg(hits, knifeLever, "knife-lever");

    // Foot pedal, thread chain, snips, job card.
    const pedal = group(g, 0.1, 0.1, 0.55);
    box(pedal, 0.3, 0.06, 0.22, 0, 0.03, 0, 0x22262b, { rough: 0.6 });
    box(pedal, 0.26, 0.02, 0.18, 0, 0.07, 0.01, 0x14171a, { rough: 0.6 });
    reg(hits, pedal, "foot-pedal");
    const chain = box(head, 0.006, 0.006, 0.2, 0.1, 0.15, 0.24, 0xf4ecd0, { rough: 0.6, cast: false });
    reg(hits, chain, "thread-chain");
    const chainSocket = box(g, 0.1, 0.02, 0.1, 0.3, 0.79, 0.4, 0xffffff, { rough: 0.5 });
    chainSocket.visible = false; hits["chain-clear-socket"] = chainSocket;
    const snips = group(g, 0.9, 0.79, -0.2, 0.6);
    box(snips, 0.09, 0.008, 0.02, 0, 0, 0, 0xb9bec4, { rough: 0.3, metal: 0.8 });
    box(snips, 0.02, 0.008, 0.05, -0.04, 0, 0.03, 0x22262b, { rough: 0.6 });
    reg(hits, snips, "hand-snips");
    const lintBrush = group(g, 0.6, 0.1, -0.3, 0.4);
    box(lintBrush, 0.03, 0.18, 0.03, 0, 0.09, 0, 0xb8853a, { rough: 0.8 });
    box(lintBrush, 0.06, 0.03, 0.02, 0, 0.19, 0, 0x2b2f34, { rough: 0.7 });
    reg(hits, lintBrush, "lint-brush");

    const jobCard = holoPanel(g, 0.48, 0.32, -1.3, 1.4, -1.1, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8,14,12,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5fb99a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dff4ec"; ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("JOB 4402 — OVERLOCK", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#dff4ec";
      ["4-thread edge finish", "Cut width 5.0 mm", "Differential feed 1.3 for knit"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.38 + i * 0.15)));
    }, { ry: 0.5, accent: SOL_ACCENT });
    reg(hits, jobCard, "job-card");

    // Hazard props: tangled cone, and a loose cuff prop near the knife swing.
    const tangleCone = group(g, -1.4, 0.79, 0.1, 0.5);
    cyl(tangleCone, 0.035, 0.035, 0.09, 0, 0, 0, SOL_ACCENT, { rough: 0.6, seg: 14 });
    box(tangleCone, 0.14, 0.006, 0.006, 0, 0.05, 0, 0xf4ecd0, { rough: 0.6, cast: false });
    reg(hits, tangleCone, "thread-cone-tangle");
    const cuffProp = group(head, 0.2, 0.2, 0.12, 0.3);
    cyl(cuffProp, 0.03, 0.03, 0.1, 0, 0, 0, 0xe6e2d6, { rough: 0.8, seg: 10 });
    reg(hits, cuffProp, "loose-cuff-near-knife");

    // Find-step decoys.
    const guardLoose = box(head, 0.02, 0.16, 0.04, 0.14, 0.24, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, guardLoose, "guard-not-latched");
    const lintPile = group(g, -0.5, 0, 0.4);
    ball(lintPile, 0.06, 0, 0.02, 0, 0xc9c2a8, { rough: 0.95, seg: 10 });
    reg(hits, lintPile, "lint-under-table");

    // -------------------------------------------------------- room dressing
    for (const dz of [1.1, 2.0]) {
      const other = group(g, -1.9, 0.1, -1.0 + dz * -0.6, 0);
      box(other, 1.2, 0.75, 0.5, 0, 0.375, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
      box(other, 0.6, 0.28, 0.22, -0.1, 0.9, 0, 0xdfe4e8, { rough: 0.3, metal: 0.6 });
      cyl(other, 0.07, 0.02, 0.28, 0.24, 1.0, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const cutTable = group(g, 2.0, 0.1, 1.4, 0.2);
    box(cutTable, 1.4, 0.75, 0.8, 0, 0.375, 0, 0x6b5b46, { rough: 0.7 });
    box(cutTable, 1.3, 0.03, 0.7, 0, 0.77, 0, 0xe6ddc6, { rough: 0.6 });
    holoTag(cutTable, "cutting table", 0, 0.95, 0, { css: "#5fb99a", w: 0.28 });
    const press = group(g, -2.3, 0.1, 1.7, 0.3);
    box(press, 0.5, 1.1, 0.5, 0, 0.55, 0, 0x53606b, { rough: 0.6, metal: 0.4 });
    box(press, 0.6, 0.1, 0.6, 0, 1.15, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    holoTag(press, "press", 0, 1.35, 0, { css: "#5fb99a", w: 0.2 });

    const threadRack = rackFrame(g, -0.3, 1.9, { ry: 0, h: 1.1 });
    for (let i = 0; i < 3; i++) rackUnit(threadRack, 0.22 + i * 0.3, ["POLY CORE", "TEX 40", "SERGER SET"][i], { css: "#5fb99a" });

    const bolts = group(g, 1.4, 0.1, 2.2, 0.2);
    for (let i = 0; i < 3; i++) cyl(bolts, 0.15, 0.15, 0.7, i * 0.34, 0.15, 0, [0x4f6f8c, 0x8c5a4f, 0x5a8c6f][i], { rough: 0.7, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(bolts, "cloth bolts", 0.34, 0.4, 0, { css: "#5fb99a", w: 0.24 });

    const bundle = group(g, -1.2, 0.1, 1.9, -0.3);
    box(bundle, 0.4, 0.28, 0.3, 0, 0.14, 0, 0xd8c9a3, { rough: 0.7 });
    box(bundle, 0.42, 0.02, 0.32, 0, 0.29, 0, 0x8b929a, { rough: 0.6, metal: 0.3 });
    holoTag(bundle, "cut bundle", 0, 0.42, 0, { css: "#5fb99a", w: 0.24 });

    toolChest(g, 2.4, -0.2, { ry: -0.4, color: 0x5b6672 });
    const crewOne = standingFigure(g, -2.4, -1.3, { ry: 0.6, cloth: 0x37505f });
    const crewTwo = standingFigure(g, 2.3, 0.6, { ry: -2.0, cloth: 0x506070 });
    void crewOne; void crewTwo;

    let locked = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.7),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "chain-off") { chain.parent.remove(chain); g.add(chain); chain.position.set(0.3, 0.79, 0.4); }
        if (step.id === "lockout-clean") { locked = false; lintPile.visible = false; }
        if (step.id === "reseat-plate") throatPlate.position.y = 0.005;
        if (step.id === "power-restore") locked = false;
        if (step.id === "walk") guardLoose.visible = false;
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "lint-jam") { knifeZone.scale.set(1.4, 1.4, 1.4); }
        if (it.id === "sleeve-lean-in") { cuffProp.position.x = 0.1; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lint-jam") knifeZone.scale.set(1, 1, 1);
        if (it.id === "sleeve-lean-in") cuffProp.position.x = 0.2;
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "diff-feed" && session.turn) diffFeed.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "width-set") {
          repaint(widthDial.userData.screen, signFace(`${(3.0 + gg.t * 4.0).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff4ec", scale: 0.6 }));
        }
        if (!locked && (step?.id === "finish-edge" || step?.id === "test-stitch") && session.holding) {
          looperUpper.position.y = 0.28 + Math.sin(t * 20) * 0.01;
          looperLower.position.y = 0.16 + Math.cos(t * 20) * 0.01;
        }
      },
    };
  },
};
