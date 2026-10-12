import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel, cylinderTank,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ TIG and Spot Welding VR — Manufacturing & Automation, SMART
// sheet metal pack. The welding booth of a sheet metal shop: a stainless
// duct seam run with gas tungsten arc to the shop's weld procedure under
// AWS D9.1, and a flange spot-welded on the resistance welder beside it. The
// arc is small and the metal is thin, which is why apprentices treat it as
// the easy station; but stainless fume carries hexavalent chromium, the
// booth's fume arm is the only control on it, and the fire watch behind the
// screen is the person the welder cannot see.

const SMTW_ACCENT = 0x9fb4c8;

export const SIM_SM_TIG_AND_SPOT_WELDING = {
  id: "sm-tig-and-spot-welding",
  index: "220",
  domain: "Manufacturing & Automation",
  trade: "Sheet metal welder — SMART, International Training Institute welding curriculum to AWS D9.1",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "SMART and its International Training Institute welding curriculum; AWS D9.1 Sheet Metal Welding Code for the weld procedure, visual acceptance and welder qualification on sheet; OSHA 29 CFR 1910.252 welding, cutting and brazing, 29 CFR 1910.1026 hexavalent chromium for stainless fume, 29 CFR 1910.134 respiratory protection; ANSI Z49.1 safety in welding, cutting and allied processes; NFPA 51B fire watch during hot work",
  name: "TIG and Spot Welding",
  title: simTitle("TIG and Spot Welding"),
  tagline: "The weld procedure read, argon on and the flow set, work lead clamped and the seam fitted, the fume arm at the arc, a bead run at travel speed, a flange spot-welded, the weld read against the code and the booth walked",
  accent: SMTW_ACCENT,
  accentCss: "#9fb4c8",
  parSeconds: 285,
  footprint: 2.2,
  badge: { id: "code-bead", name: "Code Bead", note: "A stainless seam run to the procedure with the fume arm on the arc and a fire watch behind the screen the whole way" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's training coordinator or the shop's welding lead, or your employer's employee assistance program if the smoke behind the screen is what stayed with you",

  game: system({
    name: "Weld Booth",
    currency: "BEAD",
    ranks: ["Pre-apprentice", "Tack Welder", "Sheet Welder", "Code Welder", "Weld Booth Certified"],
    badges: [
      { id: "procedure-first", name: "Procedure First", note: "The weld procedure read before the bottle was opened", test: AWARD.stepClean("wps-read") },
      { id: "fume-on-arc", name: "Fume On The Arc", note: "No unsafe action in the booth — arm on the weld, watch on post", test: AWARD.safe },
      { id: "travel-held", name: "Travel Held", note: "Travel speed inside the band along the whole seam", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-seam", name: "Clean Seam", note: "One seam, no corrections", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Never dropped out of the travel band", test: AWARD.unbroken },
      { id: "booth-in-time", name: "Booth In Time", note: "Welded, read and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fume-switch-off": "You struck an arc on stainless with the fume arm's fan switched off. Stainless fume carries hexavalent chromium, and 29 CFR 1910.1026 puts an exposure limit on it that a booth without extraction exceeds in the first minute of arc time; the arm is the control, and the switch is the first thing checked, not the fan's noise. No extraction, no arc.",
    "wet-gloves": "You picked up the wet gloves off the spot welder's water line to hold the flange. A resistance welder puts a few volts across the tips and a few thousand amps through them, and wet leather on a steel flange is a path across your chest that dry leather is not. Wet gloves go on the rack to dry, and the pair on your hands stays dry.",
    "bare-arm-arc": "You went to weld in the T-shirt from your locker with your forearms bare. A TIG arc is the cleanest arc in the shop and still puts out enough ultraviolet to burn skin like an afternoon on a roof in a few minutes; the leather jacket on the hook is the one ANSI Z49.1 assumes you are wearing. Sleeves down, jacket on, collar closed.",
    "oily-rags": "You left the oily rags from the fit-up wipe-down on the bench under the arc. Spatter from a spot weld and the sparks off a grinder both land on the bench, and a rag soaked in the cutting oil you cleaned off the seam is the first thing in the booth to light. Rags go in the closed metal can before the arc, every time.",
  },

  lateNotes: {
    "tig-torch": "The torch is struck after the fit-up is clamped and the fume arm is on the seam — an arc struck to see how the puddle looks is chromium in the booth with nothing taking it away.",
    "spot-pedal": "The spot welder is cycled after the tips are cool and dressed; a hot, mushroomed tip gives a weld that looks fine and pulls apart in the field.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "weld-board",
      title: "Sign on at the weld shop board",
      cue: "Mark yourself into the booth and confirm who the fire watch is for your arc time.",
      why: "A booth is a screened space, and everything outside the screen is the fire watch's to see; the board is how that person is named for your arc time rather than assumed. Signing on also tells the lead that a first-year is on stainless, which is the one material in the shop with an exposure limit low enough that the fume arm's condition becomes their problem too. SMART shops treat the board as the first control on hot work, not a courtesy.",
    },
    {
      id: "wps-read", kind: "select", target: "wps-sheet",
      title: "Read the weld procedure",
      cue: "Process, base metal and thickness, filler, amperage range, shielding gas and flow, and the AWS D9.1 acceptance criteria.",
      why: "The weld procedure is the shop's qualified recipe for this joint under AWS D9.1: the filler that matches the stainless, the amperage band the gauge will take without burning through, and the gas flow that keeps the puddle clean. A seam welded from habit on a different gauge or a different alloy is a weld the code never qualified, and the visual criteria on the sheet are what the weld is read against afterwards, not how it looks in the hood.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["weld-jacket", "tig-gloves", "hood-shade"],
      itemNames: { "weld-jacket": "leather welding jacket", "tig-gloves": "TIG gloves", "hood-shade": "the hood, shade checked" },
      title: "Dress for the arc",
      cue: "Jacket on and closed, dry TIG gloves, and the hood's shade checked against the procedure's amperage.",
      why: "The jacket covers the ultraviolet the arc puts out for the whole of your forearms and neck, the gloves are thin enough to feed filler and dry enough to insulate, and the hood's shade is set to the amperage on the procedure because too light a shade is an arc eye by the end of the shift. ANSI Z49.1 assumes all three; the fume arm handles what you breathe, and these handle what you touch and see.",
    },
    {
      id: "argon-open", kind: "turn", target: "argon-valve",
      title: "Open the argon",
      cue: "Stand to the side of the regulator and crack the cylinder valve open, then all the way.",
      why: "The cylinder valve is opened with your body to the side of the regulator face, because a regulator that fails does so towards whoever is looking at it, and cracked first so the seat is not slammed by full cylinder pressure. Argon is inert and will not burn, but a cylinder that is knocked over with its valve open is a projectile, which is why it is chained to the rack before the valve is touched.",
      turn: { turns: 1, axis: "y", label: "ARGON" },
    },
    {
      id: "flow-set", kind: "gauge", target: "flow-regulator",
      title: "Set the shielding gas flow",
      cue: "Set the flowmeter to the procedure's figure with the torch switch held — not by ear.",
      why: "Too little argon and air reaches the puddle, the tungsten oxidises and the weld comes out grey and porous; too much and the flow turns turbulent at the cup and drags air in anyway, while emptying a bottle in half a shift. The number is on the procedure, the flowmeter ball is read at eye level with gas actually flowing through the torch, and the sound of the gas means nothing.",
      gauge: { label: "FLOW", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 30)} cfh`, missNote: "Off the procedure's flow — porosity at the low end, turbulence at the high. Reset it." },
    },
    {
      id: "work-lead", kind: "select", target: "work-clamp",
      title: "Clamp the work lead to the part",
      cue: "Clean metal, clamp tight on the duct section itself — not on the bench, not on the fixture.",
      why: "The work lead completes the circuit, and where it is clamped is where the current goes home; a lead on the bench sends the arc's current through whatever else touches that bench, including the clamp on the spot welder and the frame of the fume arm. On the part, on clean metal, tight — a loose or dirty clamp arcs itself, heats up and gives a wandering arc at the torch you will blame on your hand.",
    },
    {
      id: "fitup", kind: "drag", target: "edge-clamp",
      title: "Fit the seam and clamp it",
      cue: "Bring the edge clamp over and set it on the seam so the two edges are tight and flush along the whole joint.",
      why: "A TIG seam on sheet is fusion of two edges that have to touch: a gap of half the sheet thickness is a hole, and a mismatch in height is a bead that fuses one side and rides over the other. The clamp holds the fit-up so the puddle bridges metal and not air, and it is set before the arc rather than adjusted during it, because a hand adjusting a clamp is a hand a few inches from a live tungsten.",
      drag: { to: "seam-line", radius: 0.4, missNote: "The clamp is off the seam — the edges are still standing apart where the bead has to go." },
    },
    {
      id: "extractor-arm", kind: "select", target: "fume-arm",
      title: "Put the fume arm on the seam",
      cue: "Swing the arm's hood to within a hand's width of the weld, on the side the fume will rise, and check the fan is running.",
      why: "The arm only captures what is within a hand's width of its hood, and fume rises off the puddle and drifts with the room's air; an arm parked a foot away captures the smell and none of the chromium. On stainless, 29 CFR 1910.1026 makes the position of that hood the difference between an exposure the shop can defend and one it cannot, so the arm moves with the weld, and the fan is checked running before the arc, not heard.",
    },
    {
      id: "weld-run", kind: "track", target: "tig-torch", seconds: 6,
      title: "Run the seam",
      cue: "Strike the arc, hold the tungsten off the puddle and travel at the procedure's speed — read the puddle width, not the arc.",
      why: "Travel speed is what decides the weld on sheet: too slow and the heat piles up until the puddle drops through, too fast and the bead is narrow, cold and does not fuse the second edge. The procedure gives the speed as a band, and the puddle's width is the gauge you have for it in the hood; a bead run at a steady travel is the difference between a seam that passes AWS D9.1 visual and one that is ground out and run again.",
      track: { label: "TRAVEL", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 400)} mm/min` },
      holdBreakNote: "The travel fell out of band — a wide spot where the puddle sagged, or a cold stretch that did not fuse. Steady the hand.",
    },
    {
      id: "spot-weld", kind: "hold", target: "spot-pedal", seconds: 3,
      title: "Spot the flange",
      cue: "Flange between the tips, hands clear, then hold the pedal through squeeze, weld and hold time — do not lift early.",
      why: "A resistance spot weld is squeeze, weld and hold, and the hold is where the nugget solidifies under pressure; lifting the pedal before the hold time ends gives a weld that looks right and shears off in the field with a click. The pedal is held for the full cycle with both hands clear of the tips, because the tips close with force enough to weld steel and do not distinguish a flange from a fingertip.",
      holdBreakNote: "Pedal released before the hold time ended — that nugget solidified without pressure and will not hold. Redo the spot beside it.",
    },
    {
      id: "weld-inspect", kind: "find", noHint: true,
      targets: ["porosity-spot", "arc-strike"],
      itemNames: { "porosity-spot": "porosity in the bead", "arc-strike": "an arc strike off the seam" },
      itemNotes: {
        "porosity-spot": "A cluster of pinholes where the gas lost cover — the arm's draught pulled the argon off the puddle for a moment. AWS D9.1 rejects it; it is ground out and re-run.",
        "arc-strike": "A stray arc strike on the sheet beside the seam. On stainless that is a hard spot and a crack starter, and the code treats it as a defect to be removed, not a mark to be ignored.",
      },
      title: "Read the weld against the code",
      cue: "Hood up, arc off, gas post-flow finished: look along the bead and click what the acceptance criteria would reject.",
      why: "A weld is read against the acceptance criteria on the procedure, not against how it felt to run, and sheet welds fail on the small things: porosity where the shielding was lost, an arc strike off the joint, undercut along one edge. The welder reads it first because the welder knows where the hand hesitated, and a defect ground out on the bench costs a minute against a seam that fails on the leakage test in a ceiling.",
    },
    {
      id: "tip-dress", kind: "sequence",
      targets: ["spot-tips-cool", "tip-dress-file"],
      itemNames: { "spot-tips-cool": "let the tips cool", "tip-dress-file": "dress the tips" },
      title: "Cool and dress the spot welder's tips",
      cue: "Wait for the tips to cool, then dress the mushroomed faces back to diameter with the file.",
      why: "Copper tips mushroom with every weld, and a mushroomed face spreads the current over a wider area until the nugget stops forming; the tips are dressed back to the diameter the setting was made for, and cooled first because a file on hot copper loads up and a hand near hot tips is a burn. Cool, then dress — the order is the difference between a dressed tip and a dressed hand.",
      outOfOrderNote: "Cool first, then dress — a file on hot copper loads up, and the hand holding it is next to the tips.",
    },
    {
      id: "bottle-walk", kind: "find", noHint: true,
      targets: ["unchained-bottle", "frayed-lead"],
      itemNames: { "unchained-bottle": "the cylinder with its chain off", "frayed-lead": "the frayed work lead" },
      itemNotes: {
        "unchained-bottle": "The spare argon cylinder is standing free with its chain on the floor — a full bottle knocked over with its valve knocked off goes through a wall.",
        "frayed-lead": "The work lead's insulation is gone for a hand's width where it crosses the bench edge. That is bare copper at welding current, on a steel bench, in a booth with a water line.",
      },
      title: "Walk the booth before you leave it",
      cue: "Bottles, leads, the bench and the floor — click the two things the next welder should not find.",
      why: "A booth passes from welder to welder, and its faults travel with it: a cylinder left unchained, a lead worn through at the bench edge, a can of rags left open. The walk at the end of the arc time is when the person who knows the booth best looks at it with the hood up, and it is the only inspection this booth gets between the safety walk on Monday and the incident that would otherwise happen on Thursday.",
    },
    {
      id: "weld-log", kind: "select", target: "weld-log",
      title: "Log the weld",
      cue: "Procedure number, filler, amps and flow, the defects found and repaired, the fume arm's condition, and sign it.",
      why: "The log ties this seam to the procedure and the welder who ran it, which is what AWS D9.1 traceability means in a shop; a seam that fails a leakage test in a ceiling is traced back to this entry or to nobody. It also carries the fume arm's condition on the day, which is the shop's only record of the chromium control for a stainless job when an exposure question comes years later.",
    },
  ],

  interrupts: [
    {
      id: "fire-watch-away",
      kind: "Fire watch off post",
      after: "weld-run", delay: 3, seconds: 12,
      alert: "The fire watch has stepped away from the booth. The pallet of packing cardboard behind the screen is unwatched while you are laying a bead.",
      cue: "Nobody is watching the side of the screen you cannot see.",
      target: "watch-radio",
      why: "A welding screen stops the arc's light and not its sparks, which go over and under it onto whatever is stacked behind; the fire watch is posted there because the welder in the hood cannot see it. A watch who steps away for a minute is a watch who is not there for the spark that lands, and the radio brings them back before the bead goes on — the seam waits, the cardboard does not.",
      missNote: "You finished the seam with nobody behind the screen. The spatter landed where it landed; the cardboard did not take that time. NFPA 51B and 29 CFR 1910.252 put a fire watch on hot work because the fire starts on the side the welder is not looking at, in the minutes when everybody assumes somebody else is watching.",
      wrongNote: "It is the radio. Call the watch back to the post before the arc goes on again — nothing else in the booth sees behind the screen.",
    },
    {
      id: "arm-swung",
      kind: "Extraction lost",
      after: "spot-weld", delay: 3, seconds: 12,
      alert: "The fume arm has swung off the weld. The fume off the flange is going up under your hood instead of down the arm.",
      cue: "You are breathing what the arm was meant to take.",
      target: "fume-arm",
      why: "An articulated arm drifts when its joints loosen, and the moment its hood is a foot from the arc it captures the smell and nothing else. On stainless the difference between a hood on the weld and a hood a foot away is the difference 29 CFR 1910.1026 draws between an exposure the shop can show was controlled and one it cannot; the pedal comes up, the arm goes back on the weld, and then the cycle runs.",
      missNote: "You held the pedal and finished the spots with the arm swung away. The fume went up under the hood and into your lungs for the rest of the cycle. Chromium exposure is not a burn you feel; it is a number on a medical record, and today's number was not controlled.",
      wrongNote: "It is the fume arm. Put the hood back on the weld — the extractor is running, it just is not pointed at anything.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMTW_ACCENT);

    const floor = box(g, 6.4, 0.06, 6.2, 0, 0.03, -0.3, 0x3a4048, { rough: 0.9, cast: false });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#262c33", base2: "#1f252b", step: 26 }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.25 });

    // ------------------------------------------------------ the booth
    // Screens on three sides, the bench with the stainless section and the
    // spot welder, the fume arm coming down from the ceiling.
    const booth = group(g, 0, 0.06, -1.4);
    const screens = [];
    for (const [x, z, ry] of [[-2.0, 0.2, Math.PI / 2], [2.0, 0.2, Math.PI / 2], [0, -1.6, 0]]) {
      const sc = barrierPanel(booth, x, z, { ry, w: 2.4, color: 0x5a3a2a });
      screens.push(sc);
    }
    const curtain = box(booth, 2.4, 1.6, 0.02, 0, 1.0, -1.6, 0x6a2a1a, { rough: 0.7, opacity: 0.55, transparent: true, cast: false });
    for (const sx of [-1.95, 1.95]) box(booth, 0.02, 1.6, 2.4, sx, 1.0, 0.2, 0x6a2a1a, { rough: 0.7, opacity: 0.55, transparent: true, cast: false });
    holoTag(booth, "booth 2 — stainless", 0, 2.0, -1.6, { css: "#9fb4c8", w: 0.36 });
    // Bench and the duct section on it.
    const bench = group(booth, -0.4, 0, -0.5);
    box(bench, 1.8, 0.06, 0.9, 0, 0.85, 0, 0x3a4048, { rough: 0.5, metal: 0.5 });
    for (const [sx, sz] of [[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.35], [0.8, 0.35]]) box(bench, 0.06, 0.82, 0.06, sx, 0.41, sz, 0x50606c, { rough: 0.6, metal: 0.4 });
    const section = group(bench, -0.2, 0.9, 0);
    box(section, 0.7, 0.35, 0.004, 0, 0.17, 0.18, 0xd0d6da, { rough: 0.25, metal: 0.85 });
    box(section, 0.7, 0.35, 0.004, 0, 0.17, -0.18, 0xd0d6da, { rough: 0.25, metal: 0.85 });
    box(section, 0.7, 0.004, 0.36, 0, 0.0, 0, 0xd0d6da, { rough: 0.25, metal: 0.85 });
    box(section, 0.7, 0.004, 0.36, 0, 0.35, 0, 0xd0d6da, { rough: 0.25, metal: 0.85 });
    holoTag(section, "stainless duct section", 0, 0.55, 0, { css: "#9fb4c8", w: 0.4 });
    const seamLine = box(section, 0.7, 0.01, 0.02, 0, 0.36, 0.18, 0xffffff, { rough: 0.5 });
    seamLine.visible = false; hits["seam-line"] = seamLine;
    const seamGap = box(section, 0.7, 0.006, 0.006, 0, 0.355, 0.18, 0x22262b, { rough: 0.6 });
    const bead = box(section, 0.68, 0.012, 0.014, 0, 0.36, 0.18, 0xc8b070, { rough: 0.4, metal: 0.7 });
    bead.visible = false;
    const porosity = box(section, 0.08, 0.016, 0.018, -0.15, 0.36, 0.18, 0x6a5a3a, { rough: 0.8 });
    porosity.visible = false;
    reg(hits, porosity, "porosity-spot");
    const arcStrike = ball(section, 0.012, 0.25, 0.3, 0.19, 0x3a3a3a, { rough: 0.9 });
    arcStrike.visible = false;
    reg(hits, arcStrike, "arc-strike");
    // Edge clamp on the bench end (dragged onto the seam).
    const clamp = group(bench, 0.65, 0.9, 0.3);
    box(clamp, 0.05, 0.14, 0.05, 0, 0.07, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    box(clamp, 0.2, 0.03, 0.05, 0.05, 0.14, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    cyl(clamp, 0.012, 0.012, 0.1, 0.12, 0.2, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, clamp, "edge-clamp");
    holoTag(bench, "edge clamp", 0.65, 1.15, 0.3, { css: "#9fb4c8", w: 0.24 });
    // The work clamp, with its lead running to the machine; the frayed stretch at the bench edge.
    const workClamp = group(bench, 0.3, 0.92, -0.3);
    box(workClamp, 0.1, 0.05, 0.04, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    box(workClamp, 0.06, 0.03, 0.03, 0.06, 0.02, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, workClamp, "work-clamp");
    holoTag(bench, "work lead clamp", 0.3, 1.1, -0.3, { css: "#9fb4c8", w: 0.3 });
    hose(bench, [[0.36, 0.9, -0.3], [0.9, 0.86, -0.4], [1.2, 0.5, -0.45], [1.4, 0.2, -0.5]], 0.014, 0x1b1e22, { steps: 16 });
    const fray = cyl(bench, 0.016, 0.016, 0.1, 0.92, 0.87, -0.41, 0xc87a3a, { rough: 0.4, metal: 0.8, seg: 8 });
    fray.rotation.z = Math.PI / 2;
    reg(hits, fray, "frayed-lead");
    // Oily rags on the bench (hazard) and the closed rag can.
    const rags = group(bench, -0.75, 0.9, 0.3);
    for (let i = 0; i < 3; i++) box(rags, 0.14, 0.03, 0.1, i * 0.03, i * 0.025, i * 0.02, 0x6a5a4a, { rough: 0.95 });
    reg(hits, rags, "oily-rags");
    holoTag(bench, "rags — in the can", -0.75, 1.1, 0.3, { css: "#d2312b", w: 0.3 });
    const ragCan = cyl(g, 0.16, 0.14, 0.4, -2.4, 0.26, 0.4, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 14 });
    cyl(g, 0.17, 0.17, 0.03, -2.4, 0.47, 0.4, 0x8a1010, { rough: 0.5, metal: 0.3, seg: 14 });
    holoTag(g, "rag can", -2.4, 0.66, 0.4, { css: "#9fb4c8", w: 0.2 });

    // The TIG machine, torch and the argon on its rack.
    const machine = group(booth, 1.4, 0, -0.9, -0.4);
    box(machine, 0.6, 0.7, 0.5, 0, 0.55, 0, 0x2f4a6a, { rough: 0.6, metal: 0.3 });
    box(machine, 0.62, 0.2, 0.52, 0, 0.1, 0, 0x22262b, { rough: 0.6 });
    decal(machine, 0.5, 0.14, 0, 0.75, 0.26, signFace("GTAW · 200 A", { bg: "#0d1c24", accent: "#9fb4c8", scale: 0.5 }));
    const ampsFace = decal(machine, 0.24, 0.1, -0.12, 0.55, 0.26, signFace("-- A", { bg: "#0d1c24", accent: "#9fb4c8", fg: "#dff2fb", scale: 0.6 }), { glow: true, ei: 0.7 });
    const torch = group(bench, -0.2, 0.92, 0.5);
    cyl(torch, 0.018, 0.018, 0.18, 0, 0.09, 0, 0x22262b, { rough: 0.5, seg: 10 });
    cyl(torch, 0.012, 0.012, 0.05, 0, 0.2, 0, 0xf2c6a0, { rough: 0.4, seg: 10 });
    cyl(torch, 0.004, 0.004, 0.04, 0, 0.24, 0, 0x8a8f94, { rough: 0.3, metal: 0.8, seg: 6 });
    reg(hits, torch, "tig-torch");
    holoTag(bench, "TIG torch", -0.2, 1.3, 0.5, { css: "#9fb4c8", w: 0.22 });
    hose(bench, [[-0.2, 0.92, 0.5], [0.4, 0.9, 0.7], [1.2, 0.8, 0.2], [1.6, 0.6, -0.3]], 0.012, 0x2b2f34, { steps: 16 });
    const arc = ball(torch, 0.025, 0, 0.27, 0, 0xbfeaff, { emissive: 0xbfeaff, ei: 3.0 });
    arc.visible = false;
    const argon = cylinderTank(booth, 2.4, -0.4, 0x4a6a3a, { h: 1.4, r: 0.11 });
    holoTag(booth, "argon — chained", 2.4, 1.7, -0.4, { css: "#9fb4c8", w: 0.3 });
    const argonValve = group(booth, 2.4, 1.48, -0.4);
    cyl(argonValve, 0.03, 0.03, 0.06, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 10 });
    const valveWheelMesh = torus(argonValve, 0.05, 0.01, 0, 0.05, 0, 0xb8402f, { rough: 0.5, seg: 6, seg2: 16 });
    valveWheelMesh.rotation.x = Math.PI / 2;
    reg(hits, argonValve, "argon-valve");
    const regulator = group(booth, 2.4, 1.36, -0.26);
    cyl(regulator, 0.04, 0.04, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const flowTube = cyl(regulator, 0.012, 0.012, 0.16, 0.06, 0.06, 0.02, 0xdfe9ee, { rough: 0.1, opacity: 0.5, transparent: true, seg: 8 });
    const flowBall = ball(regulator, 0.008, 0.06, 0.0, 0.02, 0x22262b, { rough: 0.5 });
    const flowFace = decal(regulator, 0.14, 0.05, 0, -0.06, 0.02, signFace("-- cfh", { bg: "#0d1c24", accent: "#9fb4c8", fg: "#dff2fb", scale: 0.55 }), { glow: true, ei: 0.7 });
    reg(hits, regulator, "flow-regulator");
    holoTag(booth, "flowmeter", 2.4, 1.15, -0.2, { css: "#9fb4c8", w: 0.24 });
    const spareBottle = cylinderTank(g, 2.9, 1.2, 0x4a6a3a, { h: 1.4, r: 0.11 });
    spareBottle.rotation.z = 0.08;
    const chain = torus(g, 0.14, 0.008, 2.9, 0.06, 1.2, 0x8a8f94, { rough: 0.5, metal: 0.7, seg: 6, seg2: 16 });
    chain.rotation.x = Math.PI / 2;
    reg(hits, spareBottle, "unchained-bottle");
    holoTag(g, "spare argon", 2.9, 1.7, 1.2, { css: "#9fb4c8", w: 0.26 });

    // The fume arm from the ceiling, its switch, and the hood over the seam.
    const armBase = group(booth, 0.4, 0, 0.3);
    cyl(armBase, 0.1, 0.1, 0.1, 0, 2.7, 0, 0x2b2f34, { rough: 0.6, metal: 0.4, seg: 12, cast: false });
    const arm1 = group(armBase, 0, 2.65, 0);
    const seg1 = cyl(arm1, 0.07, 0.07, 1.2, 0, -0.5, 0.2, 0x6a6f74, { rough: 0.7, seg: 12 });
    seg1.rotation.x = 0.35;
    const arm2 = group(arm1, 0, -1.05, 0.55);
    const seg2 = cyl(arm2, 0.06, 0.06, 0.8, -0.3, -0.25, 0, 0x6a6f74, { rough: 0.7, seg: 12 });
    seg2.rotation.z = 0.9;
    const hood = group(arm2, -0.68, -0.5, 0);
    cyl(hood, 0.16, 0.08, 0.16, 0, 0, 0, 0x50606c, { rough: 0.6, metal: 0.4, seg: 14 });
    ball(hood, 0.02, 0, 0.1, 0.12, 0x59c97b, { emissive: 0x59c97b, ei: 1.4 });
    reg(hits, hood, "fume-arm");
    holoTag(hood, "fume arm hood", 0, 0.25, 0, { css: "#9fb4c8", w: 0.3 });
    const fumeSwitch = group(booth, 1.9, 1.3, 0.9);
    box(fumeSwitch, 0.1, 0.14, 0.05, 0, 0, 0, 0x22262b, { rough: 0.6 });
    box(fumeSwitch, 0.02, 0.08, 0.02, 0, -0.02, 0.03, 0xd2312b, { rough: 0.5 });
    decal(fumeSwitch, 0.14, 0.04, 0, 0.1, 0.026, signFace("FUME FAN", { bg: "#22262b", accent: "#9fb4c8", scale: 0.5 }));
    reg(hits, fumeSwitch, "fume-switch-off");
    holoTag(booth, "fume fan — OFF", 1.9, 1.5, 0.9, { css: "#d2312b", w: 0.3 });
    const fume = particles(section, 30, 0x9aa3a8, { size: 0.03, spread: 0.3 });
    fume.position.set(0, 0.5, 0.18); fume.visible = false;

    // The spot welder at the booth's right, pedal on the floor, tips, water line, wet gloves.
    const spot = group(g, 1.6, 0.06, 0.6, -0.9);
    box(spot, 0.5, 1.3, 0.6, 0, 0.65, 0, 0x2f4a6a, { rough: 0.6, metal: 0.3 });
    box(spot, 0.14, 0.14, 0.7, 0, 1.4, 0.3, 0x50606c, { rough: 0.6, metal: 0.4 });          // upper arm
    box(spot, 0.14, 0.14, 0.7, 0, 0.95, 0.3, 0x50606c, { rough: 0.6, metal: 0.4 });         // lower arm
    const tipTop = cyl(spot, 0.02, 0.014, 0.12, 0, 1.28, 0.62, 0xc87a3a, { rough: 0.4, metal: 0.8, seg: 10 });
    const tipLow = cyl(spot, 0.014, 0.02, 0.12, 0, 1.08, 0.62, 0xc87a3a, { rough: 0.4, metal: 0.8, seg: 10 });
    const tipsGroup = group(spot, 0, 1.18, 0.62);
    box(tipsGroup, 0.06, 0.02, 0.06, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tipsGroup, "spot-tips-cool");
    const flange = box(spot, 0.3, 0.004, 0.08, 0, 1.18, 0.62, 0xd0d6da, { rough: 0.25, metal: 0.85 });
    decal(spot, 0.4, 0.12, 0, 0.6, 0.31, signFace("SPOT WELDER", { bg: "#0d1c24", accent: "#9fb4c8", scale: 0.5 }));
    const pedal = group(spot, 0, 0, 0.7);
    box(pedal, 0.3, 0.06, 0.22, 0, 0.03, 0, 0xe8b02e, { rough: 0.6 });
    const pedalPad = box(pedal, 0.26, 0.02, 0.18, 0, 0.07, 0, 0x22262b, { rough: 0.6 });
    reg(hits, pedal, "spot-pedal");
    holoTag(spot, "spot pedal", 0, 0.3, 0.7, { css: "#9fb4c8", w: 0.24 });
    hose(spot, [[0.25, 0.3, -0.2], [0.4, 0.2, 0.1], [0.5, 0.15, 0.4]], 0.012, 0x2f6f8c, { steps: 10 });
    const wetGloves = group(spot, 0.32, 0.5, 0.3);
    for (const sx of [-0.03, 0.03]) box(wetGloves, 0.05, 0.13, 0.02, sx, 0, 0, 0x4a4a3a, { rough: 0.95 });
    reg(hits, wetGloves, "wet-gloves");
    holoTag(spot, "wet gloves", 0.32, 0.7, 0.3, { css: "#d2312b", w: 0.24 });
    const file = group(spot, -0.32, 0.72, 0.4);
    box(file, 0.02, 0.24, 0.005, 0, 0, 0, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    box(file, 0.03, 0.08, 0.03, 0, -0.16, 0, 0x6a3a1a, { rough: 0.8 });
    reg(hits, file, "tip-dress-file");
    holoTag(spot, "tip dressing file", -0.32, 0.95, 0.4, { css: "#9fb4c8", w: 0.32 });

    // ------------------------------------------------- board, WPS, PPE, log
    const board = group(g, -2.8, 0.06, 1.6, 1.0);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("WELD SHOP — TODAY", ["Booth 2: apprentice (you) — SS", "Fire watch: helper, 1400–1600", "Booth 1: journeyman — carbon", "Fume arm 2: fan checked? ____", "Lead: on the floor"], { bg: "#eef1f3", band: "#9fb4c8" }), { px: 384 });
    reg(hits, boardFace, "weld-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoPanel(g, 0.7, 0.5, -1.4, 1.7, 2.3, (ctx, w, h) => {
      ctx.fillStyle = "#0b141c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9fb4c8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#dff2fb";
      ctx.fillText("WELD PROCEDURE — WPS SS-16", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["GTAW, 304 stainless, 1.2 mm", "Filler: ER308L, 1.6 mm", "Amps: 55–70 DCEN · argon 15 cfh", "Travel: 180–260 mm/min", "Accept: AWS D9.1 visual, no porosity"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMTW_ACCENT, ry: 0.3 });
    const wpsHit = box(g, 0.7, 0.5, 0.04, -1.4, 1.7, 2.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    wpsHit.rotation.y = 0.3;
    reg(hits, wpsHit, "wps-sheet");
    const ppe = group(g, 2.7, 0.06, 2.2, -1.1);
    box(ppe, 0.6, 0.9, 0.16, 0, 1.25, 0, 0x2b2f34, { rough: 0.6 });
    decal(ppe, 0.54, 0.1, 0, 1.65, 0.085, signFace("PPE — WELD", { bg: "#0d1c24", accent: "#9fb4c8", scale: 0.5 }));
    const jacket = group(ppe, -0.16, 1.3, 0.1);
    box(jacket, 0.2, 0.3, 0.04, 0, 0, 0, 0x6a4a2a, { rough: 0.85 });
    reg(hits, jacket, "weld-jacket");
    const tshirt = box(ppe, 0.18, 0.22, 0.03, -0.16, 0.95, 0.1, 0xe8e2d0, { rough: 0.9 });
    reg(hits, tshirt, "bare-arm-arc");
    holoTag(ppe, "T-shirt — not for the arc", -0.16, 0.8, 0.12, { css: "#d2312b", w: 0.4 });
    const gloves = group(ppe, 0.08, 1.3, 0.1);
    for (const sx of [-0.03, 0.03]) box(gloves, 0.05, 0.13, 0.02, sx, 0, 0, 0xd8c8a0, { rough: 0.8 });
    reg(hits, gloves, "tig-gloves");
    const hoodShell = group(ppe, 0.22, 1.32, 0.1);
    box(hoodShell, 0.12, 0.18, 0.06, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    box(hoodShell, 0.09, 0.04, 0.01, 0, 0.03, 0.035, 0x2f5a3a, { rough: 0.3, opacity: 0.8, transparent: true });
    reg(hits, hoodShell, "hood-shade");
    const logBoard = group(g, 2.85, 0.06, -1.4, -0.9);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("WELD LOG — BOOTH 2", ["WPS SS-16 — 304 SS", "Amps/flow: ____", "Defects: ____", "Fume arm: ____", "Signed: ____"], { bg: "#f4efe4", band: "#9fb4c8" }), { px: 256 });
    reg(hits, logFace, "weld-log");
    holoTag(logBoard, "weld log", 0, 1.5, 0, { css: "#9fb4c8", w: 0.22 });
    // The fire watch's radio on the booth post.
    const radio = group(booth, -1.95, 1.3, 1.3);
    box(radio, 0.06, 0.12, 0.04, 0, 0, 0, 0x22262b, { rough: 0.6 });
    cyl(radio, 0.006, 0.006, 0.1, 0.015, 0.1, 0, 0x1b1e22, { rough: 0.5, seg: 6 });
    ball(radio, 0.008, -0.015, 0.03, 0.022, 0x59c97b, { emissive: 0x59c97b, ei: 1.5 });
    reg(hits, radio, "watch-radio");
    holoTag(booth, "fire watch radio", -1.95, 1.5, 1.3, { css: "#9fb4c8", w: 0.3 });

    // --------------------------------------------------------- the crew
    // The fire watch behind the left screen by the cardboard pallet, the lead by the board.
    const watch = standingFigure(g, -2.7, -2.4, { ry: 0.9, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b });
    const lead = standingFigure(g, -2.3, 2.6, { ry: 2.9, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0x9fb4c8, gloves: true });
    const pallet = group(g, -2.6, 0.06, -1.3, 0.2);
    box(pallet, 0.9, 0.08, 0.7, 0, 0.04, 0, 0x8b6a42, { rough: 0.9 });
    for (let i = 0; i < 4; i++) box(pallet, 0.8 - i * 0.05, 0.22, 0.6 - i * 0.04, 0, 0.2 + i * 0.22, 0, 0xb08a5a, { rough: 0.95 });
    holoTag(pallet, "packing cardboard", 0, 1.2, 0, { css: "#d2312b", w: 0.34 });
    const smoke = particles(pallet, 20, 0x8a8a8a, { size: 0.04, spread: 0.3 });
    smoke.position.set(0, 1.1, 0); smoke.visible = false;

    // ----------------------------------------------------- shop dressing
    for (const sx of [-1.6, 0.4, 2.2]) {
      box(g, 0.6, 0.06, 0.2, sx, 2.75, -0.2, 0x2b2f34, { rough: 0.6, cast: false });
      box(g, 0.56, 0.02, 0.16, sx, 2.72, -0.2, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.2, rough: 0.5, cast: false });
    }
    for (const [x, z] of [[-1.0, 2.9], [2.6, -2.7], [0.8, 2.9]]) cone(g, x, z);
    const ext = group(g, 2.9, 0.06, -0.2, -0.8);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });
    const signBoard = group(g, 0.4, 0.06, 2.85, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("NO WATCH\nNO ARC", { bg: "#0d1c24", accent: "#9fb4c8", fg: "#dff2fb", scale: 0.32 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const fillerRack = group(g, 2.5, 0.06, -2.6, -0.5);
    box(fillerRack, 0.5, 1.2, 0.2, 0, 0.6, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 4; i++) cyl(fillerRack, 0.03, 0.03, 0.9, -0.15 + i * 0.1, 0.9, 0.12, [0xd0d6da, 0xc87a3a, 0xd0d6da, 0x8a8f94][i], { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(fillerRack, "filler — ER308L · ER70S", 0, 1.5, 0.1, { css: "#9fb4c8", w: 0.42 });
    const grinder = group(g, -1.2, 0.06, 0.9, 0.4);
    box(grinder, 0.5, 0.05, 0.4, 0, 0.7, 0, 0x3a4048, { rough: 0.5, metal: 0.5 });
    for (const [sx, sz] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) box(grinder, 0.04, 0.7, 0.04, sx, 0.35, sz, 0x50606c, { rough: 0.6, metal: 0.4 });
    cyl(grinder, 0.05, 0.05, 0.16, 0, 0.78, 0, 0x2b2f34, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    cyl(grinder, 0.07, 0.07, 0.01, 0.1, 0.78, 0, 0x4a4a4a, { rough: 0.8, seg: 20 }).rotation.z = Math.PI / 2;
    holoTag(grinder, "grinder — guard on", 0, 1.0, 0, { css: "#9fb4c8", w: 0.32 });
    const waterLine = hose(g, [[1.6, 0.06, 1.2], [2.0, 0.06, 1.8], [2.6, 0.06, 2.4]], 0.012, 0x2f6f8c, { steps: 10 });
    const stool = group(g, 0.2, 0.06, 0.6, 0);
    cyl(stool, 0.16, 0.16, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, seg: 14 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; cyl(stool, 0.012, 0.012, 0.5, Math.sin(a) * 0.12, 0.25, Math.cos(a) * 0.12, 0x50606c, { rough: 0.6, metal: 0.4, seg: 6 }); }

    let welding = false, spotting = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.4, 1.1, -1.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "argon-open") { valveWheelMesh.rotation.z = Math.PI; }
        if (step.id === "fitup") { clamp.parent.remove(clamp); section.add(clamp); clamp.position.set(0.25, 0.3, 0.18); clamp.rotation.set(0, 0, 0); seamGap.visible = false; }
        if (step.id === "extractor-arm") { arm2.rotation.y = -0.6; hood.position.x = -0.62; }
        if (step.id === "weld-run") { bead.visible = true; porosity.visible = true; arcStrike.visible = true; arc.visible = false; fume.visible = false; }
        if (step.id === "weld-inspect") { porosity.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.6 }); arcStrike.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.6 }); }
        if (step.id === "tip-dress") { tipTop.material = mat(0xe0a060, { rough: 0.3, metal: 0.85 }); tipLow.material = mat(0xe0a060, { rough: 0.3, metal: 0.85 }); }
        if (step.id === "bottle-walk") { spareBottle.rotation.z = 0; chain.position.y = 1.0; fray.material = mat(0x1b1e22, { rough: 0.7 }); }
        if (step.id === "weld-log") repaint(logFace, paperFace("WELD LOG — BOOTH 2", ["WPS SS-16 — 304 SS", "Amps/flow: 62 A / 15 cfh", "Porosity, arc strike — ground, re-run", "Fume arm: on seam, fan checked", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#9fb4c8" }));
      },
      onHazard() {},
      // The watch really walks off; the arm really swings off the weld.
      onInterrupt(it) {
        if (it.id === "fire-watch-away") { watch.position.set(-2.9, 0, 2.2); watch.rotation.y = 2.4; smoke.visible = true; }
        if (it.id === "arm-swung") { arm2.rotation.y = 1.4; hood.position.x = -0.9; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "fire-watch-away") { watch.position.set(-2.7, 0, -2.4); watch.rotation.y = 0.9; smoke.visible = false; }
        if (it.id === "arm-swung") { arm2.rotation.y = -0.6; hood.position.x = -0.62; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        welding = !!(step?.id === "weld-run" && session.holding);
        spotting = !!(step?.id === "spot-weld" && session.holding);
        arc.visible = welding;
        fume.visible = welding || spotting;
        if (welding) torch.position.x = -0.2 + (session.track?.inBand ?? 0) / 6 * 0.6;
        tipTop.position.y += ((spotting ? 1.22 : 1.28) - tipTop.position.y) * Math.min(1, dt * 6);
        pedalPad.position.y = spotting ? 0.05 : 0.07;
        if (session?.track && step?.id === "weld-run") repaint(ampsFace, signFace(`${Math.round(50 + session.track.v * 30)} A`, { bg: "#0d1c24", accent: "#9fb4c8", fg: "#dff2fb", scale: 0.6 }));
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "flow-set") {
          flowBall.position.y = gg.t * 0.14 - 0.01;
          repaint(flowFace, signFace(`${Math.round(gg.t * 30)} cfh`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#dff2fb", scale: 0.55 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "argon-open") valveWheelMesh.rotation.z = tn.amount * Math.PI * 2;
        if (smoke.visible && smoke.position) smoke.position.y = 1.1 + Math.sin(t * 2) * 0.05;
      },
    };
  },
};
