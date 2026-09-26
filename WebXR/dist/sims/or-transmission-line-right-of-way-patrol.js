import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, particles, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
} from "../citykit.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Transmission Line Right-of-Way Patrol VR — Energy & Power,
// on the open-range district. A ground patrol of a transmission line across
// open rangeland: the corridor walked and driven segment by segment, the
// structures read from the ground rather than climbed, the vegetation
// actually measured against the line rather than eyeballed, and a downed
// conductor treated as energized from the first look at it, whatever it
// looks like lying in the grass — because the patroller's own read of a wire
// on the ground is never the thing that proves it dead.

const ORT_ACCENT = 0xf2b134;

export const SIM_OR_TRANSMISSION_LINE_RIGHT_OF_WAY_PATROL = {
  id: "or-transmission-line-right-of-way-patrol",
  index: "260",
  domain: "Energy",
  trade: "Outside lineworker — IBEW transmission patrol",
  category: "Energy & Power",
  district: "open-range",
  weather: "wind",
  certification: "IBEW outside line and transmission crews; OSHA 29 CFR 1910.269 electric power generation, transmission and distribution; the National Electrical Safety Code (NESC); OSHA 29 CFR 1910.147 control of hazardous energy; ANSI Z359 fall protection for any structure climb",
  name: "Transmission Line ROW Patrol",
  title: simTitle("Transmission Line ROW Patrol"),
  tagline: "A ground patrol across open range: structures read from the ground, vegetation measured against the conductor, and a downed line treated as energized the instant it's found, cordoned and called in rather than approached",
  accent: ORT_ACCENT,
  accentCss: "#f2b134",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "corridor-cleared", name: "Corridor Cleared", note: "A full segment patrolled, every finding logged, and a downed conductor cordoned and called in without anyone going near it" },

  supportLine: "the IBEW local's member assistance programme and the utility's own employee assistance line",

  game: system({
    name: "Patrol Command",
    currency: "SPAN",
    ranks: ["Ground Hand", "Patrol Lineman", "Segment Lead", "Corridor Supervisor", "Patrol Certified"],
    badges: [
      { id: "never-approached", name: "Never Approached", note: "The downed conductor treated as live from the first look, every time", test: AWARD.safe },
      { id: "steady-scan", name: "Steady Scan", note: "Patrol speed held in band the whole scan", test: AWARD.unbroken },
      { id: "cordon-clean", name: "Cordon Clean", note: "The boundary set on the first try", test: AWARD.stepClean("boundary-drag") },
    ],
    challenges: [
      { id: "clean-corridor", name: "Clean Corridor", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "segment-fast", name: "Segment Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "patrol-streak", name: "Patrol Streak", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "touch-downed-conductor": "You reached toward the conductor lying in the grass. A downed line reads exactly the same whether it is dead or still carrying full transmission voltage — no visible arcing, no sound, nothing that tells you from a look. Every patrol procedure treats it as energized from the first moment it is found, which is the only assumption that is never wrong.",
    "climb-structure-unauthorized": "You started up the structure to get a closer look. A ground patrol is a ground patrol — climbing a transmission tower is a qualified line crew's work, done with fall protection rated for that structure and a job briefing written for that climb, not a decision made on the spot because the defect is easier to see from higher up.",
    "clear-branch-off-energized-line": "You took hold of the branch draped across the conductor to pull it clear. Wood that has been resting on an energized line and the ground both, even wet or rotten wood, can carry enough current back through a hand to kill — the fact that it looks like an ordinary fallen limb is exactly why the line crew clears it with hot-line tools, not a patroller's bare hands.",
    "approach-grass-fire": "You moved in on the fire to stamp it out. A fire started by an arc from a conductor that may still be energized is a fire with an energized ground fault feeding it, and closing the distance to fight it barehanded puts you exactly where the fault current and the flame front can both reach you. The correct response is the same radio call that reports the line, upgraded to report the fire, and a wait at a safe distance for the crews who are equipped for both.",
  },

  steps: [
    {
      id: "patrol-assignment", kind: "select", target: "assignment-board",
      title: "Take the segment assignment",
      cue: "Check the patrol board for today's segment, the structure numbers and the corridor map.",
      why: "A patrol without a defined segment is a patrol that cannot prove it covered the line — the structure numbers on the board are what turns a drive down the access road into a documented inspection of a specific, known length of corridor that someone can check off against the schedule.",
    },
    {
      id: "weather-conditions", kind: "select", target: "conditions-board",
      title: "Check the wind and fire-weather conditions",
      cue: "Read today's wind and fire-weather outlook before starting the segment, per the forecast.",
      why: "Wind decides how a conductor sags and swings and how fast anything that ignites near it will run through dry range grass, and both of those change the segment's risk hour to hour. The patrol reads the current forecast before starting rather than working off yesterday's memory of what the range looked like.",
    },
    {
      id: "ppe-sequence", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat", "patrol-radio"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat", "patrol-radio": "patrol radio" },
      title: "Gear up before leaving the truck",
      cue: "Vest on, hard hat on, radio checked — before the first structure.",
      why: "The vest and hard hat are what make a lone patroller visible to the truck and to anyone else working the corridor from a distance across open range, and the radio check is what confirms there is actually a way to call in a finding before the patrol depends on one.",
    },
    {
      id: "vehicle-walkaround", kind: "find", noHint: true,
      targets: ["low-tire", "cracked-mirror"],
      itemNames: { "low-tire": "low tire", "cracked-mirror": "cracked mirror" },
      itemNotes: {
        "low-tire": "Soft on the ranch two-track before the patrol even starts is a tire that fails on it, miles from the gate, with no cell signal to call for a tow.",
        "cracked-mirror": "A cracked mirror is the one piece of glass a driver actually needs on a narrow dirt road shared with ranch traffic and grazing stock.",
      },
      decoyNotes: { "clean-headlight": "The headlight is fine — the find is for what is actually damaged, not for looking the truck over end to end." },
      title: "Walk around the patrol truck",
      cue: "Check the truck over before the segment — two defects are here.",
      why: "The truck is the patrol's only way back to the gate on a corridor that can run for miles between crossings, and a defect caught in the yard is a defect fixed on pavement instead of on a two-track with no signal and nobody else coming down it today.",
    },
    {
      id: "clearance-brief", kind: "select", target: "clearance-card",
      title: "Confirm the minimum approach distance",
      cue: "Check the minimum approach distance table for this line's voltage class before the first structure.",
      why: "OSHA 29 CFR 1910.269 sets the approach boundary as a table lookup by voltage class, not a distance judged by eye against a structure that looks the same from fifty feet as it does from five — the number is confirmed before it is ever needed, not worked out in the moment a wire turns up on the ground.",
    },
    {
      id: "structure-inspect", kind: "sequence",
      targets: ["insulator-check", "guy-wire-check", "structure-ground-check"],
      itemNames: { "insulator-check": "insulator string", "guy-wire-check": "guy wire", "structure-ground-check": "structure ground" },
      itemNotes: {
        "insulator-check": "Read top to bottom for a cracked shell or flashover tracking before anything else on the structure.",
        "guy-wire-check": "Then the guy wire and its anchor, which is what actually keeps the structure standing under load.",
      },
      title: "Read the structure top to bottom",
      cue: "Insulator string, then guy wire, then structure ground — in that order, from the ground.",
      why: "Reading the structure in the same order every time, top to bottom, is what keeps a patroller from missing the guy wire because the insulator string looked fine, or missing the ground because the guy wire did — a structure fails at whichever one of these was skipped, not at the one that was checked twice.",
      outOfOrderNote: "Insulator string first, then the guy wire, then the structure ground — reading them out of order is how one gets skipped for good.",
    },
    {
      id: "vegetation-find", kind: "find", noHint: true,
      targets: ["encroaching-tree", "dead-limb-over-line"],
      itemNames: { "encroaching-tree": "encroaching tree", "dead-limb-over-line": "dead limb over the line" },
      itemNotes: {
        "encroaching-tree": "Grown up inside the corridor's own clearance since the last patrol — flagged for the vegetation crew, not cut here.",
        "dead-limb-over-line": "Dead wood already resting on the conductor is the vegetation hazard closest to actually happening, not the one still growing toward it.",
      },
      decoyNotes: { "healthy-brush": "Low brush well clear of the wire is exactly what a cleared corridor is supposed to look like — leave it." },
      title: "Find what has grown into the corridor",
      cue: "Walk the corridor under the span and click what has grown into the clearance — two of them are here.",
      why: "A right-of-way patrol exists mainly to catch vegetation before it becomes the fault, not after: a tree or limb that has grown into the clearance since the last pass is exactly what turns a windy afternoon into a conductor-to-ground fault and, on dry range grass, into the fire this segment is patrolled to prevent.",
    },
    {
      id: "anchor-gauge", kind: "gauge", target: "anchor-tension-meter",
      title: "Check the guy anchor tension",
      cue: "Read the guy anchor's tension gauge and commit the reading against the plan.",
      why: "A guy anchor that has worked loose in the soil holds the wire's tension for a while before it does not, and the tension reading is how a loose anchor is caught on this patrol instead of on the one after the structure has already leaned.",
      gauge: { label: "GUY TENSION", speed: 0.68, green: [0.42, 0.64], readout: (t) => `${Math.round(t * 100)}% of plan`, missNote: "Outside the band the structure's plan calls for — flag this anchor for the line crew rather than sign it off." },
    },
    {
      id: "patrol-track", kind: "track", target: "patrol-throttle", seconds: 7,
      title: "Hold the patrol speed while scanning",
      cue: "Hold the patrol throttle steady in the band while you scan the span ahead.",
      why: "Too fast down the two-track and a downed conductor lying flat in the grass is exactly the thing a patrol drives past; too slow and the segment does not get covered in the daylight the assignment allows. A steady scanning speed is what actually gives a patroller time to see the wire before the truck is on top of it.",
      track: { start: 0.15, green: [0.4, 0.62], rise: 0.55, fall: 0.5, drift: 0.14, label: "PATROL SPEED", readout: (v) => (v < 0.4 ? "too fast to scan" : v > 0.62 ? "falling behind schedule" : "scanning the span") },
      holdBreakNote: "Speed out of band — too fast and the span goes by unscanned, too slow and the segment will not finish before dark. Bring it back and hold.",
    },
    {
      id: "boundary-drag", kind: "drag", target: "cordon-flag",
      title: "Cordon the downed conductor",
      cue: "Carry the cordon flags out and set them at the marked radius around the wire — nobody crosses that line.",
      why: "The cordon exists to keep everyone who arrives after you — the rancher, the fire crew, your own relief — the same distance back you are keeping yourself, because the line reads exactly as dead-looking to them as it does to you and the flags are the only thing that says otherwise before dispatch confirms it.",
      drag: { to: "cordon-ring", radius: 0.5, missNote: "Short of the marked radius — a cordon set inside the approach boundary protects nobody from the thing it is marking." },
    },
    {
      id: "gps-mark", kind: "select", target: "gps-unit",
      title: "Mark the fault location",
      cue: "Take a GPS fix on the downed conductor before you call it in.",
      why: "A dispatcher sending a crew down miles of unmarked two-track needs a coordinate, not a description of a fence line and a windmill — the fix is what turns 'somewhere past structure fourteen' into a location a truck can actually be routed to.",
    },
    {
      id: "radio-report", kind: "select", target: "report-radio",
      title: "Call in the downed conductor",
      cue: "Report the structure number, the coordinate and the conductor as energized until proven otherwise.",
      why: "The report is written the same way every time — location, structure number, and the line treated as energized — because the crew that answers it plans their whole approach around that one assumption, and a report that hedges on it is a report that costs them the time they need to plan around it correctly.",
    },
    {
      id: "closing-log", kind: "sequence", anyOrder: true,
      targets: ["log-vegetation", "log-structure", "log-conductor"],
      itemNames: { "log-vegetation": "vegetation finding logged", "log-structure": "structure finding logged", "log-conductor": "downed conductor logged" },
      title: "Log the segment",
      cue: "Write the vegetation finding, the structure finding and the downed conductor into the patrol log.",
      why: "The log is the only record that this segment was actually walked today, by whom, and what was found on it — without it, the vegetation crew, the line crew and tomorrow's patrol are all working from nothing but what happens to get repeated out loud at the yard.",
    },
    {
      id: "crew-checkin", kind: "select", target: "checkin-board",
      title: "Check in after the find",
      cue: "Call in how you're doing after finding a live line and a fire alone on the corridor, not just the paperwork.",
      why: "Finding an energized hazard and a fire starting from it, alone on a corridor with nobody else in sight, sits with a patroller differently than an ordinary segment does, and the union's member assistance line exists for exactly that kind of day as much as it does for an injury.",
    },
  ],

  interrupts: [
    {
      id: "downed-conductor-found",
      kind: "Downed conductor across the road",
      after: "patrol-track", delay: 3, seconds: 13,
      alert: "Ahead, past the next rise, a conductor is down across the access road — dropped clean off the structure and lying in the grass.",
      cue: "Stop well back. Treat it as energized and get on the radio.",
      target: "report-radio",
      why: "A conductor lying flat in dry grass gives no sign of whether it is live — no arcing, no hum, nothing a patroller can see from the truck — so the only safe response is the one written for every downed line regardless of how it looks: stop outside the approach boundary and report it as energized, which is exactly the assumption that keeps a patroller alive if it turns out to be true.",
      missNote: "The truck rolled closer to get a better look before the call went out. A conductor that looks dead from thirty feet looks exactly the same from ten, and the extra distance closed is distance with no possible reason ever to have been worth it.",
      wrongNote: "It is the radio, not the wire — stop where you are and report it as energized before anything else happens.",
    },
    {
      id: "spot-fire-ignites",
      kind: "Fire starts at the fault",
      after: "boundary-drag", delay: 3, seconds: 12,
      alert: "The dry grass under the downed conductor just caught — a thin line of flame is spreading out from the fault point.",
      cue: "Do not approach it. Upgrade the call to report a fire at the fault.",
      target: "fire-call-radio",
      why: "An arc at a fault point can ignite dry range grass in seconds, and the fire it starts is burning next to a conductor that may still be carrying fault current into the ground it is standing on — closing in to stamp it out puts a person exactly where an energized ground and an open flame both reach at once, when the entire response the corridor is patrolled for is the radio call that sends crews equipped for both.",
      missNote: "The fire got a head start while nobody upgraded the call. On dry range grass in wind, the difference between reporting it at first flame and reporting it after it has run is measured in acres, not minutes.",
      wrongNote: "It is the radio, not the fire — call it in as a fire at the fault and hold your distance.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, ORT_ACCENT);

    // ---------------------------------------------------------- patrol truck
    const truck = pickup(g, -2.6, 0, 1.6, { ry: 2.4, livery: { colour: 0xe6e8ea, fleetName: "LINE PATROL", unitNumber: "P-14" } });
    holoTag(truck, "Patrol truck 14", 0, 2.4, 0, { css: "#f2b134", w: 0.4 });
    const lowTire = truck.userData.parts.wheels;
    reg(hits, Array.isArray(lowTire) ? lowTire[0] : lowTire, "low-tire");
    reg(hits, truck.userData.parts.mirrorL, "cracked-mirror");
    const decoyLamp = truck.userData.parts.lights;
    reg(hits, Array.isArray(decoyLamp) ? decoyLamp[0] : decoyLamp, "clean-headlight");

    // -------------------------------------------------------------- the gear
    const chest = toolChest(g, -1.0, 2.1, { ry: 2.6, color: ORT_ACCENT });
    const vest = box(chest, 0.34, 0.4, 0.05, -0.14, 0.9, 0.05, CITY.hiVis, { rough: 0.6 });
    holoTag(chest, "Hi-vis vest", -0.14, 1.12, 0.05, { css: "#f2b134", w: 0.3 });
    reg(hits, vest, "hi-vis-vest");
    const hat = cyl(chest, 0.14, 0.16, 0.12, 0.1, 0.86, 0.05, 0xf2c14b, { rough: 0.5, seg: 14 });
    holoTag(chest, "Hard hat", 0.1, 1.0, 0.05, { css: "#f2b134", w: 0.26 });
    reg(hits, hat, "hard-hat");
    const radio = box(chest, 0.09, 0.16, 0.05, -0.02, 0.9, 0.16, 0x2b3138, { rough: 0.5 });
    holoTag(chest, "Patrol radio", -0.02, 1.05, 0.16, { css: "#f2b134", w: 0.28 });
    reg(hits, radio, "patrol-radio");

    // -------------------------------------------------------- the structure
    const structure = group(g, 2.8, 0, -1.0);
    for (const [sx, sz] of [[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.6], [0.7, 0.6]]) {
      const leg = cyl(structure, 0.04, 0.09, 6.4, sx, 3.2, sz, 0x8b98a5, { rough: 0.6, metal: 0.5, seg: 8 });
      leg.rotation.z = -sx * 0.05; leg.rotation.x = sz * 0.05;
    }
    const crossarm = box(structure, 3.2, 0.1, 0.14, 0, 5.9, 0, 0x8b98a5, { rough: 0.6, metal: 0.5 });
    void crossarm;
    const insulator = cyl(structure, 0.05, 0.07, 0.7, -1.3, 5.5, 0, 0xd8dde2, { rough: 0.4, metal: 0.2, seg: 10 });
    holoTag(structure, "Insulator string", -1.3, 6.0, 0, { css: "#f2b134", w: 0.34 });
    reg(hits, insulator, "insulator-check");
    const guyWire = hose(g, [[3.5, 5.9, -1.0], [5.4, 0.05, -2.4]], 0.02, 0x8b929a, { steps: 8, rough: 0.5 });
    holoTag(g, "Guy wire", 4.6, 3.0, -1.7, { css: "#f2b134", w: 0.3 });
    reg(hits, guyWire, "guy-wire-check");
    const structGround = cyl(structure, 0.02, 0.02, 1.2, 0.7, 0.6, 0.6, 0x6b4b30, { rough: 0.7, seg: 8 });
    holoTag(structure, "Structure ground", 0.7, 1.3, 0.6, { css: "#f2b134", w: 0.36 });
    reg(hits, structGround, "structure-ground-check");
    const anchor = group(g, 5.4, 0, -2.4);
    box(anchor, 0.24, 0.1, 0.24, 0, 0.05, 0, 0x6b4b30, { rough: 0.8 });
    const tensionMeter = instrument(anchor, 0.2, 0.3, 0, { ry: -0.4, idle: "-- %", color: ORT_ACCENT });
    holoTag(anchor, "Guy anchor tension", 0.2, 0.5, 0, { css: "#f2b134", w: 0.36 });
    reg(hits, tensionMeter, "anchor-tension-meter");

    // The unauthorized climb: a foothold low on the same structure.
    const climbTrap = box(structure, 0.16, 0.03, 0.1, -0.7, 0.9, 0.62, 0x8b98a5, { rough: 0.6, metal: 0.4 });
    holoTag(structure, "Climb for a closer look?", -0.7, 1.1, 0.62, { css: "#f0645b", w: 0.42 });
    reg(hits, climbTrap, "climb-structure-unauthorized");

    // ------------------------------------------------------------ vegetation
    const tree = group(g, -3.6, 0, -3.4);
    cyl(tree, 0.12, 0.16, 2.2, 0, 1.1, 0, 0x5b4530, { rough: 0.9, seg: 10 });
    ball(tree, 1.0, 0, 2.6, 0, 0x3a6b3a, { rough: 0.95, seg: 10, seg2: 8 });
    holoTag(tree, "Encroaching tree", 0, 3.4, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, tree, "encroaching-tree");
    const brush = group(g, -1.6, 0, -3.8);
    ball(brush, 0.5, 0, 0.4, 0, 0x4a6b3a, { rough: 0.95, seg: 8, seg2: 6 });
    reg(hits, brush, "healthy-brush");
    const deadLimb = hose(g, [[3.9, 5.85, 0.0], [4.6, 5.5, 0.9]], 0.05, 0x5b4530, { steps: 8, rough: 0.85 });
    holoTag(g, "Dead limb over the line", 4.3, 6.1, 0.5, { css: "#f0645b", w: 0.44 });
    reg(hits, deadLimb, "dead-limb-over-line");

    // ------------------------------------------------------ the patrol scan
    const throttlePost = group(g, -2.0, 0, 3.0);
    cyl(throttlePost, 0.03, 0.03, 0.7, 0, 0.35, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const throttle = instrument(throttlePost, 0, 0.75, 0, { ry: 0.6, idle: "-- mph", color: ORT_ACCENT, w: 0.14 });
    holoTag(throttlePost, "Patrol throttle", 0, 0.95, 0, { css: "#f2b134", w: 0.3 });
    reg(hits, throttle, "patrol-throttle");

    // -------------------------------------------------------- downed conductor
    const conductor = hose(g, [[6.4, 0.05, -0.4], [4.2, 0.05, -1.8], [2.2, 0.05, -1.9]], 0.045, 0x3a3d41, { steps: 12, rough: 0.6, seg: 8 });
    holoTag(g, "Downed conductor", 4.3, 0.5, -1.4, { css: "#f0645b", w: 0.4 });
    reg(hits, conductor, "touch-downed-conductor");
    const branchOnLine = hose(g, [[6.0, 0.3, -0.6], [6.8, 1.4, -0.2]], 0.05, 0x5b4530, { steps: 8, rough: 0.85 });
    reg(hits, branchOnLine, "clear-branch-off-energized-line");

    const cordonSpots = [];
    const cordonRing = group(g, 4.3, 0, -1.2);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const spot = ball(cordonRing, 0.06, Math.cos(a) * 2.6, 0.02, Math.sin(a) * 2.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false, seg: 6, seg2: 5 });
      cordonSpots.push(spot);
    }
    hits["cordon-ring"] = cordonRing;
    const flagRack = group(g, -1.4, 0, 2.2);
    const flags = [];
    for (let i = 0; i < 3; i++) {
      const flag = box(flagRack, 0.14, 0.1, 0.01, i * 0.14 - 0.14, 0.5, 0, 0xf2b134, { emissive: ORT_ACCENT, ei: 0.4, rough: 0.6 });
      flags.push(flag);
    }
    cyl(flagRack, 0.015, 0.015, 1.0, 0, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(flagRack, "Cordon flags", 0, 1.1, 0, { css: "#f2b134", w: 0.3 });
    reg(hits, flagRack, "cordon-flag");

    const gpsUnit = instrument(g, -0.5, 0.9, -1.6, { ry: 0.4, idle: "NO FIX", color: ORT_ACCENT, w: 0.16 });
    holoTag(g, "GPS unit", -0.5, 1.1, -1.6, { css: "#f2b134", w: 0.26 });
    reg(hits, gpsUnit, "gps-unit");

    const reportRadio = group(g, -2.6, 0, 1.0, 2.4);
    box(reportRadio, 0.1, 0.18, 0.06, 0, 1.3, 0, 0x2b3138, { rough: 0.5 });
    holoTag(reportRadio, "Report radio", 0, 1.5, 0, { css: "#f2b134", w: 0.3 });
    reg(hits, reportRadio, "report-radio");

    const fireRadio = group(g, -2.4, 0, 1.3, 2.4);
    box(fireRadio, 0.1, 0.18, 0.06, 0, 1.3, 0, 0x8a1f1f, { rough: 0.5 });
    holoTag(fireRadio, "Fire call radio", 0, 1.5, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, fireRadio, "fire-call-radio");

    // The fire itself: a thin flame line and smoke, dark until the interrupt fires.
    const fireEmbers = particles(g, 50, 0xf2a23b, { size: 0.03, life: 1.0, additive: true, opacity: 0.85 });
    fireEmbers.position.set(4.6, 0.2, -1.1);
    fireEmbers.visible = false;
    const fireGlow = ownMaterial(ball(g, 0.3, 4.6, 0.06, -1.1, 0xff6a2a, { emissive: 0xff6a2a, ei: 0, rough: 0.6, seg: 10, seg2: 6 }));
    reg(hits, fireGlow, "approach-grass-fire");
    const fireSmoke = particles(g, 40, 0x8a8a86, { size: 0.12, life: 2.6, additive: false, opacity: 0.4 });
    fireSmoke.position.set(4.6, 0.3, -1.1);
    fireSmoke.visible = false;

    // ------------------------------------------------------------ boards
    const assignBoard = holoPanel(g, 0.56, 0.4, 1.6, 1.35, 3.0, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b134"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe9c8";
      cx.fillText("SEGMENT ASSIGNMENT", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f0d9ad";
      ["Segment 14 — structures 14 through 22", "Corridor map on the console", "Vegetation clearance to be re-measured"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.5, accent: ORT_ACCENT });
    reg(hits, assignBoard, "assignment-board");

    const condBoard = holoPanel(g, 0.56, 0.4, 1.6, 1.35, 3.5, (cx, w, h) => {
      cx.fillStyle = "rgba(16,20,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fd84f"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e6f2c8";
      cx.fillText("WIND & FIRE WEATHER", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8e6b0";
      ["Check the current spot forecast", "Wind, gusts and fire-weather status", "No figure repeated here as fact"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.5, accent: 0x9fd84f });
    reg(hits, condBoard, "conditions-board");

    const clearanceCard = holoPanel(g, 0.5, 0.36, 1.6, 1.3, -3.3, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2b134"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#ffe9c8";
      cx.fillText("MINIMUM APPROACH", w * 0.06, h * 0.18);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f0d9ad";
      ["Per 1910.269 table, by voltage class", "Confirmed before the first structure"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.42 + i * 0.18)));
    }, { ry: -0.5, accent: ORT_ACCENT });
    reg(hits, clearanceCard, "clearance-card");

    const checkinBoard = holoPanel(g, 0.55, 0.38, 1.6, 1.35, -3.8, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,20,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#4fd1ff"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#e2f6ff";
      cx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#cfeaf7";
      ["\"How are you doing?\" — ask it", "IBEW member assistance line posted", "Answer logged, not assumed"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: -0.5, accent: 0x4fd1ff });
    reg(hits, checkinBoard, "checkin-board");

    // The patrol partner, clear of every control.
    standingFigure(g, -0.4, 2.9, { ry: 2.6, cloth: 0x2b3a2f, vest: CITY.hiVis, helmet: 0xf2f2f2 });

    // Log board.
    const logSpec = [["log-vegetation", -0.2], ["log-structure", 0.0], ["log-conductor", 0.2]];
    const logBoard = group(g, 2.6, 0, 2.6);
    for (const [id, tx] of logSpec) {
      const tile = box(logBoard, 0.12, 0.12, 0.02, tx, 0.9, 0, 0x1a0c0d, { rough: 0.6 });
      reg(hits, tile, id);
    }
    holoTag(logBoard, "Patrol log", 0, 1.08, 0, { css: "#f2b134", w: 0.3 });

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(2.0, 1.2, -1.0),

      onStepComplete(step) {
        if (step.id === "structure-inspect") insulator.material = mat(0xa8c9d8, { rough: 0.4, metal: 0.2 });
        if (step.id === "boundary-drag") { for (const f of flags) f.material.emissiveIntensity = 1.4; }
        if (step.id === "gps-mark") repaint(gpsUnit.userData.screen, signFace("FIX SET", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.42 }));
      },

      onInterrupt(it) {
        if (it.id === "downed-conductor-found") { conductor.material = mat(0x3a3d41, { rough: 0.6, emissive: 0xf0645b, ei: 0.5 }); }
        if (it.id === "spot-fire-ignites") { fireEmbers.visible = true; fireSmoke.visible = true; fireGlow.material.emissiveIntensity = 2.2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "downed-conductor-found") { conductor.material = mat(0x3a3d41, { rough: 0.6 }); }
        if (it.id === "spot-fire-ignites") { fireGlow.material.emissiveIntensity = 0.6; }
      },

      animate(t, dt) {
        for (const s of cordonSpots) s.visible = true;
        if (fireEmbers.visible) fireEmbers.userData.step(dt, new THREE.Vector3(4.6, 0.1, -1.1), 0.12, 0.6, 0.3);
        if (fireSmoke.visible) fireSmoke.userData.step(dt, new THREE.Vector3(4.6, 0.3, -1.1), 0.1, 0.35, 0.55);
        const spin = throttle.userData.screen;
        void spin; void t;
      },
    };
  },
};
