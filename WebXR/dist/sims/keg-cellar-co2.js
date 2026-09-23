import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, torus, hose, group, decal, repaint, signFace, particles, mat, seatedFigure, counter,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, instrument, toolChest, standingFigure, valveWheel, cylinderTank, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Keg Cellar CO2 VR — Bartending course, station one: Barback.
// A keg change worked from the cellar side of the bar: the CO2 and nitrogen
// bottles chained upright before anything else, the cellar monitor read
// before entry, the empty pulled and the full one wrestled onto the manifold
// with the coupler off-then-on, a leak checked at the gauge, the line
// purged, and the door left open behind you on the way out. Everything here
// answers to the same fact — carbon dioxide is heavier than air and pools
// first exactly where a keg gets changed, on the floor, in a room with one
// door — which is why NIOSH and Cal/OSHA treat a cellar monitor alarm as
// real and treat leaving as the only correct response to it.

const KC_ACCENT = 0xd99a4e;

export const SIM_KEG_CELLAR_CO2 = {
  id: "keg-cellar-co2",
  index: "137",
  domain: "Culinary & Hospitality",
  trade: "Barback — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "UNITE HERE Local 2 barbacks; NIOSH guidance on carbon dioxide hazards in beverage cellars; OSHA's Hazard Communication standard (29 CFR 1910.1200), carried locally by Cal/OSHA's own §5194 and §3203 Injury and Illness Prevention Program; the ANSI-accredited California Food Handler card every barback on this line also holds; NSF-listed keg couplers and gas-line assemblies; the Compressed Gas Association's cylinder-handling practice",
  name: "Keg Cellar CO2",
  title: simTitle("Keg Cellar CO2"),
  tagline: "A keg change in the cellar: cylinders chained, the monitor read before entry, coupler off then on, a leak checked at the gauge, the line purged, and the door left open",
  accent: KC_ACCENT,
  accentCss: "#d99a4e",
  parSeconds: 265,
  footprint: 2.6,
  badge: { id: "cellar-clean-change", name: "Cellar Clean Change", note: "A keg change with the monitor read, both bottles verified, no leak and the door left open — first time" },

  game: system({
    name: "Cellar Operations",
    currency: "PSI",
    ranks: ["New Barback", "Cellar Hand", "Lead Barback", "Cellar Steward", "Cellar Operations Certified"],
    badges: [
      { id: "monitor-first", name: "Monitor First", note: "Read the cellar monitor clean before touching a valve", test: AWARD.stepClean("monitor") },
      { id: "never-alone", name: "Never Alone With A Leak", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "quarter-turn", name: "Quarter Turn", note: "Both couplers and the leak check inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-change", name: "Clean Change", note: "No corrections anywhere in the change", test: AWARD.clean },
      { id: "steady-brace", name: "Steady Brace", note: "Held the lift brace the full count without a break", test: AWARD.unbroken },
      { id: "changed-fast", name: "Changed In Time", note: "Keg on line inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unchained-cylinder": "That spare CO2 cylinder is standing free against the wall, not chained to a bracket. A cellar is a small, low-ceilinged room, and a cylinder that topples can shear its own valve on the way down — a snapped valve on a full bottle empties an asphyxiant gas into the room in seconds, which is exactly the failure NIOSH's cellar guidance is written against.",
    "solo-lift": "You reached to lift the second full keg without the hand truck. A full keg runs over 160 lb in an awkward round shape with nothing to grip, and UNITE HERE Local 2's own safety language calls for the hand truck or a two-person lift for precisely that reason — not because it can't be done once, but because a back injury from one bad lift ends a season, not a shift.",
    "blocked-exit": "The hand truck is parked square across the cellar door. This room has one way out and a gas hazard that pools at floor level with no smell to warn you; nothing gets left leaning on, loaded against or blocking that door while anyone is working inside it.",
    "hot-coupler-pull": "You popped the quick-release straight off the manifold instead of bleeding the line down first. A coupler released under full line pressure throws beer and gas hard enough to catch you in the face at exactly the height you're crouched to; the pressure comes off slowly, at the regulator, before anything unlocks.",
  },

  lateNotes: {
    "full-coupler": "The coupler goes on the full keg only after it is seated in the socket — there is nothing to lock onto before that.",
    "leak-gauge": "The leak check comes after the coupler is on and snug, not before — there is no joint made yet to test.",
    "purge-valve": "The line gets purged after the leak check reads clean, not before — purging past a leak just blows the leak through faster.",
    "cellar-door": "The door gets propped on the way out, once the change is finished and logged.",
  },

  steps: [
    {
      id: "monitor", kind: "gauge", target: "cellar-monitor",
      title: "Read the cellar CO2 monitor before going in",
      cue: "Check the wall monitor and commit while it reads inside the clean-air band.",
      why: "CO2 is heavier than air and has no smell at a dangerous concentration, so the monitor is the only thing in this room that actually knows what you'd be breathing at floor level. NIOSH and Cal/OSHA both treat that reading, taken before the door is even opened for work, as the first control in the whole procedure — not a formality after it.",
      gauge: { label: "CELLAR CO₂", speed: 0.72, green: [0.05, 0.24], readout: (t) => `${(t * 2).toFixed(2)} %`, missNote: "Above the clean-air band — do not start the change. Ventilate the cellar and read it again before touching a cylinder." },
    },
    {
      id: "chains", kind: "sequence", anyOrder: true,
      targets: ["co2-chain", "n2-chain"],
      itemNames: { "co2-chain": "CO2 cylinder chain", "n2-chain": "nitrogen cylinder chain" },
      title: "Confirm both gas cylinders are chained upright",
      cue: "Check the restraint chain on the CO2 bottle and the nitrogen bottle before you touch either regulator.",
      why: "A compressed-gas cylinder that isn't chained is one bump from becoming a projectile with the neck sheared off, and the Compressed Gas Association's own handling practice — which Cal/OSHA's hazard communication rule backs with the cylinder's own safety data sheet — starts every job with a look at whether the chain is actually doing its job, not just present.",
    },
    {
      id: "regulator", kind: "gauge", target: "regulator-gauge",
      title: "Check the regulator's tank pressure",
      cue: "Read the high-pressure gauge on the CO2 regulator and commit inside the working band.",
      why: "The tank-side gauge tells you how much gas is actually left behind the regulator before you commit to a whole keg change on it; running a cellar dry mid-service is a bar with no working taps, and the five seconds it takes to read this gauge is what keeps that from being a surprise.",
      gauge: { label: "TANK PSI", speed: 0.78, green: [0.42, 0.62], readout: (t) => `${Math.round(t * 900)} PSI`, missNote: "Outside the working band — re-read the gauge before you commit to the change." },
    },
    {
      id: "coupler-off", kind: "turn", target: "empty-coupler",
      title: "Release the coupler from the empty keg",
      cue: "Turn the coupler a quarter turn to unlock it from the spent keg.",
      why: "The coupler is the only thing standing between the gas line and the keg's own residual pressure, so it comes off with a controlled quarter turn against the lock, never levered or forced — a coupler cracked loose under pressure is the same face-height spray as pulling it off a live line.",
      turn: { turns: 0.25, axis: "y", label: "COUPLER" },
    },
    {
      id: "brace", kind: "hold", target: "lift-brace", seconds: 5,
      title: "Brace before the lift",
      cue: "Hold a proper crouch — knees bent, keg close to the body — before anything comes off the floor.",
      why: "A full keg is over 160 lb held at arm's length if you let it get away from your body, and the brace is what keeps the lift in your legs instead of your lower back; this is the same five seconds UNITE HERE Local 2's safety training spends on every keg station, because it is the one habit that keeps barbacks working past forty.",
      holdBreakNote: "You stood up out of the brace before the count finished. Set it again — the lift starts from the crouch, not partway out of it.",
    },
    {
      id: "empty-out", kind: "drag", target: "empty-keg",
      title: "Roll the empty keg to the empty rack",
      cue: "Carry the spent keg clear of the manifold and set it on the empty rack.",
      why: "The spent keg comes off the socket before the full one goes anywhere near it — working two kegs' worth of weight through the same footprint at once is exactly how a barback ends up pinned against the rack by one of them.",
      drag: { to: "empty-rack", radius: 0.42, missNote: "Not on the rack — set the empty down square on the rack, not leaning against it." },
    },
    {
      id: "full-in", kind: "drag", target: "full-keg",
      title: "Bring the full keg onto the manifold socket",
      cue: "Roll the full keg from the storage rack, upright, and seat it on the manifold socket.",
      why: "This is the lift the brace was for: upright, close to the body, using the hand truck's own wheels for the distance rather than walking it on its rim, and set down square so the coupler lines up on the first try instead of the third.",
      drag: { to: "keg-socket", radius: 0.42, missNote: "Not seated on the socket — bring the keg square under the coupler before it goes anywhere near the line." },
    },
    {
      id: "coupler-on", kind: "turn", target: "full-coupler",
      title: "Lock the coupler onto the full keg",
      cue: "Seat the coupler on the new keg's valve and turn it a quarter turn to lock.",
      why: "A coupler that stops short of the lock detent looks connected and isn't — it holds until the first surge of pressure, and then it lets go under whoever is standing over it, which by then is usually the next barback, not you.",
      turn: { turns: 0.25, axis: "y", label: "COUPLER" },
    },
    {
      id: "leak-check", kind: "gauge", target: "leak-gauge",
      title: "Check the line gauge for a leak",
      cue: "Watch the line-pressure gauge hold steady and commit while it reads inside the sealed band.",
      why: "A coupler that isn't fully seated bleeds pressure slowly enough that the keg still pours, right up until the night it doesn't — reading the line gauge here, before the line ever gets purged or poured from, is how a slow leak gets caught as a five-second check instead of a flooded cellar floor.",
      gauge: { label: "LINE PSI", speed: 0.7, green: [0.44, 0.62], readout: (t) => `${Math.round(t * 40)} PSI`, missNote: "Pressure's not holding — that coupler isn't fully seated. Re-seat it and check again before purging anything." },
    },
    {
      id: "purge", kind: "hold", target: "purge-valve", seconds: 5,
      title: "Purge the line",
      cue: "Hold the purge valve open until the line runs clean gas, not the flat beer left in it from the last keg.",
      why: "The line between the coupler and the tap still holds whatever was sitting in it since the last pour, and pushing that straight to a glass is a flat, warm first pint for whoever orders next — purging it here is what makes the first pour off a new keg the same pour as the hundredth.",
      holdBreakNote: "You let go before the line ran clean. A partial purge still has the old beer in it — hold it the full count.",
    },
    {
      id: "door", kind: "select", target: "cellar-door",
      title: "Prop the cellar door open on the way out",
      cue: "Leave the door open behind you once the change is logged.",
      why: "A cellar with the door shut all night has nowhere for any residual CO2 to go; propping it open on the way out is the last control in the chain, and it's the one that protects whoever comes down here next, not you.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cracked-hose", "unlabeled-keg"],
      itemNames: { "cracked-hose": "cracked gas line", "unlabeled-keg": "un-tagged empty keg" },
      itemNotes: {
        "cracked-hose": "A hairline crack in a gas hose is a slow leak today and a burst line under a full tank tomorrow — it gets a ticket now, not on the next person's shift.",
        "unlabeled-keg": "An empty keg with no 'MT' tag on it looks the same as a full one from across the cellar, which is exactly how someone ends up trying to tap an empty.",
      },
      title: "Walk the cellar before you log off",
      cue: "Check the lines, the racks and the door before you head back up; click what needs a ticket.",
      why: "The cellar is left the way the next barback needs it to be: nothing cracked, nothing untagged, and the door open behind you — the same discipline the monitor and the chains started the shift with.",
    },
  ],

  interrupts: [
    {
      id: "manager-hurry",
      kind: "Front-of-house pressure",
      after: "brace", delay: 3, seconds: 11,
      alert: "The manager leans down the cellar stairs: \"Bar's slammed — how much longer on that keg?\" — while you're still in the brace.",
      cue: "Wave him off on the house phone. The lift finishes the way it started.",
      target: "call-up-phone",
      why: "A rushed lift out of a half-finished brace is exactly how a strained back happens, and it costs the bar a lot more than the extra thirty seconds does — the right answer to being hurried mid-lift is telling the person hurrying you to wait, not skipping the part of the lift that protects you.",
      missNote: "You stood the keg up early to answer him and finished the lift out of a bad crouch. The bar being busy upstairs was never actually the barback's decision to make about how this lift gets done.",
      wrongNote: "It's the house phone by the stairs. Call up that you'll be a minute — don't cut the brace short to answer him in person.",
    },
    {
      id: "cellar-alarm",
      kind: "Gas alarm",
      after: "purge", delay: 4, seconds: 12,
      alert: "The cellar CO2 monitor behind you has gone into alarm. The reading is climbing, not settling.",
      cue: "Leave now. The monitor isn't a switch you reset from in here.",
      target: "cellar-door",
      why: "CO2 pools first at floor level, exactly where the manifold and your own crouch both are, so an alarm mid-change means the air you're breathing right now is already suspect — NIOSH's guidance treats every cellar alarm as real and leaving as the only correct first response, worked out from outside the room, not argued with from inside it.",
      missNote: "You kept working the line while the monitor alarmed behind you. Carbon dioxide at a dangerous concentration gives you no smell and very little warning before it affects judgement — the people it hurts are the ones who decided to finish the step first.",
      wrongNote: "It's the door, not the monitor. Resetting or silencing the sensor from the same spot that raised the alarm does nothing about the gas that's still in the room — the answer is leaving.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, KC_ACCENT);

    // -------------------------------------------------------------- cellar floor
    // A poured-concrete utility floor distinct from the bar's own boards, laid
    // as its own textured slab rather than a flat colour.
    box(g, 6.2, 0.08, 5.4, 0, 0.04, 0.6, 0x53504a, { rough: 0.92, finish: "concrete", tile: [8, 7] });
    const drain = cyl(g, 0.14, 0.14, 0.01, -0.4, 0.085, 2.2, 0x2b2925, { rough: 0.7, seg: 16 });
    void drain;

    // ---------------------------------------------------------- the bar upstairs
    // Glimpsed through the doorway: the bar top, the seating, three customers —
    // the reason this cellar exists, even though nobody down here can see them.
    const barTop = counter(g, 3.2, 0.62, 0, -3.15, 0x33261c, { height: 1.02, undershelf: false });
    void barTop;
    const stoolTones = [0x6b7f8c, 0x8c6b56, 0x556b5a];
    const customerCloth = [0x4a5f6e, 0x6e4a3a, 0x3a5a4a];
    for (let i = 0; i < 3; i++) {
      const sx = -0.9 + i * 0.9;
      const stool = group(g, sx, 0, -2.6);
      cyl(stool, 0.03, 0.03, 0.72, 0, 0.36, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 10 });
      cyl(stool, 0.16, 0.16, 0.05, 0, 0.74, 0, stoolTones[i], { rough: 0.6, seg: 16 });
      seatedFigure(g, sx, 0.74, -2.6, { skin: 0xc99878, cloth: customerCloth[i], ry: Math.PI + (i - 1) * 0.15 });
    }
    // Stair treads suggesting the few steps down into the cellar proper.
    for (let i = 0; i < 3; i++) {
      box(g, 2.0, 0.08, 0.32, 0, 0.02, -2.15 + i * 0.32, 0x2f2a24, { rough: 0.85, cast: false });
    }

    // ---------------------------------------------------------------- partition
    // The cellar door itself: closed through the change, propped on the way
    // out. Two wall stubs either side of the frame, a lintel over the top.
    box(g, 1.55, 2.35, 0.14, -1.4, 1.18, -1.85, 0xbfc2c4, { rough: 0.88, finish: "painted", tile: 2 });
    box(g, 1.45, 2.35, 0.14, 1.42, 1.18, -1.85, 0xbfc2c4, { rough: 0.88, finish: "painted", tile: 2 });
    box(g, 4.2, 0.3, 0.14, 0, 2.5, -1.85, 0xbfc2c4, { rough: 0.88, finish: "painted", tile: 2 });
    const doorPivot = group(g, 0.68, 0, -1.85);
    const door = box(doorPivot, 1.34, 2.1, 0.06, -0.67, 1.05, 0, 0x3d372e, { rough: 0.6, finish: "painted", tile: 2 });
    decal(door, 0.5, 0.16, -0.67, 0.55, 0.034, signFace("CELLAR", { bg: "#241a0e", accent: "#d99a4e", scale: 0.5 }));
    holoTag(doorPivot, "Cellar door", 0, 2.35, 0, { css: "#d99a4e", w: 0.3 });
    reg(hits, door, "cellar-door");
    const doorStop = box(g, 0.16, 0.06, 0.1, 1.55, 0.03, -1.55, 0x2b2925, { rough: 0.7, cast: false });
    doorStop.visible = false;

    const phone = group(g, 1.9, 0, -1.65, -0.3);
    box(phone, 0.1, 0.16, 0.06, 0, 1.15, 0, 0x2b3138, { rough: 0.5 });
    cyl(phone, 0.02, 0.02, 0.14, 0.02, 1.28, 0.02, 0x1b1e22, { rough: 0.6, seg: 10 });
    holoTag(phone, "House phone", 0, 1.34, 0, { css: "#d99a4e", w: 0.3 });
    reg(hits, phone, "call-up-phone");

    // The manager, out of sight beyond the door until the interrupt calls him in.
    const manager = standingFigure(g, 0.3, -2.05, { ry: 3.0, cloth: 0x33404a, vest: 0xd99a4e, atStation: true });
    manager.visible = false;

    // --------------------------------------------------------- gas cylinder rack
    const rackWall = group(g, -2.55, 0, -0.1);
    const co2 = cylinderTank(rackWall, 0, -0.35, 0x8b8f92, { plateLabel: "CO2", plateLines: ["INSPECT BEFORE USE", "SIPHON — UPRIGHT ONLY"] });
    holoTag(rackWall, "CO2 — chained", 0, 1.3, -0.35, { css: "#d99a4e", w: 0.34 });
    const co2Chain = hose(rackWall, [[0.09, 1.1, -0.35], [0.32, 1.05, -0.3], [0.32, 1.02, -0.42], [0.09, 0.98, -0.44]], 0.012, 0x9aa3ab, { steps: 12, rough: 0.4, metal: 0.8 });
    reg(hits, co2Chain, "co2-chain");
    const n2 = cylinderTank(rackWall, 0, 0.35, 0xe4d27a, { plateLabel: "N2", plateLines: ["INSPECT BEFORE USE", "BLEND GAS SUPPLY"] });
    holoTag(rackWall, "Nitrogen — chained", 0, 1.3, 0.35, { css: "#d99a4e", w: 0.36 });
    const n2Chain = hose(rackWall, [[0.09, 1.1, 0.35], [0.32, 1.05, 0.3], [0.32, 1.02, 0.42], [0.09, 0.98, 0.44]], 0.012, 0x9aa3ab, { steps: 12, rough: 0.4, metal: 0.8 });
    reg(hits, n2Chain, "n2-chain");
    box(rackWall, 0.08, 0.06, 1.0, 0.34, 1.0, 0, 0x6b6f75, { rough: 0.6, metal: 0.5, cast: false });

    // Spare cylinder, deliberately loose against the wall — the hazard.
    const spare = cylinderTank(g, -2.85, 1.35, 0x8b8f92, { gauge: false, plate: false });
    holoTag(g, "Unsecured — chain this?", -2.85, 1.35 + 1.25, 1.35, { css: "#f0645b", w: 0.42 });
    reg(hits, spare, "unchained-cylinder");

    // ------------------------------------------------------------- the manifold
    const manifold = group(g, -1.65, 0, 0.15, 0.5);
    box(manifold, 0.5, 0.9, 0.16, 0, 0.9, 0, 0x4a5561, { rough: 0.6, metal: 0.4 });
    const regGauge = instrument(manifold, 0.32, 1.15, 0.02, { idle: "-- PSI", color: 0xd99a4e, ry: -0.5, w: 0.14, d: 0.16 });
    holoTag(manifold, "Tank pressure", 0.32, 1.32, 0.02, { css: "#d99a4e", w: 0.32 });
    reg(hits, regGauge, "regulator-gauge");
    const lineGauge = instrument(manifold, 0.32, 0.9, 0.02, { idle: "-- PSI", color: 0xd99a4e, ry: -0.5, w: 0.12, d: 0.14 });
    holoTag(manifold, "Line pressure", 0.32, 1.05, 0.02, { css: "#d99a4e", w: 0.3 });
    reg(hits, lineGauge, "leak-gauge");
    const purgeValve = valveWheel(manifold, -0.05, 0.7, 0.14, { r: 0.09, color: 0xf0645b, body: 0x2f3138 });
    holoTag(manifold, "Purge", -0.05, 0.92, 0.14, { css: "#d99a4e", w: 0.2 });
    reg(hits, purgeValve, "purge-valve");
    const quickRelease = group(manifold, -0.28, 0.72, 0.05);
    box(quickRelease, 0.05, 0.14, 0.03, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    holoTag(manifold, "Quick release?", -0.28, 0.86, 0.05, { css: "#f0645b", w: 0.3 });
    reg(hits, quickRelease, "hot-coupler-pull");
    hose(g, [[-1.5, 1.15, 0.15], [-0.6, 1.25, 0.5], [0.32, 1.05, 0.85]], 0.018, 0xdfe4e8, { steps: 16, rough: 0.5, metal: 0.5 });

    // ------------------------------------------------------------- the kegs
    const kegSocket = box(g, 0.5, 0.02, 0.5, 0.4, 0.02, 0.85, 0xffffff, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    hits["keg-socket"] = kegSocket;
    const kegAt = (parent, x, z, color) => {
      const k = group(parent, x, 0, z);
      cyl(k, 0.28, 0.28, 0.62, 0, 0.31, 0, color, { rough: 0.4, metal: 0.65, finish: "brushed", seg: 20 });
      cyl(k, 0.13, 0.13, 0.06, 0, 0.65, 0, 0x8b8f92, { rough: 0.4, metal: 0.7, seg: 16 });
      return k;
    };
    const emptyKeg = kegAt(g, 0.4, 0.85, 0xc7ccd0);
    holoTag(emptyKeg, "Spent — 20 lb residual", 0, 0.95, 0, { css: "#f2c14b", w: 0.42 });
    reg(hits, emptyKeg, "empty-keg");
    const emptyRack = box(g, 0.7, 0.02, 0.7, 1.75, 0.02, 1.4, 0xffffff, { rough: 0.5, opacity: 0.001, transparent: true, cast: false });
    hits["empty-rack"] = emptyRack;
    box(g, 0.85, 0.05, 0.85, 1.75, 0.02, 1.4, 0x2b2f34, { rough: 0.6, metal: 0.4, cast: false });

    const fullRack = group(g, 1.8, 0, -0.55);
    box(fullRack, 1.3, 0.06, 0.7, 0, 0.03, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const fullKeg = kegAt(fullRack, -0.35, 0, 0x2f6f4a);
    holoTag(fullKeg, "FULL — 165 lb", 0, 0.95, 0, { css: "#59c97b", w: 0.32 });
    reg(hits, fullKeg, "full-keg");
    const decoyKeg = kegAt(fullRack, 0.35, 0, 0x2f6f4a);
    holoTag(decoyKeg, "Lift alone?", 0, 0.95, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, decoyKeg, "solo-lift");

    // Hand truck — the correct way to move a full keg, and the hazard when
    // it's left blocking the only door instead.
    const handTruck = group(g, 1.3, 0, -1.4, -0.4);
    box(handTruck, 0.36, 0.55, 0.05, 0, 0.35, -0.15, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(handTruck, 0.32, 0.05, 0.28, 0, 0.06, 0.02, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const dx of [-0.14, 0.14]) cyl(handTruck, 0.07, 0.07, 0.04, dx, 0.07, -0.15, 0x1a1e22, { rough: 0.8, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(handTruck, "Hand truck", 0, 0.65, -0.15, { css: "#d99a4e", w: 0.28 });
    const blocker = group(g, 0.68, 0, -1.55, -0.3);
    box(blocker, 0.36, 0.55, 0.24, 0, 0.35, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(blocker, "Blocking the door?", 0, 0.68, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, blocker, "blocked-exit");

    // Coupler heads: one mounted while the empty is in service, a second that
    // takes its place once the full keg is seated — separate meshes, because
    // the interactive id lives on the object and this is two different steps.
    const emptyCoupler = group(g, 0.4, 0.66, 0.85, 0.5);
    box(emptyCoupler, 0.14, 0.06, 0.14, 0, 0, 0, 0x8b8f92, { rough: 0.4, metal: 0.7 });
    cyl(emptyCoupler, 0.05, 0.05, 0.08, 0, 0.06, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
    holoTag(emptyCoupler, "Coupler", 0, 0.16, 0, { css: "#d99a4e", w: 0.24 });
    reg(hits, emptyCoupler, "empty-coupler");
    const fullCoupler = group(g, 0.4, 0.66, 0.85, 0.5);
    box(fullCoupler, 0.14, 0.06, 0.14, 0, 0, 0, 0x8b8f92, { rough: 0.4, metal: 0.7 });
    cyl(fullCoupler, 0.05, 0.05, 0.08, 0, 0.06, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 12 });
    holoTag(fullCoupler, "Coupler — lock", 0, 0.16, 0, { css: "#d99a4e", w: 0.28 });
    fullCoupler.visible = false;
    reg(hits, fullCoupler, "full-coupler");

    // ------------------------------------------------------- brace and monitor
    const braceMark = group(g, -0.2, 0, 1.55);
    torus(braceMark, 0.32, 0.02, 0, 0.01, 0, KC_ACCENT, { emissive: KC_ACCENT, ei: 1.4, cast: false, seg: 6, seg2: 24 });
    holoTag(braceMark, "Brace here", 0, 0.3, 0, { css: "#d99a4e", w: 0.3 });
    reg(hits, braceMark, "lift-brace");

    const monitor = instrument(g, -2.7, 1.6, 1.6, { idle: "-.- %", color: 0xd99a4e, ry: 0.5, w: 0.14, d: 0.22 });
    holoTag(g, "Cellar CO₂ monitor", -2.7, 1.95, 1.6, { css: "#d99a4e", w: 0.4 });
    reg(hits, monitor, "cellar-monitor");

    // ------------------------------------------------------------- walk items
    const crack = group(g, -1.1, 0, 1.9);
    torus(crack, 0.015, 0.006, 0, 0.9, 0, 0x0d0f11, { seg: 6, seg2: 10, cast: false });
    box(crack, 0.16, 0.004, 0.01, 0, 0.9, 0, 0x0d0f11, { cast: false });
    holoTag(crack, "Cracked line", 0, 1.05, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, crack, "cracked-hose");
    const untagged = kegAt(g, 2.3, 1.5, 0xc7ccd0);
    holoTag(untagged, "No MT tag", 0, 0.95, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, untagged, "unlabeled-keg");

    // Tool chest for the barback's own kit — grade, wrench, tags.
    toolChest(g, 2.6, 0.4, { ry: -0.6, color: 0x2b3138 });

    const cloud = particles(g, 40, 0xe8f2f0, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });

    let alarming = false;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.6, 1.0, 0.2),

      onStepComplete(step) {
        if (step.id === "coupler-off") emptyCoupler.rotation.y = -Math.PI / 2;
        if (step.id === "empty-out") { emptyKeg.position.set(1.75, 0, 1.4); }
        if (step.id === "full-in") { fullKeg.parent.remove(fullKeg); g.add(fullKeg); fullKeg.position.set(0.4, 0, 0.85); fullCoupler.visible = true; }
        if (step.id === "coupler-on") fullCoupler.rotation.y = -Math.PI / 2;
        if (step.id === "door") { doorPivot.rotation.y = 1.15; doorStop.visible = true; }
      },

      onInterrupt(it) {
        if (it.id === "manager-hurry") manager.visible = true;
        if (it.id === "cellar-alarm") {
          alarming = true;
          monitor.userData.screen.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.9, rough: 0.5 });
          repaint(monitor.userData.screen, signFace("ALARM", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.55 }));
          cloud.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "manager-hurry") manager.visible = false;
        if (it.id === "cellar-alarm") {
          alarming = false;
          cloud.visible = false;
          if (it.resolved === "answered") {
            monitor.userData.screen.material = mat(0xd99a4e, { emissive: 0xd99a4e, ei: 0.85, rough: 0.55 });
            repaint(monitor.userData.screen, signFace("0.10 %", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
          }
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "monitor") {
          repaint(monitor.userData.screen, signFace(`${(gg.t * 2).toFixed(2)}%`, { bg: "#0d1c14", accent: gg.t >= 0.05 && gg.t <= 0.24 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.55 }));
        }
        if (gg && !gg.committed && session.step?.id === "regulator") {
          repaint(regGauge.userData.screen, signFace(`${Math.round(gg.t * 900)}`, { bg: "#0d1c14", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.6 }));
        }
        if (gg && !gg.committed && session.step?.id === "leak-check") {
          repaint(lineGauge.userData.screen, signFace(`${Math.round(gg.t * 40)}`, { bg: "#0d1c14", accent: gg.t >= 0.44 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.6 }));
        }
        if (session?.turn && session.step?.id === "coupler-off") emptyCoupler.rotation.y = -session.turn.amount * Math.PI * 2;
        if (session?.turn && session.step?.id === "coupler-on") fullCoupler.rotation.y = -session.turn.amount * Math.PI * 2;
        if (session?.step?.id === "purge" && session.holding) {
          cloud.visible = true;
          cloud.userData.step(dt, new THREE.Vector3(-0.05, 0.75, 0.14), 0.06, 0.2, 0.05);
        } else if (alarming) {
          cloud.visible = true;
          cloud.userData.step(dt, new THREE.Vector3(-1.65, 0.1, 0.5), 0.5, 0.06, 0.02);
        } else if (cloud.visible) cloud.visible = false;
      },
    };
  },
};
