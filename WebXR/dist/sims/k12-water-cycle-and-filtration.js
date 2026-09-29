import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — The Water Cycle and Filtration. Upper-primary and lower-secondary science at a treatment plant's visitor bench: where water goes, and how settling and filtering make it clearer — with the plant's own staff deciding what is safe to drink.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_WATER_CYCLE_AND_FILTRATION = {
  id: "k12-water-cycle-and-filtration",
  index: "802",
  domain: "Education",
  trade: "Science class at the treatment plant's visitor bench — learner and plant educator",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "The Water Cycle and Filtration",
  title: simTitle("The Water Cycle and Filtration"),
  tagline: "Follow the water round the cycle, then watch a filter work — and never drink from the bench",
  accent: 0x4fb88a,
  accentCss: "#4fb88a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"full-circle","name":"Full Circle","note":"The water cycle told in order and a filter set up, observed and explained"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Cycle Board",
    currency: "DROPS",
    ranks: ["Observer","Sampler","Tester","Explainer","Scientist"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-water-cycle-in-the") },
      { id: "no-shortcut", name: "No Shortcuts", note: "No misconception or unsafe shortcut anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "taste-the-filtered-water": "You tasted the water that came out of the bench filter. A classroom filter removes what you can see, but germs and dissolved substances pass straight through it; only the plant's full treatment, tested by its own staff, makes water safe to drink. Clear is not the same as clean, and nothing on a science bench is ever tasted.",
    "say-water-disappears": "You said the water in the drying puddle was used up. It was not: it evaporated and became water vapour in the air, which is the first stage of the cycle. Water changes state and moves, but it is not destroyed, and saying it disappears hides the whole idea the lesson is about.",
    "skip-the-control-jar": "You set the unfiltered jar aside. Without a jar of the same muddy water left unfiltered, you cannot say the filter made any difference, because the mud might simply have settled on its own. The comparison jar is what turns a nice-looking result into evidence.",
    "lean-over-the-channel": "You leaned over the rail of the settling channel. Visitors stay behind the rail and on the marked walkway at a treatment plant because the channels are deep and the edges can be wet; the educator brings samples to the bench so nobody needs to lean over anything."
  },

  lateNotes: {
    "kwf-lab-log": "The lab record is written once both jars have been compared — nothing to record yet.",
    "kwf-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-water-cycle-in-the",
      kind: "find",
      noHint: true,
      targets: [
        "kwf-puddle",
        "kwf-cold-pipe",
        "kwf-rain-channel"
      ],
      itemNames: {
        "kwf-puddle": "a puddle drying in the sun",
        "kwf-cold-pipe": "droplets on a cold pipe",
        "kwf-rain-channel": "rain running into the channel"
      },
      itemNotes: {
        "kwf-puddle": "Evaporation: liquid water becoming vapour in warm air.",
        "kwf-cold-pipe": "Condensation: vapour in the air cooling back into liquid on a cold surface.",
        "kwf-rain-channel": "Collection: precipitation gathering into a body of water, ready to go round again."
      },
      decoyNotes: {
        "kwf-painted-sign": "The sign is part of the building, not the cycle. Look for water changing state or moving."
      },
      title: "Find the water cycle in the scene",
      cue: "Mark three places in the scene where water is changing state or moving.",
      why: "The water cycle is not only a diagram: it is happening around the plant right now. A puddle drying in the sun is evaporation, droplets forming on a cold pipe are condensation, and rain gathering into the channel is collection. Finding the stages in a real place is what makes the diagram mean something, and it is how a scientist starts: by looking."
    },
    {
      id: "put-the-cycle-in-order",
      kind: "sequence",
      targets: [
        "kwf-ord-evap",
        "kwf-ord-cond",
        "kwf-ord-precip",
        "kwf-ord-collect"
      ],
      itemNames: {
        "kwf-ord-evap": "1 · evaporation",
        "kwf-ord-cond": "2 · condensation",
        "kwf-ord-precip": "3 · precipitation",
        "kwf-ord-collect": "4 · collection"
      },
      title: "Put the cycle in order",
      cue: "Evaporation, condensation, precipitation, collection.",
      why: "The stages follow from each other: warm water evaporates, the vapour cools and condenses into clouds, the droplets grow heavy and fall as precipitation, and the water collects in seas, lakes and channels until it is warmed again. Putting them in order shows the cause linking each stage to the next, which matters more than remembering the names.",
      outOfOrderNote: "Out of order. Water has to evaporate before it can condense — follow the cause from one stage to the next."
    },
    {
      id: "take-your-place-behind-the-rail",
      kind: "select",
      target: "kwf-behind-rail",
      title: "Take your place behind the rail",
      cue: "Stand on the marked walkway behind the rail before the educator brings the samples.",
      why: "At any working plant the visitors' walkway and rail are the first rule, and the educator brings the water to the bench so that nobody has to go near a channel edge. Starting every visit behind the rail is the same habit a real operator keeps: the site's safety line comes before the curiosity, however interesting the channel is."
    },
    {
      id: "choose-the-next-filter-layer",
      kind: "turn",
      target: "kwf-layer-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SAND"
      },
      title: "Choose the next filter layer",
      cue: "Turn the selector to the finer layer that goes under the gravel: sand.",
      why: "A filter works in layers from coarse to fine: gravel stops the bigger bits and protects the sand below, and the sand traps the finer particles the gravel lets through. Choosing the layers in order is the same reasoning the plant uses in its own filters, where each layer protects the one beneath it from clogging."
    },
    {
      id: "pour-at-a-steady-gentle-rate",
      kind: "gauge",
      target: "kwf-pour-meter",
      gauge: {
        label: "POUR",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too fast and the water digs a channel straight through the sand. Pour gently.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Pour at a steady, gentle rate",
      cue: "Commit when the pour rate is slow enough that the water does not dig into the sand.",
      why: "Pouring too fast stirs up the top layer and pushes mud straight through, so the filter looks like it failed when really the test was spoiled. A slow, even pour lets every layer do its work, and it is why a real filter is fed gently and evenly rather than all at once."
    },
    {
      id: "watch-the-jar-settle-without-shaking",
      kind: "hold",
      target: "kwf-watch-settle",
      seconds: 6,
      title: "Watch the jar settle without shaking it",
      cue: "Keep still and watch the muddy jar as the heavier bits sink.",
      why: "Settling is the first thing a treatment plant does, and it works only if the water is left still: heavy particles sink under their own weight and the water above them clears. Watching without shaking the jar lets you see sedimentation happen, and it shows why the plant's settling channels are long and calm.",
      holdBreakNote: "The jar was shaken and the mud came back up. Keep it still and let the heavy bits sink."
    },
    {
      id: "set-the-filtered-sample-beside-the",
      kind: "drag",
      target: "kwf-sample-token",
      drag: {
        to: "kwf-compare-spot",
        radius: 0.45,
        missNote: "The two jars are not side by side yet. Put them together so the comparison is fair."
      },
      title: "Set the filtered sample beside the control",
      cue: "Drag the filtered sample next to the unfiltered jar so the two can be compared fairly.",
      why: "A result means something only when it is compared with a control. Standing the filtered sample next to a jar of the same muddy water left unfiltered, under the same light, is what lets you say the filter made the difference, rather than time or settling alone."
    },
    {
      id: "spot-the-weak-points-in-a",
      kind: "find",
      noHint: true,
      targets: [
        "kwf-rep-no-control",
        "kwf-rep-safe-claim",
        "kwf-rep-missing-step"
      ],
      itemNames: {
        "kwf-rep-no-control": "a result with no control jar",
        "kwf-rep-safe-claim": "a claim that the water is safe to drink",
        "kwf-rep-missing-step": "a method with the pour rate missing"
      },
      itemNotes: {
        "kwf-rep-no-control": "Without the control, nobody can tell whether the filter or the settling did the work.",
        "kwf-rep-safe-claim": "The bench filter cannot show that. Only the plant's treatment and testing can.",
        "kwf-rep-missing-step": "Someone repeating the test needs every step, including how fast the water was poured."
      },
      decoyNotes: {
        "kwf-rep-labelled": "A labelled diagram helps the reader. Keep it."
      },
      title: "Spot the weak points in a classmate's report",
      cue: "Look at the draft lab report and mark each weakness before it is handed in.",
      why: "A good science report says what was done, what was seen and what it means, and it separates observation from opinion. The usual weak points are a result with no comparison, a claim the evidence cannot support, and a step missing from the method. Finding them in a draft is how scientists review each other's work before anyone relies on it."
    },
    {
      id: "say-why-the-clear-water-is",
      kind: "select",
      target: "kwf-not-safe-card",
      title: "Say why the clear water is still not drinkable",
      cue: "The filtered water looks clear. Say why it is still not safe to drink.",
      why: "A sand filter removes particles you can see, but germs and dissolved substances are far too small for it to catch. That is why a real plant disinfects the water after filtering and its operators test it before it leaves; being able to say why clear water is not yet safe is the most important idea in the lesson."
    },
    {
      id: "keep-your-observation-honest-as-the",
      kind: "track",
      target: "kwf-clarity-meter",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.14,
        label: "CLARITY",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep your observation honest as the sample settles",
      cue: "Hold your recorded observation in band with what the sample actually shows as it sits.",
      why: "Observations drift when we expect a result: it is easy to write clearer than the water really is because you wanted the filter to work. Keeping what you record matched to what you can actually see is the honesty science depends on, and it is the habit that makes a surprising result believable.",
      holdBreakNote: "Your record drifted away from what the jar shows. Look again and write what you see, not what you hoped."
    },
    {
      id: "record-the-method-observations-and-comparison",
      kind: "select",
      target: "kwf-lab-log",
      doneLine: "Observations and comparison recorded",
      title: "Record the method, observations and comparison",
      cue: "Write the layers, the pour, what you saw in both jars and what you can and cannot conclude.",
      why: "A lab record written at the time, with the method, the observations and the limits of the conclusion, lets anyone repeat the test and check your claim. Writing what you cannot conclude, that the water is not shown to be safe, is as important as what you can, and it is exactly what a plant's own records do."
    },
    {
      id: "share-the-result-and-its-limits",
      kind: "select",
      target: "kwf-share-board",
      doneLine: "Results shared",
      title: "Share the result and its limits",
      cue: "Tell the class what the filter did, what the control showed and why the water is still not drinkable.",
      why: "Sharing a result with its limits teaches the whole class the difference between clearer and safe, and it lets others compare their own filters with yours. Scientists share results so they can be checked and repeated; a class that compares filters learns far more than one learner alone."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "kwf-checkin",
      doneLine: "Checked in",
      title: "Check in at the end of the visit",
      cue: "How did the visit go? What surprised you, and what would you test next?",
      why: "Ending with a short check-in lets the teacher and the plant educator hear what made sense and what did not, and it gives each learner a moment to name one thing they would test next. Nobody is marked here, and anyone who found the visit hard can talk to the teacher or a trusted adult afterwards."
    }
  ],

  interrupts: [
    {
      id: "a-classmate-reaches-for-the-rail-gate",
      kind: "Rail gate",
      after: "watch-the-jar-settle-without-shaking",
      delay: 3,
      seconds: 12,
      target: "kwf-call-them-back",
      alert: "A classmate unlatches the rail gate to get closer to the settling channel.",
      cue: "Call them back to the walkway and tell the educator straight away.",
      why: "The rail is the line between the visitors' walkway and a deep channel with wet edges. Calling a classmate back, and telling the educator at once so the gate can be closed, comes before any part of the lesson; the samples are brought to the bench precisely so nobody needs to be past that rail.",
      missNote: "Nobody called them back, and they slipped on the wet edge before the educator saw them.",
      wrongNote: "That does not bring them back. Call them back and tell the educator."
    },
    {
      id: "the-operator-asks-what-you-concluded",
      kind: "Operator question",
      after: "keep-your-observation-honest-as-the",
      delay: 3,
      seconds: 12,
      target: "kwf-state-the-limit",
      alert: "The plant operator asks your group whether your filtered water would be safe to drink.",
      cue: "Say what your test showed and what it cannot show: clearer, but not tested safe.",
      why: "An operator asking whether the water is safe is testing whether you understood the limits of your own experiment. Saying the filter made the water clearer, and that only disinfection and testing could show it is safe, is the scientifically honest answer and the one the plant's own staff give every day.",
      missNote: "Your group said yes, it is safe — a claim your test could never support. Next time, stop the lesson and deal with it first.",
      wrongNote: "That overstates the result. Say what it showed and what it cannot show."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x4fb88a;
    const CSS = "#4fb88a";
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const dd = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, dd, id);
      return dd;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const tk = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, tk, id);
      return tk;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6d7470", base2: "#616864", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#dfe6e2", base2: "#cfd8d4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // a lab bench behind the station, a fume cabinet, a reagent rack and an eyewash post
    const back = group(g, 0, 0, -4.7);
    box(back, 6.4, 2.6, 0.12, 0, 1.3, 0, 0xe0dccf, { rough: 0.7 }).material = wallMat;
    const bench = group(g, 0, 0, -4.1);
    box(bench, 4.6, 0.9, 0.7, 0, 0.45, 0, 0x2b2f35, { rough: 0.6 });
    box(bench, 4.7, 0.05, 0.75, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    box(bench, 0.5, 0.02, 0.4, -1.4, 0.94, 0, 0x8aa0a8, { rough: 0.3, metal: 0.5 });
    cyl(bench, 0.02, 0.02, 0.3, -1.4, 1.1, -0.15, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });
    for (let i = 0; i < 6; i++) cyl(bench, 0.05, 0.05, 0.22 + (i % 3) * 0.06, -0.4 + i * 0.28, 1.06, -0.15, [0x7fc4d8, 0xf2c14b, 0xa0e0a0][i % 3], { rough: 0.2, seg: 10 });
    const hood = group(g, 2.9, 0, -4.2);
    box(hood, 1.2, 0.9, 0.8, 0, 0.45, 0, 0xd8d4cc, { rough: 0.6 });
    box(hood, 1.2, 1.3, 0.8, 0, 1.55, 0, 0xc8d8dc, { rough: 0.2, metal: 0.1 });
    box(hood, 1.1, 0.04, 0.7, 0, 0.92, 0, 0x1a2a30, { rough: 0.3 });
    const rack = group(g, -2.9, 0, -4.3);
    box(rack, 1.0, 1.8, 0.34, 0, 0.9, 0, 0x8a8f96, { rough: 0.5, metal: 0.4 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cyl(rack, 0.06, 0.06, 0.24, -0.33 + c * 0.22, 0.32 + r * 0.55, 0.06, [0xd86a4a, 0x4a8ad8, 0xd8c04a, 0x5ab87a][(r + c) % 4], { rough: 0.3, seg: 10 });
    const wash = group(g, 3.6, 0, -2.8);
    cyl(wash, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 8 });
    box(wash, 0.3, 0.1, 0.3, 0, 1.12, 0, 0x59c97b, { rough: 0.5 });
    for (const bx of [-0.08, 0.08]) cyl(wash, 0.03, 0.03, 0.08, bx, 1.2, 0, 0x8aa0a8, { rough: 0.3, metal: 0.7, seg: 8 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "kwf-puddle", "a puddle drying in the sun", {});
    bead(-1.42, 1.18, -0.62, "kwf-cold-pipe", "droplets on a cold pipe", {});
    bead(-1.03, 1.46, -0.71, "kwf-rain-channel", "rain running into the channel", {});
    bead(-1.08, 0.9, -1.11, "kwf-painted-sign", "the plant's painted sign", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "kwf-ord-evap", "1 · evaporation", {});
    bead(-0.58, 1.46, -1.44, "kwf-ord-cond", "2 · condensation", {});
    bead(-0.24, 0.9, -1.23, "kwf-ord-precip", "3 · precipitation", {});
    bead(0, 1.18, -1.55, "kwf-ord-collect", "4 · collection", {});
    bead(0.24, 1.46, -1.23, "kwf-watch-settle", "Watching the jar settle", {});
    bead(0.58, 0.9, -1.44, "kwf-rep-no-control", "a result with no control jar", {});
    bead(0.68, 1.18, -1.05, "kwf-rep-safe-claim", "a claim that the water is safe to drink", {});
    bead(1.08, 1.46, -1.11, "kwf-rep-missing-step", "a method with the pour rate missing", {});
    bead(1.03, 0.9, -0.71, "kwf-rep-labelled", "a clearly labelled diagram", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "kwf-call-them-back", "Call them back to the walkway", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "kwf-state-the-limit", "State what you can and cannot conclude", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "kwf-behind-rail", "Stay behind the rail", "BEHIND\nTHE RAIL", { ry: 1.2 });
    dials["kwf-layer-dial"] = dial(-1.89, -1.4, 0.93, "kwf-layer-dial", "Filter layer selector");
    meters["kwf-pour-meter"] = meter(-1.45, -1.85, 0.67, "kwf-pour-meter", "Pour rate meter");
    tokens["kwf-sample-token"] = token(-0.92, -2.16, 0.4, "kwf-sample-token", "Filtered sample");
    spots["kwf-compare-spot"] = spot(-0.31, -2.33, 0.13, "kwf-compare-spot", "Beside the unfiltered jar");
    card(0.31, 1.35, -2.33, "kwf-not-safe-card", "Clearer is not the same as safe", "CLEARER ≠\nSAFE", { ry: -0.13 });
    meters["kwf-clarity-meter"] = meter(0.92, -2.16, -0.4, "kwf-clarity-meter", "Observed clarity");
    boards["kwf-lab-log"] = board(1.45, -1.85, -0.67, "kwf-lab-log", "Lab record");
    boards["kwf-share-board"] = board(1.89, -1.4, -0.93, "kwf-share-board", "Share with the class");
    boards["kwf-checkin"] = board(2.19, -0.85, -1.2, "kwf-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "taste-the-filtered-water", "Taste the water that came through the filter?", "LOOKS CLEAN,\nDRINK IT", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "say-water-disappears", "Say the puddle's water was used up?", "THE WATER\nIS GONE", 0.3);
    hazardCard(0.58, 0.72, -1.86, "skip-the-control-jar", "Leave out the unfiltered jar?", "NO NEED\nTO COMPARE", -0.3);
    hazardCard(1.53, 0.72, -1.21, "lean-over-the-channel", "Lean over the channel rail for a better look?", "LEAN OVER\nFOR A LOOK", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Observe. Record. Explain."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const tt = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(tt)?.width ?? tt.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = tt;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the people (clear of every control)
    const crew = {};
    crew["a"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x3a6a4a, trousers: 0x2b2f35 });
    holoTag(g, "Plant educator", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Science teacher", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Plant operator", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-classmate-reaches-for-the-rail-gate"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-classmate-reaches-for-the-rail-gate"].visible = false;
    arrivals["the-operator-asks-what-you-concluded"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-operator-asks-what-you-concluded"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "set-the-filtered-sample-beside-the") { const s = spots["kwf-compare-spot"]; tokens["kwf-sample-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-the-method-observations-and-comparison") repaint(boards["kwf-lab-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Observations and comparison recorded"], "#59c97b"));
        if (step.id === "share-the-result-and-its-limits") repaint(boards["kwf-share-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Results shared"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["kwf-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-why-the-clear-water-is") paintGuide("Evaporation, condensation, precipitation, collection.");
      },

      onHazard() {
        paintGuide("Stop. Clearer is not the same as safe — check the idea again.");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide("That one went unanswered. Next time, stop and deal with it first."); return; }
        if (it.id === "a-classmate-reaches-for-the-rail-gate") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Called back and the gate latched. The educator brings the next sample to the bench."); }
        if (it.id === "the-operator-asks-what-you-concluded") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Honest answer: clearer, not tested safe. That is how the plant's own staff talk about water."); }
      },

      animate(tm, dt, session) {
        void tm; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
