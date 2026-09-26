import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, holoPanel, holoTag, reg, surfaceTexture, texturedMat, siltFace } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Intake Screen Cleaning With Lockout VR — Bay Area Union
// Edition, marine and water pack, on the bay-underwater district.
//
// A pump station's raw-water intake screen, clogged and torn: the motor
// breaker and the mechanical rake drive identified above water at the
// platform, racked out, locked and tagged, verified dead on the try-start,
// the upstream isolation valve closed, and only then the descent to the
// screen itself — clogged with debris, a panel bent, a gap torn in the
// mesh — where the no-flow gauge is read again with the diver's own hands
// before the face is ever touched. The learner is the diver, a Pile Drivers
// Local 34 commercial diver; the supervisor is on the comms, the tender has
// the umbilical and the standby is dressed at the ladder. Depth, gas, bottom
// time and decompression are never written as numbers: they are per the
// dive plan and the tables the supervisor holds.

const UISC_ACCENT = 0x6fc3e8;
const UISC_CSS = "#6fc3e8";

/** The HUD's comms face, repainted when the supervisor reads back. */
function uiscCommsFace(lines, band = UISC_CSS) {
  return (cx, w, h) => {
    cx.fillStyle = "rgba(6,16,24,0.9)"; cx.fillRect(0, 0, w, h); cx.fillStyle = band; cx.fillRect(0, 0, w, 6);
    cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.fillStyle = "#dcf0fb"; cx.fillText("HELMET COMMS", w * 0.06, h * 0.22);
    cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#eef8fd";
    lines.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.5 + i * 0.2)));
  };
}

export const SIM_UW_INTAKE_SCREEN_CLEANING_WITH_LOCKOUT = {
  id: "uw-intake-screen-cleaning-with-lockout",
  index: "355",
  domain: "Maritime & Ports",
  trade: "Pile Drivers Local 34 commercial diver clearing a raw-water pump station's intake screen, with the plant operator holding the electrical and isolation lockouts above water, the dive supervisor on the comms, the tender on the umbilical and the standby diver dressed at the ladder",
  category: "Maritime & Ports",
  district: "bay-underwater",
  weather: "clear",
  underwater: {
    depthLabel: "Per dive plan",
    bottomTimeSeconds: 660,
  },
  certification: "Pile Drivers Local 34 commercial diver training under the UBC International Training Fund; OSHA 29 CFR 1910.147 the control of hazardous energy (lockout/tagout) at the pump station above water; OSHA 29 CFR 1910 Subpart T commercial diving operations — 29 CFR 1910.421 pre-dive procedures (hazardous activities nearby) and 29 CFR 1910.422 procedures during the dive (communications, termination of the dive); ADCI International Consensus Standards for Commercial Diving and Underwater Operations; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas, bottom time and decompression per the dive plan and the tables the supervisor holds",
  name: "Intake Screen Cleaning With Lockout",
  title: simTitle("Intake Screen Cleaning With Lockout"),
  tagline: "Above water first: the motor breaker and the rake drive found, the breaker racked out and locked and tagged in order, the try-start proving dead, the isolation valve closed, the lockouts reported and the splash called — then below: the descent through a current shift, the clogged screen and the bent panel found, the no-flow gauge read again with your own hands, the debris cleared, the face scraped through a flickering flow indicator, the loose mesh and the dropped-tool risk found, the screen reported clear, and the diver's own signal held before the crew checks in",
  accent: UISC_ACCENT,
  accentCss: UISC_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "dead-before-clean", name: "Dead Before Clean", note: "The breaker locked and tagged before the valve was touched, the no-flow gauge proven with your own hands, and the diver's own clear signal held before anything was restored" },

  supportLine: "your union hall's member assistance programme — Pile Drivers Local 34 — with the employer's employee assistance line behind it",

  game: system({
    name: "Screen Clear",
    currency: "AMP-HOUR",
    ranks: ["Diver Trainee", "Diver", "Screen Diver", "Lead Screen Diver", "Intake Lockout Certified"],
    badges: [
      { id: "lock-then-tag", name: "Lock Then Tag", note: "The breaker racked out before the lock and tag went on, first time", test: AWARD.stepClean("apply-lock-tag") },
      { id: "true-no-flow", name: "True No-Flow", note: "The no-flow gauge read inside the band first time", test: AWARD.precise(0.7) },
      { id: "never-trusted-blind", name: "Never Trusted Blind", note: "Never a hand on the screen face before the no-flow check, never through the torn mesh, never kept scraping with the comms dead, never a tool let fall toward the throat", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-lockout", name: "Clean Lockout", note: "No corrections from the energy-source check to the check-in", test: AWARD.clean },
      { id: "steady-descent", name: "Steady Descent", note: "The descent held in band through the current shift", test: AWARD.unbroken },
      { id: "cleared-in-time", name: "Cleared In Time", note: "The screen reported clear inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-into-screen-face": "You put your hand flat against the screen face to feel whether it was still drawing, before the no-flow gauge confirmed it. Differential pressure across an intake screen can pin a hand, an arm or a whole body against the mesh hard enough that you cannot pull free on your own strength, and a lockout you have not personally verified below the water is a lockout you are trusting on faith. The gauge confirms no flow; your hand never does.",
    "swim-thru-loose-mesh": "You swam through the gap where the screen mesh has torn loose instead of going round it. A torn edge under current moves with every surge, and a diver who takes the gap as a shortcut gives it a fin, a cuff or the umbilical to catch on the exact moment it flexes. It gets logged for the work plan to re-weld; it does not get swum through to save a few kicks round the frame.",
    "keep-cleaning-no-comms": "You kept scraping the screen face when the comms went dead instead of stopping. The whole reason the lockout holds is that everyone above water knows a diver is still at the screen, and a diver who is not on the comms is a diver the platform cannot confirm is clear before anything gets touched. When the comms drop, the scraper stops, whatever the face still looks like.",
    "drop-scraper-in-throat": "You let the old scraper fall to grab the fresh one out of your kit instead of clipping it off first. A tool that goes down the intake throat becomes exactly the kind of foreign object the screen exists to keep out, and if the lockout is ever released with that tool sitting behind the mesh, it is drawn straight into the pump the moment the plant starts up. Every tool comes off your harness clipped, and goes back on clipped, never let fall to free a hand.",
  },

  lateNotes: {
    "isolation-valve-wheel": "The isolation valve is closed once the breaker is racked out, locked and tagged — not while the motor is the only thing confirmed stopped.",
    "no-flow-gauge": "The no-flow check is read once you are actually at the screen — a lockout confirmed on the platform still has to be proven again with your own hands below.",
    "hold-clean-face": "The screen face is scraped once the no-flow gauge has confirmed it dead — never on a face you have not personally verified yourself.",
  },

  steps: [
    {
      id: "identify-energy-sources", kind: "find", noHint: true,
      targets: ["motor-breaker", "rake-drive"],
      itemNames: { "motor-breaker": "pump motor's breaker in the panel", "rake-drive": "mechanical rake drive above the screen" },
      itemNotes: {
        "motor-breaker": "The breaker feeding the intake pump's motor, mounted in the platform's panel with the plant's other circuits.",
        "rake-drive": "A small motor above the screen that can swing a mechanical rake across the face on its own timer, unrelated to the pump's own breaker.",
      },
      title: "Find every energy source before touching anything",
      cue: "At the platform panel, before any switch is thrown: find the pump motor's breaker and the separate rake drive that can move the screen on its own timer.",
      why: "A lockout only protects against the energy sources it actually covers, and an intake screen commonly has two — the pump that draws water through it, and a separate mechanical rake that can sweep the face without warning on its own clock. Missing the second one because the first looked like the whole job is exactly how a diver ends up below a screen that starts moving.",
    },
    {
      id: "apply-lock-tag", kind: "sequence",
      targets: ["breaker-off", "lock-and-tag"],
      itemNames: { "breaker-off": "breaker racked out to open", "lock-and-tag": "personal lock and tag applied" },
      title: "Rack the breaker out, then lock and tag it",
      cue: "Rack the breaker fully to open first, then clip your own lock through the hasp and hang your tag on it.",
      why: "The breaker has to be open before the lock does any good, because a lock hung on a breaker that is still closed protects nothing — it only stops someone from closing a breaker that was already open. Racked out first, then locked and tagged, is the order that actually leaves the energy source both interrupted and physically unable to be restored by anyone but you.",
      outOfOrderNote: "Out of order — rack the breaker open before the lock and tag go on, or the lock is protecting a circuit that could still be closed.",
    },
    {
      id: "verify-zero-energy", kind: "select", target: "try-start-button",
      title: "Press try-start to prove the breaker is dead",
      cue: "With the lock and tag on, press the try-start button at the panel and confirm nothing runs.",
      why: "A lockout is not proven by looking at the breaker — it is proven by trying to start whatever it feeds and watching nothing happen. This is the one step in the whole procedure that actually tests the lockout rather than just performing it, and it is done before the isolation valve or the descent, while you are still standing right at the panel that can fix it if something is wrong.",
    },
    {
      id: "close-isolation-valve", kind: "turn", target: "isolation-valve-wheel",
      title: "Close the upstream isolation valve",
      cue: "Turn the isolation valve's wheel closed to cut the flow reaching the screen, on top of the electrical lockout already confirmed.",
      why: "The electrical lockout stops the pump from drawing, but water already moving toward the screen from upstream can keep some flow going for a while on its own, and the isolation valve is what actually stops that at the source. Closed on top of the confirmed electrical lockout, it is the second, independent barrier the whole rest of the dive depends on — one lockout failing should never be the only thing standing between the screen and a live flow.",
      turn: { turns: 0.75, label: "ISOLATION VALVE", readout: (t) => (t < 0.3 ? "open — flow reaching the screen" : t < 0.9 ? "closing" : "closed — flow isolated") },
    },
    {
      id: "report-locked-and-splash", kind: "select", target: "uisc-comms",
      title: "Report the lockouts and call the splash",
      cue: "Tell the supervisor: breaker racked, locked and tagged, try-start dead, isolation valve closed, ready to splash.",
      why: "The supervisor's own log of the dive starts from this report, and it is the last chance for anyone at the platform to catch a step that was skipped before a diver is in the water depending on it. Calling the splash only after every lockout is confirmed on the comms is what makes the report worth something more than a formality on the way to the ladder.",
    },
    {
      id: "descend-to-screen", kind: "track", target: "descent-line", seconds: 6,
      title: "Descend the platform's line to the screen",
      cue: "Follow the platform's descent line down to the screen at a steady pace, keeping the umbilical clear of the frame as you go.",
      why: "The descent line is the one fixed path between the platform where the lockouts were proven and the screen where you are about to trust them, and a steady pace down it keeps the umbilical paying out clean instead of piling up in loops at the frame's edge. Rushing the descent is exactly how a diver arrives at the screen with a tangle already forming before the real work has even started.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "DESCENT PACE", readout: (v) => (v < 0.42 ? "stalled on the line" : v > 0.6 ? "too fast — umbilical piling up" : "steady down the line") },
      holdBreakNote: "The descent pace broke out of band — too fast or stalled on the line. Settle back onto the descent line and take it up steadily.",
    },
    {
      id: "screen-condition", kind: "find", noHint: true,
      targets: ["clogged-debris", "bent-panel"],
      itemNames: { "clogged-debris": "debris clogging the screen face", "bent-panel": "screen panel bent out of its frame" },
      itemNotes: {
        "clogged-debris": "A mat of branches, plastic sheeting and rope wedged across a third of the screen's open area.",
        "bent-panel": "One panel of the screen pushed out of true where something heavy has struck it, leaving a gap along its edge.",
      },
      title: "Find what is clogging and what is damaged",
      cue: "Look over the whole screen before touching it: what is only debris to be cleared, and what is actual damage to the frame or the mesh itself.",
      why: "Debris comes off with a scraper and a bag; a bent panel is a structural finding that goes to the plant's engineers, not something a diver straightens on the spot. Telling the two apart before starting keeps the report accurate about what was actually wrong with the screen instead of just about what got cleaned off it.",
    },
    {
      id: "confirm-no-flow", kind: "gauge", target: "no-flow-gauge",
      title: "Read the no-flow gauge at the screen itself",
      cue: "Hold the differential-pressure gauge's sensor flat against the screen face and commit the reading once it settles at zero flow.",
      why: "The lockout was proven at the platform, a long way from this screen, and the gauge here is what proves it actually reached this far — a valve that looked closed at the wheel can still be seated wrong, and a breaker locked at the panel says nothing about a second, unmarked feed nobody found. This reading, taken with your own hands at the face, is the one that actually matters to the diver standing in front of it.",
      gauge: { label: "DIFFERENTIAL PRESSURE", speed: 0.7, green: [0, 0.12], readout: (t) => (t < 0.12 ? "zero flow — confirmed dead" : t < 0.5 ? "slight draw — do not proceed" : "flow present — stop, call topside") },
    },
    {
      id: "clear-debris", kind: "drag", target: "debris-clump",
      title: "Clear the debris off the screen face",
      cue: "Pull the clogging debris free of the mesh and stow it in the debris bag clipped at your side.",
      why: "The debris comes off by hand once the no-flow check has confirmed the screen is dead, pulled clear rather than levered, because a mat of branches under any remaining tension can spring back across the mesh and take a glove or a hose with it. Every piece goes in the bag, not loose on the bottom, so it does not just resettle across the screen on the next tide.",
      drag: { to: "debris-bag", radius: 0.5, missNote: "Not in the bag — clear debris goes into the bag clipped at your side, not left loose on the bottom." },
    },
    {
      id: "hold-clean-face", kind: "hold", target: "hold-clean-face", seconds: 5,
      title: "Scrape the screen face clean",
      cue: "Hold the scraper flat against the mesh and work it steadily across the fouled section until the face reads clean.",
      why: "A screen face is fouled by more than the loose debris already cleared — a film of growth across the mesh chokes the same open area a clogging branch does, just more slowly, and it only comes off with a steady, sustained pass rather than a few quick scrapes. Holding the tool flat and working it the whole time is what actually restores the screen's open area instead of just making it look better from a glance.",
      holdBreakNote: "The scraper came off the face before the pass was finished — hold it flat against the mesh and work it through to the end.",
    },
    {
      id: "route-hazards", kind: "find", noHint: true,
      targets: ["loose-mesh-gap", "loose-scraper"],
      itemNames: { "loose-mesh-gap": "torn gap in the screen mesh", "loose-scraper": "old scraper not yet clipped off" },
      itemNotes: {
        "loose-mesh-gap": "A section of mesh torn free of its frame, curling and flexing with every surge of current against the face.",
        "loose-scraper": "The scraper you were using a minute ago, still loose in your hand instead of clipped back to your harness before the next tool comes out.",
      },
      title: "Find the hazards still at the screen before moving on",
      cue: "Before switching tools or moving along the face: the torn mesh gap, and whatever is still loose in your own hands.",
      why: "The torn mesh is a hazard the next diver needs on the report whether or not it slowed this one down, and the loose tool in your own hand is the hazard you can fix yourself in the next few seconds, before it becomes a dropped object at the worst possible place to drop one — right in front of the throat.",
    },
    {
      id: "report-screen-clear", kind: "select", target: "uisc-comms",
      title: "Report the screen clear and the bent panel",
      cue: "Tell the supervisor: debris cleared, face scraped clean, the bent panel logged for the plant's engineers, the mesh gap noted.",
      why: "The plant only knows what this dive actually found through this report, and the bent panel matters more to them than the debris ever did — debris comes back with every tide, but a bent frame is a standing hazard until it is engineered a fix. Reporting both together, while you are still at the screen able to describe exactly where the panel is bent, is worth more than a line added after the fact.",
    },
    {
      id: "signal-diver-clear", kind: "hold", target: "diver-clear-signal", seconds: 4,
      title: "Hold your signal that you are clear of the screen",
      cue: "Back away from the screen frame and hold the clear signal steady until the supervisor confirms it before anything at the platform is touched.",
      why: "Nothing about the lockout gets released until the platform has a confirmed answer that you are actually away from the screen, not just finished working on it, and that answer only means something if you hold the signal until it is acknowledged rather than giving it once and moving on. This is the diver's half of the same discipline that put the lock on the breaker in the first place.",
      holdBreakNote: "You moved off before the signal was acknowledged — hold clear of the screen and give the signal again until the supervisor confirms it.",
    },
    {
      id: "check-in", kind: "select", target: "stage-checkin",
      title: "Check in at the stage and leave on the supervisor's call",
      cue: "Back at the stage, clipped on: tell the supervisor how the dive went, the current on the descent and the flow indicator dropping out, and wait for the call to leave the bottom.",
      why: "The ascent is the supervisor's call, run to the tables they hold, and the check-in is how they know you are on the stage, clipped on and well, before that call is made and before the platform is told it is safe to release anything. A current on the descent and a flow indicator that dropped out mid-clean are both worth a real answer here, with the Pile Drivers Local 34 member assistance line behind whatever the debrief does not settle.",
    },
  ],

  interrupts: [
    {
      id: "current-shift-descent",
      kind: "Current shift on the descent line",
      after: "descend-to-screen", delay: 2, seconds: 14,
      alert: "The current has picked up along the descent line and is pushing you sideways off it toward the screen frame's edge.",
      cue: "Grab the frame handhold and ride the current out rather than fighting to swim back onto the line.",
      target: "screen-frame-handhold",
      why: "A diver who fights a current sideways off a descent line burns gas and control fighting the water instead of using what is actually there to hold onto, and the frame handhold is fixed exactly where a diver pushed off the line would end up. Grabbing it is faster and safer than swimming back against the current to find the line again.",
      missNote: "You kept swimming for the line instead of grabbing the handhold; the current carried you into the frame edge before you found anything solid to hold.",
      wrongNote: "The frame handhold — grab it and ride the current out rather than fighting back to the line.",
    },
    {
      id: "flow-indicator-flickers",
      kind: "Flow indicator flickers mid-clean",
      after: "hold-clean-face", delay: 2, seconds: 14,
      alert: "The flow indicator light at the screen has started flickering between clear and flow — you cannot tell which reading is current.",
      cue: "Stop scraping, back off the face, and check the flow indicator directly before touching the screen again.",
      target: "flow-indicator-check",
      why: "A flickering indicator could mean a bad connection, or it could mean the isolation the whole dive depends on is starting to fail, and there is no way to tell which from the scraper in your hand. Backing off and checking it directly, rather than assuming the flicker is nothing and continuing, is the only response that does not risk being wrong about a live screen.",
      missNote: "You kept scraping through the flicker instead of stopping; the indicator settled on flow just as your hand was still flat against the mesh.",
      wrongNote: "The flow indicator — stop scraping and check it directly before the screen is touched again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);

    // ------------------------------------------------------- the bottom
    const siltTex = surfaceTexture((cx, w, h) => siltFace(cx, w, h), { px: 256, repeat: 3 });
    const mound = cyl(g, 2.9, 3.3, 0.1, 0, 0.03, -0.4, 0xffffff, { seg: 28, cast: false });
    mound.material = texturedMat(siltTex, { rough: 1, metal: 0, color: 0xb4beac });
    for (const [x, z, r] of [[-2.3, -1.8, 0.2], [2.2, 1.4, 0.15], [0.8, 2.0, 0.12], [-1.4, 2.2, 0.17], [2.6, -2.0, 0.19]]) ball(g, r, x, r * 0.4, z, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1, 0.5, 0.8);

    // ------------------------------------------------------- the platform (above water)
    const platform = group(g, -2.6, 2.6, -1.8);
    box(platform, 1.6, 0.08, 1.2, 0, 0, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) box(platform, 0.05, 0.7, 1.2, sx * 0.8, 0.4, 0, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    const panel = group(platform, -0.4, 0.5, 0.5);
    box(panel, 0.5, 0.6, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    const breaker = box(panel, 0.14, 0.2, 0.03, -0.1, 0.05, 0.06, 0x1c3a2a, { rough: 0.5, metal: 0.4 });
    holoTag(panel, "motor breaker", -0.1, 0.32, 0.06, { css: UISC_CSS, w: 0.28 });
    reg(hits, breaker, "motor-breaker");
    const rakeDrive = group(platform, 0.5, 0.9, -0.3);
    box(rakeDrive, 0.2, 0.2, 0.16, 0, 0, 0, 0x3a4a3a, { rough: 0.6, metal: 0.4 });
    holoTag(rakeDrive, "mechanical rake drive", 0, 0.16, 0, { css: UISC_CSS, w: 0.34 });
    reg(hits, rakeDrive, "rake-drive");
    const lock = group(panel, 0.12, 0.05, 0.07);
    box(lock, 0.05, 0.07, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.5 });
    const tag = box(lock, 0.06, 0.08, 0.005, 0.06, -0.02, 0, 0xf2c14b, { rough: 0.6 });
    void tag;
    lock.visible = false;
    holoTag(panel, "lock + tag", 0.12, 0.24, 0.07, { css: UISC_CSS, w: 0.26 });
    const breakerOffHit = box(panel, 0.2, 0.24, 0.06, -0.1, 0.05, 0.06, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, breakerOffHit, "breaker-off");
    const lockTagHit = box(panel, 0.16, 0.16, 0.1, 0.12, 0.05, 0.07, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, lockTagHit, "lock-and-tag");
    const tryStart = group(panel, 0.16, -0.2, 0.06);
    cyl(tryStart, 0.03, 0.03, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 12 });
    holoTag(tryStart, "try-start", 0, 0.1, 0, { css: UISC_CSS, w: 0.22 });
    reg(hits, tryStart, "try-start-button");
    const valve = group(platform, 0.5, 0.5, 0.5, 0.3);
    cyl(valve, 0.04, 0.04, 0.14, 0, 0, 0, 0x2f8f5a, { rough: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    const valveWheel = torus(valve, 0.1, 0.014, 0, 0, 0.08, 0x2f8f5a, { rough: 0.5, seg: 6, seg2: 16 });
    holoTag(valve, "isolation valve", 0, 0.2, 0, { css: UISC_CSS, w: 0.3 });
    reg(hits, valve, "isolation-valve-wheel");
    const comms = holoPanel(g, 0.5, 0.3, -1.9, 3.0, -1.4, uiscCommsFace(["Supervisor · topside", "Press to talk"]), { ry: 0.4, accent: UISC_ACCENT });
    reg(hits, comms, "uisc-comms");

    // ------------------------------------------------------- descent line
    const descentLine = cyl(g, 0.012, 0.012, 2.6, -2.6, 1.3, -1.8, 0xe8dcb8, { rough: 0.8, seg: 6 });
    reg(hits, descentLine, "descent-line");

    // ------------------------------------------------------- the screen structure
    const headwall = group(g, 0.2, 0, -0.6);
    box(headwall, 2.4, 1.6, 0.3, 0, 0.8, -0.3, 0x8d8a80, { rough: 0.95, finish: "concrete", tile: 1 });
    const screenMat = mat(0x5a6a68, { rough: 0.6, metal: 0.5 });
    const screenFace = box(headwall, 1.8, 1.2, 0.05, 0, 0.8, -0.14, 0xffffff, { rough: 0.6 });
    screenFace.material = screenMat;
    for (let i = 0; i < 8; i++) box(headwall, 0.02, 1.2, 0.02, -0.9 + i * 0.26, 0.8, -0.1, 0x2b3138, { rough: 0.5, metal: 0.6 });
    reg(hits, screenFace, "clogged-debris");
    const bentPanel = box(headwall, 0.4, 0.3, 0.06, 0.6, 1.2, -0.1, 0x8a949d, { rough: 0.5, metal: 0.6 });
    bentPanel.rotation.z = 0.2;
    reg(hits, bentPanel, "bent-panel");
    const meshGap = box(headwall, 0.2, 0.3, 0.03, -0.7, 0.5, -0.08, 0x1c1f1a, { rough: 0.7 });
    reg(hits, meshGap, "loose-mesh-gap");
    const meshHazardHit = box(headwall, 0.4, 0.5, 0.4, -0.7, 0.5, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(headwall, "swim through the gap?", -0.7, 0.95, -0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, meshHazardHit, "swim-thru-loose-mesh");
    const reachHit = box(headwall, 1.8, 1.2, 0.3, 0, 0.8, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(headwall, "hand flat on the face?", 0, 1.55, -0.05, { css: "#d2312b", w: 0.42 });
    reg(hits, reachHit, "reach-into-screen-face");
    const debris = group(g, 0.3, 0.5, -0.4);
    box(debris, 0.3, 0.12, 0.1, 0, 0, 0, 0x5a4a34, { rough: 0.9 });
    box(debris, 0.2, 0.1, 0.08, 0.15, 0.06, 0.02, 0x3a4a2a, { rough: 0.9 });
    holoTag(debris, "clogging debris", 0, 0.2, 0, { css: UISC_CSS, w: 0.28 });
    reg(hits, debris, "debris-clump");
    const debrisBag = group(g, 1.1, 0.06, 0.2);
    box(debrisBag, 0.3, 0.18, 0.2, 0, 0, 0, 0x2f6f4f, { rough: 0.85 });
    holoTag(debrisBag, "debris bag", 0, 0.24, 0, { css: UISC_CSS, w: 0.24 });
    reg(hits, debrisBag, "debris-bag");
    const noFlowGauge = group(g, -0.6, 0.9, -0.1);
    box(noFlowGauge, 0.1, 0.14, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    holoTag(noFlowGauge, "no-flow gauge", 0, 0.16, 0, { css: UISC_CSS, w: 0.28 });
    reg(hits, noFlowGauge, "no-flow-gauge");
    const cleanHit = box(headwall, 1.8, 1.2, 0.3, 0, 0.8, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cleanHit, "hold-clean-face");
    const scraperOld = group(g, 0.9, 0.5, 0.1);
    box(scraperOld, 0.03, 0.3, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    holoTag(scraperOld, "old scraper — clip it?", 0, 0.2, 0, { css: UISC_CSS, w: 0.36 });
    reg(hits, scraperOld, "loose-scraper");
    const dropHit = box(g, 0.4, 0.4, 0.4, 0.4, 0.4, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "let it fall to grab the next?", 0.4, 0.7, -0.2, { css: "#d2312b", w: 0.5 });
    reg(hits, dropHit, "drop-scraper-in-throat");
    const noCommsHit = box(headwall, 1.8, 1.2, 0.3, 0, 0.8, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(headwall, "keep scraping — no comms?", 0, 1.7, -0.05, { css: "#d2312b", w: 0.5 });
    reg(hits, noCommsHit, "keep-cleaning-no-comms");

    // ------------------------------------------------------- handhold, flow indicator, clear signal
    const frameHandhold = group(g, 1.0, 1.0, -0.55);
    torus(frameHandhold, 0.1, 0.014, 0, 0, 0, UISC_ACCENT, { emissive: UISC_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(frameHandhold, "frame handhold", 0, 0.16, 0, { css: UISC_CSS, w: 0.28 });
    reg(hits, frameHandhold, "screen-frame-handhold");
    const flowLamp = ball(g, 0.05, -0.8, 1.4, -0.3, 0x59c97b, { emissive: 0x59c97b, ei: 1.2, seg: 10, seg2: 8 });
    const flowCheck = group(g, -0.8, 1.3, -0.3);
    box(flowCheck, 0.1, 0.06, 0.02, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    holoTag(flowCheck, "flow indicator", 0, 0.12, 0, { css: UISC_CSS, w: 0.28 });
    reg(hits, flowCheck, "flow-indicator-check");
    const clearSignal = group(g, -1.4, 0.6, -0.8);
    torus(clearSignal, 0.14, 0.014, 0, 0, 0, UISC_ACCENT, { emissive: UISC_ACCENT, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    holoTag(clearSignal, "hold — clear signal", 0, 0.2, 0, { css: UISC_CSS, w: 0.38 });
    reg(hits, clearSignal, "diver-clear-signal");

    // ------------------------------------------------------- stage
    const stage = group(g, -2.8, 0, -2.4);
    box(stage, 1.5, 0.05, 1.5, 0, 0.25, 0, 0x3a4048, { rough: 0.7, metal: 0.5, cast: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stage, 0.06, 1.6, 0.06, sx * 0.65, 0.8, sz * 0.65, 0x8b949d, { rough: 0.5, metal: 0.6, cast: false });
    torus(stage, 0.3, 0.01, 0, 0.26, 0, UISC_ACCENT, { emissive: UISC_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    holoTag(stage, "stage — check in", 0, 0.5, 0, { css: UISC_CSS, w: 0.3 });
    reg(hits, stage, "stage-checkin");
    const slate = decal(g, 0.26, 0.2, -3.0, 0.62, -1.6, paperFace("SLATE", ["Breaker locked + tagged", "Valve isolated", "Screen cleared"], { bg: "#e8eef0", band: UISC_CSS }), { px: 192 });
    void slate;

    // ------------------------------------------------------- current streamers, scenery
    const streamers = group(g, 0, 0.9, -1.0);
    for (let i = 0; i < 6; i++) { const s = box(streamers, 1.0, 0.01, 0.03, -1.0 + (i % 3) * 1.0, (i % 3) * 0.3, -0.2 + i * 0.1, 0xb8e0d8, { rough: 0.4, emissive: 0x6aa8a0, ei: 0.5, cast: false }); s.rotation.y = 0.2; }
    streamers.visible = false;
    const school = group(g, -0.6, 1.9, -2.6);
    for (let i = 0; i < 8; i++) {
      const f = group(school, (i % 4) * 0.3 - 0.45, Math.floor(i / 4) * 0.22, (i % 3) * 0.18);
      ball(f, 0.06, 0, 0, 0, 0x8aa0a8, { rough: 0.4, metal: 0.4, seg: 8, seg2: 6 }).scale.set(2.2, 0.8, 0.6);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      ball(g, 0.06 + (i % 3) * 0.02, Math.cos(a) * 2.6, 0.06, -0.6 + Math.sin(a) * 2.6, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1.4, 0.6, 1);
    }
    for (let i = 0; i < 9; i++) {
      const a = i * 0.71 + 0.3, r = 1.3 + (i % 4) * 0.45;
      const bottle = cyl(g, 0.035, 0.035, 0.2, Math.cos(a) * r, 0.04, -1.0 + Math.sin(a) * r, [0x2f6f4a, 0x6a4a2a, 0xa8c8c0][i % 3], { rough: 0.15, metal: 0.1, opacity: 0.8, transparent: true, seg: 8 });
      bottle.rotation.z = Math.PI / 2; bottle.rotation.y = a;
    }
    for (const [x, z] of [[2.6, 1.3], [-2.7, -0.4], [1.9, -2.3]]) {
      const stub = group(g, x, 0, z);
      cyl(stub, 0.16, 0.18, 0.4, 0, 0.2, 0, 0x4a4234, { rough: 0.95, seg: 12 });
      for (let i = 0; i < 4; i++) { const a = i * 1.6 + x; ball(stub, 0.07, Math.cos(a) * 0.2, 0.12 + (i % 2) * 0.14, Math.sin(a) * 0.2, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }
    for (let i = 0; i < 6; i++) {
      const link = torus(g, 0.05, 0.016, -2.4 + i * 0.12, 0.03, 1.4 - i * 0.05, 0x5a4a3a, { rough: 0.85, metal: 0.4, seg: 6, seg2: 10 });
      link.rotation.y = i % 2 ? 0 : Math.PI / 2; link.rotation.x = Math.PI / 2;
    }
    const kelp = group(g, -3.0, 0, 0.8);
    for (let i = 0; i < 7; i++) {
      const frond = box(kelp, 0.03, 0.6 + (i % 3) * 0.22, 0.1, i * 0.1, 0.4, (i % 2) * 0.1, 0x5a7a3a, { rough: 0.9, cast: false });
      frond.rotation.z = 0.2 * ((i % 3) - 1);
    }
    const bubbles = group(g, 0.2, 1.2, -0.4);
    for (let i = 0; i < 8; i++) ball(bubbles, 0.02 + (i % 3) * 0.008, (i % 3) * 0.04 - 0.04, i * 0.14, (i % 2) * 0.03, 0xdff4f0, { rough: 0.2, emissive: 0x9fd0c8, ei: 0.4, seg: 6, seg2: 4, cast: false });
    const rockPile = group(g, 2.0, 0, 0.4);
    for (let i = 0; i < 6; i++) ball(rockPile, 0.13 + (i % 3) * 0.05, (i % 3) * 0.2 - 0.2, 0.05 + (i % 2) * 0.06, Math.floor(i / 3) * 0.2, 0x4a5048, { rough: 1, seg: 8, seg2: 6 }).scale.set(1.1, 0.6, 0.9);
    for (let i = 0; i < 9; i++) {
      const a = i * 0.6 + 0.4, r = 0.9 + (i % 3) * 0.3;
      const can = cyl(g, 0.03, 0.03, 0.1, -1.6 + Math.cos(a) * r, 0.03, -2.6 + Math.sin(a) * r, [0xb8402f, 0x9aa2a8, 0x2b5aa8][i % 3], { rough: 0.5, metal: 0.6, seg: 8 });
      can.rotation.z = Math.PI / 2;
    }
    for (const [x, z] of [[-0.6, 1.6]]) {
      const nBrg = group(g, x, 0, z);
      cyl(nBrg, 0.3, 0.32, 5.8, 0, 2.9, 0, 0x56613f, { seg: 16 });
      for (let i = 0; i < 5; i++) { const a = i * 1.2 + x; ball(nBrg, 0.08, Math.cos(a) * 0.35, 0.2 + (i % 3) * 0.16, Math.sin(a) * 0.35, 0x1c1f2a, { rough: 0.8, metal: 0.1, seg: 8, seg2: 6 }).scale.set(1, 0.7, 1); }
    }

    return {
      hits,
      spawnLook: new THREE.Vector3(-1.0, 1.6, -1.0),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "apply-lock-tag") { lock.visible = true; breaker.material = mat(0x8a2a1a, { rough: 0.6, metal: 0.5 }); }
        if (step.id === "close-isolation-valve") valveWheel.material = mat(0x8a2a1a, { rough: 0.5, metal: 0.6 });
        if (step.id === "report-locked-and-splash") repaint(comms.userData.face, uiscCommsFace(["Lockouts confirmed", "Splashing now"]));
        if (step.id === "screen-condition") bentPanel.material = mat(0xd2a03d, { rough: 0.5, metal: 0.6, emissive: 0x3a2206, ei: 0.3 });
        if (step.id === "clear-debris") debris.visible = false;
        if (step.id === "hold-clean-face") screenFace.material = mat(0x8ea8a4, { rough: 0.5, metal: 0.5 });
        if (step.id === "route-hazards") scraperOld.visible = false;
        if (step.id === "report-screen-clear") repaint(comms.userData.face, uiscCommsFace(["Screen clear — reported", "Panel logged for engineers"]));
        if (step.id === "signal-diver-clear") repaint(slate, paperFace("SLATE — LOGGED", ["Breaker locked + tagged", "Valve isolated", "Screen cleared, diver clear"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "current-shift-descent") streamers.visible = true;
        if (it.id === "flow-indicator-flickers") flowLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6 });
      },
      onInterruptEnd(it) {
        if (it.id === "current-shift-descent" && it.resolved === "answered") streamers.visible = false;
        if (it.id === "flow-indicator-flickers" && it.resolved === "answered") flowLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "close-isolation-valve") valveWheel.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "confirm-no-flow") noFlowGauge.scale.y = 0.7 + gg.t * 0.6;
        if (step?.id === "descend-to-screen" && session.holding) descentLine.scale.y = 0.5 + (session.track?.inBand ?? 0) * 0.5;
        if (streamers.visible) streamers.position.x = ((t * 0.5) % 1.4) - 0.7;
        school.position.x = -0.6 + Math.sin(t * 0.3) * 0.3;
        void dt; void CITY; void signFace;
      },
    };
  },
};
