// K-12 field lessons in play (console SCHOLAR-3, tools/briefs/next/scholar-2-next.md).
//
// field-lessons.js holds the lessons as data and draws them on a world's map;
// this module makes them playable where the learner stands. A world builds one
// small kiosk per lesson (k2BuildKiosks), asks each frame which kiosk is in
// reach (k2NearestKiosk), and on the interact key opens the lesson screen
// (k2OpenLesson): the title, the trade line, the three steps read on the spot
// and the check question. A right answer records the lesson in the passport
// as an award (source "field-lesson", one per lesson, never twice) and counts
// toward that world's "Field Notes" badge (source "field-notes", one per
// world). A wrong answer shows the lesson's own why and lets the learner try
// again; nothing is scored against them.
//
// Top-level names carry the `k2` prefix: tools/bundle_webxr.py concatenates
// modules into one scope. The three.js library is taken from the caller as
// `T` so the bundler never reads this shared module as needing the library
// itself.
import { ppAward, ppAwarded } from "./passport.js";
import { k2LessonsFor, k2LessonLink } from "./field-lessons.js";

export const K2_KIOSK_REACH = 6;
export const K2_FIELD_NOTES_BADGE = { id: "field-notes", name: "Field Notes", note: "Five field lessons answered in one world", need: 5 };
export const K2_LESSON_REPUTATION = 5;

/** True when this lesson's check has been answered right on this device's passport. */
export function k2LessonDone(lesson) { return ppAwarded("field-lesson", lesson.id); }

/**
 * A lesson from a world with its own data module (Sierra Summit's
 * SM_FIELD_LESSONS: place/at/k12/check.choices; Redwood Reach's
 * RW_FIELD_LESSONS: site/landmark/k12/check.options) in the shared shape this
 * module and k2RenderLessonList read: world, station, tradeLine, position and
 * check.options. The award, the Field Notes badge and the list then work the
 * same in every world, and the passport holds one award kind across all six.
 */
export function k2AdaptLesson(l, world) {
  return {
    // Summit's and Redwood's lessons carry `station` as the trade station and `k12` as the K-12 one; the shared shape's `station` is the K-12 station
    ...l, world, station: l.k12 ?? l.station, tradeStation: l.k12 ? l.station : l.tradeStation, tradeLine: l.tradeLine ?? l.trade,
    position: l.position ?? l.at ?? null,
    check: l.check ? { ...l.check, question: l.check.question ?? l.check.q, options: l.check.options ?? l.check.choices } : l.check,
  };
}

/**
 * How a world's Field Notes badge stands: lessons done, lessons there, whether
 * the badge is earned. `lessons` is the world's list when it keeps its own
 * (Summit, Redwood: pass their lessons through k2AdaptLesson).
 */
export function k2FieldNotes(world, lessons = k2LessonsFor(world)) {
  const all = lessons;
  const done = all.filter(k2LessonDone).length;
  const need = Math.min(K2_FIELD_NOTES_BADGE.need, all.length);
  return { done, total: all.length, need, earned: all.length > 0 && done >= need };
}

/**
 * Record a right answer. Returns { first, badge } — `first` is false when the
 * lesson was already on the passport, `badge` is true the moment the world's
 * Field Notes badge is earned by this answer.
 */
export function k2RecordLesson(lesson, lessons = k2LessonsFor(lesson.world)) {
  const r = ppAward("field-lesson", { attemptId: lesson.id, reputation: K2_LESSON_REPUTATION, reason: `Field lesson: ${lesson.title}` });
  const notes = k2FieldNotes(lesson.world, lessons);
  let badge = false;
  if (notes.earned && !ppAwarded("field-notes", lesson.world)) {
    ppAward("field-notes", { attemptId: lesson.world, reputation: K2_LESSON_REPUTATION * 2, reason: `${K2_FIELD_NOTES_BADGE.name} badge — ${notes.need} field lessons answered` });
    badge = true;
  }
  return { first: !r.duplicate, badge, notes };
}

/** The lesson within reach of (x, z), nearest first, or null. */
export function k2NearestKiosk(x, z, lessons, reach = K2_KIOSK_REACH) {
  let best = null, bd = reach;
  for (const l of lessons) {
    const d = Math.hypot(x - l.position[0], z - l.position[1]);
    if (d < bd) { bd = d; best = l; }
  }
  return best;
}

/**
 * One kiosk per lesson: a post, a teal board with the lesson's title, and a
 * small cap that turns green once the lesson is on the passport. `T` is the
 * three.js library; `ground(x, z)` gives the ground height at a lesson (0 in
 * Bay World, the seabed in the Deep). Returns { meshes: Map<id, Group>, refresh() }.
 */
export function k2BuildKiosks(root, T, lessons, { ground = () => 0, accent = 0x6ad0c8 } = {}) {
  const meshes = new Map();
  const post = new T.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.6, metalness: 0.4 });
  const board = new T.MeshStandardMaterial({ color: accent, roughness: 0.5, emissive: accent, emissiveIntensity: 0.25 });
  const capOff = new T.MeshStandardMaterial({ color: 0x1c2a30, roughness: 0.5 });
  const capOn = new T.MeshStandardMaterial({ color: 0x59c97b, roughness: 0.4, emissive: 0x59c97b, emissiveIntensity: 0.8 });
  const postGeo = new T.CylinderGeometry(0.04, 0.05, 1.5, 8);
  const boardGeo = new T.BoxGeometry(0.9, 0.5, 0.05);
  const capGeo = new T.SphereGeometry(0.07, 10, 8);
  const labelGeo = new T.PlaneGeometry(0.84, 0.44);
  for (const l of lessons) {
    const g = new T.Group();
    const y = ground(l.position[0], l.position[1]);
    g.position.set(l.position[0], y, l.position[1]);
    const p = new T.Mesh(postGeo, post); p.position.y = 0.75; g.add(p);
    const b = new T.Mesh(boardGeo, board); b.position.y = 1.55; g.add(b);
    const cap = new T.Mesh(capGeo, k2LessonDone(l) ? capOn : capOff); cap.position.y = 1.9; g.add(cap);
    const label = k2LabelMesh(T, labelGeo, l.title, `${l.minutes} min · ${l.trade}`);
    if (label) { label.position.set(0, 1.55, 0.03); g.add(label); }
    g.userData.lessonId = l.id; g.userData.cap = cap;
    root.add(g);
    meshes.set(l.id, g);
  }
  return {
    meshes,
    refresh() { for (const l of lessons) { const m = meshes.get(l.id); if (m) m.userData.cap.material = k2LessonDone(l) ? capOn : capOff; } },
  };
}

function k2LabelMesh(T, geo, title, sub) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas"); cv.width = 384; cv.height = 192;
  const cx = cv.getContext("2d"); if (!cx) return null;
  cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, 384, 192);
  cx.fillStyle = "#6ad0c8"; cx.fillRect(0, 0, 384, 8);
  cx.fillStyle = "#eaf6fb"; cx.textAlign = "center"; cx.textBaseline = "middle";
  cx.font = "600 26px 'Barlow Condensed', Arial, sans-serif";
  const words = String(title).split(" "); const lines = []; let line = "";
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (cx.measureText(t).width > 340 && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((ln, i) => cx.fillText(ln, 192, 62 + i * 30));
  cx.fillStyle = "#9fd8d2"; cx.font = "18px Arial, sans-serif"; cx.fillText("K-12 field lesson · " + sub, 192, 166);
  const tex = new T.CanvasTexture(cv);
  const mat = new T.MeshBasicMaterial({ map: tex, transparent: true });
  return new T.Mesh(geo, mat);
}

/**
 * Render a lesson into `host` (an element inside a world's screen). `linkFor`
 * is the world's lkStationLink; `onDone(result)` runs on a right answer with
 * k2RecordLesson's result; `onClose()` on Close. The check's answer order is
 * shuffled per opening so the right button is not always in one place.
 */
export function k2OpenLesson(lesson, host, { linkFor, onDone, onClose } = {}) {
  if (!host) return;
  host.textContent = "";
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  host.appendChild(el("p", "eyebrow", "K-12 field lesson"));
  host.appendChild(el("h2", null, lesson.title));
  host.appendChild(el("p", "lead", `${lesson.minutes} minutes · ${lesson.band} · ${lesson.trade}`));
  host.appendChild(el("p", "note k2-trade-line", lesson.tradeLine));
  const ol = el("ol", "k2-steps"); for (const s of lesson.steps) ol.appendChild(el("li", null, s)); host.appendChild(ol);
  host.appendChild(el("h3", null, lesson.check.question));
  const choices = el("div", "k2-choices");
  const why = el("p", "note k2-why"); why.hidden = true;
  const order = lesson.check.options.map((_, i) => i).sort(() => Math.random() - 0.5);
  const done = el("p", "note pp-chip k2-done"); done.hidden = !k2LessonDone(lesson);
  done.textContent = "On your passport: this lesson is answered.";
  for (const i of order) {
    const b = el("button", "btn ghost k2-choice", lesson.check.options[i]);
    b.addEventListener("click", () => {
      const right = i === lesson.check.answer;
      why.hidden = false;
      why.textContent = right ? `Right. ${lesson.check.why}` : `Not this one. ${lesson.check.why} Try again.`;
      why.classList.toggle("k2-right", right); why.classList.toggle("k2-wrong", !right);
      if (right) {
        for (const c of choices.querySelectorAll("button")) c.disabled = true;
        b.classList.add("primary");
        const r = k2RecordLesson(lesson);
        done.hidden = false;
        onDone?.(r);
      }
    });
    choices.appendChild(b);
  }
  host.appendChild(choices); host.appendChild(why); host.appendChild(done);
  const row = el("div", "row k2-row");
  if (linkFor) { const a = el("a", "btn ghost", "Full lesson"); a.href = k2LessonLink(lesson, linkFor); a.style.textDecoration = "none"; row.appendChild(a); }
  const close = el("button", "btn ghost", "Close"); close.addEventListener("click", () => onClose?.()); row.appendChild(close);
  host.appendChild(row);
}

/** The HUD line for the nearest kiosk. */
export function k2KioskPrompt(lesson) { return `Press E — field lesson: ${lesson.title}${k2LessonDone(lesson) ? " (answered)" : ""}`; }
