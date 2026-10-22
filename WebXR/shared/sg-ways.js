// The ways out of the San Francisco districts into other worlds (console
// GOLDEN-B, docs/consoles/GOLDEN-B.md): connectors of kind "world" whose far
// end is another world's page, not a parish map. Each is keyed by the
// district it leaves (`from.parish`) and written with the crossing's
// approximate `lonlat` and `position: null`, so the district's own module is
// never edited to carry it: shared/np-parishes.js appends sgWaysFor(id) to
// that district's connectors and projects the `from` end through the
// district's own fit once the district is registered (until then the way is
// simply not drawn).
//
// The Bay Bridge leaves Downtown & Embarcadero for Bay World's West Oakland:
// the parishes app draws it as a way out and crosses with lkWorldLink (the
// passport lives in this origin's local storage, so the learner's record
// crosses with them); Bay World's Atlas and map carry the way back
// (SG_WAY_BACK). `href` is the source-layout link, relative to
// WebXR/parishes/; tools/bundle_webxr.py flattens it to
// "./bayworld.html?site=<id>" in the published folder.
//
// Facts rule: the bridge and the neighbourhoods are named only, as places.
// Pure data; every top-level name is prefixed sg/SG_ (the bundler shares one
// scope).

export const SG_WAYS = [
  {
    id: "sf-bay-bridge", kind: "world", name: "The Bay Bridge east to Bay World",
    from: { parish: "sf-downtown", position: null },
    to: { world: "bayworld", site: "west-oakland-union-hall", name: "Bay World — West Oakland", href: "../bayworld/index.html?site=west-oakland-union-hall" },
    lonlat: [-122.387, 37.79], approximate: true,
  },
];

/** The way back from Bay World (its Atlas and its map), relative to WebXR/bayworld/. */
export const SG_WAY_BACK = { label: "The Bay Bridge back to San Francisco", href: "../parishes/parishes.html?parish=sf-downtown", parish: "sf-downtown", connector: "sf-bay-bridge" };

/** The world ways that leave one district (fresh copies, so a resolver may fill positions). */
export function sgWaysFor(parishId) {
  return SG_WAYS.filter((w) => w.from.parish === parishId).map((w) => ({ ...w, from: { ...w.from }, to: { ...w.to } }));
}
