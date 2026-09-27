import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, lockTag, reg,
  surfaceTexture, texturedMat, blockFace, gratingFace, palette,
} from "../citykit.js";
import { windTurbine } from "../../../shared/equipment.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Turbine Climb & Rescue-Kit Check VR — Energy & Power,
// IBEW / Ironworkers wind technician.
//
// A tower climb starts on the ground: the wind read against the site's own
// climb limit, the harness walked by hand, the rescue kit opened and proven
// before anyone is above it, and a second climber who can use it. Only then
// does the runner go on the fall-arrest rail and get tugged, and the climb
// itself is paced so the arms are not spent by the first rest platform.
// Sited generically: no real farm, turbine model, height or wind figure —
// the climb limit is the site's procedure and the kit is the manufacturer's.

const WS1_ACCENT = 0x3fa7d6;
const WS1_CSS = "#3fa7d6";
const WS1_PAL = palette("utility");

export const SIM_WS_TURBINE_CLIMB_AND_RESCUE_KIT_CHECK = {
  id: "ws-turbine-climb-and-rescue-kit-check",
  index: "ws-01",
  domain: "Energy",
  trade: "IBEW / Ironworkers wind technician",
  category: "Energy & Power",
  district: "wind-farm",
  weather: "wind",
  certification: "IBEW/NECA JATC and Ironworkers IMPACT wind-technician training as bodies; ANSI Z359 for the harness, the fall-arrest rail system and the rescue kit; 29 CFR 1910.269 for work on generation installations; 29 CFR 1910.28 and 29 CFR 1910.23 for the fixed ladder and its fall protection; the turbine manufacturer's manual and the site's climb procedure for every limit",
  name: "Turbine Climb & Rescue-Kit Check",
  title: simTitle("Turbine Climb & Rescue-Kit Check"),
  tagline: "The wind read against the site's own limit, the harness walked by hand, the rescue kit opened and proven with a second climber who can use it, and the runner tugged on the rail before a single rung",
  accent: WS1_ACCENT,
  accentCss: WS1_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "proven-before-rung-one", name: "Proven Before Rung One", note: "Wind, harness, rescue kit, buddy and runner all proven on the ground before the climb began" },

  game: system({
    name: "Tower Authority",
    currency: "RUNGS",
    ranks: ["Trainee Climber", "Climber", "Wind Technician", "Lead Technician", "Tower Authority Certified"],
    badges: [
      { id: "kit-opened", name: "Kit Opened", note: "The rescue kit was opened and proven, not trusted by its bag", test: AWARD.stepClean("rescue-kit") },
      { id: "never-free-climbed", name: "Never Free-Climbed", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-climber", name: "Steady Climber", note: "Held the climb pace steady", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-climb", name: "Clean Climb", note: "No corrections from the permit to the log", test: AWARD.clean },
      { id: "unbroken-pace", name: "Unbroken Pace", note: "The climb ran to the platform without a break", test: AWARD.unbroken },
      { id: "brisk-ground-check", name: "Brisk Ground Check", note: "Up and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "free-climb-no-runner": "You went to start up the ladder without the runner on the fall-arrest rail. A fixed ladder in a tower is a long fall in a narrow tube, and a slip of one hand on a rung with nothing connecting the harness to the rail ends at the bottom of it.",
    "expired-rescue-kit": "You went to take a rescue kit whose seal was broken and whose inspection tag had not been signed. A kit that has been opened and not re-inspected may be missing the one part the rescue needs, and it is found out only when a climber is hanging in a harness waiting for it.",
    "climb-alone": "You went to start the climb with no second climber on site. A rescue kit is only as good as the person who can rig it, and a technician suspended in a harness cannot rescue themselves — the plan needs a second trained person at the tower.",
    "hatch-left-open": "You went to leave the platform hatch open behind you. An open hatch above a ladder is a hole a tool, a boot or a person can go down, onto whoever is climbing below.",
  },

  lateNotes: {
    "fall-arrest-runner": "The runner goes on the rail only after the harness has been walked and the rescue kit proven — not as the first thing done at the door.",
    "platform-hatch": "The hatch is closed once the climber is on the platform and clipped to the anchor, not while they are still on the ladder beneath it.",
  },

  faults: [
    {
      id: "fall-arrest-rail-damage",
      label: "Fall-arrest rail damage",
      note: "A section of the fall-arrest rail above the door is bent and carries a red inspection tag. The climb does not start on a damaged rail: tag the ladder out and call the site lead.",
      step: "attach-runner",
      change: {
        kind: "select", target: "rail-out-of-service",
        title: "Tag the ladder out of service",
        cue: "The rail is bent above the door — hang the out-of-service tag and call the site lead instead of attaching the runner.",
        why: "A runner locks onto the rail because the rail is straight and whole; on a bent section it can bind or pass the bend without catching, so the fall arrest that the whole climb depends on is not there. Tagging the ladder out stops the next climber assuming the rail is sound and puts the repair in front of the site lead.",
        drag: undefined,
      },
    },
  ],

  interrupts: [
    {
      id: "ground-lead-radio",
      kind: "The site lead calls on the radio",
      after: "runner-test", delay: 3, seconds: 12,
      alert: "The site lead is calling the tower on the radio — the wind forecast for the afternoon has changed and they want to talk before anyone climbs.",
      cue: "Answer the site lead on the radio before you leave the ground.",
      target: "climb-radio",
      why: "A changed forecast is exactly the kind of fact that turns a climb that was a go into one that is not, and the moment to hear it is with both feet on the ground, not halfway up with the arms tiring and the rest platform still above.",
      missNote: "The call went unanswered. Whatever the site lead knew about the weather stayed on the ground while the climb went on without it.",
      wrongNote: "It is the radio. The runner has already been tugged; the call is the new information.",
    },
    {
      id: "gust-front",
      kind: "A gust front arrives mid-climb",
      after: "climb-pace", delay: 3, seconds: 11,
      alert: "A gust front is coming over the ridge — the tower hums and the wind sock stands straight out.",
      cue: "Get onto the rest platform and clip to its anchor until it passes.",
      target: "rest-platform-anchor",
      why: "The rest platform and its anchor are where a climber waits out a change in conditions without hanging on the ladder, and a clip to the anchor means a second point of connection while the tower moves and the climber decides with the ground whether to go on or come down.",
      missNote: "The climber stayed on the ladder through the gust front, arms loaded and one connection to the rail, with no decision made with the ground.",
      wrongNote: "It is the rest-platform anchor. The climb pace is what put you here; waiting out the gust is what keeps you there safely.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your IBEW or Ironworkers steward if you are not sure how to reach it",

  steps: [
    {
      id: "climb-permit", kind: "select", target: "climb-permit",
      title: "Read the climb plan",
      cue: "Read the climb plan: the turbine, the work, the climbers named and the site's weather limit for climbing.",
      why: "The climb plan names who climbs, who stands by with the rescue kit and what weather stops the job, so the decision about the wind is made against a limit the site wrote down in advance rather than by how the morning feels at the tower door.",
    },
    {
      id: "wind-check", kind: "gauge", target: "wind-readout",
      title: "Read the wind against the site limit",
      cue: "Bring the anemometer reading up to where the wind is, then commit — is it inside the site's climb limit?",
      why: "The wind at the top of a tower is not the wind at the door, and the site's climb limit exists because a climber on a ladder or a technician at the hatch is exposed to both the load and the tower's motion. Reading the met-mast value against that written limit is the go or no-go, made before anybody is committed to the ladder.",
      gauge: { label: "WIND vs SITE LIMIT", speed: 0.6, green: [0.3, 0.6], readout: (t) => (t > 0.6 ? "over the site limit" : t < 0.3 ? "reading low — check the mast" : "inside the site limit"), missNote: "That reading is not the one the mast shows — read it again before the go or no-go is made." },
    },
    {
      id: "harness-check", kind: "sequence",
      targets: ["harness-webbing", "harness-dring", "harness-buckles"],
      itemNames: { "harness-webbing": "webbing and stitching walked", "harness-dring": "front and back D-rings checked", "harness-buckles": "buckles fastened and tails stowed" },
      title: "Walk the harness by hand",
      cue: "Walk the webbing and stitching, check the D-rings, then fasten the buckles and stow the tails.",
      why: "A cut strap or a pulled stitch shows under a hand run along the webbing, not under a glance at a harness on a hook, and the D-rings and buckles are the parts that carry the arrest force into the body. The order runs from the material to the hardware to the fit, so nothing is buckled over a defect that was never looked at.",
      outOfOrderNote: "Webbing, then D-rings, then buckles — a harness fastened before it is walked hides the strap you did not check.",
    },
    {
      id: "rescue-kit", kind: "find", noHint: true,
      targets: ["kit-seal-broken", "kit-tag-unsigned"],
      itemNames: { "kit-seal-broken": "the kit bag's seal broken", "kit-tag-unsigned": "the inspection tag unsigned" },
      itemNotes: {
        "kit-seal-broken": "The seal on this bag is broken: someone has opened it since it was last inspected, and nobody on the ground knows what came out.",
        "kit-tag-unsigned": "The inspection tag has no signature for the last check — this kit is not proven until it is opened, counted against its list and signed.",
      },
      title: "Open and prove the rescue kit",
      cue: "Check the rescue kit before the climb and find what stops it being ready.",
      why: "The rescue kit is the plan for the worst minute of the day — a climber suspended in a harness — and a kit with a broken seal or an unsigned tag may be missing the descender, the rope or the anchor sling that minute needs. Finding it on the ground costs a swap from the van; finding it at height costs time the suspended climber does not have.",
    },
    {
      id: "rescue-buddy", kind: "select", target: "rescue-plan-board",
      title: "Confirm the second climber and the rescue plan",
      cue: "Confirm on the rescue board that a second trained climber is on site and knows the plan.",
      why: "A self-rescue is not always possible, and the rescue plan only works if a second person trained on this kit is at the tower and has agreed who does what. Confirming that aloud before the climb means nobody finds out during a rescue that the plan had a gap in it.",
    },
    {
      id: "open-tower", kind: "sequence",
      targets: ["tower-door", "tower-lights"],
      itemNames: { "tower-door": "tower door unlocked and pinned open", "tower-lights": "tower lights switched on" },
      title: "Open the tower and light the climb",
      cue: "Unlock and pin the tower door, then switch on the tower lights.",
      why: "A door that swings shut behind a climber cuts off the light and the radio path to the ground, and a ladder climbed in the dark is a ladder where a missing rung or a loose runner is not seen. The door pinned and the lights on make the tube a place where the next defect can be seen before it is stepped on.",
      outOfOrderNote: "Door first, then the lights — the switch is inside the door.",
    },
    {
      id: "attach-runner", kind: "drag", target: "fall-arrest-runner",
      title: "Put the runner on the fall-arrest rail",
      cue: "Carry the runner to the rail and seat it the right way up, connected to the front D-ring.",
      why: "The runner locks onto the rail only when it is fitted the right way up and connected to the harness point the manufacturer names; upside down it can ride down the rail with the climber instead of catching. Fitting it before the first rung means the climber is connected from the ground up.",
      drag: { to: "rail-attach-point", radius: 0.5, missNote: "Not seated on the rail — the runner has to be on the rail itself, the right way up, before the climb." },
    },
    {
      id: "runner-test", kind: "hold", target: "runner-test-handle", seconds: 4,
      title: "Tug-test the runner",
      cue: "Hold a sharp downward tug on the runner until it locks.",
      why: "A runner that does not lock on a sharp tug at the bottom will not lock on a fall halfway up, and the test takes seconds with both feet on the ground. It proves the runner, its fit on this rail and its connection to the harness all at once.",
      holdBreakNote: "The tug stopped before the runner locked — test it again, a runner that has not locked on the ground is not proven.",
    },
    {
      id: "climb-pace", kind: "track", target: "climb-pace-meter", seconds: 7,
      title: "Climb at a steady pace",
      cue: "Keep the climb pace in the band — three points of contact, the legs doing the work, no racing the ladder.",
      why: "The fall-arrest rail catches a fall; a paced climb keeps one from happening. A climber who races the first sections arrives at the rest platform with spent forearms and a slipping grip, while a steady pace with the legs doing the work keeps something in reserve for the hatch and the tasks above.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.12, label: "CLIMB PACE", readout: (v) => (v > 0.65 ? "racing — arms tiring" : v < 0.35 ? "stalled on the ladder" : "steady, three points") },
      holdBreakNote: "The pace left the band — steady it before the next section, a tired grip is how a slip starts.",
    },
    {
      id: "clip-anchor", kind: "select", target: "platform-anchor",
      title: "Clip to the platform anchor",
      cue: "On the platform, clip the lanyard to the platform anchor before unclipping the runner.",
      why: "The change-over from the rail to the platform anchor is the one moment a climber could be connected to nothing, so the new connection goes on before the old one comes off — always one connection made, never none.",
    },
    {
      id: "close-hatch", kind: "turn", target: "platform-hatch",
      title: "Close the platform hatch",
      cue: "Swing the platform hatch closed behind you.",
      why: "An open hatch is a hole in the floor above a ladder somebody else may be climbing, and a dropped tool or a misplaced boot goes straight down it. Closing it turns the platform back into a floor.",
      turn: { turns: 0.4, axis: "x", label: "PLATFORM HATCH" },
    },
    {
      id: "climb-log", kind: "select", target: "climb-log",
      title: "Log the climb",
      cue: "Radio the ground and log the climb: who is up, the kit checked and the wind read.",
      why: "The log tells the ground who is in the tower and on what check, so if the radio goes quiet the rescue starts from a known position and a known kit rather than from guesses about who went up and when.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS1_ACCENT);

    const padTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#6b7075", base2: "#575c61" }), { repeat: 3, px: 256 });
    const apron = box(g, 6.2, 0.06, 4.6, 0, 0.03, 0.2, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(padTex, { rough: 0.8, metal: 0.3, color: WS1_PAL.ground });

    const turb = windTurbine(g, 0, 0, -3.6, { hub: 16, blade: 6.5 });
    const P = turb.userData.parts;
    reg(hits, P.towerDoor, "tower-door");
    reg(hits, P.fallArrestRail, "rail-attach-point");
    const railFault = box(g, 0.08, 0.5, 0.05, 0.05, 2.3, -2.08, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.6 });
    railFault.visible = false;
    const railTag = lockTag(g, 0.35, 1.6, -2.0, { color: 0xd2312b, lines: ["LADDER", "OUT OF", "SERVICE"] });
    reg(hits, railTag, "rail-out-of-service");
    holoTag(g, "fall-arrest rail", 0.4, 2.4, -2.1, { css: WS1_CSS, w: 0.4 });

    const lightSw = box(g, 0.12, 0.18, 0.06, 0.7, 1.3, -2.25, 0x2b3138, { rough: 0.5 });
    holoTag(g, "tower lights", 0.8, 1.55, -2.2, { css: WS1_CSS, w: 0.32 });
    reg(hits, lightSw, "tower-lights");
    const lamp = box(g, 0.3, 0.06, 0.1, 0, 2.5, -2.2, 0x555555, { rough: 0.4 });

    // Permit board, anemometer readout, rescue board.
    const permit = group(g, -2.3, 0, -1.2, 0.5);
    box(permit, 0.6, 1.2, 0.05, 0, 0.6, 0, WS1_PAL.structure, { rough: 0.7 });
    const permitFace = decal(permit, 0.5, 0.38, 0, 1.0, 0.03, paperFace("CLIMB PLAN", ["Turbine per work order", "Climbers and standby named", "Wind limit per site procedure"], { scale: 0.72 }));
    holoTag(permit, "climb plan", 0, 1.34, 0, { css: WS1_CSS, w: 0.3 });
    reg(hits, permitFace, "climb-permit");
    const windInst = instrument(permit, 0, 0.55, 0.05, { idle: "WIND", color: 0x2b2f34, w: 0.18, d: 0.03 });
    holoTag(permit, "met-mast wind", 0.35, 0.55, 0.05, { css: WS1_CSS, w: 0.32 });
    reg(hits, windInst, "wind-readout");

    const rescueBoard = group(g, 2.4, 0, -1.0, -0.5);
    box(rescueBoard, 0.6, 1.1, 0.05, 0, 0.55, 0, WS1_PAL.structure, { rough: 0.7 });
    const rbFace = decal(rescueBoard, 0.5, 0.36, 0, 0.9, 0.03, paperFace("RESCUE PLAN", ["Second climber on site", "Kit location: tower base", "Call-out per site plan"], { scale: 0.72 }));
    holoTag(rescueBoard, "rescue plan", 0, 1.24, 0, { css: WS1_CSS, w: 0.3 });
    reg(hits, rbFace, "rescue-plan-board");

    // Harness rack and rescue kit bench.
    const rackTex = surfaceTexture((ctx, w, h) => blockFace(ctx, w, h), { repeat: 1, px: 256 });
    const bench = box(g, 1.4, 0.7, 0.5, -1.7, 0.35, 1.1, 0xffffff, { rough: 0.8 });
    bench.material = texturedMat(rackTex, { rough: 0.8, color: 0xbab4a6 });
    const harness = group(g, -2.0, 0.7, 1.1);
    const web = box(harness, 0.3, 0.06, 0.2, 0, 0.03, 0, 0xe0592a, { rough: 0.7 });
    reg(hits, web, "harness-webbing");
    const dring = cyl(harness, 0.035, 0.035, 0.02, 0.1, 0.09, 0, 0xb8bec4, { rough: 0.3, metal: 0.8, seg: 10 });
    reg(hits, dring, "harness-dring");
    const buckle = box(harness, 0.06, 0.04, 0.06, -0.1, 0.08, 0, 0x2b3138, { rough: 0.4, metal: 0.6 });
    reg(hits, buckle, "harness-buckles");
    holoTag(harness, "harness", 0, 0.3, 0, { css: WS1_CSS, w: 0.26 });

    const kit = group(g, -1.3, 0.7, 1.1);
    box(kit, 0.4, 0.3, 0.3, 0, 0.15, 0, 0xd2312b, { rough: 0.7 });
    const seal = box(kit, 0.06, 0.04, 0.02, 0.1, 0.25, 0.16, 0xf2c14b, { rough: 0.5 });
    reg(hits, seal, "kit-seal-broken");
    const kitTag = decal(kit, 0.14, 0.1, -0.1, 0.18, 0.16, signFace("TAG —", { bg: "#f7f3e6", accent: "#d2312b", fg: "#222", scale: 0.4 }));
    reg(hits, kitTag, "kit-tag-unsigned");
    holoTag(kit, "rescue kit", 0, 0.44, 0, { css: WS1_CSS, w: 0.28 });

    const runner = group(g, -0.8, 0.72, 1.3);
    box(runner, 0.1, 0.16, 0.08, 0, 0.08, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    holoTag(runner, "rail runner", 0, 0.3, 0, { css: WS1_CSS, w: 0.28 });
    reg(hits, runner, "fall-arrest-runner");
    const tugHandle = box(g, 0.12, 0.1, 0.1, -0.15, 1.2, -2.0, 0x2b3138, { rough: 0.4, metal: 0.5 });
    holoTag(g, "tug test", -0.5, 1.35, -2.0, { css: WS1_CSS, w: 0.26 });
    reg(hits, tugHandle, "runner-test-handle");

    // The climb, the rest platform and the top: meters and a mock platform.
    const paceInst = instrument(g, 1.3, 1.2, -1.7, { idle: "PACE", color: 0x2b2f34, w: 0.18, d: 0.03 });
    holoTag(g, "climb pace", 1.3, 1.45, -1.7, { css: WS1_CSS, w: 0.28 });
    reg(hits, paceInst, "climb-pace-meter");
    const platform = group(g, 1.9, 0, 0.9, -0.4);
    const plTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#8b949b", base2: "#6f777e" }), { repeat: 2, px: 200 });
    const deck = box(platform, 1.2, 0.06, 1.0, 0, 0.6, 0, 0xffffff, { rough: 0.7 });
    deck.material = texturedMat(plTex, { rough: 0.7, metal: 0.4 });
    for (const sx of [-0.55, 0.55]) box(platform, 0.05, 0.6, 0.05, sx, 0.3, 0.45, 0x5a6168, { rough: 0.6 });
    const anchor = cyl(platform, 0.05, 0.05, 0.1, 0.4, 0.7, -0.4, 0xf2c14b, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(platform, "platform anchor", 0.4, 0.95, -0.4, { css: WS1_CSS, w: 0.34 });
    reg(hits, anchor, "platform-anchor");
    const restAnchor = cyl(platform, 0.04, 0.04, 0.1, -0.4, 0.7, -0.4, 0x59c97b, { rough: 0.4, metal: 0.5, seg: 10 });
    holoTag(platform, "rest-platform anchor", -0.4, 0.95, -0.4, { css: "#59c97b", w: 0.4 });
    reg(hits, restAnchor, "rest-platform-anchor");
    const hatch = group(platform, 0, 0.64, 0.2);
    const hatchLid = box(hatch, 0.5, 0.03, 0.5, 0, 0, -0.25, 0xc9ced2, { rough: 0.5, metal: 0.3 });
    hatch.rotation.x = -1.2;
    holoTag(platform, "platform hatch", 0, 1.2, 0.2, { css: WS1_CSS, w: 0.32 });
    reg(hits, hatchLid, "platform-hatch");

    const radioObj = radio(g, 2.2, 0.72, 1.8);
    holoTag(g, "climb radio", 2.2, 1.0, 1.8, { css: WS1_CSS, w: 0.28 });
    reg(hits, radioObj, "climb-radio");
    const logBoard = decal(g, 0.36, 0.26, 2.4, 1.0, -0.6, paperFace("CLIMB LOG", ["Climbers up ___", "Kit checked ___", "Wind read ___"], { scale: 0.7 }), { ry: -0.5 });
    holoTag(g, "climb log", 2.5, 1.25, -0.5, { css: WS1_CSS, w: 0.26 });
    reg(hits, logBoard, "climb-log");

    // Hazard decoys.
    const freeClimb = box(g, 0.25, 0.25, 0.25, -0.5, 0.9, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "just start up the ladder?", -0.8, 0.8, -1.9, { css: "#d2312b", w: 0.46 });
    reg(hits, freeClimb, "free-climb-no-runner");
    const oldKit = box(g, 0.25, 0.25, 0.25, -2.6, 0.4, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "take the kit as it is?", -2.6, 0.75, 0.4, { css: "#d2312b", w: 0.42 });
    reg(hits, oldKit, "expired-rescue-kit");
    const alone = box(g, 0.25, 0.25, 0.25, 2.8, 0.5, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb solo today?", 2.8, 0.8, 0.2, { css: "#d2312b", w: 0.36 });
    reg(hits, alone, "climb-alone");
    const openHatch = box(g, 0.25, 0.25, 0.25, 1.2, 0.8, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "leave the hatch open?", 1.2, 1.1, 1.6, { css: "#d2312b", w: 0.42 });
    reg(hits, openHatch, "hatch-left-open");

    const sock = group(g, -2.9, 0, -2.2);
    cyl(sock, 0.03, 0.03, 2.4, 0, 1.2, 0, 0xb8c1c9, { rough: 0.5, metal: 0.5, seg: 8 });
    const cone = cyl(sock, 0.12, 0.05, 0.6, 0.3, 2.35, 0, 0xf07a1f, { rough: 0.7, seg: 10 });
    cone.rotation.z = Math.PI / 2 + 0.6;
    toolChest(g, -2.8, 1.9);
    standingFigure(g, 3.0, 1.9, { ry: -2.4, cloth: 0x2b4f7f, vest: 0xf2c14b });

    holoPanel(g, 1.0, 0.6, -0.9, 0, 2.1, (ctx, w, h) => {
      ctx.fillStyle = "#06141c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS1_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f6ff";
      ctx.fillText("CLIMB — PROVEN ON THE GROUND", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Wind against the site limit", "Harness walked, kit opened", "Second climber confirmed", "Runner tugged before rung one"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: 0.3, accent: WS1_ACCENT });

    let gust = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.6),
      onStep() {},
      onFault(id) {
        if (id === "fall-arrest-rail-damage") { railFault.visible = true; railTag.position.y = 1.9; }
      },
      onStepComplete(step) {
        if (step.id === "wind-check") repaint(windInst.userData.screen, signFace("GO", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "rescue-kit") seal.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "open-tower") { P.towerDoor.rotation.y = -1.2; lamp.material = mat(0xfff2cc, { emissive: 0xfff2cc, ei: 1.2 }); }
        if (step.id === "attach-runner") runner.position.set(0.05, 1.3, -2.05);
        if (step.id === "close-hatch") hatch.rotation.x = 0;
      },
      onInterrupt(it) {
        if (it.id === "ground-lead-radio") radioObj.traverse((o) => { if (o.isMesh) o.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.5 }); });
        if (it.id === "gust-front") { gust = true; cone.rotation.z = Math.PI / 2; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "ground-lead-radio") radioObj.traverse((o) => { if (o.isMesh) o.material = mat(0x1b1e23, { rough: 0.5 }); });
        if (it.id === "gust-front") { gust = false; cone.rotation.z = Math.PI / 2 + 0.6; }
      },
      onHazard() {},
      animate(t, dt, session) {
        sock.rotation.y = Math.sin(t * (gust ? 2.4 : 0.5)) * (gust ? 0.5 : 0.25);
        if (session?.turn && session.step?.id === "close-hatch") hatch.rotation.x = -1.2 + session.turn.amount * 1.2;
      },
    };
  },
};
