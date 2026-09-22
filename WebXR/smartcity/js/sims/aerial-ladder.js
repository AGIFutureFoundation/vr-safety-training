import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, valveWheel, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Aerial Ladder VR — Emergency Services, station three.
// Spotting and setting an aerial apparatus at a working fire: the size-up
// that names the lines and the collapse zone, a spot at the corner outside
// both, chocks, stabilizers on pads until the turntable is level, PTO, then a
// raise-rotate-extend that stays ten feet from the energised lines and lands
// the tip just above the roofline — locked, belted, reported.

const AL_ACCENT = 0xd2312b;

export const SIM_AERIAL_LADDER = {
  id: "aerial-ladder",
  index: "37",
  domain: "Emergency Services",
  trade: "Firefighter — aerial apparatus driver/operator",
  category: "Emergency Services",
  weather: "wind",
  certification: "IAFF — NFPA 1002 Chapter 6 aerial apparatus driver/operator; NFPA 1901 aerial device stabilization and operating limits; NFPA 1500 / OSHA 1910.269 ten-foot clearance from energised overhead lines",
  name: "Aerial Ladder",
  title: simTitle("Aerial Ladder"),
  tagline: "Aerial apparatus set-up: size-up, spot at the corner outside the collapse zone, chock, stabilizers on pads to level, PTO, raise and rotate clear of the lines, tip above the roofline, lock, belt, report",
  accent: AL_ACCENT,
  accentCss: "#d2312b",
  parSeconds: 260,
  footprint: 2.6,
  badge: { id: "tip-on-target", name: "Tip On Target", note: "Spotted outside the collapse zone, level on pads, ten feet from the lines, and the tip landed just above the roofline first time" },

  game: system({
    name: "Truck Company",
    currency: "SPOT",
    ranks: ["Probie", "Truckie", "Driver/Operator", "Aerial Operator", "Truck Company Certified"],
    badges: [
      { id: "corner-spot", name: "Corner Spot", note: "Spotted at the corner, outside the collapse zone, first time", test: AWARD.stepClean("spot") },
      { id: "lines-clear", name: "Lines Clear", note: "Never inside ten feet of the lines, never climbed unbelted", test: AWARD.safe },
      { id: "dead-level", name: "Dead Level", note: "Turntable levelled and the tip placed inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections anywhere in the set-up", test: AWARD.clean },
      { id: "smooth-raise", name: "Smooth Raise", note: "Raise and rotate held steady the whole way", test: AWARD.unbroken },
      { id: "truck-fast", name: "Set In Time", note: "Aerial to the roof inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "spot-collapse-zone": "You spotted the apparatus inside the collapse zone. A wall falls one and a half times its height outward; the truck, the turntable and the crew on it are inside that arc. Spot at the corner, outside the zone, and let the aerial reach in.",
    "lines-contact": "You swung the aerial inside ten feet of the energised lines. An aerial ladder is a grounded steel conductor with a firefighter on it; contact or arc-over at that distance kills the operator at the pedestal and the crew at the tip.",
    "climb-unbelted": "You climbed the aerial without clipping the ladder belt. The tip moves with the building, the wind and the stream; a belt is what keeps a firefighter on a ladder that is sixty feet in the air.",
    "no-pad-soft": "You set a stabilizer down on soft ground with no pad. The ground gives under the point load, the truck tilts, and the aerial's rated load drops to nothing on the low side.",
  },

  lateNotes: {
    "pto-switch": "The PTO comes after the stabilizers are set and the turntable is level — an aerial raised on an unlevel truck is loaded sideways from the first degree.",
    "aerial-control": "Raise only with the PTO engaged and the truck level and chocked; the aerial does not move until the base cannot.",
    "extend-control": "Extend after the raise and rotation have the ladder clear of the lines and aimed at the roof — extension toward the lines is the contact.",
  },

  // Two things that happen to a driver/operator whose hands and eyes are
  // committed to the set-up or the raise. See shared/game.js.
  interrupts: [
    {
      id: "pad-sinking",
      kind: "Ground pad sinking",
      // Armed once the stabilizers are down, before the level check catches
      // it on its own — answered by the pad itself, not the stabilizer
      // controls that are this step's own target.
      after: "stabilizers", delay: 3, seconds: 12,
      alert: "The pad under the load-side stabilizer has started to sink into the softened ground — that foot is losing its bearing before the turntable is even level.",
      cue: "Reseat the ground pad before the corner settles further.",
      target: "ground-pad",
      why: "A pad that is sinking under a stabilizer is a set-up failing quietly, not loudly — the truck does not tip the moment the ground gives, it just loses rated capacity on that corner without saying so. NFPA 1901's stabilization requirements exist for exactly this failure, and it is caught by watching the pad, not by waiting for the aerial to prove the load chart wrong.",
      missNote: "The pad kept sinking while you worked. The load-side stabilizer is now bearing on soil, not on the pad's spread footprint, and the load chart for that side is no longer the number printed on it.",
      wrongNote: "It is the ground pad. A stabilizer losing its bearing outranks whatever else is in front of you until it is reseated.",
    },
    {
      id: "gust-rock",
      kind: "Wind gust",
      // Armed after the PTO engages, so the window overlaps the raise —
      // the driver/operator's hands are on the raise/rotate lever, and the
      // answer is the level indicator, not that lever.
      after: "pto", delay: 4, seconds: 11,
      alert: "A gust just rocked the truck on its stabilizers mid-raise — the bubble on the level indicator has swung off centre.",
      cue: "Recheck the turntable level before you keep raising.",
      target: "level-indicator",
      why: "Wind loads a raised aerial the same way an unlevel turntable does — as side-load the ladder sections were not rated to carry — and a gust can push a level set-up out of tolerance in seconds. NFPA 1901 treats the level check as something to repeat under changing conditions, not a box ticked once at the start of the set-up.",
      missNote: "The gust passed and you kept raising without rechecking. If the turntable was actually pushed out of level, the tip is now landing somewhere other than where the extend step is aimed, and nobody will know until it gets there.",
      wrongNote: "It is the level indicator. Keep raising on a turntable that might be off level and the tip inherits the error.",
    },
  ],

  steps: [
    {
      id: "sizeup", kind: "select", target: "sizeup-board",
      title: "Read the size-up",
      cue: "Check the building height, the overhead lines, the wind and the collapse zone on the size-up board.",
      why: "NFPA 1002 treats the size-up as the first act of aerial operations, not a formality, because every decision after this one is placed against the same four facts: where the lines run, how tall the wall is, which way the smoke and structural load are moving, and where a collapse would land. A truck that stops rolling before this is read is a truck about to spot itself by guesswork.",
    },
    {
      id: "lines", kind: "select", target: "line-clearance",
      title: "Identify the energised lines",
      cue: "Find the overhead service lines and note the ten-foot clearance marker.",
      why: "The energised service lines are the one hazard on this fireground that gives no warning before it kills — OSHA 1910.269 and NFPA 1500 both set the ten-foot clearance because an aerial ladder is a grounded steel conductor with a firefighter riding it. Naming the lines before anything else moves means every later rotation and extension is planned around them instead of discovered against them.",
    },
    {
      id: "spot", kind: "select", target: "spot-corner",
      title: "Spot the apparatus",
      cue: "Choose the spot: at the corner, outside the collapse zone, with the aerial able to reach two sides of the building.",
      why: "The corner spot gives the aerial two sides of the building to work while putting the turntable outside the arc a failing wall covers — NFPA 1901's collapse-zone guidance sizes that arc at one and a half times the wall height for exactly this reason. Closer looks faster from the cab, but closer is the collapse zone, and there is no partial credit for being spotted just inside it.",
    },
    {
      id: "chock", kind: "sequence", anyOrder: true,
      targets: ["chock-front", "chock-rear"],
      itemNames: { "chock-front": "front wheel chock", "chock-rear": "rear wheel chock" },
      title: "Chock the wheels",
      cue: "Chock front and rear on the downhill side before anything leaves the truck.",
      why: "The parking brake holds a parked truck; it does not hold a truck whose own stabilizers are about to lift one side and push the whole chassis sideways as they extend. Chocking front and rear on the downhill side before anything else leaves the compartment is what keeps the truck from creeping while the crew's attention is on the jacks, not the wheels.",
    },
    {
      id: "pad", kind: "drag", target: "ground-pad",
      title: "Pad the soft ground",
      cue: "Carry the ground pad from the compartment and seat it under the stabilizer over the soft ground.",
      why: "A stabilizer puts several tons through a foot the size of a dinner tray, and soft soil, hot asphalt or a storm grate will not announce that it cannot carry that load until the truck is already settling under it. NFPA 1901's stabilization requirements exist because a pad that spreads the load is cheap insurance against a set-up that looks solid right up until the aerial is loaded and one corner sinks.",
      drag: { to: "soft-ground-socket", radius: 0.4, missNote: "Not under the foot — seat the pad square where the stabilizer will land." },
    },
    {
      id: "stabilizers", kind: "sequence", anyOrder: true,
      targets: ["stab-left", "stab-right"],
      itemNames: { "stab-left": "left stabilizer", "stab-right": "right stabilizer" },
      title: "Set the stabilizers",
      cue: "Extend both stabilizers fully and lower them to the ground and pads.",
      why: "Full extension is the rated footprint the load chart is built on — a stabilizer left short-jacked on one side carries only a fraction of that rating and gives no warning until the aerial swings its load out over the weak corner. Extending both stabilizers fully before anything else happens is what makes every number on the load chart still true once the ladder is loaded.",
    },
    {
      id: "level", kind: "gauge", target: "level-indicator",
      title: "Level the turntable",
      cue: "Watch the bubble and commit when the turntable is inside the level band.",
      why: "The entire load chart assumes a level turntable, and every degree off level becomes side-load on the ladder sections that the chart was never rated to carry. NFPA 1901 sets the tolerance the bubble has to sit inside precisely because an aerial that looks level to the eye at the pedestal can still land its tip several feet from where the operator aimed it.",
      gauge: { label: "TURNTABLE LEVEL", speed: 0.7, green: [0.44, 0.56], readout: (t) => `${((t - 0.5) * 12).toFixed(1)}°`, missNote: "Off level — adjust the stabilizers and check the bubble again." },
    },
    {
      id: "pto", kind: "turn", target: "pto-switch",
      title: "Engage the PTO",
      cue: "Turn the aerial master to engage the power take-off and pressurise the hydraulics.",
      why: "The power take-off routes engine power straight to the aerial's hydraulics, and NFPA 1002 holds it disengaged until the truck is fully chocked, stabilized and level, because from the moment it engages, the controls at the pedestal move a loaded ladder, not an inert one. Engaging it early on an unset truck means the first control input happens on a base that was never ready to take it.",
      turn: { turns: 0.25, axis: "z", label: "AERIAL MASTER" },
    },
    {
      id: "raise", kind: "track", target: "aerial-control", seconds: 7,
      title: "Raise and rotate clear of the lines",
      cue: "Raise from the bed and rotate toward the building at a steady rate, keeping the ladder outside the ten-foot line.",
      why: "Smooth is safe on an aerial this long: the ladder acts as a lever, and a jerk at the pedestal becomes a whip at the tip sixty feet up with a firefighter riding it. NFPA 1500's clearance rule is the reason the rotation goes the long way round rather than the short way when the short way would swing the tip inside ten feet of the energised lines.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "RAISE / ROTATE", readout: (v) => (v < 0.4 ? "stalled" : v > 0.6 ? "too fast" : "steady") },
      holdBreakNote: "Rate out of band — the tip is whipping. Bring the control back to steady and hold.",
    },
    {
      id: "extend", kind: "gauge", target: "extend-control",
      title: "Extend the tip to the roofline",
      cue: "Extend until the tip is just above the parapet — inside the band, not short of the roof, not over the crew's heads.",
      why: "The tip lands a couple of feet above the roofline so a firefighter steps off level instead of climbing over a parapet or reaching down onto a roof they cannot see. Extending short leaves the ladder resting its load on the parapet edge it was never designed to bear on, and extending past the band puts the tip somewhere over the fire nobody asked it to be.",
      gauge: { label: "TIP ABOVE ROOF", speed: 0.75, green: [0.5, 0.66], readout: (t) => `${((t - 0.4) * 20).toFixed(0)} ft`, missNote: "Tip short of the roof or too far over — re-extend to the band." },
    },
    {
      id: "climb", kind: "sequence",
      targets: ["ladder-lock", "climb-belt", "tip-report"],
      itemNames: { "ladder-lock": "ladder locks", "climb-belt": "ladder belt", "tip-report": "tip report" },
      title: "Lock, belt, report",
      cue: "Set the ladder locks, clip the ladder belt, then report the tip position to command.",
      why: "The locks stop the fly sections from creeping under a climber's weight, the belt is what keeps a firefighter on the ladder if the tip moves with the wind or the building, and the tip report is what tells command the roof now has a second way off. NFPA 1002 sequences all three before the first rung is climbed, because a ladder secured after someone is already on it was never actually secured.",
      outOfOrderNote: "Locks, then belt, then the report — the ladder is secured before anyone is on it.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["stab-float"],
      itemNames: { "stab-float": "stabilizer foot lifting" },
      itemNotes: { "stab-float": "The right stabilizer foot has lifted clear of its pad — the ground settled and that side is carrying nothing." },
      title: "Walk the set-up under load",
      cue: "Walk the stabilizers with the aerial loaded and click anything that has moved.",
      why: "A set-up is only proven once it is loaded, not while it is sitting at rest — a stabilizer foot that lifts clear of its pad under that load means the truck is now standing on three points instead of four and the load chart it was set to no longer applies. NFPA 1901 treats this as ongoing verification, not a one-time check, precisely because ground that held at rest can still give once the aerial swings its weight over it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, AL_ACCENT);
    box(g, 6.0, 0.1, 5.4, 0, 0.05, 0, 0x3f4247, { rough: 0.95 });

    // Building on the far side (-z): a three-storey wall with a parapet and smoke.
    const bldg = group(g, 0, 0.1, -2.5);
    box(bldg, 5.2, 3.2, 0.5, 0, 1.6, 0, 0x8a6f5a, { rough: 0.9 });
    box(bldg, 5.3, 0.16, 0.6, 0, 3.28, 0, 0x6b5445, { rough: 0.9 });
    for (let f = 0; f < 3; f++) for (let w = -2; w <= 2; w++) box(bldg, 0.45, 0.55, 0.04, w * 0.95, 0.65 + f * 0.95, 0.26, f === 2 && w < 0 ? 0xf2a23b : 0x1c2228, { emissive: f === 2 && w < 0 ? 0xf2a23b : 0x000000, ei: 1.2, rough: 0.5, cast: false });
    holoTag(bldg, "roofline 32 ft", 0, 3.55, 0.3, { css: "#d2312b", w: 0.3 });
    // Collapse zone arc in front of the wall; the corner spot outside it.
    const zone = slab(g, 5.6, 0.008, 2.0, 0, 0.104, -1.2, 0xd2312b, { rough: 0.6, opacity: 0.18, transparent: true, cast: false });
    holoTag(g, "collapse zone — 1.5 × wall height", 0, 0.5, -0.5, { css: "#d2312b", w: 0.5 });
    const spotBad = slab(g, 1.4, 0.01, 0.6, 0.6, 0.11, -0.9, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "spot here? (closer)", 0.6, 0.35, -0.9, { css: "#d2312b", w: 0.32 });
    reg(hits, spotBad, "spot-collapse-zone");
    const spotGood = slab(g, 1.4, 0.01, 0.6, -2.0, 0.11, 0.7, 0x59c97b, { rough: 0.6, opacity: 0.45, transparent: true, cast: false });
    holoTag(g, "corner spot — outside the zone", -2.0, 0.35, 0.7, { css: "#59c97b", w: 0.44 });
    reg(hits, spotGood, "spot-corner");

    // Power lines on the right (+x): two poles, three wires, a clearance marker and the contact hazard.
    const lines = group(g, 2.6, 0.1, 0);
    for (const z of [-2.4, 2.4]) { cyl(lines, 0.05, 0.06, 3.4, 0, 1.7, z, 0x5a4634, { rough: 0.9, seg: 10 }); box(lines, 0.8, 0.05, 0.05, 0, 3.2, z, 0x5a4634, { rough: 0.9 }); }
    for (const x of [-0.32, 0, 0.32]) box(lines, 0.012, 0.012, 4.8, x, 3.15, 0, 0x1b1e22, { rough: 0.5, metal: 0.5, cast: false });
    const clearance = group(lines, -0.9, 0, -0.2);
    holoTag(clearance, "energised — 10 ft clearance", 0, 2.6, 0, { css: "#f2c14b", w: 0.44 });
    const clearBox = box(clearance, 0.3, 0.3, 0.3, 0, 2.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clearBox, "line-clearance");
    const contact = box(lines, 0.9, 1.2, 4.6, 0, 2.5, 0, 0xd2312b, { opacity: 0.08, transparent: true, cast: false });
    reg(hits, contact, "lines-contact");

    // Apparatus: cab, body, turntable, aerial bed; chocks; stabilizers; pads.
    const truck = group(g, -0.6, 0.1, 1.0);
    box(truck, 3.6, 0.9, 1.1, 0, 0.75, 0, 0xb3261e, { rough: 0.45, metal: 0.3 });
    box(truck, 0.9, 0.9, 1.1, 2.1, 0.75, 0, 0xb3261e, { rough: 0.45, metal: 0.3 });
    box(truck, 0.86, 0.45, 1.12, 2.1, 1.05, 0, 0x1a2129, { rough: 0.3, metal: 0.5 });
    for (const wx of [-1.3, 0.2, 1.9]) for (const wz of [-0.55, 0.55]) cyl(truck, 0.26, 0.26, 0.24, wx, 0.26, wz, 0x1a1e23, { rough: 0.9, seg: 14 }).rotation.x = Math.PI / 2;
    const lightbar = box(truck, 0.5, 0.08, 0.9, 2.1, 1.32, 0, 0xff3b3b, { emissive: 0xff3b3b, ei: 1.5, rough: 0.3, cast: false });
    // Turntable and aerial: raise (rotation.x), rotate (rotation.y), extend (fly section slides).
    const turntable = group(truck, -0.9, 1.2, 0);
    cyl(turntable, 0.42, 0.42, 0.12, 0, 0.06, 0, 0x2b2f34, { rough: 0.6, metal: 0.5, seg: 24 });
    const pivot = group(turntable, 0, 0.15, 0);
    const bed = group(pivot, 0, 0, 0);
    const base = box(bed, 0.24, 0.1, 2.6, 0, 0, -1.2, 0xc9d0d6, { rough: 0.4, metal: 0.7 });
    for (let i = 0; i < 9; i++) box(bed, 0.22, 0.02, 0.02, 0, 0.05, -0.2 - i * 0.28, 0xc9d0d6, { rough: 0.4, metal: 0.7, cast: false });
    const fly = group(bed, 0, 0.09, 0);
    box(fly, 0.2, 0.08, 2.4, 0, 0, -1.2, 0xe6ecf1, { rough: 0.4, metal: 0.7 });
    for (let i = 0; i < 8; i++) box(fly, 0.18, 0.02, 0.02, 0, 0.045, -0.3 - i * 0.28, 0xe6ecf1, { rough: 0.4, metal: 0.7, cast: false });
    const tipLamp = ball(fly, 0.05, 0, 0.06, -2.4, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.6, cast: false, seg: 8, seg2: 6 });
    // Ladder locks, belt and radio live at the pedestal / ladder base.
    const pedestal = group(truck, -0.9, 0.9, 0.75);
    box(pedestal, 0.5, 0.5, 0.25, 0, 0.25, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const aerialCtl = cyl(pedestal, 0.03, 0.03, 0.22, -0.12, 0.6, 0.05, 0x1b1e22, { rough: 0.5, seg: 10 });
    holoTag(pedestal, "raise / rotate", -0.12, 0.85, 0.1, { css: "#d2312b", w: 0.24 });
    reg(hits, aerialCtl, "aerial-control");
    const extendCtl = instrument(pedestal, 0.14, 0.52, 0.05, { idle: "-- ft", color: 0xd2312b, w: 0.12, d: 0.18 });
    holoTag(pedestal, "extend", 0.14, 0.75, 0.1, { css: "#d2312b", w: 0.16 });
    reg(hits, extendCtl, "extend-control");
    const pto = valveWheel(pedestal, 0.0, 0.38, 0.14, { color: 0xf2c14b, body: 0x2b2f34, r: 0.05 });
    pto.rotation.x = Math.PI / 2;
    holoTag(pedestal, "aerial master / PTO", 0.0, 0.2, 0.3, { css: "#f2c14b", w: 0.34 });
    reg(hits, pto, "pto-switch");
    const level = instrument(pedestal, 0.45, 0.52, 0.05, { idle: "-.-°", color: 0x59c97b, w: 0.12, d: 0.18 });
    holoTag(pedestal, "turntable level", 0.45, 0.75, 0.1, { css: "#59c97b", w: 0.3 });
    reg(hits, level, "level-indicator");
    const locks = box(pedestal, 0.12, 0.08, 0.06, 0.3, 0.25, 0.14, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    const locksSet = box(pedestal, 0.12, 0.08, 0.06, 0.3, 0.25, 0.14, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.5, metal: 0.4 });
    locksSet.visible = false;
    holoTag(pedestal, "ladder locks", 0.3, 0.05, 0.3, { css: "#f2c14b", w: 0.22 });
    reg(hits, locks, "ladder-lock");
    const belt = group(truck, -0.3, 1.2, 0.62);
    box(belt, 0.28, 0.05, 0.05, 0, 0, 0, 0x1b1e22, { rough: 0.8 });
    box(belt, 0.06, 0.08, 0.04, 0, 0, 0.02, 0xc9d0d6, { rough: 0.4, metal: 0.7 });
    holoTag(belt, "ladder belt", 0, 0.16, 0, { css: "#f2c14b", w: 0.22 });
    reg(hits, belt, "climb-belt");
    const radio = box(truck, 0.06, 0.14, 0.04, -1.3, 1.3, 0.6, 0x1b1e22, { rough: 0.6 });
    holoTag(truck, "radio — tip report", -1.3, 1.5, 0.6, { css: "#f2c14b", w: 0.3 });
    reg(hits, radio, "tip-report");
    const climbHere = box(truck, 0.3, 0.3, 0.3, -1.0, 1.45, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(truck, "climb now?", -1.0, 1.7, 0.3, { css: "#d2312b", w: 0.22 });
    reg(hits, climbHere, "climb-unbelted");
    // Chocks in the compartment, shown at the wheels when set.
    const chocks = {};
    for (const [id, x] of [["chock-front", 1.9], ["chock-rear", -1.3]]) {
      const c = box(truck, 0.18, 0.12, 0.14, x, 0.06, 0.72, 0xf2c14b, { rough: 0.8 });
      c.visible = false; chocks[id] = c;
      const pick = box(truck, 0.18, 0.12, 0.14, x, 0.3, 0.75, 0xf2c14b, { rough: 0.8 });
      holoTag(truck, id === "chock-front" ? "front chock" : "rear chock", x, 0.5, 0.78, { css: "#f2c14b", w: 0.22 });
      reg(hits, pick, id);
      pick.userData.chock = c;
    }
    // Stabilizers: beams that slide out and feet that come down.
    const stabs = {};
    for (const [id, sx] of [["stab-left", -1], ["stab-right", 1]]) {
      const s = group(truck, 0.4, 0.45, sx * 0.55);
      const beam = box(s, 0.16, 0.14, 0.4, 0, 0, sx * 0.2, 0x2b2f34, { rough: 0.6, metal: 0.5 });
      const leg = cyl(s, 0.04, 0.04, 0.4, 0, -0.2, sx * 0.4, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 10 });
      const foot = box(s, 0.24, 0.03, 0.24, 0, -0.42, sx * 0.4, 0x2b2f34, { rough: 0.6, metal: 0.5 });
      leg.visible = false; foot.visible = false;
      holoTag(s, id === "stab-left" ? "left stabilizer" : "right stabilizer", 0, 0.25, sx * 0.3, { css: "#d2312b", w: 0.3 });
      reg(hits, s, id);
      stabs[id] = { beam, leg, foot, sx };
    }
    // Soft ground under the right stabilizer, the pad in the compartment, the socket.
    const soft = slab(g, 0.7, 0.012, 0.7, -0.2, 0.104, 2.0, 0x5a4a30, { rough: 1 });
    holoTag(g, "soft ground", -0.2, 0.3, 2.0, { css: "#f2c14b", w: 0.22 });
    const softSocket = box(g, 0.5, 0.02, 0.5, -0.2, 0.12, 2.0, 0xffffff, { rough: 0.5 });
    softSocket.visible = false; hits["soft-ground-socket"] = softSocket;
    const noPad = box(g, 0.5, 0.2, 0.5, -0.2, 0.25, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noPad, "no-pad-soft");
    const pad = group(g, 1.6, 0.1, 2.0);
    box(pad, 0.5, 0.06, 0.5, 0, 0.03, 0, 0xe4622a, { rough: 0.8 });
    holoTag(pad, "ground pad", 0, 0.2, 0, { css: "#f2c14b", w: 0.22 });
    reg(hits, pad, "ground-pad");
    const floatGap = box(g, 0.26, 0.05, 0.26, -0.2, 0.16, 2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, floatGap, "stab-float");
    // Size-up board, cones, crew.
    const board = group(g, 2.2, 0, 1.8, -0.8);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1a0d0d"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#d2312b"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffd9d6"; ctx.fillText("SIZE-UP — TRUCK 3", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#fff0ee";
      ["Building: 3 storeys, parapet at 32 ft", "Fire: floor 3, A side, wind from the west", "Lines: energised service drop, B side", "Collapse zone: 1.5 × wall height", "Spot: A/B corner, outside the zone", "Ground: soft at B side stabilizer — pad"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { accent: AL_ACCENT });
    reg(hits, board, "sizeup-board");
    for (const [x, z] of [[-2.6, -1.4], [2.4, -1.4]]) cone(g, x, z);
    const operator = standingFigure(g, -2.11, 2.46, { ry: 0.4, cloth: 0x2b2f34 });
    holoTag(operator, "driver / operator", 0, 1.9, 0, { css: "#d2312b", w: 0.3 });

    let raised = 0, rotated = 0, extended = 0, ptoOn = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "spot") { truck.position.set(-2.0, 0.1, 0.7); zone.material.opacity = 0.1; }
        if (step.id === "chock") for (const c of Object.values(chocks)) c.visible = true;
        if (step.id === "pad") { pad.parent.remove(pad); g.add(pad); pad.position.set(-0.2, 0.12, 2.0); pad.rotation.set(0, 0, 0); }
        if (step.id === "stabilizers") for (const s of Object.values(stabs)) { s.beam.position.z = s.sx * 0.5; s.leg.visible = true; s.foot.visible = true; s.leg.position.z = s.sx * 0.7; s.foot.position.z = s.sx * 0.7; }
        if (step.id === "pto") ptoOn = true;
        if (step.id === "climb") { locks.visible = false; locksSet.visible = true; }
        if (step.id === "walk") floatGap.visible = false;
      },
      onHazard() {},
      // The pad really sinks, and the raised aerial really rocks off level —
      // both revert once answered. See shared/game.js.
      onInterrupt(it) {
        if (it.id === "pad-sinking") pad.position.y -= 0.05;
        if (it.id === "gust-rock") pivot.rotation.z += 0.14;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pad-sinking") pad.position.y += 0.05;
        if (it.id === "gust-rock") pivot.rotation.z -= 0.14;
      },
      animate(t, dt, session) {
        const step = session?.step;
        lightbar.material.emissiveIntensity = 1.0 + Math.max(0, Math.sin(t * 6)) * 1.4;
        if (step?.id === "chock") for (const [id, c] of Object.entries(chocks)) if (session.sequence.includes(id)) c.visible = true;
        if (step?.id === "stabilizers") for (const [id, s] of Object.entries(stabs)) if (session.sequence.includes(id)) { s.beam.position.z = s.sx * 0.5; s.leg.visible = true; s.foot.visible = true; s.leg.position.z = s.sx * 0.7; s.foot.position.z = s.sx * 0.7; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "level") repaint(level.userData.screen, signFace(`${((gg.t - 0.5) * 12).toFixed(1)}°`, { bg: "#0d1c14", accent: gg.t >= 0.44 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#e9ffe9", scale: 0.62 }));
        if (session?.turn && step?.id === "pto") pto.rotation.z = -session.turn.amount * Math.PI / 2;
        if (step?.id === "raise" && session.holding && ptoOn) {
          raised = Math.min(1, raised + dt / 7); rotated = raised;
        }
        pivot.rotation.x = raised * 1.05;
        turntable.rotation.y = -rotated * 1.1;
        if (gg && !gg.committed && step?.id === "extend") { extended = Math.max(0, Math.min(1, gg.t)); repaint(extendCtl.userData.screen, signFace(`${((gg.t - 0.4) * 20).toFixed(0)} ft`, { bg: "#1c0d0d", accent: gg.t >= 0.5 && gg.t <= 0.66 ? "#59c97b" : "#f2ae14", fg: "#ffe9e9", scale: 0.62 })); }
        fly.position.z = -extended * 1.6;
        tipLamp.material.emissiveIntensity = 1.0 + Math.max(0, Math.sin(t * 3)) * 1.2;
      },
    };
  },
};
