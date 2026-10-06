import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg,
  surfaceTexture, texturedMat, mudflatFace,
} from "../citykit.js";
import { skiff } from "../../../shared/fleet.js";
import { amphibiousExcavator } from "../../../shared/equipment.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bird Nesting Buffer & Work Window VR — SF Bay Restoration &
// Cleanup, Pack E (ecology, monitoring and community science).
//
// A shoreline restoration bench where an amphibious excavator is staged to
// grade, and the learner is the wildlife compliance biologist whose sign-off
// the crew waits on before the machine moves an inch. Ridgway's rail — named
// only at that generic level, the way the brief requires — nests low in the
// pickleweed at the edge of this bench, and the buffer distance the crew
// flags around an active nest, and the work window itself, are never stated
// as numbers here: both are "per the permit", read off the same board the
// crew reads. The skiff that brought the monitor out is a fleet.js builder,
// and so is the amphibious excavator staged behind the buffer line.

const BRBW_ACCENT = 0x5a9e6a;
const BRBW_CSS = "#5a9e6a";
const BRBW_GREEN = 0x59c97b;
const BRBW_RED = 0xd2312b;

export const SIM_BR_BIRD_NESTING_BUFFER_AND_WORK_WINDOW = {
  id: "br-bird-nesting-buffer-and-work-window",
  index: "344",
  domain: "Environmental",
  trade: "Wildlife compliance biologist, clearing a shoreline restoration bench for an IUOE Local 3 amphibious-excavator crew and its LIUNA Local 261 ground crew",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "clear",
  certification: "Endangered Species Act nesting-buffer conditions and U.S. Fish and Wildlife Service (USFWS) consultation for Ridgway's rail; San Francisco Bay Conservation and Development Commission (BCDC) permit conditions for the work window; San Francisco Bay Regional Water Quality Control Board (RWQCB) monitoring conditions; IUOE Local 3 operating-engineer training for the amphibious excavator; LIUNA Local 261 laborer training for the ground crew waiting on the buffer sign-off",
  name: "Bird Nesting Buffer & Work Window",
  title: simTitle("Bird Nesting Buffer & Work Window"),
  tagline: "The sign-off a grading crew waits on: today's date checked against the work-window calendar, the nest found and its buffer confirmed by rangefinder rather than by eye, the flag line actually run out to the confirmed point, the crew briefed and the operator's own acknowledgement heard, the nest watched through the work, a flush answered with an immediate stop, the excavator waved off before it ever reaches the flagged line, and the day's monitoring logged the way the permit requires",
  accent: BRBW_ACCENT,
  accentCss: BRBW_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "clean-buffer-clean-window", name: "Clean Buffer, Clean Window", note: "The buffer was set by rangefinder, the crew heard the brief and the operator answered, the flush got an immediate stop, and the excavator never crossed the flagged line" },

  supportLine: "your agency's employee assistance programme, with U.S. Fish and Wildlife Service's own permit-compliance line behind it",

  game: system({
    name: "Buffer Watch",
    currency: "SIGN-OFFS",
    ranks: ["Field Aide", "Compliance Monitor", "Lead Monitor", "Senior Monitor", "Buffer & Window Certified"],
    badges: [
      { id: "true-buffer", name: "True Buffer", note: "The rangefinder read and the flag run to the confirmed point, never paced off by eye", test: AWARD.stepClean("rangefinder-check") },
      { id: "clean-window", name: "Clean Window", note: "Never skipped the brief, never flagged by eye, never let the machine keep working through a flush", test: AWARD.safe },
      { id: "held-the-wait", name: "Held The Wait", note: "The post-flush wait held inside the correct band, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-watch", name: "Clean Watch", note: "No corrections across the whole watch", test: AWARD.clean },
      { id: "steady-eyes", name: "Steady Eyes", note: "Held the nest scan in band before and during the work", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Watch closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "guess-the-buffer": "You paced off the buffer distance by eye instead of reading the rangefinder. A footstep isn't a fixed unit and a nest half-hidden in pickleweed looks closer or farther depending on where you're standing — the rangefinder is the only thing on this bench that turns a guess into the distance the permit actually specifies.",
    "flag-by-eye": "You set the buffer flag where it looked about right instead of at the point the rangefinder confirmed. A flag a few metres short leaves the nest exposed to a machine that thinks it's clear; a flag set generously past the real point costs the crew ground they don't have to give up — the flag goes exactly where the confirmed distance puts it, not wherever looks safe enough.",
    "keep-working-through-flush": "You told the crew the machine could finish its current pass after the bird flushed. A flushed adult leaves whatever is in that nest exposed for every extra minute the disturbance continues, and 'almost done' is exactly the reasoning the buffer exists to override — a flush stops the work immediately, not after the pass in progress.",
    "skip-the-brief": "You let the excavator operator start maneuvering into position before confirming they'd actually heard where the buffer line was. An operator who never got the brief is an operator who finds the buffer by getting close enough for the ground crew to shout — the acknowledgement has to come back before the machine moves, not after it's already rolling.",
  },

  lateNotes: {
    "resume-wait-clock": "Nothing to read yet — the flush has to actually happen and the stop has to be called before the wait starts.",
    "monitoring-log": "Nothing to log yet — the buffer hasn't been confirmed and nothing has happened worth an entry.",
  },

  interrupts: [
    {
      id: "excavator-approaches-buffer",
      kind: "Excavator drifts toward the buffer line",
      after: "prework-scan", delay: 2, seconds: 14,
      alert: "The excavator is maneuvering into position and its track is drifting straight toward the flagged buffer line.",
      cue: "Wave the operator off with the warning paddle before the machine reaches the flag — it can't see the line from the cab the way you can from here.",
      target: "warning-paddle",
      why: "A pontoon excavator's operator is watching the ground ahead of the bucket, not a thin flag line off to the side, and by the time the machine is close enough for the operator to notice the flag it may already be inside the buffer — the warning paddle is what reaches the operator before the track does, the same way a spotter's signal stops a swinging load before it reaches someone.",
      missNote: "Nobody waved the operator off, and the track kept drifting toward the flagged line while the machine maneuvered into position.",
      wrongNote: "The warning paddle — that's the one signal the operator in the cab can actually see from here.",
    },
    {
      id: "rail-flushes",
      kind: "Ridgway's rail flushes near the excavator",
      after: "work-watch", delay: 3, seconds: 14,
      alert: "A Ridgway's rail has flushed out of the pickleweed right at the edge of the buffer, calling as it goes, with the excavator still working.",
      cue: "Call the stop over the dedicated stop-work channel immediately — do not wait for the bucket to finish its current pass.",
      target: "stop-work-radio",
      why: "A flushed adult this close to a working machine is exactly the disturbance the buffer and the work window exist to prevent, and the stop has to reach the operator before the next swing of the bucket, not after — the dedicated stop-work channel is the one call on this bench that overrides everything else in progress, including a pass that's almost finished.",
      missNote: "The machine kept working through the flush while the rail called from the edge of the buffer — exactly the disturbance the whole watch exists to stop.",
      wrongNote: "The stop-work channel — that's the one call that reaches the operator immediately, over whatever else is being said.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "boots-on", "field-radio-on"],
      itemNames: { "hi-vis-vest": "hi-vis vest on", "boots-on": "waterproof boots on", "field-radio-on": "field radio powered on" },
      title: "Gear up before walking the bench",
      cue: "Before stepping onto the bench: hi-vis vest on, waterproof boots on, field radio powered on.",
      why: "The bench sits between a working excavator's swing radius and soft mud that doesn't announce a soft spot until a boot is already in one, and the hi-vis vest is what keeps the operator's ground crew from mistaking the monitor's own silhouette for a hazard flag out of the corner of an eye already busy watching the bucket.",
    },
    {
      id: "work-window-calendar", kind: "select", target: "work-window-calendar",
      title: "Check today's date against the work window",
      cue: "Read the work-window calendar and confirm today's date falls inside the window the permit sets for this bench.",
      why: "The nesting work window is set in the permit around the season this species actually nests here, not around the crew's own schedule, and a date checked against the calendar before anyone unloads equipment is what keeps a whole day's mobilization from having to reverse itself because nobody looked at the board first.",
    },
    {
      id: "buffer-plan-board", kind: "select", target: "buffer-plan-board",
      title: "Read the buffer plan for this bench",
      cue: "Read the buffer plan: the buffer distance per the permit, and what to do if a second nest turns up outside today's flagged line.",
      why: "The buffer distance is set in the same Endangered Species Act consultation that opened the work window, not decided on the bench by whoever is standing there that morning, and reading the plan before the rangefinder ever comes out is what keeps today's flag line matched to the same number the permit was actually written around.",
    },
    {
      id: "find-nest", kind: "find", noHint: true,
      targets: ["active-nest", "loose-flagging"],
      itemNames: { "active-nest": "the active nest, low in the pickleweed", "loose-flagging": "yesterday's flagging, come loose" },
      itemNotes: {
        "active-nest": "Low in the pickleweed, easy to walk past without the scope — this is the point every later distance and every later watch is measured from.",
        "loose-flagging": "A stretch of yesterday's flagging has come loose in the wind — left down, it stops marking anything and the crew has no way to tell the line ever moved.",
      },
      title: "Find the nest and check yesterday's flagging",
      cue: "Walk the bench edge and find the active nest and any flagging that's come loose since yesterday.",
      why: "Every distance, every flag and every watch on this bench starts from the nest's actual position, not from where it was assumed to be, and a stretch of flagging found loose now — before the excavator is anywhere near it — costs nothing to fix, where the same gap found mid-work costs the whole crew a stop.",
    },
    {
      id: "rangefinder-check", kind: "turn", target: "rangefinder-check",
      title: "Read the buffer distance to the nest",
      cue: "Turn the rangefinder onto the nest and read the distance against the buffer the plan board gave you.",
      turn: { turns: 0.6, label: "RANGEFINDER" },
      why: "The rangefinder is the only thing on this bench that turns 'about right' into the actual distance the permit specifies, and reading it here, before the flag goes anywhere, is what lets the flag line that gets set next actually mean something to a machine operator who has to trust it from thirty metres away.",
    },
    {
      id: "flag-buffer-line", kind: "drag", target: "flag-reel",
      title: "Run the buffer flag out to the confirmed point",
      cue: "Run the flagging out from the reel to the point the rangefinder confirmed — not short of it, and not past it either.",
      why: "A buffer flag is only as good as the distance it actually marks, and running it to the rangefinder's confirmed point — rather than to wherever the reel happens to run out or a step feels like enough — is what turns today's reading into a line an excavator operator who has never seen this nest can actually trust from the cab.",
      drag: { to: "buffer-stake-socket", radius: 0.4, missNote: "Not at the confirmed point — the flag has to land where the rangefinder actually put it, not somewhere that looks close enough." },
    },
    {
      id: "crew-brief", kind: "sequence",
      targets: ["brief-crew-buffer", "operator-ack"],
      itemNames: { "brief-crew-buffer": "the buffer line and the work window briefed to the whole crew", "operator-ack": "the operator's own acknowledgement heard back" },
      outOfOrderNote: "Brief the crew before asking for the acknowledgement — there's nothing to acknowledge until the line has actually been described.",
      title: "Brief the crew and get the operator's acknowledgement",
      cue: "Brief the whole crew on the buffer line and the work window, then wait for the operator to acknowledge it back over the radio.",
      why: "A buffer line nobody in the cab has actually heard about is a line that exists only on the monitor's own clipboard, and the acknowledgement is what proves the one person who can actually put a bucket inside it knows exactly where it is — the machine does not move until that acknowledgement comes back, not after it starts moving.",
    },
    {
      id: "prework-scan", kind: "track", target: "nest-scope", seconds: 6,
      title: "Scan the nest before the machine moves",
      cue: "Hold a steady scan on the nest with the scope before the excavator is cleared to maneuver into position.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "NEST SCAN", readout: (v) => (v < 0.4 ? "scan too fast — activity missed" : v > 0.62 ? "scan too slow — losing the nest" : "nest held clean") },
      why: "The machine can only be cleared to move once the nest has actually been watched long enough to show whether the adult is settled or already agitated, and a scan rushed through or left to drift off the nest is a clearance given on a guess rather than on what the bird is actually doing right now.",
      holdBreakNote: "The scan lost the nest before the check was complete — steady the scope and pick the watch back up before clearing the machine.",
    },
    {
      id: "work-watch", kind: "hold", target: "nest-scope", seconds: 5,
      title: "Hold the watch while the excavator works",
      cue: "Hold the scope steady on the nest while the excavator works its first pass — anything the bird does now has to be seen immediately.",
      why: "Once the machine is actually moving, the nest is the one thing on this bench that can go from settled to flushed in a few seconds, and a watch that wanders during the first working pass is a watch that finds out only once the disturbance is already well under way.",
      holdBreakNote: "The watch broke while the machine was working — get back on the scope and hold it through to the end of the pass.",
    },
    {
      id: "log-flush-entry", kind: "select", target: "monitoring-log",
      title: "Log the flush and the stop",
      cue: "Log the flush: time, what the bird did, the stop called, and the time the machine actually stopped.",
      why: "The permit's own monitoring record is built entirely from entries like this one, and an entry written immediately — while the exact time and the exact sequence are still what actually happened, not what gets remembered an hour later — is the version of this event that can stand behind the work window the next time it comes up for renewal.",
    },
    {
      id: "resume-wait", kind: "gauge", target: "resume-wait-clock",
      title: "Hold the wait before clearing the machine again",
      cue: "Watch the wait clock and clear the machine to resume only once the nest has read settled for the wait the plan sets — not before it, and not long past it either.",
      gauge: { label: "RESETTLE WAIT", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too soon — not settled long enough" : t <= 0.64 ? "settled the full wait — clear to resume" : "held past the wait — clear now"), missNote: "Off the band. The wait the plan sets has to actually run before the machine is cleared again." },
      why: "The resettle wait exists so a stop actually means the adult is back on the nest and behaving normally, not just that the machine paused for a moment — clearing the resume too early treats the stop as a formality, and holding well past the wait for no reason is time the crew's schedule does not have either.",
    },
    {
      id: "resume-brief", kind: "sequence",
      targets: ["crew-radio", "operator-ack"],
      itemNames: { "crew-radio": "resume cleared, called to the crew", "operator-ack": "the operator's acknowledgement heard a second time" },
      outOfOrderNote: "Call the resume to the crew before listening for the acknowledgement — there's nothing to acknowledge until the call has gone out.",
      title: "Clear the crew to resume",
      cue: "Call the crew: nest settled, buffer confirmed, cleared to resume from a stop — then wait for the operator to acknowledge it back, the same as the first brief.",
      why: "A resume after a flush starts the pass over rather than picking up mid-swing, because the ground conditions and the machine's own position may have shifted during the stop — hearing the operator's acknowledgement a second time is what confirms the resume actually reached the cab, rather than assuming it did because the first brief did.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew",
      cue: "On the working channel: the watch is current, the flush is handled, and how the crew is doing after a stop mid-pass.",
      why: "A stop mid-pass costs the crew time on a schedule that answers to the tide as much as the calendar, and the crew that just held a machine still on the monitor's word deserves to hear directly that the call was made for something real, not for its own sake.",
    },
    {
      id: "closing-log", kind: "select", target: "monitoring-log",
      title: "Close out the day's monitoring log",
      cue: "Close the log: the window confirmed, the buffer set and held, the flush and the resume, and the bench secured for the day.",
      why: "The closing entry is what turns today's individual readings into the record the permit's own compliance review is actually built from — a log closed out completely, in order, is the difference between a work window that renews on the strength of its own monitoring and one that raises a question nobody on this bench can answer months later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRBW_ACCENT);

    // --------------------------------------------------------- the mud bench
    const marshTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3f4a30", base2: "#2f3824" }), { repeat: 3, px: 256 });
    const bench = box(g, 20, 0.06, 18, 0, 0.03, -2, 0x3f4a30, { rough: 0.95 });
    bench.material = texturedMat(marshTex, { rough: 0.95, color: 0x8a9a68 });

    // ------------------------------------------------- grass clumps, backdrop
    function grassClump(parent, x, z, o = {}) {
      const c = group(parent, x, o.y ?? 0.03, z, Math.random() * Math.PI);
      const n = o.n ?? 9, tone = o.tone ?? 0x5d7a3a;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, r = 0.05 + Math.random() * (o.spread ?? 0.14), hh = (o.h ?? 0.24) + Math.random() * 0.12;
        box(c, 0.02, hh, 0.008, Math.cos(a) * r, hh / 2, Math.sin(a) * r, tone, { rough: 0.9, cast: false }).rotation.z = (Math.random() - 0.5) * 0.35;
      }
      return c;
    }
    for (let i = 0; i < 10; i++) {
      const gx = (Math.random() - 0.5) * 8, gz = -4 + Math.random() * 4;
      grassClump(g, gx, gz, { n: 6, h: 0.2, tone: 0x5d7a3a });
    }

    // -------------------------------------------------------- the excavator
    const exc = amphibiousExcavator(g, 4.5, 0, -6.5, { ry: -2.3, livery: { fleetName: "BAY WORKS", unitNumber: "AX-2" } });
    holoTag(exc, "amphibious excavator — staged", 0, 3.6, 0, { css: BRBW_CSS, w: 0.48 });
    const { boom } = exc.userData.parts;
    void boom;
    const excHome = exc.position.clone();

    // ------------------------------------------------------------ the skiff
    const sk = skiff(g, -6, 0, 3.2, { ry: 1.5, livery: { fleetName: "BAY MONITOR", unitNumber: "MM-2" } });
    holoTag(sk, "monitor's skiff — beached", 0, 1.3, 0, { css: BRBW_CSS, w: 0.4 });

    // ---------------------------------------------------------- crew figures
    const groundCrew = standingFigure(g, 2.0, -2.4, { ry: -1.0, cloth: 0x3f4a55, vest: 0xe8b02e, helmet: 0xf1f3f4, gloves: true, atStation: true });
    holoTag(groundCrew, "ground crew — LIUNA 261", 0, 1.95, 0, { css: BRBW_CSS, w: 0.4 });

    // -------------------------------------------------------------- the nest
    const nestGrp = group(g, 1.0, 0.05, -1.4);
    grassClump(nestGrp, 0, 0, { n: 11, h: 0.26, spread: 0.2, tone: 0x6f5a3a });
    const nestMound = ball(nestGrp, 0.09, 0, 0.04, 0, 0x5a4a2a, { rough: 0.85, seg: 10 });
    nestMound.scale.y = 0.4;
    const railBird = group(nestGrp, 0.05, 0.14, 0.03);
    ball(railBird, 0.05, 0, 0, 0, 0x4a3a2a, { rough: 0.8, seg: 10 });
    ball(railBird, 0.03, 0.06, 0.01, 0, 0x4a3a2a, { rough: 0.8, seg: 8 });
    railBird.visible = false;
    const nestHazardMarker = group(g, 1.0, 0.05, -1.4);
    box(nestHazardMarker, 0.3, 0.02, 0.3, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nestHazardMarker, "active-nest");

    const looseFlag = box(g, 0.05, 0.02, 0.14, -0.6, 0.06, -0.7, BRBW_RED, { rough: 0.7 });
    reg(hits, looseFlag, "loose-flagging");

    // --------------------------------------------------------- the boards
    const calendarBoard = holoPanel(g, 0.9, 0.6, -1.9, 1.6, 1.6, (cx, w, h) => {
      cx.fillStyle = "#0e1a10"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRBW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8f2e6"; cx.fillText("WORK-WINDOW CALENDAR", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e0ecdd";
      ["Nesting work window: per the permit", "Today: inside the window", "Confirm before mobilizing"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.32 + i * 0.16)));
    }, { ry: 0.5, accent: BRBW_ACCENT });
    reg(hits, calendarBoard, "work-window-calendar");

    const bufferPlanBoard = holoPanel(g, 0.9, 0.6, 1.9, 1.6, 1.6, (cx, w, h) => {
      cx.fillStyle = "#0e1a10"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRBW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8f2e6"; cx.fillText("BUFFER PLAN — RIDGWAY'S RAIL", w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#e0ecdd";
      ["Buffer distance: per the permit", "A second nest outside the flag: stop and call it in", "USFWS consultation governs this bench"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.3 + i * 0.15)));
    }, { ry: -0.5, accent: BRBW_ACCENT });
    reg(hits, bufferPlanBoard, "buffer-plan-board");

    // ------------------------------------------------------ rangefinder & flag
    const rangefinder = instrument(g, -0.6, 0.86, 1.3, { color: 0x2b3138, idle: "-- m", w: 0.1, d: 0.14 });
    const rfDial = cyl(rangefinder, 0.025, 0.025, 0.03, 0, 0.03, 0.06, 0xc8ced4, { rough: 0.4, seg: 10 });
    rfDial.rotation.x = Math.PI / 2;
    holoTag(rangefinder, "rangefinder", 0, 0.16, 0.05, { css: BRBW_CSS, w: 0.3 });
    reg(hits, rangefinder, "rangefinder-check");

    const eyeballHazard = box(g, 0.4, 0.4, 0.3, -0.6, 0.5, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pace it off by eye?", -0.6, 0.85, 1.5, { css: "#e8622a", w: 0.4 });
    reg(hits, eyeballHazard, "guess-the-buffer");

    const reelGrp = group(g, 0.7, 0.1, 1.2, 0.4);
    cyl(reelGrp, 0.07, 0.07, 0.05, 0, 0, 0, 0xd9cbb2, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(reelGrp, "flagging reel", 0, 0.16, 0, { css: BRBW_CSS, w: 0.28 });
    reg(hits, reelGrp, "flag-reel");
    const flagLine = box(g, 0.02, 0.005, 2.4, 0.85, 0.1, -0.1, 0xf2c14b, { rough: 0.5, cast: false });
    flagLine.visible = false;
    const bufferStake = group(g, 0.9, 0.1, -1.05);
    cyl(bufferStake, 0.016, 0.018, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
    const bufferFlag = box(bufferStake, 0.08, 0.06, 0.008, 0, 0.5, 0, BRBW_RED, { rough: 0.7 });
    const bufferSocket = group(bufferStake, 0, 0.1, 0);
    hits["buffer-stake-socket"] = bufferSocket;

    const flagByEyeHazard = box(g, 0.4, 0.4, 0.3, 1.6, 0.4, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "flag it where it looks right?", 1.6, 0.75, -0.8, { css: "#e8622a", w: 0.46 });
    reg(hits, flagByEyeHazard, "flag-by-eye");

    // ------------------------------------------------------------ crew radios
    const briefRadio = radio(g, -1.3, 0.85, 0.6, { ry: -0.4 });
    holoTag(g, "crew brief channel", -1.3, 1.1, 0.62, { css: BRBW_CSS, w: 0.34 });
    reg(hits, briefRadio, "brief-crew-buffer");
    const ackMarker = group(g, -1.55, 0.85, 0.4);
    box(ackMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ackMarker, "operator-ack");

    const skipBriefHazard = box(g, 0.5, 0.4, 0.4, -1.4, 0.5, 0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let the operator start without the ack?", -1.4, 0.9, 0.5, { css: "#e8622a", w: 0.58 });
    reg(hits, skipBriefHazard, "skip-the-brief");

    const scope = group(g, 0, 0.9, 0.9);
    cyl(scope, 0.02, 0.025, 0.6, 0, -0.1, 0, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 10 });
    cyl(scope, 0.05, 0.05, 0.22, 0, 0.24, 0, 0x1b1e23, { rough: 0.45, metal: 0.5, seg: 12 }).rotation.z = Math.PI / 3;
    holoTag(scope, "spotting scope — the nest scan", 0, 0.56, 0, { css: BRBW_CSS, w: 0.48 });
    reg(hits, scope, "nest-scope");

    const warningPaddle = group(g, 2.6, 0.05, -3.4);
    cyl(warningPaddle, 0.015, 0.015, 0.5, 0, 0.25, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const paddleFace = box(warningPaddle, 0.22, 0.22, 0.01, 0, 0.55, 0, BRBW_RED, { rough: 0.6 });
    holoTag(warningPaddle, "warning paddle", 0, 0.7, 0, { css: BRBW_CSS, w: 0.3 });
    reg(hits, warningPaddle, "warning-paddle");

    const stopRadio = radio(g, -0.2, 0.85, 0.95, { ry: 0.3 });
    holoTag(g, "dedicated stop-work channel", -0.2, 1.1, 0.97, { css: "#d2312b", w: 0.4 });
    reg(hits, stopRadio, "stop-work-radio");

    const keepWorkingHazard = box(g, 0.5, 0.4, 0.4, 3.2, 0.5, -5.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let it finish the pass?", 3.2, 0.9, -5.0, { css: "#e8622a", w: 0.42 });
    reg(hits, keepWorkingHazard, "keep-working-through-flush");

    const monitoringLog = holoPanel(g, 0.68, 0.5, -1.1, 1.15, 0.85, (cx, w, h) => drawLog(cx, w, h, ["Window: —", "Buffer: —", "Flush: —", "Resume: —"], false), { ry: 0.5, accent: BRBW_ACCENT });
    function drawLog(cx, w, h, rows, done) {
      cx.fillStyle = "#0e1a10"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRBW_GREEN : BRBW_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8f2e6"; cx.fillText("MONITORING LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#e0ecdd";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, monitoringLog, "monitoring-log");

    const resumeClock = instrument(g, 1.3, 0.86, 0.85, { color: 0x2b3138, idle: "0 min", w: 0.1, d: 0.14 });
    holoTag(resumeClock, "resettle wait", 0, 0.16, 0.05, { css: BRBW_CSS, w: 0.32 });
    reg(hits, resumeClock, "resume-wait-clock");

    const crewRadio = radio(g, 1.6, 0.85, 0.55, { ry: -0.5 });
    holoTag(g, "crew radio", 1.6, 1.1, 0.57, { css: BRBW_CSS, w: 0.22 });
    reg(hits, crewRadio, "crew-radio");

    // ------------------------------------------------------------ PPE rack
    const gearRack = group(g, -2.3, 0.1, 0.9);
    cyl(gearRack, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const vest = box(gearRack, 0.28, 0.32, 0.08, 0, 0.9, 0.05, 0xe8b02e, { rough: 0.7 });
    holoTag(gearRack, "hi-vis vest", 0, 1.1, 0, { css: BRBW_CSS, w: 0.26 });
    reg(hits, vest, "hi-vis-vest");
    const boots = box(g, 0.16, 0.14, 0.28, -2.55, 0.07, 0.6, 0x2b3138, { rough: 0.7 });
    reg(hits, boots, "boots-on");
    const fieldRadio = radio(g, -2.1, 0.1, 0.6, { ry: 0.6 });
    reg(hits, fieldRadio, "field-radio-on");

    let approaching = false;
    let flushed = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.0, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "find-nest") looseFlag.visible = false;
        if (step.id === "flag-buffer-line") { flagLine.visible = true; bufferFlag.material = mat(BRBW_GREEN, { rough: 0.6 }); }
        if (step.id === "crew-brief") briefRadio.userData.show?.("BRIEFED\nACK OK");
        if (step.id === "log-flush-entry") {
          repaint(monitoringLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Window: confirmed", "Buffer: set and held", "Flush: called, stop confirmed", "Resume: pending"], false));
        }
        if (step.id === "resume-brief") crewRadio.userData.show?.("RESUME\nCLEARED");
        if (step.id === "crew-checkin") crewRadio.userData.show?.("WATCH OK\nBUFFER HELD");
        if (step.id === "closing-log") {
          repaint(monitoringLog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Window: confirmed all day", "Buffer: held, never crossed", "Flush: 1, resolved", "Resume: cleared, logged"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "rail-flushes") { flushed = true; railBird.visible = true; }
        if (it.id === "excavator-approaches-buffer") { approaching = true; exc.position.x = excHome.x - 0.5; paddleFace.material = mat(BRBW_RED, { emissive: BRBW_RED, ei: 1.2, rough: 0.6 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rail-flushes") { flushed = false; railBird.visible = false; }
        if (it.id === "excavator-approaches-buffer") { approaching = false; exc.position.copy(excHome); paddleFace.material = mat(BRBW_GREEN, { rough: 0.6 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "rangefinder-check") rfDial.rotation.z = session.turn.amount * 4;
        if (session?.gauge && !session.gauge.committed && step?.id === "resume-wait") {
          const gt = session.gauge.t ?? 0;
          repaint(resumeClock.userData.screen, signFace(`${Math.round(gt * 6)} min`, { bg: "#0d1c24", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
        if (approaching) exc.position.x = Math.max(excHome.x - 1.6, exc.position.x - dt * 0.4);
        if (flushed) railBird.position.y = 0.2 + Math.sin(t * 6) * 0.03;
        else if (railBird.visible) railBird.position.y = 0.14 + Math.sin(t * 3) * 0.015;
      },
    };
  },
};
