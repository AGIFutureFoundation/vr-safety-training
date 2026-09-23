import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat,
  counter, cabinet, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Wellness — Shift Work, Sleep and Stress. The first walkable
// station of the Job Readiness Edition's Wellness Resource Center block.
//
// The nap room and kitchenette of a training programme's wellness centre, on
// the week a warehouse trainee's roster flips from days to nights. The learner
// is that trainee. What is scored is what NIOSH's shift-work guidance and
// SAMHSA's material on sleep and stress actually ask of a person: read the
// roster for the traps, rate the stress honestly, protect one block of
// anchor sleep and defend it against the extra shift, darken the room, cut
// the caffeine at the right hour, put the phone outside the door, nap for
// twenty minutes and not ninety, plan the light, check yourself before the
// drive home, and take the ride when the check says so.
//
// Two things in the room are the reason the station exists: a set of car keys
// on a hook by the door, and a rack of energy shots on the counter. The
// hours-of-service rule the Class A block teaches is FMCSA's; the warehouse
// has no hours rule at all, which is why the trainee has to carry one.
// Sited generically. No real programme, employer or person is named.

const WSS_ACCENT = 0x6fb7d6;
const WSS_CSS = "#6fb7d6";
const WSS_WARN = 0xf0645b;

export const SIM_WELLNESS_SHIFT_WORK_SLEEP_AND_STRESS = {
  id: "wellness-shift-work-sleep-and-stress",
  index: "228",
  domain: "Workforce readiness",
  trade: "Warehouse and Class A pre-apprentice — Teamsters-bound",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "NIOSH guidance on work schedules, long hours and shift work — the anchor-sleep, light, caffeine and nap practices this station scores; CDC and NIOSH training on shift work and long work hours; SAMHSA guidance on sleep, stress and substance use as connected risks; OSHA, which has no shift-length limit in 29 CFR 1910 and treats worker fatigue through its long-work-hours guidance; FMCSA's hours-of-service rule for property-carrying drivers, which the Class A block of this edition teaches and which the drive home is measured against here; the Teamsters' training programmes for the warehouse and the cab; the programme's own peer-support team and the employee assistance programme (EAP) line",
  name: "Wellness — Shift Work, Sleep and Stress",
  title: simTitle("Wellness — Shift Work, Sleep and Stress"),
  tagline: "The week the roster flips to nights: the traps read off the roster, a stress check rated honestly, one block of anchor sleep held against the extra shift, the room darkened, the caffeine cut, a twenty-minute nap, and the drive home decided by a check instead of by pride",
  accent: WSS_ACCENT,
  accentCss: WSS_CSS,
  parSeconds: 330,
  footprint: 2.4,
  supportLine: "the programme's peer-support team or the employee assistance programme (EAP) line your employer or union carries",
  badge: { id: "anchor-held", name: "Anchor Held", note: "The anchor sleep block held against the extra shift, the caffeine and the keys, and the drive home decided by the check" },

  game: system({
    name: "Wellness Resource Center",
    currency: "REST",
    ranks: ["Trainee", "Roster-Aware", "Anchor Sleeper", "Shift Steward", "Rested and Ready"],
    badges: [
      { id: "traps-read", name: "Traps Read", note: "Every fatigue trap found on the roster before the plan was made", test: AWARD.stepClean("read-the-roster") },
      { id: "keys-stayed", name: "Keys Stayed", note: "No unsafe action anywhere in the run — the keys and the shots stayed where they were", test: AWARD.safe },
      { id: "plan-held", name: "Plan Held", note: "The anchor block and the nap both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-week", name: "Clean Week", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "honest-dial", name: "Honest Dial", note: "The stress check committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "six-straight", name: "Six Straight", note: "Six correct actions in a row", test: AWARD.streak(6) },
    ],
  }),

  hazards: {
    "energy-shot-for-shift": "You reached for an energy shot to make the shift. A stimulant taken to cover a missed sleep window does not replace the sleep; it hides the sleepiness from you while the reaction time stays where the sleep debt left it, and it lands on top of the next sleep block and shortens that one too. NIOSH's shift-work guidance is blunt about it: caffeine is for the first half of a night shift, in a planned amount, never as the thing that makes a shift possible.",
    "drive-on-no-sleep": "You took the car keys off the hook after a missed sleep window. Driving after twenty hours awake impairs a driver about as much as being over the alcohol limit, and a microsleep at the wheel lasts long enough to leave a lane. The Class A block of this edition teaches FMCSA's hours-of-service rule for exactly this reason; nothing in the warehouse writes that rule for you, so you are the one who has to hold it on the drive home.",
    "double-back-accepted": "You signed the swap form for the double — a shift that ends eight hours before the next one starts. Eight hours between shifts is the commute, the meal and the wind-down before it is any sleep at all; NIOSH's guidance calls the quick return the single most fatiguing feature a roster can have, and a person who signs for one has traded the anchor sleep block for a day's pay and a week of recovery.",
    "beer-to-sleep": "You took the beer from the fridge to get to sleep after the night shift. Alcohol brings sleep on and then fragments it, cutting the deep sleep in the second half of the block that the body was actually waiting for, and it is the most common way a shift worker's sleep problem becomes a substance problem — SAMHSA's guidance treats the two as one risk for exactly that reason.",
  },

  lateNotes: {
    "ride-home-plan": "The drive-home decision comes after the self-check, not before it. A plan made before the check is a plan made on how you feel, and how you feel is the thing sleep loss lies about first.",
    "sleep-log-board": "Nothing to log yet — the plan is not made until the anchor block is held, the room is set and the drive home is decided.",
  },

  steps: [
    {
      id: "read-the-roster", kind: "find", noHint: true,
      targets: ["trap-quick-return", "trap-third-night", "trap-backward-rotation"],
      itemNames: {
        "trap-quick-return": "the quick return — eight hours between shifts",
        "trap-third-night": "the third consecutive night",
        "trap-backward-rotation": "the rotation running backwards",
      },
      itemNotes: {
        "trap-quick-return": "Wednesday ends at 22:00 and Thursday starts at 06:00. Eight hours between shifts is not eight hours of sleep — it is the commute, the meal and the wind-down, and about five hours in bed if everything goes right.",
        "trap-third-night": "Three nights in a row. Sleep debt is cumulative and the third night is where reaction time is measurably worst, which is why the plan has to be made before the first one.",
        "trap-backward-rotation": "Nights, then evenings, then days. A rotation that runs backwards asks the body clock to move against the direction it moves most easily; forward rotation — days, evenings, nights — is the one NIOSH's guidance prefers.",
      },
      decoyNotes: {
        "roster-day-off": "A day off is not a trap. It is where the anchor sleep block goes.",
        "roster-forward-rotation": "Days into evenings is the forward direction, the one the body clock adjusts to most easily. The trap is the other way round.",
      },
      title: "Read the roster for the fatigue traps",
      cue: "Three things on this week's roster will cost you sleep before you have lost any. Find them.",
      why: "A roster is a fatigue forecast if you know how to read one. The quick return, the run of consecutive nights and the backward rotation are the three features NIOSH's shift-work guidance names as most fatiguing, and they are visible a week in advance — which means a plan can be made for them. A trainee who reads the roster as a list of start times finds out about the traps on Thursday at 05:00, and by then the only tool left is caffeine.",
    },
    {
      id: "stress-check", kind: "gauge", target: "stress-dial",
      title: "Rate the stress honestly",
      cue: "The dial swings one to ten. Commit it where this week actually is, not where you would like it to be.",
      gauge: {
        label: "STRESS", speed: 0.6, green: [0.62, 0.84],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That reading does not match the roster you just read. Three traps in one week and a household to run is not a three out of ten, and it is not a ten either — the check only works if the number is the true one.",
      },
      why: "The stress check is the guide's own card, brought to the front of the station instead of the end, because a sleep plan made by somebody who has just told themselves they are fine is a plan with no reason to exist. Rating it honestly — a seven or an eight on this week — is what makes the next eleven steps worth doing, and it is the same practice the peer-support station asks you to offer somebody else. SAMHSA's guidance ties stress, sleep and substance use together as one risk; the dial is where that risk gets a number.",
    },
    {
      id: "anchor-sleep", kind: "sequence",
      targets: ["anchor-pick", "anchor-block", "anchor-tell"],
      itemNames: {
        "anchor-pick": "pick the anchor block the roster cannot move",
        "anchor-block": "block it on the calendar",
        "anchor-tell": "tell the household when it is",
      },
      title: "Set the anchor sleep block",
      cue: "Pick the block, put it on the calendar, tell the people you live with — in that order.",
      why: "Anchor sleep is the four or five hours that stay at the same clock time on every day of the week, work or not, so the body clock has one fixed point to hold onto while the shifts move around it. It has to be picked off the roster first, because it has to fit every day; it goes on the calendar second, because a block that is only in your head is the first thing to move; and the household hears about it last, because they are the ones who will be asked not to run the vacuum through it.",
      outOfOrderNote: "Pick it, then block it, then tell them. Telling the household about a block you have not fixed to the roster yet is announcing a plan you will have to change by Wednesday.",
    },
    {
      id: "hold-the-anchor", kind: "track", target: "anchor-point", seconds: 7,
      title: "Hold the anchor block against the week",
      cue: "Keep the sleep block inside the seven-to-nine-hour band while the week pushes at it.",
      track: {
        start: 0.5, green: [0.4, 0.66], rise: 0.5, fall: 0.42, drift: 0.15, label: "ANCHOR SLEEP",
        readout: (v) => (v < 0.4 ? "shrinking" : v > 0.66 ? "oversleeping into the shift" : "held"),
      },
      why: "A sleep plan is not a decision, it is a thing that gets defended every day of the week against a schedule that would rather have the hours. Let the block shrink and you are back to the five hours the quick return left you; let it sprawl and you sleep through the start of the next shift and lose the job the plan was for. Holding it in the band is the practice — small corrections, every day, against a drift that never stops.",
      holdBreakNote: "The block got away from you — shrunk into the shift or sprawled over the next start. Bring it back to the band and hold it there; the week does not stop pushing.",
    },
    {
      id: "blackout", kind: "turn", target: "blind-roller",
      title: "Roll the blackout blind down",
      cue: "Turn the roller until the room is dark. Daylight through a curtain is a signal to wake.",
      turn: { turns: 1.5, axis: "y", label: "BLACKOUT BLIND" },
      why: "Light is the strongest signal the body clock takes, and daylight leaking round an ordinary curtain at nine in the morning tells a night worker's brain to end the sleep it has just started. A blackout blind rolled fully down is the single cheapest change in this room and the one NIOSH's guidance puts first for daytime sleep — ahead of the mattress, ahead of the noise, ahead of anything you would buy.",
    },
    {
      id: "caffeine-cutoff", kind: "select", target: "caffeine-card",
      title: "Set the caffeine cut-off",
      cue: "Last coffee at least six hours before the sleep block — read the card, not the rack beside it.",
      why: "Caffeine has a half-life of about five to six hours, so a coffee at four in the morning is still half in the blood at ten, when the sleep block starts, and it is the difference between the deep sleep the block was for and a light, broken version of it. The card puts the cut-off on the clock: caffeine in the first half of the night shift, in a planned amount, and nothing after. The energy-shot rack beside it is the opposite plan, and it is on the counter because that is where it is on a real one.",
    },
    {
      id: "phone-out", kind: "drag", target: "phone-handset",
      title: "Put the phone on the charging shelf outside the sleep space",
      cue: "Carry the phone to the shelf by the door. It does not come to bed.",
      drag: {
        to: "charging-shelf", radius: 0.55,
        missNote: "Still within reach of the bed. The shelf is by the door for a reason — a phone you can reach without standing up is a phone you will answer.",
      },
      why: "The phone is the roster, the group chat and dispatch, and every one of those will offer you something during the sleep block. On the shelf by the door it still rings for the emergency it is kept on for, and it stops being the thing you reach for at the first light waking; the screen's own light is a wake signal on top of whatever the message says. Moving it is a physical act, which is why it is a step and not a resolution.",
    },
    {
      id: "nap-timer", kind: "hold", target: "nap-timer", seconds: 8,
      title: "Take the twenty-minute nap — and stop at twenty",
      cue: "Set the timer and hold the nap for its full count. Twenty minutes, not ninety.",
      why: "A twenty-minute nap before a night shift clears a measurable amount of the sleepiness without going deep enough to leave you groggy on waking; a ninety-minute one runs into deep sleep and you wake worse than you lay down, which is the sleep inertia that makes people swear naps do not work. The timer is the whole technique — a nap without a set length is a gamble on which side of the line you wake up on.",
      holdBreakNote: "You got up before the count. A nap cut short is a nap that did not clear anything; lie back down and let the timer run.",
    },
    {
      id: "light-plan", kind: "select", target: "light-plan-card",
      title: "Set the light plan for the shift",
      cue: "Bright light at the start of the night, sunglasses for the drive home, dark room after. Read the card.",
      why: "The body clock can be steered by light, and the shift worker who steers it deliberately sleeps better than the one who lets it happen. Bright light in the first hours of the night shift pushes the clock later and holds alertness; dark glasses on the drive home stop the morning sun from pulling it straight back; the blackout blind finishes the job. It is the same three moves every night, which is why they are on one card.",
    },
    {
      id: "drive-self-check", kind: "find", noHint: true,
      targets: ["sc-head-nod", "sc-lane-drift", "sc-lost-miles"],
      itemNames: {
        "sc-head-nod": "the head nod",
        "sc-lane-drift": "drifting toward the line",
        "sc-lost-miles": "miles you cannot remember driving",
      },
      itemNotes: {
        "sc-head-nod": "The chin drops and comes back up. That is a microsleep, not a yawn, and it lasts long enough to cover the length of a football field at highway speed.",
        "sc-lane-drift": "The rumble strip or the line, more than once. Steering is the first fine-motor task sleep loss takes.",
        "sc-lost-miles": "You are at the exit and do not remember the last two. That is not concentration — that is sleep with the eyes open.",
      },
      decoyNotes: {
        "sc-radio-up": "Turning the radio up feels like a countermeasure and is not one. It is on the board because it is what people actually do instead of stopping.",
        "sc-window-down": "Cold air wakes you for about a minute. It is not a sign and it is not a fix.",
      },
      title: "Run the drive-home self-check",
      cue: "Three signs on the board mean you do not drive. Find them; leave the things people do instead.",
      why: "Nobody feels as tired as they are at the end of a night shift, so the drive-home decision cannot be made on feeling. The self-check gives it three observable signs — the head nod, the lane drift, the lost miles — any one of which means the keys stay on the hook. FMCSA's hours-of-service rule does this arithmetic for a driver in a cab by law; a warehouse trainee has to do it for themselves, and the check is how.",
    },
    {
      id: "ride-home-plan", kind: "select", target: "ride-home-plan",
      title: "Decide the drive home",
      cue: "The check said no. The ride card, the nap, or the transit pass — not the keys.",
      why: "Deciding the ride before the shift, in the plan, is what makes the decision available at six in the morning when the check says you should not drive and every part of you wants to be home. A standing arrangement — a colleague on the same shift, the transit pass in the bag, the ride card on the wall — costs less than the drive would, and it is a plan a Class A trainee will recognise: the rule that keeps a driver off the road is written down before the trip, never negotiated at the end of it.",
    },
    {
      id: "file-the-plan", kind: "drag", target: "plan-sheet",
      title: "File the sleep plan",
      cue: "Carry the plan sheet to the log tray. A plan on the table is a plan that gets lost under the roster.",
      drag: {
        to: "log-tray", radius: 0.5,
        missNote: "Not in the tray. The plan goes where the roster goes, so the two are read together — next week's roster will have next week's traps.",
      },
      why: "The plan is written down and filed for the same reason the roster is: so it exists when you are too tired to remember it. Next week's roster brings next week's traps, and the sheet in the tray is what next week's plan starts from. Filing it also puts it where the programme's wellness staff can see the pattern across a cohort, which is how a roster with a built-in quick return gets raised with the people who write rosters.",
    },
    {
      id: "close-the-log", kind: "select", target: "sleep-log-board",
      title: "Log the week and ask how you are doing",
      cue: "Close the log, then answer the guide's check-in. It is never scored.",
      why: "The log records that the plan was made and what it holds; the check-in records nothing anywhere but your own browser, and asks the question the week was about. A trainee who can say \"a bit shaken\" at the end of a station about sleep and stress has already done the thing the peer-support station teaches next. The programme's peer-support team and the EAP line are named on the results card for the run where the honest answer is \"need a minute\".",
    },
  ],

  interrupts: [
    {
      id: "extra-shift-offered",
      kind: "Dispatch text — extra shift",
      after: "hold-the-anchor", delay: 3, seconds: 12,
      alert: "The phone lights up on the table: dispatch has an extra shift tonight, time and a half, ending four hours before your next start.",
      cue: "Decline it. Reply once — not tonight — and keep hold of the anchor block.",
      target: "decline-extra-shift",
      why: "The extra shift is the anchor block's natural enemy, and it always arrives when the block is being set, because that is when the roster is short. Time and a half for a shift that ends four hours before the next start is a quick return you volunteered for, and the recovery costs more than the pay. Saying no once, by text, while the plan is in front of you is the whole skill; the version of you at three in the morning will not say it.",
      missNote: "The offer sat on the screen until dispatch filled it with somebody else — and next time they will not ask, they will assume. The anchor block you were holding has a hole in it the shape of a double.",
      wrongNote: "Not the anchor point, and not the phone itself. The thing that has to happen is the reply that says not tonight — anything else is leaving the offer open.",
    },
    {
      id: "coworker-offers-to-drive",
      kind: "Coworker with keys out",
      after: "nap-timer", delay: 3, seconds: 13,
      alert: "The coworker who has been up twenty hours is on his feet by the door with his keys out — \"come on, I'll drop you, I'm fine.\"",
      cue: "Take the ride card, not the lift. Call the ride for both of you.",
      target: "ride-card",
      why: "A colleague twenty hours awake offering to drive is the drive-on-no-sleep hazard wearing a friendly face, and the second person in the car does not make it safer. The ride card on the wall exists for this exact moment: it takes the decision off both of you and puts it on a plan that was made when everybody was awake. Saying yes to the lift is agreeing that pride outranks the check you have just run.",
      missNote: "He drove, and you went with him. Whatever the self-check said ten minutes ago, two people were in a car driven by somebody who had been awake for twenty hours, and the training that was supposed to prevent it was watching.",
      wrongNote: "Not the nap timer, and not the keys. The right answer is the ride card — the call that gets both of you home without either of you driving.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WSS_ACCENT);

    // ------------------------------------------------------------------ floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#5e6a72", base2: "#556169", seam: "rgba(28,34,40,0.4)",
    }), { repeat: 4, px: 384 });
    const floor = box(g, 5.6, 0.018, 4.9, 0, 0.01, -0.5, 0x5e6a72, { rough: 0.95, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.02, color: 0x5e6a72 });

    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#b3bcc2", base2: "#a7b0b6", seam: "rgba(60,68,76,0.3)",
    }), { repeat: 3, px: 320 });
    const backWall = box(g, 6.4, 2.9, 0.12, 0, 1.45, -3.1, 0xb3bcc2, { rough: 0.9 });
    backWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb3bcc2 });
    box(g, 6.6, 0.1, 0.2, 0, 2.95, -3.1, 0x7f8992, { rough: 0.8 });
    const leftWall = box(g, 0.12, 2.9, 5.0, -3.1, 1.45, -0.6, 0xb3bcc2, { rough: 0.9 });
    leftWall.material = texturedMat(wallTex, { rough: 0.9, metal: 0.02, color: 0xb3bcc2 });

    // ------------------------------------------------------------ the doorway
    // On the right wall, with the key hook, the ride card, the charging shelf
    // and the drive self-check board all beside it — the drive home is decided
    // where the drive home begins.
    const doorway = group(g, 2.95, 0, 1.2, -Math.PI / 2);
    box(doorway, 0.14, 2.3, 0.16, -0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 0.14, 2.3, 0.16, 0.62, 1.15, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 1.4, 0.14, 0.16, 0, 2.37, 0, 0x4e565f, { rough: 0.7 });
    box(doorway, 1.06, 2.14, 0.06, 0, 1.08, 0.08, 0x8a7a68, { rough: 0.65 });
    cyl(doorway, 0.02, 0.02, 0.12, 0.42, 1.05, 0.14, 0xdfe4e8, { rough: 0.3, metal: 0.8, seg: 10 }).rotation.x = Math.PI / 2;

    const keyHook = group(g, 2.86, 1.35, 0.15, -Math.PI / 2);
    box(keyHook, 0.22, 0.08, 0.03, 0, 0, 0, 0x3a4149, { rough: 0.6 });
    for (const hx of [-0.06, 0.06]) cyl(keyHook, 0.006, 0.006, 0.05, hx, -0.05, 0.02, 0xb0b8c0, { rough: 0.3, metal: 0.8, seg: 8 });
    const carKeys = group(keyHook, -0.06, -0.12, 0.03);
    box(carKeys, 0.03, 0.06, 0.012, 0, 0, 0, 0x22262b, { rough: 0.5 });
    cyl(carKeys, 0.018, 0.018, 0.005, 0, -0.05, 0, 0xb0b8c0, { rough: 0.35, metal: 0.85, seg: 12 });
    holoTag(keyHook, "Car keys — drive home?", 0, 0.14, 0.02, { css: "#f0645b", w: 0.52 });
    reg(hits, carKeys, "drive-on-no-sleep");

    const rideBoard = group(g, 2.88, 1.4, -0.55, -Math.PI / 2);
    const rideCard = decal(rideBoard, 0.3, 0.2, 0, 0, 0,
      signFace("RIDE — CALL IT", { bg: "#0c1a24", accent: "#59c97b", scale: 0.38 }), { px: 192, glow: true, ei: 0.8, transparent: true });
    holoTag(rideBoard, "Ride card — the standing arrangement", 0, 0.18, 0.002, { css: "#59c97b", w: 0.66 });
    reg(hits, rideCard, "ride-card");
    const ridePlan = decal(rideBoard, 0.3, 0.2, 0, -0.3, 0,
      paperFace("DRIVE HOME PLAN", ["Check first", "Ride · nap · transit", "Keys stay on the hook"], { scale: 0.5 }), { px: 224 });
    holoTag(rideBoard, "Decide the drive home", 0, -0.46, 0.002, { css: WSS_CSS, w: 0.5 });
    reg(hits, ridePlan, "ride-home-plan");

    const chargeShelf = group(g, 2.86, 1.0, 1.95, -Math.PI / 2);
    const shelf = box(chargeShelf, 0.42, 0.03, 0.16, 0, 0, 0.08, 0x6b5a48, { rough: 0.6 });
    box(chargeShelf, 0.03, 0.12, 0.03, 0.16, -0.06, 0.03, 0x3a4149, { rough: 0.5, metal: 0.4 });
    holoTag(chargeShelf, "Charging shelf — outside the sleep space", 0, 0.2, 0.06, { css: WSS_CSS, w: 0.7 });
    reg(hits, shelf, "charging-shelf");

    // The drive-home self-check board on the right wall by the door.
    const scBoard = group(g, 2.9, 1.55, 2.6, -Math.PI / 2);
    box(scBoard, 0.7, 0.62, 0.04, 0, 0, 0, 0x2b3138, { rough: 0.7 });
    holoTag(scBoard, "Drive-home self-check", 0, 0.38, 0.03, { css: WSS_CSS, w: 0.5 });
    const SC = [
      ["sc-head-nod", "Head nod", -0.22, 0.16, WSS_ACCENT, WSS_CSS],
      ["sc-lane-drift", "Lane drift", 0.22, 0.16, WSS_ACCENT, WSS_CSS],
      ["sc-lost-miles", "Miles you can't recall", -0.22, -0.1, WSS_ACCENT, WSS_CSS],
      ["sc-radio-up", "Radio up", 0.22, -0.1, 0x8a929a, "#8a929a"],
      ["sc-window-down", "Window down", 0.0, -0.3, 0x8a929a, "#8a929a"],
    ];
    for (const [sid, label, x, y, color, css] of SC) {
      const bead = ball(scBoard, 0.022, x, y, 0.03, color, { emissive: color, ei: 1.3, seg: 12 });
      holoTag(scBoard, label, x, y - 0.075, 0.03, { css, w: 0.36 });
      reg(hits, bead, sid);
    }

    // ----------------------------------------------------------- the roster
    // On the back wall: the week, with the three traps as beads on the days.
    const roster = holoPanel(g, 1.2, 0.62, 0.7, 1.75, -3.02, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WSS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ROSTER — THIS WEEK", w * 0.04, h * 0.13);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      const days = ["MON 06–14", "TUE 14–22", "WED 14–22", "THU 06–14", "FRI off", "SAT 22–06", "SUN 22–06 · MON 22–06"];
      days.forEach((d, i) => cx.fillText(d, w * (0.04 + Math.floor(i / 4) * 0.5), h * (0.32 + (i % 4) * 0.16)));
    }, { accent: WSS_ACCENT });
    const ROSTER_BEADS = [
      ["trap-quick-return", "Quick return · 8 h", -0.18, 0.02, WSS_ACCENT, WSS_CSS],
      ["trap-third-night", "Third night", 0.42, -0.2, WSS_ACCENT, WSS_CSS],
      ["trap-backward-rotation", "Backwards rotation", 0.42, 0.14, WSS_ACCENT, WSS_CSS],
      ["roster-day-off", "Day off", 0.14, -0.12, 0x8a929a, "#8a929a"],
      ["roster-forward-rotation", "Days → evenings", -0.18, 0.2, 0x8a929a, "#8a929a"],
    ];
    for (const [rid, label, x, y, color, css] of ROSTER_BEADS) {
      const bead = ball(roster, 0.022, x, y, 0.02, color, { emissive: color, ei: 1.3, seg: 12 });
      holoTag(roster, label, x + 0.28, y, 0.02, { css, w: 0.42 });
      reg(hits, bead, rid);
    }

    // ------------------------------------------------------------ the nap corner
    const cot = group(g, -1.9, 0, -1.9, 0.0);
    box(cot, 0.9, 0.08, 2.0, 0, 0.42, 0, 0x3a4149, { rough: 0.6, metal: 0.4 });
    box(cot, 0.86, 0.14, 1.96, 0, 0.53, 0, 0x6b7f94, { rough: 0.9 });
    box(cot, 0.5, 0.1, 0.3, 0, 0.65, -0.75, 0xe8edf1, { rough: 0.85 });
    box(cot, 0.86, 0.05, 1.1, 0, 0.62, 0.35, 0x4f6a86, { rough: 0.9 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(cot, 0.02, 0.02, 0.4, sx * 0.4, 0.2, sz * 0.92, 0x5b636b, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    holoTag(cot, "Nap room", 0, 1.0, -0.6, { css: WSS_CSS, w: 0.3 });

    // The blackout blind on the back wall above the cot: a roller with a
    // chain, and a blind leaf that comes down as the roller turns.
    const blind = group(g, -1.9, 2.4, -3.0);
    box(blind, 1.3, 0.1, 0.1, 0, 0, 0, 0x2b3138, { rough: 0.6 });
    const blindLeaf = box(blind, 1.2, 0.5, 0.02, 0, -0.3, 0.02, 0x2a3140, { rough: 0.9 });
    const blindRoller = group(blind, 0.7, 0, 0.0);
    cyl(blindRoller, 0.04, 0.04, 0.08, 0, 0, 0, 0xb0b8c0, { rough: 0.3, metal: 0.8, seg: 14 }).rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const knob = box(blindRoller, 0.012, 0.012, 0.09, 0, 0, 0, 0x3a4149, { rough: 0.5 });
      knob.rotation.x = (i * Math.PI) / 4;
    }
    cyl(blind, 0.006, 0.006, 0.9, 0.74, -0.5, 0.0, 0xb0b8c0, { rough: 0.3, metal: 0.7, seg: 6 });
    holoTag(blind, "Blackout blind — roll it down", 0.7, 0.16, 0.06, { css: WSS_CSS, w: 0.6 });
    reg(hits, blindRoller, "blind-roller");
    // Daylight through the window before the blind is down.
    const windowGlow = box(g, 1.1, 1.0, 0.02, -1.9, 1.75, -3.02, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.9, rough: 0.5, cast: false });

    // Light-plan card on the left wall by the cot.
    const lightCard = group(g, -2.98, 1.5, -1.2, Math.PI / 2);
    const lightPlan = decal(lightCard, 0.36, 0.26, 0, 0, 0,
      paperFace("LIGHT PLAN", ["Bright light — start of night", "Dark glasses — drive home", "Blind down — sleep"], { scale: 0.5 }), { px: 256 });
    holoTag(lightCard, "Light plan", 0, 0.2, 0.002, { css: WSS_CSS, w: 0.3 });
    reg(hits, lightPlan, "light-plan-card");
    // Sunglasses on a hook under it.
    box(lightCard, 0.14, 0.03, 0.02, 0, -0.22, 0.01, 0x1b1e22, { rough: 0.4 });
    for (const sx of [-1, 1]) box(lightCard, 0.05, 0.04, 0.01, sx * 0.04, -0.25, 0.015, 0x12161a, { rough: 0.3, metal: 0.3 });

    // The nap timer on a small shelf at the head of the cot.
    const timerShelf = group(g, -2.55, 0.9, -2.7);
    box(timerShelf, 0.36, 0.03, 0.24, 0, 0, 0, 0x6b5a48, { rough: 0.6 });
    const napTimer = instrument(timerShelf, 0, 0.02, 0, { idle: "20:00", color: WSS_ACCENT, w: 0.14, d: 0.2 });
    holoTag(timerShelf, "Nap timer — 20 min", 0, 0.2, 0, { css: WSS_CSS, w: 0.42 });
    reg(hits, napTimer, "nap-timer");
    const lamp = group(g, -2.55, 0, -2.3);
    cyl(lamp, 0.02, 0.03, 0.9, 0, 0.45, 0, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 10 });
    ball(lamp, 0.07, 0, 1.0, 0, 0xffe6b0, { emissive: 0xffe6b0, ei: 0.6, rough: 0.5, seg: 12 });

    // The anchor-sleep plan on the left wall: the calendar with the three
    // sequence beads, and the track point.
    const planBoard = holoPanel(g, 0.9, 0.6, -2.96, 1.7, 0.2, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WSS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ANCHOR SLEEP — 7 DAYS", w * 0.04, h * 0.13);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Same clock hours every day", "4–5 h that never move", "Household told"].forEach((l, i) => cx.fillText(l, w * 0.04, h * (0.36 + i * 0.18)));
    }, { ry: Math.PI / 2, accent: WSS_ACCENT });
    const ANCHOR = [
      ["anchor-pick", "1 — pick the block", 0.3, 0.18],
      ["anchor-block", "2 — block the calendar", 0.3, 0.0],
      ["anchor-tell", "3 — tell the household", 0.3, -0.18],
    ];
    for (const [aid, label, x, y] of ANCHOR) {
      const bead = ball(planBoard, 0.022, x, y, 0.02, WSS_ACCENT, { emissive: WSS_ACCENT, ei: 1.4, seg: 12 });
      holoTag(planBoard, label, x + 0.3, y, 0.02, { css: WSS_CSS, w: 0.5 });
      reg(hits, bead, aid);
    }
    const anchorMount = group(g, -2.6, 0.95, 0.9, Math.PI / 2);
    box(anchorMount, 0.3, 0.9, 0.3, 0, -0.5, 0, 0x3a4149, { rough: 0.6, metal: 0.3 });
    const anchorGauge = instrument(anchorMount, 0, 0.0, 0, { idle: "ANCHOR", color: WSS_ACCENT, w: 0.2, d: 0.24 });
    holoTag(anchorMount, "Hold the anchor block", 0, 0.2, 0, { css: WSS_CSS, w: 0.46 });
    reg(hits, anchorGauge, "anchor-point");

    // ------------------------------------------------------------ the table
    const tableTop = cyl(g, 0.6, 0.6, 0.05, 0.4, 0.72, -1.4, 0x6b5a48, { rough: 0.5, seg: 24 });
    cyl(g, 0.07, 0.09, 0.7, 0.4, 0.35, -1.4, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 14 });
    cyl(g, 0.3, 0.3, 0.03, 0.4, 0.015, -1.4, 0x3a4149, { rough: 0.5, metal: 0.4, seg: 18 });
    void tableTop;

    const stressMount = group(g, 0.15, 0.76, -1.15, 0.3);
    const stressDial = instrument(stressMount, 0, 0, 0, { idle: "1–10", color: WSS_ACCENT, w: 0.2, d: 0.24 });
    holoTag(stressMount, "Stress check", 0, 0.2, 0, { css: WSS_CSS, w: 0.32 });
    reg(hits, stressDial, "stress-dial");

    // The phone, the text bubble that appears over it, and the reply card.
    const phone = group(g, 0.7, 0.76, -1.6, -0.3);
    const phoneBody = box(phone, 0.075, 0.012, 0.15, 0, 0, 0, 0x1b1e22, { rough: 0.35, metal: 0.4 });
    const phoneScreen = decal(phone, 0.065, 0.13, 0, 0.007, 0,
      signFace("22:14", { bg: "#0c1a24", accent: WSS_CSS, fg: "#cfeaf7", scale: 0.3 }), { px: 128, glow: true, ei: 0.6 });
    phoneScreen.rotation.x = -Math.PI / 2;
    holoTag(phone, "Your phone", 0, 0.16, 0, { css: WSS_CSS, w: 0.3 });
    reg(hits, phoneBody, "phone-handset");
    const textBubble = decal(phone, 0.34, 0.14, 0, 0.32, 0,
      signFace("DISPATCH: EXTRA SHIFT TONIGHT?", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 }), { px: 256, glow: true, ei: 1.0, transparent: true });
    textBubble.visible = false;
    const declineCard = decal(g, 0.28, 0.16, 1.05, 0.78, -1.1,
      signFace("REPLY: NOT TONIGHT", { bg: "#0c1a24", accent: "#59c97b", scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
    declineCard.rotation.x = -Math.PI / 2;
    holoTag(g, "Decline the extra shift", 1.05, 0.92, -1.1, { css: "#59c97b", w: 0.5 });
    reg(hits, declineCard, "decline-extra-shift");

    // The shift-swap form for the double — the hazard on the table.
    const swapForm = decal(g, 0.22, 0.3, 0.2, 0.755, -1.75,
      paperFace("SHIFT SWAP", ["Cover WED 22–06", "Then THU 06–14", "Sign here ______"], { scale: 0.45 }), { px: 224 });
    swapForm.rotation.x = -Math.PI / 2; swapForm.rotation.z = 0.25;
    holoTag(g, "Swap form — take the double?", 0.2, 0.95, -1.75, { css: "#f0645b", w: 0.6 });
    reg(hits, swapForm, "double-back-accepted");

    // The plan sheet and the log tray it is filed in.
    const planSheet = decal(g, 0.22, 0.3, 0.75, 0.755, -1.28,
      paperFace("SLEEP PLAN", ["Anchor 09–14 daily", "Caffeine cut 02:00", "Ride Sat/Sun"], { scale: 0.45 }), { px: 224 });
    planSheet.rotation.x = -Math.PI / 2; planSheet.rotation.z = -0.2;
    holoTag(g, "Sleep plan sheet", 0.75, 0.93, -1.28, { css: WSS_CSS, w: 0.36 });
    reg(hits, planSheet, "plan-sheet");
    const logTray = group(g, -0.9, 0, -2.75);
    box(logTray, 0.4, 0.9, 0.3, 0, 0.45, 0, 0x4f5860, { rough: 0.6, metal: 0.2 });
    const tray = box(logTray, 0.34, 0.03, 0.26, 0, 0.92, 0, 0x8a929a, { rough: 0.5, metal: 0.5 });
    box(logTray, 0.34, 0.06, 0.02, 0, 0.96, -0.12, 0x8a929a, { rough: 0.5, metal: 0.5 });
    holoTag(logTray, "Log tray — roster and plan", 0, 1.1, 0, { css: WSS_CSS, w: 0.5 });
    reg(hits, tray, "log-tray");

    // ------------------------------------------------------- the kitchenette
    const kitchen = counter(g, 1.6, 0.5, 2.1, -2.6, 0x5b636b, { ry: 0, height: 0.9, undershelf: true });
    cabinet(g, 1.5, 0.5, 0.32, 2.1, 1.85, -2.9, 0x8a7862, { doorColor: 0x7e6d59 });
    // Coffee machine.
    const coffee = group(kitchen, -0.5, 0.92, -0.05);
    box(coffee, 0.26, 0.34, 0.28, 0, 0.17, 0, 0x22262b, { rough: 0.5, metal: 0.3 });
    cyl(coffee, 0.05, 0.05, 0.1, 0, 0.09, 0.09, 0xe6eaee, { rough: 0.5, seg: 12 });
    ball(coffee, 0.012, 0.08, 0.3, 0.14, 0x59c97b, { emissive: 0x59c97b, ei: 1.5, seg: 8 });
    const caffeineCard = decal(kitchen, 0.3, 0.2, -0.12, 1.02, -0.22,
      paperFace("CAFFEINE CUT-OFF", ["Last coffee 6 h before sleep", "First half of the night only", "Planned amount"], { scale: 0.5 }), { px: 224 });
    caffeineCard.rotation.x = -0.3;
    holoTag(kitchen, "Caffeine cut-off card", -0.12, 1.2, -0.2, { css: WSS_CSS, w: 0.44 });
    reg(hits, caffeineCard, "caffeine-card");
    // Energy-shot rack — the hazard.
    const rack = group(kitchen, 0.45, 0.92, 0.0);
    box(rack, 0.3, 0.02, 0.14, 0, 0.01, 0, 0x2b3138, { rough: 0.6 });
    const shots = [];
    for (let i = 0; i < 4; i++) {
      const s = cyl(rack, 0.018, 0.018, 0.09, -0.1 + i * 0.066, 0.065, 0, [0xe8542f, 0xf2c14b, 0xe8542f, 0x4fd1ff][i], { rough: 0.4, metal: 0.3, seg: 10 });
      shots.push(s);
    }
    holoTag(rack, "Energy shots — make the shift?", 0, 0.24, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, shots[0], "energy-shot-for-shift");
    // Fridge with the beer.
    const fridge = group(g, 0.85, 0, -2.85);
    box(fridge, 0.6, 1.4, 0.6, 0, 0.7, 0, 0xdfe4e8, { rough: 0.4, metal: 0.3 });
    box(fridge, 0.56, 0.62, 0.02, 0, 1.05, 0.31, 0xcfd6dc, { rough: 0.4, metal: 0.3 });
    box(fridge, 0.03, 0.3, 0.03, 0.22, 1.05, 0.33, 0x8d959d, { rough: 0.3, metal: 0.9 });
    const beer = cyl(fridge, 0.03, 0.03, 0.12, -0.18, 0.86, 0.36, 0xb8862b, { rough: 0.35, metal: 0.5, seg: 12 });
    holoTag(fridge, "A beer to get to sleep?", -0.18, 1.02, 0.4, { css: "#f0645b", w: 0.5 });
    reg(hits, beer, "beer-to-sleep");

    // ------------------------------------------------------------ the coworker
    // Seated at the table, twenty hours awake; on his feet by the door when
    // the interruption fires. The standing figure is hidden until then.
    const cwChair = group(g, 1.35, 0, -2.0, -2.2);
    box(cwChair, 0.44, 0.06, 0.44, 0, 0.44, 0, 0x4a535c, { rough: 0.8 });
    box(cwChair, 0.44, 0.5, 0.06, 0, 0.72, -0.19, 0x4a535c, { rough: 0.8 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(cwChair, 0.018, 0.018, 0.44, sx * 0.18, 0.22, sz * 0.18, 0x5b636b, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    const coworker = seatedFigure(g, 1.35, 0.46, -2.0, { ry: -2.2, cloth: 0x2f3946, skin: 0xbc8f68 });
    coworker.head.rotation.x = 0.2;
    holoTag(coworker.torso, "Twenty hours awake", 0, 1.3, 0.12, { css: WSS_CSS, w: 0.4 });
    const coworkerUp = standingFigure(g, 1.75, 1.3, { ry: -1.2, cloth: 0x2f3946, trousers: 0x2a3138, skin: 0xbc8f68 });
    coworkerUp.visible = false;
    // In his hand, so it moves with him and is part of the figure, not a
    // thing on the floor beside him.
    const keysOut = group(coworkerUp, 0.3, 1.05, 0.18);
    box(keysOut, 0.05, 0.012, 0.028, 0, 0, 0, 0x8d959d, { rough: 0.4, metal: 0.8 });
    cyl(keysOut, 0.022, 0.022, 0.006, 0.04, 0, 0, 0xb0b8c0, { rough: 0.35, metal: 0.85, seg: 12 });
    holoTag(keysOut, "\"I'll drop you, I'm fine\"", 0, 0.14, 0, { css: "#f0645b", w: 0.5 });
    keysOut.visible = false;

    // The wellness staff member, standing clear of everything by the back wall.
    const staff = standingFigure(g, -0.55, -1.6, { ry: 0.6, cloth: 0x3f6b7a, trousers: 0x2a3138 });
    holoTag(staff, "Wellness staff", 0, 1.95, 0, { css: WSS_CSS, w: 0.34 });

    // ------------------------------------------------------------- the boards
    const logBoard = holoPanel(g, 0.52, 0.36, -2.5, 1.95, 1.9, (cx, w, h) => {
      cx.fillStyle = "rgba(8,20,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WSS_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SLEEP LOG — THIS WEEK", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      cx.fillStyle = "#b9d8e6";
      ["Anchor block · caffeine cut · ride", "Traps read off the roster", "Then the check-in"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.52 + i * 0.15)));
    }, { ry: 0.6, accent: WSS_ACCENT });
    reg(hits, logBoard, "sleep-log-board");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -1.9),

      onStepComplete(step) {
        if (step.id === "blackout") {
          blindLeaf.scale.y = 3.6;
          blindLeaf.position.y = -1.1;
          windowGlow.visible = false;
        }
        if (step.id === "phone-out") {
          phone.position.set(2.86, 1.03, 1.95);
          phone.rotation.y = -Math.PI / 2;
        }
        if (step.id === "nap-timer") {
          repaint(napTimer.userData.screen, signFace("00:00", { bg: "#0c1a24", accent: "#59c97b", fg: "#cfeaf7", scale: 0.55 }));
        }
        if (step.id === "file-the-plan") {
          planSheet.position.set(-0.9, 0.95, -2.75);
          planSheet.rotation.z = 0;
        }
        if (step.id === "close-the-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("WEEK LOGGED", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("Now the check-in — never scored", w / 2, h * 0.66);
          });
        }
      },

      // Both interruptions put something physical in the room: a message over
      // the phone, and a man on his feet by the door with his keys out.
      onInterrupt(it) {
        if (it.id === "extra-shift-offered") {
          textBubble.visible = true;
          repaint(phoneScreen, signFace("DISPATCH", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd9d9", scale: 0.3 }));
        }
        if (it.id === "coworker-offers-to-drive") {
          coworker.root.visible = false;
          coworkerUp.visible = true;
          keysOut.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "extra-shift-offered") {
          textBubble.visible = false;
          repaint(phoneScreen, signFace("SENT", { bg: "#0c1a24", accent: "#59c97b", fg: "#cfeaf7", scale: 0.3 }));
        }
        if (it.id === "coworker-offers-to-drive") {
          keysOut.visible = false;
          coworkerUp.visible = false;
          coworker.root.visible = true;
        }
      },

      animate(t, dt, session) {
        coworker.head.rotation.x = 0.2 + Math.sin(t * 0.8) * 0.06;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "stress-check") {
          const ok = gg.t >= 0.62 && gg.t <= 0.84;
          repaint(stressDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)} / 10`, {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-anchor" && tr) {
          const ok = tr.v >= 0.4 && tr.v <= 0.66;
          repaint(anchorGauge.userData.screen, signFace(ok ? "HELD" : tr.v < 0.4 ? "SHRINKING" : "OVER", {
            bg: "#0c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.5,
          }));
        }
        if (session?.step?.id === "nap-timer" && session.holding) {
          const left = Math.max(0, 20 - (session.holdFor / (session.step.seconds || 8)) * 20);
          repaint(napTimer.userData.screen, signFace(`${String(Math.floor(left)).padStart(2, "0")}:00`, {
            bg: "#0c1a24", accent: WSS_CSS, fg: "#cfeaf7", scale: 0.55,
          }));
        }
      },
    };
  },
};
