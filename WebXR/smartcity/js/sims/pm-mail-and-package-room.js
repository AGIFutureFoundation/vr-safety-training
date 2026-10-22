import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Mail & Package Room VR — Building Systems & Facilities,
// property management zone sixteen.
//
// The package room behind the front desk of a mixed-use building on the
// Monday after a holiday: a smart locker bank, a refrigerated locker, open
// shelves, a counter with a pickup queue, and more boxes than any of it was
// built for. The heavy ones weighed and moved on a cart, a leaking one held
// over a tray and read before anyone touches it, the dangerous ones picked
// out, the overflow kept out of the exit corridor, packages released only to
// the people they belong to, and a resident's accommodation request taken
// seriously. Generic building — only the codes, standards and unions are
// named.

const PMMP_ACCENT = 0xd8b04f;
const PMMP_CSS = "#d8b04f";
const PMMP_WARN = "#f0645b";

export const SIM_PM_MAIL_AND_PACKAGE_ROOM = {
  id: "pm-mail-and-package-room",
  index: "232",
  domain: "Building Systems & Facilities",
  trade: "Front desk and package room staff — SEIU building staff and UNITE HERE residential hospitality staff, with the apartment association's CAM-credentialed manager",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "OSHA 29 CFR 1910.36 exit routes and 29 CFR 1910.22 walking-working surfaces with parcels on the floor; NFPA 101 for the corridor the overflow must never fill; 29 CFR 1910.1200 hazard communication for a leaking parcel and 29 CFR 1910.1030 for a crushed sharps mailer; NIOSH lifting guidance for the heavy box; the Fair Housing Act for a resident's accommodation request; SEIU building-staff and UNITE HERE front-desk training, and the apartment association's CAM credential",
  name: "Mail & Package Room",
  title: simTitle("Mail & Package Room"),
  tagline: "The Monday after a holiday: heavy boxes weighed and carted, a leaking parcel held and read, lithium and sharps picked out, the overflow kept out of the exit corridor, and packages released only to their owners",
  accent: PMMP_ACCENT,
  accentCss: PMMP_CSS,
  parSeconds: 290,
  footprint: 2.4,
  badge: { id: "clear-corridor", name: "Clear Corridor", note: "Every box weighed, sorted and shelved, the corridor kept clear, and nothing handed to the wrong person" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Package Room",
    currency: "PARCELS",
    ranks: ["Desk Clerk", "Package Lead", "Front Desk Lead", "Resident Services Manager", "Package Room Certified"],
    badges: [
      { id: "weighed-first", name: "Weighed First", note: "The heavy box weighed before anyone lifted it", test: AWARD.stepClean("weigh-heavy-box") },
      { id: "clear-way", name: "Clear Way", note: "No unsafe act anywhere in the room", test: AWARD.safe },
      { id: "right-hands", name: "Right Hands", note: "Held the pickup line without releasing a package wrongly", test: AWARD.stepClean("work-pickup-line") },
    ],
    challenges: [
      { id: "clean-monday", name: "Clean Monday", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-line", name: "Steady Line", note: "Held the pickup line without breaking the band", test: AWARD.unbroken },
      { id: "shelved-fast", name: "Shelved Fast", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "exit-corridor-stack": "You started stacking the overflow along the exit corridor wall. That corridor is the route residents on this floor take to the stair in a fire, and a wall of boxes narrows it, hides the exit sign and becomes the thing people fall over in smoke — overflow goes in the cage, never the corridor.",
    "cutter-toward-hand": "You drew the box cutter towards the hand holding the box. A blade that slips on packing tape follows the direction you pull, and the direction you pulled was your own palm — cut away from your body, with the blade retracted between cuts.",
    "top-shelf-heavy": "You went to put the sixty-pound box on the top shelf above your head. Lifted overhead, a load that heavy puts the spine at its worst angle, and it comes down on whoever reaches for it next — heavy goes low, between knee and shoulder height.",
    "leaking-bare-hands": "You picked up the leaking parcel bare-handed. Until the label is read nobody knows what is soaking through that cardboard — a cleaning concentrate, a pool chemical, something worse — and gloves go on before the box is touched.",
  },

  lateNotes: {
    "heavy-box": "Not yet — the heavy box goes to the shelf only after it's weighed and on the cart.",
    "fridge-locker-temp": "The refrigerated locker is read once the locker bank's jam is cleared, not before.",
  },

  steps: [
    {
      id: "read-manifest", kind: "select", target: "package-log-screen",
      title: "Read the morning's package manifest",
      cue: "Check how many parcels came in, which are oversize, cold-chain or flagged, before touching any.",
      why: "The manifest tells you what the room is about to hold before it holds it: how many parcels, how many will not fit a locker, which ones are refrigerated and must go cold now, which carriers flagged damage. Reading it first is how the overflow gets a plan instead of ending up wherever there is floor.",
    },
    {
      id: "walk-room", kind: "find", noHint: true,
      targets: ["curled-entry-mat", "sprung-locker-door"],
      itemNames: { "curled-entry-mat": "entrance mat curled at the corner", "sprung-locker-door": "locker door sprung open with a parcel inside" },
      itemNotes: {
        "curled-entry-mat": "The corner of the entrance mat has curled up into the walkway. Residents carrying boxes cannot see their feet, and a curled mat is a trip at the busiest door in the building.",
        "sprung-locker-door": "Locker 14's door has sprung open with somebody's parcel sitting inside. A locker that does not latch is a theft waiting to happen and a resident's complaint by lunchtime.",
      },
      title: "Walk the room before the rush",
      cue: "Find what will trip a resident or lose one a package.",
      why: "A package room is a walkway with a counter in it, used by residents carrying boxes they cannot see over. The walk before the rush finds the trip hazard at the door and the locker that failed overnight, while there is still time to fix them before the queue arrives.",
    },
    {
      id: "weigh-heavy-box", kind: "gauge", target: "package-scale",
      title: "Weigh the heavy box before anyone lifts it",
      cue: "Slide the box onto the floor scale and commit when the reading settles.",
      why: "NIOSH's lifting guidance starts from the real weight of the load, and nobody can judge that by looking at a box — a small carton of books and a large one of pillows look the other way round. The scale turns a guess into a number, and the number decides whether this is a one-person lift, a team lift or a cart job.",
      gauge: { label: "PARCEL WEIGHT", speed: 0.55, green: [0.5, 0.7], readout: (t) => `${Math.round(t * 90)} lb`, missNote: "The reading hadn't settled or you read the wrong parcel. Let the scale steady and read it again." },
    },
    {
      id: "cart-the-box", kind: "sequence",
      targets: ["cart-positioned", "partner-called", "box-onto-cart"],
      itemNames: { "cart-positioned": "cart brought right to the box", "partner-called": "coworker called for a team lift", "box-onto-cart": "box slid onto the cart together" },
      title: "Set up a team lift onto the cart",
      cue: "Bring the cart to the box, call your coworker, then slide the box onto the cart together.",
      why: "At sixty pounds the box is past what one person should lift from the floor, and the safe version of this job barely involves lifting at all: the cart comes to the box, two people slide it rather than hoist it, and the cart carries it to the shelf. The order matters because a box half-lifted while the cart is still across the room is a box somebody holds too long.",
      outOfOrderNote: "Cart first, then your partner, then the lift — lifting before the cart is in place means someone holds the load while it arrives.",
    },
    {
      id: "shelve-low", kind: "drag", target: "heavy-box",
      title: "Shelve the heavy box low",
      cue: "Wheel the box to the oversize shelf and slide it onto the bottom tier.",
      why: "Heavy parcels live between knee and shoulder height, where they can be slid rather than lifted, and the bottom tier of the oversize shelf is where a sixty-pound box stays put until the resident's cart arrives. Up high, the same box is the next overhead lift and the next thing to fall.",
      drag: { to: "oversize-shelf-slot", radius: 0.5, missNote: "Not on the low tier — a heavy box anywhere else is either blocking the floor or waiting to come down on someone." },
    },
    {
      id: "hold-leaker", kind: "hold", target: "leak-tray", seconds: 5,
      title: "Hold the leaking parcel over the tray and read it",
      cue: "Gloved, hold the leaking parcel over the absorbent tray while you read its label and markings.",
      why: "A leaking parcel's label is the hazard communication for whatever is inside it: a limited-quantity mark, a corrosive diamond, a chemical name you can look up. Held over the absorbent tray while you read, the leak goes into the tray rather than across the counter, and you know what you are dealing with before deciding what happens next.",
      holdBreakNote: "You set it down before you'd read the label. Now it's leaking onto the counter and you still don't know what it is — hold it over the tray until you do.",
    },
    {
      id: "pick-special-handling", kind: "find", noHint: true,
      targets: ["lithium-battery-box", "sharps-mailer"],
      itemNames: { "lithium-battery-box": "crushed box with a lithium battery mark", "sharps-mailer": "crushed sharps return mailer" },
      itemNotes: {
        "lithium-battery-box": "A crushed carton with the lithium battery handling mark on it. A damaged lithium cell can overheat hours later — it goes on the metal shelf away from everything, and the carrier is told.",
        "sharps-mailer": "A sharps disposal mailer, crushed at one end. Whatever is inside could now be through the wall of it — it is handled with gloves and tongs, bagged, and never squeezed.",
      },
      title: "Pick out the parcels that need special handling",
      cue: "Find the parcels in the damaged pile that can burn or cut.",
      why: "Most damaged parcels are just damaged, but two kinds are not: lithium batteries, which can start a fire long after the damage, and medical sharps mailers, which can break skin through crushed cardboard. The bloodborne pathogens standard covers the second, and plain fire sense covers the first — both are picked out, not stacked.",
    },
    {
      id: "work-pickup-line", kind: "track", target: "pickup-queue", seconds: 7,
      title: "Work the afternoon pickup line",
      cue: "Keep the line moving while every release is matched to the unit's authorised list.",
      why: "The pickup line is where speed and accuracy pull against each other: residents want their parcels now, and the building has promised each one that only they, or somebody they authorised, will walk away with it. Held in the band, the line moves without a release ever being made on a name that is not on the unit's list.",
      track: { start: 0.25, green: [0.38, 0.64], rise: 0.44, fall: 0.38, drift: 0.12, label: "PICKUP LINE", readout: (v) => (v < 0.38 ? "line backing up" : v > 0.64 ? "rushing releases" : "moving · checked") },
      holdBreakNote: "The line left the band. Rushing is how the wrong parcel goes out the door; backing up is how residents start reaching over the counter — bring it back.",
    },
    {
      id: "clear-locker-jam", kind: "turn", target: "locker-service-key",
      title: "Clear the sprung locker with the service key",
      cue: "Turn the locker bank's service key to reset locker 14's latch.",
      why: "A smart locker that has sprung open will not accept a new parcel or release the old one through the resident's code, and the parcel inside is sitting unsecured in a public room. The service key resets the latch and lets the system re-issue the resident's code, which is quicker and safer than carrying the parcel around the building by hand.",
      turn: { turns: 0.4, axis: "z", label: "SERVICE KEY" },
    },
    {
      id: "read-cold-locker", kind: "gauge", target: "fridge-locker-temp",
      title: "Read the refrigerated locker's temperature",
      cue: "Watch the cold locker's display and commit when it holds in the cold band.",
      why: "Groceries, meal kits and residents' medicines like insulin arrive in the refrigerated locker, and a locker that has drifted warm spoils them without anyone knowing until a resident opens a bag. Reading it every shift is how the building keeps the promise the cold locker makes.",
      gauge: { label: "COLD LOCKER", speed: 0.55, green: [0.2, 0.42], readout: (t) => `${Math.round(30 + t * 30)}°F`, missNote: "Outside the cold band — warm spoils groceries and medicine, freezing ruins insulin. Read it again and call it in if it holds." },
    },
    {
      id: "clear-overflow", kind: "drag", target: "overflow-stack",
      title: "Move the overflow into the overflow cage",
      cue: "Wheel the overflow stack from the floor by the corridor into the locked overflow cage.",
      why: "Overflow always finds the nearest empty floor, and the nearest empty floor in this room is the corridor to the stair. Moving it into the locked cage keeps the exit route at full width, keeps the parcels secure, and keeps the exit sign visible — three things the corridor loses the moment boxes line its wall.",
      drag: { to: "overflow-cage-slot", radius: 0.55, missNote: "Not in the cage — overflow left anywhere near the corridor is overflow in the exit route." },
    },
    {
      id: "crew-checkin", kind: "select", target: "clerk-checkin",
      title: "Check in with the desk clerk",
      cue: "Hand over the lithium box, the accommodation request and the refused pickup, and ask how the day has gone.",
      why: "The UNITE HERE desk clerk on the evening shift will meet the carrier coming back for the lithium box, the resident asking about her request and possibly the man who was refused a parcel, so they need all three handed over in person. A Monday like this one is hard on the people behind the counter, and asking how they are is part of the handover.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the shift in the building log",
      cue: "Log the counts, the leaker and what it was, the special-handling parcels, the refused release and the accommodation request.",
      why: "The building log is where a refused release is recorded in case the resident asks why, where the accommodation request is timed so the office can answer it promptly, and where a leaking parcel's contents are written down for anyone who handled it. A package room without a log is a room where every dispute is one person's word against another's.",
    },
  ],

  interrupts: [
    {
      id: "reach-accommodation",
      kind: "Resident can't reach her locker",
      after: "hold-leaker", delay: 3, seconds: 13,
      alert: "While you hold the leaking parcel, a resident using a wheelchair arrives — her parcel is in a top-row locker she cannot reach, and she asks whether the building can deliver to her door.",
      cue: "Log her request for the office's accommodation process and bring her parcel to the lower counter. Keep the leaker over the tray.",
      target: "accommodation-log",
      why: "A request to change how a building service works because of a disability is a reasonable accommodation request under the Fair Housing Act, and it does not need special words or a form to count. Logging it for the office starts the process the law expects, and bringing today's parcel to the counter answers her now rather than after the paperwork.",
      missNote: "She waited below a locker she could not reach the whole window. Nobody took her request, and a request that is never logged is a request the building ignored.",
      wrongNote: "That doesn't answer her. Log her request for the office on the accommodation sheet and bring her parcel to the lower counter.",
    },
    {
      id: "wrong-pickup",
      kind: "Pickup by someone not on the list",
      after: "work-pickup-line", delay: 3, seconds: 12,
      alert: "A man at the counter asks for unit 7B's parcel — he knows the name, but he is not on 7B's authorised list.",
      cue: "Check the list on the ID tablet and decline the release politely. Keep the line moving behind him.",
      target: "id-check-tablet",
      why: "Knowing a resident's name is not the same as being authorised to collect their parcels, and package theft from lobbies relies on exactly that confusion. Checking the unit's list on the tablet and declining politely protects the resident, and the building's promise about who can collect their mail stays true.",
      missNote: "He stood at the counter the whole window with nobody checking him against the list. The next clerk under pressure hands it over.",
      wrongNote: "That doesn't check him. The ID tablet holds the unit's authorised list — check it before anything leaves the counter.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -0.3);
    stationPad(g, 2.4, PMMP_ACCENT);

    // ------------------------------------------------------------ floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#b8b0a0", base2: "#aea696", seam: "rgba(60,50,40,0.3)" }), { repeat: 5, px: 384 });
    const floor = box(g, 6.2, 0.02, 4.8, 0, 0.011, -0.3, 0xb8b0a0, { rough: 0.7 });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.03, color: 0xc4bcac });

    // ------------------------------------------------------------ smart locker bank
    const lockers = group(g, -1.3, 0, -2.3);
    box(lockers, 2.4, 2.0, 0.5, 0, 1.0, 0, 0x3a4450, { rough: 0.5, metal: 0.4 });
    for (let c = 0; c < 6; c++) for (let r = 0; r < 4; r++) {
      if (c === 2 && r === 1) continue;
      box(lockers, 0.36, 0.42, 0.02, -1.0 + c * 0.4, 0.3 + r * 0.46, 0.26, 0x5a6878, { rough: 0.4, metal: 0.5 });
    }
    const screen = decal(lockers, 0.3, 0.2, 0.0, 1.35, 0.27, signFace("SCAN\nCODE", { bg: "#0d1c24", accent: PMMP_CSS, fg: "#fff4d6", scale: 0.3 }), { glow: true, ei: 0.8, px: 192 });
    void screen;
    const sprungDoor = group(lockers, -0.38, 0.76, 0.27);
    const sdLeaf = box(sprungDoor, 0.36, 0.42, 0.02, 0.18, 0, 0, 0x5a6878, { rough: 0.4, metal: 0.5 });
    sprungDoor.rotation.y = -1.0;
    box(lockers, 0.24, 0.2, 0.3, -0.2, 0.7, 0.08, 0xb8905a, { rough: 0.9 });
    reg(hits, sprungDoor, "sprung-locker-door");
    void sdLeaf;
    const serviceKey = group(lockers, 1.0, 1.6, 0.27);
    box(serviceKey, 0.08, 0.08, 0.02, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    const keyBit = box(serviceKey, 0.012, 0.05, 0.03, 0, 0, 0.02, 0xf2c14b, { rough: 0.3, metal: 0.8 });
    reg(hits, serviceKey, "locker-service-key");
    holoTag(lockers, "service keyswitch", 1.0, 1.78, 0.27, { css: PMMP_CSS, w: 0.3 });
    // Her parcel in a top-row locker, for the accommodation interruption.
    const herParcel = box(lockers, 0.22, 0.16, 0.2, 0.6, 1.72, 0.18, 0xb8905a, { rough: 0.9 });
    // Refrigerated locker beside it.
    const fridge = group(g, 0.35, 0, -2.3);
    box(fridge, 0.7, 2.0, 0.55, 0, 1.0, 0, 0xdfe7ee, { rough: 0.35, metal: 0.3 });
    box(fridge, 0.6, 1.8, 0.02, 0, 1.0, 0.28, 0xc8e0f0, { rough: 0.1, opacity: 0.6, transparent: true });
    const coldDisp = decal(fridge, 0.2, 0.08, 0, 1.75, 0.3, signFace("-- °F", { bg: "#0d1c24", accent: "#6fb8e8", fg: "#dff2ff", scale: 0.55 }), { glow: true, ei: 0.8, px: 160 });
    reg(hits, coldDisp, "fridge-locker-temp");
    holoTag(fridge, "cold locker", 0, 2.12, 0.28, { css: PMMP_CSS, w: 0.24 });
    for (let i = 0; i < 3; i++) box(fridge, 0.3, 0.2, 0.3, 0, 0.4 + i * 0.5, 0.05, [0x7ab86a, 0xe8e2d0, 0x6fb8e8][i], { rough: 0.8 });

    // ------------------------------------------------------------ open shelves, oversize low tier
    const shelves = group(g, 1.9, 0, -2.2);
    for (const y of [0.15, 0.8, 1.45, 2.0]) box(shelves, 1.4, 0.04, 0.5, 0, y, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(shelves, 0.04, 2.1, 0.5, sx * 0.68, 1.05, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 5; i++) box(shelves, 0.22 + (i % 2) * 0.08, 0.2, 0.3, -0.5 + i * 0.24, 0.92 + (i % 2) * 0.02, 0, 0xb8905a + i * 0x020202, { rough: 0.9 });
    for (let i = 0; i < 4; i++) box(shelves, 0.24, 0.16, 0.26, -0.45 + i * 0.3, 1.55, 0, 0xa9804e, { rough: 0.9 });
    const lowSlot = box(shelves, 0.7, 0.3, 0.45, 0.2, 0.32, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["oversize-shelf-slot"] = lowSlot;
    holoTag(shelves, "oversize · low tier", 0.2, 0.62, 0.26, { css: PMMP_CSS, w: 0.32 });
    const topShelf = box(shelves, 0.6, 0.3, 0.45, 0, 2.18, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(shelves, "heavy one up top?", 0, 2.4, 0.26, { css: PMMP_WARN, w: 0.32 });
    reg(hits, topShelf, "top-shelf-heavy");

    // ------------------------------------------------------------ the heavy box, floor scale, cart
    const scale = group(g, 0.9, 0, -0.9);
    box(scale, 0.7, 0.06, 0.7, 0, 0.03, 0, 0x3a4450, { rough: 0.5, metal: 0.5 });
    cyl(scale, 0.02, 0.02, 1.0, 0.3, 0.5, -0.3, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const scaleRead = instrument(scale, 0.3, 1.02, -0.3, { idle: "-- lb", color: 0x3a4450, w: 0.14, d: 0.2 });
    scaleRead.rotation.x = Math.PI / 2.6;
    reg(hits, scaleRead, "package-scale");
    holoTag(scale, "floor scale", 0.3, 1.28, -0.3, { css: PMMP_CSS, w: 0.22 });
    const heavyBox = group(scale, 0, 0.06, 0.05);
    box(heavyBox, 0.5, 0.42, 0.45, 0, 0.21, 0, 0xa9804e, { rough: 0.9 });
    decal(heavyBox, 0.3, 0.12, 0, 0.3, 0.226, signFace("HEAVY · 60 LB", { bg: "#f4efe0", accent: "#b8402f", fg: "#3a2a1a", scale: 0.45 }), { px: 192 });
    reg(hits, heavyBox, "heavy-box");
    const cart = group(g, 1.6, 0, -0.3);
    box(cart, 0.6, 0.05, 0.9, 0, 0.2, 0, 0x2f6fb0, { rough: 0.5 });
    box(cart, 0.6, 0.9, 0.04, 0, 0.65, -0.45, 0x2f6fb0, { rough: 0.5 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(cart, 0.05, 0.05, 0.04, sx * 0.25, 0.05, sz * 0.38, 0x1b1e22, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, cart, "cart-positioned");
    holoTag(cart, "platform cart", 0, 1.2, -0.45, { css: PMMP_CSS, w: 0.24 });
    const liftMark = box(heavyBox, 0.55, 0.1, 0.5, 0, 0.47, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, liftMark, "box-onto-cart");

    // ------------------------------------------------------------ counter, tray, tablet, cutter
    const counter = group(g, -1.0, 0, 0.6);
    box(counter, 2.2, 1.0, 0.5, 0, 0.5, 0, 0x6a5a4a, { rough: 0.6 });
    box(counter, 2.3, 0.05, 0.6, 0, 1.02, 0, 0xe6dccb, { rough: 0.4 });
    box(counter, 0.8, 0.75, 0.5, 1.5, 0.375, 0, 0x6a5a4a, { rough: 0.6 });
    box(counter, 0.85, 0.04, 0.6, 1.5, 0.76, 0, 0xe6dccb, { rough: 0.4 });
    const tray = group(counter, -0.6, 1.05, 0.0);
    box(tray, 0.5, 0.04, 0.36, 0, 0.02, 0, 0xf2c14b, { rough: 0.6 });
    box(tray, 0.44, 0.01, 0.3, 0, 0.045, 0, 0xf4f4f0, { rough: 0.9 });
    const leaker = group(tray, 0, 0.06, 0);
    box(leaker, 0.3, 0.2, 0.24, 0, 0.1, 0, 0xb8905a, { rough: 0.9 });
    cyl(leaker, 0.08, 0.08, 0.004, 0.05, 0.001, 0.08, 0x6fa39a, { rough: 0.1, opacity: 0.7, transparent: true, seg: 12 });
    reg(hits, tray, "leak-tray");
    holoTag(tray, "leaking parcel · tray", 0, 0.36, 0, { css: PMMP_CSS, w: 0.34 });
    const bareGrab = box(leaker, 0.32, 0.05, 0.26, 0, 0.22, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void bareGrab;
    const bareSpot = group(counter, -0.2, 1.05, 0.18);
    box(bareSpot, 0.14, 0.02, 0.1, 0, 0.01, 0, 0xe8b89a, { rough: 0.8 });
    holoTag(bareSpot, "grab it bare-handed?", 0, 0.14, 0, { css: PMMP_WARN, w: 0.36 });
    reg(hits, bareSpot, "leaking-bare-hands");
    const tablet = group(counter, 0.4, 1.05, 0.05);
    box(tablet, 0.26, 0.02, 0.18, 0, 0.01, 0, 0x1b1e22, { rough: 0.4 });
    const tabletFace = decal(tablet, 0.22, 0.14, 0, 0.025, 0, signFace("7B · AUTH LIST", { bg: "#0d1c24", accent: PMMP_CSS, fg: "#fff4d6", scale: 0.3 }), { glow: true, ei: 0.8, px: 192 });
    tabletFace.rotation.x = -Math.PI / 2;
    reg(hits, tablet, "id-check-tablet");
    holoTag(tablet, "ID tablet", 0, 0.16, 0, { css: PMMP_CSS, w: 0.2 });
    const manifest = decal(counter, 0.36, 0.24, -1.0, 1.35, 0.1, signFace("TODAY 214 PARCELS\n9 oversize · 12 cold", { bg: "#0d1c24", accent: PMMP_CSS, fg: "#fff4d6", scale: 0.2 }), { glow: true, ei: 0.8, px: 256 });
    reg(hits, manifest, "package-log-screen");
    const accomLog = group(counter, 1.5, 0.79, 0.05);
    box(accomLog, 0.24, 0.02, 0.3, 0, 0.01, 0, 0xf4efe0, { rough: 0.8 });
    const accomFace = decal(accomLog, 0.22, 0.28, 0, 0.022, 0, paperFace("REQUESTS", ["Accommodation", "Unit · date · ask", "→ office"], { bg: "#f4efe0", band: "#5a3a7a" }), { px: 160 });
    accomFace.rotation.x = -Math.PI / 2;
    reg(hits, accomLog, "accommodation-log");
    holoTag(accomLog, "accommodation sheet", 0, 0.18, 0, { css: PMMP_CSS, w: 0.34 });
    const cutter = group(counter, 0.8, 1.05, 0.15);
    box(cutter, 0.12, 0.02, 0.03, 0, 0.01, 0, 0xf2c14b, { rough: 0.5 });
    box(cutter, 0.04, 0.005, 0.012, 0.08, 0.012, 0, 0xdfe4e8, { rough: 0.3, metal: 0.9 });
    holoTag(cutter, "cut toward your hand?", 0, 0.12, 0, { css: PMMP_WARN, w: 0.38 });
    reg(hits, cutter, "cutter-toward-hand");
    const queueRope = group(g, -1.0, 0, 1.4);
    for (const sx of [-0.8, 0.0, 0.8]) cyl(queueRope, 0.03, 0.12, 0.95, sx, 0.47, 0, 0xc7cdd2, { rough: 0.3, metal: 0.8, seg: 10 });
    hose(queueRope, [[-0.8, 0.9, 0], [-0.4, 0.8, 0], [0, 0.9, 0], [0.4, 0.8, 0], [0.8, 0.9, 0]], 0.02, 0x7a2f2f, { steps: 16 });
    const queueSign = decal(queueRope, 0.26, 0.12, 0, 1.1, 0, signFace("PICKUP", { bg: "#1b1e22", accent: PMMP_CSS, scale: 0.5 }), { px: 128 });
    reg(hits, queueSign, "pickup-queue");

    // ------------------------------------------------------------ damaged pile, overflow, corridor, cage
    const damaged = group(g, -2.6, 0, -0.9);
    box(damaged, 0.8, 0.05, 0.6, 0, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const sx of [-1, 1]) box(damaged, 0.04, 0.5, 0.6, sx * 0.38, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    const lith = group(damaged, -0.2, 0.53, 0);
    box(lith, 0.24, 0.14, 0.2, 0, 0.07, 0, 0xa9804e, { rough: 0.9 });
    decal(lith, 0.12, 0.08, 0, 0.08, 0.101, signFace("Li", { bg: "#f4f4f0", accent: "#d8232a", fg: "#d8232a", scale: 0.6 }), { px: 96 });
    reg(hits, lith, "lithium-battery-box");
    const sharps = group(damaged, 0.18, 0.53, 0.05);
    box(sharps, 0.22, 0.1, 0.14, 0, 0.05, 0, 0xd8232a, { rough: 0.6 });
    reg(hits, sharps, "sharps-mailer");
    holoTag(damaged, "damaged pile", 0, 0.9, 0, { css: PMMP_CSS, w: 0.24 });
    const overflow = group(g, 2.3, 0, 0.9);
    for (let i = 0; i < 4; i++) box(overflow, 0.4, 0.28, 0.35, (i % 2) * 0.1, 0.14 + i * 0.28, 0, 0xb8905a - i * 0x030303, { rough: 0.9 });
    reg(hits, overflow, "overflow-stack");
    holoTag(overflow, "overflow on the floor", 0, 1.3, 0, { css: PMMP_CSS, w: 0.32 });
    const corridor = group(g, 2.9, 0, 0.0);
    box(corridor, 0.06, 2.6, 2.2, 0.35, 1.3, 0, 0xd7d0c4, { rough: 0.8 });
    decal(corridor, 0.34, 0.14, 0.31, 2.3, -0.8, signFace("EXIT →", { bg: "#0d1c14", accent: "#59c97b", scale: 0.5 }), { glow: true, ei: 0.7, px: 128 }).rotation.y = -Math.PI / 2;
    const corridorStack = box(corridor, 0.4, 0.3, 0.6, 0.0, 0.16, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(corridor, "stack overflow here?", 0.0, 0.5, -0.6, { css: PMMP_WARN, w: 0.34 });
    reg(hits, corridorStack, "exit-corridor-stack");
    const cage = group(g, -2.6, 0, 0.9);
    for (const sx of [-1, 1]) box(cage, 0.03, 2.0, 1.0, sx * 0.5, 1.0, 0, 0x8b929a, { rough: 0.4, metal: 0.6, opacity: 0.5, transparent: true });
    box(cage, 1.0, 2.0, 0.03, 0, 1.0, -0.5, 0x8b929a, { rough: 0.4, metal: 0.6, opacity: 0.5, transparent: true });
    const cageSlot = box(cage, 0.8, 0.1, 0.8, 0, 0.1, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["overflow-cage-slot"] = cageSlot;
    holoTag(cage, "overflow cage · locked", 0, 2.15, 0, { css: PMMP_CSS, w: 0.34 });
    const cagedStack = group(cage, 0, 0, 0);
    for (let i = 0; i < 3; i++) box(cagedStack, 0.4, 0.28, 0.35, 0, 0.14 + i * 0.28, 0, 0xb8905a, { rough: 0.9 });
    cagedStack.visible = false;
    // Entrance mat with the curled corner.
    const mat1 = box(g, 1.2, 0.015, 0.8, 0.2, 0.02, 1.8, 0x2b2b30, { rough: 0.95 });
    void mat1;
    const curl = group(g, 0.75, 0.03, 2.1);
    box(curl, 0.2, 0.012, 0.16, 0, 0.04, 0, 0x2b2b30, { rough: 0.95 }).rotation.z = 0.7;
    reg(hits, curl, "curled-entry-mat");

    // ------------------------------------------------------------ log
    const logBoard = holoPanel(g, 0.56, 0.38, -2.2, 1.9, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,18,6,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMMP_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbf4de";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · PACKAGE ROOM", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#ece0bc";
      ["counts · leaker contents", "lithium · sharps held", "refused release · 7B", "accommodation request"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.6, accent: PMMP_ACCENT });
    reg(hits, logBoard, "building-log");

    // ------------------------------------------------------------ crew
    const partner = standingFigure(g, 0.55, 0.05, { ry: 2.6, cloth: 0x3f5b6e, trousers: 0x2b3138 });
    reg(hits, partner, "partner-called");
    const clerk = standingFigure(g, -1.9, -0.05, { ry: 3.0, cloth: 0x5a3a2a, trousers: 0x1b1e22 });
    reg(hits, clerk, "clerk-checkin");
    const wheelchairResident = group(g, 0.2, 0, 1.05, Math.PI);
    const wcRider = seatedFigure(wheelchairResident, 0, 0.1, 0, { cloth: 0x6a8ab8 });
    void wcRider;
    for (const sx of [-1, 1]) torus(wheelchairResident, 0.28, 0.02, sx * 0.3, 0.3, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 6, seg2: 18 }).rotation.y = Math.PI / 2;
    wheelchairResident.visible = false;
    const stranger = standingPerson(g, -1.0, 1.1, { ry: Math.PI, cloth: 0x4a4a4a, hiVis: false });
    stranger.root.visible = false;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.0, -1.2),

      onStepComplete(step) {
        if (step.id === "walk-room") curl.visible = false;
        if (step.id === "weigh-heavy-box") repaint(scaleRead.userData.screen, signFace("62 lb", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "cart-the-box") heavyBox.position.set(0.7, 0.2, 0.65);
        if (step.id === "shelve-low") heavyBox.visible = false;
        if (step.id === "hold-leaker") leaker.visible = false;
        if (step.id === "pick-special-handling") { lith.position.set(-0.2, -0.45, 0); sharps.visible = false; }
        if (step.id === "clear-locker-jam") { sprungDoor.rotation.y = 0; keyBit.rotation.z = 1.2; }
        if (step.id === "read-cold-locker") repaint(coldDisp, signFace("36°F ✓", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "clear-overflow") { overflow.visible = false; cagedStack.visible = true; }
      },

      onInterrupt(it) {
        if (it.id === "reach-accommodation") wheelchairResident.visible = true;
        if (it.id === "wrong-pickup") stranger.root.visible = true;
      },
      onInterruptEnd(it) {
        if (it.id === "reach-accommodation") {
          if (it.resolved === "answered") herParcel.position.set(1.8, 0.86, 2.9);
          else wheelchairResident.visible = false;
        }
        if (it.id === "wrong-pickup") {
          if (it.resolved === "answered") stranger.root.position.set(-2.0, 0, 2.2);
          else stranger.root.visible = false;
        }
      },

      animate(t, dt, session) {
        clerk.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "weigh-heavy-box") repaint(scaleRead.userData.screen, signFace(`${Math.round(gg.t * 90)} lb`, { bg: "#0d1c24", accent: gg.t >= 0.5 && gg.t <= 0.7 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
          if (session.step?.id === "read-cold-locker") repaint(coldDisp, signFace(`${Math.round(30 + gg.t * 30)}°F`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.42 ? "#59c97b" : "#f0645b", fg: "#dff2ff", scale: 0.55 }));
        }
      },
    };
  },
};
