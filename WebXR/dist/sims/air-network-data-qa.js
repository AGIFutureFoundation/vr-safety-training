import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, equipmentCabinet,
  standingFigure, instrument, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Network Data Review VR — Community Environmental Justice,
// Hunters Point Edition.
//
// The weekly data-quality review at the foundation's own desk: the
// ten-monitor map, the network's outlier detection rules, a wildfire smoke
// day told apart from a local source by the pattern across the map, a
// stuck sensor caught before its flat line is mistaken for calm air, a
// persistent local outlier confirmed and reported to the Air District
// under the rule that applies, and the public dashboard note that tells
// the neighbourhood what this week's numbers actually mean.
//
// Sited generically at a community organisation's own desk; no real
// office, staff member or agency contact is named or implied.

const ANQ_ACCENT = 0xd98f4f;

export const SIM_AIR_NETWORK_DATA_QA = {
  id: "air-network-data-qa",
  index: "149",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "smoke",
  certification: "EPA 40 CFR Part 58 Appendix A data quality objectives and Air Quality Index reporting guidance; Cal/OSHA's wildfire smoke rule (8 CCR 5141.1) for telling a smoke day from a local event; the Bay Area Air Quality Management District's complaint and Community Advisory Council process; NIOSH guidance on separating regional smoke episodes from local point sources in a community monitoring network",
  name: "Network Data Review",
  title: simTitle("Network Data Review"),
  tagline: "A week of the ten-monitor network read honestly: a smoke day told from a local source by the pattern across the map, a stuck sensor caught, a real outlier confirmed and reported, and the public note that says what the numbers actually mean",
  accent: ANQ_ACCENT,
  accentCss: "#d98f4f",
  parSeconds: 255,
  footprint: 2.3,
  badge: { id: "map-read-honestly", name: "Map Read Honestly", note: "A smoke day and a local source told apart by the pattern, a stuck sensor caught, and the real outlier reported before the note went public" },

  game: system({
    name: "Weekly Review",
    currency: "DATAPOINT",
    ranks: ["Review Trainee", "Data Reviewer", "QA Lead", "Network Steward", "Weekly Review Certified"],
    badges: [
      { id: "pattern-read-right", name: "Pattern Read Right", note: "Told the smoke day from a local source by the map's own pattern, not a guess", test: AWARD.stepClean("classify-day") },
      { id: "never-early", name: "Never Early", note: "Never gave out a number before QA on it was finished", test: AWARD.safe },
      { id: "outlier-proven", name: "Outlier Proven", note: "Held the outlier's level and persistence checks inside their bands", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-review", name: "Clean Review", note: "No corrections through the whole week's review", test: AWARD.clean },
      { id: "watch-unbroken", name: "Watch Unbroken", note: "Never broke off the persistence watch on the outlier", test: AWARD.unbroken },
      { id: "review-fast", name: "Review Fast", note: "Classified, flagged, reported and noted inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "classify-local": "You called a region-wide smoke day a local source. Every one of the ten monitors moved together the same morning the regional smoke forecast said they would, and pinning that on one address blames a specific parcel or business for weather the whole map was reading — which is exactly the kind of honest mistake that costs a community network its credibility the first time somebody checks the satellite imagery against the complaint.",
    "release-raw-number": "You gave out a reading straight off the dashboard before the week's QA pass touched it. An unreviewed number can be a stuck sensor's flat line, a humidity artifact, or a genuine reading — nobody looking at it raw, including you five minutes ago, can tell which, and a number handed out before that sorting happens is a guess wearing the network's name.",
    "publish-stuck": "You let the flat-lined sensor's reading stay on the public map as if it were current air. A stuck sensor does not report zero or an error, it reports whatever it saw the moment it froze, over and over, and a resident checking that address sees a calm number that has had nothing to do with their air for days.",
    "dismiss-outlier": "You waved off the persistent local outlier as noise without checking whether it held or reporting it. One monitor running well above the smoke-day baseline for hours, on its own, while its neighbours stay near baseline, is the exact pattern a network exists to catch — dismissing it without a second look is choosing not to see the one signal this week's map was actually trying to show you.",
  },

  lateNotes: {
    "stuck-sensor-ping": "There is nothing to ping until you have actually spotted which of the ten tiles has gone flat.",
    "outlier-level": "Confirm you have found the outlier tile before you read its level against the action threshold.",
    "notify-baaqmd": "The outlier has to hold up over the persistence watch before it is worth reporting to the Air District — a single elevated minute is not yet a finding.",
    "dashboard-note-panel": "Write the note once the week's classification, the stuck sensor and the outlier are all settled — a note written mid-review will be wrong about something.",
  },

  interrupts: [
    {
      id: "reporter-email",
      kind: "Premature request",
      after: "outlier-rules", delay: 4, seconds: 14,
      alert: "A reporter has emailed asking for today's number before the QA review is finished.",
      cue: "An unread message is flashing on the desk — a reporter wants a number right now.",
      target: "hold-for-qa",
      why: "A number handed to a reporter before the stuck sensor is caught or the smoke day is told from a local source is a number the network cannot stand behind if it turns out to be wrong, and a correction printed after the fact reaches far fewer people than the original story did. Replying that the reviewed number is coming once QA is done protects the one thing a community network actually has to sell, which is that its numbers can be trusted.",
      missNote: "The email sat unanswered while the review continued, and there is no way to know from here whether the reporter got tired of waiting and used an unreviewed number anyway. Silence is not the same as holding the line — the hold has to be sent, not just intended.",
      wrongNote: "That does not answer the reporter. Reply at the message itself and tell them the reviewed number is coming once QA is finished — do not go looking for a number to send them early.",
    },
    {
      id: "owner-moved-sensor",
      kind: "Siting changed",
      after: "find-stuck", delay: 5, seconds: 15,
      alert: "A monitor's host has called to say they moved their sensor indoors last week because of the smoke, and forgot to mention it until now.",
      cue: "The phone is ringing with news that changes what one tile on the map has actually been measuring.",
      target: "flag-moved-indoor",
      why: "A sensor moved indoors is no longer measuring the neighbourhood's outdoor air at all, and every reading it has logged since the move describes a living room, not the block it is plotted on. Flagging that tile the moment you learn about the move is what keeps the rest of this week's review — and the public map — from quietly treating a houseplant's air as a fence-line reading.",
      missNote: "The call ended and the map kept showing that host's tile as an outdoor reading. Every day between the move and whenever somebody finally notices the pattern looks wrong is a day the public map is showing an indoor number as if it were the street's.",
      wrongNote: "That is not where the move gets recorded. Flag the tile itself as resited, not the reading you were already working on.",
    },
  ],

  steps: [
    {
      id: "open-map", kind: "select", target: "ten-monitor-map",
      title: "Open this week's ten-monitor map",
      cue: "Pull up the full network map before looking at any single reading.",
      why: "A single sensor's chart never says on its own whether an elevated reading is the whole neighbourhood's weather or one address's problem — that only shows up once all ten monitors are seen together, which is why the review starts with the map and not with whichever tile happens to be flashing.",
    },
    {
      id: "outlier-rules", kind: "select", target: "outlier-rules-card",
      title: "Read the outlier detection rules",
      cue: "Check the network's own rules for what counts as an outlier before judging any tile against them.",
      why: "The network's outlier rules set how far a reading has to sit from its neighbours, and for how long, before it counts as something worth acting on rather than ordinary scatter — a reviewer who skips the rules and goes by eye is deciding, alone, what the network's own standard should have decided in advance.",
    },
    {
      id: "spatial-check", kind: "sequence", anyOrder: true,
      targets: ["tile-north", "tile-central", "tile-south"],
      itemNames: { "tile-north": "check the north tiles", "tile-central": "check the central tiles", "tile-south": "check the south tiles" },
      itemNotes: {
        "tile-north": "The northern monitors, furthest from the fence line, are the control for whether today's bump is regional.",
        "tile-central": "The central cluster near the shipyard fence is where a local source would show up first and hardest.",
        "tile-south": "The southern monitors, downwind today, are what a region-wide smoke event should lift along with everything else.",
      },
      title: "Check the spatial pattern across the map",
      cue: "Compare the north, central and south clusters of the map — any order — before deciding what today's bump means.",
      why: "A wildfire smoke event lifts every monitor together no matter where it sits on the map, while a local source shows up hardest near where it actually is and fades with distance from it — the only way to tell the two apart is to look at the whole map's shape, not at whichever single tile happens to be the highest number today.",
    },
    {
      id: "classify-day", kind: "select", target: "classify-smoke",
      title: "Classify today's pattern",
      cue: "Confirm today's readings are a region-wide smoke day, not a local source.",
      why: "All ten tiles moved together this morning, in step with the regional smoke forecast, which is the signature of smoke drifting over the whole area rather than anything coming from one address — calling it correctly here is what keeps the rest of the review's attention on the one tile that is not behaving like the rest of the map.",
    },
    {
      id: "find-stuck", kind: "find", noHint: true,
      targets: ["stuck-sensor"],
      itemNames: { "stuck-sensor": "the flat-lined sensor" },
      itemNotes: { "stuck-sensor": "This tile's line has not moved by a single digit in three days, through a smoke event that lifted every other monitor on the map — that is not calm air, it is a frozen instrument." },
      title: "Find the stuck sensor",
      cue: "Scan all ten tiles for the one whose chart never moved through the smoke event.",
      why: "A sensor that has stopped updating does not announce itself with an error on the public map, it just keeps repeating whatever it last measured, and the only way to catch that is to notice a chart that stayed perfectly flat through a week when every honest instrument on the network moved.",
    },
    {
      id: "ping-stuck", kind: "hold", target: "stuck-sensor-ping", seconds: 5,
      title: "Ping the sensor to confirm it is offline",
      cue: "Hold the connection test until the sensor either answers or the timeout confirms it has not.",
      why: "A tile that looks stuck could still be a slow connection rather than a dead instrument, and flagging a working sensor for a truck roll wastes a technician's whole afternoon — the ping is what turns a suspicion into a confirmed fault before anyone is dispatched to fix it.",
      holdBreakNote: "You let go before the timeout confirmed anything. A ping abandoned partway through proves nothing either way, and this sensor is still exactly as unconfirmed as it was before you touched it.",
    },
    {
      id: "flag-maintenance", kind: "select", target: "flag-maintenance",
      title: "Flag the stuck sensor for service",
      cue: "Pull the confirmed-offline sensor from the public map's trusted feed and flag it for a site visit.",
      why: "Pulling this tile off the trusted feed the moment it is confirmed dead is what keeps the public map from showing a resident a calm, frozen number in place of an honest gap — a gap the map can label as one, but a wrong number never announces itself as wrong.",
    },
    {
      id: "find-outlier", kind: "find", noHint: true,
      targets: ["fenceline-outlier"],
      itemNames: { "fenceline-outlier": "the fence-line outlier" },
      itemNotes: { "fenceline-outlier": "This one monitor sits well above even the smoke-day baseline that every other tile settled at, and it has held there for hours on its own — that is not the region's smoke, it is riding on top of it." },
      title: "Find the local outlier riding on top of the smoke",
      cue: "Look past the smoke-day baseline for the one tile still running hot on its own.",
      why: "A local source does not stop existing just because a smoke event is also happening that day, and the only way to see it is to look for the one reading that is elevated even relative to the smoke-day baseline every other monitor settled into — a real local event can hide inside a regional one if nobody looks past the obvious explanation.",
    },
    {
      id: "outlier-level", kind: "gauge", target: "outlier-level",
      title: "Check the outlier against the action threshold",
      cue: "Read the outlier's level against the network's action threshold and commit once it is confirmed above it.",
      why: "The network's action threshold exists so that a reviewer is not deciding by feel whether a reading is worth escalating — a level confirmed above the threshold is what turns 'that looks high' into a finding the Air District can be told about with a specific number behind it.",
      gauge: {
        label: "LEVEL", speed: 0.68, green: [0.58, 0.85],
        readout: (t) => `${(t * 60).toFixed(0)} µg/m³`,
        missNote: "That reading has not been confirmed above the action threshold. Read it again before treating it as a finding.",
      },
    },
    {
      id: "watch-persistence", kind: "track", target: "outlier-trend", seconds: 8,
      title: "Watch the outlier for persistence",
      cue: "Track the outlier's trend and confirm it holds above baseline rather than passing in a minute.",
      why: "A single elevated reading can be a passing truck or a gust off a stockpile; a reading that holds above baseline across a sustained watch is a pattern, and a community network reports patterns to the regulator, not single minutes that might already have passed by the time anyone called.",
      holdBreakNote: "You looked away before the watch confirmed whether the outlier actually held. A reading you stopped watching halfway through could have dropped back to baseline the moment your attention did — you no longer know which.",
      track: {
        label: "OUTLIER", green: [0.58, 0.85], rise: 0.4, fall: 0.3, drift: 0.1,
        readout: (v) => `${(v * 60).toFixed(0)} µg/m³`,
      },
    },
    {
      id: "close-out", kind: "sequence",
      targets: ["notify-baaqmd", "dashboard-note-panel"],
      itemNames: { "notify-baaqmd": "notify the Air District", "dashboard-note-panel": "write the public dashboard note" },
      itemNotes: {
        "notify-baaqmd": "The confirmed, persistent outlier is reported to BAAQMD under the network's data-sharing and complaint agreement before the public note goes up.",
        "dashboard-note-panel": "The public note explains the smoke day, the offline sensor and the reported outlier — in that order, once the Air District already has it.",
      },
      title: "Notify the Air District, then write the public note",
      cue: "Report the confirmed outlier to the Air District first, then write the dashboard note that tells the neighbourhood what this week's map means.",
      why: "Reporting the finding to the regulator before the public note goes up means the Air District hears about a genuine local exceedance from the network directly rather than second-hand from a dashboard post, which is what the network's own agreement with the district calls for — and it means the public note can honestly say the report has already been made, not that it is coming.",
      outOfOrderNote: "The Air District is told first. A public note that goes up before the regulator has the finding is the network announcing something it has not yet actually reported.",
    },
    {
      id: "review-log", kind: "select", target: "review-log",
      title: "Log the week's review",
      cue: "Record the classification, the flagged sensor, the outlier and what was reported.",
      why: "The review log is what lets next week's reviewer, and anyone who questions this week's dashboard note later, see exactly what was found and what was done about it — a review that lives only in one person's head is not a record the network can stand behind.",
    },
    {
      id: "sign-off", kind: "select", target: "sign-pad",
      title: "Sign the weekly review",
      cue: "Sign and date the completed weekly review.",
      why: "A signed review is what turns this week's work into something the foundation, the Air District and the next reviewer can all point to as done — an unsigned log is a set of good decisions nobody can later confirm were actually made this week.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, ANQ_ACCENT);

    // ------------------------------------------------------------- floor mat
    const matMesh = box(g, 3.2, 0.02, 2.6, 0, 0.01, 0.6, 0xffffff, { rough: 0.85, cast: false });
    matMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4147", base2: "#2e353a", step: 20 }), { repeat: 3, px: 384 }),
      { rough: 0.8, metal: 0.1, color: 0xb9c2c8 },
    );

    // ------------------------------------------------------------ desk + monitors
    const desk = group(g, 0, 0, -1.1);
    slab(desk, 2.2, 0.05, 0.8, 0, 0.75, 0, 0x6d5a43, { radius: 0.02, rough: 0.6 });
    for (const sx of [-0.95, 0.95]) box(desk, 0.06, 0.75, 0.7, sx, 0.375, 0, 0x4a3d2e, { rough: 0.7 });

    // The ten-monitor wall map, arranged as a 5x2 grid of tiles.
    const mapPost = group(desk, 0, 0.75, -0.42, 0);
    const mapFrame = holoPanel(mapPost, 1.9, 1.0, 0, 1.15, 0, (cx, w, h) => {
      cx.fillStyle = "#1a1410"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d98f4f"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.07)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#f6e6d4";
      cx.fillText("TEN-MONITOR NETWORK — THIS WEEK", w * 0.04, h * 0.09);
      const cols = 5, rows = 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const tx = w * (0.06 + c * 0.185), ty = h * (0.24 + r * 0.42), tw = w * 0.16, th = h * 0.3;
        const stuck = i === 3, outlier = i === 7;
        cx.fillStyle = stuck ? "#3a3a3a" : outlier ? "#5a2418" : "#3a2c1c";
        cx.fillRect(tx, ty, tw, th);
        cx.strokeStyle = outlier ? "#f0645b" : "#d98f4f"; cx.lineWidth = Math.max(1, w * 0.003);
        cx.strokeRect(tx, ty, tw, th);
        cx.fillStyle = "#f6e6d4"; cx.font = `${Math.round(h * 0.045)}px Arial, sans-serif`;
        cx.fillText(`M${i + 1}`, tx + tw * 0.08, ty + th * 0.2);
        cx.fillStyle = stuck ? "#9aa0a4" : outlier ? "#ffb2a8" : "#e6c9a2";
        cx.fillText(stuck ? "flat" : outlier ? "HIGH" : "smoke", tx + tw * 0.08, ty + th * 0.68);
      }
    }, { accent: ANQ_ACCENT, px: 900 });
    reg(hits, mapFrame, "ten-monitor-map");
    // Sub-regions of the map, clickable for the spatial-pattern check.
    const tileNorth = box(mapPost, 0.55, 0.28, 0.01, -0.63, 1.35, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tileNorth, "tile-north");
    const tileCentral = box(mapPost, 0.55, 0.28, 0.01, 0, 1.05, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tileCentral, "tile-central");
    const tileSouth = box(mapPost, 0.55, 0.28, 0.01, 0.63, 0.85, 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tileSouth, "tile-south");
    // The specific stuck and outlier tiles, precisely clickable.
    const stuckTile = box(mapPost, 0.28, 0.28, 0.012, -0.475, 1.35, 0.021, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, stuckTile, "stuck-sensor");
    const outlierTile = box(mapPost, 0.28, 0.28, 0.012, 0.475, 0.85, 0.021, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, outlierTile, "fenceline-outlier");
    const publishStuckBtn = box(mapPost, 0.06, 0.03, 0.06, -0.475, 1.5, 0.03, 0x22262b, { rough: 0.6 });
    decal(publishStuckBtn, 0.055, 0.055, 0, 0.016, 0, signFace("KEEP LIVE", { bg: "#22262b", accent: "#f0645b", scale: 0.42 }));
    reg(hits, publishStuckBtn, "publish-stuck");
    const dismissOutlierBtn = box(mapPost, 0.06, 0.03, 0.06, 0.475, 0.7, 0.03, 0x22262b, { rough: 0.6 });
    decal(dismissOutlierBtn, 0.055, 0.055, 0, 0.016, 0, signFace("IGNORE", { bg: "#22262b", accent: "#f0645b", scale: 0.42 }));
    reg(hits, dismissOutlierBtn, "dismiss-outlier");

    // ------------------------------------------------------------- terminals
    const outlierCard = holoPanel(desk, 0.5, 0.34, -1.05, 1.1, 0, (cx, w, h) => {
      cx.fillStyle = "#1a1410"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#d98f4f"; cx.fillRect(0, 0, w, 4);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`; cx.fillStyle = "#f6e6d4";
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("OUTLIER RULES", w * 0.07, h * 0.18);
      ["3+ hrs off cluster median", "Action level: 35 µg/m³", "Check spatial pattern first"].forEach((l, i) => cx.fillText(l, w * 0.07, h * (0.4 + i * 0.19)));
    }, { accent: ANQ_ACCENT });
    reg(hits, outlierCard, "outlier-rules-card");

    const smokeTerm = instrument(desk, -0.6, 0.79, 0.15, { ry: 0.15, idle: "SMOKE: --", color: 0xd98f4f, w: 0.18, d: 0.22 });
    holoTag(desk, "Regional smoke index", -0.6, 1.0, 0.15, { css: "#d98f4f", w: 0.5 });
    const classifySmokeBtn = box(desk, 0.06, 0.03, 0.06, -0.75, 0.79, 0.15, 0x22262b, { rough: 0.6 });
    decal(classifySmokeBtn, 0.055, 0.055, 0, 0.016, 0, signFace("SMOKE DAY", { bg: "#22262b", accent: "#59c97b", scale: 0.4 }));
    reg(hits, classifySmokeBtn, "classify-smoke");
    const classifyLocalBtn = box(desk, 0.06, 0.03, 0.06, -0.45, 0.79, 0.15, 0x22262b, { rough: 0.6 });
    decal(classifyLocalBtn, 0.055, 0.055, 0, 0.016, 0, signFace("LOCAL", { bg: "#22262b", accent: "#f0645b", scale: 0.4 }));
    reg(hits, classifyLocalBtn, "classify-local");
    void smokeTerm;

    const pingBtn = instrument(desk, 0.55, 0.79, 0.2, { ry: -0.1, idle: "PING: --", color: 0x8b929a, w: 0.15, d: 0.2 });
    holoTag(desk, "Ping stuck sensor", 0.55, 1.0, 0.2, { css: "#d98f4f", w: 0.42 });
    reg(hits, pingBtn, "stuck-sensor-ping");
    const flagMaintBtn = box(desk, 0.06, 0.03, 0.06, 0.72, 0.79, 0.2, 0x22262b, { rough: 0.6 });
    decal(flagMaintBtn, 0.055, 0.055, 0, 0.016, 0, signFace("FLAG SVC", { bg: "#22262b", accent: "#f2c14b", scale: 0.4 }));
    reg(hits, flagMaintBtn, "flag-maintenance");
    const flagMovedBtn = box(desk, 0.06, 0.03, 0.06, 0.9, 0.79, 0.2, 0x22262b, { rough: 0.6 });
    decal(flagMovedBtn, 0.055, 0.055, 0, 0.016, 0, signFace("RESITED", { bg: "#22262b", accent: "#f2c14b", scale: 0.36 }));
    reg(hits, flagMovedBtn, "flag-moved-indoor");

    // ------------------------------------------------------------- cabinet: outlier level + trend
    const cab = equipmentCabinet(g, 0.6, 0.9, 0.4, 1.9, 0.4, { ry: -0.3, color: 0x6f7a83 });
    const levelBox = instrument(cab, 0, 1.06, 0.05, { idle: "-- µg/m³", color: 0xf0645b, w: 0.16, d: 0.2 });
    holoTag(cab, "Outlier level", 0, 1.26, 0.05, { css: "#f0645b", w: 0.4 });
    reg(hits, levelBox, "outlier-level");
    const trendBox = instrument(cab, 0.22, 1.06, -0.05, { idle: "TREND --", color: 0xf2c14b, w: 0.14, d: 0.18 });
    holoTag(cab, "Persistence watch", 0.22, 1.26, -0.05, { css: "#f2c14b", w: 0.5 });
    reg(hits, trendBox, "outlier-trend");

    // ------------------------------------------------------------- phone + email
    const phonePost = group(g, -1.9, 0, 0.6, 0.3);
    box(phonePost, 0.14, 0.2, 0.03, 0, 0.9, 0, 0x22262b, { rough: 0.55 });
    const reportEmail = decal(phonePost, 0.16, 0.1, 0, 1.05, 0.016, signFace("EMAIL: reporter", { bg: "#1a1410", accent: "#d98f4f", fg: "#f6e6d4", scale: 0.42 }), { px: 256 });
    reg(hits, reportEmail, "reporter-email");
    const holdBtn = box(phonePost, 0.06, 0.03, 0.02, 0, 0.8, 0.02, 0x22262b, { rough: 0.6 });
    decal(holdBtn, 0.055, 0.028, 0, 0, 0.011, signFace("REPLY: QA PENDING", { bg: "#22262b", accent: "#59c97b", scale: 0.3 }));
    reg(hits, holdBtn, "hold-for-qa");
    const rawBtn = box(phonePost, 0.06, 0.03, 0.02, 0, 0.65, 0.02, 0x22262b, { rough: 0.6 });
    decal(rawBtn, 0.055, 0.028, 0, 0, 0.011, signFace("SEND RAW #", { bg: "#22262b", accent: "#f0645b", scale: 0.3 }));
    reg(hits, rawBtn, "release-raw-number");

    // ------------------------------------------------------------- close-out + log
    const boardPost = group(g, 1.9, 0, 1.6, -0.3);
    cyl(boardPost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const notifyPanel = decal(boardPost, 0.18, 0.09, -0.12, 1.02, 0.016, signFace("NOTIFY BAAQMD", { bg: "#1a1410", accent: "#d98f4f", fg: "#f6e6d4", scale: 0.4 }), { px: 256 });
    reg(hits, notifyPanel, "notify-baaqmd");
    const dashPanel = decal(boardPost, 0.18, 0.09, 0.12, 1.02, 0.016, signFace("PUBLIC NOTE", { bg: "#1a1410", accent: "#59c97b", fg: "#f6e6d4", scale: 0.42 }), { px: 256 });
    reg(hits, dashPanel, "dashboard-note-panel");

    const signClip = group(g, 1.9, 0, 2.1, -0.4);
    box(signClip, 0.24, 0.02, 0.32, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const signFacePanel = decal(signClip, 0.22, 0.29, 0, 0.871, 0,
      paperFace("WEEKLY REVIEW LOG", ["Classification ___", "Stuck sensor ___",
        "Outlier reported ___", "Signed ___ Date ___"], { worn: true }), { px: 256 });
    signFacePanel.rotation.x = -Math.PI / 2;
    holoTag(signClip, "Review log", 0, 1.05, 0, { css: "#d98f4f", w: 0.34 });
    reg(hits, signFacePanel.parent, "review-log");

    const signPadClip = group(g, 1.6, 0, 2.1, -0.4);
    box(signPadClip, 0.2, 0.02, 0.26, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const signPadFace = decal(signPadClip, 0.18, 0.23, 0, 0.871, 0,
      paperFace("SIGN OFF", ["Reviewed by ___", "Date ___"], { worn: true }), { px: 256 });
    signPadFace.rotation.x = -Math.PI / 2;
    holoTag(signPadClip, "Sign here", 0, 1.0, 0, { css: "#d98f4f", w: 0.3 });
    reg(hits, signPadFace.parent, "sign-pad");

    const reviewer = standingFigure(g, -1.1, 1.7, { ry: -1.2, cloth: 0x37505f, vest: 0xd98f4f });
    void reviewer;
    toolChest(g, -1.9, 1.7, { color: 0x2f6f5a });

    // Office furnishings — a chair, a binder shelf and a wall clock, so the
    // desk reads as a lived-in office rather than a bare instrument bench.
    const chair = group(g, 0, 0, -0.35, 0.15);
    cyl(chair, 0.02, 0.02, 0.42, 0, 0.21, 0, 0x22262b, { rough: 0.6, metal: 0.4, seg: 10 });
    slab(chair, 0.44, 0.06, 0.44, 0, 0.44, 0, 0x3c444c, { radius: 0.03, rough: 0.7 });
    slab(chair, 0.4, 0.5, 0.05, 0, 0.7, -0.19, 0x3c444c, { radius: 0.04, rough: 0.7 });
    for (const [sx, sz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      cyl(chair, 0.012, 0.012, 0.22, sx, 0.11, sz, 0x22262b, { rough: 0.5, metal: 0.5, seg: 6 });
    }

    const shelf = group(g, -1.95, 0, -0.6);
    for (const y of [0.6, 1.1, 1.6]) box(shelf, 0.5, 0.03, 0.28, 0, y, 0, 0x6d5a43, { rough: 0.75 });
    for (const sx of [-0.22, 0.22]) box(shelf, 0.03, 1.6, 0.28, sx, 0.8, 0, 0x5a4a37, { rough: 0.75 });
    for (const [i, c] of [0xb8402f, 0x2f6f5a, 0x4fb3d9, 0xd98f4f].entries()) {
      box(shelf, 0.09, 0.28, 0.22, -0.18 + i * 0.12, 0.75 + (i % 2) * 0.5, 0, c, { rough: 0.6 });
    }

    const clock = group(g, 0, 2.3, -1.95);
    cyl(clock, 0.16, 0.16, 0.03, 0, 0, 0, 0xf2f4f5, { rough: 0.5, seg: 20 });
    box(clock, 0.01, 0.1, 0.015, 0, 0.03, 0.02, 0x22262b, { rough: 0.5 });
    box(clock, 0.07, 0.01, 0.015, 0.03, 0, 0.02, 0x22262b, { rough: 0.5 });

    const bin = cyl(g, 0.12, 0.09, 0.24, 0.95, 0.12, -1.5, 0x3c444c, { rough: 0.6, metal: 0.3, seg: 14 });
    void bin;
    const lamp = group(desk, -0.85, 0.75, 0.3);
    cyl(lamp, 0.03, 0.03, 0.02, 0, 0, 0, 0x22262b, { rough: 0.6 });
    cyl(lamp, 0.015, 0.015, 0.35, 0, 0.18, 0, 0x22262b, { rough: 0.5, metal: 0.4, seg: 8 });
    ball(lamp, 0.06, 0, 0.37, 0.08, 0xfff3d6, { emissive: 0xfff3d6, ei: 1.2, rough: 0.4 });

    // ------------------------------------------------------------ live state
    let pinging = false, movedFlagged = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.5, -0.2),
      onStepComplete(step) {
        if (step.id === "outlier-rules") repaint(smokeTerm.userData.screen, signFace("SMOKE: elevated", { bg: "#0d1c24", accent: "#d98f4f", fg: "#f6e6d4", scale: 0.5 }));
        if (step.id === "ping-stuck") { pinging = false; repaint(pingBtn.userData.screen, signFace("PING: none", { bg: "#0d1c24", accent: "#f0645b", fg: "#f6e6d4", scale: 0.5 })); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "reporter-email") { reportEmail.material.emissiveIntensity = 2.2; }
        if (it.id === "owner-moved-sensor") { flagMovedBtn.material.emissiveIntensity = 2.0; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "reporter-email") reportEmail.material.emissiveIntensity = 0.85;
        if (it.id === "owner-moved-sensor") { movedFlagged = true; flagMovedBtn.material.emissiveIntensity = 0.85; }
      },
      animate(t, dt, session) {
        void movedFlagged;
        if (session?.holding && session.step?.id === "ping-stuck") { pinging = true; pingBtn.userData.screen.material.emissiveIntensity = 0.6 + Math.sin(t * 8) * 0.3; }
        else if (!pinging) pingBtn.userData.screen.material.emissiveIntensity = 0.85;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "outlier-level") {
          repaint(levelBox.userData.screen, signFace(`${(gg.t * 60).toFixed(0)} µg/m³`, { bg: "#0d1c24", accent: gg.t > 0.58 && gg.t < 0.85 ? "#59c97b" : "#f0645b", fg: "#f6e6d4", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "watch-persistence") {
          repaint(trendBox.userData.screen, signFace(`${(session.track.v * 60).toFixed(0)}`, { bg: "#0d1c24", accent: session.track.v > 0.58 && session.track.v < 0.85 ? "#59c97b" : "#f0645b", fg: "#f6e6d4", scale: 0.6 }));
        }
      },
    };
  },
};
