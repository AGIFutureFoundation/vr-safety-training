import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, hose, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, pipeRun, cylinderTank, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pump and Treat VR — Water & Environmental, station seventy-nine.
// Operations and maintenance on a groundwater pump-and-treat system: this is
// the trade procedure a UA/LIUNA/IUOE crew runs on ANY groundwater cleanup
// under a Record of Decision, sited generically rather than at any named
// facility. See hunters-point.js for why a real Superfund site gets a flat
// briefing instead of a walkable scene — this station teaches the O&M work
// the union trades actually perform on a system like the one that record
// describes, without dramatising or inventing facts about that case.
//
// The shape of the job is the shape of every water-treatment vessel change:
// prove the well is doing what the design says, prove the air side is
// stripping and capturing what it should, then take the loaded vessel out of
// service the only safe way — isolated, bled to atmospheric, opened, and its
// carbon drummed as the hazardous waste it is — before the lead/lag order is
// swapped so the fresh vessel is the insurance policy, not the front line.
// The permit sample at the end is what proves the whole system still works.

const PAT_ACCENT = 0x2fc9d6;

export const SIM_PUMP_AND_TREAT = {
  id: "pump-and-treat",
  index: "79",
  domain: "Water",
  trade: "Pipefitter / groundwater pump-and-treat plant operator",
  category: "Water & Environmental",
  weather: "overcast",
  certification: "UA Local 38 plumbers and pipefitters on the piping and vessel work; LIUNA hazmat laborers under OSHA HAZWOPER (29 CFR 1910.120); IUOE stationary engineers on the treatment plant; NPDES discharge permit under the Clean Water Act; EPA RCRA hazardous-waste generator standards (40 CFR 262) for spent carbon; the site O&M manual under its Record of Decision",
  name: "Pump and Treat",
  title: simTitle("Pump and Treat"),
  tagline: "Groundwater treatment O&M: well flow and drawdown against design, blower and off-gas carbon checked, a GAC vessel isolated, bled and changed out, lead/lag swapped, and a compliance sample sealed under chain of custody",
  accent: PAT_ACCENT,
  accentCss: "#2fc9d6",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "carbon-clean", name: "Carbon Clean", note: "A GAC vessel isolated, bled to zero, drummed as hazardous waste and lead/lag swapped, with the compliance sample sealed under chain of custody" },

  game: system({
    name: "Treatment Authority",
    currency: "GPM",
    ranks: ["Operator I", "Operator II", "Lead Operator", "Plant Supervisor", "Treatment Authority Certified"],
    badges: [
      { id: "design-flow", name: "Design Flow", note: "Well flow and drawdown both read against design before anything else moved", test: AWARD.all(AWARD.stepClean("well-flow"), AWARD.stepClean("drawdown")) },
      { id: "never-under-pressure", name: "Never Under Pressure", note: "The vessel was never opened, entered or dumped except the safe way", test: AWARD.safe },
      { id: "reading-true", name: "Reading True", note: "Held the vent rate and the field readings near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-changeout", name: "Clean Changeout", note: "No corrections through the whole vessel change", test: AWARD.clean },
      { id: "steady-bleed", name: "Steady Bleed", note: "Held the bleed-down in band without a dropout", test: AWARD.unbroken },
      { id: "compound-clear", name: "Compound Clear", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "step-into-vessel": "You started to climb into the GAC vessel. A carbon vessel is a permit-required confined space: the atmosphere inside can be oxygen-deficient from the carbon bed itself, and nobody enters it under LIUNA's HAZWOPER program without a permit, an attendant and retrieval — which is not this job. The vessel is worked from outside, through the manway, every time.",
    "skip-depressurize": "You went for the manway before the vessel had bled down to zero. A GAC vessel this size holds real stored energy at operating pressure, and a cover cracked open under load does not open politely — it comes off the way a dislodged clamp on a pressure line always does, with the gasket and whatever is loose on top of it going first. It is proven at zero on the gauge before a wrench ever touches the manway bolts.",
    "carbon-in-dumpster": "You put the spent carbon in the ordinary dumpster. Carbon pulled off a groundwater system is loaded with whatever it stripped out of the plume, and EPA's RCRA hazardous-waste rules (40 CFR 262) require it characterized and manifested to a permitted facility, not hauled off with the site's regular trash. A generator that mishandles its own waste stream is the next enforcement action on a site that already has one open.",
    "grab-no-coc": "You filled the sample straight into an unlabeled jar and skipped the chain of custody. An NPDES compliance sample with no label, no time and no signed custody form is not evidence of anything the permit can accept — the lab has nothing to tie the number back to this outfall on this day, and an unsupported reading is worse than no reading at all when a regulator asks for the record.",
  },

  lateNotes: {
    "bleed-valve": "The bleed valve opens after the lead vessel is isolated on both ends, not before — cracking it on a vessel still tied into the header just moves flow through the wrong path.",
    "spent-carbon": "The carbon comes out once the vessel has bled to zero and the manway is open, not while it is still sealed and holding pressure.",
    "flow-selector": "The lead/lag swap happens after the exhausted vessel is out and the fresh one is ready, not before — swapping the flow path first sends full flow through an empty shell.",
    "compliance-port": "The compliance grab is the last field task, once the vessel work and the permit log are square — a sample taken mid-changeout has nothing settled to say about.",
  },

  // Both interruptions arrive on a step long enough to be caught mid-task and
  // are answered somewhere other than the control that step is already using.
  interrupts: [
    {
      id: "eq-tank-alarm",
      kind: "Equalization tank high level",
      after: "confirm-zero", delay: 5, seconds: 16,
      alert: "The high-level alarm on the equalization tank has started sounding across the compound. Nobody else is on shift to answer it.",
      cue: "Something upstream of the vessel you are bleeding down needs attention now, not when this is finished.",
      target: "eq-transfer-pump-start",
      why: "The equalization tank is what buffers the raw extraction flow ahead of treatment, and it does not stop filling because a GAC vessel is out of service for its changeout — the wells you already confirmed on design flow are still pumping into it. A high level with nothing moving it back down is minutes from overflowing into secondary containment, which is a reportable release on a site that is already under a discharge permit. The standby transfer pump is what pulls the level back down, and starting it is the whole job right now.",
      missNote: "The equalization tank came up over its high-level set point with the transfer pump never started. On a site under active regulatory oversight, an uncontrolled overflow from a process tank is exactly the kind of event that turns a routine vessel change into an incident report.",
      wrongNote: "That does not touch the tank that is alarming. It is the standby transfer pump — that is what pulls the level back down before it reaches the rim.",
    },
    {
      id: "voc-breakthrough",
      kind: "Off-gas VOC monitor high",
      after: "sample", delay: 4, seconds: 14,
      alert: "The off-gas VOC monitor on the stripper stack has climbed above its action level and is still climbing.",
      cue: "The air side is telling you something the water sample in your hand cannot.",
      target: "offgas-backup-valve",
      why: "The primary off-gas carbon is what keeps the VOCs the air stripper pulls out of the groundwater from going straight up the stack into the neighborhood's air — that is the whole reason the stripper has a carbon train instead of an open vent. A rising reading past the action level means that bed is breaking through while it is still carrying load, and the fix is to bring the backup off-gas canister on line immediately, not to finish the water sample first and look at it afterward.",
      missNote: "The off-gas monitor stayed above its action level with the backup canister never opened. Uncontrolled VOC emissions off an air stripper are an air-permit exceedance in their own right, on top of whatever they were pulled out of the water to prevent in the first place.",
      wrongNote: "That is not the off-gas train. The backup canister valve is what takes the load off a breaking-through bed before it reaches the stack.",
    },
  ],

  steps: [
    {
      id: "log", kind: "select", target: "om-log",
      title: "Read the O&M log and today's work order",
      cue: "Check which extraction wells are running, the GAC vessel changeout schedule and which vessel is due, and the compliance sample due today.",
      why: "The O&M manual under the site's Record of Decision is what says which vessel is lead, what the design flow and drawdown for each well should read, and when the compliance sample is due — none of that is a judgment call made fresh each shift, it is a schedule someone already set from the system's design.",
    },
    {
      id: "well-flow", kind: "gauge", target: "flow-meter",
      title: "Read extraction well EW-4's flow against design",
      cue: "Watch the flow meter sweep and commit while it sits inside the design band.",
      why: "The whole plume-capture strategy is built around a design pumping rate for this well. Too little flow and the capture zone shrinks, letting contaminated groundwater slip past the well on its way somewhere the design never accounted for; too much and the well can pull air and lose its prime.",
      gauge: { label: "EW-4 FLOW", speed: 0.7, green: [0.4, 0.58], readout: (t) => `${(6 + t * 10).toFixed(1)} gpm`, missNote: "Outside the design band. Check the pump and re-read before touching anything downstream of this well." },
    },
    {
      id: "drawdown", kind: "gauge", target: "level-transducer",
      title: "Read the well's drawdown against design",
      cue: "Watch the water-level transducer and commit while the drawdown sits inside the design cone of depression.",
      why: "Drawdown is the other half of the capture-zone picture: a design pumping rate only creates the intended cone of depression if the water level is actually falling the amount the design assumed. Too little drawdown and the capture zone the flow number implies is not really there; too much and the well is close to pumping itself dry, which trips the pump on low level at the worst possible time.",
      gauge: { label: "DRAWDOWN", speed: 0.65, green: [0.42, 0.6], readout: (t) => `${(2 + t * 9).toFixed(1)} ft`, missNote: "Not inside the design cone of depression. Let it stabilize and read it again before signing off on this well." },
    },
    {
      id: "blower-check", kind: "find", noHint: true,
      targets: ["blower-belt", "carbon-diff"],
      itemNames: { "blower-belt": "the blower drive belt", "carbon-diff": "the off-gas carbon differential gauge" },
      itemNotes: {
        "blower-belt": "The blower belt is glazed and slipping. A slipping belt means less air moving through the packed tower, which means less contact time between the air and the water film — the stripper does the job less well every minute it runs like this.",
        "carbon-diff": "The differential pressure across the primary off-gas carbon bed is climbing toward its own action level. Rising differential on a carbon bed is the bed loading up with moisture and fouling, which is exactly what pushes a bed toward the breakthrough the stack monitor catches later in this shift.",
      },
      title: "Inspect the air stripper blower and the off-gas carbon",
      cue: "Walk the air side of the system and click whatever needs attention before the vessel work starts.",
      why: "The stripper only works if air is actually moving through it and the vapor it pulls out is actually being captured afterward — a blower running quiet and a carbon bed nobody looked at are both silent until the stack monitor catches the failure downstream, by which point it has already been happening for a while.",
    },
    {
      id: "isolate-lead", kind: "sequence",
      targets: ["lead-inlet", "lead-outlet"],
      itemNames: { "lead-inlet": "lead vessel inlet valve", "lead-outlet": "lead vessel outlet valve" },
      title: "Isolate the lead GAC vessel",
      cue: "Close the lead vessel's inlet valve, then its outlet valve.",
      why: "Inlet first, then outlet — closing the outlet before the inlet traps the vessel full and pressurized against a closed inlet with nowhere for that pressure to go, while closing the inlet first lets the vessel bleed toward the still-open outlet as flow settles before that side shuts too.",
      outOfOrderNote: "Inlet before outlet. Closing the outlet first leaves the vessel pressurized against a shut inlet with no path to relieve.",
    },
    {
      id: "vent-vessel", kind: "turn", target: "bleed-valve",
      title: "Crack the vessel's bleed valve",
      cue: "Wind the needle bleed valve at the top of the isolated vessel open to start relieving trapped pressure.",
      why: "The vessel is isolated but still full of water at line pressure. The bleed valve is the only path that pressure has back to atmosphere, and it is a needle valve on purpose — a full-bore valve on a pressurized vessel this size would let go all at once rather than as a controlled bleed.",
      turn: { turns: 0.6, axis: "y", label: "BLEED VALVE" },
    },
    {
      id: "confirm-zero", kind: "track", target: "bleed-valve", seconds: 7,
      title: "Bleed the vessel down to zero",
      cue: "Hold the vent rate steady in the band until the pressure gauge reads zero.",
      why: "Too fast and the venting water carries carbon fines up through the bleed line and out the vent, fouling it and wasting media that is not cheap; too slow and the shift runs long with a vessel still holding pressure the whole time. Steady, in the band, until the needle is actually at zero — not close to it.",
      track: {
        start: 0.15, green: [0.32, 0.55], rise: 0.5, fall: 0.42, drift: 0.13, label: "VENT RATE",
        readout: (v) => (v < 0.32 ? "barely moving — pressure still trapped" : v > 0.55 ? "venting too hard — carrying fines" : "venting steadily"),
      },
      holdBreakNote: "Vent rate ran out of band — either the bleed stalled with pressure still in the shell, or it ran hard enough to carry carbon fines up the line. Bring it back into the band and hold it there.",
    },
    {
      id: "open-manway", kind: "select", target: "vessel-manway",
      title: "Open the vessel manway",
      cue: "With the vessel isolated and proven at zero, unbolt and swing the manway cover.",
      why: "This is the moment the vessel actually opens to atmosphere. It happens only after two separate confirmations say it is safe to — the isolation valves are shut and the gauge is at zero — because a manway is the last thing standing between a fitter's hands and whatever pressure the earlier steps did not actually remove.",
    },
    {
      id: "drum-carbon", kind: "drag", target: "spent-carbon",
      title: "Drum the spent carbon as hazardous waste",
      cue: "Carry the spent carbon from the open vessel to the labeled hazardous-waste drum and set it down square.",
      why: "Under EPA's RCRA rules (40 CFR 262), carbon that has stripped VOCs out of contaminated groundwater is a hazardous waste from the moment it comes out of the vessel, not from whenever somebody gets around to labeling the drum. It goes straight into the manifested drum, weighed and dated, with nowhere in between for it to sit unlabeled.",
      drag: { to: "waste-drum-socket", radius: 0.45, missNote: "Not on the drum — set the carbon down square in the labeled hazardous-waste drum, not beside it." },
    },
    {
      id: "swap-lead-lag", kind: "turn", target: "flow-selector",
      title: "Swap the lead/lag order",
      cue: "Turn the flow-selector so the old lag vessel becomes the new lead and the fresh vessel takes the lag position.",
      why: "GAC breaks through from the front: the lead vessel sees raw water first and exhausts first, while the lag vessel behind it is the insurance that catches whatever slips past. Putting the fresh media in the lag position — not the lead — means the system always has a proven, still-fresh bed as backup while the vessel actually doing the work is the one already carrying some load.",
      turn: { turns: 0.5, axis: "y", label: "FLOW SELECTOR" },
    },
    {
      id: "sample", kind: "hold", target: "compliance-port", seconds: 6,
      title: "Take the effluent grab at the compliance port",
      cue: "Hold the sample container steady under the compliance tap until it fills.",
      why: "This sample is what proves the system as a whole — well, stripper, carbon train, vessel change and all — is still meeting the discharge permit today, not on the day it was designed. It is taken at the compliance port the permit names, not at a convenient tap somewhere else in the process.",
      holdBreakNote: "The container came away before it filled — a partial grab is not a representative sample. Empty it and hold the full duration again.",
    },
    {
      id: "coc-log", kind: "sequence",
      targets: ["label-sample", "seal-sample", "sign-coc"],
      itemNames: { "label-sample": "label with site, date and time", "seal-sample": "custody seal", "sign-coc": "chain of custody signed" },
      title: "Label, seal and sign the sample's custody",
      cue: "Label the bottle, seal it, then sign the chain of custody.",
      why: "Custody is what turns a bottle of water into a legal record the permit can rely on. Every hand that touches it after this signs for it, and a sample that was never sealed and signed cannot answer for itself later if the number on it is ever questioned.",
      outOfOrderNote: "Label, then seal, then sign — the chain of custody form describes a bottle that is already labeled and sealed.",
    },
    {
      id: "permit-log", kind: "select", target: "monitoring-log-board",
      title: "Complete the discharge permit's monitoring log",
      cue: "Enter today's well flow, drawdown and effluent sample into the NPDES monitoring log.",
      why: "The monitoring log is the record a regulator actually reads. A vessel changed out perfectly and a sample taken cleanly are both worth nothing to the permit if the numbers never make it into the log that gets reported.",
    },
    {
      id: "walk-compound", kind: "find", noHint: true,
      targets: ["containment-crack", "waste-manifest-missing", "open-carbon-lid"],
      itemNames: { "containment-crack": "a crack in the secondary containment", "waste-manifest-missing": "the drum's manifest paperwork, unfilled", "open-carbon-lid": "the fresh-carbon supply bin left uncovered" },
      itemNotes: {
        "containment-crack": "There is a crack in the secondary containment berm around the vessel skid. Secondary containment is what keeps a leak from a vessel or a line a contained spill instead of a release to the ground — a cracked berm is not doing that job.",
        "waste-manifest-missing": "The hazardous-waste manifest for the drum you just filled has not been started. A generator's paper trail on regulated waste is not optional recordkeeping; without it, the drum has left the vessel skid but has no documented chain to the disposal facility it is supposed to be going to.",
        "open-carbon-lid": "The fresh-carbon supply bin was left uncovered. Rained-on or contaminated fresh carbon is media that will underperform the day it goes into a vessel — it belongs sealed until it is loaded.",
      },
      title: "Walk the compound before you sign off",
      cue: "Look over the containment, the waste area and the fresh-media supply, and click anything that needs fixing before you leave.",
      why: "The vessel change is the interesting part of the shift and these three are the part that gets missed: containment that has to hold if something ever lets go, paperwork that has to exist before a regulator ever asks for it, and supply that has to still be usable the next time this vessel needs fresh media.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PAT_ACCENT);

    // ---------------------------------------------------------------- compound pad
    box(g, 6.6, 0.1, 5.6, 0, 0.05, -0.2, 0x5c6660, { rough: 0.92, finish: "concrete", tile: [6, 5] });
    const containmentBerm = [];
    for (const [x, z, w, d] of [[0.9, -1.2, 2.6, 0.12], [0.9, 0.5, 2.6, 0.12], [-0.4, -0.35, 0.12, 1.85], [2.2, -0.35, 0.12, 1.85]]) {
      containmentBerm.push(box(g, w, 0.18, d, x, 0.19, z, 0xc9b23a, { rough: 0.7, metal: 0.2 }));
    }
    const bermCrack = box(g, 0.32, 0.18, 0.05, 0.9, 0.19, -1.2, 0x2a2e28, { rough: 0.95, cast: false });
    reg(hits, bermCrack, "containment-crack");

    // ---------------------------------------------------------------- extraction well
    const well = group(g, -2.35, 0, -1.5);
    cyl(well, 0.13, 0.13, 0.5, 0, 0.25, 0, 0x6f7a83, { rough: 0.55, metal: 0.5, seg: 16 });
    cyl(well, 0.09, 0.09, 0.2, 0, 0.6, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 14 });
    holoTag(well, "EW-4 wellhead", 0, 0.82, 0, { css: "#2fc9d6", w: 0.4 });
    const flowMeter = instrument(well, 0.16, 0.5, 0.05, { ry: 0.5, idle: "-- gpm", color: 0x2fc9d6, w: 0.14, d: 0.2 });
    holoTag(well, "flow meter", 0.16, 0.68, 0.05, { css: "#2fc9d6", w: 0.24 });
    reg(hits, flowMeter, "flow-meter");
    const levelTransducer = instrument(well, -0.16, 0.5, 0.05, { ry: -0.5, idle: "-- ft", color: 0x2fc9d6, w: 0.14, d: 0.2 });
    holoTag(well, "level transducer", -0.16, 0.68, 0.05, { css: "#2fc9d6", w: 0.32 });
    reg(hits, levelTransducer, "level-transducer");

    // ---------------------------------------------------------------- air stripper + blower
    const stripper = group(g, -1.15, 0, -1.85);
    cyl(stripper, 0.34, 0.34, 1.9, 0, 0.95, 0, 0xb9c2c8, { rough: 0.5, metal: 0.4, seg: 22, finish: "galvanised" });
    for (let i = 0; i < 4; i++) box(stripper, 0.38, 0.03, 0.38, 0, 0.3 + i * 0.42, 0, 0x8a949d, { rough: 0.55, metal: 0.4 });
    cyl(stripper, 0.38, 0.38, 0.16, 0, 1.95, 0, 0x8a949d, { rough: 0.5, metal: 0.5, seg: 22 });
    holoTag(stripper, "air stripper tower", 0, 2.15, 0, { css: "#2fc9d6", w: 0.44 });
    const stack = cyl(stripper, 0.07, 0.07, 0.6, 0, 2.3, 0, 0x6b7580, { rough: 0.5, metal: 0.5, seg: 12 });
    const stackVent = particles(stripper, 26, 0xdfe9ec, { size: 0.03, life: 0.9, additive: false, opacity: 0.35 });
    void stack;

    const blower = group(g, -1.65, 0, -1.25, 0.5);
    box(blower, 0.34, 0.3, 0.3, 0, 0.18, 0, 0xe4622a, { rough: 0.6, metal: 0.3 });
    const blowerHub = cyl(blower, 0.12, 0.12, 0.1, 0, 0.18, 0.2, 0x2b2f34, { rough: 0.5, metal: 0.6, seg: 16 });
    blowerHub.rotation.x = Math.PI / 2;
    holoTag(blower, "stripper blower", 0, 0.42, 0, { css: "#2fc9d6", w: 0.32 });
    const beltHit = torus(blower, 0.13, 0.012, 0, 0.18, 0.22, 0xd8b23a, { rough: 0.6, seg: 8, seg2: 18 });
    beltHit.rotation.x = Math.PI / 2;
    reg(hits, beltHit, "blower-belt");
    pipeRun(g, [[-1.65, 0.28, -1.35], [-1.4, 0.5, -1.6], [-1.15, 0.7, -1.85]], 0.045, 0x8a949d, { flanges: [[-1.4, 0.5, -1.6]] });

    // ---------------------------------------------------------------- off-gas carbon train
    const offgas = group(g, -0.15, 0, -2.05);
    for (const [dx, id, label] of [[-0.28, "og-primary", "primary off-gas carbon"], [0.28, "og-backup", "backup off-gas carbon"]]) {
      cylinderTank(offgas, dx, 0, 0xb9c2c8, { plate: false, gauge: false });
      holoTag(offgas, label, dx, 1.25, 0, { css: "#2fc9d6", w: 0.4 });
    }
    const backupValveWheel = valveWheel(offgas, 0.28, 0.75, 0.14, { color: 0xe4622a, body: 0x2f3740, r: 0.09 });
    holoTag(offgas, "backup canister valve", 0.28, 1.0, 0.14, { css: "#f2c14b", w: 0.5 });
    reg(hits, backupValveWheel.userData.wheel, "offgas-backup-valve");
    const carbonDiff = instrument(offgas, -0.28, 1.05, 0.1, { idle: "-- inWC", color: 0x2fc9d6, w: 0.13, d: 0.18 });
    holoTag(offgas, "differential gauge", -0.28, 1.24, 0.1, { css: "#2fc9d6", w: 0.4 });
    reg(hits, carbonDiff, "carbon-diff");
    // VOC beacon on the stack, dark until the off-gas monitor trips.
    const vocAlarm = ball(offgas, 0.05, -0.28, 1.32, 0.12, 0xd2312b, { emissive: 0xd2312b, ei: 3.0, rough: 0.4 });
    vocAlarm.visible = false;
    pipeRun(g, [[-1.15, 1.9, -1.85], [-0.6, 1.9, -2.0], [-0.15, 1.9, -2.05], [-0.15, 1.1, -2.05]], 0.05, 0x8a949d, { flanges: [[-0.6, 1.9, -2.0]] });

    // ---------------------------------------------------------------- GAC lead/lag vessels
    const vessels = group(g, 1.35, 0, -0.9);
    const lead = group(vessels, -0.55, 0, 0);
    cyl(lead, 0.32, 0.32, 1.4, 0, 0.72, 0, 0x3c7f8c, { rough: 0.5, metal: 0.4, seg: 22 });
    cyl(lead, 0.32, 0.02, 0.22, 0, 1.53, 0, 0x3c7f8c, { rough: 0.5, metal: 0.4, seg: 22 });
    holoTag(lead, "GAC — LEAD", 0, 1.75, 0, { css: "#2fc9d6", w: 0.36 });
    const leadInlet = valveWheel(lead, -0.34, 0.3, 0.24, { color: 0x2f6f4a, body: 0x2f3740, r: 0.08, ry: 0.5 });
    holoTag(lead, "inlet", -0.34, 0.52, 0.24, { css: "#2fc9d6", w: 0.2 });
    reg(hits, leadInlet.userData.wheel, "lead-inlet");
    const leadOutlet = valveWheel(lead, 0.34, 0.3, 0.24, { color: 0xb8402f, body: 0x2f3740, r: 0.08, ry: -0.5 });
    holoTag(lead, "outlet", 0.34, 0.52, 0.24, { css: "#2fc9d6", w: 0.22 });
    reg(hits, leadOutlet.userData.wheel, "lead-outlet");
    const bleedStack = group(lead, 0.1, 1.42, 0.18);
    cyl(bleedStack, 0.025, 0.025, 0.18, 0, 0, 0, 0x8a949d, { rough: 0.45, metal: 0.65, seg: 10 });
    const bleedHandle = valveWheel(bleedStack, 0, 0.15, 0, { color: 0xf2c14b, body: 0x2f3740, r: 0.06 });
    holoTag(bleedStack, "bleed valve", 0, 0.34, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, bleedHandle.userData.wheel, "bleed-valve");
    const manway = box(lead, 0.26, 0.34, 0.05, 0, 0.85, 0.31, 0x2f3740, { rough: 0.5, metal: 0.5 });
    holoTag(lead, "manway", 0, 1.06, 0.31, { css: "#2fc9d6", w: 0.26 });
    reg(hits, manway, "vessel-manway");
    const carbonPile = cyl(lead, 0.12, 0.14, 0.14, 0, 0.13, 0.3, 0x2b2620, { rough: 0.95, seg: 14 });
    reg(hits, carbonPile, "spent-carbon");
    const noEntry = box(lead, 0.5, 0.9, 0.5, 0, 0.75, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noEntry, "step-into-vessel");
    const earlyOpen = box(lead, 0.3, 0.3, 0.1, 0, 0.85, 0.34, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, earlyOpen, "skip-depressurize");

    const lag = group(vessels, 0.55, 0, 0);
    cyl(lag, 0.32, 0.32, 1.4, 0, 0.72, 0, 0x59a3ac, { rough: 0.5, metal: 0.4, seg: 22 });
    cyl(lag, 0.32, 0.02, 0.22, 0, 1.53, 0, 0x59a3ac, { rough: 0.5, metal: 0.4, seg: 22 });
    holoTag(lag, "GAC — LAG (fresh)", 0, 1.75, 0, { css: "#2fc9d6", w: 0.44 });

    const selector = group(vessels, 0, 0, -0.55, 0.4);
    box(selector, 0.3, 0.28, 0.16, 0, 0.6, 0, 0x2f3740, { rough: 0.55, metal: 0.5 });
    const selectorWheel = valveWheel(selector, 0, 0.32, 0.12, { color: 0xf2c14b, body: 0x2f3740, r: 0.1 });
    holoTag(selector, "flow selector", 0, 0.62, 0.12, { css: "#f2c14b", w: 0.32 });
    reg(hits, selectorWheel.userData.wheel, "flow-selector");
    pipeRun(g, [[0.8, 0.3, -1.45], [1.35, 0.3, -1.45], [1.35, 0.3, -0.9]], 0.05, 0x8a949d, { flanges: [[1.35, 0.3, -1.45]] });
    pipeRun(g, [[1.35, 0.3, -0.9], [1.9, 0.3, -0.9], [1.9, 0.3, 0.5]], 0.05, 0x8a949d, { flanges: [[1.9, 0.3, -0.9]] });

    // ---------------------------------------------------------------- waste drum + decoy dumpster
    const drum = group(g, 2.15, 0, -0.2, 0.3);
    cyl(drum, 0.24, 0.24, 0.62, 0, 0.31, 0, 0xd8b23a, { rough: 0.6, metal: 0.3, seg: 20 });
    cyl(drum, 0.25, 0.25, 0.03, 0, 0.63, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 20 });
    decal(drum, 0.36, 0.16, 0.26, 0.35, 0, signFace("HAZARDOUS WASTE\nSPENT GAC — 40 CFR 262", { bg: "#2a1a0d", accent: "#f2c14b", scale: 0.34 }));
    holoTag(drum, "hazardous-waste drum", 0, 0.78, 0, { css: "#f2c14b", w: 0.46 });
    const drumSocket = group(drum, 0, 0.62, 0);
    hits["waste-drum-socket"] = drumSocket;
    const manifest = decal(drum, 0.2, 0.14, -0.32, 0.4, 0, signFace("MANIFEST\nPENDING", { bg: "#0d1c24", accent: "#f2c14b", scale: 0.32 }));
    reg(hits, manifest, "waste-manifest-missing");

    const dumpster = group(g, 2.7, 0, 0.5, -0.3);
    box(dumpster, 0.7, 0.5, 0.5, 0, 0.28, 0, 0x3a5a7a, { rough: 0.7, metal: 0.3 });
    holoTag(dumpster, "site dumpster", 0, 0.6, 0, { css: "#2fc9d6", w: 0.28 });
    const dumpsterHazard = box(dumpster, 0.6, 0.3, 0.4, 0, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dumpsterHazard, "carbon-in-dumpster");

    // ---------------------------------------------------------------- fresh-carbon supply bin
    const supplyBin = group(g, 0.65, 0, -2.15);
    box(supplyBin, 0.6, 0.5, 0.5, 0, 0.26, 0, 0x4a5560, { rough: 0.6, metal: 0.35 });
    const supplyLid = box(supplyBin, 0.6, 0.04, 0.5, 0, 0.53, 0.35, 0x2b3138, { rough: 0.6, metal: 0.4 });
    supplyLid.rotation.x = -0.6;
    holoTag(supplyBin, "fresh-carbon supply", 0, 0.78, 0, { css: "#2fc9d6", w: 0.4 });
    reg(hits, supplyLid, "open-carbon-lid");

    // ---------------------------------------------------------------- compliance sample port
    const samplePort = group(g, 0.35, 0, 0.95);
    cyl(samplePort, 0.05, 0.05, 0.5, 0, 0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 12 });
    const tapHead = cyl(samplePort, 0.03, 0.03, 0.12, 0, 0.5, 0.08, 0x2f3740, { rough: 0.5, metal: 0.5, seg: 10 });
    tapHead.rotation.x = Math.PI / 2;
    holoTag(samplePort, "compliance port — NPDES", 0, 0.72, 0, { css: "#2fc9d6", w: 0.52 });
    reg(hits, tapHead, "compliance-port");
    const jarBypass = box(samplePort, 0.14, 0.16, 0.14, 0.2, 0.32, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(samplePort, "pour it straight in?", 0.2, 0.5, 0.1, { css: "#d2312b", w: 0.4 });
    reg(hits, jarBypass, "grab-no-coc");

    // ---------------------------------------------------------------- field bench: labels, seals, custody, log
    const bench = group(g, 1.1, 0, 1.35);
    box(bench, 1.1, 0.75, 0.5, 0, 0.375, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const labelDecal = decal(bench, 0.22, 0.14, -0.35, 0.78, 0, signFace("LABEL", { bg: "#0b141d", accent: "#2fc9d6", scale: 0.5 }));
    holoTag(bench, "sample label", -0.35, 0.95, 0, { css: "#2fc9d6", w: 0.28 });
    reg(hits, labelDecal, "label-sample");
    const sealDecal = decal(bench, 0.16, 0.1, -0.05, 0.78, 0.02, signFace("SEAL", { bg: "#0b141d", accent: "#f2c14b", scale: 0.5 }));
    holoTag(bench, "custody seal", -0.05, 0.93, 0.02, { css: "#2fc9d6", w: 0.28 });
    reg(hits, sealDecal, "seal-sample");
    const cocForm = decal(bench, 0.3, 0.16, 0.34, 0.78, 0, signFace("CHAIN OF CUSTODY", { bg: "#0b141d", accent: "#2fc9d6", scale: 0.4 }));
    holoTag(bench, "chain of custody", 0.34, 0.97, 0, { css: "#2fc9d6", w: 0.4 });
    reg(hits, cocForm, "sign-coc");

    const logBoard = group(g, 1.9, 0, 1.6, -0.4);
    const logPanel = holoPanel(logBoard, 0.7, 0.46, 0, 1.1, 0, (ctx, w, h) => {
      ctx.fillStyle = "#082027"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2fc9d6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcf7fa"; ctx.fillText("NPDES MONITORING LOG", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#bfeef2";
      ["EW-4 flow: ____ gpm", "Drawdown: ____ ft", "Effluent sample: ____", "GAC changeout: LEAD → LAG", "Waste manifest: ____"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.13)));
    }, { accent: PAT_ACCENT });
    const logHit = box(logBoard, 0.7, 0.46, 0.04, 0, 1.1, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, logHit, "monitoring-log-board");

    const omLogGroup = group(g, -1.9, 0, 1.7, 0.5);
    holoPanel(omLogGroup, 0.66, 0.44, 0, 1.05, 0, (ctx, w, h) => {
      ctx.fillStyle = "#082027"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2fc9d6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcf7fa"; ctx.fillText("O&M LOG — RECORD OF DECISION", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#bfeef2";
      ["EW-4 design flow: 10-16 gpm", "Lead vessel: change due today", "Lag vessel: fresh media staged", "Compliance sample: due this shift"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: PAT_ACCENT });
    const omLogHit = box(omLogGroup, 0.66, 0.44, 0.04, 0, 1.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, omLogHit, "om-log");

    // ---------------------------------------------------------------- equalization tank + standby transfer pump
    const eqTank = group(g, -2.55, 0, 1.35);
    cyl(eqTank, 0.55, 0.55, 1.3, 0, 0.68, 0, 0x8a949d, { rough: 0.55, metal: 0.4, seg: 24, finish: "galvanised" });
    holoTag(eqTank, "equalization tank", 0, 1.42, 0, { css: "#2fc9d6", w: 0.44 });
    const eqLevelWater = cyl(eqTank, 0.5, 0.5, 0.75, 0, 0.5, 0, 0x3a6a7a, { rough: 0.2, metal: 0.4, opacity: 0.8, transparent: true, seg: 22, cast: false });
    void eqLevelWater;
    const eqAlarm = ball(eqTank, 0.06, 0.4, 1.32, 0.35, 0xd2312b, { emissive: 0xd2312b, ei: 3.0, rough: 0.4 });
    eqAlarm.visible = false;

    const transferPump = group(g, -3.05, 0, 1.75, 0.5);
    box(transferPump, 0.32, 0.28, 0.3, 0, 0.16, 0, 0xe4622a, { rough: 0.6, metal: 0.35 });
    const pumpLamp = ball(transferPump, 0.028, 0.14, 0.34, 0.13, 0x59c97b, { emissive: 0x59c97b, ei: 1.6, rough: 0.4 });
    holoTag(transferPump, "standby transfer pump — START", 0, 0.52, 0, { css: "#f2c14b", w: 0.6 });
    const transferStart = box(transferPump, 0.1, 0.05, 0.03, 0, 0.32, 0.14, 0x59c97b, { rough: 0.5 });
    reg(hits, transferStart, "eq-transfer-pump-start");
    pipeRun(g, [[-2.55, 0.3, 1.35], [-2.85, 0.3, 1.5], [-3.05, 0.3, 1.75]], 0.045, 0x8a949d, {});

    // ---------------------------------------------------------------- site guarding, tools, crew
    barrierPanel(g, -0.4, 2.6, { color: 0xe4622a, w: 1.4 });
    cone(g, 2.9, -1.6, { color: 0xe4622a });
    cone(g, -3.0, -1.1, { color: 0xe4622a });
    toolChest(g, 2.7, 1.5, { ry: -0.5, color: 0x2f6f8c });
    standingFigure(g, 2.55, 2.15, { ry: -2.3, cloth: 0x2b6f8f, helmet: 0xf2c14b, vest: 0xe4dc3a });
    const spareLock = lockTag(g, -1.5, 0.55, -0.7, { color: 0x2fc9d6 });
    spareLock.visible = false;

    let bleedFlow = 0;
    let eqAlarming = false;
    let voxHigh = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 0.85, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "isolate-lead") { leadInlet.userData.wheel.rotation.x = 0.7; leadOutlet.userData.wheel.rotation.x = 0.7; }
        if (step.id === "vent-vessel") { bleedHandle.userData.wheel.rotation.x = 0.6; }
        if (step.id === "confirm-zero") { bleedFlow = 0; }
        if (step.id === "open-manway") { manway.rotation.y = -1.1; }
        if (step.id === "drum-carbon") { carbonPile.visible = false; }
        if (step.id === "swap-lead-lag") { selectorWheel.userData.wheel.rotation.z = 1.2; }
        if (step.id === "permit-log") repaint(logPanel.userData.face, (ctx, w, h) => {
          ctx.fillStyle = "#08201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 6);
          ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillStyle = "#dcf7ea"; ctx.fillText("MONITORING LOG — COMPLETE", w * 0.06, h * 0.2);
          ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#bff7d4";
          ["EW-4 flow: logged", "Drawdown: logged", "Sample: sealed & signed"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.42 + i * 0.16)));
        });
        if (step.id === "walk-compound") { bermCrack.material = bermCrack.material.clone(); bermCrack.material.color.set(0x2f6f4a); }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "eq-tank-alarm") { eqAlarm.visible = true; eqAlarming = true; }
        if (it.id === "voc-breakthrough") { voxHigh = true; vocAlarm.visible = true; repaint(carbonDiff.userData.screen, signFace("HIGH", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffd9d4", scale: 0.6 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "eq-tank-alarm") { eqAlarm.visible = false; eqAlarming = false; }
        if (it.id === "voc-breakthrough") { voxHigh = false; vocAlarm.visible = false; repaint(carbonDiff.userData.screen, signFace("0.4 inWC", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 })); }
      },
      animate(t, dt, session) {
        stackVent.visible = true;
        stackVent.userData.step(dt, new THREE.Vector3(-1.15, 2.9, -1.85), 0.06, 0.5, 0.4);
        if (eqAlarming) eqAlarm.material.emissiveIntensity = 1.8 + Math.sin(t * 9) * 1.4;
        if (voxHigh) vocAlarm.material.emissiveIntensity = 1.8 + Math.sin(t * 11) * 1.4;
        blowerHub.rotation.z = t * 6;
        pumpLamp.material.emissiveIntensity = voxHigh ? 0.6 : 1.6 + Math.sin(t * 2) * 0.4;
        const step = session?.step;
        if (step?.id === "confirm-zero" && session.track) {
          bleedFlow = session.track.v;
          repaint(flowMeter.userData.screen, signFace(`${(bleedFlow * 3).toFixed(2)} bar`, {
            bg: "#0d1c24", accent: bleedFlow > 0.32 && bleedFlow < 0.55 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "well-flow") repaint(flowMeter.userData.screen, signFace(`${(6 + gg.t * 10).toFixed(1)} gpm`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
          if (step?.id === "drawdown") repaint(levelTransducer.userData.screen, signFace(`${(2 + gg.t * 9).toFixed(1)} ft`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
      },
    };
  },
};
