import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, rackFrame, rackUnit, cone, lockTag,
  standingFigure, surfaceTexture, texturedMat, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shop Layout and Shear VR — Manufacturing & Automation, the
// first of the SMART sheet metal pack. A sheet metal shop's first machine:
// the layout table where the cut list becomes scribed lines on a blank, and
// the hydraulic squaring shear that turns the blank into strips. The blade is
// the lesson. A shear does not look dangerous — nothing spins, nothing
// sparks — and that is exactly why the finger guard, the back gauge and the
// treadle discipline exist: the ram closes on whatever is under it, in the
// time it takes to glance at the drop.

const SMSL_ACCENT = 0xd88a3a;

export const SIM_SM_SHOP_LAYOUT_AND_SHEAR = {
  id: "sm-shop-layout-and-shear",
  index: "217",
  domain: "Manufacturing & Automation",
  trade: "Sheet metal worker — SMART, trained through its International Training Institute shop curriculum",
  category: "Manufacturing & Automation",
  indoor: "shop",
  certification: "SMART and its International Training Institute sheet metal apprenticeship (shop fabrication year); OSHA 29 CFR 1910.212 machine guarding, with the point-of-operation guarding logic of 1910.217 applied to a hydraulic squaring shear; 29 CFR 1910.147 lockout/tagout for blade-gap and knife work; 29 CFR 1910.138 hand protection against sheared edges; ANSI B11 machine safety series; SMACNA HVAC Duct Construction Standards for the gauges and pressure classes a cut list is written to",
  name: "Shop Layout and Shear",
  title: simTitle("Shop Layout and Shear"),
  tagline: "Cut list to scribed blank, back gauge and blade gap set, guards walked, a full treadle stroke with hands behind the finger guard, drops hooked off the back, edges checked and logged",
  accent: SMSL_ACCENT,
  accentCss: "#d88a3a",
  parSeconds: 270,
  footprint: 2.2,
  badge: { id: "blade-line-clear", name: "Blade Line Clear", note: "A whole cut list sheared with nothing but steel under the blade — hands behind the guard, drops hooked, edges checked" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's apprenticeship coordinator or the shop steward, or your employer's employee assistance program if the near-miss at the blade is what stayed with you",

  game: system({
    name: "Shear Line",
    currency: "STRIP",
    ranks: ["Pre-apprentice", "Shop Apprentice", "Shear Operator", "Layout Lead", "Shear Line Certified"],
    badges: [
      { id: "square-first", name: "Square First", note: "The blank laid out from the cut list, not from the last job's offcut", test: AWARD.stepClean("layout") },
      { id: "hands-behind", name: "Hands Behind", note: "Never under the blade, never bare into the drops", test: AWARD.safe },
      { id: "on-the-line", name: "On The Line", note: "Back gauge inside the cut list's tolerance", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-list", name: "Clean List", note: "The whole cut list without a correction", test: AWARD.clean },
      { id: "full-stroke", name: "Full Stroke", note: "Never let the treadle up mid-stroke", test: AWARD.unbroken },
      { id: "list-in-time", name: "List In Time", note: "Sheared and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hand-in-shear": "Your hand went under the blade line to square the blank. The hold-downs come down a fraction ahead of the knife and the knife does not know a finger from a burr; the finger guard sits where it does so that the only thing you can put past it is steel. Squaring is done from the front edge and the squaring arm, never from under the guard.",
    "guard-bypass": "You turned the finger guard's bypass key so a wide blank would go in easier. The guard is the point-of-operation protection 29 CFR 1910.212 asks for on this machine, and a key that lifts it out of the way lifts it out of the way for the next operator too, who does not know it was turned. Wide blanks are fed from the side with the guard where it belongs.",
    "drop-pile": "You reached bare-handed into the pile of drops behind the shear. A freshly sheared edge is a knife with a burr on it, and the pile is a stack of them at every angle; SMART shops lose more hands to offcuts than to blades. The drops come off the back table with the hook and go onto the cart with cut-resistant gloves on.",
    "rack-edge": "You grabbed a full sheet off the rack by its raw edge without gloves. Mill-cut edges on stock sheet are the same wound as a sheared one, only longer, and a sheet that starts to slide takes the hand with it. Gloves on before the rack, two people or the vacuum lifter on anything you cannot carry one-handed.",
  },

  lateNotes: {
    "treadle": "Not yet. The back gauge is set, the blade gap is right for this gauge and the guards are walked before the treadle is touched — a stroke taken to see what happens is a stroke taken with a hand somewhere you have not checked.",
    "drop-hook": "The hook comes out after the strokes, not during them. A hook in the drop space while the treadle is live is a hand in the drop space by another name.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "crew-board",
      title: "Check in with the shop lead at the crew board",
      cue: "Find your name on the board, the machine you are on and who else is working this shear today.",
      why: "The crew board is where a shop knows who is at which machine, and it is the reason a second person never walks up behind a shear that somebody else is running. Checking in also tells the lead that a first-year is on the blade, which changes who they keep an eye on; SMART shops run the board as a control, not a formality, because a shear with two operators and no board is how a hand ends up under a blade nobody knew was live.",
    },
    {
      id: "cut-list", kind: "select", target: "cut-list",
      title: "Read the cut list",
      cue: "Material, gauge, strip widths, quantity and the tolerance — and the pressure class the duct will be built to.",
      why: "The cut list carries the SMACNA pressure class the fitting is built to, and that class sets the gauge, which sets the shear's capacity check and the blade gap. A strip cut from whatever sheet was nearest the machine is a strip that is either too light for the pressure it will see or too heavy for the seam that has to close around it, and neither error is visible until the duct is up.",
    },
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["cut-gloves", "safety-glasses", "ear-muffs"],
      itemNames: { "cut-gloves": "cut-resistant gloves", "safety-glasses": "safety glasses", "ear-muffs": "hearing protection" },
      title: "Dress for the shear",
      cue: "Cut-resistant gloves, glasses and hearing protection from the station, before you touch stock.",
      why: "Sheared edges cut through cotton and leather as if they were not there; the gloves 29 CFR 1910.138 asks for at this machine are rated for the edge, not chosen for comfort. Glasses are for the burr that flies when a strip springs off the table, and the muffs are because a shear stroke is a loud, sharp impulse every few seconds for an entire shift, the kind of noise that takes hearing slowly enough that nobody notices it going.",
    },
    {
      id: "layout", kind: "drag", target: "layout-square",
      title: "Lay out the first cut on the blank",
      cue: "Carry the square from the tool chest to the blank and scribe the first strip line from the cut list.",
      why: "Layout is where the cut list becomes a line on a piece of metal, and the square is what makes that line perpendicular to the edge the back gauge will register against. A blank scribed by eye off the last job's offcut gives you strips that are out of square by an amount you cannot see on the table and cannot hide on the brake, where every bend follows the error.",
      drag: { to: "sheet-mark", radius: 0.4, missNote: "The square is not against the reference edge — a line scribed off a burr is off by the burr." },
    },
    {
      id: "capacity", kind: "select", target: "capacity-plate",
      title: "Check the capacity plate against the gauge",
      cue: "Read the rated thickness for this material off the plate on the frame before the blank goes on the table.",
      why: "A shear is rated in mild steel, and the plate also gives the reduced capacity for stainless and the note about aluminium; a blank over the rating does not refuse to cut, it stalls the ram part way, chips the knife or springs the sheet back off the table at the operator. The cut list names the material and the plate names what this machine can do to it, and those two numbers are compared every time the material changes.",
    },
    {
      id: "back-gauge", kind: "gauge", target: "shear-gauge",
      title: "Set the back gauge to the strip width",
      cue: "Run the back gauge to the cut list's width and commit inside the tolerance.",
      why: "The back gauge is what turns one setting into fifty identical strips; it is set to the list's number and proven on the first strip with a tape, never left where the last job put it because the width looks about right. A gauge a few millimetres out gives you a run of strips that are all wrong the same way, which is worse than one wrong strip because nobody measures the second one.",
      gauge: { label: "GAUGE", speed: 0.75, green: [0.46, 0.6], readout: (t) => `${(80 + t * 240).toFixed(0)} mm`, missNote: "Off the list's width — every strip in the run inherits that error. Reset it." },
    },
    {
      id: "blade-gap", kind: "turn", target: "gap-knob",
      title: "Set the blade gap for the gauge",
      cue: "Turn the gap adjuster to the chart value for this thickness — with the ram up and your hands on the knob, not the knife.",
      why: "The clearance between the upper and lower knives is set as a fraction of the sheet thickness; too tight and the knives rub and chip, too wide and the sheet folds into the gap instead of shearing, leaving a burr you will feel on every strip and a twist you will see on the brake. The adjuster is on the frame so the setting is made without a hand near the knife, and the chart on the machine is the only source for the number.",
      turn: { turns: 0.75, axis: "y", label: "GAP" },
    },
    {
      id: "guard-walk", kind: "find", noHint: true,
      targets: ["finger-guard-gap", "treadle-cover"],
      itemNames: { "finger-guard-gap": "the finger guard set too high", "treadle-cover": "the treadle with its cover off" },
      itemNotes: {
        "finger-guard-gap": "The finger guard has been raised to clear a thick blank on the last job and left there — the gap under it takes a hand, which is the one dimension it must never have.",
        "treadle-cover": "The treadle's cover is missing. A dropped strip or a boot landing on an uncovered treadle is a stroke nobody called, with whoever is at the table where they are.",
      },
      title: "Walk the guards before the first stroke",
      cue: "Look at the finger guard and the treadle and click what has been left wrong.",
      why: "Guards on a shear get moved for a reason and left for none; the finger guard goes up for one thick job and stays up, the treadle cover comes off for a hydraulic repair and never goes back. 29 CFR 1910.212 does not ask that a guard was fitted once, it asks that the point of operation is guarded now, and the only way to know that is to look at both before the machine is live.",
    },
    {
      id: "load", kind: "select", target: "sheet-blank",
      title: "Load the blank against the gauge",
      cue: "Slide the scribed blank in along the squaring arm until it registers on the back gauge, hands on the front edge and the arm only.",
      why: "The blank is registered by pushing it in until the back gauge stops it and the squaring arm squares it; that is a two-handed job done entirely in front of the finger guard. Reaching under to feel the gauge with your fingers is how a hand ends up on the blade line at the moment the hold-downs come down, and the gauge tells you it has registered by the way the sheet stops, not by touch.",
    },
    {
      id: "stroke", kind: "hold", target: "treadle", seconds: 3,
      title: "Take the stroke",
      cue: "Hands on the front of the blank, well back from the guard, then hold the treadle through the whole stroke until the ram returns.",
      why: "A shear stroke is hold-downs, knife, return; letting the treadle up part way leaves the ram down on the sheet with the drop half cut and hanging, and the instinct then is to reach in and free it. One deliberate stroke, held until the ram is back at the top, is the whole discipline — the machine does its cycle and your hands do not move until it has.",
      holdBreakNote: "Treadle released mid-stroke — the ram stopped in the sheet. Let it return, and take the stroke through.",
    },
    {
      id: "feed", kind: "track", target: "feed-handle", seconds: 6,
      title: "Feed the run of strips",
      cue: "Advance the blank between strokes with the squaring-arm handle at a steady pace — not so fast that it bounces off the gauge, not so slow the strip cools your rhythm.",
      why: "Production shearing is a rhythm of feed, register, stroke, and the feed is where the error creeps in: a blank shoved hard into the gauge bounces back a millimetre before the hold-downs land, and a blank crept in gets a hand on it to hurry it up. A steady feed on the handle keeps both hands on the arm and every strip the same width, which is the point of a back gauge in the first place.",
      track: { label: "FEED", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 40)} strips/min` },
      holdBreakNote: "The feed fell out of rhythm — a blank bounced off the gauge and the strip came out wide. Settle the pace and hold it.",
    },
    {
      id: "drops", kind: "sequence",
      targets: ["drop-hook", "drop-cart"],
      itemNames: { "drop-hook": "hook the drops off the back table", "drop-cart": "stack them on the cart" },
      title: "Clear the drops off the back",
      cue: "With the ram up and your foot off the treadle: hook the drops off the back table, then stack them on the cart.",
      why: "The drops land on the back table with a burr up and an edge out, and they are cleared with the hook first because the hook is what keeps your arm out of the space behind the knife. Onto the cart second, gloved, stacked flat, because a drop left on the back table rides under the next sheet and comes out of the shear as a jammed cut, and a drop on the floor is a blade someone steps on.",
      outOfOrderNote: "Hook first, then cart — the hook is what keeps your arm out of the drop space while the shear is still live.",
    },
    {
      id: "edge-check", kind: "find", noHint: true,
      targets: ["burr-edge", "bowed-strip"],
      itemNames: { "burr-edge": "the strip with a heavy burr", "bowed-strip": "the strip with a bow in it" },
      itemNotes: {
        "burr-edge": "That burr means the blade gap opened up or the knife has a chip in it — the strip is fine for a hem, wrong for a Pittsburgh lock, and the gap gets checked before the next sheet.",
        "bowed-strip": "A bow along the strip is the sheet twisting into the knife because the hold-downs were not fully down — the treadle was let up early on that one and it shows.",
      },
      title: "Check the strips before they go to the brake",
      cue: "Run a gloved thumb along the stack and click the two strips that tell you something about the machine.",
      why: "Every strip is a record of the stroke that made it: the burr says what the knife gap was, the bow says whether the hold-downs had it, the width says whether the gauge held. The brake operator downstream cannot fix any of those, only inherit them into a bend, so the shear operator reads the stack before it leaves the table — while the machine that made the fault is still the one in front of you.",
    },
    {
      id: "log", kind: "select", target: "shop-log",
      title: "Close out the shop log",
      cue: "Enter the job, the gauge, the gap setting, the strip count and the guard fault you found, and sign it.",
      why: "The log is how the next operator on this shear knows the finger guard had been left high and the treadle cover was off, and how the shop knows the knife gap has drifted before it chips. A cut list that ends without a log entry leaves the machine's faults for the next person to rediscover with their hands, which is the one way a shop should never learn anything twice.",
    },
  ],

  // Two things that happen at a shear while your foot is on the treadle and
  // your hands are on the feed. See shared/game.js.
  interrupts: [
    {
      id: "helper-behind",
      kind: "Hand behind the blade",
      after: "stroke", delay: 3, seconds: 12,
      alert: "A helper has walked round the back of the shear to catch the drops as they fall, and has a hand under the blade line from behind.",
      cue: "There is a hand in the drop space and your foot is on the treadle.",
      target: "e-stop",
      why: "The finger guard protects the front of the shear. The back of it is protected by nothing but the rule that nobody is there while the ram is live, and a helper trying to be useful has just broken it. The treadle does not know the difference between a drop and a wrist; the stop button does not care whose foot is on the treadle.",
      missNote: "You finished the stroke with somebody's hand behind the knife. The drop fell clear that time. A shear does not warn; the next stroke would have taken the hand and the shop would have spent a year explaining why a helper was behind a live shear at all.",
      wrongNote: "It is the emergency stop. Kill the ram first — the helper can be spoken to when the machine is dead.",
    },
    {
      id: "pump-weep",
      kind: "Hydraulic leak",
      after: "feed", delay: 3, seconds: 12,
      alert: "The hydraulic pump under the table has started weeping. A slick of oil is spreading across the floor towards the treadle.",
      cue: "Your footing at the treadle is going, and the pump is still running.",
      target: "pump-disconnect",
      why: "Hydraulic oil under a treadle is a foot that slips onto the stroke, and a pump that is weeping is a hose about to let go under pressure. The disconnect on the pump isolates it; the feed can wait, the strips can wait, and the floor gets cleaned with the machine dead rather than with the ram able to come down while you kneel beside it.",
      missNote: "You kept feeding strips with oil spreading under your boots. A slip at a shear treadle is a stroke you did not call, taken with your weight going forward towards the table — and the hose that was weeping was building to a burst that would have put oil across the whole line.",
      wrongNote: "It is the pump disconnect. The oil stops when the pump stops, and nothing else on this machine fixes the floor.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMSL_ACCENT);

    // The shop floor: anti-slip deck plate, textured rather than flat.
    const floor = box(g, 6.4, 0.06, 6.0, 0, 0.03, -0.2, 0x3a4048, { rough: 0.9, cast: false });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#2a3038", base2: "#22282f" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.25 });
    // A painted walk lane and the blade-line keep-out stripe.
    box(g, 6.0, 0.005, 0.08, 0, 0.062, 1.9, 0xe8b02e, { rough: 0.8, cast: false });
    box(g, 4.2, 0.005, 0.08, 0, 0.062, -2.6, 0xd2312b, { rough: 0.8, cast: false });

    // ------------------------------------------------------- the squaring shear
    const shear = group(g, 0, 0.06, -1.5);
    for (const sx of [-1.7, 1.7]) box(shear, 0.5, 2.0, 0.9, sx, 1.0, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    box(shear, 3.9, 0.45, 0.7, 0, 2.1, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    box(shear, 3.0, 0.5, 0.9, 0, 0.55, 0.15, 0x3a4048, { rough: 0.6, metal: 0.5 });              // table
    box(shear, 3.0, 0.03, 0.6, 0, 0.815, 0.3, 0x7c868f, { rough: 0.4, metal: 0.7 });               // table top
    const ram = box(shear, 3.0, 0.5, 0.22, 0, 1.55, -0.12, 0x5f6b76, { rough: 0.5, metal: 0.5 });
    const knife = box(shear, 2.9, 0.12, 0.05, 0, 1.24, -0.03, CITY.steel, { rough: 0.3, metal: 0.85 });
    box(shear, 2.9, 0.06, 0.05, 0, 0.85, -0.03, CITY.steel, { rough: 0.3, metal: 0.85 });         // lower knife
    // Hold-down feet across the front of the ram.
    const feet = [];
    for (let i = 0; i < 9; i++) feet.push(cyl(shear, 0.03, 0.03, 0.2, -1.2 + i * 0.3, 1.2, 0.12, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 10 }));
    // The finger guard: a hi-vis bar in front of the blade line, with the
    // raised-too-high gap as the find target beside its left post.
    box(shear, 2.9, 0.05, 0.05, 0, 0.98, 0.22, 0xe8b02e, { rough: 0.6 });
    for (const sx of [-1.45, 1.45]) box(shear, 0.04, 0.35, 0.04, sx, 1.0, 0.22, 0xe8b02e, { rough: 0.6 });
    const guardGap = box(shear, 0.6, 0.12, 0.03, -1.1, 0.9, 0.24, 0xd2312b, { rough: 0.6, opacity: 0.25, transparent: true, cast: false });
    reg(hits, guardGap, "finger-guard-gap");
    // The blade line itself: the hand-in-shear hazard zone.
    const dieSpace = box(shear, 2.8, 0.3, 0.3, 0, 1.0, -0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dieSpace, "hand-in-shear");
    // Bypass key on the right post.
    const bypass = group(shear, 1.75, 1.35, 0.47);
    cyl(bypass, 0.03, 0.03, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    box(bypass, 0.008, 0.05, 0.01, 0, 0, 0.015, 0xd2d6da, { rough: 0.4, metal: 0.6 });
    decal(bypass, 0.12, 0.03, 0, 0.05, 0.005, signFace("GUARD KEY", { bg: "#22262b", accent: "#d2312b", scale: 0.5 }));
    reg(hits, bypass, "guard-bypass");
    // Capacity plate on the left frame.
    const capPlate = decal(shear, 0.36, 0.22, -1.7, 1.6, 0.46, paperFace("CAPACITY", ["Mild steel 6.0 mm", "Stainless 4.0 mm", "Aluminium 8.0 mm", "3000 mm blade"], { bg: "#dfe3e6", band: "#3a4048" }), { px: 256 });
    reg(hits, capPlate, "capacity-plate");
    // Back gauge behind the knife, with its readout.
    const gauge = group(shear, 0, 0.9, -0.5);
    const gaugeBar = box(gauge, 2.6, 0.05, 0.05, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    for (const sx of [-1.0, 1.0]) cyl(gauge, 0.015, 0.015, 0.6, sx, 0, -0.3, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
    const gaugeFace = decal(shear, 0.3, 0.1, 1.2, 1.05, 0.47, signFace("-- mm", { bg: "#0d1c24", accent: "#d88a3a", fg: "#ffe9b0", scale: 0.6 }), { glow: true, ei: 0.7 });
    reg(hits, gaugeFace, "shear-gauge");
    // Blade gap adjuster on the right frame.
    const gapKnob = group(shear, 1.72, 1.9, 0.46);
    const gapDial = cyl(gapKnob, 0.05, 0.05, 0.03, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 14 });
    gapDial.rotation.x = Math.PI / 2;
    box(gapKnob, 0.01, 0.045, 0.01, 0, 0.02, 0.02, 0xfff3d6, { rough: 0.5 });
    decal(gapKnob, 0.14, 0.04, 0, -0.06, 0.005, signFace("BLADE GAP", { bg: "#22262b", accent: "#d88a3a", scale: 0.5 }));
    reg(hits, gapKnob, "gap-knob");
    // Treadle in front, with its cover missing — the second find target.
    const treadle = group(g, -0.4, 0.06, -0.55);
    box(treadle, 0.36, 0.06, 0.24, 0, 0.03, 0, 0xe8b02e, { rough: 0.6 });
    const treadlePad = box(treadle, 0.3, 0.02, 0.18, 0, 0.07, 0, 0x22262b, { rough: 0.6 });
    reg(hits, treadle, "treadle");
    const treadleCover = box(g, 0.44, 0.16, 0.3, -0.4, 0.14, -0.55, 0xe8b02e, { rough: 0.6, opacity: 0.18, transparent: true, cast: false });
    reg(hits, treadleCover, "treadle-cover");
    // Squaring arm and feed handle to the left of the table.
    const arm = group(shear, -1.9, 0.83, 0.55);
    box(arm, 0.08, 0.04, 1.4, 0, 0, 0.35, CITY.steel, { rough: 0.4, metal: 0.7 });
    for (let i = 0; i < 6; i++) box(arm, 0.09, 0.004, 0.01, 0, 0.022, -0.2 + i * 0.22, 0xfff3d6, { rough: 0.5, cast: false });
    const feedHandle = group(arm, 0.02, 0.06, 0.95);
    cyl(feedHandle, 0.02, 0.02, 0.2, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    ball(feedHandle, 0.035, 0, 0, 0.12, 0xb8402f, { rough: 0.5 });
    reg(hits, feedHandle, "feed-handle");
    // Emergency stop on the left post, at hand height.
    const estop = group(shear, -1.72, 1.35, 0.47);
    box(estop, 0.1, 0.1, 0.03, 0, 0, 0, 0xe8b02e, { rough: 0.6 });
    cyl(estop, 0.035, 0.03, 0.03, 0, 0, 0.025, 0xd2312b, { rough: 0.4, seg: 14 }).rotation.x = Math.PI / 2;
    reg(hits, estop, "e-stop");
    // Hydraulic pump under the table, disconnect on it, and the slick that appears.
    const pump = group(g, 1.3, 0.06, -0.9);
    box(pump, 0.5, 0.35, 0.4, 0, 0.18, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    cyl(pump, 0.12, 0.12, 0.3, 0, 0.5, 0, 0x3a4048, { rough: 0.5, metal: 0.5, seg: 14 });
    const pumpLamp = ball(pump, 0.03, 0.2, 0.45, 0.2, 0x59c97b, { emissive: 0x59c97b, ei: 1.6 });
    const pumpDisc = group(pump, 0.3, 0.3, 0);
    box(pumpDisc, 0.08, 0.14, 0.06, 0, 0, 0, 0x22262b, { rough: 0.6 });
    const pumpLever = box(pumpDisc, 0.02, 0.1, 0.02, 0, 0.02, 0.04, 0xd2312b, { rough: 0.5 });
    decal(pumpDisc, 0.1, 0.03, 0, -0.09, 0.031, signFace("PUMP", { bg: "#22262b", accent: "#d88a3a", scale: 0.55 }));
    reg(hits, pumpDisc, "pump-disconnect");
    const slick = cyl(g, 0.55, 0.55, 0.006, 0.4, 0.066, -0.7, 0x1a1410, { rough: 0.15, metal: 0.6, seg: 20, cast: false });
    slick.visible = false;
    // Back table with the drops, the hook, and the cart.
    const backTable = group(g, 0, 0.06, -2.6);
    box(backTable, 3.0, 0.05, 0.8, 0, 0.6, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    for (const [sx, sz] of [[-1.4, -0.3], [1.4, -0.3], [-1.4, 0.3], [1.4, 0.3]]) box(backTable, 0.05, 0.6, 0.05, sx, 0.3, sz, 0x3a4048, { rough: 0.6, metal: 0.5 });
    const dropPile = group(backTable, 0.3, 0.64, 0);
    for (let i = 0; i < 7; i++) {
      const s = box(dropPile, 0.5, 0.008, 0.16, (i % 3) * 0.12 - 0.1, i * 0.012, (i % 2) * 0.1 - 0.05, 0xb9bec4, { rough: 0.35, metal: 0.65 });
      s.rotation.y = (i - 3) * 0.12;
    }
    reg(hits, dropPile, "drop-pile");
    holoTag(backTable, "drops — hook, never hands", 0.3, 0.95, 0, { css: "#d2312b", w: 0.44 });
    const hook = group(backTable, -1.2, 0.66, 0.3);
    cyl(hook, 0.012, 0.012, 0.7, 0, 0, 0, 0x2b2f34, { rough: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    box(hook, 0.08, 0.02, 0.02, 0.36, 0.03, 0, 0xb8402f, { rough: 0.5 });
    reg(hits, hook, "drop-hook");
    holoTag(backTable, "drop hook", -1.2, 0.85, 0.3, { css: "#d88a3a", w: 0.24 });
    const cart = group(g, 2.4, 0.06, -2.4, 0.3);
    box(cart, 0.9, 0.05, 0.6, 0, 0.45, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) {
      box(cart, 0.04, 0.4, 0.04, sx, 0.25, sz, 0x3a4048, { rough: 0.6, metal: 0.5 });
      cyl(cart, 0.05, 0.05, 0.03, sx, 0.05, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    }
    const cartStack = group(cart, 0, 0, 0);
    for (let i = 0; i < 3; i++) box(cartStack, 0.7, 0.006, 0.14, 0, 0.48 + i * 0.008, -0.15 + i * 0.15, 0xb9bec4, { rough: 0.35, metal: 0.65 });
    cartStack.visible = false;
    reg(hits, cart, "drop-cart");
    holoTag(cart, "drop cart", 0, 0.7, 0, { css: "#d88a3a", w: 0.22 });

    // ------------------------------------------------------ the layout table
    const table = group(g, -2.1, 0.06, 0.6, 0.15);
    box(table, 1.6, 0.06, 1.0, 0, 0.85, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    for (const [sx, sz] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) box(table, 0.06, 0.82, 0.06, sx, 0.41, sz, 0x50606c, { rough: 0.6, metal: 0.4 });
    box(table, 1.5, 0.04, 0.08, 0, 0.5, -0.4, 0x50606c, { rough: 0.6, metal: 0.4 });
    const blank = box(table, 1.3, 0.008, 0.7, 0, 0.885, 0, 0xb9bec4, { rough: 0.3, metal: 0.7 });
    reg(hits, blank, "sheet-blank");
    holoTag(table, "3 mm mild steel blank", 0, 1.1, 0, { css: "#d88a3a", w: 0.4 });
    // The scribe line appears when the square is dropped on the mark.
    const scribe = box(table, 0.004, 0.002, 0.68, -0.25, 0.892, 0, 0xfff3d6, { emissive: 0xfff3d6, ei: 0.8, rough: 0.4, cast: false });
    scribe.visible = false;
    const mark = box(table, 0.5, 0.01, 0.5, -0.25, 0.892, 0, 0xffffff, { rough: 0.5 });
    mark.visible = false; hits["sheet-mark"] = mark;
    const scriber = cyl(table, 0.006, 0.006, 0.16, 0.5, 0.9, -0.3, 0xd2d6da, { rough: 0.3, metal: 0.7, seg: 8 });
    scriber.rotation.z = Math.PI / 2;
    box(table, 0.3, 0.02, 0.03, 0.45, 0.9, 0.3, 0xf2c14b, { rough: 0.6 });                      // rule
    // The sheet rack behind the table, raw edges out — the rack-edge hazard.
    const rack = group(g, -2.9, 0.06, -0.9, 0.5);
    for (const sx of [-0.5, 0.5]) box(rack, 0.08, 1.6, 0.5, sx, 0.8, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 5; i++) box(rack, 1.0, 0.012, 0.9, 0, 0.5 + i * 0.03, -0.2 + i * 0.1, 0xaeb5bb, { rough: 0.3, metal: 0.7 });
    const rackEdge = box(rack, 1.0, 0.16, 0.06, 0, 0.56, 0.5, 0xb9bec4, { rough: 0.3, metal: 0.7, opacity: 0.35, transparent: true, cast: false });
    reg(hits, rackEdge, "rack-edge");
    holoTag(rack, "stock sheet — gloves first", 0, 1.75, 0, { css: "#d2312b", w: 0.44 });
    // Tool chest with the square on it.
    const chest = toolChest(g, -1.0, 1.6, { ry: -0.4, color: 0x50606c });
    const square = group(chest, 0, 0.8, 0);
    box(square, 0.4, 0.012, 0.04, 0.15, 0, 0, 0xd2d6da, { rough: 0.3, metal: 0.7 });
    box(square, 0.04, 0.012, 0.28, -0.03, 0, 0.12, 0xd2d6da, { rough: 0.3, metal: 0.7 });
    holoTag(square, "layout square", 0, 0.14, 0, { css: "#d88a3a", w: 0.28 });
    reg(hits, square, "layout-square");

    // ------------------------------------------- the finished strips, checked
    const strips = group(g, 1.9, 0.06, 0.9, -0.5);
    box(strips, 0.9, 0.05, 0.5, 0, 0.7, 0, 0x7c868f, { rough: 0.5, metal: 0.6 });
    for (const [sx, sz] of [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]]) box(strips, 0.04, 0.7, 0.04, sx, 0.35, sz, 0x3a4048, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(strips, 0.8, 0.006, 0.08, 0, 0.73 + i * 0.007, -0.18 + i * 0.09, 0xb9bec4, { rough: 0.35, metal: 0.65 });
    const burr = box(strips, 0.8, 0.02, 0.09, 0, 0.77, 0.2, 0x8a949d, { rough: 0.6, metal: 0.5 });
    reg(hits, burr, "burr-edge");
    const bowed = box(strips, 0.8, 0.006, 0.08, 0, 0.775, -0.18, 0xb9bec4, { rough: 0.35, metal: 0.65 });
    bowed.rotation.x = 0.12;
    reg(hits, bowed, "bowed-strip");
    holoTag(strips, "strips to the brake", 0, 1.0, 0, { css: "#d88a3a", w: 0.34 });

    // ------------------------------------------ crew board, cut list, PPE, log
    const board = group(g, 2.6, 0.06, 1.9, -0.9);
    box(board, 0.9, 0.7, 0.04, 0, 1.45, 0, 0x1b2026, { rough: 0.6 });
    const boardFace = decal(board, 0.84, 0.64, 0, 1.45, 0.025, paperFace("CREW BOARD — SHEAR 2", ["Lead: shop lead — on the floor", "Shear 2: apprentice (you)", "Helper: drops and cart", "Brake 1: journeyman", "Visitors: sign in at the office"], { bg: "#eef1f3", band: "#d88a3a" }), { px: 384 });
    reg(hits, boardFace, "crew-board");
    for (const sx of [-0.4, 0.4]) cyl(board, 0.02, 0.02, 1.8, sx, 0.9, -0.02, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    holoPanel(g, 0.64, 0.44, 1.5, 1.7, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "#1a1408"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d88a3a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff3d6";
      ctx.fillText("CUT LIST — JOB 2261", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Material: 3 mm mild steel (12 ga)", "Strips: 24 off, 200 mm ± 1 mm", "Pressure class: 2 in. w.g. positive", "Blade gap: chart, 0.25 mm", "Tolerance on square: 0.5 mm"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMSL_ACCENT, ry: -0.9 });
    const cutListHit = box(g, 0.64, 0.44, 0.04, 1.5, 1.7, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    cutListHit.rotation.y = -0.9;
    reg(hits, cutListHit, "cut-list");
    const ppe = group(g, 2.7, 0.06, 0.2, -1.2);
    box(ppe, 0.5, 0.9, 0.16, 0, 1.2, 0, 0x2b2f34, { rough: 0.6 });
    decal(ppe, 0.44, 0.1, 0, 1.6, 0.085, signFace("PPE — SHEAR", { bg: "#0d1c24", accent: "#d88a3a", scale: 0.5 }));
    const gloves = group(ppe, -0.14, 1.35, 0.1);
    for (const sx of [-0.03, 0.03]) box(gloves, 0.05, 0.12, 0.02, sx, 0, 0, 0x7a8a3a, { rough: 0.8 });
    reg(hits, gloves, "cut-gloves");
    const glasses = group(ppe, 0.12, 1.35, 0.1);
    box(glasses, 0.14, 0.04, 0.02, 0, 0, 0, 0xdfe9ee, { rough: 0.2, opacity: 0.6, transparent: true });
    reg(hits, glasses, "safety-glasses");
    const muffs = group(ppe, 0, 1.05, 0.1);
    for (const sx of [-0.06, 0.06]) ball(muffs, 0.045, sx, 0, 0, 0xf2ae14, { rough: 0.5 });
    box(muffs, 0.13, 0.015, 0.015, 0, 0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, muffs, "ear-muffs");
    const logBoard = group(g, 2.55, 0.06, -0.6, -1.3);
    box(logBoard, 0.06, 1.0, 0.06, 0, 0.5, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const logFace = decal(logBoard, 0.34, 0.44, 0, 1.2, 0.02, paperFace("SHEAR 2 LOG", ["Job 2261 — 3 mm MS", "Gap: ____", "Strips: ____", "Guard faults: ____", "Signed: ____"], { bg: "#f4efe4", band: "#d88a3a" }), { px: 256 });
    reg(hits, logFace, "shop-log");
    holoTag(logBoard, "shop log", 0, 1.5, 0, { css: "#d88a3a", w: 0.22 });

    // ---------------------------------------------------------- the crew
    // The shop lead at the board, the helper by the cart — the one who wanders
    // round the back of the shear when the interruption fires.
    const lead = standingFigure(g, 1.3, 2.45, { ry: -2.4, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0xd88a3a, gloves: true });
    const helper = standingFigure(g, -1.5, 2.35, { ry: 2.6, cloth: 0x7a5a3a, trousers: 0x22262b, cap: 0x3a4048, gloves: true });
    const helperHand = box(shear, 0.12, 0.05, 0.25, 0.6, 0.95, -0.45, 0xd8a63a, { rough: 0.7 });
    helperHand.visible = false;

    // ------------------------------------------------------- shop dressing
    const dieRack = rackFrame(g, 2.9, -1.6, { ry: -0.6, h: 1.2 });
    for (let i = 0; i < 3; i++) rackUnit(dieRack, 0.25 + i * 0.32, ["KNIFE SET A", "KNIFE SET B", "HOLD-DOWN PADS"][i], { css: "#d88a3a" });
    const ext = group(g, -2.8, 0.06, 2.2, 0.4);
    cyl(ext, 0.06, 0.07, 0.42, 0, 0.35, 0, 0xd2312b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.025, 0.025, 0.08, 0, 0.6, 0, 0x22262b, { rough: 0.4, seg: 10 });
    holoTag(ext, "extinguisher", 0, 0.72, 0, { css: "#d2312b", w: 0.3 });
    const tray = group(g, 0, 0.06, -2.9);
    for (let i = 0; i < 6; i++) box(tray, 0.5, 0.06, 0.18, -1.5 + i * 0.6, 2.7, 0, 0x3a4550, { rough: 0.55, metal: 0.5, cast: false });
    for (let i = 0; i < 5; i++) cyl(tray, 0.012, 0.012, 0.58, -1.2 + i * 0.6, 2.7, 0.05, 0x1b1e22, { rough: 0.7, seg: 8, cast: false }).rotation.z = Math.PI / 2;
    for (const sx of [-1.5, 0, 1.5]) {
      box(g, 0.6, 0.06, 0.2, sx, 2.75, -0.5, 0x2b2f34, { rough: 0.6, cast: false });
      box(g, 0.56, 0.02, 0.16, sx, 2.72, -0.5, 0xfff7e0, { emissive: 0xfff7e0, ei: 1.2, rough: 0.5, cast: false });
    }
    for (const [x, z] of [[0.9, 1.6], [-0.9, -2.9], [1.6, -2.95]]) cone(g, x, z);
    const scrapBin = group(g, -2.6, 0.06, -2.3, 0.3);
    box(scrapBin, 0.6, 0.45, 0.6, 0, 0.22, 0, 0x2f6f8c, { rough: 0.8, metal: 0.3 });
    for (let i = 0; i < 4; i++) box(scrapBin, 0.32, 0.01, 0.1, -0.1 + (i % 2) * 0.2, 0.46 + Math.floor(i / 2) * 0.02, (i % 2) * 0.1, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    holoTag(scrapBin, "offcut bin", 0, 0.65, 0, { css: "#d88a3a", w: 0.24 });
    const oilDrum = group(g, 2.9, 0.06, -0.1, 0.2);
    cyl(oilDrum, 0.24, 0.24, 0.6, 0, 0.3, 0, 0x2f6f8c, { rough: 0.7, metal: 0.3, seg: 16 });
    cyl(oilDrum, 0.06, 0.06, 0.04, 0, 0.62, 0, 0x22262b, { rough: 0.5, seg: 10 });
    decal(oilDrum, 0.22, 0.14, 0.245, 0.3, 0, signFace("HYDRAULIC OIL", { bg: "#0d1c24", accent: "#d88a3a", scale: 0.4 }));
    const signBoard = group(g, -0.6, 0.06, 2.8, 3.1);
    box(signBoard, 0.5, 0.4, 0.03, 0, 1.4, 0, 0x1b2026, { rough: 0.6 });
    decal(signBoard, 0.44, 0.34, 0, 1.4, 0.018, signFace("GUARDS STAY\nWHERE THEY\nWERE SET", { bg: "#0d1c24", accent: "#d88a3a", fg: "#fff3d6", scale: 0.28 }));
    cyl(signBoard, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const lock = lockTag(gapKnob, 0.08, -0.08, 0.02, { color: 0xd88a3a });
    lock.visible = false;
    // Spare stock pallet and a vacuum lifter parked by the rack.
    const pallet = group(g, -1.2, 0.06, -2.85, 0.1);
    box(pallet, 0.9, 0.08, 0.7, 0, 0.04, 0, 0x8b6a42, { rough: 0.9 });
    for (let i = 0; i < 5; i++) box(pallet, 0.84, 0.012, 0.64, 0, 0.09 + i * 0.02, 0, 0xaeb5bb, { rough: 0.3, metal: 0.7 });
    const lifter = group(g, -2.9, 0.06, 0.6, 0.6);
    cyl(lifter, 0.03, 0.03, 1.9, 0, 0.95, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 10 });
    box(lifter, 0.5, 0.06, 0.3, 0.2, 1.7, 0, 0x2b2f34, { rough: 0.6 });
    for (const sx of [0.05, 0.35]) cyl(lifter, 0.07, 0.07, 0.04, sx, 1.65, 0, 0x22262b, { rough: 0.8, seg: 12 });
    holoTag(lifter, "vacuum lifter", 0.2, 1.9, 0, { css: "#d88a3a", w: 0.28 });

    let stroking = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -1.5),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "layout") { square.parent.remove(square); table.add(square); square.position.set(-0.25, 0.892, 0); square.rotation.set(0, 0, 0); scribe.visible = true; }
        if (step.id === "blade-gap") { lock.visible = true; }
        if (step.id === "guard-walk") { guardGap.visible = false; treadleCover.material = mat(0xe8b02e, { rough: 0.6, opacity: 0.7 }); }
        if (step.id === "load") { blank.parent.remove(blank); shear.add(blank); blank.position.set(0, 0.83, 0.55); blank.rotation.set(0, 0, 0); }
        if (step.id === "drops") { dropPile.visible = false; cartStack.visible = true; }
        if (step.id === "log") repaint(logFace, paperFace("SHEAR 2 LOG", ["Job 2261 — 3 mm MS", "Gap: 0.25 mm (chart)", "Strips: 24 off, in tol.", "Guard high, treadle cover off — reset", "Signed: apprentice / lead"], { bg: "#f4efe4", band: "#d88a3a" }));
      },
      onHazard() {},
      // The helper really walks behind the shear, and the oil really spreads.
      onInterrupt(it) {
        if (it.id === "helper-behind") { helper.position.set(0.9, 0, -2.2); helper.rotation.y = 0.2; helperHand.visible = true; }
        if (it.id === "pump-weep") { slick.visible = true; pumpLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.8 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "helper-behind") { helperHand.visible = false; helper.position.set(-1.5, 0, 2.35); helper.rotation.y = 2.6; }
        if (it.id === "pump-weep") { pumpLever.rotation.z = Math.PI / 2; pumpLamp.material = mat(0x3a4048, { rough: 0.5 }); }
      },

      animate(t, dt, session) {
        const step = session?.step;
        stroking = !!(step?.id === "stroke" && session.holding);
        const target = stroking ? 1.3 : 1.55;
        ram.position.y += (target - ram.position.y) * Math.min(1, dt * 4);
        knife.position.y = ram.position.y - 0.31;
        for (const f of feet) f.position.y = ram.position.y - 0.35;
        treadlePad.position.y = stroking ? 0.05 : 0.07;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "back-gauge") {
          gaugeBar.position.z = -0.5 - gg.t * 0.3;
          repaint(gaugeFace, signFace(`${(80 + gg.t * 240).toFixed(0)} mm`, { bg: "#0d1c24", accent: gg.t >= 0.46 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "blade-gap") gapDial.rotation.z = tn.amount * Math.PI * 2;
        const tr = session?.track;
        if (tr && step?.id === "feed") arm.position.z = 0.55 + Math.sin(t * 3) * tr.v * 0.08;
      },
    };
  },
};
