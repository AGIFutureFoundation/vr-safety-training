import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace,
} from "../citykit.js";
import { workboat, spudBarge } from "../../../shared/fleet.js";
import { excavator } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Turbidity Curtain Deployment VR — SF Bay Restoration &
// Cleanup, pack D (contaminated sediment and water quality).
//
// Before a barge-mounted excavator can dig contaminated sediment, a floating
// turbidity curtain has to close the water round it: sections checked on the
// staging float, anchors set from upcurrent, the curtain towed out slow
// behind a workboat, its skirt made to hang clear of the bottom at the
// lowest tide the design allows for, the shore end sealed, background
// turbidity read upcurrent, and only then the dredge released. The learner is
// the LIUNA Local 261 curtain crew lead on the float; an Inlandboatmen's Union
// skipper runs the workboat and an IUOE Local 3 operator waits on the barge.
// Skirt depth, tow speed and turbidity limits are never numbers here — they
// read against "the design", "the tide table" and "the certification". A PFD
// is worn on the float and the boat at every step.

const BRTC_ACCENT = 0x3fa9c9;

export const SIM_BR_TURBIDITY_CURTAIN_DEPLOYMENT = {
  id: "br-turbidity-curtain-deployment",
  index: "BR-D2",
  domain: "Environmental",
  trade: "LIUNA Local 261 curtain crew lead on the staging float, with an Inlandboatmen's Union skipper on the workboat and an IUOE Local 3 operator on the barge-mounted excavator",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA Local 261 shoreline and environmental remediation crew training (LIUNA Training and Education Fund); Inlandboatmen's Union deck practice for the workboat skipper; IUOE Local 3 operating engineer on the barge-mounted excavator the curtain encloses; the Regional Water Quality Control Board's Section 401 water quality certification, which judges turbidity at the compliance point against background; Army Corps Section 404 permit conditions for the dredging; BCDC permit conditions for work in the Bay; NOAA tide predictions for the skirt clearance; OSHA HAZWOPER, 29 CFR 1910.120, for work over contaminated sediment; DMMO testing of the material the curtain keeps in place; EPA QA/G-5 field records for the turbidity readings",
  name: "Turbidity Curtain Deployment",
  title: simTitle("Turbidity Curtain Deployment"),
  tagline: "Closing the water round a dredge before it digs: the curtain design and the certification read, sections checked on the float, the skirt read against the tide table, the upcurrent anchor lowered and the lead end shackled, the curtain towed out slow while a line fouls the prop, anchors set down the line, the skirt sounded while the shore end opens, background read, the dredge released, the line walked, logged and the crew checked in",
  accent: BRTC_ACCENT,
  accentCss: "#3fa9c9",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "closed-loop", name: "Closed Loop", note: "The curtain closed from anchor to shore with the skirt clear of the bottom before the first bucket, and the shore gap sealed the moment it opened" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261, the Inlandboatmen's Union or IUOE Local 3 — with the employer's employee assistance line behind it",

  game: system({
    name: "Curtain Line",
    currency: "SECTION",
    ranks: ["Float Hand", "Curtain Hand", "Curtain Lead", "Containment Foreman", "Curtain Line Certified"],
    badges: [
      { id: "read-the-tide", name: "Read The Tide", note: "The design read and the skirt set against the tide table clean", test: AWARD.all(AWARD.stepClean("curtain-plan"), AWARD.stepClean("skirt-vs-tide")) },
      { id: "never-in-the-bight", name: "Never In The Bight", note: "Never in a bight, never a hand on a running line, never the curtain opened for a shortcut", test: AWARD.safe },
      { id: "true-background", name: "True Background", note: "Tide and background both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-deploy", name: "Clean Deploy", note: "No corrections from the design to the check-in", test: AWARD.clean },
      { id: "slow-tow", name: "Slow Tow", note: "The tow held in band the whole way out", test: AWARD.unbroken },
      { id: "released-early", name: "Released Early", note: "Curtain logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stand-in-bight": "You stood in the bight of the anchor line on the float as the workboat took up the tow. A line coming under strain straightens along the shortest path between the boat and the anchor, and anyone standing inside the loop it makes is swept off the float with it. Line is handled from outside the bight, and the float crew calls the boat to stop before stepping over one.",
    "hand-on-running-line": "You went to guide the anchor line through the davit block with a hand while the winch was paying it out. A running line pulls a glove into the block faster than anyone can let go, and the davit does not stop because a hand is in it. The winch brake and the fairlead guide the line; hands come off it before the winch turns.",
    "open-curtain-shortcut": "You went to unclip a curtain connector so the workboat could cut through to the barge instead of going round. An open section is a gap in the only boundary between the dredging and the Bay, and the plume goes out through it on the next tide whether or not the boat is still there. The boat goes round the anchor buoys; the curtain is opened only under the design's own procedure, with the dredge stopped.",
    "reach-over-rail": "You leaned out over the float's edge to grab a drifting float section by hand. Cold bay water and a wind chop turn a lean into a man overboard in one wave, and a curtain section full of water is too heavy to hold onto from the edge. Drifting gear is brought in with the boat hook from a braced stance, or left for the boat.",
  },

  lateNotes: {
    "lead-end": "Shackle the curtain's lead end on once the upcurrent anchor is down and holding — a curtain made fast to an anchor still swinging on the davit just drags the whole line off its alignment.",
    "tow-throttle": "The tow starts once the lead end is shackled to the anchor buoy — towing a curtain with nothing holding its first end streams it away on the current.",
    "background-meter": "Background is read once the curtain is closed and sounded — the reading is the reference the compliance point is judged against for the whole dig.",
    "curtain-log": "The curtain log is written after the line walk — it records what the walk found as well as how the curtain went in.",
  },

  steps: [
    {
      id: "curtain-plan", kind: "select", target: "curtain-plan",
      title: "Read the curtain design and the certification's turbidity conditions",
      cue: "At the board: the curtain alignment and anchor marks, the skirt depth for this reach, the compliance point outside the curtain, and where background is read.",
      why: "The Section 401 certification does not say keep the water clean; it says turbidity at a compliance point outside the work may not rise past background by more than it allows, and the curtain design is how the job meets that. The alignment, the anchor marks and the skirt depth all come from the design for this reach, and a crew that improvises any of them has built a curtain nobody sized.",
    },
    {
      id: "gear-up", kind: "sequence", anyOrder: true,
      targets: ["gear-pfd", "gear-helmet", "gear-knife"],
      itemNames: { "gear-pfd": "work vest PFD", "gear-helmet": "hard hat", "gear-knife": "line knife on the vest" },
      title: "Gear up for the float and the boat",
      cue: "Work vest PFD on and zipped, hard hat, and a line knife clipped where either hand reaches it.",
      why: "Everyone on the staging float and the workboat is working at the edge of cold, moving water with lines under strain, so the PFD is worn and fastened for every step, not carried. The hard hat is for a davit and swinging anchor hardware overhead, and the line knife is on the vest because a line fouled round a leg or a prop is cut in the first seconds or not at all.",
    },
    {
      id: "section-check", kind: "find", noHint: true,
      targets: ["float-crushed", "connector-pin"],
      itemNames: { "float-crushed": "a crushed flotation segment", "connector-pin": "an end connector with its pin missing" },
      itemNotes: {
        "float-crushed": "One section's float is crushed flat along a third of its length — it will ride low, let the top of the curtain go under in a chop, and the plume will pass over it.",
        "connector-pin": "An end connector has no pin through its slot. That joint will pull apart the first time the tide loads the curtain, and it opens a gap in the middle of the line where nobody is watching.",
      },
      title: "Check the curtain sections on the float",
      cue: "Walk the staged sections: every float riding full, every skirt and ballast chain whole, every end connector pinned.",
      why: "A turbidity curtain is only as tight as its weakest section, and the ways a section fails — a crushed float, a torn skirt, a connector without its pin — are all visible on the float and invisible once it is in the water. Finding them now costs a spare section; finding them after the dig starts costs a gap in the boundary during the one operation it exists for.",
    },
    {
      id: "skirt-vs-tide", kind: "gauge", target: "tide-board",
      title: "Read the tide against the skirt the design calls for",
      cue: "Read the tide board and the day's NOAA prediction, and commit the reading against the design's skirt clearance for the lowest water in the working window.",
      why: "A skirt that reaches the bottom at low tide drags in the contaminated sediment, stirs it up and pins the curtain, which then fails as the tide rises against it; a skirt too short leaves a gap underneath for the plume. The design sets the skirt for this reach against the tide range, and reading the tide board against the prediction confirms today's window is one the design covered.",
      gauge: { label: "TIDE vs SKIRT", speed: 0.66, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "too low — skirt on the bottom" : t <= 0.58 ? "inside the design's window" : "board still surging"), missNote: "Outside the band — let the board settle between swells and read it against the tide table for the lowest water of the window." },
    },
    {
      id: "lower-anchor", kind: "turn", target: "davit-winch",
      title: "Lower the upcurrent anchor on the davit",
      cue: "At the upcurrent mark, wind the davit winch down steadily until the anchor is on the bottom and the line slacks.",
      why: "The curtain is laid from its upcurrent end so the current streams it down along its alignment instead of peeling it off; the upcurrent anchor goes down first and holds everything that follows. It is lowered on the winch, steadily and all the way, so it lands at the surveyed mark and bites rather than being dropped and dragged into place.",
      turn: { turns: 1.5, label: "DAVIT WINCH", readout: (t) => (t < 0.3 ? "anchor at the rail" : t < 0.9 ? "paying out" : "on the bottom — line slack") },
    },
    {
      id: "shackle-lead", kind: "drag", target: "lead-end",
      title: "Shackle the curtain's lead end to the anchor buoy",
      cue: "Carry the curtain's lead end to the anchor buoy's pendant and shackle it on, pin moused.",
      why: "The lead end is what the whole line pulls against once the current loads it, so it is shackled to the buoy pendant with the pin moused — not tied, not clipped with a carabiner that will open under a twisting load. A lead end that lets go takes the whole curtain downcurrent in a single piece, which is the most expensive way to find out a shackle was not closed.",
      drag: { to: "anchor-buoy-up", radius: 0.55, missNote: "Not on the buoy's pendant — the lead end is shackled at the upcurrent anchor buoy, where the line will pull from." },
    },
    {
      id: "tow-out", kind: "track", target: "tow-throttle", seconds: 7,
      title: "Tow the curtain out along its alignment",
      cue: "Call the skipper's throttle: dead slow along the alignment, the curtain streaming straight behind, no surge.",
      why: "A curtain towed fast planes up on its floats, rolls the skirt up behind it and can twist a whole section into a rope; towed too slow in a current, it sags into a belly and drifts off the line. Dead slow and steady keeps the skirt hanging and the curtain on the alignment the anchors were placed for, so it lands where the design put it.",
      track: { start: 0.14, green: [0.38, 0.56], rise: 0.56, fall: 0.46, drift: 0.13, label: "TOW THROTTLE", readout: (v) => (v < 0.38 ? "bellying on the current" : v > 0.56 ? "planing — skirt rolling up" : "dead slow — streaming straight") },
      holdBreakNote: "The tow surged and the curtain rolled behind it. Ease back to dead slow and let it stream straight again.",
    },
    {
      id: "set-anchors", kind: "sequence",
      targets: ["anchor-2", "anchor-3", "shore-anchor"],
      itemNames: { "anchor-2": "anchor 2 down the line", "anchor-3": "anchor 3 at the downcurrent turn", "shore-anchor": "the shore anchor on the bulkhead" },
      title: "Set the anchors down the line to the shore",
      cue: "Anchor 2, then anchor 3 at the downcurrent turn, then make the tail fast at the shore anchor — in that order.",
      why: "Each anchor takes the curtain's load in turn from upcurrent, so they go down in the order the current reaches them. Set out of order, the current is holding a section that is not yet anchored and drags the one before it off its mark; the shore end goes last because it closes the loop, and a loop closed before the line is anchored is a loop pulled out of shape.",
      outOfOrderNote: "Out of order — the anchors go down in the order the current loads them: anchor 2, anchor 3, then the shore end last.",
    },
    {
      id: "sound-skirt", kind: "hold", target: "skirt-probe", seconds: 5,
      title: "Sound the skirt at the deepest section",
      cue: "Hold the sounding pole down along the skirt at the curtain's deepest point until it reads steady — skirt hanging, clear of the bottom.",
      why: "The skirt's hang is checked in the water, not assumed from the deck: a skirt folded back on itself, twisted round the ballast chain or already touching the bottom at this tide is found only by sounding it. Holding the pole steady at the deepest section gives a reading the log can record, which is what the certification's monitoring will lean on if a reading at the compliance point is questioned.",
      holdBreakNote: "The pole came off the skirt before it read steady. Hold it down along the skirt at the deepest point until the reading settles.",
    },
    {
      id: "background", kind: "gauge", target: "background-meter",
      title: "Read background turbidity upcurrent",
      cue: "At the background station upcurrent of the curtain, read the meter and commit it as the day's reference.",
      why: "Every compliance reading today is judged against background — the water the work has not touched — so background is read upcurrent of the curtain, at the station the design names, with the meter calibrated and settled. A background taken downcurrent or in the prop wash makes the compliance point look clean when it is not, and the certification's whole test depends on this number being honest.",
      gauge: { label: "BACKGROUND", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "meter still settling" : t <= 0.6 ? "steady background" : "prop wash in the reading"), missNote: "Outside the band — let the meter settle out of the prop wash and read background again at the upcurrent station." },
    },
    {
      id: "release", kind: "select", target: "release-flag",
      title: "Release the dredge to dig inside the curtain",
      cue: "Raise the green flag to the barge: the curtain is closed, sounded and background is in — the operator may start.",
      why: "The IUOE operator on the barge cannot see the curtain's far end or the skirt under the water, and starts digging on the float crew's release. The release is given only once the loop is closed, the skirt sounded and background read, because a bucket that goes in before any of those is digging into a boundary that does not yet exist.",
    },
    {
      id: "line-walk", kind: "find", noHint: true,
      targets: ["debris-fouled", "float-riding-under"],
      itemNames: { "debris-fouled": "a raft of debris caught against the curtain", "float-riding-under": "a section riding under at the downcurrent turn" },
      itemNotes: {
        "debris-fouled": "Driftwood and trash have piled against the curtain on the current; the load is pulling that section down and bellying it toward the barge.",
        "float-riding-under": "At the downcurrent turn one section is riding under the surface — its top is below the water and anything on the surface passes over it.",
      },
      title: "Walk the curtain line from the float",
      cue: "Look along the whole line: debris loading it, any section riding under, any connector gaping.",
      why: "A curtain in a current is loaded all the time, and what goes wrong with it builds slowly: debris piles against it, a section drowns at a turn where the load is greatest. The line walk after the dig starts finds these while they are still a boat-hook job, before the belly becomes a gap and the gap becomes a plume at the compliance point.",
    },
    {
      id: "curtain-log", kind: "select", target: "curtain-log",
      title: "Write the curtain log",
      cue: "Log the sections set and the one swapped out, the tide and skirt reading, the anchors in order, the fouled prop, the shore gap and its fix, background, the release time and the line walk.",
      why: "The curtain log is the record that the boundary existed when the dredge started and stayed intact while it worked, and it is what the Water Board and the Corps read if the compliance point ever shows a spike. The shore gap and its fix are written with their times, because a gap logged with its response is a controlled event and one left out is an unexplained exceedance.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the skipper and the operator",
      cue: "On the radio: the curtain is logged and holding, who walks it next and when, and how the skipper and the float crew are after a fouled prop in a chop.",
      why: "The skipper cleared a line from a prop in a chop, and the float crew spent the morning on a moving edge beside cold water. The check-in says out loud who watches the curtain through the tide change, and it is also the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "line-in-the-prop",
      kind: "Tow line fouling the prop",
      after: "tow-out", delay: 3, seconds: 13,
      alert: "The slack in the tow bridle has drifted under the stern — the outboard is labouring and the line is winding onto the prop.",
      cue: "Pull the engine kill switch: stop the prop before it winds the line and the curtain in.",
      target: "engine-kill",
      why: "A line winding onto a turning prop pulls whatever it is attached to — the curtain, a deckhand's leg — straight into the stern, and the throttle does not stop the prop fast enough. The kill switch does, in one pull. Only once the prop is dead does anyone reach for the line, from the boat, with the knife.",
      missNote: "The prop kept turning and wound the bridle and a metre of curtain skirt round the hub before the engine stalled; the boat was dead in the current with the curtain dragging it off the alignment.",
      wrongNote: "The engine kill switch — stop the prop first; the line is cleared only once it has stopped turning.",
    },
    {
      id: "shore-end-open",
      kind: "Gap opening at the shore end",
      after: "sound-skirt", delay: 2, seconds: 14,
      alert: "The tide has swung the curtain's tail off the bulkhead — there is a widening gap of open water at the shore end and a brown thread running out through it.",
      cue: "Reseat the shore-end clamp on the bulkhead rail and close the gap.",
      target: "shore-clamp",
      why: "The shore end is where a curtain most often fails, because the bulkhead is hard, the tide moves along it and a clamp that was snug at one water level is loose at another. A gap there is a straight path out for everything the curtain was holding, and it is closed now, with the clamp reseated, before the dredge is released into a loop that is open at one end.",
      missNote: "The gap stayed open through the change of tide; the thread of sediment reached the compliance point and the day's first reading was an exceedance before the dredge had dug a bucket.",
      wrongNote: "The shore-end clamp — the gap is at the bulkhead, and reseating the clamp is what closes it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRTC_ACCENT);

    // ------------------------------------------------ staging float, water
    const float = box(g, 9, 0.12, 4.4, 0, 0.06, 0.6, 0xffffff, { rough: 0.85 });
    float.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#4a4a44", base2: "#3e3e38", step: 20 }), { repeat: 4, px: 512 }), { rough: 0.85, metal: 0.25, color: 0xcfc8bc });
    box(g, 9, 0.06, 0.1, 0, 0.15, -1.6, CITY.hiVis, { rough: 0.6 });
    const water = box(g, 18, 0.02, 12, 0, 0.004, -7.6, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#11262e", mid: "#163039", crest: 360 }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8aa8b2 });
    // Bulkhead to the right, where the shore anchor is.
    box(g, 1.2, 0.5, 6, 5.2, 0.25, -3.6, 0x8b8a86, { rough: 0.9 });

    // ---------------------------------------------------------- the workboat
    const boat = workboat(g, 0.3, -0.45, -3.2, { ry: Math.PI / 2 });
    const { outboards } = boat.userData.parts;
    const skipper = standingFigure(g, 1.2, -3.0, { ry: -1.6, atStation: true, cloth: 0x243a4a, vest: 0xf06a2b, helmet: 0xf2f2ee });
    skipper.position.y = 0.72;
    holoTag(g, "workboat skipper", 1.2, 2.8, -3.0, { css: "#3fa9c9", w: 0.32 });
    // Controls the float crew reaches across to: throttle, kill switch, davit winch.
    const helm = group(g, 1.9, 0.72, -2.1);
    box(helm, 0.3, 0.5, 0.2, 0, 0.25, 0, 0x2b3138, { rough: 0.55, metal: 0.3 });
    const throttle = group(helm, 0.05, 0.52, 0.05);
    box(throttle, 0.04, 0.2, 0.04, 0, 0.1, 0, 0xd2312b, { rough: 0.4 });
    holoTag(helm, "tow throttle", 0, 0.85, 0, { css: "#3fa9c9", w: 0.26 });
    reg(hits, throttle, "tow-throttle");
    const kill = group(g, 2.35, 0.72, -2.05);
    box(kill, 0.14, 0.14, 0.1, 0, 0.4, 0, 0xf2c14b, { rough: 0.5 });
    const lanyard = cyl(kill, 0.012, 0.012, 0.35, 0, 0.2, 0.06, 0xd2312b, { rough: 0.6, seg: 6 });
    holoTag(kill, "engine kill switch", 0, 0.66, 0, { css: "#3fa9c9", w: 0.34 });
    reg(hits, kill, "engine-kill");
    const winch = group(g, -1.3, 0.72, -2.2);
    box(winch, 0.26, 0.26, 0.26, 0, 0.13, 0, 0x2f4d5f, { rough: 0.5, metal: 0.4 });
    const crank = group(winch, 0, 0.18, 0.15);
    box(crank, 0.03, 0.26, 0.03, 0, 0.1, 0, 0xe8b02e, { rough: 0.5 });
    holoTag(winch, "davit winch", 0, 0.55, 0, { css: "#3fa9c9", w: 0.26 });
    reg(hits, crank, "davit-winch");
    const ropeWrap = torus(g, 0.22, 0.03, 3.6, 0.35, -3.2, 0xe8b02e, { rough: 0.8, seg: 6, seg2: 16 });
    ropeWrap.rotation.y = Math.PI / 2;
    ropeWrap.visible = false;

    // ------------------------------------------------ barge and excavator
    const barge = spudBarge(g, -1.0, -0.6, -11.0, { ry: Math.PI / 2 });
    void barge;
    const exc = excavator(g, -1.2, 0.95, -11.0, { ry: -Math.PI / 2 });
    const { house } = exc.userData.parts;
    house.rotation.y = 0.5;
    holoTag(g, "barge excavator — IUOE Local 3", -1.2, 5.9, -11.0, { css: "#3fa9c9", w: 0.6 });
    const releaseFlag = group(g, -2.9, 0.12, -1.2);
    cyl(releaseFlag, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const flagCloth = box(releaseFlag, 0.34, 0.22, 0.01, 0.18, 1.25, 0, 0xd2312b, { rough: 0.8 });
    holoTag(releaseFlag, "release flag", 0, 1.55, 0, { css: "#3fa9c9", w: 0.26 });
    reg(hits, releaseFlag, "release-flag");

    // ------------------------------------------------ curtain on the float
    const staged = group(g, -2.2, 0.12, 0.2, 0.2);
    for (let i = 0; i < 3; i++) cyl(staged, 0.14, 0.14, 1.3, 0, 0.14 + i * 0.26, 0, 0xf2c14b, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    box(staged, 1.3, 0.04, 0.6, 0, 0.02, 0.3, 0x2b2e33, { rough: 0.9 });
    const crushed = box(staged, 0.45, 0.12, 0.3, 0.3, 0.72, 0, 0xb08a2a, { rough: 0.9, emissive: 0x3a2a06, ei: 0.3 });
    reg(hits, crushed, "float-crushed");
    const pin = box(staged, 0.1, 0.16, 0.1, -0.68, 0.46, 0, 0x6f767d, { rough: 0.4, metal: 0.7, emissive: 0x3a1206, ei: 0.4 });
    reg(hits, pin, "connector-pin");
    holoTag(staged, "curtain sections", 0, 1.05, 0, { css: "#3fa9c9", w: 0.32 });
    const leadEnd = group(g, -1.0, 0.12, -0.9);
    cyl(leadEnd, 0.14, 0.14, 0.6, 0, 0.14, 0, 0xf2c14b, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    box(leadEnd, 0.1, 0.14, 0.1, 0.35, 0.14, 0, 0x8b98a5, { rough: 0.4, metal: 0.8 });
    holoTag(leadEnd, "curtain lead end", 0, 0.45, 0, { css: "#3fa9c9", w: 0.3 });
    reg(hits, leadEnd, "lead-end");

    // ----------------------------------- the deployed line, buoys and anchors
    const buoyUp = group(g, -4.2, 0.02, -3.9);
    ball(buoyUp, 0.22, 0, 0.16, 0, 0xe8622a, { rough: 0.6, seg: 12, seg2: 10 });
    const upRing = torus(buoyUp, 0.4, 0.012, 0, 0.1, 0, BRTC_ACCENT, { emissive: BRTC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    upRing.rotation.x = Math.PI / 2;
    holoTag(buoyUp, "upcurrent anchor buoy", 0, 0.6, 0, { css: "#3fa9c9", w: 0.4 });
    reg(hits, buoyUp, "anchor-buoy-up");
    const line = group(g, 0, 0, 0);
    const pts = [[-4.2, -3.9], [-4.0, -5.1], [-2.4, -5.7], [0, -6.0], [2.2, -5.6], [3.7, -4.7], [4.4, -3.5], [4.6, -2.4]];
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const seg = group(line, (ax + bx) / 2, 0, (az + bz) / 2, Math.atan2(bx - ax, bz - az));
      cyl(seg, 0.13, 0.13, len, 0, 0.08, 0, 0xf2c14b, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
      segs.push(seg);
    }
    line.visible = false;
    const anchorMarks = {};
    for (const [id, x, z, label] of [["anchor-2", -2.3, -5.4, "anchor 2"], ["anchor-3", 2.1, -5.3, "anchor 3"]]) {
      const a = group(g, x, 0.02, z);
      ball(a, 0.18, 0, 0.13, 0, 0xe8622a, { rough: 0.6, seg: 10, seg2: 8 });
      holoTag(a, label, 0, 0.5, 0, { css: "#3fa9c9", w: 0.22 });
      reg(hits, a, id);
      anchorMarks[id] = a;
    }
    const shoreAnchor = group(g, 4.75, 0.5, -2.2);
    box(shoreAnchor, 0.2, 0.3, 0.2, 0, 0.15, 0, 0x3a3f45, { rough: 0.6, metal: 0.5 });
    torus(shoreAnchor, 0.08, 0.02, 0, 0.36, 0, 0x8b98a5, { rough: 0.4, metal: 0.8, seg: 6, seg2: 14 });
    holoTag(shoreAnchor, "shore anchor", 0, 0.6, 0, { css: "#3fa9c9", w: 0.26 });
    reg(hits, shoreAnchor, "shore-anchor");
    const clamp = group(g, 4.55, 0.5, -3.2);
    const clampBody = box(clamp, 0.22, 0.2, 0.3, 0, 0.1, 0, 0x6f767d, { rough: 0.4, metal: 0.7 });
    holoTag(clamp, "shore-end clamp", 0, 0.42, 0, { css: "#3fa9c9", w: 0.3 });
    reg(hits, clamp, "shore-clamp");
    const plume = box(g, 1.4, 0.012, 0.6, 4.0, 0.03, -2.0, 0x6a5130, { rough: 0.6, emissive: 0x3a2610, ei: 0.4, cast: false });
    plume.visible = false;

    // Line-walk faults, out on the deployed curtain.
    const debris = group(g, 0.2, 0.02, -5.7);
    for (const [dx, dz, r] of [[-0.3, 0.1, 0.4], [0.2, 0.2, -0.3], [0.5, 0, 0.9]]) box(debris, 0.7, 0.08, 0.1, dx, 0.06, dz, 0x5a4632, { rough: 0.95 }).rotation.y = r;
    reg(hits, debris, "debris-fouled");
    debris.visible = false;
    const drowned = box(g, 0.9, 0.04, 0.2, 3.9, -0.02, -4.2, 0x8a7a2a, { rough: 0.8, emissive: 0x2a2206, ei: 0.3 });
    drowned.rotation.y = -0.6;
    reg(hits, drowned, "float-riding-under");
    drowned.visible = false;

    // ----------------------------------- tide board, sounding pole, meter
    const tide = group(g, -4.2, 0, -1.3);
    cyl(tide, 0.12, 0.12, 1.6, 0, 0.5, 0, 0x4a4238, { rough: 0.95, seg: 10 });
    const tideBoard = decal(tide, 0.12, 0.8, 0, 0.75, 0.13, (cx, w, h) => {
      cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) { cx.fillStyle = i % 2 ? "#1b1e22" : "#3fa9c9"; cx.fillRect(0, (i * h) / 16, w * (i % 4 === 0 ? 1 : 0.55), h / 32); }
    }, { px: 64 });
    holoTag(tide, "tide board", 0, 1.45, 0.1, { css: "#3fa9c9", w: 0.24 });
    reg(hits, tideBoard, "tide-board");
    const probe = group(g, 3.0, 0.12, -1.4, -0.3);
    cyl(probe, 0.018, 0.018, 2.0, 0, 0.6, 0, 0xe8edf1, { rough: 0.5, seg: 8 }).rotation.z = 0.25;
    box(probe, 0.12, 0.08, 0.06, -0.12, 1.45, 0, 0xd2312b, { rough: 0.5 });
    holoTag(probe, "sounding pole", 0, 1.75, 0, { css: "#3fa9c9", w: 0.28 });
    reg(hits, probe, "skirt-probe");
    const meter = group(g, -3.4, 0.12, -0.2, 0.4);
    box(meter, 0.4, 0.7, 0.3, 0, 0.35, 0, 0x2b3138, { rough: 0.6 });
    const meterScreen = decal(meter, 0.26, 0.12, 0, 0.56, 0.155, signFace("BACKGROUND —", { bg: "#0d1c24", accent: "#3fa9c9", fg: "#bfeaf7", scale: 0.42 }), { px: 192, glow: true, ei: 0.8 });
    holoTag(meter, "background meter", 0, 0.9, 0, { css: "#3fa9c9", w: 0.34 });
    reg(hits, meterScreen, "background-meter");

    // ----------------------------------------------- gear, boards and radio
    const rack = group(g, 2.6, 0.12, 1.4, -0.5);
    box(rack, 1.0, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(rack, 0.9, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["gear-pfd", -0.32, 0xf06a2b, "PFD"], ["gear-helmet", 0, 0xf2f2ee, "HARD HAT"], ["gear-knife", 0.32, 0x2b3138, "KNIFE"]]) {
      const it = group(rack, dx, 0.8, 0);
      box(it, 0.22, 0.1, 0.18, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.2, 0.06, 0, 0.051, 0, signFace(label, { bg: "#0d1c24", accent: "#3fa9c9", scale: 0.5 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const plan = decal(g, 0.6, 0.44, -1.1, 1.25, 1.9, paperFace("CURTAIN DESIGN — REACH 3", ["Alignment: anchor marks A1 › shore", "Skirt: per the design for this reach", "Compliance point: outside, downcurrent", "Background: upcurrent station", "Release: loop closed, sounded, read"], { bg: "#e8eef0", band: "#3fa9c9" }), { px: 320 });
    plan.rotation.y = 0.3;
    cyl(g, 0.03, 0.035, 1.0, -1.1, 0.6, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, plan, "curtain-plan");
    const logBoard = decal(g, 0.5, 0.36, 1.6, 1.25, 1.9, paperFace("CURTAIN LOG", ["Sections: —", "Anchors: —", "Background: —", "Remarks: —"], { bg: "#e8eef0", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.35;
    cyl(g, 0.03, 0.035, 1.0, 1.6, 0.6, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "curtain-log");
    const radioPost = group(g, 0.4, 0.12, 2.1);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#3fa9c9", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    // ------------------------------------------------------- hazards
    const bight = group(g, 0.9, 0.12, -1.0);
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI; cyl(bight, 0.02, 0.02, 0.14, Math.sin(a) * 0.32, 0.02, Math.cos(a) * 0.22, 0xe8b02e, { rough: 0.85, seg: 6, cast: false }).rotation.z = Math.PI / 2; }
    const bightHit = box(bight, 0.6, 0.4, 0.5, 0.15, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bight, "stand in the bight?", 0.15, 0.55, 0, { css: "#e8622a", w: 0.36 });
    reg(hits, bightHit, "stand-in-bight");
    const handHit = box(g, 0.35, 0.35, 0.35, -1.7, 1.2, -2.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "guide the running line by hand?", -1.7, 1.55, -2.5, { css: "#e8622a", w: 0.56 });
    reg(hits, handHit, "hand-on-running-line");
    const shortcut = group(g, -3.3, 0.02, -5.0);
    box(shortcut, 0.2, 0.2, 0.2, 0, 0.12, 0, 0x6f767d, { rough: 0.4, metal: 0.7 });
    const shortcutHit = box(shortcut, 0.5, 0.4, 0.5, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(shortcut, "unclip it and cut through?", 0, 0.55, 0, { css: "#e8622a", w: 0.46 });
    reg(hits, shortcutHit, "open-curtain-shortcut");
    const drifting = cyl(g, 0.13, 0.13, 0.7, -3.4, 0.08, -2.2, 0xf2c14b, { rough: 0.7, seg: 10 });
    drifting.rotation.z = Math.PI / 2;
    const reachHit = box(g, 0.6, 0.45, 0.45, -3.4, 0.3, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lean out and grab it?", -3.4, 0.62, -1.8, { css: "#e8622a", w: 0.4 });
    reg(hits, reachHit, "reach-over-rail");

    const hand = standingFigure(g, -0.6, 0.9, { ry: 2.8, cloth: 0x3f4a55, vest: 0xf06a2b, helmet: 0xf2c14b, gloves: true });
    hand.position.y = 0.12;
    holoTag(hand, "float hand", 0, 1.95, 0, { css: "#3fa9c9", w: 0.22 });

    const waterTex = water.material.map;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.6, -3.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "section-check") { crushed.visible = false; pin.material = mat(0xc0c6cc, { rough: 0.3, metal: 0.9 }); }
        if (step.id === "shackle-lead") { leadEnd.visible = false; }
        if (step.id === "tow-out") { line.visible = true; staged.visible = false; }
        if (step.id === "set-anchors") { for (const a of Object.values(anchorMarks)) a.children[0].material = mat(0x59c97b, { rough: 0.6 }); }
        if (step.id === "background") repaint(meterScreen, signFace("BACKGROUND SET", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.42 }));
        if (step.id === "release") { flagCloth.material = mat(0x59c97b, { rough: 0.8 }); debris.visible = true; drowned.visible = true; }
        if (step.id === "line-walk") { debris.visible = false; drowned.position.y = 0.06; drowned.material = mat(0xf2c14b, { rough: 0.7 }); }
        if (step.id === "curtain-log") repaint(logBoard, paperFace("CURTAIN LOG", ["Sections: one swapped", "Anchors: up › 2 › 3 › shore", "Background: set · released", "Prop cleared · gap closed"], { bg: "#e8eef0", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "line-in-the-prop") ropeWrap.visible = true;
        if (it.id === "shore-end-open") {
          plume.visible = true;
          const last = segs[segs.length - 1];
          last.rotation.y += 0.7; last.position.x -= 0.5;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "line-in-the-prop") { if (outboards) outboards.rotation.x = -0.9; lanyard.position.y = 0.05; lanyard.rotation.x = 0.8; }
        if (it.id === "shore-end-open") {
          const last = segs[segs.length - 1];
          last.rotation.y -= 0.7; last.position.x += 0.5;
          clampBody.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
          plume.scale.set(0.4, 1, 0.4);
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = -t * 0.01; waterTex.offset.y = t * 0.004; }
        if (session?.turn && step?.id === "lower-anchor") crank.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "tow-out") throttle.rotation.x = -(session.track?.v ?? 0) * 0.9;
        if (line.visible) segs.forEach((s, i) => { s.children[0].position.y = 0.08 + Math.sin(t * 1.4 + i) * 0.02; });
        if (!line.visible) drifting.position.y = 0.08 + Math.sin(t * 1.7) * 0.02;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "background") repaint(meterScreen, signFace(gg.t < 0.42 ? "SETTLING" : gg.t <= 0.6 ? "STEADY" : "PROP WASH", { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.42 }));
        void dt; void CITY;
      },
    };
  },
};
