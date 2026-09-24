// Track: Bay Fog Span.
//
// A long suspension-bridge deck in the evening fog, raced as a dog-bone: out
// along one carriageway, round a balloon loop on the far shore, back along the
// other, round the near-shore loop to the line. The towers are painted
// International Orange; the bridge is a generic one of its type and no real
// structure is named or copied. A work zone closes the right-hand lane of the
// outbound deck behind a cone taper and an arrow board, with a bucket truck
// parked in the closure. Traffic keeps to its own carriageway, so the other
// deck's traffic is always coming at you across the median.

export const TRACK_BAY_FOG_SPAN = {
  id: "bay-fog-span",
  name: "Bay Fog Span",
  short: "Bay Fog Span",
  blurb: "A long suspension-bridge deck in fog under International Orange towers, a work-zone lane closure behind cones, and balloon loops on either shore.",
  width: 13,
  baseY: 22,
  surface: "deck",
  barrier: "rail",
  support: "deck",
  groundY: 0,
  markings: { centre: "none", dashes: [0], edge: true },
  env: {
    sky: ["#3b4450", "#7c8791"], fog: ["#7d8893", 30, 250],
    hemi: ["#c9d3dc", "#3b3f44", 1.0], sun: { colour: "#ffd2a1", intensity: 0.55, dir: [0.3, 0.35, -0.8] },
    stars: false, ground: "#3d4a52", exposure: 1.0,
  },
  points: [
    [8, -200, 22],      // 0 start / finish, northbound on the east carriageway
    [8, 0, 22],
    [8, 200, 22],
    [8, 300, 21],
    [28, 372, 16],      // 4 north balloon loop
    [72, 420, 12, 6],
    [48, 486, 10, 8],
    [-8, 500, 10, 8],
    [-60, 470, 11, 6],
    [-58, 410, 14],
    [-8, 340, 19],
    [-8, 250, 22],      // 11 southbound on the west carriageway
    [-8, 0, 22],
    [-8, -250, 22],
    [-8, -340, 19],
    [-58, -410, 14],    // 15 south balloon loop
    [-60, -470, 11, 6],
    [-8, -500, 10, 8],
    [48, -486, 10, 8],
    [72, -420, 12, 6],
    [28, -372, 16],
    [8, -300, 21],
  ],
  zones: [{ kind: "workzone", from: 1.2, to: 1.9 }],
  boostPads: [
    { u: 0.4, d: 3 }, { u: 2.5, d: -3 }, { u: 6.5, d: 0 }, { u: 11.5, d: 3 },
    { u: 12.7, d: -3 }, { u: 17.5, d: 0 },
  ],
  itemBoxes: [
    { u: 0.8, ds: [-4.5, -1.5, 1.5, 4.5] },
    { u: 9.8, ds: [-4.5, -1.5, 1.5, 4.5] },
    { u: 13.3, ds: [-4.5, -1.5, 1.5, 4.5] },
  ],
  hazards: [
    {
      kind: "traffic", count: 9, mix: { sedan: 6, tractorTrailer: 3 }, speed: [12, 17],
      lanes: [{ d: -3.1, dir: 1 }, { d: 3.1, dir: 1 }],
    },
    { kind: "cones", from: 1.15, to: 1.95, d: -0.6, taper: 0.12, spacing: 6 },
    { kind: "parked", u: 1.55, d: -3.4, vehicle: "bucketTruck" },
  ],
  scenery: [
    { kind: "water", y: 0 },
    { kind: "suspension", from: 0.9, to: 13.1, towersZ: [-170, 170], deckY: 22, towerH: 118, colour: "#c0452b" },
    { kind: "arrowBoard", u: 1.1, d: -5.2 },
    { kind: "hills", at: [[0, 640], [0, -640], [-260, 560], [260, -560]] },
    { kind: "lamps", every: 30, height: 9, colour: "#ffb45c" },
  ],
  grid: { back: 12, rows: 4, cols: 2, spacing: 10, gap: 5.5 },
};
