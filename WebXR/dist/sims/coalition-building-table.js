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

// SmartCiti.X~ Coalition Building Table VR — Civic Leadership and Emotional
// Intelligence, station three.
//
// A community room with a round table and five organisations around it: a
// tenants' association, a small-business group, a labour local, a youth
// programme and the neighbourhood association that opposes the proposal. The
// learner convenes. Nobody here holds public office, which is exactly why the
// open-meeting rules still matter: a coalition that carries one council
// member's position to another becomes the conduit of a meeting nobody
// noticed.
//
// The principles it practises — know the interest behind the position, count
// the votes before the vote and count them honestly, bring people in rather
// than shut them out — are principles commonly taught in civic-leadership
// programmes; the foundation whose principles the module draws on is not
// sourced in this repository. No real organisation or person is depicted.

const CBT_ACCENT = 0xd08a4e;
const CBT_CSS = "#d08a4e";

export const SIM_COALITION_BUILDING_TABLE = {
  id: "coalition-building-table",
  index: "219",
  domain: "Civic",
  trade: "Community organiser — coalition convenor",
  category: "Community Environmental Justice",
  indoor: "hotel",
  weather: "clear",
  certification: "The Ralph M. Brown Act (California Government Code section 54950 and following) and its bar on serial meetings, which a coalition breaks when it carries positions between members of a legislative body; the Political Reform Act, administered by the FPPC, and the municipal ethics code for gifts to officials and for paid advocacy; Robert's Rules of Order, or whatever decision rule the coalition adopts for itself, as a practice rather than a law; SAMHSA's trauma-informed principles of collaboration and mutuality and of voice and choice; SEIU and AFSCME as the labour partners at many such tables. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Coalition Building Table",
  title: simTitle("Coalition Building Table"),
  tagline: "Five organisations, one proposal and a room that could split: find who is missing, hear every partner, turn positions into interests, size the ask, keep the opposition at the table — and count your support honestly",
  accent: CBT_ACCENT,
  accentCss: CBT_CSS,
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "table-held", name: "Table Held", note: "Every partner heard, the opposition kept in the room, and a support count nobody had to inflate" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your organisation's own support line, or a fellow organiser who has held a coalition together and will take the call",

  game: system({
    name: "Common Ground",
    currency: "ALLIES",
    ranks: ["Volunteer", "Convenor", "Coalition Lead", "Campaign Director", "Organiser Mentor"],
    badges: [
      { id: "empty-chairs-seen", name: "Empty Chairs Seen", note: "Everybody missing from the table noticed before the meeting started", test: AWARD.stepClean("who-is-missing") },
      { id: "nobody-shut-out", name: "Nobody Shut Out", note: "No unsafe action anywhere at the table", test: AWARD.safe },
      { id: "honest-count", name: "Honest Count", note: "The support count read without a single inflated line", test: AWARD.stepClean("count-honestly") },
    ],
    challenges: [
      { id: "clean-table", name: "Clean Table", note: "No corrections anywhere in the session", test: AWARD.clean },
      { id: "right-sized", name: "Right-Sized Ask", note: "The ask sized inside the band", test: AWARD.precise(0.7) },
      { id: "patient-convenor", name: "Patient Convenor", note: "The listening and the tension both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "wave-down-opposition": "You waved the neighbourhood association's speaker down before she finished. The people who oppose you are the ones whose objections will come back at the hearing, and a coalition that will not hear them in its own room teaches them that the only place they will be heard is against you.",
    "promise-locked-votes": "You told the partners the council votes are locked. They are not, nobody at this table can lock them, and a coalition that turns out on a promise of certain victory breaks up the night the vote goes the other way.",
    "private-majority-dinner": "You set up a private dinner for three of the five council members to \"talk it through\" with the coalition. Three of five is a majority of that body; a majority discussing the item out of public view, with you as the host, is the meeting the open-meeting law exists to stop — and your partners' names are on the invitation.",
    "hidden-sponsor-envelope": "You took the developer's envelope to cover the coalition's costs without telling the partners. Undisclosed money from a party with a stake in the outcome is the fastest way to lose the tenants and the labour local both, and gifts that pass on to officials have to be reported.",
  },

  lateNotes: {
    "local-hire-card": "Common ground comes after every partner has been heard and one position has been turned into its interest — not before.",
    "notes-log-board": "The notes go out once the commitments are assigned; there is nothing agreed to circulate yet.",
  },

  steps: [
    {
      id: "who-is-missing", kind: "find", noHint: true,
      targets: ["gap-renters-uninvited", "gap-no-interpreter", "gap-weekday-afternoon"],
      itemNames: {
        "gap-renters-uninvited": "the renters in the affected blocks — never invited",
        "gap-no-interpreter": "no interpreter for the partners who asked for one",
        "gap-weekday-afternoon": "a two o'clock weekday meeting time",
      },
      itemNotes: {
        "gap-renters-uninvited": "The people the proposal affects most have an empty chair with a name tent and no invitation behind it. Fix that before anything else is decided.",
        "gap-no-interpreter": "Two partners asked for interpretation. Without it they are present and not at the table.",
        "gap-weekday-afternoon": "Two in the afternoon on a weekday means shift workers, parents and students cannot come. The time chose the coalition before you did.",
      },
      decoyNotes: {
        "gap-name-tents": "Name tents are a courtesy that helps people address each other. They are not what keeps anybody away.",
      },
      title: "Find who is missing from the table",
      cue: "Look around the room. Three things are keeping people who belong here out of it.",
      why: "A coalition is only as strong as the people it actually represents, and the ones missing from the first meeting become the ones who say at the hearing that nobody asked them. Uninvited renters, a partner who cannot follow the conversation and a meeting time only salaried people can make all narrow the table quietly. Bringing people in starts with noticing who is not there.",
    },
    {
      id: "turn-the-agenda-wheel", kind: "turn", target: "agenda-wheel",
      title: "Set equal time on the agenda wheel",
      cue: "Turn the wheel so every partner's slot is the same size — the biggest organisation does not get the biggest slice.",
      turn: { turns: 0.5, axis: "y", label: "AGENDA TIME" },
      why: "Time at the table is power at the table. Left alone, it flows to whoever has the most staff, the loudest voice or the longest history with the convenor, and the youth programme and the tenants learn in the first twenty minutes that they are there for the photograph. Equal slots set out in public before anybody speaks are a small structure that changes who gets heard.",
    },
    {
      id: "set-ground-rules", kind: "select", target: "ground-rules-card",
      title: "Agree the ground rules out loud",
      cue: "One speaker at a time, argue with ideas not people, nothing said here is quoted outside without permission.",
      why: "Ground rules agreed by the room, rather than announced by the convenor, are what the room can hold itself to when the item gets hot. They also say to the partners with the least power that the meeting will protect them — that disagreeing with the labour local, or with you, will not cost them their seat or be repeated on the street tomorrow.",
    },
    {
      id: "hear-each-partner", kind: "hold", target: "listen-bead", seconds: 8,
      title: "Hear each partner state their position in full",
      cue: "Hold your attention on the speaker. No rebuttal, no side comments, no drafting your reply.",
      why: "Every partner arrives with a position, and the position is almost never the whole story. The only way to find what sits underneath it is to let each one say it completely, in their own words, without the convenor visibly preparing a response. Listening first is not a courtesy here; it is how the coalition learns what it can actually agree on.",
      holdBreakNote: "You started drafting your reply while she was still talking, and it showed. Put the pen down and hear the rest.",
    },
    {
      id: "position-to-interest", kind: "sequence",
      targets: ["ask-what-you-want", "ask-why-it-matters", "ask-what-you-fear", "reflect-the-interest"],
      itemNames: {
        "ask-what-you-want": "what do you want?",
        "ask-why-it-matters": "why does that matter to you?",
        "ask-what-you-fear": "what are you afraid happens if you don't get it?",
        "reflect-the-interest": "say the interest back in their words",
      },
      title: "Turn the business group's position into its interest",
      cue: "Ask what they want, then why it matters, then what they fear — then say the interest back.",
      why: "The small-business group's position is \"no construction on our block\". The interest underneath is that three months of blocked frontage would close two shops that have no cushion. Positions collide; interests often do not — a phased schedule and a guaranteed loading zone meet this one without killing the project. The questions have to come in order, because \"what are you afraid of\" asked first sounds like an accusation.",
      outOfOrderNote: "What, then why, then the fear, then reflect it back. Opening with their fear before you have asked what they want sounds like you have already decided what they are.",
    },
    {
      id: "move-to-common-ground", kind: "drag", target: "local-hire-card",
      title: "Move the shared interest onto the common-ground board",
      cue: "Local hiring came up from three partners. Carry it from the positions wall to the common-ground board.",
      drag: {
        to: "common-ground-board", radius: 0.6,
        missNote: "Not on the common-ground board. An interest three partners share is the spine of the coalition — put it where everybody can see it holds them together.",
      },
      why: "Coalitions are built on the interests partners share, not the positions they came in with. Local hiring was said three different ways by the labour local, the youth programme and the tenants; putting it on the common-ground board in plain sight turns three separate asks into one thing the whole table can stand behind, and it gives the next hard conversation somewhere solid to start.",
    },
    {
      id: "size-the-ask", kind: "gauge", target: "ask-meter",
      title: "Size the coalition's ask",
      cue: "Commit the ask inside the band: big enough to move people, small enough that nobody walks away.",
      gauge: {
        label: "THE ASK", speed: 0.6, green: [0.4, 0.6],
        readout: (t) => (t < 0.4 ? "too small to rally" : t <= 0.6 ? "winnable, worth it" : "partners peel off"),
        missNote: "Outside the band. An ask nobody would turn out for does not need a coalition; one the business group or the neighbourhood association cannot live with splits the table before the hearing. Find the one they can all carry.",
      },
      why: "The size of the ask decides who stays. Ask for too little and the partners with the most at stake stop coming, because nothing worth their evenings is on the table; ask for everything and the partners who were only half in go home. The right ask is the largest one every partner at the table can defend in front of their own members.",
    },
    {
      id: "name-the-tradeoffs", kind: "select", target: "tradeoff-card",
      title: "Name what each partner is giving up, out loud",
      cue: "Say it plainly: labour gives up the project labour agreement ask, the business group gives up a full veto, the tenants get the phasing.",
      why: "Every coalition agreement costs every partner something, and the cost nobody names is the one that resurfaces as a grievance later. Saying out loud, in the room, what each organisation is giving up treats the partners as adults, lets them take it back to their own members honestly, and makes it much harder for anybody to claim afterwards that they were not told.",
    },
    {
      id: "hold-the-table", kind: "track", target: "tension-meter", seconds: 8,
      title: "Hold the table together while the opposition speaks",
      cue: "The neighbourhood association is speaking against the proposal. Keep the tension in the band — not smothered, not boiling.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "TENSION",
        readout: (v) => (v < 0.3 ? "smothered" : v > 0.7 ? "boiling over" : "held"),
      },
      why: "Disagreement is the coalition's raw material, and smothering it only moves it to the parking lot. Letting it boil over loses the partners who came to build something, not to fight. The convenor's job while the opposition speaks is continuous: a hand up to stop a heckle, a nod that says keep going, the same patience for the people against you as for the people with you.",
      holdBreakNote: "The table slipped — either the argument was shut down or it ran away. Bring it back: the opposition keeps the floor, and nobody interrupts her.",
    },
    {
      id: "count-honestly", kind: "find", noHint: true,
      targets: ["count-maybe-as-yes", "count-condition-unmet", "count-double-counted"],
      itemNames: {
        "count-maybe-as-yes": "a \"maybe\" written down as a yes",
        "count-condition-unmet": "a yes whose condition has not been met",
        "count-double-counted": "one organisation counted twice through two reps",
      },
      itemNotes: {
        "count-maybe-as-yes": "The youth programme said they would take it to their board. That is not a yes yet, and counting it as one is how you find out on the night that it was not.",
        "count-condition-unmet": "Labour's yes depends on the local-hire language, which is not written yet. Mark it conditional until it is.",
        "count-double-counted": "Two people from the same congregation are two voices and one organisation. Count the organisation once.",
      },
      decoyNotes: {
        "count-in-writing": "A letter of support signed by the business group's board is exactly what a confirmed yes looks like. Leave it counted.",
      },
      title: "Count your support honestly before anybody says it is won",
      cue: "Read the support tally. Mark every line that is not really a yes.",
      why: "Counting the votes before the vote is one of the oldest rules in public life, and its whole value is that the count is honest. A tally padded with maybes, conditional yeses and the same organisation counted twice tells the coalition it is winning right up until it loses. The convenor's job is to be the person at the table who writes down what people actually said.",
    },
    {
      id: "assign-commitments", kind: "sequence", anyOrder: true,
      targets: ["task-turnout", "task-testimony", "task-translation"],
      itemNames: {
        "task-turnout": "turnout for the hearing — the tenants and the labour local",
        "task-testimony": "three-minute testimony — the business group and the youth programme",
        "task-translation": "translated flyers — the neighbourhood association, who offered",
      },
      title: "Leave with a commitment from every partner",
      cue: "Turnout, testimony and translation — each one owned by a named partner before anybody leaves.",
      why: "A coalition that leaves the room with a warm feeling and no tasks has held a meeting, not built anything. Each partner leaving with a specific, named piece of work — and the opposed neighbourhood association offering the translation because it was heard tonight — is what makes the coalition exist on the day of the hearing rather than only on the night it met.",
    },
    {
      id: "circulate-notes", kind: "select", target: "notes-log-board",
      title: "Circulate the notes, with the dissent in them",
      cue: "Agreements, who owes what by when, and the neighbourhood association's objection recorded in its own words.",
      why: "Notes that record only the agreement tell the partners who disagreed that their objection has already been erased. Writing the dissent down in the objector's own words, alongside the commitments and the dates, keeps faith with everybody in the room and is the record the coalition will need when somebody asks, months later, what was actually agreed.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with your co-organiser before you pack up",
      cue: "Two minutes by the door: how did that land, and what do we each need before the next one?",
      why: "Holding a divided table for two hours is draining, and the convenor absorbs a share of everybody's frustration. A short check-in with the co-organiser — how did it land, who needs a call tomorrow, the support line if it stays with you — is how organisers last long enough to build the coalitions that take years rather than evenings.",
    },
  ],

  interrupts: [
    {
      id: "conduit-request",
      kind: "Asked to carry votes",
      after: "hear-each-partner", delay: 3, seconds: 12,
      alert: "The labour local's rep holds up her phone: a council member has texted asking the coalition to find out privately how the other two supportive members will vote and report back.",
      cue: "Decline, in the room: the coalition will not carry one member's position to another.",
      target: "no-conduit-card",
      why: "A coalition can lobby each member in the open as much as it likes. What it cannot do is become the go-between that lets a majority of the body deliberate without meeting — carrying one member's position to the next is a serial meeting with the coalition as its hub. Saying no out loud, at the table, protects the partners and the members both.",
      missNote: "The rep texted back that the coalition would find out. Two partners have now been drawn into shuttling positions between council members, and if it surfaces the proposal and the coalition's credibility go down together.",
      wrongNote: "The listening marker is for the partner who is speaking. The text needs an answer in the room: the coalition does not carry votes between members.",
    },
    {
      id: "tenant-walks-out",
      kind: "Partner walking out",
      after: "hold-the-table", delay: 3, seconds: 12,
      alert: "The tenants' association rep has stood up, picked up her bag and is heading for the door, saying nobody at this table listens to renters.",
      cue: "Go to her: pull out her chair and ask her to finish her point first, before anybody else speaks.",
      target: "pull-out-a-chair",
      why: "The partner walking out is telling you the table failed her, and the tenants are the people the proposal affects most. Asking her back by name, pulling out her chair and giving her the floor before anybody else speaks brings her in rather than letting the room close behind her — and everybody else at the table learns what happens here when a partner is not heard.",
      missNote: "She left. The coalition now speaks for the renters without any renters in it, and the neighbourhood association will say exactly that at the hearing.",
      wrongNote: "The tension meter is the room. She is one person leaving it — go to her directly and give her the floor.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, CBT_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? CBT_ACCENT, { emissive: o.color ?? CBT_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CBT_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#22140a", accent: o.accent ?? CBT_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? CBT_CSS, w: o.w ?? 0.48 });
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
      cx.fillStyle = o.bg ?? "rgba(26,16,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? CBT_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fcefe2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#e6cdb4";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? CBT_ACCENT, { rough: 0.5, emissive: o.accent ?? CBT_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the community room
    const rugTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 7, base: "#5a4636", base2: "#4e3c2f", seam: "rgba(30,18,10,0.35)",
    }), { repeat: 3, px: 384 });
    const rug = box(g, 7.6, 0.02, 6.4, 0, 0.012, -0.3, 0x5a4636, { rough: 0.95, cast: false });
    rug.material = texturedMat(rugTex, { rough: 0.95, metal: 0.02, color: 0x6a5240 });

    // The round table and its five partners.
    const tableTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#7a5a3c", base2: "#6d5034", seam: "rgba(40,24,12,0.35)",
    }), { repeat: 1, px: 256 });
    const tableTop = cyl(g, 1.05, 1.05, 0.06, 0, 0.76, -1.2, 0x7a5a3c, { rough: 0.55, seg: 32 });
    tableTop.material = texturedMat(tableTex, { rough: 0.55, metal: 0.03, color: 0x8a6644 });
    cyl(g, 0.12, 0.3, 0.72, 0, 0.36, -1.2, 0x4a3a2c, { rough: 0.6, seg: 14 });
    const partners = [];
    const seats = [
      ["Labour local", 0x3a4a6a, -150], ["Youth programme", 0x4a6a3a, -110], ["Neighbourhood assoc.", 0x6a3a3a, 110],
      ["Small business", 0x5a4a2a, 150], ["Faith partner", 0x4a3a5a, 180],
    ];
    for (const [label, cloth, deg] of seats) {
      const a = (deg * Math.PI) / 180;
      const sx = Math.sin(a) * 1.45, sz = -1.2 + Math.cos(a) * 1.45;
      chair(sx, sz, a + Math.PI, 0x3a3f46);
      const p = seatedFigure(g, sx, 0.49, sz, { ry: a + Math.PI, cloth });
      holoTag(p.torso, label, 0, 1.38, 0.1, { css: CBT_CSS, w: 0.42 }).rotation.y = -(a + Math.PI);
      partners.push(p);
    }
    const oppositionFacing = partners[2].root.rotation.y;
    // The renters' chair: a name tent and nobody in it.
    const emptyA = (-40 * Math.PI) / 180;
    chair(Math.sin(emptyA) * 1.45, -1.2 + Math.cos(emptyA) * 1.45, emptyA + Math.PI, 0x5a4a3a);
    const emptyTent = decal(g, 0.22, 0.1, Math.sin(emptyA) * 0.9, 0.84, -1.2 + Math.cos(emptyA) * 0.9, signFace("RENTERS", { bg: "#f0e6d0", fg: "#3a2a1a", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    emptyTent.rotation.y = emptyA;
    holoTag(g, "Renters — never invited", Math.sin(emptyA) * 1.45, 1.35, -1.2 + Math.cos(emptyA) * 1.45, { css: "#f0645b", w: 0.5 });
    reg(hits, emptyTent, "gap-renters-uninvited");
    // Name tents in front of the partners: the decoy.
    const tents = box(g, 0.2, 0.08, 0.06, 0.55, 0.83, -0.55, 0xf0e6d0, { rough: 0.8 });
    reg(hits, tents, "gap-name-tents");

    // The agenda wheel in the middle of the table.
    const wheel = cyl(g, 0.22, 0.22, 0.03, 0, 0.81, -1.2, 0xe8d8c0, { rough: 0.5, seg: 24 });
    decal(g, 0.4, 0.4, 0, 0.83, -1.2, (cx, w, h) => {
      cx.fillStyle = "#e8d8c0"; cx.fillRect(0, 0, w, h);
      const cols = ["#d08a4e", "#5fb3a1", "#7fc4d8", "#c9a34a", "#a079ff"];
      for (let i = 0; i < 5; i++) {
        cx.fillStyle = cols[i];
        cx.beginPath?.(); cx.moveTo?.(w / 2, h / 2); cx.arc?.(w / 2, h / 2, w * 0.48, (i / 5) * Math.PI * 2, ((i + 1) / 5) * Math.PI * 2); cx.fill?.();
      }
    }, { px: 256 }).rotation.x = -Math.PI / 2;
    holoTag(g, "Agenda wheel — equal time", 0, 1.1, -1.2, { css: CBT_CSS, w: 0.46 });
    reg(hits, wheel, "agenda-wheel");

    bead(-0.55, 1.45, -0.2, "listen-bead", "Hear each partner in full", { w: 0.5 });
    card(0.65, 1.35, -0.1, "ground-rules-card", "Ground rules, agreed", "ONE VOICE\nIDEAS, NOT PEOPLE", { w: 0.44, ry: -0.2 });
    card(1.35, 1.3, 0.35, "no-conduit-card", "We don't carry votes", "NO GO-BETWEEN", { w: 0.44, ry: -0.5, accent: "#f2c14b", css: "#f2c14b" });
    card(-1.4, 1.3, 0.35, "tradeoff-card", "Name what each gives up", "WHAT WE EACH\nGIVE UP", { w: 0.5, ry: 0.5 });

    // The interest ladder.
    const ladder = group(g, 2.2, 0, -0.6, -0.6);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["ask-what-you-want", "1 · What do you want?", 0.75], ["ask-why-it-matters", "2 · Why does it matter?", 1.05],
      ["ask-what-you-fear", "3 · What do you fear?", 1.35], ["reflect-the-interest", "4 · Say the interest back", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, CBT_ACCENT, { emissive: CBT_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: CBT_CSS, w: 0.46 });
      reg(hits, b, lid);
    }

    // The positions wall, the local-hire card on it, and the common-ground board.
    const positions = board(0.9, 0.6, -3.1, 1.6, -1.6, (cx, w, h) => lines(cx, w, h, "POSITIONS", [
      "No construction on our block", "Project labour agreement", "Youth jobs · local hire",
    ]), { ry: 1.0 });
    void positions;
    const hireGrp = group(g, -2.75, 1.05, -1.2, 1.0);
    const hireCard = decal(hireGrp, 0.3, 0.18, 0, 0, 0, signFace("LOCAL HIRE", { bg: "#f2e6cc", fg: "#3a2a12", accent: CBT_CSS, scale: 0.4 }), { px: 192 });
    holoTag(hireGrp, "Shared by three partners", 0, 0.17, 0, { css: CBT_CSS, w: 0.46 });
    reg(hits, hireCard, "local-hire-card");
    const common = board(0.8, 0.5, 3.1, 1.55, -1.7, (cx, w, h) => lines(cx, w, h, "COMMON GROUND", ["What every partner can carry"], { accent: "#59c97b" }), { ry: -1.0, accent: 0x59c97b });
    reg(hits, common.userData.face, "common-ground-board");

    // The ask meter and the tension meter.
    const askStand = stand(-1.5, 0.35, 0.4);
    const askGauge = instrument(askStand, 0, 1.02, 0, { idle: "ASK", color: CBT_ACCENT, w: 0.2, d: 0.26 });
    holoTag(askStand, "Size of the ask", 0, 1.22, 0, { css: CBT_CSS, w: 0.36 });
    reg(hits, askGauge, "ask-meter");
    const tenStand = stand(1.6, 0.9, -0.4);
    const tenGauge = instrument(tenStand, 0, 1.02, 0, { idle: "TENSION", color: CBT_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tenStand, "Table tension", 0, 1.22, 0, { css: CBT_CSS, w: 0.34 });
    reg(hits, tenGauge, "tension-meter");

    // The support tally.
    board(0.66, 0.44, 0.9, 1.95, -2.9, (cx, w, h) => lines(cx, w, h, "SUPPORT TALLY", ["Tap every line that is not really a yes"]), {});
    const tally = group(g, 0.55, 0, -2.75);
    for (const [cid, label, x, c] of [
      ["count-maybe-as-yes", "Youth: 'yes' (said maybe)", -0.2, CBT_ACCENT], ["count-condition-unmet", "Labour: yes (if local hire)", 0.25, CBT_ACCENT],
      ["count-double-counted", "Faith: yes ×2 reps", 0.7, CBT_ACCENT], ["count-in-writing", "Business: signed letter", 1.15, 0x7fc4d8],
    ]) {
      const b = ball(tally, 0.024, x, 1.52, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(tally, label, x, 1.4, 0, { css: CBT_CSS, w: 0.44 });
      reg(hits, b, cid);
    }

    // Commitments board.
    const tasks = group(g, -2.3, 0, 0.3, 0.9);
    cyl(tasks, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [tid, label, y] of [["task-turnout", "Turnout — tenants + labour", 0.9], ["task-testimony", "Testimony — business + youth", 1.18], ["task-translation", "Translation — neighbourhood", 1.46]]) {
      const b = ball(tasks, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(tasks, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.52 });
      reg(hits, b, tid);
    }

    // The gaps: interpreter booth with nobody in it, and the meeting clock.
    const booth = group(g, -3.3, 0, 0.9, 1.3);
    box(booth, 0.7, 1.1, 0.5, 0, 0.55, 0, 0x4a4040, { rough: 0.7 });
    const boothSign = decal(booth, 0.5, 0.2, 0, 1.25, 0.26, signFace("INTERPRETER\nNOT BOOKED", { bg: "#2a1416", accent: "#f0645b", scale: 0.36 }), { px: 192 });
    reg(hits, boothSign, "gap-no-interpreter");
    const clock = group(g, 3.4, 2.1, -0.2, -1.2);
    cyl(clock, 0.22, 0.22, 0.04, 0, 0, 0, 0xe8e0d0, { rough: 0.5, seg: 24 }).rotation.x = Math.PI / 2;
    const clockFace = decal(clock, 0.36, 0.2, 0, -0.34, 0.02, signFace("TUE 2:00 PM", { bg: "#1a1410", accent: "#f0645b", scale: 0.5 }), { px: 192 });
    reg(hits, clockFace, "gap-weekday-afternoon");

    // ------------------------------------------------------------ the wrong moves
    card(2.35, 1.3, 1.0, "promise-locked-votes", "Tell them the votes are locked?", "THE VOTES\nARE LOCKED", {
      w: 0.6, ry: -0.8, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    card(-2.6, 1.25, -0.5, "private-majority-dinner", "Dinner for three members?", "DINNER — 3\nCOUNCIL MEMBERS", {
      w: 0.5, ry: 1.0, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(1.0, 1.25, -0.35, "wave-down-opposition", "Wave her down?", { color: 0xf0645b, css: "#f0645b", w: 0.36 });
    const envelope = decal(g, 0.2, 0.12, -0.6, 0.8, -0.7, signFace("FROM THE\nDEVELOPER", { bg: "#f0ead8", fg: "#5a3a1a", accent: "#b0453a", scale: 0.3 }), { px: 128 });
    envelope.rotation.x = -Math.PI / 2;
    holoTag(g, "Sponsor envelope — no strings?", -0.6, 0.98, -0.7, { css: "#f0645b", w: 0.56 });
    reg(hits, envelope, "hidden-sponsor-envelope");

    // The tenants' rep, standing because she came late, who heads for the door.
    const tenant = standingPerson(g, -1.25, -2.55, { ry: 0.5, cloth: 0x2f6a6a, hiVis: false });
    holoTag(tenant.torso, "Tenants' association", 0, 1.9, 0, { css: CBT_CSS, w: 0.44 });
    const chairOut = bead(-1.0, 1.1, -2.0, "pull-out-a-chair", "Pull out her chair · give her the floor", { color: 0xf2c14b, css: "#f2c14b", w: 0.64 });
    void chairOut;
    const partnerPhone = box(g, 0.07, 0.13, 0.01, -0.7, 1.35, -2.05, 0xdfe4e8, { rough: 0.4, emissive: 0x7fc4d8, ei: 0.8 });
    partnerPhone.visible = false;

    // Closing boards.
    const notes = board(0.56, 0.38, 2.1, 1.9, 1.5, (cx, w, h) => lines(cx, w, h, "MEETING NOTES", ["Agreements · who owes what", "Dissent in its own words"]), { ry: -0.7 });
    reg(hits, notes.userData.face, "notes-log-board");
    const checkin = board(0.5, 0.34, -2.0, 1.9, 1.6, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that land?", "Who needs a call tomorrow?"], { accent: "#7fc4d8" }), { ry: 0.7, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, -0.8, 2.45, -2.9, (cx, w, h) => lines(cx, w, h, "INTEREST, NOT POSITION", ["Ask why before you answer."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the co-organiser
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const coOrganiser = standingFigure(g, 2.25, -1.65, { ry: -1.5, cloth: 0x3a2f46, trousers: 0x262d36 });
    holoTag(coOrganiser, "Co-organiser", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.32 }).rotation.y = 1.5;

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 1.0, -1.2),

      onStepComplete(step) {
        if (step.id === "turn-the-agenda-wheel") {
          wheel.material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 });
        }
        if (step.id === "move-to-common-ground") {
          hireGrp.position.set(3.05, 1.35, -1.65);
          hireGrp.rotation.y = -1.0;
        }
        if (step.id === "circulate-notes") {
          repaint(notes.userData.face, (cx, w, h) => lines(cx, w, h, "NOTES SENT", ["To every partner", "Dissent recorded"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "wave-down-opposition" || id === "promise-locked-votes") {
          partners[2].root.rotation.y = oppositionFacing + 0.9;
          partners[2].head.rotation.y = 0.5;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. The people against you are the ones you most need to hear.");
        }
      },

      onInterrupt(it) {
        if (it.id === "conduit-request") {
          partnerPhone.visible = true;
          partners[0].arms[1].shoulder.rotation.x = -1.3;
        }
        if (it.id === "tenant-walks-out") {
          tenant.root.position.set(-2.4, 0, 1.6);
          tenant.root.rotation.y = 2.6;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "conduit-request") {
          partnerPhone.visible = false;
          partners[0].arms[1].shoulder.rotation.x = 0;
        }
        if (it.id === "tenant-walks-out") {
          tenant.root.position.set(-1.25, 0, -2.55);
          tenant.root.rotation.y = 0.5;
        }
      },

      animate(t, dt, session) {
        for (let i = 0; i < partners.length; i++) partners[i].head.rotation.x = Math.sin(t * 0.7 + i) * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "size-the-ask") {
          const ok = gg.t >= 0.4 && gg.t <= 0.6;
          repaint(askGauge.userData.screen, signFace(ok ? "WINNABLE" : gg.t < 0.4 ? "TOO SMALL" : "TOO BIG", {
            bg: "#22140a", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbe9d6", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-table" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(tenGauge.userData.screen, signFace(ok ? "HELD" : tr.v < 0.3 ? "SMOTHERED" : "BOILING", {
            bg: "#22140a", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbe9d6", scale: 0.5,
          }));
        }
      },
    };
  },
};
