// Robot trainees — software agents that run the same procedure engine a
// human learner runs, so a station can be (a) exercised at scale without a
// headset, (b) tuned to an optimal difficulty for a given skill level, and
// (c) mined for synthetic training data: every decision the agent makes,
// what it saw, what it did and what it earned, as a trajectory.
//
// Nothing here knows about three.js or the DOM. An agent sees the Session
// (step kind, target, gauge/track/turn state, score, streak) and the list of
// interactable ids the room built, and emits one action at a time. The
// caller applies the action — headlessly via tools/robot_train.mjs, or live
// in the browser where the app forwards it through the same select / press /
// rotate / drop path a click takes — and ticks the engine.
//
// Skill is a single number in [0, 1]: 1 is an expert who never misses, 0 is
// a novice who guesses; the curriculum below searches for the skill at which
// a station lands in a target success band — the "optimal level" where a
// learner is neither bored nor lost — and reports it per station.

/** Deterministic PRNG (mulberry32), so a dataset can be regenerated exactly. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Everything the agent is allowed to see, as plain data — this is also the
 * observation written to the trajectory. */
export function observe(session) {
  const step = session.step;
  if (!step) return { stepIndex: session.index, kind: null };
  const targets = step.kind === "sequence" || step.kind === "find" ? step.targets : [step.target];
  return {
    stepIndex: session.index, stepId: step.id, kind: step.kind, targets,
    remaining: step.kind === "sequence" || step.kind === "find" ? step.targets.filter((t) => !session.sequence.includes(t)) : null,
    anyOrder: !!step.anyOrder,
    gauge: session.gauge ? { t: +session.gauge.t.toFixed(3), green: session.gauge.green, committed: session.gauge.committed } : null,
    track: session.track ? { v: +session.track.v.toFixed(3), green: session.track.green, inBand: +session.track.inBand.toFixed(2), holding: session.holding } : null,
    hold: step.kind === "hold" ? { holdFor: +session.holdFor.toFixed(2), seconds: step.seconds, holding: session.holding } : null,
    turn: session.turn ? { amount: +session.turn.amount.toFixed(3), required: session.turn.required } : null,
    score: session.score, streak: session.streak, errors: session.errors, hazardHits: session.hazardHits,
    elapsed: +session.elapsed.toFixed(2),
  };
}

/**
 * A skill-parameterised policy. `hitIds` is every interactable in the room;
 * `hazardIds` the subset that are seeded hazards. Returns an action:
 *   { type: "select", id } | { type: "commit", id, at } | { type: "press", id }
 *   | { type: "release" } | { type: "rotate", id, delta } | { type: "drop", id, distance }
 *   | { type: "wait" }
 */
export class RobotAgent {
  constructor({ skill = 1, seed = 1, hitIds = [], hazardIds = [] } = {}) {
    this.skill = Math.max(0, Math.min(1, skill));
    this.random = rng(seed);
    this.hitIds = hitIds;
    this.hazardIds = hazardIds;
    this._holdPlan = null;
  }

  /** Probability of a lapse on any decision — novices lapse often, experts never. */
  get lapse() { return (1 - this.skill) * 0.45; }

  pickWrong(correct) {
    const r = this.random();
    // A share of lapses are the unsafe kind, and it grows as skill drops.
    if (this.hazardIds.length && r < (1 - this.skill) * 0.35) return this.hazardIds[Math.floor(this.random() * this.hazardIds.length)];
    const others = this.hitIds.filter((id) => !correct.includes(id));
    return others.length ? others[Math.floor(this.random() * others.length)] : correct[0];
  }

  act(session) {
    const step = session.step;
    if (!step || session.finished) return { type: "wait" };
    const lapse = this.random() < this.lapse;

    if (step.kind === "select") {
      return { type: "select", id: lapse ? this.pickWrong([step.target]) : step.target };
    }
    if (step.kind === "sequence" || step.kind === "find") {
      const remaining = step.targets.filter((t) => !session.sequence.includes(t));
      if (!remaining.length) return { type: "wait" };
      // Strict sequences: a lapse is picking a later item out of order.
      const next = step.anyOrder || step.kind === "find" ? remaining[Math.floor(this.random() * remaining.length)] : remaining[0];
      if (lapse) {
        const outOfOrder = !step.anyOrder && remaining.length > 1 && this.random() < 0.5 ? remaining[1] : this.pickWrong(step.targets);
        return { type: "select", id: outOfOrder };
      }
      return { type: "select", id: next };
    }
    if (step.kind === "gauge") {
      if (!session.gauge || session.gauge.committed) return { type: "wait" };
      const [lo, hi] = session.gauge.green;
      const centre = (lo + hi) / 2, half = (hi - lo) / 2;
      // Aim error scales with (1 - skill); an expert commits dead centre.
      const err = (this.random() * 2 - 1) * (1 - this.skill) * half * 2.2;
      const at = Math.max(0, Math.min(1, centre + err));
      return { type: "commit", id: step.target, at };
    }
    if (step.kind === "hold") {
      // Plan once per step: an expert holds through; a novice may let go early.
      if (!this._holdPlan || this._holdPlan.step !== step.id) {
        const early = this.random() < (1 - this.skill) * 0.6;
        this._holdPlan = { step: step.id, releaseAt: early ? step.seconds * (0.3 + this.random() * 0.5) : Infinity, released: false };
      }
      if (session.holding && session.holdFor >= this._holdPlan.releaseAt && !this._holdPlan.released) {
        this._holdPlan.released = true; this._holdPlan.releaseAt = Infinity;
        return { type: "release" };
      }
      return session.holding ? { type: "wait" } : { type: "press", id: step.target };
    }
    if (step.kind === "track") {
      if (!session.track) return { type: "wait" };
      const tr = session.track;
      const [lo, hi] = tr.green;
      const centre = (lo + hi) / 2;
      // Bang-bang control with a skill-dependent dead band: press to rise
      // below centre, release to fall above it. Novices react late.
      const slack = (1 - this.skill) * 0.25;
      const target = centre + (this.random() * 2 - 1) * slack;
      if (tr.v < target && !session.holding) return { type: "press", id: step.target };
      if (tr.v >= target && session.holding) return { type: "release" };
      return { type: "wait" };
    }
    if (step.kind === "turn") {
      if (lapse) return { type: "select", id: this.pickWrong([step.target]) };
      return { type: "rotate", id: step.target, delta: 0.25 + this.random() * 0.25 };
    }
    if (step.kind === "drag") {
      if (lapse) return { type: "select", id: this.pickWrong([step.target]) };
      const radius = step.drag?.radius ?? 0.35;
      const miss = this.random() < (1 - this.skill) * 0.5;
      return { type: "drop", id: step.target, distance: miss ? radius * (1.2 + this.random()) : radius * this.random() * 0.8 };
    }
    return { type: "wait" };
  }
}

/** Apply one action to a Session. Returns the engine's feedback (or null). */
export function applyAction(session, action) {
  switch (action.type) {
    case "select": return session.select(action.id);
    case "commit": if (session.gauge) session.gauge.t = action.at; return session.select(action.id);
    case "press": session.setHolding(true); return null;
    case "release": session.setHolding(false); return null;
    case "rotate": return session.rotate(action.id, action.delta);
    case "drop": return session.dropAt(action.id, action.distance);
    default: return null;
  }
}

/**
 * Run one episode headlessly. `room` is any sim/room object; `api` is the
 * result of room.build() (its hits are the id space). Returns the summary
 * and, when `trajectory` is true, every decision as a record.
 */
export function runEpisode(room, api, { skill = 1, seed = 1, dt = 0.05, maxTicks = 20000, trajectory = true, SessionClass, hooks = {} } = {}) {
  const hitIds = Object.keys(api.hits ?? {});
  const hazardIds = Object.keys(room.hazards ?? {}).filter((id) => hitIds.includes(id));
  const agent = new RobotAgent({ skill, seed, hitIds, hazardIds });
  const records = [];
  let lastFeedback = null;
  const session = new SessionClass(room, {
    onStep: (step, s) => { api.onStep?.(step, s); hooks.onStep?.(step, s); },
    onStepComplete: (step, s) => { api.onStepComplete?.(step, s); hooks.onStepComplete?.(step, s); },
    onFeedback: (fb, s) => { lastFeedback = fb; api.onFeedback?.(fb, s); hooks.onFeedback?.(fb, s); },
    onHazard: (id, s) => { api.onHazard?.(id, s); hooks.onHazard?.(id, s); },
    onFinish: (s, summary) => hooks.onFinish?.(s, summary),
  });
  session.start();
  let ticks = 0, decisions = 0;
  while (!session.finished && ticks < maxTicks) {
    const before = session.score;
    const obs = trajectory ? observe(session) : null;
    const action = agent.act(session);
    lastFeedback = null;
    applyAction(session, action);
    session.tick(dt);
    try { api.animate?.(ticks * dt, dt, session); } catch (_) { /* a room's cosmetics must not break a run */ }
    ticks += 1;
    // A tick with no decision can still pay out (a hold or track completing
    // under the agent's existing press) — log those too, so the rewards in a
    // trajectory account for every point in the score.
    if (action.type !== "wait" || session.score !== before) {
      if (action.type !== "wait") decisions += 1;
      if (trajectory) records.push({
        t: +(ticks * dt).toFixed(2), obs, action,
        reward: session.score - before,
        feedback: lastFeedback ? lastFeedback.kind : null,
        hazard: !!lastFeedback?.hazard,
      });
    }
  }
  const summary = {
    finished: session.finished, score: session.score, stars: session.stars, errors: session.errors,
    hazardHits: session.hazardHits, holdBreaks: session.holdBreaks, seconds: +session.elapsed.toFixed(1),
    precision: +session.precision.toFixed(3), earned: [...session.earned], decisions, ticks,
    passed: session.finished && session.stars >= 2 && session.hazardHits === 0,
  };
  return { summary, records, session };
}

/**
 * Curriculum: find the skill at which this room's success rate lands inside
 * `band` (default 60–80% — challenged, not lost), by bisection over skill,
 * running `episodes` seeded episodes per probe. Returns every probe so the
 * difficulty curve itself is data.
 */
export function calibrate(room, api, { band = [0.6, 0.8], episodes = 12, seed = 1, probes = 7, SessionClass, dt } = {}) {
  const history = [];
  let lo = 0, hi = 1, skill = 0.5, result = null;
  const probe = (s) => {
    let passes = 0, score = 0;
    for (let i = 0; i < episodes; i++) {
      const { summary } = runEpisode(room, api, { skill: s, seed: seed * 1000 + i, trajectory: false, SessionClass, dt });
      if (summary.passed) passes += 1;
      score += summary.score;
    }
    const rate = passes / episodes;
    const entry = { skill: +s.toFixed(3), successRate: +rate.toFixed(3), meanScore: Math.round(score / episodes) };
    history.push(entry);
    return entry;
  };
  // Anchors first, so the curve has its ends.
  const atZero = probe(0), atOne = probe(1);
  if (atOne.successRate < band[0]) result = { ...atOne, note: "even an expert falls below the band — the station may be over-tuned" };
  else if (atZero.successRate > band[1]) result = { ...atZero, note: "a random agent already exceeds the band — the station may be under-tuned" };
  for (let i = 0; i < probes && !result; i++) {
    const entry = probe(skill);
    if (entry.successRate < band[0]) lo = skill;
    else if (entry.successRate > band[1]) hi = skill;
    else { result = entry; break; }
    skill = (lo + hi) / 2;
  }
  if (!result) {
    // Nearest probe to the band's centre if bisection ran out.
    const centre = (band[0] + band[1]) / 2;
    result = history.slice().sort((a, b) => Math.abs(a.successRate - centre) - Math.abs(b.successRate - centre))[0];
    result = { ...result, note: "closest probe — no probe landed inside the band" };
  }
  return { optimal: result, band, episodes, history };
}
