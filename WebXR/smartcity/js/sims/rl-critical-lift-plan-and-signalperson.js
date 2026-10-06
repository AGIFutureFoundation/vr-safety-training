import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, roadwayFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";
import { mobileCrane } from "../../../shared/equipment.js";

// SmartCiti.X~ Critical Lift Plan & Signalperson VR — Construction &
// Structural Trades, the rigging and lifting block.
//
// A crane pad with a rigging bench, a load staged for pick, an exclusion
// zone marked around the crane's swing radius, and a landing point across
// the pad. The learner is the IUOE mobile crane operator running a critical
// lift with a certified signalperson and the ironworkers rigging crew. The
// site is generic.

const RLC_ACCENT = 0xa079ff;
const RLC_CSS = "#a079ff";

export const SIM_RL_CRITICAL_LIFT_PLAN_AND_SIGNALPERSON = {
  id: "rl-critical-lift-plan-and-signalperson",
  index: "349",
  domain: "Construction",
  trade: "IUOE mobile crane operator running a critical lift with a certified signalperson and an ironworkers rigging crew",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "ASME B30.5 mobile and locomotive cranes, ASME B30.9 slings, ASME B30.26 rigging hardware, NCCCO signalperson certification for the hand and radio signals this lift runs on, and OSHA 29 CFR 1926.1425 keeping clear of the load",
  name: "Critical Lift Plan & Signalperson",
  title: simTitle("Critical Lift Plan & Signalperson VR"),
  tagline: "The pad before the pick: the critical lift plan read for its chart percentage and exclusion zone, hi-vis and a hard hat on, a cracked shackle found in the rigging set before it is used, the load chart read against the plan's own limit, the outriggers set, the signalperson briefed on the channel and the signals, the sling and shackle rigged in order, the slack taken up slow, the lift held for the signalperson's own word before the boom moves, the load watched plumb the whole pick, the exclusion zone cleared, the load landed on its mark, the crew checked in, and the lift logged",
  accent: RLC_ACCENT,
  accentCss: RLC_CSS,
  parSeconds: 340,
  footprint: 3.0,
  badge: { id: "lift-plan-certified", name: "Lift Plan Certified", note: "The chart never pushed past the plan's limit, the load held plumb the whole pick, and the exclusion zone never crossed while the boom was loaded" },

  supportLine: "your IUOE local's member assistance programme",

  game: system({
    name: "Critical Lift",
    currency: "TAG",
    ranks: ["Rigging Hand", "Signal Crew", "Lift Lead", "Signalperson Certified", "Crane Operator Certified"],
    badges: [
      { id: "rigging-checked-clean", name: "Rigging Checked Clean", note: "The cracked shackle found and set aside before it reached the load", test: AWARD.stepClean("inspect-rigging") },
      { id: "plumb-held", name: "Plumb Held", note: "The load stayed plumb the whole pick, no correction", test: AWARD.unbroken },
      { id: "never-a-shortcut", name: "Never a Shortcut", note: "Never a damaged shackle used, never the chart pushed past the plan, never a signal taken from anyone but the signalperson", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lift", name: "Clean Lift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "chart-on-the-plan", name: "Chart On The Plan", note: "Load chart gauge committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "lift-logged-fast", name: "Lift Logged Fast", note: "Lift log closed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "use-damaged-shackle": "You pulled the cracked shackle from the rigging set instead of a good one. ASME B30.26 rates rigging hardware to a working load limit that assumes sound metal all the way through — a shackle with a visible crack has already started failing, and it is the one piece of this rig that sits directly between the load and the crane's own hook.",
    "force-lift-over-chart": "You started the pick with the load chart reading over the plan's own limit. A critical lift plan sets its chart percentage below the crane's full rated capacity specifically so there is margin left for a gust, a misjudged radius or a load that weighs slightly more than paper said — pushing past that limit spends the margin the whole plan was built on before the load has even left the ground.",
    "walk-through-exclusion-zone": "You walked into the marked exclusion zone while the crane still had a load on the hook. The zone is drawn at the crane's own swing radius for exactly this reason — anyone inside it is standing where a load would land if a rigging point ever let go, and the zone only protects someone who actually stays outside it.",
    "accept-signal-from-unauthorized-person": "You moved the boom on a hand signal from someone other than the certified signalperson. A critical lift runs on one voice for a reason — a second person waving from the ground, however well-meaning, has not seen what the signalperson has seen, and taking direction from them is how a boom moves on information nobody actually verified.",
  },

  lateNotes: {
    "shackle-pin": "The sling has to be attached to the load before the shackle pin is set — not before.",
    "boom-hoist-control": "Nothing to take up yet — the load has to be rigged before the slack comes out of the line.",
    "load-on-hook": "Nothing to land yet — the load has to actually clear the exclusion zone before it is set down.",
  },

  steps: [
    {
      id: "read-lift-plan", kind: "select", target: "lift-plan",
      title: "Read the critical lift plan",
      cue: "Read the plan: the load weight, the working radius, the chart percentage limit, and the exclusion zone this pick is marked to.",
      why: "A critical lift plan sets the numbers this whole pick has to stay inside — the radius the chart was calculated at, the percentage of capacity the plan allows, and where the exclusion zone actually sits — and reading it before the crane is even positioned is what keeps the operator, the rigger and the signalperson working from the same numbers instead of three different guesses.",
    },
    {
      id: "don-ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Hi-vis vest and hard hat on before rigging the load",
      cue: "Hi-vis vest and hard hat on before stepping into the rigging area under the boom.",
      why: "Everyone working this pad is working under a boom that will be carrying a load over their heads for part of the lift, and the hi-vis vest is what keeps the operator and signalperson able to actually see where the rigging crew is at every point in the pick.",
    },
    {
      id: "inspect-rigging", kind: "find", noHint: true,
      targets: ["cracked-shackle"],
      itemNames: { "cracked-shackle": "cracked shackle in the rigging set" },
      itemNotes: { "cracked-shackle": "One shackle in the rigging set has a hairline crack at the pin hole — easy to miss under the pad's own lighting, and set aside before it is ever pinned to a load." },
      title: "Check the rigging set before it goes on the load",
      cue: "Check every sling, shackle and hook in the rigging set for a crack, a bend, or a worn pin before rigging the load.",
      why: "A rigging set that looks fine laid out on the bench is not the same as a rigging set proven sound, and checking it now — before any of it is under load — is the only point in this lift where a cracked shackle costs nothing but a look to catch.",
    },
    {
      id: "verify-load-chart", kind: "gauge", target: "load-chart",
      title: "Check the load chart against the plan's limit",
      cue: "Read the crane's load chart at today's radius and commit the reading once it settles inside the plan's own band.",
      why: "The chart tells you what the crane can lift at this specific radius, not what it can lift in general, and reading it now — at the radius this pick will actually use — is what confirms the plan's own percentage limit is still being honoured before the boom ever takes a load.",
      gauge: { label: "CHART %", speed: 0.65, green: [0.4, 0.62], readout: (t) => `${Math.round(t * 100)}%`, missNote: "Not settled inside the plan's band — hold the reading until it stops moving before you commit it." },
    },
    {
      id: "set-outriggers", kind: "select", target: "crane-outriggers",
      title: "Deploy the crane's outriggers",
      cue: "Set and level the crane's outriggers fully before any load goes on the hook.",
      why: "A crane's own load chart is only valid on outriggers fully deployed and level — the chart the plan just checked assumes exactly that base, and setting it now is what makes the chart reading from the last step actually mean something.",
    },
    {
      id: "brief-signalperson", kind: "select", target: "signalperson-brief",
      title: "Brief the signalperson on the channel and signals",
      cue: "Confirm the radio channel and the hand signals with the signalperson before the load is rigged.",
      why: "This lift runs on one certified signalperson's word for its entire duration, and confirming the channel and the signal set now — rather than assuming everyone remembers the same convention — is what keeps a boom movement from ever depending on a signal the operator has to guess the meaning of.",
    },
    {
      id: "rig-the-load", kind: "sequence",
      targets: ["sling-attached", "shackle-pin"],
      itemNames: { "sling-attached": "sling attached to the load", "shackle-pin": "shackle pinned and moused" },
      outOfOrderNote: "The sling goes onto the load first — the shackle only gets pinned once the sling is actually seated in it.",
      title: "Rig the load: sling first, then the shackle",
      cue: "Attach the sling to the load's rigging points, then pin and mouse the shackle.",
      why: "A shackle pinned before the sling is properly seated in its bow is a shackle carrying the load at an angle it was never rated for, and rigging in order — sling first, pin and mouse the shackle second — is what keeps every piece of this rig carrying the load the way ASME B30.9 and B30.26 actually rate it for.",
    },
    {
      id: "tension-check", kind: "turn", target: "boom-hoist-control",
      title: "Take up the slack before the pick",
      cue: "Turn the boom hoist control slowly, taking up slack in the line rather than jerking it tight.",
      why: "Taking up slack slowly lets the rigging crew watch the sling seat properly under load before the full weight comes on, and a hoist control worked in short jerks instead is how a rigging point that was not quite seated gets discovered only once the load is already off the ground.",
      turn: { turns: 0.5, label: "HOIST", readout: (t) => (t < 0.4 ? "slack" : t < 0.85 ? "taking up" : "two-blocked") },
    },
    {
      id: "hold-for-signal", kind: "hold", target: "lift-signal", seconds: 5,
      title: "Hold for the signalperson's own word before lifting",
      cue: "Hold position with the load just off the ground until the signalperson gives the clear signal to continue.",
      why: "The pause with the load barely off the ground is the last chance anyone has to call a stop before the pick actually starts, and holding here for the signalperson's own confirmation — rather than continuing on your own judgement — is exactly what a certified signalperson's authority over this lift means in practice.",
      holdBreakNote: "The lift continued before the signalperson's own confirmation came through — a pause that ends early is a pause that never actually checked for the stop it existed to catch.",
    },
    {
      id: "watch-load-plumb", kind: "track", target: "plumb-watch", seconds: 6,
      title: "Watch the load stay plumb through the pick",
      cue: "Watch the load as it lifts, keeping the plumb reading inside the band the whole way up.",
      why: "A load that starts swinging partway through a pick is a load whose actual position under the hook nobody can predict anymore, and holding the plumb watch through the whole lift — rather than looking away once it clears the ground — is what catches a swing building before it becomes the reason the pick has to stop.",
      track: { start: 0.5, green: [0.4, 0.62], rise: 0.3, fall: 0.28, drift: 0.16, label: "PLUMB", readout: (v) => (v < 0.4 ? "swinging left" : v > 0.62 ? "swinging right" : "plumb") },
      holdBreakNote: "The plumb reading ran outside the band mid-pick — a load that swings unwatched is a load nobody can predict the landing point of anymore.",
    },
    {
      id: "clear-exclusion-zone", kind: "select", target: "exclusion-boundary",
      title: "Confirm the exclusion zone is clear",
      cue: "Confirm nobody is inside the marked exclusion zone before the boom slews toward the landing point.",
      why: "A slewing boom carries its load through an arc the exclusion zone was drawn around specifically, and confirming the zone is actually clear — not assuming it stayed that way since the pick started — is what keeps that arc from passing over someone who wandered in while everyone watched the load instead of the ground.",
    },
    {
      id: "land-the-load", kind: "drag", target: "load-on-hook",
      title: "Land the load on its mark",
      cue: "Guide the load down onto the landing marker, setting it fully inside the mark before slacking the line.",
      why: "The landing marker is where the next crew expects to find this load, and setting it fully inside the mark — not just close — is what keeps the rigging crew from having to walk the load into position by hand after the crane has already released tension.",
      drag: { to: "landing-marker", radius: 0.55, missNote: "Not on the mark — the load has to be set down fully inside the landing marker before the line is slacked." },
    },
    {
      id: "crew-checkin", kind: "select", target: "lift-radio",
      title: "Check in with the signalperson and rigging crew",
      cue: "Call it in: load landed on its mark, chart held inside the plan's limit, zone clear the whole pick.",
      why: "The signalperson's own record of this lift is only as good as what actually gets confirmed on the radio, and calling it in now is what keeps the operator's account of the pick matching the signalperson's before either of them moves to the next lift.",
    },
    {
      id: "close-lift-log", kind: "select", target: "lift-log",
      title: "Close the lift log",
      cue: "Record the chart percentage used, the cracked shackle set aside, and the landing before signing off the pick.",
      why: "The lift log is the crane's own record that this specific pick stayed inside its plan, and a cracked shackle pulled from the rigging set that never makes the log is a piece of hardware the next lift's rigger has no way of knowing was already found once.",
    },
  ],

  interrupts: [
    {
      id: "load-starts-swinging",
      kind: "The load starts swinging on a wind gust mid-pick",
      after: "watch-load-plumb", delay: 2, seconds: 12,
      alert: "A wind gust has just caught the load and it is swinging hard, well outside the plumb band.",
      cue: "Call an all-stop on the radio now — the exclusion zone check waits.",
      target: "lift-radio",
      why: "A load swinging outside the plumb band is a load whose landing point nobody can predict anymore, and calling the all-stop the moment it starts is what keeps the boom from slewing any further while the load is doing something the plan never accounted for.",
      missNote: "The exclusion zone check continued while the load kept swinging; the boom slewed further before anyone called a stop.",
      wrongNote: "The lift radio's all-stop call — a swinging load is answered by stopping the pick, not by finishing a check already underway.",
    },
    {
      id: "signalperson-loses-sightline",
      kind: "The signalperson loses sightline on the load",
      after: "hold-for-signal", delay: 2, seconds: 12,
      alert: "A passing vehicle has just blocked the signalperson's own line of sight to the load.",
      cue: "Hold the boom on the all-stop horn until sightline is confirmed restored — the pick waits.",
      target: "all-stop-horn",
      why: "A signalperson who cannot see the load can no longer signal anything meaningful about it, and holding the boom on the all-stop horn until that sightline is actually restored is what keeps this lift from running on a signal given blind.",
      missNote: "The pick continued while the signalperson's sightline was still blocked; the boom moved for several seconds on a signal given without eyes on the load.",
      wrongNote: "The all-stop horn — a lost sightline is answered by holding the boom, not by continuing the pick on a signal given blind.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, RLC_ACCENT);

    // -------------------------------------------------------------- pad
    const pad = box(g, 7.0, 0.06, 5.6, 0, 0.03, 0, 0xffffff, { rough: 0.85 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { base: "#3a3f45", base2: "#2e3237" }), { repeat: 5, px: 512 }), { rough: 0.85, metal: 0.1, color: 0x9aa0a6 });

    // ------------------------------------------------------------------ crane
    const crane = mobileCrane(g, -1.0, 0, -1.6, { ry: 0.6, livery: { colour: 0xe8b02e, fleetName: "SMARTCITI FLEET", unitNumber: "MC-7" } });
    const craneParts = crane.userData.parts ?? {};
    holoTag(crane, "mobile crane", 0, 3.2, 0, { css: RLC_CSS, w: 0.3 });
    reg(hits, craneParts.outriggers?.[0] ?? crane, "crane-outriggers");
    reg(hits, craneParts.hook ?? crane, "boom-hoist-control");
    const signalLight = ball(crane, 0.04, 0, 3.6, 0.5, RLC_ACCENT, { emissive: RLC_ACCENT, ei: 1.6 });
    holoTag(signalLight, "lift signal", 0, 0.14, 0, { css: RLC_CSS, w: 0.24 });
    reg(hits, signalLight, "lift-signal");
    const unauthorizedHit = box(g, 0.3, 0.3, 0.3, -0.4, 0.9, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "take a signal from anyone?", -0.4, 1.3, -0.8, { css: "#d2312b", w: 0.5 });
    reg(hits, unauthorizedHit, "accept-signal-from-unauthorized-person");

    // ------------------------------------------------------------- rigging bench
    const bench = group(g, -3.0, 0, 1.6, 0.3);
    box(bench, 1.2, 0.5, 0.6, 0, 0.25, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    const goodShackle = torus(bench, 0.06, 0.014, -0.2, 0.55, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 6, seg2: 16 });
    holoTag(bench, "rigging bench", 0, 0.7, 0, { css: RLC_CSS, w: 0.36 });
    reg(hits, goodShackle, "shackle-pin");
    const crackedShackle = torus(bench, 0.06, 0.014, 0.2, 0.55, 0, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 6, seg2: 16 });
    holoTag(bench, "check the set", 0.2, 0.85, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, crackedShackle, "cracked-shackle");
    const useDamagedHit = box(g, 0.2, 0.15, 0.2, -2.8, 0.6, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "use the cracked one?", -2.8, 0.85, 1.6, { css: "#d2312b", w: 0.4 });
    reg(hits, useDamagedHit, "use-damaged-shackle");

    // ------------------------------------------------------------------- load
    const load = group(g, -1.0, 0, 0.6);
    box(load, 0.8, 0.6, 0.8, 0, 0.3, 0, 0x8a6a2a, { rough: 0.6, metal: 0.2 });
    holoTag(load, "load", 0, 0.7, 0, { css: RLC_CSS, w: 0.2 });
    reg(hits, load, "sling-attached");
    const plumbGauge = instrument(g, 0.4, 1.8, 0.2, { ry: -0.4, idle: "-- %", color: RLC_ACCENT, w: 0.1, d: 0.14 });
    holoTag(plumbGauge, "plumb watch", 0, 0.18, 0, { css: RLC_CSS, w: 0.28 });
    reg(hits, plumbGauge, "plumb-watch");
    const loadHookMarker = box(load, 0.1, 0.1, 0.1, 0, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, loadHookMarker, "load-on-hook");

    // ------------------------------------------------------------------- chart
    const chartGauge = instrument(g, -1.8, 1.6, -1.0, { ry: 0.6, idle: "-- %", color: RLC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(chartGauge, "load chart", 0, 0.18, 0, { css: RLC_CSS, w: 0.26 });
    reg(hits, chartGauge, "load-chart");
    const overChartHit = box(g, 0.2, 0.15, 0.2, -1.5, 1.35, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lift over the limit?", -1.5, 1.6, -1.0, { css: "#d2312b", w: 0.42 });
    reg(hits, overChartHit, "force-lift-over-chart");

    // -------------------------------------------------------------- exclusion zone
    const exclusionRing = torus(g, 2.6, 0.016, -1.0, 0.02, -0.4, 0xd2312b, { emissive: 0xd2312b, ei: 0.9, rough: 0.5, cast: false, seg: 8, seg2: 48 });
    exclusionRing.rotation.x = Math.PI / 2;
    holoTag(g, "exclusion zone", 1.4, 0.4, 1.0, { css: RLC_CSS, w: 0.34 });
    reg(hits, exclusionRing, "exclusion-boundary");
    const zoneWalkHit = box(g, 0.6, 0.3, 0.6, 2.0, 0.4, 0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk into the zone?", 2.0, 0.75, 0.8, { css: "#d2312b", w: 0.44 });
    reg(hits, zoneWalkHit, "walk-through-exclusion-zone");

    // -------------------------------------------------------------- landing
    const landingMarker = torus(g, 0.35, 0.014, 2.6, 0.02, 1.6, RLC_ACCENT, { emissive: RLC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    landingMarker.rotation.x = Math.PI / 2;
    holoTag(g, "landing marker", 2.6, 0.4, 1.6, { css: RLC_CSS, w: 0.32 });
    reg(hits, landingMarker, "landing-marker");

    // -------------------------------------------------------------- all-stop
    const stopHornPost = group(g, 1.6, 0, -2.4);
    cyl(stopHornPost, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const stopHorn = cyl(stopHornPost, 0.06, 0.1, 0.16, 0, 1.28, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(stopHornPost, "all-stop horn", 0, 1.5, 0, { css: RLC_CSS, w: 0.32 });
    reg(hits, stopHorn, "all-stop-horn");

    // -------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.95, 0.66, -3.4, 1.35, -0.4, (cx, w, h) => {
      cx.fillStyle = "#140c1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = RLC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("CRITICAL LIFT PLAN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f4ecff";
      ["Load: rigging bench pick", "Radius: today's working radius",
        "Chart limit: plan's own band", "Exclusion zone: swing radius",
        "One signalperson, one channel", "Landing marker set before release"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.5, accent: RLC_ACCENT });
    reg(hits, plan, "lift-plan");

    const briefBoard = holoPanel(g, 0.6, 0.42, 0.4, 1.3, -2.4, (cx, w, h) => {
      cx.fillStyle = "#140c1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = RLC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("SIGNAL BRIEF", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecff";
      ["Channel: CH 11", "Signals: NCCCO standard", "One voice only"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.6, accent: RLC_ACCENT });
    reg(hits, briefBoard, "signalperson-brief");

    const log = holoPanel(g, 0.6, 0.42, -3.0, 1.3, 1.0, (cx, w, h) => {
      cx.fillStyle = "#140c1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = RLC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#efe0ff"; cx.fillText("LIFT LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f4ecff";
      ["Chart: —", "Rigging: —", "Landing: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.5, accent: RLC_ACCENT });
    reg(hits, log, "lift-log");

    // -------------------------------------------------------------- radio & PPE
    const chest = toolChest(g, 2.8, -1.6, { ry: -0.4, color: 0x2b3138 });
    const radio = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "CH 11 · LIFT", color: RLC_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "lift radio", 0, 0.16, 0, { css: RLC_CSS, w: 0.28 });
    reg(hits, radio, "lift-radio");
    const rack = group(g, 2.2, 0, -2.2, 0.4);
    cyl(rack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.4, 0.03, 0.03, 0, 1.15, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const vestProp = group(rack, -0.1, 0.85, 0);
    box(vestProp, 0.22, 0.28, 0.02, 0, 0, 0, 0xd8f23a, { rough: 0.8 });
    holoTag(rack, "hi-vis vest", -0.1, 1.05, 0, { css: RLC_CSS, w: 0.28 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = ball(rack, 0.1, 0.14, 0.9, 0, 0xe8b02e, { rough: 0.6 });
    hatProp.scale.set(1, 0.6, 1);
    holoTag(rack, "hard hat", 0.14, 1.05, 0, { css: RLC_CSS, w: 0.24 });
    reg(hits, hatProp, "hard-hat");

    // ---------------------------------------------------------- perimeter
    cone(g, -3.7, 2.6); cone(g, 3.7, 2.6);
    barrierPanel(g, 0, 2.7, { color: 0xf2c14b, w: 5.0 });

    // ------------------------------------------------------------------ crew
    const signalperson = standingFigure(g, 0.6, -1.4, { ry: 2.8, cloth: 0x2b3138, vest: RLC_ACCENT, helmet: 0xf2f2f2 });
    holoTag(signalperson, "signalperson", 0, 1.95, 0, { css: RLC_CSS, w: 0.3 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect-rigging") crackedShackle.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.6, rough: 0.6 });
        if (step.id === "verify-load-chart") repaint(chartGauge.userData.screen, signFace("IN PLAN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.45 }));
        if (step.id === "land-the-load") load.position.set(2.6, 0, 1.6);
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LOAD LANDED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
        if (step.id === "close-lift-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#140c1e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#efe0ff"; cx.fillText("LIFT LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e0ffe8";
            ["Chart: in plan", "Rigging: 1 shackle rejected", "Landing: on the mark"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "load-starts-swinging") { plumbGauge.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 }); repaint(radio.userData.screen, signFace("LOAD SWINGING — ALL STOP", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd6d6", scale: 0.4 })); }
        if (it.id === "signalperson-loses-sightline") stopHorn.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "load-starts-swinging") repaint(radio.userData.screen, signFace("ALL STOP CLEARED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.34 }));
        if (it.id === "signalperson-loses-sightline") stopHorn.material = mat(0xd2312b, { rough: 0.5 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "tension-check") load.position.y = 0.3 + session.turn.amount * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "verify-load-chart") repaint(chartGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "watch-load-plumb" && session.holding) repaint(plumbGauge.userData.screen, signFace(`${Math.round(session.track.v * 100)}`, { bg: "#0d1c24", accent: session.track.v >= 0.4 && session.track.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void t; void CITY;
      },
    };
  },
};
