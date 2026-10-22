/**
 * Instructor mode: a live view of a learner's session for the person running
 * the class, and the commands that person can send back into it.
 *
 * Every VR training sale asks for this, and it is the largest single feature
 * in the roadmap's pilot phase. The default carries no server: the learner's
 * app broadcasts its session on a BroadcastChannel, and an instructor console
 * open on the same machine — another tab, another window, a second monitor at
 * the front of the room — receives it and can send commands back. That covers
 * the common case of a hall with a row of laptops or headsets mirrored to one
 * screen.
 *
 * A BroadcastChannel is same-origin and same-device by definition, so for the
 * other case — an instructor on their own machine — both sides accept
 * `?relay=<ws url>` and put the *same* JSON envelope on a WebSocket as well.
 * The relay is a dumb fan-out: it hands every frame to every other client and
 * understands nothing about it (tools/relay_server.mjs, docs/instructor-console.md).
 * When the app is embedded in an LMS the same events also go to the host page
 * through Identity.emit, which is the third honest path.
 *
 * Nothing is stored here. The channel carries what is happening right now, and
 * closing the console loses it; the record of the attempt is the training
 * record, which is a different, durable thing — and every command the console
 * sends is appended to that record as an instructorAction, so a run driven by
 * an instructor is never mistaken for one the learner drove alone.
 *
 * Protocol 2 added the content-and-interaction commands (open, interrupt,
 * weather, profile, hazard mode, assign) and the `action` event that reports
 * what the app did with one. Both sides still accept protocol 1, so a console
 * or an app from before the bump interoperates with note, freeze and roll.
 *
 * Protocol 3 added `flow`: the one command that carries a payload rather than
 * a short string, because a flow is a node graph (shared/flowhub.js) and there
 * is no useful way to name one in 120 characters. It travels as a parsed
 * object on the `flow` field, size-capped like every other field here, and the
 * app validates it against the catalog before it will run it — the console is
 * not trusted to have handed over a flow that makes sense.
 */

const CHANNEL = "smartcitix:instructor";
export const OBSERVER_PROTOCOL = 3;
export const ACCEPTED_PROTOCOLS = [1, 2, 3];

// Learner → instructor.
export const EV_HELLO = "hello";       // a session opened (or answered a roll call)
export const EV_STATE = "state";       // throttled snapshot: station, step, score
export const EV_STEP = "step";         // a step completed
export const EV_HAZARD = "hazard";     // an unsafe action, with its consequence
export const EV_ACTION = "action";     // the app answered an instructor command
export const EV_FINISH = "finish";     // the run ended, with the verdict
export const EV_BYE = "bye";           // the session left a station or closed
// Instructor → learner.
export const CMD_ROLL = "roll";               // who is out there?
export const CMD_NOTE = "note";               // a line to put in front of the learner
export const CMD_FREEZE = "freeze";           // pause / resume the session
export const CMD_OPEN = "open";               // send this learner to a station or programme
export const CMD_INTERRUPT = "interrupt";     // fire one declared interruption now
export const CMD_WEATHER = "weather";         // the weather the next station runs under
export const CMD_PROFILE = "profile";         // the device profile the next station runs under
export const CMD_HAZARD_MODE = "hazard-mode"; // "coach" warns once; "assess" scores it
export const CMD_ASSIGN = "assign";           // pin a programme in the learner's panel
export const CMD_FLOW = "flow";               // hand over a flow and start it (shared/flowhub.js)
export const LEARNER_EVENTS = [EV_HELLO, EV_STATE, EV_STEP, EV_HAZARD, EV_ACTION, EV_FINISH, EV_BYE];
export const INSTRUCTOR_COMMANDS = [CMD_ROLL, CMD_NOTE, CMD_FREEZE, CMD_OPEN, CMD_INTERRUPT, CMD_WEATHER, CMD_PROFILE, CMD_HAZARD_MODE, CMD_ASSIGN, CMD_FLOW];

/** What each command means, for the console's own labels and the docs. */
export const COMMAND_LABELS = {
  [CMD_ROLL]: "Roll call",
  [CMD_NOTE]: "Note",
  [CMD_FREEZE]: "Hold / release",
  [CMD_OPEN]: "Open station or programme",
  [CMD_INTERRUPT]: "Fire interruption",
  [CMD_WEATHER]: "Weather for next station",
  [CMD_PROFILE]: "Device profile for next station",
  [CMD_HAZARD_MODE]: "Hazard mode",
  [CMD_ASSIGN]: "Assign programme",
  [CMD_FLOW]: "Load flow",
};

const MAX_TEXT = 400;
const MAX_DETAIL = 120;
/** A flow is a graph, not a label. Capped so a relay frame stays sane. */
const MAX_FLOW_JSON = 64000;
const clip = (v, n = MAX_TEXT) => (typeof v === "string" ? v.slice(0, n) : v);

/**
 * The one structured payload this protocol carries. Re-serialised and size
 * checked here so a malformed or enormous flow never reaches an app's handler;
 * whether it is a *valid* flow is flowhub's question, asked by the app.
 */
function clipFlow(flow) {
  if (!flow || typeof flow !== "object" || Array.isArray(flow)) return null;
  let json;
  try { json = JSON.stringify(flow); } catch (_) { return null; }
  if (!json || json.length > MAX_FLOW_JSON) return null;
  try { return JSON.parse(json); } catch (_) { return null; }
}
const knownProtocol = (m) => !!m && ACCEPTED_PROTOCOLS.includes(m.protocol);

/**
 * With both legs open — a BroadcastChannel and a relay — the same message
 * arrives twice, and a note shown twice or an interruption armed twice is a
 * bug the room would see. Every message carries its own id and each side drops
 * one it has already handled. A protocol-1 message has no id and is never
 * dropped: an old console's note is rare and shown once anyway.
 */
function makeSeen(limit = 240) {
  const seen = new Set();
  return (mid) => {
    if (!mid) return false;
    if (seen.has(mid)) return true;
    seen.add(mid);
    if (seen.size > limit) for (const old of seen) { seen.delete(old); if (seen.size <= limit) break; }
    return false;
  };
}

function messageId() {
  return `m-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** A stable id for this tab, so one console can tell two learners apart. */
function tabId() {
  return `s-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function openChannel() {
  if (typeof BroadcastChannel !== "function") return null;
  try { return new BroadcastChannel(CHANNEL); } catch (_) { return null; }
}

/** `?relay=wss://host/path` on either page, when one is given. */
export function relayFromSearch(search = typeof location !== "undefined" ? location.search : "") {
  try {
    const raw = new URLSearchParams(search).get("relay");
    if (!raw) return null;
    return /^wss?:\/\//.test(raw) ? raw : null;
  } catch (_) { return null; }
}

/**
 * The optional WebSocket leg. Same envelope as the BroadcastChannel, one JSON
 * object per frame; the server fans a frame out to every other client and
 * never to the sender. Failure is silent by design — the relay is an extra
 * leg, and a session must not break because a room's relay is down. Frames
 * sent before the socket opens are queued, because a station is often entered
 * within a second of the page loading.
 */
function openRelay(url, onMessage) {
  if (!url || typeof WebSocket !== "function") return null;
  let sock = null;
  try { sock = new WebSocket(url); } catch (_) { return null; }
  let queue = [];
  let closed = false;
  sock.onopen = () => { const pending = queue; queue = []; for (const frame of pending) { try { sock.send(frame); } catch (_) { /* ignore */ } } };
  sock.onmessage = (e) => {
    let msg = null;
    try { msg = JSON.parse(typeof e.data === "string" ? e.data : ""); } catch (_) { return; }
    if (msg && typeof msg === "object") onMessage(msg);
  };
  sock.onerror = () => { /* the BroadcastChannel leg carries on */ };
  return {
    get url() { return url; },
    get open() { return sock.readyState === 1; },
    send(msg) {
      if (closed) return false;
      let frame;
      try { frame = JSON.stringify(msg); } catch (_) { return false; }
      if (sock.readyState === 1) { try { sock.send(frame); return true; } catch (_) { return false; } }
      if (sock.readyState === 0 && queue.length < 400) { queue.push(frame); return true; }
      return false;
    },
    close() { closed = true; queue = []; try { sock.close(); } catch (_) { /* ignore */ } },
  };
}

/**
 * The learner side. `app` is "smartcity" | "trades" | "holodeck".
 * Returns a handle even when neither leg is available, so callers never have
 * to branch: every method is then a no-op.
 */
export function createBroadcaster(app, { learner = "", station = "", stationName = "", relay = relayFromSearch() } = {}) {
  const ch = openChannel();
  const id = tabId();
  let last = 0, onCommand = null, closed = false, describe = null;
  let ctx = { app, learner, station, stationName: stationName || station };
  const handled = makeSeen();

  const handle = (m) => {
    if (!knownProtocol(m) || handled(m.mid)) return;
    if (m.kind === CMD_ROLL) { post(EV_HELLO, describe?.() ?? {}); return; }
    if (!INSTRUCTOR_COMMANDS.includes(m.kind)) return;
    // A command addressed to one session is ignored by the others.
    if (m.to && m.to !== id) return;
    onCommand?.({ kind: m.kind, text: clip(m.text), on: !!m.on, detail: clip(m.detail, MAX_DETAIL), flow: clipFlow(m.flow) });
  };

  const link = openRelay(relay, handle);

  const post = (kind, data = {}) => {
    if (closed) return false;
    const msg = { protocol: OBSERVER_PROTOCOL, mid: messageId(), kind, id, at: Date.now(), ...ctx, ...data };
    let sent = false;
    if (ch) { try { ch.postMessage(msg); sent = true; } catch (_) { /* ignore */ } }
    if (link?.send(msg)) sent = true;
    return sent;
  };

  if (ch) ch.onmessage = (e) => handle(e?.data);

  return {
    id,
    get available() { return !!ch || !!link; },
    get relay() { return link?.url ?? null; },
    /** Extra fields every hello carries — the station's steps and declared
     *  interruptions, which only the app knows. Called on each roll call too,
     *  so a console opened mid-run gets the panel it needs. */
    describes(fn) { describe = typeof fn === "function" ? fn : null; },
    /** Update who and where, and announce it. */
    hello(next = {}) { ctx = { ...ctx, ...next }; return post(EV_HELLO, describe?.() ?? {}); },
    /** Throttled: the console does not need more than a few frames a second. */
    state(snapshot, { minMs = 500 } = {}) {
      const now = Date.now();
      if (now - last < minMs) return false;
      last = now;
      return post(EV_STATE, snapshot);
    },
    step(data) { return post(EV_STEP, data); },
    hazard(data) { return post(EV_HAZARD, { ...data, note: clip(data?.note) }); },
    /** What the app did with a command: the console's proof it landed. */
    action(data) { return post(EV_ACTION, { ...data, cmd: clip(data?.cmd, MAX_DETAIL), detail: clip(data?.detail, MAX_DETAIL), note: clip(data?.note) }); },
    finish(data) { return post(EV_FINISH, data); },
    bye() { const ok = post(EV_BYE); return ok; },
    onCommand(fn) { onCommand = typeof fn === "function" ? fn : null; },
    close() { if (closed) return; post(EV_BYE); closed = true; try { ch?.close(); } catch (_) {} link?.close(); },
  };
}

/**
 * The instructor side. `onEvent` receives every learner event; call
 * `roll()` once on open so sessions that started earlier announce themselves.
 * `onSend` (optional) sees every command as it goes out, which is how the
 * console's session log records both directions from one place.
 */
export function createConsole(onEvent, { relay = relayFromSearch(), onSend = null } = {}) {
  const ch = openChannel();
  const handled = makeSeen();
  const handle = (m) => {
    if (!knownProtocol(m) || handled(m.mid) || !LEARNER_EVENTS.includes(m.kind)) return;
    onEvent?.(m);
  };
  const link = openRelay(relay, handle);
  if (ch) ch.onmessage = (e) => handle(e?.data);
  const send = (kind, extra = {}) => {
    const msg = { protocol: OBSERVER_PROTOCOL, mid: messageId(), kind, at: Date.now(), ...extra };
    let sent = false;
    if (ch) { try { ch.postMessage(msg); sent = true; } catch (_) { /* ignore */ } }
    if (link?.send(msg)) sent = true;
    if (sent) onSend?.(msg);
    return sent;
  };
  return {
    get available() { return !!ch || !!link; },
    get relay() { return link?.url ?? null; },
    roll() { return send(CMD_ROLL); },
    note(to, text) { return send(CMD_NOTE, { to, text: clip(text) }); },
    freeze(to, on) { return send(CMD_FREEZE, { to, on: !!on }); },
    /** A station id, or a programme id — the app resolves which. */
    open(to, detail) { return send(CMD_OPEN, { to, detail: clip(detail, MAX_DETAIL) }); },
    /** One of the current station's declared interruption ids. */
    interrupt(to, detail) { return send(CMD_INTERRUPT, { to, detail: clip(detail, MAX_DETAIL) }); },
    weather(to, detail) { return send(CMD_WEATHER, { to, detail: clip(detail, MAX_DETAIL) }); },
    profile(to, detail) { return send(CMD_PROFILE, { to, detail: clip(detail, MAX_DETAIL) }); },
    hazardMode(to, detail) { return send(CMD_HAZARD_MODE, { to, detail: clip(detail, MAX_DETAIL) }); },
    assign(to, detail) { return send(CMD_ASSIGN, { to, detail: clip(detail, MAX_DETAIL) }); },
    /**
     * Hand a flow to a learner's app and ask it to start. `detail` is the
     * flow's id, for the console's own log and the app's refusal message; the
     * graph itself rides on `flow`. The app validates it against the catalog
     * and answers with an `action` event either way.
     */
    flow(to, flow, detail = null) {
      const payload = clipFlow(flow);
      if (!payload) return false;
      return send(CMD_FLOW, { to, flow: payload, detail: clip(detail ?? payload.id ?? "", MAX_DETAIL) });
    },
    close() { try { ch?.close(); } catch (_) {} link?.close(); },
  };
}

/** Fold a stream of learner events into a roster the console can render. */
export function reduceRoster(roster, ev, { staleMs = 45000 } = {}) {
  const next = new Map(roster);
  const prev = next.get(ev.id) ?? { id: ev.id, events: [], hazards: 0, steps: 0, actions: 0, fired: [], steplist: [], interrupts: [] };
  const row = {
    ...prev,
    id: ev.id, app: ev.app ?? prev.app, learner: ev.learner || prev.learner || "Unnamed",
    station: ev.station ?? prev.station, stationName: ev.stationName ?? prev.stationName ?? prev.station,
    at: ev.at,
  };
  if (ev.kind === EV_HELLO) {
    // A hello is where the station itself arrives: the steps in order and the
    // interruptions it declares, which is what the per-learner panel drives
    // its buttons from. Only the app knows them, and only for the station it
    // actually loaded.
    Object.assign(row, {
      live: true, finished: false,
      steplist: Array.isArray(ev.steps) ? ev.steps : prev.steplist ?? [],
      interrupts: Array.isArray(ev.interrupts) ? ev.interrupts : prev.interrupts ?? [],
      fired: Array.isArray(ev.fired) ? ev.fired : prev.fired ?? [],
      hazardMode: ev.hazardMode ?? prev.hazardMode ?? "assess",
      weather: ev.weather ?? prev.weather, profile: ev.profile ?? prev.profile,
      assigned: ev.assigned ?? prev.assigned ?? null,
      // The flow the session is on, if any: id, node and why it is there.
      flow: ev.flow ?? prev.flow ?? null,
      flowNode: ev.flowNode ?? prev.flowNode ?? null,
      stepIndex: ev.stepIndex ?? prev.stepIndex, stepCount: ev.stepCount ?? prev.stepCount,
    });
  }
  if (ev.kind === EV_STATE) {
    Object.assign(row, {
      stepIndex: ev.stepIndex, stepCount: ev.stepCount, stepTitle: ev.stepTitle,
      score: ev.score, stars: ev.stars, errors: ev.errors, hazardHits: ev.hazardHits, seconds: ev.seconds,
      answered: ev.answered ?? prev.answered ?? 0, interruptTotal: ev.interruptTotal ?? prev.interruptTotal ?? 0,
      fired: Array.isArray(ev.fired) ? ev.fired : prev.fired ?? [],
      hazardMode: ev.hazardMode ?? prev.hazardMode ?? "assess",
      live: true, finished: false,
    });
  }
  if (ev.kind === EV_STEP) { row.steps = (prev.steps ?? 0) + 1; row.live = true; }
  if (ev.kind === EV_HAZARD) {
    row.hazards = (prev.hazards ?? 0) + 1;
    row.events = [...(prev.events ?? []), { at: ev.at, kind: "hazard", text: ev.note ?? ev.hazardId ?? "unsafe action" }].slice(-12);
    row.live = true;
  }
  if (ev.kind === EV_ACTION) {
    // The app's own answer to a command: what it did, and — for an
    // interruption — that it is now fired, so the console disables the button
    // rather than letting a class fire the same alarm twice.
    row.actions = (prev.actions ?? 0) + 1;
    row.live = true;
    if (ev.cmd === CMD_INTERRUPT && ev.ok && ev.detail) row.fired = [...new Set([...(prev.fired ?? []), ev.detail])];
    if (ev.cmd === CMD_HAZARD_MODE && ev.ok) row.hazardMode = ev.detail ?? row.hazardMode;
    if (ev.cmd === CMD_WEATHER && ev.ok) row.weather = ev.detail ?? row.weather;
    if (ev.cmd === CMD_PROFILE && ev.ok) row.profile = ev.detail ?? row.profile;
    if (ev.cmd === CMD_ASSIGN && ev.ok) row.assigned = ev.detail ?? row.assigned;
    if (ev.cmd === CMD_FLOW && ev.ok) row.flow = ev.detail ?? row.flow;
    row.events = [...(prev.events ?? []), {
      at: ev.at, kind: ev.ok ? "action" : "refused",
      text: `${ev.cmd}${ev.detail ? ` ${ev.detail}` : ""} — ${ev.note ?? (ev.ok ? "done" : "refused")}`,
    }].slice(-12);
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
