// The ways out of the Oakland & East Bay districts into Bay World (console
// BAYMAP, docs/consoles/BAYMAP.md), on GOLDEN-B's pattern (shared/sg-ways.js):
// connectors of kind "world" whose far end is another world's page, keyed by
// the district they leave (`from.parish`) and written with the crossing's
// approximate `lonlat` and `position: null`, so the district's own module is
// never edited to carry one. shared/np-parishes.js appends bmWaysFor(id) to
// that district's connectors and projects the `from` end through the
// district's own fit.
//
// Each district leaves for its counterpart in Bay World: West Oakland for
// Bay World's West Oakland union hall, Downtown & the Lake for the lake loop
// boathouse, Fruitvale & the Estuary for the estuary's marina boatyard. `href`
// is the source-layout link, relative to WebXR/parishes/; tools/bundle_webxr.py
// flattens it to "./bayworld.html?site=<id>" in the published folder.
//
// Seam: bmWaysFor(parishId) -> [{ id, kind: "world", name,
//   from: { parish, position: null }, to: { world, site, name, href },
//   lonlat: [lon, lat], approximate: true }]
//
// Facts rule: places named only. Pure data; every top-level name is prefixed
// bm/BM_ (the bundler shares one scope).

export const BM_WAYS = [
  {
    id: "bm-wo-bay-world", kind: "world", name: "Mandela Parkway into Bay World's West Oakland",
    from: { parish: "oak-west-oakland", position: null },
    to: { world: "bayworld", site: "west-oakland-union-hall", name: "Bay World — West Oakland", href: "../bayworld/index.html?site=west-oakland-union-hall" },
    lonlat: [-122.290, 37.809], approximate: true,
  },
  {
    id: "bm-dl-bay-world", kind: "world", name: "The lakeshore into Bay World's Lake Loop",
    from: { parish: "oak-downtown-lake", position: null },
    to: { world: "bayworld", site: "lake-loop-boathouse", name: "Bay World — the Lake Loop", href: "../bayworld/index.html?site=lake-loop-boathouse" },
    lonlat: [-122.247, 37.805], approximate: true,
  },
  {
    id: "bm-fe-bay-world", kind: "world", name: "The estuary shore into Bay World's waterfront",
    from: { parish: "oak-fruitvale-estuary", position: null },
    to: { world: "bayworld", site: "estuary-marina-boatyard", name: "Bay World — the Estuary Waterfront", href: "../bayworld/index.html?site=estuary-marina-boatyard" },
    lonlat: [-122.245, 37.786], approximate: true,
  },
];

/** The world ways that leave one Oakland district (fresh copies, so a resolver may fill positions). */
export function bmWaysFor(parishId) {
  return BM_WAYS.filter((w) => w.from.parish === parishId).map((w) => ({ ...w, from: { ...w.from }, to: { ...w.to } }));
}
