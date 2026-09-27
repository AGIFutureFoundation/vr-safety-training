import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { cabinInterior } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Door Evacuation Drill VR — Airline Cabin and Flight Crew,
// station six. The one job at this door once the command to evacuate is
// given: look before opening, confirm the slide before anyone is sent onto
// it, shout the same short commands over and over, and physically block the
// door frame so the flow through it never stops for a dropped bag or a
// frozen passenger. Every count, every command word and every timing this
// platform is not certain of runs "per the checklist" — nothing here states
// a number the airline's own evacuation procedure has not already set.

const CADR_ACCENT = 0xe0525f;

export const SIM_CA_DOOR_EVACUATION_DRILL = {
  id: "ca-door-evacuation-drill",
  index: "ca-6",
  domain: "Aviation",
  trade: "Flight attendant — AFA-CWA cabin crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA cabin-safety training; the airline's own emergency evacuation checklist and command set under 14 CFR 121; OSHA 29 CFR 1910.151 medical services and first aid for an evacuation injury this drill is built to prevent",
  name: "Door Evacuation Drill",
  title: simTitle("Door Evacuation Drill"),
  tagline: "Look before opening, confirm the slide before anyone goes onto it, the same short commands shouted over and over, and the door frame physically blocked so the flow through it never stops for a dropped bag or a frozen passenger",
  accent: CADR_ACCENT,
  accentCss: "#e0525f",
  parSeconds: 330,
  footprint: 2.7,
  badge: { id: "door-cleared", name: "Door Cleared", note: "Conditions assessed before opening, the slide confirmed, the commands never stopped, and the door frame held clear through the entire flow" },

  supportLine: "your AFA-CWA local's member assistance resources, or the airline's own employee assistance line — a full evacuation drill run for real is its own kind of intense, even in training",

  game: system({
    name: "Door Cleared",
    currency: "EVAC",
    ranks: ["New Flight Attendant", "Line Qualified", "Lead Flight Attendant", "Purser", "Door Cleared Certified"],
    badges: [
      { id: "assessed-first", name: "Assessed First", note: "Looked outside and confirmed the slide before opening the door to the flow", test: AWARD.stepClean("assess-outside") },
      { id: "flow-held", name: "Flow Held", note: "Blocked the door frame and held the flow moving without a break", test: AWARD.unbroken },
      { id: "bags-left-behind", name: "Bags Left Behind", note: "Every carry-on caught and left behind before the slide", test: AWARD.stepClean("redirect-bag") },
    ],
    challenges: [
      { id: "clean-drill", name: "Clean Drill", note: "No corrections anywhere in the drill", test: AWARD.clean },
      { id: "fast-drill", name: "Fast Drill", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "evac-streak", name: "Command Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "no-assessment-hazard": "That door is already being pulled open with nobody having looked through the window first. Opening onto conditions nobody actually checked — fire, debris, water — is exactly the mistake this one look before opening exists to prevent.",
    "slide-unconfirmed-hazard": "That slide has not actually been confirmed inflated and clear. Sending anyone onto a slide nobody has looked at first risks a fall onto a slide that isn't actually ready to take them.",
    "carry-on-bag-hazard": "That passenger is bringing a bag to the door. A bag on a slide punctures it, snags on the way down, or becomes exactly what the next person coming down trips over — it gets left behind before this passenger ever reaches the door, not sorted out once it's already causing a jam.",
    "blocked-doorway-hazard": "That cart is parked in the doorway itself. Nothing narrows the one path everyone in this section is funneling toward — the doorway stays completely clear the entire time this flow is running.",
  },

  lateNotes: {
    "deploy-slide": "Not yet — conditions outside get assessed first. A slide deployed before that check is a step taken out of order.",
    "block-doorway-position": "Hold that. The slide has to actually be confirmed before this crew takes up the blocking position at the frame.",
  },

  steps: [
    {
      id: "pull-evac-checklist", kind: "select", target: "evacuation-checklist-board",
      title: "Pull the evacuation checklist",
      cue: "Open the airline's own evacuation checklist the instant the command is given.",
      why: "This checklist is what turns the command to evacuate into an actual sequence this crew already knows cold — running from it, rather than from memory under pressure, is what keeps every step in the order the airline actually trained for.",
    },
    {
      id: "assess-outside", kind: "select", target: "door-window",
      title: "Look outside before opening",
      cue: "Look through the door's window and confirm conditions outside before opening it.",
      why: "A door opened onto fire, debris or water outside turns a survivable exit into a new hazard — this look is the one thing standing between this crew and finding that out the hard way, and it happens before the handle ever moves.",
    },
    {
      id: "open-and-deploy", kind: "sequence", anyOrder: false,
      targets: ["open-door", "deploy-slide"],
      itemNames: { "open-door": "open the door", "deploy-slide": "deploy the slide" },
      title: "Open the door, then deploy the slide",
      cue: "Open the door fully, then deploy the evacuation slide.",
      why: "The slide only deploys once the door is actually all the way open — trying to move to the slide before that is a step this checklist has no use for, because the mechanism needs the door's own travel to work at all.",
      outOfOrderNote: "Door first, then the slide — the slide's own deployment depends on the door already being fully open.",
    },
    {
      id: "confirm-slide", kind: "select", target: "slide-status",
      title: "Confirm the slide is ready",
      cue: "Confirm the slide is fully inflated and clear before sending anyone onto it.",
      why: "A slide that looks deployed and a slide that's actually fully inflated and clear of debris are two different facts — confirming the second one is what this crew is actually staking a passenger's landing on, not the first one alone.",
    },
    {
      id: "shout-commands", kind: "sequence",
      targets: ["command-come", "command-leave-everything", "command-jump-and-slide"],
      itemNames: { "command-come": "\"come this way!\"", "command-leave-everything": "\"leave everything!\"", "command-jump-and-slide": "\"jump and slide!\"" },
      title: "Shout the commands, in order, over and over",
      cue: "Call out the same three commands, loud and repeated, the whole time this door is running.",
      why: "Short, repeated, identical commands are what actually cut through a loud, frightened cabin — a passenger who hears the same three words over and over knows exactly what to do without having to think, which is the entire point under these conditions.",
      outOfOrderNote: "Come this way, then leave everything, then jump and slide — that order gets someone moving, unburdened and off the sill in the sequence that actually works.",
    },
    {
      id: "scan-for-noncompliance", kind: "find", noHint: true,
      targets: ["carry-on-passenger", "blocked-doorway"],
      itemNames: { "carry-on-passenger": "a passenger bringing a bag to the door", "blocked-doorway": "a cart blocking the doorway" },
      itemNotes: {
        "carry-on-passenger": "This gets redirected the instant it's spotted — a bag reaching the slide is a hazard for every single person coming down after it.",
        "blocked-doorway": "This gets cleared immediately — a doorway this narrow slows down the one flow this entire drill exists to keep moving.",
      },
      title: "Scan the flow for what's going wrong",
      cue: "Two things about this flow aren't right. Find them while people are still moving through the door.",
      why: "A flow that looks fine at a glance can still be carrying a bag toward the slide or narrowing around an obstacle nobody's caught yet — this scan is what catches either one while there's still time to fix it before it actually reaches the door.",
    },
    {
      id: "redirect-bag", kind: "select", target: "carry-on-passenger",
      title: "Redirect the passenger with the bag",
      cue: "Tell the passenger to leave the bag behind, firmly, and keep them moving toward the door.",
      why: "This instruction is not a request — a bag heading for the slide gets left behind on this crew's word, immediately, because the next several people in line are the ones who actually pay for it if it isn't.",
    },
    {
      id: "guide-frozen-passenger", kind: "drag", target: "frozen-passenger",
      title: "Guide the passenger who's frozen at the sill",
      cue: "Physically guide the passenger who's stopped moving at the door onto the slide.",
      why: "Someone frozen at the sill is not going to talk themselves through it while the line backs up behind them — a firm, direct guide onto the slide is what actually gets them moving again without holding up everyone still coming through this door.",
      drag: { to: "slide-entry-spot", radius: 0.45, missNote: "Still frozen at the sill. Every second this passenger stays there is a second the whole line behind them is stopped too." },
    },
    {
      id: "block-doorway", kind: "hold", target: "block-doorway-position", seconds: 6,
      title: "Hold the door frame clear",
      cue: "Stand the door frame and hold position, keeping the flow moving through it the whole time.",
      why: "Standing the frame is what keeps this door doing exactly one job — moving people through it as fast as it safely can — instead of becoming a bottleneck the moment this crew member's attention goes somewhere else.",
      holdBreakNote: "Left the frame before the flow was actually done. A door with nobody holding it clear is a door that slows down or jams the instant anything goes wrong at it.",
    },
    {
      id: "keep-flow-moving", kind: "track", target: "flow-rate-gauge", seconds: 6,
      title: "Keep the flow rate up",
      cue: "Watch the flow-rate readout and keep people moving through the door at a steady pace.",
      track: { start: 0.3, green: [0.45, 0.7], rise: 0.35, fall: 0.32, drift: 0.14, label: "FLOW RATE", readout: (v) => (v < 0.45 ? "too slow" : v > 0.7 ? "crowding" : "steady") },
      holdBreakNote: "The flow dropped out of a safe pace. Too slow leaves people still in the cabin; crowding at the door creates its own fall risk on the sill.",
      why: "A flow that's too slow leaves people still in a cabin this crew is trying to empty, and a flow that's crowding the sill creates its own fall risk — a steady pace in between is what actually gets the most people out safely in the time available.",
    },
    {
      id: "count-time-elapsed", kind: "gauge", target: "evac-timer-gauge",
      title: "Read the elapsed time",
      cue: "Check the evacuation timer against the airline's own benchmark for this door.",
      gauge: { label: "ELAPSED", speed: 0.55, green: [0.3, 0.75], readout: (t) => (t > 0.75 ? "running long" : "on pace"), missNote: "Read the timer after the drill was already running long. Catching that early is the only version of this reading that's actually useful." },
      why: "The airline's own benchmark for this door is what this timer is read against, and catching a slow pace early is what actually gives this crew a chance to do something about it, rather than finding out only once the drill is already over.",
    },
    {
      id: "final-sweep", kind: "select", target: "cabin-final-check",
      title: "Sweep the cabin one last time",
      cue: "Do a final visual sweep of the cabin for anyone left before this crew member exits.",
      why: "This crew member is the last line between an evacuation that's actually complete and one that quietly left somebody behind — the sweep is what turns \"I think everyone's out\" into an actual confirmed fact.",
    },
    {
      id: "crew-exits-last", kind: "select", target: "slide-status",
      title: "Exit last, down the slide",
      cue: "Confirm the cabin is empty, then exit down the slide yourself, last.",
      why: "Crew goes down the slide only after every passenger this door was responsible for is already off it — leaving before that confirmed fact is exactly the gap between \"probably done\" and actually done that this whole drill is built to close.",
    },
  ],

  interrupts: [
    {
      id: "passenger-freezes-again",
      kind: "A second passenger freezes at the sill",
      after: "block-doorway", delay: 3, seconds: 12,
      alert: "Another passenger stops dead at the sill, blocking the doorway behind them.",
      cue: "That gets a firm physical guide onto the slide, right now.",
      target: "frozen-passenger",
      why: "A second person frozen at the sill stops the whole flow just as completely as the first one did, and the same firm, direct guide that worked the first time is exactly what this crew already knows to do again, immediately.",
      missNote: "The second frozen passenger sat at the sill while the flow backed up behind them. That's the door stopped again, the same way it already almost did once.",
      wrongNote: "Guide them onto the slide, the same as before — a second frozen passenger doesn't get a different answer.",
    },
    {
      id: "conditions-change-outside",
      kind: "Conditions outside this door change",
      after: "keep-flow-moving", delay: 3, seconds: 12,
      alert: "Smoke becomes visible outside the window at this exact door while the flow is still running.",
      cue: "That door gets redirected to another exit immediately.",
      target: "redirect-other-exit",
      why: "Conditions outside a door are not a one-time check made before it opened — smoke appearing at this exit mid-evacuation means this crew redirects the flow to another exit right now, because sending anyone else out into that is exactly the outcome the first assessment was meant to prevent.",
      missNote: "People kept coming through this door after smoke was visible outside it. The whole reason conditions get watched, not just checked once, is exactly this kind of change.",
      wrongNote: "Redirect to another exit now — smoke outside this door changes the answer this crew already gave once.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.7, CADR_ACCENT);

    const cabin = cabinInterior(g, 0, 0, 0, { livery: { colour: 0x7a2a2a } });
    const { door, galley } = cabin.userData.parts;
    holoTag(cabin, "cabin section", 0, 2.5, 0.5, { css: "#e0525f", w: 0.4 });

    const checklistBoard = decal(g, 0.3, 0.4, -1.3, 1.3, -1.2,
      paperFace("EVACUATION DRILL", ["Assess · Open · Deploy", "Commands · Block · Sweep"], { bg: "#fbf3df", band: "#7a1f1f" }), { px: 220 });
    reg(hits, checklistBoard, "evacuation-checklist-board");

    reg(hits, door, "open-door");
    const doorWindow = box(door, 0.03, 0.3, 0.3, 0.03, 1.3, 0.1, 0x161d24, { rough: 0.2, metal: 0.3 });
    holoTag(doorWindow, "door window", 0, 0.2, 0, { css: "#e0525f", w: 0.34 });
    reg(hits, doorWindow, "door-window");
    reg(hits, doorWindow, "no-assessment-hazard");

    const slide = box(g, 0.5, 0.14, 1.6, 1.6, 0.07, 2.4, 0xf2c14b, { rough: 0.7 });
    slide.rotation.x = -0.3;
    holoTag(slide, "evacuation slide", 0, 0.16, 0, { css: "#e0525f", w: 0.4 });
    reg(hits, slide, "deploy-slide");
    const slideStatus = instrument(g, 1.6, 1.1, 1.9, { idle: "INFLATE?", color: CADR_ACCENT, w: 0.16, d: 0.2, ry: 0.6 });
    reg(hits, slideStatus, "slide-status");
    reg(hits, slideStatus, "slide-unconfirmed-hazard");
    const slideEntrySpot = box(g, 0.5, 0.02, 0.5, 1.6, 0.001, 2.0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["slide-entry-spot"] = slideEntrySpot;

    const commandPanel = holoPanel(g, 0.5, 0.36, -0.9, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(26,6,8,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e0525f"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#ffe1e4";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("COME · LEAVE IT · JUMP", w * 0.06, h * 0.4);
    }, { accent: CADR_ACCENT, ry: 0.5 });
    const cmd1 = box(commandPanel, 0.06, 0.06, 0.02, -0.18, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cmd1, "command-come");
    const cmd2 = box(commandPanel, 0.06, 0.06, 0.02, 0, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cmd2, "command-leave-everything");
    const cmd3 = box(commandPanel, 0.06, 0.06, 0.02, 0.18, -0.1, 0.01, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cmd3, "command-jump-and-slide");

    const carryOnPassenger = standingFigure(g, 0.6, 1.35, { ry: -1.6, cloth: 0x6b4a3f, skin: 0xc99878 });
    const bagProp = box(carryOnPassenger, 0.18, 0.14, 0.1, 0, 0.75, 0.14, 0x5a4a2a, { rough: 0.7 });
    holoTag(bagProp, "bag for the slide", 0, 0.1, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, carryOnPassenger, "carry-on-passenger");
    reg(hits, bagProp, "carry-on-bag-hazard");

    const blockingCart = box(g, 0.42, 0.7, 0.4, -1.3, 0.35, 1.3, 0x8b929a, { rough: 0.5, metal: 0.3 });
    holoTag(blockingCart, "blocking the doorway", 0, 0.78, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, blockingCart, "blocked-doorway");
    reg(hits, blockingCart, "blocked-doorway-hazard");

    const frozenPassenger = standingFigure(g, 0.5, 1.6, { ry: -1.9, cloth: 0x3d4b55, skin: 0xd9a985 });
    reg(hits, frozenPassenger, "frozen-passenger");

    const blockSpot = box(g, 0.4, 0.02, 0.4, 1.2, 0.001, 1.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["block-doorway-position"] = blockSpot;
    const secondFreezeMarker = ball(g, 0.02, 1.15, 1.5, 1.65, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });

    const flowGauge = instrument(g, -1.4, 1.2, 0.9, { idle: "-- /min", color: CADR_ACCENT, w: 0.16, d: 0.2, ry: 1.2 });
    holoTag(flowGauge, "flow rate", 0, 0.2, 0, { css: "#e0525f", w: 0.32 });
    reg(hits, flowGauge, "flow-rate-gauge");

    const evacTimer = instrument(g, -1.4, 0.9, 0.5, { idle: "00:00", color: CADR_ACCENT, w: 0.13, d: 0.17, ry: 1.2 });
    reg(hits, evacTimer, "evac-timer-gauge");

    const finalCheckSpot = box(g, 0.5, 0.02, 3.0, 0, 0.001, -0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["cabin-final-check"] = finalCheckSpot;

    const otherExitPanel = instrument(galley, -0.5, 1.3, -0.2, { idle: "REDIRECT?", color: CADR_ACCENT, w: 0.16, d: 0.2, ry: 0 });
    holoTag(otherExitPanel, "redirect to another exit", 0, 0.2, 0, { css: "#e0525f", w: 0.4 });
    reg(hits, otherExitPanel, "redirect-other-exit");
    const smokeLamp = ball(g, 0.02, 1.6, 1.5, 0.15, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });

    const attendant = standingFigure(g, -0.7, 1.85, { ry: 1.6, cloth: 0x1c3a5c, skin: 0xb98a63 });
    void attendant;

    return {
      hits,
      footprint: 2.7,
      spawnLook: new THREE.Vector3(0.4, 1.2, 0.6),

      onStepComplete(step) {
        if (step.id === "assess-outside") doorWindow.material = mat(0x59c97b, { rough: 0.2, metal: 0.3 });
        if (step.id === "confirm-slide") repaint(slideStatus.userData.screen, signFace("READY", { bg: "#0d1c24", accent: "#59c97b", fg: "#ffe1e4", scale: 0.5 }));
        if (step.id === "scan-for-noncompliance") blockingCart.material = mat(0x59c97b, { rough: 0.5, metal: 0.3 });
        if (step.id === "redirect-bag") bagProp.visible = false;
        if (step.id === "guide-frozen-passenger") { frozenPassenger.parent.remove(frozenPassenger); g.add(frozenPassenger); frozenPassenger.position.set(1.6, 0, 2.0); }
      },

      onInterrupt(it) {
        if (it.id === "passenger-freezes-again") secondFreezeMarker.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, seg: 8, seg2: 6 });
        if (it.id === "conditions-change-outside") {
          smokeLamp.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.8, seg: 8, seg2: 6 });
          repaint(otherExitPanel.userData.screen, signFace("SMOKE!", { bg: "#2a1610", accent: "#f0645b", fg: "#ffd9d0", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "passenger-freezes-again") secondFreezeMarker.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });
        if (it.id === "conditions-change-outside") {
          smokeLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.5, seg: 8, seg2: 6 });
          repaint(otherExitPanel.userData.screen, signFace("REDIRECT?", { bg: "#0d1c24", accent: "#e0525f", fg: "#ffe1e4", scale: 0.42 }));
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge, tk = session?.track;
        if (gg && !gg.committed && session.step?.id === "count-time-elapsed") {
          repaint(evacTimer.userData.screen, signFace(gg.t > 0.75 ? "LONG" : "ON PACE", {
            bg: "#0d1c24", accent: gg.t <= 0.75 ? "#59c97b" : "#f0645b", fg: "#ffe1e4", scale: 0.4,
          }));
        }
        if (tk && session.step?.id === "keep-flow-moving") {
          repaint(flowGauge.userData.screen, signFace(tk.readout ?? "--", {
            bg: "#0d1c24", accent: tk.inBand ? "#59c97b" : "#f0645b", fg: "#ffe1e4", scale: 0.45,
          }));
        }
        void t;
      },
    };
  },
};
