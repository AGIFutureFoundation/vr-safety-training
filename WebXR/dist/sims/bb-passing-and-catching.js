import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station four: passing and
// catching. What is behind every receiver checked before a ball is thrown,
// names called before passes, a chest pass built in order, target hands held
// ready, pass speed matched to the receiver, partners spaced for their age,
// the bounce spot set, catching faults that jam fingers corrected, and the
// rule for a ball to the face said before one happens.
//
// Sited generically in the gym-court district; the team and players are
// invented and no rule number is quoted.

const BBP_ACCENT = 0x3fd0a8;
const BBP_CSS = "#3fd0a8";

export const SIM_BB_PASSING_AND_CATCHING = {
  id: "bb-passing-and-catching",
  index: "334",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on age-appropriate ball size, partner distance and skill progression; NFHS guidance on a safe playing area and hydration in school sport; CDC Heads Up for a ball to the head — recognise, remove, refer; the U.S. Center for SafeSport for correcting a young player calmly and in view; the American Red Cross first aid course for cold on a jammed finger and never pulling it",
  name: "Passing and Catching",
  title: simTitle("Passing and Catching"),
  tagline: "Every receiver's background checked, names called before passes, a chest pass built in order, target hands up, speed matched to the catcher, the bounce spot set, and any ball to the face taken seriously",
  accent: BBP_ACCENT,
  accentCss: BBP_CSS,
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "soft-hands", name: "Soft Hands", note: "Every pass seen, every catch made with the fingers up, and no knock to the head shrugged off" },

  supportLine: "your league's coach coordinator, or the assistant who took the sit-out with you — the heated moments stay with the adults who handled them, and are worth saying out loud",

  game: system({
    name: "Pass Chain",
    currency: "ASSISTS",
    ranks: ["Rebound Helper", "Drill Coach", "Assistant Coach", "Head Coach", "Offence Educator"],
    badges: [
      { id: "clear-background", name: "Clear Background", note: "Everything behind the receivers found first time", test: AWARD.stepClean("clear-the-backgrounds") },
      { id: "nobody-hit", name: "Nobody Hit", note: "No unsafe action in the whole passing block", test: AWARD.safe },
      { id: "catchable", name: "Catchable", note: "Pass speed and partner rhythm both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-chain", name: "Clean Chain", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "steady-chain", name: "Steady Chain", note: "Held the partner rhythm in band the whole time", test: AWARD.unbroken },
      { id: "sharp-chain", name: "Sharp Chain", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "shake-off-ball-to-face": "You told the player hit in the face by a pass to shake it off and get back in line. A ball to the head can cause a concussion, and the signs — a headache, a dazed look, a player who seems slow or off — often show minutes later; a player sent straight back is a player whose brain is exposed to a second hit before anyone has checked.",
    "cross-the-passing-lines": "You ran two partner lines passing across each other. Every player in a passing drill is watching the ball in the air, not the player crossing behind it; crossing lines guarantees a receiver stepping into another pair's pass or into another player at head height.",
    "leaky-bottle-on-court": "You left the leaking water bottle lying on the court beside the passing line. The puddle it makes is exactly where a receiver steps to meet a pass, with their weight moving forward and their eyes on the ball.",
    "water-in-the-locker-room": "You left the team's water bottles in the locker room to keep the court tidy. A drink that needs a trip down a corridor is a drink young players skip, and in a warm gym the fluid they miss adds up quietly across a practice.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the passing block once it has run and the water is staged — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "clear-the-backgrounds", kind: "find", noHint: true,
      targets: ["lane-glass-door", "lane-parent-chairs", "lane-scorer-laptop"],
      itemNames: {
        "lane-glass-door": "a glass-panelled door behind a receiver",
        "lane-parent-chairs": "parents' folding chairs in the ball path",
        "lane-scorer-laptop": "a laptop on the scorer's table behind the line",
      },
      itemNotes: {
        "lane-glass-door": "A missed pass that hits a glass panel can break it over whoever is near. Turn the line so the receivers have the padded wall behind them.",
        "lane-parent-chairs": "Parents are welcome to watch — from behind the bleacher rail, not in the path of every missed catch.",
        "lane-scorer-laptop": "A missed pass will find the laptop sooner or later. Move it or move the line.",
      },
      decoyNotes: {
        "lane-padded-wall": "The padded end wall is the best backstop in the gym. Line the receivers up in front of it.",
      },
      title: "Check what is behind every receiver",
      cue: "Look past each receiver's shoulder. Mark everything a missed pass would hit.",
      why: "Every passing drill produces missed catches, and every missed catch keeps travelling. What sits behind the receivers — a glass panel, a row of parents, a laptop on the scorer's table — is what that ball hits. Checking the background before the first pass, and turning the lines so a padded wall takes the misses, is the safe-playing-area habit school-sport guidance asks of every coach.",
    },
    {
      id: "call-the-name", kind: "select", target: "call-name-card",
      title: "Make every pass start with a name",
      cue: "Set the rule: say your partner's name, see their hands, then pass.",
      why: "Most passes that hit a face are passes the receiver never saw coming. A name called before the ball leaves the hands turns every pass into a two-way agreement, gets the receiver's eyes and hands up, and builds the talking habit a real offence needs — at the cost of one word.",
    },
    {
      id: "build-the-chest-pass", kind: "sequence",
      targets: ["pass-grip", "pass-step", "pass-extend", "pass-thumbs-down"],
      itemNames: {
        "pass-grip": "fingers spread, thumbs behind the ball",
        "pass-step": "step toward the target",
        "pass-extend": "push both arms out to the chest",
        "pass-thumbs-down": "follow through, thumbs down, palms out",
      },
      title: "Build the chest pass in order",
      cue: "Grip with thumbs behind the ball, step toward your partner, push the arms out, finish thumbs down.",
      why: "The chest pass is the first pass a young player learns because it is short, straight and controllable, and each part adds power without adding risk. The grip gives control, the step toward the target gives the power, the push aims it, and the thumbs-down follow-through puts backspin on it so it arrives soft. Built out of order, players throw with their arms alone and the ball arrives hard and wild.",
      outOfOrderNote: "Out of order. Grip, step, push, follow through — without the step the arms do all the work and the pass arrives hard and off target.",
    },
    {
      id: "show-a-target", kind: "hold", target: "target-hands-marker", seconds: 7,
      title: "Hold target hands up for the catch",
      cue: "Receivers hold both hands up at the chest, fingers up, thumbs close — hold it while you scan the lines.",
      why: "A receiver who shows two hands at the chest, fingers up, gives the passer a target and puts the hands in the one shape that catches rather than jams. Holding the target until the ball arrives is the habit, and for the coach it is a moment to scan every pair and spot the receiver whose hands are down or whose eyes are elsewhere.",
      holdBreakNote: "The hands dropped before the ball arrived. Target up again — fingers up, thumbs close — and hold it.",
    },
    {
      id: "match-the-speed", kind: "gauge", target: "pass-speed-meter",
      title: "Match the pass speed to the receiver",
      cue: "Commit when the passes read crisp but catchable for this age group.",
      gauge: {
        label: "PASS SPEED", speed: 0.64, green: [0.4, 0.6],
        readout: (t) => (t < 0.4 ? "floaty — easy to steal" : t <= 0.6 ? "crisp and catchable" : "too hard — jams fingers"),
        missNote: "Outside the band. A floater gets stolen; a rocket jams fingers and hits faces. Find crisp and catchable and commit.",
      },
      why: "A pass is only as good as the catch it allows. Too soft and it floats into a defender's hands; too hard for the receiver's size and skill and it jams fingers or hits a face. Youth development guidance scales passing drills to age and size, and reading speed against the receiver in front of you, not the strongest passer in the gym, is how that scaling happens.",
    },
    {
      id: "space-the-partners", kind: "drag", target: "partner-cone",
      title: "Space the partners for their age",
      cue: "Carry the partner cone out to the marked distance for this group.",
      drag: { to: "partner-socket", radius: 0.45, missNote: "Not on the mark. Too close and there is no time to react; too far and they start heaving it — set the cone on the spot." },
      why: "Partner distance decides how hard players throw. Too close and the receiver has no time to get their hands up; too far and young players start heaving the ball with their whole body, losing all control. A distance set for the group's age keeps passes in the range where technique, not effort, gets the ball there.",
    },
    {
      id: "set-the-bounce-spot", kind: "turn", target: "bounce-dial",
      title: "Set the bounce spot for the bounce pass",
      cue: "Turn the floor marker out to about two-thirds of the way toward the receiver.",
      turn: { turns: 0.5, axis: "y", label: "BOUNCE SPOT" },
      why: "A bounce pass that hits the floor too close to the passer arrives at the receiver's knees or shins; one that hits too close to the receiver kicks up into their face. A spot about two-thirds of the way across brings the ball up to the waist, where the hands are. Marking it on the floor gives every pair the same target to aim at.",
    },
    {
      id: "fix-the-catches", kind: "find", noHint: true,
      targets: ["fault-fingers-pointed", "fault-eyes-off-ball", "fault-lazy-lob"],
      itemNames: {
        "fault-fingers-pointed": "fingers pointed straight at the ball",
        "fault-eyes-off-ball": "a receiver looking away as the ball arrives",
        "fault-lazy-lob": "a lazy, looping lob of a pass",
      },
      itemNotes: {
        "fault-fingers-pointed": "Fingertips pointed at the ball take the full impact on the end of the finger — that is how fingers jam. Cue 'fingers up, catch with the pads'.",
        "fault-eyes-off-ball": "Eyes that leave the ball early mean the hands miss it and the ball meets the face. Cue 'watch it into your hands'.",
        "fault-lazy-lob": "A floater hangs in the air long enough for anyone to take it. Cue 'step and snap' for a crisp, flat pass.",
      },
      decoyNotes: {
        "fault-two-hands": "Two hands on the catch is exactly right for this age. Look for what will jam a finger, hit a face or get stolen.",
      },
      title: "Correct the catches that hurt hands",
      cue: "Watch the receivers. Mark every catch or pass habit that needs fixing now.",
      why: "Jammed fingers are the most common hand injury in youth basketball, and nearly all of them come from fingertips pointed straight at an arriving ball. Correcting that, eyes that leave the ball early, and looping passes that invite steals and collisions is where a coach's attention earns its keep — calmly, one cue at a time, in view of everyone.",
    },
    {
      id: "partner-rhythm", kind: "track", target: "rhythm-meter", seconds: 8,
      title: "Keep the partner passing rhythm steady",
      cue: "Hold the pairs in a steady catch-and-pass rhythm — quick hands, never rushing a pass before the partner is ready.",
      track: {
        start: 0.24, green: [0.4, 0.62], rise: 0.55, fall: 0.44, drift: 0.14, label: "RHYTHM",
        readout: (v) => (v < 0.4 ? "sluggish — holding the ball" : v > 0.62 ? "rushed — partner not ready" : "quick and ready"),
      },
      why: "Quick hands are the goal, but a pass thrown before the partner has recovered from the last catch is a pass that hits them. Holding the pairs in a quick-and-ready rhythm builds the snap of a real offence while keeping every ball arriving at hands that are up and waiting.",
      holdBreakNote: "The rhythm left the band — balls held too long, or thrown before the partner was ready. Bring it back to quick and ready.",
    },
    {
      id: "pass-types", kind: "sequence", anyOrder: true,
      targets: ["type-overhead", "type-bounce", "type-outlet"],
      itemNames: {
        "type-overhead": "two-hand overhead pass",
        "type-bounce": "bounce pass to the spot",
        "type-outlet": "outlet pass to the wing",
      },
      title: "Add the other passes to the chain",
      cue: "Overhead, bounce to the marked spot, and outlet to the wing — one short block of each.",
      why: "Each pass solves a different problem: the overhead gets the ball over a defender, the bounce gets it under outstretched arms, the outlet starts a break. Adding them only after the chest pass is solid follows the control-first progression, and short blocks of each keep attention and technique high.",
    },
    {
      id: "ball-to-the-head-rule", kind: "select", target: "heads-up-card",
      title: "Post the rule for a ball to the head",
      cue: "Any ball to the head: the player sits out and is checked for concussion signs by the athletic trainer before playing again.",
      why: "A ball to the head in a passing drill is common and usually harmless, which is exactly why it gets waved off. CDC Heads Up training asks coaches to treat every blow to the head as a possible concussion: take the player out, watch for signs like headache, confusion or a dazed look, and let a trained person decide. Posting the rule before practice means nobody negotiates it in the moment.",
    },
    {
      id: "stage-the-bottles", kind: "drag", target: "bottle-crate",
      title: "Stage the water bottles at the bench",
      cue: "Carry the crate of named bottles from the locker-room door to the bench.",
      drag: { to: "bench-bottle-socket", radius: 0.5, missNote: "Not at the bench. Water left by the locker-room door is water nobody walks to — carry the crate all the way." },
      why: "Water players can reach in ten seconds during a break is water they actually drink. A crate of named bottles at the bench means no sharing, no queue at the fountain, and no reason to skip the break — the simple arrangement that does more for heat safety in a warm gym than any poster.",
    },
    {
      id: "log-the-passing", kind: "select", target: "practice-log-board",
      title: "Log the passing block",
      cue: "Record the background fixes, the catching corrections and any ball to the head and who checked it.",
      why: "Any ball to the head belongs in the log with the time and who checked the player, because concussion signs can appear hours later and the parents and athletic trainer need to know it happened. The corrections and background fixes go in beside it, so the next practice starts from what this one learned.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: what each of you saw on the lines, anything about the sit-out, and is everybody good to go on?",
      why: "The assistant handled the sit-out and the athletic trainer watched the hands; the head coach was running the drill. A short check-in puts the heated moment and any sore fingers on the table while they are fresh, agrees how to follow up with the players involved, and keeps the adults working in the open as one staff.",
    },
  ],

  interrupts: [
    {
      id: "ball-fired-at-teammate",
      kind: "Heated moment",
      after: "show-a-target", delay: 3, seconds: 12,
      alert: "After a turnover in the line, one player has fired the ball hard at a teammate from two steps away, and the teammate is shouting back.",
      cue: "Stop the pair and send the thrower to the sit-out chair with the assistant — calm voice, no audience.",
      target: "sit-out-chair",
      why: "A ball thrown in anger is a safety problem before it is a discipline problem, and it is settled by distance and a calm adult, not by a scene in front of the team. A brief sit-out with the assistant takes the thrower out of range, lets the heat drop, and keeps the conversation that follows observable and respectful, the way SafeSport guidance frames correcting young athletes.",
      missNote: "Nobody stepped in, the teammate threw it back even harder, and the next ball went past both of them into another pair's line. What started as one bad moment has put four players in the path of angry, uncontrolled passes.",
      wrongNote: "That does not settle it. Send the thrower to the sit-out chair with the assistant first.",
    },
    {
      id: "fire-alarm-two-teams",
      kind: "Fire alarm",
      after: "partner-rhythm", delay: 3, seconds: 12,
      alert: "The fire alarm is sounding while your team and the team on the other half of the court are both mid-drill.",
      cue: "Balls down, out through your marked exit with the assistant, and a headcount by your own team list outside.",
      target: "fire-exit-door",
      why: "With two teams in one gym, an evacuation only works if each coach takes their own group out through their own marked exit and counts them against their own list. Balls down and out immediately, headcount at the assembly point, and nobody goes back in until the building is cleared — every alarm treated as real.",
      missNote: "The passing kept going until the other team started leaving, and then both groups crowded one door. Outside, nobody can say which players belong to which coach or whether everyone made it out.",
      wrongNote: "The alarm comes first. Balls down and everyone out through the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBP_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBP_ACCENT, { emissive: o.color ?? BBP_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBP_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#08201a", accent: o.accent ?? BBP_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBP_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(6,24,20,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e8fbf5";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c4ece0";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBP_ACCENT, { rough: 0.5, emissive: o.accent ?? BBP_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.12, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });
    const cone = (parent, x, z, color = 0xff7a2a) => {
      const c = group(parent, x, 0, z);
      cyl(c, 0.02, 0.11, 0.26, 0, 0.13, 0, color, { rough: 0.6, seg: 12 });
      box(c, 0.2, 0.012, 0.2, 0, 0.006, 0, color, { rough: 0.6 });
      return c;
    };
    const chair = (x, z, ry, color = 0x3a3f46) => {
      const c = group(g, x, 0, z, ry);
      box(c, 0.4, 0.04, 0.38, 0, 0.45, 0, color, { rough: 0.6, metal: 0.3 });
      box(c, 0.4, 0.4, 0.03, 0, 0.66, -0.18, color, { rough: 0.6, metal: 0.3 });
      for (const sx of [-0.18, 0.18]) box(c, 0.03, 0.45, 0.34, sx, 0.22, 0, 0x2b2f35, { rough: 0.5, metal: 0.5 });
      return c;
    };

    // ------------------------------------------------------------ passing strip
    const stripTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#1f3a33", base2: "#1a322c", seam: "rgba(4,12,10,0.55)",
    }), { repeat: 2, px: 384 });
    const strip = box(g, 2.8, 0.02, 1.6, 0, 0.012, -1.0, 0x1f3a33, { rough: 0.95, cast: false });
    strip.material = texturedMat(stripTex, { rough: 0.95, metal: 0.02, color: 0xc0e0d8 });
    for (const x of [-1.0, 0.0, 1.0]) { cone(g, x, -1.7, 0x3fd0a8); }
    const passerA = standingFigure(g, -0.5, -0.45, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x1f2a36, atStation: true });
    const receiverA = standingFigure(g, -0.5, -1.55, { ry: 0, cloth: 0x2f7a66, trousers: 0x1f2a36, atStation: true });
    const passerB = standingFigure(g, 0.6, -0.45, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x1f2a36, atStation: true });
    const receiverB = standingFigure(g, 0.6, -1.55, { ry: 0, cloth: 0x2f7a66, trousers: 0x1f2a36, atStation: true });
    const flight = basketball(g, -0.5, 1.2, -1.0);

    // ------------------------------------------------------------ backgrounds
    const glassDoor = group(g, -3.3, 0, -1.9, Math.PI / 2);
    box(glassDoor, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    box(glassDoor, 0.4, 0.9, 0.02, 0, 1.4, 0.02, 0x9fd0f0, { rough: 0.05, metal: 0.3, opacity: 0.5 });
    bead(-3.2, 1.2, -1.9, "lane-glass-door", "Glass-panel door", { w: 0.34 });
    const parents = [chair(-2.4, -2.6, 0.4, 0x5a6068), chair(-1.95, -2.75, 0.3, 0x5a6068)];
    bead(-2.2, 0.95, -2.7, "lane-parent-chairs", "Parents' chairs", { w: 0.32 });
    const scorer = group(g, 2.6, 0, -2.3, -0.5);
    box(scorer, 0.9, 0.05, 0.45, 0, 0.74, 0, 0x5a4a36, { rough: 0.7 });
    for (const sx of [-0.4, 0.4]) box(scorer, 0.04, 0.72, 0.4, sx, 0.36, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const laptop = box(scorer, 0.32, 0.02, 0.22, 0, 0.78, 0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    box(scorer, 0.32, 0.2, 0.01, 0, 0.88, -0.11, 0x2b3138, { rough: 0.4, metal: 0.5 });
    holoTag(scorer, "Scorer's laptop", 0, 1.12, 0, { css: BBP_CSS, w: 0.3 });
    reg(hits, laptop, "lane-scorer-laptop");
    const pad = box(g, 1.4, 1.2, 0.08, 0.5, 0.8, -3.2, 0x1f3a6b, { rough: 0.85 });
    holoTag(g, "Padded wall", 0.5, 1.55, -3.15, { css: "#7fc4d8", w: 0.26 });
    reg(hits, pad, "lane-padded-wall");

    // ------------------------------------------------------------ technique props
    card(-1.4, 1.35, -2.8, "call-name-card", "Call the name first", "NAME ·\nHANDS · PASS", { w: 0.4 });
    const chain = group(g, 2.3, 0, -1.1, -0.9);
    cyl(chain, 0.024, 0.024, 1.7, 0, 0.85, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["pass-grip", "1 · Thumbs behind", 0.66], ["pass-step", "2 · Step to target", 0.94],
      ["pass-extend", "3 · Push out", 1.22], ["pass-thumbs-down", "4 · Thumbs down", 1.5],
    ]) {
      const b = ball(chain, 0.028, 0, y, 0, BBP_ACCENT, { emissive: BBP_ACCENT, ei: 1.5, seg: 12 });
      holoTag(chain, label, 0.22, y, 0, { css: BBP_CSS, w: 0.38 });
      reg(hits, b, lid);
    }
    stand(-0.05, -2.5, 0, 0.95);
    bead(-0.05, 1.1, -2.5, "target-hands-marker", "Target hands — hold", { w: 0.42 });
    const sStand = stand(0.85, -2.55, -0.2);
    const speed = instrument(sStand, 0, 1.02, 0, { idle: "SPEED", color: BBP_ACCENT, w: 0.2, d: 0.26 });
    holoTag(sStand, "Pass speed", 0, 1.22, 0, { css: BBP_CSS, w: 0.26 });
    reg(hits, speed, "pass-speed-meter");
    const partnerCone = cone(g, 1.6, 0.2, 0xf2c14b);
    holoTag(partnerCone, "Partner cone", 0, 0.42, 0, { css: BBP_CSS, w: 0.28 });
    reg(hits, partnerCone, "partner-cone");
    const pSocket = box(g, 0.3, 0.008, 0.3, 1.0, 0.03, -1.7, BBP_ACCENT, { emissive: BBP_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    pSocket.position.set(1.4, 0.03, -1.7);
    holoTag(g, "Partner mark", 1.4, 0.2, -1.7, { css: BBP_CSS, w: 0.26 });
    reg(hits, pSocket, "partner-socket");
    const bounceBase = group(g, 0.05, 0, -1.0);
    const bounceDial = cyl(bounceBase, 0.1, 0.1, 0.03, 0, 0.04, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 18 });
    const bounceArrow = box(bounceBase, 0.04, 0.012, 0.22, 0, 0.06, 0.11, BBP_ACCENT, { emissive: BBP_ACCENT, ei: 0.7, rough: 0.5, cast: false });
    holoTag(bounceBase, "Bounce spot dial", 0, 0.25, 0, { css: BBP_CSS, w: 0.32 });
    reg(hits, bounceDial, "bounce-dial");
    bead(-0.32, 0.95, -1.62, "fault-fingers-pointed", "Fingers at ball", { w: 0.3, r: 0.025 });
    bead(0.82, 1.7, -1.55, "fault-eyes-off-ball", "Eyes away", { w: 0.24, r: 0.025 });
    bead(0.6, 1.35, -0.35, "fault-lazy-lob", "Lazy lob", { w: 0.24, r: 0.025 });
    bead(-0.72, 0.95, -1.62, "fault-two-hands", "Two hands", { w: 0.26, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const rStand = stand(1.6, 1.0, -0.4);
    const rhythm = instrument(rStand, 0, 1.02, 0, { idle: "RHYTHM", color: BBP_ACCENT, w: 0.2, d: 0.26 });
    holoTag(rStand, "Partner rhythm", 0, 1.22, 0, { css: BBP_CSS, w: 0.3 });
    reg(hits, rhythm, "rhythm-meter");
    const types = group(g, 3.05, 0, 0.35, -1.1);
    cyl(types, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["type-overhead", "Overhead", 0.8], ["type-bounce", "Bounce to the spot", 1.05], ["type-outlet", "Outlet to the wing", 1.3]]) {
      const b = ball(types, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(types, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.36 });
      reg(hits, b, lid);
    }
    card(-2.95, 1.35, 0.35, "heads-up-card", "Ball to the head rule", "SIT OUT ·\nGET CHECKED", { ry: 1.0, w: 0.42, accent: "#f2c14b", css: "#f2c14b" });

    // ------------------------------------------------------------ water, bench, sit-out
    const crate = group(g, -2.9, 0, -0.6);
    box(crate, 0.46, 0.2, 0.32, 0, 0.1, 0, 0x2f7a66, { rough: 0.7 });
    for (let i = 0; i < 6; i++) cyl(crate, 0.035, 0.035, 0.22, -0.16 + (i % 3) * 0.16, 0.3, (i < 3 ? -0.07 : 0.07), [0x3a8fd0, 0xe0e4e8][i % 2], { rough: 0.5, seg: 10 });
    holoTag(crate, "Named water bottles", 0, 0.6, 0, { css: BBP_CSS, w: 0.38 });
    reg(hits, crate, "bottle-crate");
    const bench = group(g, -1.6, 0, 1.9);
    box(bench, 1.8, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.8, 0.8]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const bSocket = box(g, 0.5, 0.008, 0.4, -1.1, 0.01, 1.35, BBP_ACCENT, { emissive: BBP_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Bench — bottles here", -1.1, 0.22, 1.35, { css: BBP_CSS, w: 0.38 });
    reg(hits, bSocket, "bench-bottle-socket");
    const sitOut = chair(-3.0, 1.2, 1.2, 0x2f7a66);
    const sitTag = group(g, -3.0, 0, 1.2);
    const sitBead = ball(sitTag, 0.035, 0, 1.0, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.4, rough: 0.4, seg: 12 });
    holoTag(sitTag, "Sit-out chair — with the assistant", 0, 1.13, 0, { css: "#f2c14b", w: 0.56 });
    reg(hits, sitBead, "sit-out-chair");
    void sitOut;

    // ------------------------------------------------------------ exit
    const exit = group(g, 3.45, 0, 1.6, -Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");

    // ------------------------------------------------------------ boards
    const log = board(0.6, 0.36, 1.35, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Backgrounds · corrections", "Any ball to the head"]));
    log.position.set(1.5, 1.72, -3.05);
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.0, 1.66, -1.95, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -0.7, accent: 0x7fc4d8 });
    checkin.position.set(3.1, 1.66, -1.2);
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // ------------------------------------------------------------ the wrong moves
    const leaky = cyl(g, 0.035, 0.035, 0.22, -1.4, 0.035, 0.2, 0x3a8fd0, { rough: 0.5, seg: 10 });
    leaky.rotation.z = Math.PI / 2;
    const leak = cyl(g, 0.2, 0.2, 0.004, -1.25, 0.004, 0.3, 0x9fd0f0, { rough: 0.05, opacity: 0.5, seg: 16, cast: false });
    void leak;
    hazardCard(-1.8, 1.25, 0.3, "leaky-bottle-on-court", "Leave the leaking bottle?", "IT'S ONLY\nA DRIP", 0.4);
    hazardCard(-0.55, 1.25, 1.15, "shake-off-ball-to-face", "Shake off a ball to the face?", "SHAKE IT OFF\nBACK IN LINE", 0.1);
    hazardCard(0.6, 1.25, 1.15, "cross-the-passing-lines", "Cross the two lines?", "CRISS-CROSS\nTHE LINES", -0.1);
    hazardCard(2.1, 1.25, 1.6, "water-in-the-locker-room", "Water in the locker room?", "BOTTLES STAY\nIN THE LOCKERS", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.4, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.4, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.35, -1.0, { ry: 1.2, cloth: 0x2f7a66, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.35, 2.1, -1.0, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.9, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.9, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void parents; void receiverB; void passerB;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "clear-the-backgrounds") { for (const c of parents) c.position.z -= 0.6; laptop.visible = false; }
        if (step.id === "space-the-partners") partnerCone.position.set(1.4, 0, -1.7);
        if (step.id === "set-the-bounce-spot") bounceArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.5 });
        if (step.id === "stage-the-bottles") { crate.position.set(-1.1, 0, 1.35); }
        if (step.id === "log-the-passing") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Receivers face the padded wall", "No ball to the head today"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "ball-fired-at-teammate") {
          receiverA.rotation.y = Math.PI; receiverA.position.set(-0.5, 0, -0.9);
          passerA.position.set(-0.5, 0, -0.55);
        }
        if (it.id === "fire-alarm-two-teams") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
          flight.position.set(-0.3, 0.12, -1.0);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ball-fired-at-teammate") {
          passerA.position.set(-2.6, 0, 1.5); passerA.rotation.y = 1.2;
          assistant.position.set(-2.8, 0, 0.6); assistant.rotation.y = 0.6;
          receiverA.position.set(-0.5, 0, -1.55); receiverA.rotation.y = 0;
        }
        if (it.id === "fire-alarm-two-teams") {
          exitLeaf.rotation.y = -1.2; exitLeaf.position.x = 0.35;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const k = (Math.sin(t * 2.2) + 1) / 2;
        if (flight.position.y > 0.5) { flight.position.z = -0.55 - k * 0.9; flight.position.y = 1.15 + Math.sin(k * Math.PI) * 0.08; }
        if (session?.step?.id === "set-the-bounce-spot") bounceArrow.rotation.y = t;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "match-the-speed") {
          const ok = gg.t >= 0.4 && gg.t <= 0.6;
          repaint(speed.userData.screen, signFace(ok ? "CATCHABLE" : gg.t < 0.4 ? "FLOATY" : "TOO HARD", { bg: "#08201a", accent: ok ? "#59c97b" : "#f0645b", fg: "#e8fbf5", scale: 0.48 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "partner-rhythm") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(rhythm.userData.screen, signFace(ok ? "READY" : tr.v < 0.4 ? "SLUGGISH" : "RUSHED", { bg: "#08201a", accent: ok ? "#59c97b" : "#f0645b", fg: "#e8fbf5", scale: 0.5 }));
        }
      },
    };
  },
};
