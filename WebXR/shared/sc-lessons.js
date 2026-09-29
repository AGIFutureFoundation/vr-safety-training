// SCHOLAR — every K-12 lesson that can start a session, across every world (docs/consoles/SCHOLAR.md).
//
// The in-world panel registers only its own world's lessons (a world bundle never carries another's
// data); this index reads them all for the scoreboard page (WebXR/scholar/index.html) and
// tools/check_scholar.mjs: the shared field lessons (Bay World, the Deep, the Regatta, Fairway Park),
// Sierra Summit's and Redwood Reach's own, the ten parish and district maps' field lessons and
// BAYOU's parish lessons. Each entry is in sc-scholar.js's session shape with its world, its site and
// a position (the site's own when the lesson carries none).
//
// Every top-level name carries the `sc`/`SC_` prefix (the bundler shares one scope).

import { scNormalise } from "./sc-scholar.js";
import { K2_FIELD_LESSONS } from "./field-lessons.js";
import { SM_FIELD_LESSONS, SM_SITES, SM_LANDMARKS } from "./summit-data.js";
import { RW_SITES, RW_LANDMARKS } from "../redwood/js/rw-data.js";
import { RW_FIELD_LESSONS } from "../redwood/js/rw-lore-data.js";
import { NP_PARISHES } from "./np-parishes.js";
import { BY_LESSONS } from "./by-parish-lessons.js";

/** Where each world's page lives, relative to WebXR/ (the scoreboard links a lesson back to its world). */
export const SC_WORLD_PAGES = {
  bayworld: "bayworld/index.html", deep: "underwater/underwater.html", regatta: "regatta/regatta.html", fairway: "fairway/index.html",
  summit: "summit/index.html", redwood: "redwood/redwood.html", parishes: "parishes/parishes.html",
};

const scPos = (p) => (Array.isArray(p) ? p : p && Number.isFinite(p.x) ? [p.x, p.z] : null);

/** The sites (and landmarks) of each world, id → { name, position }, for resolving a lesson's anchor. */
export function scSitesOf(world, parish = null) {
  const m = new Map();
  const add = (list) => { for (const s of list ?? []) m.set(s.id, { id: s.id, name: s.name ?? s.id, position: scPos(s.position ?? s.at), stations: s.stations ?? [] }); };
  if (world === "summit") { add(SM_SITES); add(SM_LANDMARKS); }
  else if (world === "redwood") { add(RW_SITES); add(RW_LANDMARKS); }
  else if (world === "parishes") { const p = NP_PARISHES.find((x) => x.id === parish); add(p?.sites); add(p?.landmarks); }
  return m;
}

function scBuild() {
  const out = [], seen = new Set();
  const push = (raw, where) => {
    const l = scNormalise(raw, where);
    if (!l || seen.has(l.id)) return;
    if (!l.position && where.sites) l.position = where.sites.get(l.site)?.position ?? null;
    l.source = where.source;
    seen.add(l.id); out.push(l);
  };
  for (const l of K2_FIELD_LESSONS) push(l, { world: l.world, source: "field-lessons" });
  const sm = scSitesOf("summit");
  for (const l of SM_FIELD_LESSONS) push(l, { world: "summit", sites: sm, source: "summit" });
  const rw = scSitesOf("redwood");
  for (const l of RW_FIELD_LESSONS) push(l, { world: "redwood", sites: rw, source: "redwood" });
  for (const p of NP_PARISHES) {
    const sites = scSitesOf("parishes", p.id);
    for (const l of p.fieldLessons ?? []) push({ ...l, parish: p.id }, { world: "parishes", parish: p.id, sites, source: "parish-map" });
  }
  for (const l of BY_LESSONS) push(l, { world: "parishes", parish: l.parish, sites: scSitesOf("parishes", l.parish), source: "bayou" });
  return out;
}

/** Every lesson that can start a session, in the session shape (built once). */
export const SC_LESSONS = scBuild();

/** The lessons of one world (and one parish or district when given). */
export function scLessonsFor(world, parish = null) { return SC_LESSONS.filter((l) => l.world === world && (!parish || l.parish === parish)); }

/** Sites that carry a K-12 station among their own stations (a session can point at the station there). */
export function scK12Sites() {
  const out = [];
  for (const p of NP_PARISHES) for (const s of p.sites ?? []) for (const st of s.stations ?? []) if (/^k12-/.test(st)) out.push({ world: "parishes", parish: p.id, site: s.id, station: st });
  return out;
}
