// VOICES — every GRIOT character speaks, in its own on-device voice (docs/consoles/VOICES.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// GRIOT's rule stands: a character says only its knowledge pack's lines, verbatim, and nothing is generated. This module
// gives those lines a VOICE and never a word:
//   * a voice profile for each of the 34 characters, DERIVED from who they are (their role's temper and their place in
//     the avatar space) and kept inside a gentle band — a rate, a pitch, a language and the local voice names they prefer;
//   * on-device voices only: a `speechSynthesis` voice is used only when its `localService` is true, never a network one
//     (oh-voice.js enforces it; vcPickVoice only ever looks at local voices);
//   * voice is OFF until the learner turns it on and it is not remembered between loads; captions always show (the dialogue
//     panel's text is the caption and is identical with voice on or off);
//   * only a pack line is ever spoken: `say()` refuses any text that is not one of the character's own lines, so the
//     greeting template, the hand-off text and the no-match line are read, never heard;
//   * lines queue through oh-voice.js's controller, so a character never talks over another line, and can be linked to the
//     Omega Hive's controller so characters and agents share one line of speech;
//   * nothing listens: this module only ever speaks (no microphone, no recognition, no recording) and sends nothing.
//
// SEAM:
//   VC_BAND, VC_LANG, VC_TEMPERS
//   vcTemper(role) -> a temper id; vcProfileFor(ch) -> { id, lang, rate, pitch, prefer, temper }; vcProfiles(chars?) -> profiles
//   vcAssignments(voices, chars?) -> Map(characterId -> a local voice | null), balanced over the voices the device has
//   vcPickVoice(agentLike, voices) -> the character's local voice or null   (the controller's `pick`)
//   vcDevice(synth) -> { supported, local: [names], network: [names], note }
//   vcLineMs(text) -> how long a line is shown as spoken when voice is off (the talk light's clock window)
//   vcNpcVoice({ synth, Utterance, doc, win, enabled, onCaption, characters }) ->
//       { enabled(), setEnabled(on), toggle(), canSpeak(ch), say(ch, text, { onstart, onend }), test(ch), stop(), speaking(), queued(),
//         profile(ch), assignments(chars?), device(), link(other), onChange(fn) -> off(), spoken(), controller }
//   vcVoiceBarHtml(state) -> the dialogue panel's voice row (pure); vcMountVoiceSettings(el, voice, { characters, infoEl }) -> the Me tab's block
//
// Every top-level name starts with `vc`/`VC_` (the bundler shares one scope).

import { GR_ROSTER } from "./npc-data.js";
import { ohVoiceController, ohLocalVoices } from "./oh-voice.js";

/** The gentle band every profile sits inside: training speech, never extreme (rate within 5 % of normal either way, pitch within 15 %). */
export const VC_BAND = Object.freeze({ rate: Object.freeze([0.85, 1.05]), pitch: Object.freeze([0.85, 1.15]) });
/** The packs are English (verbatim from the Guide's notes, the registries and the catalog), so every voice is English. */
export const VC_LANG = "en-US";
/** The full width of the window a temper allows around its centre (a profile sits strictly inside it). */
const VC_SPREAD = Object.freeze({ rate: 0.12, pitch: 0.16 });

/**
 * The tempers: a way of working that sets a profile's centre. `prefer` is a preference order for on-device voice NAMES (the
 * ones a platform commonly ships); it says nothing about a voice's quality, and a name the device lacks is skipped.
 */
export const VC_TEMPERS = Object.freeze({
  // Each centre sits at least half a window (rate 0.06, pitch 0.08) inside the band, so no profile is ever clamped.
  care: Object.freeze({ rate: 0.93, pitch: 1.07, prefer: Object.freeze(["Samantha", "Karen", "Victoria", "Zira"]) }),
  firm: Object.freeze({ rate: 0.98, pitch: 0.93, prefer: Object.freeze(["Daniel", "David", "Fred", "Mark"]) }),
  measured: Object.freeze({ rate: 0.91, pitch: 0.99, prefer: Object.freeze(["Oliver", "Tom", "George", "Lee"]) }),
  open: Object.freeze({ rate: 0.92, pitch: 1.04, prefer: Object.freeze(["Moira", "Tessa", "Fiona", "Hazel"]) }),
  brisk: Object.freeze({ rate: 0.99, pitch: 1.0, prefer: Object.freeze(["Aaron", "Ralph", "Junior", "Alex"]) }),
  crisp: Object.freeze({ rate: 0.97, pitch: 0.96, prefer: Object.freeze(["Alex", "Bruce", "Daniel", "Susan"]) }),
});

// The role's words decide the temper, first match wins (care before firm, so "Banquet lead" and "Nursery lead" are care).
const VC_TEMPER_RULES = [
  ["crisp", /\bpilot\b/i],
  ["care", /\b(nurse|teacher|host|banquet|nursery|hospitality)\b/i],
  ["open", /\b(ranger|lookout|scientist|watershed|wetlands?|estuary)\b/i],
  ["firm", /\b(foreman|boss|lead|conductor)\b/i],
  ["measured", /\b(inspector|lineworker|electrician|millwright|mechanic|operator|technician)\b/i],
  ["brisk", /\b(stagehand|chef|rigger)\b/i],
];

export function vcTemper(role) {
  for (const [temper, re] of VC_TEMPER_RULES) if (re.test(String(role ?? ""))) return temper;
  return "measured";
}

function vcHash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function vcHalton(n, base) { let f = 1, r = 0, i = n; while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); } return r; }
function vcClamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

/** No two profiles sit closer than this, measured as a fraction of the band (rate and pitch each scaled by their band's width). */
export const VC_MIN_GAP = 0.1;

// Stage 1: the temper's centre, moved within its window by the character's place among the others of its temper (ordered by
// their place in the avatar space, `style.i`, which also decides body, skin and hair) along a two-dimensional low-discrepancy
// sequence, so characters of one temper are spread evenly rather than piled up. A character outside the roster takes its own
// `style.i` as its place.
function vcBaseProfile(ch, chars) {
  const temper = vcTemper(ch?.role);
  const T = VC_TEMPERS[temper];
  const mates = chars.filter((c) => vcTemper(c.role) === temper).sort((a, b) => (a.style?.i ?? 0) - (b.style?.i ?? 0) || String(a.id).localeCompare(String(b.id)));
  const at = mates.findIndex((c) => c.id === ch?.id);
  const k = (at >= 0 ? at : Number.isInteger(ch?.style?.i) ? ch.style.i : vcHash(ch?.id ?? "")) + 1;
  const u = vcHalton(k, 2), v = vcHalton(k, 3);
  const rate = vcClamp(T.rate + (u - 0.5) * VC_SPREAD.rate, VC_BAND.rate[0], VC_BAND.rate[1]);
  const pitch = vcClamp(T.pitch + (v - 0.5) * VC_SPREAD.pitch, VC_BAND.pitch[0], VC_BAND.pitch[1]);
  return { temper, rate: +rate.toFixed(2), pitch: +pitch.toFixed(2), prefer: T.prefer };
}

// Stage 2: characters of different tempers can land close together, so the roster is walked in order and a profile closer than
// VC_MIN_GAP to one already placed moves to the nearest free step of 0.01 (inside the band). The result depends only on the
// roster, never on the device or on who the learner meets first.
const vcPlaced = new WeakMap();
function vcPlaceAll(chars) {
  const hit = vcPlaced.get(chars);
  if (hit) return hit;
  const W = [VC_BAND.rate[1] - VC_BAND.rate[0], VC_BAND.pitch[1] - VC_BAND.pitch[0]];
  const offsets = [];
  for (let a = -6; a <= 6; a += 1) for (let b = -8; b <= 8; b += 1) offsets.push([a / 100, b / 100]);
  offsets.sort((x, y) => Math.hypot(x[0] / W[0], x[1] / W[1]) - Math.hypot(y[0] / W[0], y[1] / W[1]) || x[0] - y[0] || x[1] - y[1]);
  const out = new Map();
  const placed = [];
  for (const ch of chars) {
    const b = vcBaseProfile(ch, chars);
    let rate = b.rate, pitch = b.pitch, moved = false;
    const free = (r, p) => placed.every((q) => Math.hypot((r - q.rate) / W[0], (p - q.pitch) / W[1]) >= VC_MIN_GAP - 1e-9);
    if (!free(rate, pitch)) {
      for (const [dr, dp] of offsets) {
        const r = +(b.rate + dr).toFixed(2), p = +(b.pitch + dp).toFixed(2);
        if (r < VC_BAND.rate[0] || r > VC_BAND.rate[1] || p < VC_BAND.pitch[0] || p > VC_BAND.pitch[1]) continue;
        if (free(r, p)) { rate = r; pitch = p; moved = true; break; }
      }
    }
    placed.push({ rate, pitch });
    out.set(ch.id, Object.freeze({ id: ch.id, lang: VC_LANG, rate, pitch, prefer: b.prefer, temper: b.temper, moved }));
  }
  vcPlaced.set(chars, out);
  return out;
}

/**
 * The voice profile of one character, pure and deterministic: `{ id, lang, rate, pitch, prefer, temper, moved }`. `moved` is
 * true when the separation pass had to shift it off its first placement.
 */
export function vcProfileFor(ch, chars = GR_ROSTER) {
  const placed = vcPlaceAll(chars).get(ch?.id);
  if (placed) return placed;
  const b = vcBaseProfile(ch, chars);
  return Object.freeze({ id: ch?.id ?? null, lang: VC_LANG, rate: b.rate, pitch: b.pitch, prefer: b.prefer, temper: b.temper, moved: false });
}

export function vcProfiles(chars = GR_ROSTER) { return chars.map((c) => vcProfileFor(c, chars)); }

// -------------------------------------------------------------------- the device's voices

/** Local voices for a language: the exact tag first, else the same primary language (oh-voice.js's rule). */
function vcVoicesFor(lang, local) {
  const want = String(lang).toLowerCase(), primary = want.split("-")[0];
  const exact = local.filter((v) => String(v.lang ?? "").toLowerCase().replace("_", "-") === want);
  return exact.length ? exact : local.filter((v) => String(v.lang ?? "").toLowerCase().replace("_", "-").startsWith(primary));
}

/**
 * One local voice (or null) for every character, chosen from the whole roster at once so the choice does not depend on who
 * the learner meets first. A character takes the least-used voice among those whose name matches one of its preferred names
 * (ties go to the earlier preference); with no match it takes the least-used voice of its language. With one voice on the
 * device everyone shares it, and the rate and pitch still tell them apart. Network voices are never candidates. Pure: it is
 * recomputed from the device's current voice list each time, which is a few microseconds for 34 characters.
 */
export function vcAssignments(voices = [], chars = GR_ROSTER) {
  const local = ohLocalVoices(voices);
  const load = new Map(local.map((v) => [v, 0]));
  const map = new Map();
  for (const ch of chars) {
    const prof = vcProfileFor(ch, chars);
    const pool = vcVoicesFor(prof.lang, local);
    if (!pool.length) { map.set(ch.id, null); continue; }
    const rank = (v) => { const i = prof.prefer.findIndex((w) => String(v.name ?? "").toLowerCase().includes(w.toLowerCase())); return i < 0 ? Infinity : i; };
    const liked = pool.filter((v) => rank(v) < Infinity);
    const tier = liked.length ? liked : pool;
    let best = tier[0];
    for (const v of tier) if (load.get(v) < load.get(best) || (load.get(v) === load.get(best) && rank(v) < rank(best))) best = v;
    load.set(best, load.get(best) + 1);
    map.set(ch.id, best);
  }
  return map;
}

/** The controller's `pick`: a character's voice from the roster-wide assignment (`agentLike.id` is the character's id). */
export function vcPickVoice(agentLike, voices = [], chars = GR_ROSTER) {
  const v = vcAssignments(voices, chars).get(agentLike?.id) ?? null;
  return v && v.localService === true ? v : null;
}

/** What the device can do, in words the panel and the Me tab show. */
export function vcDevice(synth) {
  let all = [];
  let supported = !!synth;
  try { all = synth?.getVoices?.() ?? []; } catch (_) { all = []; supported = false; }
  const local = ohLocalVoices(all).map((v) => v.name);
  const network = all.filter((v) => v && v.localService !== true).map((v) => v.name);
  let note;
  if (!supported) note = "This browser has no speech synthesis, so characters show captions only.";
  else if (!local.length) note = `No on-device voice was found on this device, so characters show captions only.${network.length ? ` ${network.length} network voice${network.length === 1 ? " is" : "s are"} listed and never used.` : ""}`;
  else note = `${local.length} on-device voice${local.length === 1 ? "" : "s"} found: ${local.join(", ")}.${network.length ? ` ${network.length} network voice${network.length === 1 ? " is" : "s are"} listed and never used.` : ""}`;
  return { supported, local, network, note };
}

/** How long a line is shown as spoken when voice is off or has no voice to use: 400 ms plus the words at 165 per minute, 1.5–12 s. */
export function vcLineMs(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.round(vcClamp(400 + (words * 60000) / 165, 1500, 12000));
}

/** The shortest of a character's own lines (what the voice test speaks), or null. */
export function vcTestLine(ch) {
  const pack = ch?.pack ?? [];
  let best = null;
  for (const l of pack) if (!best || l.text.length < best.text.length) best = l;
  return best?.text ?? null;
}

// ---------------------------------------------------------------------- the NPC voice

export function vcNpcVoice({ synth = globalThis.speechSynthesis ?? null, Utterance = globalThis.SpeechSynthesisUtterance ?? null, doc = globalThis.document ?? null, win = globalThis.window ?? null, enabled = false, onCaption = null, characters = GR_ROSTER } = {}) {
  const ctl = ohVoiceController({ synth, Utterance, doc, win, enabled, onCaption, pick: (agentLike, voices) => vcPickVoice(agentLike, voices, characters) });
  const listeners = new Set();
  const profiles = new Map(characters.map((c) => [c.id, vcProfileFor(c, characters)]));
  const byId = new Map(characters.map((c) => [c.id, c]));
  const notify = () => { for (const fn of [...listeners]) { try { fn(api); } catch (_) { /* a listener never stops the voice */ } } };
  try { synth?.addEventListener?.("voiceschanged", notify); } catch (_) { /* headless */ }
  const profile = (ch) => profiles.get(ch?.id) ?? vcProfileFor(ch, characters);
  const agentOf = (ch) => ({ id: ch.id, name: ch.name, voice: profile(ch) });
  const isPackLine = (ch, text) => !!ch?.pack?.some((l) => l.text === text);
  const voicesNow = () => { try { return synth?.getVoices?.() ?? []; } catch (_) { return []; } };
  const voiceOf = (ch) => (synth && Utterance ? vcPickVoice({ id: ch?.id }, voicesNow(), characters) : null);

  const api = {
    controller: ctl,
    enabled: () => ctl.enabled(),
    setEnabled(on) { const was = ctl.enabled(); const v = ctl.setEnabled(on); if (v !== was) notify(); return v; },
    toggle() { return api.setEnabled(!ctl.enabled()); },
    /** Voice is on and the device has a local voice for this character. */
    canSpeak: (ch) => ctl.enabled() && !!voiceOf(ch),
    /**
     * Speak one of the character's own lines. Refuses (false) any text that is not in its pack, so nothing but a pack line is
     * ever heard; returns true when the line was queued for a real utterance.
     */
    say(ch, text, opts = {}) {
      if (!ch || !isPackLine(ch, text)) return false;
      if (!api.canSpeak(ch)) return false;
      ctl.say(agentOf(ch), text, opts);
      return true;
    },
    /** The voice test: the character's shortest own line, spoken only when voice is on. Returns what happened, for the caption. */
    test(ch, opts = {}) {
      const text = vcTestLine(ch);
      const v = voiceOf(ch);
      const p = profile(ch);
      const base = { character: ch?.id ?? null, text, voice: v?.name ?? null, rate: p.rate, pitch: p.pitch, spoken: false };
      if (!text) return { ...base, reason: "no line" };
      if (!ctl.enabled()) return { ...base, reason: "voice is off" };
      if (!v) return { ...base, reason: "no on-device voice" };
      ctl.stop();
      base.spoken = api.say(ch, text, opts);
      return base;
    },
    stop() { ctl.stop(); },
    speaking: () => ctl.speaking(),
    queued: () => ctl.queued(),
    spoken: () => ctl.spoken(),
    profile,
    /** Which voice each character uses on this device (computed over the whole roster, so it matches what is spoken). */
    assignments(chars = characters) {
      const map = vcAssignments(voicesNow(), characters);
      return chars.map((c) => { const p = profile(c); const v = map.get(c.id) ?? null; return { id: c.id, name: c.name, role: c.role, temper: p.temper, rate: p.rate, pitch: p.pitch, voice: v?.name ?? null }; });
    },
    device: () => vcDevice(synth),
    link: (other) => ctl.link(other),
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    character: (id) => byId.get(id) ?? null,
  };
  return api;
}

// ----------------------------------------------------------------------------- the UI

const vcEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * The dialogue panel's voice row, as HTML (pure; the checker renders it at phone width). state:
 *   { on, canSpeak, device: vcDevice(), character: { name }, voiceName, rate, pitch, test: { text } | null }
 * The toggle says what it does; the test is enabled only with voice on and a local voice to use; a note says which voice the
 * character uses, or that there is none and the lines are captions only.
 */
export function vcVoiceBarHtml(state = {}) {
  const on = !!state.on;
  const who = state.character?.name ?? "This character";
  const dev = state.device ?? { supported: false, local: [], network: [], note: "This browser has no speech synthesis, so characters show captions only." };
  let note;
  if (!dev.supported || !dev.local.length) note = dev.note;
  else if (!on) note = `Voice is off, so ${who}'s lines are captions only. ${dev.local.length} on-device voice${dev.local.length === 1 ? "" : "s"} available.`;
  else if (state.canSpeak) note = `${who} speaks with ${state.voiceName} (on this device) · rate ${Number(state.rate).toFixed(2)} · pitch ${Number(state.pitch).toFixed(2)}.`;
  else note = `No on-device voice fits ${who}, so the lines are captions only.`;
  const testOk = on && !!state.canSpeak;
  return `<button type="button" class="gr-vc-toggle" data-vc="toggle" aria-pressed="${on}">Voice: ${on ? "on" : "off"}</button>` +
    `<button type="button" class="gr-vc-test" data-vc="test"${testOk ? "" : " disabled"} title="${testOk ? "Hear this character read one of its own lines" : "Turn voice on, with an on-device voice available, to test"}">Test voice</button>` +
    `<span class="gr-vc-note" data-vc="note" aria-live="polite">${vcEsc(note)}</span>` +
    (state.test?.text ? `<span class="gr-vc-caption" data-vc="caption">Test line: ${vcEsc(state.test.text)}</span>` : "");
}

export const VC_CSS = `
#gr-panel .gr-voice{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 12px;border-top:1px solid rgba(160,210,235,.25);font-size:13px}
#gr-panel .gr-voice .gr-vc-note{flex:1 1 100%;color:#b9d3de;font-size:12px;line-height:1.35}
#gr-panel .gr-voice .gr-vc-caption{flex:1 1 100%;font-size:12px;background:#12303f;border-radius:8px;padding:4px 8px;overflow-wrap:anywhere;max-height:4.6em;overflow-y:auto}
#gr-panel .gr-voice button[aria-pressed=true]{background:#8fe3ff;color:#0b1a24}
#gr-panel .gr-voice button[disabled]{opacity:.55;cursor:not-allowed}
.vc-settings{margin-top:10px;font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
.vc-settings .vc-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:6px 0}
.vc-settings select{min-height:36px;max-width:100%;font:inherit}
.vc-settings table{border-collapse:collapse;width:100%;font-size:12px}.vc-settings th,.vc-settings td{border-bottom:1px solid rgba(128,128,128,.35);padding:3px 6px;text-align:left;vertical-align:top}
.vc-settings .vc-caption{background:rgba(128,128,128,.18);border-radius:8px;padding:4px 8px;overflow-wrap:anywhere}
`;

/**
 * The Me tab's block, beside reduced motion: `el` receives the Voices toggle and a test (a character picker and a Test voice
 * button); `infoEl` (default: after `el`) receives the note about the device's voices and a table of which voice each
 * character uses. DOM built with createElement and textContent only. Returns { refresh(), el }.
 */
export function vcMountVoiceSettings(el, voice, { characters = GR_ROSTER, infoEl = null } = {}) {
  if (!el || !voice || typeof document === "undefined") return null;
  const mk = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  if (!document.getElementById("vc-style")) { const s = mk("style", null, VC_CSS); s.id = "vc-style"; document.head.appendChild(s); }
  const toggle = mk("button", "btn", "Voices: off"); toggle.type = "button"; toggle.id = "vc-voices-toggle"; toggle.setAttribute("aria-pressed", "false");
  toggle.title = "Let characters read their own written lines aloud with an on-device voice. Off until you turn it on; captions always show; nothing listens.";
  el.appendChild(toggle);
  const info = infoEl ?? mk("div", "vc-settings");
  if (!infoEl) el.parentNode?.insertBefore?.(info, el.nextSibling);
  info.classList.add("vc-settings");
  const row = mk("div", "vc-row");
  const pick = mk("select"); pick.id = "vc-voice-character"; pick.setAttribute("aria-label", "Character to test");
  for (const c of characters) { const o = mk("option", null, `${c.name} · ${c.role}`); o.value = c.id; pick.appendChild(o); }
  const test = mk("button", "btn", "Test voice"); test.type = "button"; test.id = "vc-voice-test";
  row.append(pick, test);
  const note = mk("p", "note"); note.id = "vc-voice-note"; note.setAttribute("aria-live", "polite");
  const caption = mk("p", "vc-caption"); caption.id = "vc-voice-caption"; caption.hidden = true;
  const det = mk("details"); const sum = mk("summary", null, `Which voice each character uses (${characters.length})`);
  const table = mk("table"); table.id = "vc-voice-table"; det.append(sum, table);
  info.append(row, note, caption, det);

  function refresh() {
    const on = voice.enabled();
    toggle.textContent = `Voices: ${on ? "on" : "off"}`; toggle.setAttribute("aria-pressed", String(on));
    const dev = voice.device();
    const ch = characters.find((c) => c.id === pick.value) ?? characters[0];
    test.disabled = !(on && ch && voice.canSpeak(ch));
    note.textContent = `${dev.note} ${on ? "Voices are on: characters read their own written lines aloud." : "Voices are off until you turn them on; captions always show."} Nothing listens.`;
    table.textContent = "";
    const head = mk("tr"); for (const h of ["Character", "Role", "Rate", "Pitch", "Voice on this device"]) head.appendChild(mk("th", null, h)); table.appendChild(head);
    for (const a of voice.assignments(characters)) {
      const tr = mk("tr"); tr.dataset.character = a.id;
      tr.append(mk("td", null, a.name), mk("td", null, a.role), mk("td", null, a.rate.toFixed(2)), mk("td", null, a.pitch.toFixed(2)), mk("td", null, a.voice ?? "none (captions only)"));
      table.appendChild(tr);
    }
  }
  toggle.addEventListener("click", () => { voice.toggle(); caption.hidden = true; refresh(); });
  pick.addEventListener("change", () => refresh());
  test.addEventListener("click", () => {
    const ch = characters.find((c) => c.id === pick.value) ?? characters[0];
    const r = voice.test(ch);
    caption.hidden = !r.text || !r.spoken; caption.textContent = r.spoken ? `Test line (${ch.name}): ${r.text}` : "";
    refresh();
  });
  voice.onChange(() => refresh());
  refresh();
  return { refresh, el: info, toggle, test, pick };
}
