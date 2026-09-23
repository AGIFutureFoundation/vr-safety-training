import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, counter, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ After-Action Review VR — Emergency Services, outbreak
// response, the last station. The facilitated review once the outbreak is
// declared over, run the way WHO describes an after-action review: the right
// people in the room, no blame and no rank, a timeline built from the record,
// its gaps found, what was planned set against what actually happened, the
// frontline heard first, priorities voted not assigned, the community's
// interpreter kept up with, every action given an owner and a date, and the
// report shared with the Health Cluster. No real response is reviewed; the
// timeline is the generic arc of the programme's own ten stations.

const WAR_ACCENT = 0x9ac46a;
const WAR_ALERT = 0xf0645b;

function warBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(12,20,8,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#9ac46a"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#eef6e4"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#d4e6c0";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WAR_ACCENT });
}

export const SIM_WHO_AFTER_ACTION_REVIEW = {
  id: "who-after-action-review",
  index: "226",
  domain: "Emergency Services",
  trade: "AAR facilitator — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  indoor: "service",
  weather: "clear",
  certification: "WHO after-action review practice — a facilitated, no-blame review of what was planned, what actually happened, what went well and what should change, with actions owned and dated — as the national authority runs it after an outbreak; WHO infection prevention and control guidance and CDC isolation precautions as the benchmarks the clinical findings are read against; OSHA 29 CFR 1910.1030 and 29 CFR 1910.134 for the worker-safety findings; WHO outbreak communication guidance for the community-engagement findings and for how the report is shared; the Sphere Handbook's core commitments on learning and improvement and IASC cluster coordination for sharing it with the Health Cluster; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
  name: "After-Action Review",
  title: simTitle("After-Action Review"),
  tagline: "The review once the outbreak is over: the right people in the room, no blame and no rank, a timeline from the record, planned against actual, the frontline heard first, every action with an owner and a date, and the report shared",
  accent: WAR_ACCENT,
  accentCss: "#9ac46a",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "lessons-owned", name: "Lessons Owned", note: "The frontline heard first, nobody blamed by name, and every lesson turned into an action with an owner and a date" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Review Room",
    currency: "LESSON",
    ranks: ["Note-taker", "Co-facilitator", "Facilitator", "Lead Facilitator", "Review Room Certified"],
    badges: [
      { id: "timeline-true", name: "Timeline True", note: "The timeline laid in order first time", test: AWARD.stepClean("timeline") },
      { id: "no-blame", name: "No Blame", note: "No name blamed, no floor closed early, no vague action, no rumour as a finding", test: AWARD.safe },
      { id: "vote-read", name: "Vote Read", note: "Priority committed to match the vote", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-review", name: "Clean Review", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "balanced-room", name: "Balanced Room", note: "Talking time kept balanced without a dropout", test: AWARD.unbroken },
      { id: "eight-straight", name: "Eight Straight", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "war-name-blame": "You wrote the laboratory driver's name on the board as the cause of the specimen delay. An after-action review looks at systems — why the transport plan had no backup vehicle — not at the person nearest the failure; a name on the board ends honest talk in the room and teaches every frontline worker that the review is a trial.",
    "war-skip-frontline": "You moved to close the discussion before the ward nurses and the community representative had spoken. The people nearest the work see the gaps managers never hear about, and a review that closes after the senior voices have spoken records the version of events the organisation already believed.",
    "war-vague-action": "You pinned up 'improve communication' as an action with no owner and no date. An action nobody owns is a wish; it will be on the next review's board in the same words. Every action says what will change, who will do it and by when.",
    "war-rumour-finding": "You entered a story a participant had heard second-hand as a finding. Findings come from the record and from people who saw it — a rumour written into the report is repeated to every partner who reads it, and it is the report's credibility that pays when it proves untrue.",
  },

  lateNotes: {
    "war-card-actual": "Set what actually happened against the plan once the timeline is laid and its gaps are found — there is nothing to compare before that.",
    "war-vote-dial": "Commit a priority once the room has discussed why the gap happened; a vote on a problem nobody has explained is a guess.",
  },

  steps: [
    {
      id: "invite-list", kind: "select", target: "war-invite-list",
      title: "Check who is in the room",
      cue: "Check the attendance against the invite list: ward nurses, tracers, burial and WASH teams, the community representative and partners — not only managers.",
      why: "A review can only learn from the people in it. If the room holds only coordinators, it will learn what coordinators already knew; the frontline teams, the community representative and the partners who worked alongside them are the people who saw the response from the angles that matter most.",
    },
    {
      id: "screen-crank", kind: "turn", target: "war-screen-crank",
      title: "Lower the timeline screen",
      cue: "Crank the screen down so the whole room can see the timeline from every seat.",
      why: "A timeline only one side of the room can read becomes one side's timeline. Putting it where everybody can see it — including the people at the back who were in the field — makes the shared record the thing the conversation is about, rather than whoever is standing nearest to it.",
      turn: { turns: 1, axis: "z", label: "SCREEN" },
    },
    {
      id: "ground-rules", kind: "select", target: "war-ground-rules",
      title: "Read the ground rules aloud",
      cue: "Read the rules to the room: no blame, no rank, what is said here stays here, and every voice counts once.",
      why: "People will only say what went wrong if they are sure it will not be used against them or their colleagues. The ground rules, read aloud at the start and held to all day, are what make the review a place for learning rather than a hearing — and they give the facilitator something to point to when the room forgets them.",
    },
    {
      id: "timeline", kind: "sequence",
      targets: ["war-tl-alert", "war-tl-verify", "war-tl-scale", "war-tl-close"],
      itemNames: { "war-tl-alert": "first alert", "war-tl-verify": "signal verified", "war-tl-scale": "response scaled up", "war-tl-close": "outbreak declared over" },
      title: "Lay the timeline in order",
      cue: "Place the cards in order: first alert, signal verified, response scaled up, outbreak declared over.",
      why: "A timeline built from the surveillance record, the logs and the reports is the shared account everyone argues from. Laid in order, it shows where the delays sat between one milestone and the next — which is usually where the review's most useful findings are.",
      outOfOrderNote: "Alert, verified, scaled up, declared over — the timeline follows what happened when.",
    },
    {
      id: "timeline-gaps", kind: "find", noHint: true,
      targets: ["war-gap-lab", "war-gap-supply"],
      itemNames: { "war-gap-lab": "the unexplained lab delay", "war-gap-supply": "the PPE stock-out" },
      itemNotes: {
        "war-gap-lab": "Four days between the first specimen and its result, with nothing on the record to say why.",
        "war-gap-supply": "A week where the doffing logs show gloves ran out and the supply report shows none requested.",
      },
      title: "Find the gaps in the record",
      cue: "Look along the timeline and pick out the stretches the record does not explain.",
      why: "The interesting parts of a response are the parts nobody wrote down: the days a specimen sat somewhere, the week the gloves ran out without anyone asking for more. Finding those gaps before the discussion starts is what gives the room specific questions to answer instead of general impressions to trade.",
    },
    {
      id: "planned-vs-actual", kind: "drag", target: "war-card-actual",
      title: "Set what happened against what was planned",
      cue: "Carry the card describing what actually happened with specimen transport and place it beside the plan's card.",
      why: "The core question of an after-action review is the difference between what was planned and what actually happened. Placing the two side by side for each gap makes that difference concrete, and it moves the discussion from who got it wrong to why the plan and the reality came apart.",
      drag: { to: "war-gap-socket", radius: 0.45, missNote: "Not beside the plan. Put what happened next to what was planned, so the room can see the gap." },
    },
    {
      id: "frontline-first", kind: "hold", target: "war-facilitator-mic", seconds: 5,
      title: "Hear the frontline first",
      cue: "Hand the microphone to the ward nurses and tracers first, and hold while they explain the gap in their own words.",
      why: "Managers speak easily in rooms like this and frontline staff often do not; if the managers go first, the frontline tends to agree rather than contradict. Hearing the people who did the work first puts their account on the record before anyone has framed it for them.",
      holdBreakNote: "You took the microphone back before they had finished. Hand it back and let them finish in their own words.",
    },
    {
      id: "priority", kind: "gauge", target: "war-vote-dial",
      title: "Commit the priority from the vote",
      cue: "Sweep the dial and commit when it matches the dot-vote tally on the board: 14 dots.",
      why: "Priorities chosen by the most senior person in the room reflect that person's view of the response. A dot vote lets everybody who worked it weigh the gaps equally, and the facilitator's job is to record what the room decided — the tally on the board — not to round it toward what the organisation would prefer.",
      gauge: { label: "DOTS", speed: 0.6, green: [0.675, 0.724], readout: (t) => `${Math.round(t * 20)} dots`, missNote: "That is not the tally. Commit the number of dots the room actually placed — 14." },
    },
    {
      id: "talk-time", kind: "track", target: "war-talk-meter", seconds: 7,
      title: "Keep the talking time balanced",
      cue: "Watch the talking-time meter as the discussion runs, and keep it in the balanced band.",
      why: "In any review a few voices fill the time unless someone watches for it. A facilitator keeping an eye on who has spoken — and drawing in the ones who have not — is how the review hears from the burial team and the community representative, not just the loudest coordinator.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "TALK TIME", readout: (v) => (v < 0.4 ? "room going quiet" : v > 0.62 ? "one voice dominating" : "balanced") },
      holdBreakNote: "The discussion tipped out of balance. Draw in the voices you have not heard yet.",
    },
    {
      id: "action-cards", kind: "sequence", anyOrder: true,
      targets: ["war-act-what", "war-act-who", "war-act-when"],
      itemNames: { "war-act-what": "what will change", "war-act-who": "who owns it", "war-act-when": "by when" },
      title: "Write the action properly",
      cue: "Fill in the action card: what will change, who owns it, and by when — any order, all three.",
      why: "A lesson becomes an improvement only when someone is responsible for it and there is a date to check it against. Writing all three on every card — the change, the owner, the deadline — is what lets the next review ask whether it happened, instead of rediscovering the same gap.",
    },
    {
      id: "share-report", kind: "select", target: "war-report-tray",
      title: "Share the report with the Health Cluster",
      cue: "Place the agreed report in the tray for the national authority and the Health Cluster coordinator.",
      why: "A review kept in one office improves one office. Sharing the report through the Health Cluster, under IASC cluster coordination, lets every partner who worked the response take its lessons into their own plans — and feeds the national authority's preparation for the next outbreak.",
    },
    {
      id: "crew-checkin", kind: "select", target: "war-crew-board",
      title: "Check in with the people in the room",
      cue: "Before everyone leaves, check in on how the day and the whole response sat with them, and point them to staff care.",
      why: "An after-action review asks people to relive the hardest weeks of their working lives, often the first time they have looked back at it at all. Checking in before they leave — and making sure every person knows where staff care is — is the last duty of care the response owes the people who carried it.",
    },
    {
      id: "closing-log", kind: "hold", target: "war-aar-log", seconds: 4,
      title: "Close the review log",
      cue: "Hold the review log open and read back the findings, the actions, their owners and dates before you sign.",
      why: "The review log is the record the next review will be measured against. Read back to the room before it is signed, every owner hears their name next to their action; signed without reading, the actions become someone else's problem the moment people walk out of the door.",
      holdBreakNote: "You signed without reading it back. Open the log and read the actions and owners to the room first.",
    },
  ],

  interrupts: [
    {
      id: "manager-blames",
      kind: "Blame in the room",
      after: "frontline-first", delay: 2, seconds: 13,
      alert: "A senior manager stands up mid-account and says the delay was the driver's fault and everyone knows it.",
      cue: "Raise the ground-rules card — no blame, no rank — and bring the room back to the system.",
      target: "war-rules-card",
      why: "The first blame spoken in a review decides what everyone else is willing to say. Stopping it at once, by pointing to the rules the room agreed, protects the person being blamed and keeps the review on why the system failed, which is the only question that produces a fix.",
      missNote: "The blame went unchallenged. The frontline staff stopped talking about what went wrong, and the report ended up describing a driver instead of a transport plan with no backup.",
      wrongNote: "Not that. Raise the ground-rules card and bring the room back to the system.",
    },
    {
      id: "interpreter-behind",
      kind: "Interpretation lagging",
      after: "talk-time", delay: 3, seconds: 13,
      alert: "The interpreter's lamp is flashing: the community representative has lost the thread and the discussion has run on without her.",
      cue: "Pause the room at the interpreter's booth until interpretation catches up.",
      target: "war-interpreter-booth",
      why: "The community representative's view is one of the reasons she is in the room, and she cannot give it on a discussion she cannot follow. Pausing until interpretation catches up costs the room a minute and gives the review the one perspective nobody else in it can supply.",
      missNote: "The discussion ran on. The community representative sat silent through the section on community engagement, and the report recorded no community view on the one topic she was invited to speak to.",
      wrongNote: "Not that. Pause the room at the interpreter's booth until she has caught up.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -1.9);
    stationPad(g, 2.4, WAR_ACCENT);

    // ---------------------------------------------------------- meeting room
    const floor = box(g, 5.8, 0.04, 4.8, 0, 0.02, 0, 0xffffff, { rough: 0.8 });
    floor.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 9, base: "#5a6a6e", base2: "#52626a", seam: "rgba(20,28,32,0.45)" }), { repeat: 4, px: 512 }),
      { rough: 0.85, metal: 0.02, color: 0xc4d0d2 },
    );
    box(g, 5.8, 2.6, 0.12, 0, 1.3, -2.4, 0xdadfdc, { rough: 0.9 });
    // Projection screen on a crank.
    const screenBox = box(g, 2.2, 0.12, 0.14, 0, 2.45, -2.25, 0x2b3236, { rough: 0.5 });
    void screenBox;
    const screen = box(g, 2.0, 1.2, 0.01, 0, 2.4, -2.22, 0xf4f6f5, { rough: 0.6 });
    screen.scale.set(1, 0.08, 1);
    const crank = cyl(g, 0.03, 0.03, 0.08, 1.25, 1.2, -2.25, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    crank.rotation.x = Math.PI / 2;
    holoTag(g, "Screen crank", 1.25, 1.4, -2.2, { css: "#9ac46a", w: 0.24 });
    reg(hits, crank, "war-screen-crank");

    // Timeline strip along the back wall.
    const strip = group(g, 0, 1.3, -2.3);
    box(strip, 3.4, 0.02, 0.02, 0, 0, 0.02, 0x9ac46a, { emissive: 0x9ac46a, ei: 0.4, rough: 0.5 });
    const tl = [["war-tl-alert", -1.4, "ALERT"], ["war-tl-verify", -0.5, "VERIFIED"], ["war-tl-scale", 0.4, "SCALED UP"], ["war-tl-close", 1.3, "DECLARED OVER"]];
    const tlCards = {};
    for (const [id, x, label] of tl) {
      const c = decal(strip, 0.34, 0.2, x, 0.16, 0.04, signFace(label, { bg: "#0c1408", accent: "#9ac46a", scale: 0.36 }), { px: 160 });
      tlCards[id] = c;
      reg(hits, c, id);
    }
    const gapLab = box(strip, 0.5, 0.1, 0.02, -0.95, -0.12, 0.04, WAR_ALERT, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, gapLab, "war-gap-lab");
    const gapSupply = box(strip, 0.5, 0.1, 0.02, 0.85, -0.12, 0.04, 0xf2c14b, { opacity: 0.35, transparent: true, cast: false });
    reg(hits, gapSupply, "war-gap-supply");

    // Planned vs actual board, left.
    const pva = group(g, -2.0, 0, -1.9, 0.5);
    box(pva, 1.0, 0.8, 0.03, 0, 1.45, 0, 0xf4f6f5, { rough: 0.4 });
    decal(pva, 0.44, 0.3, -0.24, 1.55, 0.02, paperFace("PLANNED", ["Specimen to lab", "same day, backup car"], { band: "#3a5a2a" }), { px: 192 });
    const pvaSocket = box(pva, 0.44, 0.3, 0.02, 0.24, 1.55, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["war-gap-socket"] = pvaSocket;
    holoTag(pva, "Planned vs actual", 0, 1.95, 0.03, { css: "#9ac46a", w: 0.3 });
    const blame = group(pva, 0.2, 1.15, 0.03);
    box(blame, 0.22, 0.08, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.8 });
    holoTag(blame, "Write the driver's name?", 0, -0.1, 0.01, { css: "#f0645b", w: 0.38 });
    reg(hits, blame, "war-name-blame");

    // Ground rules and invite list, right wall.
    const rules = warBoard(g, 0.8, 0.52, 2.2, 1.55, -1.7, "GROUND RULES", [
      "No blame. Systems, not people.", "No rank in this room.", "What is said here stays here.", "Every voice counts once.",
    ], { ry: -Math.PI / 3.5 });
    reg(hits, rules, "war-ground-rules");
    const invite = decal(g, 0.3, 0.4, 2.55, 1.35, -0.8, paperFace("INVITE LIST", ["Ward nurses · tracers", "Burial · WASH teams", "Community rep", "Partners · managers"], { band: "#3a5a2a" }), { px: 256 });
    invite.rotation.y = -Math.PI / 2;
    reg(hits, invite, "war-invite-list");

    // ---------------------------------------------------------- the table
    const table = counter(g, 2.4, 1.0, 0, -0.5, 0x8a7a64, { ry: 0 });
    void table;
    const actual = group(g, -0.7, 0.79, -0.3);
    box(actual, 0.24, 0.01, 0.16, 0, 0, 0, 0xf2e6b0, { rough: 0.8 });
    holoTag(actual, "What actually happened", 0, 0.1, 0, { css: "#9ac46a", w: 0.36 });
    reg(hits, actual, "war-card-actual");
    const mic = group(g, -0.2, 0.79, -0.7);
    cyl(mic, 0.02, 0.02, 0.18, 0, 0.09, 0, 0x2b3236, { rough: 0.5, seg: 8 });
    ball(mic, 0.03, 0, 0.2, 0, 0x2b3236, { rough: 0.5 });
    holoTag(mic, "Facilitator mic", 0, 0.34, 0, { css: "#9ac46a", w: 0.26 });
    reg(hits, mic, "war-facilitator-mic");
    const rulesCard = group(g, 0.25, 0.79, -0.75);
    box(rulesCard, 0.14, 0.01, 0.1, 0, 0, 0, 0x9ac46a, { rough: 0.6 });
    holoTag(rulesCard, "Ground-rules card", 0, 0.1, 0, { css: "#9ac46a", w: 0.28 });
    reg(hits, rulesCard, "war-rules-card");
    const raised = box(g, 0.2, 0.14, 0.01, 0.25, 1.5, -0.75, WAR_ALERT, { emissive: WAR_ALERT, ei: 0.8, rough: 0.5 });
    raised.visible = false;
    const dial = instrument(g, 0.6, 0.8, -0.3, { idle: "-- dots", color: WAR_ACCENT, w: 0.14, d: 0.2 });
    holoTag(dial, "Vote dial", 0, 0.14, 0, { css: "#9ac46a", w: 0.2 });
    reg(hits, dial, "war-vote-dial");
    const meter = instrument(g, 0.95, 0.8, -0.7, { idle: "TALK", color: WAR_ACCENT, w: 0.14, d: 0.2 });
    holoTag(meter, "Talking-time meter", 0, 0.14, 0, { css: "#9ac46a", w: 0.3 });
    reg(hits, meter, "war-talk-meter");
    const acts = [["war-act-what", "WHAT", -0.35], ["war-act-who", "WHO OWNS", -0.1], ["war-act-when", "BY WHEN", 0.15]];
    for (const [id, label, x] of acts) {
      const c = decal(g, 0.2, 0.12, x, 0.791, -0.25, signFace(label, { bg: "#0c1408", accent: "#9ac46a", scale: 0.4 }), { px: 128 });
      c.rotation.x = -Math.PI / 2;
      reg(hits, c, id);
    }
    const vague = group(g, 1.0, 0.79, -0.25);
    box(vague, 0.16, 0.01, 0.12, 0, 0, 0, 0xf2c14b, { rough: 0.8 });
    holoTag(vague, "\"Improve communication\"?", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, vague, "war-vague-action");
    const rumour = group(g, -1.05, 0.79, -0.75);
    box(rumour, 0.16, 0.01, 0.12, 0, 0, 0, 0xe8e0d0, { rough: 0.8 });
    holoTag(rumour, "Heard it second-hand — add it?", 0, 0.1, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, rumour, "war-rumour-finding");
    const wrap = group(g, -1.0, 0.79, -0.3);
    box(wrap, 0.12, 0.03, 0.08, 0, 0.015, 0, WAR_ALERT, { rough: 0.5 });
    holoTag(wrap, "Wrap up now?", 0, 0.12, 0, { css: "#f0645b", w: 0.24 });
    reg(hits, wrap, "war-skip-frontline");
    const tray = group(g, 1.05, 0.79, -0.85);
    box(tray, 0.26, 0.04, 0.2, 0, 0.02, 0, 0x2b3236, { rough: 0.6 });
    const report = box(tray, 0.2, 0.02, 0.26, 0, 0.05, 0, 0xf4f6f5, { rough: 0.8 });
    report.visible = false;
    holoTag(tray, "Report tray", 0, 0.16, 0, { css: "#9ac46a", w: 0.22 });
    reg(hits, tray, "war-report-tray");

    // ---------------------------------------------------------- people around the table
    const seats = [[-0.9, -1.3, 0x7fb8d8], [-0.3, -1.3, 0xf4f6f5], [0.3, -1.3, 0x4f9fd0], [0.9, -1.3, 0xe0a84a]];
    for (const [sx, sz, c] of seats) seatedFigure(g, sx, 0.46, sz, { cloth: c, ry: 0 });
    const manager = standingFigure(g, 1.6, 0.5, { ry: -2.4, cloth: 0x2a2a3a, atStation: true });
    const communityRep = seatedFigure(g, -1.5, 0.46, 0.1, { cloth: 0xc98ad8, ry: Math.PI * 0.8 });
    void communityRep;
    const booth = group(g, -2.3, 0, 0.6);
    box(booth, 0.7, 1.2, 0.6, 0, 0.6, 0, 0x6a7a8a, { rough: 0.6 });
    box(booth, 0.5, 0.35, 0.02, 0, 1.0, 0.31, 0x9fc6d6, { rough: 0.1, opacity: 0.5, transparent: true, cast: false });
    const boothLamp = ball(booth, 0.04, 0, 1.3, 0.2, WAR_ALERT, { emissive: WAR_ALERT, ei: 2.4, rough: 0.4 });
    boothLamp.visible = false;
    holoTag(booth, "Interpreter booth", 0, 1.5, 0.3, { css: "#9ac46a", w: 0.28 });
    reg(hits, booth, "war-interpreter-booth");
    standingFigure(g, -1.1, -1.9, { ry: 0.3, cloth: 0x37505f, vest: WAR_ACCENT, atStation: true });

    // Boards.
    const crewBoard = warBoard(g, 0.6, 0.4, -2.55, 1.6, 1.5, "BEFORE YOU GO", ["How did today sit?", "How did the response sit?", "Staff care: where and when"], { ry: Math.PI / 2.4, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "war-crew-board");
    const aarLog = warBoard(g, 0.55, 0.4, 2.5, 1.55, 0.6, "REVIEW LOG", ["Findings", "Actions · owners · dates", "Shared with"], { ry: -Math.PI / 2.4 });
    reg(hits, aarLog, "war-aar-log");
    // Dressing: water, flip chart, chairs along the wall.
    const flip = group(g, 1.9, 0, -0.9);
    for (const lx of [-0.25, 0.25]) cyl(flip, 0.015, 0.015, 1.5, lx, 0.75, 0, CITY.darkSteel, { rough: 0.5, seg: 6 });
    box(flip, 0.6, 0.8, 0.02, 0, 1.3, 0.02, 0xf4f2ea, { rough: 0.8 });
    const dotBoard = decal(flip, 0.54, 0.7, 0, 1.3, 0.035, (cx, w, h) => {
      cx.fillStyle = "#f4f2ea"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1d262e"; cx.font = `600 ${Math.round(h * 0.07)}px Arial`; cx.fillText("DOT VOTE", w * 0.08, h * 0.1);
      const rows = [["Lab transport", 14], ["PPE supply", 9], ["Rumour loop", 6]];
      rows.forEach(([label, n], i) => {
        cx.fillStyle = "#1d262e"; cx.font = `${Math.round(h * 0.055)}px Arial`; cx.fillText(`${label} — ${n}`, w * 0.08, h * (0.25 + i * 0.25));
        for (let d = 0; d < n; d++) { cx.fillStyle = "#d8232a"; cx.beginPath(); cx.arc(w * (0.1 + (d % 10) * 0.08), h * (0.33 + i * 0.25 + Math.floor(d / 10) * 0.05), w * 0.022, 0, Math.PI * 2); cx.fill(); }
      });
    }, { px: 256 });
    void dotBoard;
    for (let i = 0; i < 4; i++) {
      const ch = group(g, -1.5 + i * 0.7, 0, 1.9);
      box(ch, 0.4, 0.05, 0.4, 0, 0.45, 0, 0x2b3236, { rough: 0.6 });
      box(ch, 0.4, 0.45, 0.05, 0, 0.7, 0.18, 0x2b3236, { rough: 0.6 });
    }
    const water = group(g, 2.5, 0, 1.7);
    cyl(water, 0.14, 0.14, 0.9, 0, 0.45, 0, 0xe8eef2, { rough: 0.4, seg: 14 });
    cyl(water, 0.1, 0.1, 0.3, 0, 1.05, 0, 0x7fb8d8, { rough: 0.1, opacity: 0.6, transparent: true, seg: 14 });

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.3, -2.3),

      onStepComplete(step) {
        if (step.id === "screen-crank") { screen.scale.set(1, 1, 1); screen.position.y = 1.85; }
        if (step.id === "timeline-gaps") { gapLab.visible = false; gapSupply.visible = false; }
        if (step.id === "planned-vs-actual") { actual.parent.remove(actual); pva.add(actual); actual.position.set(0.24, 1.55, 0.04); actual.rotation.set(Math.PI / 2, 0, 0); }
        if (step.id === "share-report") report.visible = true;
        if (step.id === "closing-log") repaint(aarLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(12,20,8,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("REVIEW SIGNED", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "manager-blames") { manager.position.set(1.1, 0, 0.1); }
        if (it.id === "interpreter-behind") { boothLamp.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "manager-blames") { raised.visible = true; manager.position.set(1.6, 0, 0.5); }
        if (it.id === "interpreter-behind") { boothLamp.visible = false; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const step = session?.step;
        if (boothLamp.visible && boothLamp.material) boothLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.2;
        if (session?.turn && step?.id === "screen-crank") { crank.rotation.z = session.turn.amount * Math.PI * 2; screen.scale.set(1, 0.08 + session.turn.amount * 0.92, 1); }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "priority") {
          const ok = gg.t >= 0.675 && gg.t <= 0.724;
          repaint(dial.userData.screen, signFace(`${Math.round(gg.t * 20)} dots`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "talk-time") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(meter.userData.screen, signFace(ok ? "BALANCED" : tr.v < 0.4 ? "QUIET" : "ONE VOICE", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.5 }));
        }
      },
    };
  },
};
