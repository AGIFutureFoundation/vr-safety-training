import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, valveWheel, pipeRun, lockTag, cylinderTank, surfaceTexture, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Medical Gas Brazing & Purge VR — Building Systems & Facilities,
// UA plumbers and pipefitters, medical gas piping installer.
//
// Copper medical gas piping is brazed with an inert gas flowing through the
// bore the whole time, because scale that forms on the inside of an unpurged
// joint does not stay put — it breaks free the first time the line is put
// into service and travels downstream until it lodges in a flowmeter or a
// patient's own regulator. That single fact is why every joint on this
// station is purged before the torch ever lights, and it is why the flow of
// nitrogen never stops until the joint has cooled in the tech's hand.
//
// The other one-way door on a medical gas system is which outlet ends up
// carrying which gas. Oxygen, medical air and vacuum share a ceiling void and
// look identical once the copper is behind a wall, so ASSE 6010 installation
// and ASSE 6015 verification both exist to make sure the label on the outlet
// and the gas actually flowing through it are proven to match — with a
// gas-specific fitting that will not physically connect to the wrong hose —
// before any zone valve is signed off and handed back to the hospital.

const MGB_ACCENT = 0x5fd6a8;

export const SIM_PL_MEDICAL_GAS_BRAZING_AND_PURGE = {
  id: "pl-medical-gas-brazing-and-purge",
  index: "pl-01",
  domain: "Building Systems & Facilities",
  trade: "UA medical gas systems installer",
  category: "Building Systems & Facilities",
  indoor: "service",
  certification: "UA plumbers and pipefitters apprenticeship; NFPA 99 Health Care Facilities Code; ASSE 6010 medical gas systems installer and ASSE 6015 medical gas systems verifier professional qualifications; 29 CFR 1910.252 welding, cutting and brazing",
  name: "Medical Gas Brazing & Purge",
  title: simTitle("Medical Gas Brazing & Purge"),
  tagline: "Zone valve locked and tagged, the run purged with nitrogen before the torch lights, every joint brazed under a continuous flow, and every outlet cross-tested against its own gas before the zone goes back to the floor",
  accent: MGB_ACCENT,
  accentCss: "#5fd6a8",
  parSeconds: 260,
  footprint: 2.2,
  badge: { id: "purged-and-proven", name: "Purged and Proven", note: "A medical gas zone brazed under a continuous purge and cross-tested outlet by outlet before sign-off" },

  game: system({
    name: "Life Safety Gas",
    currency: "SCFH",
    ranks: ["Apprentice", "Journeyman", "Gas Installer", "Verified Installer", "Medical Gas Certified"],
    badges: [
      { id: "locked-before-cut", name: "Locked Before Cut", note: "The zone valve was locked and tagged before any pipe was opened", test: AWARD.stepClean("isolate") },
      { id: "never-unpurged", name: "Never Unpurged", note: "No joint was ever brazed without nitrogen flowing", test: AWARD.safe },
      { id: "steady-flow", name: "Steady Flow", note: "Held the purge flow inside the band on every reading", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-braze", name: "Clean Braze", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-purge", name: "Unbroken Purge", note: "The purge never dropped out mid-joint", test: AWARD.unbroken },
      { id: "zone-back-fast", name: "Zone Back Fast", note: "Signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "braze-unpurged": "You lit the torch with no nitrogen flowing in the line. Copper oxidises black inside a joint heated in open air, and that scale does not stay stuck to the pipe wall — the first time this line flows at working pressure it breaks loose and travels until it jams a flowmeter, a regulator or a patient's own fitting.",
    "cross-wired-outlet": "You signed off the oxygen outlet without checking what gas is actually coming out of it. A crossed connection behind the wall puts the wrong gas at a bedside fitting that looks correct in every way except the one that matters, and nobody finds out until a patient is on it.",
    "skip-lockout": "You opened the pipe before the zone valve was locked and tagged. This line is live to occupied patient rooms on the floor below, and cutting into a gas line somebody can still open from the valve room is how a fitter gets a face full of oxygen-enriched air or medical vacuum drops out from under a ventilator mid-procedure.",
    "torch-near-o2": "You set the torch down still lit next to the open oxygen cylinder valve. Oxygen does not burn on its own, but it turns anything nearby — grease, rag, cuff of a coverall — into something that burns violently, and a live flame that close to an open valve is one dropped regulator away from a flash fire.",
  },

  lateNotes: {
    "n2-purge-valve": "The purge starts before the torch lights and does not stop until the joint has cooled enough to touch — it is the flow that keeps oxide off the inside of the joint, not a step that happens once and is done.",
    "n2-flow-1": "Every joint is brazed under the purge that is already running, never before it or after it has been shut off.",
    "test-o2-outlet": "The cross-connection test happens after the line is proven leak-tight, outlet by outlet, before any zone valve is handed back.",
  },

  // Two things a fitter with a torch in one hand and a purge gauge in the
  // other has no spare attention for. See shared/game.js.
  interrupts: [
    {
      id: "purge-drops",
      kind: "Purge flow falling off",
      // Armed on entering the purge hold, so the window lands mid-braze —
      // answered by the regulator itself, not the torch valve that step owns.
      after: "purge", delay: 2, seconds: 11,
      alert: "The nitrogen regulator on the header just dropped off — the purge flow is falling as you watch it.",
      cue: "The bottle feeding the purge needs attention before you commit another joint.",
      target: "n2-regulator",
      why: "A falling purge flow mid-braze means the joint you are about to close is filling with air again, which is exactly the condition the purge exists to prevent. Catching it on the regulator, before the next joint is heated, is the difference between a clean bore and a joint that has to be cut out and redone.",
      missNote: "The purge kept falling while the next joint went in anyway. That joint is oxidising on the inside right now, and it will not show until it is already behind a wall.",
      wrongNote: "It is the regulator on the header. The torch valve was never the problem — the gas feeding it is.",
    },
    {
      id: "wrong-gas-page",
      kind: "Facilities calls about the wrong outlet",
      // Armed after the cross-connection test step opens, answered by the
      // phone rather than the outlet under test.
      after: "cross-test", delay: 3, seconds: 12,
      alert: "Facilities is calling — a nurse on the floor below just reported the medical air outlet in room 214 smells like it is not flowing right.",
      cue: "That is a live report on a zone this run feeds. Take the call before you sign anything off.",
      target: "phone",
      why: "A report from the floor while the cross-connection test is still open is exactly the kind of information the test is designed to catch, arriving from the other direction. Taking the call before signing the zone off means it gets checked against this test rather than becoming a second incident traced back to it later.",
      missNote: "The call went to voicemail while the sign-off went ahead anyway. Room 214 is now a separate problem instead of a line item on this test.",
      wrongNote: "It is the phone. Whatever is happening on the floor outranks finishing the paperwork on this bench.",
    },
  ],

  steps: [
    {
      id: "drawing", kind: "select", target: "riser-drawing",
      title: "Read the riser diagram for this zone",
      cue: "Check the riser diagram: which gas feeds this zone valve and which outlets are downstream of it.",
      why: "NFPA 99 requires each zone valve to control a defined group of outlets with its own gas identified, and the diagram is the only place that grouping is written down before the wall is open. A fitter who braces the wrong branch off the wrong zone valve isolates the wrong patient rooms when this valve is closed for the next service.",
    },
    {
      id: "isolate", kind: "sequence",
      targets: ["close-zone-valve", "lock-zone-valve", "tag-zone-valve"],
      itemNames: { "close-zone-valve": "zone valve closed", "lock-zone-valve": "valve locked", "tag-zone-valve": "tag written and hung" },
      title: "Isolate and lock out the zone valve",
      cue: "Close the zone valve, lock it, and hang a tag naming the work and the fitter.",
      why: "This valve is the only thing standing between the pipe you are about to cut and a live medical gas main feeding occupied rooms. Locking it, not just closing it, is what stops somebody in the valve room from reopening it while a fitter has an open joint downstream — a closed valve can be operated by anyone; a locked one cannot.",
      outOfOrderNote: "Close it, lock it, then tag it — the lock is what makes the closed valve mean something.",
    },
    {
      id: "open-pipe", kind: "find", noHint: true,
      targets: ["scale-buildup", "unions-loose"],
      itemNames: { "scale-buildup": "old scale inside the cut pipe", "unions-loose": "loose union on the branch" },
      itemNotes: {
        "scale-buildup": "There is black scale flaking from inside the section you just cut open — evidence this branch was brazed without a purge at some point in the past.",
        "unions-loose": "The union feeding this branch is only finger-tight. It has to be made up properly before anything is pressurised through it.",
      },
      title: "Open the line and inspect what is inside",
      cue: "Cut in and look at what the old pipe actually shows you before you braze anything new to it.",
      why: "Scale inside an existing joint is a fitter's own history lesson: it means somebody brazed this section without nitrogen flowing, and it tells you to expect debris in this branch when the system is finally purged and tested, not to assume the rest of the run is clean because this one joint looked fine from outside.",
    },
    {
      id: "fitup", kind: "drag", target: "new-fitting",
      title: "Bring the new fitting into position",
      cue: "Drag the new tee onto the cleaned branch socket before anything is heated.",
      why: "A capillary joint depends on a specific, even gap between the fitting and the pipe — too loose and the filler cannot bridge it, too tight and there is nowhere for the molten alloy to draw in. Dry-fitting the tee square on the cleaned socket now, before the torch ever comes out, is what makes that gap the same all the way round instead of tight on one side and open on the other.",
      drag: { to: "branch-socket", radius: 0.4, missNote: "Not seated square on the socket — a fitting that goes in crooked leaves an uneven gap the filler cannot bridge on every side at once." },
    },
    {
      id: "open-n2", kind: "turn", target: "n2-cylinder-valve",
      title: "Open the nitrogen cylinder valve",
      cue: "Turn the cylinder valve open before the regulator is asked to deliver anything.",
      why: "The regulator only meters what the cylinder valve actually lets past it, and cracking the cylinder open slowly rather than snapping it wide keeps the sudden rush of high-pressure gas from slamming the regulator's own internals — a fast opening on a full cylinder can wreck a regulator seat before the first joint is ever brazed.",
      turn: { turns: 0.75, axis: "y", label: "N2 CYLINDER" },
    },
    {
      id: "filler", kind: "select", target: "filler-rod",
      title: "Select the correct filler alloy",
      cue: "Pick the silver brazing alloy specified for medical gas copper, not the general-purpose rod on the same bench.",
      why: "Medical gas piping is brazed with a specific silver-phosphorus filler chosen for the joint strength and internal cleanliness NFPA 99 assumes the system was built to, and a general-purpose plumbing rod grabbed off the same bench by habit does not carry the same silver content or flow characteristics under heat. The wrong rod can still make a joint that looks sound and holds nothing like the margin the system was designed around.",
    },
    {
      id: "purge", kind: "hold", target: "n2-purge-valve", seconds: 5,
      title: "Start the nitrogen purge",
      cue: "Hold the purge valve open until the flow reads steady before the torch is lit.",
      why: "The purge has to be running and steady before the first joint is heated, not started once the torch is already lit. A joint brazed into still air oxidises on the inside from the first second of heat, and that oxide is exactly what the purge is there to keep from ever forming.",
      holdBreakNote: "The purge valve closed before the flow settled — hold it open again until the reading is steady, then light the torch.",
    },
    {
      id: "braze-1", kind: "gauge", target: "n2-flow-1",
      title: "Braze the first joint under purge",
      cue: "Watch the purge flow while you braze this joint and commit when it sits in the band.",
      why: "The flow has to stay inside a working band the whole time this joint is heated — too little and air works back up the pipe past the joint, too much and it can blow the molten filler out of the cup before it wets the copper. Reading the gauge rather than guessing at the hiss is what NFPA 99's brazing requirement actually asks a fitter to do.",
      gauge: { label: "PURGE FLOW", speed: 0.7, green: [0.42, 0.62], readout: (t) => `${Math.round(t * 12)} scfh`, missNote: "Flow out of band on that joint — recheck it before it is buried behind the ceiling grid." },
    },
    {
      id: "braze-2", kind: "gauge", target: "n2-flow-2",
      title: "Braze the second joint under purge",
      cue: "Same purge, the next joint down the branch — watch the flow and commit in the band.",
      why: "Every joint on this branch gets the same reading, not just the first one — a purge that drifted low three joints in is just as capable of leaving oxide behind as one that was never started, and there is no way to tell from outside which joint it happened on once the wall is closed.",
      gauge: { label: "PURGE FLOW", speed: 0.72, green: [0.42, 0.62], readout: (t) => `${Math.round(t * 12)} scfh`, missNote: "That joint ran outside the band too — the branch now has two joints that need to be reopened and checked." },
    },
    {
      id: "cool", kind: "track", target: "cooling-joint", seconds: 6,
      title: "Hold the purge through cool-down",
      cue: "Keep the purge flowing while the last joint cools — do not shut it off the moment the torch goes out.",
      why: "The copper is still hot enough to oxidise for a good while after the flame is gone, and shutting the purge off the instant the torch does is the single most common way a fitter who did everything else right still ends up with scale in a joint that looked perfect going in.",
      track: { start: 0.5, green: [0.3, 0.5], rise: 0.1, fall: 0.35, drift: 0.15, label: "JOINT TEMP", readout: (v) => (v > 0.5 ? "too hot to shut off" : v < 0.3 ? "purge closed early" : "cooling under purge") },
      holdBreakNote: "The purge came off before the joint cooled — hold it a little longer next time, this one may already have oxide in it.",
    },
    {
      id: "leak-test", kind: "gauge", target: "test-gauge",
      title: "Pressure-test the new branch",
      cue: "Bring the test pressure up per the code and the drawing, then commit once it holds steady.",
      why: "A branch that will not hold a test pressure has a joint that did not seal, and finding that now — before the ceiling goes back — costs a callback instead of a demolished finished ceiling on a return visit after the zone is already back in service.",
      gauge: { label: "TEST PRESSURE", speed: 0.68, green: [0.55, 0.76], readout: (t) => `${Math.round(t * 100)}% of test value`, missNote: "Did not hold — there is a joint in this branch that is not sealed, and it has to be found before anything is closed up." },
    },
    {
      id: "cross-test", kind: "sequence",
      targets: ["test-o2-outlet", "test-air-outlet", "test-vac-outlet"],
      itemNames: { "test-o2-outlet": "oxygen outlet verified", "test-air-outlet": "medical air outlet verified", "test-vac-outlet": "vacuum outlet verified" },
      title: "Cross-test every outlet against its gas",
      cue: "At each outlet, connect the gas-specific test fitting and confirm it reads the gas the label claims.",
      why: "ASSE 6015 verification exists because the pipe is invisible once it is behind the wall, and the only proof a given outlet carries the gas its label claims is a test fitting that physically will not connect to the wrong gas, read at the outlet itself rather than assumed from the riser diagram.",
      outOfOrderNote: "Oxygen, then medical air, then vacuum — the order the riser diagram lists them, so nothing gets skipped.",
    },
    {
      id: "signoff", kind: "select", target: "verification-report",
      title: "Complete the verifier's report",
      cue: "Fill in the verification report with the readings and sign it before the zone valve is unlocked.",
      why: "ASSE 6010 and 6015 both end at a signed report naming a specific installer and verifier, because a medical gas zone with no record of who tested what is a zone the next fitter has to distrust and retest from nothing before touching it again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, MGB_ACCENT);
    const floorTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#c7ccd1"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, (i / 6) * h); ctx.lineTo(w, (i / 6) * h); ctx.stroke(); }
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo((i / 6) * w, 0); ctx.lineTo((i / 6) * w, h); ctx.stroke(); }
    }, { repeat: 5 });
    box(g, 5.2, 0.1, 4.4, 0, 0.05, 0, 0xffffff, { rough: 0.6 }).material = texturedMat(floorTex, { color: 0xd4d8dc, rough: 0.55 });
    const wallTex = surfaceTexture((ctx, w, h) => {
      ctx.fillStyle = "#e7ecef"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(150,165,175,0.25)";
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }, { repeat: 2 });
    box(g, 5.2, 2.6, 0.12, 0, 1.4, -2.0, 0xffffff, { rough: 0.85 }).material = texturedMat(wallTex, { color: 0xe7ecef, rough: 0.85 });
    box(g, 5.2, 0.14, 0.3, 0, 2.75, -2.0, 0x99a2a8, { rough: 0.8 });

    // Ceiling void with the zone header run exposed for the branch work.
    const ceil = group(g, -0.2, 2.3, -0.6);
    box(ceil, 3.6, 0.06, 1.4, 0, 0, 0, 0xb7bec4, { rough: 0.8 });
    pipeRun(ceil, [[-1.6, -0.14, 0], [1.6, -0.14, 0]], 0.05, 0x5a8f78, { flanges: [[-0.6, -0.14, 0]] });
    holoTag(ceil, "medical air header — zone 2", -1.6, 0.1, 0, { css: "#5fd6a8", w: 0.58 });

    // The zone valve box on the wall, in reach.
    const valveBox = group(g, -1.65, 1.35, -1.9, 0.3);
    box(valveBox, 0.42, 0.5, 0.14, 0, 0, 0, 0xf4f7f8, { rough: 0.4 });
    decal(valveBox, 0.3, 0.09, 0, 0.16, 0.075, signFace("O2 / MED AIR / VAC ZONE 2", { bg: "#0b3a2c", accent: "#5fd6a8", scale: 0.42 }));
    const zoneValve = valveWheel(valveBox, 0, -0.06, 0.09, { color: 0x5fd6a8, body: 0x2b2f34, r: 0.09 });
    holoTag(valveBox, "zone valve — O2/air/vac", 0, 0.32, 0.09, { css: "#5fd6a8", w: 0.5 });
    reg(hits, zoneValve, "close-zone-valve");
    const lock = lockTag(valveBox, 0.16, -0.2, 0.1, { color: 0xd8232a, lines: ["MEDICAL", "GAS LOCK"] });
    reg(hits, lock, "lock-zone-valve");
    const tag = decal(valveBox, 0.1, 0.13, -0.14, -0.18, 0.1, paperFace("DO NOT OPERATE", ["Zone 2 brazing", "in progress"], { bg: "#f4e9d8", band: "#b81410", worn: true }));
    reg(hits, tag, "tag-zone-valve");
    reg(hits, valveBox, "skip-lockout");

    // The branch being worked: a bench-height run coming off the header.
    const branch = group(g, 0.6, 1.1, -1.55);
    pipeRun(branch, [[-1.2, 0, 0], [-0.3, 0, 0], [-0.3, 0, -0.5], [0.6, 0, -0.5]], 0.032, 0xb8834a, { flanges: [[-0.3, 0, -0.25]] });
    const cutSection = cyl(branch, 0.034, 0.034, 0.28, -0.75, 0, 0, 0x8a5a2f, { rough: 0.4, metal: 0.6, seg: 14, open: true });
    cutSection.rotation.z = Math.PI / 2;
    reg(hits, cutSection, "scale-buildup");
    const looseUnion = cyl(branch, 0.045, 0.045, 0.08, -0.3, 0, -0.25, 0x9aa3ab, { rough: 0.45, metal: 0.6, seg: 14 });
    reg(hits, looseUnion, "unions-loose");
    const joint1 = ball(branch, 0.045, -1.05, 0, 0, 0x8a5a2f, { rough: 0.4, metal: 0.6 });
    const joint2 = ball(branch, 0.045, 0.3, 0, -0.5, 0x8a5a2f, { rough: 0.4, metal: 0.6 });
    void joint1; void joint2;
    holoTag(branch, "branch — zone 2 medical air", -1.2, 0.3, 0, { css: "#5fd6a8", w: 0.5 });
    const branchSocket = group(branch, 0.0, 0, -0.5);
    hits["branch-socket"] = branchSocket;
    holoTag(branch, "cleaned socket", 0.0, 0.24, -0.5, { css: "#5fd6a8", w: 0.34 });

    // The new tee, staged on the bench until it is dragged onto the socket.
    const newFitting = group(g, -0.9, 1.1, -0.35, 0.5);
    cyl(newFitting, 0.036, 0.036, 0.14, 0, 0, 0, 0xc78a4a, { rough: 0.35, metal: 0.55, seg: 14 }).rotation.z = Math.PI / 2;
    cyl(newFitting, 0.036, 0.036, 0.1, 0, 0.06, 0, 0xc78a4a, { rough: 0.35, metal: 0.55, seg: 14 });
    holoTag(newFitting, "new tee", 0, 0.2, 0, { css: "#5fd6a8", w: 0.24 });
    reg(hits, newFitting, "new-fitting");

    // Torch cart, purge header and nitrogen cylinder.
    const cart = group(g, 1.8, 0.1, -1.1, -0.5);
    box(cart, 0.5, 0.7, 0.34, 0, 0.35, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const dx of [-0.14, 0.14]) cyl(cart, 0.06, 0.07, 0.55, dx, 0.65, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 12 });
    const torchHose = box(cart, 0.4, 0.02, 0.02, 0.2, 0.42, 0.18, 0xd2312b, { rough: 0.6 });
    const torchTip = cyl(cart, 0.012, 0.02, 0.1, 0.42, 0.4, 0.2, 0xf2c14b, { rough: 0.3, metal: 0.7, seg: 10, emissive: 0xff8800, ei: 1.4 });
    holoTag(cart, "torch", 0.2, 0.14, 0.18, { css: "#f2c14b", w: 0.22 });
    reg(hits, torchTip, "torch-near-o2");
    void torchHose;

    // Filler rods on the bench: the correct silver alloy and a general-purpose
    // decoy sitting right next to it, the way a real bench actually looks.
    const rodRack = group(g, 1.35, 0.86, -0.9, 0.3);
    const silverRod = cyl(rodRack, 0.006, 0.006, 0.32, -0.05, 0, 0, 0xd7dce1, { rough: 0.25, metal: 0.85, seg: 8 });
    silverRod.rotation.z = Math.PI / 2;
    decal(rodRack, 0.1, 0.05, -0.05, 0.03, 0, signFace("BAg-7", { bg: "#0d1c14", accent: "#59c97b", scale: 0.5 }));
    holoTag(rodRack, "silver braze alloy", -0.05, 0.1, 0, { css: "#5fd6a8", w: 0.4 });
    reg(hits, silverRod, "filler-rod");
    const genRod = cyl(rodRack, 0.006, 0.006, 0.32, 0.08, -0.02, 0.05, 0xb8834a, { rough: 0.4, metal: 0.6, seg: 8 });
    genRod.rotation.z = Math.PI / 2;
    holoTag(rodRack, "general-purpose rod", 0.08, 0.06, 0.05, { css: "#8fa9c4", w: 0.4 });
    void genRod;

    const n2 = cylinderTank(g, 1.15, -0.35, 0x5fd6a8, { plateLabel: "NITROGEN", plateLines: ["OIL FREE — 99.998%", "PURGE GAS ONLY"] });
    holoTag(n2, "nitrogen supply", 0, 1.25, 0, { css: "#5fd6a8", w: 0.42 });
    const n2Valve = valveWheel(n2, -0.1, 1.15, 0, { color: 0x5fd6a8, body: 0x2b2f34, r: 0.055 });
    holoTag(n2, "cylinder valve", -0.1, 1.34, 0, { css: "#5fd6a8", w: 0.36 });
    reg(hits, n2Valve, "n2-cylinder-valve");
    const purgeReg = instrument(n2, 0.16, 0.95, 0, { idle: "-- scfh", color: 0x2b2f34, w: 0.14, d: 0.16, ry: 0.6 });
    holoTag(n2, "purge regulator", 0.16, 1.15, 0, { css: "#5fd6a8", w: 0.42 });
    reg(hits, purgeReg, "n2-regulator");
    const purgeValve = box(g, 0.09, 0.06, 0.06, 0.85, 1.02, -0.55, 0xd2312b, { rough: 0.5 });
    holoTag(g, "purge valve", 0.85, 1.2, -0.55, { css: "#5fd6a8", w: 0.32 });
    reg(hits, purgeValve, "n2-purge-valve");
    const flow1 = instrument(g, 0.0, 1.3, -1.5, { idle: "-- scfh", color: 0x2b2f34, w: 0.13, d: 0.17 });
    reg(hits, flow1, "n2-flow-1");
    holoTag(g, "flow — joint 1", 0.0, 1.5, -1.5, { css: "#5fd6a8", w: 0.34 });
    const flow2 = instrument(g, 0.4, 1.3, -1.75, { idle: "-- scfh", color: 0x2b2f34, w: 0.13, d: 0.17 });
    reg(hits, flow2, "n2-flow-2");
    holoTag(g, "flow — joint 2", 0.4, 1.5, -1.75, { css: "#5fd6a8", w: 0.34 });
    const coolTarget = box(g, 0.12, 0.12, 0.12, 0.6, 1.1, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "cooling joint", 0.6, 1.28, -1.9, { css: "#5fd6a8", w: 0.34 });
    reg(hits, coolTarget, "cooling-joint");
    const braze1Note = box(g, 0.02, 0.02, 0.02, 0.001, 0.001, 0.001, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void braze1Note;
    const unpurgedTarget = box(g, 0.2, 0.2, 0.2, -0.75, 1.4, -1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "braze it without the purge?", -0.75, 1.62, -1.55, { css: "#d2312b", w: 0.58 });
    reg(hits, unpurgedTarget, "braze-unpurged");

    // Test gauge on the header.
    const testGauge = instrument(g, -0.6, 1.5, -1.45, { idle: "-- psi", color: 0x2b2f34, w: 0.15, d: 0.18 });
    holoTag(g, "test gauge", -0.6, 1.68, -1.45, { css: "#5fd6a8", w: 0.3 });
    reg(hits, testGauge, "test-gauge");

    // Wall outlets for the cross-connection test.
    const outlets = group(g, -1.7, 1.1, -1.2, 0.5);
    const oxy = decal(outlets, 0.14, 0.18, -0.4, 0, 0.01, signFace("O2", { bg: "#0d3d2c", accent: "#4fd1ff", scale: 0.6 }));
    reg(hits, oxy, "test-o2-outlet");
    const air = decal(outlets, 0.14, 0.18, 0, 0, 0.01, signFace("MED AIR", { bg: "#0d3d2c", accent: "#f2c14b", scale: 0.5 }));
    reg(hits, air, "test-air-outlet");
    const vac = decal(outlets, 0.14, 0.18, 0.4, 0, 0.01, signFace("VAC", { bg: "#0d3d2c", accent: "#8fa9c4", scale: 0.55 }));
    reg(hits, vac, "test-vac-outlet");
    const wrongGasTarget = box(g, 0.14, 0.14, 0.14, -1.9, 1.7, -1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "sign it off without checking?", -1.9, 1.9, -1.2, { css: "#d2312b", w: 0.62 });
    reg(hits, wrongGasTarget, "cross-wired-outlet");

    // Bench: riser drawing, report, phone.
    const bench = group(g, -1.9, 0.1, 0.7);
    box(bench, 1.2, 0.76, 0.55, 0, 0.38, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const drawing = decal(bench, 0.34, 0.42, -0.35, 0.78, 0, paperFace("RISER — ZONE 2", ["Feeds: O2, MED AIR, VAC", "Rooms: 208-216", "Zone valve: VLV-2A", "Last verified: 14 months ago"], { scale: 0.82 }));
    drawing.rotation.x = -Math.PI / 2;
    holoTag(bench, "riser drawing", -0.35, 0.98, 0, { css: "#5fd6a8", w: 0.32 });
    reg(hits, drawing, "riser-drawing");
    const reportPaper = decal(bench, 0.32, 0.4, 0.35, 0.78, 0.02, paperFace("VERIFICATION REPORT", ["Installer ______", "Verifier ______", "O2 / AIR / VAC — pass", "Test pressure held"], { scale: 0.85 }));
    reportPaper.rotation.x = -Math.PI / 2;
    holoTag(bench, "verification report", 0.35, 0.98, 0.05, { css: "#5fd6a8", w: 0.46 });
    reg(hits, reportPaper, "verification-report");
    const phone = box(bench, 0.08, 0.15, 0.04, 0.0, 0.86, -0.2, 0x1b1e23, { rough: 0.6 });
    reg(hits, phone, "phone");

    const board = group(g, 1.9, 0, 1.7, -0.5);
    holoPanel(board, 0.95, 0.6, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#082a20"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#5fd6a8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dffbef"; ctx.fillText("MEDICAL GAS BRAZE — ZONE 2", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eafff5";
      ["Lock and tag the zone valve before any cut", "Nitrogen flows before the torch lights", "Never let the purge lapse mid-joint", "Hold the purge through cool-down", "Test pressure per the code and the drawing", "Cross-test every outlet against its own gas"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: MGB_ACCENT });

    const fitter = standingFigure(g, -1.0, 1.4, { ry: -2.3, cloth: 0x3a7a5f });
    holoTag(fitter, "medical gas installer", 0, 1.9, 0, { css: "#5fd6a8", w: 0.4 });
    toolChest(g, 2.2, 1.5);
    for (const [x, z] of [[2.2, -1.9], [-2.3, -1.9]]) cone(g, x, z);

    let purging = false, torchLit = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.3, 1.2, -1.3),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "open-pipe") { cutSection.visible = false; looseUnion.material = mat(0x9aa3ab, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "fitup") { newFitting.position.set(0.6, 1.1, -2.05); newFitting.rotation.y = 0; }
        if (step.id === "purge") { purging = true; repaint(purgeReg.userData.screen, signFace("12 scfh", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 })); }
        if (step.id === "braze-1") { torchLit = true; repaint(flow1.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 })); }
        if (step.id === "braze-2") repaint(flow2.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "cool") { torchLit = false; purging = false; }
        if (step.id === "leak-test") repaint(testGauge.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "purge-drops") purgeReg.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6, rough: 0.4 });
        if (it.id === "wrong-gas-page") phone.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.5, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "purge-drops") purgeReg.material = mat(0x2b2f34, { rough: 0.6 });
        if (it.id === "wrong-gas-page") phone.material = mat(0x1b1e23, { rough: 0.6 });
      },
      animate(t, dt, session) {
        if (torchLit) { torchTip.material.emissiveIntensity = 1.2 + Math.sin(t * 20) * 0.4; }
        if (purging) n2.rotation.y = Math.sin(t * 0.3) * 0.01;
        if (session?.turn && session.step?.id === "open-n2") n2Valve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
      },
    };
  },
};
