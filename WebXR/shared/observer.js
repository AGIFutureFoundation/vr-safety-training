/**
 * Instructor mode: a live view of a learner's session for the person running
 * the class.
 *
 * Every VR training sale asks for this, and it is the largest single feature
 * in the roadmap's pilot phase. This is the part that needs no server: the
 * learner's app broadcasts its session on a BroadcastChannel, and an
 * instructor console open on the same machine — another tab, another window,
 * a second monitor at the front of the room — receives it and can send notes
 * back. That covers the common case of a hall with a row of laptops or
 * headsets mirrored to one screen.
 *
 * What it does not do is cross the network. A BroadcastChannel is same-origin
 * and same-device by definition. An instructor watching from another machine
 * needs the relay, which is a roadmap item and is not pretended at here; when
 * the app is embedded in an LMS the same events already go to the host page
 * through Identity.emit, which is the other honest path.
 *
 * Nothing is stored. The channel carries what is happening right now, and
 * closing the console loses it; the record of the attempt is the training
 * record, which is a different, durable thing.
 */

const CHANNEL = "smartcitix:instructor";
export const OBSERVER_PROTOCOL = 1;

// Learner → instructor.
export const EV_HELLO = "hello";       // a session opened (or answered a roll call)
export const EV_STATE = "state";       // throttled snapshot: station, step, score
export const EV_STEP = "step";         // a step completed
export const EV_HAZARD = "hazard";     // an unsafe action, with its consequence
export const EV_FINISH = "finish";     // the run ended, with the verdict
export const EV_BYE = "bye";           // the session left a station or closed
// Instructor → learner.
export const CMD_ROLL = "roll";        // who is out there?
export const CMD_NOTE = "note";        // a line to put in front of the learner
export const CMD_FREEZE = "freeze";    // pause / resume the session
export const LEARNER_EVENTS = [EV_HELLO, EV_STATE, EV_STEP, EV_HAZARD, EV_FINISH, EV_BYE];
export const INSTRUCTOR_COMMANDS = [CMD_ROLL, CMD_NOTE, CMD_FREEZE];

const MAX_TEXT = 400;
const clip = (v, n = MAX_TEXT) => (typeof v === "string" ? v.slice(0, n) : v);

/** A stable id for this tab, so one console can tell two learners apart. */
function tabId() {
  return `s-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function openChannel() {
  if (typeof BroadcastChannel !== "function") return null;
  try { return new BroadcastChannel(CHANNEL); } catch (_) { return null; }
}

/**
 * The learner side. `app` is "smartcity" | "trades" | "holodeck".
 * Returns a handle even when BroadcastChannel is missing, so callers never
 * have to branch: every method is then a no-op.
 */
export function createBroadcaster(app, { learner = "", station = "", stationName = "" } = {}) {
  const ch = openChannel();
  const id = tabId();
  let last = 0, onCommand = null, closed = false;
  let ctx = { app, learner, station, stationName: stationName || station };

  const post = (kind, data = {}) => {
    if (!ch || closed) return false;
    try { ch.postMessage({ protocol: OBSERVER_PROTOCOL, kind, id, at: Date.now(), ...ctx, ...data }); return true; }
    catch (_) { return false; }
  };

  if (ch) {
    ch.onmessage = (e) => {
      const m = e?.data;
      if (!m || m.protocol !== OBSERVER_PROTOCOL) return;
      if (m.kind === CMD_ROLL) { post(EV_HELLO); return; }
      if (!INSTRUCTOR_COMMANDS.includes(m.kind)) return;
      // A command addressed to one session is ignored by the others.
      if (m.to && m.to !== id) return;
      onCommand?.({ kind: m.kind, text: clip(m.text), on: !!m.on });
    };
  }

  return {
    id,
    get available() { return !!ch; },
    /** Update who and where, and announce it. */
    hello(next = {}) { ctx = { ...ctx, ...next }; return post(EV_HELLO); },
    /** Throttled: the console does not need more than a few frames a second. */
    state(snapshot, { minMs = 500 } = {}) {
      const now = Date.now();
      if (now - last < minMs) return false;
      last = now;
      return post(EV_STATE, snapshot);
    },
    step(data) { return post(EV_STEP, data); },
    hazard(data) { return post(EV_HAZARD, { ...data, note: clip(data?.note) }); },
    finish(data) { return post(EV_FINISH, data); },
    bye() { const ok = post(EV_BYE); return ok; },
    onCommand(fn) { onCommand = typeof fn === "function" ? fn : null; },
    close() { if (closed) return; post(EV_BYE); closed = true; try { ch?.close(); } catch (_) {} },
  };
}

/**
 * The instructor side. `onEvent` receives every learner event; call
 * `roll()` once on open so sessions that started earlier announce themselves.
 */
export function createConsole(onEvent) {
  const ch = openChannel();
  if (ch) {
    ch.onmessage = (e) => {
      const m = e?.data;
      if (!m || m.protocol !== OBSERVER_PROTOCOL || !LEARNER_EVENTS.includes(m.kind)) return;
      onEvent?.(m);
    };
  }
  const send = (kind, extra = {}) => {
    if (!ch) return false;
    try { ch.postMessage({ protocol: OBSERVER_PROTOCOL, kind, at: Date.now(), ...extra }); return true; }
    catch (_) { return false; }
  };
  return {
    get available() { return !!ch; },
    roll() { return send(CMD_ROLL); },
    note(to, text) { return send(CMD_NOTE, { to, text: clip(text) }); },
    freeze(to, on) { return send(CMD_FREEZE, { to, on: !!on }); },
    close() { try { ch?.close(); } catch (_) {} },
  };
}

/** Fold a stream of learner events into a roster the console can render. */
export function reduceRoster(roster, ev, { staleMs = 45000 } = {}) {
  const next = new Map(roster);
  const prev = next.get(ev.id) ?? { id: ev.id, events: [], hazards: 0, steps: 0 };
  const row = {
    ...prev,
    id: ev.id, app: ev.app ?? prev.app, learner: ev.learner || prev.learner || "Unnamed",
    station: ev.station ?? prev.station, stationName: ev.stationName ?? prev.stationName ?? prev.station,
    at: ev.at,
  };
  if (ev.kind === EV_STATE) {
    Object.assign(row, {
      stepIndex: ev.stepIndex, stepCount: ev.stepCount, stepTitle: ev.stepTitle,
      score: ev.score, stars: ev.stars, errors: ev.errors, hazardHits: ev.hazardHits, seconds: ev.seconds,
      live: true, finished: false,
    });
  }
  if (ev.kind === EV_STEP) { row.steps = (prev.steps ?? 0) + 1; row.live = true; }
  if (ev.kind === EV_HAZARD) {
    row.hazards = (prev.hazards ?? 0) + 1;
    row.events = [...(prev.events ?? []), { at: ev.at, kind: "hazard", text: ev.note ?? ev.hazardId ?? "unsafe action" }].slice(-12);
    row.live = true;
  }
  if (ev.kind === EV_FINISH) {
    Object.assign(row, { finished: true, live: true, passed: !!ev.passed, stars: ev.stars, score: ev.score, seconds: ev.seconds });
    row.events = [...(prev.events ?? []), { at: ev.at, kind: ev.passed ? "pass" : "fail", text: ev.verdict ?? (ev.passed ? "passed" : "not passed") }].slice(-12);
  }
  if (ev.kind === EV_BYE) row.live = false;
  next.set(ev.id, row);
  // Drop rows nothing has been heard from for a while.
  const cutoff = Date.now() - staleMs;
  for (const [k, v] of next) if (!v.live && v.at < cutoff) next.delete(k);
  return next;
}
