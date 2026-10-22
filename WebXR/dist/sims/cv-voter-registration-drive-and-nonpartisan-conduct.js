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

// SmartCiti.X~ Voter Registration Drive VR — Civic Leadership and Emotional
// Intelligence, deepening the programme.
//
// A community organisation's registration table on a Saturday plaza: a
// canopy, a folding table, the state's official registration cards, a locked
// return box and a line of neighbours. The learner is the volunteer lead.
// The whole station is about one idea — the table belongs to every voter,
// not to a side — and about the practical things that make that true: the
// campaign flyer taken off the table, the applicant filling in her own card,
// a question about who to vote for answered with the official guide, the
// completed cards kept confidential and returned promptly to the elections
// office, and a heckler answered without an argument.
//
// The law is named as bodies and stated as principles: the National Voter
// Registration Act for the mail-in registration system drives run on, the
// California Secretary of State's voter registration guidance for the card
// and its prompt, confidential return, and the IRS rules that bar a 501(c)(3)
// from any partisan campaign activity while allowing nonpartisan voter
// registration. No deadline in days, section number or programme is stated
// where the repository has no source for it. The organisation, the plaza and
// every person are invented; the leadership principles are those commonly
// taught in civic-leadership programmes, and the foundation whose principles
// the programme draws on is not sourced in this repository.

const VRD_ACCENT = 0x6fc7a0;
const VRD_CSS = "#6fc7a0";

export const SIM_CV_VOTER_REGISTRATION_DRIVE_AND_NONPARTISAN_CONDUCT = {
  id: "cv-voter-registration-drive-and-nonpartisan-conduct",
  index: "319",
  domain: "Civic",
  trade: "Voter registration drive lead — nonpartisan community organisation",
  category: "Community Environmental Justice",
  weather: "clear",
  certification: "The National Voter Registration Act (NVRA), named as a body, for the mail-in registration system and the agency-based registration a drive sits beside; the California Secretary of State's voter registration guidance, as a body, for the official card, the rules for people who collect completed cards — return them promptly to the elections office and keep them confidential — and the official voter information guide; the IRS rules for 501(c)(3) organisations, which bar any partisan campaign activity and allow voter registration only when it is nonpartisan in who is served and what is said; Title VI of the Civil Rights Act of 1964 for language access where a programme takes federal money; SEIU and AFSCME for the public-assistance and motor-vehicle office staff who offer registration under the NVRA every day. Where a deadline or section number is not certain, the station names the body and not the number. The leadership principles practised here are those commonly taught in civic-leadership programmes; the foundation whose principles the programme draws on is not sourced in this repository",
  name: "Voter Registration Drive",
  title: simTitle("Voter Registration Drive"),
  tagline: "Run a registration table that belongs to every voter: the campaign flyer off the table, the card filled in by the person it belongs to, \"who should I vote for\" answered with the official guide, completed cards locked, logged and returned — and a heckler met without an argument",
  accent: VRD_ACCENT,
  accentCss: VRD_CSS,
  parSeconds: 330,
  footprint: 2.3,
  badge: { id: "every-voter-table", name: "Every Voter's Table", note: "A whole drive run nonpartisan: nobody steered, nothing kept, every card returned" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your organisation's volunteer coordinator, or the volunteer who ran last month's table and will pick up the phone",

  game: system({
    name: "Open Table",
    currency: "VOICE",
    ranks: ["Volunteer", "Table Lead", "Drive Lead", "Field Coordinator", "Volunteer Mentor"],
    badges: [
      { id: "table-ready", name: "Table Ready", note: "Every part of the table set up right first time", test: AWARD.stepClean("set-the-table") },
      { id: "no-side-taken", name: "No Side Taken", note: "No unsafe action anywhere in the drive", test: AWARD.safe },
      { id: "complete-cards", name: "Complete Cards", note: "Every missing field found first time", test: AWARD.stepClean("check-the-returned-card") },
    ],
    challenges: [
      { id: "clean-drive", name: "Clean Drive", note: "No corrections anywhere in the drive", test: AWARD.clean },
      { id: "easy-pace", name: "Easy Pace", note: "Your explanation paced inside the band", test: AWARD.precise(0.7) },
      { id: "calm-table", name: "Calm Table", note: "The listening and the calm both carried their full count", test: AWARD.unbroken },
    ],
  }),

  hazards: {
    "toss-the-card": "You dropped the card of a voter who said she was registering with the other party into the recycling. Every completed card collected at the table goes to the elections office whatever party it names; discarding one quietly takes a person's vote away, it is treated as a serious offence in election law, and it ends the organisation's standing to run a drive at all.",
    "photo-of-the-cards": "You photographed the stack of completed cards to post the day's total. Those cards carry birth dates, addresses, identification numbers and signatures; the Secretary of State's guidance treats the voter's information as confidential, and one blurry picture on a public feed is an identity-theft kit for everyone who trusted the table.",
    "argue-with-heckler": "You argued back at the man shouting that the election is rigged. The line behind him watched the table turn into a fight, two people left without registering, and he left with exactly the story he wanted. A nonpartisan table's answer to a heckler is calm, brief and the same for everyone.",
    "cover-alone-all-day": "You told the coordinator you would cover the table alone from open to close. Eight hours in the sun answering strangers without a break is how a volunteer starts snapping at the last voter of the day, stops checking cards, and does not come back next month. A drive needs two people and a relief rota, not a hero.",
  },

  lateNotes: {
    "batch-envelope": "The batch goes to the elections office once it has been counted, sealed, logged and initialled — the transmittal is not done yet.",
    "drive-log-board": "The drive log closes once the batch is on its way to the elections office. There is nothing to record yet.",
  },

  steps: [
    {
      id: "set-the-table", kind: "find", noHint: true,
      targets: ["setup-official-cards", "setup-language-cards", "setup-lock-box", "setup-nonpartisan-sign"],
      itemNames: {
        "setup-official-cards": "the state's official registration cards, current edition",
        "setup-language-cards": "cards and instructions in the neighbourhood's languages",
        "setup-lock-box": "a locked box for completed cards",
        "setup-nonpartisan-sign": "a sign that says who the table is for: everyone",
      },
      itemNotes: {
        "setup-official-cards": "Only the official card, in its current edition, gets a voter registered. A homemade sign-up sheet is a mailing list, not a registration.",
        "setup-language-cards": "A neighbour who reads another language better than English deserves instructions she can read. The official cards come in several languages; bring the ones this plaza speaks.",
        "setup-lock-box": "Completed cards are confidential from the moment they are signed. A locked box keeps them off the table and out of the wind.",
        "setup-nonpartisan-sign": "\"Register to vote — every party and no party welcome\" tells the line before anyone speaks that this table does not care how they vote.",
      },
      decoyNotes: {
        "setup-snack-bowl": "The sweets bowl is friendly, not required. Whether the table is lawful and fair does not depend on it.",
      },
      title: "Set up a table that is ready for every voter",
      cue: "Before the first neighbour walks up, find every item the table needs to register people properly and fairly.",
      why: "A registration table is judged by the voter who walks up least sure she is welcome. Official cards in the current edition are the only thing that actually registers anyone; cards in the languages the plaza speaks let people fill in their own; a locked box protects what they write; and a sign saying the table is for every party and none tells the line, before a word is spoken, that nobody here is sorting them.",
    },
    {
      id: "clear-the-flyers", kind: "drag", target: "campaign-flyers",
      title: "Take the candidate's flyers off the table",
      cue: "A stack of one candidate's flyers was left on the table overnight. Move it into the crate under the table.",
      drag: {
        to: "flyer-crate", radius: 0.55,
        missNote: "Not in the crate. As long as one candidate's flyers sit on the registration table, the table is campaigning for her — whoever left them there.",
      },
      why: "A 501(c)(3) organisation may register voters only on a strictly nonpartisan basis; it may not take any part in a campaign for or against a candidate. One candidate's flyers on the table turn a registration drive into campaign activity in the eyes of every voter in line and of the IRS, and they tell a supporter of her opponent that this is not his table. Clearing them is not about the candidate; it is about keeping the table everyone's.",
    },
    {
      id: "read-the-eligibility", kind: "select", target: "eligibility-card",
      title: "Read the eligibility statement from the card — do not judge it yourself",
      cue: "Point the applicant to the eligibility questions on the card. She answers and signs; you do not decide for her.",
      why: "The card asks the applicant to confirm, under penalty of perjury, that she meets the state's requirements — citizenship, age by election day, and the conditions the card lists. The volunteer's job is to make sure she reads those questions, not to guess at her status from her accent or her story. A volunteer who screens people out by judgement has turned a nonpartisan table into a gatekeeper, and gets it wrong most often for exactly the neighbours the drive was meant to reach.",
    },
    {
      id: "help-without-filling", kind: "sequence",
      targets: ["help-hand-the-card", "help-she-fills-it", "help-check-complete", "help-give-receipt"],
      itemNames: {
        "help-hand-the-card": "hand her the card and a pen",
        "help-she-fills-it": "she fills in her own card — party choice included",
        "help-check-complete": "check it is complete, with her, before it goes in",
        "help-give-receipt": "give her the receipt stub and how to check her status",
      },
      title: "Help the applicant in order — without filling it in for her",
      cue: "The card and a pen; she fills it in herself; check it with her; then the receipt and how to confirm she is registered.",
      why: "The card is the voter's statement, and every choice on it — above all her party preference, or none — is hers. Handing it over and letting her fill it in, then checking completeness with her rather than for her, keeps the volunteer's hand off anything that could look like steering. The receipt matters as much as the card: it lets her confirm later that her registration arrived, which is the only proof she has that the table kept its word.",
      outOfOrderNote: "Card and pen, she fills it in, check it with her, then the receipt. Checking a card before she has finished it feels like reading over her shoulder.",
    },
    {
      id: "hear-why-she-never-voted", kind: "hold", target: "listen-bead", seconds: 8,
      title: "Hear why she has never registered before",
      cue: "She tells you she is sixty-one and has never voted. Hold your attention on her — no pitch, no correction.",
      why: "People who have never registered usually have a reason, and it is rarely apathy: a move every year, a bad experience at an office, a belief that people like her are not wanted. Listening to the whole of it, without pitching and without correcting, is often what turns a card taken out of politeness into a card actually filled in — and it tells the volunteer what the next person in her position will need to hear.",
      holdBreakNote: "You glanced at the line behind her while she was talking. She saw it and stopped. Bring your attention back and let her finish.",
    },
    {
      id: "who-should-i-vote-for", kind: "select", target: "voter-guide-card",
      title: "Answer \"who should I vote for?\" with the official guide",
      cue: "She asks what you think of the mayor's race. Say the table does not take sides, and hand her the official voter information guide.",
      why: "The question is friendly and the answer is always the same: this table does not recommend candidates or parties, and here is the official voter information guide where every candidate and measure is described. Anything else — a hint, a raised eyebrow, a \"between you and me\" — is partisan activity by a 501(c)(3) and tells the next voter in line which side the table is on. Pointing to the official source respects her and keeps the organisation's promise.",
    },
    {
      id: "pace-the-explanation", kind: "gauge", target: "pace-meter",
      title: "Pace the explanation so she can follow it",
      cue: "Commit your pace inside the band: slow enough to follow, brisk enough that the line keeps moving.",
      gauge: {
        label: "PACE", speed: 0.6, green: [0.35, 0.58],
        readout: (t) => `${Math.round(80 + t * 140)} words/min`,
        missNote: "Outside the band. Rushed, she signs without understanding what she signed; dragged out, the line thins and people leave unregistered. Explain at a pace she can follow and the line can bear.",
      },
      why: "A card explained too fast gets signed without being understood, and the next thing the voter hears about is a letter saying it was incomplete. Explained too slowly, the line behind her drifts away. Speaking at a conversational pace, and slower for someone reading in a second language, is how a volunteer registers the person in front of her properly without losing the three behind her.",
    },
    {
      id: "check-the-returned-card", kind: "find", noHint: true,
      targets: ["card-no-signature", "card-no-birthdate", "card-citizenship-blank"],
      itemNames: {
        "card-no-signature": "the signature line is empty",
        "card-no-birthdate": "the date of birth is missing",
        "card-citizenship-blank": "the citizenship question is unanswered",
      },
      itemNotes: {
        "card-no-signature": "An unsigned card cannot register anyone. Hand it back and ask her to sign — you never sign for anyone.",
        "card-no-birthdate": "Without a date of birth the elections office cannot match or process the card. She fills it in; you do not guess.",
        "card-citizenship-blank": "The eligibility questions must be answered by the applicant herself. Point to them and let her decide how to answer.",
      },
      decoyNotes: {
        "card-party-blank": "No party preference is a lawful choice and entirely hers. It is not a missing field, and it is never yours to fill in.",
      },
      title: "Check the returned card with the applicant for missing fields",
      cue: "Look at the card she has handed back. Mark every field she needs to complete before it goes in the box.",
      why: "An incomplete card is the most common way a registration drive fails a voter: the card is accepted at the table, rejected at the elections office, and the voter believes she is registered until election day. Checking the required fields with her — signature, date of birth, the eligibility questions — and letting her complete them herself gets her registered. Leaving her party choice alone, even blank, is the other half of the same respect.",
    },
    {
      id: "lock-the-box", kind: "turn", target: "box-key",
      title: "Lock the completed cards in the box",
      cue: "Her card is complete. Put it in the return box and turn the key.",
      turn: { turns: 0.4, axis: "z", label: "LOCK" },
      why: "From the moment she signs, the card carries information she trusted the table with: her birth date, address and an identification number. A locked box keeps it away from the wind, from curious hands and from the volunteer who thinks a copy for the mailing list would be useful. The Secretary of State's guidance treats the voter's information as confidential; a key turned every time is how a busy table actually keeps that promise.",
    },
    {
      id: "keep-the-table-calm", kind: "track", target: "tone-meter", seconds: 8,
      title: "Keep the table calm while a man shouts that it is all rigged",
      cue: "Hold your tone inside the band: steady and brief with him, warm with the line — not rising to him, not ignoring the line's discomfort.",
      track: {
        start: 0.5, green: [0.3, 0.7], rise: 0.48, fall: 0.4, drift: 0.16, label: "TONE",
        readout: (v) => (v < 0.3 ? "shrinking away" : v > 0.7 ? "rising to him" : "calm and even"),
      },
      why: "A nonpartisan table will meet people who are angry at the whole system, and the line is watching how the volunteer handles them. Rising to the argument makes the table a side; shrinking from it leaves the people in line feeling unsafe. A steady, brief, respectful answer — \"we register everyone; the elections office can answer questions about the count\" — held for as long as he stays, keeps the table what it is.",
      holdBreakNote: "Your tone slipped — rising to his argument or shrinking away from the line. Bring it back: brief and steady with him, warm with them.",
    },
    {
      id: "transmit-the-batch", kind: "sequence", anyOrder: true,
      targets: ["tx-count-cards", "tx-seal-envelope", "tx-log-batch", "tx-two-initials"],
      itemNames: {
        "tx-count-cards": "count the completed cards",
        "tx-seal-envelope": "seal them in the batch envelope",
        "tx-log-batch": "log the count and batch number — no personal data",
        "tx-two-initials": "both volunteers initial the log",
      },
      title: "Count, seal and log the batch with two volunteers",
      cue: "At the end of the shift: count the cards, seal them, log the batch number and count, and both of you initial it.",
      why: "The batch log is the table's proof that every card collected reached the elections office, and two initials make it a check rather than a note. Recording only the count and a batch number — never names, birth dates or party choices — keeps the log useful without turning it into a copy of the voters' information. If a voter later finds she was not registered, this is the page that shows where her card went.",
    },
    {
      id: "return-to-elections-office", kind: "drag", target: "batch-envelope",
      title: "Take the sealed batch to the elections office, not the organisation's office",
      cue: "Carry the sealed envelope to the elections office return. It does not go back to the office first.",
      drag: {
        to: "elections-return", radius: 0.55,
        missNote: "Not at the elections office return. The cards belong to the voters and go to the elections office promptly — not to a desk drawer, a mailing list or a partner's office on the way.",
      },
      why: "The Secretary of State's guidance for people who collect completed cards is simple: return them promptly to the elections office, within the deadline it sets, and do not hold, copy or sort them first. Cards that sit in the organisation's office over a long weekend can miss a registration deadline and cost people their vote. Taking the sealed batch straight to the elections office is the last step of the promise made at the table.",
    },
    {
      id: "close-the-drive-log", kind: "select", target: "drive-log-board",
      title: "Close the drive log",
      cue: "Record the batches, the counts, the delivery time and anything unusual — the heckler, the survivor's question — with no voter's details.",
      why: "The drive log is what the organisation reports on and learns from: how many batches, how many cards, when they were delivered, and what happened that the next table should know about. Writing down the heckler and the survivor's question without any voter's name keeps the lesson and protects the people. It is also the record that shows, if anyone asks, that the table ran nonpartisan and returned every card.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check in with your co-volunteer before you pack up",
      cue: "Two minutes: how did the shouting land on each of you, and who takes the first shift next week?",
      why: "A table that took some shouting and heard a frightened survivor's question is an emotional day, even if nobody says so. Asking how it landed, sharing out next week's shifts so nobody covers a whole day alone, and naming the coordinator to call if it stays with either of you is what keeps volunteers coming back — and a drive that runs on the same two burnt-out people every weekend eventually does not run at all.",
    },
  ],

  interrupts: [
    {
      id: "campaign-staffer-at-table",
      kind: "Partisan pressure",
      after: "hear-why-she-never-voted", delay: 3, seconds: 12,
      alert: "While she is talking, a campaign staffer in a candidate's T-shirt has set a fresh stack of flyers on your table and is asking for a copy of today's sign-up list.",
      cue: "Politely decline both, in the table's nonpartisan words — then turn back to her.",
      target: "nonpartisan-policy-card",
      why: "A 501(c)(3) table cannot carry a candidate's material or share its contact list with a campaign, however friendly the request. Declining both in the same calm words the table would use for any candidate — \"we're nonpartisan; we can't take material or share lists\" — protects the organisation and every voter who signed up. Doing it briefly and turning straight back to the applicant keeps her from feeling she was interrupted for someone more important.",
      missNote: "The flyers stayed on the table and the staffer walked off with a photo of the sign-up sheet. The table spent the rest of the day looking like her campaign's, and forty people's phone numbers are now on a campaign list they never agreed to join.",
      wrongNote: "Listening harder to the applicant does not move the flyers. Decline the staffer in the table's nonpartisan words, then come back to her.",
    },
    {
      id: "survivor-address-fear",
      kind: "Voter privacy fear",
      after: "keep-the-table-calm", delay: 3, seconds: 12,
      alert: "A woman who registered an hour ago has come back, shaking. She has left an abusive partner and is afraid her new address will now be public on the voter rolls.",
      cue: "Take her aside, reassure her calmly, and give her the address-confidentiality referral for the elections office.",
      target: "confidential-address-card",
      why: "Voter files can be more public than people expect, and for a survivor an address is a safety matter. The state has an address-confidentiality programme for survivors that the elections office can explain, and a calm referral — in a quieter spot, without asking her to tell her story — is exactly what she needs. The volunteer does not promise what the rolls will show; she points to the people who can protect the address.",
      missNote: "Nobody answered her in the noise. She asked for her card back, which the table could no longer give her, and left more frightened than she came — without knowing there was a way to register and keep her address confidential.",
      wrongNote: "The tone meter is for the man shouting. She needs a quiet word and the address-confidentiality referral — not a calmer table.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, VRD_ACCENT);

    // ------------------------------------------------------------ small helpers
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const b = ball(m, o.r ?? 0.03, 0, y, 0, o.color ?? VRD_ACCENT, { emissive: o.color ?? VRD_ACCENT, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? VRD_CSS, w: o.w ?? 0.44 });
      if (id) reg(hits, b, id);
      return b;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.2, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#0c1c16", accent: o.accent ?? VRD_CSS, scale: 0.4 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.17, 0.002, { css: o.css ?? VRD_CSS, w: o.w ?? 0.48 });
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
      cx.fillStyle = o.bg ?? "rgba(8,22,16,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = o.accent ?? VRD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eefaf4";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = o.ink ?? "#c4e6d6";
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.4 + i * 0.13)));
    };
    const board = (w, h, x, y, z, draw, o = {}) => {
      const b = group(g, x, y, z, o.ry ?? 0);
      box(b, w + 0.04, h + 0.04, 0.02, 0, 0, -0.012, o.accent ?? VRD_ACCENT, { rough: 0.5, emissive: o.accent ?? VRD_ACCENT, ei: 0.25 });
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
    const pavTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 10, base: "#b8ada0", base2: "#aa9f92", seam: "rgba(60,50,40,0.35)",
    }), { repeat: 3, px: 384 });
    const plaza = box(g, 8.0, 0.03, 6.4, 0, 0.012, -0.4, 0xb8ada0, { rough: 0.9, cast: false });
    plaza.material = texturedMat(pavTex, { rough: 0.9, metal: 0.02, color: 0xc4b9ac });
    // A planter bed and a bench at the back edge of the plaza.
    const soilTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 4, base: "#4a3a2a", base2: "#443424", seam: "rgba(20,14,8,0.3)",
    }), { repeat: 2, px: 256 });
    box(g, 3.2, 0.4, 0.7, -1.8, 0.2, -3.3, 0x8a8278, { rough: 0.8 });
    const soil = box(g, 3.0, 0.04, 0.55, -1.8, 0.41, -3.3, 0x4a3a2a, { rough: 1.0, cast: false });
    soil.material = texturedMat(soilTex, { rough: 1.0, metal: 0, color: 0x5a4a3a });
    for (const px of [-3.0, -2.2, -1.4, -0.6]) ball(g, 0.2, px, 0.62, -3.3, 0x3f7a3a, { rough: 0.9, seg: 10 });
    box(g, 1.6, 0.06, 0.45, 1.8, 0.45, -3.3, 0x6a5040, { rough: 0.7 });
    for (const sx of [-0.7, 0.7]) box(g, 0.08, 0.42, 0.4, 1.8 + sx, 0.21, -3.3, 0x3a3f46, { rough: 0.5, metal: 0.5 });

    // ------------------------------------------------------------ the canopy and table
    const canopy = group(g, 0, 0, -1.4);
    for (const [lx, lz] of [[-1.3, -0.9], [1.3, -0.9], [-1.3, 0.9], [1.3, 0.9]]) {
      cyl(canopy, 0.025, 0.025, 2.3, lx, 1.15, lz, 0xd8dde2, { rough: 0.4, metal: 0.6, seg: 8 });
    }
    box(canopy, 2.8, 0.06, 2.0, 0, 2.32, 0, 0x2f7a5a, { rough: 0.8 });
    const banner = decal(canopy, 2.4, 0.26, 0, 2.12, 0.99, signFace("REGISTER TO VOTE — EVERY PARTY AND NO PARTY WELCOME", {
      bg: "#1f5a44", accent: "#e8f6ee", fg: "#ffffff", scale: 0.3,
    }), { px: 512, glow: true, ei: 0.5 });
    void banner;
    const table = group(g, 0, 0, -1.4);
    box(table, 1.8, 0.05, 0.75, 0, 0.74, 0, 0xe8e4dc, { rough: 0.6 });
    box(table, 1.8, 0.62, 0.02, 0, 0.42, 0.37, 0x2f7a5a, { rough: 0.8 });
    for (const sx of [-0.8, 0.8]) cyl(table, 0.02, 0.02, 0.72, sx, 0.36, -0.3, 0x5a5f66, { rough: 0.5, metal: 0.5, seg: 8 });
    const tableSign = decal(table, 0.9, 0.3, 0, 0.46, 0.385, signFace("NONPARTISAN\nALL VOTERS", { bg: "#1f5a44", accent: "#e8f6ee", scale: 0.36 }), { px: 256, glow: true, ei: 0.5 });
    reg(hits, tableSign, "setup-nonpartisan-sign");

    // On the table: official cards, language cards, the lock box, sweets.
    const cards = box(table, 0.22, 0.05, 0.3, -0.6, 0.79, 0.05, 0xf4f0e2, { rough: 0.8 });
    holoTag(table, "Official cards · current edition", -0.6, 1.02, 0.05, { css: VRD_CSS, w: 0.5 });
    reg(hits, cards, "setup-official-cards");
    const langRack = group(table, -0.25, 0.77, -0.15);
    box(langRack, 0.3, 0.2, 0.05, 0, 0.1, 0, 0x3a3f46, { rough: 0.6 });
    const langFace = decal(langRack, 0.28, 0.16, 0, 0.12, 0.03, paperFace("LANGUAGES", ["English · Español", "中文 · Tiếng Việt · Tagalog"], { band: "#2f7a5a" }), { px: 192 });
    reg(hits, langFace, "setup-language-cards");
    const lockBox = group(table, 0.5, 0.77, 0.0);
    const boxBody = box(lockBox, 0.36, 0.24, 0.26, 0, 0.12, 0, 0x2a4a3e, { rough: 0.5, metal: 0.4 });
    const lid = box(lockBox, 0.37, 0.03, 0.27, 0, 0.255, 0, 0x33584a, { rough: 0.5, metal: 0.4 });
    void lid;
    holoTag(lockBox, "Locked return box", 0, 0.5, 0, { css: VRD_CSS, w: 0.36 });
    reg(hits, boxBody, "setup-lock-box");
    const key = box(lockBox, 0.02, 0.06, 0.012, 0, 0.14, 0.14, 0xd8c060, { rough: 0.3, metal: 0.8 });
    reg(hits, key, "box-key");
    const sweets = cyl(table, 0.08, 0.06, 0.06, 0.1, 0.8, 0.2, 0xd05a5a, { rough: 0.4, seg: 14 });
    reg(hits, sweets, "setup-snack-bowl");

    // The candidate's flyers, and the crate under the table they go into.
    const flyerGrp = group(g, 0.15, 0.79, -1.2);
    const flyers = decal(flyerGrp, 0.22, 0.28, 0, 0, 0, paperFace("VOTE FOR A. CANDIDATE", ["Mayor", "Paid for by the campaign"], { band: "#b0453a" }), { px: 192 });
    flyers.rotation.x = -Math.PI / 2.3;
    holoTag(flyerGrp, "A candidate's flyers — left overnight", 0, 0.2, 0, { css: "#f2c14b", w: 0.6 });
    reg(hits, flyers, "campaign-flyers");
    const crate = box(g, 0.44, 0.26, 0.34, -1.05, 0.13, -0.85, 0x3a3f46, { rough: 0.7 });
    holoTag(g, "Crate under the table", -1.05, 0.45, -0.85, { css: "#59c97b", w: 0.4 });
    reg(hits, crate, "flyer-crate");

    // ------------------------------------------------------------ the applicant and her card
    const applicant = standingPerson(g, 0.4, -0.35, { ry: Math.PI, cloth: 0x7a5a8a, hiVis: false });
    holoTag(applicant.torso, "Neighbour — first time registering", 0, 1.9, 0, { css: VRD_CSS, w: 0.6 }).rotation.y = Math.PI;
    bead(0.95, 1.45, -0.55, "listen-bead", "Hear her out", { w: 0.3 });
    card(-0.55, 1.45, -0.7, "eligibility-card", "Eligibility — she reads and answers", "ELIGIBILITY\nON THE CARD", { w: 0.6, ry: 0.2 });
    card(1.45, 1.35, -0.8, "voter-guide-card", "\"We don't take sides — here's the guide\"", "OFFICIAL\nVOTER GUIDE", { w: 0.66, ry: -0.4 });

    // The help ladder.
    const help = group(g, -2.2, 0, -0.9, 0.7);
    cyl(help, 0.024, 0.024, 1.9, 0, 0.95, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [hid, label, y] of [
      ["help-hand-the-card", "1 · Card and a pen", 0.75], ["help-she-fills-it", "2 · She fills it in", 1.05],
      ["help-check-complete", "3 · Check it with her", 1.35], ["help-give-receipt", "4 · Receipt + how to check", 1.65],
    ]) {
      const b = ball(help, 0.026, 0, y, 0, VRD_ACCENT, { emissive: VRD_ACCENT, ei: 1.5, seg: 12 });
      holoTag(help, label, 0.2, y, 0, { css: VRD_CSS, w: 0.46 });
      reg(hits, b, hid);
    }

    // The returned card, on a clipboard stand, with its fields to check.
    board(0.6, 0.42, 2.3, 1.75, -1.7, (cx, w, h) => lines(cx, w, h, "RETURNED CARD", ["Check it with her, field by field"]), { ry: -0.7 });
    const fields = group(g, 2.1, 0, -1.35, -0.7);
    for (const [fid, label, y, c] of [
      ["card-no-signature", "Signature line", 1.4, VRD_ACCENT], ["card-no-birthdate", "Date of birth", 1.2, VRD_ACCENT],
      ["card-citizenship-blank", "Citizenship question", 1.0, VRD_ACCENT], ["card-party-blank", "Party preference: none", 0.8, 0x7fc4d8],
    ]) {
      const b = ball(fields, 0.024, 0, y, 0, c, { emissive: c, ei: 1.3, seg: 10 });
      holoTag(fields, label, 0.28, y, 0, { css: VRD_CSS, w: 0.44 });
      reg(hits, b, fid);
    }

    // Pace and tone meters.
    const paceStand = stand(1.3, 0.4, -0.3);
    const paceGauge = instrument(paceStand, 0, 1.02, 0, { idle: "PACE", color: VRD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(paceStand, "Your pace", 0, 1.22, 0, { css: VRD_CSS, w: 0.26 });
    reg(hits, paceGauge, "pace-meter");
    const toneStand = stand(-1.3, 0.45, 0.3);
    const toneGauge = instrument(toneStand, 0, 1.02, 0, { idle: "TONE", color: VRD_ACCENT, w: 0.2, d: 0.26 });
    holoTag(toneStand, "Your tone", 0, 1.22, 0, { css: VRD_CSS, w: 0.26 });
    reg(hits, toneGauge, "tone-meter");

    // The heckler, off to the right of the line.
    const heckler = standingPerson(g, 2.9, 0.4, { ry: -2.2, cloth: 0x5a4a3a, hiVis: false });
    holoTag(heckler.torso, "Man shouting \"it's all rigged\"", 0, 1.9, 0, { css: "#f2c14b", w: 0.56 }).rotation.y = 2.2;

    // ------------------------------------------------------------ transmittal and return
    const tx = group(g, -2.9, 0, 0.2, 1.0);
    cyl(tx, 0.022, 0.022, 1.7, 0, 0.85, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
    for (const [tid, label, y] of [
      ["tx-count-cards", "Count the cards", 0.8], ["tx-seal-envelope", "Seal the envelope", 1.05],
      ["tx-log-batch", "Log count + batch no.", 1.3], ["tx-two-initials", "Two sets of initials", 1.55],
    ]) {
      const b = ball(tx, 0.026, 0, y, 0, 0x7fc4d8, { emissive: 0x7fc4d8, ei: 1.4, seg: 12 });
      holoTag(tx, label, 0.2, y, 0, { css: "#7fc4d8", w: 0.42 });
      reg(hits, b, tid);
    }
    const envGrp = group(g, 0.85, 0.79, -1.55);
    const envelope = box(envGrp, 0.26, 0.03, 0.18, 0, 0, 0, 0xc8b88a, { rough: 0.8 });
    holoTag(envGrp, "Sealed batch", 0, 0.18, 0, { css: VRD_CSS, w: 0.26 });
    reg(hits, envelope, "batch-envelope");
    const returnPost = group(g, 3.3, 0, -2.3, -0.9);
    box(returnPost, 0.5, 1.0, 0.45, 0, 0.5, 0, 0x2a3a5a, { rough: 0.5, metal: 0.4 });
    const slot = box(returnPost, 0.3, 0.04, 0.05, 0, 0.85, 0.23, 0x101418, { rough: 0.6 });
    reg(hits, slot, "elections-return");
    decal(returnPost, 0.4, 0.26, 0, 0.55, 0.232, signFace("ELECTIONS\nOFFICE RETURN", { bg: "#1a2a4a", accent: "#e8eef6", scale: 0.34 }), { px: 192, glow: true, ei: 0.5 });
    holoTag(returnPost, "Elections office courier return", 0, 1.3, 0, { css: "#59c97b", w: 0.52 });

    // ------------------------------------------------------------ the interruptions' people
    const staffer = standingPerson(g, 1.1, -0.6, { ry: Math.PI + 0.6, cloth: 0xb0453a, hiVis: false });
    staffer.root.visible = false;
    const newFlyers = box(g, 0.2, 0.05, 0.26, -0.1, 0.79, -1.2, 0xb0453a, { rough: 0.7 });
    newFlyers.visible = false;
    card(-0.9, 1.3, 0.1, "nonpartisan-policy-card", "\"We're nonpartisan — no material, no lists\"", "NONPARTISAN\nPOLICY", { w: 0.7, ry: 0.3, accent: "#f2c14b", css: "#f2c14b" });
    const survivor = standingPerson(g, -2.3, 1.0, { ry: 2.4, cloth: 0x4a5a7a, hiVis: false });
    survivor.root.visible = false;
    card(-1.8, 1.35, 1.3, "confidential-address-card", "Address-confidentiality referral", "KEEP YOUR\nADDRESS SAFE", { w: 0.56, ry: 0.5, accent: "#f2c14b", css: "#f2c14b" });

    // ------------------------------------------------------------ the wrong moves
    const bin = group(g, -1.55, 0, -2.2);
    const binBody = cyl(bin, 0.2, 0.17, 0.6, 0, 0.3, 0, 0x2f5aa0, { rough: 0.6, seg: 14 });
    holoTag(bin, "Toss the other party's card?", 0, 0.85, 0, { css: "#f0645b", w: 0.54 });
    reg(hits, binBody, "toss-the-card");
    card(0.2, 1.2, 0.45, "photo-of-the-cards", "Post a photo of today's cards?", "PHOTO OF\nTODAY'S CARDS", {
      w: 0.56, ry: 0, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });
    bead(2.4, 1.3, 0.9, "argue-with-heckler", "Argue it out with him?", { color: 0xf0645b, css: "#f0645b", w: 0.46 });
    card(1.0, 1.2, 1.2, "cover-alone-all-day", "Cover the table alone all day?", "SOLO\n9 TO 5", {
      w: 0.56, ry: -0.3, bg: "#2a1416", accent: "#f0645b", css: "#f0645b",
    });

    // ------------------------------------------------------------ closing boards
    const log = board(0.56, 0.4, 2.3, 1.95, 1.6, (cx, w, h) => lines(cx, w, h, "DRIVE LOG", [
      "Batches · counts · delivery time", "What happened — no voter details",
    ]), { ry: -0.6 });
    reg(hits, log.userData.face, "drive-log-board");
    const checkin = board(0.5, 0.36, -2.4, 1.95, 1.8, (cx, w, h) => lines(cx, w, h, "CREW CHECK-IN", [
      "How did the shouting land?", "Who takes next week's first shift?",
    ], { accent: "#7fc4d8" }), { ry: 0.6, accent: 0x7fc4d8 });
    reg(hits, checkin.userData.face, "crew-checkin-board");
    const guide = board(0.62, 0.32, 0, 2.75, -2.4, (cx, w, h) => lines(cx, w, h, "EVERY VOTER'S TABLE", [
      "Nobody here is sorted by how they vote.",
    ], { accent: "#7fc4d8" }), { accent: 0x7fc4d8 });
    const paintGuide = (text) => repaint(guide.userData.face, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      wrap(cx, text, w * 0.05, h * 0.12, w * 0.9, h * 0.13);
    });

    // ------------------------------------------------------------ the co-volunteer
    // Sited on a spot tools/briefs/clear_spot.mjs reports clear of every control.
    const coVolunteer = standingFigure(g, -0.3, -2.45, { ry: 0.2, cloth: 0x2f6a4a, trousers: 0x262d36 });
    holoTag(coVolunteer, "Co-volunteer", 0, 1.92, 0.1, { css: "#7fc4d8", w: 0.28 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(0, 1.1, -1.4),

      onStepComplete(step) {
        if (step.id === "clear-the-flyers") {
          flyerGrp.position.set(-1.05, 0.3, -0.85);
          crate.material = mat(0x59c97b, { rough: 0.7, emissive: 0x59c97b, ei: 0.3 });
        }
        if (step.id === "lock-the-box") {
          key.rotation.z = Math.PI / 2;
          boxBody.material = mat(0x2f7a5a, { rough: 0.5, metal: 0.4, emissive: 0x59c97b, ei: 0.25 });
        }
        if (step.id === "return-to-elections-office") {
          envGrp.position.set(3.3, 0.9, -2.1);
          slot.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "close-the-drive-log") {
          repaint(log.userData.face, (cx, w, h) => lines(cx, w, h, "DRIVE LOGGED", ["Every card returned", "No voter details kept"], { accent: "#59c97b", bg: "rgba(8,24,14,0.9)" }));
        }
      },

      onHazard(id, s) {
        if (id === "toss-the-card" || id === "photo-of-the-cards" || id === "argue-with-heckler") {
          applicant.root.rotation.y = Math.PI - 0.9;
          paintGuide(typeof eiLine === "function"
            ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 })
            : "Stop there. This table belongs to every voter in the line.");
        }
      },

      onInterrupt(it) {
        if (it.id === "campaign-staffer-at-table") {
          staffer.root.visible = true;
          newFlyers.visible = true;
          staffer.arms[0].shoulder.rotation.x = -0.9;
        }
        if (it.id === "survivor-address-fear") {
          survivor.root.visible = true;
          survivor.head.rotation.x = 0.3;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "campaign-staffer-at-table") {
          newFlyers.visible = false;
          staffer.arms[0].shoulder.rotation.x = 0;
          staffer.root.position.set(3.4, 0, 1.4);
        }
        if (it.id === "survivor-address-fear") {
          survivor.head.rotation.x = 0;
          survivor.root.position.set(-2.9, 0, 1.3);
        }
      },

      animate(t, dt, session) {
        applicant.head.rotation.x = Math.sin(t * 0.7) * 0.05;
        heckler.arms[1].shoulder.rotation.x = session?.step?.id === "keep-the-table-calm" ? -1.2 + Math.sin(t * 4) * 0.3 : 0;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "pace-the-explanation") {
          const ok = gg.t >= 0.35 && gg.t <= 0.58;
          repaint(paceGauge.userData.screen, signFace(`${Math.round(80 + gg.t * 140)} WPM`, {
            bg: "#0c1c16", accent: ok ? "#59c97b" : "#f0645b", fg: "#eefaf4", scale: 0.52,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "keep-the-table-calm" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.7;
          repaint(toneGauge.userData.screen, signFace(ok ? "CALM" : tr.v < 0.3 ? "SHRINKING" : "RISING", {
            bg: "#0c1c16", accent: ok ? "#59c97b" : "#f0645b", fg: "#eefaf4", scale: 0.5,
          }));
        }
      },
    };
  },
};
