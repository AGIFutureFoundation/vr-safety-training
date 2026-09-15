// Procedure engine and gamification layer.
//
// A room supplies an ordered list of steps. The engine owns correctness: it
// decides whether an interaction advances the procedure, applies score, and
// produces the coaching line the HUD shows. Rooms never score themselves, so
// the assessment stays deterministic and auditable — the same contract the
// Unity build uses.

export const STEP_POINTS = 100;
export const WRONG_STEP_PENALTY = 25;
export const HAZARD_PENALTY = 50;
export const MAX_COMBO = 2.0;

// Named combo tiers — the HUD shows the label, not just the multiplier, so a
// hot streak reads as a game feel moment rather than an accounting detail.
const COMBO_TIERS = [
  { at: 0, label: "" },
  { at: 1.2, label: "Nice" },
  { at: 1.4, label: "Great" },
  { at: 1.6, label: "Awesome" },
  { at: 1.8, label: "On Fire" },
  { at: MAX_COMBO, label: "Unstoppable" },
];

const STORE_KEY = "trades-sim-v1";

// ---------------------------------------------------------------- progression

const MAX_BOARD_ENTRIES = 8;
const NAME_KEY = "trades-sim-name";

export const Progress = {
  data: { xp: 0, rooms: {}, badges: [], boards: {} },
  playerName: "YOU",

  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (raw && typeof raw === "object") {
        this.data = {
          xp: raw.xp | 0,
          rooms: raw.rooms && typeof raw.rooms === "object" ? raw.rooms : {},
          badges: Array.isArray(raw.badges) ? raw.badges : [],
          boards: raw.boards && typeof raw.boards === "object" ? raw.boards : {},
        };
      }
    } catch (_) { /* private mode or blocked storage — run unsaved */ }
    try {
      const savedName = localStorage.getItem(NAME_KEY);
      if (savedName) this.playerName = savedName.slice(0, 12);
    } catch (_) { /* ignore */ }
    return this.data;
  },

  setPlayerName(name) {
    this.playerName = (name || "YOU").trim().slice(0, 12).toUpperCase() || "YOU";
    try { localStorage.setItem(NAME_KEY, this.playerName); } catch (_) { /* ignore */ }
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (_) { /* ignore */ }
  },

  reset() {
    this.data = { xp: 0, rooms: {}, badges: [], boards: {} };
    try { localStorage.removeItem(STORE_KEY); } catch (_) { /* ignore */ }
  },

  /**
   * Local competitive leaderboard for one simulator: the top runs recorded on
   * this device, arcade-cabinet style. Everyone sharing the machine — a crew,
   * a classroom, a kiosk — competes on the same board under their own name.
   * There is no server: this never leaves the browser.
   */
  leaderboard(simId) {
    return (this.data.boards[simId] ?? []).slice().sort(
      (a, b) => b.score - a.score || a.seconds - b.seconds);
  },

  submitScore(simId, { name, score, seconds, stars }) {
    const board = this.leaderboard(simId);
    const entry = { name: (name || this.playerName).slice(0, 12).toUpperCase(), score, seconds, stars, at: Date.now() };
    board.push(entry);
    board.sort((a, b) => b.score - a.score || a.seconds - b.seconds);
    const trimmed = board.slice(0, MAX_BOARD_ENTRIES);
    this.data.boards[simId] = trimmed;
    this.save();
    const rank = trimmed.indexOf(entry);
    return { rank: rank < 0 ? null : rank + 1, board: trimmed, madeBoard: rank >= 0 };
  },

  /** Combined standing across every simulator this device has played — the
   * suite-wide leaderboard that rewards breadth across the whole SmartCiti.X campus. */
  suiteStanding() {
    let totalScore = 0, totalRuns = 0, totalStars = 0, simsPlayed = 0;
    for (const state of Object.values(this.data.rooms)) {
      if (!state.runs) continue;
      simsPlayed += 1;
      totalRuns += state.runs | 0;
      totalScore += state.best | 0;
      totalStars += state.stars | 0;
    }
    return { totalScore, totalRuns, totalStars, simsPlayed };
  },

  get level() { return 1 + Math.floor(Math.sqrt(this.data.xp / 120)); },
  get xpIntoLevel() {
    const base = Math.pow(this.level - 1, 2) * 120;
    const next = Math.pow(this.level, 2) * 120;
    return { into: this.data.xp - base, span: next - base };
  },
  roomState(id) {
    return this.data.rooms[id] || { stars: 0, best: 0, bestTime: null, runs: 0, xp: 0, badges: [] };
  },

  /**
   * Rank inside one simulator's own system. Each area defines its own ladder,
   * so a learner is (say) a Fault Lead on the charge point and still an
   * apprentice in the vault — progression is per trade, not one global level.
   */
  simRank(id, game) {
    const xp = this.roomState(id).xp | 0;
    const marks = game?.rankAt ?? [0, 900, 2200, 4000, 6500];
    const names = game?.ranks ?? ["Apprentice", "Operator", "Technician", "Lead", "Certified"];
    let tier = 0;
    for (let i = 0; i < marks.length; i++) if (xp >= marks[i]) tier = i;
    const next = marks[tier + 1] ?? null;
    return {
      tier, name: names[Math.min(tier, names.length - 1)], xp,
      next, into: xp - marks[tier], span: next == null ? 0 : next - marks[tier],
      max: tier >= marks.length - 1,
    };
  },

  simBadges(id) { return this.roomState(id).badges ?? []; },
  get completedRooms() { return Object.values(this.data.rooms).filter((r) => r.stars > 0).length; },
  get totalStars() { return Object.values(this.data.rooms).reduce((n, r) => n + (r.stars | 0), 0); },

  record(roomId, { score, stars, seconds, badge, earned = [] }) {
    const prev = this.roomState(roomId);
    const badges = [...(prev.badges ?? [])];
    for (const id of earned) if (!badges.includes(id)) badges.push(id);
    const next = {
      stars: Math.max(prev.stars | 0, stars),
      best: Math.max(prev.best | 0, score),
      bestTime: prev.bestTime == null ? seconds : Math.min(prev.bestTime, seconds),
      runs: (prev.runs | 0) + 1,
      xp: (prev.xp | 0) + Math.max(0, score),
      badges,
    };
    this.data.rooms[roomId] = next;
    this.data.xp += Math.max(0, Math.round(score / 8));
    if (badge && !this.data.badges.includes(badge)) this.data.badges.push(badge);
    for (const id of earned) {
      const scoped = `${roomId}:${id}`;
      if (!this.data.badges.includes(scoped)) this.data.badges.push(scoped);
    }
    this.save();
    return next;
  },
};

// ------------------------------------------------------------------ the audio

/** Tiny WebAudio synth — feedback tones with no asset downloads. */
export const Sfx = {
  ctx: null,
  muted: false,
  ensure() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) this.ctx = new Ctor();
    }
    if (this.ctx?.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  blip(freq, dur = 0.12, type = "sine", gain = 0.06) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    amp.gain.setValueAtTime(0.0001, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  },
  good() { this.blip(660, 0.09, "triangle"); setTimeout(() => this.blip(990, 0.12, "triangle"), 70); },
  great() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.1, "triangle"), i * 65)); },
  bad() { this.blip(150, 0.22, "sawtooth", 0.05); },
  tick() { this.blip(1200, 0.03, "square", 0.02); },
  alarm() { [0, 1, 2].forEach((i) => setTimeout(() => this.blip(220, 0.16, "square", 0.05), i * 190)); },
};

// ---------------------------------------------------------------- the session

/**
 * One run of one room. `hooks` receives every state change so the HUD, the 3D
 * scene and the audio stay in sync without the engine knowing about any of them.
 */
export class Session {
  constructor(room, hooks = {}) {
    this.room = room;
    this.hooks = hooks;
    this.index = 0;
    this.score = 0;
    this.streak = 0;
    this.peakCombo = 1;      // best combo multiplier reached this run
    this.errors = 0;
    this.finished = false;
    this.elapsed = 0;
    this.log = [];
    this.sequence = [];      // progress within a 'sequence' step
    this.holdFor = 0;        // progress within a 'hold' step
    this.holding = false;
    this.gauge = null;       // live gauge state for a 'gauge' step
    this.track = null;       // live state for a 'track' step
    this.turn = null;        // live state for a 'turn' step
    this.stars = 0;
    this.badgeEarned = null;
    this.hazardHits = 0;      // unsafe-action selections in this run
    this.gaugeScores = [];    // 0..1 accuracy for each graded skill step
    this.holdBreaks = 0;      // timed steps released early
    this.earned = [];         // per-sim badges and challenges cleared this run
  }

  /** Mean accuracy across graded steps, 0 when the run had none. */
  get precision() {
    if (!this.gaugeScores.length) return 0;
    return this.gaugeScores.reduce((a, b) => a + b, 0) / this.gaugeScores.length;
  }

  get steps() { return this.room.steps; }
  get step() { return this.steps[this.index] || null; }
  get combo() { return Math.min(MAX_COMBO, 1 + this.streak * 0.1); }
  /** Named tier for the current combo — the HUD shows this, not just the number. */
  get comboLabel() {
    let label = "";
    for (const tier of COMBO_TIERS) if (this.combo >= tier.at) label = tier.label;
    return label;
  }
  get progress01() { return this.steps.length ? this.index / this.steps.length : 0; }

  start() {
    this.elapsed = 0;
    // Snapshot rank before this run so finish() can tell whether it moved the
    // needle — a rank-up mid-progression is a moment worth celebrating.
    this.rankBefore = this.room.game ? Progress.simRank(this.room.id, this.room.game) : null;
    this.enterStep();
    return this;
  }

  enterStep() {
    const step = this.step;
    this.sequence = [];
    this.holdFor = 0;
    this.holding = false;
    this.gauge = null;
    this.track = null;
    this.turn = null;
    if (!step) return;
    if (step.kind === "track") {
      const cfg = step.track ?? {};
      this.track = {
        v: cfg.start ?? 0.1,
        green: cfg.green ?? [0.42, 0.62],
        rise: cfg.rise ?? 0.62,
        fall: cfg.fall ?? 0.46,
        drift: cfg.drift ?? 0.1,
        wobble: Math.random() * 6,
        inBand: 0,
        dropouts: 0,
        wasIn: false,
        label: cfg.label ?? "",
        readout: cfg.readout ?? null,
      };
    }
    if (step.kind === "gauge") {
      this.gauge = {
        t: 0, dir: 1,
        speed: step.gauge.speed ?? 0.85,
        green: step.gauge.green ?? [0.44, 0.62],
        label: step.gauge.label ?? "",
        readout: step.gauge.readout ?? null,
        committed: false,
      };
    }
    if (step.kind === "turn") {
      this.turn = {
        amount: 0,
        required: step.turn?.turns ?? 1,
        label: step.turn?.label ?? "",
        readout: step.turn?.readout ?? null,
      };
    }
    this.hooks.onStep?.(step, this);
  }

  /** Player selected an interactable by id. Returns a feedback record. */
  select(hitId) {
    if (this.finished || !this.step) return null;
    const step = this.step;

    if (step.kind === "sequence") return this.selectInSequence(hitId, step);

    if (step.kind === "gauge") {
      if (hitId === step.target || hitId === "gauge-commit") return this.commitGauge();
      return this.wrong(hitId, "Set the gauge first, then commit the reading.");
    }

    if (step.kind === "hold" || step.kind === "track") {
      if (hitId === step.target) return null; // driven by press and release
      return this.wrong(hitId);
    }

    if (step.kind === "turn") {
      if (hitId === step.target) return null; // driven by rotate(), a continuous drag input
      return this.wrong(hitId);
    }

    if (step.kind === "drag") {
      if (hitId === step.target) return null; // driven by dropAt(), a pick-up-and-carry gesture
      return this.wrong(hitId);
    }

    if (step.kind === "find") return this.selectInSequence(hitId, { ...step, anyOrder: true });

    if (hitId === step.target) return this.advance(STEP_POINTS);
    return this.wrong(hitId);
  }

  selectInSequence(hitId, step) {
    if (this.sequence.includes(hitId)) {
      const feedback = { kind: "partial", text: `Already verified — ${step.itemNames?.[hitId] ?? hitId}.` };
      this.hooks.onFeedback?.(feedback, this);
      return feedback;
    }
    // anyOrder steps require completeness, not a particular order: use them where
    // the real procedure has no mandated sequence, and strict order where it does.
    const expected = step.anyOrder
      ? (step.targets.includes(hitId) ? hitId : null)
      : step.targets[this.sequence.length];
    if (hitId === expected) {
      this.sequence.push(hitId);
      const done = this.sequence.length === step.targets.length;
      if (done) return this.advance(STEP_POINTS + 20 * (step.targets.length - 1));
      Sfx.tick();
      const note = step.itemNotes?.[hitId];
      const feedback = {
        kind: "partial",
        text: `<b>${this.sequence.length}/${step.targets.length} — ${step.itemNames?.[hitId] ?? hitId}.</b>` +
          (note ? `<br>${note}` : " Keep going."),
      };
      this.hooks.onFeedback?.(feedback, this);
      return feedback;
    }
    if (step.decoyNotes?.[hitId]) {
      return this.wrong(hitId, step.decoyNotes[hitId]);
    }
    if (step.targets.includes(hitId)) {
      return this.wrong(hitId, step.outOfOrderNote
        ?? "Out of order. Sequence matters here — reset and take them in the required order.", true);
    }
    return this.wrong(hitId);
  }

  /** Called each frame while a 'hold' step's target is held. */
  setHolding(on) {
    if (!this.step) return;
    if (this.step.kind === "track") { this.holding = on; return; }
    if (this.step.kind !== "hold") return;
    this.holding = on;
    if (!on && this.holdFor > 0 && this.holdFor < this.step.seconds) {
      this.holdFor = 0;
      this.holdBreaks += 1;
      const feedback = { kind: "warn", text: `${this.step.holdBreakNote ?? "Released too early — start the full duration again."}` };
      Sfx.bad();
      this.hooks.onFeedback?.(feedback, this);
    }
  }

  commitGauge() {
    const step = this.step;
    if (!this.gauge || this.gauge.committed) return null;
    const [lo, hi] = this.gauge.green;
    const t = this.gauge.t;
    this.gauge.committed = true;
    if (t < lo || t > hi) {
      this.gauge.committed = false;
      return this.wrong(step.target, step.gauge.missNote
        ?? "Outside the acceptable band. Watch the marker and commit inside the green zone.");
    }
    const centre = (lo + hi) / 2;
    const halfBand = (hi - lo) / 2;
    const accuracy = 1 - Math.abs(t - centre) / halfBand;      // 1 at centre, 0 at edge
    this.gaugeScores.push(Math.max(0, accuracy));
    const bonus = Math.round(50 * Math.max(0, accuracy));
    return this.advance(STEP_POINTS + bonus, bonus >= 40 ? "Dead centre." : null);
  }

  /**
   * Continuous rotational input for a 'turn' step — spinning a valve wheel or
   * throwing a switch by dragging it, rather than clicking an abstract target.
   * `deltaTurns` is a signed fraction of one full turn; the UI layer converts a
   * pointer or controller angular delta into this. Turning backward is free —
   * it lets a learner back off an overshoot rather than being penalised for it.
   */
  rotate(hitId, deltaTurns) {
    if (this.finished || !this.step || this.step.kind !== "turn" || hitId !== this.step.target || !this.turn) return null;
    this.turn.amount = Math.max(0, Math.min(this.turn.required, this.turn.amount + deltaTurns));
    if (this.turn.amount >= this.turn.required) return this.advance(STEP_POINTS);
    return null;
  }

  /** Whether `hitId` is a live pick-up point for the current 'drag' step. */
  canDrag(hitId) {
    return !this.finished && this.step?.kind === "drag" && hitId === this.step.target;
  }

  /**
   * Player released a carried object. `distance` is how far, in metres, the
   * drop landed from the step's required socket; pass null for "no useful
   * distance" (also treated as a miss). Unlike a gauge, a drag near-miss costs
   * nothing — carrying something into place is exploratory, not a precision
   * test — the object is expected to spring back to be tried again. Dropping
   * it onto a registered hazard is still scored, through the normal hazard
   * path, by calling wrong() with that hazard's id instead of this method.
   */
  dropAt(hitId, distance) {
    if (this.finished || !this.step || this.step.kind !== "drag" || hitId !== this.step.target) return null;
    const radius = this.step.drag?.radius ?? 0.35;
    if (distance != null && distance <= radius) return this.advance(STEP_POINTS);
    const feedback = { kind: "partial", text: this.step.drag?.missNote ?? "Not quite lined up — line it up with the marker and try again." };
    this.hooks.onFeedback?.(feedback, this);
    return feedback;
  }

  advance(points, extraNote = null) {
    const step = this.step;
    const earned = Math.round(points * this.combo);
    this.score += earned;
    this.streak += 1;
    this.peakCombo = Math.max(this.peakCombo, this.combo);
    this.log.push({ step: step.id, ok: true, points: earned });
    const feedback = {
      kind: "ok",
      points: earned,
      combo: this.combo,
      text: `<b>+${earned} — ${step.title}</b>${this.combo > 1.05 ? ` <span class="mult">×${this.combo.toFixed(1)}</span>` : ""}<br>${extraNote ? extraNote + " " : ""}${step.why}`,
    };
    if (this.combo >= 1.5) Sfx.great(); else Sfx.good();
    this.hooks.onFeedback?.(feedback, this);
    this.hooks.onStepComplete?.(step, this);
    this.index += 1;
    if (this.index >= this.steps.length) this.finish();
    else this.enterStep();
    return feedback;
  }

  /** True when `hitId` belongs to a step the learner has not reached yet. */
  isLaterStep(hitId) {
    for (let i = this.index + 1; i < this.steps.length; i++) {
      const s = this.steps[i];
      if (s.target === hitId || s.targets?.includes(hitId)) return s;
    }
    return null;
  }

  wrong(hitId, note = null, isOrderError = false) {
    const hazard = this.room.hazards?.[hitId];
    const later = hazard ? null : this.isLaterStep(hitId);
    const penalty = hazard ? HAZARD_PENALTY : WRONG_STEP_PENALTY;
    this.score = Math.max(0, this.score - penalty);
    this.streak = 0;
    this.errors += 1;
    this.log.push({ step: this.step?.id, ok: false, hit: hitId });
    const lateNote = later
      ? (this.room.lateNotes?.[hitId] ?? `That control belongs to a later step. ${this.step?.cue ?? ""}`)
      : null;
    const body = hazard ?? note ?? lateNote ?? `That is not the next control. ${this.step?.cue ?? ""}`;
    const label = hazard ? "Unsafe action"
      : isOrderError ? "Out of sequence"
      : later ? "Too early" : "Wrong step";
    const feedback = {
      kind: hazard ? "danger" : "warn",
      text: `<b>−${penalty} — ${label}</b><br>${body}`,
      // Plain-text version of the same call-out, for apps that speak hazard
      // feedback aloud — the HTML in `text` is fine on a HUD, not in a TTS queue.
      speech: `${label}. ${body}`,
      hazard: !!hazard,
    };
    if (hazard) { this.hazardHits += 1; Sfx.alarm(); this.hooks.onHazard?.(hitId, this); } else Sfx.bad();
    this.hooks.onFeedback?.(feedback, this);
    return feedback;
  }

  tick(dt) {
    if (this.finished) return;
    this.elapsed += dt;
    const step = this.step;
    if (!step) return;

    if (step.kind === "gauge" && this.gauge && !this.gauge.committed) {
      this.gauge.t += this.gauge.dir * this.gauge.speed * dt;
      if (this.gauge.t >= 1) { this.gauge.t = 1; this.gauge.dir = -1; }
      if (this.gauge.t <= 0) { this.gauge.t = 0; this.gauge.dir = 1; }
    }

    if (step.kind === "track" && this.track) {
      const tr = this.track;
      // Press to drive the value up, release to let it fall, with a slow drift
      // the learner has to correct for — the point is holding it steady.
      tr.v += (this.holding ? tr.rise : -tr.fall) * dt;
      tr.v += Math.sin((this.elapsed + tr.wobble) * 1.7) * tr.drift * dt;
      tr.v = Math.max(0, Math.min(1, tr.v));
      const inside = tr.v >= tr.green[0] && tr.v <= tr.green[1];
      if (inside) {
        tr.inBand += dt;
        if (!tr.wasIn) Sfx.tick();
      } else {
        if (tr.wasIn) tr.dropouts += 1;
        tr.inBand = Math.max(0, tr.inBand - dt * 0.8);
      }
      tr.wasIn = inside;
      if (tr.inBand >= step.seconds) {
        const clean = Math.max(0, 40 - tr.dropouts * 12);
        this.advance(STEP_POINTS + 20 + clean,
          tr.dropouts === 0 ? "Held it clean the whole way." : null);
      }
      return;
    }

    if (step.kind === "hold" && this.holding) {
      const before = this.holdFor;
      this.holdFor = Math.min(step.seconds, this.holdFor + dt);
      if (Math.floor(this.holdFor) !== Math.floor(before)) Sfx.tick();
      if (this.holdFor >= step.seconds) {
        this.holding = false;
        this.advance(STEP_POINTS + 25);
      }
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    const par = this.room.parSeconds ?? 150;
    const timeBonus = Math.max(0, Math.round((par - this.elapsed) * 2));
    this.score += timeBonus;
    this.timeBonus = timeBonus;
    this.stars = this.errors === 0 && this.elapsed <= par ? 3
      : this.errors <= 1 && this.elapsed <= par * 1.5 ? 2 : 1;
    if (this.stars === 3 && this.room.badge) this.badgeEarned = this.room.badge.id;

    // Each simulator judges its own badges and challenges against this run.
    const system = this.room.game;
    if (system) {
      for (const award of [...(system.badges ?? []), ...(system.challenges ?? [])]) {
        try {
          if (award.test?.(this)) this.earned.push(award.id);
        } catch (_) { /* a broken predicate must not break the run */ }
      }
    }

    const summary = Progress.record(this.room.id, {
      score: this.score, stars: this.stars, seconds: Math.round(this.elapsed),
      badge: this.badgeEarned, earned: this.earned,
    });
    this.rank = Progress.simRank(this.room.id, system);
    this.rankedUp = !!(this.rankBefore && this.rank.tier > this.rankBefore.tier);
    this.leaderboard = Progress.submitScore(this.room.id, {
      score: this.score, seconds: Math.round(this.elapsed), stars: this.stars,
    });
    Sfx.great();
    this.hooks.onFinish?.(this, summary);
  }
}
