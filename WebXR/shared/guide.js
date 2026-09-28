// The Guide (console COMPASS, tools/briefs/homepage-guide-brief.md): a
// floating "Guide" button on every page and the panel it opens, where a
// learner can type or say a question and get a short, plain answer with
// links that go there ("Open the Pathway Edition", "Take me to the pier
// pilings").
//
// The button can be dragged by mouse or touch, snaps to the nearest side
// edge, remembers where it was put (localStorage, wrapped in try/catch), is
// reached by Tab like any other control, and moves itself off the touch
// stick, the touch buttons, the Home/help bar and the page's HUD panels.
//
// Answers come only from the knowledge base tools/gen_guide_kb.mjs writes
// into shared/guide-kb.js, loaded the first time the panel opens: a BM25
// index over its chunks, built on this device, with no network. When nothing
// matches, the Guide says so and offers the programme finder. If this
// deployment sets guideConfig.endpoint in auth-config.json (null by default)
// the question and the retrieved chunks are posted there and the reply is
// shown; any failure falls back to the on-device answer. No key is ever
// stored here.
//
// Speech out goes through shared/voice-assist.js; speech in uses the
// browser's SpeechRecognition where it exists, and the mic button is hidden
// where it does not. The tone follows shared/ei-guide.js: plain, kind,
// never blaming.
//
// The bundler concatenates every module into one scope, so every top-level
// name here starts with `gd`.

import { speak, stopSpeaking, speechSupported } from "./voice-assist.js";
import { trT, trLang, trApply } from "./i18n.js";

const gdHasDom = typeof document !== "undefined";
const gdPosKey = "holodeck-guide-pos-v1";
const gdState = { kb: null, index: null, config: undefined, opts: null, loading: null, returnTo: null, voice: false };

// ------------------------------------------------------------ retrieval (pure)

const gdStop = new Set(("a an and are as at be by can could do does for from get go how i if in into is it its me my of on or " +
  "please show should tell than that the their them then there these this to up us was we what when where which who why will " +
  "with would you your about any have has want take find open").split(" "));

/** Lower-case word tokens with a light plural/suffix fold; stop words dropped. */
export function gdTokens(text) {
  const out = [];
  for (let w of String(text ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/)) {
    if (!w || gdStop.has(w)) continue;
    if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
    else if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
    else if (w.length > 5 && w.endsWith("ed")) w = w.slice(0, -2);
    else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
    if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);
    out.push(w);
  }
  return out;
}

/** Expand the compact rows guide-kb.js ships into chunk objects. */
export function gdDecodeKb(raw) {
  return raw.rows.map(([k, id, title, text, links, s, keys]) => {
    const kind = raw.kinds[k];
    const src = raw.srcs[s];
    let ls = links;
    if (links === "S") ls = [[`Start ${title}`, `smartcity-x.html?sim=${id.slice(8)}`]];
    else if (links === "T") ls = [[`Start ${title}`, `trade-skills-simulator.html?room=${id.slice(8)}`]];
    else if (links === "D") ls = [[`Read ${src.replace(/^docs\//, "")}`, `${raw.repo}/blob/main/${src}`]];
    return { id, kind, title, text, keys: keys ?? "", src, links: ls.map(([label, href]) => ({ label, href })) };
  });
}

/** A BM25 index: title and keys weigh three times the body. */
export function gdIndex(chunks) {
  const docs = chunks.map((c) => {
    const tf = new Map();
    const t = [...gdTokens(`${c.title} ${c.keys}`)];
    const toks = [...t, ...t, ...t, ...gdTokens(c.text)];
    for (const w of toks) tf.set(w, (tf.get(w) ?? 0) + 1);
    return { tf, len: toks.length };
  });
  const df = new Map();
  for (const d of docs) for (const w of d.tf.keys()) df.set(w, (df.get(w) ?? 0) + 1);
  const avg = docs.reduce((a, d) => a + d.len, 0) / Math.max(1, docs.length);
  return { chunks, docs, df, avg, n: docs.length };
}

// A little weight toward the chunks a learner most often means.
const gdKindBoost = { faq: 1.35, sourced: 1.3, programme: 1.2, world: 1.2, site: 1.1, control: 1.1, union: 1.05, station: 1, zone: 1, doc: 0.8 };

/** The top chunks for a question: [{ chunk, score, matched }]. */
export function gdSearch(index, question, k = 5) {
  const q = [...new Set(gdTokens(question))];
  if (!q.length || !index) return [];
  const K1 = 1.2, B = 0.75;
  const idf = (w) => { const d = index.df.get(w) ?? 0; return d ? Math.log(1 + (index.n - d + 0.5) / (d + 0.5)) : 0; };
  const hits = [];
  index.docs.forEach((d, i) => {
    let s = 0, matched = 0;
    for (const w of q) {
      const f = d.tf.get(w);
      if (!f) continue;
      matched += 1;
      s += idf(w) * (f * (K1 + 1)) / (f + K1 * (1 - B + B * d.len / index.avg));
    }
    if (!s) return;
    s *= gdKindBoost[index.chunks[i].kind] ?? 1;
    s *= 0.5 + 0.5 * (matched / q.length);
    hits.push({ chunk: index.chunks[i], score: s, matched });
  });
  hits.sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id));
  return hits.slice(0, k);
}

export const gdNoMatch = "I don't have anything on that in my notes. I only answer from what is on this platform, so I won't guess. Try the programme finder, or ask me about a trade, a union, a world or the controls.";
export const gdFinderLink = { label: "Open the programme finder", href: "index.html#catalog" };

// A sentence ends at . ! ? or … followed by a space and a capital, so "SmartCiti.X", "wojrc.org" and "1.5" stay whole.
const gdSentences = (t, n) => String(t).split(/(?<=[.!?…])\s+(?=[A-Z0-9"“(])/).slice(0, n).join(" ").trim();

/** Words of a question, stop words kept: for matching an FAQ's own wording. */
const gdWords = (t) => new Set(String(t ?? "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));

/** The FAQ entry whose question is (nearly) the one asked, or null. */
function gdFaqMatch(index, question) {
  const q = gdWords(question);
  if (q.size < 2) return null;
  let best = null, bestScore = 0;
  for (const c of index.chunks) {
    if (c.kind !== "faq") continue;
    const f = gdWords(c.title);
    let both = 0; for (const w of q) if (f.has(w)) both += 1;
    const j = both / (q.size + f.size - both);
    if (j > bestScore) { bestScore = j; best = c; }
  }
  if (bestScore < 0.6) return null;
  // "How do I move?" is not "How do I start?": every content word asked must be the entry's own.
  const own = new Set(gdTokens(`${best.title} ${best.keys}`));
  return gdTokens(question).every((w) => own.has(w)) ? best : null;
}

/**
 * Compose the on-device answer: the best chunk in two or three sentences,
 * a line naming the next best, and up to three links from the top chunks.
 * Returns { text, links, chunks, matched }.
 */
export function gdAnswer(index, question) {
  const faq = gdFaqMatch(index, question);
  if (faq) return { text: faq.text, links: faq.links.slice(0, 3), chunks: [faq], matched: true };
  const hits = gdSearch(index, question, 5);
  const qn = new Set(gdTokens(question)).size;
  const top = hits[0];
  // Nothing, or only a weak brush of one common word: say so, never guess.
  if (!top || top.score < 2.2 || (qn >= 3 && top.matched / qn < 0.5)) {
    return { text: gdNoMatch, links: [gdFinderLink], chunks: [], matched: false };
  }
  const good = hits.filter((h) => h.score >= top.score * 0.55);
  const lead = top.chunk.kind === "station" ? `${top.chunk.title}: ${top.chunk.text}` : top.chunk.text;
  let text = gdSentences(lead, top.chunk.kind === "sourced" ? 20 : top.chunk.kind === "faq" ? 6 : 3);
  const also = good.slice(1, 3).map((h) => h.chunk.title).filter((t) => t !== top.chunk.title);
  if (also.length) text += ` You might also look at ${also.join(" and ")}.`;
  const links = [];
  for (const h of good.slice(0, 3)) for (const l of h.chunk.links) if (links.length < 3 && !links.some((x) => x.href === l.href)) links.push(l);
  return { text, links, chunks: good.slice(0, 3).map((h) => h.chunk), matched: true };
}

// ------------------------------------------------------------------ the page

/** Where the knowledge base lives: beside this module in source, under the page's root in a bundle. */
function gdKbUrls() {
  const urls = [];
  try { const u = new URL("./guide-kb.js", import.meta.url); if (/\/shared\/guide\.js$/.test(new URL(import.meta.url).pathname)) urls.push(u.href); } catch { /* bundled */ }
  const root = gdState.opts?.root ?? "./";
  try { urls.push(new URL(`${root}shared/guide-kb.js`, location.href).href); } catch { /* headless */ }
  try { urls.push(new URL("../../shared/guide-kb.js", location.href).href); } catch { /* headless */ }
  return [...new Set(urls)];
}

async function gdLoadKb() {
  if (gdState.index) return gdState.index;
  if (!gdState.loading) {
    gdState.loading = (async () => {
      for (const url of gdKbUrls()) {
        try {
          const mod = await import(url);
          gdState.kb = gdDecodeKb(mod.GD_KB);
          gdState.index = gdIndex(gdState.kb);
          return gdState.index;
        } catch { /* try the next place */ }
      }
      return null;
    })();
  }
  return gdState.loading;
}

async function gdLoadConfig() {
  if (gdState.config !== undefined) return gdState.config;
  gdState.config = null;
  try {
    const r = await fetch(new URL(`${gdState.opts?.root ?? "./"}auth-config.json`, location.href).href, { cache: "no-store" });
    if (r.ok) gdState.config = (await r.json())?.guideConfig ?? null;
  } catch { /* a static copy with no config answers on-device */ }
  return gdState.config;
}

/** Ask: on-device, or the hosted endpoint when one is configured (with the retrieved chunks). */
export async function gdAsk(question) {
  const index = await gdLoadKb();
  if (!index) return { text: trT("guide.noKb"), links: [{ ...gdFinderLink, label: trT("guide.finder", null, gdFinderLink.label) }], chunks: [], matched: false };
  const local = gdAnswer(index, question);
  const cfg = await gdLoadConfig();
  const endpoint = cfg?.endpoint;
  if (!endpoint || !local.matched) return local;
  try {
    const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, chunks: local.chunks.map((c) => ({ id: c.id, title: c.title, text: c.text, links: c.links })) }) });
    const body = await r.json();
    const text = typeof body?.answer === "string" ? body.answer.trim() : "";
    if (r.ok && text) return { ...local, text, hosted: true };
  } catch { /* fall back to the on-device answer */ }
  return local;
}

const gdCss = `
#gd-btn{position:fixed;z-index:9990;min-width:48px;height:48px;padding:0 16px;border-radius:24px;border:1px solid rgba(160,210,235,.55);
  background:rgba(8,22,32,.9);color:#fff;font:700 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:grab;touch-action:none;
  box-shadow:0 4px 14px rgba(0,0,0,.35);user-select:none;-webkit-user-select:none}
#gd-btn:hover{background:rgba(20,60,80,.95)}
#gd-btn:focus-visible{outline:3px solid #ffd166;outline-offset:2px}
#gd-btn.gd-drag{cursor:grabbing;opacity:.9}
#gd-panel{position:fixed;z-index:9995;right:12px;bottom:calc(76px + env(safe-area-inset-bottom,0px));width:min(380px,calc(100vw - 24px));max-height:min(520px,calc(100vh - 110px));
  display:flex;flex-direction:column;background:#0b1a24;color:#eef7fb;border:1px solid rgba(160,210,235,.45);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.5);
  font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
#gd-panel[hidden]{display:none}
#gd-panel header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(160,210,235,.25)}
#gd-panel h2{margin:0;font-size:16px;flex:1}
#gd-panel .gd-log{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
#gd-panel .gd-msg{padding:8px 10px;border-radius:10px;background:#12303f;max-width:92%}
#gd-panel .gd-msg.gd-you{align-self:flex-end;background:#1d4a5e}
#gd-panel .gd-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#gd-panel .gd-links a{color:#0b1a24;background:#8fe3ff;border-radius:14px;padding:4px 10px;text-decoration:none;font-weight:600;font-size:14px}
#gd-panel .gd-links a:focus-visible,#gd-panel button:focus-visible,#gd-panel input:focus-visible{outline:3px solid #ffd166;outline-offset:2px}
#gd-panel form{display:flex;gap:6px;padding:10px 12px;border-top:1px solid rgba(160,210,235,.25)}
#gd-panel input{flex:1;min-width:0;font:16px system-ui,sans-serif;padding:8px 10px;border-radius:8px;border:1px solid rgba(160,210,235,.5);background:#07131b;color:#fff}
#gd-panel button{font:600 14px system-ui,sans-serif;min-height:36px;min-width:36px;padding:0 10px;border-radius:8px;border:1px solid rgba(160,210,235,.5);background:#12303f;color:#fff;cursor:pointer}
#gd-panel button[aria-pressed="true"]{background:#8fe3ff;color:#0b1a24}
#gd-panel .gd-fine{margin:0;padding:0 12px 8px;font-size:13px;color:#b9d3de}
`;

function gdInjectCss() {
  if (document.getElementById("gd-style")) return;
  const s = document.createElement("style");
  s.id = "gd-style"; s.textContent = gdCss;
  document.head.appendChild(s);
}

const gdAvoidSel = "#ctl-nav, #tc-stick, #tc-layer .tc-buttons, #tc-quality, [id^='hud-'], #menu, .gd-avoid";

/** Visible fixed boxes the button must not sit on. */
function gdObstacles(btn) {
  const out = [];
  for (const el of document.querySelectorAll(gdAvoidSel)) {
    if (el === btn || el.contains(btn) || el.closest("[hidden]")) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.width > innerWidth * 0.9 && r.height > innerHeight * 0.6) continue; // a full-screen layer, not a panel
    out.push(r);
  }
  return out;
}

const gdHit = (a, b, pad = 6) => a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;

/** Place the button on `side` near fraction `y` of the height, on the closest free spot along that edge. */
function gdPlace(btn, side, y) {
  const w = btn.offsetWidth || 90, h = btn.offsetHeight || 48;
  const m = 10, top0 = 60, bottom0 = innerHeight - h - m;
  const obs = gdObstacles(btn);
  const want = Math.min(Math.max(top0, y * innerHeight - h / 2), Math.max(top0, bottom0));
  const x = side === "left" ? m : innerWidth - w - m;
  const free = (ty) => !obs.some((r) => gdHit({ left: x, right: x + w, top: ty, bottom: ty + h }, r));
  let best = want;
  if (!free(want)) {
    best = null;
    for (let d = 8; d < innerHeight; d += 8) {
      if (want - d >= top0 && free(want - d)) { best = want - d; break; }
      if (want + d <= bottom0 && free(want + d)) { best = want + d; break; }
    }
    if (best === null) { // try the other edge before giving up
      const other = side === "left" ? "right" : "left";
      if (!gdPlace.retry) { gdPlace.retry = true; const r = gdPlace(btn, other, y); gdPlace.retry = false; return r; }
      best = want;
    }
  }
  btn.style.left = `${x}px`; btn.style.top = `${best}px`; btn.style.right = "auto"; btn.style.bottom = "auto";
  btn.dataset.side = side;
  return { side, y: (best + h / 2) / innerHeight };
}

function gdSaved() { try { const p = JSON.parse(localStorage.getItem(gdPosKey) || "null"); return p && (p.side === "left" || p.side === "right") && typeof p.y === "number" ? p : null; } catch { return null; } }
function gdSave(p) { try { localStorage.setItem(gdPosKey, JSON.stringify({ side: p.side, y: +p.y.toFixed(4) })); } catch { /* private mode */ } }

function gdDraggable(btn) {
  let drag = null;
  btn.dataset.gdReady = "1"; // the drag handlers below attach in this same tick; checkers wait for it
  btn.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const r = btn.getBoundingClientRect();
    drag = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false };
    try { btn.setPointerCapture(e.pointerId); } catch { /* synthetic */ }
  });
  btn.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
    drag.moved = true; btn.classList.add("gd-drag");
    const x = Math.min(Math.max(0, e.clientX - drag.dx), innerWidth - btn.offsetWidth);
    const y = Math.min(Math.max(0, e.clientY - drag.dy), innerHeight - btn.offsetHeight);
    btn.style.left = `${x}px`; btn.style.top = `${y}px`;
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null; btn.classList.remove("gd-drag");
    if (!moved) return;
    btn.dataset.dragged = "1"; setTimeout(() => { delete btn.dataset.dragged; }, 0);
    const r = btn.getBoundingClientRect();
    const side = r.left + r.width / 2 < innerWidth / 2 ? "left" : "right";
    gdSave(gdPlace(btn, side, (r.top + r.height / 2) / innerHeight));
  };
  btn.addEventListener("pointerup", end);
  btn.addEventListener("pointercancel", end);
  // Keyboard: Alt+Arrow moves it (left/right swaps the edge, up/down slides it).
  btn.addEventListener("keydown", (e) => {
    if (!e.altKey || !/^Arrow/.test(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const cur = gdSaved() ?? { side: btn.dataset.side || "right", y: 0.6 };
    const side = e.key === "ArrowLeft" ? "left" : e.key === "ArrowRight" ? "right" : cur.side;
    const y = cur.y + (e.key === "ArrowUp" ? -0.08 : e.key === "ArrowDown" ? 0.08 : 0);
    gdSave(gdPlace(btn, side, Math.min(0.95, Math.max(0.05, y))));
  });
}

function gdEsc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }

/** A link from the knowledge base, resolved against this page's root (external links stay as they are). */
function gdHref(href) {
  if (/^https?:/.test(href)) return href;
  return `${gdState.opts?.root ?? "./"}${href}`;
}

function gdSay(panel, who, text, links = []) {
  const log = panel.querySelector(".gd-log");
  const div = document.createElement("div");
  div.className = `gd-msg ${who === "you" ? "gd-you" : "gd-guide"}`;
  div.innerHTML = `${gdEsc(text)}${links.length ? `<div class="gd-links">${links.map((l) => `<a href="${gdEsc(gdHref(l.href))}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ""}>${gdEsc(l.label)}</a>`).join("")}</div>` : ""}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

/** Open, close or toggle the panel. Focus goes to the question box and back to the button. */
export function gdToggle(open) {
  if (!gdHasDom) return false;
  const panel = document.getElementById("gd-panel"), btn = document.getElementById("gd-btn");
  if (!panel || !btn) return false;
  const want = open ?? panel.hidden;
  if (want) {
    panel.hidden = false; btn.setAttribute("aria-expanded", "true");
    panel.querySelector("input")?.focus();
    gdLoadKb();
  } else {
    panel.hidden = true; btn.setAttribute("aria-expanded", "false");
    stopSpeaking();
    btn.focus();
  }
  return want;
}

function gdRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const gdApps = "smartcity|trades|holodeck|instructor|race|arcade|fairway|bayworld|regatta|underwater";

/** The page's path to the published folder when the page does not say: a bundle in WebXR/dist/, a track page below it, or an app's own source or dist folder. */
export function gdAutoRoot(path = gdHasDom ? location.pathname : "/") {
  if (/\/tracks\/[^/]*$/.test(path)) return "../";
  if (new RegExp(`/(${gdApps})/dist/[^/]*$`).test(path)) return "../../dist/";
  if (new RegExp(`/(${gdApps})/[^/]*$`).test(path) && !/\/dist\/[^/]*$/.test(path)) return "../dist/";
  return "./";
}

/**
 * Mount the Guide on a page. Options:
 *   root — the page's path to the published folder (WebXR/dist/), where the
 *          knowledge base's links point: "./" beside the bundles and on the
 *          flat homepage, "../" on a track page, "./dist/" on the repo homepage;
 *          worked out from the address (gdAutoRoot) when left out
 *   y    — the default height, as a fraction of the window (0.62)
 *   side — the default edge ("right")
 * Returns { open, close, toggle, ask, el }.
 */
export function gdMount(opts = {}) {
  const o = { root: gdAutoRoot(), y: 0.62, side: "right", ...opts };
  gdState.opts = o;
  if (!gdHasDom || document.getElementById("gd-btn")) return { open() {}, close() {}, toggle() {}, ask: gdAsk, el: null };
  gdInjectCss();
  const btn = document.createElement("button");
  btn.type = "button"; btn.id = "gd-btn"; btn.textContent = "Guide"; btn.setAttribute("data-tr", "guide.btn"); btn.setAttribute("data-tr-aria", "guide.btnAria");
  btn.setAttribute("aria-label", "Open the Guide: ask a question (drag to move, Alt+Arrow keys to move)");
  btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "gd-panel");
  btn.addEventListener("click", () => { if (!btn.dataset.dragged) gdToggle(); });
  const panel = document.createElement("section");
  panel.id = "gd-panel"; panel.hidden = true;
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "false"); panel.setAttribute("aria-labelledby", "gd-title");
  const Rec = gdRecognition();
  panel.innerHTML = `<header><h2 id="gd-title" data-tr="guide.btn">Guide</h2>
<button type="button" id="gd-voice" aria-pressed="false" aria-label="Read answers aloud" data-tr="guide.voice" data-tr-aria="guide.voiceAria"${speechSupported ? "" : " hidden"}>Voice</button>
<button type="button" id="gd-close" aria-label="Close the Guide" data-tr="common.close" data-tr-aria="guide.closeAria">Close</button></header>
<div class="gd-log" aria-live="polite"></div>
<form id="gd-form"><label for="gd-q" class="gd-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap" data-tr="guide.question">Your question</label>
<input id="gd-q" type="text" autocomplete="off" placeholder="Ask about a trade, a world, the controls…" data-tr-ph="guide.ph" enterkeyhint="send">
<button type="button" id="gd-mic" aria-label="Ask by voice" data-tr="guide.mic" data-tr-aria="guide.micAria"${Rec ? "" : " hidden"}>Mic</button>
<button type="submit" id="gd-send" data-tr="guide.ask">Ask</button></form>
<p class="gd-fine" data-tr="guide.fine">Answers come only from this platform's own pages.</p>`;
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  gdSay(panel, "guide", trLang() === "en" ? "Hi. Ask me how to start, where a trade is trained, what a star means, or how the controls work. I only answer from what is on this platform." : `${trT("guide.hello")} ${trT("guide.english")}`);
  trApply();
  const input = panel.querySelector("#gd-q");
  const ask = async (q) => {
    q = String(q ?? "").trim();
    if (!q) return;
    gdSay(panel, "you", q);
    const a = await gdAsk(q);
    gdSay(panel, "guide", a.text, a.links);
    if (gdState.voice) speak(a.text);
  };
  panel.querySelector("#gd-form").addEventListener("submit", (e) => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });
  panel.querySelector("#gd-close").addEventListener("click", () => gdToggle(false));
  panel.querySelector("#gd-voice").addEventListener("click", (e) => {
    gdState.voice = !gdState.voice; e.currentTarget.setAttribute("aria-pressed", String(gdState.voice));
    if (!gdState.voice) stopSpeaking();
  });
  if (Rec) {
    panel.querySelector("#gd-mic").addEventListener("click", (e) => {
      const mic = e.currentTarget;
      try {
        const rec = new Rec(); rec.lang = document.documentElement.lang || "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
        mic.setAttribute("aria-pressed", "true");
        rec.onresult = (ev) => { const t = ev.results?.[0]?.[0]?.transcript ?? ""; ask(t); };
        rec.onend = () => mic.setAttribute("aria-pressed", "false");
        rec.onerror = () => mic.setAttribute("aria-pressed", "false");
        rec.start();
      } catch { mic.setAttribute("aria-pressed", "false"); }
    });
  }
  // Keys typed in the panel stay in the panel: the world behind never walks while you type.
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); gdToggle(false); }
    e.stopPropagation();
  });
  panel.addEventListener("keyup", (e) => e.stopPropagation());
  gdDraggable(btn);
  const place = () => { const p = gdSaved() ?? { side: o.side, y: o.y }; gdPlace(btn, p.side, p.y); };
  place();
  addEventListener("resize", place);
  // HUD panels appear once a world starts: step aside again when they do.
  for (const ms of [500, 1600, 4000]) setTimeout(place, ms);
  document.addEventListener("click", () => setTimeout(place, 350), true);
  return { open: () => gdToggle(true), close: () => gdToggle(false), toggle: () => gdToggle(), ask, el: btn };
}
