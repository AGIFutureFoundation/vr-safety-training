// OMEGA-HIVE — the "Omega Hive" panel in the parishes app, beside the agent-jobs panel (docs/omega-hive.md,
// docs/consoles/OMEGA-HIVE.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Roster cards (the agent's badge portrait, name, role, a "software agent" label and personality chips), a live
// caption feed, the voice toggle (off by default; on-device voices only), the approval queue (the learner is the human
// supervisor: approving lets only the SIMULATED job proceed) and step / run controls. The caller decides whether the
// panel may mount at all: the parishes app mounts it only in signed-in, adult-eligible sessions that are not K-12 and
// not the demo (DATAWORKS' dxEligibility at the "offer" stage). No network, no keys, no model call, no microphone.
//
// HIVE-IN-WORLD: the cards show AGENT-AVATARS' portraits at 2× (aaPortraitImg: the SVG at once, then the cached PNG drawn at
// size × device pixel ratio; the badge SVG stays as the fallback), and "Supervise every job" (off by default) makes every
// governor-allowed job wait in the queue for the learner's approval (ohHive's setSupervise).
//
// HIVE-3: the panel's own text and the agents' role sentences follow the hive's language (h3PanelText, h3RoleIn, h3ChipIn: English
// unchanged, Spanish machine-assisted and awaiting a native speaker's review); `settings` (h3Settings) remembers voice, "supervise
// every job" and the language for a signed-in adult profile on this device, and a language button switches it (the page reloads).
//
// HIVE-4: the hive talks (exchanges at handoffs, each worker's memory of its day, varied wording): ohHive({ exchanges, memory,
// variety }) are on here. A reply sits indented under its opener in the feed; memory lines are in italics. No new UI text.
// HIVE-5: `homeward: true` too: an agent whose last job has ended walks back to its home site (outdoors as in the rooms), with a line.
//
// HIVE-6: `moods: true` and `briefing: true` too. Each card shows its agent's mood (from the hive's mood events, with the cause as
// its title); with voice on, a line is spoken at the mood's rate and pitch (h6VoicedAgent: inside the gentle band, a safety line
// never faster or higher). The briefing runs when the learner enters the operations room at the start of the day (hw-hive-world.js).
//
// AVATARS-HD-2: with voice on, `onTalk(agentId, on, line)` hears onstart (true) and onend (false) with the line ({ text, jobId }), and
// `onWord(agentId, charIndex, line)` hears each word boundary of the line being spoken, so a figure's light and mouth follow the voice.
//
// SEAM: ohMountHive(el, { reducedMotion, audit, seed, nJobs, synth, Utterance, supervise, lang, settings, reload, onTalk, onWord }) ->
//         { hive, step(), run(n), approve(jobId), decline(jobId), voice(on), supervise(on), language(code), lang, voiceController, state(), captions(), el } | null
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

import { RB_SITES } from "./rb-robotics-data.js";
import { OH_AGENTS, OH_FEATURE, OH_AGENT_LABEL, OH_LANGS, ohTraitChips, ohLangFor, ohAgentIn } from "./oh-hive-data.js";
import { ohSay } from "./oh-say.js";
import { ohHive } from "./oh-hive.js";
import { ohVoiceController } from "./oh-voice.js";
import { avAgentLook, avSpriteSvg } from "./av-sprites.js";
import { aaPortraitImg } from "./aa-agent-portraits.js";
import { h3PanelText, h3RoleIn, h3ChipIn } from "./h3-hive-day.js";
import { h6VoicedAgent } from "./h6-moods.js";

export const OH_FEED_MAX = 40;
export const OH_RUN_STEPS = 10;
/** HIVE-6: the mood chip's words (Spanish machine-assisted, like the rest of the pack). */
export const OH_MOOD_WORDS = Object.freeze({ en: Object.freeze({ label: "mood", calm: "calm", busy: "busy", concerned: "concerned", relieved: "relieved" }), es: Object.freeze({ label: "ánimo", calm: "tranquilo", busy: "ocupado", concerned: "preocupado", relieved: "aliviado" }) });
const OH_PANEL_CSS = ".oh-panel{font:13px/1.4 system-ui,sans-serif;padding:10px;border:1px solid #4a3f7a;border-radius:10px;background:#120f22;color:#ece8ff;margin:8px 0}.oh-panel h3{margin:0 0 6px;font-size:15px}.oh-panel .oh-note{opacity:.85;font-size:12px;margin:0 0 6px}.oh-panel .oh-roster{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}.oh-panel .oh-card{display:flex;gap:6px;align-items:flex-start;border:1px solid #3a335f;border-radius:8px;padding:5px;background:#1b1733;position:relative}.oh-panel .oh-card svg,.oh-panel .oh-card img{flex:0 0 auto;border-radius:6px}.oh-panel .oh-name{font-weight:600}.oh-panel .oh-label{display:inline-block;font-size:10px;letter-spacing:.02em;text-transform:uppercase;background:#2f2a52;border:1px solid #6d62b8;border-radius:4px;padding:0 4px;margin-left:4px}.oh-panel .oh-role{font-size:11px;opacity:.85}.oh-panel .oh-chip{display:inline-block;font-size:10px;border-radius:9px;padding:0 6px;margin:2px 3px 0 0;background:#2a2547}.oh-panel .oh-talk{position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;background:#3a335f}.oh-panel .oh-card[data-talking=true] .oh-talk{background:#8fe3ff}.oh-panel .oh-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.oh-panel button{background:#2a2450;color:#ece8ff;border:1px solid #6d62b8;border-radius:6px;padding:5px 9px;cursor:pointer}.oh-panel button[aria-pressed=true]{background:#4b3fa0}.oh-panel .oh-feed{max-height:180px;overflow-y:auto;border:1px solid #3a335f;border-radius:6px;padding:4px 6px;margin-top:6px;background:#0d0b19}.oh-panel .oh-feed p{margin:2px 0}.oh-panel .oh-feed p.oh-x[data-turn=\"1\"]{margin-left:14px;border-left:2px solid #6d62b8;padding-left:6px}.oh-panel .oh-feed p[data-memory=true]{font-style:italic}.oh-panel .oh-queue{margin-top:6px}.oh-panel .oh-req{border:1px solid #8a6d2a;border-radius:6px;padding:5px;margin-top:4px;background:#1f1a10}.oh-panel .oh-status{margin-top:6px;font-size:12px;opacity:.9}@media (pointer:coarse),(max-width:600px){.oh-panel button{min-height:44px;min-width:44px}}"; // HIVE-3: 44 px touch targets on a phone (the language button and the rest)

export function ohMountHive(el, { reducedMotion = false, audit = null, seed = 1, nJobs = 200, ticksPerDay = 480, synth, Utterance, onTalk = null, onWord = null, supervise = false, lang = null, settings = null, reload = null } = {}) {
  if (!el || typeof document === "undefined") return null;
  let prefs = {}; try { prefs = settings?.read?.() ?? {}; } catch (_) { prefs = {}; } // HIVE-3: this profile's remembered choices (none outside its gate)
  if (typeof prefs.supervise === "boolean") supervise = prefs.supervise;
  // VOICES: the hive speaks the page's language when it has one (English by default, or Spanish); the voice then asks for a local
  // voice of that language, and with none the agent is silent and its caption still shows.
  if (typeof prefs.lang === "string") lang = prefs.lang; // HIVE-3: the language this profile chose wins over the page's
  const hiveLang = ohLangFor(lang ?? document.documentElement?.lang ?? "en");
  const T = h3PanelText(hiveLang);
  const hive = ohHive({ seed, audit, nJobs, ticksPerDay, supervise, exchanges: true, memory: true, variety: true, homeward: true, moods: true, briefing: true, ...(hiveLang === "en" ? {} : { say: (a, ev) => ohSay(a, ev, { lang: hiveLang }), agents: OH_AGENTS.map((a) => ohAgentIn(a, hiveLang)), supervisor: "Supervisor (este dispositivo)" }) });
  const voice = ohVoiceController({ ...(synth !== undefined ? { synth } : {}), ...(Utterance !== undefined ? { Utterance } : {}), enabled: false });
  const captions = [];
  const siteName = (id) => RB_SITES.find((s) => s.id === id)?.name ?? id;
  const mk = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  const box = mk("section", "oh-panel"); box.id = "oh-hive"; box.lang = OH_LANGS[hiveLang]?.tag ?? "en-US"; box.dataset.lang = hiveLang; box.setAttribute("aria-label", T.aria(OH_FEATURE));
  const style = document.createElement("style"); style.textContent = OH_PANEL_CSS; box.appendChild(style);
  box.appendChild(mk("h3", null, T.heading(OH_FEATURE)));
  box.appendChild(mk("p", "oh-note", T.note));
  if (T.review) box.appendChild(mk("p", "oh-note oh-review", T.review));

  const roster = mk("div", "oh-roster"); roster.setAttribute("role", "list");
  const cards = new Map();
  for (const a of OH_AGENTS) {
    const card = mk("div", "oh-card"); card.setAttribute("role", "listitem"); card.dataset.agent = a.id; card.dataset.talking = "false";
    const pic = mk("div", "oh-pic");
    let img = null; try { img = typeof aaPortraitImg === "function" ? aaPortraitImg(a, { size: 48 }) : null; } catch (_) { img = null; }
    if (img) { img.title = `${a.name}, ${T.label}`; pic.appendChild(img); } // the 2× portrait (HIVE-IN-WORLD)
    else pic.innerHTML = avSpriteSvg(avAgentLook(a.avatar.glyph, a.avatar.accent), { kind: "portrait", size: 48, title: `${a.name}, ${T.label}` }); // the badge fallback
    const body = mk("div");
    const name = mk("div", "oh-name", a.name); name.appendChild(hiveLang === "en" ? mk("span", "oh-label", OH_AGENT_LABEL) : mk("span", "oh-label", T.label));
    body.appendChild(name);
    body.appendChild(mk("div", "oh-role", h3RoleIn(a, hiveLang)));
    body.appendChild(mk("div", "oh-role", T.home(siteName(a.homeSite))));
    const chips = mk("div"); for (const c of ohTraitChips(a.traits)) chips.appendChild(mk("span", "oh-chip", h3ChipIn(c, hiveLang))); body.appendChild(chips);
    const MW = OH_MOOD_WORDS[hiveLang] ?? OH_MOOD_WORDS.en; // HIVE-6: the agent's mood, from the hive's mood events
    const moodChip = mk("span", "oh-chip oh-mood", `${MW.label}: ${MW.calm}`); moodChip.dataset.mood = "calm"; body.appendChild(moodChip);
    card.append(pic, body, mk("span", "oh-talk"));
    card.querySelector(".oh-talk").setAttribute("aria-hidden", "true");
    roster.appendChild(card); cards.set(a.id, card);
  }
  box.appendChild(roster);

  const row = mk("div", "oh-row");
  const bStep = mk("button", null, T.step); bStep.type = "button"; bStep.dataset.oh = "step";
  const bRun = mk("button", null, T.run(OH_RUN_STEPS)); bRun.type = "button"; bRun.dataset.oh = "run";
  const bVoice = mk("button", null, T.voice(false)); bVoice.type = "button"; bVoice.dataset.oh = "voice"; bVoice.setAttribute("aria-pressed", "false");
  const bSup = mk("button", null, ""); bSup.type = "button"; bSup.dataset.oh = "supervise";
  const supText = (on) => { bSup.textContent = T.supervise(on); bSup.setAttribute("aria-pressed", String(on)); bSup.title = on ? T.superviseOn : T.superviseOff; };
  supText(hive.supervising());
  const bLang = mk("button", null, T.language); bLang.type = "button"; bLang.dataset.oh = "language"; bLang.title = T.languageTitle; // HIVE-3
  row.append(bStep, bRun, bVoice, bSup, bLang);
  box.appendChild(row);
  const queueBox = mk("div", "oh-queue"); queueBox.setAttribute("aria-live", "polite"); box.appendChild(queueBox);
  const feed = mk("div", "oh-feed"); feed.setAttribute("aria-live", "polite"); feed.setAttribute("aria-label", T.feed); box.appendChild(feed);
  const status = mk("div", "oh-status"); box.appendChild(status);
  el.appendChild(box);

  hive.on("mood", (e) => { // HIVE-6
    const chip = cards.get(e.agent)?.querySelector(".oh-mood"); if (!chip) return;
    const MW = OH_MOOD_WORDS[hiveLang] ?? OH_MOOD_WORDS.en;
    chip.textContent = `${MW.label}: ${MW[e.mood] ?? e.mood}`; chip.dataset.mood = e.mood; chip.title = `${e.cause?.type ?? ""}${e.cause?.jobId ? ` ${e.cause.jobId}` : ""}`;
  });
  hive.on("speak", (e) => {
    const a = ohAgentIn(OH_AGENTS.find((x) => x.id === e.agent), hiveLang); // the agent as it speaks this language: its voice asks for a local voice of it
    captions.push({ t: e.t, agent: e.agent, text: e.text, caption: e.caption });
    if (captions.length > 500) captions.splice(0, captions.length - 500);
    const p = mk("p", null, `[${e.t}] ${e.caption}`); p.dataset.agent = e.agent;
    if (e.exchange) { p.dataset.exchange = e.exchange.kind; p.dataset.turn = String(e.exchange.turn); p.className = "oh-x"; } // HIVE-4: an exchange's two turns sit together
    if (e.memory) p.dataset.memory = "true";
    feed.appendChild(p);
    while (feed.childNodes.length > OH_FEED_MAX) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
    if (a && voice.enabled()) {
      const card = cards.get(a.id);
      const line = { text: e.text, jobId: e.jobId ?? null }; // AVATARS-HD-2: the line, so the page matches the voice to the figure's line
      voice.say(h6VoicedAgent(a, e.mood, e.about), e.text, { onstart: () => { if (card) card.dataset.talking = "true"; try { onTalk?.(a.id, true, line); } catch (_) { /* a listener never stops the voice */ } }, onboundary: (b) => { if (b?.name && b.name !== "word") return; try { onWord?.(a.id, Number.isFinite(b?.charIndex) ? b.charIndex : null, line); } catch (_) { /* ignore */ } }, onend: () => { if (card) card.dataset.talking = "false"; try { onTalk?.(a.id, false, line); } catch (_) { /* ignore */ } } });
    }
  });

  function renderQueue() {
    queueBox.textContent = "";
    const pend = hive.pending();
    if (!pend.length) return;
    queueBox.appendChild(mk("div", "oh-name", T.waiting(pend.length)));
    for (const r of pend) {
      const req = mk("div", "oh-req"); req.dataset.job = r.jobId; req.dataset.reason = r.reason;
      req.appendChild(mk("div", null, r.reason === "supervise" ? T.askSupervise(r) : T.askPhysical(r)));
      const ok = mk("button", null, T.approve); ok.type = "button"; ok.dataset.oh = "approve";
      const no = mk("button", null, T.decline); no.type = "button"; no.dataset.oh = "decline";
      ok.onclick = () => api.approve(r.jobId); no.onclick = () => api.decline(r.jobId);
      const br = mk("div", "oh-row"); br.append(ok, no); req.appendChild(br);
      queueBox.appendChild(req);
    }
  }
  function render() {
    renderQueue();
    const m = hive.metrics(); const v = hive.verify();
    status.textContent = T.status(hive.now(), m, v);
  }

  let timer = null;
  const api = {
    hive, el: box, voiceController: voice, lang: hiveLang, settings,
    step() { const ev = hive.step(); render(); return ev; },
    run(n = OH_RUN_STEPS) {
      clearInterval(timer);
      if (reducedMotion || typeof setInterval !== "function") { const ev = hive.run(n); render(); return ev; }
      let left = n;
      timer = setInterval(() => {
        if (voice.enabled() && voice.queued() > 2) return; // let the voices catch up: nobody talks over anybody
        if (left <= 0 || hive.pending().length) { clearInterval(timer); return; }
        left -= 1; hive.step(); render();
      }, 400);
      return [];
    },
    approve(jobId) { const r = hive.approve(jobId); render(); return r; },
    decline(jobId) { const r = hive.decline(jobId); render(); return r; },
    voice(on, { remember = true } = {}) { const v = voice.setEnabled(on); bVoice.textContent = T.voice(v); bVoice.setAttribute("aria-pressed", String(v)); if (remember) { try { settings?.write?.({ voice: v }); } catch (_) { /* nothing kept */ } } return v; },
    supervise(on) { const v = hive.setSupervise(on); supText(v); render(); try { settings?.write?.({ supervise: v }); } catch (_) { /* nothing kept */ } return v; },
    /** HIVE-3: switch the hive's language; it is kept for this profile and applies on the reload that follows. */
    language(code) { const l = ohLangFor(code); let kept = false; try { kept = !!settings?.write?.({ lang: l }); } catch (_) { kept = false; } if (kept && l !== hiveLang) { try { (reload ?? (() => location.reload()))(); } catch (_) { /* headless */ } } return { lang: l, kept }; },
    state() { return { t: hive.now(), metrics: hive.metrics(), verify: hive.verify(), pending: hive.pending(), voice: voice.enabled(), supervise: hive.supervising(), lang: hiveLang, remembered: settings?.allowed === true, captions: captions.length }; },
    captions() { return captions.slice(); },
    stop() { clearInterval(timer); voice.stop(); },
  };
  bStep.onclick = () => api.step();
  bRun.onclick = () => api.run(OH_RUN_STEPS);
  bVoice.onclick = () => api.voice(!voice.enabled());
  bSup.onclick = () => api.supervise(!hive.supervising());
  bLang.onclick = () => api.language(hiveLang === "es" ? "en" : "es");
  if (prefs.voice === true) api.voice(true, { remember: false }); // remembered from an earlier visit by this profile
  render();
  return api;
}
