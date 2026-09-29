// The Versions & modules tab of the instructor console (console DEAN, docs/modules.md):
// a version of the platform per class or organisation (packs, worlds, paths, a lock),
// a module builder (an ordered set of lessons, stations and field lessons from any
// world, a due date, a required score), assignment to a class code (a cohort's invite
// code), the file round trip, and progress per learner. Plain text nodes only — no
// markup from strings (tools/check_console.mjs). Every top-level name starts with `dn`.

import {
  dnVersions, dnSaveVersion, dnDeleteVersion, dnLockVersion, dnSetActive, dnLoad, dnModules, dnSaveModule, dnDeleteModule,
  dnAssign, dnUnassign, dnExport, dnImport, dnProgress, dnPacks, dnSetEnterprise, dnHidden, DN_WORLDS, DN_PATHS,
} from "../../shared/dn-modules.js";
import { dnLessonIndex } from "../../shared/dn-index.js";
import { enCohorts } from "../../shared/org.js";

const dnEl = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const dnUi = { root: null, toast: null, index: null, draft: { title: "", lessons: [], due: "", requiredScore: 80 }, query: "", progressFor: null };

function dnSay(t) { try { dnUi.toast?.(t); } catch (_) { /* no toast */ } }
function dnBtn(label, fn, cls = "small") { const b = dnEl("button", cls, label); b.type = "button"; b.addEventListener("click", fn); return b; }
function dnPanel(title) { const s = dnEl("section", "panel"); s.append(dnEl("h2", null, title)); return s; }
function dnDownload(name, text) {
  if (typeof URL?.createObjectURL !== "function") return;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function dnChecks(name, all, on, label = (x) => x) {
  const box = dnEl("fieldset", "dn-checks"); box.append(dnEl("legend", null, name));
  for (const id of all) {
    const l = dnEl("label"); const c = dnEl("input"); c.type = "checkbox"; c.value = id; c.checked = !Array.isArray(on) || on.includes(id);
    l.append(c, document.createTextNode(` ${label(id)}`)); box.append(l);
  }
  box.values = () => { const v = [...box.querySelectorAll("input")].filter((c) => c.checked).map((c) => c.value); return v.length === all.length ? null : v; };
  return box;
}
const dnCodes = () => enCohorts().map((c) => ({ code: c.code, name: c.name }));

function dnVersionPanel() {
  const p = dnPanel("Versions — what a class or organisation sees");
  p.append(dnEl("p", "fine", "A version switches packs, worlds and paths on or off for a class code or the whole organisation. The deployment's enterprise block always wins: a version can switch a world off, never back on. Lock a version to keep learners on one path."));
  const active = dnLoad().active;
  for (const v of dnVersions()) {
    const row = dnEl("div", "dn-row");
    const hidden = dnHidden(v);
    row.append(dnEl("strong", null, v.name), dnEl("span", "muted", ` · ${v.scope.kind}${v.scope.id ? ` ${v.scope.id}` : ""} · ${hidden.worlds.size} world(s) off · ${hidden.packs.size} pack(s) off · ${v.locked ? `locked to ${v.lockedPath ?? "its paths"}` : "paths open"} · Find me ${v.geolocation ? "on" : "off"}${active === v.id ? " · applied on this device" : ""} `));
    row.append(
      dnBtn(v.locked ? "Unlock" : "Lock", () => { dnLockVersion(v.id, !v.locked, v.lockedPath ?? (v.paths?.[0] ?? "union-trades")); dnRender(); }),
      dnBtn(active === v.id ? "Stop applying here" : "Apply on this device", () => { dnSetActive(active === v.id ? null : v.id); dnRender(); }),
      // GEO (docs/geo.md): the teacher's switch for Find me in this class; off unless turned on here.
      dnBtn(v.geolocation ? "Turn Find me off" : "Turn Find me on", () => { dnSaveVersion({ ...v, geolocation: !v.geolocation }); dnRender(); }),
      dnBtn("Export", () => dnDownload(`${v.id}.json`, dnExport(v.id))),
      dnBtn("Delete", () => { dnDeleteVersion(v.id); dnRender(); }),
    );
    p.append(row);
  }
  const form = dnEl("form", "dn-form");
  const name = dnEl("input"); name.placeholder = "Version name"; name.required = true;
  const scope = dnEl("select"); scope.append(dnEl("option", null, "organisation"));
  scope.firstChild.value = "org";
  for (const c of dnCodes()) { const o = dnEl("option", null, `class ${c.code} — ${c.name}`); o.value = `class:${c.code}`; scope.append(o); }
  const worlds = dnChecks("Worlds", DN_WORLDS, null);
  const paths = dnChecks("Paths", DN_PATHS, null);
  const packs = dnPacks();
  const packBox = dnChecks(`Packs (${packs[0]?.source === "pk-packs" ? "PACKS registry" : "one per programme until PACKS lands"})`, packs.map((x) => x.id), null, (id) => packs.find((x) => x.id === id)?.title ?? id);
  packBox.classList.add("dn-scroll");
  const lock = dnEl("select"); lock.append(dnEl("option", null, "paths open")); lock.firstChild.value = "";
  for (const id of DN_PATHS) { const o = dnEl("option", null, `lock to ${id}`); o.value = id; lock.append(o); }
  const geoLab = dnEl("label"); const geoBox = dnEl("input"); geoBox.type = "checkbox"; geoBox.checked = false; geoLab.append(geoBox, " Allow Find me (the learner's location, asked on a press, kept in memory only; off by default)");
  form.append(name, scope, worlds, paths, packBox, lock, geoLab, dnBtn("Save version", () => form.requestSubmit?.() ?? form.dispatchEvent(new Event("submit")), "primary"));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const [kind, id] = scope.value.includes(":") ? scope.value.split(":") : ["org", null];
    dnSaveVersion({ name: name.value, scope: { kind, id }, worlds: worlds.values(), paths: paths.values(), packs: packBox.values(), locked: !!lock.value, lockedPath: lock.value || null, geolocation: geoBox.checked === true });
    dnSay("Version saved."); dnRender();
  });
  p.append(form);
  return p;
}

function dnModulePanel() {
  const p = dnPanel("Build a module");
  const d = dnUi.draft;
  const title = dnEl("input"); title.placeholder = "Module title"; title.value = d.title; title.addEventListener("input", () => { d.title = title.value; });
  const due = dnEl("input"); due.type = "date"; due.value = d.due; due.addEventListener("change", () => { d.due = due.value; });
  const score = dnEl("input"); score.type = "number"; score.min = "0"; score.max = "100"; score.value = String(d.requiredScore); score.addEventListener("change", () => { d.requiredScore = Number(score.value); });
  p.append(title, dnEl("span", "muted", " due "), due, dnEl("span", "muted", " required score "), score);
  const list = dnEl("ol", "dn-lessons");
  d.lessons.forEach((l, i) => {
    const li = dnEl("li", null, `${l.kind} · ${dnUi.index?.resolve(l)?.title ?? l.id} · ${l.world ?? "any world"} `);
    li.append(dnBtn("↑", () => { if (i) { [d.lessons[i - 1], d.lessons[i]] = [d.lessons[i], d.lessons[i - 1]]; dnRender(); } }), dnBtn("Remove", () => { d.lessons.splice(i, 1); dnRender(); }));
    list.append(li);
  });
  p.append(list);
  const q = dnEl("input"); q.type = "search"; q.placeholder = "Search lessons, stations and field lessons in every world"; q.value = dnUi.query;
  const hits = dnEl("ul", "dn-hits");
  const fill = () => {
    hits.replaceChildren();
    const s = dnUi.query.trim().toLowerCase();
    if (s.length < 2 || !dnUi.index) return;
    for (const l of dnUi.index.lessons.filter((x) => x.id.includes(s) || x.title.toLowerCase().includes(s)).slice(0, 12)) {
      const li = dnEl("li", null, `${l.kind} · ${l.title} · ${l.worlds.join(", ")}${l.parish ? ` · ${l.parish}` : ""} `);
      li.append(dnBtn("Add", () => { d.lessons.push({ kind: l.kind, id: l.id, world: l.world }); dnRender(); }));
      hits.append(li);
    }
  };
  q.addEventListener("input", () => { dnUi.query = q.value; fill(); });
  fill();
  p.append(q, hits, dnBtn("Save module", () => {
    if (!d.lessons.length) { dnSay("Add at least one lesson first."); return; }
    dnSaveModule({ title: d.title, lessons: d.lessons, due: d.due || null, requiredScore: d.requiredScore });
    dnUi.draft = { title: "", lessons: [], due: "", requiredScore: 80 }; dnSay("Module saved."); dnRender();
  }, "primary"));
  return p;
}

function dnModulesPanel() {
  const p = dnPanel("Modules — assign to a class, export, progress");
  const codes = dnCodes();
  if (!dnModules().length) p.append(dnEl("p", "muted", "No modules yet. Build one above, or import a module file."));
  for (const m of dnModules()) {
    const row = dnEl("div", "dn-row");
    row.append(dnEl("strong", null, m.title), dnEl("span", "muted", ` · ${m.lessons.length} lesson(s)${m.due ? ` · due ${m.due}` : ""} · required ${m.requiredScore} · assigned to ${m.assign.map((a) => a.classCode).join(", ") || "no class"} `));
    const pickCode = dnEl("select"); pickCode.append(dnEl("option", null, "class code…")); pickCode.firstChild.value = "";
    for (const c of codes) { const o = dnEl("option", null, `${c.code} — ${c.name}`); o.value = c.code; pickCode.append(o); }
    row.append(pickCode,
      dnBtn("Assign", () => { if (dnAssign(m.id, pickCode.value)) { dnSay(`Assigned to ${pickCode.value}.`); dnRender(); } else dnSay("Pick a class code (a cohort's invite code) first."); }),
      ...m.assign.map((a) => dnBtn(`Unassign ${a.classCode}`, () => { dnUnassign(m.id, a.classCode); dnRender(); })),
      dnBtn("Progress", () => { dnUi.progressFor = { id: m.id, code: m.assign[0]?.classCode ?? pickCode.value }; dnRender(); }),
      dnBtn("Export", () => dnDownload(`${m.id}.json`, dnExport(m.id))),
      dnBtn("Delete", () => { dnDeleteModule(m.id); dnRender(); }));
    p.append(row);
  }
  const file = dnEl("input"); file.type = "file"; file.accept = "application/json,.json";
  file.addEventListener("change", async () => {
    const f = file.files?.[0]; if (!f) return;
    const r = dnImport(await f.text(), dnUi.index);
    dnSay(r.ok ? `Imported ${r.modules} module(s), ${r.versions} version(s).` : `Not imported: ${r.errors.slice(0, 3).join("; ")}`);
    dnRender();
  });
  p.append(dnEl("span", "muted", "Import a module, version or bundle file: "), file, dnBtn("Export everything", () => dnDownload("dean-bundle.json", dnExport())));
  const pf = dnUi.progressFor && dnProgress(dnUi.progressFor.id, dnUi.progressFor.code);
  if (pf) {
    p.append(dnEl("h3", null, `Progress · ${pf.module.title} · ${pf.classCode}${pf.cohort ? ` (${pf.cohort.name})` : " — no cohort with this code on this device"}`));
    const t = dnEl("table", "dn-grid"); const head = dnEl("tr"); head.append(dnEl("th", null, "Learner"));
    for (const l of pf.module.lessons) head.append(dnEl("th", null, dnUi.index?.resolve(l)?.title ?? l.id));
    head.append(dnEl("th", null, "Score"), dnEl("th", null, "Meets"));
    t.append(head);
    for (const r of pf.rows) {
      const tr = dnEl("tr"); tr.append(dnEl("td", null, r.name));
      if (!r.shared) { const td = dnEl("td", "muted", "not sharing progress"); td.colSpan = pf.module.lessons.length; tr.append(td); }
      else for (const c of r.cells) tr.append(dnEl("td", c?.done ? "dn-done" : null, c ? `${c.done ? "✓" : "·"} ${c.score}` : "—"));
      tr.append(dnEl("td", null, String(r.score)), dnEl("td", null, r.meets ? "yes" : "not yet"));
      t.append(tr);
    }
    p.append(t);
  }
  return p;
}

function dnRender() {
  if (!dnUi.root) return;
  dnUi.root.replaceChildren(dnVersionPanel(), dnModulePanel(), dnModulesPanel());
}

/** Mount the tab into `root`; `catalogIds` widens the station index once catalog.json lands. */
export function dnMountView(root, { toast = null } = {}) {
  dnUi.root = root; dnUi.toast = toast;
  try { dnUi.index = dnLessonIndex(); } catch (_) { dnUi.index = null; }
  addEventListener("dn:change", () => {});
  dnRender();
  return { render: dnRender, setCatalog(ids) { try { dnUi.index = dnLessonIndex({ catalogIds: ids }); } catch (_) { /* keep */ } dnRender(); }, setEnterprise(e) { dnSetEnterprise(e); dnRender(); } };
}
