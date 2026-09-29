// SCHOLAR — the in-world lesson session panel (docs/consoles/SCHOLAR.md). DOM only, no three.js.
//
// SEAM: scMountSession({ world, lessons, parish?, siteAt?, stationHref?, award?, awarded?, path?, host?, boardHref? })
//   -> { tick(x, z), open(lessonId), close(), isOpen(), chipLesson(), lessons }
// `lessons` are raw lessons in any world's shape (registered here through scRegisterLessons);
// `tick` runs a few times a second with the learner's position: within reach of a lesson's site a
// chip offers the session (L or a tap). The panel walks the steps one at a time, then the check;
// a right answer shows stars, the first-try run, any new badge and the lesson trail (what is near
// next). STORYLINE's chosen path is read guarded: on "roam" (Just Roam) or a path that is not K-12
// or Teachers the chip stays quiet; with no path chosen it shows.
//
// No animation (reduced motion needs nothing turned off); every line comes from the lesson or
// SC_LINES. Every top-level name carries the `sc` prefix (the bundler shares one scope).

import { scRegisterLessons, scStartSession, scStep, scAnswer, scNearby, scWorldName, SC_LINES, SC_REACH } from "./sc-scholar.js";

const SC_PATHS_ON = [null, undefined, "", "k12", "teachers"];

const SC_CSS = `
.sc-chip{position:fixed;left:12px;bottom:84px;z-index:30;max-width:min(360px,calc(100vw - 24px));background:#0b141dee;color:#edf6fb;border:1px solid #4fd1ff88;border-radius:12px;padding:8px 12px;font:14px/1.35 system-ui,sans-serif;display:flex;gap:8px;align-items:center}
.sc-chip button,.sc-panel button{font:inherit;min-height:40px;padding:6px 12px;border-radius:10px;border:1px solid #4fd1ff88;background:#142130;color:#edf6fb;cursor:pointer}
.sc-chip button.sc-go,.sc-panel button.sc-go{background:#4fd1ff;color:#03202b;border-color:#4fd1ff;font-weight:600}
.sc-panel{position:fixed;right:12px;top:72px;z-index:31;width:min(380px,calc(100vw - 24px));max-height:calc(100vh - 96px);overflow:auto;background:#0b141df2;color:#edf6fb;border:1px solid #4fd1ff66;border-radius:14px;padding:14px 16px;font:15px/1.45 system-ui,sans-serif}
.sc-panel h2{font-size:17px;margin:0 0 4px}.sc-panel .sc-sub{font-size:12.5px;color:#a9c3d2;margin:0 0 10px}
.sc-panel .sc-dots{display:flex;gap:6px;margin:6px 0 10px}.sc-panel .sc-dots i{width:10px;height:10px;border-radius:50%;background:#192a3b;border:1px solid #4fd1ff66}.sc-panel .sc-dots i.on{background:#4fd1ff}
.sc-panel .sc-opts{display:grid;gap:8px;margin:10px 0}.sc-panel .sc-why{border-left:3px solid #f2c14b;padding-left:10px;font-size:14px;margin:8px 0}
.sc-panel .sc-stars{font-size:22px;color:#f2c14b;letter-spacing:2px}.sc-panel ul{padding-left:18px;margin:6px 0}.sc-panel .sc-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.sc-panel a{color:#7ee6ff}[hidden].sc-chip,[hidden].sc-panel{display:none!important}
`;

function scEl(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

/** Mount the session chip and panel in a world page. Returns the controller described above. */
export function scMountSession(opts = {}) {
  if (typeof document === "undefined") return { tick() {}, open() { return false; }, close() {}, isOpen: () => false, chipLesson: () => null, lessons: [] };
  const world = opts.world ?? "parishes";
  const lessons = scRegisterLessons(opts.lessons ?? [], { world, parish: opts.parish, siteAt: opts.siteAt });
  const host = opts.host ?? document.body;
  if (!document.getElementById("sc-style")) { const st = scEl("style"); st.id = "sc-style"; st.textContent = SC_CSS; document.head.appendChild(st); }
  const chip = scEl("div", "sc-chip"); chip.hidden = true; chip.setAttribute("role", "status");
  const chipText = scEl("span"); const chipGo = scEl("button", "sc-go", SC_LINES.start);
  chip.append(chipText, chipGo); host.appendChild(chip);
  const panel = scEl("section", "sc-panel"); panel.hidden = true; panel.setAttribute("aria-label", "K-12 lesson session"); host.appendChild(panel);
  let near = null, session = null, pos = null;

  const pathOn = () => {
    let p = null;
    // STORYLINE's seam: the world passes `path` (its stChosenPath) when it has one; else a page-level global, guarded.
    const get = typeof opts.path === "function" ? opts.path : globalThis.stChosenPath;
    try { p = typeof get === "function" ? get() : null; } catch (_) { p = null; }
    const id = p && typeof p === "object" ? p.id : p;
    return SC_PATHS_ON.includes(id);
  };

  function render(view) {
    panel.textContent = "";
    const L = session.lesson;
    panel.append(scEl("h2", null, L.title), scEl("p", "sc-sub", `${L.trade ? `${L.trade} · ` : ""}K-12 lesson in ${scWorldName(world)}`));
    if (view.kind === "step") {
      const dots = scEl("div", "sc-dots");
      for (let i = 1; i <= view.of; i++) { const d = scEl("i"); if (i <= view.index) d.className = "on"; dots.appendChild(d); }
      const next = scEl("button", "sc-go", view.index < view.of ? SC_LINES.next : SC_LINES.check);
      next.onclick = () => render(scStep(session));
      panel.append(dots, scEl("p", null, view.text), next);
      next.focus();
    } else if (view.kind === "check") {
      panel.append(scEl("p", null, view.q));
      const box = scEl("div", "sc-opts");
      view.options.forEach((o, i) => {
        const b = scEl("button", null, o);
        b.onclick = () => {
          const r = scAnswer(session, i, { award: opts.award, awarded: opts.awarded, pos });
          if (r.right) render({ kind: "done", r });
          else { panel.querySelector(".sc-why")?.remove(); const w = scEl("p", "sc-why", `${SC_LINES.again} ${r.why}`); box.after(w); }
        };
        box.appendChild(b);
      });
      panel.appendChild(box);
      box.firstChild?.focus();
    } else if (view.kind === "done") {
      const r = view.r;
      panel.append(scEl("p", null, `${SC_LINES.right} ${r.why}`), scEl("div", "sc-stars", "★".repeat(r.stars) + "☆".repeat(3 - r.stars)));
      panel.appendChild(scEl("p", "sc-sub", r.firstTry ? `${SC_LINES.firstTry} First-try run: ${r.streak}.` : SC_LINES.rest));
      for (const b of r.badges) panel.appendChild(scEl("p", null, `${SC_LINES.badge}: ${b.name}`));
      if (r.trail.length) {
        panel.appendChild(scEl("p", "sc-sub", SC_LINES.trail));
        const ul = scEl("ul");
        for (const t of r.trail) ul.appendChild(scEl("li", null, `${t.title} · ${t.metres < 10 ? "right here" : `${t.metres} m ${t.dir}`}`));
        panel.appendChild(ul);
      }
      const row = scEl("div", "sc-row");
      const done = scEl("button", "sc-go", SC_LINES.done); done.onclick = close;
      row.appendChild(done);
      const href = opts.stationHref?.(L);
      if (href) { const a = scEl("a", null, "The full classroom station"); a.href = href; row.appendChild(a); }
      const board = scEl("a", null, "Your scoreboard"); board.href = opts.boardHref ?? "../scholar/index.html"; row.appendChild(board);
      panel.appendChild(row);
      done.focus();
    }
  }

  function open(id) {
    session = scStartSession(id ?? near?.id, { world, parish: opts.parish, site: near?.site, pos });
    if (!session) return false;
    chip.hidden = true; panel.hidden = false;
    render(scStep(session));
    return true;
  }
  function close() { panel.hidden = true; session = null; }

  chipGo.onclick = () => open();
  addEventListener("keydown", (e) => {
    if (e.code === "KeyL" && !e.repeat && near && panel.hidden && !chip.hidden) { e.preventDefault(); open(); }
    else if (e.code === "Escape" && !panel.hidden) close();
  });

  return {
    tick(x, z) {
      pos = [x, z];
      near = pathOn() ? scNearby(pos, lessons, opts.reach ?? SC_REACH)[0] ?? null : null;
      const show = !!near && panel.hidden;
      const text = show ? `${SC_LINES.offer} ${near.title} (L)` : "";
      if (show && chipText.textContent !== text) chipText.textContent = text;
      if (chip.hidden === show) chip.hidden = !show;
    },
    open, close, isOpen: () => !panel.hidden, chipLesson: () => near, lessons,
  };
}
