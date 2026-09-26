import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Lift Bag Rigging & Object Recovery VR — Bay Area Union
// Edition, marine and water pack, on the bay-underwater district.
//
// A hydraulic power unit skid that went over a work barge's rail: too heavy
// for one bag alone, it is rigged with a two-leg bridle to its lift eyes,
// the shackle pins moused, a lift bag clipped to each leg, the bridle's
// turnbuckle worked to bring the skid level, a trailing power cable and the
// diver's own umbilical checked clear of the rigging, the skid guided off the
// silt on a tag line rather than muscled up by hand, and the whole rise
// escorted to the surface watching for a bag running away with it. The
// learner is the diver, a Pile Drivers Local 34 commercial diver; the
// supervisor is on the comms, the tender has the umbilical and the standby
// is dressed at the ladder. Depth, gas, bottom time and decompression are
// never written as numbers: they are per the dive plan and the tables the
// supervisor holds.

const ULBR_ACCENT = 0xd88a4f;
const ULBR_CSS = "#d88a4f";

/** The HUD's comms face, repainted when the supervisor reads back. */
function ulbrCommsFace(lines, band = ULBR_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(22,14,6,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#f8ecdc"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#fbf4ea";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_UW_LIFT_BAG_RIGGING_AND_OBJECT_RECOVERY = {
  id: "uw-lift-bag-rigging-and-object-recovery",
  index: "357",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver rigging a two-bag lift on a dropped hydraulic power unit skid, with the dive supervisor on the comms, the tender on the umbilical and the standby diver dressed at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 720,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (planning and assessment, hazardous activities nearby) and 29 CFR 1910.422 procedures during the dive (communications, power tools); ADCI International Consensus Standards for Commercial Diving and Underwater Operations, including its guidance on lift bag rigging; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds",
  name: "Lift Bag Rigging & Object Recovery",
  title: simTitle("Lift Bag Rigging & Object Recovery"),
  tagline: "The skid rigged for two bags: on-bottom report, the lift eyes and a trailing power cable found, the bridle's shackles set and moused in order, a bag clipped to each leg, the fill matched against the skid's tagged weight, the turnbuckle worked to bring it level, the cable and the umbilical checked clear before anything lifts, the skid guided off the silt on the tag line through a slide inside the bridle, the rise escorted while a bag threatens to run, the vent worked at the safety stop, the lift reported, and the crew checked in",
  accent: ULBR_ACCENT,
  accentCss: ULBR_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "level-and-escorted", name: "Level and Escorted", note: "Every shackle pin moused before a bag went on, the load brought level before it lifted, and the whole rise escorted without a hand ever on the load itself" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Two-Bag Lift",
    currency: "BUOYANCY",
    ranks: ["Diver Trainee", "Diver", "Rigging Diver", "Lead Rigging Diver", "Lift Bag Rigging Certified"],
    badges: [
      { id: "moused-before-lift", name: "Moused Before Lift", note: "Both shackle pins moused before either bag was clipped on, first time", test: AWARD.stepClean("rig-bridle") },
      { id: "matched-capacity", name: "Matched Capacity", note: "The combined lift matched to the skid's tagged weight inside the band, first time", test: AWARD.precise(0.7) },
      { id: "hands-off-the-load", name: "Hands Off The Load", note: "Never a hand on the load itself, never an unmoused pin trusted, never the umbilical left across the bridle, never kept venting blind through dead comms", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lift", name: "Clean Lift", note: "No corrections from the on-bottom report to the check-in", test: AWARD.clean },
      { id: "steady-escort", name: "Steady Escort", note: "The ascent escorted in band the whole way up", test: AWARD.unbroken },
      { id: "recovered-in-time", name: "Recovered In Time", note: "The lift reported inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-mousing": "You clipped a lift bag onto the shackle before the pin was moused with wire. A shackle pin only stays screwed in on its own thread, and the shock of a bag taking up slack, or the skid swinging once it clears the silt, is exactly the kind of jolt that backs an unmoused pin out. The wire is what keeps the pin in the shackle after the thread lets go, and it goes on before any load, not after the lift is already under way.",
    "hand-on-the-load": "You put a hand flat on the skid to steady it as it came up off the silt instead of working the tag line. A rigged load under lift is moving under its own buoyancy, not yours, and a hand caught between the skid and anything it swings against — the pier, the barge's hull, your own knee — is a hand that stays there while the load keeps moving. The tag line is what you guide it with; your hands never go on the load itself.",
    "umbilical-across-bridle": "You worked the far shackle with your umbilical draped straight across the bridle's near leg. The moment that leg comes under load, anything lying across it gets pinned there, and an umbilical trapped under a loaded sling leg on a rig that is about to lift is not something you can free by hand once the weight comes on. The umbilical is walked clear of both legs before either shackle is touched.",
    "vent-blind-no-comms": "You kept working the dump valve on your own judgement after the comms went dead partway up the escort. Venting a lift bag is a two-way decision — the tender at the surface can see how fast the bag is actually closing on the boat, which you cannot from underneath it — and a diver venting blind on a guess is as likely to dump too much and lose the lift as too little. When the comms drop mid-escort, you hold the ascent rate you have and wait, you do not keep adjusting alone.",
  },

  lateNotes: {
    "lift-bag-one": "The first bag goes on once both shackles are set and moused — never onto a bridle leg that still has a bare pin.",
    "lift-capacity-gauge": "The fill is matched to the tag once both bags are actually clipped on — not estimated before the rigging is even finished.",
    "guide-liftoff": "The skid comes off the silt once the cable and the umbilical are both confirmed clear of the bridle — not while either one is still lying across a leg.",
  },

  steps: [
    {
      id: "report-on-bottom", kind: "select", target: "ulbr-comms",
      title: "Report on the bottom at the skid",
      cue: "Call the supervisor: on the bottom at the skid, off the stage, feeling good, and starting the rig.",
      why: "The supervisor at the panel is about to plan a lift around your word alone, and the on-bottom report is what tells them the dive has actually reached the skid and is ready to start rigging. It is also the comms check that proves the voice circuit works before two loaded lift bags and a swinging skid are put in motion depending on it.",
    },
    {
      id: "locate-and-assess", kind: "find", noHint: true,
      targets: ["skid-lift-eyes", "trailing-power-cable"],
      itemNames: { "skid-lift-eyes": "pair of lift eyes cast into the skid", "trailing-power-cable": "power cable still trailing from the skid" },
      itemNotes: {
        "skid-lift-eyes": "Two forged eyes built into the skid's frame for exactly this — the only points on it rated to take a rigged load.",
        "trailing-power-cable": "A length of armoured cable still connected to the skid, running off into the silt toward wherever it parted from the barge.",
      },
      title: "Find the lift eyes and anything still attached",
      cue: "Before rigging anything: find the skid's own lift eyes, and look for any cable or line still trailing from it.",
      why: "A bridle only does its job clipped to points the skid was actually built to be lifted by — anywhere else on the frame can bend or tear loose under load — and a trailing cable found now is a cable that gets accounted for before it becomes a surprise halfway through the lift. Both are worth knowing before a single shackle goes on.",
    },
    {
      id: "rig-bridle", kind: "sequence",
      targets: ["shackle-attach", "shackle-mouse"],
      itemNames: { "shackle-attach": "shackles pinned through both lift eyes", "shackle-mouse": "both pins moused with wire" },
      title: "Pin the shackles, then mouse both of them",
      cue: "Shackle a bridle leg through each lift eye and screw the pins home first, then wire-mouse both pins so neither can back out.",
      why: "A pin has to actually be through the eye and screwed home before mousing it means anything, so the order is pin first, wire second — never the other way round. Both pins get moused before either leg takes a bag, because a bridle is only as safe as its weakest shackle, and a rig checked as 'good enough' with one pin still bare is a rig that fails exactly where nobody looked.",
      outOfOrderNote: "Out of order — both pins are screwed home before either one gets moused, and both get moused before any bag goes on.",
    },
    {
      id: "clip-bag-one", kind: "drag", target: "lift-bag-one",
      title: "Clip the first lift bag to its bridle leg",
      cue: "Bring the first lift bag over and clip it onto the bridle leg nearest the skid's marked heavy end.",
      why: "Two bags share a load unevenly if they are not placed with some thought for where the weight actually sits, and starting with the heavier end gives that leg the lift it will need first rather than leaving it to the second bag to make up the difference. A bag clipped on an already-moused leg is a bag clipped to something proven, not to a shackle nobody has checked yet.",
      drag: { to: "bridle-leg-one", radius: 0.5, missNote: "Not on the bridle leg — the bag clips to the moused shackle, not anywhere else on the rig." },
    },
    {
      id: "clip-bag-two", kind: "drag", target: "lift-bag-two",
      title: "Clip the second lift bag to the other leg",
      cue: "Bring the second lift bag over and clip it onto the remaining bridle leg.",
      why: "One bag alone was never rated for this skid's weight, which is the entire reason the bridle has two legs instead of one — a two-bag lift only works as a two-bag lift once both bags are actually rigged and ready to take air together, not one now and the other found on the way to the surface.",
      drag: { to: "bridle-leg-two", radius: 0.5, missNote: "Not on the second leg — both bags have to be rigged before either one takes any air." },
    },
    {
      id: "match-lift-capacity", kind: "gauge", target: "lift-capacity-gauge",
      title: "Match the combined fill to the skid's tagged weight",
      cue: "Read the weight stamped on the skid's tag, then crack air into both bags together and commit once their combined lift matches it.",
      why: "Underfilled, the two bags together still cannot break the skid free of the silt no matter how long you wait; overfilled, the combined lift keeps growing as both bags expand on the way up and the rig accelerates past anyone's control. Matching the fill to the actual tagged weight, not a guess at how heavy the skid looks, is what keeps the lift exactly as strong as the job needs and no stronger.",
      gauge: { label: "COMBINED LIFT VS TAGGED WEIGHT", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "short of the tag — will not break free" : t <= 0.6 ? "matched to the tag — ready to lift" : "past the tag — rig will run on the way up") },
    },
    {
      id: "level-the-load", kind: "turn", target: "bridle-turnbuckle",
      title: "Work the turnbuckle to bring the skid level",
      cue: "Turn the bridle's equalizing turnbuckle until the skid hangs level between its two bags rather than canted to one side.",
      why: "A skid rigged tilted lifts tilted, and a tilted load slides inside its own bridle as it rises, shifting weight onto whichever leg is now taking more of it than it was rigged for. Levelling it here, on the bottom, before anything is under way, is far easier than trying to correct a load that has already started shifting halfway up.",
      turn: { turns: 0.6, label: "BRIDLE TURNBUCKLE", readout: (t) => (t < 0.3 ? "canted hard to one side" : t < 0.85 ? "coming level" : "level between both legs") },
    },
    {
      id: "route-hazards", kind: "find", noHint: true,
      targets: ["cable-near-bridle", "umbilical-near-bridle"],
      itemNames: { "cable-near-bridle": "power cable lying across a bridle leg", "umbilical-near-bridle": "your own umbilical near the rigging" },
      itemNotes: {
        "cable-near-bridle": "The trailing power cable found earlier, now lying directly across the near bridle leg where it will be pinned the instant that leg takes weight.",
        "umbilical-near-bridle": "Your own umbilical, close enough to the bridle's legs that a wrong move before the lift starts could drape it across one of them.",
      },
      title: "Check nothing is lying across the rig before it lifts",
      cue: "Before signalling ready: check the cable is clear of both legs, and check your own umbilical has not drifted near them either.",
      why: "Everything that could get pinned under a bridle leg has to be found and moved before the legs take any weight, because there is no freeing anything from under a loaded sling leg once the lift is under way. This is the last check before the skid comes off the silt, which is exactly why it is worth doing slowly rather than skipping straight to the lift.",
    },
    {
      id: "guide-liftoff", kind: "hold", target: "guide-liftoff", seconds: 5,
      title: "Guide the skid off the silt on the tag line",
      cue: "Hold the tag line steady, well clear of the bridle, while the skid breaks free of the silt and settle to watch it hang level.",
      why: "The tag line lets you steer the skid's swing without ever putting a hand on the load itself, which matters most in the first few seconds off the bottom, when suction from the silt can let go unevenly and tip the load before the bags have found their own balance. Holding the line steady, not the skid, is what keeps your hands clear of whatever the load does next.",
      holdBreakNote: "You let go of the tag line before the skid settled level — it needs steering through those first unsteady seconds, not left to swing on its own.",
    },
    {
      id: "escort-ascent", kind: "track", target: "ascent-escort", seconds: 6,
      title: "Escort the rise, watching the closing rate",
      cue: "Rise alongside the skid without touching it, watching how fast it is closing on the surface and ready to signal for a vent the moment it quickens.",
      why: "A lift bag's air expands as it rises, so a rig that looked matched to the load at the bottom gets more buoyant, not less, every metre it climbs — the escort's whole job is catching that acceleration early, while a vent still brings it back to a controlled rate, rather than after it has already gathered speed near the surface where a runaway load does the most damage.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "CLOSING RATE ON THE SURFACE", readout: (v) => (v < 0.42 ? "barely rising — check the fill" : v > 0.6 ? "quickening — signal for a vent" : "steady, controlled rise") },
      holdBreakNote: "The closing rate broke out of band — the rig stalled or started to run. Signal for a vent or a touch more air and bring it back to a steady rise.",
    },
    {
      id: "vent-at-stop", kind: "turn", target: "vent-valve-checkpoint",
      title: "Work the vent at the safety stop",
      cue: "At the planned stop, open the dump valve on the lead bag until the rise eases to a crawl, then close it again.",
      why: "The safety stop exists to slow a rising load down deliberately, on purpose, rather than trusting it to arrive at the surface at whatever speed the last few metres happened to build to. A short, controlled vent here costs a little of the lift; skipping it costs whoever is standing by at the rail when a two-bag rig arrives at full speed.",
      turn: { turns: 0.5, label: "DUMP VALVE", readout: (t) => (t < 0.3 ? "closed — no venting yet" : t < 0.85 ? "venting — rise slowing" : "closed again — rise eased") },
    },
    {
      id: "report-lift", kind: "select", target: "ulbr-comms",
      title: "Report the lift and the cable left behind",
      cue: "Tell the supervisor: skid rigged and lifted level, the trailing cable found and left for the work plan, and the closing rate managed the whole way up.",
      why: "The barge crew waiting at the surface plan the next few minutes entirely around this report, from where to stand as the rig breaks the surface to what to do with a cable still running off into the silt. Giving it now, while the lift is still fresh, is worth more to them than a summary pieced together after the gear is already back aboard.",
    },
    {
      id: "check-in", kind: "select", target: "stage-checkin",
      title: "Check in at the stage before leaving the water",
      cue: "Clip on at the stage and tell the supervisor how the rig behaved on the way up, including the moment it slid inside the bridle and whatever the comms drop cost you, before you signal ready to come up.",
      why: "A load that shifted in its bridle partway up and a stretch of dead comms mid-escort are both the kind of thing worth saying honestly rather than leaving out because the lift ended up fine anyway, and the ascent itself only happens once the supervisor has heard it and called it. The Pile Drivers Local 34 member assistance line is there for whatever a debrief on the deck does not fully settle.",
    },
  ],

  interrupts: [
    {
      id: "load-slides-in-bridle",
      kind: "Skid slides inside the bridle as it clears the silt",
      after: "guide-liftoff", delay: 2, seconds: 14,
      alert: "The skid has shifted inside its bridle as it broke free — it is hanging canted and swinging toward the near leg.",
      cue: "Get back to the turnbuckle and relevel the load before it swings any further.",
      target: "relevel-point",
      why: "A load that starts sliding inside its own bridle keeps shifting weight onto whichever leg is taking more of it, and a leg carrying more than its share is a leg closer to being overloaded the longer the slide goes uncorrected. The turnbuckle is the same tool that levelled it on the bottom, and reaching it again now is faster than trying to muscle the skid straight by hand.",
      missNote: "You tried to push the skid straight with your hands instead of reaching the turnbuckle; it kept swinging and dragged the tag line across the near leg before you got it releveled.",
      wrongNote: "The turnbuckle — relevel the load properly rather than pushing the skid straight by hand.",
    },
    {
      id: "bag-overtakes-fill",
      kind: "Lead bag starts to run on the way up",
      after: "escort-ascent", delay: 2, seconds: 14,
      alert: "The lead bag's air has expanded faster than the rise was planned for — the rig is accelerating and starting to outrun you.",
      cue: "Get to the quick-vent toggle and spill air fast before the rig gets further ahead of you.",
      target: "quick-vent-toggle",
      why: "A bag that starts to outrun its escort only gets faster from there, because the same expansion that got it moving keeps compounding every metre it climbs, and a diver who chases it instead of venting is trying to out-swim a problem that is accelerating while they are not. The quick-vent toggle dumps air fast enough to catch it before it is gone past where you can reach it at all.",
      missNote: "You tried to swim up alongside the rig instead of venting it; the bag kept accelerating and the rig reached the surface well ahead of you, out of anyone's control on the way.",
      wrongNote: "The quick-vent toggle — spill air fast rather than trying to catch up to the rig by swimming.",
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

    // ------------------------------------------------------- the skid
    const skid = group(g, 0.2, 0.25, -0.4);
    box(skid, 1.1, 0.5, 0.7, 0, 0, 0, 0x3a4048, { rough: 0.6, metal: 0.5 });
    box(skid, 0.5, 0.3, 0.4, -0.2, 0.35, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const tag = decal(skid, 0.14, 0.1, 0.45, 0.1, 0.36, paperFace("TAG", ["WEIGHT: SEE MANIFEST"], { bg: "#f2c14b", band: "#8a6a2a" }), { px: 96 });
    void tag;
    const eyeA = group(skid, -0.4, 0.28, 0.36);
    torus(eyeA, 0.06, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 16 });
    const eyeB = group(skid, 0.4, 0.28, 0.36);
    torus(eyeB, 0.06, 0.014, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6, seg2: 16 });
    const eyesHit = box(skid, 1.0, 0.2, 0.1, 0, 0.28, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(skid, "lift eyes", 0, 0.5, 0.36, { css: ULBR_CSS, w: 0.24 });
    reg(hits, eyesHit, "skid-lift-eyes");
    const cable = hose(g, [[0.7, 0.15, -0.2], [1.4, 0.06, 0.4], [1.9, 0.04, 1.0]], 0.02, 0x1c1f1a, { steps: 12, rough: 0.7 });
    reg(hits, cable, "trailing-power-cable");

    // ------------------------------------------------------- shackles, bridle legs, turnbuckle
    const shackleA = group(g, -0.4, 0.7, 0.4);
    box(shackleA, 0.05, 0.08, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const pinA = cyl(shackleA, 0.01, 0.01, 0.06, 0.02, -0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 });
    void pinA;
    const shackleB = group(g, 0.4, 0.7, 0.4);
    box(shackleB, 0.05, 0.08, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const pinB = cyl(shackleB, 0.01, 0.01, 0.06, 0.02, -0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 8 });
    void pinB;
    const attachHit = box(g, 1.0, 0.3, 0.3, 0, 0.7, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, attachHit, "shackle-attach");
    const wireA = box(shackleA, 0.06, 0.01, 0.01, 0.02, -0.04, 0.02, 0xd8d8d8, { rough: 0.5, metal: 0.6 });
    wireA.visible = false;
    const wireB = box(shackleB, 0.06, 0.01, 0.01, 0.02, -0.04, 0.02, 0xd8d8d8, { rough: 0.5, metal: 0.6 });
    wireB.visible = false;
    const mouseHit = box(g, 1.0, 0.3, 0.3, 0, 0.62, 0.42, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "mouse both pins", 0, 0.9, 0.4, { css: ULBR_CSS, w: 0.3 });
    reg(hits, mouseHit, "shackle-mouse");
    const legA = cyl(g, 0.012, 0.012, 1.0, -0.4, 1.2, 0.4, 0x2b3138, { rough: 0.6, seg: 6 });
    const legB = cyl(g, 0.012, 0.012, 1.0, 0.4, 1.2, 0.4, 0x2b3138, { rough: 0.6, seg: 6 });
    const turnbuckle = group(g, 0, 1.7, 0.4);
    cyl(turnbuckle, 0.025, 0.025, 0.16, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    const tbBody = box(turnbuckle, 0.02, 0.02, 0.14, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    holoTag(turnbuckle, "bridle turnbuckle", 0, 0.14, 0, { css: ULBR_CSS, w: 0.34 });
    reg(hits, turnbuckle, "bridle-turnbuckle");
    const relevelHit = box(g, 0.3, 0.3, 0.3, 0, 1.7, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, relevelHit, "relevel-point");

    // ------------------------------------------------------- lift bags, gauge, vent
    const bagRackA = group(g, -1.4, 0.1, -1.2);
    ball(bagRackA, 0.18, 0, 0.18, 0, 0xf2c14b, { rough: 0.6, seg: 12, seg2: 10 }).scale.set(0.9, 1.3, 0.9);
    holoTag(bagRackA, "lift bag one", 0, 0.44, 0, { css: ULBR_CSS, w: 0.24 });
    reg(hits, bagRackA, "lift-bag-one");
    const legOneHit = group(g, -0.4, 1.2, 0.4);
    box(legOneHit, 0.16, 0.16, 0.16, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, legOneHit, "bridle-leg-one");
    const bagRackB = group(g, -1.1, 0.1, -1.5);
    ball(bagRackB, 0.18, 0, 0.18, 0, 0xf2c14b, { rough: 0.6, seg: 12, seg2: 10 }).scale.set(0.9, 1.3, 0.9);
    holoTag(bagRackB, "lift bag two", 0, 0.44, 0, { css: ULBR_CSS, w: 0.24 });
    reg(hits, bagRackB, "lift-bag-two");
    const legTwoHit = group(g, 0.4, 1.2, 0.4);
    box(legTwoHit, 0.16, 0.16, 0.16, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, legTwoHit, "bridle-leg-two");
    const capacityGauge = holoPanel(g, 0.4, 0.28, -2.0, 1.0, -1.2, (cx, w, h) => {
      cx.fillStyle = "rgba(22,14,6,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = ULBR_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f8ecdc"; cx.fillText("LIFT CAPACITY", w * 0.06, h * 0.24);
    }, { ry: 0.5, accent: ULBR_ACCENT });
    reg(hits, capacityGauge, "lift-capacity-gauge");
    const ventValve = group(g, 0.6, 1.55, 0.15);
    cyl(ventValve, 0.03, 0.03, 0.05, 0, 0, 0, 0x2f8f5a, { rough: 0.5, seg: 10 }).rotation.z = Math.PI / 2;
    const ventHandle = box(ventValve, 0.01, 0.06, 0.008, 0.03, 0, 0, 0x2f8f5a, { rough: 0.5 });
    holoTag(ventValve, "vent valve", 0, 0.14, 0, { css: ULBR_CSS, w: 0.24 });
    reg(hits, ventValve, "vent-valve-checkpoint");
    const quickVent = group(g, -0.6, 1.55, 0.15);
    box(quickVent, 0.08, 0.06, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    holoTag(quickVent, "quick-vent toggle", 0, 0.14, 0, { css: ULBR_CSS, w: 0.34 });
    reg(hits, quickVent, "quick-vent-toggle");

    // ------------------------------------------------------- hazards
    const mouseHazardHit = box(g, 0.4, 0.3, 0.3, -0.4, 0.7, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "clip a bag before mousing?", -0.4, 1.0, 0.4, { css: "#d2312b", w: 0.42 });
    reg(hits, mouseHazardHit, "skip-mousing");
    const handOnLoadHit = box(g, 1.1, 0.5, 0.7, 0.2, 0.25, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "steady it with a hand?", 0.2, 0.65, -0.4, { css: "#d2312b", w: 0.4 });
    reg(hits, handOnLoadHit, "hand-on-the-load");
    const umbCrossHit = box(g, 1.0, 0.3, 0.3, 0, 1.2, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "work with the umbilical across it?", 0, 1.5, 0.4, { css: "#d2312b", w: 0.56 });
    reg(hits, umbCrossHit, "umbilical-across-bridle");
    const noCommsVentHit = box(g, 0.4, 0.4, 0.3, 0.6, 1.55, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep venting — no comms?", 0.6, 1.85, 0.15, { css: "#d2312b", w: 0.46 });
    reg(hits, noCommsVentHit, "vent-blind-no-comms");

    // ------------------------------------------------------- tag line, route, escort, cable-near, umbilical-near
    const tagLine = group(g, 1.1, 0.4, 0.2);
    cyl(tagLine, 0.01, 0.01, 0.6, 0, 0.3, 0, 0xf2e6b8, { rough: 0.6, seg: 6 });
    holoTag(tagLine, "hold — guide off silt", 0, 0.66, 0, { css: ULBR_CSS, w: 0.36 });
    reg(hits, tagLine, "guide-liftoff");
    const ascentEscort = group(g, 0.2, 2.2, -0.4);
    torus(ascentEscort, 0.22, 0.012, 0, 0, 0, ULBR_ACCENT, { emissive: ULBR_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    reg(hits, ascentEscort, "ascent-escort");
    const cableNear = group(g, -0.35, 0.75, 0.42);
    box(cableNear, 0.16, 0.03, 0.03, 0, 0, 0, 0x1c1f1a, { rough: 0.7 });
    reg(hits, cableNear, "cable-near-bridle");
    const umbNearRing = group(g, 0.35, 1.0, 0.5);
    torus(umbNearRing, 0.1, 0.012, 0, 0, 0, ULBR_ACCENT, { emissive: ULBR_ACCENT, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    reg(hits, umbNearRing, "umbilical-near-bridle");

    // ------------------------------------------------------- comms, umbilical, stage
    const comms = holoPanel(g, 0.5, 0.3, -2.0, 1.6, -1.2, ulbrCommsFace(["Supervisor · topside", "Press to talk"]), { ry: 0.5, accent: ULBR_ACCENT });
    reg(hits, comms, "ulbr-comms");
    const umbilical = hose(g, [[-3.2, 1.2, 2.0], [-2.0, 0.5, 0.4], [-0.8, 0.3, 0.2], [0.8, 0.8, 0.3]], 0.03, 0xf2c14b, { steps: 16, rough: 0.8 });
    void umbilical;
    const stage = group(g, -2.9, 0, -1.9);
    box(stage, 1.5, 0.05, 1.5, 0, 0.25, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stage, 0.06, 1.6, 0.06, sx * 0.65, 0.8, sz * 0.65, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    torus(stage, 0.3, 0.01, 0, 0.26, 0, ULBR_ACCENT, { emissive: ULBR_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    holoTag(stage, "stage — check in", 0, 0.5, 0, { css: ULBR_CSS, w: 0.3 });
    reg(hits, stage, "stage-checkin");
    const slate = decal(g, 0.26, 0.2, -2.3, 0.7, -1.0, paperFace("SLATE", ["Skid rigged · level", "Cable left for plan", "Escort managed"], { bg: "#e8eef0", band: ULBR_CSS }), { px: 192 });
    void slate;

    // ------------------------------------------------------- bubble/streak effects
    const slideTilt = group(skid, 0, 0, 0);
    void slideTilt;
    const speedBubbles = group(g, 0.2, 2.0, -0.4);
    for (let i = 0; i < 10; i++) ball(speedBubbles, 0.025 + (i % 3) * 0.008, (i % 3) * 0.05 - 0.05, i * 0.16, (i % 2) * 0.04, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.5, seg: 6, seg2: 4, cast: false });
    speedBubbles.visible = false;

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
    for (const [x, z] of [[2.5, 1.5], [-2.6, 1.4], [1.9, -2.3]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.16, 0.18, 0.4, 0, 0.2, 0, 0x4a4234, { rough: 0.95, seg: 12 });
      for (let i = 0; i < 4; i++) { const a = i * 1.6 + x; ball(stub, 0.07, Math.cos(a) * 0.2, 0.12 + (i % 2) * 0.14, Math.sin(a) * 0.2, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    for (let i = 0; i < 6; i++) {
      const link = torus(g, 0.05, 0.016, -2.2 + i * 0.12, 0.03, 1.5 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    const kelp = group(g, -3.0, 0, 0.7);
    for (let i = 0; i < 7; i++) {
      const frond = box(kelp, 0.03, 0.6 + (i % 3) * 0.22, 0.1, i * 0.1, 0.4, (i % 2) * 0.1, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    const rockPile = group(g, 1.7, 0, 2.0);
    for (let i = 0; i < 6; i++) ball(rockPile, 0.13 + (i % 3) * 0.05, (i % 3) * 0.2 - 0.2, 0.05 + (i % 2) * 0.06, Math.floor(i / 3) * 0.2, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.1, 0.6, 0.9);
    for (const [x, z] of [[2.2, -0.6]]) {
      const nBrg = group(g, x, 0, z);
      cyl(nBrg, 0.3, 0.32, 5.8, 0, 2.9, 0, 0x56613f, { seg: 16 });
      for (let i = 0; i < 5; i++) { const a = i * 1.2 + x; ball(nBrg, 0.08, Math.cos(a) * 0.35, 0.2 + (i % 3) * 0.16, Math.sin(a) * 0.35, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    const bubbles = group(g, 0.2, 1.2, -0.4);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.02 + (i % 3) * 0.008, (i % 3) * 0.04 - 0.04, i * 0.14, (i % 2) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.7, 0.1),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "report-on-bottom") repaint(comms.userData.face, ulbrCommsFace(["On the bottom — reported", "Starting the rig"]));
        if (step.id === "rig-bridle") { wireA.visible = true; wireB.visible = true; }
        if (step.id === "clip-bag-one") bagRackA.position.set(-0.4, 1.5, 0.4);
        if (step.id === "clip-bag-two") bagRackB.position.set(0.4, 1.5, 0.4);
        if (step.id === "guide-liftoff") skid.position.y = 0.5;
        if (step.id === "escort-ascent") skid.position.y = 1.6;
        if (step.id === "report-lift") repaint(comms.userData.face, ulbrCommsFace(["Skid lifted — reported", "Cable left for the plan"]));
        if (step.id === "check-in") repaint(slate, paperFace("SLATE — LOGGED", ["Skid rigged · level", "Cable left for plan", "Rig recovered clean"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "load-slides-in-bridle") skid.rotation.z = 0.4;
        if (it.id === "bag-overtakes-fill") { speedBubbles.visible = true; skid.position.y = 2.0; }
      },
      onInterruptEnd(it) {
        if (it.id === "load-slides-in-bridle" && it.resolved === "answered") skid.rotation.z = 0;
        if (it.id === "bag-overtakes-fill" && it.resolved === "answered") { speedBubbles.visible = false; skid.position.y = 1.7; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "level-the-load") tbBody.rotation.x = session.turn.amount * Math.PI * 2;
        if (session?.turn && step?.id === "vent-at-stop") ventHandle.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "match-lift-capacity") capacityGauge.scale.y = 0.7 + gg.t * 0.6;
        if (step?.id === "escort-ascent" && session.holding) ascentEscort.position.y = 2.2 + (session.track?.inBand ?? 0) * 0.3;
        if (speedBubbles.visible) speedBubbles.children.forEach((b, i) => { b.position.y = (t * 1.2 + i * 0.18) % 1.6; });
        school.position.x = -0.6 + Math.sin(t * 0.3) * 0.3;
        void dt; void CITY; void signFace;
      },
    };
  },
};
