/**
 * LESSONS-X: the instructor console's "Agent lessons" tab. It lists the lesson packs composed from the real roster
 * (lx-lessons.js), each with its world, stations, standards and points target, previews one station's agent-led lesson
 * (brief → demo → try → debrief, every line captioned "software agent"), and assigns a pack. The assignment is a pack
 * id on this device; no learner data is on the console. Progress is shown only where DATAWORKS allows collection.
 *
 *   lxMountPackPanel(el, { catalog, storage }) -> { packs, assign(id), preview(packId, stationId), dispose() }
 */
import { lxRoster, lxPacks, lxAgentLesson, lxAssign, lxAssigned, LX_LABEL } from "./lx-lessons.js";

function lxEl(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

export function lxMountPackPanel(el, { catalog = null, storage = globalThis.localStorage ?? null } = {}) {
  if (!el) return null;
  el.textContent = "";
  if (!catalog) { el.append(lxEl("p", "fine", "The station catalog has not loaded yet; open this tab again in a moment.")); return null; }
  const roster = lxRoster(catalog);
  const { packs, refused, pending } = lxPacks(roster);
  const wrap = lxEl("section", "panel");
  wrap.append(lxEl("h2", null, "Agent-led lesson packs"));
  wrap.append(lxEl("p", "fine", `Each lesson runs brief, demonstration at the station, the learner's try and the debrief, delivered by a ${LX_LABEL} (an Omega Hive agent or a VBRIDGE persona). Every line comes from the station's own steps and the standards it names. Voice is off unless the learner turns it on; captions always show.`));
  const status = lxEl("p", "fine");
  status.setAttribute("role", "status");
  const showAssigned = () => { const a = lxAssigned({ storage }); status.textContent = a ? `Assigned on this device: ${packs.find((p) => p.id === a)?.title ?? a}.` : "No pack assigned on this device yet."; };
  showAssigned();
  wrap.append(status);
  const preview = lxEl("div", "lx-preview");
  preview.setAttribute("aria-live", "polite");
  for (const p of packs) {
    const card = lxEl("article", "panel lx-pack");
    card.dataset.pack = p.id;
    card.append(lxEl("h3", null, `${p.title}`));
    card.append(lxEl("p", "fine", `${p.worldName} · ${p.stations.length} stations · target ${p.points.target} of ${p.points.perfect} points · about ${p.estimate.minutes} min · led by ${p.leader === "hive" ? "Omega Hive agents" : "a VBRIDGE persona"} (${LX_LABEL})`));
    card.append(lxEl("p", "fine", p.standards.length ? `Standards (from the stations): ${p.standards.join(", ")}` : "Standards: scored on the stations' own steps"));
    const list = lxEl("ol");
    for (const s of p.stations) {
      const li = lxEl("li");
      const b = lxEl("button", "btn", `${s.name}`);
      b.type = "button";
      b.setAttribute("aria-label", `Preview the agent-led lesson at ${s.name}`);
      b.addEventListener("click", () => api.preview(p.id, s.id));
      li.append(b, lxEl("span", "fine", ` ${s.steps} steps${s.siteName ? ` · ${s.siteName}` : ""}`));
      list.append(li);
    }
    card.append(list);
    const assign = lxEl("button", "btn", "Assign this pack");
    assign.type = "button";
    assign.addEventListener("click", () => api.assign(p.id));
    card.append(assign);
    wrap.append(card);
  }
  for (const r of refused) wrap.append(lxEl("p", "fine", `Not composed: ${r.id} (${r.reasons.join("; ")}).`));
  for (const p of pending) wrap.append(lxEl("p", "fine", `Pending: ${p.title}, waiting for ${p.waitingFor}.`));
  wrap.append(preview);
  el.append(wrap);
  const api = {
    packs,
    assign(id) { const r = lxAssign(id, { storage, packs }); showAssigned(); return r; },
    preview(packId, stationId) {
      const p = packs.find((x) => x.id === packId);
      const s = p?.stations.find((x) => x.id === stationId);
      preview.textContent = "";
      if (!s) return null;
      const lesson = lxAgentLesson(s.id, roster, { leader: p.leader, site: p.world === "parishes" ? s.site : null });
      if (lesson.refused) { preview.append(lxEl("p", "fine", lesson.reasons.join("; "))); return lesson; }
      preview.append(lxEl("h3", null, `${s.name}: led by ${lesson.leader.name} (${LX_LABEL})`));
      for (const phase of ["brief", "demo", "try", "debrief"]) {
        const lines = lesson.lines.filter((l) => l.phase === phase);
        preview.append(lxEl("h4", null, { brief: "Brief", demo: "Demonstration at the station", try: "The learner's try", debrief: "Debrief" }[phase]));
        const ul = lxEl("ul");
        for (const l of lines) ul.append(lxEl("li", null, l.caption));
        preview.append(ul);
      }
      return lesson;
    },
    dispose() { el.textContent = ""; },
  };
  return api;
}
