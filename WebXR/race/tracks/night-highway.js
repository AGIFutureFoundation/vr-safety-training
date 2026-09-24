// Track: Night Highway Circuit — the original course.
//
// An elevated city freeway at night drawn as a figure of eight: the lap climbs
// onto an overpass and crosses over its own lower carriageway, threads a lit
// tunnel through a tower podium, sweeps banked along the seafront under a full
// moon, and weaves a toll-plaza chicane on the east side. Civilian traffic
// (sedans and tractor-trailers) runs in both directions: the race-direction
// lanes on the right, the oncoming lanes on the left, as on a real freeway.
//
// Everything here is data; WebXR/race/js/track.js compiles it and
// WebXR/race/js/world.js dresses it. Positions are metres; `u` is a float
// control-point index (see track.js). The layout is this platform's own.

export const TRACK_NIGHT_HIGHWAY = {
  id: "night-highway",
  name: "Night Highway Circuit",
  short: "Night Highway",
  blurb: "Elevated city freeway at night: an overpass figure of eight, a lit tunnel, a toll-plaza chicane and a banked seaside sweep under a full moon. Traffic both ways.",
  width: 22,
  baseY: 7,
  surface: "asphalt",
  barrier: "jersey",
  support: "pillars",
  groundY: 0,
  markings: { centre: "yellow", dashes: [-5.5, 5.5], edge: true },
  env: {
    sky: ["#03060f", "#16203b"], fog: ["#0a0f1e", 160, 820],
    hemi: ["#7f93c8", "#141824", 0.7], sun: { colour: "#c9d6ff", intensity: 0.75, dir: [-0.7, 0.55, 0.15] },
    stars: true, moon: { dir: [-1, 0.28, 0.05], size: 34 }, ground: "#090c13", exposure: 1.15,
  },
  points: [
    [210, -148, 7],     // 0 start / finish, heading west along the south straight
    [140, -142, 7],
    [72, -92, 7],
    [0, 0, 7],          // 3 the lower crossing (under the overpass)
    [-62, 78, 7],
    [-118, 128, 7],     // 5 tunnel portal
    [-180, 150, 7],
    [-242, 136, 7],     // 7 tunnel exit
    [-288, 90, 6, 6],   // 8 the seaside sweep begins
    [-314, 22, 5, 12],
    [-306, -48, 5, 12],
    [-266, -110, 5, 10],
    [-200, -146, 6, 4],
    [-128, -128, 8],
    [-62, -62, 12],
    [0, 0, 16],         // 15 the overpass, nine metres above point 3
    [62, 62, 13],
    [118, 112, 9],
    [184, 138, 7],
    [246, 118, 7],
    [284, 72, 7],
    [291, 32, 7],       // 21 chicane in
    [285, 4, 7],
    [292, -22, 7],      // 23 toll plaza straight
    [292, -62, 7],
    [278, -104, 7],     // 25 chicane out
    [250, -138, 7],
  ],
  zones: [
    { kind: "tunnel", from: 5.1, to: 7.0 },
    { kind: "seaside", from: 8, to: 12 },
  ],
  boostPads: [
    { u: 1.4, d: -4 }, { u: 5.8, d: 0 }, { u: 9.4, d: 5 }, { u: 10.6, d: -5 },
    { u: 14.4, d: 0 }, { u: 17.6, d: 4 }, { u: 19.5, d: -4 }, { u: 25.6, d: 0 },
  ],
  itemBoxes: [
    { u: 2.3, ds: [-8, -3, 3, 8] },
    { u: 12.4, ds: [-8, -3, 3, 8] },
    { u: 18.4, ds: [-8, -3, 3, 8] },
  ],
  hazards: [
    {
      kind: "traffic", count: 10, mix: { sedan: 6, tractorTrailer: 4 }, speed: [13, 19],
      lanes: [{ d: -8, dir: 1 }, { d: -2.8, dir: 1 }, { d: 2.8, dir: -1 }, { d: 8, dir: -1 }],
    },
    { kind: "booths", u: 23.45, ds: [-7.4, 0, 7.4], len: 5, w: 2.4 },
  ],
  scenery: [
    { kind: "skyline", count: 70, area: [-280, -330, 460, 330], height: [22, 95], avoid: 24, seed: 11 },
    { kind: "skyline", count: 26, area: [60, -90, 240, 90], height: [40, 140], avoid: 20, seed: 12 },
    { kind: "skyline", count: 18, area: [-240, -90, -60, 90], height: [30, 120], avoid: 20, seed: 13 },
    { kind: "sea", x0: -345 },
    { kind: "moon" },
    { kind: "tunnel", from: 5.1, to: 7.0 },
    { kind: "tollPlaza", u: 23.45 },
    { kind: "lamps", every: 34, height: 10, colour: "#ffc978" },
    { kind: "overheadSign", u: 0.6, text: "CIRCUIT  LAP LINE" },
    { kind: "overheadSign", u: 13.6, text: "OVERPASS  KEEP RIGHT" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 8, gap: 7 },
};
