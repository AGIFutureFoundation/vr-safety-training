import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, standingFigure, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Smoke Day Outreach VR — Community Environmental Justice,
// Hunters Point Edition, station four of four in the biomonitoring line and
// the patrol network's own wildfire-smoke response.
//
// Door-to-door outreach on a wildfire-smoke day: the AQI read from the
// community network before the patrol ever knocks, the vulnerable-resident
// list worked first, an N95 actually fit rather than just handed over, a
// box-fan filter built with the resident who is going to keep breathing that
// room's air after the patrol leaves, windows closed and the system set to
// recirculate, the hotline card left behind, and the visit logged. Smoke
// does not wait for the patrol to finish the street in order, and neither
// does an oxygen concentrator's power supply or the AQI itself.
//
// Sited generically on a residential street during a regional smoke event;
// no real neighbourhood, resident or agency office is named or implied.

const SDO_ACCENT = 0xd88a4a;

export const SIM_SMOKE_DAY_OUTREACH = {
  id: "smoke-day-outreach",
  index: "154",
  domain: "Environmental",
  trade: "Community pollution patrol lead",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "smoke",
  certification: "OSHA 29 CFR 1910.134 respirators and Cal/OSHA's wildfire smoke rule; NIOSH N95 selection and fit guidance; EPA Air Quality Index and DIY box-fan filter guidance; CDC guidance for people at higher risk during wildfire smoke events",
  name: "Smoke Day Outreach",
  title: simTitle("Smoke Day Outreach"),
  tagline: "The AQI read before the first knock, the vulnerable-resident list worked first, N95s actually fit, a box-fan filter built with the resident, windows and recirculate set, the hotline card left behind, and the patrol's own masks on when the air demands it",
  accent: SDO_ACCENT,
  accentCss: "#d88a4a",
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "street-worked-right", name: "Street Worked Right", note: "The vulnerable households first, every mask actually fit, and the patrol's own respirators on before the air made that optional" },

  game: system({
    name: "Smoke Day Patrol",
    currency: "AQI",
    ranks: ["Outreach Trainee", "Patrol Member", "Patrol Lead", "Shift Lead", "Smoke Day Certified"],
    badges: [
      { id: "priority-first", name: "Priority First", note: "Worked the vulnerable-resident list in the order it was built", test: AWARD.stepClean("vulnerable-list") },
      { id: "never-unmasked", name: "Never Unmasked", note: "No resident or patrol member left without the mask this air required", test: AWARD.safe },
      { id: "fit-true", name: "Fit True", note: "Every seal check and reading held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "The oxygen-power check and the AQI watch both held without a break", test: AWARD.unbroken },
      { id: "street-fast", name: "Street Worked Fast", note: "The household visit complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-n95": "You handed over an N95 without running the fit check at all. A mask that sits loose at the nose or the cheeks lets smoke-laden air in around the seal exactly the way an unmasked face does — handing one over unfit is handing over the feeling of protection without the protection itself.",
    "recirculate-skip": "You left the window cracked \"just for air\" on a day the AQI is deep into the unhealthy range. Outdoor air on a smoke day is the contamination this whole visit exists to keep out — a window left open, or a system left on fresh-air intake, undoes the box-fan filter and the closed windows in the same five minutes it takes to notice.",
    "unplug-concentrator": "You unplugged the resident's oxygen concentrator to free up an outlet for the box fan. A concentrator is not a convenience appliance with a spare minute of slack — for the person breathing off it, even a short unplanned interruption is a supply of oxygen that stops, and there is always another outlet before there is ever a reason to touch that one.",
    "patrol-no-respirator": "You kept working the street without your own mask on as the AQI climbed into the range that requires one. Cal/OSHA's wildfire smoke rule protects the patrol the same way this visit is protecting the resident — a patrol member who runs out the shift unmasked because the door-to-door work felt too urgent to pause for is the next call this programme has to make.",
  },

  lateNotes: {
    "fan-filters": "There's no fan to build yet — the resident's own N95 has to be fit first; a resident coughing through an unfit mask is not a good assistant for building a filter.",
    "hotline-card": "Nothing to leave behind yet — the filter has to actually be running and the windows set before the card means anything as a follow-up.",
    "patrol-log": "Nothing to log yet — the hotline card is the last thing handed over before the visit is actually complete.",
  },

  steps: [
    {
      id: "check-aqi", kind: "select", target: "aqi-board",
      title: "Read the AQI from the network",
      cue: "Check today's reading from the community air-monitoring network before the patrol leaves the staging area.",
      why: "The AQI reading is what decides everything about how this shift runs — which households are worked first, whether N95s go on before the first knock, and at what number the patrol's own masks stop being optional. Reading it here, before the street, is what makes every decision after this one an informed one instead of a guess based on how the air smells.",
    },
    {
      id: "vulnerable-list", kind: "sequence",
      targets: ["house-oxygen", "house-asthma", "house-general"],
      itemNames: { "house-oxygen": "oxygen-dependent household", "house-asthma": "household with a respiratory condition", "house-general": "general household" },
      title: "Work the vulnerable-resident list in order",
      cue: "Visit the oxygen-dependent household first, then the household with a respiratory condition, then the general household.",
      why: "A smoke day does not treat every household the same, and neither does this list — a resident on supplemental oxygen or with an existing respiratory condition is exposed to real harm in the time it takes a patrol to work down a street in whatever order is convenient, so the list is worked in the order the risk actually runs.",
      outOfOrderNote: "Oxygen-dependent first, then respiratory conditions, then the general household — working the easiest door first leaves the households most at risk waiting longest for the mask and the filter.",
    },
    {
      id: "approach-door", kind: "select", target: "front-door",
      title: "Knock and identify the patrol",
      cue: "Knock, greet the resident, and identify yourself as the community pollution patrol.",
      why: "A resident opening the door to a stranger in a mask on a smoke day is already on edge — a clear, calm identification of who is at the door and why is what turns a knock into an invitation rather than something to be wary of.",
    },
    {
      id: "hand-mask", kind: "drag", target: "mask-box",
      title: "Offer an N95 at the door",
      cue: "Bring an N95 from the patrol kit to the resident before stepping inside.",
      drag: { to: "resident-hands", radius: 0.45, missNote: "Not actually into the resident's hands. A mask held out but not taken is a mask that isn't protecting anybody yet." },
      why: "The mask is offered at the doorstep, before anyone steps into a room that is likely already carrying some infiltrated smoke — a resident who has already been breathing that air for the length of the conversation has lost exactly the minutes the mask was supposed to save them.",
    },
    {
      id: "n95-fit", kind: "sequence",
      targets: ["n95-nose", "n95-straps", "n95-seal-check"],
      itemNames: { "n95-nose": "nose clip pinched", "n95-straps": "straps positioned top and bottom", "n95-seal-check": "seal checked" },
      title: "Fit the N95 properly",
      cue: "Pinch the nose clip, position both straps, then check the seal — in that order.",
      why: "NIOSH's own fit guidance is exactly this sequence because each step only works if the one before it is already done — a seal check run before the straps are actually seated just confirms that a loose mask is loose, and the nose clip pinched last leaves a gap the straps were never going to close on their own.",
      outOfOrderNote: "Nose clip, then both straps, then the seal check — checking the seal before the straps are positioned tells you nothing about whether the mask will actually hold.",
    },
    {
      id: "seal-gauge", kind: "gauge", target: "fit-meter",
      title: "Read the fit-check meter",
      cue: "Cup both hands over the mask, exhale, and commit the reading once the seal shows tight.",
      gauge: { label: "SEAL PRESSURE", speed: 0.7, green: [0.55, 0.85], readout: (t) => (t < 0.55 ? "leaking at the edges" : t > 0.85 ? "over-tightened, check comfort" : "sealed"), missNote: "That reading isn't a good seal — air leaking around the edge of an N95 is air that never went through the filter media at all." },
      why: "A positive-pressure check is the difference between a mask that looks right and a mask that is actually sealed — a resident who has never worn one before will not know the difference on their own, which is exactly why the patrol reads the meter rather than taking their word for how it feels.",
    },
    {
      id: "fan-build", kind: "sequence",
      targets: ["fan-filters", "fan-tape", "fan-power"],
      itemNames: { "fan-filters": "filters attached to all four sides", "fan-tape": "edges taped", "fan-power": "fan powered on" },
      title: "Build the box-fan filter with the resident",
      cue: "Attach a filter to each side of the box fan, tape the edges, then power it on — with the resident doing as much of it as they're able to.",
      why: "The filter is built with the resident, not for them, because they are the one who is going to be replacing these filters and running this fan long after the patrol has moved to the next house — a box-fan filter nobody but the patrol knows how to rebuild stops working the first time a filter clogs.",
      outOfOrderNote: "Filters on all four sides, then taped, then powered on — running the fan before the filters are actually sealed to the frame pulls smoke straight through the gaps instead of through the media.",
    },
    {
      id: "fan-speed", kind: "turn", target: "fan-dial",
      title: "Set the fan to its working speed",
      cue: "Turn the fan's speed dial up to the setting that actually moves air through a taped filter.",
      turn: { turns: 0.6, axis: "y", label: "FAN SPEED" },
      why: "A box-fan filter run on its lowest setting to keep the noise down barely turns the room's air over — the speed has to be high enough to actually filter a useful volume of air, which is a trade-off worth explaining rather than leaving the resident to quietly turn back down after the patrol leaves.",
    },
    {
      id: "windows-recirc", kind: "sequence",
      targets: ["windows-closed", "recirculate-set"],
      itemNames: { "windows-closed": "windows closed", "recirculate-set": "system set to recirculate" },
      title: "Close the windows and set recirculate",
      cue: "Close the windows first, then set the room's air system to recirculate rather than fresh-air intake.",
      why: "Closing the windows and setting recirculate both do the same job from two different directions — one keeps outdoor smoke from coming in through a gap, the other keeps a fresh-air intake from pulling it in through the vents — and neither one alone is the whole answer on a day this smoky.",
      outOfOrderNote: "Windows first, then recirculate — setting the system before the windows are shut still leaves the most direct path for smoke to come straight through an open sash.",
    },
    {
      id: "power-flicker", kind: "hold", target: "concentrator-power", seconds: 5,
      title: "Steady the oxygen concentrator's power",
      cue: "Hold the power strip connection steady while the resident's oxygen concentrator is checked.",
      why: "An oxygen-dependent household is the first stop on this list for a reason, and a power connection that has been flickering under the load of a smoke-day's extra appliances is exactly the kind of quiet failure that does not announce itself until the concentrator has already gone down — holding it steady while it's checked is what catches a bad connection before it becomes an emergency.",
      holdBreakNote: "The connection was let go before it was actually confirmed steady — a power strip that flickers once under load will flicker again, on its own schedule, once the patrol has moved on.",
    },
    {
      id: "hotline-card", kind: "select", target: "hotline-card",
      title: "Leave the hotline card",
      cue: "Hand the resident the smoke-day hotline and resource card before leaving.",
      why: "The patrol will not be back at this door again today, and the hotline card is what the resident has for everything that happens after — a filter that clogs, a question about symptoms, or simply wanting to know when the air is expected to clear.",
    },
    {
      id: "aqi-watch", kind: "track", target: "aqi-monitor", seconds: 7,
      title: "Watch the AQI feed through the visit",
      cue: "Keep an eye on the live AQI feed for a band creep while the visit continues.",
      track: { start: 0.3, green: [0.1, 0.55], rise: 0.55, fall: 0.4, drift: 0.14, label: "AQI TREND", readout: (v) => (v > 0.55 ? "climbing into very unhealthy" : "holding") },
      why: "A wildfire smoke event does not hold steady for the length of a patrol's shift, and a feed nobody is watching can cross the very-unhealthy threshold between one doorstep and the next without anyone noticing until the patrol is already well past the point their own masks should have gone on.",
      holdBreakNote: "The AQI feed drifted unwatched for a stretch — a band this station is meant to catch a creep in does not do its job if nobody is actually looking at it.",
    },
    {
      id: "log-visit", kind: "select", target: "patrol-log",
      title: "Log the household visit",
      cue: "Record the household, the mask fit, the filter build and the AQI at the time of the visit.",
      why: "Tomorrow's patrol works from today's log, not today's memory — a household already visited and fitted does not need to be worked again from scratch, and one flagged with a concern the patrol noticed gets picked up faster the second time.",
    },
  ],

  interrupts: [
    {
      id: "oxygen-power-flicker",
      kind: "Life-support power concern",
      after: "power-flicker", delay: 2, seconds: 12,
      alert: "Mid-check, the resident says their oxygen concentrator's display just blinked off and back on — it's happened twice already this morning.",
      cue: "Get the concentrator onto a connection you've actually confirmed steady, now.",
      target: "concentrator-outlet",
      why: "A concentrator that has already blinked twice this morning is not a one-time glitch to note for later — it is a failing connection actively serving someone's oxygen supply, and moving it to a confirmed outlet immediately is the only response that treats a repeat event as the warning it actually is.",
      missNote: "The check moved on while the concentrator stayed on the same flickering connection. A power interruption to a working oxygen concentrator is not a paperwork problem — it is the thing this whole household visit was prioritised to prevent.",
      wrongNote: "It's the confirmed outlet for the concentrator. Nothing else in this room actually gets it off the connection that keeps flickering.",
    },
    {
      id: "aqi-spike-midshift",
      kind: "Air quality deterioration",
      after: "aqi-watch", delay: 2, seconds: 12,
      alert: "The AQI feed just crossed into the very-unhealthy band and is still climbing — the patrol has been working bare-faced between houses to talk more easily with residents.",
      cue: "Get the patrol's own respirators on before the next door.",
      target: "patrol-respirator-box",
      why: "The rule that protects this patrol does not pause because the street is only half worked — Cal/OSHA's wildfire smoke rule sets the point at which the patrol's own masks stop being optional, and an AQI that just crossed it applies to the people doing the outreach exactly as much as it applies to the households they're visiting.",
      missNote: "The patrol kept working the street bare-faced after the AQI crossed into the very-unhealthy band. Protecting the households on this street was never supposed to come at the cost of the people doing the protecting.",
      wrongNote: "The patrol's own respirator box. That's what actually gets the team masked for the air the AQI just confirmed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, SDO_ACCENT);

    // ------------------------------------------------------------- street
    const groundMesh = box(g, 6.0, 0.14, 5.6, 0, 0.07, 0, 0xffffff, { rough: 0.9 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#5a5148", base2: "#4c453d", seam: "rgba(0,0,0,0.35)" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xbfb2a0 },
    );
    const sidewalkMesh = box(g, 5.6, 0.03, 1.3, 0, 0.145, 2.2, 0xffffff, { rough: 0.85, cast: false });
    sidewalkMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a8f92", base2: "#7a7f82", seam: "rgba(0,0,0,0.3)" }), { repeat: 3, px: 256 }),
      { rough: 0.85, metal: 0.02, color: 0xc9cdd0 },
    );

    // ------------------------------------------------------------- house
    const house = group(g, 0, 0, -1.7, 0);
    box(house, 3.2, 2.3, 1.8, 0, 1.29, 0, 0xcac2ae, { rough: 0.7, finish: "painted", tile: [4, 3] });
    box(house, 3.4, 0.5, 2.0, 0, 2.7, 0, 0x5a4a3c, { rough: 0.8 });
    const doorGrp = group(house, 0.1, 0, 0.92);
    box(doorGrp, 0.7, 1.4, 0.06, 0, 0.7, 0, 0x6f5138, { rough: 0.7 });
    const doorKnob = ball(doorGrp, 0.02, 0.28, 0.7, 0.04, 0xd8c26a, { rough: 0.4, metal: 0.7, seg: 10 });
    void doorKnob;
    reg(hits, doorGrp, "front-door");
    for (const wx of [-1.1, 1.1]) {
      box(house, 0.55, 0.6, 0.04, wx, 1.35, 0.92, 0x9fc8d8, { rough: 0.3, metal: 0.2, opacity: 0.8, transparent: true });
    }
    holoTag(house, "resident household", 0, 3.05, 0, { css: "#d88a4a", w: 0.5 });

    // ------------------------------------------------------------- vulnerable list board
    const listBoard = holoPanel(g, 0.9, 0.6, -2.2, 1.5, 0.4, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a4a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe4cf";
      cx.fillText("VULNERABLE-RESIDENT LIST", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fdf1e2";
      ["1. Oxygen-dependent household", "2. Respiratory condition", "3. General household"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.17)));
    }, { accent: SDO_ACCENT });
    const LIST_ROWS = [["house-oxygen", -0.14], ["house-asthma", 0.02], ["house-general", 0.18]];
    for (const [id, dy] of LIST_ROWS) {
      const marker = box(listBoard, 0.55, 0.01, 0.05, 0, dy, 0.05, SDO_ACCENT, { rough: 0.6, emissive: SDO_ACCENT, ei: 0.3 });
      reg(hits, marker, id);
    }

    // ------------------------------------------------------------- AQI board (staging)
    const aqiPost = group(g, 2.2, 0, -0.6, -0.4);
    const aqiBoard = holoPanel(aqiPost, 0.7, 0.5, 0, 1.55, 0, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a4a"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe4cf";
      cx.fillText("NETWORK AQI: 168", w * 0.06, h * 0.4);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fdf1e2";
      cx.fillText("Unhealthy — masks required", w * 0.06, h * 0.68);
    }, { accent: SDO_ACCENT });
    reg(hits, aqiBoard, "aqi-board");
    cyl(aqiPost, 0.02, 0.022, 1.1, 0, 0.55, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });

    const aqiMonitorInst = instrument(aqiPost, 0.4, 1.1, 0, { idle: "AQI ---", color: SDO_ACCENT, w: 0.16, d: 0.2 });
    reg(hits, aqiMonitorInst, "aqi-monitor");
    const aqiAlarmLamp = ball(aqiPost, 0.035, 0, 1.9, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 12 });
    aqiAlarmLamp.visible = false;

    // ------------------------------------------------------------- patrol kit
    const kitChest = toolChest(g, 1.5, 1.6, { ry: -0.5, color: 0x8b5a2f });
    const maskBoxGrp = group(kitChest, 0, 0.8, 0.05);
    box(maskBoxGrp, 0.24, 0.1, 0.16, 0, 0, 0, 0xdfe4e8, { rough: 0.5 });
    holoTag(maskBoxGrp, "N95 box", 0, 0.12, 0, { css: "#d88a4a", w: 0.3 });
    reg(hits, maskBoxGrp, "mask-box");

    const patrolRespiratorBox = group(kitChest, 0.2, 0.8, -0.1);
    box(patrolRespiratorBox, 0.16, 0.08, 0.12, 0, 0, 0, 0x4a4f55, { rough: 0.5 });
    holoTag(patrolRespiratorBox, "patrol respirators", 0, 0.1, 0, { css: "#d88a4a", w: 0.4 });
    reg(hits, patrolRespiratorBox, "patrol-respirator-box");

    const skipMaskBtn = box(kitChest, 0.12, 0.04, 0.06, -0.2, 0.8, 0.05, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(kitChest, "hand it over unfit?", -0.2, 0.9, 0.05, { css: "#f0645b", w: 0.44 });
    reg(hits, skipMaskBtn, "skip-n95");

    // ------------------------------------------------------------- porch / N95 fit
    const porch = group(house, 0, 0, 1.35);
    const residentHands = group(porch, 0, 1.0, 0.1);
    hits["resident-hands"] = residentHands;
    const resident = standingFigure(g, 0.35, -0.1, { ry: 2.6, cloth: 0x5c6b57, skin: 0xb98a63 });
    holoTag(resident, "resident", 0, 1.95, 0, { css: "#d88a4a", w: 0.24 });

    const fitStation = group(g, -1.1, 0, -0.5, 0.4);
    const noseClip = box(fitStation, 0.06, 0.02, 0.03, -0.05, 1.05, 0, 0xdfe4e8, { rough: 0.5 });
    holoTag(fitStation, "nose clip", -0.05, 1.14, 0, { css: "#d88a4a", w: 0.24 });
    reg(hits, noseClip, "n95-nose");
    const strapTop = torus(fitStation, 0.05, 0.006, 0.05, 1.15, -0.02, 0xdfe4e8, { rough: 0.6, seg: 6, seg2: 16 });
    reg(hits, strapTop, "n95-straps");
    const sealCheckBtn = box(fitStation, 0.1, 0.03, 0.06, 0.15, 1.0, 0, SDO_ACCENT, { rough: 0.5, emissive: SDO_ACCENT, ei: 0.3 });
    holoTag(fitStation, "seal check", 0.15, 1.1, 0, { css: "#d88a4a", w: 0.3 });
    reg(hits, sealCheckBtn, "n95-seal-check");
    const fitMeter = instrument(fitStation, 0, 0.75, 0.1, { idle: "-- %", color: SDO_ACCENT, w: 0.14, d: 0.18 });
    reg(hits, fitMeter, "fit-meter");

    // ------------------------------------------------------------- box fan
    const fanStation = group(g, -0.4, 0, 0.9, 0.3);
    const fanBody = cyl(fanStation, 0.28, 0.28, 0.12, 0, 0.7, 0, 0x2b3138, { rough: 0.5, metal: 0.3, seg: 20 });
    void fanBody;
    const FILTER_SIDES = [["fan-filters", 0, 0.7, 0.07], ["fan-tape", 0.15, 0.7, 0], ["fan-power", -0.15, 0.7, 0]];
    for (const [id, x, y, z] of FILTER_SIDES) {
      const part = box(fanStation, 0.3, 0.3, 0.02, x, y, z, 0xd6c99a, { rough: 0.75 });
      reg(hits, part, id);
    }
    holoTag(fanStation, "box-fan filter", 0, 0.9, 0, { css: "#d88a4a", w: 0.36 });
    const fanDialKnob = group(fanStation, 0.26, 0.72, 0);
    cyl(fanDialKnob, 0.03, 0.03, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5, seg: 12 });
    reg(hits, fanDialKnob, "fan-dial");

    // ------------------------------------------------------------- windows / recirculate
    const hvacPanel = holoPanel(house, 0.6, 0.4, 1.5, 1.6, 0.92, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a4a"; cx.fillRect(0, 0, w, 5);
      cx.font = `${Math.round(h * 0.13)}px Arial, sans-serif`; cx.fillStyle = "#fdf1e2";
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("RECIRCULATE", w / 2, h / 2);
    }, { accent: SDO_ACCENT });
    reg(hits, hvacPanel, "recirculate-set");
    const windowLatch = group(house, -1.1, 1.35, 0.94);
    box(windowLatch, 0.05, 0.02, 0.02, 0, 0, 0, 0xdfe4e8, { rough: 0.4 });
    reg(hits, windowLatch, "windows-closed");
    const openWindowTrap = box(house, 0.16, 0.05, 0.03, -1.1, 1.6, 0.94, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(house, "leave it cracked?", -1.1, 1.7, 0.94, { css: "#f0645b", w: 0.4 });
    reg(hits, openWindowTrap, "recirculate-skip");

    // ------------------------------------------------------------- oxygen concentrator
    const concentratorGrp = group(g, 1.2, 0, -0.4, -0.3);
    box(concentratorGrp, 0.28, 0.42, 0.22, 0, 0.21, 0, 0xdfe4e8, { rough: 0.4, metal: 0.15 });
    holoTag(concentratorGrp, "oxygen concentrator", 0, 0.5, 0, { css: "#d88a4a", w: 0.42 });
    const powerStrip = box(concentratorGrp, 0.16, 0.03, 0.05, 0.2, 0.02, 0.14, 0x2b3138, { rough: 0.5 });
    reg(hits, powerStrip, "concentrator-power");
    const confirmedOutlet = box(concentratorGrp, 0.06, 0.09, 0.03, -0.2, 0.4, 0.15, 0xdfe4e8, { rough: 0.4 });
    holoTag(concentratorGrp, "confirmed outlet", -0.2, 0.48, 0.15, { css: "#59c97b", w: 0.34 });
    reg(hits, confirmedOutlet, "concentrator-outlet");
    const unplugBtn = box(concentratorGrp, 0.1, 0.04, 0.06, 0.2, 0.44, 0.14, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(concentratorGrp, "borrow this outlet?", 0.2, 0.56, 0.14, { css: "#f0645b", w: 0.4 });
    reg(hits, unplugBtn, "unplug-concentrator");

    // ------------------------------------------------------------- hotline card / log
    const cardTable = group(g, -1.7, 0, 1.6, 0.4);
    box(cardTable, 0.4, 0.7, 0.3, 0, 0.35, 0, 0x4a5561, { rough: 0.65, metal: 0.2 });
    const hotlineDecal = decal(cardTable, 0.24, 0.14, 0, 0.71, 0, paperFace("SMOKE HOTLINE", ["Filters · symptoms · air updates"], { bg: "#fbf3df", band: "#c99a2b" }), { px: 220 });
    hotlineDecal.rotation.x = -Math.PI / 2;
    holoTag(cardTable, "hotline card", 0, 0.86, 0, { css: "#d88a4a", w: 0.34 });
    reg(hits, hotlineDecal, "hotline-card");

    const logBoard = holoPanel(g, 0.6, 0.4, 2.0, 1.5, 1.7, (cx, w, h) => {
      cx.fillStyle = "#241608"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#d88a4a"; cx.fillRect(0, 0, w, 5);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = "#fbe4cf";
      cx.fillText("PATROL LOG", w / 2, h * 0.35);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#fdf1e2";
      cx.fillText("Household · fit · filter · AQI", w / 2, h * 0.68);
    }, { ry: -0.6, accent: SDO_ACCENT });
    reg(hits, logBoard, "patrol-log");

    // ------------------------------------------------------------- smoke haze + patrol lead
    const haze = particles(g, 30, 0xb8a888, { size: 0.06, life: 1.6, additive: false, opacity: 0.22 });
    haze.position.set(0, 1.4, 0);

    const patrolLead = standingFigure(g, 0.9, 0.9, { ry: -0.9, cloth: 0x3c5a66, vest: SDO_ACCENT });
    holoTag(patrolLead, "patrol lead", 0, 1.95, 0, { css: "#d88a4a", w: 0.36 });

    const keepBareBtn = box(g, 0.14, 0.05, 0.08, 1.55, 1.05, 1.1, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.4 });
    holoTag(g, "keep working bare-faced?", 1.55, 1.18, 1.1, { css: "#f0645b", w: 0.54 });
    reg(hits, keepBareBtn, "patrol-no-respirator");

    let concentratorOk = true;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.4, 1.5),

      onStepComplete(step) {
        if (step.id === "hand-mask") { residentHands.userData.masked = true; }
        if (step.id === "fan-build") { fanBody.material = mat(0x3c5a3f, { rough: 0.5, metal: 0.3 }); }
        if (step.id === "power-flicker") {
          concentratorOk = true;
          powerStrip.material = mat(0x59c97b, { rough: 0.5 });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "oxygen-power-flicker") {
          concentratorOk = false;
          powerStrip.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.5 });
        }
        if (it.id === "aqi-spike-midshift") {
          repaint(aqiMonitorInst.userData.screen, signFace("AQI 262 !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.55 }));
          aqiAlarmLamp.visible = true;
          aqiAlarmLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "oxygen-power-flicker") {
          concentratorOk = true;
          powerStrip.material = mat(0x59c97b, { rough: 0.5 });
        }
        if (it.id === "aqi-spike-midshift") {
          repaint(aqiMonitorInst.userData.screen, signFace("AQI 178", { bg: "#0d1c1c", accent: "#f2ae14", fg: "#fdf1e2", scale: 0.55 }));
          aqiAlarmLamp.visible = false;
        }
      },
      animate(t, dt, session) {
        haze.visible = true;
        haze.userData.step(dt, new THREE.Vector3(0.3, 0.02, 0.1), 0.08, 0.5, 0.2);
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "seal-gauge") {
          repaint(fitMeter.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, {
            bg: "#0d1c1c", accent: gg.t >= 0.55 && gg.t <= 0.85 ? "#59c97b" : "#f2ae14", fg: "#fdf1e2", scale: 0.6,
          }));
        }
        if (session?.track && session.step?.id === "aqi-watch") {
          const v = session.track.v;
          repaint(aqiMonitorInst.userData.screen, signFace(`AQI ${Math.round(140 + v * 180)}`, {
            bg: "#0d1c1c", accent: v <= 0.55 ? "#f2ae14" : "#d2312b", fg: "#fdf1e2", scale: 0.55,
          }));
        }
        if (session?.turn && session.step?.id === "fan-speed") { fanDialKnob.rotation.z = session.turn.amount * Math.PI; }
        void t; void concentratorOk;
      },
    };
  },
};
