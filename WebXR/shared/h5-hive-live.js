// HIVE-5 — the console tab, live (console `h5`, docs/consoles/HIVE-5.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// The instructor console's "Omega Hive" tab (HIVE-4) replays a seeded day. When the learner's own hive runs in the parishes page in
// the same browser on this device and the learner turns "Show on the console" on in the hive panel, the panel's hive reaches the tab
// through a BroadcastChannel: a channel between this browser's own pages of the same origin. Nothing is uploaded (no request is
// made), nothing is stored (neither page writes any storage), and the channel carries only what the panel already shows: the lines,
// the refusals with their reasons, the jobs held, the requests waiting for the learner and the day's counts. The link is off by
// default and never remembered (each visit starts off); turning it off, or leaving the page, tells the tab to drop what it holds.
// The hive panel itself is mounted only for signed-in adults outside K-12 and the demo, so the link is too.
// The tab only listens: it posts nothing, approves nothing and writes nothing. With no live snapshot it keeps the seeded replay.
// No network, no model call, no voice, no microphone.
//
// SEAMS (every top-level name carries h5/H5_: the bundler shares one scope):
//   H5_LIVE_CHANNEL, H5_LIVE_SCHEMA, H5_LIVE_TEXT (the toggle's words, en and es), H5_LIVE_STALE_MS
//   h5LiveSnapshot(hive, { maxLines, at })  -> { schema, at, t, lines, refusals, jobs, pending, metrics } from the hive's own data;
//                                             HIVE-7: a hive with moods on (HIVE-6) adds { moods, moodChanges, briefing }: each agent's
//                                             mood and its recorded cause (hive.mood(id)), the day's mood changes, the briefing captions
//   h5LivePublisher({ hive, Channel, everyMs, setTimer, clearTimer }) -> { enabled(), set(on), publish(), posts(), dispose() }
//   h5MountLiveToggle(panel, publisher)     -> the toggle button in the hive panel's row (the panel's 44 px rule on a phone)
//   h5LiveReader({ Channel, onSnapshot, staleMs, now }) -> { snapshot(), live(), count(), close() }   (receive only)

export const H5_LIVE_CHANNEL = "smartcitix-h5-hive-live-v1";
export const H5_LIVE_SCHEMA = "smartcitix.holodeck.h5-hive-live@1";
export const H5_LIVE_STALE_MS = 6000;
export const H5_LIVE_TEXT = Object.freeze({
  en: Object.freeze({ label: (on) => `Show on the console (this device): ${on ? "on" : "off"}`, title: "Shows this hive's lines on the instructor console open in this browser on this device. Nothing is uploaded or stored, and it is off again when you leave." }),
  es: Object.freeze({ label: (on) => `Mostrar en la consola (este dispositivo): ${on ? "sí" : "no"}`, title: "Muestra las líneas de esta colmena en la consola del instructor abierta en este navegador y dispositivo. No se sube ni se guarda nada, y se apaga al salir." }),
});

const h5LiveTry = (fn, d) => { try { const v = fn(); return v ?? d; } catch (_) { return d; } };

/** HIVE-7: a mood's recorded cause, the hive's own fields only (type, time, job, reason, by, held jobs, chain lines, mood). */
function h5LiveCause(c) {
  if (!c || typeof c !== "object") return null;
  const o = {};
  for (const k of ["type", "t", "jobId", "reason", "by", "lines", "mood"]) if (c[k] !== undefined && c[k] !== null) o[k] = c[k];
  if (Array.isArray(c.held)) o.held = c.held.slice(0, 8).map(String);
  return o;
}
/** HIVE-7: the moods part of a snapshot (only for a hive with moods on): each agent's mood and cause, the changes, the briefing. */
function h5LiveMoods(hive, ev) {
  if (!h5LiveTry(() => hive.moods, false)) return null;
  const roster = h5LiveTry(() => hive.agents, []) ?? [];
  const moods = roster.map((a) => { const md = h5LiveTry(() => hive.mood(a.id), null); return { agent: a.id, mood: md?.mood ?? "calm", cause: h5LiveCause(md?.cause) }; });
  const briefing = ev.filter((e) => e.type === "speak" && e.briefing).map((e) => ({ t: e.t, agent: e.agent, turn: e.briefing.turn, caption: String(e.caption ?? e.text ?? "") }));
  return { moods, moodChanges: ev.filter((e) => e.type === "mood").length, briefing };
}

/** What the tab may show: the panel's own lines, refusals, held jobs, waiting requests and counts (no learner identity). */
export function h5LiveSnapshot(hive, { maxLines = 140, at = Date.now() } = {}) {
  const ev = h5LiveTry(() => hive.events(), []);
  const m = h5LiveTry(() => hive.metrics(), {});
  const md = h5LiveMoods(hive, ev);
  return {
    ...(md ?? {}),
    schema: H5_LIVE_SCHEMA, at, t: h5LiveTry(() => hive.now(), 0),
    lines: ev.filter((e) => e.type === "speak").slice(-maxLines).map((e) => ({ t: e.t, agent: e.agent, caption: String(e.caption ?? e.text ?? ""), x: e.exchange ? e.exchange.turn : null, memory: !!e.memory })),
    refusals: ev.filter((e) => e.type === "refused").slice(-40).map((e) => ({ t: e.t, jobId: e.jobId ?? null, site: e.siteName ?? e.to ?? "", by: e.by ?? "", reason: e.veto ?? e.reason ?? "" })),
    jobs: h5LiveTry(() => hive.jobs(), []).filter((j) => j.winner && ["queued", "moving", "running", "awaiting-approval"].includes(j.status)).map((j) => ({ jobId: j.jobId, winner: j.winner, site: j.site, status: j.status })),
    pending: h5LiveTry(() => hive.pending(), []).map((p) => ({ jobId: p.jobId, site: p.siteName ?? p.to ?? "", reason: p.reason })),
    metrics: Object.fromEntries(["completed", "refused", "vetoed", "awaitingApproval", "exchanges", "memories", "dispatched", "dispatchedChecked", "physicalDispatched", "homeMoves"].filter((k) => Number.isFinite(m?.[k])).map((k) => [k, m[k]])),
  };
}

/** The parishes page's side: off until set(true); then one snapshot after each hive step (and every `everyMs` while on). */
export function h5LivePublisher({ hive = null, Channel = typeof BroadcastChannel === "function" ? BroadcastChannel : null, everyMs = 2000, setTimer = (fn, ms) => (typeof setInterval === "function" ? setInterval(fn, ms) : null), clearTimer = (h) => { if (h != null && typeof clearInterval === "function") clearInterval(h); } } = {}) {
  let ch = null, on = false, timer = null, posts = 0, unsub = null, queued = false;
  const publish = () => { if (!on || !ch || !hive) return false; try { ch.postMessage(h5LiveSnapshot(hive)); posts += 1; return true; } catch (_) { return false; } };
  const onEvent = () => { if (!on || queued) return; queued = true; Promise.resolve().then(() => { queued = false; publish(); }); }; // one snapshot per step
  function set(v) {
    const want = !!v && typeof Channel === "function" && !!hive;
    if (want === on) return on;
    if (want) {
      try { ch = new Channel(H5_LIVE_CHANNEL); } catch (_) { ch = null; return on; }
      on = true;
      const u = h5LiveTry(() => hive.on("*", onEvent), null); unsub = typeof u === "function" ? u : () => hive.off?.("*", onEvent);
      timer = setTimer(publish, everyMs); publish();
      return on;
    }
    on = false;
    try { unsub?.(); } catch (_) { /* gone */ } unsub = null;
    clearTimer(timer); timer = null;
    try { ch?.postMessage({ schema: H5_LIVE_SCHEMA, closed: true }); } catch (_) { /* closed */ } // the tab drops what it holds
    try { ch?.close(); } catch (_) { /* closed */ } ch = null;
    return on;
  }
  return { enabled: () => on, set, publish, posts: () => posts, dispose: () => set(false) };
}

/** The toggle in the hive panel's row: "Show on the console (this device): off" until the learner turns it on. */
export function h5MountLiveToggle(panel, publisher) {
  const row = panel?.el?.querySelector?.(".oh-row");
  if (!row || !publisher || typeof document === "undefined") return null;
  const T = H5_LIVE_TEXT[panel.lang] ?? H5_LIVE_TEXT.en;
  const b = document.createElement("button");
  b.type = "button"; b.dataset.oh = "console-link"; b.title = T.title;
  const show = () => { const v = publisher.enabled(); b.textContent = T.label(v); b.setAttribute("aria-pressed", String(v)); };
  b.onclick = () => { publisher.set(!publisher.enabled()); show(); };
  show(); row.appendChild(b);
  return b;
}

/** The console tab's side: listens only. A snapshot older than `staleMs` (the page went away) counts as none. */
export function h5LiveReader({ Channel = typeof BroadcastChannel === "function" ? BroadcastChannel : null, onSnapshot = null, staleMs = H5_LIVE_STALE_MS, now = () => Date.now() } = {}) {
  let ch = null, last = null, lastAt = 0, count = 0;
  try { ch = typeof Channel === "function" ? new Channel(H5_LIVE_CHANNEL) : null; } catch (_) { ch = null; }
  if (ch) ch.onmessage = (msg) => {
    const d = msg?.data;
    if (!d || d.schema !== H5_LIVE_SCHEMA) return;
    if (d.closed) { last = null; lastAt = 0; } else if (Array.isArray(d.lines) && Array.isArray(d.refusals)) { last = d; lastAt = now(); count += 1; } else return;
    try { onSnapshot?.(last); } catch (_) { /* a renderer never stops the reader */ }
  };
  const fresh = () => !!(last && now() - lastAt <= staleMs);
  return { snapshot: () => (fresh() ? last : null), live: fresh, count: () => count, close() { try { ch?.close(); } catch (_) { /* closed */ } ch = null; last = null; } };
}
