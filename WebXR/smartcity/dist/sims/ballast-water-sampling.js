import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, hose, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, valveWheel,
  pipeRun, reg, surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ballast Water Sampling VR — Maritime & Ports, station ninety-nine.
//
// A port state inspection of a ship's ballast water management on arrival,
// run from the ship's own deck above a generic anchorage — not any one port
// and no claim about any one vessel's history. The inspection is a paper
// check and a physical check run together: the record book and the
// management plan are read against the voyage that was actually sailed, the
// treatment system's own type-approval certificate is checked rather than
// taken on trust, and only then does anyone touch a valve. A sample drawn
// through a line that was not flushed, or handed on without a sealed chain
// of custody, proves nothing at all — it is evidence of the last thing that
// happened to the tank before this one, not of what is in it now. And the
// two things every ballast system asks of a boarding party without saying
// so out loud: the discharge stays held until the number comes back, and a
// void space that vents through a sounding pipe still kills the same way it
// always has, whether or not anybody was planning to climb into it.

const BWS_ACCENT = 0x3c7ea8;

export const SIM_BALLAST_WATER_SAMPLING = {
  id: "ballast-water-sampling",
  index: "99",
  domain: "Maritime & Ports",
  trade: "Ship's engineer / port state control inspector — ballast water compliance",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "Inlandboatmen's Union of the Pacific (IBU) and SIU — ship's side; ILWU marine clerks and AFSCME port state inspectors — the boarding team; IMO International Convention for the Control and Management of Ships' Ballast Water and Sediments (BWM Convention); U.S. Coast Guard ballast water management regulations, 33 CFR Part 151 Subpart D; California State Lands Commission's Marine Invasive Species Program (MISP); OSHA 29 CFR 1915 Subpart B enclosed and confined spaces",
  name: "Ballast Water Sampling",
  title: simTitle("Ballast Water Sampling"),
  tagline: "Port state inspection of a ship's ballast water: record book and management plan against the voyage, the treatment system's certificate checked, the sampling point isolated and flushed, a representative sample under chain of custody, the indicative analysis run, discharge held on the port's order, the officer's signature, and enclosed-space rules observed at the sounding pipe",
  accent: BWS_ACCENT,
  accentCss: "#3c7ea8",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "clean-hold", name: "Clean Hold", note: "A sample drawn to protocol, chain of custody unbroken, and the discharge held until the number came back — first time" },

  game: system({
    name: "Boarding Team",
    currency: "TANK",
    ranks: ["Cadet", "Third Engineer", "Second Engineer", "Chief Engineer", "Port State Certified"],
    badges: [
      { id: "line-clean", name: "Line Clean", note: "Flushed and drew the sample without a single contaminated draw", test: AWARD.stepClean("flush") },
      { id: "hold-kept", name: "Hold Kept", note: "Discharge never moved before the result was in, chain of custody never broken", test: AWARD.safe },
      { id: "count-true", name: "Count True", note: "Indicative analysis and the flush both read inside the working band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-boarding", name: "Clean Boarding", note: "No corrections across the whole inspection", test: AWARD.clean },
      { id: "hold-steady", name: "Hold Held Steady", note: "Discharge rate held at zero the whole wait", test: AWARD.unbroken },
      { id: "cleared-fast", name: "Cleared Fast", note: "Boarding closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-flush": "You reached for the sample bottle before the line was flushed. Whatever sat in that line since the last cast is what shows up under the microscope — a stagnant plug of dead water reads nothing like the tank, and a count run on it is not an indicative analysis of anything, it is a number about the pipe.",
    "break-coc": "You handed the sample off without sealing it and starting the chain of custody. A bottle nobody can account for between the manifold and the lab is a bottle a defensible enforcement action cannot use — under the California State Lands Commission's Marine Invasive Species Program, an unbroken chain is what makes the number mean something in a hearing, not just on a clipboard.",
    "discharge-early": "You let the discharge line open before the indicative result was back. Port state control under 33 CFR Part 151 exists precisely so a ship does not get to discharge ballast on its own schedule while an inspector is mid-sample — the hold stays on until the number clears the standard, not until somebody gets impatient waiting for it.",
    "crack-cap-untested": "You cracked the sounding pipe cap without testing what was coming up through it. A ballast tank vents whatever atmosphere it built while it sat full — oxygen-deficient, sometimes worse — straight into your face the moment that cap comes off, and OSHA 1915 Subpart B treats that boundary as a space to be tested before it is opened, not after somebody already smelled something wrong.",
  },

  lateNotes: {
    "isolation-valve": "The sampling point is isolated before anything is flushed through it — an open system just draws whatever the ship's own pumps happen to be moving at the time.",
    "flush-line": "The line is flushed only after the sampling point is isolated. Flushing an unisolated line just proves the ship's piping works, not that the sample point is clean.",
    "sample-cock": "The sample is drawn only after the flush reads clean. A sample drawn mid-flush is still the old water, just moving faster.",
    "discharge-rate": "The discharge is held only after the sample is away for analysis — there is nothing to hold a result against before that.",
  },

  steps: [
    {
      id: "voyage-record", kind: "select", target: "voyage-record",
      title: "Check the record book and management plan against the voyage",
      cue: "Read the ballast water record book and the ship's management plan against the voyage actually sailed.",
      why: "The BWM Convention requires both documents kept current for a reason: the record book says what was done to which tank and when, the management plan says what the ship is supposed to do, and the voyage sailed is the only thing either one can honestly be checked against. A plan that matches nothing sailed is a plan nobody is actually following.",
    },
    {
      id: "certificate", kind: "select", target: "type-approval-cert",
      title: "Check the treatment system's type-approval certificate",
      cue: "Confirm the treatment system aboard is the one on the certificate, approved to the D-2 discharge standard.",
      why: "A treatment system is only as good as the approval behind it — the certificate says an independent authority tested this exact system against the D-2 standard, not that the crew believes it works. A system running without that paper, or running a different unit than the one certified, has proven nothing about what it is putting overboard.",
    },
    {
      id: "sample-point", kind: "select", target: "pid-panel",
      title: "Identify the sampling point on the ballast piping diagram",
      cue: "Read the P&ID and find the correct sample cock for the tank under inspection — not just any valve on the manifold.",
      why: "Ballast piping runs several tanks through one manifold, and a cock drawn from the wrong branch samples the wrong tank while looking exactly like the right one. The diagram is what says which cock actually represents the tank the record book claims was treated.",
    },
    {
      id: "isolate", kind: "turn", target: "isolation-valve",
      title: "Isolate the sampling point",
      cue: "Close the isolation valve on every branch but the one feeding the sample cock.",
      why: "An isolated sampling point draws only from the tank under inspection; left open to the rest of the manifold, the sample cock draws a mix of whatever else the ship's pumps are moving and the result belongs to no single tank at all.",
      turn: { turns: 1, axis: "y", label: "ISOLATION" },
    },
    {
      id: "flush", kind: "track", target: "flush-line", seconds: 6,
      title: "Flush the sample line",
      cue: "Crack the sample cock and hold the flow at a steady rate until the line reads clean.",
      why: "Water standing in a sample line since the last cast is not the tank — it is whatever settled in a length of pipe. A steady flush for long enough to turn the line over completely is what makes the water finally coming out of the cock the tank's water rather than the pipe's.",
      track: { start: 0.1, green: [0.32, 0.5], rise: 0.55, fall: 0.45, drift: 0.12, label: "FLOW", readout: (v) => (v < 0.32 ? "not turning the line over" : v > 0.5 ? "too fast to read clean" : "flushing") },
      holdBreakNote: "Flow dropped out of band before the line turned over — bring it back to a steady rate and keep flushing.",
    },
    {
      id: "stage-kit", kind: "drag", target: "analysis-kit",
      title: "Carry the indicative analysis kit to the sample point",
      cue: "Bring the deck test kit from the chest to the bench beside the sample cock before the sample is drawn.",
      why: "An indicative analysis kit left in its case does nobody any good the moment a fresh sample is standing in a bottle losing organisms by the minute — it is staged at the bench before the draw, not fetched afterward while the clock the protocol runs on keeps moving.",
      drag: { to: "analysis-bench", radius: 0.5, missNote: "Not on the bench. The kit has to be at the sample point before the draw, not still in the chest." },
    },
    {
      id: "draw-sample", kind: "hold", target: "sample-cock", seconds: 5,
      title: "Draw the representative sample",
      cue: "Hold the bottle under the cock at a steady flow for the full protocol volume.",
      why: "A representative sample is a continuous draw at a steady rate for the volume the protocol specifies, not a splash grabbed and capped early. Cut short, the bottle holds a fraction of what the protocol needs and every count taken from it is a guess scaled up from too little water.",
      holdBreakNote: "Let go before the full volume was drawn — that bottle is short. Reset it and draw the whole volume in one continuous pour.",
    },
    {
      id: "label-coc", kind: "sequence",
      targets: ["bottle-label", "bottle-seal", "coc-sign"],
      itemNames: { "bottle-label": "bottle labelled", "bottle-seal": "bottle sealed", "coc-sign": "chain of custody signed" },
      title: "Label, seal and start the chain of custody",
      cue: "Label the bottle, seal it, then sign the chain-of-custody form — in that order.",
      why: "A bottle sealed before it is labelled is a sealed bottle nobody can identify later, and a chain of custody signed before the seal is a signature for a bottle that was still open when it was written. Labelled, then sealed, then signed is the only order that leaves a bottle nobody can argue was tampered with.",
      outOfOrderNote: "Label, then seal, then sign — a seal on an unlabelled bottle and a signature on an unsealed one both break the chain the same way.",
    },
    {
      id: "analysis", kind: "gauge", target: "analysis-meter",
      title: "Run the indicative analysis",
      cue: "Read the organisms-per-cubic-metre count on the deck kit and commit it against the D-2 discharge standard.",
      why: "The indicative analysis is what tells the inspector, on the deck, in minutes, whether the treatment system did what its certificate says it does — an organism count that reads inside the D-2 standard clears the discharge; one that does not is the reason the hold stays on until a shore laboratory confirms it.",
      gauge: { label: "ORGANISMS / m³", speed: 0.7, green: [0.15, 0.35], readout: (t) => `${Math.round(t * 200)} / m³`, missNote: "That count is outside the D-2 standard's working range for an indicative pass — the discharge stays held and this result goes to a shore laboratory for confirmation." },
    },
    {
      id: "hold-discharge", kind: "track", target: "discharge-rate", seconds: 6,
      title: "Hold the discharge at zero while the result stands",
      cue: "Keep the overboard discharge valve shut against the manifold's own back-pressure until the port's hold is lifted.",
      why: "Port state control's authority under 33 CFR Part 151 to hold a ship's ballast discharge only means something if the hold actually holds — a valve that is shut once and left to creep back open under pressure while everyone's attention is on the paperwork has not been held at all.",
      track: { start: 0.05, green: [0.0, 0.18], rise: 0.5, fall: 0.5, drift: 0.14, label: "DISCHARGE RATE", readout: (v) => (v > 0.18 ? "creeping open — hold it" : "held at zero") },
      holdBreakNote: "The discharge crept open past zero — bring it back down and hold it there until the result stands.",
    },
    {
      id: "enclosed-space", kind: "sequence", anyOrder: true,
      targets: ["gas-test", "permit-post", "attendant-post"],
      itemNames: { "gas-test": "atmosphere tested at the sounding pipe", "permit-post": "enclosed-space permit posted", "attendant-post": "attendant posted at the hatch" },
      title: "Observe enclosed-space rules at the sounding pipe",
      cue: "Test the atmosphere venting from the sounding pipe, post the enclosed-space permit, and post an attendant at the hatch — all three before the cap comes off.",
      why: "A ballast tank is an enclosed space under OSHA 1915 Subpart B whether or not anyone plans to climb into it, and a sounding pipe is the one place its atmosphere reaches the deck on its own. Testing what vents from it, posting the permit, and posting an attendant are the three things that turn a tank nobody has thought about into a space somebody is actually watching.",
    },
    {
      id: "sign-record", kind: "select", target: "sampling-record",
      title: "Get the ship's officer's signature on the sampling record",
      cue: "Present the completed sampling record to the ship's officer for signature.",
      why: "The officer's signature is the ship's own acknowledgement of what was sampled, how, and with what result — without it, the record is the boarding team's account alone, and a result the ship never signed for is a result the ship can later say it never saw.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cap-cracked", "spare-bottle-untagged"],
      itemNames: { "cap-cracked": "the sounding pipe cap left cracked open", "spare-bottle-untagged": "the untagged spare sample bottle" },
      itemNotes: {
        "cap-cracked": "The sounding pipe cap was never fully seated back down after the gas test. Left cracked, the tank vents onto the deck for as long as it takes somebody to notice — right where the crew still walks past it.",
        "spare-bottle-untagged": "A spare sample bottle from the kit is sitting in the open with no tag on it. An unlabelled bottle from a ballast inspection looks exactly like a labelled one to anyone who was not there when it was filled — or exactly like an empty one that never needs explaining.",
      },
      title: "Walk the deck before signing off the boarding",
      cue: "Check the sounding pipe, the sample bench and the manifold once more, and click anything left the way it should not be.",
      why: "The boarding closes out the moment the inspector steps back down the gangway, and everything left wrong on this deck after that is the ship's problem to notice on its own. This is the last look anybody from the boarding team gets at it.",
    },
  ],

  interrupts: [
    {
      id: "valve-passing",
      kind: "Isolation valve passing under flush",
      after: "flush", delay: 3, seconds: 12,
      alert: "The isolation valve is weeping past its seat — a thin bead of water from the wrong side of the manifold is finding its way into the line you are flushing.",
      cue: "That valve is not holding. Reseat it before another drop of the flush goes through it.",
      target: "isolation-valve",
      why: "A sample line is only as isolated as its weakest valve, and a seat passing even a little bit means the water reaching the cock is no longer only the tank under inspection — it is contaminated with whatever the rest of the manifold is carrying. Reseating it now means the flush and the draw that follows are still worth something; ignoring it means starting the whole cast over once somebody finally notices.",
      missNote: "The valve kept weeping through the rest of the flush and the sample drawn after it. Every count run on that bottle now includes water from a branch of the manifold the inspection was never supposed to touch, and there is no way to subtract it back out once the bottle is sealed.",
      wrongNote: "It's the isolation valve. Nothing else on this manifold puts the sample point back on its own again.",
    },
    {
      id: "tank-entry",
      kind: "Crew heading for the tank hatch without a permit",
      after: "hold-discharge", delay: 3, seconds: 12,
      alert: "A crew member has the hatch dogs half off the ballast tank manhole aft of the sounding pipe — no permit posted, no attendant, no gas test run on that opening at all.",
      cue: "Stop them at the hatch before that cover comes the rest of the way off.",
      target: "tank-hatch",
      why: "The manhole is a full entry into the same enclosed space the sounding pipe only vents from, and OSHA 1915 Subpart B does not care that the crew member only meant to look — an unpermitted opening into a space that has not been tested is exactly the exposure the permit system exists to catch before it happens, not after.",
      missNote: "The cover came off before anyone reached the hatch, and the crew member leaned in over an opening nobody had tested or permitted. Whatever that tank's atmosphere had built up while it sat sealed went straight past them with no attendant there to see it happen.",
      wrongNote: "It's the tank hatch aft of the sounding pipe. That is the opening about to come off unpermitted — nothing else on this deck stops it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BWS_ACCENT);

    // ---------------------------------------------------------------- deck
    // The ship's own steel deck, raised above the shared plaza disc the way
    // pilot-transfer.js builds its outboard arrangement, with the rail and
    // the sea beyond it at -x rather than sunk into the plaza.
    const dk = group(g, 0, 0.18, 0);
    const deckTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#233038", base2: "#1b262d" }), { repeat: 9, px: 256 });
    const deckMesh = box(dk, 5.6, 0.18, 5.4, 0.4, -0.09, 0, 0xffffff, { rough: 0.7, metal: 0.35 });
    deckMesh.material = texturedMat(deckTex, { rough: 0.7, metal: 0.35, color: 0xaab4bc });
    for (let i = -2; i <= 2; i++) box(dk, 0.03, 0.01, 5.4, 0.4 + i * 1.05, 0.005, 0, 0x18222a, { rough: 0.8, cast: false });

    box(g, 0.12, 0.34, 5.4, -2.2, 0.19, 0, 0x39424b, { rough: 0.75, metal: 0.35, finish: "painted", tile: [1, 6] });
    box(g, 0.2, 0.07, 5.4, -2.24, 0.25, 0, 0x2b333b, { rough: 0.8, metal: 0.3, cast: false });
    for (let i = 0; i < 6; i++) cyl(g, 0.02, 0.024, 1.0, -2.2, 0.68, -2.3 + i * 0.9, 0x9aa3ab, { rough: 0.5, metal: 0.6, seg: 8 });
    for (const y of [0.5, 0.86]) cyl(g, 0.016, 0.016, 5.4, -2.2, 0.18 + y, 0, 0x9aa3ab, { rough: 0.45, metal: 0.65, seg: 8 }).rotation.x = Math.PI / 2;

    const waterTex = surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0b2836", mid: "#0e3140", base2: "#081f2a" }), { repeat: 4, px: 256 });
    const sea = box(g, 6.0, 0.03, 9.0, -5.2, 0.02, 0.3, 0x0e3140, { rough: 0.2, metal: 0.28, opacity: 0.9, transparent: true, cast: false, receive: false });
    sea.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x1c5468 });
    sea.material.transparent = true;
    sea.material.opacity = 0.9;
    const wave = particles(g, 24, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.35 });
    wave.position.set(-3.6, 0.05, 0.3);

    // -------------------------------------------------------------- records
    const voyageBoard = holoPanel(dk, 0.92, 0.62, -1.85, 1.1, 1.95, (cx, w, h) => {
      cx.fillStyle = "#081820"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3c7ea8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d7ecf6"; cx.fillText("BALLAST WATER RECORD BOOK", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e6f3fa";
      ["Mgmt plan: exchange + UV treatment", "Last cast: mid-ocean, > 200 nm", "Tank No. 4C — treated this voyage", "Voyage: matches declared route", "BWM Convention record — current"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 0.5, accent: BWS_ACCENT });
    reg(hits, voyageBoard, "voyage-record");

    const certBoard = holoPanel(dk, 0.92, 0.62, 1.9, 1.1, 1.95, (cx, w, h) => {
      cx.fillStyle = "#081820"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3c7ea8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d7ecf6"; cx.fillText("TREATMENT SYSTEM — TYPE APPROVAL", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e6f3fa";
      ["UV / filtration system, Model BWTS-4", "Approved to D-2 discharge standard", "Serial matches installed unit", "Certificate current — not expired", "Flag administration endorsement"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.5, accent: BWS_ACCENT });
    reg(hits, certBoard, "type-approval-cert");

    const pid = holoPanel(dk, 0.86, 0.6, 0, 1.05, 2.35, (cx, w, h) => {
      cx.fillStyle = "#081820"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3c7ea8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d7ecf6"; cx.fillText("BALLAST MANIFOLD — P&ID", w * 0.06, h * 0.15);
      cx.strokeStyle = "#7fb8d8"; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(w * 0.1, h * 0.55); cx.lineTo(w * 0.9, h * 0.55); cx.stroke();
      cx.fillStyle = "#f2ae14"; cx.beginPath(); cx.arc(w * 0.72, h * 0.55, h * 0.06, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = "#dff0fa"; cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`;
      cx.fillText("Tank 4C sample cock — highlighted", w * 0.1, h * 0.82);
    }, { accent: BWS_ACCENT });
    reg(hits, pid, "pid-panel");

    // -------------------------------------------------------------- manifold
    const manifold = group(dk, 0.5, 0.1, -0.2);
    pipeRun(manifold, [[-1.4, 0.7, 0.4], [-0.2, 0.7, 0.4], [0.6, 0.7, 0.1], [0.6, 0.7, -0.5]], 0.09, 0x7b8a86, { flanges: [[0.6, 0.7, -0.5]] });
    const isoValve = valveWheel(manifold, -1.0, 0.95, 0.4, { color: 0xd2312b, body: 0x2b2f34, r: 0.11 });
    holoTag(manifold, "isolation valve — Tank 4C branch", -1.0, 1.35, 0.4, { css: "#3c7ea8", w: 0.5 });
    reg(hits, isoValve.userData.wheel, "isolation-valve");
    const isoLeak = particles(manifold, 14, 0x9fd6ee, { size: 0.02, life: 0.5, additive: false, opacity: 0.55 });
    isoLeak.position.set(-1.0, 0.86, 0.4);
    isoLeak.visible = false;

    const sampleCock = valveWheel(manifold, 0.2, 0.95, 0.1, { color: 0x3c7ea8, body: 0x2b2f34, r: 0.08 });
    holoTag(manifold, "sample cock", 0.2, 1.3, 0.1, { css: "#3c7ea8", w: 0.28 });
    reg(hits, sampleCock.userData.wheel, "flush-line");
    const flowInst = instrument(manifold, 0.2, 0.72, 0.34, { idle: "-- L/min", color: 0x3c7ea8, w: 0.13, d: 0.2 });
    holoTag(manifold, "flow — flush the line", 0.2, 0.92, 0.34, { css: "#3c7ea8", w: 0.4 });

    const cockSpout = cyl(manifold, 0.018, 0.018, 0.1, 0.2, 0.62, 0.1, 0xb9bec4, { rough: 0.4, metal: 0.7, seg: 8 });
    void cockSpout;
    const sampleTapHit = box(manifold, 0.24, 0.24, 0.24, 0.2, 0.5, 0.16, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(manifold, "draw sample here", 0.2, 0.34, 0.16, { css: "#3c7ea8", w: 0.34 });
    reg(hits, sampleTapHit, "sample-cock");
    const stream = particles(manifold, 12, 0x9fd6ee, { size: 0.018, life: 0.35, additive: false, opacity: 0.6 });
    stream.position.set(0.2, 0.58, 0.1);
    stream.visible = false;

    const dischargePipe = cyl(manifold, 0.07, 0.07, 0.6, 0.9, 0.55, -0.5, 0x7b8a86, { rough: 0.5, metal: 0.6, seg: 12 });
    dischargePipe.rotation.z = Math.PI / 2;
    const dischargeValve = valveWheel(manifold, 1.25, 0.55, -0.5, { color: 0xf2ae14, body: 0x2b2f34, r: 0.1 });
    holoTag(manifold, "overboard discharge", 1.25, 0.9, -0.5, { css: "#3c7ea8", w: 0.4 });
    const dischargeInst = instrument(manifold, 1.25, 0.72, -0.72, { idle: "0 %", color: 0x3c7ea8, w: 0.13, d: 0.2 });
    reg(hits, dischargeInst, "discharge-rate");
    const dischargeEarlyHit = box(manifold, 0.22, 0.22, 0.22, 1.25, 0.95, -0.72, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(manifold, "open the discharge now?", 1.25, 1.18, -0.72, { css: "#e8622a", w: 0.44 });
    reg(hits, dischargeEarlyHit, "discharge-early");
    void dischargeValve;

    // ------------------------------------------------------- analysis bench
    const chest = toolChest(dk, -2.1, 0.55, { ry: 0.6, color: 0x2f5f7f });
    const kitCase = box(chest, 0.3, 0.16, 0.2, 0, 0.85, 0, 0x1f3a4a, { rough: 0.7 });
    decal(chest, 0.24, 0.08, 0, 0.931, 0, signFace("BWTS FIELD KIT", { bg: "#08161e", accent: "#3c7ea8", scale: 0.5 })).rotation.x = -Math.PI / 2;
    holoTag(chest, "indicative analysis kit", 0, 1.1, 0, { css: "#3c7ea8", w: 0.46 });
    reg(hits, kitCase, "analysis-kit");

    const bench = group(dk, 1.55, 0.1, 0.55, -0.4);
    box(bench, 0.9, 0.65, 0.5, 0, 0.325, 0, 0x4a5561, { rough: 0.7, metal: 0.3 });
    const benchSocket = group(bench, 0, 0.65, 0);
    hits["analysis-bench"] = benchSocket;
    const analysisMeter = instrument(bench, -0.1, 0.68, 0.05, { idle: "-- /m³", color: 0x3c7ea8, w: 0.15, d: 0.22 });
    holoTag(bench, "organisms / m³ — commit vs D-2", -0.1, 0.94, 0.05, { css: "#3c7ea8", w: 0.5 });
    reg(hits, analysisMeter, "analysis-meter");
    const microscope = group(bench, 0.28, 0.65, -0.05);
    cyl(microscope, 0.05, 0.06, 0.05, 0, 0.025, 0, 0x22262b, { rough: 0.5, metal: 0.4, seg: 14 });
    cyl(microscope, 0.02, 0.02, 0.2, 0, 0.15, 0, 0x22262b, { rough: 0.4, metal: 0.5, seg: 10 });
    cyl(microscope, 0.024, 0.024, 0.09, 0.0, 0.24, 0.03, 0x3c444c, { rough: 0.35, metal: 0.6, seg: 10 }).rotation.x = 0.5;

    // ------------------------------------------------ label / seal / COC table
    const table = group(dk, 1.55, 0.1, 1.6, -0.3);
    box(table, 1.1, 0.7, 0.55, 0, 0.35, 0, 0x4a5561, { rough: 0.7, metal: 0.3 });
    const bottle = cyl(table, 0.05, 0.05, 0.2, -0.25, 0.8, 0.0, 0x8fd8ff, { rough: 0.2, opacity: 0.6, transparent: true, seg: 12 });
    const labelDecal = decal(table, 0.09, 0.06, -0.25, 0.86, 0.051, signFace("LABEL", { bg: "#08161e", accent: "#3c7ea8", scale: 0.5 }));
    labelDecal.visible = false;
    holoTag(table, "label the bottle", -0.25, 1.02, 0.0, { css: "#3c7ea8", w: 0.32 });
    reg(hits, bottle, "bottle-label");
    const capHit = cyl(table, 0.055, 0.055, 0.03, -0.25, 0.91, 0.0, 0xb9bec4, { rough: 0.4, metal: 0.6, seg: 12 });
    capHit.visible = false;
    const sealPick = box(table, 0.12, 0.05, 0.1, 0.05, 0.75, 0.0, 0xd2312b, { rough: 0.6 });
    holoTag(table, "seal it", 0.05, 0.92, 0.0, { css: "#3c7ea8", w: 0.2 });
    reg(hits, sealPick, "bottle-seal");
    const coc = decal(table, 0.3, 0.4, 0.35, 0.72, -0.06, paperFace("CHAIN OF CUSTODY", ["Sample ID / bottle no.", "Collected by / witnessed by", "Time, tank, sample point", "Custody transferred to:", "Inspector signature: ______"], { scale: 0.85 }));
    coc.rotation.x = -Math.PI / 2;
    holoTag(table, "sign chain of custody", 0.35, 1.0, -0.06, { css: "#3c7ea8", w: 0.44 });
    reg(hits, coc, "coc-sign");
    const cocBreachHit = box(table, 0.2, 0.2, 0.2, -0.55, 0.85, -0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "hand it off unsealed?", -0.55, 1.05, -0.15, { css: "#e8622a", w: 0.4 });
    reg(hits, cocBreachHit, "break-coc");
    const skipFlushHit = box(table, 0.2, 0.2, 0.2, 0.5, 0.85, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "draw it now, unflushed?", 0.5, 1.05, 0.2, { css: "#e8622a", w: 0.42 });
    reg(hits, skipFlushHit, "skip-flush");

    // --------------------------------------------------- sounding pipe / hatch
    const soundGrp = group(dk, -1.5, 0.02, -1.6);
    cyl(soundGrp, 0.06, 0.06, 0.55, 0, 0.275, 0, 0x7b8a86, { rough: 0.6, metal: 0.5, seg: 12 });
    const soundCap = cyl(soundGrp, 0.075, 0.075, 0.05, 0, 0.55, 0, 0x9aa3ab, { rough: 0.5, metal: 0.55, seg: 14 });
    holoTag(soundGrp, "sounding pipe — Tank 4C", 0, 0.85, 0, { css: "#3c7ea8", w: 0.44 });
    const gasMeter = instrument(soundGrp, 0.25, 0.5, 0, { idle: "-- %O2", color: 0x3c7ea8, w: 0.12, d: 0.19 });
    holoTag(soundGrp, "test the atmosphere", 0.25, 0.7, 0, { css: "#3c7ea8", w: 0.4 });
    reg(hits, gasMeter, "gas-test");
    const capCrackHit = box(soundGrp, 0.2, 0.2, 0.2, 0, 0.75, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(soundGrp, "crack it now, untested?", 0.3, 0.95, -0.2, { css: "#e8622a", w: 0.46 });
    reg(hits, capCrackHit, "crack-cap-untested");
    const capOpenTell = ball(soundGrp, 0.02, 0.09, 0.56, 0, 0x1b1e23, { rough: 0.8 });
    capOpenTell.visible = false;
    reg(hits, capOpenTell, "cap-cracked");

    const permitBoard = group(dk, -1.05, 0.1, -1.85, 0.5);
    box(permitBoard, 0.3, 0.22, 0.02, 0, 0.5, 0, 0x2b3138, { rough: 0.7 });
    const permitDecal = decal(permitBoard, 0.26, 0.18, 0, 0.5, 0.011, paperFace("ENTRY PERMIT", ["Tank 4C — enclosed space", "Not posted"], { bg: "#f4e9d8", band: "#b81410" }));
    holoTag(permitBoard, "post the permit", 0, 0.68, 0, { css: "#3c7ea8", w: 0.36 });
    reg(hits, permitDecal, "permit-post");

    const hatchGrp = group(dk, -0.6, 0.02, -1.95);
    box(hatchGrp, 0.55, 0.08, 0.5, 0, 0.04, 0, 0x4a5159, { rough: 0.6, metal: 0.4, finish: "painted", tile: [1, 1] });
    const hatchCover = box(hatchGrp, 0.48, 0.04, 0.44, 0, 0.1, 0, 0x5a636b, { rough: 0.55, metal: 0.45 });
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; ball(hatchGrp, 0.02, Math.cos(a) * 0.24, 0.1, Math.sin(a) * 0.2, 0x22262b, { rough: 0.6 }); }
    holoTag(hatchGrp, "tank hatch — Tank 4C manhole", 0, 0.34, 0, { css: "#3c7ea8", w: 0.46 });
    const hatchHit = box(hatchGrp, 0.6, 0.3, 0.55, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hatchHit, "tank-hatch");

    const attendantPost = group(dk, -0.15, 0.02, -2.25);
    cyl(attendantPost, 0.02, 0.024, 0.9, 0, 0.45, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const attendantFlag = box(attendantPost, 0.14, 0.1, 0.01, 0.08, 0.82, 0, 0x4a4f55, { rough: 0.7 });
    decal(attendantPost, 0.13, 0.09, 0.081, 0.82, 0.006, signFace("ATTENDANT", { bg: "#08161e", accent: "#3c7ea8", scale: 0.55 }));
    holoTag(attendantPost, "post attendant — hatch watch", 0, 1.02, 0, { css: "#3c7ea8", w: 0.42 });
    reg(hits, attendantPost, "attendant-post");
    void attendantFlag;

    // ------------------------------------------------------------- officer
    const officerTable = group(dk, 1.9, 0.1, -1.7, -0.6);
    box(officerTable, 0.6, 0.65, 0.4, 0, 0.325, 0, 0x4a5561, { rough: 0.7, metal: 0.3 });
    const recordDecal = decal(officerTable, 0.32, 0.42, 0, 0.66, 0, paperFace("SAMPLING RECORD", ["Tank / sample cock", "Time drawn / drawn by", "Indicative result", "Ship's officer: ______", "Boarding team: ______"], { scale: 0.85 }));
    recordDecal.rotation.x = -Math.PI / 2;
    holoTag(officerTable, "officer signs here", 0, 0.9, 0, { css: "#3c7ea8", w: 0.42 });
    reg(hits, recordDecal, "sampling-record");
    const officer = standingFigure(dk, 1.6, -2.25, { ry: 2.5, cloth: 0x1f3a52 });
    holoTag(officer, "ship's officer", 0, 1.9, 0, { css: "#3c7ea8", w: 0.2 });

    const spareBottle = cyl(dk, 0.04, 0.04, 0.16, 1.1, 0.28, 0.9, 0xc9d8e0, { rough: 0.3, opacity: 0.5, transparent: true, seg: 10 });
    reg(hits, spareBottle, "spare-bottle-untagged");

    // Off-watch crew member, tending a mooring line clear of every control
    // until the interrupt sends them toward the hatch.
    const crewHome = new THREE.Vector3(2.45, 0, 1.35);
    const crew = standingFigure(dk, crewHome.x, crewHome.z, { ry: -1.0, cloth: 0x2b3138, vest: 0xf2c14b });

    cyl(g, 0.02, 0.02, 5.6, 2.3, 0.36, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;

    const isoHomeMat = isoValve.userData.wheel.material;
    const isoAlertMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.3, rough: 0.4, metal: 0.7 });
    const hatchHomeMat = hatchCover.material;
    const hatchAlertMat = mat(0xe8622a, { emissive: 0xe8622a, ei: 1.1, rough: 0.5, metal: 0.35 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, -0.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "label-coc") { labelDecal.visible = true; capHit.visible = true; }
        if (step.id === "walk") { capOpenTell.visible = false; spareBottle.visible = false; }
      },
      onHazard() {},
      // Both interruptions change something visible the instant they fire —
      // the valve really weeps and the hatch cover really goes for the crew
      // member to work on — not only once animate() next ticks.
      onInterrupt(it) {
        if (it.id === "valve-passing") {
          isoValve.userData.wheel.material = isoAlertMat;
          isoLeak.visible = true;
        }
        if (it.id === "tank-entry") {
          crew.position.set(-0.6, 0, -1.6);
          crew.rotation.y = 0.4;
          hatchCover.material = hatchAlertMat;
          hatchCover.position.x = 0.08;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "valve-passing") {
          isoValve.userData.wheel.material = isoHomeMat;
          isoLeak.visible = false;
        }
        if (it.id === "tank-entry") {
          crew.position.set(crewHome.x, 0, crewHome.z);
          crew.rotation.y = -1.0;
          hatchCover.material = hatchHomeMat;
          hatchCover.position.x = 0;
        }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0.4, 0.02, 0), 1.1, 0.4, -0.4);
        if (isoLeak.visible) isoLeak.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.3, -0.6);
        const step = session?.step;
        if (step?.id === "flush" && session.track) repaint(flowInst.userData.screen, signFace(`${Math.round(session.track.v * 40)} L/min`, { bg: "#08161e", accent: session.track.v >= 0.32 && session.track.v <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.6 }));
        stream.visible = !!session?.holding && (step?.id === "flush" || step?.id === "draw-sample");
        if (stream.visible) stream.userData.step(dt, new THREE.Vector3(0, -0.3, 0), 0.03, 0.2, -0.9);
        if (step?.id === "hold-discharge" && session.track) repaint(dischargeInst.userData.screen, signFace(`${Math.round(session.track.v * 100)} %`, { bg: "#08161e", accent: session.track.v <= 0.18 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.62 }));
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "analysis") repaint(analysisMeter.userData.screen, signFace(`${Math.round(gg.t * 200)} /m³`, { bg: "#08161e", accent: gg.t >= 0.15 && gg.t <= 0.35 ? "#59c97b" : "#f2ae14", fg: "#eaf6fb", scale: 0.6 }));
        if (session?.turn && step?.id === "isolate") isoValve.userData.wheel.rotation.y = -session.turn.amount * Math.PI * 2;
        void soundCap;
      },
    };
  },
};
