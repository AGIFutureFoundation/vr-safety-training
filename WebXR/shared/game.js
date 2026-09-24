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
// Noticing an interruption while task-loaded is worth more than a step,
// because it is the harder thing and the one nobody practises. Answering
// quickly is worth more again — the whole measure is how long you took.
export const INTERRUPT_POINTS = 120;
export const INTERRUPT_SPEED_BONUS = 60;

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

// One profile, shared on purpose: SmartCiti.X, Trade Skills Simulator and
// Holodeck's real-station mode all import this same module, so a learner's
// XP/level/badges/player name are a single cross-app total rather than
// three separate ones — a room/sim's own record (data.rooms[id]) can't
// collide between apps because every id in the whole vocabulary is unique.
// The key name predates that: it was written when only Trade Skills
// existed. Renamed to say what it actually is now, with a one-time,
// one-way migration from the old key so nobody's saved progress vanishes.
const STORE_KEY = "vr-training-profile-v1";
const LEGACY_STORE_KEY = "trades-sim-v1";
const NAME_KEY = "vr-training-profile-name";
const LEGACY_NAME_KEY = "trades-sim-name";

// ---------------------------------------------------------------- progression

const MAX_BOARD_ENTRIES = 8;

// The account-wide level ladder — one number spanning every room/sim across
// every app sharing this profile, capped at a real endgame rather than
// growing forever. Levels 1-32 use a smooth curve (each level costs more
// than the last); level 33 is the cap — once reached, further XP still
// accumulates (it still counts toward suite standing and leaderboards) but
// no longer raises the level number. Tuned so clearing every sim in the
// current 20-sim SmartCiti.X catalog once (roughly 300 XP each) lands
// solidly in the "Journeyworker" band, leaving "Foreman" and above as a
// real long-term goal — one that gets more reachable, not less, as the
// catalog grows toward its planned 330 sims.
export const MAX_LEVEL = 33;
const LEVEL_XP = Array.from({ length: MAX_LEVEL }, (_, i) => Math.round(120 * Math.pow(i, 1.65)));
// Several levels share a tier name, the same way a real trade ladder doesn't
// mint a new title every single level — "through" is the highest level still
// carrying that name.
const LEVEL_TIERS = [
  { through: 4, name: "Trainee" },
  { through: 8, name: "Apprentice" },
  { through: 12, name: "Journeyworker" },
  { through: 16, name: "Technician" },
  { through: 20, name: "Specialist" },
  { through: 24, name: "Foreman" },
  { through: 28, name: "Master" },
  { through: 32, name: "Certified Master" },
  { through: MAX_LEVEL, name: "Legend" },
];

/**
 * Awards every station can earn, judged by the engine itself rather than by
 * a sim's own system — the flipped-classroom mechanic lives here so all
 * three apps reward it identically. Apps merge these into a sim's own
 * badge/challenge list when naming what a run earned.
 */
export const UNIVERSAL_AWARDS = [
  {
    id: "prepared", name: "Prepared",
    note: "Studied the pre-brief before the run — learn first, prove it in the sim",
    test: (s) => !!s.prepared,
  },
];
/** Score bonus for a run the learner prepared for (fraction of the run's own score). */
export const PREPARED_BONUS = 0.1;

export const Progress = {
  data: { xp: 0, rooms: {}, badges: [], boards: {}, briefed: {} },
  playerName: "YOU",

  load() {
    try {
      let raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!raw) {
        const legacy = localStorage.getItem(LEGACY_STORE_KEY);
        if (legacy) { raw = JSON.parse(legacy); localStorage.setItem(STORE_KEY, legacy); }
      }
      if (raw && typeof raw === "object") {
        this.data = {
          xp: raw.xp | 0,
          rooms: raw.rooms && typeof raw.rooms === "object" ? raw.rooms : {},
          badges: Array.isArray(raw.badges) ? raw.badges : [],
          boards: raw.boards && typeof raw.boards === "object" ? raw.boards : {},
          briefed: raw.briefed && typeof raw.briefed === "object" ? raw.briefed : {},
        };
      }
    } catch (_) { /* private mode or blocked storage — run unsaved */ }
    try {
      const savedName = localStorage.getItem(NAME_KEY) ?? localStorage.getItem(LEGACY_NAME_KEY);
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
    this.data = { xp: 0, rooms: {}, badges: [], boards: {}, briefed: {} };
    try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(LEGACY_STORE_KEY); } catch (_) { /* ignore */ }
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

  /** Combined standing across every simulator this device has played. Pass
   * this app's own room/sim ids to scope it to that app's own catalog —
   * every id in the shared profile is unique, so without a scope this
   * silently spans every app built on this engine, not just the caller's. */
  suiteStanding(ids) {
    const entries = ids ? ids.map((id) => this.data.rooms[id]).filter(Boolean) : Object.values(this.data.rooms);
    let totalScore = 0, totalRuns = 0, totalStars = 0, simsPlayed = 0;
    for (const state of entries) {
      if (!state.runs) continue;
      simsPlayed += 1;
      totalRuns += state.runs | 0;
      totalScore += state.best | 0;
      totalStars += state.stars | 0;
    }
    return { totalScore, totalRuns, totalStars, simsPlayed };
  },

  /** Rooms/sims cleared and stars earned, scoped to one app's own id list —
   * the shared profile's own completedRooms/totalStars getters below are
   * the true cross-network totals; use these two instead anywhere a count
   * is shown against that app's own catalog size (an "X/N" readout), so a
   * learner who has also played a sibling app doesn't see an inflated or
   * over-100% figure. */
  roomsClearedIn(ids) { return ids.filter((id) => (this.data.rooms[id]?.stars ?? 0) > 0).length; },
  starsIn(ids) { return ids.reduce((n, id) => n + (this.data.rooms[id]?.stars ?? 0), 0); },

  get level() {
    let lvl = 1;
    for (let i = 1; i < LEVEL_XP.length; i++) if (this.data.xp >= LEVEL_XP[i]) lvl = i + 1;
    return lvl;
  },
  get maxLevel() { return this.level >= MAX_LEVEL; },
  /** The trade-apprenticeship-style tier name for the current level — several
   * levels share a name (e.g. 9-12 are all "Journeyworker"), the same way a
   * real union ladder doesn't mint a new title every single level. */
  get levelName() {
    const lvl = this.level;
    return LEVEL_TIERS.find((t) => lvl <= t.through)?.name ?? LEVEL_TIERS[LEVEL_TIERS.length - 1].name;
  },
  get xpIntoLevel() {
    const lvl = this.level;
    const base = LEVEL_XP[lvl - 1];
    const next = lvl < MAX_LEVEL ? LEVEL_XP[lvl] : base;
    return { into: this.data.xp - base, span: Math.max(1, next - base) };
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

  /** Flipped classroom: the learner read a station's pre-brief (its steps and
   * the reason for each) before running it. Stamped once per station; the
   * next Session on that station starts `prepared`. */
  markBriefed(id) {
    if (!this.data.briefed) this.data.briefed = {};
    this.data.briefed[id] = new Date().toISOString();
    this.save();
  },
  isBriefed(id) { return !!this.data.briefed?.[id]; },
  // True cross-network totals — every room/sim ever cleared in any app
  // sharing this profile, not just the caller's own catalog. Use
  // roomsClearedIn()/starsIn() above for an app-scoped "X/N" readout.
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

// ------------------------------------------------------------ the drive kind
//
// A 'drive' step puts the learner at the controls of a vehicle the station
// registered (step.target is its hit id) and asks for a route driven the way
// the handbook teaches it: inside the lane, inside the speed band, and with
// every mirror check, signal, horn tap, gear change and light switch done at
// the point on the route where it belongs.
//
//   step.drive = {
//     path: [[x, z], …],          // the lane centre, in the station's own metres
//     speedBand: [lo, hi],        // in `units` (mph unless the step says so)
//     laneWidth: 1.4,             // metres across the lane, in the scene
//     checks: [{ at: 2, kind: "mirror-right" }, …],   // at = path index
//     reverse: false,             // backing: the vehicle faces against the path
//     graceSeconds: 1.5,          // out of lane or band longer than this = unsafe
//     controls: { brake: "<hitId>", radio: "<hitId>" },  // cab controls an
//                                 // interruption on this step may be answered by
//     sceneRate: 0.2,             // scene metres per second per unit of speed
//     checkWindow,                // metres either side of a check's point
//     label, bandLabel, units, laneNote, speedNote, checkNotes: { kind: note },
//   }
//
// Nothing here knows three.js. The Session integrates throttle and steer into
// a distance along the path and a lateral offset from its centre, turns that
// into a pose { x, z, heading }, and reports it through hooks.onDrive; the app
// moves the vehicle with placeVehicle() below. The scoring is track's —
// continuous, on time in band — with the checks as discrete events on top.
// The vehicle waits at the start of the route until the learner first puts a
// foot down, so nothing is scored against a learner who is still reading.

export const DRIVE_CHECKS = ["mirror-left", "mirror-right", "signal-left", "signal-right", "horn", "gear-down", "gear-up", "lights"];
export const DRIVE_CHECK_NAMES = {
  "mirror-left": "left mirror", "mirror-right": "right mirror",
  "signal-left": "left signal", "signal-right": "right signal",
  horn: "horn", "gear-down": "gear down", "gear-up": "gear up", lights: "lights",
};

/** Cumulative distance along a path of [x, z] points. */
export function drivePathInfo(path = []) {
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1], [bx, bz] = path[i];
    cum.push(cum[i - 1] + Math.hypot(bx - ax, bz - az));
  }
  return { cum, total: cum[cum.length - 1] ?? 0 };
}

function wrapAngle(a) {
  let v = a;
  while (v > Math.PI) v -= Math.PI * 2;
  while (v < -Math.PI) v += Math.PI * 2;
  return v;
}

/** The point, unit tangent and heading at distance `s` along the path. */
export function drivePointAt(path, cum, s) {
  const n = path.length;
  if (n < 2) return { x: path[0]?.[0] ?? 0, z: path[0]?.[1] ?? 0, tx: 0, tz: 1, heading: 0, seg: 0 };
  const total = cum[n - 1];
  const d = Math.max(0, Math.min(total, s));
  let i = 1;
  while (i < n - 1 && cum[i] < d) i++;
  const [ax, az] = path[i - 1], [bx, bz] = path[i];
  const len = Math.max(1e-6, cum[i] - cum[i - 1]);
  const u = (d - cum[i - 1]) / len;
  const tx = (bx - ax) / len, tz = (bz - az) / len;
  return { x: ax + (bx - ax) * u, z: az + (bz - az) * u, tx, tz, heading: Math.atan2(tx, tz), seg: i - 1 };
}

/** Signed turn rate (radians per metre) around distance `s`: negative is a
 * right-hander, the way the vehicle's heading turns. */
export function driveCurvature(path, cum, s, span = 1.2) {
  const a = drivePointAt(path, cum, s - span / 2).heading;
  const b = drivePointAt(path, cum, s + span / 2).heading;
  return wrapAngle(b - a) / span;
}

/** Where along the path each check sits, and the window it may be done in. */
function driveCheckPlan(cfg, cum, total) {
  const w = cfg.checkWindow ?? Math.max(1.2, total * 0.12);
  return (cfg.checks ?? []).map((c, i) => {
    const at = Math.max(0, Math.min(cum.length - 1, c.at | 0));
    const d = cum[at] ?? 0;
    return {
      i, kind: c.kind, at, d, from: Math.max(0, d - w), to: Math.min(total, d + w),
      done: false, missed: false, note: c.note ?? cfg.checkNotes?.[c.kind] ?? null,
    };
  });
}

/**
 * Put a registered vehicle at a drive pose. Works on any object with
 * position/rotation (a three.js Group in the app, the stub in the checkers).
 * An articulated rig declares `userData.articulation = { pivot, length }`:
 * the pivot is the group that turns about the kingpin, `length` the kingpin
 * to trailer-axle distance in the rig's own metres, and the trailer follows
 * the tractor the way a real one off-tracks — which is the tail swing and the
 * cut-in a right turn has to be planned around. Pass ds === null to snap the
 * trailer straight behind (a new route starting).
 */
export function placeVehicle(obj, pose, ds = 0) {
  if (!obj || !pose) return;
  obj.position.x = pose.x;
  obj.position.z = pose.z;
  obj.rotation.y = pose.heading;
  const art = obj.userData?.articulation;
  if (art?.pivot) {
    if (art.yaw == null || ds === null) art.yaw = pose.heading;
    const scale = obj.scale?.x || 1;
    const L = Math.max(0.5, (art.length ?? 8) * scale);
    art.yaw += (Math.abs(ds || 0) / L) * Math.sin(wrapAngle(pose.heading - art.yaw));
    art.pivot.rotation.y = wrapAngle(art.yaw - pose.heading);
  }
}

/**
 * The policy runner's driver: follow the path centre at the band midpoint and
 * trigger every check inside its window. `skill` below 1 wanders and skips —
 * the same lapse model shared/robot.js uses for every other kind. Returns
 * { throttle, steer, check } where check is a check kind or null.
 */
export function drivePolicy(session, { skill = 1, random = Math.random } = {}) {
  const d = session?.drive;
  const step = session?.step;
  if (!d || !step || step.kind !== "drive") return { throttle: 0, steer: 0, check: null };
  const [lo, hi] = d.band;
  const aim = (lo + hi) / 2 + (1 - skill) * (random() * 2 - 1) * (hi - lo) * 0.9;
  const throttle = Math.max(-1, Math.min(1, (aim - d.speed) * 1.5 / Math.max(1, hi - lo)));
  const drift = d.curvature * d.speed * d.sceneRate * d.driftK;
  // A lapse is a slow wander off the centre line, not a twitch: the aim point
  // random-walks, and a novice's walks further before it is pulled back.
  d.policyAim = (d.policyAim ?? 0) * 0.97 + (random() * 2 - 1) * (1 - skill) * d.laneWidth * 0.12;
  const want = -(d.offset - d.policyAim) * 3 - drift;
  const steer = Math.max(-1, Math.min(1, want / d.steerRate));
  let check = null;
  const due = d.plan.find((c) => !c.done && !c.missed && d.s >= c.from + (c.d - c.from) * 0.4 && d.s <= c.to);
  // Each check is decided once: a novice who forgets a mirror forgets it.
  if (due) {
    if (due.policyRoll == null) due.policyRoll = random();
    if (due.policyRoll >= (1 - skill) * 0.6) check = due.kind;
  }
  return { throttle, steer, check };
}

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
    this.drive = null;       // live state for a 'drive' step
    this.stars = 0;
    this.badgeEarned = null;
    this.hazardHits = 0;      // unsafe-action selections in this run
    // Per-step timing and mistakes, so a run can be reviewed step by step
    // rather than as one score. This is what the debrief, the instructor's
    // after-action view and the xAPI statement are all built from.
    this.stepLog = [];
    this.stepStartedAt = 0;
    this.stepErrors = 0;
    this.stepHazards = 0;
    this.gaugeScores = [];    // 0..1 accuracy for each graded skill step
    this.holdBreaks = 0;      // timed steps released early
    this.earned = [];         // per-sim badges and challenges cleared this run
    // Interruptions: things that happen TO the learner mid-procedure and have
    // to be noticed and answered while they are busy with something else. See
    // armInterrupt() below for why this is its own layer and not a step.
    this.interrupts = (room.interrupts ?? []).map((i) => ({ ...i, fired: false, resolved: null }));
    this.activeInterrupt = null;
    this.interruptLog = [];
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
    this.stepLog = [];
    this.stepStartedAt = 0;
    this.stepErrors = 0;
    this.stepHazards = 0;
    // Snapshot rank before this run so finish() can tell whether it moved the
    // needle — a rank-up mid-progression is a moment worth celebrating.
    this.rankBefore = this.room.game ? Progress.simRank(this.room.id, this.room.game) : null;
    this.levelBefore = Progress.level;
    this.prepared = Progress.isBriefed(this.room.id);
    this.preparedBonus = 0;
    this.enterStep();
    return this;
  }

  enterStep() {
    const step = this.step;
    // A step's clock starts when the learner arrives at it, not at the run's
    // start, so a slow step is visible even in a fast run.
    this.stepStartedAt = this.elapsed;
    this.stepErrors = 0;
    this.stepHazards = 0;
    this.sequence = [];
    this.holdFor = 0;
    this.holding = false;
    this.gauge = null;
    this.track = null;
    this.turn = null;
    this.drive = null;
    if (!step) return;
    // Anything scheduled to interrupt this step starts its fuse now.
    this.armInterrupt(step.id);
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
    if (step.kind === "drive") this.drive = this.makeDrive(step);
    this.hooks.onStep?.(step, this);
    if (this.drive) this.hooks.onDrive?.(step, this, null);
  }

  /** Player selected an interactable by id. Returns a feedback record. */
  select(hitId) {
    if (this.finished || !this.step) return null;
    // A live alarm takes the next thing the learner touches. That is the
    // whole exercise: break off what you are doing and deal with it.
    if (this.activeInterrupt) return this.resolveInterrupt(hitId);
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

    if (step.kind === "drive") {
      // Driven by driveInput()/driveCheck(); the vehicle and its own cab
      // controls are live, so touching them is not a mistake.
      if (hitId === step.target || Object.values(step.drive?.controls ?? {}).includes(hitId)) return null;
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

  /** Live state for a 'drive' step, from its declaration. */
  makeDrive(step) {
    const cfg = step.drive ?? {};
    const path = Array.isArray(cfg.path) && cfg.path.length >= 2 ? cfg.path : [[0, 0], [0, 4]];
    const { cum, total } = drivePathInfo(path);
    const band = Array.isArray(cfg.speedBand) ? [+cfg.speedBand[0], +cfg.speedBand[1]] : [3, 8];
    const width = Math.max(1, band[1] - band[0]);
    const laneWidth = cfg.laneWidth ?? 1.4;
    const d = {
      path, cum, total, band, laneWidth,
      reverse: !!cfg.reverse,
      units: cfg.units ?? "mph",
      label: cfg.label ?? (cfg.reverse ? "REVERSE" : "DRIVE"),
      bandLabel: cfg.bandLabel ?? null,
      grace: cfg.graceSeconds ?? 1.5,
      ramp: cfg.rampSeconds ?? 4,
      sceneRate: cfg.sceneRate ?? 0.2,
      accel: cfg.accel ?? Math.max(2, width * 1.2),
      maxSpeed: cfg.maxSpeed ?? band[1] * 1.6 + 2,
      steerRate: cfg.steerRate ?? laneWidth * 0.9,
      driftK: cfg.driftK ?? 0.35,
      controls: cfg.controls ?? {},
      plan: driveCheckPlan(cfg, cum, total),
      s: 0, ds: 0, speed: 0, offset: 0, throttle: 0, steer: 0, curvature: 0,
      started: false, startedAt: null, reachedBand: false,
      outLane: 0, outBand: 0, laneFlagged: false, bandFlagged: false,
      inBand: 0, driven: 0, dropouts: 0, wasIn: true, braking: false,
      quietUntil: -1, pose: null, done: false,
    };
    d.pose = this.drivePose(d);
    return d;
  }

  drivePose(d) {
    const p = drivePointAt(d.path, d.cum, d.s);
    // Offset is to the driver's right of the direction of travel; the right
    // of a vector (tx, tz) in this frame is (-tz, tx).
    const x = p.x + -p.tz * d.offset, z = p.z + p.tx * d.offset;
    return { x, z, heading: d.reverse ? wrapAngle(p.heading + Math.PI) : p.heading, s: d.s, total: d.total };
  }

  /**
   * Continuous vehicle input: throttle in [-1, 1] (below zero is the brake),
   * steer in [-1, 1] (positive steers to the right of the direction of
   * travel). The app calls this every frame from the keys, the pad and the
   * touch controls; the policy runner calls it through applyAction.
   */
  driveInput({ throttle = 0, steer = 0, brake = false } = {}) {
    const d = this.drive;
    if (this.finished || !d || this.step?.kind !== "drive") return null;
    const t = brake ? -1 : Math.max(-1, Math.min(1, +throttle || 0));
    d.throttle = t;
    d.steer = Math.max(-1, Math.min(1, +steer || 0));
    if (!d.started && t > 0.05) { d.started = true; d.startedAt = this.elapsed; }
    // A fresh press of the brake is also a control: an interruption on this
    // step that wants the brake is answered by braking, not by finding a
    // pedal to click.
    const braking = t < -0.4;
    let fb = null;
    if (braking && !d.braking) fb = this.driveControl("brake");
    d.braking = braking;
    return fb;
  }

  /** A named cab control on a drive step ("brake", "radio"): answers a live
   * interruption that wants that control, and is otherwise harmless. */
  driveControl(name) {
    const d = this.drive;
    if (!d || !this.activeInterrupt) return null;
    const id = d.controls?.[name];
    if (!id) return null;
    return this.resolveInterrupt(id);
  }

  /** A discrete check on a drive step — a mirror, a signal, the horn, a gear,
   * the lights. Credited when it lands inside that check's window. */
  driveCheck(kind) {
    const d = this.drive;
    if (this.finished || !d || this.step?.kind !== "drive" || !kind) return null;
    if (this.activeInterrupt && kind === "horn" && d.controls?.horn) return this.resolveInterrupt(d.controls.horn);
    const due = d.plan.find((c) => !c.done && !c.missed && c.kind === kind && d.s >= c.from && d.s <= c.to);
    const name = DRIVE_CHECK_NAMES[kind] ?? kind;
    if (due) {
      due.done = true;
      Sfx.tick();
      const left = d.plan.filter((c) => !c.done && !c.missed).length;
      const feedback = { kind: "partial", text: `<b>${name[0].toUpperCase()}${name.slice(1)} — on time.</b>${due.note ? `<br>${due.note}` : left ? " Keep driving." : ""}` };
      this.hooks.onFeedback?.(feedback, this);
      return feedback;
    }
    // Signalling the wrong way is the one check that misleads everyone round
    // you, so it costs; any other check out of place is just early or late.
    const opposite = { "signal-left": "signal-right", "signal-right": "signal-left" }[kind];
    if (opposite && d.plan.some((c) => !c.done && !c.missed && c.kind === opposite && d.s >= c.from && d.s <= c.to)) {
      return this.wrong(this.step.target, this.step.drive?.wrongSignalNote
        ?? "Wrong signal. A signal tells every driver and pedestrian round you where you are about to go, and this one told them the opposite.");
    }
    const feedback = { kind: "partial", text: `Nothing on this stretch calls for the ${name}.` };
    this.hooks.onFeedback?.(feedback, this);
    return feedback;
  }

  /** An unsafe drive: out of lane or band past the grace, or a check missed
   * that the handbook calls a safety check. Counted like a hazard hit. */
  driveHazard(note) {
    const step = this.step;
    this.score = Math.max(0, this.score - HAZARD_PENALTY);
    this.streak = 0;
    this.errors += 1;
    this.stepErrors += 1;
    this.stepHazards += 1;
    this.hazardHits += 1;
    this.log.push({ step: step?.id, ok: false, hit: step?.target });
    const feedback = {
      kind: "danger", hazard: true,
      text: `<b>−${HAZARD_PENALTY} — Unsafe driving</b><br>${note}`,
      speech: `Unsafe driving. ${note}`,
    };
    Sfx.alarm();
    this.hooks.onHazard?.(step?.target, this);
    this.hooks.onFeedback?.(feedback, this);
    return feedback;
  }

  driveMissed(check) {
    const name = DRIVE_CHECK_NAMES[check.kind] ?? check.kind;
    this.score = Math.max(0, this.score - WRONG_STEP_PENALTY);
    this.streak = 0;
    this.errors += 1;
    this.stepErrors += 1;
    this.log.push({ step: this.step?.id, ok: false, hit: `check:${check.kind}` });
    const body = check.note ?? `The ${name} belonged back there, before the point on the route that needed it.`;
    const feedback = { kind: "warn", text: `<b>−${WRONG_STEP_PENALTY} — Missed the ${name}</b><br>${body}`, speech: `Missed the ${name}. ${body}` };
    Sfx.bad();
    this.hooks.onFeedback?.(feedback, this);
    return feedback;
  }

  tickDrive(dt) {
    const d = this.drive;
    const step = this.step;
    // Sub-stepped, so a long frame (or a checker winding the clock) integrates
    // the same way sixty short ones would.
    let left = dt;
    while (left > 1e-9 && this.step === step && !this.finished) {
      const h = Math.min(0.05, left);
      left -= h;
      if (!d.started) continue;
      const t = d.throttle;
      const coast = d.accel * 0.3;
      d.speed += (t >= 0 ? t * d.accel - coast : t * d.accel * 2.5) * h;
      d.speed = Math.max(0, Math.min(d.maxSpeed, d.speed));
      const ds = d.speed * d.sceneRate * h;
      d.s = Math.min(d.total, d.s + ds);
      d.ds = ds;
      d.curvature = driveCurvature(d.path, d.cum, d.s);
      // The road pulls a vehicle to the outside of a bend unless it is steered
      // round it, and a little crown and crosswind wander on the straights.
      const drift = d.curvature * d.speed * d.sceneRate * d.driftK
        + Math.sin((this.elapsed + d.s) * 1.3) * 0.04 * d.laneWidth * (d.speed > 0.1 ? 1 : 0);
      d.offset += (d.steer * d.steerRate + drift) * h;
      d.offset = Math.max(-d.laneWidth * 1.5, Math.min(d.laneWidth * 1.5, d.offset));
      d.pose = this.drivePose(d);
      d.driven += h;

      const quiet = this.activeInterrupt || this.elapsed < d.quietUntil;
      const inLane = Math.abs(d.offset) <= d.laneWidth / 2;
      const [lo, hi] = d.band;
      if (d.speed >= lo && d.speed <= hi) d.reachedBand = true;
      const early = !d.reachedBand && this.elapsed - (d.startedAt ?? this.elapsed) < d.ramp;
      const inBandNow = d.speed <= hi && (d.speed >= lo || early);
      const inside = inLane && inBandNow;
      if (inside) d.inBand += h;
      else if (d.wasIn) { d.dropouts += 1; this.holdBreaks += 1; }
      d.wasIn = inside;

      if (!inLane && !quiet) {
        d.outLane += h;
        if (d.outLane > d.grace && !d.laneFlagged) {
          d.laneFlagged = true;
          this.driveHazard(step.drive?.laneNote ?? "You left the lane and stayed out of it. On a real road that is the curb, the next lane's traffic or the ditch.");
        }
      } else if (inLane) { d.outLane = 0; d.laneFlagged = false; }
      if (!inBandNow && !quiet) {
        d.outBand += h;
        if (d.outBand > d.grace && !d.bandFlagged) {
          d.bandFlagged = true;
          this.driveHazard(step.drive?.speedNote ?? (d.speed > hi
            ? "Too fast for this stretch, and for long enough to matter. Speed is the one thing that turns every other mistake into a crash."
            : "Too slow for this stretch, and for long enough to matter: a vehicle far under the flow of traffic is one the traffic behind has to swerve round."));
        }
      } else if (inBandNow) { d.outBand = 0; d.bandFlagged = false; }

      for (const c of d.plan) {
        if (!c.done && !c.missed && d.s > c.to) { c.missed = true; this.driveMissed(c); }
      }

      if (d.s >= d.total - 1e-6 && this.step === step) {
        for (const c of d.plan) if (!c.done && !c.missed) { c.missed = true; this.driveMissed(c); }
        this.hooks.onDrive?.(step, this, ds);
        const share = d.driven > 0 ? d.inBand / d.driven : 1;
        this.gaugeScores.push(Math.max(0, Math.min(1, share)));
        const clean = Math.max(0, 40 - d.dropouts * 12);
        d.done = true;
        this.advance(STEP_POINTS + 20 + clean, d.dropouts === 0 ? "In the lane and in the band the whole way." : null);
        return;
      }
      this.hooks.onDrive?.(step, this, ds);
    }
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
    this.stepLog.push({
      id: step.id, title: step.title, kind: step.kind,
      seconds: Math.max(0, Math.round((this.elapsed - this.stepStartedAt) * 10) / 10),
      corrections: this.stepErrors, hazards: this.stepHazards,
      clean: this.stepErrors === 0 && this.stepHazards === 0,
      points: earned,
    });
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
    this.stepErrors += 1;
    if (hazard) this.stepHazards += 1;
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

  /**
   * Interruptions.
   *
   * Every step kind in this engine asks the same question: do you know what
   * comes next. That is worth assessing and it is not what gets people hurt.
   * What gets people hurt is the thing that happens while they are busy —
   * somebody walks into the exclusion zone, a reading drifts out of band, the
   * permit runs out, the radio calls — and the crew is too task-loaded to
   * notice for thirty seconds.
   *
   * So an interruption is not a step. It arrives unannounced partway through
   * a step the learner is already working, it runs on its own clock, and the
   * learner has to break off, deal with it, and come back. The procedure
   * underneath is untouched: the same steps in the same order, still scored
   * the same way. What changes is whether you were paying attention.
   *
   * A station declares them as:
   *
   *   interrupts: [{
   *     id, after: "<stepId>", delay: 4,     // fires 4s into that step
   *     alert: "...",                        // what the learner sees or hears
   *     target: "<hitId>",                   // the right response
   *     seconds: 12,                         // how long they have
   *     why: "...",                          // why that is the right response
   *     missNote: "...",                     // the consequence of not acting
   *     wrongNote: "...",                    // optional, for the wrong control
   *   }]
   *
   * Scoring is deliberately asymmetric. Answering correctly is worth real
   * points because noticing is the skill. Missing it entirely counts as an
   * unsafe action, not an ordinary mistake, because in every case the thing
   * that went unanswered was a safety condition — and that means it lands on
   * hazardHits, which is what the pass rule and the badges key off.
   */
  armInterrupt(stepId) {
    for (const it of this.interrupts) {
      // Leaving a step disarms anything that was waiting on it. An
      // interruption is an event DURING a particular task: if the learner got
      // through that task faster than the fuse, there was no window and it
      // does not happen. Without this, a stale arm fires several steps later,
      // where its alert makes no sense ("somebody took your lock off while you
      // were testing" during the grounding step) and — worse — reaching for
      // the control the current step actually wants is scored as a wrong
      // response to an alarm the learner had no reason to expect.
      if (!it.fired && it.armedAt != null && it.after !== stepId) it.armedAt = null;
      if (!it.fired && it.after === stepId) it.armedAt = this.elapsed + (it.delay ?? 3);
    }
  }

  tickInterrupts(dt) {
    void dt;
    // Fire anything whose moment has come, one at a time — two alarms at once
    // is a different exercise and not one this engine claims to run.
    if (!this.activeInterrupt) {
      const due = this.interrupts.find((i) => !i.fired && i.armedAt != null && this.elapsed >= i.armedAt);
      if (due) {
        due.fired = true;
        due.firedAt = this.elapsed;
        this.activeInterrupt = due;
        Sfx.alarm();
        this.hooks.onInterrupt?.(due, this);
      }
    }
    const it = this.activeInterrupt;
    if (!it) return;
    it.left = Math.max(0, (it.firedAt + (it.seconds ?? 12)) - this.elapsed);
    if (it.left <= 0) this.resolveInterrupt(null);
  }

  /** The learner answered an interruption, or ran out of time (hitId null). */
  resolveInterrupt(hitId) {
    const it = this.activeInterrupt;
    if (!it) return null;
    this.activeInterrupt = null;
    const took = Math.round((this.elapsed - it.firedAt) * 10) / 10;
    const ok = hitId === it.target;
    // A driver who brakes for a car cutting in has left the speed band on
    // purpose; give them a moment to get back into it before it counts.
    if (this.drive) { this.drive.quietUntil = this.elapsed + 3; this.drive.outBand = 0; this.drive.outLane = 0; }
    it.resolved = ok ? "answered" : hitId ? "wrong" : "missed";
    this.interruptLog.push({ id: it.id, alert: it.alert, outcome: it.resolved, seconds: took });

    let feedback;
    if (ok) {
      // Answering fast is worth more, because the whole point is how long it
      // took you to notice.
      const speed = Math.max(0, 1 - took / (it.seconds ?? 12));
      const points = INTERRUPT_POINTS + Math.round(speed * INTERRUPT_SPEED_BONUS);
      this.score += points;
      feedback = { kind: "ok", text: `<b>+${points} — Caught it</b><br>${it.why}`, speech: `Caught it. ${it.why}`, points };
      Sfx.great();
    } else {
      // Both a wrong answer and no answer are unsafe actions: the condition
      // that raised the alarm is still there either way.
      this.score = Math.max(0, this.score - HAZARD_PENALTY);
      this.streak = 0;
      this.errors += 1;
      this.stepErrors += 1;
      this.stepHazards += 1;
      this.hazardHits += 1;
      const body = hitId ? (it.wrongNote ?? it.missNote) : it.missNote;
      const label = hitId ? "Wrong response" : "Missed it";
      feedback = {
        kind: "danger",
        text: `<b>−${HAZARD_PENALTY} — ${label}</b><br>${body}`,
        speech: `${label}. ${body}`,
        hazard: true,
      };
      Sfx.alarm();
      this.hooks.onHazard?.(it.target, this);
    }
    this.hooks.onInterruptEnd?.(it, this);
    this.hooks.onFeedback?.(feedback, this);
    return feedback;
  }

  /** How the run handled its interruptions, for the debrief and the record. */
  interruptSummary() {
    const log = this.interruptLog;
    if (!log.length) return null;
    return {
      total: this.interrupts.length,
      answered: log.filter((l) => l.outcome === "answered").length,
      wrong: log.filter((l) => l.outcome === "wrong").length,
      missed: log.filter((l) => l.outcome === "missed").length,
      slowest: [...log].sort((a, b) => b.seconds - a.seconds)[0] ?? null,
      log,
    };
  }

  tick(dt) {
    if (this.finished) return;
    this.elapsed += dt;
    this.tickInterrupts(dt);
    const step = this.step;
    if (!step) return;

    if (step.kind === "drive" && this.drive) { this.tickDrive(dt); return; }

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

  /**
   * The after-action review of this run: every step with the time it took
   * and the mistakes made on it, plus the two questions an instructor asks
   * first — where did it go slowest, and where did it go wrong.
   *
   * Derived from stepLog, so it costs nothing until something asks for it,
   * and it is the same object the results panel, the training record and
   * the xAPI statement all use.
   */
  debrief() {
    const steps = this.stepLog;
    if (!steps.length) return { steps: [], cleanSteps: 0, totalSteps: this.steps.length, slowest: null, worst: null, medianSeconds: 0, interrupts: this.interruptSummary() };
    const byTime = [...steps].sort((a, b) => b.seconds - a.seconds);
    const byTrouble = [...steps].sort((a, b) => (b.hazards * 10 + b.corrections) - (a.hazards * 10 + a.corrections));
    const sorted = [...steps].map((s) => s.seconds).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return {
      steps,
      totalSteps: this.steps.length,
      cleanSteps: steps.filter((s) => s.clean).length,
      interrupts: this.interruptSummary(),
      slowest: byTime[0] ?? null,
      worst: byTrouble[0]?.corrections || byTrouble[0]?.hazards ? byTrouble[0] : null,
      medianSeconds: sorted.length % 2 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10,
    };
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    const par = this.room.parSeconds ?? 150;
    const timeBonus = Math.max(0, Math.round((par - this.elapsed) * 2));
    this.score += timeBonus;
    this.timeBonus = timeBonus;
    if (this.prepared) {
      this.preparedBonus = Math.round(this.score * PREPARED_BONUS);
      this.score += this.preparedBonus;
    }
    this.stars = this.errors === 0 && this.elapsed <= par ? 3
      : this.errors <= 1 && this.elapsed <= par * 1.5 ? 2 : 1;
    if (this.stars === 3 && this.room.badge) this.badgeEarned = this.room.badge.id;

    // Engine-wide awards first, then each simulator judges its own badges
    // and challenges against this run.
    for (const award of UNIVERSAL_AWARDS) if (award.test(this)) this.earned.push(award.id);
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
    this.level = Progress.level;
    this.levelName = Progress.levelName;
    this.leveledUp = this.level > this.levelBefore;
    this.leaderboard = Progress.submitScore(this.room.id, {
      score: this.score, seconds: Math.round(this.elapsed), stars: this.stars,
    });
    Sfx.great();
    this.hooks.onFinish?.(this, summary);
  }
}
