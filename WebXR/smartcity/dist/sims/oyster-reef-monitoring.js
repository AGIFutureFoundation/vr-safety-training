import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Oyster Reef Monitoring VR — Water & Environmental, station
// ninety-one.
//
// Post-construction monitoring of a restored native oyster reef at low
// tide, on a generic bay shoreline restoration reach beside a former
// shipyard — not any one site's history, the quarterly monitoring event a
// Bay Area habitat crew runs after a reef of the kind the California State
// Coastal Conservancy's Living Shorelines Program has funded around the
// bay. The learner is the environmental technician who reads the numbers
// the reef's own construction crew — LIUNA laborers who placed the shell —
// are not in the field for every quarter: fixed quadrats found by their tag
// and GPS rather than by eye, density counted and logged before the frame
// ever moves, recruitment tiles turned back exactly as marked, a
// water-quality sonde stood up to the permit's own three parameters, and
// the invasive drill counted alongside the oysters it eats — all of it off
// the reef before the flood the tide table already warned about arrives.

const ORM_ACCENT = 0xd3ccb8;

export const SIM_OYSTER_REEF_MONITORING = {
  id: "oyster-reef-monitoring",
  index: "91",
  domain: "Environmental",
  trade: "Environmental monitoring technician / restoration monitoring crew",
  category: "Water & Environmental",
  // Reef monitoring is filed with the water trades and done at the bay's
  // edge: stand it in front of the bay, not a treatment works.
  district: "Environmental Monitoring",
  weather: "fog",
  certification: "Environmental monitoring technicians; LIUNA laborers (reef construction and habitat crews); California State Coastal Conservancy Living Shorelines Program grant monitoring conditions; San Francisco Bay Regional Water Quality Control Board permit monitoring conditions; NOAA Fisheries; San Francisco Bay Conservation and Development Commission (BCDC) permit; seasonal in-water work window for fish protection",
  name: "Oyster Reef Monitoring",
  title: simTitle("Oyster Reef Monitoring"),
  tagline: "Quarterly reef monitoring on a falling tide: fixed quadrats found by tag and GPS, density counted and logged before the frame moves, tiles turned back to their mark, the sonde read against the permit's own flag level, the drill counted, and the sheet reconciled with the photos before the flood",
  accent: ORM_ACCENT,
  accentCss: "#d3ccb8",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "reef-reconciled", name: "Reef Reconciled", note: "Every fixed quadrat, tile and pin read to the plan and the sheet squared with the photos before the flood — first time" },

  game: system({
    name: "Monitoring Crew",
    currency: "SPAT",
    ranks: ["Field Tech", "Reef Tech", "Lead Tech", "Monitoring Steward", "Reef Certified"],
    badges: [
      { id: "baseline-tagged", name: "Baseline Tagged", note: "Every fixed quadrat relocated by its own tag and GPS, first time", test: AWARD.stepClean("quadrat-locate") },
      { id: "reef-undisturbed", name: "Reef Undisturbed", note: "Never a hazard, never a shell broken that didn't need to be", test: AWARD.safe },
      { id: "true-reading", name: "True Reading", note: "The sonde's stabilised reading and the dissolved oxygen gauge both read inside the working band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-count", name: "Clean Count", note: "No corrections across the whole visit", test: AWARD.clean },
      { id: "steady-frame", name: "Steady Frame", note: "Held the quadrat frame and the sonde readout steady the whole way", test: AWARD.unbroken },
      { id: "off-before-flood", name: "Off Before The Flood", note: "Reef reconciled and cleared inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reef-trample": "You cut straight across the reef mounds instead of staying on the marked path to the quadrat. Live oyster clusters break under a boot the same way they break under a wave, and a reef trampled by the crew measuring it stops being a fair test of whether the restoration itself is surviving.",
    "bare-hand-shell": "You reached bare-handed into the reef to steady a quadrat corner. Cured oyster shell fractures into edges sharp enough to open a glove, let alone skin, and a technician cut on someone else's restored reef is the incident report that follows every crew here afterward.",
    "cal-solution-dump": "You tipped the sonde's used calibration solution out onto the mudflat. It is a lab standard, not seawater, and dumping it beside the reef the sonde is about to sample from can shift the very water-quality reading the Regional Water Quality Control Board's permit conditions are asking this sonde to report honestly.",
    "guess-quadrat-tag": "You dropped the frame at a spot that looked about right instead of finding the tagged rebar and confirming it against the GPS unit. A permanent quadrat is permanent precisely so the same square metre gets measured every visit; a frame set anywhere else produces a number that cannot be compared to last quarter's and breaks the trend the whole monitoring plan exists to build.",
  },

  lateNotes: {
    "quadrat-frame": "Set the frame down after the tagged rebar and the GPS unit both confirm this is the fixed plot — a frame set before that is a frame set nowhere the trend dataset recognises.",
    "recruitment-tile": "Lift the tile after this quarter's density count is logged — pulling gear off the reef before the count is on paper is how a quarter's numbers go missing.",
    "sonde": "Deploy the sonde after the tile is back down at its marked orientation — the reef gets put back together before the water gets read.",
    "field-binder": "Nothing to reconcile yet. The binder waits for the drill survey, the last thing counted before the crew leaves the reef.",
  },

  // Interruptions: see shared/game.js. One is the bay's own tide moving
  // faster than the table said while a frame is still down; the other is
  // the sonde reporting the one number the permit's monitoring conditions
  // want flagged the day it is read, not folded into a quarterly summary.
  interrupts: [
    {
      id: "flood-early",
      kind: "Flood tide arriving early",
      after: "quadrat-count", delay: 4, seconds: 14,
      alert: "The tide staff at the reef's edge shows the flood is already running ahead of the table, and the quadrat frame is still down on the last plot.",
      cue: "Read the staff — the water is coming back faster than the table said. Don't leave the frame for it.",
      target: "tide-staff",
      why: "A tide table is an average of the moon's cycle, not a promise about today's wind and barometric pressure, and the difference shows up first as water moving in around a frame the crew assumed there was still time to finish. The staff gauge at the reef's edge is the only reading of where the water actually is right now, and it is what tells the crew whether they have minutes or none.",
      missNote: "The frame sat on the reef while the real tide came in around it, and the last quadrat's count went in half-guessed because nobody could tell what the rising water had already covered before it was pulled.",
      wrongNote: "That's not it. The tide staff at the reef's edge is the only true reading of where the water is right now — nothing else on this reef tells you that.",
    },
    {
      id: "do-flag",
      kind: "Dissolved oxygen below the flag level",
      after: "sonde-stabilize", delay: 4, seconds: 13,
      alert: "The sonde's dissolved oxygen channel has settled well under the monitoring plan's flag level for this reef.",
      cue: "Flag the reading now, per the plan — don't wait to see if it climbs on its own.",
      target: "do-flag",
      why: "Dissolved oxygen under the flag level is exactly the condition a restored reef is supposed to be reversing, not adding to, and the Regional Water Quality Control Board's permit monitoring conditions exist so a bad reading gets reported the day it is taken, not folded into a quarterly summary months later when whatever caused it is long gone.",
      missNote: "The low reading went into the log without being flagged, and the one number that was supposed to trigger a same-day call to the Water Board sat unread until the quarterly report went out weeks later.",
      wrongNote: "Not that. The flag control is the one action that gets a low dissolved-oxygen reading in front of someone today instead of buried in next quarter's report.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "monitoring-plan-board",
      title: "Read the monitoring plan and the tide window",
      cue: "Check today's plot list, the low-tide working window, and the parameters the sonde has to read.",
      why: "The whole visit is timed to a falling tide that exposes the reef and a flood that will cover it again in a few hours, and the plan is what tells the crew which of the reef's permanent quadrats, tiles and pins are due this quarter rather than guessed at from memory. Reading it here is what turns the visit into the same measurement taken the same way every time, which is the only kind of number a restoration trend can be built from.",
    },
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Check the permit's monitoring conditions",
      cue: "Read the Water Board's monitoring conditions, the BCDC permit note, NOAA Fisheries' interest in the reef, and the in-water work window.",
      why: "This reef exists because a federal Clean Water Act (CWA) Section 404 permit required it, and the permit did not end at construction — the San Francisco Bay Regional Water Quality Control Board's own EPA-delegated CWA Section 401 water quality certification, the BCDC permit, and NOAA Fisheries' interest in a native oyster reef all keep reading this station's numbers long after the crew that built it is gone, and the seasonal work window is what keeps the crew reading them at the right time of year.",
    },
    {
      id: "stage", kind: "sequence", anyOrder: true,
      targets: ["stage-waders", "stage-gloves", "stage-slate"],
      itemNames: { "stage-waders": "chest waders", "stage-gloves": "gloves", "stage-slate": "waterproof data slate" },
      title: "Stage for working the reef",
      cue: "Waders, gloves, and the waterproof data slate before anyone steps onto the reef.",
      why: "The reef sits below the same tideline the crew is racing, and its surface is broken shell, not sand — waders keep cold water and cut hazards off skin that will be kneeling in the mud all morning, gloves are for the shell itself under the same OSHA general industry PPE duty (29 CFR 1910.132) as any other job site, and the slate is the only notebook that survives being set down on wet substrate between quadrats.",
    },
    {
      id: "quadrat-locate", kind: "find", noHint: true,
      targets: ["quad-tag-1", "quad-tag-2", "quad-tag-3"],
      itemNames: { "quad-tag-1": "quadrat tag 1 — GPS confirmed", "quad-tag-2": "quadrat tag 2 — GPS confirmed", "quad-tag-3": "quadrat tag 3 — GPS confirmed" },
      itemNotes: {
        "quad-tag-1": "Tagged rebar for permanent plot 1, set the day the reef was built. The GPS unit's reading has to match this tag before the frame goes down.",
        "quad-tag-2": "Plot 2's tag — the mid-reef control that shows whether the reef's centre is holding density the same way its edges are.",
        "quad-tag-3": "Plot 3's tag, nearest the channel — the plot most exposed to current and the one that usually moves first if the reef is failing.",
      },
      title: "Find the fixed quadrats by their tag and GPS",
      cue: "Walk the reef and find the three tagged rebar stakes the GPS unit confirms are this quarter's fixed quadrats.",
      why: "A permanent quadrat is permanent so the exact same square metre of reef gets measured every single quarter, and that only works if the crew finds the tagged stake the last crew left rather than a spot that merely looks about right — a density count from the wrong metre of reef is not comparable to last quarter's and cannot join the trend the whole monitoring program depends on.",
    },
    {
      id: "quadrat-count", kind: "hold", target: "quadrat-frame", seconds: 6,
      title: "Set the frame and tally the oyster density",
      cue: "Set the frame flat at the tag and hold it while you tally every live oyster inside it.",
      why: "The count is only valid for the footprint the frame actually covers, and a frame that lifts or shifts mid-tally either double-counts a shell at the edge or misses one — holding it flat and steady for the full count is what makes this quarter's density number mean the same thing as last quarter's, taken the same way over the same square metre.",
      holdBreakNote: "The frame lifted before the tally finished — reset it flat at the tag and hold through the full count.",
    },
    {
      id: "density-log", kind: "select", target: "data-sheet",
      title: "Log the count before the frame moves",
      cue: "Write the count onto the data sheet before the frame comes up and moves to the next plot.",
      why: "A count that lives only in memory becomes a guess the moment the next quadrat starts, and three plots' worth of oysters are easy to swap in a technician's head by the end of a low-tide morning. Logging each count immediately, plot by plot, is what keeps the number on the sheet the number the frame actually covered.",
    },
    {
      id: "tile-lift", kind: "drag", target: "recruitment-tile",
      title: "Lift the recruitment tile to the bench",
      cue: "Lift the recruitment tile off the reef and carry it up to the bench to photograph.",
      why: "Recruitment tiles are read off the reef, in daylight, against something other than glare off the water, because juvenile spat the size of a grain of rice do not photograph reliably at the water's edge at low tide — the bench is the only place the tile's set actually gets counted rather than estimated.",
      drag: { to: "tile-bench-socket", radius: 0.4, missNote: "Not on the bench — carry the tile all the way up before letting go." },
    },
    {
      id: "tile-return", kind: "turn", target: "recruitment-tile",
      title: "Turn the tile back to its marked orientation",
      cue: "Turn the tile back to the paint mark on its frame before it goes back down.",
      turn: { turns: 0.5, axis: "y", label: "TILE ORIENTATION" },
      why: "The tile's orientation controls which face gets the current and which gets shaded, and a tile put back rotated from how it was set is no longer testing the same recruitment conditions the last three quarters measured — the paint mark on the frame exists so the tile goes back exactly as it came up, not close to it.",
    },
    {
      id: "sonde-deploy", kind: "drag", target: "sonde",
      title: "Deploy the water-quality sonde",
      cue: "Carry the sonde out and set it into the socket at the reef edge.",
      why: "Temperature, salinity and dissolved oxygen are read at the reef itself, not from the truck, because a restored reef's whole premise is that it is supposed to be improving the water quality right where it stands — a reading taken anywhere else answers a different question than the one this monitoring plan is asking.",
      drag: { to: "sonde-socket", radius: 0.35, missNote: "Not at the socket — the sonde reads the reef edge, not the bench." },
    },
    {
      id: "sonde-stabilize", kind: "track", target: "sonde-readout", seconds: 7,
      title: "Hold position while the sonde's readings settle",
      cue: "Hold position at the readout while the three channels settle — don't record a number that is still drifting.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "SONDE", readout: (v) => (v < 0.4 ? "still drifting" : v > 0.6 ? "overshooting" : "stable") },
      why: "A probe just placed in the water reads whatever turbulence the placement itself stirred up, and only once temperature, salinity and dissolved oxygen stop drifting is the reading actually the water rather than the disturbance of putting the sonde into it — recording early is recording the moment of deployment, not the reef's water.",
      holdBreakNote: "Position broke before the channels settled — hold steady at the readout and let them stabilise again.",
    },
    {
      id: "sonde-read", kind: "gauge", target: "sonde-readout",
      title: "Read dissolved oxygen against the flag level",
      cue: "Read the dissolved oxygen channel against the plan's flag level and commit it.",
      gauge: { label: "DISSOLVED OXYGEN", speed: 0.7, green: [0.5, 0.7], readout: (t) => `${(t * 10).toFixed(1)} mg/L`, missNote: "Under the flag level. Read it again and commit inside the band, or flag it if it holds low." },
      why: "Dissolved oxygen is the one of the sonde's three numbers with a flag level written into the monitoring plan, because it is the first sign a restored reef's own biology is struggling before anything else about it looks wrong — reading it against that line, not just writing down whatever the screen shows, is what turns a number into an early warning instead of a data point nobody looks at twice.",
    },
    {
      id: "drill-survey", kind: "find", noHint: true,
      targets: ["oyster-drill", "drill-egg-case"],
      itemNames: { "oyster-drill": "invasive oyster drill", "drill-egg-case": "drill egg case cluster" },
      itemNotes: {
        "oyster-drill": "A predatory snail that bores a single hole through an oyster's shell and eats it from the inside — every drill found is one less oyster the next density count will see.",
        "drill-egg-case": "A cluster of yellow, vase-shaped egg cases means the drill population on this reef is reproducing, not just passing through.",
      },
      title: "Search for the invasive drill and its egg cases",
      cue: "Search the reef for the invasive oyster drill and its egg cases and record both.",
      why: "The oyster drill can undo a season of recruitment one shell at a time, and its egg cases left uncounted look like nothing until the next quarter's density count comes back down for no reason anyone can explain — recording both the drill and its cases is what gives the next report an actual cause instead of a mystery.",
    },
    {
      id: "reconcile", kind: "select", target: "field-binder",
      title: "Reconcile the data sheet with the photos",
      cue: "Match every plot on the data sheet against the tile photos before the crew leaves the reef.",
      why: "A data sheet and a set of photos taken an hour apart on a moving tide can drift out of order without anyone meaning for them to, and a plot number that does not match its own photo is a discrepancy nobody catches until a report is already written — reconciling them here, on the reef, is the only chance to fix it before the flood takes the chance away.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, ORM_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Upland dry bench where the boards and staging live, a reef flat where
    // the monitoring happens, then mudflat and open water pulled back toward
    // the far edge for low tide — all at or above y=0 so it reads above the
    // shared plaza disc.
    const upland = box(g, 5.2, 0.3, 1.3, 0, 0.15, 1.7, 0x5a5548, { rough: 0.96 });
    void upland;
    const uplandTop = box(g, 5.2, 0.02, 1.3, 0, 0.311, 1.7, 0x6a6455, { rough: 0.94, cast: false });
    void uplandTop;
    const slopeA = box(g, 5.2, 0.32, 0.5, 0, 0.13, 0.9, 0x524d40, { rough: 0.96 });
    slopeA.rotation.x = 0.32;

    // Reef bench: mudflatFace-textured pad the shell mounds and quadrats sit on.
    const benchTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#413c34", base2: "#332f28" }), { repeat: 2, px: 256 });
    const bench = box(g, 5.2, 0.12, 1.5, 0, 0.06, 0.15, 0x413c34, { rough: 0.95 });
    bench.material = texturedMat(benchTex, { rough: 0.95, color: 0x8f8770 });

    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h), { repeat: 3, px: 256 });
    const mudflat = box(g, 5.2, 0.03, 0.6, 0, 0.015, -0.9, 0x3a3630, { rough: 0.95, cast: false });
    mudflat.material = texturedMat(mudTex, { rough: 0.95, color: 0x8a7a58 });

    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#0f2e3a", base2: "#0a1f29" }), { repeat: 4, px: 256 });
    const water = box(g, 5.2, 0.03, 1.1, 0, 0.012, -1.85, 0x0f2e3a, { rough: 0.22, metal: 0.28, opacity: 0.87, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.22, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.87;

    const wave = particles(g, 24, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.38 });
    wave.position.set(0, 0.03, -2.15);

    // -------------------------------------------------------- upland station
    const planBoard = holoPanel(g, 0.9, 0.62, -1.9, 1.08, 1.9, (cx, w, h) => {
      cx.fillStyle = "#1c1a14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d3ccb8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f3f0e6"; cx.fillText("MONITORING PLAN — REEF 3, Q3", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#ece7d8";
      ["Low water: 0742 · +0.4 ft MLLW", "Working window: approx. 4.5 h", "Plots due: 1, 2, 3 + 2 tiles",
       "Sonde: temp / salinity / DO", "Confirm against the staff at the water"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.115)));
    }, { ry: 0.5, accent: ORM_ACCENT });
    reg(hits, planBoard, "monitoring-plan-board");

    const permitBoard = holoPanel(g, 0.9, 0.62, 1.9, 1.08, 1.9, (cx, w, h) => {
      cx.fillStyle = "#1c1a14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d3ccb8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f3f0e6"; cx.fillText("PERMIT MONITORING CONDITIONS", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#ece7d8";
      ["RWQCB monitoring conditions", "BCDC permit — habitat reef", "NOAA Fisheries — native oyster reef",
       "State Coastal Conservancy grant terms", "In-water window: seasonal fish protection"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.5, accent: ORM_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const chest = toolChest(g, 0, 1.9, { color: 0x6a6455 });
    for (const [id, dx, color, label] of [["stage-waders", -0.2, 0x8a6a4a, "WADERS"], ["stage-gloves", 0.0, 0x2f4d3a, "GLOVES"], ["stage-slate", 0.2, 0x2b3138, "SLATE"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#1c1a14", accent: "#f3f0e6", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -1.35, 2.3, { ry: 2.3, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // Tide staff at the water's edge — the interruption's real reading.
    const staff = group(g, 2.15, 0.02, -1.6);
    box(staff, 0.07, 0.9, 0.03, 0, 0.45, 0, 0xf2f6fa, { rough: 0.7 });
    for (let i = 1; i < 9; i++) box(staff, 0.07, 0.01, 0.032, 0, i * 0.1, 0.002, i % 3 === 0 ? 0xd2312b : 0x1b1e23, { rough: 0.7, cast: false });
    holoTag(staff, "tide staff — read it, not the table", 0, 1.05, 0, { css: "#d3ccb8", w: 0.5 });
    reg(hits, staff, "tide-staff");

    // -------------------------------------------------------------- reef flat
    // Oyster shell mounds — the restored reef itself, built up from small
    // clustered meshes so it reads as living structure rather than a colored
    // slab.
    const reefGrp = group(g, 0, 0.12, 0.1);
    for (let m = 0; m < 9; m++) {
      const mx = -1.9 + (m % 3) * 1.9, mz = -0.35 + Math.floor(m / 3) * 0.4;
      const mound = group(reefGrp, mx, 0, mz);
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * 0.28;
        const shell = ball(mound, 0.04 + Math.random() * 0.05, Math.cos(a) * r, 0.03 + Math.random() * 0.05, Math.sin(a) * r,
          i % 4 === 0 ? 0xcfc7b0 : 0x9a927a, { rough: 0.9, seg: 6, cast: false });
        shell.scale.y = 0.6;
      }
    }

    // ---------------------------------------------------------- survey tags
    const tags = {};
    for (const [id, x, label] of [["quad-tag-1", -1.6, "PLOT 1"], ["quad-tag-2", 0, "PLOT 2"], ["quad-tag-3", 1.6, "PLOT 3"]]) {
      const st = group(g, x, 0.12, -0.35);
      cyl(st, 0.012, 0.014, 0.4, 0, 0.2, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.08, 0.05, 0.01, 0, 0.38, 0, 0xe8622a, { rough: 0.75 });
      decal(st, 0.07, 0.035, 0, 0.38, 0.006, signFace(label, { bg: "#1c1a14", accent: "#f3f0e6", scale: 0.55 }));
      reg(hits, st, id);
      tags[id] = st;
    }

    // Quadrat frame — the hold target, dragged conceptually from tag to tag,
    // built as one representative frame the crew sets down and works.
    const frameGrp = group(g, 0, 0.13, -0.35);
    for (const [dx, dz] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
      cyl(frameGrp, 0.006, 0.006, 0.5, dx, 0.01, dz, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8 }).rotation.set(dz > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0);
    }
    box(frameGrp, 0.5, 0.012, 0.012, 0, 0.01, -0.25, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    box(frameGrp, 0.5, 0.012, 0.012, 0, 0.01, 0.25, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    box(frameGrp, 0.012, 0.012, 0.5, -0.25, 0.01, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    box(frameGrp, 0.012, 0.012, 0.5, 0.25, 0.01, 0, 0xe8b02e, { rough: 0.5, metal: 0.4 });
    holoTag(frameGrp, "quadrat frame — 1 m²", 0, 0.3, 0, { css: "#d3ccb8", w: 0.4 });
    reg(hits, frameGrp, "quadrat-frame");
    const guessHit = box(g, 0.4, 0.3, 0.4, 2.3, 0.2, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drop the frame here anyway?", 2.3, 0.5, -0.35, { css: "#e8622a", w: 0.5 });
    reg(hits, guessHit, "guess-quadrat-tag");
    const trampleHit = box(g, 0.5, 0.3, 0.4, -0.9, 0.2, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cut across the mounds?", -0.9, 0.45, -0.15, { css: "#e8622a", w: 0.44 });
    reg(hits, trampleHit, "reef-trample");
    const bareHandHit = box(g, 0.3, 0.3, 0.3, 0.9, 0.2, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reach in bare-handed?", 0.9, 0.45, -0.2, { css: "#e8622a", w: 0.44 });
    reg(hits, bareHandHit, "bare-hand-shell");

    // Data sheet on a small clipboard stand beside the reef.
    const sheetStand = group(g, -0.9, 0.13, 0.55);
    box(sheetStand, 0.24, 0.32, 0.02, 0, 0.16, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const sheetFace = decal(sheetStand, 0.2, 0.26, 0, 0.16, 0.011, signFace("PLOT DATA", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.45 }));
    reg(hits, sheetStand, "data-sheet");

    // ----------------------------------------------------- recruitment tile
    const tileHome = new THREE.Vector3(0.9, 0.14, 0.55);
    const benchSocket = group(g, -1.9, 0.13, 1.0);
    hits["tile-bench-socket"] = benchSocket;
    const benchTable = group(g, -1.9, 0.13, 1.15);
    box(benchTable, 0.5, 0.05, 0.32, 0, 0.32, 0, 0x5a5548, { rough: 0.75 });
    for (const sx of [-0.2, 0.2]) box(benchTable, 0.03, 0.32, 0.03, sx, 0.16, 0.13, 0x4a4638, { rough: 0.7 });

    const tileGrp = group(g, tileHome.x, tileHome.y, tileHome.z);
    const tileMesh = box(tileGrp, 0.22, 0.02, 0.22, 0, 0, 0, 0xb8b0a0, { rough: 0.85 });
    box(tileGrp, 0.03, 0.023, 0.03, 0.08, 0.001, -0.08, 0xe8622a, { rough: 0.6 });
    for (let i = 0; i < 8; i++) {
      const bx = (Math.random() - 0.5) * 0.18, bz = (Math.random() - 0.5) * 0.18;
      ball(tileGrp, 0.012 + Math.random() * 0.012, bx, 0.014, bz, 0xcfc7b0, { rough: 0.9, seg: 6, cast: false });
    }
    holoTag(tileGrp, "recruitment tile", 0, 0.2, 0, { css: "#d3ccb8", w: 0.32 });
    void tileMesh;
    reg(hits, tileGrp, "recruitment-tile");

    // ------------------------------------------------------- sonde & socket
    const sondeHome = new THREE.Vector3(1.6, 0.14, 0.6);
    const sondeSocket = group(g, 1.8, 0.02, -1.4);
    hits["sonde-socket"] = sondeSocket;
    const sondeGrp = group(g, sondeHome.x, sondeHome.y, sondeHome.z);
    cyl(sondeGrp, 0.045, 0.045, 0.32, 0, 0.16, 0, 0x2f6f8c, { rough: 0.5, metal: 0.4, seg: 14 });
    ball(sondeGrp, 0.05, 0, 0.32, 0, 0x1b3a4a, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(sondeGrp, "water-quality sonde", 0, 0.5, 0, { css: "#d3ccb8", w: 0.4 });
    reg(hits, sondeGrp, "sonde");

    const sondeReadoutGrp = group(g, 1.8, 0.5, -1.15, -0.3);
    const sondeReadout = instrument(sondeReadoutGrp, 0, 0, 0, { idle: "-- / -- / --", color: 0xd3ccb8, w: 0.16, d: 0.22 });
    holoTag(sondeReadoutGrp, "sonde readout — temp / sal / DO", 0, 0.22, 0, { css: "#d3ccb8", w: 0.5 });
    reg(hits, sondeReadout, "sonde-readout");

    const calDumpHit = box(g, 0.35, 0.3, 0.35, 2.15, 0.2, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "dump the cal solution here?", 2.15, 0.45, -1.0, { css: "#e8622a", w: 0.5 });
    reg(hits, calDumpHit, "cal-solution-dump");

    // Flag control for the dissolved-oxygen interruption — a small red flag
    // that pops up when the reading needs to be flagged.
    const flagPost = group(g, 1.5, 0.5, -1.15);
    cyl(flagPost, 0.012, 0.012, 0.3, 0, 0.15, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 8 });
    const flagBanner = box(flagPost, 0.14, 0.09, 0.006, 0.08, 0.28, 0, 0xd2312b, { rough: 0.6 });
    flagBanner.visible = false;
    holoTag(flagPost, "flag the reading", 0, 0.4, 0, { css: "#e8622a", w: 0.34 });
    reg(hits, flagPost, "do-flag");

    // ---------------------------------------------------------- drill survey
    const drillGrp = group(g, -1.4, 0.15, -0.6);
    cyl(drillGrp, 0.02, 0.03, 0.1, 0, 0.05, 0, 0x8a6a4a, { rough: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, drillGrp, "oyster-drill");
    const eggCaseGrp = group(g, -0.5, 0.15, -0.68);
    for (let i = 0; i < 5; i++) cyl(eggCaseGrp, 0.008, 0.01, 0.03, (i - 2) * 0.015, 0.015, 0, 0xe8d24a, { rough: 0.6, seg: 6, cast: false });
    reg(hits, eggCaseGrp, "drill-egg-case");

    // -------------------------------------------------------- field binder
    const binder = group(g, -0.4, 0.13, 1.05);
    box(binder, 0.28, 0.05, 0.22, 0, 0.025, 0, 0x2f6f8c, { rough: 0.6 });
    const binderFace = decal(binder, 0.24, 0.16, 0, 0.026, 0, signFace("FIELD BINDER", { bg: "#2f6f8c", accent: "#ffffff", scale: 0.4 }));
    binderFace.rotation.x = -Math.PI / 2;
    reg(hits, binder, "field-binder");

    cone(g, -2.4, 2.15, { color: ORM_ACCENT });
    cone(g, 2.4, 2.15, { color: ORM_ACCENT });
    barrierPanel(g, 0, 2.25, { color: 0xe8b02e });
    const spray = particles(g, 18, 0xbfe6f2, { size: 0.025, life: 0.7, additive: false, opacity: 0.35 });
    spray.position.set(0, 0.05, -0.9);

    let doFlagged = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.2),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "quadrat-count") {
          for (const c of frameGrp.children) c.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
        }
        if (step.id === "density-log") {
          repaint(sheetFace, signFace("LOGGED", { bg: "#f3efe4", accent: "#2f7d4a", scale: 0.5 }));
        }
        if (step.id === "tile-lift") {
          tileGrp.parent.remove(tileGrp);
          benchSocket.add(tileGrp);
          tileGrp.position.set(0, 0.18, 0);
          tileGrp.rotation.set(0, 0, 0);
        }
        if (step.id === "tile-return") {
          tileGrp.parent.remove(tileGrp);
          const reefBack = group(g, tileHome.x, tileHome.y, tileHome.z);
          reefBack.add(tileGrp);
          tileGrp.position.set(0, 0, 0);
        }
        if (step.id === "sonde-deploy") {
          sondeGrp.parent.remove(sondeGrp);
          sondeSocket.add(sondeGrp);
          sondeGrp.position.set(0, 0.02, 0);
          sondeGrp.rotation.set(0, 0, 0);
        }
        if (step.id === "sonde-read") {
          repaint(sondeReadout.userData.screen, signFace("LOGGED", { bg: "#1c1a14", accent: "#59c97b", fg: "#f3f0e6", scale: 0.5 }));
        }
        if (step.id === "drill-survey") {
          drillGrp.visible = false;
          eggCaseGrp.visible = false;
        }
        if (step.id === "reconcile") {
          repaint(binderFace, signFace("RECONCILED", { bg: "#2f7d4a", accent: "#ffffff", scale: 0.36 }));
        }
      },

      // Both interruptions really change the scene: the water visibly moves
      // in on the reef, and the flag physically raises.
      onInterrupt(it) {
        if (it.id === "flood-early") {
          water.position.z += 0.35;
          water.scale.x = 1.15;
        }
        if (it.id === "do-flag") {
          doFlagged = true;
          flagBanner.visible = true;
          repaint(sondeReadout.userData.screen, signFace("DO LOW — FLAG", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd8d8", scale: 0.44 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "flood-early") {
          water.position.z -= 0.35;
          water.scale.x = 1.0;
        }
        if (it.id === "do-flag") {
          repaint(sondeReadout.userData.screen, signFace("FLAGGED", { bg: "#1c1a14", accent: "#59c97b", fg: "#f3f0e6", scale: 0.5 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -2.4), 1.4, 0.35, -0.1);
        spray.visible = true;
        spray.userData.step(dt, new THREE.Vector3(0, 0.06, -0.9), 0.6, 0.3, -0.2);
        water.position.y = 0.012 + Math.sin(t * 1.2) * 0.006;
        if (waterTex.offset) {
          waterTex.offset.x = (t * 0.012) % 1;
          waterTex.offset.y = (t * 0.008) % 1;
        }
        void doFlagged;

        const step = session?.step;
        if (step?.id === "sonde-stabilize" && session.track) {
          const v = session.track.v;
          repaint(sondeReadout.userData.screen, signFace(`${(12 + v * 4).toFixed(1)}°C`, { bg: "#1c1a14", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f3f0e6", scale: 0.55 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "sonde-read") {
          repaint(sondeReadout.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} mg/L`, { bg: "#1c1a14", accent: gg.t >= 0.5 && gg.t <= 0.7 ? "#59c97b" : "#f2ae14", fg: "#f3f0e6", scale: 0.55 }));
        }
      },
    };
  },
};
