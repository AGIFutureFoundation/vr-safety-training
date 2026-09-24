import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — station eight: rebounding and
// boxing out, the first real contact most young players meet. The paint
// cleared, pairs matched by size, the box-out built in order and the seal
// held, a reverse pivot into the contact, the jump timed to the ball, contact
// kept controlled, the landing zone past the baseline cleared, the signs of a
// concussion recognised, and the rule — recognise, remove, refer — said
// before anybody's head hits anything.
//
// Sited generically in the gym-court district; the team, the players and the
// parent are invented. No rule number is quoted.

const BBR_ACCENT = 0xff5d8f;
const BBR_CSS = "#ff5d8f";

export const SIM_BB_REBOUNDING_AND_BOXING_OUT = {
  id: "bb-rebounding-and-boxing-out",
  index: "338",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on introducing contact progressively and matching players by size and maturity; NFHS basketball rules on legal contact and displacement under the basket; CDC Heads Up for concussion signs and the recognise, remove, refer action plan with no same-day return; the U.S. Center for SafeSport for keeping a parent's concern out of the drill and in the open; the American Red Cross first aid course for a player down after a collision",
  name: "Rebounding and Boxing Out",
  title: simTitle("Rebounding and Boxing Out"),
  tagline: "The paint cleared, pairs matched by size, the box-out built and the seal held, the jump timed, contact kept controlled, concussion signs recognised, and any knock to the head taken out of play",
  accent: BBR_ACCENT,
  accentCss: BBR_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "sealed-and-safe", name: "Sealed and Safe", note: "Contact taught under control, pairs matched, and every knock to the head recognised and removed" },

  supportLine: "your league's coach coordinator, or the athletic trainer who took the head knock from you — pulling a player for a possible concussion stays with the coach who made the call",

  game: system({
    name: "Boards",
    currency: "BOARDS",
    ranks: ["Rebound Helper", "Contact Coach", "Assistant Coach", "Head Coach", "Player-Safety Lead"],
    badges: [
      { id: "clear-paint", name: "Clear Paint", note: "Everything in the paint found first time", test: AWARD.stepClean("clear-the-paint") },
      { id: "no-bad-contact", name: "No Bad Contact", note: "No unsafe action in the whole rebounding block", test: AWARD.safe },
      { id: "timed-and-sealed", name: "Timed and Sealed", note: "Jump timing and contact control both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-boards", name: "Clean Boards", note: "No corrections anywhere in the block", test: AWARD.clean },
      { id: "steady-contact", name: "Steady Contact", note: "Held contact control in band the whole time", test: AWARD.unbroken },
      { id: "quick-boards", name: "Quick Boards", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "back-in-after-head-knock": "You sent the player straight back in after a knock to the head because they said they were fine. Young players almost always say they are fine; concussion signs can take minutes or hours to appear, and a second blow while the brain is still recovering is far more dangerous than the first.",
    "swinging-elbows-allowed": "You told the rebounders to swing their elbows to clear space. An elbow swung at head height in a crowd of jumping players is the most direct route to a broken nose, a split lip or a concussion, and the rules treat it as a foul for exactly that reason.",
    "four-to-a-ball": "You let four players crash the same rebound together. Landing is where rebounding injuries happen: with four players coming down in one small circle, somebody's foot lands on somebody else's, and ankles roll under the weight.",
    "sweat-in-the-paint": "You carried on with the sweat patch still in the paint. Rebounders land from a jump with their eyes on the ball; a wet patch under a landing foot slides it out sideways at the moment all their weight arrives.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the rebounding block once it has run and the balls are racked — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the end of the block.",
  },

  steps: [
    {
      id: "clear-the-paint", kind: "find", noHint: true,
      targets: ["paint-wet-patch", "paint-loose-ball", "paint-bag-on-baseline"],
      itemNames: {
        "paint-wet-patch": "a sweat patch in the paint",
        "paint-loose-ball": "a loose ball against the lane line",
        "paint-bag-on-baseline": "a ball bag left on the baseline",
      },
      itemNotes: {
        "paint-wet-patch": "The paint is where every rebound lands. Towel it dry before the first box-out.",
        "paint-loose-ball": "A ball at the lane line is under somebody's landing within a minute. Rack it.",
        "paint-bag-on-baseline": "Players chasing a long rebound run past the baseline. The bag goes to the wall.",
      },
      decoyNotes: {
        "paint-lane-paint": "The painted lane is part of the court. Look for what should not be lying in it.",
      },
      title: "Clear the paint before anyone crashes the boards",
      cue: "Scan the lane and the baseline. Mark everything a landing rebounder could slip on, land on or run into.",
      why: "Rebounding sends players up in a crowd and brings them down in the same small space, often past the baseline. A sweat patch, a loose ball and a bag on the baseline are what a landing foot finds. Clearing the paint first costs half a minute; a rolled ankle or a slide into the stanchion costs the season.",
    },
    {
      id: "match-the-pairs", kind: "select", target: "pairing-board",
      title: "Match the box-out pairs by size",
      cue: "Pair players with teammates of similar size and strength before any contact.",
      why: "Contact is introduced to young players carefully because bodies at the same age can differ hugely in size and strength. Pairing by size and maturity, the way youth development guidance recommends, lets both players learn the technique instead of one learning to get flattened — and it keeps the contact within what both bodies can take.",
    },
    {
      id: "build-the-box-out", kind: "sequence",
      targets: ["box-find-player", "box-make-contact", "box-sit-and-seal", "box-go-get-it"],
      itemNames: {
        "box-find-player": "find your player as the shot goes up",
        "box-make-contact": "make contact with the forearm and hip",
        "box-sit-and-seal": "sit low and seal them behind you",
        "box-go-get-it": "go get the ball with two hands, chin it",
      },
      title: "Build the box-out in order",
      cue: "Find your player, make contact with forearm and hip, sit low and seal, then go get the ball with two hands.",
      why: "A box-out is a sequence because it is about position before it is about the ball. Finding the player first, making contact with the forearm and hip rather than the hands, sitting low to seal them, and only then going for the ball keeps the contact legal and low — and stops the grab-and-jump scramble where heads and elbows meet.",
      outOfOrderNote: "Out of order. Find the player and seal them before going for the ball — jump first and there is no box-out, just a crowd of players all going up blind.",
    },
    {
      id: "hold-the-seal", kind: "hold", target: "seal-marker", seconds: 7,
      title: "Hold the seal until the ball comes off the rim",
      cue: "Stay low with the player sealed behind you until the ball hits the rim — hold it while you watch every pair.",
      why: "Holding the seal teaches patience: most young rebounders leave their player the moment the shot goes up and end up in a crowd under the rim. Staying low and connected until the ball comes off the rim is the whole technique, and holding it gives the coach time to watch every pair's contact and every pair's heads.",
      holdBreakNote: "The seal broke before the ball came off the rim. Get low, find the contact again and hold it.",
    },
    {
      id: "reverse-pivot-into-contact", kind: "turn", target: "pivot-dial",
      title: "Reverse pivot into the box-out",
      cue: "Turn half a circle on the pivot foot to put your back into your player's chest.",
      turn: { turns: 0.5, axis: "y", label: "REVERSE PIVOT" },
      why: "A reverse pivot turns a defender from facing their player to sealing them, using the footwork from the jump-stop station. Done on the ball of the foot, with the hips low, it puts the back into the chest rather than an elbow into the face, which is what keeps box-out contact broad, low and safe.",
    },
    {
      id: "time-the-jump", kind: "gauge", target: "timing-meter",
      title: "Time the jump to the ball off the rim",
      cue: "Commit when the jump reads timed to the ball — not early, not late.",
      gauge: {
        label: "JUMP", speed: 0.7, green: [0.46, 0.6],
        readout: (t) => (t < 0.46 ? "early — coming down as it arrives" : t <= 0.6 ? "timed to the ball" : "late — beaten to it"),
        missNote: "Off the timing. Early and the rebounder is landing as the ball arrives; late and someone else has it. Find the timing and commit.",
      },
      why: "A rebounder who jumps too early is coming down into the crowd as the ball arrives; one who jumps late is beaten to it and reaches over someone's back. Timing the jump to the ball's path off the rim means going up once, catching it at the top, and landing on balance — the fewest collisions for the most rebounds.",
    },
    {
      id: "contact-control", kind: "track", target: "contact-meter", seconds: 8,
      title: "Keep the contact controlled",
      cue: "Hold the pairs' contact in band — enough to seal, never a shove or a push in the back.",
      track: {
        start: 0.25, green: [0.4, 0.6], rise: 0.55, fall: 0.44, drift: 0.14, label: "CONTACT",
        readout: (v) => (v < 0.4 ? "too soft — no seal" : v > 0.6 ? "too hard — shoving" : "controlled seal"),
      },
      why: "Box-out contact has a band: too little and there is no seal, too much and it becomes a shove in the back that sends a player sprawling into the lane. Holding the pairs inside the band is what makes contact teachable to young players, and it is also the difference between legal position and displacement the rules penalise.",
      holdBreakNote: "The contact left the band — no seal, or tipping into shoving. Bring it back to a controlled seal.",
    },
    {
      id: "clear-the-landing-zone", kind: "drag", target: "baseline-bench",
      title: "Move the bench back from the baseline",
      cue: "Slide the team bench back to its marked spot against the wall, clear of the baseline.",
      drag: { to: "bench-socket", radius: 0.55, missNote: "Not far enough back. Long rebounds carry players past the baseline — the bench goes all the way to its mark by the wall." },
      why: "Long rebounds carry players out past the baseline at full stretch. A bench within a few steps of the line is exactly where that run ends, shins first. Sliding it back to a marked spot by the wall gives every rebounder room to land and slow down on open floor.",
    },
    {
      id: "spot-concussion-signs", kind: "find", noHint: true,
      targets: ["sign-holding-head", "sign-dazed-look", "sign-unsteady"],
      itemNames: {
        "sign-holding-head": "a player holding their head and wincing",
        "sign-dazed-look": "a player with a blank, dazed look",
        "sign-unsteady": "a player unsteady on their feet",
      },
      itemNotes: {
        "sign-holding-head": "A headache after a bump is one of the most common concussion signs. That player comes out now.",
        "sign-dazed-look": "Looking dazed or 'not all there' after contact is a sign on its own — out, and the athletic trainer checks them.",
        "sign-unsteady": "Balance problems after a hit mean the brain may be affected. Sit them down and get the athletic trainer.",
      },
      decoyNotes: {
        "sign-out-of-breath": "Breathing hard after a rebounding drill is normal effort. Look for the signs that follow a knock to the head.",
      },
      title: "Spot the signs of a concussion after a bump",
      cue: "Watch the players after a round of contact. Mark every player showing a possible concussion sign.",
      why: "CDC Heads Up training teaches coaches the signs they can see — a player holding their head, looking dazed or confused, or unsteady on their feet — because young athletes rarely report symptoms themselves. A coach who knows what to look for after every round of contact catches the player who says they are fine and is not.",
    },
    {
      id: "recognise-remove-refer", kind: "select", target: "heads-up-card",
      title: "Apply the rule: recognise, remove, refer",
      cue: "Any sign after a knock to the head: out of play, no return today, checked by the athletic trainer and cleared in writing by a health care provider before coming back.",
      why: "The concussion action plan in CDC Heads Up is simple on purpose: recognise the signs, remove the player from play, refer them to a health care provider, and return only with clearance. No same-day return is the part that protects against a second blow while the brain is still vulnerable, and it is not the player's or the coach's call to skip it.",
    },
    {
      id: "outlet-after-the-board", kind: "sequence", anyOrder: true,
      targets: ["outlet-pivot-away", "outlet-find-guard", "outlet-two-hand-pass"],
      itemNames: {
        "outlet-pivot-away": "pivot away from the pressure",
        "outlet-find-guard": "find the guard on the wing",
        "outlet-two-hand-pass": "a two-hand outlet pass",
      },
      title: "Finish the rebound with the outlet",
      cue: "Pivot away from pressure, find the guard, a two-hand outlet pass — walk each piece.",
      why: "A rebound is only finished when the ball leaves the crowd. Pivoting away from pressure, finding the guard and throwing a two-hand outlet gets the ball and the rebounder out of the paint quickly, and it keeps the player chinning the ball rather than swinging it through faces to clear space.",
    },
    {
      id: "rack-the-rebounds", kind: "drag", target: "rebound-cart",
      title: "Rack the rebound balls before the next round",
      cue: "Roll the cart to the baseline corner and rack every ball in the paint.",
      drag: { to: "cart-socket", radius: 0.5, missNote: "Not in the corner. The cart goes to its baseline-corner spot, out of every landing." },
      why: "Rebounding drills leave balls scattered through the landing zone between rounds. Racking them into a cart parked in the baseline corner, out of every landing, keeps the next round starting on a clear floor — the simplest ankle protection in the gym.",
    },
    {
      id: "log-the-rebounding", kind: "select", target: "practice-log-board",
      title: "Log the rebounding block",
      cue: "Record the pairs, the contact corrections, any head knock with the time, the signs seen and who checked the player.",
      why: "A possible concussion is logged with the time, what happened, the signs seen and who assessed the player, because the parents, the athletic trainer and the player's health care provider all need that account. The pairs and contact notes sit beside it, so the next contact session starts where this one safely ended.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: what the trainer found, who calls the family, how the door conversation went, and is everybody good to go on?",
      why: "A head knock means a phone call home, and it matters that the family hears one clear account from the right adult. The check-in decides who makes that call, pools what the trainer found and what the assistant heard at the door, and keeps the staff acting together, openly, rather than three people each assuming another handled it.",
    },
  ],

  interrupts: [
    {
      id: "heads-collide-on-a-rebound",
      kind: "Player down",
      after: "hold-the-seal", delay: 3, seconds: 12,
      alert: "Two rebounders went up for the same ball and their heads met. One is sitting on the floor, holding the side of their head and blinking.",
      cue: "Stop the drill and call the athletic trainer to run a concussion check — the player stays sitting and does not go back in.",
      target: "concussion-check-call",
      why: "A clash of heads is a possible concussion until a trained person says otherwise, however quickly the player wants to get up. Stopping the drill and calling the athletic trainer for a concussion check starts the recognise, remove, refer plan from CDC Heads Up at once, and the player sits out for the rest of the day no matter how they feel in five minutes.",
      missNote: "The drill carried on and the player got up and went back into the next round. If that knock caused a concussion, a second blow now is far more dangerous than the first, and nobody trained to look for the signs has checked them.",
      wrongNote: "That does not start the check. Call the athletic trainer for a concussion check — the player stays sitting.",
    },
    {
      id: "parent-demands-rougher-drills",
      kind: "Parent at the door",
      after: "contact-control", delay: 3, seconds: 12,
      alert: "A parent has come through the doors onto the court, calling out that the drill is too soft and telling their child to 'really hit' the kid next to them.",
      cue: "Send the assistant coach to meet the parent at the door, calmly, off the court — the head coach keeps the drill under control.",
      target: "door-greeting-spot",
      why: "A parent shouting instructions into a contact drill is pushing a young player toward exactly the uncontrolled hit this station exists to prevent. The assistant meeting them at the door, calmly and away from the players, keeps the drill in the coach's hands, gives the parent a real conversation, and keeps everything in view the way SafeSport policies expect.",
      missNote: "The parent stayed courtside shouting and their child took it to heart, shoving the next rebounder in the back into the stanchion pad. The drill's whole point — controlled contact — was lost to an adult nobody went to meet.",
      wrongNote: "That leaves the parent on the court. The assistant goes to meet them at the door.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBR_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBR_ACCENT, { emissive: o.color ?? BBR_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBR_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#240a14", accent: o.accent ?? BBR_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBR_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(30,8,16,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff0f4";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#f6ccd8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBR_ACCENT, { rough: 0.5, emissive: o.accent ?? BBR_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z) => ball(parent, 0.11, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the paint and the hoop
    const paintTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#5a1a2a", base2: "#521624", seam: "rgba(20,4,8,0.5)",
    }), { repeat: 2, px: 384 });
    const paint = box(g, 1.8, 0.02, 2.2, 0, 0.012, -1.5, 0x5a1a2a, { rough: 0.9, cast: false });
    paint.material = texturedMat(paintTex, { rough: 0.9, metal: 0.02, color: 0xe8c8d0 });
    const lanePaint = box(g, 0.05, 0.006, 2.2, 0.9, 0.025, -1.5, 0xf6f4ee, { rough: 0.6, cast: false });
    box(g, 0.05, 0.006, 2.2, -0.9, 0.025, -1.5, 0xf6f4ee, { rough: 0.6, cast: false });
    holoTag(g, "Lane line", 0.9, 0.2, -0.6, { css: "#7fc4d8", w: 0.2 });
    reg(hits, lanePaint, "paint-lane-paint");
    const hoop = group(g, 0, 0, -3.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hoop, 1.04, 0.34, 0.08, 0, 0.17, 0.12, 0x1f3a6b, { rough: 0.85 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });
    const reboundBall = basketball(g, 0.2, 2.5, -2.3);
    const wet = cyl(g, 0.22, 0.22, 0.004, -0.35, 0.026, -1.3, 0x9fd0f0, { rough: 0.05, opacity: 0.5, seg: 16, cast: false });
    bead(-0.35, 0.4, -1.3, "paint-wet-patch", "Sweat in the paint", { w: 0.32 });
    const loose = basketball(g, 0.78, 0.11, -0.85);
    bead(0.78, 0.45, -0.85, "paint-loose-ball", "Loose ball", { w: 0.24 });
    const bag = group(g, -1.2, 0, -2.75);
    cyl(bag, 0.26, 0.22, 0.45, 0, 0.22, 0, 0x2a2a3a, { rough: 0.85, seg: 14, open: true });
    bead(-1.2, 0.7, -2.75, "paint-bag-on-baseline", "Bag on the baseline", { w: 0.34 });

    // ------------------------------------------------------------ pairs
    const pairs = [
      standingFigure(g, -0.45, -1.7, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x2a1420, atStation: true }),
      standingFigure(g, -0.45, -1.25, { ry: Math.PI, cloth: 0x8a2a4a, trousers: 0x2a1420, atStation: true }),
      standingFigure(g, 0.5, -1.75, { ry: Math.PI, cloth: 0xf2f2f2, trousers: 0x2a1420, atStation: true }),
      standingFigure(g, 0.5, -1.3, { ry: Math.PI, cloth: 0x8a2a4a, trousers: 0x2a1420, atStation: true }),
    ];
    pairs[0].userData.body.position.y = -0.12; pairs[2].userData.body.position.y = -0.12;
    bead(-0.62, 2.0, -1.2, "sign-holding-head", "Holding head", { w: 0.3, r: 0.024 });
    bead(0.35, 1.95, -1.25, "sign-dazed-look", "Dazed look", { w: 0.26, r: 0.024 });
    bead(0.7, 0.22, -1.25, "sign-unsteady", "Unsteady", { w: 0.24, r: 0.024 });
    bead(-0.25, 1.35, -1.2, "sign-out-of-breath", "Out of breath", { w: 0.3, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ technique props
    const pairing = board(0.56, 0.36, -1.35, 1.72, -3.0, (cx, w, h) => lines(cx, w, h, "BOX-OUT PAIRS", ["Matched by size", "Matched by strength"]));
    reg(hits, pairing.userData.face, "pairing-board");
    const ladder = group(g, -2.35, 0, -1.5, 0.7);
    cyl(ladder, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["box-find-player", "1 · Find your player", 0.62], ["box-make-contact", "2 · Forearm and hip", 0.9],
      ["box-sit-and-seal", "3 · Sit and seal", 1.18], ["box-go-get-it", "4 · Two hands, chin it", 1.46],
    ]) {
      const b = ball(ladder, 0.028, 0, y, 0, BBR_ACCENT, { emissive: BBR_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.24, y, 0, { css: BBR_CSS, w: 0.42 });
      reg(hits, b, lid);
    }
    stand(1.3, -0.55, 0, 1.0);
    bead(1.3, 1.15, -0.55, "seal-marker", "Hold the seal", { w: 0.28 });
    const pivotBase = group(g, -0.9, 0, -0.4);
    const pivotDial = cyl(pivotBase, 0.14, 0.14, 0.02, 0, 0.03, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3, seg: 18 });
    const pivotArrow = box(pivotBase, 0.05, 0.012, 0.24, 0, 0.05, 0.08, BBR_ACCENT, { emissive: BBR_ACCENT, ei: 0.6, rough: 0.5, cast: false });
    holoTag(pivotBase, "Reverse pivot", 0, 0.22, 0, { css: BBR_CSS, w: 0.26 });
    reg(hits, pivotDial, "pivot-dial");
    const tStand = stand(1.95, -2.1, -0.4);
    const timing = instrument(tStand, 0, 1.02, 0, { idle: "JUMP", color: BBR_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Jump timing", 0, 1.22, 0, { css: BBR_CSS, w: 0.26 });
    reg(hits, timing, "timing-meter");
    const cStand = stand(-1.6, 0.35, 0.4);
    const contact = instrument(cStand, 0, 1.02, 0, { idle: "CONTACT", color: BBR_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Contact control", 0, 1.22, 0, { css: BBR_CSS, w: 0.3 });
    reg(hits, contact, "contact-meter");
    card(0.55, 1.45, -2.95, "heads-up-card", "Recognise · remove · refer", "OUT TODAY ·\nCLEARED TO RETURN", { w: 0.46, accent: "#f2c14b", css: "#f2c14b" });
    const outlet = group(g, 2.45, 0, -0.5, -1.0);
    cyl(outlet, 0.022, 0.022, 1.4, 0, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [["outlet-pivot-away", "Pivot away", 0.8], ["outlet-find-guard", "Find the guard", 1.05], ["outlet-two-hand-pass", "Two-hand outlet", 1.3]]) {
      const b = ball(outlet, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(outlet, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.32 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ bench, cart, kit
    const bench = group(g, -2.1, 0, -2.4, 0.2);
    box(bench, 1.4, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.6, 0.6]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    holoTag(bench, "Team bench — too close", 0, 0.75, 0, { css: BBR_CSS, w: 0.42 });
    reg(hits, bench, "baseline-bench");
    const bSocket = box(g, 0.9, 0.008, 0.4, -2.6, 0.01, 0.9, BBR_ACCENT, { emissive: BBR_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Bench mark — by the wall", -2.6, 0.22, 0.9, { css: BBR_CSS, w: 0.42 });
    reg(hits, bSocket, "bench-socket");
    const cart = group(g, 1.9, 0, 0.9);
    box(cart, 0.6, 0.04, 0.45, 0, 0.3, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (const sx of [-0.28, 0.28]) box(cart, 0.03, 0.36, 0.45, sx, 0.48, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) basketball(cart, -0.14 + i * 0.14, 0.44, 0);
    holoTag(cart, "Rebound cart", 0, 0.8, 0, { css: BBR_CSS, w: 0.26 });
    reg(hits, cart, "rebound-cart");
    const cSocket = box(g, 0.6, 0.008, 0.5, 2.3, 0.01, -2.6, BBR_ACCENT, { emissive: BBR_ACCENT, ei: 0.5, rough: 0.6, cast: false });
    holoTag(g, "Baseline corner", 2.3, 0.22, -2.6, { css: BBR_CSS, w: 0.3 });
    reg(hits, cSocket, "cart-socket");
    const kit = group(g, 2.75, 0, 1.95);
    box(kit, 0.5, 0.32, 0.32, 0, 0.16, 0, 0xd8261e, { rough: 0.6 });
    box(kit, 0.14, 0.04, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    box(kit, 0.04, 0.14, 0.02, 0, 0.26, 0.17, 0xf2f2f2, { rough: 0.5 });
    const checkCard = box(kit, 0.12, 0.16, 0.02, 0.2, 0.42, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(kit, "Call the trainer — concussion check", 0.1, 0.66, 0, { css: "#f2c14b", w: 0.6 });
    reg(hits, checkCard, "concussion-check-call");

    // ------------------------------------------------------------ door and boards
    const door = group(g, 3.45, 0, 1.0, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(door, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    const parent = standingFigure(g, 2.95, 0.3, { ry: -2.0, cloth: 0x5a4a6a, atStation: true });
    parent.visible = false;
    bead(3.05, 1.25, 1.55, "door-greeting-spot", "Meet the parent at the door", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });
    const log = board(0.6, 0.36, 1.5, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Pairs · contact notes", "Head knocks: time, signs, who"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, -1.0, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.8, 1.25, 0.45, "back-in-after-head-knock", "Back in — they say they're fine?", "SAYS FINE ·\nBACK IN", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "swinging-elbows-allowed", "Swing elbows to clear space?", "ELBOWS OUT\nCLEAR SPACE", 0.1);
    hazardCard(0.6, 1.25, 1.2, "four-to-a-ball", "Four players crash one ball?", "EVERYONE\nCRASH IT", -0.1);
    hazardCard(1.75, 1.25, 0.3, "sweat-in-the-paint", "Leave the sweat in the paint?", "PLAY ON\nIT'LL DRY", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.45, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.45, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.35, -0.6, { ry: 1.2, cloth: 0x8a2a4a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.35, 2.1, -0.6, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.3, -1.6),

      onStepComplete(step) {
        if (step.id === "clear-the-paint") { wet.visible = false; loose.visible = false; bag.position.set(-3.0, 0, -2.9); }
        if (step.id === "reverse-pivot-into-contact") pivotArrow.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.7, rough: 0.5 });
        if (step.id === "clear-the-landing-zone") bench.position.set(-2.6, 0, 0.9);
        if (step.id === "rack-the-rebounds") cart.position.set(2.3, 0, -2.6);
        if (step.id === "log-the-rebounding") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Head knock: removed, checked", "Family call agreed"], { accent: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "heads-collide-on-a-rebound") {
          const b = pairs[1].userData.body;
          b.rotation.x = -1.1; b.position.y = 0.2;
          reboundBall.position.set(0.4, 0.11, -1.0);
        }
        if (it.id === "parent-demands-rougher-drills") { parent.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "heads-collide-on-a-rebound") {
          trainer.position.set(-0.1, 0, -0.9); trainer.rotation.y = -2.8;
          pairs[1].position.set(-2.8, 0, 0.5);
        }
        if (it.id === "parent-demands-rougher-drills") { assistant.position.set(2.7, 0, 1.2); assistant.rotation.y = -1.4; parent.position.set(3.2, 0, 1.4); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        if (reboundBall.position.y > 1) reboundBall.position.y = 2.45 + Math.abs(Math.sin(t * 2)) * 0.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "time-the-jump") {
          const ok = gg.t >= 0.46 && gg.t <= 0.6;
          repaint(timing.userData.screen, signFace(ok ? "TIMED" : gg.t < 0.46 ? "EARLY" : "LATE", { bg: "#240a14", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff0f4", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "contact-control") {
          const ok = tr.v >= 0.4 && tr.v <= 0.6;
          repaint(contact.userData.screen, signFace(ok ? "SEALED" : tr.v < 0.4 ? "NO SEAL" : "SHOVING", { bg: "#240a14", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff0f4", scale: 0.5 }));
        }
      },
    };
  },
};
