// Episode recorder — mines a live training session for robot- and
// model-training data, the same way tools/robot_train.mjs mines a headless
// policy run, but from a person actually playing the station.
//
// Everything this module needs from the engine it already gets from
// shared/robot.js's observe() and, when the station is built and a grasp or
// pose is meaningful, shared/robot-embodiment.js's observeEmbodied() — this
// module adds no observation fields of its own that those two do not already
// define, save for the environment/context ones (interactable set, weather,
// time of day, the ambient event seed, and which view the learner is in),
// which is on purpose: a synthetic rollout and a live episode read the same
// way to anything downstream (see tools/export_dataset.mjs and
// docs/robot-datasets.md).
//
// `attachEpisodeRecorder(session, opts)` wraps the handful of methods app.js
// already calls to apply an action (select, rotate, dropAt, setHolding,
// driveCheck) — the same surface shared/robot.js's applyAction() drives — so
// no call site in app.js has to change to report a decision, only to attach
// the recorder once per station and feed it a pose source at a low rate from
// the render loop. Nothing here ever touches the render loop synchronously
// with localStorage: every write is buffered in memory and flushed on a
// deferred timer (see scheduleFlush()), so a slow disk or a full quota never
// costs a frame.
//
// Personal data minimisation: an episode never carries a name or free text.
// The only thing that could identify a person — the crew tag Progress or
// Identity hands this module — is folded through hashCrewTag() before it is
// ever written anywhere, so what lands in storage (and in an export) is a
// salted, one-way-looking digest, never the tag itself. That is data
// minimisation, not cryptography: hashCrewTag() says so in its own comment.

import { observe } from "./robot.js";
import { observeEmbodied, embodimentFor } from "./robot-embodiment.js";
import { gtStorage } from "./profiles.js";

export const EPISODE_SCHEMA_VERSION = 1;

const EPISODES_KEY = "vr-training-episodes-v1";
const CURRENT_KEY = "vr-training-episodes-current-v1";
const SALT_KEY = "vr-training-episode-salt-v1";

/** Byte budget for the whole stored episode list (JSON length, not disk
 * bytes — near enough for a cap whose job is "stop before the browser's
 * quota does"). Oldest episodes are evicted first; see evict() below. */
export const MAX_STORE_BYTES = 1_500_000;
/** How often the pose track samples, in Hz. ~4 Hz is dense enough to see an
 * approach and a retreat and light enough that a whole station's track is a
 * few hundred samples, not tens of thousands. */
export const POSE_HZ = 4;
/** Episodes recorded in one store, hard cap regardless of byte budget — a
 * belt-and-braces limit so a runaway session (left open overnight) cannot
 * turn eviction into a per-frame cost by growing the list without bound. */
export const MAX_EPISODES = 400;

// --------------------------------------------------------------- crew tag

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function loadSalt() {
  try {
    let s = gtStorage()?.getItem(SALT_KEY);
    if (!s) {
      s = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      gtStorage()?.setItem(SALT_KEY, s);
    }
    return s;
  } catch (_) {
    // Private mode or blocked storage: a per-call random salt still keeps the
    // tag out of the record, it just cannot be joined to itself run to run.
    return `no-store-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * A crew tag, salted and hashed — never the tag itself. This is data
 * minimisation (nothing that reads like a name ever reaches storage or an
 * export), not cryptographic security: fnv1a is a fast non-cryptographic
 * hash, chosen because it needs no dependency and no async Web Crypto call
 * on the render thread. It is not meant to resist a targeted attacker with
 * the salt and a short list of candidate tags — it is meant to keep a crew
 * tag out of a dataset that would otherwise carry it in plain text.
 */
export function hashCrewTag(tag) {
  const t = (tag ?? "").toString().trim();
  if (!t) return null;
  const salt = loadSalt();
  const h1 = fnv1a(`${salt}:${t}`);
  const h2 = fnv1a(`${t}:${salt}:${h1}`);
  return `${h1}${h2}`;
}

// ------------------------------------------------------------------ store

function loadJSON(key, fallback) {
  try { const raw = JSON.parse(gtStorage()?.getItem(key) ?? "null"); return raw ?? fallback; }
  catch (_) { return fallback; }
}
function byteLength(v) { try { return JSON.stringify(v).length; } catch (_) { return Infinity; } }
function trySave(key, v) {
  try { gtStorage()?.setItem(key, JSON.stringify(v)); return true; }
  catch (_) { return false; }
}

/** Oldest-first eviction until the list fits both the count and byte caps.
 * If a single remaining episode is still over budget (a very long run with a
 * dense pose track), its pose track — the heaviest field — is dropped rather
 * than the whole episode, so the summary and the dedupe key survive. */
function evict(list, { maxBytes = MAX_STORE_BYTES, maxEpisodes = MAX_EPISODES } = {}) {
  const out = list.slice();
  while (out.length > maxEpisodes) out.shift();
  while (out.length > 1 && byteLength(out) > maxBytes) out.shift();
  if (out.length === 1 && byteLength(out) > maxBytes && out[0].poses?.length) {
    out[0] = { ...out[0], poses: [], posesTrimmed: true };
  }
  return out;
}

/** The local episode store: append-only, capped, oldest-first eviction — the
 * same shape of contract WebXR/shared/records.js keeps for training records,
 * kept separate because an episode (with its pose track) is a very different
 * size and a very different consumer (a dataset builder, not an instructor). */
export const EpisodeStore = {
  list() { return loadJSON(EPISODES_KEY, []); },
  count() { return EpisodeStore.list().length; },
  bytes() { return byteLength(EpisodeStore.list()); },
  /** The in-progress episode last flushed mid-run, or null. Recovered on the
   * next append, replaced by the finished episode. */
  current() { return loadJSON(CURRENT_KEY, null); },
  append(episode) {
    const list = evict([...EpisodeStore.list(), episode]);
    trySave(EPISODES_KEY, list);
    try { gtStorage()?.removeItem(CURRENT_KEY); } catch (_) { /* ignore */ }
    return episode;
  },
  clear() {
    try { gtStorage()?.removeItem(EPISODES_KEY); gtStorage()?.removeItem(CURRENT_KEY); } catch (_) { /* ignore */ }
  },
};

// --------------------------------------------------------------- pose track

const roundNum = (n) => Math.round((Number(n) || 0) * 1000) / 1000;

/** A three.js-shaped object's pose, compacted to a plain array pair — works
 * against a real Object3D (position + quaternion) or a rotation-only stand-in
 * (a hand joint with no quaternion), and against nothing at all. */
function compactPose(obj) {
  if (!obj || !obj.position) return null;
  const p = obj.position;
  const out = { p: [roundNum(p.x), roundNum(p.y), roundNum(p.z)] };
  const q = obj.quaternion;
  if (q && typeof q.x === "number") out.q = [roundNum(q.x), roundNum(q.y), roundNum(q.z), roundNum(q.w)];
  else if (obj.rotation) out.e = [roundNum(obj.rotation.x), roundNum(obj.rotation.y), roundNum(obj.rotation.z)];
  return out;
}

// -------------------------------------------------------------- recording

/**
 * Attach a recorder to a live shared/game.js Session. Wraps the session's own
 * action methods (the same ones app.js already calls) so every decision is
 * captured with no new call site, and merges into session.hooks.onFinish so
 * the episode is persisted the moment the run ends. Call `tick(dt, poseSource)`
 * from the render loop for the low-rate pose track; everything else happens
 * from the wrapped methods and the finish hook.
 *
 *   attachEpisodeRecorder(session, {
 *     app: "smartcity", station: room.id, room, api,   // api = room.build() result
 *     crewTag: Progress.playerName,                    // hashed before storage
 *     viewMode: () => renderer.xr.isPresenting ? "vr" : "desktop",
 *     env: () => ({ weather: stage.weather?.kind, timeOfDay: timeOfDay(), eventSeed }),
 *   });
 *
 * `room`/`api` are optional — without them the recorder still captures every
 * decision through shared/robot.js's observe(), just without the pose/grasp/
 * force/keep-out fields shared/robot-embodiment.js adds when a station is
 * built and a step's target has a pose.
 */
export function attachEpisodeRecorder(session, opts = {}) {
  const {
    app = null, station = null, room = null, api = null,
    crewTag = null, viewMode = "desktop", env = null,
    interactableIds = null, store = true, poseHz = POSE_HZ,
  } = opts;

  const ids = interactableIds ?? (api?.hits ? Object.keys(api.hits) : []);
  const episode = {
    schemaVersion: EPISODE_SCHEMA_VERSION,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    app, station: station ?? room?.id ?? null,
    startedAt: new Date().toISOString(), startedSim: +session.elapsed.toFixed(2),
    crewTagHash: hashCrewTag(crewTag),
    stepCount: session.steps?.length ?? 0,
    embodied: !!(room && api),
    records: [], poses: [],
    endedAt: null, endedSim: null, summary: null, interruptLog: [],
    incomplete: true,
  };

  const currentView = () => { try { return typeof viewMode === "function" ? viewMode() : viewMode; } catch (_) { return null; } };
  const currentEnv = () => { try { return (env ? env() : {}) ?? {}; } catch (_) { return {}; } };

  function decisionObs() {
    let base;
    try { base = room && api ? observeEmbodied(session, api, { room }) : observe(session); }
    catch (_) { base = observe(session); }
    const e = currentEnv();
    return {
      ...base,
      interactables: ids,
      weather: e.weather ?? null, timeOfDay: e.timeOfDay ?? null, eventSeed: e.eventSeed ?? null,
      viewMode: currentView(),
    };
  }

  let flushTimer = null;
  function flushCurrent() { if (store) trySave(CURRENT_KEY, episode); }
  function scheduleFlush() {
    if (!store || flushTimer) return;
    const run = () => { flushTimer = null; flushCurrent(); };
    // Deferred off the render loop either way: requestIdleCallback when the
    // browser offers it (spare time between frames), a short timeout
    // otherwise (Node, or a browser without it) — never synchronous with the
    // call that triggered it.
    flushTimer = typeof globalThis.requestIdleCallback === "function"
      ? globalThis.requestIdleCallback(run, { timeout: 2000 })
      : setTimeout(run, 1500);
  }

  /** Wrap one action method: capture the observation before it runs, call
   * through unchanged, then log the action `toAction` derives from the call
   * and the feedback, in the same shape shared/robot.js's applyAction() takes
   * so a live episode and a synthetic rollout share one action space. */
  const wrap = (name, toAction) => {
    const orig = session[name];
    if (typeof orig !== "function") return;
    const bound = orig.bind(session);
    session[name] = (...args) => {
      const ctx = { stepBefore: session.step, gaugeBefore: session.gauge ? session.gauge.t : null };
      const scoreBefore = session.score;
      const obs = decisionObs();
      const fb = bound(...args);
      const action = toAction(args, fb, ctx);
      if (action) {
        episode.records.push({
          t: +session.elapsed.toFixed(2), wall: Date.now(),
          obs, action,
          reward: session.score - scoreBefore,
          outcome: fb ? { kind: fb.kind ?? null, hazard: !!fb.hazard, clean: fb.kind === "ok" } : null,
        });
        scheduleFlush();
      }
      return fb;
    };
  };
  // A gauge step's commit arrives through select() the same way a plain
  // target does (see game.js's select()) — the recorder tells them apart so
  // the logged action matches shared/robot.js's own commit/select split
  // exactly, `at` read from the gauge *before* the call commits it.
  wrap("select", ([id], _fb, ctx) => {
    if (ctx.stepBefore?.kind === "gauge" && (id === ctx.stepBefore.target || id === "gauge-commit") && ctx.gaugeBefore != null) {
      return { type: "commit", id: ctx.stepBefore.target, at: roundNum(ctx.gaugeBefore) };
    }
    return { type: "select", id };
  });
  wrap("rotate", ([id, delta]) => ({ type: "rotate", id, delta: roundNum(delta) }));
  wrap("dropAt", ([id, distance]) => ({ type: "drop", id, distance: distance == null ? null : roundNum(distance) }));
  wrap("setHolding", ([on]) => (on ? { type: "press" } : { type: "release" }));
  // driveInput() is continuous (called every rendered frame while driving);
  // its state is captured in the low-rate pose-track sample instead of as a
  // decision per frame — see tick() below. driveCheck() is the discrete
  // decision (a mirror, a signal, the horn) and is logged like any other.
  wrap("driveCheck", ([kind]) => (kind ? { type: "check", kind } : null));

  if (session.hooks) {
    const prevOnFinish = session.hooks.onFinish;
    session.hooks.onFinish = (s, summary) => {
      finish(summary);
      prevOnFinish?.(s, summary);
    };
  }

  function finish(summary) {
    if (episode.endedAt) return episode; // idempotent: onFinish fires once, but a caller may also call finish() itself
    episode.endedAt = new Date().toISOString();
    episode.endedSim = +session.elapsed.toFixed(2);
    episode.interruptLog = (session.interruptLog ?? []).slice();
    episode.incomplete = false;
    episode.summary = {
      score: summary?.score ?? session.score, stars: summary?.stars ?? session.stars,
      errors: session.errors | 0, hazardHits: session.hazardHits | 0,
      seconds: Math.round(session.elapsed),
      interrupts: session.interruptSummary?.() ?? null,
      passed: (session.stars | 0) >= 2 && (session.hazardHits | 0) === 0,
    };
    if (store) {
      // One deferred write for the whole finished episode — never inline with
      // the hook that reports the run just ended.
      const run = () => EpisodeStore.append(episode);
      if (typeof setTimeout === "function") setTimeout(run, 0); else run();
    }
    return episode;
  }

  let acc = 0;
  const interval = 1 / Math.max(0.5, poseHz);
  /** Call every render frame with the elapsed seconds and whatever pose
   * sources are live right now; actually samples at `poseHz`. `poseSource` is
   * `{ camera, controllers, hands }`, each an Object3D or an array of them —
   * any that are absent (desktop, no hands tracked) are simply left out of
   * the sample rather than recorded as a gap. */
  function tick(dt, poseSource) {
    if (!store || episode.endedAt) return;
    acc += dt || 0;
    if (acc < interval) return;
    acc = 0;
    const sample = { t: +session.elapsed.toFixed(2), wall: Date.now() };
    const cam = compactPose(poseSource?.camera);
    if (cam) sample.camera = cam;
    const controllers = (poseSource?.controllers ?? []).map(compactPose).filter(Boolean);
    if (controllers.length) sample.controllers = controllers;
    const hands = (poseSource?.hands ?? []).map(compactPose).filter(Boolean);
    if (hands.length) sample.hands = hands;
    if (session.drive) {
      sample.drive = {
        throttle: roundNum(session.drive.throttle), steer: roundNum(session.drive.steer),
        speed: roundNum(session.drive.speed), offset: roundNum(session.drive.offset),
      };
    }
    // The end-effector target for whatever step is live right now, when the
    // station is built and that step's target has a pose — the same field a
    // decision record carries, sampled between decisions too so the pose
    // track shows the approach and the retreat, not just the touch.
    if (room && api && session.step) {
      try {
        const emb = embodimentFor(room, api, {});
        const se = emb.steps[session.step.id];
        const primary = se?.targets?.[0]?.id;
        const pose = primary ? emb.poses[primary] : null;
        if (pose) sample.endEffector = pose;
      } catch (_) { /* embodiment is optional enrichment here, never fatal */ }
    }
    episode.poses.push(sample);
    scheduleFlush();
  }

  return { episode, tick, finish, digest: () => sessionDigest(episode), dedupeKey: () => dedupeKeyFor(episode) };
}

// ------------------------------------------------------------------ digest

/** Field order of sessionDigest()'s fixed-length vector — documented so a
 * consumer can index into it without importing this module. */
export const DIGEST_FEATURES = [
  "schemaVersion", "durationSim", "durationWallMs", "stepCount", "decisionCount",
  "score", "stars", "errors", "hazardHits", "interruptsAnswered", "interruptsMissed",
  "interruptsWrong", "meanRewardPerDecision", "cleanFraction", "keepOutViolations", "handoffs",
];
/** Events kept in a digest's short log: every hazard and every interruption
 * outcome, oldest first, capped so the digest stays cheap to upload. */
export const MAX_DIGEST_EVENTS = 40;

/**
 * Compress an episode into a fixed-length feature vector (see
 * DIGEST_FEATURES for what each position means) plus a short list of the
 * salient events in it (hazards and interruption outcomes, capped and time-
 * ordered) — small enough to upload from a kiosk on a slow link where the
 * full episode (with its pose track) is not, while still carrying what a
 * training director or a calibration job needs: how it went, and where.
 */
export function sessionDigest(episode) {
  const records = episode.records ?? [];
  const summary = episode.summary ?? {};
  const totalReward = records.reduce((n, r) => n + (r.reward ?? 0), 0);
  const cleanCount = records.filter((r) => !r.outcome || r.outcome.clean !== false).length;
  const it = summary.interrupts ?? { answered: 0, missed: 0, wrong: 0 };
  const durationWallMs = episode.endedAt && episode.startedAt
    ? Date.parse(episode.endedAt) - Date.parse(episode.startedAt) : 0;
  const vector = [
    episode.schemaVersion ?? EPISODE_SCHEMA_VERSION,
    +(episode.endedSim ?? episode.startedSim ?? 0),
    durationWallMs,
    episode.stepCount ?? 0,
    records.length,
    summary.score ?? 0, summary.stars ?? 0, summary.errors ?? 0, summary.hazardHits ?? 0,
    it.answered ?? 0, it.missed ?? 0, it.wrong ?? 0,
    records.length ? +(totalReward / records.length).toFixed(2) : 0,
    records.length ? +(cleanCount / records.length).toFixed(3) : 1,
    summary.keepOutViolations ?? 0, summary.handoffs ?? 0,
  ];
  const events = [];
  for (const r of records) if (r.outcome?.hazard) events.push({ t: r.t, kind: "hazard", id: r.action?.id ?? null });
  for (const l of episode.interruptLog ?? []) events.push({ t: l.seconds, kind: "interrupt", id: l.id, outcome: l.outcome });
  events.sort((a, b) => a.t - b.t);
  const capped = events.slice(0, MAX_DIGEST_EVENTS);
  return {
    schemaVersion: episode.schemaVersion ?? EPISODE_SCHEMA_VERSION,
    station: episode.station ?? null,
    dedupeKey: dedupeKeyFor(episode),
    features: DIGEST_FEATURES, vector,
    events: capped, eventsTruncated: events.length > capped.length,
  };
}

/**
 * The dedupe key: two episodes with the same key are the same episode, and a
 * consumer merging shards (a local export re-uploaded, a digest sent twice
 * off a flaky connection) keeps only one. Derived from fields that are each
 * stable once an episode has finished — the station, when it started, the
 * (hashed) crew tag, how many decisions it holds and its final score — not
 * from any single field alone, so two different short runs on the same
 * station in the same second do not collide. This is a content-derived key
 * for deduplication, not a cryptographic identifier: it uses the same
 * non-cryptographic hash as hashCrewTag(), doubled over the reversed input to
 * cut accidental collisions, which is all a dedupe key needs.
 */
export function dedupeKeyFor(episode) {
  const basis = [
    episode.station ?? "", episode.startedAt ?? "", episode.crewTagHash ?? "",
    (episode.records ?? []).length, episode.summary?.score ?? "",
  ].join("|");
  return `${fnv1a(basis)}${fnv1a(basis.split("").reverse().join(""))}`;
}
