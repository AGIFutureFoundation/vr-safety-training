import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station one: the first fifteen
// minutes of a youth practice, run by the coach before anybody shoots. The
// floor walked for water and loose gear, the emergency plan read before it is
// needed, the health check-in at the door, water staged at the bench, a
// dynamic warm-up built in the right order, shoes and jewellery checked, the
// gym's air moving, a water break called on the clock rather than on
// complaint, and the steps for a player who is overheating said out loud.
//
// Sited generically: an indoor school or recreation-centre gym (the gym-court
// district), an invented team and invented players. The bodies named are
// named for what they publish; no rule number is quoted.

const BBW_ACCENT = 0x4fb3ff;
const BBW_CSS = "#4fb3ff";

export const SIM_BB_WARMUP_INJURY_PREVENTION_AND_HYDRATION = {
  id: "bb-warmup-injury-prevention-and-hydration",
  index: "331",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines for age-appropriate practice length, warm-up and rest; NFHS sports medicine guidance on heat, hydration and a written emergency action plan for school sport; CDC Heads Up for the coach's duty to recognise and remove; the U.S. Center for SafeSport for observable, interruptible practices with two adults present; the American Red Cross first aid course for check, call and care until the athletic trainer or emergency services take over",
  name: "Warm-Up, Injury Prevention and Hydration",
  title: simTitle("Warm-Up, Injury Prevention and Hydration"),
  tagline: "The first fifteen minutes of practice: the floor walked dry and clear, the emergency plan read, a health check-in at the door, water at the bench, a dynamic warm-up in order, shoes and jewellery checked and a water break called by the clock",
  accent: BBW_ACCENT,
  accentCss: BBW_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "ready-to-play", name: "Ready to Play", note: "The floor, the players and the water all ready before the first drill, and nobody pushed past what their body said" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your league's coach coordinator or the athletic trainer you work beside — a player going down at your practice stays with the adult in charge, and talking it through is part of the job",

  game: system({
    name: "Practice Plan",
    currency: "REPS",
    ranks: ["Volunteer Helper", "Assistant Coach", "Head Coach", "Programme Lead", "Coach Educator"],
    badges: [
      { id: "dry-floor", name: "Dry Floor", note: "Every floor hazard found on the first walk", test: AWARD.stepClean("walk-the-floor") },
      { id: "nobody-pushed", name: "Nobody Pushed", note: "No unsafe action anywhere in the warm-up", test: AWARD.safe },
      { id: "right-tempo", name: "Right Tempo", note: "Warm-up intensity and build-up tempo both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-start", name: "Clean Start", note: "No corrections anywhere in the opening block", test: AWARD.clean },
      { id: "steady-build", name: "Steady Build", note: "Held the build-up tempo in band the whole time", test: AWARD.unbroken },
      { id: "on-the-clock", name: "On the Clock", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "start-on-wet-spot": "You started the warm-up with the wet patch by the door still on the floor. A sweat or water film on maple is as slick as ice under a basketball shoe; the first player who plants a foot on it at speed goes down on a hip, a wrist or the back of the head, and a towel would have taken ten seconds.",
    "skip-water-for-time": "You cut the scheduled water break to get more reps in. Young players do not feel thirst early and will not ask to stop in front of teammates, so dehydration builds unseen in a warm gym; by the time a player is dizzy or cramping, the break you saved has become first aid.",
    "punishment-sprints": "You added extra sprints for the players who arrived late. Conditioning used as punishment piles load onto bodies that have not warmed up, teaches that exercise is a penalty, and is exactly the kind of unplanned volume youth guidelines warn turns tired legs into overuse injuries.",
    "skip-shoe-check": "You skipped the shoe and jewellery check to save a minute. An untied lace is how an ankle rolls on the first cut, an earring can tear an ear on a rebound, and a player who forgot the brace their doctor asked for is the one who reinjures the joint in the opening drill.",
  },

  lateNotes: {
    "practice-log-board": "The practice log closes the block once the warm-up has actually been run and the water break called — there is nothing to log yet.",
    "crew-checkin-board": "The staff check-in comes after the log is written, when the opening block is over.",
  },

  steps: [
    {
      id: "walk-the-floor", kind: "find", noHint: true,
      targets: ["walk-wet-patch", "walk-loose-ball", "walk-bag-on-sideline", "walk-bench-too-close"],
      itemNames: {
        "walk-wet-patch": "the wet patch inside the side door",
        "walk-loose-ball": "a loose ball against the bleachers",
        "walk-bag-on-sideline": "a gym bag dropped on the sideline",
        "walk-bench-too-close": "a bench pushed up against the court line",
      },
      itemNotes: {
        "walk-wet-patch": "Rain tracked in through the side door. Towel it dry and put a cone on it until it is gone — the maple will not dry itself before the first sprint.",
        "walk-loose-ball": "A ball rolling back out of the bleachers mid-drill is how an ankle lands on it. Rack it now.",
        "walk-bag-on-sideline": "Bags live under the bleachers, not on the line where a player running a ball down will step on the strap.",
        "walk-bench-too-close": "Benches sit back off the line so a player running out of bounds has room to slow down before anything hard.",
      },
      decoyNotes: {
        "walk-scoreboard-remote": "The scoreboard remote on the table is not a floor hazard — it can stay where it is. Walk the floor for what a running player will actually hit or slip on.",
      },
      title: "Walk the floor before anybody runs on it",
      cue: "Walk the court and the sidelines. Mark everything a running player could slip on, step on or crash into.",
      why: "Most practice injuries in a gym are not caused by basketball; they are caused by the room — a wet film by the door, a ball under a foot, a bag strap, a bench on the line. A coach who walks the floor before the first drill finds all of them while they are still ten-second fixes, instead of finding one of them later by watching a player fall on it.",
    },
    {
      id: "read-the-emergency-plan", kind: "select", target: "eap-board",
      title: "Read the emergency action plan before practice starts",
      cue: "Confirm where the AED is, who calls for help, which door the ambulance comes to and who meets it.",
      why: "An emergency action plan only works if the adults running practice have read it that day: where the AED hangs, who makes the call, which door emergency services use, and who waits there to bring them in. NFHS sports medicine guidance treats a written, rehearsed plan as a basic of school sport because in a real collapse nobody has time to work any of that out.",
    },
    {
      id: "health-check-in", kind: "select", target: "health-signin-sheet",
      title: "Run the health check-in at the door",
      cue: "Ask each player how they feel today and note anyone sick, sore, just back from an injury, or carrying an inhaler.",
      why: "The check-in is where a coach learns that a player was up all night with a fever, rolled an ankle at school, or needs their inhaler within reach. It takes a minute at the door and it changes the whole practice plan: who warms up gently, who sits out contact, and whose medication sits on the bench rather than in a locker across the building.",
    },
    {
      id: "stage-the-water", kind: "drag", target: "water-cooler",
      title: "Wheel the water cooler to the team bench",
      cue: "Move the cooler from the storage cart to the end of the bench before the warm-up begins.",
      drag: { to: "bench-water-socket", radius: 0.5, missNote: "Not at the bench yet. Water that is across the gym is water players skip — wheel it all the way to the end of the bench." },
      why: "A water break only happens on time if the water is already where the players are. A cooler left on a cart by the storage room turns every break into a walk across the gym and a queue at a fountain, so breaks get shortened or skipped; water at the bench means a break costs ninety seconds and nobody has an excuse to miss it.",
    },
    {
      id: "build-the-warm-up", kind: "sequence",
      targets: ["warmup-easy-jog", "warmup-high-knees", "warmup-leg-swings", "warmup-lateral-shuffle", "warmup-build-ups"],
      itemNames: {
        "warmup-easy-jog": "easy jog",
        "warmup-high-knees": "high knees and butt kicks",
        "warmup-leg-swings": "leg swings and walking lunges",
        "warmup-lateral-shuffle": "lateral shuffles",
        "warmup-build-ups": "build-up runs",
      },
      title: "Build the dynamic warm-up in the right order",
      cue: "Easy jog, then high knees, then leg swings and lunges, then lateral shuffles, then build-up runs.",
      why: "A warm-up raises body temperature first and asks for speed last. Starting with an easy jog gets blood into the muscles; the drills that follow take the hips, hamstrings and ankles through the ranges basketball will ask for; build-up runs come at the end because a sprint on cold hamstrings is where pulls happen. Youth development guidance favours this kind of moving warm-up over long static stretching before play.",
      outOfOrderNote: "Out of order. Temperature first, ranges of motion next, speed last — a sprint or a hard cut before the jog and the drills is asking cold muscles for everything at once.",
    },
    {
      id: "easy-jog-lap", kind: "hold", target: "jog-pace-marker", seconds: 7,
      title: "Run the easy jog at a talking pace",
      cue: "Hold the group at a pace where everybody can still talk — watch the whole line, not just the front.",
      why: "The easy jog is the part of practice where a coach sees every player move before anything is asked of them: the one favouring a knee, the one already breathing hard, the one who hangs back. Holding the pace down to a talking speed is what makes the jog a warm-up and a check at the same time, rather than the first conditioning drill of the day.",
      holdBreakNote: "You let the pace run away. A warm-up jog that turns into a race tells you nothing about who is hurting — bring it back to a talking pace.",
    },
    {
      id: "set-the-intensity", kind: "gauge", target: "intensity-meter",
      title: "Set the warm-up intensity for today's group",
      cue: "Commit when the effort reads moderate — warm and breathing, not straining.",
      gauge: {
        label: "EFFORT", speed: 0.65, green: [0.38, 0.58],
        readout: (t) => (t < 0.38 ? "too easy — still cold" : t <= 0.58 ? "moderate — warm" : "too hard — straining"),
        missNote: "Outside the band. Too easy and the muscles are still cold at the first cut; too hard and the warm-up becomes the workout. Find moderate and commit.",
      },
      why: "Warm-up intensity is a judgement a coach makes about the group in front of them, not a number on the practice plan: a gym that is hot, players who just came from another practice, or a group back from a break all change it. Moderate effort — sweating, breathing harder, still able to talk — is warm enough to protect muscles and far enough from the limit to leave something for practice.",
    },
    {
      id: "shoe-and-jewellery-check", kind: "find", noHint: true,
      targets: ["gear-untied-laces", "gear-earring", "gear-missing-brace"],
      itemNames: {
        "gear-untied-laces": "untied, loose laces",
        "gear-earring": "an earring still in",
        "gear-missing-brace": "an ankle brace left in the bag",
      },
      itemNotes: {
        "gear-untied-laces": "Laces tied snug and tucked. A loose shoe lets the foot slide inside it on a cut, which is how a routine change of direction becomes a rolled ankle.",
        "gear-earring": "Jewellery comes out before play — school-sport rules keep it off the court because a hooked earring on a rebound tears skin.",
        "gear-missing-brace": "His doctor asked for the brace after last month's sprain. It goes on before the first drill, not after the first scare.",
      },
      decoyNotes: {
        "gear-new-socks": "New socks are not a problem. Look for what a cut, a rebound or last month's injury will find.",
      },
      title: "Check shoes, jewellery and braces",
      cue: "Look over each player on the mat. Mark every shoe, piece of jewellery or missing support that has to be fixed before drills.",
      why: "The gear check catches the three things that turn ordinary basketball into an injury: a loose shoe on a hard cut, jewellery on a contested rebound, and a player returning from a sprain without the support their clinician asked for. NFHS rules keep jewellery out of play for exactly this reason, and a coach who checks at the mat does not have to stop a drill to fix it later.",
    },
    {
      id: "move-the-air", kind: "turn", target: "fan-dial",
      title: "Turn on the gym's air before the heat builds",
      cue: "Turn the ventilation fans up from off to high.",
      turn: { turns: 0.5, axis: "z", label: "FANS" },
      why: "An indoor gym on a warm afternoon gains heat from every player in it, and still air lets sweat sit on the skin instead of cooling it. Getting the fans or ventilation running before the warm-up — not after players start complaining — keeps the room from becoming the thing that makes a young athlete sick, and it costs nothing but remembering where the switch is.",
    },
    {
      id: "build-up-runs", kind: "track", target: "tempo-meter", seconds: 8,
      title: "Hold the build-up runs at a controlled tempo",
      cue: "Keep the runs building smoothly — faster each length, never a flat-out sprint on the first one.",
      track: {
        start: 0.2, green: [0.38, 0.62], rise: 0.55, fall: 0.44, drift: 0.14, label: "TEMPO",
        readout: (v) => (v < 0.38 ? "too slow — not building" : v > 0.62 ? "flat out — too soon" : "building smoothly"),
      },
      why: "Build-up runs exist to reach speed gradually, so the hamstrings and calves meet sprinting after they are warm rather than before. A coach who lets the first run become a race gets the same pulled muscle the warm-up was meant to prevent; holding the tempo in the building range for every length is what makes the last run safe to run fast.",
      holdBreakNote: "The tempo left the band. Either the runs stopped building or somebody went flat out on the first length — bring it back to a smooth build.",
    },
    {
      id: "call-the-water-break", kind: "select", target: "water-break-whistle",
      title: "Call the water break on the clock",
      cue: "Blow the whistle for the scheduled water break — everybody drinks, whether or not they say they are thirsty.",
      why: "Children and teenagers rarely stop to drink on their own during practice, and thirst arrives after they are already behind on fluid. A break called by the clock rather than by complaint means every player drinks at the same time without having to admit they need it, which is how heat illness is prevented rather than treated.",
    },
    {
      id: "heat-illness-response", kind: "sequence",
      targets: ["heat-stop-activity", "heat-move-to-cool", "heat-cool-body", "heat-call-trainer"],
      itemNames: {
        "heat-stop-activity": "stop the player's activity",
        "heat-move-to-cool": "move them somewhere cool",
        "heat-cool-body": "cool them with water and wet towels",
        "heat-call-trainer": "call the athletic trainer, and emergency services if they are confused",
      },
      title: "Say the steps for a player who is overheating",
      cue: "Stop the activity, move them somewhere cool, cool them with water and wet towels, and call the athletic trainer — emergency services if they are confused.",
      why: "Heat exhaustion can turn into heat stroke, which is a medical emergency, and the first minutes decide how it goes. Stopping the activity and getting the player cool comes before anything else; the athletic trainer is called at once, and confusion, collapse or hot dry skin means emergency services now. Saying the order out loud before practice is the American Red Cross first aid habit of knowing what you will do before you need to.",
      outOfOrderNote: "Out of order. Stop the activity and get them cool first — every minute a hot player keeps working, or waits in the heat for help, is a minute the body keeps heating.",
    },
    {
      id: "log-the-opening-block", kind: "select", target: "practice-log-board",
      title: "Log the opening block",
      cue: "Record the floor walk, who checked in sore or sick, the water break time and anything that changed the plan.",
      why: "The practice log is how the next coach, the athletic trainer or a parent can see what actually happened today: who reported a sore ankle at the door, what was fixed on the floor, when water was taken. If something goes wrong later in the week, a written record made at the time is worth far more than anybody's memory of an ordinary Tuesday.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "Two minutes at the bench: anything you saw in the warm-up, and is everybody on staff good to run the rest of practice?",
      why: "Three adults see three different warm-ups: the head coach watches the drill, the assistant watches the line, the athletic trainer watches bodies. A short check-in after the opening block puts all three pictures together before contact starts, and it keeps two adults present and talking the way SafeSport policy expects, rather than one coach running everything alone.",
    },
  ],

  interrupts: [
    {
      id: "parent-at-the-side-door",
      kind: "Parent at the door",
      after: "easy-jog-lap", delay: 3, seconds: 12,
      alert: "A parent has come in through the side door onto the sideline, calling to their child in the middle of the jog line and waving them over.",
      cue: "Keep the line moving and send the assistant coach to meet the parent at the door.",
      target: "side-door-greeting",
      why: "A parent on the sideline is welcome; a parent pulling a player out of a moving line, or a child leaving the group unseen, is not. Sending the assistant coach to the door keeps the head coach's eyes on the whole group, gives the parent a real answer from a real adult, and keeps every interaction observable, which is the arrangement SafeSport policies are built around.",
      missNote: "The player peeled off the jog line toward the door while nobody was watching, and nobody on staff knows whether they left the building or with whom. A team that cannot account for a child mid-practice has lost the first thing the adults in charge are there to guarantee.",
      wrongNote: "That does not answer the parent. The assistant coach goes to the side door — the head coach stays with the group.",
    },
    {
      id: "player-down-on-the-baseline",
      kind: "Player down",
      after: "build-up-runs", delay: 3, seconds: 12,
      alert: "A player has pulled up at the far baseline on the third build-up run and gone down onto the floor, holding the back of their thigh and white in the face.",
      cue: "Stop the runs and get the athletic trainer to the player now.",
      target: "trainer-radio",
      why: "A player who goes down in a drill needs the person trained to assess them, immediately, and everybody else needs to stop running past. Calling the athletic trainer over the radio gets the right help moving in seconds; the coach stops the drill, keeps the player still and the group back, and follows the check, call, care habit of the American Red Cross first aid course until the trainer takes over.",
      missNote: "The runs went on around the player on the floor, and they tried to stand up and walk it off on their own. A pulled hamstring walked on can become a tear, and a player who looks pale on the floor may be more than a pulled muscle — nobody trained to tell the difference was called.",
      wrongNote: "That is not the call. The athletic trainer's radio gets trained help to the player — stop the drill and use it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBW_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBW_ACCENT, { emissive: o.color ?? BBW_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBW_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1824", accent: o.accent ?? BBW_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBW_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,18,30,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBW_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef6fd";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c8dff2";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBW_ACCENT, { rough: 0.5, emissive: o.accent ?? BBW_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2 + h / 2 - h / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.12, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the warm-up mat
    // Interlocking rubber tiles laid over the maple for the stretching block.
    const matTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#2c3440", base2: "#26303a", seam: "rgba(8,12,18,0.6)",
    }), { repeat: 2, px: 384 });
    const warmMat = box(g, 2.8, 0.02, 1.5, 0, 0.012, -0.6, 0x2c3440, { rough: 0.95, cast: false });
    warmMat.material = texturedMat(matTex, { rough: 0.95, metal: 0.02, color: 0xb8c8d8 });

    // ------------------------------------------------------------ the floor walk
    const puddle = cyl(g, 0.42, 0.42, 0.004, -2.3, 0.004, 0.55, 0x9fd0f0, { rough: 0.05, metal: 0.2, opacity: 0.55, seg: 20, cast: false });
    const wetCone = group(g, -2.0, 0, 0.3);
    cyl(wetCone, 0.02, 0.13, 0.36, 0, 0.18, 0, 0xf2c14b, { rough: 0.6, seg: 12 });
    wetCone.visible = false;
    bead(-2.3, 0.55, 0.55, "walk-wet-patch", "Wet patch by the side door", { w: 0.5 });
    const looseBall = basketball(g, 2.95, 0.12, -2.35);
    bead(2.95, 0.5, -2.35, "walk-loose-ball", "Loose ball by the bleachers", { w: 0.5 });
    const bag = box(g, 0.5, 0.26, 0.28, 2.6, 0.13, 1.35, 0x3a3a52, { rough: 0.8 });
    bead(2.6, 0.55, 1.35, "walk-bag-on-sideline", "Gym bag on the sideline", { w: 0.46 });
    const benchNear = group(g, -2.9, 0, -1.3, Math.PI / 2);
    box(benchNear, 1.6, 0.06, 0.34, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.7, 0.7]) box(benchNear, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    bead(-2.9, 0.75, -1.3, "walk-bench-too-close", "Bench on the court line", { w: 0.46 });
    const scoreTable = group(g, 3.1, 0, -0.9);
    box(scoreTable, 0.7, 0.05, 0.4, 0, 0.74, 0, 0x5a4a36, { rough: 0.7 });
    for (const sx of [-0.3, 0.3]) box(scoreTable, 0.04, 0.72, 0.36, sx, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const remote = box(scoreTable, 0.14, 0.03, 0.08, 0, 0.78, 0, 0x1a1e23, { rough: 0.5 });
    holoTag(scoreTable, "Scoreboard remote", 0, 0.95, 0, { css: "#7fc4d8", w: 0.34 });
    reg(hits, remote, "walk-scoreboard-remote");

    // ------------------------------------------------------------ plan boards
    const eap = board(0.74, 0.46, -1.35, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "EMERGENCY ACTION PLAN", ["AED: lobby wall by the office", "Caller: assistant coach", "Ambulance: north lot doors", "Meet at door: athletic trainer"]));
    reg(hits, eap.userData.face, "eap-board");
    const log = board(0.62, 0.4, 1.35, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Floor walk · check-in", "Water break · changes to plan"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.56, 0.36, 3.0, 1.66, -1.9, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -0.7, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The sign-in table at the door.
    const signTable = group(g, -2.3, 0, -2.2, 0.5);
    box(signTable, 0.8, 0.05, 0.45, 0, 0.74, 0, 0x5a4a36, { rough: 0.7 });
    for (const sx of [-0.35, 0.35]) box(signTable, 0.04, 0.72, 0.4, sx, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const sheet = decal(signTable, 0.3, 0.22, -0.1, 0.772, 0, paperFace("HEALTH CHECK-IN", ["Name  · Feeling today?", "Injury · Illness · Meds"], { bg: "#f2efe0", band: "#2f5f8f" }), { px: 200 });
    sheet.rotation.x = -Math.PI / 2;
    const inhaler = box(signTable, 0.05, 0.08, 0.03, 0.22, 0.8, 0.05, 0x3a8fd0, { rough: 0.5 });
    void inhaler;
    holoTag(signTable, "Health check-in sheet", 0, 1.0, 0, { css: BBW_CSS, w: 0.42 });
    reg(hits, sheet, "health-signin-sheet");

    // ------------------------------------------------------------ water
    const cart = group(g, 2.4, 0, 0.35);
    box(cart, 0.6, 0.04, 0.45, 0, 0.3, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (const [sx, sz] of [[-0.25, -0.18], [0.25, -0.18], [-0.25, 0.18], [0.25, 0.18]]) cyl(cart, 0.04, 0.04, 0.05, sx, 0.03, sz, 0x1a1e23, { rough: 0.9, seg: 8 });
    const cooler = group(cart, 0, 0.32, 0);
    cyl(cooler, 0.16, 0.17, 0.42, 0, 0.21, 0, 0xd8261e, { rough: 0.5, seg: 16 });
    cyl(cooler, 0.17, 0.17, 0.05, 0, 0.44, 0, 0xf2f2f2, { rough: 0.5, seg: 16 });
    box(cooler, 0.05, 0.05, 0.05, 0.17, 0.08, 0, 0xf2f2f2, { rough: 0.5 });
    holoTag(cooler, "Water cooler", 0, 0.62, 0, { css: BBW_CSS, w: 0.3 });
    reg(hits, cooler, "water-cooler");
    const bench = group(g, -1.6, 0, 1.75);
    box(bench, 1.8, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.8, 0.8]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 4; i++) cyl(bench, 0.035, 0.035, 0.2, -0.6 + i * 0.3, 0.57, 0, [0x3a8fd0, 0x59c97b, 0xf2c14b, 0xe0e4e8][i], { rough: 0.5, seg: 10 });
    const socket = box(g, 0.4, 0.01, 0.4, -0.45, 0.008, 1.75, BBW_ACCENT, { emissive: BBW_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Bench end — water here", -0.45, 0.25, 1.75, { css: BBW_CSS, w: 0.44 });
    reg(hits, socket, "bench-water-socket");

    // ------------------------------------------------------------ warm-up ladder
    const ladder = group(g, 2.2, 0, -2.2, -0.4);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["warmup-easy-jog", "Easy jog", 0.6], ["warmup-high-knees", "High knees · butt kicks", 0.87],
      ["warmup-leg-swings", "Leg swings · lunges", 1.14], ["warmup-lateral-shuffle", "Lateral shuffles", 1.41],
      ["warmup-build-ups", "Build-up runs", 1.68],
    ]) {
      const b = ball(ladder, 0.028, 0, y, 0, BBW_ACCENT, { emissive: BBW_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.22, y, 0, { css: BBW_CSS, w: 0.42 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ meters
    stand(0.95, -2.35, 0, 1.15);
    bead(0.95, 1.3, -2.35, "jog-pace-marker", "Jog lap — talking pace", { w: 0.44 });
    const intStand = stand(-0.85, -2.35, 0.2);
    const intensity = instrument(intStand, 0, 1.02, 0, { idle: "EFFORT", color: BBW_ACCENT, w: 0.2, d: 0.26 });
    holoTag(intStand, "Warm-up effort", 0, 1.22, 0, { css: BBW_CSS, w: 0.32 });
    reg(hits, intensity, "intensity-meter");
    const tempoStand = stand(1.55, 0.95, -0.4);
    const tempo = instrument(tempoStand, 0, 1.02, 0, { idle: "TEMPO", color: BBW_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tempoStand, "Build-up tempo", 0, 1.22, 0, { css: BBW_CSS, w: 0.32 });
    reg(hits, tempo, "tempo-meter");

    // Ventilation panel on a post.
    const fanPost = group(g, -3.15, 0, -0.1, Math.PI / 2);
    box(fanPost, 0.08, 1.3, 0.08, 0, 0.65, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    box(fanPost, 0.34, 0.3, 0.06, 0, 1.2, 0.05, 0xdfe4e8, { rough: 0.6 });
    const fanDial = cyl(fanPost, 0.07, 0.07, 0.04, 0, 1.2, 0.1, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 16 });
    fanDial.rotation.x = Math.PI / 2;
    holoTag(fanPost, "Gym fans — off", 0, 1.48, 0.05, { css: BBW_CSS, w: 0.32 });
    reg(hits, fanDial, "fan-dial");
    // A ceiling-fan stand-in by the wall: the blades spin once it is on.
    const fanHead = group(g, -3.4, 2.4, -0.1);
    const blades = group(fanHead, 0, 0, 0);
    for (let i = 0; i < 3; i++) box(blades, 0.5, 0.01, 0.08, Math.cos(i * 2.09) * 0.25, 0, Math.sin(i * 2.09) * 0.25, 0xdfe4e8, { rough: 0.6 }).rotation.y = -i * 2.09;
    cyl(fanHead, 0.06, 0.06, 0.08, 0, 0.03, 0, 0x3a3f46, { rough: 0.5, seg: 10 });

    // Heat-illness response ladder.
    const heat = group(g, -3.0, 0, 1.0, 0.9);
    cyl(heat, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["heat-stop-activity", "1 · Stop the activity", 0.72], ["heat-move-to-cool", "2 · Move somewhere cool", 1.0],
      ["heat-cool-body", "3 · Water, wet towels", 1.28], ["heat-call-trainer", "4 · Call the athletic trainer", 1.56],
    ]) {
      const b = ball(heat, 0.026, 0, y, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, seg: 12 });
      holoTag(heat, label, 0.22, y, 0, { css: "#f2c14b", w: 0.46 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ players on the mat
    const players = [
      standingFigure(g, -0.85, -0.55, { ry: 0.1, cloth: 0x2f5f8f, trousers: 0x1f2a36, atStation: true }),
      standingFigure(g, 0.05, -0.85, { ry: 0, cloth: 0xf2f2f2, trousers: 0x1f2a36, atStation: true }),
      standingFigure(g, 0.95, -0.5, { ry: -0.15, cloth: 0x2f5f8f, trousers: 0x1f2a36, atStation: true }),
    ];
    bead(-0.62, 0.22, -0.32, "gear-untied-laces", "Laces", { w: 0.2, r: 0.025 });
    bead(0.26, 1.58, -0.8, "gear-earring", "Earring", { w: 0.22, r: 0.025 });
    bead(1.18, 0.34, -0.3, "gear-missing-brace", "No brace", { w: 0.24, r: 0.025 });
    bead(-1.1, 0.12, -0.3, "gear-new-socks", "New socks", { w: 0.26, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const lacesTie = box(g, 0.08, 0.02, 0.06, -0.72, 0.05, -0.45, 0xf2f2f2, { rough: 0.7 });
    lacesTie.visible = false;
    const brace = cyl(g, 0.06, 0.06, 0.12, 1.04, 0.12, -0.46, 0x1a1e23, { rough: 0.8, seg: 10 });
    brace.visible = false;

    // ------------------------------------------------------------ side door and the trainer's kit
    const door = group(g, 3.45, 0, 0.2, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(door, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    bead(3.1, 1.25, 0.8, "side-door-greeting", "Meet the parent at the door", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });
    const parent = standingFigure(g, 3.3, 1.0, { ry: -1.6, cloth: 0x6a5a4a, atStation: true });
    parent.visible = false;
    const kit = group(g, 2.6, 0, 2.2);
    box(kit, 0.5, 0.32, 0.32, 0, 0.16, 0, 0xd8261e, { rough: 0.6 });
    box(kit, 0.14, 0.04, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    box(kit, 0.04, 0.14, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    const radio = box(kit, 0.07, 0.16, 0.04, 0.2, 0.42, 0, 0x1a1e23, { rough: 0.5 });
    holoTag(kit, "Athletic trainer's radio", 0.1, 0.66, 0, { css: "#f2c14b", w: 0.44 });
    reg(hits, radio, "trainer-radio");

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.7, 1.25, 0.25, "start-on-wet-spot", "Start now — it will dry?", "START ON\nTHE WET SPOT", 0.4);
    hazardCard(-0.55, 1.25, 1.2, "skip-water-for-time", "Skip water for more reps?", "NO BREAK\nMORE REPS", 0.1);
    hazardCard(0.55, 1.25, 1.2, "punishment-sprints", "Sprints for the late ones?", "LATE = EXTRA\nSPRINTS", -0.1);
    hazardCard(1.8, 1.25, -1.5, "skip-shoe-check", "Skip the shoe check?", "SKIP SHOES\n& JEWELLERY", -0.5);
    card(-1.95, 1.3, -0.6, "water-break-whistle", "Water break — whistle", "WATER\nBREAK", { ry: 0.6, w: 0.42 });

    // ------------------------------------------------------------ crew
    // Sited on spots tools/briefs/clear_spot.mjs reports clear of every control.
    const coach = standingFigure(g, 0.9, 2.3, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.9, 2.1, 2.3, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.5, { ry: 0.7, cloth: 0x2f5f8f, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.5, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.35, 2.6, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.35, 2.1, 2.6, { css: "#f2c14b", w: 0.34 });
    void coach; void looseBall; void bag;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "walk-the-floor") { puddle.visible = false; wetCone.visible = true; looseBall.position.set(3.3, 0.12, -2.9); }
        if (step.id === "stage-the-water") { cooler.parent.remove(cooler); g.add(cooler); cooler.position.set(-0.45, 0, 1.75); }
        if (step.id === "shoe-and-jewellery-check") { lacesTie.visible = true; brace.visible = true; }
        if (step.id === "move-the-air") fanDial.material = mat(0x59c97b, { rough: 0.3, metal: 0.4, emissive: 0x59c97b, ei: 0.6 });
        if (step.id === "log-the-opening-block") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Floor dry · 1 sore ankle noted", "Water break on the clock"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "parent-at-the-side-door") { parent.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35; }
        if (it.id === "player-down-on-the-baseline") {
          const b = players[2].userData.body;
          b.rotation.x = -Math.PI / 2; b.position.y = 0.16;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "parent-at-the-side-door") { assistant.position.set(2.9, 0, 1.3); assistant.rotation.y = -1.2; }
        if (it.id === "player-down-on-the-baseline") {
          trainer.position.set(1.5, 0, 0.1); trainer.rotation.y = -2.6;
          const b = players[2].userData.body;
          b.rotation.x = -1.1; b.position.y = 0.3;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (session?.step && session.index > 8) blades.rotation.y = t * 5;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "set-the-intensity") {
          const ok = gg.t >= 0.38 && gg.t <= 0.58;
          repaint(intensity.userData.screen, signFace(ok ? "MODERATE" : gg.t < 0.38 ? "COLD" : "STRAIN", { bg: "#0c1824", accent: ok ? "#59c97b" : "#f0645b", fg: "#eaf6fb", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "build-up-runs") {
          const ok = tr.v >= 0.38 && tr.v <= 0.62;
          repaint(tempo.userData.screen, signFace(ok ? "BUILDING" : tr.v < 0.38 ? "SLOW" : "FLAT OUT", { bg: "#0c1824", accent: ok ? "#59c97b" : "#f0645b", fg: "#eaf6fb", scale: 0.5 }));
        }
      },
    };
  },
};
