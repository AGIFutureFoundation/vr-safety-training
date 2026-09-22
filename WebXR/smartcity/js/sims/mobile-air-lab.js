import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  particles, hose, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, instrument, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mobile Air Lab VR — Environmental Monitoring, station
// ninety-six.
//
// A community air-monitoring van deployed at a neighbourhood fence line
// during a cleanup, worked from its own open rear doors. Everything a fixed
// station does — siting by the wind, proving the instruments, keeping a QA
// record — is done here in under an hour, out of a vehicle, with the
// neighbourhood it is protecting standing on the other side of the fence.
//
// Two things make it its own trade rather than a smaller version of a
// fence-line monitor:
//   * it moves. The siting decision is not made once for a fixed pad, it is
//     made fresh every deployment against that day's forecast, and it has to
//     be remade on the spot if the wind does not do what the forecast said —
//     40 CFR Part 58 does not care that the crew already parked;
//   * the number this van produces is a community's number under California
//     AB 617, not just a compliance record. A co-located reference sample
//     runs the whole time specifically so somebody who does not trust the
//     agency's own instrument has an independent check on it, and a posted
//     notice is part of the deployment, not an afterthought.
//
// Sited generically at a residential fence line during a cleanup-order
// cleanup; no real facility, agency office or resident is named or implied.

const MAL_ACCENT = 0x2fd7c4;

export const SIM_MOBILE_AIR_LAB = {
  id: "mobile-air-lab",
  index: "96",
  domain: "Environmental",
  trade: "Community air-monitoring van technician",
  category: "Environmental Monitoring",
  weather: "smoke",
  certification: "AFSCME air-district technicians and LIUNA environmental laborers under OSHA HAZWOPER 40-hour (29 CFR 1910.120); Bay Area Air Quality Management District community monitoring practice; EPA 40 CFR Part 58 ambient air quality monitoring and Appendix A quality assurance; the site's Air Monitoring Plan under the cleanup order; California AB 617 community air monitoring",
  name: "Mobile Air Lab",
  title: simTitle("Mobile Air Lab"),
  tagline: "A monitoring van sited by the wind, its instruments proven at zero and span, a reference sample running for the community's own check, and the first hour read against the action level",
  accent: MAL_ACCENT,
  accentCss: "#2fd7c4",
  parSeconds: 265,
  footprint: 2.4,
  badge: { id: "van-proven", name: "Van Proven", note: "A deployment sited on the wind rather than on convenience, with instruments proven and a reference sample running before the first hour is trusted" },

  game: system({
    name: "Mobile Air Authority",
    currency: "MICROGRAM",
    ranks: ["Van Trainee", "Field Technician", "Deployment Lead", "QA Technician", "Mobile Air Authority"],
    badges: [
      { id: "sited-on-the-wind", name: "Sited On The Wind", note: "Re-sited the van the moment the forecast stopped matching the wind", test: AWARD.stepClean("siting") },
      { id: "never-unposted", name: "Never Unposted", note: "Never left the van running without its community notice up", test: AWARD.safe },
      { id: "span-true", name: "Span True", note: "Held every zero and span check inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-deployment", name: "Clean Deployment", note: "No corrections through the whole deployment", test: AWARD.clean },
      { id: "reference-running", name: "Reference Running", note: "Never let the co-located reference sample lapse once started", test: AWARD.unbroken },
      { id: "van-ready", name: "Van Ready", note: "Fully deployed and the first hour reviewed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "van-in-travel-lane": "You left the van straddling the lot's travel lane instead of pulling it fully onto the shoulder. A monitoring van is not protected by the fact that its crew is looking at instruments instead of traffic — a vehicle parked half in a travel lane gets struck by the next vehicle that does not expect it to be there.",
    "exhaust-into-sample": "You sited the sample inlet downwind of the van's own idling engine. Every number this deployment produces is supposed to describe the neighbourhood's air, and an inlet reading the van's own exhaust is not measuring the community's exposure — it is measuring the van, and it will read high for a reason that has nothing to do with the site.",
    "mast-into-wires": "You started cranking the mast up without looking at what is overhead. A telescoping mast does not know the difference between clear sky and a live line, and the clearance check exists precisely because the crank does not stop itself.",
    "block-sidewalk": "You swung the rear doors fully open across the sidewalk to work the bench. The doors are the only way into this van's instruments, but a wheelchair or a stroller does not fit through the gap they leave, and a community deployment that blocks the community's own sidewalk to protect its air is not the trade-off AB 617 asks for.",
  },

  lateNotes: {
    "bc-monitor": "The PM channel's zero has to be run before any span check means anything — a span checked against a bad zero is a span checked against nothing.",
    "colo-sampler": "The reference sampler runs on the same clock as the primary instruments, so the logger is synced before it starts.",
    "data-review": "There is no first hour of data to review until the logger is synced and the reference sample is running.",
  },

  interrupts: [
    {
      id: "wind-back",
      kind: "Wind shift",
      after: "leak-check", delay: 3, seconds: 12,
      alert: "The wind has backed around while you were working the sample lines — the point you sited as downwind is now upwind of the van.",
      cue: "The wind on the vane does not match the siting plan any more.",
      target: "wind-shift-flag",
      why: "Part 58 siting is a relationship to the wind, not a fixed pair of stakes in the ground. A wind that backs after the van is sited has made the downwind point upwind and the upwind point downwind, and every reading taken after that shift describes the opposite exposure from the one the plan says it is measuring until the siting is corrected.",
      missNote: "The deployment carried on with the points sited for a wind that had already backed. The instrument logged as downwind spent the rest of the hour reading upwind background, and the one logged as upwind spent it reading the plume — which means the record now says the opposite of what actually happened at the fence line.",
      wrongNote: "That does not fix the siting. The wind shift is answered at the flag that re-confirms which point is upwind and which is downwind now, not at the sample line you were already working.",
    },
    {
      id: "pm10-spike",
      kind: "Action level exceeded",
      after: "review", delay: 4, seconds: 13,
      alert: "The PM10 channel has crossed above the action level and is still climbing.",
      cue: "The first hour just gave you a number the Air Monitoring Plan has an answer for.",
      target: "notify-contact",
      why: "AB 617 community monitoring exists so a neighbourhood gets told when its own air crosses a line, not just so the agency has a record of it afterward. An action-level exceedance triggers the notification the site's Air Monitoring Plan requires, and it triggers it while the plume is still there to explain, not at the end of shift when it is a note in a log nobody at the fence line ever sees.",
      missNote: "The reading was left on the screen while the review continued as if nothing had crossed the line. An action level is not a number to note for later — it is the plan's own trigger for telling the neighbourhood what is in its air right now, and the window to do that usefully closed with the plume.",
      wrongNote: "That is not the review screen. The action-level response is the notification, not another look at the same number.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "deployment-plan",
      title: "Read the deployment plan",
      cue: "Check today's monitoring locations, the instruments required and the action levels against the site's Air Monitoring Plan.",
      why: "The plan under the cleanup order sets which pollutants this deployment is for, where it is supposed to sample and what level triggers a notification. None of that is decided at the curb — it is read before the van's doors are even opened.",
    },
    {
      id: "wind-forecast", kind: "select", target: "wind-forecast-board",
      title: "Read the wind forecast",
      cue: "Check today's forecast direction and speed before choosing where to park.",
      why: "The siting decision that follows is made against the forecast, and the crew needs to know before arriving whether today is a day the wind is likely to hold steady or a day it is forecast to shift — because a shift changes which point is upwind partway through the hour.",
    },
    {
      id: "siting", kind: "sequence",
      targets: ["upwind-point", "downwind-point"],
      itemNames: { "upwind-point": "upwind reference point", "downwind-point": "downwind fence-line point" },
      itemNotes: {
        "upwind-point": "The upwind point goes in first because it is the background every downwind reading is judged against.",
        "downwind-point": "The downwind point sits at the fence line, on the side the wind is actually carrying toward — not the side that is easiest to park next to.",
      },
      title: "Site the van's upwind and downwind points",
      cue: "Mark the upwind reference point, then the downwind fence-line point, both chosen by the wind you just read.",
      why: "A monitoring van sited by convenience instead of by wind direction produces a pair of readings that cannot be compared to each other, because neither one is reliably upwind or downwind of anything. The wind decides the geometry; the parking spot follows it, not the other way round.",
      outOfOrderNote: "Upwind first — it is the background the downwind point is read against.",
    },
    {
      id: "clearance", kind: "select", target: "overhead-lines",
      title: "Check the overhead clearance",
      cue: "Look up along the mast's path before it goes anywhere near a crank.",
      why: "A telescoping mast can reach several metres above the van roof in seconds, and a line strung overhead does not announce itself the way a low branch does. The clearance is checked by looking, before the mast is raised, not discovered by the mast.",
    },
    {
      id: "mast", kind: "turn", target: "mast-crank",
      title: "Raise the mast",
      cue: "Crank the mast up to its working height now that the overhead is clear.",
      why: "The wind vane and the sample inlet both need to sit above the van's own roof turbulence to read the air a person at the fence line is actually breathing, not the air recirculating off the vehicle's own body.",
      turn: { turns: 0.7, axis: "y", label: "MAST CRANK" },
    },
    {
      id: "pm-zero", kind: "gauge", target: "pm-monitor",
      title: "Zero the PM2.5/PM10 monitor",
      cue: "Run the zero standard through the particulate monitor and commit inside the band.",
      why: "A particulate monitor that will not read zero on clean, filtered air cannot be trusted at the action level either — the zero is the proof that a reading later in the shift describes the fence line and not a drifting instrument.",
      gauge: {
        label: "PM ZERO", speed: 0.72, green: [0.0, 0.12],
        readout: (t) => `${(t * 12).toFixed(1)} µg/m³`,
        missNote: "That is not zero. An unproven zero makes every reading the monitor takes for the rest of the shift a guess with a decimal point on it.",
      },
    },
    {
      id: "instrument-span", kind: "sequence", anyOrder: true,
      targets: ["pm-monitor", "bc-monitor", "voc-monitor"],
      itemNames: { "pm-monitor": "PM2.5/PM10 span", "bc-monitor": "black carbon span", "voc-monitor": "VOC span" },
      itemNotes: {
        "pm-monitor": "Span checked against a known particulate standard now that the zero is proven.",
        "bc-monitor": "Black carbon's span standard is its own — it is not proven by the PM channel's calibration.",
        "voc-monitor": "The VOC channel is span-checked against a certified gas standard, the same way the fixed fence-line analysers are.",
      },
      title: "Span-check every channel",
      cue: "Run the span standard through the PM, black carbon and VOC channels — any order.",
      why: "40 CFR 58 Appendix A's quality assurance is not satisfied by one instrument reading true; every channel this deployment reports on has to be proven against its own known standard, because a span check on one channel says nothing about whether a different pollutant's channel is reading correctly.",
    },
    {
      id: "leak-check", kind: "hold", target: "sample-line", seconds: 5,
      title: "Check the sample lines for leaks",
      cue: "Pull a vacuum on the sample manifold and hold while the gauge is watched for movement.",
      why: "A leak in a sample line dilutes whatever the inlet is drawing in with outside air from somewhere between the inlet and the instrument, and it does it invisibly — the readout still shows a number, just not the neighbourhood's number.",
      holdBreakNote: "You let go before the check ran its full time. A leak this small only shows up if the gauge is watched for the whole hold, not glanced at once.",
    },
    {
      id: "clock-sync", kind: "select", target: "data-logger",
      title: "Synchronise the data logger's clock",
      cue: "Set the logger's clock against the reference time before anything starts recording.",
      why: "An exceedance is a reading, a wind direction and a time together, and a logger running on its own clock turns that into three numbers that cannot be lined up against anything else at the site — including the reference sample that is about to start on the same hour.",
    },
    {
      id: "reference-sample", kind: "turn", target: "colo-sampler",
      title: "Start the co-located reference sample",
      cue: "Wind the reference sampler's pump on and set it running beside the primary instrument.",
      why: "The reference sample is the community's own check on the agency's instrument — a filter an independent lab can weigh against what the van's monitor reported. It is started on the same clock as everything else specifically so the two records can be compared minute for minute.",
      turn: { turns: 0.4, axis: "y", label: "REFERENCE PUMP" },
    },
    {
      id: "notice", kind: "select", target: "community-notice",
      title: "Post the community notice",
      cue: "Put the deployment notice up at the van where the fence-line residents can read it.",
      why: "AB 617 treats a community deployment as something the neighbourhood is a party to, not something done to it from behind a fence. The notice — what is being monitored, for how long, and who to call — goes up before the first hour of data exists, not after somebody asks what the van is doing there.",
    },
    {
      id: "review", kind: "track", target: "data-review", seconds: 8,
      title: "Review the first hour against the action level",
      cue: "Watch the first hour's readings and keep the review centred on the action-level line.",
      why: "The Air Monitoring Plan's action level is a decision rule, not a target — the first hour is reviewed specifically to catch a channel that has already crossed it, because the plan's own notification requirement starts counting from the moment that happens, not from the end of the shift.",
      holdBreakNote: "You looked away from the review before the hour was actually watched through. A channel that crosses the action level for a minute and comes back is still a crossing — it is caught only by watching the whole window, not by checking the number once.",
      track: {
        label: "PM10", green: [0.15, 0.42], rise: 0.46, fall: 0.4, drift: 0.13,
        readout: (v) => `${(v * 220).toFixed(0)} µg/m³`,
      },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["kinked-sample-line", "loose-mast-guy"],
      itemNames: { "kinked-sample-line": "kinked sample line", "loose-mast-guy": "slack mast guy wire" },
      itemNotes: {
        "kinked-sample-line": "The line to the black carbon channel has kinked where it comes off the mast. A kink cuts flow without ever throwing an alarm, and a flow-starved channel under-reports the very thing it is deployed to catch.",
        "loose-mast-guy": "One of the mast's guy wires has gone slack. A mast that shifts in a gust does not just wobble the wind vane's reading, it can bring the whole assembly down on whoever is working the bench below it.",
      },
      title: "Walk the deployment before it runs unattended",
      cue: "Check the lines and the mast, and click the two things that will not survive the shift unnoticed.",
      why: "This deployment runs for hours after the crew has proven every instrument once. What fails afterward is almost always something mechanical and quiet — a kinked line, a slack wire — so the walk-round exists to catch it while somebody is still standing there to fix it.",
    },
    {
      id: "log", kind: "select", target: "field-log",
      title: "Log the deployment",
      cue: "Record the siting, the calibration results, the reference sample start time and the first hour's review.",
      why: "The log is what lets the next shift, the district and the neighbourhood's own advocates all read the same account of what this van did today. A deployment that is not logged the way it actually happened is a deployment nobody after this shift can vouch for.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, MAL_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 5.8, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#232a24", base2: "#1c2220", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xb9c9c2 },
    );
    // The street's travel lane along one edge, and the sidewalk along the other.
    const laneMesh = box(g, 5.4, 0.02, 1.1, 0, 0.145, -2.1, 0xffffff, { rough: 0.75, cast: false });
    laneMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => { cx.fillStyle = "#2b2f34"; cx.fillRect(0, 0, w, h);
        cx.fillStyle = "rgba(224,170,60,0.6)"; for (let x = 0; x < w; x += 90) cx.fillRect(x, h * 0.46, 46, h * 0.08); }, { repeat: 4, px: 256 }),
      { rough: 0.7, metal: 0.1, color: 0xb9c0c4 },
    );
    holoTag(g, "Travel lane — pull clear", 0, 0.35, -2.1, { css: "#f0645b", w: 0.5 });
    const laneTrap = box(g, 1.4, 0.4, 0.8, -1.8, 0.3, -1.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, laneTrap, "van-in-travel-lane");
    const sidewalkMesh = box(g, 5.4, 0.03, 0.9, 0, 0.155, 2.1, 0xffffff, { rough: 0.85, cast: false });
    sidewalkMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a8f92", base2: "#7a7f82", seam: "rgba(0,0,0,0.3)" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xc9cdd0 },
    );

    // ------------------------------------------------------------- the van
    const VAN_X = -0.3, VAN_Z = -0.6;
    const van = group(g, VAN_X, 0, VAN_Z, Math.PI);
    slab(van, 2.3, 1.3, 1.15, 0, 0.14 + 0.65, 0, 0xf2f4f5, { radius: 0.06, rough: 0.5, metal: 0.15, finish: "painted", tile: [3, 2] });
    box(van, 2.3, 0.1, 1.18, 0, 0.14 + 1.32, 0, MAL_ACCENT, { rough: 0.4, metal: 0.2 });
    const stripeFace = decal(van, 2.25, 0.34, 0, 0.14 + 0.9, 0.581, signFace("COMMUNITY AIR MONITORING", {
      bg: "#eef7f6", accent: "#2fd7c4", fg: "#0e2622", scale: 0.5,
    }), { px: 512 });
    void stripeFace;
    for (const dx of [-0.7, 0.7]) for (const dz of [-0.44, 0.44]) {
      cyl(van, 0.28, 0.28, 0.24, dx, 0.14 + 0.05, dz, 0x161a1d, { rough: 0.8, seg: 16 }).rotation.z = Math.PI / 2;
    }
    // Front cab windshield, so the van reads as a vehicle rather than a box.
    box(van, 0.7, 0.5, 1.1, -1.15, 0.14 + 1.05, 0, 0x2c3438, { rough: 0.3, metal: 0.3, opacity: 0.75, transparent: true });
    // Rear doors, open, hinged at the outer edges — the working face of the van.
    for (const side of [-1, 1]) {
      const door = group(van, 1.15, 0.14 + 0.65, side * 0.575);
      const panel = box(door, 0.05, 1.2, 0.55, 0.025, 0, side * 0.275, 0xf2f4f5, { rough: 0.5, metal: 0.15, finish: "painted", tile: [1, 2] });
      void panel;
      door.rotation.y = side * -1.65;
    }
    holoTag(van, "Rear doors — open, bench inside", 0, 0.14 + 1.55, 0.4, { css: "#2fd7c4", w: 0.62 });
    // Sidewalk-blocking trap: the door swing zone laid straight across the
    // sidewalk instead of pulled back toward the street.
    const doorSwingTrap = box(g, 1.0, 0.5, 0.7, VAN_X + 0.9, 0.4, VAN_Z + 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, doorSwingTrap, "block-sidewalk");

    // --------------------------------------------------------- the bench
    const bench = group(van, 0.55, 0.14, 0);
    slab(bench, 1.0, 0.05, 1.0, 0, 0.78, 0, 0xd7dde0, { radius: 0.015, rough: 0.4, metal: 0.2 });
    for (const [sx, sz] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) {
      cyl(bench, 0.02, 0.02, 0.75, sx, 0.4, sz, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const pmBox = instrument(bench, -0.28, 0.84, -0.1, { ry: 0.1, idle: "-- µg/m³", color: 0x2fd7c4, w: 0.18, d: 0.24 });
    holoTag(bench, "PM2.5/PM10", -0.28, 1.06, -0.1, { css: "#2fd7c4", w: 0.34 });
    reg(hits, pmBox, "pm-monitor");
    const bcBox = instrument(bench, 0.02, 0.84, -0.15, { ry: 0.05, idle: "-- ng/m³", color: 0x22262b, w: 0.16, d: 0.22 });
    holoTag(bench, "Black carbon", 0.02, 1.04, -0.15, { css: "#2fd7c4", w: 0.34 });
    reg(hits, bcBox, "bc-monitor");
    const vocBox = instrument(bench, 0.3, 0.84, -0.08, { ry: -0.1, idle: "-- ppb", color: 0xf2c14b, w: 0.16, d: 0.2 });
    holoTag(bench, "VOC", 0.3, 1.04, -0.08, { css: "#2fd7c4", w: 0.24 });
    reg(hits, vocBox, "voc-monitor");
    const loggerBox = instrument(bench, -0.15, 0.84, 0.3, { idle: "CLOCK --:--", color: 0x2fd7c4, w: 0.18, d: 0.22 });
    holoTag(bench, "Data logger", -0.15, 1.04, 0.3, { css: "#2fd7c4", w: 0.34 });
    reg(hits, loggerBox, "data-logger");
    const reviewBox = instrument(bench, 0.22, 0.84, 0.32, { idle: "-- µg/m³", color: 0xf0645b, w: 0.18, d: 0.22 });
    holoTag(bench, "First-hour review", 0.22, 1.06, 0.32, { css: "#2fd7c4", w: 0.4 });
    reg(hits, reviewBox, "data-review");
    const alarmLamp = ball(bench, 0.02, 0.22, 1.0, 0.42, 0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.4 });
    // The sample manifold: a small hub with three lines running out to the
    // roof-mounted inlets, one visibly kinked.
    const manifold = cyl(bench, 0.05, 0.05, 0.1, -0.4, 0.86, 0.25, 0x3c444c, { rough: 0.6, metal: 0.4, seg: 12 });
    reg(hits, manifold, "sample-line");
    hose(bench, [[-0.4, 0.9, 0.25], [-0.4, 1.3, 0.25], [-0.2, 1.5, 0.1]], 0.012, 0x2b3138, { steps: 10, rough: 0.85 });
    const kinkLine = hose(bench, [[-0.4, 0.9, 0.28], [-0.32, 1.1, 0.2], [-0.34, 1.15, 0.18], [-0.28, 1.4, 0.05]], 0.012, 0x2b3138, { steps: 10, rough: 0.85 });
    reg(hits, kinkLine, "kinked-sample-line");
    const notifyPhone = instrument(bench, -0.42, 0.84, 0.45, { ry: 0.4, idle: "CALL: --", color: 0xf0645b, w: 0.13, d: 0.16 });
    holoTag(bench, "Notify contact", -0.42, 1.02, 0.45, { css: "#f0645b", w: 0.36 });
    reg(hits, notifyPhone, "notify-contact");

    // ------------------------------------------------------------- the mast
    const mastBase = group(van, 0.4, 0.14 + 1.37, 0);
    const mastPole = cyl(mastBase, 0.03, 0.035, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.45, metal: 0.65, seg: 12 });
    const vane = group(mastBase, 0, 1.0, 0);
    box(vane, 0.3, 0.012, 0.14, 0, 0, 0, 0xe8eef2, { rough: 0.5 });
    cyl(vane, 0.012, 0.012, 0.18, 0, 0.1, 0, MAL_ACCENT, { emissive: MAL_ACCENT, ei: 1.2, rough: 0.4, seg: 8 });
    const crank = torus(mastBase, 0.05, 0.01, 0, 0.06, 0.05, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 6, seg2: 18 });
    crank.rotation.x = Math.PI / 2;
    holoTag(mastBase, "Mast crank", 0.1, 0.06, 0.05, { css: "#2fd7c4", w: 0.32 });
    reg(hits, crank, "mast-crank");
    const shortcutTrap = box(mastBase, 0.24, 0.3, 0.24, 0, 0.15, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mastBase, "just crank it up?", 0, 0.45, -0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, shortcutTrap, "mast-into-wires");

    // Overhead line the mast has to clear.
    const poleA = group(g, -2.4, 0, -2.4);
    cyl(poleA, 0.05, 0.06, 4.4, 0, 2.2, 0, 0x6a6a5c, { rough: 0.85, seg: 10, finish: "rust", tile: [1, 3] });
    const poleB = group(g, 2.4, 0, -2.0);
    cyl(poleB, 0.05, 0.06, 4.2, 0, 2.1, 0, 0x6a6a5c, { rough: 0.85, seg: 10, finish: "rust", tile: [1, 3] });
    const wireMesh = hose(g, [[-2.4, 4.2, -2.4], [-0.3, 3.9, -1.5], [2.4, 4.1, -2.0]], 0.012, 0x22262b, { steps: 16, rough: 0.8, cast: false });
    holoTag(g, "Overhead line — check clearance", -0.3, 4.25, -1.5, { css: "#f2c14b", w: 0.56 });
    reg(hits, wireMesh, "overhead-lines");

    // ------------------------------------------------------------ siting
    function marker(x, z, id, label, color) {
      const m = group(g, x, 0, z);
      cyl(m, 0.014, 0.014, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
      const flag = box(m, 0.22, 0.14, 0.01, 0.11, 1.02, 0, color, { rough: 0.6, cast: false });
      holoTag(m, label, 0, 1.24, 0, { css: "#2fd7c4", w: 0.4 });
      return { m, flag };
    }
    const up = marker(2.2, 1.5, "upwind-point", "UPWIND · reference", 0x59c97b);
    reg(hits, up.m, "upwind-point");
    const down = marker(2.1, -1.7, "downwind-point", "DOWNWIND · fence line", 0xf0645b);
    reg(hits, down.m, "downwind-point");
    const shiftFlag = group(g, 2.15, 0, -0.1);
    cyl(shiftFlag, 0.012, 0.012, 0.6, 0, 0.3, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const shiftBanner = box(shiftFlag, 0.2, 0.12, 0.01, 0.1, 0.55, 0, 0xf2c14b, { rough: 0.6, cast: false });
    void shiftBanner;
    holoTag(shiftFlag, "Wind shift — re-site", 0, 0.72, 0, { css: "#f2c14b", w: 0.48 });
    reg(hits, shiftFlag, "wind-shift-flag");

    // ------------------------------------------------- reference sampler
    const colo = group(g, -2.0, 0, 1.2, 0.4);
    for (const a of [0, 2.1, 4.2]) {
      const leg = cyl(colo, 0.012, 0.016, 0.6, Math.sin(a) * 0.16, 0.3, Math.cos(a) * 0.16, 0x3c444c, { rough: 0.5, metal: 0.6, seg: 8 });
      leg.rotation.z = Math.sin(a) * 0.25; leg.rotation.x = Math.cos(a) * 0.25;
    }
    const coloPump = cyl(colo, 0.05, 0.05, 0.14, 0, 0.68, 0, 0x2fd7c4, { rough: 0.5, metal: 0.3, seg: 14, emissive: 0x2fd7c4, ei: 0.5 });
    holoTag(colo, "Co-located reference sampler", 0, 0.92, 0, { css: "#2fd7c4", w: 0.62 });
    reg(hits, coloPump, "colo-sampler");
    const guyTrap = cyl(colo, 0.006, 0.006, 0.5, 0.2, 0.35, 0.1, 0x8b929a, { rough: 0.6, metal: 0.5, seg: 6 });
    guyTrap.rotation.z = 0.9;
    reg(hits, guyTrap, "loose-mast-guy");

    // ------------------------------------------------------------- boards
    const planPost = group(g, -1.7, 0, -1.3, 0.3);
    const planPanel = holoPanel(planPost, 0.58, 0.4, 0, 1.5, 0, (cx, w, h) => {
      cx.fillStyle = "#0c1b19"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#2fd7c4"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#d8f5ef";
      cx.fillText("AIR MONITORING PLAN — FENCE LINE", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eef9f6";
      ["PM2.5/PM10, black carbon, VOC", "Action level: 150 µg/m³ PM10", "Under the site cleanup order",
       "AB 617 community deployment"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: MAL_ACCENT });
    cyl(planPost, 0.02, 0.022, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    reg(hits, planPanel, "deployment-plan");

    const windPanel = holoPanel(g, 0.5, 0.36, -1.15, 1.55, -1.6, (cx, w, h) => {
      cx.fillStyle = "#0c1b19"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#2fd7c4"; cx.fillRect(0, 0, w, 4);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`; cx.fillStyle = "#eef9f6";
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FORECAST: SW 8 mph, steady", w * 0.07, h * 0.5);
    }, { accent: MAL_ACCENT });
    reg(hits, windPanel, "wind-forecast-board");

    const noticePost = group(g, -0.9, 0, 1.8, -0.3);
    const noticePanel = holoPanel(noticePost, 0.56, 0.5, 0, 1.35, 0, (cx, w, h) => {
      cx.fillStyle = "#0c1b19"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#2fd7c4"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#d8f5ef";
      cx.fillText("COMMUNITY AIR MONITORING", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`; cx.fillStyle = "#eef9f6";
      ["Monitoring PM, black carbon, VOC", "Deployed under the cleanup order",
       "Results posted to the community", "Questions: call the number below"].forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: MAL_ACCENT });
    cyl(noticePost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    reg(hits, noticePanel, "community-notice");

    const clipboard = group(g, 1.5, 0, 1.7, -0.4);
    box(clipboard, 0.24, 0.02, 0.32, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const formFace = decal(clipboard, 0.22, 0.29, 0, 0.871, 0,
      paperFace("DEPLOYMENT LOG", ["Siting: upwind ___ downwind ___", "Zero / span: PM ___ BC ___ VOC ___",
        "Reference sample start ____", "First hour review ____"], { worn: true }), { px: 256 });
    formFace.rotation.x = -Math.PI / 2;
    holoTag(clipboard, "Field log", 0, 1.05, 0, { css: "#2fd7c4", w: 0.3 });
    reg(hits, formFace.parent, "field-log");

    // ----------------------------------------------------- the idling engine
    const genny = group(g, -1.3, 0, -0.9, 0.5);
    box(genny, 0.4, 0.32, 0.3, 0, 0.16, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const exhaust = cyl(genny, 0.02, 0.02, 0.16, 0.18, 0.38, 0, 0x4a4e52, { rough: 0.5, metal: 0.6, seg: 10 });
    void exhaust;
    const smoke = particles(genny, 24, 0x7a7f84, { size: 0.03, life: 1.0, additive: false, opacity: 0.4 });
    const exhaustTrap = cyl(genny, 0.26, 0.26, 0.01, 0.18, 0.44, 0, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, seg: 16, cast: false });
    reg(hits, exhaustTrap, "exhaust-into-sample");

    toolChest(g, 1.9, -1.4, { color: 0x2f6f5a });
    barrierPanel(g, -2.2, -1.6, { color: MAL_ACCENT });
    cone(g, -1.0, 2.2, { color: MAL_ACCENT });
    cone(g, 1.0, 2.2, { color: MAL_ACCENT });

    const tech = standingFigure(g, 1.65, 0.9, { ry: -1.9, cloth: 0x37505f, vest: 0x2fd7c4, helmet: 0xf2f2f2 });
    holoTag(tech, "Field technician", 0, 1.95, 0, { css: "#2fd7c4", w: 0.34 });

    // ------------------------------------------------------------ live state
    let windBacked = false, spikeActive = false, logging = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.4, 0.4),
      onStepComplete(step) {
        if (step.id === "clock-sync") { logging = true; repaint(loggerBox.userData.screen, signFace("CLOCK 08:00:00", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 })); }
        if (step.id === "walk") { kinkLine.visible = false; guyTrap.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "wind-back") { windBacked = true; up.flag.material = mat(0xf0645b, { rough: 0.6 }); down.flag.material = mat(0x59c97b, { rough: 0.6 }); }
        if (it.id === "pm10-spike") {
          spikeActive = true;
          alarmLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.6, rough: 0.4 });
          repaint(reviewBox.userData.screen, signFace("214 µg/m³ !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.55 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-back") { windBacked = false; }
        if (it.id === "pm10-spike") {
          spikeActive = false;
          alarmLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6, rough: 0.4 });
          repaint(reviewBox.userData.screen, signFace("96 µg/m³", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        smoke.visible = true;
        smoke.userData.step(dt, new THREE.Vector3(-1.1, 0.7, -0.9), 0.05, 0.4, 0.3);
        vane.rotation.y = Math.sin(t * 0.6) * 0.3 + (windBacked ? Math.PI * 0.6 : 0);
        if (spikeActive) {
          reviewBox.userData.screen.material.emissiveIntensity = 1.4 + Math.sin(t * 6) * 0.6;
          alarmLamp.material.emissiveIntensity = 2.0 + Math.sin(t * 9) * 1.0;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "pm-zero") {
          repaint(pmBox.userData.screen, signFace(`${(gg.t * 12).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t < 0.12 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
        if (session?.turn && session.step?.id === "mast") {
          mastPole.scale.y = 1 + (session.turn.amount / session.turn.required) * 1.3;
          mastPole.position.y = 0.5 * mastPole.scale.y;
          vane.position.y = 1.0 * mastPole.scale.y;
          crank.rotation.z = session.turn.amount * Math.PI * 2;
        }
        if (session?.turn && session.step?.id === "reference-sample") {
          coloPump.material.emissiveIntensity = 0.6 + (session.turn.amount / session.turn.required) * 1.6;
        }
        if (session?.track && session.step?.id === "review") {
          repaint(reviewBox.userData.screen, signFace(`${(session.track.v * 220).toFixed(0)}`, {
            bg: "#0d1c24", accent: session.track.v > 0.15 && session.track.v < 0.42 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
      },
    };
  },
};
