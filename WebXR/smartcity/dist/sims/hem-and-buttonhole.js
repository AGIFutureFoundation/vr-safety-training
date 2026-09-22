import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, rackFrame,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hem & Buttonhole VR — Sewing & Garment Trades, station two.
// Finishing work: a blind hem on the blindstitch machine, a buttonhole cut
// and sewn behind the buttonhole machine's own chisel guard, buttons set to
// spacing, bar tacks struck at the points a garment actually tears first,
// and the piece checked against spec before it leaves the table. Every
// machine here does something a hand could not do as fast or as evenly —
// and every one of them can close on the hand that stops respecting that.

const HB_ACCENT = 0x9a5cc4;

export const SIM_HEM_AND_BUTTONHOLE = {
  id: "hem-and-buttonhole",
  index: "177",
  domain: "Manufacturing",
  trade: "Industrial sewing machine operator — Workers United (SEIU)",
  category: "Sewing & Garment Trades",
  indoor: "shop",
  certification: "Workers United (SEIU) garment and apparel production; the state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the buttonhole cutter and bar tack machine; OSHA 29 CFR 1910.147 lockout before clearing a jam; OSHA 1910.132 PPE; NIOSH ergonomics guidance for the seated, repetitive reach these machines ask for all shift",
  name: "Hem & Buttonhole",
  title: simTitle("Hem & Buttonhole"),
  tagline: "Blind hem, a guarded buttonhole cut and sew, buttons to spacing, bar tacks at the stress points, and a piece checked against spec",
  accent: HB_ACCENT,
  accentCss: "#9a5cc4",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "finish-line", name: "Finish Line", note: "A hem, a buttonhole, buttons and bar tacks all sewn true, guard down every time, and the piece passed against spec" },

  game: system({
    name: "Finishing Standard",
    currency: "STITCH",
    ranks: ["Trimmer", "Finisher", "Lead Finisher", "Bench Lead", "Finishing Standard Certified"],
    badges: [
      { id: "guard-down-first", name: "Guard Down First", note: "Never cycled the buttonhole cutter with the guard up", test: AWARD.stepClean("cutter-guard") },
      { id: "hands-clear-finish", name: "Hands Clear", note: "Never reached toward a running head or a live jam", test: AWARD.safe },
      { id: "on-spec-finish", name: "On Spec", note: "Hem depth held close to the spec's target", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-finish", name: "Clean Finish", note: "No corrections across the whole piece", test: AWARD.clean },
      { id: "steady-feed", name: "Steady Feed", note: "Held the blind hem's feed rate without a break", test: AWARD.unbroken },
      { id: "finish-fast", name: "Finish Fast", note: "Piece finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "seam-ripper-exposed": "That seam ripper is lying open with its point and hook blade both exposed on the table where finished pieces get stacked. A seam ripper is built to slip under one thread at a time; left open on a bench it slips under whatever brushes past it next, point first.",
    "guard-propped": "That spare buttonhole head has its cutter guard propped open with a scrap of fabric wedged under the hinge. A guard held open is a guard that is not there — OSHA 29 CFR 1910.212 exists because a chisel guard gets propped for exactly this reason, to save the half-second it takes to lift on the next piece, and it is the half-second that was protecting a hand.",
    "belt-guard-off": "The bar tack machine's belt guard has been left off, and the drive belt and pulley are spinning exposed at knee height beside the operator's chair. A belt and pulley catch a loose cuff or a hanging thread the same way every time — pulled in, not let go — which is the entire reason 1910.212 requires the guard over a moving belt rather than trusting everyone nearby to stay clear of it.",
    "frayed-cord": "The blindstitch machine's foot pedal cord is frayed down to bare copper a few inches from the plug. A cord that has been rolled under a chair leg all week does not fail cleanly — it fails live, and a foot resting near bare copper on a shop floor is closer to a shock path than anyone treats it as being until it actually happens.",
  },

  lateNotes: {
    "buttonhole-cycle": "Not yet — the cutter guard comes down first, every cycle, no matter how many buttonholes came before this one.",
    "button-top": "Not yet — the buttonhole gets checked against spec before anything is sewn on top of it.",
    "spec-sheet": "The final check against the spec happens once the hem, the buttonhole, the buttons and the bar tacks are all actually sewn — not partway through the piece.",
  },

  steps: [
    {
      id: "spec-sheet", kind: "select", target: "spec-sheet",
      title: "Read the finishing spec",
      cue: "Check the hem depth, the buttonhole count and size, the button spacing and the bar tack points.",
      why: "The spec sheet is the only place this piece's exact numbers live — a hem depth in millimetres, a buttonhole length keyed to the actual button on the ticket, a button spacing measured from the top edge, and the points on the garment that get a bar tack because they take load every time it's worn. A finisher working from what the last style called for is finishing this piece to a spec that isn't this piece's own.",
    },
    {
      id: "blindstitch-guard", kind: "select", target: "blindstitch-guard",
      title: "Check the blindstitch machine's finger guard",
      cue: "Confirm the finger guard is down over the looper before the machine goes on.",
      why: "The blindstitch machine catches a single thread of the hem's fold with a curved needle running close beside a looper that never fully stops moving between stitches, and the finger guard is what keeps a hand feeding the fold from riding in far enough to meet it. It gets checked before power goes on, not assumed to still be where it was left at the end of the last shift.",
    },
    {
      id: "power-on", kind: "turn", target: "blindstitch-power",
      title: "Switch on the blindstitch machine",
      cue: "Turn the power switch on now that the guard is confirmed down.",
      why: "Power goes on after the guard is checked, in that order, every time — a machine already running when a hand goes looking for the guard is a machine that finds out whether the guard was down the hard way. Reversing the two steps turns a checklist item into a gamble on what somebody remembers from the last piece.",
      turn: { turns: 0.6, axis: "y", label: "POWER" },
    },
    {
      id: "blind-hem", kind: "track", target: "hem-fold", seconds: 6,
      title: "Feed the hem fold at a steady rate",
      cue: "Guide the folded hem edge through the machine's folder at an even, unhurried pace.",
      why: "Fed too fast, the folder loses the fold and the blind stitch catches through to the face of the garment where it shows; fed too slow, the fold wanders off the folder's guide and the hem depth drifts wider or narrower than the spec calls for a few inches into the same piece. A steady hand on the fold is what a blind hem is actually named for — the stitch is supposed to be the one thing on this garment nobody sees.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.4, drift: 0.12, label: "FEED RATE",
        readout: (v) => (v < 0.4 ? "too slow — fold wandering" : v > 0.62 ? "too fast — stitch showing through" : "steady"),
      },
      holdBreakNote: "Feed rate broke out of the band. A hem that shows on the face or drifts off depth has to be picked and run again — bring the fold back to a steady pace.",
    },
    {
      id: "hem-depth", kind: "gauge", target: "hem-depth-gauge",
      title: "Measure the finished hem depth",
      cue: "Check the hem depth against the spec and commit once it's inside the target band.",
      why: "The spec's hem depth is not a suggestion — a garment hemmed a few millimetres short or long from the same style's other pieces comes back from quality as a mismatched lot, and the only way to know this particular hem hit the number is to measure it here, on the piece, rather than trust that a steady feed was steady enough.",
      gauge: { label: "HEM DEPTH", speed: 0.7, green: [0.44, 0.6], readout: (t) => `${(18 + t * 14).toFixed(1)} mm`, missNote: "Off the spec's hem depth — pick the stitch and feed it through again, watching the fold against the folder's guide." },
    },
    {
      id: "cutter-guard", kind: "select", target: "cutter-guard",
      title: "Check the buttonhole cutter's guard",
      cue: "Confirm the chisel guard is down over the cutting station before cycling the machine.",
      why: "The buttonhole machine's chisel comes down with enough force to punch through several layers of fabric in one stroke, and the guard is the only thing between that stroke and a hand still holding the placket in position. It gets checked down before every single cycle — not once at the start of the bundle — because the one cycle it's skipped on is indistinguishable from any other until the chisel is already moving.",
    },
    {
      id: "buttonhole-cycle", kind: "hold", target: "buttonhole-cycle", seconds: 4,
      title: "Run the buttonhole cycle",
      cue: "Hold the cycle control through the full stitch-and-cut pass — releasing early stops the chisel mid-stroke.",
      why: "The stitch-and-cut cycle is one continuous pass for a reason: the machine sews the eyelet and bar ends first and only cuts once that reinforcing stitch is actually in place, so a cycle broken off partway can leave a cut slit with no stitching around it to keep it from running. Holding the control through the whole cycle, hands otherwise clear of the clamp, is what a buttonhole machine is built to be run with.",
      holdBreakNote: "Cycle released before it finished. A buttonhole cut without its reinforcing stitch already sewn will fray and run the first time the button pulls against it — the piece needs a new buttonhole, not a patch on this one.",
    },
    {
      id: "buttonhole-check", kind: "select", target: "buttonhole-check",
      title: "Check the buttonhole against spec",
      cue: "Confirm the cut length and placement match the spec sheet's numbers.",
      why: "A buttonhole cut a millimetre short binds the button every time it's fastened; cut long, the button slides and the placket gapes — and a placement off the spec's mark throws off every button spaced from it down the front of the garment. Checking it here, against the actual spec, is the last point where a wrong buttonhole costs one piece instead of a whole bundle sewn from the same bad reference.",
    },
    {
      id: "button-sew", kind: "sequence",
      targets: ["button-top", "button-mid", "button-bottom"],
      itemNames: { "button-top": "top button", "button-mid": "middle button", "button-bottom": "bottom button" },
      title: "Sew the buttons to spacing",
      cue: "Sew the top button, then the middle, then the bottom, each at the spec's marked spacing.",
      why: "The spec's spacing is measured from the top edge down, so sewing top to bottom keeps every button anchored to a mark that hasn't shifted yet under the weight of the placket being handled — sewing out of order means each later button is measured off a piece that has already moved a little from wherever the first stitch pulled it.",
      outOfOrderNote: "Top to bottom — the spacing is measured from the top edge down, and sewing out of that order compounds a small shift into a visibly uneven front.",
    },
    {
      id: "bartack", kind: "hold", target: "bartack-machine", seconds: 5,
      title: "Strike the bar tacks",
      cue: "Hold the pedal through the full back-and-forth cycle at the pocket corner and the fly stress point.",
      why: "A bar tack is a dense zig-zag built to take the load a plain straight stitch would tear out under — the pocket corner and the fly base are exactly where a garment actually fails first, because that's where a hand pulls hardest getting in and out of a pocket. Letting the pedal off partway through leaves a half-built tack that looks reinforced and tears exactly like the plain seam it was supposed to protect.",
      holdBreakNote: "Pedal released mid-cycle. A partial bar tack holds until the first real pull on that pocket, then lets go exactly where it was supposed to be strongest — run the full cycle again.",
    },
    {
      id: "missing-bartack", kind: "find", noHint: true,
      targets: ["bare-corner"],
      itemNames: { "bare-corner": "the pocket corner with no bar tack" },
      itemNotes: { "bare-corner": "This pocket corner has a plain straight stitch and no bar tack over it, while the corner beside it does. It looks finished from a glance — it just isn't reinforced where the spec calls for it to be." },
      title: "Walk the piece before it moves on",
      cue: "One stress point on this piece never got its bar tack. Find it.",
      why: "A missing bar tack does not show up until the garment is worn and that exact corner takes its first real pull, by which point it is a customer return, not a bench correction. Checking every stress point the spec named — not just the ones just worked on — is what catches the one a bundle got shorted on.",
    },
    {
      id: "thread-trim", kind: "select", target: "thread-trim",
      title: "Trim the thread tails",
      cue: "Snip the loose thread chains at the hem, the buttonhole and both bar tacks.",
      why: "A thread tail left long enough catches in the next machine this piece goes through, or in the next garment stacked on top of it, and pulls a stitch it took real time to sew correctly. Trimming every tail on this piece before it leaves the bench is what keeps that damage from happening three stations down the line where nobody can trace it back to here.",
    },
    {
      id: "spec-check", kind: "select", target: "spec-sheet",
      title: "Check the finished piece against spec",
      cue: "Run the hem, the buttonhole, the buttons and the bar tacks back against the spec sheet once more.",
      why: "Every number on this piece came from the same sheet it started with, and the only way to know all four of them actually landed together — not just the last one worked on — is to check the whole piece against it before it leaves this bench for the next operation, where a mistake here reads as somebody else's error.",
    },
  ],

  // Two things that happen with a hand near a running head. See shared/game.js.
  interrupts: [
    {
      id: "cutter-near-miss",
      kind: "Cutter near miss",
      after: "buttonhole-cycle", delay: 3, seconds: 10,
      alert: "A coworker reaches in to straighten the placket edge just as the chisel comes down — their fingertip clears the clamp by millimetres.",
      cue: "Hands are near a clamp that is not done cycling.",
      target: "estop",
      why: "A chisel stroke takes a fraction of a second and gives no warning beyond the machine's own motion, and a reach toward the clamp mid-cycle is answered with the emergency stop, not a shouted warning — a warning arrives after the hand is already there and the stop arrives before the next stroke can. This machine gets stopped cold the instant a hand is where the clamp is, not walked back from carefully.",
      missNote: "The cycle ran on with a hand that close to the clamp. It cleared this time by luck, not by anything the procedure did — the next reach at the same moment does not get to find out it was lucky too, and a buttonhole chisel does not leave a fingertip in a shape a hand recovers from.",
      wrongNote: "It's the emergency stop — a hand is at the clamp mid-cycle. Stop the machine before anything else happens near it.",
    },
    {
      id: "bartack-jam",
      kind: "Machine jam",
      after: "bartack", delay: 3, seconds: 12,
      alert: "The bar tack machine jams mid-cycle, needle down and the presser foot still clamped on the fabric.",
      cue: "That machine is not running, and it is not safe to reach into either.",
      target: "bartack-power",
      why: "A jammed machine still has stored energy in whatever was mid-stroke when it stalled, and reaching into the head to clear fabric while it is only jammed rather than actually off is exactly the moment OSHA's control-of-hazardous-energy rule at 1910.147 is written for. Power goes off at the switch first — the jam gets cleared by hand only once the machine cannot suddenly finish the stroke it stalled on.",
      missNote: "The jam got cleared with the machine still live. It happened to stay stalled through the reach. A machine that jams once can un-jam and complete its stroke on its own the next time somebody's hand is already inside it, which is the entire reason the switch comes first and not the fabric.",
      wrongNote: "It's the power switch — that machine is jammed, not off. Cut power before a hand goes anywhere near the head.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, HB_ACCENT);

    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#c6ccd2", base2: "#b4bcc3", step: 26 }), { repeat: 4, px: 256 });
    const steelMat = () => texturedMat(steelTex, { rough: 0.45, metal: 0.55, color: 0xc6ccd2 });

    // ------------------------------------------------------------ finishing bench
    const bench = group(g, 0, 0, -0.9);
    box(bench, 2.4, 0.86, 0.7, 0, 0.43, 0, CITY.darkSteel, { rough: 0.4, metal: 0.6 });
    const benchTop = slab(bench, 2.44, 0.05, 0.74, 0, 0.885, 0, 0xc6ccd2, { radius: 0.01, rough: 0.4 });
    benchTop.material = steelMat();

    // -------------------------------------------------------- blindstitch machine
    const blind = group(bench, -0.75, 0.91, 0.05);
    box(blind, 0.5, 0.05, 0.35, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    const blindHead = group(blind, -0.1, 0.06, -0.06);
    box(blindHead, 0.28, 0.26, 0.14, 0, 0.13, 0, 0x1c2024, { rough: 0.35, metal: 0.5 });
    box(blindHead, 0.05, 0.18, 0.05, 0, 0.3, 0.02, 0x1c2024, { rough: 0.35, metal: 0.5 });
    const blindGuard = box(blindHead, 0.1, 0.03, 0.08, 0, 0.02, 0.08, 0x8b929a, { rough: 0.4, metal: 0.6 });
    reg(hits, blindGuard, "blindstitch-guard");
    const blindWheel = cyl(blindHead, 0.05, 0.05, 0.02, -0.15, 0.18, 0, 0x2b2f34, { rough: 0.4, metal: 0.6, seg: 16 });
    blindWheel.rotation.x = Math.PI / 2;
    const blindSwitch = group(blind, 0.18, 0.04, -0.14);
    cyl(blindSwitch, 0.02, 0.02, 0.015, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const blindHandle = box(blindSwitch, 0.012, 0.045, 0.012, 0, 0, 0.01, 0xd2312b, { rough: 0.5 });
    reg(hits, blindSwitch, "blindstitch-power");
    holoTag(blind, "Blindstitch machine", 0, 0.4, 0, { css: "#9a5cc4", w: 0.42 });

    // Folded hem fabric fed under the blindstitch guide.
    const hemPiece = group(bench, -0.75, 0.905, 0.22);
    box(hemPiece, 0.55, 0.008, 0.24, 0, 0, 0, 0xdfe4e8, { rough: 0.8 });
    const hemFold = box(hemPiece, 0.55, 0.02, 0.06, 0, 0.01, 0.09, 0xc6ccd2, { rough: 0.75 });
    reg(hits, hemFold, "hem-fold");
    const hemGauge = group(bench, -0.4, 0.98, 0.24);
    box(hemGauge, 0.1, 0.03, 0.16, 0, 0, 0, HB_ACCENT, { rough: 0.5 });
    const hemFace = decal(hemGauge, 0.09, 0.06, 0, 0.018, 0, signFace("-- mm", { bg: "#0d1c24", accent: "#bfeaf7", fg: "#bfeaf7", scale: 0.55 }), { glow: true, ei: 0.7 });
    hemFace.rotation.x = -Math.PI / 2;
    hemGauge.userData.screen = hemFace;
    reg(hits, hemGauge, "hem-depth-gauge");

    // -------------------------------------------------------- buttonhole machine
    const bh = group(bench, 0.25, 0.91, -0.02);
    box(bh, 0.42, 0.05, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    box(bh, 0.1, 0.4, 0.1, -0.1, 0.22, -0.14, 0x1c2024, { rough: 0.35, metal: 0.5 }); // upright arm
    const chiselArm = group(bh, -0.1, 0.42, -0.06);
    box(chiselArm, 0.18, 0.06, 0.06, 0.05, 0, 0, 0x1c2024, { rough: 0.35, metal: 0.5 });
    const chisel = box(chiselArm, 0.014, 0.1, 0.02, 0.14, -0.06, 0, CITY.steel, { rough: 0.2, metal: 0.9 });
    void chisel;
    const clamp = box(bh, 0.14, 0.02, 0.1, 0.08, 0.03, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    const cutterGuard = box(bh, 0.16, 0.14, 0.02, 0.08, 0.12, -0.06, 0x8b929a, { rough: 0.4, metal: 0.6, opacity: 0.65, transparent: true });
    cutterGuard.rotation.x = -1.3;
    reg(hits, cutterGuard, "cutter-guard");
    const cyclePedal = group(bh, 0.25, -0.87, -0.1);
    box(cyclePedal, 0.24, 0.06, 0.18, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    reg(hits, cyclePedal, "buttonhole-cycle");
    const placket = box(bh, 0.3, 0.006, 0.18, 0.08, 0.045, 0, 0xdfe4e8, { rough: 0.75 });
    const buttonholeSlit = box(bh, 0.06, 0.007, 0.012, 0.08, 0.05, 0, 0x1c2024, { rough: 0.6, cast: false });
    void placket;
    reg(hits, buttonholeSlit, "buttonhole-check");
    holoTag(bh, "Buttonhole machine", 0, 0.55, 0, { css: "#9a5cc4", w: 0.42 });

    // Emergency stop post beside the buttonhole machine.
    const estopPost = group(bench, 0.55, 0.91, 0.22);
    cyl(estopPost, 0.02, 0.02, 0.22, 0, 0.11, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 10 });
    const estopCap = ball(estopPost, 0.045, 0, 0.24, 0, 0xd2312b, { rough: 0.4, seg: 16 });
    void estopCap;
    reg(hits, estopPost, "estop");
    holoTag(estopPost, "E-STOP", 0, 0.36, 0, { css: "#d2312b", w: 0.24 });

    // -------------------------------------------------------- spare buttonhole head (hazard)
    const spareBh = group(g, 1.9, 0, -1.3, -0.4);
    box(spareBh, 0.3, 0.7, 0.3, 0, 0.35, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const spareGuard = box(spareBh, 0.14, 0.12, 0.02, 0, 0.66, 0.08, 0x8b929a, { rough: 0.4, metal: 0.6, opacity: 0.6, transparent: true });
    spareGuard.rotation.x = -1.5;
    const wedge = box(spareBh, 0.08, 0.02, 0.05, 0, 0.6, 0.1, 0x9a7448, { rough: 0.8 });
    void wedge;
    holoTag(spareBh, "spare head — guard propped", 0, 0.85, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, spareGuard, "guard-propped");

    // -------------------------------------------------------------- bar tack machine
    const bt = group(g, -1.9, 0, -0.9, 0.4);
    box(bt, 0.5, 0.86, 0.4, 0, 0.43, 0, CITY.darkSteel, { rough: 0.4, metal: 0.5 });
    const btTop = slab(bt, 0.5, 0.04, 0.4, 0, 0.87, 0, 0xc6ccd2, { radius: 0.01, rough: 0.4 });
    btTop.material = steelMat();
    const btHead = group(bt, -0.05, 0.9, 0);
    box(btHead, 0.24, 0.3, 0.16, 0, 0.15, 0, 0x1c2024, { rough: 0.35, metal: 0.5 });
    box(btHead, 0.05, 0.2, 0.05, 0, 0.32, 0.02, 0x1c2024, { rough: 0.35, metal: 0.5 });
    reg(hits, btHead, "bartack-machine");
    // Exposed drive belt and pulley on the side — the guard that's missing.
    const pulleyTop = cyl(bt, 0.06, 0.06, 0.04, 0.2, 0.75, 0, 0x2b2f34, { rough: 0.4, metal: 0.6, seg: 16 });
    pulleyTop.rotation.x = Math.PI / 2;
    const pulleyLow = cyl(bt, 0.09, 0.09, 0.05, 0.2, 0.15, 0, 0x2b2f34, { rough: 0.4, metal: 0.6, seg: 16 });
    pulleyLow.rotation.x = Math.PI / 2;
    const belt = box(bt, 0.03, 0.6, 0.02, 0.2, 0.45, 0, 0x1c1e20, { rough: 0.7 });
    holoTag(bt, "belt guard missing", 0.2, 0.9, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, belt, "belt-guard-off");
    const btSwitch = group(bt, -0.2, 0.87, 0.16);
    cyl(btSwitch, 0.02, 0.02, 0.015, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    box(btSwitch, 0.012, 0.04, 0.012, 0, 0, 0.01, 0xd2312b, { rough: 0.5 });
    reg(hits, btSwitch, "bartack-power");
    holoTag(bt, "Bar tack machine", -0.05, 1.1, 0, { css: "#9a5cc4", w: 0.34 });

    // Pocket-corner mockups under the bar tack machine — one tacked, one bare.
    const cornerTacked = group(bt, -0.05, 0.9, 0.1);
    box(cornerTacked, 0.14, 0.006, 0.12, 0, 0, 0, 0xdfe4e8, { rough: 0.8 });
    for (let i = 0; i < 4; i++) box(cornerTacked, 0.03, 0.008, 0.01, -0.02 + i * 0.014, 0.006, 0, 0x2b2f34, { rough: 0.5, cast: false });
    const cornerBare = group(bt, 0.12, 0.9, 0.13, 0.3);
    box(cornerBare, 0.13, 0.006, 0.11, 0, 0, 0, 0xdfe4e8, { rough: 0.8 });
    box(cornerBare, 0.06, 0.006, 0.008, 0, 0.005, 0, 0x2b2f34, { rough: 0.5, cast: false });
    reg(hits, cornerBare, "bare-corner");

    // -------------------------------------------------------------- spec sheet
    const spec = holoPanel(g, 0.56, 0.42, -2.3, 1.5, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(18,10,26,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9a5cc4"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ece0f4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("FINISHING SPEC — STYLE 4402", w * 0.06, h * 0.13);
      ctx.fillStyle = "#f7f0fb";
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Hem depth: 25mm ± 2mm", "Buttonhole: 22mm, 5 count", "Button spacing: 100mm from top", "Bar tacks: both pocket corners, fly base"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { ry: 0.4, accent: HB_ACCENT });
    reg(hits, spec, "spec-sheet");

    // -------------------------------------------------------------- buttons
    const buttonTray = group(g, 0.9, 0, 1.4, -0.3);
    box(buttonTray, 0.3, 0.03, 0.22, 0, 0.72, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const buttonSpots = [
      { id: "button-top", x: -0.06, z: -0.03 },
      { id: "button-mid", x: 0.01, z: 0.02 },
      { id: "button-bottom", x: 0.08, z: -0.02 },
    ];
    for (const b of buttonSpots) {
      const btn = cyl(buttonTray, 0.018, 0.018, 0.006, b.x, 0.745, b.z, 0xf3ecd8, { rough: 0.5, seg: 16 });
      reg(hits, btn, b.id);
    }
    holoTag(buttonTray, "Buttons", 0, 0.85, 0, { css: "#9a5cc4", w: 0.24 });

    // -------------------------------------------------------------- tools
    const tray = toolChest(g, 2.2, 1.4, { ry: -0.6, color: 0x6a4c85 });
    const ripper = group(tray, 0.05, 0.78, 0.05, 0.4);
    cyl(ripper, 0.012, 0.012, 0.08, 0, 0, 0, 0xd8232a, { rough: 0.6, seg: 10 });
    cyl(ripper, 0.003, 0.001, 0.05, 0.02, 0.06, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 });
    holoTag(ripper, "seam ripper — exposed", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, ripper, "seam-ripper-exposed");

    const snips = group(tray, -0.15, 0.78, 0.02, -0.3);
    box(snips, 0.1, 0.015, 0.02, 0, 0, 0, 0x2b2f34, { rough: 0.5 });
    cyl(snips, 0.006, 0.001, 0.05, 0.07, 0, 0, CITY.steel, { rough: 0.25, metal: 0.85, seg: 8 });
    reg(hits, snips, "thread-trim");
    holoTag(snips, "Thread snips", 0, 0.08, 0, { css: "#9a5cc4", w: 0.24 });

    // Frayed pedal cord on the floor near the blindstitch machine — hazard.
    const cord = group(g, -1.0, 0, 0.3, 0.2);
    cyl(cord, 0.008, 0.008, 0.6, 0, 0.008, 0, 0x1c1e20, { rough: 0.75, seg: 8 }).rotation.z = Math.PI / 2;
    const frayBit = box(cord, 0.03, 0.014, 0.014, 0.15, 0.008, 0, 0xd9a441, { rough: 0.5, cast: false });
    holoTag(cord, "cord frayed to bare wire", 0, 0.1, 0, { css: "#f0645b", w: 0.48 });
    reg(hits, frayBit, "frayed-cord");

    // -------------------------------------------------------------- dressing
    // A second finishing machine in the background, thread rack, hanging
    // finished pieces on a rolling rack, an extinguisher, a safety board —
    // the same sewing room the other two stations stand in.
    const bgHead = group(g, 1.7, 0, -2.6, -0.2);
    for (const [lx, lz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) {
      box(bgHead, 0.05, 0.78, 0.05, lx, 0.39, lz, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    }
    box(bgHead, 0.7, 0.04, 0.5, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    box(bgHead, 0.26, 0.24, 0.12, -0.15, 0.94, -0.04, 0x1c2024, { rough: 0.35, metal: 0.5 });
    cyl(bgHead, 0.08, 0.1, 0.32, -0.28, 0.55, 0.18, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 12 });

    const threadRack = rackFrame(g, -2.5, -2.1, { ry: 0.5, h: 1.2 });
    const threadColours = [0xb8402f, 0x2d6fb5, 0x27904e, 0xe0972e];
    threadColours.forEach((c, i) => cyl(threadRack, 0.045, 0.045, 0.12, -0.15 + (i % 2) * 0.2, 0.5 + Math.floor(i / 2) * 0.3, 0.26, c, { rough: 0.75, seg: 14 }));
    holoTag(threadRack, "Thread rack", 0, 1.0, 0.26, { css: "#9a5cc4", w: 0.28 });

    const rollRack = group(g, 2.4, 0, -0.2, -0.5);
    for (const sx of [-0.5, 0.5]) box(rollRack, 0.04, 1.5, 0.04, sx, 0.75, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    box(rollRack, 1.1, 0.03, 0.03, 0, 1.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const garmentColours = [0xdfe4e8, 0x8fa6c9, 0x9a7448];
    garmentColours.forEach((c, i) => {
      box(rollRack, 0.28, 0.4, 0.05, -0.35 + i * 0.35, 1.15, 0, c, { rough: 0.8 });
    });
    holoTag(rollRack, "Finished pieces", 0, 1.6, 0, { css: "#9a5cc4", w: 0.34 });

    const ext = group(g, -2.6, 0, 1.3, 0.7);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });

    const safetyBoard = group(g, 2.6, 0, 1.9, -0.4);
    box(safetyBoard, 0.5, 0.4, 0.03, 0, 1.1, 0, 0x1b2026, { rough: 0.6 });
    decal(safetyBoard, 0.44, 0.34, 0, 1.1, 0.018,
      signFace("GUARD\nDOWN\nEVERY CYCLE", { bg: "#0d1c24", accent: "#9a5cc4", fg: "#fff3d6", scale: 0.24 }));
    cyl(safetyBoard, 0.02, 0.02, 1.1, 0, 0.55, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    slab(g, 2.2, 0.02, 0.7, 0, 0.01, 0.5, 0x22262b, { radius: 0.04, rough: 0.95, cast: false });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
      box(g, 0.09, 0.006, 0.09, -0.95 + i * 0.32, 0.022, 0.28 + j * 0.44, 0x14171a, { cast: false, receive: false });
    }

    // A second lockstitch head and a marking table visible across the floor,
    // and a stack of cut bundles waiting their turn at this bench — the same
    // room pattern-marking-layout stands in, seen from its other corner.
    const bgLockstitch = group(g, -1.4, 0, -2.5, 0.4);
    for (const [lx, lz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) {
      box(bgLockstitch, 0.05, 0.78, 0.05, lx, 0.39, lz, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    }
    box(bgLockstitch, 0.7, 0.04, 0.5, 0, 0.8, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    box(bgLockstitch, 0.26, 0.24, 0.12, -0.15, 0.94, -0.04, 0x1c2024, { rough: 0.35, metal: 0.5 });
    cyl(bgLockstitch, 0.08, 0.1, 0.32, -0.28, 0.55, 0.18, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 12 });

    const cutBundles = group(g, 0.4, 0, 2.1, 0.2);
    const bundleColours = [0xdfe4e8, 0x8fa6c9, 0x9a7448];
    bundleColours.forEach((c, i) => {
      box(cutBundles, 0.36, 0.24, 0.36, -0.4 + i * 0.4, 0.12, 0, c, { rough: 0.85 });
      cyl(cutBundles, 0.007, 0.007, 0.4, -0.4 + i * 0.4, 0.12, 0, 0xdfe4e8, { rough: 0.6, seg: 8 }).rotation.z = 0.6;
    });
    holoTag(cutBundles, "Cut bundles, staged", 0, 0.34, 0, { css: "#9a5cc4", w: 0.4 });

    const spoolCart = group(g, -0.6, 0, 1.9, -0.3);
    box(spoolCart, 0.4, 0.04, 0.3, 0, 0.5, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(spoolCart, 0.02, 0.02, 0.5, sx * 0.16, 0.25, sz * 0.11, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    const spoolColours = [0xb8402f, 0x27904e, 0xe0972e];
    spoolColours.forEach((c, i) => cyl(spoolCart, 0.035, 0.035, 0.1, -0.1 + i * 0.1, 0.57, 0, c, { rough: 0.7, seg: 12 }));

    const scrapBin = group(g, -2.6, 0, -1.6, 0.3);
    box(scrapBin, 0.5, 0.4, 0.4, 0, 0.2, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(scrapBin, 0.3, 0.02, 0.1, -0.08 + (i % 2) * 0.16, 0.42 + Math.floor(i / 2) * 0.03, (i % 2) * 0.1, 0x9a7448, { rough: 0.6 });
    holoTag(scrapBin, "thread & fabric scraps", 0, 0.58, 0, { css: "#9a5cc4", w: 0.34 });

    // A second finisher at the background machine, clear of every control.
    const crew = standingFigure(g, 1.55, -1.85, { ry: -0.2, cloth: 0xf2f2f2, trousers: 0x2b3138 });
    void crew;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.15, -0.7),

      onStepComplete(step) {
        if (step.id === "blindstitch-guard") { blindGuard.rotation.x = 0.6; }
        if (step.id === "power-on") { blindHandle.rotation.z = Math.PI / 2; }
        if (step.id === "cutter-guard") { cutterGuard.rotation.x = 0; }
        if (step.id === "buttonhole-cycle") { buttonholeSlit.visible = true; }
        if (step.id === "missing-bartack") {
          for (let i = 0; i < 4; i++) box(cornerBare, 0.03, 0.008, 0.01, -0.02 + i * 0.014, 0.007, 0, 0x2b2f34, { rough: 0.5, cast: false });
        }
      },

      onInterrupt(it) {
        if (it.id === "cutter-near-miss") { estopCap.material = mat(0xff8a2a, { emissive: 0xff8a2a, ei: 2.0, rough: 0.4 }); chiselArm.position.y = 0.4; }
        if (it.id === "bartack-jam") { btHead.rotation.z = 0.1; belt.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cutter-near-miss") { estopCap.material = mat(0xd2312b, { rough: 0.4 }); chiselArm.position.y = 0.42; }
        if (it.id === "bartack-jam") { btHead.rotation.z = 0; belt.visible = true; }
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "hem-depth") {
          repaint(hemGauge.userData.screen, signFace(`${(18 + gg.t * 14).toFixed(1)} mm`, {
            bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        const cycling = session?.step?.id === "buttonhole-cycle" && session.holding;
        const nearMiss = session?.activeInterrupt?.id === "cutter-near-miss";
        if (cycling) chiselArm.position.y = 0.42 - Math.abs(Math.sin(t * 10)) * 0.06;
        else if (!nearMiss) chiselArm.position.y = 0.42;
      },
    };
  },
};
