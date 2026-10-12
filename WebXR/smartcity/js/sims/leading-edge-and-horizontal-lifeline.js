import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Leading Edge & Horizontal Lifeline VR — Construction &
// Structural Trades, the fall-protection block.
//
// A steel frame a few floors up with the metal deck laid to the edge beam of
// one bay and the next bay still open: beams, the floor far below, and the
// crane landing deck bundles on the decked side. The learner is the
// ironworker or carpenter laying deck at the leading edge, working off a
// horizontal lifeline the crew rigs between two beam-clamp stanchions to the
// qualified person's design. The building is generic.

const LEH_ACCENT = 0xf2c14b;
const LEH_CSS = "#f2c14b";
const LEH_DECK = 0.35;       // the decked bay is a raised pad; the open bay is cut out of it

export const SIM_LEADING_EDGE_AND_HORIZONTAL_LIFELINE = {
  id: "leading-edge-and-horizontal-lifeline",
  index: "314",
  domain: "Construction & Structural Trades",
  trade: "Ironworker or carpenter laying metal deck at a leading edge, on a horizontal lifeline rigged to a qualified person's design",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "Ironworkers IMPACT and Carpenters training; OSHA 29 CFR 1926.501 duty to have fall protection at a leading edge and 29 CFR 1926.502 fall-protection systems, including the horizontal lifeline's design by a qualified person; ANSI Z359 personal fall-arrest equipment, including leading-edge-rated self-retracting lifelines; ASME B30.5 for the crane landing the deck bundles",
  name: "Leading Edge & Horizontal Lifeline",
  title: simTitle("Leading Edge & Horizontal Lifeline"),
  tagline: "Deck at the leading edge: the fall-protection plan read, the harness on and the leading-edge SRL clipped, a cut lanyard found, the beam clamps torqued, the lifeline run and tensioned while a welder starts cutting above it, the sag measured, the clearance checked, the traveller clipped while the crane swings a bundle overhead, a knife-edge flange found and padded, the rescue kit confirmed, a sheet laid and fastened, and the edge logged",
  accent: LEH_ACCENT,
  accentCss: LEH_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tied-off-at-the-edge", name: "Tied Off At The Edge", note: "Never untied past the line, the lifeline tensioned to the design, the sparks and the bundle both answered, and the edge padded before the first sheet" },

  supportLine: "your Ironworkers or Carpenters local's member assistance programme, or the employee assistance line on your contractor's site board",

  game: system({
    name: "Leading Edge",
    currency: "SHEET",
    ranks: ["Apprentice", "Decker", "Lifeline Rigger", "Lead Decker", "Leading Edge Qualified"],
    badges: [
      { id: "clipped-and-latched", name: "Clipped And Latched", note: "The traveller connection held and checked before a step toward the edge", test: AWARD.stepClean("connect") },
      { id: "tensioned-to-design", name: "Tensioned To Design", note: "The lifeline pretensioned inside the designer's band throughout", test: AWARD.unbroken },
      { id: "never-untied", name: "Never Untied", note: "No foot-level tie-off, no handrail anchor, no step past the line, no loose sheet walked", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-edge", name: "Clean Edge", note: "No corrections anywhere at the edge", test: AWARD.clean },
      { id: "sag-on-the-mark", name: "Sag On The Mark", note: "Midspan sag committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "bay-decked", name: "Bay Decked", note: "Edge logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "tie-off-at-feet": "You went to anchor a standard self-retracting lifeline at your feet on the edge beam. A standard SRL is built to be anchored overhead: anchored at foot level, a fall over the edge drags its line across the steel edge before the brake locks, adds the whole height of the worker to the free fall, and can cut or overload the line. At a leading edge the device has to be rated for it — a leading-edge SRL — and anchored where its rating says.",
    "handrail-anchor": "You reached to clip your lanyard to the electrical conduit strapped along the column. A fall-arrest anchor has to hold thousands of pounds, and a conduit on its straps holds almost nothing — it looks solid right up to the moment it peels off the column with a person on the end of it. Anchors are the lifeline, a designed anchor, or structural steel chosen by the competent person, never whatever is nearest.",
    "past-the-line-untied": "You stepped past the leading-edge warning line with your lanyard not yet clipped to the lifeline. Past that line the fall is the full height of the frame, and 29 CFR 1926.501 puts a worker at a leading edge six feet or more above a lower level under fall protection the whole time they are there. The connection is made on the safe side of the line, and only then does anyone walk toward the edge.",
    "loose-sheet-edge": "You stepped onto a deck sheet that had been laid but not fastened. An unfastened sheet is sitting on the beams by friction alone, and a boot near its end tips it off the steel like a plank — with the worker on it. Every sheet is fastened before it is walked on, and a sheet that has been laid out loose is a hole with a lid, not a floor.",
  },

  lateNotes: {
    "tensioner": "The lifeline is tensioned once both ends are on their stanchions — there is nothing to pull against yet.",
    "hll-traveller": "The traveller is clipped once the lifeline is tensioned, its sag measured and the clearance checked.",
    "edge-log": "The edge is logged once the sheet is fastened and the rescue kit confirmed — the log is the last thing.",
  },

  steps: [
    {
      id: "fall-plan", kind: "select", target: "fall-plan",
      title: "Read the fall-protection plan and the lifeline design",
      cue: "Read the plan: the leading-edge work, the lifeline's span, stanchion spacing, pretension and the number of workers it is designed for, the fall clearance, and the rescue method.",
      why: "A horizontal lifeline is an engineered system: the load it puts into its stanchions when a person falls on it can be several times the arresting force, and the sag it develops sets how far that person drops. 29 CFR 1926.502 requires it to be designed, installed and used under the supervision of a qualified person with a safety factor of at least two, and the plan is where that design lives — the span, the pretension, how many people it takes, and the clearance it needs below. Rigged from habit instead of the plan, it is a rope between two posts.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["harness", "srl-le"],
      itemNames: { harness: "full-body harness on and snugged", "srl-le": "leading-edge SRL clipped to the back D-ring" },
      outOfOrderNote: "Harness first — the leading-edge SRL clips to the back D-ring of a harness that is on and adjusted, not to one on the rack.",
      title: "Harness on, then the leading-edge SRL to the back D-ring",
      cue: "Put the full-body harness on and snug the leg and chest straps, then clip the leading-edge SRL to the back D-ring.",
      why: "The harness spreads the arrest force across the thighs, pelvis and chest, and it only does that if it is snug — a loose leg strap lets a falling body slide until the strap catches somewhere it should not. The SRL on the back D-ring is the leading-edge-rated type ANSI Z359 marks for a line that may be pulled over a steel edge in a fall, which a standard SRL is not built to survive. Harness on and adjusted first; the device clips to it second.",
    },
    {
      id: "gear-inspect", kind: "find", noHint: true,
      targets: ["cut-webbing"],
      itemNames: { "cut-webbing": "cut webbing on the spare shock-absorbing lanyard" },
      itemNotes: { "cut-webbing": "The spare lanyard in the bin has a clean nick through two-thirds of its webbing, a hand's width from the snap — it has been across a sheared deck edge. It is cut up and binned so nobody picks it up tomorrow." },
      title: "Inspect the fall-protection gear before it is used",
      cue: "Look over the lanyards, SRLs and connectors in the gear bin: cuts and burns in the webbing, deployed shock packs, snaps that do not close and lock.",
      why: "Fall-protection gear is inspected before each use because it fails invisibly until it is loaded: a lanyard with a cut through its webbing looks like every other lanyard in the bin, and it parts at the cut under the shock of a fall. The competent person removes anything cut, burned, deployed or corroded from service, and the gear that has been dragged across a deck edge is the gear most likely to be in the bin.",
    },
    {
      id: "stanchion-clamp", kind: "turn", target: "stanchion-clamp",
      title: "Torque the stanchion's beam clamp onto the flange",
      cue: "Seat the stanchion's clamp on the edge beam's flange and run the clamp screw up to the maker's figure.",
      why: "The stanchion is where a fall on the lifeline goes into the building, and its beam clamp is what holds it: the clamp is seated square on the flange and torqued to the figure because a clamp done up by feel can rotate on the flange when the lifeline loads it sideways, laying the stanchion over and adding its whole height to the fall. The flange is checked for the clamp's range before it goes on.",
      turn: { turns: 1.0, label: "CLAMP", readout: (t) => (t < 0.35 ? "seated" : t < 0.9 ? "pulling up" : "at figure") },
    },
    {
      id: "lifeline-run", kind: "drag", target: "lifeline-end",
      title: "Run the lifeline across to the far stanchion",
      cue: "Carry the lifeline's end across the decked side — not along the open edge — and connect it to the far stanchion's eye.",
      why: "The lifeline is run from the decked side of the bay, where there is a floor under the person carrying it, and connected at the far stanchion before anybody depends on it. Walking the line along the open edge to rig it is the moment people fall while installing their own fall protection, which is why the plan has the line rigged from inside the decked area and the connection made where the rigger can reach it standing on steel.",
      drag: { to: "far-stanchion", radius: 0.5, missNote: "Not on the far stanchion's eye — the lifeline end has to connect at the stanchion itself, carried there from the decked side." },
    },
    {
      id: "tension", kind: "track", target: "tensioner", seconds: 6,
      title: "Tension the lifeline to the designer's pretension",
      cue: "Take the lifeline up on its tensioner to the plan's pretension and hold it there while the lock is set — not slack, not bar-tight.",
      why: "Pretension is a trade-off the qualified person has already made: slack, the line sags a long way in a fall and the worker drops further than the clearance below allows; bar-tight, the line barely deflects and the forces it puts into the stanchions and the worker multiply. The tensioner is held at the plan's figure while the lock is set, because the lifeline's whole behaviour in a fall follows from that one number.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "PRETENSION", readout: (v) => (v < 0.4 ? "slack — too much sag" : v > 0.6 ? "bar-tight — anchor loads high" : "at design") },
      holdBreakNote: "The pretension broke out of the design band while the lock was being set — back the tensioner off and take it up to the figure again.",
    },
    {
      id: "sag-check", kind: "gauge", target: "sag-gauge",
      title: "Measure the lifeline's sag at midspan",
      cue: "Measure the unloaded sag at midspan against the plan's figure and commit the reading.",
      why: "The sag at rest is the check that the pretension is what the tensioner said it was: a lifeline sagging more than the plan's figure has lost tension or stretched, and it will deflect further than designed in a fall. It is measured at midspan, where the sag is greatest and where a fall puts the most load on the stanchions, and it is measured before anyone clips on because it is the last chance to find a line rigged wrong.",
      gauge: { label: "MIDSPAN SAG", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 400)} mm`, missNote: "Off the design figure — measure from the line to a straight edge between the stanchion eyes at midspan, not near an end." },
    },
    {
      id: "clearance", kind: "select", target: "clearance-chart",
      title: "Check the fall clearance below the edge",
      cue: "Add the lifeline's deflection, the SRL's arrest distance, the harness stretch, the worker's height and the safety margin, and check it against the drop to the next level.",
      why: "A fall-arrest system that stops a worker a metre below the floor they hit is not a fall-arrest system. The clearance adds every metre a fall uses — the lifeline's deflection, the leading-edge SRL's arrest distance, the harness and D-ring shift, the worker's height and a margin — and compares it with what is actually below the edge. The plan's chart does the arithmetic; the worker at the edge confirms nothing has changed underneath since it was drawn.",
    },
    {
      id: "connect", kind: "hold", target: "hll-traveller", seconds: 4,
      title: "Clip the SRL to the lifeline's traveller and check the gate",
      cue: "From behind the warning line, clip the leading-edge SRL's snap to the traveller on the lifeline and hold while you check the gate has closed and locked.",
      why: "The connection is made standing behind the warning line on the decked side, because the moment of clipping on is the one moment the worker is not yet protected. The snap is held and looked at until its gate has visibly closed and locked — a gate caught on the traveller's edge or on the webbing looks connected and falls open under load. Only then does anyone walk toward the edge.",
      holdBreakNote: "Walked off before the gate was checked closed and locked — a snap that is not locked is not a connection. Go back and check it.",
    },
    {
      id: "edge-find", kind: "find", noHint: true,
      targets: ["sharp-flange"],
      itemNames: { "sharp-flange": "sheared, knife-edged flange corner on the edge beam" },
      itemNotes: { "sharp-flange": "The edge beam's top flange has a flame-cut corner with a raw burr exactly where the SRL line would bend over the edge in a fall — a line loaded across that corner can be cut. It needs an edge protector or grinding before work at that spot." },
      title: "Look along the edge for anything that could cut the line",
      cue: "Walk the edge beam with your eyes: flame-cut corners, burrs, sheared deck ends — anywhere the SRL line would bend over in a fall.",
      why: "A leading-edge SRL is rated for a line pulled over a steel edge, but the rating assumes an ordinary edge, not a flame-cut corner with a burr on it — a sharp enough edge can cut a loaded line in the instant of a fall. The edge is looked at before work, for exactly the places the line would bend over it, and anything sharper than the device's rating is padded or dressed before anyone works there.",
    },
    {
      id: "edge-pad", kind: "select", target: "edge-pad",
      title: "Pad the sharp corner with an edge protector",
      cue: "Fit the edge protector over the flame-cut corner so that any line over the edge there bears on the pad, not the steel.",
      why: "An edge protector turns a knife edge back into the kind of edge the leading-edge device was tested on, and it is fitted before the work at that spot rather than after the first near miss. It is a simple fix to a failure that gives no warning — a line that looked fine until it was loaded — and it stays until the corner is dressed by the crew that cut it.",
    },
    {
      id: "rescue-kit", kind: "select", target: "rescue-kit",
      title: "Confirm the rescue kit and who uses it",
      cue: "Check the rescue kit is at the edge, and confirm who in the crew is trained to use it and how long a rescue would take.",
      why: "A worker hanging in a harness after an arrested fall is not safe — the straps restrict blood flow from the legs, and suspension becomes dangerous in minutes. 29 CFR 1926.502 has the employer provide for prompt rescue, which in practice means a rescue kit at the edge and someone on the crew trained to use it, not a phone call to a fire department whose ladder may not reach. It is checked before the work, because after a fall is too late to find out.",
    },
    {
      id: "deck-sheet", kind: "sequence",
      targets: ["deck-sheet", "deck-fastener"],
      itemNames: { "deck-sheet": "deck sheet laid out to the edge beam", "deck-fastener": "sheet fastened to the beams" },
      outOfOrderNote: "The sheet is laid before it can be fastened — and it is fastened before anyone steps onto it.",
      title: "Lay the next sheet and fasten it before stepping on it",
      cue: "Lay the next deck sheet out across the beams from the fastened deck, then fasten it down before a boot goes on it.",
      why: "Deck is laid from the fastened side outward, and each sheet is fastened to the beams before anyone walks on it — a sheet sitting loose on steel is a plank, and it tips. The worker stays tied to the lifeline the whole time, because laying the sheet is the work that happens right at the leading edge, with the open bay one step away.",
    },
    {
      id: "edge-log", kind: "select", target: "edge-log",
      title: "Log the lifeline, the findings and the edge",
      cue: "Record the lifeline's pretension and sag, the cut lanyard destroyed, the sharp flange padded, the welding stopped over the line, and the bay's progress.",
      why: "The competent person's log is how the next shift knows the lifeline they are clipping to is the one the qualified person designed, rigged to the same figures, and inspected — and it is where the sharp flange becomes a work order for the crew that cut it and the welding over the line becomes a coordination item. Written at the edge it is the record; written in the trailer it is a recollection.",
    },
    {
      id: "crew-checkin", kind: "select", target: "signal-radio",
      title: "Check in with the foreman and the crane signal",
      cue: "Call the foreman and the signal person: the lifeline is rigged and logged, the bay is decking, and check in with the crew after the bundle over the edge.",
      why: "The crane signal person and the foreman plan the next picks around where the deck crew is tied off, so this call keeps loads off the lifeline's span. It is also the crew's check-in: a bundle swung over a crew at the leading edge is a near miss that the people underneath carry for the rest of the day, and the building trades' practice is to name it on the radio and name the member assistance line with it.",
    },
  ],

  interrupts: [
    {
      id: "welding-over-line",
      kind: "Sparks falling on the lifeline",
      after: "tension", delay: 2, seconds: 14,
      alert: "A welder on the beam above has struck an arc cutting a clip, and the sparks are falling straight onto the synthetic lifeline you are tensioning.",
      cue: "Throw the fire blanket over the lifeline under the sparks and get the welder to stop until the line is shielded.",
      target: "fire-blanket",
      why: "A synthetic lifeline is a rope, and hot slag falling on it melts fibres invisibly — a line that looks fine after a shower of sparks can have lost a large part of its strength at the one spot the next fall will load. 29 CFR 1926.502 expects lifelines to be protected from cutting and abrasion, and hot work above one is exactly that; the blanket goes over the line now, and the welding waits until it is shielded.",
      missNote: "The sparks kept falling on the lifeline for a full minute; a hand's length of it glazed and hardened where the slag landed, and the line was rigged and clipped to as if nothing had happened.",
      wrongNote: "The fire blanket — the sparks are on the lifeline now, and shielding the line is the only thing that protects it.",
    },
    {
      id: "bundle-over-edge",
      kind: "Deck bundle swinging overhead",
      after: "connect", delay: 2, seconds: 14,
      alert: "The crane is swinging a deck bundle toward the landing, and its path is taking the bundle straight over you at the edge.",
      cue: "Call the signal person on the radio: stop the swing and bring the load around the crew, not over it.",
      target: "signal-radio",
      why: "A deck bundle on a crane hook is a suspended load, and ASME B30.5 keeps loads from passing over workers — the operator cannot see the edge crew under the boom, and the signal person is the operator's eyes. The call goes on the radio the moment the load heads for the crew, because a person clipped to a lifeline at a leading edge cannot step out of the way.",
      missNote: "The bundle swung over the edge crew with the lifeline between them and the open bay; a strap slipped and a sheet slid off the top of the bundle into the open bay a metre from the traveller.",
      wrongNote: "The signal radio — the load's path belongs to the crane, and the signal person is the only one who can stop it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, LEH_ACCENT);

    // ------------------------------------------------ decked bay and void
    const deckTex = surfaceTexture((cx, w, h) => {
      deckPlateFace(cx, w, h, { base: "#6d747b", base2: "#646b72", step: 64 });
      cx.fillStyle = "rgba(0,0,0,0.22)";
      for (let x = 0; x < w; x += w / 12) cx.fillRect(x, 0, w / 36, h);
    }, { repeat: 3, px: 512 });
    const deckMat = texturedMat(deckTex, { rough: 0.6, metal: 0.5, color: 0xc8ccd0 });
    const decked = box(g, 6.4, LEH_DECK, 2.8, 0, LEH_DECK / 2, 1.0, 0xffffff);
    decked.material = deckMat;
    // The open bay: beams at deck level, the floor far below.
    const bay = group(g, 0, LEH_DECK, -1.4);
    const beams = [];
    beams.push(box(bay, 6.4, 0.2, 0.14, 0, -0.1, 0.0, 0x9a5a2a, { rough: 0.7, metal: 0.4 }));
    beams.push(box(bay, 6.4, 0.2, 0.14, 0, -0.1, -2.0, 0x9a5a2a, { rough: 0.7, metal: 0.4 }));
    for (const x of [-1.6, 0, 1.6]) beams.push(box(bay, 0.1, 0.14, 2.0, x, -0.08, -1.0, 0x9a5a2a, { rough: 0.7, metal: 0.4 }));
    for (const x of [-3.0, 3.0]) {
      for (const z of [0, -2.0]) cyl(bay, 0.1, 0.1, 3.4, x, 0.2, z, 0x9a5a2a, { rough: 0.7, metal: 0.4, seg: 8 });
    }
    const below = box(bay, 6.4, 0.02, 2.0, 0, -1.6, -1.0, 0x3a3a36, { rough: 1.0, cast: false });
    void below;
    for (const [x, z] of [[-1.8, -0.6], [1.0, -1.4], [2.2, -0.5]]) box(bay, 0.5, 0.2, 0.4, x, -1.5, z, 0x5a5048, { rough: 1.0, cast: false });
    for (const sx of [-1, 1]) box(bay, 0.04, 1.6, 2.0, sx * 3.2, -0.8, -1.0, 0x2a2a28, { rough: 1.0, cast: false });
    box(bay, 6.4, 1.6, 0.04, 0, -0.8, -2.05, 0x2a2a28, { rough: 1.0, cast: false });
    // Warning line on the decked side.
    const wl = group(g, 0, LEH_DECK, -0.1);
    for (const x of [-2.6, -0.9, 0.9, 2.6]) cyl(wl, 0.015, 0.02, 0.95, x, 0.47, 0, 0x8a949d, { rough: 0.5, metal: 0.5, seg: 8 });
    hose(wl, [[-2.6, 0.9, 0], [0, 0.88, 0], [2.6, 0.9, 0]], 0.008, 0xd2312b, { steps: 8, rough: 0.7 });
    const pastLine = box(g, 1.0, 0.2, 0.3, -0.5, LEH_DECK + 0.1, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "past the line, not clipped?", -0.5, LEH_DECK + 0.6, -0.45, { css: "#d2312b", w: 0.52 });
    reg(hits, pastLine, "past-the-line-untied");
    // The edge beam's sharp flange corner.
    const flange = box(bay, 0.1, 0.03, 0.06, 1.1, 0.01, 0.06, 0xd8dde2, { rough: 0.3, metal: 0.9 });
    reg(hits, flange, "sharp-flange");
    const pad = box(bay, 0.3, 0.05, 0.14, 1.1, 0.03, 0.06, 0x2b2b30, { rough: 0.9 });
    pad.visible = false;
    const padKit = group(g, 1.9, LEH_DECK, 0.6);
    box(padKit, 0.3, 0.06, 0.2, 0, 0.03, 0, 0x2b2b30, { rough: 0.9 });
    box(padKit, 0.3, 0.02, 0.2, 0, 0.07, 0, 0xf2c14b, { rough: 0.8 });
    holoTag(padKit, "edge protector", 0, 0.35, 0, { css: LEH_CSS, w: 0.3 });
    reg(hits, padKit, "edge-pad");

    // ------------------------------------------------- lifeline system
    const stanL = group(g, -2.3, LEH_DECK, -1.4);
    const stanR = group(g, 2.3, LEH_DECK, -1.4);
    for (const s of [stanL, stanR]) {
      box(s, 0.24, 0.08, 0.2, 0, 0.02, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
      cyl(s, 0.035, 0.04, 1.3, 0, 0.7, 0, 0xf2c14b, { rough: 0.5, metal: 0.5, seg: 10 });
      torus(s, 0.04, 0.01, 0, 1.36, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    }
    const clampScrew = group(stanL, 0.14, 0.03, 0);
    cyl(clampScrew, 0.015, 0.015, 0.14, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    box(clampScrew, 0.02, 0.08, 0.02, 0.08, 0, 0, 0x14171a, { rough: 0.6 });
    holoTag(stanL, "beam clamp — torque", 0, 0.4, 0.25, { css: LEH_CSS, w: 0.38 });
    reg(hits, clampScrew, "stanchion-clamp");
    const farEye = torus(stanR, 0.1, 0.012, 0, 1.36, 0, LEH_ACCENT, { emissive: LEH_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holoTag(stanR, "far stanchion eye", 0, 1.7, 0, { css: LEH_CSS, w: 0.34 });
    reg(hits, farEye, "far-stanchion");
    const coil = group(g, -1.6, LEH_DECK, 0.3);
    for (let i = 0; i < 4; i++) torus(coil, 0.16 + i * 0.012, 0.012, 0, 0.03 + i * 0.02, 0, 0x2f6fd0, { rough: 0.8, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    holoTag(coil, "lifeline end", 0, 0.35, 0, { css: LEH_CSS, w: 0.26 });
    reg(hits, coil, "lifeline-end");
    const lifeline = hose(g, [[-2.3, LEH_DECK + 1.36, -1.4], [0, LEH_DECK + 1.22, -1.4], [2.3, LEH_DECK + 1.36, -1.4]], 0.012, 0x2f6fd0, { steps: 14, rough: 0.8 });
    lifeline.visible = false;
    const tensioner = group(stanL, 0.2, 1.3, 0);
    box(tensioner, 0.18, 0.08, 0.08, 0, 0, 0, 0xd2312b, { rough: 0.5, metal: 0.4 });
    cyl(tensioner, 0.01, 0.01, 0.16, 0.05, 0.08, 0, 0x14171a, { rough: 0.6, seg: 6 });
    holoTag(tensioner, "tensioner — hold", 0, 0.3, 0, { css: LEH_CSS, w: 0.34 });
    reg(hits, tensioner, "tensioner");
    const absorber = box(stanR, 0.2, 0.06, 0.06, -0.16, 1.36, 0, 0x2b2b30, { rough: 0.8 });
    void absorber;
    const traveller = group(g, -0.4, LEH_DECK + 1.25, -1.4);
    torus(traveller, 0.05, 0.012, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    box(traveller, 0.06, 0.08, 0.04, 0, -0.06, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    holoTag(traveller, "traveller — clip + check", 0, 0.3, 0.1, { css: LEH_CSS, w: 0.42 });
    reg(hits, traveller, "hll-traveller");
    const sagGauge = instrument(g, 0.4, LEH_DECK + 0.95, -0.55, { ry: 0.1, idle: "-- mm", color: LEH_ACCENT, w: 0.1, d: 0.14 });
    cyl(g, 0.02, 0.02, 0.9, 0.4, LEH_DECK + 0.45, -0.55, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(sagGauge, "sag gauge", 0, 0.16, 0, { css: LEH_CSS, w: 0.22 });
    reg(hits, sagGauge, "sag-gauge");
    const feetHit = box(bay, 0.3, 0.12, 0.2, -1.2, 0.06, 0.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "SRL anchored at your feet?", -1.2, 0.5, 0.2, { css: "#d2312b", w: 0.52 });
    reg(hits, feetHit, "tie-off-at-feet");
    const conduit = group(bay, 3.0, 0.2, 0.14);
    cyl(conduit, 0.02, 0.02, 1.6, 0, 0.2, 0, 0x9aa0a6, { rough: 0.4, metal: 0.7, seg: 8 });
    for (let i = 0; i < 3; i++) box(conduit, 0.05, 0.02, 0.05, 0, -0.4 + i * 0.5, 0, 0x6a7078, { rough: 0.5, metal: 0.6 });
    holoTag(conduit, "clip to the conduit?", -0.4, 0.8, 0.1, { css: "#d2312b", w: 0.42 });
    reg(hits, conduit, "handrail-anchor");

    // ----------------------------------------------------- deck sheets
    const bundle = group(g, 1.2, LEH_DECK, 1.6);
    for (let i = 0; i < 6; i++) box(bundle, 2.0, 0.025, 0.6, 0, 0.02 + i * 0.03, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    for (const x of [-0.8, 0.8]) box(bundle, 0.05, 0.2, 0.62, x, 0.1, 0, 0x2b2b30, { rough: 0.8 });
    const sheet = group(bay, -0.8, 0.02, -0.5);
    box(sheet, 1.6, 0.02, 0.6, 0, 0, 0, 0xa8aeb4, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 5; i++) box(sheet, 0.04, 0.03, 0.6, -0.7 + i * 0.35, -0.02, 0, 0x8a9096, { rough: 0.5, metal: 0.6 });
    sheet.visible = false;
    const sheetHit = box(bay, 1.6, 0.06, 0.6, -0.8, 0.03, -0.5, LEH_ACCENT, { opacity: 0.25, transparent: true, emissive: LEH_ACCENT, ei: 0.5, cast: false });
    holoTag(bay, "next sheet", -0.8, 0.35, -0.5, { css: LEH_CSS, w: 0.22 });
    reg(hits, sheetHit, "deck-sheet");
    const loose = box(bay, 0.6, 0.06, 0.5, 1.8, 0.03, -0.5, 0xa8aeb4, { rough: 0.5, metal: 0.6 });
    holoTag(bay, "step on the loose sheet?", 1.8, 0.35, -0.5, { css: "#d2312b", w: 0.48 });
    reg(hits, loose, "loose-sheet-edge");
    const gun = group(g, -0.6, LEH_DECK, 0.7, 0.4);
    box(gun, 0.08, 0.3, 0.08, 0, 0.35, 0, 0xe8b02e, { rough: 0.5 });
    box(gun, 0.2, 0.08, 0.08, 0.06, 0.52, 0, 0x2b2b30, { rough: 0.5 });
    cyl(gun, 0.02, 0.02, 0.4, 0, 0.12, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(gun, "deck fastener", 0, 0.8, 0, { css: LEH_CSS, w: 0.28 });
    reg(hits, gun, "deck-fastener");

    // ---------------------------------------- crane hook and the welder
    const hook = group(g, -6.0, 3.2, -0.5);
    cyl(hook, 0.012, 0.012, 1.6, 0, 0.8, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    torus(hook, 0.08, 0.02, 0, 0, 0, 0xe8b02e, { rough: 0.4, metal: 0.6, seg: 6, seg2: 12 });
    for (let i = 0; i < 4; i++) box(hook, 1.8, 0.025, 0.6, 0, -0.5 + i * 0.03, 0, 0x9aa0a6, { rough: 0.5, metal: 0.6 });
    hook.visible = false;
    const welder = standingFigure(g, 2.9, -3.2, { ry: -2.8, cloth: 0x3a2a1e, helmet: 0x14171a, gloves: true, atStation: true });
    welder.position.y = LEH_DECK + 0.1;
    const sparks = particles(g, 60, 0xffc860, { size: 0.03, life: 0.6, additive: true, opacity: 0.9 });
    sparks.position.set(0.9, LEH_DECK + 1.6, -1.4);
    sparks.visible = false;
    const sparkOrigin = new THREE.Vector3(0, 0.35, 0);
    const arc = ball(g, 0.05, 0.9, LEH_DECK + 2.0, -1.4, 0xdfefff, { emissive: 0xdfefff, ei: 3.0 });
    arc.visible = false;
    const blanket = box(g, 0.8, 0.02, 0.4, 0.9, LEH_DECK + 1.3, -1.4, 0x6a6a5a, { rough: 1.0 });
    blanket.visible = false;
    const blanketRoll = group(g, -2.6, LEH_DECK, 0.9);
    cyl(blanketRoll, 0.1, 0.1, 0.5, 0, 0.1, 0, 0x6a6a5a, { rough: 1.0, seg: 12 }).rotation.z = Math.PI / 2;
    holoTag(blanketRoll, "fire blanket", 0, 0.4, 0, { css: LEH_CSS, w: 0.24 });
    reg(hits, blanketRoll, "fire-blanket");

    // ------------------------------------------------ gear, kit and paper
    const rack = group(g, -2.7, LEH_DECK, 2.0, 0.6);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.6, 0.03, 0.03, 0, 1.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const harness = group(rack, -0.16, 1.05, 0.02);
    box(harness, 0.05, 0.5, 0.02, -0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harness, 0.05, 0.5, 0.02, 0.05, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harness, 0.2, 0.05, 0.02, 0, -0.14, 0, 0xe07a3f, { rough: 0.8 });
    holoTag(rack, "harness", -0.16, 1.6, 0, { css: LEH_CSS, w: 0.2 });
    reg(hits, harness, "harness");
    const srl = group(rack, 0.18, 1.12, 0.03);
    cyl(srl, 0.09, 0.09, 0.06, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    box(srl, 0.04, 0.06, 0.04, 0, 0.1, 0, 0x2b3138, { rough: 0.5 });
    decal(srl, 0.1, 0.04, 0, 0, 0.035, signFace("SRL-LE", { accent: "#f2c14b", scale: 0.5 }), { px: 128 });
    holoTag(rack, "leading-edge SRL", 0.2, 1.5, 0, { css: LEH_CSS, w: 0.32 });
    reg(hits, srl, "srl-le");
    const bin = group(g, -2.0, LEH_DECK, 1.9, -0.2);
    box(bin, 0.6, 0.3, 0.4, 0, 0.15, 0, 0x2f4f6f, { rough: 0.6 });
    hose(bin, [[-0.2, 0.3, 0], [0, 0.34, 0.08], [0.22, 0.31, -0.05]], 0.012, 0xe07a3f, { steps: 8, rough: 0.8 });
    const nick = box(bin, 0.05, 0.03, 0.03, 0.02, 0.35, 0.08, 0x5a1a0a, { rough: 0.9 });
    reg(hits, nick, "cut-webbing");
    holoTag(bin, "gear bin", 0, 0.5, 0, { css: LEH_CSS, w: 0.2 });
    const rescue = group(g, 2.6, LEH_DECK, 1.4, -0.4);
    box(rescue, 0.4, 0.4, 0.3, 0, 0.2, 0, 0xd2312b, { rough: 0.6 });
    decal(rescue, 0.3, 0.12, 0, 0.3, 0.16, signFace("RESCUE", { accent: "#ffffff", scale: 0.5 }), { px: 128 });
    holoTag(rescue, "rescue kit", 0, 0.65, 0, { css: LEH_CSS, w: 0.22 });
    reg(hits, rescue, "rescue-kit");
    const plan = holoPanel(g, 0.95, 0.66, -2.3, 1.6, -0.2, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = LEH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("FALL PROTECTION PLAN — BAY C4", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["HLL: 2 beam-clamp stanchions · synthetic line", "Designed by the qualified person · 2 workers max", "Pretension + midspan sag per design sheet", "SRL-LE only at the edge · back D-ring",
       "Clearance: see chart · rescue kit at the edge", "Loads never over the edge crew"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.8, accent: LEH_ACCENT });
    reg(hits, plan, "fall-plan");
    const chart = holoPanel(g, 0.5, 0.4, 2.7, 1.5, -0.1, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = LEH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("FALL CLEARANCE", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["HLL deflection + SRL-LE arrest", "+ harness + height + margin", "< drop to level below"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.8, accent: LEH_ACCENT });
    reg(hits, chart, "clearance-chart");
    const log = holoPanel(g, 0.6, 0.42, 2.0, 1.35, 2.3, (cx, w, h) => {
      cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = LEH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf0c8"; cx.fillText("LEADING EDGE LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fbf6e4";
      ["HLL: —", "Findings: —", "Bay C4: OPEN EDGE"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.5, accent: LEH_ACCENT });
    reg(hits, log, "edge-log");
    const chest = toolChest(g, 0.4, 2.35, { ry: 3.1, color: 0x2f4f6f });
    const radio = instrument(chest, 0.14, 0.79, 0.04, { ry: 0.1, idle: "CH 4 · SIGNAL", color: LEH_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "signal radio", 0, 0.16, 0, { css: LEH_CSS, w: 0.26 });
    reg(hits, radio, "signal-radio");
    chest.position.y = LEH_DECK;

    // ------------------------------------------------------------- crew
    const partner = standingFigure(g, -1.0, 1.55, { ry: 2.6, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0xf2c14b, harness: true, gloves: true });
    partner.position.y = LEH_DECK;
    holoTag(partner, "decking partner", 0, 1.95, 0, { css: LEH_CSS, w: 0.32 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "gear-inspect") nick.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8 });
        if (step.id === "lifeline-run") { lifeline.visible = true; coil.visible = false; }
        if (step.id === "sag-check") repaint(sagGauge.userData.screen, signFace("ON DESIGN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "edge-find") flange.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.4 });
        if (step.id === "edge-pad") { pad.visible = true; padKit.visible = false; }
        if (step.id === "deck-sheet") { sheet.visible = true; sheetHit.visible = false; }
        if (step.id === "edge-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1a1606"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf0c8"; cx.fillText("LEADING EDGE LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["HLL: pretension + sag on design", "Lanyard destroyed · flange padded", "Bay C4: decking · welding coordinated"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("EDGE LOGGED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "welding-over-line") { sparks.visible = true; arc.visible = true; }
        if (it.id === "bundle-over-edge") { hook.visible = true; hook.position.set(-0.4, LEH_DECK + 2.6, -1.2); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "welding-over-line") { blanket.visible = true; sparks.visible = false; arc.visible = false; }
        if (it.id === "bundle-over-edge") hook.position.set(-3.4, LEH_DECK + 2.6, 2.6);
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "stanchion-clamp") clampScrew.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "sag-check") repaint(sagGauge.userData.screen, signFace(`${Math.round(gg.t * 400)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "tension" && session.holding) tensioner.rotation.z = (session.track.v - 0.5) * 0.4;
        if (sparks.visible) sparks.userData.step(dt ?? 0.016, sparkOrigin, 0.08, 0.6, -3.0);
        if (arc.visible) arc.scale.setScalar(0.7 + 0.3 * Math.abs(Math.sin(t * 23)));
        void CITY; void paperFace;
      },
    };
  },
};
