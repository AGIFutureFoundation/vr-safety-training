import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, decal, repaint, signFace, mat, slab,
} from "../../../shared/kit.js";
import { deliveryVan } from "../../../shared/fleet.js";
import { yardHustler, lightSwitch } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Delivery Van Pre-Trip & Route Loading VR — Mobility & Transit,
// NALC letter carrier route work. A right-hand-drive walk-in delivery van
// (shared/fleet.js's deliveryVan builder) at the start of a shift: the
// previous day's vehicle condition card read, the walk-around worked before
// the engine ever turns over, tread measured against the label rather than
// eyeballed, the lamps walked with the key on, the driver's own mirror set
// from the seat, the load bay read for what is already wrong with it, trays
// carried and loaded in the order the route runs so the last stop is not
// buried under the first, the load strapped against a shift on the first
// turn, the day logged, and a short pull-out along the marked lane with the
// mirror, signal and horn checks a curbside route depends on.
//
// The RHD design is the point of the exercise: the carrier's seat and the
// van's only side door share the same side, so nothing about this station
// ever asks a carrier to open a door into the travel lane. No clause number,
// tread minimum or load weight this platform is not certain of is stated —
// those live on the label, the card and the route's own load plan.

const ML1_PAL = palette("postal");
const ML1_ACCENT = ML1_PAL.accent;

export const SIM_ML_DELIVERY_VAN_PRETRIP_AND_ROUTE_LOADING = {
  id: "ml-delivery-van-pretrip-and-route-loading",
  index: "ml-1",
  domain: "Postal & Mail Processing",
  trade: "City letter carrier — vehicle pre-trip and route loading, NALC",
  category: "Mobility & Transit",
  weather: "overcast",
  certification: "FMCSA 49 CFR 396 inspection, repair and maintenance, whose driver vehicle inspection record covers a right-hand-drive delivery van the same as any other commercial vehicle; 49 CFR 392 driving of commercial motor vehicles, including the walk-around before the engine starts; the Revised NIOSH Lifting Equation for carrying loaded trays without a twisting lift; OSHA 29 CFR 1910.132 personal protective equipment, general requirements; NALC training for city letter carrier route safety",
  name: "Delivery Van Pre-Trip & Route Loading",
  title: simTitle("Delivery Van Pre-Trip & Route Loading"),
  tagline: "A right-hand-drive delivery van before the first stop: yesterday's condition card read, the walk-around worked cold, tread measured, lamps and mirror checked, the load bay read for what's already wrong with it, trays loaded in route order and strapped down, the day logged, and a short pull-out with the mirror, signal and horn checks a curbside route runs on",
  accent: ML1_ACCENT,
  accentCss: `#${ML1_ACCENT.toString(16).padStart(6, "0")}`,
  parSeconds: 300,
  footprint: 2.8,
  badge: { id: "route-ready", name: "Route Ready", note: "A full pre-trip and load, every defect found, the load strapped and logged, and the pull-out driven inside the lane and the band" },

  game: system({
    name: "Route Readiness",
    currency: "READY",
    ranks: ["Casual Carrier", "Route Trainee", "Letter Carrier", "Lead Carrier", "Route Ready Certified"],
    badges: [
      { id: "cold-walkaround", name: "Cold Walkaround", note: "Every vehicle defect found without a hint", test: AWARD.stepClean("vehicle-walkaround") },
      { id: "clear-bay", name: "Clear Bay", note: "Every load-bay hazard found before a single tray was loaded", test: AWARD.stepClean("load-bay-read") },
      { id: "steady-pullout", name: "Steady Pull-Out", note: "The pull-out held its lane and its band the whole way", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "on-time", name: "On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "safe-route", name: "Safe Route", note: "No unsafe action anywhere in the run", test: AWARD.safe },
    ],
  }),

  supportLine: "your NALC branch's member assistance representative, or the station's own employee assistance line",

  hazards: {
    "cracked-mirror-hazard": "That passenger-side mirror has a spider-crack across the glass from a knock against a mailbox post. A cracked mirror gives a distorted, incomplete picture of the lane beside the van — exactly the lane a right-hand-drive van's own blind spot already leans on that mirror to cover.",
    "tail-lamp-hazard": "The nearside tail lamp lens is cracked and dark rather than glowing red. A carrier stopping and rolling at every third driveway is seen by the traffic behind almost entirely through that lamp, and a dark one is a rear-end collision waiting for the first driver who is not watching closely enough.",
    "blocked-curb-hazard": "A stack of empty totes has been left right in front of the van's only side door. On a right-hand-drive van that door is the one and only way out onto the curb — block it and a carrier's fastest way clear of a dog, a slick step or a moving car behind the van is gone.",
    "loose-tray-hazard": "That tray is sitting loose on the shelf edge with nothing holding it in against a hard brake or a sharp turn. A tray that slides is a tray that spills mail across the floor at the worst stop of the day, or worse, comes down on the ankles of a carrier reaching in for the next bundle.",
  },

  lateNotes: {
    "loading-tray": "Trays are loaded once the load bay has been read for what's already wrong with it, not before.",
    "van-rig": "The van pulls out only once the load is strapped and the day's pre-trip is logged — never before.",
  },

  interrupts: [
    {
      id: "tug-crossing",
      kind: "Yard tug crossing the apron",
      after: "tread-gauge", delay: 3, seconds: 11,
      alert: "A mail handler's tug has pulled out from behind a rack and is crossing the apron directly behind the van, beacon turning.",
      cue: "Tap the horn and hold back rather than stepping out from behind the van into its path.",
      target: "van-horn",
      why: "A tug driver watching a string of carts has a narrow view behind them, and the apron behind a parked van is exactly where a carrier steps out without thinking to check first. A tap of the horn is what tells the tug driver someone is there before either of you commits to the same six feet of pavement.",
      missNote: "You stepped out from behind the van anyway. A tug pulling a loaded cart train cannot stop nearly as fast as it looks like it can, and the gap behind a parked van is the blindest six feet on the whole apron.",
      wrongNote: "It is the horn. The tug is already committed to crossing behind the van.",
    },
    {
      id: "tote-spill",
      kind: "Tote stack topples nearby",
      after: "load-trays", delay: 3, seconds: 12,
      alert: "A stack of empty totes at the next bay over has toppled into the loading lane, spilling across the walkway.",
      cue: "Restack the totes clear of the lane before continuing the load.",
      target: "restack-totes",
      why: "A toppled stack in a shared loading lane is the next carrier's rolled ankle or the next tug's flat tire, and it costs nothing to clear now compared to what it costs once someone is already down the length of it before noticing.",
      missNote: "The toppled totes were left in the lane. The next person through it — carrier, tug or handler — meets them at a bad moment, not a convenient one.",
      wrongNote: "Not that — the toppled totes in the lane come first.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "work-gloves"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "work-gloves": "work gloves" },
      title: "Suit up before the walk-around",
      cue: "Hi-vis vest and work gloves before stepping up to the van.",
      why: "A carrier works this apron on foot among tugs, other vans and reversing trucks, and the vest is what makes a driver's glance actually register a person rather than a shape near a bumper. The gloves are on before a hand goes near a tray edge, a strap ratchet or a door latch.",
    },
    {
      id: "condition-card", kind: "select", target: "condition-card-panel",
      title: "Read yesterday's condition card",
      cue: "Read the previous carrier's vehicle condition card: what was written up, and whether it has been signed off as repaired.",
      why: "Per FMCSA 49 CFR 396 the last driver's report is the first thing to read, because it says what somebody else already found wrong with this van. A defect signed off as repaired is one you still check for yourself; one with no sign-off is one you cannot assume was fixed overnight.",
    },
    {
      id: "vehicle-walkaround", kind: "find", noHint: true,
      targets: ["cracked-mirror-hazard", "tail-lamp-hazard"],
      itemNames: { "cracked-mirror-hazard": "the cracked passenger mirror", "tail-lamp-hazard": "the dark tail lamp" },
      itemNotes: {
        "cracked-mirror-hazard": "A spider-crack across the mirror glass. It gets written up and swapped before this van covers a route on it.",
        "tail-lamp-hazard": "A cracked, dark tail lamp lens. Nobody behind this van can see it slow down until that lamp is fixed.",
      },
      decoyNotes: { "good-wiper-decoy": "The wiper blades are seated and unmarked. Nothing to flag there." },
      title: "Walk around the van before the engine starts",
      cue: "Walk the van cold, engine off. Two things are already wrong with it — find them.",
      why: "A van that looks fine parked in a row is not the same as one a carrier has actually walked around — a cracked mirror or a dead lamp both read as fine from ten feet away and only show themselves up close, which is exactly why the walk-around happens before the key ever turns, not after the first stop.",
    },
    {
      id: "tread-gauge", kind: "gauge", target: "tread-gauge-tool",
      title: "Measure the front tire tread",
      cue: "Seat the tread gauge in a groove of the front tire and commit once it reads at or above the label's minimum.",
      why: "A tire that looks fine at a glance can still be down to the wear bars, and a van making forty stops a day on the curb is asking a lot of whatever tread is left. Measuring in the groove rather than guessing from the shoulder is the difference between knowing the tire is fit for the route and hoping it is.",
      gauge: { label: "FRONT TREAD", speed: 0.7, green: [0.3, 0.6], readout: (t) => `${Math.max(1, Math.round(t * 14))}/32 in`, missNote: "Not seated in a groove, or below the label's minimum — measure again." },
    },
    {
      id: "lights-walk", kind: "sequence", anyOrder: true,
      targets: ["headlamp-check", "four-way-check"],
      itemNames: { "headlamp-check": "headlamps, low and high", "four-way-check": "four-way flashers" },
      title: "Walk the lights",
      cue: "Headlamps low and high, then the four-way flashers.",
      why: "A van stopped at forty different curbs a day is a hazard to traffic every single time, and the four-ways are what tell a driver coming up behind it that this van is not simply slow — it is stopped, on purpose, and about to have someone step out of it.",
    },
    {
      id: "mirror-set", kind: "select", target: "mirror-adjust",
      title: "Set the driver's mirror from the seat",
      cue: "From the seat, set the driver's-side mirror so the van's own flank is just in view with the lane behind filling the rest.",
      why: "A right-hand-drive van still has to be reversed and merged like any other, and the driver's mirror is what covers the side the body itself blocks from a straight look back. Set from the seat, not from the ground, it shows the flank as a reference and the lane behind as the reason to look at all.",
    },
    {
      id: "load-bay-read", kind: "find", noHint: true,
      targets: ["blocked-curb-hazard", "loose-tray-hazard"],
      itemNames: { "blocked-curb-hazard": "totes blocking the side door", "loose-tray-hazard": "the unsecured tray on the shelf" },
      itemNotes: {
        "blocked-curb-hazard": "Totes stacked right across the only door. They move before anything else does — that door is the whole reason this van is built the way it is.",
        "loose-tray-hazard": "A tray with nothing holding it against the shelf lip. It gets strapped in before the van moves an inch.",
      },
      decoyNotes: { "secured-rack-decoy": "That rack of trays is already strapped in and seated flush. Nothing to flag there." },
      title: "Read the load bay before loading",
      cue: "Look over the load bay before touching a single tray. Two things are already wrong with it — find them.",
      why: "A load bay that looks routine is not the same as one that has actually been checked — totes in front of the only door or a tray with nothing holding it are both invisible until the moment they are not, and finding them now costs a minute instead of costing a blocked exit or a spilled tray three stops into the route.",
    },
    {
      id: "load-trays", kind: "drag", target: "loading-tray",
      title: "Load the trays in route order",
      cue: "Carry the tray from the cart to the van shelf, lifting with your legs rather than your back.",
      why: "Per the Revised NIOSH Lifting Equation a load lifted close to the body with a straight back is carried by the legs; twisted at the waist toward a shelf, the same tray loads the spine instead. Loading in the order the route runs means the last stop of the day is not the tray buried at the very back of the shelf.",
      drag: { to: "van-shelf-socket", radius: 0.45, missNote: "Not onto the shelf — carry the tray all the way to its place before letting go." },
    },
    {
      id: "secure-load", kind: "turn", target: "cargo-strap-ratchet",
      title: "Strap the load",
      cue: "Turn the cargo strap ratchet until the load is snug against the shelf rail.",
      why: "A tray shelf with nothing holding the load against it turns every hard brake or sharp corner into a small avalanche of mail toward the door. A strap taken up snug now is the difference between a load that rides quietly and one that greets the carrier at the next stop already spilled.",
      turn: { turns: 0.5, axis: "z", label: "CARGO STRAP" },
    },
    {
      id: "daily-log", kind: "select", target: "daily-log-panel",
      title: "Log the pre-trip and the load",
      cue: "Log the walk-around, the defects found and the load before pulling out.",
      why: "The log is what turns one carrier's careful pre-trip into a record the next carrier and the shop both get to read — a defect found but never logged is a defect the shop never schedules, and a load never logged is a route nobody can reconstruct if a tray turns up missing.",
    },
    {
      id: "pull-out-drive", kind: "drive", target: "van-rig",
      title: "Pull out along the marked lane",
      cue: "Signal, check the mirror, tap the horn at the blind corner, and hold the marked lane out to the street at a walking-pace crawl.",
      why: "Per 49 CFR 392 a commercial vehicle's driver checks mirrors and signals before every move, and an apron shared with tugs, carts and other carriers on foot is exactly where that habit earns its keep — a van that simply rolls out on faith is a van betting nobody is in the one place its own body blocks from view.",
      holdBreakNote: "Out of the marked lane, or moving faster than the apron allows — a shared apron is walked away from, not rolled through.",
      drive: {
        path: [[0, 0], [0, -3.2], [0.6, -5.6]],
        speedBand: [2, 6], laneWidth: 1.6, graceSeconds: 1.6, checkWindow: 2.2, sceneRate: 0.15,
        bandLabel: "apron crawl, per the yard's own posted limit",
        checks: [
          { at: 0, kind: "signal-right", note: "Signal before the van ever moves — the apron is shared, and the signal is the only warning anyone else gets." },
          { at: 1, kind: "mirror-right", note: "Driver's mirror at the blind corner: the RHD body blocks the one glance that would otherwise cover it." },
          { at: 2, kind: "horn", note: "A tap of the horn at the blind corner tells anyone on foot the van is coming through before they step into its path." },
        ],
        controls: { horn: "van-horn" },
        laneNote: "The van drifted outside the marked lane. On a shared apron that is the lane a tug or a carrier on foot is using.",
      },
    },
    {
      id: "route-checkin", kind: "select", target: "dispatch-radio",
      title: "Check in with dispatch",
      cue: "Tell dispatch the van is loaded, the pre-trip is clean, and the route is starting.",
      why: "Dispatch is tracking every van on the route sheet against the clock, and a check-in is what confirms this one actually left loaded and roadworthy rather than simply on schedule. It is also the same call where a carrier says honestly if something about the van or the day is not right before it becomes someone else's problem down the route.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.8, ML1_ACCENT);

    // ------------------------------------------------------------ apron
    const apronTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#54595d", base2: "#494e52", seam: "rgba(0,0,0,0.42)" }), { repeat: 6, px: 512 });
    const apron = box(g, 8.6, 0.12, 7.4, 0, 0.06, -0.4, 0xffffff, { rough: 0.94 });
    apron.material = texturedMat(apronTex, { rough: 0.94, metal: 0.03, color: ML1_PAL.ground });
    for (const z of [-3.9, 2.9]) box(g, 8.6, 0.006, 0.1, 0, 0.123, z, 0xe8ecee, { rough: 0.6, cast: false });
    // The curb strip the van's own door opens onto.
    const curb = box(g, 0.5, 0.12, 6.0, -3.0, 0.09, -0.4, 0xb9beba, { rough: 0.85, finish: "concrete" });
    void curb;

    // ------------------------------------------------------------ the van
    const van = deliveryVan(g, -0.6, 0.12, -0.8, {
      ry: -Math.PI / 2,
      livery: { colour: 0xe4e0d4, fleetName: "CITY MAIL", unitNumber: "118", accent: ML1_PAL.trim },
    });
    reg2(van, "van-rig");
    const VP = van.userData.parts;
    reg2(VP.mirrorL, "cracked-mirror-hazard");
    const mirrorCrack = decal(VP.mirrorL, 0.06, 0.05, 0, 0, 0.015, signFace("×", { bg: "transparent", accent: "#0d1013", scale: 0.9 }), { px: 96 });
    void mirrorCrack;
    reg2(VP.tailLights, "tail-lamp-hazard");
    reg2(VP.mirrorR, "mirror-adjust");
    reg2(VP.headlights, "headlamp-check");
    reg2(VP.markerLights, "four-way-check");
    const wiperDecoy = box(van, 0.4, 0.02, 0.03, 0, 1.9, -1.6, 0x1c1e21, { rough: 0.5, metal: 0.2 });
    reg2(wiperDecoy, "good-wiper-decoy");
    reg2(VP.wheels[1], "tread-gauge-tool");
    const treadGaugeReadout = instrument(van, VP.wheels[1].position.x, 1.05, VP.wheels[1].position.z + 0.55, { idle: "--/32", color: ML1_ACCENT, w: 0.12, d: 0.12 });
    reg2(treadGaugeReadout, "tread-gauge-readout");
    const horn = box(van, 0.06, 0.06, 0.02, -0.3, 1.55, 1.6, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    reg2(horn, "van-horn");

    // The van's own curb-side shelf socket for the loaded tray, and the
    // cargo strap ratchet just inside the door.
    const shelfSocket = group(van, -1.05, 0.9, -0.3);
    hits["van-shelf-socket"] = shelfSocket;
    holoTag(van, "load shelf", -1.05, 1.35, -0.3, { css: "#d8232a", w: 0.28 });
    const ratchet = box(van, 0.1, 0.08, 0.14, -1.0, 0.55, 0.5, 0x8a8f95, { rough: 0.4, metal: 0.6 });
    reg2(ratchet, "cargo-strap-ratchet");

    // ------------------------------------------------------------ the load bay: tray cart
    const cart = group(g, 1.6, 0.12, -1.5, -0.4);
    box(cart, 1.0, 0.04, 0.6, 0, 0.5, 0, 0x6f7a83, { rough: 0.5, metal: 0.4, finish: "galvanised" });
    for (const [dx, dz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) cyl(cart, 0.05, 0.05, 0.5, dx, 0.25, dz, 0x2b2f34, { rough: 0.6, metal: 0.3, seg: 8 });
    const stackedTrays = [];
    for (let i = 0; i < 3; i++) {
      const t = box(cart, 0.42, 0.22, 0.32, 0, 0.53 + i * 0.24, 0, 0xc9a86b, { rough: 0.75, finish: "brushed" });
      stackedTrays.push(t);
    }
    holoTag(cart, "tray cart", 0, 1.5, 0, { css: "#2f6fb0", w: 0.26 });
    const loadingTray = box(cart, 0.42, 0.22, 0.32, 0, 1.24, 0, 0xc9a86b, { rough: 0.75, finish: "brushed" });
    reg2(loadingTray, "loading-tray");

    // The strapped-in rack decoy, already secure.
    const securedRack = group(g, 1.6, 0.12, -3.1, -0.4);
    box(securedRack, 0.9, 0.5, 0.55, 0, 0.32, 0, 0x6f7a83, { rough: 0.5, metal: 0.4, finish: "galvanised" });
    box(securedRack, 0.05, 0.5, 0.6, 0, 0.32, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    reg2(securedRack, "secured-rack-decoy");

    // The totes blocking the van's only door — the load-bay hazard.
    const blockedTotes = group(g, -1.6, 0.12, -1.0, 0.3);
    for (let i = 0; i < 2; i++) box(blockedTotes, 0.4, 0.28, 0.3, 0, 0.14 + i * 0.3, 0, 0x3f6f9a, { rough: 0.7, finish: "brushed" });
    reg2(blockedTotes, "blocked-curb-hazard");

    // The unsecured tray on the shelf, visibly hanging over the lip.
    const looseTray = box(van, 0.4, 0.2, 0.3, -0.55, 0.9, -0.55, 0xc9a86b, { rough: 0.75, finish: "brushed" });
    looseTray.rotation.z = 0.2;
    reg2(looseTray, "loose-tray-hazard");

    // The toppled tote stack for the second interruption, hidden until fired.
    const toppledTotes = group(g, 2.6, 0.12, -3.0, 0.5);
    for (let i = 0; i < 3; i++) { const t = box(toppledTotes, 0.4, 0.28, 0.3, i * 0.3, 0.14, 0, 0x3f6f9a, { rough: 0.7 }); t.rotation.z = Math.PI / 2; }
    toppledTotes.visible = false;
    reg2(toppledTotes, "restack-totes");
    const uprightTotes = group(g, 2.6, 0.12, -3.0, 0.5);
    for (let i = 0; i < 3; i++) box(uprightTotes, 0.4, 0.28, 0.3, 0, 0.14 + i * 0.3, 0, 0x3f6f9a, { rough: 0.7 });

    // ------------------------------------------------------------ PPE, panels, crew
    const ppeRack = group(g, -3.4, 0, 1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, ML1_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(vestProp, "hi-vis-vest");
    const glovesProp = group(ppeRack, 0.2, 0.6, 0);
    box(glovesProp, 0.1, 0.03, 0.06, 0, 0, 0, 0xd8c14b, { rough: 0.8 });
    holoTag(glovesProp, "work gloves", 0, 0.15, 0, { css: "#2f6fb0", w: 0.28 });
    reg2(glovesProp, "work-gloves");

    const conditionCard = holoPanel(g, 0.6, 0.4, -3.6, 1.5, 1.6, (ctx, w, h) => {
      ctx.fillStyle = "#0c141c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f6fb0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcecfa"; ctx.fillText("CONDITION CARD — UNIT 118", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f0f7fd";
      ["Prior carrier: mirror knocked, not written up", "Mechanic: — no entry —", "Review before this walk-around"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.14)));
    }, { ry: 0.5, accent: ML1_ACCENT });
    reg2(conditionCard, "condition-card-panel");

    const logPanel = holoPanel(g, 0.46, 0.3, 3.4, 1.5, -1.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DAILY LOG", w / 2, h * 0.36);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Walk-around · defects · load", w / 2, h * 0.68);
    }, { ry: -0.5, accent: 0xd8232a });
    reg2(logPanel, "daily-log-panel");
    const logFace = logPanel.userData.face;

    const dispatchRadio = group(g, 3.4, 0, 0.6, -0.4);
    box(dispatchRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(dispatchRadio, "dispatch radio", 0, 1.35, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(dispatchRadio, "dispatch-radio");

    // ------------------------------------------------------------ the crossing tug
    const tug = yardHustler(g, 3.2, 0.12, -3.9, { ry: Math.PI });
    const setBeacon = lightSwitch(tug.userData.parts.beacon, mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.5, rough: 0.4 }));
    const tugDriver = standingFigure(g, 4.6, -1.8, { ry: -0.6, cloth: 0x2b3138, vest: ML1_PAL.trim, helmet: 0xf2f2f2 });
    void tugDriver;
    cone(g, -4.2, -3.6);
    cone(g, 4.2, 2.5);

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -0.8),

      onStepComplete(step) {
        if (step.id === "vehicle-walkaround") {
          mirrorCrack.visible = false;
          VP.tailLights.children.forEach((c) => { if (c.isMesh) c.material = mat(0xc0322b, { emissive: 0xc0322b, ei: 0.6, rough: 0.4 }); });
        }
        if (step.id === "load-bay-read") { blockedTotes.visible = false; looseTray.rotation.z = 0; }
        if (step.id === "load-trays") { loadingTray.visible = false; }
        if (step.id === "secure-load") { ratchet.rotation.z = -0.8; }
        if (step.id === "daily-log") {
          repaint(logFace, signFace("LOG COMPLETE", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
        }
      },

      onInterrupt(it) {
        if (it.id === "tug-crossing") { tug.position.set(0.6, 0.12, -3.9); setBeacon(true); }
        if (it.id === "tote-spill") { toppledTotes.visible = true; uprightTotes.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "tug-crossing") { tug.position.set(3.2, 0.12, -3.9); setBeacon(false); }
        if (it.id === "tote-spill") { toppledTotes.visible = false; uprightTotes.visible = true; }
      },

      animate(t, dt, session) {
        tugDriver.userData.head.rotation.y = Math.sin(t * 0.5) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "tread-gauge") {
          repaint(treadGaugeReadout.userData.screen, signFace(`${Math.max(1, Math.round(gg.t * 14))}/32`, { bg: "#07121c", accent: gg.t >= 0.3 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#f0f7fd", scale: 0.5 }));
        }
        void dt;
      },
    };
  },
};
