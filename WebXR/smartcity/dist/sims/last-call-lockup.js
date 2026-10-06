import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, lockTag, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Last Call & Lockup VR — Culinary & Hospitality, the
// bartending series.
//
// The last hour of a shift is its own procedure, not a wind-down from the
// one before it: last call on the clock the ABC licence actually sets, a
// hard stop on sale at 2 a.m. regardless of who is still asking, rides
// checked before anyone who has been drinking gets behind a wheel, staff
// walked out together rather than one at a time, and a building swept and
// secured before the alarm goes on. Cal/OSHA's own workplace violence
// prevention standard names exactly this shift and exactly that walk to the
// parking lot as the elevated-risk period it is written for.

const LCL_ACCENT = 0x5c6bc0;

export const SIM_LAST_CALL_LOCKUP = {
  id: "last-call-lockup",
  index: "142",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "California ABC Act §25631 (hours of sale) and §25602 (sale to an obviously intoxicated person); the ABC licence's own posted hours; Cal/OSHA's workplace violence prevention plan (8 CCR §3342, SB 553), which names the closing shift and the walk to the parking lot as elevated-risk periods; federal OSHA's recordkeeping rule (29 CFR 1904) for anything the shift needs to report; UNITE HERE Local 2's closing-shift and safety-committee language",
  name: "Last Call & Lockup",
  title: simTitle("Last Call & Lockup"),
  tagline: "Last call on the clock the ABC licence sets, no sale after 2 a.m., the \"one more\" refused, rides checked, staff walked out together, the restrooms swept, and the building locked down behind you",
  accent: LCL_ACCENT,
  accentCss: "#5c6bc0",
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "clean-close", name: "Clean Close", note: "Last call, the cutoff, the rides and the sweep all answered clean, and the building locked down behind a crew that walked out together" },

  game: system({
    name: "Closing Shift",
    currency: "CLOSE",
    ranks: ["Barback", "Closer", "Shift Lead", "Manager on Duty", "Closing Certified"],
    badges: [
      { id: "on-the-clock", name: "On the Clock", note: "Last call and the 2 a.m. cutoff both answered clean, first time", test: AWARD.all(AWARD.stepClean("last-call-announce"), AWARD.stepClean("no-sale-2am")) },
      { id: "nobody-left-behind", name: "Nobody Left Behind", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "steady-sweep", name: "Steady Sweep", note: "Every timed hold and sweep carried clean the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-close", name: "Clean Close", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
      { id: "out-on-time", name: "Out on Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "sneak-pour": "You poured the \"one more\" instead of refusing it. Business and Professions Code §25631 sets 2 a.m. as the hard stop on sale, not a target to get close to for a regular who's asking nicely — the licence that lets this bar operate at all is the thing actually on the line.",
    "solo-walkout": "You went out to your car alone instead of waiting for the group. Cal/OSHA's workplace violence prevention standard names the closing shift and the walk to an empty parking lot as an elevated-risk period for exactly this reason — the group walkout is the control, not a courtesy extended when it's convenient.",
    "handed-back-keys": "You handed the keys back to a patron who was visibly unsteady on their feet. Business and Professions Code §25602 is about the pour, but what happens after last call is about not putting somebody who can't drive behind a wheel because asking them to wait for a ride felt awkward.",
    "skip-sweep": "You reached for the lock before the restrooms were swept. A building locked up with somebody still inside it is not a faster close, it is a person trapped in the dark with the alarm about to arm around them.",
  },

  lateNotes: {
    "alarm-panel": "The alarm gets set after the sweep confirms the building is empty, not before it.",
    "checklist-sheet": "The checklist gets signed once the building is actually secured, not as a substitute for securing it.",
  },

  steps: [
    {
      id: "last-call-announce", kind: "select", target: "last-call-sign",
      title: "Call last call on the ABC's clock",
      cue: "Announce it early enough that every open tab can actually be finished before 2 a.m.",
      why: "Business and Professions Code §25631 sets the hard stop on the sale of alcohol at 2 a.m., and last call is announced early enough before that line that a drink poured in time can actually be finished — not timed to the minute the law stops mattering.",
    },
    {
      id: "clear-drinks", kind: "track", target: "clear-sweep", seconds: 5,
      title: "Clear the room by the deadline",
      cue: "Steady sweep of the tables — collect what's finished, don't rush what isn't.",
      why: "Every glass still on a table after the cutoff is a glass somebody could argue was poured before it. Clearing the room at a steady, visible pace is what makes the 2 a.m. line an actual line rather than a suggestion nobody can prove either way.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.1, label: "SWEEP PACE", readout: (v) => (v < 0.4 ? "too slow — tabs still open at the cutoff" : v > 0.6 ? "rushing — leaving glasses behind" : "steady") },
      holdBreakNote: "Pace drifted out of band. Too slow leaves tabs open past the cutoff; too fast leaves glasses uncleared on tables you skipped.",
    },
    {
      id: "no-sale-2am", kind: "turn", target: "tap-shutoff",
      title: "No sale after 2 a.m. — shut it down",
      cue: "Taps off, register to no-sale, on the clock.",
      why: "The cutoff does not bend for a good customer, a big tab, or a slow night — the licence that lets this building sell alcohol at all is written around that one hour, and it is the one rule in this job with no manager override that matters.",
      turn: { turns: 1, axis: "y", label: "TAPS" },
    },
    {
      id: "refuse-one-more", kind: "select", target: "refuse-request",
      title: "Refuse the \"one more\"",
      cue: "Say no, clearly, and mean it — this is the same rule as the last step, asked a different way.",
      why: "A regular asking for one more after last call is asking the same question the clock already answered. Refusing it clearly and without apology is what the cutoff is actually worth — a cutoff that bends for the right customer was never a cutoff.",
    },
    {
      id: "rides-check", kind: "find", noHint: true,
      targets: ["patron-keys", "patron-unsteady"],
      itemNames: { "patron-keys": "keys on the bar", "patron-unsteady": "unsteady on their feet" },
      itemNotes: {
        "patron-keys": "Keys sitting on the bar next to an empty glass are worth noticing before the person reaching for them is halfway to the parking lot.",
        "patron-unsteady": "Someone who can't walk a straight line to the door can't be trusted to drive one either, whatever they say about how far home is.",
      },
      title: "Check who needs a ride before they leave",
      cue: "Look over the room — keys on the bar, anyone unsteady on their feet.",
      why: "Business and Professions Code §25602 covers the pour, but the hour after last call is about the walk to the parking lot — a rideshare arranged from behind the bar costs five minutes and is cheaper than any version of the alternative.",
    },
    {
      id: "walk-out-together", kind: "hold", target: "group-exit", seconds: 5,
      title: "Walk the staff out together",
      cue: "Hold the group at the door until everyone closing tonight is actually in it.",
      why: "Cal/OSHA's workplace violence prevention standard calls out the closing shift and the walk to an empty lot by name as an elevated-risk period, which is exactly why nobody leaves alone — the group is the control the standard is asking for, not an afterthought.",
      holdBreakNote: "The group broke up before everyone was accounted for. Hold it — the walkout works because it's everyone together, not most of everyone.",
    },
    {
      id: "restroom-sweep", kind: "track", target: "sweep-hallway", seconds: 5,
      title: "Sweep the restrooms",
      cue: "Check every stall in both restrooms before anything gets locked.",
      why: "A restroom is the one part of the building somebody can be in without anyone behind the bar knowing it, which is exactly why the sweep checks every stall by hand rather than assuming an empty-looking room actually is one.",
      track: { start: 0.1, green: [0.38, 0.6], rise: 0.5, fall: 0.42, drift: 0.12, label: "SWEEP", readout: (v) => (v < 0.38 ? "rushing past stalls" : v > 0.6 ? "stalled out" : "checking each stall") },
      holdBreakNote: "The sweep broke off mid-hallway. An unchecked stall is exactly the gap this sweep exists to close — finish it before anything else happens.",
    },
    {
      id: "walk-perimeter", kind: "find", noHint: true,
      targets: ["unlocked-window", "propped-door"],
      itemNames: { "unlocked-window": "unlocked side window", "propped-door": "propped patio door" },
      itemNotes: {
        "unlocked-window": "A window left on the latch is an open building with the alarm about to be told otherwise.",
        "propped-door": "A patio door propped for the night's last smoke break and never unpropped is a door that was never actually closed.",
      },
      title: "Walk the perimeter",
      cue: "Every window and door, checked shut and locked before the alarm goes on.",
      why: "The alarm only protects a building that is actually closed — a single unlocked window or propped door behind it is a false sense of security wired straight into the panel.",
    },
    {
      id: "trash-out", kind: "drag", target: "trash-bag",
      title: "Take the trash out",
      cue: "Carry the sealed bag to the dumpster before the building's locked down.",
      why: "Trash left behind the bar overnight is a pest problem the health inspector will find before any customer does — it goes out with the rest of the close, not first thing tomorrow.",
      drag: { to: "dumpster-spot", radius: 0.4, missNote: "Not at the dumpster. Set down anywhere else along the way, it's still trash behind the bar tomorrow morning." },
    },
    {
      id: "chairs-up", kind: "select", target: "chairs-stacked",
      title: "Chairs up for the cleaning crew",
      cue: "Stack them clear of the floor.",
      why: "The overnight cleaning crew works the floor the chairs are sitting on — stacked and clear is the difference between them mopping tonight and working around furniture instead.",
    },
    {
      id: "gas-lights-off", kind: "sequence",
      targets: ["gas-off", "lights-off"],
      itemNames: { "gas-off": "shut the bar-top torch gas valve", "lights-off": "lights off behind the bar" },
      title: "Gas off, then the lights",
      cue: "Shut the torch valve first — then the lights, not the other way around.",
      why: "The gas valve for the bar-top torch gets shut while the lights are still on to see it done properly — cutting the lights first just means finding a gas valve by phone light instead of doing it right the first time.",
      outOfOrderNote: "Gas off before the lights — closing the valve in the dark is how a half-turned valve gets missed.",
    },
    {
      id: "alarm-set", kind: "turn", target: "alarm-panel",
      title: "Set the alarm",
      cue: "Arm it on the way out, once the building is confirmed clear.",
      why: "The alarm is the last thing armed because it's the one system that assumes everyone who should be gone already is — setting it early on an assumption is how the sweep that came before it stops meaning anything.",
      turn: { turns: 1, axis: "y", label: "ALARM" },
    },
    {
      id: "closing-checklist", kind: "select", target: "checklist-sheet",
      title: "Sign the closing checklist",
      cue: "Every line, initialled, before you're the last one out.",
      why: "The checklist is what tomorrow's opener and the manager both read to know the building was actually closed the way it's supposed to be, rather than trusting that whoever locked up remembered everything correctly.",
    },
    {
      id: "incident-log-sign", kind: "select", target: "incident-log-sign",
      title: "Sign the incident log",
      cue: "Note anything refused, any ride arranged, anything found on the sweep.",
      why: "A refusal, a ride arranged, or somebody found asleep in a stall are all things worth a manager reading in daylight rather than only living in tonight's memory of how the shift went.",
    },
  ],

  interrupts: [
    {
      id: "after-hours-request",
      kind: "Off-the-clock sale",
      after: "clear-drinks", delay: 3, seconds: 12,
      alert: "A regular is asking the manager for \"one after hours, door locked\" — and a colleague is already reaching for a bottle.",
      cue: "Stop the pour before it happens.",
      target: "stop-pour",
      why: "A locked door does not change what Business and Professions Code §25631 says about the hour — an after-hours pour behind a locked door is still a sale after the cutoff, and it is the licence, not the lock, that answers for it.",
      missNote: "The bottle came off the shelf. A locked door was never the thing making that pour legal, and the licence this whole bar operates under does not know or care that it happened quietly.",
      wrongNote: "It's the bottle your colleague is reaching for. Stop that pour — the door being locked changes nothing about the hour.",
    },
    {
      id: "sleeping-patron",
      kind: "Person on the sweep",
      after: "restroom-sweep", delay: 2, seconds: 13,
      alert: "A stall door that looked locked wasn't — someone is asleep on the floor of the restroom, still inside the building.",
      cue: "Wake them and get them a ride. Do not lock up around them.",
      target: "wake-and-ride",
      why: "Someone asleep in a restroom is not a housekeeping problem to note and move past — they wake up, they get a ride home the same as anyone else checked on the way out, and the sweep is not finished until they are actually gone.",
      missNote: "The sweep moved on without waking them. A building locked and alarmed with somebody still asleep inside it is the exact failure this sweep exists to prevent, and it very nearly just happened.",
      wrongNote: "Somebody is still in the building. Wake them and arrange a ride — nothing else on this closing list matters until that's done.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, LCL_ACCENT);

    const topY = 1.1;
    const barZ = -2.1;

    // ------------------------------------------------------- last call & taps
    const lastCallSign = holoPanel(g, 0.42, 0.28, -2.6, 1.5, barZ - 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(10,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5c6bc0"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e4e6fb";
      cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("LAST CALL", w / 2, h * 0.32);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("§25631 — no sale after 2:00", w / 2, h * 0.65);
    }, { ry: 0.4, accent: LCL_ACCENT });
    reg(hits, lastCallSign, "last-call-sign");

    const clearSweep = box(g, 0.4, 0.01, 1.4, -0.6, 0.011, 0.6, LCL_ACCENT,
      { emissive: LCL_ACCENT, ei: 0.5, opacity: 0.4, transparent: true, cast: false, receive: false });
    holoTag(g, "clear the tables", -0.6, 0.2, 0.6, { css: "#5c6bc0", w: 0.4 });
    reg(hits, clearSweep, "clear-sweep");

    for (let i = 0; i < 4; i++) {
      const tap = group(g, -2.2 + i * 0.3, topY, barZ - 0.35);
      cyl(tap, 0.012, 0.012, 0.26, 0, 0.13, 0, 0xb8b0a0, { rough: 0.3, metal: 0.8, seg: 10 });
      ball(tap, 0.03, 0, 0.27, 0, [0x2f6f4a, 0xb8862b, 0x6b3a2c, 0x8b929a][i], { rough: 0.4, metal: 0.3, seg: 10 });
    }
    const tapHandle = group(g, -1.9, topY, barZ - 0.35);
    cyl(tapHandle, 0.012, 0.012, 0.26, 0, 0.13, 0, 0xb8b0a0, { rough: 0.3, metal: 0.8, seg: 10 });
    const tapBall = ball(tapHandle, 0.03, 0, 0.27, 0, 0xf2c14b, { rough: 0.4, metal: 0.3, seg: 10 });
    holoTag(tapHandle, "shut off — 2:00", 0, 0.44, 0, { css: "#5c6bc0", w: 0.4 });
    reg(hits, tapBall, "tap-shutoff");

    const sneakBottle = cyl(g, 0.03, 0.03, 0.26, -1.6, topY + 0.13, barZ - 0.35, 0x6b3a1c, { rough: 0.4, metal: 0.1, seg: 12 });
    holoTag(g, "just one more?", -1.6, topY + 0.32, barZ - 0.35, { css: "#f0645b", w: 0.36 });
    reg(hits, sneakBottle, "sneak-pour");

    const refuseSign = box(g, 0.12, 0.1, 0.02, -1.3, topY + 0.15, barZ - 0.1, 0xdfe4e8, { rough: 0.5 });
    holoTag(g, "refuse — clearly", -1.3, topY + 0.28, barZ - 0.1, { css: "#5c6bc0", w: 0.34 });
    reg(hits, refuseSign, "refuse-request");

    // ------------------------------------------------------------ customers
    const patronKeysProp = box(g, 0.08, 0.01, 0.04, -0.2, topY + 0.01, barZ + 0.15, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    reg(hits, patronKeysProp, "patron-keys");
    const regular = standingFigure(g, -0.2, -0.5, { ry: -2.6, cloth: 0x9a8a5a });
    regular.rotation.z = 0.12;
    reg(hits, regular, "patron-unsteady");
    const otherCustomer = standingFigure(g, 1.2, -0.6, { ry: -2.9, cloth: 0x2c5a3a });
    const manager = standingFigure(g, -1.7, -0.35, { ry: -2.0, cloth: 0x3c5a66, vest: LCL_ACCENT });
    const colleague = standingFigure(g, -1.9, -1.55, { ry: 2.0, cloth: 0x5a4a7a });
    reg(hits, colleague, "stop-pour");
    void otherCustomer; void manager;

    // ------------------------------------------------------------- exit group
    const exitDoor = group(g, 2.6, 0, 1.9, -0.6);
    box(exitDoor, 0.08, 2.0, 0.95, 0, 1.0, 0, 0x2b3138, { rough: 0.5, metal: 0.2 });
    holoTag(exitDoor, "Front door", 0, 2.05, 0, { css: "#5c6bc0", w: 0.32 });
    const groupExit = box(g, 0.5, 0.02, 0.5, 2.1, 0.011, 1.3, LCL_ACCENT,
      { emissive: LCL_ACCENT, ei: 0.4, opacity: 0.4, transparent: true, cast: false, receive: false });
    holoTag(g, "wait for everyone", 2.1, 0.2, 1.3, { css: "#5c6bc0", w: 0.44 });
    reg(hits, groupExit, "group-exit");
    const soloDoor = group(g, -4.0, 0, -1.0, 0.5);
    box(soloDoor, 0.06, 1.9, 0.85, 0, 0.95, 0, 0x59433a, { rough: 0.6 });
    const soloSlab = box(soloDoor, 0.05, 1.8, 0.78, 0.015, 0.95, 0, 0x6b5445, { rough: 0.55 });
    holoTag(soloDoor, "side door — alone?", 0, 1.85, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, soloSlab, "solo-walkout");

    // -------------------------------------------------------- restroom hallway
    const hallX = -3.6;
    const doorMens = group(g, hallX, 0, 0.9, 0.6);
    box(doorMens, 0.06, 1.9, 0.8, 0, 0.95, 0, 0x3a4048, { rough: 0.6 });
    holoTag(doorMens, "Restroom — M", 0, 1.85, 0, { css: "#5c6bc0", w: 0.34 });
    reg(hits, doorMens, "restroom-mens");
    const doorWomens = group(g, hallX, 0, 1.9, 0.6);
    box(doorWomens, 0.06, 1.9, 0.8, 0, 0.95, 0, 0x3a4048, { rough: 0.6 });
    holoTag(doorWomens, "Restroom — W", 0, 1.85, 0, { css: "#5c6bc0", w: 0.34 });
    reg(hits, doorWomens, "restroom-womens");
    const sweepHallway = box(g, 0.9, 0.01, 1.6, hallX + 0.9, 0.011, 1.4, LCL_ACCENT,
      { emissive: LCL_ACCENT, ei: 0.4, opacity: 0.4, transparent: true, cast: false, receive: false });
    reg(hits, sweepHallway, "sweep-hallway");

    // The stall the sweep almost misses.
    const stall = group(g, hallX + 0.9, 0, 1.4);
    box(stall, 0.7, 1.5, 0.02, 0, 0.75, -0.4, 0x8b929a, { rough: 0.6, cast: false });
    const sleeper = standingFigure(stall, 0, 0, { lying: true, cloth: 0x6b5a4a });
    sleeper.position.set(0, 0.05, 0);
    sleeper.rotation.y = 0.4;
    sleeper.visible = false;
    const wakeSpot = box(stall, 0.5, 0.02, 0.3, 0, 0.02, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, wakeSpot, "wake-and-ride");
    const earlyLock = box(g, 0.3, 0.3, 0.1, 2.55, 1.1, 1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lock now?", 2.55, 1.35, 1.55, { css: "#f0645b", w: 0.28 });
    reg(hits, earlyLock, "skip-sweep");

    // --------------------------------------------------------- perimeter & trash
    const windowLatch = box(g, 0.5, 0.6, 0.04, 3.2, 1.3, -1.0, 0x9fc4e0, { rough: 0.2, metal: 0.1, opacity: 0.4, transparent: true, cast: false });
    holoTag(g, "side window", 3.2, 1.7, -1.0, { css: "#5c6bc0", w: 0.32 });
    reg(hits, windowLatch, "unlocked-window");
    const patioDoor = group(g, 3.1, 0, 0.6, -0.5);
    box(patioDoor, 0.06, 1.9, 1.0, 0, 0.95, 0, 0x59433a, { rough: 0.6 });
    holoTag(patioDoor, "patio door", 0, 1.85, 0, { css: "#5c6bc0", w: 0.34 });
    reg(hits, patioDoor, "propped-door");

    const trashBag = box(g, 0.3, 0.4, 0.24, -2.9, 0, 0.9, 0x2b3138, { rough: 0.7 });
    trashBag.position.y = 0.2;
    holoTag(g, "trash bag", -2.9, 0.5, 0.9, { css: "#5c6bc0", w: 0.28 });
    reg(hits, trashBag, "trash-bag");
    const dumpsterSpot = box(g, 0.7, 0.9, 0.5, -4.1, 0.45, 1.9, 0x3a4048, { rough: 0.7, metal: 0.2 });
    holoTag(g, "dumpster", -4.1, 0.98, 1.9, { css: "#5c6bc0", w: 0.3 });
    reg(hits, dumpsterSpot, "dumpster-spot");

    const chairs = [];
    for (let i = 0; i < 3; i++) {
      const chair = group(g, 0.4 + i * 0.5, 0, 1.4, 0.3);
      box(chair, 0.32, 0.35, 0.32, 0, 0.45, 0, 0x3c5a66, { rough: 0.6, finish: "painted", tile: 1 });
      cyl(chair, 0.02, 0.02, 0.45, 0, 0.22, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 8 });
      chairs.push(chair);
    }
    holoTag(g, "chairs — stack them", 0.9, 0.75, 1.4, { css: "#5c6bc0", w: 0.42 });
    reg(hits, chairs[0], "chairs-stacked");

    // ------------------------------------------------------------- gas & lights
    const torchValve = group(g, 0.5, topY, barZ);
    cyl(torchValve, 0.02, 0.02, 0.05, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 12 });
    const valveHandle = box(torchValve, 0.08, 0.015, 0.015, 0, 0.03, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    holoTag(torchValve, "torch gas valve", 0, 0.2, 0, { css: "#5c6bc0", w: 0.36 });
    reg(hits, valveHandle, "gas-off");
    const backBarLight = box(g, 0.5, 0.05, 0.1, 0, 2.8, -4.4, 0xffd9a0, { emissive: 0xffd9a0, ei: 1.2, rough: 0.5, cast: false });
    holoTag(g, "bar lights", 0, 2.95, -4.4, { css: "#5c6bc0", w: 0.3 });
    reg(hits, backBarLight, "lights-off");

    // ------------------------------------------------------------- alarm & sign-off
    const alarmPanel = group(g, -3.1, 0, -2.6, 0.5);
    box(alarmPanel, 0.16, 0.22, 0.06, 0, 1.3, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const alarmDial = cyl(alarmPanel, 0.04, 0.04, 0.02, 0, 1.3, 0.035, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 14 });
    holoTag(alarmPanel, "alarm", 0, 1.5, 0, { css: "#5c6bc0", w: 0.26 });
    reg(hits, alarmDial, "alarm-panel");
    lockTag(alarmPanel, 0.13, 1.15, 0.04, { color: LCL_ACCENT });

    const checklist = holoPanel(g, 0.4, 0.3, -3.3, 1.15, -1.7, (cx, w, h) => {
      cx.fillStyle = "rgba(10,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5c6bc0"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e4e6fb";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CLOSING CHECKLIST", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("Every line, initialled", w / 2, h * 0.65);
    }, { ry: 0.8, accent: LCL_ACCENT });
    reg(hits, checklist, "checklist-sheet");

    const incidentLog = holoPanel(g, 0.4, 0.3, -2.8, 1.15, -1.85, (cx, w, h) => {
      cx.fillStyle = "rgba(10,12,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#5c6bc0"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#e4e6fb";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("INCIDENT LOG", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.fillText("Refusals · rides · sweep", w / 2, h * 0.65);
    }, { ry: 0.7, accent: LCL_ACCENT });
    reg(hits, incidentLog, "incident-log-sign");

    // ------------------------------------------------------------ handed-back
    const handbackKeys = box(g, 0.08, 0.01, 0.04, -0.2, topY + 0.02, barZ + 0.3, 0xdfe4e8, { rough: 0.3, metal: 0.7 });
    holoTag(g, "hand back the keys?", -0.2, topY + 0.16, barZ + 0.3, { css: "#f0645b", w: 0.44 });
    reg(hits, handbackKeys, "handed-back-keys");

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -2.1),

      onStepComplete(step) {
        if (step.id === "no-sale-2am") { tapBall.material = mat(0x59433a, { rough: 0.6 }); }
        if (step.id === "trash-out") { trashBag.visible = false; }
        if (step.id === "gas-lights-off") { backBarLight.material.emissiveIntensity = 0.05; }
        if (step.id === "alarm-set") { alarmDial.rotation.z = Math.PI / 2; }
      },

      onInterrupt(it) {
        if (it.id === "after-hours-request") { colleague.position.x += 0.3; }
        if (it.id === "sleeping-patron") { sleeper.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "after-hours-request") { colleague.position.x -= 0.3; }
        if (it.id === "sleeping-patron") { sleeper.visible = false; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const tr = session?.track;
        if (tr && session?.step?.id === "clear-drinks") {
          clearSweep.material.opacity = 0.25 + Math.max(0, 0.3 - Math.abs(tr.v - 0.5));
        }
        if (tr && session?.step?.id === "restroom-sweep") {
          sweepHallway.material.emissiveIntensity = tr.v >= 0.38 && tr.v <= 0.6 ? 0.7 : 0.3;
        }
        backBarLight.material.emissiveIntensity = backBarLight.material.emissiveIntensity > 0.1
          ? 1.1 + Math.sin(t * 2) * 0.1 : backBarLight.material.emissiveIntensity;
      },
    };
  },
};
