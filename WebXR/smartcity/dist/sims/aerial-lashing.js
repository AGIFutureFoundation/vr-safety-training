import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Aerial Lashing VR — Connectivity & Telecom, outside plant.
// Placing and lashing a fibre cable to an existing messenger strand from an
// aerial lift, on joint-use poles, over a live road.
//
// Three things make this its own job rather than a variation on line work or
// on splicing.
//
// The first is joint use. One pole carries the electric utility's supply
// conductors at the top and the communications cables below, separated by the
// distance the National Electrical Safety Code sets and the make-ready
// engineering recorded for this span. A communications worker is qualified
// for the communications space and is not qualified for the supply space —
// that is the plain reading of 1910.269 and 1926 Subpart V, and it is not a
// paperwork distinction. Whether this job happens at all is decided by
// whether the working position stays clear of the supply conductors through
// the full swing of the boom and through the whole of the cable pull, not
// just at the moment the bucket stops.
//
// The second is the strand. The messenger is grounded and bonded, and the
// bond is what makes the whole span one potential. A cable placed on a strand
// whose bond is open is a conductor hung between two different potentials,
// looking for the difference.
//
// The third is the road. The thing that kills outside-plant crews is not the
// pole, it is traffic — so the traffic control goes in before the bucket goes
// up, and it stays in until the bucket is stowed.

const OSP_ACCENT = 0x3bc9b0;

export const SIM_AERIAL_LASHING = {
  id: "aerial-lashing",
  index: "64",
  domain: "Telecom",
  trade: "Outside plant aerial technician (line and cable placer)",
  category: "Connectivity & Telecom",
  weather: "overcast",
  certification: "CWA and IBEW outside-plant locals; OSHA 29 CFR 1910.268 telecommunications; 29 CFR 1926 Subpart V and 1910.269 for the supply space a communications worker is not qualified to enter; ANSI A92 for the vehicle-mounted aerial device; the National Electrical Safety Code for joint-use separations; MUTCD temporary traffic control",
  name: "Aerial Lashing",
  title: simTitle("Aerial Lashing"),
  tagline: "Placing fibre on an existing strand from a bucket over a live road: traffic control first, pole sounded, strand bonded, the supply space kept above you and the sag left where the make-ready put it",
  accent: OSP_ACCENT,
  accentCss: "#3bc9b0",
  parSeconds: 300,
  footprint: 2.2,
  badge: { id: "span-placed", name: "Span Placed", note: "A span lashed with the lane closed, the strand bonded and the supply space never entered" },

  game: system({
    name: "Outside Plant Authority",
    currency: "SPAN",
    ranks: ["Cable Hand", "Aerial Technician", "Line Placer", "OSP Crew Lead", "Outside Plant Authority Certified"],
    badges: [
      { id: "stayed-low", name: "Stayed In The Comms Space", note: "Never let the boom or the body approach the supply conductors", test: AWARD.safe },
      { id: "bond-proven", name: "Bond Proven", note: "Bonded the strand and proved it before any cable went on it", test: AWARD.stepClean("bond") },
      { id: "sag-kept", name: "Sag Kept", note: "Paid the reel off inside the tension the make-ready sag allows", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-span", name: "Clean Span", note: "Whole span placed with no corrections", test: AWARD.clean },
      { id: "held-the-bond", name: "Held The Bond", note: "Held every timed contact for its full count", test: AWARD.unbroken },
      { id: "lane-back", name: "Lane Back Early", note: "Bucket stowed and the lane handed back inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "climb-supply": "You went up into the supply space to move the service drop out of your way. Above the communications space the pole belongs to the electric utility and so does everything on it, and a communications worker is not a qualified employee there — not because of a demarcation agreement, but because nothing in a cable placer's training or tools is built for an energized primary. That drop gets moved by a qualified line worker, and until they arrive the job stops.",
    "open-lane": "You worked with the travelled lane open under the bucket. Outside-plant crews are not killed by poles, they are killed by traffic: struck by a vehicle, or dropped on when a vehicle hits the lift. The lane closure is not a courtesy to the crew, it is the only thing standing between a moving vehicle and a truck with someone in the air on top of it.",
    "unbonded-strand": "You lashed the cable onto a strand whose bond you had not proved. The bond is what ties the messenger, the pole ground and the utility's grounded conductor into one potential across the whole span. Open it and the strand stops being grounded steel and becomes a long conductor between two different potentials — which is what you are about to clamp a cable and a lashing machine to, by hand, from a bucket.",
    "crank-tension": "You wound the reel tension up to pull the sag out of the span. Sag is not slack to be tidied away: it is the designed condition the make-ready calculated the poles, the guys and the road crossing against. Over-tension the pull and you overhaul the strand, lift the crossing out of the profile the make-ready allowed, and load the poles in a direction nobody checked — and a wood pole carrying an unbalanced pull its guying does not answer fails at the groundline, which is also the part of it you cannot see.",
  },

  lateNotes: {
    "boom-slew": "The boom does not move until the lift is set up on its outriggers and the supply space above the work has been marked and agreed.",
    "cable-end": "The cable goes up onto the strand after the bond is proved, not before — an unbonded strand is not a place to be clamping things.",
    "lasher-drive": "The lasher rides a strand that is bonded and a cable that is already clamped in at the pole. Everything it does after that is unattended.",
  },

  // Interruptions: see shared/game.js. Both are the things that arrive while
  // an aerial technician is head-down on the work — one from the pole above
  // them, one from the road below.
  interrupts: [
    {
      id: "supply-encroach",
      kind: "Supply space",
      after: "boom-swing", delay: 3, seconds: 13,
      alert: "A secondary service drop has been re-run since the make-ready and now crosses the arc your boom is swinging through, low, with a taped splice in it.",
      cue: "Something belonging to the power company is in the space you are turning the boom through.",
      target: "line-crew-radio",
      why: "You are qualified for the communications space and for nothing above it. A drop in the swing path is not a judgement call to be made from a bucket by eye — the minimum approach distance for someone who is not a qualified line worker is a distance you stay outside of, and the way you stay outside of it is by stopping and getting the utility's line crew to move the drop.",
      missNote: "You kept swinging and took the drop on the boom. A taped splice in a secondary is not insulation, the fibreglass upper boom is only as good as the last dielectric test and the dirt on it, and the first anyone knows about that is the truck body going to potential with a ground worker's hand on it.",
      wrongNote: "It is the radio to the utility's line crew. Nothing in this bucket and nothing in your bag makes that drop yours to touch.",
    },
    {
      id: "lane-breach",
      kind: "Vehicle in the work zone",
      after: "lash-run", delay: 4, seconds: 12,
      alert: "A car has come through the taper, flattened the second cone and stopped in the closed lane directly beneath the bucket, with the driver looking up at you.",
      cue: "The lane you closed is not closed any more.",
      target: "flagger-station",
      why: "A breached taper is a live lane again, and everything above it — the bucket, the lasher, the hand line, the cable — is now over a vehicle and over whatever follows it. Work stops, the flagger holds traffic, and the taper goes back in before anything else moves. Re-establishing the closure is the whole of the response; nothing about the pull matters until the road is yours again.",
      missNote: "You carried on lashing over an open lane with a car under you. The next vehicle through the gap did not stop, and the crew found out which of the two possible outcomes they had — something dropped from the bucket onto a moving car, or a moving car into the outriggers of a truck with someone forty feet up on it.",
      wrongNote: "It is the flagger's post. Traffic gets held and the taper gets put back before you touch the lasher again.",
    },
  ],

  steps: [
    {
      id: "package", kind: "select", target: "make-ready-print",
      title: "Take the make-ready print and the joint-use record",
      cue: "Read who owns which space on this pole, what the make-ready called for, and what the sag and clearance over the road are meant to be.",
      why: "A joint-use pole is shared property with a written allocation: the electric utility's supply conductors at the top, the communications space below, and a separation between them that the National Electrical Safety Code sets and the make-ready engineering recorded span by span. The print is what tells you which of those spaces you are allowed in and what the crossing was designed to be before you hang anything else on it.",
    },
    {
      id: "traffic", kind: "drag", target: "cone-stack",
      title: "Set the traffic control before anything goes up",
      cue: "Carry the cones out and run the taper upstream of the truck, working with your back to the traffic side.",
      why: "The taper comes first, before the outriggers and long before the boom. A crew that sets up and then closes the lane spends the whole set-up standing in live traffic, which is exactly the part of this job that kills people. The taper is also what the driver reads — it is the warning, not the cones around the truck.",
      drag: { to: "taper-point", radius: 0.6, missNote: "The taper has to start upstream, far enough back that a driver reads it and moves over before they reach you. Cones around the truck are a decoration." },
    },
    {
      id: "sound-pole", kind: "hold", target: "sounding-hammer", seconds: 4,
      title: "Sound and inspect the pole before it takes a load change",
      cue: "Hammer from the groundline up, listening for the ring going dull, and hold while you work round the pole.",
      why: "A wood pole rots from the inside out at the groundline, where the sound one rings and the hollow one thuds. This pole is about to take a new cable, a new pull and a lift working off it, and a load change is exactly what finds a shell-rotten pole. A pole you would not climb is a pole you do not add a span to either.",
      holdBreakNote: "You stopped sounding partway round. A pole is sounded all the way round and up from the groundline — the soft face is the one you did not get to.",
    },
    {
      id: "setup", kind: "sequence",
      targets: ["park-brake", "wheel-chocks", "outrigger-left", "outrigger-right"],
      itemNames: {
        "park-brake": "park brake set",
        "wheel-chocks": "wheels chocked",
        "outrigger-left": "kerb-side outrigger",
        "outrigger-right": "traffic-side outrigger",
      },
      title: "Set the lift up on the roadway",
      cue: "Brake, chocks, then both outriggers down onto pads — kerb side first, traffic side last.",
      why: "The ANSI A92 aerial device standards treat the chassis as part of the machine: an aerial device worked off a truck that can roll or settle is a different machine from the one that was rated. Brake and chocks before outriggers, because outriggers set on a truck that is still free to move take the load and then lose it. Traffic side last so the time you spend in the lane is the shortest it can be.",
      outOfOrderNote: "Wrong order — brake, then chocks, then the outriggers, and the traffic-side outrigger last so you are stood in the lane for as little time as possible.",
    },
    {
      id: "supply-line", kind: "select", target: "supply-boundary",
      title: "Mark the supply space and agree the limit",
      cue: "Mark the boundary of the space you will not go above, and say it out loud to the ground worker before the boom moves.",
      why: "The limit is agreed on the ground, in daylight, by two people, and not judged from a bucket by one. Everything above that mark belongs to the electric utility and needs a qualified line worker; everything below it is yours. Naming it out loud is what makes it something the ground worker can call you on when the boom starts creeping up toward it.",
    },
    {
      id: "bond", kind: "hold", target: "bond-clamp", seconds: 5,
      title: "Bond the strand at the pole",
      cue: "Clean the strand, get the clamp on bare metal and hold it while the bond is made up to the pole ground.",
      why: "The messenger is a grounded conductor and the bond is what makes the entire span, the pole ground and the utility's grounded conductor into a single potential. It is the difference between a strand that stays at earth and a strand that sits between two potentials for the length of the block. It is also what carries fault current away from the person holding a lashing machine on it.",
      holdBreakNote: "The clamp came off before the bond was made up. A bond that was nearly on is an open bond, which is the condition this whole step exists to prevent.",
    },
    {
      id: "bond-read", kind: "gauge", target: "bond-meter",
      title: "Prove the bond, do not assume it",
      cue: "Read the bond across the strand and the pole ground, and commit on the resistance.",
      why: "A clamp that looks right on a galvanised strand can be sitting on zinc oxide and reading open. The reason to measure is that a bad bond and a good bond are visually identical, and the span you are about to clamp a cable to is either grounded for a thousand feet or it is not.",
      gauge: {
        label: "BOND RESISTANCE", speed: 0.7, green: [0.02, 0.16],
        readout: (t) => `${(t * 12).toFixed(2)} Ω`,
        missNote: "That is not a bond, that is a clamp resting on a strand. Clean back to bright metal and re-make it before any cable goes up.",
      },
    },
    {
      id: "boom-swing", kind: "track", target: "boom-slew", seconds: 6,
      title: "Swing the boom up to the strand and keep it clear",
      cue: "Bring the bucket up to the communications space and hold the clearance steady the whole way through the swing.",
      why: "Clearance is not a position, it is the whole arc. The boom passes through everything between where it started and where it stops, and the tightest point is almost never where the bucket ends up. Swing in too far and you are into the supply space you are not qualified for; swing out too far and the bucket and everything in it is hanging over the open travelled lane instead of the closed one.",
      track: {
        label: "CLEARANCE TO SUPPLY", green: [0.55, 0.85], rise: 0.5, fall: 0.42, drift: 0.13,
        readout: (v) => `${(0.4 + v * 2.2).toFixed(2)}× MAD`,
      },
    },
    {
      id: "hang-cable", kind: "drag", target: "cable-end",
      title: "Get the cable up onto the strand",
      cue: "Take the cable end up on the hand line and clamp it into the strand at the pole.",
      why: "The cable is carried to the strand rather than pulled along the ground, because a fibre cable dragged over a kerb and a driveway arrives with the sheath opened and the buffer tubes crushed, and none of that shows up until the span is up and the OTDR says so. The pole end is clamped first so the lasher has something to pull against.",
      drag: { to: "strand-seat", radius: 0.6, missNote: "The cable end is not seated in the strand clamp. Nothing is lashed off a cable that is only resting there." },
    },
    {
      id: "reel-tension", kind: "gauge", target: "payoff-gauge",
      title: "Set the reel payoff under tension control",
      cue: "Set the payoff brake and commit when the running tension sits where the make-ready sag calls for.",
      why: "The reel is what decides the tension in the span, and tension decides the sag, and sag is what the road crossing clearance was calculated from. Too loose and the cable is on the ground behind you; too tight and you overhaul the strand, lift the crossing and load poles and guys in a direction the make-ready never checked.",
      gauge: {
        label: "RUNNING TENSION", speed: 0.72, green: [0.36, 0.56],
        readout: (t) => `${Math.round(t * 900)} N`,
        missNote: "Over the tension the make-ready sag allows. Back the payoff off — the sag in that span is the design, not slack to be taken up.",
      },
    },
    {
      id: "lash-run", kind: "track", target: "lasher-drive", seconds: 6,
      title: "Run the lasher out across the span",
      cue: "Hold the pull steady and let the lasher ride the strand out to midspan while the reel pays off behind it.",
      why: "The lasher rides the strand and wraps the cable to it as it goes, at a rate the reel can feed. Snatch it and the lashing wire breaks or the reel overhauls; stall it and you get a bare run with the cable sitting on the strand unattached. Everything it does happens out at midspan, above the road, where nobody can reach it once it is going.",
      track: {
        label: "PULL RATE", green: [0.42, 0.62], rise: 0.55, fall: 0.45, drift: 0.13,
        readout: (v) => `${Math.round(v * 22)} m/min`,
      },
    },
    {
      id: "clamp-in", kind: "turn", target: "lash-clamps",
      title: "Make up the lashing clamps at the pole",
      cue: "Tighten the clamps that terminate the lashing wire either side of the pole.",
      why: "The lashing wire is only as good as what holds its ends. An unterminated lashing run unwinds from the end, slowly, over a season of wind, and hands you a cable hanging off a strand at midspan over a road. The clamps are the reason the span stays a span.",
      turn: { turns: 1.2, axis: "z", label: "LASHING CLAMPS" },
    },
    {
      id: "stow", kind: "select", target: "boom-stow",
      title: "Stow the boom before anything else",
      cue: "Bring the bucket down, cradle the boom and get everything out of the travelled way.",
      why: "The boom comes down before the paperwork, before the tools and before the cones. A stowed boom is the point at which the job stops being something a passing vehicle can turn into a fatality, and every minute between finishing the work and stowing is a minute spent in the air for no reason at all.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["low-clearance", "open-bond"],
      itemNames: { "low-clearance": "the crossing at midspan", "open-bond": "the pole ground at the molding" },
      itemNotes: {
        "low-clearance": "The new cable has pulled the strand down and the crossing over the travelled way is now lower than the make-ready allowed for. That is re-sagged before the lane is handed back, not written up for later — the next high load through here is the one that finds it.",
        "open-bond": "The pole ground wire is broken behind the molding, below the point you bonded to. Your bond reads fine against the strand and is going nowhere: the span is bonded to a pole ground that is not connected to anything.",
      },
      decoyNotes: {
        "existing-cable": "The existing copper on this pole is somebody else's plant, properly clamped and properly sagged. Leave it alone.",
      },
      title: "Walk the span before the lane goes back",
      cue: "Look up at the crossing, look down the pole at the ground, and click what has to be fixed before traffic comes back.",
      why: "The last look is the only part of this job done with the cable in its final condition and the lane still yours. After the cones come in, anything you find here needs the road closed all over again, so it will not get found — it will get reported by somebody else, months later, as damage.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, OSP_ACCENT);

    // ---------------------------------------------------------------- the road
    // The road runs left to right across the front of the pole. The travelled
    // lane is the far one; the near one is what the crew closes.
    box(g, 18, 0.05, 4.6, 0, 0.025, -0.3, 0x24282c,
      { rough: 0.98, finish: "asphalt", tile: [12, 4], cast: false });
    for (let i = -8; i <= 8; i += 1.6) {
      box(g, 0.8, 0.008, 0.09, i, 0.054, -0.35, 0xd9c14a, { rough: 0.7, cast: false });
    }
    // The lane line the closure is taken against, and the far kerb.
    box(g, 18, 0.008, 0.06, 0, 0.054, 0.95, 0xdfe4e8, { rough: 0.7, cast: false });
    box(g, 18, 0.2, 0.22, 0, 0.1, -2.7, 0x9aa19a, { rough: 0.95, finish: "concrete", tile: [12, 1], cast: false });
    box(g, 18, 0.06, 1.8, 0, 0.03, -3.6, 0x8d9490, { rough: 0.95, finish: "concrete", tile: [12, 2], cast: false });

    // ------------------------------------------------------- the joint-use pole
    const POLE_X = 2.15, POLE_Z = -1.95;
    const pole = group(g, POLE_X, 0, POLE_Z);
    cyl(pole, 0.1, 0.135, 7.2, 0, 3.6, 0, 0x6a5742,
      { rough: 0.96, seg: 14, finish: "concrete", tile: [1, 9] });
    holoTag(pole, "Joint-use pole 41-6", 0, 7.55, 0, { css: "#3bc9b0", w: 0.46 });

    // Supply space: crossarm, three primaries and a neutral, all the electric
    // utility's and none of it a communications worker's.
    box(pole, 0.11, 0.1, 2.1, 0, 6.15, 0, 0x6a5742, { rough: 0.9, finish: "concrete", tile: [1, 2] });
    for (const dz of [-0.78, 0, 0.78]) {
      cyl(pole, 0.055, 0.07, 0.16, 0, 6.28, dz, 0x4a5a6a, { rough: 0.35, seg: 12 });
    }
    box(pole, 0.06, 0.16, 0.06, 0, 5.4, 0, 0x4a5a6a, { rough: 0.4, seg: 10 });
    holoTag(pole, "Supply space — utility", 0, 6.7, 0, { css: "#f0645b", w: 0.44 });

    // The boundary the communications worker marks and stays under.
    const madRing = torus(pole, 0.2, 0.022, 0, 4.72, 0, 0xf0645b,
      { emissive: 0xf0645b, ei: 2.0, rough: 0.4, seg: 8, seg2: 20, cast: false });
    madRing.rotation.x = Math.PI / 2;
    const madRingHome = madRing.material;
    holoTag(pole, "Limit — do not go above", 0, 5.02, 0, { css: "#f0645b", w: 0.48 });
    const boundaryPick = box(pole, 0.5, 0.5, 0.5, 0, 4.72, 0, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    reg(hits, boundaryPick, "supply-boundary");

    // Communications space: the existing strand, the existing copper below it,
    // and the pole ground running down the face in its molding.
    holoTag(pole, "Communications space", 0, 3.98, 0, { css: "#3bc9b0", w: 0.44 });
    const molding = box(pole, 0.07, 5.0, 0.04, 0, 2.5, 0.13, 0x4b4238, { rough: 0.9 });
    const groundWire = cyl(pole, 0.008, 0.008, 1.3, 0.02, 0.7, 0.16, 0xb87333, { rough: 0.6, metal: 0.6, seg: 8 });
    holoTag(pole, "Pole ground", 0.02, 1.5, 0.2, { css: "#b87333", w: 0.26 });
    const openBond = box(pole, 0.16, 0.34, 0.16, 0.02, 1.15, 0.18, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    reg(hits, openBond, "open-bond");

    // The span: strand, existing copper, and the primaries overhead. The far
    // pole is scenery — the learner never reaches it and never needs to.
    const FAR_X = -6.9;
    const span = group(g, 0, 0, 0);
    const strand = hose(span, [[POLE_X, 3.6, POLE_Z], [-2.4, 3.3, POLE_Z], [FAR_X, 3.6, POLE_Z]],
      0.019, 0x9aa4ad, { steps: 18, rough: 0.4, metal: 0.75, cast: false });
    const oldCable = hose(span, [[POLE_X, 3.18, POLE_Z + 0.02], [-2.4, 2.8, POLE_Z + 0.02], [FAR_X, 3.18, POLE_Z + 0.02]],
      0.026, 0x23272b, { steps: 18, rough: 0.8, cast: false });
    reg(hits, oldCable, "existing-cable");
    for (const dz of [-0.78, 0, 0.78]) {
      hose(span, [[POLE_X, 6.32, POLE_Z + dz], [-2.4, 6.0, POLE_Z + dz], [FAR_X, 6.32, POLE_Z + dz]],
        0.012, 0x5a6670, { steps: 14, rough: 0.5, metal: 0.7, cast: false });
    }
    hose(span, [[POLE_X, 5.44, POLE_Z], [-2.4, 5.16, POLE_Z], [FAR_X, 5.44, POLE_Z]],
      0.012, 0x5a6670, { steps: 14, rough: 0.5, metal: 0.7, cast: false });

    // The far pole, as scenery.
    const farPole = group(g, FAR_X, 0, POLE_Z);
    cyl(farPole, 0.1, 0.13, 7.0, 0, 3.5, 0, 0x6a5742, { rough: 0.96, seg: 10, finish: "concrete", tile: [1, 9], cast: false });
    box(farPole, 0.1, 0.09, 2.0, 0, 6.15, 0, 0x6a5742, { rough: 0.9, cast: false });
    for (const dz of [-0.78, 0, 0.78]) cyl(farPole, 0.05, 0.06, 0.15, 0, 6.28, dz, 0x4a5a6a, { rough: 0.35, seg: 8, cast: false });

    // A down guy, because the pull that is about to go on this pole has to go
    // somewhere. Scenery — nobody is asked to touch it.
    hose(g, [[POLE_X, 5.3, POLE_Z], [POLE_X + 0.8, 3.0, POLE_Z - 1.1], [POLE_X + 1.5, 0.1, POLE_Z - 1.9]],
      0.012, 0x8b949d, { steps: 12, rough: 0.5, metal: 0.7, cast: false });

    // The secondary service drop, which is where the first interruption lives.
    const dropLine = group(g, 0, 0, 0);
    hose(dropLine, [[POLE_X - 0.05, 5.2, POLE_Z], [1.0, 4.6, POLE_Z + 0.9], [0.2, 4.1, POLE_Z + 1.7]],
      0.014, 0x33383d, { steps: 12, rough: 0.7, cast: false });
    const dropHome = { x: dropLine.position.x, z: dropLine.position.z };

    // ------------------------------------------------- the work on the strand
    const strandSeat = box(g, 0.3, 0.3, 0.3, POLE_X - 0.55, 3.58, POLE_Z, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    reg(hits, strandSeat, "strand-seat");
    const seatClamp = box(g, 0.07, 0.1, 0.07, POLE_X - 0.55, 3.55, POLE_Z, 0xb6c2cc, { rough: 0.45, metal: 0.6 });
    holoTag(g, "Strand clamp", POLE_X - 0.55, 3.86, POLE_Z, { css: "#3bc9b0", w: 0.28 });

    const bondClamp = group(g, POLE_X - 0.18, 3.55, POLE_Z + 0.1);
    box(bondClamp, 0.06, 0.07, 0.06, 0, 0, 0, 0xc0742c, { rough: 0.5, metal: 0.6 });
    hose(bondClamp, [[0, -0.03, 0], [0.1, -1.0, 0.03], [0.18, -2.0, 0.05]], 0.008, 0xb87333,
      { steps: 10, rough: 0.6, metal: 0.6, cast: false });
    holoTag(g, "Bond clamp", POLE_X - 0.18, 3.28, POLE_Z + 0.22, { css: "#b87333", w: 0.28 });
    reg(hits, bondClamp, "bond-clamp");

    const lashClamps = group(g, POLE_X - 0.34, 3.42, POLE_Z + 0.16);
    for (const dx of [-0.1, 0.1]) box(lashClamps, 0.05, 0.05, 0.05, dx, 0, 0, 0xd8b23a, { rough: 0.45, metal: 0.7 });
    holoTag(g, "Lashing clamps", POLE_X - 0.34, 3.1, POLE_Z + 0.3, { css: "#d9a441", w: 0.32 });
    reg(hits, lashClamps, "lash-clamps");

    // The lasher itself, parked at the pole until it is driven out.
    const lasher = group(g, POLE_X - 0.95, 3.52, POLE_Z);
    box(lasher, 0.2, 0.17, 0.15, 0, 0, 0, 0xd9a441, { rough: 0.5, metal: 0.4, finish: "painted", tile: [1, 1] });
    cyl(lasher, 0.06, 0.06, 0.05, 0.07, -0.06, 0.09, 0x8b949d, { rough: 0.4, metal: 0.8, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(lasher, "Lasher", 0, 0.28, 0, { css: "#d9a441", w: 0.22 });
    reg(hits, lasher, "lasher-drive");
    const lasherHomeX = lasher.position.x;

    // The new cable, hidden until it is hung, then lashed out along the span.
    const newCable = hose(g, [[POLE_X - 0.5, 3.42, POLE_Z - 0.04], [-1.2, 3.16, POLE_Z - 0.04], [-4.0, 3.3, POLE_Z - 0.04]],
      0.023, 0x1b3d3a, { steps: 16, rough: 0.55, cast: false });
    newCable.visible = false;

    // The midspan crossing, which is what the closing walk-round is about.
    const crossing = box(g, 0.6, 0.5, 0.6, -1.9, 3.15, POLE_Z, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Crossing at midspan", -1.9, 2.72, POLE_Z, { css: "#3bc9b0", w: 0.4 });
    reg(hits, crossing, "low-clearance");
    const unbonded = box(g, 0.5, 0.5, 0.5, -3.4, 3.4, POLE_Z, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Lash it as it is?", -3.4, 3.78, POLE_Z, { css: "#f0645b", w: 0.36 });
    reg(hits, unbonded, "unbonded-strand");
    const supplyTrap = box(g, 0.6, 0.6, 0.7, POLE_X, 5.95, POLE_Z + 0.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Move the drop yourself?", POLE_X, 6.42, POLE_Z + 0.7, { css: "#f0645b", w: 0.46 });
    reg(hits, supplyTrap, "climb-supply");

    // ------------------------------------------------------------- the lift
    const truck = group(g, -2.5, 0, 0.5, 0.15);
    slab(truck, 3.3, 0.5, 1.7, 0.1, 0.78, 0, 0xdfe4e7, { radius: 0.05, rough: 0.45, metal: 0.35, finish: "painted", tile: [3, 1] });
    box(truck, 1.0, 0.62, 1.6, -1.15, 1.25, 0, 0xdfe4e7, { radius: 0.04, rough: 0.4, metal: 0.4, finish: "painted", tile: [2, 1] });
    box(truck, 0.06, 0.4, 1.2, -1.66, 1.32, 0, 0x1b2228, { rough: 0.2, metal: 0.3, opacity: 0.7, transparent: true });
    for (const [wx, wz] of [[-1.1, -0.78], [-1.1, 0.78], [1.0, -0.78], [1.0, 0.78]]) {
      cyl(truck, 0.32, 0.32, 0.2, wx, 0.32, wz, 0x15181b, { rough: 0.9, seg: 14 }).rotation.x = Math.PI / 2;
    }
    // Utility body compartments down the side, with the reflective chevrons a
    // truck parked in a live lane is required to carry.
    for (let i = 0; i < 3; i++) {
      box(truck, 0.62, 0.42, 0.05, -0.1 + i * 0.7, 0.76, 0.86, 0xc3ccd2, { rough: 0.45, metal: 0.4 });
    }
    for (const sz of [-1, 1]) {
      box(truck, 3.3, 0.1, 0.03, 0.1, 1.02, sz * 0.86, 0x3bc9b0, { rough: 0.5, finish: "painted", tile: [3, 1] });
    }
    const chevrons = decal(truck, 1.5, 0.45, 1.78, 0.78, 0, (cx, w, h) => {
      cx.fillStyle = "#e4622a"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#f0f3f5"; cx.lineWidth = Math.max(4, h * 0.11);
      for (let i = -2; i < 6; i++) {
        cx.beginPath();
        cx.moveTo(i * h * 0.34, h); cx.lineTo(i * h * 0.34 + h * 0.6, 0);
        cx.stroke();
      }
    }, { px: 256, rough: 0.6 });
    chevrons.rotation.y = Math.PI / 2;
    holoTag(truck, "Aerial lift 214 · ANSI A92", 0, 2.0, 0.9, { css: "#3bc9b0", w: 0.5 });
    const beacon = ball(truck, 0.07, -1.15, 1.62, 0, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.6, rough: 0.4 });

    const parkBrake = box(truck, 0.05, 0.22, 0.05, -1.15, 1.32, 0.35, 0xd8232a, { rough: 0.5 });
    holoTag(truck, "Park brake", -1.15, 1.58, 0.42, { css: "#f0645b", w: 0.26 });
    reg(hits, parkBrake, "park-brake");
    const chocks = group(truck, -1.0, 0, 0.98);
    for (const dx of [-0.16, 0.16]) box(chocks, 0.2, 0.14, 0.14, dx, 0.07, 0, 0xd8b23a, { rough: 0.7, finish: "rubber", tile: [1, 1] });
    holoTag(truck, "Wheel chocks", -1.0, 0.42, 0.98, { css: "#d9a441", w: 0.3 });
    reg(hits, chocks, "wheel-chocks");

    const outriggers = {};
    for (const [id, sz, label] of [["outrigger-left", -1, "Kerb-side outrigger"], ["outrigger-right", 1, "Traffic-side outrigger"]]) {
      const arm = group(truck, 0.35, 0, sz * 1.0);
      box(arm, 0.14, 0.13, 0.5, 0, 0.62, 0, 0x8b949d, { rough: 0.45, metal: 0.65, finish: "brushed", tile: [1, 1] });
      const leg = group(arm, 0, 0, sz * 0.32);
      cyl(leg, 0.05, 0.05, 0.6, 0, 0.62, 0, 0x8b949d, { rough: 0.45, metal: 0.7, seg: 10 });
      box(leg, 0.3, 0.05, 0.3, 0, 0.36, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
      holoTag(arm, label, 0, 1.0, sz * 0.32, { css: "#3bc9b0", w: 0.38 });
      reg(hits, arm, id);
      outriggers[id] = leg;
    }

    // Turret, boom and bucket. The boom starts cradled and swings up to the
    // strand when the learner drives it there.
    const turret = group(truck, 0.55, 1.05, 0);
    cyl(turret, 0.22, 0.26, 0.4, 0, 0.2, 0, 0x3c444c, { rough: 0.5, metal: 0.6, seg: 16 });
    const boom = group(turret, 0, 0.42, 0);
    const lowerBoom = box(boom, 0.2, 0.2, 2.6, 0, 0.1, 1.2, 0xe4e8ea, { radius: 0.04, rough: 0.5, metal: 0.25, finish: "painted", tile: [3, 1] });
    const upperBoom = group(boom, 0, 0.1, 2.4);
    box(upperBoom, 0.15, 0.15, 2.3, 0, 0, 1.1, 0xf0f3f5, { rough: 0.35, metal: 0.05, finish: "painted", tile: [3, 1] });
    decal(upperBoom, 0.3, 0.09, 0, 0.09, 1.0, signFace("INSULATED", { bg: "#0d1f1d", accent: "#3bc9b0", scale: 0.5 }), { px: 160 });
    const bucket = group(upperBoom, 0, 0.35, 2.3);
    box(bucket, 0.36, 0.55, 0.34, 0, 0, 0, 0xf0f3f5, { radius: 0.04, rough: 0.45 });
    holoTag(bucket, "Bucket", 0, 0.42, 0, { css: "#3bc9b0", w: 0.22 });
    // Stowed is folded back along the truck's own length, over the cab — not
    // out across the road, which is where nobody stows a boom and where it
    // would sit straight across the line a learner walks in on.
    const STOW = { x: -0.25, y: -Math.PI / 2, upper: 2.5 };
    const REACH = { x: -0.5, y: 1.97, upper: -0.12 };
    const setBoom = (p) => { boom.rotation.x = p.x; boom.rotation.y = p.y; upperBoom.rotation.x = p.upper; };
    setBoom(STOW);

    const boomCtrl = group(truck, 0.2, 1.1, 0.8);
    box(boomCtrl, 0.14, 0.18, 0.1, 0, 0, 0, 0x22272c, { rough: 0.5, metal: 0.4 });
    const slewLever = box(boomCtrl, 0.03, 0.14, 0.03, 0.04, 0.14, 0.02, 0x3bc9b0, { rough: 0.45, emissive: 0x3bc9b0, ei: 0.5 });
    holoTag(boomCtrl, "Lower boom controls", 0, 0.34, 0, { css: "#3bc9b0", w: 0.42 });
    reg(hits, boomCtrl, "boom-slew");

    const stow = group(truck, -0.85, 1.05, 0);
    box(stow, 0.2, 0.22, 0.24, 0, 0, 0, 0x59636d, { rough: 0.55, metal: 0.4 });
    box(stow, 0.06, 0.16, 0.3, 0, 0.18, 0, 0x59636d, { rough: 0.55, metal: 0.4 });
    holoTag(stow, "Boom cradle · stow", 0, 0.44, 0, { css: "#3bc9b0", w: 0.4 });
    reg(hits, stow, "boom-stow");

    const radio = group(truck, -0.2, 1.12, 0.95);
    box(radio, 0.11, 0.17, 0.05, 0, 0, 0, 0x22272c, { rough: 0.5 });
    cyl(radio, 0.005, 0.005, 0.18, 0.04, 0.16, 0, 0x14181d, { rough: 0.6, seg: 6 });
    ball(radio, 0.012, -0.03, 0.06, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.8 });
    holoTag(radio, "Radio — utility line crew", 0, 0.34, 0, { css: "#f2c14b", w: 0.48 });
    reg(hits, radio, "line-crew-radio");

    // ------------------------------------------------------- the reel and tools
    const reelStand = group(g, -0.6, 0, 2.9, -0.35);
    for (const sx of [-1, 1]) {
      box(reelStand, 0.09, 0.85, 0.5, sx * 0.55, 0.42, 0, 0x59636d, { rough: 0.55, metal: 0.5 });
    }
    cyl(reelStand, 0.04, 0.04, 1.2, 0, 0.78, 0, 0x8b949d, { rough: 0.4, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    const reel = group(reelStand, 0, 0.78, 0);
    for (const sx of [-1, 1]) {
      cyl(reel, 0.44, 0.44, 0.04, sx * 0.2, 0, 0, 0x6b5a45, { rough: 0.9, seg: 20, finish: "concrete", tile: [2, 1] })
        .rotation.z = Math.PI / 2;
    }
    cyl(reel, 0.3, 0.3, 0.36, 0, 0, 0, 0x1b3d3a, { rough: 0.6, seg: 20 }).rotation.z = Math.PI / 2;
    holoTag(reelStand, "Fibre reel · 1 km", 0, 1.48, 0, { css: "#3bc9b0", w: 0.38 });

    const cableEnd = group(g, -0.6, 0.55, 2.55);
    cyl(cableEnd, 0.022, 0.022, 0.4, 0, 0, 0, 0x1b3d3a, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    box(cableEnd, 0.07, 0.07, 0.08, 0, 0, -0.2, 0xd9a441, { rough: 0.5, metal: 0.4 });
    holoTag(cableEnd, "Cable end · hand line", 0, 0.3, 0, { css: "#3bc9b0", w: 0.42 });
    reg(hits, cableEnd, "cable-end");

    const payoff = instrument(g, 0.12, 0.95, 2.95, { ry: -0.5, idle: "-- N", color: 0x3bc9b0 });
    holoTag(payoff, "Payoff tension", 0, 0.18, 0, { css: "#3bc9b0", w: 0.32 });
    reg(hits, payoff, "payoff-gauge");
    const reelBrake = group(g, -1.45, 0.72, 2.7);
    box(reelBrake, 0.09, 0.12, 0.09, 0, 0, 0, 0x59636d, { rough: 0.55, metal: 0.5 });
    const brakeLever = box(reelBrake, 0.03, 0.26, 0.03, 0, 0.18, 0, 0xd8232a, { rough: 0.5 });
    holoTag(reelBrake, "Reel payoff brake", 0, 0.42, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, reelBrake, "reel-brake");
    const crankTrap = box(g, 0.4, 0.5, 0.4, -1.9, 0.9, 3.1, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Pull the sag out?", -1.9, 1.3, 3.1, { css: "#f0645b", w: 0.36 });
    reg(hits, crankTrap, "crank-tension");

    // Tool table with the bond meter and the sounding hammer's home.
    const table = group(g, -1.15, 0, 1.75, 0.4);
    slab(table, 0.72, 0.05, 0.46, 0, 0.72, 0, 0x8b949d, { radius: 0.02, rough: 0.5, metal: 0.5 });
    for (const [tx, tz] of [[-0.3, -0.17], [0.3, -0.17], [-0.3, 0.17], [0.3, 0.17]]) {
      cyl(table, 0.018, 0.018, 0.72, tx, 0.36, tz, 0x59636d, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const bondMeter = instrument(table, 0, 0.78, 0, { ry: 0.2, idle: "-- Ω", color: 0xb87333 });
    holoTag(table, "Bond tester", 0, 0.98, 0, { css: "#b87333", w: 0.3 });
    reg(hits, bondMeter, "bond-meter");

    const hammer = group(g, POLE_X - 0.5, 0.42, POLE_Z + 0.4, 0.5);
    cyl(hammer, 0.016, 0.016, 0.42, 0, 0, 0, 0x8a6a3a, { rough: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    box(hammer, 0.07, 0.06, 0.06, 0.2, 0, 0, 0x4a5058, { rough: 0.45, metal: 0.6 });
    holoTag(hammer, "Sounding hammer", 0, 0.3, 0, { css: "#3bc9b0", w: 0.38 });
    reg(hits, hammer, "sounding-hammer");

    // ------------------------------------------------------- traffic control
    const coneStack = group(g, 1.05, 0, 2.3);
    for (let i = 0; i < 4; i++) {
      cyl(coneStack, 0.035, 0.14, 0.5, 0, 0.27 + i * 0.05, 0, 0xe4622a, { rough: 0.75, seg: 12 });
    }
    box(coneStack, 0.32, 0.02, 0.32, 0, 0.01, 0, 0x22262b, { rough: 0.9 });
    holoTag(coneStack, "Cones — not yet out", 0, 0.78, 0, { css: "#ef8f4a", w: 0.42 });
    reg(hits, coneStack, "cone-stack");

    // Where the taper starts: upstream of the truck, on the lane being closed.
    const taper = group(g, 3.9, 0, 1.2);
    for (let i = 0; i < 3; i++) {
      box(taper, 0.5, 0.008, 0.12, -0.3 + i * 0.35, 0.026, 0, 0x3bc9b0,
        { emissive: 0x3bc9b0, ei: 1.2, rough: 0.4, cast: false });
    }
    holoTag(taper, "Taper starts here", 0, 0.5, 0, { css: "#3bc9b0", w: 0.38 });
    reg(hits, taper, "taper-point");

    // The cones themselves, parked on the verge until the taper is run.
    const coneRow = [];
    for (let i = 0; i < 5; i++) {
      const c = cone(g, 1.35 + i * 0.22, 3.2, { color: 0xe4622a });
      c.visible = false;
      coneRow.push(c);
    }
    const laneTrap = box(g, 1.0, 1.0, 1.0, 4.7, 0.9, -0.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Work over the open lane?", 4.7, 1.55, -0.6, { css: "#f0645b", w: 0.5 });
    reg(hits, laneTrap, "open-lane");

    // The stray vehicle, which only exists once the taper is breached.
    const strayCar = group(g, 7.5, 0, 0.2, Math.PI / 2);
    slab(strayCar, 1.7, 0.5, 0.82, 0, 0.5, 0, 0x8a2f2f, { radius: 0.12, rough: 0.35, metal: 0.5 });
    slab(strayCar, 0.95, 0.38, 0.78, -0.05, 0.88, 0, 0x6f2626, { radius: 0.1, rough: 0.3, metal: 0.4 });
    for (const [wx, wz] of [[-0.55, -0.42], [-0.55, 0.42], [0.55, -0.42], [0.55, 0.42]]) {
      cyl(strayCar, 0.2, 0.2, 0.14, wx, 0.2, wz, 0x15181b, { rough: 0.9, seg: 12 }).rotation.x = Math.PI / 2;
    }
    strayCar.visible = false;

    // ------------------------------------------------------------- the crew
    const flagger = standingFigure(g, 4.25, 2.65, { ry: 3.4, cloth: 0x2f6f8c, vest: 0xef8f4a, helmet: 0xf2f2f2 });
    box(flagger, 0.03, 0.55, 0.03, 0.26, 1.35, 0.06, 0x8b949d, { rough: 0.5, metal: 0.5 });
    decal(flagger, 0.24, 0.24, 0.26, 1.72, 0.07, (cx, w, h) => {
      cx.fillStyle = "#c3342c"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#ffffff"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.26)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("STOP", w / 2, h / 2);
    }, { px: 128, rough: 0.7 });
    holoTag(g, "Flagger", 4.25, 2.15, 2.65, { css: "#ef8f4a", w: 0.24 });
    // The flagger's post: the advance sign and the spare paddle they work
    // from. Standing beside it rather than inside it, which is also how the
    // layout checker reads a figure that has somewhere to be.
    const flaggerPost = group(g, 3.5, 0, 3.05, -0.4);
    box(flaggerPost, 0.5, 0.04, 0.32, 0, 0.02, 0, 0x2b3138, { rough: 0.8 });
    cyl(flaggerPost, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    decal(flaggerPost, 0.42, 0.42, 0, 1.32, 0.012, (cx, w, h) => {
      cx.fillStyle = "#e8792a"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#1b1e22"; cx.lineWidth = Math.max(3, h * 0.035);
      cx.strokeRect(h * 0.07, h * 0.07, w - h * 0.14, h - h * 0.14);
      cx.fillStyle = "#1b1e22"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("FLAGGER", w / 2, h * 0.4);
      cx.fillText("AHEAD", w / 2, h * 0.6);
    }, { px: 192, rough: 0.7 });
    holoTag(flaggerPost, "Flagger's post", 0, 1.78, 0.02, { css: "#ef8f4a", w: 0.34 });
    reg(hits, flaggerPost, "flagger-station");

    standingFigure(g, -2.95, 3.95, { ry: 2.6, cloth: 0x2b3138, vest: 0x3bc9b0, helmet: 0xf2f2f2 });
    holoTag(g, "Ground worker", -2.95, 2.05, 3.95, { css: "#3bc9b0", w: 0.3 });

    // ------------------------------------------------------- the make-ready print
    const print = holoPanel(g, 0.6, 0.44, 3.15, 1.6, -0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#3bc9b0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("MAKE-READY · JOINT USE 41-6 TO 41-7", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("PLACE AND LASH 144F", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Supply space: utility — qualified line worker only",
       "Separation to comms: per NESC, as made ready",
       "Existing strand — bond and prove before placing",
       "Sag and road crossing: as the make-ready sheet",
       "Lane closure and taper before the boom moves",
       "Secondary drop on 41-6 — confirm before swinging"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: -0.9 });
    reg(hits, print, "make-ready-print");

    for (let i = 0; i < 2; i++) barrierPanel(g, -3.4 + i * 1.4, 2.6, { color: 0xef8f4a });

    const dust = particles(g, 18, 0xc8ccd0, { size: 0.03, life: 1.4, additive: false, opacity: 0.16 });
    dust.position.set(0, 0.4, 1.4);

    // -------------------------------------------------------------- run state
    let lashing = false, lasherT = 0, boomUp = false, breach = 0, dropClose = 0;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(1.0, 2.4, -1.4),

      onStepComplete(step) {
        if (step.id === "traffic") {
          // The cones really go out, in a taper running upstream.
          coneRow.forEach((c, i) => {
            c.visible = true;
            c.position.set(1.3 + i * 0.68, 0, 1.9 - i * 0.18);
          });
          coneStack.visible = false;
        }
        if (step.id === "setup") {
          for (const leg of Object.values(outriggers)) leg.position.y = -0.24;
          truck.position.y = 0.03;
        }
        if (step.id === "bond") {
          bondClamp.children[0].material = mat(0x59c97b, { rough: 0.5, metal: 0.6 });
        }
        if (step.id === "boom-swing") {
          boomUp = true;
          setBoom(REACH);
        }
        if (step.id === "hang-cable") {
          newCable.visible = true;
          cableEnd.position.set(POLE_X - 0.55, 3.45, POLE_Z + 0.06);
        }
        if (step.id === "lash-run") { lashing = false; lasher.position.x = -1.9; }
        if (step.id === "clamp-in") {
          for (const c of lashClamps.children) c.material = mat(0x59c97b, { rough: 0.45, metal: 0.7 });
        }
        if (step.id === "stow") {
          boomUp = false;
          setBoom(STOW);
        }
        if (step.id === "walk") {
          groundWire.material = mat(0x59c97b, { rough: 0.6, metal: 0.6 });
        }
      },

      onStep(step) {
        lashing = step?.id === "lash-run";
      },

      // Both interruptions change the world in here, not in animate(): the
      // drop really swings into the boom's arc, and the car really comes
      // through the taper and flattens a cone.
      onInterrupt(it) {
        if (it.id === "supply-encroach") {
          dropClose = 1;
          dropLine.position.z += 0.6;
          dropLine.position.x -= 0.25;
          madRing.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 3.4, rough: 0.4 });
        }
        if (it.id === "lane-breach") {
          breach = 1;
          strayCar.visible = true;
          strayCar.position.set(1.6, 0, 0.15);
          if (coneRow[1]) { coneRow[1].rotation.z = 1.4; coneRow[1].position.y = 0.12; }
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "supply-encroach") {
          dropClose = 0;
          dropLine.position.z = dropHome.z;
          dropLine.position.x = dropHome.x;
          madRing.material = madRingHome;
        }
        if (it.id === "lane-breach") {
          breach = 0;
          strayCar.visible = false;
          strayCar.position.set(7.5, 0, 0.2);
          if (coneRow[1]) { coneRow[1].rotation.z = 0; coneRow[1].position.y = 0; }
        }
      },

      onHazard(hitId) {
        if (hitId === "climb-supply" || hitId === "unbonded-strand") {
          madRing.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 3.4, rough: 0.4 });
        }
        if (hitId === "open-lane") beacon.material.emissiveIntensity = 3.4;
      },

      animate(t, dt, session) {
        beacon.material.emissiveIntensity = 1.2 + Math.max(0, Math.sin(t * 4.5)) * 1.6 + breach * 1.4;
        slewLever.rotation.x = Math.sin(t * 1.6) * 0.06 * (boomUp ? 0.3 : 1);
        dust.visible = true;
        dust.userData.step(dt, new THREE.Vector3(0.5, 0.12, 0.1), 0.05, 1.1, 0.25);

        // The lasher really travels the strand while the pull is running.
        if (lashing || session?.step?.id === "lash-run") {
          lasherT = Math.min(1, lasherT + dt * 0.16);
          lasher.position.x = lasherHomeX + (-1.9 - lasherHomeX) * lasherT;
        }
        if (dropClose) {
          dropLine.rotation.y = Math.sin(t * 2.2) * 0.05;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "bond-read") {
          repaint(bondMeter.userData.screen, signFace(`${(gg.t * 12).toFixed(2)}`, {
            bg: "#1a1208", accent: gg.t < 0.18 ? "#59c97b" : "#f0645b", fg: "#f0d0a8", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "reel-tension") {
          repaint(payoff.userData.screen, signFace(`${Math.round(gg.t * 900)}`, {
            bg: "#08201d", accent: gg.t > 0.34 && gg.t < 0.58 ? "#59c97b" : "#f0645b", fg: "#bff0e4", scale: 0.55,
          }));
        }
        void molding; void strand; void seatClamp; void lowerBoom; void brakeLever;
      },
    };
  },
};
