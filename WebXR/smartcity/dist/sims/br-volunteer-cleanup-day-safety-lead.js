import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, particles, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg,
  surfaceTexture, texturedMat, mudflatFace, waterFace,
} from "../citykit.js";
import { skiff } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Volunteer Cleanup Day Safety Lead VR — SF Bay Restoration &
// Cleanup, Pack E (ecology, monitoring and community science).
//
// A community cleanup day on the tideflat, and the learner is the safety
// lead the sponsoring agency puts in front of a crew of volunteers who have
// never worked this shoreline before. Sharps and heat are the two hazards
// this crew is least prepared to recognise on its own, and the tide is the
// one neither the safety lead nor the volunteers get to negotiate with — the
// window it opens is read off the same NOAA table the other Pack E stations
// read. A missing volunteer partway through the shift is the one thing this
// job cannot afford to be slow about, and a beached skiff — the fleet.js
// builder — is what the sponsoring agency uses to haul the filled bags off
// the flat rather than carrying every one of them back across it by hand.

const BRVC_ACCENT = 0xe0a23c;
const BRVC_CSS = "#e0a23c";
const BRVC_GREEN = 0x59c97b;
const BRVC_AMBER = 0xe8b02e;
const BRVC_RED = 0xd2312b;

export const SIM_BR_VOLUNTEER_CLEANUP_DAY_SAFETY_LEAD = {
  id: "br-volunteer-cleanup-day-safety-lead",
  index: "346",
  domain: "Water & Environmental",
  trade: "Volunteer cleanup day safety lead, briefing and watching a shoreline cleanup crew of community volunteers for a sponsoring restoration agency",
  category: "Water & Environmental",
  district: "Water & Environmental",
  weather: "clear",
  certification: "Cal/OSHA 8 CCR 3395 heat illness prevention in outdoor places of employment; OSHA 29 CFR 1910.1030 bloodborne pathogens for sharps handling; Cal/OSHA 8 CCR 3203 Injury and Illness Prevention Program behind today's briefing; OSHA 29 CFR 1910.132 personal protective equipment, general requirements; NOAA tide predictions the work window is timed against",
  name: "Volunteer Cleanup Day Safety Lead",
  title: simTitle("Volunteer Cleanup Day Safety Lead"),
  tagline: "The watch a volunteer crew doesn't know it needs: the briefing that actually covers sharps and the buddy system, the right glove and tool handed out for the right hazard, a loose needle found before the crew ever fans out, the tide window read off the table rather than guessed at, a missing volunteer answered with an immediate headcount, a surging tide answered with an immediate recall, and every hour of the day logged the way the sponsoring agency needs it logged",
  accent: BRVC_ACCENT,
  accentCss: BRVC_CSS,
  parSeconds: 310,
  footprint: 3.0,
  badge: { id: "clean-crew-clean-flat", name: "Clean Crew, Clean Flat", note: "The briefing covered sharps and the buddy system, the missing volunteer got an immediate headcount, the tide surge got an immediate recall, and the whole crew signed back in accounted for" },

  supportLine: "your agency's employee assistance programme, with the sponsoring organisation's own volunteer-safety line behind it",

  game: system({
    name: "Cleanup Day Watch",
    currency: "CHECK-INS",
    ranks: ["New Safety Lead", "Safety Lead", "Senior Safety Lead", "Lead Coordinator", "Cleanup Day Certified"],
    badges: [
      { id: "true-briefing", name: "True Briefing", note: "The sharps rule and the buddy system briefed before anyone touched a bag", test: AWARD.stepClean("safety-briefing-board") },
      { id: "clean-watch", name: "Clean Watch", note: "Never let a bare hand near a sharp, never lost a volunteer, never pushed a heat symptom through", test: AWARD.safe },
      { id: "held-the-break", name: "Held The Break", note: "The scheduled water break called inside the correct interval, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-day", name: "Clean Day", note: "No corrections across the whole shift", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the flat scan in band through the whole work period", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Day closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "pick-up-sharps-bare-hand": "You reached for a sharp with a bare hand instead of the tongs. A needle in a tideline debris pile has no way to announce itself before it's already broken skin, and the whole reason the sharps rule exists is that a volunteer who has never done this work has no instinct yet for which piece of trash is ordinary and which one can send them to urgent care — the tongs go on every sharp, every time, no exceptions made for how safe one particular piece looks.",
    "skip-buddy-system": "You let a volunteer wander off alone toward the far end of the flat instead of keeping the buddy system in force. Nobody on this crew has worked this shoreline before, and a solo volunteer who steps in a soft patch or gets caught by the tide has nobody beside them to call it in — the buddy system isn't a courtesy, it's the only thing standing between a bad step and nobody knowing about it for twenty minutes.",
    "push-through-heat-symptoms": "You told a volunteer showing heat illness symptoms to keep working the last few bags before taking a break. Heat illness moves from uncomfortable to dangerous faster in someone who isn't used to physical outdoor work than in a crew that does this every day, and 'a few more bags' is exactly the reasoning the heat plan exists to override — a volunteer showing symptoms goes to shade and water immediately, not after the task in front of them.",
    "ignore-incoming-tide": "You kept the crew working the low flat as the tide table's window ran out instead of calling everyone back to shore. The tide doesn't wait for a bag to get finished, and ground that was dry footing twenty minutes ago can be ankle-deep water now — the window on the table is the actual limit, not a suggestion the crew can stretch because the cleanup isn't done yet.",
  },

  lateNotes: {
    "break-clock": "Nothing to read yet — the crew has to actually be out working before there is a break interval to watch.",
    "safety-log": "Nothing to log yet — the day hasn't started and nothing has happened worth an entry.",
  },

  interrupts: [
    {
      id: "volunteer-lost",
      kind: "A volunteer misses the scheduled radio check-in",
      after: "crew-assignment", delay: 3, seconds: 16,
      alert: "One volunteer hasn't checked back in at the scheduled call, and their buddy can't find them anywhere on their assigned stretch.",
      cue: "Call it in on the safety channel immediately and start the missing-volunteer headcount — do not wait for the next scheduled check-in to see if they turn up.",
      target: "safety-radio",
      why: "A volunteer who is late to one check-in on a shoreline they don't know could be anything from stopped to talk to another team to genuinely in trouble, and the only way to tell the difference fast is to call it in the moment the miss is noticed — waiting for the next check-in trades away exactly the minutes that matter if something has actually gone wrong.",
      missNote: "Nobody called it in, and the missing volunteer stayed unaccounted for while the shift kept going around them.",
      wrongNote: "The safety channel — that radio starts the headcount, and nothing else on this flat does.",
    },
    {
      id: "incoming-tide-surge",
      kind: "Wind pushes the tide in faster than the table predicted",
      after: "flat-watch", delay: 2, seconds: 14,
      alert: "Wind is pushing the tide in well ahead of the table's prediction, and the flat is going to be underwater sooner than the window said.",
      cue: "Sound the recall horn immediately and get every volunteer off the flat now — do not wait for the scheduled end of the work period.",
      target: "recall-horn",
      why: "The tide table gives a prediction, not a guarantee, and wind is exactly the thing that pushes a real tide ahead of it without any warning beyond how fast the water actually starts moving — the recall horn is the one signal on this flat that reaches every volunteer at once, and it has to go out the moment the water is ahead of schedule, not once someone is already standing in it.",
      missNote: "The horn never sounded, and the crew kept working the flat while the water came in faster than the table predicted.",
      wrongNote: "The recall horn — that's the one signal every volunteer out there can actually hear over the wind.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["gloves-on", "boots-on", "hat-sunscreen"],
      itemNames: { "gloves-on": "work gloves on", "boots-on": "closed-toe boots on", "hat-sunscreen": "sun hat and sunscreen on" },
      title: "Gear up before the crew arrives",
      cue: "Before the volunteers arrive: work gloves on, closed-toe boots on, sun hat and sunscreen on.",
      why: "The safety lead is on the flat for the whole shift while volunteers rotate through breaks, which means more sun exposure than anyone else on the crew gets, and gearing up the same way the briefing is about to ask the volunteers to is what makes the rest of the briefing credible rather than a rule for everyone but the person giving it.",
    },
    {
      id: "safety-briefing-board", kind: "select", target: "safety-briefing-board",
      title: "Read today's safety briefing before the crew arrives",
      cue: "Read the briefing board: the sharps rule, the buddy system, and what a heat illness symptom looks like before anyone starts working.",
      why: "A crew of volunteers who have never worked this shoreline before has no shared idea yet of what today's hazards actually are, and reading the briefing board before a single volunteer arrives is what turns today's talk from a list read off a clipboard into three rules the safety lead actually knows cold.",
    },
    {
      id: "ppe-table", kind: "select", target: "ppe-table",
      title: "Check the PPE table against today's tasks",
      cue: "Check the PPE table: puncture-resistant gloves and tongs for sharps and glass, ordinary gloves for the rest of the debris.",
      why: "A volunteer handed the wrong glove for the wrong task is a volunteer who thinks they're protected when they aren't, and matching the equipment on the table to the hazard it's actually rated for — before any of it gets handed out — is what keeps 'I had gloves on' from being the sentence that follows an injury instead of preventing one.",
    },
    {
      id: "check-gear", kind: "find", noHint: true,
      targets: ["loose-needle", "unmarked-drum"],
      itemNames: { "loose-needle": "a loose hypodermic needle in the debris pile", "unmarked-drum": "a rusted drum with no label" },
      itemNotes: {
        "loose-needle": "Half-buried in the tideline debris, easy for a volunteer to grab without looking closely — found now, before the crew fans out, it's tonged straight into the sharps container; found by a volunteer's hand it's an incident report.",
        "unmarked-drum": "No label, no way to know what was in it — this isn't cleanup crew material, it gets flagged and called in, not opened by anyone here.",
      },
      title: "Walk the debris pile before the crew starts",
      cue: "Walk the staging area and find anything in the debris pile the crew shouldn't be the ones to handle.",
      why: "A tideline debris pile collects whatever the Bay has been carrying, and the loose needle and the unmarked drum are exactly the two things a volunteer crew has no way to recognise as different from ordinary trash — finding both before anyone starts picking through the pile is the entire reason the safety lead walks it alone first.",
    },
    {
      id: "sharps-tongs", kind: "drag", target: "sharps-tongs",
      title: "Place the found sharp with the tongs",
      cue: "Pick up the tongs and place the needle you found straight into the sharps container — never with a bare hand.",
      why: "Demonstrating the tongs on the very sharp the crew is about to be briefed on is what makes the rule concrete rather than abstract, and a safety lead who handles the day's first sharp correctly, in front of the crew as they arrive, sets the standard the rest of the shift is held to.",
      drag: { to: "sharps-container-socket", radius: 0.4, missNote: "Not in the container — the sharp has to actually land inside it, not just near it." },
    },
    {
      id: "tide-board", kind: "select", target: "tide-board",
      title: "Read today's tide table",
      cue: "Read the tide table: the low-tide window the flat is workable in today, and when the water starts coming back in.",
      why: "The tide table is a prediction the safety lead plans the whole shift around, not a number the crew can push past because the cleanup isn't finished — reading it before the first team goes out is what sets the actual end of the workday, whatever the schedule on paper says.",
    },
    {
      id: "heat-plan-board", kind: "select", target: "heat-plan-board",
      title: "Read the heat illness prevention plan",
      cue: "Read the heat plan: water and shade available at all times, scheduled breaks, and the symptoms that mean a volunteer stops immediately.",
      why: "A volunteer crew doing unfamiliar physical work in the sun is exactly who Cal/OSHA's heat illness standard is written for, and reading the plan before the first team goes out is what lets the safety lead actually recognise a symptom the moment it shows up instead of only after someone is already in trouble.",
    },
    {
      id: "crew-assignment", kind: "sequence",
      targets: ["team-a-assigned", "team-b-assigned", "radios-issued"],
      itemNames: { "team-a-assigned": "team A assigned to the north stretch", "team-b-assigned": "team B assigned to the south stretch", "radios-issued": "a radio issued to each team lead" },
      outOfOrderNote: "Assign both teams before issuing the radios — there's no point handing out a radio to a team that doesn't know where it's working yet.",
      title: "Assign the teams and issue the radios",
      cue: "Assign team A to the north stretch and team B to the south stretch, then issue a radio to each team lead.",
      why: "A volunteer crew split into buddy pairs still needs someone in charge of each stretch who can be reached the moment something is wrong, and the radio only means anything once both teams actually know which stretch is theirs — assigning the ground before handing out the means to call about it is what makes today's headcount possible at all.",
    },
    {
      id: "flat-watch", kind: "track", target: "lead-post", seconds: 6,
      title: "Scan the flat while both teams work",
      cue: "Hold a steady scan across the flat — both teams need to stay in sight of the safety lead's post the whole time they're working.",
      track: { start: 0.13, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "FLAT WATCH", readout: (v) => (v < 0.4 ? "scanning too fast — near team missed" : v > 0.62 ? "scanning too slow — far team missed" : "flat held clean") },
      why: "The safety lead's post exists so both teams are always visible to somebody who isn't also bent over picking up trash, and a scan that rushes past the near stretch or drags past the far one is a watch that would miss exactly the kind of trouble — a fall, a symptom, a wandering buddy pair — this whole post is meant to catch early.",
      holdBreakNote: "The scan lost one of the teams before the sweep finished — steady the watch and pick the pass back up.",
    },
    {
      id: "hydration-hold", kind: "hold", target: "lead-post", seconds: 5,
      title: "Hold the watch through the scheduled break",
      cue: "Hold the post steady while both teams take their scheduled water break — this is when a heat symptom is most likely to actually show.",
      why: "A break is when volunteers finally stop moving and a headache or a wave of nausea they'd been pushing through while working suddenly has room to be noticed, and a safety lead who wanders off during the one part of the shift built for exactly that noticing is a safety lead who finds out about it after the fact instead of during it.",
      holdBreakNote: "The watch broke during the break — get back on post and hold it until both teams are back at work.",
    },
    {
      id: "break-clock", kind: "gauge", target: "break-clock",
      title: "Call the next scheduled break inside the interval",
      cue: "Watch the break clock and call the next water break once it reads inside the scheduled interval — not early, and not late either.",
      gauge: { label: "BREAK INTERVAL", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too early — interval not up yet" : t <= 0.64 ? "inside the interval — call the break" : "past the interval — call it now"), missNote: "Off the band. The scheduled interval the heat plan sets has to actually run its course before the next break is called." },
      why: "A break called too early trains the crew to expect one whenever someone asks, and a break called too late is exactly how a volunteer crosses from thirsty into genuinely heat-stressed before anyone's called a stop — the interval on the plan is the number the whole day's pacing runs against, not a feel for when everyone seems tired.",
    },
    {
      id: "incident-log", kind: "select", target: "safety-log",
      title: "Log the missing-volunteer incident",
      cue: "Log the incident: the time the check-in was missed, the headcount called, and the time the volunteer was found.",
      why: "The sponsoring agency's own incident record is built entirely from entries like this one, and logging it right after resolution — while the exact times are still what actually happened, not what gets remembered back at the check-in table — is the version of today that can actually answer for itself if the agency's volunteer programme is ever asked how it handles exactly this.",
    },
    {
      id: "headcount-closing", kind: "sequence",
      targets: ["all-signed-in", "sharps-sealed", "equipment-returned"],
      itemNames: { "all-signed-in": "every volunteer signed back in", "sharps-sealed": "sharps container sealed", "equipment-returned": "tongs and radios returned and counted" },
      outOfOrderNote: "Confirm every volunteer is signed back in before sealing the sharps container — the day isn't done until the headcount actually matches who arrived.",
      title: "Run the closing headcount in order",
      cue: "Confirm every volunteer is signed back in, seal the sharps container, then return and count the tongs and radios.",
      why: "A headcount that matches on paper but was never actually taken is worth nothing, and a sharps container sealed before the last volunteer is even accounted for is a container sealed on an assumption — the order here is what turns 'everyone's probably fine' into a headcount the sponsoring agency can actually stand behind.",
    },
    {
      id: "crew-checkin", kind: "select", target: "safety-radio",
      title: "Check in with the team leads",
      cue: "On the working channel: the day is closed out, the missing volunteer and the tide surge are both handled, and how both team leads are doing after a shift with two interruptions in it.",
      why: "A shift with a missing volunteer and a tide surge in it is a shift both team leads spent more alert than a normal cleanup day, and the check-in is where that gets acknowledged directly — it's also where the safety lead's own read on a tense day gets a place to go besides staying with them on the drive home.",
    },
    {
      id: "closing-log", kind: "select", target: "safety-log",
      title: "Close out the day's safety log",
      cue: "Close the log: headcount matched, the missing volunteer resolved, the tide recall called, and all equipment returned.",
      why: "The closing entry is what turns today's individual calls into the record the sponsoring agency actually reviews after every cleanup day — a log closed out completely, in order, is the difference between a volunteer programme that can show exactly how it handled a bad afternoon and one that raises a question nobody at the check-in table can answer weeks later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRVC_ACCENT);

    // --------------------------------------------------------- the mud bench
    const marshTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#5a5030", base2: "#453d24" }), { repeat: 3, px: 256 });
    const bench = box(g, 20, 0.06, 18, 0, 0.03, -2, 0x5a5030, { rough: 0.95 });
    bench.material = texturedMat(marshTex, { rough: 0.95, color: 0x9a9068 });

    // ------------------------------------------------------------- the water
    const water = box(g, 24, 0.02, 8, 0, 0.05, -12, 0xffffff, { rough: 0.14, metal: 0.22, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12303e", mid: "#1a4050", crest: 260 }), { repeat: 4, px: 512 }), { rough: 0.14, metal: 0.22, color: 0xa2c4d8 });
    const wave = particles(g, 14, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.28 });
    wave.position.set(0, 0.06, -12);
    const waterHome = water.position.clone();

    // -------------------------------------------------------- the debris haul skiff
    const sk = skiff(g, -6.4, 0, 3.8, { ry: 1.6, livery: { fleetName: "BAY MONITOR", unitNumber: "MM-2" } });
    holoTag(sk, "debris haul skiff — beached", 0, 1.3, 0, { css: BRVC_CSS, w: 0.44 });

    // -------------------------------------------------------------- crew figures
    const teamLeadA = standingFigure(g, 2.2, -3.6, { ry: -1.9, cloth: 0x3f4a55, vest: 0xe8b02e, helmet: false, cap: 0x2b3138, gloves: true, atStation: true });
    holoTag(teamLeadA, "team A lead", 0, 1.95, 0, { css: BRVC_CSS, w: 0.28 });
    const teamLeadB = standingFigure(g, -2.0, -5.4, { ry: 1.7, cloth: 0x3f4a55, vest: 0xe8b02e, helmet: false, cap: 0x2b3138, gloves: true, atStation: true });
    holoTag(teamLeadB, "team B lead", 0, 1.95, 0, { css: BRVC_CSS, w: 0.28 });
    const volunteer1 = standingFigure(g, 3.0, -3.0, { cloth: 0x8a6a4a, vest: false, atStation: true });
    void volunteer1;

    // --------------------------------------------------------------- the buddy figure
    const buddyGrp = group(g, 1.6, 0, 1.2, -2.4);
    const buddy = standingFigure(buddyGrp, 0, 0, { cloth: 0x6a7a5a, vest: false, atStation: true });
    void buddy;
    const buddyHome = buddyGrp.position.clone();

    // ---------------------------------------------------------- the lost volunteer, hidden
    const lostGrp = group(g, -8.0, 0, -6.5, 2.1);
    const lostFigure = standingFigure(lostGrp, 0, 0, { cloth: 0x6a5a8a, vest: false, atStation: true });
    void lostFigure;
    lostGrp.visible = false;
    const lostFoundSpot = new THREE.Vector3(1.8, 0, 0.9);

    // --------------------------------------------------------------- debris pile
    const debrisGrp = group(g, 1.4, 0.05, -0.6);
    for (let i = 0; i < 10; i++) {
      const dx = (Math.random() - 0.5) * 1.0, dz = (Math.random() - 0.5) * 0.7;
      box(debrisGrp, 0.1 + Math.random() * 0.1, 0.06, 0.08 + Math.random() * 0.1, dx, 0.03, dz, [0x8a8478, 0x6a6458, 0x9a9488][i % 3], { rough: 0.85 });
    }
    const needle = box(debrisGrp, 0.12, 0.006, 0.006, -0.2, 0.05, 0.15, 0xc8ced4, { rough: 0.3, metal: 0.4, cast: false });
    reg(hits, needle, "loose-needle");
    const drum = cyl(g, 0.28, 0.28, 0.55, 2.6, 0.275, -1.2, 0x7a3a2a, { rough: 0.75, metal: 0.35, seg: 14 });
    reg(hits, drum, "unmarked-drum");

    // --------------------------------------------------------------- the boards
    const briefingBoard = holoPanel(g, 0.94, 0.62, -1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRVC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("SAFETY BRIEFING — TODAY", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d0";
      ["Sharps: tongs only, never bare hands", "Buddy system: no lone work, ever", "Heat symptoms: stop and report immediately",
        "Tide: off the flat when the window closes", "Confirm before the crew starts"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.24 + i * 0.13)));
    }, { ry: 0.5, accent: BRVC_ACCENT });
    reg(hits, briefingBoard, "safety-briefing-board");

    const ppeBoard = holoPanel(g, 0.94, 0.62, 1.9, 1.65, -0.85, (cx, w, h) => {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRVC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("PPE TABLE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d0";
      ["Sharps / glass: puncture-resistant gloves + tongs", "Ordinary debris: work gloves", "Everyone: closed-toe boots, hat, sunscreen"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.3 + i * 0.16)));
    }, { ry: -0.5, accent: BRVC_ACCENT });
    reg(hits, ppeBoard, "ppe-table");

    const tideBoard = holoPanel(g, 0.68, 0.5, -1.1, 1.15, 0.85, (cx, w, h) => {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRVC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("TIDE TABLE — TODAY", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d0";
      ["Low window: per NOAA prediction", "Water returns: per the table", "Recall the crew before the window closes"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.17)));
    }, { ry: 0.5, accent: BRVC_ACCENT });
    reg(hits, tideBoard, "tide-board");

    const heatBoard = holoPanel(g, 0.68, 0.5, 1.1, 1.15, 0.85, (cx, w, h) => {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRVC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("HEAT ILLNESS PLAN", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = "#f0e6d0";
      ["Water and shade available at all times", "Breaks on the scheduled interval", "Any symptom: stop, shade, water, report"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.17)));
    }, { ry: -0.5, accent: BRVC_ACCENT });
    reg(hits, heatBoard, "heat-plan-board");

    // ------------------------------------------------------------ sharps handling
    const sharpsTongs = group(g, -0.9, 0.05, 0.4, 0.3);
    cyl(sharpsTongs, 0.012, 0.012, 0.34, 0, 0.17, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 8 });
    box(sharpsTongs, 0.06, 0.03, 0.02, 0, 0.34, 0, 0x8a949d, { rough: 0.4, metal: 0.5 });
    holoTag(sharpsTongs, "sharps tongs", 0, 0.44, 0, { css: BRVC_CSS, w: 0.26 });
    reg(hits, sharpsTongs, "sharps-tongs");
    const tongsHome = sharpsTongs.position.clone();
    const sharpsContainer = box(g, 0.18, 0.28, 0.18, -1.3, 0.14, 0.6, BRVC_RED, { rough: 0.5, metal: 0.3 });
    box(g, 0.2, 0.03, 0.2, -1.3, 0.29, 0.6, 0x2b3138, { rough: 0.5 });
    holoTag(sharpsContainer, "sharps container", 0, 0.28, 0, { css: BRVC_CSS, w: 0.3 });
    const sharpsSocket = group(g, -1.3, 0.2, 0.6);
    hits["sharps-container-socket"] = sharpsSocket;

    const bareHandHazard = box(g, 0.4, 0.4, 0.3, -0.4, 0.4, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab the sharp bare-handed?", -0.4, 0.75, 0.9, { css: "#e8622a", w: 0.48 });
    reg(hits, bareHandHazard, "pick-up-sharps-bare-hand");

    // ------------------------------------------------------------ radios & post
    const safetyRadio = radio(g, 0.6, 0.85, 1.55, { ry: -0.4 });
    holoTag(g, "safety channel radio", 0.6, 1.1, 1.57, { css: BRVC_CSS, w: 0.34 });
    reg(hits, safetyRadio, "safety-radio");

    const leadPost = group(g, 0, 1.0, 1.9);
    cyl(leadPost, 0.03, 0.03, 0.9, 0, -0.45, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
    box(leadPost, 0.1, 0.06, 0.08, 0, 0.05, 0, 0x1b1e23, { rough: 0.4, metal: 0.5 });
    holoTag(leadPost, "safety lead's post", 0, 0.2, 0, { css: BRVC_CSS, w: 0.32 });
    reg(hits, leadPost, "lead-post");

    const lostHazard = box(g, 0.4, 0.4, 0.3, -2.4, 0.5, -2.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let a volunteer work alone?", -2.4, 0.9, -2.6, { css: "#e8622a", w: 0.5 });
    reg(hits, lostHazard, "skip-buddy-system");

    const pushHazard = box(g, 0.4, 0.4, 0.3, 2.6, 0.5, -3.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep them working through the symptoms?", 2.6, 0.9, -3.2, { css: "#e8622a", w: 0.58 });
    reg(hits, pushHazard, "push-through-heat-symptoms");

    const ignoreTideHazard = box(g, 0.4, 0.4, 0.3, -1.8, 0.5, -3.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "keep working past the window?", -1.8, 0.9, -3.5, { css: "#e8622a", w: 0.5 });
    reg(hits, ignoreTideHazard, "ignore-incoming-tide");

    const breakClock = instrument(g, 1.4, 0.86, 1.6, { color: 0x2b3138, idle: "0 min", w: 0.1, d: 0.14 });
    holoTag(breakClock, "break interval", 0, 0.16, 0.05, { css: BRVC_CSS, w: 0.3 });
    reg(hits, breakClock, "break-clock");

    const safetyLog = holoPanel(g, 0.68, 0.5, 1.9, 1.15, 1.1, (cx, w, h) => drawLog(cx, w, h, ["Briefing: —", "Sharps: —", "Headcount: —", "Tide: —"], false), { ry: -0.5, accent: BRVC_ACCENT });
    function drawLog(cx, w, h, rows, done) {
      cx.fillStyle = "#1a140a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRVC_GREEN : BRVC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f6ecd8"; cx.fillText("SAFETY LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#f0e6d0";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, safetyLog, "safety-log");

    // -------------------------------------------------------------- crew assignment markers
    const teamAMarker = group(g, 2.2, 1.4, -3.3);
    box(teamAMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, teamAMarker, "team-a-assigned");
    const teamBMarker = group(g, -2.0, 1.4, -4.6);
    box(teamBMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, teamBMarker, "team-b-assigned");
    const radiosMarker = group(g, 0.9, 0.4, 1.3);
    box(radiosMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, radiosMarker, "radios-issued");

    // -------------------------------------------------------------- recall horn
    const recallHorn = group(g, -1.6, 0.9, 1.9);
    cyl(recallHorn, 0.05, 0.1, 0.2, 0, 0, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const hornBeacon = ball(recallHorn, 0.03, 0, 0.15, 0, BRVC_GREEN, { emissive: BRVC_GREEN, ei: 1.6, seg: 10 });
    holoTag(recallHorn, "recall horn", 0, 0.2, 0, { css: BRVC_CSS, w: 0.26 });
    reg(hits, recallHorn, "recall-horn");
    const tideFlagPole = group(g, -1.9, 0, 2.1);
    cyl(tideFlagPole, 0.015, 0.015, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const tideFlag = box(tideFlagPole, 0.12, 0.08, 0.006, 0.07, 0.2, 0, BRVC_GREEN, { rough: 0.6, cast: false });

    // -------------------------------------------------------------- closing gear
    const boots = box(g, 0.16, 0.14, 0.28, 2.3, 0.07, 1.5, 0x2b3138, { rough: 0.7 });
    reg(hits, boots, "boots-on");
    const glovesRack = group(g, 2.0, 0.7, 1.5);
    box(glovesRack, 0.1, 0.04, 0.16, 0, 0, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(glovesRack, "work gloves", 0, 0.1, 0, { css: BRVC_CSS, w: 0.24 });
    reg(hits, glovesRack, "gloves-on");
    const hatRack = group(g, 2.3, 0.7, 1.2);
    ball(hatRack, 0.14, 0, 0, 0, 0xd9cbb2, { rough: 0.7, seg: 12 }).scale.y = 0.5;
    holoTag(hatRack, "sun hat & sunscreen", 0, 0.16, 0, { css: BRVC_CSS, w: 0.34 });
    reg(hits, hatRack, "hat-sunscreen");

    const signedInMarker = group(g, 1.6, 0.9, 1.7);
    box(signedInMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, signedInMarker, "all-signed-in");
    const sharpsSealedMarker = group(g, -1.3, 0.3, 0.65);
    box(sharpsSealedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, sharpsSealedMarker, "sharps-sealed");
    const equipmentMarker = group(g, 0.5, 0.4, 1.4);
    box(equipmentMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, equipmentMarker, "equipment-returned");

    const waterTex = water.material.map;
    let surging = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-gear") { needle.visible = false; }
        if (step.id === "sharps-tongs") { sharpsTongs.position.copy(sharpsSocket.position); needle.visible = false; }
        if (step.id === "crew-assignment") { safetyRadio.userData.show?.("TEAMS\nASSIGNED"); }
        if (step.id === "incident-log") {
          repaint(safetyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Briefing: given, sharps & buddy covered", "Sharps: tonged, container sealed later", "Headcount: volunteer found and logged", "Tide: window open"], false));
        }
        if (step.id === "crew-checkin") { safetyRadio.userData.show?.("DAY OK\nBOTH HANDLED"); }
        if (step.id === "closing-log") {
          repaint(safetyLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Briefing: covered, held all day", "Sharps: contained, container sealed", "Headcount: matched, volunteer found", "Tide: recalled ahead of the surge"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "volunteer-lost") { lostGrp.visible = true; }
        if (it.id === "incoming-tide-surge") {
          surging = true;
          hornBeacon.material = mat(BRVC_RED, { emissive: BRVC_RED, ei: 2.2 });
          tideFlag.position.y = 0.85;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "volunteer-lost") { lostGrp.position.copy(lostFoundSpot); buddyGrp.position.copy(lostFoundSpot); }
        if (it.id === "incoming-tide-surge") {
          surging = false;
          hornBeacon.material = mat(BRVC_GREEN, { emissive: BRVC_GREEN, ei: 1.6 });
          tideFlag.position.y = 0.2;
        }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.06, -12), 1.1, 0.28, -0.1);
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.006; }
        water.position.y = waterHome.y + (surging ? Math.sin(t * 2) * 0.02 + 0.04 : 0);
        if (lostGrp.visible && lostGrp.position.distanceTo(lostFoundSpot) > 0.3) lostGrp.rotation.y += dt * 0.2;
        const step = session?.step;
        if (session?.gauge && !session.gauge.committed && step?.id === "break-clock") {
          const gt = session.gauge.t ?? 0;
          repaint(breakClock.userData.screen, signFace(`${Math.round(gt * 6)} min`, { bg: "#0d1c24", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
        void tongsHome;
      },
    };
  },
};
