// Hidden treasures and easter eggs through the whole platform (console
// TREASURE, tools/briefs/frontier-brief.md, docs/treasures.md).
//
// The data is generated (shared/treasures-data.js, tools/gen_treasures.mjs):
// every treasure names its surface, world and area, how it is found, the
// verbatim lesson it teaches and where that line comes from. This module is
// the rest:
//
//   the ledger     one key, `vr-treasures-v1`, read and written through
//                  profiles.js's gtStorage(), so it is private to the signed-in
//                  learner, the device, or the demo tab (GT_PROFILE_KEYS lists it)
//   the gates      the frontier brief's shared contract `gate: { stations,
//                  programmes, quests, k12, note }`, answered by the shared gate
//                  engine (shared/skill-gates.js: qmIsOpen / qmMissing) from the
//                  learner's own records. A locked treasure is never found: it
//                  shows its note and a link to each station it needs.
//   the reveal     a small card that scales in with a glint, the lesson and the
//                  set progress; honours prefers-reduced-motion
//   the finders    DOM pages (glints, the hero constellation, a key sequence, a
//                  knock count), the Guide's secret questions, station plants in
//                  SmartCiti.X and Trade Skills, proximity/click markers in the
//                  four open worlds, arcade tokens and race finishes
//
// Nothing here touches a station's steps, selectables or score: plants and world
// markers raycast for themselves, exactly like shared/eggs.js's hard hats.
// Every top-level name starts with `tz` (the bundler shares one scope). The 3D
// finders take the three.js library from the caller as `T3`: this module is
// shared chrome and must never spell the library's global itself, or the
// bundler would load three.js on every flat page that carries the account chip.

import { gtStorage } from "./profiles.js";
import { qmIsOpen, qmMissing, qmSnapshot, qmInvalidate } from "./skill-gates.js";
import { TZ_TREASURES, TZ_SETS, TZ_SURFACES, TZ_EARLIER } from "./treasures-data.js";

export const TZ_KEY = "vr-treasures-v1";
const TZ_RECORDS_KEY = "vr-training-records-v1";
const tzHasDom = typeof document !== "undefined" && typeof window !== "undefined";

// ------------------------------------------------------------------ ledger

function tzStore(storage) {
  if (storage) return storage;
  try { return gtStorage(); } catch (_) { return null; }
}

export function tzLoad(storage) {
  try {
    const raw = JSON.parse(tzStore(storage)?.getItem(TZ_KEY) || "null");
    if (raw && raw.v === 1 && raw.found && typeof raw.found === "object") return { v: 1, found: { ...raw.found }, badges: { ...(raw.badges ?? {}) } };
  } catch (_) { /* rewrite below */ }
  return { v: 1, found: {}, badges: {} };
}

function tzSave(led, storage) {
  try { tzStore(storage)?.setItem(TZ_KEY, JSON.stringify(led)); } catch (_) { /* private mode — run unsaved */ }
}

export function tzById(id) { return TZ_TREASURES.find((t) => t.id === id) ?? null; }
export function tzFoundIds(storage) { return Object.keys(tzLoad(storage).found).filter((id) => tzById(id)); }
export function tzIsFound(id, storage) { return !!tzLoad(storage).found[id]; }

/**
 * Record a find. Idempotent; an unknown id is ignored. Completing a themed
 * set stamps its badge once. Returns { added, treasure, found, total, completed }.
 */
export function tzRecord(id, storage) {
  const t = tzById(id);
  const led = tzLoad(storage);
  if (!t) return { added: false, treasure: null, found: Object.keys(led.found).length, total: TZ_TREASURES.length, completed: [] };
  const added = !led.found[id];
  const completed = [];
  if (added) {
    led.found[id] = new Date().toISOString();
    for (const s of TZ_SETS) {
      if (led.badges[s.id] || !s.members.includes(id)) continue;
      if (s.members.every((m) => led.found[m])) { led.badges[s.id] = led.found[id]; completed.push(s); }
    }
    tzSave(led, storage);
  }
  return { added, treasure: t, found: Object.keys(led.found).length, total: TZ_TREASURES.length, completed };
}

export function tzClear(storage) { try { tzStore(storage)?.removeItem(TZ_KEY); } catch (_) { /* ignore */ } }

/**
 * What the Treasure Map may show: counts per surface and area, set progress,
 * and the found treasures' own names and lessons. Nothing about an unfound
 * treasure beyond the counts ever leaves this function — no name, no hint, no
 * trigger, no position.
 */
export function tzMapModel(storage) {
  const led = tzLoad(storage);
  const surfaces = TZ_SURFACES.map((s) => {
    const mine = TZ_TREASURES.filter((t) => t.surface === s.id);
    const areas = [...new Set(mine.map((t) => t.area))].map((area) => {
      const inArea = mine.filter((t) => t.area === area);
      return { area, total: inArea.length, found: inArea.filter((t) => led.found[t.id]).length };
    });
    return { id: s.id, name: s.name, total: mine.length, found: mine.filter((t) => led.found[t.id]).length, areas };
  });
  const sets = TZ_SETS.map((s) => ({ id: s.id, name: s.name, badge: s.badge, blurb: s.blurb, total: s.members.length,
    found: s.members.filter((m) => led.found[m]).length, complete: !!led.badges[s.id] }));
  const found = TZ_TREASURES.filter((t) => led.found[t.id]).map((t) => ({ id: t.id, name: t.name, surface: t.surface, world: t.world,
    area: t.area, lesson: t.lesson, tool: t.tool ?? null, at: led.found[t.id] }));
  return { total: TZ_TREASURES.length, count: found.length, surfaces, sets, found };
}

/**
 * The earlier egg layers (the hard hats, the field notes, Bay World's egg
 * field notes, the Deep's lanterns, Summit's notes, Redwood's tins), counted
 * read-only from each layer's own store through the same profile storage.
 * Counts only — `[{ id, name, where, total, found }]` — nothing is copied into
 * the treasure ledger and no unfound egg is named.
 */
export function tzEarlierEggs(storage) {
  const store = tzStore(storage);
  return TZ_EARLIER.map((e) => {
    let found = 0;
    try {
      const raw = JSON.parse(store?.getItem(e.key) || "null");
      const ids = e.ids ? new Set(e.ids) : null;
      if (e.shape === "list" && Array.isArray(raw)) found = new Set(raw.filter((x) => typeof x === "string" && (!ids || ids.has(x)))).size;
      else if (e.shape === "ledger" && Array.isArray(raw)) found = new Set(raw.map((r) => r?.id).filter((x) => typeof x === "string" && ids.has(x))).size;
      else if (e.shape === "byId" && raw?.byId) found = Object.entries(raw.byId).filter(([id, v]) => ids.has(id) && v?.done).length;
      else if (e.shape === "state" && Array.isArray(raw?.[e.field])) found = new Set(raw[e.field].filter((x) => ids.has(x))).size;
    } catch (_) { found = 0; }
    return { id: e.id, name: e.name, where: e.where, total: e.total, found: Math.min(found, e.total) };
  });
}

// ------------------------------------------------------------------ gates

function tzRecords(records) {
  if (Array.isArray(records)) return records;
  try { const r = JSON.parse(tzStore()?.getItem(TZ_RECORDS_KEY) || "[]"); return Array.isArray(r) ? r : []; } catch (_) { return []; }
}

/** Station ids the learner has completed (1+ star), from their own records. */
export function tzCompleted(records) {
  return new Set(tzRecords(records).filter((r) => (r?.stars | 0) >= 1 && r.simId).map((r) => String(r.simId)));
}

/**
 * The gate engine's snapshot: the learner's own stores through qmSnapshot(),
 * or — when a caller (the checker) hands in a records array — a snapshot
 * built from those records alone, so a gate can be tested without storage.
 */
export function tzGateSnapshot(records) {
  if (!Array.isArray(records)) { qmInvalidate(); return qmSnapshot(); }
  const stars = new Map();
  for (const r of records) if (r && r.simId) stars.set(String(r.simId), Math.max(stars.get(String(r.simId)) ?? 0, r.stars | 0));
  return { stars, questsDone: new Set(records.filter((r) => r?.questId && r.done).map((r) => r.questId)) };
}

/**
 * What still stands between the learner and a treasure's gate, as the engine's
 * display-ready rows `[{ kind, id, label, detail }]` (stations, K-12 stations,
 * programmes and quests alike). An empty list, or no gate, means open.
 */
export function tzGateMissing(gate, records) {
  if (!gate) return [];
  return qmMissing(gate, tzGateSnapshot(records));
}
export function tzGateOpen(gate, records) {
  if (!gate) return true;
  return qmIsOpen(gate, tzGateSnapshot(records));
}

// ------------------------------------------------------------------ links

/** The folder the homepage sits in, read off the Home chip (so it is right in every layout). */
function tzBase() {
  if (!tzHasDom) return "";
  const h = document.querySelector("#ctl-nav .home-chip, .home-chip")?.getAttribute("href") ?? "";
  if (!h || h.startsWith("#")) return "";
  return h.split(/[?#]/)[0].replace(/[^/]*$/, "");
}
/** The Treasure Map page beside the homepage. */
export function tzMapHref(base = tzBase()) { return `${base}treasures.html`; }
/** A station in the runner, in the folder layout or the flat dist layout. */
export function tzStationHref(id, base = tzBase()) {
  const flat = !base.includes("../");
  return flat ? `${base}smartcity-x.html?sim=${encodeURIComponent(id)}` : `${base}smartcity/index.html?sim=${encodeURIComponent(id)}`;
}

// ------------------------------------------------------------------ reveal

const tzCss = `
#tz-reveal{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:10050;width:min(420px,calc(100vw - 32px));pointer-events:auto}
#tz-reveal[hidden]{display:none}
#tz-reveal .tz-card{position:relative;overflow:hidden;background:#101b27;color:#f2f6fa;border:2px solid #f2c14b;border-radius:14px;padding:14px 16px 12px;
  font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.6);animation:tz-pop .55s cubic-bezier(.2,1.4,.4,1)}
#tz-reveal .tz-card::before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 20deg,rgba(242,193,75,.22) 30deg,transparent 40deg 110deg,rgba(242,193,75,.18) 120deg,transparent 130deg);animation:tz-spin 2.4s linear 1;pointer-events:none}
#tz-reveal h2{position:relative;margin:0 0 4px;font-size:18px;color:#ffd97a}
#tz-reveal p{position:relative;margin:4px 0}
#tz-reveal .tz-small{font-size:13px;color:#bcd0e0}
#tz-reveal .tz-row{position:relative;display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
#tz-reveal .tz-row a,#tz-reveal .tz-row button{min-height:36px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 14px system-ui,sans-serif;padding:0 12px;cursor:pointer;display:inline-flex;align-items:center;text-decoration:none}
#tz-reveal .tz-lock{color:#ffcf8a}
.tz-glint{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;margin:2px;padding:0;border:0;border-radius:50%;background:transparent;color:#f2c14b;opacity:.32;font:16px/1 system-ui,sans-serif;cursor:pointer;animation:tz-twinkle 3.2s ease-in-out infinite}
#tz-reveal .tz-row.tz-col{flex-direction:column;align-items:stretch;justify-content:flex-start}
#tz-reveal .tz-row.tz-col:empty{display:none}
#tz-constellation circle:focus-visible{outline:2px solid #ffd166;outline-offset:2px}
.tz-glint:hover,.tz-glint:focus-visible{opacity:1;outline:2px solid #ffd166;outline-offset:1px}
.tz-glint-fixed{position:fixed;right:10px;bottom:84px;z-index:9980}
#tz-constellation{position:absolute;right:4%;top:10%;width:150px;height:90px;z-index:2;overflow:visible}
#tz-constellation circle{fill:#fff6d6;opacity:.22;cursor:pointer;transition:opacity .2s,r .2s}
#tz-constellation circle:hover{opacity:.6}
#tz-constellation circle.tz-lit{opacity:1;fill:#ffd97a}
@keyframes tz-pop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes tz-spin{to{transform:rotate(360deg)}}
@keyframes tz-twinkle{0%,100%{opacity:.22}50%{opacity:.5}}
@media (prefers-reduced-motion:reduce){#tz-reveal .tz-card,#tz-reveal .tz-card::before,.tz-glint{animation:none}}
`;

function tzEnsureStyle() {
  if (!tzHasDom || document.getElementById("tz-style")) return;
  const s = document.createElement("style"); s.id = "tz-style"; s.textContent = tzCss; (document.head ?? document.body).appendChild(s);
}

function tzEl(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") e.textContent = v;
    else if (k === "on") for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if (v != null && v !== false) e.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of kids) if (c != null) e.append(c);
  return e;
}

let tzRevealTimer = null;
function tzCard(children, ms = 7000) {
  if (!tzHasDom || !document.body) return null;
  tzEnsureStyle();
  let box = document.getElementById("tz-reveal");
  if (!box) { box = tzEl("div", { id: "tz-reveal", role: "status", "aria-live": "polite" }); document.body.appendChild(box); }
  box.textContent = "";
  const card = tzEl("div", { class: "tz-card" }, ...children);
  box.append(card);
  box.hidden = false;
  clearTimeout(tzRevealTimer);
  tzRevealTimer = setTimeout(() => { box.hidden = true; }, ms);
  return box;
}
function tzCloseRow(extra = []) {
  return tzEl("div", { class: "tz-row" }, ...extra,
    tzEl("button", { type: "button", on: { click: () => { const b = document.getElementById("tz-reveal"); if (b) b.hidden = true; } } }, "Close"));
}

/** The reveal: name, lesson, where the line comes from, and the set it belongs to. */
export function tzReveal(t, r = {}) {
  if (!tzHasDom || !document.body) return null;
  const set = t.set ? TZ_SETS.find((s) => s.id === t.set) : null;
  const led = tzLoad();
  const setLine = set ? `${set.name}: ${set.members.filter((m) => led.found[m]).length} of ${set.members.length}.` : null;
  const kids = [
    tzEl("p", { class: "tz-small", text: `Treasure found — ${r.found ?? tzFoundIds().length} of ${TZ_TREASURES.length}` }),
    tzEl("h2", { text: t.name }),
  ];
  if (t.tool) kids.push(tzEl("p", { text: `Tool: ${t.tool}.` }));
  kids.push(tzEl("p", { text: t.lesson }));
  kids.push(tzEl("p", { class: "tz-small", text: `From ${t.source?.file ?? "the platform"}.` }));
  if (setLine) kids.push(tzEl("p", { class: "tz-small", text: setLine }));
  for (const s of r.completed ?? []) kids.push(tzEl("p", { text: `Set complete — badge earned: ${s.badge}.` }));
  kids.push(tzCloseRow([tzEl("a", { href: tzMapHref(), text: "Treasure Map" })]));
  return tzCard(kids);
}

/** A locked treasure: its note and a link to every station it needs. Never hidden, never found. */
export function tzLockNotice(t, records) {
  if (!tzHasDom || !document.body) return null;
  const missing = tzGateMissing(t.gate, records);
  const links = missing.map((m) => (m.kind === "station" || m.kind === "k12")
    ? tzEl("a", { href: tzStationHref(m.id), text: m.label ?? m.id.replace(/-/g, " ") })
    : tzEl("span", { class: "tz-small", text: m.detail ? `${m.label} (${m.detail})` : m.label }));
  return tzCard([
    tzEl("p", { class: "tz-small tz-lock", text: "Locked treasure" }),
    tzEl("h2", { text: t.name }),
    tzEl("p", { text: t.gate?.note ?? "Complete the stations below first." }),
    tzCloseRow(links),
  ], 9000);
}

/**
 * The one entry point every finder calls. A gated treasure whose gate is
 * still closed shows its lock and is not recorded. Returns tzRecord()'s
 * result plus `locked`.
 */
export function tzFind(id, { storage, records, silent = false } = {}) {
  const t = tzById(id);
  if (!t) return { added: false, locked: false, treasure: null };
  if (t.gate && !tzGateOpen(t.gate, records)) {
    if (!silent) tzLockNotice(t, records);
    return { added: false, locked: true, treasure: t, missing: tzGateMissing(t.gate, records) };
  }
  const r = tzRecord(id, storage);
  if (r.added && !silent) tzReveal(t, r);
  if (tzHasDom) {
    window.__treasuresTest = { ...(window.__treasuresTest ?? {}), last: id, found: r.found, total: r.total };
    try { window.dispatchEvent(new CustomEvent("tz:found", { detail: { id, added: r.added } })); } catch (_) { /* old browser */ }
  }
  return { ...r, locked: false };
}

// ------------------------------------------------------------------ the Guide

/** A secret question: returns a Guide-shaped answer (and finds the treasure), or null. */
export function tzGuideLore(question) {
  const q = ` ${String(question ?? "").toLowerCase().replace(/[^a-z0-9&' -]+/g, " ")} `;
  for (const t of TZ_TREASURES) {
    if (t.how !== "guide") continue;
    const w = t.trigger.words.some((x) => q.includes(` ${x} `) || q.includes(` ${x}s `));
    const n = t.trigger.names.some((x) => q.includes(x.replace(/[^a-z0-9&' -]+/g, " ")));
    if (!w || !n) continue;
    tzFind(t.id);
    return { text: `From the union registry, ${t.unionName ?? t.name}: ${t.lesson}`, links: [{ label: "Open the Treasure Map", href: tzMapHref() }],
      chunks: [], matched: true, treasure: t.id };
  }
  return null;
}

// ------------------------------------------------------------------ DOM finders

function tzAnchor(sel) {
  for (const s of String(sel).split(",").map((x) => x.trim()).filter(Boolean)) {
    const el = document.querySelector(s);
    if (el) return el;
  }
  return null;
}

function tzPlaceGlint(t) {
  if (document.querySelector(`[data-tz="${t.id}"]`)) return;
  const a = tzAnchor(t.trigger.anchor);
  if (!a) return;
  const b = tzEl("button", { type: "button", class: "tz-glint", "data-tz": t.id, "aria-label": "A small glint", title: "", text: "✦",
    on: { click: (e) => { e.preventDefault(); e.stopPropagation(); const r = tzFind(t.id); if (!r.locked) b.remove(); } } });
  if (a === document.body || a.tagName === "MAIN") { b.classList.add("tz-glint-fixed"); document.body.appendChild(b); }
  else a.insertAdjacentElement("afterend", b);
}

function tzConstellation(t) {
  const hero = tzAnchor(t.trigger.anchor);
  if (!hero || document.getElementById("tz-constellation")) return;
  if (getComputedStyle(hero).position === "static") hero.style.position = "relative";
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("id", "tz-constellation"); svg.setAttribute("viewBox", "0 0 150 90");
  // Screen readers get the shape and the count; each star is a focusable button.
  svg.setAttribute("role", "group"); svg.setAttribute("aria-label", "Seven faint stars in the shape of a jib crane. Light each one.");
  // A jib crane: mast, jib and hook — seven stars.
  const pts = [[20, 85], [20, 55], [20, 25], [60, 20], [100, 15], [140, 12], [100, 45]];
  const lit = new Set();
  pts.forEach(([x, y], i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 3.2);
    c.setAttribute("role", "button"); c.setAttribute("tabindex", "0"); c.setAttribute("aria-label", `Star ${i + 1} of ${pts.length}`); c.setAttribute("aria-pressed", "false");
    const light = (e) => {
      e.stopPropagation(); lit.add(i); c.classList.add("tz-lit"); c.setAttribute("aria-pressed", "true");
      if (lit.size === pts.length) tzFind(t.id);
    };
    c.addEventListener("click", light);
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); light(e); } });
    svg.appendChild(c);
  });
  hero.appendChild(svg);
}

function tzKnock(t) {
  const a = tzAnchor(t.trigger.anchor);
  if (!a || a.dataset.tzKnock) return;
  a.dataset.tzKnock = t.id;
  let hits = [];
  a.addEventListener("click", () => {
    const now = Date.now();
    hits = hits.filter((x) => now - x < t.trigger.within); hits.push(now);
    if (hits.length >= t.trigger.count) { hits = []; tzFind(t.id); }
  });
}

let tzKeysArmed = false;
function tzKeys(list) {
  if (tzKeysArmed || !list.length) return;
  tzKeysArmed = true;
  let buf = [];
  window.addEventListener("keydown", (e) => {
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
    buf.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (buf.length > 16) buf = buf.slice(-16);
    for (const t of list) {
      const seq = t.trigger.seq ?? String(t.trigger.word).split("");
      if (buf.length >= seq.length && seq.every((k, i) => buf[buf.length - seq.length + i] === k)) { buf = []; tzFind(t.id); }
    }
  });
}

/** Which surface this page is, read off its own DOM and path. */
export function tzDetectSurface() {
  if (!tzHasDom) return null;
  const p = (location.pathname || "").toLowerCase();
  if (document.getElementById("atlas-map")) return "atlas";
  if (document.getElementById("hero") && document.querySelector(".brandline")) return "home";
  if (/arcade/.test(p)) return "arcade";
  if (/(^|\/)race(\/|\.html)/.test(p)) return "race";
  if (/smartcity|trade-skills|\/trades\//.test(p)) return "runner";
  return null;
}

let tzRecordsTimer = null;
/** The records-watching finders (a perfect run), checked now and every few seconds. */
export function tzCheckRecords(records) {
  const list = tzRecords(records);
  for (const t of TZ_TREASURES) {
    if (t.how !== "records" || tzIsFound(t.id)) continue;
    if (t.trigger.rule === "perfect" && list.some((r) => (r.stars | 0) >= 3 && (r.errors | 0) === 0 && (r.hazardHits | 0) === 0)) tzFind(t.id, { records: list });
  }
}

/** Arm every DOM finder for this page. Idempotent; controls.js's account chip calls it on every page. */
export function tzArmPage(surface = tzDetectSurface()) {
  if (!tzHasDom || !surface) return 0;
  tzEnsureStyle();
  const mine = TZ_TREASURES.filter((t) => t.surface === surface && !tzIsFound(t.id));
  for (const t of mine) {
    if (t.how === "glint") tzPlaceGlint(t);
    else if (t.how === "constellation") tzConstellation(t);
    else if (t.how === "clicks") tzKnock(t);
  }
  tzKeys(TZ_TREASURES.filter((t) => t.surface === surface && t.how === "keys"));
  if (surface === "runner") { tzCheckRecords(); clearInterval(tzRecordsTimer); tzRecordsTimer = setInterval(() => tzCheckRecords(), 5000); }
  return mine.length;
}

// ------------------------------------------------------------------ arcade, race and field lessons

/** A field lesson's check question answered right (Sierra Summit, Redwood Reach): a quiet find with no marker. */
export function tzLessonAnswered(lessonId) {
  const t = TZ_TREASURES.find((x) => x.how === "lesson" && x.trigger.lesson === lessonId);
  return t ? tzFind(t.id) : null;
}
/** A cabinet round finished (Break Room Arcade). */
export function tzArcadeRound(cabinetId) {
  const t = TZ_TREASURES.find((x) => x.how === "arcade" && x.trigger.cabinet === cabinetId);
  return t ? tzFind(t.id) : null;
}
/** A race finished on a course (Night Highway Circuit); a mirrored course counts as its own original. */
export function tzRaceFinish(trackId) {
  const id = String(trackId ?? "").replace(/-mirror$/, "").replace(/^mirror-/, "");
  const t = TZ_TREASURES.find((x) => x.how === "race" && x.trigger.track === id);
  return t ? tzFind(t.id) : null;
}

// ------------------------------------------------------------------ 3D finders

/** Every live 3D marker on screen: { id, mesh, T3 (the three.js library), camera() }. */
const tzLive = [];

if (tzHasDom && typeof window.addEventListener === "function") {
  window.addEventListener("click", (e) => {
    if (!tzLive.length) return;
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    for (let i = tzLive.length - 1; i >= 0; i -= 1) {
      const m = tzLive[i];
      if (!m.mesh.parent) { tzLive.splice(i, 1); continue; }
      if (!m.mesh.visible) continue;
      const camera = m.camera?.();
      if (!camera) continue;
      const T3 = m.T3;
      const ray = new T3.Raycaster();
      ray.setFromCamera(new T3.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), camera);
      if (!ray.intersectObject(m.mesh, true).length) continue;
      const r = tzFind(m.id);
      if (!r.locked) m.mesh.visible = false;
      return;
    }
  });
}

function tzMarker(T3, t, size) {
  const locked = t.gate && !tzGateOpen(t.gate);
  const mesh = new T3.Mesh(
    new T3.OctahedronGeometry(size, 0),
    new T3.MeshBasicMaterial({ color: locked ? 0x8a96a3 : 0xf2c14b, transparent: true, opacity: 0.92 }),
  );
  mesh.userData.treasure = t.id;
  mesh.name = `treasure:${t.id}`;
  return mesh;
}

/** prefers-reduced-motion: the markers hold still (and the reveal card appears without its animation). */
function tzReducedMotion() {
  try { return !!(tzHasDom && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch (_) { return false; }
}

function tzSpin(mesh, y0) {
  if (typeof requestAnimationFrame !== "function" || tzReducedMotion()) return;
  const t0 = performance.now() / 1000;
  const step = () => {
    if (!mesh.parent) return;
    const t = performance.now() / 1000 - t0;
    mesh.rotation.y = t * 1.1;
    mesh.position.y = y0 + Math.sin(t * 1.7) * 0.06;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function tzDefaultCamera() {
  if (!tzHasDom) return null;
  return window.__smartcityTest?.camera?.() ?? window.__tradesTest?.camera?.() ?? window.__holodeckTest?.camera?.()
    ?? window.__summitTest?.camera ?? window.__redwoodTest?.app?.camera ?? null;
}

/**
 * A station or room calls this once after it is built:
 *     tzPlantHost(root, T3, `smartcity/${room.id}`);   // T3: the caller's three.js library
 * Plants every treasure whose trigger.host matches (usually none, never more
 * than two), hidden if already found. Returns the number planted.
 */
export function tzPlantHost(root, T3, host, camera = tzDefaultCamera) {
  if (!root || !T3) return 0;
  let n = 0;
  for (const t of TZ_TREASURES) {
    if (t.how !== "plant" || t.trigger.host !== host) continue;
    const mesh = tzMarker(T3, t, 0.07);
    const [x, y, z] = t.trigger.pos;
    mesh.position.set(x, y, z);
    mesh.visible = !tzIsFound(t.id);
    root.add(mesh);
    tzLive.push({ id: t.id, mesh, T3, camera });
    tzSpin(mesh, y);
    n += 1;
  }
  if (tzHasDom) window.__treasuresTest = { ...(window.__treasuresTest ?? {}), planted: { host, n } };
  return n;
}

/**
 * An open world calls this once after its scene is built:
 *     tzWatchWorld("bayworld", { scene, THREE: T3, pos: () => [x, z], camera: () => cam, groundAt: (x, z) => y });
 * (`THREE` is only the option's name; its value is the caller's three.js library.)
 * Plants a marker at each of the world's treasures and finds one when the
 * learner comes within its radius (or clicks it). A locked one shows its lock
 * once per visit. Returns the markers planted.
 */
export function tzWatchWorld(world, { scene, THREE: T3, pos, camera, groundAt = null, size = 0.6, lift = 1.4, key = TZ_LOOK_KEY, near = 90 } = {}) {
  if (!scene || !T3) return 0;
  const mine = TZ_TREASURES.filter((t) => t.how === "proximity" && t.trigger.world === world);
  const markers = new Map();
  for (const t of mine) {
    const mesh = tzMarker(T3, t, size);
    const y = (groundAt ? Number(groundAt(t.trigger.x, t.trigger.z)) || 0 : 0) + lift;
    mesh.position.set(t.trigger.x, y, t.trigger.z);
    mesh.visible = !tzIsFound(t.id);
    scene.add(mesh);
    markers.set(t.id, mesh);
    tzLive.push({ id: t.id, mesh, T3, camera });
    tzSpin(mesh, y);
  }
  const warned = new Set();
  const tick = () => {
    const p = typeof pos === "function" ? pos() : null;
    if (!p) return;
    for (const t of mine) {
      const mesh = markers.get(t.id);
      if (!mesh?.visible) continue;
      if (Math.hypot(p[0] - t.trigger.x, p[1] - t.trigger.z) > t.trigger.r) continue;
      if (t.gate && !tzGateOpen(t.gate)) { if (!warned.has(t.id)) { warned.add(t.id); tzLockNotice(t); } continue; }
      tzFind(t.id);
      mesh.visible = false;
    }
  };
  if (typeof setInterval === "function") setInterval(tick, 400);
  tzWatched.set(world, { mine, markers, pos, near });
  tzArmLookKey(key);
  if (tzHasDom) window.__treasuresTest = { ...(window.__treasuresTest ?? {}), world, markers: markers.size, tick, lookAround: () => tzLookAround(world) };
  return markers.size;
}

// ------------------------------------------------------------------ look around (no pointer needed)

/** The worlds being watched on this page: world → { mine, markers, pos, near }. */
const tzWatched = new Map();
export const TZ_LOOK_KEY = "KeyL";

/**
 * Lists the still-visible markers within reach as buttons in the reveal
 * card's chrome — distance only, never a name, so nothing is given away that
 * the marker on screen does not — and finds (or shows the lock of) the one
 * chosen. Every marker is reachable without a pointer this way.
 * Returns the rows listed, or -1 when nothing is watched.
 */
export function tzLookAround(world = [...tzWatched.keys()][0]) {
  const w = tzWatched.get(world);
  if (!w || !tzHasDom || !document.body) return -1;
  const p = typeof w.pos === "function" ? w.pos() : null;
  const rows = !p ? [] : w.mine
    .map((t) => ({ t, d: Math.hypot(p[0] - t.trigger.x, p[1] - t.trigger.z) }))
    .filter(({ t, d }) => d <= w.near && w.markers.get(t.id)?.visible)
    .sort((a, b) => a.d - b.d).slice(0, 8);
  const buttons = rows.map(({ t, d }, i) => {
    const locked = t.gate && !tzGateOpen(t.gate);
    return tzEl("button", { type: "button", "data-tz-look": t.id, text: `Marker ${i + 1}: ${Math.round(d)} m away${locked ? " (locked)" : ""}`,
      on: { click: () => { const r = tzFind(t.id); if (!r.locked) { const m = w.markers.get(t.id); if (m) m.visible = false; } } } });
  });
  const box = tzCard([
    tzEl("p", { class: "tz-small", text: "Look around" }),
    tzEl("h2", { text: rows.length ? `${rows.length} treasure marker${rows.length === 1 ? "" : "s"} within ${w.near} m` : `No treasure markers within ${w.near} m` }),
    tzEl("p", { class: "tz-small", text: rows.length ? "Choose one to pick it up where you stand." : "Walk on and look again." }),
    tzEl("div", { class: "tz-row tz-col" }, ...buttons),
    tzCloseRow(),
  ], 20000);
  box?.querySelector("[data-tz-look]")?.focus();
  return rows.length;
}

let tzLookArmed = false;
function tzArmLookKey(code) {
  if (tzLookArmed || !tzHasDom || !code) return;
  tzLookArmed = true;
  window.addEventListener("keydown", (e) => {
    if (e.code !== code || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
    tzLookAround();
  });
}
