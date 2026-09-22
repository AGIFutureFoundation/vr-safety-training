import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, instrument, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pollution Patrol VR — Community Environmental Justice,
// Hunters Point Edition.
//
// A Community Pollution Patrol shift on the public side of a fenced
// cleanup parcel: the route walked in order, the wind read off a handheld
// meter, an odour-and-dust event logged with time, place, photo and
// description, the Air District complaint filed with the fields it needs,
// and the fence itself — a line a patrol works from the outside of, never
// through.
//
// Sited generically on a public street beside a fenced parcel under a
// federal cleanup order; no real site, agency office or resident is named
// or implied.

const ODC_ACCENT = 0xe4622a;

export const SIM_ODOR_COMPLAINT_LOG = {
  id: "odor-complaint-log",
  index: "150",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "Community Pollution Patrol Network practice; the Bay Area Air Quality Management District's complaint and Community Advisory Council process; OSHA 29 CFR 1910.120 HAZWOPER for anyone who crosses the fence, which a patrol member never does; EPA Superfund community involvement guidance for a parcel under a federal cleanup order",
  name: "Pollution Patrol",
  title: simTitle("Pollution Patrol"),
  tagline: "A patrol shift worked from the public side of the fence: the route in order, the wind off a handheld meter, an event logged with time, place, photo and description, and the complaint filed with the fields the Air District needs",
  accent: ODC_ACCENT,
  accentCss: "#e4622a",
  parSeconds: 250,
  footprint: 2.4,
  badge: { id: "fence-line-record", name: "Fence-Line Record", note: "A route walked in order, an event logged completely, and a complaint filed without ever stepping past the fence" },

  game: system({
    name: "Patrol Log",
    currency: "OBSERVATION",
    ranks: ["Patrol Trainee", "Patrol Member", "Route Lead", "Complaint Steward", "Patrol Log Certified"],
    badges: [
      { id: "route-walked-right", name: "Route Walked Right", note: "Covered every waypoint in the order the route sets", test: AWARD.stepClean("walk-route") },
      { id: "never-crossed", name: "Never Crossed", note: "Never went past the fence, no matter what was on the other side of it", test: AWARD.safe },
      { id: "wind-read-true", name: "Wind Read True", note: "Held the handheld meter's reading inside its band on the first try", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections through the whole patrol", test: AWARD.clean },
      { id: "distance-held", name: "Distance Held", note: "Never broke the safe-distance hold at the fence", test: AWARD.unbroken },
      { id: "shift-fast", name: "Shift Fast", note: "Route walked, event logged and complaint filed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "walk-in": "You went through the gap in the fence to get a closer look. A community monitor works this line from the public side of it — a fenced parcel under a cleanup order is behind fences and institutional controls for a reason nobody standing outside can fully see, and the photo from three feet closer is not worth becoming the incident the patrol exists to prevent, not report.",
    "ignore-load": "You waved the uncovered haul truck through without noting it. A truck leaving an active parcel with no tarp over its load is not a detail for later — it is dust the wind is already carrying past this fence line while the patrol watches, and the one thing standing between that and a written record is somebody choosing to write it down.",
    "guess-wind": "You logged a wind direction without actually reading the handheld meter. The wind is what tells the Air District whether this parcel could plausibly be the source of what you smelled, and a guessed direction that happens to be wrong does not just weaken this complaint — it can point an inspector at the wrong fence line entirely.",
    "file-incomplete": "You filed the complaint without the photo and description attached. An inspector who cannot see what the patrol saw, or read what it smelled like and how strong, is left deciding whether to act on a time and a place alone — and a complaint an inspector cannot act on confidently is one that teaches the district to expect less detail from this patrol next time, not more.",
  },

  lateNotes: {
    "wind-meter": "Orient the meter into the wind before reading it — a reading taken side-on to the wind is not a direction, it is a guess with a number attached.",
    "map-pin": "There is nothing to pin to the map until you have actually found the event's source.",
    "file-complaint": "The complaint needs the wind reading, the pinned location and the logged event before it is worth filing — check all three are on the record first.",
  },

  interrupts: [
    {
      id: "gap-photo",
      kind: "Partner heading for the fence",
      after: "find-event", delay: 3, seconds: 13,
      alert: "Your partner has started through the gap in the fence to get a closer photo of the source.",
      cue: "Your partner is already halfway to the gap in the fence line.",
      target: "call-back",
      why: "A patrol's whole value is that it documents from a position nobody can call unsafe or unauthorised, and one photo taken from inside the fence turns a credible, unanswerable observation into a trespass an inspector — or the parcel's own operator — can use to dismiss everything else the patrol reported that day. Calling your partner back now is the only response that reaches them before the fence line does.",
      missNote: "Nobody called out, and your partner went through the gap to get the shot. Whatever that photo shows, it was taken by someone who is not supposed to be there, and the patrol's whole report for today now has that fact attached to it whether the source photo was worth it or not.",
      wrongNote: "That does not reach your partner. Call them back before they cross the fence — nothing at the log table changes what is happening at the gap.",
    },
    {
      id: "untarped-truck",
      kind: "Uncovered haul truck",
      after: "log-event", delay: 4, seconds: 13,
      alert: "A truck is pulling out of the parcel's gate with an uncovered load, dust already blowing off the back of it.",
      cue: "An uncovered truck is leaving the site right now, past the patrol.",
      target: "photograph-truck",
      why: "A truck like this is gone in under a minute, and a haul-route violation nobody photographed is a haul-route violation nobody can prove happened — the license plate, the time and the open load all have to be caught in the same frame before the truck turns the corner, because there will not be a second chance at this exact vehicle.",
      missNote: "The truck pulled away uncovered and nobody got the shot. The patrol still smelled the dust and can still say a truck left without a tarp, but without the photo there is no way to identify which truck, and that is the difference between a complaint an inspector can follow up on and one they cannot.",
      wrongNote: "That is not the truck. Get the camera on the load and the plate before it clears the gate, not on the log you were already holding.",
    },
  ],

  steps: [
    {
      id: "muster", kind: "select", target: "patrol-kit",
      title: "Check the patrol kit and brief your partner",
      cue: "Confirm the handheld meter, camera, notebook and radio are all in the bag before heading out.",
      why: "A patrol that discovers a dead meter battery or a full memory card three blocks from the truck has already lost the one chance it had to document whatever it finds today — checking the kit at the start, together, is what keeps a real event from going unrecorded for a reason that had nothing to do with the event itself.",
    },
    {
      id: "fence-signage", kind: "select", target: "fence-signage",
      title: "Read the exclusion boundary",
      cue: "Check the fence-line signage marking where the parcel's cleanup order puts the public side of the line.",
      why: "The fence is not a suggestion — it marks the boundary of an active cleanup parcel's institutional controls, and a patrol member has to know exactly where that line runs before the shift starts, not discover it by accident while chasing a smell toward it.",
    },
    {
      id: "patrol-route", kind: "select", target: "patrol-route-card",
      title: "Read today's assigned route",
      cue: "Check today's segment and waypoints before starting the walk.",
      why: "The network's routes are assigned so that the whole fence line gets covered across a week rather than the same easy stretch every shift — a patrol that improvises its own path leaves gaps in the record exactly where nobody happens to have walked recently.",
    },
    {
      id: "walk-route", kind: "sequence",
      targets: ["waypoint-1", "waypoint-2", "waypoint-3"],
      itemNames: { "waypoint-1": "waypoint 1", "waypoint-2": "waypoint 2", "waypoint-3": "waypoint 3" },
      itemNotes: {
        "waypoint-1": "The route starts at the near corner, the standard check-in point for this segment.",
        "waypoint-2": "The midpoint sits opposite the parcel's old loading gate, where past complaints have clustered.",
        "waypoint-3": "The far corner closes the segment and hands off to whichever patrol covers the next block.",
      },
      title: "Walk the route in order",
      cue: "Cover waypoint 1, then 2, then 3 — the order the route assigns, not whichever looks interesting first.",
      why: "Walking the waypoints in the assigned order is what lets the network compare this shift's coverage to every other shift's on the same route, and a patrol that jumps straight to the spot where something smells interesting today is a patrol that quietly stops covering the rest of the line the way the route was designed to.",
      outOfOrderNote: "The route runs corner to midpoint to corner. Skipping ahead to wherever seems interesting leaves the rest of the segment uncovered today.",
    },
    {
      id: "wind-orient", kind: "turn", target: "meter-vane",
      title: "Orient the handheld meter into the wind",
      cue: "Turn the meter's vane until it settles facing into the wind.",
      why: "A wind reading only means something if the meter is actually facing the wind when it is taken — turned even a little off-axis, the same instrument reports a direction and speed that describe nothing real, and the complaint that follows would be built on a number the meter never actually measured.",
      turn: { turns: 0.5, axis: "y", label: "METER VANE" },
    },
    {
      id: "wind-read", kind: "gauge", target: "wind-meter",
      title: "Read the wind speed and direction",
      cue: "Hold the reading steady and commit once it settles in the meter's valid range.",
      why: "The wind direction is what tells the Air District whether this fenced parcel could plausibly be upwind of what the patrol is about to log, and a reading taken and committed properly, rather than glanced at once, is what keeps that number defensible when an inspector checks it against the day's actual weather.",
      gauge: {
        label: "WIND", speed: 0.7, green: [0.4, 0.62],
        readout: (t) => `${Math.round(t * 25)} mph`,
        missNote: "That reading has not settled. Hold the meter steady until the speed stops jumping before committing it.",
      },
    },
    {
      id: "hold-distance", kind: "hold", target: "safe-distance-mark", seconds: 5,
      title: "Hold position at the marked safe distance",
      cue: "Stay behind the marked line while you scan the fence line for the source.",
      why: "Standing still at the marked distance for a moment before doing anything else is what lets a patrol member actually place where a smell or a dust cloud is coming from — moving toward it immediately, before the source is even located, is how a patrol ends up closer to the fence than the shift ever needed anyone to be.",
      holdBreakNote: "You moved before the scan finished. Stepping toward the fence before the source is actually located is exactly the habit that puts a patrol member at the gap without meaning to be there.",
    },
    {
      id: "find-event", kind: "find", noHint: true,
      targets: ["odor-source"],
      itemNames: { "odor-source": "the dust and odour source" },
      itemNotes: { "odor-source": "A haze is drifting off a disturbed patch inside the fence line, downwind of where the patrol is standing — that is the source to log, not to approach." },
      title: "Locate the source from the public side of the fence",
      cue: "Scan the fence line and click where the dust and odour are actually coming from.",
      why: "Naming the source's location precisely, from where the patrol is standing, is what turns 'something smells off around here' into an observation an inspector can go check against a specific point on the parcel — vague is not evidence, and it does not require crossing anything to be exact.",
    },
    {
      id: "pin-location", kind: "drag", target: "map-pin",
      title: "Pin the exact location on the patrol map",
      cue: "Drag the location pin onto the map at the spot where the source sits along the fence.",
      why: "A time and a smell without an exact place on the map is a complaint an inspector has to come find for themselves before they can act on it — the pin is what turns 'somewhere along this block' into a point somebody else can walk straight to.",
      drag: { to: "map-drop-point", radius: 0.5, missNote: "That is not the source's location on the map. Drop the pin at the spot along the fence where the haze is actually drifting from." },
    },
    {
      id: "log-event", kind: "sequence", anyOrder: true,
      targets: ["log-time", "log-photo", "log-description"],
      itemNames: { "log-time": "log the time", "log-photo": "take the photo", "log-description": "write the description" },
      itemNotes: {
        "log-time": "The exact time is what lets the Air District match this observation against the parcel's own activity log for the day.",
        "log-photo": "A photo of the haze against the fence line is evidence a description alone cannot fully carry.",
        "log-description": "What it smelled like, how strong, and how long it lasted — in the patrol member's own words, while it is still fresh.",
      },
      title: "Log the event completely",
      cue: "Record the time, take the photo and write the description — any order, but all three before you move on.",
      why: "An inspector reading this complaint days later was not standing at the fence when it happened, and the time, the photo and the description are the only three things that can put them there — leave one out and the complaint is asking the district to act on a partial account of something the patrol actually witnessed in full.",
    },
    {
      id: "file-complaint", kind: "select", target: "file-complaint",
      title: "File the Air District complaint",
      cue: "Submit the complaint with the wind reading, the pinned location and the full event log attached.",
      why: "The Air District's complaint process is what turns one patrol's observation into something the agency can act on — inspect the parcel, cross-reference other complaints, open a file — and it can only do that with every field filled in the way the process asks for, not with a good story told out of order later.",
    },
    {
      id: "radio-checkin", kind: "sequence",
      targets: ["radio-checkin", "shift-log"],
      itemNames: { "radio-checkin": "check in with dispatch", "shift-log": "log the shift" },
      itemNotes: {
        "radio-checkin": "Dispatch is told the complaint is filed while the patrol is still on the route, not after the shift has already ended.",
        "shift-log": "The shift log closes out with what was walked, what was found and what was filed.",
      },
      title: "Check in with dispatch, then log the shift",
      cue: "Radio dispatch that the complaint is filed, then close out the shift log — in that order.",
      why: "Dispatch checking in while the patrol is still in the field is what lets the network send a second patrol member if the source is still active when this shift ends, which a shift log written up later, alone, back at the office, cannot do anything about.",
      outOfOrderNote: "Dispatch is told first, while the patrol is still out here and could still be useful if the source is still active — the shift log can wait the extra minute.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, ODC_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 5.8, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#2a2f33", base2: "#22262a", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.93, metal: 0.03, color: 0xb9c2c8 },
    );
    const sidewalkMesh = box(g, 5.4, 0.03, 1.1, 0, 0.155, 2.0, 0xffffff, { rough: 0.85, cast: false });
    sidewalkMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a8f92", base2: "#7a7f82", seam: "rgba(0,0,0,0.3)" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xc9cdd0 },
    );

    // ------------------------------------------------------------- fence line
    const FENCE_Z = -1.3;
    for (const x of [-2.5, -1.4, -0.3, 0.8]) barrierPanel(g, x, FENCE_Z, { ry: 0, color: 0x8b929a });
    // Chain-link posts and mesh panel behind the barrier rail, taller.
    for (let x = -2.7; x <= 2.7; x += 0.55) {
      cyl(g, 0.02, 0.02, 1.6, x, 0.8 + 0.14, FENCE_Z - 0.05, 0x6a6a5c, { rough: 0.7, metal: 0.5, seg: 8 });
    }
    const meshPanel = box(g, 5.6, 1.5, 0.02, 0, 0.9 + 0.14, FENCE_Z - 0.05, 0x4a4e52, { rough: 0.8, metal: 0.3, opacity: 0.55, transparent: true, cast: false });
    void meshPanel;
    holoTag(g, "Fenced parcel — federal cleanup order", 0, 2.0, FENCE_Z - 0.05, { css: "#f0645b", w: 0.7 });

    const signBoard = group(g, -2.2, 0, FENCE_Z + 0.3, 0.2);
    cyl(signBoard, 0.02, 0.022, 1.2, 0, 0.6, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const signFacePanel = decal(signBoard, 0.4, 0.3, 0, 1.15, 0.011, signFace("NO ENTRY — CLEANUP SITE", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd0d0", scale: 0.42 }), { px: 320 });
    void signFacePanel;
    holoTag(signBoard, "Exclusion boundary", 0, 1.42, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, signBoard, "fence-signage");

    // The gap: a section of chain link peeled back.
    const gap = group(g, 0.3, 0, FENCE_Z - 0.02, 0.1);
    cyl(gap, 0.018, 0.018, 1.5, -0.35, 0.75, 0, 0x8a8578, { rough: 0.7, metal: 0.4, seg: 8 });
    const flap = box(gap, 0.5, 1.1, 0.015, 0.05, 0.75, 0, 0x4a4e52, { rough: 0.8, metal: 0.3, opacity: 0.5, transparent: true, cast: false });
    flap.rotation.y = 0.6;
    holoTag(gap, "Gap in the fence — do not enter", 0, 1.55, 0, { css: "#f0645b", w: 0.56 });
    const walkInTrap = box(g, 0.5, 0.6, 0.6, 0.3, 0.5, FENCE_Z - 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, walkInTrap, "walk-in");

    // The haze/dust source inside the fence, downwind.
    const haze = particles(g, 60, 0xc9b99a, { size: 0.14, life: 1.6, additive: false, opacity: 0.3 });
    haze.position.set(-0.6, 0.6, FENCE_Z - 0.9);
    const sourceMark = torus(g, 0.14, 0.012, -0.6, 0.6, FENCE_Z - 0.9, 0xe4622a, { emissive: 0xe4622a, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    reg(hits, sourceMark, "odor-source");

    // A stockpile behind the fence to explain the haze.
    const pile = cyl(g, 0.5, 0.7, 0.5, -0.6, 0.25, FENCE_Z - 1.0, 0x8a7455, { rough: 0.98, seg: 18 });
    void pile;

    // ------------------------------------------------------------- gate + truck
    const gate = group(g, 1.8, 0, FENCE_Z - 0.05, 0);
    box(gate, 0.06, 1.5, 0.06, -0.55, 0.75, 0, 0x6a6a5c, { rough: 0.6, metal: 0.5 });
    box(gate, 0.06, 1.5, 0.06, 0.55, 0.75, 0, 0x6a6a5c, { rough: 0.6, metal: 0.5 });
    holoTag(gate, "Loading gate", 0, 1.6, 0, { css: "#e4622a", w: 0.4 });

    const truck = group(g, 1.9, 0, -0.4, -2.4);
    box(truck, 0.5, 0.35, 0.9, 0, 0.62, -0.25, 0xb9c0c4, { rough: 0.6, metal: 0.3 });
    box(truck, 0.46, 0.32, 0.7, 0, 0.6, 0.5, 0x8a8f92, { rough: 0.9 });
    const load = box(truck, 0.42, 0.14, 0.62, 0, 0.83, 0.5, 0x6d5a43, { rough: 0.95 });
    void load;
    const truckDust = particles(truck, 20, 0xc9b99a, { size: 0.05, life: 0.7, additive: false, opacity: 0.35 });
    truckDust.position.set(0, 0.95, 0.5);
    for (const [sx, sz] of [[-0.2, -0.55], [0.2, -0.55], [-0.2, 0.65], [0.2, 0.65]]) cyl(truck, 0.11, 0.11, 0.08, sx, 0.11, sz, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(truck, "Uncovered load leaving site", 0, 1.1, 0.5, { css: "#f0645b", w: 0.6 });
    const cameraTruck = instrument(g, 2.5, 1.0, 0.3, { ry: -1.6, idle: "SNAP: --", color: 0xf0645b, w: 0.12, d: 0.16 });
    reg(hits, cameraTruck, "photograph-truck");
    const ignoreLoadBtn = box(g, 0.06, 0.03, 0.06, 2.5, 0.85, 0.3, 0x22262b, { rough: 0.6 });
    decal(ignoreLoadBtn, 0.055, 0.055, 0, 0.016, 0, signFace("WAVE ON", { bg: "#22262b", accent: "#f0645b", scale: 0.4 }));
    reg(hits, ignoreLoadBtn, "ignore-load");

    // ------------------------------------------------------------- route waypoints
    const wp1 = group(g, -2.2, 0, 1.7);
    cyl(wp1, 0.015, 0.015, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    ball(wp1, 0.05, 0, 0.92, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    holoTag(wp1, "Waypoint 1", 0, 1.1, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, wp1, "waypoint-1");
    const wp2 = group(g, 0.3, 0, 1.9);
    cyl(wp2, 0.015, 0.015, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    ball(wp2, 0.05, 0, 0.92, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    holoTag(wp2, "Waypoint 2", 0, 1.1, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, wp2, "waypoint-2");
    const wp3 = group(g, 2.3, 0, 1.7);
    cyl(wp3, 0.015, 0.015, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    ball(wp3, 0.05, 0, 0.92, 0, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
    holoTag(wp3, "Waypoint 3", 0, 1.1, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, wp3, "waypoint-3");

    // ------------------------------------------------------------- kit + meter
    const kitTable = group(g, -1.6, 0, 1.4, -0.3);
    box(kitTable, 0.6, 0.06, 0.4, 0, 0.7, 0, 0x6d5a43, { rough: 0.7 });
    for (const [sx, sz] of [[-0.26, -0.16], [0.26, -0.16], [-0.26, 0.16], [0.26, 0.16]]) cyl(kitTable, 0.015, 0.015, 0.7, sx, 0.35, sz, 0x3c444c, { rough: 0.6, metal: 0.4, seg: 8 });
    const kit = box(kitTable, 0.3, 0.14, 0.22, 0, 0.78, 0, 0xb8402f, { rough: 0.6 });
    holoTag(kitTable, "Patrol kit", 0, 0.95, 0, { css: "#e4622a", w: 0.34 });
    reg(hits, kit, "patrol-kit");

    const routePost = group(g, -1.6, 0, 1.0, 0.2);
    cyl(routePost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const routePanel = holoPanel(routePost, 0.5, 0.36, 0, 1.15, 0, (cx, w, h) => {
      cx.fillStyle = "#1e1410"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e4622a"; cx.fillRect(0, 0, w, 4);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillStyle = "#f8e4d4";
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SEGMENT 4 — 3 WAYPOINTS", w * 0.06, h * 0.5);
    }, { accent: ODC_ACCENT });
    reg(hits, routePanel, "patrol-route-card");

    const meterPost = group(g, -0.9, 0, 0.9, -0.4);
    cyl(meterPost, 0.018, 0.02, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const vane = group(meterPost, 0, 1.0, 0);
    box(vane, 0.24, 0.012, 0.1, 0, 0, 0, 0xe8eef2, { rough: 0.5 });
    cyl(vane, 0.01, 0.01, 0.14, 0, 0.08, 0, ODC_ACCENT, { emissive: ODC_ACCENT, ei: 1.0, rough: 0.4, seg: 8 });
    reg(hits, vane, "meter-vane");
    const meterScreen = instrument(meterPost, 0, 1.18, 0, { ry: 0.2, idle: "-- mph", color: ODC_ACCENT, w: 0.13, d: 0.17 });
    holoTag(meterPost, "Handheld wind meter", 0, 1.38, 0, { css: "#e4622a", w: 0.5 });
    reg(hits, meterScreen, "wind-meter");
    const guessBtn = box(meterPost, 0.05, 0.03, 0.05, 0.16, 1.18, 0, 0x22262b, { rough: 0.6 });
    decal(guessBtn, 0.045, 0.045, 0, 0.016, 0, signFace("GUESS", { bg: "#22262b", accent: "#f0645b", scale: 0.45 }));
    reg(hits, guessBtn, "guess-wind");

    // Safe-distance mark just outside the fence.
    const distMark = box(g, 2.4, 0.01, 0.06, 0, 0.155, -0.55, 0xf2c14b, { rough: 0.6, cast: false });
    holoTag(distMark, "Hold here — safe distance", 0, 0.2, 0, { css: "#f2c14b", w: 0.5 });
    reg(hits, distMark, "safe-distance-mark");

    // ------------------------------------------------------------- map + camera + log
    const mapPost = group(g, 1.4, 0, 1.2, -0.4);
    cyl(mapPost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const mapPanel = holoPanel(mapPost, 0.6, 0.42, 0, 1.15, 0, (cx, w, h) => {
      cx.fillStyle = "#1e1410"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e4622a"; cx.fillRect(0, 0, w, 5);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#f8e4d4";
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("PATROL MAP", w * 0.06, h * 0.16);
      cx.strokeStyle = "#8b929a"; cx.lineWidth = Math.max(1, w * 0.008);
      cx.beginPath(); cx.moveTo(w * 0.1, h * 0.6); cx.lineTo(w * 0.9, h * 0.6); cx.stroke();
    }, { accent: ODC_ACCENT });
    void mapPanel;
    const mapDropPoint = box(mapPost, 0.15, 0.1, 0.02, -0.12, 0.9, 0.012, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, mapDropPoint, "map-drop-point");
    const pinObj = group(mapPost, 0.2, 1.55, 0.02);
    cyl(pinObj, 0.02, 0.001, 0.06, 0, 0, 0, 0xf0645b, { rough: 0.5, seg: 12 });
    ball(pinObj, 0.025, 0, 0.03, 0, 0xf0645b, { rough: 0.5 });
    reg(hits, pinObj, "map-pin");

    const logTable = group(g, 0.9, 0, 1.6, -0.4);
    slab(logTable, 0.7, 0.05, 0.5, 0, 0.75, 0, 0xd7dde0, { radius: 0.015, rough: 0.4, metal: 0.2 });
    for (const [sx, sz] of [[-0.28, -0.18], [0.28, -0.18], [-0.28, 0.18], [0.28, 0.18]]) cyl(logTable, 0.018, 0.018, 0.75, sx, 0.37, sz, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const timeBtn = box(logTable, 0.06, 0.03, 0.06, -0.2, 0.79, -0.1, 0x22262b, { rough: 0.6 });
    decal(timeBtn, 0.055, 0.055, 0, 0.016, 0, signFace("TIME", { bg: "#22262b", accent: "#e4622a", scale: 0.5 }));
    reg(hits, timeBtn, "log-time");
    const cameraLog = instrument(logTable, 0.05, 0.79, -0.1, { idle: "PHOTO: --", color: 0xe4622a, w: 0.14, d: 0.18 });
    reg(hits, cameraLog, "log-photo");
    const descBtn = box(logTable, 0.06, 0.03, 0.06, 0.28, 0.79, -0.1, 0x22262b, { rough: 0.6 });
    decal(descBtn, 0.055, 0.055, 0, 0.016, 0, signFace("DESCRIBE", { bg: "#22262b", accent: "#e4622a", scale: 0.4 }));
    reg(hits, descBtn, "log-description");
    holoTag(logTable, "Event log", 0, 1.0, -0.1, { css: "#e4622a", w: 0.32 });

    const complaintPanel = holoPanel(g, 0.56, 0.42, -1.6, 1.15, 1.5, (cx, w, h) => {
      cx.fillStyle = "#1e1410"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#e4622a"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#f8e4d4";
      cx.fillText("BAAQMD COMPLAINT", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.076)}px Arial, sans-serif`; cx.fillStyle = "#fbeee2";
      ["Time / place / wind", "Photo + description", "Filed by patrol member"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.35 + i * 0.16)));
    }, { accent: ODC_ACCENT });
    reg(hits, complaintPanel, "file-complaint");
    const incompleteBtn = box(g, 0.06, 0.03, 0.06, -1.4, 0.9, 1.5, 0x22262b, { rough: 0.6 });
    decal(incompleteBtn, 0.055, 0.055, 0, 0.016, 0, signFace("SUBMIT NOW", { bg: "#22262b", accent: "#f0645b", scale: 0.35 }));
    reg(hits, incompleteBtn, "file-incomplete");

    const radioBox = instrument(g, -2.3, 0.9, 1.7, { ry: 0.4, idle: "RADIO: --", color: ODC_ACCENT, w: 0.14, d: 0.18 });
    holoTag(radioBox, "Dispatch radio", 0, 0.2, 0, { css: "#e4622a", w: 0.4 });
    reg(hits, radioBox, "radio-checkin");
    const shiftClip = group(g, -2.3, 0, 2.0, -0.3);
    box(shiftClip, 0.22, 0.02, 0.3, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const shiftFace = decal(shiftClip, 0.2, 0.27, 0, 0.871, 0,
      paperFace("SHIFT LOG", ["Route walked ___", "Event filed ___", "Signed ___"], { worn: true }), { px: 256 });
    shiftFace.rotation.x = -Math.PI / 2;
    holoTag(shiftClip, "Shift log", 0, 1.0, 0, { css: "#e4622a", w: 0.3 });
    reg(hits, shiftFace.parent, "shift-log");

    // ------------------------------------------------------------- crew
    const lead = standingFigure(g, -0.6, 1.6, { ry: -0.6, cloth: 0x37505f, vest: ODC_ACCENT, helmet: 0xf2f2f2 });
    void lead;
    const partner = standingFigure(g, 0.6, -0.3, { ry: 1.2, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    const partnerStart = { x: 0.6, z: -0.3 };
    const callBackBtn = box(g, 0.06, 0.03, 0.06, -2.0, 1.0, -0.5, 0x22262b, { rough: 0.6 });
    decal(callBackBtn, 0.055, 0.055, 0, 0.016, 0, signFace("CALL BACK", { bg: "#22262b", accent: "#59c97b", scale: 0.35 }));
    reg(hits, callBackBtn, "call-back");

    toolChest(g, -2.6, 0.9, { color: 0x2f6f5a });
    cone(g, 1.0, 2.2, { color: ODC_ACCENT });
    cone(g, -0.4, 2.3, { color: ODC_ACCENT });

    // ------------------------------------------------------------ live state
    let partnerMoving = false, truckLeaving = true;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.5, 0.6),
      onStepComplete(step) {
        if (step.id === "wind-read") repaint(meterScreen.userData.screen, signFace("14 mph SW", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "pin-location") { pinObj.position.set(-0.12, 0.9, 0.02); }
        if (step.id === "log-event") { repaint(cameraLog.userData.screen, signFace("PHOTO: OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 })); }
        if (step.id === "radio-checkin") repaint(radioBox.userData.screen, signFace("RADIO: SENT", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gap-photo") { partnerMoving = true; partner.rotation.y = -1.6; }
        if (it.id === "untarped-truck") { truckLeaving = true; truck.position.z = -0.55; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gap-photo") { partnerMoving = false; partner.rotation.y = 1.2; partner.position.set(partnerStart.x, 0, partnerStart.z); }
        if (it.id === "untarped-truck") { truckLeaving = false; }
      },
      animate(t, dt, session) {
        haze.userData.step(dt, new THREE.Vector3(-0.6, 0.6, FENCE_Z - 0.9), 0.5, 0.5, -0.2);
        sourceMark.material.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.4;
        if (partnerMoving) { partner.position.x = partnerStart.x - Math.min(1.3, t % 6) * 0.9; partner.position.z = partnerStart.z - Math.min(1.3, t % 6) * 0.55; }
        if (truckLeaving) { truck.position.z = Math.min(-0.55, -0.4 - (t % 10) * 0.25); truckDust.visible = true; truckDust.userData.step(dt, new THREE.Vector3(1.9, 0.95, truck.position.z + 0.5), 0.15, 0.4, 0.1); }
        else truckDust.visible = false;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "wind-read") {
          repaint(meterScreen.userData.screen, signFace(`${Math.round(gg.t * 25)} mph`, { bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
