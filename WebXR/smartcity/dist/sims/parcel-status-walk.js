import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, particles, noiseTexture,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Parcel Status Walk VR — Community Environmental Justice,
// station one hundred sixty-four.
//
// A community patrol walking the public sidewalk around several fenced
// parcels of a generic shipyard under a federal cleanup order, carrying the
// regulator's own current parcel map rather than trusting the signage or
// last year's memory. No real parcel numbers, dates or agency letters are
// claimed here — the point of the station is the discipline: a parcel's
// status is whatever the regulator's own map says it is today, a posted
// sign can lag the map by months, "transferred" does not mean unrestricted
// once an institutional control is recorded on the deed, and a patrol
// answers a resident's honest question from the map in hand, never from
// how a fence happens to look from the sidewalk. The walk never crosses a
// fence line — every parcel in this station is read from the public side,
// the only side a community patrol works from.

const PSW_ACCENT = 0xc98a2b;

export const SIM_PARCEL_STATUS_WALK = {
  id: "parcel-status-walk",
  index: "164",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "The kind of parcel-status walk the Community Pollution Patrol Network trains; EPA Superfund community-involvement practice and the regulator's own current parcel map and institutional-controls registry as the only source a patrol answers from; DTSC and the Regional Water Board as the state agencies that record a parcel's cleanup status; BAAQMD's Community Advisory Council process for what a patrol reports up the chain; OSHA 29 CFR 1910.120 HAZWOPER as the separate gate for anyone who goes past a fence, which this walk never does",
  name: "Parcel Status Walk",
  title: simTitle("Parcel Status Walk"),
  tagline: "Walking the public sidewalk around a shipyard's fenced parcels with the regulator's own map: which parcel transferred, which is under cleanup, which is being retested, the institutional-controls signage, and the map annotated with exactly what the walk found",
  accent: PSW_ACCENT,
  accentCss: "#c98a2b",
  parSeconds: 300,
  footprint: 2.3,
  badge: { id: "map-honest", name: "Map Honest", note: "Every parcel called from the regulator's own map, the discrepancy caught and photographed, and the resident answered honestly from the map in hand" },

  game: system({
    name: "Patrol Record",
    currency: "PARCEL",
    ranks: ["Walker", "Route Reader", "Patrol Member", "Patrol Lead", "Community Patrol Certified"],
    badges: [
      { id: "map-first", name: "Map First", note: "Read the regulator's map before the walk and answered the resident from it, clean", test: AWARD.all(AWARD.stepClean("map"), AWARD.stepClean("status-check")) },
      { id: "never-crossed", name: "Never Crossed", note: "Read every parcel from the public sidewalk, never through a fence", test: AWARD.safe },
      { id: "standoff-true", name: "Standoff True", note: "Held the posted standoff distance the whole walk", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-walk", name: "Clean Walk", note: "No corrections anywhere on the route", test: AWARD.clean },
      { id: "steady-pace", name: "Steady Pace", note: "Never broke the patrol walking pace", test: AWARD.unbroken },
      { id: "map-back-fast", name: "Map Back Fast", note: "Annotated map filed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-fence": "You went through the fence to get a closer look at the sign. A parcel behind a fence is behind a fence for a reason whatever its status — transferred, under cleanup or being retested — and a community patrol reads every one of them from the public sidewalk, never from the other side of the wire.",
    "skip-map": "You started down the block without opening the regulator's own parcel map first. Reading fence signage from memory or from what looked true on last month's walk is exactly how a patrol reports a parcel's status one revision behind the record that actually governs it.",
    "guess-status": "You told the bystander the street looked cleared without checking the map first. A fence that looks quiet from the sidewalk is not the same thing as a parcel the regulator's own map has actually closed out — a guess dressed up as reassurance is worse than saying you need to check.",
    "report-without-photo": "You filed the walk report before photographing the sign that didn't match the map. Whoever reviews this report has no way to see what you saw at that fence — a discrepancy that isn't photographed is a claim nobody downstream can verify.",
  },

  lateNotes: {
    "mismatched-sign": "Walk the route and read the map's own call on each parcel before deciding which sign doesn't match it — there's nothing to flag as a discrepancy until you know what the map actually says.",
    "photo-cam": "Nothing worth photographing yet — find the sign that doesn't match the map before the camera has anything to prove.",
    "map-pin": "Nothing to pin on the map yet — the discrepancy has to actually be found and photographed before there's a location worth marking.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a track/hold step, on purpose — a select, sequence, turn, gauge, find
  // or drag step resolves in one action, too fast for the fuse to ever find
  // the patrol mid-task.
  interrupts: [
    {
      id: "open-gate",
      kind: "Open gate",
      after: "walk-loop", delay: 4, seconds: 13,
      alert: "The access gate on the parcel behind you stands wide open onto the sidewalk, and there's nobody from the site crew anywhere near it.",
      cue: "Flag the open, unattended gate before you're two more signs down the block and it slips your notes entirely.",
      target: "gate-flag",
      why: "An open gate with nobody watching it is itself something worth the regulator knowing about, whatever the parcel's own status says — the institutional controls a map records assume the site stays secured, and a patrol that notices a breach in that security and just keeps walking has thrown away the one chance to log it while the gate is still open and the time still means something.",
      missNote: "The gate was still open when the patrol reached the corner five signs later, with no note of when it was first seen — by the time it got mentioned back at the office, nobody could say whether it had been open five minutes or the whole afternoon.",
      wrongNote: "Not that — the gate. It's standing open with no one at it, and that's what needs flagging before the walk moves on.",
    },
    {
      id: "resident-question",
      kind: "A resident asks",
      after: "final-check", delay: 3, seconds: 13,
      alert: "A resident stops beside you on the sidewalk and asks straight out whether their street is \"cleared\" now that the fence signs look different from last year.",
      cue: "Answer from the map you're holding — not from how the fence happens to look today.",
      target: "parcel-map",
      why: "A resident asking that question deserves the same honesty the whole walk is built on: the map, not the sidewalk view, is what actually says whether a parcel closed out, and a patrol that answers from appearances because it's faster is giving a health-relevant answer it cannot actually back up.",
      missNote: "The resident walked away with a guess instead of an answer, and a wrong reassurance repeated down the block is exactly the kind of thing a patrol spends months trying to correct once it starts going around the neighbourhood as fact.",
      wrongNote: "Not that — the map is what actually answers her question. Read it back to her from there, not from the fence.",
    },
  ],

  steps: [
    {
      id: "gear-up", kind: "sequence", anyOrder: true,
      targets: ["vest", "map-case"],
      itemNames: { vest: "hi-vis vest", "map-case": "map case" },
      title: "Vest and map case",
      cue: "Put on the hi-vis vest and pick up the map case before stepping off the corner.",
      why: "The block this walk covers has real traffic and real machinery moving behind the fences, and the vest is what keeps a patrol member visible to both. The map case is what the whole walk is organised around — nothing about a parcel's status gets decided without it in hand.",
    },
    {
      id: "map", kind: "select", target: "parcel-map",
      title: "Read the regulator's parcel map",
      cue: "Open the map case and read today's status for every parcel on this block before the walk starts.",
      why: "The map is the regulator's own current record — DTSC and the Regional Water Board's, not a patrol's own guess — and it is the only thing every fence sign gets checked against for the rest of the walk. Starting the route without reading it first means walking a block of signs with nothing to actually judge them by.",
    },
    {
      id: "focus", kind: "turn", target: "binocular-focus",
      title: "Focus the binoculars on the far sign",
      cue: "Turn the focus ring until the parcel sign across the block reads clearly from the sidewalk.",
      why: "Some of this block's signage sits well back from the fence line, and a patrol that stays on the public sidewalk needs the sign to come to it rather than walking closer to read it — the binoculars are what make that possible without ever approaching the fence.",
      turn: { turns: 0.5, axis: "y", label: "FOCUS" },
    },
    {
      id: "standoff", kind: "gauge", target: "rangefinder",
      title: "Confirm standoff from the fence line",
      cue: "Read the rangefinder and commit once you're outside the posted standoff distance.",
      why: "The posted standoff distance is there so a patrol member reading signage or taking a photograph never has a reason to lean toward the fence to get a better look — confirming it here, before the walk starts, is what keeps the whole route honestly on the public side for its full length.",
      gauge: {
        label: "STANDOFF", speed: 0.62, green: [0.44, 0.6],
        readout: (t) => `${(2 + t * 6).toFixed(1)} m`,
        missNote: "Not outside the posted standoff yet — read the rangefinder again and commit once the distance clears the line the map's own notes call for.",
      },
    },
    {
      id: "route", kind: "sequence",
      targets: ["sign-a", "sign-b", "sign-c"],
      itemNames: { "sign-a": "Parcel A sign", "sign-b": "Parcel B sign", "sign-c": "Parcel C sign" },
      title: "Read each parcel's posted sign, in order",
      cue: "Walk the sidewalk past Parcel A, then B, then C, reading the posted sign at each fence.",
      why: "Reading the parcels in the map's own order is what keeps every note in this walk matched to the right fence once the patrol is back at a desk — read them out of order and it becomes easy to write Parcel C's sign into the note meant for Parcel B.",
      outOfOrderNote: "Not the next parcel in the route — the map lists them A, B, C, and reading them out of order is how a sign ends up written down against the wrong fence.",
    },
    {
      id: "walk-loop", kind: "track", target: "patrol-boots", seconds: 9,
      title: "Hold a steady patrol pace down the block",
      cue: "Keep your walking pace inside the band the whole block — not so fast you miss a sign, not so slow you're loitering at a fence.",
      why: "A pace that's too fast walks straight past a sign that's been changed or a gate that's come open without ever registering it; a pace that's too slow starts to look, from the other side of the fence, like someone lingering at a security line rather than a patrol walking a public sidewalk. The same steady pace that reads every sign is the pace that keeps the walk looking like exactly what it is.",
      track: {
        start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.5, drift: 0.12, label: "PATROL PACE",
        readout: (v) => (v < 0.4 ? "too fast — missing signs" : v > 0.6 ? "too slow — loitering at the fence" : "on pace"),
      },
      holdBreakNote: "Pace drifted out of the band — bring it back before a sign gets missed or the walk starts to look like it's lingering at the fence.",
    },
    {
      id: "status-check", kind: "select", target: "sign-b",
      title: "Confirm which parcel the map calls under cleanup",
      cue: "Check the map's own call again, then click the sign for the parcel it lists as still under active cleanup.",
      why: "The point of walking with the map open isn't just reading the signs once — it's being able to answer, on demand, which parcel the regulator's own record says is still under cleanup right now, because that is exactly the kind of question a resident on this block is going to ask.",
    },
    {
      id: "institutional-controls", kind: "select", target: "ic-board",
      title: "Read the institutional-controls notice",
      cue: "Read the deed-restriction placard posted on the transferred parcel before assuming transferred means unrestricted.",
      why: "A parcel can transfer to a new owner and still carry an institutional control — a deed restriction on digging, on groundwater use, on residential building — that the map records separately from the transfer itself. A patrol that reads \"transferred\" and stops there is one step short of what the map is actually saying about that ground.",
    },
    {
      id: "discrepancy", kind: "find", noHint: true,
      targets: ["mismatched-sign"],
      itemNames: { "mismatched-sign": "outdated sign" },
      itemNotes: { "mismatched-sign": "That sign still reads \"under cleanup,\" but the map you're carrying already lists this parcel as being retested — the posted sign is behind the record, and that gap is exactly what this walk exists to catch." },
      title: "Find the sign that doesn't match the map",
      cue: "Walk the block again against the map and click the one posted sign that is behind the current record.",
      why: "Signage gets reprinted on somebody else's schedule, not the map's — a sign can sit unchanged for months after a parcel's status actually moves, and a patrol that never checks the posted sign against the map has no way to know which fence is telling the truth and which one is just telling last quarter's truth.",
    },
    {
      id: "photo", kind: "select", target: "photo-cam",
      title: "Photograph the outdated sign",
      cue: "Photograph the mismatched sign against the fence it's posted on, from the standoff line.",
      why: "A discrepancy that only lives in a patrol member's memory is a discrepancy nobody downstream can check — the photograph is what lets whoever reviews the walk see the same gap between the sign and the map that the patrol saw on the sidewalk.",
    },
    {
      id: "annotate", kind: "drag", target: "map-pin",
      title: "Pin the discrepancy on the map",
      cue: "Carry the annotation pin to the exact parcel on the map where the sign didn't match.",
      why: "The pin is what turns a photograph and a memory into a specific correction on the one document everyone downstream actually reads — a note that isn't tied to the map at the right parcel is a note that has to be tracked down and matched up by someone who wasn't there.",
      drag: { to: "pin-socket", radius: 0.35, missNote: "Not on the right parcel — a pin dropped anywhere else on the map points the next reader at the wrong fence." },
    },
    {
      id: "final-check", kind: "hold", target: "clipboard-review", seconds: 6,
      title: "Hold a final read of the notes against the map",
      cue: "Hold position at the corner and read your notes back against the map before the walk closes out.",
      why: "The walk is only as good as the last check on it — reading the notes back against the map here, at the corner, before anything gets filed, is what catches a sign transposed with another or a status copied down wrong before it ever leaves this block.",
      holdBreakNote: "Broke off the review before it finished — an interrupted read-back isn't a check, it's a glance at the page.",
    },
    {
      id: "report-file", kind: "select", target: "report-clip",
      title: "File the annotated map",
      cue: "Clip the annotated map to the route report and file it before leaving the corner.",
      why: "The annotated map is the whole point of the walk — everything the patrol read, confirmed and photographed only reaches anyone else once it's actually filed, clipped to the report a reviewer can trust was written from this block and no other.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, PSW_ACCENT);

    // ------------------------------------------------------------- sidewalk
    const groundMesh = box(g, 5.8, 0.14, 5.2, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3a3d3a", base2: "#2e312e", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.92, metal: 0.02, color: 0xb4b8ae },
    );
    // The kerb line dividing sidewalk from street, running the length of the block.
    box(g, 5.8, 0.1, 0.2, 0, 0.19, 2.3, 0x9a9488, { rough: 0.7, cast: false });

    // -------------------------------------------------------------- fences
    // Three fenced parcels along the block, each with its own posted sign,
    // and none of them ever crossed by the patrol.
    const fenceZ = -1.9;
    const parcelSpecs = [
      { x: -1.7, id: "sign-a", label: "PARCEL A — TRANSFERRED", css: "#59c97b", bg: "#0d2416" },
      { x: 0.0, id: "sign-b", label: "PARCEL B — UNDER CLEANUP", css: "#f2ae14", bg: "#241a08" },
      { x: 1.7, id: "sign-c", label: "PARCEL C — BEING RETESTED", css: "#d9a02c", bg: "#241a08" },
    ];
    for (let i = -3; i <= 3; i++) cyl(g, 0.03, 0.03, 1.3, i * 0.85, 0.65, fenceZ, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    box(g, 5.4, 1.0, 0.05, 0, 0.85, fenceZ, 0x545a52, { rough: 0.8, cast: false });
    box(g, 5.4, 0.04, 0.06, 0, 1.3, fenceZ, CITY.steel, { rough: 0.5, metal: 0.6, cast: false });

    const signMeshes = {};
    for (const p of parcelSpecs) {
      const post = group(g, p.x, 0.14, fenceZ + 0.2, 0);
      cyl(post, 0.03, 0.03, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
      const face = decal(post, 0.55, 0.32, 0, 1.05, 0.026, signFace(p.label, { bg: p.bg, accent: p.css, scale: 0.3 }), { px: 220 });
      signMeshes[p.id] = { post, face };
      reg(hits, post, p.id);
    }
    // A worker figure and equipment silhouette behind the "under cleanup"
    // fence, and a survey crew behind the "being retested" one — both on the
    // parcel side, the class-safe distance the patrol never crosses.
    const digger = group(g, 0.0, 0.14, -3.0, 0.4);
    box(digger, 0.7, 0.4, 0.5, 0, 0.32, 0, 0xe8b02e, { rough: 0.6 });
    box(digger, 0.85, 0.12, 0.12, 0.5, 0.6, 0, 0xe8b02e, { rough: 0.6 }).rotation.z = 0.4;
    for (const sx of [-0.24, 0.24]) box(digger, 0.7, 0.18, 0.14, 0, 0.1, sx, 0x2b2f34, { rough: 0.8 });
    const surveyor = standingFigure(g, 1.7, -3.0, { ry: 0.4, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xe4dc3a, atStation: true });
    void surveyor;

    // The institutional-controls placard on the transferred parcel's own
    // fence, a step below its status sign.
    const icBoard = group(g, -1.7, 0.14, fenceZ + 0.2, 0);
    const icFace = decal(icBoard, 0.5, 0.3, 0, 0.55, 0.026, signFace("DEED RESTRICTION — NO EXCAVATION, NO WATER USE", { bg: "#241a08", accent: "#d9a02c", scale: 0.26 }), { px: 240 });
    void icFace;
    holoTag(icBoard, "institutional control", 0, 0.72, 0, { css: "#c98a2b", w: 0.5 });
    reg(hits, icBoard, "ic-board");

    // The outdated sign — a fourth placard, tucked at the corner between
    // Parcel B and C, still reading the status the map has already moved
    // past. This is the "mismatched-sign" the discrepancy step finds.
    const oldSignPost = group(g, 0.85, 0.14, fenceZ + 0.2, 0);
    cyl(oldSignPost, 0.024, 0.024, 0.9, 0, 0.45, 0, CITY.darkSteel, { rough: 0.55, metal: 0.5, seg: 8 });
    const oldSignFace = decal(oldSignPost, 0.42, 0.24, 0, 0.86, 0.021, signFace("PARCEL C — UNDER CLEANUP", { bg: "#241a08", accent: "#8a8072", scale: 0.28 }), { px: 200 });
    void oldSignFace;
    reg(hits, oldSignPost, "mismatched-sign");

    // The gate — closed by default, opened by the "open-gate" interrupt.
    const gate = group(g, -0.85, 0.14, fenceZ, -0.05);
    const gateDoor = box(gate, 0.9, 1.0, 0.05, 0, 0.5, 0, 0x6a726a, { rough: 0.65, cast: false });
    const gateFlag = box(gate, 0.1, 0.1, 0.06, 0.5, 1.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(gate, "site gate", 0, 1.25, 0.1, { css: "#c98a2b", w: 0.3 });
    reg(hits, gateFlag, "gate-flag");

    // The literal fence-crossing hazard: a gap at the far end of the run.
    const crossGap = box(g, 0.6, 1.0, 0.2, 2.6, 0.85, fenceZ, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "public side only — do not cross", 2.6, 1.55, fenceZ, { css: "#f0645b", w: 0.75 });
    reg(hits, crossGap, "cross-fence");

    // -------------------------------------------------------------- corner post
    const corner = group(g, -2.1, 0, 1.6, 0.5);
    box(corner, 0.5, 0.5, 0.35, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const vest = group(corner, -0.12, 0.53, 0.05);
    box(vest, 0.2, 0.05, 0.16, 0, 0, 0, CITY.hiVis, { rough: 0.75 });
    holoTag(vest, "hi-vis vest", 0, 0.09, 0, { css: "#c98a2b", w: 0.3 });
    reg(hits, vest, "vest");
    const mapCase = group(corner, 0.13, 0.53, 0.02);
    box(mapCase, 0.22, 0.05, 0.16, 0, 0, 0, 0x2f6f4a, { rough: 0.6 });
    holoTag(mapCase, "map case", 0, 0.1, 0, { css: "#c98a2b", w: 0.3 });
    reg(hits, mapCase, "map-case");

    // The regulator's parcel map, a large holo panel above the corner post.
    const mapPanel = holoPanel(corner, 1.0, 0.7, 0, 1.3, -0.3, (ctx, w, h) => {
      ctx.fillStyle = "#1c1204"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c98a2b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("REGULATOR'S PARCEL MAP — THIS BLOCK", w * 0.06, h * 0.1);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#f2e6cc";
      ["Parcel A: transferred — deed restriction on file", "Parcel B: under active cleanup",
       "Parcel C: being retested this quarter", "Posted signs may lag this map by months"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.26 + i * 0.14));
      });
    }, { accent: PSW_ACCENT });
    reg(hits, mapPanel, "parcel-map");
    // Three pin sockets on the map, one per parcel, for the annotate step.
    const pinSockets = {};
    const pinSpecs = [["sign-a", -0.34], ["sign-b", 0.0], ["sign-c", 0.34]];
    for (const [id, dx] of pinSpecs) pinSockets[id] = group(mapPanel, dx, -0.22, 0.01);
    hits["pin-socket"] = pinSockets["sign-c"];

    // The annotation pin, staged on the corner post until dragged to the map.
    const pinGrp = group(corner, 0.25, 0.53, -0.1);
    ball(pinGrp, 0.02, 0, 0.02, 0, PSW_ACCENT, { emissive: PSW_ACCENT, ei: 1.2, seg: 10 });
    cyl(pinGrp, 0.004, 0.004, 0.04, 0, -0.02, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(pinGrp, "annotation pin", 0, 0.08, 0, { css: "#c98a2b", w: 0.34 });
    reg(hits, pinGrp, "map-pin");

    // ------------------------------------------------------------- optics post
    const opticsPost = group(g, -1.4, 0, 1.9, 0.3);
    cyl(opticsPost, 0.02, 0.02, 0.95, 0, 0.475, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const binocGrp = group(opticsPost, 0, 0.95, 0);
    box(binocGrp, 0.16, 0.08, 0.1, 0, 0, 0, 0x2b2f34, { rough: 0.4, metal: 0.5 });
    for (const sx of [-0.05, 0.05]) cyl(binocGrp, 0.035, 0.03, 0.14, sx, 0, 0.08, 0x1b1e22, { rough: 0.35, metal: 0.6, seg: 12 }).rotation.x = Math.PI / 2;
    const focusRing = valveWheel(binocGrp, 0, 0.1, 0.05, { r: 0.035, color: PSW_ACCENT, body: 0x2b2f34 });
    holoTag(opticsPost, "binoculars", 0, 1.2, 0, { css: "#c98a2b", w: 0.3 });
    reg(hits, focusRing.userData.wheel, "binocular-focus");

    // ------------------------------------------------------------- rangefinder
    const rfPost = group(g, -1.4, 0, 2.3, -0.3);
    cyl(rfPost, 0.018, 0.018, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 10 });
    const rf = instrument(rfPost, 0, 0.92, 0, { ry: 0.4, idle: "-- m", color: PSW_ACCENT, w: 0.12, d: 0.19 });
    holoTag(rfPost, "rangefinder", 0, 1.1, 0, { css: "#c98a2b", w: 0.3 });
    reg(hits, rf, "rangefinder");

    // ------------------------------------------------------------- patrol boots
    const boots = group(g, -0.4, 0.14, 1.3, 0);
    cyl(boots, 0.02, 0.02, 0.3, 0, 0.15, 0, CITY.darkSteel, { rough: 0.5, metal: 0.4, seg: 8 });
    const bootsInst = instrument(boots, 0, 0.32, 0, { ry: 0.2, idle: "-- pace", color: PSW_ACCENT, w: 0.12, d: 0.18 });
    holoTag(boots, "patrol pace", 0, 0.5, 0, { css: "#c98a2b", w: 0.3 });
    reg(hits, boots, "patrol-boots");

    // ------------------------------------------------------------- camera + report bench
    const bench = group(g, 1.4, 0, 1.7, -0.4);
    box(bench, 1.0, 0.5, 0.4, 0, 0.25, 0, 0x53585e, { rough: 0.6, metal: 0.3 });
    const camera = group(bench, -0.28, 0.53, 0.05);
    box(camera, 0.11, 0.07, 0.08, 0, 0, 0, 0x1b1e22, { rough: 0.4, metal: 0.4 });
    cyl(camera, 0.026, 0.03, 0.05, 0, 0, 0.06, 0x2b2f34, { rough: 0.35, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(camera, "camera", 0, 0.13, 0, { css: "#c98a2b", w: 0.26 });
    reg(hits, camera, "photo-cam");
    const clipboard = group(bench, 0.05, 0.53, -0.05);
    box(clipboard, 0.18, 0.015, 0.24, 0, 0, 0, 0xe8e2d2, { rough: 0.85 });
    decal(clipboard, 0.15, 0.2, 0, 0.009, 0, signFace("ROUTE NOTES", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.4 }), { px: 160 }).rotation.x = -Math.PI / 2;
    holoTag(clipboard, "hold for a final read", 0, 0.1, 0, { css: "#c98a2b", w: 0.5 });
    reg(hits, clipboard, "clipboard-review");
    const reportClip = group(bench, 0.35, 0.53, 0.08);
    box(reportClip, 0.16, 0.02, 0.22, 0, 0, 0, 0x2f6f4a, { rough: 0.6 });
    holoTag(reportClip, "route report", 0, 0.1, 0, { css: "#c98a2b", w: 0.3 });
    reg(hits, reportClip, "report-clip");

    // The "guess-status" shortcut: a bystander mic prop beside the bench,
    // never the interrupt's own resident.
    const bystanderProp = group(bench, -0.05, 0.53, -0.16);
    box(bystanderProp, 0.06, 0.02, 0.1, 0, 0, 0, 0xe8e2d2, { rough: 0.7 });
    holoTag(bystanderProp, "just say it's cleared?", 0, 0.09, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, bystanderProp, "guess-status");

    // The "skip-map" bypass button, on the corner post beside the map case.
    const skipBtn = box(corner, 0.09, 0.03, 0.05, 0.22, 0.75, -0.02, 0xd2312b, { rough: 0.5 });
    decal(skipBtn, 0.08, 0.025, 0, 0.016, 0, signFace("SKIP MAP", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }), { px: 140 });
    holoTag(corner, "walk without the map?", 0.22, 0.86, -0.02, { css: "#d2312b", w: 0.5 });
    reg(hits, skipBtn, "skip-map");

    // The "report-without-photo" shortcut, right beside the report clip.
    const rushBtn = box(bench, 0.09, 0.03, 0.05, 0.5, 0.53, 0.12, 0xd2312b, { rough: 0.5 });
    decal(rushBtn, 0.08, 0.025, 0, 0.016, 0, signFace("FILE NOW", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }), { px: 140 });
    holoTag(bench, "file before the photo?", 0.5, 0.63, 0.12, { css: "#d2312b", w: 0.5 });
    reg(hits, rushBtn, "report-without-photo");

    // ------------------------------------------------------------- dressing
    cone(g, -2.2, -1.6, { color: PSW_ACCENT }); cone(g, 2.2, -1.6, { color: PSW_ACCENT });
    toolChest(g, 2.1, 1.9, { ry: -0.6, color: 0x8a5f2f });
    barrierPanel(g, -0.5, 1.35, { ry: 0.3, w: 1.1, color: PSW_ACCENT });
    barrierPanel(g, 0.5, 1.35, { ry: -0.3, w: 1.1, color: PSW_ACCENT });
    const patrolLead = standingFigure(g, 0.9, 2.1, { ry: -2.3, cloth: 0x37505f, vest: PSW_ACCENT, helmet: 0xf2f2f2 });
    holoTag(patrolLead, "patrol lead", 0, 1.95, 0.15, { css: "#c98a2b", w: 0.3 });
    // The resident who asks the honest question, held clear of the bench and
    // the corner post until the interrupt calls attention to her.
    const resident = standingFigure(g, -0.05, 2.6, { ry: 3.0, cloth: 0x6f5a3f, skin: 0xa9714a });
    void resident;
    const dust = particles(g, 22, 0xbfc6cc, { size: 0.045, life: 1.6, additive: false, opacity: 0.12 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "focus") repaint(rf.userData.screen, signFace("READY", { bg: "#1c1204", accent: "#59c97b", fg: "#f2e6cc", scale: 0.55 }));
        if (step.id === "route") for (const id of ["sign-a", "sign-b", "sign-c"]) repaint(signMeshes[id].face, signFace(parcelSpecs.find((p) => p.id === id).label, { bg: "#0d2416", accent: "#59c97b", scale: 0.3 }, ), { px: 220 });
        if (step.id === "discrepancy") repaint(oldSignFace, signFace("MAP UPDATED — VERIFY", { bg: "#2a0c0c", accent: "#f0645b", scale: 0.28 }), { px: 200 });
        if (step.id === "annotate") { pinGrp.parent.remove(pinGrp); pinSockets["sign-c"].add(pinGrp); pinGrp.position.set(0, 0, 0); }
        if (step.id === "report-file") repaint(bootsInst.userData.screen, signFace("FILED", { bg: "#1c1204", accent: "#59c97b", fg: "#f2e6cc", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "open-gate") { gateDoor.rotation.y = -1.1; gateDoor.position.x = -0.4; }
        if (it.id === "resident-question") { resident.position.set(-0.5, 0, 1.75); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "open-gate") { gateDoor.rotation.y = 0; gateDoor.position.x = 0; }
        if (it.id === "resident-question") { resident.position.set(-0.05, 0, 2.6); }
      },
      onHazard() {},
      animate(t, dt, session) {
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(0, 0.5, 0), 0.02, 1.2, 0.08);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "standoff") {
          repaint(rf.userData.screen, signFace(`${(2 + gg.t * 6).toFixed(1)} m`, {
            bg: "#1c1204", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f2e6cc", scale: 0.55,
          }));
        }
        if (session?.track && session.step?.id === "walk-loop") {
          const v = session.track.v;
          repaint(bootsInst.userData.screen, signFace(v < 0.4 ? "TOO FAST" : v > 0.6 ? "TOO SLOW" : "ON PACE", {
            bg: "#1c1204", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f2e6cc", scale: 0.48,
          }));
        }
        if (session?.step?.id === "focus" && session.turn) {
          focusRing.userData.wheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
      },
    };
  },
};
