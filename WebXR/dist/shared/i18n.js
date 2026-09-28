// The language layer (console BABEL, tools/briefs/i18n-brief.md, docs/i18n.md).
//
// One table of UI strings per language, generated into shared/i18n-strings.js
// by tools/gen_i18n.mjs from tools/i18n/<lang>.json. A page asks for a string
// with trT(key, vars); a missing key falls back to English, and a key missing
// from English too falls back to the caller's own text — never to the raw key.
// Static markup opts in with data attributes that trApply() fills:
//
//   data-tr="key"        the element's text
//   data-tr-aria="key"   its aria-label
//   data-tr-ph="key"     its placeholder
//   data-tr-title="key"  its title
//
// The first time an element is filled its English text is kept on the element
// (data-tr-en), so switching back restores exactly what the page shipped.
//
// The choice is `?lang=<code>` on the launch URL, else the one remembered in
// this browser, else English. trSet() sets <html lang dir>, refills the page
// and tells subscribers (the chrome, the Guide, React shells) to re-render.
// Arabic and Urdu are right-to-left.
//
// Every non-English table is machine-assisted and needs native-speaker review;
// the picker says so in its footnote.
//
// The bundler concatenates every module into one scope, so every top-level
// name here starts with `tr`.

import { trStrings, trLangs } from "./i18n-strings.js";

const trHasDom = typeof document !== "undefined";
const TR_STORE = "holodeck-lang-v1";
const TR_RTL = new Set(["ar", "ur"]);
const trState = { lang: "en", subs: new Set(), started: false };

/** Every language the platform ships: [{ code, name, english, dir }]. */
export const trLanguages = trLangs;

/** The current language code. */
export function trLang() { return trState.lang; }

/** "rtl" for Arabic and Urdu, "ltr" otherwise (for `lang`, or the current language). */
export function trDir(lang = trState.lang) { return TR_RTL.has(lang) ? "rtl" : "ltr"; }

function trFill(s, vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

/**
 * The string for `key` in the current language, with `{name}` placeholders
 * filled from `vars`. English when the language lacks it; `fallback` (the
 * caller's own text) when English lacks it too; never the key itself.
 */
export function trT(key, vars = null, fallback = "") {
  const own = trStrings[trState.lang]?.[key];
  const en = trStrings.en?.[key];
  const s = (typeof own === "string" && own) ? own : (typeof en === "string" && en) ? en : String(fallback ?? "");
  return trFill(s, vars);
}

/** True when `key` has its own text in the current language (not the English fallback). */
export function trHas(key, lang = trState.lang) {
  const v = trStrings[lang]?.[key];
  return typeof v === "string" && v.length > 0;
}

function trStored() {
  try { return localStorage.getItem(TR_STORE); } catch (_) { return null; }
}

/** The language a fresh page starts in: ?lang=, then the remembered choice, then English. */
export function trInitial() {
  let q = null;
  try { q = new URLSearchParams(globalThis.location?.search ?? "").get("lang"); } catch (_) { q = null; }
  for (const c of [q, trStored()]) if (c && trStrings[c]) return c;
  return "en";
}

/** Refill every data-tr* element under `root` in the current language. */
export function trApply(root = trHasDom ? document : null) {
  if (!root?.querySelectorAll) return 0;
  let n = 0;
  const attr = [["data-tr-aria", "aria-label"], ["data-tr-ph", "placeholder"], ["data-tr-title", "title"]];
  for (const el of root.querySelectorAll("[data-tr]")) {
    if (el.dataset.trEn == null) el.dataset.trEn = el.textContent;
    el.textContent = trT(el.getAttribute("data-tr"), null, el.dataset.trEn);
    n += 1;
  }
  for (const [data, name] of attr) {
    for (const el of root.querySelectorAll(`[${data}]`)) {
      const keep = `trEn${name.replace(/[^a-z]/g, "")}`;
      if (el.dataset[keep] == null) el.dataset[keep] = el.getAttribute(name) ?? "";
      el.setAttribute(name, trT(el.getAttribute(data), null, el.dataset[keep]));
      n += 1;
    }
  }
  trStepNotes(root);
  return n;
}

/** Show the "step text in English" note in every [data-tr-stepnote] slot while not in English. */
function trStepNotes(root) {
  for (const el of root.querySelectorAll("[data-tr-stepnote]")) {
    el.hidden = trState.lang === "en";
    el.textContent = trT("step.english");
  }
}

/** Call `fn(lang)` after every language change; returns an unsubscribe. */
export function trSubscribe(fn) {
  trState.subs.add(fn);
  return () => trState.subs.delete(fn);
}

/** Switch language: remembered, <html lang dir> set, the page refilled, subscribers told. */
export function trSet(lang, { remember = true } = {}) {
  const code = trStrings[lang] ? lang : "en";
  trState.lang = code;
  if (remember) { try { localStorage.setItem(TR_STORE, code); } catch (_) { /* private mode */ } }
  if (trHasDom) {
    document.documentElement.lang = code;
    document.documentElement.dir = trDir(code);
    trApply();
    trRenderPicker();
  }
  for (const fn of [...trState.subs]) { try { fn(code); } catch (e) { console.warn("i18n subscriber", e); } }
  try { globalThis.dispatchEvent?.(new CustomEvent("tr:change", { detail: { lang: code } })); } catch (_) { /* no events */ }
  return code;
}

/** Start the layer once per page: pick the initial language and apply it. */
export function trStart() {
  if (trState.started) return trState.lang;
  trState.started = true;
  return trSet(trInitial(), { remember: false });
}

// ------------------------------------------------------------------ the picker

const trCss = `
#tr-lang-btn{display:inline-flex;align-items:center;gap:4px;min-height:32px;min-width:44px;border-radius:16px;border:1px solid rgba(255,255,255,.35);background:rgba(10,20,30,.78);color:#fff;font:700 14px/1 system-ui,sans-serif;cursor:pointer;padding:0 10px}
#tr-lang-btn:hover{background:rgba(79,209,255,.3)}
#tr-lang{position:fixed;inset:0;z-index:10070;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:12px}
#tr-lang[hidden]{display:none}
#tr-lang .tr-panel{background:#0e1822;color:#f2f6fa;border:1px solid #40596e;border-radius:12px;max-width:560px;width:100%;max-height:calc(100vh - 24px);overflow:auto;padding:16px 18px;font:15px/1.45 system-ui,sans-serif}
#tr-lang h2{margin:0 0 8px;font-size:20px}
#tr-lang .tr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:0 0 10px}
#tr-lang .tr-opt{min-height:44px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;padding:6px 10px;text-align:start}
#tr-lang .tr-opt small{display:block;font-weight:400;font-size:13px;color:#bcd0e0}
#tr-lang .tr-opt[aria-pressed="true"]{background:#4fd1ff;color:#04222e;border-color:transparent}
#tr-lang .tr-opt[aria-pressed="true"] small{color:#04222e}
#tr-lang .tr-foot{font-size:14px;color:#ffcf8a;margin:4px 0 10px}
#tr-lang .tr-row{display:flex;justify-content:flex-end}
#tr-lang .tr-row button{min-height:44px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;padding:0 14px}
html[dir="rtl"] #ctl-help th,html[dir="rtl"] #ctl-help td{text-align:right}
html[dir="rtl"] #ctl-help .ctl-close{float:left}
html[dir="rtl"] #gt-dialog .gt-opt{text-align:right}
html[dir="rtl"] #gt-dialog .gt-row,html[dir="rtl"] #tr-lang .tr-row{justify-content:flex-start}
html[dir="rtl"] .panel,html[dir="rtl"] .card,html[dir="rtl"] #gd-panel{text-align:right}
.tr-stepnote{font-size:13px;color:#ffcf8a;margin:4px 0 0}
`;

const trPick = { returnTo: null };

function trRenderPicker() {
  if (!trHasDom) return;
  const btn = document.getElementById("tr-lang-btn");
  const cur = trLangs.find((l) => l.code === trState.lang) ?? trLangs[0];
  if (btn) {
    btn.textContent = cur.code.toUpperCase();
    btn.setAttribute("aria-label", `${trT("lang.button")}: ${cur.name}`);
    btn.title = trT("lang.button");
  }
  const d = document.getElementById("tr-lang");
  if (!d) return;
  d.querySelector("#tr-lang-title").textContent = trT("lang.title");
  d.querySelector(".tr-foot").textContent = trT("lang.review");
  d.querySelector("#tr-lang-close").textContent = trT("common.close");
  for (const b of d.querySelectorAll(".tr-opt")) b.setAttribute("aria-pressed", String(b.dataset.lang === trState.lang));
}

/** Open or close the picker; focus goes in and comes back. */
export function trPicker(open) {
  if (!trHasDom) return false;
  const d = document.getElementById("tr-lang");
  if (!d) return false;
  const want = open ?? d.hidden;
  if (want) {
    trPick.returnTo = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.getElementById("tr-lang-btn");
    d.hidden = false;
    document.getElementById("tr-lang-btn")?.setAttribute("aria-expanded", "true");
    (d.querySelector('.tr-opt[aria-pressed="true"]') ?? d.querySelector(".tr-opt"))?.focus();
  } else if (!d.hidden) {
    d.hidden = true;
    document.getElementById("tr-lang-btn")?.setAttribute("aria-expanded", "false");
    const back = trPick.returnTo; trPick.returnTo = null;
    if (back && document.contains(back)) back.focus?.();
  }
  return want;
}

/** Mount the language chip into `nav` (controls.js's #ctl-nav) and its dialog into the page. */
export function trMountPicker(nav) {
  if (!trHasDom || !nav) return null;
  trStart();
  if (!document.getElementById("tr-style")) {
    const s = document.createElement("style"); s.id = "tr-style"; s.textContent = trCss; document.head.appendChild(s);
  }
  let btn = document.getElementById("tr-lang-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button"; btn.id = "tr-lang-btn";
    btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "tr-lang");
    btn.addEventListener("click", () => trPicker());
    nav.appendChild(btn);
  }
  if (!document.getElementById("tr-lang")) {
    const d = document.createElement("div");
    d.id = "tr-lang"; d.hidden = true;
    d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-labelledby", "tr-lang-title");
    const opts = trLangs.map((l) => `<button type="button" class="tr-opt" data-lang="${l.code}" lang="${l.code}" dir="${trDir(l.code)}" aria-pressed="false">${l.name}<small lang="en" dir="ltr">${l.english}</small></button>`).join("");
    d.innerHTML = `<div class="tr-panel"><h2 id="tr-lang-title"></h2><div class="tr-grid">${opts}</div><p class="tr-foot"></p><div class="tr-row"><button type="button" id="tr-lang-close"></button></div></div>`;
    d.addEventListener("pointerdown", (e) => { if (e.target === d) trPicker(false); });
    d.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); trPicker(false); } });
    d.addEventListener("click", (e) => {
      const b = e.target.closest?.(".tr-opt");
      if (b) { trSet(b.dataset.lang); trPicker(false); }
    });
    d.querySelector("#tr-lang-close").addEventListener("click", () => trPicker(false));
    document.body.appendChild(d);
  }
  trRenderPicker();
  return btn;
}
