// INTERFACE (docs/consoles/INTERFACE.md): the in-world tabbed menu and the first-visit onboarding.
//
// Seams:
//   uxMountTabs(root, { storageKey, onSelect }) -> { select(id), current(), ids }
//     root holds `[role=tablist] > [role=tab][data-ux-tab=<id>][aria-controls=<panel id>]` and the panels
//     `[role=tabpanel]`. WAI-ARIA tabs: roving tabindex, ←/→ (and ↑/↓), Home/End, the choice remembered.
//   uxOnboarding({ el, cards: [{ title, body }], key, force }) -> { shown, show(), skip() }
//     three short cards in a dialog, "Skip" on every card, remembered under `key` in localStorage.
//     Automated runs (navigator.webdriver) do not see it unless `force` (the page passes `?onboard=1`).

const uxStore = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked: the choice lasts this visit */ } },
};

export function uxMountTabs(root, { storageKey = null, onSelect = null } = {}) {
  const tabs = [...root.querySelectorAll('[role="tab"][data-ux-tab]')];
  const ids = tabs.map((t) => t.dataset.uxTab);
  let cur = null;
  function select(id, { focus = false } = {}) {
    const i = Math.max(0, ids.indexOf(id));
    tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    cur = ids[i];
    if (focus) tabs[i].focus();
    if (storageKey) uxStore.set(storageKey, cur);
    onSelect?.(cur);
    return cur;
  }
  function step(d) { const i = ids.indexOf(cur); return select(ids[(i + d + ids.length) % ids.length], { focus: true }); }
  tabs.forEach((t) => {
    t.addEventListener("click", () => select(t.dataset.uxTab));
    t.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); step(1); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); step(-1); }
      else if (k === "Home") { e.preventDefault(); select(ids[0], { focus: true }); }
      else if (k === "End") { e.preventDefault(); select(ids[ids.length - 1], { focus: true }); }
    });
  });
  const saved = storageKey ? uxStore.get(storageKey) : null;
  select(ids.includes(saved) ? saved : ids[0]);
  return { select, current: () => cur, ids, step };
}

export function uxOnboarding({ el, cards, key = "ux-onboarded-v1", force = false, onDone = null } = {}) {
  const auto = typeof navigator !== "undefined" && navigator.webdriver;
  const seen = uxStore.get(key) === "1";
  let i = 0;
  const title = el.querySelector("[data-ux-ob-title]"), body = el.querySelector("[data-ux-ob-body]");
  const count = el.querySelector("[data-ux-ob-count]"), next = el.querySelector("[data-ux-ob-next]");
  const skipBtn = el.querySelector("[data-ux-ob-skip]");
  function paint() {
    title.textContent = cards[i].title; body.textContent = cards[i].body;
    count.textContent = `${i + 1} of ${cards.length}`;
    next.textContent = i === cards.length - 1 ? "Let's go" : "Next";
  }
  function skip() { uxStore.set(key, "1"); el.hidden = true; api.shown = false; onDone?.(); }
  function show() { i = 0; paint(); el.hidden = false; api.shown = true; next.focus(); }
  next.addEventListener("click", () => { if (i < cards.length - 1) { i += 1; paint(); next.focus(); } else skip(); });
  skipBtn.addEventListener("click", skip);
  el.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); skip(); } });
  const api = { shown: false, show, skip, seen };
  if (force || (!seen && !auto)) show();
  return api;
}
