// Fairway Park — the three outdoor sports mini-games (track, court, pitch).
// Each engine is pure — create()/step() touch no DOM, canvas or three.js —
// exactly like the arcade cabinets' engines under WebXR/arcade/js/games/, so
// tools/check_fairway_game.mjs drives a full round of each headless.
//
// All three cap a round at MINIGAME_TIME_LIMIT seconds and keep their own
// best-score table (WebXR/fairway/js/scores.js), the same shape as the
// arcade's high-score tables.

export const MINIGAME_TIME_LIMIT = 60;

function rng32(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mgClamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// ------------------------------------------------------------------ sprint
//
// A reaction start (jump too early and it costs you) followed by an
// alternating left/right rhythm tap that keeps the runner's speed up —
// exactly the "timed reaction + rhythm taps" the brief asks for. `input.tap`
// is edge-triggered: the caller sends `true` for exactly the step a key or
// button went down, not for as long as it is held, the same convention the
// arcade cabinets use for a jump or a rotate.

export const SPRINT_DISTANCE = 100; // metres

export function sprintCreate({ seed = 1 } = {}) {
  const rng = rng32(seed);
  return {
    seed, rng,
    phase: "ready", // ready -> set -> running -> finished
    clock: 0,
    waitFor: 0.9 + rng() * 1.4,
    position: 0,
    speed: 0,
    raceTime: 0,
    penaltyTime: 0,
    nextSide: "left",
    goodTaps: 0,
    taps: 0,
    falseStarts: 0,
    timeLeft: MINIGAME_TIME_LIMIT,
    finishTime: null,
    score: 0,
    over: false,
  };
}

export function sprintStep(state, dt, input = {}) {
  if (state.over) return [];
  const events = [];
  state.timeLeft = Math.max(0, state.timeLeft - dt);

  if (state.phase === "ready" || state.phase === "set") {
    if (state.phase === "ready") { state.phase = "set"; }
    state.clock += dt;
    if (input.tap) {
      state.falseStarts += 1;
      state.penaltyTime += 1.0;
      events.push({ type: "false-start" });
      // A jump costs a second rather than resetting the whole start, so a
      // scripted session always terminates in bounded time.
    }
    if (state.clock >= state.waitFor) {
      state.phase = "running";
      events.push({ type: "go" });
    }
  } else if (state.phase === "running") {
    state.raceTime += dt;
    if (input.tap) {
      state.taps += 1;
      const wanted = state.nextSide;
      const side = input.side === "right" ? "right" : "left";
      const good = side === wanted;
      if (good) { state.goodTaps += 1; state.speed += 2.4; state.nextSide = wanted === "left" ? "right" : "left"; }
      else { state.speed += 0.6; } // an out-of-rhythm tap still helps, just far less
    }
    state.speed = Math.max(0, state.speed - state.speed * Math.min(1, 1.6 * dt));
    state.position += state.speed * dt;
    if (state.position >= SPRINT_DISTANCE) {
      state.position = SPRINT_DISTANCE;
      state.phase = "finished";
      state.finishTime = state.raceTime + state.penaltyTime;
      state.score = Math.max(0, Math.round(10000 - state.finishTime * 380));
      state.over = true;
      events.push({ type: "finish", time: state.finishTime });
    }
  }

  if (!state.over && state.timeLeft <= 0) { state.over = true; events.push({ type: "over" }); }
  return events;
}

// --------------------------------------------------------------- free throw
//
// A hold-and-release power/arc pair per shot, the same "power/timing" shape
// as the golf swing — `input.shoot` fires exactly one attempt with the
// power/arc read at the moment of release.

const FT_IDEAL_POWER = 0.6, FT_IDEAL_ARC = 0.55;

export function freethrowCreate({ seed = 1 } = {}) {
  return {
    seed, rng: rng32(seed),
    timeLeft: MINIGAME_TIME_LIMIT,
    attempts: 0, makes: 0, streak: 0, bestStreak: 0, score: 0, over: false, lastMade: null,
  };
}

export function freethrowStep(state, dt, input = {}) {
  if (state.over) return [];
  const events = [];
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (input.shoot) {
    const power = mgClamp(input.power ?? 0.5, 0, 1), arc = mgClamp(input.arc ?? 0.5, 0, 1);
    const err = Math.hypot((power - FT_IDEAL_POWER) / 0.45, (arc - FT_IDEAL_ARC) / 0.45);
    const madeProb = mgClamp(1 - err * 0.85, 0.03, 0.97);
    const made = state.rng() < madeProb;
    state.attempts += 1;
    state.lastMade = made;
    if (made) {
      state.makes += 1; state.streak += 1; state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.score += 2 + Math.min(3, Math.floor(state.streak / 3));
      events.push({ type: "make", streak: state.streak });
    } else {
      state.streak = 0;
      events.push({ type: "miss" });
    }
  }
  if (state.timeLeft <= 0) { state.over = true; events.push({ type: "over" }); }
  return events;
}

// -------------------------------------------------------------- penalty kicks
//
// One discrete kick per `input.kick`: `side` in [-1, 1] (left post to right
// post), `power` in [0, 1]. The keeper's dive is seeded, not read from the
// shot, so it cannot be gamed by peeking at state between kicks.

const PK_POST = 1.0;

export function penaltyCreate({ seed = 1 } = {}) {
  return {
    seed, rng: rng32(seed),
    timeLeft: MINIGAME_TIME_LIMIT,
    kicks: 0, goals: 0, saved: 0, wide: 0, score: 0, over: false, lastResult: null,
  };
}

export function penaltyStep(state, dt, input = {}) {
  if (state.over) return [];
  const events = [];
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (input.kick) {
    const side = mgClamp(input.side ?? 0, -1, 1);
    const power = mgClamp(input.power ?? 0.7, 0, 1);
    state.kicks += 1;
    if (Math.abs(side) > PK_POST * 0.96) {
      state.wide += 1;
      state.lastResult = "wide";
      events.push({ type: "wide" });
    } else {
      const keeperDive = state.rng() * 2 - 1;
      // A harder, better-placed shot is less savable even with a good guess.
      const savable = Math.abs(side - keeperDive) < 0.4 - power * 0.15;
      const saved = savable && state.rng() < 0.6;
      if (saved) {
        state.saved += 1;
        state.lastResult = "saved";
        events.push({ type: "saved" });
      } else {
        state.goals += 1;
        state.score += 10;
        state.lastResult = "goal";
        events.push({ type: "goal" });
      }
    }
  }
  if (state.timeLeft <= 0) { state.over = true; events.push({ type: "over" }); }
  return events;
}

// ------------------------------------------------------------------ roster

/** One row per mini-game for the facility menu, id matching scores.js's
 *  FAIRWAY_MINIGAMES so a card, an engine and a score table always line up. */
export const FAIRWAY_MINIGAMES_INFO = [
  {
    id: "sprint", name: "Hundred-Metre Dash", venue: "the track",
    blurb: "React off the line, then keep an even left-right rhythm to hold your speed to the tape.",
    controls: "Tap to react off the line; alternate left/right taps to run.",
  },
  {
    id: "freethrow", name: "Free-Throw Shootout", venue: "the court",
    blurb: "Hold for power, release on arc — sixty seconds of free throws, streaks pay a bonus.",
    controls: "Hold to charge power, release at the right arc to shoot.",
  },
  {
    id: "penalties", name: "Penalty Kicks", venue: "the pitch",
    blurb: "Pick a side and a power before the keeper commits — sixty seconds of spot kicks.",
    controls: "Aim left/right, set power, and strike.",
  },
];
