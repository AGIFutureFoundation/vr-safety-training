// The track list. One module per track under WebXR/race/tracks/; adding a
// track is a new data file, an import here and a line in the bundler's module
// list for "race" (tools/bundle_webxr.py). The Grand Prix runs them in this
// order.
import { TRACK_NIGHT_HIGHWAY } from "../tracks/night-highway.js";
import { TRACK_PORT_TERMINAL } from "../tracks/port-terminal.js";
import { TRACK_BAY_FOG_SPAN } from "../tracks/bay-fog-span.js";
import { TRACK_QUARRY_HAUL } from "../tracks/quarry-haul.js";
import { TRACK_DOWNTOWN_SITE } from "../tracks/downtown-site.js";

export const RACE_TRACKS = [
  TRACK_NIGHT_HIGHWAY,
  TRACK_PORT_TERMINAL,
  TRACK_BAY_FOG_SPAN,
  TRACK_QUARRY_HAUL,
  TRACK_DOWNTOWN_SITE,
];

export function rcTrackDef(id) {
  return RACE_TRACKS.find((t) => t.id === id) ?? RACE_TRACKS[0];
}
