import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — teammate conflict and
// accountability. A loose-ball scramble turns into a shove in practice, and
// what a coach does in the next sixty seconds decides whether two teammates
// are actually teammates again by the next drill or just standing near each
// other, still carrying it. The circle-up taught here — separate first, cool
// down, each side heard in turn, a genuine apology instead of a forced one,
// a repair both players actually mean — is a restorative practice, not a
// punishment, and it is taught as a coaching skill the bodies below
// recommend, never as a guaranteed fix for what caused the shove.
//
// Sited generically in the gym-court district; the team and players are
// invented. No research finding or statistic is asserted, and no player is
// blamed by name beyond what a coach would actually say out loud.

const BBK_ACCENT = 0xffb84f;
const BBK_CSS = "#ffb84f";

export const SIM_BB_TEAMMATE_CONFLICT_AND_ACCOUNTABILITY = {
  id: "bb-teammate-conflict-and-accountability",
  index: "346",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on coaching team culture and conflict between young athletes rather than only the skills between them; the Association for Applied Sport Psychology's guidance on accountability that builds rather than shames a young athlete; NFHS basketball rules and its sportsmanship expectations for how teammates treat each other on and off the ball; the U.S. Center for SafeSport for observable, non-shaming correction and for knowing when a physical incident between athletes has to be reported rather than only handled on the floor; CDC Heads Up for a head knock taken in the scramble that led to the shove; the American Red Cross first aid course for checking either player over before play resumes",
  name: "Teammate Conflict and Accountability",
  title: simTitle("Teammate Conflict and Accountability"),
  tagline: "A shove over a loose ball does not end when the whistle blows it dead — separated first, cooled down, heard in turn and repaired for real is what actually makes two players teammates again",
  accent: BBK_ACCENT,
  accentCss: BBK_CSS,
  parSeconds: 340,
  footprint: 2.6,
  badge: { id: "still-teammates", name: "Still Teammates", note: "A shove met with a real circle-up instead of a rushed sorry, and both players actually repaired before the next drill" },

  supportLine: "your league's coach coordinator, or the assistant and athletic trainer who helped you separate and check on both players — a shove between two kids you coach is worth talking through afterwards too",

  game: system({
    name: "Circle-Up Board",
    currency: "REPAIR POINTS",
    ranks: ["Bench Helper", "Line Coach", "Assistant Coach", "Head Coach", "Culture Mentor"],
    badges: [
      { id: "clear-floor-first", name: "Clear Floor First", note: "Every hazard on the floor found before the circle-up starts", test: AWARD.stepClean("scan-the-court-after-the-shove") },
      { id: "no-escalation", name: "No Escalation", note: "No unsafe action anywhere in the session", test: AWARD.safe },
      { id: "steady-circle", name: "Steady Circle", note: "Accountability tempo and team trust both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unshaken", name: "Unshaken", note: "Held team trust in band the whole way back into the drill", test: AWARD.unbroken },
      { id: "quick-repair", name: "Quick Repair", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "let-the-drill-keep-running-around-them": "You let the rest of the team keep running the drill right next to the two players who had just shoved each other. A live drill continuing beside an unresolved confrontation is how a bystander gets pulled into it or collides with someone whose attention is anywhere but the ball, and it tells both players their safety mattered less than keeping the practice on schedule.",
    "force-a-fake-apology-in-front-of-everyone": "You made both players say sorry to each other in front of the whole team right away, rushed and clearly not meant. The Association for Applied Sport Psychology's guidance on accountability warns that a forced, public apology teaches a player to perform contrition, not to actually feel it, and it turns a private repair into a second humiliation watched by the entire team.",
    "let-teammates-pick-sides": "You let the rest of the team start arguing about who started it while the two players involved were still standing right there. A team choosing sides over a shove splits the group exactly along the line the incident already drew, and it is the U.S. Center for SafeSport's own point that adults, not teammates, are supposed to be the ones handling a conflict between young athletes.",
    "skip-the-report-because-it-was-minor": "You decided not to log or report the shove because nobody was hurt and it seemed minor. SafeSport guidance is clear that a physical incident between athletes gets documented and reported through the league's own process regardless of how it looks in the moment, because the record protects both players and the coach if anything about the incident is ever asked about later.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the circle-up once the repair has held and the team has rejoined the drill — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, at the very end.",
  },

  steps: [
    {
      id: "scan-the-court-after-the-shove", kind: "find", noHint: true,
      targets: ["shove-loose-ball", "shove-bystander-circling", "shove-fists-clenched"],
      itemNames: {
        "shove-loose-ball": "the loose ball still sitting where the shove happened",
        "shove-bystander-circling": "a teammate circling in, ready to jump into it",
        "shove-fists-clenched": "a player with fists still clenched",
      },
      itemNotes: {
        "shove-loose-ball": "A ball sitting in the middle of a tense standoff is the next trip or the next thing somebody kicks at. Rack it before anything else.",
        "shove-bystander-circling": "A teammate circling closer is a second shove waiting to happen. Get between them before the crowd forms.",
        "shove-fists-clenched": "Clenched fists mean the body has not calmed down even if the shoving has stopped. That is who needs separated first.",
      },
      decoyNotes: {
        "shove-teammate-stepping-back": "A teammate already stepping back and giving space is doing exactly what the moment needs. Look for what is still escalating.",
      },
      title: "Scan the floor in the first seconds after a shove",
      cue: "Look at the floor, the two players and everyone standing near them. Mark what has to be fixed and who has to be separated.",
      why: "The first seconds after a shove decide whether it stays between two players or pulls in a third: a loose ball still sitting there, a teammate circling in ready to jump in, and fists still clenched are all read in the same glance a coach takes before anyone says a single word about what happened.",
    },
    {
      id: "separate-the-two-players", kind: "select", target: "separation-spot-card",
      title: "Separate the two players before any conversation",
      cue: "Post the first rule: space between them, physically, before either one says another word.",
      why: "Nothing productive gets said while two players are still close enough to shove again. Creating real physical space first, calmly and without singling out who was more at fault, is what makes every step that follows possible — a conversation started too close to the original distance just restarts the confrontation instead of resolving it.",
    },
    {
      id: "read-the-reporting-line", kind: "select", target: "reporting-line-card",
      title: "Read the reporting line before the circle-up starts",
      cue: "Post the reminder: a physical incident between players gets logged and reported through the league's process, not judged as too minor to matter.",
      why: "SafeSport guidance treats the reporting threshold as a floor, not a judgement call made in the heat of the moment by whoever happened to be coaching. Reading that line now, before the circle-up even starts, keeps the decision to document the incident from quietly disappearing once the two players seem to have calmed down.",
    },
    {
      id: "cooling-off-pause", kind: "hold", target: "cooldown-marker", seconds: 6,
      title: "Hold a real cooling-off pause before talking",
      cue: "Both players stand apart and breathe — hold here and watch it happen, no talking over it, no rushing the conversation.",
      why: "A conversation about accountability started while adrenaline is still running high rarely lands as anything but another round of the argument. Holding a genuine pause — long enough for both players' breathing to actually slow — is what makes the circle-up that follows a repair conversation instead of a continuation of the shove with words instead of hands.",
      holdBreakNote: "The pause got cut short before either player had actually calmed down. Hold it the whole way through — the conversation can wait a few more seconds.",
    },
    {
      id: "build-the-circle-up-in-order", kind: "sequence",
      targets: ["circle-name-it", "circle-each-side", "circle-impact", "circle-repair"],
      itemNames: {
        "circle-name-it": "name what happened, plainly",
        "circle-each-side": "each player gets a turn to speak",
        "circle-impact": "name the impact, not just the act",
        "circle-repair": "agree what repair looks like",
      },
      title: "Build the circle-up in order",
      cue: "Name what happened first, then each side speaks in turn, then the impact is named, then a repair is agreed.",
      why: "Each part of the circle-up needs the one before it: naming what happened plainly stops either player from re-litigating the story, hearing both sides in turn is only possible once nobody is interrupting, naming the impact only means something once both sides have actually been heard, and a repair agreed before impact is named is a repair aimed at nothing in particular.",
      outOfOrderNote: "Out of order. What happened gets named plainly first — jumping straight to a repair before either player has been heard just papers over what actually needs saying.",
    },
    {
      id: "pass-the-talking-piece", kind: "turn", target: "talking-piece-dial",
      title: "Turn the talking piece to whoever speaks next",
      cue: "Turn the talking-piece dial to hand the floor from one player to the other — only the one holding it speaks.",
      turn: { turns: 0.5, axis: "y", label: "YOUR TURN" },
      why: "A circle where only the person holding the talking piece speaks is a small, physical rule that stops a conversation about accountability from turning back into an argument where the loudest voice wins. Turning it from one player to the other makes whose turn it is to talk something the whole group can see, not something the coach has to keep re-asserting out loud.",
    },
    {
      id: "accountability-tempo", kind: "gauge", target: "accountability-clock",
      title: "Keep the accountability conversation at the right tempo",
      cue: "Commit when the conversation reads steady — not rushed through, not dragged into a public interrogation.",
      gauge: {
        label: "TEMPO", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => (t < 0.42 ? "rushed — nobody actually heard" : t <= 0.6 ? "steady — both sides heard" : "dragged out — turning into a lecture"),
        missNote: "Outside the band. Rushed through means neither player actually processed what was said; dragged out turns a repair conversation into a public lecture. Find steady and commit.",
      },
      why: "A circle-up rushed through to get back to the drill sooner leaves both players having said the words without meaning them, and one dragged out past the point either player is still listening turns into exactly the public shaming a genuine apology is supposed to avoid. The conversation only works run at its own pace, briefly and completely.",
    },
    {
      id: "hold-the-apology-with-eye-contact", kind: "hold", target: "apology-marker", seconds: 5,
      title: "Hold the apology long enough for it to be real",
      cue: "Each player looks at the other and says what they are actually sorry for — hold here, no rushing past it.",
      why: "An apology muttered while looking at the floor is a word said to end the conversation, not a repair. Holding this moment long enough for each player to actually look at the other and name the specific thing they are sorry for is what separates a genuine accountability step from a formality performed to get back on the court faster.",
      holdBreakNote: "The apology got cut short before it landed. Hold it long enough for both players to actually say and hear it.",
    },
    {
      id: "spot-the-signs-it-is-not-resolved", kind: "find", noHint: true,
      targets: ["residue-avoiding-eye-contact", "residue-still-muttering", "residue-teammates-taking-sides"],
      itemNames: {
        "residue-avoiding-eye-contact": "the two players still avoiding each other's eyes",
        "residue-still-muttering": "a player still muttering under their breath",
        "residue-teammates-taking-sides": "teammates on the bench visibly taking sides",
      },
      itemNotes: {
        "residue-avoiding-eye-contact": "Avoided eye contact after an apology means the repair has not actually landed yet. Slow down before moving on.",
        "residue-still-muttering": "Muttering after the fact is the conflict still running underneath the words that were said out loud. Check in before the drill resumes.",
        "residue-teammates-taking-sides": "A bench splitting into camps keeps the conflict alive even after the two players involved have settled it. That needs its own quiet word.",
      },
      decoyNotes: {
        "residue-back-to-normal-banter": "Two players already back to their normal joking around is the repair actually working. Look for what has not settled.",
      },
      title: "Spot the signs the conflict is not actually resolved",
      cue: "Watch both players and the bench for what the words alone did not fix. Mark what still needs attention.",
      why: "Saying sorry and meaning it are not always the same moment, and a coach who moves straight back to the drill the instant the apology is said can miss the difference. Avoided eye contact, muttering, and a bench that has quietly picked sides are all signs the repair needs one more minute before the team is actually ready to play together again.",
    },
    {
      id: "repair-the-handshake", kind: "drag",
      title: "Move the repair from agreed to done",
      cue: "Drag the handshake token from the 'still owed' side of the board to the 'repaired' spot.",
      target: "handshake-token",
      drag: { to: "repaired-spot", radius: 0.45, missNote: "Still on the 'still owed' side. A repair agreed in words but not physically carried out is a repair still owed — move the token all the way to the repaired spot." },
      why: "Agreeing to repair things is a sentence; actually shaking hands or bumping fists is the action that makes it real to both players and visible to the rest of the team. A physical token moved from owed to done gives the abstract idea of repair something concrete to stand for, the same trick that works for letting go of a missed shot.",
    },
    {
      id: "quiet-word-with-the-instigator", kind: "select", target: "quiet-word-spot",
      title: "Give the player who started it a quiet word, not a public one",
      cue: "Step to the side with the player who threw the first shove — a short, calm sentence, away from the rest of the team.",
      why: "A correction given quietly, one to one, and briefly is heard as coaching; the same words said in front of the team become a second public consequence stacked on top of whatever the circle-up already asked of that player. Calm, private and observable correction is the standard safe-sport guidance sets for adults working with young athletes.",
    },
    {
      id: "hold-team-trust-while-rejoining-the-drill", kind: "track", target: "team-trust-meter", seconds: 8,
      title: "Hold team trust while the drill starts back up",
      cue: "Keep the team's trust in band as the two players rejoin the drill — not tense and guarded, not forced into fake normal.",
      track: {
        start: 0.3, green: [0.38, 0.6], rise: 0.48, fall: 0.4, drift: 0.14, label: "TEAM TRUST",
        readout: (v) => (v < 0.38 ? "guarded — still tense" : v > 0.6 ? "forced — papering over it" : "settling back in, genuinely"),
      },
      why: "Rejoining the drill too soon leaves a team playing tense and guarded around each other, and forcing everyone to act like nothing happened just buries the tension where a coach cannot see it anymore. Holding trust in band as the drill restarts is what tells a coach the repair actually held rather than only looked finished from the sideline.",
      holdBreakNote: "Trust left the band — either still guarded, or forced into acting like nothing happened. Slow the drill back down before pushing further.",
    },
    {
      id: "log-the-incident-and-repair", kind: "select", target: "practice-log-board",
      title: "Log the incident and the repair",
      cue: "Record what happened, how the circle-up went, and anything the athletic trainer checked on either player.",
      why: "What actually happened, how the circle-up went and anything the athletic trainer noticed on either player are what protect both players and the coach if the incident is ever asked about later, and they are what the next practice needs if the same two players need checking on again.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "At the bench: how the circle-up felt to run, anything either of you saw, and is everybody good to carry on?",
      why: "Separating two players and running a circle-up takes something out of the adults doing it too. A short check-in — what did you see, how did that feel to manage, is a follow-up call worth making to either family — keeps the staff working as a team and is exactly the kind of noticing the guide's check-in points to.",
    },
  ],

  interrupts: [
    {
      id: "a-teammate-nearly-jumps-in",
      kind: "Heated moment",
      after: "cooling-off-pause", delay: 3, seconds: 12,
      alert: "A teammate on the bench jumps up and starts moving toward the two separated players, ready to get involved.",
      cue: "Send the assistant to intercept the teammate and hold the bench back — the head coach stays with the two players.",
      target: "assistant-intercept-spot",
      why: "A third player joining a conflict that was already being handled turns a two-person incident into a bigger one, and the fastest way to stop it is an adult who is not also running the cooling-off pause. Sending the assistant to intercept keeps the head coach focused on the two players who actually need it and keeps the rest of the bench exactly where it should be.",
      missNote: "Nobody intercepted the teammate, and by the time the coach noticed, three more players had drifted toward the confrontation instead of staying on the bench.",
      wrongNote: "That does not stop the teammate from getting involved. Send the assistant to intercept them and hold the bench back.",
    },
    {
      id: "a-parent-storms-onto-the-court",
      kind: "Parent at the door",
      after: "hold-team-trust-while-rejoining-the-drill", delay: 3, seconds: 12,
      alert: "A parent who saw the shove from the stands comes straight onto the court demanding to know what happened, right in the middle of the drill.",
      cue: "Send the assistant to walk the parent off the court and set a time to talk after practice — keep the head coach with the team and the drill running.",
      target: "assistant-parent-spot",
      why: "A parent coming onto the live court mid-drill is itself a safety problem before it is a conversation problem, and it undoes the trust the team just rebuilt if the head coach stops everything to argue with them in front of the players. Sending the assistant to walk the parent off calmly, with a real time set to talk later, keeps both the floor and the repair intact.",
      missNote: "The head coach stopped the drill to argue with the parent on the court, and the team stood around watching the whole exchange instead of finishing what the circle-up had just started to rebuild.",
      wrongNote: "That does not get the parent off the live floor. Send the assistant to walk them off and set a time to talk after practice.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, BBK_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBK_ACCENT, { emissive: o.color ?? BBK_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBK_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#2a1c0c", accent: o.accent ?? BBK_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBK_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(30,20,10,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBK_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#f4e2c8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBK_ACCENT, { rough: 0.5, emissive: o.accent ?? BBK_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const basketball = (parent, x, y, z, r = 0.11) => ball(parent, r, x, y, z, 0xd8641e, { rough: 0.75, seg: 16 });

    // ------------------------------------------------------------ the lane and hoop
    const laneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#2c2214", base2: "#261e10", seam: "rgba(10,8,2,0.5)",
    }), { repeat: 2, px: 384 });
    const lane = box(g, 1.6, 0.02, 2.2, 0, 0.012, -1.6, 0x2c2214, { rough: 0.9, cast: false });
    lane.material = texturedMat(laneTex, { rough: 0.9, metal: 0.02, color: 0xe8dcc0 });
    const hoop = group(g, 0, 0, -3.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    const rim = torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 });
    rim.rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });

    // ------------------------------------------------------------ the shove scene
    const looseBall = basketball(g, 0.35, 0.11, -1.15);
    bead(0.35, 0.45, -1.15, "shove-loose-ball", "Loose ball at the shove spot", { w: 0.42 });
    const playerA = standingFigure(g, -0.25, -1.3, { ry: 1.9, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    const playerB = standingFigure(g, 0.35, -1.15, { ry: -1.2, cloth: 0xf2f2f2, trousers: 0x14283a, atStation: true });
    bead(0.05, 2.0, -1.22, "shove-fists-clenched", "Fists still clenched", { w: 0.4 });
    const circlingTeammate = standingFigure(g, -1.1, -0.4, { ry: 1.0, cloth: 0x7a3a1a, trousers: 0x2b2f35, atStation: true });
    bead(-1.1, 2.0, -0.4, "shove-bystander-circling", "Teammate circling in", { w: 0.4 });
    bead(1.4, 0.6, 0.4, "shove-teammate-stepping-back", "Teammate stepping back", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ separation, reporting, cooldown
    card(-2.4, 1.4, -2.9, "separation-spot-card", "Separate first", "SPACE BEFORE\nWORDS", { w: 0.4, cw: 0.4 });
    card(2.0, 1.35, -2.5, "reporting-line-card", "Reporting line", "LOG IT.\nNOT TOO MINOR.", { ry: -0.4, w: 0.42, cw: 0.42 });
    stand(1.2, -0.05, 0, 1.0);
    bead(1.2, 1.15, -0.05, "cooldown-marker", "Cooling-off pause", { w: 0.42 });

    // ------------------------------------------------------------ the circle-up
    const circle = cyl(g, 0.9, 0.9, 0.006, -0.6, 0.02, 0.6, BBK_ACCENT, { rough: 0.6, opacity: 0.5, emissive: BBK_ACCENT, ei: 0.35, seg: 28, cast: false });
    void circle;
    const routine = group(g, -2.35, 0, -2.1, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["circle-name-it", "1 · Name what happened", 0.56], ["circle-each-side", "2 · Each side speaks", 0.82],
      ["circle-impact", "3 · Name the impact", 1.08], ["circle-repair", "4 · Agree a repair", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBK_ACCENT, { emissive: BBK_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBK_CSS, w: 0.44 });
      reg(hits, b, lid);
    }
    const talkStand = stand(-0.6, 1.05, 0, 0.7);
    const talkPiece = cyl(talkStand, 0.05, 0.05, 0.22, 0, 0.85, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(talkStand, "Talking piece", 0, 1.05, 0, { css: BBK_CSS, w: 0.32 });
    reg(hits, talkPiece, "talking-piece-dial");
    const tStand = stand(1.75, 0.75, -0.3);
    const tempo = instrument(tStand, 0, 1.02, 0, { idle: "TEMPO", color: BBK_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Accountability tempo", 0, 1.22, 0, { css: BBK_CSS, w: 0.4 });
    reg(hits, tempo, "accountability-clock");
    stand(0.75, -1.95, 0, 0.9);
    bead(0.75, 1.05, -1.95, "apology-marker", "Apology, held long enough", { w: 0.46 });

    // ------------------------------------------------------------ residue watch, repair board
    bead(-0.8, 0.55, 1.1, "residue-avoiding-eye-contact", "Avoiding eye contact", { w: 0.42, r: 0.024 });
    bead(0.85, 0.6, 1.25, "residue-still-muttering", "Still muttering", { w: 0.36, r: 0.024 });
    bead(0.1, 0.9, 1.85, "residue-teammates-taking-sides", "Bench taking sides", { w: 0.42, r: 0.024 });
    bead(-1.4, 0.55, 1.6, "residue-back-to-normal-banter", "Back to normal banter", { w: 0.4, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const bench = group(g, -1.5, 0, 1.9);
    box(bench, 2.0, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
    for (const sx of [-0.9, 0.9]) box(bench, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    const sidingTeammates = [
      standingFigure(g, -1.9, 1.95, { ry: 0.5, cloth: 0x3a5a7a, trousers: 0x2b2f35, atStation: true }),
      standingFigure(g, -0.9, 1.95, { ry: -0.5, cloth: 0x7a3a1a, trousers: 0x2b2f35, atStation: true }),
    ];
    const repair = group(g, -3.1, 0, 0.75, 1.1);
    for (const sx of [-0.32, 0.32]) cyl(repair, 0.018, 0.018, 1.4, sx, 0.7, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    decal(repair, 0.74, 0.46, 0, 1.22, 0.02, (cx, w, h) => {
      cx.fillStyle = "#f4f6f8"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a2430"; cx.font = `700 ${Math.round(h * 0.12)}px Arial`; cx.textAlign = "center";
      cx.fillText("STILL OWED", w * 0.27, h * 0.16); cx.fillText("REPAIRED", w * 0.73, h * 0.16);
      cx.fillRect(w * 0.5 - 1, h * 0.08, 2, h * 0.86);
    }, { px: 320 });
    const handshakeToken = cyl(repair, 0.05, 0.05, 0.02, -0.2, 1.16, 0.03, 0xd8a54a, { rough: 0.5, seg: 14 });
    handshakeToken.rotation.x = Math.PI / 2;
    holoTag(repair, "Handshake token", -0.2, 1.5, 0.03, { css: BBK_CSS, w: 0.36 });
    reg(hits, handshakeToken, "handshake-token");
    const repairedSpot = box(repair, 0.16, 0.16, 0.01, 0.2, 1.16, 0.02, BBK_ACCENT, { emissive: BBK_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, repairedSpot, "repaired-spot");
    bead(2.35, 0.75, 1.0, "quiet-word-spot", "Quiet word, away from the group", { color: 0xf2c14b, css: "#f2c14b", w: 0.5 });

    // ------------------------------------------------------------ trust meter, bench spots
    const cStand = stand(-1.3, 1.65, -0.35);
    const trustMeter = instrument(cStand, 0, 1.02, 0, { idle: "TRUST", color: BBK_ACCENT, w: 0.2, d: 0.26 });
    holoTag(cStand, "Team trust while rejoining", 0, 1.22, 0, { css: BBK_CSS, w: 0.46 });
    reg(hits, trustMeter, "team-trust-meter");
    bead(-1.1, 1.6, -0.0, "assistant-intercept-spot", "Assistant intercepts here", { color: 0x59c97b, css: "#59c97b", w: 0.44 });
    const doorway = group(g, 3.45, 0, 1.3, -Math.PI / 2);
    box(doorway, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(doorway, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    const parent = standingFigure(g, 3.0, 0.6, { ry: -2.2, cloth: 0x4a5a6a, atStation: true });
    parent.visible = false;
    bead(3.0, 1.4, 2.0, "assistant-parent-spot", "Assistant walks the parent off", { color: 0xf2c14b, css: "#f2c14b", w: 0.5 });

    // ------------------------------------------------------------ boards, guide
    const log = board(0.6, 0.36, 1.5, 1.72, -3.1, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Incident · circle-up notes", "Trainer check · both players"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.2, 1.66, -0.3, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.6, 0.3, 0.4, 2.1, -3.1, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Separate it. Then repair it."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.12, x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.14;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the wrong moves
    hazardCard(-1.85, 1.25, 0.35, "let-the-drill-keep-running-around-them", "Keep the drill going near them?", "PLAY ON\nAROUND THEM", 0.4);
    hazardCard(-0.6, 1.25, 1.2, "force-a-fake-apology-in-front-of-everyone", "Force a sorry, right now?", "SAY SORRY.\nEVERYONE WATCH", 0.1);
    hazardCard(0.6, 1.25, 1.2, "let-teammates-pick-sides", "Let the bench argue it out?", "WHO STARTED\nIT? DISCUSS", -0.1);
    hazardCard(1.9, 1.25, 0.35, "skip-the-report-because-it-was-minor", "Skip logging it?", "TOO MINOR\nTO WRITE UP", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 1.65, 1.55, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 1.65, 2.1, 1.55, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void talkPiece; void sidingTeammates; void doorLeaf;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, -1.3),

      onStepComplete(step) {
        if (step.id === "scan-the-court-after-the-shove") { looseBall.visible = false; circlingTeammate.position.set(-1.4, 0, 0.2); }
        if (step.id === "repair-the-handshake") handshakeToken.position.set(0.2, 1.16, 0.02);
        if (step.id === "log-the-incident-and-repair") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Circle-up held, repair complete", "Both players checked and cleared"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "a-teammate-nearly-jumps-in") {
          circlingTeammate.position.set(-0.6, 0, -0.5);
        }
        if (it.id === "a-parent-storms-onto-the-court") {
          parent.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "a-teammate-nearly-jumps-in") {
          assistant.position.set(-1.1, 0, 0.0); assistant.rotation.y = 1.2;
          circlingTeammate.position.set(-1.7, 0, 0.8);
          paintGuide("That was the right call — the bench stayed put and the two players kept the floor to themselves.");
        }
        if (it.id === "a-parent-storms-onto-the-court") {
          assistant.position.set(2.7, 0, 1.6); assistant.rotation.y = -1.4;
          parent.position.set(3.3, 0, 2.4);
          paintGuide("Handled calmly — the parent is off the live floor and the team kept rebuilding trust without an audience.");
        }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "accountability-tempo") {
          const ok = gg.t >= 0.42 && gg.t <= 0.6;
          repaint(tempo.userData.screen, signFace(ok ? "STEADY" : gg.t < 0.42 ? "RUSHED" : "DRAGGED", { bg: "#2a1c0c", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.48 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-team-trust-while-rejoining-the-drill") {
          const ok = tr.v >= 0.38 && tr.v <= 0.6;
          repaint(trustMeter.userData.screen, signFace(ok ? "SETTLING" : tr.v < 0.38 ? "GUARDED" : "FORCED", { bg: "#2a1c0c", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.44 }));
        }
      },
    };
  },
};
