import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, lockTag, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Terminal Lighting Mast Service VR — Maritime & Ports, the
// port maintenance pack.
//
// A high-mast light pole in the container yard with one luminaire out, and
// an aerial lift set up at its base on a night-shift outage. The learner is
// the ILWU maintenance and repair electrician; the IUOE operator runs the
// lift. The yard's lighting is its traffic control after dark, so the outage
// is scheduled with the terminal, the mast is isolated at its handhole, and
// the platform is the only way up — the mast's climbing pegs are for nobody.

const PTL_ACCENT = 0xe8c14b;

export const SIM_PT_TERMINAL_LIGHTING_MAST_SERVICE = {
  id: "pt-terminal-lighting-mast-service",
  index: "222",
  domain: "Maritime & Ports",
  trade: "ILWU maintenance and repair electrician — yard high-mast lighting, PMA training programme, with the IUOE operator on the aerial lift",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "clear",
  certification: "ILWU maintenance and repair with the PMA training programme; IUOE aerial lift operation; OSHA 29 CFR 1917 marine terminals, including the yard's lighting provisions; 29 CFR 1910.147 control of hazardous energy; NFPA 70E for the handhole and the mast circuit; ANSI A92 for the aerial lift; ANSI Z359 for the harness and the tie-off",
  name: "Terminal Lighting Mast Service",
  title: simTitle("Terminal Lighting Mast Service"),
  tagline: "A yard high-mast with a luminaire out: the outage scheduled, the mast isolated, locked and tested dead at the handhole, harness and lift inspected, outriggers levelled while a hustler enters the lane, tied off before the platform leaves the ground, the ascent held steady through a wind call, the failed driver found, a new luminaire fitted and aimed, the mast wiring meggered, the strike watched, and the outage logged back",
  accent: PTL_ACCENT,
  accentCss: "#e8c14b",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "mast-lit-clean", name: "Mast Lit Clean", note: "Isolated, locked and tested before the handhole, tied off before the platform rose, the lane and the wind both answered, and the mast back on at the strike" },

  supportLine: "your ILWU local's member assistance programme, with the PMA-ILWU benefit plan's counselling line behind it",

  game: system({
    name: "Yard Lighting",
    currency: "LUX",
    ranks: ["Yard Hand", "M&R Electrician", "Lighting Tech", "Lead Electrician", "High-Mast Certified"],
    badges: [
      { id: "tested-dead", name: "Tested Dead", note: "The mast isolated, locked and tested dead at the handhole in that order", test: AWARD.stepClean("isolate-mast") },
      { id: "tied-first", name: "Tied Off First", note: "Clipped to the platform anchor before it left the ground", test: AWARD.stepClean("tie-off") },
      { id: "mast-discipline", name: "Mast Discipline", note: "Never on the pegs, never in the handhole live, never on the rail, never an outrigger on a grate", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "No corrections anywhere in the service", test: AWARD.clean },
      { id: "steady-ascent", name: "Steady Ascent", note: "Held the platform's ascent in band the whole way up", test: AWARD.unbroken },
      { id: "outage-window", name: "Outage Window", note: "Mast back on inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "climb-mast-untied": "You started up the mast's climbing pegs with no harness clipped to anything. A high-mast is thirty metres of steel with pegs for a rescue climb, not for a service call, and ANSI Z359 has a fall arrest on before a foot leaves the ground on anything climbed — the platform is here precisely so nobody climbs the mast, and a climb untied is a fall waiting for the first wet peg.",
    "energised-handhole-reach": "You reached into the mast's handhole with the circuit still live. The handhole is where the mast's branch circuit lands, and it is live from the yard's lighting panel until the disconnect is open and the conductors are tested dead — NFPA 70E treats it as an energised enclosure until then, and 29 CFR 1910.147 puts the lock on before a hand goes past the cover.",
    "platform-rail-stand": "You stood on the platform's guardrail to reach the luminaire bracket. ANSI A92 has the platform floor as the only place a foot goes on an aerial lift, because the guardrail is what the harness is a backup to — standing on it puts the whole body above the rail with nothing but the lanyard, and the lanyard is not designed to catch that fall from there. The platform is repositioned; the person is not.",
    "outrigger-on-grate": "You set the lift's outrigger pad on the drain grate. A drain grate carries a person and a hustler's tyre, not an outrigger's point load, and a grate that lets go under a raised platform is a platform going over with somebody in it — ANSI A92 has the outriggers on firm ground or cribbing, and the grate is neither.",
  },

  lateNotes: {
    "platform-controls": "The platform does not leave the ground until the harness is clipped to its anchor — tie off first.",
    "aiming-bolt": "The luminaire is aimed once it is fitted to the bracket, not before there is a luminaire to aim.",
    "mast-restore-switch": "The mast is restored once the new luminaire is fitted and the wiring has been meggered — not before.",
  },

  steps: [
    {
      id: "outage-plan", kind: "select", target: "lighting-plan-board",
      title: "Schedule the mast outage with the terminal",
      cue: "Confirm the outage window with the terminal: which mast, which yard blocks lose light, and what the night gang does about it.",
      why: "A yard's high-mast lighting is its traffic control after dark, and 29 CFR 1917 has the terminal keep the working areas lit: a mast taken out for service takes the light off blocks where hustlers, lashers and clerks are working, and the terminal has to know which ones and either move the work or light them another way. The outage is scheduled and announced rather than simply started, because the first sign of an unannounced outage is a hustler driving into a dark block at yard speed.",
    },
    {
      id: "isolate-mast", kind: "sequence",
      targets: ["mast-disconnect", "mast-padlock", "test-dead-point"],
      itemNames: { "mast-disconnect": "mast branch disconnect open", "mast-padlock": "your lock on the disconnect", "test-dead-point": "conductors tested dead at the handhole" },
      title: "Open the mast's disconnect, lock it, and test the handhole dead",
      cue: "Open the mast's branch disconnect, hang your lock, then test each conductor at the handhole dead with a tester proven live before and after.",
      why: "29 CFR 1910.147 has the isolation, the lock and the verification in that order because each one proves the last: the disconnect opens the circuit, the lock holds it open against a lighting panel someone else may restore at dawn, and the test at the handhole is the only proof that the disconnect opened this mast's circuit and not the next mast's. NFPA 70E's live-dead-live test is done at the handhole itself, because that is where the hands are going, not at the panel where they are not.",
      outOfOrderNote: "Disconnect first, then your lock, then the test at the handhole — a lock hung on a closed disconnect holds nothing, and a test before the lock proves a condition someone can change.",
    },
    {
      id: "harness-and-lift", kind: "sequence", anyOrder: true,
      targets: ["harness-check", "lift-controls-check"],
      itemNames: { "harness-check": "harness and lanyard inspected", "lift-controls-check": "lift pre-use inspection and function check" },
      title: "Inspect the harness and do the lift's pre-use check",
      cue: "Inspect the harness webbing, stitching and hardware and the lanyard's snap hooks; then walk the lift's pre-use checklist and function test its controls from the ground.",
      why: "ANSI Z359 has the harness inspected before every use by the person wearing it, because a cut in the webbing or a snap hook that does not close is invisible once the harness is on, and ANSI A92 has the lift inspected and function-tested before every shift for the same reason — a control that sticks is found on the ground, not at the luminaire ring. Both are the kind of check that feels unnecessary every time until the one time it is not.",
    },
    {
      id: "outrigger-level", kind: "hold", target: "outrigger-bubble", seconds: 4,
      title: "Set the outriggers and level the lift",
      cue: "Hold the level: each outrigger on firm ground or cribbing, pads loaded, the bubble centred and staying centred as the chassis takes its weight.",
      why: "An aerial lift's stability is its outriggers, and ANSI A92 has them set on firm ground with the chassis level before the platform rises, because the lean that does not matter at the base is metres of overhang at the luminaire ring. The bubble is watched as the outriggers take the weight rather than read once, because a pad settling into soft ground or a drain grate shows up as a bubble that drifts — and a bubble that drifts at the base is a platform that drifts at height.",
      holdBreakNote: "Released before the bubble had stayed centred under load — a level read once is not a level that holds. Set the outriggers and hold the check again.",
    },
    {
      id: "tie-off", kind: "select", target: "platform-anchor",
      title: "Clip the harness to the platform anchor before it leaves the ground",
      cue: "Clip your lanyard to the platform's rated anchor point, and check the operator's — before the platform controls are touched.",
      why: "ANSI Z359 and ANSI A92 both put the tie-off on the platform's own rated anchor, and both put it on before the platform moves: a boom lift's platform can bounce a person out over the rail on a sudden stop or a wheel dropping into a rut, and the lanyard to the anchor is what keeps them in. It is clipped on the ground because the moment the platform is a metre up is the moment nobody remembers to look down at their own harness.",
    },
    {
      id: "platform-ascent", kind: "track", target: "platform-controls", seconds: 6,
      title: "Raise the platform steadily to the luminaire ring",
      cue: "Bring the platform up on the boom at a steady rate — never a surge, never a stall — watching the ring come to you and the boom's angle.",
      why: "The ascent is where the lift is at its least stable: the boom extending and raising moves the centre of gravity out over the outriggers, and a surge on the controls is a platform whip at the far end that the harness has to catch. A steady rate is what keeps the platform predictable to the two people on it and to the operator, and it is held rather than driven fast because the luminaire ring is the same height either way and the only thing speed buys is the whip.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.48, drift: 0.12, label: "ASCENT RATE", readout: (v) => (v < 0.4 ? "stalling — boom hunting" : v > 0.6 ? "surging — platform whip" : "steady ascent") },
      holdBreakNote: "The rate broke out of band — the platform whipped at the far end and the harness caught it. Bring the controls back to a steady ascent.",
    },
    {
      id: "find-fault", kind: "find", noHint: true,
      targets: ["failed-driver"],
      itemNames: { "failed-driver": "failed driver on the dark luminaire" },
      itemNotes: { "failed-driver": "The dark luminaire's driver has cooked — its case is discoloured and the terminals show heat marks, and the photocell lead into it has chafed through on the bracket edge. The lamp is fine; the driver and the lead are the fault." },
      title: "Find the fault on the dark luminaire",
      cue: "At the ring, check the dark luminaire: its driver, its terminals, the photocell lead and the connections back to the ring's junction box.",
      why: "A luminaire out on a high-mast is rarely the lamp: it is the driver that has cooked in the summer, the lead that has chafed on the bracket in a winter of wind, or the terminal that has worked loose under the mast's sway, and replacing the lamp for any of those is a second trip up the mast in a week. The fault is found at the ring with the circuit dead, part by part, because the platform is the expensive part of the job and the second trip is the one nobody scheduled.",
    },
    {
      id: "fit-luminaire", kind: "drag", target: "new-luminaire",
      title: "Fit the replacement luminaire to the bracket",
      cue: "Lift the new luminaire from the platform floor and seat it on the ring's bracket, its mounting slots on the bracket studs.",
      why: "The luminaire seats on the bracket studs with its slots and hangs there while its bolts are started, and it is lifted from the platform floor with both feet on that floor and the harness taking nothing: a luminaire is heavy and awkward at arm's length over a rail, and the bracket is where it goes, not the ground thirty metres down. It is fitted before it is aimed and before it is wired, because a luminaire hung on one stud and wired first is a luminaire wired at the wrong angle.",
      drag: { to: "luminaire-bracket", radius: 0.5, missNote: "Not on the studs — the luminaire has to hang on the bracket's studs by its slots before a bolt or a wire goes near it." },
    },
    {
      id: "aim-and-bolt", kind: "turn", target: "aiming-bolt",
      title: "Set the aiming angle and torque the aiming bolt",
      cue: "Set the luminaire to the aiming angle on the plan, then pull the aiming bolt up to the maker's figure.",
      why: "A high-mast luminaire is aimed by the lighting plan to put its light on a particular block of the yard without glare into the crane cabs and the hustler lanes, and one luminaire aimed wrong is a dark block on one side and a blinded driver on the other. The aiming bolt is torqued to the maker's figure because a mast sways in every wind and a bolt pulled up by feel walks, and a luminaire that walks re-aims itself into somebody's eyes over a season.",
      turn: { turns: 0.75, label: "AIMING BOLT", readout: (t) => (t < 0.3 ? "loose" : t < 0.7 ? "pulling up" : "at figure — aimed") },
    },
    {
      id: "megger", kind: "gauge", target: "megger-tester",
      title: "Test the mast wiring's insulation resistance",
      cue: "Megger the mast's conductors to ground and to each other from the handhole and commit the reading against the minimum.",
      why: "The mast's conductors have been inside a steel pole through years of condensation and sway, and the driver that cooked may have taken its insulation with it: an insulation resistance reading against the minimum is what says the circuit can be re-energised without a fault to the mast itself, which is a fault to a steel pole a person will lean on. The reading is committed inside the band because a marginal reading on a wet night is a mast that trips its breaker at dawn, or does not.",
      gauge: { label: "INSULATION", speed: 0.7, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 200)} MΩ`, missNote: "Below the minimum — do not restore. Find the conductor that reads low before the next test." },
    },
    {
      id: "strike-watch", kind: "hold", target: "mast-restore-switch", seconds: 4,
      title: "Restore the mast and watch the strike",
      cue: "Platform down and clear, your lock off, the disconnect closed — hold and watch the ring: every luminaire striking, warming and holding.",
      why: "The lock comes off by the hand that put it on, with the platform down and everyone clear of the handhole, and the disconnect closes with somebody watching the ring rather than walking away: a luminaire that strikes and drops out in its warm-up is a driver about to fail the way the last one did, and it shows in the first minute or not at all. The watch is held through the strike because the mast is not back in service until every luminaire has held.",
      holdBreakNote: "The watch broke before every luminaire had struck and held — a luminaire that drops out in warm-up is the next outage. Restore and watch again.",
    },
    {
      id: "lighting-log", kind: "select", target: "lighting-log",
      title: "Log the outage and the repair, and clear the mast with the terminal",
      cue: "Record the mast, the outage window, the failed driver and lead, the luminaire replaced and its aim, the insulation reading, and clear the outage with the terminal.",
      why: "The lighting log is what the terminal's next outage is planned against and what the yard's lighting engineer reads when a block keeps going dark: the driver that failed is a pattern if it is the third on that mast, the insulation reading is the number the next service is compared with, and the outage cleared with the terminal is what puts the blocks back on the night gang's map. Written on the ground before the lift is stowed, it is the job; written tomorrow it is a guess.",
    },
    {
      id: "crew-checkin", kind: "select", target: "night-radio",
      title: "Check in with the night gang boss and the lift operator",
      cue: "Call the night gang boss and the operator: the mast is back, the blocks are lit, and how the crew is after a shift at height with a wind call through it.",
      why: "The night gang boss put people in a dark block on the strength of this outage being short, and deserves to hear the mast is back rather than to notice it from the light. It is also the crew's own check-in — a night at thirty metres with a hustler under the lift and a wind call halfway up leaves things behind, and saying them to the crew before the lift is stowed is the ILWU's own practice; the member assistance line is there for what the crew cannot carry alone, and it is named rather than assumed.",
    },
  ],

  interrupts: [
    {
      id: "hustler-under-lift",
      kind: "Hustler entering the lane past the lift",
      after: "outrigger-level", delay: 2, seconds: 12,
      alert: "A hustler has turned into the lane beside the mast with a box on, heading for the block the outage darkened — the lift's outriggers are out to the lane line.",
      cue: "Drop the lane gate arm now — the outriggers are in the driver's line and he is looking at the dark block, not at you.",
      target: "lane-gate-arm",
      why: "A hustler driver in a darkened block is driving by the lane markings and the gate, and an aerial lift's outrigger out to the lane line is a steel leg at bumper height that the cab does not see: 29 CFR 1917 puts the traffic control on the terminal, and at a lift set up beside a lane that control is the gate arm, dropped the moment a vehicle turns in rather than once it is plainly not slowing — because a hit outrigger is a lift with a platform going over.",
      missNote: "The hustler came down the lane past the outrigger with nothing telling the driver to stop; the chassis cleared the pad by a hand's width, and the levelling went on as if the lane were empty.",
      wrongNote: "The lane gate arm — the driver answers to the gate, and nothing else at the base of the mast is in his eyeline from the cab.",
    },
    {
      id: "wind-call",
      kind: "Wind gust warning on the terminal radio",
      after: "platform-ascent", delay: 2, seconds: 14,
      alert: "The terminal radio calls a gust front coming across the yard ahead of a storm cell — the cranes are stopping and the windsock has swung hard.",
      cue: "Read the lift's anemometer now and hold the platform at whatever it says — the lift's wind limit is the number that decides.",
      target: "anemometer-readout",
      why: "An aerial lift has a wind limit set by its maker and ANSI A92 has the operator hold to it, and a gust front across a yard arrives faster than a platform comes down from thirty metres: the anemometer on the lift is the number that says whether the ascent continues, holds, or comes down now, and it is read the moment the call comes rather than when the platform starts to move on its own. The windsock says a gust is coming; the anemometer says what to do about it.",
      missNote: "The gust front crossed the yard with the platform still climbing on a rate nobody had checked against the lift's wind limit — the platform swung on the boom with two people in it and the ascent carried on as if the radio had said nothing.",
      wrongNote: "The anemometer on the lift — the wind limit is the lift's own number, and the readout is the only thing here that says whether the platform is inside it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, PTL_ACCENT);

    // -------------------------------------------------------------- yard deck
    const deck = box(g, 6.4, 0.1, 5.6, 0, 0.05, 0, 0xffffff, { rough: 0.92 });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#23292f", base2: "#1b2127", seam: "rgba(0,0,0,0.42)" }), { repeat: 6, px: 512 }),
      { rough: 0.9, metal: 0.03, color: 0xb2bac2 },
    );
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.5, 2.2, 0.111, -2.4 + i * 1.1, 0xf2c14b, { rough: 0.7, cast: false });
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.012, 0.5, 3.1, 0.111, -2.4 + i * 1.1, 0xf2c14b, { rough: 0.7, cast: false });
    // A drain grate beside the lift's outrigger — the wrong place for a pad.
    const grate = group(g, -1.9, 0.1, 1.5);
    box(grate, 0.5, 0.02, 0.5, 0, 0.011, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) box(grate, 0.03, 0.024, 0.46, -0.18 + i * 0.09, 0.014, 0, 0x5b6771, { rough: 0.5, metal: 0.6, cast: false });
    holoTag(grate, "outrigger on the grate?", 0, 0.34, 0, { css: "#d2312b", w: 0.46 });
    reg(hits, grate, "outrigger-on-grate");

    // ------------------------------------------------------------- the mast
    const mast = group(g, -0.6, 0.1, -1.4);
    box(mast, 0.9, 0.12, 0.9, 0, 0.06, 0, 0x3a4148, { rough: 0.6, metal: 0.4 });
    for (const [bx, bz] of [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]]) cyl(mast, 0.03, 0.03, 0.08, bx, 0.14, bz, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    cyl(mast, 0.16, 0.24, 6.0, 0, 3.1, 0, 0x8b98a5, { rough: 0.5, metal: 0.6, seg: 18 });
    // Climbing pegs — the wrong way up.
    for (let i = 0; i < 6; i++) box(mast, 0.5, 0.03, 0.03, 0, 0.9 + i * 0.5, 0.25, 0x6b7680, { rough: 0.5, metal: 0.6, cast: false });
    const pegHit = box(mast, 0.5, 0.6, 0.1, 0, 1.1, 0.28, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mast, "climb it untied?", 0, 1.7, 0.42, { css: "#d2312b", w: 0.36 });
    reg(hits, pegHit, "climb-mast-untied");
    // Handhole with its cover open, the disconnect and the test point inside.
    const handhole = group(mast, 0, 0.7, -0.24);
    box(handhole, 0.22, 0.32, 0.06, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const cover = box(handhole, 0.24, 0.34, 0.02, -0.2, 0, -0.04, 0x8b98a5, { rough: 0.5, metal: 0.6 });
    cover.rotation.y = 1.3;
    const reachHit = box(handhole, 0.2, 0.28, 0.06, 0, 0, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mast, "reach in live?", 0, 1.05, -0.4, { css: "#d2312b", w: 0.32 });
    reg(hits, reachHit, "energised-handhole-reach");
    const testPoint = group(handhole, 0.04, 0.08, -0.03);
    for (let i = 0; i < 3; i++) cyl(testPoint, 0.012, 0.012, 0.04, -0.05 + i * 0.05, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    holoTag(mast, "test dead at the handhole", 0, 0.42, -0.4, { css: "#e8c14b", w: 0.5 });
    reg(hits, testPoint, "test-dead-point");
    // Luminaire ring at the top with four heads; the dark one is the fault.
    const ring = group(mast, 0, 5.4, 0);
    torus(ring, 0.6, 0.04, 0, 0, 0, 0x3a4148, { rough: 0.55, metal: 0.5, seg: 8, seg2: 28 }).rotation.x = Math.PI / 2;
    const heads = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const h = group(ring, Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7, a);
      box(h, 0.3, 0.1, 0.36, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
      const lens = box(h, 0.26, 0.02, 0.3, 0, -0.06, 0, i === 2 ? 0x3a3a3a : 0xfff0c0, i === 2 ? { rough: 0.5 } : { rough: 0.3, emissive: 0xfff0c0, ei: 1.6 });
      heads.push({ h, lens });
    }
    const darkHead = heads[2];
    const driver = box(darkHead.h, 0.12, 0.06, 0.1, 0, 0.08, 0.1, 0x4a3320, { rough: 0.8 });
    reg(hits, driver, "failed-driver");
    const bracketSocket = torus(darkHead.h, 0.16, 0.008, 0, 0.02, -0.02, PTL_ACCENT, { emissive: PTL_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    bracketSocket.rotation.x = Math.PI / 2;
    reg(hits, bracketSocket, "luminaire-bracket");
    const aimBolt = group(darkHead.h, 0.17, 0.02, 0);
    cyl(aimBolt, 0.025, 0.025, 0.04, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(darkHead.h, "aiming bolt — turn", 0.2, 0.3, 0, { css: "#e8c14b", w: 0.36 });
    reg(hits, aimBolt, "aiming-bolt");

    // -------------------------------------------------------- disconnect box
    const dbox = group(g, -2.3, 0.1, -0.6, 0.5);
    cyl(dbox, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 10 });
    box(dbox, 0.4, 0.5, 0.2, 0, 1.3, 0, 0xd7dde2, { rough: 0.5, metal: 0.3 });
    const disc = box(dbox, 0.12, 0.14, 0.05, -0.08, 1.38, 0.12, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const discHandle = box(dbox, 0.03, 0.16, 0.03, -0.08, 1.38, 0.15, 0xd2312b, { rough: 0.5 });
    holoTag(dbox, "mast disconnect", 0, 1.62, 0.12, { css: "#e8c14b", w: 0.34 });
    reg(hits, disc, "mast-disconnect");
    const hasp = group(dbox, 0.1, 1.2, 0.12);
    box(hasp, 0.08, 0.03, 0.03, 0, 0, 0, 0x8a949d, { rough: 0.4, metal: 0.8 });
    const lock = lockTag(hasp, 0, -0.05, 0.02, { lines: ["M&R — MAST", "OUTAGE"] });
    lock.visible = false;
    holoTag(dbox, "hasp — your lock", 0.1, 1.06, 0.12, { css: "#e8c14b", w: 0.32 });
    reg(hits, hasp, "mast-padlock");
    const restore = group(dbox, 0.1, 1.42, 0.12);
    const restoreBtn = cyl(restore, 0.03, 0.03, 0.02, 0, 0, 0, 0x59c97b, { rough: 0.4, seg: 12 });
    restoreBtn.rotation.x = Math.PI / 2;
    holoTag(dbox, "restore — hold", 0.12, 1.54, 0.16, { css: "#e8c14b", w: 0.3 });
    reg(hits, restore, "mast-restore-switch");

    // ------------------------------------------------------------ the lift
    const lift = group(g, 0.9, 0.1, 0.4, -0.5);
    box(lift, 1.4, 0.4, 2.2, 0, 0.45, 0, 0x2f6f4a, { rough: 0.55, metal: 0.35 });
    for (const [wx, wz] of [[-0.6, -0.8], [0.6, -0.8], [-0.6, 0.8], [0.6, 0.8]]) cyl(lift, 0.28, 0.28, 0.26, wx, 0.28, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.z = Math.PI / 2;
    for (const [ox, oz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      box(lift, 0.5, 0.08, 0.1, ox * 0.9, 0.3, oz * 1.0, 0x8a949d, { rough: 0.45, metal: 0.7 });
      cyl(lift, 0.04, 0.04, 0.3, ox * 1.12, 0.17, oz * 1.0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
      box(lift, 0.3, 0.04, 0.3, ox * 1.12, 0.02, oz * 1.0, 0x3a4148, { rough: 0.7, metal: 0.4 });
    }
    const bubble = group(lift, 0.5, 0.68, -0.6);
    box(bubble, 0.16, 0.04, 0.16, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const bubbleBall = ball(bubble, 0.02, 0.03, 0.03, 0.02, 0x59c97b, { rough: 0.3, emissive: 0x59c97b, ei: 1.2, seg: 8 });
    holoTag(lift, "outrigger level — hold", 0.5, 0.95, -0.6, { css: "#e8c14b", w: 0.46 });
    reg(hits, bubble, "outrigger-bubble");
    const turret = group(lift, 0, 0.75, 0.3);
    cyl(turret, 0.4, 0.4, 0.3, 0, 0, 0, 0x2f6f4a, { rough: 0.55, metal: 0.35, seg: 16 });
    const boom = group(turret, 0, 0.2, 0);
    boom.rotation.z = 0.3;
    box(boom, 2.0, 0.2, 0.2, -1.0, 0, 0, 0x2f6f4a, { rough: 0.55, metal: 0.35 });
    box(boom, 1.2, 0.16, 0.16, -2.4, 0, 0, 0x8fb37a, { rough: 0.55, metal: 0.35 });
    const platform = group(boom, -3.05, -0.2, 0);
    platform.rotation.z = -0.3;
    box(platform, 0.9, 0.06, 0.7, 0, 0, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    for (const [px, pz] of [[-0.43, -0.33], [0.43, -0.33], [-0.43, 0.33], [0.43, 0.33]]) cyl(platform, 0.015, 0.015, 1.0, px, 0.5, pz, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 6 });
    for (const pz of [-0.33, 0.33]) box(platform, 0.9, 0.03, 0.03, 0, 1.0, pz, 0x8a949d, { rough: 0.45, metal: 0.7 });
    for (const px of [-0.43, 0.43]) box(platform, 0.03, 0.03, 0.7, px, 1.0, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const railStand = box(platform, 0.9, 0.06, 0.08, 0, 1.03, -0.33, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(platform, "stand on the rail?", 0, 1.3, -0.33, { css: "#d2312b", w: 0.4 });
    reg(hits, railStand, "platform-rail-stand");
    const anchorPt = group(platform, 0.3, 0.55, 0.3);
    const anchorRing = torus(anchorPt, 0.04, 0.01, 0, 0, 0, 0xe8b02e, { rough: 0.4, metal: 0.7, seg: 6, seg2: 14 });
    holoTag(platform, "platform anchor — clip", 0.3, 0.8, 0.33, { css: "#e8c14b", w: 0.44 });
    reg(hits, anchorPt, "platform-anchor");
    const pctl = group(platform, -0.3, 0.6, 0.3);
    box(pctl, 0.24, 0.16, 0.08, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    const joystick = cyl(pctl, 0.01, 0.01, 0.12, 0, 0.1, 0, 0x8a949d, { rough: 0.4, metal: 0.8, seg: 6 });
    ball(pctl, 0.025, 0, 0.17, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
    holoTag(platform, "platform controls — hold", -0.3, 0.9, 0.33, { css: "#e8c14b", w: 0.48 });
    reg(hits, pctl, "platform-controls");
    void joystick;
    const anemo = instrument(platform, -0.3, 0.06, -0.2, { idle: "-- m/s", color: 0xe8c14b, w: 0.1, d: 0.1 });
    holoTag(platform, "anemometer", -0.3, 0.3, -0.2, { css: "#e8c14b", w: 0.26 });
    reg(hits, anemo, "anemometer-readout");
    const newLum = group(platform, 0.25, 0.1, -0.15);
    box(newLum, 0.3, 0.1, 0.36, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    box(newLum, 0.26, 0.02, 0.3, 0, 0.06, 0, 0xfff0c0, { rough: 0.3 });
    holoTag(platform, "new luminaire", 0.25, 0.35, -0.15, { css: "#e8c14b", w: 0.3 });
    reg(hits, newLum, "new-luminaire");
    const groundCtl = group(lift, -0.6, 0.7, 0.9);
    box(groundCtl, 0.3, 0.2, 0.1, 0, 0, 0, 0x22262b, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 3; i++) cyl(groundCtl, 0.02, 0.02, 0.02, -0.08 + i * 0.08, 0.02, 0.06, [0x59c97b, 0xe8b02e, 0xd2312b][i], { rough: 0.4, seg: 8 }).rotation.x = Math.PI / 2;
    holoTag(lift, "lift pre-use check", -0.6, 1.0, 0.9, { css: "#e8c14b", w: 0.38 });
    reg(hits, groundCtl, "lift-controls-check");

    // ------------------------------------------- harness rack, chest, tools
    const rack = group(g, -2.4, 0.1, 1.0, 0.3);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.3, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const harness = group(rack, 0.14, 1.0, 0);
    box(harness, 0.04, 0.5, 0.04, -0.08, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harness, 0.04, 0.5, 0.04, 0.08, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harness, 0.2, 0.04, 0.04, 0, 0.1, 0, 0xe07a3f, { rough: 0.8 });
    torus(harness, 0.03, 0.01, 0, 0.26, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(rack, "harness — inspect", 0.14, 1.5, 0, { css: "#e8c14b", w: 0.36 });
    reg(hits, harness, "harness-check");
    const chest = toolChest(g, 2.0, -1.6, { ry: 2.5, color: 0x2f4f6f });
    const megger = instrument(chest, -0.1, 0.79, 0.02, { ry: 0.2, idle: "-- MΩ", color: 0xe8c14b, w: 0.1, d: 0.16 });
    holoTag(megger, "insulation tester", 0, 0.15, 0, { css: "#e8c14b", w: 0.36 });
    reg(hits, megger, "megger-tester");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 3 · NIGHT", color: 0xe8c14b, w: 0.1, d: 0.16 });
    holoTag(radio, "night radio", 0, 0.15, 0, { css: "#e8c14b", w: 0.28 });
    reg(hits, radio, "night-radio");

    // -------------------------------------------- lane gate, hustler, windsock
    const gate = group(g, 1.8, 0.1, -2.4);
    box(gate, 0.2, 1.0, 0.2, 0, 0.5, 0, 0xd2312b, { rough: 0.6, metal: 0.3 });
    const arm = box(gate, 1.6, 0.06, 0.06, 0.8, 1.0, 0, 0xf2c14b, { rough: 0.6 });
    arm.rotation.z = 1.3;
    arm.position.set(0.15, 1.6, 0);
    holoTag(gate, "lane gate arm", 0, 1.3, 0.2, { css: "#e8c14b", w: 0.3 });
    reg(hits, gate, "lane-gate-arm");
    const hustler = group(g, 2.65, 0.1, 4.8);
    box(hustler, 0.9, 0.5, 1.4, 0, 0.45, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    box(hustler, 0.86, 0.6, 0.7, 0, 1.0, -0.3, 0x6fb35a, { rough: 0.5, metal: 0.3 });
    box(hustler, 0.7, 0.3, 0.02, 0, 1.1, -0.66, 0x274a5f, { rough: 0.3, metal: 0.2, cast: false });
    for (const [wx, wz] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, 0.45], [0.45, 0.45]]) cyl(hustler, 0.22, 0.22, 0.2, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 12 }).rotation.z = Math.PI / 2;
    box(hustler, 0.9, 1.0, 2.2, 0, 1.1, 1.8, 0xb8402f, { rough: 0.6, metal: 0.3 });
    hustler.visible = false;
    const hustlerHome = hustler.position.clone();
    const sockPost = group(g, 2.6, 0.1, 1.2);
    cyl(sockPost, 0.02, 0.02, 2.2, 0, 1.1, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const sock = cyl(sockPost, 0.08, 0.05, 0.5, 0.25, 2.15, 0, 0xe07a3f, { rough: 0.7, seg: 10 });
    sock.rotation.z = Math.PI / 2 - 0.3;

    // ------------------------------------------------------------ paperwork
    const board = holoPanel(g, 0.95, 0.62, 0.0, 1.25, 2.3, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8c14b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf1cf"; cx.fillText("LIGHTING OUTAGE — MAST 12 · NIGHT SHIFT", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Blocks D3–D5 lose light: work moved to D6, tower lights on", "Disconnect · lock · test dead at the handhole", "Harness + lift inspected; tie off before the platform moves",
       "Wind limit: the lift's own — anemometer on the platform", "Aim: per the lighting plan, bolt to the maker's figure", "Megger before restore; watch the strike"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 3.1, accent: PTL_ACCENT });
    reg(hits, board, "lighting-plan-board");
    const logBoard = holoPanel(g, 0.6, 0.42, -2.5, 1.25, 2.1, (cx, w, h) => {
      cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8c14b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbf1cf"; cx.fillText("LIGHTING LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Mast 12: OUTAGE OPEN", "Fault: —", "Insulation: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 2.5, accent: PTL_ACCENT });
    reg(hits, logBoard, "lighting-log");

    // ---------------------------------------------------------------- crew
    const electrician = standingFigure(g, -1.4, 0.4, { ry: 1.6, cloth: 0x1f3a52, vest: 0xf2c14b, helmet: 0xe8b02e, gloves: true, harness: true });
    holoTag(electrician, "M&R electrician", 0, 1.9, 0, { css: "#e8c14b", w: 0.34 });
    const operator = standingFigure(g, 2.75, -0.35, { ry: -2.0, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22, harness: true });
    holoTag(operator, "lift operator", 0, 1.9, 0, { css: "#e8c14b", w: 0.3 });
    cone(g, -1.0, 2.5); cone(g, 1.4, -2.4);
    barrierPanel(g, 0.4, 2.55, { color: 0xf2c14b, ry: 0 });

    const gustMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.7 });
    const calmMat = sock.material;
    const litMat = mat(0xfff0c0, { rough: 0.3, emissive: 0xfff0c0, ei: 1.6 });
    const darkMat = mat(0x3a3a3a, { rough: 0.5 });
    const alarmMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.0, rough: 0.4 });
    const okMat = mat(0x59c97b, { rough: 0.3, emissive: 0x59c97b, ei: 1.2 });
    let gust = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.4, -0.9),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "isolate-mast") { discHandle.rotation.z = Math.PI / 2; lock.visible = true; for (const h of heads) h.lens.material = darkMat; }
        if (step.id === "tie-off") anchorRing.material = okMat;
        if (step.id === "platform-ascent") { boom.rotation.z = 1.25; platform.rotation.z = -1.25; }
        if (step.id === "find-fault") driver.material = mat(0x2b2f34, { rough: 0.5, metal: 0.5 });
        if (step.id === "fit-luminaire") { newLum.visible = false; darkHead.lens.material = mat(0x6a6a5a, { rough: 0.4 }); }
        if (step.id === "megger") repaint(megger.userData.screen, signFace("PASS", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "strike-watch") { boom.rotation.z = 0.3; platform.rotation.z = -0.3; discHandle.rotation.z = 0; lock.visible = false; for (const h of heads) h.lens.material = litMat; }
        if (step.id === "lighting-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#08161e"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fbf1cf"; cx.fillText("LIGHTING LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Mast 12: BACK IN SERVICE", "Fault: driver + photocell lead — luminaire replaced, aimed", "Insulation: recorded · outage cleared"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("BLOCKS LIT", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "hustler-under-lift") { hustler.visible = true; hustler.position.set(2.65, 0.1, 1.2); }
        if (it.id === "wind-call") { gust = true; sock.material = gustMat; sock.rotation.z = Math.PI / 2; repaint(anemo.userData.screen, signFace("14 m/s", { bg: "#2a0d0d", accent: "#f0645b", fg: "#ffd0c8", scale: 0.6 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hustler-under-lift") { hustler.position.copy(hustlerHome); hustler.visible = false; arm.rotation.z = 0; arm.position.set(0.8, 1.0, 0); }
        if (it.id === "wind-call") { gust = false; sock.material = calmMat; sock.rotation.z = Math.PI / 2 - 0.3; repaint(anemo.userData.screen, signFace("HOLD · 9 m/s", { bg: "#0d1c24", accent: "#f2c14b", fg: "#ffe9b0", scale: 0.55 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "aim-and-bolt") aimBolt.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "megger") repaint(megger.userData.screen, signFace(`${Math.round(gg.t * 200)} MΩ`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "platform-ascent" && session.holding) {
          const v = session.track.v;
          const a = 0.3 + Math.min(0.95, session.track.inBand * 0.16);
          boom.rotation.z = a; platform.rotation.z = -a;
          if (!gust) repaint(anemo.userData.screen, signFace(`${Math.round(v * 20)} m/s`, { bg: "#0d1c24", accent: v >= 0.4 && v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (step?.id === "outrigger-level" && session.holding) {
          const frac = Math.min(1, session.holdFor / (step.seconds ?? 4));
          bubbleBall.position.x = 0.03 * (1 - frac);
          bubbleBall.material = frac > 0.9 ? okMat : alarmMat;
        }
        if (gust) sock.rotation.y = Math.sin(t * 6) * 0.2;
        void dt; void CITY; void hose;
      },
    };
  },
};
