import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine, eiTeamLine, reflectionPrompt } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — transition spacing and roles.
// A rebound becomes a fast break, and the break either fills three lanes
// with every player in a role or becomes one player dribbling into three
// defenders. The lesson is lanes filled, roles held and the extra pass
// over the hero shot — and a finish that never runs into the wall or the
// crowd behind the baseline.
//
// Sited generically in the gym-court district; the team and players are
// invented. No statistic, study or named player is asserted.

const TSR_ACCENT = 0x2fd39a;
const TSR_CSS = "#2fd39a";

export const SIM_BB_TRANSITION_SPACING_AND_ROLES = {
  id: "bb-transition-spacing-and-roles",
  index: "727",
  domain: "Youth Sports",
  trade: "Youth basketball player and coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines for teaching team offence and roles at an age-appropriate stage, with rest built into full-court work; NFHS basketball rules and its sports medicine guidance on hydration and a clear run-off behind the baseline; CDC Heads Up for a collision at the end of a sprint; the Association for Applied Sport Psychology's guidance on shared goals and unselfish decisions in a team; the U.S. Center for SafeSport for coaching that praises the pass as loudly as the basket; the American Red Cross first aid course; AFSCME and SEIU recreation staff who run the public gym",
  name: "Transition Spacing and Roles",
  title: simTitle("Transition Spacing and Roles"),
  tagline: "Lanes filled, roles held, the extra pass over the hero shot — and a finish that never runs into the wall behind the baseline",
  accent: TSR_ACCENT,
  accentCss: TSR_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"extra-pass","name":"The Extra Pass","note":"Three lanes filled, every role held and the better shot found with one more pass"},

  supportLine: "your coach, the assistant who ran the break, or the teammate who filled the lane beside you — a hard fall at the end of a sprint is worth talking through afterwards",

  game: system({
    name: "Break Board",
    currency: "LANES",
    ranks: ["Trailer","Wing Runner","Outlet","Floor General","Team Engine"],
    badges: [
      { id: "clean-read", name: "Saw the Break", note: "Everything in the opening scan found first time", test: AWARD.stepClean("read-the-break") },
      { id: "no-blame", name: "No Blame", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "dribble-into-three-defenders": "You kept the ball and dribbled straight into three retreating defenders instead of passing ahead. A single player driving into a crowd at full speed is how a charge, a pile-up and a head knock all happen at once, and it throws away the lanes your teammates sprinted to fill; the pass ahead is faster than any dribble.",
    "all-run-the-middle-lane": "Everybody sprinted down the middle of the floor after the ball. Three players in one lane means no passing angles and a traffic jam at the rim, and players running shoulder to shoulder at speed is how feet tangle; wide lanes are the spacing and the safety at the same time.",
    "sprint-into-the-baseline-wall": "You finished the layup at full speed with no room to stop and ran toward the wall behind the baseline. NFHS sports medicine guidance and every gym safety walk look for a clear run-off area beyond the baseline, and a finishing drill has to be taught with a controlled stop inside it.",
    "take-the-hero-shot": "You pulled up for a contested long shot with a teammate open under the basket. The hero shot tells the four players who ran the floor that their sprint did not matter, and the Association for Applied Sport Psychology's guidance on team goals is that the shared decision — the better shot for the team — is what builds trust worth running for."
  },

  lateNotes: {
    "tsr-practice-log": "The log closes the break drill once the lanes have held at speed — nothing to record yet.",
    "tsr-crew-checkin": "The check-in comes after the log, at the very end."
  },

  steps: [
    {
      id: "read-the-break",
      kind: "find",
      noHint: true,
      targets: [
        "tsr-rebound-secured",
        "tsr-wing-lane-empty",
        "tsr-defence-retreating"
      ],
      itemNames: {
        "tsr-rebound-secured": "the rebound secured two-handed",
        "tsr-wing-lane-empty": "an empty wing lane",
        "tsr-defence-retreating": "the defence running back"
      },
      itemNotes: {
        "tsr-rebound-secured": "A rebound held two-handed is the start of the break. Until then nobody leaves.",
        "tsr-wing-lane-empty": "An empty wing is a lane somebody has to fill. Wide is where the passes live.",
        "tsr-defence-retreating": "Defenders running back tell you how much time the break has. Count them before you choose."
      },
      decoyNotes: {
        "tsr-crowd-cheering": "The crowd getting loud is not part of the read. Look at the floor."
      },
      title: "Read the break before anyone runs",
      cue: "Look for the three things that start a break: the ball secured, the lanes open and the defence retreating.",
      why: "A fast break is a decision made in the first second after a rebound. Seeing the ball held two-handed, the wings empty and the defence already running back tells the team whether to push or pull the ball out — and a break started before the rebound is secure is the one that ends in a turnover and a sprint the wrong way."
    },
    {
      id: "post-the-roles",
      kind: "select",
      target: "tsr-roles-card",
      title: "Name the roles in the break",
      cue: "Post who does what: outlet, two wings, middle and trailer.",
      why: "A break works because each player knows their job before the ball moves: the outlet catches wide, two wings sprint the sidelines, the middle takes the ball up and the trailer comes last as the safety valve. Naming the roles in practice is what stops five players all doing the same exciting thing at the same time."
    },
    {
      id: "fill-the-lanes-in-order",
      kind: "sequence",
      targets: [
        "tsr-order-outlet",
        "tsr-order-wings",
        "tsr-order-middle",
        "tsr-order-trail"
      ],
      itemNames: {
        "tsr-order-outlet": "1 · outlet pass wide",
        "tsr-order-wings": "2 · wings sprint the sidelines",
        "tsr-order-middle": "3 · middle takes the ball up",
        "tsr-order-trail": "4 · trailer follows"
      },
      title: "Fill the lanes in the order the break needs",
      cue: "Outlet, wings, middle, trailer — each move opens the next.",
      why: "The outlet pass wide gets the ball out of the crowd under the rim; the wings sprinting the sidelines stretch the defence; the middle takes the ball up once there is space to use; the trailer follows as the release when the first look is gone. Out of order, the middle dribbles into a defence that has not been stretched yet.",
      outOfOrderNote: "Out of order. The ball goes wide on the outlet first — the middle cannot push into a defence nobody has stretched."
    },
    {
      id: "wing-holds-the-sideline",
      kind: "hold",
      target: "tsr-wing-sideline",
      seconds: 6,
      title: "As a wing, hold your lane wide",
      cue: "Run your lane on the sideline and hold it — do not drift in toward the ball.",
      why: "A wing who drifts toward the ball closes the passing lane they were running to create. Holding the sideline stretches the defence wide, gives the middle a pass to make, and keeps players moving at speed apart from each other rather than converging on the same patch of floor where feet tangle.",
      holdBreakNote: "You drifted in toward the ball. A wing who leaves the sideline closes their own passing lane — stay wide."
    },
    {
      id: "turn-the-push-or-pull-dial",
      kind: "turn",
      target: "tsr-push-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "PUSH"
      },
      title: "Turn the dial to push the break",
      cue: "The lanes are full and the defence is short: turn the dial from PULL OUT to PUSH.",
      why: "Every break asks one question: is there an advantage worth running at, or should the ball come out and set up? Turning the dial to push only when the lanes are filled and the defence is outnumbered makes that call visible, and it teaches young players that running is a choice made on what they see rather than a reflex."
    },
    {
      id: "time-the-pass-ahead",
      kind: "gauge",
      target: "tsr-pass-timing",
      gauge: {
        label: "PASS",
        speed: 0.64,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too early and the wing has not turned to receive it; too late and the defender has recovered. Pass as the wing looks back.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Time the pass ahead to the wing",
      cue: "Commit when the pass leaves in the window — as the wing looks back, before the defender recovers.",
      why: "The pass ahead is the fastest thing on the floor, but only if it arrives when the receiver is ready. Thrown before the wing turns, it hits them in the back or sails out; thrown late, the defender is back. The window is when the wing looks back over their shoulder — the same moment the team is taught to call a name."
    },
    {
      id: "make-the-extra-pass",
      kind: "drag",
      target: "tsr-ball-token",
      drag: {
        to: "tsr-open-teammate-spot",
        radius: 0.45,
        missNote: "Short of the open teammate. The extra pass goes all the way to the player with the better shot — stopping short keeps the contested one."
      },
      title: "Make the extra pass to the better shot",
      cue: "Drag the ball away from the contested pull-up and to the teammate open at the rim.",
      why: "A good shot and a great shot are often one pass apart. Giving up the contested pull-up for a teammate open at the rim is the moment a player shows the other four that the team's result matters more than their own, and it is the habit that makes teammates keep sprinting the lanes the next time."
    },
    {
      id: "ask-the-extra-pass-question",
      kind: "select",
      target: "tsr-extra-pass-card",
      title: "Ask the extra-pass question out loud",
      cue: "Before the shot, the ball-handler asks: good shot, or great shot?",
      why: "Asking the question out loud makes an unselfish decision a habit rather than a mood. In practice the coach says it; by the end of the season players say it to each other, and a team that asks it together has built the kind of shared goal the Association for Applied Sport Psychology describes as the base of trust."
    },
    {
      id: "spot-the-broken-spacing",
      kind: "find",
      noHint: true,
      targets: [
        "tsr-broken-same-lane",
        "tsr-broken-no-trailer",
        "tsr-broken-no-runoff"
      ],
      itemNames: {
        "tsr-broken-same-lane": "two runners in the same lane",
        "tsr-broken-no-trailer": "no trailer back as the release",
        "tsr-broken-no-runoff": "a bag and chairs in the run-off behind the baseline"
      },
      itemNotes: {
        "tsr-broken-same-lane": "Two runners in one lane means one lane empty and a collision waiting. Spread them.",
        "tsr-broken-no-trailer": "No trailer means no release if the first look is gone. Somebody comes last on purpose.",
        "tsr-broken-no-runoff": "Anything behind the baseline is what a finishing player lands on. Clear it before the next rep."
      },
      decoyNotes: {
        "tsr-good-wide-wing": "A wing on the sideline is spacing done right. Look for what is crowded."
      },
      title: "Find where the break lost its shape",
      cue: "Watch the rep and mark each place the spacing or the run-off broke down.",
      why: "Breaks fall apart in a few ways worth naming: two runners in the same lane, no trailer as the release, and a run-off behind the baseline cluttered with bags and chairs a finishing player will land on. Each one is fixed by a single word or a single minute, and each one left alone becomes a turnover or a fall."
    },
    {
      id: "hold-the-team-pace",
      kind: "track",
      target: "tsr-pace-meter",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.15,
        label: "PACE",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Hold the team's pace through three reps",
      cue: "Keep the pace in band — fast enough to be a break, controlled enough to stop inside the run-off.",
      why: "A break run too slowly lets the defence set; one run flat-out every rep leaves players unable to stop at the baseline and too tired to decide well by the third trip. Holding the pace in band, with water and rest built into full-court work as USA Basketball's guidelines ask, is what keeps the decisions good and the finishes safe.",
      holdBreakNote: "The pace left the band — either walking it up or flat-out with no stop. Bring it back to controlled speed."
    },
    {
      id: "film-the-break",
      kind: "select",
      target: "tsr-film-board",
      doneLine: "Lanes filled, extra pass made",
      title: "Watch the break for the pass before the basket",
      cue: "Open the clip: were the lanes filled, the roles held and the extra pass made?",
      why: "The basket at the end of a break gets the cheer; the pass before it, the wing who ran wide and the trailer who came last get forgotten. Watching the break for those moments gives credit where the stands did not, which is how a team learns that every role in the break is worth running hard."
    },
    {
      id: "log-the-drill",
      kind: "select",
      target: "tsr-practice-log",
      doneLine: "Drill, rest and falls recorded",
      title: "Log the drill, the rest breaks and any fall",
      cue: "Record what was practised, when water and rest were taken, and anything the trainer checked.",
      why: "Full-court work is recorded with its rest breaks because the next coach needs to know how hard the team ran, and any fall at the end of a sprint is recorded even when the player gets up smiling. The log turns one practice into a plan for the next rather than a guess about what the team can handle."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "tsr-crew-checkin",
      doneLine: "Everybody good to carry on",
      title: "Check in with the coach and the runners",
      cue: "At the bench: who ran the lanes, who felt left out, and is everybody good?",
      why: "The players who ran wide lanes and never touched the ball are the ones most likely to stop running them. A short check-in — did you feel part of it, did you get your breath back, are you alright after that fall — keeps every role on the break worth doing and every player willing to do it."
    }
  ],

  interrupts: [
    {
      id: "a-defender-steps-into-the-lane",
      kind: "Defender in the lane",
      after: "wing-holds-the-sideline",
      delay: 3,
      seconds: 12,
      target: "tsr-pull-out-call",
      alert: "A retreating defender steps into the middle lane, setting up to take a charge on the ball-handler.",
      cue: "Call \"pull it out\" from the trailer so the ball-handler stops — the wing keeps the sideline.",
      why: "A defender set in the lane changes the answer from push to stop. The trailer, who sees the whole floor, calls it; the ball-handler pulls up and the wing stays wide, because a collision at the end of a sprint is exactly what the break was designed to avoid.",
      missNote: "Nobody called it, the ball-handler drove straight into the set defender at full speed and both went down in a heap under the basket.",
      wrongNote: "That does not stop the ball-handler. Call \"pull it out\" from the trailer."
    },
    {
      id: "a-bag-slides-onto-the-baseline",
      kind: "Run-off blocked",
      after: "hold-the-team-pace",
      delay: 3,
      seconds: 12,
      target: "tsr-clear-runoff-call",
      alert: "A spectator's bag slides off the bleachers and onto the floor just behind the baseline, right where the finishers land.",
      cue: "Stop the rep and send the assistant to clear the run-off — the pace can wait.",
      why: "A clear run-off is the thing that lets a player finish at speed and stop safely. Something landing in it stops the rep until it is gone, because the next finisher will not be looking at the floor behind the line.",
      missNote: "The next finisher landed on the bag behind the baseline, rolled an ankle and went into the bleachers.",
      wrongNote: "That does not clear the run-off. Stop the rep and send the assistant to move it."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = TSR_ACCENT;
    const CSS = TSR_CSS;
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
      const d = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, d, id);
      return d;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const t = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, t, id);
      return t;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#b9844f", base2: "#a8743f", seam: "rgba(60,36,14,0.35)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    // painted lines, the key and the hoop
    for (const [w, d, x, z] of [[7.2, 0.05, 0, -4.2], [0.05, 7.2, -3.6, -0.6], [0.05, 7.2, 3.6, -0.6], [7.2, 0.05, 0, 1.2]]) box(g, w, 0.006, d, x, 0.016, z, 0xf4f1ea, { rough: 0.7, cast: false });
    const key = box(g, 1.6, 0.006, 1.9, 0, 0.015, -3.2, ACC, { rough: 0.8, opacity: 0.55, cast: false });
    void key;
    torus(g, 0.9, 0.025, 0, 0.018, 1.2, 0xf4f1ea, { rough: 0.7, seg: 6, seg2: 32 }).rotation.x = Math.PI / 2;
    const hoop = group(g, 0, 0, -4.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 }).rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });
    // bleachers along the far side, a ball rack and the scorer's table
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a6a4a", base2: "#7a5a3a", seam: "rgba(30,20,10,0.5)" }), { repeat: 2, px: 256 });
    const woodMat = texturedMat(woodTex, { rough: 0.75, metal: 0.02, color: 0xe8d8c0 });
    for (let tier = 0; tier < 4; tier++) for (let seg = 0; seg < 4; seg++) {
      const plank = box(g, 1.5, 0.06, 0.4, -2.4 + seg * 1.6, 0.3 + tier * 0.34, -5.0 - tier * 0.4, 0x8a6a4a, { rough: 0.7 });
      plank.material = woodMat;
      box(g, 0.05, 0.3 + tier * 0.34, 0.05, -3.1 + seg * 1.6, (0.3 + tier * 0.34) / 2, -5.0 - tier * 0.4, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }
    const rack = group(g, 3.3, 0, -3.3, -0.6);
    box(rack, 0.9, 0.04, 0.35, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (const sx of [-0.4, 0.4]) box(rack, 0.04, 0.5, 0.35, sx, 0.25, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 4; i++) ball(rack, 0.11, -0.3 + i * 0.2, 0.63, 0, 0xd8641e, { rough: 0.75, seg: 16 });
    const table = group(g, -3.3, 0, -3.0, 0.6);
    box(table, 1.4, 0.05, 0.5, 0, 0.74, 0, 0x2b3138, { rough: 0.6 });
    box(table, 1.4, 0.7, 0.03, 0, 0.37, 0.24, ACC, { rough: 0.6, emissive: ACC, ei: 0.15 });
    const clock = decal(table, 0.5, 0.2, 0, 1.0, 0, (cx, w, h) => text(cx, w, h, "HOME 00 · AWAY 00", ["Q2 · 04:12"]), { px: 256, glow: true, ei: 0.9 });
    void clock;
    const benchL = group(g, -1.8, 0, 3.4);
    box(benchL, 2.2, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 }).material = woodMat;
    for (const sx of [-1.0, 1.0]) box(benchL, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) cyl(g, 0.035, 0.035, 0.2, -2.6 + i * 0.3, 0.1, 3.75, i % 2 ? 0x2a7ab8 : 0xe8e8e8, { rough: 0.4, seg: 10 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.90, -0.27, "tsr-rebound-secured", "the rebound secured two-handed", {});
    bead(-1.42, 1.18, -0.62, "tsr-wing-lane-empty", "an empty wing lane", {});
    bead(-1.03, 1.46, -0.71, "tsr-defence-retreating", "the defence running back", {});
    bead(-1.08, 0.90, -1.11, "tsr-crowd-cheering", "Crowd getting loud", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "tsr-order-outlet", "1 · outlet pass wide", {});
    bead(-0.58, 1.46, -1.44, "tsr-order-wings", "2 · wings sprint the sidelines", {});
    bead(-0.24, 0.90, -1.23, "tsr-order-middle", "3 · middle takes the ball up", {});
    bead(0, 1.18, -1.55, "tsr-order-trail", "4 · trailer follows", {});
    bead(0.24, 1.46, -1.23, "tsr-wing-sideline", "Wing, wide and running", {});
    bead(0.58, 0.90, -1.44, "tsr-broken-same-lane", "two runners in the same lane", {});
    bead(0.68, 1.18, -1.05, "tsr-broken-no-trailer", "no trailer back as the release", {});
    bead(1.08, 1.46, -1.11, "tsr-broken-no-runoff", "a bag and chairs in the run-off behind the baseline", {});
    bead(1.03, 0.90, -0.71, "tsr-good-wide-wing", "Wing wide on the sideline", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "tsr-pull-out-call", "Call it, pull it out", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "tsr-clear-runoff-call", "Stop the rep, clear it", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "tsr-roles-card", "Break roles", "OUTLET · WINGS\n· MIDDLE · TRAIL", { ry: 1.20 });
    dials["tsr-push-dial"] = dial(-1.89, -1.4, 0.93, "tsr-push-dial", "Push or pull it out");
    meters["tsr-pass-timing"] = meter(-1.45, -1.85, 0.67, "tsr-pass-timing", "When the pass goes ahead");
    tokens["tsr-ball-token"] = token(-0.92, -2.16, 0.40, "tsr-ball-token", "The ball");
    spots["tsr-open-teammate-spot"] = spot(-0.31, -2.33, 0.13, "tsr-open-teammate-spot", "Teammate open at the rim");
    card(0.31, 1.35, -2.33, "tsr-extra-pass-card", "Good shot or great shot?", "GOOD SHOT OR\nGREAT SHOT?", { ry: -0.13 });
    meters["tsr-pace-meter"] = meter(0.92, -2.16, -0.40, "tsr-pace-meter", "Team pace");
    boards["tsr-film-board"] = board(1.45, -1.85, -0.67, "tsr-film-board", "Clip of the break");
    boards["tsr-practice-log"] = board(1.89, -1.4, -0.93, "tsr-practice-log", "Practice log");
    boards["tsr-crew-checkin"] = board(2.19, -0.85, -1.20, "tsr-crew-checkin", "Coach and runners check-in");
    hazardCard(-1.53, 0.72, -1.21, "dribble-into-three-defenders", "Dribble it all the way yourself?", "I'VE GOT IT.\nALL THE WAY", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "all-run-the-middle-lane", "Everyone down the middle?", "EVERYBODY\nDOWN THE MIDDLE", 0.30);
    hazardCard(0.58, 0.72, -1.86, "sprint-into-the-baseline-wall", "Finish flat-out toward the wall?", "FULL SPEED\nPAST THE LINE", -0.30);
    hazardCard(1.53, 0.72, -1.21, "take-the-hero-shot", "Pull up for the hero shot?", "CONTESTED\nPULL-UP", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Fill the lanes. Make the extra pass."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const t = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(t)?.width ?? t.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = t;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the crew (clear of every control)
    const crew = {};
    crew["coach"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["assistant"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["trainer"] = standingFigure(g, -2.9, -2.3, { ry: 0.9, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", -2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    crew["trailer"] = standingFigure(g, 2.9, -2.3, { ry: -0.9, cloth: 0xf2f2f2, trousers: 0x2b2f35, atStation: true });
    holoTag(g, "Trailer", 2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-defender-steps-into-the-lane"] = standingFigure(g, 1.5, -3, { ry: 3, cloth: 0x7a3a1a, atStation: true });
    arrivals["a-defender-steps-into-the-lane"].visible = false;
    arrivals["a-bag-slides-onto-the-baseline"] = standingFigure(g, -1.5, -3, { ry: 0.3, cloth: 0x4a5a6a, atStation: true });
    arrivals["a-bag-slides-onto-the-baseline"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "make-the-extra-pass") { const s = spots["tsr-open-teammate-spot"]; tokens["tsr-ball-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "film-the-break") repaint(boards["tsr-film-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Lanes filled, extra pass made"], "#59c97b"));
        if (step.id === "log-the-drill") repaint(boards["tsr-practice-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Drill, rest and falls recorded"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["tsr-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Everybody good to carry on"], "#59c97b"));
        if (step.id === "make-the-extra-pass") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 1 }) : "Say the next job, not the last mistake.");
        if (step.id === "spot-the-broken-spacing") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("teammate-mistake", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "crew-check-in") paintGuide(typeof reflectionPrompt === "function" ? reflectionPrompt({ team: true }) : "What did you say out loud that helped?");
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function" ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 }) : "Stop there. Take a breath and go again.");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide(typeof eiLine === "function" ? eiLine("missed", { kind: it.kind, seed: 0 }) : "That one went unanswered. Next time it wins."); return; }
        if (it.id === "a-defender-steps-into-the-lane") { crew["trailer"].position.set(2.2, 0, -2.7); if (who) who.position.set(1.9, 0, -3.4); paintGuide("Called from behind — the ball stopped short of the set defender and nobody went down."); }
        if (it.id === "a-bag-slides-onto-the-baseline") { crew["assistant"].position.set(-1.9, 0, -2.7); if (who) who.position.set(-1.2, 0, -3.5); paintGuide("Rep stopped, run-off cleared — the next finisher has somewhere safe to land."); }
      },

      animate(t, dt, session) {
        void t; void dt;
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
