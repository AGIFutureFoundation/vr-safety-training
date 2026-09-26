import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, asphaltFace, palette,
} from "../citykit.js";
import { sedan } from "../../../shared/fleet.js";
import { compactor } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Curb & Gutter Forms & Finish VR — Cement masons and
// plasterers, station three.
//
// An OPCMIA cement mason crew setting and stripping the forms for a curb and
// gutter run along a live roadway: the grade sheet read, the alignment
// walked for a pulled stake and a bare dowel, the work zone signed and the
// crew kept clear of the machine's travel path and the traffic lane, the
// concrete placed and struck to the form's face, the gutter pan and the
// radius at the catch basin hand-tooled, brushed to a broom finish and cured.
// Grade elevations, joint spacing and cure time are the plan's and the
// specification's, never a number this file invents.

const CMCG_ACCENT = 0xf2c14b;
const CMCG_CSS = "#f2c14b";
const CMCG_PAL = palette("construction");

export const SIM_CM_CURB_AND_GUTTER_FORMS_AND_FINISH = {
  id: "cm-curb-and-gutter-forms-and-finish",
  index: "702",
  domain: "Construction & Structural Trades",
  trade: "Cement mason — OPCMIA Local 300, curb and gutter crew",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction (1926.701 impalement protection); OSHA 29 CFR 1926.1153 respirable crystalline silica; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; ANSI/ASSP A10.47 work zone safety for highway construction; MUTCD temporary traffic control for work adjacent to the travel lane",
  name: "Curb & Gutter Forms & Finish",
  title: simTitle("Curb & Gutter Forms & Finish"),
  tagline: "A curb and gutter run set and finished beside a live lane: the grade sheet read, the alignment walked for a pulled stake and a bare dowel, the work zone signed, the crew clear of the machine and the travel lane, the pan struck to the form, the radius hand-tooled at the basin, broomed and cured before the forms strip",
  accent: CMCG_ACCENT,
  accentCss: CMCG_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "true-to-grade-and-line", name: "True To Grade And Line", note: "A curb run set on the grade sheet's line, finished clean and cured, with the crew never in the machine's path or the travel lane" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Curb Crew",
    currency: "RUN",
    ranks: ["Laborer", "Form Setter", "Cement Mason", "Lead Finisher", "Curb Crew Certified"],
    badges: [
      { id: "walked-the-line", name: "Walked The Line", note: "The alignment walk found the pulled stake and the bare dowel before the pour started, first time", test: AWARD.stepClean("alignment-walk") },
      { id: "clear-of-the-machine", name: "Clear Of The Machine And The Lane", note: "Never in the machine's path, never in the travel lane, never a bare hand on the curb face, never a dry grind", test: AWARD.safe },
      { id: "true-to-grade", name: "True To Grade", note: "The grade check and the broom finish both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections through the whole curb run", test: AWARD.clean },
      { id: "held-the-strike", name: "Held The Strike", note: "The strike-off pass held for the whole run", test: AWARD.unbroken },
      { id: "run-by-break", name: "Run By Break", note: "Set, struck, finished and cured inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-curb-face": "You went to hand-shape the curb face without gloves. Wet cement is strongly alkaline and burns skin slowly, often without pain until hours later, and a curb finisher's hand is against wet mix for the whole run. Gloves stay on for every minute the mix is wet, the same as anywhere else on the pour.",
    "bare-dowel-curb": "You knelt down beside the uncapped load transfer dowel at the joint line. An upright bar with no cap is the impalement hazard OSHA 29 CFR 1926.701 requires capped before anyone works near it, and a stumble onto it beside a live lane happens exactly when attention is on the traffic, not the ground.",
    "machine-travel-path": "You stood in the curb machine's travel path to watch it come down the line. The operator's sightline down a slipform or curb machine is mostly forward and to the sides of the mold, not straight down the track behind it, and a machine advancing on its own hydraulic feed does not stop for somebody standing where it is about to be.",
    "dry-grind-curb": "You ran the grinder dry on the high spot in the gutter pan instead of cutting it wet. Grinding hardened concrete with no water or vacuum shroud puts respirable crystalline silica into the air at many times the permissible limit, right at the height of a mason kneeling over the pan to check it.",
  },

  lateNotes: {
    "strike-rail": "The pan only gets struck off once the mix has been accepted on slump — striking a mix nobody tested is finishing a curb that may already be the wrong curb.",
    "broom": "The broom only goes over the pan once the bull float and the edging are done; brooming a surface that has not been floated tears it instead of texturing it.",
    "close-log": "The run is logged once the cure is on and the crew is clear of the lane.",
  },

  steps: [
    {
      id: "grade-sheet", kind: "select", target: "grade-sheet",
      title: "Read the grade sheet and the work zone plan",
      cue: "Read the alignment, the grade elevations at each stake, the joint spacing, and the work zone's cone taper and lane closure.",
      why: "A curb and gutter run is set to a string of grade points a survey crew already staked, and every one of those elevations carries drainage that fails if the run is even a little off it — a low spot holds standing water for the life of the street. The work zone plan is read at the same time because this run sits right beside a travel lane, and the taper and closure are what a driver actually sees on approach.",
    },
    {
      id: "alignment-walk", kind: "find", noHint: true,
      targets: ["pulled-stake", "bare-dowel", "unbraced-form"],
      itemNames: { "pulled-stake": "a grade stake pulled out of the ground", "bare-dowel": "an uncapped load transfer dowel", "unbraced-form": "a curb form with no brace stake" },
      itemNotes: {
        "pulled-stake": "One of the grade stakes has been knocked out and is lying beside the alignment string instead of marking the elevation it was set to.",
        "bare-dowel": "A load transfer dowel at the joint has no cap on it, standing up right where the crew kneels to finish the joint.",
        "unbraced-form": "A section of the gutter form has no brace stake driven behind it — nothing is holding that panel against the pressure of the wet mix.",
      },
      title: "Walk the alignment before the truck arrives",
      cue: "Walk the string line, the stakes and the forms, and click every defect you find.",
      why: "With no mix on the ground yet, all three of these are corrected in a couple of minutes apiece. Let concrete start moving before anyone deals with them and the same three problems turn into a run poured to a grade the surveyor never actually set, a dowel driven into a kneeling mason's leg, and a form blown out under a weight it was never braced to hold.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["reset-stake", "cap-dowel", "brace-form"],
      itemNames: { "reset-stake": "grade stake reset", "cap-dowel": "dowel capped", "brace-form": "form braced" },
      title: "Correct what the walk found",
      cue: "Reset the grade stake, cap the dowel, and brace the unbraced form section.",
      why: "Noting a problem on the walk and then not touching it is its own kind of hazard, because from that point on the crew treats the alignment and the forms as ready when all that has really happened is a line on a clipboard. The stake actually has to go back in the ground, the dowel actually needs its cap, and the panel actually needs its brace before the truck shows up.",
    },
    {
      id: "work-zone", kind: "select", target: "cone-taper",
      title: "Set the work zone's cone taper",
      cue: "Confirm the cone taper and the sign board are in place along the lane closure before the crew steps off the curb line.",
      why: "The taper is what actually turns a driver's approach away from the crew and the machine, not a hope that they will notice work happening; MUTCD's temporary traffic control sets the spacing and the warning signs for exactly this reason. It is checked in place before anyone starts working with their back to the lane.",
    },
    {
      id: "clear-machine-path", kind: "select", target: "machine-lane",
      title: "Clear the machine's travel path",
      cue: "Move the crew out of the curb machine's travel path before it advances down the line.",
      why: "A curb machine advances on its own hydraulic feed at a fixed rate the operator does not always have a clean sightline straight behind, and it does not stop itself for someone standing in the track it is about to occupy. The path is cleared before the machine moves, not watched while it is already rolling.",
    },
    {
      id: "slump-check", kind: "gauge", target: "slump-cone",
      title: "Accept the mix on slump",
      cue: "Take the slump off the first load and commit inside the grade sheet's band before any of it goes in the form.",
      why: "Slump proves the load delivered is the mix the plan actually ordered, not one softened with a hose to make it easier to place around the curb machine's mold. A curb finished from an over-wet mix slumps out of its face profile before it ever sets, and there is no fixing that after the forms strip.",
      gauge: { label: "SLUMP", speed: 0.7, green: [0.4, 0.56], readout: (t) => `${(t * 10).toFixed(1)} in`, missNote: "Outside the grade sheet's band — reject the load or have it adjusted with admixture at the plant, never with a hose on site." },
    },
    {
      id: "place", kind: "track", target: "chute-control", seconds: 6,
      title: "Place the mix along the run",
      cue: "Feed the mix into the form at a rate the crew can keep struck off, moving evenly down the line.",
      why: "Placed faster than the crew can strike it off, the mix starts taking its set in the form before the profile is even cut, and a curb struck off after it has begun to stiffen tears instead of shaping. An even feed down the line is what keeps the strike-off pass working fresh mix the whole run.",
      track: { start: 0.15, green: [0.35, 0.55], rise: 0.55, fall: 0.5, drift: 0.12, label: "FEED RATE", readout: (v) => (v < 0.35 ? "starving the strike-off" : v > 0.55 ? "burying the strike-off" : "even with the crew") },
      holdBreakNote: "The feed fell out of band with the strike-off. Bring the rate back even with the crew and hold it there.",
    },
    {
      id: "strike-off", kind: "hold", target: "strike-rail", seconds: 5,
      title: "Strike the pan to the form's face",
      cue: "Draw the curb template along the form rails, cutting the pan and the face to the mold's profile.",
      why: "The form's face is the one reference this run's whole cross-section is built on — the template does nothing but cut the fresh mix down to that profile, and any pass that lifts off the rail leaves a low spot the finish work can only mask, never fix. Carried steady along both rails, the template leaves a true pan and face for the finishing tools to close.",
      holdBreakNote: "The template lifted off the rail mid-pass and rode over a low spot without cutting it. Reset at the low end and draw the pass again.",
    },
    {
      id: "radius-tool", kind: "turn", target: "radius-tool",
      title: "Hand-tool the radius at the catch basin",
      cue: "Work the hand tool around the curb return at the basin, matching the radius the grade sheet calls for.",
      why: "A curb machine's mold runs straight; the return at a catch basin or a driveway apron is cut and shaped by hand to the radius the plan calls for, because a return poured to the wrong sweep either misses the basin's grate or leaves a lip a wheel catches on. It is worked while the mix is still plastic enough to move without tearing.",
      turn: { turns: 1, label: "RADIUS" },
    },
    {
      id: "edge-joint", kind: "sequence",
      targets: ["edge-tool", "hand-joint"],
      itemNames: { "edge-tool": "curb top edged", "hand-joint": "contraction joints hand-tooled" },
      title: "Edge the curb top and tool the joints",
      cue: "Round the top edge of the curb with the edger, then hand-tool the contraction joints to the grade sheet's spacing.",
      why: "An un-eased top edge chips the first time a snowplow blade or a wheel catches it, and a contraction joint cut in the wrong place — or skipped — is a crack the curb draws for itself wherever shrinkage happens to concentrate instead of where the plan controlled it. Both are done while the surface is still plastic enough to tool cleanly.",
      outOfOrderNote: "The top edge first, then the joints — the edger needs the surface a shade stiffer than the joints do.",
    },
    {
      id: "broom-finish", kind: "gauge", target: "broom",
      title: "Broom the gutter pan for a skid-resistant texture",
      cue: "Draw the broom once across the pan, perpendicular to the flow line, and commit once the texture reads even.",
      why: "A gutter pan carries pedestrian and wheel traffic across a slope that is often wet, and the broom's texture is what actually gives it skid resistance instead of a slick trowelled finish. One even pass, drawn the same direction across the whole run, is what makes the texture consistent instead of patchy.",
      gauge: { label: "TEXTURE", speed: 0.68, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "still smooth — draw again" : t <= 0.6 ? "even texture" : "over-worked — tearing the surface"), missNote: "Not a clean single pass — commit once the texture first reads even across the pan." },
    },
    {
      id: "cure", kind: "drag", target: "cure-compound",
      title: "Apply the curing compound",
      cue: "Carry the sprayer down the run and apply the curing compound evenly across the finished pan and face.",
      why: "Curing is the last structural step in this curb, not cleanup: a run allowed to dry in open air instead of curing under a sealed membrane loses real strength and craze-cracks along its whole length, undoing the strike-off and the finish work that came before it. The compound goes on while the surface is still damp enough to seal the water the cement needs.",
      drag: { to: "cure-zone", radius: 0.6, missNote: "Not along the run — the curing compound has to cover the whole finished pan and face, not a stretch of it." },
    },
    {
      id: "close-out", kind: "select", target: "close-log",
      title: "Log the run",
      cue: "Record the mix accepted, the dowel capped, the joints cut and the cure applied.",
      why: "The curb log is how the foreman and the paving crew coming in behind know this run was set to the grade sheet and cured before the forms strip, rather than pulled early because the schedule was tight. It is also where the pulled stake and the bare dowel get written down so the next crew on this alignment knows they were found and fixed.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: run struck, finished and cured. Then check in with the crew about the lane and the grinder.",
      why: "The next section's pour and its lane closure both depend on the foreman getting an honest picture from this call, not a summary that skips the parts that went sideways. A car drifted toward the cone taper and a grinder ran dry for a minute — worth saying plainly, alongside a mention that the OPCMIA member assistance line is there for anyone the shift left shaken.",
    },
  ],

  interrupts: [
    {
      id: "car-enters-work-zone",
      kind: "Vehicle drifting into the cone taper",
      after: "clear-machine-path", delay: 2, seconds: 12,
      alert: "A car has drifted past the cone taper and is rolling toward the curb machine's travel path with the crew still working the line.",
      cue: "Get the flagger's stop paddle up before the car reaches the crew.",
      target: "flagger-stop",
      why: "A driver who has already drifted past the taper is not going to be stopped by the cones that failed to hold their attention the first time, and the crew working the curb line has their backs to the lane. The flagger's stop paddle, raised and visible, is the one signal left that reaches a driver already inside the work zone before the machine or a mason does.",
      missNote: "The car kept rolling toward the machine with no paddle raised; it braked hard a few feet short of the travel path with the operator still watching the mold, not the lane.",
      wrongNote: "The flagger's stop paddle — a car is already inside the taper, and it has to be stopped before it reaches the crew or the machine.",
    },
    {
      id: "grinder-dust-drift",
      kind: "Silica dust from dry grinding drifting across the crew",
      after: "edge-joint", delay: 2, seconds: 12,
      alert: "A laborer at the next section has started dry-grinding a high spot in the gutter pan, and the dust is drifting across the finishing crew.",
      cue: "Get the water hose on the grinder and stop the dry grinding.",
      target: "water-hose",
      why: "A grinder run dry on hardened concrete puts respirable crystalline silica into the air at many times the permissible limit, and the crew kneeling over the pan nearby is breathing all of it. The silica rule does not allow dry grinding where wet methods will do; the hose feeds water to the wheel and the dry grinding stops until it does.",
      missNote: "The dry grinding went on through the rest of the finish pass; a haze hung low over the pan and the crew was still coughing it out by the time the joints were cut.",
      wrongNote: "The water hose — the dust drifting over the crew comes first, and wetting the wheel down is what stops it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMCG_ACCENT);
    const ground = box(g, 9.0, 0.04, 6.4, 0, 0.02, -0.3, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#2c2e30", base2: "#26282a" }), { repeat: 5, px: 512 }), { rough: 0.95, color: 0xb9b9b9 });
    const sidewalkStrip = box(g, 8.6, 0.05, 1.8, 0, 0.04, 2.4, 0xffffff);
    sidewalkStrip.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#8f8b80", tone2: "#838075" }), { repeat: 4, px: 512 }), { rough: 0.9, color: 0xd8d3c4 });

    // ------------------------------------------------------------- the alignment and forms
    const run = group(g, 0, 0.05, 0.5);
    const stringLine = cyl(run, 0.004, 0.004, 8.4, 0, 0.5, 0, 0xf2e14b, { rough: 0.7, seg: 6 });
    stringLine.rotation.z = Math.PI / 2;
    const stakes = [];
    for (let i = -3; i <= 3; i++) { const s = cyl(run, 0.02, 0.02, 0.5, i * 1.3, 0.25, -0.3, 0xc6a26a, { rough: 0.85, seg: 6 }); stakes.push(s); }
    const pulledStake = stakes[2];
    pulledStake.position.set(pulledStake.position.x + 0.15, 0.05, -0.15);
    pulledStake.rotation.z = 1.1;
    reg(hits, pulledStake, "pulled-stake");
    holoTag(run, "pulled grade stake", pulledStake.position.x, 0.3, -0.15, { css: CMCG_CSS, w: 0.32 });

    const formTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#c6a26a", tone2: "#b8944e" }), { repeat: 1, px: 256 }), { rough: 0.85, color: 0xffffff });
    const formFront = box(run, 8.4, 0.28, 0.03, 0, 0.14, -0.5, 0xc6a26a, { rough: 0.85 });
    const formBack = box(run, 8.4, 0.2, 0.03, 0, 0.1, 0.35, 0xc6a26a, { rough: 0.85 });
    void formTex;
    const braceStakes = [];
    for (let i = -3; i <= 3; i++) { if (i === 1) continue; const b = cyl(run, 0.02, 0.02, 0.4, i * 1.3, 0.2, -0.65, CMCG_PAL.trim, { rough: 0.6, metal: 0.4, seg: 6 }); braceStakes.push(b); }
    const unbracedHit = box(run, 0.8, 0.4, 0.4, 1.3, 0.2, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(run, "unbraced form section", 1.3, 0.5, -0.5, { css: CMCG_CSS, w: 0.36 });
    reg(hits, unbracedHit, "unbraced-form");

    const dowelBare = cyl(run, 0.012, 0.012, 0.3, -1.3, 0.16, -0.1, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, dowelBare, "bare-dowel");
    holoTag(run, "uncapped dowel", -1.3, 0.36, -0.1, { css: "#d2312b", w: 0.28 });
    const dowelFootHit = box(run, 0.3, 0.3, 0.3, -1.3, 0.2, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(run, "kneel beside the bare dowel?", -1.3, 0.55, -0.1, { css: "#d2312b", w: 0.4 });
    reg(hits, dowelFootHit, "bare-dowel-curb");
    const dowelCap = ball(run, 0.04, -1.3, 0.32, -0.1, 0xf2703b, { rough: 0.8, seg: 10, seg2: 8 });
    dowelCap.visible = false;

    // Fix-step targets — the tools that actually correct what the walk found.
    const stakeMallet = group(run, 2.6, 0.02, -0.5, 0.2);
    box(stakeMallet, 0.08, 0.16, 0.08, 0, 0.1, 0, 0x8a6a42, { rough: 0.85 });
    box(stakeMallet, 0.03, 0.3, 0.03, 0, 0.28, 0, 0x8a6a42, { rough: 0.85 });
    holoTag(stakeMallet, "reset the stake", 0, 0.5, 0, { css: CMCG_CSS, w: 0.28 });
    reg(hits, stakeMallet, "reset-stake");
    const capSupply = group(run, -1.6, 0.02, 0.4);
    box(capSupply, 0.16, 0.1, 0.12, 0, 0.05, 0, 0xf2703b, { rough: 0.8 });
    holoTag(capSupply, "fit a dowel cap", 0, 0.24, 0, { css: CMCG_CSS, w: 0.28 });
    reg(hits, capSupply, "cap-dowel");
    const braceSupply = group(run, 1.6, 0.02, -0.9, 0.2);
    box(braceSupply, 0.03, 0.4, 0.03, 0, 0.2, 0, CMCG_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(braceSupply, "brace the form", 0, 0.5, 0, { css: CMCG_CSS, w: 0.26 });
    reg(hits, braceSupply, "brace-form");

    const pan = box(run, 8.3, 0.06, 0.75, 0, 0.03, -0.12, 0xffffff);
    pan.material = formTex;
    pan.scale.x = 0.02;
    pan.visible = false;
    const wetSheen = box(run, 8.3, 0.004, 0.75, 0, 0.063, -0.12, 0xbfd8e6, { rough: 0.1, opacity: 0.001, transparent: true, cast: false });
    void wetSheen;
    const strikeHit = box(run, 8.4, 0.3, 0.9, 0, 0.2, -0.12, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(run, "strike-off — curb template", 0, 0.4, -0.5, { css: CMCG_CSS, w: 0.42 });
    reg(hits, strikeHit, "strike-rail");

    // ------------------------------------------------------------- catch basin, radius
    const basin = group(g, 3.6, 0.02, 2.0);
    box(basin, 0.7, 0.1, 0.6, 0, 0.05, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const radiusTool = box(basin, 0.3, 0.03, 0.05, 0, 0.14, 0.3, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(basin, "hand radius tool", 0, 0.4, 0.3, { css: CMCG_CSS, w: 0.32 });
    reg(hits, radiusTool, "radius-tool");

    // ------------------------------------------------------------- test bench, tools
    const bench = group(g, -3.6, 0.02, 1.3, 0.4);
    box(bench, 1.1, 0.7, 0.5, 0, 0.35, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const slumpCone = cyl(bench, 0.06, 0.11, 0.26, -0.25, 0.83, 0, 0xb9bec4, { rough: 0.5, metal: 0.6, seg: 16, open: true });
    const slumpRead = instrument(bench, -0.25, 0.7, -0.2, { idle: "--.- in", color: CMCG_CSS, w: 0.12, d: 0.18 });
    holoTag(bench, "slump cone", -0.25, 1.0, 0, { css: CMCG_CSS, w: 0.22 });
    reg(hits, slumpCone, "slump-cone");

    const chuteCtl = box(g, 0.18, 0.24, 0.08, -3.0, 0.9, -1.2, 0x2b2f34, { rough: 0.6 });
    box(g, 0.1, 0.05, 0.03, -3.0, 0.98, -1.15, CMCG_PAL.accent, { emissive: CMCG_PAL.accent, ei: 0.9, rough: 0.4, cast: false });
    holoTag(g, "chute control", -3.0, 1.16, -1.2, { css: CMCG_CSS, w: 0.26 });
    reg(hits, chuteCtl, "chute-control");
    const flow = particles(g, 40, 0xa8a49a, { size: 0.03, life: 0.5, additive: false, opacity: 0.8 });

    const edger = box(g, 0.22, 0.05, 0.14, -2.3, 0.045, 1.3, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(g, "curb top edger", -2.3, 0.24, 1.3, { css: CMCG_CSS, w: 0.28 });
    reg(hits, edger, "edge-tool");
    const jointer = box(g, 0.18, 0.05, 0.12, -1.9, 0.045, 1.3, 0xdfe6ec, { rough: 0.4, metal: 0.6 });
    holoTag(g, "hand jointer", -1.9, 0.24, 1.3, { css: CMCG_CSS, w: 0.26 });
    reg(hits, jointer, "hand-joint");
    const broom = group(g, -1.2, 0.02, 1.3, 0.2);
    box(broom, 0.5, 0.06, 0.12, 0, 0.05, 0, 0x8a6a42, { rough: 0.9 });
    box(broom, 0.04, 0.6, 0.04, 0, 0.3, -0.2, 0x8a6a42, { rough: 0.85 });
    holoTag(broom, "curb broom", 0, 0.7, -0.2, { css: CMCG_CSS, w: 0.22 });
    reg(hits, broom, "broom");
    const cureSprayer = group(g, -0.4, 0.02, 1.3, 0.2);
    cyl(cureSprayer, 0.13, 0.13, 0.48, 0, 0.26, 0, 0x59c97b, { rough: 0.6, seg: 12 });
    cyl(cureSprayer, 0.02, 0.02, 0.28, 0.1, 0.46, 0, 0x2b2f34, { rough: 0.6, seg: 8 });
    holoTag(cureSprayer, "cure compound sprayer", 0, 0.62, 0, { css: CMCG_CSS, w: 0.4 });
    reg(hits, cureSprayer, "cure-compound");
    const cureZoneHit = box(run, 8.3, 0.1, 0.9, 0, 0.13, -0.12, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cure-zone"] = cureZoneHit;

    const bareHandCurb = box(run, 0.6, 0.2, 0.4, 2.6, 0.2, -0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(run, "shape the face bare-handed?", 2.6, 0.45, -0.3, { css: "#d2312b", w: 0.44 });
    reg(hits, bareHandCurb, "bare-hand-curb-face");

    // ------------------------------------------------------------- curb machine, sedan, work zone
    const machine = compactor(g, 3.4, 0.02, -2.4, { ry: 1.6, livery: { colour: 0xf2c14b, fleetName: "CITY CURB", unitNumber: "C-4" } });
    void machine;
    const machineLaneHit = box(g, 1.2, 0.6, 3.6, 3.4, 0.35, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the machine's path?", 3.4, 0.75, -0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, machineLaneHit, "machine-travel-path");
    const clearLaneHit = box(g, 1.6, 0.1, 3.6, 3.4, 0.05, -0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["machine-lane"] = clearLaneHit;

    const roadway = group(g, 5.6, 0.0, -0.5);
    const cones = [];
    for (let i = -2; i <= 2; i++) { cone(roadway, i * 1.1, -1.6); }
    const taper = box(roadway, 5.4, 0.01, 1.0, 0, 0.05, -1.6, 0xd2312b, { rough: 0.7, opacity: 0.001, transparent: true, cast: false });
    holoTag(roadway, "cone taper", 0, 0.3, -1.6, { css: CMCG_CSS, w: 0.24 });
    reg(hits, taper, "cone-taper");
    void cones;
    const car = sedan(g, 8.6, 0.0, -2.4, { ry: -Math.PI / 2, livery: { colour: 0x5aa9ff } });
    car.position.set(8.6, 0.0, -2.4);
    car.userData.startX = 8.6;

    const flagger = group(g, 5.4, 0.02, -1.6, -1.4);
    const flaggerPerson = standingFigure(flagger, 0, 0, { ry: 0, cloth: 0xf2c14b, vest: 0xf2c14b, helmet: 0xf2f2f2, atStation: true });
    void flaggerPerson;
    const paddle = box(flagger, 0.18, 0.18, 0.02, 0.2, 1.1, 0, 0xd2312b, { rough: 0.6 });
    holoTag(flagger, "flagger stop paddle", 0.2, 1.3, 0, { css: CMCG_CSS, w: 0.34 });
    reg(hits, paddle, "flagger-stop");

    // ------------------------------------------------------------- grinder hazard
    const nextSection = group(g, -4.0, 0.02, -1.6);
    const grinder = group(nextSection, 0, 0, 0, -0.4);
    box(grinder, 0.16, 0.14, 0.32, 0, 0.14, 0, 0x2b2f34, { rough: 0.6 });
    const disc = cyl(grinder, 0.09, 0.09, 0.012, 0, 0.11, 0.18, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 20 });
    disc.rotation.x = Math.PI / 2;
    holoTag(grinder, "grinder — dry cutting the high spot", 0, 0.42, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, grinder, "dry-grind-curb");
    const dust = particles(g, 60, 0xd8d2c4, { size: 0.03, life: 1.0, additive: false, opacity: 0.4 });
    const reel = group(g, -3.4, 0.02, -2.4, 0.3);
    cyl(reel, 0.18, 0.18, 0.12, 0, 0.35, 0, CMCG_PAL.trim, { rough: 0.5, metal: 0.4, seg: 16 });
    box(reel, 0.1, 0.5, 0.1, 0, 0.25, 0, CMCG_PAL.trim, { rough: 0.6 });
    holoTag(reel, "water hose", 0, 0.6, 0, { css: CMCG_CSS, w: 0.2 });
    reg(hits, reel, "water-hose");

    // ------------------------------------------------------------- cards, log, radio, crew
    const board = group(g, 3.6, 0.02, 3.2, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMCG_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("GRADE SHEET — CURB RUN 3", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Alignment and elevations: per the survey", "Joint spacing: per the grade sheet", "Work zone: cone taper per MUTCD", "Finish: broom pan, ease top edge", "Cure: sprayed compound per the SDS"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMCG_ACCENT });
    reg(hits, board, "grade-sheet");

    const log = group(g, 4.2, 0.02, 3.2, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("CURB LOG —\nRUN 3", { bg: "#171108", accent: CMCG_CSS, fg: "#efeade", scale: 0.32 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "curb log", 0, 1.62, 0, { css: CMCG_CSS, w: 0.2 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, 4.6, 0.02, 3.4, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMCG_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMCG_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const mason = standingFigure(g, 0.4, -0.9, { ry: 2.8, cloth: 0x4a4038, vest: CMCG_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: CMCG_CSS, w: 0.24 });

    let placing = false, fill = 0, carElapsed = 0;
    const dustOrigin = new THREE.Vector3(-4.0, 0.2, -1.6);
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { dowelCap.visible = true; pulledStake.position.set(pulledStake.position.x - 0.15, 0.25, -0.3); pulledStake.rotation.z = 0; braceStakes.push(cyl(run, 0.02, 0.02, 0.4, 1.3, 0.2, -0.65, CMCG_PAL.trim, { rough: 0.6, metal: 0.4, seg: 6 })); }
        if (step.id === "place") placing = false;
        if (step.id === "strike-off") { pan.visible = true; pan.scale.x = 1; }
        if (step.id === "cure") { /* compound applied */ }
        if (step.id === "close-out") repaint(log.userData.face, signFace("CURB LOG —\nCURED + LOGGED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.28 }));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("RUN 3 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "car-enters-work-zone") { carElapsed = 0; car.position.x = car.userData.startX - 1.2; }
        if (it.id === "grinder-dust-drift") dust.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "car-enters-work-zone") car.position.x = car.userData.startX;
        if (it.id === "grinder-dust-drift") dust.visible = false;
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "slump-check") repaint(slumpRead.userData.screen, signFace(`${(gg.t * 10).toFixed(1)} in`, { bg: "#22201a", accent: gg.t >= 0.4 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.6 }));
        if (step?.id === "place" && session.holding) { placing = true; fill = Math.min(1, fill + dt / 6); flow.visible = true; flow.userData.step(dt, new THREE.Vector3(-3.0, 1.7, -0.9), 0.14, 0.5, -1.4); }
        else if (flow.visible) { flow.visible = false; placing = false; }
        if (session?.turn && step?.id === "radius-tool") radiusTool.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.activeInterrupt?.id === "car-enters-work-zone") {
          carElapsed += dt;
          const p = Math.min(1, carElapsed / 10);
          car.position.x = car.userData.startX - p * 4.2;
        }
        if (dust.visible) dust.userData.step(dt ?? 0.016, dustOrigin, 0.6, 0.4, 0.1);
        void placing; void CITY; void mat;
      },
    };
  },
};
