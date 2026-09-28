// The shared control grammar and help overlay (console LENS,
// tools/briefs/ui-review-brief.md). One table of verbs — move, look,
// interact, map, view, menu/back, help, quality — with the key, the gamepad
// button, the touch control and the headset gesture for each, rendered into
// one help overlay that every page opens the same way: H, or the "?" button
// that sits beside the Home chip in the top-left corner. A world's genuinely
// unique actions (the helm, rise and sink, the swing) are listed under the
// world's own heading in the same overlay, and a page that has to keep an
// older binding (the stations' M is mute, because they have no map) says so
// in the overlay instead of hiding it.
//
// It also carries the page-wide accessibility floor the review asked for:
// a visible focus ring on every control, accessible names for icon-only
// buttons, Tab kept inside whichever modal dialog is open, and interactive
// text no smaller than 14 px on a phone.
//
// The touch layer is TOUCH's (shared/touch.js); this module never draws
// touch controls itself. `ctlTouchButton()` builds a button definition for
// tcMountTouch()'s own `buttons` list so the touch labels carry the same
// verbs, and Q presses TOUCH's Low / Balanced / High toggle.
//
// The account chip and the one sign-in dialog (shared/account.js, console
// GATE) sit beside the help button, so every page that mounts this grammar
// carries the same sign-in entry.
//
// The bundler concatenates every module into one scope, so every top-level
// name here starts with `ctl`.

import { gtMountAccount } from "./account.js";
import { thMount } from "./theme.js";
import { trMountPicker, trT, trSubscribe, trApply } from "./i18n.js";

const ctlHasDom = typeof document !== "undefined";

/** The shared verbs, in the order the overlay lists them. */
export const ctlVerbs = [
  { id: "move", label: "Move", keys: ["W", "A", "S", "D", "Arrow keys"], pad: "Left stick", touch: "Stick, bottom left", xr: "Left thumbstick" },
  { id: "look", label: "Look", keys: ["Mouse", "Drag"], pad: "Right stick", touch: "Drag the scene", xr: "Turn your head" },
  { id: "interact", label: "Interact", keys: ["E"], pad: "A", touch: "E button", xr: "Trigger" },
  { id: "map", label: "Map", keys: ["M"], pad: "Y", touch: "Map button", xr: "Wrist menu" },
  { id: "view", label: "Change view", keys: ["V"], pad: "R3", touch: "View button", xr: "—" },
  { id: "menu", label: "Menu / back", keys: ["Esc"], pad: "B back · Start menu", touch: "Home chip, top left", xr: "Menu button" },
  { id: "help", label: "Help (this panel)", keys: ["H"], pad: "—", touch: "? button, top left", xr: "—" },
  { id: "quality", label: "Graphics quality", keys: ["Q"], pad: "—", touch: "Low / Balanced / High", xr: "—" },
];
export const ctlVerbIds = ctlVerbs.map((v) => v.id);

/** Where a touch button for a shared verb takes its label and name from. */
const ctlTouchNames = { interact: ["E", "Interact"], view: ["View", "Change view"], map: ["Map", "Open the map"], help: ["?", "Help and controls"] };

/**
 * A button definition for TOUCH's tcMountTouch({ buttons }) that carries the
 * shared verb's label and accessible name. `extra` is merged over it
 * (id, onDown, onUp, hold, or a world-specific aria).
 */
export function ctlTouchButton(verb, extra = {}) {
  const [label, aria] = ctlTouchNames[verb] ?? [verb, verb];
  return { id: `touch-${verb}`, label, aria, ...extra };
}

/** Rows for the overlay: the shared verbs with a page's exceptions applied. */
export function ctlHelpRows({ except = {}, omit = [] } = {}) {
  return ctlVerbs.filter((v) => !omit.includes(v.id)).map((v) => {
    const note = except[v.id];
    return { ...v, label: trT(`verb.${v.id}`, null, v.label), keysText: v.keys.join(" / "), note: note ?? "" };
  });
}

const ctlCss = `
:where(a,button,input,select,textarea,summary,[tabindex]):focus-visible{outline:3px solid #ffd54a !important;outline-offset:2px !important;box-shadow:0 0 0 5px rgba(0,0,0,.55) !important}
#ctl-nav{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));left:10px;z-index:10000;display:flex;gap:6px;align-items:center;pointer-events:none}
#ctl-nav > *{pointer-events:auto}
#ctl-nav .home-chip{position:static !important;top:auto !important;left:auto !important}
#ctl-help-btn{width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(10,20,30,.78);color:#fff;font:700 16px/1 system-ui,sans-serif;cursor:pointer;padding:0}
#ctl-help-btn:hover{background:rgba(79,209,255,.3)}
#ctl-help{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:12px}
#ctl-help[hidden]{display:none}
#ctl-help .ctl-panel{background:#0e1822;color:#f2f6fa;border:1px solid #40596e;border-radius:12px;max-width:760px;width:100%;max-height:calc(100vh - 24px);overflow:auto;padding:16px 18px;font:15px/1.45 system-ui,sans-serif}
#ctl-help h2{margin:0 0 4px;font-size:20px}
#ctl-help h3{margin:14px 0 6px;font-size:16px;color:#ffd54a}
#ctl-help p{margin:4px 0;color:#d4dee8}
#ctl-help table{border-collapse:collapse;width:100%;font-size:14px}
#ctl-help th,#ctl-help td{text-align:left;padding:5px 6px;border-bottom:1px solid #2a3c4c;vertical-align:top}
#ctl-help th{color:#bcd0e0;font-weight:600}
#ctl-help kbd{display:inline-block;min-width:1.4em;padding:1px 5px;border:1px solid #6a8296;border-radius:4px;background:#1b2a38;color:#fff;font:600 14px/1.3 ui-monospace,monospace}
#ctl-help .ctl-note{display:block;color:#ffcf8a;font-size:14px}
#ctl-help .ctl-close{float:right;min-width:44px;min-height:44px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;padding:0 12px}
@media (max-width:560px){#ctl-help .ctl-hide-phone{display:none}#ctl-help .ctl-panel{padding:12px}}
@media (max-width:480px){
  #ctl-nav{top:calc(6px + env(safe-area-inset-top,0px));left:8px;max-width:calc(100vw - 16px)}
  #ctl-nav > *{min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .home-chip{font-size:14px !important}
  :where(button,a.btn,.btn,select,input,label){font-size:max(14px,1em)}
}
/* On a phone every chip in the shared bar is a 44 px tap target (WCAG 2.5.8); the desktop keeps the 32 px pills. */
@media (max-width:700px){
  #ctl-nav > *, #ctl-nav #gt-account, #ctl-nav #tr-lang-btn{min-height:44px;min-width:44px;display:inline-flex;align-items:center}
  #ctl-nav #ctl-help-btn{width:44px;min-width:44px;height:44px;justify-content:center}
}
`;

function ctlInjectCss() {
  if (!ctlHasDom || document.getElementById("ctl-style")) return;
  const s = document.createElement("style");
  s.id = "ctl-style"; s.textContent = ctlCss;
  document.head.appendChild(s);
}

function ctlEsc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Give every icon-only button (no visible words) an accessible name from its title, or a generic one. */
export function ctlNameButtons(root = ctlHasDom ? document : null) {
  if (!root) return 0;
  let fixed = 0;
  for (const b of root.querySelectorAll("button, [role=button], a[href]")) {
    if (b.getAttribute("aria-label") || b.getAttribute("aria-labelledby")) continue;
    const words = (b.textContent || "").replace(/[^\p{L}\p{N}]+/gu, "");
    if (words.length >= 2) continue;
    const img = b.querySelector("img[alt]");
    const name = b.getAttribute("title") || img?.getAttribute("alt") || b.dataset.label || b.id?.replace(/[-_]+/g, " ") || "";
    if (name) { b.setAttribute("aria-label", name); fixed += 1; }
  }
  return fixed;
}

/**
 * On a phone (short side under 481 px) raise any visible button, link-button
 * or tab whose text is under 14 px to 14 px. Pages size their chrome for a
 * desktop; this is the floor the review asked for, applied in one place.
 */
export function ctlPhoneText(root = ctlHasDom ? document : null) {
  if (!root || typeof matchMedia !== "function" || !matchMedia("(max-width:480px)").matches) return 0;
  let raised = 0;
  for (const el of root.querySelectorAll("button, .btn, [role=tab], .home-chip")) {
    if (!el.textContent.trim() || !ctlVisible(el)) continue;
    if (parseFloat(getComputedStyle(el).fontSize) < 14) { el.style.setProperty("font-size", "14px", "important"); raised += 1; }
  }
  return raised;
}

function ctlVisible(el) {
  if (!el || el.hidden || el.closest("[hidden]")) return false;
  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function ctlFocusables(root) {
  return [...root.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])")].filter(ctlVisible);
}

/** The topmost open modal dialog (ours first), or null. */
export function ctlOpenDialog() {
  if (!ctlHasDom) return null;
  const mine = document.getElementById("ctl-help");
  if (mine && !mine.hidden) return mine;
  const all = [...document.querySelectorAll("[role=dialog][aria-modal=true],dialog[open]")].filter(ctlVisible);
  return all.pop() ?? null;
}

/** Keep Tab inside `dialog`: wraps from the last control to the first and back. */
export function ctlTrapTab(e, dialog) {
  const f = ctlFocusables(dialog);
  if (!f.length) { e.preventDefault(); return; }
  const first = f[0], last = f[f.length - 1];
  const inside = dialog.contains(document.activeElement);
  if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
}

const ctlState = { mounted: false, opts: null, returnTo: null };

function ctlTyping(e) {
  const t = e.target;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName ?? ""));
}

/** Render the overlay's contents for the mounted page. */
function ctlRender(el, opts) {
  const rows = ctlHelpRows(opts);
  const kbd = (keys) => keys.map((k) => `<kbd>${ctlEsc(k)}</kbd>`).join(" ");
  const shared = rows.map((r) => `<tr data-verb="${r.id}"><th scope="row">${ctlEsc(r.label)}</th><td>${kbd(r.keys)}${r.note ? `<span class="ctl-note">${ctlEsc(r.note)}</span>` : ""}</td>` +
    `<td>${ctlEsc(r.pad)}</td><td>${ctlEsc(r.touch)}</td><td class="ctl-hide-phone">${ctlEsc(r.xr)}</td></tr>`).join("");
  const unique = (opts.unique ?? []).map((u) => `<tr><th scope="row">${ctlEsc(u.label)}</th><td>${kbd(u.keys ?? [])}</td><td>${ctlEsc(u.pad ?? "—")}</td><td>${ctlEsc(u.touch ?? "—")}</td><td class="ctl-hide-phone">${ctlEsc(u.xr ?? "—")}</td></tr>`).join("");
  const head = `<thead><tr><th scope="col">${ctlEsc(trT("help.action"))}</th><th scope="col">${ctlEsc(trT("help.keyboard"))}</th><th scope="col">${ctlEsc(trT("help.gamepad"))}</th><th scope="col">${ctlEsc(trT("help.touch"))}</th><th scope="col" class="ctl-hide-phone">${ctlEsc(trT("help.headset"))}</th></tr></thead>`;
  el.innerHTML = `<div class="ctl-panel">
<button type="button" class="ctl-close" id="ctl-help-close" aria-label="${ctlEsc(trT("help.closeAria"))}">${ctlEsc(trT("common.close"))}</button>
<h2 id="ctl-help-title">${ctlEsc(trT("help.title", { world: opts.world }))}</h2>
<p>${ctlEsc(trT("help.intro"))}</p>
<h3>${ctlEsc(trT("help.every"))}</h3>
<table class="ctl-shared">${head}<tbody>${shared}</tbody></table>
${unique ? `<h3>${ctlEsc(trT("help.only", { world: opts.world }))}</h3><table class="ctl-unique">${head}<tbody>${unique}</tbody></table>` : ""}
${opts.note ? `<p>${ctlEsc(opts.note)}</p>` : ""}
</div>`;
  el.querySelector("#ctl-help-close").addEventListener("click", () => ctlHelp(false));
}

/** Open, close or toggle the help overlay. Focus goes into it and returns to where it was. */
export function ctlHelp(open) {
  if (!ctlHasDom) return false;
  const el = document.getElementById("ctl-help");
  if (!el) return false;
  const want = open ?? el.hidden;
  if (want === !el.hidden) return want;
  if (want) {
    ctlState.returnTo = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.getElementById("ctl-help-btn");
    el.hidden = false;
    document.getElementById("ctl-help-btn")?.setAttribute("aria-expanded", "true");
    el.querySelector("#ctl-help-close")?.focus();
  } else {
    el.hidden = true;
    document.getElementById("ctl-help-btn")?.setAttribute("aria-expanded", "false");
    const back = ctlState.returnTo;
    ctlState.returnTo = null;
    if (back && document.contains(back)) back.focus?.();
  }
  ctlState.opts?.onToggle?.(want);
  return want;
}

/** Step TOUCH's Low / Balanced / High toggle to the next tier (it persists and applies the choice itself). */
export function ctlCycleQuality() {
  if (!ctlHasDom) return null;
  const btns = [...document.querySelectorAll("#tc-quality button")];
  if (!btns.length) return null;
  const cur = btns.findIndex((b) => b.getAttribute("aria-pressed") === "true");
  const next = btns[(cur + 1) % btns.length];
  next.click();
  return next.dataset.tier ?? null;
}

function ctlOnKey(e) {
  const opts = ctlState.opts;
  if (!opts) return;
  const help = document.getElementById("ctl-help");
  const open = help && !help.hidden;
  const lang = document.getElementById("tr-lang");
  if (lang && !lang.hidden) {
    // The language picker is modal too: Tab stays in it, its own Esc closes it.
    if (e.code === "Tab") { e.stopImmediatePropagation(); ctlTrapTab(e, lang); }
    return;
  }
  if (open) {
    // The overlay is modal: nothing behind it moves while it is up.
    if (e.code === "Escape" || e.code === "KeyH") { e.preventDefault(); e.stopImmediatePropagation(); ctlHelp(false); return; }
    if (e.code === "Tab") { e.stopImmediatePropagation(); ctlTrapTab(e, help); return; }
    if (!ctlTyping(e) && e.code !== "Enter" && e.code !== "Space") e.stopImmediatePropagation();
    return;
  }
  if (ctlTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === "Tab") {
    const d = ctlOpenDialog();
    if (d) ctlTrapTab(e, d);
    return;
  }
  if (e.code === "KeyH" && !e.repeat && (opts.helpWhen?.() ?? true)) {
    e.preventDefault(); e.stopImmediatePropagation(); ctlHelp(true); return;
  }
  if (e.code === "KeyQ" && !e.repeat && opts.quality && (opts.qualityWhen?.() ?? true)) {
    if (ctlCycleQuality()) { e.preventDefault(); e.stopImmediatePropagation(); }
  }
}

/**
 * Mount the grammar on a page. Options:
 *   world      — the page's name for the overlay heading ("Bay World")
 *   unique     — [{ label, keys, pad, touch, xr }] the world's own actions
 *   except     — { verbId: "note" } where this page binds a verb differently
 *   omit       — verb ids the page has no use for (a page with no map)
 *   helpWhen   — () => boolean; H opens help only while this is true (the
 *                stations keep H for "read the step aloud" inside a station)
 *   quality    — true when the page carries TOUCH's quality toggle (Q cycles it)
 *   qualityWhen— () => boolean, as helpWhen for Q
 *   home       — the Home link's href when the page has no Home chip, or
 *                false on the homepage itself
 *   note       — one closing line
 * Returns { open, close, toggle, el }.
 */
export function ctlMount(opts = {}) {
  const o = { world: "this page", unique: [], except: {}, omit: [], ...opts };
  if (!ctlHasDom) return { open() {}, close() {}, toggle() {}, el: null };
  ctlInjectCss();
  ctlState.opts = o;
  const body = document.body;
  let nav = document.getElementById("ctl-nav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.id = "ctl-nav"; nav.setAttribute("aria-label", "Page");
    const chip = document.querySelector(".home-chip");
    if (chip) nav.appendChild(chip);
    else if (o.home !== false) {
      const a = document.createElement("a");
      a.className = "home-chip ctl-home"; a.href = o.home ?? "./index.html"; a.textContent = "Home";
      a.setAttribute("aria-label", "Back to the homepage");
      a.setAttribute("data-tr", "nav.home"); a.setAttribute("data-tr-aria", "nav.homeAria");
      nav.appendChild(a);
    }
    const btn = document.createElement("button");
    btn.type = "button"; btn.id = "ctl-help-btn"; btn.textContent = "?";
    btn.setAttribute("aria-label", "Help and controls (H)"); btn.setAttribute("data-tr-aria", "nav.help");
    btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "ctl-help");
    btn.addEventListener("click", () => ctlHelp());
    nav.appendChild(btn);
    body.prepend(nav);
  }
  // The account chip: one sign-in entry on every page (shared/account.js).
  if (o.account !== false) gtMountAccount(nav, { configUrl: o.authConfig ?? null });
  // The language chip (shared/i18n.js): after the account chip, so Tab still
  // reaches Home and help first. Mounting it starts the language layer.
  trMountPicker(nav);
  let el = document.getElementById("ctl-help");
  if (!el) {
    el = document.createElement("div");
    el.id = "ctl-help"; el.hidden = true;
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "ctl-help-title");
    el.addEventListener("pointerdown", (e) => { if (e.target === el) ctlHelp(false); });
    body.appendChild(el);
  }
  ctlRender(el, o);
  trApply();
  if (!ctlState.mounted) {
    trSubscribe(() => { const h = document.getElementById("ctl-help"); if (h && ctlState.opts) ctlRender(h, ctlState.opts); });
    // Capture phase, so the overlay's keys never reach the world behind it.
    window.addEventListener("keydown", ctlOnKey, true);
    ctlState.mounted = true;
  }
  // The platform's design tokens (shared/theme.js), after every shared sheet.
  thMount();
  const ctlSweep = () => { ctlNameButtons(); ctlPhoneText(); thMount(); };
  ctlSweep();
  // Late-built HUD buttons get their names and sizes too, once the page settles.
  for (const ms of [400, 1500, 4000]) setTimeout(ctlSweep, ms);
  window.addEventListener("resize", ctlSweep);
  document.addEventListener("click", () => setTimeout(ctlSweep, 300), true);
  return { open: () => ctlHelp(true), close: () => ctlHelp(false), toggle: () => ctlHelp(), el };
}
