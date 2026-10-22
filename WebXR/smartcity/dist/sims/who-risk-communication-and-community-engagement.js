import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Risk Communication and Community Engagement VR — Emergency
// Services, outbreak response. A community meeting under the market shelter,
// run the way WHO outbreak communication guidance describes it: the week's
// rumour and feedback log read first, a message that says what is known and
// what is not, trusted community voices at the front, the community's own
// language, listening before answering, rumours logged rather than repeated,
// questions answered in the open, and last week's answers posted so people
// can see the loop close. No health claim is made here beyond "what is
// known" as the response states it; the station teaches how, not what.

const WRC_ACCENT = 0xc98ad8;
const WRC_ALERT = 0xf0645b;

function wrcBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(20,10,24,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#c98ad8"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#f6eaf8"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#e0c8e8";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WRC_ACCENT });
}

export const SIM_WHO_RISK_COMMUNICATION_AND_COMMUNITY_ENGAGEMENT = {
  id: "who-risk-communication-and-community-engagement",
  index: "224",
  domain: "Emergency Services",
  trade: "Risk communication and community engagement officer — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  weather: "clear",
  certification: "WHO outbreak communication guidance — trust, announcing early, transparency, listening to the public and planning — as the risk communication and community engagement working group applies it; WHO infection prevention and control guidance for the practical advice given at the meeting; CDC isolation precautions for what families are told about a relative in isolation; OSHA 29 CFR 1910.1030 and 29 CFR 1910.134 for the health staff who attend; the Sphere Handbook's core humanitarian standard commitments on communication, participation and feedback, and IASC cluster coordination for sharing the rumour log across partners; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
  name: "Risk Communication and Community Engagement",
  title: simTitle("Risk Communication and Community Engagement"),
  tagline: "A community meeting in an outbreak: the rumour log read first, what is known and what is not, trusted voices at the front, the community's language, listening before answering, rumours logged not repeated, and the feedback loop closed",
  accent: WRC_ACCENT,
  accentCss: "#c98ad8",
  parSeconds: 320,
  footprint: 2.4,
  badge: { id: "loop-closed", name: "Loop Closed", note: "A message that said what is known and what is not, trusted voices heard, every rumour logged and none repeated, and last week's questions answered in public" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Community Voice",
    currency: "TRUST",
    ranks: ["Community Mobiliser", "RCCE Officer", "Engagement Lead", "RCCE Coordinator", "Community Voice Certified"],
    badges: [
      { id: "honest-message", name: "Honest Message", note: "Known, not yet known, doing, you can — first time", test: AWARD.stepClean("message-build") },
      { id: "no-harm-said", name: "No Harm Said", note: "No rumour repeated, no promise, no family named, no group blamed", test: AWARD.safe },
      { id: "heard-at-back", name: "Heard at the Back", note: "Loudspeaker set inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-meeting", name: "Clean Meeting", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "every-question", name: "Every Question", note: "Question tally kept without a dropout", test: AWARD.unbroken },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "wrc-repeat-rumour": "You read the rumour out word for word over the loudspeaker so you could deny it. A rumour repeated to the community — even to correct it — reaches people who had never heard it and is remembered long after the correction is forgotten; the meeting leads with what is known and what to do, and the rumour itself goes into the log.",
    "wrc-promise": "You told the crowd there would be no more deaths if everyone followed the advice. A promise the response cannot keep is the fastest way to lose the trust WHO outbreak communication guidance puts first: when the next death comes, everything else said at this meeting is remembered as a lie.",
    "wrc-name-family": "You named the family whose relative was taken to the treatment centre. Naming a family at a public meeting brings stigma to their door by evening, and it teaches every other household that telling the response about a sick relative means being named in front of the market.",
    "wrc-blame-group": "You agreed with the man blaming the traders from the next village. Blaming a group for an outbreak sets neighbours against each other, pushes that group away from the health services the whole area needs them to use, and has nothing to do with how the disease actually spreads.",
  },

  lateNotes: {
    "wrc-listening-mic": "Open the floor once the message has been given in the community's language — people cannot question a message they have not yet heard.",
    "wrc-poster": "Post the pictorial poster once the meeting has seen it explained; a poster without the conversation is just paper on a board.",
  },

  steps: [
    {
      id: "rumour-log", kind: "select", target: "wrc-rumour-log",
      title: "Read the week's rumour and feedback log",
      cue: "Read what the community has been saying and asking this week before you say anything to them.",
      why: "A meeting that answers questions nobody asked while ignoring the ones everyone is asking is a broadcast, not engagement. The rumour and feedback log collected by the teams all week tells you what people are worried about, what they have heard and what they need, so the meeting starts from the community's questions rather than the response's script.",
    },
    {
      id: "message-build", kind: "sequence",
      targets: ["wrc-card-know", "wrc-card-unknown", "wrc-card-doing", "wrc-card-you-can"],
      itemNames: { "wrc-card-know": "what we know", "wrc-card-unknown": "what we do not know yet", "wrc-card-doing": "what the response is doing", "wrc-card-you-can": "what you can do" },
      title: "Build the message in order",
      cue: "What we know, then what we do not know yet, then what the response is doing, then what people can do.",
      why: "Saying plainly what is known and what is not yet known is what makes a message believable when it changes next week — and in an outbreak it will. Ending on what people can do gives them something practical to take home, which is what turns a frightening announcement into a plan.",
      outOfOrderNote: "Known, not yet known, what we are doing, what you can do — honesty about the unknown comes before the advice.",
    },
    {
      id: "trusted-voices", kind: "find", noHint: true,
      targets: ["wrc-religious-leader", "wrc-womens-group", "wrc-youth-leader"],
      itemNames: { "wrc-religious-leader": "the religious leader", "wrc-womens-group": "the women's group chair", "wrc-youth-leader": "the youth leader" },
      itemNotes: {
        "wrc-religious-leader": "Standing at the edge of the shelter; people bring him their questions about funerals and prayers.",
        "wrc-womens-group": "Sitting with the market traders; she runs the savings group half the mothers belong to.",
        "wrc-youth-leader": "Leaning on the water tank; the young men who ride the motorbike taxis listen to him, not to officials.",
      },
      title: "Find the trusted voices",
      cue: "Look around the shelter and find the people this community already trusts — and bring them to the front.",
      why: "People believe advice from those they already trust, and in most communities that is not the response team. A religious leader, a women's group chair and a youth leader standing with the team change who the message is coming from — and they are also the people who will hear the next rumour first.",
    },
    {
      id: "interpreter", kind: "select", target: "wrc-interpreter",
      title: "Brief the interpreter",
      cue: "Go through the message with the interpreter in the community's language before the meeting starts.",
      why: "A message given in a second language is understood by the people who least need it. Briefing the interpreter first — on what is known and not known, and on the words that must not be softened or made stronger — is how the message stays honest in translation.",
    },
    {
      id: "flipchart", kind: "turn", target: "wrc-flipchart-crank",
      title: "Raise the pictorial flip chart",
      cue: "Crank the flip chart up to eye height so the pictures can be seen from the back benches.",
      why: "Pictures carry a message to people who do not read and to children who will repeat it at home. A flip chart set low is seen by the front row only; cranked to eye height, the whole shelter can follow the pictures while the interpreter speaks.",
      turn: { turns: 0.75, axis: "z", label: "FLIP CHART" },
    },
    {
      id: "pa-volume", kind: "gauge", target: "wrc-pa-volume",
      title: "Set the loudspeaker",
      cue: "Sweep the volume and commit where the back benches hear clearly without the front row flinching.",
      why: "Too quiet and the back of the crowd starts its own conversation; too loud and a frightening subject sounds like shouting at people. The right level lets an older person at the back hear every word and lets the front row ask a question without competing with the speaker.",
      gauge: { label: "VOLUME", speed: 0.6, green: [0.46, 0.6], readout: (t) => (t < 0.46 ? "lost at the back" : t > 0.6 ? "shouting" : "heard at the back"), missNote: "Not right yet. Sweep again and commit where it reads heard at the back." },
    },
    {
      id: "listen", kind: "hold", target: "wrc-listening-mic", seconds: 5,
      title: "Open the floor and listen",
      cue: "Hand the microphone to the community and hold — listen to the whole question before anyone answers.",
      why: "Listening is one of the principles WHO outbreak communication guidance names, and it is the one people notice. A question heard to the end, without interruption, tells the person asking that they matter, and it often turns out to be a different question from the one the team expected.",
      holdBreakNote: "You cut in before the question was finished. Hand the microphone back and let them finish.",
    },
    {
      id: "poster", kind: "drag", target: "wrc-poster",
      title: "Post the pictorial poster",
      cue: "Carry the poster to the market notice board and pin it where people pass.",
      why: "A meeting reaches the people who came to it; a poster at the market notice board reaches everyone who walks past for the next fortnight. Pinned after the meeting has explained it, it becomes a reminder of a conversation rather than an instruction from strangers.",
      drag: { to: "wrc-notice-board", radius: 0.5, missNote: "Not on the market board. The poster belongs where people pass every day." },
    },
    {
      id: "question-tally", kind: "track", target: "wrc-question-tally", seconds: 7,
      title: "Keep up with the questions",
      cue: "Log each question on the tally as it comes, and keep pace with the room.",
      why: "Every question asked is information: what people fear, what they have misunderstood, what the response has failed to explain. A tally kept as the questions come, not reconstructed afterwards, is what the RCCE working group uses to decide what next week's message needs to say.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "TALLY", readout: (v) => (v < 0.4 ? "falling behind" : v > 0.62 ? "writing, not listening" : "keeping pace") },
      holdBreakNote: "The tally slipped. Questions are being lost — catch back up with the room.",
    },
    {
      id: "close-loop", kind: "select", target: "wrc-answer-board",
      title: "Post last week's answers",
      cue: "Pin up the answers to the questions people asked last week, where everyone can see them.",
      why: "Communities stop giving feedback when it disappears into a notebook. Posting last week's answers in public shows that questions are heard and acted on, and it is the reason people will bother to tell the team about the next rumour instead of just passing it on.",
    },
    {
      id: "share-log", kind: "hold", target: "wrc-cluster-phone", seconds: 4,
      title: "Share the rumour log with the working group",
      cue: "Hold the line while the RCCE working group reads back the week's top rumours and questions.",
      why: "The same rumour usually surfaces in several places at once. Sharing the log with the RCCE working group, under IASC cluster coordination, lets every partner answer it the same way, and lets surveillance hear about the sick relative a question mentioned before the family decides to hide them.",
      holdBreakNote: "You hung up before the working group read it back. Call back and finish the handover.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wrc-crew-board",
      title: "Check in with the engagement team",
      cue: "After the meeting, check in with the team on the hard moments, and point anyone who needs it to staff care.",
      why: "Engagement teams absorb a community's fear and anger in person, sometimes directed at them by name. A few minutes after the meeting to talk through the hard moments — and to name staff care out loud — is how the team goes back to the next meeting still able to listen.",
    },
    {
      id: "closing-log", kind: "hold", target: "wrc-meeting-log", seconds: 4,
      title: "Close the meeting log",
      cue: "Hold the log open and read back attendance, the message given, the questions and the rumours before you sign.",
      why: "The meeting log is how the working group knows what was actually said in this community and what came back. Read back before signing, it catches the rumour that was mentioned but not written down, which is usually the one that matters next week.",
      holdBreakNote: "You signed without reading it back. Open the log and read the questions and rumours out first.",
    },
  ],

  interrupts: [
    {
      id: "rumour-shouted",
      kind: "Rumour in the crowd",
      after: "listen", delay: 2, seconds: 13,
      alert: "A man at the back stands up and shouts a rumour about the treatment centre across the whole shelter.",
      cue: "Write it into the feedback box log — then answer with what is known, not by repeating it.",
      target: "wrc-feedback-box",
      why: "A rumour shouted at a meeting is feedback: it tells the team what people are hearing. Logging it first means it reaches the working group; answering with what is known, calmly and without repeating the claim, gives the crowd something true to hold onto instead of an argument to remember.",
      missNote: "The rumour hung in the air unanswered and unlogged. It went round the market by evening, and the treatment centre saw fewer people come forward that week.",
      wrongNote: "Not that. Log the rumour in the feedback box first, then answer with what is known.",
    },
    {
      id: "radio-wants-statement",
      kind: "Media call",
      after: "question-tally", delay: 3, seconds: 13,
      alert: "The community radio host is on the phone wanting a statement on the new cases, live, right now.",
      cue: "Pass it to the designated spokesperson line — do not give a statement you have not cleared.",
      target: "wrc-spokesperson-line",
      why: "Planning is one of the principles in WHO outbreak communication guidance, and it includes who speaks. An uncleared figure given live to a radio host becomes the number everyone repeats; passing the call to the designated spokesperson means the community hears one consistent, checked message.",
      missNote: "The call went unanswered, then someone on the team gave an off-the-cuff figure to fill the silence. It was wrong, and the correction the next day was heard by far fewer people than the mistake.",
      wrongNote: "Not that. Put the radio host through to the designated spokesperson line.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WRC_ACCENT);

    // ---------------------------------------------------------- market ground and shelter
    const ground = box(g, 6.2, 0.06, 5.6, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(
      surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#a8845a", base2: "#967450", cracks: 35 }), { repeat: 3, px: 512 }),
      { rough: 0.95, metal: 0, color: 0xe8d6b8 },
    );
    const shelter = group(g, 0, 0, -0.6);
    for (const [px, pz] of [[-2.2, -1.4], [2.2, -1.4], [-2.2, 1.2], [2.2, 1.2], [0, -1.4], [0, 1.2]]) cyl(shelter, 0.06, 0.07, 2.6, px, 1.3, pz, 0x6a4a2a, { rough: 0.9, seg: 8 });
    const roofA = box(shelter, 4.8, 0.04, 1.5, 0, 2.65, -0.7, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    roofA.rotation.x = 0.18;
    const roofB = box(shelter, 4.8, 0.04, 1.5, 0, 2.65, 0.6, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    roofB.rotation.x = -0.18;

    // Benches with the community.
    for (let row = 0; row < 2; row++) {
      const bz = 0.7 + row * 0.8;
      const bench = group(g, 0.2, 0, bz);
      box(bench, 2.6, 0.06, 0.32, 0, 0.42, 0, 0x7a5a3a, { rough: 0.8 });
      for (const lx of [-1.2, 0, 1.2]) box(bench, 0.06, 0.42, 0.28, lx, 0.21, 0, 0x6a4a2a, { rough: 0.8 });
    }
    const seated = [[-0.8, 0.7, 0x8a4a6a], [-0.2, 0.7, 0x3a6a4a], [0.9, 0.7, 0x6a6a8a], [-0.5, 1.5, 0x8a6a3a], [0.6, 1.5, 0x4a5a8a]];
    for (const [sx, sz, c] of seated) seatedFigure(g, sx, 0.46, sz, { cloth: c, ry: Math.PI });
    const womens = seatedFigure(g, 0.3, 0.46, 0.7, { cloth: 0xc98a3a, ry: Math.PI });
    reg(hits, womens.torso, "wrc-womens-group");
    const shouter = standingFigure(g, 1.9, 1.6, { ry: Math.PI + 0.4, cloth: 0x5a3a2a, atStation: true });
    const shoutTag = holoTag(g, "\"The centre is where they...\"", 1.9, 2.15, 1.6, { css: "#f0645b", w: 0.46 });
    shoutTag.visible = false;

    // ---------------------------------------------------------- the front: team table, flip chart, loudspeaker
    const table = group(g, -0.9, 0, -1.2);
    box(table, 1.3, 0.05, 0.55, 0, 0.74, 0, 0x8a8f94, { rough: 0.5, metal: 0.3 });
    for (const [lx, lz] of [[-0.6, -0.22], [0.6, -0.22], [-0.6, 0.22], [0.6, 0.22]]) cyl(table, 0.015, 0.015, 0.74, lx, 0.37, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
    const log = decal(table, 0.28, 0.2, -0.4, 0.77, 0, paperFace("RUMOUR + FEEDBACK LOG", ["Heard at the water point", "Asked at the market", "Asked by the traders"], { band: "#6a3a7a" }), { px: 256 });
    log.rotation.x = -Math.PI / 2;
    reg(hits, log, "wrc-rumour-log");
    const cards = [["wrc-card-know", "1 WE KNOW", -0.1], ["wrc-card-unknown", "2 NOT YET KNOWN", 0.12], ["wrc-card-doing", "3 WE ARE DOING", 0.34], ["wrc-card-you-can", "4 YOU CAN", 0.56]];
    for (const [id, label, x] of cards) {
      const c = decal(table, 0.2, 0.12, x, 0.771, 0.05, signFace(label, { bg: "#1a0c1e", accent: "#c98ad8", scale: 0.32 }), { px: 128 });
      c.rotation.x = -Math.PI / 2;
      reg(hits, c, id);
    }
    const tally = instrument(table, 0.25, 0.78, -0.18, { idle: "Q: 0", color: WRC_ACCENT, w: 0.14, d: 0.2 });
    holoTag(tally, "Question tally", 0, 0.14, 0, { css: "#c98ad8", w: 0.26 });
    reg(hits, tally, "wrc-question-tally");
    const phone = group(table, -0.6, 0.77, -0.15);
    box(phone, 0.07, 0.01, 0.14, 0, 0.005, 0, 0x111418, { rough: 0.3 });
    holoTag(phone, "Working group line", 0, 0.12, 0, { css: "#c98ad8", w: 0.3 });
    reg(hits, phone, "wrc-cluster-phone");
    const promise = box(table, 0.2, 0.2, 0.2, 0.2, 1.3, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(table, "\"No more deaths, I promise\"?", 0.2, 1.5, 0.3, { css: "#f0645b", w: 0.44 });
    reg(hits, promise, "wrc-promise");

    const flip = group(g, 0.8, 0, -1.5);
    for (const lx of [-0.3, 0.3]) cyl(flip, 0.015, 0.015, 1.6, lx, 0.8, 0.1, CITY.darkSteel, { rough: 0.5, seg: 6 });
    cyl(flip, 0.015, 0.015, 1.6, 0, 0.8, -0.25, CITY.darkSteel, { rough: 0.5, seg: 6 });
    const chart = group(flip, 0, 0.9, 0.12);
    box(chart, 0.7, 0.9, 0.02, 0, 0, 0, 0xf4f2ea, { rough: 0.8 });
    decal(chart, 0.62, 0.8, 0, 0, 0.012, (cx, w, h) => {
      cx.fillStyle = "#f4f2ea"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#3a7ab8"; cx.beginPath(); cx.arc(w * 0.3, h * 0.3, w * 0.12, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = "#59a95b"; cx.fillRect(w * 0.55, h * 0.2, w * 0.3, h * 0.2);
      cx.fillStyle = "#c98ad8"; cx.fillRect(w * 0.15, h * 0.6, w * 0.7, h * 0.08);
      cx.fillStyle = "#1d262e"; cx.font = `600 ${Math.round(h * 0.06)}px Arial`; cx.fillText("WASH HANDS · CALL THE TEAM", w * 0.1, h * 0.85);
    }, { px: 256 });
    const crank = cyl(flip, 0.03, 0.03, 0.06, 0.34, 0.9, 0.1, CITY.steel, { rough: 0.3, metal: 0.8, seg: 10 });
    crank.rotation.z = Math.PI / 2;
    holoTag(flip, "Flip-chart crank", 0.34, 1.1, 0.1, { css: "#c98ad8", w: 0.28 });
    reg(hits, crank, "wrc-flipchart-crank");

    const pole = group(g, -2.3, 0, -1.9);
    cyl(pole, 0.04, 0.05, 2.6, 0, 1.3, 0, 0x8a8f94, { rough: 0.5, metal: 0.5, seg: 8 });
    const horn = cyl(pole, 0.05, 0.16, 0.3, 0, 2.4, 0.15, 0xe8eef2, { rough: 0.4, seg: 12 });
    horn.rotation.x = Math.PI / 2;
    const amp = instrument(pole, 0.2, 1.0, 0.1, { idle: "VOL", color: WRC_ACCENT, w: 0.14, d: 0.2 });
    amp.rotation.x = Math.PI / 2;
    holoTag(pole, "Loudspeaker volume", 0.2, 1.25, 0.1, { css: "#c98ad8", w: 0.3 });
    reg(hits, amp, "wrc-pa-volume");
    const rumourHorn = box(pole, 0.3, 0.3, 0.3, 0, 2.4, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(pole, "Read the rumour out to deny it?", 0, 2.75, 0.3, { css: "#f0645b", w: 0.5 });
    reg(hits, rumourHorn, "wrc-repeat-rumour");

    // Microphone stand, feedback box, spokesperson line.
    const mic = group(g, -0.1, 0, -0.35);
    cyl(mic, 0.012, 0.012, 1.3, 0, 0.65, 0, CITY.darkSteel, { rough: 0.5, seg: 6 });
    ball(mic, 0.035, 0, 1.33, 0, 0x2b3236, { rough: 0.5 });
    holoTag(mic, "Community microphone", 0, 1.55, 0, { css: "#c98ad8", w: 0.34 });
    reg(hits, mic, "wrc-listening-mic");
    const fbox = group(g, -2.0, 0, 0.3);
    box(fbox, 0.4, 0.5, 0.35, 0, 0.9, 0, 0xc98ad8, { rough: 0.6 });
    box(fbox, 0.05, 0.65, 0.05, 0, 0.33, 0, 0x6a4a2a, { rough: 0.8 });
    decal(fbox, 0.32, 0.1, 0, 1.0, 0.18, signFace("FEEDBACK", { bg: "#1a0c1e", accent: "#fff", scale: 0.45 }), { px: 128 });
    const fboxSlip = box(fbox, 0.16, 0.004, 0.1, 0, 1.16, 0, 0xf4f2ea, { rough: 0.8 });
    fboxSlip.visible = false;
    reg(hits, fbox, "wrc-feedback-box");
    const spokes = group(g, -1.55, 0.77, -1.0);
    box(spokes, 0.07, 0.01, 0.14, 0, 0.005, 0, 0x111418, { rough: 0.3 });
    const spokesLamp = ball(spokes, 0.014, 0, 0.02, -0.05, WRC_ALERT, { emissive: WRC_ALERT, ei: 2.4, rough: 0.4 });
    spokesLamp.visible = false;
    holoTag(spokes, "Spokesperson line", 0, 0.12, 0, { css: "#c98ad8", w: 0.28 });
    reg(hits, spokes, "wrc-spokesperson-line");
    const van = group(g, -3.2, 0, 2.2, 0.4);
    box(van, 1.6, 1.1, 0.9, 0, 0.75, 0, 0xe8eef2, { rough: 0.4, metal: 0.3 });
    decal(van, 0.7, 0.18, 0, 0.9, 0.46, signFace("COMMUNITY RADIO", { bg: "#e8eef2", accent: "#c98ad8", fg: "#1d262e", scale: 0.36 }), { px: 192 });
    van.visible = false;

    // ---------------------------------------------------------- trusted voices, interpreter, team
    const religious = standingFigure(g, -2.5, -0.9, { ry: 0.9, cloth: 0xf4f2ea, atStation: true });
    reg(hits, religious, "wrc-religious-leader");
    const tankGrp = group(g, 2.6, 0, -1.0);
    cyl(tankGrp, 0.4, 0.4, 1.2, 0, 0.6, 0, 0x2a2e33, { rough: 0.6, seg: 16 });
    const youth = standingFigure(g, 2.35, -0.25, { ry: -1.8, cloth: 0x2a4a8a, atStation: true });
    reg(hits, youth, "wrc-youth-leader");
    const interp = standingFigure(g, 0.3, -1.25, { ry: 0.2, cloth: 0x7a4a8a, vest: WRC_ACCENT, atStation: true });
    holoTag(interp, "Interpreter", 0, 1.95, 0, { css: "#c98ad8", w: 0.22 });
    reg(hits, interp, "wrc-interpreter");
    standingFigure(g, -1.1, -1.85, { ry: 0.3, cloth: 0x37505f, vest: WRC_ACCENT, atStation: true });

    // Hazard figures: the named family, the blamed group.
    const familyTag = box(g, 0.3, 0.3, 0.3, 1.4, 1.1, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Name the family to explain?", 1.4, 1.35, 0.7, { css: "#f0645b", w: 0.44 });
    reg(hits, familyTag, "wrc-name-family");
    const blameTag = box(g, 0.3, 0.3, 0.3, 2.3, 1.5, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "\"It's those traders\" — agree?", 2.3, 1.75, 0.9, { css: "#f0645b", w: 0.44 });
    reg(hits, blameTag, "wrc-blame-group");

    // Notice board, poster, answer board.
    const board = group(g, 1.9, 0, -1.9, -0.4);
    for (const lx of [-0.5, 0.5]) box(board, 0.08, 1.9, 0.08, lx, 0.95, 0, 0x6a4a2a, { rough: 0.8 });
    box(board, 1.1, 0.8, 0.04, 0, 1.4, 0, 0x8a6a4a, { rough: 0.9 });
    const boardSocket = box(board, 0.5, 0.6, 0.02, -0.25, 1.4, 0.03, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["wrc-notice-board"] = boardSocket;
    const answers = decal(board, 0.44, 0.6, 0.27, 1.4, 0.03, paperFace("YOU ASKED, WE ANSWER", ["Last week's questions", "and the team's answers", "Ask again at the box"], { band: "#6a3a7a" }), { px: 256 });
    reg(hits, answers, "wrc-answer-board");
    const poster = group(g, -0.2, 0.77, -1.05);
    box(poster, 0.3, 0.01, 0.4, 0, 0, 0, 0xf4f2ea, { rough: 0.8 });
    holoTag(poster, "Pictorial poster", 0, 0.1, 0, { css: "#c98ad8", w: 0.26 });
    reg(hits, poster, "wrc-poster");

    const crewBoard = wrcBoard(g, 0.6, 0.4, -2.5, 1.5, 1.4, "TEAM CHECK-IN", ["What was hard today?", "Staff care is there to use", "Debrief before the drive"], { ry: Math.PI / 2.4, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wrc-crew-board");
    const meetingLog = wrcBoard(g, 0.55, 0.4, -0.3, 1.9, -1.95, "MEETING LOG", ["Attendance · message", "Questions · rumours", "Answers owed"]);
    reg(hits, meetingLog, "wrc-meeting-log");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(-0.2, 1.1, -1.2),

      onStepComplete(step) {
        if (step.id === "trusted-voices") { religious.position.set(-1.8, 0, -1.6); youth.position.set(1.5, 0, -1.2); }
        if (step.id === "poster") { poster.parent.remove(poster); board.add(poster); poster.position.set(-0.25, 1.4, 0.04); poster.rotation.set(Math.PI / 2, 0, 0); }
        if (step.id === "close-loop") repaint(answers, paperFace("YOU ASKED, WE ANSWER", ["Posted today", "12 answers", "Ask again at the box"], { band: "#2f7d4a" }));
        if (step.id === "closing-log") repaint(meetingLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(20,10,24,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("LOG SIGNED", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "rumour-shouted") { shoutTag.visible = true; shouter.position.set(1.6, 0, 1.1); }
        if (it.id === "radio-wants-statement") { spokesLamp.visible = true; van.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "rumour-shouted") { shoutTag.visible = false; fboxSlip.visible = true; shouter.position.set(1.9, 0, 1.6); }
        if (it.id === "radio-wants-statement") { spokesLamp.visible = false; }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const step = session?.step;
        if (spokesLamp.visible && spokesLamp.material) spokesLamp.material.emissiveIntensity = 1.6 + Math.sin(t * 9) * 1.2;
        if (session?.turn && step?.id === "flipchart") { crank.rotation.x = session.turn.amount * Math.PI * 2; chart.position.y = 0.9 + session.turn.amount * 0.3; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "pa-volume") {
          const ok = gg.t >= 0.46 && gg.t <= 0.6;
          repaint(amp.userData.screen, signFace(`VOL ${Math.round(gg.t * 10)}`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f2c14b", fg: "#eafcf9", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "question-tally") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          repaint(tally.userData.screen, signFace(ok ? "KEEPING UP" : "BEHIND", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.5 }));
        }
      },
    };
  },
};
