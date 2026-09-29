// STORYLINE — side stories by path and parish, and the world mount (docs/consoles/STORYLINE.md).
// SmartCiti.X Powered by AGI Corp.
//
// SEAMS (documented shapes):
//
//   stQuestsFor(pathId, parishId) -> [{ id, path, parish, site, siteName, character, characterName, role,
//        line: { text, src }, handoff: { kind: "site", parish, site, siteName, from }, prompt,
//        branches: [{ id, label, end: { kind: "station" | "lesson", id }, title, practice, src }] (two),
//        kiosk: KREWE kiosk id | null, chain: [{ kind, id }] }]
//       Two or three per path and map; [] for Just Roam or an unknown pair.
//   stBranchChosen(storyId) -> branch id | null;  stChooseBranch(storyId, branchId) -> bool (remembered)
//   stGlowSites(pathId, parish) -> [site id]     which site boards glow on this path
//   stGreeter(pathId, parish) -> GRIOT character id | null   who greets you first
//   stPathKiosks(pathId, parishId) -> [KREWE kiosk id]       which kiosks count on this path here
//   stMountPaths({ three, root, parish, world, el, tier, reducedMotion, toast, openLesson, stationHref, onPath })
//        -> { animate(t), refresh(), greet(), path(), glowCount() }
//       The parishes app's mount: the picker and the path's stories in `el`, a glow ring over each path board
//       (one InstancedMesh, none on the low tier, still under reduced motion), the greeting toast.
//
// Every top-level name is prefixed st/ST_ (the bundler shares one scope).

import { ST_STORIES } from "./st-stories-data.js";
import { stPath, stChosenPath, stLoad, stSave, stMountPicker } from "./st-paths.js";
import { PP_PROGRAMMES } from "./passport-programmes.js";
import { GR_ROSTER } from "./npc-data.js";
import { grSiteFor } from "./npc.js";
import { KW_KIOSKS } from "./kw-play-data.js";

export function stQuestsFor(pathId, parishId) {
  const p = stPath(pathId);
  if (!p || !p.prompts) return [];
  return ST_STORIES.filter((s) => s.path === pathId && s.parish === parishId);
}
export function stStory(id) { return ST_STORIES.find((s) => s.id === id) ?? null; }
export function stBranchChosen(storyId) { return stLoad().branches[storyId] ?? null; }
export function stChooseBranch(storyId, branchId) {
  const story = stStory(storyId);
  if (!story || !story.branches.some((b) => b.id === branchId)) return false;
  const s = stLoad(); s.branches[storyId] = branchId; return stSave(s);
}

function stPool(path) {
  const pool = new Set();
  for (const id of path.programmes) for (const s of PP_PROGRAMMES[id]?.stations ?? []) pool.add(s);
  return pool;
}

export function stGlowSites(pathId, parish) {
  const p = stPath(pathId);
  if (!p || !p.prompts || !parish) return [];
  const pool = stPool(p);
  const story = new Set(stQuestsFor(pathId, parish.id).map((s) => s.site));
  return parish.sites.filter((s) => story.has(s.id) || p.siteKinds.includes(s.kind) || s.stations.some((id) => pool.has(id))).map((s) => s.id);
}

export function stGreeter(pathId, parish) {
  const p = stPath(pathId);
  if (!p || !p.prompts || !parish) return null;
  const here = GR_ROSTER.filter((c) => c.world === "parish" && grSiteFor(c, parish.sites));
  return p.greeters.find((id) => here.some((c) => c.id === id)) ?? stQuestsFor(pathId, parish.id)[0]?.character ?? null;
}

export function stPathKiosks(pathId, parishId) {
  const p = stPath(pathId);
  if (!p || !p.prompts) return [];
  return KW_KIOSKS.filter((k) => k.parish === parishId && p.kiosks.includes(k.id)).map((k) => k.id);
}

const stEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** The stories panel for one path and parish (DOM only). */
function stRenderStories(box, parish, { openLesson, stationHref }) {
  const pid = stChosenPath();
  const p = stPath(pid);
  if (!box) return;
  if (!p) { box.innerHTML = `<p class="note">Pick a path and the world leans toward it: which boards glow, who greets you first, the side stories on offer and the kiosks that count.</p>`; return; }
  if (!p.prompts) { box.innerHTML = `<p class="note">Just Roam: no prompts, no stories offered. Walk anywhere; every board, lesson and kiosk still opens when you reach it.</p>`; return; }
  const list = stQuestsFor(pid, parish.id);
  const kiosks = stPathKiosks(pid, parish.id);
  box.innerHTML = `<p class="eyebrow">${stEsc(p.label)} · side stories here</p>${kiosks.length ? `<p class="note">Kiosks that count on this path here: ${kiosks.map(stEsc).join(", ")}</p>` : ""}` + list.map((s) => {
    const chosen = stBranchChosen(s.id);
    return `<div class="quest st-story" data-st-story="${stEsc(s.id)}"><b>${stEsc(s.characterName)}, ${stEsc(s.role.toLowerCase())} — ${stEsc(s.siteName)}</b>
<small>“${stEsc(s.line.text)}”</small><small>${stEsc(s.prompt)}</small><div class="row">${s.branches.map((b) =>
      `<button type="button" class="btn${chosen === b.id ? " on" : ""}" data-st-branch="${stEsc(b.id)}" title="${stEsc(b.practice)}">${stEsc(b.label)}: ${stEsc(b.title)}</button>`).join("")}</div>${chosen ? `<small>You chose: ${stEsc(s.branches.find((b) => b.id === chosen)?.practice ?? "")}</small>` : ""}</div>`;
  }).join("");
  for (const btn of box.querySelectorAll("[data-st-branch]")) btn.addEventListener("click", () => {
    const storyId = btn.closest("[data-st-story]").getAttribute("data-st-story");
    const story = stStory(storyId), b = story.branches.find((x) => x.id === btn.getAttribute("data-st-branch"));
    stChooseBranch(storyId, b.id);
    if (b.end.kind === "lesson" && (parish.fieldLessons ?? []).some((l) => l.id === b.end.id)) { openLesson?.(b.end.id); stRenderStories(box, parish, { openLesson, stationHref }); return; }
    const station = b.end.kind === "station" ? b.end.id : null;
    if (station && stationHref) location.href = stationHref(station, story.site);
    else stRenderStories(box, parish, { openLesson, stationHref });
  });
}

export function stMountPaths({ three = null, root = null, parish, world = null, el = null, tier = "high", reducedMotion = false, toast = null, openLesson = null, stationHref = null, onPath = null } = {}) {
  const picker = el ? document.createElement("div") : null;
  const stories = el ? document.createElement("div") : null;
  if (el) { el.textContent = ""; el.append(picker, stories); }
  let ring = null, mat = null, glowIds = [];
  const boards = world?.siteBoards ?? [];
  const build = () => {
    if (ring) { root?.remove(ring); ring.geometry.dispose(); ring = null; }
    glowIds = stGlowSites(stChosenPath(), parish);
    const at = boards.filter((b) => glowIds.includes(b.site.id));
    if (!three || !root || tier === "low" || !at.length) return;
    mat = mat ?? new three.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.7, depthWrite: false });
    ring = new three.InstancedMesh(new three.TorusGeometry(2.2, 0.12, 6, tier === "medium" ? 16 : 24), mat, at.length);
    const m = new three.Matrix4(), q = new three.Quaternion().setFromAxisAngle(new three.Vector3(1, 0, 0), Math.PI / 2), s = new three.Vector3(1, 1, 1);
    at.forEach((b, i) => { m.compose(new three.Vector3(b.x, (b.y ?? 0) + 0.15, b.z), q, s); ring.setMatrixAt(i, m); });
    ring.name = "st-path-glow"; ring.frustumCulled = false; root.add(ring);
  };
  const refresh = () => { build(); stRenderStories(stories, parish, { openLesson, stationHref }); };
  if (picker) stMountPicker(picker, { onPick: (id) => { refresh(); onPath?.(id); } });
  refresh();
  const greet = () => {
    const id = stGreeter(stChosenPath(), parish);
    const ch = id ? GR_ROSTER.find((c) => c.id === id) : null;
    if (ch && toast) toast(`${stPath(stChosenPath()).label}: ${ch.name}, the ${ch.role.toLowerCase()}, greets you first — press G near them. The glowing boards are on your path.`, 6000);
    return id;
  };
  return {
    animate(t) { if (mat && !reducedMotion) mat.opacity = 0.45 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2.2)); },
    refresh, greet, path: () => stChosenPath(), glowCount: () => (ring ? ring.count : 0), glowSites: () => glowIds.slice(),
  };
}
