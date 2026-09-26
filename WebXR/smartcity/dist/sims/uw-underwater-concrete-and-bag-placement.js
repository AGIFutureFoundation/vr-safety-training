import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Underwater Concrete & Bag Placement VR — Bay Area Union
// Edition, marine and water pack, on the bay-underwater district.
//
// A corroded pile base repaired with a tremie-filled jacket form, and grout-
// filled fabric bags placed round the base afterward for scour protection:
// the clamshell form closed and strapped over the corrosion band, the mudline
// seal set, the tremie pipe seated in the form's port, the pump called for,
// the pipe kept embedded as the concrete rises, the air-bleed valve worked,
// the pour rate read on the gauge, the fill height read on a sounding rod,
// and the bags laid interlocking round the base once the pour has set. The
// learner is the diver, a Pile Drivers Local 34 commercial diver; the
// supervisor is on the comms, the tender has the umbilical and the standby
// is dressed at the ladder. Depth, gas, bottom time and decompression are
// never written as numbers: they are per the dive plan and the tables the
// supervisor holds.

const UCBP_ACCENT = 0x9a8a5a;
const UCBP_CSS = "#c9b06a";

/** The HUD's comms face, repainted when the supervisor reads back. */
function ucbpCommsFace(lines, band = UCBP_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(18,16,8,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f6f0dc"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#faf6ea";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_UW_UNDERWATER_CONCRETE_AND_BAG_PLACEMENT = {
  id: "uw-underwater-concrete-and-bag-placement",
  index: "354",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver placing a tremie-filled repair jacket and grout-filled fabric bags on a corroded pile base, with the dive supervisor on the comms, the tender on the umbilical and the standby diver dressed at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 720,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (equipment inspection, hazardous activities nearby) and 29 CFR 1910.422 procedures during the dive (communications, power tools, termination of the dive); ADCI International Consensus Standards for Commercial Diving and Underwater Operations; ACI concrete field testing technician certification and ACI 301 specifications for structural concrete governing the tremie placement; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds",
  name: "Underwater Concrete & Bag Placement",
  title: simTitle("Underwater Concrete & Bag Placement"),
  tagline: "The repair from form to bag: on the bottom reported, the corrosion band and a seam gap found inside the form, the form's lower half closed and the strap buckled in order, the mudline seal set, the tremie seated in its port, the pump called for, the pipe kept embedded as the pour rises through a line surge, the air-bleed valve worked, the pour rate read on the gauge, the fill height held on the sounding rod through a loosened strap, the hazards found, the pour reported, and the scour bags laid interlocking in order before the crew checks in",
  accent: UCBP_ACCENT,
  accentCss: UCBP_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "embedded-and-bled", name: "Embedded and Bled", note: "The tremie tip never lifted clear of the rising concrete, the air bled at every stage, and nothing unclipped before it was landed" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Tremie Pour",
    currency: "YARDAGE",
    ranks: ["Diver Trainee", "Diver", "Placement Diver", "Lead Placement Diver", "Underwater Concrete Certified"],
    badges: [
      { id: "form-first", name: "Form First", note: "The form closed and strapped in order before the tremie went in", test: AWARD.stepClean("close-form") },
      { id: "true-rate", name: "True Rate", note: "The pour rate gauge read inside the band first time", test: AWARD.precise(0.7) },
      { id: "nothing-dropped", name: "Nothing Dropped", note: "Never unclipped early, never stood in the discharge, never the umbilical under the strap, never tangled in the sling", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-pour", name: "Clean Pour", note: "No corrections from the on-bottom report to the check-in", test: AWARD.clean },
      { id: "steady-embedment", name: "Steady Embedment", note: "The tremie tip held embedded the whole pour", test: AWARD.unbroken },
      { id: "poured-in-time", name: "Poured In Time", note: "The pour reported inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "entangle-in-sling": "You swam through the rigging sling instead of round it while the form was still being lowered. A sling under load from the surface can come tight without warning the moment the crane operator takes up slack, and a diver inside its bight when that happens is caught between a moving wire and the pile. The sling is worked from outside its bight, always, whether it is slack or not.",
    "stand-in-discharge": "You stood in front of the tremie's discharge while the pump was running. Concrete under pump pressure comes out of that pipe hard enough to knock a diver down and bury a hand or a foot in it before you can pull free, and you cannot tell from the outside when the pump is about to surge. You work beside the discharge, never in front of it, and never while the pump is confirmed running.",
    "unclip-early": "You unclipped the rigging from the form before it was fully resting on the mudline. A form that is still hanging on the crane can swing the moment the last bit of slack comes off the wire, and unclipping it early turns a controlled lower into a form falling the rest of the way onto the pile — and onto whatever is under it, including your own hands. The rigging comes off only once the form is confirmed landed and stable.",
    "umbilical-under-strap": "You let your umbilical trail across the open seam while you worked inside the form. The moment the form's strap is buckled down, anything caught in that seam gets pinched and held there, and an umbilical pinned under a buckled strap on a form that is about to be filled with concrete is not coming free without cutting the strap. The umbilical is kept clear of the seam for the whole time the form stands open.",
  },

  lateNotes: {
    "tremie-pipe": "The tremie goes into its port once the form is closed and the mudline seal is set — not into an open form.",
    "pour-rate-gauge": "The pour rate is read once the pump has been called for and the tremie tip is confirmed embedded — not on a line that is not yet flowing.",
    "bag-one": "The scour bags go down once the pour has been reported and the form is confirmed full — not before the repair itself is done.",
  },

  steps: [
    {
      id: "report-on-bottom", kind: "select", target: "ucbp-comms",
      title: "Report on the bottom at the pile",
      cue: "Call the supervisor: on the bottom at the repair pile, off the stage, feeling good, and starting the form check.",
      why: "The supervisor at the panel is about to call the pump and the crane on your word alone, and the on-bottom report is what tells them the dive has actually reached the pile and is ready to start. It is also the comms check that proves the voice circuit works before a live pump or a loaded sling is put in motion on your say-so.",
    },
    {
      id: "form-check", kind: "find", noHint: true,
      targets: ["corrosion-band", "seam-gap"],
      itemNames: { "corrosion-band": "corroded band centred inside the form", "seam-gap": "gap at the form's seam" },
      itemNotes: {
        "corrosion-band": "The section of pile the whole repair exists for: a band of section loss the form has to sit centred over before anything is poured.",
        "seam-gap": "A finger-width gap where the form's two halves have not quite met, wide enough for fresh concrete to find its way out through.",
      },
      title: "Find the corrosion band and any gap in the form",
      cue: "Check the form is centred over the corroded band, and run a hand round the seam looking for any gap wide enough to leak.",
      why: "A form poured off-centre leaves exactly the section of pile it was meant to protect still exposed on one side, and a seam gap found now costs a strap adjustment; found after the pump is running, it costs a concrete leak nobody can stop from the bottom. Both are checked before the form is closed for good, while there is still time to fix either one.",
    },
    {
      id: "close-form", kind: "sequence",
      targets: ["form-lower", "form-strap"],
      itemNames: { "form-lower": "form's lower half seated on the pile", "form-strap": "upper strap buckled down" },
      title: "Seat the lower half, then buckle the strap",
      cue: "Seat the form's lower half fully against the pile first, then bring the upper strap round and buckle it down snug.",
      why: "The lower half has to be seated flush before the strap does any good, because a strap buckled over a form that is not yet seated just locks the gap in rather than closing it. Seated first, then strapped, is the only order that leaves the form actually sealed round the pile rather than sealed round a wedge of open water.",
      outOfOrderNote: "Out of order — seat the lower half fully against the pile before the strap goes on, or the strap just locks a gap in place.",
    },
    {
      id: "seal-skirt", kind: "drag", target: "seal-collar",
      title: "Set the mud-seal skirt at the base",
      cue: "Bring the seal collar down the pile to the mudline and settle it into the silt round the form's base.",
      why: "The form seals the sides of the repair, but the bottom of it sits in loose silt that the fresh concrete would otherwise find and flow straight into, wasting the pour and leaving a void under the repair. The skirt settled into the silt at the mudline is what keeps that bottom edge closed for the whole pour.",
      drag: { to: "mudline-seal-point", radius: 0.5, missNote: "Not at the mudline — the seal collar has to settle into the silt at the base of the form." },
    },
    {
      id: "insert-tremie", kind: "drag", target: "tremie-pipe",
      title: "Seat the tremie pipe in the form's port",
      cue: "Guide the tremie pipe's end into the form's pour port until it seats and locks.",
      why: "The tremie is what lets concrete reach the bottom of the form without falling freely through the water and washing out its cement — every inch of the pour depends on that pipe actually being seated where the form expects it, not just held near the opening. A pipe that is not seated and locked can be pushed out of the port by the pump's own pressure the moment the pour starts.",
      drag: { to: "form-tremie-port", radius: 0.5, missNote: "Not seated in the port — the tremie has to lock into the form's own opening before the pump is called." },
    },
    {
      id: "call-for-pump", kind: "select", target: "pump-call",
      title: "Call topside for the pump",
      cue: "With the form closed, sealed and the tremie seated, call 'pump on' and wait to hear it back from the tender.",
      why: "The pump only starts once topside answers this call, made deliberately after every check that comes before it — the form, the seal, the tremie's seat — not as a reflex the moment the pipe looks connected. Waiting for the answer back matters because a pump state nobody has confirmed is a pump that could start while your hand is still inside the form.",
    },
    {
      id: "hold-tremie-embedment", kind: "track", target: "tremie-tip", seconds: 6,
      title: "Keep the tremie tip embedded as the pour rises",
      cue: "Raise the tremie slowly as the concrete level climbs, keeping its tip buried in fresh concrete the whole time — never pulled clear, never buried so deep it chokes the flow.",
      why: "A tremie pipe pulled clear of the rising concrete, even for a moment, lets water back into the pipe and washes out the next batch that comes down it, ruining the pour from that point up; buried too deep, it can choke the flow and stall the pump against a plug. Reading the level and raising the pipe to match it, continuously, is the one skill the whole method depends on.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "TREMIE EMBEDMENT", readout: (v) => (v < 0.42 ? "too shallow — near breaking clear" : v > 0.6 ? "too deep — choking the flow" : "embedded, flow steady") },
      holdBreakNote: "The embedment broke out of band — the tip nearly broke clear or buried too deep. Bring it back into the fresh concrete and hold it there.",
    },
    {
      id: "bleed-vent", kind: "turn", target: "air-bleed-valve",
      title: "Work the air-bleed valve as the level climbs",
      cue: "Open the form's air-bleed valve as the concrete rises past it, and close it once a steady flow of concrete, not air, comes out.",
      why: "Air trapped in the top of a closing form has nowhere to go once the concrete seals it in, and a bubble left under the cap is a void in the finished repair exactly where nobody can see it afterward. Opening the valve as the level reaches it and closing it only once concrete itself is coming through is what proves the void is actually filled, not just covered.",
      turn: { turns: 0.6, label: "AIR BLEED", readout: (t) => (t < 0.3 ? "closed — trapped air venting nowhere" : t < 0.85 ? "opening — air escaping" : "open — concrete showing, bleed done") },
    },
    {
      id: "pour-rate", kind: "gauge", target: "pour-rate-gauge",
      title: "Read the pour rate on the pump gauge",
      cue: "Watch the pour rate gauge as the pump settles in and commit the reading once it holds in the steady band.",
      why: "A pour rate that is too fast overruns what the tremie and the form can take, forcing concrete out through any gap under pressure; too slow, and the first concrete down the pipe starts to set before the next batch arrives, leaving a cold joint inside the repair nobody can see until it fails. The steady band is where the pump, the pipe and the form are all actually working together.",
      gauge: { label: "POUR RATE", speed: 0.7, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "too slow — risking a cold joint" : t <= 0.58 ? "steady — pipe and form matched" : "too fast — pressure building at the seam") },
    },
    {
      id: "hold-level-rod", kind: "hold", target: "level-rod", seconds: 4,
      title: "Hold the sounding rod steady on the fill",
      cue: "Rest the sounding rod on the rising concrete and hold it still while the supervisor reads the fill height off it.",
      why: "The fill height is how the supervisor knows the pour is actually reaching the top of the form rather than bridging somewhere below it, and that reading is only good the instant the rod is held still against the true surface. A rod that bobs or drags gives a height that is not the concrete's, and a repair signed off on a wrong reading is a repair nobody has actually confirmed is full.",
      holdBreakNote: "The rod moved before the reading was taken — hold it still on the true surface until the supervisor confirms the height.",
    },
    {
      id: "site-hazards", kind: "find", noHint: true,
      targets: ["loose-sling", "live-discharge"],
      itemNames: { "loose-sling": "rigging sling still slack off the crane", "live-discharge": "tremie discharge with the pump running" },
      itemNotes: {
        "loose-sling": "The sling that lowered the form, still shackled on, drifting loose in the current between you and the surface.",
        "live-discharge": "The open end of the tremie where wet concrete is coming out under the pump's pressure the whole time it runs.",
      },
      title: "Find the hazards still live on the site",
      cue: "Before moving round the pile: where the sling still hangs, and where the pump is still discharging.",
      why: "Both of these are exactly the kind of hazard the job puts right next to a diver who has to keep working near them anyway, and knowing precisely where the sling hangs and which side the discharge fires from is what lets you keep working the pile without ever putting a hand or a body in either one's way.",
    },
    {
      id: "report-pour", kind: "select", target: "ucbp-comms",
      title: "Report the pour complete",
      cue: "Tell the supervisor: form full, air bled, fill height confirmed, and ready for the pump to shut down.",
      why: "The pump only stops on the supervisor's word, and that word only comes once the diver at the form confirms it is actually full — not once the level looks close on a gauge topside has to guess at. This report is the one moment in the whole pour where the surface crew's plan and the diver's own eyes have to agree before anything is signed off.",
    },
    {
      id: "place-bags", kind: "sequence",
      targets: ["bag-one", "bag-two"],
      itemNames: { "bag-one": "first scour bag laid at the base", "bag-two": "second bag interlocked against the first" },
      title: "Lay the scour bags interlocking round the base",
      cue: "Lay the first grout-filled bag flat against the base, then set the second bag interlocked against its edge, not overlapping loose on top.",
      why: "A scour blanket only works as a connected mat, and bags laid loose or stacked instead of interlocked leave gaps the current opens wider every tide until the base is exposed again. The first bag sets the line the rest of the mat follows, which is why it has to go down before the second one is fitted against it rather than the two being dropped in any order that looks close enough.",
      outOfOrderNote: "Out of order — lay the first bag flat against the base before interlocking the second one against it.",
    },
    {
      id: "check-in", kind: "select", target: "stage-checkin",
      title: "Check in at the stage and leave on the supervisor's call",
      cue: "Back at the stage, clipped on: tell the supervisor how the pour went, the line surge on the tremie and the loosened strap, and wait for the call to leave the bottom.",
      why: "The ascent is the supervisor's call, run to the tables they hold, and the check-in tells them you are on the stage, clipped on and well before that call is made. A tremie that surged and nearly broke clear, and a strap that worked loose mid-pour, are both worth a real answer here, with the Pile Drivers Local 34 member assistance line behind whatever the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "tremie-surge",
      kind: "Line surge nearly lifts the tremie clear",
      after: "hold-tremie-embedment", delay: 2, seconds: 14,
      alert: "The pump has surged and the tremie is being pushed up out of the concrete — the tip is about to break clear.",
      cue: "Grab the quick-lower line and feed the pipe straight back down before the tip breaks the surface.",
      target: "tremie-quick-lower",
      why: "A tremie tip that breaks clear even for a second lets the pipe fill with water instead of concrete, and the next batch pumped down it carries that water straight into the pour, washing out the mix right where the repair needs it most. The quick-lower line is rigged for exactly this — a fast way to feed slack back down the pipe without waiting for the winch topside to answer first.",
      missNote: "You tried to muscle the pipe down by hand against the surge; the tip broke the surface before you got it back under, and the next batch down the pipe went straight into open water.",
      wrongNote: "The quick-lower line — feed the pipe back down fast, before the tip breaks clear.",
    },
    {
      id: "strap-loosens",
      kind: "Form strap works loose mid-pour",
      after: "hold-level-rod", delay: 2, seconds: 14,
      alert: "The upper strap has worked loose under the load of the rising concrete and the form is starting to open at the seam.",
      cue: "Reach the emergency clamp on the stage rail and get it onto the seam before the form opens further.",
      target: "form-emergency-clamp",
      why: "A form opening under load does not stop at a small gap — the pressure of the concrete already inside it pushes the seam wider the moment the strap stops holding, and a seam that opens far enough loses the pour it took this long to build. The emergency clamp is rigged on the stage for exactly this failure, because a strap redone from scratch takes longer than the seam has.",
      missNote: "You kept reading the sounding rod while the seam opened further; concrete began weeping out at the gap before the clamp ever came off the stage.",
      wrongNote: "The emergency clamp on the stage rail — get it onto the seam before it opens any further.",
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

    // ------------------------------------------------------- the pile and its corrosion band
    const pile = group(g, 0, 0, -0.4);
    const shaft = cyl(pile, 0.36, 0.38, 6.2, 0, 3.1, 0, 0x56613f, { seg: 18 });
    void shaft;
    const corroded = cyl(pile, 0.3, 0.3, 0.5, 0, 1.2, 0, 0x9aa29c, { rough: 0.9, seg: 16 });
    reg(hits, corroded, "corrosion-band");

    // ------------------------------------------------------- the clamshell form
    const formLower = group(pile, 0, 0.9, 0);
    box(formLower, 0.9, 0.6, 0.9, 0, 0, 0, 0x3a4a4a, { rough: 0.6, metal: 0.4 });
    holoTag(formLower, "form lower half", 0.5, 0.16, 0, { css: UCBP_CSS, w: 0.34 });
    reg(hits, formLower, "form-lower");
    const formUpper = group(pile, 0, 1.5, 0);
    box(formUpper, 0.94, 0.06, 0.94, 0, 0, 0, 0x8a949d, { rough: 0.5, metal: 0.6 });
    formUpper.visible = false;
    const strap = group(pile, 0, 1.52, 0);
    box(strap, 0.98, 0.05, 0.06, 0, 0, 0.47, UCBP_ACCENT, { rough: 0.6 });
    holoTag(strap, "buckle the strap", 0, 0.14, 0.47, { css: UCBP_CSS, w: 0.3 });
    reg(hits, strap, "form-strap");
    const seamGap = box(pile, 0.06, 0.5, 0.02, 0.46, 0.9, 0.46, 0x1c1f1a, { rough: 0.7, emissive: 0x1c1f1a, ei: 0.2 });
    reg(hits, seamGap, "seam-gap");
    const umbUnderStrapHit = box(pile, 0.5, 0.2, 0.5, 0, 1.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pile, "trail the umbilical through the seam?", 0.6, 1.7, 0, { css: "#d2312b", w: 0.6 });
    reg(hits, umbUnderStrapHit, "umbilical-under-strap");

    // ------------------------------------------------------- seal collar, tremie, port
    const sealCollar = group(g, -1.0, 0.4, -1.5);
    torus(sealCollar, 0.5, 0.07, 0, 0, 0, 0x4a4234, { rough: 0.9, seg: 8, seg2: 18 });
    holoTag(sealCollar, "mud-seal skirt", 0, 0.2, 0, { css: UCBP_CSS, w: 0.28 });
    reg(hits, sealCollar, "seal-collar");
    const sealPoint = group(pile, 0, 0.05, 0);
    torus(sealPoint, 0.5, 0.015, 0, 0, 0, UCBP_ACCENT, { emissive: UCBP_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    reg(hits, sealPoint, "mudline-seal-point");
    const tremieRack = group(g, -1.6, 0.9, -1.1);
    cyl(tremieRack, 0.04, 0.04, 1.4, 0, 0, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 12 });
    holoTag(tremieRack, "tremie pipe", 0, 0.9, 0, { css: UCBP_CSS, w: 0.24 });
    reg(hits, tremieRack, "tremie-pipe");
    const tremiePort = group(pile, 0.4, 1.4, 0.2);
    torus(tremiePort, 0.08, 0.012, 0, 0, 0, UCBP_ACCENT, { emissive: UCBP_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    reg(hits, tremiePort, "form-tremie-port");
    const tremieMain = cyl(g, 0.035, 0.035, 2.2, 0.4, 1.6, -0.2, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 12 });
    tremieMain.visible = false;
    const tremieTipMark = group(pile, 0.4, 1.35, 0.2);
    torus(tremieTipMark, 0.06, 0.01, 0, 0, 0, UCBP_ACCENT, { emissive: UCBP_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 16 });
    reg(hits, tremieTipMark, "tremie-tip");
    const quickLower = group(g, -1.8, 1.6, -1.2);
    cyl(quickLower, 0.012, 0.012, 0.4, 0, 0, 0, UCBP_ACCENT, { rough: 0.5, seg: 6 });
    holoTag(quickLower, "tremie quick-lower", 0, 0.24, 0, { css: UCBP_CSS, w: 0.4 });
    reg(hits, quickLower, "tremie-quick-lower");

    // ------------------------------------------------------- pump call, bleed valve, gauge, rod
    const pumpCall = group(g, -2.0, 0.7, -1.6, 0.2);
    box(pumpCall, 0.28, 0.11, 0.02, 0, 0, 0, 0x1a2a3a, { rough: 0.5, emissive: 0x1a2a3a, ei: 0.5 });
    holoTag(pumpCall, "call 'pump on'", 0, 0.14, 0.01, { css: UCBP_CSS, w: 0.3 });
    reg(hits, pumpCall, "pump-call");
    const bleedValve = group(pile, -0.4, 1.55, 0.2);
    cyl(bleedValve, 0.03, 0.03, 0.05, 0, 0, 0, 0x2f8f5a, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    const bleedHandle = box(bleedValve, 0.01, 0.06, 0.008, 0.03, 0, 0, 0x2f8f5a, { rough: 0.5 });
    holoTag(bleedValve, "air bleed valve", 0, 0.14, 0, { css: UCBP_CSS, w: 0.3 });
    reg(hits, bleedValve, "air-bleed-valve");
    const gaugePanel = holoPanel(g, 0.4, 0.28, -2.1, 1.3, -1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(18,16,8,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = UCBP_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6f0dc"; cx.fillText("POUR RATE", w * 0.06, h * 0.24);
    }, { ry: 0.5, accent: UCBP_ACCENT });
    reg(hits, gaugePanel, "pour-rate-gauge");
    const rod = group(g, 0.6, 0.5, -1.3);
    cyl(rod, 0.012, 0.012, 1.0, 0, 0.5, 0, 0xe8dcb8, { rough: 0.7, seg: 6 });
    holoTag(rod, "sounding rod", 0, 1.06, 0, { css: UCBP_CSS, w: 0.26 });
    reg(hits, rod, "level-rod");

    // ------------------------------------------------------- sling, discharge hazards, clamp
    const sling = hose(g, [[0, 4.0, -0.4], [0.6, 2.2, -0.1], [0.9, 1.6, -0.2], [0.6, 1.0, -0.4]], 0.02, 0xc0c6cc, { steps: 12, rough: 0.5 });
    reg(hits, sling, "loose-sling");
    const slingHazardHit = box(g, 0.6, 1.4, 0.6, 0.7, 1.4, -0.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "swim through the sling?", 0.7, 2.1, -0.25, { css: "#d2312b", w: 0.42 });
    reg(hits, slingHazardHit, "entangle-in-sling");
    const dischargeEnd = group(g, -0.6, 1.3, -1.0);
    cyl(dischargeEnd, 0.04, 0.04, 0.1, 0, 0, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 10 });
    reg(hits, dischargeEnd, "live-discharge");
    const dischargeHazardHit = box(g, 0.4, 0.3, 0.4, -0.6, 1.3, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand in the discharge?", -0.6, 1.6, -1.2, { css: "#d2312b", w: 0.4 });
    reg(hits, dischargeHazardHit, "stand-in-discharge");
    const unclipHit = box(g, 0.9, 0.7, 0.9, 0, 0.95, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unclip the sling now?", 0.7, 1.4, -0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, unclipHit, "unclip-early");
    const emClamp = group(g, -2.4, 0.5, -2.0);
    box(emClamp, 0.14, 0.06, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    holoTag(emClamp, "emergency clamp", 0, 0.14, 0, { css: UCBP_CSS, w: 0.32 });
    reg(hits, emClamp, "form-emergency-clamp");
    const gapOpen = box(pile, 0.16, 0.5, 0.06, 0.5, 0.9, 0.5, 0x1c1f1a, { rough: 0.7 });
    gapOpen.visible = false;

    // ------------------------------------------------------- scour bags, comms, stage
    const bag1 = group(g, 1.1, 0.06, -0.8);
    box(bag1, 0.4, 0.14, 0.28, 0, 0, 0, 0x8a8060, { rough: 0.9 });
    holoTag(bag1, "scour bag one", 0, 0.2, 0, { css: UCBP_CSS, w: 0.28 });
    reg(hits, bag1, "bag-one");
    const bag2 = group(g, 1.6, 0.06, -1.3);
    box(bag2, 0.4, 0.14, 0.28, 0, 0, 0, 0x8a8060, { rough: 0.9 });
    holoTag(bag2, "scour bag two", 0, 0.2, 0, { css: UCBP_CSS, w: 0.28 });
    reg(hits, bag2, "bag-two");
    const comms = holoPanel(g, 0.5, 0.3, 2.0, 1.1, -1.3, ucbpCommsFace(["Supervisor · topside", "Press to talk"]), { ry: -0.5, accent: UCBP_ACCENT });
    reg(hits, comms, "ucbp-comms");
    const stage = group(g, -3.0, 0, -2.0);
    box(stage, 1.5, 0.05, 1.5, 0, 0.25, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stage, 0.06, 1.6, 0.06, sx * 0.65, 0.8, sz * 0.65, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    torus(stage, 0.3, 0.01, 0, 0.26, 0, UCBP_ACCENT, { emissive: UCBP_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    holoTag(stage, "stage — check in", 0, 0.5, 0, { css: UCBP_CSS, w: 0.3 });
    reg(hits, stage, "stage-checkin");
    const slate = decal(g, 0.26, 0.2, -2.3, 0.6, -1.0, paperFace("SLATE", ["Corrosion band centred", "Form closed · sealed", "Pour rate steady"], { bg: "#e8eef0", band: UCBP_CSS }), { px: 192 });
    void slate;

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
      const a = i * 0.71 + 0.3, r = 1.3 + (i % 4) * 0.45;
      const bottle = cyl(g, 0.035, 0.035, 0.2, Math.cos(a) * r, 0.04, -0.4 + Math.sin(a) * r, [0x2f6f4a, 0x6a4a2a, 0xa8c8c0][i % 3], { rough: 0.15, metal: 0.1, opacity: 0.8, transparent: true, seg: 8 });
      bottle.rotation.z = Math.PI / 2; bottle.rotation.y = a;
    }
    for (const [x, z] of [[-2.6, 1.4], [2.7, -1.9], [0.4, 2.4]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.16, 0.18, 0.4, 0, 0.2, 0, 0x4a4234, { rough: 0.95, seg: 12 });
      for (let i = 0; i < 4; i++) { const a = i * 1.6 + x; ball(stub, 0.07, Math.cos(a) * 0.2, 0.12 + (i % 2) * 0.14, Math.sin(a) * 0.2, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    for (let i = 0; i < 6; i++) {
      const link = torus(g, 0.05, 0.016, -2.2 + i * 0.12, 0.03, 1.6 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    const kelp = group(g, -2.9, 0, 0.6);
    for (let i = 0; i < 7; i++) {
      const frond = box(kelp, 0.03, 0.6 + (i % 3) * 0.22, 0.1, i * 0.1, 0.4, (i % 2) * 0.1, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    const bubbles = group(g, -0.6, 1.5, -1.0);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.02 + (i % 3) * 0.008, (i % 3) * 0.04 - 0.04, i * 0.14, (i % 2) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    const growthRing = group(pile, 0, 0.5, 0);
    for (let i = 0; i < 10; i++) { const a = i * 0.63; ball(growthRing, 0.09 + (i % 2) * 0.03, Math.cos(a) * 0.4, (i % 3) * 0.14, Math.sin(a) * 0.4, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    for (let i = 0; i < 4; i++) { const frond = box(pile, 0.03, 0.6, 0.12, Math.cos(i * 1.6) * 0.45, 2.6 + i * 0.2, Math.sin(i * 1.6) * 0.45, 0x5a7a3a, { rough: 0.9, cast: false }); frond.rotation.z = 0.2 * (i - 1.5); }
    for (const [x, z] of [[2.1, 0.8], [-2.0, -1.0]]) {
      const nBrg = group(g, x, 0, z);
      cyl(nBrg, 0.3, 0.32, 6.0, 0, 3.0, 0, 0x56613f, { seg: 16 });
      for (let i = 0; i < 5; i++) { const a = i * 1.2 + x; ball(nBrg, 0.08, Math.cos(a) * 0.35, 0.2 + (i % 3) * 0.16, Math.sin(a) * 0.35, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    const rockPile = group(g, 1.9, 0, 2.0);
    for (let i = 0; i < 6; i++) ball(rockPile, 0.14 + (i % 3) * 0.05, (i % 3) * 0.2 - 0.2, 0.05 + (i % 2) * 0.06, Math.floor(i / 3) * 0.2, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.1, 0.6, 0.9);

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "report-on-bottom") repaint(comms.userData.face, ucbpCommsFace(["On the bottom — reported", "Starting form check"]));
        if (step.id === "form-check") { corroded.material = mat(0x7a2a1a, { rough: 0.9, emissive: 0x3a1206, ei: 0.3 }); }
        if (step.id === "close-form") { formUpper.visible = true; }
        if (step.id === "seal-skirt") sealCollar.position.set(0, 0.05, -0.4);
        if (step.id === "insert-tremie") { tremieMain.visible = true; tremieRack.visible = false; }
        if (step.id === "call-for-pump") repaint(comms.userData.face, ucbpCommsFace(["Pump on — confirmed", "Pour starting"]));
        if (step.id === "report-pour") repaint(comms.userData.face, ucbpCommsFace(["Form full — confirmed", "Pump shutting down"]));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "tremie-surge") tremieMain.position.y = 0.15;
        if (it.id === "strap-loosens") { gapOpen.visible = true; strap.position.z = 0.55; }
      },
      onInterruptEnd(it) {
        if (it.id === "tremie-surge" && it.resolved === "answered") tremieMain.position.y = 0;
        if (it.id === "strap-loosens" && it.resolved === "answered") { gapOpen.visible = false; strap.position.z = 0.47; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "bleed-vent") bleedHandle.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "pour-rate") gaugePanel.scale.y = 0.7 + gg.t * 0.6;
        if (step?.id === "hold-tremie-embedment" && session.holding) tremieTipMark.position.y = 1.2 + (session.track?.inBand ?? 0) * 0.3;
        school.position.x = -0.6 + Math.sin(t * 0.3) * 0.3;
        void dt; void CITY; void signFace;
      },
    };
  },
};
