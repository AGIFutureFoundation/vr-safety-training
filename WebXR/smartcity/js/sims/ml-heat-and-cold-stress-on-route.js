import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, decal, repaint, signFace, mat, slab,
} from "../../../shared/kit.js";
import { deliveryVan } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { palette } from "../../../shared/textures.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Heat & Cold Stress on Route VR — Mobility & Transit, NALC
// letter carrier route work. One shift, both ends of the temperature swing
// a route can run: a pre-dawn cold start — frost read on the porch steps,
// a frozen mail slot worked open rather than forced, the two-person cold
// watch checked in — and a midday heat stretch — the day's own advisory
// read, a hydration refill worked into the loop, the van's cab vented
// before ever getting back in, a mandatory shade break actually held, the
// pace kept rather than rushed, and a second buddy check for heat illness
// signs. No temperature, wind-chill number or heat-index value this
// platform is not certain of is stated: everything runs "per the day's
// bulletin" and "per the plan," never a number.

const ML3_PAL = palette("postal");
const ML3_ACCENT = ML3_PAL.accent;

export const SIM_ML_HEAT_AND_COLD_STRESS_ON_ROUTE = {
  id: "ml-heat-and-cold-stress-on-route",
  index: "ml-3",
  domain: "Postal & Mail Processing",
  trade: "City letter carrier — heat and cold stress on the walking route, NALC",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "NIOSH guidance on heat stress and cold stress for outdoor workers; OSHA 29 CFR 1910.132 personal protective equipment, general requirements; OSHA 29 CFR 1910.38 emergency action plans, for a heat-illness or cold-stress response; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, as the model for a written cold-and-heat plan; NALC training for city letter carrier route safety",
  name: "Heat & Cold Stress on Route",
  title: simTitle("Heat & Cold Stress on Route"),
  tagline: "One shift, both extremes: a pre-dawn cold start with frost read on the steps and a frozen mail slot worked open rather than forced, and a midday heat stretch with the day's bulletin read, a hydration refill, the van's cab vented before re-entry, a held shade break, a kept pace and a second buddy check for heat illness signs",
  accent: ML3_ACCENT,
  accentCss: `#${ML3_ACCENT.toString(16).padStart(6, "0")}`,
  parSeconds: 320,
  footprint: 2.8,
  badge: { id: "all-weather-route", name: "All-Weather Route", note: "Both the cold start and the heat stretch worked to the plan, the shade break actually held, and a coworker's heat-illness call answered without a single unsafe move" },

  game: system({
    name: "Route Conditioning",
    currency: "CONDITION",
    ranks: ["Casual Carrier", "Route Trainee", "Letter Carrier", "Lead Carrier", "All-Weather Certified"],
    badges: [
      { id: "cold-start-clean", name: "Cold Start Clean", note: "Both cold-start hazards found without a hint", test: AWARD.stepClean("cold-hazard-read") },
      { id: "held-the-break", name: "Held the Break", note: "The shade break held its full time, first try", test: AWARD.stepClean("shade-break-hold") },
      { id: "steady-pace", name: "Steady Pace", note: "Pace held in the moderate band the whole hot stretch", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "on-time", name: "On Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "safe-route", name: "Safe Route", note: "No unsafe action anywhere in the run", test: AWARD.safe },
    ],
  }),

  supportLine: "your NALC branch's member assistance representative, or the station's own employee assistance line",

  hazards: {
    "icy-steps-hazard": "Frost has skinned over the porch steps at the pre-dawn stop, invisible in the low light until a boot is already on it. A carrier who reads the steps before committing weight to them catches this; one who climbs on habit alone finds out about the ice the same way every year's first fall does.",
    "frozen-slot-hazard": "The mail slot flap is frozen shut against its frame. Forcing it open with a shove is how a stiff hinge lets go all at once and a hand ends up in the gap it was just fighting — a frozen flap gets worked gently, or reported, never forced.",
    "direct-sun-bench-hazard": "The usual break bench sits in full sun with no shade anywhere near it at midday. A rest break taken here does almost nothing to actually cool a carrier down — the shaded spot forty feet away is the one the break is supposed to happen at.",
    "hot-cab-hazard": "The van's windows have been left fully shut through the whole hot stretch, and the cab behind that glass has been baking since the last stop. Climbing straight back in and pulling away is stepping into trapped heat that a few seconds of venting would have let out first.",
  },

  lateNotes: {
    "frozen-mail-slot-flap": "The flap is worked open gently once it's been read as frozen, never forced straight away.",
    "van-cab-vent": "The cab is vented before getting back in, not after the van is already rolling with the windows still shut.",
  },

  interrupts: [
    {
      id: "black-ice-patch",
      kind: "Black ice spotted ahead",
      after: "slot-thaw", delay: 3, seconds: 11,
      alert: "A patch of black ice is visible on the next stretch of walk, barely different in colour from the dry pavement around it.",
      cue: "Flag the patch before walking through it rather than trusting the same stride that just worked on dry pavement.",
      target: "ice-warning-flag",
      why: "Black ice is dangerous specifically because it does not look different from safe pavement until weight is already on it, and flagging it now is what turns a hidden hazard into a marked one for whoever crosses this stretch next, carrier or otherwise.",
      missNote: "The ice patch was walked through unmarked. Black ice punishes exactly the confident, normal-paced stride a dry sidewalk earns, and it gives no warning before it does.",
      wrongNote: "Not that — the ice patch ahead gets flagged before it gets walked on.",
    },
    {
      id: "coworker-heat-call",
      kind: "Coworker radios in feeling dizzy",
      after: "shade-break-hold", delay: 3, seconds: 13,
      alert: "A coworker elsewhere on the route radios in that they feel dizzy and nauseated in the heat and are not sure they can keep walking their loop.",
      cue: "Answer the radio immediately and start the plan's heat-illness response rather than finishing your own break first.",
      target: "heat-illness-radio",
      why: "Early heat illness looks like it can wait a few minutes and often cannot — the plan's response exists because the gap between 'feeling off' and a genuine heat emergency can close fast, and a coworker who has already radioed it in has already decided they need help now.",
      missNote: "The call was left for later. A carrier who is dizzy and nauseated in the heat and radios it in is already past being fine on their own — every minute that response is delayed is a minute the heat keeps working on them.",
      wrongNote: "Not that — the coworker's call comes before anything else on this break.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["layered-jacket", "water-bottle"],
      itemNames: { "layered-jacket": "layered jacket", "water-bottle": "water bottle" },
      title: "Pack for both ends of the swing",
      cue: "Layered jacket for the cold start and a full water bottle for the heat stretch — both before the first stop.",
      why: "A route that swings from a pre-dawn frost to a midday heat stretch is dressed for at the start of the shift, not partway through it — a jacket that comes off in layers as the day warms and a bottle that starts full both do their whole job only if they were there from the first stop.",
    },
    {
      id: "weather-bulletin", kind: "select", target: "weather-bulletin-board",
      title: "Read the day's bulletin",
      cue: "Read today's bulletin: a cold start, a warm afternoon, and the plan for each.",
      why: "The bulletin is what turns 'it might get cold, then hot' into an actual plan for this specific shift — reading it before the first stop is what makes the cold-start habits and the heat-stretch habits both deliberate instead of improvised as the temperature happens to change.",
    },
    {
      id: "cold-hazard-read", kind: "find", noHint: true,
      targets: ["icy-steps-hazard", "frozen-slot-hazard"],
      itemNames: { "icy-steps-hazard": "the frosted porch steps", "frozen-slot-hazard": "the frozen mail slot" },
      itemNotes: {
        "icy-steps-hazard": "Frost skinned over in the low light. Test each step's footing before committing your weight to it.",
        "frozen-slot-hazard": "Frozen shut against the frame. It gets worked gently, never forced.",
      },
      decoyNotes: { "salted-steps-decoy": "Those steps have already been salted and are clear underfoot. Nothing to flag there." },
      title: "Read the pre-dawn stop before climbing it",
      cue: "Read the porch before climbing it in the low light. Two things are already wrong with it — find them.",
      why: "Frost and a frozen slot both look like ordinary parts of a porch until they are tested — a carrier who reads the steps and the slot before touching either one catches both while they are still just things to be careful with, not things already gone wrong.",
    },
    {
      id: "slot-thaw", kind: "turn", target: "frozen-mail-slot-flap",
      title: "Work the frozen flap open gently",
      cue: "Turn the flap slowly rather than forcing it, letting the frozen seal give a little at a time.",
      why: "A frozen hinge forced all at once tends to let go all at once too, right as a hand is still on it — working it open gradually is what keeps the flap's own stiffness from turning into a sudden, uncontrolled snap.",
      turn: { turns: 0.35, axis: "x", label: "SLOT FLAP" },
    },
    {
      id: "buddy-checkin-cold", kind: "select", target: "cold-watch-radio",
      title: "Check in on the cold watch",
      cue: "Radio the two-person cold-stress check-in for the pre-dawn stretch.",
      why: "Cold stress signs — fumbling hands, slurred speech, a carrier who has stopped shivering — are often easier for somebody else to notice than to notice in yourself, which is the entire reason the plan runs the cold watch as a pair rather than trusting each carrier to self-report.",
    },
    {
      id: "hydration-load", kind: "drag", target: "water-jug",
      title: "Refill at the midday changeover",
      cue: "Carry the water jug from the cooler to your bottle and top it off before the heat stretch starts.",
      why: "A bottle that started full at dawn is not still full by midday, and refilling before the hot stretch — rather than partway through it once thirst has already set in — is what keeps hydration ahead of the heat instead of chasing it.",
      drag: { to: "bottle-refill-socket", radius: 0.45, missNote: "Not at the bottle — carry the jug all the way to the refill point before pouring." },
    },
    {
      id: "heat-hazard-read", kind: "find", noHint: true,
      targets: ["direct-sun-bench-hazard", "hot-cab-hazard"],
      itemNames: { "direct-sun-bench-hazard": "the break bench in full sun", "hot-cab-hazard": "the van's shut, superheated cab" },
      itemNotes: {
        "direct-sun-bench-hazard": "No shade anywhere near it. A break here barely cools anyone down — use the shaded spot instead.",
        "hot-cab-hazard": "Windows shut the whole hot stretch. The cab gets vented before anyone climbs back in.",
      },
      decoyNotes: { "shaded-bench-decoy": "That bench sits under full tree cover. Nothing to flag there." },
      title: "Read the midday stop before the break",
      cue: "Look over the midday stop before taking the break. Two things are already wrong with it — find them.",
      why: "A break spot and a parked van both look fine from a glance, and both can be quietly working against a carrier already running warm — the sun-baked bench that does not actually cool anyone down, and the shut cab that has been storing heat since the last stop.",
    },
    {
      id: "heat-index-gauge", kind: "gauge", target: "heat-index-meter",
      title: "Read the posted heat advisory",
      cue: "Read the heat advisory meter and commit once you've acknowledged today's band.",
      why: "The meter is the day's actual heat advisory in one glance, not a guess based on how the air feels — acknowledging it before the break is what turns the shade break and the pace that follow into a response to today's real conditions rather than a routine run on autopilot.",
      gauge: { label: "HEAT ADVISORY", speed: 0.55, green: [0.3, 0.75], readout: (t) => (t < 0.3 ? "low" : t > 0.75 ? "extreme — see the plan" : "moderate to high — per the plan"), missNote: "Not acknowledged — read the advisory band before moving on." },
    },
    {
      id: "vent-cab", kind: "turn", target: "van-cab-vent",
      title: "Vent the cab before getting back in",
      cue: "Turn the vent crank to open the windows and let the trapped heat out before climbing back into the van.",
      why: "A cab that has been sealed shut in the sun is significantly hotter than the air outside it, and a few seconds of venting before getting back in is what keeps the first minute back in the van from being spent breathing trapped, superheated air.",
      turn: { turns: 0.4, axis: "y", label: "CAB VENT" },
    },
    {
      id: "shade-break-hold", kind: "hold", target: "shaded-bench-decoy", seconds: 10,
      title: "Hold the shade break",
      cue: "Sit at the shaded bench and hold the full break — no rushing back out early.",
      why: "A shade break cut short to get back on schedule defeats the entire reason it is mandatory in the plan — the body needs the whole break to actually cool down, and a carrier who cuts it to five minutes because the route feels behind is trading a real recovery for a false sense of being on time.",
      holdBreakNote: "The break ended early. The full time in the shade is what the break is actually for — cutting it short is the same as skipping it.",
    },
    {
      id: "pace-track", kind: "track", target: "route-pace-marker", seconds: 8,
      title: "Keep the pace through the hot stretch",
      cue: "Walk the hot stretch keeping your pace indicator inside the moderate band.",
      why: "Rushing to make up time in the heat is exactly backwards — a body working harder in high heat produces more of its own heat on top of what the day is already adding, and the moderate pace is what keeps a carrier from turning a hot stretch into a self-inflicted one.",
      track: {
        start: 0.5, green: [0.35, 0.65], rise: 0.4, fall: 0.4, drift: 0.12,
        label: "PACE",
        readout: (v) => (v < 0.35 ? "dawdling" : v > 0.65 ? "pushing too hard in the heat" : "moderate pace"),
      },
      holdBreakNote: "Pace drifted out of the moderate band. In heat, the safe pace is the one that does not add to the day's own heat load.",
    },
    {
      id: "buddy-checkin-heat", kind: "select", target: "heat-watch-radio",
      title: "Check in on the heat watch",
      cue: "Radio the second buddy check-in for the hot stretch, watching for dizziness or confusion.",
      why: "Heat illness signs escalate quietly, and a coworker is often the one who notices confusion or stumbling before the carrier experiencing it does — the second check-in exists because the hot stretch is exactly when that early notice matters most.",
    },
    {
      id: "daily-log", kind: "select", target: "conditioning-log-panel",
      title: "Log both ends of the shift",
      cue: "Log the cold-start hazards, the heat-stretch hazards, and both check-ins before closing out.",
      why: "A shift that swings between two extremes and gets logged as an ordinary day tells the next carrier nothing useful about either end of it — logging both halves is what keeps the route's own record honest about what the day actually asked of whoever worked it.",
    },
    {
      id: "route-checkin", kind: "select", target: "dispatch-radio-final",
      title: "Check in with dispatch",
      cue: "Tell dispatch the route is complete and both the cold-start and heat-stretch plans were followed.",
      why: "Dispatch is tracking the whole route against the day's bulletin, and a clean check-in is what confirms the plan actually held up in practice — not just that it was read at the start of the shift.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.8, ML3_ACCENT);

    // ------------------------------------------------------------ sidewalk
    const walkTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#9aa1a6", base2: "#8c9297", seam: "rgba(0,0,0,0.3)" }), { repeat: 8, px: 512 });
    const sidewalk = box(g, 1.6, 0.1, 9.4, -0.6, 0.05, -1.0, 0xffffff, { rough: 0.9 });
    sidewalk.material = texturedMat(walkTex, { rough: 0.9, metal: 0.02, color: 0xa9adb2 });

    // ------------------------------------------------------------ the pre-dawn cold stop
    const porch = box(g, 1.6, 0.14, 1.0, -0.6, 0.07, -3.6, 0xb9beba, { rough: 0.8, finish: "concrete" });
    void porch;
    const frostDecal = decal(g, 1.3, 0.7, -0.6, 0.15, -3.6, signFace("frost", { bg: "rgba(210,230,240,0.55)", accent: "transparent", scale: 0.1 }), { px: 128 });
    frostDecal.rotation.x = -Math.PI / 2;
    reg2(frostDecal, "icy-steps-hazard");
    const saltedDecoy = box(g, 1.0, 0.02, 0.5, -0.6, 0.15, -4.6, 0xd8d9d4, { rough: 0.6, cast: false });
    reg2(saltedDecoy, "salted-steps-decoy");

    const doorFrame = group(g, -0.6, 0, -4.2, 0);
    box(doorFrame, 0.9, 2.0, 0.06, 0, 1.0, 0, 0x5c4b39, { rough: 0.7 });
    const slotFlap = group(doorFrame, 0, 1.0, 0.04);
    box(slotFlap, 0.3, 0.08, 0.02, 0, 0, 0, 0x9ab0c2, { rough: 0.5, metal: 0.4 });
    reg2(slotFlap, "frozen-slot-hazard");
    // A second, invisible marker on the same flap for the later turn step —
    // reg() twice on one object would overwrite the first hitId.
    const slotFlapTurnTarget = group(doorFrame, 0, 1.0, 0.05);
    reg2(slotFlapTurnTarget, "frozen-mail-slot-flap");
    holoTag(doorFrame, "frozen mail slot", 0, 1.5, 0, { css: "#2f6fb0", w: 0.32 });

    const coldRadio = group(g, -2.2, 0, -3.8, 0.4);
    box(coldRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(coldRadio, "cold watch check-in", 0, 1.35, 0, { css: "#2f6fb0", w: 0.4 });
    reg2(coldRadio, "cold-watch-radio");

    const icePatch = decal(g, 1.0, 0.9, -0.4, 0.14, -1.6, signFace("", { bg: "rgba(190,220,235,0.5)", accent: "transparent", scale: 0.1 }), { px: 64 });
    icePatch.rotation.x = -Math.PI / 2;
    icePatch.visible = false;
    const iceFlag = group(g, 0.3, 0, -1.6, 0.3);
    box(iceFlag, 0.03, 0.5, 0.03, 0, 0.25, 0, 0xf2a23b, { rough: 0.6 });
    box(iceFlag, 0.16, 0.1, 0.01, 0.08, 0.46, 0, 0xf2a23b, { rough: 0.5 });
    reg2(iceFlag, "ice-warning-flag");

    // ------------------------------------------------------------ the midday heat stop
    const sunBench = group(g, 1.6, 0, 1.4, -0.4);
    box(sunBench, 1.0, 0.06, 0.4, 0, 0.45, 0, 0x8a7550, { rough: 0.8 });
    for (const dx of [-0.4, 0.4]) box(sunBench, 0.06, 0.45, 0.35, dx, 0.22, 0, 0x5c4b39, { rough: 0.8 });
    reg2(sunBench, "direct-sun-bench-hazard");

    const shadeTree = group(g, 3.4, 0, 1.0, 0);
    cyl(shadeTree, 0.16, 0.2, 2.0, 0, 1.0, 0, 0x5c4b39, { rough: 0.9, seg: 10 });
    const canopy = cyl(shadeTree, 1.3, 1.3, 0.1, 0, 2.2, 0, 0x3c6b2f, { rough: 0.95, seg: 12 });
    canopy.scale.y = 3;
    const shadedBench = group(g, 3.4, 0, 1.0, -0.4);
    box(shadedBench, 1.0, 0.06, 0.4, 0, 0.45, 0, 0x8a7550, { rough: 0.8 });
    for (const dx of [-0.4, 0.4]) box(shadedBench, 0.06, 0.45, 0.35, dx, 0.22, 0, 0x5c4b39, { rough: 0.8 });
    reg2(shadedBench, "shaded-bench-decoy");

    const coworker = standingFigure(g, 4.1, 1.1, { ry: 0, cloth: 0x2b3138, vest: ML3_PAL.trim, lying: true });
    coworker.rotation.z = Math.PI / 2;
    coworker.visible = false;
    const heatRadio = group(g, 2.4, 0, 1.1, 0.3);
    box(heatRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(heatRadio, "coworker call", 0, 1.35, 0, { css: "#d8232a", w: 0.32 });
    reg2(heatRadio, "heat-illness-radio");
    const heatWatchRadio = group(g, 4.6, 0, 0.6, -0.4);
    box(heatWatchRadio, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(heatWatchRadio, "heat watch check-in", 0, 1.35, 0, { css: "#2f6fb0", w: 0.4 });
    reg2(heatWatchRadio, "heat-watch-radio");

    const van = deliveryVan(g, -0.4, 0.12, 3.6, { ry: Math.PI, livery: { colour: 0xe4e0d4, fleetName: "CITY MAIL", unitNumber: "118", accent: ML3_PAL.trim } });
    const VP = van.userData.parts;
    reg2(van, "hot-cab-hazard");
    const ventCrank = group(van, 0.4, 1.4, -1.4);
    cyl(ventCrank, 0.02, 0.02, 0.1, 0, 0, 0, 0x8a8f95, { rough: 0.5, metal: 0.5, seg: 8 });
    reg2(ventCrank, "van-cab-vent");
    void VP;

    const cooler = group(g, -1.8, 0, 2.3, 0.3);
    box(cooler, 0.4, 0.3, 0.3, 0, 0.18, 0, 0x3f6f9a, { rough: 0.6 });
    holoTag(cooler, "water cooler", 0, 0.45, 0, { css: "#2f6fb0", w: 0.28 });
    const waterJug = box(cooler, 0.16, 0.24, 0.14, 0, 0.4, 0, 0xcfe6f2, { rough: 0.3, transparent: true, opacity: 0.7 });
    reg2(waterJug, "water-jug");
    const bottleSocket = group(g, -0.3, 0.3, 2.3);
    hits["bottle-refill-socket"] = bottleSocket;

    const heatMeter = instrument(g, 2.6, 1.4, 0.0, { idle: "--", color: ML3_ACCENT, w: 0.16, d: 0.14 });
    holoTag(heatMeter, "heat advisory", 0, 0.25, 0, { css: "#2f6fb0", w: 0.34 });
    reg2(heatMeter, "heat-index-meter");

    const paceMark = group(g, -0.6, 0, 3.4);
    hits["route-pace-marker"] = paceMark;

    // ------------------------------------------------------------ PPE, boards, radios
    const ppeRack = group(g, -3.2, 0, 1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const jacketProp = box(ppeRack, 0.22, 0.3, 0.06, 0, 0.55, 0, ML3_ACCENT, { rough: 0.85 });
    holoTag(jacketProp, "layered jacket", 0, 0.25, 0, { css: "#2f6fb0", w: 0.32 });
    reg2(jacketProp, "layered-jacket");
    const bottleProp = group(ppeRack, 0.2, 0.6, 0);
    cyl(bottleProp, 0.03, 0.03, 0.16, 0, 0, 0, 0x59c97b, { rough: 0.5, seg: 10 });
    holoTag(bottleProp, "water bottle", 0, 0.16, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(bottleProp, "water-bottle");

    const bulletinBoard = holoPanel(g, 0.6, 0.4, -2.6, 1.5, -1.6, (ctx, w, h) => {
      ctx.fillStyle = "#0c141c"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f6fb0"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcecfa"; ctx.fillText("TODAY'S BULLETIN", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f0f7fd";
      ["Cold start · warm afternoon", "Follow the plan for each"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: 0.4, accent: ML3_ACCENT });
    reg2(bulletinBoard, "weather-bulletin-board");

    const logPanel = holoPanel(g, 0.46, 0.3, 4.4, 1.5, 2.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8232a"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("SHIFT LOG", w / 2, h * 0.36);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Cold start · heat stretch", w / 2, h * 0.68);
    }, { ry: -0.5, accent: 0xd8232a });
    reg2(logPanel, "conditioning-log-panel");
    const logFace = logPanel.userData.face;

    const dispatchFinal = group(g, 4.6, 0, 3.0, -0.4);
    box(dispatchFinal, 0.1, 0.16, 0.05, 0, 1.1, 0, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(dispatchFinal, "dispatch radio", 0, 1.35, 0, { css: "#2f6fb0", w: 0.3 });
    reg2(dispatchFinal, "dispatch-radio-final");

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -2.5),

      onStepComplete(step) {
        if (step.id === "cold-hazard-read") { frostDecal.visible = false; }
        if (step.id === "slot-thaw") { slotFlap.rotation.x = -0.6; }
        if (step.id === "vent-cab") { ventCrank.rotation.y = -1.1; }
        if (step.id === "daily-log") {
          repaint(logFace, signFace("SHIFT LOGGED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.36 }));
        }
      },

      onInterrupt(it) {
        if (it.id === "black-ice-patch") { icePatch.visible = true; }
        if (it.id === "coworker-heat-call") { coworker.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "black-ice-patch") { icePatch.visible = false; }
        if (it.id === "coworker-heat-call") { coworker.visible = false; }
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session?.step?.id === "heat-index-gauge") {
          repaint(heatMeter.userData.screen, signFace(gg.t < 0.3 ? "LOW" : gg.t > 0.75 ? "EXTREME" : "MOD-HIGH", { bg: "#07121c", accent: gg.t >= 0.3 && gg.t <= 0.75 ? "#f2ae14" : "#d2312b", fg: "#f0f7fd", scale: 0.4 }));
        }
        void t; void dt;
      },
    };
  },
};
