// The lock UI for skill gates (docs/skill-gates.md): a "Side games" chip in
// the shared nav, a quest-log panel listing every gated item in a world —
// locked rows show a lock, the one-line reason and a link to each required
// station; open rows play a short safe-practice round — a "Skills to unlock"
// roll-up, the lock toast, board rows a job board can append, and a map pin.
//
// DOM only, no three.js. The gate logic stays in skill-gates.js. Names are
// prefixed `qm` (the bundler shares one scope).

import { qmSnapshot, qmMissing, qmIsOpen, qmSkillsToUnlock, qmLedger, qmFinishGame, qmInvalidate } from "./skill-gates.js";
import { qmRounds } from "./side-games-data.js";
import { lkStationLink } from "./links.js";

const QM_LOCK_SVG = '<svg class="qm-lock" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 7V5a4 4 0 1 1 8 0v2h.5A1.5 1.5 0 0 1 14 8.5v5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-5A1.5 1.5 0 0 1 3.5 7H4Zm2 0h4V5a2 2 0 1 0-4 0v2Z"/></svg>';

const qmCss = `
#qm-chip{height:32px;padding:0 12px;border-radius:16px;border:1px solid rgba(255,255,255,.35);background:rgba(10,20,30,.78);color:#fff;font:700 13px/1 system-ui,sans-serif;cursor:pointer}
#qm-chip.qm-float{position:fixed;top:calc(48px + env(safe-area-inset-top,0px));left:10px;z-index:9985}
#qm-chip:hover{background:rgba(79,209,255,.3)}
#qm-chip .qm-lock{vertical-align:-2px;margin-right:5px}
@media (max-width:520px){#qm-chip{width:32px;padding:0}#qm-chip .qm-chip-text{display:none}#qm-chip .qm-lock{margin:0}}
#qm-panel{position:fixed;inset:0;z-index:10040;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:12px}
#qm-panel[hidden]{display:none}
#qm-panel .qm-box{background:#0f1a24;color:#e9f1f7;border:1px solid rgba(160,210,235,.35);border-radius:14px;width:min(640px,100%);max-height:calc(100vh - 24px);overflow:auto;padding:16px 18px;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
#qm-panel h2{margin:0 0 4px;font-size:18px} #qm-panel h3{margin:16px 0 6px;font-size:15px}
#qm-panel .qm-sub{color:#a9bccb;margin:0 0 10px}
.qm-row{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px;margin:8px 0;background:rgba(255,255,255,.03)}
.qm-row.qm-locked{border-style:dashed;opacity:.95}
.qm-row .qm-title{font-weight:700;display:flex;gap:6px;align-items:center}
.qm-row .qm-note{color:#ffd79a;margin:4px 0}
.qm-row .qm-meta{color:#a9bccb;font-size:12px}
.qm-row a{color:#7fd3ff}
.qm-row ul{margin:4px 0 0 18px;padding:0}
.qm-btn{margin-top:6px;padding:6px 12px;border-radius:8px;border:1px solid rgba(127,211,255,.6);background:rgba(127,211,255,.12);color:#fff;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer}
.qm-btn:hover{background:rgba(127,211,255,.3)}
.qm-done{color:#8fe3a1;font-weight:600}
.qm-opt{display:block;width:100%;text-align:left;margin:6px 0}
#qm-toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10030;max-width:min(520px,calc(100vw - 24px));background:#1b2733;color:#fff;border:1px solid #ffb44d;border-radius:10px;padding:10px 14px;font:14px/1.4 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4)}
#qm-toast[hidden]{display:none} #qm-toast a{color:#7fd3ff}
`;

function qmEsc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function qmEnsureCss() {
  if (typeof document === "undefined" || document.getElementById("qm-css")) return;
  const st = document.createElement("style");
  st.id = "qm-css";
  st.textContent = qmCss;
  document.head.appendChild(st);
}

/** The link list for a missing requirement: stations open the runner, a quest or programme names itself. */
function qmMissingHtml(missing, { from = null, page = null } = {}) {
  return missing.map((m) => {
    if (m.kind === "station" || m.kind === "k12") {
      const href = lkStationLink(m.id, { from, page });
      return `<li><a href="${qmEsc(href)}">${qmEsc(m.label)}</a>${m.kind === "k12" ? " (K-12 lesson)" : ""}</li>`;
    }
    if (m.kind === "programme") return `<li>Programme: ${qmEsc(m.label)} — ${qmEsc(m.detail)}</li>`;
    return `<li>Quest: ${qmEsc(m.label)}</li>`;
  }).join("");
}

/** One board row (a job board or the quest log): locked with its reason and links, or open. */
export function qmRowHtml(item, snap, opts = {}) {
  const missing = qmMissing(item.gate, snap);
  const led = qmLedger(opts.storage);
  const rec = led.done[item.id];
  const locked = missing.length > 0;
  const where = item.siteName ?? String(item.site ?? "").replace(/-/g, " ");
  let body;
  if (locked) {
    body = `<div class="qm-note">${qmEsc(item.gate.note)}</div><div class="qm-meta">Complete to unlock:</div><ul>${qmMissingHtml(missing, opts)}</ul>`;
  } else {
    const done = rec?.clean ? `<span class="qm-done">Done — ${qmEsc(item.reward?.cosmetic ?? "reward earned")}</span>` : rec ? `<span class="qm-meta">Best: ${rec.score} of ${rec.of} safe calls — every call safe earns the reward.</span>` : "";
    body = `<div>${qmEsc(item.summary ?? item.steps?.[0]?.text ?? "")}</div><div class="qm-meta">Scored on safe practice. Reward: ${qmEsc(item.reward?.cosmetic ?? "")}</div>${done}<br><button class="qm-btn" data-qm-play="${qmEsc(item.id)}">${rec ? "Play again" : "Play"}</button>`;
  }
  return `<div class="qm-row${locked ? " qm-locked" : ""}" data-qm-id="${qmEsc(item.id)}"><div class="qm-title">${locked ? QM_LOCK_SVG : ""}${qmEsc(item.title)}</div><div class="qm-meta">${qmEsc(where)}${locked ? " · locked" : " · open"}</div>${body}</div>`;
}

/** Append the gated items to a job board's list element as board rows. */
export function qmBoardRows(el, items, opts = {}) {
  if (!el || !items?.length) return;
  qmEnsureCss();
  const snap = qmSnapshot(opts.storage);
  const wrap = document.createElement("div");
  wrap.className = "qm-board";
  wrap.innerHTML = `<h3>Side games here</h3>${items.map((it) => qmRowHtml(it, snap, opts)).join("")}`;
  el.appendChild(wrap);
}

/** The lock toast: the reason and a link to each required station. */
export function qmLockToast(item, opts = {}) {
  if (typeof document === "undefined") return;
  qmEnsureCss();
  let el = document.getElementById("qm-toast");
  if (!el) { el = document.createElement("div"); el.id = "qm-toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  const missing = qmMissing(item.gate, qmSnapshot(opts.storage));
  if (!missing.length) return;
  el.innerHTML = `<b>${QM_LOCK_SVG} ${qmEsc(item.title)} is locked.</b><div>${qmEsc(item.gate.note)}</div><ul style="margin:4px 0 0 18px;padding:0">${qmMissingHtml(missing, opts)}</ul>`;
  el.hidden = false;
  clearTimeout(qmLockToast.t);
  qmLockToast.t = setTimeout(() => { el.hidden = true; }, opts.ms ?? 7000);
}

/** A map pin on a 2D canvas: a padlock when locked, a star when open. */
export function qmDrawPin(ctx, x, y, open) {
  ctx.save();
  ctx.fillStyle = open ? "#8fe3a1" : "#ffb44d";
  ctx.strokeStyle = "rgba(0,0,0,.7)";
  ctx.lineWidth = 1.5;
  if (open) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 7, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillRect(x - 5, y - 1, 10, 8); ctx.strokeRect(x - 5, y - 1, 10, 8);
    ctx.beginPath(); ctx.arc(x, y - 2, 3.5, Math.PI, 0); ctx.strokeStyle = "#ffb44d"; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}

/**
 * Mount the "Side games" chip and the quest-log panel for one world.
 * `items`: the world's gated items (side games or gated quests).
 * `from`/`page`: the "Back to <world>" hand-off every station link carries.
 * Returns `{ open, close, refresh, toast }`.
 */
export function qmMountSideGames({ world, worldName = world, items, from = world, page = null, storage = null, onDone = null } = {}) {
  if (typeof document === "undefined" || !items?.length) return null;
  qmEnsureCss();
  const opts = { from, page, storage };
  const chip = document.createElement("button");
  chip.id = "qm-chip";
  chip.type = "button";
  // Icon-only on a phone so the shared nav stays one line (check_ui overlap at 360 px).
  chip.innerHTML = `${QM_LOCK_SVG}<span class="qm-chip-text">Side games</span>`;
  chip.setAttribute("aria-label", "Side games");
  chip.title = "Side games";
  chip.setAttribute("aria-haspopup", "dialog");
  const nav = document.getElementById("ctl-nav");
  if (nav) nav.appendChild(chip); else { chip.classList.add("qm-float"); document.body.appendChild(chip); }

  const panel = document.createElement("div");
  panel.id = "qm-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", `Side games in ${worldName}`);
  document.body.appendChild(panel);

  function render() {
    qmInvalidate();
    const snap = qmSnapshot(storage);
    const open = items.filter((it) => qmIsOpen(it.gate, snap));
    const locked = items.filter((it) => !qmIsOpen(it.gate, snap));
    const skills = qmSkillsToUnlock(items, snap);
    const cos = qmLedger(storage).cosmetics;
    panel.innerHTML = `<div class="qm-box"><h2>Side games in ${qmEsc(worldName)}</h2>
      <p class="qm-sub">${open.length} open · ${locked.length} locked · scored on safe practice, never on harm. Finish a station to open its games.</p>
      ${open.map((it) => qmRowHtml(it, snap, opts)).join("")}
      ${locked.map((it) => qmRowHtml(it, snap, opts)).join("")}
      <h3>Skills to unlock</h3>
      ${skills.length ? `<ul class="qm-skills">${skills.map((s) => `<li>${s.kind === "station" || s.kind === "k12" ? `<a href="${qmEsc(lkStationLink(s.id, opts))}">${qmEsc(s.label)}</a>` : qmEsc(s.label)}${s.detail ? ` (${qmEsc(s.detail)})` : ""} — opens ${s.opens.length}: ${qmEsc(s.opens.join(", "))}</li>`).join("")}</ul>` : "<p>Everything here is open.</p>"}
      ${cos.length ? `<h3>Cosmetics earned</h3><p>${qmEsc(cos.join(" · "))}</p>` : ""}
      <button class="qm-btn" data-qm-close>Close</button></div>`;
  }

  function play(item) {
    const rounds = qmRounds(item);
    let i = 0, safe = 0;
    const box = panel.querySelector(".qm-box");
    const step = () => {
      if (i >= rounds.length) {
        const res = qmFinishGame(item, { score: safe, of: rounds.length }, storage);
        box.innerHTML = `<h2>${qmEsc(item.title)}</h2><p>${safe} of ${rounds.length} safe calls.</p><p>${res.clean ? `Every call safe — you earned the <b>${qmEsc(res.cosmetic)}</b>.` : "A safe crew replays the call it missed. Try again for the reward."}</p><button class="qm-btn" data-qm-back>Back to the list</button>`;
        onDone?.(item, res);
        return;
      }
      const r = rounds[i];
      box.innerHTML = `<h2>${qmEsc(item.title)}</h2><p class="qm-sub">Call ${i + 1} of ${rounds.length}</p><p>${qmEsc(r.prompt)}</p>${r.options.map((o, k) => `<button class="qm-btn qm-opt" data-qm-opt="${k}">${qmEsc(o.text)}</button>`).join("")}`;
      box.querySelectorAll("[data-qm-opt]").forEach((b) => b.addEventListener("click", () => {
        if (r.options[+b.dataset.qmOpt].safe) safe += 1;
        i += 1; step();
      }));
    };
    step();
  }

  panel.addEventListener("click", (e) => {
    const t = e.target.closest?.("[data-qm-play],[data-qm-close],[data-qm-back]");
    if (e.target === panel || t?.hasAttribute("data-qm-close")) { panel.hidden = true; return; }
    if (t?.hasAttribute("data-qm-back")) { render(); return; }
    const id = t?.getAttribute("data-qm-play");
    const item = id && items.find((x) => x.id === id);
    if (item) { if (qmIsOpen(item.gate, qmSnapshot(storage))) play(item); else qmLockToast(item, opts); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) panel.hidden = true; });
  chip.addEventListener("click", () => { render(); panel.hidden = false; panel.querySelector("button")?.focus(); });

  return {
    open() { render(); panel.hidden = false; },
    close() { panel.hidden = true; },
    refresh: render,
    toast: (item) => qmLockToast(item, opts),
  };
}
