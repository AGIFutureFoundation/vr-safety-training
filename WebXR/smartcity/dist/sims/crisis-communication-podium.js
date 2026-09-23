import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, mat, standingPerson,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Crisis Communication Podium VR — Civic Leadership and
// Emotional Intelligence, station six.
//
// A press podium on the plaza in front of city hall, two hours into an
// industrial fire whose smoke is drifting over three neighbourhoods. The
// learner is the city's spokesperson, speaking for the joint information
// centre that every agency on the incident feeds: an interpreter at their
// shoulder, a map, reporters with phones up, and a radio to incident command.
// Earlier in the day somebody said there was no risk. There is.
//
// The principles it practises — take the hard call and own it, keep your
// word, bring people in rather than shut them out — are principles commonly
// taught in civic-leadership programmes; the foundation whose principles the
// module draws on is not sourced in this repository. The incident, the city
// and every person in it are invented; no real event or company is depicted.

const CCP_ACCENT = 0xe0a24a;
const CCP_CSS = "#e0a24a";

export const SIM_CRISIS_COMMUNICATION_PODIUM = {
  id: "crisis-communication-podium",
  index: "222",
  domain: "Civic",
  trade: "Public information officer — city spokesperson",
  category: "Community Environmental Justice",
  district: "Community Environmental Justice",
  weather: "smoke",
  certification: "NIMS and ICS, through FEMA IS-100 and IS-700, for the public information officer's place on the command staff and for the joint information centre that makes many agencies speak with one voice; the CDC's Crisis and Emergency Risk Communication principles — be first, be right, be credible, express empathy, promote action, show respect; Title II of the ADA for a sign-language interpreter in frame, captions and alerts residents can actually receive; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN) for speaking to a frightened public. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Crisis Communication Podium",
  title: simTitle("Crisis Communication Podium"),
  tagline: "Smoke over three neighbourhoods and a camera in your face: confirm before you speak, one voice for every agency, what to do and when you'll be back, the interpreter in frame, a rumour checked not repeated — and the morning's mistake owned on the record",
  accent: CCP_ACCENT,
  accentCss: CCP_CSS,
  parSeconds: 330,
  footprint: 2.5,
  badge: { id: "first-right-credible", name: "First, Right, Credible", note: "A whole briefing given on confirmed facts, in every format residents need, with the earlier error corrected by name" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or the incident's peer-support contact — a long day at the podium is a long day of other people's fear",

  game: system({
    name: "One Voice",
    currency: "CREDIBILITY",
    ranks: ["Press Aide", "Deputy PIO", "Public Information Officer", "JIC Lead", "Communications Mentor"],
    badges: [
      { id: "confirmed-first", name: "Confirmed First", note: "Every fact confirmed with command before the podium", test: AWARD.stepClean("confirm-before-speaking") },
      { id: "nothing-spun", name: "Nothing Spun", note: "No unsafe action anywhere in the briefing", test: AWARD.safe },
      { id: "error-owned", name: "Error Owned", note: "The morning's mistake corrected without a single deflection", test: AWARD.stepClean("own-the-earlier-error") },
    ],
    challenges: [
      { id: "clean-briefing", name: "Clean Briefing", note: "No corrections anywhere in the briefing", test: AWARD.clean },
      { id: "interpreter-pace", name: "Interpreter Pace", note: "The statement paced inside the band", test: AWARD.precise(0.7) },
      { id: "composed", name: "Composed", note: "The pause and the questions both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "cut-off-resident": "You cut off the resident who asked whether her children's school is safe with \"next question\". She is the audience this briefing exists for, and a spokesperson who brushes her off on camera has told every parent watching that the city is managing them rather than talking to them.",
    "promise-all-clear": "You promised the all-clear by tonight. Nobody at incident command has said that, the fire is not out and the smoke follows the wind; when tonight comes without it, every instruction you gave today becomes easier to ignore.",
    "off-record-briefing": "You took one reporter aside to brief her off the record. Information the public needs does not go to one outlet first in a side conversation at a public briefing; it goes to everybody at the podium at once, and the residents who were not told will notice who was.",
    "speculate-on-blame": "You named the company you believe caused the fire. Cause is for the investigation to establish, and a spokesperson who assigns blame from the podium turns a public-safety briefing into a liability fight — and can be wrong in front of every camera.",
  },

  lateNotes: {
    "zone-map-card": "The map goes into frame once the core message is out — say what happened and what to do first.",
    "jic-log-board": "The release is logged once the earlier error has been corrected on the record.",
  },

  steps: [
    {
      id: "confirm-before-speaking", kind: "find", noHint: true,
      targets: ["fact-confirmed-by-command", "fact-shelter-area-map", "fact-next-update-time"],
      itemNames: {
        "fact-confirmed-by-command": "the situation summary signed off by incident command",
        "fact-shelter-area-map": "the shelter-in-place area, as mapped",
        "fact-next-update-time": "the time of the next update",
      },
      itemNotes: {
        "fact-confirmed-by-command": "The summary incident command has actually signed off. Everything you say at the podium should trace to this sheet.",
        "fact-shelter-area-map": "The area as command has drawn it — street names, not \"near the plant\". Residents need to find their own house on it.",
        "fact-next-update-time": "A fixed time for the next briefing is a promise you can keep, and it stops residents refreshing rumours in between.",
      },
      decoyNotes: {
        "fact-social-rumour": "A post with ten thousand shares is not a fact. Note that it is circulating so you can address it; do not repeat it as information.",
      },
      title: "Confirm every fact before you step up",
      cue: "At the information table, pick out the three things you can say with certainty.",
      why: "Be first, be right, be credible — and of the three, right is the one that cannot be recovered. A spokesperson who speaks from confirmed facts, a mapped area and a set time for the next update can be relied on for the whole incident; one who speaks from the morning's assumptions or a viral post will spend the afternoon correcting themselves, and residents stop following instructions from a voice that keeps changing.",
    },
    {
      id: "one-voice", kind: "select", target: "jic-agreement-card",
      title: "Agree the joint message with every agency",
      cue: "Fire, public health, the county and the utility sign off one message before anybody speaks.",
      why: "In a multi-agency incident the public hears every agency as \"the government\". The joint information centre exists so the fire department, public health, the county and the utility say the same thing about the same risk; four slightly different messages on four channels produce confusion, and confusion in a shelter-in-place is people driving through the smoke to get their children.",
    },
    {
      id: "bring-up-the-pa", kind: "turn", target: "pa-mixer-knob",
      title: "Bring the podium audio and the live feed up",
      cue: "Turn the mixer up — the plaza speakers, the interpreter's feed and the live captions all run off it.",
      turn: { turns: 0.6, axis: "y", label: "PODIUM FEED" },
      why: "The residents who most need this briefing are at home with the windows shut, watching the live feed, and the captioner and the interpreter are working from the same audio. Bringing the mixer up before the first word means the statement reaches the people sheltering in place at the same moment it reaches the reporters on the plaza.",
    },
    {
      id: "cerc-order", kind: "sequence",
      targets: ["say-what-happened", "say-what-we-know", "say-what-to-do", "say-when-next"],
      itemNames: {
        "say-what-happened": "what happened",
        "say-what-we-know": "what we know and do not know yet",
        "say-what-to-do": "what residents should do now",
        "say-when-next": "when we will be back",
      },
      title: "Give the statement in the order people can act on",
      cue: "What happened, what we know and do not know, what to do now, and when we will update.",
      why: "Frightened people listen for three things: is it real, does it affect me, what do I do. The order answers them in turn — what happened, then honestly what is known and unknown, then the one action residents should take, then when they will hear more. Leading with reassurance or with agency names buries the instruction, and the instruction is why the podium is there.",
      outOfOrderNote: "What happened, what we know and don't, what to do, when we're back. Telling people what to do before they know why is how instructions get ignored.",
    },
    {
      id: "pace-the-statement", kind: "gauge", target: "pace-meter",
      title: "Pace the statement for the interpreter and the captions",
      cue: "Commit your speaking pace inside the band the interpreter and the captioner can follow.",
      gauge: {
        label: "PACE", speed: 0.62, green: [0.36, 0.56],
        readout: (t) => `${Math.round(90 + t * 130)} words/min`,
        missNote: "Outside the band. Too fast and the interpreter and the captions fall behind — deaf residents get half the instruction; too slow and the statement loses the people standing in the smoke.",
      },
      why: "Effective communication with deaf and hard-of-hearing residents is a legal duty and a practical one: an instruction the interpreter could not keep up with is an instruction a part of the city never received. A steady, slightly slower pace with a pause at each sentence end is what lets the interpreter and the captioner deliver the same briefing to everybody.",
    },
    {
      id: "pause-for-interpreter", kind: "hold", target: "interpreter-pause-bead", seconds: 8,
      title: "Pause while the interpreter finishes the instruction",
      cue: "Hold. Let the interpreter finish the shelter-in-place instruction before you say another word.",
      why: "The instruction to shelter in place is the most important sentence of the day, and it is the one most often cut off by a spokesperson eager to move on. Holding still while the interpreter finishes signing it — however long the silence feels on camera — is what makes the instruction reach the deaf residents in the affected streets at the same time as everybody else.",
      holdBreakNote: "You started the next sentence while the interpreter was still signing the instruction. Stop, let her finish, then go on.",
    },
    {
      id: "map-into-frame", kind: "drag", target: "zone-map-card",
      title: "Put the map where the cameras can see it",
      cue: "Carry the shelter-in-place map onto the easel beside the interpreter, inside the camera frame.",
      drag: {
        to: "easel-in-frame", radius: 0.6,
        missNote: "Not in frame. A map the cameras cannot see is a map the residents at home never get — put it on the easel beside the interpreter.",
      },
      why: "Most residents will see this briefing as a thirty-second clip on a phone. A map in frame, beside the interpreter, with street names large enough to read, lets somebody find their own block without waiting for the full statement to be transcribed — and it makes the clip that gets shared carry the one thing that actually protects people.",
    },
    {
      id: "name-the-fear", kind: "select", target: "empathy-card",
      title: "Name the fear before the next fact",
      cue: "\"If you are in that area and you are frightened, that is a reasonable way to feel. Here is what keeps you safe.\"",
      why: "Expressing empathy is not softness; it is what makes the next instruction land. People who feel their fear has been heard are measurably more willing to follow guidance than people who are told to stay calm. Naming the fear plainly, then moving straight to what keeps them safe, treats residents as adults and keeps the briefing about their safety rather than the city's image.",
    },
    {
      id: "steady-under-questions", kind: "track", target: "composure-meter", seconds: 8,
      title: "Stay steady through the questions",
      cue: "Questions are coming fast. Keep your composure in the band — not defensive, not rattled.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.5, fall: 0.42, drift: 0.16, label: "COMPOSURE",
        readout: (v) => (v < 0.3 ? "rattled" : v > 0.7 ? "defensive" : "steady"),
      },
      why: "The question-and-answer is where credibility is won or lost, because it is unscripted. Rattled, the spokesperson starts guessing; defensive, they start arguing with reporters, and the argument becomes the story. Steady — answering what is known, saying plainly what is not, promising to find out — has to be held question after question, and it is a continuous effort rather than one good answer.",
      holdBreakNote: "Your composure slipped — you guessed, or you snapped. Come back: say what you know, say what you don't, and say when you'll find out.",
    },
    {
      id: "reach-everyone", kind: "sequence", anyOrder: true,
      targets: ["reach-multilingual-alert", "reach-captioned-video", "reach-door-to-door"],
      itemNames: {
        "reach-multilingual-alert": "the alert in the neighbourhood's languages",
        "reach-captioned-video": "the captioned, interpreted video posted",
        "reach-door-to-door": "door-to-door for residents without phones",
      },
      title: "Make sure the message reaches everybody in the area",
      cue: "Multilingual alerts, the captioned video, and teams door to door for the people who will miss both.",
      why: "A briefing reaches the people who watch briefings. The affected streets also hold elderly residents without smartphones, families who speak other languages at home, and deaf residents who need the captioned, interpreted version. Bringing people in rather than shutting them out, in a crisis, means sending the message down every channel those residents actually use — including a knock on the door.",
    },
    {
      id: "own-the-earlier-error", kind: "find", noHint: true,
      targets: ["own-earlier-no-risk-wrong", "own-what-changed", "own-what-we-do-now"],
      itemNames: {
        "own-earlier-no-risk-wrong": "\"This morning we said there was no risk. That was wrong.\"",
        "own-what-changed": "\"Here is what we learned since then.\"",
        "own-what-we-do-now": "\"Here is what we are doing differently now.\"",
      },
      itemNotes: {
        "own-earlier-no-risk-wrong": "Say the mistake plainly and say it was the city's. Everybody watching remembers the morning's statement.",
        "own-what-changed": "The wind shifted and the monitoring came in. Explaining what changed shows the correction is based on facts, not pressure.",
        "own-what-we-do-now": "A correction without a change is only an apology. The widened area and the door-to-door teams are the change.",
      },
      decoyNotes: {
        "own-blame-the-plant": "\"The plant gave us bad information\" may even be true, and it is still a deflection at the podium. Own the city's statement; the investigation will deal with the rest.",
      },
      title: "Correct the morning's statement, and own it",
      cue: "Pick every line that owns the earlier error. Leave the deflection where it is.",
      why: "The morning's \"no risk\" is on every resident's phone. The only way back to credibility is to take the hard call and own it: say plainly that the earlier statement was wrong, explain what changed, and say what the city is doing differently. Blaming the plant, the models or the wind — however accurate — tells residents the city will not stand behind its own words, and they stop listening to the next ones.",
    },
    {
      id: "log-the-release", kind: "select", target: "jic-log-board",
      title: "Log the briefing and the correction",
      cue: "Record the time, the message, the correction and the next-update time in the joint information log.",
      why: "The joint information log is the incident's public-information record. Logging the time of the briefing, the agreed message, the correction of the morning's statement and the time of the next update means every agency and the next shift of the information centre are working from the same account — and it is the record that will be read at the after-action review.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with the information centre lead before the next briefing",
      cue: "Two minutes in the tent: how did that land, and who is taking the next podium?",
      why: "Standing in front of cameras on the worst day of three neighbourhoods is a strain that builds across an incident. A short check-in with the joint information centre lead — how did that land, is the next briefing covered, the peer-support contact if it stays with you — is how the podium stays staffed by someone steady for as long as the incident runs.",
    },
  ],

  interrupts: [
    {
      id: "rumour-shouted",
      kind: "Rumour from the crowd",
      after: "pause-for-interpreter", delay: 3, seconds: 12,
      alert: "A reporter steps forward holding up her phone: a post says two people have died near the plant. She wants you to confirm it on camera.",
      cue: "Do not confirm or deny from the podium — check with incident command on the radio first.",
      target: "radio-check-command",
      why: "Be right before being fast. A casualty figure confirmed from the podium on the strength of a post cannot be taken back, and a denial that later proves wrong is worse. Checking with incident command on the radio, then saying honestly what is and is not confirmed, keeps the briefing credible — and it tells the reporter, fairly, that the city will answer when it knows.",
      missNote: "You answered from the post. By the evening the figure was wrong, the correction led every bulletin, and residents started treating everything the city said — including the shelter instruction — as provisional.",
      wrongNote: "Not by pausing longer — the reporter needs an answer, and the answer comes from command. Use the radio before you say anything about casualties.",
    },
    {
      id: "zone-widens",
      kind: "Situation changed mid-briefing",
      after: "steady-under-questions", delay: 3, seconds: 12,
      alert: "Your earpiece crackles: incident command has widened the shelter-in-place area by four blocks to the east. The map on the easel is already out of date.",
      cue: "Stop the questions and update the area on the record, now.",
      target: "update-zone-card",
      why: "When the facts change mid-briefing, the briefing changes with them. Stopping the questions to announce the widened area, on camera, with the new streets named, puts the update in front of the people who need it at the moment it becomes true — and it shows residents that the city will tell them immediately when something changes, which is what makes them trust the next instruction.",
      missNote: "You finished the questions first. The clip that circulated for the next hour showed the old area, and four blocks of residents who should have been sheltering were outside because the city's own map told them they were fine.",
      wrongNote: "Your composure is fine — the map is not. Stop and announce the widened area on the record.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, CCP_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? CCP_ACCENT, { emissive: o.color ?? CCP_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CCP_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#22170a", accent: o.accent ?? CCP_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? CCP_CSS, w: o.w ?? 0.48 });
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
      cx.fillStyle = o.bg ?? "rgba(26,18,8,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? CCP_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fdf2e2";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#ecd3b0";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? CCP_ACCENT, { rough: 0.5, emissive: o.accent ?? CCP_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the plaza
    const plazaTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 6, base: "#6a6660", base2: "#5e5a55", seam: "rgba(20,18,16,0.5)",
    }), { repeat: 4, px: 384 });
    const plaza = box(g, 9.0, 0.02, 7.4, 0, 0.01, -0.4, 0x6a6660, { rough: 0.9, cast: false });
    plaza.material = texturedMat(plazaTex, { rough: 0.9, metal: 0.03, color: 0x7a766f });

    // City hall steps and facade behind the podium.
    const stoneTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#b8b0a0", base2: "#aca494", seam: "rgba(60,54,44,0.4)",
    }), { repeat: 2, px: 320 });
    for (let i = 0; i < 3; i++) box(g, 6.4, 0.16, 0.45, 0, 0.08 + i * 0.16, -3.1 - i * 0.45, 0xb8b0a0, { rough: 0.85 });
    const facade = box(g, 7.2, 3.4, 0.3, 0, 2.2, -4.5, 0xb8b0a0, { rough: 0.85 });
    facade.material = texturedMat(stoneTex, { rough: 0.85, metal: 0.02, color: 0xc4bcac });
    for (const px of [-2.6, -1.3, 1.3, 2.6]) cyl(g, 0.2, 0.22, 3.0, px, 2.0, -4.1, 0xcfc8b8, { rough: 0.8, seg: 14 });

    // The podium with the city seal.
    const podium = group(g, 0, 0, -1.6);
    box(podium, 0.7, 1.1, 0.5, 0, 0.55, 0, 0x2a3040, { rough: 0.6 });
    box(podium, 0.76, 0.05, 0.56, 0, 1.12, 0.02, 0x3a4050, { rough: 0.5 });
    decal(podium, 0.36, 0.36, 0, 0.7, 0.26, (cx, w, h) => {
      cx.fillStyle = "#1a2030"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = CCP_CSS; cx.lineWidth = w * 0.05;
      cx.beginPath?.(); cx.arc?.(w / 2, h / 2, w * 0.38, 0, Math.PI * 2); cx.stroke?.();
      cx.fillStyle = "#f3e6cc"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("CITY", w / 2, h / 2);
    }, { px: 192, glow: true, ei: 0.4 });
    for (const sx of [-0.18, 0, 0.18]) {
      const m = cyl(podium, 0.012, 0.012, 0.32, sx, 1.3, 0.12, 0x1b1d20, { rough: 0.5, metal: 0.6, seg: 6 });
      m.rotation.x = 0.4;
    }

    // The interpreter on a low riser in a spotlight, and the easel.
    const riser = box(g, 0.9, 0.2, 0.9, -1.1, 0.1, -1.7, 0x2a3040, { rough: 0.7 });
    void riser;
    const interpreter = standingPerson(g, -1.1, -1.7, { ry: 0.25, cloth: 0x14161a, hiVis: false });
    interpreter.root.position.y = 0.2;
    holoTag(interpreter.torso, "Sign-language interpreter", 0, 1.9, 0, { css: CCP_CSS, w: 0.5 });
    const spot = cyl(g, 0.9, 0.9, 0.01, -1.1, 0.215, -1.7, 0xfff0d0, { rough: 0.8, emissive: 0xfff0d0, ei: 0.2, cast: false, seg: 24 });
    void spot;
    bead(-0.55, 1.6, -1.25, "interpreter-pause-bead", "Pause — let her finish", { w: 0.44 });
    const easel = group(g, 1.05, 0, -1.7, -0.2);
    for (const sx of [-1, 1]) {
      const leg = box(easel, 0.04, 1.6, 0.04, sx * 0.3, 0.8, 0, 0x5a4a3a, { rough: 0.7 });
      leg.rotation.z = sx * -0.08;
    }
    const easelShelf = box(easel, 0.7, 0.04, 0.1, 0, 0.95, 0.05, 0x5a4a3a, { rough: 0.7 });
    holoTag(easel, "Easel — in camera frame", 0, 1.75, 0, { css: "#59c97b", w: 0.46 });
    reg(hits, easelShelf, "easel-in-frame");

    // The zone map, waiting on the information table.
    const mapGrp = group(g, 2.4, 1.0, -0.2, -0.9);
    const mapFace = decal(mapGrp, 0.5, 0.4, 0, 0, 0, (cx, w, h) => {
      cx.fillStyle = "#e8e2d4"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#8a8272"; cx.lineWidth = 2;
      for (let i = 1; i < 6; i++) { cx.beginPath?.(); cx.moveTo?.(0, (h * i) / 6); cx.lineTo?.(w, (h * i) / 6); cx.stroke?.(); }
      for (let i = 1; i < 6; i++) { cx.beginPath?.(); cx.moveTo?.((w * i) / 6, 0); cx.lineTo?.((w * i) / 6, h); cx.stroke?.(); }
      cx.fillStyle = "rgba(224,100,60,0.35)"; cx.fillRect(w * 0.25, h * 0.25, w * 0.35, h * 0.45);
      cx.fillStyle = "#3a2a1a"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("SHELTER IN PLACE", w / 2, h * 0.12);
    }, { px: 256 });
    holoTag(mapGrp, "Shelter-in-place map", 0, 0.28, 0, { css: CCP_CSS, w: 0.4 });
    reg(hits, mapFace, "zone-map-card");
    const zoneRing = torus(mapGrp, 0.14, 0.008, 0.05, -0.02, 0.01, 0xf0645b, { emissive: 0xf0645b, ei: 1.6, seg: 6, seg2: 28 });
    zoneRing.visible = false;

    // ------------------------------------------------------------ the information table (JIC)
    const tent = group(g, 3.0, 0, 0.8, -1.0);
    for (const [sx, sz] of [[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]]) cyl(tent, 0.025, 0.025, 2.2, sx, 1.1, sz, 0x8a8f96, { rough: 0.5, metal: 0.6, seg: 8 });
    box(tent, 1.9, 0.05, 1.5, 0, 2.22, 0, 0x2a4a6a, { rough: 0.8 });
    box(tent, 1.4, 0.05, 0.6, 0, 0.76, -0.2, 0x5a5a5a, { rough: 0.6 });
    const radio = box(tent, 0.08, 0.2, 0.05, 0.5, 0.9, -0.2, 0x1b1f24, { rough: 0.5 });
    void radio;
    const radioLamp = ball(tent, 0.015, 0.5, 1.02, -0.17, 0x2a3a2a, { rough: 0.4, seg: 8 });
    const jic = board(0.72, 0.5, 2.6, 1.85, -0.7, (cx, w, h) => lines(cx, w, h, "INFORMATION TABLE", ["Tap only what you can say for certain"]), { ry: -0.9 });
    void jic;
    const facts = group(g, 2.45, 0, -0.45, -0.9);
    for (const [fid, label, y, c] of [
      ["fact-confirmed-by-command", "Summary — signed by command", 1.5, CCP_ACCENT], ["fact-shelter-area-map", "Shelter area — mapped streets", 1.3, CCP_ACCENT],
      ["fact-next-update-time", "Next update — 4:00 pm", 1.1, CCP_ACCENT], ["fact-social-rumour", "Viral post — 10k shares", 0.9, 0x7fc4d8],
    ]) {
      const b = ball(facts, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(facts, label, 0.34, y, 0, { css: CCP_CSS, w: 0.58 });
      reg(hits, b, fid);
    }
    card(1.9, 1.35, 0.4, "jic-agreement-card", "One message, every agency", "FIRE · HEALTH\nCOUNTY · UTILITY", { w: 0.5, ry: -0.6 });
    bead(1.5, 1.2, 1.1, "radio-check-command", "Radio: check with command", { color: 0xf2c14b, css: "#f2c14b", w: 0.52 });

    // The PA mixer on a road case.
    const mixerGrp = group(g, -0.7, 0, -0.9, 0.3);
    box(mixerGrp, 0.5, 0.8, 0.4, 0, 0.4, 0, 0x1b1f24, { rough: 0.6 });
    box(mixerGrp, 0.44, 0.04, 0.3, 0, 0.82, 0, 0x2e333a, { rough: 0.5 });
    const paKnob = cyl(mixerGrp, 0.035, 0.035, 0.035, 0, 0.86, 0, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(mixerGrp, "Podium feed", 0, 1.05, 0, { css: CCP_CSS, w: 0.28 });
    reg(hits, paKnob, "pa-mixer-knob");
    const liveLamp = ball(mixerGrp, 0.018, 0.15, 0.86, 0.08, 0x5a2020, { rough: 0.4, seg: 10 });

    // The statement ladder.
    const ladder = group(g, 2.3, 0, -2.2, -0.4);
    cyl(ladder, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [lid, label, y] of [
      ["say-what-happened", "1 · What happened", 0.75], ["say-what-we-know", "2 · Known / not yet known", 1.05],
      ["say-what-to-do", "3 · What to do now", 1.35], ["say-when-next", "4 · When we're back", 1.65],
    ]) {
      const b = ball(ladder, 0.026, 0, y, 0, CCP_ACCENT, { emissive: CCP_ACCENT, ei: 1.5, seg: 12 });
      holoTag(ladder, label, 0.2, y, 0, { css: CCP_CSS, w: 0.44 });
      reg(hits, b, lid);
    }

    // Pace and composure meters.
    const paceStand = stand(0.75, -0.7, -0.3);
    const paceGauge = instrument(paceStand, 0, 1.02, 0, { idle: "PACE", color: CCP_ACCENT, w: 0.2, d: 0.26 });
    holoTag(paceStand, "Speaking pace", 0, 1.22, 0, { css: CCP_CSS, w: 0.34 });
    reg(hits, paceGauge, "pace-meter");
    const compStand = stand(-1.6, 0.1, 0.4);
    const compGauge = instrument(compStand, 0, 1.02, 0, { idle: "STEADY", color: CCP_ACCENT, w: 0.2, d: 0.26 });
    holoTag(compStand, "Composure", 0, 1.22, 0, { css: CCP_CSS, w: 0.28 });
    reg(hits, compGauge, "composure-meter");

    card(-0.3, 1.45, -0.6, "empathy-card", "Name the fear", "FRIGHTENED IS\nREASONABLE", { w: 0.3, ry: 0.2 });
    card(-2.2, 1.35, -0.6, "update-zone-card", "Announce the wider area now", "AREA WIDENED\n+4 BLOCKS EAST", { w: 0.56, ry: 0.6, accent: "#f2c14b", css: "#f2c14b" });

    // Reaching everyone.
    const reach = group(g, -2.6, 0, 0.9, 0.9);
    cyl(reach, 0.022, 0.022, 1.6, 0, 0.8, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [rid, label, y] of [["reach-multilingual-alert", "Alert in every language", 0.9], ["reach-captioned-video", "Captioned, interpreted video", 1.18], ["reach-door-to-door", "Door to door — no phone", 1.46]]) {
      const b = ball(reach, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(reach, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.52 });
      reg(hits, b, rid);
    }

    // Own the error.
    board(0.7, 0.36, -3.1, 2.1, -1.4, (cx, w, h) => lines(cx, w, h, "THE MORNING'S STATEMENT", ["Tap every line that owns it"]), { ry: 1.0 });
    const own = group(g, -3.05, 0, -1.15, 1.0);
    for (const [oid, label, y, c] of [
      ["own-earlier-no-risk-wrong", "\"We said no risk. That was wrong.\"", 1.75, CCP_ACCENT], ["own-what-changed", "\"Here is what we learned.\"", 1.55, CCP_ACCENT],
      ["own-what-we-do-now", "\"Here is what we do now.\"", 1.35, CCP_ACCENT], ["own-blame-the-plant", "\"The plant misled us.\"", 1.15, 0x7fc4d8],
    ]) {
      const b = ball(own, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(own, label, 0.36, y, 0, { css: CCP_CSS, w: 0.62 });
      reg(hits, b, oid);
    }

    // ------------------------------------------------------------ the press
    const tripods = [];
    for (const [tx, tz] of [[-0.9, 1.6], [0.9, 1.7]]) {
      const tp = group(g, tx, 0, tz, Math.PI);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const leg = cyl(tp, 0.012, 0.012, 1.4, Math.sin(a) * 0.18, 0.68, Math.cos(a) * 0.18, 0x2a2e33, { rough: 0.5, metal: 0.6, seg: 6 });
        leg.rotation.x = Math.cos(a) * 0.14; leg.rotation.z = -Math.sin(a) * 0.14;
      }
      box(tp, 0.2, 0.16, 0.34, 0, 1.45, 0, 0x1b1f24, { rough: 0.4 });
      tripods.push(tp);
    }
    const reporter = standingPerson(g, 0.0, 2.1, { ry: Math.PI, cloth: 0x5a3a6a, hiVis: false });
    const reporterPhone = box(g, 0.07, 0.13, 0.01, 0.1, 1.5, 1.2, 0x1b1f24, { rough: 0.4, emissive: 0x7fc4d8, ei: 0.6 });
    reporterPhone.visible = false;
    standingPerson(g, -1.7, 2.0, { ry: Math.PI - 0.4, cloth: 0x3a5a6a, hiVis: false });
    const mother = standingPerson(g, 1.8, 1.9, { ry: Math.PI + 0.4, cloth: 0x6a4a3a, hiVis: false });
    holoTag(mother.torso, "Resident — school question", 0, 1.9, 0, { css: CCP_CSS, w: 0.5 }).rotation.y = -(Math.PI + 0.4);

    // ------------------------------------------------------------ the wrong moves
    bead(1.2, 1.25, 0.6, "cut-off-resident", "\"Next question\"", { color: 0xf0645b, css: "#f0645b", w: 0.36 });
    card(-1.3, 1.3, 1.0, "promise-all-clear", "Promise the all-clear?", "ALL CLEAR\nBY TONIGHT", {
      w: 0.44, ry: 0.4, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(-2.4, 1.1, 1.9, "off-record-briefing", "Brief one reporter aside?", { color: 0xf0645b, css: "#f0645b", w: 0.48 });
    card(0.55, 1.3, 1.0, "speculate-on-blame", "Name who caused it?", "IT WAS THE\nPLANT'S FAULT", {
      w: 0.4, ry: -0.2, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // Closing boards.
    const logBoard = board(0.56, 0.38, 3.3, 1.7, 1.9, (cx, w, h) => lines(cx, w, h, "JOINT INFORMATION LOG", ["Time · message · correction", "Next update: 4:00 pm"]), { ry: -1.1 });
    reg(hits, logBoard.userData.face, "jic-log-board");
    const checkin = board(0.5, 0.34, -3.3, 1.7, 0.2, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", ["How did that land?", "Who takes the next podium?"], { accent: "#7fc4d8" }), { ry: 1.1, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");

    // The guide's board (shared/ei-guide.js).
    const guide = board(0.62, 0.3, 0, 2.6, -2.2, (cx, w, h) => lines(cx, w, h, "FIRST · RIGHT · CREDIBLE", ["Confirm it, then say it."], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.14);
    });

    // ------------------------------------------------------------ the information centre lead
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const lead = standingFigure(g, 0.3, 0.3, { ry: 3.0, cloth: 0x2a3a5a, trousers: 0x262d36, vest: 0x3a7ad8 });
    holoTag(lead, "Information centre lead", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.46 }).rotation.y = -3.0;

    let live = false, radioLive = false;
    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.3, -1.8),

      onStepComplete(step) {
        if (step.id === "bring-up-the-pa") {
          live = true;
          liveLamp.material = mat(0xe04040, { emissive: 0xe04040, ei: 1.4, rough: 0.4 });
          paKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "map-into-frame") {
          mapGrp.position.set(1.05, 1.2, -1.62);
          mapGrp.rotation.y = -0.2;
        }
        if (step.id === "log-the-release") {
          repaint(logBoard.userData.face, (cx, w, h) => lines(cx, w, h, "LOGGED", ["Correction on the record", "Next update 4:00 pm"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "cut-off-resident" || id === "promise-all-clear") {
          mother.root.rotation.y = Math.PI + 1.4;
          mother.head.rotation.y = 0.5;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. She is the person this briefing is for.");
        }
      },

      onInterrupt(it) {
        if (it.id === "rumour-shouted") {
          reporter.root.position.set(0.1, 0, 1.35);
          reporter.arms[1].shoulder.rotation.x = -1.5;
          reporterPhone.visible = true;
          radioLive = true;
          radioLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.6, rough: 0.4 });
        }
        if (it.id === "zone-widens") {
          zoneRing.visible = true;
          zoneRing.scale.set(1.6, 1.6, 1.6);
          radioLive = true;
          radioLamp.material = mat(0xf2c14b, { emissive: 0xf2c14b, ei: 1.6, rough: 0.4 });
        }
      },
      onInterruptEnd(it) {
        radioLive = false;
        radioLamp.material = mat(0x2a3a2a, { rough: 0.4 });
        if (it.resolved !== "answered") return;
        if (it.id === "rumour-shouted") {
          reporter.root.position.set(0.0, 0, 2.1);
          reporter.arms[1].shoulder.rotation.x = 0;
          reporterPhone.visible = false;
        }
        if (it.id === "zone-widens") {
          repaint(mapFace, (cx, w, h) => {
            cx.fillStyle = "#e8e2d4"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "rgba(224,100,60,0.4)"; cx.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.55);
            cx.fillStyle = "#3a2a1a"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("AREA WIDENED — UPDATED", w / 2, h * 0.12);
          });
        }
      },

      animate(t, dt, session) {
        if (live) liveLamp.material.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.4;
        if (radioLive) {
          radioLamp.material.emissiveIntensity = Math.sin(t * 10) > 0 ? 2.0 : 0.3;
        }
        interpreter.arms[0].shoulder.rotation.x = -0.9 + Math.sin(t * 3.1) * 0.35;
        interpreter.arms[1].shoulder.rotation.x = -0.9 + Math.sin(t * 2.7 + 1) * 0.35;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "pace-the-statement") {
          const ok = gg.t >= 0.36 && gg.t <= 0.56;
          repaint(paceGauge.userData.screen, signFace(`${Math.round(90 + gg.t * 130)} WPM`, {
            bg: "#22170a", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbeedb", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "steady-under-questions" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(compGauge.userData.screen, signFace(ok ? "STEADY" : tr.v < 0.3 ? "RATTLED" : "DEFENSIVE", {
            bg: "#22170a", accent: ok ? "#59c97b" : "#f0645b", fg: "#fbeedb", scale: 0.5,
          }));
        }
      },
    };
  },
};
