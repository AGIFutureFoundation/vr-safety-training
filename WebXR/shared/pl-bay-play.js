// PLAYLAYER — the Bay Area play layer (docs/consoles/PLAYLAYER.md).
//
// The San Francisco, Oakland, North East Bay, South Bay and Bay Program maps on
// the New Orleans play layer's shapes, read from each map's own data module so
// the lesson signs, this layer, the treasures and the eval read one source:
//
//   PL_DISTRICTS       the Bay Area maps GOLDEN-B's sg-sf-play.js does not
//                      already carry (Marina and Bayview stay there), in
//                      SG_DISTRICTS' shape: { id, name, short, file, data, sites }.
//   PL_FIELD_LESSONS   those maps' field lessons that name a classroom (`k12`)
//                      and a trade `station`, in SG_FIELD_LESSONS' shape (the
//                      play layer's `{ id, parish, site, k12, station, trade,
//                      tradeLine, title, minutes, steps, check, file }`).
//   PL_QUESTS          KREWE-style side quests (kw-play-data.js's quest shape):
//                      meet the crew at a site → the classroom station → the
//                      trade station → the site's field lesson. Every quest ends
//                      at a real field lesson of the map, and its two stations
//                      are catalog stations.
//   plPathBoard(id)    the "choose your path" board in sl-parish-play.js's
//                      slPathBoard shape: trade / classroom / play.
//
// Why a module of its own rather than more districts in sg-sf-play.js:
// check_k12's section 8e holds GOLDEN-B's two districts to five `sg-fl-`
// lessons each; the other Bay Area maps' lessons carry their own consoles'
// prefixes (`sf-downtown-fl-`, `sf-om-fl-`, `sn-fl-`, `bm-fl-`, `eb-fl-`,
// `bp-…-fl-`) and three or four lessons each. The shapes are SG's, so every
// consumer reads [...SG_FIELD_LESSONS, ...PL_FIELD_LESSONS] the same way.
//
// Seams (documented shapes):
//   plLessonsFor(parishId, siteId?) -> PL_FIELD_LESSONS rows (not Marina/Bayview's; sgLessonsFor has those)
//   plBayLessons(parishId)          -> every play-layer lesson of a Bay Area map (SG + PL)
//   plQuestsFor(parishId)           -> PL_QUESTS rows for the map
//   plMountQuestBoard(el, parishId, { page, completed(stationId), openLesson(id) }) -> rows (renders into #menu-krewe)
//   plMountPathBoard(el, parishId, { page, openLesson(id) }) -> model (renders into #menu-paths)
//
// Facts rule: nothing here states a date, a figure or a fact about a place; the
// text is the maps' own lesson titles and trade names, re-read, plus plain
// procedural wording. No coordinate, no three.js. Every top-level name is
// prefixed pl/PL_ (the bundler shares one scope).

import { NP_PARISHES } from "./np-parishes.js";
import { SG_DISTRICTS, SG_FIELD_LESSONS } from "./sg-sf-play.js";
import { lkStationLink } from "./links.js";

export const PL_WORLD = "parishes";
export const PL_PAGE = "parishes.html";
/** The Bay Area regions of the parish engine (np-parishes.js `region`). */
export const PL_REGIONS = ["san-francisco", "oakland", "north-east-bay", "south-bay", "bay-program"];

/** Short names for set titles and the board ("<short> Crew Kits"). Names only, as places. */
const PL_SHORT = {
  "sf-downtown": "Embarcadero", "sf-mission": "Mission", "sf-golden-gate-park": "Golden Gate Park", "sf-outer-mission": "Excelsior",
  "sf-north-beach": "North Beach", "sf-haight-castro": "Haight", "sf-sunset-south": "Ocean Beach", "sf-marina": "Marina", "sf-bayview": "Bayview",
  "oak-west-oakland": "West Oakland", "oak-downtown-lake": "Lake Merritt", "oak-fruitvale-estuary": "Fruitvale", "oak-emeryville-berkeley": "Emeryville",
  "bay-san-pablo": "San Pablo", "bay-san-jose": "San Jose", "bp-strip-marsh-east": "Strip Marsh", "bp-san-leandro-bay": "San Leandro Bay",
  "bp-san-mateo-shoreline": "San Mateo Bayside", "bp-nutrient-pilot": "Nutrient Pilot Plant", "sm-unspoken-smiles": "Unspoken Smiles",
};

const plSgIds = new Set(SG_DISTRICTS.map((d) => d.id));
const plSiteRow = (s) => ({ id: s.id, name: s.name, kind: s.kind, stations: s.stations, programmes: s.programmes });

/** Every Bay Area map on the parish engine (GOLDEN-B's two included), for the boards and quests. */
export const PL_BAY_MAPS = NP_PARISHES.filter((p) => PL_REGIONS.includes(p.region)).map((p) => ({
  id: p.id, name: p.name, region: p.region, short: PL_SHORT[p.id] ?? p.name, file: `WebXR/shared/np-data-${p.id}.js`, data: p, sites: p.sites.map(plSiteRow),
}));

/** The Bay Area maps this module adds to the play layer (not GOLDEN-B's), in SG_DISTRICTS' shape. */
export const PL_DISTRICTS = PL_BAY_MAPS.filter((d) => !plSgIds.has(d.id));

/** Their field lessons on the play layer's shape (only lessons naming a classroom and a trade station). */
export const PL_FIELD_LESSONS = PL_DISTRICTS.flatMap((d) => (d.data.fieldLessons ?? []).filter((l) => l.k12 && l.station).map((l) => ({
  id: l.id, parish: d.id, site: l.site, landmark: l.landmark ?? null, k12: l.k12, station: l.station,
  trade: l.trade, tradeLine: l.tradeLine, title: l.title, minutes: l.minutes, steps: l.steps, check: l.check, file: d.file,
})));

/** The hint a crew kit gives (the treasure layer's proximity finds off every site of these maps). */
export const PL_TREASURE_HINT = "Crews keep a kit near every Bay Area site. Walk the sites.";

export function plDistrict(id) { return PL_DISTRICTS.find((d) => d.id === id) ?? null; }
export function plBayMap(id) { return PL_BAY_MAPS.find((d) => d.id === id) ?? null; }
export function plLessonsFor(parishId, siteId = null) { return PL_FIELD_LESSONS.filter((l) => l.parish === parishId && (!siteId || l.site === siteId)); }
export function plBayLessons(parishId) { return [...SG_FIELD_LESSONS, ...PL_FIELD_LESSONS].filter((l) => l.parish === parishId); }
const plSiteName = (parishId, siteId) => plBayMap(parishId)?.sites.find((s) => s.id === siteId)?.name ?? String(siteId ?? "").replace(/-/g, " ");

// ------------------------------------------------------------------ side quests (KREWE's shape)

const plMakeQuest = (l) => {
  const site = plSiteName(l.parish, l.site);
  const trade = String(l.trade ?? "the crew").toLowerCase();
  return {
    id: `pl-q-${l.id}`, kind: "side-quest", world: PL_WORLD, title: l.title, parish: l.parish, site: l.site, giver: "the site crew lead",
    steps: [
      { type: "goto", parish: l.parish, site: l.site, text: `Meet the crew lead at ${site}.` },
      { type: "lesson", lesson: l.k12, text: "Take the classroom lesson behind it." },
      { type: "station", station: l.station, text: `Do the station ${trade} train on.` },
      { type: "field", lesson: l.id, text: `Answer the lesson sign at ${site}.` },
    ],
    reward: { stamp: `pl-stamp-q-${l.id}` },
  };
};

/** One side quest per Bay Area play-layer lesson, each ending at that lesson. */
export const PL_QUESTS = PL_BAY_MAPS.flatMap((d) => plBayLessons(d.id).map(plMakeQuest));
export function plQuest(id) { return PL_QUESTS.find((q) => q.id === id) ?? null; }
export function plQuestsFor(parishId) { return PL_QUESTS.filter((q) => q.parish === parishId); }

/** The quest board's model for one map (pure), in kwQuestBoard's row shape with a `field` step in place of a game. */
export function plQuestBoard(parishId, { completed = () => false, page = PL_PAGE } = {}) {
  return plQuestsFor(parishId).map((q) => {
    const [, lesson, station, field] = q.steps;
    const siteId = `${q.parish}/${q.site}`;
    return {
      id: q.id, title: q.title, siteName: plSiteName(q.parish, q.site), giver: q.giver,
      lesson: { id: lesson.lesson, text: lesson.text, href: lkStationLink(lesson.lesson, { from: PL_WORLD, page, siteId }) },
      station: { id: station.station, text: station.text, done: !!completed(station.station), href: lkStationLink(station.station, { from: PL_WORLD, page, siteId }) },
      field: { id: field.lesson, text: field.text },
      stamp: q.reward.stamp,
    };
  });
}

const plEsc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plWireLessons = (el, openLesson) => {
  if (typeof openLesson !== "function") return;
  for (const b of el.querySelectorAll("[data-pl-lesson]")) b.addEventListener("click", () => openLesson(b.getAttribute("data-pl-lesson")));
};

/** Render a Bay Area map's side quests into `el` (KREWE's board markup); `openLesson(id)` opens the field lesson. Returns the rows. */
export function plMountQuestBoard(el, parishId, opts = {}) {
  const rows = plQuestBoard(parishId, opts);
  if (!el || !rows.length) return rows;
  el.innerHTML = `<section class="kw-quests" aria-label="Side quests"><p class="eyebrow" style="margin-top:16px">Side quests</p><p class="note">Each quest is a classroom lesson, a union station and the lesson sign at one site.</p><ol>${rows.map((r) =>
    `<li><strong>${plEsc(r.title)}</strong> <span class="note">at ${plEsc(r.siteName)}, with ${plEsc(r.giver)}</span><br>` +
    `<a data-kw-lesson="${plEsc(r.lesson.id)}" href="${plEsc(r.lesson.href)}">Lesson: ${plEsc(r.lesson.text)}</a> · ` +
    `<a href="${plEsc(r.station.href)}">${r.station.done ? "✓ " : ""}Station: ${plEsc(r.station.text)}</a> · ` +
    `<button type="button" class="btn" data-pl-lesson="${plEsc(r.field.id)}">${plEsc(r.field.text)}</button></li>`).join("")}</ol></section>`;
  plWireLessons(el, opts.openLesson);
  return rows;
}

// ------------------------------------------------------------------ the path board (SECONDLINE's shape)

const PL_PATH_TEXT = [
  { id: "trade", title: "Work a trade", blurb: "Open a station from a site's job board and earn stars toward the passport." },
  { id: "classroom", title: "Take the classroom", blurb: "Short field lessons at the sites, each tied to a classroom station and the trade that uses the idea." },
  { id: "play", title: "Just play", blurb: "Side quests at the sites and hidden crew kits to find." },
];

/** The board's model for one Bay Area map (pure), in slPathBoard's `{ parish, name, paths: [trade, classroom, play] }` shape. */
export function plPathBoard(parishId, { page = PL_PAGE } = {}) {
  const m = plBayMap(parishId);
  if (!m) return null;
  const trade = m.sites.map((site) => ({ site: site.id, label: site.name, kind: site.kind,
    stations: site.stations.map((id) => ({ id, label: id.replace(/-/g, " "), href: lkStationLink(id, { from: PL_WORLD, page, siteId: site.id }) })) }));
  const classroom = plBayLessons(parishId).map((l) => ({ id: l.id, label: l.title, site: l.site, siteName: plSiteName(parishId, l.site), minutes: l.minutes, k12: l.k12, station: l.station,
    stationHref: lkStationLink(l.k12, { from: PL_WORLD, page, siteId: l.site }) }));
  const quests = plQuestsFor(parishId).map((q) => ({ id: q.id, label: q.title, site: q.site, siteName: plSiteName(parishId, q.site), lesson: q.steps[3].lesson, open: true }));
  return { parish: m.id, name: m.name, paths: [
    { ...PL_PATH_TEXT[0], rows: trade },
    { ...PL_PATH_TEXT[1], rows: classroom },
    { ...PL_PATH_TEXT[2], rows: quests, arc: [], treasures: null },
  ] };
}

/** Render the board into `el` (slMountPathBoard's markup); lesson rows open the lesson sign through `openLesson(id)`. Returns the model. */
export function plMountPathBoard(el, parishId, opts = {}) {
  const model = plPathBoard(parishId, opts);
  if (!el || !model) return model;
  const rowsHtml = (path) => {
    if (path.id === "trade") return path.rows.map((r) => `<li><strong>${plEsc(r.label)}</strong> — ${r.stations.map((st) => `<a href="${plEsc(st.href)}">${plEsc(st.label)}</a>`).join(", ")}</li>`).join("");
    if (path.id === "classroom") return path.rows.map((r) => `<li><button type="button" class="btn" data-pl-lesson="${plEsc(r.id)}">${plEsc(r.label)}</button> <span class="sl-small">at ${plEsc(r.siteName)} · <a href="${plEsc(r.stationHref)}">classroom station</a></span></li>`).join("");
    return path.rows.map((r) => `<li><button type="button" class="btn" data-pl-lesson="${plEsc(r.lesson)}">Side quest: ${plEsc(r.label)}</button> <span class="sl-small">at ${plEsc(r.siteName)}</span></li>`).join("");
  };
  el.innerHTML = `<div class="sl-board" role="group" aria-label="Choose your path in ${plEsc(model.name)}"><h2>Choose your path</h2>${model.paths.map((p) =>
    `<section class="sl-path" data-sl-path="${plEsc(p.id)}"><h3><button type="button" data-sl-pick="${plEsc(p.id)}">${plEsc(p.title)}</button></h3><p class="sl-small">${plEsc(p.blurb)}</p><ul>${rowsHtml(p)}</ul></section>`).join("")}</div>`;
  plWireLessons(el, opts.openLesson);
  if (typeof opts.onPick === "function") for (const b of el.querySelectorAll("[data-sl-pick]")) b.addEventListener("click", () => opts.onPick(b.getAttribute("data-sl-pick")));
  return model;
}

/** Counts for the console log and the hand-back. */
export function plCounts() {
  return { maps: PL_BAY_MAPS.length, districts: PL_DISTRICTS.length, lessons: PL_FIELD_LESSONS.length, bayLessons: PL_BAY_MAPS.reduce((n, d) => n + plBayLessons(d.id).length, 0), quests: PL_QUESTS.length };
}
