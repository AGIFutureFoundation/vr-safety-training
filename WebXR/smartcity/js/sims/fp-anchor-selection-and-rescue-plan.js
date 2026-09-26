import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, roadwayFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { aerialBoomLift } from "../../../shared/equipment.js";

// SmartCiti.X~ Anchor Selection & Rescue Plan VR — Construction &
// Structural Trades, the fall protection block.
//
// A steel-framed rooftop edge: two rated anchor points on a horizontal
// lifeline, a decoy handrail nearby that is not rated for fall arrest, a
// harness rack with one frayed harness mixed into it, a rescue kit staged at
// the edge, and an aerial boom lift standing by for an assisted rescue. The
// learner is the ironworkers' fall-protection competent person selecting the
// anchors and writing the rescue plan before the crew ties off. The site is
// generic.

const FPA_ACCENT = 0xf2c14b;
const FPA_CSS = "#f2c14b";

export const SIM_FP_ANCHOR_SELECTION_AND_RESCUE_PLAN = {
  id: "fp-anchor-selection-and-rescue-plan",
  index: "348",
  domain: "Construction",
  trade: "Ironworkers fall-protection competent person selecting anchors and writing the rescue plan before overhead work begins",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OSHA 29 CFR 1926.501 duty to have fall protection, 29 CFR 1926.502 fall protection systems criteria and practices, OSHA 29 CFR 1926 Subpart M fall protection for the competent person's own duties, ANSI/ASSP Z359 fall protection code for the anchor and rescue equipment rated here, and Ironworkers and IMPACT apprenticeship and safety training",
  name: "Anchor Selection & Rescue Plan",
  title: simTitle("Anchor Selection & Rescue Plan VR"),
  tagline: "The edge before the crew ties off: the fall protection plan read for its anchor rating and rescue timeframe, the harness donned and the SRL clipped, a frayed harness found on the rack before anyone else reaches for it, a rated anchor chosen over the handrail beside it, the lifeline tensioned, tie-off held at one hundred percent across the transfer, the fall clearance checked against the drop below, the rescue kit staged at the edge, the rescue plan briefed to the crew, the aerial lift's outriggers set and its basket held to a smooth rescue-height raise, the crew checked in, and the plan logged",
  accent: FPA_ACCENT,
  accentCss: FPA_CSS,
  parSeconds: 330,
  footprint: 2.8,
  badge: { id: "anchor-and-plan-certified", name: "Anchor and Plan Certified", note: "A rated anchor chosen every time, tie-off never broken across a transfer, and a rescue plan briefed before anyone clipped in" },

  supportLine: "your Ironworkers local's member assistance programme",

  game: system({
    name: "Fall Protection",
    currency: "TAG",
    ranks: ["Deck Hand", "Tie-Off Crew", "Competent Person Trainee", "Rescue Plan Certified", "Fall Protection Certified"],
    badges: [
      { id: "rack-checked-clean", name: "Rack Checked Clean", note: "The frayed harness found and set aside before it reached the crew", test: AWARD.stepClean("inspect-harness-webbing") },
      { id: "tieoff-unbroken", name: "Tie-Off Unbroken", note: "Held at one hundred percent across the whole transfer", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never a handrail clipped as an anchor, never a frayed harness worn, never a body under the rescue lift", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-setup", name: "Clean Setup", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "clearance-on-the-band", name: "Clearance On The Band", note: "Fall clearance gauge committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "plan-briefed-fast", name: "Plan Briefed Fast", note: "Plan logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "clip-to-unrated-handrail": "You clipped the SRL to the guardrail instead of the rated anchor beside it. A handrail is built to keep someone from leaning past the edge, not to catch the full force of a fall — ANSI/ASSP Z359 rates an anchor to a specific load for exactly this reason, and a guardrail was never tested against it.",
    "use-frayed-harness": "You pulled the frayed harness off the rack instead of setting it aside. Webbing that has started fraying has already lost strength nobody can see from a glance, and a harness like that is the one piece of this whole system that is worn against the body — it does not get a second chance to be inspected once someone is already hanging in it.",
    "skip-tieoff-transfer": "You unclipped from the first anchor before clipping into the second instead of keeping both connected through the transfer. One hundred percent tie-off means exactly what it says — a moment spent connected to nothing while moving between anchors is a moment where a fall has nothing at all to catch it.",
    "stand-under-rescue-lift": "You stood under the aerial lift's basket while it was being raised to rescue height instead of stepping clear. A basket rising on its own boom is a load moving overhead the same as any other, and standing under its path while positioning it for a rescue is trading one hazard for the very thing the rescue plan exists to prevent.",
  },

  lateNotes: {
    "srl-connector": "There is nothing to clip yet — a rated anchor has to be chosen first.",
    "lifeline-tensioner": "The lifeline has nothing to tension yet — the SRL has to be connected to the anchor first.",
    "rescue-kit": "Nothing to stage yet — the fall clearance has to be checked before the rescue kit is placed.",
  },

  steps: [
    {
      id: "read-fall-protection-plan", kind: "select", target: "fp-plan",
      title: "Read the fall protection plan: anchor rating and rescue timeframe",
      cue: "Read the plan: the anchor's rated capacity, the fall clearance the site requires, and the rescue timeframe suspension trauma sets.",
      why: "The fall protection plan is what turns an edge into a system with numbers behind it — the load an anchor is actually rated for, how much clearance a fall needs below it, and how long a suspended worker can safely wait for rescue. It is read before the harness goes on, because none of those numbers can be checked once someone is already tied off.",
    },
    {
      id: "don-harness", kind: "sequence", anyOrder: true,
      targets: ["harness-donned", "srl-clipped"],
      itemNames: { "harness-donned": "harness donned and buckled", "srl-clipped": "SRL clipped to the D-ring" },
      title: "Don the harness and clip the SRL to the back D-ring",
      cue: "Harness on and every buckle checked, then the self-retracting lanyard clipped to the back D-ring.",
      why: "A harness that is not fully buckled distributes a fall's force across whatever straps happened to be tight, instead of across the whole body the way it was designed to, and checking every buckle before clipping the SRL is what makes the rest of this plan mean anything at all.",
    },
    {
      id: "inspect-harness-webbing", kind: "find", noHint: true,
      targets: ["frayed-harness"],
      itemNames: { "frayed-harness": "frayed harness on the rack" },
      itemNotes: { "frayed-harness": "One harness on the rack has webbing fraying at a stitch line — easy to miss under a quick glance, and set aside before the crew reaches for it." },
      title: "Check the rack before the crew reaches for a harness",
      cue: "Look over the harnesses on the rack for fraying webbing, a cracked buckle, or a D-ring that does not sit square.",
      why: "A harness rack reads as interchangeable gear until the one with damage is the one somebody happens to grab, and checking the rack now — before the crew starts tying off for the day — is the only point in this job where a frayed harness costs nothing but a look to catch.",
    },
    {
      id: "select-rated-anchor", kind: "select", target: "rated-anchor",
      title: "Choose the rated anchor over the handrail beside it",
      cue: "Read both the anchor's rating plate and the handrail beside it, then choose the anchor that is actually rated for fall arrest.",
      why: "A rated anchor and a handrail that happens to be at the same height are not the same piece of equipment, and choosing correctly here — reading the rating plate rather than picking whichever is closer — is the one decision every other step in this plan depends on.",
    },
    {
      id: "connect-srl", kind: "select", target: "srl-connector",
      title: "Connect the SRL to the rated anchor",
      cue: "Clip the self-retracting lanyard's carabiner to the rated anchor and confirm the gate is closed.",
      why: "A carabiner that is not fully closed can roll open under the exact side-load a fall applies, and confirming the gate now, with two hands and no urgency, is what makes this connection something the rest of the plan can actually rely on.",
    },
    {
      id: "tension-lifeline", kind: "turn", target: "lifeline-tensioner",
      title: "Tension the horizontal lifeline",
      cue: "Turn the lifeline tensioner slowly, watching the line firm up rather than counting turns.",
      why: "A horizontal lifeline that sags too much lets a fall build more distance — and more force — before the system ever engages, and tensioning it correctly, watching the line rather than guessing at a number of turns, is what keeps the fall clearance calculation from this plan actually holding true.",
      turn: { turns: 1.0, label: "TENSION", readout: (t) => (t < 0.3 ? "slack" : t < 0.85 ? "tensioning" : "set") },
    },
    {
      id: "hundred-percent-tieoff-watch", kind: "track", target: "second-anchor", seconds: 6,
      title: "Hold one hundred percent tie-off across the transfer",
      cue: "Move toward the second anchor, keeping the tie-off reading at full connection the whole way across.",
      why: "One hundred percent tie-off means staying connected to something rated for the entire time you are exposed to a fall, and holding the reading steady through the whole transfer — rather than letting it drop while both hands are busy with the next clip — is the discipline this whole plan is actually training.",
      track: { start: 0.9, green: [0.85, 1.0], rise: 0.05, fall: 0.5, drift: 0.1, label: "TIE-OFF", readout: (v) => (v < 0.85 ? "disconnected" : "connected") },
      holdBreakNote: "The tie-off reading dropped mid-transfer — a moment disconnected between two anchors is a moment this whole plan exists to eliminate.",
    },
    {
      id: "verify-fall-clearance", kind: "gauge", target: "clearance-calc",
      title: "Check the fall clearance against the drop below",
      cue: "Read the calculated fall clearance and commit it once it settles inside the band the plan requires.",
      why: "A fall clearance calculation that comes up short means the SRL's own deceleration distance runs out before the fall does, and checking it now — with the anchor already tensioned and the actual drop below measured — is what confirms this specific edge has the room the plan assumed it did.",
      gauge: { label: "CLEARANCE", speed: 0.65, green: [0.42, 0.62], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the plan's band — hold the reading until it stops moving before you commit it." },
    },
    {
      id: "stage-rescue-kit", kind: "drag", target: "rescue-kit",
      title: "Stage the rescue kit at the edge",
      cue: "Carry the rescue kit from the toolchest to the staging point at the edge before the crew ties off.",
      why: "A suspended worker's own rescue clock starts the moment they go over the edge, and a rescue kit staged at the point of work — not back in a truck — is what keeps that clock from running out while somebody goes to fetch equipment that should already be here.",
      drag: { to: "rescue-point", radius: 0.5, missNote: "Not at the staging point — the rescue kit has to be at the edge itself, not left back at the toolchest." },
    },
    {
      id: "brief-rescue-plan", kind: "select", target: "rescue-board",
      title: "Brief the rescue plan to the crew",
      cue: "Walk the crew through the rescue plan: who responds, how, and the timeframe before suspension trauma sets in.",
      why: "A rescue plan that exists only on paper is a rescue plan nobody executes correctly the one time a fall actually happens, and briefing it to the crew before anyone ties off is what makes the response reflexive instead of improvised in the minutes suspension trauma allows.",
    },
    {
      id: "position-aerial-lift-outriggers", kind: "select", target: "lift-outriggers",
      title: "Set the rescue lift's outriggers",
      cue: "Deploy the aerial lift's outriggers and level it before it stands by for an assisted rescue.",
      why: "A lift called on to reach a suspended worker fast cannot be discovered unlevel at that moment, and setting its outriggers now, while it is standing by rather than already needed, is what makes the rescue plan's own equipment ready the instant it has to be.",
    },
    {
      id: "rescue-lift-hold", kind: "hold", target: "lift-controls", seconds: 5,
      title: "Hold the rescue lift's raise smooth",
      cue: "Hold the lift's raise control steady through a full test raise to rescue height.",
      why: "A basket that jerks on its way up is a basket that would arrive at a suspended worker off balance, and holding the raise smooth on a test run now is what confirms the lift will actually do that cleanly the one time it matters.",
      holdBreakNote: "The raise control let go partway up — the basket lurched. Hold it smooth from the ground to rescue height in one motion.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew",
      cue: "Call the crew: anchors rated, clearance checked, rescue plan briefed and the lift standing by.",
      why: "The crew's own confidence in this system depends on hearing it confirmed out loud, not assuming the competent person already checked everything — calling it in is what makes the plan something the whole crew heard, not just something one person verified alone.",
    },
    {
      id: "close-fp-log", kind: "select", target: "fp-log",
      title: "Close the fall protection log",
      cue: "Record the anchor rating, the clearance calculation, the frayed harness set aside, and the rescue plan before work begins.",
      why: "The fall protection log is the site's own record that today's system was actually checked, not assumed to be the same as yesterday's, and a frayed harness pulled off the rack that never makes the log is a hazard the next crew has no way of knowing was already found once.",
    },
  ],

  interrupts: [
    {
      id: "arrest-activates-below",
      kind: "A fall arrest activates on a nearby crew member",
      after: "hundred-percent-tieoff-watch", delay: 2, seconds: 14,
      alert: "A fall arrest system has just activated on a crew member working the next bay over — they are hanging in their harness.",
      cue: "Get the rescue lift's outriggers down now — the fall clearance check waits.",
      target: "lift-outriggers",
      why: "A crew member already suspended is on the rescue plan's own clock the moment the arrest activates, and setting the lift's outriggers now — the first step toward actually reaching them — is what starts the rescue instead of finishing a calculation for a fall that has not happened yet.",
      missNote: "The clearance check continued while the suspended worker waited; the lift's outriggers were not set until several minutes after the arrest activated.",
      wrongNote: "The rescue lift's outriggers — a live suspension is answered by starting the rescue, not by finishing paperwork already in hand.",
    },
    {
      id: "wind-gust-halts-edge-work",
      kind: "A wind gust warning arrives mid-staging",
      after: "stage-rescue-kit", delay: 2, seconds: 12,
      alert: "A wind gust warning has just come in above the crew's own edge-work limit.",
      cue: "Call the crew off the edge now — the rescue plan briefing waits.",
      target: "crew-radio",
      why: "Wind above the edge-work limit changes the fall-clearance math this whole plan was built on, and calling the crew back from the edge the moment the warning lands is what keeps today's anchors from being tested by a gust before anyone finished deciding they were safe to use.",
      missNote: "The rescue plan briefing continued at the edge through the gust warning; the crew was still standing at the rail when the wind actually arrived.",
      wrongNote: "The crew radio — a wind gust warning is called in immediately, ahead of finishing a briefing already underway.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, FPA_ACCENT);

    // -------------------------------------------------------------- deck
    const pad = box(g, 6.6, 0.06, 5.2, 0, 0.03, 0, 0xffffff, { rough: 0.85 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { base: "#3a3f45", base2: "#2e3237" }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.1, color: 0x9aa0a6 });

    // ------------------------------------------------------------- anchors
    const anchorA = group(g, -1.4, 0, -1.6);
    box(anchorA, 0.14, 0.6, 0.1, 0, 0.3, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const ringA = torus(anchorA, 0.05, 0.012, 0, 0.62, 0, FPA_ACCENT, { emissive: FPA_ACCENT, ei: 1.4, rough: 0.4, seg: 6, seg2: 16 });
    holoTag(anchorA, "rated anchor — 5000 lb", 0, 0.85, 0, { css: FPA_CSS, w: 0.4 });
    reg(hits, ringA, "rated-anchor");
    const anchorB = group(g, 1.4, 0, -1.6);
    box(anchorB, 0.14, 0.6, 0.1, 0, 0.3, 0, 0x8a949d, { rough: 0.4, metal: 0.7 });
    const ringB = torus(anchorB, 0.05, 0.012, 0, 0.62, 0, FPA_ACCENT, { emissive: FPA_ACCENT, ei: 1.4, rough: 0.4, seg: 6, seg2: 16 });
    holoTag(anchorB, "second anchor", 0, 0.85, 0, { css: FPA_CSS, w: 0.3 });
    reg(hits, ringB, "second-anchor");
    hose(g, [[-1.4, 0.62, -1.6], [0, 0.58, -1.65], [1.4, 0.62, -1.6]], 0.012, 0xc0c6cc, { steps: 10 });
    const tensioner = box(g, 0.08, 0.1, 0.08, 0, 0.5, -1.65, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    holoTag(tensioner, "lifeline tensioner", 0, 0.2, 0, { css: FPA_CSS, w: 0.36 });
    reg(hits, tensioner, "lifeline-tensioner");

    // The unrated handrail decoy.
    const handrail = group(g, -0.5, 0, -2.4);
    for (const x of [-0.5, 0.5]) cyl(handrail, 0.02, 0.02, 0.9, x, 0.45, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    cyl(handrail, 0.02, 0.02, 1.0, 0, 0.9, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(handrail, "guardrail — not an anchor", 0, 1.1, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, handrail, "clip-to-unrated-handrail");

    // ------------------------------------------------------------------ SRL
    const srl = group(g, -1.0, 0, -1.0);
    box(srl, 0.12, 0.14, 0.08, 0, 0.5, 0, 0x2b3138, { rough: 0.5 });
    holoTag(srl, "SRL connector", 0, 0.62, 0, { css: FPA_CSS, w: 0.3 });
    reg(hits, srl, "srl-connector");

    // -------------------------------------------------------------- rack
    const rack = group(g, -3.0, 0, 1.6, 0.3);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const goodHarness = group(rack, -0.14, 1.0, 0);
    box(goodHarness, 0.16, 0.5, 0.06, 0, 0, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(rack, "harness", -0.14, 1.3, 0, { css: FPA_CSS, w: 0.24 });
    reg(hits, goodHarness, "harness-donned");
    const fadedHarness = group(rack, 0.16, 1.0, 0);
    box(fadedHarness, 0.16, 0.5, 0.06, 0, 0, 0, 0x8a6a4a, { rough: 0.8 });
    holoTag(rack, "check the rack", 0.16, 1.3, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, fadedHarness, "frayed-harness");
    const useFrayedHit = box(g, 0.2, 0.3, 0.2, -2.84, 1.15, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab the frayed one?", -2.84, 1.5, 1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, useFrayedHit, "use-frayed-harness");
    const srlClipProp = group(rack, 0, 1.55, 0);
    ball(srlClipProp, 0.03, 0, 0, 0, 0xc0c6cc, { rough: 0.4, metal: 0.6 });
    holoTag(rack, "clip the SRL", 0, 1.68, 0, { css: FPA_CSS, w: 0.28 });
    reg(hits, srlClipProp, "srl-clipped");
    const skipTieoffHit = box(g, 0.3, 0.3, 0.3, 0.2, 0.9, -1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unclip to cross?", 0.2, 1.2, -1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, skipTieoffHit, "skip-tieoff-transfer");

    // ------------------------------------------------------------- clearance
    const clearanceGauge = instrument(g, 2.0, 1.0, -0.6, { ry: -0.5, idle: "-- %", color: FPA_ACCENT, w: 0.1, d: 0.16 });
    holoTag(clearanceGauge, "clearance calc", 0, 0.18, 0, { css: FPA_CSS, w: 0.32 });
    reg(hits, clearanceGauge, "clearance-calc");

    // ------------------------------------------------------------- rescue kit
    const rescueKit = box(g, 0.4, 0.3, 0.3, 2.6, 0.15, 1.6, 0x2b3138, { rough: 0.6 });
    holoTag(rescueKit, "rescue kit", 0, 0.4, 0, { css: FPA_CSS, w: 0.28 });
    reg(hits, rescueKit, "rescue-kit");
    const rescuePoint = torus(g, 0.3, 0.012, -2.4, 0.02, 0.4, FPA_ACCENT, { emissive: FPA_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    rescuePoint.rotation.x = Math.PI / 2;
    holoTag(g, "rescue staging", -2.4, 0.4, 0.4, { css: FPA_CSS, w: 0.34 });
    reg(hits, rescuePoint, "rescue-point");

    // ------------------------------------------------------------- lift
    const lift = aerialBoomLift(g, 3.0, 0, 0.4, { ry: -1.6, livery: { colour: 0xe8b02e, fleetName: "SMARTCITI FLEET", unitNumber: "AL-9" } });
    const liftParts = lift.userData.parts ?? {};
    holoTag(lift, "aerial lift", 0, 2.3, 0, { css: FPA_CSS, w: 0.28 });
    reg(hits, liftParts.wheels?.[0] ?? lift, "lift-outriggers");
    reg(hits, liftParts.groundControls ?? lift, "lift-controls");
    const standUnderHit = box(g, 1.0, 0.3, 1.0, 3.0, 0.6, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "stand under the basket?", 3.0, 1.0, 0.4, { css: "#d2312b", w: 0.48 });
    reg(hits, standUnderHit, "stand-under-rescue-lift");

    // -------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.95, 0.66, -3.2, 1.35, -1.0, (cx, w, h) => {
      cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = FPA_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fff6df"; cx.fillText("FALL PROTECTION PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#fffaef";
      ["Anchor rating: 5,000 lb minimum", "Fall clearance: on the gauge's band",
        "100% tie-off across every transfer", "Rescue timeframe: suspension trauma window",
        "Rescue kit staged at the edge", "Lift standing by, outriggers down"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.5, accent: FPA_ACCENT });
    reg(hits, plan, "fp-plan");

    const board = holoPanel(g, 0.6, 0.42, 1.5, 1.3, 1.6, (cx, w, h) => {
      cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = FPA_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fff6df"; cx.fillText("RESCUE PLAN", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fffaef";
      ["Responder: lift-assisted", "Timeframe: on the plan", "Kit: at the edge"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.6, accent: FPA_ACCENT });
    reg(hits, board, "rescue-board");

    const log = holoPanel(g, 0.6, 0.42, -2.6, 1.3, 1.7, (cx, w, h) => {
      cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = FPA_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fff6df"; cx.fillText("FP LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#fffaef";
      ["Anchor: —", "Clearance: —", "Harness: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.9, accent: FPA_ACCENT });
    reg(hits, log, "fp-log");

    // -------------------------------------------------------------- radio
    const chest = toolChest(g, 2.6, -1.4, { ry: -0.4, color: 0x2b3138 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 10 · CREW", color: FPA_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "crew radio", 0, 0.16, 0, { css: FPA_CSS, w: 0.3 });
    reg(hits, radio, "crew-radio");

    // ---------------------------------------------------------- perimeter
    cone(g, -3.5, -2.6); cone(g, 3.5, -2.6);
    barrierPanel(g, 0, -2.7, { color: 0xf2c14b, w: 4.6 });

    // ------------------------------------------------------------------ crew
    const crewMember = standingFigure(g, -1.9, 0.6, { ry: 1.2, cloth: 0x2b3138, vest: FPA_ACCENT, helmet: 0xf2f2f2 });
    holoTag(crewMember, "ironworker", 0, 1.95, 0, { css: FPA_CSS, w: 0.28 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-harness-webbing") fadedHarness.children[0].material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.6, rough: 0.6 });
        if (step.id === "select-rated-anchor") ringA.material = mat(0x59c97b, { emissive: 0x1a5a2a, ei: 0.6, rough: 0.4 });
        if (step.id === "verify-fall-clearance") repaint(clearanceGauge.userData.screen, signFace("IN BAND", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        if (step.id === "brief-rescue-plan") {
          repaint(board.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fff6df"; cx.fillText("RESCUE PLAN", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Responder: briefed", "Timeframe: understood", "Kit: at the edge"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("PLAN BRIEFED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        if (step.id === "close-fp-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#1c1608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fff6df"; cx.fillText("FP LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Anchor: rated, logged", "Clearance: in band", "Harness: 1 set aside"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "arrest-activates-below") crewMember.position.set(-1.9, 0, -0.2);
        if (it.id === "wind-gust-halts-edge-work") plan.material?.emissiveIntensity;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "arrest-activates-below") crewMember.position.set(-1.9, 0, 0.6);
        if (it.id === "wind-gust-halts-edge-work") repaint(radio.userData.screen, signFace("EDGE CLEARED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "tension-lifeline") tensioner.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify-fall-clearance") repaint(clearanceGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "hundred-percent-tieoff-watch" && session.holding) repaint(clearanceGauge.userData.screen, signFace(session.track.v >= 0.85 ? "CONNECTED" : "CHECK LINE", { bg: "#0d1c24", accent: session.track.v >= 0.85 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.4 }));
        void dt; void t; void CITY;
      },
    };
  },
};
