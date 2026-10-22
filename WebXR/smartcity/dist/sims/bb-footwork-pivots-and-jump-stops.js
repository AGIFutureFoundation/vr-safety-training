import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station three: footwork. The
// floor felt for sticky and slick patches before anybody lands on it, the
// pivot-foot rule explained, a jump stop built in order, landings held soft
// and balanced with the knees tracking over the toes, a half-turn pivot on
// the ball of the foot, an agility ladder at a steady cadence, a cap on how
// many jumps a young body takes in a session, and the care for a rolled
// ankle said before one happens.
//
// Sited generically in the gym-court district; the team, the players and the
// parent are invented. No rule number is quoted.

const BBF_ACCENT = 0x9b7bff;
const BBF_CSS = "#9b7bff";

export const SIM_BB_FOOTWORK_PIVOTS_AND_JUMP_STOPS = {
  id: "bb-footwork-pivots-and-jump-stops",
  index: "333",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on landing mechanics, jump volume and rest for growing players; NFHS basketball rules on the pivot foot and travelling; CDC Heads Up for the head knocks a fall on a landing can bring; the U.S. Center for SafeSport for verified pick-up and two adults present; the American Red Cross first aid course for rest, ice, support and elevation of a sprained ankle",
  name: "Footwork: Pivots and Jump Stops",
  title: simTitle("Footwork: Pivots and Jump Stops"),
  tagline: "The floor felt for sticky and slick patches, the pivot-foot rule explained, a jump stop landed soft and balanced, a half-turn pivot on the ball of the foot, a steady agility ladder, a jump count kept, and a rolled ankle cared for properly",
  accent: BBF_ACCENT,
  accentCss: BBF_CSS,
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "soft-landings", name: "Soft Landings", note: "Every landing balanced and every knee over its toes, with the jump count kept and nobody walking off a sore ankle" },

  supportLine: "your league's coach coordinator, or the athletic trainer who took the ankle from you — an injury at your practice is worth a conversation afterwards, not only a line in the log",

  game: system({
    name: "Footwork Ladder",
    currency: "STEPS",
    ranks: ["Floor Helper", "Footwork Coach", "Assistant Coach", "Head Coach", "Movement Mentor"],
    badges: [
      { id: "true-floor", name: "True Floor", note: "Every sticky or slick patch found on the first pass", test: AWARD.stepClean("feel-the-floor") },
      { id: "no-bad-landings", name: "No Bad Landings", note: "No unsafe action in the whole footwork block", test: AWARD.safe },
      { id: "soft-knees", name: "Soft Knees", note: "Landing bend and ladder cadence both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-feet", name: "Clean Feet", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "steady-feet", name: "Steady Feet", note: "Held the ladder cadence in band the whole time", test: AWARD.unbroken },
      { id: "brisk-block", name: "Brisk Block", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "jump-stop-by-ball-bag": "You set the jump-stop spot right beside the open ball bag. A landing is the moment a player's whole weight comes down on one foot at a time; a ball that has rolled out of the bag and under that foot turns a teaching rep into an inverted ankle sprain.",
    "land-on-sticky-patch": "You ran the landing line straight across the sticky patch. A shoe that grips too well on a spilled sports drink stops dead while the knee keeps turning — a twisting load on the knee and ankle that no amount of good technique protects against.",
    "jumps-until-legs-go": "You kept the jump stops going until the legs gave out. Landing mechanics fall apart first when players are tired — knees cave in, heels slam — and repeated landings past fatigue are exactly the unplanned volume youth guidelines warn builds knee and heel pain in growing bodies.",
    "stations-too-close": "You put the pivot station right up against the ladder. A player spinning through a reverse pivot swings elbows and a ball through a half-circle; a teammate coming off the end of the ladder at speed is in that circle, heads first.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the block once the footwork has been run and the ankle care said — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, when the block is finished.",
  },

  steps: [
    {
      id: "feel-the-floor", kind: "find", noHint: true,
      targets: ["floor-sticky-drink", "floor-dust-film", "floor-lifted-tape"],
      itemNames: {
        "floor-sticky-drink": "a sticky patch of spilled sports drink",
        "floor-dust-film": "a dust film by the door",
        "floor-lifted-tape": "an old tape mark lifting at the edge",
      },
      itemNotes: {
        "floor-sticky-drink": "Sticky is as dangerous as slick: the shoe stops and the knee keeps going. Damp-mop it and dry it before the landing line crosses it.",
        "floor-dust-film": "Dust tracked in from outside turns the maple slick. Dust-mop the strip where the jump stops land.",
        "floor-lifted-tape": "A lifted tape edge catches a toe on a pivot. Pull it up; mark the spot with a cone if the new tape is not ready.",
      },
      decoyNotes: {
        "floor-court-line": "The painted court line is sealed under the finish and grips like the rest of the floor. Look for what has been added to the floor since it was cleaned.",
      },
      title: "Feel the floor where the landings will be",
      cue: "Slide a shoe across the landing strip and the pivot area. Mark every patch that is sticky, slick or catching.",
      why: "Footwork is where the floor matters most, because every jump stop and pivot puts a player's full weight through a shoe on one small patch of maple. Sticky spots stop the shoe while the knee keeps turning, dust films let it slide, and a lifted tape edge catches a toe mid-spin — a coach who checks the actual strip the drill will use finds all three before a landing does.",
    },
    {
      id: "explain-the-pivot-rule", kind: "select", target: "pivot-rule-card",
      title: "Explain the pivot-foot rule before the drill",
      cue: "Once a player stops with the ball, one foot is the pivot: it can turn on the spot, but it cannot lift and come back down before the ball is gone.",
      why: "Young players travel because nobody ever showed them which foot is allowed to move. Explaining the pivot-foot idea the way NFHS basketball rules frame it — one foot anchored, the other free to step — before the drill starts turns footwork from a list of whistles into a skill they can feel, and it saves the correction for technique instead of the rule itself.",
    },
    {
      id: "build-the-jump-stop", kind: "sequence",
      targets: ["jump-last-dribble", "jump-low-hop", "jump-two-feet", "jump-knees-bent", "jump-chin-ball"],
      itemNames: {
        "jump-last-dribble": "last dribble picked up",
        "jump-low-hop": "a low hop forward",
        "jump-two-feet": "land on both feet at once",
        "jump-knees-bent": "knees bent, hips back, balanced",
        "jump-chin-ball": "chin the ball, elbows out",
      },
      title: "Build the jump stop in order",
      cue: "Pick up the last dribble, a low hop, land on both feet at once, sit into the landing, chin the ball.",
      why: "A jump stop lets a player stop on balance and keep either foot as the pivot, and it is built as a sequence because each piece sets up the next. A low hop keeps the landing small; both feet together splits the load; bending knees and hips absorbs it; chinning the ball protects it. Taught out of order, players land stiff-legged on one foot with the ball swinging.",
      outOfOrderNote: "Out of order. Hop low, land both feet together, sit into it — then protect the ball. Chin the ball before landing and the landing turns stiff.",
    },
    {
      id: "balanced-landing", kind: "hold", target: "landing-hold-marker", seconds: 7,
      title: "Hold the landing balanced and still",
      cue: "Stick the landing and hold it — knees over the toes, weight even, no wobble — while you watch the whole line.",
      why: "Holding a landing still for a count shows whether a player actually absorbed it or just survived it: a wobble, a knee drifting inward or weight on the heels all appear in the first seconds of a hold. Sticking landings in practice is how the body learns to put knees over toes automatically, which is the single habit most linked with fewer knee injuries on a court.",
      holdBreakNote: "The landing wobbled out. Reset, land soft again and hold it still before the next rep.",
    },
    {
      id: "read-the-knee-bend", kind: "gauge", target: "landing-meter",
      title: "Read the knee bend on landing",
      cue: "Commit when the landing reads soft — bent enough to absorb, not collapsing.",
      gauge: {
        label: "KNEE BEND", speed: 0.62, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "stiff — jarring" : t <= 0.6 ? "soft — absorbing" : "collapsing — too deep"),
        missNote: "Out of the band. A stiff landing jars the knees and heels; a collapsing one lets the knee cave. Find soft and commit.",
      },
      why: "A good landing bends enough at the knees and hips to soak up the force over time instead of all at once, but not so deep that the player folds and the knee drops inward. Reading that band on real landings — rather than shouting 'bend your knees' — tells a coach which players need strength work and which just need the cue.",
    },
    {
      id: "front-pivot", kind: "turn", target: "pivot-disc",
      title: "Teach the front pivot on the ball of the foot",
      cue: "Turn half a circle on the ball of the pivot foot — heel light, pivot foot never leaving the floor.",
      turn: { turns: 0.5, axis: "y", label: "PIVOT" },
      why: "A pivot turns on the ball of the foot, not the heel, so the ankle and knee rotate together instead of twisting against a planted shoe. Walking players through a half-turn slowly, with the heel just off the floor, builds the feel for a pivot that is both legal and kind to the joints before speed is ever added.",
    },
    {
      id: "lay-the-ladder", kind: "drag", target: "agility-ladder",
      title: "Lay the agility ladder on its own clear strip",
      cue: "Carry the rolled ladder to its taped strip, well away from the pivot circle.",
      drag: { to: "ladder-socket", radius: 0.5, missNote: "Not on its strip. A ladder half on the pivot circle puts two drills in one space — carry it all the way to the tape." },
      why: "An agility ladder sends players off its far end at speed with their eyes on their feet. Laying it on its own strip, with clear floor past the end and nothing beside it, means the only thing a player coming off the last rung meets is empty maple — not a teammate spinning through a pivot with the ball.",
    },
    {
      id: "watch-the-knees", kind: "find", noHint: true,
      targets: ["fault-knee-caving", "fault-heel-landing", "fault-pivot-lifts"],
      itemNames: {
        "fault-knee-caving": "a knee caving inward on the landing",
        "fault-heel-landing": "a player slamming down on the heels",
        "fault-pivot-lifts": "a pivot foot lifting and landing again",
      },
      itemNotes: {
        "fault-knee-caving": "Knee drifting in over the big toe on landing is the pattern to fix first. Cue 'knees over toes' and slow the rep down.",
        "fault-heel-landing": "Heel-first landings jar straight up the leg. Cue 'land quiet' — the quieter the landing, the softer it was.",
        "fault-pivot-lifts": "The pivot foot came up and down: a travel, and a sign the turn is on the heel. Back to a slow half-turn on the ball of the foot.",
      },
      decoyNotes: {
        "fault-arms-out": "Arms out for balance on a landing is fine at this stage. Look for what the knees, heels and pivot foot are doing.",
      },
      title: "Watch the knees and feet, not the ball",
      cue: "Watch the landing line. Mark every player whose knees, heels or pivot foot need a correction.",
      why: "Footwork coaching means watching the lower body while everybody else watches the ball. The three faults that matter — knees caving in, heel-slam landings, a pivot foot that lifts — each carry an injury or a whistle with them, and catching them early in a slow drill is far easier than unteaching them once they are fast.",
    },
    {
      id: "ladder-cadence", kind: "track", target: "cadence-meter", seconds: 8,
      title: "Keep the ladder cadence quick and clean",
      cue: "Hold the group's cadence in band — quick feet, every rung hit, no stumbling to go faster.",
      track: {
        start: 0.22, green: [0.4, 0.62], rise: 0.54, fall: 0.44, drift: 0.14, label: "CADENCE",
        readout: (v) => (v < 0.4 ? "plodding — heavy feet" : v > 0.62 ? "rushing — missing rungs" : "quick and clean"),
      },
      why: "The ladder trains quick, light feet, and it only does that while every rung is hit cleanly. Push the cadence past control and players clip the rungs, catch a toe and stumble forward; let it drop and it becomes a walk. Holding the group in the quick-and-clean band is what turns the ladder into footwork rather than a trip hazard.",
      holdBreakNote: "The cadence left the band — rushing and clipping rungs, or dropping to a plod. Bring it back to quick and clean.",
    },
    {
      id: "pivot-menu", kind: "sequence", anyOrder: true,
      targets: ["menu-front-pivot", "menu-reverse-pivot", "menu-drop-step"],
      itemNames: {
        "menu-front-pivot": "front pivot",
        "menu-reverse-pivot": "reverse pivot",
        "menu-drop-step": "drop step",
      },
      title: "Run the pivot menu from the jump stop",
      cue: "From a jump stop, walk through a front pivot, a reverse pivot and a drop step.",
      why: "The jump stop is the platform; the pivot menu is what a player does from it — face the basket, turn away from pressure, seal a defender. Walking through all three from the same stop teaches that either foot can be the pivot and that the ball stays protected through every turn, which is the whole point of stopping on balance.",
    },
    {
      id: "count-the-jumps", kind: "gauge", target: "jump-count-dial",
      title: "Keep today's landing count inside the plan",
      cue: "Commit when the running count of jumps and landings sits inside today's planned range.",
      gauge: {
        label: "LANDINGS", speed: 0.58, green: [0.3, 0.55],
        readout: (t) => (t < 0.3 ? "under the plan" : t <= 0.55 ? "inside the plan" : "over — stop the jumping"),
        missNote: "Outside the plan. Past the range, landings get sloppy and growing knees and heels take the load — keep the count inside it.",
      },
      why: "Landing load adds up across a week of practices, school sport and play, and growing knees and heels are where it shows first. Keeping a running count against a planned range, the way youth development guidance recommends managing volume, lets a coach stop the jumping while the quality is still good rather than when the pain arrives.",
    },
    {
      id: "rolled-ankle-care", kind: "sequence",
      targets: ["ankle-stop-and-sit", "ankle-check", "ankle-ice-wrapped", "ankle-elevate", "ankle-trainer-clears"],
      itemNames: {
        "ankle-stop-and-sit": "stop and sit the player down, off the foot",
        "ankle-check": "check the ankle and ask what happened",
        "ankle-ice-wrapped": "ice wrapped in a cloth",
        "ankle-elevate": "support and elevate the foot",
        "ankle-trainer-clears": "no return until the athletic trainer clears it",
      },
      title: "Say the care for a rolled ankle",
      cue: "Sit them down off the foot, check it, ice wrapped in a cloth, support and elevate, and no return until the athletic trainer clears it.",
      why: "Most rolled ankles in practice are sprains that heal well when cared for at once and badly when walked off. The American Red Cross first aid course teaches getting the weight off, checking, cold wrapped so it never touches bare skin, support and elevation; the return decision belongs to the athletic trainer, not to the player's own 'it's fine' in front of teammates.",
      outOfOrderNote: "Out of order. Weight off and a check first, then cold and elevation — and the return is always last, and never the player's call.",
    },
    {
      id: "log-the-footwork", kind: "select", target: "practice-log-board",
      title: "Log the footwork block",
      cue: "Record the floor fixes, the landing count, the corrections made and any ankle that was looked at.",
      why: "A landing count, the knee corrections given and any ankle that was iced are exactly the details the next practice and the athletic trainer need. Written down at the time, they let the week's jump volume be managed across sessions and make sure a player who sat out today is not simply forgotten on Thursday.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: what each of you saw in the landings, and are all three of you good to carry on?",
      why: "Landings and ankles are the athletic trainer's territory, the far end of the ladder was the assistant's, and the head coach was on the pivot circle. Pooling what each saw before the next block means a player who landed badly twice is noticed by all three adults, and the staff stay a team rather than three people running separate drills.",
    },
  ],

  interrupts: [
    {
      id: "rolled-ankle-on-landing",
      kind: "Player down",
      after: "balanced-landing", delay: 3, seconds: 12,
      alert: "A player landed a jump stop half on a teammate's foot. The ankle rolled and they are sitting on the floor, holding it and trying not to cry.",
      cue: "Stop the line and call the athletic trainer over with the kit — the player stays down and off the foot.",
      target: "trainer-kit-call",
      why: "An ankle that rolls under body weight needs to be assessed before anyone tests it, and the first instinct of an embarrassed young player is to stand up and walk it off. Stopping the line and calling the athletic trainer with the kit keeps the weight off, gets ice and a proper check started, and follows the American Red Cross first aid habit of care before questions.",
      missNote: "The drill carried on and the player got up and hopped back to the line to rejoin. Weight on a freshly rolled ankle can turn a mild sprain into a bad one, and nobody trained to judge it ever looked at the joint.",
      wrongNote: "That does not help the ankle. Call the athletic trainer with the kit — the player stays sitting, off the foot.",
    },
    {
      id: "early-pickup-at-the-door",
      kind: "Parent at the door",
      after: "ladder-cadence", delay: 3, seconds: 12,
      alert: "An adult at the gym doors is asking to take one of the players home early. The player's usual pick-up is a parent; this adult is not one the staff recognise.",
      cue: "Check the authorised pick-up list before anybody leaves — the assistant coach handles it at the door.",
      target: "pickup-list-clipboard",
      why: "A child leaves practice with an adult on the authorised pick-up list, confirmed by a staff member, or they do not leave. Checking the list at the door, with the assistant coach handling it and a call to the parent if the name is not there, is the routine that keeps every child accounted for and every decision observable, the way SafeSport policies are written.",
      missNote: "The player went out of the doors with an adult nobody checked. The staff cannot now say who that was or whether the family agreed to it, and the first duty of the adults running practice — knowing where every child is and who has them — has been lost.",
      wrongNote: "Not that. Check the authorised pick-up list at the door before the player goes anywhere.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBF_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBF_ACCENT, { emissive: o.color ?? BBF_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBF_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#140f24", accent: o.accent ?? BBF_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBF_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(16,10,30,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBF_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f2eeff";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#d8ccf6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBF_ACCENT, { rough: 0.5, emissive: o.accent ?? BBF_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.12, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the landing strip
    const stripTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#2a2436", base2: "#241f2f", seam: "rgba(8,6,14,0.55)",
    }), { repeat: 2, px: 384 });
    const strip = box(g, 1.1, 0.02, 2.6, -0.9, 0.012, -0.9, 0x2a2436, { rough: 0.95, cast: false });
    strip.material = texturedMat(stripTex, { rough: 0.95, metal: 0.02, color: 0xc8c0e0 });
    for (const z of [-1.8, -0.9, 0.0]) box(g, 0.5, 0.006, 0.05, -0.9, 0.025, z, 0xf6f4ee, { rough: 0.6, cast: false });
    const sticky = cyl(g, 0.24, 0.24, 0.004, -0.75, 0.025, -0.35, 0xd8a83a, { rough: 0.2, opacity: 0.55, seg: 18, cast: false });
    bead(-0.75, 0.45, -0.35, "floor-sticky-drink", "Sticky patch", { w: 0.28 });
    const dust = cyl(g, 0.4, 0.4, 0.003, 2.7, 0.006, 1.0, 0xc8c0b0, { rough: 1, opacity: 0.4, seg: 18, cast: false });
    bead(2.7, 0.45, 1.0, "floor-dust-film", "Dust by the door", { w: 0.32 });
    const tape = box(g, 0.4, 0.006, 0.05, 0.9, 0.009, 0.5, 0xf2e6c0, { rough: 0.7, cast: false });
    tape.rotation.z = 0.05;
    bead(0.9, 0.45, 0.5, "floor-lifted-tape", "Lifted tape edge", { w: 0.34 });
    bead(0.0, 0.3, 1.6, "floor-court-line", "Court line", { w: 0.26, color: 0x7fc4d8, css: "#7fc4d8", r: 0.025 });

    // ------------------------------------------------------------ the jump-stop ladder of cues
    const cues = group(g, -2.3, 0, -2.2, 0.4);
    cyl(cues, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["jump-last-dribble", "1 · Pick up the dribble", 0.56], ["jump-low-hop", "2 · Low hop", 0.82],
      ["jump-two-feet", "3 · Both feet at once", 1.08], ["jump-knees-bent", "4 · Sit into it", 1.34],
      ["jump-chin-ball", "5 · Chin the ball", 1.6],
    ]) {
      const b = ball(cues, 0.028, 0, y, 0, BBF_ACCENT, { emissive: BBF_ACCENT, ei: 1.5, seg: 12 });
      holoTag(cues, label, 0.24, y, 0, { css: BBF_CSS, w: 0.44 });
      reg(hits, b, lid);
    }
    card(-1.35, 1.35, -2.65, "pivot-rule-card", "The pivot-foot rule", "ONE FOOT\nSTAYS DOWN", { w: 0.42 });

    // ------------------------------------------------------------ landing players
    const lander = standingFigure(g, -0.9, -1.35, { ry: 0, cloth: 0xf2f2f2, trousers: 0x2a2436, atStation: true });
    const partner = standingFigure(g, -0.35, -1.55, { ry: -0.3, cloth: 0x4a3a7a, trousers: 0x2a2436, atStation: true });
    lander.userData.body.position.y = -0.08;
    stand(-0.2, -2.45, 0, 0.95);
    bead(-0.2, 1.1, -2.45, "landing-hold-marker", "Stick the landing — hold", { w: 0.46 });
    const lStand = stand(0.6, -2.5, -0.2);
    const landing = instrument(lStand, 0, 1.02, 0, { idle: "BEND", color: BBF_ACCENT, w: 0.2, d: 0.26 });
    holoTag(lStand, "Landing knee bend", 0, 1.22, 0, { css: BBF_CSS, w: 0.36 });
    reg(hits, landing, "landing-meter");
    bead(-1.12, 0.55, -1.2, "fault-knee-caving", "Knee caving", { w: 0.26, r: 0.025 });
    bead(-0.7, 0.14, -1.25, "fault-heel-landing", "Heels", { w: 0.2, r: 0.025 });
    bead(-0.12, 0.14, -1.45, "fault-pivot-lifts", "Pivot lifts", { w: 0.26, r: 0.025 });
    bead(-0.6, 1.45, -1.5, "fault-arms-out", "Arms out", { w: 0.24, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ the pivot circle
    const pivotCircle = group(g, 1.2, 0, -1.3);
    cyl(pivotCircle, 0.55, 0.55, 0.006, 0, 0.02, 0, 0x4a3a7a, { rough: 0.7, opacity: 0.8, seg: 28, cast: false });
    const disc = cyl(pivotCircle, 0.16, 0.16, 0.03, 0, 0.04, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 20 });
    const footprint = box(pivotCircle, 0.1, 0.012, 0.22, 0, 0.06, 0, BBF_ACCENT, { emissive: BBF_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    holoTag(pivotCircle, "Pivot disc — half turn", 0, 0.3, 0, { css: BBF_CSS, w: 0.4 });
    reg(hits, disc, "pivot-disc");
    const menu = group(g, 2.35, 0, -2.25, -0.5);
    cyl(menu, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["menu-front-pivot", "Front pivot", 0.8], ["menu-reverse-pivot", "Reverse pivot", 1.05], ["menu-drop-step", "Drop step", 1.3]]) {
      const b = ball(menu, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(menu, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.32 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ agility ladder
    const rolled = group(g, 2.6, 0, 0.1);
    cyl(rolled, 0.16, 0.16, 0.5, 0, 0.16, 0, 0xf2c14b, { rough: 0.7, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(rolled, "Agility ladder (rolled)", 0, 0.5, 0, { css: BBF_CSS, w: 0.42 });
    reg(hits, rolled, "agility-ladder");
    const ladderStrip = group(g, 1.6, 0, 1.3, Math.PI / 2);
    const rungs = [];
    for (let i = 0; i < 7; i++) rungs.push(box(ladderStrip, 0.42, 0.01, 0.03, 0, 0.015, -0.9 + i * 0.3, 0xf2c14b, { rough: 0.7, cast: false }));
    for (const sx of [-0.21, 0.21]) rungs.push(box(ladderStrip, 0.02, 0.01, 1.84, sx, 0.015, 0, 0xf2c14b, { rough: 0.7, cast: false }));
    for (const r of rungs) r.visible = false;
    const socket = box(g, 0.5, 0.006, 0.4, 1.6, 0.009, 1.3, BBF_ACCENT, { emissive: BBF_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Ladder strip", 1.6, 0.2, 1.3, { css: BBF_CSS, w: 0.26 });
    reg(hits, socket, "ladder-socket");
    const cStand = stand(0.4, 1.35, 0.3);
    const cadence = instrument(cStand, 0, 1.02, 0, { idle: "CADENCE", color: BBF_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Ladder cadence", 0, 1.22, 0, { css: BBF_CSS, w: 0.32 });
    reg(hits, cadence, "cadence-meter");
    const jStand = stand(-2.95, -0.7, 0.8);
    const jumps = instrument(jStand, 0, 1.02, 0, { idle: "COUNT", color: BBF_ACCENT, w: 0.2, d: 0.26 });
    holoTag(jStand, "Landing count", 0, 1.22, 0, { css: BBF_CSS, w: 0.3 });
    reg(hits, jumps, "jump-count-dial");

    // ------------------------------------------------------------ ankle care, kit, door
    const care = group(g, -3.05, 0, 0.9, 0.9);
    cyl(care, 0.022, 0.022, 1.85, 0, 0.92, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["ankle-stop-and-sit", "1 · Sit down, off the foot", 0.62], ["ankle-check", "2 · Check it", 0.88],
      ["ankle-ice-wrapped", "3 · Ice, wrapped", 1.14], ["ankle-elevate", "4 · Support, elevate", 1.4],
      ["ankle-trainer-clears", "5 · Trainer clears return", 1.66],
    ]) {
      const b = ball(care, 0.026, 0, y, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, seg: 12 });
      holoTag(care, label, 0.22, y, 0, { css: "#f2c14b", w: 0.46 });
      reg(hits, b, lid);
    }
    const kit = group(g, 2.95, 0, 2.2);
    box(kit, 0.5, 0.32, 0.32, 0, 0.16, 0, 0xd8261e, { rough: 0.6 });
    box(kit, 0.14, 0.04, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    box(kit, 0.04, 0.14, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    const icePack = box(kit, 0.16, 0.05, 0.12, -0.12, 0.35, 0, 0x9fd0f0, { rough: 0.4 });
    holoTag(kit, "Call the trainer — kit", 0, 0.62, 0, { css: "#f2c14b", w: 0.42 });
    reg(hits, kit, "trainer-kit-call");
    const door = group(g, 3.45, 0, -0.4, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(door, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    const stranger = standingFigure(g, 3.35, 0.6, { ry: -1.6, cloth: 0x5a5046, atStation: true });
    stranger.visible = false;
    const desk = group(g, -2.35, 0, 2.0, 0.3);
    box(desk, 0.7, 0.05, 0.4, 0, 0.74, 0, 0x5a4a36, { rough: 0.7 });
    for (const sx of [-0.3, 0.3]) box(desk, 0.04, 0.72, 0.36, sx, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const list = decal(desk, 0.26, 0.2, 0, 0.772, 0, paperFace("AUTHORISED PICK-UP", ["Name · Relationship", "Phone · Verified by"], { bg: "#f2efe0", band: "#4a3a7a" }), { px: 200 });
    list.rotation.x = -Math.PI / 2;
    holoTag(desk, "Pick-up list", 0, 1.0, 0, { css: "#f2c14b", w: 0.28 });
    reg(hits, list, "pickup-list-clipboard");

    // ------------------------------------------------------------ boards
    const log = board(0.6, 0.36, 1.35, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Floor fixes · landing count", "Corrections · any ankle"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.0, 1.66, -1.95, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -0.7, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // ------------------------------------------------------------ the wrong moves
    const ballBag = group(g, -1.6, 0, 0.35);
    cyl(ballBag, 0.28, 0.24, 0.5, 0, 0.25, 0, 0x2a2a3a, { rough: 0.85, seg: 14, open: true });
    basketball(ballBag, 0, 0.4, 0); basketball(ballBag, 0.22, 0.12, 0.3);
    hazardCard(-1.6, 1.2, 0.35, "jump-stop-by-ball-bag", "Land next to the ball bag?", "JUMP STOPS\nBY THE BAG", 0.3);
    hazardCard(-0.5, 1.25, 1.2, "land-on-sticky-patch", "Land on the sticky patch?", "IT'S ONLY\nSTICKY", 0.1);
    hazardCard(0.6, 1.25, 1.2, "jumps-until-legs-go", "Jump until the legs go?", "UNTIL THEY\nDROP", -0.1);
    hazardCard(2.0, 1.25, -0.55, "stations-too-close", "Pivots beside the ladder?", "PIVOT CIRCLE\nON THE LADDER", -0.6);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.35, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.35, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x4a3a7a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.4, 2.85, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.4, 2.1, 2.85, { css: "#f2c14b", w: 0.34 });
    void coach; void dust; void footprint; void icePack;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "feel-the-floor") { sticky.visible = false; tape.visible = false; }
        if (step.id === "front-pivot") disc.material = mat(0x59c97b, { rough: 0.4, metal: 0.3, emissive: 0x59c97b, ei: 0.5 });
        if (step.id === "lay-the-ladder") { rolled.visible = false; for (const r of rungs) r.visible = true; }
        if (step.id === "log-the-footwork") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Landings inside the plan", "Two knee corrections given"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "rolled-ankle-on-landing") {
          const b = partner.userData.body;
          b.rotation.x = -Math.PI / 2; b.position.y = 0.16;
        }
        if (it.id === "early-pickup-at-the-door") { stranger.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rolled-ankle-on-landing") {
          trainer.position.set(0.1, 0, -1.0); trainer.rotation.y = -2.8;
          const b = partner.userData.body;
          b.rotation.x = -1.1; b.position.y = 0.3;
        }
        if (it.id === "early-pickup-at-the-door") { assistant.position.set(2.9, 0, 0.3); assistant.rotation.y = -1.4; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (session?.step?.id === "front-pivot") footprint.rotation.y = t * 1.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-the-knee-bend") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(landing.userData.screen, signFace(ok ? "SOFT" : gg.t < 0.42 ? "STIFF" : "CAVING", { bg: "#140f24", accent: ok ? "#59c97b" : "#f0645b", fg: "#f2eeff", scale: 0.55 }));
        }
        if (gg && !gg.committed && session.step?.id === "count-the-jumps") {
          const ok = gg.t >= 0.3 && gg.t <= 0.55;
          repaint(jumps.userData.screen, signFace(ok ? "IN PLAN" : gg.t < 0.3 ? "UNDER" : "OVER", { bg: "#140f24", accent: ok ? "#59c97b" : "#f0645b", fg: "#f2eeff", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "ladder-cadence") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(cadence.userData.screen, signFace(ok ? "CLEAN" : tr.v < 0.4 ? "PLODDING" : "RUSHING", { bg: "#140f24", accent: ok ? "#59c97b" : "#f0645b", fg: "#f2eeff", scale: 0.5 }));
        }
      },
    };
  },
};
