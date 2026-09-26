import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Slab Screed, Bull Float & Trowel VR — Cement masons and
// plasterers, station one.
//
// An OPCMIA cement mason finishing crew placing and closing a slab on grade:
// the screed rails checked to grade, the pour walked for the puncture and
// struck-by hazards a placement crew lives with, the mix accepted, the slab
// struck off across the rails, bull floated once, edged and jointed, hand
// troweled after the bleed water leaves, and cured before the crew signs off.
// The mix design, the slump band and the cure time are the specification's,
// never a number this file invents.

const CMSB_ACCENT = 0xf2c14b;
const CMSB_CSS = "#f2c14b";
const CMSB_PAL = palette("construction");

export const SIM_CM_SLAB_SCREED_BULL_FLOAT_AND_TROWEL = {
  id: "cm-slab-screed-bull-float-and-trowel",
  index: "700",
  domain: "Construction & Structural Trades",
  trade: "Cement mason and finisher — OPCMIA Local 300",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; ACI concrete field testing technician certification and ACI 302 guidance on floor and slab construction; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction (1926.701 impalement protection); OSHA 29 CFR 1926.1153 respirable crystalline silica; ANSI/ASSP A10.9 concrete and masonry construction safety requirements",
  name: "Slab Screed, Bull Float & Trowel",
  title: simTitle("Slab Screed, Bull Float & Trowel"),
  tagline: "A slab on grade closed right: the screed rails checked, the pour walked for bare dowels and a swinging chute, the mix accepted, the slab struck off across the rails, floated once, edged and jointed, hand troweled after the bleed water leaves, and cured before the crew signs off",
  accent: CMSB_ACCENT,
  accentCss: CMSB_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "closed-clean", name: "Closed Clean", note: "A slab struck off, floated once, troweled after the bleed water left and cured — no burns, no dry cutting, first time" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Finish Crew",
    currency: "SLAB",
    ranks: ["Laborer", "Finisher", "Cement Mason", "Lead Finisher", "Finish Crew Certified"],
    badges: [
      { id: "walked-it-first", name: "Walked It First", note: "The pre-pour walk found the bare dowel and the chute line before the truck backed in, first time", test: AWARD.stepClean("pour-walk") },
      { id: "no-bare-hands", name: "No Bare Hands In It", note: "Never bare skin in the mix, never under the chute, never a dry grind, never a foot on a bare dowel", test: AWARD.safe },
      { id: "true-to-grade", name: "True To Grade", note: "The screed and the trowel both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-close", name: "Clean Close", note: "No corrections through the whole close", test: AWARD.clean },
      { id: "held-the-strike", name: "Held The Strike-Off", note: "The screed pass held for the whole rail", test: AWARD.unbroken },
      { id: "closed-by-break", name: "Closed By Break", note: "Struck off, floated, troweled and cured inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-mix": "You went to work the fresh mix bare-handed. Wet cement is strongly alkaline and it burns skin slowly, often without pain until hours later, and repeated exposure leaves a mason's hands cracked and ulcerated for good. Gloves and boots stay on for every hour the mix is wet, and any splash gets washed off at once.",
    "dry-grind-high-spot": "You ran the grinder dry on the high spot instead of cutting it wet. Grinding hardened concrete without water or a vacuum shroud throws respirable crystalline silica into the air at many times the permissible limit, in dust fine enough to reach deep into the lungs and never leave. OSHA 29 CFR 1926.1153 exists because this exposure was ordinary before it was controlled.",
    "under-chute": "You stood in the discharge chute's swing to watch the mix come out. A loaded chute swings with the whole weight of the truck's mix behind it and the driver working blind on your side; a foot or a hand caught under it is not a bruise, and the crew stays clear of the arc the chute travels before the truck backs in, not after.",
    "bare-dowel-foot": "You stepped square onto the bare load transfer dowel sticking up out of the sub-base. An upright dowel with no cap is exactly the impalement hazard OSHA 29 CFR 1926.701 requires capped or bent over before anyone works near it, and a fall onto one drives it through a boot the same as it would through bare skin.",
  },

  lateNotes: {
    "strike-rail": "The screed only crosses the rail once the mix has actually been accepted — striking off a mix nobody tested is finishing a slab that may already be the wrong slab.",
    "bull-float": "The float goes on once the slab is struck off level; floating a slab that is still high in one corner just moves the same low spot somewhere else.",
    "trowel-blade": "Troweling starts once the bleed sheen has left the surface — working it in early is the single fastest way to weaken the top inch of the slab.",
  },

  steps: [
    {
      id: "job-card", kind: "select", target: "job-card",
      title: "Read the slab's job card",
      cue: "Read the mix design, the slump band, the sub-base and vapor barrier note, and the jointing pattern for today's pour.",
      why: "A slab is only as good as the sub-base under it and the mix the job card names for it, and neither one is a cement mason's call to change on site. The card carries the slump band the mix has to test inside, the jointing layout the saw or hand joints follow, and the cure method — reading it before the truck backs in is what keeps the crew from finishing to a mix or a joint pattern this slab was never designed for.",
    },
    {
      id: "pour-walk", kind: "find", noHint: true,
      targets: ["bare-dowel", "loose-rail", "debris-on-subbase"],
      itemNames: { "bare-dowel": "an uncapped load transfer dowel", "loose-rail": "a screed rail not pinned to grade", "debris-on-subbase": "debris left on the vapor barrier" },
      itemNotes: {
        "bare-dowel": "A load transfer dowel at the joint line has no cap on it, standing straight up out of the sub-base where the crew will be walking and kneeling all morning.",
        "loose-rail": "One screed rail has a stake that never got driven home — the rail rocks under a hand, which means the screed will ride false along its whole length.",
        "debris-on-subbase": "Wood scrap and a coil of tie wire are sitting on the vapor barrier where they will end up cast into the slab the moment concrete covers them.",
      },
      title: "Walk the sub-base before the truck backs in",
      cue: "Walk the screed rails, the dowels and the vapor barrier, and click every defect you find.",
      why: "None of this costs more than a few minutes to put right while the truck is still on its way and nothing is wet yet. Wait until the pour has started and the same three things become a rail that screeds a whole slab out of grade, a dowel driven straight into somebody's boot, and debris that is now permanently cast into the finished floor.",
    },
    {
      id: "pin-rails", kind: "sequence", anyOrder: true,
      targets: ["cap-dowel", "pin-rail", "clear-debris"],
      itemNames: { "cap-dowel": "dowel capped", "pin-rail": "rail pinned to grade", "clear-debris": "debris cleared" },
      title: "Correct what the walk found",
      cue: "Cap the dowel, pin the loose rail to grade, and clear the debris off the vapor barrier.",
      why: "Writing a defect down and leaving it alone teaches the crew the sub-base has been dealt with, which is a worse position than never having spotted it at all — everyone now works around it on the assumption somebody else already did. Actually capping, pinning and clearing it is the only thing that makes the walk anything more than paperwork.",
    },
    {
      id: "chute-clear", kind: "select", target: "chute-zone",
      title: "Clear the chute's swing",
      cue: "Move the crew clear of the arc the discharge chute swings through before the truck backs in.",
      why: "The driver works the chute from the cab, mostly blind to exactly where the crew is standing on the far side of the truck, and a loaded chute swings with the full weight of the mix in it. The zone is cleared before the truck ever backs up to the sub-base, not watched once it is already swinging.",
    },
    {
      id: "slump-check", kind: "gauge", target: "slump-cone",
      title: "Accept the mix on slump",
      cue: "Take the slump off the first truck and commit inside the job card's band before any of it is struck off.",
      why: "Slump is the field proof that the truck delivered the mix the job card ordered, not a mix somebody watered down on the way over to make it easier to place. A slab finished from an over-wet mix looks fine going down and dusts, crazes and curls within its first year — the slump test is the only check that happens before that damage is already built in.",
      gauge: { label: "SLUMP", speed: 0.7, green: [0.42, 0.58], readout: (t) => `${(t * 10).toFixed(1)} in`, missNote: "Outside the job card's band — reject the load or have it adjusted with admixture at the plant, never with a hose on site." },
    },
    {
      id: "place", kind: "track", target: "chute-control", seconds: 6,
      title: "Place the slab across the bay",
      cue: "Guide the chute to fill the bay evenly across the rails, keeping ahead of the screed without burying it.",
      why: "Placed too far ahead of the screed, fresh mix starts its set before it is struck off and the crew is fighting stiff concrete by the far end of the rail; placed too thin behind it, the screed rides low pockets that read as birdbaths in the finished floor. An even fill across the rails is what lets the screed do its one job — cutting the surface to the plane the rails already fix.",
      track: { start: 0.15, green: [0.35, 0.55], rise: 0.55, fall: 0.5, drift: 0.12, label: "FILL RATE", readout: (v) => (v < 0.35 ? "screed catching up to bare rail" : v > 0.55 ? "burying the screed" : "even with the rail") },
      holdBreakNote: "The fill fell out of band with the screed. Bring the rate back even with the rails and hold it there.",
    },
    {
      id: "strike-off", kind: "hold", target: "strike-rail", seconds: 5,
      title: "Strike the slab off across the rails",
      cue: "Draw the straightedge across the screed rails in a sawing motion, carrying the surplus ahead of the blade.",
      why: "The screed rail is the one reference this slab's whole flatness is built on, and the straightedge does nothing but cut the surface down to that plane — every dip left in this pass is a dip the bull float and the trowel can only polish, never remove. Carried steadily in a sawing motion with the surplus pushed ahead of it, the pass leaves a true, if rough, surface for the float to close.",
      holdBreakNote: "The straightedge lifted off the rail mid-pass and rode over a low spot without cutting it. Reset at the low end and draw the pass again.",
    },
    {
      id: "float", kind: "gauge", target: "bull-float",
      title: "Bull float once, flat, no more",
      cue: "Pass the bull float over the struck-off surface and commit once the surface reads flat and closed — a second pass works water back in.",
      why: "One bull float pass closes the voids the screed left and embeds the largest aggregate just under the surface, which is exactly the surface the trowel needs later. A slab floated a second or third time for a cosmetic sheen pulls fines and bleed water back to the top, and that extra water is strength the cylinder will be missing in twenty-eight days.",
      gauge: { label: "FLOAT", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "still open — pass again" : t <= 0.6 ? "closed, flat — stop" : "over-floated — working water back in"), missNote: "Not a clean single pass — commit once the surface first reads flat and closed." },
    },
    {
      id: "edge-joint", kind: "sequence",
      targets: ["edge-tool", "hand-joint"],
      itemNames: { "edge-tool": "slab edges rounded", "hand-joint": "control joints hand-tooled" },
      title: "Edge the slab and hand-tool the joints",
      cue: "Round the perimeter edges with the edger, then hand-tool the control joints to the job card's layout.",
      why: "A square, un-eased edge is the first place a slab chips under a hand truck or a pallet jack, and a control joint cut in the wrong place, or not cut at all before the slab shrinks, is a crack the slab draws for itself somewhere the job card never planned it. Both are done while the surface is still plastic enough to tool cleanly.",
      outOfOrderNote: "Edges first, then the hand joints — the edger needs the surface a shade stiffer than the joints do, and doing them in order keeps both tools from dragging in mix that is still too soft.",
    },
    {
      id: "bleed-wait", kind: "gauge", target: "bleed-check",
      title: "Wait out the bleed water",
      cue: "Watch the surface sheen and commit only once the bleed water has gone and the surface will take a footprint without water showing.",
      why: "Troweling a surface that is still shedding bleed water works that water straight back down into the top inch of the slab — the inch that carries every bit of foot and wheel traffic this floor will ever see. Waiting for the sheen to leave and the surface to firm up under a boot print is the difference between a hard-troweled floor and a soft, dusting one.",
      gauge: { label: "SURFACE", speed: 0.65, green: [0.5, 0.68], readout: (t) => (t < 0.5 ? "still bleeding" : t > 0.68 ? "going off" : "sheen gone, ready"), missNote: "Too early works water back in, too late tears the surface — wait for the sheen to leave and commit there." },
    },
    {
      id: "hand-trowel", kind: "turn", target: "trowel-blade",
      title: "Hand trowel the surface hard and flat",
      cue: "Work the steel trowel in overlapping arcs, flattening the blade as the surface hardens.",
      why: "Hand troweling densifies the top skin of the slab into the hard, dust-resistant wear surface the finish depends on, and it is done in the same overlapping-arc pattern every cement mason is taught precisely because a pattern skipped in one spot leaves that spot softer than the rest of the floor for its whole service life.",
      turn: { turns: 1, axis: "y", label: "TROWEL" },
    },
    {
      id: "cure", kind: "drag", target: "cure-compound",
      title: "Apply the curing compound",
      cue: "Carry the sprayer to the finished slab and apply the curing compound evenly across the whole surface.",
      why: "Curing is not cleanup, it is the last structural step: a slab that is allowed to dry out in open air instead of curing under a sealed membrane loses a real share of its design strength and craze-cracks across the whole surface, undoing every careful pass that came before it. The compound goes on while the surface is still damp enough to seal in the water the cement needs to keep hydrating.",
      drag: { to: "cure-zone", radius: 0.6, missNote: "Not across the slab — the curing compound has to cover the whole finished surface, not a strip of it." },
    },
    {
      id: "final-walk", kind: "find", noHint: true,
      targets: ["tool-left-on-slab"],
      itemNames: { "tool-left-on-slab": "a trowel left lying on the curing slab" },
      itemNotes: { "tool-left-on-slab": "A steel trowel has been left flat on the fresh slab under the curing compound — it leaves a permanent mark in the surface and a tripping edge if it stays there overnight." },
      title: "Walk the finished slab before the crew leaves",
      cue: "Walk the cured surface one more time and click anything left on it.",
      why: "A slab that reads finished from the doorway can still have a tool, a stake or a scrap of debris sitting on the curing compound, and every one of those leaves either a permanent surface defect or a trip hazard for whoever walks the bay next in the dark. The last walk of the day catches that while it is still one trowel to pick up instead of a mark ground out later.",
    },
    {
      id: "close-out", kind: "select", target: "close-log",
      title: "Log the slab",
      cue: "Record the mix accepted, the dowel capped, the joints cut and the cure applied.",
      why: "The finish log is how the foreman and the inspector both know this slab was closed to the job card rather than to whatever the crew remembers by the end of the shift — the mix that was actually accepted, the joints that were actually cut where the plan called for them, and the cure that actually went on before the slab was left for the night.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: slab closed and cured. Then check in with the crew about the chute and the grinder.",
      why: "Tomorrow's saw cut and the next bay's pour both get scheduled off whatever gets said on this call, so the foreman hears it straight rather than secondhand. Say out loud, too, that a hand got close to the chute and the grinder ran dry longer than it should have — that is what the check-in is actually for, and the OPCMIA member assistance line is worth naming in the same breath.",
    },
  ],

  interrupts: [
    {
      id: "truck-backing-blind",
      kind: "Truck backing toward the crew",
      after: "chute-clear", delay: 2, seconds: 12,
      alert: "The second truck is backing toward the sub-base without its spotter — nobody has eyes on the crew from the cab.",
      cue: "Get the spotter in front of the truck before it backs any closer.",
      target: "spotter-whistle",
      why: "A truck backing onto a sub-base full of rails, stakes and a finishing crew is working blind from the cab no matter how careful the driver is, and the spotter's whistle and hand signal are the only channel that actually reaches him. The truck stops moving the instant the spotter is not visible in the mirror, which is exactly what an unwatched back-up removes.",
      missNote: "The truck kept backing with no spotter visible; it stopped a step short of the screed rail with two finishers still crouched beside it.",
      wrongNote: "The spotter's whistle — a truck backing blind onto the sub-base needs eyes in front of it before it moves another foot.",
    },
    {
      id: "grinder-dust-cloud",
      kind: "Dry grinding dust drifting across the crew",
      after: "edge-joint", delay: 2, seconds: 12,
      alert: "A laborer at the next bay has started dry-grinding a high spot with no water and no vacuum shroud, and the dust is drifting straight across the finishing crew.",
      cue: "Get the water hose on the grinder and stop the dry grinding.",
      target: "water-hose",
      why: "A grinder run dry on hardened concrete puts respirable crystalline silica into the air at many times the permissible limit, and the finishing crew crouched at slab height nearby is breathing all of it. The silica rule does not allow dry grinding where wet methods will do; the hose feeds water to the wheel and the dry grinding stops until it does.",
      missNote: "The dry grinding went on through the rest of the edging; a haze hung over the bay and the crew was still coughing it out by the time the joints were cut.",
      wrongNote: "The water hose — the dust cloud over the crew comes first, and wetting the wheel down is what stops it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMSB_ACCENT);
    const ground = box(g, 8.6, 0.04, 6.8, 0, 0.02, -0.4, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8f8b80", tone2: "#838075" }), { repeat: 4, px: 512 }), { rough: 0.95, color: 0xd8d3c4 });

    // ------------------------------------------------------------- sub-base and bay
    const bay = group(g, 0, 0.02, -1.6);
    const vaporBarrier = box(bay, 4.4, 0.008, 3.0, 0, 0.004, 0, 0x2b2f33, { rough: 0.4, metal: 0.1, opacity: 0.85, transparent: true });
    void vaporBarrier;
    const railL = box(bay, 4.4, 0.05, 0.05, 0, 0.045, -1.4, CMSB_PAL.trim, { rough: 0.5, metal: 0.5 });
    const railR = box(bay, 4.4, 0.05, 0.05, 0, 0.045, 1.4, CMSB_PAL.trim, { rough: 0.5, metal: 0.5 });
    void railR;
    const railStakeLoose = cyl(bay, 0.02, 0.02, 0.3, -1.6, 0.06, -1.4, 0x8a6a42, { rough: 0.85, seg: 6 });
    railStakeLoose.rotation.z = 0.2;
    reg(hits, railStakeLoose, "loose-rail");
    holoTag(bay, "loose screed rail", -1.6, 0.32, -1.4, { css: CMSB_CSS, w: 0.3 });
    for (const x of [-2.0, -0.6, 0.6, 2.0]) cyl(bay, 0.02, 0.02, 0.3, x, 0.06, 1.4, 0x8a6a42, { rough: 0.85, seg: 6 });

    const dowelBare = cyl(bay, 0.012, 0.012, 0.35, 1.4, 0.18, 0, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, dowelBare, "bare-dowel");
    holoTag(bay, "uncapped dowel", 1.4, 0.42, 0, { css: "#d2312b", w: 0.28 });
    const dowelFootHit = box(bay, 0.3, 0.3, 0.3, 1.4, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "step square on the dowel?", 1.4, 0.6, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, dowelFootHit, "bare-dowel-foot");
    const dowelCap = ball(bay, 0.045, 1.4, 0.36, 0, 0xf2703b, { rough: 0.8, seg: 10, seg2: 8 });
    dowelCap.visible = false;

    const debris = group(bay, -1.0, 0.02, 0.4);
    box(debris, 0.35, 0.03, 0.12, 0, 0.015, 0, 0x8a7a55, { rough: 0.9 });
    cyl(debris, 0.05, 0.05, 0.06, 0.2, 0.03, 0.1, 0x9a6a3a, { rough: 0.7, seg: 8 });
    reg(hits, debris, "debris-on-subbase");
    holoTag(debris, "debris on the barrier", 0, 0.24, 0, { css: CMSB_CSS, w: 0.34 });

    // Fix-step targets — the tools that actually correct what the walk found,
    // distinct from the defects themselves so the sequence step has its own
    // registered objects to click.
    const capSupply = group(bay, 1.7, 0.02, 0.5);
    box(capSupply, 0.16, 0.1, 0.12, 0, 0.05, 0, 0xf2703b, { rough: 0.8 });
    holoTag(capSupply, "fit a dowel cap", 0, 0.24, 0, { css: CMSB_CSS, w: 0.28 });
    reg(hits, capSupply, "cap-dowel");
    const stakeMallet = group(bay, -1.9, 0.02, -1.1, 0.2);
    box(stakeMallet, 0.08, 0.16, 0.08, 0, 0.1, 0, 0x8a6a42, { rough: 0.85 });
    box(stakeMallet, 0.03, 0.3, 0.03, 0, 0.28, 0, 0x8a6a42, { rough: 0.85 });
    holoTag(stakeMallet, "pin the rail", 0, 0.5, 0, { css: CMSB_CSS, w: 0.24 });
    reg(hits, stakeMallet, "pin-rail");
    const debrisBroom = group(bay, -1.4, 0.02, 0.7, -0.3);
    box(debrisBroom, 0.3, 0.05, 0.1, 0, 0.05, 0, 0x8a6a42, { rough: 0.9 });
    box(debrisBroom, 0.03, 0.5, 0.03, 0, 0.28, -0.15, 0x8a6a42, { rough: 0.85 });
    holoTag(debrisBroom, "clear the debris", 0, 0.6, -0.15, { css: CMSB_CSS, w: 0.28 });
    reg(hits, debrisBroom, "clear-debris");

    // Slab surface: hidden until struck off, then grows to fill the bay.
    const slabTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#9a968c", tone2: "#8e8a80" }), { repeat: 3, px: 512 }), { rough: 0.65, color: 0xe4dfd0 });
    const slabMesh = box(bay, 4.3, 0.08, 2.7, 0, 0.04, 0, 0xffffff);
    slabMesh.material = slabTex;
    slabMesh.scale.x = 0.02;
    slabMesh.visible = false;
    const wetSheen = box(bay, 4.3, 0.005, 2.7, 0, 0.086, 0, 0xbfd8e6, { rough: 0.1, opacity: 0.35, transparent: true, cast: false });
    wetSheen.visible = false;

    const strikeHit = box(bay, 4.4, 0.3, 3.0, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "strike-off — straightedge", 0, 0.4, -1.4, { css: CMSB_CSS, w: 0.4 });
    reg(hits, strikeHit, "strike-rail");

    // ------------------------------------------------------------- concrete truck and chute
    const truck = group(g, 3.4, 0.02, -3.4, -0.4);
    box(truck, 1.4, 1.0, 2.6, 0, 0.7, 0, 0x53606b, { rough: 0.6, metal: 0.3 });
    const drum = cyl(truck, 0.55, 0.45, 1.6, 0, 1.35, -0.4, 0xe4622a, { rough: 0.5, metal: 0.4, seg: 16 });
    drum.rotation.x = Math.PI / 2 * 0.18;
    for (const [x, z] of [[-0.6, -1.1], [0.6, -1.1], [-0.6, 1.1], [0.6, 1.1]]) cyl(truck, 0.28, 0.28, 0.22, x, 0.28, z, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    const chute = group(truck, 0.5, 0.5, 1.5, -0.3);
    box(chute, 0.16, 0.06, 1.1, 0, 0, 0.5, CMSB_PAL.accent, { rough: 0.6, metal: 0.4 });
    const chuteZone = group(g, 2.6, 0.02, -1.8);
    const chuteRing = slab(chuteZone, 1.8, 0.01, 1.6, 0, 0.09, 0, 0xd2312b, { rough: 0.7, opacity: 0.2, transparent: true, cast: false });
    void chuteRing;
    const chuteHit = box(chuteZone, 1.6, 1.2, 1.4, 0, 0.7, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(chuteZone, "stand under the chute?", 0, 1.4, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, chuteHit, "under-chute");
    const clearZone = slab(g, 2.0, 0.01, 1.2, -2.6, 0.105, -0.6, 0x59c97b, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "crew clear of the chute", -2.6, 0.4, -0.6, { css: "#59c97b", w: 0.42 });
    reg(hits, clearZone, "chute-zone");
    const chuteCtl = box(g, 0.18, 0.24, 0.08, 0.4, 0.9, -1.0, 0x2b2f34, { rough: 0.6 });
    box(g, 0.1, 0.05, 0.03, 0.4, 0.98, -0.95, CMSB_PAL.accent, { emissive: CMSB_PAL.accent, ei: 0.9, rough: 0.4, cast: false });
    holoTag(g, "chute control", 0.4, 1.16, -1.0, { css: CMSB_CSS, w: 0.26 });
    reg(hits, chuteCtl, "chute-control");
    const flow = particles(g, 40, 0xa8a49a, { size: 0.03, life: 0.5, additive: false, opacity: 0.8 });

    // ------------------------------------------------------------- test bench
    const bench = group(g, -2.9, 0.02, 1.2, 0.4);
    box(bench, 1.2, 0.7, 0.55, 0, 0.35, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const slumpCone = cyl(bench, 0.06, 0.11, 0.28, -0.3, 0.84, 0, 0xb9bec4, { rough: 0.5, metal: 0.6, seg: 16, open: true });
    const slumpRead = instrument(bench, -0.3, 0.72, -0.2, { idle: "--.- in", color: CMSB_CSS, w: 0.12, d: 0.18 });
    holoTag(bench, "slump cone", -0.3, 1.02, 0, { css: CMSB_CSS, w: 0.22 });
    reg(hits, slumpCone, "slump-cone");

    // ------------------------------------------------------------- tools
    const float = group(g, -1.6, 0.02, 1.9, 0.2);
    box(float, 0.9, 0.03, 0.22, 0, 0.03, 0, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    box(float, 0.06, 0.5, 0.05, -0.3, 0.28, 0, 0x8a6a42, { rough: 0.85 });
    holoTag(float, "bull float", 0, 0.55, 0, { css: CMSB_CSS, w: 0.24 });
    reg(hits, float, "bull-float");
    const edger = box(g, 0.2, 0.05, 0.14, -0.9, 0.045, 1.9, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(g, "edger", -0.9, 0.24, 1.9, { css: CMSB_CSS, w: 0.18 });
    reg(hits, edger, "edge-tool");
    const jointer = box(g, 0.18, 0.05, 0.12, -0.55, 0.045, 1.9, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(g, "hand jointer", -0.55, 0.24, 1.9, { css: CMSB_CSS, w: 0.24 });
    reg(hits, jointer, "hand-joint");
    const bleedPanel = instrument(g, -2.0, 0.5, 0.4, { idle: "--", color: CMSB_CSS, w: 0.14, d: 0.22, ry: 0.4 });
    holoTag(g, "surface — bleed water", -2.0, 0.75, 0.4, { css: CMSB_CSS, w: 0.42 });
    reg(hits, bleedPanel, "bleed-check");
    const trowel = group(g, 0.6, 0.02, 1.9, -0.3);
    box(trowel, 0.5, 0.015, 0.18, 0, 0.02, 0, 0xdfe6ec, { rough: 0.3, metal: 0.7 });
    box(trowel, 0.05, 0.14, 0.05, -0.24, 0.09, 0, 0x8a6a42, { rough: 0.85 });
    holoTag(trowel, "steel trowel", 0, 0.32, 0, { css: CMSB_CSS, w: 0.24 });
    reg(hits, trowel, "trowel-blade");
    const cureSprayer = group(g, 2.1, 0.02, 1.9, 0.2);
    cyl(cureSprayer, 0.14, 0.14, 0.5, 0, 0.28, 0, 0x59c97b, { rough: 0.6, seg: 12 });
    cyl(cureSprayer, 0.02, 0.02, 0.3, 0.12, 0.5, 0, 0x2b2f34, { rough: 0.6, seg: 8 });
    holoTag(cureSprayer, "cure compound sprayer", 0, 0.68, 0, { css: CMSB_CSS, w: 0.4 });
    reg(hits, cureSprayer, "cure-compound");
    const cureZoneHit = box(bay, 4.3, 0.1, 2.7, 0, 0.13, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cure-zone"] = cureZoneHit;
    const cureFilm = box(bay, 4.3, 0.004, 2.7, 0, 0.1, 0, 0xbfe6cf, { rough: 0.3, opacity: 0.001, transparent: true, cast: false });
    const leftTrowel = box(bay, 0.5, 0.015, 0.18, 1.2, 0.11, 0.6, 0xdfe6ec, { rough: 0.3, metal: 0.6 });
    reg(hits, leftTrowel, "tool-left-on-slab");
    holoTag(bay, "trowel left on the slab", 1.2, 0.32, 0.6, { css: CMSB_CSS, w: 0.32 });

    // ------------------------------------------------------------- grinder hazard (next bay)
    const nextBay = group(g, -3.6, 0.02, -3.2);
    const grinder = group(nextBay, 0, 0, 0, -0.4);
    box(grinder, 0.16, 0.14, 0.32, 0, 0.14, 0, 0x2b2f34, { rough: 0.6 });
    const disc = cyl(grinder, 0.09, 0.09, 0.012, 0, 0.11, 0.18, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 20 });
    disc.rotation.x = Math.PI / 2;
    holoTag(grinder, "grinder — dry cutting the high spot", 0, 0.42, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, grinder, "dry-grind-high-spot");
    const dust = particles(g, 60, 0xd8d2c4, { size: 0.03, life: 1.0, additive: false, opacity: 0.4 });
    const reel = group(g, -2.9, 0.02, -2.4, 0.3);
    cyl(reel, 0.18, 0.18, 0.12, 0, 0.35, 0, CMSB_PAL.trim, { rough: 0.5, metal: 0.4, seg: 16 });
    box(reel, 0.1, 0.5, 0.1, 0, 0.25, 0, CMSB_PAL.trim, { rough: 0.6 });
    holoTag(reel, "water hose", 0, 0.6, 0, { css: CMSB_CSS, w: 0.2 });
    reg(hits, reel, "water-hose");

    // ------------------------------------------------------------- spotter, cards, radio, mixer bin
    const spotterZone = group(g, 3.4, 0.02, -2.0);
    const spotter = standingFigure(spotterZone, 0, 0, { ry: -1.4, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    spotter.visible = false;
    const whistleHit = box(g, 0.3, 0.4, 0.3, 3.4, 1.2, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "spotter whistle", 3.4, 1.5, -2.0, { css: CMSB_CSS, w: 0.28 });
    reg(hits, whistleHit, "spotter-whistle");

    const mixBin = group(g, -0.9, 0.02, 3.0, 0.2);
    box(mixBin, 0.6, 0.3, 0.5, 0, 0.15, 0, 0x2b2f34, { rough: 0.7 });
    const wetMix = box(mixBin, 0.5, 0.06, 0.4, 0, 0.31, 0, 0x8a8579, { rough: 0.95 });
    const bareHandHit = box(mixBin, 0.4, 0.2, 0.3, 0, 0.4, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mixBin, "work it bare-handed?", 0, 0.6, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, bareHandHit, "bare-hand-mix");
    void wetMix;

    const board = group(g, 1.6, 0.02, 3.0, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMSB_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("JOB CARD — SLAB ON GRADE, BAY 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Mix and slump: per the specification", "Sub-base: vapor barrier, dowels capped", "Jointing pattern: per the job card", "Finish: hard steel trowel, cure same day", "Cure method: sprayed compound per the SDS"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMSB_ACCENT });
    reg(hits, board, "job-card");

    const log = group(g, 2.6, 0.02, 3.0, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("SLAB LOG —\nBAY 2", { bg: "#171108", accent: CMSB_CSS, fg: "#efeade", scale: 0.32 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "slab log", 0, 1.62, 0, { css: CMSB_CSS, w: 0.2 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, 3.0, 0.02, 3.2, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMSB_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMSB_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const mason = standingFigure(g, -0.2, -0.5, { ry: 2.6, cloth: 0x4a4038, vest: CMSB_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: CMSB_CSS, w: 0.24 });
    for (const [x, z] of [[3.6, 1.6], [-3.4, 2.4]]) cone(g, x, z);

    let placing = false, fill = 0, cutting = false;
    const dustOrigin = new THREE.Vector3(-3.6, 0.2, -3.2);
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pin-rails") { dowelCap.visible = true; railStakeLoose.rotation.z = 0; debris.visible = false; }
        if (step.id === "place") placing = false;
        if (step.id === "strike-off") { slabMesh.visible = true; slabMesh.scale.x = 1; wetSheen.visible = true; }
        if (step.id === "edge-joint") { /* edger and jointer marked via sequence */ }
        if (step.id === "bleed-wait") wetSheen.visible = false;
        if (step.id === "cure") cureFilm.material.opacity = 0.5;
        if (step.id === "final-walk") leftTrowel.visible = false;
        if (step.id === "close-out") repaint(log.userData.face, signFace("SLAB LOG —\nCLOSED + CURED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.3 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("BAY 2 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "truck-backing-blind") { spotter.visible = true; }
        if (it.id === "grinder-dust-cloud") { dust.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "truck-backing-blind") spotter.visible = false;
        if (it.id === "grinder-dust-cloud") { dust.visible = false; cutting = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "slump-check") repaint(slumpRead.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} in`, { bg: "#22201a", accent: gg.t >= 0.42 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "bleed-wait") repaint(bleedPanel.userData.screen, signFace(gg.t < 0.5 ? "BLEEDING" : gg.t > 0.68 ? "GOING OFF" : "READY", { bg: "#22201a", accent: gg.t >= 0.5 && gg.t <= 0.68 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.48 }));
        if (step?.id === "place" && session.holding) { placing = true; fill = Math.min(1, fill + dt / 6); flow.visible = true; flow.userData.step(dt, new THREE.Vector3(2.7, 1.9, -1.8), 0.14, 0.55, -3); }
        else if (flow.visible) { flow.visible = false; placing = false; }
        chute.rotation.x = Math.sin(t * 0.4) * 0.05;
        if (session?.turn && step?.id === "hand-trowel") trowel.rotation.y = session.turn.amount * Math.PI * 2;
        if (dust.visible) dust.userData.step(dt ?? 0.016, dustOrigin, 0.6, 0.4, 0.1);
        void placing; void cutting; void CITY;
      },
    };
  },
};
