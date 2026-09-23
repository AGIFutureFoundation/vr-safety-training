import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Ethics and Conflict of Interest VR — Civic Leadership and
// Emotional Intelligence, station five.
//
// A newly appointed commissioner's first month, compressed into one office
// and the hallway outside a hearing room: the statement of economic interests
// to file, a gift to value and report, a permit applicant with tickets, a
// recusal to perform in public, a lobbyist's visit to log, a job offer that is
// really a question, and a staff member who knocks with a concern. The law is
// the Political Reform Act and the city's own ethics code; the station is
// about doing what they require when nobody would have noticed otherwise.
//
// The principles it practises — keep your word, spend public money in the
// open, take the hard call and own it — are principles commonly taught in
// civic-leadership programmes; the foundation whose principles the module
// draws on is not sourced in this repository. No real official, firm or
// person is depicted, and no jurisdiction's gift limit is quoted.

const ECI_ACCENT = 0x9b8ad6;
const ECI_CSS = "#9b8ad6";

export const SIM_ETHICS_AND_CONFLICT_OF_INTEREST = {
  id: "ethics-and-conflict-of-interest",
  index: "221",
  domain: "Civic",
  trade: "Appointed commissioner — ethics and disclosure",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "The Political Reform Act of 1974, administered by the Fair Political Practices Commission (FPPC): the Statement of Economic Interests (Form 700), disqualification from any decision an official has a financial interest in, and gift limits and gift reporting — no dollar limit is quoted here because it is adjusted over time; the municipal ethics code for lobbyist contact, misuse of position and the revolving door; the Ralph M. Brown Act (California Government Code section 54950 and following) for a recusal announced in the open meeting; Robert's Rules of Order as the body's adopted practice, where an abstention is not a recusal; SAMHSA's trauma-informed principles of safety and of trustworthiness and transparency for receiving a staff member's report; SEIU and AFSCME for the staff who raise concerns. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Ethics and Conflict of Interest",
  title: simTitle("Ethics and Conflict of Interest"),
  tagline: "Your first month in office in one room: interests disclosed, a gift valued and reported, a recusal done in public and sat out in full, a lobbyist logged, a job offer disclosed — and a staff member's concern heard rather than waved away",
  accent: ECI_ACCENT,
  accentCss: ECI_CSS,
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "clean-hands", name: "Clean Hands", note: "Every interest disclosed, every gift reported and every recusal done in the open, without being asked" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the ethics officer — whose job is to be asked, in confidence, before anything goes wrong",

  game: system({
    name: "Clear Conscience",
    currency: "INTEGRITY",
    ranks: ["New Appointee", "Commissioner", "Vice Chair", "Chair", "Ethics Mentor"],
    badges: [
      { id: "all-disclosed", name: "All Disclosed", note: "Every reportable interest found on the first read", test: AWARD.stepClean("read-your-interests") },
      { id: "nothing-taken", name: "Nothing Taken", note: "No unsafe action anywhere in the month", test: AWARD.safe },
      { id: "sat-it-out", name: "Sat It Out", note: "The recusal and the pressure both carried their full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-record", name: "Clean Record", note: "No corrections anywhere", test: AWARD.clean },
      { id: "fair-value", name: "Fair Value", note: "The gift valued inside the band", test: AWARD.precise(0.7) },
      { id: "revolving-door-seen", name: "Door Seen", note: "Every part of the job offer's problem found first time", test: AWARD.stepClean("spot-the-revolving-door") },
    ],
  }),

  hazards: {
    "applicant-tickets": "You accepted the concert tickets from the applicant whose permit your commission hears next month. A gift from somebody with business before you is the textbook conflict: reportable at best, disqualifying at worst, and the thing a reporter will ask about first if the permit is approved.",
    "favour-promise": "You told a campaign supporter you would \"take care of\" his permit. You cannot promise an outcome the commission has not voted on, and a public official promising a supporter a result is misuse of position under the ethics code — the promise alone is the problem, whether or not you keep it.",
    "lunch-with-two-members": "You set up lunch with two fellow commissioners to go over next week's item. Three of five is a majority of the commission; a majority discussing an item outside a noticed meeting is the serial meeting the open-meeting law forbids, however informal the sandwiches.",
    "wave-off-staffer": "You told the staff member not to make waves. She came to you with a concern that a contract was steered, which takes courage from somebody junior; brushing her off teaches her and every colleague she tells that reporting a problem here is the risk, not the problem itself.",
  },

  lateNotes: {
    "gift-card-item": "Log the gift once you have put an honest value on it — the register asks what it was worth.",
    "ethics-log-board": "The log closes once the job offer is disclosed and put in writing; there is still something to record.",
  },

  steps: [
    {
      id: "read-your-interests", kind: "find", noHint: true,
      targets: ["interest-rental-property", "interest-spouse-employer", "interest-consulting-client"],
      itemNames: {
        "interest-rental-property": "the rental unit you own in the city",
        "interest-spouse-employer": "your spouse's income from a firm that appears before the commission",
        "interest-consulting-client": "a consulting client from last year",
      },
      itemNotes: {
        "interest-rental-property": "Real property in the jurisdiction goes on the statement, and it is the interest most likely to touch a land-use item in front of you.",
        "interest-spouse-employer": "Your spouse's income is treated as partly yours. A firm that pays your household and appears before you is an interest to disclose and to watch for.",
        "interest-consulting-client": "A client who paid you in the last twelve months is a source of income on the statement, even though the work is finished.",
      },
      decoyNotes: {
        "interest-savings-account": "An ordinary savings account at a bank is generally not the kind of investment the statement asks about. Leave it; the three that matter are elsewhere on the sheet.",
      },
      title: "Read your own interests before anybody else does",
      cue: "Go through the worksheet. Mark every interest that belongs on the statement and could touch a decision in front of you.",
      why: "A conflict of interest is almost never discovered by the official who has it; it is discovered by a journalist, an opponent or an applicant who lost. Reading your own interests honestly on day one — the rental unit, the spouse's employer, last year's client — is how you know in advance which items you will have to step away from, rather than finding out in the newspaper after you voted.",
    },
    {
      id: "file-on-time", kind: "select", target: "form-700-card",
      title: "File the statement of economic interests on time",
      cue: "File your assuming-office Form 700 with every interest you found, before the deadline.",
      why: "The statement is a public document for a reason: it lets any resident check whether the people deciding their permits and contracts have a stake in them. Filing it complete and on time is the cheapest ethical act in public life, and filing it late or thin is the one most likely to be found — because it is a date and a document, and anybody can ask for both.",
    },
    {
      id: "value-the-gift", kind: "gauge", target: "gift-value-meter",
      title: "Put an honest value on the gift you were given",
      cue: "A neighbourhood nonprofit gave you a dinner ticket at its gala. Commit the fair value inside the band.",
      gauge: {
        label: "FAIR VALUE", speed: 0.62, green: [0.4, 0.58],
        readout: (t) => `$${Math.round(20 + t * 280)}`,
        missNote: "Not the fair value. Low-balling a gift to stay under a limit is the most common way small gifts become large problems. Value it at what it would cost you to buy.",
      },
      why: "Most gifts to officials are neither bribes nor nothing; they are ordinary things with a real value that has to be written down honestly. Valuing a gala ticket at what it would actually cost to buy, not at the cost of the meal inside it, is what keeps the gift register meaningful — and it is the habit that stops a string of small, undervalued gifts adding up to an obligation.",
    },
    {
      id: "log-the-gift", kind: "drag", target: "gift-card-item",
      title: "Report the gift in the register",
      cue: "Carry the gala ticket to the gift register so it is on the public record.",
      drag: {
        to: "gift-register-tray", radius: 0.5,
        missNote: "Not in the register. A reportable gift that is not reported is a problem whatever its value — put it on the record.",
      },
      why: "Reporting is what turns a gift from a private favour into a public fact. A ticket in the register can be seen, questioned and weighed by anybody; the same ticket in a desk drawer is the start of a story that ends badly. The act takes a minute and it is the whole difference between a gift that was accepted properly and one that was taken.",
    },
    {
      id: "turn-the-placard", kind: "turn", target: "nameplate",
      title: "Turn your nameplate to recused",
      cue: "The next item is your client's project. Turn your nameplate round so the room sees RECUSED before the item is called.",
      turn: { turns: 0.5, axis: "y", label: "NAMEPLATE" },
      why: "A recusal the public cannot see is a recusal nobody can trust. Turning the nameplate before the item is called makes the disqualification visible to the room and to the stream in a way that an entry in the minutes never is, and it signals to your colleagues that you will not be part of the discussion — including the part that happens at the break.",
    },
    {
      id: "recuse-in-public", kind: "sequence",
      targets: ["recuse-announce-interest", "recuse-leave-the-room", "recuse-clerk-records", "recuse-return-after-vote"],
      itemNames: {
        "recuse-announce-interest": "announce the interest, in plain words",
        "recuse-leave-the-room": "leave the room",
        "recuse-clerk-records": "the clerk records the recusal and its reason",
        "recuse-return-after-vote": "come back only after the vote",
      },
      title: "Recuse in public, in the right order",
      cue: "Announce the interest, leave the room, let the clerk record it, return only after the vote.",
      why: "Disqualification is a procedure, not a feeling. Saying the interest out loud before the item is heard tells the public exactly why you are stepping away; leaving the room removes your presence as well as your vote; the clerk's record makes it permanent; and returning only after the vote means you were never part of it. Staying in the seat and simply abstaining is a different thing, and it does not do the same job.",
      outOfOrderNote: "Announce, leave, record, return after the vote. Leaving before you announce why looks like avoidance; coming back before the vote puts you back in the decision.",
    },
    {
      id: "sit-out-the-item", kind: "hold", target: "hallway-marker", seconds: 8,
      title: "Stay out of the room for the whole item",
      cue: "Wait in the hallway until the vote is taken. Do not hover at the door.",
      why: "A recusal ends when the item ends, not when your part of it would have. Hovering at the door, catching a colleague's eye, or drifting back in for the closing comments all put you back in the decision without a vote. Waiting out of sight for the whole item, however long it runs, is what makes the disqualification real rather than ceremonial.",
      holdBreakNote: "You drifted back towards the door before the vote. Step back and wait it out — the item is not over.",
    },
    {
      id: "log-lobbyist-contact", kind: "select", target: "visitor-log",
      title: "Log the lobbyist's visit on your public calendar",
      cue: "A registered lobbyist met you this morning about a zoning item. Record who, when and on what.",
      why: "Meeting lobbyists is part of the job; hiding it is not. Recording the contact on the public calendar — who came, whom they represent, when, and on what item — lets residents see who is talking to the people deciding, which is the whole point of lobbyist rules. The entry protects the official too: it is the answer, already written, to the question of what that meeting was about.",
    },
    {
      id: "steady-under-pressure", kind: "track", target: "resolve-meter", seconds: 8,
      title: "Stay warm but firm with an old friend who wants a favour",
      cue: "A friend who donated to your campaign is on the phone asking for help. Keep your answer in the band.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "RESOLVE",
        readout: (v) => (v < 0.3 ? "giving way" : v > 0.7 ? "cold" : "warm and firm"),
      },
      why: "Pressure to do favours rarely arrives as a bribe; it arrives as a friend. The line has to be held continuously through the conversation: warm enough that the friendship survives, firm enough that no promise leaves your mouth. Slide towards giving way and a vague yes becomes a commitment; slide towards cold and you have lost a friend over something you could have explained kindly.",
      holdBreakNote: "The line slipped — you started to give way, or you went cold on him. Come back: you can be kind and still not promise anything.",
    },
    {
      id: "spot-the-revolving-door", kind: "find", noHint: true,
      targets: ["offer-from-vendor", "offer-timed-to-contract", "offer-keep-it-quiet"],
      itemNames: {
        "offer-from-vendor": "the job offer is from a firm with a contract before you",
        "offer-timed-to-contract": "it is timed to the week the contract is decided",
        "offer-keep-it-quiet": "it asks you to keep it quiet until then",
      },
      itemNotes: {
        "offer-from-vendor": "A firm that is asking the commission for a contract is offering you a job. That is a financial interest in the decision the moment you consider it.",
        "offer-timed-to-contract": "Start date the week after the award. The timing is the question it is really asking.",
        "offer-keep-it-quiet": "Any offer that asks for silence has told you exactly how it would look in daylight.",
      },
      decoyNotes: {
        "offer-unrelated-nonprofit": "An invitation to join the board of a nonprofit with no business before the commission is not the problem here. Note it and move on.",
      },
      title: "Read the job offer for what it is really asking",
      cue: "Open the email. Mark every part of it that makes it a conflict.",
      why: "The revolving door is the conflict officials most often talk themselves into, because a job offer feels like a compliment rather than a transaction. Read coldly, this one comes from a firm bidding on a contract in front of you, starts the week after the award and asks you to keep quiet until then. Each of those facts alone would need disclosing; together they are the question the ethics code exists to answer.",
    },
    {
      id: "disclose-the-offer", kind: "sequence", anyOrder: true,
      targets: ["tell-ethics-officer", "step-back-from-vendor", "put-it-in-writing"],
      itemNames: {
        "tell-ethics-officer": "tell the ethics officer today",
        "step-back-from-vendor": "step away from the firm's contract",
        "put-it-in-writing": "put the disclosure in writing",
      },
      title: "Disclose the offer the same day",
      cue: "Tell the ethics officer, step away from the firm's contract, and put it in writing.",
      why: "Taking the hard call and owning it here means acting before anybody asks. Telling the ethics officer the same day, stepping back from any decision on the firm's contract and putting the disclosure in writing turns a compromising email into a documented, handled matter. Waiting to see whether you want the job first is how officials end up explaining the timeline to an investigator.",
    },
    {
      id: "close-ethics-log", kind: "select", target: "ethics-log-board",
      title: "Record the month in your ethics log",
      cue: "Statement filed, gift reported, recusal made, lobbyist logged, offer disclosed — each with its date.",
      why: "An official's own ethics log is the running record that answers questions before they are asked. Each entry — filed, reported, recused, logged, disclosed — with its date is proof that the rules were followed at the time, not reconstructed later. It also makes the next month easier: the interests and the recusals it lists are the ones to watch for on every agenda.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the staff member who raised the concern",
      cue: "Two minutes: thank her, tell her what happens next, and make sure she knows she is protected.",
      why: "The person who reported a steered contract took a risk to do it, and how the first week afterwards goes decides whether anybody in the building reports anything again. Checking in — thanking her, saying plainly what happens next, confirming she is protected from retaliation and naming the support line if the stress stays with her — is part of handling the report, not an extra.",
    },
  ],

  interrupts: [
    {
      id: "applicant-in-hallway",
      kind: "Approached while recused",
      after: "sit-out-the-item", delay: 3, seconds: 12,
      alert: "The applicant for the item you are recused from has followed you into the hallway and wants to \"just clarify one thing\" about his project.",
      cue: "Decline and walk away: you are recused, and anything he wants to say belongs in the public record.",
      target: "walk-away-card",
      why: "A recused official who discusses the item with the applicant in the hallway has undone the recusal without casting a vote. Declining plainly, saying you are recused, and pointing him to the public record protects the decision your colleagues are making inside — and it protects the applicant too, whose approval would otherwise carry the question of what was said outside.",
      missNote: "You let him talk. Two minutes in the hallway about the project you are recused from, in front of a door with a window in it, and the approval your colleagues vote on inside now comes with a question nobody can answer.",
      wrongNote: "Staying in the hallway is right; talking to him is not. Decline, say you are recused, and walk away.",
    },
    {
      id: "staffer-knocks",
      kind: "A concern reported",
      after: "steady-under-pressure", delay: 3, seconds: 12,
      alert: "A junior staff member has knocked and is standing in the doorway: she thinks a colleague steered a contract to a friend's firm and does not know who else to tell.",
      cue: "Put the call down, bring her in, close the door and hear the report.",
      target: "hear-the-report-card",
      why: "A report of wrongdoing from a junior employee is the most valuable and most fragile thing an official receives. Ending the call, bringing her in and closing the door, then listening fully and saying plainly that she is protected from retaliation follows the trauma-informed principles of safety and of trust and transparency — and it is the only way the concern reaches the people who can investigate it.",
      missNote: "She waited in the doorway while you finished the call, then said it did not matter and left. The concern did not go away; it just stopped coming to you, and if the contract was steered, the one person who noticed has learned not to say so.",
      wrongNote: "The resolve meter is the friend on the phone. She needs you to end that call and hear her — now.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, ECI_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? ECI_ACCENT, { emissive: o.color ?? ECI_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? ECI_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#161226", accent: o.accent ?? ECI_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? ECI_CSS, w: o.w ?? 0.48 });
      if (id) reg(hits, plate, id);
      return plate;
    };
    const stand = (x, z, ry = 0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.19, 0.21, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.026, 0.026, 1.0, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(18,14,32,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? ECI_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f2effc";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#d2caf0";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? ECI_ACCENT, { rough: 0.5, emissive: o.accent ?? ECI_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the office and the hallway
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#4a4658", base2: "#403d4e", seam: "rgba(14,12,20,0.4)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 8.2, 0.02, 6.6, 0, 0.008, -0.5, 0x4a4658, { rough: 0.9, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.02, color: 0x5a566a });
    // A partition wall with a door between the hearing room and the hallway.
    const wallTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#8c8aa0", base2: "#807e94", seam: "rgba(40,38,52,0.3)",
    }), { repeat: 2, px: 320 });
    const partition = box(g, 0.12, 2.4, 3.0, 2.6, 1.2, -2.1, 0x8c8aa0, { rough: 0.8 });
    partition.material = texturedMat(wallTex, { rough: 0.8, metal: 0.02, color: 0x9c9ab0 });
    const doorPivot = group(g, 2.6, 0, -0.35);
    const door = box(doorPivot, 0.05, 2.05, 0.85, 0, 1.03, -0.43, 0x5a4a3a, { rough: 0.6 });
    box(doorPivot, 0.06, 0.4, 0.3, 0, 1.5, -0.43, 0x9fc4d8, { rough: 0.2, metal: 0.1 });       // window in the door
    void door;
    const hallMark = box(g, 1.1, 0.012, 1.4, 3.4, 0.02, -1.2, 0x9b8ad6, { rough: 0.8, emissive: 0x9b8ad6, ei: 0.2, cast: false });
    holoTag(g, "Hallway", 3.4, 0.2, -0.45, { css: ECI_CSS, w: 0.24 });
    void hallMark;

    // The hearing table with your nameplate.
    const table = group(g, -0.2, 0, -2.3);
    box(table, 3.0, 0.05, 0.7, 0, 0.78, 0, 0x5d4b3a, { rough: 0.55 });
    box(table, 2.9, 0.72, 0.05, 0, 0.4, 0.33, 0x4a3b2d, { rough: 0.7 });
    for (const cx of [-1.0, 0, 1.0]) box(table, 0.48, 0.8, 0.06, cx, 0.82, -0.62, 0x2f3540, { rough: 0.7 });
    const plate = group(table, 0, 0.84, 0.18);
    box(plate, 0.34, 0.1, 0.05, 0, 0, 0, 0x2a2440, { rough: 0.5 });
    const plateFace = decal(plate, 0.3, 0.07, 0, 0, 0.027, signFace("COMMISSIONER", { bg: "#1a1530", accent: ECI_CSS, scale: 0.5 }), { px: 192 });
    holoTag(table, "Your nameplate", 0, 1.1, 0.18, { css: ECI_CSS, w: 0.32 });
    reg(hits, plate.children[0], "nameplate");
    standingPerson(g, -1.2, -3.0, { cloth: 0x3c4a5c, hiVis: false });
    standingPerson(g, 0.9, -3.0, { cloth: 0x5c4a3c, hiVis: false });

    // The recusal ladder beside the table.
    const ladder = group(g, -2.3, 0, -1.3, 0.6);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["recuse-announce-interest", "1 · Announce the interest", 0.75], ["recuse-leave-the-room", "2 · Leave the room", 1.05],
      ["recuse-clerk-records", "3 · Clerk records it", 1.35], ["recuse-return-after-vote", "4 · Return after the vote", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, ECI_ACCENT, { emissive: ECI_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: ECI_CSS, w: 0.48 });
      reg(hits, b, lid);
    }

    // ------------------------------------------------------------ the desk: forms and the gift
    const desk = group(g, -0.9, 0, -0.4, 0.3);
    box(desk, 1.4, 0.05, 0.7, 0, 0.76, 0, 0x6b5a48, { rough: 0.55 });
    for (const sx of [-1, 1]) box(desk, 0.05, 0.74, 0.6, sx * 0.65, 0.37, 0, 0x55463a, { rough: 0.7 });
    // The worksheet, as a board above the desk, with its four lines.
    board(0.7, 0.36, -1.35, 1.95, -0.85, (cx, w, h) => lines(cx, w, h, "INTERESTS WORKSHEET", ["Tap every line that goes on the statement"]), { ry: 0.3 });
    const ws = group(g, -1.25, 0, -0.62, 0.3);
    for (const [iid, label, x, c] of [
      ["interest-rental-property", "Rental unit in the city", -0.45, ECI_ACCENT], ["interest-spouse-employer", "Spouse's employer", -0.05, ECI_ACCENT],
      ["interest-consulting-client", "Last year's client", 0.35, ECI_ACCENT], ["interest-savings-account", "Savings account", 0.75, 0x7fc4d8],
    ]) {
      const b = ball(ws, 0.024, x, 1.5, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(ws, label, x, 1.38, 0, { css: ECI_CSS, w: 0.38 });
      reg(hits, b, iid);
    }
    const form = decal(desk, 0.24, 0.32, -0.35, 0.79, 0, paperFace("FORM 700", ["Assuming office", "Real property · income", "Signed · dated"], { band: "#4a3a8a" }), { px: 192 });
    form.rotation.x = -Math.PI / 2;
    holoTag(desk, "Statement of economic interests", -0.35, 1.0, 0, { css: ECI_CSS, w: 0.6 });
    reg(hits, form, "form-700-card");
    const giftGrp = group(g, -0.5, 0.8, -0.35, 0.3);
    const giftTicket = decal(giftGrp, 0.2, 0.09, 0, 0, 0, signFace("GALA TICKET", { bg: "#f2e6cc", fg: "#3a2a5a", accent: ECI_CSS, scale: 0.44 }), { px: 128 });
    giftTicket.rotation.x = -Math.PI / 2.4;
    holoTag(giftGrp, "Gift: nonprofit gala ticket", 0, 0.18, 0, { css: ECI_CSS, w: 0.5 });
    reg(hits, giftTicket, "gift-card-item");

    // The gift register, on a lectern by the wall.
    const reg1 = group(g, -3.0, 0, 0.3, 1.1);
    box(reg1, 0.5, 1.0, 0.4, 0, 0.5, 0, 0x3a3450, { rough: 0.6 });
    const registerTray = box(reg1, 0.4, 0.03, 0.3, 0, 1.02, 0, 0x2a2440, { rough: 0.6 });
    holoTag(reg1, "Gift register — public", 0, 1.24, 0, { css: "#59c97b", w: 0.44 });
    reg(hits, registerTray, "gift-register-tray");

    // The gift-value meter and the resolve meter.
    const valStand = stand(-1.7, 0.6, 0.4);
    const valGauge = instrument(valStand, 0, 1.02, 0, { idle: "VALUE", color: ECI_ACCENT, w: 0.2, d: 0.26 });
    holoTag(valStand, "Fair value", 0, 1.22, 0, { css: ECI_CSS, w: 0.26 });
    reg(hits, valGauge, "gift-value-meter");
    const resStand = stand(0.9, 0.7, -0.4);
    const resGauge = instrument(resStand, 0, 1.02, 0, { idle: "RESOLVE", color: ECI_ACCENT, w: 0.2, d: 0.26 });
    holoTag(resStand, "Warm but firm", 0, 1.22, 0, { css: ECI_CSS, w: 0.32 });
    reg(hits, resGauge, "resolve-meter");
    // Desk phone, for the friend's call.
    const phone = group(g, 0.45, 0.8, -0.2);
    box(phone, 0.2, 0.05, 0.16, 0, 0, 0, 0x22262c, { rough: 0.5 });
    const handset = box(phone, 0.22, 0.04, 0.06, 0, 0.045, -0.04, 0x2e333a, { rough: 0.5 });
    void handset;

    // The visitor log and the hallway marker.
    const logBook = group(g, 1.6, 0, 0.2, -0.6);
    box(logBook, 0.45, 1.0, 0.35, 0, 0.5, 0, 0x3a3450, { rough: 0.6 });
    const book = decal(logBook, 0.3, 0.22, 0, 1.02, 0, paperFace("VISITOR LOG", ["Lobbyist · client · item", "Date · time"], { band: "#4a3a8a" }), { px: 192 });
    book.rotation.x = -Math.PI / 2.3;
    holoTag(logBook, "Public calendar", 0, 1.24, 0, { css: ECI_CSS, w: 0.32 });
    reg(hits, book, "visitor-log");
    bead(3.3, 1.45, -1.2, "hallway-marker", "Wait here — out of the room", { w: 0.52 });
    card(3.35, 1.3, -0.25, "walk-away-card", "\"I'm recused — it's in the record\"", "I'M RECUSED", { w: 0.6, ry: -1.4, accent: "#f2c14b", css: "#f2c14b" });

    // The revolving door: the job offer email.
    board(0.66, 0.4, 1.3, 2.0, -3.5, (cx, w, h) => lines(cx, w, h, "INBOX — JOB OFFER", ["Tap every part that makes it a conflict"]), {});
    const offer = group(g, 1.0, 0, -3.3);
    for (const [oid, label, y, c] of [
      ["offer-from-vendor", "From: firm bidding on your contract", 1.65, ECI_ACCENT], ["offer-timed-to-contract", "Start: week after the award", 1.45, ECI_ACCENT],
      ["offer-keep-it-quiet", "\"Let's keep this between us\"", 1.25, ECI_ACCENT], ["offer-unrelated-nonprofit", "Nonprofit board invitation", 1.05, 0x7fc4d8],
    ]) {
      const b = ball(offer, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(offer, label, 0.36, y, 0, { css: ECI_CSS, w: 0.62 });
      reg(hits, b, oid);
    }
    const disclose = group(g, 2.0, 0, 1.2, -0.9);
    cyl(disclose, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [did, label, y] of [["tell-ethics-officer", "Tell the ethics officer", 0.9], ["step-back-from-vendor", "Step away from that contract", 1.18], ["put-it-in-writing", "Put it in writing", 1.46]]) {
      const b = ball(disclose, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(disclose, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.52 });
      reg(hits, b, did);
    }

    // The staff member at the door, and the answer to her.
    const staffer = standingPerson(g, 3.9, 1.6, { ry: -2.2, cloth: 0x4a6a7a, hiVis: false });
    card(-0.2, 1.35, 0.9, "hear-the-report-card", "Bring her in · hear it", "COME IN.\nI'M LISTENING.", { w: 0.44, ry: 0, accent: "#f2c14b", css: "#f2c14b" });
    // The applicant, waiting by the hallway, who follows you out.
    const applicant = standingPerson(g, 3.9, -2.9, { ry: -0.6, cloth: 0x6a5a3a, hiVis: false });

    // ------------------------------------------------------------ the wrong moves
    const tickets = decal(g, 0.18, 0.08, 0.1, 0.815, -0.75, signFace("CONCERT ×2", { bg: "#f0ead8", fg: "#5a3a1a", accent: "#b0453a", scale: 0.42 }), { px: 128 });
    tickets.rotation.x = -Math.PI / 2;
    holoTag(g, "From the permit applicant?", 0.1, 0.98, -0.75, { css: "#f0645b", w: 0.5 });
    reg(hits, tickets, "applicant-tickets");
    card(-2.2, 1.25, 1.1, "favour-promise", "\"I'll take care of it\"?", "I'LL TAKE\nCARE OF IT", {
      w: 0.46, ry: 0.6, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(-3.1, 1.1, -2.0, "lunch-with-two-members", "Lunch with two commissioners?", { color: 0xf0645b, css: "#f0645b", w: 0.56 });
    bead(1.4, 1.2, 1.2, "wave-off-staffer", "\"Don't make waves\"", { color: 0xf0645b, css: "#f0645b", w: 0.4 });

    // Closing boards.
    const logBoard = board(0.56, 0.38, 2.3, 2.0, 2.1, (cx, w, h) => lines(cx, w, h, "ETHICS LOG", ["Filed · reported · recused", "Logged · disclosed"]), { ry: -0.6 });
    reg(hits, logBoard.userData.face, "ethics-log-board");
    const checkin = board(0.5, 0.34, -1.4, 1.9, 1.8, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["Thank her · what happens next", "Protected from retaliation"], { accent: "#7fc4d8" }), { ry: 0.5, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, -1.4, 2.5, -3.2, (cx, w, h) => lines(cx, w, h, "BEFORE ANYONE ASKS", ["Disclose it first."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the ethics officer
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const officer = standingFigure(g, -2.4, -0.2, { ry: 2.2, cloth: 0x2f3946, trousers: 0x262d36 });
    holoTag(officer, "Ethics officer", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.32 }).rotation.y = -2.2;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.4, 1.2, -1.6),

      onStepComplete(step) {
        if (step.id === "log-the-gift") {
          giftGrp.position.set(-3.0, 1.06, 0.3);
          giftGrp.rotation.y = 1.1;
          registerTray.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.4 });
        }
        if (step.id === "turn-the-placard") {
          repaint(plateFace, signFace("RECUSED", { bg: "#2a1416", accent: "#f2c14b", scale: 0.55 }));
        }
        if (step.id === "recuse-in-public") doorPivot.rotation.y = -1.2;
        if (step.id === "log-lobbyist-contact") doorPivot.rotation.y = 0;
        if (step.id === "close-ethics-log") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "MONTH LOGGED", ["Every entry dated", "Nothing left to explain"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "wave-off-staffer" || id === "favour-promise") {
          staffer.root.rotation.y = 0.6;
          staffer.head.rotation.y = 0.4;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. Reporting a problem should never be the risky part.");
        }
      },

      onInterrupt(it) {
        if (it.id === "applicant-in-hallway") {
          applicant.root.position.set(3.25, 0, -1.9);
          applicant.root.rotation.y = 0.2;
          applicant.arms[1].shoulder.rotation.x = -0.9;
        }
        if (it.id === "staffer-knocks") {
          staffer.root.position.set(2.9, 0, 0.6);
          staffer.root.rotation.y = -2.0;
          doorPivot.rotation.y = -1.2;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "applicant-in-hallway") {
          applicant.root.position.set(3.9, 0, -2.9);
          applicant.root.rotation.y = -0.6;
          applicant.arms[1].shoulder.rotation.x = 0;
        }
        if (it.id === "staffer-knocks") {
          staffer.root.position.set(1.2, 0, 1.9);
          staffer.root.rotation.y = -2.6;
          doorPivot.rotation.y = 0;
        }
      },

      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "value-the-gift") {
          const ok = gg.t >= 0.4 && gg.t <= 0.58;
          repaint(valGauge.userData.screen, signFace(`$${Math.round(20 + gg.t * 280)}`, {
            bg: "#161226", accent: ok ? "#59c97b" : "#f0645b", fg: "#ece8fb", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "steady-under-pressure" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(resGauge.userData.screen, signFace(ok ? "WARM · FIRM" : tr.v < 0.3 ? "GIVING WAY" : "COLD", {
            bg: "#161226", accent: ok ? "#59c97b" : "#f0645b", fg: "#ece8fb", scale: 0.5,
          }));
        }
      },
    };
  },
};
