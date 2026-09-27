// The city, one import away from the real thing.
//
// Team BAY1 is landing WebXR/shared/bayworld-data.js (the pure city: BAY_BOUNDS,
// BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES, bayHeight, bayZoneAt,
// bayRoadAt) and WebXR/shared/bayworld.js (buildBayWorld(parent, opts),
// bayLighting(time), built over that data). Bay World is written against that
// exact interface from day one but ships today against world-stub.js's small
// original city, so the app and its checks run before the real modules land.
//
// The switch is exactly the two import lines below: once
// WebXR/shared/bayworld-data.js and WebXR/shared/bayworld.js both exist,
// change "./world-stub.js" in each to "../../shared/bayworld-data.js" and
// "../../shared/bayworld.js" respectively, and swap the matching lines in
// tools/bundle_webxr.py's "bayworld" module list from
// WEBXR / "bayworld/js/world-stub.js" to SHARED / "bayworld-data.js" and
// SHARED / "bayworld.js". Nothing else in this app names the city module
// directly — every other file imports from here.
import {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES,
  bayHeight, bayZoneAt, bayRoadAt, BAY_ROAD_HALF, BAY_ROAD_SHOULDER,
} from "./world-stub.js";
import { buildBayWorld, bayLighting } from "./world-stub.js";

export {
  BAY_BOUNDS, BAY_ZONES, BAY_LANDMARKS, BAY_ROADS, BAY_SITES,
  bayHeight, bayZoneAt, bayRoadAt, BAY_ROAD_HALF, BAY_ROAD_SHOULDER,
  buildBayWorld, bayLighting,
};

// bayJunctions() and bayBuildings() are stub-only conveniences (ambient
// traffic's junction table and the deterministic building footprints sim.js
// collides vehicles against) — not part of BAY1's own interface, so unlike
// everything above they are never re-exported through this switch. sim.js
// imports them straight from "./world-stub.js", the same way fairway/js/
// world.js imports buildFairwayPark straight from shared/fairway.js rather
// than through course.js: a convenience the stub (or the landed module)
// happens to offer, not a contract every future implementation must keep.
