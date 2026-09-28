// The Motor Pool board (console MOTORPOOL): every drivable in the registry as
// a row — locked with its gate note and a link to each qualifying station, or
// open with the pre-trip checklist step and a Drive / Helm button. DOM only:
// no three.js is named here (the bundler adds the three.js import to any
// module whose text spells it), so the board rides in any world's bundle.
//
//   dvMountMotorPool({ el, world, page, storage, onDrive, onHelm, regatta })
//
// `onDrive(entry)` is called once the learner has ticked every pre-trip item
// on an open road/site/rail entry; `onHelm(entry)` for a watercraft (Bay
// World links the Regatta instead when it has no helm of its own). Pure
// helpers (dvBoardRows, dvPretripHtml, dvBoardCounts) render HTML strings so
// tools/check_drivables.mjs can assert the board without a browser.
import { DV_DRIVABLES, DV_GATED, dvById } from "./drivables-data.js";
import { qmMissing, qmSnapshot, qmLabel } from "./skill-gates.js";
import { lkStationLink } from "./links.js";

const dvEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const DV_GATE_BY_DRIVABLE = new Map(DV_GATED.map((g) => [g.drivable, g]));

/** The board's sections, in order. */
export const DV_BOARD_SECTIONS = [
  { id: "road", title: "Road", kinds: ["road"] },
  { id: "site", title: "Site and plant", kinds: ["site"] },
  { id: "rail", title: "Rail", kinds: ["rail"] },
  { id: "water", title: "Watercraft", kinds: ["water"] },
];

/** Open / locked / total per section for the given snapshot. */
export function dvBoardCounts(snap = qmSnapshot()) {
  const out = {};
  for (const sec of DV_BOARD_SECTIONS) {
    const list = DV_DRIVABLES.filter((d) => sec.kinds.includes(d.kind));
    const open = list.filter((d) => !qmMissing(d.gate, snap).length).length;
    out[sec.id] = { open, locked: list.length - open, total: list.length };
  }
  return out;
}

/** The pre-trip checklist as HTML: one checkbox per item, the drive button disabled until every box is ticked. */
export function dvPretripHtml(entry) {
  const water = entry.kind === "water";
  return `<div class="dv-pretrip" data-dv-pretrip="${dvEsc(entry.id)}"><h4>${dvEsc(entry.pretrip.title)} — ${dvEsc(entry.name)}</h4>` +
    `<p class="dv-meta">Walk the list before the wheels turn. Limits read per the plan, the manual and the placard.</p>` +
    `<ul class="dv-checks">${entry.pretrip.items.map((it, i) => `<li><label><input type="checkbox" data-dv-check="${i}"> ${dvEsc(it)}</label></li>`).join("")}</ul>` +
    `<button class="dv-btn" data-dv-go="${dvEsc(entry.id)}" disabled>${water ? "Take the helm" : "Drive"}</button></div>`;
}

function dvTradesHtml(entry) {
  if (entry.trades.length) return entry.trades.map((t) => `<span class="dv-trade">${dvEsc(t.toUpperCase())}</span>`).join(" ");
  return `<span class="dv-meta">${dvEsc(entry.tradeNote ?? "")}</span>`;
}

/** One row: name, class, trades, the gate state, and the pre-trip step when open. */
export function dvRowHtml(entry, snap, { from = "bayworld", page = null, regatta = null } = {}) {
  const missing = qmMissing(entry.gate, snap);
  const locked = missing.length > 0;
  const water = entry.kind === "water";
  let body;
  if (locked) {
    body = `<div class="dv-note">${dvEsc(entry.gate.note)}</div><div class="dv-meta">Qualify at:</div><ul class="dv-links">` +
      missing.map((m) => m.kind === "station" || m.kind === "k12"
        ? `<li><a href="${dvEsc(lkStationLink(m.id, { from, page }))}">${dvEsc(m.label ?? qmLabel(m.id))}</a>${m.kind === "k12" ? " (K-12 lesson)" : ""}</li>`
        : `<li>${dvEsc(m.label ?? m.id)}</li>`).join("") + "</ul>";
  } else if (water && regatta) {
    body = `<div class="dv-meta">Available. Pre-departure, then the helm.</div><button class="dv-btn" data-dv-open="${dvEsc(entry.id)}">${dvEsc(entry.pretrip.title)}</button> <a class="dv-btn dv-ghost" href="${dvEsc(regatta)}">Helm in the Bay Regatta</a>`;
  } else {
    body = `<div class="dv-meta">Available. ${dvEsc(entry.pretrip.title)} first, then ${water ? "the helm" : "the wheel"}.</div><button class="dv-btn" data-dv-open="${dvEsc(entry.id)}">${dvEsc(entry.pretrip.title)}</button>`;
  }
  return `<div class="dv-row${locked ? " dv-locked" : ""}" data-dv-id="${dvEsc(entry.id)}"><div class="dv-title">${locked ? '<span class="dv-lock" aria-label="locked">&#9679;</span>' : ""}${dvEsc(entry.name)}</div>` +
    `<div class="dv-meta">${dvEsc(entry.class)} · ${locked ? "locked" : "available"} · ${dvTradesHtml(entry)}</div>${body}<div class="dv-slot"></div></div>`;
}

/** Every section's rows as one HTML string (the board's body). */
export function dvBoardRows(snap = qmSnapshot(), opts = {}) {
  const counts = dvBoardCounts(snap);
  return DV_BOARD_SECTIONS.map((sec) => {
    const list = DV_DRIVABLES.filter((d) => sec.kinds.includes(d.kind));
    const c = counts[sec.id];
    return `<section class="dv-section" data-dv-section="${sec.id}"><h3>${dvEsc(sec.title)} <span class="dv-meta">${c.open} of ${c.total} available</span></h3>${list.map((d) => dvRowHtml(d, snap, opts)).join("")}</section>`;
  }).join("");
}

let dvCssDone = false;
function dvEnsureCss() {
  if (dvCssDone || typeof document === "undefined") return;
  dvCssDone = true;
  const st = document.createElement("style");
  st.textContent = `
  .dv-board h3{margin:14px 0 6px;font-size:15px}.dv-board h4{margin:8px 0 4px;font-size:14px}
  .dv-row{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 12px;margin:6px 0;background:rgba(255,255,255,.04)}
  .dv-row.dv-locked{opacity:.85}.dv-title{font-weight:600}.dv-lock{color:#f0b323;margin-right:6px;font-size:10px;vertical-align:middle}
  .dv-meta{font-size:12px;opacity:.8}.dv-note{margin:4px 0;font-size:13px}.dv-links{margin:4px 0 0 18px;padding:0;font-size:13px}
  .dv-trade{display:inline-block;font-size:11px;padding:1px 6px;border-radius:999px;border:1px solid rgba(255,255,255,.25);margin-right:3px}
  .dv-btn{min-height:44px;padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.12);color:inherit;font:inherit;cursor:pointer;margin-top:6px;display:inline-block;text-decoration:none}
  .dv-btn[disabled]{opacity:.45;cursor:default}.dv-ghost{background:transparent}
  .dv-checks{list-style:none;margin:6px 0;padding:0}.dv-checks li{margin:6px 0;font-size:13px}.dv-checks input{width:18px;height:18px;vertical-align:middle;margin-right:8px}
  .dv-filter{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.dv-filter button{min-height:36px;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:transparent;color:inherit;font:inherit}
  .dv-filter button[aria-pressed="true"]{background:rgba(255,255,255,.18)}`;
  document.head.appendChild(st);
}

/**
 * Mount the board into `el`. Re-renders from the live skill-gate snapshot
 * each time it opens (`api.refresh()`), so a station passed in another tab
 * shows as available on the next open. Returns `{ refresh, el }`.
 */
export function dvMountMotorPool({ el, world = "bayworld", page = null, storage = null, onDrive = null, onHelm = null, regatta = null } = {}) {
  if (!el) return null;
  dvEnsureCss();
  el.classList.add("dv-board");
  let filter = "all";
  const render = () => {
    const snap = qmSnapshot(storage);
    const counts = dvBoardCounts(snap);
    const total = Object.values(counts).reduce((a, c) => a + c.total, 0), open = Object.values(counts).reduce((a, c) => a + c.open, 0);
    el.innerHTML = `<p class="dv-meta">${open} of ${total} drivables available. A vehicle is available once its pre-trip station is on your passport; locked rows link to the station.</p>` +
      `<div class="dv-filter" role="group" aria-label="Show">${[["all", "All"], ...DV_BOARD_SECTIONS.map((s) => [s.id, s.title])].map(([id, t]) => `<button data-dv-filter="${id}" aria-pressed="${filter === id}">${dvEsc(t)}</button>`).join("")}</div>` +
      dvBoardRows(snap, { from: world, page, regatta });
    for (const sec of el.querySelectorAll("[data-dv-section]")) sec.hidden = filter !== "all" && sec.dataset.dvSection !== filter;
  };
  el.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-dv-filter],[data-dv-open],[data-dv-go]");
    if (!t) return;
    if (t.dataset.dvFilter) { filter = t.dataset.dvFilter; render(); return; }
    if (t.dataset.dvOpen) {
      const entry = dvById(t.dataset.dvOpen);
      const row = el.querySelector(`[data-dv-id="${entry.id}"] .dv-slot`);
      if (row) { row.innerHTML = dvPretripHtml(entry); t.hidden = true; }
      return;
    }
    if (t.dataset.dvGo) {
      const entry = dvById(t.dataset.dvGo);
      if (entry.kind === "water") onHelm?.(entry); else onDrive?.(entry);
    }
  });
  el.addEventListener("change", (ev) => {
    const box = ev.target.closest("[data-dv-check]");
    if (!box) return;
    const wrap = box.closest("[data-dv-pretrip]");
    const all = [...wrap.querySelectorAll("[data-dv-check]")].every((c) => c.checked);
    wrap.querySelector("[data-dv-go]").disabled = !all;
  });
  render();
  return { refresh: render, el };
}

/** The gate item for a drivable id (for a lock toast or a map pin). */
export function dvGateItem(id) { return DV_GATE_BY_DRIVABLE.get(id) ?? null; }
