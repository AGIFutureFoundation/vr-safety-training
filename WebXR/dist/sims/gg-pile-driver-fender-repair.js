import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Pile Driver Fender Repair VR — Construction & Structural
// Trades, the Bay Area bridge pack, on the golden-gate-deck district.
//
// A pier's fender takes the knocks meant for the pier: timber wales and
// rubbing strips on piles, worn by every vessel that touches them and eaten
// by borers below the waterline. The Pile Drivers of the Carpenters repair it
// from a work barge; this station is the deck side of that job, where a new
// fender panel is bolted up in the closure and lowered over the side to the
// barge crew below. The panel, the davit and the railing section are the
// station's own; the barge and the pier fender lie on the water far below,
// seen from the district's railing.

const GGD_ACCENT = 0x3f9c6a;

export const SIM_GG_PILE_DRIVER_FENDER_REPAIR = {
  id: "gg-pile-driver-fender-repair",
  index: "232",
  domain: "Construction",
  trade: "Pile Drivers of the Carpenters (UBC) — fender repair crew, trained through the Carpenters International Training Fund, with the barge crew below and the davit operator",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  certification: "Pile Drivers of the Carpenters and the Carpenters International Training Fund; OSHA 29 CFR 1926.106 for work over water, flotation and the rescue skiff; ASME B30.9 slings and ASME B30.26 rigging hardware on the lift; ASME B30.5 practice for the davit crane and its signals; OSHA 29 CFR 1926.502 for the tie-off at the railing; BCDC and the permit's conditions for work in the bay; the owner's lift plan and fender drawing",
  name: "Pile Driver Fender Repair",
  title: simTitle("Pile Driver Fender Repair"),
  tagline: "The deck side of a pier fender repair: the lift plan read, vest and lanyard on at the rail, the old wale read for borers and wasted bolts, the wind taken, the new panel's through-bolts torqued, the sling shackled, the test lift held while a boat comes under, the panel lowered on the tag line into the fog, handed to the barge's signal, the hook recovered, the deck checked and the lift logged",
  accent: GGD_ACCENT,
  accentCss: "#3f9c6a",
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "over-the-side-clean", name: "Over The Side Clean", note: "A fender panel lowered to the barge on the tag line, never with anyone under it, and the water below held clear" },

  supportLine: "the Carpenters' member assistance programme through your local, and the crew's peer-support contact",

  game: system({
    name: "Pile Butt Crew",
    currency: "WALE",
    ranks: ["Deck Hand", "Pile Driver Apprentice", "Rigger", "Fender Foreman", "Pile Butt Crew Certified"],
    badges: [
      { id: "test-lift-held", name: "Test Lift Held", note: "The test lift held clean before the panel went over", test: AWARD.stepClean("test-lift") },
      { id: "tag-line-steady", name: "Tag Line Steady", note: "The panel lowered inside its band on the tag line", test: AWARD.precise(0.72) },
      { id: "never-under", name: "Never Under", note: "Never under the panel, never a hand in the sling, never at the rail without the vest", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lift", name: "Clean Lift", note: "No corrections from the lift plan to the log", test: AWARD.clean },
      { id: "no-spin", name: "No Spin", note: "The lowering never dropped out of band", test: AWARD.unbroken },
      { id: "fender-inside-par", name: "Fender Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-slung-panel": "You stepped under the fender panel while it hung on the davit. A panel of timber wales and steel bolts on a sling is a suspended load like any other, and ASME B30 practice and every lift plan put the same rule on it: nobody under it, for any reason. A hitch that has held all morning does not warn anyone before it rolls.",
    "untethered-maul": "The maul is lying untethered on the deck at the foot of the railing, where it was put down after driving the last bolt. At the railing, a tool knocked over the edge falls to the barge crew working directly below — the one place on this job where people are guaranteed to be under the deck. Hand tools at the rail ride on tethers, and the maul goes back in the gang box.",
    "hand-in-pinch": "You put a hand between the sling and the wale to straighten it as the davit took up the slack. As a sling tensions it closes on whatever is between it and the load, with the weight of the panel behind it, and there is no gap left for fingers. Slings are straightened before the take-up with the hook slack, or with a stick, never by hand under tension.",
    "lean-over-rail-no-pfd": "You leaned out over the railing to watch the barge below with no flotation vest on and your lanyard unclipped. The rail is the edge of a deck high over the water, and a person leaning over it to watch a lift is a person not holding on; 29 CFR 1926.106 puts flotation on anyone working where a fall into water is possible, and the lanyard keeps the fall from happening at all.",
  },

  lateNotes: {
    "hoist-lever": "The test lift comes once the sling is shackled to the panel's lifting eyes — there is nothing to lift yet.",
    "tag-line": "The panel is lowered once the test lift has held clean and the water below is clear.",
    "fender-log": "The lift is logged once the hook is back and the deck has been checked.",
  },

  steps: [
    {
      id: "lift-plan", kind: "select", target: "fender-repair-plan",
      title: "Read the lift plan and the fender drawing",
      cue: "Read the lift plan: the panel's weight, the davit's rating at this reach, the rigging, the barge's position below, the boat exclusion on the water, and the signal person.",
      why: "A lift over the side of a bridge has two crews, one above and one below, who cannot easily see each other, and the plan is what puts them on the same page: the panel's weight against the davit's rating at its reach, the rigging that carries it, where the barge sits and who gives the signals. The fender drawing says which panel goes where, so the barge crew receives the panel they are expecting.",
    },
    {
      id: "rail-ppe", kind: "sequence", anyOrder: true,
      targets: ["pfd-vest", "rail-lanyard"],
      itemNames: { "pfd-vest": "flotation vest on and zipped", "rail-lanyard": "lanyard on the anchor at the rail" },
      title: "Vest on and clipped to the rail anchor",
      cue: "Put on the flotation vest and zip it, and clip your lanyard to the rated anchor at the railing, before anyone goes to the edge.",
      why: "The lowering is done at the railing, and 29 CFR 1926.106 puts a flotation vest on anyone working where a fall into water is possible; the lanyard is what stops the fall from happening at all. Both go on before the edge, because the moment someone is leaning to watch a panel go down is the moment they have stopped thinking about where their feet are.",
    },
    {
      id: "old-wale", kind: "find", noHint: true,
      targets: ["marine-borer", "split-wale", "wasted-bolt"],
      itemNames: {
        "marine-borer": "borer holes in the wale below the waterline mark",
        "split-wale": "a split running along the wale from a bolt hole",
        "wasted-bolt": "a through-bolt wasted thin by corrosion",
      },
      itemNotes: {
        "marine-borer": "Below the waterline mark the wale is riddled with small holes — marine borers have been eating it from inside. It looks sound from outside until it is cut, and it crushes under a vessel's touch.",
        "split-wale": "A split runs along the grain from a bolt hole. The bolt has been working in the hole under every knock, and a split wale lets the bolt pull through.",
        "wasted-bolt": "A through-bolt has corroded to a fraction of its diameter at the face of the wale. It was carrying the wale's load on what was left of it.",
      },
      title: "Read the removed wale for what failed",
      cue: "Look over the old wale the barge crew sent up and find why it failed: borers, splits, wasted bolts.",
      why: "The old wale is evidence: what failed on it is what will fail on the new one, in time, and the repair crew reads it before the new panel goes down. Borer damage says the treatment or the timber needs to change at that level, a split at a bolt hole says the bolt pattern is working the wood, and a wasted bolt says the hardware is not lasting as long as the timber.",
    },
    {
      id: "wind", kind: "gauge", target: "wind-meter",
      title: "Take the wind before the lift",
      cue: "Read the anemometer at the davit and commit the reading while it sits inside the band below the lift plan's limit.",
      why: "A fender panel on a sling is a broad flat surface hanging over the side of a bridge, and the wind across a strait turns it into a sail: it spins on the sling, swings against the deck edge and pulls the tag line out of hands. The lift plan's wind limit is read at the davit before the lift starts, not guessed from the deck.",
      gauge: {
        label: "WIND · % OF LIFT LIMIT", speed: 0.64, green: [0.14, 0.48],
        readout: (t) => `${Math.round(t * 140)}% of limit`,
        missNote: "That is past the lift plan's limit, or a lull. The panel stays on the deck until a steady reading sits inside the band.",
      },
    },
    {
      id: "through-bolts", kind: "turn", target: "through-bolt-nut",
      title: "Torque the new panel's through-bolts",
      cue: "Run the through-bolts up on the new panel in the drawing's order, washers square to the timber, to the figure on the drawing.",
      why: "The through-bolts hold the rubbing strip and the wales to the piles through timber that will swell, shrink and take knocks for years. Taken up in the drawing's order they pull the panel down evenly; to the figure, they seat the washers without crushing the wood fibres, which is where a split starts. A bolt set by feel is a bolt set to whoever tightened it.",
      turn: { turns: 1.1, label: "THROUGH-BOLTS", readout: (t) => (t < 0.35 ? "snug" : t < 0.95 ? "pulling the panel down" : "at the drawing's figure") },
    },
    {
      id: "shackle", kind: "drag", target: "sling-shackle",
      title: "Shackle the sling to the panel's lifting eyes",
      cue: "Carry the sling's shackle to the lifting eye on the panel, pin it and mouse the pin.",
      why: "The panel is lifted by its lifting eyes and nothing else: not by a wale, not by a bolt. The shackle is pinned and the pin moused so it cannot back out while the panel turns on the way down, and under ASME B30.26 the shackle is one rated for the load and inspected before use; a panel dropped from the davit falls onto the barge crew.",
      drag: { to: "lift-eye", radius: 0.45, missNote: "Not on the lifting eye — the shackle goes on the eye itself, not round a wale or a bolt head." },
    },
    {
      id: "test-lift", kind: "hold", target: "hoist-lever", seconds: 5,
      title: "Make the test lift and hold it",
      cue: "Take up the slack and lift the panel a few centimetres off the cribbing, and hold it there while the rigging and the davit are checked.",
      why: "A test lift is the lift in miniature: the panel just clear of the cribbing, where if anything is wrong — a hitch slipping, the davit's base moving, the panel hanging out of level — it drops a few centimetres onto timber instead of the height of a bridge onto a barge. It is held long enough to look at every part of the rigging, and the lift continues only if everything held.",
      holdBreakNote: "The panel came back down before the rigging had been checked. Take it up again and hold the test lift.",
    },
    {
      id: "lower", kind: "track", target: "tag-line", seconds: 7,
      title: "Lower the panel over the rail on the tag line",
      cue: "With the davit lowering steadily, keep the panel from spinning on the tag line — firm, not fighting it — as it goes over the rail and down to the barge.",
      why: "The tag line is the only control the deck has over the panel once it is over the side: held firm, it stops the panel spinning and swinging into the deck edge or the barge crew's hands; held too hard, it pulls the panel off plumb and can pull the person holding it toward the rail. The lowering is steady so the barge crew can see the panel coming and the signal person can call it down.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.14, label: "TAG LINE",
        readout: (v) => (v < 0.42 ? "slack — the panel is spinning" : v > 0.62 ? "hauling — pulling it off plumb" : "steady on the line"),
      },
      holdBreakNote: "The tag line went slack or hard and the panel started to spin. Settle it back to a steady hold.",
    },
    {
      id: "hand-over", kind: "select", target: "barge-signal",
      title: "Hand the lift to the barge's signal person",
      cue: "As the panel reaches the barge crew's reach, hand the signals to the barge's signal person and let go of the tag line on their word.",
      why: "Once the panel is down at the barge, the people who can see it are the barge crew, and the davit operator takes signals from one person at a time. The hand-over is called clearly, so there is never a moment when two people are signalling or nobody is, and the tag line goes to the barge crew on their signal so the panel is always held by someone who can see it.",
    },
    {
      id: "recover", kind: "sequence",
      targets: ["hoist-slack", "hook-latch"],
      itemNames: { "hoist-slack": "hoist slacked on the barge's signal", "hook-latch": "empty hook up with its latch closed" },
      title: "Slack on the barge's signal, then bring the hook up latched",
      cue: "Slack the hoist line only when the barge's signal person calls it, then bring the empty hook up with its safety latch closed.",
      why: "The line is slacked only on the barge's signal because the barge crew is the one with hands on the panel, and slack given early drops the panel onto them before they are ready. The empty hook comes up with its latch closed, so nothing swinging below the deck edge can catch it on the way up.",
      outOfOrderNote: "Slack first, on the barge's signal — the hook stays loaded until the barge crew has the panel.",
    },
    {
      id: "deck-check", kind: "find", noHint: true,
      targets: ["washer-at-rail", "chafed-sling"],
      itemNames: { "washer-at-rail": "a loose washer at the foot of the rail", "chafed-sling": "a chafed patch on the sling where it crossed the rail" },
      itemNotes: {
        "washer-at-rail": "A washer from the bolt-up is lying at the foot of the railing, one kick from the edge and the barge below. It goes back in the bin now.",
        "chafed-sling": "The sling's cover has chafed where it crossed the rail on the way over. The sling is tagged out of service and inspected before it lifts anything again.",
      },
      title: "Check the deck and the rigging after the lift",
      cue: "Walk the rail and the rigging after the lift and find what the lift left behind.",
      why: "A lift over the side leaves things where the crew was working: a washer at the rail, a sling that rubbed on the edge on the way over. The deck check catches the first before it goes over the side onto the barge, and the second before the sling lifts the next panel with its strength reduced; ASME B30.9 has a sling taken out of service on exactly that kind of damage.",
    },
    {
      id: "fender-log", kind: "select", target: "fender-log",
      title: "Log the lift and the old wale's findings",
      cue: "Record the panel lowered and its position on the drawing, the wind, the old wale's borers, split and wasted bolt, and the sling taken out of service.",
      why: "The fender log is how the next repair is planned: which panel went in, where, and why the old one failed. The borer damage and the wasted bolt are findings for the engineer who specifies the next timber and hardware, and the chafed sling is a record that it left service before anything else could be lifted on it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "deck-radio",
      title: "Check in with the barge crew and the davit operator",
      cue: "Call the barge crew and the operator: panel down, hook up, lift logged — and how everyone is after a lift over the side in the fog.",
      why: "The barge crew below and the operator above worked a blind lift together through a boat and a fog bank, and each needs to hear it is finished from the other end. It is also the moment to ask how people are: a lift over the side of a bridge is a long concentration, and the Carpenters' member assistance line is there for anything that does not clear with the shift.",
    },
  ],

  interrupts: [
    {
      id: "boat-under-the-lift",
      kind: "Boat under the work zone",
      after: "test-lift", delay: 2, seconds: 13,
      alert: "A boat has come in past the barge and under the lift — inside the exclusion the permit and the lift plan set on the water below the panel.",
      cue: "Hold the panel where it is and call the barge and the rescue skiff on the marine radio: clear the boat from under the lift.",
      target: "barge-radio",
      why: "The exclusion on the water exists because if the panel does come off the sling, whatever is under it takes the whole fall. The deck can see the boat and the load at once and the boat cannot see the load at all, so the call goes out at once: the panel is held where it is on the test lift, the skiff moves the boat on, and the lift resumes only when the water under it is clear.",
      missNote: "The lift carried on with a boat under the panel's path. Had the rigging let go, the panel would have fallen onto people who never knew there was a load above them.",
      wrongNote: "The marine radio — the boat is out of reach, and the barge and the skiff are the ones who can move it.",
    },
    {
      id: "fog-on-the-lift",
      kind: "Fog bank rolling in",
      after: "lower", delay: 3, seconds: 13,
      alert: "A fog bank rolls in over the railing as the panel goes down — the barge and the signal person below disappear into grey.",
      cue: "Set the davit's load brake and hold the panel where it is until the signal person is back in sight or on the radio.",
      target: "load-brake",
      why: "A load lowered blind is a load lowered onto whoever is under it. When the fog takes the barge out of sight, the operator has lost the signal person's hand signals and the deck has lost sight of the barge crew, so the panel stops on the brake where it is; it moves again only on a signal the operator can actually receive, by radio if the fog has not lifted.",
      missNote: "The panel kept going down into the fog with nobody able to see the barge crew below it, and the operator lowering on a signal that could no longer be seen.",
      wrongNote: "The load brake — stop the panel where it is. Nothing moves blind over the barge crew.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGD_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4047", base2: "#30363c" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.8, 0.02, 4.6, 0, 0.01, 0.1, 0x3a4047, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ the new fender panel on cribbing
    const panel = group(g, 0.4, 0, -0.35);
    for (const px of [-1.0, 0, 1.0]) box(panel, 0.2, 0.16, 1.2, px, 0.08, 0, 0x6b5a3a, { rough: 0.9 });
    const load = group(panel, 0, 0.22, 0);
    const woodA = 0x8a6a3a, woodB = 0x7a5a32;
    for (const [pz, c] of [[-0.35, woodA], [0.0, woodB], [0.35, woodA]]) box(load, 2.4, 0.22, 0.26, 0, 0.11, pz, c, { rough: 0.85 });
    for (const px of [-0.8, 0.8]) box(load, 0.3, 0.14, 1.0, px, 0.29, 0, 0x5a4a2a, { rough: 0.9 });
    for (const px of [-0.4, 0.4]) box(load, 0.12, 0.06, 1.0, px, 0.25, 0, 0xf2f2f2, { rough: 0.5 });
    const bolts = [];
    for (const px of [-0.8, 0.8]) for (const pz of [-0.35, 0, 0.35]) {
      bolts.push(cyl(load, 0.03, 0.03, 0.03, px, 0.375, pz, 0x9aa1a8, { rough: 0.4, metal: 0.8, seg: 6 }));
      cyl(load, 0.05, 0.05, 0.01, px, 0.36, pz, 0xb0b6bc, { rough: 0.4, metal: 0.8, seg: 10 });
    }
    const nut = group(load, 0.8, 0.4, 0.35);
    ball(nut, 0.03, 0, 0.02, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.4, seg: 8, seg2: 6 });
    holoTag(nut, "through-bolt — turn", 0, 0.14, 0, { css: "#3f9c6a", w: 0.36 });
    reg(hits, nut, "through-bolt-nut");
    const eye = group(load, -0.2, 0.34, 0);
    torus(eye, 0.06, 0.014, 0, 0.06, 0, GGD_ACCENT, { emissive: GGD_ACCENT, ei: 1.4, rough: 0.4, seg: 6, seg2: 14 });
    box(eye, 0.14, 0.02, 0.1, 0, 0, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    holoTag(eye, "lifting eye", 0, 0.2, 0, { css: "#3f9c6a", w: 0.24 });
    reg(hits, eye, "lift-eye");
    const pinch = box(load, 0.2, 0.2, 0.2, 0.25, 0.5, 0.14, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(load, "straighten the sling by hand?", 0.3, 0.72, 0.2, { css: "#d2312b", w: 0.52 });
    reg(hits, pinch, "hand-in-pinch");
    const sling = hose(load, [[-0.2, 0.4, 0], [-0.1, 1.0, 0], [0, 1.9, 0]], 0.02, 0x3f9c6a, { steps: 10, rough: 0.8 });
    sling.visible = false;
    const tag = hose(load, [[1.2, 0.2, 0.1], [1.6, 0.1, 0.6], [1.9, 0.02, 1.1]], 0.01, 0xe8e2d0, { steps: 12, rough: 0.8 });
    void tag;
    const tagHit = group(g, 2.25, 0, 0.75);
    box(tagHit, 0.14, 0.14, 0.14, 0, 0.05, 0, 0xe8e2d0, { rough: 0.8 });
    holoTag(tagHit, "tag line — track", 0, 0.36, 0, { css: "#3f9c6a", w: 0.3 });
    reg(hits, tagHit, "tag-line");
    const underHit = box(g, 1.2, 0.05, 0.8, 0.4, 0.08, -1.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step under the panel?", 0.4, 0.5, -1.35, { css: "#d2312b", w: 0.4 });
    reg(hits, underHit, "under-slung-panel");

    // ------------------------------------------------ the davit and its controls
    const davit = group(g, -1.35, 0, -1.55);
    box(davit, 0.7, 0.1, 0.7, 0, 0.05, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    cyl(davit, 0.1, 0.12, 2.3, 0, 1.2, 0, 0xe8b830, { rough: 0.5, metal: 0.4, seg: 12 });
    const arm = group(davit, 0, 2.3, 0);
    arm.rotation.y = -0.6;
    box(arm, 2.1, 0.14, 0.14, 1.0, 0, 0, 0xe8b830, { rough: 0.5, metal: 0.4 });
    cyl(arm, 0.06, 0.06, 0.18, 1.95, -0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
    const hookLine = cyl(arm, 0.008, 0.008, 0.9, 1.95, -0.6, 0, 0x2b3138, { rough: 0.6, seg: 6 });
    void hookLine;
    const hook = group(arm, 1.95, -1.1, 0);
    torus(hook, 0.05, 0.014, 0, 0, 0, 0xe8b830, { rough: 0.4, metal: 0.6, seg: 6, seg2: 12 });
    const latch = box(hook, 0.012, 0.07, 0.012, 0.04, 0.02, 0, 0xd8232a, { rough: 0.5 });
    holoTag(hook, "hook latch", 0, 0.14, 0, { css: "#3f9c6a", w: 0.22 });
    reg(hits, hook, "hook-latch");
    const ctrl = group(davit, 0.5, 0.95, 0.4);
    box(ctrl, 0.24, 0.3, 0.14, 0, 0, 0, 0x2f4f6f, { rough: 0.5, metal: 0.4 });
    const lever = box(ctrl, 0.03, 0.18, 0.03, -0.05, 0.22, 0, 0x2b3138, { rough: 0.6 });
    holoTag(ctrl, "hoist lever — hold", -0.05, 0.42, 0, { css: "#3f9c6a", w: 0.34 });
    reg(hits, lever, "hoist-lever");
    const brake = group(ctrl, 0.07, 0.08, 0.08);
    cyl(brake, 0.035, 0.035, 0.03, 0, 0, 0, 0xd8232a, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(brake, "load brake", 0, -0.12, 0.02, { css: "#3f9c6a", w: 0.22 });
    reg(hits, brake, "load-brake");
    const slack = group(ctrl, -0.2, 0.0, 0.08);
    box(slack, 0.08, 0.06, 0.04, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    holoTag(slack, "slack", 0, -0.1, 0.02, { css: "#3f9c6a", w: 0.14 });
    reg(hits, slack, "hoist-slack");

    // ------------------------------------------------ the railing section at the edge
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 5, rows: 1 }), { repeat: 1, px: 256 });
    const rail = group(g, 0.5, 0, -2.25);
    const top = box(rail, 3.2, 0.14, 0.16, 0, 1.3, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
    top.material = texturedMat(steelTex, { rough: 0.6, metal: 0.3 });
    box(rail, 3.2, 0.1, 0.1, 0, 0.35, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
    for (let i = 0; i < 9; i++) box(rail, 0.035, 0.9, 0.035, -1.5 + i * 0.375, 0.82, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
    const anchor = group(rail, -1.3, 1.45, 0.1);
    torus(anchor, 0.05, 0.01, 0, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 14 });
    holoTag(anchor, "rail anchor", 0, 0.14, 0, { css: "#3f9c6a", w: 0.22 });
    reg(hits, anchor, "rail-lanyard");
    const leanHit = box(rail, 0.6, 0.4, 0.3, 1.2, 1.5, -0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rail, "lean over to watch, no vest?", 1.2, 1.8, 0, { css: "#d2312b", w: 0.52 });
    reg(hits, leanHit, "lean-over-rail-no-pfd");
    const maul = group(g, 1.6, 0.04, -1.95, 0.4);
    box(maul, 0.5, 0.03, 0.03, 0, 0, 0, 0x8a6a3a, { rough: 0.8 });
    box(maul, 0.08, 0.08, 0.14, 0.26, 0.02, 0, 0x3a4148, { rough: 0.5, metal: 0.7 });
    reg(hits, maul, "untethered-maul");
    const washer = cyl(g, 0.03, 0.03, 0.006, -0.35, 0.025, -2.0, 0xb0b6bc, { rough: 0.4, metal: 0.8, seg: 10 });
    reg(hits, washer, "washer-at-rail");

    // ------------------------------------------------ the old wale on horses, the sling, the vest
    const horses = group(g, -2.0, 0, 0.75, 0.2);
    for (const px of [-0.6, 0.6]) {
      box(horses, 0.08, 0.6, 0.5, px, 0.3, 0, 0x6b5a3a, { rough: 0.9 });
      box(horses, 0.14, 0.06, 0.5, px, 0.62, 0, 0x6b5a3a, { rough: 0.9 });
    }
    const oldWale = box(horses, 1.6, 0.22, 0.26, 0, 0.76, 0, 0x5a4a32, { rough: 0.95 });
    void oldWale;
    const borer = group(horses, -0.45, 0.76, 0.132);
    for (let i = 0; i < 6; i++) cyl(borer, 0.012, 0.012, 0.004, (i % 3) * 0.05, Math.floor(i / 3) * 0.05 - 0.03, 0, 0x14100a, { rough: 1, seg: 6 }).rotation.x = Math.PI / 2;
    reg(hits, borer, "marine-borer");
    const split = box(horses, 0.5, 0.012, 0.01, 0.2, 0.82, 0.133, 0x14100a, { rough: 1 });
    reg(hits, split, "split-wale");
    const wasted = group(horses, 0.55, 0.76, 0.14);
    cyl(wasted, 0.012, 0.012, 0.12, 0, 0, 0, 0x7a4a2a, { rough: 0.9, metal: 0.3, seg: 6 }).rotation.x = Math.PI / 2;
    cyl(wasted, 0.035, 0.035, 0.02, 0, 0, 0.06, 0x6b4a2a, { rough: 0.9, metal: 0.3, seg: 6 }).rotation.x = Math.PI / 2;
    reg(hits, wasted, "wasted-bolt");
    holoTag(horses, "old wale from the barge", 0, 1.1, 0, { css: "#3f9c6a", w: 0.4 });
    const chest = toolChest(g, -0.2, 2.2, { ry: Math.PI, color: 0x2f5a42 });
    const shackle = group(chest, -0.12, 0.8, 0.02);
    torus(shackle, 0.04, 0.012, 0, 0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    hose(shackle, [[0, 0, 0], [0.1, 0.02, 0.05], [0.18, 0, 0.1]], 0.014, 0x3f9c6a, { steps: 8, rough: 0.8 });
    holoTag(shackle, "sling + shackle — carry", 0, 0.14, 0, { css: "#3f9c6a", w: 0.42 });
    reg(hits, shackle, "sling-shackle");
    const chafe = box(chest, 0.06, 0.03, 0.03, 0.02, 0.81, 0.06, 0xb89a5a, { rough: 0.9 });
    reg(hits, chafe, "chafed-sling");
    const radio = instrument(chest, 0.16, 0.79, 0.03, { ry: 0.1, idle: "DECK CH", color: GGD_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "deck radio", 0, 0.15, 0, { css: "#3f9c6a", w: 0.24 });
    reg(hits, radio, "deck-radio");
    const rack = group(g, -2.4, 0, -0.6, 1.2);
    for (const sx of [-1, 1]) cyl(rack, 0.02, 0.02, 1.5, sx * 0.25, 0.75, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.6, 0.03, 0.03, 0, 1.48, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vest = group(rack, 0, 1.1, 0.03);
    box(vest, 0.26, 0.4, 0.1, 0, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(vest, 0.26, 0.05, 0.11, 0, 0.05, 0, 0xdfe8ee, { rough: 0.6, emissive: 0xdfe8ee, ei: 0.3 });
    holoTag(vest, "flotation vest", 0, 0.3, 0.04, { css: "#3f9c6a", w: 0.28 });
    reg(hits, vest, "pfd-vest");

    // ------------------------------------------------ radios, signal, wind mast, paperwork
    const marine = group(g, 1.85, 0, 1.65);
    box(marine, 0.36, 0.9, 0.3, 0, 0.45, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    const vhf = instrument(marine, 0, 0.93, 0, { idle: "MARINE CH", color: 0x2f5a42, w: 0.12, d: 0.16 });
    holoTag(marine, "marine radio", 0, 1.16, 0, { css: "#3f9c6a", w: 0.26 });
    reg(hits, vhf, "barge-radio");
    const signal = group(g, 2.4, 0, -0.9);
    cyl(signal, 0.015, 0.015, 1.4, 0, 0.7, 0, 0x2b3138, { rough: 0.6, seg: 8 });
    box(signal, 0.3, 0.2, 0.01, 0.15, 1.3, 0, 0xf2d21e, { rough: 0.6 });
    holoTag(signal, "hand-over to barge signal", 0, 1.6, 0, { css: "#3f9c6a", w: 0.44 });
    reg(hits, signal, "barge-signal");
    const mast = group(g, -2.55, 0, -1.9);
    cyl(mast, 0.025, 0.035, 2.4, 0, 1.2, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const sock = cyl(mast, 0.06, 0.03, 0.34, 0.2, 2.3, 0.1, 0x59c97b, { rough: 0.7, seg: 10 });
    sock.rotation.x = 1.1;
    const windMeter = instrument(mast, 0, 1.2, 0.1, { idle: "-- %", color: GGD_ACCENT, w: 0.12, d: 0.16 });
    windMeter.rotation.x = Math.PI / 2.4;
    holoTag(mast, "anemometer", 0, 1.44, 0.12, { css: "#3f9c6a", w: 0.26 });
    reg(hits, windMeter, "wind-meter");
    const plan = holoPanel(g, 0.92, 0.62, 2.5, 1.4, 0.35, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,12,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3f9c6a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2e2"; cx.fillText("LIFT PLAN — FENDER PANEL", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf6ef";
      ["Panel weight against davit rating at reach", "Rigging: sling + shackle, inspected, moused", "Barge: moored below, crew clear of the drop",
       "Water: boat exclusion held by the skiff", "Signals: deck, then barge — one at a time", "Wind: stop at the plan's limit"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: -1.3, accent: GGD_ACCENT });
    reg(hits, plan, "fender-repair-plan");
    const log = holoPanel(g, 0.72, 0.5, -1.55, 1.35, 2.15, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,12,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#3f9c6a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2e2"; cx.fillText("FENDER LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#eaf6ef";
      ["Panel: —", "Wind: —", "Old wale: —", "Rigging: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 0.4, accent: GGD_ACCENT });
    reg(hits, log, "fender-log");

    // ------------------------------------------------ crew
    const operator = standingFigure(g, -2.6, 0.2, { ry: 1.2, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(operator, "davit operator", 0, 1.95, 0, { css: "#59c97b", w: 0.3 });
    const rigger = standingFigure(g, 1.3, 1.5, { ry: -2.6, cloth: 0x2f5a42, vest: 0xe07a3f, helmet: 0xf2c14b, gloves: true });
    holoTag(rigger, "pile driver rigger", 0, 1.95, 0, { css: "#59c97b", w: 0.34 });
    cone(g, 2.9, 2.2, { color: GGD_ACCENT }); cone(g, -2.9, 2.2, { color: GGD_ACCENT });

    // ------------------------------------------------ on the water below: pier fender, barge, the boat
    const below = group(g, 0, -45.6, 0);
    const fenderRing = [];
    // Far enough out past the deck edge to be seen over the railing.
    for (let i = 0; i < 9; i++) {
      const a = -1.2 + i * 0.3;
      fenderRing.push(cyl(below, 0.35, 0.35, 5.0, -50 + Math.cos(a) * 4.5, 1.5, -16 + Math.sin(a) * 4.5, 0x5a4a32, { rough: 0.95, seg: 8, cast: false }));
    }
    for (const wy of [2.2, 3.4]) {
      const wale = box(below, 0.3, 0.3, 8.6, -45.8, wy, -16, 0x6b5a3a, { rough: 0.95, cast: false });
      void wale;
    }
    const barge = group(below, -42, 0, -8);
    box(barge, 5.0, 1.0, 12, 0, 0.5, 0, 0x5a636c, { rough: 0.6, metal: 0.4, cast: false });
    box(barge, 2.0, 1.4, 2.0, 0, 1.7, 3.5, 0xe8b830, { rough: 0.6, cast: false });
    cyl(barge, 0.2, 0.2, 6, 0, 3.5, -2, 0x2b3138, { rough: 0.6, cast: false, seg: 8 });
    const bargePanel = box(barge, 2.4, 0.4, 1.0, 0, 1.2, -4, 0x8a6a3a, { rough: 0.9, cast: false });
    bargePanel.visible = false;
    const boat = group(below, -54, 0, 24);
    box(boat, 2.2, 0.6, 6.0, 0, 0.3, 0, 0xe6e9ec, { rough: 0.5, cast: false });
    box(boat, 1.6, 1.0, 1.8, 0, 1.1, 0.6, 0xd8232a, { rough: 0.5, cast: false });
    boat.visible = false;
    const boatHome = boat.position.clone();

    const fog = group(g, -50, 0, -4);
    const fogMat = { rough: 1, opacity: 0.55, transparent: true, cast: false, receive: false };
    box(fog, 9, 8, 28, 0, 3, 0, 0xdfe5e9, fogMat);
    box(fog, 10, 6, 20, -4, 2, 9, 0xe8ecef, fogMat);
    box(fog, 7, 11, 16, 3, 4.5, -9, 0xd6dde2, fogMat);
    fog.visible = false;
    const fogHome = fog.position.clone();

    let boatIn = false, fogOn = false;
    const loadHome = load.position.clone();

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 0.9, -0.8),
      onStepComplete(step) {
        if (step.id === "through-bolts") for (const b of bolts) b.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 });
        if (step.id === "shackle") { sling.visible = true; shackle.visible = false; }
        if (step.id === "test-lift") load.position.y = loadHome.y + 0.08;
        if (step.id === "lower") { load.visible = false; bargePanel.visible = true; }
        if (step.id === "recover") latch.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "deck-check") { washer.visible = false; chafe.material = mat(0xd8232a, { rough: 0.8 }); }
        if (step.id === "fender-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,18,12,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#d8f2e2"; cx.fillText("FENDER LOG", w * 0.06, h * 0.15);
          cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6ef";
          ["Panel: lowered to the barge, per drawing", "Wind: inside the lift plan's limit", "Old wale: borers, split, wasted bolt", "Rigging: sling chafed — out of service"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
        });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("PANEL DOWN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "boat-under-the-lift") {
          boatIn = true; boat.visible = true; boat.position.set(-38, 0, 4);
          repaint(vhf.userData.screen, signFace("BOAT BELOW", { bg: "#0d1c24", accent: "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (it.id === "fog-on-the-lift") { fogOn = true; fog.visible = true; fog.position.set(-24, 0, -4); }
      },
      onInterruptEnd(it) {
        if (it.id === "boat-under-the-lift") {
          boatIn = false;
          if (it.resolved !== "answered") return;
          boat.position.set(-56, 0, 30);
          repaint(vhf.userData.screen, signFace("WATER CLEAR", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (it.id === "fog-on-the-lift" && it.resolved === "answered") brake.position.z = 0.1;
      },
      onHazard(hitId) {
        if (hitId === "untethered-maul") maul.position.z = -2.05;
      },
      animate(t, dt, session) {
        const d = dt ?? 0.016;
        if (boatIn) boat.position.z -= d * 0.8;
        if (!boat.visible) boat.position.copy(boatHome);
        if (fogOn && fog.position.x < -12) fog.position.x += d * 0.8;
        if (!fogOn && fog.position.x !== fogHome.x) fog.position.copy(fogHome);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind") repaint(windMeter.userData.screen, signFace(`${Math.round(gg.t * 140)}%`, { bg: "#0d1c24", accent: gg.t >= 0.14 && gg.t <= 0.48 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "lower" && session.track) {
          const v = session.track.v;
          load.position.set(loadHome.x - v * 0.4, loadHome.y + 0.08 + v * 0.3, loadHome.z - v * 0.9);
          load.rotation.y = (0.52 - v) * 0.6;
        }
        if (session?.turn && step?.id === "through-bolts") nut.rotation.y = session.turn.amount * Math.PI * 2;
        void CITY; void paperFace; void fenderRing;
      },
    };
  },
};
