import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Conflict Mediation Room VR — Civic Leadership and Emotional
// Intelligence, station eight.
//
// The city's community mediation programme, a small quiet room, and two
// neighbours who have not spoken civilly in months: a widow who keeps the
// vegetable garden her late husband planted beside her house, and a young
// food-truck owner whose truck parks next to it every day with its generator
// running. The complaint on file is about noise and fumes. The dispute is
// about a garden and a livelihood. The learner mediates.
//
// The principles it practises — know the interest behind the position, listen
// first, bring people in rather than shut them out — are principles commonly
// taught in civic-leadership programmes; the foundation whose principles the
// module draws on is not sourced in this repository. Both parties and the
// street are invented, and nothing here describes any real programme's rules
// beyond what the station states generically.

const CMR_ACCENT = 0x6fb0c8;
const CMR_CSS = "#6fb0c8";

export const SIM_CONFLICT_MEDIATION_ROOM = {
  id: "conflict-mediation-room",
  index: "224",
  domain: "Civic",
  trade: "Community mediator",
  category: "Community Environmental Justice",
  indoor: "clinic",
  weather: "overcast",
  certification: "SAMHSA's trauma-informed care principles of safety, trustworthiness and transparency, and empowerment, voice and choice, for two parties who each feel unheard; Psychological First Aid (NCTSN) for a party who is overwhelmed mid-session; Title II of the ADA for an interpreter and any accommodation a party asks for in a city-run programme; the municipal ethics code for a mediator's duty to disclose a connection to a party and to refuse gifts; SEIU and AFSCME for the public-service staff who run community mediation programmes. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Conflict Mediation Room",
  title: simTitle("Conflict Mediation Room"),
  tagline: "A garden, a food truck and two neighbours who stopped talking months ago: your own connection disclosed, the rules said out loud, each side heard whole, the blame taken out of the complaint, the power kept level — and an agreement written in their words, not yours",
  accent: CMR_ACCENT,
  accentCss: CMR_CSS,
  parSeconds: 330,
  footprint: 2.3,
  badge: { id: "both-heard", name: "Both Heard", note: "A whole mediation run level: neither side favoured, nothing promised, and an agreement both parties wrote" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your programme's employee assistance line, or the co-mediator you debrief with — holding two people's anger for two hours is real work",

  game: system({
    name: "Level Table",
    currency: "ACCORD",
    ranks: ["Observer", "Co-Mediator", "Mediator", "Lead Mediator", "Mediation Mentor"],
    badges: [
      { id: "room-ready", name: "Room Ready", note: "Every part of the room set level before the parties arrived", test: AWARD.stepClean("prepare-the-room") },
      { id: "no-sides", name: "No Sides", note: "No unsafe action anywhere in the mediation", test: AWARD.safe },
      { id: "options-found", name: "Options Found", note: "Every option that meets both interests found first time", test: AWARD.stepClean("options-that-meet-both") },
    ],
    challenges: [
      { id: "clean-session", name: "Clean Session", note: "No corrections anywhere in the session", test: AWARD.clean },
      { id: "honest-reality", name: "Honest Reality", note: "The cost of no agreement read inside the band", test: AWARD.precise(0.7) },
      { id: "level-held", name: "Level Held", note: "The listening and the balance both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "take-her-side": "You told her she is obviously in the right. The truck owner heard a mediator pick a side in the first half hour, and from here on everything you say to him sounds like her lawyer talking — the one thing a mediator has to offer both people is that neither can say that.",
    "promise-enforcement": "You told her the city will ticket the truck if he does not agree. A mediator cannot promise enforcement, the city may not have grounds to issue one, and a threat dressed as a promise turns a voluntary process into pressure he will rightly resent.",
    "hallway-with-one-party": "You slipped out to talk to her in the hallway without telling him. A private session is a recognised tool when both parties know it is happening and why; a quiet word with one side behind the other's back is how a mediator loses the trust of the person left in the room.",
    "accept-thank-you-gift": "You accepted the jar of preserves and the gift card she pressed on you before any agreement. A gift from a party while the mediation is open is exactly what the ethics code tells a city mediator to refuse, and he watched it change hands.",
  },

  lateNotes: {
    "shared-concern-card": "The shared concern goes in the middle once each side's complaint has been heard and reframed — not before.",
    "mediation-log-board": "The log closes once the agreement is drafted in their words. There is nothing to record yet.",
  },

  steps: [
    {
      id: "prepare-the-room", kind: "find", noHint: true,
      targets: ["room-two-exits", "room-matching-chairs", "room-interpreter-booked"],
      itemNames: {
        "room-two-exits": "two ways out, so nobody has to pass the other to leave",
        "room-matching-chairs": "matching chairs at the same height",
        "room-interpreter-booked": "the interpreter he asked for, confirmed",
      },
      itemNotes: {
        "room-two-exits": "Either of them may need to step out. Two exits mean nobody is trapped and nobody has to walk past the person they are angry with.",
        "room-matching-chairs": "The same chair at the same height for both, on opposite sides at equal distance from you. The room itself must not choose a side.",
        "room-interpreter-booked": "He asked for an interpreter. Without one, the mediation is in her first language and not his — which is a side.",
      },
      decoyNotes: {
        "room-mediator-certificate": "Your framed certificate is not preparation. It can stay on the wall or come down; it will not change what happens at the table.",
      },
      title: "Set the room up so it takes no side",
      cue: "Before they arrive, check the three things that make this room equal for both of them.",
      why: "Two people in conflict read everything about a room for signs of who it favours: whose chair is bigger, who sits nearer the door, whose language the conversation will be in. Two exits, matching chairs at equal distance and a confirmed interpreter tell both parties before a word is spoken that the process is level. Getting it wrong costs trust that the mediator then spends the first hour trying to win back.",
    },
    {
      id: "disclose-your-connection", kind: "select", target: "disclosure-card",
      title: "Disclose your connection to one of the parties",
      cue: "\"Before we start: I know her slightly from the community garden network. If either of you would rather have a different mediator, say so now.\"",
      why: "A mediator who knows one party and says nothing has handed the other a reason to reject every outcome the moment he finds out — and in a neighbourhood, he will. Disclosing the connection plainly, before anything else, and offering either party the chance to ask for somebody else turns a hidden conflict into an open choice, which is what the ethics code asks and what trust requires.",
    },
    {
      id: "turn-on-the-masker", kind: "turn", target: "sound-masker-dial",
      title: "Turn the sound masker on outside the door",
      cue: "Turn the dial so the waiting area cannot hear what is said in here.",
      turn: { turns: 0.5, axis: "y", label: "SOUND MASKER" },
      why: "Confidentiality is only real if it is physical. A mediation room whose voices carry into the waiting area makes both parties guard every sentence, and the things they most need to say — the grief, the money worry — are exactly the things they will not say if they think the next appointment can hear. The masker is a small switch that makes the promise of confidentiality true.",
    },
    {
      id: "opening-statement", kind: "sequence",
      targets: ["open-my-role", "open-confidential", "open-ground-rules", "open-voluntary"],
      itemNames: {
        "open-my-role": "my role: I don't decide, you do",
        "open-confidential": "what stays in this room, and its limits",
        "open-ground-rules": "one speaker at a time, no names called",
        "open-voluntary": "either of you can stop at any time",
      },
      title: "Give the opening statement in order",
      cue: "Your role, confidentiality and its limits, the ground rules, and that it is voluntary.",
      why: "The opening tells both parties what kind of room they are in. Saying first that the mediator decides nothing puts the outcome in their hands; confidentiality with its honest limits comes next so they know what is safe to say; then the ground rules they will be held to; and last that either can stop at any time, because an agreement is only worth anything if both parties could have walked away from it.",
      outOfOrderNote: "Role, confidentiality, ground rules, voluntary. Starting with the rules before they know you will not decide sounds like a hearing, not a mediation.",
    },
    {
      id: "hear-her-whole", kind: "hold", target: "listen-bead", seconds: 8,
      title: "Hear the first party without interruption",
      cue: "Hold your attention on her. No questions, no summarising, no glance at him.",
      why: "The person who speaks first has usually been waiting months for somebody to hear the whole thing. Listening without interrupting — not to clarify, not to summarise, not to check how he is reacting — lets her say it all, including the part she did not plan to say. That unplanned part is usually where the real dispute is, and it only surfaces if she believes she will be allowed to finish.",
      holdBreakNote: "You glanced at him while she was speaking, and she saw it. Come back to her until she is finished.",
    },
    {
      id: "reframe-the-complaint", kind: "sequence",
      targets: ["reframe-hear-accusation", "reframe-strip-blame", "reframe-name-need", "reframe-turn-forward"],
      itemNames: {
        "reframe-hear-accusation": "hear the accusation as she said it",
        "reframe-strip-blame": "take the blame words out",
        "reframe-name-need": "name the need underneath",
        "reframe-turn-forward": "turn it towards the future",
      },
      title: "Reframe her complaint so he can hear it",
      cue: "Hear the accusation, strip the blame, name the need, then turn it forward.",
      why: "\"He poisons my garden with that filthy generator\" is a position he can only defend against. \"You need the air around the garden to be clean enough to grow food, especially in the afternoons\" is an interest he can respond to. Reframing takes the blame out without taking the substance out, and it has to go in order: hear the words first, or the reframe sounds like the mediator editing her.",
      outOfOrderNote: "Hear it, strip the blame, name the need, turn it forward. Naming her need before you have heard her words sounds like you decided what she meant.",
    },
    {
      id: "move-to-common-ground", kind: "drag", target: "shared-concern-card",
      title: "Put the shared concern in the middle of the table",
      cue: "Both of them want the street to stay somewhere they can make a living and a life. Carry that card to the centre.",
      drag: {
        to: "table-centre", radius: 0.5,
        missNote: "Not in the centre. A concern both parties share belongs where both can reach it — in the middle of the table, not on either side.",
      },
      why: "Most disputes have more shared ground than either party believes. She wants her garden to thrive; he wants his business to survive; both want to keep living and working on this street without a war. Putting that shared concern physically in the middle of the table gives the rest of the conversation something both of them are facing together rather than across.",
    },
    {
      id: "reality-test", kind: "gauge", target: "no-deal-meter",
      title: "Reality-test what happens if there is no agreement",
      cue: "Commit an honest read of the cost of no deal — neither frightening them into it nor pretending it is nothing.",
      gauge: {
        label: "NO-DEAL COST", speed: 0.6, green: [0.4, 0.6],
        readout: (t) => (t < 0.4 ? "minimised" : t <= 0.6 ? "honest" : "scare tactic"),
        missNote: "Not honest. Pretending there is no cost to walking away wastes the session; overstating it is pressure. Say plainly what each of them faces without an agreement.",
      },
      why: "People settle when an agreement is better than the alternative, and they can only judge that if the alternative is described honestly. Without a deal, the complaint goes back into the city's slow enforcement process and the two of them keep living side by side in a feud. Saying that plainly — without minimising it and without turning it into a threat — lets each party make a real choice.",
    },
    {
      id: "balance-the-voices", kind: "track", target: "balance-meter", seconds: 8,
      title: "Keep the power in the room level",
      cue: "He is quieter and she is dominating. Keep the balance inside the band — draw him in without silencing her.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "BALANCE",
        readout: (v) => (v < 0.3 ? "she dominates" : v > 0.7 ? "she's silenced" : "level"),
      },
      why: "Power is never equal between two parties: one is older, one is more fluent, one has lived on the street longer. A mediator keeps it level continuously — an open question to the quieter party, a gentle hold on the louder one, equal time and equal eye contact — because an agreement reached by the more powerful party talking the other into it will not survive the first bad week.",
      holdBreakNote: "The balance slipped — one of them took over the room. Bring it back: an open question to whoever has gone quiet.",
    },
    {
      id: "options-that-meet-both", kind: "find", noHint: true,
      targets: ["option-afternoon-schedule", "option-shore-power", "option-trial-month"],
      itemNames: {
        "option-afternoon-schedule": "the truck moves to the corner spot in the afternoons",
        "option-shore-power": "a shared outlet so the generator stays off",
        "option-trial-month": "a one-month trial, then meet again",
      },
      itemNotes: {
        "option-afternoon-schedule": "He keeps the lunchtime trade where his customers are; she gets clean air in the afternoons when she is in the garden.",
        "option-shore-power": "Power from her side of the fence for a monthly fee: no fumes for her, lower fuel costs for him.",
        "option-trial-month": "A trial makes it low-risk for both, and a date to meet again keeps the conversation going.",
      },
      decoyNotes: {
        "option-city-orders-it": "\"The city orders him off the street\" is not an option either party can agree to — it is an outcome imposed from outside, and not one the mediator can deliver.",
      },
      title: "Find the options that meet both interests",
      cue: "Look at the options board. Mark every option that serves her garden and his livelihood at once.",
      why: "Once interests are on the table, options appear that neither position allowed. A schedule that keeps his lunchtime trade and her afternoon air, a shared power outlet that silences the generator, and a one-month trial that makes both low-risk were invisible while the argument was about whether the truck could park there at all. Finding them together is the point of knowing the interest behind the position.",
    },
    {
      id: "write-it-in-their-words", kind: "sequence", anyOrder: true,
      targets: ["draft-who-does-what", "draft-by-when", "draft-if-it-slips"],
      itemNames: {
        "draft-who-does-what": "who does what, in their own words",
        "draft-by-when": "by when",
        "draft-if-it-slips": "what happens if it slips",
      },
      title: "Draft the agreement in their words",
      cue: "Who does what, by when, and what they will do if it slips — written the way they said it.",
      why: "An agreement written in the mediator's language belongs to the mediator. Written in the parties' own words — who moves the truck when, who fits the outlet by which date, and what they will do if one of them slips — it belongs to them, and they are far more likely to keep it. The clause about slipping matters most: it turns the first missed day into a phone call instead of a new complaint.",
    },
    {
      id: "close-mediation-log", kind: "select", target: "mediation-log-board",
      title: "Log the outcome without the confidential detail",
      cue: "Record that an agreement was reached, the trial date and the follow-up — nothing either party said in confidence.",
      why: "The programme needs to know that a mediation happened and how it ended, so the complaint can be closed and the follow-up scheduled; it does not need, and must not get, what either party said inside the room. Logging the outcome, the trial month and the follow-up date — and nothing else — keeps the confidentiality promise made in the opening and keeps the programme's record honest.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with your co-mediator",
      cue: "Two minutes after they leave: how did that land on each of you, and did either of you take a side without meaning to?",
      why: "Mediation asks the mediator to absorb two people's anger and grief while showing neither, and it lands afterwards. A short check-in with the co-mediator — how did it land, did either of us lean without meaning to, the employee assistance line if it stays — is peer support and quality control at once, and it is what keeps a mediator level for the next pair who walk in.",
    },
  ],

  interrupts: [
    {
      id: "recording-attempt",
      kind: "Confidentiality broken",
      after: "hear-her-whole", delay: 3, seconds: 12,
      alert: "While she is speaking, the truck owner has taken out his phone, pointed it at her, and started recording.",
      cue: "Pause and restate the recording rule from the opening — calmly, to both of them.",
      target: "recording-rule-card",
      why: "A recording breaks the confidentiality both parties agreed to and makes her guard every word from now on. Pausing, restating the rule from the opening to both of them rather than scolding him, and asking him to put the phone away treats it as a process matter rather than a moral failing — which keeps him in the room and keeps the room safe for her.",
      missNote: "She noticed the phone and stopped mid-sentence. The rest of the session happened on the record as far as she was concerned, and she said nothing that mattered for the next hour.",
      wrongNote: "Not by listening harder to her — the phone is the problem. Pause and restate the recording rule to both of them.",
    },
    {
      id: "party-overwhelmed",
      kind: "Party overwhelmed",
      after: "balance-the-voices", delay: 3, seconds: 12,
      alert: "She has stopped mid-sentence and started to cry: the garden was her husband's, and she has not said that out loud to anybody since he died.",
      cue: "Offer a break — water, a quiet minute, the option to step out. Do not push past it.",
      target: "offer-a-break-card",
      why: "This is the interest underneath the whole dispute, and it has arrived as grief. Psychological First Aid says slow down: offer a break, water and the choice to step out, and let her decide when to go on. He hears, often for the first time, what the garden actually means — which frequently does more for the agreement than anything the mediator says.",
      missNote: "You pressed on to the options while she was still crying. She agreed to nothing, left early, and the one thing that could have changed his mind — why the garden matters — was lost in the rush.",
      wrongNote: "The balance meter is for the conversation. She needs a pause, not a rebalance — offer the break.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, CMR_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? CMR_ACCENT, { emissive: o.color ?? CMR_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CMR_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0b1a20", accent: o.accent ?? CMR_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? CMR_CSS, w: o.w ?? 0.48 });
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
      box(c, 0.48, 0.06, 0.46, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.48, 0.52, 0.05, 0, 0.75, -0.21, color, { rough: 0.7 });
      cyl(c, 0.03, 0.05, 0.44, 0, 0.22, 0, 0x2a2d31, { rough: 0.5, metal: 0.6, seg: 8 });
      return c;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(8,20,26,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? CMR_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#e9f7fc";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#bfe0ec";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? CMR_ACCENT, { rough: 0.5, emissive: o.accent ?? CMR_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the room
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 8, base: "#9aa6ac", base2: "#8e9aa0", seam: "rgba(40,48,52,0.3)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 7.6, 0.02, 6.2, 0, 0.01, -0.4, 0x9aa6ac, { rough: 0.8, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xa6b2b8 });
    const rugTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#4a6a74", base2: "#42606a", seam: "rgba(20,30,34,0.3)",
    }), { repeat: 2, px: 256 });
    const rug = cyl(g, 1.7, 1.7, 0.012, 0, 0.024, -1.1, 0x4a6a74, { rough: 0.95, seg: 32, cast: false });
    rug.material = texturedMat(rugTex, { rough: 0.95, metal: 0.02, color: 0x5a7a84 });

    // The round table, with the centre socket.
    const tableTop = cyl(g, 0.8, 0.8, 0.05, 0, 0.74, -1.1, 0xd8d0c0, { rough: 0.5, seg: 32 });
    void tableTop;
    cyl(g, 0.1, 0.28, 0.72, 0, 0.36, -1.1, 0x5a5a5a, { rough: 0.5, metal: 0.4, seg: 14 });
    const centre = cyl(g, 0.22, 0.22, 0.012, 0, 0.775, -1.1, 0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.3, seg: 24 });
    holoTag(g, "Middle of the table", 0, 1.0, -1.1, { css: "#59c97b", w: 0.36 });
    reg(hits, centre, "table-centre");
    const tissues = box(g, 0.16, 0.08, 0.1, -0.35, 0.8, -1.35, 0xf2f2f2, { rough: 0.8 });
    void tissues;
    const water = cyl(g, 0.04, 0.04, 0.16, 0.35, 0.85, -1.35, 0x9fd0e8, { rough: 0.1, metal: 0.1, seg: 12, opacity: 0.6, transparent: true });
    void water;

    // The two parties, in matching chairs on opposite sides.
    const chairA = chair(-1.15, -1.1, Math.PI / 2, 0x4a5a64);
    const widow = seatedFigure(g, -1.15, 0.49, -1.1, { ry: Math.PI / 2, cloth: 0x6a4a5a });
    holoTag(widow.torso, "Neighbour — the garden", 0, 1.38, 0.1, { css: CMR_CSS, w: 0.46 }).rotation.y = -Math.PI / 2;
    holoTag(chairA, "Matching chairs, same height", 0, 0.3, 0.3, { css: CMR_CSS, w: 0.5 });
    reg(hits, chairA.children[0], "room-matching-chairs");
    chair(1.15, -1.1, -Math.PI / 2, 0x4a5a64);
    const owner = seatedFigure(g, 1.15, 0.49, -1.1, { ry: -Math.PI / 2, cloth: 0x3a5a3a });
    holoTag(owner.torso, "Neighbour — the food truck", 0, 1.38, 0.1, { css: CMR_CSS, w: 0.5 }).rotation.y = Math.PI / 2;
    const ownerPhone = box(g, 0.07, 0.13, 0.01, 0.85, 1.05, -1.15, 0x1b1f24, { rough: 0.4, emissive: 0x7fc4d8, ei: 0.6 });
    ownerPhone.visible = false;
    // The mediator's chair at the far side, and the interpreter beside him.
    chair(0, -2.1, 0, 0x5a6a74);
    const interp = seatedFigure(g, 1.2, 0.49, -2.0, { ry: -0.6, cloth: 0x2a2e33 });
    holoTag(interp.torso, "Interpreter — confirmed", 0, 1.38, 0.1, { css: CMR_CSS, w: 0.46 }).rotation.y = 0.6;
    chair(1.2, -2.0, -0.6, 0x4a5a64);
    reg(hits, interp.torso, "room-interpreter-booked");

    // Two doors, one at each side.
    for (const [dx, id] of [[-3.3, "room-two-exits"], [3.3, null]]) {
      const d = group(g, dx, 0, -2.6, dx < 0 ? Math.PI / 2 : -Math.PI / 2);
      box(d, 0.95, 2.05, 0.06, 0, 1.03, 0, 0x6a5a4a, { rough: 0.6 });
      const sign = decal(d, 0.3, 0.12, 0, 2.2, 0.04, signFace("EXIT", { bg: "#0c3a1c", accent: "#59c97b", scale: 0.6 }), { px: 128, glow: true, ei: 0.8 });
      if (id) { holoTag(d, "Two ways out", 0, 2.42, 0.05, { css: CMR_CSS, w: 0.28 }); reg(hits, sign, id); }
    }
    const cert = decal(g, 0.36, 0.28, -1.8, 1.7, -3.3, paperFace("MEDIATOR", ["Certificate of training"], { band: "#2f5a6a" }), { px: 192 });
    reg(hits, cert, "room-mediator-certificate");

    // The sound masker by the door.
    const masker = group(g, -2.9, 0, -1.3, 1.2);
    box(masker, 0.4, 0.9, 0.3, 0, 0.45, 0, 0x3a4650, { rough: 0.6 });
    const maskKnob = cyl(masker, 0.035, 0.035, 0.035, 0, 0.93, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(masker, "Sound masker — waiting room", 0, 1.12, 0, { css: CMR_CSS, w: 0.52 });
    reg(hits, maskKnob, "sound-masker-dial");
    const maskLamp = ball(masker, 0.016, 0.12, 0.93, 0.08, 0x2a3a3a, { rough: 0.4, seg: 8 });

    card(-0.75, 1.4, -0.3, "disclosure-card", "Disclose your connection", "I KNOW HER\nSLIGHTLY", { w: 0.44, ry: 0.3 });
    bead(-0.5, 1.5, -0.55, "listen-bead", "Hear her whole", { w: 0.32 });
    card(0.75, 1.4, -0.3, "recording-rule-card", "Restate the recording rule", "NO RECORDING", { w: 0.5, ry: -0.3, accent: "#f2c14b", css: "#f2c14b" });
    card(-1.6, 1.3, 0.35, "offer-a-break-card", "Offer a break", "TAKE A MINUTE", { w: 0.3, ry: 0.6, accent: "#f2c14b", css: "#f2c14b" });

    // The opening ladder and the reframe ladder.
    const opening = group(g, -2.3, 0, -0.5, 0.6);
    cyl(opening, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["open-my-role", "1 · I don't decide — you do", 0.75], ["open-confidential", "2 · Confidential, and its limits", 1.05],
      ["open-ground-rules", "3 · One voice, no names", 1.35], ["open-voluntary", "4 · Either can stop", 1.65],
    ]) {
      const b = ball(opening, 0.026, 0, y, 0, CMR_ACCENT, { emissive: CMR_ACCENT, ei: 1.5, seg: 12 });
      holoTag(opening, label, 0.2, y, 0, { css: CMR_CSS, w: 0.52 });
      reg(hits, b, lid);
    }
    const reframe = group(g, 2.3, 0, -0.5, -0.6);
    cyl(reframe, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["reframe-hear-accusation", "1 · Hear her words", 0.75], ["reframe-strip-blame", "2 · Take the blame out", 1.05],
      ["reframe-name-need", "3 · Name the need", 1.35], ["reframe-turn-forward", "4 · Turn it forward", 1.65],
    ]) {
      const b = ball(reframe, 0.026, 0, y, 0, CMR_ACCENT, { emissive: CMR_ACCENT, ei: 1.5, seg: 12 });
      holoTag(reframe, label, 0.2, y, 0, { css: CMR_CSS, w: 0.42 });
      reg(hits, b, lid);
    }

    // The shared-concern card, waiting on a side table.
    const side = group(g, -1.9, 0, 0.9);
    box(side, 0.5, 0.05, 0.4, 0, 0.7, 0, 0xd8d0c0, { rough: 0.5 });
    cyl(side, 0.03, 0.03, 0.68, 0, 0.34, 0, 0x5a5a5a, { rough: 0.5, metal: 0.4, seg: 8 });
    const concernGrp = group(g, -1.9, 0.76, 0.9);
    const concern = decal(concernGrp, 0.28, 0.16, 0, 0, 0, signFace("A STREET WE\nCAN BOTH LIVE ON", { bg: "#e8f0f2", fg: "#1a3a44", accent: CMR_CSS, scale: 0.32 }), { px: 192 });
    concern.rotation.x = -Math.PI / 2.3;
    holoTag(concernGrp, "What they both want", 0, 0.18, 0, { css: CMR_CSS, w: 0.4 });
    reg(hits, concern, "shared-concern-card");

    // Reality and balance meters.
    const realStand = stand(1.8, 0.7, -0.4);
    const realGauge = instrument(realStand, 0, 1.02, 0, { idle: "NO DEAL", color: CMR_ACCENT, w: 0.2, d: 0.26 });
    holoTag(realStand, "Cost of no agreement", 0, 1.22, 0, { css: CMR_CSS, w: 0.44 });
    reg(hits, realGauge, "no-deal-meter");
    const balStand = stand(-0.9, 0.95, 0.3);
    const balGauge = instrument(balStand, 0, 1.02, 0, { idle: "LEVEL", color: CMR_ACCENT, w: 0.2, d: 0.26 });
    holoTag(balStand, "Balance of voices", 0, 1.22, 0, { css: CMR_CSS, w: 0.38 });
    reg(hits, balGauge, "balance-meter");

    // The options board.
    board(0.72, 0.4, 0.9, 2.0, -3.3, (cx, w, h) => lines(cx, w, h, "OPTIONS", ["Tap every one that meets both interests"]), {});
    const opts = group(g, 0.55, 0, -3.15);
    for (const [oid, label, y, c] of [
      ["option-afternoon-schedule", "Corner spot in the afternoons", 1.62, CMR_ACCENT], ["option-shore-power", "Shared outlet — generator off", 1.42, CMR_ACCENT],
      ["option-trial-month", "One-month trial, then meet", 1.22, CMR_ACCENT], ["option-city-orders-it", "The city orders him off", 1.02, 0x7fc4d8],
    ]) {
      const b = ball(opts, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(opts, label, 0.34, y, 0, { css: CMR_CSS, w: 0.58 });
      reg(hits, b, oid);
    }
    const draft = group(g, 2.4, 0, 1.0, -0.9);
    cyl(draft, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [did, label, y] of [["draft-who-does-what", "Who does what", 0.9], ["draft-by-when", "By when", 1.18], ["draft-if-it-slips", "If it slips", 1.46]]) {
      const b = ball(draft, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(draft, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.32 });
      reg(hits, b, did);
    }

    // ------------------------------------------------------------ the wrong moves
    bead(-0.9, 1.25, -0.2, "take-her-side", "\"You're clearly right\"", { color: 0xf0645b, css: "#f0645b", w: 0.44 });
    card(0.3, 1.25, 0.9, "promise-enforcement", "Promise the city tickets him?", "THE CITY WILL\nTICKET HIM", {
      w: 0.56, ry: -0.1, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(-3.0, 1.2, -2.2, "hallway-with-one-party", "A word with her in the hall?", { color: 0xf0645b, css: "#f0645b", w: 0.52 });
    const jar = cyl(g, 0.05, 0.05, 0.1, -0.55, 0.82, -0.85, 0xc0503a, { rough: 0.3, seg: 12 });
    holoTag(g, "Her gift — preserves and a card?", -0.55, 1.0, -0.85, { css: "#f0645b", w: 0.56 });
    reg(hits, jar, "accept-thank-you-gift");

    // Closing boards.
    const logBoard = board(0.56, 0.38, 1.6, 1.9, 1.9, (cx, w, h) => lines(cx, w, h, "MEDIATION LOG", ["Outcome only — nothing confidential", "Trial month · follow-up date"]), { ry: -0.5 });
    reg(hits, logBoard.userData.face, "mediation-log-board");
    const checkin = board(0.5, 0.34, -1.1, 1.9, 1.95, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that land?", "Did either of us lean?"], { accent: "#7fc4d8" }), { ry: 0.4, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, -0.8, 2.45, -3.3, (cx, w, h) => lines(cx, w, h, "BOTH OF THEM", ["Neither side is yours."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the co-mediator
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const coMediator = standingFigure(g, -2.2, 0.15, { ry: 2.09, cloth: 0x2f4650, trousers: 0x262d36 });
    holoTag(coMediator, "Co-mediator", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.28 }).rotation.y = -2.09;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.0, -1.2),

      onStepComplete(step) {
        if (step.id === "turn-on-the-masker") {
          maskLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2, rough: 0.4 });
          maskKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "move-to-common-ground") {
          concernGrp.position.set(0, 0.79, -1.1);
          concern.rotation.x = -Math.PI / 2;
        }
        if (step.id === "close-mediation-log") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "AGREEMENT REACHED", ["Trial month · meet again", "Nothing confidential logged"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "take-her-side" || id === "promise-enforcement") {
          owner.root.rotation.y = -Math.PI / 2 + 1.0;
          owner.head.rotation.y = 0.5;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. The moment you pick a side, you are no use to either.");
        }
      },

      onInterrupt(it) {
        if (it.id === "recording-attempt") {
          ownerPhone.visible = true;
          owner.arms[0].shoulder.rotation.x = -1.3;
        }
        if (it.id === "party-overwhelmed") {
          widow.torso.rotation.x = 0.35;
          widow.head.rotation.x = 0.4;
          tissues.position.set(-0.7, 0.8, -1.1);
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "recording-attempt") {
          ownerPhone.visible = false;
          owner.arms[0].shoulder.rotation.x = 0;
        }
        if (it.id === "party-overwhelmed") {
          widow.torso.rotation.x = 0;
          widow.head.rotation.x = 0;
        }
      },

      animate(t, dt, session) {
        widow.head.rotation.y = Math.sin(t * 0.4) * 0.08;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "reality-test") {
          const ok = gg.t >= 0.4 && gg.t <= 0.6;
          repaint(realGauge.userData.screen, signFace(ok ? "HONEST" : gg.t < 0.4 ? "MINIMISED" : "SCARE", {
            bg: "#0b1a20", accent: ok ? "#59c97b" : "#f0645b", fg: "#dff2f8", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "balance-the-voices" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(balGauge.userData.screen, signFace(ok ? "LEVEL" : tr.v < 0.3 ? "SHE LEADS" : "HE LEADS", {
            bg: "#0b1a20", accent: ok ? "#59c97b" : "#f0645b", fg: "#dff2f8", scale: 0.5,
          }));
        }
      },
    };
  },
};
