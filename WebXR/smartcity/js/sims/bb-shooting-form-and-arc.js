import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station five: shooting form and
// arc. A portable practice hoop inspected and cranked to the right height
// for the age group, the ball sized to the hands, the shot built from the
// feet (balance, eyes, elbow, follow-through), one-hand form shots close in,
// the arc held in a band that actually drops through a rim, the release
// timed at the top of the jump, the lane kept clear under the basket, and a
// shot count with rest instead of a block that goes on until the arms go.
//
// Sited generically in the gym-court district; the team and players are
// invented. No rule number or dimension is quoted as a rule.

const BBS_ACCENT = 0xff7a3b;
const BBS_CSS = "#ff7a3b";

export const SIM_BB_SHOOTING_FORM_AND_ARC = {
  id: "bb-shooting-form-and-arc",
  index: "335",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on ball size and rim height scaled to age, shooting progressions and managing repetition with rest; NFHS guidance on equipment in safe condition and padded goal supports; CDC Heads Up for a knock to the head under a crowded rim; the U.S. Center for SafeSport for observable, encouraging correction; the American Red Cross first aid course for a player down under the basket",
  name: "Shooting Form and Arc",
  title: simTitle("Shooting Form and Arc"),
  tagline: "A practice hoop inspected and set to the right height, the ball sized to the hands, the shot built from balance up, the arc held in a band that drops, the release timed at the top, the lane clear and a shot count with rest",
  accent: BBS_ACCENT,
  accentCss: BBS_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "nothing-but-arc", name: "Nothing but Arc", note: "The shot built right, the arc and release in band, and nobody under the rim or shooting on empty" },

  supportLine: "your league's coach coordinator, or the athletic trainer who took the player from you — a player down at your practice is worth a conversation afterwards",

  game: system({
    name: "Shot Chart",
    currency: "MAKES",
    ranks: ["Rebounder", "Shooting Helper", "Assistant Coach", "Shooting Coach", "Skills Director"],
    badges: [
      { id: "safe-hoop", name: "Safe Hoop", note: "Every defect on the practice hoop found first time", test: AWARD.stepClean("inspect-the-hoop") },
      { id: "clear-lane", name: "Clear Lane", note: "No unsafe action in the whole shooting block", test: AWARD.safe },
      { id: "true-arc", name: "True Arc", note: "Arc and release timing both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-form", name: "Clean Form", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "steady-arc", name: "Steady Arc", note: "Held the arc in band the whole time", test: AWARD.unbroken },
      { id: "quick-release", name: "Quick Release", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "rebounders-under-the-rim": "You let three rebounders crowd under the rim while shooters kept shooting. Every missed shot comes down among them, every rebounder jumps with eyes on the ball, and a shooter landing into the lane lands among them too — heads, elbows and ankles all meeting in one small space.",
    "shoot-until-arms-go": "You set the block to keep shooting until the arms gave out. Form breaks down first when a young shooter is tired, so the last hundred shots teach the wrong mechanics, and high-repetition shooting with no rest is the load youth guidelines warn builds sore shoulders, elbows and wrists.",
    "balls-under-the-basket": "You left missed balls lying under the basket. The landing zone of every jump shot and every rebound is exactly where they come to rest, and a foot coming down on a ball is how an ankle rolls under the rim.",
    "shoot-in-the-hot-corner": "You kept the shooting block going in the unventilated corner with no water between rounds. Shooting feels light work, so young players do not notice how much they are sweating in a warm corner of the gym — until they are dizzy at the free throw line.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the shooting block once it has run and the follow-through is held — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "inspect-the-hoop", kind: "find", noHint: true,
      targets: ["hoop-loose-rim", "hoop-torn-net", "hoop-unpadded-base"],
      itemNames: {
        "hoop-loose-rim": "a rim that rattles on its bracket",
        "hoop-torn-net": "a net torn and hanging",
        "hoop-unpadded-base": "the portable hoop's base with its pad missing",
      },
      itemNotes: {
        "hoop-loose-rim": "A loose rim sends shots flying unpredictably and can let go under a hanging player. Tag it out until it is tightened.",
        "hoop-torn-net": "A torn net catches fingers on follow-throughs and snags on rebounds. Replace it before anyone shoots.",
        "hoop-unpadded-base": "The base of a portable hoop is steel at shin and knee height right where drives end. The pad goes back on first.",
      },
      decoyNotes: {
        "hoop-scuffed-board": "Scuffs on the backboard are cosmetic. Look for what would hurt a shooter or rebounder.",
      },
      title: "Inspect the practice hoop before anybody shoots",
      cue: "Check the rim, the net and the base. Mark everything that has to be fixed first.",
      why: "A portable practice hoop takes a beating, and its defects hurt people in predictable ways: a loose rim gives way or throws shots wild, a torn net snags fingers, an unpadded base is bare steel exactly where a driving player's shins end up. School-sport guidance asks for goal supports to be padded and equipment in safe condition, and a coach who checks at the start of every block keeps it that way.",
    },
    {
      id: "size-ball-and-rim", kind: "select", target: "age-size-card",
      title: "Match the ball and rim to the age group",
      cue: "Post today's setting: the smaller ball and the lower rim for this age group.",
      why: "Youth development guidance scales the ball and the rim to the player for the same reason a child learns to write with a pencil their hand can hold. A ball too big for small hands and a rim too high for young legs force a shove from the chest that teaches the wrong shot for years; the right size lets a young player shoot with real form and actually see it go in.",
    },
    {
      id: "crank-the-rim", kind: "turn", target: "height-crank",
      title: "Crank the practice hoop down to the age setting",
      cue: "Turn the height crank until the rim sits at the setting on the card.",
      turn: { turns: 1, axis: "z", label: "RIM HEIGHT" },
      why: "An adjustable portable hoop is only useful if somebody adjusts it. Cranking the rim to the age setting before the block — and locking it — lets every shooter use the legs-to-fingertips motion the rest of the station teaches, and the crank is turned by the coach with nobody under the board.",
    },
    {
      id: "build-the-shot", kind: "sequence",
      targets: ["form-balance", "form-eyes", "form-elbow", "form-follow-through"],
      itemNames: {
        "form-balance": "balance: feet set, knees bent",
        "form-eyes": "eyes on the front of the rim",
        "form-elbow": "elbow under the ball",
        "form-follow-through": "follow through, wrist relaxed",
      },
      title: "Build the shot from balance up",
      cue: "Balance first, then eyes on the rim, then the elbow under the ball, then the follow-through.",
      why: "Shooting form is built from the floor up because power comes from the legs and accuracy from a straight line through the elbow. Balance gives a stable base, eyes fix the target, an elbow under the ball keeps the line straight, and a relaxed follow-through puts soft backspin on the ball. Coached in that order, young shooters stop heaving from the chest and start shooting with their whole body.",
      outOfOrderNote: "Out of order. Feet and balance first — an elbow or a follow-through built on a wobbling base will not hold up when the shot gets longer.",
    },
    {
      id: "form-shots", kind: "hold", target: "form-shot-marker", seconds: 7,
      title: "Run one-hand form shots close to the rim",
      cue: "Keep the group on one-hand form shots right in front of the rim — hold the drill here while you watch every elbow.",
      why: "One-hand form shots close in strip the shot down to the shooting hand and the line, with no distance to hide a flaw behind. Holding the group on them before anyone moves out is where a coach sees each elbow, wrist and follow-through clearly, and where young shooters feel the ball roll off their fingers correctly and drop.",
      holdBreakNote: "The group drifted back out to long shots too early. Bring them in close and hold form shooting until the line is right.",
    },
    {
      id: "shot-arc", kind: "track", target: "arc-meter", seconds: 8,
      title: "Hold the shot arc in the band that drops",
      cue: "Keep the arc up in band — high enough to drop through the rim, not a flat line, not a moon ball.",
      track: {
        start: 0.25, green: [0.42, 0.62], rise: 0.55, fall: 0.44, drift: 0.14, label: "ARC",
        readout: (v) => (v < 0.42 ? "flat — hits the front rim" : v > 0.62 ? "moon ball — no control" : "good arc — drops through"),
      },
      why: "A flat shot meets the rim almost edge-on and has a tiny target; a shot with a real arc drops through a rim that looks much bigger from above. Too high and control disappears. Holding young shooters in the band — up, over and down — builds the habit of lifting the ball with the legs rather than pushing it on a line, which is also what keeps shoulders from doing all the work.",
      holdBreakNote: "The arc left the band — flattening out, or turning into a moon ball. Bring it back to up, over and down.",
    },
    {
      id: "release-timing", kind: "gauge", target: "release-meter",
      title: "Time the release at the top of the jump",
      cue: "Commit when the release reads right at the top — not on the way up, not on the way down.",
      gauge: {
        label: "RELEASE", speed: 0.7, green: [0.46, 0.6],
        readout: (t) => (t < 0.46 ? "early — shoving on the way up" : t <= 0.6 ? "at the top" : "late — falling away"),
        missNote: "Off the top. Early and the arms shove it; late and the shooter is falling and the legs have given nothing. Find the top and commit.",
      },
      why: "A jump shot released at the top of the jump uses the legs for power and meets a still body for accuracy. Released on the way up, the arms shove the ball; released on the way down, the shooter is falling and the shot comes up short or fades. Timing the release is what connects the legs to the arc — and a shooter at the top is also not landing into a defender or rebounder mid-shot.",
    },
    {
      id: "clear-the-lane", kind: "drag", target: "ball-cart",
      title: "Move the ball cart out from under the basket",
      cue: "Roll the ball cart out of the lane to its spot beside the baseline.",
      drag: { to: "cart-socket", radius: 0.5, missNote: "Still in the landing zone. The cart goes all the way out to its spot beside the baseline." },
      why: "Under the basket is where shooters land, rebounders jump and missed balls collect. A ball cart parked there is steel at knee height in the busiest square metre of the drill; moving it out to the baseline, and racking missed balls into it, keeps the landing zone clear for every jump.",
    },
    {
      id: "find-the-flaws", kind: "find", noHint: true,
      targets: ["fault-thumb-flick", "fault-elbow-flare", "fault-fading-back"],
      itemNames: {
        "fault-thumb-flick": "the guide-hand thumb flicking the ball",
        "fault-elbow-flare": "the shooting elbow flaring out to the side",
        "fault-fading-back": "a shooter fading back on every shot",
      },
      itemNotes: {
        "fault-thumb-flick": "The guide hand steadies the ball and leaves; a flicking thumb puts side-spin on it. Cue 'guide hand quiet'.",
        "fault-elbow-flare": "An elbow out to the side throws the line off. Cue 'elbow under the ball, point it at the rim'.",
        "fault-fading-back": "Fading on every shot costs power and lands the shooter off balance. Cue 'jump straight up, land where you took off'.",
      },
      decoyNotes: {
        "fault-high-release": "A high release point is a good habit, not a flaw. Look for the thumb, the elbow and the landing.",
      },
      title: "Find the flaws worth fixing",
      cue: "Watch the shooters. Mark each habit that needs a correction now.",
      why: "Most shooting problems in young players come from three habits: a guide hand that pushes, an elbow that flares, and a body that fades away. Each one bends the line the ball travels on, and the fade also lands a shooter off balance among rebounders. Naming one cue per player, calmly and in view of the group, fixes more than a speech about everything at once.",
    },
    {
      id: "shooting-progression", kind: "sequence", anyOrder: true,
      targets: ["prog-form-close", "prog-mid-range", "prog-catch-and-shoot"],
      itemNames: {
        "prog-form-close": "form shots close in",
        "prog-mid-range": "mid-range from the elbows",
        "prog-catch-and-shoot": "catch-and-shoot off a pass",
      },
      title: "Walk the shooting progression",
      cue: "Form shots close in, mid-range from the elbows, catch-and-shoot off a pass — a short set of each.",
      why: "Distance and movement are added only once the form holds, because every step out adds power the form has to carry. A short set at each stage — close, mid-range, off the catch — keeps the mechanics honest and the repetitions sharp, which is the progression youth development guidance recommends for every skill.",
    },
    {
      id: "count-and-rest", kind: "select", target: "shot-count-board",
      title: "Set a shot count with rest between rounds",
      cue: "Post today's plan: a fixed number of shots per round, water and rest between rounds.",
      why: "Shooting feels like light work, so it is the drill most likely to run long. A fixed shot count per round, with rest and water between rounds, keeps every shot a good one, spreads load across shoulders and wrists, and fits the youth guidance to manage repetition rather than measure effort by how long players can keep going.",
    },
    {
      id: "hold-the-follow-through", kind: "hold", target: "follow-through-marker", seconds: 5,
      title: "Hold the follow-through until the ball lands",
      cue: "Every shooter holds the follow-through — wrist relaxed, fingers pointing at the rim — until the ball hits the rim or the net.",
      why: "Holding the follow-through makes the release visible: a straight wrist with the fingers pointing at the rim shows the line was true, and a twisted one shows why it missed. It is also the moment a shooter is standing still and balanced rather than drifting into the lane, which keeps the landing zone quiet for rebounders.",
      holdBreakNote: "The follow-through dropped before the ball landed. Hold the wrist up until the ball reaches the rim.",
    },
    {
      id: "log-the-shooting", kind: "select", target: "practice-log-board",
      title: "Log the shooting block",
      cue: "Record the hoop fixes, the rim height used, shot counts and the cue each shooter is working on.",
      why: "The rim height used, the shot count and one cue per shooter are the three things the next practice needs to pick up where this one ended. Written down with the hoop fixes and anything the athletic trainer saw, they also show the load each player carried, which matters when a shoulder starts to ache later in the season.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: anything either of you saw under the rim, and are all three of you good to carry on?",
      why: "The assistant rebounded and watched the lane, the athletic trainer handled the player who went down, and the head coach was watching form. A short check-in pools those three views, agrees what the parents of the injured player will be told and by whom, and keeps the staff working as a team in the open.",
    },
  ],

  interrupts: [
    {
      id: "rebounder-down-under-the-rim",
      kind: "Player down",
      after: "form-shots", delay: 3, seconds: 12,
      alert: "A rebounder and a shooter came down together under the rim. The rebounder is on the floor holding a knee and has not got up.",
      cue: "Stop the shooting and radio the athletic trainer — the player stays where they are until they are checked.",
      target: "trainer-radio",
      why: "A player who stays down after a collision needs a trained assessment before anyone moves them or they try to stand. Stopping the drill clears the rim, the radio gets the athletic trainer there fast, and the coach keeps the player still and calm — check, call, care, as the American Red Cross first aid course teaches — until the trainer takes over.",
      missNote: "Shooters kept shooting over the player on the floor, and the rebounder struggled up and limped off alone. A knee that stayed down after a collision may be more than a knock, and missed balls were still landing around them while they tried.",
      wrongNote: "That is not the call. Radio the athletic trainer and stop the shooting.",
    },
    {
      id: "fire-alarm-at-the-hoop",
      kind: "Fire alarm",
      after: "shot-arc", delay: 3, seconds: 12,
      alert: "The fire alarm is sounding and the exit strobe is flashing with shooters mid-shot and balls still in the air.",
      cue: "Balls down, everybody out through the marked fire exit, headcount outside against the check-in sheet.",
      target: "fire-exit-door",
      why: "An alarm ends the drill instantly: balls dropped where they are, no one going to fetch a bag, everyone out through the marked exit with an adult at the front and back, and a headcount outside. Leaving the balls on the floor is fine — nobody is coming back through that door until it is safe.",
      missNote: "Two shooters stayed to take one more shot and a rebounder went back for their bottle. By the time the group was outside, the headcount was two short and nobody knew where they were.",
      wrongNote: "The alarm comes first. Balls down and everybody to the marked fire exit.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBS_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBS_ACCENT, { emissive: o.color ?? BBS_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBS_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#24120a", accent: o.accent ?? BBS_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBS_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(30,14,6,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff1e8";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#f6d6c4";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBS_ACCENT, { rough: 0.5, emissive: o.accent ?? BBS_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.12) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the shooting key
    const keyTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#5a2418", base2: "#521f15", seam: "rgba(20,6,4,0.5)",
    }), { repeat: 2, px: 384 });
    const key = box(g, 1.8, 0.02, 2.2, 0, 0.012, -1.5, 0x5a2418, { rough: 0.9, cast: false });
    key.material = texturedMat(keyTex, { rough: 0.9, metal: 0.02, color: 0xe0c0b0 });
    box(g, 1.8, 0.006, 0.05, 0, 0.025, -0.4, 0xf6f4ee, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the portable hoop
    const hoop = group(g, 0, 0, -2.95);
    const base = box(hoop, 1.0, 0.3, 0.7, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const basePad = box(hoop, 1.04, 0.34, 0.08, 0, 0.17, 0.17, 0x1f3a6b, { rough: 0.85 });
    basePad.visible = false;
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    const head = group(hoop, 0, 0.3, 0);
    box(head, 0.06, 0.06, 0.5, 0, 2.3, 0.05, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    const boardMesh = box(head, 1.2, 0.72, 0.04, 0, 2.3, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    box(head, 0.4, 0.3, 0.045, 0, 2.18, 0.31, 0xf4f4f4, { rough: 0.5, emissive: 0xffffff, ei: 0.2, cast: false });
    const rim = torus(head, 0.2, 0.012, 0, 2.03, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    const net = cyl(head, 0.2, 0.13, 0.36, 0, 1.84, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });
    net.scale.y = 0.6;
    bead(0.35, 2.05, -2.4, "hoop-loose-rim", "Loose rim", { w: 0.24, r: 0.025 });
    bead(-0.3, 1.85, -2.4, "hoop-torn-net", "Torn net", { w: 0.24, r: 0.025 });
    bead(0.6, 0.45, -2.8, "hoop-unpadded-base", "Base — no pad", { w: 0.3, r: 0.025 });
    const scuff = decal(head, 0.2, 0.1, 0.4, 2.5, 0.33, signFace("", { bg: "#b8c0c8", accent: "#8a9098", scale: 0.2 }), { px: 64, transparent: true });
    holoTag(g, "Scuffed board", 0.4, 2.95, -2.6, { css: "#7fc4d8", w: 0.26 });
    reg(hits, scuff, "hoop-scuffed-board");
    void boardMesh;
    const crank = group(hoop, 0.08, 1.0, -0.2);
    const crankArm = box(crank, 0.04, 0.2, 0.04, 0, 0, 0.08, 0xdfe4e8, { rough: 0.4, metal: 0.6 });
    const crankHub = cyl(crank, 0.05, 0.05, 0.05, 0, 0, 0.04, 0x2b3138, { rough: 0.4, metal: 0.5, seg: 14 });
    crankHub.rotation.x = Math.PI / 2;
    holoTag(g, "Rim height crank", 0.5, 1.2, -3.0, { css: BBS_CSS, w: 0.32 });
    reg(hits, crankHub, "height-crank");
    void crankArm; void base;

    // ------------------------------------------------------------ shooter, arc, meters
    const shooter = standingFigure(g, 0.0, -0.55, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x2a1a14, atStation: true });
    const rebounder = standingFigure(g, -0.55, -2.0, { ry: 0.3, cloth: 0x8a3a1a, trousers: 0x2a1a14, atStation: true });
    const shotBall = basketball(g, 0.0, 1.9, -0.7, 0.1);
    const arcDots = [];
    for (let i = 1; i < 9; i++) {
      const k = i / 9;
      arcDots.push(ball(g, 0.02, 0, 1.9 + Math.sin(k * Math.PI) * 0.8 + k * 0.35, -0.7 - k * 1.7, BBS_ACCENT, { emissive: BBS_ACCENT, ei: 1.2, seg: 8, cast: false }));
    }
    const aStand = stand(1.1, -0.9, -0.3);
    const arc = instrument(aStand, 0, 1.02, 0, { idle: "ARC", color: BBS_ACCENT, w: 0.2, d: 0.26 });
    holoTag(aStand, "Shot arc", 0, 1.22, 0, { css: BBS_CSS, w: 0.24 });
    reg(hits, arc, "arc-meter");
    const rStand = stand(-1.1, -0.9, 0.3);
    const release = instrument(rStand, 0, 1.02, 0, { idle: "RELEASE", color: BBS_ACCENT, w: 0.2, d: 0.26 });
    holoTag(rStand, "Release timing", 0, 1.22, 0, { css: BBS_CSS, w: 0.3 });
    reg(hits, release, "release-meter");
    stand(0.75, -1.9, 0, 0.9);
    bead(0.75, 1.05, -1.9, "form-shot-marker", "One-hand form shots", { w: 0.42 });
    bead(-0.35, 2.0, -0.45, "follow-through-marker", "Hold the follow-through", { w: 0.44 });

    // ------------------------------------------------------------ form ladder, progression
    const formLadder = group(g, -2.3, 0, -2.2, 0.4);
    cyl(formLadder, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["form-balance", "1 · Balance", 0.62], ["form-eyes", "2 · Eyes on the rim", 0.9],
      ["form-elbow", "3 · Elbow under", 1.18], ["form-follow-through", "4 · Follow through", 1.46],
    ]) {
      const b = ball(formLadder, 0.028, 0, y, 0, BBS_ACCENT, { emissive: BBS_ACCENT, ei: 1.5, seg: 12 });
      holoTag(formLadder, label, 0.24, y, 0, { css: BBS_CSS, w: 0.4 });
      reg(hits, b, lid);
    }
    const prog = group(g, 2.4, 0, -1.3, -0.9);
    cyl(prog, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["prog-form-close", "Form shots, close", 0.8], ["prog-mid-range", "Mid-range, elbows", 1.05], ["prog-catch-and-shoot", "Catch and shoot", 1.3]]) {
      const b = ball(prog, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(prog, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.36 });
      reg(hits, b, lid);
    }
    card(-1.35, 1.4, -2.9, "age-size-card", "Ball and rim for the age", "SMALLER BALL\nLOWER RIM", { w: 0.42 });
    bead(0.3, 1.62, -0.45, "fault-thumb-flick", "Thumb flick", { w: 0.26, r: 0.024 });
    bead(-0.3, 1.35, -0.4, "fault-elbow-flare", "Elbow flare", { w: 0.26, r: 0.024 });
    bead(0.25, 0.2, -0.35, "fault-fading-back", "Fading back", { w: 0.28, r: 0.024 });
    bead(0.0, 2.25, -0.55, "fault-high-release", "High release", { w: 0.28, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ cart, bench, exit, kit
    const cart = group(g, -0.5, 0, -2.45);
    box(cart, 0.6, 0.04, 0.45, 0, 0.3, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.28, 0.28]) box(cart, 0.03, 0.36, 0.45, sx, 0.48, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) basketball(cart, -0.14 + i * 0.14, 0.44, 0);
    holoTag(cart, "Ball cart", 0, 0.8, 0, { css: BBS_CSS, w: 0.22 });
    reg(hits, cart, "ball-cart");
    const cSocket = box(g, 0.6, 0.008, 0.5, -2.2, 0.01, -1.0, BBS_ACCENT, { emissive: BBS_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Cart spot — baseline", -2.2, 0.22, -1.0, { css: BBS_CSS, w: 0.4 });
    reg(hits, cSocket, "cart-socket");
    const strayBalls = [basketball(g, 0.5, 0.12, -2.2), basketball(g, -0.2, 0.12, -1.95)];
    const shotBoard = board(0.56, 0.36, -3.0, 1.66, -0.2, (cx, w, h) => lines(cx, w, h, "SHOT PLAN", ["Shots per round: fixed", "Water · rest between rounds"]), { ry: 1.1 });
    reg(hits, shotBoard.userData.face, "shot-count-board");
    const log = board(0.6, 0.36, 1.45, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Hoop fixes · rim height", "Shot counts · one cue each"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const kit = group(g, 2.7, 0, 1.9);
    box(kit, 0.5, 0.32, 0.32, 0, 0.16, 0, 0xd8261e, { rough: 0.6 });
    box(kit, 0.14, 0.04, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    box(kit, 0.04, 0.14, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    const radio = box(kit, 0.07, 0.16, 0.04, 0.2, 0.42, 0, 0x1a1e23, { rough: 0.5 });
    holoTag(kit, "Athletic trainer's radio", 0.1, 0.66, 0, { css: "#f2c14b", w: 0.44 });
    reg(hits, radio, "trainer-radio");
    const exit = group(g, -3.45, 0, 1.3, Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.8, 1.25, 0.3, "rebounders-under-the-rim", "Crowd the rebounders in?", "THREE UNDER\nTHE RIM", 0.4);
    hazardCard(-0.6, 1.25, 1.15, "shoot-until-arms-go", "Shoot until the arms go?", "UNTIL THE\nARMS GIVE OUT", 0.1);
    hazardCard(0.6, 1.25, 1.15, "balls-under-the-basket", "Leave balls under the rim?", "LEAVE THE\nMISSES", -0.1);
    hazardCard(1.85, 1.25, 0.35, "shoot-in-the-hot-corner", "Keep going in the hot corner?", "HOT CORNER\nNO WATER", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.4, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.4, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x8a3a1a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.85, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.85, { css: "#f2c14b", w: 0.34 });
    void coach; void assistant;

    let tick = 0;
    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.4, -1.6),

      onStepComplete(step) {
        if (step.id === "inspect-the-hoop") { basePad.visible = true; net.scale.y = 1; }
        if (step.id === "crank-the-rim") head.position.y = 0.05;
        if (step.id === "clear-the-lane") { cart.position.set(-2.2, 0, -1.0); for (const b of strayBalls) b.visible = false; }
        if (step.id === "log-the-shooting") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Rim at the age setting", "Rounds with rest and water"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "rebounder-down-under-the-rim") {
          const b = rebounder.userData.body;
          b.rotation.x = -Math.PI / 2; b.position.y = 0.16;
        }
        if (it.id === "fire-alarm-at-the-hoop") {
          strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
          shotBall.position.set(0.3, 0.1, -1.2);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rebounder-down-under-the-rim") {
          trainer.position.set(-0.2, 0, -1.4); trainer.rotation.y = -2.6;
          const b = rebounder.userData.body;
          b.rotation.x = -1.1; b.position.y = 0.3;
        }
        if (it.id === "fire-alarm-at-the-hoop") { exitLeaf.rotation.y = 1.2; exitLeaf.position.x = -0.35; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        tick = (tick + 1) % 9;
        for (let i = 0; i < arcDots.length; i++) arcDots[i].visible = ((Math.floor(t * 6) + i) % 8) < 6;
        if (session?.step?.id === "crank-the-rim") crank.rotation.z = t * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "release-timing") {
          const ok = gg.t >= 0.46 && gg.t <= 0.6;
          repaint(release.userData.screen, signFace(ok ? "AT THE TOP" : gg.t < 0.46 ? "EARLY" : "LATE", { bg: "#24120a", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff1e8", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "shot-arc") {
          const ok = tr.v >= 0.42 && tr.v <= 0.62;
          repaint(arc.userData.screen, signFace(ok ? "GOOD ARC" : tr.v < 0.42 ? "FLAT" : "MOON BALL", { bg: "#24120a", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff1e8", scale: 0.48 }));
          for (let i = 0; i < arcDots.length; i++) {
            const k = (i + 1) / 9;
            arcDots[i].position.y = 1.9 + Math.sin(k * Math.PI) * (0.3 + tr.v * 1.2) + k * 0.35;
          }
        }
      },
    };
  },
};
