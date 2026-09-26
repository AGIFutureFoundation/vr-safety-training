import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, mudflatFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { forkliftCounterbalance } from "../../../shared/fleet.js";

// SmartCiti.X~ Drum Staging & Compatibility Segregation VR — Environmental
// Monitoring, the hazmat and environmental response block.
//
// A fenced staging apron where incoming waste drums are read, inspected and
// forked into the correct segregation cell before the next truck arrives: a
// flammables cell, an oxidizer cell, a corrosives cell and a spill-kit
// station between them, with a quarantine pad off to the side for anything
// that shows up without a legible label. The learner is the LIUNA hazmat
// laborer running the forklift, with an environmental technician keeping the
// manifest board. The site is generic.

const HZD_ACCENT = 0x78c8a0;
const HZD_CSS = "#78c8a0";

export const SIM_HZ_DRUM_STAGING_AND_COMPATIBILITY_SEGREGATION = {
  id: "hz-drum-staging-and-compatibility-segregation",
  index: "342",
  domain: "Environmental Monitoring",
  trade: "LIUNA hazmat laborer running the forklift on the drum staging apron, with an environmental technician keeping the manifest board",
  category: "Environmental Monitoring",
  weather: "overcast",
  certification: "OSHA 29 CFR 1910.120 HAZWOPER for the apron's own PPE and monitoring practice, 29 CFR 1910.1200 hazard communication for reading the placard before a drum moves, 29 CFR 1910.134 respiratory protection for the fit-tested half-mask worn on the apron, 40 CFR 262 for the generator accumulation-start-date clock the tag begins, and LIUNA Training's hazardous waste worker curriculum",
  name: "Drum Staging & Compatibility Segregation",
  title: simTitle("Drum Staging & Compatibility Segregation VR"),
  tagline: "The apron before the next truck: the compatibility chart read for its cells and aisle minimum, gloves and a face shield on, the delivery checked for a drum that should never have left the dock, the next drum's placard read before it moves, the forklift raised smooth and staged in its own class's cell, a spill pallet confirmed underneath it, the aisle gauged against the chart's minimum, the drum dated for its generator clock, the manifest logged, the spill kit's access checked clear, the extinguisher checked in reach, a PID reading walked and held in band down the row, the crew checked in, and the shift closed",
  accent: HZD_ACCENT,
  accentCss: HZD_CSS,
  parSeconds: 330,
  footprint: 2.9,
  badge: { id: "cell-for-every-drum", name: "A Cell for Every Drum", note: "Every drum staged in its own class's cell, on its own pallet, with the aisle never pinched under the chart's minimum" },

  supportLine: "your LIUNA local's member assistance programme",

  game: system({
    name: "Staging Apron",
    currency: "TAG",
    ranks: ["Apron Hand", "Staging Crew", "Segregation Lead", "Manifest Certified", "Hazmat Laborer Certified"],
    badges: [
      { id: "clean-placement", name: "Clean Placement", note: "Every drum forked into its own class's cell, first time", test: AWARD.stepClean("stage-drum") },
      { id: "chart-held", name: "Chart Held", note: "The PID reading held in band the whole walk down the row", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never a drum forced onto the forks, never a cell doubled up, never the spill kit blocked", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "aisle-on-the-chart", name: "Aisle On The Chart", note: "Aisle gauge committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "apron-cleared-fast", name: "Apron Cleared Fast", note: "Shift log closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "force-swollen-drum": "You lined the forks up on the swollen drum instead of setting it aside. A drum that has bulged has already built pressure past what its own bung was meant to hold, and forks jarring it, rather than an overpack lowered gently around it from the outside, is exactly the kind of shock that turns a slow problem into the moment it lets go.",
    "stage-incompatible-adjacent": "You forked the drum into the gap beside a cell that holds an incompatible class instead of its own cell. The chart's cells exist because an oxidizer and a flammable sitting close enough to share a spill do not stay two separate small problems if either drum ever leaks — the aisle between classes is the only thing keeping a single spill from becoming a reaction.",
    "skip-secondary-containment": "You set the drum straight on bare pavement instead of onto a spill pallet. A pallet is what keeps a slow weep or a punctured bung inside a bermed lip instead of running to the nearest storm drain, and a drum staged without one is a drum whose first failure is also the apron's first release to the yard.",
    "block-spill-kit-access": "You stacked empty pallets in front of the spill kit instead of beside it. The kit is staged at the row for the same reason a fire extinguisher is staged at a door — reachable in the seconds after something starts, not behind a stack of pallets someone now has to move before they can reach the absorbent.",
  },

  lateNotes: {
    "accumulation-tag": "Nothing to date yet — a drum gets its accumulation tag once it is actually staged in its own cell, not before.",
    "spill-pallet": "There is no drum on a pallet to check yet — stage it in its cell first.",
    "aisle-tape": "Nothing to measure yet — the aisle is gauged between cells once the drum in this row is actually staged.",
  },

  steps: [
    {
      id: "segregation-chart", kind: "select", target: "compatibility-chart",
      title: "Read the compatibility chart: cells, aisle minimum and the quarantine pad",
      cue: "Read the chart: which classes may share a row, the aisle's minimum width, the spill-pallet rule, and where an unlabeled drum goes.",
      why: "The compatibility chart is what turns a fenced apron into a set of rules the whole crew is working from — which hazard classes may sit near each other, how wide the aisle between cells has to stay, and that anything without a legible label goes to the quarantine pad rather than into a cell with everyone else's drums. It is read before the first drum moves, because the chart cannot be consulted mid-lift with a load already on the forks.",
    },
    {
      id: "don-ppe", kind: "sequence", anyOrder: true,
      targets: ["chem-gloves", "face-shield"],
      itemNames: { "chem-gloves": "chemical-resistant gloves", "face-shield": "face shield" },
      title: "Chemical gloves and face shield on before the first drum is touched",
      cue: "Chemical-resistant gloves and a face shield on before handling any drum or reading a placard up close.",
      why: "A drum on this apron can be venting something the label has not fully described yet, and gloves and a face shield are what stand between a laborer's skin and eyes and whatever residue is on the bung or the outside of the shell. They go on before the first drum is touched, not after the first one turns out to be dirtier than expected.",
    },
    {
      id: "inspect-delivery", kind: "find", noHint: true,
      targets: ["swollen-drum"],
      itemNames: { "swollen-drum": "swollen drum in the new delivery" },
      itemNotes: { "swollen-drum": "One drum in the new delivery has a visibly domed lid and a bulge low on the shell — it has built internal pressure and is set aside for an overpack, never forked like the rest of the load." },
      title: "Walk the new delivery before any drum is forked",
      cue: "Look over every drum in the new delivery for a bulge, a dome in the lid, or a stain running down the shell before touching any of them.",
      why: "A drum's outside is the only information the apron has before the bung is ever opened, and a bulge or a domed lid is that drum telling you it has already built pressure past what a normal handling plan assumes. Finding it on the walk-through, before the forks are anywhere near it, is what keeps the discovery from happening under load.",
    },
    {
      id: "read-placard", kind: "select", target: "drum-placard",
      title: "Read the next drum's placard before it moves",
      cue: "Read the DOT hazard-class placard on the next drum and match it to the chart's cell for that class.",
      why: "29 CFR 1910.1200 puts the hazard class on the outside of the drum precisely so it can be read before anyone commits to a cell, and reading it now — with the drum still on the ground and the chart still in view — is what keeps the placement decision from being made from memory once the drum is already swinging on the forks.",
    },
    {
      id: "stage-drum", kind: "drag", target: "next-drum",
      title: "Fork the drum smooth into its own class's cell",
      cue: "Raise the drum and set it down inside the cell marked for its own hazard class, clear of the aisle.",
      why: "The cell the placard named is the only place this drum can go without creating the exact adjacency the compatibility chart exists to prevent, and setting it down inside the cell's own markers — not the gap beside it, not the next cell over — is what keeps today's placement matching the chart tomorrow, when nobody remembers which truck it came off.",
      drag: { to: "flammables-cell", radius: 0.55, missNote: "Not inside the marked cell — the drum's own hazard class has one cell on this chart, and it is set down inside its markers, not in the gap beside them." },
    },
    {
      id: "spill-pallet-check", kind: "select", target: "spill-pallet",
      title: "Confirm the drum is sitting on its spill pallet",
      cue: "Check that the staged drum sits square on the cell's spill pallet, not on the bare apron beside it.",
      why: "A spill pallet is the last line between a slow weep at the bung and a release that reaches the yard's storm drain, and it only works if the drum is actually sitting inside its bermed lip rather than beside it. Checking it right after staging, while the drum is still easy to nudge, is cheaper than finding it off the pallet during the next inspection.",
    },
    {
      id: "aisle-gauge", kind: "gauge", target: "aisle-tape",
      title: "Gauge the aisle against the chart's minimum",
      cue: "Measure the aisle between this cell and the next and commit the reading once it settles inside the chart's band.",
      why: "An aisle pinched narrower than the chart's minimum is an aisle that no longer gives a forklift room to set the next drum down without clipping the row already staged, and it is measured now, with the tape held steady until the reading settles, rather than eyeballed once the whole row is full and harder to change.",
      gauge: { label: "AISLE", speed: 0.65, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the chart's minimum — hold the tape steady at the narrowest point between the cells, not at the open end, until the reading stops moving." },
    },
    {
      id: "date-tag", kind: "select", target: "accumulation-tag",
      title: "Tag the drum with its accumulation start date",
      cue: "Write today's date on the drum's accumulation tag the moment it is staged in its cell.",
      why: "40 CFR 262 runs a generator's accumulation clock from the day a drum is actually staged, and a tag written late is a clock that starts wrong for the one document — the manifest — that has to account for exactly how long each drum sat on this apron.",
    },
    {
      id: "manifest-log", kind: "select", target: "manifest-board",
      title: "Log the drum on the manifest board",
      cue: "Record the drum's class, its cell and its accumulation date on the manifest board before moving to the next one.",
      why: "The manifest board is how the environmental technician running the apron knows, without walking every cell, exactly what is staged where and since when — the same information the hauler will ask for the day this drum actually leaves. A drum staged but never logged is a drum the manifest cannot account for.",
    },
    {
      id: "spill-kit-check", kind: "select", target: "spill-kit-station",
      title: "Check the spill kit is clear to reach",
      cue: "Walk to the spill kit and confirm nothing is stacked in front of it before moving to the next drum.",
      why: "A spill kit staged at the row is only as useful as the seconds it takes to actually reach it, and checking that path now, before the apron fills up with the day's deliveries, is what keeps a stack of empty pallets from becoming the reason absorbent arrives too late for a weep that started small.",
    },
    {
      id: "extinguisher-check", kind: "find", noHint: true,
      targets: ["extinguisher-mount"],
      itemNames: { "extinguisher-mount": "extinguisher on its mount" },
      itemNotes: { "extinguisher-mount": "The extinguisher is easy to lose track of against the apron's own clutter — found on its mount, its gauge checked charged, before the apron is logged ready for the next delivery." },
      title: "Find the extinguisher and check it is staged and charged",
      cue: "Look along the fence line for the extinguisher and check its gauge and its mount before logging the apron ready for the next delivery.",
      why: "The flammables cell is the one part of this apron where a small fire has the shortest path to something much worse, and an extinguisher confirmed charged and in its mount now is the difference between reaching for it and reaching for an empty bracket the one time it matters.",
    },
    {
      id: "smooth-lift", kind: "hold", target: "forklift-controls", seconds: 5,
      title: "Hold the lift control smooth on the next raise",
      cue: "Hold the forklift's lift control steady through the full raise, without a jerk partway up.",
      why: "A drum that shifts on the forks partway through a raise is a drum whose bung, cap or seam just took a load it was never staged to take, and holding the lift control smooth through the whole motion — rather than bumping it in short stabs — is what keeps a legal drum from becoming a leaking one on the ride to its cell.",
      holdBreakNote: "The lift control let go partway up — the drum jolted on the forks. Hold the raise smooth from the ground to the carry height in one motion.",
    },
    {
      id: "pid-walk", kind: "track", target: "pid-meter", seconds: 6,
      title: "Walk the row holding the PID reading in band",
      cue: "Walk the length of the staged row with the PID meter, keeping its reading inside the safe band the whole way.",
      why: "A vapor reading taken once at the gate does not describe the whole row once ten drums are staged along it, and walking the row with the meter held out, watching the number rather than the drums, is what catches a reading climbing near one cell before it is the only thing anyone notices.",
      track: { start: 0.3, green: [0.2, 0.42], rise: 0.42, fall: 0.3, drift: 0.14, label: "PID", readout: (v) => (v < 0.2 ? "low" : v > 0.42 ? "climbing" : "in band") },
      holdBreakNote: "The reading ran past the safe band while the walk continued anyway — a PID climbing along the row is answered by stopping and rechecking, not by finishing the walk first.",
    },
    {
      id: "crew-checkin", kind: "select", target: "tech-radio",
      title: "Check in with the environmental technician",
      cue: "Call the technician running the manifest board: cells current, aisle on the chart, spill kit and extinguisher both checked.",
      why: "The technician's own manifest is only as good as what the apron actually radios in, and a laborer who logs it out loud rather than assuming the board already reflects the day's work is what keeps the two records — the forklift's and the desk's — from drifting apart by the end of the shift.",
    },
    {
      id: "close-shift-log", kind: "select", target: "shift-log",
      title: "Close the apron log for the shift",
      cue: "Record every drum staged today, the swollen one set aside for overpack, and confirm every cell against the chart before signing off.",
      why: "The shift log is what the next crew reads before the next truck backs up to the apron, and a drum set aside for overpack that never made the log is a drum the next shift finds by hand instead of by the page that was supposed to warn them.",
    },
  ],

  interrupts: [
    {
      id: "unlabeled-drum-arrival",
      kind: "An unlabeled drum shows up in the middle of the shift",
      after: "read-placard", delay: 2, seconds: 14,
      alert: "A drum with no legible placard has just come off the truck, mixed in with the rest of today's delivery.",
      cue: "Break off and fork the unlabeled drum straight to the quarantine pad — it does not get a cell until it is identified.",
      target: "quarantine-pad",
      why: "A drum with no legible placard is a drum whose hazard class nobody on the apron actually knows, and staging it in any cell — even the one that looks most likely — is a guess the compatibility chart was built specifically to remove from this job. The quarantine pad holds it apart until somebody can identify it properly, which is the only place it can go until then.",
      missNote: "The unlabeled drum went into a cell with the others anyway; it sat there unidentified next to drums whose class was actually known, which is the exact adjacency the chart exists to prevent.",
      wrongNote: "The quarantine pad — an unidentified drum gets held apart, not guessed into whichever cell looks closest.",
    },
    {
      id: "drum-leak-during-move",
      kind: "A drum starts weeping at the bung mid-move",
      after: "aisle-gauge", delay: 2, seconds: 12,
      alert: "The drum on the forks has started weeping at the bung — a thin line is already running down the shell.",
      cue: "Set it down where it stands and get the spill kit open — the aisle gauge waits.",
      target: "spill-kit-station",
      why: "A weep that started on the forks does not wait for the aisle to finish being measured, and the spill kit staged at the row exists for exactly this moment — absorbent down before the line reaches the apron's own drain, not after the tape measure is put away first.",
      missNote: "The aisle gauge finished first while the weep kept running; by the time the spill kit opened, the line had already reached the nearest drain grate.",
      wrongNote: "The spill kit — a weeping drum is answered with absorbent immediately, not with finishing the measurement already underway.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, HZD_ACCENT);

    // ---------------------------------------------------------- gravel apron
    const pad = box(g, 7.0, 0.06, 5.6, 0, 0.03, 0, 0xffffff, { rough: 0.98 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#4a4736", base2: "#3b3829", cracks: 16 }), { repeat: 4, px: 512 }), { rough: 0.98, metal: 0.0, color: 0xc4bb9a });

    const hzdDrum = (parent, x, z, color, o = {}) => {
      const p = group(parent, x, 0, z);
      cyl(p, 0.29, 0.29, 0.86, 0, 0.43, 0, color, { rough: 0.55, metal: 0.25, finish: "painted", seg: 16 });
      cyl(p, 0.3, 0.3, 0.04, 0, 0.86, 0, 0x22262b, { rough: 0.5, metal: 0.4, seg: 16 });
      cyl(p, 0.3, 0.3, 0.04, 0, 0.02, 0, 0x22262b, { rough: 0.5, metal: 0.4, seg: 16 });
      decal(p, 0.5, 0.3, 0.301, 0.46, 0, signFace(o.label ?? "CLASS 3", { bg: "#241a10", accent: HZD_CSS, fg: "#f4ecd8", scale: 0.6 }), { px: 192 });
      return p;
    };

    // --------------------------------------------------------- staging cells
    const cellDef = [
      { x: -2.1, z: -1.6, color: 0xd2312b, label: "FLAMMABLE", id: "flammables-cell" },
      { x: -0.6, z: -1.6, color: 0xe8b02e, label: "OXIDIZER", id: "oxidizer-cell" },
      { x: 0.9, z: -1.6, color: 0x59c97b, label: "CORROSIVE", id: "corrosive-cell" },
    ];
    const cellMarkers = {};
    for (const c of cellDef) {
      const cell = group(g, c.x, 0, c.z);
      box(cell, 1.15, 0.02, 1.15, 0, 0.01, 0, c.color, { rough: 0.75, opacity: 0.5, transparent: true });
      holoTag(cell, c.label + " CELL", 0, 0.5, 0, { css: HZD_CSS, w: 0.42 });
      cellMarkers[c.id] = cell;
    }
    // The flammables cell is the drag target used by stage-drum.
    reg(hits, cellMarkers["flammables-cell"], "flammables-cell");

    // Two drums already staged correctly in the other cells, for scene depth.
    const pallet1 = box(g, 0.75, 0.08, 0.75, -0.6, 0.04, -1.6, 0x2b2f34, { rough: 0.85 });
    hzdDrum(g, -0.6, -1.6, 0xe8b02e, { label: "CLASS 5.1" });
    const pallet2 = box(g, 0.75, 0.08, 0.75, 0.9, 0.04, -1.6, 0x2b2f34, { rough: 0.85 });
    hzdDrum(g, 0.9, -1.6, 0x59c97b, { label: "CLASS 8" });
    void pallet1; void pallet2;

    // The spill pallet under the flammables cell, and its check target.
    const spillPallet = box(g, 0.78, 0.09, 0.78, -2.1, 0.045, -1.6, 0x2b2f34, { rough: 0.8, metal: 0.2 });
    reg(hits, spillPallet, "spill-pallet");

    // The next drum to stage: on the marshalling spot, ready to be forked.
    const nextDrum = hzdDrum(g, 2.6, 1.3, 0x2b3138, { label: "CLASS 3" });
    reg(hits, nextDrum, "next-drum");
    const placardHit = box(nextDrum, 0.06, 0.3, 0.06, 0.32, 0.46, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(nextDrum, "read placard", 0.4, 0.9, 0, { css: HZD_CSS, w: 0.3 });
    reg(hits, placardHit, "drum-placard");

    // The swollen drum, hidden in the delivery, and the decoy hazard beside it.
    const swollen = group(g, 3.3, 0, 2.0);
    const swollenShell = cyl(swollen, 0.3, 0.29, 0.9, 0, 0.45, 0, 0x8a6a2a, { rough: 0.6, metal: 0.2, seg: 16 });
    swollenShell.scale.set(1.08, 1, 1.08);
    const swollenLid = ball(swollen, 0.31, 0, 0.92, 0, 0x8a6a2a, { rough: 0.6 });
    swollenLid.scale.set(1, 0.3, 1);
    holoTag(swollen, "swollen — set aside", 0, 1.15, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, swollen, "swollen-drum");
    const forceHit = box(g, 0.5, 0.3, 0.5, 3.3, 0.15, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "fork it anyway?", 3.3, 0.55, 1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, forceHit, "force-swollen-drum");

    // Incompatible-adjacency decoy: a gap right beside the flammables cell that
    // reads like an easy drop, but sits against the oxidizer cell's edge.
    const badGap = box(g, 0.5, 0.05, 0.5, -1.25, 0.025, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stage it here?", -1.25, 0.4, -1.6, { css: "#d2312b", w: 0.34 });
    reg(hits, badGap, "stage-incompatible-adjacent");

    // Bare-pavement decoy for the secondary-containment hazard.
    const barePatch = box(g, 0.6, 0.03, 0.6, -2.9, 0.015, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the pallet?", -2.9, 0.35, -0.6, { css: "#d2312b", w: 0.44 });
    reg(hits, barePatch, "skip-secondary-containment");

    // ----------------------------------------------------------- forklift
    const truck = forkliftCounterbalance(g, 2.0, 0, 0.1, { ry: -1.6, livery: { colour: 0x2b3138, fleetName: "SMARTCITI FLEET", unitNumber: "F-22" } });
    const { mast } = truck.userData.parts ?? {};
    const liftControl = mast ?? truck;
    holoTag(truck, "lift control — hold smooth", 0, 2.2, 0, { css: HZD_CSS, w: 0.5 });
    reg(hits, liftControl, "forklift-controls");

    // -------------------------------------------------------------- aisle tape
    const aisleGauge = instrument(g, -0.15, 0.9, -2.5, { ry: 0, idle: "-- %", color: HZD_ACCENT, w: 0.1, d: 0.14 });
    holoTag(aisleGauge, "aisle tape", 0, 0.18, 0, { css: HZD_CSS, w: 0.28 });
    reg(hits, aisleGauge, "aisle-tape");

    // ------------------------------------------------------------- quarantine pad
    const quarantine = group(g, 3.5, 0, -1.9);
    const qRing = torus(quarantine, 0.3, 0.012, 0, 0.02, 0, 0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    qRing.rotation.x = Math.PI / 2;
    holoTag(quarantine, "quarantine pad", 0, 0.32, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, qRing, "quarantine-pad");

    // ------------------------------------------------------------ spill kit
    const spillKit = group(g, -3.2, 0, 0.6, 0.3);
    box(spillKit, 0.5, 0.4, 0.36, 0, 0.2, 0, 0xf2c14b, { rough: 0.6 });
    box(spillKit, 0.53, 0.03, 0.39, 0, 0.41, 0, 0x2b2b30, { rough: 0.5 });
    holoTag(spillKit, "spill kit", 0, 0.6, 0, { css: HZD_CSS, w: 0.3 });
    reg(hits, spillKit, "spill-kit-station");
    const blockingPallets = box(g, 0.7, 0.1, 0.7, -3.2, 0.05, 1.25, 0x8a7040, { rough: 0.8 });
    holoTag(g, "stack pallets here?", -3.2, 0.35, 1.25, { css: "#d2312b", w: 0.5 });
    reg(hits, blockingPallets, "block-spill-kit-access");

    // -------------------------------------------------------- extinguisher
    const extPost = group(g, -3.2, 0, -0.7);
    cyl(extPost, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const ext = cyl(extPost, 0.06, 0.08, 0.32, 0, 1.0, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(extPost, "extinguisher", 0, 1.25, 0, { css: HZD_CSS, w: 0.34 });
    reg(hits, ext, "extinguisher-mount");

    // ------------------------------------------------------------- PID meter
    const pidPost = group(g, 1.5, 0, -0.4);
    const pidMeter = instrument(pidPost, 0, 0.9, 0, { ry: 0.5, idle: "-- PID", color: HZD_ACCENT, w: 0.1, d: 0.16 });
    holoTag(pidMeter, "PID meter", 0, 0.16, 0, { css: HZD_CSS, w: 0.28 });
    reg(hits, pidMeter, "pid-meter");

    // ------------------------------------------------------------- tools & PPE
    const chest = toolChest(g, -2.8, 2.3, { ry: 0.3, color: 0x2f4f6f });
    const rack = group(g, -2.3, 0, 2.5, 0.4);
    cyl(rack, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.4, 0.03, 0.03, 0, 1.25, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const glovesProp = group(rack, -0.1, 0.9, 0);
    box(glovesProp, 0.16, 0.22, 0.02, 0, 0, 0, 0xe8d23a, { rough: 0.8 });
    holoTag(rack, "chemical gloves", -0.1, 1.1, 0, { css: HZD_CSS, w: 0.32 });
    reg(hits, glovesProp, "chem-gloves");
    const shieldProp = group(rack, 0.14, 0.9, 0);
    box(shieldProp, 0.2, 0.24, 0.01, 0, 0, 0, 0xdfe4e8, { rough: 0.3, opacity: 0.6, transparent: true });
    holoTag(rack, "face shield", 0.14, 1.1, 0, { css: HZD_CSS, w: 0.28 });
    reg(hits, shieldProp, "face-shield");

    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 4 · TECH", color: HZD_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "technician radio", 0, 0.16, 0, { css: HZD_CSS, w: 0.36 });
    reg(hits, radio, "tech-radio");
    const tagPad = decal(chest, 0.2, 0.24, 0.14, 0.79, 0.05, paperFace("ACCUM. DATE", ["—"], { bg: "#f2e0a0", band: HZD_CSS }), { px: 128 });
    tagPad.rotation.x = -Math.PI / 2;
    reg(hits, tagPad, "accumulation-tag");

    // -------------------------------------------------------------- paperwork
    const chart = holoPanel(g, 0.95, 0.66, -3.4, 1.35, -0.6, (cx, w, h) => {
      cx.fillStyle = "#0b1a12"; cx.fillRect(0, 0, w, h); cx.fillStyle = HZD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("COMPATIBILITY CHART", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["Flammable · Oxidizer · Corrosive — separate cells", "Aisle minimum: chart's own band on the gauge",
        "Every drum on its own spill pallet", "No legible placard → quarantine pad",
        "Spill kit and extinguisher kept clear", "Accumulation date on staging, not before"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.5, accent: HZD_ACCENT });
    reg(hits, chart, "compatibility-chart");

    const board = holoPanel(g, 0.6, 0.42, -1.0, 1.3, 2.3, (cx, w, h) => {
      cx.fillStyle = "#0b1a12"; cx.fillRect(0, 0, w, h); cx.fillStyle = HZD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("MANIFEST BOARD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["Class: —", "Cell: —", "Logged: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.5, accent: HZD_ACCENT });
    reg(hits, board, "manifest-board");

    const log = holoPanel(g, 0.6, 0.42, 1.6, 1.3, -1.8, (cx, w, h) => {
      cx.fillStyle = "#0b1a12"; cx.fillRect(0, 0, w, h); cx.fillStyle = HZD_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f5e6"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eefaf3";
      ["Drums staged: —", "Set aside: —", "Cells verified: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: HZD_ACCENT });
    reg(hits, log, "shift-log");

    // ---------------------------------------------------------- perimeter
    cone(g, -3.6, 3.4); cone(g, 3.6, 3.4);
    barrierPanel(g, 0, 3.0, { color: 0xf2c14b, w: 4.6 });

    // ------------------------------------------------------------------ crew
    const tech = standingFigure(g, -0.8, 1.7, { ry: -2.5, cloth: 0x2b3138, vest: HZD_ACCENT, helmet: 0xf2f2f2 });
    holoTag(tech, "environmental technician", 0, 1.95, 0, { css: HZD_CSS, w: 0.44 });
    const driver = standingFigure(g, 1.4, -0.9, { ry: 1.2, cloth: 0x3a3f45, vest: 0xf2c14b, helmet: 0xe8b02e });
    holoTag(driver, "hazmat laborer", 0, 1.95, 0, { css: HZD_CSS, w: 0.32 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.5, 0.9, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "stage-drum") { nextDrum.position.set(-2.1, 0, -1.6); }
        if (step.id === "date-tag") repaint(tagPad, paperFace("ACCUM. DATE", ["today"], { bg: "#f2e0a0", band: "#59c97b" }));
        if (step.id === "manifest-log") {
          repaint(board.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0b1a12"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d8f5e6"; cx.fillText("MANIFEST BOARD", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Class: 3 flammable", "Cell: flammables", "Logged: today"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "aisle-gauge") repaint(aisleGauge.userData.screen, signFace("ON CHART", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "close-shift-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0b1a12"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#d8f5e6"; cx.fillText("SHIFT LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Drums staged: 3", "Set aside: 1 (overpack)", "Cells verified: all"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("APRON CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "unlabeled-drum-arrival") { /* the quarantine ring already glows */ qRing.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 }); }
        if (it.id === "drum-leak-during-move") { spillKit.children[0].material = mat(0xf0645b, { rough: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "unlabeled-drum-arrival") qRing.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4 });
        if (it.id === "drum-leak-during-move") spillKit.children[0].material = mat(0xf2c14b, { rough: 0.6 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "aisle-gauge") repaint(aisleGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "pid-walk" && session.holding) repaint(pidMeter.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v <= 0.42 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY;
      },
    };
  },
};
