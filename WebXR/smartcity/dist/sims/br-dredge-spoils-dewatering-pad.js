import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, pavingFace, waterFace, mudflatFace,
} from "../citykit.js";
import { excavator } from "../../../shared/equipment.js";
import { spudBarge } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dredge Spoils Dewatering Pad VR — SF Bay Restoration &
// Cleanup, pack D (contaminated sediment and water quality).
//
// Wet dredged sediment comes off a spud barge at a bulkhead and is rehandled
// by a tracked excavator into a lined, bermed pad, where it drains. The water
// that drains out of it — the decant — collects in a sump, is pumped through
// a bag filter and a carbon vessel, and goes back to the Bay only under the
// pad's own discharge conditions. The learner is the LIUNA Local 261 pad
// lead; an IUOE Local 3 operating engineer runs the excavator and an
// Inlandboatmen's Union deckhand minds the barge. Nothing here is any real
// site: no limit, dose or depth is stated as a number, every screening and
// disposal call is "per the work plan", and the decant sample goes under
// chain of custody from the port to the cooler to the courier.

const BRDW_ACCENT = 0xb98a4e;

/** HDPE liner: near-black sheet with welded seams and a dull sheen. */
function brdwLinerFace(g, w, h) {
  g.fillStyle = "#1a1c1e"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${(Math.random() * 0.04).toFixed(3)})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  for (let k = 1; k < 4; k++) { g.fillStyle = "rgba(90,96,102,0.55)"; g.fillRect(0, (k * h) / 4 - 3, w, 6); g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(0, (k * h) / 4 + 3, w, 2); }
}

export const SIM_BR_DREDGE_SPOILS_DEWATERING_PAD = {
  id: "br-dredge-spoils-dewatering-pad",
  index: "BR-D1",
  domain: "Environmental",
  trade: "LIUNA Local 261 hazardous-waste laborer as the dewatering pad lead, with an IUOE Local 3 operating engineer rehandling spoils off the barge and an Inlandboatmen's Union deckhand on the barge",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "LIUNA Local 261 hazardous waste and environmental remediation training (LIUNA Training and Education Fund); IUOE Local 3 operating engineer apprenticeship for the rehandling excavator; OSHA HAZWOPER, 29 CFR 1910.120, for everyone inside the pad's exclusion zone; the Regional Water Quality Control Board's Section 401 certification and waste discharge requirements for the decant returned to the Bay; Army Corps Section 404 permit conditions for the dredging the pad serves; DMMO testing of the dredged material; EPA QA/G-5 chain-of-custody practice for the decant samples; RCRA 40 CFR 262 generator duties and DTSC rules only if the work plan's profile makes any of the spoils hazardous waste",
  name: "Dredge Spoils Dewatering Pad",
  title: simTitle("Dredge Spoils Dewatering Pad"),
  tagline: "Wet dredged sediment rehandled off a barge into a lined pad: the work plan read, the liner and berm walked, the sump's freeboard read, a fresh bag in the filter and the decant lined up, the bucket called low over the cell while spoils fall into the barge gap, the decant sampled while the effluent meter trips, custody sealed, the spoils tested for free liquid and held for their profile, the pad walked, logged and the crew checked in",
  accent: BRDW_ACCENT,
  accentCss: "#b98a4e",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "nothing-back-unfiltered", name: "Nothing Back Unfiltered", note: "Not a drop of decant went to the Bay around the filter train, and every sample left the pad under custody" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261 or IUOE Local 3 — with the employer's employee assistance line behind it",

  game: system({
    name: "Decant Control",
    currency: "CELL",
    ranks: ["Pad Hand", "Decant Tender", "Pad Lead", "Rehandle Foreman", "Decant Control Certified"],
    badges: [
      { id: "liner-first", name: "Liner First", note: "The work plan read and the liner and berm walked clean before anything was rehandled", test: AWARD.all(AWARD.stepClean("work-plan"), AWARD.stepClean("liner-walk")) },
      { id: "never-around-the-train", name: "Never Around The Train", note: "Never a bypass, never a boot on the spoils, never a walk through the swing", test: AWARD.safe },
      { id: "freeboard-true", name: "Freeboard True", note: "Sump and free-liquid readings both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-pad", name: "Clean Pad", note: "No corrections from the work plan to the check-in", test: AWARD.clean },
      { id: "steady-rehandle", name: "Steady Rehandle", note: "The rehandle call held in band the whole time", test: AWARD.unbroken },
      { id: "cell-drained", name: "Cell Drained", note: "Pad logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "swing-radius-walk": "You cut through the excavator's swing radius to look at the barge. The operator is watching the bucket and the barge, not the ground behind the counterweight, and a house slewing with a loaded bucket sweeps its tail through exactly the strip you walked across. The way to the bulkhead is round the barricade, with the operator's eyes on you and the bucket grounded.",
    "walk-on-spoils": "You stepped onto the spoils mound to reach the sump hose. Freshly placed dredged sediment has almost no strength until it drains — it holds a boot for a step and then takes the leg to the knee, and a person mired in wet spoils cannot free themselves and should not be pulled straight up by others. Hoses are reached from the berm with a hook, never from the pile.",
    "decant-bypass": "You reached for the bypass that dumps the sump straight to the Bay to bring the level down fast. The decant is the part of the sediment that carries the fine particles and whatever is bound to them, and the pad's discharge conditions exist for that water; sending it round the bag and the carbon is an unpermitted discharge whatever the sump level. A high sump means slowing the rehandle, not opening the bypass.",
    "liner-knife": "You went to slit the liner at the corner to drain a puddle faster. The liner is the only thing between the spoils' pore water and the ground under the pad; a cut made to hurry one puddle becomes the path everything on the pad drains through for the rest of the job. Standing water is pumped to the sump or left to the decant line — the liner is never opened.",
  },

  lateNotes: {
    "decant-valve": "Line the decant up to the filter once a fresh bag is seated in the housing — water sent at an empty housing goes straight through to the carbon and loads it with fines.",
    "decant-sample-port": "The compliance sample is drawn once the decant is actually running through the train — a sample from a dry port is not a sample of anything.",
    "paint-filter": "The free-liquid test is run on spoils that have been left to drain, after the day's rehandle and decant sampling — not on the load that has just come off the barge.",
    "pad-log": "The pad log is written once the close-out walk is done — it records what the walk found as well as what the day did.",
  },

  steps: [
    {
      id: "work-plan", kind: "select", target: "work-plan-board",
      title: "Read the work plan and the pad's discharge conditions",
      cue: "Read today's page of the work plan at the board: the pad cell in use, the decant route, the discharge conditions, the sampling schedule and who decides where the spoils go.",
      why: "The pad exists because the Section 401 certification and the waste discharge requirements let decant go back to the Bay only through a filter train and only while it meets their conditions, and the work plan is where those conditions, the sampling schedule and the disposal decisions are written down. A pad lead who has not read today's page is guessing at what the Water Board will judge the day against.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["ppe-suit", "ppe-boots", "ppe-gloves"],
      itemNames: { "ppe-suit": "coated coverall", "ppe-boots": "steel-toe rubber boots", "ppe-gloves": "inner and outer chemical gloves" },
      title: "Dress for the exclusion zone",
      cue: "Coated coverall, steel-toe rubber boots and two pairs of gloves, as the site safety and health plan sets for the wet spoils.",
      why: "Dredged sediment is wet, fine and sticky, and whatever the profile finds in it is carried on whatever it touches — skin, cuffs, the cab of a truck. HAZWOPER makes the site safety and health plan the rule for what is worn inside the exclusion zone, and the coverall, boots and double gloves keep the spoils on things that are left at the decon line instead of taken home.",
    },
    {
      id: "liner-walk", kind: "find", noHint: true,
      targets: ["liner-tear", "berm-low"],
      itemNames: { "liner-tear": "a tear in the liner at the berm corner", "berm-low": "a low, slumped section of the berm crest" },
      itemNotes: {
        "liner-tear": "The liner has torn where it folds over the berm corner — decant pooling against it will find the ground through that tear before it finds the sump.",
        "berm-low": "The berm crest has slumped low on the bay side; a full cell overtops there first, and water that overtops a berm has skipped the filter train entirely.",
      },
      title: "Walk the liner and the berm before anything is rehandled",
      cue: "Walk the cell's edge: the liner seams and corners, and the berm crest all the way round.",
      why: "The pad is a lined bowl, and it only works while both halves hold: the liner keeps the pore water out of the ground and the berm keeps it inside the liner. Both fail quietly — a tear at a fold, a crest slumped after rain — and both are far easier to fix on an empty cell than under a bucket of wet spoils.",
    },
    {
      id: "sump-freeboard", kind: "gauge", target: "sump-staff",
      title: "Read the sump's freeboard against the work plan's mark",
      cue: "Read the staff gauge in the sump and commit it against the freeboard mark the work plan sets before the barge is worked.",
      why: "Every bucket of wet sediment puts more water into the pad than it takes out, and the sump has to have room for it before the rehandle starts. The freeboard mark is set in the work plan for this cell, and reading the staff first tells the pad lead whether the decant line must be running before the first bucket, not after the sump is already brimming.",
      gauge: { label: "SUMP FREEBOARD", speed: 0.66, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "above the mark — not enough room" : t <= 0.58 ? "inside the work plan's mark" : "staff still settling"), missNote: "Outside the band — let the water settle on the staff and read it against the work plan's freeboard mark, not the last shift's." },
    },
    {
      id: "seat-bag", kind: "drag", target: "filter-bag",
      title: "Seat a fresh bag in the filter housing",
      cue: "Carry a fresh filter bag to the housing and seat it in the basket before the decant is lined up.",
      why: "The bag takes out the fine sediment the decant carries, which is where most of what the pad is controlling is bound; the carbon behind it is for what dissolves. A spent or torn bag passes fines straight onto the carbon, which blinds it, and then nothing in the train is doing its job — so a fresh bag is seated and the lid closed before any water moves.",
      drag: { to: "filter-housing", radius: 0.45, missNote: "Not in the basket — the bag has to sit down in the housing with its ring on the seat, or the decant goes round it." },
    },
    {
      id: "line-up", kind: "turn", target: "decant-valve",
      title: "Line the decant up to the filter train",
      cue: "Open the decant pump's discharge valve to the filter train, steadily, and watch the housing gauge come up.",
      why: "The decant is sent through the bag and the carbon before anything goes near the outfall, and the valve is opened steadily so the housing fills and seats the bag instead of slamming it. Lining up before the rehandle starts means the sump is being drawn down from the first bucket rather than chased once it is already near the mark.",
      turn: { turns: 1.5, label: "DECANT VALVE", readout: (t) => (t < 0.3 ? "closed" : t < 0.9 ? "opening — housing filling" : "lined up to the train") },
    },
    {
      id: "rehandle-call", kind: "track", target: "rehandle-paddle", seconds: 7,
      title: "Call the rehandle into the cell",
      cue: "Hold the call steady: the bucket low over the cell, a slow release, no swing over the berm or anyone on the ground.",
      why: "A bucket of wet spoils dropped from height splashes out of the cell and over the berm, and one swung fast throws water off its lip on the way; both put sediment where the liner cannot hold it. The pad lead holds the operator to a low, slow release inside the cell, because the operator's view of the cell floor from the cab is worse than the ground's.",
      track: { start: 0.12, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.12, label: "REHANDLE CALL", readout: (v) => (v < 0.4 ? "too slow — barge window closing" : v > 0.6 ? "high and fast — splashing" : "low, slow release") },
      holdBreakNote: "The call broke and the bucket came up high and fast over the berm. Bring it back down to a low, slow release inside the cell.",
    },
    {
      id: "decant-sample", kind: "hold", target: "decant-sample-port", seconds: 5,
      title: "Draw the decant compliance sample",
      cue: "Hold the bottle under the effluent port, gloved, until it fills to the shoulder without touching the tap.",
      why: "The decant sample is the proof the water leaving the pad met its conditions, and it is only worth anything if it is the water that actually went to the Bay: drawn at the effluent port after the carbon, filled without the bottle touching the tap, and taken on the schedule the work plan sets. A sample topped up from the sump or filled in a hurry is a number that describes nothing.",
      holdBreakNote: "The bottle came away before it filled and touched the tap. Start a fresh bottle and hold it under the port until it fills cleanly.",
    },
    {
      id: "custody", kind: "sequence",
      targets: ["coc-label", "coc-seal", "coc-sign"],
      itemNames: { "coc-label": "bottle label", "coc-seal": "custody seal on the cooler", "coc-sign": "chain-of-custody form signed to the courier" },
      title: "Label, seal and hand the sample over under custody",
      cue: "Label the bottle, put it on ice and seal the cooler, then sign the chain-of-custody form as you relinquish it to the courier.",
      why: "A compliance sample changes hands at least twice before a lab opens it, and at every hand-off somebody has to be able to say who had it and that nobody else did. The label ties it to the port and the time, the seal shows the cooler was not opened, and the signed relinquish is the courier taking responsibility — EPA QA/G-5 practice, and the reason a lab result can be defended.",
      outOfOrderNote: "Out of order — the bottle is labelled first, the cooler sealed second, and the custody form signed as the cooler changes hands.",
    },
    {
      id: "free-liquid", kind: "gauge", target: "paint-filter",
      title: "Test the drained spoils for free liquid",
      cue: "Run the paint filter test on a sample of yesterday's drained spoils and read it against the work plan's criterion before anything is released for loading.",
      why: "Spoils go on a truck or a disposal site only once they stop giving up water, because a load that still drains leaks out of a truck bed and fails a landfill's acceptance. The paint filter test is the plain field check the work plan names — whether free liquid passes through the filter — and it decides whether a cell keeps draining another day.",
      gauge: { label: "FREE LIQUID", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "liquid through the filter" : t <= 0.6 ? "no free liquid" : "test still dripping — wait"), missNote: "Outside the band — give the filter its full time and read it again before calling the spoils drained." },
    },
    {
      id: "hold-tag", kind: "select", target: "hold-tag",
      title: "Tag the drained cell on hold for its profile",
      cue: "Hang the hold tag on yesterday's cell: drained, sampled, awaiting the profile results and the disposal decision per the work plan.",
      why: "Whether a cell goes to a reuse site, a landfill or somewhere more restrictive is decided from its profile results by the people the work plan names, not by the pad crew's eye. The hold tag stops a truck being loaded from a cell that looks dry before that decision exists, which is the easiest way for the wrong spoils to end up in the wrong place.",
    },
    {
      id: "close-out", kind: "find", noHint: true,
      targets: ["sump-screen-clog", "hose-chafe"],
      itemNames: { "sump-screen-clog": "the sump intake screen matted with fines", "hose-chafe": "the decant hose chafing where it crosses the berm" },
      itemNotes: {
        "sump-screen-clog": "The intake screen in the sump is matted over with fines. Left overnight, the pump draws air, the sump rises in the rain, and the berm is what holds it.",
        "hose-chafe": "The decant hose has rubbed through its outer cover where it crosses the berm crest — the next failure is a split spraying decant outside the liner.",
      },
      title: "Walk the pad before it is left for the night",
      cue: "Walk the sump and the decant line: the intake screen, and the hose where it crosses the berm.",
      why: "The pad keeps working after the crew leaves: rain falls on it, the sump fills, and the pump runs unattended. What fails overnight is what was already failing at close-out, so the sump screen and the hose crossing get one more look now, while the fix is a rake and a length of chafe guard rather than a spill report.",
    },
    {
      id: "pad-log", kind: "select", target: "pad-log",
      title: "Write the pad log",
      cue: "Log the barge load rehandled, the freeboard readings, the bag change, the decant sample and its custody, the effluent trip and the divert, the free-liquid result, the hold tag and the close-out fixes.",
      why: "The pad log is the record the discharge monitoring report and the disposal decision are both built from, and the Water Board reads it after the fact, when the only thing that matters is what was written that day. The effluent trip and the divert go in with their times, because a trip that is logged with its response is a control working and a trip nobody wrote down is an unexplained gap.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator and the barge",
      cue: "On the radio: the pad is logged and the pump is on its overnight setting, and how the operator and the deckhand are after a long rehandle and a trip on the effluent.",
      why: "The operator spent the day swinging loaded buckets over a barge and a pad with people on the ground, and the deckhand worked a barge deck slick with spoils. The check-in closes the day's plan out loud so the night pump and the barge moorings are known to everyone, and it is also the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "spoils-in-the-gap",
      kind: "Spoils falling between the barge and the bulkhead",
      after: "rehandle-call", delay: 3, seconds: 14,
      alert: "A slug of spoils has slid off the bucket's lip into the gap between the barge and the bulkhead — there is a brown plume spreading in the water below the swing.",
      cue: "Lower the spill apron across the gap so the bucket swings over steel, not water.",
      target: "spill-apron",
      why: "Every bucket rehandled from a barge crosses a strip of open water, and the spill apron is the plate that closes it: anything that drops off the lip lands on steel that drains back into the barge. With the apron up, what falls goes straight into the Bay the dredging permit is protecting, so the apron is lowered before the next swing, not after the plume has drifted.",
      missNote: "The operator kept swinging across the open gap with the apron up; two more slugs went into the water, and the plume drifted along the bulkhead past the turbidity monitor the permit is judged on.",
      wrongNote: "The spill apron — it closes the gap under the swing so nothing else falls into the water.",
    },
    {
      id: "effluent-turbidity-trip",
      kind: "Effluent turbidity meter tripped",
      after: "decant-sample", delay: 2, seconds: 14,
      alert: "The turbidity meter on the effluent line has tripped past its setpoint and its lamp has gone red — the water heading for the outfall is cloudier than the pad's conditions allow.",
      cue: "Throw the divert valve: send the effluent back to the pad, not to the Bay, while the train is checked.",
      target: "divert-valve",
      why: "A trip on the effluent meter means something in the train has stopped holding — a bag seated badly, a burst, carbon blinded — and until it is found the water leaving is not water the pad is allowed to discharge. The divert sends it back into the cell to go round again, which keeps the pad in compliance while the cause is found; the sample in hand gets a note that the trip happened during it.",
      missNote: "The cloudy effluent kept running to the outfall while the sample finished filling; the day's discharge monitoring report now carries an exceedance and the bag was found split an hour later.",
      wrongNote: "The divert valve — send the effluent back to the pad first, then find what failed in the train.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRDW_ACCENT);

    // ------------------------------------------------ ground, bulkhead, water
    const yard = box(g, 13, 0.03, 8.2, 0, 0.015, -0.9, 0xffffff, { rough: 0.95, cast: false });
    yard.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#4a4640", base2: "#403c36", seam: "rgba(0,0,0,0.35)" }), { repeat: 5, px: 512 }), { rough: 0.95, color: 0xc8c0b4 });
    const water = box(g, 16, 0.02, 9, 0, 0.005, -9.6, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#14262a", mid: "#1b3032" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8aa4a8 });
    box(g, 16, 0.4, 0.5, 0, 0.2, -5.05, 0x8b8a86, { rough: 0.9 });
    box(g, 16, 0.05, 0.12, 0, 0.42, -4.86, CITY.hiVis, { rough: 0.6 });

    // --------------------------------------------------------- barge alongside
    const barge = spudBarge(g, 0.8, -0.6, -8.45, { ry: Math.PI / 2 });
    const bargeSpoils = box(g, 6.2, 0.55, 3.6, 0.6, 1.2, -8.45, 0xffffff, { rough: 0.98, cast: false });
    bargeSpoils.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3b342a", base2: "#2e2821", pools: 8 }), { repeat: 2, px: 256 }), { rough: 0.98, color: 0xb8ac98 });
    void barge;
    const deckhand = standingFigure(g, 3.6, -7.0, { ry: -2.6, atStation: true, cloth: 0x2a3a48, vest: 0xf06a2b, helmet: 0xf2f2ee, gloves: true });
    deckhand.position.y = 0.95;
    holoTag(g, "barge deckhand", 3.6, 3.0, -7.0, { css: "#b98a4e", w: 0.34 });

    // Spill apron: a hinged plate over the gap, stowed up until it is lowered.
    const apron = group(g, -2.2, 0.42, -5.25);
    box(apron, 2.4, 0.04, 1.2, 0, 0, -0.6, 0x6f767d, { rough: 0.5, metal: 0.6 });
    apron.rotation.x = 1.25;
    holoTag(g, "spill apron", -2.2, 1.7, -5.0, { css: "#b98a4e", w: 0.3 });
    reg(hits, apron, "spill-apron");
    const plume = box(g, 2.6, 0.012, 1.4, -2.4, 0.03, -5.9, 0x6a5130, { rough: 0.6, emissive: 0x3a2610, ei: 0.4, cast: false });
    plume.visible = false;

    // ------------------------------------------------------- the excavator
    const exc = excavator(g, -6.3, 0, -2.4, { ry: Math.PI });
    const { house, boom, bucket } = exc.userData.parts;
    house.rotation.y = -0.45;
    holoTag(g, "rehandle excavator — IUOE Local 3", -5.6, 5.4, -2.6, { css: "#b98a4e", w: 0.62 });
    const swingHit = box(g, 0.7, 0.8, 0.9, -4.0, 0.45, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "shortcut through the swing?", -4.0, 1.05, -0.6, { css: "#e8622a", w: 0.5 });
    reg(hits, swingHit, "swing-radius-walk");

    // ------------------------------------------------------ the lined cell
    const linerMat = texturedMat(surfaceTexture(brdwLinerFace, { repeat: 2, px: 256 }), { rough: 0.55, metal: 0.1, color: 0xcfd3d6 });
    const cell = group(g, -1.2, 0, -2.3);
    const floor = box(cell, 3.4, 0.05, 2.2, 0, 0.04, 0, 0xffffff, { cast: false });
    floor.material = linerMat;
    for (const [w, d, x, z] of [[3.8, 0.3, 0, -1.25], [3.8, 0.3, 0, 1.25], [0.3, 2.2, -1.85, 0], [0.3, 2.2, 1.85, 0]]) {
      const b = box(cell, w, 0.32, d, x, 0.16, z, 0xffffff);
      b.material = linerMat;
    }
    const spoils = box(cell, 2.5, 0.3, 1.5, -0.25, 0.2, -0.1, 0xffffff, { rough: 0.98, cast: false });
    spoils.material = bargeSpoils.material;
    const tear = decal(cell, 0.3, 0.16, -1.85, 0.33, 1.1, (cx, w, h) => {
      cx.fillStyle = "#1a1c1e"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#8a6a3a"; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(w * 0.1, h * 0.3); cx.lineTo(w * 0.5, h * 0.7); cx.lineTo(w * 0.9, h * 0.4); cx.stroke();
    }, { px: 128 });
    tear.rotation.x = -Math.PI / 2;
    reg(hits, tear, "liner-tear");
    const bermLow = box(cell, 0.7, 0.08, 0.32, 0.9, 0.3, 1.25, 0x5a4a36, { rough: 0.95, emissive: 0x2a1a08, ei: 0.35 });
    reg(hits, bermLow, "berm-low");
    const knifeHit = box(cell, 0.35, 0.3, 0.3, -1.2, 0.45, 1.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    box(cell, 0.16, 0.025, 0.04, -1.2, 0.34, 1.25, 0xe8b02e, { rough: 0.5 });
    holoTag(cell, "slit the liner to drain it?", -1.2, 0.72, 1.3, { css: "#e8622a", w: 0.46 });
    reg(hits, knifeHit, "liner-knife");
    const moundHit = box(cell, 0.6, 0.5, 0.5, -0.6, 0.5, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cell, "step onto the spoils for the hose?", -0.6, 0.92, -0.2, { css: "#e8622a", w: 0.56 });
    reg(hits, moundHit, "walk-on-spoils");

    // Sump in the down-slope corner, its staff gauge and intake screen.
    const sump = group(cell, 1.45, 0, -0.85);
    const sumpWater = box(sump, 0.5, 0.02, 0.5, 0, 0.1, 0, 0x2a3a3a, { rough: 0.2, metal: 0.3 });
    const staff = decal(sump, 0.08, 0.5, 0.2, 0.36, -0.2, (cx, w, h) => {
      cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 10; i++) { cx.fillStyle = i % 2 ? "#d2312b" : "#1b1e22"; cx.fillRect(0, (i * h) / 10, w * (i % 5 === 0 ? 1 : 0.6), h / 20); }
      cx.fillStyle = "#2f8a4a"; cx.fillRect(0, h * 0.28, w, 4);
    }, { px: 64 });
    holoTag(sump, "sump staff gauge", 0.2, 0.7, -0.2, { css: "#b98a4e", w: 0.32 });
    reg(hits, staff, "sump-staff");
    const screen = box(sump, 0.18, 0.12, 0.18, -0.12, 0.14, 0.1, 0x3a3026, { rough: 0.9, emissive: 0x241608, ei: 0.3 });
    reg(hits, screen, "sump-screen-clog");

    // Decant line: sump to pump, over the berm.
    hose(g, [[0.25, 0.15, -3.1], [0.55, 0.42, -3.35], [1.1, 0.35, -3.2], [1.7, 0.3, -2.9]], 0.04, 0x1d2126, { steps: 10, rough: 0.8 });
    const chafe = box(g, 0.2, 0.1, 0.12, 0.62, 0.42, -3.36, 0x8a6a3a, { rough: 0.9, emissive: 0x3a1a06, ei: 0.3 });
    reg(hits, chafe, "hose-chafe");
    const chafeGuard = box(g, 0.34, 0.12, 0.16, 0.62, 0.42, -3.36, 0xe8b02e, { rough: 0.7 });
    chafeGuard.visible = false;

    // --------------------------------------------------- the filter train
    const train = group(g, 2.3, 0, -2.2);
    box(train, 0.8, 0.45, 0.55, -0.4, 0.23, -0.6, 0x2f4d5f, { rough: 0.55, metal: 0.4 });
    cyl(train, 0.14, 0.14, 0.5, -0.4, 0.55, -0.6, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    const dv = valveWheel(train, -0.15, 0.5, -0.2, { r: 0.12, color: BRDW_ACCENT, body: 0x2f4d5f });
    holoTag(train, "decant valve", -0.15, 1.05, -0.2, { css: "#b98a4e", w: 0.28 });
    reg(hits, dv.userData.wheel, "decant-valve");
    const housing = group(train, 0.35, 0, 0.05);
    cyl(housing, 0.2, 0.2, 0.8, 0, 0.4, 0, 0x8b98a5, { rough: 0.4, metal: 0.7, seg: 16 });
    const lid = cyl(housing, 0.22, 0.22, 0.05, 0, 0.83, 0, 0x5b6771, { rough: 0.4, metal: 0.7, seg: 16 });
    const socket = group(housing, 0, 0.9, 0);
    hits["filter-housing"] = socket;
    holoTag(housing, "bag filter housing", 0, 1.15, 0, { css: "#b98a4e", w: 0.36 });
    const carbon = cyl(train, 0.3, 0.3, 1.4, 0.95, 0.7, -0.35, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 16 });
    holoTag(train, "carbon vessel", 0.95, 1.6, -0.35, { css: "#b98a4e", w: 0.3 });
    void carbon;
    hose(g, [[3.25, 0.3, -2.55], [3.6, 0.25, -3.5], [3.4, 0.35, -4.9]], 0.05, 0x1d2126, { steps: 8, rough: 0.8 });
    const bypassHit = box(g, 0.4, 0.45, 0.4, 3.9, 0.35, -3.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    cyl(g, 0.05, 0.05, 0.3, 3.9, 0.3, -3.3, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(g, "open the bypass to the bay?", 3.9, 0.72, -3.3, { css: "#e8622a", w: 0.5 });
    reg(hits, bypassHit, "decant-bypass");

    // Effluent port, turbidity meter and the divert valve.
    const port = group(g, 3.5, 0, -1.2);
    cyl(port, 0.04, 0.04, 0.8, 0, 0.4, 0, 0x8b98a5, { rough: 0.4, metal: 0.7, seg: 10 });
    box(port, 0.06, 0.06, 0.14, 0, 0.62, 0.08, 0x5b6771, { rough: 0.4, metal: 0.7 });
    const bottle = cyl(port, 0.035, 0.035, 0.14, 0, 0.47, 0.14, 0xe6ecef, { rough: 0.3, seg: 10 });
    holoTag(port, "effluent sample port", 0, 0.98, 0.06, { css: "#b98a4e", w: 0.38 });
    reg(hits, bottle, "decant-sample-port");
    const meter = group(g, 3.25, 0, -0.3, -0.4);
    cyl(meter, 0.03, 0.03, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(meter, 0.3, 0.22, 0.1, 0, 1.05, 0, 0x2b3138, { rough: 0.55 });
    const meterScreen = decal(meter, 0.24, 0.12, 0, 1.07, 0.055, signFace("EFFLUENT OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }), { px: 192, glow: true, ei: 0.8 });
    const meterLamp = ball(meter, 0.035, 0.12, 1.2, 0.03, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 8, seg2: 6 });
    holoTag(meter, "effluent turbidity", 0, 1.32, 0, { css: "#b98a4e", w: 0.34 });
    const divert = group(g, 2.75, 0, -0.85);
    cyl(divert, 0.05, 0.05, 0.7, 0, 0.35, 0, 0x5b6771, { rough: 0.45, metal: 0.6, seg: 10 });
    const divertHandle = box(divert, 0.34, 0.04, 0.05, 0.15, 0.72, 0, 0xd2312b, { rough: 0.5 });
    holoTag(divert, "divert to pad", 0, 0.98, 0, { css: "#b98a4e", w: 0.28 });
    reg(hits, divert, "divert-valve");

    // ------------------------------------------ rehandle call paddle, bench
    const call = group(g, -2.2, 0, 0.4);
    cyl(call, 0.03, 0.035, 0.9, 0, 0.45, 0, 0x4a4538, { rough: 0.5, metal: 0.5, seg: 10 });
    const paddle = group(call, 0, 0.92, 0);
    box(paddle, 0.3, 0.05, 0.05, 0, 0.1, 0, CITY.hiVis, { rough: 0.5 });
    holoTag(call, "rehandle call", 0, 1.25, 0, { css: "#b98a4e", w: 0.3 });
    reg(hits, paddle, "rehandle-paddle");

    const bench = group(g, -2.6, 0, 1.3, 0.5);
    box(bench, 1.1, 0.06, 0.5, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(bench, 1.0, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-suit", -0.34, 0xe8edf1, "COVERALL"], ["ppe-boots", 0, 0xe8b02e, "BOOTS"], ["ppe-gloves", 0.34, 0x2f7a4a, "GLOVES"]]) {
      const it = group(bench, dx, 0.8, 0);
      box(it, 0.24, 0.1, 0.2, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.2, 0.06, 0, 0.051, 0, signFace(label, { bg: "#231c0d", accent: "#f2e2b0", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const bag = group(g, -1.9, 0, 1.25, 0.2);
    cyl(bag, 0.12, 0.1, 0.5, 0, 0.3, 0, 0xf2f2ee, { rough: 0.95, seg: 12 });
    holoTag(bag, "fresh filter bag", 0, 0.72, 0, { css: "#b98a4e", w: 0.3 });
    reg(hits, bag, "filter-bag");
    const bagInHousing = cyl(housing, 0.16, 0.16, 0.06, 0, 0.88, 0, 0xf2f2ee, { rough: 0.95, seg: 12 });
    bagInHousing.visible = false;

    // ------------------------------------------- custody table and the cooler
    const table = group(g, 1.7, 0, 1.0, -0.4);
    box(table, 1.0, 0.05, 0.55, 0, 0.75, 0, 0x6b5a48, { rough: 0.8 });
    box(table, 0.9, 0.72, 0.04, 0, 0.36, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    const label = decal(table, 0.12, 0.08, -0.32, 0.79, 0.05, paperFace("SAMPLE", ["DECANT", "PORT E-1"], { bg: "#f4efe0", band: "#b98a4e" }), { px: 128 });
    label.rotation.x = -Math.PI / 2;
    reg(hits, label, "coc-label");
    const cooler = group(table, 0.05, 0.78, 0);
    box(cooler, 0.4, 0.26, 0.28, 0, 0.13, 0, 0x2f6fb8, { rough: 0.55 });
    const seal = box(cooler, 0.06, 0.14, 0.005, 0.12, 0.14, 0.142, 0xf2f2ee, { rough: 0.6 });
    reg(hits, cooler, "coc-seal");
    const cocForm = decal(table, 0.2, 0.26, 0.36, 0.79, 0.02, paperFace("CHAIN OF CUSTODY", ["Sampler —", "Relinquished —", "Received —", "Seal intact —"], { bg: "#f2efe6", band: "#b98a4e" }), { px: 192 });
    cocForm.rotation.x = -Math.PI / 2;
    reg(hits, cocForm, "coc-sign");

    // --------------------------------------------- paint filter test stand
    const pft = group(g, -3.2, 0, -0.9);
    box(pft, 0.4, 0.8, 0.4, 0, 0.4, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    cyl(pft, 0.1, 0.03, 0.16, 0, 0.95, 0, 0xe6ecef, { rough: 0.4, seg: 12 });
    const pftScreen = decal(pft, 0.26, 0.1, 0, 0.62, 0.205, signFace("FREE LIQUID ?", { bg: "#0d1c24", accent: "#b98a4e", fg: "#f2e6c8", scale: 0.42 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(pft, "paint filter test", 0, 1.2, 0, { css: "#b98a4e", w: 0.32 });
    reg(hits, pftScreen, "paint-filter");

    // Hold tag on the drained cell.
    const tagPost = group(g, 0.35, 0, -0.9);
    cyl(tagPost, 0.02, 0.02, 0.8, 0, 0.4, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const holdTag = decal(tagPost, 0.24, 0.16, 0, 0.72, 0.03, paperFace("CELL 2", ["drained —", "profile —"], { bg: "#f4e9d8", band: "#6b7178" }), { px: 160 });
    holoTag(tagPost, "hold tag", 0, 0.95, 0, { css: "#b98a4e", w: 0.22 });
    reg(hits, holdTag, "hold-tag");

    // ------------------------------------------- boards, radio, the crew
    const plan = decal(g, 0.6, 0.44, -0.9, 1.25, 1.55, paperFace("WORK PLAN — PAD CELL 2", ["Decant: sump › bag › carbon › outfall", "Conditions: per the discharge order", "Samples: per the schedule, under custody", "Spoils: held for profile, per the plan", "Bypass: locked shut"], { bg: "#efe6cc", band: "#b98a4e" }), { px: 320 });
    plan.rotation.y = 0.35;
    cyl(g, 0.03, 0.035, 1.0, -0.9, 0.5, 1.53, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, plan, "work-plan-board");
    const logBoard = decal(g, 0.5, 0.36, 2.5, 1.2, 0.2, paperFace("PAD LOG", ["Load: —", "Freeboard: —", "Sample: —", "Remarks: —"], { bg: "#efe6cc", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.6;
    cyl(g, 0.03, 0.035, 1.0, 2.5, 0.5, 0.18, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "pad-log");
    const radioPost = group(g, 0.9, 0, 1.6);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#b98a4e", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    const tender = standingFigure(g, 1.2, -1.2, { ry: -0.6, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee, gloves: true });
    holoTag(tender, "pump tender", 0, 1.95, 0, { css: "#b98a4e", w: 0.26 });

    const waterTex = water.material.map;
    let swing = 0;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 0.7, -2.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "liner-walk") { tear.visible = false; bermLow.material = mat(0x6b5a44, { rough: 0.95 }); }
        if (step.id === "seat-bag") { bag.visible = false; bagInHousing.visible = true; lid.position.y = 0.86; }
        if (step.id === "rehandle-call") spoils.scale.y = 1.35;
        if (step.id === "decant-sample") bottle.material = mat(0xb9a67a, { rough: 0.3 });
        if (step.id === "custody") seal.material = mat(0xd2312b, { rough: 0.5 });
        if (step.id === "free-liquid") repaint(pftScreen, signFace("NO FREE LIQUID", { bg: "#0d1c24", accent: "#59c97b", fg: "#f2e6c8", scale: 0.4 }));
        if (step.id === "hold-tag") repaint(holdTag, paperFace("HOLD", ["drained · sampled", "awaiting profile"], { bg: "#f4e9d8", band: "#d2312b" }));
        if (step.id === "close-out") { screen.material = mat(0x6b7178, { rough: 0.6, metal: 0.4 }); chafe.visible = false; chafeGuard.visible = true; }
        if (step.id === "pad-log") repaint(logBoard, paperFace("PAD LOG", ["Load: rehandled · apron down", "Freeboard: in mark · bag new", "Sample: sealed · relinquished", "Trip: diverted · bag changed"], { bg: "#efe6cc", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "spoils-in-the-gap") plume.visible = true;
        if (it.id === "effluent-turbidity-trip") {
          meterLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0 });
          repaint(meterScreen, signFace("OVER SETPOINT", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffdada", scale: 0.42 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "spoils-in-the-gap") { apron.rotation.x = 0; plume.scale.set(0.5, 1, 0.5); }
        if (it.id === "effluent-turbidity-trip") {
          divertHandle.rotation.y = Math.PI / 2;
          meterLamp.material = mat(0xf2ae14, { emissive: 0xf2ae14, ei: 1.2 });
          repaint(meterScreen, signFace("DIVERTED TO PAD", { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.4 }));
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = -t * 0.002; }
        if (session?.turn && step?.id === "line-up") dv.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "rehandle-call") {
          swing += dt * (0.4 + (session.track?.v ?? 0) * 0.8);
          house.rotation.y = -0.45 - (Math.sin(swing) * 0.5 + 0.5) * 0.6;
          if (bucket) bucket.rotation.x = Math.sin(swing * 2) * 0.2;
          paddle.rotation.z = -(session.track?.v ?? 0) * 1.2;
        }
        if (boom) boom.rotation.x = step?.id === "rehandle-call" ? -0.12 : 0;
        sumpWater.position.y = 0.1 + Math.sin(t * 0.8) * 0.005;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "free-liquid") repaint(pftScreen, signFace(gg.t < 0.42 ? "LIQUID THROUGH" : gg.t <= 0.6 ? "NO FREE LIQUID" : "STILL DRIPPING", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#f2e6c8", scale: 0.4 }));
      },
    };
  },
};
