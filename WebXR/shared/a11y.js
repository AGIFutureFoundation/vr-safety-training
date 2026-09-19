// Accessibility support shared by every app.
//
// A simulator that can only be operated by looking and clicking is one a
// publicly funded training centre cannot buy, and it excludes learners who
// belong in the trade. This module carries the three things the apps need to
// offer a keyboard path and a spoken one: a live region a screen reader
// reads, a keyboard cursor over the current step's targets, and a
// reduced-motion flag the scene honours.
//
// What it does not do is pretend the headset modes are keyboard-operable.
// A VR session is hand controllers by definition; the accessible path is the
// flat-screen mode, which runs the same procedure, scores it the same way and
// writes the same record. That is stated plainly in ACCESSIBILITY.md rather
// than papered over.

/** The learner asked their system for less animation. Read once per call so a
 *  change during a session is picked up on the next frame that asks. */
/**
 * Escape text before it goes into innerHTML.
 *
 * This lived as a private function in SmartCiti.X's app.js while the Trade
 * Skills app called it by the same name and never defined it — so every
 * trades debrief threw ReferenceError the moment it tried to render a step
 * title, and the results screen never appeared. Shared, because the next app
 * to build a debrief will reach for it too.
 */
export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function reducedMotion() {
  try { return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; }
  catch (_) { return false; }
}

/**
 * A visually hidden ARIA live region. Everything the app says out loud —
 * the step, the focused control, feedback, the verdict — goes here too, so a
 * screen reader user gets it without the synthesised voice.
 *
 * Polite by default; hazards and other interruptions are assertive.
 */
export function createAnnouncer(doc = typeof document !== "undefined" ? document : null) {
  if (!doc?.body) return { say() { return false; }, alert() { return false; }, node: null };
  const make = (live) => {
    const n = doc.createElement("div");
    n.setAttribute("role", live === "assertive" ? "alert" : "status");
    n.setAttribute("aria-live", live);
    n.setAttribute("aria-atomic", "true");
    // Clipped rather than display:none, which screen readers skip entirely.
    Object.assign(n.style, {
      position: "absolute", width: "1px", height: "1px", margin: "-1px", padding: "0",
      overflow: "hidden", clip: "rect(0 0 0 0)", clipPath: "inset(50%)", whiteSpace: "nowrap", border: "0",
    });
    doc.body.appendChild(n);
    return n;
  };
  const polite = make("polite");
  const urgent = make("assertive");
  let lastPolite = "";
  const write = (node, text) => {
    const t = String(text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return false;
    // A region whose text does not change is not re-announced, so nudge it.
    node.textContent = node.textContent === t ? t + " " : t;
    return true;
  };
  return {
    node: polite,
    say(text) { const t = String(text ?? ""); if (t === lastPolite) return false; lastPolite = t; return write(polite, t); },
    alert(text) { return write(urgent, text); },
  };
}

/**
 * A cursor over the controls the current step can act on, so Tab walks them
 * in the order the procedure names them rather than in scene-graph order.
 *
 * The app owns what the list is (see targetsForStep); this only remembers
 * where the learner is in it and hands back the id to focus.
 */
export function createTargetCursor() {
  let ids = [], i = -1;
  const same = (a, b) => a.length === b.length && a.every((v, k) => v === b[k]);
  return {
    get ids() { return ids; },
    get current() { return i >= 0 && i < ids.length ? ids[i] : null; },
    get index() { return i; },
    /** Replace the list. Keeps the cursor on the same id when it survives. */
    set(next = []) {
      const list = next.filter(Boolean);
      if (same(list, ids)) return this.current;
      const held = this.current;
      ids = list;
      i = held && ids.includes(held) ? ids.indexOf(held) : (ids.length ? 0 : -1);
      return this.current;
    },
    next() { if (!ids.length) return null; i = (i + 1) % ids.length; return ids[i]; },
    prev() { if (!ids.length) return null; i = (i - 1 + ids.length) % ids.length; return ids[i]; },
    focus(id) { const k = ids.indexOf(id); if (k >= 0) i = k; return this.current; },
    clear() { ids = []; i = -1; },
  };
}

/**
 * The sentence read out when the cursor lands on a control: what it is, what
 * this step wants done with it, and how to do that from the keyboard.
 */
export function describeTarget(id, step, { names = {}, position = null } = {}) {
  const name = names[id] ?? String(id).replace(/[-_]/g, " ");
  const where = position ? ` ${position[0]} of ${position[1]}.` : "";
  if (!step) return `${name}.${where}`;
  const live = id === step.target || (step.targets ?? []).includes(id);
  if (!live) return `${name}.${where} Not part of this step.`;
  const how = {
    select: "Press Enter to select it.",
    sequence: "Press Enter to take it in turn.",
    find: "Press Enter to mark it.",
    gauge: "Up and down arrows move the reading, Enter commits it.",
    turn: "Up and down arrows turn it, it completes when it reaches the required turns.",
    hold: "Hold the space bar to keep it held, release to stop.",
    track: "Hold the space bar and use the arrows to keep the reading in the band.",
    drag: "Press Enter to pick it up, then Enter again on the place it belongs.",
  }[step.kind] ?? "Press Enter to act on it.";
  return `${name}.${where} ${how}`;
}
