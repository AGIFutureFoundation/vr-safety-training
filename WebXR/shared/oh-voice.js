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
//   ohVoiceController({ synth, Utterance, doc, win, enabled, onCaption }) -> { enabled(), setEnabled(on), say(agent, text, { onstart, onend }),
//                                                                             stop(), queued(), speaking(), chosen(agentId), spoken() }
//   ohSpeakAs(agent, text, { onstart, onend }) -> the page's default controller's say()
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

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

export function ohVoiceController({ synth = globalThis.speechSynthesis ?? null, Utterance = globalThis.SpeechSynthesisUtterance ?? null, doc = globalThis.document ?? null, win = globalThis.window ?? null, enabled = false, onCaption = null } = {}) {
  let on = !!enabled;
  let busy = false;
  const queue = [];
  const picks = new Map();
  const spoken = [];
  const done = (item) => { try { item.opts.onend?.(); } catch (_) { /* a callback never stops the queue */ } };

  function pump() {
    if (busy || !queue.length) return;
    const item = queue.shift();
    const voice = on && synth && Utterance ? ohPickVoice(item.agent, (() => { try { return synth.getVoices() ?? []; } catch (_) { return []; } })()) : null;
    picks.set(item.agent?.id, voice ? { name: voice.name, lang: voice.lang, localService: voice.localService } : null);
    if (!voice) { try { item.opts.onstart?.(); } catch (_) { /* ignore */ } done(item); pump(); return; }
    const u = new Utterance(item.text);
    u.voice = voice; u.lang = voice.lang || item.agent.voice.lang; u.rate = item.agent.voice.rate ?? 1; u.pitch = item.agent.voice.pitch ?? 1;
    busy = true;
    u.onstart = () => { try { item.opts.onstart?.(); } catch (_) { /* ignore */ } };
    const finish = () => { if (!busy) return; busy = false; done(item); pump(); };
    u.onend = finish; u.onerror = finish;
    spoken.push({ agent: item.agent.id, voice: voice.name, localService: voice.localService, text: item.text });
    try { synth.speak(u); } catch (_) { finish(); }
  }

  function stop() {
    const left = queue.splice(0, queue.length);
    busy = false;
    try { synth?.cancel?.(); } catch (_) { /* nothing was speaking */ }
    for (const item of left) done(item);
  }

  const onHide = () => { if (!doc || doc.visibilityState === "hidden") stop(); };
  try { doc?.addEventListener?.("visibilitychange", onHide); } catch (_) { /* headless */ }
  try { win?.addEventListener?.("pagehide", () => stop()); } catch (_) { /* headless */ }

  return {
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
  };
}

let ohDefaultVoice = null;
/** Speak as an agent through the page's default controller (off until someone calls setEnabled(true) on it). */
export function ohSpeakAs(agent, text, opts = {}) {
  if (!ohDefaultVoice) ohDefaultVoice = ohVoiceController();
  return ohDefaultVoice.say(agent, text, opts);
}
export function ohDefaultVoiceController() { if (!ohDefaultVoice) ohDefaultVoice = ohVoiceController(); return ohDefaultVoice; }
