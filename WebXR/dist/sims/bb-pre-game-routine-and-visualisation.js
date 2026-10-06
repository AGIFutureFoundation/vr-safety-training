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

// SmartCiti.X~ Basketball Fundamentals VR — the pre-game routine and
// visualisation. The hour before tip-off, when a locker room can either build
// a team up calmly or wind it up into something reckless. The routine here —
// gear checked, a genuinely quiet visualisation, a shoot-around, a short
// captain's word — is taught as a practice the Association for Applied Sport
// Psychology recommends, not as a guarantee of anything. No outcome is
// promised and no research finding or statistic is asserted.
//
// Sited generically in the gym-court district; the team and players are
// invented. No rule number or time limit is quoted.

const BBV_ACCENT = 0xa78bfa;
const BBV_CSS = "#a78bfa";

export const SIM_BB_PRE_GAME_ROUTINE_AND_VISUALISATION = {
  id: "bb-pre-game-routine-and-visualisation",
  index: "344",
  domain: "Youth Sports",
  trade: "Youth basketball coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines on a calm, rest-first pre-game routine rather than last-minute extra work; the Association for Applied Sport Psychology's guidance on pre-performance routines and visualisation — picturing a play calmly and specifically before it happens; NFHS basketball rules and its sportsmanship expectations for how a team carries itself before it ever takes the floor; CDC Heads Up for a heat or head concern noticed before the game starts; the U.S. Center for SafeSport for privacy and consent in a locker room and calm handling of a parent at the door; the American Red Cross first aid course for a player who is unwell before tip-off",
  name: "Pre-Game Routine and Visualisation",
  title: simTitle("Pre-Game Routine and Visualisation"),
  tagline: "Gear checked, a genuinely quiet visualisation, a shoot-around and a short captain's word — a calm hour before tip-off instead of a wound-up one",
  accent: BBV_ACCENT,
  accentCss: BBV_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "ready-not-wound-up", name: "Ready, Not Wound Up", note: "A pre-game hour that left the team calm, focused and rested, not amped past the point of good decisions" },

  supportLine: "your league's coach coordinator, or the assistant who met the parent at the door with you — a tense pre-game hour is worth talking through afterwards too",

  game: system({
    name: "Tip-Off Countdown",
    currency: "FOCUS POINTS",
    ranks: ["Locker Helper", "Warm-Up Coach", "Assistant Coach", "Head Coach", "Routine Mentor"],
    badges: [
      { id: "clear-locker-room", name: "Clear Locker Room", note: "Every hazard in the locker room found before warm-ups", test: AWARD.stepClean("scan-the-locker-room") },
      { id: "calm-tip-off", name: "Calm Tip-Off", note: "No unsafe action in the whole pre-game hour", test: AWARD.safe },
      { id: "ready-energy", name: "Ready Energy", note: "Energy level and team energy through the final minutes both inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-routine", name: "Clean Routine", note: "No corrections anywhere in the pre-game hour", test: AWARD.clean },
      { id: "steady-through-tip-off", name: "Steady Through Tip-Off", note: "Held team energy in band through the final minutes", test: AWARD.unbroken },
      { id: "on-time-for-tip-off", name: "On Time for Tip-Off", note: "Practice log reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "locker-room-fans-off": "You left the locker room fans off with the door shut before a game already making players sweat before they moved. A stuffy, unventilated room raises the odds of dizziness and heat illness before a player has taken a single competitive step, and it is the kind of thing that is trivial to fix and easy to forget under pre-game pressure.",
    "extra-sprints-right-before-tip": "You had the team run extra sprints right before tip-off so they would 'feel it in their legs'. Youth guidance favours rest before performance, not fresh fatigue loaded on minutes before the game that actually counts — tired legs at tip-off are the last thing a player who has already done a full pre-game warm-up needs.",
    "hype-video-turns-reckless": "You played the loudest, hardest hype video right up until the whistle and let it carry the team onto the floor still amped past focus. Energy that never comes back down before contact starts is exactly the kind of arousal that turns a hard, competitive game into reckless, out-of-control contact in the first few minutes.",
    "phone-recording-without-consent": "You let a phone keep recording players changing and stretching in the locker room without anyone asking first. A locker room is a private space for young athletes, and filming it without consent is exactly the kind of unwatched, unasked-about moment safe-sport guidance expects an adult in charge to notice and stop.",
  },

  lateNotes: {
    "practice-log-board": "The log closes the pre-game hour once the shoot-around and the captain's word have run — nothing to record yet.",
    "crew-checkin-board": "The staff check-in comes after the log, right before tip-off.",
  },

  steps: [
    {
      id: "scan-the-locker-room", kind: "find", noHint: true,
      targets: ["pre-gear-bag-in-doorway", "pre-untied-shoelace", "pre-phone-filming"],
      itemNames: {
        "pre-gear-bag-in-doorway": "a gear bag blocking the doorway",
        "pre-untied-shoelace": "a player with an untied shoelace",
        "pre-phone-filming": "a phone filming the room, unasked",
      },
      itemNotes: {
        "pre-gear-bag-in-doorway": "A bag in the doorway is a trip waiting for the first player moving fast toward the court. Move it to the rack.",
        "pre-untied-shoelace": "A loose lace is a rolled ankle the moment a player plants and cuts. Tie it before warm-ups start.",
        "pre-phone-filming": "Nobody has asked whether it is fine to be filmed changing or stretching. Stop it and ask, or put it away.",
      },
      decoyNotes: {
        "pre-captain-leading-stretch": "A captain leading the stretch calmly is exactly what the routine wants. Look for what is actually wrong.",
      },
      title: "Scan the locker room before warm-ups start",
      cue: "Look around the room. Mark what has to be fixed before the team gets moving.",
      why: "A locker room an hour before a game is full of small, fixable things that become bigger ones once the team is moving fast: a bag in the doorway, a loose lace, a phone recording without anyone's consent. Catching all three now, calmly, sets the tone for a routine that stays calm the rest of the hour.",
    },
    {
      id: "post-the-pregame-schedule", kind: "select", target: "schedule-board",
      title: "Post the pre-game schedule where everyone can see it",
      cue: "Put up the order: arrival and gear check, stretch, visualisation, shoot-around, captain's word.",
      why: "A posted schedule tells every player exactly what is coming and when, which is itself calming — nerves feed on uncertainty. Following the same order before every game also means the routine is something a player can lean on when the game matters more than usual, not something that only exists when things are calm.",
    },
    {
      id: "quiet-visualisation", kind: "hold", target: "visualisation-marker", seconds: 7,
      title: "Hold a genuinely quiet visualisation",
      cue: "The team sits quietly and pictures the game going well — hold this here, no talking over it, no music.",
      why: "The Association for Applied Sport Psychology's guidance on visualisation is that picturing a play calmly and specifically — the catch, the footwork, the shot — rehearses it mentally the way a walk-through rehearses it physically. None of this is promised to change the score; it only works at all if the room is actually quiet enough for a young player to picture anything.",
      holdBreakNote: "The quiet broke before the visualisation finished. Bring the room back down and hold it the whole way through.",
    },
    {
      id: "build-the-pregame-routine", kind: "sequence",
      targets: ["routine-arrival", "routine-stretch", "routine-visualise", "routine-shoot-around"],
      itemNames: {
        "routine-arrival": "arrival and gear check",
        "routine-stretch": "dynamic stretch",
        "routine-visualise": "visualisation",
        "routine-shoot-around": "shoot-around",
      },
      title: "Build the pre-game routine in order",
      cue: "Arrival and gear first, then the stretch, then visualisation, then the shoot-around.",
      why: "Each part sets up the next: gear checked and bodies warm before anyone tries to sit still and focus, the mind settled by visualisation before the body is asked to perform in the shoot-around. Run out of order, the routine becomes a checklist instead of a build toward tip-off.",
      outOfOrderNote: "Out of order. Gear and the body come first — a mind cannot settle into visualisation while a lace is untied or a hamstring is still cold, and a shoot-around before the mind is calm just rehearses the nerves.",
    },
    {
      id: "choose-a-focus-image", kind: "select", target: "focus-image-card",
      title: "Choose one specific image to picture",
      cue: "Post one concrete picture to hold — a made free throw, a defensive stop, a calm bench — not a vague 'play well'.",
      why: "A specific, practised image is something a young player can actually hold in their mind under nerves; 'play well' gives the mind nothing to picture at all. The image chosen matters less than how concretely it is pictured — the same specific detail a routine anywhere else in this programme relies on.",
    },
    {
      id: "energy-level-check", kind: "gauge", target: "energy-gauge",
      title: "Read the team's energy before it locks in",
      cue: "Commit when the energy reads ready — not flat and sleepy, not amped past focus.",
      gauge: {
        label: "ENERGY", speed: 0.65, green: [0.44, 0.62],
        readout: (t) => (t < 0.44 ? "flat — not switched on yet" : t <= 0.62 ? "ready" : "amped — past focus"),
        missNote: "Outside the band. Flat plays slow to start; amped past focus is where reckless contact starts. Find ready and commit.",
      },
      why: "A team that is flat an hour out will be a step slow at tip-off, and a team wound up past focus is a team about to make its first hard foul in the opening minute without meaning to. Reading energy honestly, rather than assuming louder is always better, is what keeps the hour building toward ready instead of toward reckless.",
    },
    {
      id: "set-the-locker-room-music", kind: "turn", target: "music-dial",
      title: "Set the locker room music to energise, not drown out",
      cue: "Turn the music dial to a level that lifts the room without burying the coach's voice.",
      turn: { turns: 0.5, axis: "z", label: "MUSIC" },
      why: "Music before a game is a tool for energy, not a replacement for the coach being heard. Set too loud, it pushes a team toward the amped-past-focus end of the energy band and drowns out the one voice that needs to cut through in the final minutes; set well, it lifts the room without taking it over.",
    },
    {
      id: "captains-word", kind: "hold", target: "captains-word-marker", seconds: 6,
      title: "Hold the room for the captain's short word",
      cue: "The captain says a short, calm word to the team — hold the room quiet here so it actually lands.",
      why: "A short word from a peer carries differently than the same word from a coach, and it only lands if the room is genuinely quiet for it, the same way the visualisation only works quiet. Keeping it short is deliberate too: a long speech this close to tip-off gives nerves more time to build, not less.",
      holdBreakNote: "The room talked over the captain before the word finished. Quiet it and let the captain finish.",
    },
    {
      id: "spot-the-jitters", kind: "find", noHint: true,
      targets: ["jitter-leg-bouncing", "jitter-forced-joking", "jitter-avoiding-eye-contact"],
      itemNames: {
        "jitter-leg-bouncing": "a player whose leg will not stop bouncing",
        "jitter-forced-joking": "a player joking too hard, too fast",
        "jitter-avoiding-eye-contact": "a player avoiding eye contact with everyone",
      },
      itemNotes: {
        "jitter-leg-bouncing": "That is nervous energy with nowhere to go yet. A quiet word and a breath before the shoot-around helps more than ignoring it.",
        "jitter-forced-joking": "Joking that is louder and faster than usual is often nerves wearing a mask. Notice it without calling it out in front of the group.",
        "jitter-avoiding-eye-contact": "Withdrawing is as much a sign of pre-game nerves as bouncing off the walls is. Check in with them quietly.",
      },
      decoyNotes: {
        "jitter-deep-breathing": "Deep, slow breathing before a game is the routine working, not a problem. Look for what is not settling.",
      },
      title: "Spot the signs of pre-game nerves",
      cue: "Watch the room for who the routine has not reached yet. Mark what needs a quiet word.",
      why: "Nerves before a game show up differently in different players — bouncing, over-joking, going quiet — and a coach who only watches for the loud version misses the ones going the other way. Catching it here, before the shoot-around, is what a pre-game routine is actually for.",
    },
    {
      id: "rack-the-loose-gear", kind: "drag", target: "loose-gear-bag",
      title: "Move the loose gear onto the rack",
      cue: "Carry the gear bag from the doorway to its spot on the rack.",
      drag: { to: "gear-rack-socket", radius: 0.45, missNote: "Not on the rack. A bag left anywhere else is a bag still in somebody's way — carry it all the way to its spot." },
      why: "Clearing gear off the floor and onto the rack before the team moves toward the court removes the last trip hazard from the room, and doing it as part of the routine — not as an afterthought — means it happens the same way before every game.",
    },
    {
      id: "quiet-word-for-the-anxious-player", kind: "select", target: "quiet-corner-spot",
      title: "Give the most nervous player a quiet word",
      cue: "Step to the corner with the player who is struggling to settle — brief, calm, private.",
      why: "A player who cannot settle needs to hear that nerves are normal and expected, said quietly and to them alone rather than as a speech to the group. Said privately, it is reassurance; said in front of the team, it becomes something else for that player to be nervous about.",
    },
    {
      id: "hold-team-energy-to-tip-off", kind: "track", target: "team-energy-meter", seconds: 8,
      title: "Hold the team's energy through the final minutes",
      cue: "Keep the room's energy in band right up to tip-off — building, not spiking, not fading.",
      track: {
        start: 0.34, green: [0.4, 0.6], rise: 0.5, fall: 0.4, drift: 0.14, label: "TEAM ENERGY",
        readout: (v) => (v < 0.4 ? "fading — going flat before tip-off" : v > 0.6 ? "spiking — past focus" : "building, ready"),
      },
      why: "The last few minutes before tip-off are when a carefully built calm can either hold or come apart — into a flat, checked-out team or a jittery, over-hyped one. Holding the energy in band through those minutes is the last thing the routine has to get right before the whistle takes it out of the coach's hands.",
      holdBreakNote: "Energy left the band in the last minutes — fading, or spiking past focus. Bring it back to building and ready.",
    },
    {
      id: "log-the-pregame-routine", kind: "select", target: "practice-log-board",
      title: "Log the pre-game routine",
      cue: "Record the focus image used, who needed a quiet word, and anything the athletic trainer noticed.",
      why: "The focus image that worked, who needed a quiet word and any early sign of illness or injury are exactly what the next pre-game hour needs to build on. Written down before the game rather than remembered after it, the log is the more honest record.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the assistant coach and the athletic trainer",
      cue: "One last minute before tip-off: anything either of you saw, and is everybody good to go?",
      why: "The assistant met the parent at the door and the athletic trainer watched for anyone unwell before the game even started; a last, short check-in pools what each adult saw and agrees the staff is walking onto the sideline as one team, not three separate ones.",
    },
  ],

  interrupts: [
    {
      id: "parent-bursts-into-the-locker-room",
      kind: "Parent at the door",
      after: "quiet-visualisation", delay: 3, seconds: 12,
      alert: "A parent pushes into the locker room mid-visualisation, loudly hyping the team up before the biggest game of the season.",
      cue: "Send the assistant to walk the parent back out and set a time to talk after the game — keep the room quiet and the head coach with the team.",
      target: "door-greeting-spot",
      why: "A well-meaning parent bursting into a quiet visualisation undoes it for the whole room in one loud sentence. Sending the assistant to walk them back out calmly, and fixing a time to talk later, keeps the routine intact and keeps the conversation itself calm and in the open, the way safe-sport guidance expects adult conversations near a team to be handled.",
      missNote: "The head coach stopped the visualisation to argue with the parent in front of the team, and by the time it was sorted out the quiet the room needed was gone for good.",
      wrongNote: "That does not settle it. Send the assistant to walk the parent back out, calmly.",
    },
    {
      id: "fire-alarm-in-the-locker-room",
      kind: "Fire alarm",
      after: "captains-word", delay: 3, seconds: 12,
      alert: "The fire alarm sounds right in the middle of the captain's word, with the whole team still sitting on the benches.",
      cue: "Everyone up and out through the marked exit now, gear left where it is, headcount outside against the roster.",
      target: "fire-exit-door",
      why: "A locker room alarm moves a seated, half-dressed team, which takes longer than moving players already on their feet — all the more reason to start immediately rather than finish the sentence. Gear stays behind, the team leaves together through the marked exit, and a headcount against the roster happens outside before anyone is told it was a drill or the real thing.",
      missNote: "The captain finished the word and the team filed out slowly gathering bags on the way. Outside, the headcount took twice as long as it should have and nobody could say for certain everyone had actually left the room when the alarm first sounded.",
      wrongNote: "The alarm comes first. Everybody up and out through the marked exit, gear left behind.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BBV_ACCENT);

    // ------------------------------------------------------------ helpers
    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? BBV_ACCENT, { emissive: o.color ?? BBV_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BBV_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.34, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#160c26", accent: o.accent ?? BBV_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BBV_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.5 });
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(18,10,30,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BBV_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f4eeff";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#dccdf4";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BBV_ACCENT, { rough: 0.5, emissive: o.accent ?? BBV_ACCENT, ei: 0.25 });
      cyl(b, 0.02, 0.02, y - h / 2, 0, -(y + h / 2) / 2, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };

    // ------------------------------------------------------------ the locker room floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#241633", base2: "#1e1229", seam: "rgba(8,4,16,0.5)",
    }), { repeat: 2, px: 384 });
    const floor = box(g, 3.0, 0.02, 2.2, 0, 0.012, -1.3, 0x241633, { rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0xd8c8e8 });

    // ------------------------------------------------------------ benches, lockers
    const benches = [];
    for (const bz of [-1.9, -0.9]) {
      const bench = group(g, -0.3, 0, bz);
      box(bench, 2.4, 0.06, 0.4, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 });
      for (const sx of [-1.0, 1.0]) box(bench, 0.05, 0.42, 0.34, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
      benches.push(bench);
    }
    for (let i = 0; i < 6; i++) {
      const locker = box(g, 0.44, 1.7, 0.5, -2.7, 0.85, -2.5 + i * 0.5, [0x2a1a3a, 0x241632][i % 2], { rough: 0.6, metal: 0.4 });
      void locker;
    }
    const team = [
      standingFigure(g, 0.4, -1.6, { ry: 0.3, cloth: 0xf2f2f2, trousers: 0x241632, atStation: true }),
      standingFigure(g, 1.0, -1.9, { ry: -0.2, cloth: 0xf2f2f2, trousers: 0x241632, atStation: true }),
      standingFigure(g, -0.4, -1.1, { ry: 0.5, cloth: 0xf2f2f2, trousers: 0x241632, atStation: true }),
      standingFigure(g, 0.9, -1.1, { ry: -0.5, cloth: 0xf2f2f2, trousers: 0x241632, atStation: true }),
      standingFigure(g, 0.1, -1.9, { ry: 0.1, cloth: 0xf2f2f2, trousers: 0x241632, atStation: true }),
    ];

    // ------------------------------------------------------------ pre-warm-up hazards
    const gearBag = box(g, 0.4, 0.2, 0.26, 1.9, 0.1, -0.35, 0x5a3a1a, { rough: 0.8 });
    reg(hits, gearBag, "loose-gear-bag");
    bead(1.9, 0.4, -0.35, "pre-gear-bag-in-doorway", "Gear bag in the doorway", { w: 0.42 });
    bead(-0.3, 0.6, -1.55, "pre-untied-shoelace", "Untied shoelace", { w: 0.32, r: 0.024 });
    const phone = box(g, 0.08, 0.16, 0.02, 2.2, 1.1, 1.5, 0x1a1e23, { rough: 0.3, metal: 0.5 });
    bead(2.2, 1.35, 1.5, "pre-phone-filming", "Phone filming, unasked", { w: 0.42 });
    bead(-0.9, 0.55, -0.95, "pre-captain-leading-stretch", "Captain leading the stretch", { w: 0.44, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });

    // ------------------------------------------------------------ schedule, visualisation, routine ladder
    card(-2.0, 1.35, -2.9, "schedule-board", "Pre-game schedule", "ARRIVE · STRETCH ·\nVISUALISE · SHOOT", { w: 0.4, cw: 0.42 });
    const visCircle = cyl(g, 0.5, 0.5, 0.006, 0.6, 0.02, -2.0, BBV_ACCENT, { rough: 0.6, opacity: 0.7, emissive: BBV_ACCENT, ei: 0.4, seg: 24, cast: false });
    void visCircle;
    bead(0.6, 0.85, -2.0, "visualisation-marker", "Quiet visualisation", { w: 0.42 });
    const routine = group(g, -2.35, 0, -0.6, 0.4);
    cyl(routine, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["routine-arrival", "1 · Arrival, gear check", 0.56], ["routine-stretch", "2 · Dynamic stretch", 0.82],
      ["routine-visualise", "3 · Visualisation", 1.08], ["routine-shoot-around", "4 · Shoot-around", 1.34],
    ]) {
      const b = ball(routine, 0.028, 0, y, 0, BBV_ACCENT, { emissive: BBV_ACCENT, ei: 1.5, seg: 12 });
      holoTag(routine, label, 0.24, y, 0, { css: BBV_CSS, w: 0.42 });
      reg(hits, b, lid);
    }
    card(2.3, 1.3, -1.6, "focus-image-card", "Choose a focus image", "MADE FREE THROW ·\nSTOP · CALM BENCH", { ry: -0.5, w: 0.42 });

    // ------------------------------------------------------------ energy, music, captain's word
    const eStand = stand(1.7, 0.7, -0.35);
    const energy = instrument(eStand, 0, 1.02, 0, { idle: "ENERGY", color: BBV_ACCENT, w: 0.2, d: 0.26 });
    holoTag(eStand, "Team energy check", 0, 1.22, 0, { css: BBV_CSS, w: 0.36 });
    reg(hits, energy, "energy-gauge");
    const dial = group(g, -1.7, 0, 0.6);
    cyl(dial, 0.15, 0.15, 0.28, 0, 0.5, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 16 });
    const dialKnob = cyl(dial, 0.05, 0.05, 0.05, 0, 0.66, 0.08, BBV_ACCENT, { emissive: BBV_ACCENT, ei: 0.7, rough: 0.4, seg: 14 });
    holoTag(dial, "Locker-room music", 0, 0.9, 0, { css: BBV_CSS, w: 0.38 });
    reg(hits, dialKnob, "music-dial");
    stand(0.0, 1.3, 0, 0.9);
    bead(0.0, 1.15, 1.3, "captains-word-marker", "Captain's word", { w: 0.32 });
    const captain = standingFigure(g, 0.0, 1.55, { ry: Math.PI, cloth: 0x2a5ad8, trousers: 0x241632, atStation: true });
    void captain;

    // ------------------------------------------------------------ jitters, gear rack, quiet corner
    bead(-1.2, 0.35, -1.75, "jitter-leg-bouncing", "Leg bouncing", { w: 0.28, r: 0.024 });
    bead(1.4, 0.9, -1.95, "jitter-forced-joking", "Forced joking", { w: 0.3, r: 0.024 });
    bead(0.3, 0.9, -1.15, "jitter-avoiding-eye-contact", "Avoiding eye contact", { w: 0.4, r: 0.024 });
    bead(-1.6, 0.55, 0.2, "jitter-deep-breathing", "Deep breathing", { w: 0.34, r: 0.022, color: 0x7fc4d8, css: "#7fc4d8" });
    const rack = group(g, 2.6, 0, -2.6);
    for (const sx of [-0.3, 0.3]) cyl(rack, 0.02, 0.02, 1.1, sx, 0.55, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
    box(rack, 0.7, 0.03, 0.05, 0, 1.05, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    holoTag(rack, "Gear rack", 0, 1.22, 0, { css: BBV_CSS, w: 0.24 });
    const rackSocket = box(rack, 0.4, 0.02, 0.24, 0, 1.0, 0, BBV_ACCENT, { emissive: BBV_ACCENT, ei: 0.5, rough: 0.6 });
    reg(hits, rackSocket, "gear-rack-socket");
    bead(2.9, 0.7, 0.9, "quiet-corner-spot", "Quiet corner", { color: 0xf2c14b, css: "#f2c14b", w: 0.36 });

    // ------------------------------------------------------------ team-energy meter, log, checkin
    const tStand = stand(-2.0, 0.9, -0.35);
    const teamEnergy = instrument(tStand, 0, 1.02, 0, { idle: "TEAM", color: BBV_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tStand, "Energy to tip-off", 0, 1.22, 0, { css: BBV_CSS, w: 0.32 });
    reg(hits, teamEnergy, "team-energy-meter");
    const log = board(0.6, 0.36, 1.45, 1.72, -3.05, (cx, w, h) => lines(cx, w, h, "PRACTICE LOG", ["Focus image · quiet words", "Trainer notes"]));
    reg(hits, log.userData.face, "practice-log-board");
    const checkin = board(0.54, 0.34, 3.1, 1.66, -0.5, (cx, w, h) => lines(cx, w, h, "STAFF CHECK-IN", ["What did you see?", "Coach · assistant · trainer"], { accent: "#7fc4d8" }), { ry: -1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // ------------------------------------------------------------ door, exit, guide
    const door = group(g, 3.45, 0, 1.4, -Math.PI / 2);
    box(door, 1.0, 2.1, 0.06, -0.55, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const doorLeaf = box(door, 0.9, 2.0, 0.04, 0, 1.0, 0, 0x6b4a2e, { rough: 0.6 });
    const parent = standingFigure(g, 3.0, 0.75, { ry: -2.2, cloth: 0x4a5a6a, atStation: true });
    parent.visible = false;
    bead(3.0, 1.25, 2.1, "door-greeting-spot", "Greet the parent at the door", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });
    const exit = group(g, -3.45, 0, 1.0, Math.PI / 2);
    box(exit, 1.0, 2.1, 0.06, 0, 1.05, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.4 });
    const exitLeaf = box(exit, 0.9, 2.0, 0.04, 0, 1.0, 0.01, 0x6b4a2e, { rough: 0.6 });
    decal(exit, 0.34, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#1a0a0a", accent: "#f0645b", fg: "#ff5a4a", scale: 0.6 }), { px: 160, glow: true, ei: 1.4 });
    const strobe = box(exit, 0.12, 0.08, 0.06, 0.4, 2.2, 0.05, 0x8a8f96, { rough: 0.4 });
    holoTag(exit, "Fire exit", 0, 2.45, 0.04, { css: "#f0645b", w: 0.24 });
    reg(hits, exitLeaf, "fire-exit-door");
    const guide = board(0.6, 0.3, 2.2, 2.0, -0.6, (cx, w, h) => lines(cx, w, h, "THE GUIDE", ["Calm builds. Loud does not."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8, ry: -1.1 });
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
    hazardCard(-1.8, 1.25, 1.15, "locker-room-fans-off", "Fans off, door shut?", "STUFFY IS\nFINE, PLAY ON", 0.4);
    hazardCard(-0.6, 1.25, 1.9, "extra-sprints-right-before-tip", "Extra sprints right now?", "FEEL IT IN\nYOUR LEGS", 0.1);
    hazardCard(0.6, 1.25, 1.9, "hype-video-turns-reckless", "Loudest video to the whistle?", "PUMP THEM UP\nALL THE WAY", -0.1);
    hazardCard(1.85, 1.25, 1.15, "phone-recording-without-consent", "Let the phone keep rolling?", "NOBODY\nSAID STOP", -0.4);

    // ------------------------------------------------------------ crew
    const coach = standingFigure(g, 0.95, 2.4, { ry: Math.PI + 0.5, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 0.95, 2.1, 2.4, { css: "#7fc4d8", w: 0.28 });
    const assistant = standingFigure(g, -3.3, -2.55, { ry: 0.7, cloth: 0x6a3a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3.3, 2.1, -2.55, { css: "#7fc4d8", w: 0.34 });
    const trainer = standingFigure(g, 3.3, 2.95, { ry: -2.4, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", 3.3, 2.1, 2.95, { css: "#f2c14b", w: 0.34 });
    void coach; void trainer; void assistant; void team; void gearBag; void phone; void benches;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.3, -1.0),

      onStepComplete(step) {
        if (step.id === "scan-the-locker-room") phone.visible = false;
        if (step.id === "set-the-locker-room-music") dialKnob.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4 });
        if (step.id === "rack-the-loose-gear") gearBag.position.set(2.6, 0.98, -2.6);
        if (step.id === "log-the-pregame-routine") repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Focus image set", "Room calm through tip-off"], { accent: "#59c97b" }));
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function"
          ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
          : "Stop there. Take a breath, look at what you reached for, and go again.");
      },

      onInterrupt(it) {
        if (it.id === "parent-bursts-into-the-locker-room") { parent.visible = true; doorLeaf.rotation.y = -1.1; doorLeaf.position.x = 0.35; }
        if (it.id === "fire-alarm-in-the-locker-room") strobe.material = mat(0xffffff, { emissive: 0xfff2a0, ei: 3.0, rough: 0.3 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "parent-bursts-into-the-locker-room") {
          assistant.position.set(2.6, 0, 1.3); assistant.rotation.y = -1.4;
          paintGuide("Handled calmly — the room stayed quiet and the parent still got heard, just later.");
        }
        if (it.id === "fire-alarm-in-the-locker-room") { exitLeaf.rotation.y = 1.2; exitLeaf.position.x = -0.35; }
      },

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "energy-level-check") {
          const ok = gg.t >= 0.44 && gg.t <= 0.62;
          repaint(energy.userData.screen, signFace(ok ? "READY" : gg.t < 0.44 ? "FLAT" : "AMPED", { bg: "#160c26", accent: ok ? "#59c97b" : "#f0645b", fg: "#f4eeff", scale: 0.5 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "hold-team-energy-to-tip-off") {
          const ok = tr.v >= 0.4 && tr.v <= 0.6;
          repaint(teamEnergy.userData.screen, signFace(ok ? "BUILDING" : tr.v < 0.4 ? "FADING" : "SPIKING", { bg: "#160c26", accent: ok ? "#59c97b" : "#f0645b", fg: "#f4eeff", scale: 0.46 }));
        }
        if (session?.step?.id === "set-the-locker-room-music") dial.rotation.y = t * 0.6;
      },
    };
  },
};
