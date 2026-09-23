import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Paint Containment on the Deck VR — Construction & Structural
// Trades, the Bay Area bridge pack, on the golden-gate-deck district.
//
// Old coatings on bridge steel can carry lead, and removing them is work the
// water must never see: the section is enclosed, the enclosure is held under
// negative pressure through a dust collector, and every seam that faces the
// strait is proven with smoke before a tool touches the steel. The painter is
// the IUPAT bridge painter trained through the Finishing Trades Institute,
// working to the contractor's lead compliance programme. The enclosure here
// is the station's own mock-up round a railing section in the closure.

const GGP_ACCENT = 0x3fa7c9;

export const SIM_GG_PAINT_CONTAINMENT_ON_THE_DECK = {
  id: "gg-paint-containment-on-the-deck",
  index: "229",
  domain: "Construction",
  trade: "IUPAT bridge painters — containment and lead removal crew, trained through the Finishing Trades Institute (FTI), with the containment competent person",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  certification: "IUPAT and the Finishing Trades Institute bridge painter and lead abatement training; OSHA 29 CFR 1926.62 lead in construction, including the written compliance programme, exposure monitoring, hygiene and decontamination; 29 CFR 1910.134 respiratory protection and fit testing; SSPC Guide 6 for containing surface preparation debris; an SSPC-QP 2 qualified contractor for hazardous coating removal; ANSI/ASSP A10.34 protection of the public beside the work; BCDC and the permit's conditions for work over the bay",
  name: "Paint Containment on the Deck",
  title: simTitle("Paint Containment on the Deck"),
  tagline: "Old coatings taken off inside a sealed enclosure the water never sees: the lead compliance plan read, suited and fit-checked, the strait-side tarp hung and sealed, the enclosure walked for leaks, the collector set and the negative pressure read, the seams smoke-tested while a boat passes under, the steel cleaned under the shroud through a gust, the floor HEPA-vacuumed, the drums closed and labelled, washed out and logged",
  accent: GGP_ACCENT,
  accentCss: "#3fa7c9",
  parSeconds: 330,
  footprint: 2.8,
  badge: { id: "nothing-to-the-water", name: "Nothing To The Water", note: "An enclosure sealed, held negative and smoke-proven before removal, never breached toward the strait, and nothing swept dry" },

  supportLine: "the IUPAT member assistance programme through your district council, and the crew's peer-support contact",

  game: system({
    name: "Containment Crew",
    currency: "SEAL",
    ranks: ["Tarp Hand", "Containment Painter", "Smoke Tester", "Containment Lead", "Containment Crew Certified"],
    badges: [
      { id: "sealed-to-the-strait", name: "Sealed To The Strait", note: "The strait-side tarp hung and sealed without a correction", test: AWARD.stepClean("hang-tarp") },
      { id: "shroud-on-steel", name: "Shroud On Steel", note: "The shroud held to the steel the whole pass", test: AWARD.precise(0.72) },
      { id: "clean-habits", name: "Clean Habits", note: "Never swept dry, never drank in the zone, never breached the enclosure", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-enclosure", name: "Clean Enclosure", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "no-lift-off", name: "No Lift-Off", note: "The shroud never left the steel", test: AWARD.unbroken },
      { id: "containment-inside-par", name: "Containment Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "tarp-breach-water": "You pulled the strait-side tarp back off its frame to pass a hose through. That wall is the one between the removal and the water, and with it open the enclosure is no longer an enclosure: the collector pulls air in through the gap instead of holding the whole space negative, and anything the wind finds inside goes out through it and down to the bay. Hoses go through the sealed port the plan provides, never through the wall that faces the water.",
    "dry-sweep": "You picked up the broom to sweep the debris on the enclosure floor. Dry sweeping lifts the finest lead-bearing dust — the part that stays airborne, gets past a poor respirator seal and settles on skin and clothing — and 29 CFR 1926.62 rules it out wherever vacuuming with a HEPA filter or wet methods will do. The debris is vacuumed with the HEPA vac, never swept.",
    "drink-in-zone": "You went for the water bottle standing inside the regulated area. Lead gets into a body through the mouth as surely as through the lungs, and a bottle standing in the enclosure has lead dust settling on its cap. Eating, drinking and smoking happen outside the regulated area after washing, which is why 29 CFR 1926.62 keeps them out of it and why the wash station is on the way out.",
    "untethered-scraper": "The scraper is lying loose on the stringer flange at the enclosure's open side, over the edge and the strait beyond it. A tool that falls from a bridge containment falls through the one place the enclosure is not sealed — the gap where the tool went — and takes lead-painted chips down to the water with it. Hand tools ride on tethers inside the enclosure too.",
  },

  lateNotes: {
    "vac-shroud": "Removal starts once the enclosure is held negative and every seam facing the water has passed the smoke test.",
    "hepa-vac": "The floor is vacuumed once the removal pass is finished and the shroud is off the steel.",
    "containment-log": "The enclosure is logged once the drums are closed and labelled and the crew has washed out.",
  },

  steps: [
    {
      id: "compliance-plan", kind: "select", target: "lead-compliance-plan",
      title: "Read the lead compliance plan and the containment design",
      cue: "Read the written compliance programme and the containment design: the coating's lead result, the enclosure class, the negative pressure required, the monitoring and the decontamination route.",
      why: "Removing a coating that carries lead is regulated work under 29 CFR 1926.62: the employer writes a compliance programme before it starts, and the containment is designed to SSPC Guide 6 for the kind of removal planned. The plan says how negative the enclosure has to be, where the air monitoring sits and the order of the decontamination route, and a crew that has not read it is guessing at all three over open water.",
    },
    {
      id: "suit-up", kind: "sequence",
      targets: ["tyvek-suit", "boot-covers", "respirator-fit"],
      itemNames: { "tyvek-suit": "disposable coveralls, hood up", "boot-covers": "boot covers over the cuffs", "respirator-fit": "respirator on, seal checked" },
      title: "Suit up, then check the respirator seal last",
      cue: "Coveralls on with the hood up, boot covers over the cuffs, then the respirator on and a user seal check — last, so nothing pulled over your head breaks the seal.",
      why: "The respirator goes on last because everything else is pulled over the head or tugged at the neck, and each of those can move a facepiece that has already been sealed. 29 CFR 1910.134 asks for a user seal check every time the respirator goes on, and it only means something if nothing else touches the facepiece after it; the fit test on file proves the model fits, and the seal check proves it fits right now.",
      outOfOrderNote: "Respirator last — pulling the hood up over a sealed facepiece is how the seal gets broken without anyone noticing.",
    },
    {
      id: "hang-tarp", kind: "drag", target: "tarp-panel",
      title: "Hang and seal the strait-side tarp",
      cue: "Carry the tarp panel to the enclosure's strait side and hang it on the frame, overlapped onto the next panel and taped along the seam.",
      why: "The strait side of the enclosure is the one wall that stands between the removal and the water, and it is hung first and sealed best. Panels overlap onto each other and every seam is taped, because a seam that is merely touching opens the moment the collector draws on the enclosure; SSPC Guide 6 treats the seams, not the tarp, as where a containment fails.",
      drag: { to: "tarp-seam", radius: 0.5, missNote: "Not on the frame's seam line — the panel has to overlap the next one on the strait side, not hang loose inside it." },
    },
    {
      id: "walk-enclosure", kind: "find", noHint: true,
      targets: ["tarp-tear", "floor-seam-gap", "airlock-flap-open"],
      itemNames: {
        "tarp-tear": "a tear in the roof tarp",
        "floor-seam-gap": "a gap where the floor sheet meets the wall",
        "airlock-flap-open": "the airlock's outer flap tied open",
      },
      itemNotes: {
        "tarp-tear": "The roof tarp has torn along a frame bar where it rubbed in last night's wind. It is patched and taped before the collector runs, or the collector draws air through it instead of through the airlock.",
        "floor-seam-gap": "The floor sheet has pulled back from the wall panel at one corner. Debris that reaches the floor rolls to the lowest point, and a gap at floor level is where it leaves.",
        "airlock-flap-open": "The airlock's outer flap has been tied open for convenience. An airlock is two flaps so one is always closed; tied open it is just a doorway.",
      },
      title: "Walk the enclosure for leaks before the collector runs",
      cue: "Walk the enclosure inside and out and find where it would leak: the tarps, the floor seams, the airlock.",
      why: "An enclosure leaks where it was handled last: the roof that rubbed in the wind overnight, the floor corner someone stepped on, the airlock flap someone tied back to carry gear in. Walking it before the collector runs finds those while they can still be taped, and it is the competent person's check under the compliance programme that the enclosure built yesterday is the enclosure standing today.",
    },
    {
      id: "collector", kind: "turn", target: "collector-damper",
      title: "Set the dust collector's damper",
      cue: "Start the dust collector and open its damper steadily to the setting on the containment design.",
      why: "The collector is what makes the enclosure negative: it pulls air out through its filters faster than air leaks in, so every leak draws clean air inward rather than letting dust out. Its damper is opened steadily to the design setting rather than thrown open, because a tarp enclosure snapped inward by a sudden draw can tear at the seams the walk just taped.",
      turn: { turns: 1.0, label: "COLLECTOR DAMPER", readout: (t) => (t < 0.35 ? "opening" : t < 0.95 ? "drawing" : "at the design setting") },
    },
    {
      id: "negative-pressure", kind: "gauge", target: "manometer",
      title: "Read the enclosure's negative pressure",
      cue: "Read the manometer on the enclosure wall and commit the reading when it sits inside the band the design requires.",
      why: "Negative pressure is the whole difference between an enclosure and a tent: with the manometer showing the design's figure, air flows in at every gap and the dust stays inside. Too little and a gust outside can push the tarps in and the dust out; the reading is taken and committed before removal starts, and it stays on the log for the shift.",
      gauge: {
        label: "ENCLOSURE PRESSURE · % OF DESIGN", speed: 0.62, green: [0.46, 0.7],
        readout: (t) => `${Math.round(40 + t * 90)}% of design`,
        missNote: "Outside the band — too little and the enclosure is not holding negative, too much and the tarps are being sucked in at the seams. Adjust the damper and read again.",
      },
    },
    {
      id: "smoke-test", kind: "hold", target: "smoke-pencil", seconds: 5,
      title: "Smoke-test the seams that face the water",
      cue: "Hold the smoke pencil along the strait-side seams and watch the smoke draw inward all the way along.",
      why: "The manometer proves the enclosure is negative on average; the smoke test proves it at the seams, which is where it matters. Smoke drawn inward along a seam is a seam holding; smoke that drifts outward or hangs is a seam leaking, and the strait-side seams are tested first and slowest because they are the ones between the removal and the bay.",
      holdBreakNote: "The smoke pencil left the seam before the whole run was tested. Start again at the end you left.",
    },
    {
      id: "removal", kind: "track", target: "vac-shroud", seconds: 7,
      title: "Clean the steel with the shroud held to it",
      cue: "Run the vacuum-shrouded tool along the stringer with the shroud held flat to the steel — no lifting off, no tilting.",
      why: "A vacuum-shrouded tool captures the old coating at the point it comes off, so the enclosure is the second line of defence rather than the first. It only works with the shroud flat on the steel: lifted or tilted, the tool throws chips and dust out of the shroud and the capture drops to whatever the enclosure can manage. The pass is steady so the shroud keeps its seal the whole length.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "SHROUD ON STEEL",
        readout: (v) => (v < 0.42 ? "lifting off — throwing debris" : v > 0.62 ? "pressed and tilted — seal broken" : "flat on the steel"),
      },
      holdBreakNote: "The shroud came off the steel and threw debris into the enclosure. Set it flat and run that length again.",
    },
    {
      id: "hepa", kind: "select", target: "hepa-vac",
      title: "Vacuum the floor with the HEPA vacuum",
      cue: "Vacuum the enclosure floor and the flanges with the HEPA vacuum — every chip, every corner, no sweeping.",
      why: "The debris on the floor is the lead in its most portable form: chips and dust that stick to boots and blow at the first gap. 29 CFR 1926.62 wants it collected by HEPA vacuum or wet methods, and the HEPA filter is the point: an ordinary vacuum passes the finest dust straight out of its exhaust into the air the crew is breathing.",
    },
    {
      id: "waste", kind: "sequence",
      targets: ["waste-drum-lid", "drum-label"],
      itemNames: { "waste-drum-lid": "drum lid on and the ring bolted", "drum-label": "drum labelled with contents and date" },
      title: "Close the waste drum, then label it",
      cue: "Bolt the lid ring on the full waste drum, then fill in its label: contents, date, the job.",
      why: "A waste drum of paint debris is closed before it is labelled because an open drum being labelled is an open drum, and the wind across a bridge deck lifts dust off an open drum faster than a label can be written. The label follows so nobody ever has to open a drum to find out what is in it; the waste is characterised and shipped under the compliance programme, never guessed at.",
      outOfOrderNote: "Lid first — a drum is labelled once it is closed, not while its contents are open to the wind.",
    },
    {
      id: "wash-out", kind: "hold", target: "wash-station", seconds: 4,
      title: "Wash out at the decontamination station",
      cue: "Out through the airlock, coveralls off into the drum, then wash hands and face at the station before anything else.",
      why: "Lead leaves a job on hands, faces and clothes and goes home with people: to the truck, the kitchen table and the children in the house. The decontamination route is in the compliance programme for that reason, and washing hands and face before eating, drinking or leaving is the part of it that protects the people who were never on the bridge.",
      holdBreakNote: "You stepped away from the wash station before the wash was done. Wash hands and face fully before leaving.",
    },
    {
      id: "containment-log", kind: "select", target: "containment-log",
      title: "Log the enclosure, the pressure and the waste",
      cue: "Record the leaks found and taped, the pressure reading, the smoke test, the removal pass, the drums closed and the crew washed out.",
      why: "The containment log is the record that the work never reached the water: the pressure the enclosure held, the seams proven by smoke, where it leaked and when it was taped, and the drums that left the deck. It is what the owner, the regulator and the permit's conditions ask for, and a gap in it is a shift nobody can show was contained.",
    },
    {
      id: "crew-checkin", kind: "select", target: "work-radio",
      title: "Check in with the competent person and the crew",
      cue: "Call the competent person and the crew: enclosure logged and left negative, drums closed, everyone washed out — and how everyone is.",
      why: "The competent person decides whether the enclosure is left running overnight, and needs to hear it is logged and negative. A shift in a suit and a respirator, with a boat under the work and a gust pushing the tarps, is a hard one, and the crew checks in with each other before they leave the deck; the IUPAT member assistance line is there for anything that lasts.",
    },
  ],

  interrupts: [
    {
      id: "boat-under-containment",
      kind: "Boat under the work zone",
      after: "smoke-test", delay: 2, seconds: 13,
      alert: "A small boat has come in under the span directly below the enclosure — inside the exclusion the permit sets on the water under the removal.",
      cue: "Stop the test and call the safety boat on the work radio: clear the boat out from under the enclosure before any removal starts.",
      target: "work-radio",
      why: "The water under a removal is kept clear because if anything does get out of the enclosure — a chip past a seam, a tool through a gap — it lands on whatever is below. The crew above is the only one that can see the enclosure and the boat together, so the call goes out the moment a boat is under it: the safety boat moves it on and removal waits until the water is clear.",
      missNote: "The work went on with a boat sitting under the enclosure. Anything that escaped the containment in that window would have landed on people who never knew they were under lead removal.",
      wrongNote: "The work radio — the boat is out of reach, and the radio is the only thing on this deck that reaches it.",
    },
    {
      id: "gust-on-the-tarps",
      kind: "Gust past the work-stop limit",
      after: "removal", delay: 3, seconds: 12,
      alert: "A gust hits the enclosure — the tarps bow in and snap out on the frame and the windsock at the collector stands straight out red.",
      cue: "Let go of the deadman to stop removal, and hold until the tarps settle and the pressure is back.",
      target: "blast-deadman",
      why: "A gust past the limit pushes an enclosure's tarps in and out faster than the collector can hold it negative, and in the moment a tarp bows in the enclosure is briefly pressurised — the direction of air flow at the seams reverses. Removal stops on the deadman so no new debris is made while the enclosure is not holding, and restarts only when the manometer is back in its band.",
      missNote: "Removal carried on through the gust while the tarps were pumping in and out. Every time a tarp bowed in, the enclosure pushed dusty air out through its seams toward the water.",
      wrongNote: "The deadman — stop making debris first. Nothing else is safe while the enclosure is not holding negative.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGP_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4047", base2: "#30363c" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.8, 0.02, 4.6, 0, 0.01, 0.1, 0x3a4047, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ the enclosure frame and tarps
    const enc = group(g, -0.6, 0, -1.35);
    const W = 2.6, D = 1.7, H = 2.1;
    for (const [px, pz] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) box(enc, 0.06, H, 0.06, px, H / 2, pz, 0x9aa1a8, { rough: 0.45, metal: 0.7 });
    for (const pz of [-D / 2, D / 2]) box(enc, W, 0.05, 0.05, 0, H, pz, 0x9aa1a8, { rough: 0.45, metal: 0.7 });
    for (const px of [-W / 2, W / 2]) box(enc, 0.05, 0.05, D, px, H, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7 });
    const tarpOpt = { rough: 0.85, opacity: 0.78, transparent: true, cast: false };
    const roof = box(enc, W, 0.02, D, 0, H + 0.02, 0, 0xdfe5e9, tarpOpt);
    const back = box(enc, W, H, 0.02, 0, H / 2, -D / 2, 0xdfe5e9, tarpOpt);
    const right = box(enc, 0.02, H, D, W / 2, H / 2, 0, 0xdfe5e9, tarpOpt);
    const floor = box(enc, W, 0.02, D, 0, 0.03, 0, 0xcfd5d9, { rough: 0.9 });
    void floor;
    // Front wall in two panels either side of the airlock.
    for (const px of [-0.85, 0.85]) box(enc, 0.9, H, 0.02, px, H / 2, D / 2, 0xdfe5e9, tarpOpt);
    const outerFlap = box(enc, 0.8, 1.9, 0.02, 0.35, 0.95, D / 2 + 0.3, 0x3fa7c9, { rough: 0.8, opacity: 0.8, transparent: true, cast: false });
    outerFlap.rotation.y = 1.1;
    reg(hits, outerFlap, "airlock-flap-open");
    for (const px of [-0.4, 0.4]) box(enc, 0.04, 1.9, 0.6, px, 0.95, D / 2 + 0.3, 0xcfd5d9, tarpOpt);
    const tear = box(enc, 0.5, 0.025, 0.06, 0.6, H + 0.035, -0.3, 0x3a3f45, { rough: 0.9 });
    reg(hits, tear, "tarp-tear");
    const floorGap = box(enc, 0.3, 0.04, 0.05, W / 2 - 0.2, 0.05, -D / 2 + 0.03, 0x14171a, { rough: 0.9 });
    reg(hits, floorGap, "floor-seam-gap");
    // The strait side (−x) is open until the tarp is hung.
    const seam = group(enc, -W / 2, H / 2, 0);
    box(seam, 0.02, H, 0.04, 0, 0, D / 2 - 0.05, GGP_ACCENT, { emissive: GGP_ACCENT, ei: 1.4, rough: 0.5, cast: false });
    box(seam, 0.02, H, 0.04, 0, 0, -D / 2 + 0.05, GGP_ACCENT, { emissive: GGP_ACCENT, ei: 1.4, rough: 0.5, cast: false });
    holoTag(seam, "strait-side seam", 0, H / 2 + 0.15, 0, { css: "#3fa7c9", w: 0.32 });
    reg(hits, seam, "tarp-seam");
    const leftTarp = box(enc, 0.02, H, D, -W / 2, H / 2, 0, 0xdfe5e9, tarpOpt);
    leftTarp.visible = false;
    const breach = box(enc, 0.1, 0.5, 0.5, -W / 2 - 0.05, 0.3, 0.45, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(enc, "pull the strait-side tarp back?", -W / 2 - 0.1, 0.72, 0.45, { css: "#d2312b", w: 0.56 });
    reg(hits, breach, "tarp-breach-water");

    // Inside: a railing section and stringer with the old coating.
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 4, rows: 2, base: "#9a5a3a", base2: "#7a4a32" }), { repeat: 1, px: 256 });
    const stringer = box(enc, 2.2, 0.35, 0.12, 0, 0.7, -0.35, 0x8a4a2a, { rough: 0.8, metal: 0.3 });
    stringer.material = texturedMat(steelTex, { rough: 0.8, metal: 0.3 });
    box(enc, 2.2, 0.04, 0.3, 0, 0.9, -0.35, 0x7a4a32, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 7; i++) box(enc, 0.04, 0.6, 0.04, -0.9 + i * 0.3, 1.2, -0.35, 0xb85a32, { rough: 0.7, metal: 0.3 });
    box(enc, 2.2, 0.06, 0.08, 0, 1.52, -0.35, 0xb85a32, { rough: 0.7, metal: 0.3 });
    const chips = [];
    for (let i = 0; i < 6; i++) chips.push(box(enc, 0.06, 0.006, 0.05, -0.8 + i * 0.3, 0.045, 0.05 + (i % 2) * 0.2, 0x9a5a3a, { rough: 0.9 }));
    const shroud = group(enc, -0.3, 0.72, -0.18);
    cyl(shroud, 0.08, 0.08, 0.08, 0, 0, 0, 0x2b3138, { rough: 0.6, seg: 12 }).rotation.x = Math.PI / 2;
    box(shroud, 0.06, 0.16, 0.06, 0, -0.1, 0.06, 0xe8b830, { rough: 0.6 });
    hose(enc, [[-0.3, 0.72, -0.1], [0.2, 0.3, 0.3], [1.3, 0.2, 0.6]], 0.02, 0x1b1e23, { steps: 14, rough: 0.8 });
    holoTag(shroud, "shrouded tool — track", 0, 0.18, 0.06, { css: "#3fa7c9", w: 0.4 });
    reg(hits, shroud, "vac-shroud");
    const scraper = group(enc, 0.6, 0.93, -0.28, 0.4);
    box(scraper, 0.16, 0.012, 0.04, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8 });
    box(scraper, 0.08, 0.025, 0.03, -0.1, 0.005, 0, 0xd8232a, { rough: 0.6 });
    reg(hits, scraper, "untethered-scraper");
    const broom = group(enc, 1.05, 0, 0.5, 0.2);
    cyl(broom, 0.015, 0.015, 1.1, 0, 0.6, 0, 0x8a6a3a, { rough: 0.8, seg: 8 }).rotation.z = 0.2;
    box(broom, 0.3, 0.08, 0.06, -0.1, 0.06, 0, 0x3a3020, { rough: 0.9 });
    reg(hits, broom, "dry-sweep");
    const bottle = group(enc, -0.95, 0.03, 0.55);
    cyl(bottle, 0.035, 0.035, 0.2, 0, 0.1, 0, 0x3fa7c9, { rough: 0.3, opacity: 0.8, transparent: true, seg: 10 });
    cyl(bottle, 0.02, 0.02, 0.03, 0, 0.215, 0, 0x1a1e23, { rough: 0.6, seg: 8 });
    reg(hits, bottle, "drink-in-zone");
    const smoke = group(enc, -W / 2 + 0.1, 1.2, 0.6);
    cyl(smoke, 0.012, 0.012, 0.14, 0, 0, 0, 0xf2f2f2, { rough: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    const smokeWisp = box(smoke, 0.2, 0.02, 0.02, 0.14, 0, 0, 0xdfe5e9, { rough: 1, opacity: 0.5, transparent: true, cast: false });
    holoTag(smoke, "smoke pencil — hold", 0, 0.14, 0, { css: "#3fa7c9", w: 0.36 });
    reg(hits, smoke, "smoke-pencil");
    const mano = instrument(enc, W / 2 + 0.05, 1.3, 0.3, { ry: Math.PI / 2, idle: "-- %", color: GGP_ACCENT, w: 0.12, d: 0.16 });
    mano.rotation.z = -Math.PI / 2.3;
    holoTag(enc, "manometer", W / 2 + 0.08, 1.52, 0.3, { css: "#3fa7c9", w: 0.24 });
    reg(hits, mano, "manometer");

    // ------------------------------------------------ collector, deadman, tarp roll
    const coll = group(g, 1.95, 0, -1.35, -0.2);
    box(coll, 0.8, 1.1, 0.7, 0, 0.55, 0, 0x2f4f6f, { rough: 0.55, metal: 0.35 });
    cyl(coll, 0.16, 0.16, 0.3, 0, 1.25, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 14 });
    hose(g, [[1.55, 0.8, -1.35], [1.1, 1.3, -1.35], [0.7, 1.4, -1.35]], 0.12, 0x9aa1a8, { steps: 10, rough: 0.6, metal: 0.4 });
    const damper = group(coll, -0.4, 0.8, 0.2);
    cyl(damper, 0.05, 0.05, 0.04, 0, 0, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.z = Math.PI / 2;
    const damperArm = box(damper, 0.02, 0.16, 0.02, -0.03, 0.06, 0, 0xe8b830, { rough: 0.5 });
    holoTag(damper, "collector damper", 0, 0.2, 0, { css: "#3fa7c9", w: 0.32 });
    reg(hits, damper, "collector-damper");
    const sock = cyl(coll, 0.06, 0.03, 0.34, 0.2, 1.7, 0.1, 0x59c97b, { rough: 0.7, seg: 10 });
    sock.rotation.x = 1.1;
    cyl(coll, 0.015, 0.015, 0.4, 0, 1.5, 0, 0x9aa1a8, { rough: 0.5, metal: 0.6, seg: 6 });
    const deadman = group(g, 1.2, 0, 0.55);
    box(deadman, 0.14, 0.2, 0.1, 0, 0.9, 0, 0xd8232a, { rough: 0.5 });
    const deadLever = box(deadman, 0.16, 0.03, 0.04, 0.02, 0.98, 0.06, 0x2b3138, { rough: 0.5 });
    cyl(deadman, 0.02, 0.02, 0.8, 0, 0.4, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(deadman, "deadman", 0, 1.14, 0, { css: "#3fa7c9", w: 0.2 });
    reg(hits, deadman, "blast-deadman");
    const tarpRoll = group(g, -2.45, 0, -0.1);
    const roll = cyl(tarpRoll, 0.12, 0.12, 1.4, 0, 0.12, 0, 0xdfe5e9, { rough: 0.85, seg: 12 });
    roll.rotation.x = Math.PI / 2;
    holoTag(tarpRoll, "tarp panel — carry", 0, 0.42, 0, { css: "#3fa7c9", w: 0.34 });
    reg(hits, tarpRoll, "tarp-panel");

    // ------------------------------------------------ PPE rack, HEPA vac, drums, wash station
    const rack = group(g, -2.35, 0, 1.3, 0.8);
    for (const sx of [-1, 1]) cyl(rack, 0.02, 0.02, 1.6, sx * 0.35, 0.8, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.8, 0.03, 0.03, 0, 1.58, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const suit = group(rack, -0.2, 1.2, 0.03);
    box(suit, 0.24, 0.5, 0.04, 0, 0, 0, 0xf2f2f2, { rough: 0.9 });
    holoTag(suit, "coveralls", 0, 0.34, 0.02, { css: "#3fa7c9", w: 0.22 });
    reg(hits, suit, "tyvek-suit");
    const covers = group(rack, 0.1, 0.35, 0.03);
    box(covers, 0.16, 0.1, 0.06, 0, 0, 0, 0x3fa7c9, { rough: 0.9 });
    holoTag(covers, "boot covers", 0, 0.12, 0.02, { css: "#3fa7c9", w: 0.24 });
    reg(hits, covers, "boot-covers");
    const resp = group(rack, 0.2, 1.2, 0.03);
    ball(resp, 0.07, 0, 0, 0, 0x2b3138, { rough: 0.6, seg: 10, seg2: 8 });
    for (const sx of [-1, 1]) cyl(resp, 0.035, 0.035, 0.04, sx * 0.07, -0.03, 0.04, 0xd84a8a, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(resp, "respirator", 0, 0.14, 0.02, { css: "#3fa7c9", w: 0.24 });
    reg(hits, resp, "respirator-fit");
    const vac = group(g, 0.55, 0, 0.75);
    cyl(vac, 0.18, 0.18, 0.5, 0, 0.3, 0, 0xe8b830, { rough: 0.6, seg: 14 });
    cyl(vac, 0.19, 0.19, 0.08, 0, 0.58, 0, 0x2b3138, { rough: 0.6, seg: 14 });
    decal(vac, 0.16, 0.08, 0, 0.35, 0.182, signFace("HEPA", { bg: "#1a1e23", accent: "#3fa7c9", fg: "#f2f2f2", scale: 0.6 }), { px: 96 });
    holoTag(vac, "HEPA vacuum", 0, 0.8, 0, { css: "#3fa7c9", w: 0.28 });
    reg(hits, vac, "hepa-vac");
    const drums = group(g, 2.25, 0, 0.75);
    cyl(drums, 0.28, 0.28, 0.85, 0.35, 0.43, 0.2, 0x2f4f6f, { rough: 0.5, metal: 0.4, seg: 16 });
    cyl(drums, 0.28, 0.28, 0.85, -0.25, 0.43, -0.1, 0x2f4f6f, { rough: 0.5, metal: 0.4, seg: 16 });
    const lid = cyl(drums, 0.29, 0.29, 0.03, -0.25, 0.95, 0.2, 0x3a4148, { rough: 0.5, metal: 0.5, seg: 16 });
    lid.rotation.x = 0.9;
    holoTag(drums, "drum lid", -0.25, 1.25, -0.1, { css: "#3fa7c9", w: 0.2 });
    reg(hits, lid, "waste-drum-lid");
    const label = decal(drums, 0.2, 0.16, -0.25, 0.5, 0.185, paperFace("WASTE", ["CONTENTS —", "DATE —"], { bg: "#f2e6c8", band: "#d8232a" }), { px: 128 });
    reg(hits, label, "drum-label");
    const wash = group(g, 0.9, 0, 2.2, Math.PI);
    box(wash, 0.6, 0.85, 0.45, 0, 0.43, 0, 0xdfe5e9, { rough: 0.6 });
    box(wash, 0.5, 0.06, 0.35, 0, 0.88, 0, 0x9aa1a8, { rough: 0.3, metal: 0.6 });
    cyl(wash, 0.015, 0.015, 0.22, 0, 1.0, -0.15, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    holoTag(wash, "wash station — hold", 0, 1.3, 0, { css: "#3fa7c9", w: 0.36 });
    reg(hits, wash, "wash-station");

    // ------------------------------------------------ paperwork and radio
    const plan = holoPanel(g, 0.92, 0.62, 2.5, 1.4, 2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fa7c9"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2fa"; cx.fillText("LEAD COMPLIANCE PLAN", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Coating: lead present — removal in enclosure", "Enclosure: negative, per containment design", "Seams to the water: smoke-tested before work",
       "Respirators: fit-tested, seal-checked", "No dry sweeping · no eating in the zone", "Decon: airlock, drum, wash, then out"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: -0.9, accent: GGP_ACCENT });
    reg(hits, plan, "lead-compliance-plan");
    const log = holoPanel(g, 0.72, 0.5, -1.4, 1.35, 2.3, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3fa7c9"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2fa"; cx.fillText("CONTAINMENT LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Leaks: —", "Pressure: —", "Smoke test: —", "Waste: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.3, accent: GGP_ACCENT });
    reg(hits, log, "containment-log");
    const chest = toolChest(g, -0.3, 2.35, { ry: Math.PI, color: 0x2f4f6f });
    const radio = instrument(chest, 0.14, 0.79, 0.03, { ry: 0.1, idle: "PAINT CH", color: GGP_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "work radio", 0, 0.15, 0, { css: "#3fa7c9", w: 0.24 });
    reg(hits, radio, "work-radio");

    // ------------------------------------------------ crew, closure edge, the boat below
    const cp = standingFigure(g, 2.75, -0.35, { ry: -1.6, cloth: 0x1f3a52, vest: 0xe4dc3a, helmet: 0xf2f2f2 });
    holoTag(cp, "competent person", 0, 1.95, 0, { css: "#59c97b", w: 0.34 });
    const painter = standingFigure(g, -2.75, 0.6, { ry: 1.6, cloth: 0xf2f2f2, helmet: 0xf2f2f2, respirator: true });
    holoTag(painter, "containment painter", 0, 1.95, 0, { css: "#59c97b", w: 0.38 });
    cone(g, 1.8, 2.7, { color: GGP_ACCENT }); cone(g, -2.2, 2.6, { color: GGP_ACCENT });

    const boat = group(g, -54, -45.6, 24);
    box(boat, 2.2, 0.6, 6.0, 0, 0.3, 0, 0xe6e9ec, { rough: 0.5 });
    box(boat, 1.6, 1.0, 1.8, 0, 1.1, 0.6, 0x2f8f9d, { rough: 0.5 });
    box(boat, 2.3, 0.1, 6.1, 0, 0.62, 0, 0x1f3a52, { rough: 0.6 });
    boat.visible = false;
    const boatHome = boat.position.clone();

    let boatIn = false, gusting = false;
    const tarps = [roof, back, right];

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.1, -1.2),
      onStepComplete(step) {
        if (step.id === "hang-tarp") { leftTarp.visible = true; tarpRoll.visible = false; }
        if (step.id === "walk-enclosure") { outerFlap.rotation.y = 0; outerFlap.position.z = D / 2 + 0.6; tear.material = mat(0xdfe5e9, { rough: 0.8 }); floorGap.visible = false; }
        if (step.id === "removal") stringer.material = mat(0x8a949d, { rough: 0.5, metal: 0.6 });
        if (step.id === "hepa") for (const c of chips) c.visible = false;
        if (step.id === "waste") { lid.rotation.x = 0; lid.position.set(-0.25, 0.87, -0.1); }
        if (step.id === "containment-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#d8f2fa"; cx.fillText("CONTAINMENT LOG", w * 0.06, h * 0.15);
          cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
          ["Leaks: roof tear, floor corner, airlock — taped", "Pressure: inside the design band", "Smoke test: strait-side seams drawing in", "Waste: drums closed, labelled"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
        });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ENCLOSURE LOGGED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
      },
      onInterrupt(it) {
        if (it.id === "boat-under-containment") {
          boatIn = true; boat.visible = true; boat.position.set(-40, -45.6, 1);
          repaint(radio.userData.screen, signFace("BOAT BELOW", { bg: "#0d1c24", accent: "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (it.id === "gust-on-the-tarps") {
          gusting = true;
          sock.material = mat(0xd2312b, { rough: 0.7, emissive: 0x6a1010, ei: 0.6 });
          sock.rotation.x = Math.PI / 2;
          roof.position.y = H - 0.18; back.position.z = -D / 2 + 0.15; right.position.x = W / 2 - 0.15;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "boat-under-containment") {
          boatIn = false;
          if (it.resolved !== "answered") return;
          boat.position.set(-54, -45.6, -32);
          repaint(radio.userData.screen, signFace("WATER CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (it.id === "gust-on-the-tarps") {
          gusting = false;
          if (it.resolved !== "answered") return;
          sock.material = mat(0x59c97b, { rough: 0.7 }); sock.rotation.x = 1.1;
          roof.position.y = H + 0.02; back.position.z = -D / 2; right.position.x = W / 2;
          deadLever.rotation.z = 0.5;
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-scraper") scraper.position.x = 0.75;
      },
      animate(t, dt, session) {
        if (boatIn) boat.position.z += (dt ?? 0.016) * 0.6;
        if (!boat.visible) boat.position.copy(boatHome);
        if (gusting) for (let i = 0; i < tarps.length; i++) tarps[i].scale.set(1, 1, 1 + Math.abs(Math.sin(t * 5 + i)) * 0.02);
        smokeWisp.position.x = 0.14 + Math.sin(t * 2) * 0.03;
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "negative-pressure") repaint(mano.userData.screen, signFace(`${Math.round(40 + gg.t * 90)}%`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        if (session?.turn && step?.id === "collector") damperArm.rotation.x = session.turn.amount * Math.PI;
        void CITY; void ball; void torus;
      },
    };
  },
};
