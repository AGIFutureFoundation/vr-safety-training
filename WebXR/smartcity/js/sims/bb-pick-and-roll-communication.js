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

// SmartCiti.X~ Basketball Fundamentals VR — pick-and-roll communication.
// Two defenders meet a ball screen, and whether they switch, fight over or
// get caught depends on one word said early enough to be heard. The lesson
// is talk before you move: the screen is called by the defender who sees it,
// the switch is agreed out loud, and the recovery is announced before either
// player leaves their man. Taught as a teamwork habit under USA Basketball's
// youth guidelines and NFHS rules for legal screening.
//
// Sited generically in the gym-court district; the team and players are
// invented. No statistic, study or named player is asserted.

const PNR_ACCENT = 0x3bb3ff;
const PNR_CSS = "#3bb3ff";

export const SIM_BB_PICK_AND_ROLL_COMMUNICATION = {
  id: "bb-pick-and-roll-communication",
  index: "725",
  domain: "Youth Sports",
  trade: "Youth basketball player and coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines for teaching team defence and communication at an age-appropriate stage; NFHS basketball rules for what makes a screen legal — set still, inside the screener's own space — and what a moving screen is; the Association for Applied Sport Psychology's guidance on attention and cue words under pressure; CDC Heads Up for the blind-side collision a silent screen causes; the U.S. Center for SafeSport for correction that is observable and never shaming; the American Red Cross first aid course for the check before a player who collided goes back in; AFSCME and SEIU parks-and-recreation staff who run the public gym",
  name: "Pick-and-Roll Communication",
  title: simTitle("Pick-and-Roll Communication"),
  tagline: "Talk before you move: the screen called by whoever sees it, the switch agreed out loud, the recovery announced before anybody leaves their man",
  accent: PNR_ACCENT,
  accentCss: PNR_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"heard-it-first","name":"Heard It First","note":"Every screen called, every switch agreed and every recovery announced before a defender moved"},

  supportLine: "your coach, the assistant who ran the drill, or the teammate you guard beside — a collision you did not see coming is worth talking through afterwards",

  game: system({
    name: "Talk Board",
    currency: "CALLS",
    ranks: ["Quiet Defender","Caller","Floor Voice","Defensive Captain","Team Voice"],
    badges: [
      { id: "clean-read", name: "Read the Floor", note: "Everything in the opening scan found first time", test: AWARD.stepClean("read-the-screen-coming") },
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
    "switch-silently-and-hope": "You switched onto the roller without saying a word, trusting your teammate would see it too. Two defenders who both switch, or both stay, leave the screener rolling free to the rim and usually send the two of you into each other — the silent switch is how a blind-side collision happens, which is exactly the knock to the head CDC Heads Up asks coaches to take out of play.",
    "reach-around-the-screener": "You reached an arm around the screener to get back to the ball-handler instead of stepping over the top. Reaching through a set screen is a foul under NFHS rules and pulls the screener off balance, and the arm caught between two moving bodies is how a finger or shoulder gets jammed in a drill that should have been about the feet and the voice.",
    "blame-the-teammate-out-loud": "You shouted at your teammate for missing the switch while play was still live. Blame shouted across the floor makes the next call less likely, not more, because a teammate who expects to be yelled at stops talking; the Association for Applied Sport Psychology's guidance on team communication is to say the next job, not the last mistake.",
    "call-it-too-late": "You called \"screen\" as your body was already hitting it. A call made at contact tells your teammate nothing they can use — the whole value of the word is the half-second it buys, so a late call is the same as a silent one with a bruise added."
  },

  lateNotes: {
    "pnr-practice-log": "The log closes the drill after the talk has held at game speed — nothing to record yet.",
    "pnr-crew-checkin": "The check-in with the coach and your partner comes at the very end."
  },

  steps: [
    {
      id: "read-the-screen-coming",
      kind: "find",
      noHint: true,
      targets: [
        "pnr-screener-setting",
        "pnr-handler-waiting",
        "pnr-roll-lane-open"
      ],
      itemNames: {
        "pnr-screener-setting": "the screener stepping up to set",
        "pnr-handler-waiting": "the ball-handler waiting to use it",
        "pnr-roll-lane-open": "the open lane the roller will dive into"
      },
      itemNotes: {
        "pnr-screener-setting": "A screener walking up to your side is the first thing to see and the first thing to say. The word starts here.",
        "pnr-handler-waiting": "A ball-handler who stops and waits is setting you up. That pause is your time to talk.",
        "pnr-roll-lane-open": "The lane behind you is where the roller goes once the screen is set. Somebody has to own it out loud."
      },
      decoyNotes: {
        "pnr-shooter-in-corner": "The corner shooter matters later, but it is not the screen. Find what is about to hit you first."
      },
      title: "Read the screen before it arrives",
      cue: "Watch the floor for the screen coming: who is setting it, who will use it, and where the roller will go.",
      why: "The pick-and-roll is beaten or lost before contact. A defender who sees the screener stepping up, the ball-handler pausing to set it up and the empty lane behind has half a second to tell a teammate, and that half-second is the whole play. Reading the floor first is what makes the words that follow early rather than late."
    },
    {
      id: "post-the-team-calls",
      kind: "select",
      target: "pnr-call-card",
      title: "Agree the four calls before the drill",
      cue: "Post the words the team uses — screen, switch, stay, help — so everybody means the same thing by each one.",
      why: "A call only works if both defenders hear the same instruction in it. Agreeing the team's words before the drill — one word for the screen, one for the switch, one for staying, one for help — stops the moment where one player shouts \"switch\" meaning a warning and the other hears an order, which is how two defenders end up on the same man."
    },
    {
      id: "build-the-call-order",
      kind: "sequence",
      targets: [
        "pnr-order-see",
        "pnr-order-call",
        "pnr-order-hear",
        "pnr-order-move"
      ],
      itemNames: {
        "pnr-order-see": "1 · see the screen",
        "pnr-order-call": "2 · call it by name",
        "pnr-order-hear": "3 · hear it answered",
        "pnr-order-move": "4 · then move"
      },
      title: "Put the talk in the order it happens",
      cue: "See it, call it, hear it answered, then move — in that order.",
      why: "Each part needs the one before it: a call without a look is a guess, a move without an answer is a gamble on what your teammate decided, and the answer — a single \"got it\" or \"stay\" — is what turns one player's warning into a shared decision. The order is the lesson, and it is the same order in every rotation the team will ever run.",
      outOfOrderNote: "Out of order. You move only after the call has been answered — moving first is exactly the silent switch the drill exists to break."
    },
    {
      id: "screener-holds-still",
      kind: "hold",
      target: "pnr-screen-set-spot",
      seconds: 6,
      title: "As the screener, hold the screen still",
      cue: "Set the screen in your own space and hold still — no lean, no hip out, feet planted.",
      why: "A legal screen under NFHS rules is set still, inside the screener's own space, with the defender given room to see it. Holding it still is also what makes the call possible: a defender can name a screen that is standing there, but a moving screen arrives from nowhere and turns a teaching drill into a collision nobody had time to warn about.",
      holdBreakNote: "The screen moved before the hold finished. A screen that drifts into the defender is a foul and a collision — plant and hold."
    },
    {
      id: "turn-the-switch-dial",
      kind: "turn",
      target: "pnr-switch-dial",
      turn: {
        turns: 0.5,
        axis: "y",
        label: "SWITCH"
      },
      title: "Turn the dial to the call you agreed",
      cue: "Turn the dial from STAY to SWITCH — the call your partner answered — so the whole team sees what was decided.",
      why: "The dial stands for the one decision the two defenders make together: switch men or stay with your own. Turning it only after the answer has come back makes the decision visible to the three teammates behind the play, who each have to adjust where they stand the moment the switch happens rather than a beat later."
    },
    {
      id: "time-the-call",
      kind: "gauge",
      target: "pnr-call-timing",
      gauge: {
        label: "TIMING",
        speed: 0.62,
        green: [
          0.4,
          0.58
        ],
        missNote: "Outside the band. Too early and the screener changes angle after your call; too late and it lands at contact. Call it as the screener plants.",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.58 ? "above the band" : "in the band"),
      },
      title: "Time the call as the screener plants",
      cue: "Commit when the call lands in the window — after the screener commits, before the ball-handler moves.",
      why: "A call has a window. Shouted too early, the screener simply changes the angle and your teammate is warned about a screen that never comes; shouted at contact, it is noise. Landing the word as the screener plants their feet gives the defender being screened time to step over, and the partner time to show, which is the whole point of talking at all."
    },
    {
      id: "announce-the-recovery",
      kind: "drag",
      target: "pnr-recovery-token",
      drag: {
        to: "pnr-recovery-spot",
        radius: 0.45,
        missNote: "Still short. The recovery is announced and then run all the way back to your own man — leaving it halfway leaves two defenders on one player."
      },
      title: "Announce the recovery and run it",
      cue: "Say \"back\" and drag the recovery token from the helper's spot back to your own man.",
      why: "A defender who showed on the ball-handler has left somebody open, and the recovery is when the team is thinnest. Saying \"back\" before leaving tells the teammate who was screened that the ball is theirs again; running the recovery all the way home, rather than drifting, is what stops the open shooter the show created from getting the easiest shot of the drill."
    },
    {
      id: "eyes-up-name-the-man",
      kind: "select",
      target: "pnr-eyes-up-card",
      title: "Name your man with your eyes up",
      cue: "After the switch, say the name of the player you now have — eyes on the floor, not on the ball.",
      why: "The switch is only finished when both defenders have said who they now guard. Naming the man with your eyes up stops the gap where each defender assumes the other took the roller; it is a small habit, but it is the difference between a defence that talks in words and one that talks in hopes."
    },
    {
      id: "spot-the-silent-spots",
      kind: "find",
      noHint: true,
      targets: [
        "pnr-silent-weak-side",
        "pnr-silent-hands-down",
        "pnr-silent-head-down"
      ],
      itemNames: {
        "pnr-silent-weak-side": "a weak-side defender who has said nothing",
        "pnr-silent-hands-down": "a defender with hands down, not pointing",
        "pnr-silent-head-down": "a player looking at the floor after a mistake"
      },
      itemNotes: {
        "pnr-silent-weak-side": "The weak side sees the whole play and says nothing. That voice is the one that catches the roller.",
        "pnr-silent-hands-down": "Pointing is talking without words. A defender with hands down is not telling anyone who they have.",
        "pnr-silent-head-down": "Head down after a mistake means the next call will not come. One word to them brings the voice back."
      },
      decoyNotes: {
        "pnr-talker-pointing": "A teammate pointing and calling is doing exactly the job. Look for who has gone quiet."
      },
      title: "Find where the defence has gone quiet",
      cue: "Watch the five defenders during the rep and mark where the talk has stopped.",
      why: "A defence does not go quiet all at once; it goes quiet in places. The weak-side defender who can see everything and says nothing, the player with hands down, the teammate who looked at the floor after a mistake — each is a spot where the next screen will not be called, and a coach or captain who can see them can fix them with a single word."
    },
    {
      id: "hold-the-talk-level",
      kind: "track",
      target: "pnr-talk-meter",
      seconds: 8,
      track: {
        start: 0.3,
        green: [
          0.4,
          0.62
        ],
        rise: 0.46,
        fall: 0.38,
        drift: 0.14,
        label: "TALK",
        readout: (v) => (v < 0.4 ? "below the band" : v > 0.62 ? "above the band" : "in the band"),
      },
      title: "Keep the team's talk steady through a live rep",
      cue: "Hold the talk level in the band through the rep — not silent, not five people shouting over each other.",
      why: "A silent defence is caught by every screen, and a defence where everyone shouts at once is just as lost, because nobody can pick out the one call that matters. Holding the talk steady — one clear voice for each screen, one answer, a name after each switch — is the level where information actually moves between five players at speed.",
      holdBreakNote: "The talk left the band — either gone quiet or turned into shouting. Bring it back to one call and one answer."
    },
    {
      id: "film-the-rep",
      kind: "select",
      target: "pnr-film-board",
      doneLine: "Talk heard on every screen",
      title: "Watch the rep back for the words, not only the feet",
      cue: "Open the clip board and listen: was every screen called before contact, every switch answered?",
      why: "Film usually gets watched for footwork and the result. Listening to the rep instead — was the call early, was it answered, did anybody name their man — is how a team learns that communication is a skill with its own mistakes, and how a quiet player hears that their voice was the one that was missing."
    },
    {
      id: "log-the-drill",
      kind: "select",
      target: "pnr-practice-log",
      doneLine: "Calls, collisions, checks recorded",
      title: "Log the drill and any collision",
      cue: "Record what was practised, any contact between defenders and what the trainer checked.",
      why: "A collision in a screening drill is recorded even when nobody seems hurt, because a head knock can show its signs later and the next coach needs to know. The log also carries what the team worked on, so tomorrow's practice starts from where the talk broke down rather than from the beginning."
    },
    {
      id: "crew-check-in",
      kind: "select",
      target: "pnr-crew-checkin",
      doneLine: "Everybody good to carry on",
      title: "Check in with the coach and your defensive partner",
      cue: "At the bench: what worked, where the talk dropped, and is everybody good?",
      why: "The two defenders who guarded the screen together are the ones who know whether the calls worked. A short check-in — what did you hear, when did you stop talking, are you alright after that collision — keeps the pair trusting each other and gives the coach the one thing film cannot show: how the play felt from inside it."
    }
  ],

  interrupts: [
    {
      id: "a-second-screen-comes",
      kind: "Second screen",
      after: "screener-holds-still",
      delay: 3,
      seconds: 12,
      target: "pnr-second-screen-call",
      alert: "A second screener steps up on the other side while the first screen is still set — a double screen your partner cannot see.",
      cue: "Call the second screen out loud from the weak side — the screener keeps holding.",
      why: "The defender who can see a second screen is almost never the one it is coming for. Calling it from the weak side, while the first screen is still held, is the same habit at a harder moment: the player with the view speaks, the player being screened listens.",
      missNote: "Nobody called the second screen. The defender stepped over the first one and ran straight into the second at full speed, and the trainer had to come on to check a player who never saw it coming.",
      wrongNote: "That is not the call for the second screen. Say it from the weak side where you can see it."
    },
    {
      id: "a-teammate-goes-down",
      kind: "Player down",
      after: "hold-the-talk-level",
      delay: 3,
      seconds: 12,
      target: "pnr-stop-play-call",
      alert: "Two defenders collide on a switch and one stays down on the floor, holding their head.",
      cue: "Call the stop, wave the athletic trainer in and keep everybody back — the talk meter can wait.",
      why: "A player down after a collision stops the drill before anything else. Calling the stop loudly, bringing the trainer and keeping teammates from crowding in is what CDC Heads Up asks of everyone at a youth practice: a possible head injury is removed from play and checked, never walked off.",
      missNote: "Play went on around the player on the floor for several more seconds, and a teammate nearly tripped over them before the coach saw it.",
      wrongNote: "That does not stop play. Call the stop and wave the trainer in."
    }
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = PNR_ACCENT;
    const CSS = PNR_CSS;
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
    bead(-1.22, 0.90, -0.27, "pnr-screener-setting", "the screener stepping up to set", {});
    bead(-1.42, 1.18, -0.62, "pnr-handler-waiting", "the ball-handler waiting to use it", {});
    bead(-1.03, 1.46, -0.71, "pnr-roll-lane-open", "the open lane the roller will dive into", {});
    bead(-1.08, 0.90, -1.11, "pnr-shooter-in-corner", "Corner shooter standing still", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "pnr-order-see", "1 · see the screen", {});
    bead(-0.58, 1.46, -1.44, "pnr-order-call", "2 · call it by name", {});
    bead(-0.24, 0.90, -1.23, "pnr-order-hear", "3 · hear it answered", {});
    bead(0, 1.18, -1.55, "pnr-order-move", "4 · then move", {});
    bead(0.24, 1.46, -1.23, "pnr-screen-set-spot", "Screen set, feet still", {});
    bead(0.58, 0.90, -1.44, "pnr-silent-weak-side", "a weak-side defender who has said nothing", {});
    bead(0.68, 1.18, -1.05, "pnr-silent-hands-down", "a defender with hands down, not pointing", {});
    bead(1.08, 1.46, -1.11, "pnr-silent-head-down", "a player looking at the floor after a mistake", {});
    bead(1.03, 0.90, -0.71, "pnr-talker-pointing", "Teammate pointing and calling", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "pnr-second-screen-call", "Call the second screen", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "pnr-stop-play-call", "Stop play, wave the trainer", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "pnr-call-card", "The team's four calls", "SCREEN · SWITCH\n· STAY · HELP", { ry: 1.20 });
    dials["pnr-switch-dial"] = dial(-1.89, -1.4, 0.93, "pnr-switch-dial", "Switch or stay");
    meters["pnr-call-timing"] = meter(-1.45, -1.85, 0.67, "pnr-call-timing", "When the call lands");
    tokens["pnr-recovery-token"] = token(-0.92, -2.16, 0.40, "pnr-recovery-token", "Recovery token");
    spots["pnr-recovery-spot"] = spot(-0.31, -2.33, 0.13, "pnr-recovery-spot", "Back to your own man");
    card(0.31, 1.35, -2.33, "pnr-eyes-up-card", "Eyes up, name your man", "EYES UP.\nNAME THE MAN", { ry: -0.13 });
    meters["pnr-talk-meter"] = meter(0.92, -2.16, -0.40, "pnr-talk-meter", "Team talk level");
    boards["pnr-film-board"] = board(1.45, -1.85, -0.67, "pnr-film-board", "Clip of the rep");
    boards["pnr-practice-log"] = board(1.89, -1.4, -0.93, "pnr-practice-log", "Practice log");
    boards["pnr-crew-checkin"] = board(2.19, -0.85, -1.20, "pnr-crew-checkin", "Coach and partner check-in");
    hazardCard(-1.53, 0.72, -1.21, "switch-silently-and-hope", "Switch without a word?", "SWITCH.\nSAY NOTHING", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "reach-around-the-screener", "Reach around the screen?", "ARM THROUGH\nTHE SCREEN", 0.30);
    hazardCard(0.58, 0.72, -1.86, "blame-the-teammate-out-loud", "Shout at the teammate who missed it?", "THAT WAS\nYOUR MAN!", -0.30);
    hazardCard(1.53, 0.72, -1.21, "call-it-too-late", "Call it at contact?", "SCREEN!\n(AT CONTACT)", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Talk before you move."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
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
    crew["partner"] = standingFigure(g, 2.9, -2.3, { ry: -0.9, cloth: 0xf2f2f2, trousers: 0x2b2f35, atStation: true });
    holoTag(g, "Defensive partner", 2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["a-second-screen-comes"] = standingFigure(g, 1.5, -3, { ry: 3.1, cloth: 0x3a5a7a, atStation: true });
    arrivals["a-second-screen-comes"].visible = false;
    arrivals["a-teammate-goes-down"] = standingFigure(g, -1.5, -3, { ry: 0.4, cloth: 0xf2f2f2, atStation: true });
    arrivals["a-teammate-goes-down"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "announce-the-recovery") { const s = spots["pnr-recovery-spot"]; tokens["pnr-recovery-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "film-the-rep") repaint(boards["pnr-film-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Talk heard on every screen"], "#59c97b"));
        if (step.id === "log-the-drill") repaint(boards["pnr-practice-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Calls, collisions, checks recorded"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["pnr-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Everybody good to carry on"], "#59c97b"));
        if (step.id === "spot-the-silent-spots") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("teammate-mistake", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "film-the-rep") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 1 }) : "Say the next job, not the last mistake.");
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
        if (it.id === "a-second-screen-comes") { crew["partner"].position.set(2.2, 0, -2.6); if (who) who.position.set(1.9, 0, -3.4); paintGuide("Heard and answered — the second screen was called from the side that could see it."); }
        if (it.id === "a-teammate-goes-down") { crew["trainer"].position.set(-1.9, 0, -2.7); if (who) who.position.set(-1.5, 0, -3.3); paintGuide("Play stopped, trainer in, nobody crowding — that player is checked before anything else happens."); }
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
