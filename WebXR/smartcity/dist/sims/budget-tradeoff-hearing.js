import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Budget Tradeoff Hearing VR — Civic Leadership and Emotional
// Intelligence, station four.
//
// A public budget hearing with a gap to close. The learner chairs the budget
// committee: the numbers on the screen, three colleagues at the table,
// residents lined up to testify about library hours, street repair and a youth
// programme, a steward from the public-service local at the back, and a
// reserve that everybody would like to spend once. Nothing about closing the
// gap is painless, and the station is scored on doing it in the open.
//
// The principles it practises — spend public money in the open, take the hard
// call and own it — are principles commonly taught in civic-leadership
// programmes; the foundation whose principles the module draws on is not
// sourced in this repository. The city and its figures are invented; no real
// budget, body or person is depicted.

const BTH_ACCENT = 0x7fa7d8;
const BTH_CSS = "#7fa7d8";

export const SIM_BUDGET_TRADEOFF_HEARING = {
  id: "budget-tradeoff-hearing",
  index: "220",
  domain: "Civic",
  trade: "Budget committee chair",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "rain",
  certification: "The Ralph M. Brown Act (California Government Code section 54950 and following) for a budget hearing held in public and for documents given to a majority of the body being available to the public at the same time; the Political Reform Act, administered by the FPPC, and the municipal ethics code for a member's financial interest in a funded project and for gifts from a bidder; Robert's Rules of Order as the body's adopted practice for amendments; Title II of the ADA for budget documents in accessible formats; SEIU and AFSCME for the public-service workers whose jobs a cut touches, and the state's public-sector labour relations law for consulting them. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Budget Tradeoff Hearing",
  title: simTitle("Budget Tradeoff Hearing"),
  tagline: "A gap to close in front of the people it lands on: the packet public, the options costed, testimony heard, one-time money kept off ongoing costs, the reserve held, your own interest disclosed — and the cut owned out loud",
  accent: BTH_ACCENT,
  accentCss: BTH_CSS,
  parSeconds: 340,
  footprint: 2.4,
  badge: { id: "money-in-the-open", name: "Money in the Open", note: "Every dollar decided where the public could see it, with the reasoning published and the hard call owned" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or a colleague who has voted on a hard budget and will talk it through with you",

  game: system({
    name: "Open Ledger",
    currency: "LEDGER",
    ranks: ["Committee Member", "Vice Chair", "Budget Chair", "Finance Lead", "Budget Mentor"],
    badges: [
      { id: "packet-public", name: "Packet Public", note: "Every document check passed before the hearing opened", test: AWARD.stepClean("check-the-packet") },
      { id: "no-backroom", name: "No Back Room", note: "No unsafe action anywhere in the hearing", test: AWARD.safe },
      { id: "owned-it", name: "Owned It", note: "The cut explained without a single deflection", test: AWARD.stepClean("own-the-cut") },
    ],
    challenges: [
      { id: "clean-ledger", name: "Clean Ledger", note: "No corrections anywhere in the hearing", test: AWARD.clean },
      { id: "balanced", name: "Balanced", note: "The budget balanced inside the band", test: AWARD.precise(0.7) },
      { id: "steady-reserve", name: "Steady Reserve", note: "The testimony and the reserve both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "wave-off-testimony": "You waved off the library parent's testimony as \"not a budget question\". Who loses the Saturday hours is exactly the budget question; a chair who treats testimony as an interruption to the real work tells the room the numbers were settled before anybody spoke.",
    "promise-no-cuts": "You told the room nobody will lose anything. There is a gap on the screen behind you that says otherwise, and the promise lasts until the adopted budget comes out — then every service that was cut is also a promise you broke in public.",
    "hallway-numbers": "You stepped into the hallway with two colleagues to settle the numbers. Three members of this committee agreeing the budget out of the public's sight is the deliberation the open-meeting law says belongs in the room — and the residents who testified will read the result without ever hearing the reasons.",
    "contractor-tickets": "You took the paving contractor's game tickets. That firm is bidding on the street-repair line you are about to fund; a gift from a bidder is reportable at best and disqualifying at worst, and it hangs over every dollar in that line.",
  },

  lateNotes: {
    "reserve-block": "The reserve decision comes after the testimony. Hear who a cut lands on before you move any money.",
    "budget-log-board": "The budget is adopted and logged once the reasoning is published and the cut owned — not yet.",
  },

  steps: [
    {
      id: "check-the-packet", kind: "find", noHint: true,
      targets: ["packet-posted-with-agenda", "packet-plain-summary", "packet-large-print"],
      itemNames: {
        "packet-posted-with-agenda": "the full budget posted when the members got it",
        "packet-plain-summary": "a one-page plain-language summary",
        "packet-large-print": "large-print and screen-reader copies",
      },
      itemNotes: {
        "packet-posted-with-agenda": "The public got the same documents at the same time the committee did. A budget the public sees for the first time on the screen is not a public hearing.",
        "packet-plain-summary": "Four hundred pages is not transparency on its own. One page that says what is cut, what is kept and why is what most residents can actually use.",
        "packet-large-print": "Accessible copies are how a resident with low vision testifies about the same numbers as everybody else.",
      },
      decoyNotes: {
        "packet-glossy-cover": "A glossy cover is presentation. It does not make the budget any more or less open.",
      },
      title: "Check the budget packet is really public",
      cue: "Look at the documents table. Three things decide whether residents can follow the money tonight.",
      why: "Spending public money in the open begins before anybody speaks. If the committee had the full budget for a week and the public got it tonight, if the only version is four hundred pages of line items, or if a resident with low vision cannot read it, the hearing is open in form and closed in fact. The chair checks that the public holds the same numbers the members do.",
    },
    {
      id: "project-the-numbers", kind: "turn", target: "projector-knob",
      title: "Put the numbers on the screen",
      cue: "Turn the projector on so the gap, the options and the reserve are in front of the whole room.",
      turn: { turns: 0.5, axis: "y", label: "SCREEN" },
      why: "A budget discussed from papers only the committee holds is a conversation the public overhears. On the screen, the gap and every option to close it are in front of every resident and on the stream, so testimony is about the same numbers the members are weighing — and nobody can later say a figure was quietly different from the one discussed.",
    },
    {
      id: "state-the-gap", kind: "select", target: "gap-statement-card",
      title: "State the gap plainly, with where it came from",
      cue: "\"We are four point two million short next year. Here is why: costs up, one grant ended.\"",
      why: "Residents can take bad news; what they cannot take is being managed. Saying the size of the gap in one plain sentence, and where it came from, treats the room as people who can reason about their own city. It also sets the frame honestly: every option that follows is a way of dividing a real shortfall, not a debate about whether one exists.",
    },
    {
      id: "walk-the-options", kind: "sequence",
      targets: ["opt-baseline", "opt-who-is-affected", "opt-cost-of-each", "opt-recommendation"],
      itemNames: {
        "opt-baseline": "the baseline — what continuing costs",
        "opt-who-is-affected": "who each option lands on",
        "opt-cost-of-each": "what each option saves",
        "opt-recommendation": "the staff recommendation, last",
      },
      title: "Walk the options in an order the public can follow",
      cue: "Baseline first, then who each option affects, then what it saves, then the recommendation.",
      why: "The order decides whether the public can judge the recommendation or only react to it. Starting from what doing nothing costs, then who each option lands on, then what it saves, lets a resident weigh the tradeoff before being told the answer. Leading with the recommendation turns the rest of the presentation into a defence of a decision the room had no part in.",
      outOfOrderNote: "Baseline, who is affected, what it saves, then the recommendation. Opening with the recommendation tells the room the hearing is a formality.",
    },
    {
      id: "balance-the-budget", kind: "gauge", target: "balance-scale",
      title: "Balance the package",
      cue: "Commit the mix of cuts and revenue when the gap on the scale reads inside the band.",
      gauge: {
        label: "GAP REMAINING", speed: 0.6, green: [0.44, 0.56],
        readout: (t) => {
          const m = (t - 0.5) * 8.4;
          return Math.abs(m) < 0.25 ? "balanced" : `${m < 0 ? "short" : "over-cut"} $${Math.abs(m).toFixed(1)}M`;
        },
        missNote: "Not balanced. Short, and the budget cannot be adopted; over-cut, and services go that the gap never required. Commit when the scale reads balanced.",
      },
      why: "A balanced budget is a legal requirement and a moral one: cutting more than the gap requires takes services from residents for no reason the committee can defend, and cutting less leaves a deficit for next year's residents to pay. The scale makes the arithmetic visible to the room, so the mix the committee commits to is one everybody watched add up.",
    },
    {
      id: "take-testimony", kind: "hold", target: "testimony-bead", seconds: 8,
      title: "Take public testimony without rebutting it",
      cue: "Hold your attention on the speaker at the public mic. Hear the whole two minutes.",
      why: "The people at the public microphone are the people the numbers land on: the parent who takes her kids to the library on Saturdays, the man whose street floods, the teenager in the youth programme. Hearing each of them fully, without the chair visibly waiting to rebut, is what makes the decision that follows one the room can accept even when it goes against them.",
      holdBreakNote: "You turned to your notes mid-testimony. The speaker saw it. Come back to her and let her finish.",
    },
    {
      id: "move-one-time-money", kind: "drag", target: "reserve-block",
      title: "Keep one-time money off ongoing costs",
      cue: "Carry the reserve drawdown to the one-time costs slot — not to salaries or programmes that recur.",
      drag: {
        to: "one-time-costs-slot", radius: 0.55,
        missNote: "Not in the one-time slot. Reserve money spent on something that recurs has to be found again next year, and the year after — the gap comes back bigger.",
      },
      why: "Using a one-time reserve to cover an ongoing cost closes this year's gap by opening a larger one next year. Putting the drawdown against genuinely one-time costs — the equipment purchase, the deferred repair — is the discipline that keeps the city's books honest across years, and it is the kind of choice that is invisible unless somebody says it out loud in the hearing.",
    },
    {
      id: "disclose-and-step-out", kind: "select", target: "recusal-card",
      title: "Disclose your own interest and step out for that line",
      cue: "Your house is on the block the repaving line funds. Announce it, name the interest, and leave the room for that vote.",
      why: "A member with a financial interest in a decision sits it out, and the public is entitled to know why. Announcing the interest in plain words before the line comes up, then physically leaving the room while it is decided, is what lets the rest of the budget stand on its merits — and it is the difference between a disclosure that protects the vote and a quiet abstention that invites a challenge.",
    },
    {
      id: "hold-the-reserve", kind: "track", target: "reserve-meter", seconds: 8,
      title: "Hold the reserve inside its floor while amendments fly",
      cue: "Members are proposing amendments. Keep the reserve level inside the band — not drained, not hoarded.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "RESERVE",
        readout: (v) => (v < 0.3 ? "below the floor" : v > 0.7 ? "hoarded" : "inside policy"),
      },
      why: "Every amendment wants a little of the reserve, and each one is reasonable on its own. Drained below the city's own policy floor, the reserve is not there for the storm or the recession it exists for; hoarded far above it, money sits idle while services are cut. Holding the level while amendments come and go is continuous attention, not one decision.",
      holdBreakNote: "The reserve drifted out of policy while you were taking amendments. Bring it back inside the band before the next one is moved.",
    },
    {
      id: "show-your-work", kind: "sequence", anyOrder: true,
      targets: ["work-assumptions", "work-rejected-options", "work-who-loses"],
      itemNames: {
        "work-assumptions": "the revenue and cost assumptions",
        "work-rejected-options": "the options the committee rejected, and why",
        "work-who-loses": "who loses what, stated plainly",
      },
      title: "Publish the working behind the decision",
      cue: "Assumptions, the options rejected and why, and who loses what — all three into the public record.",
      why: "A budget without its working is a list of numbers the public has to take on trust. Publishing the assumptions lets residents check them; publishing the options the committee rejected shows the choice was real; stating plainly who loses what is the part most budgets bury. Spending public money in the open means the reasoning is as public as the result.",
    },
    {
      id: "own-the-cut", kind: "find", noHint: true,
      targets: ["own-we-chose", "own-here-is-why", "own-when-we-revisit"],
      itemNames: {
        "own-we-chose": "\"We chose to reduce Saturday library hours.\"",
        "own-here-is-why": "\"Here is why, and what we protected instead.\"",
        "own-when-we-revisit": "\"We will revisit it at mid-year, in public.\"",
      },
      itemNotes: {
        "own-we-chose": "\"We chose\" — not \"it was decided\", not \"the numbers forced\". The committee made this call and says so.",
        "own-here-is-why": "The reason, and what the cut paid for, so residents can judge the tradeoff rather than just feel it.",
        "own-when-we-revisit": "A date to look at it again, in public, is how a hard call stays accountable after tonight.",
      },
      decoyNotes: {
        "own-blame-the-state": "\"The state left us no choice\" may be partly true and is still a deflection. The committee chose which service to cut; say so.",
      },
      title: "Own the hard call in your own words",
      cue: "Choose every statement that owns the decision. Leave the deflection where it is.",
      why: "Taking the hard call and owning it is what separates a decision from an outcome that just happened. Residents who lose a service can accept a leader who says \"we chose this, here is why, and here is when we will look again\" far more readily than one who blames the state, the last council or the numbers. Ownership is also a commitment: it is the chair's name on the reason.",
    },
    {
      id: "adopt-and-log", kind: "select", target: "budget-log-board",
      title: "Adopt the budget and log the votes by name",
      cue: "Record the adopted budget, each member's vote, your recusal on the repaving line and the mid-year review date.",
      why: "The adopted budget and the record of how it was adopted are what the public holds the committee to for the next twelve months. Each member's vote, the recusal and its reason, and the date of the mid-year review in the minutes make the hard call traceable to the people who made it, which is exactly what owning it means once the room has emptied.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the budget staff before you leave",
      cue: "Two minutes with the finance team: how did that land, and who needs a word tomorrow?",
      why: "A night of residents describing what a cut will do to them lands on the staff who built the options as well as on the committee. Checking in with the finance team — how did it land, who needs support, the employee assistance line if it stays with anyone — is part of taking the hard call responsibly, because the people who carry it out are people too.",
    },
  ],

  interrupts: [
    {
      id: "revised-sheet-to-three",
      kind: "Documents the public cannot see",
      after: "take-testimony", delay: 3, seconds: 12,
      alert: "During testimony, an aide slips a revised spreadsheet to three members at the table. The public copies on the documents table are still the old version.",
      cue: "Stop and post it: copies of the revision on the public table, and read the change aloud.",
      target: "public-copies-table",
      why: "A document handed to a majority of the body during a meeting belongs to the public at the same moment. Posting the revision on the public table and reading the change aloud keeps the hearing on the same numbers for everybody — and it stops the people testifying from arguing against a version of the budget the committee has already moved on from.",
      missNote: "The revision stayed among three members. Testimony carried on against numbers the committee had quietly replaced, and when the public finds out the budget changed mid-hearing, every vote taken tonight is in question.",
      wrongNote: "Not the speaker at the mic — she is doing what she came to do. The revision is on the committee table; get it onto the public one.",
    },
    {
      id: "steward-rises",
      kind: "Workers not consulted",
      after: "hold-the-reserve", delay: 3, seconds: 12,
      alert: "The steward from the public-service local has stood up at the back holding a sign: the positions being cut were never discussed with the workers who hold them.",
      cue: "Recognise her and commit, on the record, to consult the union before the cuts are final.",
      target: "meet-and-confer-card",
      why: "Cuts that touch represented positions carry a duty to consult the union before they are final, and the workers affected are residents too. Recognising the steward, taking the point on the record and committing to consultation before adoption brings the people who will carry the cut into the decision rather than handing it to them afterwards.",
      missNote: "The steward was ignored and sat down. The committee adopted cuts to positions nobody had discussed with the workers in them, and the grievance that follows will cost more time and money than the conversation would have.",
      wrongNote: "The reserve meter will not answer her. Recognise the steward and commit to consulting the union before the cuts are final.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, BTH_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? BTH_ACCENT, { emissive: o.color ?? BTH_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? BTH_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1522", accent: o.accent ?? BTH_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? BTH_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry = 0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.19, 0.21, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.026, 0.026, 1.0, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const chair = (x, z, ry, color) => {
      const c = group(g, x, 0, z, ry);
      box(c, 0.46, 0.06, 0.44, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.46, 0.5, 0.05, 0, 0.74, -0.2, color, { rough: 0.7 });
      cyl(c, 0.03, 0.05, 0.44, 0, 0.22, 0, 0x2a2d31, { rough: 0.5, metal: 0.6, seg: 8 });
      return c;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(10,16,28,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? BTH_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef4fc";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c3d4ea";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? BTH_ACCENT, { rough: 0.5, emissive: o.accent ?? BTH_ACCENT, ei: 0.25 });
      b.userData.face = decal(b, w, h, 0, 0, 0, draw, { px: 512, glow: true, ei: 0.9 });
      return b;
    };
    const wrap = (cx, text, x, y, maxW, lh) => {
      let line = "", yy = y;
      for (const word of String(text).split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(test)?.width ?? test.length * lh * 0.45) > maxW && line) { cx.fillText(line, x, yy); line = word; yy += lh; }
        else line = test;
      }
      if (line) cx.fillText(line, x, yy);
    };

    // ------------------------------------------------------------ the hearing room
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 9, base: "#2f3a4a", base2: "#283240", seam: "rgba(8,12,18,0.4)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 8.2, 0.02, 6.6, 0, 0.008, -0.5, 0x2f3a4a, { rough: 0.95, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.02, color: 0x3f4c60 });

    // The committee table, three members and the chair's empty place.
    const tableTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#51402f", base2: "#46372a", seam: "rgba(20,14,8,0.45)",
    }), { repeat: 2, px: 320 });
    const tableFront = box(g, 4.4, 0.72, 0.06, 0, 0.4, -2.05, 0x51402f, { rough: 0.7 });
    tableFront.material = texturedMat(tableTex, { rough: 0.7, metal: 0.03, color: 0x6a5440 });
    box(g, 4.5, 0.05, 0.75, 0, 0.78, -2.4, 0x6a5440, { rough: 0.55 });
    const members = [];
    for (const [mx, cloth] of [[-1.5, 0x3c4a5c], [-0.5, 0x5c4a3c], [1.5, 0x3f5a4a]]) {
      box(g, 0.48, 0.75, 0.06, mx, 0.8, -3.05, 0x2f3540, { rough: 0.7 });
      members.push(seatedFigure(g, mx, 0.49, -2.85, { ry: 0, cloth }));
    }
    box(g, 0.48, 0.8, 0.06, 0.5, 0.82, -3.05, 0x4a3a22, { rough: 0.7 });
    decal(g, 0.4, 0.09, 0.5, 0.66, -2.015, signFace("CHAIR", { bg: "#0e1726", accent: BTH_CSS, scale: 0.55 }), { px: 128 });
    // The revised spreadsheet that appears in front of three members.
    const revised = [];
    for (const mx of [-1.5, -0.5, 1.5]) {
      const r = box(g, 0.22, 0.01, 0.3, mx, 0.81, -2.25, 0xf2efe6, { rough: 0.8 });
      r.visible = false;
      revised.push(r);
    }

    // The projection screen and the projector knob.
    const screen = board(2.0, 1.1, 0, 2.35, -3.6, (cx, w, h) => lines(cx, w, h, "FY BUDGET — HEARING", ["Screen off"]), {});
    const projector = group(g, 0.9, 0.8, -2.2);
    box(projector, 0.22, 0.08, 0.18, 0, 0.04, 0, 0x22262c, { rough: 0.5 });
    const projKnob = cyl(projector, 0.035, 0.035, 0.035, 0.05, 0.1, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(projector, "Screen", 0, 0.24, 0, { css: BTH_CSS, w: 0.2 });
    reg(hits, projKnob, "projector-knob");

    card(-1.0, 1.4, -1.8, "gap-statement-card", "Say the gap, and why", "$4.2M SHORT\nCOSTS · GRANT ENDED", { w: 0.46 });
    card(1.2, 1.45, -1.8, "recusal-card", "Disclose · step out", "MY HOUSE IS\nON THAT BLOCK", { w: 0.36 });

    // The options ladder.
    const ladder = group(g, 2.4, 0, -0.9, -0.5);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["opt-baseline", "1 · Baseline cost", 0.75], ["opt-who-is-affected", "2 · Who it lands on", 1.05],
      ["opt-cost-of-each", "3 · What each saves", 1.35], ["opt-recommendation", "4 · Recommendation", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, BTH_ACCENT, { emissive: BTH_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: BTH_CSS, w: 0.42 });
      reg(hits, b, lid);
    }

    // The balance scale and the reserve meter.
    const scaleStand = stand(-1.3, -0.4, 0.4);
    const scale = instrument(scaleStand, 0, 1.02, 0, { idle: "GAP", color: BTH_ACCENT, w: 0.2, d: 0.26 });
    holoTag(scaleStand, "Balance the package", 0, 1.22, 0, { css: BTH_CSS, w: 0.42 });
    reg(hits, scale, "balance-scale");
    const beam = group(scaleStand, 0, 1.45, 0);
    box(beam, 0.6, 0.02, 0.03, 0, 0, 0, 0xc9a34a, { rough: 0.4, metal: 0.6 });
    for (const sx of [-1, 1]) cyl(beam, 0.07, 0.07, 0.01, sx * 0.28, -0.06, 0, 0xc9a34a, { rough: 0.4, metal: 0.6, seg: 14 });
    const resStand = stand(1.45, 0.5, -0.4);
    const resGauge = instrument(resStand, 0, 1.02, 0, { idle: "RESERVE", color: BTH_ACCENT, w: 0.2, d: 0.26 });
    holoTag(resStand, "Reserve level", 0, 1.22, 0, { css: BTH_CSS, w: 0.32 });
    reg(hits, resGauge, "reserve-meter");

    // Funding blocks: the reserve drawdown and the one-time slot.
    const blockGrp = group(g, -2.4, 0.9, -1.3);
    box(blockGrp, 0.5, 0.05, 0.4, 0, -0.05, 0, 0x3a3f46, { rough: 0.6 });
    const reserveBlock = box(blockGrp, 0.22, 0.14, 0.14, 0, 0.07, 0, 0xc9a34a, { rough: 0.4, metal: 0.4 });
    holoTag(blockGrp, "Reserve drawdown — $1.1M", 0, 0.3, 0, { css: "#c9a34a", w: 0.5 });
    reg(hits, reserveBlock, "reserve-block");
    // A pedestal under the one-time slot, so the socket sits at hand height.
    const slotGrp = group(g, -2.9, 0, 0.3, 0.8);
    box(slotGrp, 0.5, 0.9, 0.4, 0, 0.45, 0, 0x3a4658, { rough: 0.6 });
    const slot = box(slotGrp, 0.36, 0.02, 0.26, 0, 0.91, 0, 0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.25 });
    holoTag(slotGrp, "One-time costs only", 0, 1.12, 0, { css: "#59c97b", w: 0.42 });
    reg(hits, slot, "one-time-costs-slot");
    const ongoing = group(g, -3.3, 0, -0.5, 1.0);
    box(ongoing, 0.5, 0.9, 0.4, 0, 0.45, 0, 0x3a4658, { rough: 0.6 });
    decal(ongoing, 0.4, 0.1, 0, 1.0, 0.21, signFace("ONGOING — SALARIES", { bg: "#16202a", accent: "#7fc4d8", scale: 0.55 }), { px: 192 });

    // The public mic and the speakers' line.
    const mic = group(g, 0.1, 0, -0.2);
    cyl(mic, 0.16, 0.18, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
    cyl(mic, 0.015, 0.015, 1.3, 0, 0.65, 0, 0x2a2e33, { rough: 0.5, metal: 0.6, seg: 8 });
    const speaker = standingPerson(g, 0.1, 0.25, { ry: Math.PI, cloth: 0x6a4a6a, hiVis: false });
    holoTag(speaker.torso, "Library parent", 0, 1.9, 0, { css: BTH_CSS, w: 0.34 }).rotation.y = Math.PI;
    standingPerson(g, 2.1, 0.3, { ry: Math.PI - 0.6, cloth: 0x3a6a5a, hiVis: false });
    bead(-0.45, 1.5, -0.45, "testimony-bead", "Hear the testimony", { w: 0.4 });
    bead(0.55, 1.25, -0.6, "wave-off-testimony", "\"Not a budget question\"", { color: 0xf0645b, css: "#f0645b", w: 0.48 });

    // The documents table: the packet checks and the public copies.
    const docs = group(g, 3.1, 0, 0.9, -1.2);
    box(docs, 1.3, 0.05, 0.55, 0, 0.76, 0, 0x5d4b3a, { rough: 0.6 });
    for (const sx of [-1, 1]) box(docs, 0.05, 0.74, 0.45, sx * 0.6, 0.37, 0, 0x4a3b2d, { rough: 0.7 });
    const packet = box(docs, 0.26, 0.1, 0.34, -0.4, 0.84, 0, 0xe8e4d8, { rough: 0.8 });
    holoTag(docs, "Full budget — posted", -0.4, 1.06, 0, { css: BTH_CSS, w: 0.4 });
    reg(hits, packet, "packet-posted-with-agenda");
    const summary = decal(docs, 0.2, 0.26, 0.0, 0.795, 0, paperFace("ONE PAGE", ["Cut · kept · why"], { band: "#2f4a6a" }), { px: 128 });
    summary.rotation.x = -Math.PI / 2;
    holoTag(docs, "Plain summary", 0.0, 0.98, 0.05, { css: BTH_CSS, w: 0.3 });
    reg(hits, summary, "packet-plain-summary");
    const large = box(docs, 0.2, 0.06, 0.28, 0.4, 0.82, 0, 0xf2e6a0, { rough: 0.8 });
    holoTag(docs, "Large print", 0.4, 1.02, 0, { css: BTH_CSS, w: 0.26 });
    reg(hits, large, "packet-large-print");
    const glossy = box(g, 0.2, 0.02, 0.26, 2.6, 0.8, 1.35, 0xd84a8a, { rough: 0.2, metal: 0.3 });
    reg(hits, glossy, "packet-glossy-cover");
    const copies = board(0.4, 0.26, 3.4, 1.35, 1.6, (cx, w, h) => lines(cx, w, h, "PUBLIC COPIES", ["Same numbers as the table"], { accent: "#f2c14b" }), { ry: -1.2, accent: 0xf2c14b });
    reg(hits, copies.userData.face, "public-copies-table");

    // Show-your-work board.
    const work = group(g, -2.2, 0, 1.0, 0.9);
    cyl(work, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [wid, label, y] of [["work-assumptions", "Assumptions", 0.9], ["work-rejected-options", "Options rejected + why", 1.18], ["work-who-loses", "Who loses what", 1.46]]) {
      const b = ball(work, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(work, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.44 });
      reg(hits, b, wid);
    }

    // Own-the-cut statements.
    board(0.7, 0.36, -3.3, 2.1, -1.8, (cx, w, h) => lines(cx, w, h, "SAY IT AS YOURS", ["Tap every line that owns the decision"]), { ry: 1.0 });
    const own = group(g, -3.25, 0, -1.55, 1.0);
    for (const [oid, label, y, c] of [
      ["own-we-chose", "We chose to cut Saturday hours", 1.75, BTH_ACCENT], ["own-here-is-why", "Here is why · what we protected", 1.55, BTH_ACCENT],
      ["own-when-we-revisit", "We revisit at mid-year, in public", 1.35, BTH_ACCENT], ["own-blame-the-state", "The state left us no choice", 1.15, 0x7fc4d8],
    ]) {
      const b = ball(own, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(own, label, 0.34, y, 0, { css: BTH_CSS, w: 0.6 });
      reg(hits, b, oid);
    }

    // The steward at the back, and the answer to her.
    const steward = standingPerson(g, 3.6, 2.2, { ry: -2.4, cloth: 0x7a2a3a, hiVis: false });
    const stewardSign = decal(g, 0.4, 0.26, 3.3, 1.55, 1.95, signFace("NOT\nCONSULTED", { bg: "#f2e6cc", fg: "#6a1a1a", accent: "#b0453a", scale: 0.36 }), { px: 192 });
    stewardSign.rotation.y = -2.4;
    stewardSign.visible = false;
    card(2.2, 1.3, 1.25, "meet-and-confer-card", "Consult the union first", "WE WILL CONSULT\nBEFORE IT'S FINAL", { w: 0.5, ry: -0.7, accent: "#f2c14b", css: "#f2c14b" });

    // ------------------------------------------------------------ the wrong moves
    card(-1.6, 1.3, 0.55, "promise-no-cuts", "Promise nobody loses?", "NOBODY LOSES\nANYTHING", {
      w: 0.46, ry: 0.4, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(-2.9, 1.0, -2.4, "hallway-numbers", "Settle it in the hallway?", { color: 0xf0645b, css: "#f0645b", w: 0.5 });
    const tickets = decal(g, 0.18, 0.08, 1.9, 0.815, -2.2, signFace("GAME TICKETS", { bg: "#f0ead8", fg: "#5a3a1a", accent: "#b0453a", scale: 0.4 }), { px: 128 });
    tickets.rotation.x = -Math.PI / 2;
    holoTag(g, "From the paving bidder?", 1.9, 0.98, -2.2, { css: "#f0645b", w: 0.46 });
    reg(hits, tickets, "contractor-tickets");

    // Closing boards.
    const logBoard = board(0.56, 0.38, 2.0, 1.95, 1.9, (cx, w, h) => lines(cx, w, h, "ADOPTION RECORD", ["Votes by name · recusal", "Mid-year review date"]), { ry: -0.7 });
    reg(hits, logBoard.userData.face, "budget-log-board");
    const checkin = board(0.5, 0.34, -1.3, 1.9, 1.9, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that land?", "Employee assistance line"], { accent: "#7fc4d8" }), { ry: 0.5, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, -1.8, 2.45, -3.4, (cx, w, h) => lines(cx, w, h, "IN THE OPEN", ["Every dollar where they can see it."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the finance director
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const director = standingFigure(g, -2.1, -1.85, { ry: 1.8, cloth: 0x2f3946, trousers: 0x262d36 });
    holoTag(director, "Finance director", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.36 }).rotation.y = -1.8;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.3, -2.6),

      onStepComplete(step) {
        if (step.id === "project-the-numbers") {
          projKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
          repaint(screen.userData.face, (cx, w, h) => lines(cx, w, h, "FY BUDGET — GAP $4.2M", [
            "Library Saturday hours   −$0.9M", "Street repair deferral   −$1.4M",
            "Youth programme trim   −$0.8M", "Reserve drawdown (one-time)   $1.1M",
          ]));
        }
        if (step.id === "move-one-time-money") {
          blockGrp.position.set(-2.9, 0.98, 0.3);
          blockGrp.rotation.y = 0.8;
        }
        if (step.id === "balance-the-budget") beam.rotation.z = 0;
        if (step.id === "adopt-and-log") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "ADOPTED — LOGGED", ["Votes by name · recusal noted", "Mid-year review in public"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "wave-off-testimony" || id === "promise-no-cuts") {
          speaker.root.rotation.y = Math.PI - 0.9;
          speaker.head.rotation.y = -0.4;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. Who a cut lands on is the budget question.");
        }
      },

      onInterrupt(it) {
        if (it.id === "revised-sheet-to-three") for (const r of revised) r.visible = true;
        if (it.id === "steward-rises") {
          steward.root.position.set(3.0, 0, 1.7);
          steward.arms[0].shoulder.rotation.x = -1.2;
          stewardSign.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "revised-sheet-to-three") {
          for (const r of revised) r.visible = false;
          repaint(copies.userData.face, (cx, w, h) => lines(cx, w, h, "REVISION POSTED", ["Read aloud · copies out"], { accent: "#59c97b" }));
        }
        if (it.id === "steward-rises") {
          steward.root.position.set(3.6, 0, 2.2);
          steward.arms[0].shoulder.rotation.x = 0;
          stewardSign.visible = false;
        }
      },

      animate(t, dt, session) {
        speaker.head.rotation.x = Math.sin(t * 0.8) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "balance-the-budget") {
          const m = (gg.t - 0.5) * 8.4;
          const ok = gg.t >= 0.44 && gg.t <= 0.56;
          beam.rotation.z = Math.max(-0.3, Math.min(0.3, m * 0.07));
          repaint(scale.userData.screen, signFace(ok ? "BALANCED" : `${m < 0 ? "SHORT" : "OVER"} ${Math.abs(m).toFixed(1)}M`, {
            bg: "#0c1522", accent: ok ? "#59c97b" : "#f0645b", fg: "#e2ecf8", scale: 0.5,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-reserve" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(resGauge.userData.screen, signFace(ok ? "IN POLICY" : tr.v < 0.3 ? "BELOW FLOOR" : "HOARDED", {
            bg: "#0c1522", accent: ok ? "#59c97b" : "#f0645b", fg: "#e2ecf8", scale: 0.5,
          }));
        }
      },
    };
  },
};
