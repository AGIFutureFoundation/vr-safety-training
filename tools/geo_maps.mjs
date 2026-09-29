// GEO (docs/geo.md): print every map's lon/lat box and scene<->geo fit as JSON, for tools/geo_bake.py.
// Usage: node tools/geo_maps.mjs > maps.json. Pure: reads the registry, requests nothing.
import { NP_PARISHES, npRegionOf } from "../WebXR/shared/np-parishes.js";
import { npBounds, npGeoFit } from "../WebXR/shared/np-geo.js";

const out = NP_PARISHES.map((p) => {
  const b = npBounds(p), f = npGeoFit(p);
  return { id: p.id, name: p.name, region: npRegionOf(p), size: p.size ?? 4096, bounds: [b.minLon, b.minLat, b.maxLon, b.maxLat], lon: f.lon, lat: f.lat };
});
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
