import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, concreteFace, corrugatedFace, gratingFace, safetyStripeFace, reg,
} from "../citykit.js";
import { tapeMeasure, level } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Aluminium Panel Fabrication And Brake VR — Construction &
// Structural Trades, glaziers and architectural metal pack. The shop side
// of the trade: aluminium composite panel sheared to size, formed on a
// press brake into the returns a curtain wall panel needs, notched at the
// corners and deburred before it ever reaches a truck. A press brake closes
// on tonnes at a walking pace slow enough to look harmless and fast enough
// to give a hand no time back once it is in the wrong place — the two-hand
// control on this machine exists because a foot pedal alone has hurt too
// many hands to keep using one.

const GLAP_ACCENT = 0x5a8fc4;

export const SIM_GL_ALUMINIUM_PANEL_FABRICATION_AND_BRAKE = {
  id: "gl-aluminium-panel-fabrication-and-brake",
  index: "358",
  domain: "Construction & Structural Trades",
  trade: "Glazier / architectural metal fabricator — IUPAT District Council 16 shop fabrication",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria for the mezzanine edge; the SMACNA Architectural Sheet Metal Manual for panel returns, notching and expansion allowance; the press brake manufacturer's guarding and two-hand control instructions",
  name: "Aluminium Panel Fabrication And Brake",
  title: simTitle("Aluminium Panel Fabrication And Brake"),
  tagline: "Glove up and guard-check the brake, the shop walked, the sheet fed and bent on two-hand control, the edge deburred at a steady pace, notched, squared and racked for the truck",
  accent: GLAP_ACCENT,
  accentCss: "#5a8fc4",
  parSeconds: 275,
  footprint: 2.1,
  badge: { id: "panel-formed-clean", name: "Panel Formed Clean" , note: "A panel sheared, bent on two-hand control, deburred and squared with nobody's hand ever near the brake's nip point"},

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the brake closing is what you keep seeing",

  game: system({
    name: "Shop Crew",
    currency: "BEND",
    ranks: ["Pre-apprentice", "Shop Hand", "Fabricator", "Lead Fabricator", "Shop Certified"],
    badges: [
      { id: "guard-proven", name: "Guard Proven", note: "The brake's guard and two-hand control checked before the first bend", test: AWARD.stepClean("guard-check") },
      { id: "hands-clear", name: "Hands Clear", note: "No unsafe action near the brake or the mezzanine edge the whole run", test: AWARD.safe },
      { id: "square-panel", name: "Square Panel", note: "The finished panel squared inside tolerance, first read", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-form", name: "Clean Form", note: "The panel formed without a correction", test: AWARD.clean },
      { id: "control-held", name: "Control Held", note: "Both palm buttons held through the full bend cycle", test: AWARD.unbroken },
      { id: "panel-in-time", name: "Panel In Time", note: "Sheared, formed and racked inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "sheared-edge": "You ran a bare hand along the freshly sheared edge of the aluminium sheet. A shear leaves a clean edge, not a safe one, and a clean edge on 4 mm composite is thin enough to find a bare palm the way a blade does; the deburring station exists precisely for the gap between the shear and the point where that edge is safe to handle. Gloves stay on until the edge has actually been run.",
    "mezzanine-edge": "You leaned out over the mezzanine's stock racking with no rail between you and the shop floor. The mezzanine holds the sheet stock a storey above the shop floor, and its own edge is exactly the kind of fall hazard the shop's own machinery makes people forget about — nobody thinks of a storage rack the way they think of a roof, and the fall is the same distance either way. The rail stays between you and the edge, or the reach is made from a step with one.",
    "brake-pinch": "You reached toward the press brake's nip point while it was cycling. The upper beam closes on the sheet at a speed that reads as slow and is not slow enough for a hand to clear once it is committed, and the two-hand control exists because a single foot pedal has let hands stray toward that point too many times industry-wide. Both palms stay on the buttons until the beam is fully open again — not one hand free to hold the sheet.",
    "propped-lite-wind": "You left the insulated glass unit propped by the roll-up door without a strap while the door stood open for the delivery. A shop with its bay door open is exactly as much a wind funnel as any building under construction, and a lite propped rather than strapped is a lite the first through-draft can walk off its feet. The IGU gets strapped to the rack the moment it comes off the truck, door open or not.",
  },

  lateNotes: {
    "panel-sheet": "The sheet goes onto the brake bed only after the guard and the two-hand control are proven. A sheet fed before the guard is checked is a sheet fed on a machine nobody has confirmed will stop.",
    "deburr-tool": "Deburring starts only once the panel is off the brake and squared. Running the tool on a panel still in the brake's throat puts a hand closer to the nip point than the job needs.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "job-traveler",
      title: "Sign the job traveler at the brake",
      cue: "Read the shop traveler — the panel count, the bend schedule, who is running the brake today — and sign it.",
      why: "The traveler is the shop's own tailboard: it names the bend schedule for this run so the back gauge is set to the drawing rather than to memory, and it names who is actually running the brake today, because a machine with more than one operator in a shift is a machine where the guard check from this morning is not necessarily still someone's fresh memory.",
    },
    {
      id: "ppe-seq", kind: "sequence",
      targets: ["cut-gloves", "safety-glasses", "hearing-protection"],
      itemNames: { "cut-gloves": "cut-resistant gloves", "safety-glasses": "safety glasses", "hearing-protection": "hearing protection" },
      title: "Glove and guard up before the shear or the brake run",
      cue: "Cut-resistant gloves, then safety glasses, then hearing protection — in that order, before a hand goes near the sheet stock.",
      why: "The order goes hand to head because the hand is what reaches the sheared edge first, the eyes are what a flying burr or an offcut find next, and hearing protection is checked last because the shear and the brake are both loud enough over a shift to matter even though neither is the day's sharpest hazard.",
      outOfOrderNote: "Gloves, then glasses, then hearing protection — the hand goes into a glove before it touches the sheet stock.",
    },
    {
      id: "guard-check", kind: "select", target: "brake-guard",
      title: "Function-check the brake's guard and two-hand control",
      cue: "Trip the light curtain by hand at a safe distance and confirm both palm buttons are required before the beam will cycle.",
      why: "The guard and the two-hand control are checked empty, before the first sheet goes anywhere near the bed, because a light curtain that does not actually stop the beam or a palm button that lets the machine cycle on its own is a fault you want to find with nothing in the brake's throat. This is the one check on this machine that is never skipped for time.",
    },
    {
      id: "shop-walk", kind: "find", noHint: true,
      targets: ["mezz-overhang", "unsecured-lite"],
      itemNames: { "mezz-overhang": "sheet stock overhanging the mezzanine edge", "unsecured-lite": "the IGU propped unstrapped by the roll-up door" },
      itemNotes: {
        "mezz-overhang": "A bundle of sheet stock on the mezzanine rack is sitting past the rail line, overhanging the shop floor below it.",
        "unsecured-lite": "The insulated glass unit delivered this morning is propped against the rack by the open roll-up door with no strap on it at all.",
      },
      title: "Walk the shop before the brake runs",
      cue: "Look at the mezzanine and the roll-up door — click the two things wrong before the first sheet is fed.",
      why: "The mezzanine's overhang and the propped lite by the open door are both things that read as normal shop clutter until the exact moment they are not — a bundle that shifts off the rack, a draught through the bay door that finds an unstrapped pane. Both get answered before the brake's own noise takes over everyone's attention for the rest of the run.",
    },
    {
      id: "gauge-set", kind: "turn", target: "back-gauge",
      title: "Set the brake's back gauge to the bend schedule",
      cue: "Turn the back gauge dial to the dimension the traveler calls for and lock it before the sheet goes in.",
      why: "The back gauge is what puts the bend line in the same place on every sheet in this run without a mark being struck each time, and it is set from the traveler's dimension rather than yesterday's setting because the same brake runs a dozen different bend schedules in a week. Locked before the sheet goes in, it cannot walk under the first bend's own reaction force.",
      turn: { turns: 1, axis: "z", label: "SET" },
    },
    {
      id: "sheet-drag", kind: "drag", target: "panel-sheet",
      title: "Feed the sheet onto the brake bed",
      cue: "Both hands on the sheet's outer edges, guide it flat onto the bed against the back gauge — not released until it is square against the stop.",
      why: "The sheet is fed flat and square against the gauge because a sheet that goes in skewed bends skewed, and there is no straightening a bend after the beam has already closed on it. Both hands stay on the outer edges, well clear of where the beam actually comes down, the whole way to the stop.",
      drag: { to: "gauge-stop", radius: 0.45, missNote: "Not square against the back gauge — a sheet fed skewed bends skewed, and there is no fixing that after the beam closes." },
    },
    {
      id: "brake-hold", kind: "hold", target: "palm-buttons", seconds: 4,
      title: "Cycle the brake on two-hand control",
      cue: "Both palms on the buttons, hold them through the full bend cycle until the beam returns fully open.",
      why: "Two-hand control means what it says: both hands occupied on the buttons for the whole cycle is what guarantees neither hand is anywhere near the nip point while the beam is moving, and letting go of either button before the beam is fully open defeats the entire point of having two of them rather than one pedal.",
      holdBreakNote: "A palm came off the button before the beam was fully open — that bend was not run on two-hand control the way it should have been. Reset and hold both buttons the full cycle.",
    },
    {
      id: "deburr-track", kind: "track", target: "deburr-tool", seconds: 5,
      title: "Deburr the sheared edge at a steady pace",
      cue: "Run the deburring tool along the panel's sheared edge at a steady pace so the full length is broken evenly.",
      why: "A deburring pass run too fast skips sections that stay sharp enough to cut through a glove on the next handling, and one run too slow rounds the edge more than the fit-up drawing allows at the return. The steady pace is what turns a sheared edge into a handled edge along its whole length rather than in patches.",
      track: { label: "DEBURR", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.13, readout: (v) => `${Math.round(v * 20)} cm/s` },
      holdBreakNote: "The pass ran out of the band — a patch left sharp or over-rounded past the fit-up tolerance. Run that stretch again at a steady pace.",
    },
    {
      id: "notch-turn", kind: "turn", target: "corner-notcher",
      title: "Notch the panel's corner return",
      cue: "Turn the notching tool through the corner return so the miter closes without an overlap or a gap.",
      why: "The corner notch is what lets two returns meet at a miter instead of overlapping into a lump or gapping into a hole a fastener has to bridge, and the SMACNA Architectural Sheet Metal Manual's expansion allowance depends on that miter closing cleanly — a notch cut short leaves the corner unable to move the way the rest of the panel will in the sun.",
      turn: { turns: 1, axis: "z", label: "NOTCH" },
    },
    {
      id: "qa-seq", kind: "sequence",
      targets: ["bend-angle-check", "flatness-check", "finish-check"],
      itemNames: { "bend-angle-check": "bend angle checked against the schedule", "flatness-check": "panel face checked for flatness", "finish-check": "finish checked for scuffing" },
      title: "Quality-check the formed panel",
      cue: "Bend angle against the schedule first, then flatness across the face, then the finish for scuffing — in that order.",
      why: "The bend angle is checked first because it is the one defect that cannot be fixed downstream — a flat panel with the wrong angle is scrap, while a flat check and a finish check both catch things a light touch-up can still solve. Checking in this order is what stops the shop spending time polishing a panel that was already going in the scrap bin.",
      outOfOrderNote: "Angle, then flatness, then finish — there is no point polishing a panel whose angle is already wrong.",
    },
    {
      id: "square-gauge", kind: "gauge", target: "square-instrument",
      title: "Check the panel square",
      cue: "Read the diagonal gauge against the panel's own corners and commit inside tolerance.",
      why: "A panel that is out of square by even a few millimetres shows up on site as a reveal that grows across a facade one panel at a time, and it is cheaper to find that here, on the bench, than after the panel has travelled to a job three states away and gone up on a boom lift.",
      gauge: { label: "SQUARE mm", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.5) * 24).toFixed(1)} mm`, missNote: "Outside square tolerance — back to the brake before this panel gets racked for the truck." },
    },
    {
      id: "panel-rack-drag", kind: "drag", target: "panel-sheet",
      title: "Rack the finished panel for the truck",
      cue: "Two-handed on the panel's edges, guide it from the bench to the truck rack — not released until it is seated flat on the rack's felt.",
      why: "The finished panel is carried the same careful way every sheet on this bench has been all day, because a panel dropped an inch onto a steel rack dents a face that took an hour to form correctly. Seated flat on the felt is what keeps it from picking up a scuff on the ride to site that the finish check just cleared it of.",
      drag: { to: "truck-rack", radius: 0.48, missNote: "Not flat on the rack's felt — a panel resting on the bare rail picks up a scuff on the ride to site." },
    },
    {
      id: "dock-walk", kind: "find", noHint: true,
      targets: ["door-open-unwatched", "loose-offcut"],
      itemNames: { "door-open-unwatched": "the roll-up door left open with nobody watching it", "loose-offcut": "an offcut left on the shop floor near the brake" },
      itemNotes: {
        "door-open-unwatched": "The roll-up door is still standing open from the delivery with no one keeping an eye on the draught it is putting through the shop.",
        "loose-offcut": "A sheared offcut is sitting on the floor right where the next pass toward the brake steps.",
      },
      title: "Walk the dock before the shop closes the door",
      cue: "Look at the roll-up door and the floor near the brake — click the two things wrong before the shift ends.",
      why: "A shop that is finished from the brake's point of view is not finished until the door that has been feeding a draught through it all shift is actually closed and the floor a foot finds on the way to the machine is actually clear — both are the kind of thing a crew stops noticing once the panels themselves are done.",
    },
    {
      id: "log", kind: "select", target: "shop-log",
      title: "Log the run",
      cue: "Panel count, bend angle, square reading and the faults found and fixed, and sign it.",
      why: "The log ties this run's bend angle and square reading to a date and a name, which is what the shop shows if a panel comes back from site with a fit-up problem. It also carries the mezzanine overhang and the unstrapped lite as fixed rather than assumed, for whoever runs the next shift on this brake.",
    },
  ],

  interrupts: [
    {
      id: "reach-toward-brake",
      kind: "A hand reaches toward the brake",
      after: "brake-hold", delay: 3, seconds: 10,
      alert: "A shop hand has reached toward the brake's throat to nudge the sheet, right as the beam is coming back up.",
      cue: "Someone's hand is near the brake's nip point mid-cycle.",
      target: "brake-estop",
      why: "A hand near the nip point mid-cycle does not wait for the beam to decide whether it is clear, and the emergency stop is the one control on this machine that takes the decision away from the cycle and gives it to whoever presses it. The sheet can be nudged once the beam is fully stopped, never while it is still moving.",
      missNote: "The hand cleared on its own before the beam came all the way down. It was close enough that the light curtain should have caught it, and this time it was reflexes rather than the estop that kept it a near miss instead of something worse.",
      wrongNote: "It is the brake's emergency stop. Take the beam out of motion before that hand goes anywhere near the throat.",
    },
    {
      id: "gust-lite",
      kind: "Gust through the roll-up door",
      after: "qa-seq", delay: 3, seconds: 11,
      alert: "A gust through the open roll-up door has caught the propped insulated glass unit and it is sliding off the rack.",
      cue: "The unstrapped IGU is sliding off the rack by the door.",
      target: "lite-brace",
      why: "A lite propped rather than strapped has nothing holding it once a gust actually finds it, and the brace across the rack is what stops it reaching the floor without anyone lunging across the shop to catch four square feet of glass by hand. It gets braced now, then strapped properly once it is stable.",
      missNote: "The IGU slid to the end of the rack and stopped against the upright. It did not go all the way down, this time. The brace exists for exactly the gust that just went through that door, and it sat unused the whole time the lite was sliding.",
      wrongNote: "It is the lite brace across the rack. Stop the slide before anyone reaches for the glass itself.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, GLAP_ACCENT);

    // ------------------------------------------------------------ the shop floor
    const floor = box(g, 7.0, 0.06, 6.0, 0, 0.03, 0, 0x6b6d6a, { rough: 0.85, cast: false });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth" }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.05 });
    const wall = group(g, 0, 0.06, -2.6);
    const backWall = box(wall, 7.0, 4.0, 0.2, 0, 2.0, 0, 0x8b929a, { rough: 0.75, cast: false });
    backWall.material = texturedMat(surfaceTexture((cx, w, h) => corrugatedFace(cx, w, h, { colour: 0x8b929a })), { repeat: 3, px: 384 });

    // ------------------------------------------------------------ the mezzanine
    const mezz = group(g, -2.4, 1.8, -1.6);
    box(mezz, 2.2, 0.1, 1.6, 0, 0, 0, 0x50606c, { rough: 0.6, metal: 0.4, cast: false });
    mezz.children[0].material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h)), { repeat: 3, px: 256 });
    for (const sx of [-1.05, 1.05]) box(mezz, 0.06, 1.8, 0.06, sx, -0.9, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const rail = box(mezz, 2.2, 0.03, 0.03, 0, 0.55, 0.75, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    void rail;
    const stock = group(mezz, -0.3, 0.1, 0);
    for (let i = 0; i < 4; i++) box(stock, 1.6, 0.02, 0.9, 0, i * 0.03, 0, 0xb8c0c6, { rough: 0.4, metal: 0.5 });
    const overhang = box(mezz, 1.6, 0.15, 0.3, -0.3, 0.15, 0.85, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, overhang, "mezz-overhang");
    const mezzEdgeZone = box(mezz, 2.2, 1.6, 0.3, 0, -0.7, 0.85, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, mezzEdgeZone, "mezzanine-edge");
    holoTag(mezz, "mezzanine stock", 0, 0.35, 0, { css: "#5a8fc4", w: 0.3 });

    // ------------------------------------------------------------ the press brake
    const brake = group(g, 0.6, 0.06, -0.6);
    box(brake, 2.4, 1.0, 0.9, 0, 0.5, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const bed = box(brake, 2.2, 0.06, 0.5, 0, 1.02, 0, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    const beam = group(brake, 0, 1.4, 0);
    box(beam, 2.2, 0.3, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    const nipZone = box(brake, 2.2, 0.14, 0.4, 0, 1.16, 0, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nipZone, "brake-pinch");
    const lightCurtain = box(brake, 2.2, 0.02, 0.02, 0, 1.1, 0.3, 0x59c97b, { rough: 0.5, opacity: 0.4, transparent: true, cast: false });
    reg(hits, lightCurtain, "brake-guard");
    holoTag(brake, "light curtain · guard", 0, 1.7, 0.3, { css: "#5a8fc4", w: 0.34 });
    const buttons = group(brake, 1.0, 0.6, 0.5);
    for (const sx of [-0.1, 0.1]) cyl(buttons, 0.04, 0.04, 0.03, sx, 0, 0, 0x59c97b, { rough: 0.5, seg: 14 });
    reg(hits, buttons, "palm-buttons");
    holoTag(brake, "two-hand control", 1.0, 0.85, 0.5, { css: "#5a8fc4", w: 0.32 });
    const estop = cyl(brake, 0.035, 0.035, 0.03, -1.05, 0.75, 0.4, 0xd2312b, { rough: 0.4, seg: 14 });
    reg(hits, estop, "brake-estop");
    const gauge = group(brake, 0, 1.0, -0.35);
    box(gauge, 0.1, 0.06, 0.3, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.6 });
    reg(hits, gauge, "back-gauge");
    holoTag(brake, "back gauge", 0, 1.25, -0.35, { css: "#5a8fc4", w: 0.26 });
    const gaugeStop = box(brake, 2.0, 0.04, 0.04, 0, 1.03, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["gauge-stop"] = gaugeStop;

    // The sheet, deburr tool, notcher, finished panel.
    const sheetStack = group(g, -1.0, 0.06, 1.4, 0.3);
    box(sheetStack, 1.6, 0.06, 1.0, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    const sheet = group(sheetStack, 0, 0.08, 0, 0.1);
    box(sheet, 1.5, 0.01, 0.9, 0, 0, 0, 0xb8c0c6, { rough: 0.4, metal: 0.5 });
    reg(hits, sheet, "panel-sheet");
    const sheetEdge = box(sheet, 1.5, 0.01, 0.04, 0, 0.006, 0.44, 0xd2312b, { opacity: 0.3, transparent: true, cast: false });
    reg(hits, sheetEdge, "sheared-edge");
    holoTag(sheetStack, "sheet — two-handed", 0, 0.4, 0, { css: "#5a8fc4", w: 0.34 });
    const deburr = group(g, 1.6, 0.1, 0.3, -0.3);
    box(deburr, 0.03, 0.03, 0.2, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, deburr, "deburr-tool");
    const notcher = group(g, -0.6, 0.1, -1.4, 0.3);
    box(notcher, 0.06, 0.14, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, notcher, "corner-notcher");
    const angleCheck = group(brake, 0.7, 1.0, 0.3);
    box(angleCheck, 0.04, 0.04, 0.04, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, angleCheck, "bend-angle-check");
    const flatnessCheck = group(brake, -0.7, 1.0, 0.3);
    box(flatnessCheck, 0.04, 0.04, 0.04, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, flatnessCheck, "flatness-check");
    const finishCheck = group(brake, 0, 1.02, 0.4);
    box(finishCheck, 0.04, 0.04, 0.04, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, finishCheck, "finish-check");
    const squareInst = instrument(g, 1.8, 0.9, -0.9, { ry: -0.3, idle: "-- mm", color: 0x5a8fc4 });
    reg(hits, squareInst, "square-instrument");
    holoTag(g, "square gauge", 1.8, 1.15, -0.9, { css: "#5a8fc4", w: 0.28 });

    const truckRack = group(g, 2.8, 0.06, 1.6, -0.3);
    box(truckRack, 1.8, 0.06, 0.8, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    for (const sx of [-0.85, 0.85]) box(truckRack, 0.05, 1.2, 0.7, sx, 0.63, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const rackSlot = box(truckRack, 1.6, 0.06, 0.6, 0, 0.7, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["truck-rack"] = rackSlot;
    holoTag(truckRack, "truck rack", 0, 1.4, 0, { css: "#5a8fc4", w: 0.3 });

    // Roll-up door and propped IGU.
    const door = group(wall, 2.4, 0, 0, 0);
    box(door, 1.6, 0.1, 0.1, 0, 3.0, 0.15, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    const bayOpening = box(g, 1.6, 3.0, 0.2, 2.4, 1.5, -2.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void bayOpening;
    const igu = group(g, 2.2, 0.06, -2.0, 0.2);
    box(igu, 1.1, 1.3, 0.03, 0, 0.68, 0, 0xa8dcea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    reg(hits, igu, "unsecured-lite");
    const iguWindZone = box(g, 1.6, 1.6, 1.0, 2.2, 0.9, -2.0, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, iguWindZone, "propped-lite-wind");
    holoTag(igu, "IGU — strap it", 0, 1.5, 0, { css: "#f2ae14", w: 0.3 });
    const liteBrace = group(g, 2.2, 0.9, -2.3, 0.2);
    box(liteBrace, 1.2, 0.04, 0.04, 0, 0, 0, 0x59c97b, { rough: 0.5 });
    liteBrace.visible = false;
    reg(hits, liteBrace, "lite-brace");
    const doorOpenZone = box(g, 1.8, 3.0, 0.3, 2.4, 1.5, -2.6, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, doorOpenZone, "door-open-unwatched");

    const offcut = box(g, 0.3, 0.01, 0.15, 0.4, 0.06, 0.2, 0xb8c0c6, { rough: 0.4, metal: 0.5 });
    reg(hits, offcut, "loose-offcut");

    const ppeBox = group(g, -2.8, 0.06, 0.6);
    box(ppeBox, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x2b2f34, { rough: 0.8 });
    const gloves = box(ppeBox, 0.2, 0.03, 0.14, 0, 0.16, 0, 0x1b2026, { rough: 0.9 });
    reg(hits, gloves, "cut-gloves");
    const glasses = box(ppeBox, 0.14, 0.03, 0.05, 0, 0.19, 0.05, 0x2b7bbf, { rough: 0.3, opacity: 0.6, transparent: true });
    reg(hits, glasses, "safety-glasses");
    const earmuffs = box(g, 0.16, 0.1, 0.04, -2.8, 0.2, 0.9, 0x1b2026, { rough: 0.7 });
    reg(hits, earmuffs, "hearing-protection");
    tapeMeasure(g, -2.6, 0.06, 1.6, { ry: 0.3 });
    level(g, -1.6, 0.06, -0.8, { ry: 0.4 });

    const tailboard = group(g, -3.0, 0.7, 2.0, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("SHOP TRAVELER", ["Run: aluminium panels, brake 2", "Bend schedule: per drawing", "Guard: light curtain, checked", "Mezzanine: rail checked", "Stop work: guard fault"], { bg: "#eef1f3", band: "#5a8fc4" }), { px: 320 });
    reg(hits, tailFace, "job-traveler");
    holoTag(g, "job traveler", -3.0, 1.25, 2.0, { css: "#5a8fc4", w: 0.22 });
    const logBoard = group(g, 3.2, 0.7, 2.2, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("SHOP LOG", ["Panels: ____", "Angle: ____", "Square: ____", "Signed: ____"], { bg: "#f4efe4", band: "#5a8fc4" }), { px: 256 });
    reg(hits, logFace, "shop-log");
    holoTag(g, "shop log", 3.2, 1.15, 2.2, { css: "#5a8fc4", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -3.2, 1.7, -1.6, (ctx, w, h) => {
      ctx.fillStyle = "#0a1622"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5a8fc4"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e5f0fb";
      ctx.fillText("BEND SCHEDULE — RUN 214", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Panel: 4 mm composite", "Return: per SMACNA sheet metal manual", "Bend angle: per the drawing", "Corner: notched, mitred", "Square tolerance: per shop standard"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLAP_ACCENT, ry: 0.5, stalk: true });

    const fabricator = standingFigure(g, 0.6, 1.4, { ry: 3.1, cloth: 0x2b5a7a, trousers: 0x2b2f34, helmet: 0x5a8fc4, vest: 0xf2c14b, gloves: true });
    const shopHand = standingFigure(g, -0.4, -1.8, { ry: 2.0, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b });

    for (const [x, z] of [[-3.2, 2.6], [3.2, 2.6]]) cone(g, x, z);

    // Shop dressing: a scrap bin and a stock rack of extrusion, clear of the brake.
    const scrapBin = group(g, 3.2, 0.06, -1.6);
    box(scrapBin, 0.7, 0.5, 0.6, 0, 0.25, 0, 0x2b3138, { rough: 0.7, metal: 0.3 });
    box(scrapBin, 0.72, 0.05, 0.62, 0, 0.03, 0, 0x1b1e22, { rough: 0.8, cast: false });
    const extrusionRack = group(g, -3.0, 0.06, -0.4);
    box(extrusionRack, 0.1, 1.0, 0.1, -0.4, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    box(extrusionRack, 0.1, 1.0, 0.1, 0.4, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    for (let i = 0; i < 3; i++) cyl(extrusionRack, 0.02, 0.02, 0.8, 0, 0.4 + i * 0.15, 0, 0xaeb5bb, { rough: 0.45, metal: 0.65, seg: 8 }).rotation.z = Math.PI / 2;
    const fireExtinguisher = group(g, 3.2, 0.06, 1.8);
    cyl(fireExtinguisher, 0.06, 0.06, 0.35, 0, 0.2, 0, 0xd2312b, { rough: 0.5, metal: 0.3, seg: 12 });
    box(fireExtinguisher, 0.05, 0.06, 0.02, 0, 0.4, 0, 0x2b2f34, { rough: 0.6 });
    const rollCart = group(g, -1.4, 0.06, 1.6);
    box(rollCart, 0.5, 0.4, 0.35, 0, 0.2, 0, 0x50606c, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.2, 0.2]) cyl(rollCart, 0.04, 0.04, 0.04, sx, 0.02, 0, 0x1b1e22, { rough: 0.7, seg: 10 }).rotation.z = Math.PI / 2;

    let holdingControl = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, 1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "shop-walk") { overhang.material = mat(0x59c97b, { rough: 0.6, opacity: 0.3, transparent: true }); }
        if (step.id === "sheet-drag") { sheet.parent.remove(sheet); brake.add(sheet); sheet.position.set(0, 1.03, 0); sheet.rotation.set(0, 0, 0); }
        if (step.id === "brake-hold") { beam.position.y = 0; }
        if (step.id === "deburr-track") { sheetEdge.material = mat(0x8a8f94, { rough: 0.5, metal: 0.5 }); }
        if (step.id === "panel-rack-drag") { sheet.parent.remove(sheet); truckRack.add(sheet); sheet.position.set(0, 0.72, 0); sheet.rotation.set(0, 0, 0); }
        if (step.id === "dock-walk") { offcut.visible = false; }
        if (step.id === "log") repaint(logFace, paperFace("SHOP LOG", ["Panels: 1, run 214", "Angle: pass", "Square: 0.4 mm", "Signed: fabricator / lead"], { bg: "#f4efe4", band: "#5a8fc4" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "reach-toward-brake") { shopHand.position.set(0.9, 0, -0.4); shopHand.rotation.y = 0.6; beam.position.y = 0.2; }
        if (it.id === "gust-lite") { igu.rotation.z = 0.3; igu.position.x += 0.15; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "reach-toward-brake") { shopHand.position.set(-0.4, 0, -1.8); shopHand.rotation.y = 2.0; beam.position.y = 1.4; }
        if (it.id === "gust-lite") { igu.rotation.z = 0; liteBrace.visible = true; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingControl = !!(step?.id === "brake-hold" && session.holding);
        if (holdingControl) beam.position.y = 1.4 - Math.min(1.4, (t % 4) * 0.5);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "square-gauge") {
          repaint(squareInst.userData.screen, signFace(`${((gg.t - 0.5) * 24).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "gauge-set") { gauge.position.z = -0.35 - tn.amount * 0.1; }
        if (tn && step?.id === "notch-turn") { notcher.rotation.z = tn.amount * Math.PI * 4; }
      },
    };
  },
};
