import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure,
  reg, surfaceTexture, texturedMat, mudflatFace, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Youth Patrol Training VR — Community Environmental Justice,
// Hunters Point Edition. A youth patrol team's first shift on the public
// sidewalk beside a fenced parcel: roles assigned before anyone steps off
// the curb, the route and the fence line's boundary walked and understood,
// the buddy rule that keeps two sets of eyes on every teammate, sun and
// smoke protection staged before the sun does any damage, a real observation
// logged the way the network can actually use it, the calm, practiced answer
// if site security or a stranger says something at the fence, and a debrief
// that closes the shift out loud instead of letting it just end. Sited
// generically: a fenced parcel, a public sidewalk, no borrowed facts about
// any one site.

const YPT_ACCENT = 0x59c97b;
const YPT_MUD = 0x3a3630;

export const SIM_YOUTH_PATROL_TRAINING = {
  id: "youth-patrol-training",
  index: "170",
  domain: "Environmental",
  trade: "Youth patrol member",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "The foundation's own youth patrol training protocol, run under adult supervision; BAAQMD's complaint process for what a filed observation is used for; NIOSH heat-stress guidance and the same shade-and-water trigger the state's heat-illness prevention standard sets for outdoor workers, adopted here as the patrol's own rule; EPA Air Quality Index guidance for reading a smoke or particulate reading before a shift; the patrol's own rule that members work the public side of a fence line, never inside it",
  name: "Youth Patrol Training",
  title: simTitle("Youth Patrol Training"),
  tagline: "A youth patrol team's first shift: roles assigned, the route and the fence-line boundary walked, the buddy rule kept, sun and smoke gear staged, an observation logged the way the network can use it, the calm answer at the fence, and a debrief that closes the shift",
  accent: YPT_ACCENT,
  accentCss: "#59c97b",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "first-shift-clean", name: "First Shift Clean", note: "Roles held, the buddy rule never broken, the boundary respected, and a real observation logged and handed off" },

  game: system({
    name: "Patrol Roster",
    currency: "SHIFT",
    ranks: ["Trainee Patroller", "Patrol Member", "Route Lead", "Team Recorder", "First-Shift Certified"],
    badges: [
      { id: "roles-held", name: "Roles Held", note: "Every role assigned and the buddy check passed clean", test: AWARD.all(AWARD.stepClean("assign-roles"), AWARD.stepClean("buddy-check")) },
      { id: "boundary-kept", name: "Boundary Kept", note: "Never a hazard, never a step over the fence line", test: AWARD.safe },
      { id: "true-eyes", name: "True Eyes", note: "The smoke reading and the steady observation both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the first shift", test: AWARD.clean },
      { id: "steady-scan", name: "Steady Scan", note: "Held the patrol scan rate in band the whole route", test: AWARD.unbroken },
      { id: "shift-on-time", name: "Shift On Time", note: "Debrief reached inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cross-fence-line": "You stepped through the gap toward the inside of the fence. The patrol's whole job is done from the public side of a fence line — the moment a foot crosses it, a youth patrol member is standing somewhere with real hazards and no training or escort to be there, and the parcel behind that fence is exactly the kind this edition trains everyone to treat as off-limits without both.",
    "argue-with-security": "You argued back when site security spoke to the team. The patrol's whole credibility rests on staying calm and factual at the fence — an argument gives anyone who wants to dismiss a youth patrol a reason to, and it puts a teenager in a confrontation an adult chaperone is the one supposed to handle.",
    "split-from-buddy": "You sent a member off alone to check something down the route. The buddy rule exists so nobody on this team is ever the only set of eyes on a situation — alone, a member has no one to back up what they saw, no one to go for help if something goes wrong, and no one who can vouch for what actually happened.",
    "skip-water-break": "You kept the route going past the shade tent instead of pulling the team in for water. Heat does not announce itself before it becomes a problem in a teenager standing on pavement in direct sun — the shade-and-water break is not a reward for finishing the route, it is what keeps the route safe to finish at all.",
  },

  lateNotes: {
    "response-board": "The fence-line response comes after an observation has actually been logged — there is nothing at the fence yet to be approached about.",
    "debrief-circle": "The debrief happens after the log is handed off — there is nothing yet to debrief.",
  },

  interrupts: [
    {
      id: "member-wanders-to-gap",
      kind: "Member straying from the group",
      after: "patrol-scan", delay: 4, seconds: 12,
      alert: "While the team's attention is on the scan, one member has peeled off toward the gap in the fence to get a closer look.",
      cue: "Call them back before they reach the gap — do not go get them yourself and leave the rest of the team split.",
      target: "recall-whistle",
      why: "The recall whistle is the patrol's own signal for exactly this — every member trained to stop and regroup the moment it sounds, instead of one adult or team lead walking off to fetch a straying member and leaving the rest of the team unsupervised at the fence line themselves.",
      missNote: "The member reached the gap before anyone called them back. A patrol that cannot recall its own members from a fence gap on the public sidewalk is not ready for the version of this that happens on a real route with a real hazard on the other side.",
      wrongNote: "That does not call them back. The recall whistle is the signal the whole team is trained to stop for — nothing else on this route does what it does.",
    },
    {
      id: "heat-index-trigger",
      kind: "Heat index rising",
      after: "steady-observation", delay: 4, seconds: 12,
      alert: "The heat index on the team's own thermometer just crossed the shade-and-water trigger the patrol trains to.",
      cue: "That is the number that means the whole team stops and gets to shade and water now, not at the end of the route.",
      target: "shade-tent",
      why: "The trigger is set below the point where heat becomes dangerous specifically so the team has time to act before anyone on it is actually in trouble — waiting to see if somebody starts to feel it is waiting past the point the number was chosen to catch.",
      missNote: "The team kept walking the route past the trigger with nobody sent to shade. Heat illness in a teenager on a sunny sidewalk does not wait for the end of a route to show up, and by the time it does, water and shade are treatment, not prevention.",
      wrongNote: "That does not answer the heat index. Get the team to the shade tent for water — nothing else on this route lowers the number that just tripped.",
    },
  ],

  steps: [
    {
      id: "assign-roles", kind: "sequence", anyOrder: true,
      targets: ["role-lead", "role-recorder", "role-photographer"],
      itemNames: { "role-lead": "route lead", "role-recorder": "recorder", "role-photographer": "photographer" },
      decoyNotes: { "role-solo": "There is no solo role on this patrol. Every member on the route has a job and a buddy — going out with nobody assigned to watch your back is not a fourth role, it is the buddy rule already broken before the shift starts." },
      options: [
        { id: "role-lead", label: "Route lead" }, { id: "role-recorder", label: "Recorder" },
        { id: "role-photographer", label: "Photographer" }, { id: "role-solo", label: "Nobody — go out solo" },
      ],
      title: "Assign the three shift roles",
      cue: "Give out the route lead, the recorder and the photographer badges before anyone steps off the curb.",
      why: "A route lead calls the pace and the boundary, a recorder writes down exactly what is seen and when, and a photographer documents it — three separate jobs so that one distracted moment does not lose the whole observation. Handing out badges before the shift starts is what keeps those three jobs from all landing on whoever happens to notice something first.",
    },
    {
      id: "boundary-walk", kind: "find", noHint: true,
      targets: ["boundary-marker-north", "boundary-marker-south"],
      itemNames: { "boundary-marker-north": "the route's north boundary marker", "boundary-marker-south": "the route's south boundary marker" },
      itemNotes: {
        "boundary-marker-north": "This flag marks where the patrol's route ends to the north — past it is outside tonight's assignment, not somewhere to keep walking because it looks interesting.",
        "boundary-marker-south": "This flag marks the south end. A route with a marked start and end is one the recorder can log honestly against, rather than guessing where 'the patrol area' actually stopped.",
      },
      title: "Walk the route and find both boundary markers",
      cue: "Find the two flags that mark where tonight's route starts and ends before the team moves.",
      why: "A patrol route with an unmarked boundary is a route every member defines for themselves, which is how one team ends up logging four different stretches of sidewalk as 'the route.' Finding both markers first means every log entry tonight is describing the same ground — and it is what keeps the whole team on the public side of the fence, since that boundary, not the fence itself, is where a youth patrol's route ends and the ground an OSHA HAZWOPER-trained crew works under 29 CFR 1910.120 begins.",
    },
    {
      id: "buddy-check", kind: "select", target: "buddy-signin-board",
      title: "Pair up and sign the buddy board",
      cue: "Pair every member with a buddy and sign both names on the board before moving off the curb.",
      why: "The buddy rule is the first thing this patrol trains and the last thing it lets slide: nobody moves along this fence line alone. Signing the board is what makes the pairing a fact the route lead can check at a glance, instead of an assumption everyone is trusting somebody else made.",
    },
    {
      id: "gear-up", kind: "sequence", anyOrder: true,
      targets: ["gear-sunscreen", "gear-hat", "gear-water", "gear-smoke-mask"],
      itemNames: { "gear-sunscreen": "sunscreen", "gear-hat": "wide-brim hat", "gear-water": "water bottle", "gear-smoke-mask": "smoke mask" },
      title: "Stage sun and smoke protection",
      cue: "Take sunscreen, a hat, a full water bottle and a smoke mask from the gear table before heading out.",
      why: "A patrol shift is an hour or more standing and walking on open pavement with no shade until the tent, and this edition trains sun and smoke protection the same way it trains the buddy rule — staged before the exposure starts, not reached for once somebody already feels it. The smoke mask travels with every member even on a clear day, because a smoke event does not wait for the gear table to be nearby.",
    },
    {
      id: "water-stage", kind: "drag", target: "water-cooler",
      title: "Carry the water cooler to the shade tent",
      cue: "Wheel the water cooler from the gear table to the shade tent before the route starts.",
      why: "The shade-and-water break only works if the water is already waiting at the tent when the team needs it — sending someone back to the gear table for it after the heat trigger has already gone off adds exactly the delay the trigger was set early enough to avoid.",
      drag: { to: "shade-station-socket", radius: 0.45, missNote: "Not seated at the tent — carry the cooler all the way to the shade station before letting go." },
    },
    {
      id: "smoke-check", kind: "gauge", target: "smoke-gauge",
      title: "Read today's smoke and particulate reading",
      cue: "Read the gauge and commit only if today's reading falls in the range the patrol trains to go out in.",
      why: "A patrol that walks a route on a day the air itself is the hazard is training the wrong lesson before it has taken a single step — reading the gauge honestly, and being willing to call off or shorten a route on a bad-air day, is the same judgment call the network's own professional monitors have to make before every shift.",
      gauge: { label: "AQI", speed: 0.7, green: [0.15, 0.4], readout: (t) => `${Math.round(t * 300)} AQI`, missNote: "Outside today's go/no-go range for the route. Read the gauge again before deciding to head out." },
    },
    {
      id: "patrol-scan", kind: "track", target: "scan-badge", seconds: 7,
      title: "Scan the fence line at a steady patrol pace",
      cue: "Walk the route holding a steady scanning rate — not so fast you miss something, not so slow the team bunches up at the fence.",
      why: "Moving too fast down the fence line means the recorder and the photographer never get a clean look at anything worth logging; moving too slow bunches the whole team up in one place along a fence they are supposed to be walking past, not lingering at. A steady scan is what actually gives every member on the route a fair look at what is there.",
      track: { start: 0.12, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.12, label: "SCAN RATE", readout: (v) => (v < 0.4 ? "too fast — missing detail" : v > 0.6 ? "too slow — team bunching up" : "steady patrol pace") },
      holdBreakNote: "The scan rate dropped out of band. Bring the pace back to steady before the route continues.",
    },
    {
      id: "steady-observation", kind: "hold", target: "binoculars", seconds: 5,
      title: "Hold a steady look on the distant marker",
      cue: "Hold the binoculars steady on what the team spotted down the fence line before calling it in to the recorder.",
      why: "A glance at something along the fence line is an impression; a held, steady look is an observation the recorder can actually write down with confidence — what it was, roughly where, and for how long it was there. The recorder writes down what the team actually saw, not what someone thought they glimpsed while already walking on.",
      holdBreakNote: "You lowered the binoculars before the look was steady. A half-second glance is not enough to call in — hold it again until you can describe what you are actually looking at.",
    },
    {
      id: "log-entry", kind: "sequence",
      targets: ["log-time", "log-location", "log-description", "log-photo"],
      itemNames: { "log-time": "time", "log-location": "location", "log-description": "description", "log-photo": "photo" },
      title: "Fill in the observation log in order",
      cue: "Write the time, then the location, then the description, then attach the photo — in that order.",
      why: "Time and location first is what lets anyone reading this log later place the observation on the record without guessing; the description and the photo mean nothing without them. This is the same order the network's professional monitors use, because a log filled in out of order is a log somebody has to reconstruct instead of just read.",
      outOfOrderNote: "Time, then location, then description, then photo — filled in any other order, the entry is missing the two facts that let anyone else use it.",
    },
    {
      id: "handoff-to-lead", kind: "select", target: "handoff-basket",
      title: "Hand the completed log to the route lead",
      cue: "Place the finished log entry in the route lead's basket before moving on.",
      why: "The route lead is the one who carries every log entry back to the patrol network at the end of the shift — an entry that stays in the recorder's own notebook instead of being handed off is an observation that never leaves this route.",
    },
    {
      id: "stranger-response", kind: "select", target: "response-board",
      title: "Answer site security calmly at the fence",
      cue: "Post the response the patrol trains: stay together, stay polite, give your name if asked, and step back to the sidewalk.",
      why: "The patrol works from the public sidewalk, which means it has every right to be there — but the way to prove that is staying calm and factual, not winning an argument. A team that answers this the way it trains keeps the shift about the observation, not about a confrontation at the fence that nobody needed to have.",
    },
    {
      id: "debrief", kind: "select", target: "debrief-circle",
      title: "Gather the team for the debrief",
      cue: "Bring the whole team into the circle to close out the shift out loud.",
      why: "A shift that just ends when the route is walked teaches nothing the next shift can use — a debrief said out loud, while everyone remembers it the same way, is what turns one team's first patrol into something the next new member gets told before their own first shift.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, YPT_ACCENT);

    // ------------------------------------------------------------ ground
    const sidewalkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#7d7a70", base2: "#6c695f" }), { repeat: 3 });
    const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 5.2), texturedMat(sidewalkTex, { rough: 0.9 }));
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(-1.0, 0.01, 0);
    sidewalk.receiveShadow = true;
    g.add(sidewalk);
    const mudTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, {}), { repeat: 2 });
    const parcelGround = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.2), texturedMat(mudTex, { rough: 0.95 }));
    parcelGround.rotation.x = -Math.PI / 2;
    parcelGround.position.set(2.0, 0.005, 0);
    parcelGround.receiveShadow = true;
    g.add(parcelGround);

    // ------------------------------------------------------------ fence line
    // A chain-link run along x = FENCE_X, built as short panels so one panel
    // can simply be left out — the gap the patrol trains never to walk into.
    const FENCE_X = 0.55;
    const PANEL_LEN = 0.6;
    const PANEL_COUNT = 6;
    const GAP_INDEX = 3;
    let gapCenterZ = 0;
    for (let i = 0; i <= PANEL_COUNT; i++) {
      const z0 = -1.8 + i * PANEL_LEN;
      cyl(g, 0.02, 0.02, 1.5, FENCE_X, 0.75, z0, 0x6f7a83, { rough: 0.5, metal: 0.5, seg: 8 });
    }
    for (let i = 0; i < PANEL_COUNT; i++) {
      const z0 = -1.8 + i * PANEL_LEN;
      const zc = z0 + PANEL_LEN / 2;
      if (i === GAP_INDEX) { gapCenterZ = zc; continue; }
      const panel = decal(g, PANEL_LEN, 1.3, FENCE_X, 0.72, zc, (cx, w, h) => {
        cx.clearRect(0, 0, w, h);
        cx.strokeStyle = "rgba(140,148,156,0.85)"; cx.lineWidth = 2;
        const step = 22;
        for (let x = -step; x < w + step; x += step) {
          cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x + h, h); cx.stroke();
          cx.beginPath(); cx.moveTo(x, h); cx.lineTo(x + h, 0); cx.stroke();
        }
      }, { px: 256, transparent: true, rough: 0.7 });
      panel.rotation.y = Math.PI / 2;
      box(g, 0.02, 0.02, PANEL_LEN, FENCE_X, 1.38, zc, 0x6f7a83, { rough: 0.5, metal: 0.5 });
      box(g, 0.02, 0.02, PANEL_LEN, FENCE_X, 0.08, zc, 0x6f7a83, { rough: 0.5, metal: 0.5 });
    }
    const gapHit = box(g, 0.5, 1.3, PANEL_LEN, FENCE_X, 0.72, gapCenterZ, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cross into the parcel?", FENCE_X, 1.5, gapCenterZ, { css: "#e8622a", w: 0.5 });
    reg(hits, gapHit, "cross-fence-line");
    decal(g, 0.3, 0.2, FENCE_X + 0.01, 1.1, -1.6, signFace("NO TRESPASSING", { bg: "#2a1416", accent: "#f0645b", scale: 0.4 }), { px: 160 }).rotation.y = Math.PI / 2;

    // ------------------------------------------------------------ boundary markers
    const markerNorth = group(g, -1.0, 0, -2.3);
    cyl(markerNorth, 0.015, 0.015, 1.1, 0, 0.55, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 8 });
    box(markerNorth, 0.22, 0.16, 0.01, 0, 1.05, 0, 0x59c97b, { rough: 0.6, cast: false });
    holoTag(markerNorth, "boundary — north", 0, 1.24, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, markerNorth, "boundary-marker-north");
    const markerSouth = group(g, -1.0, 0, 2.3);
    cyl(markerSouth, 0.015, 0.015, 1.1, 0, 0.55, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 8 });
    box(markerSouth, 0.22, 0.16, 0.01, 0, 1.05, 0, 0x59c97b, { rough: 0.6, cast: false });
    holoTag(markerSouth, "boundary — south", 0, 1.24, 0, { css: "#59c97b", w: 0.36 });
    reg(hits, markerSouth, "boundary-marker-south");

    // ------------------------------------------------------------ roles board
    const rolesBoard = holoPanel(g, 0.85, 0.5, -1.7, 1.6, -1.9, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f7ea";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SHIFT ROLES", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#cdeed6";
      ["Route lead · Recorder · Photographer"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.45 + i * 0.16)));
    }, { accent: YPT_ACCENT });
    void rolesBoard;
    const badgeTable = group(g, -1.7, 0, -1.5);
    box(badgeTable, 0.7, 0.7, 0.4, 0, 0.35, 0, 0x53606b, { rough: 0.6, metal: 0.2 });
    const ROLE_BADGES = [
      ["role-lead", "LEAD", -0.22], ["role-recorder", "RECORDER", 0.0], ["role-photographer", "PHOTO", 0.22], ["role-solo", "SOLO?", 0.42],
    ];
    for (const [id, label, x] of ROLE_BADGES) {
      const badge = box(badgeTable, 0.13, 0.01, 0.13, x, 0.71, 0, id === "role-solo" ? 0x8a5a3a : 0x2f6f4a, { rough: 0.65 });
      decal(badgeTable, 0.12, 0.12, x, 0.716, 0, signFace(label, { bg: "#0d1c14", accent: "#59c97b", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, badge, id);
    }

    // ------------------------------------------------------------ buddy board
    const buddyBoard = group(g, -1.7, 0, -0.6);
    box(buddyBoard, 0.5, 0.4, 0.03, 0, 1.1, 0, 0x3a2e1f, { rough: 0.85 });
    const buddySign = decal(buddyBoard, 0.42, 0.32, 0, 1.1, 0.02, paperFace("BUDDY SIGN-IN", ["1: ______  2: ______", "3: ______  4: ______"], { bg: "#f2efe0", band: "#2f6f4a" }), { px: 200 });
    holoTag(buddyBoard, "buddy board", 0, 1.32, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, buddySign, "buddy-signin-board");
    const splitHazard = group(g, -1.4, 0, -0.35);
    ball(splitHazard, 0.03, 0, 0.6, 0, 0xe8622a, { rough: 0.5 });
    holoTag(splitHazard, "send them alone?", 0, 0.78, 0, { css: "#e8622a", w: 0.4 });
    reg(hits, splitHazard, "split-from-buddy");

    // ------------------------------------------------------------ gear table
    const gearTable = group(g, -1.8, 0, 0.3);
    box(gearTable, 0.9, 0.7, 0.45, 0, 0.35, 0, 0x5a4a36, { rough: 0.65 });
    const GEAR = [
      ["gear-sunscreen", "SUNSCREEN", -0.32, 0xf2e6c0], ["gear-hat", "HAT", -0.1, 0xd8b23a],
      ["gear-water", "WATER", 0.12, 0x3a8fd0], ["gear-smoke-mask", "MASK", 0.34, 0xdfe4e8],
    ];
    for (const [id, label, x, color] of GEAR) {
      const item = box(gearTable, 0.14, 0.1, 0.14, x, 0.76, 0, color, { rough: 0.6 });
      decal(gearTable, 0.13, 0.13, x, 0.812, 0, signFace(label, { bg: "#1c1408", accent: "#59c97b", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, item, id);
    }
    const skipWaterHazard = group(g, -0.4, 0, 0.3);
    ball(skipWaterHazard, 0.03, 0, 0.4, 0, 0xe8622a, { rough: 0.5 });
    holoTag(skipWaterHazard, "skip the break?", 0, 0.58, 0, { css: "#e8622a", w: 0.42 });
    reg(hits, skipWaterHazard, "skip-water-break");

    // ------------------------------------------------------------ water cooler + shade tent
    const cooler = group(gearTable, 0.0, 0.0, -0.35, 0.2);
    cyl(cooler, 0.11, 0.13, 0.4, 0, 0.55, 0, 0x3a8fd0, { rough: 0.5, seg: 14 });
    cyl(cooler, 0.05, 0.05, 0.08, 0, 0.79, 0, 0xdfe4e8, { rough: 0.5, seg: 10 });
    for (const [sx, sz] of [[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]]) {
      cyl(cooler, 0.02, 0.02, 0.06, sx, 0.06, sz, 0x1a1e23, { rough: 0.9, seg: 8 });
    }
    holoTag(cooler, "water cooler", 0, 0.9, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, cooler, "water-cooler");

    const shadeTent = group(g, -1.7, 0, 1.8);
    for (const [dx, dz] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) {
      cyl(shadeTent, 0.02, 0.02, 1.6, dx, 0.8, dz, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 8 });
    }
    box(shadeTent, 1.3, 0.04, 1.0, 0, 1.62, 0, 0xf2c14b, { rough: 0.7, cast: false });
    const shadeTable = box(shadeTent, 0.7, 0.05, 0.4, 0, 0.7, 0, 0x8a6a4a, { rough: 0.7 });
    void shadeTable;
    holoTag(shadeTent, "shade tent", 0, 1.9, 0, { css: "#59c97b", w: 0.3 });
    const coolerSocket = group(shadeTent, -0.2, 0, 0.2);
    hits["shade-station-socket"] = coolerSocket;
    reg(hits, shadeTent, "shade-tent");

    // ------------------------------------------------------------ smoke gauge
    const gaugeStand = group(g, -0.9, 0, -1.9);
    cyl(gaugeStand, 0.03, 0.035, 0.8, 0, 0.4, 0, 0x53606b, { rough: 0.6, metal: 0.3, seg: 10 });
    const smokeGauge = instrument(gaugeStand, 0, 0.82, 0, { idle: "-- AQI", color: YPT_ACCENT, w: 0.14, d: 0.2 });
    holoTag(gaugeStand, "smoke / AQI gauge", 0, 1.02, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, smokeGauge, "smoke-gauge");

    // ------------------------------------------------------------ patrol path + scan badge
    for (let i = -2; i <= 2; i++) {
      box(g, 0.5, 0.006, 0.16, -1.0, 0.004, i * 0.85, 0x59c97b, { rough: 0.7, emissive: 0x59c97b, ei: 0.3, cast: false });
    }
    const scanPost = group(g, -1.0, 0, -0.6);
    cyl(scanPost, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x53606b, { rough: 0.6, metal: 0.3, seg: 10 });
    const scanBadge = instrument(scanPost, 0, 1.03, 0, { idle: "----", color: YPT_ACCENT, w: 0.12, d: 0.18 });
    holoTag(scanPost, "scan badge", 0, 1.22, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, scanBadge, "scan-badge");

    const binocStand = group(g, -0.6, 0, -0.2);
    box(binocStand, 0.06, 0.6, 0.06, 0, 0.3, 0, 0x3c3020, { rough: 0.6 });
    const binoculars = group(binocStand, 0, 0.62, 0);
    for (const sx of [-1, 1]) cyl(binoculars, 0.035, 0.035, 0.14, sx * 0.05, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(binocStand, "binoculars", 0, 0.78, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, binoculars, "binoculars");

    // ------------------------------------------------------------ recall whistle
    const whistlePost = group(g, -0.3, 0, -1.3);
    cyl(whistlePost, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x53606b, { rough: 0.6, metal: 0.3, seg: 8 });
    const whistle = ball(whistlePost, 0.035, 0, 0.95, 0, 0xdfe4e8, { rough: 0.4, metal: 0.4, seg: 12 });
    holoTag(whistlePost, "recall whistle", 0, 1.1, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, whistle, "recall-whistle");

    // ------------------------------------------------------------ log clipboard
    const logDesk = group(g, -1.3, 0, 1.1);
    box(logDesk, 0.7, 0.65, 0.4, 0, 0.325, 0, 0x5a4a36, { rough: 0.65 });
    const clipboard = group(logDesk, 0, 0.68, 0);
    box(clipboard, 0.24, 0.02, 0.3, 0, 0, 0, 0xece3d0, { rough: 0.75 });
    const LOG_FIELDS = [["log-time", "TIME", -0.08], ["log-location", "LOCATION", -0.02], ["log-description", "DESCRIPTION", 0.04], ["log-photo", "PHOTO", 0.1]];
    for (const [id, label, y] of LOG_FIELDS) {
      const field = box(clipboard, 0.2, 0.004, 0.04, 0, 0.014, y, 0xdfe4e8, { rough: 0.7 });
      decal(clipboard, 0.18, 0.03, 0, 0.017, y, signFace(label, { bg: "#1c1408", accent: "#59c97b", scale: 0.3 })).rotation.x = -Math.PI / 2;
      reg(hits, field, id);
    }
    holoTag(logDesk, "observation log", 0, 0.9, 0, { css: "#59c97b", w: 0.36 });

    const handoffBasket = group(g, -1.7, 0, 1.15);
    cyl(handoffBasket, 0.16, 0.13, 0.16, 0, 0.08, 0, 0x8a6a4a, { rough: 0.8, seg: 14 });
    holoTag(handoffBasket, "route lead's basket", 0, 0.24, 0, { css: "#59c97b", w: 0.4 });
    reg(hits, handoffBasket, "handoff-basket");

    // ------------------------------------------------------------ security / response
    const gate = group(g, 0.55, 0, -1.85);
    cyl(gate, 0.02, 0.02, 1.5, 0, 0.75, 0, 0x6f7a83, { rough: 0.5, metal: 0.5, seg: 8 });
    const security = standingFigure(g, 1.0, -1.9, { ry: -1.6, cloth: 0x2b3138, vest: 0xf2c14b, atStation: true });
    holoTag(security, "site security", 0, 1.9, 0, { css: "#f2c14b", w: 0.34 });
    const stranger = standingFigure(g, 1.3, -1.4, { ry: -1.3, cloth: 0x4a3c2f, atStation: true });
    void stranger;

    const responseBoard = holoPanel(g, 0.85, 0.5, -0.2, 1.5, -1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(8,22,14,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e6f7ea";
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("AT THE FENCE", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#cdeed6";
      ["Stay together, stay polite", "Give your name if asked",
        "Step back to the public sidewalk"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { accent: YPT_ACCENT });
    reg(hits, responseBoard, "response-board");
    const argueHazard = group(g, 0.2, 0, -1.5);
    ball(argueHazard, 0.03, 0, 0.6, 0, 0xe8622a, { rough: 0.5 });
    holoTag(argueHazard, "argue back?", 0, 0.78, 0, { css: "#e8622a", w: 0.34 });
    reg(hits, argueHazard, "argue-with-security");

    // ------------------------------------------------------------ debrief circle
    const debriefCircle = group(g, 0.6, 0, 1.9);
    const crates = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const crate = box(debriefCircle, 0.3, 0.3, 0.3, Math.cos(a) * 0.7, 0.15, Math.sin(a) * 0.7, 0x8a6a4a, { rough: 0.75 });
      crates.push(crate);
    }
    holoTag(debriefCircle, "debrief circle", 0, 0.5, 0, { css: "#59c97b", w: 0.3 });
    reg(hits, debriefCircle, "debrief-circle");

    // ------------------------------------------------------------ crew and dressing
    const leadFig = standingFigure(g, -0.7, 0.85, { ry: 0.5, cloth: 0x2f6f4a, vest: YPT_ACCENT });
    const recorderFig = standingFigure(g, -0.65, 1.0, { ry: 0.3, cloth: 0x37505f });
    const photoFig = standingFigure(g, -0.6, 1.05, { ry: -0.2, cloth: 0x445566 });
    const wanderFig = standingFigure(g, -0.1, -0.65, { ry: 1.0, cloth: 0x8a6a4a });
    void leadFig; void recorderFig; void photoFig;
    const wanderHome = new THREE.Vector3(-0.1, 0, -0.65);
    const wanderTarget = new THREE.Vector3(FENCE_X, 0, gapCenterZ);

    for (const [x, z] of [[-2.5, -2.2], [2.6, 2.4], [2.5, -2.3]]) {
      cyl(g, 0.03, 0.03, 0.55, x, 0.28, z, 0x22262b, { rough: 0.9, seg: 10 });
      ball(g, 0.16, x, 0.62, z, 0x2f6f45, { rough: 0.7, seg: 10 }).scale.set(0.7, 1.2, 0.7);
    }
    for (let i = -2; i <= 2; i++) {
      cyl(g, 0.03, 0.03, 0.06, 2.0, 0.03, i * 0.9, 0x2c231a, { rough: 0.9, seg: 8 });
    }

    let wandering = false, heatHigh = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -1.5),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "buddy-check") repaint(buddySign, paperFace("BUDDY SIGN-IN", ["1: Lead / Recorder — OK", "2: Photographer / spare — OK"], { bg: "#f2efe0", band: "#2f6f4a" }));
        if (step.id === "water-stage") { cooler.parent.remove(cooler); shadeTent.add(cooler); cooler.position.set(-0.2, 0, 0.2); }
      },

      onInterrupt(it) {
        if (it.id === "member-wanders-to-gap") { wandering = true; wanderFig.position.copy(wanderTarget); }
        if (it.id === "heat-index-trigger") {
          heatHigh = true;
          smokeGauge.userData.screen.material.emissiveIntensity = 2.2;
          repaint(smokeGauge.userData.screen, signFace("HEAT!", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "member-wanders-to-gap") { wandering = false; wanderFig.position.copy(wanderHome); }
        if (it.id === "heat-index-trigger") {
          heatHigh = false;
          smokeGauge.userData.screen.material.emissiveIntensity = 0.85;
          repaint(smokeGauge.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#eaf6fb", scale: 0.6 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void wandering; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "smoke-check") {
          repaint(smokeGauge.userData.screen, signFace(`${Math.round(gg.t * 300)} AQI`, { bg: "#1c1408", accent: gg.t >= 0.15 && gg.t <= 0.4 ? "#59c97b" : "#f0645b", fg: "#eaf6fb", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "patrol-scan") {
          repaint(scanBadge.userData.screen, signFace(tr.v < 0.4 ? "FAST" : tr.v > 0.6 ? "SLOW" : "STEADY", { bg: "#1c1408", accent: tr.v >= 0.4 && tr.v <= 0.6 ? "#59c97b" : "#f0645b", fg: "#eaf6fb", scale: 0.55 }));
        }
      },
    };
  },
};
