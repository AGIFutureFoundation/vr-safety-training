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
import { plantHardHat } from "../../../shared/eggs.js";

// SmartCiti.X~ Restorative Justice Circle VR — Civic Leadership and Emotional
// Intelligence, deepening the programme.
//
// A recreation centre's multipurpose room, the evening after a fifteen-year-
// old spray-painted over the memorial mural on its wall. Instead of only a
// police report, the centre has offered a restorative circle: the young
// person and his grandmother, the artist who painted the mural, the centre's
// coordinator, a neighbour whose brother the mural remembers, a co-keeper —
// and the learner as the circle keeper.
//
// Conflict Mediation Room already teaches a mediator between two neighbours.
// This station is different in kind: a harm has been done, the person who did
// it has agreed to face the people it hurt, and the keeper's work is almost
// entirely listening — holding the talking piece's rule, keeping speaking
// time fair, taking the heat out without taking the truth out, and knowing
// where confidentiality ends. The restorative questions commonly taught —
// what happened, who has been affected and how, what is needed to make things
// right — are stated generically: no particular restorative-justice
// programme's or trainer's curriculum is sourced in this repository. Every
// person is invented; the leadership principles are those commonly taught in
// civic-leadership programmes, and the foundation whose principles the
// programme draws on is not sourced in this repository.

const RJK_ACCENT = 0xb08ad0;
const RJK_CSS = "#b08ad0";

export const SIM_CV_RESTORATIVE_JUSTICE_CIRCLE_FACILITATION = {
  id: "cv-restorative-justice-circle-facilitation",
  index: "321",
  domain: "Civic",
  trade: "Restorative circle keeper — community programme",
  category: "Community Environmental Justice",
  indoor: "service",
  weather: "overcast",
  certification: "SAMHSA's trauma-informed principles — safety, trustworthiness and transparency, peer support, collaboration, empowerment and voice, and cultural responsiveness — for a circle where harm is named; Psychological First Aid (NCTSN and the National Center for PTSD) for a participant overwhelmed mid-circle; the California Child Abuse and Neglect Reporting Act (CANRA), named as a body, for the limit of any confidentiality promised to a minor when a keeper or co-keeper is a mandated reporter; the NASW Code of Ethics for the social worker co-keeping; Title II of the ADA for access to a city-run programme; SEIU and AFSCME for the recreation-centre staff who host community programmes. The restorative questions are stated generically; no restorative-justice programme's curriculum is sourced in this repository. The leadership principles practised here are those commonly taught in civic-leadership programmes; the foundation whose principles the programme draws on is not sourced in this repository",
  name: "Restorative Justice Circle",
  title: simTitle("Restorative Justice Circle"),
  tagline: "A mural painted over, and the people it hurt in one circle: consent checked, the talking piece's rule held, the artist and the young person each heard whole, speaking time kept fair, the heat taken out without the truth — and an agreement he owns",
  accent: RJK_ACCENT,
  accentCss: RJK_CSS,
  parSeconds: 340,
  footprint: 2.3,
  badge: { id: "circle-kept", name: "Circle Kept", note: "A whole circle held fair: every voice heard, nobody shamed, nothing promised that was not yours to promise" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your programme's clinical supervisor or employee assistance line, or the co-keeper you debrief with — holding other people's grief and shame for two hours is real work",

  game: system({
    name: "Talking Piece",
    currency: "REPAIR",
    ranks: ["Circle Member", "Co-Keeper", "Circle Keeper", "Lead Keeper", "Keeper Mentor"],
    badges: [
      { id: "circle-ready", name: "Circle Ready", note: "Every part of the circle set up first time", test: AWARD.stepClean("prepare-the-circle") },
      { id: "nobody-shamed", name: "Nobody Shamed", note: "No unsafe action anywhere in the circle", test: AWARD.safe },
      { id: "harm-seen", name: "Harm Seen", note: "Everyone the harm reached found first time", test: AWARD.stepClean("name-who-was-affected") },
    ],
    challenges: [
      { id: "clean-circle", name: "Clean Circle", note: "No corrections anywhere in the circle", test: AWARD.clean },
      { id: "fair-share", name: "Fair Share", note: "Speaking time set inside the band", test: AWARD.precise(0.7) },
      { id: "deep-listening", name: "Deep Listening", note: "Both listening holds and the temperature carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "promise-no-charges": "You told him that if the circle goes well the police report will disappear. What happens to the report is decided by people who are not in this room, a keeper cannot promise it, and a promise like that turns a voluntary circle into a bargain — if the outcome goes the other way, he will believe the circle lied to him, and he will be right.",
    "share-circle-story": "You told the neighbourhood association what he said about why he did it. What is said in the circle stays in the circle, except for the limits named at the start; repeating his story outside turns the most honest thing a fifteen-year-old has said all year into neighbourhood gossip, and nobody in this circle will speak freely in one of yours again.",
    "demand-apology-now": "You told him to apologise right now, in front of everyone. A forced apology is a performance, and everyone in the circle can hear it; it shames him without repairing anything and teaches him that the circle is a punishment with chairs. An apology that means something comes when he has heard what the harm was — if it comes at all, it is his.",
    "third-circle-tonight": "You agreed to keep a third circle tonight, back to back, without a debrief. Keeping a circle means holding grief, anger and shame in the room for hours; a keeper who runs on empty misses the moment someone goes quiet, and one tired lapse can undo a family's trust in the whole programme.",
  },

  lateNotes: {
    "agreement-card": "The agreement comes once everyone affected has been named and heard — the circle is not there yet.",
    "circle-log-board": "The circle record closes once the agreement is written. There is nothing to record yet.",
  },

  steps: [
    {
      id: "prepare-the-circle", kind: "find", noHint: true,
      targets: ["prep-chairs-in-circle", "prep-talking-piece", "prep-centrepiece", "prep-tissues-water"],
      itemNames: {
        "prep-chairs-in-circle": "chairs in one circle, no table, the same for everyone",
        "prep-talking-piece": "a talking piece that means something here",
        "prep-centrepiece": "a centrepiece that reminds everyone why they came",
        "prep-tissues-water": "tissues and water within everyone's reach",
      },
      itemNotes: {
        "prep-chairs-in-circle": "One circle, the same chairs, no table: nobody sits at the head and nobody hides behind furniture. The shape itself says everyone here is equal.",
        "prep-talking-piece": "A brush from the mural's paint kit, lent by the artist. Only the person holding it speaks — it slows the room down and gives the quiet ones a turn.",
        "prep-centrepiece": "A photo of the mural as it was, and a small lamp. People look at the centre when it is hard to look at each other.",
        "prep-tissues-water": "Somebody will cry tonight. Tissues within reach say that is allowed without anyone having to ask.",
      },
      decoyNotes: {
        "prep-podium": "A podium puts one person above the circle. Nobody needs to stand and speak down to anyone tonight; leave it against the wall.",
      },
      title: "Set up the circle before anyone arrives",
      cue: "Find everything the circle needs to feel equal and safe before the participants come in.",
      why: "People arriving at a circle about a harm come in braced: the young person expects a trial, the people harmed expect to be disappointed. A single circle of matching chairs with no table, a talking piece with meaning, a centrepiece that holds the reason everyone came, and tissues in reach tell them before a word is spoken that this is a different kind of room — one where every voice has the same weight and feeling is allowed.",
    },
    {
      id: "confirm-consent", kind: "select", target: "consent-card",
      title: "Confirm everyone is here by choice",
      cue: "Before starting, confirm from the pre-circle meetings that the young person and the people harmed each agreed freely to be here.",
      why: "A restorative circle only works if the person who caused harm chooses to face it, and the people harmed choose to take part. Pre-circle meetings with each of them are where that choice is made; the keeper confirms it before the talking piece moves. A young person pushed into a circle by adults, or a harmed person who feels obliged, turns repair into pressure, and the whole programme's promise that it is voluntary becomes untrue.",
    },
    {
      id: "latch-the-door", kind: "turn", target: "privacy-latch",
      title: "Turn the privacy latch and the in-session sign",
      cue: "Turn the latch on the room's door so the sign reads IN SESSION and nobody walks in mid-circle.",
      turn: { turns: 0.5, axis: "z", label: "IN SESSION" },
      why: "The things that matter most in a circle — a grandmother's shame, a young person's reason, an artist's grief — are said only when people believe no one else will hear them. A recreation centre is full of people who wander into rooms. Turning the latch and the in-session sign is the physical half of the confidentiality the keeper is about to promise, and it keeps a well-meaning staff member from walking into the hardest moment of the evening.",
    },
    {
      id: "open-the-circle", kind: "sequence",
      targets: ["open-welcome-purpose", "open-guidelines", "open-confidential-limits", "open-talking-piece"],
      itemNames: {
        "open-welcome-purpose": "welcome everyone, and say why we are here",
        "open-guidelines": "guidelines the circle agrees on together",
        "open-confidential-limits": "what stays here — and the one limit",
        "open-talking-piece": "how the talking piece works",
      },
      title: "Open the circle in order",
      cue: "Welcome and purpose, the guidelines the circle agrees, confidentiality and its limit, then the talking piece.",
      why: "The opening sets the room's rules and makes them the circle's own. Welcome and purpose first, so everyone knows this is about repairing harm and not about punishing; guidelines the circle agrees together, so they are not the keeper's; confidentiality with its honest limit — a keeper who is a mandated reporter must report suspected abuse of a child — so nobody is misled; and last the talking piece, which puts all of it into practice.",
      outOfOrderNote: "Welcome and purpose, guidelines, confidentiality and its limit, then the talking piece. Handing round the piece before the limits are said means someone may speak believing a promise nobody made.",
    },
    {
      id: "listen-to-the-artist", kind: "hold", target: "listen-artist", seconds: 8,
      title: "Hear the artist whole",
      cue: "The artist has the talking piece. Hold your attention on her until she passes it on — no nodding him along, no summarising.",
      why: "The person harmed usually speaks first, and what she says is rarely only about paint. The mural was for a young man from this block who died; painting over it felt to her like painting over him. Listening to all of it, without interrupting, summarising or glancing at the young person to check his reaction, lets the real harm come into the room — and it is the thing he most needs to hear, from her, not from the keeper.",
      holdBreakNote: "You looked away while she was speaking and she faltered. Come back to her until she passes the piece.",
    },
    {
      id: "keep-speaking-time-fair", kind: "gauge", target: "balance-meter",
      title: "Keep speaking time fair across the circle",
      cue: "The piece has gone round twice. Commit the balance for the next round inside the band — every voice with a real share, no voice swallowing the room.",
      gauge: {
        label: "SPEAKING TIME", speed: 0.6, green: [0.38, 0.6],
        readout: (t) => (t < 0.38 ? "the adults dominate" : t <= 0.6 ? "balanced" : "one voice floods it"),
        missNote: "Outside the band. When the adults take all the time, the young person goes silent; when one voice floods the round, the others stop trying. Keep a real share for everyone.",
      },
      why: "Circles tip easily. Five adults with strong feelings can fill every round and leave the young person a sentence at the end; one grieving voice can fill a round so completely that the others give up. The keeper watches the balance and gently resets it — a reminder of the guideline, starting the next round with the quietest person — because the repair only happens if every person in the circle is actually heard.",
    },
    {
      id: "listen-to-the-young-person", kind: "hold", target: "listen-youth", seconds: 8,
      title: "Hear the young person whole",
      cue: "He has the talking piece now. Hold your attention on him — no correcting, no prompting, no rescuing him from the silence.",
      why: "A fifteen-year-old facing the people he hurt will speak slowly, badly and with long silences. Listening without correcting his version, prompting him towards the right words or rescuing him from the pause gives him the chance to say something true — about the dare, the brother he never knew, the anger he did not know where to put. What he says in his own words is what the agreement will later be built on.",
      holdBreakNote: "You filled his silence for him. He stopped, relieved and unfinished. Give him back the pause and wait.",
    },
    {
      id: "reflect-the-impact", kind: "select", target: "reflect-card",
      title: "Reflect back what you heard, without blame",
      cue: "\"What I'm hearing is that the mural held a memory for this block, and that you didn't know that when you painted over it.\"",
      why: "A good reflection gives each person proof they were heard and puts the impact and the intent side by side without ranking them. Naming what the mural meant to the block, and what he says he did not know, lets the artist hear that her grief landed and lets him hear the harm described without being called a vandal. It is how the keeper takes the heat out of the room without taking the truth out.",
    },
    {
      id: "name-who-was-affected", kind: "find", noHint: true,
      targets: ["affected-artist", "affected-family", "affected-centre-kids", "affected-grandmother"],
      itemNames: {
        "affected-artist": "the artist, who painted it over a summer",
        "affected-family": "the family of the young man it remembers",
        "affected-centre-kids": "the children who walk past it to the centre every day",
        "affected-grandmother": "his grandmother, who has to face the neighbours",
      },
      itemNotes: {
        "affected-artist": "A summer of work and a promise to a grieving family, both painted over in one night.",
        "affected-family": "They were not in the room, but the neighbour is his brother. For them, the wall was a grave marker.",
        "affected-centre-kids": "The children who come to the centre watched their wall be defaced, and are watching what happens next.",
        "affected-grandmother": "Harm spreads to the family of the person who caused it too. She is carrying shame she did nothing to earn.",
      },
      decoyNotes: {
        "affected-insurer": "The centre's insurer will process a claim, but it is not a person in this story. The circle is about the people the harm reached.",
      },
      title: "Name everyone the harm reached",
      cue: "Look around the circle and beyond it. Mark every person or group this harm affected.",
      why: "The restorative question is not only what happened but who has been affected and how, and the answer is always wider than the obvious victim. Naming the artist, the family the mural remembers, the children who pass it every day, and his own grandmother lets him see the full reach of one night's act — which does more for accountability than any lecture — and lets everyone in the circle see that their hurt has been counted.",
    },
    {
      id: "hold-the-temperature", kind: "track", target: "temperature-meter", seconds: 8,
      title: "Hold the emotional temperature of the circle",
      cue: "Keep the room inside the band while the brother speaks about his loss: warm enough for grief, steady enough that nobody is swept away.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "TEMPERATURE",
        readout: (v) => (v < 0.3 ? "shut down" : v > 0.7 ? "boiling over" : "held"),
      },
      why: "Grief and anger will rise in a circle about a memorial, and they should: that is the harm being felt. The keeper's job is not to cool the room to nothing but to keep it inside a band — a slower round, a pause, a hand on the talking piece, a reminder of the guidelines — so that feeling is expressed without anybody being attacked or anybody shutting down. Psychological First Aid's slow, calm presence is the same skill.",
      holdBreakNote: "The room slipped — it boiled over, or went cold and silent. Slow the round down and bring it back into the band.",
    },
    {
      id: "carry-the-agreement", kind: "drag", target: "agreement-card",
      title: "Carry his first offer to the agreement board",
      cue: "He has offered to help the artist repaint the mural. Carry that card to the agreement board.",
      drag: {
        to: "agreement-board", radius: 0.55,
        missNote: "Not on the agreement board. What he has offered belongs where the whole circle can see it and shape it — not in your notes.",
      },
      why: "The best agreements come from the person who caused the harm, shaped by the people it hurt. His offer to help repaint — with the artist, alongside the brother if the family wants it — goes onto the board where the whole circle can see it, question it and add to it. Putting it in the middle of the room rather than writing it in the keeper's notebook keeps it his offer and the circle's agreement, not the keeper's plan.",
    },
    {
      id: "shape-the-agreement", kind: "sequence", anyOrder: true,
      targets: ["agree-specific", "agree-achievable", "agree-his-own", "agree-follow-up"],
      itemNames: {
        "agree-specific": "specific: which Saturdays, with whom",
        "agree-achievable": "achievable for a fifteen-year-old",
        "agree-his-own": "in his own words, not the adults'",
        "agree-follow-up": "a follow-up circle, with a date",
      },
      title: "Shape the agreement so it can actually be kept",
      cue: "Specific, achievable for him, in his words, and a date to meet again.",
      why: "An agreement that says \"he will make amends\" is kept by nobody; one that says which Saturdays he will paint, with whom, in words he chose, and when the circle meets again to see how it went, can be kept and checked. It has to be achievable for a fifteen-year-old with school and a grandmother to help — an agreement built to fail is punishment in disguise. The follow-up date is what turns an evening into repair.",
    },
    {
      id: "close-the-circle-log", kind: "select", target: "circle-log-board",
      title: "Record the agreement — not the stories",
      cue: "Log that the circle took place, who agreed to what, and the follow-up date. Nothing anyone said in the round.",
      why: "The programme needs a record that the circle happened, what was agreed and when it will be reviewed; it must not hold what people said in the round, which was said on a promise of confidentiality. Recording the agreement and the date, and noting separately that a mandated report was made if one was, keeps the programme accountable and keeps faith with every person who spoke tonight.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Debrief with your co-keeper before you go",
      cue: "Ten minutes: how did it land on each of you, did either of you lean, and who follows up on the report?",
      why: "Keeping a circle means holding other people's grief and shame without letting it show, and it comes out afterwards. A debrief with the co-keeper — how did it land, did either of us favour someone, who is following up on the report and the family — is how keepers stay steady for the next circle and catch their own blind spots. Naming the clinical supervisor or employee assistance line is part of the job, not an extra.",
    },
  ],

  interrupts: [
    {
      id: "grandmother-breaks-in",
      kind: "Talking-piece rule broken",
      after: "listen-to-the-young-person", delay: 3, seconds: 12,
      alert: "While he is speaking, his grandmother breaks in over him: \"Tell them the truth — tell them how you've shamed this family!\"",
      cue: "Gently restate the talking-piece guideline, give the piece back to him, and promise her turn is coming.",
      target: "talking-piece-guideline",
      why: "A grandmother's shame is real and it will need its own time, but breaking in takes away the one thing the circle promised him: to be heard to the end. Restating the guideline gently and to everyone, handing the piece back to him and assuring her that her turn comes next protects his voice without shaming hers. Her words will matter more when they come in her own turn.",
      missNote: "Nobody stopped it. He went silent under her words and would not take the talking piece again; the rest of the circle heard about him from the adults, and never from him.",
      wrongNote: "Listening harder to him does not stop her. Restate the talking-piece guideline, gently, and give the piece back to him.",
    },
    {
      id: "disclosure-mid-circle",
      kind: "Disclosure of possible abuse",
      after: "hold-the-temperature", delay: 3, seconds: 12,
      alert: "Asked what was going on for him that night, he says quietly that he did not want to go home, because of what his stepfather does when he has been drinking.",
      cue: "Pause the circle with care, let the co-keeper hold the room, and speak with him privately — the report limit you named at the start now applies.",
      target: "pause-and-support-card",
      why: "This is the limit the keeper named in the opening. A mandated reporter who hears a young person disclose possible abuse has to report it, and has to handle the moment so that he is safe and not exposed in front of the circle. Pausing with care, letting the co-keeper hold the room, and speaking with him privately — honestly, about what happens next — is both the law and the kindest thing in the room.",
      missNote: "The circle moved on to the agreement as if nothing had been said. He had told a room of adults something frightening and watched them carry on; nobody reported it, and the one person the circle most needed to protect went home to it.",
      wrongNote: "Lowering the temperature is not the response to a disclosure. Pause the circle, let the co-keeper hold the room, and speak with him privately.",
    },
  ],

  build(root) {
    plantHardHat(root, THREE, "cv-restorative-justice-circle-facilitation", [2.4, 1.1, -2.4]); // Hard Hat Hunt — docs/easter-egg.md
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, RJK_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? RJK_ACCENT, { emissive: o.color ?? RJK_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? RJK_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1a1224", accent: o.accent ?? RJK_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? RJK_CSS, w: o.w ?? 0.48 });
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
      box(c, 0.46, 0.05, 0.44, 0, 0.46, 0, color, { rough: 0.7 });
      box(c, 0.46, 0.46, 0.04, 0, 0.72, -0.2, color, { rough: 0.7 });
      cyl(c, 0.025, 0.04, 0.44, 0, 0.22, 0, 0x2a2d31, { rough: 0.5, metal: 0.6, seg: 8 });
      return c;
    };
    const lines = (cx, w, h, title, rows, o = {}) => {
      cx.fillStyle = o.bg ?? "rgba(20,14,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? RJK_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#f6f0fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#dccbe8";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? RJK_ACCENT, { rough: 0.5, emissive: o.accent ?? RJK_ACCENT, ei: 0.25 });
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

    // ------------------------------------------------------------ the multipurpose room
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 12, base: "#a07a52", base2: "#946e48", seam: "rgba(50,30,14,0.35)",
    }), { repeat: 3, px: 384 });
    const floor = box(g, 8.0, 0.02, 6.6, 0, 0.01, -0.5, 0xa07a52, { rough: 0.7, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.7, metal: 0.02, color: 0xae8860 });
    const rugTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#5a4a6a", base2: "#524262", seam: "rgba(20,14,28,0.3)",
    }), { repeat: 2, px: 256 });
    const rug = cyl(g, 1.75, 1.75, 0.012, 0, 0.024, -1.2, 0x5a4a6a, { rough: 0.95, seg: 32, cast: false });
    rug.material = texturedMat(rugTex, { rough: 0.95, metal: 0.02, color: 0x6a5a7a });

    // The mural wall, with the grey patch sprayed over the memorial.
    const wall = box(g, 8.0, 2.8, 0.1, 0, 1.4, -3.8, 0xd8d0c4, { rough: 0.85 });
    void wall;
    const mural = decal(g, 3.4, 1.7, 0, 1.6, -3.74, (cx, w, h) => {
      const grad = cx.createLinearGradient ? cx.createLinearGradient(0, 0, w, 0) : null;
      if (grad) { grad.addColorStop(0, "#2a6a9a"); grad.addColorStop(0.5, "#e0a040"); grad.addColorStop(1, "#8a3a6a"); cx.fillStyle = grad; }
      else cx.fillStyle = "#e0a040";
      cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f6f0e0"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("ALWAYS OUR NEIGHBOUR", w * 0.5, h * 0.18);
      cx.fillStyle = "#7a7a7a"; cx.fillRect(w * 0.32, h * 0.3, w * 0.36, h * 0.55);
      cx.fillStyle = "#3a3a3a"; cx.font = `700 ${Math.round(h * 0.12)}px Arial, sans-serif`; cx.fillText("TAG", w * 0.5, h * 0.62);
    }, { px: 512, glow: true, ei: 0.35 });
    const muralRepaint = box(g, 1.2, 0.9, 0.02, 0, 1.4, -3.72, 0xe0a040, { rough: 0.6, emissive: 0xe0a040, ei: 0.2 });
    muralRepaint.visible = false;
    void mural;

    // The door with its privacy latch, and the in-session sign.
    const door = box(g, 0.95, 2.05, 0.06, 3.3, 1.03, -3.7, 0x6a5a4a, { rough: 0.6 });
    void door;
    const latch = box(g, 0.1, 0.03, 0.03, 2.95, 1.05, -3.64, 0xd8c060, { rough: 0.3, metal: 0.8 });
    holoTag(g, "Privacy latch", 2.95, 1.28, -3.6, { css: RJK_CSS, w: 0.28 });
    reg(hits, latch, "privacy-latch");
    const sessionSign = decal(g, 0.4, 0.16, 3.3, 2.2, -3.66, signFace("OPEN", { bg: "#2a2a2a", accent: "#aaaaaa", scale: 0.5 }), { px: 128, glow: true, ei: 0.5 });
    const podium = box(g, 0.5, 1.05, 0.4, -3.4, 0.53, -3.3, 0x5a4a3a, { rough: 0.7 });
    holoTag(g, "Podium against the wall", -3.4, 1.3, -3.3, { css: RJK_CSS, w: 0.4 });
    reg(hits, podium, "prep-podium");

    // ------------------------------------------------------------ the circle
    const cx0 = 0, cz0 = -1.2, R = 1.25;
    const seat = (i, n) => {
      const a = (i / n) * Math.PI * 2 + Math.PI / 2;
      return { x: cx0 + Math.cos(a) * R, z: cz0 + Math.sin(a) * R, ry: -a - Math.PI / 2 };
    };
    // Seat 0 is the keeper's (nearest the learner), left empty.
    const people = {};
    const who = [
      null,
      ["youth", 0x3a4a6a, "Young person, 15"],
      ["grandmother", 0x6a4a5a, "His grandmother"],
      ["brother", 0x3a5a4a, "Neighbour — the brother"],
      ["artist", 0x8a5a3a, "The mural's artist"],
      ["coordinator", 0x4a4a5a, "Centre coordinator"],
      ["coKeeperSeat", null, null],
    ];
    const chairs = [];
    who.forEach((w, i) => {
      const s = seat(i, who.length);
      chairs.push(chair(s.x, s.z, s.ry, 0x5a5f66));
      if (w && w[1]) {
        const f = seatedFigure(g, s.x, 0.47, s.z, { ry: s.ry, cloth: w[1] });
        holoTag(f.torso, w[2], 0, 1.36, 0.1, { css: RJK_CSS, w: 0.42 }).rotation.y = -s.ry;
        people[w[0]] = f;
      }
    });
    holoTag(chairs[0], "Your chair — keeper", 0, 1.1, 0, { css: RJK_CSS, w: 0.38 });
    reg(hits, chairs[6].children[0], "prep-chairs-in-circle");
    holoTag(chairs[6], "One circle, matching chairs", 0, 0.95, 0, { css: RJK_CSS, w: 0.46 });

    // The centrepiece: a cloth, the photo of the mural, a lamp, the talking piece.
    const centre = group(g, cx0, 0, cz0);
    const cloth = cyl(centre, 0.4, 0.4, 0.01, 0, 0.035, 0, 0xe8dcc8, { rough: 0.9, seg: 24 });
    void cloth;
    const photo = decal(centre, 0.24, 0.18, -0.12, 0.05, 0.05, paperFace("THE MURAL", ["As it was"], { band: "#8a5a3a" }), { px: 128 });
    photo.rotation.x = -Math.PI / 2;
    reg(hits, photo, "prep-centrepiece");
    const lamp = cyl(centre, 0.04, 0.05, 0.12, 0.18, 0.1, -0.1, 0xf2d08a, { rough: 0.3, emissive: 0xf2c060, ei: 0.8, seg: 12 });
    void lamp;
    const piece = cyl(centre, 0.018, 0.012, 0.26, 0.12, 0.06, 0.15, 0x8a5a3a, { rough: 0.5, seg: 8 });
    piece.rotation.z = Math.PI / 2;
    reg(hits, piece, "prep-talking-piece");
    const tissues = box(g, 0.16, 0.08, 0.1, -0.5, 0.05, -1.75, 0xf2f2f2, { rough: 0.8 });
    reg(hits, tissues, "prep-tissues-water");
    cyl(g, 0.04, 0.04, 0.18, -0.3, 0.1, -1.8, 0x9fd0e8, { rough: 0.1, metal: 0.1, seg: 10, opacity: 0.6, transparent: true });

    // Listening beads, one over the artist and one over the young person.
    const sA = seat(4, who.length), sY = seat(1, who.length);
    bead(sA.x * 0.7, 1.55, cz0 + (sA.z - cz0) * 0.7, "listen-artist", "Hear her whole", { w: 0.32 });
    bead(sY.x * 0.7, 1.55, cz0 + (sY.z - cz0) * 0.7, "listen-youth", "Hear him whole", { w: 0.32 });
    card(-0.7, 1.45, 0.25, "consent-card", "Here by choice — confirmed", "CONSENT\nCONFIRMED", { w: 0.52, ry: 0.2 });
    card(0.75, 1.45, 0.25, "reflect-card", "Reflect back — no blame", "WHAT I'M\nHEARING...", { w: 0.44, ry: -0.2 });
    card(-2.2, 1.35, 0.6, "talking-piece-guideline", "Restate the talking-piece guideline", "ONLY THE\nPIECE SPEAKS", { w: 0.64, ry: 0.5, accent: "#f2c14b", css: "#f2c14b" });
    card(2.2, 1.35, 0.6, "pause-and-support-card", "Pause · co-keeper holds · speak privately", "PAUSE\nWITH CARE", { w: 0.7, ry: -0.5, accent: "#f2c14b", css: "#f2c14b" });

    // The opening ladder.
    const opening = group(g, -2.7, 0, -1.0, 0.8);
    cyl(opening, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [oid, label, y] of [
      ["open-welcome-purpose", "1 · Welcome and why we're here", 0.75], ["open-guidelines", "2 · Guidelines we agree", 1.05],
      ["open-confidential-limits", "3 · What stays — and the limit", 1.35], ["open-talking-piece", "4 · The talking piece", 1.65],
    ]) {
      const b = ball(opening, 0.026, 0, y, 0, RJK_ACCENT, { emissive: RJK_ACCENT, ei: 1.5, seg: 12 });
      holoTag(opening, label, 0.2, y, 0, { css: RJK_CSS, w: 0.54 });
      reg(hits, b, oid);
    }

    // Speaking-time and temperature meters.
    const balStand = stand(-1.7, 0.2, 0.3);
    const balGauge = instrument(balStand, 0, 1.02, 0, { idle: "BALANCE", color: RJK_ACCENT, w: 0.2, d: 0.26 });
    holoTag(balStand, "Speaking time", 0, 1.22, 0, { css: RJK_CSS, w: 0.32 });
    reg(hits, balGauge, "balance-meter");
    const tempStand = stand(1.7, 0.2, -0.3);
    const tempGauge = instrument(tempStand, 0, 1.02, 0, { idle: "HELD", color: RJK_ACCENT, w: 0.2, d: 0.26 });
    holoTag(tempStand, "Circle temperature", 0, 1.22, 0, { css: RJK_CSS, w: 0.38 });
    reg(hits, tempGauge, "temperature-meter");

    // Who was affected: a board with beads.
    board(0.7, 0.4, 2.8, 2.0, -2.6, (cx, w, h) => lines(cx, w, h, "WHO WAS AFFECTED?", ["Tap everyone the harm reached"]), { ry: -0.6 });
    const aff = group(g, 2.75, 0, -2.2, -0.6);
    for (const [aid, label, y, c] of [
      ["affected-artist", "The artist", 1.62, RJK_ACCENT], ["affected-family", "The family it remembers", 1.42, RJK_ACCENT],
      ["affected-centre-kids", "The centre's children", 1.22, RJK_ACCENT], ["affected-grandmother", "His grandmother", 1.02, RJK_ACCENT],
      ["affected-insurer", "The centre's insurer", 0.82, 0x7fc4d8],
    ]) {
      const b = ball(aff, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(aff, label, 0.3, y, 0, { css: RJK_CSS, w: 0.46 });
      reg(hits, b, aid);
    }

    // The agreement: his offer on a side table, the board, and the terms ladder.
    const side = group(g, -1.3, 0, 1.2);
    box(side, 0.5, 0.05, 0.4, 0, 0.7, 0, 0xd8d0c0, { rough: 0.5 });
    cyl(side, 0.03, 0.03, 0.68, 0, 0.34, 0, 0x5a5a5a, { rough: 0.5, metal: 0.4, seg: 8 });
    const offerGrp = group(g, -1.3, 0.76, 1.2);
    const offer = decal(offerGrp, 0.28, 0.16, 0, 0, 0, signFace("I'LL HELP\nREPAINT IT", { bg: "#f0eaf6", fg: "#2a1a3a", accent: RJK_CSS, scale: 0.32 }), { px: 192 });
    offer.rotation.x = -Math.PI / 2.3;
    holoTag(offerGrp, "His offer", 0, 0.18, 0, { css: RJK_CSS, w: 0.24 });
    reg(hits, offer, "agreement-card");
    const agreeBoard = board(0.6, 0.42, -3.0, 1.6, 0.9, (cx, w, h) => lines(cx, w, h, "AGREEMENT", ["Built by the circle"]), { ry: 1.0 });
    reg(hits, agreeBoard.userData.face, "agreement-board");
    const terms = group(g, -3.3, 0, 1.9, 1.2);
    cyl(terms, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [tid, label, y] of [
      ["agree-specific", "Specific", 0.8], ["agree-achievable", "Achievable for him", 1.05],
      ["agree-his-own", "In his words", 1.3], ["agree-follow-up", "Follow-up date", 1.55],
    ]) {
      const b = ball(terms, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(terms, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.36 });
      reg(hits, b, tid);
    }

    // ------------------------------------------------------------ the wrong moves
    card(0.2, 1.2, 1.3, "promise-no-charges", "Promise the report goes away?", "THE REPORT\nWILL VANISH", {
      w: 0.56, ry: 0, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(3.3, 1.2, -1.6, "share-circle-story", "Tell the association what he said?", { color: 0xf0645b, css: "#f0645b", w: 0.6 });
    bead(-0.95, 1.25, -2.9, "demand-apology-now", "\"Apologise. Now.\"", { color: 0xf0645b, css: "#f0645b", w: 0.36 });
    card(1.4, 1.2, 1.55, "third-circle-tonight", "Keep a third circle tonight?", "ANOTHER\nCIRCLE AT 9", {
      w: 0.54, ry: -0.3, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    const pauseSign = decal(g, 0.5, 0.2, 0, 2.5, -3.72, signFace("CIRCLE PAUSED", { bg: "#3a2a10", accent: "#f2c14b", scale: 0.4 }), { px: 192, glow: true, ei: 0.8 });
    pauseSign.visible = false;

    // ------------------------------------------------------------ closing boards
    const log = board(0.56, 0.4, 2.3, 1.95, 1.8, (cx, w, h) => lines(cx, w, h, "CIRCLE RECORD", [
      "Took place · who agreed to what", "Follow-up date · no stories",
    ]), { ry: -0.6 });
    reg(hits, log.userData.face, "circle-log-board");
    const checkin = board(0.5, 0.36, -2.2, 1.95, 2.3, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "How did it land on us?", "Who follows up the report?",
    ], { accent: "#7fc4d8" }), { ry: 0.6, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.62, 0.32, -1.9, 2.55, -3.72, (cx, w, h) => lines(cx, w, h, "LISTEN FIRST", [
      "The piece speaks. The keeper listens.",
    ], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.13);
    });

    // ------------------------------------------------------------ the co-keeper
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const coKeeper = standingFigure(g, 1.35, -2.45, { ry: -0.6, cloth: 0x4a3a5a, trousers: 0x262d36 });
    holoTag(coKeeper, "Co-keeper — social worker", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.44 });
    const youth = people.youth, gran = people.grandmother;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 0.9, -1.4),

      onStepComplete(step) {
        if (step.id === "latch-the-door") {
          latch.rotation.z = Math.PI / 2;
          repaint(sessionSign, signFace("IN SESSION", { bg: "#3a1a4a", accent: RJK_CSS, scale: 0.4 }));
          latch.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "carry-the-agreement") offerGrp.position.set(-2.9, 1.6, 0.95);
        if (step.id === "shape-the-agreement") muralRepaint.visible = true;
        if (step.id === "close-the-circle-log") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "CIRCLE RECORDED", ["Agreement · follow-up date", "No stories kept"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "demand-apology-now" || id === "promise-no-charges" || id === "share-circle-story") {
          if (youth) { youth.torso.rotation.x = 0.3; youth.head.rotation.x = 0.4; }
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. The circle is for repair, not for shame.");
        }
      },

      onInterrupt(it) {
        if (it.id === "grandmother-breaks-in" && gran) {
          gran.torso.rotation.x = -0.2;
          gran.arms[1].shoulder.rotation.x = -1.4;
          if (youth) youth.head.rotation.x = 0.45;
        }
        if (it.id === "disclosure-mid-circle") {
          pauseSign.visible = true;
          if (youth) youth.torso.rotation.x = 0.3;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "grandmother-breaks-in" && gran) {
          gran.torso.rotation.x = 0;
          gran.arms[1].shoulder.rotation.x = 0;
          if (youth) youth.head.rotation.x = 0;
        }
        if (it.id === "disclosure-mid-circle") {
          coKeeper.position.set(sY.x + 0.9, 0, sY.z + 0.6);
          if (youth) youth.torso.rotation.x = 0;
        }
      },

      animate(t, dt, session) {
        if (people.artist) people.artist.head.rotation.y = Math.sin(t * 0.5) * 0.06;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "keep-speaking-time-fair") {
          const ok = gg.t >= 0.38 && gg.t <= 0.6;
          repaint(balGauge.userData.screen, signFace(ok ? "BALANCED" : gg.t < 0.38 ? "ADULTS" : "ONE VOICE", {
            bg: "#1a1224", accent: ok ? "#59c97b" : "#f0645b", fg: "#f6f0fb", scale: 0.5,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "hold-the-temperature" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(tempGauge.userData.screen, signFace(ok ? "HELD" : tr.v < 0.3 ? "SHUT DOWN" : "BOILING", {
            bg: "#1a1224", accent: ok ? "#59c97b" : "#f0645b", fg: "#f6f0fb", scale: 0.5,
          }));
        }
      },
    };
  },
};
