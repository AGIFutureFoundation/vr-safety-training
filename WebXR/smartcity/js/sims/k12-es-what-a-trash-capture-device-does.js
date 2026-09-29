import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ K-12 — What a Trash Capture Device Does. Upper-primary science at the Islais Creek Pump Station site in San Francisco: how a trash capture device lets storm water through and keeps trash back, tested with a model screen and seen when the crew cleans a real one out, using only what the model and the scene show.
//
// Every person, place and document in this station is invented. No statistic,
// date, figure or quotation is asserted as fact; any number the learner works
// with is one the scene itself shows. Frameworks are named only as frameworks
// the lesson is aligned to, never as bodies that certify it.

export const SIM_K12_ES_WHAT_A_TRASH_CAPTURE_DEVICE_DOES = {
  id: "k12-es-what-a-trash-capture-device-does",
  index: "872",
  domain: "Education",
  trade: "Science visit with the drain cleaning crew at a trash capture device — learner and cleaning crew lead",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "Aligned to UN Sustainable Development Goal 4 (Quality Education) as a framework, to UNESCO education guidance on learning through real contexts, to the INEE Minimum Standards for learning that continues in low-resource and emergency settings, and to the national curriculum framework the school itself follows; AFT and the National Education Association as the teachers' own training bodies. None of these certifies the lesson; the teacher decides what it evidences",
  name: "What a Trash Capture Device Does",
  title: simTitle("What a Trash Capture Device Does"),
  tagline: "A screen in the drain lets water through and keeps trash back — test one, then watch the crew clean it",
  accent: 0x5c9a7a,
  accentCss: "#5c9a7a",
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"screen-keeper","name":"Screen Keeper","note":"Tested a model trash screen, explained why it lets water pass and keeps trash back, and helped sort what the crew cleaned out"},

  supportLine: "your teacher, a school counsellor or a trusted adult at home — if anything in this lesson was hard, talk it through afterwards",

  game: system({
    name: "Screen Board",
    currency: "CATCHES",
    ranks: ["Net","Sieve","Screen","Basket","Trash Keeper"],
    badges: [
      { id: "clean-read", name: "First Look", note: "Everything in the opening scan found first time", test: AWARD.stepClean("find-the-parts-of-the-trash") },
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
    "screen-stops-the-water": "You said the screen stops the water. The holes are big enough for water and small enough to keep trash back. If it stopped the water, the street would flood, so the holes are the whole idea.",
    "reach-into-the-device": "You reached into the device. Trash can hide sharp things, and the space below the street is one only trained crew work in. The crew uses a grabber and gloves, and a truck with a vacuum lifts the rest out.",
    "stand-by-the-open-lid": "You stood right by the open lid. An open drain is a place to trip. The crew puts a barrier around it, and visitors watch from behind the barrier.",
    "sort-with-bare-hands": "You sorted the trash with bare hands. Drain trash can be sharp or dirty. Wear the gloves the crew gives you, and use the tongs for anything that looks sharp."
  },

  lateNotes: {
    "est-pour-log": "The pour record is written once both pours are done — nothing to record yet.",
    "est-checkin": "The check-in comes at the very end of the visit."
  },

  steps: [
    {
      id: "find-the-parts-of-the-trash",
      kind: "find",
      noHint: true,
      targets: [
        "est-inlet",
        "est-screen",
        "est-basket"
      ],
      itemNames: {
        "est-inlet": "the inlet where the water comes in",
        "est-screen": "the screen full of small holes",
        "est-basket": "the basket that holds the trash"
      },
      itemNotes: {
        "est-inlet": "Rain and trash arrive here together.",
        "est-screen": "Water passes and trash stays back.",
        "est-basket": "The crew empties it later."
      },
      decoyNotes: {
        "est-sign": "Useful for finding the drain, but not part of the device."
      },
      title: "Find the parts of the trash capture device",
      cue: "Mark the three parts that let water through and keep trash back.",
      why: "A trash capture device sits inside a storm drain. Water comes in through the inlet, passes through a screen full of holes, and flows on to the pipe. The trash that is too big for the holes stays behind in a basket. Each part has one job, and together they let the water go and keep the trash."
    },
    {
      id: "put-on-gloves-before-you-touch",
      kind: "select",
      target: "est-glove-card",
      title: "Put on gloves before you touch the model",
      cue: "Put on the gloves before you pick up the model trash.",
      why: "The model trash is clean, but the crew never touches drain trash without gloves, so the class practises the same habit. Gloves keep hands safe from sharp edges and dirt. Making it a habit on the easy day means it happens on the real day too. Protective equipment works only when it is worn every single time, including during practice."
    },
    {
      id: "put-the-screen-test-in-order",
      kind: "sequence",
      targets: [
        "est-ord-bare",
        "est-ord-look",
        "est-ord-screen",
        "est-ord-again"
      ],
      itemNames: {
        "est-ord-bare": "1 · pour water and model trash with no screen",
        "est-ord-look": "2 · look at what reached the jar",
        "est-ord-screen": "3 · put the screen in the model drain",
        "est-ord-again": "4 · pour the same water and trash again"
      },
      title: "Put the screen test in order",
      cue: "Pour water with no screen, look at the jar, add the screen, then pour the same again.",
      why: "Pouring first with no screen shows what happens without the device. This is your control. Then you add the screen and pour the same water and trash again. The screen is the only change, so any difference in the jar belongs to the screen. Scientists call this a controlled comparison, because everything except the screen stays identical between the two pours.",
      outOfOrderNote: "Out of order. Pour with no screen first, as your control."
    },
    {
      id: "hold-the-screen-in-the-model",
      kind: "hold",
      target: "est-screen-hold",
      seconds: 6,
      title: "Hold the screen in the model drain",
      cue: "Hold the screen flat in the model drain until its clips click.",
      why: "If the screen tips, trash slips round the edge and the test is spoiled. Holding it flat until the clips click keeps it snug. Real devices are bolted in for the same reason: a gap at the edge lets trash sneak past. Engineers design the fixings carefully because water pressure during heavy rainfall pushes hard against every edge.",
      holdBreakNote: "The screen tipped before the clips clicked. Hold it flat again."
    },
    {
      id: "say-what-the-screen-did",
      kind: "select",
      target: "est-result-card",
      title: "Say what the screen did",
      cue: "Choose the sentence that says what your two pours showed.",
      why: "Both pours used the same water and trash. With the screen, less trash reached the jar, and the water still flowed. A good answer says that the screen kept trash back and let water through, with your jar readings as the proof. Scientists try to make conclusions that match their evidence exactly, without exaggerating what they observed."
    },
    {
      id: "spot-the-crews-cleanout-steps",
      kind: "find",
      noHint: true,
      targets: [
        "est-cones",
        "est-barrier",
        "est-vacuum"
      ],
      itemNames: {
        "est-cones": "cones and a sign in the street",
        "est-barrier": "a barrier round the open lid",
        "est-vacuum": "the vacuum truck's hose"
      },
      itemNotes: {
        "est-cones": "Drivers slow down and go round.",
        "est-barrier": "Nobody can step into the opening.",
        "est-vacuum": "It lifts the trash out from above."
      },
      decoyNotes: {
        "est-radio": "The crew likes music, but it is not a cleanout step."
      },
      title: "Spot the crew's cleanout steps",
      cue: "Watch the crew at the real device and mark each safe step they take.",
      why: "Cleaning out a device is a careful job. The crew sets cones so drivers slow down, puts a barrier round the open lid, and uses a vacuum truck so nobody has to climb in. Seeing each step shows that the cleanout is planned, not rushed."
    },
    {
      id: "set-the-pour-speed-and-leave",
      kind: "turn",
      target: "est-tap-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "FLOW"
      },
      title: "Set the pour speed and leave it",
      cue: "Turn the tap dial to the teacher's setting and do not touch it again.",
      why: "Both pours must be the same, or the test is not fair. If one pour is faster, more trash might get pushed through. Setting the tap once and leaving it keeps the flow the same, so the screen is the only thing that changes. Controlling a variable, meaning keeping it deliberately unchanged, is what makes a comparison trustworthy to other people."
    },
    {
      id: "read-the-trash-left-in-the",
      kind: "gauge",
      target: "est-jar-meter",
      gauge: {
        label: "TRASH",
        speed: 0.6,
        green: [
          0.4,
          0.58
        ],
        missNote: "Not at the top of the pile. Read where the trash stops."
      },
      title: "Read the trash left in the jar",
      cue: "Commit when the marker sits at the top of the trash in the jar.",
      why: "The jar stands for the Bay. Reading how much trash got there shows how well each pour kept trash out. Read the top of the pile at eye level, so your reading matches a classmate's. The smaller the pile, the better the screen worked. Consistent measurement habits let different observers compare their results and agree about what happened."
    },
    {
      id: "set-the-basket-under-the-screen",
      kind: "drag",
      target: "est-basket",
      drag: {
        to: "est-basket-spot",
        radius: 0.45,
        missNote: "Not under the screen yet. Place the basket where the trash falls."
      },
      title: "Set the basket under the screen",
      cue: "Drag the model basket to the spot under the screen.",
      why: "The basket catches the trash the screen stops. If it sits in the wrong place, the trash piles up on the screen and blocks the water. Under the screen, it fills up neatly, so the crew can lift it out in one go. Positioning matters in engineering: the right part in the wrong place does not do its job."
    },
    {
      id: "follow-a-bottle-cap-to-the",
      kind: "track",
      target: "est-cap-track",
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
        label: "FOLLOW"
      },
      title: "Follow a bottle cap to the screen",
      cue: "Keep the marker on the bottle cap as it floats to the screen.",
      why: "Following one piece of trash shows the device at work. The cap floats along with the water until it meets the screen, and there it stops while the water goes on. Watching it happen helps you explain the idea in your own words. Describing a process step by step is an important scientific skill, because it explains how a result happens.",
      holdBreakNote: "The marker lost the cap. Find it again and follow it to the screen."
    },
    {
      id: "record-both-pours-side-by-side",
      kind: "select",
      target: "est-pour-log",
      doneLine: "Both pours recorded",
      title: "Record both pours side by side",
      cue: "Write the jar reading for the pour without the screen and the pour with it.",
      why: "Two columns side by side make the result easy to see and check. Anyone reading your table can see what changed and what stayed the same. The crew keeps a record too, noting how full each basket was, so they know how often to come back. Organised records also help the city decide where additional devices would be most useful."
    },
    {
      id: "sort-the-crews-catch-into-groups",
      kind: "select",
      target: "est-sort-board",
      doneLine: "Catch sorted",
      title: "Sort the crew's catch into groups",
      cue: "With gloves and tongs, help sort the model catch into bottles, bags and leaves.",
      why: "Sorting shows what ends up in drains most. If most of it is wrappers, the fix starts with bins and habits on the street. The crew shares what it finds so the city knows where to put more bins and where to tell people about the drain."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "est-checkin",
      doneLine: "Checked in",
      title: "Check in before the crew closes the lid",
      cue: "What does the screen let through? What does it keep back?",
      why: "The crew checks the device is closed and safe before leaving, and the class checks its ideas the same way. Each learner says what the screen lets through and what it keeps. If anyone thinks the screen stops the water too, the group sorts it out now."
    }
  ],

  interrupts: [
    {
      id: "a-truck-backs-up-to-the-drain",
      kind: "Truck reversing",
      after: "hold-the-screen-in-the-model",
      delay: 3,
      seconds: 12,
      target: "est-stand-clear",
      alert: "The vacuum truck beeps and starts to back up to the drain.",
      cue: "Stand clear behind the barrier and wait for the truck to stop.",
      why: "A reversing truck has places the driver cannot see. Standing clear behind the barrier keeps the class out of those places. The crew uses a spotter to guide the driver, and everyone else waits until the beeping stops.",
      missNote: "The class stayed by the kerb, and the spotter had to stop the truck until everyone moved back.",
      wrongNote: "That leaves you near a reversing truck. Stand clear behind the barrier. Choose the response that deals with it now."
    },
    {
      id: "the-crew-lead-asks-about-the-holes",
      kind: "Crew question",
      after: "follow-a-bottle-cap-to-the",
      delay: 3,
      seconds: 12,
      target: "est-name-holes",
      alert: "The crew lead asks why the screen is full of holes.",
      cue: "Say the holes let the water through so the street does not flood.",
      why: "The holes are the clever part. They are big enough for water and small enough for most trash. Without them the device would block the drain, and the street would flood in the next rain.",
      missNote: "You could not say why the screen has holes, and the crew lead had to explain before the class could go on.",
      wrongNote: "That does not explain the holes. Say what the holes let through. Choose the response that deals with it now."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = 0x5c9a7a;
    const CSS = "#5c9a7a";
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
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5a6260", base2: "#4e5654", seam: "rgba(20,20,20,0.45)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#e0e8e4", base2: "#ccdad4", seam: "rgba(40,40,40,0.3)" }), { repeat: 2, px: 256 });
    const wallMat = texturedMat(wallTex, { rough: 0.7, metal: 0.05 });
    // outdoors: a low wall to sit on, planters, a notice board on posts and two trees
    void wallMat;
    for (const [bx, bz, ry] of [[-2.8, -3.4, 0.5], [2.8, -3.4, -0.5]]) {
      const b = group(g, bx, 0, bz, ry);
      box(b, 2.2, 0.42, 0.5, 0, 0.21, 0, 0x9a948a, { rough: 0.9 });
      box(b, 2.3, 0.06, 0.56, 0, 0.45, 0, 0xb89a6a, { rough: 0.6 });
    }
    for (const px of [-1.4, 1.4]) {
      const pl = group(g, px, 0, -4.5);
      box(pl, 0.9, 0.5, 0.9, 0, 0.25, 0, 0x6b4a2e, { rough: 0.8 });
      for (let i = 0; i < 5; i++) ball(pl, 0.16, -0.25 + (i % 3) * 0.25, 0.62 + (i % 2) * 0.08, -0.2 + Math.floor(i / 3) * 0.35, [0x5ab87a, 0x4a9a5a, 0x7fc464][i % 3], { rough: 0.9, seg: 8 });
    }
    const notice = group(g, 0, 0, -4.7);
    for (const nx of [-0.9, 0.9]) cyl(notice, 0.05, 0.05, 2.2, nx, 1.1, 0, 0x6b4a2e, { rough: 0.8, seg: 8 });
    box(notice, 2.0, 1.1, 0.06, 0, 1.6, 0, 0x2f4a3a, { rough: 0.9 });
    box(notice, 2.1, 0.12, 0.1, 0, 2.2, 0, 0x6b4a2e, { rough: 0.8 });
    for (const [tx, tz] of [[-3.6, -4.6], [3.6, -4.6]]) {
      cyl(g, 0.12, 0.16, 2.4, tx, 1.2, tz, 0x5a4030, { rough: 0.9, seg: 8 });
      ball(g, 1.1, tx, 2.9, tz, 0x4a8a4a, { rough: 0.9, seg: 10 });
      ball(g, 0.8, tx + 0.5, 3.3, tz + 0.3, 0x5a9a52, { rough: 0.9, seg: 10 });
    }

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.9, -0.27, "est-inlet", "the inlet where the water comes in", {});
    bead(-1.42, 1.18, -0.62, "est-screen", "the screen full of small holes", {});
    bead(-1.03, 1.46, -0.71, "est-basket", "the basket that holds the trash", {});
    bead(-1.08, 0.9, -1.11, "est-sign", "the street name sign", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "est-ord-bare", "1 · pour water and model trash with no screen", {});
    bead(-0.58, 1.46, -1.44, "est-ord-look", "2 · look at what reached the jar", {});
    bead(-0.24, 0.9, -1.23, "est-ord-screen", "3 · put the screen in the model drain", {});
    bead(0, 1.18, -1.55, "est-ord-again", "4 · pour the same water and trash again", {});
    bead(0.24, 1.46, -1.23, "est-screen-hold", "Hold the screen", {});
    bead(0.58, 0.9, -1.44, "est-cones", "cones and a sign in the street", {});
    bead(0.68, 1.18, -1.05, "est-barrier", "a barrier round the open lid", {});
    bead(1.08, 1.46, -1.11, "est-vacuum", "the vacuum truck's hose", {});
    bead(1.03, 0.9, -0.71, "est-radio", "the truck's radio", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "est-stand-clear", "Stand clear behind the barrier", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "est-name-holes", "Say why the screen has holes", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "est-glove-card", "Gloves on", "GLOVES\nON", { ry: 1.2 });
    dials["est-tap-dial"] = dial(-1.89, -1.4, 0.93, "est-tap-dial", "Pour speed");
    meters["est-jar-meter"] = meter(-1.45, -1.85, 0.67, "est-jar-meter", "Trash in the jar");
    tokens["est-basket"] = token(-0.92, -2.16, 0.4, "est-basket", "Basket");
    spots["est-basket-spot"] = spot(-0.31, -2.33, 0.13, "est-basket-spot", "Under the screen");
    card(0.31, 1.35, -2.33, "est-result-card", "State the result", "WHAT DID\nIT DO?", { ry: -0.13 });
    meters["est-cap-track"] = meter(0.92, -2.16, -0.4, "est-cap-track", "Cap followed");
    boards["est-pour-log"] = board(1.45, -1.85, -0.67, "est-pour-log", "Pour record");
    boards["est-sort-board"] = board(1.89, -1.4, -0.93, "est-sort-board", "Sort the catch");
    boards["est-checkin"] = board(2.19, -0.85, -1.2, "est-checkin", "End-of-visit check-in");
    hazardCard(-1.53, 0.72, -1.21, "screen-stops-the-water", "Say the screen stops the water too?", "STOPS\nWATER?", 0.9);
    hazardCard(-0.58, 0.72, -1.86, "reach-into-the-device", "Reach into the device to grab the trash?", "REACH\nIN", 0.3);
    hazardCard(0.58, 0.72, -1.86, "stand-by-the-open-lid", "Stand right by the open lid to see better?", "BY THE\nLID", -0.3);
    hazardCard(1.53, 0.72, -1.21, "sort-with-bare-hands", "Sort the cleaned-out trash with bare hands?", "BARE\nHANDS", -0.9);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["No screen first, then the screen."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    holoTag(g, "Science teacher", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["b"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Classmate", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["c"] = standingFigure(g, -3, 1.8, { ry: 2.2, cloth: 0x6a8a4a, trousers: 0x2b2f35 });
    holoTag(g, "Cleaning crew lead", -3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    crew["d"] = standingFigure(g, 3, 1.8, { ry: -2.2, cloth: 0x6a7a4a, trousers: 0x2b2f35 });
    holoTag(g, "Truck spotter", 3, 2.1, 1.8, { css: "#7fc4d8", w: 0.34 });
    // the person each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-truck-backs-up-to-the-drain"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x5a7a3a, atStation: true });
    arrivals["a-truck-backs-up-to-the-drain"].visible = false;
    arrivals["the-crew-lead-asks-about-the-holes"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x2a5a8a, atStation: true });
    arrivals["the-crew-lead-asks-about-the-holes"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0a040); lampLit.emissive = new THREE.Color(0xf0a040); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "set-the-basket-under-the-screen") { const s = spots["est-basket-spot"]; tokens["est-basket"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "record-both-pours-side-by-side") repaint(boards["est-pour-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Both pours recorded"], "#59c97b"));
        if (step.id === "sort-the-crews-catch-into-groups") repaint(boards["est-sort-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Catch sorted"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["est-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Checked in"], "#59c97b"));
        if (step.id === "say-what-the-screen-did") paintGuide("Water through, trash kept back.");
      },

      onHazard() {
        paintGuide("Stop. Gloves on, stay behind the barrier.");
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
        if (it.id === "a-truck-backs-up-to-the-drain") { crew["c"].position.set(-2.2, 0, -2.7); if (who) who.position.set(2.4, 0, -3.8); paintGuide("Class behind the barrier, the truck parked. The lesson carries on."); }
        if (it.id === "the-crew-lead-asks-about-the-holes") { crew["d"].position.set(2.2, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.6); paintGuide("Holes explained. The lesson carries on."); }
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
