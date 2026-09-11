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

const STORE_KEY = "trades-sim-v1";

// ---------------------------------------------------------------- progression

export const Progress = {
  data: { xp: 0, rooms: {}, badges: [] },

  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (raw && typeof raw === "object") {
        this.data = {
          xp: raw.xp | 0,
          rooms: raw.rooms && typeof raw.rooms === "object" ? raw.rooms : {},
          badges: Array.isArray(raw.badges) ? raw.badges : [],
        };
      }
    } catch (_) { /* private mode or blocked storage — run unsaved */ }
    return this.data;
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (_) { /* ignore */ }
  },

  reset() {
    this.data = { xp: 0, rooms: {}, badges: [] };
    try { localStorage.removeItem(STORE_KEY); } catch (_) { /* ignore */ }
  },

  get level() { return 1 + Math.floor(Math.sqrt(this.data.xp / 120)); },
  get xpIntoLevel() {
    const base = Math.pow(this.level - 1, 2) * 120;
    const next = Math.pow(this.level, 2) * 120;
    return { into: this.data.xp - base, span: next - base };
  },
  roomState(id) { return this.data.rooms[id] || { stars: 0, best: 0, bestTime: null, runs: 0 }; },
  get completedRooms() { return Object.values(this.data.rooms).filter((r) => r.stars > 0).length; },
  get totalStars() { return Object.values(this.data.rooms).reduce((n, r) => n + (r.stars | 0), 0); },

  record(roomId, { score, stars, seconds, badge }) {
    const prev = this.roomState(roomId);
    const next = {
      stars: Math.max(prev.stars | 0, stars),
      best: Math.max(prev.best | 0, score),
      bestTime: prev.bestTime == null ? seconds : Math.min(prev.bestTime, seconds),
      runs: (prev.runs | 0) + 1,
    };
    this.data.rooms[roomId] = next;
    this.data.xp += Math.max(0, Math.round(score / 8));
    if (badge && !this.data.badges.includes(badge)) this.data.badges.push(badge);
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
    this.errors = 0;
    this.finished = false;
    this.elapsed = 0;
    this.log = [];
    this.sequence = [];      // progress within a 'sequence' step
    this.holdFor = 0;        // progress within a 'hold' step
    this.holding = false;
    this.gauge = null;       // live gauge state for a 'gauge' step
    this.stars = 0;
    this.badgeEarned = null;
  }

  get steps() { return this.room.steps; }
  get step() { return this.steps[this.index] || null; }
  get combo() { return Math.min(MAX_COMBO, 1 + this.streak * 0.1); }
  get progress01() { return this.steps.length ? this.index / this.steps.length : 0; }

  start() {
    this.elapsed = 0;
    this.enterStep();
    return this;
  }

  enterStep() {
    const step = this.step;
    this.sequence = [];
    this.holdFor = 0;
    this.holding = false;
    this.gauge = null;
    if (!step) return;
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

    if (step.kind === "hold") {
      if (hitId === step.target) return null; // hold handled by press/release
      return this.wrong(hitId);
    }

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
      const feedback = {
        kind: "partial",
        text: `${this.sequence.length}/${step.targets.length} — ${step.itemNames?.[hitId] ?? hitId}. Keep going.`,
      };
      this.hooks.onFeedback?.(feedback, this);
      return feedback;
    }
    if (step.targets.includes(hitId)) {
      return this.wrong(hitId, step.outOfOrderNote
        ?? "Out of order. Sequence matters here — reset and take them in the required order.", true);
    }
    return this.wrong(hitId);
  }

  /** Called each frame while a 'hold' step's target is held. */
  setHolding(on) {
    if (!this.step || this.step.kind !== "hold") return;
    this.holding = on;
    if (!on && this.holdFor > 0 && this.holdFor < this.step.seconds) {
      this.holdFor = 0;
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
    const bonus = Math.round(50 * Math.max(0, accuracy));
    return this.advance(STEP_POINTS + bonus, bonus >= 40 ? "Dead centre." : null);
  }

  advance(points, extraNote = null) {
    const step = this.step;
    const earned = Math.round(points * this.combo);
    this.score += earned;
    this.streak += 1;
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
      hazard: !!hazard,
    };
    if (hazard) { Sfx.alarm(); this.hooks.onHazard?.(hitId, this); } else Sfx.bad();
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
    const summary = Progress.record(this.room.id, {
      score: this.score, stars: this.stars, seconds: Math.round(this.elapsed), badge: this.badgeEarned,
    });
    Sfx.great();
    this.hooks.onFinish?.(this, summary);
  }
}
