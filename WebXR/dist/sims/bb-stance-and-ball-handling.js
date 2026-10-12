import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station two: stance and ball
// handling. The equipment checked before it is handed out, lanes spaced so
// nobody dribbles into anybody, the triple-threat stance built from the feet
// up, a pound dribble held with the eyes up, work and rest set on a timer,
// the coaching eye on the faults that matter, and loose balls racked before
// they end up under somebody's foot.
//
// Sited generically in the gym-court district; the team and players are
// invented and no rule number is quoted.

const BBH_ACCENT = 0xf29b38;
const BBH_CSS = "#f29b38";

export const SIM_BB_STANCE_AND_BALL_HANDLING = {
  id: "bb-stance-and-ball-handling",
  index: "332",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on age-appropriate ball size, skill progression and work-to-rest balance; NFHS basketball rules for the dribble and a school-sport standard of safe equipment; CDC Heads Up for recognising a knock to the head in a crowded drill; the U.S. Center for SafeSport for calm, observable correction of young players; the American Red Cross first aid course for the sprains and jammed fingers ball-handling drills produce",
  name: "Stance and Ball Handling",
  title: simTitle("Stance and Ball Handling"),
  tagline: "Balls checked before they are handed out, lanes spaced wide, the triple-threat stance built from the feet up, a pound dribble with the eyes up, work and rest on a timer, and every loose ball racked",
  accent: BBH_ACCENT,
  accentCss: BBH_CSS,
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "eyes-up", name: "Eyes Up", note: "A whole ball-handling block run with the heads up, the lanes clear and nobody pushed past their rest" },

  supportLine: "your league's coach coordinator, or the assistant who ran the drill with you — a shove or an alarm mid-practice is worth talking through before the next one",

  game: system({
    name: "Handle Series",
    currency: "TOUCHES",
    ranks: ["Ball Boy or Girl", "Drill Helper", "Skills Coach", "Head Coach", "Skills Director"],
    badges: [
      { id: "good-ball", name: "Good Ball", note: "Every bad ball caught before it reached a player", test: AWARD.stepClean("check-the-balls") },
      { id: "clear-lanes", name: "Clear Lanes", note: "No unsafe action in the whole block", test: AWARD.safe },
      { id: "on-rhythm", name: "On Rhythm", note: "Ball pressure and crossover rhythm both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-block", name: "Clean Block", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Held the crossover rhythm in band the whole time", test: AWARD.unbroken },
      { id: "quick-block", name: "Quick Block", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "overlap-the-lanes": "You squeezed the group into overlapping lanes to fit everyone on one side. Players dribbling with their eyes up are, by design, not watching the player next to them; lanes that overlap guarantee elbows, heads and loose balls meeting at speed, and a clash of heads is the concussion nobody planned for.",
    "leave-loose-balls": "You let the loose balls roll wherever they stopped. A basketball on the floor is the most common thing a player lands on when an ankle rolls in practice, and in a ball-handling drill there are a dozen of them bouncing away from tired hands every minute.",
    "dribble-through-sweat": "You kept the drill going over the sweat drips at the end of the lanes. A dribbling player crossing over on a slick patch has their weight on one foot and their eyes up — exactly the moment a slip ends with a hand, a wrist or a head hitting the floor.",
    "no-rest-intervals": "You ran the handling series straight through with no rest intervals. Tired hands stop controlling the ball, tired players stop keeping their eyes up, and continuous repetition without rest is the unplanned load youth guidelines warn builds overuse problems in wrists and forearms.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the block once the drills have been run and the balls racked — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "check-the-balls", kind: "find", noHint: true,
      targets: ["ball-flat", "ball-overinflated", "ball-cracked-cover"],
      itemNames: {
        "ball-flat": "a ball that will not bounce back to the hand",
        "ball-overinflated": "a ball pumped rock hard",
        "ball-cracked-cover": "a ball with a split cover",
      },
      itemNotes: {
        "ball-flat": "A soft ball dies on the floor and teaches players to slap at it. Pull it and pump it before it goes out.",
        "ball-overinflated": "A rock-hard ball jumps off the floor and jams the fingers it hits. Let it down to the right pressure.",
        "ball-cracked-cover": "A split cover catches skin and fingernails on every catch. It comes out of the rack for good.",
      },
      decoyNotes: {
        "ball-good": "This one bounces true and the cover is sound. Check the rest of the rack.",
      },
      title: "Check the balls before they go out",
      cue: "Go through the rack. Pull every ball that is soft, rock hard or damaged.",
      why: "Ball handling is taught through the ball, and a bad ball teaches bad habits and hurts hands. A soft ball dies and players slap it; an over-pumped one jumps and jams fingers; a split cover tears skin on every catch. Pulling them before they are handed out is the same equipment-first habit school-sport rules ask of every piece of gear on the court.",
    },
    {
      id: "set-ball-pressure", kind: "gauge", target: "pressure-gauge",
      title: "Set the ball pressure with the gauge",
      cue: "Pump and bleed until the gauge reads inside the band printed on the ball, then commit.",
      gauge: {
        label: "PRESSURE", speed: 0.6, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "soft — dies on the floor" : t <= 0.6 ? "in range" : "hard — jumps off the floor"),
        missNote: "Outside the printed range. Soft balls teach slapping and hard ones jam fingers — pump or bleed until it reads in range.",
      },
      why: "The range printed by the valve is what makes a ball bounce back to the same height every dribble, which is the whole feedback loop a young player learns control from. Guessing by squeezing produces a rack of balls that each behave differently, and a player who fights a different ball every rep is learning the ball, not the skill.",
    },
    {
      id: "space-the-lanes", kind: "drag", target: "lane-cone",
      title: "Space the dribbling lanes wide",
      cue: "Carry the last cone out to the marked spot so every lane has room on both sides.",
      drag: { to: "lane-socket", radius: 0.45, missNote: "Not on the spot. A cone short of the mark leaves two lanes sharing the same strip of floor — carry it all the way out." },
      why: "In a ball-handling drill every player is asked to keep their eyes up, which means nobody is watching the player beside them. Lanes wide enough that two players crossing over at the same moment cannot touch are what make eyes-up coaching safe; a coach who squeezes lanes to fit the group has swapped a drill for a collision waiting to happen.",
    },
    {
      id: "build-the-stance", kind: "sequence",
      targets: ["stance-feet", "stance-knees", "stance-pocket", "stance-eyes"],
      itemNames: {
        "stance-feet": "feet shoulder width, weight on the balls of the feet",
        "stance-knees": "knees and hips bent, back up",
        "stance-pocket": "ball held firm at the hip, in the pocket",
        "stance-eyes": "eyes up on the rim and the floor",
      },
      title: "Build the triple-threat stance from the feet up",
      cue: "Feet first, then knees and hips, then the ball in the pocket, then eyes up.",
      why: "The triple-threat stance — ready to shoot, pass or drive — is built from the ground up because every part depends on the one below. Feet set wide and on the balls give balance; bent knees and hips give the spring; the ball tucked at the hip keeps it away from a defender; eyes up is what makes the other three worth having. Teaching it in that order stops players bending at the waist with the ball out in front of them.",
      outOfOrderNote: "Build it from the floor: feet, then knees, then the ball, then eyes. Start at the ball and players end up bent at the waist with it hanging out in front.",
    },
    {
      id: "pound-dribble", kind: "hold", target: "pound-dribble-pad", seconds: 7,
      title: "Hold a hard pound dribble with the eyes up",
      cue: "Keep the dribble hard and low at the side, head up, while you watch the whole row.",
      why: "The pound dribble — hard, low, at the side and below the knee — builds the hand strength and feel every other move needs, and holding it for a set time with the eyes up is how a player learns that the ball will come back without being watched. For the coach it is also the moment to scan the whole row rather than the one player who is struggling.",
      holdBreakNote: "The dribble came up and the eyes went down. Get it back low and hard, head up, before counting again.",
    },
    {
      id: "call-the-numbers", kind: "select", target: "eyes-up-card",
      title: "Flash numbers so players dribble with their eyes up",
      cue: "Hold up fingers and have each player call the number out while they keep dribbling.",
      why: "Players say their eyes are up long before they actually are. Flashing a number with your fingers and asking them to call it out while dribbling turns eyes-up from a reminder into something the coach can check, and it trains the habit that keeps a ball handler seeing teammates, defenders and the player they are about to run into.",
    },
    {
      id: "set-the-intervals", kind: "turn", target: "interval-timer",
      title: "Set the work and rest intervals on the timer",
      cue: "Turn the interval timer to a short work block followed by an equal rest.",
      turn: { turns: 0.5, axis: "z", label: "INTERVAL" },
      why: "Ball-handling drills are short, sharp efforts; continuous dribbling for minutes on end produces sloppy repetitions and sore wrists rather than skill. Setting the timer to short work blocks with real rest keeps every rep at full quality and builds in the recovery youth guidelines recommend, so fatigue never becomes the thing the drill is actually practising.",
    },
    {
      id: "coach-the-faults", kind: "find", noHint: true,
      targets: ["fault-eyes-down", "fault-slapping", "fault-standing-tall"],
      itemNames: {
        "fault-eyes-down": "a player staring at the ball",
        "fault-slapping": "a player slapping the ball with a flat palm",
        "fault-standing-tall": "a player dribbling standing straight up",
      },
      itemNotes: {
        "fault-eyes-down": "Eyes on the ball means no eyes on anything else. Cue 'chin up, see the rim' and flash a number.",
        "fault-slapping": "Control comes from the finger pads, not a flat palm. Cue 'fingers, not palm' and let them feel the ball push back.",
        "fault-standing-tall": "A tall dribbler is an easy one to strip and a slow one to start. Cue 'sit down' — knees bent, ball low.",
      },
      decoyNotes: {
        "fault-weak-hand": "Using the weak hand is not a fault, it is the point of the drill. Leave it be and look for the habits that need fixing.",
      },
      title: "Find the faults worth correcting",
      cue: "Watch the row. Mark every player whose habit needs a correction now.",
      why: "A good coaching eye picks out the two or three faults that decide whether a player improves — eyes down, slapping with a flat palm, dribbling upright — and leaves the rest alone. Correcting calmly and specifically, one cue per player, in view of everyone, is the observable, encouraging style SafeSport guidance asks of adults working with young athletes.",
    },
    {
      id: "crossover-rhythm", kind: "track", target: "rhythm-meter", seconds: 8,
      title: "Keep the crossover rhythm steady",
      cue: "Hold the group's crossover rhythm in band — quick enough to be a move, controlled enough that the ball stays low.",
      track: {
        start: 0.25, green: [0.4, 0.62], rise: 0.56, fall: 0.44, drift: 0.14, label: "RHYTHM",
        readout: (v) => (v < 0.4 ? "too slow — a lob, not a move" : v > 0.62 ? "too fast — losing it" : "quick and controlled"),
      },
      why: "A crossover is a change of hands that has to be quick and low enough that a defender cannot reach it, yet controlled enough that the ball comes back. Players left to themselves either float it across slowly or speed up until the ball flies away into the next lane; holding the rhythm in the controlled band is what makes the move both real and safe for everybody around.",
      holdBreakNote: "The rhythm went out of band — floating, or so fast the balls started getting away. Bring it back to quick and controlled.",
    },
    {
      id: "handling-series", kind: "sequence", anyOrder: true,
      targets: ["series-around-waist", "series-figure-eight", "series-spider"],
      itemNames: {
        "series-around-waist": "ball around the waist",
        "series-figure-eight": "figure eight through the legs",
        "series-spider": "spider dribble",
      },
      title: "Run the stationary handling series",
      cue: "Around the waist, figure eight and spider dribble — each one for a short, sharp block.",
      why: "The stationary series builds the hand speed and feel for the ball that moving moves depend on, without adding the traffic of a full-court drill. Each exercise asks the fingers for something different, and running them as short, sharp blocks with rest between them keeps the quality high and the wrists fresh.",
    },
    {
      id: "progression-rule", kind: "select", target: "progression-board",
      title: "Add pressure only after control",
      cue: "Post the rule: a defender is added only when a player can keep the ball low and the eyes up without one.",
      why: "Skill progression in youth development guidance runs from control, to control on the move, to control under pressure. Adding a defender before a player can dribble low with their eyes up does not make them tougher; it makes them turn their back, stare at the ball and crash into people, and it teaches the wrong habit at full speed.",
    },
    {
      id: "rack-loose-balls", kind: "drag", target: "loose-ball-cart",
      title: "Rack every loose ball before the next drill",
      cue: "Roll the loose-ball cart back into the rack spot at the end of the bench.",
      drag: { to: "ball-rack-socket", radius: 0.5, missNote: "Not racked. A cart left out on the floor is a dozen balls ready to roll under the next drill — take it all the way to the rack spot." },
      why: "Ball-handling drills scatter balls across the floor faster than any other part of practice, and a ball under a foot is the classic way an ankle rolls. Racking them between drills — every time, not when it looks messy — keeps the next drill starting on a clear floor, and it teaches players that clearing the court is part of practising on it.",
    },
    {
      id: "log-the-block", kind: "select", target: "practice-log-board",
      title: "Log the ball-handling block",
      cue: "Record the balls pulled, the corrections made and anything that happened in the lanes.",
      why: "A written note of which balls were pulled, what each player is working on and anything that happened in the lanes means the next practice starts where this one ended. It also gives the athletic trainer and the programme a record made at the time if a sore wrist or a knock turns out to matter later in the week.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "A minute at the bench: anything either of them saw in the lanes, and is everybody good to go on?",
      why: "The assistant coach watched the far end of the lanes and the athletic trainer watched the hands and wrists; the head coach saw neither closely. A quick staff check-in after the block puts those observations together before the next drill, and keeps the adults talking in the open as a team rather than one person carrying the whole practice.",
    },
  ],

  interrupts: [
    {
      id: "shove-over-a-loose-ball",
      kind: "Heated moment",
      after: "pound-dribble", delay: 3, seconds: 12,
      alert: "Two players in neighbouring lanes both went after the same loose ball. Words, then a shove — one of them is squaring up to the other.",
      cue: "Stop it calmly: separate them to the two cool-off spots, away from each other and away from the row.",
      target: "cool-off-spots",
      why: "A heated moment between young players is defused by distance and a calm adult voice, not by a lecture in front of the group. Sending each player to a separate cool-off spot breaks the contact at once, keeps everybody in view, and lets the coach talk to each of them privately once the heat has gone — the calm, observable correction SafeSport guidance expects.",
      missNote: "Nobody stepped in, and the shove became a scuffle in the middle of the lanes with a dozen balls bouncing around it. Two players and the teammates who crowded in are now at risk of exactly the collision the wide lanes were meant to prevent.",
      wrongNote: "That does not separate them. Send each player to their own cool-off spot first — everything else can wait until the heat is gone.",
    },
    {
      id: "fire-alarm-mid-drill",
      kind: "Fire alarm",
      after: "crossover-rhythm", delay: 3, seconds: 12,
      alert: "The building fire alarm is sounding and the strobe over the exit is flashing while the whole row is mid-crossover.",
      cue: "Balls down, everyone to the marked fire exit with the assistant, then headcount outside.",
      target: "fire-exit-door",
      why: "When the alarm sounds, the drill is over: balls down where they stand, everyone out through the marked exit together, and a headcount at the assembly point against the check-in sheet. Treating every alarm as real is the only way a group of young players leaves quickly and completely on the day it is not a drill.",
      missNote: "The drill carried on through the alarm, and when the group did leave it went out in a straggle through two different doors. Nobody can say for certain that every player is out of the building, which is the one thing an evacuation exists to guarantee.",
      wrongNote: "Not now — the alarm comes first. Balls down and everybody to the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBH_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBH_ACCENT, { emissive: o.color ?? BBH_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBH_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1408", accent: o.accent ?? BBH_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBH_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(26,16,6,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBH_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdf3e6";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#f2dcc0";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBH_ACCENT, { rough: 0.5, emissive: o.accent ?? BBH_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, color = 0xd8641e) => ball(parent, 0.12, x, y, z, color, { rough: 0.75, seg: 16 });
    const cone = (parent, x, z, color = 0xff7a2a) => {
      const c = group(parent, x, 0, z);
      cyl(c, 0.02, 0.11, 0.26, 0, 0.13, 0, color, { rough: 0.6, seg: 12 });
      box(c, 0.2, 0.012, 0.2, 0, 0.006, 0, color, { rough: 0.6 });
      return c;
    };

    // ------------------------------------------------------------ lanes
    // Three dribbling lanes taped on a rubber drill strip laid over the maple.
    const stripTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#3a2c20", base2: "#33271c", seam: "rgba(12,8,4,0.55)",
    }), { repeat: 2, px: 384 });
    const strip = box(g, 2.9, 0.02, 1.7, 0, 0.012, -0.9, 0x3a2c20, { rough: 0.95, cast: false });
    strip.material = texturedMat(stripTex, { rough: 0.95, metal: 0.02, color: 0xd8c8b8 });
    for (const x of [-1.45, -0.48, 0.48, 1.45]) box(g, 0.04, 0.006, 1.7, x, 0.025, -0.9, 0xf6f4ee, { rough: 0.6, cast: false });
    for (const x of [-0.97, 0.0]) cone(g, x, -1.85);
    const laneCone = cone(g, -0.3, 0.55);
    holoTag(laneCone, "Last lane cone", 0, 0.42, 0, { css: BBH_CSS, w: 0.3 });
    reg(hits, laneCone, "lane-cone");
    const laneSocket = box(g, 0.3, 0.008, 0.3, 0.97, 0.03, -1.85, BBH_ACCENT, { emissive: BBH_ACCENT, ei: 0.6, rough: 0.6, cast: false });
    holoTag(g, "Lane spot", 0.97, 0.2, -1.85, { css: BBH_CSS, w: 0.22 });
    reg(hits, laneSocket, "lane-socket");
    const sweat = cyl(g, 0.22, 0.22, 0.004, 0.2, 0.026, -0.1, 0x9fd0f0, { rough: 0.05, metal: 0.2, opacity: 0.5, seg: 18, cast: false });
    void sweat;

    // ------------------------------------------------------------ the ball rack
    const rack = group(g, -2.6, 0, -1.6, 0.5);
    for (const sx of [-0.4, 0.4]) box(rack, 0.04, 0.9, 0.04, sx, 0.45, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (const y of [0.35, 0.75]) box(rack, 0.84, 0.03, 0.3, 0, y, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    const RACK = [["ball-flat", -0.28, 0.5, 0xb85a22], ["ball-overinflated", 0.0, 0.5, 0xe0702a], ["ball-good", 0.28, 0.5, 0xd8641e], ["ball-cracked-cover", -0.14, 0.9, 0xc2602a]];
    const rackBalls = {};
    for (const [id, x, y, color] of RACK) {
      const b = basketball(rack, x, y, 0, color);
      rackBalls[id] = b;
      if (id === "ball-flat") b.scale.y = 0.8;
      reg(hits, b, id);
    }
    holoTag(rack, "Ball rack — check each ball", 0, 1.2, 0, { css: BBH_CSS, w: 0.48 });
    const pump = group(g, -2.0, 0, -2.4, 0.3);
    cyl(pump, 0.03, 0.03, 0.55, 0, 0.3, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
    box(pump, 0.2, 0.03, 0.08, 0, 0.58, 0, 0x2b3138, { rough: 0.5 });
    box(pump, 0.24, 0.02, 0.1, 0, 0.01, 0, 0x2b3138, { rough: 0.6 });
    const pStand = stand(-1.5, -2.6, 0.2);
    const pressure = instrument(pStand, 0, 1.02, 0, { idle: "PSI", color: BBH_ACCENT, w: 0.2, d: 0.26 });
    holoTag(pStand, "Ball pressure gauge", 0, 1.22, 0, { css: BBH_CSS, w: 0.4 });
    reg(hits, pressure, "pressure-gauge");

    // ------------------------------------------------------------ stance ladder and the row
    const ladder = group(g, 2.3, 0, -2.3, -0.4);
    cyl(ladder, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["stance-feet", "1 · Feet wide, on the balls", 0.62], ["stance-knees", "2 · Knees and hips bent", 0.9],
      ["stance-pocket", "3 · Ball in the pocket", 1.18], ["stance-eyes", "4 · Eyes up", 1.46],
    ]) {
      const b = ball(ladder, 0.028, 0, y, 0, BBH_ACCENT, { emissive: BBH_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.24, y, 0, { css: BBH_CSS, w: 0.46 });
      reg(hits, b, lid);
    }
    const row = [
      standingFigure(g, -0.97, -1.1, { ry: 0, cloth: 0xf2f2f2, trousers: 0x2a2a3a, atStation: true }),
      standingFigure(g, 0.0, -1.2, { ry: 0, cloth: 0x2f5f8f, trousers: 0x2a2a3a, atStation: true }),
      standingFigure(g, 0.97, -1.1, { ry: 0, cloth: 0xf2f2f2, trousers: 0x2a2a3a, atStation: true }),
    ];
    const rowBalls = row.map((p, i) => basketball(g, p.position.x + 0.3, 0.22, p.position.z + 0.12, [0xd8641e, 0xc85a1a, 0xd8641e][i]));
    bead(-0.97, 1.72, -0.95, "fault-eyes-down", "Eyes down", { w: 0.24, r: 0.025 });
    bead(0.24, 0.62, -1.0, "fault-slapping", "Flat palm", { w: 0.24, r: 0.025 });
    bead(0.97, 1.3, -0.95, "fault-standing-tall", "Standing tall", { w: 0.28, r: 0.025 });
    bead(-0.72, 0.62, -1.0, "fault-weak-hand", "Weak hand", { w: 0.26, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    stand(-0.3, -2.45, 0, 0.9);
    bead(-0.3, 1.05, -2.45, "pound-dribble-pad", "Pound dribble — hold it", { w: 0.44 });
    card(0.55, 1.35, -2.55, "eyes-up-card", "Flash a number", "HOW MANY\nFINGERS?", { w: 0.36 });

    // ------------------------------------------------------------ timer, meter, series
    const timerPost = group(g, -3.1, 0, -0.2, Math.PI / 2);
    box(timerPost, 0.08, 1.4, 0.08, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const face = decal(timerPost, 0.36, 0.26, 0, 1.35, 0.06, signFace("WORK / REST", { bg: "#0c0c0c", accent: BBH_CSS, fg: "#ffcf4a", scale: 0.4 }), { px: 200, glow: true, ei: 0.9 });
    const knob = cyl(timerPost, 0.06, 0.06, 0.04, 0, 1.12, 0.07, 0x2b3138, { rough: 0.4, metal: 0.4, seg: 16 });
    knob.rotation.x = Math.PI / 2;
    holoTag(timerPost, "Interval timer", 0, 1.6, 0.06, { css: BBH_CSS, w: 0.3 });
    reg(hits, knob, "interval-timer");
    const rStand = stand(1.6, 0.9, -0.4);
    const rhythm = instrument(rStand, 0, 1.02, 0, { idle: "RHYTHM", color: BBH_ACCENT, w: 0.2, d: 0.26 });
    holoTag(rStand, "Crossover rhythm", 0, 1.22, 0, { css: BBH_CSS, w: 0.34 });
    reg(hits, rhythm, "rhythm-meter");
    const series = group(g, 3.05, 0, -0.4, -1.0);
    cyl(series, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["series-around-waist", "Around the waist", 0.8], ["series-figure-eight", "Figure eight", 1.05], ["series-spider", "Spider dribble", 1.3]]) {
      const b = ball(series, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(series, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.36 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ boards
    const prog = board(0.6, 0.36, -1.35, 1.7, -3.0, (cx, w, h) => lines(cx, w, h, "PROGRESSION", ["Control first", "Then on the move", "Then a defender"]));
    reg(hits, prog.userData.face, "progression-board");
    const log = board(0.6, 0.36, 1.35, 1.7, -3.0, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Balls pulled · corrections", "Anything in the lanes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.0, 1.66, -1.95, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -0.7, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // ------------------------------------------------------------ loose balls and the cart
    const cart = group(g, 2.3, 0, 1.0);
    box(cart, 0.7, 0.04, 0.5, 0, 0.3, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.33, 0.33]) box(cart, 0.03, 0.4, 0.5, sx, 0.5, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (const [sx, sz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) cyl(cart, 0.04, 0.04, 0.05, sx, 0.03, sz, 0x1a1e23, { rough: 0.9, seg: 8 });
    for (let i = 0; i < 4; i++) basketball(cart, -0.18 + (i % 2) * 0.24, 0.45 + Math.floor(i / 2) * 0.2, (i % 2 ? 0.08 : -0.08), 0xd8641e);
    holoTag(cart, "Loose-ball cart", 0, 0.9, 0, { css: BBH_CSS, w: 0.3 });
    reg(hits, cart, "loose-ball-cart");
    const rackSpot = box(g, 0.6, 0.008, 0.5, -2.2, 0.01, 1.4, BBH_ACCENT, { emissive: BBH_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Rack spot — end of bench", -2.2, 0.22, 1.4, { css: BBH_CSS, w: 0.44 });
    reg(hits, rackSpot, "ball-rack-socket");
    const bench = group(g, -2.3, 0, 2.15);
    box(bench, 1.6, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.7, 0.7]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const strays = [basketball(g, 1.6, 0.12, -0.2), basketball(g, -1.7, 0.12, 0.4)];

    // ------------------------------------------------------------ cool-off spots, exit
    const coolA = cone(g, -2.9, 0.9, 0x59c97b), coolB = cone(g, 2.9, 2.0, 0x59c97b);
    void coolA; void coolB;
    bead(-2.9, 0.7, 0.9, "cool-off-spots", "Cool-off spots — one each", { color: 0x59c97b, css: "#59c97b", w: 0.48 });
    const exit = group(g, 3.4, 0, 1.3, -Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.7, 1.25, 0.2, "overlap-the-lanes", "Squeeze the lanes together?", "FIT EVERYONE\nIN ONE LANE", 0.4);
    hazardCard(-0.55, 1.25, 1.15, "leave-loose-balls", "Leave the loose balls?", "LET THEM\nROLL", 0.1);
    hazardCard(0.55, 1.25, 1.15, "dribble-through-sweat", "Dribble over the sweat?", "KEEP GOING\nIT'S SWEAT", -0.1);
    hazardCard(1.75, 1.25, -1.65, "no-rest-intervals", "Straight through, no rest?", "NO REST\nNO BREAKS", -0.5);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.35, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.35, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0xf29b38, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.35, 2.8, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.35, 2.1, 2.8, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "check-the-balls") { rackBalls["ball-cracked-cover"].visible = false; rackBalls["ball-flat"].scale.y = 1; }
        if (step.id === "space-the-lanes") { laneCone.position.set(0.97, 0, -1.85); }
        if (step.id === "set-the-intervals") repaint(face, signFace("WORK · REST", { bg: "#0c0c0c", accent: "#59c97b", fg: "#9fe0a8", scale: 0.4 }));
        if (step.id === "rack-loose-balls") { cart.position.set(-2.2, 0, 1.4); for (const b of strays) b.visible = false; }
        if (step.id === "log-the-block") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["One ball out of service", "Eyes-up cue for three players"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "shove-over-a-loose-ball") {
          row[1].position.set(-0.55, 0, -1.15); row[1].rotation.y = -1.2;
          row[0].rotation.y = 1.2;
        }
        if (it.id === "fire-alarm-mid-drill") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
          for (const b of rowBalls) b.position.y = 0.12;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "shove-over-a-loose-ball") {
          row[0].position.set(-2.6, 0, 0.6); row[0].rotation.y = 0.4;
          row[1].position.set(2.6, 0, 2.0); row[1].rotation.y = -0.4;
        }
        if (it.id === "fire-alarm-mid-drill") {
          exitLeaf.rotation.y = -1.2; exitLeaf.position.x = 0.35;
          assistant.position.set(3.0, 0, 0.6); assistant.rotation.y = -1.6;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        for (let i = 0; i < rowBalls.length; i++) rowBalls[i].position.y = 0.14 + Math.abs(Math.sin(t * 5 + i)) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "set-ball-pressure") {
          const ok = gg.t >= 0.44 && gg.t <= 0.6;
          repaint(pressure.userData.screen, signFace(ok ? "IN RANGE" : gg.t < 0.44 ? "SOFT" : "HARD", { bg: "#1c1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#fdf3e6", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "crossover-rhythm") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(rhythm.userData.screen, signFace(ok ? "CONTROLLED" : tr.v < 0.4 ? "FLOATING" : "LOSING IT", { bg: "#1c1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#fdf3e6", scale: 0.46 }));
        }
      },
    };
  },
};
