import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, concreteFace, stainlessFace, gratingFace, reg,
} from "../citykit.js";
import { glassVacuumLifter } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Swing Stage Glazing And Sealant VR — Construction &
// Structural Trades, glaziers and architectural metal pack. A two-point
// suspended swing stage, rigged from roof outriggers and counterweights, is
// the platform a broken high-rise lite gets replaced from and an ageing
// sealant joint gets recaulked from, storeys above the plaza. Two wire ropes
// hold the stage; one rope grab on an independent lifeline is the only thing
// that holds the person if either of those ropes ever stops. Nothing on a
// swing stage is redundant by accident — every second system on it exists
// because the first one is a machine, and machines fail.

const GLSS_ACCENT = 0x4fa3d1;

export const SIM_GL_SWING_STAGE_GLAZING_AND_SEALANT = {
  id: "gl-swing-stage-glazing-and-sealant",
  index: "355",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 swing stage and suspended access",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials for the replacement lite; OSHA 29 CFR 1926.451 scaffolds general requirements, 29 CFR 1926.454 training requirements for scaffold erectors and users, 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria for the independent lifeline; ANSI Z359 fall protection component standards for the rope grab and its anchor",
  name: "Swing Stage Glazing And Sealant",
  title: simTitle("Swing Stage Glazing And Sealant"),
  tagline: "Tailboard and wind read, the rig walked and the lifeline proven, the stage descended on a held tie-back, a cracked lite replaced and reveal checked, the joint sealed, and the stage raised and stowed",
  accent: GLSS_ACCENT,
  accentCss: "#4fa3d1",
  parSeconds: 305,
  footprint: 2.3,
  badge: { id: "stage-rigged-clean", name: "Stage Rigged Clean", note: "A swing stage rigged, tied back and descended on an independent lifeline, with a facade lite replaced and sealed without the stage ever swinging free" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the stage swinging away from the facade is what you keep seeing",

  game: system({
    name: "Stage Crew",
    currency: "ROPE",
    ranks: ["Pre-apprentice", "Ground Hand", "Stage Rigger", "Lead Glazier", "Suspended Access Certified"],
    badges: [
      { id: "wind-read", name: "Wind Read", note: "The wind read against the stage's rated limit before it descended", test: AWARD.stepClean("wind-read") },
      { id: "line-never-slack", name: "Line Never Slack", note: "No unsafe action on the stage the whole run", test: AWARD.safe },
      { id: "reveal-true", name: "Reveal True", note: "The replacement lite's reveal checked inside tolerance, first read", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-descent", name: "Clean Descent", note: "The stage descended without a correction", test: AWARD.clean },
      { id: "tie-back-held", name: "Tie-Back Held", note: "The stage never came off the facade before the panel was set", test: AWARD.unbroken },
      { id: "stage-in-time", name: "Stage In Time", note: "Rigged, worked and stowed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cracked-panel-edge": "You picked the cracked facade lite up by hand instead of leaving it on the cups. A lite that has already failed carries its own weight unevenly, and an edge that has started to let go is an edge that can finish the job in your hand rather than the frame's. The cracked lite comes off on the vacuum cups, gloved, and never by a bare grip on its edge.",
    "rope-no-secondary": "You unclipped the rope grab from the independent lifeline to reach further along the stage. The two suspension ropes hold the stage; the rope grab on its own separate line is the only thing that holds the person if either of those ropes lets go, and it is a different rope on a different anchor for exactly that reason. The grab stays clipped and sliding with you the whole time you are on the stage, full stop.",
    "hoist-pinch": "You reached toward the traction hoist's wire rope while it was paying out. The hoist pulls the suspension rope through itself under the stage's own weight, and a hand near the drum or the rope's entry point when it is running is a hand the hoist has no way of stopping for. The rope is fed and guided from a safe distance, never steadied by a hand at the drum.",
    "stage-facade-strike": "You let the stage swing free of the facade in a gust instead of holding the push-away pole against the wall. A stage on two wire ropes with nothing bracing it against the building is a pendulum, and a gust that swings it away comes back the other way with the same energy — straight into the glass it just came from. The pole stays planted against the facade the whole time the stage is worked from.",
  },

  lateNotes: {
    "replacement-lite": "The new lite comes off the stage rack after the rope grab is proven on the lifeline and the tie-back pole is planted. A lite lifted before the stage is secured to the facade is a lite handled on a platform that can still swing.",
    "sealant-gun": "Sealant goes into a joint whose panel is already clipped and reveal-checked. A bead run against a panel still settling in its clips is a bead that opens the first time the panel moves.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — the rig plan, the wind limit for the stage, who is on the roof, the drop zone below — and sign it.",
      why: "A swing stage rig changes every time it goes up: a different elevation, a different outrigger spacing, a different wind limit for that stage's rated capacity. Signing the tailboard is what makes today's rig plan the one the crew is actually working to, rather than the one from the last building this crew rigged.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind against the stage's rated limit",
      cue: "Take the anemometer reading at the roof edge and commit it inside the working band before the stage goes over the parapet.",
      why: "A swing stage's wind rating is lower than almost anything else this crew works from, because two wire ropes give a stage nothing to resist a sideways push the way a boom lift's own mass does. A reading over the band means the stage stays on the roof, because a stage already over the edge in a gust it was not rated for has no way back up except the same hoists that got it there.",
      gauge: { label: "WIND", speed: 0.68, green: [0.16, 0.44], readout: (t) => `${(t * 32).toFixed(0)} km/h`, missNote: "That reading is outside the stage's working band — over it, the rig waits on the roof; under it, read it again at the parapet." },
    },
    {
      id: "rig-seq", kind: "sequence",
      targets: ["outrigger-tieback", "counterweight-count", "parapet-clamp"],
      itemNames: { "outrigger-tieback": "outrigger tied back to a structural anchor", "counterweight-count": "counterweights counted to the rig plan", "parapet-clamp": "parapet clamp checked tight" },
      title: "Check the roof rig",
      cue: "Outrigger tie-back first, then the counterweight count against the rig plan, then the parapet clamp — in that order.",
      why: "The outrigger's tie-back to a structural anchor is what keeps the whole rig from walking off the parapet under the stage's own load, the counterweight count is what the outrigger's leverage was calculated against and a rig short even one weight is a rig carrying more moment than it was designed for, and the parapet clamp is checked last because it is what keeps the outrigger from rocking once the first two are already right.",
      outOfOrderNote: "Tie-back, then counterweights, then the clamp — the clamp only means something once the rig behind it is already correct.",
    },
    {
      id: "roof-walk", kind: "find", noHint: true,
      targets: ["loose-counterweight", "coiled-rope-path"],
      itemNames: { "loose-counterweight": "a counterweight not pinned to the stack", "coiled-rope-path": "coiled excess rope sitting in the outrigger's swing path" },
      itemNotes: {
        "loose-counterweight": "One counterweight on the stack is sitting unpinned — a block that can walk off the stack is a block the outrigger's calculation no longer has.",
        "coiled-rope-path": "The excess suspension rope is coiled directly in the path the outrigger sweeps if it needs to be repositioned, waiting to snag the moment anyone touches it.",
      },
      title: "Walk the roof rig before anyone goes over the parapet",
      cue: "Look at the counterweight stack and the rope on the roof — click the two things wrong before the stage takes any weight.",
      why: "Everything the person on the stage depends on sits on this roof, unwatched, the whole time they are working — an unpinned counterweight or a coil of rope in the wrong place is invisible from the stage itself and obvious from three metres away on the roof. Both get answered before the parapet is crossed.",
    },
    {
      id: "hoist-check", kind: "select", target: "hoist-controls",
      title: "Function-check the traction hoists",
      cue: "Up, down, and the hoist's own emergency brake — each answered at the roof before the stage carries anyone over the edge.",
      why: "The traction hoist is what the whole descent depends on, and its emergency brake is the one thing standing between a stage and a free-running rope if the motor ever loses control. It is tested here, at the roof, where a brake that does not answer is a fault found before the stage is a storey below the parapet rather than after.",
    },
    {
      id: "lifeline-seq", kind: "sequence",
      targets: ["rope-grab", "lifeline-anchor", "backup-device"],
      itemNames: { "rope-grab": "rope grab fitted to the lifeline", "lifeline-anchor": "independent lifeline anchor checked", "backup-device": "backup device function-tested" },
      title: "Rig the independent lifeline",
      cue: "Fit the rope grab to the lifeline first, then check the lifeline's own anchor is separate from the suspension rig, then function-test the backup device by pulling it sharply.",
      why: "ANSI Z359 treats the lifeline as a completely separate system from the suspension ropes for exactly this reason: if the rig that holds the stage up ever fails, the rope grab and its own anchor are the only thing left, and a lifeline anchored to the same point as the suspension rig fails for the same reason the suspension did. The backup device is pulled sharply here because that is the only way to know it actually locks before it has to.",
      outOfOrderNote: "Grab, then anchor, then the backup device — a device tested before it is on the right anchor tells you nothing about the anchor.",
    },
    {
      id: "descent-track", kind: "track", target: "hoist-lever", seconds: 6,
      title: "Descend the stage to the working level",
      cue: "Hold the hoist lever and keep the descent rate in the band the whole way down.",
      why: "The hoist lever is held rather than latched so that letting go stops the descent immediately, and the rate band is where the traction hoist grips the rope correctly — too fast and the rope slips inside the hoist head, too slow and the second hoist on the far end of the stage can drift out of level with the first.",
      track: { label: "DESCENT", green: [0.4, 0.6], rise: 0.5, fall: 0.42, drift: 0.15, readout: (v) => `${(v * 8).toFixed(1)} m/min` },
      holdBreakNote: "The descent rate ran out of the band — the stage can drift out of level between its two hoists. Ease back into the band before continuing down.",
    },
    {
      id: "tieback-hold", kind: "hold", target: "push-away-pole", seconds: 4,
      title: "Hold the stage to the facade with the tie-back pole",
      cue: "Plant the pole against the facade and hold the stage flat to the wall while the sealant and tools are staged.",
      why: "A stage on two wire ropes has nothing else keeping it against the building, and the moment it is left to its own momentum it starts to swing — even a light breeze is enough once the stage is stationary and something on it shifts weight. The pole is planted and held the whole time the stage is being set up to work from, not just while it is actually descending.",
      holdBreakNote: "You let the pole off the facade before the stage was staged — it started to drift out from the wall. Replant the pole and hold it flat before continuing.",
    },
    {
      id: "clip-turn", kind: "turn", target: "broken-clip",
      title: "Free the broken glazing clip",
      cue: "Turn the fastener out of the broken clip holding the cracked lite, without letting the lite drop against the frame.",
      why: "The clip is turned out rather than pried, because a pried clip can spring and drop whatever it was holding the moment it lets go, and on a stage over open air that drop has nowhere to land but the facade below or the plaza past it. A turned fastener comes out under control, with the lite already held by the cups before the last turn.",
      turn: { turns: 1, axis: "z", label: "FREE" },
    },
    {
      id: "panel-drag", kind: "drag", target: "replacement-lite",
      title: "Guide the replacement lite into the opening",
      cue: "Cups seated on the new lite, guide it from the stage rack into the frame — not released until it is offered up square to the rabbet.",
      why: "The replacement lite is guided rather than swung the same way every lite on this platform is, because a lite let go of early on a stage is a lite with a drop the length of the building underneath it. It goes to the rabbet square because a lite forced into an out-of-square opening chips the exact corner that was already carrying the old panel's failure.",
      drag: { to: "panel-rabbet", radius: 0.48, missNote: "Not square to the rabbet — a lite forced in crooked chips the corner it is offered against." },
    },
    {
      id: "sealant-track", kind: "track", target: "sealant-gun", seconds: 5,
      title: "Run the perimeter sealant bead",
      cue: "Gun at the joint, run a continuous bead at a steady pace around the new panel to the depth the glazing detail calls for.",
      why: "The bead run around a replacement panel carries the same weather load as every original joint on this facade, and a bead run unevenly from a stage that is itself moving slightly under the wind is exactly how a repair job gets a reputation for opening back up within a season. The steady pace is what the wind and the stage's own sway make hardest to hold, and also what matters most.",
      track: { label: "BEAD", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.14, readout: (v) => `${Math.round(v * 20)} mm/s` },
      holdBreakNote: "The bead ran out of the band on a moving stage — a thin spot or an overfill in the joint. Tool it out and run that stretch again holding the stage steady.",
    },
    {
      id: "reveal-gauge", kind: "gauge", target: "reveal-instrument",
      title: "Check the replacement lite's reveal",
      cue: "Read the reveal gauge against the neighbouring panels and commit inside tolerance.",
      why: "A replacement panel set to a different reveal than the facade around it is invisible from the stage and obvious from the street the moment the light changes, and the gauge is read against the actual neighbouring panels rather than a fixed number because a facade settles unevenly over its life — this bay's true reveal today is whatever the panels beside it are actually reading.",
      gauge: { label: "REVEAL mm", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.5) * 30).toFixed(1)} mm`, missNote: "Outside reveal tolerance against the neighbouring panels — back to the clips before the bead goes on." },
    },
    {
      id: "stage-walk", kind: "find", noHint: true,
      targets: ["open-gate", "loose-tool"],
      itemNames: { "open-gate": "the stage's access gate not latched", "loose-tool": "a tool on the stage deck not tethered" },
      itemNotes: {
        "open-gate": "The stage's own access gate swung shut on its hinge but never latched — a gap in the one rail between the deck and open air.",
        "loose-tool": "A tool is sitting loose on the stage deck with no tether — a stage that sways in the wind is a stage that can hand that tool to the plaza below.",
      },
      title: "Walk the stage before it goes back up",
      cue: "Look at the gate and the tools on the deck — click the two things wrong before the hoists take up again.",
      why: "The gate and every tool on this deck are things the person on the stage stopped consciously noticing hours ago, and both fail the same quiet way a barrier always does — a gate that swung shut without latching, a tool set down between tasks and never tethered. Neither goes back up the building unanswered.",
    },
    {
      id: "ascend-select", kind: "select", target: "hoist-controls-up",
      title: "Raise and stow the stage",
      cue: "Confirm the tie-back is released evenly and take the stage back up to the roof under the hoists.",
      why: "The stage goes back up under the same controlled hoist operation it came down on, released from the facade evenly so it does not swing out from the wall the moment the pole comes off — the ascent is not the reverse of the descent by accident, it is the same discipline run the other way.",
    },
    {
      id: "log", kind: "select", target: "rig-log",
      title: "Log the rig",
      cue: "Panel replaced, wind readings, lifeline inspection, counterweight count and the faults found and fixed, and sign it.",
      why: "The log ties this rig's counterweight count and wind readings to a date and a name, which is what the crew shows if this stage's rig is ever questioned after the fact. It also carries the loose counterweight and the unlatched gate as fixed rather than assumed, for whoever rigs this stage next.",
    },
  ],

  interrupts: [
    {
      id: "gust-swing",
      kind: "Gust swings the stage",
      after: "tieback-hold", delay: 3, seconds: 12,
      alert: "A gust has pushed the stage off the facade and it is swinging back toward the wall on its two suspension ropes.",
      cue: "The stage is loose of the facade and swinging.",
      target: "tie-back-line",
      why: "A stage already swinging does not stop because the pole is pushed harder against a wall it is no longer touching — the tie-back line clipped to a separate roof anchor is what arrests the swing without anyone leaning out to catch the facade with their hands. The pole can be replanted once the swing is actually stopped.",
      missNote: "The stage swung until it came back on its own and glanced the facade. Nobody's hands were on the pole when it hit. The tie-back line was rigged for exactly this gust and sat unclipped the whole time it happened.",
      wrongNote: "It is the tie-back line, clipped to the roof anchor. Stop the swing before anyone reaches for the wall.",
    },
    {
      id: "hoist-alarm",
      kind: "Hoist rope-slip alarm",
      after: "sealant-track", delay: 3, seconds: 11,
      alert: "The traction hoist's rope-slip alarm is sounding on the far side of the stage while your hands are on the sealant gun.",
      cue: "One hoist is slipping on its rope.",
      target: "hoist-estop",
      why: "A hoist slipping on its own suspension rope is the one alarm on a swing stage that means the platform itself may be about to go out of level or lose grip entirely, and the emergency stop on that hoist is what takes it out of the failure before it becomes a fall. The bead can be tooled again in a minute; a hoist slipping and ignored cannot be taken back.",
      missNote: "The alarm sounded until the slip stopped on its own. The stage held level, this time. The rope-slip alarm exists because a hoist does not always recover on its own, and the estop sat unpressed the whole time it was sounding.",
      wrongNote: "It is that hoist's emergency stop. Take it out of motion before anything else happens on this stage.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, GLSS_ACCENT);

    // ------------------------------------------------------------ the facade
    const facade = group(g, 0, 0.06, -2.6);
    const wallMesh = box(facade, 7.0, 5.6, 0.3, 0, 2.8, -0.1, 0x8b8d89, { rough: 0.9, cast: false });
    wallMesh.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth" }), { repeat: 4, px: 384 }), { rough: 0.85, metal: 0.05 });
    for (const sx of [-2.1, 0.9]) {
      const mFrame = box(facade, 1.6, 3.4, 0.14, sx, 2.6, 0.08, 0x3a4a5c, { rough: 0.35, metal: 0.55 });
      mFrame.material = texturedMat(surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, { base: "#3a4a5c", base2: "#2a3644" }), { repeat: 2, px: 256 }), { rough: 0.35, metal: 0.55 });
      box(facade, 1.4, 3.2, 0.02, sx, 2.6, 0.16, 0x9fd6e6, { rough: 0.12, metal: 0.1, opacity: 0.55, transparent: true, cast: false });
    }
    holoTag(facade, "Elevation 9 — Bay 21", 0, 5.9, 0, { css: "#4fa3d1", w: 0.4 });
    const rabbet = box(facade, 1.6, 3.4, 0.06, -0.6, 2.6, 0.18, 0xaeb5bb, { rough: 0.4, metal: 0.7, opacity: 0.001, transparent: true, cast: false });
    hits["panel-rabbet"] = rabbet;
    const clipObj = box(facade, 0.1, 0.08, 0.06, -0.6, 1.2, 0.2, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, clipObj, "broken-clip");
    const joint = group(facade, -1.35, 2.6, 0.2);
    const beadMesh = box(joint, 0.02, 3.2, 0.01, 0, 0, 0.005, 0x4a4a4a, { rough: 0.8 });
    beadMesh.visible = false;
    const revealInst = instrument(facade, 0.9, 0.9, 0.25, { ry: 0.3, idle: "-- mm", color: 0x4fa3d1 });
    reg(hits, revealInst, "reveal-instrument");
    holoTag(facade, "reveal gauge", 0.9, 1.15, 0.25, { css: "#4fa3d1", w: 0.28 });
    const guns = group(g, -0.4, 1.0, -1.6, -0.3);
    cyl(guns, 0.025, 0.025, 0.24, 0, 0, 0, 0x4fa3d1, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(guns, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, guns, "sealant-gun");
    holoTag(g, "sealant gun", -0.4, 1.25, -1.6, { css: "#4fa3d1", w: 0.24 });

    // ------------------------------------------------------------ the roof rig
    const roof = group(g, 0, 4.4, 1.4);
    box(roof, 6.0, 0.1, 1.6, 0, 0, 0, 0x6b6d6a, { rough: 0.9, finish: "concrete", cast: false });
    roof.children[0].material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h)), { repeat: 3, px: 256 });
    const outriggers = [];
    for (const sx of [-1.6, 1.6]) {
      const outr = group(roof, sx, 0.15, -0.4);
      box(outr, 0.08, 0.08, 1.4, 0, 0, 0.3, 0x2b2f34, { rough: 0.5, metal: 0.5 });
      const tie = hose(outr, [[0, 0, -0.4], [0, -0.2, -0.9], [0, -0.3, -1.4]], 0.012, 0x8a8f94, { steps: 8 });
      void tie;
      outriggers.push(outr);
    }
    const tieBackAnchor = box(roof, 0.14, 0.14, 0.08, 0, 0.08, -1.4, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    reg(hits, tieBackAnchor, "outrigger-tieback");
    holoTag(roof, "outrigger tie-back", 0, 0.32, -1.4, { css: "#4fa3d1", w: 0.32 });
    const cwStack = group(roof, -1.6, 0.15, 0.6);
    const cwBlocks = [];
    for (let i = 0; i < 4; i++) { const c = box(cwStack, 0.5, 0.12, 0.4, 0, 0.06 + i * 0.13, 0, 0x3a3d41, { rough: 0.7, metal: 0.3 }); cwBlocks.push(c); }
    const looseCw = box(cwStack, 0.5, 0.12, 0.4, 0, 0.58, 0, 0x3a3d41, { rough: 0.7, metal: 0.3 });
    looseCw.position.x = 0.2;
    reg(hits, looseCw, "loose-counterweight");
    reg(hits, cwStack, "counterweight-count");
    holoTag(cwStack, "counterweights", 0, 0.85, 0, { css: "#4fa3d1", w: 0.3 });
    const clamp = group(roof, 1.6, 0.15, 0.4);
    box(clamp, 0.16, 0.12, 0.12, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    reg(hits, clamp, "parapet-clamp");
    holoTag(roof, "parapet clamp", 1.6, 0.35, 0.4, { css: "#4fa3d1", w: 0.28 });
    const ropeCoil = cyl(roof, 0.16, 0.16, 0.08, 0, 0.1, -0.1, 0x1b1e22, { rough: 0.7, seg: 20 });
    reg(hits, ropeCoil, "coiled-rope-path");
    const hoistCtrl = group(roof, 0, 0.5, -1.2);
    box(hoistCtrl, 0.3, 0.3, 0.14, 0, 0, 0, 0x22262b, { rough: 0.6 });
    reg(hits, hoistCtrl, "hoist-controls");
    const estop = cyl(hoistCtrl, 0.035, 0.035, 0.03, 0.1, 0.08, 0.08, 0xd2312b, { rough: 0.4, seg: 14 });
    reg(hits, estop, "hoist-estop");
    const upCtrl = box(hoistCtrl, 0.06, 0.06, 0.02, -0.08, 0.08, 0.08, 0x59c97b, { rough: 0.5 });
    reg(hits, upCtrl, "hoist-controls-up");
    holoTag(roof, "hoist controls · stop", 0, 0.85, -1.2, { css: "#4fa3d1", w: 0.36 });
    const beacon = ball(roof, 0.04, 0.4, 0.6, -1.2, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.0 });
    beacon.visible = false;
    const anemometer = instrument(roof, -2.6, 0.5, -1.4, { ry: 0.4, idle: "-- km/h", color: 0x4fa3d1, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(roof, "anemometer", -2.6, 0.75, -1.4, { css: "#4fa3d1", w: 0.26 });

    // ------------------------------------------------------------- the stage
    const stageY = 0.06;
    const stage = group(g, 0, stageY, 0.5);
    const suspLines = [];
    for (const sx of [-1.6, 1.6]) {
      const line = hose(g, [[sx, 4.35, 1.1], [sx, 2.5, 0.8], [sx, stageY + 1.1, 0.5]], 0.012, 0x8a8f94, { steps: 10 });
      suspLines.push(line);
    }
    box(stage, 3.6, 0.06, 1.0, 0, 0.03, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    stage.children[0].material = texturedMat(surfaceTexture((cx, w, h) => gratingFace(cx, w, h)), { repeat: 4, px: 256 });
    const rails = group(stage, 0, 0, 0);
    for (const sx of [-1.78, 1.78]) for (const y of [0.55, 1.05]) box(rails, 0.03, 0.03, 1.0, sx, y, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    for (const y of [0.55, 1.05]) box(rails, 3.56, 0.03, 0.03, 0, y, 0.49, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    for (const y of [0.55, 1.05]) box(rails, 3.56, 0.03, 0.03, 0, y, -0.49, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    const gate = group(rails, -1.0, 0, -0.49);
    box(gate, 0.7, 0.03, 0.03, 0.35, 1.05, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    box(gate, 0.7, 0.03, 0.03, 0.35, 0.55, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    gate.rotation.y = 0.3;
    reg(hits, gate, "open-gate");
    const hoistLever = group(stage, -1.5, 0.7, -0.4);
    box(hoistLever, 0.06, 0.2, 0.04, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    reg(hits, hoistLever, "hoist-lever");
    holoTag(stage, "hoist lever", -1.5, 1.0, -0.4, { css: "#4fa3d1", w: 0.26 });
    const lifeline = hose(stage, [[0, 4.3, 0.1], [0, 2.5, 0.05], [0, 0.9, 0]], 0.008, 0xd2312b, { steps: 10 });
    void lifeline;
    const grab = group(stage, 0.1, 0.9, 0.1);
    box(grab, 0.05, 0.08, 0.03, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    reg(hits, grab, "rope-grab");
    const anchorPt = box(stage, 0.08, 0.08, 0.04, 0.1, 4.3, 0.1, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    reg(hits, anchorPt, "lifeline-anchor");
    const backup = group(stage, -0.1, 0.7, 0.1);
    box(backup, 0.04, 0.06, 0.02, 0, 0, 0, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    reg(hits, backup, "backup-device");
    holoTag(stage, "rope grab · lifeline", 0, 1.2, 0.1, { css: "#4fa3d1", w: 0.32 });
    const stageEdge = box(stage, 3.6, 1.2, 0.4, 0, 0.7, -0.6, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, stageEdge, "rope-no-secondary");
    const stageSwing = box(g, 4.0, 1.5, 0.6, 0, 1.6, 1.0, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, stageSwing, "stage-facade-strike");
    const hoistPinchZone = box(stage, 0.14, 0.16, 0.1, -1.5, 0.6, -0.4, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hoistPinchZone, "hoist-pinch");

    // Push-away pole and tie-back line.
    const pole = group(stage, 0.6, 0.9, 0.5, 0.3);
    cyl(pole, 0.02, 0.02, 1.6, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2 - 0.4;
    reg(hits, pole, "push-away-pole");
    holoTag(stage, "push-away pole", 0.6, 1.4, 0.5, { css: "#4fa3d1", w: 0.3 });
    const tieBackLine = hose(g, [[1.6, 4.3, 1.1], [1.0, 2.5, 1.0], [0.6, stageY + 1.0, 0.8]], 0.01, 0x59c97b, { steps: 8 });
    tieBackLine.visible = false;
    reg(hits, tieBackLine, "tie-back-line");

    // Rack of tools and the replacement/cracked lites on the stage.
    const rack = group(stage, 1.4, 0.06, 0.2, -0.2);
    box(rack, 0.8, 1.0, 0.04, 0, 0.55, 0, 0x50606c, { rough: 0.7, metal: 0.3 });
    const replacementLite = group(rack, 0, 0.55, 0.06, 0.1);
    box(replacementLite, 0.75, 0.95, 0.02, 0, 0, 0, 0xa8dcea, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    reg(hits, replacementLite, "replacement-lite");
    holoTag(rack, "replacement lite — by cups", 0, 1.1, 0.06, { css: "#4fa3d1", w: 0.4 });
    const crackedLite = box(facade, 1.4, 3.2, 0.02, -0.6, 2.6, 0.19, 0x8fc9d8, { rough: 0.15, opacity: 0.4, transparent: true, cast: false });
    reg(hits, crackedLite, "cracked-panel-edge");
    glassVacuumLifter(stage, -0.5, 0.9, 0.3, { ry: 0.4 });
    const looseTool = box(stage, 0.12, 0.03, 0.04, -0.9, 0.09, 0.3, 0x2b2f34, { rough: 0.6 });
    reg(hits, looseTool, "loose-tool");

    // ------------------------------------------------------- tailboard and log
    const tailboard = group(g, -2.9, 0.7, 2.4, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — STAGE 21", ["Rig: 2-point, bay 21", "Wind limit: per stage rating", "Lifeline: independent, own anchor", "Drop zone: plaza below barricaded", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#4fa3d1" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -2.9, 1.25, 2.4, { css: "#4fa3d1", w: 0.22 });
    const logBoard = group(g, 2.9, 0.7, 2.5, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("RIG LOG — STAGE 21", ["Panel: ____", "Wind: ____", "Lifeline insp.: ____", "Counterweights: ____", "Signed: ____"], { bg: "#f4efe4", band: "#4fa3d1" }), { px: 256 });
    reg(hits, logFace, "rig-log");
    holoTag(g, "rig log", 2.9, 1.15, 2.5, { css: "#4fa3d1", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -3.2, 1.7, 1.0, (ctx, w, h) => {
      ctx.fillStyle = "#081722"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fa3d1"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e3f2fb";
      ctx.fillText("SWING STAGE RIG PLAN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Rig: 2-point, outriggers tied back", "Counterweights: per the rig plan", "Wind limit: per the stage's rating", "Lifeline: independent anchor, own line", "Sealant: listed silicone, per drawing depth"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLSS_ACCENT, ry: 0.5, stalk: true });

    // ----------------------------------------------------------- the crew
    const journeyman = standingFigure(g, 0.4, 1.6, { ry: -2.8, cloth: 0x2b5a7a, trousers: 0x2b2f34, helmet: 0x4fa3d1, vest: 0xf2c14b, harness: true, gloves: true });
    const roofHand = standingFigure(roof, -2.4, 0.15, 0.3, { ry: 1.6, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b });
    void roofHand;

    // --------------------------------------------------------- dressing
    for (const [x, z] of [[-2.9, 3.0], [3.0, 3.0]]) cone(g, x, z);
    for (let i = 0; i < 5; i++) { const s = ball(g, 0.4 + (i % 2) * 0.2, -3.6 + i * 1.8, 4.6 + (i % 3) * 0.3, -3.5, 0xdfe9ee, { rough: 1, cast: false, opacity: 0.55, transparent: true }); s.scale.set(2.2, 0.6, 1); }

    let stageDescending = false, tieBackHeld = true;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, 1.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "roof-walk") { looseCw.material = mat(0x3a3d41, { rough: 0.7, metal: 0.3 }); ropeCoil.visible = false; }
        if (step.id === "lifeline-seq") { grab.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "clip-turn") { clipObj.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "panel-drag") {
          replacementLite.parent.remove(replacementLite); facade.add(replacementLite);
          replacementLite.position.set(-0.6, 2.6, 0.19); replacementLite.rotation.set(0, 0, 0);
          crackedLite.visible = false;
        }
        if (step.id === "sealant-track") { beadMesh.visible = true; }
        if (step.id === "stage-walk") { gate.rotation.y = 0; looseTool.visible = false; }
        if (step.id === "log") repaint(logFace, paperFace("RIG LOG — STAGE 21", ["Panel: bay 21, replaced", "Wind: 10–14 km/h", "Lifeline insp.: pass", "Counterweights: 4, pinned", "Signed: apprentice / journeyman"], { bg: "#f4efe4", band: "#4fa3d1" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-swing") { stage.rotation.z = 0.12; pole.rotation.x = 0.3; }
        if (it.id === "hoist-alarm") { beacon.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-swing") { stage.rotation.z = 0; tieBackLine.visible = true; }
        if (it.id === "hoist-alarm") { beacon.visible = false; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        tieBackHeld = !!(step?.id === "tieback-hold" && session.holding);
        stageDescending = step?.id === "descent-track";
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 32).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.16 && gg.t <= 0.44 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        if (gg && !gg.committed && step?.id === "reveal-gauge") {
          repaint(revealInst.userData.screen, signFace(`${((gg.t - 0.5) * 30).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "sealant-track") { beadMesh.visible = true; beadMesh.scale.y = Math.min(1, tr.inBand / 5); beadMesh.position.y = -1.6 + beadMesh.scale.y * 1.6; }
        if (beacon.visible) beacon.rotation.y += dt * 4;
        if (!tieBackHeld && step?.id !== "descent-track") stage.rotation.z *= (1 - Math.min(1, dt * 0.4));
      },
    };
  },
};
