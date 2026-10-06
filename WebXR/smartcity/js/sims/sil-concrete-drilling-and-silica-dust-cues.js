import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, hose, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Concrete Drilling & Silica Dust Cues VR — construction
// laborers, console SILICA.
//
// A laborer drilling anchor holes for a handrail base plate in a concrete
// deck, then coring a pipe penetration with a rig-mounted core drill, inside a
// partly enclosed building core with a second crew working nearby. The
// controls are the ones OSHA's respirable crystalline silica standard for
// construction (29 CFR 1926.1153) lists in Table 1 for these two tasks — a
// shroud with a dust collector and a HEPA vacuum for the hand drill, water
// delivered to the bit for the rig-mounted core drill — plus the housekeeping
// rule against dry sweeping and blowing dust off with compressed air, and
// the written exposure control plan's respirator assignment, fitted and seal
// checked under 29 CFR 1926.103.
//
// The two interruptions are the hazard cues, and they port the design of the
// ConstructionVR user study (AGIFutureFoundation/constructionvr, read-only;
// see docs/sources/constructionvr-study.md): its two conditions were
// ActiveDrilling (the participant drilling while dust built up) and
// PassiveMoving (dust building up around a participant who was not the one
// making it), and a response was a trigger press timed in seconds. Here the
// first cue arrives while you are the one drilling (active) and the second
// while someone else's dust drifts onto you (passive); the engine already
// times every interruption, and shared/sil-reaction.js turns those times into
// an opt-in, local reaction-time episode in DATAWORKS' schema. Airflow
// figures, embedment depths and filter ratings are the tool and anchor
// manufacturers' and the exposure control plan's, never a number this file
// invents.

const SILD_ACCENT = 0xd9a441;
const SILD_CSS = "#d9a441";
const SILD_PAL = palette("construction");
// Reduced motion gets a still scene: no plume drifts; the cues still change the scene (hose, haze, monitor).
const SILD_STILL = typeof globalThis.matchMedia === "function" && !!globalThis.matchMedia("(prefers-reduced-motion: reduce)")?.matches;

export const SIM_SIL_CONCRETE_DRILLING_AND_SILICA_DUST_CUES = {
  id: "sil-concrete-drilling-and-silica-dust-cues",
  index: "970",
  domain: "Construction & Structural Trades",
  trade: "Construction laborer — LIUNA, concrete drilling and anchor setting",
  category: "Construction & Structural Trades",
  weather: "clear",
  indoor: "plant",
  certification: "LIUNA Training as a training body for construction laborers; OSHA 29 CFR 1926.1153 respirable crystalline silica in construction — Table 1's entries for handheld and stand-mounted drills (shroud or cowling with a dust collection system, and a HEPA-filtered vacuum to clean holes) and for rig-mounted core saws or drills (integrated water delivery), the housekeeping limits on dry sweeping and compressed air, and the written exposure control plan; OSHA 29 CFR 1926.103 respiratory protection, which applies 29 CFR 1910.134 fit testing and seal checks to construction; ANSI A10.9 concrete and masonry work; NIOSH guidance on engineering controls for silica dust from drilling; the tool, dust collector and anchor manufacturers' instructions for airflow and depth",
  name: "Concrete Drilling & Silica Dust Cues",
  title: simTitle("Concrete Drilling & Silica Dust Cues"),
  tagline: "Anchor holes and a pipe core drilled under the silica rule: the shroud, the collector and the half-mask checked before any bit turns, the holes vacuumed rather than blown out, the core drilled wet, and two dust cues — one you raise yourself, one that drifts in from the next crew — answered as fast as you notice them",
  accent: SILD_ACCENT,
  accentCss: SILD_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "caught-the-plume", name: "Caught The Plume", note: "Both dust cues answered inside their window, no dry cleanup, the shroud on every hole — first time" },

  supportLine: "your LIUNA local's member assistance programme, or the employee assistance line posted on the contractor's site board",

  // Reaction-time eval (shared/sil-reaction.js): which cue ports which study
  // condition. Read only by that module; the engine ignores it.
  reactionEval: {
    study: "ConstructionVR user study (ActiveDrilling / PassiveMoving), adapted",
    cues: { "shroud-hose-off": "active", "dust-drift": "passive" },
  },

  game: system({
    name: "Dust Crew",
    currency: "HOLE",
    ranks: ["Helper", "Driller", "Laborer", "Lead Laborer", "Dust Crew Certified"],
    badges: [
      { id: "walked-the-kit", name: "Walked The Kit", note: "The torn shroud skirt, the choked filter and the broom all found before the first hole, first time", test: AWARD.stepClean("kit-walk") },
      { id: "never-blown", name: "Never Blown, Never Swept", note: "No compressed air in a hole, no broom on silica dust, no drilling with the shroud off, the mask strapped every time", test: AWARD.safe },
      { id: "in-the-band", name: "In The Band", note: "Collector airflow and core water both held where the manufacturers put them", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-holes", name: "Clean Holes", note: "No corrections through the whole station", test: AWARD.clean },
      { id: "steady-core", name: "Steady Core", note: "The core drill's water and feed held for the whole cut", test: AWARD.unbroken },
      { id: "quick-crew", name: "Quick Crew", note: "Drilled, cored, cleaned and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "blow-out-holes": "You reached for the compressed-air nozzle to blow the dust out of the anchor holes. A blast of air into a freshly drilled hole lifts the finest fraction of the powder straight into the breathing zone of everyone nearby, which is why the silica rule limits compressed air for cleaning and why Table 1 pairs the drill with a HEPA-filtered vacuum for exactly this job.",
    "dry-sweep-dust": "You went to sweep the drilling dust into a pile with a dry broom. Sweeping does not collect respirable silica, it relaunches it: the particles small enough to reach the deep lung are the ones a broom throws back into the air, and the standard's housekeeping rule steers crews to a HEPA vacuum or wet methods instead.",
    "drill-without-shroud": "You went to drill the next hole with the shroud pulled off the bit to see the mark better. Without the shroud and its collector the dust leaves the hole at the operator's face height, and the hand drill's Table 1 entry only holds when the shroud is on and the collector is pulling at the manufacturer's airflow.",
    "mask-strap-loose": "You went to start the drill with the half-mask's lower strap hanging loose. A tight-fitting respirator only filters the air that actually passes through its cartridges; with a strap down, air takes the easy path around the edge of the seal, and the fit test and seal check that 29 CFR 1926.103 brings in from 1910.134 mean nothing.",
  },

  lateNotes: {
    "drill-trigger": "The bit only goes into the deck once the shroud is seated, the collector is pulling and the half-mask is sealed — the drill being staged at the mark does not make any of that optional.",
    "core-feed": "The core drill only runs once its water line is connected and flowing to the bit; a rig-mounted core that cuts dry is outside its Table 1 entry from the first second.",
    "dust-log": "The log is written once the holes are vacuumed, the slurry is picked up and the clothing is cleaned — not from memory at the end of the week.",
  },

  steps: [
    {
      id: "exposure-plan", kind: "select", target: "exposure-plan",
      title: "Read the written exposure control plan",
      cue: "Read the plan for this core: which tasks make silica dust, the Table 1 control for each, who the competent person is, and the housekeeping and respirator lines.",
      why: "The silica standard asks the employer for a written plan exactly because the controls differ task by task: a hand drill gets a shroud and a dust collector, a rig-mounted core drill gets water at the bit, and neither one gets a broom. Reading it first is how a laborer knows which control belongs on which tool before the dust exists, and who to call when a control fails mid-hole.",
    },
    {
      id: "kit-walk", kind: "find", noHint: true,
      targets: ["torn-shroud-skirt", "choked-filter", "staged-broom"],
      itemNames: { "torn-shroud-skirt": "a torn shroud skirt", "choked-filter": "a choked collector filter", "staged-broom": "a dry broom staged for cleanup" },
      itemNotes: {
        "torn-shroud-skirt": "The rubber skirt on the drill's shroud is split along one side; it will not seal against the deck and dust will jet out of the gap.",
        "choked-filter": "The dust collector's filter indicator sits in the red — the filter is loaded and the airflow at the shroud will be well under what the tool maker calls for.",
        "staged-broom": "A push broom and a dustpan are leaning by the drilling area, staged for the cleanup the plan says must be done with a HEPA vacuum.",
      },
      title: "Walk the drill, the collector and the cleanup kit",
      cue: "Walk the hammer drill, its shroud, the dust collector and the cleanup corner, and click every defect you find.",
      why: "Each of these defects quietly turns a controlled task into an uncontrolled one while the work looks normal. A split skirt leaks at the one place the operator's face is closest, a loaded filter starves the shroud of airflow long before the collector sounds different, and a staged broom becomes the cleanup method at the end of a long day. Found now, each is a two-minute fix with nothing running.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["fit-new-skirt", "swap-filter", "stow-broom"],
      itemNames: { "fit-new-skirt": "new shroud skirt fitted", "swap-filter": "collector filter swapped", "stow-broom": "broom stowed off the floor" },
      title: "Correct what the walk found",
      cue: "Fit a new skirt to the shroud, swap the collector's filter, and take the broom out of the work area.",
      why: "Finding the defects only helps if the tool that starts is the repaired one. A crew that notes a split skirt and drills anyway has the same exposure as a crew that never looked, plus a false entry on the pre-task check; the repaired shroud, the fresh filter and the missing broom are what the next hour of drilling actually depends on.",
    },
    {
      id: "mask-seal", kind: "select", target: "half-mask",
      title: "Don the half-mask and do a user seal check",
      cue: "Put on the half-mask respirator the plan assigns for drilling in the enclosed core, both straps on, and do the positive and negative pressure seal checks.",
      why: "In this scenario the plan assigns a respirator for drilling inside the enclosed core as a backstop to the engineering controls. A tight-fitting mask works only when it was fit tested and is sealed today: breathing in against blocked cartridges should pull the facepiece in, breathing out against a blocked valve should push it out, and either leak means adjusting before drilling, not after the first cloud.",
    },
    {
      id: "upwind-setup", kind: "drag", target: "drill-cart",
      title: "Set up with the airflow at your back",
      cue: "Wheel the drill cart to the marked spot on the upwind side of the anchor layout, so the core's cross-draught carries anything the shroud misses away from you.",
      why: "No shroud captures everything, and in a building core the air moves in a definite direction from the open bay to the stair. Standing on the side the air comes from means the small fraction that escapes drifts away from the breathing zone instead of through it; it costs nothing, and it is the same instinct the dust-drift cue later in this station tests.",
      drag: { to: "upwind-spot", radius: 0.55, missNote: "That spot puts the anchor layout between you and the open bay — the draught would carry escaping dust straight across your face. Move to the marked upwind spot." },
    },
    {
      id: "collector-airflow", kind: "gauge", target: "collector-dial",
      title: "Set the dust collector's airflow",
      cue: "Turn the collector's airflow up and commit inside the band the drill's manufacturer recommends — at that figure or above.",
      why: "Table 1's hand-drill entry depends on a collector that pulls at least the airflow the tool maker recommends, with a filter that cleans itself and captures nearly all of what it collects. Set low, the shroud leaks at its rim even though the collector is running; that is the failure nobody sees until the dust is already in the air.",
      gauge: { label: "COLLECTOR AIRFLOW", speed: 0.7, green: [0.55, 0.85], readout: (t) => (t < 0.55 ? "below the tool maker's airflow — shroud leaks" : t <= 0.85 ? "at or above the recommended airflow" : "past the hose rating — the hose will collapse"), missNote: "Outside the tool maker's band — reset the dial and read the airflow again before the bit touches concrete." },
    },
    {
      id: "depth-stop", kind: "turn", target: "depth-stop",
      title: "Set the depth stop to the anchor's embedment",
      cue: "Turn the depth stop on the drill to the hole depth the anchor manufacturer's instructions give for this anchor.",
      why: "An anchor's holding capacity depends on its embedment, and the anchor manufacturer's instructions set the hole depth for the anchor size. A hole drilled too shallow fails the handrail's pull test; one drilled too deep or too often is extra dust from every extra centimetre. The depth stop makes every hole the same depth without the operator leaning in to look.",
      turn: { turns: 1, label: "DEPTH STOP" },
    },
    {
      id: "drill-holes", kind: "hold", target: "drill-trigger", seconds: 5,
      title: "Drill the anchor holes with the shroud flush",
      cue: "Hold the drill square to the deck, the shroud skirt flat on the concrete, and drill the hole to the depth stop in one steady pass.",
      why: "The shroud only captures dust when its skirt sits flat on the surface; tilt the drill and the seal opens on one side and the collector pulls room air instead of hole dust. A steady, square pass keeps the seal whole for the full depth, and five seconds is about one anchor hole — the same hold the ConstructionVR study used per drilling point.",
      holdBreakNote: "The drill tipped and the shroud lifted off the deck — dust escaped from the open side. Square the drill, reseat the skirt and finish the hole.",
    },
    {
      id: "hole-vacuum", kind: "select", target: "hepa-wand",
      title: "Clean the holes with the HEPA vacuum",
      cue: "Use the HEPA-filtered vacuum wand to clean the dust out of each anchor hole before the anchors go in.",
      why: "Anchor holes must be clean for the anchor to grip, and the dust in the bottom of a fresh hole is the finest of the job. A HEPA vacuum takes it out and keeps it, which is why Table 1 names it for cleaning holes; blowing the hole out instead puts the same powder into the air the shroud just kept clean.",
    },
    {
      id: "core-feed", kind: "track", target: "core-feed", seconds: 6,
      title: "Core the pipe penetration with water at the bit",
      cue: "Run the rig-mounted core drill with its water on, and keep the feed steady so the water and the cut stay inside the band for the whole core.",
      why: "Table 1's control for a rig-mounted core drill is water delivered to the cutting surface, and it holds only while the water keeps up with the feed. Push too fast and the bit outruns the water, the slurry dries at the kerf and dust escapes; feed too slowly and the bit glazes and stalls. An even feed keeps the cut wet from the first centimetre to the breakthrough.",
      track: { start: 0.25, green: [0.4, 0.62], rise: 0.48, fall: 0.44, drift: 0.12, label: "WATER + FEED", readout: (v) => (v < 0.4 ? "feed too slow — bit glazing" : v > 0.62 ? "outrunning the water — dry kerf" : "wet cut, steady feed") },
      holdBreakNote: "The feed outran the water and the kerf went dry for a moment. Ease off until the slurry runs again and bring the feed back into the band.",
    },
    {
      id: "slurry-pickup", kind: "drag", target: "wet-vac",
      title: "Pick up the core slurry while it is wet",
      cue: "Carry the wet vacuum to the core and pick up the slurry ring before it dries on the deck.",
      why: "Core slurry is the silica the water caught. Left to dry it becomes a crust that boots and carts grind back into dust, undoing the wet method an hour later; picked up wet it is just a liquid to contain and dispose of the way the plan says.",
      drag: { to: "slurry-ring", radius: 0.55, missNote: "Not at the core — the slurry ring is around the penetration, and that is where the wet vacuum has to go before it dries." },
    },
    {
      id: "decon", kind: "sequence",
      targets: ["vac-clothing", "remove-mask", "wash-up"],
      itemNames: { "vac-clothing": "clothing vacuumed with the HEPA vac", "remove-mask": "half-mask removed and bagged", "wash-up": "hands and face washed" },
      title: "Clean up yourself in the right order",
      cue: "HEPA-vacuum the dust off your clothing first, then take the half-mask off, then wash your hands and face before eating or leaving the core.",
      why: "The order matters because dust on clothing is dust that rises again when you move. Vacuuming clothes with the mask still on means anything that lifts is filtered; taking the mask off first means breathing it. Washing comes last so the hands that took off the mask and touched the clothes are the ones that get cleaned before food or a cigarette reaches the mouth.",
      outOfOrderNote: "Clothing first, with the mask still on — then the mask off, then hands and face. Taking the mask off before the clothes are clean means breathing the dust that lifts off them.",
    },
    {
      id: "close-out", kind: "select", target: "dust-log",
      title: "Log the holes, the core and the two dust events",
      cue: "Record the anchor holes drilled, the core cut, the shroud hose that came off and the dust that drifted in from the next crew.",
      why: "The competent person's job under the plan is to keep the controls working, and the log is how a failed hose clamp or a neighbouring crew's dry cutting becomes a fix instead of a repeat. It is also the record that the Table 1 controls were actually used on this task, which is what lets the employer rely on Table 1 instead of exposure monitoring.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the competent person",
      cue: "Call the competent person: holes and core done, the hose clamp and the dust drift logged. Then check in with your crew.",
      why: "Two things went wrong today that nobody chose: a hose let go mid-hole and another crew's dust came through the core. Both need a fix before tomorrow's drilling, and the person who can fix them has to hear it on this call. The LIUNA member assistance line is available to anyone the shift left worried about what they breathed.",
    },
  ],

  interrupts: [
    {
      id: "shroud-hose-off",
      kind: "Dust collector hose pops off the shroud mid-hole (active cue)",
      after: "drill-holes", delay: 2, seconds: 12,
      alert: "The collector hose has slipped off the shroud's port and a grey plume is rising from the hole you are drilling.",
      cue: "Stop the drill at its switch before the bit goes any deeper.",
      target: "drill-stop",
      why: "With the hose off, the shroud is a cup that funnels dust upward toward your face; every second the bit keeps turning is the uncontrolled dust the whole setup exists to prevent. Stopping at the switch ends the dust at its source, and the hose goes back on and gets clamped before the hole is finished.",
      missNote: "The drill kept running with the hose hanging loose; a plume of fine grey dust hung over the anchor layout by the time the bit stopped.",
      wrongNote: "The drill's stop switch — the dust is coming from the bit, so the bit is what stops first.",
    },
    {
      id: "dust-drift",
      kind: "Another crew's dust drifts onto your work area (passive cue)",
      after: "core-feed", delay: 2, seconds: 12,
      alert: "A crew grinding at the far wall has started without a shroud, and their dust is drifting across the core toward you on the draught.",
      cue: "Step back to the upwind marker, out of the plume, and call the stop from there.",
      target: "upwind-marker",
      why: "This dust is not yours, which is exactly why it is easy to keep working through it: your own controls are fine and the cloud seems like someone else's problem. Respirable silica does not care whose tool made it. Moving upwind out of it first and then calling the stop to that crew's lead protects your lungs now and fixes the source.",
      missNote: "You kept coring while the other crew's dust rolled across the work area; the haze settled over the core drill and the slurry ring before anyone called it.",
      wrongNote: "The upwind marker — get out of the plume first, then call the stop.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SILD_ACCENT);
    const deck = box(g, 8.0, 0.04, 6.0, 0, 0.02, -0.3, 0xffffff);
    deck.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8f8a80", tone2: "#7f7a70" }), { repeat: 4, px: 512 }), { rough: 0.85, color: 0xd4cec2 });

    // ------------------------------------------------------------- building core: walls, columns, open bay
    const coreWall = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#a09b90", tone2: "#918c82" }), { repeat: 2, px: 256 }), { rough: 0.9, color: 0xe6e0d2 });
    for (const [x, z, w, d] of [[-4.0, -0.3, 0.2, 6.0], [0, -3.2, 8.0, 0.2]]) { const wl = box(g, w, 2.9, d, x, 1.45, z, 0xffffff); wl.material = coreWall; }
    for (const [x, z] of [[-2.0, -3.0], [2.0, -3.0], [-3.8, 1.4]]) box(g, 0.36, 2.9, 0.36, x, 1.45, z, 0x9c978d, { rough: 0.85 });
    // the open bay on the east side the draught comes in through
    const bayFrame = group(g, 4.0, 0.02, -0.3, 0);
    box(bayFrame, 0.2, 2.9, 0.3, 0, 1.45, -2.6, 0x9c978d, { rough: 0.85 });
    box(bayFrame, 0.2, 2.9, 0.3, 0, 1.45, 2.6, 0x9c978d, { rough: 0.85 });
    box(bayFrame, 0.2, 0.3, 5.5, 0, 2.75, 0, 0x9c978d, { rough: 0.85 });
    for (let i = 0; i < 6; i++) box(bayFrame, 0.02, 0.5, 0.9, -0.05, 2.3, -2.2 + i * 0.88, 0x3c6b8a, { rough: 0.4, opacity: 0.35, transparent: true, cast: false });
    holoTag(bayFrame, "open bay — draught comes in here", 0, 3.05, 0, { css: SILD_CSS, w: 0.56 });
    // draught arrows on the deck, east to west
    for (let i = 0; i < 4; i++) {
      const a = box(g, 0.5, 0.006, 0.06, 2.6 - i * 1.3, 0.045, -1.9, 0x6fa8c9, { rough: 0.6, cast: false });
      const tip = box(g, 0.12, 0.006, 0.16, 2.33 - i * 1.3, 0.045, -1.9, 0x6fa8c9, { rough: 0.6, cast: false });
      void a; void tip;
    }

    // ------------------------------------------------------------- anchor layout: base plate, marked holes
    const plate = box(g, 0.5, 0.012, 0.3, 0.4, 0.046, 0.9, 0x6e747b, { rough: 0.5, metal: 0.7 });
    void plate;
    const holeMarks = [], drilledHoles = [];
    for (const [dx, dz] of [[-0.17, -0.09], [0.17, -0.09], [-0.17, 0.09], [0.17, 0.09]]) {
      const m = cyl(g, 0.018, 0.018, 0.006, 0.4 + dx, 0.05, 0.9 + dz, 0xd2312b, { rough: 0.6, seg: 10 });
      holeMarks.push(m);
      const d = cyl(g, 0.014, 0.014, 0.008, 0.4 + dx, 0.05, 0.9 + dz, 0x1a1a1a, { rough: 0.9, seg: 10 });
      d.visible = false; drilledHoles.push(d);
    }
    const handrailPosts = group(g, 0.4, 0.02, 1.25, 0);
    for (let i = 0; i < 3; i++) box(handrailPosts, 0.05, 0.05, 1.1, -0.4 + i * 0.4, 0.06, 0.4, 0xb9bec4, { rough: 0.4, metal: 0.8 });

    // ------------------------------------------------------------- the hammer drill, shroud, collector
    const drill = group(g, 0.4, 0.02, 0.9, 0);
    box(drill, 0.12, 0.18, 0.34, 0, 0.42, 0, 0x2f6f9f, { rough: 0.5, metal: 0.2 });
    const drillGrip = box(drill, 0.05, 0.16, 0.06, 0, 0.36, 0.2, 0x22262b, { rough: 0.7 });
    reg(hits, drillGrip, "drill-trigger");
    holoTag(drill, "drill trigger", 0, 0.62, 0.22, { css: SILD_CSS, w: 0.22 });
    const bit = cyl(drill, 0.008, 0.008, 0.26, 0, 0.2, -0.12, 0xb9bec4, { rough: 0.3, metal: 0.9, seg: 8 });
    void bit;
    const shroud = cyl(drill, 0.06, 0.07, 0.08, 0, 0.09, -0.12, 0x2b2f34, { rough: 0.6, seg: 16, open: true });
    const shroudSkirt = cyl(drill, 0.075, 0.075, 0.02, 0, 0.05, -0.12, 0x1a1a1a, { rough: 0.8, seg: 16, open: true });
    reg(hits, shroudSkirt, "torn-shroud-skirt");
    // the split in the skirt, and the replacement skirt shown once it is fitted
    const tornFlap = box(drill, 0.05, 0.03, 0.01, 0.06, 0.05, -0.06, 0xd2312b, { rough: 0.8 });
    tornFlap.rotation.y = 0.6;
    const skirtNew = cyl(drill, 0.076, 0.076, 0.022, 0, 0.05, -0.12, 0x2b2f34, { rough: 0.7, seg: 16, open: true });
    skirtNew.visible = false;
    holoTag(drill, "torn shroud skirt", 0.25, 0.12, -0.12, { css: SILD_CSS, w: 0.3 });
    void shroud;
    const stopSwitch = box(drill, 0.04, 0.03, 0.04, 0.07, 0.5, 0.1, 0xd2312b, { rough: 0.5 });
    reg(hits, stopSwitch, "drill-stop");
    holoTag(drill, "drill stop switch", 0.14, 0.7, 0.1, { css: SILD_CSS, w: 0.28 });
    const depthStop = cyl(drill, 0.012, 0.012, 0.2, -0.08, 0.3, -0.05, SILD_PAL.accent, { rough: 0.5, metal: 0.6, seg: 8 });
    reg(hits, depthStop, "depth-stop");
    holoTag(drill, "depth stop", -0.24, 0.42, -0.05, { css: SILD_CSS, w: 0.2 });
    const noShroudHit = box(drill, 0.3, 0.2, 0.3, 0, 0.12, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(drill, "pull the shroud off to see the mark?", 0, 0.32, -0.48, { css: "#d2312b", w: 0.56 });
    reg(hits, noShroudHit, "drill-without-shroud");
    const newSkirt = group(g, 1.1, 0.02, 1.7, 0);
    cyl(newSkirt, 0.075, 0.075, 0.02, 0, 0.12, 0, 0x1a1a1a, { rough: 0.8, seg: 16, open: true });
    box(newSkirt, 0.2, 0.08, 0.2, 0, 0.05, 0, 0x8a6d3b, { rough: 0.8 });
    holoTag(newSkirt, "new shroud skirt", 0, 0.28, 0, { css: SILD_CSS, w: 0.28 });
    reg(hits, newSkirt, "fit-new-skirt");

    const collector = group(g, -1.0, 0.02, 1.6, 0.3);
    cyl(collector, 0.22, 0.22, 0.55, 0, 0.3, 0, 0xc9a23f, { rough: 0.6, seg: 16 });
    box(collector, 0.4, 0.04, 0.4, 0, 0.6, 0, 0x2b2f34, { rough: 0.6 });
    for (const [x, z] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) ball(collector, 0.035, x, 0.035, z, 0x22262b, { rough: 0.8 });
    const filterLamp = ball(collector, 0.03, 0.12, 0.66, 0.12, 0xd2312b, { rough: 0.3, glow: true });
    reg(hits, filterLamp, "choked-filter");
    const filterLampOk = ball(collector, 0.03, 0.12, 0.66, 0.12, 0x59c97b, { rough: 0.3, glow: true });
    filterLampOk.visible = false;
    holoTag(collector, "filter indicator in the red", 0.12, 0.86, 0.12, { css: SILD_CSS, w: 0.42 });
    const dial = cyl(collector, 0.045, 0.045, 0.03, -0.12, 0.66, 0.12, SILD_PAL.accent, { rough: 0.5, metal: 0.4, seg: 14 });
    reg(hits, dial, "collector-dial");
    holoTag(collector, "airflow dial", -0.16, 0.8, 0.2, { css: SILD_CSS, w: 0.22 });
    const freshFilter = group(g, -1.6, 0.02, 2.2, 0);
    cyl(freshFilter, 0.1, 0.1, 0.24, 0, 0.13, 0, 0xf2f2f2, { rough: 0.9, seg: 14 });
    holoTag(freshFilter, "fresh filter", 0, 0.36, 0, { css: SILD_CSS, w: 0.22 });
    reg(hits, freshFilter, "swap-filter");
    // the collector hose, and the loose hose shown when it pops off the shroud
    const hoseOn = hose(g, [[-0.9, 0.55, 1.5], [-0.4, 0.3, 1.2], [0.1, 0.15, 0.95], [0.4, 0.11, 0.78]], 0.022, 0x2b2f34, { steps: 10, rough: 0.7 });
    const hoseOff = hose(g, [[-0.9, 0.55, 1.5], [-0.5, 0.25, 1.25], [-0.1, 0.06, 1.1], [0.15, 0.05, 1.15]], 0.022, 0x2b2f34, { steps: 10, rough: 0.7 });
    hoseOff.visible = false;

    // ------------------------------------------------------------- respirator, cleanup kit
    const maskShelf = group(g, -2.4, 0.02, 2.2, 0.2);
    box(maskShelf, 0.5, 0.04, 0.3, 0, 0.75, 0, SILD_PAL.trim, { rough: 0.6, metal: 0.4 });
    box(maskShelf, 0.04, 0.75, 0.04, -0.22, 0.375, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    box(maskShelf, 0.04, 0.75, 0.04, 0.22, 0.375, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    const mask = group(maskShelf, 0, 0.8, 0, 0);
    ball(mask, 0.06, 0, 0.04, 0, 0xe8e2d6, { rough: 0.7 });
    cyl(mask, 0.035, 0.035, 0.03, -0.06, 0.03, 0.03, 0xd96a8a, { rough: 0.6, seg: 12 });
    cyl(mask, 0.035, 0.035, 0.03, 0.06, 0.03, 0.03, 0xd96a8a, { rough: 0.6, seg: 12 });
    reg(hits, mask, "half-mask");
    holoTag(maskShelf, "half-mask respirator", 0, 1.06, 0, { css: SILD_CSS, w: 0.36 });
    const looseStrap = box(maskShelf, 0.2, 0.01, 0.01, 0, 0.72, 0.16, 0xd96a8a, { rough: 0.7 });
    void looseStrap;
    const strapHit = box(maskShelf, 0.35, 0.2, 0.2, 0, 0.55, 0.22, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(maskShelf, "start with the strap hanging loose?", 0, 0.42, 0.3, { css: "#d2312b", w: 0.56 });
    reg(hits, strapHit, "mask-strap-loose");

    const broom = group(g, -3.2, 0.02, 0.6, 0.3);
    cyl(broom, 0.015, 0.015, 1.2, 0, 0.62, 0, 0x8a6d3b, { rough: 0.8, seg: 8 });
    box(broom, 0.45, 0.06, 0.08, 0, 0.05, 0, 0x2b2f34, { rough: 0.9 });
    reg(hits, broom, "staged-broom");
    holoTag(broom, "dry broom staged", 0, 1.35, 0, { css: SILD_CSS, w: 0.28 });
    const dustPile = cyl(g, 0.18, 0.24, 0.05, -2.6, 0.045, 0.3, 0xcfc9bb, { rough: 0.95, seg: 12 });
    const sweepHit = box(g, 0.6, 0.3, 0.6, -2.6, 0.15, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sweep the dust into a pile?", -2.6, 0.4, 0.3, { css: "#d2312b", w: 0.46 });
    reg(hits, sweepHit, "dry-sweep-dust");
    const toolLocker = group(g, -3.6, 0.02, -1.4, 0.4);
    box(toolLocker, 0.6, 1.6, 0.4, 0, 0.8, 0, 0x5b6770, { rough: 0.6, metal: 0.4 });
    holoTag(toolLocker, "stow the broom here", 0, 1.75, 0, { css: SILD_CSS, w: 0.3 });
    reg(hits, toolLocker, "stow-broom");

    const airNozzle = group(g, 1.3, 0.02, 0.4, 0);
    cyl(airNozzle, 0.012, 0.012, 0.3, 0, 0.18, 0, 0xc0c4c8, { rough: 0.4, metal: 0.8, seg: 8 });
    box(airNozzle, 0.04, 0.08, 0.05, 0, 0.36, 0, 0xd2312b, { rough: 0.5 });
    hose(g, [[1.3, 0.05, 0.4], [1.8, 0.03, 0.2], [2.4, 0.03, -0.4]], 0.012, 0xd2312b, { steps: 6, rough: 0.7 });
    reg(hits, airNozzle, "blow-out-holes");
    holoTag(airNozzle, "blow the holes out with air?", 0, 0.55, 0, { css: "#d2312b", w: 0.46 });

    const hepaVac = group(g, 1.2, 0.02, 1.2, -0.3);
    cyl(hepaVac, 0.18, 0.18, 0.42, 0, 0.23, 0, 0x2a5c7a, { rough: 0.5, seg: 14 });
    box(hepaVac, 0.12, 0.06, 0.06, 0, 0.48, 0, 0x22262b, { rough: 0.6 });
    const wand = cyl(hepaVac, 0.015, 0.015, 0.5, -0.22, 0.3, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, wand, "hepa-wand");
    holoTag(hepaVac, "HEPA vacuum wand", 0, 0.66, 0, { css: SILD_CSS, w: 0.32 });

    // ------------------------------------------------------------- drill cart, upwind spot and marker
    const cart = group(g, -1.9, 0.02, -0.4, 0);
    box(cart, 0.6, 0.05, 0.4, 0, 0.45, 0, SILD_PAL.trim, { rough: 0.6, metal: 0.4 });
    box(cart, 0.6, 0.05, 0.4, 0, 0.15, 0, SILD_PAL.trim, { rough: 0.6, metal: 0.4 });
    for (const [x, z] of [[-0.27, -0.17], [0.27, -0.17], [-0.27, 0.17], [0.27, 0.17]]) { box(cart, 0.03, 0.42, 0.03, x, 0.3, z, 0x8b949d, { rough: 0.5, metal: 0.6 }); ball(cart, 0.04, x, 0.04, z, 0x22262b, { rough: 0.8 }); }
    for (let i = 0; i < 4; i++) box(cart, 0.1, 0.06, 0.08, -0.2 + i * 0.13, 0.51, 0, i % 2 ? 0x2f6f9f : 0xc9a23f, { rough: 0.6 });
    reg(hits, cart, "drill-cart");
    holoTag(cart, "drill cart", 0, 0.72, 0, { css: SILD_CSS, w: 0.2 });
    const upwindSpot = box(g, 0.8, 0.006, 0.8, 1.6, 0.045, 0.9, 0x59c97b, { rough: 0.6, opacity: 0.45, transparent: true, cast: false });
    hits["upwind-spot"] = upwindSpot;
    holoTag(g, "upwind set-up spot", 1.6, 0.25, 0.9, { css: "#59c97b", w: 0.32 });
    const upwindMarker = group(g, 2.8, 0.02, 0.2, 0);
    cyl(upwindMarker, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x59c97b, { rough: 0.5, seg: 8 });
    const markerFlag = box(upwindMarker, 0.26, 0.16, 0.01, 0.13, 1.0, 0, 0x59c97b, { rough: 0.6 });
    reg(hits, upwindMarker, "upwind-marker");
    const stopFlag = box(upwindMarker, 0.26, 0.16, 0.01, 0.13, 1.0, 0.012, 0xd2312b, { rough: 0.6 });
    stopFlag.visible = false;
    holoTag(upwindMarker, "upwind marker", 0, 1.3, 0, { css: "#59c97b", w: 0.24 });

    // ------------------------------------------------------------- rig-mounted core drill, water, slurry
    const rig = group(g, -0.8, 0.02, -1.4, 0);
    box(rig, 0.5, 0.04, 0.36, 0, 0.04, 0, 0x5b6770, { rough: 0.6, metal: 0.5 });
    box(rig, 0.06, 1.1, 0.06, -0.14, 0.6, 0, 0x8b949d, { rough: 0.5, metal: 0.7 });
    const coreMotor = group(rig, 0.05, 0.75, 0, 0);
    box(coreMotor, 0.16, 0.24, 0.18, 0, 0, 0, 0xc9a23f, { rough: 0.5, metal: 0.3 });
    const coreBit = cyl(coreMotor, 0.07, 0.07, 0.45, 0, -0.34, 0, 0xb9bec4, { rough: 0.3, metal: 0.9, seg: 16, open: true });
    void coreBit;
    const feedHandle = box(rig, 0.3, 0.03, 0.03, -0.32, 0.9, 0, 0x22262b, { rough: 0.6 });
    reg(hits, feedHandle, "core-feed");
    holoTag(rig, "core drill feed", -0.32, 1.12, 0, { css: SILD_CSS, w: 0.28 });
    const waterJug = group(g, -1.5, 0.02, -1.8, 0);
    cyl(waterJug, 0.16, 0.16, 0.5, 0, 0.27, 0, 0x2a5c7a, { rough: 0.5, seg: 14 });
    holoTag(waterJug, "core water supply", 0, 0.62, 0, { css: SILD_CSS, w: 0.3 });
    hose(g, [[-1.4, 0.5, -1.8], [-1.1, 0.6, -1.6], [-0.75, 0.55, -1.4]], 0.012, 0x6fa8c9, { steps: 6, rough: 0.7 });
    const slurryRing = cyl(g, 0.3, 0.3, 0.006, -0.75, 0.046, -1.4, 0x8a8579, { rough: 0.3, opacity: 0.5, transparent: true, cast: false, seg: 18 });
    hits["slurry-ring"] = slurryRing;
    const wetVac = group(g, 0.4, 0.02, -2.4, 0);
    cyl(wetVac, 0.2, 0.2, 0.46, 0, 0.25, 0, 0x22262b, { rough: 0.6, seg: 14 });
    reg(hits, wetVac, "wet-vac");
    holoTag(wetVac, "wet vacuum", 0, 0.62, 0, { css: SILD_CSS, w: 0.22 });

    // ------------------------------------------------------------- the neighbouring crew and their grinder
    const neighbour = standingFigure(g, -3.0, -2.5, { ry: 0.8, cloth: 0x5a4a3a, vest: 0xf27a1a, helmet: 0xf2f2f2, gloves: true });
    holoTag(neighbour, "next crew — grinding", 0, 1.95, 0, { css: SILD_CSS, w: 0.32 });
    const grinder = box(g, 0.2, 0.08, 0.1, -2.7, 0.95, -2.5, 0x2f6f9f, { rough: 0.5 });
    void grinder;

    // ------------------------------------------------------------- dust: own plume, drift plume, core water
    const plume = particles(g, 60, 0xd8d2c4, { size: 0.035, life: 1.1, additive: false, opacity: 0.45 });
    const drift = particles(g, 44, 0xcfc9bb, { size: 0.045, life: 1.6, additive: false, opacity: 0.35 });
    const coreWater = particles(g, 28, 0x8fb8d8, { size: 0.02, life: 0.5, additive: false, opacity: 0.5 });
    const driftHaze = box(g, 3.2, 1.4, 1.6, -1.6, 0.8, -1.6, 0xcfc9bb, { rough: 1, opacity: 0.16, transparent: true, cast: false });
    driftHaze.visible = false;

    // ------------------------------------------------------------- dust monitor, plan, log, radio, decon
    const monitor = group(g, -3.85, 0.02, 0.2, Math.PI / 2);
    box(monitor, 0.24, 0.18, 0.05, 0, 1.5, 0, 0x2b2f34, { rough: 0.6 });
    const monitorFace = decal(monitor, 0.22, 0.15, 0, 1.5, 0.026, signFace("DUST —\nLOW", { bg: "#0d1c24", accent: SILD_CSS, fg: "#bfeaf7", scale: 0.32 }), { px: 160, glow: true, ei: 0.7 });
    holoTag(monitor, "real-time dust monitor (indicative)", 0, 1.72, 0, { css: SILD_CSS, w: 0.5 });

    const board = group(g, 2.6, 0.02, -2.6, 0.1);
    holoPanel(board, 0.98, 0.64, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#211d16"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = SILD_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("EXPOSURE CONTROL PLAN — CORE 2", w * 0.06, h * 0.13);
      ctx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Hand drill: shroud + collector, HEPA vac holes", "Core drill: water delivered to the bit", "No dry sweeping, no compressed air", "Half-mask in the enclosed core (this plan)", "Competent person: on the crew radio"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.27 + i * 0.13)));
    }, { accent: SILD_ACCENT });
    reg(hits, board, "exposure-plan");

    const log = group(g, 3.4, 0.02, -1.7, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("DUST LOG —\nCORE 2", { bg: "#171108", accent: SILD_CSS, fg: "#efeade", scale: 0.26 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "dust log", 0, 1.62, 0, { css: SILD_CSS, w: 0.2 });
    reg(hits, log, "dust-log");
    const crewRadio = group(g, 3.6, 0.02, -0.9, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: SILD_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: SILD_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const decon = group(g, -2.6, 0.02, -2.2, 0.2);
    box(decon, 0.9, 0.04, 0.4, 0, 0.8, 0, 0xc9ccd0, { rough: 0.5, metal: 0.4 });
    const clothesVac = group(decon, -0.3, 0.84, 0, 0);
    cyl(clothesVac, 0.06, 0.06, 0.16, 0, 0.08, 0, 0x2a5c7a, { rough: 0.5, seg: 12 });
    reg(hits, clothesVac, "vac-clothing");
    holoTag(decon, "HEPA vac clothing", -0.3, 1.18, 0, { css: SILD_CSS, w: 0.3 });
    const maskBag = group(decon, 0, 0.84, 0, 0);
    box(maskBag, 0.14, 0.1, 0.1, 0, 0.05, 0, 0xe8e2d6, { rough: 0.8 });
    reg(hits, maskBag, "remove-mask");
    holoTag(decon, "mask off, bagged", 0, 1.32, 0, { css: SILD_CSS, w: 0.28 });
    const washStation = group(decon, 0.3, 0.84, 0, 0);
    box(washStation, 0.18, 0.14, 0.18, 0, 0.07, 0, 0x6fa8c9, { rough: 0.3 });
    reg(hits, washStation, "wash-up");
    holoTag(decon, "wash hands and face", 0.3, 1.18, 0, { css: SILD_CSS, w: 0.32 });
    for (const x of [-0.4, 0.4]) box(decon, 0.04, 0.8, 0.04, x, 0.4, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });

    const laborer = standingFigure(g, 0.0, 2.3, { ry: Math.PI, cloth: 0x4a4038, vest: SILD_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(laborer, "laborer", 0, 1.9, 0, { css: SILD_CSS, w: 0.18 });
    for (const [x, z] of [[3.4, 2.2], [-3.4, 2.5], [2.6, 1.8]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // Boxed anchors on a pallet, a stack of handrail sections and a rack of
    // spare bits — the ordinary stock an anchor-setting crew keeps at hand.
    const pallet = group(g, 2.6, 0.02, 2.4, 0.2);
    box(pallet, 0.9, 0.1, 0.7, 0, 0.05, 0, 0x8a6d3b, { rough: 0.9 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 2; k++) box(pallet, 0.18, 0.12, 0.26, -0.3 + c * 0.2, 0.17 + k * 0.13, -0.22 + r * 0.22, (r + c + k) % 2 ? 0xc9a23f : 0xb88f32, { rough: 0.8 });
    const rails = group(g, -3.3, 0.02, 1.8, 0.1);
    for (let i = 0; i < 6; i++) cyl(rails, 0.025, 0.025, 1.6, 0, 0.04 + i * 0.05, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    const bitRack = group(g, 3.6, 0.02, 0.9, -Math.PI / 2);
    box(bitRack, 0.6, 0.04, 0.2, 0, 0.9, 0, SILD_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 8; i++) cyl(bitRack, 0.008 + (i % 3) * 0.004, 0.008 + (i % 3) * 0.004, 0.3 + (i % 4) * 0.05, -0.26 + i * 0.075, 0.75, 0, 0xb9bec4, { rough: 0.3, metal: 0.9, seg: 6 });
    for (const x of [-0.26, 0.26]) box(bitRack, 0.03, 0.9, 0.03, x, 0.45, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });

    const drillOrigin = new THREE.Vector3(0.28, 0.12, 0.9);
    const coreOrigin = new THREE.Vector3(-0.75, 0.1, -1.4);
    const driftOrigin = new THREE.Vector3(-2.6, 1.0, -2.3);
    let hoseLoose = false, drifting = false, driftT = 0;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.8, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { tornFlap.visible = false; skirtNew.visible = true; filterLamp.visible = false; filterLampOk.visible = true; broom.visible = false; dustPile.visible = false; }
        if (step.id === "upwind-setup") cart.position.set(1.6, 0.02, 0.9);
        if (step.id === "drill-holes") { for (const m of holeMarks) m.visible = false; for (const h of drilledHoles) h.visible = true; }
        if (step.id === "slurry-pickup") slurryRing.visible = false;
        if (step.id === "close-out") repaint(log.userData.face, signFace("DUST LOG —\nLOGGED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.26 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("CORE 2 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "shroud-hose-off") { hoseOn.visible = false; hoseOff.visible = true; hoseLoose = true; repaint(monitorFace, signFace("DUST —\nHIGH", { bg: "#3a0d0d", accent: "#d2312b", fg: "#ffd6d6", scale: 0.32 })); }
        if (it.id === "dust-drift") { drifting = true; driftT = 0; driftHaze.visible = true; repaint(monitorFace, signFace("DUST —\nHIGH", { bg: "#3a0d0d", accent: "#d2312b", fg: "#ffd6d6", scale: 0.32 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "shroud-hose-off") { hoseOff.visible = false; hoseOn.visible = true; hoseLoose = false; plume.visible = false; }
        if (it.id === "dust-drift") { drifting = false; driftHaze.visible = false; drift.visible = false; markerFlag.visible = false; stopFlag.visible = true; }
        repaint(monitorFace, signFace("DUST —\nLOW", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.32 }));
      },
      animate(t, dt, session) {
        const step = session?.step;
        const reduce = SILD_STILL;
        if (session?.turn && step?.id === "depth-stop") depthStop.position.y = 0.3 - session.turn.amount * 0.06;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "collector-airflow") dial.rotation.y = gg.t * Math.PI * 1.5;
        // Own plume: only when the hose is off (the shroud captures the rest).
        plume.visible = hoseLoose && !reduce;
        if (plume.visible) plume.userData.step(dt, drillOrigin, 0.08, 0.5, 0.2);
        // Core water at the bit while coring.
        coreWater.visible = step?.id === "core-feed" && !!session?.holding && !reduce;
        if (coreWater.visible) coreWater.userData.step(dt, coreOrigin, 0.1, 0.2, -2);
        if (coreMotor && step?.id === "core-feed" && session?.holding) coreMotor.position.y = 0.75 - Math.min(0.2, (coreMotor.userData.fed = (coreMotor.userData.fed ?? 0) + dt * 0.02));
        // Drift plume: the next crew's dust carried toward the core on the draught.
        drift.visible = drifting && !reduce;
        if (drift.visible) {
          driftT = Math.min(1, driftT + dt / 6);
          driftOrigin.set(-2.6 + driftT * 2.2, 1.0, -2.3 + driftT * 0.9);
          drift.userData.step(dt, driftOrigin, 0.6, 0.15, 0);
        }
        void CITY; void t;
      },
    };
  },
};
