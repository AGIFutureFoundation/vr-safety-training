// The shared mobile play surface (console TOUCH). One touch layer for every
// open-world game — Bay World, the Regatta, the Deep and Fairway Park — so a
// phone player meets the same controls everywhere: a virtual stick at the
// bottom left, round context buttons (each at least 48 px) at the bottom
// right, both kept clear of the notch and the home bar by the safe-area
// insets, a short buzz on press where the browser can vibrate, and a
// one-time gesture hint. It also mounts the Low / Balanced / High quality
// toggle each HUD carries (the tier itself lives in shared/perf.js).
//
// The bundler concatenates every module into one scope, so every top-level
// name here starts with `tc`.

import { tcTierChoice, tcSetTier, tcTierLabels } from "./perf.js";

const tcHasDom = typeof document !== "undefined";
const tcHintKey = "holodeck-touch-hint-v1";

/** Smallest side, in CSS px, of any touch target this layer draws. */
export const tcMinTarget = 48;

const tcCss = `
#tc-layer{position:fixed;inset:0;z-index:12;pointer-events:none}
#tc-layer .tc-stick{position:absolute;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));
  width:112px;height:112px;border-radius:50%;background:rgba(14,32,44,.52);border:1px solid rgba(160,210,235,.42);pointer-events:auto;touch-action:none}
#tc-layer .tc-knob{position:absolute;left:32px;top:32px;width:48px;height:48px;border-radius:50%;background:var(--accent,#4fd1ff);opacity:.6;pointer-events:none;transition:transform .05s linear}
#tc-layer .tc-buttons{position:absolute;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));
  display:grid;gap:8px;direction:rtl;pointer-events:none}
#tc-layer .tc-btn{direction:ltr;width:56px;height:56px;border-radius:50%;background:rgba(14,32,44,.58);border:1px solid rgba(160,210,235,.42);
  color:var(--text,#eaf6ff);font:700 14px/1 var(--cond,system-ui,sans-serif);text-transform:uppercase;pointer-events:auto;touch-action:none;padding:0;cursor:pointer}
#tc-layer .tc-btn.on{background:var(--accent,#4fd1ff);color:#04222e}
#tc-hint{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:31;max-width:min(320px,86vw);padding:12px 16px;border-radius:10px;
  background:rgba(6,14,22,.9);border:1px solid rgba(160,210,235,.42);color:var(--text,#eaf6ff);font:15px/1.4 var(--sans,system-ui,sans-serif);text-align:center;pointer-events:auto}
.tc-quality{display:flex;gap:4px;margin-top:6px;justify-content:flex-end;pointer-events:auto}
.tc-quality button{min-width:44px;height:32px;padding:0 8px;border-radius:7px;border:1px solid rgba(160,210,235,.42);background:rgba(14,32,44,.6);
  color:var(--text,#eaf6ff);font:600 14px/1 var(--cond,system-ui,sans-serif);cursor:pointer}
.tc-quality button[aria-pressed="true"]{background:var(--accent,#4fd1ff);color:#04222e;border-color:transparent}
@media (min-width:900px) and (pointer:fine){#tc-layer{display:none}}
`;

function tcInjectCss() {
  if (!tcHasDom || document.getElementById("tc-style")) return;
  const s = document.createElement("style");
  s.id = "tc-style"; s.textContent = tcCss;
  document.head.appendChild(s);
}

/** A short buzz on phones that can; a no-op everywhere else. */
export function tcBuzz(ms = 12) {
  try { if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(ms); } catch { /* blocked */ }
}

/** Pure stick maths: a finger at (px, py) relative to the stick's centre,
 *  clamped to radius r. Returns the knob offset and the -1..1 axes. */
export function tcStickAxes(px, py, r) {
  const d = Math.hypot(px, py);
  const k = d > r ? r / d : 1;
  const x = px * k, y = py * k;
  return { x, y, dx: x / r, dy: y / r };
}

/** Grid columns for n context buttons: two per row, three once there are five or more. */
export function tcButtonColumns(n) { return n >= 5 ? 3 : Math.max(1, Math.min(2, n)); }

/**
 * Mount the touch layer. `buttons` is a list of
 * { id, label, onDown?, onUp?, hold? } — `hold` keeps `state.held[id]` true
 * while the finger is down. Returns { stick, held, el, button(id), show(on) }.
 * `stick` is live: { active, dx, dy } with dy negative for "forward".
 */
export function tcMountTouch({ buttons = [], hint = "Drag the stick to move; tap the round buttons to act.", radius = 44 } = {}) {
  const state = { stick: { active: false, id: null, dx: 0, dy: 0 }, held: {}, el: null };
  if (!tcHasDom) return state;
  tcInjectCss();
  document.getElementById("tc-layer")?.remove();
  const layer = document.createElement("div");
  layer.id = "tc-layer";
  const stick = document.createElement("div");
  stick.className = "tc-stick"; stick.id = "tc-stick";
  stick.setAttribute("role", "application"); stick.setAttribute("aria-label", "Movement stick");
  const knob = document.createElement("div");
  knob.className = "tc-knob"; stick.appendChild(knob);
  layer.appendChild(stick);
  const s = state.stick;
  const move = (e) => {
    const b = stick.getBoundingClientRect();
    const a = tcStickAxes(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2), radius);
    s.dx = a.dx; s.dy = a.dy; knob.style.transform = `translate(${a.x}px, ${a.y}px)`;
  };
  const end = (e) => { if (e.pointerId !== s.id) return; s.active = false; s.id = null; s.dx = 0; s.dy = 0; knob.style.transform = "translate(0,0)"; };
  stick.addEventListener("pointerdown", (e) => { s.active = true; s.id = e.pointerId; try { stick.setPointerCapture(e.pointerId); } catch { /* synthetic */ } move(e); tcBuzz(8); });
  stick.addEventListener("pointermove", (e) => { if (s.active && e.pointerId === s.id) move(e); });
  stick.addEventListener("pointerup", end);
  stick.addEventListener("pointercancel", end);

  const wrap = document.createElement("div");
  wrap.className = "tc-buttons";
  wrap.style.gridTemplateColumns = `repeat(${tcButtonColumns(buttons.length)}, 56px)`;
  for (const def of buttons) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tc-btn"; b.id = def.id; b.textContent = def.label;
    b.setAttribute("aria-label", def.aria ?? def.label);
    b.addEventListener("pointerdown", (e) => { e.preventDefault(); if (def.hold) state.held[def.id] = true; tcBuzz(); def.onDown?.(); });
    const up = () => { if (def.hold) state.held[def.id] = false; def.onUp?.(); };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("pointerleave", () => { if (def.hold && state.held[def.id]) up(); });
    wrap.appendChild(b);
  }
  layer.appendChild(wrap);
  document.body.appendChild(layer);
  state.el = layer;
  state.button = (id) => document.getElementById(id);
  state.show = (on) => { layer.hidden = !on; };
  tcShowHint(hint);
  return state;
}

/** The one-time gesture hint: shown on the first touch-capable visit, gone on the first tap or after a few seconds. */
export function tcShowHint(text) {
  if (!tcHasDom || !text) return null;
  let seen = false;
  try { seen = localStorage.getItem(tcHintKey) === "1"; } catch { /* private mode */ }
  const coarse = typeof matchMedia === "function" && matchMedia("(pointer:coarse)").matches;
  if (seen || !coarse) return null;
  try { localStorage.setItem(tcHintKey, "1"); } catch { /* private mode */ }
  const el = document.createElement("div");
  el.id = "tc-hint"; el.setAttribute("role", "status"); el.textContent = text;
  const close = () => el.remove();
  el.addEventListener("pointerdown", close);
  setTimeout(close, 5000);
  document.body.appendChild(el);
  return el;
}

/**
 * The Low / Balanced / High toggle, appended into `host` (a HUD panel).
 * A choice is persisted by perf.js and applied on the next load, or at once
 * through `onChange(tier)` when the game can re-apply its renderer settings.
 */
export function tcMountQuality(host, onChange) {
  if (!tcHasDom || !host) return null;
  tcInjectCss();
  const box = document.createElement("div");
  box.className = "tc-quality"; box.id = "tc-quality";
  box.setAttribute("role", "group"); box.setAttribute("aria-label", "Graphics quality");
  const cur = tcTierChoice().tier;
  for (const [tier, label] of Object.entries(tcTierLabels)) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.dataset.tier = tier;
    b.setAttribute("aria-pressed", String(tier === cur));
    b.addEventListener("click", () => {
      tcSetTier(tier);
      for (const o of box.children) o.setAttribute("aria-pressed", String(o.dataset.tier === tier));
      onChange?.(tier);
    });
    box.appendChild(b);
  }
  host.appendChild(box);
  return box;
}
