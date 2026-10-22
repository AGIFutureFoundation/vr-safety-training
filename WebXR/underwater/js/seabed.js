// The Deep — the seabed adapter (the dive game's city.js).
//
// Imports the pure seabed data from DEEP1's WebXR/shared/underwater-data.js
// (the ONE import line below; ./seabed-stub.js is the pre-integration stub
// in the same contract shape this app shipped against before that landed,
// kept in the tree but no longer bundled, the way bayworld/js/world-stub.js
// is) — and adapts its shapes to what the rest of this app reads: a zone's
// `centre` becomes `center` plus a plain `color` (its palette accent); a site's
// or landmark's 2-vector `position:[x,z]` becomes this platform's 3-vector
// `[x, y, z]` with y the seabed at that point (negative: below the surface);
// deepZoneAt()'s zone object becomes an id; deepLineAt()'s null becomes
// `{ onLine: false }`.
//
// The adapted lists are named DV_ZONES/DV_SITES/DV_LANDMARKS/DV_LINES and the
// wrapped lookups dvZoneAt()/dvLineAt()/dvDepthAt() — never the shared
// module's own DEEP_* names — because tools/bundle_webxr.py concatenates every
// module into one flat script: a second top-level `const DEEP_ZONES` here
// would redeclare the data module's own. DEEP_BOUNDS, DEEP_DEPTH_RANGE and
// DEEP_MESH_BUDGET need no adapter and are re-exported unchanged. Pure: no
// three.js, so every module that imports from here runs headless.
import {
  DEEP_BOUNDS, DEEP_DEPTH_RANGE, DEEP_ZONES, DEEP_LANDMARKS, DEEP_SITES, DEEP_LINES, DEEP_MESH_BUDGET,
  deepDepthAt, deepZoneAt, deepLineAt,
} from "../../shared/underwater-data.js";

export { DEEP_BOUNDS, DEEP_DEPTH_RANGE, DEEP_MESH_BUDGET };

function dvTo3(position) { return [position[0], -deepDepthAt(position[0], position[1]), position[1]]; }

/** DEEP1's zones, adapted: `centre` -> `center`, plus a `color`. */
export const DV_ZONES = DEEP_ZONES.map((z) => ({ ...z, center: z.centre, color: z.palette.accent }));
/** DEEP1's sites, adapted to a 3-vector position on the seabed. */
export const DV_SITES = DEEP_SITES.map((s) => ({ ...s, position: dvTo3(s.position) }));
/** DEEP1's landmarks, adapted the same way. */
export const DV_LANDMARKS = DEEP_LANDMARKS.map((l) => ({ ...l, position: dvTo3(l.position) }));
/** The dive lines, unchanged in shape. */
export const DV_LINES = DEEP_LINES;

/** The zone id nearest (x, z). */
export function dvZoneAt(x, z) { return deepZoneAt(x, z).id; }

/** `{ onLine: true, id, heading }` on a dive line, else `{ onLine: false }`. */
export function dvLineAt(x, z) { return deepLineAt(x, z) ?? { onLine: false }; }

/** Seabed depth (positive metres) at (x, z) — gameplay and scenery only,
 *  never shown to a learner as a number or a limit. */
export function dvDepthAt(x, z) { return deepDepthAt(x, z); }

/** The seabed's y (negative) at (x, z). */
export function dvFloorY(x, z) { return -deepDepthAt(x, z); }
