import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bridge Pier Scour Survey VR — Bay Area Union Edition, marine
// and water pack, on the bay-underwater district.
//
// A bridge pier's footing, scoured by the current: the benchmark and the
// footing's toe found first, the probe zeroed against the benchmark before
// any reading counts, the perimeter swum at the mudline, the scour hole
// probed against the critical elevation the monitoring plan sets, exposed
// footing and undermined riprap found, the deepest point marked, flagged and
// logged, and the exposed rebar and the accelerated flow through the
// undercut found before either one is passed. The learner is the diver, a
// Pile Drivers Local 34 commercial diver; the supervisor is on the comms,
// the tender has the umbilical and the standby is dressed at the ladder.
// Depth, gas, bottom time and decompression are never written as numbers:
// they are per the dive plan and the tables the supervisor holds, and no
// scour figure is invented — every reading is measured against the bridge
// owner's own monitoring plan.

const UBPS_ACCENT = 0x8ab4d8;
const UBPS_CSS = "#8ab4d8";

/** The HUD's comms face, repainted when the supervisor reads back. */
function ubpsCommsFace(lines, band = UBPS_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(8,16,26,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#e0ecf8"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#eef4fb";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_UW_BRIDGE_PIER_SCOUR_SURVEY = {
  id: "uw-bridge-pier-scour-survey",
  index: "356",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver on a bridge pier scour survey, with the dive supervisor on the comms, the tender on the umbilical and the standby diver dressed at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 660,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (planning and assessment of the dive) and 29 CFR 1910.423 post-dive procedures (the record of dive); ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds; scour findings measured against the bridge owner's own monitoring plan, never against an invented number",
  name: "Bridge Pier Scour Survey",
  title: simTitle("Bridge Pier Scour Survey"),
  tagline: "The footing read against last year's survey: the benchmark and the footing's toe found, the probe zeroed against the benchmark, the perimeter swum at the mudline through an accelerating current, the scour hole probed against the critical elevation, the exposed footing and the undermined riprap found, the deepest point marked, flagged and logged in order, the exposed rebar and the accelerated flow through the undercut found, position held for the read-back while the umbilical catches the rebar, and the findings reported before the crew checks in",
  accent: UBPS_ACCENT,
  accentCss: UBPS_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "zeroed-and-marked", name: "Zeroed and Marked", note: "The probe zeroed to the benchmark before any reading counted, the deepest point flagged and logged, and never a hand in the undercut or a tool dropped into the hole" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Scour Survey",
    currency: "ELEVATION",
    ranks: ["Diver Trainee", "Diver", "Survey Diver", "Lead Survey Diver", "Scour Survey Certified"],
    badges: [
      { id: "zeroed-first", name: "Zeroed First", note: "The probe zeroed against the benchmark before the perimeter was swum", test: AWARD.stepClean("calibrate-probe") },
      { id: "true-depth", name: "True Depth", note: "The scour probe read inside the band first time", test: AWARD.precise(0.7) },
      { id: "clear-of-the-undercut", name: "Clear Of The Undercut", note: "Never a hand in the undercut, never through the exposed rebar, never a tool let fall into the hole, never the umbilical left on the rebar", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections from the on-bottom report to the check-in", test: AWARD.clean },
      { id: "steady-perimeter", name: "Steady Perimeter", note: "The perimeter swum in band the whole way", test: AWARD.unbroken },
      { id: "surveyed-in-time", name: "Surveyed In Time", note: "Findings reported inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "swim-into-rebar": "You swam straight through the exposed rebar instead of round the footing. Scour has left this rebar standing free of the concrete that used to hold it, bent and sharp-edged from where it tore, and a diver who takes it as a shortcut round the pier gives it a suit, a hose or a fin to catch on. It gets photographed and measured from outside; it does not get swum through.",
    "enter-scour-gap": "You put your head and shoulders into the gap under the undermined footing to look at how far it goes back. Current funnelling under an undercut footing speeds up the same way water speeds up through any narrower gap, and that accelerated flow can pull a diver further into the gap than they meant to go, with a slab of concrete over their head and an umbilical trailing back through the same narrow space. The gap is measured from outside with the probe, never entered.",
    "drop-probe-in-hole": "You let the probe slip into the scour hole to free a hand instead of clipping it off first. A probe left in the hole is a foreign object the next survey has to explain, and one that has wedged up under the undermined footing can jam a probe reading, or a diver's hand, the next time anyone works this pier. Every tool comes off your harness clipped, and goes back on clipped, never let fall to free a hand.",
    "umbilical-on-rebar": "You worked the far side of the footing with your umbilical draped straight across the exposed rebar behind you. Every move you make after that drags the umbilical over sharp, bent steel that can nick the jacket or hang the line up outright, and you cannot see it happening from where you are working. The umbilical is walked round clear of the rebar before you start, not left to find its own way across it.",
  },

  lateNotes: {
    "scour-probe": "The probe is read once it has been zeroed against the benchmark — a reading off an uncalibrated probe means nothing set against last year's survey.",
    "marker-stake": "The stake is placed once the deepest point has actually been found by probing — not planted to mark a guess at where it might be.",
    "hold-for-readback": "Position is held for the read-back once the rebar and the accelerated flow have been found along the perimeter.",
  },

  steps: [
    {
      id: "report-on-bottom", kind: "select", target: "scour-comms",
      title: "Report on the bottom at the pier",
      cue: "Call the supervisor: on the bottom at the pier, off the stage, feeling good, and starting the survey at the benchmark.",
      why: "The supervisor at the panel can see your gas and your depth but not the footing, and the on-bottom report is how the surface learns the survey has actually started where the plan says it should. It is also the comms check that proves the voice circuit works before you leave the benchmark, so a lost signal at the far side of the pier is a real fault, not an unproven line.",
    },
    {
      id: "find-benchmark", kind: "find", noHint: true,
      targets: ["baseline-benchmark", "footing-toe"],
      itemNames: { "baseline-benchmark": "benchmark plate set into the pier", "footing-toe": "footing's toe where it meets the mudline" },
      itemNotes: {
        "baseline-benchmark": "A stainless plate set into the pier at a known elevation on a past survey — the one fixed point every scour reading on this pier is measured against.",
        "footing-toe": "The edge where the pier's footing meets the silt, the line the scour survey exists to check for any change since last time.",
      },
      title: "Find the benchmark and the footing's toe",
      cue: "At the pier, before probing anything: find the benchmark plate and the line where the footing meets the mudline.",
      why: "Nothing you read today means anything by itself — a scour depth only matters next to the number someone wrote down at this same pier a year ago, and the benchmark plate is the single elevation that ties this dive to that one. Skip finding it first and every probe reading you take afterward is a number with no year to compare it to, which is the same as not having taken it.",
    },
    {
      id: "calibrate-probe", kind: "turn", target: "probe-zero-dial",
      title: "Zero the probe against the benchmark",
      cue: "Set the probe against the benchmark plate and turn the zero dial until the readout reads true at the known elevation.",
      why: "A probe that has drifted even a little reads every scour depth on the whole survey wrong by the same amount, and there is no way to catch that error later except by comparing against a reading you already know is right. Zeroing it here, against the one elevation on this pier that is not in question, is what makes every reading that follows worth comparing to last year's at all.",
      turn: { turns: 0.6, label: "PROBE ZERO", readout: (t) => (t < 0.3 ? "reading low against the benchmark" : t < 0.85 ? "coming onto zero" : "zeroed — true against the benchmark") },
    },
    {
      id: "swim-perimeter", kind: "track", target: "pier-perimeter", seconds: 6,
      title: "Circle the whole footing, one edge at a time",
      cue: "Work your way all the way round the footing's edge, letting your fin beat settle into a rhythm that neither outruns your own eyes nor lets you drift to a stop.",
      why: "A scour survey that only circles the footing once, unevenly, is a survey with blind spots on whichever side the diver hurried past, and next year's crew has no way to know which side that was. Keeping one even rhythm all the way round is what turns 'I looked at the pier' into 'I looked at every side of it the same way,' which is the only kind of coverage the comparison to last year's survey can actually trust.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "CIRCLING RHYTHM", readout: (v) => (v < 0.42 ? "drifted to a stop on the footing" : v > 0.6 ? "outrunning your own eyes" : "even rhythm, all the way round") },
      holdBreakNote: "The rhythm broke — you either stalled against the footing or outran what you could actually see. Settle back into an even beat and carry on round.",
    },
    {
      id: "probe-scour-depth", kind: "gauge", target: "scour-probe",
      title: "Push the rod through to something solid",
      cue: "Work the rod down through the loosened material at the bottom of the hole until it stops on something that will not give any further, then commit that stopping point.",
      why: "Engineers back on land have already drawn a line on paper below which this footing cannot lose ground without the whole pier's capacity coming into question, and this rod is the only thing in the water that can say honestly which side of that line the pier is actually on today. Call the stop too early, on loose fill that only feels solid, and the pier reads safer on paper than it stands in the mud.",
      gauge: { label: "ROD STOP AGAINST THE ENGINEER'S LIMIT", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "plenty of margin left" : t <= 0.58 ? "closing in — worth a flag" : "past the line — stop and call it in now") },
    },
    {
      id: "footing-hazards", kind: "find", noHint: true,
      targets: ["exposed-footing", "undermined-riprap"],
      itemNames: { "exposed-footing": "footing concrete exposed by the scour", "undermined-riprap": "riprap undermined and slumped into the hole" },
      itemNotes: {
        "exposed-footing": "A face of the footing's own concrete standing clear of the silt that used to bury it, exactly the surface the scour has been cutting into.",
        "undermined-riprap": "A run of protective riprap that has lost its own footing to the same scour and slumped down into the hole instead of covering it.",
      },
      title: "Find the exposed footing and the undermined riprap",
      cue: "Working round the perimeter: look for footing concrete standing bare of silt, and for riprap that has slumped instead of holding its ground.",
      why: "Exposed footing tells the engineers exactly how far the scour has already cut, and riprap that has slumped instead of protecting the footing is itself a finding — a countermeasure that used to work and no longer does. Both change what the bridge owner has to plan for at this pier, and both are found by eye, round the whole perimeter, before the deepest point is marked.",
    },
    {
      id: "hold-photo", kind: "hold", target: "scour-photo-point", seconds: 4,
      title: "Hold the camera steady over the deepest point",
      cue: "Position the camera over the deepest part of the hole and hold it still while the frame is recorded for the report.",
      why: "A scour hole photographed from a drifting camera is hard to line up against last year's photo taken from roughly the same spot, and the comparison is most of what makes the photo worth having at all. Holding it steady over the deepest point, the same point the probe just read, is what lets the engineers actually see the change the numbers describe.",
      holdBreakNote: "The camera moved before the frame was recorded — hold it steady over the deepest point until the frame is confirmed.",
    },
    {
      id: "place-marker", kind: "drag", target: "marker-stake",
      title: "Push the stake in where the rod actually stopped",
      cue: "Carry the stake over from your kit and set it standing exactly where the rod bottomed out, not somewhere nearby that looks about right.",
      why: "Whoever comes back to this pier — a diver next season, or an ROV sent down between full surveys — is going to trust this stake completely and start their own work from wherever it is standing. Plant it a body-length off from where the rod actually stopped and you have not saved anyone time; you have handed them a wrong answer they will not know to question.",
      drag: { to: "scour-deepest-point", radius: 0.5, missNote: "Off the mark — the stake belongs exactly where the rod stopped, not near it." },
    },
    {
      id: "flag-then-log", kind: "sequence",
      targets: ["stake-flag", "slate-entry"],
      itemNames: { "stake-flag": "numbered flag tied to the stake", "slate-entry": "reading written on the slate with its position" },
      title: "Number it, then write down what the number means",
      cue: "Tie a number onto the stake before you write anything down, so the slate entry you make afterward is describing a number that already exists in the water.",
      why: "Write the entry first and you are describing a stake that does not have its number yet, which leaves you guessing what to tie on when you circle back — and a guess made twice rarely comes out the same way both times. Tying the number on first means everything that goes on the slate afterward is describing something real, not something you are about to make up.",
      outOfOrderNote: "Backwards — the stake needs its number before the slate can describe it truthfully.",
    },
    {
      id: "route-hazards", kind: "find", noHint: true,
      targets: ["rebar-snag", "venturi-gap"],
      itemNames: { "rebar-snag": "exposed rebar torn loose by the scour", "venturi-gap": "gap under the footing with accelerated flow" },
      itemNotes: {
        "rebar-snag": "A length of reinforcing bar standing clear of the footing where the scour has torn the concrete cover away from around it.",
        "venturi-gap": "A narrow opening under the undermined footing where the current visibly speeds up, funnelled by the same undercut the survey has been measuring.",
      },
      title: "Find the rebar and the accelerated flow before passing them",
      cue: "Ahead on the perimeter: any rebar standing clear of the footing, and any gap where the current is visibly speeding up as it funnels through.",
      why: "Both of these are exactly what the next diver on this pier needs marked before they arrive — a snag that can hold an umbilical, and a gap that can pull a diver further in than the current outside it ever suggested. Found here and reported, they are a line on the survey; missed until a diver is already alongside them, they are the reason the next dive gets hurt.",
    },
    {
      id: "hold-for-readback", kind: "hold", target: "hold-for-readback", seconds: 5,
      title: "Anchor yourself at the stake while the numbers go back and forth",
      cue: "Grip the stake itself and stop kicking while the supervisor repeats every reading back to you for confirmation, one at a time.",
      why: "This survey exists to be trusted years from now by an engineer who was never in the water, and the only quality control it gets is you and the supervisor saying the same numbers back to each other before either of you writes anything down for good. A diver who keeps finning gently in place while that happens is a diver whose own drift can put the stake's readings a foot from where they actually belong on the drawing.",
      holdBreakNote: "You let go of the stake and drifted while the numbers were still being confirmed — the record would carry a position that was never really checked. Take hold of the stake again and let the read-back finish.",
    },
    {
      id: "report-findings", kind: "select", target: "scour-comms",
      title: "Report the survey's findings",
      cue: "Tell the supervisor: the deepest reading against the critical elevation, the undermined riprap, and the rebar and the accelerated flow left for the work plan.",
      why: "The bridge owner's engineers only know what this survey actually found through this report, and a reading approaching or at the critical elevation is worth more to them than every other finding combined. Reporting it now, at the pier, while you can still describe exactly how far the undercut runs, is worth more than a line added to the record after the dive.",
    },
    {
      id: "check-in", kind: "select", target: "stage-checkin",
      title: "Clip on at the stage and wait for the word to come up",
      cue: "Get yourself clipped onto the stage, then talk the dive through out loud with the supervisor before you give any sign you are ready to leave.",
      why: "Nobody starts the ascent on this pier until the diver who was actually down there has said, in their own words, how it went — not just handed over a clean list of numbers. The pull through the undercut and the umbilical hanging up on the rebar both belong in that conversation as much as any reading does, and the Pile Drivers Local 34 member assistance line is there afterward for anything the conversation on the comms was never going to be the right place for.",
    },
  ],

  interrupts: [
    {
      id: "silt-hides-perimeter",
      kind: "A cloud off the scour hole swallows the perimeter",
      after: "swim-perimeter", delay: 2, seconds: 14,
      alert: "Fine material stirred up out of the hole has spread into a cloud thick enough that the footing's edge has disappeared in front of your mask.",
      cue: "Stop where you are and find the guide clip on the perimeter rope rather than guessing which way the footing runs.",
      target: "perimeter-guide-clip",
      why: "A diver who keeps circling blind through a cloud like this is just as likely to walk straight back over ground already covered as to find anything new, and every fin stroke through it only spreads the cloud wider. The guide clip on the rope strung earlier is the one thing in the cloud that still tells you exactly how far round you have come, which is worth far more right now than another few metres of guessing.",
      missNote: "You kept moving through the cloud on a guess at the footing's line; the survey ended up with the same stretch covered twice and another stretch never reached at all.",
      wrongNote: "The guide clip on the perimeter rope — find it rather than guessing your way through the cloud.",
    },
    {
      id: "wake-surge-snaps-line",
      kind: "A passing wake snaps the umbilical taut against the rebar",
      after: "hold-for-readback", delay: 2, seconds: 14,
      alert: "A wake from the surface has rolled through and snapped your umbilical bar-taut across the exposed rebar's edge behind you.",
      cue: "Get a flat hand braced on the footing and ride the load out rather than pulling back against a line that is already at its limit.",
      target: "footing-brace-point",
      why: "A line already snapped taut across a sharp edge is a line one more hard pull could part right where the steel bites into it, and pulling back against that load is the instinct that actually makes it worse. Bracing against the footing instead takes the strain off your own body and gives the surge somewhere to spend itself besides the umbilical's jacket.",
      missNote: "You pulled back against the taut line instead of bracing; the jacket started to fray right where it crossed the rebar's edge before the surge finally eased.",
      wrongNote: "Brace flat against the footing — do not pull back against a line that is already snapped taut.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.4, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb4beac });
    for (const [x, z, r] of [[-2.3, -1.8, 0.2], [2.2, 1.4, 0.15], [0.8, 2.0, 0.12], [-1.4, 2.2, 0.17], [2.6, -2.0, 0.19]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);

    // ------------------------------------------------------- the pier and footing
    const pier = group(g, 0.2, 0, -0.6);
    const shaft = cyl(pier, 0.6, 0.64, 6.0, 0, 3.0, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1, seg: 18 });
    void shaft;
    const footing = box(pier, 1.8, 0.6, 1.8, 0, 0.3, 0, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1 });
    void footing;
    const scourHole = cyl(g, 0.7, 1.1, 0.5, 0.4, -0.1, 0.9, 0x3a4238, { seg: 24, cast: false });
    const exposedFooting = box(pier, 0.5, 0.4, 0.06, 0.6, 0.4, 0.9, 0x9aa29c, { rough: 0.9, emissive: 0x2a2c26, ei: 0.2 });
    reg(hits, exposedFooting, "exposed-footing");
    const riprap = group(g, -0.4, 0.05, 0.7);
    for (let i = 0; i < 6; i++) ball(riprap, 0.14 + (i % 3) * 0.05, (i % 3) * 0.2 - 0.2, 0.05 + (i % 2) * 0.06, Math.floor(i / 3) * 0.2, 0x6a6a60, { rough: 0.95, seg: 8, seg2: 6 }).scale.set(1.1, 0.6, 0.9);
    reg(hits, riprap, "undermined-riprap");
    const undercutGap = box(pier, 0.9, 0.2, 0.2, 0.2, -0.02, 0.9, 0x1c1f1a, { rough: 0.7 });
    const gapHazardHit = box(g, 0.9, 0.5, 0.7, 0.6, 0.1, 1.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "look inside the undercut?", 0.6, 0.5, 1.1, { css: "#d2312b", w: 0.42 });
    reg(hits, gapHazardHit, "enter-scour-gap");
    void undercutGap;

    // ------------------------------------------------------- benchmark, footing toe, probe
    const benchmark = group(pier, 0.7, 1.6, 0.6);
    box(benchmark, 0.1, 0.1, 0.01, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    holoTag(benchmark, "benchmark plate", 0, 0.14, 0, { css: UBPS_CSS, w: 0.3 });
    reg(hits, benchmark, "baseline-benchmark");
    const footingToe = box(pier, 1.86, 0.06, 1.86, 0, 0.02, 0, 0x9a9284, { rough: 0.9 });
    reg(hits, footingToe, "footing-toe");
    const probeDial = group(g, -1.0, 0.9, -1.0, 0.3);
    cyl(probeDial, 0.06, 0.06, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5, seg: 14 });
    const dialPin = box(probeDial, 0.008, 0.045, 0.006, 0.02, 0.02, 0.02, UBPS_ACCENT, { rough: 0.5 });
    holoTag(probeDial, "probe zero dial", 0, 0.14, 0, { css: UBPS_CSS, w: 0.32 });
    reg(hits, probeDial, "probe-zero-dial");
    const routeHit = box(g, 4.5, 0.5, 0.6, 0.2, 0.5, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, routeHit, "pier-perimeter");
    const probe = group(g, -0.6, 0.7, -0.9);
    cyl(probe, 0.012, 0.012, 0.9, 0, 0.45, 0, 0xe8dcb8, { rough: 0.7, seg: 6 });
    holoTag(probe, "scour probe", 0, 1.0, 0, { css: UBPS_CSS, w: 0.24 });
    reg(hits, probe, "scour-probe");
    const dropProbeHit = box(g, 0.5, 0.6, 0.5, 0.4, 0.3, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let it slip into the hole?", 0.4, 0.65, 0.7, { css: "#d2312b", w: 0.4 });
    reg(hits, dropProbeHit, "drop-probe-in-hole");

    // ------------------------------------------------------- photo point, stake, flag, slate
    const photoPoint = group(g, 0.4, 0.5, 0.9);
    torus(photoPoint, 0.14, 0.012, 0, 0, 0, UBPS_ACCENT, { emissive: UBPS_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(photoPoint, "hold camera here", 0, 0.2, 0, { css: UBPS_CSS, w: 0.34 });
    reg(hits, photoPoint, "scour-photo-point");
    const stakeRack = group(g, -1.5, 0.06, -0.6);
    cyl(stakeRack, 0.014, 0.014, 0.5, 0, 0.25, 0, 0xe8b02e, { rough: 0.6, seg: 8 });
    holoTag(stakeRack, "marker stake", 0, 0.55, 0, { css: UBPS_CSS, w: 0.26 });
    reg(hits, stakeRack, "marker-stake");
    const deepestRing = group(g, 0.4, 0.05, 0.9);
    torus(deepestRing, 0.16, 0.012, 0, 0, 0, UBPS_ACCENT, { emissive: UBPS_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    reg(hits, deepestRing, "scour-deepest-point");
    const flag = group(g, 0.4, 0.5, 0.9);
    box(flag, 0.06, 0.04, 0.005, 0, 0, 0, 0xf06a2b, { rough: 0.6 });
    flag.visible = false;
    reg(hits, flag, "stake-flag");
    const slate = decal(g, 0.26, 0.2, -1.5, 0.9, -1.0, paperFace("SLATE", ["Depth vs critical elev.", "Riprap undermined", "Rebar · gap noted"], { bg: "#e8eef0", band: UBPS_CSS }), { px: 192 });
    slate.rotation.y = 0.3;
    holoTag(g, "slate — write it up", -1.5, 1.24, -1.0, { css: UBPS_CSS, w: 0.36 });
    reg(hits, slate, "slate-entry");

    // ------------------------------------------------------- hazards: rebar, gap, handhold, comms
    const rebar = group(pier, -0.7, 1.1, 0.85);
    for (const [x, rz] of [[-0.08, 0.3], [0.05, -0.2], [0.16, 0.5]]) { const b = cyl(rebar, 0.012, 0.012, 0.45, x, 0.22, 0, 0x8a4a2a, { rough: 0.8, metal: 0.4, seg: 6 }); b.rotation.z = rz; }
    reg(hits, rebar, "rebar-snag");
    const rebarHazardHit = box(g, 0.5, 0.6, 0.4, -0.5, 1.1, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swim through the rebar?", -0.5, 1.45, 0.2, { css: "#d2312b", w: 0.42 });
    reg(hits, rebarHazardHit, "swim-into-rebar");
    const umbOnRebarHit = box(g, 0.5, 0.6, 0.4, -0.5, 0.9, 0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "work with the umbilical across it?", -0.5, 0.55, 0.55, { css: "#d2312b", w: 0.5 });
    reg(hits, umbOnRebarHit, "umbilical-on-rebar");
    const venturiGap = group(pier, 0.3, 0.05, 1.0);
    box(venturiGap, 0.5, 0.14, 0.14, 0, 0, 0, 0x1c1f1a, { rough: 0.7 });
    reg(hits, venturiGap, "venturi-gap");
    const guideClip = group(pier, 0.9, 1.2, 0);
    torus(guideClip, 0.1, 0.014, 0, 0, 0, UBPS_ACCENT, { emissive: UBPS_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(guideClip, "perimeter guide clip", 0, 0.16, 0, { css: UBPS_CSS, w: 0.4 });
    reg(hits, guideClip, "perimeter-guide-clip");
    const holdMark = group(g, 0.4, 0.55, -0.2);
    torus(holdMark, 0.16, 0.01, 0, 0, 0, UBPS_ACCENT, { emissive: UBPS_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(holdMark, "hold here — read-back", 0, 0.2, 0, { css: UBPS_CSS, w: 0.42 });
    reg(hits, holdMark, "hold-for-readback");
    const umbilical = hose(g, [[-3.4, 1.2, 2.2], [-2.0, 0.5, 0.4], [-0.9, 0.2, 0.7], [0.4, 0.5, -0.2]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    const umbilicalSnag = hose(g, [[-3.4, 1.2, 2.2], [-2.0, 0.5, 0.4], [-0.7, 0.9, 0.75], [0.4, 0.5, -0.2]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    umbilicalSnag.visible = false;
    const bracePoint = group(g, -0.7, 0.95, 0.8);
    box(bracePoint, 0.08, 0.08, 0.08, 0, 0, 0, UBPS_ACCENT, { rough: 0.5 });
    holoTag(bracePoint, "brace flat here", 0, 0.14, 0, { css: UBPS_CSS, w: 0.32 });
    reg(hits, bracePoint, "footing-brace-point");
    const comms = holoPanel(g, 0.5, 0.3, -2.0, 1.1, -1.3, ubpsCommsFace(["Supervisor · topside", "Press to talk"]), { ry: 0.5, accent: UBPS_ACCENT });
    reg(hits, comms, "scour-comms");
    const siltCloud = group(g, 0.4, 0.4, 0.5);
    for (let i = 0; i < 6; i++) ball(siltCloud, 0.6 + (i % 3) * 0.18, -1.0 + i * 0.4, (i % 2) * 0.22, (i % 3) * 0.28 - 0.28, 0x7a806a, { rough: 1, opacity: 0.55, transparent: true, cast: false, seg: 10, seg2: 8 });
    siltCloud.visible = false;

    // ------------------------------------------------------- stage
    const stage = group(g, -3.0, 0, -1.9);
    box(stage, 1.5, 0.05, 1.5, 0, 0.25, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stage, 0.06, 1.6, 0.06, sx * 0.65, 0.8, sz * 0.65, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    torus(stage, 0.3, 0.01, 0, 0.26, 0, UBPS_ACCENT, { emissive: UBPS_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    holoTag(stage, "stage — check in", 0, 0.5, 0, { css: UBPS_CSS, w: 0.3 });
    reg(hits, stage, "stage-checkin");

    // ------------------------------------------------------- scenery
    const school = group(g, -0.6, 1.9, -2.6);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.3 - 0.45, Math.floor(i / 4) * 0.22, (i % 3) * 0.18);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(g, 0.06 + (i % 3) * 0.02, Math.cos(a) * 2.6, 0.06, -0.4 + Math.sin(a) * 2.6, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    for (let i = 0; i < 9; i++) {
      const a = i * 0.71 + 0.3, r = 1.4 + (i % 4) * 0.45;
      const bottle = cyl(g, 0.035, 0.035, 0.2, Math.cos(a) * r, 0.04, -0.4 + Math.sin(a) * r, [0x2f6f4a, 0x6a4a2a, 0xa8c8c0][i % 3], { rough: 0.15, metal: 0.1, opacity: 0.8, transparent: true, seg: 8 });
      bottle.rotation.z = Math.PI / 2; bottle.rotation.y = a;
    }
    for (const [x, z] of [[2.5, 1.6], [-2.6, 1.5], [1.8, -2.3]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.16, 0.18, 0.4, 0, 0.2, 0, 0x4a4234, { rough: 0.95, seg: 12 });
      for (let i = 0; i < 4; i++) { const a = i * 1.6 + x; ball(stub, 0.07, Math.cos(a) * 0.2, 0.12 + (i % 2) * 0.14, Math.sin(a) * 0.2, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    for (let i = 0; i < 6; i++) {
      const link = torus(g, 0.05, 0.016, -2.3 + i * 0.12, 0.03, 1.5 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    const kelp = group(g, -3.0, 0, 0.6);
    for (let i = 0; i < 7; i++) {
      const frond = box(kelp, 0.03, 0.6 + (i % 3) * 0.22, 0.1, i * 0.1, 0.4, (i % 2) * 0.1, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    const bubbles = group(g, -0.6, 1.4, -0.6);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.02 + (i % 3) * 0.008, (i % 3) * 0.04 - 0.04, i * 0.14, (i % 2) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    const growthRing = group(pier, 0, 0.5, 0);
    for (let i = 0; i < 10; i++) { const a = i * 0.63; ball(growthRing, 0.09 + (i % 2) * 0.03, Math.cos(a) * 0.65, (i % 3) * 0.14, Math.sin(a) * 0.65, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    for (let i = 0; i < 9; i++) {
      const a = i * 0.6 + 0.4, r = 0.9 + (i % 3) * 0.3;
      const can = cyl(g, 0.03, 0.03, 0.1, -1.6 + Math.cos(a) * r, 0.03, -2.4 + Math.sin(a) * r, [0xb8402f, 0x9aa2a8, 0x2b5aa8][i % 3], { rough: 0.5, metal: 0.6, seg: 8 });
      can.rotation.z = Math.PI / 2;
    }
    for (const [x, z] of [[2.4, -0.6]]) {
      const nBrg = group(g, x, 0, z);
      cyl(nBrg, 0.3, 0.32, 5.8, 0, 2.9, 0, 0x56613f, { seg: 16 });
      for (let i = 0; i < 5; i++) { const a = i * 1.2 + x; ball(nBrg, 0.08, Math.cos(a) * 0.35, 0.2 + (i % 3) * 0.16, Math.sin(a) * 0.35, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    const rockPile2 = group(g, 1.6, 0, 2.1);
    for (let i = 0; i < 6; i++) ball(rockPile2, 0.13 + (i % 3) * 0.05, (i % 3) * 0.2 - 0.2, 0.05 + (i % 2) * 0.06, Math.floor(i / 3) * 0.2, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.1, 0.6, 0.9);

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 0.9, 0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "report-on-bottom") repaint(comms.userData.face, ubpsCommsFace(["On the bottom — reported", "Survey starting at benchmark"]));
        if (step.id === "footing-hazards") { exposedFooting.material = mat(0x8a2a1a, { rough: 0.9, emissive: 0x3a1206, ei: 0.3 }); }
        if (step.id === "place-marker") stakeRack.position.set(0.4, 0.3, 0.9);
        if (step.id === "flag-then-log") { flag.visible = true; repaint(slate, paperFace("SLATE", ["Depth vs critical — written", "Riprap undermined", "Rebar · gap noted"], { bg: "#e6f6ea", band: "#59c97b" })); }
        if (step.id === "report-findings") repaint(comms.userData.face, ubpsCommsFace(["Findings reported", "Deepest point flagged"]));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "silt-hides-perimeter") siltCloud.visible = true;
        if (it.id === "wake-surge-snaps-line") { umbilical.visible = false; umbilicalSnag.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "silt-hides-perimeter" && it.resolved === "answered") siltCloud.visible = false;
        if (it.id === "wake-surge-snaps-line" && it.resolved === "answered") { umbilical.visible = true; umbilicalSnag.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "calibrate-probe") dialPin.rotation.z = session.turn.amount * Math.PI * 2 - 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "probe-scour-depth") probe.scale.y = 0.7 + gg.t * 0.6;
        if (siltCloud.visible) siltCloud.rotation.y = t * 0.1;
        school.position.x = -0.6 + Math.sin(t * 0.3) * 0.3;
        void dt; void CITY; void signFace;
      },
    };
  },
};
