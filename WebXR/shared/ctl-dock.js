// DOCK: a HUD panel the learner can fold away or move. A panel that covers
// the scene gets a small header button (collapse / expand) and a grip that
// drags it anywhere inside the viewport. Its state is kept per viewer under
// `key`, so a folded panel stays folded on the next visit; storage that is
// blocked just means the choice lasts this visit.
//
// Seams:
//   ctlDock(panel, { key, title, defaultCollapsed }) -> { collapse(), expand(), move(x, y), state() }
//     `panel` is an element already on the page. The module adds its own
//     header row (a toggle and a grip) before the panel's first child.
//     `defaultCollapsed` closes the panel until the viewer opens it; a choice the
//     viewer has made is kept over the default.
//   ctlDockClamp(x, y, w, h, vw, vh) -> { x, y }
//     keeps a dragged panel fully inside the viewport. Pure, so a checker can
//     run it without a browser.
//
// The bundler concatenates every module into one scope, so every top-level
// name here starts with `ctl`.

const ctlDockStore = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked: the choice lasts this visit */ } },
};

const ctlDockCss = `
.ctl-dock-head{display:flex;align-items:center;gap:8px;margin:-2px 0 4px;pointer-events:auto}
.ctl-dock-grip{flex:1 1 auto;min-height:24px;cursor:grab;touch-action:none;font-size:12px;opacity:.7;user-select:none}
.ctl-dock-toggle{min-height:32px;min-width:32px;border-radius:8px;border:1px solid var(--edge,#40596e);background:transparent;color:inherit;cursor:pointer}
.ctl-dock-toggle:focus-visible,.ctl-dock-grip:focus-visible{outline:2px solid var(--accent,#7fd1ff);outline-offset:2px}
.ctl-dock[data-collapsed="true"] > :not(.ctl-dock-head){display:none}
.ctl-dock[data-collapsed="true"]{min-width:0}
.ctl-dock.ctl-dock-moved{position:absolute;pointer-events:auto}
`;

let ctlDockStyled = false;
function ctlDockStyle() {
  if (ctlDockStyled || typeof document === "undefined") return;
  ctlDockStyled = true;
  const s = document.createElement("style");
  s.id = "ctl-dock-style";
  s.textContent = ctlDockCss;
  document.head.append(s);
}

/** Keeps a panel of w x h, placed at (x, y), fully inside a vw x vh viewport. */
export function ctlDockClamp(x, y, w, h, vw, vh) {
  const cx = Math.min(Math.max(0, x), Math.max(0, vw - w));
  const cy = Math.min(Math.max(0, y), Math.max(0, vh - h));
  return { x: Math.round(cx), y: Math.round(cy) };
}

export function ctlDock(panel, { key = null, title = "Panel", defaultCollapsed = false } = {}) {
  ctlDockStyle();
  panel.classList.add("ctl-dock");
  const bodyId = panel.id ? `${panel.id}-body` : null;
  const head = document.createElement("div");
  head.className = "ctl-dock-head";
  const grip = document.createElement("span");
  grip.className = "ctl-dock-grip";
  grip.tabIndex = 0;
  grip.setAttribute("role", "button");
  grip.setAttribute("aria-label", `Move ${title}`);
  grip.textContent = "⠿ " + title;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "ctl-dock-toggle";
  toggle.setAttribute("aria-label", `Collapse ${title}`);
  toggle.setAttribute("aria-expanded", "true");
  if (bodyId) toggle.setAttribute("aria-controls", bodyId);
  toggle.textContent = "−";
  head.append(grip, toggle);
  panel.prepend(head);

  const stored = key ? ctlDockStore.get(key) : null;
  let saved = null;
  try { saved = stored ? JSON.parse(stored) : null; } catch { saved = null; }

  let collapsed = false;
  function paint() {
    panel.dataset.collapsed = String(collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", `${collapsed ? "Expand" : "Collapse"} ${title}`);
    toggle.textContent = collapsed ? "+" : "−";
  }
  function persist() {
    if (!key) return;
    const r = panel.getBoundingClientRect();
    const moved = panel.classList.contains("ctl-dock-moved");
    ctlDockStore.set(key, JSON.stringify({ collapsed, moved, x: moved ? panel.offsetLeft : null, y: moved ? panel.offsetTop : null, w: Math.round(r.width) }));
  }
  function collapse() { collapsed = true; paint(); persist(); }
  function expand() { collapsed = false; paint(); persist(); }
  function move(x, y) {
    const parent = panel.offsetParent ?? document.documentElement;
    const pw = parent.clientWidth || window.innerWidth, ph = parent.clientHeight || window.innerHeight;
    const p = ctlDockClamp(x, y, panel.offsetWidth, panel.offsetHeight, pw, ph);
    panel.classList.add("ctl-dock-moved");
    panel.style.left = `${p.x}px`;
    panel.style.top = `${p.y}px`;
    persist();
    return p;
  }

  toggle.addEventListener("click", () => (collapsed ? expand() : collapse()));
  grip.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 40 : 10;
    const dirs = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    move(panel.offsetLeft + d[0], panel.offsetTop + d[1]);
  });
  grip.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const ox = e.clientX - panel.offsetLeft, oy = e.clientY - panel.offsetTop;
    grip.setPointerCapture(e.pointerId);
    grip.style.cursor = "grabbing";
    const onMove = (ev) => move(ev.clientX - ox, ev.clientY - oy);
    const onUp = () => {
      grip.style.cursor = "grab";
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onUp);
      grip.removeEventListener("pointercancel", onUp);
    };
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
    grip.addEventListener("pointercancel", onUp);
  });

  collapsed = saved && "collapsed" in saved ? !!saved.collapsed : defaultCollapsed;
  paint();
  if (saved?.moved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) move(saved.x, saved.y);

  return { collapse, expand, move, state: () => ({ collapsed, moved: panel.classList.contains("ctl-dock-moved") }) };
}
