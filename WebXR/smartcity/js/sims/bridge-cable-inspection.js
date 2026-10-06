import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bridge Cable Inspection VR — Construction & Structural Trades.
// A suspender rope, walked from the cable traveller: two lanyards live before
// anyone rides the cable out over the water, the traveller's own brakes set
// before the platform is trusted, the rope read twice — once by eye and once
// by a magnetic-flux head that finds what an eye cannot — and the wire count
// carried against the rejection criterion rather than a guess about how bad
// "a few broken wires" really is. What the flux head misses, the socket
// inspection does not: corrosion works from the inside of a socket outward,
// long before it shows on the wire it is holding.

const BCI_ACCENT = 0x7fa8bf;

export const SIM_BRIDGE_CABLE_INSPECTION = {
  id: "bridge-cable-inspection",
  index: "185",
  domain: "Construction",
  trade: "Ironworker — bridge inspection, with the owner's inspector",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "Ironworkers (IW) bridge inspection crew; OSHA 29 CFR 1926 Subpart M fall protection and ANSI/ASSP Z359 fall-arrest systems for 100% tie-off on a moving platform; the National Bridge Inspection Standards (23 CFR 650 Subpart C) and the AASHTO Manual for Bridge Evaluation governing suspender-rope condition rating and the wire-rope rejection criteria",
  name: "Bridge Cable Inspection",
  title: simTitle("Bridge Cable Inspection"),
  tagline: "A suspender rope walked from the traveller: two lanyards live, the brakes set, the wires counted against the rejection criterion, and the finding photographed before the report is signed",
  accent: BCI_ACCENT,
  accentCss: "#7fa8bf",
  parSeconds: 310,
  footprint: 2.5,
  badge: { id: "rope-cleared", name: "Rope Cleared", note: "A suspender rope inspected from the traveller, start to finish, with two lanyards live and the wire count against the rejection criterion" },

  game: system({
    name: "Bridge Inspection Authority", currency: "SPAN",
    ranks: ["Ground Hand", "Cable Rider", "Rope Inspector", "Lead Inspector", "Bridge Inspection Authority Certified"],
    badges: [
      { id: "two-point-live", name: "Two-Point Live", note: "Never rode the cable on one lanyard", test: AWARD.safe },
      { id: "flux-steady", name: "Flux Steady", note: "Held the flux head inside the coupling band the whole pass", test: AWARD.precise(0.72) },
      { id: "clean-finding", name: "Clean Finding", note: "No corrections from the plan to the report", test: AWARD.stepClean("report") },
    ],
    challenges: [
      { id: "rope-clean", name: "Rope Clean", note: "No corrections through the whole inspection", test: AWARD.clean },
      { id: "steady-pass", name: "Steady Pass", note: "Held the flux pass with no dropout", test: AWARD.unbroken },
      { id: "span-inside-par", name: "Span Inside Par", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "unclipped-cable-transfer": "You reached past the traveller's rail toward the cable saddle without the second lanyard engaged. For the length of that reach you were connected to nothing — the whole reason two lanyards ride this cable is so one is always live while the other moves, and a transfer with neither clipped is a transfer with no fall protection at all, over open water.",
    "frayed-lanyard-rack": "That lanyard's stitching has let go at the shock pack. ANSI/ASSP Z359 retires a lanyard on any sign of damage to the webbing or the pack, because a shock absorber that has already started to fail does not announce how much capacity is left in it — it either holds or it does not, and there is no way to tell which from the rack.",
    "loose-tool-on-traveller": "That wrench is sitting untethered on the traveller's grating, over the water. Nothing about a moving platform keeps a loose tool from walking to the low edge on its own — every bump in the ride does a little of the work — and anything that goes over from up here reaches whatever is below with no warning at all.",
    "no-exclusion-below": "There is no marked exclusion zone in the water under the traveller. A boat, a barge, or a work skiff can pass directly beneath a platform that is actively inspecting a suspender rope, and the people below have no way to know that is a bad place to be — the exclusion has to be set and held from up here, because nobody down there can see it coming.",
  },

  lateNotes: {
    "flux-head": "The flux head doesn't go on the rope until both lanyards are live and the brakes are set — the traveller has to be trusted before the inspection starts, not during it.",
    "report-panel": "The report gets the wire count and the photograph together, not before either one exists.",
  },

  interrupts: [
    {
      id: "wind-gust-limit",
      kind: "Wind",
      after: "flux-pass", delay: 4, seconds: 13,
      alert: "A gust off the water has pushed the traveller past its posted wind limit — you can feel it rocking on the cable.",
      cue: "Park it on the brake before you touch anything else.",
      target: "traveller-brake",
      why: "A cable traveller is a suspended access platform, not a fixed one, and every suspended platform carries a wind rating past which it stops being predictable to ride — the manufacturer sets that limit because a gust strong enough to rock the platform is strong enough to swing it into the cable, the tower, or the rope it is meant to be inspecting. The brake is what turns a platform still exposed to the wind into one that is at least not also moving on its own, and it is the first thing that happens before the gust decides where the traveller goes next.",
      missNote: "The pass carried on with the traveller rocking past its wind limit. An inspection reading taken from a platform that will not hold still is a reading nobody downstream can trust, and the platform itself was one harder gust from swinging into the tower.",
      wrongNote: "It is the brake. Nothing about the rope matters while the platform underneath you is still moving in the wind.",
    },
    {
      id: "tool-over-rail",
      kind: "Dropped object",
      after: "photograph", delay: 3, seconds: 11,
      alert: "The camera bag has worked its way to the traveller's low rail and is easing toward the edge, straight over the water below.",
      cue: "Get it tethered before it goes over.",
      target: "tool-tether",
      why: "Anything not clipped down on a moving platform finds the low edge eventually — the traveller never sits perfectly level, and every small correction on the cable nudges whatever is loose a little further toward whichever rail is downhill. Over water there is no ground crew to shout a warning and no hard hat below that changes the outcome; the only real control is tethering it before the platform ever moves.",
      missNote: "The bag went over the rail. It reached the water long before anyone below could have seen it coming, and everything the report needed from that camera went with it.",
      wrongNote: "It is the tool tether. Nothing else on this platform matters while gear is sliding toward open water.",
    },
  ],

  steps: [
    {
      id: "plan", kind: "select", target: "inspection-plan",
      title: "Read the bridge inspection plan",
      cue: "Confirm which suspender rope is due this cycle and what triggered the inspection.",
      why: "The National Bridge Inspection Standards set the cycle this rope is due on, and the plan is what tells the crew which rope, which socket, and what condition rating triggered a closer look this time rather than the routine walk-by. Riding out to the wrong rope, or riding out without knowing what the last report flagged, means the inspection answers a question nobody actually asked.",
    },
    {
      id: "anchor-clip", kind: "select", target: "traveller-anchor",
      title: "Clip the primary lanyard to the traveller anchor",
      cue: "Connect your fall-arrest lanyard to the traveller's dedicated anchor point before boarding.",
      why: "The traveller's anchor is rated for a fall-arrest connection and inspected before the shift the way any anchor under ANSI/ASSP Z359 has to be — it is the one point on this platform a rider's life is allowed to depend on. Boarding before it is clipped means trusting the platform's rail and grating to do a job neither one is rated for.",
    },
    {
      id: "second-lanyard", kind: "select", target: "second-lanyard-anchor",
      title: "Clip the second lanyard to its own anchor",
      cue: "Connect the second lanyard to the independent anchor point so you are never down to one connection.",
      why: "One lanyard is a single point of failure the moment it is unclipped to move to something else — the second lanyard, on its own anchor, is what makes a transfer along the cable a hundred percent tie-off instead of a hopeful one. OSHA 1926 Subpart M and the union's own bridge-crew practice both start from the same fact: a rider with two independent connections can always keep one live while the other moves.",
    },
    {
      id: "brake-check", kind: "select", target: "traveller-brake",
      title: "Confirm the traveller's brakes are set",
      cue: "Check the brake wheel is engaged and the traveller is holding its position on the cable before work starts.",
      why: "A traveller that has not been proven to hold on the cable is a platform that might still be drifting when the crank lets go of it — the brake is what the crank hands off to, and it is checked before the ride starts rather than assumed from the fact that the platform has not moved yet. It is also the control this whole inspection comes back to the moment the wind does something the crew did not plan for.",
    },
    {
      id: "advance-traveller", kind: "turn", target: "cable-crank",
      title: "Crank the traveller into position",
      cue: "Turn the hand crank to move the traveller along the cable until it sits under the suspender socket.",
      why: "The traveller only reaches the rope by riding the main cable itself, hand over hand on a geared crank rather than a powered drive, because a hand crank is a control the rider can stop instantly and a motor is not. Overshooting the socket and cranking back costs time; overshooting it and grabbing for the rope to correct costs a hand off the crank while the platform is still moving.",
      turn: { turns: 1.2, axis: "z", label: "CABLE CRANK", readout: (t) => `${Math.round(t * 100)}% to socket` },
    },
    {
      id: "visual-walk", kind: "find", noHint: true,
      targets: ["corroded-socket", "broken-strand-visible", "water-stain-band"],
      itemNames: {
        "corroded-socket": "corrosion at the rope socket",
        "broken-strand-visible": "a broken strand, visible by eye",
        "water-stain-band": "a discoloured band lower on the rope",
      },
      itemNotes: {
        "corroded-socket": "The socket where this rope terminates into the cable band shows rust bleeding out from the seam — corrosion here works on the inside of the socket long before it ever marks the wire, and by the time it is visible from outside the strength it has already taken is not visible at all.",
        "broken-strand-visible": "A strand has let go far enough that the wires are standing proud of the lay. One broken strand seen by eye means there are almost always more that the eye alone will not find, which is exactly why the flux head follows the visual walk rather than replacing it.",
        "water-stain-band": "A band lower on the rope is a different colour than the wire above and below it — water has been sitting against the strand there rather than running off, and that is where corrosion starts on a rope that looks sound everywhere else.",
      },
      title: "Walk the rope visually before it goes on flux",
      cue: "Look the rope over top to bottom and click the three things a trained eye catches before any instrument does.",
      why: "The visual walk-down catches what a trained eye is good at — a socket that has started to weep rust, a strand that has actually parted, a band where water sits instead of shedding — before the flux head ever goes on the wire. AASHTO's condition-rating guidance treats the visual inspection as its own pass rather than a formality ahead of the instrument, because the two methods find different things and neither one substitutes for the other.",
    },
    {
      id: "flux-pass", kind: "track", target: "flux-head", seconds: 7,
      title: "Run the magnetic-flux head down the rope",
      cue: "Hold the flux head against the rope and keep it in steady contact for the full pass.",
      why: "A magnetic-flux head finds broken wires inside the rope's core that no visual walk-down will ever see, because a flux reading reports on wire that a socket, a wrap, or the rope's own outer strands are hiding from the eye. The reading only means anything if the head keeps steady coupling with the wire the whole length of the pass — lift it off for a stretch and that stretch of rope goes back into service unread rather than cleared.",
      track: {
        start: 0.1, green: [0.38, 0.6], rise: 0.5, fall: 0.45, drift: 0.12, label: "FLUX HEAD COUPLING",
        readout: (v) => (v < 0.38 ? "lifting off the wire" : v > 0.6 ? "pressed off-axis" : "steady coupling"),
      },
      holdBreakNote: "Coupling dropped out of band — that stretch of rope was not actually read by the instrument, whatever the pass log says.",
    },
    {
      id: "wire-count", kind: "gauge", target: "wire-counter",
      title: "Count the broken wires against the rejection criterion",
      cue: "Read the wire counter and commit the count against the rope's rejection criterion.",
      why: "A wire rope is rated to lose a certain number of wires in a given length before the AASHTO Manual for Bridge Evaluation calls it rejected, and that number is a count, not an impression — 'a few broken wires' means something different to every person who says it. The counter turns the flux pass and the visual walk into the one number the report and the next inspection cycle can actually compare against.",
      gauge: {
        label: "BROKEN WIRES / LENGTH", speed: 0.62, green: [0.0, 0.18],
        readout: (t) => `${Math.round(t * 24)} wires`,
        missNote: "That count is past the rejection criterion for this rope. It gets flagged for the engineer, not rounded down to 'acceptable' because the rest of the rope looks fine.",
      },
    },
    {
      id: "mark-finding", kind: "drag", target: "finding-tag",
      title: "Tag the finding at the socket",
      cue: "Carry the finding tag from the tool rack to the corroded socket and mark it in place.",
      why: "A finding that lives only in someone's memory of where it was on the rope is a finding the next crew has to relocate from scratch. The tag stays on the rope at the exact point of the defect so the engineer reviewing the report, and the crew that comes back to re-inspect it, are looking at the same six inches of wire the flux head actually read.",
      drag: { to: "corroded-socket", radius: 0.3, missNote: "Not on the socket — the tag has to sit on the actual finding, not somewhere near it on the rope." },
    },
    {
      id: "photograph", kind: "select", target: "camera",
      title: "Photograph the tagged finding",
      cue: "Photograph the socket with the tag in frame before you leave it.",
      why: "A written description of corrosion is one inspector's judgment call; a photograph with the tag in frame is evidence the engineer reviewing the report can judge for themselves. The photograph is taken with the tag already placed so the picture and the physical marker point at exactly the same six inches of rope.",
    },
    {
      id: "report", kind: "select", target: "report-panel",
      title: "Log the finding in the inspection report",
      cue: "Enter the wire count, the socket condition and the photograph reference into the report.",
      why: "The report is the only thing that leaves this platform — the rope stays where it is, the traveller goes back to the tower, and everything the owner's inspector and the engineer act on afterward comes from what got written down here. A finding that was seen but never logged is, as far as the bridge's maintenance record is concerned, a finding that never happened.",
    },
    {
      id: "retract-traveller", kind: "turn", target: "cable-crank",
      title: "Crank the traveller back to the tower",
      cue: "Turn the hand crank to bring the traveller back off the span to the tower platform.",
      why: "The return ride carries the same rule as the ride out: hand over hand on the crank, not released to gravity or momentum, because a traveller allowed to freewheel back down a sagging cable picks up speed with nothing but the brake to stop it, and the brake is meant to be a parking control, not a way to arrest a runaway platform.",
      turn: { turns: 1.2, axis: "z", label: "CABLE CRANK — RETURN", readout: (t) => `${Math.round(t * 100)}% to tower` },
    },
    {
      id: "unclip-descend", kind: "sequence",
      targets: ["second-lanyard-anchor", "traveller-anchor"],
      itemNames: { "second-lanyard-anchor": "second lanyard", "traveller-anchor": "primary lanyard" },
      title: "Unclip in reverse order at the tower platform",
      cue: "Unclip the second lanyard first, then the primary, only once you are standing on the tower platform itself.",
      why: "Unclipping happens in the reverse of how the rider clipped in, and only once both feet are on a platform that needs no lanyard at all — the second lanyard comes off first because the primary is the one connection kept live the longest, right up until there is solid decking underfoot and nothing left to fall from.",
      outOfOrderNote: "Second lanyard first, primary last — unclipping the primary while the second is still your only connection defeats the reason there were ever two.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BCI_ACCENT);

    // -------------------------------------------------------------- plaza + water
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#232a30", base2: "#1b2126" }), { repeat: 4, px: 320 });
    const floor = box(g, 5.0, 0.1, 2.6, 0, -0.05, 1.35, 0x232a30, { rough: 0.92 });
    floor.material = texturedMat(floorTex, { rough: 0.92, color: 0x232a30 });

    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0c2531", mid: "#0f2e3a", base2: "#0a1f29" }), { repeat: 4, px: 256 });
    const water = box(g, 6.4, 0.04, 4.8, 0, -0.55, -1.55, 0x0f2e3a, { rough: 0.2, metal: 0.28, opacity: 0.92, transparent: true, cast: false, receive: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });

    // Plaza-edge parapet, right at the shoreline the bridge steps off from.
    for (let i = -2; i <= 2; i++) box(g, 0.9, 0.5, 0.12, i * 1.0, 0.25, 0.05, 0x545c63, { rough: 0.6, metal: 0.3 });
    box(g, 5.0, 0.06, 0.12, 0, 0.53, 0.05, 0x8fa9c4, { rough: 0.5, metal: 0.3 });

    // -------------------------------------------------------------- tower + pier
    const towerX = -0.1, towerZ = -1.4;
    const pier = group(g, towerX, 0, towerZ);
    box(pier, 0.7, 0.5, 0.7, 0, -0.32, 0, 0x555f68, { rough: 0.85, finish: "concrete", tile: 1.4 });
    const towerH = 3.15;
    for (const lx of [-0.28, 0.28]) {
      cyl(pier, 0.045, 0.05, towerH, lx, towerH / 2 - 0.32, 0, CITY.darkSteel, { rough: 0.45, metal: 0.6, seg: 10 });
    }
    for (let i = 0; i < 8; i++) {
      const y = -0.2 + i * 0.42;
      box(pier, 0.62, 0.02, 0.02, 0, y, 0, CITY.steel, { rough: 0.5, metal: 0.55 });
      const brace = box(pier, 0.62, 0.02, 0.02, 0, y + 0.21, 0, CITY.steel, { rough: 0.5, metal: 0.55 });
      brace.rotation.z = i % 2 === 0 ? 0.35 : -0.35;
    }
    const saddle = cyl(pier, 0.1, 0.1, 0.5, 0, towerH - 0.32, 0, CITY.darkSteel, { rough: 0.4, metal: 0.65, seg: 14 });
    saddle.rotation.x = Math.PI / 2;
    holoTag(pier, "Cable saddle, tower T-6", 0, towerH - 0.1, 0, { css: "#7fa9c4", w: 0.6 });

    // -------------------------------------------------------------- main cable
    const saddleWorld = [towerX, towerH - 0.32, towerZ];
    const anchorL = [-2.25, 1.05, -1.6], anchorR = [2.25, 1.05, -1.6];
    const cable = hose(g, [
      anchorL, [towerX - 1.1, 1.55, towerZ], saddleWorld, [towerX + 1.1, 1.55, towerZ], anchorR,
    ], 0.05, CITY.darkSteel, { steps: 40, rough: 0.4, metal: 0.65 });
    void cable;
    for (const a of [anchorL, anchorR]) {
      box(g, 0.4, 0.35, 0.4, a[0], a[1] - 0.5, a[2], 0x555f68, { rough: 0.85, finish: "concrete", tile: 1.2 });
    }

    // Cable sag helper — matches the polyline above closely enough for props
    // that need to sit "on" the cable rather than float near it.
    function cableY(x) {
      const t = (x - anchorL[0]) / (anchorR[0] - anchorL[0]);
      const peak = towerH - 0.32;
      const base = anchorL[1];
      // Two parabolic humps either side of the tower, matching the polyline's shape.
      const half = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
      return base + (peak - base) * (1 - (1 - half) * (1 - half));
    }

    // -------------------------------------------------------------- suspenders + deck
    const deckY = 1.0, deckZ = towerZ;
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2c343b", base2: "#232a30" }), { repeat: 6, px: 256 });
    const deck = box(g, 4.7, 0.1, 0.9, towerX, deckY - 0.05, deckZ, 0x2c343b, { rough: 0.7, metal: 0.35 });
    deck.material = texturedMat(deckTex, { rough: 0.7, metal: 0.35, color: 0x8b929a });
    for (const sz of [-0.42, 0.42]) {
      box(g, 4.7, 0.5, 0.03, towerX, deckY + 0.25, deckZ + sz, CITY.steel, { rough: 0.5, metal: 0.5 });
      box(g, 4.7, 0.03, 0.03, towerX, deckY + 0.5, deckZ + sz, CITY.hiVis, { rough: 0.5 });
    }

    const suspenderXs = [-2.0, -1.4, -0.8, -0.2, 0.6, 1.4, 2.0];
    const suspenders = [];
    for (const sx of suspenderXs) {
      const topY = cableY(sx);
      const s = hose(g, [[sx, topY, towerZ], [sx, deckY + 0.02, deckZ]], 0.018, CITY.steel, { steps: 8, rough: 0.4, metal: 0.6 });
      suspenders.push(s);
    }

    // ------------------------------------------------------ the rope under inspection
    const ropeX = 0.6;
    const ropeTopY = cableY(ropeX);
    const ropeGroup = group(g, ropeX, 0, towerZ);
    holoTag(ropeGroup, "Suspender rope, span 6 — this cycle", 0, ropeTopY + 0.22, 0, { css: "#7fa9c4", w: 0.72 });
    const socket = cyl(ropeGroup, 0.028, 0.02, 0.14, 0, ropeTopY - 0.07, 0, 0x7a5c30, { rough: 0.7, metal: 0.4, seg: 12 });
    reg(hits, socket, "corroded-socket");
    const strandBreak = group(ropeGroup, 0, ropeTopY - 0.9, 0);
    for (let i = 0; i < 4; i++) {
      const w = box(strandBreak, 0.006, 0.09, 0.006, -0.02 + i * 0.014, 0, 0, 0xc9c2b4, { rough: 0.7 });
      w.rotation.z = 0.5 + i * 0.15;
    }
    reg(hits, strandBreak, "broken-strand-visible");
    const stainBand = cyl(ropeGroup, 0.024, 0.024, 0.32, 0, ropeTopY - 1.7, 0, 0x5a5240, { rough: 0.85, seg: 10 });
    reg(hits, stainBand, "water-stain-band");

    // ------------------------------------------------------------------- traveller
    const traveller = group(g, ropeX + 0.32, ropeTopY - 0.35, towerZ, -0.15);
    const carriage = box(traveller, 0.5, 0.12, 0.3, 0, 0, 0, CITY.darkSteel, { rough: 0.5, metal: 0.55 });
    void carriage;
    for (const dx of [-0.16, 0.16]) {
      const wheel = torus(traveller, 0.09, 0.03, dx, 0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 8, seg2: 16 });
      wheel.rotation.y = Math.PI / 2;
    }
    const platform = group(traveller, 0, -0.55, 0);
    box(platform, 0.55, 0.03, 0.42, 0, 0, 0, 0x545c63, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) cyl(platform, 0.014, 0.014, 0.55, sx * 0.24, -0.28, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    for (const sx of [-1, 1]) box(platform, 0.014, 0.5, 0.014, sx * 0.26, 0.26, -0.19, CITY.hiVis, { rough: 0.6 });
    for (const sx of [-1, 1]) box(platform, 0.55, 0.02, 0.014, 0, 0.5, sx * 0.19, CITY.hiVis, { rough: 0.6 });
    cyl(traveller, 0.02, 0.02, 0.6, 0, -0.28, 0, CITY.steel, { rough: 0.45, metal: 0.6, seg: 8 });

    const anchorRing = torus(platform, 0.045, 0.009, -0.18, 0.55, 0, 0xd8b23a, { rough: 0.45, metal: 0.6, seg: 8, seg2: 16 });
    reg(hits, anchorRing, "traveller-anchor");
    const anchorRing2 = torus(platform, 0.045, 0.009, 0.18, 0.55, 0, 0xd8b23a, { rough: 0.45, metal: 0.6, seg: 8, seg2: 16 });
    reg(hits, anchorRing2, "second-lanyard-anchor");

    const brakeWheel = group(traveller, -0.28, -0.1, 0.12, 0.3);
    torus(brakeWheel, 0.06, 0.012, 0, 0, 0, 0xb8402f, { rough: 0.55, seg: 6, seg2: 16 });
    for (let i = 0; i < 4; i++) { const sp = box(brakeWheel, 0.12, 0.01, 0.012, 0, 0, 0, 0xb8402f, { rough: 0.55 }); sp.rotation.z = (i * Math.PI) / 4; }
    holoTag(brakeWheel, "Traveller brake", 0, 0.14, 0, { css: "#7fa9c4", w: 0.4 });
    reg(hits, brakeWheel, "traveller-brake");

    const crank = group(traveller, 0.28, -0.1, 0.12, -0.3);
    cyl(crank, 0.05, 0.05, 0.03, 0, 0, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 12 });
    const crankArm = box(crank, 0.16, 0.02, 0.02, 0.08, 0, 0.02, 0xd8b23a, { rough: 0.5, metal: 0.4 });
    ball(crank, 0.02, 0.16, 0, 0.02, 0x2b3138, { rough: 0.6, seg: 8 });
    holoTag(crank, "Cable crank", 0, 0.14, 0, { css: "#7fa9c4", w: 0.32 });
    reg(hits, crank, "cable-crank");

    const fluxHead = group(platform, -0.15, -0.05, 0.18, 0.2);
    box(fluxHead, 0.1, 0.06, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    torus(fluxHead, 0.05, 0.012, 0, 0, 0.06, 0xf2c14b, { rough: 0.5, seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
    holoTag(fluxHead, "Flux head", 0, 0.14, 0, { css: "#7fa9c4", w: 0.3 });
    reg(hits, fluxHead, "flux-head");

    const wireCounter = instrument(platform, 0.2, 0.02, 0.15, { ry: -0.3, idle: "-- wires", color: 0xf2c14b });
    holoTag(wireCounter, "Wire counter", 0, 0.16, 0, { css: "#7fa9c4", w: 0.34 });
    reg(hits, wireCounter, "wire-counter");

    const tagRack = group(platform, 0.02, 0.02, -0.16, 0.1);
    box(tagRack, 0.05, 0.02, 0.02, 0, 0, 0, 0xd9a441, { rough: 0.6 });
    const tagFlag = decal(tagRack, 0.05, 0.03, 0, 0.03, 0.011, signFace("TAG", { bg: "#241a08", accent: "#d9a441", scale: 0.6 }), { px: 96 });
    holoTag(tagRack, "Finding tag", 0, 0.1, 0, { css: "#7fa9c4", w: 0.3 });
    reg(hits, tagRack, "finding-tag");
    void tagFlag;

    const camera = group(platform, -0.05, 0.02, -0.16, -0.2);
    box(camera, 0.08, 0.05, 0.06, 0, 0, 0, 0x1c2126, { rough: 0.5, metal: 0.3 });
    cyl(camera, 0.02, 0.02, 0.04, 0, 0, 0.05, 0x0d0f11, { rough: 0.3, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(camera, "Camera", 0, 0.1, 0, { css: "#7fa9c4", w: 0.28 });
    reg(hits, camera, "camera");

    const toolBag = group(platform, -0.22, 0.02, 0.18, 0.3);
    box(toolBag, 0.12, 0.08, 0.08, 0, 0, 0, 0x3c4147, { rough: 0.8 });
    holoTag(toolBag, "Camera bag", 0, 0.14, 0, { css: "#7fa9c4", w: 0.3 });
    reg(hits, toolBag, "tool-tether");
    const toolBagHome = toolBag.position.clone();

    const looseWrench = group(platform, 0.22, 0.02, 0.17, 0.2);
    box(looseWrench, 0.13, 0.014, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.7 });
    reg(hits, looseWrench, "loose-tool-on-traveller");

    // The reach past the traveller's own rail toward the cable saddle — the
    // transfer point a rider without the second lanyard engaged has nothing
    // arresting them for.
    const cableReach = box(traveller, 0.18, 0.1, 0.18, 0, 0.3, 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(traveller, "reach for the saddle unclipped?", 0, 0.42, 0.16, { css: "#d2312b", w: 0.62 });
    reg(hits, cableReach, "unclipped-cable-transfer");

    // ------------------------------------------------------------ exclusion gap
    const gap = group(g, -1.6, -0.3, -0.6);
    box(gap, 0.5, 0.02, 0.6, 0, 0, 0, 0x0f2e3a, { rough: 0.3, opacity: 0.001, transparent: true, cast: false });
    holoTag(gap, "no boat exclusion set?", 0, 0.3, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, gap, "no-exclusion-below");

    // ------------------------------------------------------------ tool rack + gear
    const chest = toolChest(g, -2.1, 1.6, { ry: 0.5, color: 0x7fa8bf });
    const lanyardGood = group(chest, -0.1, 0.79, 0, 0.3);
    hose(lanyardGood, [[-0.06, 0, 0], [0, 0.03, 0.02], [0.06, 0, 0]], 0.008, 0xf2c14b, { steps: 8, rough: 0.7 });
    holoTag(lanyardGood, "Spare lanyard", 0, 0.1, 0, { css: "#7fa9c4", w: 0.32 });

    const frayed = group(chest, 0.2, 0.6, 0.1, -0.3);
    hose(frayed, [[-0.06, 0, 0], [0, 0.02, 0.02], [0.06, 0, 0]], 0.008, 0xb8402f, { steps: 8, rough: 0.9 });
    holoTag(frayed, "torn shock pack?", 0, 0.09, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, frayed, "frayed-lanyard-rack");

    // ------------------------------------------------------------ paperwork
    const plan = holoPanel(g, 0.7, 0.5, -2.4, 1.5, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fa9c4"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("INSPECTION PLAN · SPAN 6", w * 0.06, h * 0.13);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SUSPENDER ROPE — CYCLE DUE", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["NBIS cycle: this span due", "Rejection: per AASHTO MBE",
       "Two-lanyard transfer required", "Flux head: full coupling pass",
       "Photograph every tagged finding"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.46 + i * 0.105)));
    }, { ry: 0.4, accent: BCI_ACCENT });
    reg(hits, plan, "inspection-plan");

    const reportBoard = group(g, -2.4, 0, 0.6, 0.7);
    const reportFace = decal(reportBoard, 0.4, 0.54, 0, 1.1, 0,
      paperFace("INSPECTION REPORT", ["Wire count: --", "Socket: --", "Photo ref: --"], { worn: true }), { px: 288 });
    cyl(reportBoard, 0.025, 0.03, 1.0, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(reportBoard, "Inspection report", 0, 1.4, 0, { css: "#7fa9c4", w: 0.42 });
    reg(hits, reportBoard, "report-panel");
    void reportFace;

    barrierPanel(g, -1.0, 1.9, { color: BCI_ACCENT });
    cone(g, 0.4, 2.0, { color: BCI_ACCENT });
    cone(g, 1.6, 1.9, { color: BCI_ACCENT });

    const inspector = standingFigure(g, -0.85, 0.7, { ry: 1.0, cloth: 0x2f6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    holoTag(inspector, "Owner's inspector", 0, 1.9, 0, { css: "#59c97b", w: 0.44 });
    void inspector;

    // Wind pennant on the tower — the visible tell for the gust interrupt.
    const pennant = group(pier, 0.4, towerH - 0.5, 0, 0);
    const pennantFlag = box(pennant, 0.2, 0.09, 0.006, 0.1, 0, 0, 0x59c97b, { rough: 0.6, cast: false });

    const gustDust = particles(traveller, 18, 0xbfd8e4, { size: 0.02, life: 0.4, additive: false, opacity: 0.4 });

    // -------------------------------------------------------------- live state
    let gusting = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.4, 0.6),
      onStepComplete(step) {
        if (step.id === "visual-walk") {
          socket.material = mat(0xb8402f, { rough: 0.7, metal: 0.3 });
        }
        if (step.id === "mark-finding") {
          tagRack.position.set(socket.position.x, socket.position.y - 0.02, socket.position.z + 0.05);
        }
        if (step.id === "report") {
          repaint(reportFace, paperFace("INSPECTION REPORT", ["Wire count: logged", "Socket: corroded, tagged", "Photo ref: attached"], { worn: true }));
        }
      },
      onInterrupt(it) {
        if (it.id === "wind-gust-limit") {
          gusting = true;
          pennantFlag.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.5, cast: false });
          traveller.rotation.z = -0.15 - 0.12;
        }
        if (it.id === "tool-over-rail") {
          toolBag.position.set(toolBagHome.x + 0.24, toolBagHome.y - 0.01, toolBagHome.z + 0.02);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-gust-limit") {
          gusting = false;
          pennantFlag.material = mat(0x59c97b, { rough: 0.6, cast: false });
          traveller.rotation.z = -0.15;
        }
        if (it.id === "tool-over-rail") {
          toolBag.position.copy(toolBagHome);
        }
      },
      onHazard(hitId) {
        if (hitId === "loose-tool-on-traveller") gustDust.visible = true;
      },
      animate(t, dt, session) {
        pennantFlag.rotation.y = Math.sin(t * (gusting ? 6 : 2)) * (gusting ? 0.5 : 0.15);
        if (waterTex.offset) {
          waterTex.offset.x = (t * 0.012) % 1;
          waterTex.offset.y = (t * 0.008) % 1;
        }
        if (gustDust.visible) gustDust.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.06, 0.3, -0.6);

        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wire-count") {
          repaint(wireCounter.userData.screen, signFace(`${Math.round(gg.t * 24)}`, {
            bg: "#0d1c24", accent: gg.t < 0.18 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
