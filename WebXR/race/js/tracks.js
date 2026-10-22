// The track list. One module per track under WebXR/race/tracks/; adding a
// track is a new data file, an import here and a line in the bundler's module
// list for "race" (tools/bundle_webxr.py). The Grand Prix runs them in this
// order.
import { TRACK_NIGHT_HIGHWAY } from "../tracks/night-highway.js";
import { TRACK_PORT_TERMINAL } from "../tracks/port-terminal.js";
import { TRACK_BAY_FOG_SPAN } from "../tracks/bay-fog-span.js";
import { TRACK_QUARRY_HAUL } from "../tracks/quarry-haul.js";
import { TRACK_DOWNTOWN_SITE } from "../tracks/downtown-site.js";
import { TRACK_BEACH_BOARDWALK } from "../tracks/beach-boardwalk.js";
import { TRACK_COLD_STORAGE } from "../tracks/cold-storage.js";
import { TRACK_AURORA_SKYWAY } from "../tracks/aurora-skyway.js";
import { TRACK_MARSH_LEVEE } from "../tracks/marsh-levee.js";
import { TRACK_QUARRY_NIGHT_SHIFT } from "../tracks/quarry-night-shift.js";
import { rcMirrorTrackDef } from "./track.js";

export const RACE_TRACKS = [
  TRACK_NIGHT_HIGHWAY,
  TRACK_PORT_TERMINAL,
  TRACK_BAY_FOG_SPAN,
  TRACK_QUARRY_HAUL,
  TRACK_DOWNTOWN_SITE,
  TRACK_BEACH_BOARDWALK,
  TRACK_COLD_STORAGE,
  TRACK_AURORA_SKYWAY,
  TRACK_MARSH_LEVEE,
  TRACK_QUARRY_NIGHT_SHIFT,
];

// Mirror class: every course above, flipped left-right (track.js
// rcMirrorTrackDef). Unlocked by finishing a Master Grand Prix in the top
// three (sim.js rcApplyGrandPrix), the same localStorage unlock pattern as
// the engine classes.
export const RACE_TRACKS_MIRROR = RACE_TRACKS.map(rcMirrorTrackDef);
const RACE_TRACKS_ALL = [...RACE_TRACKS, ...RACE_TRACKS_MIRROR];

export function rcTrackDef(id) {
  return RACE_TRACKS_ALL.find((t) => t.id === id) ?? RACE_TRACKS[0];
}

/** The mirrored id for a base track id, e.g. "night-highway" -> "night-highway-mirror". */
export function rcMirrorId(id) {
  return `${id}-mirror`;
}

/** True when `id` names a mirrored course. */
export function rcIsMirrorId(id) {
  return RACE_TRACKS_MIRROR.some((t) => t.id === id);
}
