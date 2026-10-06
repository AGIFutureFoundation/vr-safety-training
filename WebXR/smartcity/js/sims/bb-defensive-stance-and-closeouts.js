import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station seven: defensive stance
// and closeouts. Room for slides checked before anyone slides, active hands
// instead of reaching, a stance built from the base up and held, lateral
// slides at a steady rhythm without crossing the feet, closeouts chopped
// under control and never into a shooter's landing space, the hips opened to
// turn and run, and rest between defensive reps that are, by nature, the
// hardest work in practice.
//
// Sited generically in the gym-court district; the team and players are
// invented and no rule number is quoted.

const BBD_ACCENT = 0x5ad07a;
const BBD_CSS = "#5ad07a";

export const SIM_BB_DEFENSIVE_STANCE_AND_CLOSEOUTS = {
  id: "bb-defensive-stance-and-closeouts",
  index: "337",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on defensive fundamentals, work-to-rest ratios and never using conditioning as punishment; NFHS basketball rules protecting an airborne shooter's landing space and on legal guarding position; CDC Heads Up for the collisions a closeout can cause; the U.S. Center for SafeSport for de-escalating a heated moment calmly and in view; the American Red Cross first aid course for a player down with a rolled ankle",
  name: "Defensive Stance and Closeouts",
  title: simTitle("Defensive Stance and Closeouts"),
  tagline: "Room to slide checked, active hands instead of reaching, a stance built and held, slides without crossing the feet, closeouts chopped under control and never into a shooter's landing, hips opened to run, and rest between reps",
  accent: BBD_ACCENT,
  accentCss: BBD_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "under-control", name: "Under Control", note: "Every closeout chopped, every shooter's landing respected and every heated moment cooled without a scene" },

  supportLine: "your league's coach coordinator, or the assistant who helped you pull the players apart — a heated moment at practice is worth a quiet word among the staff afterwards",

  game: system({
    name: "Stops",
    currency: "STOPS",
    ranks: ["Drill Helper", "Defensive Coach", "Assistant Coach", "Head Coach", "Defence Educator"],
    badges: [
      { id: "room-to-slide", name: "Room to Slide", note: "Every obstacle in the slide lanes found first time", test: AWARD.stepClean("space-for-slides") },
      { id: "clean-contest", name: "Clean Contest", note: "No unsafe action in the whole defensive block", test: AWARD.safe },
      { id: "chopped", name: "Chopped", note: "Slide rhythm and closeout timing both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-defence", name: "Clean Defence", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "steady-slides", name: "Steady Slides", note: "Held the slide rhythm in band the whole time", test: AWARD.unbroken },
      { id: "quick-stops", name: "Quick Stops", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "closeout-into-landing": "You coached the closeout as a full sprint right at the shooter's body. A defender who arrives out of control lands under or into a shooter who is still in the air; the shooter comes down on the defender's foot or back, which is how ankles break and heads hit the floor. Rules protect a shooter's landing space for exactly this reason.",
    "slides-by-the-bleachers": "You ran the slide lane right along the pulled-out bleacher footboards. A defender sliding sideways is watching the ball handler, not their feet; the edge of a footboard at ankle height is precisely what a trailing foot catches on the way past.",
    "slides-until-someone-quits": "You ran defensive slides as a punishment until somebody quit. Slides are the most demanding footwork in practice, and running them past exhaustion wrecks technique, piles unplanned load on hips and groins, and teaches players that defence is a penalty rather than a skill.",
    "sweatshirts-to-work-harder": "You told the players to keep sweatshirts on to work harder in a warm gym. Extra layers stop sweat cooling the skin, so body temperature climbs faster during the hardest work of practice — a deliberate step toward heat illness, not toughness.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the defensive block once it has run and the rest is set — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "space-for-slides", kind: "find", noHint: true,
      targets: ["slide-bleacher-edge", "slide-wall-close", "slide-bottles"],
      itemNames: {
        "slide-bleacher-edge": "a bleacher footboard pulled out into the slide lane",
        "slide-wall-close": "the end wall right at the end of a slide lane",
        "slide-bottles": "water bottles lined up along the slide path",
      },
      itemNotes: {
        "slide-bleacher-edge": "Push the footboard back or move the lane. A trailing foot catches an edge at ankle height without anyone seeing it coming.",
        "slide-wall-close": "Lanes end with room to stop before the wall. A defender sliding hard needs a few steps of empty floor after the last cone.",
        "slide-bottles": "Bottles belong on the bench. A bottle underfoot on a slide rolls an ankle as surely as a ball.",
      },
      decoyNotes: {
        "slide-court-line": "The court line is just paint under the finish. Look for what a sliding foot will catch or run into.",
      },
      title: "Check there is room to slide",
      cue: "Walk each slide lane end to end. Mark everything a sliding defender could catch, step on or run into.",
      why: "Defensive slides move players sideways and backwards with their eyes on someone else, which makes them the drill most likely to find whatever is at the edge of the floor. A footboard edge, a wall too close to the end of the lane and a row of bottles are the three things a sliding foot meets; clearing them before the drill starts is the whole of the prevention.",
    },
    {
      id: "active-hands", kind: "select", target: "active-hands-card",
      title: "Teach active hands, not reaching",
      cue: "Hands up and busy in the passing lanes — move the feet to stay in front, never reach across the body.",
      why: "Reaching is how young defenders foul, scratch faces and lose their balance in one motion. Active hands — up, busy, tracing the ball — pair with moving feet to keep a defender in legal guarding position, and teaching it from the first rep saves a season of whistles and a lot of accidental swipes across eyes.",
    },
    {
      id: "build-the-stance", kind: "sequence",
      targets: ["stance-wide-base", "stance-hips-low", "stance-on-the-balls", "stance-active-hands"],
      itemNames: {
        "stance-wide-base": "feet wider than the shoulders",
        "stance-hips-low": "hips low, chest up",
        "stance-on-the-balls": "weight on the balls of the feet",
        "stance-active-hands": "hands up and active",
      },
      title: "Build the defensive stance from the base up",
      cue: "Wide base first, then hips low and chest up, then weight on the balls, then hands up.",
      why: "A defensive stance is a base for moving, not a pose. A wide base gives lateral stability, low hips with the chest up keep balance without bending at the waist, weight on the balls lets the feet react, and hands come last because they are useless if the legs cannot keep up. Built in that order, the stance holds when the offence moves.",
      outOfOrderNote: "Out of order. The base and the hips first — hands up on a narrow, upright stance just means a defender who gets beaten and reaches.",
    },
    {
      id: "hold-the-stance", kind: "hold", target: "stance-hold-marker", seconds: 8,
      title: "Hold the stance long enough to feel it",
      cue: "Everyone holds a low stance for the count — hips down, chest up — while you walk the line.",
      why: "Holding a low stance for a short count builds the leg strength defence runs on and shows who is folding at the waist or rising onto their heels. It is short on purpose: long enough to feel the work, short enough that the stance never collapses into a bad habit. Walking the line during the hold is where the coach corrects bodies one at a time.",
      holdBreakNote: "The stance came up before the count finished. Down again — hips low, chest up — and hold it.",
    },
    {
      id: "slide-rhythm", kind: "track", target: "slide-meter", seconds: 8,
      title: "Keep the slides at a steady rhythm",
      cue: "Hold the group's lateral slides in band — push off, slide, never cross or click the feet together.",
      track: {
        start: 0.25, green: [0.4, 0.62], rise: 0.55, fall: 0.44, drift: 0.14, label: "SLIDES",
        readout: (v) => (v < 0.4 ? "sluggish — standing up" : v > 0.62 ? "frantic — crossing feet" : "push and slide"),
      },
      why: "Good slides push off the trailing foot and step with the lead, keeping the base wide the whole way. Rushed, they turn into crossed feet and clicking heels — the moment a defender is most likely to trip over their own legs; too slow and the stance rises. Holding the rhythm in band keeps the base wide and the feet apart at every step.",
      holdBreakNote: "The slides went out of band — feet crossing in a rush, or the group standing up. Back to push and slide.",
    },
    {
      id: "chop-the-closeout", kind: "gauge", target: "closeout-meter",
      title: "Time the chop on the closeout",
      cue: "Commit when the chop reads right — sprinting early, short choppy steps to arrive balanced a step away.",
      gauge: {
        label: "CHOP", speed: 0.7, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "chopped too early — shooter free" : t <= 0.6 ? "under control" : "too late — flying in"),
        missNote: "Off the timing. Chop too early and the shooter is open; too late and the defender flies into the shooter. Find under control and commit.",
      },
      why: "A closeout covers ground fast and then shortens the steps so the defender arrives balanced, a step away, with a hand up. Chop too early and the shot is open; too late and the defender arrives flying, lands in the shooter's space and turns a contest into a collision. The timing is the whole skill, and it is the part that keeps both players on their feet.",
    },
    {
      id: "open-the-hips", kind: "turn", target: "hip-turn-dial",
      title: "Open the hips to turn and run",
      cue: "Turn the hips a quarter turn toward the drive — the drop step that starts a defender running.",
      turn: { turns: 0.25, axis: "y", label: "HIPS" },
      why: "When a ball handler gets past the lead foot, sliding is too slow; the defender has to open the hips, drop step and run to cut them off. Teaching the turn as a quarter-turn of the hips rather than a twist of the knee keeps the joints stacked and the defender balanced as they change from sliding to sprinting.",
    },
    {
      id: "set-the-closeout-cone", kind: "drag", target: "closeout-cone",
      title: "Set the closeout cone a step short of the shooter",
      cue: "Carry the cone to its mark a step in front of the shooter's spot — that is where the closeout ends.",
      drag: { to: "closeout-socket", radius: 0.45, missNote: "Not on the mark. The cone sits a step short of the shooter, so every closeout finishes outside the landing space." },
      why: "A cone a step short of the shooter's spot gives every defender a visible place to finish, outside the space the shooter will come down in. It turns 'under control' from an instruction into a target, and it keeps a whole line of closeouts from ending on the shooter's feet.",
    },
    {
      id: "spot-the-faults", kind: "find", noHint: true,
      targets: ["fault-crossing-feet", "fault-standing-up", "fault-lunging"],
      itemNames: {
        "fault-crossing-feet": "a defender crossing the feet on the slide",
        "fault-standing-up": "a defender standing up out of the stance",
        "fault-lunging": "a defender lunging at the ball",
      },
      itemNotes: {
        "fault-crossing-feet": "Crossed feet are a trip waiting to happen and an easy blow-by. Cue 'push, don't cross'.",
        "fault-standing-up": "Standing tall means slow feet and a reach to follow. Cue 'sit down in it'.",
        "fault-lunging": "A lunge commits the weight forward and ends in a foul or a fall. Cue 'feet first, hands second'.",
      },
      decoyNotes: {
        "fault-loud-talk": "A defender calling out screens and shots is doing exactly the right thing. Look for the feet, the height and the lunge.",
      },
      title: "Spot the defensive faults worth fixing",
      cue: "Watch the slides and closeouts. Mark every habit that needs a correction.",
      why: "Three habits undo young defenders: crossing the feet, standing up out of the stance and lunging at the ball. Each one is also how a defender ends up on the floor or fouling hard. Correcting them one cue at a time, and praising the defenders who talk, builds a defence that is both better and safer to play against.",
    },
    {
      id: "closeout-sequence", kind: "sequence", anyOrder: true,
      targets: ["close-sprint", "close-chop", "close-high-hand"],
      itemNames: {
        "close-sprint": "sprint the first part of the distance",
        "close-chop": "chop the feet to arrive balanced",
        "close-high-hand": "a high hand to contest, feet still under you",
      },
      title: "Walk the pieces of the closeout",
      cue: "Sprint, chop, high hand — walk each piece before putting them together at speed.",
      why: "Breaking the closeout into its pieces lets young players feel each one before speed hides the mistakes. The sprint covers ground, the chop controls it, the high hand contests without contact; walked first and then built up to speed, the closeout stays a skill instead of a charge.",
    },
    {
      id: "protect-the-landing", kind: "select", target: "landing-space-card",
      title: "Post the rule: never into the shooter's landing space",
      cue: "Contest with a high hand, from in front — never under, never into the space where the shooter will land.",
      why: "A shooter in the air cannot protect themselves, and NFHS basketball rules give an airborne player the right to land. Posting the rule in plain words — contest from in front with a high hand, never under or into the landing space — makes it the standard every closeout is judged by, not a foul called after somebody is hurt.",
    },
    {
      id: "rest-between-reps", kind: "gauge", target: "rest-ratio-meter",
      title: "Set the rest between defensive reps",
      cue: "Commit when the rest reads long enough for the next rep to be full quality.",
      gauge: {
        label: "REST", speed: 0.6, green: [0.46, 0.66],
        readout: (t) => (t < 0.46 ? "too short — tired reps" : t <= 0.66 ? "enough for a quality rep" : "too long — cooling off"),
        missNote: "Outside the band. Too little rest and the next slides are sloppy and risky; too much and bodies cool down. Find the band and commit.",
      },
      why: "Defensive reps are short and intense, and quality falls off quickly without recovery. Setting a rest long enough for the next rep to be full quality, the work-to-rest balance youth development guidance recommends, keeps technique intact and hips and groins healthy, where running reps back to back only practises tired, dangerous footwork.",
    },
    {
      id: "log-the-defence", kind: "select", target: "practice-log-board",
      title: "Log the defensive block",
      cue: "Record the lanes cleared, the faults corrected, the rest used and the heated moment and how it was handled.",
      why: "A heated moment between players belongs in writing with how it was handled and by whom, so it can be followed up fairly and nobody relies on memory later. The corrections and rest used sit beside it, giving the next practice and the athletic trainer a clear record of what the players' legs did today.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: how the two players are now, what the trainer found on the ankle, and is everybody good to go on?",
      why: "The assistant separated the players, the athletic trainer looked at the ankle, and the head coach kept the drill running. Putting those threads together before the next block settles who talks to the two players and to the injured player's family, and keeps the adults working in view of each other as one staff.",
    },
  ],

  interrupts: [
    {
      id: "shove-after-a-closeout",
      kind: "Heated moment",
      after: "hold-the-stance", delay: 3, seconds: 12,
      alert: "After a hard closeout in the last rep, the shooter has shoved the defender in the chest and both are shouting, face to face, in front of the line.",
      cue: "Step in calmly and separate them to opposite ends of the bench — no audience, no lecture yet.",
      target: "separate-bench-ends",
      why: "Contact drills raise the temperature, and the first job of an adult when it boils over is distance, calmly. Sending the two players to opposite ends of the bench stops it escalating, keeps both in sight, and lets the coach speak to each privately once they are calm — correction done in the open and without humiliation, the way SafeSport guidance asks.",
      missNote: "Nobody stepped between them, the shouting became pushing, and half the line crowded in to watch. A scuffle in the middle of a contact drill puts every player around it at risk of a fall or a swing.",
      wrongNote: "That does not separate them. Opposite ends of the bench first; everything else once they are calm.",
    },
    {
      id: "defender-down-on-a-landing",
      kind: "Player down",
      after: "slide-rhythm", delay: 3, seconds: 12,
      alert: "A defender slid under a teammate's jump stop at the end of the lane, got stepped on and went down clutching an ankle.",
      cue: "Stop the slides and radio the athletic trainer — the player stays down and off the foot.",
      target: "trainer-radio",
      why: "A foot landing on another player's foot rolls ankles badly, and the injured player's instinct will be to hop up. Stopping the drill and calling the athletic trainer keeps the weight off, gets a proper assessment and ice started quickly, and follows the check, call, care habit of the American Red Cross first aid course.",
      missNote: "The slides carried on and the defender limped back into the lane to finish the drill. An ankle that took a landing can be badly sprained or worse, and walking on it has made the next few weeks longer.",
      wrongNote: "That does not help the ankle. Radio the athletic trainer and stop the slides.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBD_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBD_ACCENT, { emissive: o.color ?? BBD_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBD_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0a2012", accent: o.accent ?? BBD_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBD_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,26,14,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ecfbf0";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c6ecd0";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBD_ACCENT, { rough: 0.5, emissive: o.accent ?? BBD_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const cone = (parent, x, z, color = 0xff7a2a) => {
      const c = group(parent, x, 0, z);
      cyl(c, 0.02, 0.11, 0.26, 0, 0.13, 0, color, { rough: 0.6, seg: 12 });
      box(c, 0.2, 0.012, 0.2, 0, 0.006, 0, color, { rough: 0.6 });
      return c;
    };

    // ------------------------------------------------------------ slide lanes
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#1e3a26", base2: "#1a3321", seam: "rgba(4,12,6,0.55)",
    }), { repeat: 2, px: 384 });
    const lanes = box(g, 2.8, 0.02, 1.4, 0, 0.012, -1.2, 0x1e3a26, { rough: 0.95, cast: false });
    lanes.material = texturedMat(laneTex, { rough: 0.95, metal: 0.02, color: 0xc0e0c8 });
    for (const z of [-1.9, -1.2, -0.5]) box(g, 2.8, 0.006, 0.04, 0, 0.025, z, 0xf6f4ee, { rough: 0.6, cast: false });
    for (const [x, z] of [[-1.3, -1.55], [1.3, -1.55], [-1.3, -0.85], [1.3, -0.85]]) cone(g, x, z, 0x5ad07a);
    const footboard = box(g, 1.0, 0.18, 0.3, -2.1, 0.09, -2.35, 0x6b7078, { rough: 0.7, metal: 0.3 });
    bead(-2.1, 0.5, -2.35, "slide-bleacher-edge", "Bleacher footboard", { w: 0.36 });
    const endPad = box(g, 0.08, 1.2, 1.2, 3.1, 0.6, -1.2, 0x1f3a6b, { rough: 0.85 });
    void endPad;
    bead(2.85, 1.0, -1.2, "slide-wall-close", "Wall at the lane's end", { w: 0.4 });
    const bottles = [];
    for (let i = 0; i < 4; i++) bottles.push(cyl(g, 0.035, 0.035, 0.2, -0.6 + i * 0.4, 0.1, -0.2, [0x3a8fd0, 0xe0e4e8][i % 2], { rough: 0.5, seg: 10 }));
    bead(0.0, 0.45, -0.2, "slide-bottles", "Bottles on the slide path", { w: 0.44 });
    bead(-2.5, 0.3, -1.2, "slide-court-line", "Court line", { w: 0.24, r: 0.024, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ defenders and shooter
    const defenders = [
      standingFigure(g, -0.9, -1.55, { ry: 0, cloth: 0x2a6a3a, trousers: 0x1a2a1e, atStation: true }),
      standingFigure(g, 0.6, -0.85, { ry: 0, cloth: 0x2a6a3a, trousers: 0x1a2a1e, atStation: true }),
    ];
    for (const d of defenders) { d.userData.body.position.y = -0.14; }
    const shooter = standingFigure(g, 1.2, -2.5, { ry: 0, cloth: 0xf2f2f2, trousers: 0x1a2a1e, atStation: true });
    bead(-0.7, 0.18, -1.35, "fault-crossing-feet", "Crossed feet", { w: 0.28, r: 0.024 });
    bead(0.82, 1.62, -0.8, "fault-standing-up", "Standing up", { w: 0.28, r: 0.024 });
    bead(-1.2, 1.0, -1.65, "fault-lunging", "Lunging", { w: 0.24, r: 0.024 });
    bead(-0.9, 1.9, -1.55, "fault-loud-talk", "Calling screens", { w: 0.32, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ technique props
    card(-1.35, 1.4, -2.9, "active-hands-card", "Active hands", "FEET MOVE ·\nHANDS STAY UP", { w: 0.3 });
    const ladder = group(g, -2.35, 0, -1.3, 0.8);
    cyl(ladder, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["stance-wide-base", "1 · Wide base", 0.62], ["stance-hips-low", "2 · Hips low, chest up", 0.9],
      ["stance-on-the-balls", "3 · On the balls", 1.18], ["stance-active-hands", "4 · Hands up", 1.46],
    ]) {
      const b = ball(ladder, 0.028, 0, y, 0, BBD_ACCENT, { emissive: BBD_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.24, y, 0, { css: BBD_CSS, w: 0.42 });
      reg(hits, b, lid);
    }
    stand(-0.2, -2.55, 0, 0.95);
    bead(-0.2, 1.1, -2.55, "stance-hold-marker", "Hold the stance", { w: 0.32 });
    const sStand = stand(-1.6, 0.2, 0.4);
    const slides = instrument(sStand, 0, 1.02, 0, { idle: "SLIDES", color: BBD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(sStand, "Slide rhythm", 0, 1.22, 0, { css: BBD_CSS, w: 0.26 });
    reg(hits, slides, "slide-meter");
    const cStand = stand(1.9, -2.2, -0.4);
    const closeout = instrument(cStand, 0, 1.02, 0, { idle: "CHOP", color: BBD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Closeout chop", 0, 1.22, 0, { css: BBD_CSS, w: 0.28 });
    reg(hits, closeout, "closeout-meter");
    const hipBase = group(g, 0.25, 0, -1.55);
    const hipDial = cyl(hipBase, 0.14, 0.14, 0.02, 0, 0.03, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 18 });
    const hipArrow = box(hipBase, 0.05, 0.012, 0.24, 0, 0.05, 0.08, BBD_ACCENT, { emissive: BBD_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    holoTag(hipBase, "Hip turn", 0, 0.22, 0, { css: BBD_CSS, w: 0.2 });
    reg(hits, hipDial, "hip-turn-dial");
    const coCone = cone(g, 1.8, 0.6, 0xf2c14b);
    holoTag(coCone, "Closeout cone", 0, 0.42, 0, { css: BBD_CSS, w: 0.28 });
    reg(hits, coCone, "closeout-cone");
    const coSocket = box(g, 0.3, 0.008, 0.3, 1.2, 0.03, -2.05, BBD_ACCENT, { emissive: BBD_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "A step short", 1.2, 0.2, -2.05, { css: BBD_CSS, w: 0.24 });
    reg(hits, coSocket, "closeout-socket");
    const closeSeq = group(g, 2.45, 0, 0.2, -1.0);
    cyl(closeSeq, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["close-sprint", "Sprint", 0.8], ["close-chop", "Chop the feet", 1.05], ["close-high-hand", "High hand", 1.3]]) {
      const b = ball(closeSeq, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(closeSeq, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.28 });
      reg(hits, b, lid);
    }
    card(0.55, 1.45, -2.95, "landing-space-card", "The shooter's landing", "NEVER UNDER ·\nNEVER INTO", { w: 0.38, accent: "#f2c14b", css: "#f2c14b" });
    const rStand = stand(-2.95, 0.9, 0.9);
    const rest = instrument(rStand, 0, 1.02, 0, { idle: "REST", color: BBD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(rStand, "Rest between reps", 0, 1.22, 0, { css: BBD_CSS, w: 0.34 });
    reg(hits, rest, "rest-ratio-meter");

    // ------------------------------------------------------------ bench, kit, boards
    const bench = group(g, -1.3, 0, 1.95);
    box(bench, 2.2, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-1.0, 1.0]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const endA = box(g, 0.3, 0.012, 0.3, -2.4, 0.01, 1.5, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.6, cast: false });
    const endB = box(g, 0.3, 0.012, 0.3, -0.2, 0.01, 1.5, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.6, cast: false });
    void endA; void endB;
    bead(-1.3, 0.8, 1.55, "separate-bench-ends", "Opposite ends of the bench", { color: 0x59c97b, css: "#59c97b", w: 0.5 });
    const kit = group(g, 2.7, 0, 1.9);
    box(kit, 0.5, 0.32, 0.32, 0, 0.16, 0, 0xd8261e, { rough: 0.6 });
    box(kit, 0.14, 0.04, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    box(kit, 0.04, 0.14, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    const radio = box(kit, 0.07, 0.16, 0.04, 0.2, 0.42, 0, 0x1a1e23, { rough: 0.5 });
    holoTag(kit, "Athletic trainer's radio", 0.1, 0.66, 0, { css: "#f2c14b", w: 0.44 });
    reg(hits, radio, "trainer-radio");
    const log = board(0.6, 0.36, 1.5, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Lanes cleared · corrections", "Rest used · heated moment"]));
    log.position.set(-0.45, 1.75, -3.25);
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, 0.9, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.2, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const hoodies = box(g, 0.4, 0.1, 0.3, 1.5, 0.05, 1.1, 0x5a5a6a, { rough: 0.95 });
    void hoodies;

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.8, 1.25, 0.45, "slides-by-the-bleachers", "Slide along the bleachers?", "LANE ON THE\nFOOTBOARDS", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "slides-until-someone-quits", "Slides until someone quits?", "SLIDE TILL\nSOMEONE QUITS", 0.1);
    hazardCard(0.6, 1.25, 1.2, "closeout-into-landing", "Sprint right at the shooter?", "FLY AT\nTHE SHOOTER", -0.1);
    hazardCard(1.6, 1.25, 1.25, "sweatshirts-to-work-harder", "Sweatshirts on to work harder?", "HOODIES ON\nSWEAT IT OUT", -0.3);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.45, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.45, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a6a3a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void footboard;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "space-for-slides") { footboard.position.z = -2.8; for (const b of bottles) b.visible = false; }
        if (step.id === "open-the-hips") hipArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.7, rough: 0.5 });
        if (step.id === "set-the-closeout-cone") coCone.position.set(1.2, 0, -2.05);
        if (step.id === "log-the-defence") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Lanes clear · rest in band", "Heated moment handled calmly"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "shove-after-a-closeout") {
          shooter.position.set(1.25, 0, -2.1); shooter.rotation.y = Math.PI;
          defenders[1].position.set(1.25, 0, -1.6); defenders[1].rotation.y = 0;
        }
        if (it.id === "defender-down-on-a-landing") {
          const b = defenders[0].userData.body;
          b.rotation.x = -Math.PI / 2; b.position.y = 0.16;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "shove-after-a-closeout") {
          shooter.position.set(-2.4, 0, 1.45); shooter.rotation.y = 0.3;
          defenders[1].position.set(-0.2, 0, 1.45); defenders[1].rotation.y = -0.3;
          assistant.position.set(-1.3, 0, 1.2); assistant.rotation.y = Math.PI;
        }
        if (it.id === "defender-down-on-a-landing") {
          trainer.position.set(-0.4, 0, -1.1); trainer.rotation.y = -2.6;
          const b = defenders[0].userData.body;
          b.rotation.x = -1.1; b.position.y = 0.3;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (session?.step?.id === "slide-rhythm") defenders[1].position.x = 0.6 + Math.sin(t * 2.4) * 0.35;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "chop-the-closeout") {
          const ok = gg.t >= 0.44 && gg.t <= 0.6;
          repaint(closeout.userData.screen, signFace(ok ? "CONTROLLED" : gg.t < 0.44 ? "TOO EARLY" : "FLYING IN", { bg: "#0a2012", accent: ok ? "#59c97b" : "#f0645b", fg: "#ecfbf0", scale: 0.46 }));
        }
        if (gg && !gg.committed && session.step?.id === "rest-between-reps") {
          const ok = gg.t >= 0.46 && gg.t <= 0.66;
          repaint(rest.userData.screen, signFace(ok ? "RESTED" : gg.t < 0.46 ? "TOO SHORT" : "COOLING", { bg: "#0a2012", accent: ok ? "#59c97b" : "#f0645b", fg: "#ecfbf0", scale: 0.48 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "slide-rhythm") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(slides.userData.screen, signFace(ok ? "PUSH · SLIDE" : tr.v < 0.4 ? "STANDING" : "CROSSING", { bg: "#0a2012", accent: ok ? "#59c97b" : "#f0645b", fg: "#ecfbf0", scale: 0.46 }));
        }
      },
    };
  },
};
