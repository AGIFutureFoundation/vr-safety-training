import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, seatedFigure, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Union Hall & Dispatch VR — Job Readiness Edition, apprenticeship
// navigation block.
//
// A generic building-trades hall on a dispatch morning: the out-of-work book
// signed in your own name, the cards that prove you are in good standing, the
// referral rules on the wall read through, a dispatch slip taken and read for
// what it actually says, your card moved on the board, the morning planned
// back from the report time, the tools on the list packed, and a week of
// staying reachable. Every local runs its own referral rules and every
// programme dispatches apprentices the way its apprenticeship standard says;
// the slip, the board and the rules here are an example. No real hall, local
// or contractor is depicted.

const UHD_ACCENT = 0x6fa8dc;
const UHD_CSS = "#6fa8dc";

export const SIM_UNION_HALL_AND_DISPATCH = {
  id: "union-hall-and-dispatch",
  index: "259",
  domain: "Apprenticeship navigation",
  trade: "Construction apprentice — the union hall and the dispatch",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "clear",
  certification: "The local's own referral rules as posted in the hall, and the apprenticeship standard the apprentice is indentured under — registered with the U.S. Department of Labor or a State Apprenticeship Agency — which sets the work processes an apprentice trains in, the supervision by journey-level workers and the ratio; the building-trades training funds that run such programmes, LIUNA and IUOE among them; OSHA 10 through the OSHA Outreach Training Program, which many contractors ask to see on the first morning; IRS guidance that all income, including cash, is reportable; SAMHSA's National Helpline and 988 for the stress of the weeks between jobs",
  name: "Union Hall & Dispatch",
  title: simTitle("Union Hall & Dispatch"),
  tagline: "Sign the book in your own name, bring the cards, read the rules, take the slip and read it, plan the morning back from the report time, and stay reachable — while a dispatch you should not take and a cash job both come calling",
  accent: UHD_ACCENT,
  accentCss: UHD_CSS,
  parSeconds: 290,
  footprint: 2.2,
  supportLine: "your steward or your training coordinator if the wait between jobs is wearing on you, 988 if it has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using is part of how you are getting through it",
  badge: { id: "dispatched-right", name: "Dispatched Right", note: "On the book in your own name, dispatched to work inside your apprenticeship, and there on time with the right tools" },

  game: system({
    name: "Referral Book",
    currency: "SLIP",
    ranks: ["Walk-In", "On The Book", "Dispatched", "Reported", "Dispatch Certified"],
    badges: [
      { id: "read-the-slip", name: "Read The Slip", note: "The cards and the dispatch slip both read clean", test: AWARD.all(AWARD.stepClean("bring-cards"), AWARD.stepClean("read-slip")) },
      { id: "straight-book", name: "Straight Book", note: "No unsafe action anywhere in the hall", test: AWARD.safe },
      { id: "on-time", name: "On Time", note: "The leave time committed near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-dispatch", name: "Clean Dispatch", note: "No corrections anywhere", test: AWARD.clean },
      { id: "reachable-all-week", name: "Reachable All Week", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "first-out-the-door", name: "First Out The Door", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "uhd-sign-for-buddy": "You went to sign a friend's name on the out-of-work book for him. The book is the order people are referred in, and a name on it that its owner did not sign puts him ahead of everyone who came in themselves. Halls treat it as falsifying the list, and it can cost both of you your place — his, and yours for signing it.",
    "uhd-truck-bed": "You were about to ride to the jobsite in the back of a pickup. A truck bed has no seat, no belt and nothing to stop you leaving it in a sudden stop or a turn, and people are killed that way every year. Getting there late is fixable; getting there in the bed is the unsafe shortcut the whole morning is supposed to avoid.",
    "uhd-blank-form": "Someone handed you a blank form to sign 'so the contractor can fill it in'. A signature on a blank page can end up under a release, a quit or a timecard you have never read. Nothing gets signed until it has been filled in and read — and a form from a contractor that the hall has not seen is worth showing the business agent first.",
    "uhd-ssn-text": "That text says to reply with your Social Security number to 'stay on the out-of-work list'. Your place on the book is kept at the hall, by the rules on the wall — not by text. A Social Security number sent to an unknown number is how identity theft starts, and people waiting for a dispatch are exactly who such texts target.",
  },

  lateNotes: {
    "uhd-name-card": "Not yet. Your card moves to the dispatched column once you have the slip in hand and have read it — not before.",
    "uhd-dispatch-log": "The dispatch log is closed out at the end, with the real slip details and the date you reported.",
  },

  steps: [
    {
      id: "sign-books", kind: "select", target: "uhd-out-of-work-book",
      title: "Sign the out-of-work book in your own name",
      cue: "Sign the book at the stand with your name, your card number and the date and time — yourself.",
      why: "Referral from the hall generally works from the order people signed in and the rules the local posts, and your own signature on the book is what puts you on it. For apprentices, many programmes dispatch through the training coordinator instead, as their apprenticeship standard sets out; either way, signing yourself, accurately, is the start. A place on the book is the one thing in the hall nobody can hold for you.",
    },
    {
      id: "bring-cards", kind: "find", noHint: true,
      targets: ["uhd-dues-receipt", "uhd-apprentice-card", "uhd-osha10-card"],
      itemNames: { "uhd-dues-receipt": "the current dues receipt", "uhd-apprentice-card": "your apprentice card", "uhd-osha10-card": "your OSHA 10 card" },
      itemNotes: {
        "uhd-dues-receipt": "Dues paid up is what keeps you in good standing, and most halls check it before a referral. The receipt settles any question on the spot.",
        "uhd-apprentice-card": "The apprentice card shows which programme and which period you are in — which decides the jobs you can be referred to and your rate on them.",
        "uhd-osha10-card": "Many contractors ask to see OSHA 10 on the first morning. It is an awareness card from the OSHA Outreach Training Program, and it is worth having in your wallet, not at home.",
      },
      title: "Find the three cards you need on the table",
      cue: "From your wallet on the bench, find the dues receipt, the apprentice card and the OSHA 10 card.",
      why: "A dispatch can be lost at the window over a card left at home: a dues receipt that shows good standing, an apprentice card that shows your programme and period, and the OSHA 10 card many contractors ask for. Each answers a question somebody will ask before you are referred or let on site, and carrying all three every morning is what keeps the answer from being 'tomorrow'.",
    },
    {
      id: "read-rules", kind: "hold", target: "uhd-rules-board", seconds: 6,
      title: "Read the referral rules on the wall",
      cue: "Hold at the rules board and read how the book works: the order, what happens if you turn down a call, and how you stay on the list.",
      why: "Every local posts its referral rules, and they decide things an apprentice needs to know before the first call: how the order works, how many calls you can turn down, how often you have to re-sign, and what gets you dropped. Reading them once, fully, is how people avoid losing a place over a rule they never knew — and they are the rules the business agent will point to if there is ever a dispute.",
      holdBreakNote: "You left the board before the part about re-signing. That rule is the one that quietly drops people off the book — read it through.",
    },
    {
      id: "take-slip", kind: "select", target: "uhd-dispatch-window",
      title: "Take the dispatch slip at the window",
      cue: "When your name is called, go to the window and take the dispatch slip in person.",
      why: "A dispatch slip is the hall's written referral: which contractor, where, when, and what to bring. Taking it at the window in person means you can ask about anything unclear while the dispatcher is in front of you, and it gives you the written record of the referral — which matters if the job turns out to be different from what the slip says.",
    },
    {
      id: "read-slip", kind: "find", noHint: true,
      targets: ["uhd-slip-contractor", "uhd-slip-report", "uhd-slip-location", "uhd-slip-bring"],
      itemNames: { "uhd-slip-contractor": "the contractor", "uhd-slip-report": "the report time", "uhd-slip-location": "the jobsite address", "uhd-slip-bring": "what to bring" },
      itemNotes: {
        "uhd-slip-contractor": "The contractor's name, so you know who you are reporting to — and so you can check it is a contractor the hall refers to.",
        "uhd-slip-report": "The report time is when the contractor expects you ready to work, not when you arrive at the gate.",
        "uhd-slip-location": "The jobsite address, and the gate to report to if the slip gives one. Big sites have several.",
        "uhd-slip-bring": "What to bring — tools, PPE, documents. Arriving without them is the fastest way to be sent home on day one.",
      },
      title: "Read the slip for the four things that matter",
      cue: "On the example slip, find the contractor, the report time, the address and what to bring.",
      why: "A slip read in the car park the next morning is a slip read too late. Four things on it decide whether the first day starts well: who you report to, when you are expected ready to work, exactly where, and what to bring. Reading them at the window, while the dispatcher can still answer a question, is what turns a referral into a first day that actually happens.",
    },
    {
      id: "move-card", kind: "drag", target: "uhd-name-card",
      title: "Move your card to the dispatched column",
      cue: "Carry your name card from 'out of work' to 'dispatched' on the board.",
      why: "The board shows who is available and who is out on a job, and keeping your own card accurate keeps the book honest for everyone waiting behind you. It is also your record of when you were dispatched: if the job ends early, the rules on the wall say how you get back on, and the dispatch date is part of that answer.",
      drag: { to: "uhd-dispatched-slot", radius: 0.4, missNote: "Not in the dispatched column. A card left in the wrong column tells the dispatcher you are still available when you are not." },
    },
    {
      id: "leave-time", kind: "gauge", target: "uhd-commute-gauge",
      title: "Plan the morning back from the report time",
      cue: "Commit a leave time that gets you to the gate early enough to park, walk in and be ready at the report time.",
      gauge: {
        label: "LEAVE HOME AT (EXAMPLE)", speed: 0.6, green: [0.3, 0.46],
        readout: (t) => { const m = Math.round(t * 120); const h = 4 + Math.floor((m + 30) / 60); const mm = String((m + 30) % 60).padStart(2, "0"); return `${h}:${mm} am — example`; },
        missNote: "That leave time will not work. Too late and you are at the gate at the report time rather than ready at it; the first morning, traffic and a site you have never found both take longer than you think.",
      },
      why: "The report time on a slip is when the contractor expects you ready to work, which means parked, walked in, signed in and in your PPE — not pulling into the lot. Planning back from it, with a margin for a site you have never found, is the habit that makes a first impression. The times on the gauge are an example; yours come from the slip and the map.",
    },
    {
      id: "pack-tools", kind: "sequence", anyOrder: true,
      targets: ["uhd-tool-tape", "uhd-tool-knife", "uhd-tool-hammer", "uhd-tool-ppe"],
      itemNames: { "uhd-tool-tape": "the tape measure", "uhd-tool-knife": "the utility knife", "uhd-tool-hammer": "the hammer", "uhd-tool-ppe": "hard hat, glasses, gloves and boots" },
      itemNotes: {
        "uhd-tool-tape": "A tape measure is on nearly every trade's list. Check the programme's own list for the length it asks for.",
        "uhd-tool-knife": "A utility knife with spare blades — and a sheath, so it is not loose in the bag.",
        "uhd-tool-hammer": "Whatever hammer your programme's list names. Buy what is on the list, not the most expensive one in the store.",
        "uhd-tool-ppe": "Your hard hat, safety glasses, gloves and work boots. Sites will not let you through the gate without them.",
      },
      title: "Pack the tools on the list",
      cue: "Pack what the slip and the programme's tool list say — order does not matter.",
      why: "Apprenticeship programmes publish the hand tools an apprentice is expected to bring, and the slip adds anything the job needs. Packing exactly that — and the PPE the site will check at the gate — is what gets you through the first morning. Buying what is on the list and nothing more until a journey-level worker tells you what you actually need saves money you do not have yet.",
    },
    {
      id: "alarm", kind: "turn", target: "uhd-alarm-dial",
      title: "Set the alarm for the leave time",
      cue: "Turn the alarm dial to wake you with time to eat, dress and leave at the time you planned.",
      turn: { turns: 1.0, axis: "y", label: "ALARM" },
      why: "Construction days start early, and the first one is the one that counts most. An alarm set back from the leave time — with time to eat, because a long morning on an empty stomach is a safety problem in itself — is the simplest step in the whole dispatch and the one most often missed the night before a new job.",
    },
    {
      id: "stay-available", kind: "track", target: "uhd-availability-track", seconds: 7,
      title: "Stay reachable through the week",
      cue: "Hold the availability track in the band: phone on, messages checked, calls returned inside the window the rules give.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "REACHABLE",
        readout: (v) => (v < 0.4 ? "missing calls" : v > 0.62 ? "chasing every rumour" : "reachable"),
      },
      holdBreakNote: "You dropped out of reach. A missed call can mean a missed dispatch under the rules — back in band, phone on and checked.",
      why: "Between jobs, the rules on the wall usually give a window to answer a call, and a missed call can move you down the book. Staying reachable — phone charged, messages checked, calls returned inside the window — is the job during the wait. It also means ignoring the rumours and side offers that come with it, and taking questions to the hall rather than acting on them.",
    },
    {
      id: "steward-checkin", kind: "select", target: "uhd-steward",
      title: "Check in with the steward",
      cue: "Tell the steward about the call you turned down and the text you got, and how the wait is going.",
      why: "The steward is who tells you whether a dispatch you turned down counts against you, and who makes sure the coordinator heard why. The check-in is also the crew check-in of the hall: the weeks between jobs are hard on money and on nerves, and saying so to somebody who has been through it is part of staying in the trade. If it has become more than that, 988 or SAMHSA's National Helpline is the next call.",
    },
    {
      id: "dispatch-log", kind: "select", target: "uhd-dispatch-log",
      title: "Close out your dispatch log",
      cue: "Log the date you signed, the slip's details, the call you declined and why, and the date you reported.",
      why: "Your own record of the book — when you signed, what you were offered, what you turned down and why, when you reported — is what answers any question about your place later. Apprentices also need it for their own logbook of hours and work processes, and it is the first thing the business agent will ask for if something about a dispatch needs to be sorted out.",
    },
  ],

  interrupts: [
    {
      id: "uhd-out-of-scope",
      kind: "Dispatch outside your apprenticeship",
      after: "read-rules", delay: 3, seconds: 12,
      alert: "The dispatcher calls out to you: a small contractor wants 'an apprentice to run the job alone this week' doing electrical tie-ins — not your trade, and no journey-level worker on site.",
      cue: "Do not take it on the spot. Ask the person who runs your apprenticeship.",
      target: "uhd-coordinator-phone",
      why: "The apprenticeship standard you are indentured under sets the work processes you train in and requires an apprentice to work under journey-level supervision, within a ratio. A job alone, in another trade's work, is outside all of it — for your safety, your hours and your standing. Calling the training coordinator puts the question with the person responsible for your apprenticeship, before anyone signs anything.",
      missNote: "The dispatcher took your silence as a yes, and in the version where you went, you spent a week alone doing electrical work you were never trained for, with nobody to check it — and none of the hours counted toward your own apprenticeship.",
      wrongNote: "Not that. The answer is your training coordinator — the apprenticeship standard decides what you can be sent to, not the dispatcher's short list.",
    },
    {
      id: "uhd-cash-offer",
      kind: "Cash job offer",
      after: "stay-available", delay: 3, seconds: 12,
      alert: "A text from someone you met on a job: 'Cash work Saturday, no paperwork, don't tell the hall. $200 for the day.'",
      cue: "Do not reply yes. Ask the business agent what it means for you.",
      target: "uhd-agent-window",
      why: "Work with no paperwork has no workers' compensation if you are hurt, no hours on your record and no withholding — and the IRS is plain that cash income is still reportable. It can also break your local's rules and put your standing at risk. The business agent is the person who can tell you exactly where you stand, which is why the question goes to the window rather than into a reply.",
      missNote: "The text sat unanswered while you kept checking your phone, and in the version where you said yes, you spent Saturday on a site with no insurance and no record, doing work that could cost you your place on the book if anyone found out.",
      wrongNote: "Not that. The answer is the business agent's window — ask before you say anything, because the cost of a cash job lands on you, not the person offering it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, UHD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#6a7078", base2: "#626870", seam: "rgba(0,0,0,0.2)",
    }), { repeat: 5, px: 256 });
    const floor = slab(g, 5.8, 0.008, 5.8, 0, 0.002, 0, 0xffffff, { radius: 0.05, rough: 0.88, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.88, metal: 0.04, color: 0x9aa2ac });

    // --------------------------------------------- the back wall and windows
    box(g, 5.6, 2.7, 0.1, 0, 1.35, -2.35, 0xcdd2d6, { rough: 0.9 });
    box(g, 5.6, 0.1, 0.14, 0, 0.05, -2.28, 0x3a4048, { rough: 0.7 });
    decal(g, 2.4, 0.18, 0, 2.4, -2.29, signFace("BUILDING TRADES HALL — DISPATCH", { bg: "#1f2a36", accent: UHD_CSS, scale: 0.5 }), { px: 512 });

    const dispatchWin = group(g, -0.6, 0, -2.25);
    box(dispatchWin, 1.0, 0.6, 0.02, 0, 1.45, 0.02, 0x7f9aa8, { rough: 0.2, opacity: 0.55, transparent: true });
    slab(dispatchWin, 1.1, 0.05, 0.35, 0, 1.08, 0.18, 0x3a4048, { radius: 0.01, rough: 0.5 });
    decal(dispatchWin, 0.7, 0.12, 0, 1.86, 0.04, signFace("DISPATCH", { bg: "#1f2a36", accent: UHD_CSS, scale: 0.6 }), { px: 256 });
    const dispatchLamp = box(dispatchWin, 0.08, 0.08, 0.04, 0.45, 1.86, 0.05, 0x3a4048, { rough: 0.4 });
    ownMaterial(dispatchLamp);
    reg(hits, box(dispatchWin, 1.0, 0.6, 0.12, 0, 1.4, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "uhd-dispatch-window");
    holoTag(dispatchWin, "dispatch window", 0, 2.05, 0.05, { css: UHD_CSS, w: 0.34 });

    const agentWin = group(g, 1.0, 0, -2.25);
    box(agentWin, 0.8, 0.55, 0.02, 0, 1.45, 0.02, 0x7f9aa8, { rough: 0.2, opacity: 0.55, transparent: true });
    slab(agentWin, 0.9, 0.05, 0.3, 0, 1.1, 0.15, 0x3a4048, { radius: 0.01, rough: 0.5 });
    decal(agentWin, 0.7, 0.12, 0, 1.86, 0.04, signFace("BUSINESS AGENT", { bg: "#1f2a36", accent: UHD_CSS, scale: 0.5 }), { px: 256 });
    const agentLamp = box(agentWin, 0.08, 0.08, 0.04, 0.38, 1.86, 0.05, 0x3a4048, { rough: 0.4 });
    ownMaterial(agentLamp);
    reg(hits, box(agentWin, 0.8, 0.55, 0.12, 0, 1.4, 0.1, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "uhd-agent-window");

    // The referral rules board.
    const rules = holoPanel(g, 0.8, 0.9, -1.85, 1.55, -2.25, (cx, w, h) => {
      cx.fillStyle = "rgba(10,18,28,0.93)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = UHD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#d8e8f8"; cx.font = `600 ${Math.round(h * 0.075)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("REFERRAL RULES — EXAMPLE", w * 0.05, h * 0.08);
      cx.fillStyle = "#f2f8ff"; cx.font = `${Math.round(h * 0.055)}px Arial, sans-serif`;
      ["Sign in person, in your own name", "Referred in book order", "Re-sign every 30 days", "Answer calls within the window", "Turned-down calls: see rule 6", "Apprentices: dispatched per", "your apprenticeship standard"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.22 + i * 0.105)));
    }, { accent: UHD_ACCENT });
    reg(hits, rules, "uhd-rules-board");

    // The name-card board: two columns.
    const cardBoard = group(g, 2.3, 1.45, -1.3, -Math.PI / 2);
    slab(cardBoard, 1.1, 0.9, 0.03, 0, -0.45, 0, 0x2a3036, { radius: 0.02, rough: 0.6 });
    decal(cardBoard, 0.5, 0.08, -0.27, 0.38, 0.02, signFace("OUT OF WORK", { bg: "#2a3036", accent: "#f0a35b", scale: 0.6 }), { px: 192 });
    decal(cardBoard, 0.5, 0.08, 0.27, 0.38, 0.02, signFace("DISPATCHED", { bg: "#2a3036", accent: "#59c97b", scale: 0.6 }), { px: 192 });
    for (let i = 0; i < 5; i++) {
      box(cardBoard, 0.4, 0.09, 0.01, -0.27, 0.22 - i * 0.12, 0.02, [0xdfe4e8, 0xd8dce0][i % 2], { rough: 0.7, cast: false });
      if (i < 3) box(cardBoard, 0.4, 0.09, 0.01, 0.27, 0.22 - i * 0.12, 0.02, 0xdfe4e8, { rough: 0.7, cast: false });
    }
    const myCard = group(cardBoard, -0.27, -0.38, 0.03);
    box(myCard, 0.4, 0.09, 0.01, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    decal(myCard, 0.36, 0.07, 0, 0, 0.008, signFace("YOU — APPRENTICE", { bg: "#f2c14b", accent: "#2a3036", fg: "#2a3036", scale: 0.55 }), { px: 192 });
    reg(hits, myCard, "uhd-name-card");
    reg(hits, box(cardBoard, 0.44, 0.12, 0.04, 0.27, -0.14, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "uhd-dispatched-slot");
    holoTag(cardBoard, "dispatch board", 0, 0.54, 0.02, { css: UHD_CSS, w: 0.32 });

    // The availability track, under the card board.
    const avail = group(g, 2.3, 0.75, -1.3, -Math.PI / 2);
    slab(avail, 0.8, 0.2, 0.03, 0, -0.1, 0, 0x1f2a36, { radius: 0.02, rough: 0.6 });
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = box(avail, 0.12, 0.12, 0.02, -0.3 + i * 0.15, 0, 0.02, 0x3a4450, { rough: 0.5, cast: false });
      ownMaterial(d);
      days.push(d);
    }
    holoTag(avail, "reachable — Mon to Fri", 0, -0.16, 0.02, { css: UHD_CSS, w: 0.42 });
    reg(hits, avail, "uhd-availability-track");

    // --------------------------------------------------- the sign-in stand
    const stand = group(g, -1.2, 0, -1.05, 0.3);
    cyl(stand, 0.2, 0.24, 0.04, 0, 0.02, 0, 0x3a4048, { rough: 0.5, metal: 0.4, seg: 18 });
    cyl(stand, 0.03, 0.03, 1.0, 0, 0.52, 0, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    const lectern = group(stand, 0, 1.05, 0);
    lectern.rotation.x = -0.35;
    slab(lectern, 0.5, 0.04, 0.36, 0, 0, 0, 0x5a4a3a, { radius: 0.01, rough: 0.6 });
    const bookFace = decal(lectern, 0.44, 0.3, 0, 0.022, 0, paperFace("OUT-OF-WORK BOOK", ["Name · card no. · date", "1. ______", "2. ______"], { bg: "#fbf8f0", band: "#2f4f6f" }), { px: 256 });
    bookFace.rotation.x = -Math.PI / 2;
    holoTag(stand, "out-of-work book", 0, 1.3, 0, { css: UHD_CSS, w: 0.36 });
    reg(hits, lectern, "uhd-out-of-work-book");
    // A friend's name, waiting for you to sign it (hazard).
    const buddy = group(stand, 0.34, 0.95, 0.1, 0.3);
    slab(buddy, 0.14, 0.004, 0.1, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const buddyFace = decal(buddy, 0.13, 0.09, 0, 0.004, 0, paperFace("SIGN ME IN?", ["'I'm running late'"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 128 });
    buddyFace.rotation.x = -Math.PI / 2;
    holoTag(buddy, "sign for a friend?", 0, 0.1, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, buddy, "uhd-sign-for-buddy");

    // --------------------------------------------------------- the bench
    const bench = group(g, 0.2, 0, -0.5);
    slab(bench, 1.6, 0.05, 0.55, 0, 0.72, 0, 0x7a6048, { radius: 0.02, rough: 0.6 });
    for (const sx of [-1, 1]) box(bench, 0.05, 0.7, 0.5, sx * 0.75, 0.35, 0, 0x4a3a2a, { rough: 0.6 });

    // The wallet with its three cards.
    const CARDS = [["uhd-dues-receipt", -0.62, "DUES RECEIPT", "#3f7a45"], ["uhd-apprentice-card", -0.42, "APPRENTICE CARD", "#2f5f8a"], ["uhd-osha10-card", -0.22, "OSHA 10", "#8a6a2a"]];
    for (const [id, x, label, band] of CARDS) {
      const c = group(bench, x, 0.75, 0.12, (x + 0.4) * 0.3);
      slab(c, 0.15, 0.004, 0.09, 0, 0, 0, 0xf6f4ee, { radius: 0.006, rough: 0.6 });
      const f = decal(c, 0.14, 0.08, 0, 0.004, 0, paperFace(label, ["current"], { bg: "#f6f4ee", band }), { px: 128 });
      f.rotation.x = -Math.PI / 2;
      reg(hits, c, id);
    }
    box(bench, 0.12, 0.02, 0.1, -0.42, 0.755, -0.08, 0x3a2a1e, { rough: 0.6 });

    // The dispatch slip, with its four lines as markers.
    const slip = group(bench, 0.1, 0.75, 0.05, -0.1);
    slab(slip, 0.3, 0.006, 0.38, 0, 0, 0, 0xfdfbf4, { radius: 0.004, rough: 0.85 });
    const slipFace = decal(slip, 0.28, 0.36, 0, 0.005, 0, paperFace("DISPATCH SLIP — EXAMPLE", [
      "Contractor: Example Builders",
      "Report: Mon 6:30 am, ready",
      "Site: 100 Example St, gate 2",
      "Bring: tools on list + PPE",
    ], { bg: "#fdfbf4", band: "#2f4f6f" }), { px: 256 });
    slipFace.rotation.x = -Math.PI / 2;
    holoTag(slip, "dispatch slip", 0, 0.1, 0, { css: UHD_CSS, w: 0.3 });
    const sz = (i) => -0.18 + (0.26 + 0.1 * i) * 0.36;
    for (const [id, i] of [["uhd-slip-contractor", 0], ["uhd-slip-report", 1], ["uhd-slip-location", 2], ["uhd-slip-bring", 3]]) {
      reg(hits, box(slip, 0.26, 0.02, 0.03, 0, 0.012, sz(i), 0xffffff, { opacity: 0.001, transparent: true, cast: false }), id);
    }

    // The commute gauge.
    const commute = instrument(bench, 0.45, 0.78, 0.12, { idle: "-:-- am", color: UHD_ACCENT, ry: -0.1 });
    holoTag(commute, "leave time", 0, 0.16, 0, { css: UHD_CSS, w: 0.24 });
    reg(hits, commute, "uhd-commute-gauge");

    // The alarm clock.
    const clock = group(bench, 0.65, 0.75, -0.12);
    box(clock, 0.14, 0.1, 0.07, 0, 0.05, 0, 0x2a3036, { rough: 0.5 });
    const clockFace = decal(clock, 0.12, 0.06, 0, 0.055, 0.036, signFace("--:--", { bg: "#0d1c24", accent: UHD_CSS, fg: "#d8e8f8", scale: 0.6 }), { px: 128, glow: true, ei: 0.6 });
    const alarmDial = group(clock, 0, 0.12, 0);
    cyl(alarmDial, 0.03, 0.03, 0.02, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 12 });
    holoTag(clock, "alarm", 0, 0.2, 0, { css: UHD_CSS, w: 0.16 });
    reg(hits, alarmDial, "uhd-alarm-dial");

    // The tool bag with the list's tools.
    const bag = group(g, -0.25, 0, 0.55, 0.2);
    box(bag, 0.5, 0.28, 0.26, 0, 0.14, 0, 0x3a3a2a, { rough: 0.8 });
    const TOOLS = [["uhd-tool-tape", -0.3, 0.12, 0xf2c14b], ["uhd-tool-knife", -0.1, 0.12, 0xc0392b], ["uhd-tool-hammer", 0.12, 0.12, 0x5a4a3a], ["uhd-tool-ppe", 0.4, 0.14, 0xf2f2f2]];
    for (const [id, x, y, col] of TOOLS) {
      const t = group(bag, x, 0.3, 0.2);
      if (id === "uhd-tool-ppe") {
        ball(t, 0.12, 0, 0.02, 0, col, { rough: 0.5, seg: 14, seg2: 8 });
        box(t, 0.26, 0.02, 0.3, 0, -0.05, 0.02, col, { rough: 0.5 });
      } else if (id === "uhd-tool-hammer") {
        box(t, 0.03, 0.26, 0.03, 0, 0, 0, col, { rough: 0.6 });
        box(t, 0.1, 0.04, 0.04, 0, 0.13, 0, 0x5a6068, { rough: 0.4, metal: 0.7 });
      } else {
        box(t, 0.08, y * 0.6, 0.04, 0, 0, 0, col, { rough: 0.5 });
      }
      reg(hits, t, id);
    }
    holoTag(bag, "tools on the list", 0, 0.6, 0.2, { css: UHD_CSS, w: 0.34 });

    // The coordinator phone on the wall (first interruption's answer).
    const phoneWall = group(g, -2.4, 0, -0.9, Math.PI / 2);
    box(phoneWall, 0.18, 0.28, 0.06, 0, 1.4, 0.03, 0xe4e0d4, { rough: 0.6 });
    const handset = box(phoneWall, 0.05, 0.2, 0.05, 0, 1.45, 0.08, 0x2b3138, { rough: 0.5 });
    ownMaterial(handset);
    decal(phoneWall, 0.3, 0.1, 0, 1.18, 0.04, signFace("TRAINING COORDINATOR", { bg: "#1f2a36", accent: UHD_CSS, scale: 0.4 }), { px: 192 });
    reg(hits, phoneWall.children[0], "uhd-coordinator-phone");
    holoTag(phoneWall, "call the coordinator", 0, 1.68, 0.04, { css: UHD_CSS, w: 0.4 });

    // The blank form and the truck-bed ride (hazards) by the door.
    const blank = group(bench, 0.72, 0.75, 0.18, 0.3);
    slab(blank, 0.18, 0.004, 0.24, 0, 0, 0, 0xffe9d8, { radius: 0.004, rough: 0.8 });
    const bFace = decal(blank, 0.16, 0.22, 0, 0.004, 0, paperFace("(blank form)", ["Sign: ________", "'we'll fill it in'"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    bFace.rotation.x = -Math.PI / 2;
    holoTag(blank, "sign it blank?", 0, 0.1, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, blank, "uhd-blank-form");
    const ride = group(g, -1.9, 1.6, 1.3, Math.PI / 2);
    slab(ride, 0.6, 0.4, 0.02, 0, -0.2, 0, 0xffe0d4, { radius: 0.01, rough: 0.7 });
    decal(ride, 0.56, 0.36, 0, 0, 0.012, paperFace("RIDE TO THE JOB", ["Hop in the truck bed", "'plenty of room'"], { bg: "#ffe0d4", band: "#c0392b" }), { px: 224 });
    holoTag(ride, "ride in the bed?", 0, 0.26, 0.01, { css: "#f0645b", w: 0.32 });
    reg(hits, ride, "uhd-truck-bed");

    // The phone with the stay-on-the-list text (hazard).
    const mobile = group(bench, -0.05, 0.75, -0.18, 0.3);
    slab(mobile, 0.08, 0.01, 0.15, 0, 0, 0, 0x1b1f24, { radius: 0.01, rough: 0.3, metal: 0.4 });
    const mobileFace = decal(mobile, 0.07, 0.13, 0, 0.007, 0, signFace("reply SSN\nto stay on\nthe list", { bg: "#2a0f12", accent: "#f0645b", scale: 0.17 }), { px: 128, glow: true, ei: 0.8 });
    mobileFace.rotation.x = -Math.PI / 2;
    holoTag(mobile, "list text", 0, 0.1, 0, { css: "#f0645b", w: 0.2 });
    reg(hits, mobile, "uhd-ssn-text");

    // The dispatch log.
    const logBook = group(bench, 0.35, 0.75, -0.15, 0.05);
    box(logBook, 0.2, 0.02, 0.15, 0, 0.01, 0, 0x2f4f6f, { rough: 0.6 });
    const logFace = decal(logBook, 0.17, 0.12, 0, 0.021, 0, paperFace("DISPATCH LOG", ["Signed: ____", "Slip: ____", "Reported: ____"], { bg: "#f6f3ea", band: "#2f4f6f" }), { px: 192 });
    logFace.rotation.x = -Math.PI / 2;
    holoTag(logBook, "dispatch log", 0, 0.12, 0, { css: UHD_CSS, w: 0.26 });
    reg(hits, logBook, "uhd-dispatch-log");

    // Benches of members waiting, and a coffee urn.
    for (const [bx, bz] of [[1.75, -1.95], [-1.25, 2.0]]) {
      const seat = group(g, bx, 0, bz);
      slab(seat, 1.2, 0.05, 0.4, 0, 0.45, 0, 0x5a4a3a, { radius: 0.02, rough: 0.7 });
      for (const sx of [-1, 1]) box(seat, 0.05, 0.43, 0.36, sx * 0.55, 0.22, 0, 0x3a2a1e, { rough: 0.7 });
    }
    seatedFigure(g, 1.5, 0.5, -1.95, { cloth: 0x4a5a3a, ry: 0 });
    seatedFigure(g, 2.05, 0.5, -1.95, { cloth: 0x5a3a3a, ry: 0 });
    const urn = group(g, -2.2, 0, 0.3);
    box(urn, 0.5, 0.8, 0.4, 0, 0.4, 0, 0x4a4038, { rough: 0.7 });
    cyl(urn, 0.1, 0.1, 0.35, 0, 0.98, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 14 });

    for (const sx of [-1, 1]) {
      box(g, 1.2, 0.05, 0.3, sx * 1.1, 2.62, -0.5, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.1, 0.02, 0.22, sx * 1.1, 2.59, -0.5, 0xf6fbff, { emissive: 0xf6fbff, ei: 0.5, rough: 0.4, cast: false });
    }

    // ------------------------------------------------------------ the people
    const steward = standingFigure(g, 1.55, 0.1, { ry: -1.8, cloth: 0x2f4f6f, vest: 0xf2c14b, skin: 0x8a5a3a });
    holoTag(steward, "shop steward", 0, 1.84, 0, { css: UHD_CSS, w: 0.3 });
    reg(hits, box(steward, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "uhd-steward");
    const dispatcher = standingFigure(g, -0.6, -2.75, { ry: 0, cloth: 0x3a4a5a, skin: 0xc9936a, atStation: true });
    holoTag(dispatcher, "dispatcher", 0, 1.84, 0, { css: UHD_CSS, w: 0.24 });

    // The interruptions made visible: the out-of-scope job slip, the cash text.
    const badJob = holoPanel(g, 0.56, 0.34, -0.6, 1.3, -1.7, (cx, w, h) => {
      cx.fillStyle = "rgba(40,20,6,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0a35b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe6c8"; cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("RUN IT ALONE — ELECTRICAL", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillText("no journey-level on site", w / 2, h * 0.68);
    }, { accent: 0xf0a35b });
    badJob.visible = false;
    const cashText = holoPanel(g, 0.46, 0.3, 0.9, 1.5, -1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(40,8,10,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0645b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffd8d4"; cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CASH SAT — NO PAPERWORK", w / 2, h * 0.36);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillText("'don't tell the hall'", w / 2, h * 0.68);
    }, { accent: CITY.alert });
    cashText.visible = false;

    let callOn = false, textOn = false;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "sign-books") repaint(bookFace, paperFace("OUT-OF-WORK BOOK", ["Name · card no. · date", "1. YOU — signed", "2. ______"], { bg: "#fbf8f0", band: "#59c97b" }));
        if (step.id === "take-slip") slip.position.y = 0.76;
        if (step.id === "move-card") myCard.position.set(0.27, -0.14, 0.03);
        if (step.id === "leave-time") repaint(commute.userData.screen, signFace("5:15 am", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.5 }));
        if (step.id === "alarm") repaint(clockFace, signFace("4:30", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.6 }));
        if (step.id === "stay-available") for (const d of days) d.material.color.set(CITY.good);
        if (step.id === "steward-checkin") steward.rotation.y = -2.4;
        if (step.id === "dispatch-log") repaint(logFace, paperFace("DISPATCH LOG", ["Signed: Mon", "Slip: Example Bldrs", "Declined: out of scope"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "uhd-out-of-scope") {
          callOn = true;
          badJob.visible = true;
          dispatchLamp.material.emissive.set(0xf0a35b);
          dispatchLamp.material.emissiveIntensity = 1.0;
          handset.material.emissive.set(UHD_ACCENT);
          handset.material.emissiveIntensity = 0.6;
        }
        if (it.id === "uhd-cash-offer") {
          textOn = true;
          cashText.visible = true;
          agentLamp.material.emissive.set(UHD_ACCENT);
          agentLamp.material.emissiveIntensity = 0.8;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "uhd-out-of-scope") {
          callOn = false;
          badJob.visible = false;
          dispatchLamp.material.emissiveIntensity = 0;
          handset.material = it.resolved === "answered" ? mat(CITY.good, { emissive: CITY.good, ei: 0.5, rough: 0.5 }) : mat(0x2b3138, { rough: 0.5 });
        }
        if (it.id === "uhd-cash-offer") {
          textOn = false;
          cashText.visible = false;
          agentLamp.material = it.resolved === "answered" ? mat(CITY.good, { emissive: CITY.good, ei: 0.8, rough: 0.4 }) : mat(0x3a4048, { rough: 0.4 });
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (callOn) dispatchLamp.material.emissiveIntensity = 0.7 + Math.sin(t * 9) * 0.5;
        if (textOn) agentLamp.material.emissiveIntensity = 0.6 + Math.sin(t * 8) * 0.4;
        if (session?.turn && session.step?.id === "alarm") alarmDial.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "leave-time") {
          const ok = gg.t >= 0.3 && gg.t <= 0.46;
          const m = Math.round(gg.t * 120), h = 4 + Math.floor((m + 30) / 60), mm = String((m + 30) % 60).padStart(2, "0");
          repaint(commute.userData.screen, signFace(`${h}:${mm}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "stay-available") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          const lit = Math.min(5, Math.floor((tr.inBand ?? 0) / 7 * 5));
          days.forEach((d, i) => { d.material.color.set(i < lit ? CITY.good : ok ? 0x3a4450 : 0x7a3a36); });
        }
      },
    };
  },
};
