// OMEGA-HIVE — the agents' voices, on the device only (docs/omega-hive.md, docs/consoles/OMEGA-HIVE.md).
//
// Rules, as code:
//   * only a speechSynthesis voice whose `localService` is true is ever used; a network voice is never chosen, even
//     when it is the only voice for the language (then the agent is silent and its caption still shows);
//   * voice is OFF until the person turns it on (`enabled` defaults to false and is not remembered between loads);
//   * captions do not depend on voice: the panel draws every line from the hive's speak events, and `say()` calls
//     `onCaption` whether or not voice is on;
//   * agents never talk over each other: lines queue, and the next starts only when the last one ends;
//   * leaving the page (visibilitychange to hidden, or pagehide) stops speech and empties the queue;
//   * nothing listens: no microphone, no recognition, no recording. This module only ever speaks.
// shared/voice-assist.js (the apps' narration helper) is unchanged; its callers are untouched.
//
// SEAM:
//   ohPickVoice(agent, voices) -> a local voice for agent.voice.lang, preferring agent.voice.prefer names, or null
//   ohVoiceController({ synth, Utterance, doc, win, enabled, onCaption, pick, now }) -> { enabled(), setEnabled(on), say(agent, text, { onstart, onboundary, onend }),
//                                                                             stop(), queued(), speaking(), chosen(agentId), spoken(), link(other), kick(), pending(agentId, text?) }
//     `pick(agent, voices)` chooses the voice (default ohPickVoice); whatever it returns is used only if its `localService` is true.
//     AVATARS-HD-2: `onboundary(e)` hears the utterance's boundary events (e.name "word" or "sentence", e.charIndex) for the line being
//     spoken only: a late event from a line that was cancelled or has ended is dropped. `pending(agentId, text?)` is true while an
//     on-device voice holds a line of that agent (with that text, when given) — waiting in the queue or being spoken — so a figure can
//     hold its talk light until onstart. A line handed to the voice that has not started within OH_START_WAIT_MS (a stuck voice)
//     makes `pending` false for every line, so the figures fall back to their own clock. `now()` is the clock in ms.
//     `link(other)` makes two controllers share one line of speech: neither starts a spoken line while the other is speaking
//     (VOICES: GRIOT's characters and the Omega Hive's agents never talk over each other on one page).
//   ohSpeakAs(agent, text, { onstart, onend }) -> the page's default controller's say()
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

/** AVATARS-HD-2: how long a line handed to the voice may wait for its onstart before `pending` gives up on the voice (ms). */
export const OH_START_WAIT_MS = 1500;

/** Local voices only. */
export function ohLocalVoices(voices = []) { return (Array.isArray(voices) ? voices : []).filter((v) => v && v.localService === true); }

/**
 * The voice for an agent: local voices in its language (exact tag first, then the same primary language), the first
 * whose name contains one of `prefer` (in order), else one picked by the agent's id so agents differ where they can.
 */
export function ohPickVoice(agent, voices = []) {
  const local = ohLocalVoices(voices);
  if (!local.length) return null;
  const lang = String(agent?.voice?.lang ?? "en-US").toLowerCase();
  const primary = lang.split("-")[0];
  const exact = local.filter((v) => String(v.lang ?? "").toLowerCase().replace("_", "-") === lang);
  const same = exact.length ? exact : local.filter((v) => String(v.lang ?? "").toLowerCase().startsWith(primary));
  if (!same.length) return null;
  for (const want of agent?.voice?.prefer ?? []) {
    const hit = same.find((v) => String(v.name ?? "").toLowerCase().includes(String(want).toLowerCase()));
    if (hit) return hit;
  }
  let h = 2166136261; for (const ch of String(agent?.id ?? "")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return same[h % same.length];
}

export function ohVoiceController({ synth = globalThis.speechSynthesis ?? null, Utterance = globalThis.SpeechSynthesisUtterance ?? null, doc = globalThis.document ?? null, win = globalThis.window ?? null, enabled = false, onCaption = null, pick = ohPickVoice, now = () => (globalThis.performance?.now?.() ?? Date.now()) } = {}) {
  let on = !!enabled;
  let busy = false;
  const queue = [];
  const picks = new Map();
  const spoken = [];
  const peers = new Set();
  let current = null; // the item being spoken, so stop() can tell its owner it ended (a talk light must not stay lit)
  const done = (item) => { try { item.opts.onend?.(); } catch (_) { /* a callback never stops the queue */ } };
  const kickPeers = () => { for (const p of peers) { try { p.kick?.(); } catch (_) { /* a peer never stops this queue */ } } };
  // Defence in depth: whatever `pick` returns, a voice that is not on-device is never used.
  const choose = (agent) => {
    let v = null;
    try { v = pick(agent, (() => { try { return synth.getVoices() ?? []; } catch (_) { return []; } })()) ?? null; } catch (_) { v = null; }
    return v && v.localService === true ? v : null;
  };

  function pump() {
    if (busy || !queue.length) return;
    const item = queue[0];
    const voice = on && synth && Utterance ? choose(item.agent) : null;
    if (voice) { for (const p of peers) if (p.speaking?.()) return; } // a linked controller is speaking: wait until it kicks us
    queue.shift();
    picks.set(item.agent?.id, voice ? { name: voice.name, lang: voice.lang, localService: voice.localService } : null);
    if (!voice) { try { item.opts.onstart?.(); } catch (_) { /* ignore */ } done(item); pump(); return; }
    const u = new Utterance(item.text);
    u.voice = voice; u.lang = voice.lang || item.agent.voice.lang; u.rate = item.agent.voice.rate ?? 1; u.pitch = item.agent.voice.pitch ?? 1;
    busy = true; current = item; item.handed = now(); item.started = false;
    u.onstart = () => { if (current === item) { item.started = true; try { item.opts.onstart?.(); } catch (_) { /* ignore */ } } };
    // AVATARS-HD-2: the word boundaries of the line being spoken, and only that line (a figure's mouth opens on each word)
    u.onboundary = (e) => { if (current === item) { try { item.opts.onboundary?.(e); } catch (_) { /* a callback never stops the voice */ } } };
    // Linked controllers take turns at line boundaries: a peer with a line waiting goes next, then this one's next line.
    const finish = () => { if (!busy || current !== item) return; busy = false; current = null; done(item); kickPeers(); pump(); };
    u.onend = finish; u.onerror = finish;
    spoken.push({ agent: item.agent.id, voice: voice.name, localService: voice.localService, text: item.text });
    try { synth.speak(u); } catch (_) { finish(); }
  }

  function stop() {
    const left = queue.splice(0, queue.length);
    const inFlight = busy, cur = current;
    busy = false; current = null;
    // Cancel only when this controller has a line in flight: an idle controller never cuts off a peer's line (or the Guide's).
    if (inFlight) { try { synth?.cancel?.(); } catch (_) { /* nothing was speaking */ } }
    if (cur) done(cur); // its owner hears that the line ended
    for (const item of left) done(item);
    if (inFlight) kickPeers();
  }

  const onHide = () => { if (!doc || doc.visibilityState === "hidden") stop(); };
  try { doc?.addEventListener?.("visibilitychange", onHide); } catch (_) { /* headless */ }
  try { win?.addEventListener?.("pagehide", () => stop()); } catch (_) { /* headless */ }

  const api = {
    enabled: () => on,
    setEnabled(v) { on = !!v; if (!on) stop(); return on; },
    say(agent, text, opts = {}) {
      if (!agent || !text) return false;
      try { onCaption?.(agent, text); } catch (_) { /* captions never stop speech */ }
      queue.push({ agent, text: String(text), opts });
      pump();
      return on;
    },
    stop,
    queued: () => queue.length,
    speaking: () => busy,
    chosen: (id) => picks.get(id) ?? null,
    spoken: () => spoken.slice(),
    kick: () => pump(),
    /** AVATARS-HD-2: does an on-device voice hold a line of this agent (with this text, when given), queued or being spoken? */
    pending(agentId, text = null) {
      if (!on || !synth || !Utterance) return false;
      if (current && !current.started && now() - (current.handed ?? 0) > OH_START_WAIT_MS) return false; // a stuck voice: let the clock drive
      const same = (it) => it.agent?.id === agentId && (text == null || it.text.trim() === String(text).trim());
      if (current && same(current)) return true;
      return queue.some((it) => same(it) && !!choose(it.agent)); // a line with no local voice for its agent is never spoken
    },
    link(other) { if (!other || other === api) return false; if (peers.has(other)) return true; peers.add(other); try { other.link?.(api); } catch (_) { /* the other side links itself */ } return true; },
    linked: () => peers.size,
  };
  return api;
}

let ohDefaultVoice = null;
/** Speak as an agent through the page's default controller (off until someone calls setEnabled(true) on it). */
export function ohSpeakAs(agent, text, opts = {}) {
  if (!ohDefaultVoice) ohDefaultVoice = ohVoiceController();
  return ohDefaultVoice.say(agent, text, opts);
}
export function ohDefaultVoiceController() { if (!ohDefaultVoice) ohDefaultVoice = ohVoiceController(); return ohDefaultVoice; }
