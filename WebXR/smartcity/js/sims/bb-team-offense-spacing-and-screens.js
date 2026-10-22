import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station nine: team offence,
// spacing and screens. Five spots on the floor, the action drawn before it
// is run, a player moved back to proper spacing, an on-ball screen built in
// order and held still, spacing and screen angle read, the ball kept moving,
// illegal and dangerous screens spotted, the screener's reads walked, a
// substitution plan with water in it, and screen contact kept firm rather
// than a hit.
//
// Sited generically in the gym-court district; the team, the players and the
// parent are invented. No rule number or distance is quoted as a rule.

const BBO_ACCENT = 0x6fa8ff;
const BBO_CSS = "#6fa8ff";

export const SIM_BB_TEAM_OFFENSE_SPACING_AND_SCREENS = {
  id: "bb-team-offense-spacing-and-screens",
  index: "339",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on age-appropriate team concepts, equal playing time and rest; NFHS basketball rules on legal screens — stationary, within the screener's own space, and room given to a player screened from behind; CDC Heads Up for the head knocks an illegal screen can cause; the U.S. Center for SafeSport for a programme's photo and filming policy and adults kept in view; the American Red Cross first aid course for a player hurt on a screen",
  name: "Team Offense: Spacing and Screens",
  title: simTitle("Team Offense: Spacing and Screens"),
  tagline: "Five spots on the floor, the action drawn first, spacing fixed, an on-ball screen built and held still, the ball kept moving, illegal and blind screens caught, the reads walked, and a rotation with water in it",
  accent: BBO_ACCENT,
  accentCss: BBO_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "legal-and-spaced", name: "Legal and Spaced", note: "Every screen legal and still, every player on a spot, and every player rotated and watered" },

  supportLine: "your league's coach coordinator, or the assistant who handled the camera at the door — a conversation with a parent about filming, or a flare-up between players, is worth a word among the staff afterwards",

  game: system({
    name: "Playbook",
    currency: "ACTIONS",
    ranks: ["Clipboard Helper", "Offence Coach", "Assistant Coach", "Head Coach", "Programme Director"],
    badges: [
      { id: "five-spots", name: "Five Spots", note: "Every spacing spot found first time", test: AWARD.stepClean("mark-the-spots") },
      { id: "legal-screens", name: "Legal Screens", note: "No unsafe action in the whole offence block", test: AWARD.safe },
      { id: "spaced-and-moving", name: "Spaced and Moving", note: "Spacing, screen contact and ball movement all inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "ball-never-sticks", name: "Ball Never Sticks", note: "Held ball movement in band the whole time", test: AWARD.unbroken },
      { id: "quick-set", name: "Quick Set", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "blind-screens-no-space": "You told the screeners to set blind screens right on a defender's back. A player screened from behind never sees it coming and hits it at full speed, head and neck unprepared — which is why the rules require room to be given on a blind screen, and why it is a common way young players get concussed.",
    "keep-in-with-headache": "You kept a player on the floor after they ran into a screen and said their head hurt. A headache after contact is one of the most common concussion signs; a player left in is a player whose next knock lands on a brain that may already be hurt.",
    "full-court-no-subs": "You ran the offence full court for the whole session with no substitutions. Continuous play without rotation piles unplanned minutes on the players who are on the floor, wears down technique on every screen and cut, and ignores the playing-time and rest balance youth guidelines recommend.",
    "no-water-till-it-runs": "You held water back until the play was run right. Tying a drink to performance teaches players to hide thirst, and in a warm gym the players working hardest to get it right are the ones falling furthest behind on fluid.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the offence block once it has run and the contact is set — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "mark-the-spots", kind: "find", noHint: true,
      targets: ["spot-top", "spot-left-wing", "spot-right-wing", "spot-left-corner", "spot-right-corner"],
      itemNames: {
        "spot-top": "the top of the key",
        "spot-left-wing": "the left wing",
        "spot-right-wing": "the right wing",
        "spot-left-corner": "the left corner",
        "spot-right-corner": "the right corner",
      },
      itemNotes: {
        "spot-top": "The ball handler's spot. Everything else is spaced off this one.",
        "spot-left-wing": "Wide enough that the wing is a pass away, not a hand-off away.",
        "spot-right-wing": "Mirrors the left wing so help defence has to cover real distance.",
        "spot-left-corner": "Corners stretch the floor and keep the lane open for drives and rolls.",
        "spot-right-corner": "Both corners filled means the paint stays clear and collisions stay rare.",
      },
      decoyNotes: {
        "spot-paint": "The middle of the paint is not a spacing spot. A player parked there clogs every drive and every roll.",
      },
      title: "Mark the five spacing spots",
      cue: "Find the five taped spots: top, both wings, both corners.",
      why: "Spacing is the offence's first safety feature as well as its first tactic. Five players standing on real spots, a pass apart, keep the paint clear for drives and rolls and keep bodies from bunching up where collisions happen. Taping the spots on the floor gives young players something concrete to stand on instead of drifting toward the ball.",
    },
    {
      id: "draw-the-action", kind: "select", target: "play-whiteboard",
      title: "Draw the action before running it",
      cue: "Sketch the on-ball screen on the whiteboard — who screens, who uses it, where everyone else stands.",
      why: "Young players run into each other when they do not know where the others are going. Drawing the action first — screener, ball handler, the three spotted up — lets everyone see the whole picture before anybody moves, so the first run-through is a rehearsal rather than a collision course.",
    },
    {
      id: "fix-the-spacing", kind: "drag", target: "drifting-wing-marker",
      title: "Move the drifting wing back to their spot",
      cue: "Drag the wing's marker from beside the ball back out to the wing spot.",
      drag: { to: "wing-socket", radius: 0.45, missNote: "Not on the spot. A wing standing next to the ball brings their defender into the screen too — move them all the way out." },
      why: "Young players drift toward the ball, and a wing standing a step from the ball handler drags a second defender into the screen. Moving them back to the spot restores the space the action needs and takes two extra bodies out of the collision zone.",
    },
    {
      id: "build-the-screen", kind: "sequence",
      targets: ["screen-set-feet", "screen-call-it", "screen-use-it", "screen-roll"],
      itemNames: {
        "screen-set-feet": "screener sets the feet wide and still",
        "screen-call-it": "screener calls the ball handler's name",
        "screen-use-it": "ball handler waits, then goes shoulder to shoulder",
        "screen-roll": "screener rolls to the basket",
      },
      title: "Build the on-ball screen in order",
      cue: "Screener sets still, calls it, ball handler waits and uses it shoulder to shoulder, then the screener rolls.",
      why: "A legal screen is a stationary one: the screener arrives, sets the feet wide and still, and holds their arms in. Calling the name tells the ball handler it is set; waiting for it is what stops the handler dragging the screener into a moving screen; the roll comes last. Built in that order, the screen is legal and nobody runs into anybody at full speed.",
      outOfOrderNote: "Out of order. The screener sets still and calls it first — a ball handler who goes before the screen is set turns it into a moving screen and a collision.",
    },
    {
      id: "stationary-screen", kind: "hold", target: "screen-hold-marker", seconds: 7,
      title: "Hold the screen still until it is used",
      cue: "The screener stays planted, arms in, until the ball handler has gone past — hold it while you watch the rest of the floor.",
      why: "Holding a screen still is harder than it sounds for a young player who wants to help. A screener who moves into the defender is committing a foul and delivering a hit; one who holds still, arms in, lets the defender see and avoid it. Holding it for the count is also when the coach can check the three players spotted up are still on their spots.",
      holdBreakNote: "The screener moved before it was used. Plant again — feet wide, arms in — and hold it still.",
    },
    {
      id: "read-the-spacing", kind: "gauge", target: "spacing-meter",
      title: "Read the spacing between the players",
      cue: "Commit when the spacing reads a pass apart — not bunched, not so far they cannot pass.",
      gauge: {
        label: "SPACING", speed: 0.62, green: [0.42, 0.62],
        readout: (t) => (t < 0.42 ? "bunched — collisions waiting" : t <= 0.62 ? "a pass apart" : "too far — cannot pass"),
        missNote: "Outside the band. Bunched players collide and clog the lane; stretched too far and young arms cannot make the pass. Find a pass apart and commit.",
      },
      why: "Good spacing is a pass apart: close enough that a young player can reach a teammate with a crisp two-hand pass, far enough that one defender cannot guard two players and nobody is in anybody's way. Reading it in real time, rather than trusting the taped spots, catches the drift before it turns into a crowd.",
    },
    {
      id: "angle-the-screen", kind: "turn", target: "screen-angle-dial",
      title: "Angle the screen toward where the ball handler is going",
      cue: "Turn the screener's angle a quarter so their back faces the direction the ball handler wants to go.",
      turn: { turns: 0.25, axis: "y", label: "ANGLE" },
      why: "The angle of a screen decides where the defender meets it and where the ball handler goes. Angled so the screener's back faces the way the handler is heading, the defender meets a broad, stationary body from the front and can see it — the legal, safer contact — instead of clipping a shoulder at speed.",
    },
    {
      id: "ball-movement", kind: "track", target: "ball-movement-meter", seconds: 8,
      title: "Keep the ball moving around the spots",
      cue: "Hold the ball movement in band — it never sticks in one pair of hands, and never gets thrown before a teammate is ready.",
      track: {
        start: 0.25, green: [0.4, 0.62], rise: 0.55, fall: 0.44, drift: 0.14, label: "BALL",
        readout: (v) => (v < 0.4 ? "sticking — too many dribbles" : v > 0.62 ? "rushed — throwing blind" : "moving and on target"),
      },
      why: "When the ball sticks, four players stand and watch and the ball handler ends up dribbling into traffic; when it is rushed, passes fly at players who are not looking. Holding the movement in the band — catch, look, pass — keeps everyone involved, keeps defenders moving, and keeps the ball arriving at hands that are ready for it.",
      holdBreakNote: "The ball movement left the band — sticking in one player's hands, or flying before anyone was ready. Bring it back to catch, look, pass.",
    },
    {
      id: "spot-bad-screens", kind: "find", noHint: true,
      targets: ["fault-moving-screen", "fault-blind-too-close", "fault-hips-out"],
      itemNames: {
        "fault-moving-screen": "a screener moving into the defender",
        "fault-blind-too-close": "a blind screen set right on a defender's back",
        "fault-hips-out": "a screener sticking a hip out into the defender",
      },
      itemNotes: {
        "fault-moving-screen": "A moving screen is a foul and a hit. Cue 'arrive, set, hold' — the feet stop before the defender gets there.",
        "fault-blind-too-close": "A defender screened from behind needs room to see and stop. Give a step of space on every blind screen.",
        "fault-hips-out": "Hips and elbows stay inside the screener's own space. Cue 'arms in, hips square'.",
      },
      decoyNotes: {
        "fault-calling-screen": "Calling the screen out loud is exactly right. Look for the screens that move, blindside or stick out.",
      },
      title: "Spot the illegal and dangerous screens",
      cue: "Watch the screeners. Mark every screen that is illegal or dangerous.",
      why: "The screens that break the rules are the same ones that hurt people: a screener moving into the defender, a blind screen set with no room to see it, a hip or elbow stuck out into someone's path. NFHS basketball rules require a stationary screen and room on a blind one for exactly this reason, and catching all three in practice keeps them out of games.",
    },
    {
      id: "rotation-plan", kind: "select", target: "sub-rotation-board",
      title: "Post the rotation plan with water in it",
      cue: "Everyone rotates in on a fixed plan — equal turns, a water break built into every rotation.",
      why: "A fixed rotation gives every player equal turns in the action and a real rest between them, which is the playing-time and rest balance youth development guidance recommends. Building a water break into every rotation means nobody has to earn a drink, and nobody runs the whole session while others watch.",
    },
    {
      id: "screener-reads", kind: "sequence", anyOrder: true,
      targets: ["read-roll", "read-pop", "read-slip"],
      itemNames: {
        "read-roll": "roll to the basket",
        "read-pop": "pop out for a shot",
        "read-slip": "slip early when the defender jumps out",
      },
      title: "Walk the screener's reads",
      cue: "Roll, pop and slip — walk each read slowly before running it at speed.",
      why: "What the screener does after the screen depends on what the defence does, and walking each read slowly lets young players see why before they have to decide fast. It also keeps the screener moving into open space rather than drifting back into the crowd they just helped create.",
    },
    {
      id: "screen-contact", kind: "gauge", target: "screen-contact-meter",
      title: "Set how firm the screens are for this age",
      cue: "Commit when the contact reads firm and still — a wall to go around, never a hit.",
      gauge: {
        label: "CONTACT", speed: 0.6, green: [0.38, 0.56],
        readout: (t) => (t < 0.38 ? "soft — no screen at all" : t <= 0.56 ? "firm and still" : "a hit — too hard"),
        missNote: "Outside the band. Too soft and it is not a screen; too hard and it is a collision. Find firm and still and commit.",
      },
      why: "For young players, a screen is a wall to go around, not a hit to deliver. Setting the contact level at firm and still — screener planted, defender meeting a broad body they can see — teaches the real skill while keeping contact inside what growing bodies and brains can safely take.",
    },
    {
      id: "log-the-offence", kind: "select", target: "practice-log-board",
      title: "Log the offence block",
      cue: "Record the rotation, the screens corrected, the filming conversation at the door and the flare-up and how it was handled.",
      why: "The filming conversation belongs in writing, because the programme's photo policy is a promise to every family; so does the flare-up and how it was settled. Beside the rotation and screen corrections, a log written at the time is the fairest record for players, parents and staff alike.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: how the door conversation went, how the two players are, and is everybody good to go on?",
      why: "The assistant dealt with the camera at the door, the head coach settled the flare-up, and the athletic trainer watched for knocks on the screens. A quick check-in makes sure the follow-up with the parent and the two players is agreed and done openly, by the right adult, rather than left to chance.",
    },
  ],

  interrupts: [
    {
      id: "parent-filming-at-the-door",
      kind: "Parent at the door",
      after: "stationary-screen", delay: 3, seconds: 12,
      alert: "A parent at the doors has started filming the players on a phone and says they are going to post it for the other families.",
      cue: "Send the assistant to the door to explain the programme's photo and filming policy — calmly, the head coach stays with the players.",
      target: "door-greeting-spot",
      why: "Most programmes have a photo and filming policy because some families cannot have their child's image posted, and a clip online cannot be taken back. The assistant explaining the policy at the door, calmly and politely, protects those players without turning practice into a confrontation, and keeps the adults' conversations in the open, as SafeSport policies expect.",
      missNote: "Nobody went to the door and the clip went up that evening with every player's face in it — including a child whose family had asked in writing for no images. The programme broke a promise it made to that family, in public.",
      wrongNote: "That leaves the parent filming. The assistant goes to the door and explains the photo policy.",
    },
    {
      id: "flare-up-after-a-screen",
      kind: "Heated moment",
      after: "ball-movement", delay: 3, seconds: 12,
      alert: "A defender who got caught on a screen has come up swinging an arm at the screener, and the two are chest to chest with words flying.",
      cue: "Call everyone into the reset huddle at centre, with the two players on opposite sides of it — no shouting, no audience.",
      target: "reset-huddle-spot",
      why: "A flare-up after contact is best cooled by breaking the moment for everyone: a whistle into a reset huddle, the two players placed on opposite sides, and a calm reminder of what legal screens and good sportsmanship look like. It separates them without singling anyone out, and any follow-up happens privately, in view of other adults.",
      missNote: "The play carried on around the two players until the arm swing became a punch. Now there is a player with a split lip, two families to call, and a team that watched an adult let it happen.",
      wrongNote: "That does not break it up. Call everyone into the reset huddle with the two players on opposite sides.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBO_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBO_ACCENT, { emissive: o.color ?? BBO_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBO_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0a1426", accent: o.accent ?? BBO_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBO_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,14,30,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBO_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef4ff";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c8d8f6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBO_ACCENT, { rough: 0.5, emissive: o.accent ?? BBO_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.11, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });
    const spotMark = (x, z) => box(g, 0.24, 0.008, 0.24, x, 0.028, z, 0xf2c14b, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the half court
    const halfTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#1a2a4a", base2: "#162440", seam: "rgba(4,8,18,0.55)",
    }), { repeat: 2, px: 384 });
    const half = box(g, 3.2, 0.02, 2.2, 0, 0.012, -1.3, 0x1a2a4a, { rough: 0.95, cast: false });
    half.material = texturedMat(halfTex, { rough: 0.95, metal: 0.02, color: 0xc8d4ec });
    const SPOTS = [["spot-top", 0, -0.45, "Top"], ["spot-left-wing", -1.2, -0.95, "Left wing"], ["spot-right-wing", 1.2, -0.95, "Right wing"], ["spot-left-corner", -1.45, -2.2, "Left corner"], ["spot-right-corner", 1.45, -2.2, "Right corner"]];
    for (const [id, x, z, label] of SPOTS) {
      spotMark(x, z);
      bead(x, 0.3, z, id, label, { w: 0.26, r: 0.028 });
    }
    const paintSpot = box(g, 0.5, 0.008, 0.9, 0, 0.026, -2.1, 0x7a1f2b, { rough: 0.6, cast: false });
    holoTag(g, "Middle of the paint", 0, 0.2, -1.7, { css: "#7fc4d8", w: 0.34 });
    reg(hits, paintSpot, "spot-paint");

    // ------------------------------------------------------------ players on the spots
    const handler = standingFigure(g, 0.0, -0.2, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x141c30, atStation: true });
    const screener = standingFigure(g, 0.45, -0.75, { ry: -2.4, cloth: 0x2a4a8a, trousers: 0x141c30, atStation: true });
    const defender = standingFigure(g, 0.2, -0.95, { ry: 0.3, cloth: 0x6a6a6a, trousers: 0x141c30, atStation: true });
    const corner = standingFigure(g, -1.45, -2.45, { ry: 0.4, cloth: 0x2a4a8a, trousers: 0x141c30, atStation: true });
    const handBall = basketball(g, -0.25, 0.4, -0.15);
    void corner; void handler;

    // ------------------------------------------------------------ technique props
    const whiteboard = group(g, -1.4, 0, -3.0);
    for (const sx of [-0.35, 0.35]) cyl(whiteboard, 0.02, 0.02, 1.5, sx, 0.75, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    const wbFace = decal(whiteboard, 0.8, 0.55, 0, 1.4, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#2a4a8a"; cx.lineWidth = 3; cx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
      cx.fillStyle = "#2a4a8a"; cx.font = `700 ${Math.round(h * 0.1)}px Arial`; cx.textAlign = "center";
      for (const [x, y, t] of [[0.5, 0.85, "1"], [0.2, 0.6, "2"], [0.8, 0.6, "3"], [0.15, 0.25, "4"], [0.85, 0.25, "5"]]) cx.fillText(t, w * x, h * y);
      cx.strokeStyle = "#d8261e"; cx.beginPath(); cx.moveTo(w * 0.8, h * 0.6); cx.lineTo(w * 0.55, h * 0.78); cx.stroke();
    }, { px: 320 });
    holoTag(whiteboard, "Draw the action", 0, 1.8, 0.02, { css: BBO_CSS, w: 0.32 });
    reg(hits, wbFace, "play-whiteboard");
    const drift = group(g, 0.45, 0, 0.35);
    cyl(drift, 0.1, 0.1, 0.04, 0, 0.03, 0, 0xf2c14b, { rough: 0.5, seg: 16 });
    holoTag(drift, "Drifting wing", 0, 0.24, 0, { css: BBO_CSS, w: 0.26 });
    reg(hits, drift, "drifting-wing-marker");
    const wSocket = box(g, 0.3, 0.008, 0.3, 1.2, 0.034, -0.95, BBO_ACCENT, { emissive: BBO_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    wSocket.position.set(1.35, 0.034, -0.55);
    holoTag(g, "Wing spot", 1.35, 0.22, -0.55, { css: BBO_CSS, w: 0.2 });
    reg(hits, wSocket, "wing-socket");
    const seq = group(g, -2.35, 0, -1.5, 0.7);
    cyl(seq, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["screen-set-feet", "1 · Set feet, still", 0.62], ["screen-call-it", "2 · Call the name", 0.9],
      ["screen-use-it", "3 · Wait, shoulder to shoulder", 1.18], ["screen-roll", "4 · Roll", 1.46],
    ]) {
      const b = ball(seq, 0.028, 0, y, 0, BBO_ACCENT, { emissive: BBO_ACCENT, ei: 1.5, seg: 12 });
      holoTag(seq, label, 0.24, y, 0, { css: BBO_CSS, w: 0.48 });
      reg(hits, b, lid);
    }
    stand(0.95, -1.75, 0, 1.0);
    bead(0.95, 1.15, -1.75, "screen-hold-marker", "Hold the screen still", { w: 0.4 });
    const spStand = stand(-0.6, -2.55, 0.2);
    const spacing = instrument(spStand, 0, 1.02, 0, { idle: "SPACING", color: BBO_ACCENT, w: 0.2, d: 0.26 });
    holoTag(spStand, "Spacing", 0, 1.22, 0, { css: BBO_CSS, w: 0.2 });
    reg(hits, spacing, "spacing-meter");
    const angleBase = group(g, 0.75, 0, -0.3);
    const angleDial = cyl(angleBase, 0.12, 0.12, 0.02, 0, 0.03, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 18 });
    const angleArrow = box(angleBase, 0.05, 0.012, 0.22, 0, 0.05, 0.08, BBO_ACCENT, { emissive: BBO_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    holoTag(angleBase, "Screen angle", 0, 0.22, 0, { css: BBO_CSS, w: 0.24 });
    reg(hits, angleDial, "screen-angle-dial");
    const bmStand = stand(-1.6, 0.4, 0.4);
    const movement = instrument(bmStand, 0, 1.02, 0, { idle: "BALL", color: BBO_ACCENT, w: 0.2, d: 0.26 });
    holoTag(bmStand, "Ball movement", 0, 1.22, 0, { css: BBO_CSS, w: 0.28 });
    reg(hits, movement, "ball-movement-meter");
    bead(0.62, 1.1, -0.62, "fault-moving-screen", "Moving screen", { w: 0.3, r: 0.024 });
    bead(0.05, 1.75, -1.1, "fault-blind-too-close", "Blind, no room", { w: 0.3, r: 0.024 });
    bead(0.3, 0.95, -0.62, "fault-hips-out", "Hip out", { w: 0.22, r: 0.024 });
    bead(0.45, 1.95, -0.75, "fault-calling-screen", "Calling it", { w: 0.24, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const reads = group(g, 2.45, 0, -1.3, -0.9);
    cyl(reads, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["read-roll", "Roll", 0.8], ["read-pop", "Pop", 1.05], ["read-slip", "Slip", 1.3]]) {
      const b = ball(reads, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(reads, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.18 });
      reg(hits, b, lid);
    }
    const scStand = stand(1.9, 0.6, -0.4);
    const contactMeter = instrument(scStand, 0, 1.02, 0, { idle: "CONTACT", color: BBO_ACCENT, w: 0.2, d: 0.26 });
    holoTag(scStand, "Screen contact", 0, 1.22, 0, { css: BBO_CSS, w: 0.3 });
    reg(hits, contactMeter, "screen-contact-meter");

    // ------------------------------------------------------------ boards, huddle, door
    const rotation = board(0.56, 0.36, -3.0, 1.66, 0.4, (cx, w, h) => lines(cx, w, h, "ROTATION", ["Equal turns in the action", "Water every rotation"]), { ry: 1.1 });
    reg(hits, rotation.userData.face, "sub-rotation-board");
    const log = board(0.6, 0.36, 1.5, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Rotation · screens fixed", "Door talk · flare-up"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, -0.1, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const huddleRing = cyl(g, 0.5, 0.5, 0.006, -1.0, 0.01, 1.5, 0x59c97b, { rough: 0.6, opacity: 0.7, emissive: 0x59c97b, ei: 0.4, seg: 24, cast: false });
    void huddleRing;
    bead(-1.0, 0.7, 1.5, "reset-huddle-spot", "Reset huddle — opposite sides", { color: 0x59c97b, css: "#59c97b", w: 0.5 });
    const door = group(g, 3.45, 0, 1.3, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(door, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    const parent = standingFigure(g, 3.0, 0.6, { ry: -2.1, cloth: 0x6a5a3a, atStation: true });
    parent.visible = false;
    const phone = box(g, 0.05, 0.1, 0.01, 2.85, 1.35, 0.55, 0x1a1e23, { rough: 0.4, emissive: 0x9fd0f0, ei: 0.6 });
    phone.visible = false;
    bead(3.05, 1.25, 1.95, "door-greeting-spot", "Explain the photo policy at the door", { color: 0xf2c14b, css: "#f2c14b", w: 0.6 });

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.8, 1.25, 0.35, "blind-screens-no-space", "Blind screens, no room?", "BLINDSIDE\nTHEM", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "keep-in-with-headache", "Keep them in with a headache?", "HEADACHE ·\nPLAY ON", 0.1);
    hazardCard(0.6, 1.25, 1.2, "full-court-no-subs", "Full court, no subs?", "NO SUBS\nALL SESSION", -0.1);
    hazardCard(1.75, 1.25, 1.35, "no-water-till-it-runs", "No water till it's right?", "RUN IT RIGHT\nTHEN DRINK", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.45, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.45, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a4a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "fix-the-spacing") drift.position.set(1.35, 0, -0.55);
        if (step.id === "angle-the-screen") { angleArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.7, rough: 0.5 }); screener.rotation.y = -1.8; }
        if (step.id === "log-the-offence") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Photo policy explained", "Flare-up settled in the huddle"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "parent-filming-at-the-door") { parent.visible = true; phone.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35; }
        if (it.id === "flare-up-after-a-screen") {
          defender.position.set(0.45, 0, -1.05); defender.rotation.y = Math.PI;
          screener.rotation.y = 0;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "parent-filming-at-the-door") { assistant.position.set(2.7, 0, 1.4); assistant.rotation.y = -1.4; phone.visible = false; }
        if (it.id === "flare-up-after-a-screen") {
          defender.position.set(-1.55, 0, 1.5); defender.rotation.y = 1.2;
          screener.position.set(-0.45, 0, 1.5); screener.rotation.y = -1.2;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        handBall.position.y = 0.15 + Math.abs(Math.sin(t * 5)) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "read-the-spacing") {
          const ok = gg.t >= 0.42 && gg.t <= 0.62;
          repaint(spacing.userData.screen, signFace(ok ? "A PASS APART" : gg.t < 0.42 ? "BUNCHED" : "TOO FAR", { bg: "#0a1426", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef4ff", scale: 0.46 }));
        }
        if (gg && !gg.committed && session.step?.id === "screen-contact") {
          const ok = gg.t >= 0.38 && gg.t <= 0.56;
          repaint(contactMeter.userData.screen, signFace(ok ? "FIRM · STILL" : gg.t < 0.38 ? "SOFT" : "A HIT", { bg: "#0a1426", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef4ff", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "ball-movement") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(movement.userData.screen, signFace(ok ? "MOVING" : tr.v < 0.4 ? "STICKING" : "RUSHED", { bg: "#0a1426", accent: ok ? "#59c97b" : "#f0645b", fg: "#eef4ff", scale: 0.5 }));
        }
      },
    };
  },
};
