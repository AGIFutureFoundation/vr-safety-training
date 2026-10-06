// San Francisco on the play layer (console GOLDEN-B, docs/consoles/GOLDEN-B.md,
// docs/parish-play.md): the two GOLDEN-B districts' field lessons re-read on the
// play layer's shape (SECONDLINE's SL_FIELD_LESSONS: the Redwood shape plus
// `parish` and the trade `station`), and the districts' treasure sites for
// tools/gen_treasures.mjs. The lessons themselves live in each district's own
// `fieldLessons` (np-data-sf-*.js) so the parishes app's lesson signs and this
// layer read one source.
//
// Facts rule: nothing here states a date, a figure or a fact about a place; no
// coordinate lives here (a treasure's trigger is the district, the site and an
// offset, resolved at watch time by slTreasureAt as for the parishes). Every
// top-level name is prefixed `sg`/`SG_` (the bundler shares one scope).

import { NP_SF_MARINA } from "./np-data-sf-marina.js";
import { NP_SF_BAYVIEW } from "./np-data-sf-bayview.js";

/** The GOLDEN-B districts on the play layer: id, name, short name, its data module's file, and its sites. */
export const SG_DISTRICTS = [
  { id: NP_SF_MARINA.id, name: NP_SF_MARINA.name, short: "Marina", file: "WebXR/shared/np-data-sf-marina.js", data: NP_SF_MARINA },
  { id: NP_SF_BAYVIEW.id, name: NP_SF_BAYVIEW.name, short: "Bayview", file: "WebXR/shared/np-data-sf-bayview.js", data: NP_SF_BAYVIEW },
].map((d) => ({ ...d, sites: d.data.sites.map((s) => ({ id: s.id, name: s.name, kind: s.kind, stations: s.stations, programmes: s.programmes })) }));

/** Ten SF field lessons (five per district) on the play layer's shape: `{ id, parish, site, k12, station, trade, tradeLine, title, minutes, steps, check }`. */
export const SG_FIELD_LESSONS = SG_DISTRICTS.flatMap((d) => (d.data.fieldLessons ?? []).map((l) => ({
  id: l.id, parish: d.id, site: l.site, landmark: l.landmark ?? null, k12: l.k12, station: l.station,
  trade: l.trade, tradeLine: l.tradeLine, title: l.title, minutes: l.minutes, steps: l.steps, check: l.check, file: d.file,
})));

/** The hint a crew cache gives (the treasure layer's proximity finds off every SF site). */
export const SG_TREASURE_HINT = "Crews keep a fog-day kit near every San Francisco site. Walk the sites.";

export function sgDistrict(id) { return SG_DISTRICTS.find((d) => d.id === id) ?? null; }
export function sgLessonsFor(parishId, siteId = null) { return SG_FIELD_LESSONS.filter((l) => l.parish === parishId && (!siteId || l.site === siteId)); }
