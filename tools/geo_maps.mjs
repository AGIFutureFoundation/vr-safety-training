// GEO (docs/geo.md): print every map's lon/lat box and scene<->geo fit as JSON, for tools/geo_bake.py.
// Usage: node tools/geo_maps.mjs > maps.json. Pure: reads the registry, requests nothing.
import { NP_PARISHES, npRegionOf } from "../WebXR/shared/np-parishes.js";
import { npBounds, npGeoFit } from "../WebXR/shared/np-geo.js";

const out = NP_PARISHES.map((p) => {
  const b = npBounds(p), f = npGeoFit(p);
  // BACKDROPS-2: the box width (km, for the budget tier) and the flags that rule a real backdrop out.
  const km = (b.maxLon - b.minLon) * 111.32 * Math.cos(((b.minLat + b.maxLat) / 2) * Math.PI / 180);
  return { id: p.id, name: p.name, region: npRegionOf(p), size: p.size ?? 4096, bounds: [b.minLon, b.minLat, b.maxLon, b.maxLat], lon: f.lon, lat: f.lat,
    km: Math.round(km * 10) / 10, representative: p.representative === true, procedural: p.procedural === true, relief: p.relief ?? null };
});
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
