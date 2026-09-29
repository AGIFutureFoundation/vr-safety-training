// DRILLS — timed scenario drills for first responders, disaster relief and UN training (console DRILLS,
// docs/consoles/DRILLS.md). SmartCiti.X Powered by AGI Corp.
//
// SEAMS (documented shapes):
//
//   drDrills() -> DR_DRILLS            [{ id, name, kind, paths: [STORYLINE path id], briefing,
//                                        objectives: [{ id, title, station, step, seconds, role, practice, safe, unsafe, kiosk? }] }]
//   drDrill(id) -> drill | null
//   drPlacesFor(parishId) -> [{ drill, parish, site }]      every drill placed in this map
//   drDrillsFor(pathId, parishId) -> [{ drill, parish, site }]  offered on this STORYLINE path here (all of them when
//                                        the path is null or Just Roam — the world stays open)
//   drTimer(objective, elapsedSeconds) -> { left, late }
//   drObjectivePoints(objective, { safe, seconds }) -> 100 safe and on time | 60 safe and late | 0 unsafe
//   drScore(drill, results) -> { points, max, score (0..100), passed (score >= DR_PASS) }   results: { [objectiveId]: { safe, seconds } }
//   drDebrief(drill, results) -> { wentWell: [objective title], improvement: { objective, text } | null, score }
//   drRecord(drillId, result, { attemptId }) -> { best, award }   best score kept in the passport's storage under
//                                        `vr-passport-drills-v1`; the award goes through drSetRecorder(fn) (the page passes ppAward)
//   drDeanModules() -> [{ id, title, kind: "drill", stations, paths, minutes, launch: { world: "parishes", parish, site } }]
//                                        the drills in DEAN's assignable module shape (dnModules()/dnApplyModule, guarded)
//   drMountDrills({ three, root, parish, el, tier, reducedMotion, toast, stationHref, siteName })
//        -> { open(drillId, siteId), offer(drillId), animate(dt), active(), list(), counts() }
//       The parishes app's mount: the drills at this map in `el` (menu), a dialog that runs briefing → timed objectives →
//       debrief, and for the flood drill one translucent water plane that rises at the site (none on the low tier, set
//       still at its final level under reduced motion).
//
// Every top-level name is prefixed dr/DR_ (the bundler shares one scope).

import { DR_DRILLS, DR_PLACES } from "./dr-drills-data.js";
import { stPath, stChosenPath } from "./st-paths.js";
import { gtStorage } from "./profiles.js";
import { npHeightAt } from "./np-parish.js";
import { GR_ROSTER } from "./npc-data.js";

export { DR_DRILLS, DR_PLACES };
export const DR_KEY = "vr-passport-drills-v1";
export const DR_PASS = 80;
export const DR_LATE_POINTS = 60;

export function drDrills() { return DR_DRILLS; }
export function drDrill(id) { return DR_DRILLS.find((d) => d.id === id) ?? null; }
export function drPlacesFor(parishId) { return DR_PLACES.filter((p) => p.parish === parishId); }
export function drDrillsFor(pathId, parishId) {
  const path = pathId ? stPath(pathId) : null;
  const here = drPlacesFor(parishId);
  if (!path || !path.prompts) return here;
  return here.filter((p) => drDrill(p.drill)?.paths.includes(path.id));
}

export function drTimer(objective, elapsed) {
  const left = Math.max(0, Math.ceil(objective.seconds - Math.max(0, elapsed)));
  return { left, late: elapsed > objective.seconds };
}
export function drObjectivePoints(objective, r) {
  if (!r || !r.safe) return 0;
  return r.seconds <= objective.seconds ? 100 : DR_LATE_POINTS;
}
export function drScore(drill, results = {}) {
  const max = drill.objectives.length * 100;
  const points = drill.objectives.reduce((a, o) => a + drObjectivePoints(o, results[o.id]), 0);
  const score = max ? Math.round((points / max) * 100) : 0;
  return { points, max, score, passed: score >= DR_PASS };
}
export function drDebrief(drill, results = {}) {
  const wentWell = drill.objectives.filter((o) => drObjectivePoints(o, results[o.id]) === 100).map((o) => o.title);
  const unsafe = drill.objectives.find((o) => !results[o.id]?.safe);
  const late = drill.objectives.find((o) => results[o.id]?.safe && results[o.id].seconds > o.seconds);
  const pick = unsafe ?? late ?? null;
  const improvement = pick ? { objective: pick.id, text: `${pick.title}: ${pick.practice}` } : null;
  return { wentWell, improvement, score: drScore(drill, results).score };
}

let drRecorder = null;
export function drSetRecorder(fn) { drRecorder = typeof fn === "function" ? fn : null; }
function drStore() { try { return gtStorage(); } catch (_) { return null; } }
export function drLoad() {
  try { const raw = JSON.parse(drStore()?.getItem(DR_KEY) || "null"); return raw && typeof raw === "object" && raw.best ? raw : { v: 1, best: {}, runs: 0 }; }
  catch (_) { return { v: 1, best: {}, runs: 0 }; }
}
export function drRecord(drillId, result, { attemptId = null } = {}) {
  const drill = drDrill(drillId);
  if (!drill) return null;
  const s = drLoad();
  s.best[drillId] = Math.max(s.best[drillId] ?? 0, result.score);
  s.runs = (s.runs ?? 0) + 1;
  try { drStore()?.setItem(DR_KEY, JSON.stringify(s)); } catch (_) { /* private window */ }
  let award = null;
  try { award = drRecorder?.(`drills:${drillId}`, { reputation: Math.round(result.score / 10), reason: `${drill.name} drill: ${result.score}/100 on safe practice`, attemptId }) ?? null; } catch (_) { award = null; }
  return { best: s.best[drillId], award };
}

export function drDeanModules() {
  return DR_DRILLS.map((d) => {
    const place = DR_PLACES.find((p) => p.drill === d.id);
    return { id: `drill:${d.id}`, title: `${d.name} drill`, kind: "drill", stations: [...new Set(d.objectives.map((o) => o.station))], paths: d.paths,
      minutes: Math.ceil(d.objectives.reduce((a, o) => a + o.seconds, 0) / 60) + 2, launch: { world: "parishes", parish: place?.parish ?? null, site: place?.site ?? null } };
  });
}

const drEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let drCssDone = false;
function drCss() {
  if (drCssDone || typeof document === "undefined") return;
  drCssDone = true;
  const st = document.createElement("style");
  st.textContent = `#dr-panel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;z-index:41;background:rgba(16,24,30,.97);color:#eef2f6;border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:16px;font:14px/1.45 system-ui,sans-serif}
  #dr-panel h2{margin:0 0 6px;font-size:18px}#dr-panel .dr-meta{opacity:.8;font-size:12px}#dr-panel .dr-time{font-variant-numeric:tabular-nums;font-weight:700}#dr-panel .dr-late{color:#ffcf7a}
  #dr-panel .dr-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#dr-panel button,#dr-panel a{min-height:44px;padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.12);color:inherit;font:inherit;text-decoration:none;cursor:pointer;text-align:left}
  #dr-panel ul{margin:6px 0 6px 18px;padding:0}`;
  document.head.appendChild(st);
}

/** Mount the drills in a parish page (see the header). */
export function drMountDrills({ three = null, root = null, parish, el = null, tier = "balanced", reducedMotion = false, toast = null, stationHref = null, siteName = null } = {}) {
  const T = three;
  let run = null, water = null, tick = null;
  const nameOf = (siteId) => siteName?.(siteId) ?? parish.sites.find((s) => s.id === siteId)?.name ?? siteId;
  const panel = () => {
    drCss();
    let p = document.getElementById("dr-panel");
    if (!p) { p = document.createElement("div"); p.id = "dr-panel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.setAttribute("aria-labelledby", "dr-title"); document.body.appendChild(p); }
    p.hidden = false; return p;
  };
  const close = () => { clearInterval(tick); tick = null; run = null; dropWater(); const p = typeof document !== "undefined" && document.getElementById("dr-panel"); if (p) p.hidden = true; };
  const dropWater = () => { if (water) { water.parent?.remove(water); water.geometry.dispose(); water.material.dispose(); water = null; } };
  const addWater = (drill, site) => {
    if (!T || !root || tier === "low" || !drill.water) return;
    const [x, z] = site.position;
    water = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: 0x3f7fa8, transparent: true, opacity: 0.55, roughness: 0.3 }));
    water.rotation.x = -Math.PI / 2; water.name = "dr-flood-water";
    water.userData.base = npHeightAt(parish, x, z) - 0.6; water.userData.rise = drill.water.rise;
    water.position.set(x + 14, water.userData.base + (reducedMotion ? drill.water.rise : 0), z + 14);
    root.add(water);
  };
  const elapsed = () => (run ? (Date.now() - run.t0) / 1000 : 0);

  function renderObjective() {
    const d = run.drill, o = d.objectives[run.i], p = panel();
    const { left, late } = drTimer(o, elapsed());
    const flip = run.i % 2 === 1;
    const choices = flip ? [["unsafe", o.unsafe], ["safe", o.safe]] : [["safe", o.safe], ["unsafe", o.unsafe]];
    const href = stationHref?.(o.station, run.site.id);
    p.innerHTML = `<p class="dr-meta">${drEsc(d.name)} · objective ${run.i + 1} of ${d.objectives.length} · <span class="dr-time${late ? " dr-late" : ""}">${late ? "over time" : `${left}s`}</span></p>` +
      `<h2 id="dr-title">${drEsc(o.title)}</h2><p>${drEsc(o.practice)}</p><p class="dr-meta">Role: ${drEsc(run.roles[o.role] ?? o.role)}${o.kiosk ? ` · kiosk ${drEsc(o.kiosk)}` : ""}${href ? ` · <a href="${drEsc(href)}">station</a>` : ""}</p>` +
      `<div class="dr-row">${choices.map(([k, t]) => `<button type="button" data-dr="${k}">${drEsc(t)}</button>`).join("")}</div>`;
    for (const b of p.querySelectorAll("[data-dr]")) b.addEventListener("click", () => answer(b.getAttribute("data-dr") === "safe"));
  }
  function answer(safe) {
    const o = run.drill.objectives[run.i];
    run.results[o.id] = { safe, seconds: Math.round(elapsed()) };
    toast?.(safe ? `Safe call: ${o.title}.` : `Not the safe call — ${o.practice}`, 3500);
    run.i += 1; run.t0 = Date.now();
    if (run.i < run.drill.objectives.length) renderObjective(); else finish();
  }
  function finish() {
    clearInterval(tick); tick = null;
    const d = run.drill, sc = drScore(d, run.results), db = drDebrief(d, run.results);
    const rec = drRecord(d.id, sc, { attemptId: `${run.site.id}-${run.started}` });
    const p = panel();
    p.innerHTML = `<h2 id="dr-title">Debrief — ${drEsc(d.name)}</h2><p><b>${sc.score}/100</b> on safe practice${sc.passed ? " — drill passed" : ""}. Best: ${rec?.best ?? sc.score}.</p>` +
      `<p class="dr-meta">What went well</p><ul>${db.wentWell.length ? db.wentWell.map((t) => `<li>${drEsc(t)}</li>`).join("") : "<li>You finished the drill — run it again to build the order in.</li>"}</ul>` +
      `<p class="dr-meta">One improvement</p><p>${drEsc(db.improvement ? db.improvement.text : "Keep the same order and pace next time.")}</p>` +
      `<div class="dr-row"><button type="button" data-dr-close>Close</button></div>`;
    p.querySelector("[data-dr-close]").addEventListener("click", close);
  }
  function open(drillId, siteId) {
    const drill = drDrill(drillId), site = parish.sites.find((s) => s.id === siteId);
    if (!drill || !site || typeof document === "undefined") return false;
    close();
    run = { drill, site, i: -1, results: {}, t0: Date.now(), started: Date.now().toString(36), roles: {} };
    for (const o of drill.objectives) { const c = GR_ROSTER.find((r) => r.id === o.role); run.roles[o.role] = c ? `${c.name}, ${c.role}` : o.role; }
    addWater(drill, site);
    const p = panel();
    p.innerHTML = `<p class="dr-meta">Drill at ${drEsc(nameOf(site.id))}</p><h2 id="dr-title">${drEsc(drill.name)}</h2><p>${drEsc(drill.briefing)}</p>` +
      `<ol>${drill.objectives.map((o) => `<li>${drEsc(o.title)} <span class="dr-meta">(${o.seconds}s)</span></li>`).join("")}</ol>` +
      `<div class="dr-row"><button type="button" data-dr-go>Start the drill</button><button type="button" data-dr-close>Not now</button></div>`;
    p.querySelector("[data-dr-go]").addEventListener("click", () => { run.i = 0; run.t0 = Date.now(); renderObjective(); tick = setInterval(() => { if (run && run.i >= 0) { const t = p.querySelector(".dr-time"); const o = run.drill.objectives[run.i]; if (t && o) { const r = drTimer(o, elapsed()); t.textContent = r.late ? "over time" : `${r.left}s`; t.classList.toggle("dr-late", r.late); } } }, 500); });
    p.querySelector("[data-dr-close]").addEventListener("click", close);
    return true;
  }
  function list() { return drDrillsFor(stChosenPath(), parish.id); }
  function render() {
    if (!el) return;
    const items = list();
    el.textContent = "";
    if (!items.length) return;
    el.innerHTML = `<p class="eyebrow" style="margin-top:16px">Scenario drills here · ${items.length}</p><div class="row" style="flex-wrap:wrap">${items.map((it) =>
      `<button type="button" class="btn" data-dr-open="${drEsc(it.drill)}" data-dr-site="${drEsc(it.site)}">${drEsc(drDrill(it.drill).name)} · ${drEsc(nameOf(it.site))}</button>`).join("")}</div>`;
    for (const b of el.querySelectorAll("[data-dr-open]")) b.addEventListener("click", () => open(b.getAttribute("data-dr-open"), b.getAttribute("data-dr-site")));
  }
  render();
  try { globalThis.addEventListener?.("st:path", render); } catch (_) { /* headless */ }
  return {
    open, list,
    offer(drillId) { const it = drPlacesFor(parish.id).find((p) => p.drill === drillId); toast?.(it ? `Practice this as a drill: ${drDrill(drillId).name} at ${nameOf(it.site)} (menu → Scenario drills).` : `The ${drDrill(drillId)?.name ?? "drill"} drill runs in another map — see the menu.`, 5000); return !!it; },
    animate(dt) { if (!water || reducedMotion || !run || run.i < 0) return; const f = Math.min(1, (run.i + Math.min(1, elapsed() / 60)) / run.drill.objectives.length); water.position.y = water.userData.base + water.userData.rise * f; },
    active() { return run ? { drill: run.drill.id, site: run.site.id, objective: run.i } : null; },
    counts() { return { places: drPlacesFor(parish.id).length, offered: list().length, meshes: water ? 1 : 0, waterRise: water ? +(water.position.y - water.userData.base).toFixed(3) : null }; },
  };
}
