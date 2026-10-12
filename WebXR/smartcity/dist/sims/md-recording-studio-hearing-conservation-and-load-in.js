import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, woodGrainFace, tileFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Recording Studio Hearing Conservation & Load-In VR — Screen &
// Media Crafts.
//
// A recording studio's live room and control room before a session: the
// hearing conservation plan read, isolating headphones and musician's
// earplugs on, the load-in ramp swept for a missing wedge and a frayed
// spare strap, the piano skid's straps checked against the load chart, the
// monitor level proven inside the safe band before headphones go on, the
// dolly's casters locked, the ratchet strap held to tension, the moving
// crew confirmed on the radio, the piano guided down the ramp at a
// controlled pace, the bench carried to its mark, a dosimeter fitted on a
// pit musician, the control room's talkback confirmed, and the session
// logged — with a second dolly meeting the piano on the ramp and a
// musician pulling their hearing protection early both needing an answer
// that is not the control already in the learner's hand. The production,
// the studio and the orchestra are generic.

const RSH_ACCENT = 0x7e57c2;
const RSH_CSS = "#7e57c2";

export const SIM_MD_RECORDING_STUDIO_HEARING_CONSERVATION_AND_LOAD_IN = {
  id: "md-recording-studio-hearing-conservation-and-load-in",
  index: "712",
  domain: "Screen & Media Crafts",
  trade: "AFM studio musician and load-in crew, running hearing conservation for a session and a grand piano's load-in down the studio ramp",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  certification: "AFM member safety guidance for orchestra and recording musicians; IATSE stagehand practice for the load-in crew; OSHA 29 CFR 1910.95 occupational noise exposure and hearing conservation; NIOSH criteria for hearing conservation and audiometric monitoring; OSHA 29 CFR 1910.22 walking-working surfaces, applied here to the load-in ramp",
  name: "Recording Studio Hearing Conservation & Load-In",
  title: simTitle("Recording Studio Hearing Conservation & Load-In"),
  tagline: "A live room and control room before a session: the hearing conservation plan read, isolating headphones and earplugs on, the ramp swept for a missing wedge and a frayed spare strap, the piano skid's straps checked against the load chart, the monitor level proven safe before headphones go on, the dolly's casters locked, the ratchet strap held to tension, the moving crew confirmed, the piano guided down the ramp at a controlled pace, the bench carried to its mark, a dosimeter fitted on a pit musician, the talkback confirmed, and the session logged — a second dolly meeting the piano on the ramp and a musician pulling their protection early both answered off a control that isn't the one already in the learner's hand",
  accent: RSH_ACCENT,
  accentCss: RSH_CSS,
  parSeconds: 340,
  footprint: 2.9,
  badge: { id: "level-proven-piano-down", name: "Level Proven, Piano Down", note: "The monitor level proven safe before any headphones went on, the piano guided down the ramp at a controlled pace, and the early-removed hearing protection caught and answered before the next loud passage" },

  supportLine: "your AFM local's member assistance contact, or the venue's own employee assistance programme",

  game: system({
    name: "Session Floor",
    currency: "DECIBEL",
    ranks: ["Cartage Hand", "Session Sub", "Studio Musician", "Principal Chair", "AFM Steward Certified"],
    badges: [
      { id: "level-proven-first", name: "Level Proven First", note: "Never put headphones on before the monitor level read inside the safe band", test: AWARD.stepClean("monitor-level-check") },
      { id: "protection-caught", name: "Protection Caught", note: "The early-removed hearing protection was answered on the talkback, not ignored", test: AWARD.unbroken },
      { id: "never-under-the-skid", name: "Never Under the Skid", note: "Never reached under the descending piano, never skipped hearing protection in the pit, never released a loaded caster lock, never blocked the fire exit", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections from the plan to the closing log", test: AWARD.clean },
      { id: "controlled-descent", name: "Controlled Descent", note: "The piano's descent held its band the whole ramp, first time", test: AWARD.precise(0.7) },
      { id: "downbeat-on-time", name: "Downbeat On Time", note: "Loaded in and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-under-descending-piano": "You reached under the piano while it was still being guided down the ramp on its skid. A loaded skid on an incline moves on very little force once it starts, and a hand or a foot under it has nothing between it and several hundred pounds the moment the crew's grip so much as shifts.",
    "skip-hearing-protection-in-pit": "You stepped into the pit near the monitors without hearing protection while the section was running a loud passage. Hearing damage from a single loud passage does not feel like an injury at the time — it feels like nothing at all, which is exactly why the protection goes on before the section plays, not after someone notices it was loud.",
    "release-caster-lock-while-loaded": "You released the dolly's caster lock while the piano was still strapped up on the skid, off the ground. That lock is what keeps a loaded skid from rolling the moment it's not perfectly level, and releasing it before the piano is actually settled on stable ground turns a secured load into one drifting on its own casters.",
    "block-fire-exit-with-case": "You set an instrument case down in front of the studio's marked fire exit. A session with a full section and a live room's worth of gear is exactly the kind of room where an exit actually matters, and a case sitting in front of it is a case somebody has to clear before that door does what it's there for.",
  },

  lateNotes: {
    "monitor-level-meter": "The level only gets proven once the hearing conservation plan is actually read — checking a meter against a band nobody looked up yet proves nothing.",
    "piano-skid-descent": "The skid only comes down the ramp once the straps are checked, the casters are locked and the moving crew is confirmed — moving it before any of those is moving a piano on hope.",
    "session-log": "The log is written last, after the bench is placed and the dosimeter is fitted.",
  },

  steps: [
    {
      id: "read-hearing-plan", kind: "select", target: "session-plan-panel",
      title: "Read the session's hearing conservation plan",
      cue: "Read the plan: the monitor level band, who wears a dosimeter today, and the load-in schedule for the piano.",
      why: "The plan is where today's session is actually specified before anyone puts headphones on — the level band the control room is holding to, which chairs are dosimetered for this session, and when the piano comes down the ramp relative to everything else scheduled in the room.",
    },
    {
      id: "hearing-ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["iso-headphones", "musician-earplugs"],
      itemNames: { "iso-headphones": "isolating headphones", "musician-earplugs": "musician's earplugs" },
      title: "Isolating headphones and musician's earplugs on",
      cue: "Put on the isolating headphones at the console and the musician's earplugs in the pit before the section runs anything loud.",
      why: "A musician's earplugs are flat-response, not foam ones meant for a jobsite — they cut level without cutting the pitch a player needs to hear to stay in tune, and both go on before the first loud passage rather than after someone notices their ears ringing.",
    },
    {
      id: "ramp-sweep", kind: "find", noHint: true,
      targets: ["missing-ramp-wedge", "frayed-spare-strap", "obstruction-case-on-ramp"],
      itemNames: { "missing-ramp-wedge": "missing ramp wedge", "frayed-spare-strap": "frayed spare strap on the gear rack", "obstruction-case-on-ramp": "instrument case left on the ramp" },
      itemNotes: {
        "missing-ramp-wedge": "A wedge is missing where the load-in ramp meets the floor, leaving a small lip a loaded skid can catch on. A lip that's nothing on foot is exactly what stops a skid's front edge dead while everything behind it keeps moving.",
        "frayed-spare-strap": "A spare ratchet strap on the gear rack has a frayed webbing section near the buckle — easy to grab by mistake if the good strap isn't obviously the one in reach. A frayed strap holds fine right up until it's actually carrying a piano's full weight.",
        "obstruction-case-on-ramp": "An instrument case is sitting square on the load-in ramp. A loaded piano skid needs the whole ramp clear to control its speed, and a case in the path is either a scramble to move it mid-descent or a piano rolling over something nobody wanted under it.",
      },
      title: "Sweep the ramp before the piano comes down it",
      cue: "Walk the load-in ramp and click the three things wrong with how it was set.",
      why: "A ramp reads the same whether it's actually clear or almost clear, and these three — a lip nobody wedged, a strap nobody would trust up close and a case left in the path — are exactly what turns a routine load-in into the one that goes wrong.",
    },
    {
      id: "load-chart-check", kind: "select", target: "load-chart",
      title: "Check the piano skid's straps against the load chart",
      cue: "Check today's piano weight and the skid's strap rating against the load chart before strapping anything down.",
      why: "The chart is what turns 'looks tight enough' into an actual number — a concert grand's weight is well documented, and the chart is built from the skid and strap manufacturers' own rated capacity rather than how the strap happens to feel when it's cinched.",
    },
    {
      id: "monitor-level-check", kind: "gauge", target: "monitor-level-meter",
      title: "Prove the monitor level before headphones go on",
      cue: "Read the control room's monitor level meter and commit inside the session's safe band before any headphones are worn.",
      why: "A level that was safe for yesterday's session is not automatically safe for today's mix, and proving the meter here — before a single musician puts headphones on — is what keeps 'the mix engineer will watch it' from being the only thing standing between a session and someone's hearing.",
      gauge: { label: "MONITOR LEVEL", speed: 0.6, green: [0.3, 0.58], readout: (t) => `${Math.round(t * 110)} dB`, missNote: "Outside the session's safe band — trim the monitor level before anyone puts headphones on." },
    },
    {
      id: "caster-lock", kind: "turn", target: "dolly-caster-lock",
      title: "Lock the piano dolly's casters before strapping",
      cue: "Turn the dolly's caster lock to SET before the piano is strapped onto the skid.",
      why: "A skid that can roll while it's being strapped is a skid that can shift the exact moment the crew's hands are busy with a buckle instead of a brake — locking the casters first is what keeps the strapping itself from being the risky part.",
      turn: { turns: 1.0, label: "CASTER LOCK", readout: (t) => (t < 0.5 ? "free" : t < 0.95 ? "locking" : "set") },
    },
    {
      id: "ratchet-strap-hold", kind: "hold", target: "ratchet-strap-hold", seconds: 4,
      title: "Hold the ratchet strap to tension while it's cinched",
      cue: "Hold steady tension on the strap while a second hand ratchets the buckle closed.",
      why: "A strap cinched against a hand that isn't holding steady tension ends up looser than the ratchet reads, because slack taken up unevenly settles back out the moment the piano actually moves. Holding it steady is what makes the ratchet's own tension the real tension.",
      holdBreakNote: "You let go before the buckle finished. A strap ratcheted against slack is a strap that reads tight and isn't.",
    },
    {
      id: "moving-crew-check", kind: "select", target: "moving-crew-radio",
      title: "Confirm the moving crew before tipping the skid",
      cue: "Call the moving crew on the radio to confirm the ramp is clear and everyone's in position before the skid tips onto the ramp.",
      why: "Tipping a loaded skid onto a ramp is the one moment in the whole load-in with no going back partway through, and the radio call is what confirms every hand that's supposed to be on the piano actually is, rather than assumed to be, before that moment starts.",
    },
    {
      id: "piano-skid-descent", kind: "track", target: "piano-skid-descent", seconds: 6,
      title: "Guide the piano down the ramp at a controlled pace",
      cue: "Guide the skid down the ramp at a controlled, held pace — too fast outruns the crew's grip, too slow fights the ramp's own incline.",
      why: "A piano skid on an incline wants to accelerate on its own, and the crew's job is holding it to a pace their own grip and footing can actually control the whole way down — not stopping it dead, which just trades one loss of control for another, but a steady, held descent.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.5, fall: 0.5, drift: 0.12, label: "DESCENT", readout: (v) => (v < 0.4 ? "too slow" : v > 0.6 ? "outrunning grip" : "controlled") },
      holdBreakNote: "The descent sped up past the crew's grip or stalled against the incline — ease back toward the controlled pace rather than fighting it.",
    },
    {
      id: "bench-placement", kind: "drag", target: "piano-bench",
      title: "Carry the bench to its mark",
      cue: "Carry the piano bench from the gear line onto its taped mark once the piano itself is settled.",
      why: "The bench's mark is set from the piano's own final position, not guessed — a bench placed before the piano is settled is a bench that gets moved again the moment the piano's actual spot is a few inches off from where anyone expected.",
      drag: { to: "bench-mark", radius: 0.5, missNote: "Not on the taped mark — the bench has to sit square to the keyboard, not near it." },
    },
    {
      id: "dosimeter-fit", kind: "select", target: "dosimeter-badge",
      title: "Fit the dosimeter on today's monitored chair",
      cue: "Fit the noise dosimeter badge on the pit musician the session plan names for today's monitoring.",
      why: "A dosimeter only tells anyone anything if it's actually worn by the chair the plan calls for — fitting it here, before the section runs anything, is what turns today's monitoring from a box checked on a form into a real reading of what that chair is actually exposed to.",
    },
    {
      id: "talkback-check", kind: "select", target: "talkback-radio",
      title: "Confirm the control room's talkback",
      cue: "Confirm the talkback channel between the control room and the live room before the session starts.",
      why: "The talkback is the one channel that reaches a musician wearing isolating headphones without anyone having to raise their voice over a live room — confirming it works before the downbeat is what keeps a stopped take from turning into someone walking all the way out to the floor to say so.",
    },
    {
      id: "session-log", kind: "select", target: "session-log",
      title: "Log the level, the load-in and the dosimeter",
      cue: "Log the monitor level proven, the ramp finds and fixes, the piano settled, and the dosimeter fitted.",
      why: "The log is what the next session on this room reads before the next downbeat — a monitor level that was safe today and a ramp that needed a wedge are both facts the next crew needs, not things they should have to rediscover from scratch.",
    },
  ],

  interrupts: [
    {
      id: "second-dolly-meets-piano",
      kind: "Second dolly meets the piano on the ramp",
      after: "ratchet-strap-hold", delay: 2, seconds: 12,
      alert: "A stagehand has started wheeling the bench dolly up the same ramp, right as the piano skid is about to start down it.",
      cue: "Call the moving crew to hold at the ramp before both dollies meet on it.",
      target: "moving-crew-radio",
      why: "A ramp only has room for one loaded dolly moving on it at a time, and a shout across a live room competes with everything else already happening on the floor. The radio reaches the whole moving crew at once — which is the only way to stop a stagehand already halfway up the ramp before the two dollies actually meet.",
      missNote: "Both dollies met on the ramp. The bench dolly had to be muscled backward with the piano skid already committed to the descent.",
      wrongNote: "Not the strap you're holding — that only answers for this buckle. The moving crew radio is what reaches a stagehand already on the ramp.",
    },
    {
      id: "protection-removed-early",
      kind: "Musician removes hearing protection early",
      after: "piano-skid-descent", delay: 2, seconds: 12,
      alert: "A pit musician has pulled their hearing protection to hear the conductor better, right as the brass section starts a loud passage.",
      cue: "Call it in on the talkback and have them put the protection back on before the next passage.",
      target: "talkback-radio",
      why: "A musician who pulls their protection to hear an instruction is trading a few seconds of clarity for exposure that doesn't announce itself until much later — the talkback reaches them without anyone having to shout across the room, and it's what gets the protection back on before the next passage rather than after this one.",
      missNote: "The passage ran with the protection still off. Nothing about how it sounded in the room told anyone anything had happened.",
      wrongNote: "Not the dosimeter — it only reads exposure after the fact. The talkback is what actually reaches the musician right now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.9, RSH_ACCENT);

    // ------------------------------------------------------------ the live room
    const floor = box(g, 7.2, 0.05, 6.0, 0, 0.025, 0, 0xffffff, { rough: 0.85 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { planks: 10, tones: [0x6b4a2e, 0x5c3f27, 0x76542f] }), { repeat: 4, px: 512 }), { rough: 0.6, metal: 0.02, color: 0xc9b89a });
    const controlRoomFloor = box(g, 2.4, 0.05, 2.0, -2.6, 0.026, -2.2, 0xffffff, { rough: 0.7 });
    controlRoomFloor.material = texturedMat(surfaceTexture((cx, w, h) => tileFace(cx, w, h, { tiles: 5 }), { repeat: 2, px: 256 }), { rough: 0.6, metal: 0.05, color: 0x9aa3ac });

    // -------------------------------------------------------------------- ramp
    const ramp = group(g, 2.0, 0, -1.0, -0.6);
    box(ramp, 1.4, 0.08, 2.6, 0, 0.3, 0, 0xffffff, { rough: 0.7 });
    ramp.children[0].material = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { planks: 5, tones: [0x8a6640, 0x9a7448] }), { repeat: 2, px: 256 }), { rough: 0.6, metal: 0.05, color: 0xc9b89a });
    ramp.rotation.x = -0.24;
    const wedgeGap = box(ramp, 0.3, 0.05, 0.2, 0, -0.05, 1.25, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(ramp, "wedge — missing?", 0, 0.15, 1.25, { css: "#d2312b", w: 0.36 });
    reg(hits, wedgeGap, "missing-ramp-wedge");
    const rampCase = group(ramp, 0.3, 0.08, 0.2, 0);
    box(rampCase, 0.4, 0.16, 0.28, 0, 0.08, 0, 0x2b2f34, { rough: 0.6 });
    holoTag(rampCase, "case on the ramp?", 0, 0.3, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, rampCase, "obstruction-case-on-ramp");

    // ---------------------------------------------------------------- the piano
    const piano = group(g, 2.0, 0, 0.6, -0.5);
    box(piano, 1.6, 0.1, 1.4, 0, 0.72, 0, 0x1b1e22, { rough: 0.3, metal: 0.1 });
    box(piano, 1.5, 0.6, 1.2, 0, 0.4, 0, 0x14171a, { rough: 0.3, metal: 0.1 });
    for (const [lx, lz] of [[-0.65, -0.55], [0.65, -0.55], [0, 0.6]]) cyl(piano, 0.05, 0.06, 0.4, lx, 0.2, lz, 0x0d0f11, { rough: 0.4, seg: 10 });
    const skid = box(piano, 1.8, 0.12, 1.6, 0, 0.06, 0, 0x8b6a45, { rough: 0.7 });
    void skid;
    for (const sx of [-1, 1]) cyl(piano, 0.08, 0.08, 0.05, sx * 0.8, 0.0, 0.5, 0x2b2f34, { rough: 0.6, seg: 12 });
    const casterKnob = box(piano, 0.06, 0.06, 0.06, -0.8, 0.02, -0.5, 0xe8b02e, { rough: 0.4, metal: 0.5 });
    holoTag(piano, "caster lock", -0.8, 0.2, -0.5, { css: RSH_CSS, w: 0.3 });
    reg(hits, casterKnob, "dolly-caster-lock");
    const strapAnchor = box(piano, 0.06, 0.06, 0.3, 0, 0.4, 0.7, 0xd8a63a, { rough: 0.5 });
    holoTag(piano, "ratchet strap", 0, 0.6, 0.7, { css: RSH_CSS, w: 0.3 });
    reg(hits, strapAnchor, "ratchet-strap-hold");
    reg(hits, piano, "piano-skid-descent");
    const releaseCasterHit = box(piano, 0.1, 0.06, 0.06, 0.8, 0.02, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(piano, "release the lock now?", 0.8, 0.22, -0.5, { css: "#d2312b", w: 0.42 });
    reg(hits, releaseCasterHit, "release-caster-lock-while-loaded");
    const reachUnderHit = box(piano, 1.4, 0.1, 1.2, 0, -0.06, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(piano, "reach under the skid?", 0, 0.08, 0.9, { css: "#d2312b", w: 0.4 });
    reg(hits, reachUnderHit, "reach-under-descending-piano");

    // -------------------------------------------------------------------- bench
    const benchMark = box(g, 0.5, 0.01, 0.3, 1.3, 0.011, 1.2, 0xffe9b0, { rough: 0.8, opacity: 0.85, transparent: true, cast: false });
    holoTag(g, "bench mark", 1.3, 0.2, 1.2, { css: RSH_CSS, w: 0.24 });
    reg(hits, benchMark, "bench-mark");
    const bench = group(g, -1.6, 0, 1.6, 0.2);
    box(bench, 0.7, 0.05, 0.3, 0, 0.45, 0, 0x1b1e22, { rough: 0.4 });
    for (const [bx, bz] of [[-0.3, -0.1], [0.3, -0.1], [-0.3, 0.1], [0.3, 0.1]]) cyl(bench, 0.02, 0.02, 0.42, bx, 0.22, bz, 0x2b2f34, { rough: 0.5, seg: 8 });
    reg(hits, bench, "piano-bench");
    holoTag(bench, "piano bench", 0, 0.6, 0, { css: RSH_CSS, w: 0.28 });

    // --------------------------------------------------------------- gear rack
    const rack = group(g, -2.8, 0, 1.4, 0.3);
    cyl(rack, 0.02, 0.02, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.18, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const headphones = ball(rack, 0.1, -0.14, 1.0, 0, 0x2b2f34, { rough: 0.5, seg: 10 });
    holoTag(rack, "isolating headphones", -0.14, 1.2, 0, { css: RSH_CSS, w: 0.36 });
    reg(hits, headphones, "iso-headphones");
    const earplugs = box(rack, 0.08, 0.04, 0.05, 0.14, 0.98, 0, 0xd8a63a, { rough: 0.6 });
    holoTag(rack, "musician's earplugs", 0.14, 1.12, 0, { css: RSH_CSS, w: 0.36 });
    reg(hits, earplugs, "musician-earplugs");
    const spareStrap = group(rack, 0.0, 0.7, 0.2);
    box(spareStrap, 0.3, 0.03, 0.02, 0, 0, 0, 0xb8a888, { rough: 0.7 });
    holoTag(spareStrap, "spare strap — frayed?", 0, 0.14, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, spareStrap, "frayed-spare-strap");
    const chest = toolChest(g, -3.0, -1.4, { ry: 0.3, color: 0x2b2b30 });
    void chest;

    // ------------------------------------------------------------- fire exit
    const exitCase = box(g, 0.4, 0.2, 0.3, -3.3, 0.1, -0.6, 0x2b2f34, { rough: 0.6 });
    holoTag(g, "fire exit — clear it?", -3.3, 0.4, -0.6, { css: "#d2312b", w: 0.42 });
    reg(hits, exitCase, "block-fire-exit-with-case");

    // ------------------------------------------------------------------ crew
    const musician = standingFigure(g, 0.3, -0.9, { ry: 2.4, cloth: 0x2b3a4a });
    holoTag(musician, "session musician", 0, 2.0, 0, { css: RSH_CSS, w: 0.36 });
    void musician;
    const dosimeterFigure = standingFigure(g, 1.0, -1.6, { ry: -2.6, cloth: 0x4a3a2b });
    const dosimeterBadge = box(dosimeterFigure, 0.05, 0.06, 0.02, 0, 1.35, 0.1, 0xe8b02e, { rough: 0.4, cast: false });
    holoTag(dosimeterFigure, "pit musician", 0, 2.0, 0, { css: RSH_CSS, w: 0.32 });
    reg(hits, dosimeterBadge, "dosimeter-badge");

    // ---------------------------------------------------------------- decoys
    const secondDolly = group(g, 2.6, 0, -2.4, 0.3);
    box(secondDolly, 0.4, 0.4, 0.25, 0, 0.2, 0, 0xdfe4e8, { rough: 0.6, metal: 0.2 });
    for (const sx of [-1, 1]) cyl(secondDolly, 0.05, 0.05, 0.04, sx * 0.15, 0.05, 0, 0x14171a, { rough: 0.7, seg: 10 }).rotation.x = Math.PI / 2;
    secondDolly.visible = false;
    const pitFlashLamp = box(dosimeterFigure, 0.04, 0.04, 0.02, 0, 1.5, 0.1, 0xd2312b, { rough: 0.4, emissive: 0xd2312b, ei: 0, cast: false });
    const pitMonitorWedge = box(g, 0.3, 0.2, 0.24, 1.6, 0.1, -1.9, 0x2b2f34, { rough: 0.6 });
    holoTag(pitMonitorWedge, "pit monitor — protection off?", 0, 0.3, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, pitMonitorWedge, "skip-hearing-protection-in-pit");

    // -------------------------------------------------------------- controls
    const monitorMeterProp = instrument(g, -2.2, 0.95, -1.8, { ry: 0.5, idle: "-- dB", color: RSH_ACCENT, w: 0.13, d: 0.15 });
    holoTag(monitorMeterProp, "monitor level", 0, 0.16, 0, { css: RSH_CSS, w: 0.32 });
    reg(hits, monitorMeterProp, "monitor-level-meter");
    const talkbackProp = instrument(g, -3.0, 0.95, -2.4, { ry: 0.7, idle: "TALKBACK", color: RSH_ACCENT, w: 0.13, d: 0.16 });
    holoTag(talkbackProp, "control room talkback", 0, 0.16, 0, { css: RSH_CSS, w: 0.4 });
    reg(hits, talkbackProp, "talkback-radio");
    const movingCrewRadioProp = instrument(g, 3.0, 0.9, 0.0, { ry: -0.7, idle: "CREW — CH 4", color: RSH_ACCENT, w: 0.12, d: 0.16 });
    holoTag(movingCrewRadioProp, "moving crew radio", 0, 0.16, 0, { css: RSH_CSS, w: 0.38 });
    reg(hits, movingCrewRadioProp, "moving-crew-radio");

    // -------------------------------------------------------------- paperwork
    const plan = holoPanel(g, 0.95, 0.66, -3.4, 1.35, 0.4, (cx, w, h) => {
      cx.fillStyle = "#160c22"; cx.fillRect(0, 0, w, h); cx.fillStyle = RSH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ede4fb"; cx.fillText("SESSION PLAN — HEARING CONSERVATION", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`; cx.fillStyle = "#f0e9fb";
      ["Monitor level: per the session's own band", "Dosimeter: today's chair, per the roster", "Piano load-in: before downbeat, ramp clear",
       "Musician's earplugs at every loud passage", "Talkback confirmed before the first take"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.125)));
    }, { ry: 0.6, accent: RSH_ACCENT });
    reg(hits, plan, "session-plan-panel");

    const chart = holoPanel(g, 0.8, 0.58, 3.0, 1.3, -1.0, (cx, w, h) => {
      cx.fillStyle = "#160c22"; cx.fillRect(0, 0, w, h); cx.fillStyle = RSH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ede4fb"; cx.fillText("PIANO LOAD CHART", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#f0e9fb";
      ["Concert grand: per the maker's own spec", "Skid + straps: rated for the full weight", "Two straps minimum, cinched even"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { ry: -0.6, accent: RSH_ACCENT });
    reg(hits, chart, "load-chart");

    const log = holoPanel(g, 0.6, 0.42, -3.4, 1.3, 1.6, (cx, w, h) => {
      cx.fillStyle = "#160c22"; cx.fillRect(0, 0, w, h); cx.fillStyle = RSH_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ede4fb"; cx.fillText("SESSION LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f0e9fb";
      ["Level: —", "Load-in: —", "Dosimeter: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.9, accent: RSH_ACCENT });
    reg(hits, log, "session-log");

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "hearing-ppe-donning") { headphones.visible = false; earplugs.visible = false; }
        if (step.id === "caster-lock") casterKnob.material = mat(0x59c97b, { rough: 0.5 });
        if (step.id === "bench-placement") benchMark.visible = false;
        if (step.id === "session-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#160c22"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#ede4fb"; cx.fillText("SESSION LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Level: proven inside band", "Load-in: piano settled, bench placed", "Dosimeter: fitted, logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "second-dolly-meets-piano") { secondDolly.visible = true; }
        if (it.id === "protection-removed-early") { pitFlashLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "second-dolly-meets-piano") { secondDolly.visible = false; }
        if (it.id === "protection-removed-early") { pitFlashLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0, rough: 0.4 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "caster-lock") casterKnob.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "monitor-level-check") repaint(monitorMeterProp.userData.screen, signFace(`${Math.round(gg.t * 110)}`, { bg: "#0d1c24", accent: gg.t >= 0.3 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f0e9fb", scale: 0.6 }));
        if (step?.id === "piano-skid-descent" && session.holding) piano.position.z = 0.6 - (session.track.v ?? 0.5) * 1.2;
        void dt; void t; void CITY;
      },
    };
  },
};
